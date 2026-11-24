import{F as Ee,n as re,p as Ce,g as $e}from"./forge-Q1D2kFDA.js";const Ae={GOLD_HISTORY:{id:"GOLD_HISTORY",shortLabel:"History",fullLabel:"History & World Affairs",accentHex:"#f5c451",surfaceHex:"#3a2b10",domainIds:[0,8]},SAPPHIRE_GEO:{id:"SAPPHIRE_GEO",shortLabel:"Geography",fullLabel:"Geography & Wonders",accentHex:"#46a8ff",surfaceHex:"#0f2947",domainIds:[2]},EMERALD_SCIENCE:{id:"EMERALD_SCIENCE",shortLabel:"Science",fullLabel:"Science, Tech & Nature",accentHex:"#34d993",surfaceHex:"#0e3327",domainIds:[1,6,7]},MAGENTA_POP:{id:"MAGENTA_POP",shortLabel:"Entertainment",fullLabel:"Film, Music & Pop Culture",accentHex:"#f26498",surfaceHex:"#3b1528",domainIds:[4]},ORANGE_SPORTS:{id:"ORANGE_SPORTS",shortLabel:"Sports & Logic",fullLabel:"Sports, Games & Logic",accentHex:"#ff9347",surfaceHex:"#3d2010",domainIds:[5,11]},VIOLET_ARTS:{id:"VIOLET_ARTS",shortLabel:"Arts & Culture",fullLabel:"Arts, Literature & Culinary",accentHex:"#b47cff",surfaceHex:"#281845",domainIds:[3,9,10]}};function Te(t){switch(t){case 0:case 8:return"GOLD_HISTORY";case 2:return"SAPPHIRE_GEO";case 1:case 6:case 7:return"EMERALD_SCIENCE";case 4:return"MAGENTA_POP";case 5:case 11:return"ORANGE_SPORTS";case 3:case 9:case 10:default:return"VIOLET_ARTS"}}const Le={0:[{id:"hist_military",name:"Military & Conflict History",share:.3,topics:[{id:"hist_ww2",name:"World War II",share:.34,kw:["world war ii","wwii","1939","1945","normandy","axis","allied"]},{id:"hist_ancient_rome",name:"Ancient Rome & Classical Warfare",share:.24,kw:["roman","caesar","legion","augustus","empire"]},{id:"hist_cold_war",name:"Cold War & Space Race Geopolitics",share:.22,kw:["cold war","soviet","berlin","nato","warsaw"]},{id:"hist_napoleonic_ww1",name:"Napoleonic Era & World War I",share:.2,kw:["napoleon","waterloo","1914","1918","trench"]}]},{id:"hist_empires",name:"Ancient Civilizations & Empires",share:.26,topics:[{id:"hist_mesopotamia_egypt",name:"Ancient Egypt & Mesopotamia",share:.36,kw:["pharaoh","nile","babylon","sumer","dynasty"]},{id:"hist_asian_dynasties",name:"Imperial China, Japan & Silk Road",share:.34,kw:["dynasty","tang","ming","shogun","silk road"]},{id:"hist_precolumbian",name:"Maya, Inca, Aztec & African Kingdoms",share:.3,kw:["maya","inca","aztec","mali","songhai"]}]},{id:"hist_modern",name:"Revolutions, Treaties & Modern Era",share:.24,topics:[{id:"hist_american_french",name:"American & French Revolutions",share:.36,kw:["revolution","1776","1789","constitution"]},{id:"hist_industrial",name:"Industrial Age & Decolonization",share:.32,kw:["industrial","independence","victorian"]},{id:"hist_treaties_leaders",name:"World Leaders, Summits & Treaties",share:.32,kw:["treaty","prime minister","president","chancellor"]}]},{id:"hist_medieval",name:"Medieval & Renaissance Worlds",share:.2,topics:[{id:"hist_byzantine_islamic",name:"Byzantium & Islamic Golden Age",share:.35,kw:["byzantine","constantinople","caliphate","baghdad"]},{id:"hist_feudal_europe",name:"Medieval Monarchs & Magna Carta",share:.33,kw:["medieval","king","crusade","magna carta"]},{id:"hist_exploration",name:"Age of Sail & Global Exploration",share:.32,kw:["expedition","voyage","navigator","circumnavigation"]}]}],1:[{id:"sci_space",name:"Astronomy & Space",share:.28,topics:[{id:"sci_exoplanets_spaceflight",name:"Exoplanets, Missions & Spaceflight",share:.38,kw:["apollo","nasa","orbit","spacecraft","exoplanet","mars"]},{id:"sci_solar_system",name:"Planets, Moons & Solar System",share:.32,kw:["jupiter","saturn","moon","asteroid","planet"]},{id:"sci_cosmology",name:"Stars, Galaxies & Cosmology",share:.3,kw:["galaxy","supernova","black hole","nebula","quasar"]}]},{id:"sci_physics",name:"Physics & Quantum Mechanics",share:.26,topics:[{id:"sci_classical_physics",name:"Mechanics, Optics & Electromagnetism",share:.36,kw:["velocity","force","wavelength","magnetic","newton"]},{id:"sci_quantum_relativity",name:"Quantum Physics, Particles & Relativity",share:.34,kw:["quantum","boson","relativity","photon","quark"]},{id:"sci_thermodynamics_units",name:"SI Units, Constants & Thermodynamics",share:.3,kw:["kelvin","joule","entropy","watt","pascal"]}]},{id:"sci_chemistry",name:"Chemistry & Materials",share:.24,topics:[{id:"sci_periodic_elements",name:"Periodic Table & Chemical Elements",share:.42,kw:["atomic number","element","symbol","isotope","noble gas"]},{id:"sci_compounds_reactions",name:"Compounds, Acids & Organic Chemistry",share:.32,kw:["molecule","acid","polymer","catalyst","bond"]},{id:"sci_nobel_chem",name:"Nobel Discoveries & Laboratory Milestones",share:.26,kw:["nobel","synthesis","radioactivity"]}]},{id:"sci_human_bio",name:"Human Biology, Genetics & Medicine",share:.22,topics:[{id:"sci_anatomy",name:"Human Anatomy, Brain & Organ Systems",share:.38,kw:["artery","neuron","bone","organ","cortex","hormone"]},{id:"sci_genetics_cell",name:"DNA, Cell Biology & Biochemistry",share:.32,kw:["dna","rna","chromosome","mitochondria","enzyme"]},{id:"sci_medicine",name:"Vaccines, Pharmacology & Medical Pioneers",share:.3,kw:["vaccine","antibiotic","syndrome","clinical"]}]}],2:[{id:"geo_cities_nations",name:"World Capitals, Cities & Nations",share:.34,topics:[{id:"geo_capitals",name:"National Capitals & Sovereign States",share:.38,kw:["capital","republic","kingdom","currency"]},{id:"geo_megacities",name:"Global Megacities, Ports & Urban Hubs",share:.34,kw:["metropolitan","port","population","city"]},{id:"geo_borders_flags",name:"Borders, Enclaves, Time Zones & Flags",share:.28,kw:["border","landlocked","flag","strait","island"]}]},{id:"geo_physical",name:"Mountains, Rivers & Physical Earth",share:.28,topics:[{id:"geo_mountains_volcanoes",name:"Mountain Ranges, Peaks & Volcanoes",share:.36,kw:["summit","elevation","peak","volcano","himalaya","andes"]},{id:"geo_rivers_lakes",name:"Great Rivers, Lakes, Seas & Straits",share:.36,kw:["river","tributary","lake","basin","delta"]},{id:"geo_deserts_tectonics",name:"Deserts, Glaciers & Tectonic Plates",share:.28,kw:["desert","glacier","trench","archipelago"]}]},{id:"geo_landmarks_aviation",name:"Landmarks, UNESCO & Aviation Hubs",share:.2,topics:[{id:"geo_unesco",name:"UNESCO World Heritage & Wonders",share:.44,kw:["unesco","heritage","temple","monument"]},{id:"geo_airports_transit",name:"International Airports, Canals & Bridges",share:.3,kw:["iata","airport","canal","bridge","rail"]},{id:"geo_regions_provinces",name:"States, Provinces & Subnational Regions",share:.26,kw:["province","prefecture","canton","state"]}]},{id:"geo_cartography",name:"Latitudes, Oceans & Polar Exploration",share:.18,topics:[{id:"geo_oceans_currents",name:"Oceans, Currents & Maritime Geography",share:.52,kw:["ocean","current","pacific","atlantic","reef"]},{id:"geo_polar_equator",name:"Equatorial, Arctic & Antarctic Geography",share:.48,kw:["arctic","antarctic","equator","tropic","latitude"]}]}],3:[{id:"art_painting_sculpture",name:"Fine Art, Painting & Sculpture",share:.32,topics:[{id:"art_renaissance_baroque",name:"Renaissance, Baroque & Old Masters",share:.36,kw:["rembrandt","caravaggio","leonardo","fresco","canvas"]},{id:"art_modern_impressionism",name:"Impressionism, Surrealism & Modern Art",share:.36,kw:["monet","picasso","dali","museum","gallery"]},{id:"art_sculpture_museums",name:"World Museums & Iconic Sculptures",share:.28,kw:["louvre","prado","marble","bronze","sculpture"]}]},{id:"art_architecture",name:"Architecture & Urban Design",share:.26,topics:[{id:"art_sacred_classical",name:"Cathedrals, Mosques, Palaces & Classical",share:.4,kw:["cathedral","dome","gothic","arch","palace"]},{id:"art_modernist_skyscrapers",name:"Modernist Architects & Supertall Towers",share:.35,kw:["architect","bauhaus","pritzker","skyscraper","tower"]},{id:"art_industrial_design",name:"Industrial, Graphic & Horological Design",share:.25,kw:["typography","chronograph","design","movement"]}]},{id:"art_classical_stage",name:"Classical Music, Opera & Ballet",share:.24,topics:[{id:"art_symphonies",name:"Symphonies, Concertos & Composers",share:.44,kw:["symphony","concerto","beethoven","mozart","bach"]},{id:"art_opera_ballet",name:"Grand Opera, Librettos & Ballet",share:.32,kw:["opera","puccini","verdi","soprano","ballet"]},{id:"art_instruments",name:"Musical Theory & World Instruments",share:.24,kw:["key","octave","violin","percussion"]}]},{id:"art_photography_fashion",name:"Photography, Couture & Decorative Arts",share:.18,topics:[{id:"art_photography",name:"Iconic Photography & Visual Media",share:.5,kw:["photograph","camera","exhibition"]},{id:"art_fashion_ceramics",name:"Haute Couture, Textiles & Ceramics",share:.5,kw:["atelier","porcelain","couture","tapestry"]}]}],4:[{id:"pop_cinema",name:"Cinema & World Film",share:.32,topics:[{id:"pop_directors_oscars",name:"Directors, Best Picture & Oscars",share:.38,kw:["directed","academy award","oscar","palme","film"]},{id:"pop_actors_roles",name:"Screen Legends, Performances & Roles",share:.34,kw:["starred","actor","actress","protagonist"]},{id:"pop_world_scifi_animation",name:"World Cinema, Sci-Fi & Animation",share:.28,kw:["animated","studio","trilogy","screenplay"]}]},{id:"pop_music",name:"Popular Music, Albums & Songcraft",share:.3,topics:[{id:"pop_rock_albums",name:"Classic Rock, Indie & Landmark Albums",share:.36,kw:["album","band","guitarist","released"]},{id:"pop_hits_hiphop_rnb",name:"Pop, Hip-Hop, R&B & Global Charts",share:.36,kw:["grammy","single","billboard","vocalist"]},{id:"pop_jazz_blues_electronic",name:"Jazz, Blues, Soul & Electronic Music",share:.28,kw:["jazz","saxophone","synthesizer","motown"]}]},{id:"pop_television",name:"Prestige Television & Streaming",share:.22,topics:[{id:"pop_drama_series",name:"Acclaimed Drama, Thriller & Sci-Fi Series",share:.54,kw:["series","emmy","season","showrunner"]},{id:"pop_comedy_animation_tv",name:"Sitcoms, Late Night & Animated TV",share:.46,kw:["sitcom","episode","creator","network"]}]},{id:"pop_theatre_comics",name:"Broadway, Graphic Novels & Cultural Icons",share:.16,topics:[{id:"pop_broadway",name:"Broadway Musicals & Tony Winners",share:.5,kw:["musical","broadway","tony"]},{id:"pop_comics_manga",name:"Comics, Manga & Graphic Storytelling",share:.5,kw:["manga","comic","creator","serialized"]}]}],5:[{id:"sports",name:"Sports",share:.74,topics:[{id:"sports_baseball",name:"Baseball",share:.14,kw:["baseball","mlb","world series","pitcher","home run","inning","ballpark","yankees","dodgers","red sox"]},{id:"sports_basketball",name:"Basketball",share:.13,kw:["basketball","nba","wnba","ncaa","rebound","three-point","finals"]},{id:"sports_american_football",name:"American Football",share:.13,kw:["nfl","super bowl","quarterback","touchdown","heisman","gridiron"]},{id:"sports_soccer",name:"Soccer / World Football",share:.16,kw:["fifa","world cup","premier league","champions league","striker","club","football"]},{id:"sports_ice_hockey",name:"Ice Hockey",share:.09,kw:["nhl","stanley cup","hockey","goalie","puck"]},{id:"sports_tennis",name:"Tennis",share:.08,kw:["wimbledon","grand slam","roland garros","us open","australian open","tennis"]},{id:"sports_golf",name:"Golf",share:.06,kw:["masters","pga","open championship","ryder cup","golf"]},{id:"sports_combat",name:"Boxing & Combat Sports",share:.06,kw:["heavyweight","boxing","knockout","ufc","judo","fencing"]},{id:"sports_olympics",name:"Track, Swimming & Olympics",share:.07,kw:["olympic","gold medal","marathon","decathlon","freestyle","world record"]},{id:"sports_motorsport",name:"Motorsport & Formula 1",share:.04,kw:["formula 1","grand prix","le mans","indy","constructor"]},{id:"sports_cricket_rugby",name:"Cricket & Rugby",share:.04,kw:["cricket","test match","wicket","ashes","rugby"]}]},{id:"games_esports",name:"Games & Esports",share:.26,topics:[{id:"games_chess_board",name:"Chess & Strategy Board Games",share:.36,kw:["chess","grandmaster","opening","checkmate","go","backgammon"]},{id:"games_video_consoles",name:"Video Games, Studios & Consoles",share:.42,kw:["console","nintendo","playstation","arcade","rpg","esports","developer"]},{id:"games_cards_tabletop",name:"Card, Puzzle & Tabletop Games",share:.22,kw:["bridge","poker","tarot","crossword","rubik","tabletop"]}]}],6:[{id:"tech_computing",name:"Computer Science, AI & Software",share:.34,topics:[{id:"tech_algorithms_os",name:"Algorithms, Languages & Operating Systems",share:.38,kw:["algorithm","unix","compiler","programming","kernel"]},{id:"tech_ai_crypto",name:"AI, Cryptography & Cybersecurity",share:.34,kw:["cipher","encryption","neural","turing","public-key"]},{id:"tech_internet_web",name:"Internet Protocols, Networking & Web",share:.28,kw:["tcp","http","rfc","packet","domain","browser"]}]},{id:"tech_hardware_chips",name:"Semiconductors, Electronics & Hardware",share:.24,topics:[{id:"tech_semiconductors",name:"Transistors, Microprocessors & Lithography",share:.54,kw:["transistor","silicon","microprocessor","nm","integrated circuit"]},{id:"tech_robotics_sensors",name:"Robotics, Lasers & Photonics",share:.46,kw:["laser","actuator","lidar","fiber optic","sensor"]}]},{id:"tech_aerospace_civil",name:"Aerospace, Energy & Civil Engineering",share:.24,topics:[{id:"tech_aviation_rockets",name:"Supersonic Aviation & Rocket Propulsion",share:.4,kw:["jet","turbine","propulsion","mach","airframe"]},{id:"tech_energy_grids",name:"Nuclear, Solar, Batteries & Megaprojects",share:.34,kw:["reactor","grid","lithium","hydroelectric","dam"]},{id:"tech_inventions",name:"Patents, Inventors & Industrial Breakthroughs",share:.26,kw:["patented","invented","telegraph","engine"]}]},{id:"tech_telecom",name:"Telecommunications & Standards",share:.18,topics:[{id:"tech_radio_satellites",name:"Radio, Satellites & GPS Constellations",share:.55,kw:["satellite","frequency","gps","orbital","radar"]},{id:"tech_storage_media",name:"Data Storage, Audio & Display Tech",share:.45,kw:["oled","magnetic","codec","bit"]}]}],7:[{id:"nat_zoology",name:"Zoology & Animal Kingdom",share:.34,topics:[{id:"nat_mammals_birds",name:"Mammals, Birds & Migration",share:.4,kw:["mammal","raptor","marsupial","primate","species"]},{id:"nat_marine_life",name:"Marine Biology, Cetaceans & Coral Reefs",share:.32,kw:["whale","shark","cephalopod","deep-sea","reef"]},{id:"nat_insects_herps",name:"Reptiles, Amphibians & Entomology",share:.28,kw:["venom","beetle","amphibian","reptile","metamorphosis"]}]},{id:"nat_botany_fungi",name:"Botany, Forestry & Mycology",share:.24,topics:[{id:"nat_trees_crops",name:"Trees, Flowering Plants & Ethnobotany",share:.56,kw:["conifer","botanical","orchids","pollen","canopy"]},{id:"nat_fungi_microbes",name:"Fungi, Lichens & Extremophiles",share:.44,kw:["mycelium","fungus","spore","lichen"]}]},{id:"nat_earth_climate",name:"Geology, Paleontology & Meteorology",share:.26,topics:[{id:"nat_minerals_gems",name:"Minerals, Gemstones & Rock Cycle",share:.36,kw:["mohs","mineral","igneous","quartz","corundum"]},{id:"nat_paleontology",name:"Dinosaurs, Fossils & Mass Extinctions",share:.34,kw:["cretaceous","jurassic","cambrian","fossil","theropod"]},{id:"nat_weather_atmosphere",name:"Atmosphere, Cyclones & Climate Systems",share:.3,kw:["stratosphere","monsoon","jet stream","barometric"]}]},{id:"nat_ecology",name:"Biomes, Conservation & National Parks",share:.16,topics:[{id:"nat_biomes_parks",name:"Rainforests, Tundra & Biosphere Reserves",share:.55,kw:["biome","savanna","national park","endemic"]},{id:"nat_evolution",name:"Evolutionary Biology & Naturalists",share:.45,kw:["darwin","adaptation","symbiosis","taxonomy"]}]}],8:[{id:"aff_geopolitics",name:"Diplomacy, International Law & Treaties",share:.3,topics:[{id:"aff_un_orgs",name:"UN, Courts, Alliances & Global Institutions",share:.4,kw:["united nations","hague","security council","geneva","charter"]},{id:"aff_constitutions",name:"Parliaments, Electoral Systems & Law",share:.34,kw:["bicameral","supreme court","constitution","referendum"]},{id:"aff_diplomatic_history",name:"Accords, Embassies & Intelligence",share:.26,kw:["accord","protocol","diplomatic","sanctions"]}]},{id:"aff_economics",name:"Macroeconomics, Central Banks & Trade",share:.3,topics:[{id:"aff_currencies_banks",name:"Currencies, Central Banks & Monetary Policy",share:.38,kw:["central bank","currency","inflation","reserve","bond"]},{id:"aff_economic_theory",name:"Economic Thinkers, Nobelists & Game Theory",share:.32,kw:["keynes","pareto","nash","elasticity","gdp"]},{id:"aff_global_trade",name:"Commodities, Shipping Lanes & Markets",share:.3,kw:["exchange","tariff","export","maritime","index"]}]},{id:"aff_philosophy_civic",name:"Political Philosophy, Ethics & Sociology",share:.22,topics:[{id:"aff_political_thought",name:"Social Contract, Jurisprudence & Ethics",share:.55,kw:["rousseau","locke","utilitarian","ethics","sovereignty"]},{id:"aff_demographics",name:"Global Demographics, Languages & Scripts",share:.45,kw:["official language","alphabet","script","census"]}]},{id:"aff_organizations",name:"World Prizes, Summits & Civic Milestones",share:.18,topics:[{id:"aff_nobel_peace",name:"Nobel Peace Laureates & Human Rights",share:.55,kw:["nobel peace","humanitarian","laureate"]},{id:"aff_global_indices",name:"Development, Energy Transition & Cities",share:.45,kw:["summit","convention","commission"]}]}],9:[{id:"food_world_cuisines",name:"Global Cuisines & National Dishes",share:.34,topics:[{id:"food_asian_cuisines",name:"East, South & Southeast Asian Gastronomy",share:.36,kw:["ramen","fermented","curry","wok","umami","sushi"]},{id:"food_med_european",name:"Mediterranean, French & European Classics",share:.36,kw:["sauce","pasta","bordeaux","pastry","braise"]},{id:"food_americas_levant",name:"Americas, Levantine & African Culinary Arts",share:.28,kw:["chili","masa","tagine","mezze","cacao"]}]},{id:"food_ingredients_science",name:"Spices, Pantry, Cheese & Food Science",share:.28,topics:[{id:"food_spices_herbs",name:"Botanical Spices, Chili Peppers & Herbs",share:.38,kw:["saffron","cardamom","scoville","bark","spice"]},{id:"food_cheese_fermentation",name:"Artisanal Cheeses, Bread & Fermentation",share:.34,kw:["pdo","milk","sourdough","cheese","aging"]},{id:"food_culinary_technique",name:"Knife Cuts, Mother Sauces & Maillard Chemistry",share:.28,kw:["emulsion","roux","julienne","maillard","confit"]}]},{id:"food_beverages",name:"Coffee, Tea, Viticulture & Spirits",share:.22,topics:[{id:"food_coffee_tea",name:"Specialty Coffee, Tea Estates & Cacao",share:.48,kw:["arabica","oolong","matcha","espresso","roast"]},{id:"food_wine_spirits",name:"Wine Regions, Varietals & Distillation",share:.52,kw:["vineyard","appellation","grape","cask","botanical"]}]},{id:"food_craft_traditions",name:"Master Crafts, Watchmaking & Heritage Trades",share:.16,topics:[{id:"food_horology_metals",name:"Haute Horlogerie, Metallurgy & Luthiery",share:.52,kw:["tourbillon","escapement","damascus","stradivarius"]},{id:"food_textiles_glass",name:"Weaving, Murano Glass & Ceramic Kilns",share:.48,kw:["loom","glaze","kiln","lacquer","indigo"]}]}],10:[{id:"myth_pantheons",name:"Classical & World Mythology",share:.34,topics:[{id:"myth_greek_roman",name:"Greek & Roman Mythology & Epics",share:.38,kw:["olympus","odyssey","iliad","apollo","athena","titan"]},{id:"myth_norse_celtic",name:"Norse, Celtic & Slavic Folklore",share:.32,kw:["odin","asgard","edda","valkyrie","runes"]},{id:"myth_egypt_asia_americas",name:"Egyptian, Vedic, East Asian & Mesoamerican Myth",share:.3,kw:["osiris","anubis","mahabharata","kami","quetzalcoatl"]}]},{id:"myth_world_lit",name:"World Novels, Playwrights & Laureates",share:.34,topics:[{id:"myth_classic_novels",name:"19th & 20th Century Masterpiece Novels",share:.4,kw:["novel","author","protagonist","published","tolstoy","austen"]},{id:"myth_shakespeare_drama",name:"Shakespeare, Tragedies & World Theatre",share:.3,kw:["shakespeare","tragedy","play","soliloquy","act"]},{id:"myth_nobel_modern_lit",name:"Nobel Literature, Postmodern & Speculative Fiction",share:.3,kw:["nobel prize in literature","borges","marquez","dystopian"]}]},{id:"myth_poetry_philosophy",name:"Poetry, Epics & Philosophical Texts",share:.18,topics:[{id:"myth_poets_forms",name:"Epic Poems, Sonnets & Laureate Poets",share:.52,kw:["sonnet","dante","homer","stanza","poet"]},{id:"myth_philosophy_classics",name:"Ancient & Modern Philosophical Treatises",share:.48,kw:["plato","aristotle","kant","nietzsche","stoic"]}]},{id:"myth_linguistics",name:"Etymology, Literary Devices & Archetypes",share:.14,topics:[{id:"myth_etymology_rhetoric",name:"Rhetorical Figures, Idioms & Etymology",share:.55,kw:["metaphor","oxymoron","latin","root","etymology"]},{id:"myth_mystery_detective",name:"Detective Fiction, Noir & Literary Sleuths",share:.45,kw:["detective","holmes","poirot","mystery"]}]}],11:[{id:"math_number_algebra",name:"Number Theory, Algebra & Mental Math",share:.32,topics:[{id:"math_number_theory",name:"Primes, Modular Arithmetic & Sequences",share:.38,kw:["prime","fibonacci","modulo","divisor","integer"]},{id:"math_mental_estimation",name:"Rapid Mental Estimation & Ratios",share:.34,kw:["ratio","percentage","factorial","power","root"]},{id:"math_algebra_calculus",name:"Functions, Series, Calculus & Linear Algebra",share:.28,kw:["derivative","integral","matrix","polynomial","limit"]}]},{id:"math_geometry_combinatorics",name:"Geometry, Probability & Combinatorics",share:.28,topics:[{id:"math_geometry_topology",name:"Euclidean Geometry, Polyhedra & Topology",share:.5,kw:["triangle","polyhedron","angle","hypotenuse","euler"]},{id:"math_probability_stats",name:"Probability, Bayes & Combinatorics",share:.5,kw:["probability","permutation","dice","expected value","bayes"]}]},{id:"math_logic_ciphers",name:"Formal Logic, Ciphers & Lateral Puzzles",share:.24,topics:[{id:"math_deductive_paradoxes",name:"Syllogisms, Knights & Knaves & Paradoxes",share:.52,kw:["paradox","truth","syllogism","implies","contrapositive"]},{id:"math_classical_ciphers",name:"Classical Ciphers, Codes & Pattern Sequences",share:.48,kw:["cipher","vigenere","caesar","sequence","pattern"]}]},{id:"math_game_history",name:"Game Theory & Great Mathematicians",share:.16,topics:[{id:"math_mathematicians",name:"Fields Medalists, Conjectures & Theorems",share:.54,kw:["theorem","conjecture","gauss","riemann","ramanu"]},{id:"math_game_strategy",name:"Combinatorial Games, Nim & Optimal Strategy",share:.46,kw:["equilibrium","strategy","zero-sum","payoff"]}]}]};let U=null,K=null;function Ie(t="./data/shards/taxonomy_tree.json"){return U!==null?Promise.resolve(U):K||(typeof fetch!="function"?Promise.resolve(null):(K=fetch(t).then(i=>i.ok?i.json():null).then(i=>(i&&typeof i=="object"&&(U=i),U)).catch(()=>null).finally(()=>{K=null}),K))}function F(t,i,s){for(const n of i){const r=Number(t[n]);if(Number.isFinite(r)&&r>=0)return Math.round(r)}return s}function Q(t,i,s){for(const n of i){const r=t[n];if(typeof r=="string"&&r.trim().length>0)return r.trim()}return s}function ne(t,i){for(const s of i){const n=t[s];if(Array.isArray(n)&&n.length>0)return n.filter(r=>!!(r&&typeof r=="object"))}return null}function x(t){const i=String(t??"");return i.includes(",")?i.replace(/\b(in|circa|c\.|from|until|since|year|dated|trial|season|series|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\b([12]),(\d{3})(\s*(?:CE|BCE|AD|BC))\b/gi,"$1$2$3").replace(/\(([b.\s]*)([12]),(\d{3})\)/gi,"($1$2$3)").replace(/\b([12]),(\d{3})s\b/g,"$1$2s").replace(/\b([12]),(\d{3})\s*([–—-])\s*([12]),(\d{3})\b/g,"$1$2$3$4$5").replace(/(\d{1,2}[/-]\d{1,2}[/-])([12]),(\d{3})\b/g,"$1$2$3").replace(/(?<![\d,.])([12]),(\d{3})(?![\d,])(?!\s*(?:\+?\s*(?:qs?|questions?|pts?|points?|hits?|rbis?|km|mi|m|ft|kg|lbs?|verified|playable|topics?|missions?)\b))/gi,"$1$2"):i}function ce(t){let i=0,s=0,n=0;for(const r of t){n+=r.verifiedCount,i+=r.subcategories.length;for(const a of r.subcategories)s+=a.topics.length}return{l0Count:t.length,l1Count:i,l2Count:s,totalVerified:n}}function de(t,i){const s=i;let n=null;try{n=s?.getTaxonomyTree?.()??U}catch{n=U}let r=null;return Array.isArray(n)&&n.length>0?r=n:n&&typeof n=="object"&&(r=ne(n,["domains","l0Domains","nodes","tree","children"])),Ee.map(a=>{const h=t.byDomain.find(y=>y.domainId===a.id),l=Math.max(12e3,h?.totalPlayableCount??h?.verifiedCount??78e3),m=Math.max(0,h?l-(h.seenInDomainEst??0):l),p=r?.find(y=>Number(y.domainId??y.l0Domain??y.id)===a.id),k=p?ne(p,["l1Subcategories","subcategories","l1Categories","categories","children","l1"]):null;if(p&&k&&k.length>0){const y=F(p,["totalPlayableCount","verifiedCount","questionCount","totalCount","count"],l),E=k.map((A,M)=>{const z=Q(A,["id","l1SubcategoryId","l1Id","key","slug"],`d${a.id}_l1_${M}`),B=x(Q(A,["name","label","title"],`Category ${M+1}`)),O=ne(A,["topics","l2Topics","leaves","subtopics","children","l2"])??[],T=Math.max(2500,Math.round(y/Math.max(1,k.length))),N=F(A,["totalPlayableCount","verifiedCount","questionCount","totalCount","count"],T),C=O.map((w,V)=>{const c=Q(w,["id","l2TopicId","l2Id","topicId","key","slug"],`${z}_t${V}`),u=x(Q(w,["name","label","title"],`Topic ${V+1}`)),b=Math.max(1200,Math.round(N/Math.max(1,O.length))),S=F(w,["totalPlayableCount","verifiedCount","questionCount","totalCount","count"],b),$=F(w,["unseenCount","unseen"],S),L=w.keywords,P=Array.isArray(L)?L.filter(te=>typeof te=="string"):void 0;return{id:c,name:u,domainId:a.id,domainName:a.name,l1Id:z,l1Name:B,verifiedCount:S,unseenCount:$,keywords:P}}),X=C.reduce((w,V)=>w+V.verifiedCount,0),J=Math.max(N,X),ae=F(A,["unseenCount","unseen"],J);return{id:z,name:B,domainId:a.id,domainName:a.name,verifiedCount:J,unseenCount:ae,topics:C}}),R=E.reduce((A,M)=>A+M.verifiedCount,0),I=Math.max(y,R),v=F(p,["unseenCount","unseen"],I);return{domainId:a.id,name:a.name,shortName:a.shortName,medallionUrl:`./assets/ui/cat_${a.id}.png`,accentHex:a.accentHex,verifiedCount:I,unseenCount:v,subcategories:E}}const f=(Le[a.id]??[]).map(y=>{const E=Math.max(3200,Math.round(l*y.share)),R=Math.max(0,Math.round(m*y.share)),I=y.topics.map(v=>{const A=Math.max(2500,Math.round(E*v.share)),M=Math.max(0,Math.round(R*v.share));return{id:v.id,name:v.name,domainId:a.id,domainName:a.name,l1Id:y.id,l1Name:y.name,verifiedCount:A,unseenCount:M,keywords:v.kw}});return{id:y.id,name:y.name,domainId:a.id,domainName:a.name,verifiedCount:E,unseenCount:R,topics:I}});return{domainId:a.id,name:a.name,shortName:a.shortName,medallionUrl:`./assets/ui/cat_${a.id}.png`,accentHex:a.accentHex,verifiedCount:l,unseenCount:m,subcategories:f}})}function Me(t,i){const s=i.trim().toLowerCase();if(!s)return[];const n=[],r=new Set;for(const a of t){const h=a.name.toLowerCase().includes(s)||a.shortName.toLowerCase().includes(s);for(const l of a.subcategories){if(l.name.toLowerCase().includes(s)){const p=`L1::${a.domainId}::${l.id}`;r.has(p)||(r.add(p),n.push({kind:"L1",domainId:a.domainId,domainName:a.name,medallionUrl:a.medallionUrl,l1Id:l.id,l1Name:l.name,breadcrumb:`${a.shortName} › ${l.name}`,verifiedCount:l.verifiedCount}))}for(const p of l.topics){const k=p.keywords?.some(e=>e.toLowerCase().includes(s))??!1;if(p.name.toLowerCase().includes(s)||k||h&&n.length<24){const e=`L2::${a.domainId}::${l.id}::${p.id}`;r.has(e)||(r.add(e),n.push({kind:"L2",domainId:a.domainId,domainName:a.name,medallionUrl:a.medallionUrl,l1Id:l.id,l1Name:l.name,l2Id:p.id,l2Name:p.name,breadcrumb:`${a.shortName} › ${l.name} › ${p.name}`,verifiedCount:p.verifiedCount,keywords:p.keywords}))}}}}return n.sort((a,h)=>{const l=(a.l2Name??a.l1Name).toLowerCase(),m=(h.l2Name??h.l1Name).toLowerCase(),p=l===s?0:l.startsWith(s)?1:l.includes(s)?2:3,k=m===s?0:m.startsWith(s)?1:m.includes(s)?2:3;return p!==k?p-k:a.kind!==h.kind?a.kind==="L2"?-1:1:h.verifiedCount-a.verifiedCount}),n.slice(0,36)}const pe="ws-sleek-briefing-sheet-css",ue="ws_preferred_difficulty_v2",ge="ws_briefing_format_mode_v4",fe="ws_briefing_timer_pace_v4",Ne="ws_career_analytics_v1";function Z(t){return t==="CLASSIC_4_ONLY"?"CLASSIC_4_ONLY":"VARIETY_MIX"}function ee(t){return t==="RELAXED_UNTIMED"?"RELAXED_UNTIMED":"STANDARD"}function be(){try{return typeof localStorage>"u"?"VARIETY_MIX":Z(localStorage.getItem(ge))}catch{return"VARIETY_MIX"}}function we(t){try{typeof localStorage<"u"&&localStorage.setItem(ge,t)}catch{}}function ye(){try{return typeof localStorage>"u"?"STANDARD":ee(localStorage.getItem(fe))}catch{return"STANDARD"}}function ve(t){try{typeof localStorage<"u"&&localStorage.setItem(fe,t)}catch{}}function Pe(){const t={},i={};try{if(typeof localStorage>"u")return{domainAccPct:t,subcatAccPct:i};const s=localStorage.getItem(Ne);if(!s)return{domainAccPct:t,subcatAccPct:i};const n=JSON.parse(s);if(!n||typeof n!="object")return{domainAccPct:t,subcatAccPct:i};if(Array.isArray(n.byDomain)&&n.byDomain.forEach((r,a)=>{const h=Math.max(0,Math.floor(Number(r?.right)||0)),l=Math.max(0,Math.floor(Number(r?.wrong)||0)),m=h+l;m>0&&(t[a]={pct:Math.round(h/m*100),total:m})}),Array.isArray(n.events)){const r=new Map;for(const a of n.events){const h=typeof a?.subcatLabel=="string"?a.subcatLabel.trim().toLowerCase():"";if(!h)continue;const l=r.get(h)??{right:0,total:0};l.total+=1,a.correct&&(l.right+=1),r.set(h,l)}for(const[a,h]of r.entries())h.total>0&&(i[a]={pct:Math.round(h.right/h.total*100),total:h.total})}}catch{}return{domainAccPct:t,subcatAccPct:i}}function me(t){return t>=75?"is-acc-strong":t>=50?"is-acc-steady":"is-acc-weak"}function De(){try{if(typeof localStorage>"u")return"ADAPTIVE";const t=localStorage.getItem(ue);return t?re(t):"ADAPTIVE"}catch{return"ADAPTIVE"}}function Re(t){try{typeof localStorage<"u"&&localStorage.setItem(ue,t)}catch{}}function g(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function ze(){if(typeof document>"u"||document.getElementById(pe))return;const t=document.createElement("style");t.id=pe,t.textContent=`
    .ws-velvet-backdrop.ws-briefing-modal {
      position: fixed;
      inset: 0;
      z-index: 65;
      background: rgba(3, 5, 10, 0.88);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 0;
      pointer-events: auto;
    }

    .ws-velvet-sheet.ws-briefing-sheet {
      position: relative;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      background:
        radial-gradient(ellipse 90% 34% at 50% 0%, rgba(216, 175, 87, 0.085) 0%, rgba(7, 10, 18, 0) 70%),
        #070a12;
      border: none !important;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
    }

    .ws-velvet-sheet.ws-briefing-sheet::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 4%, rgba(232, 197, 116, 0.42) 50%, transparent 96%);
      pointer-events: none;
      z-index: 10;
    }

    @media (min-width: 768px) and (min-height: 560px) {
      .ws-velvet-backdrop.ws-briefing-modal {
        align-items: center;
        padding: 20px;
      }
      .ws-velvet-sheet.ws-briefing-sheet {
        max-width: 840px;
        height: min(88dvh, 840px);
        max-height: min(88dvh, 840px);
        border-radius: 18px;
        box-shadow:
          0 32px 84px rgba(0, 0, 0, 0.84),
          0 0 0 1px rgba(242, 207, 126, 0.14);
      }
    }

    .ws-briefing-sheet .ws-sheet-header {
      position: sticky;
      top: 0;
      z-index: 8;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: minmax(76px, auto) minmax(0, 1fr) minmax(44px, auto);
      align-items: center;
      gap: 6px;
      min-height: calc(48px + env(safe-area-inset-top, 0px));
      padding: env(safe-area-inset-top, 0px) 8px 0 8px;
      background: rgba(7, 10, 18, 0.96);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .ws-briefing-sheet .ws-sheet-nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 5px;
      min-height: 44px;
      min-width: 44px;
      padding: 0 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--gold-bright, #f2cf7e);
      font-size: 13.5px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-nav-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffebb8;
    }

    .ws-briefing-sheet .ws-sheet-title {
      margin: 0;
      text-align: center;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: clamp(13.5px, 1.5vw, 16px);
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-sheet .ws-sheet-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(246, 242, 233, 0.66);
      font-size: 17px;
      line-height: 1;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-icon-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-subhead {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      padding: 2px 16px 6px;
      background: rgba(7, 10, 18, 0.94);
      border: none;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 2px;
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: none;
      white-space: nowrap;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs::-webkit-scrollbar {
      display: none;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs .ws-briefing-crumb {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      min-height: 36px;
      min-width: auto;
      padding: 4px 5px;
      border: none;
      border-radius: 0;
      background: transparent !important;
      color: rgba(246, 242, 233, 0.68);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
      font-size: 12.5px;
      font-weight: 500;
      letter-spacing: 0.01em;
      transition: color 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs .ws-briefing-crumb:hover {
      background: transparent !important;
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs .ws-briefing-crumb.is-current {
      background: transparent !important;
      color: var(--gold-bright, #f2cf7e);
      font-weight: 600;
    }

    .ws-briefing-crumb-sep {
      color: rgba(246, 242, 233, 0.56);
      font-size: 13px;
      padding: 0 2px;
      user-select: none;
      flex-shrink: 0;
    }

    .ws-briefing-search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .ws-briefing-search-icon {
      position: absolute;
      left: 2px;
      width: 15px;
      height: 15px;
      color: rgba(246, 242, 233, 0.62);
      pointer-events: none;
    }

    .ws-briefing-sheet .ws-sheet-search {
      width: 100%;
      max-width: none;
      min-height: 44px;
      padding: 8px 44px 8px 26px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 0;
      background: transparent;
      color: var(--ivory-primary, #f6f2e9);
      font-size: 14.5px;
      font-weight: 400;
      outline: none;
      box-shadow: none;
      transition: border-color 0.16s ease;
    }

    .ws-briefing-sheet .ws-sheet-search::placeholder {
      color: rgba(246, 242, 233, 0.60);
    }

    .ws-briefing-sheet .ws-sheet-search:focus {
      border-bottom-color: rgba(242, 207, 126, 0.78);
    }

    .ws-briefing-sheet .ws-sheet-search::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }

    .ws-briefing-search-clear {
      position: absolute;
      right: -4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: none;
      background: transparent;
      color: rgba(246, 242, 233, 0.68);
      font-size: 14px;
    }

    .ws-briefing-search-clear:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      border: none;
    }

    .ws-briefing-section-label {
      padding: 10px 16px 6px;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(246, 242, 233, 0.62);
      font-variant-numeric: tabular-nums;
    }

    .ws-briefing-sheet .ws-sheet-list {
      display: flex;
      flex-direction: column;
      width: 100%;
      border: none;
    }

    @media (min-width: 720px) {
      .ws-briefing-sheet .ws-sheet-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ws-briefing-sheet .ws-sheet-row:nth-child(even) {
        box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
      .ws-briefing-sheet .ws-sheet-row.is-selected:nth-child(even) {
        box-shadow:
          inset 3px 0 0 var(--gold-bright, #f2cf7e),
          inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
    }

    .ws-briefing-sheet .ws-sheet-row {
      width: 100%;
      min-height: 58px;
      padding: 11px 16px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 0;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 13px;
      text-align: left;
      transition: background 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-row:hover {
      background: rgba(255, 255, 255, 0.036);
    }

    .ws-briefing-sheet .ws-sheet-row:active {
      background: rgba(242, 207, 126, 0.07);
    }

    .ws-briefing-sheet .ws-sheet-row.is-selected {
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.11) 0%, rgba(242, 207, 126, 0.025) 100%);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-row-icon {
      width: 34px;
      height: 34px;
      object-fit: contain;
      flex-shrink: 0;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.55));
    }

    .ws-briefing-row-all-glyph {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(242, 207, 126, 0.12);
      color: var(--gold-bright, #f2cf7e);
      font-size: 14px;
    }

    .ws-briefing-row-copy {
      min-width: 0;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ws-briefing-row-title {
      font-size: 14.5px;
      font-weight: 600;
      line-height: 1.25;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-sheet .ws-sheet-row.is-selected .ws-briefing-row-title {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-row-sub {
      font-size: 11.5px;
      line-height: 1.25;
      color: rgba(246, 242, 233, 0.64);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-row-meta {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      margin-left: 6px;
    }

    .ws-briefing-row-count,
    .ws-briefing-row-badge {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: rgba(242, 207, 126, 0.88);
      white-space: nowrap;
      padding: 2px 7px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.055);
    }

    .ws-briefing-row-badge.is-acc-strong {
      color: #67ebb8;
      background: rgba(57, 212, 154, 0.14);
    }

    .ws-briefing-row-badge.is-acc-steady {
      color: var(--gold-bright, #f2cf7e);
      background: rgba(242, 207, 126, 0.14);
    }

    .ws-briefing-row-badge.is-acc-weak {
      color: #ff9aa6;
      background: rgba(224, 82, 99, 0.15);
    }

    .ws-briefing-row-badge.is-topic-tag {
      color: rgba(246, 242, 233, 0.74);
      background: rgba(255, 255, 255, 0.055);
    }

    .ws-briefing-row-chevron {
      font-size: 18px;
      line-height: 1;
      color: rgba(246, 242, 233, 0.60);
      width: 14px;
      text-align: center;
    }

    .ws-briefing-row-check {
      font-size: 14px;
      font-weight: 800;
      line-height: 1;
      color: var(--gold-bright, #f2cf7e);
      width: 16px;
      text-align: center;
    }

    .ws-briefing-empty {
      padding: 36px 20px;
      text-align: center;
      color: rgba(246, 242, 233, 0.58);
      font-size: 13.5px;
      line-height: 1.5;
    }

    .ws-briefing-empty-chips {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
    }

    .ws-briefing-suggest-btn {
      min-height: 44px;
      padding: 0 14px;
      border: none;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--gold-bright, #f2cf7e);
      font-size: 12.5px;
      font-weight: 600;
    }

    .ws-briefing-suggest-btn:hover {
      background: rgba(242, 207, 126, 0.16);
    }

    .ws-briefing-sheet .ws-sheet-footer {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
      gap: 8px;
      padding: 10px 16px max(12px, env(safe-area-inset-bottom, 0px));
      background: rgba(6, 9, 16, 0.98);
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: none;
    }

    .ws-briefing-footer-top {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }

    .ws-briefing-target-line {
      min-width: 0;
      flex: 0 0 auto;
      width: 100%;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      font-size: 12px;
      color: rgba(246, 242, 233, 0.62);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-target-name {
      color: var(--ivory-primary, #f6f2e9);
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-target-qs {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      color: var(--gold-bright, #f2cf7e);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .ws-briefing-diff-strip {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 2px;
      width: 100%;
      background: rgba(255, 255, 255, 0.045);
      border-radius: 9px;
      padding: 2px;
      border: none;
      overflow: hidden;
    }

    .ws-briefing-diff-btn {
      flex: 1 0 auto;
      min-height: 36px;
      min-width: 0;
      padding: 0 5px;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: rgba(246, 242, 233, 0.72);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      text-align: center;
      transition: background 0.14s ease, color 0.14s ease;
    }

    @media (max-width: 399px) {
      .ws-briefing-sheet .ws-sheet-footer {
        padding-left: 10px;
        padding-right: 10px;
      }
      .ws-briefing-diff-btn {
        font-size: 10px;
        padding: 0 3.5px;
        letter-spacing: 0;
      }
    }

    .ws-briefing-diff-btn.is-active {
      background: rgba(242, 207, 126, 0.2);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-diff-indicator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
      line-height: 1.25;
      color: rgba(246, 242, 233, 0.76);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-diff-indicator strong {
      color: var(--gold-bright, #f2cf7e);
      font-weight: 700;
    }

    .ws-briefing-v4-toggles {
      display: grid;
      grid-template-columns: minmax(0, 1.18fr) minmax(0, 0.82fr);
      gap: 6px;
      width: 100%;
    }

    .ws-briefing-toggle-rail {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 2px;
      padding: 2px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.045);
      border: none;
      min-width: 0;
    }

    .ws-briefing-toggle-btn {
      min-height: 36px;
      min-width: 0;
      padding: 0 6px;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: rgba(246, 242, 233, 0.72);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-toggle-btn:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-toggle-btn.is-active {
      background: rgba(242, 207, 126, 0.2);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-toggle-btn.is-pace-active {
      background: rgba(86, 212, 245, 0.18);
      color: #8ee5ff;
    }

    @media (max-width: 399px) {
      .ws-briefing-v4-toggles {
        gap: 4px;
      }
      .ws-briefing-toggle-btn {
        font-size: 10px;
        padding: 0 4px;
        letter-spacing: 0;
      }
    }

    @media (min-width: 640px) {
      .ws-briefing-v4-toggles {
        grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
        gap: 8px;
      }
      .ws-briefing-toggle-btn {
        font-size: 11.5px;
        padding: 0 10px;
      }
    }

    .ws-briefing-footer-main {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      gap: 8px;
    }

    .ws-briefing-sheet .ws-segmented-group {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 3px;
      padding: 3px;
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.055);
      border: none;
      flex: 0 0 auto;
      width: 100%;
    }

    .ws-briefing-sheet .ws-segmented-btn {
      min-height: 44px;
      min-width: 44px;
      padding: 0 8px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(246, 242, 233, 0.64);
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 12px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-sheet .ws-segmented-btn:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-sheet .ws-segmented-btn.is-active {
      background: rgba(242, 207, 126, 0.2);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-launch-cta {
      flex: 0 0 auto;
      width: 100%;
      min-height: 48px;
      padding: 0 20px;
      border: none !important;
      border-radius: 12px;
      background: linear-gradient(180deg, #fae29c 0%, #d8ab4e 56%, #b5842c 100%);
      color: #0e121a;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      white-space: nowrap;
      box-shadow: 0 8px 24px rgba(216, 175, 87, 0.28);
      transition: filter 0.14s ease, transform 0.12s ease;
    }

    @media (min-width: 640px) {
      .ws-briefing-footer-top {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
      }
      .ws-briefing-target-line {
        flex: 0 0 auto;
        width: 100%;
        justify-content: space-between;
      }
      .ws-briefing-diff-strip {
        display: flex;
        width: 100%;
        gap: 3px;
      }
      .ws-briefing-diff-btn {
        min-width: 56px;
        padding: 0 10px;
        font-size: 11px;
      }
      .ws-briefing-footer-main {
        flex-direction: row;
        align-items: center;
        gap: 10px;
      }
      .ws-briefing-sheet .ws-segmented-group {
        flex: 1 1 260px;
        width: auto;
      }
      .ws-briefing-launch-cta {
        flex: 1.15 1 220px;
        width: auto;
      }
    }

    .ws-briefing-launch-cta:hover {
      filter: brightness(1.06);
    }

    .ws-briefing-launch-cta:active {
      transform: scale(0.99);
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-briefing-sheet .ws-sheet-header {
        min-height: 44px;
      }
      .ws-briefing-subhead {
        flex-direction: row;
        align-items: center;
        gap: 14px;
        padding: 0 16px 4px;
      }
      .ws-briefing-sheet .ws-sheet-breadcrumbs {
        flex: 0 1 auto;
        max-width: 52%;
      }
      .ws-briefing-search-wrap {
        flex: 1 1 220px;
      }
      .ws-briefing-sheet .ws-sheet-search {
        min-height: 40px;
        padding: 4px 36px 4px 24px;
        font-size: 13px;
      }
      .ws-briefing-sheet .ws-sheet-row {
        min-height: 48px;
        padding: 7px 14px;
      }
      .ws-briefing-sheet .ws-sheet-footer {
        padding: 6px 14px max(6px, env(safe-area-inset-bottom, 0px));
        gap: 5px;
      }
      .ws-briefing-footer-top {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 4px;
      }
      .ws-briefing-target-line {
        display: none;
      }
      .ws-briefing-diff-strip {
        width: 100%;
      }
      .ws-briefing-diff-btn {
        min-height: 28px;
        padding: 0 8px;
        font-size: 10.5px;
      }
      .ws-briefing-v4-toggles {
        grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
        gap: 6px;
      }
      .ws-briefing-toggle-btn {
        min-height: 28px;
        font-size: 10.5px;
      }
      .ws-briefing-diff-indicator {
        display: none;
      }
      .ws-briefing-footer-main {
        flex-direction: row;
        align-items: center;
        gap: 8px;
      }
      .ws-briefing-sheet .ws-segmented-group {
        flex: 1 1 220px;
        width: auto;
      }
      .ws-briefing-launch-cta {
        flex: 1.15 1 200px;
        width: auto;
        min-height: 44px;
      }
    }
  `,document.head.appendChild(t)}class Be{audio;haptics;modalEl=null;boundKeyDown=null;constructor(i,s){this.audio=i,this.haptics=s}isOpen(){return this.modalEl!==null}open(i,s,n,r){this.close(),ze();let a=de(i,r?.forgeInstance),h=r?.initialL0DomainId??null,l=r?.initialL1SubcategoryId??null,m=r?.initialL2TopicId??null,p=r?.initialSearchQuery??"",k=De(),e=r?.initialFormatMode?Z(r.initialFormatMode):be(),f=r?.initialTimerPace?ee(r.initialTimerPace):ye(),y=10;const E=Pe(),R=(c,u)=>{const b=E.domainAccPct[c];return b&&b.total>0?`<span class="ws-briefing-row-badge ${me(b.pct)}">${b.pct}% Acc</span>`:`<span class="ws-briefing-row-badge is-topic-tag">${g(u)}</span>`},I=(c,u)=>{let b=0,S=0;for(const $ of c){const L=$.trim().toLowerCase(),P=E.subcatAccPct[L];P&&P.total>0&&(b+=Math.round(P.pct/100*P.total),S+=P.total)}if(S>0){const $=Math.round(b/S*100);return`<span class="ws-briefing-row-badge ${me($)}">${$}% Acc</span>`}return`<span class="ws-briefing-row-badge is-topic-tag">${g(u)}</span>`},v=document.createElement("div");v.className="ws-modal-backdrop ws-briefing-modal ws-velvet-backdrop",v.setAttribute("role","dialog"),v.setAttribute("aria-modal","true"),v.setAttribute("aria-label","The Briefing Room 3-Level Category & Subcategory Picker");const A=()=>{const c=h!==null?a.find(S=>S.domainId===h)??null:null,u=c&&l?c.subcategories.find(S=>S.id===l)??null:null,b=u&&m?u.topics.find(S=>S.id===m)??null:null;if(c&&u&&b){const $=c.shortName.trim().toLowerCase()===u.name.trim().toLowerCase()?`${c.name} › ${b.name}`:`${c.shortName} › ${u.name} › ${b.name}`;return{domains:[c.domainId],l0DomainId:c.domainId,l1SubcategoryId:u.id,l2TopicId:b.id,selectionLabel:$,topicKeywords:b.keywords,difficulty:k,count:y,formatMode:e,timerPace:f}}if(c&&u){const S=c.shortName.trim().toLowerCase()===u.name.trim().toLowerCase();return{domains:[c.domainId],l0DomainId:c.domainId,l1SubcategoryId:u.id,selectionLabel:S?`${c.name} › ${u.name}`:`${c.shortName} › ${u.name}`,difficulty:k,count:y,formatMode:e,timerPace:f}}return c?{domains:[c.domainId],l0DomainId:c.domainId,selectionLabel:c.name,difficulty:k,count:y,formatMode:e,timerPace:f}:{domains:[],selectionLabel:"Global Mix (All 12 Domains)",difficulty:k,count:y,formatMode:e,timerPace:f}},M=()=>{if(p.trim().length>0){p="";const c=v.querySelector("#ws-briefing-search");c&&(c.value=""),w();return}if(m!==null){m=null,w();return}if(l!==null){l=null,w();return}if(h!==null){h=null,w();return}this.close(),n?.()},z=ce(a);v.innerHTML=`
      <div class="ws-velvet-sheet ws-briefing-sheet">
        <header class="ws-sheet-header">
          <button type="button" class="ws-sheet-nav-btn" id="ws-cat-back-btn">
            ← Back
          </button>
          <h2 class="ws-sheet-title" id="ws-briefing-title">Briefing Room</h2>
          <button type="button" class="ws-sheet-icon-btn" id="ws-cat-close-btn" aria-label="Close">
            ✕
          </button>
        </header>

        <div class="ws-briefing-subhead">
          <nav class="ws-sheet-breadcrumbs" id="ws-briefing-breadcrumbs" aria-label="Category trail"></nav>
          <div class="ws-briefing-search-wrap">
            <svg class="ws-briefing-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.8" />
              <path d="M13.6 13.6L17.5 17.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <input
              type="search"
              id="ws-briefing-search"
              class="ws-sheet-search"
              autocomplete="off"
              spellcheck="false"
              placeholder="Search ${z.l2Count} topics, e.g. Baseball..."
              value="${g(p)}"
            />
            <button
              type="button"
              class="ws-briefing-search-clear"
              id="ws-briefing-search-clear"
              aria-label="Clear search"
              style="display:${p?"inline-flex":"none"};"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="ws-briefing-scroll" id="ws-briefing-results"></div>

        <footer class="ws-sheet-footer" id="ws-briefing-footer"></footer>
      </div>
    `;const B=v.querySelector("#ws-briefing-title"),O=v.querySelector("#ws-briefing-breadcrumbs"),T=v.querySelector("#ws-briefing-results"),N=v.querySelector("#ws-briefing-footer"),C=v.querySelector("#ws-briefing-search"),X=v.querySelector("#ws-briefing-search-clear"),J=v.querySelector("#ws-cat-back-btn"),ae=v.querySelector("#ws-cat-close-btn"),w=()=>{const c=ce(a);C.placeholder=`Search ${c.l2Count} topics, e.g. Baseball...`,X.style.display=p.length>0?"inline-flex":"none";const u=h!==null?a.find(o=>o.domainId===h)??null:null,b=u&&l?u.subcategories.find(o=>o.id===l)??null:null,S=b&&m?b.topics.find(o=>o.id===m)??null:null,$=p.trim();$.length>0?B.textContent="Search Topics":b?B.textContent=x(b.name):u?B.textContent=x(u.name):B.textContent="Briefing Room";const L=[];if(L.push(`
        <button
          type="button"
          id="ws-cat-global-mix"
          data-ws-allow-compact="1"
          class="ws-briefing-crumb ${!u&&!$?"is-current":""}"
          data-crumb="ROOT"
        >All Domains</button>
      `),u&&(L.push('<span class="ws-briefing-crumb-sep" aria-hidden="true">›</span>'),L.push(`
          <button
            type="button"
            data-ws-allow-compact="1"
            class="ws-briefing-crumb ${!b&&!$?"is-current":""}"
            data-crumb="L0"
          >${g(x(u.name))}</button>
        `)),u&&b&&(L.push('<span class="ws-briefing-crumb-sep" aria-hidden="true">›</span>'),L.push(`
          <button
            type="button"
            data-ws-allow-compact="1"
            class="ws-briefing-crumb ${!S&&!$?"is-current":""}"
            data-crumb="L1"
          >${g(x(b.name))}</button>
        `)),u&&b&&S&&(L.push('<span class="ws-briefing-crumb-sep" aria-hidden="true">›</span>'),L.push(`
          <span class="ws-briefing-crumb is-current">${g(x(S.name))}</span>
        `)),O.innerHTML=L.join(""),O.querySelector('[data-crumb="ROOT"]')?.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),h=null,l=null,m=null,p="",C.value="",w()}),O.querySelector('[data-crumb="L0"]')?.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),l=null,m=null,p="",C.value="",w()}),O.querySelector('[data-crumb="L1"]')?.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),m=null,p="",C.value="",w()}),$.length>0){const o=Me(a,$);o.length===0?(T.innerHTML=`
            <div class="ws-briefing-empty">
              No specialist topics matched “<strong style="color:var(--ivory-primary);">${g($)}</strong>”.
              <div class="ws-briefing-empty-chips">
                ${["Baseball","World War II","Exoplanets","Chess","Oscars"].map(d=>`
                  <button type="button" class="ws-briefing-suggest-btn" data-suggest-q="${g(d)}">
                    ${g(d)}
                  </button>
                `).join("")}
              </div>
            </div>
          `,T.querySelectorAll("[data-suggest-q]").forEach(d=>{d.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),p=d.dataset.suggestQ||"",C.value=p,w()})})):(T.innerHTML=`
            <div class="ws-briefing-section-label">
              ${o.length} Matching ${o.length===1?"Topic":"Topics"}
            </div>
            <div class="ws-sheet-list">
              ${o.map(d=>{const _=h===d.domainId&&l===d.l1Id&&(d.kind==="L2"?m===d.l2Id:m===null),G=x(d.l2Name??d.l1Name),D=x(d.breadcrumb),W=Ae[Te(d.domainId)].shortLabel,Y=I([d.l2Name??"",d.l1Name],W);return`
                    <button
                      type="button"
                      class="ws-sheet-row ${_?"is-selected":""}"
                      data-hit-dom="${d.domainId}"
                      data-hit-l1="${g(d.l1Id)}"
                      data-hit-l2="${g(d.l2Id??"")}"
                    >
                      <img class="ws-briefing-row-icon" src="${g(d.medallionUrl)}" alt="" />
                      <div class="ws-briefing-row-copy">
                        <div class="ws-briefing-row-title">${g(G)}</div>
                        <div class="ws-briefing-row-sub">${g(D)}</div>
                      </div>
                      <div class="ws-briefing-row-meta">
                        ${Y}
                        <span class="ws-briefing-row-chevron" aria-hidden="true">›</span>
                      </div>
                    </button>
                  `}).join("")}
            </div>
          `,T.querySelectorAll("[data-hit-dom]").forEach(d=>{d.addEventListener("click",()=>{this.haptics.sightlineSnap(),this.audio.playSfx("sightline_snap"),h=Number(d.dataset.hitDom),l=d.dataset.hitL1||null,m=d.dataset.hitL2||null,p="",C.value="",w()})}))}else if(!u)T.innerHTML=`
          <div class="ws-briefing-section-label">
            ${c.l0Count} Domains · ${c.l1Count} Categories · ${c.l2Count} Specialist Topics
          </div>
          <div class="ws-sheet-list">
            ${a.map(o=>{const d=o.subcategories.slice(0,3).map(D=>x(D.name)).join(" · "),_=o.subcategories.reduce((D,W)=>D+W.topics.length,0),G=R(o.domainId,`${_} Topics`);return`
                  <button type="button" class="ws-sheet-row" data-pick-l0="${o.domainId}">
                    <img class="ws-briefing-row-icon" src="${g(o.medallionUrl)}" alt="" />
                    <div class="ws-briefing-row-copy">
                      <div class="ws-briefing-row-title">${g(x(o.name))}</div>
                      <div class="ws-briefing-row-sub">${g(d)}</div>
                    </div>
                    <div class="ws-briefing-row-meta">
                      ${G}
                      <span class="ws-briefing-row-chevron" aria-hidden="true">›</span>
                    </div>
                  </button>
                `}).join("")}
          </div>
        `,T.querySelectorAll("[data-pick-l0]").forEach(o=>{o.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),h=Number(o.dataset.pickL0),l=null,m=null,T.scrollTop=0,w()})});else if(b){const o=I([b.name,...b.topics.map(d=>d.name)],"Full Mix");T.innerHTML=`
          <div class="ws-briefing-section-label">
            ${g(x(b.name))} · ${b.topics.length} Specialist Topics
          </div>
          <div class="ws-sheet-list">
            <button
              type="button"
              class="ws-sheet-row ${m===null?"is-selected":""}"
              id="ws-all-l1-topics"
            >
              <span class="ws-briefing-row-all-glyph" aria-hidden="true">✦</span>
              <div class="ws-briefing-row-copy">
                <div class="ws-briefing-row-title">All ${g(x(b.name))}</div>
                <div class="ws-briefing-row-sub">Full category mix across ${b.topics.length} topics</div>
              </div>
              <div class="ws-briefing-row-meta">
                ${o}
                <span class="ws-briefing-row-check" aria-hidden="true">${m===null?"✓":""}</span>
              </div>
            </button>
            ${b.topics.map(d=>{const _=m===d.id,G=d.keywords?.length?d.keywords.slice(0,4).map(x).join(" · "):`${x(u.shortName)} › ${x(b.name)}`,D=I([d.name],"Focused");return`
                  <button
                    type="button"
                    class="ws-sheet-row ${_?"is-selected":""}"
                    data-pick-l2="${g(d.id)}"
                  >
                    <img class="ws-briefing-row-icon" src="${g(u.medallionUrl)}" alt="" />
                    <div class="ws-briefing-row-copy">
                      <div class="ws-briefing-row-title">${g(x(d.name))}</div>
                      <div class="ws-briefing-row-sub">${g(G)}</div>
                    </div>
                    <div class="ws-briefing-row-meta">
                      ${D}
                      <span class="ws-briefing-row-check" aria-hidden="true">${_?"✓":""}</span>
                    </div>
                  </button>
                `}).join("")}
          </div>
        `,T.querySelector("#ws-all-l1-topics")?.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),m=null,w()}),T.querySelectorAll("[data-pick-l2]").forEach(d=>{d.addEventListener("click",()=>{this.haptics.sightlineSnap(),this.audio.playSfx("sightline_snap");const _=d.dataset.pickL2||null;m=m===_?null:_,w()})})}else{const o=E.domainAccPct[u.domainId],d=o&&o.total>0?` · ${o.pct}% Your Avg`:"";T.innerHTML=`
          <div class="ws-briefing-section-label">
            ${g(x(u.name))} · ${u.subcategories.length} Categories${g(d)}
          </div>
          <div class="ws-sheet-list">
            ${u.subcategories.map(_=>{const G=_.topics.slice(0,4).map(Y=>x(Y.name)).join(" · "),D=`${_.topics.length} ${_.topics.length===1?"Topic":"Topics"}`,W=I([_.name,..._.topics.map(Y=>Y.name)],D);return`
                  <button type="button" class="ws-sheet-row" data-pick-l1="${g(_.id)}">
                    <img class="ws-briefing-row-icon" src="${g(u.medallionUrl)}" alt="" />
                    <div class="ws-briefing-row-copy">
                      <div class="ws-briefing-row-title">${g(x(_.name))}</div>
                      <div class="ws-briefing-row-sub">${g(G)}</div>
                    </div>
                    <div class="ws-briefing-row-meta">
                      ${W}
                      <span class="ws-briefing-row-chevron" aria-hidden="true">›</span>
                    </div>
                  </button>
                `}).join("")}
          </div>
        `,T.querySelectorAll("[data-pick-l1]").forEach(_=>{_.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),l=_.dataset.pickL1||null,m=null,T.scrollTop=0,w()})})}const P=A(),te=[{val:5,label:"5"},{val:10,label:"10"},{val:20,label:"20"},{val:50,label:"50 Qs"}],xe=[{val:"ADAPTIVE",label:"Auto"},{val:"MIDDLE_SCHOOL",label:"Mid School"},{val:"HIGH_SCHOOL",label:"High School"},{val:"COLLEGE",label:"College"},{val:"GRADUATE",label:"Graduate"},{val:"MENSA",label:"Mensa"}],ie=re(k),oe=Ce(ie),q=oe?$e(oe):null,ke=q?q.scoreMultiplier.toFixed(Math.abs(q.scoreMultiplier*10-Math.round(q.scoreMultiplier*10))<1e-6?1:2):"",_e=e==="VARIETY_MIX"?"Variety Mix":"Classic 4-Choice",se=f==="RELAXED_UNTIMED"?"Untimed":"28s Clock",le=e==="VARIETY_MIX"?"Match-4, Sort-4, Imposter, Pinpoint, Escalator & 4-Choice":"Pure 4-Choice Trivia",Se=q?`<span><strong>${g(q.label)}</strong> · ${g(q.subtitle)} (${ke}x) · ${g(le)}</span> <span>${se}</span>`:`<span><strong>Auto Adaptive</strong> · ${g(le)}</span> <span>${se}</span>`;N.innerHTML=`
        <div class="ws-briefing-footer-top">
          <div class="ws-briefing-target-line">
            <span class="ws-briefing-target-name">${g(x(P.selectionLabel))}</span>
            <span class="ws-briefing-target-qs">${g(_e)} · ${g(se)}</span>
          </div>
          <div class="ws-briefing-v4-toggles" id="ws-briefing-v4-toggles">
            <div class="ws-briefing-toggle-rail" role="group" aria-label="Question format mode">
              <button
                type="button"
                data-ws-allow-compact="1"
                class="ws-briefing-toggle-btn ${e==="VARIETY_MIX"?"is-active":""}"
                data-format-mode="VARIETY_MIX"
                aria-pressed="${e==="VARIETY_MIX"?"true":"false"}"
                title="Mixes Match-4, Sort-4, Imposter, Pinpoint, Escalator, and 4-Choice"
              >Variety Mix</button>
              <button
                type="button"
                data-ws-allow-compact="1"
                class="ws-briefing-toggle-btn ${e==="CLASSIC_4_ONLY"?"is-active":""}"
                data-format-mode="CLASSIC_4_ONLY"
                aria-pressed="${e==="CLASSIC_4_ONLY"?"true":"false"}"
                title="Pure classic 4-choice trivia questions only"
              >Classic 4-Choice</button>
            </div>
            <div class="ws-briefing-toggle-rail" role="group" aria-label="Timer pace mode">
              <button
                type="button"
                data-ws-allow-compact="1"
                class="ws-briefing-toggle-btn ${f==="STANDARD"?"is-pace-active":""}"
                data-timer-pace="STANDARD"
                aria-pressed="${f==="STANDARD"?"true":"false"}"
                title="Generous 28-second game-show clock"
              >28s Clock</button>
              <button
                type="button"
                data-ws-allow-compact="1"
                class="ws-briefing-toggle-btn ${f==="RELAXED_UNTIMED"?"is-pace-active":""}"
                data-timer-pace="RELAXED_UNTIMED"
                aria-pressed="${f==="RELAXED_UNTIMED"?"true":"false"}"
                title="Relaxed mode with zero timer pressure"
              >Untimed</button>
            </div>
          </div>
          <div class="ws-briefing-diff-strip" role="group" aria-label="Academic difficulty tier">
            ${xe.map(o=>`
              <button
                type="button"
                data-ws-allow-compact="1"
                class="ws-briefing-diff-btn ${ie===o.val?"is-active":""}"
                data-diff="${o.val}"
                aria-pressed="${ie===o.val?"true":"false"}"
              >${o.label}</button>
            `).join("")}
          </div>
          <div class="ws-briefing-diff-indicator" id="ws-briefing-diff-indicator">
            ${Se}
          </div>
        </div>

        <div class="ws-briefing-footer-main">
          <div class="ws-segmented-group" role="group" aria-label="Round length">
            ${te.map(o=>`
              <button
                type="button"
                class="ws-segmented-btn ${y===o.val?"is-active":""}"
                data-len="${o.val}"
              >${o.label}</button>
            `).join("")}
          </div>

          <button type="button" class="ws-briefing-launch-cta" id="ws-cat-launch">
            START BRIEFING ▶
          </button>
        </div>
      `,N.querySelectorAll("[data-format-mode]").forEach(o=>{o.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),e=Z(o.dataset.formatMode),we(e),w()})}),N.querySelectorAll("[data-timer-pace]").forEach(o=>{o.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),f=ee(o.dataset.timerPace),ve(f),w()})}),N.querySelectorAll("[data-diff]").forEach(o=>{o.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),k=re(o.dataset.diff),Re(k),w()})}),N.querySelectorAll("[data-len]").forEach(o=>{o.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),y=Number(o.dataset.len),w()})}),N.querySelector("#ws-cat-launch")?.addEventListener("click",()=>{this.haptics.sightlineSnap(),this.audio.playSfx("sightline_snap");const o=A();this.close(),s(o)})};C.addEventListener("input",()=>{p=C.value,w()}),X.addEventListener("click",()=>{this.haptics.uiTap(),p="",C.value="",C.focus(),w()}),C.addEventListener("keydown",c=>{c.stopPropagation(),c.key==="Escape"&&(c.preventDefault(),C.value?(C.value="",p="",w()):(this.close(),n?.()))}),J.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),M()}),ae.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),this.close(),n?.()}),w(),typeof r?.forgeInstance?.getTaxonomyTree=="function"||Ie().then(c=>{c&&this.modalEl===v&&(a=de(i,r?.forgeInstance),w())}),v.addEventListener("click",c=>{c.target===v&&(this.close(),n?.())}),this.boundKeyDown=c=>{const u=document.activeElement?.tagName.toUpperCase();u==="INPUT"||u==="TEXTAREA"||c.key==="Escape"&&(c.preventDefault(),M())},window.addEventListener("keydown",this.boundKeyDown),document.body.appendChild(v),this.modalEl=v}close(){this.boundKeyDown&&(window.removeEventListener("keydown",this.boundKeyDown),this.boundKeyDown=null),this.modalEl&&(this.modalEl.remove(),this.modalEl=null)}}const Fe=Object.freeze(Object.defineProperty({__proto__:null,BriefingCategoriesModal:Be,loadPreferredBriefingFormatMode:be,loadPreferredTimerPaceMode:ye,normalizeBriefingFormatMode:Z,normalizeTimerPaceMode:ee,savePreferredBriefingFormatMode:we,savePreferredTimerPaceMode:ve},Symbol.toStringTag,{value:"Module"})),he="ws-sleek-saves-sheet-css",Oe=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function H(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function j(t){const i=String(t??"");return i.includes(",")?i.replace(/\b(in|circa|c\.|from|until|since|year|dated|trial|season|series|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\b([12]),(\d{3})(\s*(?:CE|BCE|AD|BC))\b/gi,"$1$2$3").replace(/\(([b.\s]*)([12]),(\d{3})\)/gi,"($1$2$3)").replace(/(\d{1,2}[/-]\d{1,2}[/-])([12]),(\d{3})\b/g,"$1$2$3").replace(/(?<![\d,.])([12]),(\d{3})(?![\d,])(?!\s*(?:qs?|questions?|pts?|points?|missions?|hrs?|hours?)\b)/gi,"$1$2"):i}function qe(t){const i=j(t).trim();if(!i||i.toUpperCase()==="EMPTY")return"Unassigned";if(/\d{4}/.test(i)&&(/[/:T-]/.test(i)||/[A-Za-z]{3}/.test(i))){const n=new Date(i);if(!Number.isNaN(n.getTime())){const r=Oe[n.getMonth()]??"Jan",a=n.getDate(),h=String(n.getFullYear()),l=String(n.getHours()).padStart(2,"0"),m=String(n.getMinutes()).padStart(2,"0");return`${r} ${a} ${h} · ${l}:${m}`}}return i}function Ge(){if(typeof document>"u"||document.getElementById(he))return;const t=document.createElement("style");t.id=he,t.textContent=`
    .ws-velvet-backdrop.ws-save-modal {
      position: fixed;
      inset: 0;
      z-index: 65;
      background: rgba(3, 5, 10, 0.88);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 0;
      pointer-events: auto;
    }

    .ws-velvet-sheet.ws-saves-sheet {
      position: relative;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      background:
        radial-gradient(ellipse 90% 34% at 50% 0%, rgba(216, 175, 87, 0.08) 0%, rgba(7, 10, 18, 0) 70%),
        #070a12;
      border: none !important;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
    }

    .ws-velvet-sheet.ws-saves-sheet::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 4%, rgba(232, 197, 116, 0.42) 50%, transparent 96%);
      pointer-events: none;
      z-index: 10;
    }

    @media (min-width: 768px) and (min-height: 560px) {
      .ws-velvet-backdrop.ws-save-modal {
        align-items: center;
        padding: 20px;
      }
      .ws-velvet-sheet.ws-saves-sheet {
        max-width: 780px;
        height: min(88dvh, 840px);
        max-height: min(88dvh, 840px);
        border-radius: 18px;
        box-shadow:
          0 32px 84px rgba(0, 0, 0, 0.84),
          0 0 0 1px rgba(242, 207, 126, 0.14);
      }
    }

    .ws-saves-sheet .ws-sheet-header {
      position: sticky;
      top: 0;
      z-index: 8;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: minmax(76px, auto) minmax(0, 1fr) minmax(44px, auto);
      align-items: center;
      gap: 6px;
      min-height: calc(48px + env(safe-area-inset-top, 0px));
      padding: env(safe-area-inset-top, 0px) 8px 0 8px;
      background: rgba(7, 10, 18, 0.96);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .ws-saves-sheet .ws-sheet-nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 5px;
      min-height: 44px;
      min-width: 44px;
      padding: 0 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--gold-bright, #f2cf7e);
      font-size: 13.5px;
      font-weight: 600;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-saves-sheet .ws-sheet-nav-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffebb8;
    }

    .ws-saves-sheet .ws-sheet-title {
      margin: 0;
      text-align: center;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: clamp(13.5px, 1.5vw, 16px);
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-saves-sheet .ws-sheet-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(246, 242, 233, 0.66);
      font-size: 17px;
      line-height: 1;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-saves-sheet .ws-sheet-icon-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-saves-subhead {
      flex-shrink: 0;
      padding: 9px 16px;
      font-size: 12px;
      line-height: 1.35;
      color: rgba(246, 242, 233, 0.68);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(7, 10, 18, 0.92);
    }

    .ws-saves-subhead code {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      color: rgba(242, 207, 126, 0.85);
    }

    .ws-saves-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
      border: none;
    }

    .ws-saves-banner {
      padding: 11px 16px;
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.35;
      border: none;
      background: rgba(57, 212, 154, 0.1);
      color: #9ff5d1;
      box-shadow: inset 3px 0 0 var(--emerald-win, #39d49a);
    }

    .ws-saves-banner.is-error {
      background: rgba(224, 82, 99, 0.13);
      color: #ffb4be;
      box-shadow: inset 3px 0 0 var(--crimson-alert, #e05263);
    }

    .ws-save-slot-row {
      padding: 15px 16px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: background 0.14s ease;
    }

    .ws-save-slot-row.is-active {
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.095) 0%, rgba(242, 207, 126, 0.015) 100%);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-save-slot-top {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px 12px;
    }

    .ws-save-slot-identity {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .ws-save-slot-num {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 2px 7px;
      border-radius: 5px;
      border: none;
      background: rgba(255, 255, 255, 0.07);
      color: rgba(246, 242, 233, 0.72);
      font-variant-numeric: tabular-nums;
    }

    .ws-save-slot-row.is-active .ws-save-slot-num {
      background: rgba(242, 207, 126, 0.22);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-save-slot-name {
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 15.5px;
      font-weight: 700;
      color: var(--ivory-primary, #f6f2e9);
      letter-spacing: 0.02em;
    }

    .ws-save-slot-row.is-empty .ws-save-slot-name {
      font-family: var(--font-sans, 'Inter', sans-serif);
      font-weight: 500;
      color: rgba(246, 242, 233, 0.68);
    }

    .ws-save-slot-persona {
      font-size: 12px;
      color: var(--cyan-clue, #56d4f5);
      font-weight: 500;
    }

    .ws-save-slot-time {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      color: rgba(246, 242, 233, 0.66);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .ws-save-progress-track {
      width: 100%;
      height: 2px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .ws-save-progress-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #b5842c 0%, #f2cf7e 100%);
    }

    .ws-save-slot-stats {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 12px;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11.5px;
      line-height: 1.4;
      color: rgba(246, 242, 233, 0.68);
      font-variant-numeric: tabular-nums;
    }

    .ws-save-slot-stats strong {
      color: var(--ivory-primary, #f6f2e9);
      font-weight: 600;
    }

    .ws-save-slot-stats .is-gold {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-save-slot-stats .is-emerald {
      color: var(--emerald-win, #39d49a);
    }

    .ws-save-slot-stats .is-cyan {
      color: var(--cyan-clue, #56d4f5);
    }

    .ws-save-slot-stats .is-alert {
      color: #ff8e9b;
      font-weight: 700;
    }

    .ws-save-empty-note {
      font-size: 12.5px;
      line-height: 1.4;
      color: rgba(246, 242, 233, 0.66);
    }

    .ws-save-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
      margin-top: 2px;
    }

    .ws-save-cta-primary {
      min-height: 44px;
      min-width: 116px;
      padding: 0 16px;
      border: none !important;
      border-radius: 10px;
      background: linear-gradient(180deg, #fae29c 0%, #d8ab4e 56%, #b5842c 100%);
      color: #0e121a;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: filter 0.14s ease, transform 0.12s ease;
    }

    .ws-save-cta-primary:hover {
      filter: brightness(1.06);
    }

    .ws-save-cta-primary:active {
      transform: scale(0.99);
    }

    .ws-save-action-btn {
      min-height: 44px;
      min-width: 44px;
      padding: 0 13px;
      border: none !important;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--ivory-primary, #f6f2e9);
      font-size: 12.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-save-action-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.11);
    }

    .ws-save-action-btn:disabled {
      opacity: 0.34;
      cursor: not-allowed;
    }

    .ws-save-action-btn.is-warn {
      background: rgba(240, 157, 70, 0.1);
      color: var(--amber-warn, #f09d46);
    }

    .ws-save-action-btn.is-warn:hover {
      background: rgba(240, 157, 70, 0.18);
    }

    .ws-save-action-btn.is-danger {
      background: rgba(224, 82, 99, 0.11);
      color: #ff8e9b;
    }

    .ws-save-action-btn.is-danger:hover {
      background: rgba(224, 82, 99, 0.2);
    }

    .ws-save-confirm-strip {
      margin-top: 2px;
      padding: 10px 12px;
      border: none;
      border-radius: 8px;
      background: rgba(224, 82, 99, 0.13);
      box-shadow: inset 3px 0 0 var(--crimson-alert, #e05263);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 12px;
    }

    .ws-save-confirm-msg {
      font-size: 12.5px;
      font-weight: 600;
      color: #ffb4be;
      line-height: 1.35;
    }

    .ws-save-confirm-btns {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .ws-save-confirm-exec {
      min-height: 44px;
      padding: 0 14px;
      border: none !important;
      border-radius: 9px;
      background: linear-gradient(180deg, #ef6676 0%, #c23345 100%);
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-saves-sheet .ws-sheet-header {
        min-height: 44px;
      }
      .ws-saves-subhead {
        display: none;
      }
      .ws-save-slot-row {
        padding: 10px 14px;
        gap: 7px;
      }
    }
  `,document.head.appendChild(t)}class He{audio;haptics;modalEl=null;boundKeyDown=null;statusBanner=null;pendingConfirm=null;constructor(i,s){this.audio=i,this.haptics=s}isOpen(){return this.modalEl!==null}open(i){this.close(),Ge(),this.statusBanner=null,this.pendingConfirm=null;const s=document.createElement("div");s.className="ws-modal-backdrop ws-save-modal ws-velvet-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","Campaign Save Slots Dossier");const n=()=>{const r=s.querySelector(".ws-saves-scroll")?.scrollTop??0,h=i.getSlots().map(e=>{const f=e.totalMissions??96,y=typeof e.completionPct=="number"?Math.max(0,Math.min(100,e.completionPct)):Math.round(e.missionsCompleted/Math.max(1,f)*100),E=j(e.challengerName),R=j(e.personaLabel),I=j(e.currentActOrCity),v=j(e.completionLabel??`${e.missionsCompleted}/${f} Missions`),A=e.estimatedRemainingLabel?j(e.estimatedRemainingLabel):"",M=qe(e.updatedAtLabel),z=this.pendingConfirm&&this.pendingConfirm.slotId===e.slotId?`
                <div class="ws-save-confirm-strip">
                  <span class="ws-save-confirm-msg">
                    ${this.pendingConfirm.kind==="DELETE"?`Permanently delete Slot ${e.slotId} campaign dossier?`:`Reset Slot ${e.slotId} back to Act 0 Geneva Start?`}
                  </span>
                  <div class="ws-save-confirm-btns">
                    <button type="button" class="ws-save-action-btn" data-cancel-confirm="${e.slotId}">
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="ws-save-confirm-exec"
                      data-exec-confirm="${e.slotId}"
                      data-confirm-kind="${this.pendingConfirm.kind}"
                    >
                      Confirm ${this.pendingConfirm.kind==="DELETE"?"Delete":"Reset"}
                    </button>
                  </div>
                </div>
              `:"";return`
            <section class="ws-save-slot-row ${e.isActive?"is-active":""} ${e.isEmpty?"is-empty":""}">
              <div class="ws-save-slot-top">
                <div class="ws-save-slot-identity">
                  <span class="ws-save-slot-num">
                    SLOT 0${e.slotId}${e.isActive?" · ACTIVE":""}
                  </span>
                  <span class="ws-save-slot-name">
                    ${e.isEmpty?"Empty Dossier":H(E)}
                  </span>
                  ${e.isEmpty?"":`<span class="ws-save-slot-persona">· ${H(R)}</span>`}
                </div>
                <span class="ws-save-slot-time">${H(M)}</span>
              </div>

              ${e.isEmpty?'<div class="ws-save-empty-note">Unassigned slot — launch a fresh Act 0 Geneva Vetting campaign or import a saved <code>.ws-save.json</code> file.</div>':`
                    <div class="ws-save-progress-track" aria-hidden="true">
                      <div class="ws-save-progress-fill" style="width:${y}%;"></div>
                    </div>
                    <div class="ws-save-slot-stats">
                      <span><strong class="is-gold">${H(I)}</strong></span>
                      <span>Visas <strong class="is-emerald">${e.visasCleared}/8</strong></span>
                      <span>Relics <strong class="is-cyan">${e.relicsUnlocked}/8</strong></span>
                      <span><strong>${H(v)}</strong></span>
                      ${A?`<span><strong class="is-gold">${H(A)}</strong></span>`:""}
                      <span>Acc <strong>${e.accuracyPct}%</strong></span>
                      ${(e.failedAttemptsCount??0)>0?`<span class="is-alert">⚠ ${e.failedAttemptsCount} Retryable</span>`:""}
                    </div>
                  `}

              <div class="ws-save-actions">
                <button type="button" class="ws-save-cta-primary" data-slot-load="${e.slotId}">
                  ${e.isEmpty?"▶ Start New":e.isActive?"▶ Continue":"▶ Load Slot"}
                </button>
                <button type="button" class="ws-save-action-btn" data-slot-export="${e.slotId}" ${e.isEmpty?"disabled":""}>
                  ⬇ Export
                </button>
                <button type="button" class="ws-save-action-btn" data-slot-import="${e.slotId}">
                  ⬆ Import
                </button>
                ${e.isEmpty?"":`
                      <button type="button" class="ws-save-action-btn is-warn" data-slot-reset="${e.slotId}">
                        ↺ Reset
                      </button>
                      <button type="button" class="ws-save-action-btn is-danger" data-slot-delete="${e.slotId}">
                        ✕ Delete
                      </button>
                    `}
              </div>

              ${z}
            </section>
          `}).join("");s.innerHTML=`
        <div class="ws-velvet-sheet ws-saves-sheet">
          <header class="ws-sheet-header">
            <button type="button" class="ws-sheet-nav-btn" id="ws-saves-close">
              ← Back
            </button>
            <h2 class="ws-sheet-title">Campaign Saves</h2>
            <button type="button" class="ws-sheet-icon-btn" id="ws-saves-close-x" aria-label="Close">
              ✕
            </button>
          </header>

          <div class="ws-saves-subhead">
            Maintain up to 5 independent dossiers — switch anytime or exchange portable <code>.ws-save.json</code> backups.
          </div>

          <input type="file" id="ws-saves-file-input" hidden accept=".json,.ws-save.json,application/json" style="display:none;" />

          <div class="ws-saves-scroll">
            ${this.statusBanner?`
                  <div class="ws-saves-banner ${this.statusBanner.isError?"is-error":""}">
                    ${H(j(this.statusBanner.text))}
                  </div>
                `:""}
            ${h}
          </div>
        </div>
      `;const l=s.querySelector(".ws-saves-scroll");l&&r>0&&(l.scrollTop=r);const m=s.querySelector("#ws-saves-file-input");let p=1;m?.addEventListener("change",()=>{const e=m.files?.[0];if(!e)return;const f=new FileReader;f.onload=()=>{const y=typeof f.result=="string"?f.result:"",E=i.onImportSlotJson(p,y);this.statusBanner={text:E.message||(E.ok?`✓ Imported save file into Slot ${p} successfully.`:"Invalid campaign save JSON file."),isError:!E.ok},E.ok?(this.haptics.passportStamp(),this.audio.playSfx("passport_stamp")):this.haptics.wrongThud(!1),n()},f.readAsText(e),m.value=""});const k=()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),this.close(),i.onClose?.()};s.querySelector("#ws-saves-close")?.addEventListener("click",k),s.querySelector("#ws-saves-close-x")?.addEventListener("click",k),s.querySelectorAll("[data-slot-load]").forEach(e=>{e.addEventListener("click",()=>{const f=Number(e.dataset.slotLoad);this.haptics.sightlineSnap(),this.audio.playSfx("sightline_snap"),this.close(),i.onSwitchOrStartSlot(f)})}),s.querySelectorAll("[data-slot-export]").forEach(e=>{e.addEventListener("click",()=>{const f=Number(e.dataset.slotExport);this.haptics.uiTap(),this.audio.playSfx("ui_tap"),i.onExportSlot(f),this.statusBanner={text:`⬇ Exported Slot ${f} backup (.ws-save.json).`,isError:!1},n()})}),s.querySelectorAll("[data-slot-import]").forEach(e=>{e.addEventListener("click",()=>{p=Number(e.dataset.slotImport),this.haptics.uiTap(),this.audio.playSfx("ui_tap"),m?.click()})}),s.querySelectorAll("[data-slot-reset]").forEach(e=>{e.addEventListener("click",()=>{const f=Number(e.dataset.slotReset);this.haptics.uiTap(),this.audio.playSfx("ui_tap"),this.pendingConfirm={slotId:f,kind:"RESET"},n()})}),s.querySelectorAll("[data-slot-delete]").forEach(e=>{e.addEventListener("click",()=>{const f=Number(e.dataset.slotDelete);this.haptics.uiTap(),this.audio.playSfx("ui_tap"),this.pendingConfirm={slotId:f,kind:"DELETE"},n()})}),s.querySelectorAll("[data-cancel-confirm]").forEach(e=>{e.addEventListener("click",()=>{this.haptics.uiTap(),this.pendingConfirm=null,n()})}),s.querySelectorAll("[data-exec-confirm]").forEach(e=>{e.addEventListener("click",()=>{const f=Number(e.dataset.execConfirm),y=e.dataset.confirmKind;this.pendingConfirm=null,this.haptics.shatterPlate(),this.audio.playSfx("glass_shatter"),y==="DELETE"?(i.onDeleteSlot(f),this.statusBanner={text:`🗑 Deleted Slot ${f}.`,isError:!1}):(i.onResetSlotToStart(f),this.statusBanner={text:`↺ Reset Slot ${f} to Act 0 Geneva Start.`,isError:!1}),n()})})};n(),s.addEventListener("click",r=>{r.target===s&&(this.close(),i.onClose?.())}),this.boundKeyDown=r=>{const a=document.activeElement?.tagName.toUpperCase();a==="INPUT"||a==="TEXTAREA"||r.key==="Escape"&&(r.preventDefault(),this.close(),i.onClose?.())},window.addEventListener("keydown",this.boundKeyDown),document.body.appendChild(s),this.modalEl=s}close(){this.boundKeyDown&&(window.removeEventListener("keydown",this.boundKeyDown),this.boundKeyDown=null),this.modalEl&&(this.modalEl.remove(),this.modalEl=null)}}const Ue=Object.freeze(Object.defineProperty({__proto__:null,CampaignSaveSlotsModal:He},Symbol.toStringTag,{value:"Module"}));export{Fe as B,Ue as C,Ae as W,Te as d};
