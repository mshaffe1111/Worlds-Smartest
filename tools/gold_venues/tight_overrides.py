"""Crisp mobile/3D-plate stem & bounds refinements for Wave-2 Gold Venue Packs.

Guarantees across all 712 Gold QIDs (50,001..50,712):
  1. 100% of `GAUNTLET_SHATTER` 3D obsidian-plate statements <= 160 chars.
  2. 100% of all other prompts (`SIGHTLINE_LOCK`, `CALIBRATOR_DIAL`, `CODEX_DUAL_RING`,
     `HERO_ARTIFACT_SYNTHESIS`) <= 205 chars for instant <2.5s scan on 844x390 & 390x844 HUDs.
  3. 0 Red-Team `PARTIAL_TOKEN_LEAK_IN_STEM`, `AWKWARD_ARTICLE_*`, or `CALIBRATOR_MIDPOINT_AUTOWIN_SHARP`
     flags in `tools/qa/audit_questions_and_cadence.mjs` (even against WIDE 16% tolerance!).
"""
from __future__ import annotations

from typing import Any

# microTopicId -> partial field overrides (prompt, answerCorrect, distractors)
ITEM_OVERRIDES: dict[str, dict[str, Any]] = {
    # --- Partial-token & article polish (CH, GB, JP) ---
    "ch_aletsch_glacier": {
        "prompt": "Stretching roughly 20 kilometers through Canton Valais beneath the Jungfrau, which Alpine ice river is the largest in mainland Europe?",
    },
    "ch_swiss_federal_council": {
        "prompt": "Rather than a single powerful president, Switzerland's national executive branch is led collectively by which seven-member cabinet?",
    },
    "ch_cern_motto_peace": {
        "prompt": "Founded near Geneva in 1954 under the motto 'Science for Peace,' what body did the French acronym CERN originally name?",
    },
    "gb_221b_baker_street": {
        "prompt": "In Sir Arthur Conan Doyle's mysteries, what famous Marylebone address in London do Sherlock Holmes and Dr. John Watson share?",
    },
    "gb_fleet_street_press": {
        "prompt": "Before newspapers moved east in the 1980s, which London thoroughfare between the Strand and Ludgate Circus was synonymous with British journalism?",
    },
    "gb_brunel_thames_tunnel": {
        "prompt": "Completed between Rotherhithe and Wapping in 1843 by Marc and Isambard Kingdom Brunel, their passage beneath the Thames achieved what engineering first?",
    },
    "jp_shinjuku_busiest_station": {
        "prompt": "Serving roughly 3.5 million daily passengers across over 200 exits, which western Tokyo rail hub holds the Guinness record as the world's busiest?",
    },
    "jp_seikan_tunnel_tsugaru": {
        "prompt": "Running 53.85 kilometers beneath the stormy Tsugaru Strait—including 23.3 km under the seabed—which undersea rail link connects Honshu with Hokkaido?",
    },
    "jp_itsukushima_floating_torii": {
        "prompt": "On Miyajima Island near Hiroshima, which sacred vermilion Shinto complex features a giant camphor-wood torii gate that appears to float at high tide?",
    },

    # --- GAUNTLET_SHATTER <= 160 chars across all 8 venues ---
    "gb_gs_london_bridge_arizona": {
        "prompt": "When Robert McCulloch bought London Bridge in 1968 and rebuilt it in Arizona, he mistakenly believed he was buying Gothic-towered Tower Bridge.",
    },
    "gb_gs_monarch_house_of_commons": {
        "prompt": "By constitutional convention since Charles I stormed in with soldiers in 1642, no reigning British monarch may enter the House of Commons chamber.",
    },
    "gb_gs_great_fire_thousands_died": {
        "prompt": "Although London's Great Fire of 1666 destroyed over 13,000 houses and Old St Paul's, official records tallied fewer than ten confirmed deaths.",
    },
    "jp_gs_salmon_sushi_norway": {
        "prompt": "Raw salmon nigiri was NOT an ancient Edo staple—Norwegian envoys introduced parasite-free farmed Atlantic salmon for raw sushi to Japan in the 1980s.",
    },
    "jp_gs_shinkansen_zero_crash_deaths": {
        "prompt": "Since launching in October 1964 and carrying over ten billion riders, Japan's Shinkansen has recorded zero passenger deaths from crashes or derailments.",
    },
    "jp_gs_nishiyama_onsen_oldest_hotel": {
        "prompt": "Founded in Yamanashi in 705 CE and run for 52 generations, Japan's Nishiyama Onsen Keiunkan holds the Guinness record as the world's oldest hotel.",
    },
    "jp_gs_tokyo_subtropical_ogasawara": {
        "prompt": "Subtropical Ogasawara Islands lying 1,000 km south in the Pacific are administratively part of Tokyo Metropolis and use Tokyo license plates.",
    },
    "br_gs_zero_bridges_main_amazon": {
        "prompt": "Despite flowing thousands of kilometers across South America, the main stem of the Amazon River still has zero highway bridges crossing it anywhere.",
    },
    "br_gs_rio_january_river_mistake": {
        "prompt": "Portuguese explorers named 'Rio de Janeiro' ('January River') on January 1, 1502 after mistaking oceanic Guanabara Bay's mouth for a great river.",
    },
    "br_gs_brazil_flag_inverted_sky": {
        "prompt": "The 27 stars on Brazil's flag depict the real constellations above Rio at 8:30 AM on November 15, 1889—mirrored as viewed from outside the sky sphere.",
    },
    "br_gs_largest_japanese_diaspora": {
        "prompt": "Centered on São Paulo's Liberdade district since 1908, Brazil is home to the largest population of Japanese descendants anywhere outside Japan.",
    },
    "br_gs_queimada_grande_golden_lancehead": {
        "prompt": "Brazil's Navy bars public landings on Ilha da Queimada Grande ('Snake Island') off São Paulo because thousands of golden lancehead vipers live there.",
    },
    "br_gs_salvador_first_capital": {
        "prompt": "Before Rio de Janeiro became capital in 1763—and Brasília in 1960—northeastern port Salvador da Bahia served as Brazil's first capital for two centuries.",
    },
    "br_gs_laguna_dolphin_fishermen": {
        "prompt": "In Laguna, southern Brazil, wild bottlenose dolphins herd mullet toward human net-casters and give a head-slap cue telling fishermen when to throw.",
    },
    "eg_gs_pyramids_enslaved_myth": {
        "prompt": "Excavated bakeries, beef rations, bone-setting clinics, and workers' tombs at Giza prove the pyramids were built by skilled paid Egyptian crews, not slaves.",
    },
    "eg_gs_cleopatra_egyptian_tongue": {
        "prompt": "Although her Macedonian-Greek dynasty ruled from Alexandria for nearly 300 years, Cleopatra VII was the first Ptolemaic ruler to speak native Egyptian.",
    },
    "eg_gs_tutankhamun_curse_carter": {
        "prompt": "A hieroglyphic curse carved above Tutankhamun's tomb doorway ('Death shall come on swift wings...') killed discoverer Howard Carter within months in 1922.",
    },
    "eg_gs_nile_upper_south": {
        "prompt": "Because the Nile flows northward down to the Mediterranean, 'Upper Egypt' lies in the south around Luxor and Aswan while 'Lower Egypt' is the northern Delta.",
    },
    "eg_gs_suez_canal_locks_false": {
        "prompt": "Because the Red Sea stands nine meters higher than the Mediterranean, ships transiting the Suez Canal must climb and descend three giant concrete locks.",
    },
    "eg_gs_library_single_fire_caesar": {
        "prompt": "Every scroll of the Library of Alexandria vanished overnight in a single fire lit by Julius Caesar in 48 BCE, abruptly ending Alexandrian scholarship.",
    },
    "eg_gs_concorde_luxor_twin": {
        "prompt": "The 23-meter pink granite obelisk standing on Place de la Concorde in Paris since 1836 originally flanked Luxor Temple as twin to one still in Luxor.",
    },
    "eg_gs_djoser_older_than_giza": {
        "prompt": "Pharaoh Djoser's six-tier Step Pyramid by Imhotep at Saqqara predates Giza's smooth-sided pyramids—making Saqqara Egypt's oldest monumental stone building.",
    },
    "eg_gs_egypt_transcontinental_sinai": {
        "prompt": "Because the Sinai Peninsula lies east of the Suez Canal on the Asian landmass, Egypt is a transcontinental country spanning Northeast Africa and West Asia.",
    },
    "eg_gs_egyptian_unit_fractions": {
        "prompt": "Aside from special signs for 2/3 (and rare 3/4), ancient Egyptians in the Rhind Papyrus wrote fractions strictly as sums of distinct unit fractions 1/n.",
    },
    "is_gs_arctic_fox_only_native_mammal": {
        "prompt": "Before Norse settlers arrived, only ONE terrestrial land mammal lived natively on Iceland—the Arctic fox, which walked over sea ice after the Ice Age.",
    },
    "is_gs_modern_icelanders_read_sagas": {
        "prompt": "Because insular Icelandic grammar changed so little over eight centuries, modern Icelanders can still read 13th-century sagas in the original language.",
    },
    "is_gs_mcdonalds_closed_2009": {
        "prompt": "After Iceland's 2008–2009 króna crash doubled imported ingredient costs, every McDonald's restaurant in Iceland closed permanently in October 2009.",
    },
    "is_gs_beer_banned_until_1989": {
        "prompt": "Full-strength beer (>2.25% ABV) stayed illegal in Iceland for 74 years until March 1, 1989—decades after wine and hard spirits were already legal.",
    },
    "is_gs_reykjavik_24hr_polar_night": {
        "prompt": "As the world's northernmost sovereign capital, Reykjavik sees the Sun stay completely below the horizon 24 hours a day from late November to mid-January.",
    },
    "is_gs_floki_raven_iceland_name": {
        "prompt": "Norse explorer Hrafna-Flóki coined 'Ísland' (Iceland) after seeing a Westfjords bay choked with drift sea ice—not as a trick to fool rival Vikings.",
    },
    "is_gs_mannanafnanefnd_declension": {
        "prompt": "Iceland's Naming Committee ('Mannanafnanefnd') reviews new given names in part to verify they can take Icelandic grammatical case endings cleanly.",
    },
    "sg_gs_malay_national_language": {
        "prompt": "Although English is Singapore's primary working language alongside Mandarin, Malay, and Tamil, Malay alone is constitutionally the 'National Language.'",
    },
    "sg_gs_singapore_noodles_hong_kong": {
        "prompt": "Curry-powder stir-fried 'Singapore Noodles' ('Xingzhou Mifen') on takeout menus worldwide is Singapore's revered national dish invented on Boat Quay.",
    },
    "sg_gs_time_zone_utc8_geographic": {
        "prompt": "Though located at 103.8°E inside the natural UTC+7 solar zone of Bangkok and Jakarta, Singapore keeps clocks permanently one hour ahead on UTC+8.",
    },
    "sg_gs_64_islands_not_one": {
        "prompt": "Rather than one solitary island, sovereign Singapore comprises main Pulau Ujong plus roughly 63 surrounding offshore islands and islets.",
    },
    "sg_gs_first_michelin_street_stall": {
        "prompt": "In July 2016, two humble Singapore hawker stalls serving ~US$2 noodle and chicken-rice dishes became among the first street stalls awarded a Michelin Star.",
    },
    "sg_gs_nel_heavy_driverless_2003": {
        "prompt": "Opened in June 2003, Singapore's purple North East Line became the world's first fully automated, driverless high-capacity underground heavy-rail metro.",
    },
    "sg_gs_raffles_hotel_1902_tiger": {
        "prompt": "In August 1902, an escaped circus tiger genuinely crouched beneath the elevated Bar & Billiard Room of Singapore's historic Raffles Hotel.",
    },
    "sg_gs_ anthem_microtext_1000_note": {
        "prompt": "Printed in microtext across the reverse of Singapore's S$1,000 Portrait banknote are the full score and lyrics of national anthem 'Majulah Singapura.'",
    },
    "gl_gs_high_seas_lawless_piracy_only": {
        "prompt": "Once a civilian ship sails past 200 nautical miles onto the High Seas, it enters a lawless vacuum where zero national criminal or civil laws apply aboard.",
    },
    "gl_gs_coriolis_bathroom_sink_myth": {
        "prompt": "Earth's Coriolis force is strong enough to make ordinary household bathroom sinks drain counterclockwise in the north and clockwise in the south.",
    },
    "gl_gs_shannon_one_time_pad_unbreakable": {
        "prompt": "Proved by Claude Shannon in 1949, a true One-Time Pad (random key as long as the message, never reused) stays unbreakable even against quantum computers.",
    },
    "gl_gs_great_wall_moon_naked_eye": {
        "prompt": "As claimed in pre-spaceflight 1930s trivia books, the Great Wall of China is the sole human-made structure visible to the naked eye from the Moon.",
    },
    "gl_gs_gps_relativity_38_microsec": {
        "prompt": "Without Special (−7 µs/day) AND General Relativity (+45 µs/day) clock corrections, GPS positions on Earth would drift off by ~10+ kilometers every day.",
    },
    "gl_gs_cantor_reals_exceed_integers": {
        "prompt": "Georg Cantor's 1891 diagonal proof showed the real numbers between 0 and 1 are uncountable and strictly outnumber all positive integers 1, 2, 3...",
    },
    "gl_gs_null_island_sovereign_rock": {
        "prompt": "At exact coordinates 0°N, 0°E—where the Prime Meridian crosses the Equator in the Gulf of Guinea—rises a tiny volcanic rock officially named 'Null Island.'",
    },
    "gl_gs_quantum_entanglement_faster_light_msg": {
        "prompt": "Because measuring an entangled particle's spin fixes its partner's state instantly across space, entanglement lets operators send Morse code faster than light.",
    },
    "gl_gs_alfred_nobel_math_prize": {
        "prompt": "Alfred Nobel's 1895 will established five prizes (Physics, Chemistry, Medicine, Literature, Peace) and omitted Mathematics—honored later by the Fields and Abel.",
    },
    "gl_gs_mitochondria_endosymbiosis_margulis": {
        "prompt": "Championed by Lynn Margulis in 1967, endosymbiotic theory proved eukaryotic mitochondria and chloroplasts carry circular DNA from engulfed ancient bacteria.",
    },

    # --- BR, EG, IS, SG, GLOBAL + BOSS >= 205 char & partial-token polish ---
    "br_cerrado_inverted_forest": {
        "prompt": "With taproots plunging 15+ meters underground to feed eight major river basins, why do ecologists call central Brazil's Cerrado savanna an inverted forest?",
    },
    "br_mac_niteroi_flying_saucer": {
        "prompt": "Perched on a cliff across Guanabara Bay facing Rio's skyline, which 1996 Oscar Niemeyer art museum hovers over a reflecting pool like a white flying saucer?",
        "answerCorrect": "MAC Niterói",
    },
    "br_museu_do_amanha_calatrava": {
        "prompt": "Cantilevering white solar-panel fins out over Rio's Pier Mauá harbor in 2015, which futuristic science institution was designed by Santiago Calatrava?",
    },
    "br_south_atlantic_anomaly": {
        "prompt": "Centered over Brazil and neighboring ocean waters, what dip in Earth's inner Van Allen radiation belt forces passing satellites and Hubble to safe-mode sensors?",
    },
    "br_sergio_ferreira_jararaca_ace": {
        "prompt": "In the 1960s, Brazilian pharmacologist Sérgio Ferreira isolated peptides from which pit viper's venom—unlocking captopril and modern ACE blood-pressure drugs?",
    },
    "br_porto_alegre_participatory": {
        "prompt": "Pioneered in Porto Alegre in 1989 and copied by 3,000+ cities worldwide, what civic innovation lets neighborhood assemblies vote directly on municipal funds?",
    },
    "br_valongo_wharf_little_africa": {
        "prompt": "Unearthed in 2011 in Rio's 'Little Africa' waterfront, which stone landing stage was inscribed by UNESCO as the Americas' largest disembarkation port of enslaved Africans?",
    },
    "br_cal_amazon_freshwater_20pct": {
        "prompt": "Discharging ~209,000 m³/s into the Atlantic—more than the next seven rivers combined—roughly what percentage of all global river freshwater comes from the Amazon?",
    },

    "eg_khufu_solar_barque_cedar": {
        "prompt": "Unearthed in 1,224 planks beside the Great Pyramid in 1954 and stitched with rope without nails, Khufu's 43.4-meter solar barque was carved from what wood?",
    },
    "eg_merer_wadi_al_jarf_papyri": {
        "prompt": "Found in Red Sea caves at Wadi al-Jarf in 2013—the oldest inscribed papyri known—Inspector Merer's logbooks record shipping white Tura limestone for what monument?",
    },
    "eg_ibn_tulun_spiral_minaret": {
        "prompt": "Completed in Cairo in 879 CE, the historic sanctuary of Ahmad ibn Tulun features an exterior stone spiral minaret modeled on which 9th-century Abbasid monument?",
    },
    "eg_ain_jalut_baibars_1260": {
        "prompt": "Marching northeast from Cairo in September 1260 under Sultan Qutuz and vanguard commander Baibars, Egypt's Mamluk cavalry halted the Mongol Empire at which Galilee clash?",
    },
    "eg_mashrabiya_lattice_screen": {
        "prompt": "In historic Cairo houses like Bayt al-Suhaymi, what turned-wood lattice bay window cools breezes over clay water jars while preserving interior privacy?",
    },
    "eg_diophantus_arithmetica": {
        "prompt": "Working in 3rd-century Roman Alexandria, which mathematician wrote 'Arithmetica'—introducing algebraic symbols and integer problems that inspired Fermat's Last Theorem?",
    },
    "eg_hero_aeolipile_alexandria": {
        "prompt": "In 1st-century CE Alexandria, inventor Hero built coin-operated water dispensers, programmable automata, and what spinning brass sphere—the earliest steam turbine?",
    },
    "eg_rawdah_nilometer_861": {
        "prompt": "Built in 861 CE on Cairo's Roda Island with a graduated marble column inside a stone well, what gauge predicted whether Egypt faced famine, plenty, or flood taxes?",
    },
    "eg_siwa_oasis_amun_amazigh": {
        "prompt": "Deep in Egypt's Western Desert near Libya—where Alexander the Great trekked in 331 BCE to consult Amun's Oracle—which isolated oasis speaks its own Amazigh tongue?",
    },
    "eg_qattara_depression": {
        "prompt": "Plunging 133 meters below sea level across salt marshes that anchored El Alamein's southern flank in 1942, what northwestern Egyptian basin is Africa's second-lowest?",
    },
    "eg_cairo_geniza_ben_ezra": {
        "prompt": "Sealed for nearly a millennium inside Old Cairo's Ben Ezra Synagogue attic, what 400,000-page manuscript cache transformed medieval Mediterranean history?",
    },
    "eg_nag_hammadi_1945_jar": {
        "prompt": "Dug up in a sealed clay jar near Upper Egypt's Jabal al-Tarif cliffs in December 1945, which thirteen leather-bound papyrus codices preserved the 'Gospel of Thomas'?",
    },
    "eg_tale_of_sinuhe": {
        "prompt": "Copied onto hundreds of ostraca as the supreme classic of Egyptian verse, which Middle Kingdom tale follows a royal courtier fleeing after Amenemhat I's death?",
    },
    "eg_edwin_smith_surgical_papyrus": {
        "prompt": "Dating to ~1600 BCE, which ancient Egyptian trauma-surgery scroll gives history's earliest anatomical description of the brain's meninges and cerebrospinal fluid?",
    },
    "eg_egyptian_blue_cuprorivaite": {
        "prompt": "Synthesized in pharaonic kilns ~2600 BCE from quartz sand, lime, copper ore, and natron—and glowing in near-infrared!—what was humanity's first synthetic pigment?",
    },
    "eg_ful_medames_fava": {
        "prompt": "Slow-simmered overnight in narrow-necked hammered 'qidra' pots with olive oil, cumin, and lemon, what beloved Egyptian national breakfast dish uses dried fava beans?",
    },
    "eg_oud_arabic_maqam": {
        "prompt": "Ancestor of the European lute—whose name derives from Arabic 'al-ʿūd'—what fretless pear-shaped stringed instrument voices quarter-tone maqamat in Cairo?",
    },
    "eg_egypt_squash_dominance": {
        "prompt": "Sparked by open-air glass-court finals before the Giza Pyramids since 1996, which fast-paced four-walled racquet sport has Egypt dominated at world #1?",
    },
    "eg_senet_30_squares": {
        "prompt": "Found in four ebony-and-ivory sets in Tutankhamun's tomb and played on a 3×10 grid, what ancient Egyptian board game symbolized the soul's underworld journey?",
    },
    "eg_bibliotheca_alexandrina_snohetta": {
        "prompt": "Opened on Alexandria's Corniche in 2002 near the lost ancient Library, Snøhetta's tilted granite solar-disc wall is carved with characters from how many scripts?",
        "answerCorrect": "120 writing systems",
    },
    "eg_grand_egyptian_museum_giza": {
        "prompt": "Built two kilometers from Giza's Pyramids with a translucent alabaster triangle facade, which colossal institution displays all 5,398 Tutankhamun artifacts together?",
    },
    "eg_pharaohs_golden_parade_2021": {
        "prompt": "In April 2021, Cairo's 'Pharaohs' Golden Parade' carried 22 royal mummies in nitrogen-filled capsules from Tahrir Square to which Fustat cultural institution?",
    },
    "eg_camp_david_sinai_1979": {
        "prompt": "Sharing the 1978 Nobel Peace Prize and signing the 1979 treaty that returned all of Sinai to Egypt, which Egyptian president addressed the Knesset in 1977?",
    },
    "eg_sameera_moussa_atomic": {
        "prompt": "Egypt's first woman PhD in atomic radiation, Dr. Sameera Moussa organized the 1952 'Atomic Energy for Peace' conference hoping to make nuclear cancer care as cheap as what?",
    },
    "eg_magdi_yacoub_aswan": {
        "prompt": "Knighted in Britain for pioneering pediatric arterial-switch heart surgery before founding a free Nile-side charity heart center in Aswan, who is this celebrated surgeon?",
    },
    "eg_unfinished_obelisk_aswan": {
        "prompt": "Still attached to Aswan's bedrock after cracking ~1500 BCE, Hatshepsut's 1,100-tonne Unfinished Obelisk shows masons pounded pink granite with balls of what harder rock?",
    },
    "eg_great_bitter_lake_yellow_fleet": {
        "prompt": "Midway along the lockless Suez Canal, ships pass inside which hypersaline lake where fourteen freighters ('The Yellow Fleet') sat marooned from 1967 to 1975?",
    },
    "eg_karnak_hypostyle_134": {
        "prompt": "Built at Karnak by Seti I and Ramses II, the Great Hypostyle Hall's central 21-meter sandstone columns blossom at their capitals to resemble what Delta plant?",
    },
    "eg_claudius_ptolemy_almagest": {
        "prompt": "Compiled in 2nd-century Roman Alexandria by Claudius Ptolemy and preserved in Arabic as 'Al-Majisti,' which treatise cataloged 1,022 stars for 1,400 years?",
    },
    "eg_blue_nile_silt_surge": {
        "prompt": "While the White Nile supplies steady baseflow, ~80–85% of the late-summer floodwater and fertile black volcanic silt reaching Egypt surges down which tributary?",
    },
    "eg_khan_el_khalili_1382": {
        "prompt": "Established around 1382 CE in Mamluk Cairo—and immortalized in Naguib Mahfouz's 'Midaq Alley'—what labyrinthine bazaar of brass lamps and spices still bustles today?",
    },
    "eg_cal_abu_simbel_blocks_1036": {
        "prompt": "During UNESCO's 1964–1968 rescue above Lake Nasser, into roughly how many numbered 20-to-30-tonne blocks did engineers handsaw Ramses II's Abu Simbel temples?",
    },
    "eg_cal_zewail_nobel_1999": {
        "prompt": "Using femtosecond (10^-15 s) laser flashes to film chemical bonds breaking in slow motion, in what year did Egyptian chemist Ahmed Zewail win the Chemistry Nobel?",
    },
    "eg_cal_epagomenal_5_days": {
        "prompt": "Because ancient Egypt's civil calendar had twelve 30-day months (360 days), how many sacred 'epagomenal' feast days were added at year's end to align the solar year?",
    },

    # --- Iceland (IS) ---
    "is_ingolfur_arnarson_pillars": {
        "prompt": "According to 'Landnámabók,' Norse settler Ingólfur Arnarson (~874 CE) chose Reykjavik's site by casting which sacred timber objects overboard to drift ashore?",
        "answerCorrect": "High-seat wooden pillars",
    },
    "is_laki_fissure_1783": {
        "prompt": "Opening a 27-km fissure across southern Iceland in 1783–1784, which volcanic eruption released 120 million tonnes of SO2 and dimmed skies across Europe and Egypt?",
    },
    "is_althing_lawspeaker_lögsögumaður": {
        "prompt": "Before Icelanders wrote laws on vellum in 1117 CE, which elected Althing official recited one-third of the national law code aloud from memory at Law Rock?",
    },
    "is_republic_1944_thingvellir": {
        "prompt": "With Denmark occupied in WWII, 98% of Icelandic voters ended the royal union and proclaimed the Republic at Þingvellir on June 17, 1944—birthday of which hero?",
    },
    "is_codex_regius_voluspa": {
        "prompt": "Returned from Copenhagen to Reykjavik under naval escort in 1971, which 45-leaf 13th-century calfskin manuscript uniquely preserved 'Völuspá' and the Poetic Edda?",
    },
    "is_njals_saga_burnt": {
        "prompt": "Acclaimed as the supreme medieval Icelandic family saga, which 13th-century epic chronicles fifty years of blood feuds around wise lawyer Njáll and warrior Gunnar?",
    },
    "is_jokulhlaup_loanword": {
        "prompt": "Borrowed directly from Icelandic into global geology, what term names a catastrophic outburst flood triggered when subglacial volcanic heat melts water under an ice cap?",
    },
    "is_askja_apollo_astronauts": {
        "prompt": "In 1965 and 1967, Neil Armstrong and 31 Apollo astronauts trained across Iceland's barren Askja volcanic interior to practice field geology on basalts resembling what?",
    },
    "is_heimaey_1973_seawater_pumps": {
        "prompt": "When Eldfell erupted beside Heimaey in 1973, physicist Þorbjörn Sigurgeirsson saved Iceland's premier fishing harbor from sealing shut by pumping 6 million tonnes of what onto the lava?",
    },
    "is_dettifoss_glacial_power": {
        "prompt": "Plunging 44 meters into Jökulsárgljúfur canyon with grey meltwater from Vatnajökull, which northeast Icelandic cataract rivals Rhine Falls as Europe's most powerful?",
    },
    "is_iceland_spar_birefringence": {
        "prompt": "Mined in water-clear rhombohedrons at Helgustaðir, transparent calcite ('Iceland spar') enabled Bartholin and Huygens to study light polarization via what twin-beam effect?",
    },
    "is_decode_genetics_genealogy": {
        "prompt": "Founded in Reykjavik in 1996 by Kári Stefánsson, deCODE genetics unlocked disease-gene discovery by pairing whole-genome data with 1,000 years of what records?",
    },
    "is_orca_mammoth_climeworks": {
        "prompt": "Beside Hellisheiði geothermal plant near Reykjavik, the 'Orca' and 'Mammoth' direct-air-capture facilities mineralize captured atmospheric CO2 underground into what?",
    },
    "is_iceland_aluminum_smelting": {
        "prompt": "Though Iceland mines zero bauxite ore, over two-thirds of its abundant hydro and geothermal electricity powers electrolytic smelters exporting which lightweight metal?",
    },
    "is_farice_danice_cables": {
        "prompt": "Cooled naturally by subarctic air, Iceland's green data centers connect abroad via submarine fiber cables FARICE-1, DANICE, and which 2023 link to Galway, Ireland?",
    },
    "is_ossur_bionic_prosthetics": {
        "prompt": "Founded in Reykjavik in 1971 by a prosthetist who invented a silicone liner for his own leg, which med-tech leader makes carbon-fiber Cheetah blades?",
    },
    "is_icelandic_horse_tolt": {
        "prompt": "Genetically isolated by a 1,000-year import ban—once exported, a horse can never return!—the Icelandic horse performs what smooth four-beat lateral ambling gait?",
    },
    "is_common_eider_down_harvest": {
        "prompt": "Supplying ~75% of world output along Iceland's coasts, farmers guard wild Common Eider ducks from predators to hand-gather what ultra-warm fiber after chicks leave?",
    },
    "is_birch_vikings_deforestation": {
        "prompt": "Pollen cores show ~25–40% of Iceland was forested when Norse settlers arrived ~874 CE—mainly with which native tree before grazing and charcoal cut it to ~1%?",
    },
    "is_harpa_olafur_eliasson_basalt": {
        "prompt": "Glittering on Reykjavik's Old Harbor since 2011, Harpa Concert Hall wraps its facade in 714 basalt-inspired dichroic-glass cells co-designed by which artist?",
    },
    "is_perlan_hot_water_tanks": {
        "prompt": "Crowned atop Reykjavik's Öskjuhlíð hill by a revolving glass dome in 1991, 'Perlan' ('The Pearl') sits atop six cylindrical tanks built to store what?",
    },
    "is_sigridur_tomasdottir_gullfoss": {
        "prompt": "Around 1920, which Brattholt farmer's daughter walked barefoot 120 km to Reykjavik repeatedly to save Gullfoss waterfall from foreign hydro-dam developers?",
    },
    "is_sigur_ros_hopelandic": {
        "prompt": "Bowing electric guitar with a cello bow, Reykjavik post-rock band Sigur Rós sings the entire album '( )' in a wordless phonetic vocalization called what?",
    },
    "is_ccp_eve_online_reykjavik": {
        "prompt": "Built in Reykjavik by CCP Games and running since 2003 on a single shared 'Tranquility' universe server, what space MMO stages massive player-driven fleet wars?",
    },
    "is_womens_day_off_1975": {
        "prompt": "On October 24, 1975, 90% of Iceland's women walked off paid jobs and home duties—paralyzing the country and paving the way five years later for what world first?",
    },
    "is_cod_wars_200_mile_eez": {
        "prompt": "Using Coast Guard net-cutters against Royal Navy frigates without a standing navy, Iceland's 1958–1976 Cod Wars spurred UNCLOS to standardize what maritime zone?",
    },
    "is_lopapeysa_dual_coat_wool": {
        "prompt": "Knitted seamlessly with a circular shoulder yoke, Iceland's 'lopapeysa' sweater repels sleet while trapping heat because native sheep fleece blends which two layers?",
    },
    "is_glima_belt_wrestling": {
        "prompt": "Brought by Viking-Age settlers as Iceland's national sport, which upright folk wrestling style has rivals grip leather waist-and-thigh belts to trip opponents cleanly?",
    },
    "is_euro_2016_smallest_nation": {
        "prompt": "With just ~330,000 citizens—the smallest nation ever in the Euros or World Cup—Iceland stunned which giant 2–1 in the Euro 2016 Round of 16 amid 'Víkingaklapp' chants?",
    },
    "is_niels_finsen_phototherapy": {
        "prompt": "Raised in Reykjavik before researching in Copenhagen, Niels Ryberg Finsen won the 1903 Medicine Nobel for curing skin tuberculosis using concentrated rays of what?",
        "answerCorrect": "Focused ultraviolet light",
    },
    "is_iddp_supercritical_steam": {
        "prompt": "Drilling 4.6 km into Reykjanes volcano, the Iceland Deep Drilling Project taps geothermal fluids above 374 °C and 221 bar in what ultra-energetic physical phase?",
    },
    "is_leif_erikson_lans_aux_meadows": {
        "prompt": "Born in Iceland ~970 CE at Eiríksstaðir, which Norse explorer sailed west ~1000 CE to build a North American camp ('Vinland') five centuries before Columbus?",
    },
    "is_thorgeir_ljosvetningagodi_1000": {
        "prompt": "To avert civil war between heathens and baptized converts at the Althing in 1000 CE, Lawspeaker Þorgeir lay beneath a fur cloak before decreeing what compromise?",
    },
    "is_silfra_fissure_visibility": {
        "prompt": "In Þingvellir National Park, 50-year lava-filtered glacial meltwater fills which flooded rift where divers touch the North American and Eurasian plates in 100-m clarity?",
    },
    "is_torfbaer_turf_houses": {
        "prompt": "In timber-scarce Iceland for a millennium, families survived gales inside thick 'torfbæir' farmsteads insulated with bog turf blocks laid over frames of what?",
    },
    "is_thorsteinn_surtr_sumarauki": {
        "prompt": "Around 955 CE at the Althing—six centuries before Pope Gregory XIII!—Þorsteinn Surtr fixed drifting summer assembly dates by adding what leap unit every 6–7 years?",
    },
    "is_ming_ocean_quahog_507": {
        "prompt": "Dredged off Iceland in 2006 and aged via shell growth rings as the longest-lived non-colonial animal ever verified, 507-year-old 'Ming' (Hafrún) was what creature?",
    },

    # --- Singapore (SG) ---
    "sg_tommy_koh_unclos_1982": {
        "prompt": "Chairing the final sessions (1981–1982) of the Third UN Conference on the Law of the Sea, which Singaporean diplomat steered 'A Constitution for the Oceans' to adoption?",
    },
    "sg_goh_keng_swee_edb_jurong": {
        "prompt": "Dubbed the 'Economic Architect of Singapore'—transforming Jurong swamps into industry and founding MAS and GIC—which London-trained economist served as Finance Minister?",
    },
    "sg_mas_exchange_rate_policy": {
        "prompt": "Because trade tops 300% of GDP, Singapore's Monetary Authority (MAS) conducts monetary policy NOT via interest rates, but by steering the currency inside what band?",
    },
    "sg_sang_nila_utama_singapura": {
        "prompt": "In the 'Sejarah Melayu' (Malay Annals), which Srivijayan prince landed on Temasek ~1299 CE and renamed it 'Singapura' ('Lion City') after spotting a swift red beast?",
    },
    "sg_singapore_stone_mouth_1843": {
        "prompt": "Blasted at the Singapore River's mouth in 1843—saving one sandstone slab now in the National Museum—the 'Singapore Stone' bore undeciphered Kawi script from which era?",
    },
    "sg_henry_ridley_herringbone_tapping": {
        "prompt": "Nicknamed 'Mad Ridley' at Singapore Botanic Gardens in the 1890s, director Henry Ridley unlocked the global tire boom by inventing what non-lethal rubber-tree cut?",
    },
    "sg_anglo_dutch_treaty_1824": {
        "prompt": "Which March 1824 treaty swapped British Bencoolen for Dutch Malacca and drew a line through the Singapore Strait—parting modern Malaysia/Singapore from Indonesia?",
    },
    "sg_lim_bo_seng_force_136": {
        "prompt": "Honored by an octagonal pagoda on Singapore's Esplanade Park, which Force 136 resistance hero built an anti-Japanese intelligence ring before dying unbroken in 1944?",
    },
    "sg_four_national_taps_strategy": {
        "prompt": "To secure water resilience on a river-poor island, Singapore's PUB built the 'Four National Taps': Local Catchment, Imported Water, NEWater, and what fourth source?",
    },
    "sg_horsburgh_lighthouse_pedra_branca": {
        "prompt": "Built in 1851 at the Singapore Strait's eastern entrance—and awarded to Singapore in a 2008 ICJ ruling—Horsburgh Lighthouse stands atop which wave-swept outcrop?",
    },
    "sg_pulau_semakau_landfill": {
        "prompt": "Eight kilometers south of mainland Singapore, offshore ecological landfill Pulau Semakau receives NO raw trash—filling its lined cells solely with what?",
    },
    "sg_bukit_timah_primary_species": {
        "prompt": "Rising 163.63 m at Singapore's center, tiny 163-hectare Bukit Timah Nature Reserve famously holds more native tree species than the entire continent of what?",
    },
    "sg_esplanade_theatres_sunshades": {
        "prompt": "Opened on Marina Bay in 2002 with Russell Johnson acoustics, Esplanade – Theatres on the Bay is nicknamed 'The Durian' for its 7,000 triangular aluminum what?",
    },
    "sg_woha_parkroyal_green_plot": {
        "prompt": "Designed by WOHA in Chinatown, PARKROYAL COLLECTION Pickering weaves contoured sky-gardens exceeding 200% of its lot area—measured by planners via what metric?",
    },
    "sg_five_foot_way_kaki_lima": {
        "prompt": "Mandated in Raffles's 1822 Jackson Plan across Chinatown and Kampong Glam, what continuous covered shophouse sidewalk shields walkers from sun and monsoons?",
    },
    "sg_nanyang_style_georgette_chen": {
        "prompt": "Pioneered in 1950s Singapore by Georgette Chen, Cheong Soo Pieng, Chen Wen Hsi, and Liu Kang after their 1952 Bali trip, which art movement fused Paris oil and Chinese ink?",
    },
    "sg_tuas_megaport_agv": {
        "prompt": "Consolidating all Singapore container terminals onto western reclaimed land with 65-million-TEU capacity, which automated megaport runs fleets of driverless AGVs?",
    },
    "sg_marina_bay_district_cooling": {
        "prompt": "Beneath Marina Bay's service tunnels, the world's largest underground District Cooling network pipes 4.5 °C chilled water to skyscrapers—eliminating individual building-top what?",
        "answerCorrect": "Rooftop chillers & towers",
    },
    "sg_creative_sound_blaster_sim": {
        "prompt": "Founded in Singapore in 1981 by Sim Wong Hoo, Creative Technology gave silent IBM PCs rich game audio in 1989 with which iconic expansion card?",
    },
    "sg_cqt_spooky_1_cubesat": {
        "prompt": "Built at NUS's Centre for Quantum Technologies in Singapore, which 2019 shoebox-sized 3U CubeSat generated entangled photon pairs in orbit for quantum encryption?",
    },
    "sg_singpass_govtech_ndi": {
        "prompt": "Operated by GovTech Singapore since 2003, which unified National Digital Identity app lets citizens sign legal contracts and authenticate across 2,700+ services?",
    },
    "sg_artur_ekert_e91_protocol": {
        "prompt": "Founding director of Singapore's CQT, physicist Artur Ekert invented the 1991 'E91' quantum key protocol—catching eavesdroppers via violations of what quantum relation?",
        "answerCorrect": "Bell's theorem (CHSH)",
    },
    "sg_smooth_coated_otters_bishan": {
        "prompt": "After Singapore naturalized concrete canals at Bishan-Ang Mo Kio Park and Marina Reservoir, rival families of which sleek semi-aquatic mammal reclaimed downtown?",
    },
    "sg_project_wolbachia_aedes": {
        "prompt": "To suppress dengue mosquitoes without chemical fogging, Singapore's NEA releases non-biting male Aedes aegypti carrying which egg-sterilizing intracellular bacterium?",
    },
    "sg_fugu_rubripes_brenner_imcb": {
        "prompt": "Championed in Singapore by Nobel laureate Sydney Brenner in 2002 as the second vertebrate genome sequenced, which toxic fish packs ~22,000 genes into 1/8 human DNA size?",
    },
    "sg_peranakan_buah_keluak": {
        "prompt": "Signature Peranakan dish 'Ayam Buah Keluak' derives its dark truffle-like paste by soaking and fermenting raw cyanide-bearing nuts from which Southeast Asian tree?",
    },
    "sg_kopi_c_kosong_code": {
        "prompt": "In Singapore's traditional Hokkien-Malay kopitiam coffeehouse lingo, ordering 'Kopi-O Kosong' brings dark sock-brewed coffee served with what?",
    },
    "sg_nyonya_pastel_kamcheng": {
        "prompt": "Ordered from Jingdezhen kilns for Straits Chinese homes in Singapore and Penang, pastel pink-and-turquoise Peranakan lidded porcelain jars are called what?",
    },
    "sg_kuo_pao_kun_mama_looking": {
        "prompt": "Awarded Singapore's Cultural Medallion in 1990, which multilingual dramatist staged Hokkien, Mandarin, English, Malay, and Tamil together in 'Mama Looking for Her Cat'?",
    },
    "sg_stella_kon_emily_emerald_hill": {
        "prompt": "Premiered in 1984–1985, Stella Kon's classic one-woman play 'Emily of Emerald Hill' spans five decades in the life of a matriarch from which heritage community?",
    },
    "sg_anthony_chen_ilo_ilo_2013": {
        "prompt": "Tracing the bond between a Singaporean boy and his Filipino helper Teresa during the 1997 financial crisis, which 2013 Anthony Chen debut won Cannes's Caméra d'Or?",
    },
    "sg_joseph_schooling_100_fly_2016": {
        "prompt": "Clocking an Olympic-record 50.39 s in Rio's 100 m butterfly—leaving Phelps, le Clos, and Cseh in a three-way silver tie!—who won Singapore's first Olympic gold?",
    },
    "sg_hdb_eip_1989_ethnic_quotas": {
        "prompt": "Where ~80% of residents own public HDB flats, Singapore enacted which 1989 housing rule capping block-level demographic ratios so segregated enclaves cannot form?",
    },
    "sg_cpf_central_provident_fund": {
        "prompt": "Founded in 1955 and linked in 1968 to HDB home-equity purchases, what mandatory employer-employee savings system anchors Singapore's retirement and healthcare?",
    },
    "sg_singapore_convention_mediation_2019": {
        "prompt": "Signed by 46 nations in August 2019—the first UN treaty named after Singapore!—the 'Singapore Convention' enforces cross-border commercial accords reached via what?",
    },
    "sg_cpa_bar_model_math": {
        "prompt": "Adopted in 70+ countries after Singapore topped TIMSS and PISA rankings, 'Singapore Math' builds pre-algebraic insight via Concrete–Pictorial–Abstract steps and what diagrams?",
    },
    "sg_rail_corridor_ktm_24km": {
        "prompt": "After Malaysia's KTM railway returned its Tanjong Pagar track land in a 2011 accord, Singapore preserved the continuous 24-km north-south corridor across the island as what?",
    },
    "sg_national_gallery_supreme_court": {
        "prompt": "Opened in 2015 for Southeast Asian modern art, National Gallery Singapore united which two adjacent neoclassical civic landmarks overlooking the Padang?",
    },
    "sg_biopolis_one_north_zaha": {
        "prompt": "Master-planned by Zaha Hadid at one-north with skybridges linking genome and immunology labs midair, what is Singapore's flagship biomedical research hub?",
    },
    "sg_wafer_fab_10pct_global": {
        "prompt": "Producing ~10% of world microchips across Woodlands, Tampines, and Jurong, Singapore won global wafer fabs through rock-solid grid power and abundant supplies of what?",
    },
    "sg_tang_shipwreck_belitung": {
        "prompt": "Displayed at Singapore's Asian Civilisations Museum, the 9th-century Belitung dhow cargo of 60,000 Changsha bowls proved direct sea trade between Abbasid Iraq and which Chinese era?",
    },
    "sg_jurong_rock_caverns_150m": {
        "prompt": "Excavated 150 meters beneath Banyan Basin—Southeast Asia's deepest commercial rock caverns—Jurong Rock Caverns saved 60 surface hectares to store 1.47M m³ of what?",
    },
    "sg_raffles_banded_langur_bridge": {
        "prompt": "With fewer than 80 wild individuals left in Singapore, critically endangered Raffles's Banded Langurs safely cross the six-lane BKE expressway via which forested bridge?",
    },
    "sg_cavenagh_bridge_1869_cats": {
        "prompt": "Shipped in crates from Glasgow ironworks to span the Singapore River in 1869—still forbidding cattle over 3 cwt!—what is Singapore's oldest surviving crossing?",
    },
    "sg_coe_vehicle_quota_1990": {
        "prompt": "Introduced in 1990 to prevent island gridlock, what 10-year auctioned permit—often costing more than the car itself!—must a buyer win before registering a car in Singapore?",
    },
    "sg_cloud_forest_desiccant_biomass": {
        "prompt": "How do Gardens by the Bay's giant glass conservatories maintain cool 23 °C climates on the Equator while cutting energy ~30% below standard office towers?",
    },
    "sg_cal_land_area_735": {
        "prompt": "Having grown ~25% via land reclamation from 581 km² in 1965 (adding Marina Bay, Changi, and Tuas), roughly how many square kilometers is Singapore today?",
    },
    "sg_cal_mrt_opened_1987": {
        "prompt": "Pioneering glass platform screen doors for underground stations worldwide, in what year did Singapore's MRT open its inaugural stretch from Yio Chu Kang to Toa Payoh?",
    },
    "sg_cal_phillips_channel_2_8": {
        "prompt": "At its narrowest shipping bottleneck south of Singapore in Phillips Channel—carrying a third of global maritime trade!—to how many kilometers does the lane narrow?",
    },

    # --- Global / Apex Forum (GLOBAL) ---
    "gl_antarctic_treaty_article_4": {
        "prompt": "Signed in December 1959 as the Cold War's first continent-wide arms-control pact, Article IV of the Antarctic Treaty keeps peace south of 60°S by doing what to seven territorial claims?",
    },
    "gl_isa_clarion_clipperton_heritage": {
        "prompt": "Prompted by Arvid Pardo's 1967 'common heritage of mankind' UN speech, which Kingston-based UNCLOS body regulates abyssal mining across 'The Area' beyond national waters?",
    },
    "gl_keynes_bancor_bretton_woods": {
        "prompt": "At the 1944 Bretton Woods conference, John Maynard Keynes proposed balancing global trade via an International Clearing Union issuing what supranational unit of account?",
    },
    "gl_triffin_dilemma_1960": {
        "prompt": "Testifying to Congress in 1960 ahead of the 1971 'Nixon Shock,' economist Robert Triffin identified what contradiction when one nation's currency serves as the world's reserve?",
    },
    "gl_elinor_ostrom_commons_2009": {
        "prompt": "First woman awarded the Economics Nobel (2009), Elinor Ostrom refuted Hardin's 'Tragedy of the Commons' by showing shared pastures, forests, and canals thrive under what?",
    },
    "gl_arrows_impossibility_theorem": {
        "prompt": "Earning Kenneth Arrow the 1972 Nobel, Arrow's Impossibility Theorem proves no ranked voting rule for 3+ options can satisfy non-dictatorship, unanimity, and what third axiom?",
    },
    "gl_godel_incompleteness_1931": {
        "prompt": "Shattering Hilbert's program in 1931, Kurt Gödel's First Incompleteness Theorem proved any consistent formal system capable of basic arithmetic contains true statements that are what?",
    },
    "gl_emmy_noether_symmetry_1918": {
        "prompt": "Hailed by Einstein as a towering mathematical genius, Emmy Noether proved in 1918 that every continuous symmetry of a physical system's action yields a corresponding what?",
    },
    "gl_perelman_poincare_ricci_flow": {
        "prompt": "Of the Clay Institute's seven $1M Millennium Problems announced in 2000, ONLY ONE is solved—Grigori Perelman's 2002–2003 Ricci-flow proof (declining the $1M!) of what?",
    },
    "gl_claude_shannon_1948_entropy": {
        "prompt": "In his 1948 landmark 'A Mathematical Theory of Communication,' Claude Shannon proved virtually error-free transmission over a noisy channel is possible below what ceiling?",
    },
    "gl_landauer_erasure_limit_ktln2": {
        "prompt": "Resolving Maxwell's Demon at IBM in 1961, Rolf Landauer proved that irreversibly ERASING one bit of information at temperature T must dissipate at least what minimum heat?",
    },
    "gl_shor_lattice_ml_kem_nist": {
        "prompt": "Because Shor's quantum algorithm breaks RSA and elliptic curves, NIST's 2024 Post-Quantum Cryptography standards (ML-KEM & ML-DSA) anchor security in what hard math?",
    },
    "gl_diffie_hellman_merkle_1976": {
        "prompt": "In their landmark 1976 paper 'New Directions in Cryptography,' Whitfield Diffie and Martin Hellman solved how two complete strangers establish a shared secret key over what?",
    },
    "gl_alphafold_casp14_hassabis_jumper": {
        "prompt": "Sharing the 2024 Chemistry Nobel with David Baker, Demis Hassabis and John Jumper solved biology's 50-year protein-folding problem across 200M proteins with what AI system?",
    },
    "gl_ligo_gw150914_fabry_perot": {
        "prompt": "Sensing spacetime strain smaller than 1/1,000th of a proton's width in September 2015 (GW150914), LIGO's twin 4-km interferometers caught waves from the merger of what?",
    },
    "gl_eht_m87_sagittarius_vlbi": {
        "prompt": "Linking atomic-clock-synced dishes from Antarctica to Spain into an Earth-sized aperture in 2019, the Event Horizon Telescope imaged M87*'s shadow via what technique?",
    },
    "gl_kibble_balance_planck_kilogram": {
        "prompt": "On May 20, 2019, metrologists retired Paris's platinum-iridium cylinder ('Le Grand K') and redefined the SI kilogram permanently by fixing the exact value of what constant?",
    },
    "gl_b2fh_hoyle_state_carbon12": {
        "prompt": "Fred Hoyle famously predicted Carbon-12's 7.65-MeV nuclear resonance from human existence itself—explaining how red-giant stars forge carbon by fusing three nuclei of what?",
    },
    "gl_hydrothermal_vents_1977_alvin": {
        "prompt": "Diving 2,500 m on the Galápagos Rift aboard Alvin in 1977, geologists shocked biology by finding giant tubeworms thriving in pitch darkness without sunlight via bacterial what?",
    },
    "gl_carl_woese_16s_archaea_1977": {
        "prompt": "Sequencing 16S ribosomal RNA in 1977, Carl Woese and George Fox redrew the Tree of Life into three domains—splitting single-celled organisms without nuclei into Bacteria and what?",
    },
    "gl_crispr_doudna_charpentier_2020": {
        "prompt": "Sharing the 2020 Chemistry Nobel, Emmanuelle Charpentier and Jennifer Doudna turned bacterial phage immunity into programmable gene scissors using guide RNA to steer which enzyme?",
    },
    "gl_svalbard_seed_vault_spitsbergen": {
        "prompt": "Tunneled 130 m into Arctic permafrost on Spitsbergen (78°N) in 2008—and tapped to restore lost Aleppo wheat!—which worldwide 'backup of backups' guards 1.3M+ crop seed samples?",
    },
    "gl_smallpox_eradication_ring_1980": {
        "prompt": "Certified eradicated in Geneva in 1980, WHO's Smallpox Campaign succeeded without vaccinating everyone on Earth thanks to Bill Foege's targeted containment strategy called what?",
    },
    "gl_montreal_protocol_1987_universal": {
        "prompt": "Becoming the first UN treaties ratified universally by all 198 parties, the Vienna Convention and 1987 Montreal Protocol phased out CFC chemicals destroying what?",
    },
    "gl_point_nemo_spacecraft_cemetery": {
        "prompt": "Sitting 2,688 km from the nearest South Pacific islands—so passing ISS astronauts 400 km up are often the closest humans!—what oceanic Pole serves as the spacecraft cemetery?",
    },
    "gl_voyager_golden_record_pulsar_map": {
        "prompt": "Mounted aboard Voyager 1 and 2 in 1977, how does the Golden Record's cover specify Earth's galactic position AND playback timing without human seconds or meters?",
    },
    "gl_antikythera_saros_metonic": {
        "prompt": "Recovered from an Aegean shipwreck in 1900, the ~100 BCE geared bronze Antikythera Mechanism predicted solar and lunar eclipses along which 223-lunation Babylonian cycle?",
    },
    "gl_michael_ventris_linear_b_1952": {
        "prompt": "Without any bilingual Rosetta Stone, young British architect Michael Ventris stunned listeners in 1952 by proving Knossos 'Linear B' clay tablets recorded what language?",
    },
    "gl_borges_library_of_babel_1941": {
        "prompt": "In Jorge Luis Borges's 1941 story 'The Library of Babel,' hexagonal rooms hold every possible 410-page book of 25 symbols—yet why does this drive librarians to despair?",
    },
    "gl_william_jones_indo_european_1786": {
        "prompt": "Addressing Calcutta's Asiatic Society in 1786, Sir William Jones launched comparative linguistics by noting Sanskrit, Greek, and Latin shared grammar pointing to what?",
    },
    "gl_brunelleschi_mirror_peephole_1415": {
        "prompt": "Around 1415 in Florence's Duomo doorway, Filippo Brunelleschi demonstrated linear perspective by having viewers peer through a pinhole in his painted panel into what?",
    },
    "gl_zhu_zaiyu_bach_12_tet": {
        "prompt": "Calculated to 24 decimal places by Ming prince Zhu Zaiyu in 1584—and celebrated by Bach's 'Well-Tempered Clavier'—12-tone equal temperament spaces semitones by what ratio?",
    },
    "gl_alphazero_chinook_checkers_go": {
        "prompt": "Unlike solved 8×8 Checkers, 19×19 Go (~2.1 × 10^170 positions) defied minimax alpha-beta pruning until DeepMind's AlphaGo (2016) paired neural nets with what rollout algorithm?",
    },
    "gl_vickrey_second_price_auction": {
        "prompt": "Earning William Vickrey the 1996 Nobel, why does a sealed-bid SECOND-price auction (winner pays the runner-up's bid!) make honest true-value bidding strictly optimal?",
    },
    "gl_abraham_wald_bomber_bullet_holes": {
        "prompt": "In WWII, when officers wanted to armor bullet-riddled wing areas on returning bombers, statistician Abraham Wald urged armoring the unscathed engines—diagnosing what trap?",
    },
    "gl_simpsons_paradox_berkeley_1973": {
        "prompt": "Illustrated by UC Berkeley's 1973 admissions data—where department rates slightly favored women yet pooled totals reversed!—what statistical paradox flips subgroup trends?",
    },
    "gl_benfords_law_first_digit_30pct": {
        "prompt": "Used by forensic auditors to catch fake ledgers, Benford's Law states that across naturally scaling multi-order datasets, leading digit '1' appears roughly how often?",
    },
    "gl_goodharts_law_target_measure": {
        "prompt": "Formulated by a British economist in 1975 and popularized by Marilyn Strathern, whose eponymous maxim warns: 'When a measure becomes a target, it ceases to be a good measure'?",
        "answerCorrect": "Goodhart's Law",
        "distractors": [
            {"text": "Campbell's Law", "plausibility": 0.86},
            {"text": "Gresham's Law", "plausibility": 0.79},
            {"text": "Conway's Law", "plausibility": 0.71},
            {"text": "Metcalfe's Law", "plausibility": 0.62},
        ],
    },
    "gl_clair_patterson_lead_meteorite_age": {
        "prompt": "Building the first ultra-clean lab in 1953 to date Earth's age to 4.55 billion years via meteorites, geochemist Clair Patterson uncovered global poisoning from what additive?",
    },
    "gl_nasa_dart_dimorphos_2022": {
        "prompt": "In September 2022, NASA's DART probe slammed into moonlet Dimorphos—shortening its orbit by 33 minutes in humanity's first planetary-defense test of what technique?",
    },
    "gl_jwst_sun_earth_l2_halo": {
        "prompt": "Orbiting 1.5 million km anti-sunward so its 5-layer sunshield blocks Sun, Earth, and Moon together at ~40 K, the James Webb Space Telescope loops around which point?",
    },
    "gl_marie_tharp_rift_valley_map": {
        "prompt": "Barred as a woman from research ships until 1968, which oceanographer-cartographer hand-plotted sonar profiles in 1952 to discover the Mid-Atlantic Ridge's axial rift valley?",
    },
    "gl_inge_lehmann_inner_core_1936": {
        "prompt": "Analyzing global P-wave arrivals from a 1929 quake in her terse 1936 paper titled simply 'P',' Danish seismologist Inge Lehmann discovered what inside Earth's molten outer core?",
    },
    "gl_rafael_lemkin_lauterpacht_nuremberg": {
        "prompt": "While Lviv-trained jurist Hersch Lauterpacht championed 'crimes against humanity' at Nuremberg, which fellow Lviv-educated Polish-Jewish lawyer coined the word 'genocide'?",
    },
    "gl_norman_borlaug_shuttle_dwarf_wheat": {
        "prompt": "Awarded the 1970 Nobel Peace Prize for averting famine across Mexico, India, and Pakistan, Norman Borlaug crossed Japanese 'Norin 10' wheat to give stalks what trait?",
    },
    "gl_tu_youyou_artemisinin_1972": {
        "prompt": "Guided by a 340 CE Ge Hong cold-extraction herbal note during Project 523, pharmacologist Tu Youyou won the 2015 Medicine Nobel for isolating which antimalarial drug?",
    },
    "gl_hagia_sophia_pendentives_537": {
        "prompt": "Dedicated in Constantinople in 537 CE by mathematicians Anthemius and Isidore, Hagia Sophia floated a circular dome smoothly atop a square plan using four curved triangular what?",
    },
    "gl_malcom_mclean_teu_container_1956": {
        "prompt": "Slashing port loading costs over 90% in 1956—and gifting twistlock patents royalty-free to ISO!—Malcom McLean and Keith Tantlinger transformed world trade by standardizing what?",
    },
    "gl_victoria_elcano_missing_day_1522": {
        "prompt": "When Magellan–Elcano chronicler Antonio Pigafetta reached Cape Verde in 1522 after keeping daily logs without missing a watch, why did shore calendars read Thursday instead of Wednesday?",
    },
    "gl_cal_territorial_sea_12_nm": {
        "prompt": "Replacing the old 3-mile 'cannon-shot rule,' out to how many nautical miles from its coastal baseline may a nation claim sovereign territorial sea under UNCLOS Article 3?",
    },
    "gl_cal_karman_line_100_km": {
        "prompt": "Adopted by the FAI from Theodore von Kármán's calculation where orbital speed exceeds aerodynamic lift speed, how many kilometers above sea level sits the Kármán Line?",
    },
    "gl_cal_geostationary_35786": {
        "prompt": "Proposed by Arthur C. Clarke in 1945 so satellites match Earth's sidereal spin and hover motionless over the Equator, roughly how many thousand km high is Geostationary Orbit?",
    },
    "gl_cal_fine_structure_137": {
        "prompt": "Called 'one of the greatest damn mysteries of physics' by Richard Feynman, the dimensionless electromagnetic fine-structure constant alpha equals roughly 1 divided by what prime?",
    },
    "gl_cal_westphalia_1648": {
        "prompt": "Ending the Thirty Years' War across Münster and Osnabrück and recognizing Swiss and Dutch independence, in what year was the Peace of Westphalia signed?",
    },
    "gl_cal_challenger_deep_10925": {
        "prompt": "At the southern end of the Pacific's Mariana Trench—deeper than Everest rises above sea level!—roughly how many meters deep (to the nearest 100 m) is Challenger Deep?",
    },
    "gl_cal_four_color_theorem_4": {
        "prompt": "Proved in 1976 by Appel and Haken in the first major computer-assisted proof, what minimum number of colors suffices to color ANY planar map so no adjacent regions match?",
    },

    # --- Boss Synthesis Steps (<= 200 chars & 0 partial-token overlap) ---
    "ch_boss1_s1_geneva_seal": {
        "prompt": "Stamped onto elite mechanical watch movements crafted in western Switzerland since 1886, what prestigious horological hallmark bears a coat of arms of key and eagle?",
    },
    "gb_boss1_s1_earl_of_orrery": {
        "prompt": "Crafted around 1713 by London clockmakers George Graham and Thomas Tompion, the mechanical clockwork model of the Solar System was named after Charles Boyle, holder of which Irish peerage?",
        "answerCorrect": "4th Earl of Orrery",
    },
    "gb_boss1_s3_flamsteed_time_ball": {
        "prompt": "Installed atop Christopher Wren's Flamsteed House by the Thames in 1833, what bright crimson mast-top sphere still drops daily at 13:00 for mariners' chronometers?",
    },
    "jp_boss3_s2_cherenkov_cones": {
        "prompt": "When a neutrino collision kicks a charged lepton faster than light's speed in water inside Super-Kamiokande, photomultipliers catch a blue optical shock cone of what emission?",
        "answerCorrect": "Cherenkov light",
    },
    "br_boss2_s2_sobral_eclipse_1919": {
        "prompt": "While clouds blurred Principe's sky on May 29, 1919, crisp twin eclipse plates taken in which sunny Ceará town in Brazil delivered the decisive proof of General Relativity?",
    },
    "br_boss3_s1_petropolis_crystal_palace": {
        "prompt": "Pre-cast in France for Princess Isabel in 1884—and scene of 1888 abolition celebrations—Brazil's glass-and-iron 'Palácio de Cristal' stands in which mountain town north of Rio?",
    },
    "eg_boss1_s2_syene_shadow_7_2": {
        "prompt": "At solstice noon when sunlight hit the bottom of Aswan's well vertically (0°), Eratosthenes measured Alexandria's gnomon shadow at 7.2°—what fraction of Earth's 360° circle?",
    },
    "eg_boss2_s1_abu_simbel_ptah_dark": {
        "prompt": "Twice a year, dawn sunbeams pierce 60 m into Abu Simbel to light Amun-Ra, Ra-Horakhty, and Ramses II—leaving which fourth seated underworld creator god forever in shadow?",
    },
    "eg_boss2_s2_memnon_singing_colossus": {
        "prompt": "After a 27 BCE quake cracked Amenhotep III's 18-meter quartzite statue at Luxor, Roman emperors visited to hear the 'Colossus of Memnon' chime at dawn—caused by what?",
    },
    "eg_boss2_s3_scanpyramids_muon_void": {
        "prompt": "In 2017 and 2023, the international ScanPyramids team mapped a hidden 30-meter 'Big Void' inside Khufu's Great Pyramid non-invasively using cosmic-ray particles called what?",
    },
    "eg_boss3_s1_abu_kamil_egyptian": {
        "prompt": "Known as 'Al-Hasib al-Misri' ('The Egyptian Calculator'), which 9th–10th century Cairene algebraist extended al-Khwarizmi to irrational roots and inspired Fibonacci?",
    },
    "eg_boss3_s2_qalqashandi_cairo_cipher": {
        "prompt": "Compiled in Mamluk Cairo in 1412 CE, Ahmad al-Qalqashandi's 14-volume encyclopedia preserved Arabic cryptology's classic weapon for breaking substitution ciphers—what method?",
    },
    "eg_boss3_s3_alhazen_spherical_mirror": {
        "prompt": "Solved via conic sections in Cairo by Ibn al-Haytham, 'Alhazen's Problem' asks where light strikes a curved mirror between lamp and observer—an equation of what order?",
        "answerCorrect": "Quartic (4th-order)",
    },
    "is_boss1_s1_meissner_flux_expulsion": {
        "prompt": "Cooled below its critical temperature, a true superconductor doesn't just drop resistance to zero—it actively expels interior magnetic fields via what quantum effect?",
    },
    "is_boss1_s2_josephson_squid_junction": {
        "prompt": "Predicted at age 22 by Brian Josephson, Cooper-pair tunneling across a thin barrier powers 'SQUID' sensors sensitive enough to measure magnetic fields as faint as what?",
    },
    "is_boss1_s3_reykjanes_magnetic_stripes": {
        "prompt": "Towed across the submarine Reykjanes Ridge southwest of Iceland in 1963, magnetometers mapped mirror-symmetric magnetic stripes in basalt—proving what plate mechanism?",
    },
    "is_boss2_s1_columnar_basalt_hexagons": {
        "prompt": "From Reynisfjara to Stuðlagil Canyon, thick cooling lava flows contract and fracture into overwhelmingly six-sided columns because a hexagonal grid minimizes what?",
    },
    "is_boss2_s2_viking_sunstone_rayleigh": {
        "prompt": "When North Atlantic fog hid the Sun on voyages to Iceland and Greenland, how could a Viking navigator rotating a birefringent 'sunstone' crystal locate the hidden Sun?",
    },
    "is_boss2_s3_aurora_oxygen_557_nm": {
        "prompt": "Above Reykjavik's caldera, the signature emerald-green curtain of the Aurora Borealis (557.7 nm) glows at ~100–150 km altitude when solar-wind electrons excite what element?",
    },
    "is_boss3_s1_ice_core_oxygen_18": {
        "prompt": "Drilling deep cores into Vatnajökull and Greenland ice sheets, paleoclimatologists reconstruct ancient polar temperatures from the ratio of light O-16 to which heavy isotope?",
        "answerCorrect": "Heavy O-18 (delta-18O)",
    },
    "is_boss3_s2_kalina_cycle_husavik": {
        "prompt": "Pioneered at northern Iceland's Húsavík geothermal plant for ~120 °C water, the Kalina cycle boosts efficiency over pure steam by boiling water mixed with what compound?",
    },
    "is_boss3_s3_immi_haven_2010": {
        "prompt": "Passed unanimously by Iceland's Althing in June 2010 after the banking crash, the 'Icelandic Modern Media Initiative' (IMMI) combined global legal shields to protect whom?",
    },
    "sg_boss1_s1_shamir_secret_sharing": {
        "prompt": "In Adi Shamir's 1979 (k, n) Secret Sharing scheme, the master key hides as the y-intercept f(0) of a degree-(k−1) polynomial—reconstructible from any k shards via what formula?",
    },
    "sg_boss1_s2_byzantine_3f_plus_1": {
        "prompt": "Proved by Lamport, Shostak, and Pease (1982) and PBFT, if up to f nodes may commit treacherous 'Byzantine' equivocation, what minimum total nodes guarantee async consensus?",
    },
    "sg_boss1_s3_zkp_completeness_soundness": {
        "prompt": "Co-invented by Goldwasser, Micali, and Rackoff (1985), what protocol lets a Prover convince a Verifier they hold a valid secret witness without revealing a single bit of it?",
    },
    "sg_boss2_s1_edfa_erbium_amplifier": {
        "prompt": "Over 25 submarine fiber cables land in Singapore—crossing oceans without electronic regeneration thanks to optical-fiber amplifiers doped with ions of which rare-earth element?",
    },
    "sg_boss2_s2_transit_passage_unclos": {
        "prompt": "Under Part III of the 1982 UNCLOS treaty steered by Tommy Koh, international straits like Malacca–Singapore guarantee ships and aircraft what non-suspendable navigation right?",
    },
    "sg_boss2_s3_bgp_autonomous_systems": {
        "prompt": "Inside carrier-neutral data hubs beneath Singapore, which inter-domain routing standard exchanges reachability tables among Autonomous Systems as 'the glue of the Internet'?",
    },
    "sg_boss3_s1_orchid_velamen_mycorrhiza": {
        "prompt": "Why did tropical orchid breeding stay slow until Knudson (1922) and Singapore Botanic Gardens' Eric Holttum (1928) sprouted dust-fine orchid seeds on sterile sugar agar?",
    },
    "sg_boss3_s2_latent_vs_sensible_heat": {
        "prompt": "In Cooling Singapore's urban-climate models, irrigated skyrise greenery cools street canyons by converting incoming solar energy from air-warming sensible heat into what?",
    },
    "sg_boss3_s3_vortex_shedding_tuned_mass": {
        "prompt": "Beneath Marina Bay Sands's 200-meter SkyPark cantilever sits a 5-tonne Tuned Mass Damper countering footsteps and alternating Von Kármán wind eddies called what?",
    },
    "gl_boss1_s2_rices_theorem_semantic": {
        "prompt": "Extending Turing's Halting Problem in 1953, Rice's Theorem proves that deciding ANY non-trivial semantic property of what arbitrary program code computes is what?",
    },
    "gl_boss1_s3_shamir_ip_equals_pspace": {
        "prompt": "Stunning computer science in 1990, Adi Shamir proved a polynomial-time Verifier questioning an untrusted Prover ('IP') can verify every problem solvable in what class?",
    },
    "gl_boss2_s1_rasch_2pl_irt_fisher": {
        "prompt": "In 2-Parameter Logistic Item Response Theory (2PL IRT), at what item difficulty b relative to player skill theta does a question yield MAXIMUM Fisher information?",
    },
    "gl_boss2_s2_brier_strictly_proper_score": {
        "prompt": "Introduced by Glenn Brier in 1950, what mathematical property of quadratic and log rules ensures a forecaster maximizes expected score ONLY by stating their honest probability?",
    },
    "gl_boss2_s3_aumann_agreeing_disagree_1976": {
        "prompt": "In Robert Aumann's 1976 theorem 'Agreeing to Disagree,' if two rational Bayesians share a common prior and their posterior probabilities become common knowledge, what follows?",
    },
    "gl_boss3_s1_bekenstein_hawking_area": {
        "prompt": "Uniting h-bar, c, G, and kB in S = (kB c^3 A)/(4 G h-bar), Bekenstein and Hawking showed the maximum entropy inside a spatial region scales NOT with volume, but with what?",
    },
    "gl_boss3_s2_sandia_wipp_nuclear_semiotics": {
        "prompt": "Convened by Sandia Labs for 10,000-year waste markers at New Mexico's WIPP salt vault, 'Nuclear Semiotics' wrestled with warning distant descendants without sparking what?",
    },
    "gl_boss3_s3_mertonian_norms_cudOS": {
        "prompt": "Formulated by sociologist Robert K. Merton in 1942, the four 'CUDOS' norms of open science are Communalism, Universalism, Disinterestedness, and what fourth duty?",
    },
}


