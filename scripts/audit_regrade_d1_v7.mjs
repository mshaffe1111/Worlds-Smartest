#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.6 Corpus Calibration R3)
// `scripts/audit_regrade_d1_v7.mjs`
//
// Audits ALL 3,653 `difficulty: 1` clues across `public/data/v7/`:
//   - `season_1..4.json`
//   - `pack_primetime_variety_1..4.json`
//
// Re-grades mislabeled academic, medical, pharma, college-science, cyanotype,
// multi-fact patchbay/balance, and niche pre-1950 clues from Tier 1 -> Tiers 2-5
// while preserving `qid`, `stem`, `choices`, `answerIdx`, `ahaFactoid`,
// `canonicalEntityKey`, and all contraption payloads verbatim.
//
// Rebuilds `public/data/v7/boot_pack.json` (1,000 clues: 50 couch-friendly
// Tier 1/2 clues per category across all 20 categories, interleaved round-robin)
// and refreshes `public/data/v7/corpus_manifest.json`.
//
// Usage:
//   node scripts/audit_regrade_d1_v7.mjs --dry-run
//   node scripts/audit_regrade_d1_v7.mjs --apply
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'public/data/v7');
const PACKS_MANIFEST_PATH = path.join(DATA_DIR, 'packs_manifest.json');
const CORPUS_MANIFEST_PATH = path.join(DATA_DIR, 'corpus_manifest.json');
const BOOT_PACK_PATH = path.join(DATA_DIR, 'boot_pack.json');

const ALL_CATEGORIES = [
  'MEDICINE',
  'CHEMISTRY',
  'PHYSICS',
  'GADGETS',
  'ENGINES',
  'LITERATURE',
  'LEXICON',
  'FINE ARTS',
  'SCREEN',
  'JUKEBOX',
  'FINANCE',
  'PRICING',
  'ODDS',
  'ATLAS',
  'SPORTS',
  'DYNASTIES',
  'HEADLINES',
  'FOLKLORE',
  'FALLACIES',
  'CUISINE',
];

