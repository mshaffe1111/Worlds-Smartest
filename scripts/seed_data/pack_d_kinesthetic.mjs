// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Bespoke Kinesthetic Contraption Pack D (`scripts/seed_data/pack_d_kinesthetic.mjs`)
// 135 Handcrafted Clues across all 20 Categories:
//   - 45 TOY_04_BALANCE_SCALE (C(5,2)=10 unique two-mass brass beam puzzles)
//   - 45 TOY_09_SWITCHBOARD_PATCHBAY (3->4 crossed braided-cord switchboards)
//   - 45 TOY_12_CONSPIRACY_LASSO (3x3 crimson-twine triad corkboards)
// Strictly 0 "..." ellipsis, choices <= 34 chars, maxLen/minLen <= 2.4.
// ============================================================================

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

function computeBijection(answerIdx, choices, seedInt) {
  const others = [0, 1, 2, 3].filter((i) => i !== answerIdx);
  const ansLen = choices[answerIdx].length;
  const ranked = [...others].sort(
    (a, b) => Math.abs(choices[a].length - ansLen) - Math.abs(choices[b].length - ansLen),
  );
  const rot = seedInt % 2;
  return {
    answerIdx,
    poisonedFixIdx: ranked[0],
    waiverPruneIdx: ranked[rot === 0 ? 1 : 2],
    anchorIdx: ranked[rot === 0 ? 2 : 1],
  };
}

// ============================================================================
// 1. 45 TOY_04_BALANCE_SCALE CLUES (Unique Pairwise Sum across C(5,2)=10)
// Tuple: [category, diff, key, unit, targetSum, [trueA, trueB, decC, decD, decE], stem, ahaFactoid]
// ============================================================================

const PAIR_PLACEMENTS = [
  [1, 3],
  [0, 4],
  [2, 4],
  [0, 2],
  [1, 4],
  [0, 3],
  [2, 3],
  [0, 1],
  [1, 2],
  [3, 4],
];

