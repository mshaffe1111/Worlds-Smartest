// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Prime-Time Gold Pack K-07 (`scripts/seed_data/packs/pack_k_07_medicine_chemistry.mjs`)
// 216 All-Era (Ancient thru 2026) Crowd-Pleasing Clues:
//   - 108 MEDICINE (CRISPR/mRNA, GLP-1, brain/sleep quirks, animal superpowers & human body)
//   - 108 CHEMISTRY (Li-ion, quantum dots, Pepper X, gems, polymers & kitchen science)
// Zero dry formulas, balanced [25%,25%,25%,25%] A/B/C/D, 20 numeric showcase dials,
// >=45% Blitz-legal stems (<=125 chars), and 0 corpus entity/answer collisions!
// ============================================================================

const BASE_TOYS = [
  'TOY_01_KNIFE_SWITCH',
  'TOY_02_CONFIDENCE_PNEUMATIC',
  'TOY_06_FUSE_WIRE_SNIPPER',
];

function g(category, difficulty, canonicalEntityKey, stem, choices, answerIdx, ahaFactoid, extra = {}) {
  const supportedToys = [...BASE_TOYS];
  if (extra.numeric) {
    supportedToys.push('TOY_03_VERNIER_DIAL');
    if (extra.numeric.target >= 0 && extra.numeric.target <= 100 && extra.numeric.max <= 120) {
      supportedToys.push('TOY_10_CLIFFHANGERS_THROTTLE');
    }
  }
  return {
    isPrimeTimeGold: true,
    category,
    difficulty,
    canonicalEntityKey,
    stem,
    choices,
    answerIdx,
    ahaFactoid,
    supportedToys,
    ...extra,
  };
}