// ---------------------------------------------------------------------------
// 1. Curated QID -> { tier, reason } Re-Grade Table
//    Compiled from full-corpus inspection of all 3,653 D1 clues across all
//    20 categories, enforcing the Couch-Friendly Tier 1 Rubric:
//      - Tier 1: Joyful everyday/pop/household or clean 2-path deducible clues.
//      - Tier 2: Fun Medium ("Dinner Party 'Oh Yeah!'") & lighter multi-item.
//      - Tier 3: Solid Medium-Hard (named mechanisms, pre-1950 niche, clinical,
//                dense 3-way matching, or multi-fact arithmetic).
//      - Tier 4: Hard (molecular/pharma/AP-college bio/chem/physics, technical
//                cutaway blueprints, esoteric combinatorics/dates).
//      - Tier 5: Extra Hard (specialist graduate-level / obscure deep cuts).
// ---------------------------------------------------------------------------
const CURATED_REGRADES = {
  // === MEDICINE ===
  // Cyanotypes
  3715: { tier: 4, reason: 'cyanotype_anatomy_valve: Tricuspid inlet valve heart cutaway' },
  3857: { tier: 4, reason: 'cyanotype_anatomy_cardiac: Sinoatrial node pacemaker cluster' },
  8205: { tier: 4, reason: 'cyanotype_anatomy_valve: Mitral valve two-flap cardiac cutaway' },
  8442: { tier: 3, reason: 'cyanotype_anatomy_joint: Meniscus knee pads' },
  8508: { tier: 3, reason: 'cyanotype_anatomy_ent: Eustachian tube canal' },
  8522: { tier: 3, reason: 'cyanotype_anatomy_tendon: Achilles tendon cutaway' },
  // Patchbays
  3848: { tier: 3, reason: 'patchbay_medical: Hematological blood-donor matching' },
  3942: { tier: 3, reason: 'patchbay_medical: Vitamin deficiency diseases + gout' },
  8128: { tier: 2, reason: 'patchbay_hormones: Melatonin / Adrenaline / Insulin' },
  8332: { tier: 2, reason: 'patchbay_pharma: Penicillin / Ozempic / Naloxone' },
  8430: { tier: 3, reason: 'patchbay_devices: Pulse oximeter / Spirometer / Glucometer' },
  8459: { tier: 2, reason: 'patchbay_specialists: Derm / Cardio / Ophthal / Rheum' },
  9581: { tier: 3, reason: 'patchbay_terminology: Greek medical suffixes -itis/-algia/-scopy' },
  10326: { tier: 2, reason: 'patchbay_history: Penicillin / X-ray / Pacemaker accidents' },
  // Balances
  3558: { tier: 3, reason: 'balance_anatomy: Adult teeth 32 multi-fact sum' },
  3849: { tier: 3, reason: 'balance_anatomy: Heart chambers 4 + Lung lobes 5 = 9' },
  8179: { tier: 4, reason: 'balance_biochem: Essential + standard amino acids = 29' },
  8234: { tier: 4, reason: 'balance_hematology: ABO-Rh 8 + ABO 4 = 12' },
  8245: { tier: 3, reason: 'balance_anatomy: Baby teeth 20 + Wisdom teeth 4 = 24' },
  8529: { tier: 4, reason: 'balance_anatomy: Ear ossicles 6 + Adult spine 26 = 32' },
  9445: { tier: 4, reason: 'balance_anatomy: All ribs 24 + Neck/lumbar vertebrae 12 = 36' },
  10501: { tier: 4, reason: 'balance_anatomy: Neck vertebrae 7 + Hand bones 27 = 34' },
  // Semantic Medicine
  8: { tier: 3, reason: 'med_cardiology: AFib atrial chambers' },
  59: { tier: 2, reason: 'med_virology: mRNA spike proteins' },
  167: { tier: 3, reason: 'med_genomics: Human Genome ~20,000 protein-coding genes' },
  305: { tier: 2, reason: 'med_anatomy: Gluteus maximus upright running' },
  325: { tier: 3, reason: 'med_biochem: Sweat lipids -> smelly thioalcohols' },
  438: { tier: 3, reason: 'med_physiology: Naked mole-rat acid pain nerve switch' },
  467: { tier: 2, reason: 'med_genetics: Gregor Mendel 28,000 pea plants' },
  488: { tier: 2, reason: 'med_clinical: Virginia Apgar 10-point newborn score' },
  601: { tier: 2, reason: 'med_anatomy: Rod photoreceptors vs cones' },
  633: { tier: 2, reason: 'med_history: Ignaz Semmelweis 1847 handwashing' },
  653: { tier: 2, reason: 'med_genetics: Mitochondrial DNA maternal inheritance' },
  715: { tier: 2, reason: 'med_anatomy: Middle ear pressure tunnel to throat' },
  779: { tier: 3, reason: 'med_pharma: Narcan brain mu-receptors' },
  806: { tier: 2, reason: 'med_virology: Gardasil HPV shield' },
  866: { tier: 2, reason: 'med_immunology: Tattoo ink cleared by white blood cells' },
  893: { tier: 2, reason: 'med_biotech: CRISPR-Cas9 bacterial viral defense' },
  931: { tier: 2, reason: 'med_physiology: Heimlich residual lung air' },
  984: { tier: 4, reason: 'med_neurobiology: Melanopsin retinal pigment' },
  1030: { tier: 2, reason: 'med_device: Pulse oximeter LED light beams' },
  1038: { tier: 2, reason: 'med_anatomy: Stapes stirrup smallest human bone' },
  1149: { tier: 2, reason: 'med_microbio: Pasteur S-shaped swan-neck flasks' },
  1251: { tier: 5, reason: 'med_pharma: Lenacapavir HIV conical capsid shells' },
  1277: { tier: 3, reason: 'med_zoology: Greenland shark radiocarbon eye lenses' },
  1476: { tier: 2, reason: 'med_history: EpiPen military chemical nerve-agent origin' },
  1510: { tier: 2, reason: 'med_physics: MRI superconducting magnet' },
  6610: { tier: 2, reason: 'med_anatomy: Gluteus maximus largest muscle' },
  6669: { tier: 3, reason: 'med_biotech: PCR Taq polymerase enzyme' },
  6682: { tier: 2, reason: 'med_hematology: AB negative rarest blood type' },
  6710: { tier: 3, reason: 'med_neuro: FlyWire 2024 connectome wiring map' },
  6818: { tier: 3, reason: 'med_genomics: 2022 T2T missing 8% human DNA' },
  6904: { tier: 2, reason: 'med_biotech: AlphaFold 3D protein chain folding' },
  6985: { tier: 3, reason: 'med_microbio: Poliovirus smallest pathogen' },
  6991: { tier: 2, reason: 'med_history: René Laennec 1816 paper stethoscope' },
  7137: { tier: 3, reason: 'med_pharma: GLP-1 gut hormone' },
  7138: { tier: 2, reason: 'med_physiology: Gastric juice lowest pH' },
  8024: { tier: 2, reason: 'med_anatomy: Aorta widest human artery' },
  8057: { tier: 3, reason: 'lasso_anatomy: Dermis, Epidermis, Hypodermis skin layers' },
  8064: { tier: 2, reason: 'med_history: Mayo Clinic Rochester MN 1883' },
  8224: { tier: 2, reason: 'lasso_pharma: Ozempic, Wegovy, Mounjaro GLP-1 drugs' },
  8242: { tier: 3, reason: 'med_epidemiology: John Snow 1854 Broad Street Soho' },
  8287: { tier: 3, reason: 'chrono_med: Surgical Ether 1846 vs X-Rays/Insulin' },
  8295: { tier: 2, reason: 'chrono_med: Bayer Aspirin 1899' },
  8297: { tier: 3, reason: 'chrono_med: Elizabeth Blackwell 1849 first US woman MD' },
  8311: { tier: 2, reason: 'lasso_vaccine: MMR Measles, Rubella, Mumps' },
  8378: { tier: 3, reason: 'med_neuro: Hippocampus memory consolidation' },
  8384: { tier: 3, reason: 'lasso_histology: Cardiac, Smooth, Skeletal muscle tissue' },
  9374: { tier: 3, reason: 'med_pharma: Arexvy May 2023 RSV vaccine' },
  9398: { tier: 3, reason: 'med_biotech: Casgevy Dec 2023 CRISPR-Cas9' },
  9414: { tier: 3, reason: 'lasso_vaccine: DTaP Diphtheria, Tetanus, Pertussis' },
  9446: { tier: 2, reason: 'med_history: Plague doctor beak mask miasma' },
  9499: { tier: 2, reason: 'med_history: Jonas Salk Pittsburgh PA' },
  9556: { tier: 2, reason: 'med_history: Heimlich Maneuver 1974' },
  9566: { tier: 3, reason: 'chrono_med: Einthoven 1901 EKG vs CT/PET/MRI' },
  9608: { tier: 3, reason: 'med_nobel: Katalin Karikó 2023 mRNA Nobel' },
  9631: { tier: 2, reason: 'med_history: Smallpox eradicated 1980' },
  10362: { tier: 2, reason: 'med_clinical: Ishihara color-dot test' },
  10440: { tier: 2, reason: 'med_clinical: Snellen eye chart' },
  10462: { tier: 2, reason: 'med_genetics: Joe Hin Tjio 1956 46 chromosomes' },

  // === CHEMISTRY ===
  // Cyanotypes
  3687: { tier: 5, reason: 'cyanotype_chem_apparatus: Vigreux vapor feed retort' },
  3836: { tier: 4, reason: 'cyanotype_chem_apparatus: Liebig condenser glass jacket' },
  8085: { tier: 3, reason: 'cyanotype_chem_apparatus: Erlenmeyer flask' },
  8166: { tier: 4, reason: 'cyanotype_chem_apparatus: Separatory funnel' },
  8237: { tier: 4, reason: 'cyanotype_chem_apparatus: Buchner suction funnel' },
  8506: { tier: 3, reason: 'cyanotype_chem_apparatus: Bunsen air-vent collar' },
  // Patchbays
  3637: { tier: 3, reason: 'patchbay_chem: Latin/German element symbols Au/W/Pb/Sn' },
  8149: { tier: 3, reason: 'patchbay_mineralogy: Diamond/Ruby/Emerald/Amethyst minerals' },
  8369: { tier: 3, reason: 'patchbay_chem: Noble gas applications He/Ne/Rn/Ar' },
  8456: { tier: 2, reason: 'patchbay_metals: Mercury/Titanium/Lithium/Uranium' },
  8470: { tier: 3, reason: 'patchbay_chem: NaCl/NaHCO3/H2O2 formulas' },
  9310: { tier: 3, reason: 'patchbay_chem: Acetic acid/Ethanol/Caffeine/Carbonic' },
  10464: { tier: 4, reason: 'patchbay_chem: Firework metal salts Barium/Sodium/Strontium/Cobalt' },
  // Balances
  3584: { tier: 4, reason: 'balance_atomic: Carbon 6 + Oxygen 8 = Silicon 14' },
  3946: { tier: 3, reason: 'balance_molar: H2O molar mass = 18 g/mol' },
  8351: { tier: 5, reason: 'balance_atomic: Mercury 80 + Bromine 35 = 115' },
  8434: { tier: 4, reason: 'balance_periodic: 18 groups + 7 periods = 25' },
  8469: { tier: 4, reason: 'balance_atomic: Nitrogen 7 + Oxygen 8 = Phosphorus 15' },
  8509: { tier: 5, reason: 'balance_atomic: Silver 47 + Gold 79 = 126' },
  9525: { tier: 3, reason: 'balance_chem: Neutral water pH 7 + top pH 14 = 21' },
  10397: { tier: 4, reason: 'balance_atomic: Carbon 6 + Oxygen 8 = 14 protons' },
  // Semantic Chemistry
  93: { tier: 3, reason: 'chem_biochem: Blood catalase ripping H2O2 to oxygen' },
  97: { tier: 5, reason: 'chem_biochem: Orb-weaver silk beta-sheet proteins' },
  153: { tier: 3, reason: 'chem_polymer: LEGO ABS plastic resin 1963' },
  169: { tier: 3, reason: 'chem_metallurgy: Liberty Bell brittle tin alloy' },
  183: { tier: 3, reason: 'chem_inorganic: Fireworks emerald green barium' },
  351: { tier: 3, reason: 'chem_biochem: Impossible Burger soybean root nodule heme' },
  379: { tier: 2, reason: 'chem_polymer: Shrinky Dinks polystyrene #6' },
  384: { tier: 3, reason: 'chem_electrochem: 12V lead-acid battery 6 series cells' },
  397: { tier: 2, reason: 'chem_mineralogy: Mohs hardness scale 10' },
  446: { tier: 2, reason: 'chem_materials: Graphene 2004 Scotch tape Nobel' },
  466: { tier: 2, reason: 'chem_thermo: Endothermic instant cold pack' },
  498: { tier: 2, reason: 'chem_trivia: Pepper X 2.69M Scoville' },
  521: { tier: 3, reason: 'chem_nuclear: Banana Equivalent Dose Potassium-40' },
  610: { tier: 3, reason: 'chem_polymer: PLA bioplastic fermented cornstarch' },
  661: { tier: 3, reason: 'chem_biochem: Oat milk amylase enzymes -> maltose' },
  753: { tier: 3, reason: 'chem_polymer: Nathaniel Wyeth 1973 PET bottle' },
  848: { tier: 2, reason: 'chem_everyday: Pocket hand warmer rusting iron' },
  860: { tier: 2, reason: 'chem_everyday: Egg yolk sulfur tarnishing silver' },
  912: { tier: 3, reason: 'chem_safety: Bleach + ammonia chloramine vapors' },
  940: { tier: 3, reason: 'chem_organic: Petrichor soil geosmin' },
  1169: { tier: 2, reason: 'chem_food: M&M carnauba wax polish' },
  1246: { tier: 2, reason: 'chem_history: Frederick McKay water fluoride' },
  1288: { tier: 2, reason: 'chem_food: Louis-Camille Maillard 1912 browning' },
  1291: { tier: 3, reason: 'chem_food: Mayonnaise egg-yolk lecithin emulsifier' },
  1295: { tier: 3, reason: 'chem_polymer: Diaper sodium polyacrylate snow' },
  1305: { tier: 4, reason: 'chem_biochem: Cilantro OR6A2 fatty aldehydes' },
  1324: { tier: 4, reason: 'chem_optics: Edwin Land aligned iodine crystals' },
  1338: { tier: 3, reason: 'chem_mineralogy: Ruby corundum trace chromium' },
  1390: { tier: 2, reason: 'chem_food: Raw pineapple bromelain enzyme' },
  1424: { tier: 3, reason: 'chem_materials: CVD lab diamond methane plasma' },
  1490: { tier: 3, reason: 'chem_elements: Element #118 Oganesson' },
  1502: { tier: 2, reason: 'chem_elements: Lithium lightest solid element' },
  3777: { tier: 2, reason: 'chem_phase: Dry ice sublimation' },
  3817: { tier: 3, reason: 'lasso_periodic: Group 11 coinage metals Cu/Ag/Au' },
  3839: { tier: 2, reason: 'chem_elements: Gallium (#31) melting spoon' },
  6661: { tier: 2, reason: 'chem_trivia: Mole Day October 23' },
  6670: { tier: 3, reason: 'chem_biochem: Dog-toxic chocolate theobromine' },
  6698: { tier: 3, reason: 'chem_history: Hennig Brand 1669 urine phosphorus' },
  6733: { tier: 3, reason: 'chem_nano: 2023 Nobel Quantum dots' },
  6759: { tier: 2, reason: 'chem_materials: Vantablack 99.96% light coating' },
  6824: { tier: 3, reason: 'chem_atmos: Mauna Loa 2024-25 CO2 ~425 ppm' },
  6882: { tier: 3, reason: 'chem_terms: Verdigris copper patina' },
  7005: { tier: 4, reason: 'chem_materials: LK-99 2023 copper sulfide impurity' },
  7008: { tier: 2, reason: 'chem_physics: Pure silver most conductive metal' },
  7033: { tier: 2, reason: 'chem_forensics: Luminol blood reagent' },
  7049: { tier: 2, reason: 'chem_history: Napoleon III aluminum forks' },
  7123: { tier: 3, reason: 'chem_organic: Synthetic vanillin from wood pulp lignin' },
  7125: { tier: 3, reason: 'chem_inorganic: Paramagnetic pale-blue liquid oxygen' },
  7156: { tier: 3, reason: 'chem_metallurgy: Titanium highest melting point vs Fe/Cu/Au' },
  8036: { tier: 3, reason: 'lasso_periodic: Neptunium, Uranium, Plutonium actinides' },
  8091: { tier: 3, reason: 'lasso_atmos: Oxygen, Argon, Nitrogen dry air trio' },
  8198: { tier: 4, reason: 'chem_nuclear: Dubna Russia dubnium/moscovium' },
  8233: { tier: 3, reason: 'chem_inorganic: Potassium lilac-violet flame test' },
  8294: { tier: 3, reason: 'chem_periodic: Gold 79 protons atomic number' },
  8343: { tier: 3, reason: 'chem_geology: Aluminum most abundant crust metal' },
  8367: { tier: 3, reason: 'chem_history: Ytterby Sweden 4-element quarry' },
  8507: { tier: 2, reason: 'chem_history: Dmitri Mendeleev 1869 periodic table' },
  8524: { tier: 3, reason: 'chrono_chem: White Phosphorus 1669 vs O2/Al/He' },
  9405: { tier: 3, reason: 'chem_materials: Prince Rupert drop' },
  9412: { tier: 2, reason: 'chem_materials: Lab-grown CVD diamond' },
  9428: { tier: 2, reason: 'chem_mineralogy: Quartz hardness vs steel/glass' },
  9450: { tier: 3, reason: 'chem_materials: LK-99 shorthand name' },
  9461: { tier: 2, reason: 'chem_history: DuPont Wilmington DE' },
  9462: { tier: 3, reason: 'chem_materials: Uranium oxide vaseline glass' },
  9487: { tier: 3, reason: 'chem_elements: Platinum highest density vs Au/Ag/Pd' },
  9509: { tier: 2, reason: 'chem_news: FDA Jan 2025 Red Dye No. 3 ban' },
  9553: { tier: 3, reason: 'chem_battery: Sodium-ion EV winter batteries' },
  9574: { tier: 2, reason: 'chem_everyday: 100-proof bourbon 50% ethanol' },
  9630: { tier: 3, reason: 'lasso_chem: NPK Nitrogen, Phosphorus, Potassium' },
  9653: { tier: 3, reason: 'chem_nano: Quantum nanocrystals 2023 Nobel' },
  9667: { tier: 3, reason: 'chrono_chem: Bakelite resin 1907' },
  10298: { tier: 2, reason: 'chem_everyday: Onion tears dilute sulfuric acid' },
  10335: { tier: 2, reason: 'chem_cooking: Cast iron polymerized oil' },
  10340: { tier: 2, reason: 'chem_everyday: Milk casein dissolves capsaicin' },

  // === PHYSICS ===
  // Cyanotypes
  3894: { tier: 3, reason: 'cyanotype_optics: Dispersive flint glass prism' },
  3927: { tier: 5, reason: 'cyanotype_nuclear: Lawrence cyclotron Helmholtz field coil' },
  8136: { tier: 3, reason: 'cyanotype_detector: Geiger counter gas tube' },
  8156: { tier: 4, reason: 'cyanotype_optics: Diffraction grating' },
  8221: { tier: 4, reason: 'cyanotype_thermo: Crookes radiometer mill' },
  8482: { tier: 3, reason: 'cyanotype_electrostatics: Van de Graaff conveyor belt' },
  // Patchbays
  3644: { tier: 4, reason: 'patchbay_si: Ohm / Tesla / Farad / Pascal EM units' },
  8056: { tier: 2, reason: 'patchbay_mechanics: Inclined plane / Lever / Wedge / Pulley' },
  8189: { tier: 2, reason: 'patchbay_em: Microwaves / Infrared / UV / X-ray' },
  8360: { tier: 2, reason: 'patchbay_newton: Newton 3 laws of motion' },
  8481: { tier: 3, reason: 'patchbay_thought: Schrödinger / Einstein / Maxwell / Newton' },
  9331: { tier: 2, reason: 'patchbay_si: Watt / Hertz / Newton / Ampere' },
  // Balances
  3709: { tier: 4, reason: 'balance_thermo: 32 F ice + 180 F span = 212 F' },
  8126: { tier: 3, reason: 'balance_optics: Newton 7 rainbow + 3 RGB = 10' },
  8138: { tier: 4, reason: 'balance_laws: Newton 3 + Maxwell 4 = 7' },
  8330: { tier: 4, reason: 'balance_astro: JWST 18 + Keck I 36 = 54 mirrors' },
  8370: { tier: 4, reason: 'balance_mech: Lagrange 5 + Simple machines 6 = 11' },
  9660: { tier: 3, reason: 'balance_astro: Official planets 8 + Mars moons 2 = 10' },
  10432: { tier: 3, reason: 'balance_physics: Forces of nature 4 + Rainbow 7 = 11' },
  // Semantic Physics
  1: { tier: 3, reason: 'phys_astro: EHT black hole photo galaxy Messier 87' },
  69: { tier: 3, reason: 'phys_mech: Newton cradle conservation of kinetic energy ½mv²' },
  91: { tier: 4, reason: 'phys_mech: Boomerang gyroscopic precession' },
  98: { tier: 2, reason: 'phys_flight: Vomit Comet parabolic arcs' },
  139: { tier: 2, reason: 'phys_space: Parker Solar Probe 430,000 mph' },
  237: { tier: 2, reason: 'phys_fluid: Helium balloon tilts forward in accelerating van' },
  262: { tier: 2, reason: 'phys_quantum: Quantum entanglement 2022 Nobel' },
  264: { tier: 3, reason: 'phys_space: Ingenuity 72 Mars flights' },
  293: { tier: 2, reason: 'phys_space: NASA Europa Clipper 2024' },
  353: { tier: 2, reason: 'phys_space: Voyager 1 heliopause 2012' },
  554: { tier: 3, reason: 'phys_optics: LCD twisted liquid crystals' },
  576: { tier: 2, reason: 'phys_thermo: Double-pane convection currents' },
  590: { tier: 2, reason: 'phys_em: Transformers step AC voltage up' },
  616: { tier: 2, reason: 'phys_space: NASA DART Dimorphos ramming' },
  619: { tier: 2, reason: 'phys_mech: Bicycle caster trail steers into lean' },
  731: { tier: 3, reason: 'phys_space: Perseverance MOXIE oxygen from Martian CO2' },
  836: { tier: 3, reason: 'phys_em: Qi wireless inductive flux coils' },
  850: { tier: 3, reason: 'phys_weather: Doppler tornado hook echo' },
  927: { tier: 3, reason: 'phys_space: JWST 18 gold beryllium hex mirrors' },
  973: { tier: 2, reason: 'phys_history: Feynman Challenger O-ring ice water' },
  986: { tier: 3, reason: 'phys_space: Chandrayaan-3 2023 lunar south pole' },
  1003: { tier: 2, reason: 'phys_thermo: Mpemba effect hot mix freezes first' },
  1026: { tier: 3, reason: 'phys_thermo: Everest water boils at 70 C' },
  1110: { tier: 4, reason: 'phys_acoustics: Baseball bat sweet spot vibrational node' },
  1205: { tier: 2, reason: 'phys_aero: F1 DRS cuts aerodynamic drag' },
  1214: { tier: 2, reason: 'phys_atomic: Rutherford 1909 gold foil empty space' },
  1378: { tier: 3, reason: 'phys_astro: May 2024 G5 aurora magnetized plasma' },
  1403: { tier: 3, reason: 'phys_astro: Milky Way center black hole Sagittarius A*' },
  1484: { tier: 3, reason: 'phys_geophys: Hunga Tonga 2022 pressure wave 4 laps' },
  1495: { tier: 2, reason: 'phys_optics: 2014 Nobel bright blue LEDs' },
  3768: { tier: 3, reason: 'phys_space: Voyager 2 launched 16 days before Voyager 1' },
  3821: { tier: 2, reason: 'phys_plasma: Lightning ~5x hotter than Sun surface' },
  6578: { tier: 2, reason: 'phys_em: Gamma rays highest EM frequency' },
  6581: { tier: 2, reason: 'phys_em: Faraday 1831 induction current' },
  6676: { tier: 2, reason: 'phys_astro: Proxima Centauri closest star after Sun' },
  6718: { tier: 2, reason: 'phys_astro: Cosmological redshift' },
  6772: { tier: 3, reason: 'phys_astro: Jupiter Ganymede largest solar moon' },
  6817: { tier: 3, reason: 'phys_space: Cassini launched earlier than New Horizons/Juno' },
  6865: { tier: 2, reason: 'phys_acoustics: Wine glass shattering resonance' },
  6874: { tier: 3, reason: 'phys_astro: Coronal mass ejection CME' },
  6898: { tier: 3, reason: 'phys_quantum: Heisenberg uncertainty position vs momentum' },
  6919: { tier: 3, reason: 'phys_orbital: JWST Lagrange point L2' },
  6926: { tier: 2, reason: 'phys_thermo: Second law entropy' },
  6930: { tier: 3, reason: 'phys_astro: Vera Rubin 1970s dark matter' },
  6946: { tier: 2, reason: 'phys_acoustics: Sound fastest in solid steel' },
  6998: { tier: 3, reason: 'phys_history: Eratosthenes 240 BCE Earth girth' },
  7059: { tier: 3, reason: 'phys_quantum: Richard Feynman QED diagrams' },
  7148: { tier: 2, reason: 'phys_orbital: Tidal locking Moon same face' },
  8030: { tier: 2, reason: 'phys_orbital: Mercury fastest orbital speed' },
  8055: { tier: 3, reason: 'phys_aero: High-altitude Mach 1 ~660 mph' },
  8088: { tier: 2, reason: 'phys_particle: CERN Geneva Switzerland' },
  8090: { tier: 2, reason: 'lasso_nuclear: Alpha, Gamma, Beta radiation' },
  8110: { tier: 3, reason: 'lasso_si: Meter, Kilogram, Second MKS base units' },
  8134: { tier: 2, reason: 'lasso_elec: Voltage, Current, Resistance Ohm Law' },
  8181: { tier: 2, reason: 'phys_astro: Event Horizon black hole boundary' },
  8186: { tier: 2, reason: 'lasso_em: Gamma, X-rays, UV shorter than visible' },
  8386: { tier: 3, reason: 'phys_history: Lise Meitner 1938 nuclear fission' },
  9337: { tier: 3, reason: 'phys_space: OSIRIS-REx 121.6g asteroid dust Utah' },
  9351: { tier: 3, reason: 'phys_space: Chandrayaan-3 Vikram/Pragyan' },
  9429: { tier: 2, reason: 'phys_optics: Violet bends sharpest in prism' },
  9434: { tier: 2, reason: 'phys_space: Explorer 1 Van Allen Belts' },
  9448: { tier: 3, reason: 'phys_mech: Mould effect metal bead chain fountain' },
  9501: { tier: 3, reason: 'phys_astro: 11-year solar magnetic cycle' },
  9522: { tier: 2, reason: 'lasso_thermo: Solid, Liquid, Gas triple point' },
  9589: { tier: 3, reason: 'phys_quantum: Google Dec 2024 105-qubit Willow chip' },
  9617: { tier: 3, reason: 'chrono_astro: Exoplanet 51 Peg b 1995 discovered last' },
  9641: { tier: 3, reason: 'phys_astro: Neptune Triton retrograde geysers' },
  9665: { tier: 2, reason: 'phys_nobel: Geoffrey Hinton 2024 Physics Nobel' },

  // === GADGETS ===
  // Cyanotypes
  3876: { tier: 4, reason: 'cyanotype_optics: SLR Front objective lens doublet' },
  3892: { tier: 3, reason: 'cyanotype_photo: Polaroid SX-70 chemical pod' },
  8035: { tier: 3, reason: 'cyanotype_optics: Camera aperture blades' },
  8201: { tier: 3, reason: 'cyanotype_tech: Capacitive touchscreen grid' },
  8283: { tier: 4, reason: 'cyanotype_tech: Grill piezo crystal igniter' },
  8331: { tier: 4, reason: 'cyanotype_tech: Toaster bimetallic thermal strip' },
  // Patchbays
  3601: { tier: 3, reason: 'patchbay_ports: USB-C / RJ-45 / 3.5mm TRS / Coaxial' },
  8048: { tier: 2, reason: 'patchbay_wireless: Bluetooth / NFC / GPS / IR' },
  8132: { tier: 2, reason: 'patchbay_gaming: Wii / Game Boy / Switch' },
  8146: { tier: 2, reason: 'patchbay_brands: Duolingo / Amazon / Apple / Spotify' },
  8497: { tier: 2, reason: 'patchbay_cameras: Polaroid / GoPro / Kodak' },
  9506: { tier: 3, reason: 'patchbay_mascots: Tux / Snoo / Octocat / Discord' },
  10470: { tier: 2, reason: 'patchbay_origins: Kleenex / Tupperware / Swiss Army' },
  // Balances
  3844: { tier: 4, reason: 'balance_tech: ANSI PC 104 + Grand piano 88 = 192 keys' },
  8123: { tier: 4, reason: 'balance_tech: UPC-A 12 + ISBN-13 = 25 digits' },
  8133: { tier: 4, reason: 'balance_tech: HDMI Type-A 19 + USB-C 24 = 43 pins' },
  8163: { tier: 4, reason: 'balance_video: 4K UHD 2160 + Full HD 1080 = 3240 lines' },
  8199: { tier: 3, reason: 'balance_cs: Byte 8 + Nibble 4 = 12 bits' },
  9560: { tier: 3, reason: 'balance_radio: 5 GHz + Wi-Fi 6E 6 GHz = 11 GHz' },
  10405: { tier: 3, reason: 'balance_telecom: Rotary 10 + Touch-Tone 12 = 22' },
  // Semantic Gadgets
  134: { tier: 3, reason: 'gad_mech: PS5 DualSense motorized worm-gear cams' },
  283: { tier: 2, reason: 'gad_physics: James Dewar 1892 Thermos radiant infrared' },
  344: { tier: 2, reason: 'gad_history: Nokia Morse code SMS chime' },
  407: { tier: 2, reason: 'gad_history: Louis Braille 6 raised dots' },
  447: { tier: 3, reason: 'gad_history: Almon Strowger 1891 rotary dial' },
  482: { tier: 2, reason: 'gad_mech: Phone vibrate off-center eccentric weight' },
  501: { tier: 3, reason: 'gad_history: Corning 1962 Chemcor Gorilla Glass' },
  551: { tier: 2, reason: 'gad_tech: Luis von Ahn reCAPTCHA book digitization' },
  559: { tier: 2, reason: 'gad_tech: ePassport contactless RFID chip' },
  742: { tier: 2, reason: 'gad_chem: Etch A Sketch fine aluminum powder' },
  747: { tier: 2, reason: 'gad_tech: Face ID 30,000 infrared dots' },
  988: { tier: 2, reason: 'gad_optics: Smartwatch green LED blood absorption' },
  1020: { tier: 3, reason: 'gad_physics: Active noise canceling destructive interference' },
  1160: { tier: 2, reason: 'gad_chem: Etch A Sketch aluminum powder and beads' },
  1162: { tier: 2, reason: 'gad_retro: TI Speak & Spell E.T. 1982' },
  1230: { tier: 2, reason: 'gad_mech: Dyson bladeless fan hidden base impeller' },
  1289: { tier: 3, reason: 'gad_hw: iPod click wheel internal piezo clicker' },
  1359: { tier: 2, reason: 'gad_history: Charles Strite 1919 pop-up toaster' },
  1413: { tier: 3, reason: 'gad_telecom: Touch-tone two tones prevent voice dialing' },
  3820: { tier: 2, reason: 'gad_history: Bill Hewlett 1939 coin toss' },
  6829: { tier: 2, reason: 'gad_optics: Blu-ray shorter blue-violet laser wave' },
  6933: { tier: 2, reason: 'gad_history: René Laennec 1816 stethoscope' },
  6970: { tier: 2, reason: 'gad_history: Roy Plunkett 1938 Teflon refrigerant tank' },
  7004: { tier: 2, reason: 'gad_history: Hedy Lamarr 88 piano-key frequency-hopping' },
  7041: { tier: 2, reason: 'gad_history: Herman Hollerith 1890 census IBM' },
  7117: { tier: 3, reason: 'gad_mech: PS5 DualSense motorized plastic worm gear' },
  7162: { tier: 2, reason: 'gad_history: 1972 HP-35 pocket calculator vs slide rules' },
  8065: { tier: 2, reason: 'lasso_tech: Wozniak, Wayne, Jobs 1976 Apple founders' },
  8303: { tier: 3, reason: 'gad_semicon: ASML EUV lithography Netherlands' },
  9526: { tier: 2, reason: 'gad_ai: Hangzhou DeepSeek R1 Jan 2025' },
  9602: { tier: 2, reason: 'lasso_cloud: AWS, Azure, Google Cloud hyperscalers' },
  9625: { tier: 3, reason: 'gad_history: 1823 cigarette lighter predated friction match' },
  10344: { tier: 2, reason: 'gad_history: James Dewar 1892 vacuum flask' },
  10400: { tier: 3, reason: 'gad_history: Fred Waring 1937 blender & Jonas Salk' },

  // === ENGINES ===
  // Cyanotypes
  3648: { tier: 4, reason: 'cyanotype_steam: Watt steam throttle butterfly valve' },
  3778: { tier: 3, reason: 'cyanotype_steam: Watt centrifugal flyball governor' },
  8161: { tier: 3, reason: 'cyanotype_auto: Camshaft bar lobes' },
  8162: { tier: 3, reason: 'cyanotype_aero: Jet engine thrust reverser' },
  8401: { tier: 3, reason: 'cyanotype_auto: Exhaust-driven turbocharger' },
  8440: { tier: 4, reason: 'cyanotype_aero: Aircraft Pitot airspeed probe' },
  // Patchbays
  3690: { tier: 2, reason: 'patchbay_aero: SR-71 / 747 / Spirit of St. Louis / Spruce Goose' },
  8062: { tier: 2, reason: 'patchbay_space: Saturn V / Falcon 9 / New Shepard' },
  8174: { tier: 3, reason: 'patchbay_ships: Titanic / Lusitania / Queen Mary / Britannic' },
  8200: { tier: 2, reason: 'patchbay_eng: Hoover Dam / Chunnel / Burj Khalifa' },
  8407: { tier: 2, reason: 'patchbay_auto: Ferrari / Lamborghini / Peugeot' },
  9569: { tier: 2, reason: 'patchbay_auto: Hyundai / Porsche / Subaru / Volvo' },
  10316: { tier: 2, reason: 'patchbay_auto: Ferrari / Mercedes / Audi / Maserati emblems' },
  // Balances
  3682: { tier: 4, reason: 'balance_space: Saturn V Stage-1 5 F-1 + Stage-2 5 J-2 = 10' },
  8063: { tier: 4, reason: 'balance_space: Falcon 9 (9) + Falcon Heavy (27) = 36 Merlins' },
  8278: { tier: 4, reason: 'balance_towers: Eiffel 330m + Burj Khalifa 828m = 1158m' },
  8315: { tier: 4, reason: 'balance_tunnels: Gotthard 57 + Chunnel 50 = 107 km' },
  8467: { tier: 2, reason: 'balance_wheels: Semi 18 + F1 car 4 = 22 wheels' },
  9547: { tier: 3, reason: 'balance_jets: Boeing 747 (4) + 777 (2) = 6 engines' },
  10468: { tier: 3, reason: 'balance_jets: Boeing 747 (4) + B-52 (8) = 12 engines' },
  // Semantic Engines
  32: { tier: 2, reason: 'eng_auto: Porsche 911 left ignition Le Mans start' },
  95: { tier: 3, reason: 'eng_auto: Mazda Miata Jinba Ittai' },
  207: { tier: 3, reason: 'eng_history: John Loudon McAdam 1820 tarmac' },
  217: { tier: 2, reason: 'eng_history: 1946 Piaggio Vespa surplus bomber parts' },
  221: { tier: 3, reason: 'eng_space: Apollo Moon Buggy zinc-coated piano wire tires' },
  280: { tier: 3, reason: 'eng_rail: Freight caboose replaced by flashing FRED box' },
  284: { tier: 3, reason: 'eng_aero: Igor Sikorsky 1939 VS-300 coat & fedora' },
  322: { tier: 3, reason: 'eng_racing: Formula E Attack Mode off racing line' },
  352: { tier: 3, reason: 'eng_space: SpaceX Super Heavy 33 Raptor engines' },
  425: { tier: 2, reason: 'eng_space: Raptor liquid methane clean & Mars-makeable' },
  481: { tier: 2, reason: 'eng_ev: Instant max torque at 0 RPM' },
  557: { tier: 3, reason: 'eng_marine: Ship bulbous bow cancels hull wave' },
  719: { tier: 2, reason: 'eng_history: Bertha Benz 1888 Ligroin pharmacy fuel' },
  740: { tier: 3, reason: 'eng_scifi: SpaceX drone ships named after Iain M. Banks' },
  744: { tier: 2, reason: 'eng_history: Benjamin Holt 1904 Caterpillar tracks' },
  758: { tier: 2, reason: 'eng_marine: Polar icebreaker slides up & crushes down' },
  1093: { tier: 3, reason: 'eng_rail: SF cable car steel cable 9.5 mph' },
  1124: { tier: 3, reason: 'eng_aero: NASA X-59 4K forward camera screen' },
  1139: { tier: 3, reason: 'eng_space: Pad 39A water deluge acoustic shockwaves' },
  1143: { tier: 2, reason: 'eng_aero: De Havilland oval windows square crack stress' },
  1146: { tier: 2, reason: 'eng_auto: Bugatti second Top Speed Key' },
  1232: { tier: 3, reason: 'eng_auto: Honda Super Cub 1958 soba trays 1-handed' },
  1369: { tier: 3, reason: 'eng_history: Ferrari Prancing Horse WWI ace Francesco Baracca' },
  3578: { tier: 3, reason: 'eng_horology: Clockwork escapement mechanism' },
  3594: { tier: 2, reason: 'eng_ev: Regenerative braking runs motor as generator' },
  3688: { tier: 2, reason: 'eng_mech: Diesel ignition via hot compressed air' },
  3738: { tier: 3, reason: 'eng_history: James Watt 1769 separate steam condenser' },
  3771: { tier: 3, reason: 'eng_aero: Turbofan 80% thrust from cold bypass fan air' },
  3788: { tier: 3, reason: 'eng_space: Saturn V F-1 RP-1 kerosene' },
  3884: { tier: 3, reason: 'eng_trivia: IKEA Agunnaryd Swedish village' },
  6743: { tier: 2, reason: 'eng_auto: McLaren F1 1992 24k gold foil engine bay' },
  6760: { tier: 2, reason: 'eng_history: 1869 Golden Spike Promontory Summit Utah' },
  6794: { tier: 2, reason: 'eng_space: Blue Origin New Glenn Jan 2025' },
  6797: { tier: 2, reason: 'eng_auto: Ford GT40 40 inches tall' },
  6878: { tier: 3, reason: 'eng_space: JWST five thin Kapton sunshield films' },
  6920: { tier: 2, reason: 'eng_auto: 1975 honeycomb catalytic converter' },
  7050: { tier: 2, reason: 'eng_history: USS Nautilus 1958 North Pole under ice' },
  7084: { tier: 2, reason: 'eng_aero: Bell X-1 shaped like .50-caliber bullet' },
  7107: { tier: 2, reason: 'eng_rail: Steam locomotive engine tender' },
  8248: { tier: 3, reason: 'chrono_aero: 1939 Sikorsky VS-300 helicopter layout' },
  8249: { tier: 2, reason: 'eng_history: Nils Bohlin 1959 Volvo 3-Point Seatbelt' },
  8251: { tier: 3, reason: 'eng_aero: Concorde 1,350 mph cruise' },
  8292: { tier: 2, reason: 'eng_aero: Airbus final assembly Toulouse France' },
  8493: { tier: 2, reason: 'lasso_aero: Elevator, Aileron, Rudder flight surfaces' },
  9383: { tier: 3, reason: 'lasso_space: Apollo 8 crew Borman, Lovell, Anders' },
  9550: { tier: 3, reason: 'eng_space: NASA SLS 8.8 million lbs thrust' },
  9565: { tier: 2, reason: 'eng_physics: Human on bicycle most energy-efficient' },
  10265: { tier: 2, reason: 'eng_history: John Hetrick 1951 airbag' },
  10325: { tier: 2, reason: 'eng_history: Béla Barényi 1952 crumple zone' },
  10435: { tier: 2, reason: 'eng_rail: Rail roundhouse turntable' },
  10450: { tier: 2, reason: 'eng_history: 1920s trafficators turn signal' },

  // === LITERATURE ===
  // Cyanotypes
  3586: { tier: 4, reason: 'cyanotype_press: Gutenberg screw spindle platen' },
  3756: { tier: 3, reason: 'cyanotype_theater: Globe Theatre penny groundlings' },
  8327: { tier: 4, reason: 'cyanotype_book: Handmade paper deckle edge' },
  8377: { tier: 3, reason: 'cyanotype_book: Ex libris ownership plate' },
  8502: { tier: 3, reason: 'cyanotype_book: 1830s dust jacket' },
  8519: { tier: 3, reason: 'cyanotype_book: Hardcover endpapers' },
  // Patchbays
  3866: { tier: 3, reason: 'patchbay_lit: Opening lines Moby-Dick/1984/Karenina/Jane Eyre' },
  3931: { tier: 2, reason: 'patchbay_lit: Opening lines Moby-Dick/Anna Karenina/1984' },
  8041: { tier: 2, reason: 'patchbay_lit: Middle-earth/Narnia/Westeros/Earthsea' },
  8068: { tier: 2, reason: 'patchbay_lit: Sancho Panza/Samwise/Friday/Gatsby' },
  8338: { tier: 2, reason: 'patchbay_lit: Neverland/Lilliput/Isla Nublar/Treasure Island' },
  8512: { tier: 2, reason: 'patchbay_lit: Dracula/Frankenstein/Hyde/Poe' },
  9454: { tier: 3, reason: 'patchbay_lit: Maycomb/West Egg/Ingolstadt/Sleepy Hollow' },
  // Balances
  3567: { tier: 3, reason: 'balance_lit: Shakespearean sonnet 14 + Haiku 17 = 31' },
  8073: { tier: 3, reason: 'balance_lit: Fahrenheit 451 + 80 Days = 531' },
  8241: { tier: 2, reason: 'balance_lit: Harry Potter 7 + LOTR 3 = 10' },
  8392: { tier: 4, reason: 'balance_lit: Brontë sisters 7 + Jane Austen 6 = 13' },
  8474: { tier: 4, reason: 'balance_lit: Poirot 33 + Marple 12 = 45 Christie novels' },
  9498: { tier: 4, reason: 'balance_lit: Narnia 7 + Baum Oz 14 = 21' },
  // Semantic Literature
  7: { tier: 2, reason: 'lit_trivia: Hercule Poirot 1975 NYT obituary' },
  105: { tier: 3, reason: 'lit_poetry: Paul Laurence Dunbar Caged Bird poem' },
  138: { tier: 2, reason: 'lit_bio: Maya Angelou SF cable-car conductorette' },
  292: { tier: 2, reason: 'lit_scifi: Project Hail Mary alien Rocky' },
  346: { tier: 3, reason: 'lit_history: Dune published by Chilton auto-repair manuals' },
  558: { tier: 3, reason: 'lit_translation: Dragon Tattoo Swedish title Men Who Hate Women' },
  698: { tier: 3, reason: 'lit_history: Black Beauty tight bearing checkreins' },
  837: { tier: 3, reason: 'lit_trivia: Princess Bride fake author S. Morgenstern' },
  904: { tier: 3, reason: 'lit_classic: Count of Monte Cristo Château d’If' },
  908: { tier: 2, reason: 'lit_craft: Chekhov’s Gun dramatic rule' },
  937: { tier: 2, reason: 'lit_bio: Beatrix Potter Lake District hill farms' },
  938: { tier: 3, reason: 'lit_bio: Delia Owens wildlife biologist in Africa' },
  1041: { tier: 3, reason: 'lit_bio: Louisa May Alcott Gothic blood-and-thunder potboilers' },
  1432: { tier: 2, reason: 'lit_2025: Percival Everett Pulitzer James' },
  6686: { tier: 2, reason: 'lit_fantasy: Fourth Wing Basgiath War College' },
  6816: { tier: 3, reason: 'lit_history: 1935 Penguin orange general fiction stripe' },
  6872: { tier: 2, reason: 'lit_fiction: Lessons in Chemistry Supper at Six' },
  6968: { tier: 2, reason: 'lit_manga: Eiichiro Oda One Piece Monkey D. Luffy' },
  6994: { tier: 2, reason: 'lit_2025: Percival Everett James runaway Jim' },
  7014: { tier: 2, reason: 'lit_ya: Alice Oseman Heartstopper' },
  7112: { tier: 2, reason: 'lit_memoir: Michelle Zauner Crying in H Mart' },
  8111: { tier: 2, reason: 'lit_term: Deus Ex Machina' },
  8169: { tier: 3, reason: 'lit_scifi: Time Machine earliest vs Invisible Man/War of Worlds' },
  8260: { tier: 2, reason: 'lit_geo: Dublin Ireland Bloomsday June 16' },
  8397: { tier: 2, reason: 'lasso_lit: Anne, Emily, Charlotte Brontë' },
  9326: { tier: 2, reason: 'lit_bio: Dr. Seuss 27 rejections 1937' },
  9409: { tier: 2, reason: 'lit_classic: Gulliver Lilliputians egg war' },
  9413: { tier: 2, reason: 'lit_2024: Kristin Hannah The Women' },
  9492: { tier: 3, reason: 'lit_history: Allen Lane 1935 Penguin Books' },
  9562: { tier: 2, reason: 'lit_2025: Percival Everett James Huckleberry Finn' },
  9651: { tier: 2, reason: 'lit_beat: Jack Kerouac On the Road 120-ft scroll' },
  9657: { tier: 2, reason: 'lit_2023: R.F. Kuang Yellowface' },

  // === LEXICON ===
  // Cyanotypes
  3678: { tier: 4, reason: 'cyanotype_print: Linotype molten type-metal crucible' },
  3720: { tier: 4, reason: 'cyanotype_linguistics: IPA Mid-Central Schwa' },
  8271: { tier: 3, reason: 'cyanotype_type: Typography descender tail' },
  8353: { tier: 3, reason: 'cyanotype_type: Typography tittle dot over i' },
  8381: { tier: 3, reason: 'cyanotype_type: Em dash capital M width' },
  8417: { tier: 3, reason: 'cyanotype_type: Acute accent mark' },
  // Patchbays
  3814: { tier: 3, reason: 'patchbay_etym: Ketchup/Croissant/Pretzel/Avocado origins' },
  3936: { tier: 2, reason: 'patchbay_etym: Karaoke/Kindergarten/Schadenfreude' },
  8040: { tier: 2, reason: 'patchbay_slang: Ghosting/Gaslighting/Doomscrolling' },
  8043: { tier: 2, reason: 'patchbay_etym: Tsunami/Patio/Paparazzi/Marmalade' },
  8095: { tier: 2, reason: 'patchbay_acronyms: LASER/SCUBA/RADAR/SONAR' },
  8140: { tier: 2, reason: 'patchbay_words: Brunch/Smog/Podcast/Webinar' },
  9372: { tier: 3, reason: 'patchbay_etym: Biscuit/Salad/Vinegar/Avocado literal roots' },
  // Balances
  3708: { tier: 3, reason: 'balance_alphabets: English 26 + Greek 24 = 50' },
  8154: { tier: 4, reason: 'balance_puzzles: NYT weekday 15 + Wordle 5 = 20' },
  8190: { tier: 2, reason: 'balance_letters: 21 consonants + 5 vowels = 26' },
  8345: { tier: 3, reason: 'balance_scrabble: 98 lettered + 2 blanks = 100' },
  8445: { tier: 2, reason: 'balance_roman: C (100) + L (50) = 150' },
  9346: { tier: 3, reason: 'balance_codes: NATO 26 + Decimal 10 = 36' },
  // Semantic Lexicon
  0: { tier: 2, reason: 'lex_history: 4th Earl of Sandwich 1762 marathon card table' },
  72: { tier: 2, reason: 'lex_etym: Mad as a hatter mercury nitrate' },
  205: { tier: 2, reason: 'lex_history: Horatio Nelson Copenhagen 1801 blind eye' },
  552: { tier: 2, reason: 'lex_history: Gen. Ambrose Burnside sideburns' },
  555: { tier: 3, reason: 'lex_etym: Hazard Arabic al-zahr dice' },
  622: { tier: 2, reason: 'lex_history: 7th Earl of Cardigan Crimean vest' },
  920: { tier: 3, reason: 'lex_belllabs: Octothorpe # symbol name' },
  1075: { tier: 3, reason: 'lex_nautical: Three sheets to the wind corner control rope' },
  1294: { tier: 3, reason: 'lex_chem: In the limelight heated quicklime' },
  6585: { tier: 2, reason: 'lex_etym: Richard Dawkins 1976 meme imitation' },
  6696: { tier: 2, reason: 'lex_etym: Companion com+panis daily bread' },
  7065: { tier: 3, reason: 'lex_history: Étienne de Silhouette 1759 royal finance' },
  7145: { tier: 2, reason: 'lex_etym: Sinister Latin on the left' },
  8152: { tier: 2, reason: 'lex_world: Mandarin Chinese most native speakers' },
  8518: { tier: 2, reason: 'lex_history: Walter Scott Ivanhoe 1819 freelance' },
  8523: { tier: 3, reason: 'lex_history: Horace Walpole 1754 serendipity' },
  9583: { tier: 3, reason: 'lex_etym: 14th-century "nice" meant foolish/ignorant' },
  10314: { tier: 2, reason: 'lex_type: Ampersand E+T ligature' },
  10433: { tier: 2, reason: 'lex_type: Serifs decorative letter feet' },

  // === FINE ARTS ===
  // Cyanotypes
  3605: { tier: 3, reason: 'cyanotype_arch: Rome Pantheon compression oculus' },
  8072: { tier: 3, reason: 'cyanotype_arch: Gothic cathedral rose window' },
  8229: { tier: 4, reason: 'cyanotype_arch: Greek temple pediment gable' },
  8272: { tier: 4, reason: 'cyanotype_art: Mitered canvas stretcher bar' },
  8313: { tier: 3, reason: 'cyanotype_arch: Gothic gargoyle gutter spout' },
  // Patchbays
  3549: { tier: 3, reason: 'patchbay_art: Starry Night/Night Watch/Venus/Prado' },
  8023: { tier: 3, reason: 'patchbay_art: Last Supper/Guernica/Scream/Kiss cities' },
  8246: { tier: 2, reason: 'patchbay_art: Dalí/Warhol/Monet/Kahlo motifs' },
  8396: { tier: 2, reason: 'patchbay_art: Banksy/Kusama/Haring/Koons' },
  8406: { tier: 3, reason: 'patchbay_arch: Wright/Utzon/Gehry/Zaha Hadid' },
  9629: { tier: 2, reason: 'patchbay_art: Pointillism/Cubism/Surrealism/Pop' },
  // Balances
  3699: { tier: 4, reason: 'balance_art: Hokusai 36 + 10 Ura-Fuji prints = 46' },
  8026: { tier: 3, reason: 'balance_art: Liberty spikes 7 + Rushmore 4 = 11' },
  8060: { tier: 4, reason: 'balance_art: Warhol 32 Soup Cans + 50 Marilyn Diptych = 82' },
  8320: { tier: 4, reason: 'balance_art: Itten wheel 12 + RYB 3 = 15 hues' },
  8337: { tier: 5, reason: 'balance_arch: Louvre Pyramid 603 rhombuses + 70 triangles = 673' },
  9618: { tier: 4, reason: 'balance_art: Burghers of Calais 6 + Mucha Seasons 4 = 10' },
  // Semantic Fine Arts
  71: { tier: 2, reason: 'art_history: Warhol Silver Factory foil walls' },
  81: { tier: 2, reason: 'art_history: Michelangelo Pietà signed sash' },
  125: { tier: 3, reason: 'art_history: Degas 1881 Little Dancer gauze tutu' },
  185: { tier: 2, reason: 'art_history: Rodin Thinker atop Gates of Hell Dante' },
  260: { tier: 2, reason: 'art_modern: Anish Kapoor Vantablack 99.96%' },
  269: { tier: 2, reason: 'art_modern: Yayoi Kusama yellow pumpkins' },
  312: { tier: 3, reason: 'art_modern: Marina Abramović MoMA 2010 736 hours' },
  341: { tier: 3, reason: 'art_arch: Burj Khalifa Y-footprint spider lily flower' },
  527: { tier: 3, reason: 'art_sculpt: Winged Victory Samothrace warship prow' },
  549: { tier: 2, reason: 'art_modern: Jean-Michel Basquiat $110.5M skull' },
  745: { tier: 3, reason: 'art_history: Critic Louis Leroy Impressionists wallpaper insult' },
  843: { tier: 2, reason: 'art_arch: Frank Gehry 1997 Bilbao effect' },
  868: { tier: 2, reason: 'art_modern: Kehinde Wiley Obama portrait flowers' },
  910: { tier: 2, reason: 'art_arch: Machu Picchu mortarless granite blocks' },
  947: { tier: 2, reason: 'art_glass: Dale Chihuly Bellagio glass' },
  952: { tier: 2, reason: 'art_fashion: Audrey Hepburn Givenchy black dress' },
  1022: { tier: 3, reason: 'art_design: Tinker Hatfield Air Max 1 Pompidou window' },
  1029: { tier: 2, reason: 'art_tech: Georges Seurat Pointillism eye mixing' },
  1043: { tier: 2, reason: 'art_tech: Rembrandt Chiaroscuro' },
  1185: { tier: 3, reason: 'art_etym: Alice Binney 1903 Crayola oleaginous' },
  1195: { tier: 3, reason: 'art_design: Eames Lounge Chair first baseman mitt' },
  1219: { tier: 2, reason: 'art_modern: KAWS Companion X eyes' },
  1303: { tier: 2, reason: 'art_fashion: Jean Paul Gaultier Madonna 1990 cone corset' },
  1398: { tier: 3, reason: 'art_physics: Monet 1923 cataract near-UV vision' },
  1457: { tier: 3, reason: 'art_tech: Bob Ross wet-on-wet alla prima' },
  6598: { tier: 2, reason: 'art_modern: Beeple 2021 $69M NFT' },
  6622: { tier: 2, reason: 'art_modern: Magritte Ceci n’est pas une pipe' },
  6652: { tier: 2, reason: 'art_history: Gustav Klimt The Kiss 24k gold leaf' },
  6674: { tier: 2, reason: 'chrono_arch: Colosseum 80 CE vs Hagia Sophia/Angkor/Taj' },
  6790: { tier: 3, reason: 'art_history: Vincenzo Peruggia 1911 Mona Lisa thief' },
  6808: { tier: 2, reason: 'art_modern: Cattelan golden toilet America' },
  6924: { tier: 2, reason: 'art_modern: teamLab Borderless Tokyo' },
  7043: { tier: 3, reason: 'art_museums: Vatican Museums vs Met/Prado/British' },
  7083: { tier: 2, reason: 'art_modern: Kehinde Wiley Obama flowers' },
  7085: { tier: 2, reason: 'art_modern: Edward Hopper Nighthawks no exit doorway' },
  7155: { tier: 2, reason: 'art_modern: Piet Mondrian De Stijl primary grid' },
  8022: { tier: 2, reason: 'art_museums: Uffizi Florence Italy' },
  8050: { tier: 2, reason: 'lasso_art: Leonardo, Raphael, Michelangelo High Renaissance' },
  8097: { tier: 2, reason: 'art_museums: Prado Madrid Spain' },
  8117: { tier: 3, reason: 'lasso_art: Hockney, Lichtenstein, Warhol 1960s Pop Art' },
  8191: { tier: 3, reason: 'art_tech: Impasto thick paint ridges' },
  8253: { tier: 3, reason: 'art_history: Hieronymus Bosch ~1500 Earthly Delights' },
  8265: { tier: 3, reason: 'chrono_art: Vermeer Pearl Earring 1665' },
  8366: { tier: 3, reason: 'art_arch: Cologne Cathedral longest build' },
  9328: { tier: 3, reason: 'lasso_art: Picasso, Dalí, Miró Spanish modernists' },
  9478: { tier: 3, reason: 'art_history: 1841 collapsible tin paint tube Rand' },
  9571: { tier: 3, reason: 'art_trivia: 1964 Pierre Brassau chimpanzee hoax' },
  9610: { tier: 2, reason: 'art_2025: Oct 2025 Louvre Napoleonic jewels heist' },
  9664: { tier: 3, reason: 'art_history: Arcimboldo 1590 Vertumnus fruits/veggies' },
  10339: { tier: 3, reason: 'art_history: Auguste Rodin 1877 The Age of Bronze' },
  10384: { tier: 2, reason: 'art_design: 1960s Sputnik chandelier' },
  10394: { tier: 2, reason: 'art_modern: Andrew Wyeth 1948 Christina’s World' },

  // === SCREEN ===
  // Cyanotypes
  3759: { tier: 4, reason: 'cyanotype_cinema: 35mm anamorphic throw lens' },
  3950: { tier: 4, reason: 'cyanotype_cinema: Geneva Maltese cross intermittent claw' },
  8051: { tier: 3, reason: 'cyanotype_filmset: Chrome C-stand lighting rig' },
  8142: { tier: 3, reason: 'cyanotype_filmset: Telescoping boom pole mic' },
  8301: { tier: 3, reason: 'cyanotype_cinema: Cinema camera matte box' },
  8453: { tier: 3, reason: 'cyanotype_filmset: Striped clapperboard slate' },
  // Patchbays
  3918: { tier: 3, reason: 'patchbay_film: Spielberg/Tarantino/Welles/Lynch debuts' },
  8267: { tier: 2, reason: 'patchbay_tv: Squid Game/Barbie/Severance/Dune' },
  8317: { tier: 2, reason: 'patchbay_tv: Central Perk/Monk’s/Paddy’s/Cheers' },
  8415: { tier: 2, reason: 'patchbay_scifi: HAL 9000/Skynet/Agent Smith/Blade Runner' },
  8435: { tier: 2, reason: 'patchbay_pixar: Ratatouille/WALL-E/Up/Finding Nemo' },
  9611: { tier: 2, reason: 'patchbay_anim: DreamWorks/Ghibli/Pixar/Aardman' },
  // Balances
  3870: { tier: 4, reason: 'balance_cinema: Sound 35mm 24 fps + NTSC 30 fps = 54' },
  8394: { tier: 2, reason: 'balance_disney: 7 Dwarfs + 101 Dalmatians = 108' },
  8448: { tier: 3, reason: 'balance_tv: Seinfeld 9 + Friends 10 = 19 seasons' },
  8451: { tier: 3, reason: 'balance_film: 12 Monkeys + Ocean’s 11 = 23' },
  8466: { tier: 3, reason: 'balance_oscars: Oppenheimer 7 + Anora 5 = 12 Oscars' },
  9350: { tier: 3, reason: 'balance_film: Skywalker 9 + Toy Story 4 = 13 films' },
  // Semantic Screen
  229: { tier: 2, reason: 'scr_trivia: Psycho 1960 Bosco chocolate syrup' },
  449: { tier: 2, reason: 'scr_trivia: Anthony Hopkins Silence of the Lambs 16 mins' },
  450: { tier: 2, reason: 'scr_trivia: The Matrix green rain scanned sushi cookbooks' },
  518: { tier: 2, reason: 'scr_tv: Vince Guaraldi Charlie Brown Christmas jazz' },
  561: { tier: 2, reason: 'scr_trivia: Jim Hanks voices pull-string Woody' },
  700: { tier: 2, reason: 'scr_trivia: Sinatra Strangers in the Night -> Scooby-Doo' },
  950: { tier: 2, reason: 'scr_sound: Chewbacca voice walrus + black bear' },
  1225: { tier: 3, reason: 'scr_tv: Jenna Ortega Wednesday dance The Cramps' },
  1258: { tier: 2, reason: 'scr_history: 1928 Steamboat Willie synchronized sound' },
  1261: { tier: 3, reason: 'scr_history: It’s a Wonderful Life Foamite soap snow' },
  1342: { tier: 2, reason: 'scr_tv: 1952 I Love Lucy censored "pregnant"' },
  3596: { tier: 2, reason: 'scr_history: 1941 Citizen Kane Orson Welles ceilings' },
  8069: { tier: 3, reason: 'lasso_tv: 1976 Charlie’s Angels Fawcett, Smith, Jackson' },
  8079: { tier: 2, reason: 'scr_fest: Cannes France Palme d’Or' },
  8084: { tier: 3, reason: 'scr_cinema: 1958 Hitchcock Vertigo dolly zoom' },
  8269: { tier: 3, reason: 'scr_cinema: Cinecittà soundstages Rome Italy' },
  8333: { tier: 2, reason: 'scr_tech: Standard cinema 24 frames per second' },
  9305: { tier: 2, reason: 'scr_2025: Ryan Coogler directed 2025 Sinners' },
  9329: { tier: 3, reason: 'scr_history: 1834 zoetrope slotted tin drum' },
  9335: { tier: 2, reason: 'scr_history: 1927 Oswald Rabbit before Mickey' },
  9406: { tier: 2, reason: 'lasso_oscars: Ben-Hur, Titanic, Return of King 11 Oscars' },
  9493: { tier: 2, reason: 'scr_2025: Netflix March 2025 one-take Adolescence' },

  // === JUKEBOX ===
  // Cyanotypes
  3556: { tier: 4, reason: 'cyanotype_piano: Double-escapement hopper jack' },
  3941: { tier: 3, reason: 'cyanotype_jukebox: Carousel 45-RPM record-basket gear' },
  8177: { tier: 3, reason: 'cyanotype_drums: Coiled steel snare wires' },
  8261: { tier: 3, reason: 'cyanotype_guitar: 1955 Gibson dual-coil humbucker pickup' },
  8363: { tier: 3, reason: 'cyanotype_piano: Rightmost grand piano sustain pedal' },
  8491: { tier: 3, reason: 'cyanotype_harmonica: Brass free reeds blow vs draw' },
  // Patchbays
  3865: { tier: 3, reason: 'patchbay_jazz: Miles Davis/Coltrane/Benny Goodman/Trombone' },
  8159: { tier: 2, reason: 'patchbay_classical: Beethoven/Vivaldi/Tchaikovsky/Ravel' },
  8340: { tier: 2, reason: 'patchbay_rock: Queen/MJ/Eagles/Led Zeppelin' },
  8421: { tier: 2, reason: 'patchbay_orch: French horn/Cello/Timpani/Woodwinds' },
  8460: { tier: 2, reason: 'patchbay_pop: Taylor Swift/Beyoncé/Billie Eilish/Dua Lipa' },
  9397: { tier: 2, reason: 'patchbay_music: Forte/Piano/Crescendo/Sforzando' },
  // Balances
  3580: { tier: 2, reason: 'balance_strings: Violin 4 + Guitar 6 = 10 strings' },
  3658: { tier: 2, reason: 'balance_strings: Standard guitar 6 + Concert violin 4 = 10' },
  8184: { tier: 4, reason: 'balance_strings: Soprano ukulele 4 + Concert harp 47 = 51' },
  8273: { tier: 4, reason: 'balance_albums: Thriller 9 + Dark Side of the Moon 10 = 19' },
  8399: { tier: 4, reason: 'balance_charts: Mariah Carey 19 + Beatles 20 = 39 #1s' },
  8471: { tier: 4, reason: 'balance_theory: Major scale 7 + Chromatic 12 = 19' },
  9373: { tier: 4, reason: 'balance_strings: 5-str banjo + 8-str mandolin = 13' },
  // Semantic Jukebox
  115: { tier: 2, reason: 'juke_history: Cristofori ~1700 pianoforte soft and loud' },
  211: { tier: 2, reason: 'juke_history: Handel 1741 Messiah King George II standing' },
  436: { tier: 2, reason: 'juke_theory: Do, Re, Mi medieval solfege' },
  760: { tier: 3, reason: 'juke_physics: Concert pitch A-440 cycles per second' },
  1339: { tier: 2, reason: 'juke_history: Nipper terrier His Master’s Voice 1898' },
  1363: { tier: 2, reason: 'juke_history: Chubby Checker named after Fats Domino' },
  1381: { tier: 3, reason: 'juke_history: Antonio Stradivari Cremona Italy' },
  1402: { tier: 2, reason: 'juke_history: Herb Alpert 1962 Lonely Bull Tijuana bullring' },
  1474: { tier: 2, reason: 'juke_trivia: 1965 Whipped Cream cover shaving cream' },
  6638: { tier: 3, reason: 'juke_history: Newport Jazz earliest festival vs Coachella/Lolla' },
  6650: { tier: 2, reason: 'juke_art: 1967 Velvet Underground Warhol banana' },
  6805: { tier: 2, reason: 'juke_trivia: Bee Gees Stayin’ Alive 103 BPM' },
  6864: { tier: 2, reason: 'chrono_rap: Straight Outta Compton 1988 earliest' },
  7087: { tier: 2, reason: 'chrono_rock: Sgt. Pepper’s 1967 earliest' },
  8061: { tier: 2, reason: 'lasso_pop: Bee Gees Barry, Maurice, Robin' },
  8194: { tier: 2, reason: 'lasso_rock: Nirvana Novoselic, Cobain, Grohl' },
  8206: { tier: 2, reason: 'juke_geo: Sun Studio Memphis Tennessee' },
  8349: { tier: 3, reason: 'juke_tech: Andy Hildebrand 1997 sonar Auto-Tune' },
  8356: { tier: 2, reason: 'juke_history: Little Richard Tutti Frutti Macon' },
  8480: { tier: 2, reason: 'juke_gear: Guitar Capo' },
  8486: { tier: 2, reason: 'lasso_hiphop: Beastie Boys Ad-Rock, Mike D, MCA' },
  9298: { tier: 2, reason: 'juke_history: 1979 Rapper’s Delight one take' },
  9489: { tier: 2, reason: 'lasso_rock: Green Day Billie Joe, Mike Dirnt, Tré Cool' },
  9598: { tier: 2, reason: 'juke_2025: Bad Bunny DeBÍ TiRAR MáS FOToS' },
  9647: { tier: 2, reason: 'juke_brass: Sousaphone rain-catcher' },
  10327: { tier: 2, reason: 'juke_album: 1973 David Bowie Aladdin Sane' },

  // === FINANCE ===
  // Cyanotypes
  3562: { tier: 3, reason: 'cyanotype_fin: Edison glass-domed stock ticker tape' },
  8042: { tier: 3, reason: 'cyanotype_currency: Cotton pulp watermark face' },
  8216: { tier: 3, reason: 'cyanotype_currency: UV glowing polymer security thread' },
  8390: { tier: 3, reason: 'cyanotype_card: EMV cryptographic gold chip' },
  8483: { tier: 4, reason: 'cyanotype_print: Steel-plate intaglio raised ink' },
  // Patchbays
  3786: { tier: 2, reason: 'patchbay_curr: Yen/Sterling/Rupee/Won symbols' },
  8148: { tier: 2, reason: 'patchbay_cash: US bill portraits $1/$5/$20/$100' },
  8230: { tier: 2, reason: 'patchbay_fin: Bull/Bear/Unicorn/Dead-cat' },
  8336: { tier: 3, reason: 'patchbay_mkts: NYSE/FTSE/Nikkei/Frankfurt DAX' },
  8457: { tier: 2, reason: 'patchbay_tickers: AAPL/NVDA/COST/NFLX' },
  9557: { tier: 2, reason: 'patchbay_curr: Euro/Won/Pound/Switzerland CHF' },
  // Balances
  3619: { tier: 2, reason: 'balance_cash: Hamilton $10 + Franklin $100 = $110' },
  3684: { tier: 2, reason: 'balance_coins: 25+10+5+1 = 41 cents' },
  8268: { tier: 4, reason: 'balance_irs: 529 college + 401(k) retire = 930' },
  8446: { tier: 2, reason: 'balance_cash: Lincoln $5 + Jackson $20 = $25' },
  8478: { tier: 3, reason: 'balance_mkts: S&P 500 + Nasdaq-100 = 600' },
  8510: { tier: 3, reason: 'balance_curr: Euro 200 + 100 = 300 EUR' },
  9619: { tier: 2, reason: 'balance_cash: Jackson $20 + Grant $50 = $70' },
  // Semantic Finance
  60: { tier: 3, reason: 'fin_history: 1602 Amsterdam Dutch East India Co. first IPO' },
  206: { tier: 3, reason: 'fin_etym: 1520 Czech Joachimsthaler -> Thaler -> Dollar' },
  288: { tier: 3, reason: 'fin_history: Aztec cacao counterfeits packed with wet clay' },
  314: { tier: 3, reason: 'fin_history: Buffett 1965 Berkshire cotton suit linings' },
  409: { tier: 3, reason: 'fin_history: 1862 Civil War Greenbacks camera-proof ink' },
  589: { tier: 3, reason: 'fin_history: Lloyd’s 1799 Lutine Bell 1 stroke sinking' },
  689: { tier: 3, reason: 'fin_history: Lydia 600 BCE electrum coins' },
  697: { tier: 2, reason: 'fin_history: Medici crest three gold pawn balls' },
  1131: { tier: 2, reason: 'fin_history: Royal Mint Isaac Newton reeded coin edges' },
  1227: { tier: 3, reason: 'fin_mkts: Black Monday Oct 1987 ~22% drop' },
  1245: { tier: 3, reason: 'fin_history: Song Dynasty Jiaozi paper money' },
  1255: { tier: 3, reason: 'fin_history: 6th-c. BCE King Croesus pure gold/silver' },
  1259: { tier: 3, reason: 'fin_corp: Starbucks $1.5B app float > regional banks' },
  1355: { tier: 2, reason: 'fin_corp: WeWork 2019 IPO $5.9M "We" trademark' },
  1366: { tier: 2, reason: 'fin_history: Spanish Pieces of Eight two bits = 25c' },
  3560: { tier: 2, reason: 'lasso_mkts: Dow 30, S&P 500, Nasdaq' },
  3629: { tier: 2, reason: 'fin_history: Weimar Germany 1923 hyperinflation' },
  3802: { tier: 2, reason: 'fin_concept: Compound interest' },
  3885: { tier: 3, reason: 'fin_history: 1637 Haarlem Semper Augustus tulip mania' },
  6603: { tier: 2, reason: 'fin_policy: Fannie Mae & Freddie Mac home mortgages' },
  6690: { tier: 3, reason: 'fin_history: Song Dynasty China 1024 paper money' },
  6709: { tier: 3, reason: 'chrono_fin: Amsterdam 1602 vs NYSE/LSE/NASDAQ' },
  6740: { tier: 3, reason: 'fin_banking: Credit card ~2% interchange fee' },
  6858: { tier: 2, reason: 'fin_econ: Adam Smith 1776 invisible hand' },
  6903: { tier: 3, reason: 'fin_history: Jack Bogle 1976 Vanguard S&P 500 index fund' },
  6918: { tier: 2, reason: 'fin_math: Rule of 72 doubling shortcut' },
  6949: { tier: 2, reason: 'fin_crypto: El Salvador 2021 Bitcoin legal tender' },
  7093: { tier: 2, reason: 'fin_tax: Roth IRA upfront tax-free growth' },
  7120: { tier: 3, reason: 'fin_fx: Kuwaiti dinar highest single currency unit' },
  7127: { tier: 2, reason: 'fin_tech: PayPal Mafia alumni' },
  8112: { tier: 2, reason: 'fin_geo: Zurich Bahnhofstrasse vaults' },
  8151: { tier: 3, reason: 'fin_global: Norway Oil Fund largest sovereign fund' },
  8426: { tier: 3, reason: 'fin_history: 1944 Bretton Woods New Hampshire' },
  8439: { tier: 2, reason: 'lasso_curr: Yen, Yuan, Won Asian currencies' },
  8447: { tier: 2, reason: 'lasso_corp: Microsoft, Apple, Amazon first $1T US firms' },
  8489: { tier: 2, reason: 'lasso_fin: Stocks, Cash, Bonds core asset classes' },
  8513: { tier: 2, reason: 'fin_history: 1934 SEC Joe Kennedy watchdog' },
  8517: { tier: 3, reason: 'lasso_acct: Balance Sheet, Income, Cash Flow statements' },
  8520: { tier: 2, reason: 'fin_tax: 1978 Section 401(k) Plan' },
  8528: { tier: 3, reason: 'chrono_fin: Diners Club Card 1950 vs ATM/PayPal' },
  9312: { tier: 3, reason: 'fin_2025: Greg Abel named Berkshire CEO May 2025' },
  9416: { tier: 2, reason: 'fin_history: Newton 1696 Royal Mint reeded edges' },
  9418: { tier: 3, reason: 'fin_global: Novo Nordisk > Denmark GDP' },
  9484: { tier: 4, reason: 'lasso_mkts: S&P 500 circuit breakers 7%, 13%, 20%' },
  9563: { tier: 2, reason: 'fin_mkts: 2023 Magnificent Seven tech stocks' },
  9646: { tier: 3, reason: 'fin_history: UK Exchequer checkerboard cloth' },

  // === PRICING ===
  // Cyanotypes
  3575: { tier: 3, reason: 'cyanotype_retail: UPC twin guard bars' },
  3702: { tier: 4, reason: 'cyanotype_scale: Toledo butcher-scale fan-chart unit dial' },
  8147: { tier: 3, reason: 'cyanotype_retail: Receipt thermal heating head' },
  8308: { tier: 3, reason: 'cyanotype_retail: Clothing EAS magnetic security tag' },
  8423: { tier: 4, reason: 'cyanotype_mech: Vending machine inductive coin validator' },
  8484: { tier: 4, reason: 'cyanotype_retail: Checkout laser scanner polygon prism' },
  // Patchbays
  3873: { tier: 2, reason: 'patchbay_brand: Tiffany/Louboutin/Hermès/Burberry' },
  8218: { tier: 3, reason: 'patchbay_brand: Rolex Geneva/Gucci Florence/Chanel Paris/Prada Milan' },
  8239: { tier: 2, reason: 'patchbay_price: Freemium/Pay-per-view/Dynamic surge' },
  8372: { tier: 2, reason: 'patchbay_price: Charm pricing/Price anchoring/Decoy sizing' },
  8416: { tier: 2, reason: 'patchbay_game: Monopoly deed colors' },
  9621: { tier: 2, reason: 'patchbay_retail: BOGO/SKU/EOS/COD abbreviations' },
  // Balances
  3704: { tier: 3, reason: 'balance_game: Pass GO $200 + Boardwalk $400 = $600' },
  3914: { tier: 3, reason: 'balance_price: Costco 150c + 1950s burger 50c = 200c' },
  8252: { tier: 2, reason: 'balance_units: Dozen 12 + Score 20 = 32' },
  8359: { tier: 4, reason: 'balance_game: Park Place $350 + Mediterranean $60 = $410' },
  8418: { tier: 3, reason: 'balance_price: Starbucks Hot Venti 20oz + Grande 16oz = 36oz' },
  8527: { tier: 3, reason: 'balance_price: Vintage Coke 5c + AriZona 99c = 104c' },
  9507: { tier: 3, reason: 'balance_price: 1966 stamp 5c + 2024 stamp 73c = 78c' },
  // Semantic Pricing
  4: { tier: 3, reason: 'prc_history: 1925 Ford Model T Runabout $260' },
  187: { tier: 2, reason: 'prc_history: 1966 US First-Class stamp 5 cents' },
  197: { tier: 2, reason: 'prc_history: 1966 US regular gas 32 cents' },
  199: { tier: 2, reason: 'prc_history: Empire State Building built in ~13 months' },
  232: { tier: 2, reason: 'prc_tech: Apple 2020 Mac Pro caster wheels $699' },
  274: { tier: 3, reason: 'prc_history: 1960 Etch A Sketch $3 price' },
  370: { tier: 2, reason: 'prc_retail: Trader Joe’s 19-cent single banana' },
  519: { tier: 2, reason: 'prc_history: 1945 Slinky $1 at Gimbels' },
  752: { tier: 3, reason: 'prc_history: 1954 RCA CT-100 color TV $1,000' },
  773: { tier: 3, reason: 'prc_history: April 1964 Ford Mustang $2,368' },
  812: { tier: 2, reason: 'prc_tech: 2017 Nintendo Switch $299' },
  832: { tier: 3, reason: 'prc_postal: July 2024 Forever stamp 73 cents' },
  857: { tier: 2, reason: 'prc_tech: 2013 PS4 $399 undercut' },
  903: { tier: 2, reason: 'prc_history: 1860 Beadle Dime Novel 10 cents' },
  1006: { tier: 3, reason: 'prc_history: 1992 Hoover UK free flights £100 vacuum' },
  1033: { tier: 2, reason: 'prc_tech: Feb 2005 Amazon Prime $79' },
  1066: { tier: 3, reason: 'prc_history: 1759 Guinness 9,000-yr Dublin lease £45' },
  1135: { tier: 3, reason: 'prc_history: 1950s BIC Cristal 19 cents' },
  1150: { tier: 3, reason: 'prc_tv: Art Fleming March 1964 Jeopardy! Episode 1 $50' },
  1182: { tier: 3, reason: 'prc_tech: Spring 2017 YouTube TV $35 monthly' },
  1186: { tier: 2, reason: 'prc_history: 1969 Woodstock advance 3-day ticket $18' },
  1265: { tier: 2, reason: 'prc_history: 1879 Woolworth 5-and-10-cent ceiling' },
  1393: { tier: 3, reason: 'prc_history: 1948 Boston Polaroid Model 95 $90' },
  1458: { tier: 2, reason: 'prc_auction: MJ 1998 Last Dance jersey $10M' },
  3561: { tier: 2, reason: 'prc_history: 1916 Coney Island Nathan’s 5 cents' },
  3742: { tier: 2, reason: 'prc_history: 1908 Ford Model T launch $850' },
  3744: { tier: 2, reason: 'prc_history: 1904 NYC subway fare 5 cents' },
  3765: { tier: 2, reason: 'prc_history: 1938 Action Comics #1 10 cents' },
  3779: { tier: 3, reason: 'prc_history: 1935 Monopoly set $2' },
  3917: { tier: 2, reason: 'prc_history: 1968 Big Mac 45 cents' },
  6605: { tier: 2, reason: 'prc_gaming: Freemium microtransaction Whales' },
  6617: { tier: 2, reason: 'prc_econ: $19.99 charm pricing' },
  6640: { tier: 2, reason: 'prc_econ: 1986 Economist Big Mac Index' },
  6648: { tier: 3, reason: 'prc_econ: Hidden checkout add-on drip pricing' },
  6651: { tier: 2, reason: 'prc_news: Toyosu 2019 $3.1M Pacific bluefin tuna' },
  6894: { tier: 2, reason: 'prc_tech: Apple Polishing Cloth $19' },
  6990: { tier: 2, reason: 'prc_art: $15M Cremona Stradivarius' },
  7068: { tier: 2, reason: 'prc_auction: 1932 Babe Ruth jersey $24.12M' },
  7070: { tier: 2, reason: 'prc_retail: Sept 2024 Costco Gold Star $65/yr' },
  7115: { tier: 2, reason: 'prc_collect: 1909 T206 Honus Wagner $7.25M' },
  8029: { tier: 2, reason: 'lasso_metals: Silver, Palladium, Platinum bullion' },
  8075: { tier: 2, reason: 'chrono_retail: 1916 Piggly Wiggly earliest' },
  8082: { tier: 3, reason: 'lasso_game: Monopoly Reds Indiana, Illinois, Kentucky' },
  8101: { tier: 3, reason: 'prc_global: Aalsmeer flower auction Netherlands' },
  8235: { tier: 3, reason: 'prc_global: Antwerp Belgium 80% rough diamonds' },
  8476: { tier: 2, reason: 'lasso_luxury: LVMH Louis Vuitton, Tiffany, Dior' },
  8525: { tier: 2, reason: 'prc_dining: Restaurant wine Corkage Fee' },
  9517: { tier: 2, reason: 'prc_law: 1996 John Leonard Pepsi Harrier jet' },
  9599: { tier: 3, reason: 'lasso_game: Monopoly Yellow Atlantic, Ventnor, Marvin Gardens' },
  9606: { tier: 2, reason: 'prc_2025: Nintendo Switch 2 $449.99' },
  10505: { tier: 2, reason: 'prc_history: 1966 US stamp 5 cents' },

  // === ODDS ===
  // Cyanotypes
  3582: { tier: 4, reason: 'cyanotype_stats: Monte Carlo Galton central median bin' },
  3764: { tier: 3, reason: 'cyanotype_stats: Galton quincunx normal bell curve' },
  8121: { tier: 3, reason: 'cyanotype_casino: Blackjack sloped dealing shoe' },
  8155: { tier: 3, reason: 'cyanotype_game: Wire bingo cage' },
  8376: { tier: 3, reason: 'cyanotype_game: Prize wheel leather flapper' },
  8464: { tier: 3, reason: 'cyanotype_casino: Craps tub pyramid bumper' },
  // Patchbays
  3834: { tier: 3, reason: 'patchbay_poker: A-A / A-8+A-8 / K-K / 8-8 poker nicknames' },
  8058: { tier: 2, reason: 'patchbay_chess: Knight/Bishop/Rook/King movement' },
  8076: { tier: 2, reason: 'patchbay_casino: Blackjack/Baccarat/Craps/Poker' },
  8202: { tier: 2, reason: 'patchbay_games: Monopoly/Yahtzee/Scrabble/Backgammon' },
  8213: { tier: 3, reason: 'patchbay_math: Pi 3.14159 / Phi 1.61803 / Sqrt2 1.41421 / e 2.71828' },
  9672: { tier: 2, reason: 'patchbay_games: Yahtzee/Chess/Bingo/Battleship' },
  // Balances
  3602: { tier: 2, reason: 'balance_dice: Craps natural 7 + 11 = 18' },
  8350: { tier: 3, reason: 'balance_casino: Blackjack 21 + Baccarat 9 = 30' },
  8365: { tier: 4, reason: 'balance_bingo: UK Bingo 90 + US Bingo 75 = 165' },
  8410: { tier: 4, reason: 'balance_games: UNO 108 + Mahjong 144 = 252' },
  8501: { tier: 3, reason: 'balance_games: Chutes & Ladders 100 + Monopoly 40 = 140' },
  9451: { tier: 3, reason: 'balance_games: Double-6 dominoes 28 + d6 faces 6 = 34' },
  // Semantic Odds
  49: { tier: 3, reason: 'odds_math: Harmonic mean 60 out / 30 back = 40 mph' },
  54: { tier: 3, reason: 'odds_sports: 2022 Kentucky Derby Rich Strike 80-to-1' },
  101: { tier: 2, reason: 'odds_cs: Pac-Man Level 256 8-bit 255 overflow' },
  118: { tier: 3, reason: 'odds_math: Minimum 17 clues for unique 9x9 Sudoku' },
  132: { tier: 2, reason: 'odds_games: Backgammon 15 checkers per player' },
  154: { tier: 2, reason: 'odds_prob: 100-door Monty Hall 99% switch' },
  233: { tier: 3, reason: 'odds_comb: 10 guests clinking = 45 handshakes/clinks' },
  236: { tier: 3, reason: 'odds_pigeonhole: 10 pairs of gloves -> 11 pulls' },
  295: { tier: 2, reason: 'odds_games: Modern Tetris shuffled 7-piece bag' },
  311: { tier: 2, reason: 'odds_stats: Four-leaf clover ~1 in 5,000' },
  361: { tier: 2, reason: 'odds_geom: One 18-inch pizza > two 12-inch' },
  367: { tier: 3, reason: 'odds_history: 1894 Charles Fey Liberty Bell slot' },
  390: { tier: 2, reason: 'odds_chess: Gukesh 18 yrs youngest world chess champ' },
  403: { tier: 3, reason: 'odds_prob: Persi Diaconis 51% same-side coin flip' },
  485: { tier: 2, reason: 'odds_math: Roulette numbers 1..36 sum to 666' },
  494: { tier: 2, reason: 'odds_games: Wordle ~2,300 curated answers' },
  513: { tier: 2, reason: 'odds_sports: Leicester City 5,000 to 1' },
  522: { tier: 2, reason: 'odds_fin: Rule of 72 double in value' },
  565: { tier: 3, reason: 'odds_casino: Blackjack 6-to-5 quadruples house edge' },
  749: { tier: 2, reason: 'odds_comb: Clue 6×6×9 = 324 combos' },
  766: { tier: 3, reason: 'odds_prob: 63-game March Madness bracket 1 in 9.2 quintillion' },
  771: { tier: 2, reason: 'odds_prob: Birthday paradox 23 people' },
  818: { tier: 3, reason: 'odds_comb: Rubik’s Cube God’s number 20 moves' },
  863: { tier: 2, reason: 'odds_poker: Flush beats Straight (fewer Flushes)' },
  976: { tier: 3, reason: 'odds_casino: Baccarat Banker 1.06% house edge' },
  1005: { tier: 3, reason: 'odds_logic: 8 coins heavy fake in 2 weighings' },
  1012: { tier: 2, reason: 'odds_games: Victor Allis 1988 Connect Four center column' },
  1018: { tier: 3, reason: 'odds_prob: Natural 21 once every 21 hands' },
  1097: { tier: 3, reason: 'odds_casino: Keno 25% to 35% steep house hold' },
  1113: { tier: 5, reason: 'odds_comb: 1,326 Hold’em deals -> 169 distinct starting hands' },
  1278: { tier: 2, reason: 'odds_sports: Super Bowl LI 99.6% Falcons win prob' },
  1279: { tier: 3, reason: 'odds_prob: .300 hitter 0-for-4 ~24% of games' },
  1326: { tier: 2, reason: 'odds_comb: 52! shuffles never existed before' },
  1372: { tier: 2, reason: 'odds_poker: 2003 Chris Moneymaker $2.5M WSOP' },
  1407: { tier: 4, reason: 'odds_casino: Triple-zero 000 roulette 7.69% house edge' },
  1410: { tier: 2, reason: 'odds_logic: 3 burgers on 2-slot grill = 90 seconds' },
  1411: { tier: 3, reason: 'odds_casino: Craps Taking Free Odds 0.00% edge' },
  1478: { tier: 2, reason: 'odds_security: XKCD passphrase length beats swaps' },
  3639: { tier: 2, reason: 'odds_history: 1990 Marilyn vos Savant Monty Hall' },
  3721: { tier: 2, reason: 'lasso_stats: Mean, Median, Mode central tendency' },
  3851: { tier: 2, reason: 'odds_binary: Binary 1010 = 10' },
  3879: { tier: 2, reason: 'odds_prob: Birthday paradox 23' },
  3945: { tier: 3, reason: 'odds_history: 1557 Robert Recorde equals sign =' },
  3953: { tier: 2, reason: 'odds_history: Sudoku invented in Indiana 1979' },
  6657: { tier: 2, reason: 'odds_math: Pigeonhole Principle NYC hair counts' },
  6673: { tier: 2, reason: 'odds_poker: Ace-King Big Slick' },
  6691: { tier: 2, reason: 'odds_sports: 50% on 2s = 33.3% on 3s' },
  6737: { tier: 3, reason: 'odds_geom: 20-faced icosahedron die' },
  6746: { tier: 2, reason: 'odds_chess: 2-move Fool’s Mate' },
  6834: { tier: 2, reason: 'odds_comb: 52-card deck orders > Rubik/Powerball' },
  6954: { tier: 3, reason: 'odds_poker: Two Pair more frequent than Three of a Kind' },
  6956: { tier: 3, reason: 'odds_casino: European single-zero roulette 2.70%' },
  6957: { tier: 2, reason: 'odds_prob: Dice sum of 8 rolls more often than 9/10/11' },
  6965: { tier: 2, reason: 'odds_casino: Casino Keno worst house edge' },
  7032: { tier: 2, reason: 'odds_math: Pascal’s Triangle binomial row 4' },
  7096: { tier: 2, reason: 'odds_games: Monopoly Orange properties top ROI' },
  7134: { tier: 2, reason: 'odds_stats: Law of Large Numbers' },
  7154: { tier: 2, reason: 'odds_sports: 1990 Buster Douglas 42-to-1 upset' },
  8046: { tier: 2, reason: 'odds_history: Stanisław Ulam Monte Carlo Monaco' },
  8319: { tier: 2, reason: 'odds_betting: Multi-leg Parlay Bet' },
  8355: { tier: 2, reason: 'odds_math: Edward Lorenz 1961 Chaos Theory' },
  9314: { tier: 2, reason: 'odds_chess: Gukesh Dommaraju Dec 2024' },
  9317: { tier: 2, reason: 'odds_math: Standard 6-sided die 21 pips total' },
  9334: { tier: 2, reason: 'odds_games: Scrabble most common letter E (12 tiles)' },
  9355: { tier: 2, reason: 'lasso_poker: Hold’em Flop, Turn, River' },
  9419: { tier: 2, reason: 'odds_games: 1957 Risk 42 territories' },
  9588: { tier: 2, reason: 'odds_games: Balatro 8 Antes' },
  9604: { tier: 2, reason: 'odds_history: 1920 Edward Kasner googol' },
  10449: { tier: 2, reason: 'odds_prob: Birthday paradox 23 people' },

  // === ATLAS ===
  // Cyanotypes
  3569: { tier: 4, reason: 'cyanotype_nav: Brass sextant tinted solar shade' },
  3589: { tier: 3, reason: 'cyanotype_eng: Panama Canal V-angled miter lock gates' },
  8212: { tier: 3, reason: 'cyanotype_map: 32-wind compass rose' },
  8280: { tier: 4, reason: 'cyanotype_nav: Marine compass gimbal ring' },
  8296: { tier: 3, reason: 'cyanotype_survey: Surveyed bronze benchmark disc' },
  8328: { tier: 3, reason: 'cyanotype_map: Topographic contour line' },
  // Patchbays
  3577: { tier: 3, reason: 'patchbay_geo: Gibraltar/Bering/Bosphorus/Sunda straits' },
  8021: { tier: 2, reason: 'patchbay_geo: Windy City/City of Light/Big Apple/Venice' },
  8254: { tier: 2, reason: 'patchbay_geo: Andes/Himalayas/Alps/Kilimanjaro' },
  8257: { tier: 2, reason: 'patchbay_geo: Sicily/Crete/Hokkaido/Spain' },
  8468: { tier: 2, reason: 'patchbay_geo: Grand Canyon/Yosemite/Acadia/Montana' },
  9360: { tier: 2, reason: 'patchbay_geo: Paris/DC/London/Tiber rivers' },
  9396: { tier: 2, reason: 'patchbay_geo: Suez/Grand/Panama/Kiel canals' },
  // Balances
  3595: { tier: 2, reason: 'balance_geo: 7 continents + 5 oceans = 12' },
  3663: { tier: 2, reason: 'balance_geo: 5 Great Lakes + 7 continents = 12' },
  8087: { tier: 4, reason: 'balance_geo: Tennessee borders 8 + Four Corners 4 = 12' },
  8100: { tier: 4, reason: 'balance_geo: Australia 6 states + US Lower 48 = 54' },
  8102: { tier: 4, reason: 'balance_geo: 50-State US 6 zones + World 24 = 30' },
  8236: { tier: 4, reason: 'balance_geo: London 32 boroughs + NYC 5 = 37' },
  9313: { tier: 3, reason: 'balance_geo: Africa 54 nations + South America 12 = 66' },
  // Semantic Atlas
  203: { tier: 2, reason: 'atl_eng: Taipei 101 730-ton damper Taiwan' },
  244: { tier: 2, reason: 'atl_pol: North Macedonia 2019 Prespa accord' },
  256: { tier: 2, reason: 'atl_geo: Hamburg ~2,500 bridges' },
  298: { tier: 2, reason: 'atl_geo: Swaziland renamed Eswatini 2018' },
  319: { tier: 2, reason: 'atl_eng: Øresund Bridge sea tunnel tall ships & jets' },
  365: { tier: 3, reason: 'atl_geol: Niagara Falls erodes ~4 feet/year' },
  428: { tier: 2, reason: 'atl_geo: Czechia 2016 short UN name' },
  567: { tier: 3, reason: 'atl_eng: Petronas skybridge slides on bearings' },
  579: { tier: 2, reason: 'atl_geo: Cabo Verde no English translation' },
  585: { tier: 2, reason: 'atl_geo: Mount Whitney 85 miles from Badwater Basin' },
  757: { tier: 2, reason: 'atl_urban: Chongqing Liziba apartment monorail' },
  782: { tier: 3, reason: 'atl_geo: Edinburgh farther west than Liverpool' },
  816: { tier: 2, reason: 'atl_tech: what3words 3-meter global grid' },
  911: { tier: 2, reason: 'atl_econ: Shenzhen 1980 Special Economic Zone' },
  939: { tier: 2, reason: 'atl_geo: Reno Nevada west of Los Angeles' },
  944: { tier: 2, reason: 'atl_geo: Jan 2022 Hunga Tonga eruption' },
  1090: { tier: 2, reason: 'atl_geo: 66-mile roadless Darién Gap' },
  1221: { tier: 3, reason: 'atl_eng: HK-Zhuhai-Macau bridge left/right driving flip' },
  1238: { tier: 2, reason: 'atl_urban: Chongqing China monorail' },
  1252: { tier: 3, reason: 'atl_geo: Rhine Falls Switzerland Europe’s largest plain falls' },
  1285: { tier: 3, reason: 'atl_geo: Atlanta west of Detroit 83°W' },
  1380: { tier: 2, reason: 'atl_geo: Juba South Sudan 2011 capital' },
  1391: { tier: 3, reason: 'atl_urban: Medellín Comuna 13 outdoor escalators' },
  1392: { tier: 3, reason: 'atl_geo: Saudi Arabia Highway 10 149-mile straightaway' },
  1399: { tier: 2, reason: 'atl_geo: Okavango Delta Kalahari Desert' },
  1415: { tier: 2, reason: 'atl_geo: 24-mile Lake Pontchartrain causeway' },
  1435: { tier: 2, reason: 'atl_urban: La Paz Teleférico cable cars' },
  1452: { tier: 2, reason: 'atl_pol: Croatia Jan 2023 Euro + Schengen' },
  6660: { tier: 2, reason: 'atl_geo: Zhangjiajie Avatar Hallelujah Mountain' },
  6681: { tier: 2, reason: 'atl_geo: France 12 time zones' },
  6758: { tier: 2, reason: 'atl_hist: 537 CE Hagia Sophia Justinian' },
  6840: { tier: 2, reason: 'atl_geo: Bosphorus Strait Istanbul' },
  6876: { tier: 2, reason: 'atl_geo: Cape Horn Chile' },
  6883: { tier: 2, reason: 'atl_geo: Bolivia Salar de Uyuni salt mirror' },
  7136: { tier: 2, reason: 'atl_geo: Volga longest European river' },
  7140: { tier: 2, reason: 'atl_geo: Africa 54 UN countries' },
  8122: { tier: 3, reason: 'atl_geo: Lofoten Islands Norway' },
  8173: { tier: 2, reason: 'atl_geo: Cappadocia Turkey fairy chimneys' },
  8180: { tier: 2, reason: 'atl_geo: Great Rift Valley East Africa' },
  8232: { tier: 2, reason: 'atl_geo: Andes longest continental mountain chain' },
  8299: { tier: 2, reason: 'atl_geol: Alfred Wegener 1912 Pangaea' },
  8305: { tier: 2, reason: 'atl_hist: Ben Franklin 1769 Gulf Stream' },
  8307: { tier: 3, reason: 'chrono_geo: Mercator Chart 1569' },
  8391: { tier: 2, reason: 'lasso_geo: Strict Scandinavia Sweden, Denmark, Norway' },
  8425: { tier: 2, reason: 'atl_geol: Oxbow Lake river meander' },
  9320: { tier: 3, reason: 'atl_news: Grindavík Iceland 2023-25 eruptions' },
  9530: { tier: 3, reason: 'atl_news: Fujikawaguchiko 2024 Mount Fuji mesh screen' },
  9534: { tier: 3, reason: 'atl_nautical: Horse Latitudes 30 degrees' },
  9541: { tier: 2, reason: 'atl_geo: Greater London north of Calgary 51.5°' },
  9596: { tier: 3, reason: 'atl_news: A23a megaberg Weddell Sea' },

  // === SPORTS ===
  // Cyanotypes
  3741: { tier: 3, reason: 'cyanotype_aero: Golf ball 336 aerodynamic dimples' },
  3898: { tier: 5, reason: 'cyanotype_watch: Stopwatch reciprocal 3600/t tachymeter bezel' },
  8187: { tier: 3, reason: 'cyanotype_gear: Tennis racket nylon grommets' },
  8244: { tier: 4, reason: 'cyanotype_gear: Hockey skate blade U-shaped hollow' },
  8291: { tier: 3, reason: 'cyanotype_track: Sprinter starting blocks' },
  8314: { tier: 3, reason: 'cyanotype_bball: Arthur Ehrat 1975 breakaway rim' },
  // Patchbays
  3726: { tier: 2, reason: 'patchbay_tennis: Roland-Garros/Wimbledon/US Open/Madrid blue clay' },
  8071: { tier: 2, reason: 'patchbay_martial: Judo/Taekwondo/Muay Thai/Capoeira' },
  8143: { tier: 2, reason: 'patchbay_soccer: Messi/Mbappé/Ronaldo/Brazil' },
  8250: { tier: 2, reason: 'patchbay_olympics: Biles/Phelps/Bolt/Figure skating' },
  8414: { tier: 2, reason: 'patchbay_sports: Pick-six/Alley-oop/Strikeout/Hockey' },
  9623: { tier: 3, reason: 'patchbay_sports: Hat trick/Eagle/Turkey/Cricket 100' },
  // Balances
  3552: { tier: 2, reason: 'balance_sports: Soccer 11 + Basketball 5 = 16' },
  3897: { tier: 2, reason: 'balance_sports: Soccer side 11 + Hoops 5 = 16' },
  3915: { tier: 2, reason: 'balance_sports: Golf 18 holes + Ten-pin bowling 10 = 28' },
  8124: { tier: 3, reason: 'balance_baseball: 9-inning outs 27 + Field starters 9 = 36' },
  8135: { tier: 3, reason: 'balance_leagues: MLB 30 + NFL 32 = 62 franchises' },
  8284: { tier: 2, reason: 'balance_nba: Wilt 100 + Kobe 81 = 181 pts' },
  8310: { tier: 2, reason: 'balance_rings: Brady 7 + Jordan 6 = 13 rings' },
  9601: { tier: 3, reason: 'balance_sports: Rugby Union 15 + Indoor volleyball 6 = 21' },
  // Semantic Sports
  126: { tier: 2, reason: 'spt_2024: Turkish shooter Yusuf Dikeç Paris 2024' },
  278: { tier: 3, reason: 'spt_history: Tour de France polka-dot Poulain chocolate' },
  391: { tier: 3, reason: 'spt_f1: McLaren 2023 Qatar 1.80s pit stop' },
  442: { tier: 2, reason: 'spt_mlb: 108 double red stitches on baseball' },
  641: { tier: 2, reason: 'spt_soccer: Brazil’s Marta scored in 5 World Cups' },
  814: { tier: 2, reason: 'spt_racing: Secretariat 1973 Belmont 31 lengths' },
  853: { tier: 2, reason: 'spt_mlb: Bases 90 feet apart' },
  867: { tier: 2, reason: 'spt_history: Ancient Greek wild olive wreath kotinos' },
  917: { tier: 3, reason: 'spt_history: 1860s John Wesley Hyatt celluloid billiard balls' },
  1172: { tier: 3, reason: 'spt_2024: Paris Olympic medal 18g Eiffel Tower iron' },
  1217: { tier: 2, reason: 'spt_mlb: New Jersey creek baseball rubbing mud' },
  1244: { tier: 2, reason: 'spt_nfl: Green Bay Packers 1919 potted meat sponsor' },
  1287: { tier: 3, reason: 'spt_history: 1935 Heisman modeled on NYU’s Ed Smith' },
  1383: { tier: 2, reason: 'spt_cricket: The Ashes urn holds wooden cricket bail' },
  1470: { tier: 2, reason: 'spt_mlb: 108 double stitches on MLB ball' },
  3947: { tier: 2, reason: 'spt_olympics: 1968 Mexico City Fosbury Flop' },
  6925: { tier: 2, reason: 'spt_mlb: Joe DiMaggio 1941 56-game streak' },
  8028: { tier: 2, reason: 'spt_soccer: Mia Hamm 158 goals 1991/1999' },
  8462: { tier: 2, reason: 'spt_curling: Last stone advantage The Hammer' },
  9452: { tier: 2, reason: 'spt_2024: Yusuf Dikeç Paris 2024 pistol' },
  9578: { tier: 2, reason: 'spt_2024: Spanish teen Lamine Yamal Euro 2024' },
  9586: { tier: 2, reason: 'chrono_sports: Wimbledon 1877 earliest major' },
  9622: { tier: 2, reason: 'spt_physics: Badminton smash fastest >300 mph' },
  10269: { tier: 2, reason: 'spt_mlb: Willie Mays 1954 World Series Catch' },

  // === DYNASTIES ===
  // Cyanotypes
  3592: { tier: 3, reason: 'cyanotype_castle: Portcullis chain winch gear' },
  3854: { tier: 4, reason: 'cyanotype_egypt: Great Pyramid granite relieving chambers' },
  8387: { tier: 3, reason: 'cyanotype_siege: Trebuchet counterweight box' },
  8393: { tier: 4, reason: 'cyanotype_naval: Viking longship clinker hull' },
  8504: { tier: 3, reason: 'cyanotype_castle: Fortress arrow slit embrasure' },
  8514: { tier: 3, reason: 'cyanotype_arch: Roman arch keystone wedge' },
  // Patchbays
  8219: { tier: 2, reason: 'patchbay_hist: Roman/Inca/Mughal/Angkor Wat' },
  8326: { tier: 3, reason: 'patchbay_hist: Tudor/Bourbon/Romanov/Habsburg' },
  8419: { tier: 2, reason: 'patchbay_hist: Cleopatra/Elizabeth I/Catherine/China' },
  8479: { tier: 2, reason: 'patchbay_hist: Genghis/Alexander/Caesar/Ottoman' },
  9544: { tier: 3, reason: 'patchbay_hist: Versailles/Forbidden City/Winter Palace/Ottoman' },
  // Balances
  3801: { tier: 3, reason: 'balance_tudor: Henry VIII 6 wives + 3 monarchs = 9' },
  8171: { tier: 4, reason: 'balance_wars: Hundred Years (116) + Thirty Years (30) = 146' },
  8220: { tier: 3, reason: 'balance_queens: Elizabeth II (70) + Victoria (63) = 133' },
  8405: { tier: 2, reason: 'balance_french: Louis XIV (14) + Louis XVI (16) = 30' },
  8428: { tier: 4, reason: 'balance_rome: Five Good Emperors + 7 Early Kings = 12' },
  9514: { tier: 4, reason: 'balance_rome: 7 Early Kings + 3 First Triumvirate = 10' },
  9523: { tier: 5, reason: 'balance_egypt: 30 Pre-Ptolemy dynasties + 4 Giza pyramids = 34' },
  // Semantic Dynasties
  21: { tier: 2, reason: 'dyn_rome: Pompeii thermopolium street snack bar' },
  53: { tier: 2, reason: 'dyn_uk: King George I 1714 spoke almost no English' },
  74: { tier: 2, reason: 'dyn_modern: Sweden 1980 absolute primogeniture' },
  186: { tier: 3, reason: 'dyn_date: 1588 Spanish Armada' },
  271: { tier: 2, reason: 'dyn_date: 1215 Magna Carta Runnymede' },
  276: { tier: 2, reason: 'dyn_egypt: Cleopatra VII first Ptolemy to speak Egyptian' },
  338: { tier: 2, reason: 'dyn_greece: Sparta laconic single word "If"' },
  385: { tier: 3, reason: 'dyn_maya: Maya pok-ta-pok leather-belted hips' },
  487: { tier: 2, reason: 'dyn_japan: Naruhito Chrysanthemum Throne' },
  529: { tier: 3, reason: 'dyn_rome: Marcus Aurelius Meditations Notes to Himself' },
  541: { tier: 3, reason: 'dyn_uk: 1651 Charles II Royal Oak Roundhead patrols' },
  566: { tier: 3, reason: 'dyn_modern: Cambodia King Norodom Sihamoni ballet instructor' },
  569: { tier: 2, reason: 'dyn_date: 1066 William the Conqueror Hastings' },
  586: { tier: 3, reason: 'dyn_rome: Marcus Crassus private fire brigade' },
  623: { tier: 2, reason: 'dyn_rome: Roman vomitorium stadium exit passage' },
  647: { tier: 3, reason: 'dyn_africa: Ashanti Sika dwa Kofi Golden Stool' },
  674: { tier: 3, reason: 'dyn_arch: Stonehenge 2020 West Woods Wiltshire' },
  705: { tier: 2, reason: 'dyn_europe: French President elected Co-Prince of Andorra' },
  794: { tier: 3, reason: 'dyn_date: 1603 Tokugawa Edo shogunate' },
  795: { tier: 3, reason: 'dyn_japan: 1612 Miyamoto Musashi wooden boat oar duel' },
  875: { tier: 4, reason: 'dyn_egypt: Narmer Pschent double red/white lotus crown' },
  882: { tier: 2, reason: 'dyn_rome: Vespasian Money does not stink' },
  888: { tier: 2, reason: 'dyn_tudor: Anne of Cleves outlived all other wives' },
  900: { tier: 3, reason: 'dyn_japan: 1609 Himeji Castle fireproof white lime plaster' },
  909: { tier: 3, reason: 'dyn_viking: Iceland Althing Thingvellir 930 CE' },
  921: { tier: 2, reason: 'dyn_viking: Leif Erikson 1000 Newfoundland' },
  981: { tier: 2, reason: 'dyn_rome: Caligula horse Incitatus Roman Consul' },
  1008: { tier: 4, reason: 'dyn_niche: King Charles III Aston Martin wine & cheese whey' },
  1082: { tier: 3, reason: 'dyn_europe: Monaco 1297 Francesco Grimaldi monk disguise' },
  1133: { tier: 3, reason: 'dyn_rome: 305 CE Diocletian garden cabbages' },
  1183: { tier: 3, reason: 'dyn_mongol: Genghis Khan Yam relay horse network' },
  1203: { tier: 3, reason: 'dyn_spain: 1981 King Juan Carlos Captain-General uniform' },
  1208: { tier: 2, reason: 'dyn_tudor: 1553 Lady Jane Grey Nine Days Queen' },
  1237: { tier: 3, reason: 'dyn_china: Wu Zetian lone female Huangdi' },
  1325: { tier: 3, reason: 'dyn_japan: Sen no Rikyū 30-inch nijiriguchi tearoom door' },
  1503: { tier: 3, reason: 'dyn_arch: 2021 Sichuan Sanxingdui Shu gold mask' },
  3679: { tier: 2, reason: 'dyn_egypt: 1799 Bouchard Rosetta Stone Ptolemy V' },
  6619: { tier: 2, reason: 'dyn_uk: 1415 Henry V Agincourt' },
  6679: { tier: 2, reason: 'dyn_uk: ~1020 King Canute rising tide' },
  6715: { tier: 2, reason: 'dyn_spain: 2007 King Juan Carlos Why don’t you shut up?' },
  6754: { tier: 3, reason: 'dyn_india: ~260 BCE Mauryan Emperor Ashoka Kalinga' },
  6809: { tier: 2, reason: 'dyn_japan: 2019 Reiwa era native Manyoshu poetry' },
  6812: { tier: 3, reason: 'dyn_uk: Edward V shorter reign than Edward VIII/Richard III' },
  6835: { tier: 2, reason: 'dyn_japan: 2021 Princess Mako commoner marriage' },
  6905: { tier: 3, reason: 'dyn_chrono: Ming Dynasty collapsed earlier than Ottoman/Qing/Mughal' },
  6931: { tier: 2, reason: 'dyn_prussia: Frederick the Great potato guards trick' },
  6973: { tier: 2, reason: 'dyn_uk: 335-lb Stone of Scone' },
  7094: { tier: 3, reason: 'dyn_2025: Feb 2025 Thutmose II tomb Luxor' },
  8231: { tier: 3, reason: 'lasso_egypt: Khafre, Khufu, Menkaure Giza pharaohs' },
  8300: { tier: 3, reason: 'lasso_empires: Safavid, Ottoman, Mughal Gunpowder Empires' },
  8344: { tier: 3, reason: 'dyn_india: 16th-c. Mughal Emperor Akbar the Great' },
  8346: { tier: 2, reason: 'dyn_japan: 1868 Emperor Meiji Restoration' },
  8354: { tier: 2, reason: 'lasso_tudor: Mary I, Elizabeth I, Edward VI' },
  8357: { tier: 2, reason: 'chrono_dyn: Ramesses II 1279 BCE first' },
  8472: { tier: 3, reason: 'dyn_uk: 1661 St. Edward’s coronation crown' },
  9342: { tier: 2, reason: 'dyn_2024: King Frederik X Denmark Jan 2024' },
  9421: { tier: 3, reason: 'lasso_tudor: Henry VIII Catherines Aragon, Howard, Parr' },
  9422: { tier: 2, reason: 'dyn_2024: Assad family 5 decades Syria' },
  9473: { tier: 5, reason: 'lasso_medieval: 843 Treaty of Verdun Lothair, Louis, Charles' },
  9548: { tier: 3, reason: 'dyn_rome: 193 AD Praetorian Guard auctioned Roman Empire' },
  9551: { tier: 3, reason: 'chrono_dyn: Qing Dynasty 1912 lasted longest' },
  9573: { tier: 2, reason: 'dyn_uk: 1215 Magna Carta Runnymede' },

  // === HEADLINES ===
  // Cyanotypes
  3761: { tier: 3, reason: 'cyanotype_space: Apollo 13 square-to-round CO2 scrubber' },
  8070: { tier: 3, reason: 'cyanotype_vote: Mechanical voting booth curtain' },
  8078: { tier: 4, reason: 'cyanotype_space: Apollo capsule ablative heat shield' },
  8165: { tier: 3, reason: 'cyanotype_aero: Black box ultrasonic locator beacon' },
  8183: { tier: 3, reason: 'cyanotype_comm: 1844 Morse telegraph brass key' },
  // Patchbays
  3855: { tier: 2, reason: 'patchbay_news: Hindenburg/Apollo 11/Reagan/JFK quotes' },
  8054: { tier: 2, reason: 'patchbay_2020s: Ever Given/JWST/Paris Olympics' },
  8215: { tier: 2, reason: 'patchbay_exp: Lindbergh/Everest/Amundsen/Earhart' },
  8302: { tier: 2, reason: 'patchbay_dates: Apollo 11/Berlin Wall/D-Day/VE Day' },
  8364: { tier: 2, reason: 'patchbay_pol: New Deal/Yes We Can/Morning in America/JFK' },
  9358: { tier: 3, reason: 'patchbay_space: Apollo 11/New Horizons/Sojourner/Skylab' },
  9652: { tier: 3, reason: 'patchbay_law: 1st/13th/19th/26th Amendments' },
  // Balances
  3628: { tier: 2, reason: 'balance_us: 13 Colonies + 37 Added States = 50' },
  3818: { tier: 3, reason: 'balance_us: 2 Senators/state + 9 SCOTUS = 11' },
  8096: { tier: 3, reason: 'balance_us: 18th + 21st Amendments = 39' },
  8172: { tier: 3, reason: 'balance_us: 100 Senate + 435 House = 535 Congress' },
  8256: { tier: 3, reason: 'balance_us: Trump #47 + Cleveland #24 = 71' },
  8455: { tier: 2, reason: 'balance_space: Apollo 11 + Apollo 13 = 24' },
  9307: { tier: 4, reason: 'balance_space: 11 crewed Apollos + 6 landings = 17' },
  9668: { tier: 2, reason: 'balance_us: 50 stars + 13 stripes = 63' },
  // Semantic Headlines
  141: { tier: 2, reason: 'hdl_history: Pony Express lasted only 18 months' },
  144: { tier: 2, reason: 'hdl_history: 1989 Günter Schabowski Berlin Wall blunder' },
  297: { tier: 3, reason: 'hdl_history: 1989 Prague Velvet Revolution pocket keys' },
  321: { tier: 2, reason: 'hdl_news: Feb 2013 Pope Benedict XVI Latin resignation' },
  627: { tier: 3, reason: 'hdl_world: Kiruna Sweden moving town two miles east' },
  659: { tier: 3, reason: 'hdl_crime: 2019 Dresden Green Vault diamond heist' },
  820: { tier: 2, reason: 'hdl_space: 2022 NASA DART asteroid Dimorphos' },
  1063: { tier: 3, reason: 'hdl_crime: 2017 Berlin Bode 220-lb gold coin heist' },
  1174: { tier: 3, reason: 'hdl_space: 2022 Artemis I Moonikin Campos Apollo 13 engineer' },
  1188: { tier: 3, reason: 'hdl_space: 1979 Skylab $400 Esperance littering fine' },
  1206: { tier: 3, reason: 'hdl_history: Aug 1989 Baltic Way 420-mile chain Lithuania' },
  1282: { tier: 2, reason: 'hdl_news: 2013 Chelyabinsk Russian car dashcams' },
  1312: { tier: 3, reason: 'hdl_science: 2019 EHT 5 petabytes shipped in hard-drive crates' },
  1385: { tier: 3, reason: 'hdl_history: May 1987 Mathias Rust Cessna Red Square' },
  1400: { tier: 3, reason: 'hdl_space: 2023 OSIRIS-REx Bennu jammed fasteners' },
  3701: { tier: 2, reason: 'hdl_uk: House of Commons two dueling-blade lengths' },
  3774: { tier: 2, reason: 'hdl_world: Australia compulsory voting' },
  3797: { tier: 2, reason: 'hdl_law: Libel written vs slander spoken' },
  6644: { tier: 2, reason: 'hdl_history: 1948 $13B Marshall Plan' },
  6646: { tier: 2, reason: 'hdl_history: Jan 1848 Sutter’s Mill California Gold Rush' },
  6664: { tier: 2, reason: 'hdl_history: 1867 Seward’s Folly Alaska purchase' },
  6693: { tier: 2, reason: 'hdl_2024: July 2024 CrowdStrike Windows outage' },
  6735: { tier: 2, reason: 'hdl_history: 1940 Tacoma Narrows Galloping Gertie' },
  6736: { tier: 2, reason: 'hdl_news: 2010 Iceland Eyjafjallajökull ash cloud' },
  6761: { tier: 2, reason: 'hdl_space: 1990 Voyager 1 Pale Blue Dot' },
  6853: { tier: 3, reason: 'hdl_space: Asteroid Bennu OSIRIS-REx' },
  6923: { tier: 2, reason: 'hdl_news: Sept 2021 El Salvador Bitcoin legal tender' },
  6978: { tier: 2, reason: 'chrono_hdl: Lindbergh 1927 before Penicillin/Crash/Hindenburg' },
  7109: { tier: 2, reason: 'hdl_news: Iberian orcas snapping boat rudders' },
  8086: { tier: 2, reason: 'lasso_ww2: Japan, Germany, Italy Axis Big Three' },
  8192: { tier: 2, reason: 'lasso_us: Johnson, Clinton, Trump impeached presidents' },
  8210: { tier: 2, reason: 'chrono_hdl: 19th Amendment 1920 first' },
  8222: { tier: 2, reason: 'hdl_us: May 1954 Brown v. Board' },
  8322: { tier: 2, reason: 'hdl_world: UN Security Council 5 permanent veto nations' },
  8454: { tier: 2, reason: 'lasso_france: Liberty, Equality, Fraternity' },
  9324: { tier: 2, reason: 'hdl_uk: Liz Truss resigned after 49 days' },
  9403: { tier: 3, reason: 'lasso_ww2: Tehran, Yalta, Potsdam Allied summits' },
  9513: { tier: 3, reason: 'lasso_nobel: T. Roosevelt, Wilson, Obama sitting Nobel Peace' },
  9637: { tier: 2, reason: 'hdl_ww1: 1918 dazzle camouflage ships' },
  9680: { tier: 2, reason: 'hdl_2024: Claudia Sheinbaum Mexico first female president' },

  // === FOLKLORE ===
  // Cyanotypes
  3808: { tier: 4, reason: 'cyanotype_clock: Clock-tower automaton procession door arch' },
  8032: { tier: 3, reason: 'cyanotype_folk: 17th-c. stoneware witch bottle' },
  8275: { tier: 3, reason: 'cyanotype_folk: Ouija heart-shaped planchette' },
  8385: { tier: 3, reason: 'cyanotype_folk: Ojibwe willow dreamcatcher' },
  8411: { tier: 3, reason: 'cyanotype_symbol: Tail-biting Ouroboros serpent' },
  // Patchbays
  3574: { tier: 3, reason: 'patchbay_myth: Excalibur/Round Table/Green Girdle/Tristan' },
  8125: { tier: 2, reason: 'patchbay_cryptid: Nessie/Bigfoot/Chupacabra/Yeti' },
  8131: { tier: 2, reason: 'patchbay_myth: Zeus/Poseidon/Athena/Hermes' },
  8312: { tier: 2, reason: 'patchbay_fables: Aesop Tortoise/Wolf/Fox/Goose' },
  8526: { tier: 2, reason: 'patchbay_norse: Mjolnir/Yggdrasil/Bifrost/Sleipnir' },
  9332: { tier: 2, reason: 'patchbay_myth: Quetzalcoatl/Pegasus/Kraken/Kelpie' },
  9654: { tier: 2, reason: 'patchbay_myth: Poseidon/Apollo/Hestia/Hermes' },
  // Balances
  3568: { tier: 3, reason: 'balance_myth: 12 Olympians + 3 Moirai Fates = 15' },
  8150: { tier: 2, reason: 'balance_lore: 4-leaf clover + 9 cat lives = 13' },
  8277: { tier: 3, reason: 'balance_lore: Rip Van Winkle 20 + Sleeping Beauty 100 = 120' },
  8400: { tier: 2, reason: 'balance_lore: 8 poem reindeer + Rudolph = 9' },
  8444: { tier: 3, reason: 'balance_myth: Cerberus 3 + Hydra 9 heads = 12' },
  9591: { tier: 2, reason: 'balance_lore: 7 dwarfs + 3 bears = 10' },
  9607: { tier: 4, reason: 'balance_tarot: 22 Major Arcana + 4 Minor suits = 26' },
  // Semantic Folklore
  52: { tier: 3, reason: 'flk_myth: Hercules mortal mother queen Alcmene' },
  248: { tier: 2, reason: 'flk_norse: Mjölnir stubby handle Loki horsefly' },
  318: { tier: 2, reason: 'flk_internet: Trevor Henderson 2018 Siren Head' },
  324: { tier: 2, reason: 'flk_culture: Lunar New Year hongbao skip 4 = death' },
  716: { tier: 3, reason: 'flk_norse: Hel corpse-blue and black' },
  1027: { tier: 3, reason: 'flk_cryptid: 1995 Chupacabra sketch from movie Species' },
  1036: { tier: 3, reason: 'flk_norse: Ratatoskr Yggdrasil insult squirrel' },
  1073: { tier: 2, reason: 'flk_fairytale: Cinderella verre vs vair squirrel fur' },
  1078: { tier: 2, reason: 'flk_internet: 2009 Slender Man Something Awful' },
  1099: { tier: 2, reason: 'flk_cryptid: Point Pleasant WV Mothman canned beans' },
  1349: { tier: 2, reason: 'flk_classic: Sword of Damocles single horsehair' },
  1423: { tier: 3, reason: 'flk_egypt: Hippo goddess Taweret safe childbirth' },
  1477: { tier: 3, reason: 'flk_history: Thanksgiving wishbone Etruscan sacred hens' },
  3796: { tier: 2, reason: 'flk_etym: Erasmus mistranslated Pandora storage jar' },
  6615: { tier: 2, reason: 'chrono_myth: Gilgamesh 1800 BCE earliest' },
  6701: { tier: 2, reason: 'flk_internet: 2007 SCP Foundation' },
  6782: { tier: 2, reason: 'flk_meso: Quetzalcoatl feathered serpent' },
  6871: { tier: 2, reason: 'flk_latin: La Llorona Weeping Woman' },
  6902: { tier: 2, reason: 'flk_myth: Lernaean Hydra most heads' },
  6972: { tier: 3, reason: 'flk_china: Chang’e Moon Goddess Jade Rabbit' },
  6979: { tier: 2, reason: 'flk_norse: Rainbow bridge Bifröst' },
  7098: { tier: 2, reason: 'flk_arthur: Avalon isle of apples' },
  8025: { tier: 2, reason: 'lasso_myth: Odyssey Sirens, Scylla, Cyclops' },
  8223: { tier: 3, reason: 'chrono_lore: Geoffrey of Monmouth 1136 King Arthur' },
  8432: { tier: 2, reason: 'flk_heraldry: Eagle + lion Griffin' },
  9367: { tier: 2, reason: 'chrono_lore: Aesop’s Fables 550 BCE earliest' },
  9503: { tier: 3, reason: 'lasso_myth: Maiden goddesses Athena, Artemis, Hestia' },
  9542: { tier: 2, reason: 'flk_lore: Original Aladdin set in Ancient China' },
  9567: { tier: 4, reason: 'lasso_myth: Greek Three Graces Aglaea, Euphrosyne, Thalia' },

  // === FALLACIES ===
  // Cyanotypes
  3776: { tier: 3, reason: 'cyanotype_logic: Motte-and-bailey castle argument tactic' },
  3789: { tier: 5, reason: 'cyanotype_logic: Syllogistic Venn overlap lens' },
  8170: { tier: 4, reason: 'cyanotype_illusion: Slanted trapezoid Ames room' },
  8285: { tier: 3, reason: 'cyanotype_illusion: Impossible Penrose stairs' },
  8383: { tier: 3, reason: 'cyanotype_illusion: 1915 Danish Rubin vase' },
  8494: { tier: 3, reason: 'cyanotype_illusion: 1832 Swiss Necker wire cube' },
  // Patchbays
  3641: { tier: 3, reason: 'patchbay_logic: Ad hominem/Tu quoque/Post hoc/Red herring' },
  8047: { tier: 2, reason: 'patchbay_psych: Confirmation/Halo/Bystander/FOMO' },
  8092: { tier: 2, reason: 'patchbay_ads: False dilemma/Appeal to nature/Bandwagon' },
  8412: { tier: 2, reason: 'patchbay_logic: Straw man/Slippery slope/Red herring' },
  8498: { tier: 2, reason: 'patchbay_laws: Murphy/Parkinson/Peter Principle/Pareto' },
  9362: { tier: 3, reason: 'patchbay_phil: Descartes/Socrates/Plato/Nietzsche' },
  // Balances
  3671: { tier: 3, reason: 'balance_logic: Aristotle syllogism 2 premises + 1 conclusion = 3' },
  8164: { tier: 4, reason: 'balance_psych: Maslow 5 + Plutchik 8 = 13' },
  8176: { tier: 2, reason: 'balance_econ: Pareto 80% effects + 20% causes = 100%' },
  8279: { tier: 4, reason: 'balance_phil: Aristotle 4 Causes + 3 Rhetoric modes = 7' },
  8323: { tier: 2, reason: 'balance_ethics: Philippa Foot Trolley Problem 1 + 5 = 6' },
  9481: { tier: 4, reason: 'balance_psych: Kübler-Ross 5 Grief + Tuckman 4 Team = 9' },
  // Semantic Fallacies
  87: { tier: 2, reason: 'fal_psych: Kahneman Planning fallacy' },
  127: { tier: 2, reason: 'fal_med: The Nocebo effect' },
  194: { tier: 2, reason: 'fal_psych: Pareidolia faces in clouds/toast' },
  505: { tier: 2, reason: 'fal_econ: Kahneman Loss aversion' },
  508: { tier: 2, reason: 'fal_net: Cunningham’s Law post wrong answer' },
  693: { tier: 2, reason: 'fal_tech: CAPTCHA watches cursor micro-wobbles' },
  1111: { tier: 2, reason: 'fal_econ: Austria 99% vs Germany 12% opt-out defaults' },
  1302: { tier: 2, reason: 'fal_psych: Thorndike 1920 Halo effect' },
  1472: { tier: 2, reason: 'fal_logic: Appeal to nature poison ivy/arsenic' },
  1485: { tier: 2, reason: 'fal_stats: WWII Abraham Wald survivorship bias' },
  3623: { tier: 2, reason: 'fal_stats: Survivorship bias bombers' },
  6713: { tier: 2, reason: 'chrono_phil: Aristotle 350 BCE earliest' },
  6796: { tier: 2, reason: 'fal_psych: 1935 Stroop color-word effect' },
  6798: { tier: 2, reason: 'fal_logic: Latin Non sequitur' },
  6804: { tier: 2, reason: 'fal_tech: Cory Doctorow Enshittification' },
  6810: { tier: 2, reason: 'fal_ux: Confirmshaming dark pattern' },
  6961: { tier: 2, reason: 'fal_psych: Leon Festinger 1957 Cognitive dissonance' },
  7052: { tier: 2, reason: 'fal_econ: Kahneman & Tversky Framing effect' },
  8044: { tier: 2, reason: 'chrono_laws: 1949 USAF Murphy’s Law first' },
  8053: { tier: 2, reason: 'fal_net: 2005 Poe’s Law' },
  8083: { tier: 3, reason: 'lasso_logic: Minor, Major, Conclusion syllogism parts' },
  8103: { tier: 2, reason: 'lasso_logic: Bandwagon, Red Herring, Straw Man' },
  8113: { tier: 2, reason: 'fal_geo: Kahneman & Tversky San Francisco Bay' },
  8185: { tier: 2, reason: 'lasso_cs: George Boole 1854 NOT, AND, OR' },
  8243: { tier: 2, reason: 'fal_laws: Sturgeon’s Law 90% is crud' },
  8293: { tier: 3, reason: 'lasso_logic: Ad Populum, Ad Nauseam, Non Sequitur' },
  8521: { tier: 2, reason: 'fal_history: Aristotle Lyceum Athens Greece' },
  9497: { tier: 3, reason: 'fal_econ: Kyla Scanlon 2022 Vibecession' },
  9549: { tier: 2, reason: 'fal_illusion: 1892 German duck-rabbit figure' },
  9577: { tier: 2, reason: 'fal_psych: 1961 Yale Milgram Study' },
  9585: { tier: 2, reason: 'fal_logic: Appeal to authority' },
  9609: { tier: 3, reason: 'lasso_phil: Thesis, Antithesis, Synthesis dialectic' },

  // === CUISINE ===
  // Cyanotypes
  3769: { tier: 4, reason: 'cyanotype_coffee: 1948 Milanese 9-bar Bourdon pressure dial' },
  3804: { tier: 3, reason: 'cyanotype_coffee: 1933 Bialetti Moka pot funnel pipe' },
  8335: { tier: 3, reason: 'cyanotype_pasta: Rough bronze pasta extruder die' },
  8388: { tier: 3, reason: 'cyanotype_wine: Champagne bottle concave punt' },
  8420: { tier: 3, reason: 'cyanotype_cook: French cocotte self-basting lid dimples' },
  8495: { tier: 3, reason: 'cyanotype_cook: Carbon-steel two-zone wok hemisphere' },
  // Patchbays
  3757: { tier: 2, reason: 'patchbay_coffee: Affogato/Cortado/Ristretto' },
  8167: { tier: 2, reason: 'patchbay_food: Banh mi/Poutine/Takoyaki/Elote' },
  8288: { tier: 2, reason: 'patchbay_pasta: Farfalle/Orecchiette/Vermicelli' },
  8511: { tier: 2, reason: 'patchbay_drinks: Mojito/Margarita/Moscow Mule/Negroni' },
  8516: { tier: 2, reason: 'patchbay_dessert: Tiramisu/Baklava/Creme brulee/Pavlova' },
  9512: { tier: 2, reason: 'patchbay_bread: Tortilla/Naan/Crêpe/Injera' },
  9595: { tier: 2, reason: 'patchbay_food: Pierogi/Gyoza/Empanada/Khinkali' },
  // Balances
  8059: { tier: 3, reason: 'balance_food: 3 Michelin stars + 5 basic tastes = 8' },
  8153: { tier: 4, reason: 'balance_baking: Shortbread 6 parts + Pound cake 4 = 10' },
  8207: { tier: 2, reason: 'balance_kitchen: 3 tsp/tbsp + 16 tbsp/cup = 19' },
  8433: { tier: 2, reason: 'balance_brands: Baskin-Robbins 31 + Dr Pepper 23 = 54' },
  9389: { tier: 3, reason: 'balance_temp: Water boil 212 F + 100 C = 312' },
  9479: { tier: 2, reason: 'balance_kitchen: 16 cups/gal + 4 quarts/gal = 20' },
  // Semantic Cuisine
  216: { tier: 2, reason: 'cui_etym: Pain perdu lost stale bread' },
  371: { tier: 2, reason: 'cui_etym: French Toast Pain perdu' },
  444: { tier: 2, reason: 'cui_news: June 2024 Denmark recalled Samyang Buldak' },
  465: { tier: 2, reason: 'cui_history: 1894 Lemuel Benedict Waldorf Hotel' },
  683: { tier: 2, reason: 'cui_history: Gin & tonic antimalarial quinine' },
  859: { tier: 2, reason: 'cui_science: Banana candy Gros Michel pre-1950s variety' },
  999: { tier: 2, reason: 'cui_japan: 1925 Kewpie mayo egg yolks only' },
  1028: { tier: 2, reason: 'cui_history: Tacos al pastor Ottoman Lebanon spits' },
  1071: { tier: 2, reason: 'cui_history: 1829 Sylvester Graham bland diet' },
  1194: { tier: 3, reason: 'cui_history: Churros named after Navajo-Churro sheep horns' },
  1198: { tier: 3, reason: 'cui_chem: Pop Rocks 600 PSI CO2' },
  1360: { tier: 2, reason: 'cui_tech: Sous-vide literally under vacuum' },
  3664: { tier: 3, reason: 'cui_history: August Zang 1839 Viennese croissant' },
  6630: { tier: 2, reason: 'cui_science: Refined avocado oil highest smoke point' },
  6689: { tier: 2, reason: 'cui_2024: El Califa de León first Michelin taco stand' },
  6712: { tier: 2, reason: 'cui_history: Chicken tikka masala Glasgow Scotland' },
  6731: { tier: 2, reason: 'cui_japan: Fukuoka 12-hour emulsified Tonkotsu ramen' },
  6742: { tier: 2, reason: 'cui_french: Hollandaise Mother Sauce' },
  6826: { tier: 2, reason: 'cui_law: Scotch oak cask minimum 3 full years' },
  6842: { tier: 2, reason: 'cui_world: Peruvian ceviche lime juice' },
  6870: { tier: 2, reason: 'cui_mex: Mole poblano dark chocolate' },
  7023: { tier: 2, reason: 'cui_history: Sumerian grain beer earliest' },
  7103: { tier: 2, reason: 'cui_world: Tokyo most Michelin-starred restaurants' },
  8019: { tier: 2, reason: 'lasso_cui: Cajun Holy Trinity Celery, Bell Pepper, Onion' },
  8081: { tier: 2, reason: 'cui_geo: Oaxaca Mexico Land of Seven Moles' },
  8329: { tier: 2, reason: 'cui_history: 1893 Chicago Palmer House Fudge Brownie' },
  8492: { tier: 2, reason: 'cui_tech: Chiffonade basil ribbon cut' },
  9345: { tier: 2, reason: 'lasso_drink: Cuban Daiquiri Rum, Lime Juice, Sugar' },
  9518: { tier: 2, reason: 'lasso_french: Béchamel Butter, Flour, Milk' },
  10414: { tier: 2, reason: 'cui_history: 1951 Brennan’s New Orleans Bananas Foster' },
};

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run') || !argv.includes('--apply'),
    apply: argv.includes('--apply'),
  };
}