const BALANCE_ROWS = [
  // CHEMISTRY (3)
  [
    'CHEMISTRY',
    1,
    'packd_bal_chem_silicon_14',
    'protons',
    14,
    [['Carbon (C)', 6], ['Oxygen (O)', 8], ['Helium (He)', 2], ['Nitrogen (N)', 7], ['Neon (Ne)', 10]],
    'Match Silicon’s atomic number (14) on the brass beam by pairing two abundant life-giving elements.',
    'Carbon (6) rules organic life while silicon (14) sits right beneath it in Group 14 powering microchips!',
  ],
  [
    'CHEMISTRY',
    2,
    'packd_bal_chem_co2_mass_44',
    'g/mol',
    44,
    [['Carbon-12', 12], ['Two Oxygens', 32], ['One Oxygen', 16], ['Argon-40', 40], ['Hydrogen-1', 1]],
    'Balance 44 g/mol—the integer molar mass of dry ice (CO2)—from its constituent atomic masses.',
    'At 44 g/mol, carbon dioxide is 1.5 times denser than room air, letting dry-ice fog hug theater stages.',
  ],
  [
    'CHEMISTRY',
    3,
    'packd_bal_chem_solder_132',
    'protons',
    132,
    [['Tin (Sn)', 50], ['Lead (Pb)', 82], ['Copper (Cu)', 29], ['Silver (Ag)', 47], ['Gold (Au)', 79]],
    'Sum 132 total protons by pairing the two classic post-transition metals alloyed in traditional electronics solder.',
    'Tin (50) and lead (82) melt lower together (183°C eutectic) than either pure metal melts on its own!',
  ],

  // MEDICINE (2)
  [
    'MEDICINE',
    2,
    'packd_bal_med_wrist_ankle_15',
    'bones',
    15,
    [['Wrist carpals', 8], ['Ankle tarsals', 7], ['Ear ossicles', 3], ['Lumbar spine', 5], ['Thumb bones', 2]],
    'Balance 15 gliding short bones by combining one human wrist with one human ankle.',
    'Eight pebble-like carpals give your wrist nimble rotation while seven chunky tarsals bear your full stride.',
  ],
  [
    'MEDICINE',
    1,
    'packd_bal_med_heart_lungs_9',
    'units',
    9,
    [['Heart chambers', 4], ['Lung lobes', 5], ['Human spleen', 1], ['Neck bones', 7], ['Adult teeth', 32]],
    'Hit 9 inside the human chest by pairing the chambers of your heart with the lobes across both lungs.',
    'Your left lung has only two lobes instead of three—carving out a snug cardiac notch for your heart!',
  ],

  // PHYSICS (2)
  [
    'PHYSICS',
    2,
    'packd_bal_phys_kelvin_boil_373',
    'K',
    373,
    [['Ice point K', 273], ['Boil span K', 100], ['Room C deg', 20], ['Body C deg', 37], ['Triple mK', 10]],
    'Balance 373 Kelvin—sea-level boiling water rounded to the nearest integer—on Lord Kelvin’s absolute scale.',
    'Kelvin kept Celsius degree spacing intact so water freezes near 273 K and boils exactly 100 kelvins higher.',
  ],
  [
    'PHYSICS',
    3,
    'packd_bal_phys_grid_hz_110',
    'Hz',
    110,
    [['US AC grid', 60], ['Euro AC grid', 50], ['Swiss rail', 16], ['Avionics AC', 400], ['Concert A', 440]],
    'Combine North America’s wall-socket frequency with Europe’s utility grid frequency to balance 110 Hz.',
    'Westinghouse settled on 60 Hz for arc-lamp steadiness while German AEG standardized metric-friendly 50 Hz.',
  ],

  // GADGETS (2)
  [
    'GADGETS',
    3,
    'packd_bal_gad_usb_atari_13',
    'pins',
    13,
    [['USB-A plug', 4], ['Atari DE-9', 9], ['VGA video', 15], ['USB-C plug', 24], ['MIDI DIN-5', 5]],
    'Sum 13 connector pins by pairing a classic rectangular USB-A plug with an Atari 2600 joystick port.',
    'Original USB 1.1 worked miracles with just four flat contacts: +5V power, ground, and one twisted data pair!',
  ],
  [
    'GADGETS',
    2,
    'packd_bal_gad_nes_n64_72',
    'bits',
    72,
    [['NES console', 8], ['Nintendo 64', 64], ['Super NES', 16], ['GameCube', 128], ['Intel 4004', 4]],
    'Hit 72 processor bits by pairing Nintendo’s 1985 cartridge flagship with its 1996 3D polygon successor.',
    'Nintendo skipped 32-bit consoles entirely on TV, leaping from the 16-bit SNES straight to the 64-bit N64.',
  ],

  // ENGINES (2)
  [
    'ENGINES',
    2,
    'packd_bal_eng_apollo_mercury_13',
    'count',
    13,
    [['Moon landings', 6], ['Mercury Seven', 7], ['NASA Shuttles', 5], ['Skylab crews', 3], ['Voyager twin', 2]],
    'Balance 13 in NASA lore by combining the successful crewed Apollo Moon landings with the original Mercury astronauts.',
    'Mercury Seven pioneer Alan Shepard bridged both counts—commanding Apollo 14 to the Fra Mauro highlands at age 47!',
  ],
  [
    'ENGINES',
    3,
    'packd_bal_eng_v12_flat6_18',
    'cylinders',
    18,
    [['Ferrari V12', 12], ['Porsche 911', 6], ['Inline-Three', 3], ['Mustang V8', 8], ['Bugatti W16', 16]],
    'Balance 18 cylinders by pairing Maranello’s signature V12 layout with Stuttgart’s classic rear-mounted 911 boxer.',
    'Both an inline-six/V12 and a horizontally opposed flat-six balance primary reciprocating forces naturally.',
  ],

  // LITERATURE (3)
  [
    'LITERATURE',
    2,
    'packd_bal_lit_bard_beethoven_46',
    'works',
    46,
    [['Bard’s plays', 37], ['Beethoven sym', 9], ['Bard sonnets', 154], ['Homer epics', 2], ['Austen books', 6]],
    'Combine William Shakespeare’s traditional play canon with Ludwig van Beethoven’s completed symphonies to hit 46.',
    'Beethoven worshipped Shakespeare—sketching Tempest and Romeo motifs right into his piano sonatas and quartets!',
  ],
  [
    'LITERATURE',
    4,
    'packd_bal_lit_dante_67',
    'cantos',
    67,
    [['Dante Inferno', 34], ['Purgatorio', 33], ['Iliad books', 24], ['Aeneid books', 12], ['Four Quartets', 4]],
    'Weigh the first two realms of Dante’s Divine Comedy—Inferno plus Purgatorio—to reach 67 cantos.',
    'Inferno adds one opening prologue canto to 33 so Purgatorio (33) and Paradiso (33) lock his sacred total at 100!',
  ],
  [
    'LITERATURE',
    3,
    'packd_bal_lit_holmes_canon_60',
    'cases',
    60,
    [['Holmes novels', 4], ['Short stories', 56], ['Potter books', 7], ['LOTR volumes', 3], ['Bond novels', 12]],
    'Balance the 60 original Sherlock Holmes cases penned by Arthur Conan Doyle from novels and short adventures.',
    'Fans wore black mourning armbands in London when Doyle tossed Holmes off Reichenbach Falls—forcing his return!',
  ],

  // LEXICON (2)
  [
    'LEXICON',
    2,
    'packd_bal_lex_alphabets_50',
    'letters',
    50,
    [['English A-Z', 26], ['Greek Alpha-Ω', 24], ['Hebrew script', 22], ['Hawaiian set', 13], ['Braille cell', 6]],
    'Pair the modern English alphabet with the classical Greek alphabet (Alpha through Omega) to balance 50 letters.',
    'Even the word "alphabet" simply glues together the first two Greek letters: Alpha and Beta!',
  ],
  [
    'LEXICON',
    4,
    'packd_bal_lex_sonnet_villanelle_33',
    'lines',
    33,
    [['Sonnet form', 14], ['Villanelle', 19], ['Limerick', 5], ['Haiku tercet', 3], ['Ottava rima', 8]],
    'Combine the strict line counts of a Shakespearean sonnet and a traditional villanelle ("Do not go gentle") to hit 33.',
    'Dylan Thomas’s 19-line villanelle braids just two repeating rhymes and two refrains across five tercets and a quatrain.',
  ],

  // FINE ARTS (2)
  [
    'FINE ARTS',
    4,
    'packd_bal_art_hokusai_fuji_46',
    'prints',
    46,
    [['Front 36 set', 36], ['Back-Fuji add', 10], ['Monet Stacks', 25], ['Sistine Sybils', 5], ['Goya Black', 14]],
    'Hokusai’s Thirty-Six Views of Mount Fuji was such a smash hit that publishers added back-side views to total 46 prints!',
    'The first 36 prints used prized imported Prussian blue ink; the 10 bonus "ura-Fuji" views showed Fuji from behind.',
  ],
  [
    'FINE ARTS',
    2,
    'packd_bal_art_supper_nighthawks_17',
    'figures',
    17,
    [['Last Supper', 13], ['Nighthawks', 4], ['Gothic pair', 2], ['Three Graces', 3], ['Calais group', 6]],
    'Count 17 painted people by pairing Leonardo’s Last Supper table with Edward Hopper’s late-night Nighthawks diner.',
    'Look closely at Hopper’s 1942 corner diner: four silent souls sit inside, yet there is no visible door to the street!',
  ],

  // SCREEN (2)
  [
    'SCREEN',
    2,
    'packd_bal_scr_jurors_samurai_19',
    'leads',
    19,
    [['Angry Jurors', 12], ['Ronin Samurai', 7], ['Ocean’s crew', 11], ['Ghostbusters', 4], ['Blues Bros', 2]],
    'Pair Sidney Lumet’s deadlocked Manhattan jury room with Akira Kurosawa’s village-defending ronin to balance 19.',
    'Lumet gradually lengthened camera lenses during 12 Angry Men so the sweaty jury room walls felt like they closed in!',
  ],
  [
    'SCREEN',
    3,
    'packd_bal_scr_egot_bigfive_9',
    'awards',
    9,
    [['EGOT quartet', 4], ['Oscar Big 5', 5], ['Cannes Palme', 1], ['Golden Bear', 2], ['Ben-Hur haul', 11]],
    'Combine the four distinct trophies of an EGOT sweep with the Academy’s "Big Five" top categories to balance 9.',
    'Only three films in nearly a century have swept Picture, Director, Actor, Actress, and Screenplay at the Oscars!',
  ],

  // JUKEBOX (2)
  [
    'JUKEBOX',
    1,
    'packd_bal_juk_violin_guitar_10',
    'strings',
    10,
    [['Violin GDAE', 4], ['Guitar EADGBE', 6], ['Mandolin', 8], ['5-Str Banjo', 5], ['12-Str Folk', 12]],
    'Balance 10 taut strings by resting a classical orchestral violin beside a standard acoustic guitar.',
    'Violin strings tune in bright perfect fifths (G-D-A-E), while guitar strings tune mostly in comfortable fourths.',
  ],
  [
    'JUKEBOX',
    4,
    'packd_bal_juk_bach_chopin_72',
    'pieces',
    72,
    [['Bach WTC I+II', 48], ['Chopin Op. 28', 24], ['Brandenburgs', 6], ['Goldberg set', 32], ['Planets suite', 7]],
    'Pair both books of Bach’s Well-Tempered Clavier with Chopin’s Op. 28 Preludes across all 24 keys to reach 72.',
    'Chopin packed Bach’s Well-Tempered Clavier to Majorca in 1838 as his lone musical companion while writing Op. 28!',
  ],

  // FINANCE (2)
  [
    'FINANCE',
    2,
    'packd_bal_fin_dow_fed_42',
    'entities',
    42,
    [['Dow 30 stocks', 30], ['Fed districts', 12], ['Big Four CPA', 4], ['G7 nations', 7], ['S&P index', 500]],
    'Combine the blue-chip roster of the Dow Jones Industrial Average with America’s regional Federal Reserve Banks to hit 42.',
    'Look at any $1 Federal Reserve Note: a letter A through L (1 to 12) stamps which regional Reserve Bank issued it!',
  ],
  [
    'FINANCE',
    1,
    'packd_bal_fin_hamilton_franklin_110',
    '$',
    110,
    [['Hamilton bill', 10], ['Franklin bill', 100], ['Washington', 1], ['Lincoln bill', 5], ['Jackson bill', 20]],
    'Sum $110 in US paper currency by pairing the only two non-Presidents featured on circulating bills!',
    'Treasury founder Alexander Hamilton ($10) and diplomat-inventor Ben Franklin ($100) never held the presidency.',
  ],

  // PRICING (2)
  [
    'PRICING',
    2,
    'packd_bal_pri_gross_bakers_157',
    'loaves',
    157,
    [['One Gross', 144], ['Baker’s dozen', 13], ['Plain dozen', 12], ['One Score', 20], ['Paper ream', 500]],
    'Weigh 157 wholesale items by combining one traditional twelve-dozen Gross with one medieval Baker’s Dozen.',
    'Under Henry III’s 1266 bread law, English bakers tossed in a 13th "vantage loaf" to dodge fines for underweight dough!',
  ],
  [
    'PRICING',
    1,
    'packd_bal_pri_monopoly_go_boardwalk_600',
    '$',
    600,
    [['Pass GO cash', 200], ['Buy Boardwalk', 400], ['Baltic Ave', 60], ['Park Place', 350], ['Electric Co', 150]],
    'Hit $600 in classic Atlantic City Monopoly cash by pairing one salary for passing GO with Boardwalk’s deed price.',
    'Charles Darrow priced Boardwalk at $400 during the Great Depression—exactly two full laps of $200 GO salaries!',
  ],

  // ODDS (3)
  [
    'ODDS',
    2,
    'packd_bal_odds_chess_backgammon_88',
    'spaces',
    88,
    [['Chess squares', 64], ['Backgammon', 24], ['Scrabble grid', 225], ['Sudoku cells', 81], ['Tic-tac-toe', 9]],
    'Flip a classic two-sided wooden parlor board: chess squares on top plus backgammon points inside sum to 88!',
    'Backgammon’s 24 alternating spears trace back five millennia to Mesopotamia’s Royal Game of Ur and Roman Tabula.',
  ],
  [
    'ODDS',
    3,
    'packd_bal_odds_french_tarot_130',
    'cards',
    130,
    [['French deck', 52], ['Tarot deck', 78], ['Uno card pack', 108], ['Pinochle deck', 48], ['Euchre deck', 24]],
    'Stack a standard joker-free 52-card playing deck beside a full 78-card Tarot deck to balance 130 cards.',
    'Renaissance northern Italians invented 78-card Tarocchi for trick-taking card games three centuries before fortune-telling!',
  ],
  [
    'ODDS',
    4,
    'packd_bal_odds_roulette_die_58',
    'count',
    58,
    [['Euro roulette', 37], ['One d6 pips', 21], ['US roulette', 38], ['Dodecahedron', 12], ['Cube faces', 6]],
    'Pair the 37 pockets of a single-zero Monte Carlo roulette wheel with the total pips (1 to 6) on one standard die to hit 58.',
    'Opposite faces on every casino die always sum to 7 (1-6, 2-5, 3-4), so three pairs give 21 total pips!',
  ],

  // ATLAS (2)
  [
    'ATLAS',
    1,
    'packd_bal_atl_lakes_continents_12',
    'regions',
    12,
    [['Great Lakes', 5], ['Continents', 7], ['Hemispheres', 4], ['US States', 50], ['13 Colonies', 13]],
    'Balance 12 major map landmarks by pairing North America’s HOMES Great Lakes with Earth’s seven continents.',
    'Lake Superior alone holds more fresh water than Huron, Ontario, Michigan, and Erie combined!',
  ],
  [
    'ATLAS',
    2,
    'packd_bal_atl_us_canada_prov_60',
    'polities',
    60,
    [['US States', 50], ['CA Provinces', 10], ['CA North Terr', 3], ['AU States', 6], ['UK Nations', 4]],
    'Reach 60 North American jurisdictions by combining all US states with Canada’s provinces (excluding territories).',
    'Newfoundland and Labrador became Canada’s tenth province in 1949; Yukon, NWT, and Nunavut are federal territories.',
  ],

  // SPORTS (3)
  [
    'SPORTS',
    1,
    'packd_bal_spo_golf_bowling_28',
    'targets',
    28,
    [['Golf 18 holes', 18], ['Ten-pin rack', 10], ['MLB innings', 9], ['Olympic rings', 5], ['Object balls', 15]],
    'Combine a full championship round of golf holes with a fresh triangle of ten-pin bowling pins to hit 28.',
    'St Andrews shrank from 22 holes to 18 in 1764, cementing golf’s global 18-hole round!',
  ],
  [
    'SPORTS',
    4,
    'packd_bal_spo_bowling_snooker_447',
    'points',
    447,
    [['Perfect bowl', 300], ['Max snooker', 147], ['Nine-dart leg', 180], ['Wilt’s game', 100], ['Par-72 card', 72]],
    'Sum 447 perfection points by pairing a 12-strike bowling game with a classic maximum break in snooker!',
    'Ronnie O’Sullivan cleared all 15 reds, 15 blacks, and 6 colors for a 147 maximum in a brisk 5 minutes 8 seconds!',
  ],
  [
    'SPORTS',
    1,
    'packd_bal_spo_soccer_hoops_16',
    'players',
    16,
    [['Soccer side', 11], ['Hoops lineup', 5], ['Baseball nine', 9], ['Hockey side', 6], ['Rugby union', 15]],
    'Count 16 starters for one club by combining an association football XI with an on-court basketball five.',
    'James Naismith’s first 1891 Springfield peach-basket game actually threw nine players per side onto the gym floor!',
  ],

  // DYNASTIES (2)
  [
    'DYNASTIES',
    2,
    'packd_bal_dyn_henry_rome_13',
    'count',
    13,
    [['Henry’s wives', 6], ['Hills of Rome', 7], ['Good Emperors', 5], ['Triumvirate', 3], ['Twelve Tables', 12]],
    'Pair the six queens of Tudor King Henry VIII with the classic hills of ancient Rome to balance 13.',
    'Schoolkids remember Henry’s six marriages by rhythm: divorced, beheaded, died; divorced, beheaded, survived!',
  ],
  [
    'DYNASTIES',
    4,
    'packd_bal_dyn_caesars_tetrarchs_16',
    'rulers',
    16,
    [['12 Caesars', 12], ['Diocletian 4', 4], ['First Triumv', 3], ['Good Emperors', 5], ['Roman Kings', 7]],
    'Combine Suetonius’s Twelve Caesars biographies with Diocletian’s four-emperor Tetrarchy to balance 16.',
    'Diocletian split Roman rule among two senior Augusti and two junior Caesars in 293 CE to stop frontier mutinies.',
  ],

  // HEADLINES (3)
  [
    'HEADLINES',
    1,
    'packd_bal_hdl_senate_scotus_11',
    'seats',
    11,
    [['Senators/st', 2], ['SCOTUS bench', 9], ['US House', 435], ['Full Senate', 100], ['UN Perm Five', 5]],
    'Balance 11 constitutional seats by pairing one state’s US Senate delegation with the full US Supreme Court.',
    'Congress fixed the Supreme Court at nine seats in 1869—matching the nine federal judicial circuits of that era!',
  ],
  [
    'HEADLINES',
    2,
    'packd_bal_hdl_rights_amendments_37',
    'clauses',
    37,
    [['Bill Rights', 10], ['All US Amends', 27], ['US Articles', 7], ['95 Theses', 95], ['14 Points', 14]],
    'Pair the 1791 Bill of Rights count with the total ratified Amendments in the US Constitution today to hit 37.',
    'James Madison’s 27th Amendment on congressional pay sat unratified from 1789 until a college student revived it in 1992!',
  ],
  [
    'HEADLINES',
    3,
    'packd_bal_hdl_chile_miners_102',
    'sum',
    102,
    [['33 Miners', 33], ['69 Days deep', 69], ['Apollo 11', 11], ['24-Hr cycle', 24], ['UN Vetoes', 5]],
    'Recall Chile’s 2010 San José miracle: pair the count of trapped miners with their days underground to hit 102.',
    'When a drill broke through after 17 days of silence, the crew taped up a red-ink note: "Estamos bien en el refugio los 33!"',
  ],

  // FOLKLORE (2)
  [
    'FOLKLORE',
    3,
    'packd_bal_flk_heracles_yggdrasil_21',
    'realms',
    21,
    [['Heracles 12', 12], ['Norse Worlds', 9], ['Gorgon trio', 3], ['Seven Seas', 7], ['4 Horsemen', 4]],
    'Unite Greek and Norse myth on the beam: pair the Labors of Heracles with Yggdrasil’s Nine Worlds to hit 21.',
    'King Eurystheus originally set Heracles ten labors, then tacked on two extras after discounting help and payment!',
  ],
  [
    'FOLKLORE',
    2,
    'packd_bal_flk_alibaba_fates_43',
    'figures',
    43,
    [['Forty Thieves', 40], ['Greek Fates', 3], ['Grimm Dwarfs', 7], ['Nine Muses', 9], ['4 Horsemen', 4]],
    'Balance 43 mythic figures by pairing Ali Baba’s cave-dwelling bandits with the thread-spinning Greek Fates.',
    'Antoine Galland learned "Ali Baba and the Forty Thieves" in 1709 Paris from Syrian storyteller Hanna Diyab!',
  ],

  // FALLACIES (2)
  [
    'FALLACIES',
    3,
    'packd_bal_fal_kahneman_miller_9',
    'models',
    9,
    [['Kahneman Sys', 2], ['Miller Seven', 7], ['Bacon Idols', 4], ['Angry Jurors', 12], ['Monty Doors', 3]],
    'Combine Daniel Kahneman’s Fast-and-Slow thinking systems with George Miller’s famous working-memory chunk number to hit 9.',
    'Miller’s 1956 "Magical Number Seven, Plus or Minus Two" launched modern cognitive psychology’s study of short-term bottlenecks.',
  ],
  [
    'FALLACIES',
    4,
    'packd_bal_fal_birthday_paradox_388',
    'count',
    388,
    [['50% Birthday', 23], ['Common year', 365], ['Half-year trap', 183], ['50-50 flip', 50], ['Zodiac wheel', 12]],
    'Pair the shockingly small room size needed for >50% shared-birthday odds with the days in a common year to hit 388.',
    'Human intuition guesses 183 people—missing that 23 people already create 253 distinct pairwise birthday comparisons!',
  ],

  // CUISINE (2)
  [
    'CUISINE',
    2,
    'packd_bal_cui_heinz_kfc_68',
    'flavors',
    68,
    [['Heinz number', 57], ['KFC herbs mix', 11], ['5-Spice jar', 5], ['Baskin scoops', 31], ['Dr Pepper', 23]],
    'Pair two iconic American secret-recipe numbers—Heinz’s famous bottle badge plus KFC’s herbs and spices—to hit 68!',
    'Henry Heinz already sold over 60 products in 1896—he simply liked how lucky "57 Varieties" looked on streetcar ads!',
  ],
  [
    'CUISINE',
    5,
    'packd_bal_cui_champagne_bottles_22',
    'bottles',
    22,
    [['Nebuchadnezzar', 20], ['Magnum size', 2], ['Jeroboam', 4], ['Methuselah', 8], ['Salmanazar', 12]],
    'Sommelier math: in 750-mL Champagne equivalents, pair a towering Nebuchadnezzar with a party Magnum to balance 22 bottles!',
    'A 15-liter Nebuchadnezzar weighs roughly 84 pounds full and pours over a hundred celebratory flutes!',
  ],
];

