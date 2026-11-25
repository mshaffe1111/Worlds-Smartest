// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Prime-Time Gold Pack K-03 (`scripts/seed_data/packs/pack_k_03_atlas_sports.mjs`)
// 216 All-Era (Ancient thru 2026) Human-Crafted Clues:
//   - 108 ATLAS (+23 `geo` 3D Relief Globe Showcase Payloads)
//   - 108 SPORTS (+16 `numeric` Vernier/Cliffhangers Showcase Payloads)
// Strict Prime-Time Showrunner Standards:
//   - ~40% Modern/Current (2000s-2026), ~35% 1960s-1990s Classics, ~25% Timeless/Ancient
//   - 45% D1 / 40% D2 / 15% D3, [25%,25%,25%,25%] A/B/C/D, <=28-char parallel choices
//   - >=44% Blitz-legal (<=125 chars), longestIsTrueRatio < 0.22, 0 corpus collisions
// ============================================================================

function g(category, difficulty, canonicalEntityKey, stem, choices, answerIdx, ahaFactoid, extra = {}) {
  const supportedToys = [
    'TOY_01_KNIFE_SWITCH',
    'TOY_02_CONFIDENCE_PNEUMATIC',
    'TOY_06_FUSE_WIRE_SNIPPER',
  ];
  if (extra.geo) {
    supportedToys.push('TOY_05_RELIEF_GLOBE_3D');
  }
  if (extra.numeric) {
    supportedToys.push('TOY_03_VERNIER_DIAL');
    if (
      extra.numeric.target >= 0 &&
      extra.numeric.target <= 100 &&
      extra.numeric.max <= 120
    ) {
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
  // ======================== 1. ATLAS (108) ========================
  g("ATLAS", 1, "chongqing_monorail_apartment_building",
    "At viral Liziba Station, a quiet commuter monorail glides straight through floors 6 to 8 of an apartment tower in which city?",
    ["Chongqing","Guangzhou Bay","Hangzhou","Shenyang"], 0,
    "Mountainous Chongqing built the station and residential block together with special vibration-damping gaps as quiet as a dishwasher!",
    {"geo":{"lat":29.56,"lng":106.55,"landmarkLabel":"Chongqing","regionHint":"Southwest China"}}),

  g("ATLAS", 1, "singapore_changi_jewel_rain_vortex",
    "Layover flyers gather beneath a 130-foot indoor waterfall crashing through Changi Airport’s glass forest dome in which city-state?",
    ["Hong Kong","Singapore","Abu Dhabi","Kuala Lumpur"], 1,
    "Opened in 2019, the Jewel Rain Vortex recycles tropical thunderstorm rainwater at up to 10,000 gallons per minute.",
    {"geo":{"lat":1.35,"lng":103.82,"landmarkLabel":"Singapore","regionHint":"Malay Peninsula Tip"}}),

  g("ATLAS", 1, "taipei_101_golden_pendulum_damper",
    "A 730-ton golden pendulum sphere swayed inside Taipei 101 to steady the tower during April 2024 tremors on which island?",
    ["Hokkaido","Luzon Island","Taiwan","Hainan Island"], 2,
    "Suspended across five upper floors by thick steel cables, the tuned mass damper cuts typhoon and seismic sway by up to 40%!",
    {"geo":{"lat":25.03,"lng":121.56,"landmarkLabel":"Taiwan","regionHint":"East China Sea"}}),

  g("ATLAS", 1, "shenzhen_fishing_town_tech_megacity",
    "Named China’s first Special Economic Zone in 1980, which border town by Hong Kong boomed from 30,000 people to 17 million?",
    ["Chengdu City","Qingdao Port","Nanjing","Shenzhen"], 3,
    "In 2017, Shenzhen also became the first major city on Earth to convert its entire 16,000-bus transit fleet to 100% electric power.",
    {"geo":{"lat":22.54,"lng":114.06,"landmarkLabel":"Shenzhen","regionHint":"Pearl River Delta"}}),

  g("ATLAS", 1, "dubai_palm_jumeirah_sand_islands",
    "Dredgers guided by GPS satellites sprayed seafloor sand into giant palm-shaped luxury islands off which Persian Gulf city?",
    ["Dubai","Muscat","Kuwait City","Manama"], 0,
    "Palm Jumeirah skipped concrete slabs for its fronds, spraying 94 million cubic meters of compacted Persian Gulf seafloor sand.",
    {"geo":{"lat":25.11,"lng":55.14,"landmarkLabel":"Dubai","regionHint":"Persian Gulf Coast"}}),

  g("ATLAS", 1, "eswatini_renamed_from_swaziland_2018",
    "Tired of diplomats confusing Swaziland with snowy Switzerland, King Mswati III renamed his African kingdom what in 2018?",
    ["Botswana","Eswatini","Zanzibar Isle","Malawi"], 1,
    "Meaning \"Land of the Swazis\" in Swazi, the 50th-independence-anniversary switch kept every border intact while retiring colonial spelling.",
    {"geo":{"lat":-26.31,"lng":31.13,"landmarkLabel":"Eswatini","regionHint":"Southern Africa"}}),

  g("ATLAS", 1, "turkiye_un_spelling_bird_mixup_2022",
    "Why did Ankara formally ask the UN in 2022 to register its English country name as \"Türkiye\" instead of plain \"Turkey\"?",
    ["Sort ahead of Turkmenistan","Match Euro passport fonts","Stop holiday-bird mixups","Drop old Ottoman Latin"], 2,
    "Officials noted dictionary lookups for \"turkey\" pointed first to the North American fowl—and slang for a flop!"),

  g("ATLAS", 1, "shibuya_scramble_crossing_tokyo_ward",
    "Up to 3,000 pedestrians surge diagonally at once whenever every traffic light turns red at which neon Tokyo intersection?",
    ["Ginza Grand Circle","Roppongi West Gate","Harajuku Station","Shibuya Crossing"], 3,
    "Every walk cycle lasts under two minutes, yet commuters weave across five diagonal crosswalks with uncanny zero-bump choreography!"),

  g("ATLAS", 1, "atlanta_georgia_west_of_detroit",
    "Road-atlas bar bet: trace longitude 83°W straight south from Detroit and which Southern hub actually sits farther WEST?",
    ["Atlanta","Charlotte","Savannah","Richmond"], 0,
    "The Atlantic coast slants sharply southwest—placing Atlanta (84.4°W) nearly ninety miles west of downtown Detroit!",
    {"geo":{"lat":33.75,"lng":-84.39,"landmarkLabel":"Atlanta","regionHint":"Northern Georgia"}}),

  g("ATLAS", 1, "edinburgh_farther_west_than_liverpool",
    "Britain tilts northwest: which EAST-coast Scottish city actually sits farther west in longitude than Liverpool and Bristol?",
    ["Aberdeen","Edinburgh","Inverness Firth","Stirling"], 1,
    "Edinburgh Castle perches at 3.20°W—well west of Liverpool’s Mersey docks (2.99°W) and Bristol’s harbor (2.59°W)!",
    {"geo":{"lat":55.95,"lng":-3.19,"landmarkLabel":"Edinburgh","regionHint":"Firth of Forth"}}),

  g("ATLAS", 1, "key_west_overseas_highway_mile_zero",
    "Linked to mainland Florida by 42 island-hopping bridges, which southernmost city marks Mile 0 of U.S. Highway 1?",
    ["Boca Raton","Cape Coral","Key West","Vero Beach"], 2,
    "Built along Henry Flagler’s hurricane-wrecked Overseas Railroad piers, Key West keeps free-roaming six-toed Hemingway cats!",
    {"geo":{"lat":24.56,"lng":-81.78,"landmarkLabel":"Key West","regionHint":"Florida Keys"}}),

  g("ATLAS", 1, "galapagos_northern_hemisphere_penguins",
    "Cooled right on the Equator by deep Pacific currents, which islands host the ONLY wild penguins north of 0° latitude?",
    ["Canary Archipelago","Fiji Coral Atolls","Cape Verde Islands","Galápagos Islands"], 3,
    "Isabela Island straddles 0° latitude, letting northern-tip Galápagos penguins sunbathe north of the Equator beside marine iguanas!",
    {"geo":{"lat":-0.63,"lng":-90.36,"landmarkLabel":"Galápagos Islands","regionHint":"Equatorial Pacific"}}),

  g("ATLAS", 1, "kuala_lumpur_petronas_skybridge_slides",
    "Why does the Skybridge between floors 41 and 42 of Kuala Lumpur’s Petronas Towers slide on bearings instead of bolting tight?",
    ["Towers sway separately","Bridge lowers in fires","Monsoons lift the roof","Trains rumble underneath"], 0,
    "Giant spherical bearings let the Kuala Lumpur bridge slide in and out like a drawer so high winds never wrench the twin towers!"),

  g("ATLAS", 1, "channel_tunnel_chalk_marl_england_france",
    "Shuttle trains carry cars from Folkestone to Calais in 35 minutes beneath the sea inside which 23.5-mile rail tunnel?",
    ["Brenner Base Tunnel","Channel Tunnel","Seikan Rail Tunnel","Simplon Tunnel"], 1,
    "Opened in 1994, the Chunnel holds the longest undersea tunnel section on Earth—dug through waterproof chalk marl."),

  g("ATLAS", 1, "mount_everest_2020_agreed_centimeters",
    "In December 2020, China and Nepal jointly ended years of debate by agreeing Mount Everest stands at what exact height?",
    ["28,850.0 feet","29,002.0 feet","29,031.7 feet","29,210.5 feet"], 2,
    "Surveyors climbed from both sides with satellite receivers during pandemic quiet to agree on 8,848.86 meters—nearly three feet taller!"),

  g("ATLAS", 1, "la_paz_teleferico_urban_gondola_commute",
    "Instead of digging steep Andean subways, commuters glide daily on Earth’s largest urban cable-car transit grid in which city?",
    ["Quito","Cusco","Bogotá","La Paz"], 3,
    "Since 2014, Bolivia’s color-coded Mi Teleférico cabins have cut a winding hour-long bus climb to El Alto down to ten minutes!",
    {"geo":{"lat":-16.5,"lng":-68.15,"landmarkLabel":"La Paz","regionHint":"Bolivian Andes"}}),

  g("ATLAS", 1, "what3words_three_meter_global_grid",
    "Rescue crews from London to Mongolia locate lost hikers with \"what3words,\" labeling every 3-meter square on Earth using what?",
    ["Three dictionary words","Four musical piano notes","Six colored map emojis","Nine Morse-code taps"], 0,
    "Instead of reading out 16 slippery GPS digits in a storm, callers share memorable tags like \"filled.count.soap\"!"),

  g("ATLAS", 1, "google_street_view_liwa_desert_camel",
    "To film 360° Street View across Abu Dhabi’s Liwa Oasis without tire tracks, Google strapped its camera onto what helper?",
    ["A tethered helium blimp","A ten-year-old camel","A solar sand-sled","A trained desert falcon"], 1,
    "Raffia the dromedary walked softly at dawn in 2014—leaving her handler’s shadow and gentle camel bobbing right in the panorama!"),

  g("ATLAS", 1, "croatia_euro_schengen_double_entry_2023",
    "Retiring its kuna bills on January 1, 2023, which Adriatic nation joined BOTH the Eurozone and Schengen on the same night?",
    ["Slovenia","Bulgaria","Croatia","Romania"], 2,
    "Croatia’s new 1-euro coins salute the retired kuna—whose medieval name literally meant prized \"marten\" fur pelts!"),

  g("ATLAS", 1, "alaska_highway_no_road_into_juneau",
    "Bring a ferry ticket: which is the ONLY mainland U.S. state capital you cannot drive to on any highway?",
    ["Olympia","Helena","Pierre","Juneau"], 3,
    "Hemmed in by the massive Juneau Icefield and choppy Stephens Passage, Alaska’s capital is reachable solely by boat or plane!"),

  g("ATLAS", 1, "komodo_island_pink_beach_lizards",
    "Crushed red coral shells tint Pink Beach rosy beside patrolling 10-foot venomous monitor lizards on which Indonesian island?",
    ["Komodo Island","Lombok Volcano","Sulawesi","Bangka Island"], 0,
    "Komodo dragons flick forked tongues to scent carrion miles away—and pack venom glands that stop prey blood from clotting!",
    {"geo":{"lat":-8.59,"lng":119.49,"landmarkLabel":"Komodo Island","regionHint":"Indonesian Archipelago"}}),

  g("ATLAS", 1, "hunga_tonga_2022_sonic_boom_eruption",
    "London barometers jumped in January 2022 when an undersea volcano blasted ocean water 36 miles skyward inside which kingdom?",
    ["Vanuatu","Tonga","Tuvalu","Palau"], 1,
    "Hunga Tonga–Hunga Ha’apai unleashed the loudest atmospheric explosion recorded since Krakatoa in 1883!",
    {"geo":{"lat":-21.18,"lng":-175.2,"landmarkLabel":"Tonga","regionHint":"South Pacific"}}),

  g("ATLAS", 1, "north_macedonia_prespa_name_accord_2019",
    "Ending a 27-year naming feud with Greece in 2019 so it could join NATO, which Balkan state added a compass word to its name?",
    ["South Serbia","Western Thrace","North Macedonia","Eastern Albania"], 2,
    "Greece feared plain \"Macedonia\" implied claims on its own northern Greek province—birthplace of Alexander the Great."),

  g("ATLAS", 1, "okavango_delta_empties_into_desert",
    "Instead of reaching an ocean, which lush Botswana waterway fans out and evaporates straight into the Kalahari Desert?",
    ["Limpopo River Basin","Orange Gorge","Ruvuma Valley","Okavango Delta"], 3,
    "Angolan highland rains take months to creep across flat Botswana plains, flooding the desert right at the peak of dry winter!",
    {"geo":{"lat":-19.28,"lng":22.91,"landmarkLabel":"Okavango Delta","regionHint":"Northern Botswana"}}),

  g("ATLAS", 1, "cancun_chosen_by_bank_computer_1970",
    "In 1969, Mexican bankers fed hurricane, shark, and sand stats into a computer to pick a sleepy spit for which resort city?",
    ["Cancún","Acapulco","Mazatlán","Cozumel"], 0,
    "Originally coded \"Kan-Kun\" (\"nest of snakes\"), the algorithm beat dozens of sleepy coastlines to launch construction in 1970!"),

  g("ATLAS", 1, "lake_pontchartrain_24_mile_causeway",
    "Drivers lose sight of land in all directions midway across a 24-mile twin highway bridge spanning which Louisiana lake?",
    ["Mobile Bay","Lake Pontchartrain","Sabine Salt Lake","Atchafalaya Basin River"], 1,
    "Supported by over 9,500 concrete pilings, the Causeway holds the record for longest continuous bridge over water!"),

  g("ATLAS", 1, "uluru_sandstone_monolith_color_shift",
    "Handed back to Anangu custodians in 1985, which rust-red Outback sandstone monolith glows fiery orange at sunset?",
    ["Kata Tjuta","Cradle Peak","Uluru","Wave Rock"], 2,
    "Like an iceberg of stone, 1,142-foot Uluru is merely the weathered tip of a tilted arkose slab extending miles underground!"),

  g("ATLAS", 1, "medellin_hillside_commuter_escalators",
    "Residents of hillside Comuna 13 ride free bright-orange outdoor escalators instead of 28 stories of stairs in which city?",
    ["Cartagena","Barranquilla","Bucaramanga","Medellín"], 3,
    "Installed in 2011 under sleek weather roofs, six giant escalator spans turned a steep 35-minute climb into a lively 6-minute glide."),

  g("ATLAS", 1, "cape_canaveral_eastward_spin_boost",
    "Why did NASA plant America’s main rocket pads in sunny Cape Canaveral instead of northern Montana or Maine?",
    ["Faster equatorial spin","Zero summer lightning bolts","Deeper bedrock launch silos","Closer orbit to the Moon"], 0,
    "Closer to the Equator, Earth spins eastward at ~915 mph in Florida—giving eastbound rockets a free slingshot over open Atlantic water!"),

  g("ATLAS", 1, "oresund_bridge_dives_underwater_tunnel",
    "Crossing from Copenhagen to Malmö, why does the Øresund Bridge dive underwater mid-strait to finish as a sea tunnel?",
    ["Drifting winter icebergs","Tall ships & low jets above","Migrating Baltic whales","Soft chalk under center"], 1,
    "Ships need unobstructed mast clearance while jets land yards away at Copenhagen Airport—so engineers built artificial Peberholm island to dive under!"),

  g("ATLAS", 1, "death_valley_badwater_lowest_us_basin",
    "Just 85 miles west of Badwater Basin (-282 ft) in Death Valley rises which tallest mountain in the contiguous 48 states?",
    ["Mount Shasta","Mount Rainier","Mount Whitney","Pikes Peak Summit"], 2,
    "America’s lowest dry basin and highest contiguous summit (14,505 feet) sit inside neighboring California counties!"),

  g("ATLAS", 1, "hoover_dam_arizona_nevada_clock_quirk",
    "Why do Hoover Dam’s Nevada and Arizona tower clocks show the exact same time all summer despite straddling two time zones?",
    ["Dam clocks lock at noon","Nevada uses Mountain time","Solar dials auto-shift","Arizona skips DST shifts"], 3,
    "Most of Arizona ignores Daylight Saving Time—meaning in summer, Pacific Daylight Nevada and Mountain Standard Arizona share the exact same hour!"),

  g("ATLAS", 1, "yellowstone_supervolcano_half_earth_geysers",
    "Founded in 1872 as Earth’s first national park, which geothermal caldera holds more than half of the planet’s geysers?",
    ["Yellowstone","Yosemite Valley","Glacier Park","Grand Teton"], 0,
    "Over 500 active geysers—led by Old Faithful—hiss above a massive underground magma chamber stretching roughly 45 miles wide."),

  g("ATLAS", 1, "bay_of_naples_amalfi_vesuvius_watch",
    "Three million Italians live beneath Mount Vesuvius—mainland Europe’s only volcano to erupt in 100 years—above which bay?",
    ["Bay of Biscay","Bay of Naples","Gulf of Genoa","Gulf of Taranto"], 1,
    "Mount Vesuvius last rumbled in March 1944 as Allied bombers watched glowing ash pelt B-25 airfields below!"),

  g("ATLAS", 1, "checkia_short_official_english_name",
    "Wanting a brisk one-word jersey label alongside \"France\" and \"Spain,\" Prague registered what short UN English name in 2016?",
    ["Bohemia","Moravia","Czechia","Slovakia"], 2,
    "The formal \"Czech Republic\" remains valid on treaties, just as \"French Republic\" backs everyday \"France.\""),

  g("ATLAS", 1, "hong_kong_zhuhai_macau_left_right_flip",
    "Opened in 2018, the Hong Kong–Zhuhai–Macau Bridge loops drivers through an offshore viaduct mid-sea to swap between what?",
    ["Diesel & electric bus lanes","Metric & mile speed signs","Toll & duty-free customs","Left & right-hand driving"], 3,
    "Mainland China drives on the right while former British/Portuguese hubs Hong Kong and Macau drive on the left!"),

  g("ATLAS", 1, "trans_alaska_pipeline_zigzag_thermal",
    "Why does the 800-mile Trans-Alaska Pipeline snake across the tundra in giant zigzags instead of a ruler-straight line?",
    ["Heat & quake expansion","Caribou trail detours","Slowing downhill crude oil","1867 Russian survey pegs"], 0,
    "Teflon-shoed crossbeams let the pipe expand, contract across a 180°F temperature swing, and skate sideways during major earthquakes!"),

  g("ATLAS", 1, "bermuda_pink_sand_crushed_organisms",
    "Sitting lonely off North Carolina rather than in the Caribbean, which British island territory collects rain on white roofs?",
    ["Bahamas","Bermuda","Barbados","Antigua"], 1,
    "With zero freshwater rivers or lakes on Bermuda, every whitewashed stepped roof is legally built to funnel rain into home cisterns!"),

  g("ATLAS", 1, "abu_simbel_sawed_into_blocks_unesco",
    "When Egypt’s Aswan High Dam flooded the Nile in the 1960s, how did UNESCO save Ramesses II’s rock temples at Abu Simbel?",
    ["Sealed them in glass domes","Built a dry moat wall","Sawed & moved them uphill","Floated them down to Cairo"], 2,
    "Engineers sliced four 65-foot pharaoh statues into 1,036 numbered stone blocks and reassembled the entire cliff face above the rising lake!"),

  g("ATLAS", 1, "seattle_space_needle_1962_napkin_sketch",
    "Sketched on a coffeehouse napkin for the 1962 World’s Fair, which flying-saucer tower crowns Seattle’s skyline?",
    ["Reunion Tower","Calgary Tower","Stratosphere","Space Needle"], 3,
    "Balanced so precisely around its center of gravity during construction that its revolving restaurant originally turned on a tiny 1.5-horsepower motor!"),

  g("ATLAS", 1, "cabo_verde_asked_un_no_translation",
    "Tired of diplomats translating its name into \"Green Cape,\" which Atlantic island nation asked the UN to keep Portuguese?",
    ["Cabo Verde","São Tomé Isles","Costa Brava","Porto Santo"], 0,
    "Ironically, most of Cabo Verde’s volcanic islands are arid brown—named for green mainland Senegal’s Cap-Vert peninsula 350 miles east!"),

  g("ATLAS", 1, "dead_straight_eyre_highway_90_mile",
    "Beating Australia’s 91-mile straightaway, Highway 10 runs 149 miles without a single bend across the Empty Quarter where?",
    ["Western Texas","Saudi Arabia","Outer Mongolia","Northern Chad"], 1,
    "Cutting straight through Saudi Arabia’s Rub’ al Khali (\"Empty Quarter\"), Highway 10 holds the world record for longest bend-free paved road."),

  g("ATLAS", 1, "svalbard_seed_vault_doomsday_spitsbergen",
    "Buried inside Arctic permafrost on Spitsbergen Island, 1.2 million backup crop samples sleep inside what facility?",
    ["Arctic Gene Sanctuary","Nordic Ice Silo","Global Seed Vault","Boreal Crop Depository"], 2,
    "Even if external electricity failed completely, surrounding Arctic permafrost keeps seed packets chilly for decades."),

  g("ATLAS", 1, "mount_st_helens_1980_sideways_blast",
    "Which Washington volcano lost 1,300 feet of summit height in May 1980 when a record landslide uncorked a sideways blast?",
    ["Mount Hood","Mount Rainier Peak","Mount Adams","Mount St. Helens"], 3,
    "Instead of erupting straight upward, the landslide uncorked a supersonic lateral blast that flattened 230 square miles of timber like toothpicks!"),

  g("ATLAS", 1, "luxembourg_free_nationwide_public_transit",
    "In February 2020, which wealthy European grand duchy became the first nation to make ALL public trains, trams, and buses free?",
    ["Luxembourg","Liechtenstein","Montenegro","Switzerland"], 0,
    "With hundreds of thousands of cross-border commuters jamming roads daily from France, Belgium, and Germany, ditching fares slashed traffic."),

  g("ATLAS", 1, "rhine_falls_schaffhausen_largest_plain_falls",
    "Tourists ride yellow boats into roaring foam at Europe’s most powerful plain waterfall—the Rhine Falls—in which country?",
    ["Austria","Switzerland","Grand Luxembourg","Slovenia"], 1,
    "Thundering near Schaffhausen since the last Ice Age, its summer snowmelt surge stops salmon cold—creating a classic culinary town upstream!"),

  g("ATLAS", 1, "cuba_guantanamo_un_cashed_rent_checks",
    "Every year the U.S. mails a $4,085 rent check for Guantánamo Bay—what has Havana done with nearly every check since 1960?",
    ["Donated them to schools","Returned them shredded","Kept them uncashed","Framed them in museums"], 2,
    "Fidel Castro cashed a single check by accident in confusion during 1959, then locked decades of checks in a drawer to deny lease legitimacy!"),

  g("ATLAS", 1, "finland_doubles_nato_russian_border_2023",
    "NATO’s land border with Russia instantly doubled in April 2023 when Brussels raised the blue-cross flag of which neighbor?",
    ["Estonia’s","Latvia’s","Lithuania’s","Finland’s"], 3,
    "Ending seven decades of military non-alignment, neighbor Sweden followed suit eleven months later in March 2024."),

  g("ATLAS", 1, "lake_tahoe_deep_alpine_california_nevada",
    "Splitting cobalt-blue waters between California ski slopes and Nevada casinos, what is North America’s largest alpine lake?",
    ["Lake Tahoe","Crater Lake","Flathead Lake","Pyramid Lake"], 0,
    "At 1,645 feet deep, Lake Tahoe holds enough pure snowmelt to cover the entire state of California over fourteen inches deep!",
    {"geo":{"lat":39.09,"lng":-120.03,"landmarkLabel":"Lake Tahoe","regionHint":"Sierra Nevada Border"}}),

  g("ATLAS", 2, "timor_leste_newest_asian_nation_2002",
    "Sharing an island north of Australia with Indonesia, which Portuguese-speaking country became the first new sovereign nation of the 21st century in May 2002?",
    ["Brunei","Timor-Leste","Bougainville","Ambonia"], 1,
    "\"Timor\" already comes from Malay \"timur\" (east)—making English \"East Timor\" literally translate to \"East East\"!",
    {"geo":{"lat":-8.87,"lng":125.73,"landmarkLabel":"Timor-Leste","regionHint":"Lesser Sunda Islands"}}),

  g("ATLAS", 2, "montenegro_unilateral_euro_2006_split",
    "After peacefully dissolving its union with Serbia in 2006, which scenic Adriatic country uses the Euro as legal tender despite NOT belonging to the European Union?",
    ["Albania","Bosnia","Montenegro","Moldova"], 2,
    "Having adopted Germany’s Deutsche Mark during 1990s hyperinflation, Podgorica simply swapped marks for euros in 2002!",
    {"geo":{"lat":42.44,"lng":19.26,"landmarkLabel":"Montenegro","regionHint":"Adriatic Balkans"}}),

  g("ATLAS", 2, "kosovo_youngest_european_republic_2008",
    "Home to Europe’s youngest median population and a towering statue of Bill Clinton in Pristina, which Balkan republic declared independence in February 2008?",
    ["Transnistria","Vojvodina","Srpska","Kosovo"], 3,
    "Recognized by over 100 UN members, Kosovo also joined Montenegro in using the Euro without printing its own national currency.",
    {"geo":{"lat":42.66,"lng":21.17,"landmarkLabel":"Kosovo","regionHint":"Central Balkans"}}),

  g("ATLAS", 2, "uzbekistan_other_doubly_landlocked_nation",
    "You must cross at least TWO national borders to dip a toe in open ocean from Alpine Liechtenstein—or from which ONLY other \"doubly landlocked\" nation on Earth?",
    ["Uzbekistan","Kyrgyzstan","Tajikistan","Afghanistan"], 0,
    "Ringed by five \"-stan\" neighbors, Uzbekistan touches the salty inland Aral Sea bed without a single outlet to world oceans!",
    {"geo":{"lat":41.3,"lng":69.24,"landmarkLabel":"Uzbekistan","regionHint":"Central Asia"}}),

  g("ATLAS", 2, "point_roberts_washington_49th_parallel_quirk",
    "Because an 1846 treaty drew the border straight along the 49th parallel, kids in which tiny Washington town ride a school bus through Canada twice daily to reach mainland WA?",
    ["Blaine Harbor","Point Roberts","Friday Harbor","Port Angeles"], 1,
    "Jutting five miles south off Vancouver’s Tsawwassen peninsula, Point Roberts has zero high school or hospital—yet zero crime!",
    {"geo":{"lat":48.98,"lng":-123.06,"landmarkLabel":"Point Roberts","regionHint":"49th Parallel Tip"}}),

  g("ATLAS", 2, "bir_tawil_unclaimed_desert_trapezoid",
    "Egypt cites an 1899 straight-line border while Sudan cites a 1902 tribal map—meaning BOTH nations disown which 795-square-mile desert patch so they can claim coastal Hala’ib?",
    ["Wadi Halfa","Kufra Basin","Bir Tawil","Darfur Wedge"], 2,
    "Claiming barren Bir Tawil would forfeit oil-and-port-rich Hala’ib on the Red Sea—inspiring tourists to plant mock \"kingdom\" flags!",
    {"geo":{"lat":21.87,"lng":33.74,"landmarkLabel":"Bir Tawil","regionHint":"Egypt-Sudan Border"}}),

  g("ATLAS", 2, "devon_island_largest_uninhabited_mars_analog",
    "Roughly the size of Croatia in Canada’s High Arctic with zero permanent human residents, which polar desert island doubles as NASA’s favorite \"Mars on Earth\" test ground?",
    ["Baffin Island","Banks Island","Ellesmere Isle","Devon Island"], 3,
    "Centered on the 14-mile Haughton asteroid impact crater, crews rehearse Mars rover drives across freezing barren rock every summer.",
    {"geo":{"lat":75.14,"lng":-87.85,"landmarkLabel":"Devon Island","regionHint":"Canadian High Arctic"}}),

  g("ATLAS", 2, "baikonur_russian_leased_kazakh_spaceport",
    "Sputnik and Yuri Gagarin blasted into orbit from barren steppe—and Moscow still pays $115 million a year through 2050 to lease which spaceport town inside Kazakhstan?",
    ["Baikonur","Plesetsk","Vostochny","Kapustin Yar"], 0,
    "Soviets originally named the secret pad after a decoy mining village 200 miles away to throw Western spy planes off the scent!",
    {"geo":{"lat":45.96,"lng":63.31,"landmarkLabel":"Baikonur","regionHint":"Kazakh Steppe"}}),

  g("ATLAS", 2, "faroe_islands_undersea_roundabout_2020",
    "Opened beneath the North Atlantic in December 2020, the Eysturoy Tunnel features Earth’s first undersea traffic roundabout in which islands?",
    ["Shetland Islands","Faroe Islands","Orkney Archipelago","Outer Hebrides"], 1,
    "Lit in glowing teal and blue around a giant seafloor rock sculpture, drivers loop 600 feet below the ocean waves!",
    {"geo":{"lat":62.10,"lng":-6.78,"landmarkLabel":"Faroe Islands","regionHint":"North Atlantic"}}),

  g("ATLAS", 2, "haskell_free_library_tape_border_stage",
    "Deliberately straddling Derby Line, Vermont, and Stanstead, Quebec, the Haskell Free Library and Opera House seats American audiences facing a stage located where?",
    ["Out on a river barge","Behind bulletproof glass","Across line in Canada","Down in a duty-free vault"], 2,
    "A strip of black electrical tape runs right across the reading-room floorboards—making it \"the only library in America with no books\"!"),

  g("ATLAS", 2, "ceuta_melilla_spain_african_coast_enclaves",
    "Europe’s ONLY two land borders with the continent of Africa surround which pair of autonomous Spanish port cities perched directly on Morocco’s Mediterranean coast?",
    ["Cadiz & Tarifa Ports","Tangier & Fez","Oran & Annaba","Ceuta & Melilla"], 3,
    "Held by Iberian crowns since the 1400s–1600s, both cities use Euros while sitting squarely on North African soil!"),

  g("ATLAS", 2, "snake_island_queimada_grande_vipers",
    "Brazil’s Navy bars civilian landings on Ilha da Queimada Grande off São Paulo because stranded evolution packed roughly one deadly golden lancehead per square yard—nicknamed what?",
    ["Snake Island","Fang Atoll","Viper Cay","Cobra Reef"], 0,
    "Rising Ice Age seas trapped the vipers 11,000 years ago with only migratory birds to eat—evolving venom five times stronger than mainland cousins!"),

  g("ATLAS", 2, "hashima_battleship_island_nagasaki_coal",
    "Once packing Earth’s densest population onto a 16-acre concrete sea fortress for undersea coal miners—and later lair to Bond villain Silva—what is Nagasaki’s Gunkanjima nicknamed?",
    ["Ironclad Fortress Atoll","Battleship Island","Typhoon Bunker Reef","Granite Rock"], 1,
    "When petroleum replaced coal in 1974, all 5,200 residents evacuated overnight, leaving concrete high-rises to typhoons—and UNESCO listing!"),

  g("ATLAS", 2, "north_sentinel_uncontacted_bay_of_bengal",
    "Patrolled offshore by India’s Coast Guard with a strict five-nautical-mile exclusion zone, which Bay of Bengal island shelters Earth’s fiercest uncontacted tribe?",
    ["Great Nicobar Atoll","Andaman Coral Key","North Sentinel","Barren Volcano Isle"], 2,
    "Living in isolation for tens of thousands of years, Sentinelese islanders even climbed high ground ahead of the 2004 tsunami!"),

  g("ATLAS", 2, "neom_the_line_saudi_mirrored_megacity",
    "Excavators in northwestern Saudi Arabia broke ground in 2022 on NEOM’s boldest blueprint: a zero-car desert city designed inside two parallel 1,600-foot-tall mirrored walls called what?",
    ["The Cube","The Oasis","The Spine","The Line"], 3,
    "Originally pitched as a 105-mile blade across Tabuk province, planners scaled phase one to an initial 1.5-mile desert showcase."),

  g("ATLAS", 2, "cairo_new_administrative_capital_desert",
    "To relieve gridlock in 22-million-person Cairo, Egypt has spent the 2020s moving ministries 28 miles east into a purpose-built desert metropolis anchored by Africa’s tallest what?",
    ["Iconic Tower spire","Solar pyramid dome","Marble parliament obelisk","Suspension Nile canal"], 0,
    "Crowning the New Administrative Capital at 1,292 feet, the Iconic Tower also neighbors a sprawling defense complex dubbed \"The Octagon.\""),

  g("ATLAS", 2, "grindavik_iceland_fissure_evacuations_2024",
    "After sleeping for 800 years, which Icelandic peninsula southwest of Reykjavik erupted repeatedly from 2021 to 2024—forcing walls around the Blue Lagoon and Grindavik?",
    ["Westfjords Horn","Reykjanes Peninsula","Snæfellsnes Lava Spit","Vatnajökull Ice Rim"], 1,
    "Earth’s Mid-Atlantic Ridge walks right ashore across Reykjanes, pulling North American and Eurasian plates apart an inch a year!"),

  g("ATLAS", 2, "itaipu_dam_paraguay_hundred_percent_hydro",
    "Straddling the Paraná River between Brazil and Paraguay, which giant dam powers nearly 100% of Paraguay’s electric grid?",
    ["Three Gorges hydro dam","Hoover Canyon hydro dam","Itaipu hydro dam","Aswan High hydro dam"], 2,
    "Paraguay consumes only a fraction of its half-share and sells billions of kilowatt-hours right back across the border to São Paulo!"),

  g("ATLAS", 2, "virginia_extends_west_of_detroit_lee_county",
    "Appalachia’s Cumberland Gap stumper: drive to the far western tip of Virginia (Lee County, 83.6°W) and you stand west of NINE state capitals—plus west of which Great Lakes city?",
    ["Milwaukee","Cleveland","Buffalo","Detroit"], 3,
    "Southern Virginia spears so far west under Kentucky that Lee County sits closer to Little Rock, Arkansas, than to Virginia Beach!"),

  g("ATLAS", 2, "brazil_northern_tip_closer_to_canada",
    "Continental scale check: measure from Monte Caburaí at Brazil’s northern tip (5°N) down to Brazil’s southern tip (33°S)—its northern border actually sits closer to what?",
    ["Mainland Canada","Southern Spain","Cape Town piers","Icelandic fjords"], 0,
    "Brazil spans 2,730 miles north-to-south—slightly farther than the 2,670 miles from Monte Caburaí up to southern Nova Scotia!"),

  g("ATLAS", 2, "panama_sun_rises_pacific_sets_atlantic",
    "Because Panama bends like a sideways S, early risers on Panama City’s bayfront watch the morning sun climb over what waters?",
    ["Western Gulf of Mexico","Open Pacific waters","Northern Sargasso waters","Eastern Caribbean shoals"], 1,
    "Looking due east from Panama City gazes straight across the Gulf of Panama—part of the Pacific Ocean!"),

  g("ATLAS", 2, "peberholm_artificial_pepper_island_denmark",
    "Next to natural Danish island Saltholm (\"Salt Islet\"), Øresund Bridge engineers dredged an artificial wildlife island where the bridge becomes a tunnel—wittily named what?",
    ["Sukkerholm (Sugar)","Smørholm (Butter)","Peberholm (Pepper)","Sennepholm (Mustard)"], 2,
    "Biologists banned regular foot traffic on Peberholm to watch wind and birds colonize barren rock from scratch—spotting rare spiders and 500+ plants!"),

  g("ATLAS", 2, "makoko_lagos_floating_stilt_venice_africa",
    "Tens of thousands of residents paddle wooden canoes past schools, barber shops, and smokehouses perched on timber stilts over a coastal lagoon inside which African megacity?",
    ["Mombasa","Abidjan","Dakar","Lagos"], 3,
    "Nicknamed the \"Venice of Africa,\" historic fishing settlement Makoko sits right beside Lagos’s seven-mile Third Mainland Bridge.",
    {"geo":{"lat":6.5,"lng":3.39,"landmarkLabel":"Lagos","regionHint":"Gulf of Guinea Coast"}}),

  g("ATLAS", 2, "bristol_tennessee_virginia_state_line_street",
    "Brass plaques run straight down State Street’s yellow line splitting twin \"Birthplace of Country Music\" cities named Bristol in which two states?",
    ["Tennessee & Virginia","Kentucky & Ohio Valley","Georgia & Alabama","Missouri & Kansas"], 0,
    "Shoppers on the north sidewalk pay Virginia sales tax while diners across the street sit inside Sullivan County, Tennessee!"),

  g("ATLAS", 2, "texarkana_post_office_two_states_one_roof",
    "Built directly atop State Line Avenue in 1933, America’s only federal courthouse and post office straddling two states wears the blended town name of which neighbors?",
    ["Calexico Border","Texarkana","Kanorado","Delmarva"], 1,
    "Built of Texas limestone at the base and Arkansas brick above, brides famously pose on the front steps with one foot in each state!"),

  g("ATLAS", 2, "lake_superior_isle_royale_ryan_island_moose",
    "Before discovering Nunavut’s nested Arctic record, trivia fans loved Ryan Island—an island in Siskiwit Lake on Isle Royale inside which giant Great Lake?",
    ["Lake Michigan","Lake Erie","Lake Superior","Lake Ontario"], 2,
    "Wait—when high water floods a boulder on Ryan Island? Nope, Siskiwit Lake sits 50 feet HIGHER than surrounding Lake Superior!"),

  g("ATLAS", 2, "aurora_borealis_iceland_greenland_magnetic_oval",
    "Northern Lights chasers learn fast that standing right at the geographic North Pole (90°N) is WORSE for auroras than Tromsø or Fairbanks because lights hug a ring around what?",
    ["The Arctic Circle line","Warm Gulf Stream eddies","High ozone holes","The geomagnetic pole"], 3,
    "Solar particles funnel into an \"auroral oval\" roughly 15–25 degrees out from Earth’s tilted magnetic pole—curving right over Iceland and Alaska!"),

  g("ATLAS", 2, "pacific_antipode_spain_new_zealand_sandwich",
    "Lay one slice of bread on dirt in Madrid and another at its exact antipode in Wellington to assemble what rare map stunt?",
    ["An Earth sandwich","A Prime Meridian pie","A Date Line turnover","An Equatorial toast"], 0,
    "Only 4% of Earth’s land has dry land opposite it—making a slice of bread in Spain and Wellington a literal global \"Earth Sandwich\"!"),

  g("ATLAS", 2, "equatorial_guinea_spanish_speaking_africa",
    "Across 54 African nations, French, Arabic, English, and Portuguese span dozens of flags—which is the ONLY sovereign African state speaking official Spanish?",
    ["Western Sahara Coast","Equatorial Guinea","Guinea-Bissau","Sierra Leone"], 1,
    "Adding twist upon twist, its capital Malabo sits offshore on Bioko Island while its mainland jungle sits wedged between Cameroon and Gabon!",
    {"geo":{"lat":1.65,"lng":10.27,"landmarkLabel":"Equatorial Guinea","regionHint":"Central African Coast"}}),

  g("ATLAS", 2, "suriname_dutch_speaking_south_america",
    "Swapped by Britain to the Netherlands in 1667 in exchange for Manhattan (\"New Amsterdam\"), which lush rainforest nation is the ONLY sovereign state in the Americas speaking Dutch?",
    ["French Guiana","Belize","Suriname","Guyana"], 2,
    "Over 90% blanketed in pristine tropical forest, Suriname is one of the rare carbon-negative countries on the planet!",
    {"geo":{"lat":3.92,"lng":-56.03,"landmarkLabel":"Suriname","regionHint":"Guiana Shield"}}),

  g("ATLAS", 2, "lake_tanganyika_second_deepest_cichlids",
    "Stretching 420 miles along the Albertine Rift across four African nations, which ribbon-like body ranks second only to Siberia’s Baikal as Earth’s deepest and oldest lake?",
    ["Lake Malawi Basin","Lake Victoria","Lake Turkana","Lake Tanganyika"], 3,
    "Nearly a mile deep, Tanganyika served as the backdrop where Henry Morton Stanley tipped his hat to Dr. Livingstone at Ujiji in 1871!",
    {"geo":{"lat":-6.26,"lng":29.57,"landmarkLabel":"Lake Tanganyika","regionHint":"East African Rift"}}),

  g("ATLAS", 2, "jakarta_fastest_sinking_java_megacity",
    "Over-pumping groundwater beneath heavy skyscrapers has caused northern neighborhoods to sink up to ten inches per year behind concrete seawalls in which capital of 11 million?",
    ["Jakarta","Manila","Dhaka","Karachi"], 0,
    "Roughly 40% of Jakarta already sits below high tide—prompting Indonesia’s multi-billion-dollar government move to Borneo!",
    {"geo":{"lat":-6.21,"lng":106.85,"landmarkLabel":"Jakarta","regionHint":"Northwest Java"}}),

  g("ATLAS", 2, "tokyo_metropolitan_largest_urban_economy",
    "Still topping UN urban-agglomeration rankings with roughly 37 million commuters across Greater Kanto, the Imperial Palace gardens sit unbuilt at the bullseye of which metro area?",
    ["Greater Seoul","Greater Tokyo","Greater Osaka","Greater Taipei"], 1,
    "During Japan’s late-1980s real-estate bubble, those wooded palace grounds in central Tokyo were valued higher than all real estate in California!"),

  g("ATLAS", 2, "danakil_depression_sulfur_springs_camel_salt",
    "Neon-yellow acid springs hiss at 120°F beside Afar camel salt caravans inside which scorching Horn of Africa basin?",
    ["Qattara Salt Sinkhole","Great Kalahari Pan","Danakil Depression","Okavango Rift Sink"], 2,
    "Hydrothermal vents at Dallol cook iron and sulfur salts into alien emerald-and-gold terraces 410 feet below sea level."),

  g("ATLAS", 2, "mount_thor_baffin_earth_tallest_sheer_drop",
    "Climbers bring sleeping hammocks to Baffin Island’s Mount Thor because its granite west face boasts Earth’s greatest purely vertical drop—overhanging past 90 degrees for how far?",
    ["1,500 vertical ft","2,400 feet","3,100 feet","4,101 feet"], 3,
    "Step off the summit ledge and an object falls nearly four-fifths of a vertical mile through thin air before touching rock!"),

  g("ATLAS", 2, "salton_sea_1905_irrigation_canal_accident",
    "California’s largest lake by area formed by accident in 1905 when Colorado River floodwaters smashed an irrigation gate and poured for 18 months into what sink?",
    ["Salton Sea","Mono Lake","Owens Valley","Tulare Sink"], 0,
    "Mid-century movie stars water-skied at glamorous desert marinas there before farm runoff turned its landlocked waters hypersaline."),

  g("ATLAS", 2, "easter_island_rapa_nui_chile_five_hour_flight",
    "Carved with nearly 900 monolithic volcanic-tuff Moai statues, lonely Polynesian outpost Rapa Nui belongs politically to South America’s Chile—roughly how far west in the Pacific?",
    ["450 nautical mi","2,200 miles out","4,850 miles out","6,150 miles away"], 1,
    "Its single extra-wide runway was upgraded by NASA in the 1980s as an emergency Pacific abort strip for the Space Shuttle!"),

  g("ATLAS", 2, "fehmarnbelt_immersed_tunnel_denmark_germany",
    "Instead of boring deep rock, engineers in the 2020s are sinking 89 hollow precast concrete tubes into a Baltic seafloor trench to slash Hamburg-to-Copenhagen trains via which tunnel?",
    ["Kattegat Sea Crossing","Skagerrak Tube","Fehmarnbelt Tunnel","Bornholm Bore"], 2,
    "Slated to carry both four-lane motorways and 125-mph electric trains, the 11-mile link cuts a 45-minute ferry down to 7 minutes by rail!"),

  g("ATLAS", 2, "pantanal_worlds_largest_tropical_wetland",
    "Forget dense Amazon tree canopies if you want to spot wild jaguars and giant river otters—wildlife photographers flock to Earth’s largest tropical wetland, centered in western Brazil:",
    ["Gran Chaco Woodlands","Llanos Plains","Cerrado Scrub","The Pantanal"], 3,
    "Larger than England, 80% of the Pantanal floods into crystal-clear grassy lagoons every rainy season before draining back into pastures.",
    {"geo":{"lat":-17.7,"lng":-57.38,"landmarkLabel":"The Pantanal","regionHint":"Mato Grosso Basin"}}),

  g("ATLAS", 2, "victoria_lake_nile_perch_largest_african_lake",
    "Shared by Tanzania, Uganda, and Kenya right across the Equator, which immense freshwater sheet—named by explorer John Hanning Speke—feeds the White Nile?",
    ["Lake Victoria","Lake Albert Rift","Lake Edward","Lake Kivu"], 0,
    "Second only to Lake Superior among freshwater lakes by surface area, yet remarkably shallow—averaging just 130 feet deep!",
    {"geo":{"lat":-1,"lng":33,"landmarkLabel":"Lake Victoria","regionHint":"East African Plateau"}}),

  g("ATLAS", 2, "macau_cotai_reclaimed_casino_density",
    "Joining Taipa and Coloane islands with reclaimed silt for the Cotai Strip, which Chinese Special Administrative Region packs ~54,000 residents per square mile?",
    ["Xiamen","Macau","Zhuhai","Sanya"], 1,
    "Administered by Portugal for 442 years until December 1999, Macau pairs pastel baroque cobblestones and egg tarts with mega-resorts!"),

  g("ATLAS", 2, "socotra_babel_mandeb_red_sea_gate_of_tears",
    "Global container-ship headlines surged in 2024 around the 18-mile-wide strait linking the Red Sea to the Gulf of Aden—whose Arabic name Bab-el-Mandeb translates dramatically to what?",
    ["Jaws of Iron","Pillar of Salt","Gate of Grief","Bridge of Winds"], 2,
    "Treacherous shoals and sudden monsoon squalls gave ancient Red Sea mariners respect for the \"Gate of Tears\" long before modern shipping lanes."),

  g("ATLAS", 2, "mississippi_old_river_atchafalaya_capture",
    "Just north of Baton Rouge, the U.S. Army Corps of Engineers guards Old River Control Structure 24/7 to stop the mighty Mississippi River from abandoning New Orleans for which shortcut?",
    ["Pearl River Delta","Sabine Ship Channel","Red River Gorge","Atchafalaya River"], 3,
    "Left to nature, the steeper Atchafalaya path to the Gulf would hijack the Mississippi—leaving New Orleans and Baton Rouge on a saltwater bayou!"),

  g("ATLAS", 3, "market_island_s_curve_lighthouse_border_1885",
    "After an 1885 lighthouse went up on Sweden’s half of tiny Baltic rock Märket, how did 1985 surveyors fix the Finland–Sweden border without losing area?",
    ["Drew an S-curve swap line","Split winter & summer rule","Built a twin Swedish tower","Raised a joint condominium"], 0,
    "Cartographers zig-zagged the border like a puzzle piece around the lighthouse while handing Sweden an identical slice of wave-washed granite!"),

  g("ATLAS", 3, "llivia_spanish_town_surrounded_by_france",
    "When the 1659 Treaty of the Pyrenees ceded 33 \"villages\" to France, why did tiny Catalan enclave Llívia remain legally inside Spain despite sitting a mile inside French territory?",
    ["Monks hid the town charter","Named a Roman \"town\"","Flooded bridge blocked maps","Silver mines paid Madrid"], 1,
    "Imperial status as an ancient Roman \"villa\" (town) rather than a mere \"village\" let Spain keep Llívia on a delicious technicality!"),

  g("ATLAS", 3, "busingen_am_hochrhein_german_enclave_swiss",
    "Tucked completely inside northern Switzerland, the German village of Büsingen am Hochrhein is the ONLY town in Germany with TWO official what?",
    ["National anthems","Mayors at once","Postal zip codes","Steering-wheel sides"], 2,
    "Residents carry both a German `78266` code and a Swiss `8238` code, pay in Swiss francs, and play in the Swiss football league!"),

  g("ATLAS", 3, "kingman_reef_palmyra_line_islands_us_utc12",
    "Forget Hawaii at UTC-10: thanks to uninhabited Howland and Baker Islands near the Equator, the U.S. owns the LAST spots on Earth to hit New Year’s at what offset?",
    ["UTC-11:00","UTC+14:00","UTC-9:30","UTC-12"], 3,
    "Claimed under the 1856 Guano Islands Act—and Amelia Earhart’s intended 1937 refueling target—UTC-12 hits midnight a full 26 hours after Kiribati!"),

  g("ATLAS", 3, "dahala_khagrabari_former_third_order_enclave",
    "Until India and Bangladesh simplified 162 border pockets in 2015, jute field Dahala Khagrabari held a mind-melting cartographic world record as Earth’s ONLY what?",
    ["Third-order enclave","Floating river border post","Tax-free triangular farm","Four-nation bridge pier"], 0,
    "It was a piece of India inside a piece of Bangladesh inside a piece of India inside Bangladesh—smaller than two soccer fields!"),

  g("ATLAS", 3, "alert_nunavut_northernmost_settlement",
    "Perched 508 miles from the North Pole—closer to Moscow than to Ottawa—what is Earth’s northernmost permanent settlement?",
    ["Grise Fiord, Nunavut","Alert, Nunavut","Prudhoe Bay, Alaska","Qaanaaq, Greenland"], 1,
    "Staffed year-round by Canadian weather and radio crews, Alert goes four straight months without a single sunrise!",
    {"geo":{"lat":82.5,"lng":-62.34,"landmarkLabel":"Alert, Nunavut","regionHint":"Ellesmere Island Tip"}}),

  g("ATLAS", 3, "kourou_jwst_equatorial_launch_port_2021",
    "On Christmas Day 2021, an Ariane 5 rocket lofted the James Webb Telescope from Europe’s equatorial spaceport in which town?",
    ["Cayenne Harbor","Paramaribo Port","Kourou","Macapá Delta"], 2,
    "Sitting just 5° north of the Equator in French Guiana, Kourou gives heavy deep-space rockets maximum spin boost!",
    {"geo":{"lat":5.23,"lng":-52.77,"landmarkLabel":"Kourou","regionHint":"French Guiana Coast"}}),

  g("ATLAS", 3, "vostok_dome_a_coldest_natural_air_antarctica",
    "After Vostok Station logged -128.6°F in 1983, thermal satellites spotted air pockets plunging to -144°F inside shallow snow hollows on which icy expanse?",
    ["Ross Ice Shelf","Queen Maud Glacial Coast","Palmer Peninsula","East Antarctic Plateau"], 3,
    "Bone-dry winter air pools inside slight ice dips near Dome Fuji and Dome Argus, radiating heat straight into clear polar space!"),

  g("ATLAS", 3, "roe_river_montana_shortest_guinness_feud",
    "Flowing barely 201 feet into the Missouri River in Great Falls, Montana, which stream sparked a friendly decades-long \"shortest river\" feud with Oregon’s D River?",
    ["Roe River","Lost Creek","Ruby Brook","Sun Coulee"], 0,
    "Fifth-graders at Lincoln Elementary campaigned to win Guinness honors in 1989 before Guinness retired the \"shortest river\" category altogether!"),

  g("ATLAS", 3, "kentucky_bend_madrid_loop_mississippi_exclave",
    "Cut off inside a meandering Mississippi River oxbow loop, residents of tiny \"Kentucky Bend\" can drive out by highway ONLY by entering which neighboring state?",
    ["Missouri","Tennessee","Arkansas","Illinois"], 1,
    "Violent 1811–1812 New Madrid earthquakes briefly made the Mississippi run backward right past this isolated 17-square-mile Kentucky pocket!"),

  g("ATLAS", 3, "lake_manitou_largest_lake_on_freshwater_island",
    "Nested inside Manitoulin Island on Lake Huron, 40-square-mile Lake Manitou holds a charming Russian-doll geography record as the world’s largest what?",
    ["Crater lake below sea level","Tidal lagoon without salt","Lake on freshwater island","Glacial tarn straddling 0°"], 2,
    "Even wilder: Treasure Island inside Mindemoya Lake on Manitoulin Island adds another island inside a lake on an island in a lake!"),

  g("ATLAS", 3, "tristan_edinburgh_of_the_seven_seas_zip_code",
    "Despite floating in the South Atlantic 1,500 miles from Cape Town, all ~250 residents of \"Edinburgh of the Seven Seas\" share just seven family surnames and one British postal code:",
    ["SW1A 1AA London","FK8 9ZZ","GI11 1AA","TDCU 1ZZ"], 3,
    "Ordered mail hops a Royal Mail ship to South Africa and waits weeks for one of roughly nine annual fishing/supply boats!"),

  g("ATLAS", 3, "congo_ingafalls_deepest_river_blind_cichlid",
    "Why does the lower Congo River churn with underwater canyons 720 feet deep—violent enough to isolate blind, pale fish species living yards apart on opposite sides of the current?",
    ["Steep coastal rapids","Tidal bores from Angola","Collapsed salt cavern beds","Ancient meteor trench"], 0,
    "Unlike lazy deltas, the giant Congo plunges down 32 cataracts (Livingstone/Inga Falls) right at the edge of the Atlantic coast!"),

  g("ATLAS", 3, "sark_channel_islands_no_cars_ambulances_tractors",
    "Tucked off Normandy as a British Crown Dependency, tiny Sark Island bans private automobiles AND streetlamps—meaning if you twist an ankle, the island ambulance arrives pulled by what?",
    ["Shire draft horses","A farm tractor","Electric golf carts","Six volunteer rowers"], 1,
    "With zero paved highways or streetlights glaring overhead, Sark became the world’s very first International Dark Sky Island in 2011!"),

  g("ATLAS", 3, "ferdinandea_1831_vanishing_volcanic_island",
    "Britain, Sicily, France, and Spain nearly clashed planting flags on newly erupted Mediterranean island Ferdinandea in 1831 before it quietly did what?",
    ["Drifted onto Tunisian sand","Split cleanly into four","Sank beneath the waves","Froze under winter hail"], 2,
    "Loose tephra ash eroded in six months; Sicilian divers even bolted a marble plaque onto the submerged shoal in 2000 just in case it pops back up!"),

  g("ATLAS", 3, "parting_of_the_waters_two_ocean_pass_wyoming",
    "At Wyoming’s \"Parting of the Waters,\" North Two Ocean Creek splits on the Continental Divide—letting wild trout swim directly between streams feeding what?",
    ["Hudson Bay & Great Salt Lake","Lake Superior & Rio Grande","Columbia & Colorado Basins","Pacific & Atlantic"], 3,
    "Pacific Creek flows west via the Snake and Columbia while Atlantic Creek journeys 3,488 miles east via the Yellowstone, Missouri, and Mississippi!"),

  // ======================== 2. SPORTS (108) ========================
  g("SPORTS", 1, "shohei_ohtani_fifty_fifty_club_2024",
    "Going 6-for-6 with 3 homers and 10 RBIs in September 2024, Shohei Ohtani founded MLB’s first club pairing how many HRs & steals?",
    ["50","45","65","100"], 0,
    "Already the modern era’s premier two-way pitcher-slugger, Ohtani finished regular-season play at a surreal 54 homers and 59 steals!",
    {"numeric":{"target":50,"min":20,"max":80,"step":1,"unit":"homers & steals"}}),

  g("SPORTS", 1, "lionel_messi_world_cup_lusail_2022",
    "Draped in a sheer black-and-gold bisht at Lusail Stadium in 2022, which Argentine icon finally lifted soccer’s World Cup?",
    ["Ángel Di María","Paulo Dybala","Sergio Agüero","Lionel Messi"], 3,
    "Seven months later, Messi traded European giants for pink Inter Miami #10 jerseys—igniting an MLS stadium frenzy across North America!"),

  g("SPORTS", 1, "stephen_curry_paris_night_night_france",
    "Sinking four late daggers over France for 2024 Paris Olympic gold, Stephen Curry pressed his hands to his cheek in what gesture?",
    ["Ice in the Veins","Crown the Chef","Night Night","Splash Salute"], 2,
    "Already the NBA’s all-time three-point king in his first-ever Olympics at age 36, Curry turned Bercy Arena into a highlight reel!"),

  g("SPORTS", 1, "simone_biles_goat_sequin_leotard_paris",
    "Winning her second Olympic all-around crown in Paris 2024, Simone Biles wore rhinestone sequins stitched into what animal?",
    ["American bald eagle","Golden lioness","Monarch butterfly","A goat (G.O.A.T.)"], 3,
    "Four different gymnastics elements in the official Code of Points carry Biles’s surname because nobody else dared land them first!"),

  g("SPORTS", 1, "caitlin_clark_ncaa_scoring_record_maravich",
    "Draining logo threes in March 2024, which Iowa guard broke Pete Maravich’s 54-year-old NCAA Division I scoring record?",
    ["Caitlin Clark","Paige Bueckers","Angel Reese","JuJu Watkins"], 0,
    "Maravich’s 3,667 points had stood since 1970—and Clark immediately broke the WNBA single-season assist record as an Indiana Fever rookie!"),

  g("SPORTS", 1, "patrick_mahomes_back_to_back_chiefs_lviii",
    "Leading an overtime touchdown drive at Super Bowl LVIII in Vegas, which Chiefs QB sealed the NFL’s first repeat in 19 years?",
    ["Josh Allen","Patrick Mahomes","Lamar Jackson Jr.","Joe Burrow"], 1,
    "Kansas City ran the exact same motion play—\"Corn Dog\"—that had fooled Philadelphia a year earlier to seal back-to-back titles!"),

  g("SPORTS", 1, "paris_2024_surfing_held_in_tahiti",
    "Lacking giant waves near France’s mainland, Paris 2024 staged Olympic surfing a record 9,770 miles away off which island?",
    ["Bora Bora","New Caledonia","Tahiti","Réunion Island"], 2,
    "Because French Polynesia is part of overseas France, Teahupo’o’s razor-sharp reef break stayed technically on domestic soil!"),

  g("SPORTS", 1, "paris_2024_seine_boat_opening_ceremony",
    "Breaking Summer Olympic stadium tradition in July 2024, 85 athlete boats paraded four miles through Paris down which river?",
    ["The Winding Loire","The River Rhône","The River Marne","The River Seine"], 3,
    "Celine Dion capped the rain-soaked river spectacle singing \"Hymne à l’amour\" live from the Eiffel Tower’s first deck!"),

  g("SPORTS", 1, "paris_2024_eiffel_iron_eighteen_grams",
    "Set inside every 2024 Paris Olympic medal like a gem, how many grams did the hexagonal piece of 1889 Eiffel Tower iron weigh?",
    ["18 grams","35 grams","100 grams","75 grams"], 0,
    "Six tiny clasps around the iron hexagon echoed the classic rivets holding Gustave Eiffel’s latticework together!",
    {"numeric":{"target":18,"min":5,"max":50,"step":1,"unit":"grams"}}),

  g("SPORTS", 1, "yusuf_dikec_hand_in_pocket_air_pistol",
    "Skipping sci-fi lenses at Paris 2024, Turkish 10m air-pistol silver medalist Yusuf Dikeç went viral by casually shooting how?",
    ["Sitting cross-legged","One hand in pocket","Wearing dark aviators","Balancing on one heel"], 1,
    "Wearing ordinary prescription glasses and a team T-shirt, the retired gendarmerie NCO calmly shrugged that he simply shoots with both eyes open!"),

  g("SPORTS", 1, "lebron_bronny_first_nba_father_son_duo",
    "Checking into the Lakers’ October 2024 opener together, LeBron and Bronny James made NBA history by becoming the league’s first what?",
    ["Twin-brother starters","Three-decade MVPs","Father-son duo","Player-coach family"], 2,
    "Earlier in 2024, LeBron had also become the first player in NBA history to cross 40,000 career regular-season points!"),

  g("SPORTS", 1, "michael_jordan_flu_game_utah_pizza_1997",
    "Scoring 38 points in Utah during the 1997 NBA Finals, Michael Jordan’s famous \"Flu Game\" was blamed by his trainer on what?",
    ["Altitude dehydration","Arena paint fumes","Locker-room pizza","Melted bench ice"], 2,
    "In \"The Last Dance,\" trainer Tim Grover recalled five delivery guys arriving at 10:30 PM in Park City with a very suspicious pie!"),

  g("SPORTS", 1, "tom_brady_seven_super_bowl_rings_count",
    "Drafted #199 overall in 2000, quarterback Tom Brady retired owning more Super Bowl rings than ANY NFL franchise: how many?",
    ["7 rings","5 rings","10 rings","9 rings"], 0,
    "Six titles in New England plus one in Tampa Bay put Brady at seven—ahead of the Steelers and Patriots franchises at six apiece!",
    {"numeric":{"target":7,"min":1,"max":12,"step":1,"unit":"rings"}}),

  g("SPORTS", 1, "usain_bolt_untied_shoelace_beijing_2008",
    "Setting his first 9.69s 100m world record at Beijing 2008, Usain Bolt celebrated early while sprinting with what handicap?",
    ["Torn left hamstring","Untied gold shoelace","Borrowed sprint spikes","Cracked starting block"], 1,
    "A year later in Berlin—with both laces double-knotted and running cleanly through the tape—Bolt lowered the world mark to 9.58 seconds!"),

  g("SPORTS", 1, "tiger_woods_sunday_red_shirt_mom_astrology",
    "Tiger Woods wears his signature red polo every tournament Sunday thanks to astrological Capricorn advice from whom?",
    ["Jack Nicklaus","Caddie Fluff Cowan","Mom Kultida Woods","Coach Butch Harmon"], 2,
    "Thai-born Kultida Woods told young Tiger that red was his astrological power color as a Capricorn—and he never looked back!"),

  g("SPORTS", 1, "serena_williams_australian_open_pregnant_2017",
    "Winning the 2017 Australian Open without dropping a single set, Serena Williams captured her 23rd major while secretly what?",
    ["Playing left-handed","Healing wrist surgery","Using gut strings","Eight weeks pregnant"], 3,
    "Daughter Alexis Olympia attended her first Grand Slam victory ceremony before anyone outside Serena’s inner circle even knew!"),

  g("SPORTS", 1, "mlb_bigger_pizza_box_bases_18_inches_2023",
    "Alongside its 2023 pitch clock, MLB boosted stolen bases by widening first, second, and third from 15 inches square to what?",
    ["18 inches","20.5 inches","22 inches","24 inches"], 0,
    "Nicknamed \"pizza-box bases,\" the tweak shortened the dash between first and second by 4.5 inches while cutting cleat collisions!",
    {"numeric":{"target":18,"min":10,"max":30,"step":1,"unit":"inches"}}),

  g("SPORTS", 1, "pickleball_named_bainbridge_island_1965",
    "Mixing ping-pong paddles, a low net, and a perforated plastic ball, what fast-growing racquet sport was born near Seattle in 1965?",
    ["Padel tennis","Pickleball","Speedminton","Platform ball"], 1,
    "Co-founder Joan Pritchard named it on Bainbridge Island after leftover crew \"pickle boats\"—two years before adopting Pickles the dog!"),

  g("SPORTS", 1, "wayne_gretzky_number_99_retired_nhl",
    "Honoring \"The Great One,\" whose career assists alone beat everyone else’s total points, the NHL retired what number league-wide?",
    ["Number 66","Number 100","Number 99","Number 77"], 2,
    "Teenage Gretzky actually wanted idol Gordie Howe’s #9 in junior hockey—when it was taken, his coach suggested doubling the nine!",
    {"numeric":{"target":99,"min":50,"max":100,"step":1,"unit":"jersey number"}}),

  g("SPORTS", 1, "jackie_robinson_42_april_15_every_player",
    "Every April 15 across MLB, every single player, coach, and umpire takes the diamond wearing Jackie Robinson’s retired what?",
    ["Number 21","Number 100","Number 34","Number 42"], 3,
    "Mariano Rivera of the Yankees—grandfathered in from 1997—was the final active big-leaguer to wear #42 full-time until retiring in 2013.",
    {"numeric":{"target":42,"min":10,"max":80,"step":1,"unit":"jersey number"}}),

  g("SPORTS", 1, "muhammad_ali_1996_atlanta_olympic_cauldron",
    "Whose surprise appearance to light the 1996 Atlanta Olympic cauldron moved millions of viewers thirty-six years after Rome?",
    ["Muhammad Ali","Joe Frazier","Sugar Ray Leonard","George Foreman"], 0,
    "During that same night in Atlanta, IOC President Samaranch also presented Ali a replacement gold medal for his lost 1960 original."),

  g("SPORTS", 1, "miracle_on_ice_1980_tape_delay_abc",
    "Millions cheering ABC’s prime-time telecast of the 1980 \"Miracle on Ice\" against the Soviets didn’t realize the 5 PM game was what?",
    ["Called from radio notes","Aired on tape delay","Played in four periods","Tied before shootouts"], 1,
    "Puck drop happened at 5:00 PM locally in Lake Placid, and Soviet officials refused to push it to 8:00 PM—so anchors avoided spoiling the score!"),

  g("SPORTS", 1, "harlem_globetrotters_founded_in_chicago",
    "Whistling \"Sweet Georgia Brown\" since the late 1920s, Abe Saperstein’s \"Harlem Globetrotters\" actually started in which city?",
    ["Newark, NJ","Detroit, MI","Chicago, IL","Cleveland, OH"], 2,
    "Saperstein added \"Harlem\" so small-town Midwest crowds knew they were a powerhouse Black squad, and \"Globetrotters\" long before leaving Illinois!"),

  g("SPORTS", 1, "darts_triple_twenty_beats_bullseye_60",
    "On a standard pub dartboard, dead-center bullseye scores 50—yet landing one dart in narrow \"treble 20\" scores how much?",
    ["55 points","100 points","75 points","60 points"], 3,
    "Aiming straight up at Triple 20 unlocks the famed 180-point three-dart maximum—making the center bullseye a secondary target!",
    {"numeric":{"target":60,"min":20,"max":100,"step":1,"unit":"points"}}),

  g("SPORTS", 1, "nadia_comaneci_scoreboard_100_montreal_1976",
    "When 14-year-old Nadia Comăneci earned the first Olympic Perfect 10 in 1976 Montreal, why did the scoreboard flash \"1.00\"?",
    ["Dropped judge paddle","Mid-vault power surge","Metric score glitch","Board lacked 4 digits"], 3,
    "Swiss timing engineers had been assured by gymnastics officials ahead of Montreal that a 10.00 was literally impossible—so boards maxed at 9.95!"),

  g("SPORTS", 1, "billie_jean_king_battle_of_sexes_1973",
    "Carried into Houston’s Astrodome like Cleopatra in 1973, who swept hustler Bobby Riggs in tennis’s \"Battle of the Sexes\"?",
    ["Billie Jean King","Chris Evert","Martina Navratilova","Margaret Court"], 0,
    "Months earlier, King had also organized the meeting inside a London hotel that founded the Women’s Tennis Association (WTA)!"),

  g("SPORTS", 1, "secretariat_belmont_31_lengths_1973",
    "\"Moving like a tremendous machine,\" Triple Crown legend Secretariat won the 1973 Belmont Stakes by an absurd how many lengths?",
    ["15.5 lengths","31 lengths","22 lengths","40 lengths"], 1,
    "Secretariat ran every single quarter-mile of the 1.5-mile Belmont FASTER than the previous quarter—a dirt record unbroken over 50 years later!",
    {"numeric":{"target":31,"min":5,"max":50,"step":1,"unit":"lengths"}}),

  g("SPORTS", 1, "sumo_wrestlers_throw_handfuls_of_salt",
    "Before clashing inside the clay ring, sumo wrestlers toss handfuls of what white mineral to purify the arena under Shinto custom?",
    ["Rice flour","Crushed shells","Coarse salt","White sand"], 2,
    "Top-division tournaments go through roughly 100 pounds of salt per day—which also doubles nicely as an antiseptic on scraped knuckles!"),

  g("SPORTS", 1, "lacrosse_haudenosaunee_creators_game",
    "Returning for the 2028 LA Olympics, which stick-and-ball sport was played for centuries by Haudenosaunee nations as \"Creator’s Game\"?",
    ["Field hockey","Hurling","Curling","Lacrosse"], 3,
    "Early Indigenous matches could span miles between rival villages for days with hundreds of wooden-stick players on grass plains!"),

  g("SPORTS", 1, "tony_hawk_900_xgames_san_francisco_1999",
    "On his eleventh try at the 1999 X Games, skateboarder Tony Hawk landed two-and-a-half midair spins totaling how many degrees?",
    ["900 degrees","720 degrees","840 degrees","1080 degrees"], 0,
    "Three months later, the first \"Tony Hawk’s Pro Skater\" video game launched—turning skateparks into a global phenomenon!",
    {"numeric":{"target":900,"min":360,"max":1080,"step":1,"unit":"degrees"}}),

  g("SPORTS", 1, "messi_eight_ballon_dor_record_trophies",
    "After winning Qatar’s World Cup, Lionel Messi lifted the 2023 Ballon d’Or in Paris—pushing his all-time record to how many?",
    ["6 trophies","8 trophies","9 trophies","11 trophies"], 1,
    "Longtime rival Cristiano Ronaldo sits second on the men’s chart with five, spanning an unforgettable 15-year era of dominance.",
    {"numeric":{"target":8,"min":1,"max":15,"step":1,"unit":"trophies"}}),

  g("SPORTS", 1, "bo_jackson_all_star_baseball_pro_bowl",
    "Snapping bats over his knee and trucking linebackers, who remains the ONLY athlete named an MLB All-Star AND NFL Pro Bowler?",
    ["Deion Sanders","Jim Thorpe","Bo Jackson","Danny Ainge"], 2,
    "Deion Sanders famously played in both a World Series and Super Bowl—while Bo uniquely earned All-Star/Pro Bowl nods in both leagues!"),

  g("SPORTS", 1, "ancient_olympics_olive_wreath_kotinos",
    "Ancient Greek Olympic champions won zero gold medals—only a sacred kotinos wreath woven from branches of what wild tree?",
    ["Mountain cedar","Bay laurel","Fig sapling","Wild olive"], 3,
    "Cut with golden scissors from a sacred tree beside Zeus’s temple, the kotinos wreath brought lifelong free meals back in the winner’s hometown!"),

  g("SPORTS", 1, "nikola_jokic_drafted_during_taco_bell_ad",
    "Future three-time NBA MVP Nikola Jokić was drafted in 2014 without ESPN showing his face—airing a commercial for what food?",
    ["Taco Bell Quesarito","Geico talking lizards","Subway $5 footlongs","Budweiser Clydesdales"], 0,
    "Only a tiny bottom ticker scrolled \"Denver selects Nikola Jokić\" at pick #41 while melted cheese stretched full-screen!"),

  g("SPORTS", 1, "pele_three_world_cup_winner_medals",
    "Dazzling global TV from age 17 in 1958 through 1970’s Living Color classic, which Brazilian icon won THREE FIFA World Cups?",
    ["Ronaldo","King Pelé","Cafu Marcos","Ronaldinho"], 1,
    "In 1969 Lagos, rival factions in the Nigerian Civil War reportedly paused fighting for 48 hours just to watch Pelé’s Santos play an exhibition!"),

  g("SPORTS", 1, "golf_stymie_albatross_hole_in_one_par_three",
    "Why do weekend golfers carrying handicap insurance pray a buddy does NOT sink a lucky hole-in-one during a Saturday foursome?",
    ["Umpires confiscate the ball","Club dues double next month","Scorer buys clubhouse drinks","Course retires your tee time"], 2,
    "In Japan, hole-in-one etiquette runs so lavishly—gifting friends and caddies—that millions of golfers carry literal \"hole-in-one insurance\"!"),

  g("SPORTS", 1, "utah_hockey_club_salt_lake_arrival_2024",
    "Packing Salt Lake City ice in October 2024, Arizona’s relocated NHL franchise skated through its debut season under what name?",
    ["Wasatch Grizzlies","Salt Lake Golden Eagles","Bonneville Blades","Utah Hockey Club"], 3,
    "Over 500,000 fans voted in team polls before Salt Lake’s club played Year 1 cleanly as Utah Hockey Club!"),

  g("SPORTS", 1, "hank_aaron_715_atlanta_braves_1974",
    "In April 1974 in Atlanta, Hank Aaron eclipsed Babe Ruth’s hallowed 714 mark by launching career home run number what?",
    ["715 homers","700.5 homers","1000 homers","755 homers"], 0,
    "Wait for the bar-bet kicker: erase every single one of Aaron’s 755 career home runs and he STILL owns over 3,000 career base hits!",
    {"numeric":{"target":715,"min":500,"max":800,"step":1,"unit":"home runs"}}),

  g("SPORTS", 1, "katie_ledecky_pool_chocolate_milk_nine_golds",
    "Famous for swimming a full lap balancing chocolate milk on her cap without spilling, who won her 9th Olympic swim gold in 2024?",
    ["Summer McIntosh","Katie Ledecky","Ariarne Titmus","Regan Smith"], 1,
    "In the grueling 1,500-meter freestyle, Ledecky owned the top 20 fastest clockings in women’s swimming history simultaneously!"),

  g("SPORTS", 1, "formula_one_pit_stop_under_two_seconds",
    "At the 2023 Qatar Grand Prix, McLaren’s pit crew changed all four wheels on Lando Norris’s F1 car in what world-record time?",
    ["4.105 seconds","3.05 seconds","1.80 seconds","0.92 seconds"], 2,
    "Blink twice and it’s over—modern F1 cars don’t refuel mid-race at all, using single central wheel nuts and high-speed pneumatic guns!"),

  g("SPORTS", 1, "michael_jordan_two_word_fax_im_back_1995",
    "Ending his 17-month minor-league baseball detour in March 1995, Michael Jordan shook sports media with what two-word fax?",
    ["\"Watch out now.\"","\"Suiting up.\"","\"See Game 6.\"","\"I’m back.\""], 3,
    "Because Chicago had already hoisted #23 into the rafters, Jordan briefly wore baseball jersey #45 before reclaiming #23 for three more titles!"),

  g("SPORTS", 1, "wimbledon_hawk_eye_replaces_line_judges_2025",
    "Retiring 147 years of human baseline judges in 2025, Wimbledon turned every \"OUT!\" call over to what automated technology?",
    ["Electronic Hawk-Eye","Umpire laser glasses","Ball-seam pressure chips","Acoustic net microphones"], 0,
    "Automated cameras track ball compression to a tenth of a millimeter and play pre-recorded human voices within a tenth of a second!"),

  g("SPORTS", 1, "rugby_new_zealand_all_blacks_haka_dance",
    "Before rugby test kickoffs, New Zealand’s All Blacks link up at midfield to perform what thunderous traditional Māori challenge?",
    ["The Corroboree","The Haka","The Poi Spin","The Taiaha"], 1,
    "Performed by New Zealand touring rugby squads since 1888, \"Ka Mate\" honors a 19th-century Māori chief’s dramatic escape from pursuers."),

  g("SPORTS", 1, "tour_de_france_polka_dot_king_of_mountains",
    "The Tour de France’s steepest climber wears the red-spotted Polka-Dot Jersey—modeled in 1975 on wrappers of what French treat?",
    ["Bonne Maman jam jars","Moët champagne foil caps","Poulain chocolate","Michelin road atlases"], 2,
    "Race director Félix Lévitan picked bold red dots on white wool both to honor Poulain candies and to pop vividly on new color TVs!"),

  g("SPORTS", 1, "super_bowl_gatorade_shower_parcells_1986",
    "Sideline Gatorade showers began in 1985 when Giants lineman Jim Burt dumped an icy cooler on which gruff New York head coach?",
    ["Coach Mike Ditka","Joe Gibbs","John Madden","Bill Parcells"], 3,
    "Parcells had badgered Burt all week ahead of facing Chicago—and once New York won, superstition demanded dumping coolers all the way to the Super Bowl!"),

  g("SPORTS", 1, "marta_brazil_five_world_cups_scored",
    "Retiring from Olympic play at Paris 2024, which Brazilian icon was first—man or woman—to score in five straight World Cups?",
    ["Marta Vieira","Formiga Silva","Cristiane Rozeira","Debinha Oliveira"], 0,
    "Six-time FIFA World Player of the Year Marta netted 17 World Cup goals across tournaments spanning 2003 to 2019!"),

  g("SPORTS", 1, "olympic_swimming_lanes_four_fastest_center",
    "Why do top qualifiers in an Olympic swimming final always race in center Lanes 4 and 5 instead of Lane 1 beside the wall?",
    ["Deeper center pool floor","Calmest water off walls","Closer starter speakers","Straighter backstroke flags"], 1,
    "Walls bounce choppy waves back toward outer lanes, so top qualifiers earn the calm middle lanes where wave-eating ropes shield them best!"),

  g("SPORTS", 1, "curling_hog_line_sweeping_friction_film",
    "Furious broom-sweeping ahead of an Olympic curling stone warms ice pebbles enough to carry a shot up to how much farther?",
    ["Six inches maximum","Two feet maximum","Ten to fifteen ft","Half a rink length"], 2,
    "Warming the ice by a couple of degrees cuts friction enough both to stretch distance by ~15 feet AND straighten the stone’s curl!"),

  g("SPORTS", 1, "cricket_ashes_tiny_terracotta_urn_bail",
    "England and Australia battle fiercely across five-day Test cricket series for \"The Ashes\"—a tiny 4.2-inch terracotta perfume urn reputedly holding the cremated ashes of what?",
    ["W.G. Grace’s beard trim","An 1882 scorebook page","Melbourne turf grass","Wooden cricket bail"], 3,
    "After Australia shocked England in London in 1882, a mock newspaper obituary joked English cricket had died and \"the body will be cremated\"!"),

  g("SPORTS", 2, "leon_marchand_paris_same_night_double_gold",
    "Roared on by home \"Allez!\" chants at Paris 2024, French swimmer Léon Marchand won two individual golds on the SAME night in what?",
    ["200m fly & breaststroke","100m & 400m backstroke","50m sprint & 1500m free","200m & 400m freestyle"], 0,
    "Coached by Michael Phelps’s mentor Bob Bowman, Marchand finished Paris with four individual Olympic records in front of his home crowd!"),

  g("SPORTS", 2, "mondo_duplantis_louisiana_sweden_pole_vault",
    "Raised in Lafayette, Louisiana, pole-vault king Armand \"Mondo\" Duplantis cleared a 6.25m world record at Paris 2024 for which nation?",
    ["Norway","Sweden","Belgium","Finland"], 1,
    "His mother Helena competed as a Swedish heptathlete—and Sweden allowed his parents to coach him directly on the national squad!"),

  g("SPORTS", 2, "simone_biles_yurchenko_double_pike_coach_mat",
    "Why did Simone Biles willingly accept an automatic 0.50-point neutral deduction on her Yurchenko double pike (\"Biles II\") vault in 2023–24—and STILL outscore the entire field?",
    ["Chalked past the runway line","Wore extra ankle tape","Coach stood on landing mat","Skipped a warmup touch"], 2,
    "Rotating two full pikes backward carries such sky-high height and momentum that coach Laurent Landi spotted nearby purely as a safety net!"),

  g("SPORTS", 2, "paris_2024_purple_track_crushed_bivalve_shells",
    "Stade de France’s lavender-purple sprint track at Paris 2024 blended vulcanized rubber with sustainable calcium carbonate from what?",
    ["Champagne chalk caves","Carrara marble dust","Recycled porcelain cups","Mussel & clam shells"], 3,
    "Farmed Mediterranean bivalve shells cut fossil-mineral mining while tiny air cells underneath acted like trampolines for sprinters!"),

  g("SPORTS", 2, "novak_djokovic_paris_2024_career_golden_slam",
    "Beating Carlos Alcaraz in two tiebreaks on Paris clay in August 2024, Novak Djokovic joined Graf, Agassi, Nadal, and Serena in completing what?",
    ["Career Golden Slam","Calendar Grand Slam Sweep","Triple Surface Crown","Unbroken Tiebreak Year"], 0,
    "Having won 24 Grand Slam majors, Olympic singles gold in his fifth Games was the sole missing jewel in Djokovic’s trophy case!"),

  g("SPORTS", 2, "gukesh_dommaraju_youngest_chess_champ_18",
    "Stunning Ding Liren in Game 14 in December 2024, Indian prodigy Gukesh Dommaraju became history’s youngest World Chess Champion at what age?",
    ["15.5 years old","18 years old","20 years old","21.5 years old"], 1,
    "Garry Kasparov and Magnus Carlsen had both seized the classical crown at 22—Gukesh beat their benchmark by nearly four full years!",
    {"numeric":{"target":18,"min":12,"max":35,"step":1,"unit":"years old"}}),

  g("SPORTS", 2, "max_verstappen_19_wins_2023_f1_dominance",
    "Driving Red Bull’s rocket-like RB19 across 22 Grands Prix in 2023, Dutch champion Max Verstappen shattered Formula 1’s single-season win-rate record (86.4%) by winning how many races?",
    ["15 race wins","17 wins","19 wins","21 wins"], 2,
    "Verstappen led over 1,000 laps that season—earning enough points by himself to win the Constructors’ Championship without a teammate!",
    {"numeric":{"target":19,"min":10,"max":24,"step":1,"unit":"race wins"}}),

  g("SPORTS", 2, "caitlin_clark_wnba_single_game_19_assists",
    "Before the 2024 Olympic break in July, Indiana Fever rookie Caitlin Clark dished out a WNBA all-time single-game record against Dallas—recording how many assists in 40 minutes?",
    ["15 game assists","17 assists","22 assists","19 assists"], 3,
    "Clark accounted for 66 points via baskets and dimes that afternoon—edging Courtney Vandersloot’s previous 18-assist mark!",
    {"numeric":{"target":19,"min":10,"max":30,"step":1,"unit":"assists"}}),

  g("SPORTS", 2, "eliud_kipchoge_vienna_sub_two_hour_pacers",
    "Why isn’t Kenyan legend Eliud Kipchoge’s mind-blowing 1:59:40 marathon run in Vienna (October 2019) listed as the official World Athletics marathon world record?",
    ["Rotating pacers & lasers","Downhill Alpine tailwind","Spring-loaded carbon heels","Shortened park turnarounds"], 0,
    "Forty-one fresh elite runners rotated in a wind-shielding V formation behind a green laser beam—proving human legs could break two hours!"),

  g("SPORTS", 2, "leicester_city_5000_to_1_premier_league_2016",
    "Promised free pizza by boss Claudio Ranieri for a clean sheet, which club defied 5,000-to-1 bookie odds to win the 2016 Premier League?",
    ["Aston Villa","Leicester City","Nottingham Forest","Crystal Palace"], 1,
    "Bookies initially priced spotting the Loch Ness Monster or Elvis alive as MORE likely than the Foxes lifting the Premier League trophy!"),

  g("SPORTS", 2, "gretzky_brothers_combined_nhl_points_brent_four",
    "Wayne and Brent Gretzky hold the NHL record for most combined career points by two brothers (2,861)—how many of those 2,861 points did little brother Brent chip in for Tampa Bay?",
    ["Zero NHL points","19 points","Just 4 points","42 points"], 2,
    "One goal and three assists across 13 NHL games let Brent and Wayne edge out the SIX Sutter brothers if counted purely in pairs!"),

  g("SPORTS", 2, "chicago_cubs_2016_rain_delay_heyward_speech",
    "Tied 6–6 in Game 7 of the 2016 World Series after a 108-year drought, what 17-minute pause let Jason Heyward rally the Cubs to win?",
    ["Blown stadium fuse","Jammed infield sprinklers","Swarming Lake Erie midges","10th-inning rain delay"], 3,
    "Refreshed after the tarp came off in Cleveland, Chicago plated two runs in the 10th to win its first World Series since 1908!"),

  g("SPORTS", 2, "philly_special_nick_foles_super_bowl_lii",
    "Asking coach Doug Pederson \"You want Philly Philly?\" on fourth down in Super Bowl LII, QB Nick Foles caught a touchdown pass from whom?",
    ["Tight end Trey Burton","Punter Donnie Jones","Center Jason Kelce","Left tackle Jason Peters"], 0,
    "Earlier in the exact same quarter, Patriots star Tom Brady had dropped a trick-play pass—making Foles’s \"Philly Special\" catch legendary!"),

  g("SPORTS", 2, "tiger_woods_1997_masters_twelve_stroke_record",
    "At age 21 in 1997, Tiger Woods overpowered Augusta National without a single middle-round three-putt to win the Masters by what record margin?",
    ["8.5 strokes","12 strokes","15 strokes","10 strokes"], 1,
    "Woods overpowered Augusta’s par-5s with wedges on second shots, prompting officials to \"Tiger-proof\" and lengthen the course!",
    {"numeric":{"target":12,"min":3,"max":25,"step":1,"unit":"strokes"}}),

  g("SPORTS", 2, "nikola_jokic_pick_41_lowest_drafted_nba_mvp",
    "Drafted deep in the second round in 2014, Denver center Nikola Jokić became the lowest-drafted NBA MVP in history at overall pick what?",
    ["Overall Pick 27","Pick 35","Pick 41","Pick 57"], 2,
    "Before Jokić, nobody drafted lower than #15 overall (Steve Nash and Giannis Antetokounmpo) had ever won the NBA MVP trophy!",
    {"numeric":{"target":41,"min":1,"max":60,"step":1,"unit":"draft pick"}}),

  g("SPORTS", 2, "victor_wembanyama_eight_foot_wingspan_spurs",
    "Leading the NBA in blocked shots as 2024 unanimous Rookie of the Year at 7-foot-4, Spurs star Victor Wembanyama spans what wingspan?",
    ["7 feet, 5 inches","7 feet, 8 inches","8 feet, 5 inches","Exactly 8 feet"], 3,
    "Nicknamed \"The Alien\" by LeBron James, Wembanyama casually blocks perimeter three-pointers without barely leaving his sneakers!"),

  g("SPORTS", 2, "raphael_nadal_fourteen_roland_garros_record",
    "Holding a jaw-dropping 112–4 career win-loss record on Parisian crushed red brick, Spanish lefty Rafael Nadal lifted Roland Garros’s Coupe des Mousquetaires an unmatched how many times?",
    ["14 times","10 clay slams","11 times","16 times"], 0,
    "Even wilder: right-handed in everyday life, Nadal writes and golfs righty—uncle Toni nudged him to hit forehands left-handed as a boy!"),

  g("SPORTS", 2, "ayrton_senna_monaco_1988_six_wins_king",
    "Famous for his bright-yellow Brazilian helmet, which three-time F1 champion still holds the record of six career wins at Monaco?",
    ["Nelson Piquet","Ayrton Senna","Emerson Fittipaldi","Rubens Barrichello"], 1,
    "At soggy Donington Park in 1993, Senna surged from 5th to 1st on the opening lap alone—widely hailed as F1’s greatest single lap!"),

  g("SPORTS", 2, "kerri_strug_one_foot_landing_atlanta_1996",
    "Sprinting down the 1996 Atlanta vault runway on two torn ankle ligaments, whose one-footed landing clinched U.S. gymnastics team gold?",
    ["Shannon Miller","Dominique Dawes","Kerri Strug","Amanda Borden"], 2,
    "Coach Béla Károlyi carried Strug in her warmups onto the medal stand as flashbulbs lit up the Georgia Dome!"),

  g("SPORTS", 2, "ali_bundini_brown_float_butterfly_sting_bee",
    "Before Cassius Clay shocked Sonny Liston in 1964, which cornerman coined \"Float like a butterfly, sting like a bee\"?",
    ["Trainer Angelo Dundee","Doc Ferdie Pacheco","Howard Cosell","Bundini Brown"], 3,
    "Former merchant mariner Bundini Brown wrote Ali’s locker-room battle rhymes—adding, \"Your hands can’t hit what your eyes can’t see!\""),

  g("SPORTS", 2, "patriots_28_3_comeback_first_overtime_li",
    "Trailing Atlanta 28–3 in Super Bowl LI, Julian Edelman kept New England’s comeback alive by snagging a bobbling ball inches off what?",
    ["Robert Alford’s shoe","Goalpost crossbar pad","Referee’s white cap","Sideline pylon camera"], 0,
    "James White plunged in during the NFL’s very first overtime Super Bowl to complete the largest comeback in championship history!"),

  g("SPORTS", 2, "faker_league_of_legends_five_worlds_crowns",
    "Packing London’s O2 Arena in 2024, South Korean esports icon \"Faker\" became the first five-time world champion of which PC game?",
    ["Counter-Strike 2","League of Legends","StarCraft Brood War","Valorant Champions"], 1,
    "Spanning eleven years with squad T1 (2013 to 2024), Faker’s longevity in lightning-reflex esports rivals Tom Brady’s in football!"),

  g("SPORTS", 2, "tour_de_france_lanterne_rouge_last_finisher",
    "Riders near the back of the Tour de France sometimes duel slyly to finish DEAD LAST overall and claim lucrative fees as the what?",
    ["Cuillère de Bois","Grande Roue Carrée","Lanterne Rouge","Balai d’Argent"], 2,
    "Borrowed from the red tail-lamp hung on the caboose of French trains to tell stationmasters every single car arrived safely!"),

  g("SPORTS", 2, "olympic_curling_mixed_doubles_chess_on_ice",
    "Why do NHL hockey Goalies wear wide pads while Olympic track cyclists NEVER touch brakes on indoor wooden velodrome banks?",
    ["Tires melt under brake pads","Fixed gears ban hand brakes","Spokes snap on steep wood","UCI penalizes skidding"], 1,
    "Track bikes run direct fixed gears with zero coasting or brake levers—stopping suddenly on a 42-degree bank would cause a pileup!"),

  g("SPORTS", 2, "babe_ruth_red_sox_scoreless_ws_pitching",
    "Long before hitting 60 homers for New York, 23-year-old Babe Ruth pitched 29⅔ consecutive scoreless World Series innings for whom?",
    ["Baltimore Orioles","Philadelphia Athletics","St. Louis Browns","Boston Red Sox"], 3,
    "Ruth’s World Series scoreless pitching streak stood for 43 years until Yankee lefty Whitey Ford finally broke it in 1961!"),

  g("SPORTS", 2, "snooker_147_maximum_break_fifteen_reds_blacks",
    "To compile snooker’s magical 147 \"maximum break\" without rival fouls, a cueist must sink all 15 red balls paired after EVERY single red with which highest-value 7-point color ball?",
    ["The black ball","Two-point yellow","The blue ball","The brown ball"], 0,
    "Fifteen red-plus-black pairs score 120 points, and clearing yellow, green, brown, blue, pink, and black adds the final 27!"),

  g("SPORTS", 2, "jamaican_bobsled_debut_calgary_1988_pushcarts",
    "Inspiring \"Cool Runnings,\" Jamaica’s 1988 Winter Olympic bobsledders recruited army sprinters after scouts watched races in wooden what?",
    ["Sugar-cane sleds","Street pushcarts","Coconut soapboxes","Bauxite mine trolleys"], 1,
    "When their borrowed sled crashed at 80 mph in Calgary, the four Jamaicans shouldered it and walked proudly across the finish line to cheers!"),

  g("SPORTS", 2, "steven_bradbury_salt_lake_2002_crash_gold",
    "Trailing dead last on the final turn of 1,000m short-track at Salt Lake 2002, how did Aussie Steven Bradbury win historic Winter gold?",
    ["Skated high up the boards","Launched a lunging split","All four leaders crashed","Rivals missed a lap bell"], 2,
    "Staying safely back after breaking his neck years earlier, \"doing a Bradbury\" entered Australian slang for winning when rivals implode!"),

  g("SPORTS", 2, "nfl_new_postseason_overtime_both_possess_2022",
    "After Josh Allen never touched the ball in Buffalo’s 13-second heartbreak against Kansas City in January 2022, how did NFL owners rewrite playoff overtime rules that spring?",
    ["Ten-minute full period","Two-point shootout rounds","No sudden-death field goals","Both teams get ball"], 3,
    "Two years later in Super Bowl LVIII, San Francisco took the OT kickoff FIRST under the new rule—and Mahomes knew he had four downs to answer!"),

  g("SPORTS", 2, "americas_cup_auld_mug_1851_oldest_trophy",
    "Predating the modern Olympics by 45 years and the Stanley Cup by 42, the silver ewer known as the \"Auld Mug\" (1851) is the oldest active trophy in international sport—contested in what?",
    ["Sailing’s America’s Cup","Rowing’s Henley Royal Cup","Polo’s Westchester Cup","Cricket’s County Shield"], 0,
    "Named not for the country directly, but for the schooner yacht \"America,\" which beat 14 British boats around the Isle of Wight before Queen Victoria!"),

  g("SPORTS", 2, "oxford_cambridge_boat_race_1912_both_boats_sank",
    "Rowed up London’s tidal River Thames nearly every spring since 1829, what chaotic twist forced officials to abandon and re-row the 1912 Oxford–Cambridge Boat Race two days later?",
    ["Tower Bridge stuck down","Both eights sank","Swans nested on the buoy","Dense coal fog hid Putney"], 1,
    "Gale-force gusts swamped Oxford first—and even after Oxford emptied its shell ashore to finish, icy waves sank Cambridge mid-river too!"),

  g("SPORTS", 2, "florence_griffith_joyner_1049_wind_gauge_1988",
    "Sewing her own \"one-legger\" tracksuits in 1988, which sprinter set women’s 100m (10.49s) and 200m (21.34s) marks unbroken since?",
    ["Merlene Ottey of Jamaica","Gail Devers","Flo-Jo Griffith-Joyner","Gwen Torrence"], 2,
    "Before dazzling Seoul, \"Flo-Jo\" worked as a bank teller and hairstylist while sewing her own aerodynamic track outfits!"),

  g("SPORTS", 2, "ancient_pankration_biting_and_eye_gouging_banned",
    "At the 648 BCE Ancient Olympics, no-holds-barred \"Pankration\" mixed boxing and wrestling while banning ONLY which two fouls?",
    ["Hair-pulling & shin kicks","Chokeholds & finger-locks","Throw-outs & headbutts","Biting & eye-gouging"], 3,
    "Champion Arrhichion famously won his third Olympic wreath posthumously after snapping his rival’s ankle the instant before passing out!"),

  g("SPORTS", 2, "coco_gauff_teen_us_open_champion_2023",
    "Rallying inside Arthur Ashe Stadium in September 2023, which 19-year-old became the first U.S. teen since Serena (1999) to win the US Open?",
    ["Coco Gauff","Jessica Pegula","Madison Keys","Emma Navarro"], 0,
    "Ten months later, fellow players elected Gauff alongside LeBron James as Team USA’s Opening Ceremony flag bearer on the Seine!"),

  g("SPORTS", 2, "mlb_unassisted_triple_play_rarer_than_perfect",
    "Even rarer than an MLB Perfect Game (just 15 times since 1900!) is when ONE fielder records all three outs alone—called what?",
    ["Nine-pitch immaculate frame","Unassisted triple play","Four-strikeout inning","Hidden-ball trick cycle"], 1,
    "Typically a second baseman or shortstop snares a line drive, steps on second base, and tags the stunned runner arriving from first!"),

  g("SPORTS", 2, "hockey_stanley_cup_phil_pritchard_white_gloves",
    "After champions dunked the Stanley Cup in pools and canals, Hall of Fame keeper Phil Pritchard escorts it 100+ days a year wearing what?",
    ["A handcuffed steel case","Kevlar shin guards","White cotton gloves","A GPS-tracked kilt"], 2,
    "Affectionately dubbed \"Keeper of the Cup,\" Pritchard chaperones the 34.5-pound silver trophy from backyard BBQs to mountaintops!"),

  g("SPORTS", 2, "marathon_des_sables_carry_own_food_sahara",
    "Runners tackling Morocco’s 156-mile Sahara \"Marathon des Sables\" get tent shade and rationed water—while carrying all of their own what?",
    ["Solar water desalters","Folding camp cots","Camel-bell flares","Food & sleeping gear"], 3,
    "In 1994, Italian runner Mauro Prosperi got blown off course by a sandstorm and survived nine days lost in Algeria before finishing later years!"),

  g("SPORTS", 2, "chess_touch_move_rule_j_adoube_adjust",
    "Need to straighten a crooked chess piece without triggering the strict \"touch-move\" rule? Announce \"I adjust\"—or French phrase what?",
    ["J’adoube","En garde","Touché","Zugzwang"], 0,
    "Wait until you touch the piece FIRST without announcing \"J’adoube\" beforehand, and FIDE arbiters force you to move it legally!"),

  g("SPORTS", 2, "masters_pimento_cheese_dollar_fifty_augusta",
    "While secondary Masters passes cost thousands, Augusta National famously sells its iconic pimento cheese sandwich for what throwback price?",
    ["$0.75 each","$1.50","$2.75","$3.50"], 1,
    "Even when Augusta reluctantly switched pimento-cheese suppliers years ago, staff reverse-engineered the secret tangy recipe so regulars wouldn’t riot!"),

  g("SPORTS", 2, "nba_three_point_corner_shorter_22_feet",
    "Why do analytics coaches obsess over \"corner threes\" in the NBA? While the arc sits 23 feet, 9 inches out at the top of the key, court width trims the baseline corners down to how far?",
    ["20 feet, 6 inches","21 feet even","22 feet even","22 feet, 9 inches"], 2,
    "Widening every historic arena floor would have wiped out lucrative courtside seats—giving sharpshooters a permanent 21-inch discount in the corners!"),

  g("SPORTS", 2, "soccer_penalty_spot_twelve_yards_1891_irish",
    "Victorian aristocrats initially mocked 1890s proposals for soccer’s 12-yard penalty kick because gentlemen supposedly would NEVER do what?",
    ["Fake a torn hamstring cramp","Argue with linesmen","Waste time at corners","Foul someone on purpose"], 3,
    "When a defender punched a sure goal off the line in an 1891 FA Cup tie and yielded only a crowded 2-inch free kick, McCrum’s 12-yard spot won overnight!"),

  g("SPORTS", 2, "womens_rugby_ilona_maher_olympic_bronze_2024",
    "Stiff-arming tacklers for Team USA’s first Olympic rugby sevens medal at Paris 2024, who became the world’s most-followed rugby star?",
    ["Ilona Maher","Alex Sedrick","Alev Kelter","Kristi Kirshe"], 0,
    "Blending body-positive humor from the Olympic Village with ferocious fends, Maher packed record crowds into women’s rugby stadiums on two continents!"),

  g("SPORTS", 2, "luka_doncic_73_points_atlanta_2024_efficiency",
    "Dropping 73 points on 25-of-33 shooting in January 2024, Mavericks guard Luka Dončić tied for what rank among NBA single-game highs?",
    ["Second all-time high","Fourth all-time","Sixth all-time","Eighth all-time"], 1,
    "Only Wilt’s 100, Kobe Bryant’s 81, and Wilt’s 78 sit higher—and just four nights earlier, Joel Embiid had dropped 70!"),

  g("SPORTS", 3, "baseball_fourth_out_appeal_play_rulebook",
    "Yes, a half-inning can legally contain a \"Fourth Out\" in Major League Baseball! Why would a defense record a fourth out AFTER already making the third out?",
    ["Erase a run on appeal","Save pitch-count limits","Break a double switch","Reset batting order"], 0,
    "If a runner scored from third before a trailing third out, tagging third base to appeal that he left early replaces out #3 and wipes the run off!"),

  g("SPORTS", 3, "nfl_fair_catch_kick_free_uncontested_field_goal",
    "Cameron Dicker hit the NFL’s first \"fair-catch kick\" since 1976 in December 2024—letting a team kick a field goal with ZERO what?",
    ["Goalpost crossbars","Defensive pass rush","Play-clock countdown","Tee height limits"], 1,
    "Right after fair-catching a punt, obscure NFL Rule 10-2-4 lets you kick off a tee with defenders standing ten yards away like a kickoff!"),

  g("SPORTS", 3, "disco_demolition_night_comiskey_forfeit_1979",
    "Which bizarre July 1979 ballpark promotion between twinbill games at Chicago’s Comiskey Park blew a crate of vinyl records into a crater—forcing the White Sox to forfeit Game 2?",
    ["Punk Rock Bat Bonfire Night","Polka Keg Bonfire","Disco Demolition Night","Eight-Track Drop"], 2,
    "Shock-jock Steve Dahl drew 50,000 rowdy rock fans who stormed the scorched turf—turning MLB’s wildest promo fiasco into music-history lore!"),

  g("SPORTS", 3, "ten_cent_beer_night_cleveland_1974_bases_stolen",
    "Cleveland’s chaotic June 1974 \"Ten Cent Beer Night\" ended in a 9–9 forfeit after rowdy fans rushed the outfield and stole Jeff Burroughs’s what?",
    ["Spiked left cleat","Hickory bat","Gold neck chain","Baseball cap"], 3,
    "When Billy Martin charged out with bats to rescue his surrounded Ranger, umpires forfeited the riotous game!"),

  g("SPORTS", 3, "pine_tar_incident_george_brett_1983_replay",
    "After umpires voided George Brett’s 1983 homer for pine tar past 18 inches, Kansas City won its protest—resuming 25 days later from where?",
    ["Two outs, top of 9th","Bottom of 1st inning","Bases-loaded 10th inning","Home-run tiebreaker"], 0,
    "AL boss Lee MacPhail upheld the spirit of the rule—counting Brett’s homer and finishing the last four outs in August!"),

  g("SPORTS", 3, "dock_ellis_lsd_no_hitter_pirates_1970",
    "Losing track of days in LA in June 1970, Pirates pitcher Dock Ellis walked eight yet threw a San Diego no-hitter on what psychedelic?",
    ["Mescaline","Acid (LSD)","Psilocybin","Laughing gas"], 1,
    "Catcher Jerry May taped reflective strips onto his fingers just so wild-throwing Ellis could spot the mitt!"),

  g("SPORTS", 3, "cal_stanford_band_is_on_the_field_1982",
    "Throwing five lateral passes on the final play of 1982’s \"Big Game,\" Cal’s Kevin Moen bowled over a trombonist from whose premature band?",
    ["USC Trojan Marching Band","UCLA Bruin Band","Stanford’s band","Oregon’s band"], 2,
    "Thinking John Elway had sealed victory four seconds earlier, Stanford’s band flooded the field—immortalized by \"THE BAND IS ON THE FIELD!\""),

  g("SPORTS", 3, "jim_abbott_one_handed_yankee_no_hitter_1993",
    "Born without a right hand—flipping his mitt onto his wrist after every pitch—who threw a 1993 Yankee Stadium no-hitter vs. Cleveland?",
    ["David Cone","David Wells","Dwight Gooden","Jim Abbott"], 3,
    "Five years earlier, Abbott had also pitched the gold-medal clincher for Team USA at Seoul—and even collected two career MLB RBIs at the plate!"),

  g("SPORTS", 3, "cliff_young_gumboots_shuffle_ultramarathon_1983",
    "Arriving in rubber work boots at 1983’s 544-mile Sydney-to-Melbourne ultramarathon, 61-year-old farmer Cliff Young won by 10 hours by skipping what?",
    ["Overnight sleep stops","Sneaker swaps at 50 km","Salted energy packets","Drafting behind pace vans"], 0,
    "Used to herding sheep for days awake before storms, Young shuffled five straight nights—then gifted his prize to rivals!"),

  g("SPORTS", 3, "chessboxing_alternating_rounds_checkmate_ko",
    "Alternating three-minute rounds of blitz chess and boxing in Berlin and London, \"Chessboxing\" bouts end either by knockout OR what?",
    ["Three illegal castles","Checkmate or clock flag","Dropping a sweaty pawn","Towel thrown onto chessboard"], 1,
    "Controlling a pounding 170-bpm heart rate to calculate knight forks sixty seconds after dodging jabs makes it sport’s ultimate brain-brawn test!"),

  g("SPORTS", 3, "kathrine_switzer_bib_261_boston_marathon_1967",
    "Entering as \"K.V. Switzer\" in 1967, Kathrine Switzer finished Boston’s Marathon in bib #261 despite official Jock Semple trying to do what?",
    ["Park a press bus across","Turn fire hoses on runners","Rip her bib numbers off","Move finish tape back"], 2,
    "Switzer’s boyfriend—a 235-pound All-American hammer thrower running beside her—body-blocked Semple onto the pavement in iconic wire photos!"),

  g("SPORTS", 3, "dick_fosbury_mismatched_shoes_mexico_1968",
    "Look closely at color photographs of Dick Fosbury revolutionizing the high jump in 1968 Mexico City: why was he wearing one blue right shoe and one white left shoe?",
    ["Superstition from his mom","Sponsor bidding war stunt","Luggage lost in customs","Springier right takeoff"], 3,
    "Fosbury explained zero fashion statement—the blue Adidas Gazelle simply felt springier on his right takeoff foot than a matching pair!"),

  g("SPORTS", 3, "basketball_three_second_key_widened_george_mikan",
    "In 1951 the NBA doubled the painted free-throw lane from 6 feet to 12 feet (\"The Mikan Rule\") to curb hook shots by which Lakers star?",
    ["George Mikan","Bob Kurland","Bill Russell","Dolph Schayes"], 0,
    "Madison Square Garden marquees once billed games simply as \"TONIGHT: GEO. MIKAN VS. KNICKS\"—until the wider key curbed his hook shots!"),

  g("SPORTS", 3, "tennis_tiebreak_invented_jimmy_van_alen_1970",
    "Tired of marathon sets dragging past dusk, Newport’s Jimmy Van Alen debuted a sudden-death shootout at the 1970 US Open—inventing what?",
    ["Let-cord replay","Set tiebreaker","Second-serve fault","Hawk-Eye challenge"], 1,
    "Traditionalists wore black armbands protesting Van Alen’s red flags—before TV and tired ankles embraced 7-point tiebreaks!"),

  g("SPORTS", 3, "olympic_artistic_solo_synchronized_swimming_1984",
    "From 1984 to 1992, the Olympics awarded medals in SOLO \"synchronized swimming\"—officials argued the lone swimmer synchronized with what?",
    ["Underwater strobe lights","Poolside judge paddles","The accompanying music","Video replay silhouettes"], 2,
    "World Aquatics eventually rebranded the entire discipline \"Artistic Swimming\" in 2017 to spare solo routines endless late-night comedy jokes!"),

  g("SPORTS", 3, "milo_of_croton_carried_bull_ancient_olympia",
    "Ancient Olympic wrestling legend Milo of Croton supposedly built legendary strength by walking daily carrying what growing animal?",
    ["A wooly Merino ram","A stubborn pack mule","A giant sea turtle","A calf grown to bull"], 3,
    "Lifting the calf every morning from birth for four years meant as the bull gained pounds, Milo’s muscles grew right alongside it!"),
];