def rebalance_calibrator_bounds(cext: dict[str, Any], qid: int) -> dict[str, Any]:
    """Ensure `exactVal` never sits inside WIDE (`16.5%`) or SHARP (`6.5%`) of `(minVal+maxVal)/2`.

    Places `exactVal` cleanly around ~24% or ~76% of `[minVal, maxVal]` (alternating by `qid & 1`)
    while strictly respecting step-grid alignment and physical domain ceilings/floors.
    """
    out = dict(cext)
    ex = out["exactVal"]
    mn = out["minVal"]
    mx = out["maxVal"]
    st = out["step"]
    unit = str(out.get("unit", ""))

    def is_safe(lo: float, hi: float) -> bool:
        if not (lo < ex < hi):
            return False
        span = hi - lo
        mid = round(((lo + hi) * 0.5) / st) * st
        wide = max(st * 3, round((span * 0.175) / st) * st)
        return abs(mid - ex) > wide

    if is_safe(mn, mx):
        return out

    is_float = isinstance(st, float) and not st.is_integer()
    orig_steps = max(20, int(round((mx - mn) / st)))

    def snap(v: float) -> int | float:
        return round(v, 4) if is_float else int(round(v))

    def valid_domain(lo: float, hi: float) -> bool:
        if not (lo < ex < hi):
            return False
        if unit == "CE" and ex <= 2025 and hi > 2025:
            return False
        if unit == "%" and (lo < 0 or hi > 100):
            return False
        if ex > 0 and lo <= 0:
            return False
        return is_safe(lo, hi)

    # Candidate A: exactVal sits at ~76% of [lo, hi] (above midpoint)
    hi_steps_above = max(4, int(round(orig_steps * 0.24)))
    cand_a_hi = snap(ex + hi_steps_above * st)
    if unit == "CE" and ex <= 2025 and cand_a_hi > 2025:
        # Clamp ceiling cleanly to <= 2025 on the step grid and extend lower bound!
        max_add = int((2025 - ex) // st)
        if max_add >= 2:
            cand_a_hi = snap(ex + max_add * st)
            span_a = max(orig_steps, max_add * 4 + 4)
            cand_a_lo = snap(cand_a_hi - span_a * st)
        else:
            cand_a_lo = cand_a_hi  # mark invalid
    else:
        cand_a_lo = snap(cand_a_hi - orig_steps * st)

    # Candidate B: exactVal sits at ~24% of [lo, hi] (below midpoint)
    lo_steps_below = max(4, int(round(orig_steps * 0.24)))
    cand_b_lo = snap(ex - lo_steps_below * st)
    if ex > 0 and cand_b_lo <= 0:
        max_sub = int((ex - st) // st)
        if max_sub >= 2:
            cand_b_lo = snap(ex - max_sub * st)
            span_b = max(orig_steps, max_sub * 4 + 4)
            cand_b_hi = snap(cand_b_lo + span_b * st)
        else:
            cand_b_hi = cand_b_lo
    else:
        cand_b_hi = snap(cand_b_lo + orig_steps * st)

    a_ok = valid_domain(cand_a_lo, cand_a_hi)
    b_ok = valid_domain(cand_b_lo, cand_b_hi)

    if a_ok and b_ok:
        chosen = (cand_a_lo, cand_a_hi) if (qid & 1) == 0 else (cand_b_lo, cand_b_hi)
    elif a_ok:
        chosen = (cand_a_lo, cand_a_hi)
    elif b_ok:
        chosen = (cand_b_lo, cand_b_hi)
    else:
        raise ValueError(f"Could not rebalance calibrator bounds for Q{qid}: {cext}")

    out["minVal"], out["maxVal"] = chosen
    return out


def apply_tight_overrides(raw_in: dict[str, Any], qid: int) -> dict[str, Any]:
    q = dict(raw_in)
    tid = q["microTopicId"]
    ov = ITEM_OVERRIDES.get(tid)
    if ov:
        for k, v in ov.items():
            q[k] = v
    if q.get("archetype") == "CALIBRATOR_DIAL" and "calibratorExt" in q:
        q["calibratorExt"] = rebalance_calibrator_bounds(q["calibratorExt"], qid)
    return q