// ============================================================================
// 2. 45 TOY_09_SWITCHBOARD_PATCHBAY CLUES (3 Left Callers -> 4 Right Jacks)
// Tuple: [category, diff, key, [c0, c1, c2], [match0, match1, match2, decoy3], stem, ahaFactoid]
// Lead caller c0 -> match0 is also answerIdx for TOY_01_KNIFE_SWITCH & Canary!
// ============================================================================

const PATCH_PERMS = [
  [2, 0, 3, 1],
  [1, 3, 0, 2],
  [3, 2, 1, 0],
  [0, 3, 1, 2],
  [2, 3, 0, 1],
  [1, 0, 3, 2],
];

const PATCHBAY_ROWS = [
  // MEDICINE (3)
  [
    'MEDICINE',
    2,
    'packd_pb_med_imaging',
    ['Wilhelm Röntgen', 'Paul Lauterbur', 'Ian Donald'],
    ['Skeletal X-rays', 'MRI body scans', 'Fetal ultrasound', 'Laser eye surgery'],
    'Patch three diagnostic pioneers on the switchboard—led by Wilhelm Röntgen’s accidental 1895 cathode-tube discovery:',
    'Seeing her wedding ring and finger bones on Röntgen’s plate, Anna Bertha Röntgen gasped, "I have seen my death!"',
  ],
  [
    'MEDICINE',
    1,
    'packd_pb_med_blood_donors',
    ['Type O-Negative', 'Type AB-Positive', 'Platelet cells'],
    ['Universal RBC donor', 'Universal recipient', 'Clotting plug patch', 'Bile salt carrier'],
    'Wire the hematology switchboard—starting with why emergency trauma bays prize Type O-Negative red blood cells:',
    'Lacking A, B, and Rh surface antigens, O-negative red cells slip past almost any patient’s immune sentries.',
  ],
  [
    'MEDICINE',
    3,
    'packd_pb_med_eye_structures',
    ['Retinal rods', 'Crystalline lens', 'Iris sphincter'],
    ['Dim-light night sight', 'Variable focus bend', 'Bright pupil squeeze', 'Inner-ear balance'],
    'Connect three structures of the human eye—led by the ~120 million retinal rods packed outside your central fovea:',
    'Because rods crowd the peripheral retina, stargazers spot faint nebulae best by looking slightly to the side!',
  ],

  // CHEMISTRY (2)
  [
    'CHEMISTRY',
    3,
    'packd_pb_chem_allotropes',
    ['Buckminster C60', 'Stratospheric O3', 'White Phos P4'],
    ['Soccer-cage carbon', 'UV-absorbing ozone', 'Pyrophoric wax glow', 'Liquid metal pool'],
    'Route three dramatic elemental allotropes—anchored by C60 Buckminsterfullerene’s 60-atom geometric cage:',
    'Chemists named C60 after Buckminster Fuller because its 20 hexagons and 12 pentagons match a soccer ball and dome!',
  ],
  [
    'CHEMISTRY',
    4,
    'packd_pb_chem_named_elements',
    ['Curium (Element 96)', 'Mendelevium (101)', 'Oganesson (118)'],
    ['Radioactivity pair', 'Periodic architect', 'Living nuclear dean', 'Combustion father'],
    'Patch three heavyweight elements to who they honor—led by Element 96 (Curium), forged in a 1944 Berkeley cyclotron:',
    'Yuri Oganessian (Element 118) became only the second person in history—after Glenn Seaborg—honored while alive!',
  ],

  // PHYSICS (3)
  [
    'PHYSICS',
    2,
    'packd_pb_phys_wave_effects',
    ['Doppler effect', 'Photoelectric hit', 'Meissner state'],
    ['Siren pitch drop', 'Solar-panel current', 'Levitated magnet', 'Pollen jitter walk'],
    'Wire three classic physics effects—led by Christian Doppler’s 1842 explanation of why passing sirens drop in pitch:',
    'Dutch physicist Buys Ballot tested Doppler’s math in 1845 by putting brass trumpeters on a speeding open train car!',
  ],
  [
    'PHYSICS',
    3,
    'packd_pb_phys_space_orbits',
    ['Sun-Earth L2', 'Geostationary ring', 'Low Earth Orbit'],
    ['Webb shadow perch', 'Fixed TV dish sky', 'ISS 400-km track', 'Distant Oort shell'],
    'Patch three orbital highways—starting with the Sun-Earth L2 point 1.5 million km beyond Earth’s night side:',
    'At L2, Earth and Sun pull together so James Webb keeps its sunshield pointed permanently toward Earth, Moon, and Sun!',
  ],
  [
    'PHYSICS',
    4,
    'packd_pb_phys_big_detectors',
    ['LIGO laser arms', 'CERN 27-km LHC', 'Super-Kamiokande'],
    ['Spacetime ripples', 'Higgs collisions', 'Cherenkov neutrinos', 'Auroral solar gusts'],
    'Connect three monumental physics observatories—led by LIGO’s twin 4-kilometer L-shaped interferometers:',
    'LIGO sensed a 2015 black-hole merger that stretched its 4-km mirrors by less than one-thousandth of a proton’s width!',
  ],

  // GADGETS (2)
  [
    'GADGETS',
    3,
    'packd_pb_gad_code_creators',
    ['Dennis Ritchie', 'Guido van Rossum', 'Brendan Eich'],
    ['Bell Labs C code', 'Python language', 'Ten-day JavaScript', 'Punch-card FORTRAN'],
    'Patch three software architects to their languages—led by Dennis Ritchie’s systems language born alongside Unix:',
    'Guido van Rossum named Python not after snakes, but while reading scripts from Monty Python’s Flying Circus!',
  ],
  [
    'GADGETS',
    2,
    'packd_pb_gad_electronic_music',
    ['Leon Theremin', 'Robert Moog', 'Roland TR-808'],
    ['Touchless antennas', 'Voltage patch synth', 'Booming hip-hop kick', 'Punched piano roll'],
    'Wire three electronic music milestones—starting with Leon Theremin’s eerie 1920 capacitance instrument:',
    'Players wave one hand near a vertical antenna for pitch and the other over a loop for volume—touching nothing!',
  ],

  // ENGINES (2)
  [
    'ENGINES',
    3,
    'packd_pb_eng_waterways',
    ['Falkirk Wheel', 'Gatun Locks', 'Corinth Canal'],
    ['Rotating boat lift', 'Panama 3-step climb', 'Lockless rock trench', 'Subsea chalk tunnel'],
    'Connect three marvel waterways—led by Scotland’s Falkirk Wheel linking the Forth & Clyde and Union canals:',
    'Thanks to Archimedes’ buoyancy law, balanced caissons spin Falkirk’s giant boat wheel using just ~8 kettles of power!',
  ],
  [
    'ENGINES',
    4,
    'packd_pb_eng_alien_landers',
    ['Ingenuity craft', 'Philae lander', 'Huygens probe'],
    ['Mars rotor flights', 'Comet 67P bounce', 'Titan orange haze', 'Venus balloon drift'],
    'Patch three off-world touch-downs—led by NASA’s tissue-light Ingenuity helicopter tucked under Perseverance:',
    'Built for five test hops in Mars’s 1% air, Ingenuity logged 72 flights while carrying fabric from Wright Flyer I!',
  ],

  // LITERATURE (2)
  [
    'LITERATURE',
    1,
    'packd_pb_lit_first_sentences',
    ['Moby-Dick (1851)', 'Anna Karenina', '1984 (Orwell)'],
    ['Call me Ishmael.', 'Happy families line', 'Clocks striking 13', 'It was a dark storm'],
    'Match three iconic opening lines—led by Herman Melville’s three-word invitation into Pequod whaling lore:',
    'London skipped the epilogue in Moby-Dick’s first British printing—leaving reviewers baffled how Ishmael survived!',
  ],
  [
    'LITERATURE',
    2,
    'packd_pb_lit_pen_names',
    ['Mary Ann Evans', 'Eric Arthur Blair', 'Samuel Clemens'],
    ['George Eliot', 'George Orwell', 'Mark Twain', 'Currer Bell'],
    'Patch three famous birth names to their pen names—starting with Victorian Middlemarch novelist Mary Ann Evans:',
    'Samuel Clemens borrowed "Mark Twain!" from Mississippi leadsmen shouting two fathoms (12 feet) of safe steamboat water.',
  ],

  // LEXICON (2)
  [
    'LEXICON',
    2,
    'packd_pb_lex_eponyms',
    ['Jules Léotard', 'Adolphe Sax', 'Charles Boycott'],
    ['Acrobat bodysuit', 'Conical reed brass', 'Organized shunning', 'Buttoned wool vest'],
    'Wire three real 19th-century figures to the words they inspired—led by French flying-trapeze star Jules Léotard:',
    'Léotard called his skin-tight knitted one-piece a "maillot" so nothing baggy could snag mid-somersault!',
  ],
  [
    'LEXICON',
    1,
    'packd_pb_lex_loanwords',
    ['Karaoke (Japan)', 'Kindergarten', 'Schadenfreude'],
    ['Empty orchestra', 'Children’s garden', 'Rival-mishap glee', 'Social step slip'],
    'Connect three everyday loanwords to their literal roots—led by Japanese Kobe drummer Daisuke Inoue’s "karaoke":',
    'Inoue never patented his 1971 coin-box "empty orchestra" tape player—missing royalties while sparking a global craze!',
  ],

  // FINE ARTS (3)
  [
    'FINE ARTS',
    2,
    'packd_pb_art_museums',
    ['Museo del Prado', 'Uffizi Gallery', 'Rijksmuseum'],
    ['Madrid Velázquez', 'Florence Botticelli', 'Amsterdam Rembrandt', 'Vienna Klimt Kiss'],
    'Patch three European flagship museums to their home treasures—led by Madrid’s Prado housing Las Meninas:',
    'Giorgio Vasari built Florence’s Uffizi ("Offices") in 1560 as civic bureaucrats’ quarters for Cosimo I de’ Medici!',
  ],
  [
    'FINE ARTS',
    4,
    'packd_pb_art_sculptures',
    ['Gian Bernini', 'C. Brâncuși', 'Louise Bourgeois'],
    ['Apollo & Daphne', 'Bird in Space brass', 'Maman giant spider', 'Cloud Gate mirror'],
    'Wire three master sculptors to their works—led by 24-year-old Bernini carving marble laurel leaves on Daphne:',
    'US Customs taxed Brâncuși’s sleek Bird in Space as "kitchenware metal" in 1926 until a landmark court trial ruled it art!',
  ],
  [
    'FINE ARTS',
    3,
    'packd_pb_art_pigments',
    ['Ultramarine blue', 'Tyrian purple', 'Carmine red lake'],
    ['Afghan lapis stone', 'Murex sea snails', 'Cactus scale bugs', 'Charred ivory soot'],
    'Connect three historic luxury pigments to their raw sources—starting with "beyond-the-sea" Ultramarine:',
    'Ounce for ounce pricier than gold, lapis lazuli ultramarine was saved by Renaissance patrons strictly for Mary’s cloak!',
  ],

  // SCREEN (2)
  [
    'SCREEN',
    3,
    'packd_pb_scr_score_duos',
    ['Bernard Herrmann', 'Nino Rota', 'Joe Hisaishi'],
    ['Alfred Hitchcock', 'Federico Fellini', 'Hayao Miyazaki', 'Sergio Leone'],
    'Patch three legendary composer-director partnerships—led by Bernard Herrmann’s shrieking strings on Psycho:',
    'Hitchcock originally asked for total silence in the shower scene until Herrmann played his 48-string violin stabs!',
  ],
  [
    'SCREEN',
    2,
    'packd_pb_scr_cinema_hotels',
    ['Overlook Hotel', 'Grand Budapest', 'Bates Motel'],
    ['The Shining snows', 'Zubrowka alpine spa', 'Psycho back-road', 'Casablanca gin bar'],
    'Route three unforgettable cinema lodgings—starting with the snowbound Colorado resort in Kubrick’s The Shining:',
    'Stephen King dreamed up The Overlook after spending one eerie off-season night as the lone guest at Estes Park’s Stanley Hotel!',
  ],

  // JUKEBOX (2)
  [
    'JUKEBOX',
    3,
    'packd_pb_juk_jazz_icons',
    ['Dizzy Gillespie', 'Thelonious Monk', 'John Coltrane'],
    ['45-deg bent trumpet', 'Angular stride keys', 'Sheets-of-sound sax', 'Four-mallet vibes'],
    'Wire three bebop & modal jazz titans to their voices—led by Dizzy Gillespie’s skyward-tilted trumpet bell:',
    'Dancers accidentally sat on Dizzy’s trumpet at a 1953 birthday party—and he loved the upward acoustic tone so much he kept it!',
  ],
  [
    'JUKEBOX',
    2,
    'packd_pb_juk_operas',
    ['Carmen (1875)', 'Turandot (1926)', 'Magic Flute (1791)'],
    ['Georges Bizet', 'Giacomo Puccini', 'Wolfgang Mozart', 'Richard Wagner'],
    'Patch three immortal operas to their composers—starting with Seville’s fiery Habanera in 1875’s Carmen:',
    'At Turandot’s 1926 premiere, conductor Arturo Toscanini laid down his baton mid-Act III where Puccini had died!',
  ],

  // FINANCE (3)
  [
    'FINANCE',
    3,
    'packd_pb_fin_central_banks',
    ['Threadneedle St', 'Eccles Building', 'Eurotower seat'],
    ['Bank of England', 'US Federal Reserve', 'European Central', 'Bank of Japan'],
    'Connect three monetary nicknames & addresses—led by London’s "Old Lady of Threadneedle Street" founded in 1694:',
    'Playwright Richard Brinsley Sheridan coined "Old Lady of Threadneedle Street" in 1797 after Britain halted gold payouts!',
  ],
  [
    'FINANCE',
    2,
    'packd_pb_fin_market_bubbles',
    ['1637 Dutch mania', '1720 London fever', '1999 Dot-com peak'],
    ['Streaked tulip bulb', 'South Sea shares', 'Pets.com IPO sock', 'Silver Thursday'],
    'Patch three speculative bubbles to their poster symbols—starting with 1637 Haarlem tavern tulip auctions:',
    'Isaac Newton sighed after losing £20,000 in South Sea stock: "I can calculate the motion of heavenly bodies, not people’s madness!"',
  ],
  [
    'FINANCE',
    5,
    'packd_pb_fin_options_greeks',
    ['Option Delta', 'Option Theta', 'Option Vega'],
    ['Underlying move', 'Daily time decay', 'Implied vol swing', 'Bond coupon yield'],
    'Wire three Wall Street "Greeks" on an options desk—led by Delta’s sensitivity to $1 moves in the underlying stock:',
    'Fun trading-floor quirk: "Vega" isn’t even a Greek letter—quants needed a V-word for volatility!',
  ],

  // PRICING (2)
  [
    'PRICING',
    3,
    'packd_pb_pri_mega_auctions',
    ['1955 Mercedes SLR', 'Codex Leicester', 'Stan the T. rex'],
    ['$142M Uhlenhaut car', '$30.8M da Vinci ms', '$31.8M fossil bones', '$450M panel painting'],
    'Patch three blockbuster auction hammer records—led by Sotheby’s €135M ($142M) private museum coupe sale in 2022:',
    'Bill Gates bought Leonardo’s mirror-script Codex Leicester in 1994 and lent digital scans freely to museums worldwide.',
  ],
  [
    'PRICING',
    4,
    'packd_pb_pri_econ_goods',
    ['Loss leader item', 'Veblen luxury', 'Giffen staple'],
    ['Below-cost traffic', 'Snob-appeal demand', 'Poverty rise trap', 'Public lighthouse'],
    'Connect three counterintuitive retail & price behaviors—starting with Costco’s famous $4.99 rotisserie loss leader:',
    'Thorstein Veblen coined "conspicuous consumption" in 1899 for goods that become MORE desirable purely because they cost more!',
  ],

  // ODDS (2)
  [
    'ODDS',
    2,
    'packd_pb_odds_poker_hands',
    ['Dead Man’s Hand', 'Pocket Rockets', 'Boats / Full House'],
    ['Black Aces & Eights', 'Two hole Aces', 'Three-kind + Pair', 'Four suited Kings'],
    'Patch three poker table nicknames—led by the "Dead Man’s Hand" clutched by Wild Bill Hickok in 1876 Deadwood:',
    'Jack McCall shot Hickok from behind at Nuttal & Mann’s Saloon—forever teaching gamblers to sit facing the door!',
  ],
  [
    'ODDS',
    4,
    'packd_pb_odds_probability_curves',
    ['Poisson arrivals', 'Normal bell curve', 'Pareto 80/20 tail'],
    ['Rare call counts', 'Symmetric heights', 'Skewed wealth split', 'Random walk step'],
    'Wire three classic probability distributions—led by Siméon Poisson’s discrete count law for independent rare events:',
    'Ladislaus Bortkiewicz famously proved Poisson’s formula in 1898 using Prussian cavalry records of accidental horse-kicks!',
  ],

  // ATLAS (2)
  [
    'ATLAS',
    3,
    'packd_pb_atl_chokepoints',
    ['Strait of Hormuz', 'Bab-el-Mandeb', 'Bering Strait'],
    ['Persian Gulf tanker', 'Red Sea south gate', 'Diomede ice channel', 'Gibraltar Pillars'],
    'Patch three strategic maritime straits—led by the narrow Hormuz bend carrying a fifth of world seaborne oil:',
    'Bab-el-Mandeb translates from Arabic as "Gate of Grief"—linking the Red Sea to the Gulf of Aden across 18 miles!',
  ],
  [
    'ATLAS',
    2,
    'packd_pb_atl_planned_capitals',
    ['Canberra (ACT)', 'Brasília (1960)', 'Ottawa (Ontario)'],
    ['Sydney-Melb truce', 'Airplane-wing plan', 'Queen Victoria pick', 'Wellington harbor'],
    'Connect three compromise or planned capitals—led by Australia building Canberra inland between rival Sydney and Melbourne:',
    'Lúcio Costa and Oscar Niemeyer laid out Brasília from scratch in 41 months shaped like a swept-wing jetliner!',
  ],

  // SPORTS (2)
  [
    'SPORTS',
    2,
    'packd_pb_spo_iconic_trophies',
    ['Claret Jug', 'Borg-Warner', 'Larry O’Brien'],
    ['British Open golf', 'Indy 500 face cup', 'NBA Finals gold', 'NHL silver bowl'],
    'Wire three famous championship trophies—starting with golf’s silver Claret Jug first presented in 1873:',
    'Every Indy 500 winner since 1936 gets their sculpted sterling-silver 3D face mounted onto the Borg-Warner Trophy!',
  ],
  [
    'SPORTS',
    4,
    'packd_pb_spo_f1_corners',
    ['Eau Rouge / Raid', 'Fairmont Hairpin', 'Parabolica curve'],
    ['Spa uphill plunge', 'Monaco 30-mph turn', 'Monza high-speed', 'Suzuka figure-8'],
    'Patch three legendary Formula 1 corners to their circuits—led by the gut-compressing uphill sweep at Spa-Francorchamps:',
    'Monaco’s Fairmont Hairpin is so tight that F1 teams fit custom steering racks just to get cars around at ~30 mph!',
  ],

  // DYNASTIES (2)
  [
    'DYNASTIES',
    3,
    'packd_pb_dyn_peace_treaties',
    ['Westphalia 1648', 'Ghent Dec 1814', 'Brest-Litovsk'],
    ['Thirty Years’ War', 'War of 1812 peace', 'Russia exits WWI', 'Spanish Succession'],
    'Connect three watershed peace treaties—led by the 1648 Peace of Westphalia birthing modern sovereign diplomacy:',
    'Slow sailing ships meant Ghent was signed two weeks BEFORE Andrew Jackson fought the Battle of New Orleans!',
  ],
  [
    'DYNASTIES',
    4,
    'packd_pb_dyn_ancient_scripts',
    ['Sumerian clay', 'Mycenaean Linear B', 'Andean Quipu'],
    ['Reed wedge marks', 'Deciphered by Ventris', 'Knotted llama cords', 'Nordic elder runes'],
    'Patch three ancient record systems—starting with Mesopotamian scribes pressing triangular reeds into wet river clay:',
    'Architect Michael Ventris cracked Linear B in 1952 without a bilingual Rosetta Stone—proving it wrote archaic Greek!',
  ],

  // HEADLINES (2)
  [
    'HEADLINES',
    3,
    'packd_pb_hdl_whistleblowers',
    ['Daniel Ellsberg', 'W. Mark Felt', 'Sherron Watkins'],
    ['Pentagon Papers', 'Deep Throat source', 'Enron off-books', 'Tobacco 60 Minutes'],
    'Wire three historic whistleblowers to their revelations—led by RAND analyst Daniel Ellsberg’s 7,000-page Vietnam leak:',
    'FBI deputy director Mark Felt kept his Watergate parking-garage identity "Deep Throat" secret for thirty-three years!',
  ],
  [
    'HEADLINES',
    2,
    'packd_pb_hdl_space_milestones',
    ['V. Tereshkova', 'Alexei Leonov', 'Sally Ride (STS-7)'],
    ['First woman in space', 'First 1965 spacewalk', 'First US woman up', 'First Moon buggy'],
    'Patch three orbital trailblazers—led by former textile-worker skydiver Valentina Tereshkova aboard Vostok 6 in 1963:',
    'Leonov’s spacesuit puffed up like a balloon in vacuum—forcing him to bleed oxygen pressure just to squeeze back inside!',
  ],

  // FOLKLORE (2)
  [
    'FOLKLORE',
    2,
    'packd_pb_flk_tricksters',
    ['Anansi (Akan)', 'Norse Loki', 'Polynesian Maui'],
    ['Story-jar spider', 'Mistletoe schemer', 'Island-hauling hook', 'Nine-tailed fox'],
    'Connect three world trickster figures—starting with West Africa’s clever spider Anansi buying the Sky God’s stories:',
    'Maui snared the fiery Sun with braided coconut-fiber ropes in Polynesian lore to make days long enough to dry tapa cloth!',
  ],
  [
    'FOLKLORE',
    4,
    'packd_pb_flk_hero_swords',
    ['Joyeuse hilt', 'Tizona steel', 'Gram / Balmung'],
    ['Charlemagne blade', 'El Cid’s war sword', 'Sigurd dragon-slayer', 'Arthur’s lake blade'],
    'Wire three legendary medieval swords to their wielders—led by Charlemagne’s golden-hilted coronation sword Joyeuse:',
    'In the Song of Roland, Joyeuse changed color thirty times a day and outshone the noon sun across Roncesvalles!',
  ],

  // FALLACIES (2)
  [
    'FALLACIES',
    3,
    'packd_pb_fal_latin_fallacies',
    ['Post hoc trap', 'Tu quoque dodge', 'Ad populum'],
    ['Rooster made sunrise', 'Hypocrisy deflection', 'Bandwagon crowd pull', 'False binary fork'],
    'Patch three Latin logic traps to plain English—led by "post hoc ergo propter hoc" confusing sequence with cause:',
    'Just because the rooster crows before daybreak does not mean silencing the rooster will keep the world dark!',
  ],
  [
    'FALLACIES',
    2,
    'packd_pb_fal_cognitive_traps',
    ['Survivorship bias', 'Sunk-cost fallacy', 'Dunning-Kruger'],
    ['Returning bombers', 'Unrecoverable spend', 'Novice over-pride', 'First-number anchor'],
    'Connect three famous judgment traps—led by Abraham Wald’s WWII insight about bullet holes on returning bombers:',
    'Generals wanted to armor wing holes—until Wald pointed out planes hit in the bare engine diagrams never made it home!',
  ],

  // CUISINE (3)
  [
    'CUISINE',
    2,
    'packd_pb_cui_world_sauces',
    ['Pesto Genovese', 'Catalan Romesco', 'Sauce Béarnaise'],
    ['Basil & pine nuts', 'Charred pepper nut', 'Tarragon yolk butter', 'Sesame tahini lemon'],
    'Wire three classic sauces to their foundations—led by Genoa’s mortar-crushed basil, garlic, Parmigiano, and pine nuts:',
    '"Pesto" comes from Genoese pestâ ("to pound")—crushing basil with marble releases fragrant oils without blade heat!',
  ],
  [
    'CUISINE',
    1,
    'packd_pb_cui_espresso_bar',
    ['Affogato dessert', 'Spanish Cortado', 'Ristretto pull'],
    ['Gelato drowned hot', 'Equal warm milk cut', 'Short sweeter shot', 'Ice-drip Kyoto brew'],
    'Patch three espresso-bar orders—starting with Italy’s beloved affogato ("drowned") treat:',
    'Cutting espresso 1:1 with lightly steamed milk ("cortar" = to cut) mellows acidity without drowning the crema in foam.',
  ],
  [
    'CUISINE',
    4,
    'packd_pb_cui_cured_meats',
    ['Jamón Ibérico', 'Parma Prosciutto', 'Bündnerfleisch'],
    ['Bellota acorn pig', 'Parmigiano whey pig', 'Alpine air-cured beef', 'Juniper smoked pork'],
    'Connect three protected European cured meats—led by Spain’s prized black-hoofed Jamón Ibérico de Bellota:',
    'Pigs raised for Prosciutto di Parma feast on nutritious liquid whey left over from local Parmigiano-Reggiano vats!',
  ],
];