function normAnswerDedupSlug(answerStr) {
  const cleaned = String(answerStr || '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(the|a|an|gas|element|metal)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
  if (/^\d/.test(cleaned) || cleaned.length < 4) return null;
  return cleaned;
}

function fnv1aHash(str) {
  let h = 0x811c9dc5;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function rebuildBootPack(allClues) {
  // Select 50 verified couch-friendly clues per category across all 20 categories (1,000 total).
  // Prioritize verified Tier 1 clues first (with diverse cardStyles & toys, zero duplicate
  // TOY_01 answers within the same category per Gate 7), then top up with clean light Tier 2
  // clues only if a category has < 50 unique-answer Tier 1s.
  const pickedByCat = {};
  for (const cat of ALL_CATEGORIES) {
    const catClues = allClues.filter((c) => c.category === cat);
    const seenCatAns = new Set();
    const seenQids = new Set();
    const chosen = [];

    const canPick = (c) => {
      if (seenQids.has(c.qid)) return false;
      const isClassic = Array.isArray(c.supportedToys) && c.supportedToys.includes('TOY_01_KNIFE_SWITCH');
      if (isClassic) {
        const slug = normAnswerDedupSlug(c.choices?.[c.answerIdx]);
        if (slug && seenCatAns.has(slug)) return false;
      }
      return true;
    };

    const accept = (c) => {
      seenQids.add(c.qid);
      const isClassic = Array.isArray(c.supportedToys) && c.supportedToys.includes('TOY_01_KNIFE_SWITCH');
      if (isClassic) {
        const slug = normAnswerDedupSlug(c.choices?.[c.answerIdx]);
        if (slug) seenCatAns.add(slug);
      }
      chosen.push(c);
    };

    // Pass 1: Tier 1 Classic/Monitor/Headline/Myth/Binary + accessible showcases (preferring diverse styles & non-cyanotype)
    const d1Pool = catClues
      .filter((c) => c.difficulty === 1)
      .sort((a, b) => {
        // Prefer deterministic lively variety across eras/waves rather than raw QID clustering
        const ha = fnv1aHash(a.canonicalEntityKey);
        const hb = fnv1aHash(b.canonicalEntityKey);
        return ha - hb || a.qid - b.qid;
      });

    // Reserve ~10 slots for Tier 1 accessible showcases (Dial/Globe/Sorter/Lasso/Chrono/Shutters/Vowels)
    // and ~40 slots for Tier 1 Classic/Monitor/Headline/Myth/Binary across all 5 card styles
    const d1Showcase = d1Pool.filter((c) =>
      (c.supportedToys || []).some((t) =>
        [
          'TOY_03_VERNIER_DIAL',
          'TOY_05_RELIEF_GLOBE_3D',
          'TOY_07_MAIL_SORTER',
          'TOY_08_CHRONOLOGY_RAIL',
          'TOY_10_CLIFFHANGERS_THROTTLE',
          'TOY_12_CONSPIRACY_LASSO',
          'TOY_14_FOUR_SHUTTER_REEL',
        ].includes(t),
      ),
    );
    for (const c of d1Showcase) {
      if (chosen.length >= 12) break;
      if (canPick(c)) accept(c);
    }

    // Balance across all 5 card styles from remaining D1 pool
    const styles = ['CLASSIC_CUE', 'HEADLINE_BLANK', 'PICTURE_MONITOR', 'SPOT_THE_MYTH', 'BINARY_SPLIT'];
    let styleRound = 0;
    while (chosen.length < 50 && styleRound < d1Pool.length) {
      let addedAny = false;
      for (const st of styles) {
        if (chosen.length >= 50) break;
        const match = d1Pool.find((c) => c.cardStyle === st && canPick(c));
        if (match) {
          accept(match);
          addedAny = true;
        }
      }
      if (!addedAny) break;
      styleRound++;
    }

    // Fill any remaining D1 slots regardless of style
    for (const c of d1Pool) {
      if (chosen.length >= 50) break;
      if (canPick(c)) accept(c);
    }

    // Pass 2 (only if < 50): top up from light Tier 2 clues (excluding cyanotype)
    if (chosen.length < 50) {
      const d2Pool = catClues
        .filter((c) => c.difficulty === 2 && !c.cyanotype)
        .sort((a, b) => fnv1aHash(a.canonicalEntityKey) - fnv1aHash(b.canonicalEntityKey));
      for (const c of d2Pool) {
        if (chosen.length >= 50) break;
        if (canPick(c)) accept(c);
      }
    }

    if (chosen.length !== 50) {
      throw new Error(`boot_pack category "${cat}" only yielded ${chosen.length}/50 clues!`);
    }
    pickedByCat[cat] = chosen;
  }

  // Round-robin interleave across all 20 categories so every prefix slice has balanced coverage
  const bootClues = [];
  for (let i = 0; i < 50; i++) {
    for (const cat of ALL_CATEGORIES) {
      bootClues.push(pickedByCat[cat][i]);
    }
  }
  return bootClues;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const manifest = JSON.parse(fs.readFileSync(PACKS_MANIFEST_PATH, 'utf8'));

  const beforeTierByCat = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, [0, 0, 0, 0, 0]]));
  const afterTierByCat = Object.fromEntries(ALL_CATEGORIES.map((c) => [c, [0, 0, 0, 0, 0]]));

  const shardPayloads = [];
  const allClues = [];
  const seenCuratedQids = new Set();
  const regradeLog = [];
  const unmappedContraptionD1 = [];

  for (const shardEntry of manifest.shards) {
    const fullPath = path.join(DATA_DIR, shardEntry.file);
    const payload = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    shardPayloads.push({ file: shardEntry.file, fullPath, payload });

    for (const clue of payload.clues) {
      beforeTierByCat[clue.category][clue.difficulty - 1]++;

      if (clue.difficulty === 1) {
        const override = CURATED_REGRADES[clue.qid];
        if (override) {
          seenCuratedQids.add(clue.qid);
          regradeLog.push({
            qid: clue.qid,
            category: clue.category,
            from: 1,
            to: override.tier,
            reason: override.reason,
            stem: clue.stem,
            answer: clue.choices?.[clue.answerIdx],
          });
          clue.difficulty = override.tier;
        } else if (clue.cyanotype || clue.patchbay || clue.balance) {
          // Safety net: never leave cyanotype/patchbay/balance at Tier 1
          const fallbackTier = clue.cyanotype ? 3 : 2;
          unmappedContraptionD1.push({ qid: clue.qid, category: clue.category, fallbackTier });
          regradeLog.push({
            qid: clue.qid,
            category: clue.category,
            from: 1,
            to: fallbackTier,
            reason: `safety_contraption_floor_${clue.cyanotype ? 'cyanotype' : clue.patchbay ? 'patchbay' : 'balance'}`,
            stem: clue.stem,
            answer: clue.choices?.[clue.answerIdx],
          });
          clue.difficulty = fallbackTier;
        }
      }

      afterTierByCat[clue.category][clue.difficulty - 1]++;
      allClues.push(clue);
    }
  }

  // Verify no stale QIDs in CURATED_REGRADES
  const staleQids = Object.keys(CURATED_REGRADES)
    .map(Number)
    .filter((q) => !seenCuratedQids.has(q));

  const bootClues = rebuildBootPack(allClues);
  const bootTierCounts = [0, 0, 0, 0, 0];
  const bootCatCounts = {};
  for (const c of bootClues) {
    bootTierCounts[c.difficulty - 1]++;
    bootCatCounts[c.category] = (bootCatCounts[c.category] || 0) + 1;
  }

  const totalBefore = [0, 0, 0, 0, 0];
  const totalAfter = [0, 0, 0, 0, 0];
  const categoryDiffTable = {};
  for (const cat of ALL_CATEGORIES) {
    const b = beforeTierByCat[cat];
    const a = afterTierByCat[cat];
    for (let i = 0; i < 5; i++) {
      totalBefore[i] += b[i];
      totalAfter[i] += a[i];
    }
    categoryDiffTable[cat] = {
      beforeD1: b[0],
      afterD1: a[0],
      bumped: b[0] - a[0],
      afterTiers: `D1:${a[0]} D2:${a[1]} D3:${a[2]} D4:${a[3]} D5:${a[4]}`,
    };
  }

  const summary = {
    mode: args.apply ? 'APPLY' : 'DRY_RUN',
    totalClues: allClues.length,
    totalBumpedFromD1: regradeLog.length,
    unmappedContraptionD1,
    staleCuratedQids: staleQids,
    beforeTotals: {
      D1: totalBefore[0],
      D2: totalBefore[1],
      D3: totalBefore[2],
      D4: totalBefore[3],
      D5: totalBefore[4],
    },
    afterTotals: {
      D1: totalAfter[0],
      D2: totalAfter[1],
      D3: totalAfter[2],
      D4: totalAfter[3],
      D5: totalAfter[4],
    },
    bootPackCount: bootClues.length,
    bootPackTiers: {
      D1: bootTierCounts[0],
      D2: bootTierCounts[1],
      D3: bootTierCounts[2],
      D4: bootTierCounts[3],
      D5: bootTierCounts[4],
    },
    bootPackCategoriesCount: Object.keys(bootCatCounts).length,
    perCategory: categoryDiffTable,
  };

  if (args.apply) {
    if (staleQids.length > 0) {
      throw new Error(`Found stale/non-D1 QIDs in CURATED_REGRADES: ${staleQids.join(', ')}`);
    }
    for (const sp of shardPayloads) {
      fs.writeFileSync(sp.fullPath, JSON.stringify(sp.payload));
    }

    const bootDoc = {
      schema: 'WS_V7_CORPUS_1',
      totalCorpusCount: allClues.length,
      bootPackVersion: '7.6_WAVE5_COUCH_R3_1000',
      clues: bootClues,
    };
    fs.writeFileSync(BOOT_PACK_PATH, JSON.stringify(bootDoc));

    if (fs.existsSync(CORPUS_MANIFEST_PATH)) {
      const cm = JSON.parse(fs.readFileSync(CORPUS_MANIFEST_PATH, 'utf8'));
      cm.compiledAtIso = new Date().toISOString();
      cm.bootPackCount = bootClues.length;
      cm.tierCounts = {
        1: totalAfter[0],
        2: totalAfter[1],
        3: totalAfter[2],
        4: totalAfter[3],
        5: totalAfter[4],
      };
      fs.writeFileSync(CORPUS_MANIFEST_PATH, JSON.stringify(cm, null, 2));
    }
  }

  console.log(JSON.stringify(summary, null, 2));
}

main();