export const CLUES = [
  // ==========================================================================
  // 1. MEDICINE (108 Clues: 49 D1, 43 D2, 16 D3 | 10 Numeric Showcase Payloads)
  // ==========================================================================

  // --- MODERN & CURRENT ERA: 2000s–2026 (44 Clues) ---
  g('MEDICINE', 3, 'mrna_kariko_pseudouridine_stealth',
    'Karikó and Weissman won the 2023 Nobel for sneaking mRNA past immune alarms by swapping uridine for what?',
    ['Pseudouridine', 'Liquid ribose', 'Deoxythymidine', 'Methylated folate'], 0,
    'Untweaked lab mRNA triggered fierce inflammation—one nucleoside swap turned mRNA vaccines into safe cellular recipe cards!'),

  g('MEDICINE', 1, 'crispr_cas9_bacterial_phage_diary',
    'Doudna and Charpentier won the 2020 Nobel for CRISPR-Cas9 gene scissors, first evolved by bacteria to do what?',
    ['Digest ocean plastics', 'Fight invading viruses', 'Glow in deep-sea mud', 'Swap antibiotic plasmids'], 1,
    'Microbes save snippets of attacking phage DNA inside CRISPR spacers like "Wanted" posters so Cas9 can snip repeat offenders!'),

  g('MEDICINE', 2, 'casgevy_first_crispr_sickle_cell_2023',
    'Approved in late 2023 as history’s first CRISPR therapy, Casgevy switches fetal hemoglobin back on to treat what?',
    ['Cystic lung fibrosis', 'Type 1 juvenile diabetes', 'Sickle-cell disease', 'Hemophilia clotting loss'], 2,
    'Editing a patient’s own bone-marrow stem cells lets round fetal hemoglobin replace stiff, crescent-shaped red blood cells!'),

  g('MEDICINE', 1, 'lenacapavir_2024_twice_yearly_hiv_capsid',
    'Named Science’s 2024 Breakthrough of the Year, twice-yearly shot lenacapavir blocks HIV by stiffening viral what?',
    ['Outer lipid coats', 'Reverse RNA strands', 'Host T-cell pores', 'Conical capsid shells'], 3,
    'Instead of blocking just one enzyme step, jamming HIV’s cone-shaped protein shell stops viral cargo from entering cell nuclei!'),

  g('MEDICINE', 1, 'zika_oxitec_self_limiting_male_mosquitoes',
    'To curb dengue fever without spraying pesticides, biotech teams release non-biting male mosquitoes bred so daughters never reach what?',
    ['Flying adulthood', 'Stagnant pond eggs', 'Wriggling larva stage', 'Nectar flower feeding'], 0,
    'Male mosquitoes lack piercing mouthparts and drink only plant nectar—passing on a gene that halts biting female offspring!'),

  g('MEDICINE', 2, 'glymphatic_brain_sleep_rinse_2012',
    'Discovered in 2012, brain cells shrink during deep sleep so fluid can rinse waste out via what night-shift plumbing?',
    ['Vagus nerve lymph duct', 'Glymphatic system', 'Carotid sinus bypass', 'Choroid capillary net'], 1,
    'Pulling an all-nighter skips this nightly cerebrospinal rinse cycle—leaving sticky beta-amyloid proteins behind by morning!'),

  g('MEDICINE', 2, 'neanderthal_dna_svante_paabo_2022',
    'Svante Pääbo’s 2022 Nobel work proved modern non-Africans still carry roughly what share of Neanderthal DNA?',
    ['0.1 percent', '12 percent', '2 percent', '25 percent trace'], 2,
    'Ice-Age interbreeding left small Neanderthal gene souvenirs that still influence modern immune responses and skin keratin!',
    { numeric: { target: 2, min: 0, max: 25, step: 1, unit: '%' } }),

  g('MEDICINE', 1, 'human_heart_beats_100000_times_daily',
    'Lub-dubbing day and night without a break, an average resting adult heart beats roughly how many thousand times per day?',
    ['15 thousand times', '40 thousand beats', '250 thousand times', '100 thousand'], 3,
    'At ~70 beats per minute across 1,440 daily minutes, one human lifetime racks up over 2.5 billion tireless heartbeats!',
    { numeric: { target: 100, min: 20, max: 120, step: 5, unit: 'k beats' } }),

  g('MEDICINE', 3, 'piezo_touch_channels_2021_nobel',
    'Named from Greek for "press," which spring-loaded cell pores won the 2021 Nobel for turning gentle hugs into nerve sparks?',
    ['PIEZO channels', 'GABA chloride gates', 'Sodium-potassium pumps', 'Voltage-gated aquaporins'], 0,
    'Ardem Patapoutian poked lab cells with a microscopic pipette until spotting PIEZO1 and PIEZO2 pop open under mechanical stretch!'),

  g('MEDICINE', 1, 'apple_watch_afib_irregular_atrial_pulse',
    'Smartwatch ECG alerts since 2018 have caught thousands of silent cases of stroke-linked "AFib"—quivering beats in the heart’s upper what?',
    ['Ventricular apex', 'Atrial chambers', 'Aortic arch valve', 'Pericardial sac'], 1,
    'Optical wrist sensors spot erratic pulse intervals first, prompting wearers to touch the crown for a 30-second single-lead ECG!'),

  g('MEDICINE', 2, 'autophagy_2016_nobel_cell_recycling',
    'From Greek for "self-eating," what cell-recycling process won Yoshinori Ohsumi the 2016 Nobel for bagging worn-out parts?',
    ['Mitotic cytokinesis', 'Programmed apoptosis', 'Autophagy', 'Osmotic pinocytosis'], 2,
    'Starving yeast cells taught Ohsumi how cells wrap broken organelles inside trash-bag vesicles and break them down into fresh fuel!'),

  g('MEDICINE', 2, 'turritopsis_immortal_jellyfish_polyp',
    'Injured or starving in warm seas, the tiny "immortal jellyfish" cheats death by rewinding its adult bell back into what?',
    ['Dormant sand egg', 'Floating spore sac', 'Hard coral skeleton', 'A juvenile polyp'], 3,
    'Turritopsis dohrnii reprograms mature bell cells back into youth—like an adult butterfly turning itself back into a caterpillar!'),

  g('MEDICINE', 1, 'naked_mole_rat_acid_pain_immune_co2',
    'Packed inside stuffy burrows thick with acidic CO2, naked mole-rats feel zero sting from lemon juice thanks to a muted what?',
    ['Acid pain nerve switch', 'Thick calloused hide', 'Alkaline tear film', 'Numb whisker root'], 0,
    'High underground carbon dioxide turns tissue moisture acidic—mutating one sodium channel shut off acid burn permanently!'),

  g('MEDICINE', 2, 'human_ribs_twenty_four_total_myth_bust',
    'Folklore fooled generations into guessing men have one fewer rib—healthy men and women alike actually share how many ribs total?',
    ['18 curved ribs', '24 ribs total', '28 chest ribs', '32 thoracic ribs'], 1,
    'Renaissance anatomist Andreas Vesalius risked scandal in 1543 by counting 12 pairs (24 ribs) in both male and female skeletons!',
    { isKlaxonMyth: true, numeric: { target: 24, min: 10, max: 40, step: 2, unit: 'ribs' } }),

  g('MEDICINE', 2, 'car_t_living_drug_engineered_t_cells',
    'Oncologists call CAR-T therapy a "living drug" because labs harvest, genetically arm, and re-infuse a patient’s own what?',
    ['Bone platelets', 'Plasma antibodies', 'Killer T-cells', 'Marrow red blood cells'], 2,
    'Adding synthetic "chimeric antigen receptors" turns a patient’s own immune T-cells into guided missiles against blood cancers!'),

  g('MEDICINE', 1, 'pulse_oximeter_fingertip_two_light_beams',
    'Clip a modern pulse oximeter onto your finger and it reads blood oxygen painlessly by shining infrared and red what?',
    ['Ultrasonic sound waves', 'Tiny magnetic pulses', 'Warm thermal rays', 'LED light beams'], 3,
    'Oxygen-rich bright red hemoglobin and oxygen-poor dark blood absorb red vs. infrared light differently with every heartbeat!'),

  g('MEDICINE', 1, 'hpv_vaccine_cervical_cancer_shield',
    'Rolled out starting in 2006, Gardasil slashed cervical cancer rates by over 85% in immunized teens by blocking what?',
    ['Human papillomavirus', 'Epstein-Barr herpes', 'Hepatitis C flavivirus', 'Streptococcal bacteria'], 0,
    'Harald zur Hausen won the 2008 Nobel after defying dogma to prove persistent HPV viral infections caused cervical tumors!'),

  g('MEDICINE', 1, 'smartphone_blue_light_melanopsin_retina',
    'Scrolling a bright phone at midnight delays sleep because blue screen light hits retinal clock sensors packed with what?',
    ['Rhodopsin night rods', 'Melanopsin pigment', 'Carotene yellow oil', 'Lutein macula crystals'], 1,
    'Even some blind patients without working rods or cones sync their body clocks to daylight via melanopsin ganglion cells!'),

  g('MEDICINE', 2, 'cleaner_wrasse_mirror_self_test_2019',
    'Joining apes and dolphins in 2019 tests, which tiny coral-reef fish scraped a colored throat mark off using a mirror?',
    ['Clown anemonefish', 'Royal blue tang', 'Cleaner wrasse', 'Spotted mandarin goby'], 2,
    'Weighing just a few grams, bluestreak cleaner wrasses swam upside down before the mirror to inspect marks on their own throats!'),

  g('MEDICINE', 3, 'victor_ambros_gary_ruvkun_2024_microrna',
    'Victor Ambros and Gary Ruvkun won the 2024 Medicine Nobel for tiny non-coding RNA snippets that dim gene activity: what?',
    ['Messenger codons', 'Ribosomal tRNAs', 'Telomere end-caps', 'MicroRNA switches'], 3,
    'Ignored at first in 1993 as an odd roundworm quirk, microRNAs turned out to fine-tune protein levels across every animal on Earth!'),

  g('MEDICINE', 1, 'lone_star_tick_red_meat_allergy',
    'A single bite from America’s Lone Star tick can suddenly make lifelong barbecue fans violently allergic to eating what?',
    ['Mammalian red meat', 'Crustacean shellfish', 'Roasted tree nuts', 'Whole-wheat sourdough'], 0,
    'Tick saliva injects alpha-gal sugar into skin, priming immune IgE antibodies to attack beef, pork, and lamb hours after dinner!'),

  g('MEDICINE', 1, 'narcan_naloxone_nasal_spray_opioid_rescue',
    'Carried in schools and libraries across the 2020s, Narcan nasal spray reverses overdoses fast by bumping opioids off what?',
    ['Liver bile enzymes', 'Brain mu-receptors', 'Lung oxygen sacs', 'Kidney salt pumps'], 1,
    'Naloxone binds opioid receptors tighter than fentanyl or heroin without activating them—restoring normal breathing in two minutes!'),

  g('MEDICINE', 1, 'octopus_neurons_two_thirds_in_arms',
    'An octopus packs roughly 500 million neurons, yet two-thirds of that brainpower isn’t in its head—living instead where?',
    ['Around its gill hearts', 'Behind its eye lenses', 'Inside its eight arms', 'Along its ink funnel'], 2,
    'Each arm runs its own local mini-brain so suckers can taste, explore crevices, and untangle knots without asking headquarters!'),

  g('MEDICINE', 3, 'human_taste_buds_ten_day_turnover_burn',
    'Burn your tongue on hot pizza cheese and relax: human taste-receptor cells regrow from stem cells roughly every how many days?',
    ['2 quick days', '30 full days', '90 slow days', '10 days'], 3,
    'Exposed to hot coffee, spices, and chewing friction daily, taste-bud sensory cells run one of the fastest renewal cycles in your body!',
    { numeric: { target: 10, min: 2, max: 35, step: 1, unit: 'days' } }),

  g('MEDICINE', 1, 'shingles_reactivated_chickenpox_nerve',
    'Decades after childhood chickenpox fades, its dormant virus can wake up along a single one-sided nerve stripe as what?',
    ['Shingles rash', 'Scarlet strep fever', 'German rubella spots', 'Fifth-disease blush'], 0,
    'Varicella-zoster hides quietly inside dorsal root nerve ganglia for 50+ years—stopping sharply at your torso’s midline when reactivated!'),

  g('MEDICINE', 2, 'elizabeth_ann_cloned_ferret_2020',
    'Born in 2020 as America’s first cloned endangered animal, "Elizabeth Ann" grew from 1988 frozen cells of what predator?',
    ['Swift prairie kit fox', 'Black-footed ferret', 'Spotted pine marten', 'Ring-tailed cacomistle'], 1,
    'Every living wild black-footed ferret descended from just seven survivors—frozen zoo cells brought back lost genetic diversity!'),

  g('MEDICINE', 1, 'bumblebee_soccer_ball_play_2022',
    '2022 London lab videos charmed biologists when well-fed bumblebees detoured past food purely for fun to roll tiny what?',
    ['Glass nectar marbles', 'Rolled pollen pellets', 'Mini wooden balls', 'Folded daisy petals'], 2,
    'Younger bees rolled balls even more eagerly than older foragers with zero sugar reward—ticking every textbook box for animal play!'),

  g('MEDICINE', 2, 'sperm_whale_codas_phonetic_alphabet_2024',
    'Using AI to study Caribbean sperm whales in 2024, Project CETI uncovered vowel-like patterns in rhythmic what?',
    ['Bubble-net whistles', 'Tail-slap shockwaves', 'Infrasonic belly hums', 'Click codas'], 3,
    'Sperm whales tweak tempo and add extra "ornamentation" clicks to codas depending on conversational context inside their clan!'),

  g('MEDICINE', 3, 'optogenetics_algae_light_switch_neurons_2005',
    'Invented in 2005, "optogenetics" lets scientists switch specific brain circuits on and off with light using proteins from what?',
    ['Pond green algae', 'Deep-sea anglerfish', 'Desert scorpions', 'Arctic snow lichens'], 0,
    'Channelrhodopsin helps single-celled algae swim toward sunlight—spliced into neurons, a blue laser flash fires one chosen memory cell!'),

  g('MEDICINE', 2, 'gut_fecal_transplant_c_diff_cure',
    'Approved in oral capsule form by the FDA in 2023, healthy donor gut microbes rout stubborn C. diff by restoring what?',
    ['Stomach acid levels', 'Microbiome balance', 'Gallbladder bile salts', 'Appendix lymph nodes'], 1,
    'Broad antibiotics can wipe out friendly gut flora like a clear-cut forest—re-seeding diverse bacteria crowds C. diff right out!'),

  g('MEDICINE', 2, 'malaria_mosquirix_r21_vaccine_2021',
    'After a century-long hunt against a shape-shifting parasite, WHO backed the first childhood vaccines in 2021–2023 for what?',
    ['Tsetse sleeping fever', 'River blindness worms', 'Mosquito malaria', 'Dengue breakbone virus'], 2,
    'Unlike viruses, Plasmodium parasites swap surface coats across liver and blood stages—making R21 and RTS,S monumental triumphs!'),

  g('MEDICINE', 1, 'neuralink_noland_arbaugh_chess_2024',
    'In early 2024, paralyzed patient Noland Arbaugh stayed up until 6 AM playing video games hands-free using a coin-sized what?',
    ['Eye-tracking visor', 'Tongue-stud joystick', 'Neck EMG collar band', 'Brain-computer chip'], 3,
    'Hair-thin electrode threads read motor-cortex intentions directly, letting Arbaugh glide a laptop cursor simply by imagining movement!'),

  g('MEDICINE', 1, 'mrna_covid_spike_protein_blueprint',
    'Instead of injecting weakened virus, 2020 mRNA shots gave muscle cells a temporary recipe to display harmless viral what?',
    ['Spike proteins', 'Capsid shell rings', 'Reverse enzymes', 'Lipid tail anchors'], 0,
    'Once your immune system learns to recognize the crown-like spike shape, your cells shred the temporary mRNA instructions within days!'),

  g('MEDICINE', 2, 'pufferfish_underwater_sand_crop_circles',
    'Divers off Japan were baffled by ornate 7-foot seafloor sand mandalas—finally catching a palm-sized male what flapping 24/7?',
    ['Blue-ringed cuttlefish', 'Spotted pufferfish', 'Peacock flounder flatfish', 'Mandarin dragonet'], 1,
    'Flapping tiny pectoral fins thousands of times, the male carves radial valleys that calm currents around eggs in the center!'),

  g('MEDICINE', 2, 'african_elephants_unique_rumble_names_2024',
    'AI acoustic studies in Kenya in 2024 showed wild African elephants call specific family members across miles using what?',
    ['Trunk-slap Morse beats', 'Foot-stomp rhythms', 'Individual vocal names', 'Copied hornbill calls'], 2,
    'Unlike parrots or dolphins that mimic a friend’s own signature whistle, elephants invent arbitrary low-frequency name labels!'),

  g('MEDICINE', 1, 'orangutan_rakus_medicinal_leaf_poultice_2024',
    'In a 2024 Sumatra first, wild orangutan "Rakus" chewed pain-relieving leaves into green mash and dabbed it onto what?',
    ['An arthritic knee joint', 'A cracked molar tooth', 'Stung palm calluses', 'A facial cheek wound'], 3,
    'Known to local healers as Akar Kuning, the antiseptic plant closed Rakus’s deep wound cleanly within five days without infection!'),

  g('MEDICINE', 3, 'denisovan_pinkie_bone_siberia_2010',
    'Identified in 2010 from a girl’s tiny pinkie bone in a Siberian cave, which extinct human cousin gifted Tibetans altitude genes?',
    ['Denisovans', 'Homo naledi cavers', 'Java Homo erectus', 'Piltdown hominids'], 0,
    'EPAS1 gene variants inherited from Denisovans let Sherpas thrive on thin Himalayan air without thickening blood dangerously!'),

  g('MEDICINE', 3, 'crispr_tardigrade_dsup_radiation_protein',
    'Sequencing tardigrades in 2016 revealed a shield protein nicknamed "Dsup" that hugs DNA strands to shrug off lethal what?',
    ['Boiling sulfur vents', 'X-ray radiation', 'Crushing trench pressure', 'Concentrated stomach acid'], 1,
    'Adding tardigrade Damage-Suppressor (Dsup) genes to cultured human cells cut X-ray DNA strand breaks roughly in half!'),

  g('MEDICINE', 2, 'narwhal_tusk_millions_nerve_endings',
    'Dentists studying Arctic narwhals stunned biologists: that spiral eight-foot tooth is built inside out, coated with what?',
    ['Enamel armor plates', 'Hollow sonar whistles', '10 million nerve endings', 'Iron-hardened dentine'], 2,
    'Instead of dueling like swords, a narwhal’s flexible tusk senses subtle salinity shifts when winter sea ice freezes overhead!'),

  g('MEDICINE', 1, 'crows_grudge_human_masks_seattle',
    'Seattle biologists wearing caveman masks proved wild crows don’t just remember mean human faces for years—they also do what?',
    ['Bury shiny peace gifts', 'Flee the county forever', 'Mimic human apologies', 'Teach chicks to scold'], 3,
    'Young crows hatched years after the original trapping instantly dive-bombed and scolded the exact mask their parents warned them about!'),

  g('MEDICINE', 2, 'human_nose_one_trillion_scent_combos_2014',
    'Shattering an old myth of "10,000 smells," 2014 lab tests showed 400 human nasal receptors can distinguish over how many odors?',
    ['One trillion odors', 'Fifty thousand odors', 'Two million floral notes', 'Ten billion aromas'], 0,
    'Like 400 piano keys played in chords, combinatorial scent coding makes human noses far sharper than 1920s textbooks guessed!'),

  g('MEDICINE', 2, 'zombie_ant_cordyceps_muscle_puppet',
    'Inspiring "The Last of Us," Cordyceps fungus marches ants up stems without invading their brains—wrapping threads around what?',
    ['Optic eye stalks', 'Leg and jaw muscles', 'Antenna scent tips', 'Hollow heart tubes'], 1,
    '3D electron microscopy showed the ant’s brain stays untouched inside while fungal networks yank muscle fibers like puppet strings!'),

  g('MEDICINE', 2, 'pregnancy_microchimerism_fetal_cells',
    'Decades after childbirth, mothers still carry tiny colonies of living stem cells in their hearts and brains left by whom?',
    ['Their own grandmothers', 'Childhood twin siblings', 'Their grown children', 'Hospital blood donors'], 2,
    'Called fetal microchimerism, baby cells cross the placenta during pregnancy and have even been spotted repairing maternal heart tissue!'),

  g('MEDICINE', 1, 'dogs_inner_eyebrow_muscle_puppy_eyes_2019',
    'Comparing wolves and dogs in 2019, anatomists found life beside humans selected for an inner-brow muscle built to make what?',
    ['Fierce bared-fang snarls', 'Night-vision squints', 'Wind-blocking winks', 'Sad puppy-dog eyes'], 3,
    'Raising the inner eyebrow makes canine eyes look larger and infant-like—hijacking human nurturing instincts in animal shelters!'),

  // --- 1960s–1990s CLASSICS (37 Clues) ---
  g('MEDICINE', 1, 'christiaan_barnard_1967_cape_town_heart',
    'In December 1967, Cape Town surgeon Christiaan Barnard made global front pages with the first human transplant of what?',
    ['A human heart', 'Both lungs together', 'A whole human pancreas', 'A split donor liver'], 0,
    'Grocer Louis Washkansky woke up smiling and chatting with nurses—proving a transplanted heart could restart inside another chest!'),

  g('MEDICINE', 1, 'louise_brown_1978_ivf_test_tube_baby',
    'Born healthy in Oldham, England in July 1978, Louise Joy Brown made global headlines as history’s first baby conceived how?',
    ['Aboard an ocean liner', 'In vitro in a lab dish', 'From frozen donor eggs', 'Inside a hyperbaric tent'], 1,
    'Pioneers Robert Edwards and Patrick Steptoe paved the way for over 12 million IVF births worldwide—earning the 2010 Nobel Prize!'),

  g('MEDICINE', 1, 'cpr_stayin_alive_100_to_120_bpm_chest',
    'Heart groups tell bystanders doing hands-only CPR to push to the disco beat of "Stayin’ Alive"—near what pace per minute?',
    ['40 to 50 beats/min', '60 to 75 beats/min', '100 to 120 beats', '180 to 200 beats/min'], 2,
    'Recorded by the Bee Gees at 103 BPM, humming "Stayin’ Alive" (or "Baby Shark"!) keeps chest compressions right in the lifesaving zone!'),

  g('MEDICINE', 2, 'who_1980_smallpox_eradicated_forever',
    'Which landmark year saw the WHO declare smallpox 100% eradicated—still the ONLY human infectious disease wiped off Earth?',
    ['1964', '1971', '1992', '1980'], 3,
    'Ring-vaccination teams armed with forked two-pronged needles cornered the last natural case in Somalia in late 1977!',
    { numeric: { target: 1980, min: 1955, max: 2005, step: 1, unit: 'year' } }),

  g('MEDICINE', 2, 'emi_beatles_profits_funded_ct_scanner',
    'Godfrey Hounsfield built the first 3D X-ray CT brain scanner in 1971 at EMI—a record label flush with profits from whom?',
    ['The Beatles', 'The Rolling Stones', 'Pink Floyd’s catalog', 'Queen’s arena tours'], 0,
    'Fab Four vinyl millions let EMI bankroll Hounsfield’s wild four-year prototype—giving doctors non-surgical 3D brain slices!'),

  g('MEDICINE', 2, 'lasik_excimer_laser_thanksgiving_turkey',
    'IBM’s Rangaswamy Srinivasan sparked bladeless LASIK eye surgery in 1981 after testing a UV laser on leftovers from his what?',
    ['Sunday prime rib roast', 'Thanksgiving turkey', 'Steamed lobster shell', 'Hard-boiled Easter egg'], 1,
    'Under a microscope, ultraviolet pulses vaporized bone cartilage with razor-clean edges and zero charring of neighboring tissue!'),

  g('MEDICINE', 1, 'epipen_military_nerve_gas_autoinjector',
    'Sheldon Kaplan invented the spring-loaded EpiPen in the 1970s by adapting a Pentagon battlefield injector built against what?',
    ['Malaria swamp fevers', 'Frostbite trench shock', 'Chemical nerve agents', 'Rattlesnake pit venom'], 2,
    'Soldiers needed a one-thumb thigh punch through heavy fatigues—the exact speed needed to halt fatal bee-sting anaphylaxis!'),

  g('MEDICINE', 1, 'heimlich_maneuver_1974_trapped_lung_air',
    'Introduced by surgeon Henry Heimlich in 1974, a sharp upward belly thrust pops a choking obstruction free using what?',
    ['Swallowed stomach gas', 'Throat muscle recoil', 'Sudden blood pressure', 'Residual lung air'], 3,
    'Even after exhaling, healthy lungs hold over a liter of spare air—pulling inward under the diaphragm fires it like a champagne cork!'),

  g('MEDICINE', 1, 'apgar_score_zero_to_ten_newborn_check',
    'Devised by Dr. Virginia Apgar, nurses grade every newborn’s health one minute after birth on a quick scale topping out at what?',
    ['10 points', '5 vital points', '20 newborn points', '100 clinical points'], 0,
    'Students turned her surname into a mnemonic—Appearance, Pulse, Grimace, Activity, Respiration—saving countless quiet newborns!',
    { numeric: { target: 10, min: 3, max: 25, step: 1, unit: 'points' } }),

  g('MEDICINE', 1, 'lucy_1974_ethiopia_beatles_cassette',
    'Unearthed in Ethiopia in 1974, 3.2-million-year-old fossil "Lucy" was named after a camp song about diamonds where?',
    ['Under the sea', 'In the sky', 'Across the universe', 'Down in Strawberry Fields'], 1,
    'Donald Johanson’s team celebrated with "Lucy in the Sky with Diamonds" on repeat—proving upright walking preceded big brains!'),

  g('MEDICINE', 1, 'jane_goodall_1960_gombe_termite_twig',
    'Watching chimp "David Greybeard" strip a twig to fish termites in 1960, Jane Goodall shattered humans’ solo claim to what?',
    ['Sharing cooked meat', 'Mourning lost elders', 'Making custom tools', 'Bartering shiny stones'], 2,
    'Mentor Louis Leakey famously telegraphed back: "Now we must redefine tool, redefine Man, or accept chimpanzees as humans!"'),

  g('MEDICINE', 2, 'ramachandran_mirror_box_phantom_limb',
    'Neurologist V. S. Ramachandran eased painful "clenched" phantom hands in 1990s amputees using a cardboard box and a plain what?',
    ['Warm paraffin bath', 'Tuning-fork buzzer', 'Velcro pressure cuff', 'Vertical mirror'], 3,
    'Seeing their intact hand’s reflection unclench tricked the visual brain into telling motor circuits the missing fist had relaxed!'),

  g('MEDICINE', 3, 'akira_endo_1973_rice_mold_statins',
    'Screening 6,000 fungi in 1973 Tokyo like a modern Fleming, Akira Endo found the first cholesterol-lowering statin inside what?',
    ['Blue-green grain mold', 'Fermented miso paste', 'Deep-sea kelp slime', 'Cedar forest mushrooms'], 0,
    'Endo reasoned fungi brew chemicals blocking rival microbes from making sterols—the exact enzyme human livers use for cholesterol!'),

  g('MEDICINE', 2, 'split_brain_left_talks_right_draws',
    'Roger Sperry’s Nobel "split-brain" studies showed the left hemisphere handles speech while the right hemisphere shines at what?',
    ['Rhyming Latin verbs', 'Faces and 3D space', 'Balancing checkbooks', 'Phonetic Morse code'], 1,
    'Shown an object only in their left visual field, split-brain patients swore they saw nothing—while their left hand drew it cleanly!'),

  g('MEDICINE', 1, 'mri_superconducting_magnet_zero_xrays',
    'Why do hospitals ban steel keys and wheelchairs near an MRI room even between scans? Its liquid-helium coil stays a live what?',
    ['High-voltage X-ray tube', 'Gamma-ray cobalt core', 'Superconducting magnet', 'Microwave radar dish'], 2,
    'Zero ionizing radiation touches you in an MRI—its 30,000x-Earth magnetic field aligns water protons and listens with radio waves!'),

  g('MEDICINE', 1, 'kangaroo_care_1978_bogota_incubators',
    'Short on electric incubators in 1978 Bogotá, doctors slashed preemie deaths by tucking tiny newborns against a parent’s what?',
    ['Warm wool sheepskin', 'Hot-water rubber bottle', 'Sunlit nursery window', 'Bare skin chest'], 3,
    'Dubbed "Kangaroo Mother Care," skin-to-skin warmth steadies baby heartbeats, breathing, and immunity better than solo glass boxes!'),

  g('MEDICINE', 2, 'oliver_sacks_prosopagnosia_face_blind',
    'Famed via Oliver Sacks’s 1985 book about a man mistaking his wife for a hat, "prosopagnosia" blocks recognizing what?',
    ['Familiar faces', 'Primary paint colors', 'Musical melody pitches', 'Written street numbers'], 0,
    'Sacks himself had lifelong face blindness—often greeting neighbors’ dogs first so he could deduce which human held the leash!'),

  g('MEDICINE', 3, 'cochlear_implant_graeme_clark_seashell',
    'Pioneer Graeme Clark figured out how to thread fragile cochlear-implant wires into the spiral inner ear using grass and what?',
    ['Curved macaroni tubes', 'A beach turban shell', 'Blown miniature glass', 'Coiled watch hairsprings'], 1,
    'Stiff grass blades snagged inside the shell while tapered tips glided smoothly around tight turns—inspiring graded electrode arrays!'),

  g('MEDICINE', 2, 'michel_siffre_1962_cave_body_clock',
    'Camping two months in a dark glacier cave with zero clocks in 1962, Michel Siffre proved humans keep a cycle near how many hours?',
    ['12 hours', '18 waking hours', '24 hours', '36 cavern hours'], 2,
    'Launching human chronobiology, Siffre woke, ate, and slept on a ~24.5-hour free-running rhythm with zero sunrise cues!',
    { numeric: { target: 24, min: 10, max: 48, step: 1, unit: 'hours' } }),

  g('MEDICINE', 2, 'karl_von_frisch_honeybee_waggle_dance',
    'Karl von Frisch won a 1973 Nobel for decoding how scout honeybees share the angle and distance to flowers via a figure-eight what?',
    ['Wing-buzz fanfare', 'Spiral ceiling climb', 'Antenna drum solo', 'Waggle dance'], 3,
    'On a vertical dark comb, dancing straight up means "fly toward the sun," while 30° right means "steer 30° right of the sun"!'),

  g('MEDICINE', 2, 'nicotine_patch_jarvik_tobacco_harvesters',
    'UCLA’s Murray Jarvik tested the first nicotine patch on his arm in 1984 after reading how wet tobacco leaves gave pickers what?',
    ['Skin-absorbed illness', 'Blistered calloused thumbs', 'Stained yellow fingernails', 'Pollen hay-fever sneezes'], 0,
    'Dew-soaked leaves dosed pickers through intact skin ("green tobacco sickness")—proving a steady skin patch could curb cravings safely!'),

  g('MEDICINE', 2, 'oral_rehydration_salts_glucose_pump',
    'Hailed as the 20th century’s top lifesaver, 1960s Oral Rehydration Therapy adds a pinch of sugar to salt water to unlock what?',
    ['Kidney potassium flushing', 'Gut water-uptake pumps', 'Liver glycogen armor', 'Stomach acid buffering'], 1,
    'Plain salt water pours past cholera-stricken guts, whereas sodium-glucose co-transporters pull salt and water in—saving 70M lives!'),

  g('MEDICINE', 2, 'balloon_angioplasty_gruentzig_kitchen_table',
    'Andreas Grüntzig hand-glued his first balloon catheters at his kitchen table before his landmark 1977 reopening of what?',
    ['Collapsed lung airways', 'Blocked tear ducts', 'Narrowed heart arteries', 'Pinched spinal canals'], 2,
    'Awake during the first coronary balloon inflation without open-chest surgery, patient Adolph Bachmann stayed artery-clear for decades!'),

  g('MEDICINE', 3, 'retrovirus_reverse_transcriptase_1970',
    'Temin and Baltimore stunned genetics in 1970—winning the Nobel—by proving retroviruses pack an enzyme that copies what?',
    ['Proteins back to RNA', 'Lipids into sugar chains', 'Sugars into amino rings', 'RNA backward into DNA'], 3,
    'Biology’s "Central Dogma" swore data flowed strictly DNA-to-RNA—reverse transcriptase rewrote textbooks and enabled modern RT-PCR!'),

  g('MEDICINE', 2, 'lyme_disease_1975_connecticut_mothers',
    'Two persistent moms mapping neighborhood kids’ swollen knees in 1975 led Yale doctors to uncover tick illness named after where?',
    ['Old Lyme, Connecticut', 'Plum Island, New York', 'Martha’s Vineyard, Mass.', 'Bar Harbor, Maine'], 0,
    'Polly Murray and Judith Mensch refused to believe juvenile arthritis randomly struck dozens of children on the same wooded streets!'),

  g('MEDICINE', 3, 'endosymbiosis_lynn_margulis_1967_mitochondria',
    'Rejected by 15 journals in 1966 before winning every textbook, Lynn Margulis argued cell powerhouses—mitochondria—began as what?',
    ['Crystallized viral shells', 'Swallowed bacteria', 'Folded nuclear envelopes', 'Pinched Golgi bubbles'], 1,
    'Mitochondria still carry their own circular bacterial-style DNA and divide like microbes inside every human cell!'),

  g('MEDICINE', 2, 'hydrothermal_vents_1977_alvin_tubeworms',
    'Diving 8,000 feet in sub Alvin in 1977, explorers gasped at giant red tubeworms thriving without sun by hosting internal what?',
    ['Bioluminescent krill', 'Thermal algae mats', 'Sulfur-eating microbes', 'Radioactive plankton'], 2,
    'Adult Riftia tubeworms have zero mouth and zero gut—internal bacteria turn volcanic hydrogen sulfide straight into food!'),

  g('MEDICINE', 1, 'pulse_laser_tattoo_selective_ink_shatter',
    'Dermatology lasers erase old tattoos without burns because quick flashes shatter big ink drops small enough to be cleared by what?',
    ['Sweat-gland evaporation', 'Shedding outer dandruff', 'Hair follicle roots', 'White blood cells'], 3,
    'Macrophages constantly try eating tattoo ink from day one—they only fail until a laser blasts pigment boulders into bite-sized dust!'),

  g('MEDICINE', 2, 'luc_montagnier_barre_sinoussi_1983_hiv',
    'Barré-Sinoussi and Montagnier won the 2008 Nobel for isolating which immune-raiding virus at Paris’s Pasteur Institute in 1983?',
    ['HIV retrovirus', 'Ebola filovirus', 'West Nile flavivirus', 'SARS coronavirus'], 0,
    'Identifying HIV within two years of the first clinical reports enabled blood-bank screening and lifesaving antiretroviral cocktails!'),

  g('MEDICINE', 2, 'placebo_naloxone_endorphin_tooth_1978',
    'A classic 1978 dental study proved sugar-pill placebos aren’t "just pretend"—an opioid blocker erased relief by muting brain what?',
    ['Adrenal cortisol spikes', 'Painkilling endorphins', 'Dopamine reward loops', 'Spinal histamine waves'], 1,
    'Injecting naloxone brought toothache right back—proving optimistic expectation triggers real biochemical painkillers inside your brain!'),

  g('MEDICINE', 3, 'surfactant_premature_lungs_fujiwara_1980',
    'In 1980, Dr. Tetsuro Fujiwara saved premature babies whose air sacs stuck shut like wet balloons by misting lungs with soapy what?',
    ['Warm saline vapor', 'Diluted helium mist', 'Natural lung surfactant', 'Pure liquid oxygen'], 2,
    'Without surfactant’s surface-tension break—normally brewed late in pregnancy—every tiny newborn breath took exhausting effort!'),

  g('MEDICINE', 2, 'leptin_jeffrey_friedman_1994_satiety',
    'Cloned by Jeffrey Friedman in 1994 from Greek for "thin," which fat-cell hormone tells your brain energy stores are full?',
    ['Ghrelin stomach hormone', 'Glucagon liver peptide', 'Thyroxine neck hormone', 'Leptin hormone'], 3,
    'Whereas stomach "ghrelin" growls for lunch, fat cells release leptin to tell your hypothalamus you have plenty of fuel banked!'),

  g('MEDICINE', 1, 'rogaine_minoxidil_baldness_blood_pressure_pill',
    '1980s patients taking minoxidil pills for high blood pressure noticed a furry side effect—relaunched for scalps as what?',
    ['Rogaine foam', 'Claritin allergy mist', 'Dramamine travel tabs', 'Zyrtec sinus drops'], 0,
    'Upjohn originally wanted to call the hair-regrowth lotion "Regain" until FDA regulators insisted that sounded way too guaranteed!'),

  g('MEDICINE', 1, 'botox_alan_scott_crossed_eyes_1970s',
    'Before smoothing celebrity foreheads, eye doctor Alan Scott micro-dosed botulinum toxin in the 1970s to gently relax what?',
    ['Migraine jaw clenching', 'Crossed eye muscles', 'Stiff vocal-cord spasms', 'Sweaty concert palms'], 1,
    'Patients treated for eyelid spasms noticed their frown creases vanished—turning a $9,000 eye patent into multibillion-dollar Botox!'),

  g('MEDICINE', 1, 'laparoscopic_keyhole_gallbladder_1985',
    'Pioneered in 1985 before sweeping 1990s hospitals, "keyhole" surgery swapped foot-long scars for tiny ports guided by what?',
    ['Handheld ultrasound wands', 'Magnetic compass needles', 'A fiber-optic camera', 'Overhead X-ray mirrors'], 2,
    'Gallbladder patients who once spent a week recovering in hospital beds suddenly walked home the very next afternoon!'),

  g('MEDICINE', 1, 'arctic_wood_frog_glucose_frozen_solid',
    'Alaskan wood frogs freeze solid with zero heartbeat all winter—flooding cells with what so ice crystals don’t burst them?',
    ['Salty ocean brine', 'Oily whale blubber', 'Pine-bark turpentine', 'Syrupy blood glucose'], 3,
    'Ice fills spaces outside their organs while liver-pumped sugar acts like biological antifreeze inside cells until spring thaw!'),

  g('MEDICINE', 1, 'lyrebird_chainsaw_camera_shutter_mimic',
    'Filmed famously by David Attenborough in 1998, Australia’s superb lyrebird woos mates by mimicking 20 birds plus loggers’ what?',
    ['Revving chainsaws', 'Ringing dinner bells', 'Whistling tea kettles', 'Diesel train horns'], 0,
    'With songbirds’ most intricate vocal syrinx, wild lyrebirds flawlessly imitate camera shutters, car alarms, and barking dogs!'),

  // --- ANCIENT / WORLD HISTORY & TIMELESS HUMAN BODY / ANIMAL SUPERPOWERS (27 Clues) ---
  g('MEDICINE', 1, 'ignaz_semmelweis_1847_handwashing_lime',
    'Vienna doctors scoffed in 1847 when Ignaz Semmelweis cut maternity deaths from 18% to 1% simply by ordering staff to do what?',
    ['Boil linen bedsheets', 'Scrub hands in lime', 'Open frosty windows', 'Wear leather aprons'], 1,
    'Decades before germ theory, Semmelweis proved doctors walking straight from autopsy tables carried fatal particles on bare hands!'),

  g('MEDICINE', 2, 'john_snow_1854_broad_street_pump_handle',
    'Mapping 1854 London deaths door to door, Dr. John Snow proved cholera rode water—halting Soho’s outbreak by removing what?',
    ['Thames oyster barges', 'Brewery copper vats', 'Broad Street pump handle', 'Butcher-lane drains'], 2,
    'Workers at a nearby brewery stayed healthy because they drank malt beer all shift instead of fetching Broad Street well water!'),

  g('MEDICINE', 2, 'florence_nightingale_polar_pie_chart_crimea',
    'A pioneer statistician too, Florence Nightingale persuaded Britain to clean army hospitals using colorful charts shaped like what?',
    ['Stacked pyramid bars', 'Fever bell curves', 'Scatter-plot bullseyes', 'Polar pie wedges'], 3,
    'Her 1858 "coxcomb" charts showed at one glance that preventable camp filth killed far more Crimean troops than Russian bullets!'),

  g('MEDICINE', 3, 'hyoid_throat_only_floating_human_bone',
    'Slung strictly by muscles beneath your tongue, which U-shaped bone is the ONLY bone in your body touching zero other bones?',
    ['The hyoid bone', 'Collar clavicle bar', 'Floating twelfth rib', 'Kneecap patella disc'], 0,
    'Neanderthals shared a remarkably human-shaped hyoid bone—crucial scaffolding for anchoring tongue and larynx speech muscles!'),

  g('MEDICINE', 1, 'tooth_enamel_hardest_tissue_human_body',
    'Harder than iron and denser than bone, what mineral-packed outer crown coat is the hardest substance the human body produces?',
    ['Femur cortex bone', 'Tooth enamel', 'Thumbnail keratin', 'Ear-ossicle ivory'], 1,
    'Made of 96% tightly woven hydroxyapatite mineral crystals with zero living cells, adult enamel cannot regrow itself once chipped!'),

  g('MEDICINE', 2, 'red_blood_cells_eject_nucleus_donut',
    'To fold like squishy donuts through tiny capillaries and pack extra hemoglobin, mature human red blood cells ditch their what?',
    ['Outer lipid membrane', 'Iron-binding pockets', 'Entire cell nucleus', 'Surface blood-type tags'], 2,
    'Birds and frogs keep nucleated red blood cells—mammals ditch the nucleus to maximize oxygen cargo for warm-blooded stamina!'),

  g('MEDICINE', 2, 'inner_ear_three_vestibular_gyro_loops',
    'Even in a dark elevator, your brain senses tilts and spins via fluid sloshing inside how many semicircular canals per ear?',
    ['1 loop canal', '2 twin canals', '6 stacked canals', '3 semicircular canals'], 3,
    'Set at 90-degree X-Y-Z right angles like a phone’s 3-axis gyroscope, fluid lag keeps spinning dancers dizzy right after stopping!',
    { numeric: { target: 3, min: 1, max: 12, step: 1, unit: 'canals' } }),

  g('MEDICINE', 1, 'photic_sneeze_achoo_sunlight_crossed_wires',
    'Roughly one in four humans inherits "ACHOO syndrome"—an instant sneeze triggered when stepping from darkness into bright what?',
    ['Noon sunlight', 'Peppermint bakery air', 'Chilly autumn wind', 'Chlorinated pool mist'], 0,
    'Aristotle puzzled over sun-sneezing 2,300 years ago—packed optic pupillary signals cross-talk with your neighboring nose nerve!'),

  g('MEDICINE', 1, 'brain_freeze_slushie_roof_of_mouth_artery',
    'Gulp an icy slushie too fast and "brain freeze" throbs behind your eyes because cold blood vessels suddenly dilate in your what?',
    ['Inner ear drum canal', 'Upper mouth palate', 'Sinus tear bridge', 'Collar carotid fork'], 1,
    'Your brain itself has zero pain receptors—pressing a warm thumb or tongue against the roof of your mouth calms the alarm fast!'),

  g('MEDICINE', 1, 'mitochondrial_dna_inherited_only_from_mom',
    'Sperm burn their tail powerhouses swimming to the egg and lose them at entry—so 100% of your mitochondrial DNA comes from whom?',
    ['Your paternal grandfather', 'Both parents equally', 'Your biological mother', 'Random embryo shuffling'], 2,
    'Geneticists trace unbroken maternal lineages back 150,000+ years to "Mitochondrial Eve" using these maternally passed genomes!'),

  g('MEDICINE', 1, 'blind_spot_optic_disc_zero_photoreceptors',
    'Every healthy human eye has a natural "blind spot" your brain fills in—right where the optic nerve cable exits through what?',
    ['Clear front lens', 'Colored iris ring', 'Watery tear duct', 'Retinal back wall'], 3,
    'Octopus eyes wire nerve fibers neatly behind their retina instead of punching through front-to-back—giving octopuses zero blind spot!'),

  g('MEDICINE', 1, 'night_vision_rods_black_and_white_stars',
    'Moonlit gardens look silvery gray because color-sensing cones nap in dim light while 120 million sensitive what take over?',
    ['Rod photoreceptors', 'Iris muscle rings', 'Corneal prism cells', 'Optic myelin sheaths'], 0,
    'Pirates and astronomers guard night-adapted rhodopsin pigment fiercely—one bright phone glance bleaches rods for 20 minutes!'),

  g('MEDICINE', 1, 'eustachian_tube_airplane_yawn_ear_pop',
    'Swallowing gum on a climbing jet "pops" muffled eardrums by cracking open a tiny pressure tunnel from your middle ear to what?',
    ['Outer tear corner', 'Back of the throat', 'Upper jawbone socket', 'Forehead sinus cave'], 1,
    'Named after Renaissance anatomist Bartolomeo Eustachi, that narrow tube stays shut until jaw or throat muscles tug it open!'),

  g('MEDICINE', 1, 'hiccup_diaphragm_spasm_vocal_snap',
    'A diaphragm spasm starts a hiccup, yet that sharp "HIC!" sound happens milliseconds later when rushing air snaps shut what?',
    ['Soft nasal uvula', 'Wisdom-tooth cheeks', 'Vocal cords', 'Lower esophageal valve'], 2,
    'Ultrasounds show babies hiccuping frequently inside the womb months before birth—practicing breathing-muscle reflexes early!'),

  g('MEDICINE', 2, 'masseter_jaw_strongest_bite_leverage',
    'Clamping human molars together with up to 200 pounds of force, which compact cheek muscle pulls strongest for its weight?',
    ['Biceps arm flexor', 'Sartorius thigh strap', 'Deltoid shoulder cap', 'Masseter jaw muscle'], 3,
    'Short muscle fibers paired with tight jaw-hinge leverage let humans crack hard nuts cleanly despite smaller jaws than great apes!'),

  g('MEDICINE', 1, 'gluteus_maximus_upright_stair_climbing',
    'Chimps have flat backsides—humans evolved the body’s largest muscle, the gluteus maximus, chiefly to steady us while doing what?',
    ['Running upright', 'Sitting cross-legged', 'Floating on salt water', 'Throwing heavy spears'], 0,
    'Walking leisurely on flat ground barely wakes it up—your gluteus maximus fires hardest when sprinting, climbing stairs, or standing!'),

  g('MEDICINE', 2, 'karl_landsteiner_1901_abo_blood_types',
    'Transfusions were deadly roulette until Karl Landsteiner mixed staff blood drops in 1901 Vienna and discovered clumping what?',
    ['Rhesus marrow stem cells', 'ABO blood groups', 'Clotting fibrin threads', 'White phagocyte swarms'], 1,
    'World Blood Donor Day falls every June 14—Karl Landsteiner’s birthday—honoring a discovery that made modern surgery possible!'),

  g('MEDICINE', 1, 'louis_pasteur_swan_neck_flask_broth',
    'To prove spoiled soup came from airborne microbes—not magic—Louis Pasteur boiled broth inside open glass flasks with curved what?',
    ['Silver mesh corks', 'Double vacuum walls', 'S-shaped swan necks', 'Floating olive-oil seals'], 2,
    'Air flowed freely while dust and bacteria settled harmlessly in the bottom bend—keeping open broth clear for years until tilted!'),

  g('MEDICINE', 1, 'gregor_mendel_28000_monastery_pea_plants',
    'Before "genes" had a name, friar Gregor Mendel mapped dominant and recessive traits in the 1860s by cross-breeding 28,000 what?',
    ['Honeybee queen hives', 'Spotted abbey mice', 'Striped snapdragons', 'Garden pea plants'], 3,
    'Mendel counted round vs. wrinkled seeds and tall vs. dwarf vines with mathematician precision—establishing 3-to-1 inheritance laws!'),

  g('MEDICINE', 2, 'william_harvey_1628_blood_closed_circuit',
    'Doctors long taught the liver burned gallons of new blood hourly—until William Harvey used math in 1628 to prove blood moves how?',
    ['In a closed loop', 'Ebbing like ocean tides', 'Vaporizing out the pores', 'Pooling inside the spleen'], 0,
    'Multiplying two ounces per heartbeat by 72 beats a minute proved the heart pumped more than a man’s weight every half hour!'),

  g('MEDICINE', 3, 'trepanation_neolithic_healed_skull_holes',
    'Smooth regrown bone rims around neat holes in 7,000-year-old Stone Age skulls prove patients survived cranial drilling called what?',
    ['Phrenology mapping', 'Trepanation', 'Cupping cautery', 'Lithotomy extraction'], 1,
    'Inca and Neolithic healers scraped flint openings to relieve head-injury swelling—with archaeological survival rates topping 70%!'),

  g('MEDICINE', 2, 'myoglobin_whale_dark_meat_oxygen_scuba',
    'Deep-diving whales have muscles so dark they look nearly black—packed 10x richer than humans with which oxygen-storing protein?',
    ['Joint elastin fibers', 'Tendon collagen', 'Muscle myoglobin', 'Plasma fibrinogen'], 2,
    'Positively charged whale myoglobin packs at ultra-high concentrations without clumping—acting as built-in molecular scuba tanks!'),

  g('MEDICINE', 2, 'archerfish_refraction_spit_water_dart',
    'Lurking underwater, the archerfish spits water jets to knock bugs off twigs overhead while mentally correcting for bent light’s what?',
    ['Solar UV polarization', 'Surface mirror glare', 'Rippling Doppler shift', 'Water-air refraction'], 3,
    'Light bends sharply at the waterline so bugs look higher than they really are—archerfish calculate the ballistic arc in milliseconds!'),

  g('MEDICINE', 3, 'chameleon_elastic_collagen_tongue_catapult',
    'Even on cold mornings when muscles slow down, a chameleon shoots its tongue twice its body length at 50 Gs using coiled elastic what?',
    ['Spring-loaded collagen', 'Pressurized saliva sacs', 'Hollow jawbone pistons', 'Snapping tendon hooks'], 0,
    'Muscles leisurely cock elastic collagen sheaths around a tapered tongue bone like drawing a crossbow—then slide off for explosive release!'),

  g('MEDICINE', 1, 'human_sweat_odorless_skin_bacteria_feast',
    'Fresh sweat leaves your glands nearly odorless—body odor only blooms when harmless skin bacteria digest sweat lipids into what?',
    ['Salty urea crystals', 'Smelly thioalcohols', 'Lactic muscle cramps', 'Evaporating ammonia'], 1,
    'One tiny ABCC11 gene variant leaves most East Asians and Koreans with dry earwax and virtually zero underarm body-odor precursors!'),

  g('MEDICINE', 1, 'adult_blood_volume_five_liters_pump',
    'Pumping roughly 100,000 beats every day, an average adult human body circulates approximately how many liters of blood at once?',
    ['2 liters', '9 full liters', '5 liters', '14 liters'], 2,
    'Donating a standard half-liter pint takes roughly 10% of your five-liter supply—your body replaces the liquid plasma within 24 hours!',
    { numeric: { target: 5, min: 1, max: 15, step: 1, unit: 'liters' } }),

  g('MEDICINE', 3, 'cranial_nerves_twelve_pairs_vagus_wanderer',
    'Named from Latin for "wandering" because it wires heart, lungs, and gut, the vagus nerve is the longest of how many cranial nerve pairs?',
    ['6 nerve pairs', '8 cranial pairs', '24 nerve pairs', '12 pairs'], 3,
    'Numbered cleanly in Roman numerals I through XII from nose (Olfactory) to tongue (Hypoglossal), the Vagus is Cranial Nerve X!',
    { numeric: { target: 12, min: 4, max: 32, step: 1, unit: 'pairs' } }),

  // ==========================================================================
  // 2. CHEMISTRY (108 Clues: 49 D1, 43 D2, 16 D3 | 10 Numeric Showcase Payloads)
  // ==========================================================================

  // --- MODERN & CURRENT ERA: 2000s–2026 (44 Clues) ---
  g('CHEMISTRY', 1, 'lead_acid_car_battery_six_cells_twelve_volts',
    'Pop a car hood and a classic 12-volt starter battery still links sulfuric-acid lead plates across how many two-volt cells?',
    ['6 series cells', '2 giant twin cells', '12 one-volt cells', '24 mini button cells'], 0,
    'Invented by Gaston Planté in 1859, six 2.1-volt lead-dioxide cells in series still deliver the cold-cranking amps to turn engines over!',
    { numeric: { target: 6, min: 1, max: 24, step: 1, unit: 'cells' } }),

  g('CHEMISTRY', 1, 'lithium_lightest_solid_metal_periodic_3',
    'Floating effortlessly on mineral oil at element #3, which featherweight battery metal is Earth’s lightest solid element?',
    ['Beryllium alloy', 'Lithium', 'Brushed aluminum', 'Pure titanium'], 1,
    'Half as dense as liquid water, soft silvery lithium would float like a cork on a lake—if it didn’t immediately fizz into hydrogen!'),

  g('CHEMISTRY', 1, 'pepper_x_2023_hottest_chili_scoville',
    'Dethroning the Carolina Reaper in late 2023 at ~2.69M Scoville units, Ed Currie’s world-record chili is named what?',
    ['Dragon’s Breath Pod', 'Trinidad Scorpion', 'Pepper X', 'Ghost Naga Viper'], 2,
    'A greenish-yellow gnarled monster bred over ten years, Pepper X packs roughly 500 times more capsaicin punch than a jalapeño!'),

  g('CHEMISTRY', 2, 'wilbur_scoville_1912_sugar_water_panel',
    'Pharmacist Wilbur Scoville built his 1912 chili scale by diluting pepper extract until five human tasters tasted only what?',
    ['Cold whole milk', 'Salted club soda', 'Plain buttered bread', 'Sweet sugar water'], 3,
    'A habanero rated 300,000 Scoville units literally meant one drop of extract needed 300,000 drops of sugar water to hide the burn!'),

  g('CHEMISTRY', 2, 'lithium_ion_dendrites_short_circuit_whiskers',
    'Early rechargeable lithium batteries caught fire until carbon anodes tamed needle-sharp metallic whiskers called what?',
    ['Metallic dendrites', 'Sulfur stalactites', 'Copper patina flakes', 'Acid vapor bubbles'], 0,
    'Named from Greek "dendron" (tree), branching lithium needles pierced separator films—Akira Yoshino parked ions safely in carbon instead!'),

  g('CHEMISTRY', 2, 'david_baker_2024_nobel_de_novo_proteins',
    'Sharing the 2024 Chemistry Nobel, David Baker used code to build custom enzymes never seen in nature—known as what?',
    ['Fossilized prions', 'De novo proteins', 'Heavy water salts', 'Vulcanized starches'], 1,
    'Rather than tweaking existing genes, Baker’s Rosetta lab designs brand-new amino-acid sequences that fold into flu blockers and sensors!'),

  g('CHEMISTRY', 2, 'pfas_forever_chemicals_carbon_fluorine_bond',
    'Stain-proof coats spawned "forever chemicals" (PFAS) that last centuries thanks to carbon’s ultra-strong single bond with what?',
    ['Heavy lead atoms', 'Inert neon shells', 'Fluorine atoms', 'Brittle silicon rings'], 2,
    'Fluorine’s fierce grip on electrons makes the carbon-fluorine bond the toughest in organic chemistry—shrugging off fire and microbes!'),

  g('CHEMISTRY', 2, 'oleophobic_fluoropolymer_phone_smudge_coating',
    'New smartphone screens bead water and wipe clean easily thanks to a nanometer-thin "oleophobic" topcoat built to repel what?',
    ['Static pocket lint', 'Stray magnetic fields', 'Keyring brass scratches', 'Skin finger oils'], 3,
    'Alcohol screen wipes slowly strip away that microscopic oil-repelling coating—which is why older phones suddenly look smudgy!'),

  g('CHEMISTRY', 2, 'vantablack_carbon_nanotube_forest_light',
    'Unveiled in 2014 so crumpled foil looks like a flat hole, Vantablack traps 99.965% of light inside vertical forests of what?',
    ['Carbon nanotubes', 'Charred bone soot', 'Obsidian glass needles', 'Black velvet fibers'], 0,
    'Photons bounce endlessly between nanotubes 5,000 times thinner than a human hair until turning into imperceptible warmth!'),

  g('CHEMISTRY', 3, 'benjamin_list_macmillan_2021_organocatalysis',
    'List and MacMillan won the 2021 Chemistry Nobel for "organocatalysis"—building mirror-image drugs cleanly using small what?',
    ['Liquid mercury vats', 'Chiral amino molecules', 'Radioactive thorium', 'Molten platinum mesh'], 1,
    'One simple amino acid—proline—steers left-handed vs. right-handed drug synthesis cheaply without toxic heavy-metal waste!'),

  g('CHEMISTRY', 1, 'lab_grown_cvd_diamond_methane_microwave',
    'Modern jewelers grow real diamonds in weeks without crushing pressure—baking a seed in microwave plasma of hydrogen and what?',
    ['Liquid nitrogen mist', 'Powdered quartz sand', 'Methane gas', 'Vaporized table salt'], 2,
    'Splitting methane rains pure carbon atoms down layer by layer onto a seed—chemically and optically identical to mined diamond!'),

  g('CHEMISTRY', 2, 'roman_concrete_2023_mit_self_healing_lime',
    'Cracking a 2,000-year puzzle in 2023, MIT chemists proved Roman seawalls outlast modern concrete because white lime chunks do what?',
    ['Repel barnacle shells', 'Float atop high tides', 'Rust into steel mesh', 'Dissolve and self-heal'], 3,
    'Once dismissed as sloppy mixing, brittle quicklime "clasts" dissolve whenever water enters a fresh crack and recrystallize it shut!'),

  g('CHEMISTRY', 3, 'nihonium_113_first_asian_named_element_2016',
    'Synthesized in Japan and named in 2016 after "Land of the Rising Sun," Asia’s first periodic table discovery is element #113: what?',
    ['Nihonium', 'Tennessine', 'Moscovium', 'Livermorium'], 0,
    'Physicist Kosuke Morita’s team fired zinc nuclei for nine straight years just to catch three fleeting atoms of Nihonium (Nh)!'),

  g('CHEMISTRY', 3, 'tennessine_117_oak_ridge_halogen_2016',
    'Named in 2016 alongside Nihonium, element #117 honored Oak Ridge labs by putting which second US state onto the periodic table?',
    ['Virginia (Virginium)', 'Tennessee (Tennessine)', 'Colorado (Coloradium)', 'Illinois (Illinium)'], 1,
    'Joining Californium (#98), superheavy halogen Tennessine (Ts) recognized Oak Ridge’s rare berkelium target and Vanderbilt physicists!'),

  g('CHEMISTRY', 1, 'disposable_diaper_sodium_polyacrylate_snow',
    'Shake white crystals from a clean diaper: sodium polyacrylate drinks 300x its weight in water and doubles on movie sets as what?',
    ['Breakaway window glass', 'Thick haunted-house fog', 'Unmelting fake snow', 'Foaming root-beer head'], 2,
    'Polymer chains studded with sodium ions uncoil via osmosis to lock water into a fluffy gel—sprinkle salt on it and it liquefies!'),

  g('CHEMISTRY', 2, 'airbag_sodium_azide_nitrogen_30_ms',
    'Zero air tanks hide in your steering wheel—crash sensors ignite solid pellets to fill airbags with nitrogen in how many milliseconds?',
    ['5 milliseconds', '90 slow milliseconds', '500 milliseconds', '30 milliseconds'], 3,
    'Faster than a 100-millisecond human blink, solid propellant chemistry fills a cushion and vents it soft right as your head arrives!',
    { numeric: { target: 30, min: 5, max: 120, step: 5, unit: 'ms' } }),

  g('CHEMISTRY', 2, 'catalytic_converter_theft_rhodium_palladium',
    'Thieves saw catalytic converters off cars because the honeycomb inside coats exhaust in platinum, palladium, and pricey what?',
    ['Precious rhodium', 'Refined tungsten', 'Depleted uranium', 'Anodized titanium'], 0,
    'Just a few grams of platinum-group catalysts scrub toxic carbon monoxide and nitrogen oxides into harmless nitrogen, water, and CO2!'),

  g('CHEMISTRY', 2, 'swiss_water_decaf_activated_charcoal_sieve',
    'Solvent-free "Swiss Water" decaf soaks green coffee beans in flavor-rich water, then traps bulky caffeine out using porous what?',
    ['Spun fiberglass wool', 'Activated charcoal', 'Unglazed red terracotta', 'Woven copper mesh'], 1,
    'Pre-saturating the bath with coffee sugars and acids means osmosis pulls ONLY caffeine out into the carbon sieve!'),

  g('CHEMISTRY', 3, 'indium_tin_oxide_transparent_touchscreen',
    'Glass blocks current while metals block light—every phone touchscreen solves both with a clear conductive film of indium and what?',
    ['Powdered bismuth', 'Polished cobalt', 'Conductive tin oxide', 'Sintered antimony'], 2,
    'Indium tin oxide (ITO) lets 90% of screen pixels shine straight through while sensing the tiny electrical capacitance of your thumb!'),

  g('CHEMISTRY', 1, 'neodymium_rare_earth_airpods_ev_magnets',
    'Inside tiny AirPods speakers and EV motors, which rare-earth metal pairs with iron and boron to make today’s strongest magnets?',
    ['Soft malleable lead', 'Brittle gray manganese', 'Tarnished pewter', 'Neodymium'], 3,
    'Invented in 1984, penny-sized neodymium magnets lift thousands of times their own weight—making pocket-sized earbuds thunder!'),

  g('CHEMISTRY', 1, 'cilantro_soap_aldehydes_or6a2_receptor',
    'To ~14% of diners with an OR6A2 smell-gene variant, fresh cilantro tastes like dishwater because crushed leaves release soapy what?',
    ['Fatty aldehydes', 'Bitter quinine salts', 'Sour citric esters', 'Pungent capsaicin oils'], 0,
    'Soap-makers literally create those exact same decenal aldehyde molecules when splitting fats with lye—no wonder haters taste Dawn!'),

  g('CHEMISTRY', 1, 'lego_bricks_abs_polymer_clutch_power_1963',
    'LEGO bricks molded in 1966 still snap snugly onto 2026 sets because designers switched warping plastics in 1963 for tough what?',
    ['Soft latex rubber', 'ABS plastic resin', 'Celluloid film strip', 'Bakelite phone resin'], 1,
    'Acrylonitrile gives strength, butadiene adds impact bounce, and styrene lends glossy shine—holding 0.002-mm brick tolerances!'),

  g('CHEMISTRY', 2, 'e_ink_kindle_black_carbon_white_titanium',
    'A Kindle e-reader uses zero battery holding a page in sun because charges flip tiny spheres of black carbon and white what?',
    ['Powdered milk casein', 'Crushed mother-of-pearl', 'Titanium dioxide', 'Bleached cotton lint'], 2,
    'Positively charged white titanium dioxide and negatively charged black carbon trade places inside oil-filled capsules thinner than paper!'),

  g('CHEMISTRY', 2, 'popping_boba_alginate_seaweed_calcium_bath',
    'Famous in bubble tea, "popping boba" forms an instant gel skin when fruit juice laced with seaweed alginate drops into what?',
    ['Boiling clarified butter', 'Chilled vodka syrup', 'Whipped egg whites', 'A calcium salt bath'], 3,
    'Divalent calcium ions instantly zip long brown-algae alginate chains together like a net around liquid mango or lychee juice!'),

  g('CHEMISTRY', 1, 'pocket_hand_warmer_iron_powder_fast_rust',
    'Tear open a ski hand warmer and shake it: zero fuel burns inside—eight hours of cozy heat comes from iron powder rapidly doing what?',
    ['Rusting with oxygen', 'Melting into solder', 'Dissolving into vinegar', 'Splitting water vapor'], 0,
    'Rusting a garden gate releases the exact same exothermic heat over years—salt, charcoal, and fine iron dust pack it into one afternoon!'),

  g('CHEMISTRY', 1, 'instant_cold_pack_endothermic_salt_dissolve',
    'Pop the inner water bag of a first-aid cold pack and it turns icy fast—dissolving salt crystals steals heat in what reaction type?',
    ['Exothermic combustion', 'Endothermic reaction', 'Galvanic plated cell', 'Catalytic cracking'], 1,
    'Pulling ammonium nitrate or urea ions apart into water demands energy stolen straight out of the water—chilling sprained ankles fast!'),

  g('CHEMISTRY', 2, 'micellar_water_oil_loving_tails_inside',
    'Makeup-removing "micellar water" lifts waterproof mascara without greasy rinsing because surfactant spheres tuck oil-loving tails where?',
    ['Sticking straight outward', 'Floating flat on top', 'Pointed inward', 'Sunk at bottle bottom'], 2,
    'Swipe a cotton pad across skin and micelles pop open—oil-hungry tails grab waterproof mascara while water-loving heads glide cleanly!'),

  g('CHEMISTRY', 2, 'blue_led_gallium_nitride_white_phone_flash',
    'Red and green LEDs came decades earlier—white phone flashlights waited until 1990s breakthroughs grew gallium-nitride LEDs glowing what?',
    ['Warm amber gold', 'Deep ultraviolet', 'Vibrant magenta', 'Dazzling royal blue'], 3,
    'Winning the 2014 Physics Nobel, bright blue LEDs coated with yellow phosphor finally unlocked energy-sipping white bulbs and screens!'),

  g('CHEMISTRY', 2, 'carbfix_iceland_co2_soda_water_basalt_stone',
    'At Iceland’s Carbfix plant, captured CO2 is fizzed into water and pumped into volcanic basalt, turning within two years into solid what?',
    ['Carbonate stone', 'Liquid crude oil', 'Crystalline sulfur', 'Pure graphite seams'], 0,
    'Calcium and magnesium inside porous basalt react with fizzy water to lock greenhouse carbon permanently underground as pale calcite!'),

  g('CHEMISTRY', 3, 'mofs_sponge_crystals_desert_air_water',
    'One gram of porous MOF crystals unfolds to a soccer field’s area—letting new harvesters wring pure drinking water straight from what?',
    ['Salty ocean spray', 'Arid desert night air', 'Cactus root bark', 'Boiling geyser steam'], 1,
    'Pioneered by Omar Yaghi, cage-like metal-linker crystals trap scarce water molecules at night and release pure drops under morning sun!'),

  g('CHEMISTRY', 1, 'luminol_crime_scene_iron_hemoglobin_glow',
    'Spray scrubbed floors on crime shows and hidden stains glow eerie blue—which metal atom inside trace blood catalyzes luminol?',
    ['Plasma zinc ions', 'Saliva calcium', 'Hemoglobin iron', 'Sweat sodium chloride'], 2,
    'Even blood diluted 100,000-fold years later leaves enough iron behind to trigger hydrogen-peroxide chemiluminescence in the dark!'),

  g('CHEMISTRY', 1, 'skincare_vitamin_c_amber_glass_oxidation',
    'Leave a clear bottle of Vitamin C skin serum on a sunny sink and it turns dark orange—brown amber glass slows light-driven what?',
    ['Glycerin freezing', 'Alcohol fermentation', 'Collagen clotting', 'Serum oxidation'], 3,
    'Just like a sliced apple browning on the counter, ascorbic acid donates electrons eagerly to oxygen and light—losing potency as it yellows!'),

  g('CHEMISTRY', 2, 'breathalyzer_fuel_cell_ethanol_electric_current',
    'Modern police breathalyzers ditched color vials: platinum plates oxidize exhaled alcohol into acetic acid to measure a tiny what?',
    ['Electric current', 'Audible whistle pitch', 'Laser color shift', 'Barometric pressure drop'], 0,
    'Every ethanol molecule stripped of electrons at the anode feeds a miniature fuel cell—more breath alcohol drives higher microamps!'),

  g('CHEMISTRY', 1, 'mayonnaise_egg_yolk_lecithin_emulsifier',
    'Oil and vinegar separate in seconds—whisking one egg yolk into mayonnaise locks them into creamy harmony via emulsifying what?',
    ['Whipped albumen foam', 'Egg-yolk lecithin', 'Crystalline shell lime', 'Carotenoid yellow dye'], 1,
    'Each lecithin molecule has a water-loving head and an oil-loving tail—wrapping microscopic oil droplets so they cannot merge!'),

  g('CHEMISTRY', 1, 'oat_milk_amylase_enzymes_natural_sweetness',
    'Why does "unsweetened" oat milk list natural sugars on the carton? Makers splash oats with enzymes that snip starch into sweet what?',
    ['Cane sucrose crystals', 'Honey fructose drops', 'Simple maltose sugars', 'Maple xylitol sap'], 2,
    'Borrowed from brewing science, amylase enzymes liquefy thick oatmeal porridge into silky milk while unlocking gentle malt sweetness!'),

  g('CHEMISTRY', 2, 'lithium_carbonate_salar_uyuni_turquoise_ponds',
    'Satellite views of Bolivia’s Salar de Uyuni show turquoise pools where sun evaporates brine for months to harvest battery what?',
    ['Cobalt blue oxides', 'Refined silicon wafers', 'Pure copper cathodes', 'Lithium carbonate salts'], 3,
    'Over half the world’s known lithium sits dissolved beneath high Andean salt flats in Bolivia, Chile, and Argentina’s "Lithium Triangle"!'),

  g('CHEMISTRY', 1, 'scratch_and_sniff_microcapsules_rupture',
    'Scratch a sticker book and strawberry scent wafts up years later—fragrance oil stays sealed until your nail pops tiny polymer what?',
    ['Scent microcapsules', 'Wax honeycomb cells', 'Hollow glass reeds', 'Porous chalk sponges'], 0,
    'Adapted from 3M carbonless copy-paper chemistry in 1965, microscopic spheres keep volatile aromas from evaporating off the page!'),

  g('CHEMISTRY', 2, 'sunscreen_zinc_oxide_lifeguard_nano_clear',
    '1980s lifeguards wore white noses because coarse zinc oxide scattered light—modern mineral sunscreens rub clear by milling zinc to what?',
    ['Flat hexagonal flakes', 'Nanometer scale', 'Liquid oil droplets', 'Hollow gel spheres'], 1,
    'Shrunk below ~100 nanometers, zinc oxide particles dodge visible wavelengths (no white clown nose!) while still blocking UV rays!'),

  g('CHEMISTRY', 2, 'helium_shortage_mri_texas_radioactive_rock',
    'Commercial helium isn’t scooped from the sky—escaped balloon gas leaks to space, while new helium forms underground from decaying what?',
    ['Buried coal seams', 'Ancient coral reefs', 'Uranium and thorium', 'Subducted ocean salt'], 2,
    'Alpha particles shot out by radioactive rocks are bare helium nuclei—grabbing two electrons and pooling inside natural-gas domes!'),

  g('CHEMISTRY', 1, 'magic_eraser_melamine_foam_micro_sandpaper',
    'Magic Eraser sponges hold zero soap or bleach—cured melamine foam forms hard micro-struts that scrub wall crayon off like gentle what?',
    ['Static lint magnets', 'Oil-dissolving citrus', 'Enzyme stain eaters', 'Ultra-fine sandpaper'], 3,
    'Soft in your hand like bread, individual melamine filaments are nearly as hard as glass—so never scrub glossy car paint with one!'),

  g('CHEMISTRY', 2, 'tide_pods_pva_water_soluble_film',
    'Why doesn’t liquid detergent melt its own laundry pod in the tub, yet vanishes in the wash? Pod soap contains almost zero free what?',
    ['Unbound water', 'Alkaline builders', 'Floral perfume oils', 'Optical brighteners'], 0,
    'Polyvinyl alcohol (PVA) film dissolves fast in tap water, so pod detergent uses low-water glycerin formulas inside the pouch!'),

  g('CHEMISTRY', 1, 'superglue_cotton_exothermic_smoke_warning',
    'Safety labels warn never to wipe spilled Super Glue with a cotton T-shirt or wool glove—plant fibers cure it so fast the cloth can do what?',
    ['Freeze stiff as ice', 'Smoke and catch fire', 'Turn bright purple', 'Dissolve into jelly'], 1,
    'Hydroxyl groups covering cotton cellulose trigger runaway exothermic curing in cyanoacrylate—puffing acrid white smoke in seconds!'),

  g('CHEMISTRY', 1, 'hand_sanitizer_sixty_percent_alcohol_lipid',
    'Health agencies stress pocket hand sanitizer needs at least what percentage of alcohol to pop viral outer coats effectively?',
    ['20 percent', '40 percent', '60 percent', '99.9 percent pure'], 2,
    'Surprisingly, 70% rubbing alcohol beats 99% pure alcohol against bacteria too—a splash of water keeps surface proteins from sealing shut!',
    { numeric: { target: 60, min: 10, max: 100, step: 5, unit: '%' } }),

  g('CHEMISTRY', 1, 'gold_smartphones_ton_of_iphones_richer_ore',
    'A ton of old phones yields ~80x more gold than a ton of gold ore—engineers plate micro-plugs in gold mainly because it never does what?',
    ['Conducts stray heat', 'Bends under thumb taps', 'Blocks Wi-Fi signals', 'Corrodes or tarnishes'], 3,
    'Silver conducts slightly faster, yet thin silver tarnishes—microscopic gold contacts stay oxide-free for a decade in humid pockets!'),

  // --- 1960s–1990s CLASSICS (37 Clues) ---
  g('CHEMISTRY', 1, 'post_it_notes_spencer_silver_weak_microspheres',
    '3M chemist Spencer Silver’s 1968 weak glue sat unused until choir singer Art Fry realized tacky spheres held bookmarks without doing what?',
    ['Tearing hymn pages', 'Smearing black ink', 'Melting in warm pews', 'Curling yellow edges'], 0,
    'Instead of flowing flat into paper fibers permanently, bumpy acrylic microspheres touch only at tiny points—peeling cleanly off!'),

  g('CHEMISTRY', 2, 'gore_tex_bob_gore_1969_yanked_ptfe_rod',
    'When slow stretching snapped heated rods in 1969, Bob Gore yanked one hard—expanding it 800% into breathable waterproof what?',
    ['Ripstop parachute nylon', 'Gore-Tex membrane', 'Neoprene scuba foam', 'Mylar space blankets'], 1,
    'Each square inch of expanded PTFE holds 9 billion pores—20,000 times smaller than a raindrop yet 700 times wider than sweat vapor!'),

  g('CHEMISTRY', 1, 'cfc_ozone_hole_molina_rowland_1974',
    'Winning the 1995 Nobel, Molina and Rowland warned in 1974 that spray-can CFCs drifted miles upward to shred Earth’s what?',
    ['Magnetic Van Allen belt', 'Jet-stream cloud deck', 'Upper ozone shield', 'Ionosphere radio bounce'], 2,
    'One UV-snipped chlorine atom from freon catalytically destroys 100,000 ozone molecules—spurring the 1987 Montreal Protocol treaty!'),

  g('CHEMISTRY', 2, 'aspartame_1965_schlatter_licked_finger',
    'Making ulcer drugs in 1965, chemist James Schlatter broke lab rules by licking his finger to lift paper—discovering diet soda’s what?',
    ['Splenda sucralose', 'Stevia leaf extract', 'Monk-fruit mogroside', 'Aspartame'], 3,
    'Built from two ordinary amino acids (aspartic acid and phenylalanine), aspartame packs 200x table sugar’s sweetness per pinch!'),

  g('CHEMISTRY', 1, 'mood_ring_1975_thermotropic_liquid_crystals',
    '1975’s blockbuster "Mood Ring" craze didn’t read emotions—cold vs. warm fingers twisted hollow stones filled with heat-sensitive what?',
    ['Liquid crystals', 'Crushed tourmaline', 'Litmus dye droplets', 'Phosphor watch paint'], 0,
    'Tense hands pull blood inward (cooling rings dark), while relaxed warm fingers twist liquid-crystal pitch to reflect indigo-violet!'),

  g('CHEMISTRY', 1, 'polarized_sunglasses_edwin_land_iodine_film',
    'Young inventor Edwin Land cut blinding highway glare in 1929 by stretching plastic sheets doped with light-combing needles of what?',
    ['Crushed rock salt', 'Aligned iodine crystals', 'Liquid silver bromide', 'Powdered blue cobalt'], 1,
    'Stretched parallel like microscopic Venetian blinds, Polaroid’s iodine-PVA chains absorb horizontally bouncing road and water glare!'),

  g('CHEMISTRY', 2, 'scotchgard_patsy_sherman_1953_canvas_sneaker',
    '3M chemist Patsy Sherman co-invented stain-blocking Scotchgard after a lab assistant accidentally splashed fluoropolymer onto a white what?',
    ['Starched lab coat', 'Silk wedding necktie', 'Canvas tennis sneaker', 'Linen cafeteria napkin'], 2,
    'Weeks later, the rest of the shoe had turned grimy gray except one spotless white splash—resisting oil, water, and harsh soap!'),

  g('CHEMISTRY', 3, 'clair_patterson_clean_room_leaded_gasoline',
    'Dating Earth’s age to 4.55 billion years via meteorites, Clair Patterson built the first clean room and exposed fallout from what?',
    ['Coal-plant mercury ash', 'Peeling battleship paint', 'Soldered soup cans', 'Leaded car gasoline'], 3,
    'Greenland ice cores proved atmospheric lead had spiked 100-fold from tetraethyl-lead fuel—fueling Patterson’s fight for unleaded gas!'),

  g('CHEMISTRY', 3, 'dorothy_hodgkin_1964_nobel_xray_b12',
    'Dorothy Crowfoot Hodgkin won solo 1964 Chemistry Nobel honors for X-ray crystal maps of penicillin, insulin, and cobalt-centered what?',
    ['Vitamin B12', 'Folic prenatal acid', 'Ascorbic citrus C', 'Retinol night-sight A'], 0,
    'With 181 atoms arranged around a central cobalt ring, B12 was the most complex molecule ever solved by crystallography in the 1950s!'),

  g('CHEMISTRY', 2, 'mattel_1976_slime_guar_gum_borax',
    'Sold in mini green plastic trash cans in 1976, Mattel’s oozing Slime cross-linked laundry borax with which plant-bean thickener?',
    ['Roasted carob flour', 'Guar bean gum', 'Arrowroot tuber starch', 'Agar red-kelp jelly'], 1,
    'Borate ions form self-healing bridges between guar chains—oozing slowly between fingers yet snapping cleanly when yanked fast!'),

  g('CHEMISTRY', 2, 'cryo_em_2017_nobel_vitreous_flash_ice',
    'Winning the 2017 Chemistry Nobel, cryo-electron microscopy plunge-freezes proteins in cold ethane so water forms crystal-free what?',
    ['Dry snow powder', 'Hexagonal frost spikes', 'Glassy vitreous ice', 'Pressurized slush'], 2,
    'Ordinary slow freezing grows sharp ice crystals that shred delicate viral spikes—flash-cooling traps molecules smoothly in glass-like water!'),

  g('CHEMISTRY', 2, 'willard_libby_1960_nobel_carbon_14_clock',
    'Willard Libby won the 1960 Nobel by turning radioactive Carbon-14 into an archaeological clock reliable back how many millennia?',
    ['2 millennia', '10 short millennia', '250 millennia', '50 millennia'], 3,
    'With a 5,730-year half-life, decaying Carbon-14 dates Ice-Age campfires and Dead Sea Scrolls—though dinosaurs are far too old!',
    { numeric: { target: 50, min: 5, max: 120, step: 5, unit: 'millennia' } }),

  g('CHEMISTRY', 1, 'lava_lamp_1963_wax_density_flip',
    'Invented in 1963, a Lava Lamp’s blobs rise and sink lazily because a bottom bulb warms weighted wax until it is less dense than what?',
    ['Surrounding water mix', 'Trapped top air pocket', 'Coiled steel wire', 'Tinted glass bottle'], 0,
    'Plain wax floats forever on water—chlorinated paraffin weights it just heavier when cool so a tiny heat nudge flips buoyancy!'),

  g('CHEMISTRY', 2, 'nomex_dupont_1967_firefighter_race_suits',
    'Adopted after 1960s pit fires, DuPont’s flame-resistant Nomex protects F1 drivers and firefighters because intense heat makes it do what?',
    ['Evaporate into cool mist', 'Char and thicken stiffly', 'Reflect light like chrome', 'Sweat fireproof silicone'], 1,
    'Whereas ordinary nylon melts dangerously onto skin, meta-aramid Nomex swells and carbonizes into an insulating thermal barrier!'),

  g('CHEMISTRY', 1, 'm_and_ms_carnauba_palm_wax_polish',
    'Why do M&M’s and jellybeans gleam without sticking together in warm hands? Makers buff shells in a micro-coat of Brazilian palm what?',
    ['Refined beeswax comb', 'Lanolin wool grease', 'Carnauba wax', 'Cocoa-husk shellac'], 2,
    'Harvested from desert palm fronds in Brazil, food-grade carnauba melts above 180°F—also shining surfboards and vintage Ferraris!'),

  g('CHEMISTRY', 3, 'taxol_pacific_yew_bark_english_needles',
    'Cancer drug Taxol nearly stripped slow-growing Pacific yew bark bare until 1990s chemists synthesized it cleanly from yew what?',
    ['Fallen autumn pinecones', 'Tapped spring tree sap', 'Dropped root mushrooms', 'Clipped green needles'], 3,
    'Robert Holton’s semi-synthetic route let crews shear ornamental English yew hedges harmlessly instead of felling 200-year-old trees!'),

  g('CHEMISTRY', 2, 'miller_urey_1953_spark_amino_acids',
    'Zapping water, methane, ammonia, and hydrogen with sparks in glass, the Miller-Urey test turned brown within days with life’s what?',
    ['Broth of amino acids', 'Double-stranded DNA', 'Swimming green algae', 'Folded cell membranes'], 0,
    'Re-testing Stanley Miller’s sealed 1950s vials decades later with modern mass spectrometers revealed over 20 distinct amino acids!'),

  g('CHEMISTRY', 1, 'shrinky_dinks_1973_polystyrene_number_6',
    'Colored by kids since 1973 and baked until shrinking nine times thicker, Shrinky Dinks are sheets of stretched #6 plastic called what?',
    ['Flexible PVC vinyl', 'Polystyrene plastic', 'Milk-jug polyethylene', 'Acrylic Plexiglas'], 1,
    'Factories stretch heated polystyrene flat and chill it "frozen" in tension—oven heat lets tangled polymer chains snap right back!'),

  g('CHEMISTRY', 1, 'pet_soda_bottle_1973_wyeth_carbonation',
    'Early plastic bottles bulged under fizz until DuPont’s Nathaniel Wyeth patented tough two-way-stretched PET in 1973 to hold what?',
    ['Boiling tomato soup', 'Pure rubbing alcohol', 'Soda carbonation', 'Bleach laundry soap'], 2,
    'Blowing hot PET lengthwise and sideways aligned polymer chains into a featherweight, shatterproof mesh strong enough for 60-psi cola!'),

  g('CHEMISTRY', 2, 'saran_wrap_1953_army_jungle_boot_spray',
    'Lab worker Ralph Wiley found clingy Saran plastic while scrubbing green film off vials meant to shield planes from salty what?',
    ['Sahara desert sandstorms', 'High-altitude ozone', 'Arctic runway slush', 'Corrosive sea spray'], 3,
    'Before wrapping kitchen bowls in 1953, green Saran coatings protected WWII aircraft engines shipped across salt oceans!'),

  g('CHEMISTRY', 2, 'linus_pauling_only_two_unshared_nobels',
    'Chemist Linus Pauling holds a solo record—winning the 1954 Chemistry Nobel for bonds and a second unshared Nobel in 1962 for what?',
    ['Nuclear test peace', 'Polio vaccine rollout', 'Curing common colds', 'Literature memoirs'], 0,
    'Collecting 11,000 scientists’ signatures showing radioactive fallout in baby teeth helped spur the 1963 Partial Test Ban Treaty!'),

  g('CHEMISTRY', 1, 'astro_turf_1966_houston_astrodome_dead_grass',
    'Monsanto’s "ChemGrass" became famous as AstroTurf in 1966 after anti-glare roof paint inside Houston’s Astrodome killed what?',
    ['Bleacher concession ivy', 'Natural infield grass', 'Potted palm bullpens', 'Clover warning tracks'], 1,
    'Outfielders lost fly balls in sunny skylights—painting the dome fixed the glare, starved the Bermuda grass, and birthed stadium turf!'),

  g('CHEMISTRY', 1, 'liquid_paper_bette_nesmith_graham_tempera',
    'Typist Bette Nesmith Graham blended "Mistake Out"—later Liquid Paper—after watching bank painters cover errors with white what?',
    ['Chalkboard dust paste', 'Melted white crayon', 'Water-based tempera', 'Bleached flour glue'], 2,
    'With help from her son’s chemistry teacher (and future Monkees star son Michael Nesmith!), she sold Liquid Paper for $47.5 million!'),

  g('CHEMISTRY', 2, 'velveeta_sodium_citrate_smooth_nacho_melt',
    'Aged cheddar splits into greasy pools on nachos unless cooks add "melting salt"—which citrus-linked salt keeps cheese sauces silky?',
    ['Baking-soda carbonate', 'Epsom magnesium salt', 'Cream of tartar powder', 'Sodium citrate'], 3,
    'Invented in 1911 Switzerland for fondue, sodium citrate swaps calcium out of casein proteins so fat and water stay smoothly blended!'),

  g('CHEMISTRY', 2, 'skunk_odor_peroxide_baking_soda_krebaum',
    'After tomato juice failed, chemist Paul Krebaum shared the real 1993 skunk-spray cure: baking soda, soap, and peroxide kill stinky what?',
    ['Sulfur thiols', 'Sour butyric fats', 'Fishy amine oils', 'Skatole ring tars'], 0,
    'Tomato juice merely tires out human noses—alkaline peroxide bolts heavy oxygen atoms onto volatile thiols to turn them odorless!'),

  g('CHEMISTRY', 1, 'caffeine_insecticide_plant_defense_evolution',
    'Coffee, tea, and cacao plants evolved caffeine independently—not to wake commuters, but as a natural defense to paralyze what?',
    ['Root-rot soil molds', 'Leaf-chewing insects', 'Grazing mountain goats', 'Strangling climbing vines'], 1,
    'Tiny flower doses gently boost honeybee memory for repeat visits, while bitter leaf doses scramble hungry caterpillar nerves!'),

  g('CHEMISTRY', 3, 'breath_mints_wintergreen_triboluminescence',
    'Crunch a Wint-O-Green Life Savers candy with open jaws in a dark bathroom mirror and fracturing sugar fires blue flashes of what?',
    ['Peppermint vapor mist', 'Static hair crackles', 'Triboluminescent sparks', 'Chemiluminescent glow'], 2,
    'Crushing sucrose crystals rips charges apart like tiny lightning in air—and wintergreen oil converts UV into bright blue flashes!'),

  g('CHEMISTRY', 1, 'tupperware_earl_tupper_paint_can_burp_seal',
    'Chemist Earl Tupper tamed polyethylene into pastel kitchen bowls—modeling his airtight "burping" lid upside down after a what?',
    ['Mason-jar zinc ring', 'Corked wine bottle', 'Submarine hatch wheel', 'Paint-can lid'], 3,
    'Before home refrigerators had humidity crispers, flexing one rim to "burp" air out kept leftovers fresh days longer!'),

  g('CHEMISTRY', 3, 'instant_polaroid_sx70_ten_chemical_layers',
    'Ejecting dry into bright 1972 sun, Polaroid SX-70 prints developed right before your eyes behind an opaque dye curtain of what?',
    ['Titanium white + dye', 'Colloidal silver foil', 'Powdered charcoal ink', 'Amber shellac varnish'], 0,
    'Edwin Land called this "optical darkroom" dye his proudest chemistry feat—blocking sun in alkali, then turning clear as acid rose!'),

  g('CHEMISTRY', 3, 'catalytic_cloud_seeding_silver_iodide_hex',
    'Chemist Bernard Vonnegut—novelist Kurt’s brother!—launched cloud seeding in 1946 after spotting silver iodide matches six-sided what?',
    ['Table-salt cubes', 'Natural ice crystals', 'Quartz sand prisms', 'Gypsum desert roses'], 1,
    'Kurt Vonnegut’s sci-fi classic "Cat’s Cradle" ("ice-nine") grew straight out of watching Bernard seed supercooled clouds at GE!'),

  g('CHEMISTRY', 1, 'nylon_stocking_name_new_york_london_myth',
    'DuPont unveiled Nylon at the 1939 World’s Fair—debunking the persistent urban legend that "NYLON" stood for New York and where?',
    ['Los Angeles, Calif.', 'Lisbon, Portugal', 'London, England', 'Lyon, France'], 2,
    'Executives actually bounced "No-Run" backward into "Nuron" and "Nilon" before settling on crisp "Nylon" with zero city acronym!'),

  g('CHEMISTRY', 1, 'fluoride_colorado_brown_stain_cavity_shield',
    'Dentist Frederick McKay’s hunt into why Colorado kids had mottled teeth yet almost zero cavities led cities to add trace water what?',
    ['Calcium chalk dust', 'Iodized sea salt', 'Chloramine bleach', 'Fluoride ions'], 3,
    'Swapping hydroxyl groups for fluoride turns tooth enamel into acid-resistant fluorapatite—slashing childhood cavities at 0.7 ppm!'),

  g('CHEMISTRY', 1, 'spandex_lycra_1958_shivers_disco_stretch',
    'Invented at DuPont in 1958 and named as an anagram of "expands," which stretchy fiber powered 1970s disco and 1980s aerobics?',
    ['Stretchy spandex', 'Wrinkle-free Dacron', 'Fuzzy acrylic Orlon', 'Waterproof rayon'], 0,
    'Rubber waistbands rotted in sweat and dryer heat—segmented polyurethane spandex ("Lycra") stretched 500% and snapped right back!'),

  g('CHEMISTRY', 2, 'pop_top_aluminum_can_inner_polymer_liner',
    'Why doesn’t acidic cola eat right through thin aluminum cans in days? Every beverage can hides an invisible sprayed inner what?',
    ['Waxed tissue sleeve', 'Clear polymer liner', 'Tin-foil electroplate', 'Silicone grease mist'], 1,
    'Dissolve an aluminum soda can’s outside metal cautiously in lab demos and a transparent, leak-free plastic pouch of soda remains!'),

  g('CHEMISTRY', 1, 'cheetos_extruded_cornmeal_puff_steam_flash',
    'Squeeze damp cornmeal through a hot high-pressure nozzle and sudden steam expansion puffs airy foam sticks for what snack?',
    ['Kettle potato chips', 'Twisted hard pretzels', 'Cheese corn puffs', 'Salted sesame sticks'], 2,
    'Invented from livestock-feed grain extruders, flashing superheated moisture freezes crunchy starch bubbles in milliseconds!'),

  g('CHEMISTRY', 3, 'tritium_watch_dials_twelve_year_half_life',
    'Replacing hazardous radium paint in the 1960s, dive watches and exit signs use tritium gas—whose glow halves roughly every how many years?',
    ['2 short years', '30 years', '85 long years', '12 years'], 3,
    'Gentle tritium beta electrons cannot pierce glass or skin—powering battery-free emergency "EXIT" signs for over a decade!',
    { numeric: { target: 12, min: 1, max: 50, step: 1, unit: 'years' } }),

  g('CHEMISTRY', 2, 'road_flare_strontium_nitrate_rain_burn',
    'Highway flares keep burning bright red even under pouring rain because strontium nitrate packs crimson color plus its own what?',
    ['Solid oxidizer', 'Waterproof kerosene', 'Magnesium battery', 'Pressurized propane'], 0,
    'Campfires smother without outside air, whereas pyrotechnic nitrate salts release internal oxygen atoms right inside the flame!'),

  // --- GEMS, KITCHEN SCIENCE & TIMELESS WORLD HISTORY (27 Clues) ---
  g('CHEMISTRY', 1, 'ruby_and_sapphire_identical_corundum_chromium',
    'Red rubies and blue sapphires are the exact same corundum mineral—a ruby turns fiery blood-red from trace atoms of what?',
    ['Oxidized copper', 'Trace chromium', 'Tarnished silver', 'Sulfur crystals'], 1,
    'Pure corundum is 100% colorless! Add 1% chromium for ruby—and every other color of corundum on Earth is officially sapphire!'),

  g('CHEMISTRY', 3, 'alexandrite_emerald_by_day_ruby_by_night',
    'Found in Russia’s Ural Mountains in the 1830s, which rare color-shifting gem earned the nickname "emerald by day, ruby by night"?',
    ['Banded malachite', 'Smoky topaz quartz', 'Alexandrite', 'Star peridot'], 2,
    'Chromium ions in chrysoberyl sit on an optical knife-edge—looking forest green in blue-rich sunlight and red under warm candle flames!'),

  g('CHEMISTRY', 2, 'precious_opal_stacked_silica_spheres_water',
    'Unlike faceted diamonds, precious opals flash rainbow fire from microscopic stacked silica spheres holding up to 10% trapped what?',
    ['Liquid mercury', 'Volcanic methane', 'Dissolved gold dust', 'Internal water'], 3,
    'Spacing between uniform silica spheres diffracts light like a peacock feather—and bone-dry bank vaults can make opals crack!'),

  g('CHEMISTRY', 2, 'cleopatra_pearl_banquet_vinegar_calcium',
    'Pliny wrote that Cleopatra won a banquet wager against Mark Antony by dissolving a priceless pearl earring in a goblet of what?',
    ['Sour wine vinegar', 'Boiling olive oil', 'Sweet fig honey', 'Salted Nile water'], 0,
    'Chemists tested Pliny’s tale: acetic acid in warm vinegar fizzes calcium-carbonate nacre into calcium acetate and CO2 bubbles!'),

  g('CHEMISTRY', 2, 'cobalt_goblin_kobold_german_silver_miners',
    'Saxon miners cursed blue ore as "Kobold" (goblin) because smelting yielded zero silver and released garlic-smelling fumes of what?',
    ['Choking chlorine', 'Deadly arsenic', 'Rotten hydrogen gas', 'Sweet laughing gas'], 1,
    'Before Georg Brandt isolated metallic cobalt in 1735, potters from Persia to Ming China prized "goblin" ore for royal blue glazes!'),

  g('CHEMISTRY', 2, 'nickel_kupfernickel_old_nicks_fake_copper',
    'Element #28 got its name from miners cursing reddish ore as "Kupfernickel" ("Old Nick’s copper") because it yielded zero what?',
    ['Malleable gold leaf', 'Magnetic lodestone', 'Workable copper', 'Heavy lead shot'], 2,
    'Today a US five-cent "nickel" coin is actually 75% real copper and only 25% nickel—giving Old Nick the last laugh after all!'),

  g('CHEMISTRY', 2, 'joseph_priestley_1767_brewery_vat_soda_water',
    'Living beside a Leeds brewery in 1767, Joseph Priestley invented fizzy soda water by hanging water bowls above vats of what?',
    ['Boiling soap tallow', 'Tanning oak bark', 'Pickled herring brine', 'Fermenting beer'], 3,
    'Heavy carbon dioxide blanketed the brewing mash—pouring water back and forth through that gas layer birthed the soft-drink industry!'),

  g('CHEMISTRY', 1, 'pineapple_jello_wont_set_collagen_enzyme',
    'Gelatin box labels warn never to fold fresh pineapple or kiwi into Jell-O—fruit enzymes snip gelatin chains unless fruit is what?',
    ['Cooked or canned', 'Salted overnight', 'Chilled on crushed ice', 'Peeled with silver'], 0,
    'Canning heat denatures bromelain (pineapple) and actinidin (kiwi) enzymes permanently so collagen networks can gel into dessert!'),

  g('CHEMISTRY', 1, 'paper_bag_banana_ethylene_avocado_ripening',
    'Tucking a hard avocado inside a folded paper bag with a ripe banana softens it fast by trapping which gaseous plant hormone?',
    ['Peppermint ozone', 'Ethylene vapor', 'Marsh methane gas', 'Ammonia mist'], 1,
    'One bruised apple really does spoil the barrel—stressed fruit pumps out sweet ethylene gas that signals neighbors to ripen fast!'),

  g('CHEMISTRY', 1, 'baking_powder_vs_baking_soda_built_in_acid',
    'Swap baking soda for baking powder without lemon or buttermilk and pancakes stay flat—baking powder already mixes soda with what?',
    ['Powdered egg whites', 'Granulated cane sugar', 'Dry powdered acid', 'Fine cornmeal grit'], 2,
    '"Double-acting" baking powder fizzes once when wet in the bowl and again when oven heat melts high-temperature acid crystals!'),

  g('CHEMISTRY', 1, 'hydrogen_peroxide_brown_bottle_blood_catalase',
    'Pour peroxide onto a scraped knee and white foam fizzes instantly—your blood’s catalase enzyme rips H2O2 into water and what?',
    ['Salty chlorine mist', 'Sterile ozone gas', 'Fizzy carbon dioxide', 'Pure oxygen bubbles'], 3,
    'Peroxide comes in dark brown bottles because bathroom sunlight slowly triggers that exact same breakdown into plain water!'),

  g('CHEMISTRY', 1, 'never_mix_bleach_and_ammonia_chloramine',
    'Cleaner labels warn NEVER to mix chlorine bleach with ammonia—combining them in a bathroom immediately releases toxic clouds of what?',
    ['Chloramine vapors', 'Mustard sulfur gas', 'Carbon monoxide', 'Nitrous laughing gas'], 0,
    'Mixing bleach with acidic toilet cleaner or vinegar is equally dangerous—unleashing greenish-yellow chlorine gas!'),

  g('CHEMISTRY', 1, 'red_cabbage_anthocyanin_homemade_ph_rainbow',
    'Simmer purple cabbage and its water acts as a kitchen pH indicator—turning pink in vinegar and greenish-blue with a spoon of what?',
    ['Kosher table salt', 'Baking soda', 'White cane sugar', 'Cream of tartar'], 1,
    'Anthocyanin pigments—also coloring blueberries and autumn maples—reshape their light-absorbing rings whenever acidity shifts!'),

  g('CHEMISTRY', 3, 'chocolate_tempering_form_v_crystal_snap',
    'To prevent white streaks and give dark chocolate a glossy "SNAP!", chocolatiers temper cocoa butter into Crystal Form what?',
    ['Form 1 soft crystals', 'Form 3 waxy crystals', 'Form 5 crystals', 'Form 9 hard crystals'], 2,
    'Cocoa butter crystallizes six ways—only Form V (~34°C melt point) stays crisp in fingers yet melts silky-smooth at 37°C body heat!',
    { numeric: { target: 5, min: 1, max: 10, step: 1, unit: 'form' } }),

  g('CHEMISTRY', 1, 'sidewalk_rock_salt_freezing_point_depression',
    'Spreading rock salt on an icy stoop doesn’t warm the snow—dissolved salt ions crowd water molecules to lower water’s what?',
    ['Surface evaporation', 'Thermal conductivity', 'Liquid viscosity', 'Freezing temperature'], 3,
    'Salty slush stays liquid down near -21°C (-6°F)—which is also how hand-cranked ice-cream buckets chill custard below 32°F!'),

  g('CHEMISTRY', 2, 'asparagus_wee_fifteen_minutes_olfactory_anosmia',
    'Asparagus sulfur turns urine pungent in 15 minutes—yet over half of diners swear theirs is odorless because they lack what?',
    ['Matching smell genes', 'Stomach pepsin acid', 'Kidney sulfur filters', 'Bile gallbladder salts'], 0,
    'Nearly everyone brews volatile methanethiol from asparagusic acid—specific "asparagus anosmia" keeps lucky noses unaware!'),

  g('CHEMISTRY', 2, 'antoine_lavoisier_mass_conservation_oxygen',
    'Weighing sealed flasks in 1770s Paris, Antoine Lavoisier killed "phlogiston" myths by proving rusting metal gains mass from what?',
    ['Absorbed fire heat', 'Captured air oxygen', 'Glass silica dust', 'Earth’s gravity pull'], 1,
    'Alongside Marie-Anne Paulze Lavoisier’s meticulous lab drawings, proving mass conservation launched modern chemistry!'),

  g('CHEMISTRY', 1, 'karat_gold_24_pure_carob_bean_seeds',
    'Ancient traders weighed coins against uniform carob-tree seeds—setting 100% pure elemental gold at what top karat number?',
    ['14 karats', '18 fine karats', '24 karats', '100 karats'], 2,
    'A "14-karat" wedding band is 14 parts pure gold alloyed with 10 parts copper, silver, or zinc so daily wear won’t bend it!',
    { numeric: { target: 24, min: 10, max: 40, step: 1, unit: 'karats' } }),

  g('CHEMISTRY', 1, 'sterling_silver_925_hallmark_copper_strength',
    'A tiny "925" stamp inside a sterling silver ring guarantees 92.5% pure silver hardened for everyday wear with 7.5% what?',
    ['Brushed nickel', 'White zinc metal', 'Polished tin', 'Alloyed copper'], 3,
    'Pure 99.9% fine silver scratches with a fingernail—a dash of copper has stiffened British sterling coinage since the 1100s!'),

  g('CHEMISTRY', 3, 'ambergris_sperm_whale_oxidized_perfume_gold',
    'Worth thousands to luxury French perfumers, sweet-musky "ambergris" ages at sea after forming around squid beaks inside what?',
    ['Sperm whales', 'Giant manta rays', 'Basking filter sharks', 'Leatherback turtles'], 0,
    'Foul when fresh, floating ambergris oxidizes over years in ocean sun into sweet ambrein—anchoring fleeting floral perfume notes!'),

  g('CHEMISTRY', 2, 'mercury_mad_hatter_carroting_beaver_felt',
    'Lewis Carroll’s "Mad Hatter" echoed a real Victorian hazard: hatters developed tremors from steaming beaver fur brushed with what?',
    ['Arsenic green dye', 'Mercury nitrate', 'White lead chalk', 'Yellow phosphorus'], 1,
    'Called "carroting" because fur edges turned orange, breathing warm mercury vapors caused shyness and "hatter’s shakes"!'),

  g('CHEMISTRY', 2, 'soap_saponification_wood_ash_lye_animal_fat',
    'Before bottled body wash, frontier families boiled water leached through hardwood ashes with kitchen fat to trigger soap-making what?',
    ['Ester fermentation', 'Fractional cracking', 'Saponification', 'Steam distillation'], 2,
    'Alkaline potash snips triglyceride fats into soothing glycerin plus soap molecules that bridge stubborn grease and wash water!'),

  g('CHEMISTRY', 1, 'champagne_cork_six_atmospheres_truck_tire',
    'Aim New Year’s bottles safely! Trapped carbonation in a Champagne bottle pushes out at ~90 psi—roughly triple the pressure in what?',
    ['A scuba air tank', 'A pro soccer ball', 'Hospital oxygen lines', 'A passenger car tire'], 3,
    'Popping an unchilled Champagne cork can launch it past 35 mph—chilling to 45°F keeps far more CO2 calmly dissolved in the wine!'),

  g('CHEMISTRY', 3, 'quicksilver_gold_amalgam_mining_pan',
    'Forty-Niners poured liquid mercury into sluice boxes because mercury dissolves gold flecks on contact into a paste called what?',
    ['Metal amalgam', 'Fool’s matte slag', 'Galena bullion', 'Pewter solder'], 0,
    'Iron refuses to amalgamate with mercury—which is why laboratories still ship heavy liquid quicksilver safely inside steel flasks!'),

  g('CHEMISTRY', 1, 'ph_neutral_pure_water_seven_midpoint',
    'Stretching from battery acid near 0 up to lye at 14, chemistry’s pH scale parks pure room-temperature water at what number?',
    ['0 neutral point', '7 on the scale', '10 mild midpoint', '5 rainwater mark'], 1,
    'Each whole step on Sørensen’s logarithmic pH scale is a tenfold jump—making pH 3 grapefruit juice 10,000x more acidic than water!',
    { numeric: { target: 7, min: 0, max: 14, step: 1, unit: 'pH' } }),

  g('CHEMISTRY', 1, 'mohs_hardness_talc_one_to_diamond_ten',
    'Friedrich Mohs ranked mineral scratch resistance in 1812 from soft talc at #1 all the way up to diamond at what top number?',
    ['5 on Mohs scale', '20 on Mohs scale', '10 on Mohs scale', '100 on Mohs scale'], 2,
    'Pocketknives sit near 5.5 and household quartz dust hits 7—explaining why wiping dusty glasses dry slowly scratches lenses!',
    { numeric: { target: 10, min: 1, max: 20, step: 1, unit: 'Mohs' } }),

  g('CHEMISTRY', 1, 'absolute_alcohol_proof_gunpowder_100_us',
    'In US liquor labeling, "proof" equals double the alcohol percentage—so an 80-proof bourbon bottle holds what percent alcohol?',
    ['20 percent', '80 percent', '160 percent', '40 percent'], 3,
    '17th-century sailors soaked gunpowder in rum as "proof" the purser hadn’t watered it down—gunpowder only lit above ~57% ABV!',
    { numeric: { target: 40, min: 5, max: 100, step: 5, unit: '%' } }),
];