// ============================================================================
// 3. 45 TOY_12_CONSPIRACY_LASSO CLUES (3x3 Corkboard Triad + 6 Clean Decoys)
// Tuple: [category, diff, key, connectionPrompt, [t0, t1, t2], [d0..d5], stem, ahaFactoid]
// All 9 cards <= 16 chars; triad joined "t0, t1, t2" <= 34 chars!
// ============================================================================

const TRIAD_LAYOUTS = [
  [0, 4, 8],
  [1, 3, 7],
  [2, 4, 6],
  [0, 5, 7],
  [1, 5, 6],
  [2, 3, 8],
  [0, 2, 7],
  [1, 4, 8],
  [0, 3, 5],
];

const LASSO_ROWS = [
  // MEDICINE (2)
  [
    'MEDICINE',
    2,
    'packd_las_med_ossicles',
    'Three middle-ear ossicle bones',
    ['Malleus', 'Incus', 'Stapes'],
    ['Cochlea', 'Patella', 'Talus', 'Hyoid', 'Vomer', 'Pinna'],
    'Lasso the three middle-ear ossicles—the tiniest bones in the human body—from this anatomical corkboard:',
    'Hammer, anvil, and stirrup amplify eardrum vibrations ~20-fold—and the stirrup (stapes) is smaller than a grain of rice!',
  ],
  [
    'MEDICINE',
    3,
    'packd_las_med_small_gut',
    'Three small-intestine segments',
    ['Duodenum', 'Jejunum', 'Ileum'],
    ['Cecum', 'Sigmoid', 'Pylorus', 'Cardia', 'Rectum', 'Fundus'],
    'Tie crimson twine around the three sequential divisions of the human small intestine:',
    '"Duodenum" means "twelve-finger breadth" because ancient anatomists measured its short C-loop as twelve fingers wide!',
  ],

  // CHEMISTRY (2)
  [
    'CHEMISTRY',
    1,
    'packd_las_chem_coinage_group11',
    'Group 11 coinage metals',
    ['Copper', 'Silver', 'Gold'],
    ['Platinum', 'Nickel', 'Zinc', 'Palladium', 'Tin', 'Bronze'],
    'Lasso the three classical coinage metals stacked directly atop one another in Group 11 of the periodic table:',
    'Copper, silver, and gold have the highest electrical and thermal conductivities of all elemental metals!',
  ],
  [
    'CHEMISTRY',
    3,
    'packd_las_chem_hydrogen_isotopes',
    'Three isotopes of Hydrogen',
    ['Protium', 'Deuterium', 'Tritium'],
    ['Positron', 'Alpha ray', 'Hydronium', 'Ozone', 'Baryon', 'Fermion'],
    'Link the only three isotopes in chemistry famous enough to carry their own everyday names—all forms of Hydrogen:',
    'Protium has zero neutrons, heavy-water Deuterium has one, and radioactive glow-watch Tritium carries two!',
  ],

  // PHYSICS (2)
  [
    'PHYSICS',
    4,
    'packd_las_phys_charged_leptons',
    'Three charged leptons',
    ['Electron', 'Muon', 'Tau'],
    ['Photon', 'Gluon', 'Pion', 'Proton', 'Charm', 'Kaon'],
    'Lasso the three negatively charged matter leptons across all three generations of the Standard Model:',
    'Muons and taus act just like overweight electrons—weighing roughly 207 times and 3,477 times an electron’s mass!',
  ],
  [
    'PHYSICS',
    1,
    'packd_las_phys_heat_modes',
    'Three heat-transfer modes',
    ['Conduction', 'Convection', 'Radiation'],
    ['Refraction', 'Diffraction', 'Fusion', 'Dispersion', 'Torque', 'Precession'],
    'Connect the three fundamental mechanisms by which thermal energy travels from hot bodies to cold ones:',
    'A silvered vacuum Thermos defeats all three at once: vacuum stops conduction and convection, while mirrors bounce radiation!',
  ],

  // GADGETS (3)
  [
    'GADGETS',
    1,
    'packd_las_gad_reboot_chord',
    'IBM PC three-finger salute',
    ['Control', 'Alt', 'Delete'],
    ['Shift', 'Escape', 'Tab', 'Caps Lock', 'Insert', 'SysRq'],
    'Lasso the three keys IBM engineer David Bradley wired in five minutes for his famous "three-finger salute":',
    'Bradley picked far-apart keys so typists couldn’t bump them accidentally—then Bill Gates made the chord famous!',
  ],
  [
    'GADGETS',
    4,
    'packd_las_gad_transistor_trio',
    '1947 Bell Labs transistor trio',
    ['Bardeen', 'Brattain', 'Shockley'],
    ['Kilby', 'Noyce', 'Shannon', 'Turing', 'Zuse', 'Babbage'],
    'Link the three Bell Labs physicists who shared the 1956 Nobel Prize for inventing the transistor:',
    'John Bardeen later won a SECOND Physics Nobel in 1972 for BCS superconductivity—the only person ever to win it twice!',
  ],
  [
    'GADGETS',
    1,
    'packd_las_gad_rgb_light',
    'Additive pixel light primaries',
    ['Red', 'Green', 'Blue'],
    ['Cyan', 'Magenta', 'Yellow', 'Key Black', 'Ochre', 'Umber'],
    'Lasso the three additive primary colors of sub-pixel light glowing inside your television and phone screen:',
    'Because human eyes carry L, M, and S cones tuned near red, green, and blue, mixing all three at 100% reads pure white!',
  ],

  // ENGINES (2)
  [
    'ENGINES',
    1,
    'packd_las_eng_apollo11',
    'Apollo 11 flight crew',
    ['Armstrong', 'Aldrin', 'Collins'],
    ['Lovell', 'Conrad', 'Shepard', 'Glenn', 'Cernan', 'Bean'],
    'Lasso the three astronauts who rode Saturn V AS-506 to the Moon aboard Apollo 11 in July 1969:',
    'While Armstrong and Aldrin walked Tranquility Base, Michael Collins orbited solo in Columbia 60 miles overhead!',
  ],
  [
    'ENGINES',
    2,
    'packd_las_eng_aircraft_axes',
    'Three aircraft rotation axes',
    ['Roll', 'Pitch', 'Yaw'],
    ['Thrust', 'Drag', 'Lift', 'Camber', 'Mach', 'Stall'],
    'Connect the three rotational axes of flight governed by an airplane’s ailerons, elevators, and rudder:',
    'Wilbur and Orville Wright cracked powered flight by realizing turns require coordinated roll ("wing-warping") AND yaw!',
  ],

  // LITERATURE (2)
  [
    'LITERATURE',
    1,
    'packd_las_lit_musketeers',
    'Dumas’s Three Musketeers',
    ['Athos', 'Porthos', 'Aramis'],
    ['Richelieu', 'Rochefort', 'Planchet', 'Treville', 'Milady', 'Buckingham'],
    'Lasso the three titled Musketeers of the Guard whom young Gascon swordsman d’Artagnan joins in 1625 Paris:',
    'Alexandre Dumas modeled all four heroes on real Bearnese guardsmen chronicled in Gatien de Courtilz’s 1700 memoirs!',
  ],
  [
    'LITERATURE',
    3,
    'packd_las_lit_king_lear',
    'King Lear’s three daughters',
    ['Goneril', 'Regan', 'Cordelia'],
    ['Ophelia', 'Desdemona', 'Miranda', 'Portia', 'Viola', 'Rosalind'],
    'Tie together aging King Lear’s three daughters—two flattering schemers and one honest youngest child:',
    'In Nahum Tate’s rewritten 1681 happy ending—performed for 150 years!—Cordelia survived and married Edgar!',
  ],

  // LEXICON (2)
  [
    'LEXICON',
    2,
    'packd_las_lex_rhetoric_modes',
    'Aristotle’s persuasive modes',
    ['Ethos', 'Pathos', 'Logos'],
    ['Bathos', 'Hubris', 'Catharsis', 'Mimesis', 'Nemesis', 'Praxis'],
    'Lasso Aristotle’s classic rhetorical triad—character credibility, emotional appeal, and reasoned proof:',
    'Alexander Pope coined "bathos" in 1727 as the comic opposite of pathos—plunging from lofty grandeur into silliness!',
  ],
  [
    'LEXICON',
    1,
    'packd_las_lex_articles',
    'All three English articles',
    ['The', 'A', 'An'],
    ['Who', 'Whom', 'Some', 'Each', 'This', 'That'],
    'Lasso the entire roster of definite and indefinite grammatical articles in standard modern English:',
    'Old English "an" ("one") shed its N before consonants—which is why "a napron" and "an ewt" became apron and newt!',
  ],

  // FINE ARTS (2)
  [
    'FINE ARTS',
    2,
    'packd_las_art_greek_columns',
    'Greek architectural orders',
    ['Doric', 'Ionic', 'Corinthian'],
    ['Mansard', 'Buttress', 'Gargoyle', 'Minaret', 'Pagoda', 'Geodesic'],
    'Lasso the three classical orders of ancient Greek column capitals—fluted plain, scroll volutes, and acanthus leaves:',
    'Vitruvius claimed sculptor Callimachus invented Corinthian capitals after seeing acanthus leaves curl around a basket!',
  ],
  [
    'FINE ARTS',
    2,
    'packd_las_art_cmyk_inks',
    'Three chromatic CMYK inks',
    ['Cyan', 'Magenta', 'Yellow'],
    ['Vermilion', 'Viridian', 'Cobalt', 'Umber', 'Sienna', 'Ochre'],
    'Connect the three subtractive color inks paired with Black ("Key") in four-color offset press printing:',
    'Printers call black "K" for the crisp Key plate that aligns detail—avoiding confusion with "B" for Blue!',
  ],

  // SCREEN (3)
  [
    'SCREEN',
    2,
    'packd_las_scr_jaws_orca',
    'Orca shark-hunting trio in Jaws',
    ['Brody', 'Hooper', 'Quint'],
    ['Vaughn', 'Deckard', 'Ripley', 'McClane', 'Callahan', 'Bickle'],
    'Lasso the three men who sail out from Amity Island aboard the fishing boat Orca in Spielberg’s Jaws:',
    'Because the mechanical shark "Bruce" sank and broke constantly, Spielberg hid the beast—multiplying the suspense!',
  ],
  [
    'SCREEN',
    2,
    'packd_las_scr_corleone_sons',
    'Vito Corleone’s biological sons',
    ['Sonny', 'Fredo', 'Michael'],
    ['Tom Hagen', 'Clemenza', 'Tessio', 'Luca Brasi', 'Barzini', 'Sollozzo'],
    'Link Don Vito Corleone’s three biological sons in Francis Ford Coppola’s The Godfather:',
    'James Caan originally screen-tested for Michael before Coppola cast Al Pacino and gave Caan hot-headed Sonny!',
  ],
  [
    'SCREEN',
    3,
    'packd_las_scr_marx_opera',
    'A Night at the Opera Marx trio',
    ['Groucho', 'Chico', 'Harpo'],
    ['Abbott', 'Costello', 'Laurel', 'Hardy', 'Keaton', 'Chaplin'],
    'Lasso the three Marx Brothers—greasepaint brow, Tyrolean hat, and honking horn—starring in A Night at the Opera:',
    'Real-life Harpo had a warm baritone speaking voice—he went mute onstage after a critic praised his pantomime, not his lines!',
  ],

  // JUKEBOX (3)
  [
    'JUKEBOX',
    3,
    'packd_las_juk_cream',
    '1966 rock power-trio Cream',
    ['Clapton', 'Bruce', 'Baker'],
    ['Beck', 'Page', 'Bonham', 'Moon', 'Entwistle', 'Winwood'],
    'Lasso the guitarist, bassist-singer, and fiery jazz drummer who formed 1966 British supergroup Cream:',
    'Cream burned bright for barely two years—playing Royal Albert Hall farewell shows right after Wheels of Fire hit #1!',
  ],
  [
    'JUKEBOX',
    3,
    'packd_las_juk_supremes',
    'Classic 1965 Supremes trio',
    ['Ross', 'Wilson', 'Ballard'],
    ['Franklin', 'Vandross', 'Gaye', 'Knight', 'Warwick', 'Turner'],
    'Connect the classic mid-1960s Motown trio of The Supremes who recorded twelve #1 pop singles in Detroit’s Studio A:',
    'Mary Wilson stayed in every single lineup of The Supremes from their teenage "Primettes" days in 1959 until 1977!',
  ],
  [
    'JUKEBOX',
    2,
    'packd_las_juk_three_tenors',
    '1990 Rome Three Tenors',
    ['Pavarotti', 'Domingo', 'Carreras'],
    ['Bocelli', 'Callas', 'Caruso', 'Chaliapin', 'Terfel', 'Fleming'],
    'Lasso the Three Tenors whose 1990 World Cup eve concert in Rome became the best-selling classical album ever:',
    'Originally organized to welcome José Carreras back from leukemia treatment, their Nessun dorma encore captivated 800 million viewers!',
  ],

  // FINANCE (2)
  [
    'FINANCE',
    3,
    'packd_las_fin_rating_big3',
    'Big Three bond rating agencies',
    ['Moody’s', 'S&P Global', 'Fitch'],
    ['Deloitte', 'KPMG', 'Vanguard', 'BlackRock', 'SWIFT', 'FDIC'],
    'Lasso Wall Street’s "Big Three" credit-rating agencies that grade corporate and sovereign bonds from AAA down:',
    'John Moody published the very first letter-graded manual of American railroad bonds in 1909!',
  ],
  [
    'FINANCE',
    1,
    'packd_las_fin_us_indices',
    'Three flagship US stock indices',
    ['Dow 30', 'S&P 500', 'Nasdaq'],
    ['FTSE 100', 'Nikkei 225', 'DAX 40', 'CAC 40', 'Hang Seng', 'Sensex'],
    'Separate Wall Street from overseas bourses—lasso the three headline American equity benchmarks quoted every afternoon:',
    'Launched in 1971 with zero physical trading floor, Nasdaq was the world’s first electronic stock market!',
  ],

  // PRICING (2)
  [
    'PRICING',
    2,
    'packd_las_pri_orange_monopoly',
    'Monopoly Orange property trio',
    ['St. James', 'Tennessee', 'New York'],
    ['Baltic Ave', 'Oriental', 'Boardwalk', 'Park Place', 'Short Line', 'Water Wks'],
    'Lasso Monopoly’s statistical sweet-spot—the three Orange deeds perched 6, 8, and 9 steps past Jail!',
    'Because players exit Jail constantly and roll 6-8-9 most often with two dice, Orange hotels recoup their cost fastest!',
  ],
  [
    'PRICING',
    4,
    'packd_las_pri_london_auctioneers',
    '18th-century London auctioneers',
    ['Sotheby’s', 'Christie’s', 'Bonhams'],
    ['eBay', 'Harrods', 'Tiffany', 'Cartier', 'Hermès', 'Woolworth'],
    'Link the three venerable fine-art auction houses all founded in Georgian London between 1744 and 1793:',
    'Bookseller Samuel Baker founded Sotheby’s in March 1744 by auctioning 457 rare volumes for £826!',
  ],

  // ODDS (2)
  [
    'ODDS',
    3,
    'packd_las_odds_craps_totals',
    'Pass Line come-out craps losses',
    ['Two', 'Three', 'Twelve'],
    ['Seven', 'Eleven', 'Four', 'Six', 'Eight', 'Ten'],
    'Shooting dice at the craps rail: lasso the three "craps" totals that lose a Pass Line bet on the come-out roll:',
    'Snake eyes (2), ace-deuce (3), and boxcars (12) offer just 4 ways out of 36—while 7 and 11 give 8 ways to win instantly!',
  ],
  [
    'ODDS',
    1,
    'packd_las_odds_central_tendency',
    'Three central-tendency averages',
    ['Mean', 'Median', 'Mode'],
    ['Variance', 'Skewness', 'Kurtosis', 'Range', 'Z-score', 'P-value'],
    'Lasso statistics’ classic trio of central tendency—leaving spread and hypothesis metrics unlooped:',
    'If a billionaire walks into a coffee shop of ten baristas, the mean income skyrockets while the median barely budges!',
  ],

  // ATLAS (3)
  [
    'ATLAS',
    2,
    'packd_las_atl_baltics',
    'Three Baltic states',
    ['Estonia', 'Latvia', 'Lithuania'],
    ['Finland', 'Poland', 'Belarus', 'Slovakia', 'Slovenia', 'Croatia'],
    'Lasso the three Baltic republics—whose two million citizens linked hands in a 675-km human chain in August 1989:',
    'Helpful map trick: Estonia, Latvia, and Lithuania sit in strict alphabetical order from north to south!',
  ],
  [
    'ATLAS',
    2,
    'packd_las_atl_benelux',
    'Three Benelux monarchies',
    ['Belgium', 'Netherlands', 'Luxembourg'],
    ['Denmark', 'Monaco', 'Andorra', 'Austria', 'Sweden', 'Norway'],
    'Connect the three neighboring Low Countries whose opening syllables spell out the 1944 "Benelux" union:',
    'Forged by governments-in-exile in 1944 London, Benelux became the blueprint for the later European Union!',
  ],
  [
    'ATLAS',
    4,
    'packd_las_atl_enclaves',
    'World’s 3 single-country enclaves',
    ['Vatican', 'San Marino', 'Lesotho'],
    ['Monaco', 'Andorra', 'Eswatini', 'Brunei', 'Malta', 'Bahrain'],
    'Geo-stumper: lasso the ONLY three sovereign nations on Earth completely surrounded on all sides by a single country:',
    'Italy surrounds both Vatican City and mountain-perched San Marino, while South Africa completely encircles high-altitude Lesotho!',
  ],

  // SPORTS (2)
  [
    'SPORTS',
    2,
    'packd_las_spo_triple_crown',
    'US horse-racing Triple Crown',
    ['Derby', 'Preakness', 'Belmont'],
    ['Travers', 'Breeders', 'Epsom Oaks', 'Ascot Gold', 'Goodwood', 'Melbourne'],
    'Lasso the three jewels of American Thoroughbred racing’s five-week Triple Crown gauntlet:',
    'Secretariat ran every quarter-mile of the 1973 Derby faster than the one before—then won Belmont by 31 lengths!',
  ],
  [
    'SPORTS',
    2,
    'packd_las_spo_fencing_blades',
    'Three Olympic fencing weapons',
    ['Foil', 'Épée', 'Sabre'],
    ['Rapier', 'Katana', 'Claymore', 'Scimitar', 'Cutlass', 'Halberd'],
    'Connect the three electrified disciplines contested on the 14-meter piste in modern Olympic fencing:',
    'Épée makes the entire body from mask to toe valid target with no right-of-way—first tip touch scores!',
  ],

  // DYNASTIES (2)
  [
    'DYNASTIES',
    3,
    'packd_las_dyn_triumvirate1',
    '60 BCE First Triumvirate',
    ['Caesar', 'Pompey', 'Crassus'],
    ['Cicero', 'Cato', 'Lepidus', 'Brutus', 'Seneca', 'Sulla'],
    'Lasso the general, conqueror, and tycoon who forged Rome’s informal First Triumvirate in 60 BCE:',
    'Once Parthian archers slew Crassus at Carrhae in 53 BCE, Caesar and Pompey collided in civil war across the Rubicon!',
  ],
  [
    'DYNASTIES',
    4,
    'packd_las_dyn_three_kingdoms',
    'China’s Three Kingdoms (220-280)',
    ['Cao Wei', 'Shu Han', 'Eastern Wu'],
    ['Qin', 'Northern Qi', 'Tang', 'Song', 'Ming', 'Yuan'],
    'Tie crimson twine around the three rival states that split Han China during the famed Three Kingdoms era:',
    'At 208 CE Red Cliffs, outnumbered Shu and Wu river fleets chained and torched Cao Cao’s northern armada!',
  ],

  // HEADLINES (2)
  [
    'HEADLINES',
    2,
    'packd_las_hdl_yalta_three',
    'February 1945 Yalta Big Three',
    ['Roosevelt', 'Churchill', 'Stalin'],
    ['Truman', 'Attlee', 'De Gaulle', 'Eisenhower', 'Chiang', 'Tito'],
    'Lasso the three Allied leaders seated side-by-side at Livadia Palace during February 1945’s Yalta Conference:',
    'Five months later at Potsdam, only Stalin remained at the table—Truman had succeeded FDR and Attlee defeated Churchill!',
  ],
  [
    'HEADLINES',
    1,
    'packd_las_hdl_columbus_fleet',
    'Columbus’s 1492 fleet trio',
    ['Niña', 'Pinta', 'Santa María'],
    ['Mayflower', 'Golden Hind', 'Endeavour', 'Beagle', 'Victoria', 'Fram'],
    'Lasso the two nimble caravels and flagship nao that sailed west from Palos de la Frontera in August 1492:',
    '"Niña" was a crew pun for owner Juan Niño’s caravel Santa Clara—and flagship Santa María ran aground on Christmas 1492!',
  ],

  // FOLKLORE (3)
  [
    'FOLKLORE',
    3,
    'packd_las_flk_greek_fates',
    'Three thread-spinning Moirai',
    ['Clotho', 'Lachesis', 'Atropos'],
    ['Tisiphone', 'Megaera', 'Alecto', 'Aglaea', 'Thalia', 'Calliope'],
    'Lasso the three Greek Moirai (Fates) who spin life’s thread, measure its span, and snip it with shears:',
    'Deadly belladonna nightshade carries the scientific genus Atropa straight from "inflexible" shear-wielding Atropos!',
  ],
  [
    'FOLKLORE',
    4,
    'packd_las_flk_loki_children',
    'Loki & Angrboda’s three brood',
    ['Fenrir', 'Jörmungandr', 'Hel'],
    ['Sleipnir', 'Huginn', 'Muninn', 'Níðhöggr', 'Garmr', 'Ratatoskr'],
    'Link the monstrous wolf, world-encircling serpent, and underworld ruler fathered by Loki with giantess Angrboda:',
    'Odin cast Jörmungandr into the ocean, where the Midgard Serpent grew until its jaws bit its own tail around Earth!',
  ],
  [
    'FOLKLORE',
    3,
    'packd_las_flk_gorgons',
    'Three Gorgon sisters',
    ['Stheno', 'Euryale', 'Medusa'],
    ['Scylla', 'Charybdis', 'Echidna', 'Lamia', 'Chimera', 'Sphinx'],
    'Lasso the three snake-haired Gorgon sisters of Greek myth—two undying immortals plus mortal Medusa:',
    'Perseus aimed his bronze shield like a rear-view mirror so he never met Medusa’s petrifying gaze head-on!',
  ],

  // FALLACIES (2)
  [
    'FALLACIES',
    4,
    'packd_las_fal_zeno_motion',
    'Zeno’s motion paradoxes here',
    ['Achilles', 'Dichotomy', 'Arrow'],
    ['Theseus ship', 'Sorites heap', 'Barber shave', 'Newcomb box', 'Black raven', 'Trolley'],
    'Separate ancient Elea from modern thought experiments: lasso the three Zeno paradoxes of motion on this board:',
    'Zeno argued a mid-flight arrow occupies a fixed spot at every single frozen instant—puzzling mathematicians until calculus!',
  ],
  [
    'FALLACIES',
    3,
    'packd_las_fal_semiotics',
    'Three branches of sign logic',
    ['Syntax', 'Semantics', 'Pragmatics'],
    ['Phonetics', 'Prosody', 'Etymology', 'Orthography', 'Calligraphy', 'Epigraphy'],
    'Lasso Charles Morris’s logical triad separating formal grammar rules, literal truth meaning, and speaker context:',
    'Asking "Can you pass the salt?" is syntactically a yes/no ability question—pragmatics tells you not to just reply "Yes!"',
  ],

  // CUISINE (2)
  [
    'CUISINE',
    2,
    'packd_las_cui_mirepoix',
    'Classic French mirepoix trio',
    ['Onion', 'Carrot', 'Celery'],
    ['Bell pepper', 'Garlic', 'Ginger', 'Lemongrass', 'Fennel', 'Horseradish'],
    'Lasso the three diced aromatics gently sweated in a 2:1:1 ratio for classic French mirepoix:',
    'Swap sweet carrot out for green bell pepper in Louisiana and French mirepoix transforms into Cajun "Holy Trinity"!',
  ],
  [
    'CUISINE',
    1,
    'packd_las_cui_neapolitan',
    'Neapolitan ice-cream stripes',
    ['Vanilla', 'Chocolate', 'Strawberry'],
    ['Pistachio', 'Spumoni', 'Butterscotch', 'Peppermint', 'Rum Raisin', 'Coffee'],
    'Lasso the three side-by-side stripes scooped from a classic brick of Neapolitan ice cream:',
    '19th-century Italian immigrants brought pistachio-cherry-chocolate spumoni before American dairies swapped in strawberry and vanilla!',
  ],
];

// ============================================================================
// BUILD & EXPORT 135 VERIFIED V7 CLUE OBJECTS (`export const CLUES = [...]`)
// ============================================================================

const builtBalanceClues = BALANCE_ROWS.map(
  ([category, difficulty, canonicalEntityKey, unit, targetSum, rawWeights5, stem, ahaFactoid], idx) => {
    const [p0, p1] = PAIR_PLACEMENTS[idx % PAIR_PLACEMENTS.length];
    const otherSlots = [0, 1, 2, 3, 4].filter((s) => s !== p0 && s !== p1);
    const weights = new Array(5);
    weights[p0] = { label: rawWeights5[0][0], value: rawWeights5[0][1] };
    weights[p1] = { label: rawWeights5[1][0], value: rawWeights5[1][1] };
    weights[otherSlots[0]] = { label: rawWeights5[2][0], value: rawWeights5[2][1] };
    weights[otherSlots[1]] = { label: rawWeights5[3][0], value: rawWeights5[3][1] };
    weights[otherSlots[2]] = { label: rawWeights5[4][0], value: rawWeights5[4][1] };

    const validPair = [Math.min(p0, p1), Math.max(p0, p1)];
    const trueChoice = `${weights[validPair[0]].label} + ${weights[validPair[1]].label}`;

    const wrongCandidates = [];
    for (let i = 0; i < 5; i++) {
      for (let j = i + 1; j < 5; j++) {
        if (i === validPair[0] && j === validPair[1]) continue;
        const cand = `${weights[i].label} + ${weights[j].label}`;
        if (cand.length <= 34) wrongCandidates.push(cand);
      }
    }
    wrongCandidates.sort(
      (a, b) => Math.abs(a.length - trueChoice.length) - Math.abs(b.length - trueChoice.length),
    );
    const distractors = wrongCandidates.slice(0, 3);
    const answerIdx = idx % 4;
    const choices = [...distractors];
    choices.splice(answerIdx, 0, trueChoice);
    const bij = computeBijection(answerIdx, choices, idx + 11);

    return {
      canonicalEntityKey,
      category,
      domain: CATEGORY_TO_DOMAIN[category],
      difficulty,
      stem,
      choices,
      ...bij,
      isKlaxonMyth: false,
      ahaFactoid,
      supportedToys: ['TOY_04_BALANCE_SCALE', 'TOY_01_KNIFE_SWITCH'],
      balance: {
        unit,
        targetSum,
        weights,
        validPair,
      },
    };
  },
);

const builtPatchbayClues = PATCHBAY_ROWS.map(
  ([category, difficulty, canonicalEntityKey, callers, orderedJacks, stem, ahaFactoid], idx) => {
    const perm = PATCH_PERMS[idx % PATCH_PERMS.length];
    const jacks = ['', '', '', ''];
    const correctMapping = [0, 0, 0];
    for (let k = 0; k < 4; k++) {
      const slot = perm[k];
      jacks[slot] = orderedJacks[k];
      if (k < 3) {
        correctMapping[k] = slot;
      }
    }
    const answerIdx = correctMapping[0];
    const choices = [...jacks];
    const bij = computeBijection(answerIdx, choices, idx + 31);

    return {
      canonicalEntityKey,
      category,
      domain: CATEGORY_TO_DOMAIN[category],
      difficulty,
      stem,
      choices,
      ...bij,
      isKlaxonMyth: false,
      ahaFactoid,
      supportedToys: ['TOY_09_SWITCHBOARD_PATCHBAY', 'TOY_01_KNIFE_SWITCH'],
      patchbay: {
        callers,
        jacks,
        correctMapping,
      },
    };
  },
);

const builtLassoClues = LASSO_ROWS.map(
  ([category, difficulty, canonicalEntityKey, connectionPrompt, triad3, decoys6, stem, ahaFactoid], idx) => {
    const triadIndices = [...TRIAD_LAYOUTS[idx % TRIAD_LAYOUTS.length]];
    const cards = new Array(9);
    for (let t = 0; t < 3; t++) {
      cards[triadIndices[t]] = triad3[t];
    }
    let dPtr = 0;
    for (let pos = 0; pos < 9; pos++) {
      if (cards[pos] === undefined) {
        cards[pos] = decoys6[dPtr++];
      }
    }

    const trueChoice = `${triad3[0]}, ${triad3[1]}, ${triad3[2]}`;
    const triadSet = new Set(triadIndices);
    const candidateWrongTriads = [];
    for (let i = 0; i < 9; i++) {
      for (let j = i + 1; j < 9; j++) {
        for (let k = j + 1; k < 9; k++) {
          if (triadSet.has(i) && triadSet.has(j) && triadSet.has(k)) continue;
          const decoyCount = (!triadSet.has(i) ? 1 : 0) + (!triadSet.has(j) ? 1 : 0) + (!triadSet.has(k) ? 1 : 0);
          if (decoyCount < 2) continue;
          const cand = `${cards[i]}, ${cards[j]}, ${cards[k]}`;
          if (cand.length <= 34) candidateWrongTriads.push(cand);
        }
      }
    }

    candidateWrongTriads.sort(
      (a, b) => Math.abs(a.length - trueChoice.length) - Math.abs(b.length - trueChoice.length),
    );
    const distractors = [
      candidateWrongTriads[0],
      candidateWrongTriads[Math.min(3, candidateWrongTriads.length - 1)],
      candidateWrongTriads[Math.min(7, candidateWrongTriads.length - 1)],
    ];
    const answerIdx = (idx + 2) % 4;
    const choices = [...distractors];
    choices.splice(answerIdx, 0, trueChoice);
    const bij = computeBijection(answerIdx, choices, idx + 53);

    return {
      canonicalEntityKey,
      category,
      domain: CATEGORY_TO_DOMAIN[category],
      difficulty,
      stem,
      choices,
      ...bij,
      isKlaxonMyth: false,
      ahaFactoid,
      supportedToys: ['TOY_12_CONSPIRACY_LASSO', 'TOY_01_KNIFE_SWITCH'],
      lasso: {
        connectionPrompt,
        cards,
        triadIndices,
      },
    };
  },
);

export const CLUES = [
  ...builtBalanceClues,
  ...builtPatchbayClues,
  ...builtLassoClues,
];
