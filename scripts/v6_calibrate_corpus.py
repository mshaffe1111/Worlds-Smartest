#!/usr/bin/env python3
"""
World's Smartest v6.0 — 1.27M+ Corpus Psychometric Calibration Pipeline
======================================================================
Scans ALL 28 shard files in `public/data/shards/*.json` + `questions.json` +
`gold_venue_packs.json` + `jeopardy_signature_packs.json` +
`visual_globe_packs.json` + `curated_v4_witty_pack.json` (plus optional
`public/data/v6/prime_time_witty_clues_v6.json`).

Computes 5-algorithm psychometric household-fame (`fameScore` in [0.0, 1.0])
and continuous calibrated difficulty (`difficultyScore` in [1.0, 10.0]) across
all 1,279,399+ playable clues, allocates exact bijective dense QIDs inside the
163,840-byte (1,310,720-bit) bitset ledger, and outputs the ultra-compact
<50ms startup index `public/data/v6/shard_fame_difficulty_index.json`.
"""

from __future__ import annotations

import datetime as dt
import glob
import json
import math
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Set, Tuple

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "public" / "data"
SHARDS_DIR = DATA_DIR / "shards"
OUT_INDEX_PATH = DATA_DIR / "v6" / "shard_fame_difficulty_index.json"

BITSET_BYTES = 163_840
BITSET_CAPACITY_BITS = BITSET_BYTES * 8  # 1,310,720 exact bits
PRIME_TIME_QID_MIN = 1_280_000
PRIME_TIME_QID_MAX = 1_282_999
SYNTHESIS_PER_DOMAIN = 4_200  # 12 * 4,200 = 50,400 deterministic multi-row clues

# Quarantined Tier-1 QIDs & benchmark slop range matching ShardDecoder.ts
BENCHMARK_SLOP_QID_MIN = 4_965
BENCHMARK_SLOP_QID_MAX = 20_165
QUARANTINED_TIER1_QIDS: Set[int] = {
    983, 1167, 1333, 1547, 1850, 2769, 3639, 3852, 3885, 6624, 9578, 10522, 13680
}

RE_EXAM_SLOP = re.compile(
    r"\b(?:which of the following|all of the following except|none of the above|"
    r"all of the above|which statement best|which option best|which sentence best|"
    r"select the correct statement|choose the correct option|the best answer is|"
    r"identify the verified entity|statement 1\s*\||statement 2\s*\|)\b",
    re.I,
)
RE_FILL_BLANK = re.compile(r"_{3,}|\[\s*blank\s*\]|\(\s*blank\s*\)", re.I)
RE_ARC_SLOP = re.compile(
    r"^(?:jerry|marta|sally|tommy|timmy|billy|bobby|suzy|susie|maria|carlos|jamal|"
    r"keisha|a student|a teacher|a class|four students|two students|three students|"
    r"a group of students|some students|a boy|a girl|a scientist is studying|"
    r"a researcher wants)\b",
    re.I,
)
RE_MMLU_MATH = re.compile(
    r"\b(?:find the derivative|evaluate the integral|characteristic of the ring|"
    r"homomorphism from|sylow subgroup|abelian group of order|dy/dx)\b|\\(?:frac|int|sum|lim|sqrt)\b",
    re.I,
)
RE_CATALOG_ENTITY = re.compile(
    r"^(?:HD|HIP|GJ|K2|KOI|TOI|WASP|HAT-?P|OGLE|Kepler|TRAPPIST|PSR|CoRoT|LHS|WD|"
    r"NGC|IC|UGC|PGC|MACS|Abell|SDSS|2MASS|Gliese|Ross|Wolf|BD|CD|CPD|HR|PSO|CFBDS|"
    r"WISE|DENIS|EPIC|TIC|Gaia|MOA|KELT|QATAR|HATS|TrES|XO|SWEEPS|OTV|Kosmos|Cosmos|USA)[-+\s]?\d",
    re.I,
)
RE_BINOMIAL_LATIN = re.compile(
    r"\b[A-Z][a-z]{3,}\s+[a-z]{4,}(?:us|is|ae|um|ii|ensis|oides|ata|atus|ina)\b"
)
RE_SPECIALIST_JARGON = re.compile(
    r"\b(?:homomorphism|isomorphism|eigenvalue|hamiltonian|lagrangian|cohomology|"
    r"manifold|stoichiometr\w*|enantiomer|stereoisomer|nucleophilic|epistemolog\w*|"
    r"phenomenolog\w*|hermeneutic\w*|deontolog\w*|jurisprud\w*|certiorari|usufruct|"
    r"phylogenetic|bryophyte|gymnosperm|angiosperm|echinoderm|baryon|fermion|boson|"
    r"allosteric|chiaroscuro|sfumato|contrapposto|entablature|pendentive|merovingian|"
    r"carolingian|achaemenid|seleucid|ptolemaic|sassanid|abbasid|umayyad|habsburg|"
    r"hohenzollern|plantagenet|westphalia|tordesillas|sabermetric\w*|diophantine|"
    r"totient|riemannian|stochastic|dihydro\w+|tetra\w+ate|methyl\w+ine|hydroxy\w+)\b",
    re.I,
)
RE_ASCII_CLEAN = re.compile(r"^[A-Za-z0-9\s\-'&.,!?/:()]+$")

# ============================================================================
# ALGORITHM 2: TIER-A & TIER-B HOUSEHOLD CULTURAL CANON (~1,400+ GLOBAL ICONS)
# ============================================================================

TIER_A_COUNTRIES: Set[str] = {
    "united states", "united kingdom", "france", "italy", "japan", "china", "india",
    "brazil", "canada", "mexico", "australia", "germany", "spain", "greece", "egypt",
    "russia", "south korea", "switzerland", "ireland", "sweden", "norway", "netherlands",
    "portugal", "argentina", "thailand", "turkey", "south africa", "new zealand",
    "iceland", "peru", "cuba", "jamaica", "kenya", "morocco", "israel", "poland",
    "austria", "belgium", "denmark", "finland", "vietnam", "philippines", "singapore",
    "scotland", "england", "colombia", "chile", "saudi arabia", "indonesia",
}

TIER_A_CITIES: Set[str] = {
    "paris", "london", "tokyo", "new york", "new york city", "rome", "los angeles",
    "chicago", "sydney", "cairo", "athens", "venice", "barcelona", "madrid", "berlin",
    "amsterdam", "dubai", "hong kong", "singapore", "seoul", "beijing", "shanghai",
    "mumbai", "bangkok", "istanbul", "moscow", "toronto", "vancouver", "mexico city",
    "rio de janeiro", "buenos aires", "san francisco", "miami", "las vegas", "boston",
    "seattle", "washington", "washington, d.c.", "new orleans", "hollywood", "orlando",
    "honolulu", "dublin", "edinburgh", "vienna", "prague", "florence", "milan", "naples",
    "lisbon", "zurich", "geneva", "stockholm", "oslo", "copenhagen", "reykjavik",
    "jerusalem", "nairobi", "cape town", "casablanca", "havana", "lima", "kyoto",
    "osaka", "melbourne", "auckland", "montreal", "philadelphia", "atlanta", "dallas",
    "houston", "denver", "detroit", "nashville", "austin", "phoenix", "san diego",
    "brooklyn", "manhattan", "munich", "hamburg", "brussels", "warsaw", "budapest",
    "monaco", "monte carlo", "st. petersburg", "delhi", "new delhi", "manila", "jakarta",
    "taipei", "macau", "cancun", "sao paulo", "bogota", "santiago", "johannesburg",
}

TIER_A_LANDMARKS_GEO: Set[str] = {
    "eiffel tower", "statue of liberty", "colosseum", "taj mahal", "great wall of china",
    "machu picchu", "pyramids of giza", "great pyramid of giza", "stonehenge", "big ben",
    "sydney opera house", "empire state building", "golden gate bridge", "white house",
    "mount everest", "mount fuji", "mount kilimanjaro", "mount vesuvius", "matterhorn",
    "mount olympus", "mount rushmore", "grand canyon", "niagara falls", "sahara",
    "amazon river", "nile", "mississippi river", "thames", "danube", "yangtze river",
    "yellow river", "colorado river", "rio grande", "ganges", "rhine", "seine",
    "louvre", "acropolis", "parthenon", "petra", "angkor wat", "sagrada familia",
    "leaning tower of pisa", "notre-dame", "buckingham palace", "tower of london",
    "westminster abbey", "sistine chapel", "st. peter's basilica", "burj khalifa",
    "christ the redeemer", "chichen itza", "easter island", "galapagos islands",
    "great barrier reef", "yellowstone", "yosemite", "alcatraz", "hollywood sign",
    "times square", "central park", "brooklyn bridge", "london bridge", "tower bridge",
    "hagia sophia", "kremlin", "forbidden city", "alhambra", "versailles", "pompeii",
    "sphinx", "space needle", "cn tower", "gateway arch", "lincoln memorial", "pentagon",
    "capitol", "brandenburg gate", "neuschwanstein", "trevi fountain", "pantheon",
    "mount blanc", "mont blanc", "denali", "k2", "mount rainier", "mount st. helens",
    "mount etna", "krakatoa", "lake victoria", "lake superior", "dead sea", "loch ness",
    "panama canal", "suez canal", "bermuda triangle", "madagascar", "greenland",
    "iceland", "hawaii", "crete", "sicily", "bali", "bora bora", "maldives", "everglades",
}

TIER_A_POP_MEDIA: Set[str] = {
    # Blockbuster Films
    "star wars", "titanic", "jurassic park", "the lion king", "toy story", "pulp fiction",
    "back to the future", "the matrix", "forrest gump", "jaws", "e.t.", "e.t. the extra-terrestrial",
    "the godfather", "frozen", "finding nemo", "avatar", "the wizard of oz", "the dark knight",
    "home alone", "ghostbusters", "rocky", "indiana jones", "raiders of the lost ark",
    "the shawshank redemption", "the silence of the lambs", "schindler's list", "gladiator",
    "inception", "interstellar", "shrek", "aladdin", "beauty and the beast", "cinderella",
    "snow white", "pinocchio", "bambi", "dumbo", "peter pan", "the little mermaid",
    "up", "wall-e", "ratatouille", "the incredibles", "monsters, inc.", "inside out",
    "coco", "moana", "encanto", "barbie", "oppenheimer", "avengers", "iron man",
    "spider-man", "batman", "superman", "black panther", "harry potter", "the lord of the rings",
    "casablanca", "citizen kane", "psycho", "the shining", "alien", "blade runner",
    "terminator", "the terminator", "die hard", "top gun", "grease", "dirty dancing",
    "ferris bueller's day off", "the breakfast club", "the princess bride", "mean girls",
    "legally blonde", "clueless", "elf", "the grinch", "it's a wonderful life",
    "pirates of the caribbean", "fight club", "goodfellas", "scarface", "taxi driver",
    "the truman show", "groundhog day", "men in black", "independence day", "twister",
    "apollo 13", "saving private ryan", "braveheart", "the sixth sense", "get out",
    "parasite", "spirited away", "my neighbor totoro", "la la land", "whiplash",
    # Music / Bands / Songs / Albums
    "the beatles", "michael jackson", "queen", "elvis presley", "taylor swift", "madonna",
    "the rolling stones", "nirvana", "abba", "bob marley", "beyonce", "beyoncé", "adele",
    "elton john", "david bowie", "prince", "whitney houston", "mariah carey", "stevie wonder",
    "frank sinatra", "johnny cash", "bob dylan", "bruce springsteen", "led zeppelin",
    "pink floyd", "ac/dc", "metallica", "u2", "coldplay", "radiohead", "fleetwood mac",
    "eagles", "the beach boys", "the doors", "jimi hendrix", "aretha franklin", "ray charles",
    "louis armstrong", "miles davis", "lady gaga", "rihanna", "drake", "eminem", "tupac",
    "kanye west", "bruno mars", "ed sheeran", "justin bieber", "ariana grande", "billie eilish",
    "bts", "daft punk", "red hot chili peppers", "green day", "foo fighters", "oasis",
    "bon jovi", "guns n' roses", "aerosmith", "kiss", "bee gees", "jackson 5", "spice girls",
    "backstreet boys", "destiny's child", "thriller", "abbey road", "sgt. pepper's lonely hearts club band",
    "the dark side of the moon", "rumours", "back in black", "nevermind", "purple rain",
    "bohemian rhapsody", "beat it", "billie jean", "imagine", "yesterday", "hey jude",
    "let it be", "stairway to heaven", "hotel california", "smells like teen spirit",
    "sweet child o' mine", "like a rolling stone", "respect", "what a wonderful world",
    "dancing queen", "gangnam style", "despacito", "shape of you", "uptown funk",
    "rolling in the deep", "shake it off", "bad guy", "blinding lights", "take on me",
    "don't stop believin'", "livin' on a prayer", "we will rock you", "we are the champions",
    "i will always love you", "my heart will go on", "all i want for christmas is you",
    "smooth criminal", "purple haze", "born in the u.s.a.", "africa", "eye of the tiger",
    # TV Shows
    "the simpsons", "friends", "seinfeld", "game of thrones", "the office", "breaking bad",
    "stranger things", "spongebob squarepants", "jeopardy!", "sesame street", "star trek",
    "the big bang theory", "doctor who", "saturday night live", "the twilight zone",
    "i love lucy", "m*a*s*h", "cheers", "frasier", "the sopranos", "the wire", "lost",
    "grey's anatomy", "er", "law & order", "csi", "ncis", "survivor", "american idol",
    "wheel of fortune", "the price is right", "family feud", "south park", "family guy",
    "futurama", "rick and morty", "avatar: the last airbender", "pokemon", "pokémon",
    "scooby-doo", "tom and jerry", "looney tunes", "the flintstones", "the jetsons",
    "the crown", "squid game", "the mandalorian", "ted lasso", "parks and recreation",
    "brooklyn nine-nine", "modern family", "how i met your mother", "arrested development",
    "buffy the vampire slayer", "the x-files", "twin peaks", "baywatch", "full house",
    "the fresh prince of bel-air", "golden girls", "the golden girls", "sherlock",
    "downton abbey", "peaky blinders", "black mirror", "wednesday", "bridgerton",
    # Iconic Actors / Directors
    "walt disney", "steven spielberg", "alfred hitchcock", "charlie chaplin", "marilyn monroe",
    "audrey hepburn", "tom hanks", "meryl streep", "leonardo dicaprio", "brad pitt",
    "tom cruise", "will smith", "morgan freeman", "denzel washington", "robert de niro",
    "al pacino", "jack nicholson", "harrison ford", "arnold schwarzenegger", "sylvester stallone",
    "bruce lee", "jackie chan", "robin williams", "jim carrey", "eddie murphy", "oprah winfrey",
    "dwayne johnson", "scarlett johansson", "jennifer lawrence", "emma watson", "keanu reeves",
    "johnny depp", "samuel l. jackson", "clint eastwood", "quentin tarantino", "christopher nolan",
    "martin scorsese", "james cameron", "george lucas", "stanley kubrick", "tim burton",
    "bing crosby", "fred astaire", "judy garland", "elizabeth taylor", "humphrey bogart",
}

TIER_A_FOOD_BRANDS: Set[str] = {
    # Everyday Food & Drink
    "pizza", "sushi", "sandwich", "taco", "pasta", "hamburger", "burger", "croissant",
    "chocolate", "coffee", "tea", "ice cream", "ramen", "curry", "waffle", "pancake",
    "doughnut", "donut", "bagel", "pretzel", "popcorn", "french fries", "hot dog",
    "spaghetti", "lasagna", "risotto", "gelato", "tiramisu", "paella", "tapas", "churro",
    "burrito", "quesadilla", "guacamole", "salsa", "nachos", "enchilada", "falafel",
    "hummus", "kebab", "baklava", "pad thai", "pho", "dim sum", "dumpling", "kimchi",
    "bibimbap", "tempura", "teriyaki", "udon", "miso soup", "butter chicken", "naan",
    "samosa", "biryani", "dosa", "poutine", "maple syrup", "fish and chips", "shepherd's pie",
    "baguette", "crepe", "crêpe", "quiche", "ratatouille", "fondue", "schnitzel", "bratwurst",
    "sauerkraut", "goulash", "pierogi", "borscht", "ceviche", "empanada", "feijoada",
    "jollof rice", "chowder", "gumbo", "barbecue", "apple pie", "cheesecake", "brownie",
    "cookie", "cupcake", "macaron", "espresso", "cappuccino", "latte", "matcha", "champagne",
    "wine", "beer", "whiskey", "tequila", "rum", "vodka", "sake", "lemonade", "cider",
    "cheese", "cheddar", "mozzarella", "parmesan", "brie", "feta", "bread", "rice", "honey",
    "cinnamon", "vanilla", "garlic", "ginger", "basil", "black pepper", "saffron", "olive oil",
    "avocado", "banana", "apple", "orange", "strawberry", "watermelon", "pineapple", "mango",
    "potato", "tomato", "corn", "peanut", "almond", "coconut",
    # Household Global Brands & Tech Giants
    "coca-cola", "pepsi", "mcdonald's", "starbucks", "nike", "adidas", "puma", "apple",
    "apple inc.", "google", "microsoft", "amazon", "netflix", "disney", "sony", "nintendo",
    "samsung", "toyota", "honda", "ford", "ferrari", "lamborghini", "porsche", "bmw",
    "mercedes-benz", "volkswagen", "audi", "volvo", "tesla", "boeing", "airbus", "nasa",
    "spacex", "lego", "ikea", "rolex", "omega", "gucci", "prada", "chanel", "louis vuitton",
    "hermes", "hermès", "dior", "versace", "armani", "burberry", "tiffany", "cartier",
    "levi's", "gap", "zara", "h&m", "walmart", "target", "costco", "fedex", "ups", "visa",
    "mastercard", "paypal", "intel", "nvidia", "ibm", "oracle", "adobe", "meta", "facebook",
    "instagram", "youtube", "tiktok", "spotify", "uber", "airbnb", "ebay", "canon", "nikon",
    "kodak", "xerox", "hp", "dell", "lenovo", "siemens", "philips", "bosch", "nestle",
    "nestlé", "kraft", "heinz", "kellogg's", "hershey", "mars", "oreo", "nutella", "red bull",
    "kfc", "burger king", "subway", "domino's", "pizza hut", "taco bell", "dunkin'",
    "harley-davidson", "vespa", "jeep", "chevrolet", "cadillac", "rolls-royce", "bentley",
    "aston martin", "jaguar", "subaru", "nissan", "mazda", "hyundai", "kia", "ducati",
    "ford model t", "boeing 747", "boeing 777", "airbus a380", "concorde", "volkswagen beetle",
    "iphone", "ipad", "playstation", "xbox", "game boy", "atari", "windows", "linux",
    "android", "python", "javascript", "java", "c++", "bitcoin", "wikipedia", "bluetooth", "wi-fi",
}

TIER_A_SPORTS_GAMES: Set[str] = {
    "michael jordan", "lebron james", "kobe bryant", "stephen curry", "shaquille o'neal",
    "magic johnson", "larry bird", "kareem abdul-jabbar", "serena williams", "venus williams",
    "roger federer", "rafael nadal", "novak djokovic", "usain bolt", "michael phelps",
    "simone biles", "lionel messi", "cristiano ronaldo", "pelé", "pele", "diego maradona",
    "david beckham", "neymar", "kylian mbappé", "zinedine zidane", "muhammad ali", "mike tyson",
    "floyd mayweather", "tiger woods", "jack nicklaus", "arnold palmer", "babe ruth",
    "jackie robinson", "hank aaron", "willie mays", "lou gehrig", "mickey mantle", "ted williams",
    "joe dimaggio", "derek jeter", "barry bonds", "ken griffey", "ken griffey jr.", "shohei ohtani",
    "mike trout", "nolan ryan", "sandy koufax", "randy johnson", "tom brady", "peyton manning",
    "joe montana", "patrick mahomes", "jerry rice", "wayne gretzky", "sidney crosby",
    "tony hawk", "lewis hamilton", "michael schumacher", "ayrton senna", "max verstappen",
    "lance armstrong", "jesse owens", "jim thorpe", "nadia comaneci", "shaun white",
    "new york yankees", "yankees", "boston red sox", "red sox", "los angeles dodgers", "dodgers",
    "chicago cubs", "cubs", "los angeles lakers", "lakers", "chicago bulls", "bulls",
    "boston celtics", "celtics", "golden state warriors", "dallas cowboys", "green bay packers",
    "new england patriots", "kansas city chiefs", "manchester united", "manchester united f.c.",
    "liverpool", "liverpool f.c.", "real madrid", "fc barcelona", "barcelona", "juventus",
    "juventus fc", "bayern munich", "arsenal", "chelsea", "ac milan", "paris saint-germain",
    "fenway park", "wrigley field", "yankee stadium", "madison square garden", "wembley stadium",
    "maracanã stadium", "camp nou", "old trafford", "lambeau field", "churchill downs",
    "super mario", "super mario bros.", "pac-man", "tetris", "minecraft", "fortnite",
    "grand theft auto", "the legend of zelda", "zelda", "pokemon", "pokémon", "pong",
    "sonic the hedgehog", "donkey kong", "space invaders", "street fighter", "mortal kombat",
    "call of duty", "halo", "mario kart", "animal crossing", "the sims", "world of warcraft",
    "league of legends", "overwatch", "doom", "final fantasy", "god of war", "skyrim",
    "candy crush saga", "angry birds", "among us", "roblox", "chess", "monopoly", "scrabble",
}

TIER_A_ANIMALS_NATURE: Set[str] = {
    "lion", "tiger", "elephant", "african elephant", "asian elephant", "giraffe", "zebra",
    "hippopotamus", "nile hippopotamus", "rhinoceros", "cheetah", "leopard", "jaguar", "panther",
    "wolf", "gray wolf", "fox", "red fox", "bear", "brown bear", "grizzly bear", "polar bear",
    "giant panda", "panda", "koala", "kangaroo", "platypus", "gorilla", "chimpanzee", "orangutan",
    "baboon", "monkey", "sloth", "raccoon", "squirrel", "beaver", "otter", "hedgehog", "deer",
    "moose", "camel", "llama", "alpaca", "horse", "donkey", "cow", "pig", "sheep", "goat",
    "dog", "cat", "rabbit", "hamster", "mouse", "rat", "bat", "whale", "blue whale", "humpback whale",
    "orca", "killer whale", "dolphin", "bottlenose dolphin", "seal", "sea lion", "walrus", "manatee",
    "shark", "great white shark", "hammerhead shark", "whale shark", "stingray", "octopus", "squid",
    "jellyfish", "starfish", "seahorse", "clownfish", "salmon", "tuna", "goldfish", "piranha",
    "crab", "lobster", "shrimp", "sea turtle", "tortoise", "crocodile", "alligator", "iguana",
    "chameleon", "gecko", "komodo dragon", "cobra", "king cobra", "python", "anaconda", "rattlesnake",
    "frog", "toad", "salamander", "axolotl", "eagle", "bald eagle", "hawk", "falcon", "peregrine falcon",
    "owl", "penguin", "emperor penguin", "flamingo", "ostrich", "common ostrich", "peacock",
    "parrot", "macaw", "toucan", "hummingbird", "swan", "duck", "goose", "pelican", "seagull",
    "crow", "raven", "pigeon", "robin", "sparrow", "house sparrow", "woodpecker", "albatross",
    "vulture", "kiwi", "dodo", "honeybee", "bee", "bumblebee", "butterfly", "monarch butterfly",
    "ladybug", "dragonfly", "ant", "spider", "tarantula", "black widow", "scorpion", "mosquito",
    "firefly", "grasshopper", "cricket", "praying mantis", "caterpillar", "earthworm", "snail",
    "beagle", "bulldog", "chihuahua", "golden retriever", "labrador retriever", "poodle",
    "german shepherd", "dalmatian", "siberian husky", "husky", "corgi", "dachshund", "pug",
    "boxer", "rottweiler", "doberman", "collie", "border collie", "greyhound", "great dane",
    "st. bernard", "shiba inu", "yorkshire terrier", "cocker spaniel", "siamese", "persian",
    "oak", "pine", "maple", "redwood", "sequoia", "bamboo", "cactus", "rose", "tulip",
    "sunflower", "daisy", "orchid", "lily", "lavender", "venus flytrap", "dandelion", "clover",
}

TIER_A_SCIENCE_ARTS_LIT_HIST: Set[str] = {
    # Elements & Everyday Science
    "hydrogen", "helium", "lithium", "carbon", "nitrogen", "oxygen", "fluorine", "neon",
    "sodium", "magnesium", "aluminum", "aluminium", "silicon", "phosphorus", "sulfur", "chlorine",
    "argon", "potassium", "calcium", "titanium", "iron", "nickel", "copper", "zinc", "silver",
    "tin", "iodine", "tungsten", "platinum", "gold", "mercury", "lead", "radium", "uranium", "plutonium",
    "water", "carbon dioxide", "methane", "ammonia", "ozone", "glucose", "ethanol", "salt",
    "sodium chloride", "sulfuric acid", "hydrochloric acid", "baking soda", "aspirin", "caffeine",
    "penicillin", "insulin", "dna", "chlorophyll", "diamond", "quartz", "iron oxide",
    "venus", "earth", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto", "sun", "moon",
    "milky way", "andromeda galaxy", "halley's comet", "orion", "big dipper", "pleiades",
    "apollo 11", "apollo 13", "voyager 1", "voyager 2", "sputnik 1", "vostok 1", "hubble",
    "james webb", "international space station", "curiosity", "perseverance", "challenger",
    "albert einstein", "isaac newton", "charles darwin", "marie curie", "galileo galilei",
    "galileo", "thomas edison", "nikola tesla", "stephen hawking", "louis pasteur",
    "alexander fleming", "alexander graham bell", "wright brothers", "benjamin franklin",
    "archimedes", "pythagoras", "alan turing", "ada lovelace", "jane goodall", "carl sagan",
    "neil armstrong", "buzz aldrin", "yuri gagarin", "sally ride", "katherine johnson",
    "alfred nobel", "johannes gutenberg", "gregor mendel", "sigmund freud", "aristotle",
    # Art, Books, Characters, Myth
    "mona lisa", "the starry night", "starry night", "the last supper", "the scream",
    "girl with a pearl earring", "the birth of venus", "guernica", "the persistence of memory",
    "american gothic", "the kiss", "water lilies", "nighthawks", "david", "the thinker",
    "venus de milo", "sistine chapel ceiling", "the great wave off kanagawa", "whistler's mother",
    "leonardo da vinci", "pablo picasso", "vincent van gogh", "michelangelo", "claude monet",
    "salvador dalí", "salvador dali", "rembrandt", "andy warhol", "frida kahlo", "banksy",
    "wolfgang amadeus mozart", "mozart", "ludwig van beethoven", "beethoven", "johann sebastian bach",
    "bach", "frédéric chopin", "chopin", "pyotr ilyich tchaikovsky", "tchaikovsky", "antonio vivaldi",
    "vivaldi", "william shakespeare", "charles dickens", "jane austen", "mark twain",
    "ernest hemingway", "f. scott fitzgerald", "george orwell", "j. r. r. tolkien", "j. k. rowling",
    "stephen king", "agatha christie", "arthur conan doyle", "edgar allan poe", "mary shelley",
    "bram stoker", "lewis carroll", "roald dahl", "dr. seuss", "hans christian andersen",
    "homer", "dante alighieri", "victor hugo", "leo tolstoy", "fyodor dostoevsky", "jules verne",
    "h. g. wells", "harper lee", "john steinbeck", "louisa may alcott", "herman melville",
    "the hobbit", "the little prince", "animal farm", "1984", "pride and prejudice",
    "romeo and juliet", "hamlet", "macbeth", "a midsummer night's dream", "the great gatsby",
    "to kill a mockingbird", "the catcher in the rye", "moby-dick", "frankenstein", "dracula",
    "alice's adventures in wonderland", "the odyssey", "the iliad", "don quixote",
    "les misérables", "war and peace", "crime and punishment", "the adventures of huckleberry finn",
    "the adventures of tom sawyer", "a christmas carol", "oliver twist", "the grapes of wrath",
    "of mice and men", "charlotte's web", "the cat in the hat", "green eggs and ham",
    "charlie and the chocolate factory", "the chronicles of narnia", "the hunger games",
    "the da vinci code", "the lord of the rings", "treasure island", "robinson crusoe",
    "sherlock holmes", "homer simpson", "marge simpson", "bart simpson", "lisa simpson",
    "mickey mouse", "donald duck", "bugs bunny", "winnie-the-pooh", "snoopy", "charlie brown",
    "james bond", "robin hood", "king arthur", "merlin", "santa claus", "tarzan", "zorro",
    "zeus", "poseidon", "hades", "athena", "apollo", "artemis", "aphrodite", "ares", "hermes",
    "hera", "hercules", "heracles", "achilles", "odysseus", "medusa", "pegasus", "minotaur",
    "cerberus", "phoenix", "thor", "odin", "loki", "valkyrie", "anubis", "ra", "osiris", "isis",
    "horus", "sphinx", "cupid", "atlas", "prometheus", "pandora", "icarus", "midas", "kraken",
    # History Anchors & Top Universities
    "julius caesar", "cleopatra", "alexander the great", "napoleon", "napoleon bonaparte",
    "abraham lincoln", "george washington", "thomas jefferson", "john f. kennedy",
    "franklin d. roosevelt", "theodore roosevelt", "martin luther king jr.", "rosa parks",
    "harriet tubman", "amelia earhart", "winston churchill", "queen elizabeth ii",
    "queen victoria", "henry viii", "joan of arc", "christopher columbus", "marco polo",
    "genghis khan", "mahatma gandhi", "nelson mandela", "mother teresa", "anne frank",
    "roman empire", "ancient egypt", "ancient greece", "ottoman empire", "british empire",
    "byzantine empire", "inca empire", "aztec empire", "mongol empire", "ming dynasty",
    "world war i", "world war ii", "american civil war", "american revolution", "french revolution",
    "cold war", "vietnam war", "korean war", "russian revolution", "industrial revolution",
    "renaissance", "magna carta", "declaration of independence", "berlin wall", "pearl harbor",
    "d-day", "battle of gettysburg", "battle of waterloo", "battle of thermopylae",
    "harvard university", "university of oxford", "university of cambridge", "stanford university",
    "massachusetts institute of technology", "yale university", "princeton university",
    "columbia university", "university of california, berkeley", "united nations", "red cross",
    "fifa", "olympic games", "nba", "nfl", "mlb", "nhl", "who", "unesco", "nato", "cia", "fbi",
}

ALL_HOUSEHOLD_CANON: Set[str] = (
    TIER_A_COUNTRIES
    | TIER_A_CITIES
    | TIER_A_LANDMARKS_GEO
    | TIER_A_POP_MEDIA
    | TIER_A_FOOD_BRANDS
    | TIER_A_SPORTS_GAMES
    | TIER_A_ANIMALS_NATURE
    | TIER_A_SCIENCE_ARTS_LIT_HIST
)

ICONIC_YEARS: Set[int] = {
    79, 1066, 1215, 1492, 1776, 1789, 1865, 1903, 1912, 1914, 1918,
    1929, 1939, 1945, 1947, 1955, 1963, 1969, 1977, 1980, 1989, 1991, 1994, 2000, 2001, 2007,
}

# ============================================================================
# ALGORITHM 5: TABLE ACCESSIBILITY CURRICULUM & STAGE ELIGIBILITY BITMASK
# stageMask: bit s (0..9) allows Stage (s+1).
#   Bit 0 (0x001) = Stage 01 WARMUP (★ 1.0-1.9)
#   Bit 1 (0x002) = Stage 02 EASY   (★ 2.0-2.9)
#   ...
#   Bit 9 (0x200) = Stage 10 LEGEND (★ 9.0-10.0)
# Tuple: (catFloor01, minStar, maxStar, minStage1to10, humanCategoryLabel)
# ============================================================================

TABLE_CURRICULUM: Dict[str, Tuple[float, float, float, int, str]] = {
    # Domain 0 — History (Strictly block arcane battles/deep medieval from Stage 01!)
    "hist_battle":           (0.62, 4.2, 9.8, 4, "HISTORIC BATTLES"),
    "hist_empire":           (0.28, 1.5, 9.5, 1, "WORLD EMPIRES"),
    "hist_figure":           (0.45, 2.2, 9.6, 2, "HISTORY ICONS"),
    "hist_war":              (0.48, 3.0, 9.6, 3, "TURNING POINTS"),
    "sub_hist_arch_site":    (0.24, 1.3, 9.5, 1, "ANCIENT WONDERS"),
    "sub_hist_dynasty":      (0.58, 4.5, 9.8, 5, "ROYAL DYNASTIES"),
    "sub_hist_figures_deep": (0.76, 6.8, 9.9, 7, "DEEP ARCHIVES"),
    # Domain 1 — Science & Space
    "sci_element":           (0.18, 1.1, 9.2, 1, "PERIODIC TABLE"),
    "sci_space":             (0.20, 1.2, 9.0, 1, "SPACEFLIGHT"),
    "sci_scientist":         (0.38, 1.5, 9.6, 1, "SCIENCE PIONEERS"),
    "sci_chemical":          (0.48, 1.4, 9.8, 1, "EVERYDAY CHEMISTRY"),
    "sci_astro":             (0.54, 2.5, 9.8, 3, "DEEP SPACE"),
    "sci_exoplanet":         (0.84, 7.6, 10.0, 8, "EXOPLANETS"),
    "sub_sci_exo_deep":      (0.90, 8.4, 10.0, 9, "EXOPLANETS"),
    "sub_sci_laureate":      (0.58, 4.8, 9.7, 5, "NOBEL LAUREATES"),
    "sub_sci_solar_body":    (0.72, 6.2, 9.9, 7, "SOLAR SYSTEM"),
    # Domain 2 — Geography & World Atlas
    "geo_city":              (0.16, 1.0, 9.4, 1, "WORLD CITIES"),
    "geo_mountain":          (0.22, 1.2, 9.5, 1, "FAMOUS PEAKS"),
    "geo_river":             (0.24, 1.2, 9.5, 1, "GREAT RIVERS"),
    "geo_wonder":            (0.18, 1.1, 9.3, 1, "NATURAL WONDERS"),
    "sub_geo_us_city":       (0.18, 1.1, 9.0, 1, "U.S. ATLAS"),
    "geo_airport":           (0.48, 3.0, 9.6, 3, "AIRPORT CODES"),
    "sub_geo_city_deep":     (0.76, 6.8, 9.9, 7, "REMOTE ATLAS"),
    # Domain 3 — Arts, Landmarks & Music
    "art_landmark":          (0.14, 1.0, 9.3, 1, "WORLD LANDMARKS"),
    "art_work":              (0.18, 1.1, 9.5, 1, "FAMOUS ART"),
    "sub_art_museum":        (0.22, 1.2, 9.4, 1, "MUSEUM GEMS"),
    "sub_art_style":         (0.24, 1.3, 9.4, 1, "ARCHITECTURE"),
    "art_creator":           (0.44, 2.6, 9.6, 3, "MASTER ARTISTS"),
    "sub_art_classical":     (0.46, 2.8, 9.6, 3, "CLASSICAL MUSIC"),
    # Domain 4 — Pop Culture, Movies, Music & TV (STAGE 01 CROWD-PLEASERS!)
    "pop_film":              (0.10, 1.0, 8.8, 1, "BLOCKBUSTER MOVIES"),
    "pop_song":              (0.10, 1.0, 8.9, 1, "HIT SONGS"),
    "pop_band":              (0.10, 1.0, 8.9, 1, "ICONIC BANDS"),
    "pop_tv":                (0.12, 1.0, 8.9, 1, "PRIME-TIME TV"),
    "pop_album":             (0.16, 1.1, 9.2, 1, "CLASSIC ALBUMS"),
    "sub_pop_actor":         (0.14, 1.0, 9.0, 1, "SCREEN STARS"),
    # Domain 5 — Sports & Video Games
    "sport_athlete":         (0.14, 1.0, 9.1, 1, "SPORTS LEGENDS"),
    "sport_videogame":       (0.14, 1.0, 9.1, 1, "VIDEO GAMES"),
    "sport_club":            (0.20, 1.2, 9.2, 1, "SPORTS CLUBS"),
    "sport_stadium":         (0.22, 1.2, 9.3, 1, "FAMOUS STADIUMS"),
    "sub_vg_genre":          (0.16, 1.1, 9.0, 1, "GAMING CLASSICS"),
    "sub_bb_ballpark":       (0.24, 1.3, 8.8, 1, "CLASSIC BALLPARKS"),
    "sub_bb_slugger":        (0.26, 1.5, 9.2, 1, "BASEBALL LEGENDS"),
    "sub_bb_world_series":   (0.38, 2.8, 9.0, 3, "WORLD SERIES"),
    "sub_bb_signature_lore": (0.34, 2.4, 8.9, 3, "BASEBALL LORE"),
    "sub_bb_awards_hof":     (0.46, 3.4, 9.2, 4, "HALL OF FAME"),
    "sub_bb_pitcher":        (0.44, 3.2, 9.4, 4, "DIAMOND ACES"),
    "sub_bb_hits_rbi":       (0.48, 3.6, 9.5, 4, "BASEBALL STATS"),
    "sub_bb_season_feat":    (0.52, 4.0, 9.4, 4, "SINGLE-SEASON RECORDS"),
    "sub_pro_player":        (0.46, 3.2, 9.5, 4, "PRO ROSTERS"),
    # Domain 6 — Tech & Everyday Inventions
    "tech_company":          (0.12, 1.0, 9.0, 1, "TECH & BRANDS"),
    "tech_vehicle":          (0.18, 1.1, 9.2, 1, "ICONIC MACHINES"),
    "sub_tech_aero_year":    (0.20, 1.2, 9.2, 1, "WHEELS & WINGS"),
    "tech_software":         (0.34, 2.2, 9.4, 3, "TECH MILESTONES"),
    "tech_pioneer":          (0.46, 3.0, 9.6, 3, "INVENTORS"),
    "sub_tech_format":       (0.54, 4.2, 9.6, 5, "DIGITAL PROTOCOLS"),
    # Domain 7 — Animals & Nature
    "nat_species":           (0.16, 1.0, 9.6, 1, "FAMOUS ANIMALS"),
    "sub_nat_breed":         (0.14, 1.0, 9.0, 1, "PET BREEDS"),
    "sub_nat_iucn":          (0.52, 4.2, 9.6, 5, "WILDLIFE WATCH"),
    # Domain 8 — World Nations, Society & Culture
    "soc_country":           (0.16, 1.0, 8.8, 1, "WORLD CAPITALS"),
    "soc_university":        (0.24, 1.3, 9.3, 1, "FAMOUS CAMPUSES"),
    "soc_org":               (0.36, 2.4, 9.5, 3, "GLOBAL INSTITUTIONS"),
    "soc_leader":            (0.52, 3.8, 9.6, 4, "WORLD STATESMEN"),
    "sub_soc_party_leader":  (0.60, 4.8, 9.7, 5, "POLITICAL HISTORY"),
    "sub_soc_law":           (0.70, 6.0, 9.9, 6, "LANDMARK LAWS"),
    # Domain 9 — Food, Drink & Everyday Brands
    "food_item":             (0.10, 1.0, 9.2, 1, "WORLD FOOD"),
    "food_brand":            (0.12, 1.0, 9.2, 1, "HOUSEHOLD BRANDS"),
    "sub_food_ingred":       (0.16, 1.1, 9.2, 1, "KITCHEN CLASSICS"),
    "food_maker":            (0.44, 2.8, 9.5, 3, "DESIGN & CRAFT"),
    "sub_food_atelier":      (0.36, 2.2, 9.4, 3, "HERITAGE HOUSES"),
    # Domain 10 — Books, Characters & Mythology
    "sub_lit_char":          (0.12, 1.0, 8.5, 1, "ICONIC CHARACTERS"),
    "lit_work":              (0.16, 1.1, 9.4, 1, "FAMOUS BOOKS"),
    "lit_myth":              (0.18, 1.1, 9.3, 1, "MYTH & LEGEND"),
    "lit_author":            (0.40, 2.4, 9.6, 3, "FAMOUS AUTHORS"),
    "sub_lit_genre":         (0.34, 2.2, 9.4, 3, "BOOKSHELF HITS"),
    # Domain 11 — Math, Logic & Brainteasers (Keep Stage 01 Vaudeville fun, unlock Stage 04+)
    "math_person":           (0.56, 4.2, 9.7, 4, "MATH PIONEERS"),
    "math_num":              (0.52, 3.8, 9.6, 4, "NUMBER CRUNCH"),
    "math_word":             (0.54, 4.0, 9.6, 4, "CIPHERS & LOGIC"),
    "sub_math_spec_num":     (0.68, 5.8, 9.9, 6, "HIGHER MATH"),
    "sub_math_spec_word":    (0.66, 5.5, 9.9, 6, "LOGIC PUZZLES"),
}


def clamp(v: float, lo: float, hi: float) -> float:
    return lo if v < lo else (hi if v > hi else v)


def norm_key(text: Any) -> str:
    return re.sub(r"\s+", " ", str(text or "").strip().lower())


def difficulty_to_band(diff: float) -> int:
    """Maps continuous difficultyScore [1.0..10.0] into 10 equal 0.9-star Stage World bands (0..9):
    Band 0: ★ 1.0–1.9 (Stage 01), Band 1: ★ 1.9–2.8 (Stage 02), ..., Band 9: ★ 9.1–10.0 (Stage 10).
    """
    clamped = clamp(diff, 1.0, 10.0)
    if clamped <= 1.90:
        return 0
    if clamped >= 9.10:
        return 9
    return max(0, min(9, int(math.floor((clamped - 1.0) / 0.9))))


def stage_mask_from_min_stage(min_stage: int, max_stage: int = 10) -> int:
    mask = 0
    for s in range(max(1, min_stage), min(10, max_stage) + 1):
        mask |= 1 << (s - 1)
    return mask


def is_clean_curated_record(rec: Dict[str, Any]) -> bool:
    qid = int(rec.get("qid", 0))
    if qid in QUARANTINED_TIER1_QIDS:
        return False
    if BENCHMARK_SLOP_QID_MIN <= qid <= BENCHMARK_SLOP_QID_MAX:
        return False
    prompt = str(rec.get("prompt", "")).strip()
    if not prompt or len(prompt) < 10:
        return False
    if (
        RE_EXAM_SLOP.search(prompt)
        or RE_FILL_BLANK.search(prompt)
        or RE_ARC_SLOP.search(prompt)
        or RE_MMLU_MATH.search(prompt)
    ):
        return False
    return True


def check_canon_match(name: str, extra_text: str = "") -> float:
    """Algorithm 2: Entity-Fame Household Canon prior in [0.0, 1.0]."""
    n = norm_key(name)
    if not n:
        return 0.0
    if n in ALL_HOUSEHOLD_CANON:
        return 1.0
    # Strip leading "the " or trailing parenthetical
    n_clean = re.sub(r"^the\s+", "", re.sub(r"\s*\([^)]*\)$", "", n)).strip()
    if n_clean in ALL_HOUSEHOLD_CANON:
        return 0.96
    # Check multi-word phrase containment for prominent franchises/landmarks
    for tok in (n, n_clean):
        if len(tok) >= 5:
            # Fast check for well-known prefixes like "harry potter", "star wars", "super mario"
            for prefix in (
                "harry potter", "star wars", "lord of the rings", "indiana jones",
                "jurassic", "toy story", "super mario", "spider-man", "batman",
                "avengers", "pokémon", "pokemon", "grand theft auto", "legend of zelda",
                "mount everest", "mount fuji", "eiffel tower", "statue of liberty",
                "world war", "apollo ", "boeing 7", "airbus a", "ford ", "ferrari ",
                "chevrolet ", "porsche ", "lamborghini ", "coca-cola", "mcdonald",
                "walt disney", "pixar", "marvel", "simpsons",
            ):
                if prefix in tok:
                    return 0.88
    if extra_text:
        e = norm_key(extra_text)
        if e in TIER_A_COUNTRIES or e in TIER_A_CITIES:
            return 0.35
    return 0.0


def era_ubiquity_score(year_val: Optional[int], domain_id: int, table_type: str, canon_hit: float) -> float:
    """Algorithm 3: Dual-peaked cultural recency & anchor-island curve in [0.0, 1.0]."""
    if year_val is None or year_val == 0:
        return 0.55 if canon_hit < 0.5 else 0.85
    y = int(year_val)
    if y in ICONIC_YEARS:
        return 0.92
    # Pop culture / sports / tech / modern brands peak heavily in 1965-2025
    if domain_id in (4, 5, 6, 9):
        if 1970 <= y <= 2025:
            return 0.90
        if 1950 <= y < 1970:
            return 0.72
        if 1920 <= y < 1950:
            return 0.48 if canon_hit < 0.8 else 0.78
        return 0.25 if canon_hit < 0.8 else 0.65
    # History / battles / science / arts: steep penalty for unanchored pre-1750 medieval dates!
    if table_type == "hist_battle":
        if canon_hit >= 0.8:
            return 0.72
        if 1939 <= y <= 1945 or 1861 <= y <= 1865:
            return 0.50
        if y < 1750:
            return 0.06  # Battle of Badr (624 AD), Uhud (625), Karbala (680), Poltava (1709)!
        return 0.28
    if y >= 1950:
        return 0.84
    if y >= 1850:
        return 0.68
    if y >= 1750:
        return 0.52
    if y >= 1450:
        return 0.32 if canon_hit < 0.8 else 0.76
    # Pre-1450 antiquity/medieval: only famous if canon anchor!
    return 0.14 if canon_hit < 0.8 else 0.72


def orthographic_obscurity_penalty(name: str, extra: str = "") -> float:
    """Penalizes catalog codes, Latin binomials, chemical IUPAC strings, and diacritic-heavy obscure strings."""
    s = str(name or "").strip()
    if not s:
        return 0.40
    pen = 0.0
    if RE_CATALOG_ENTITY.match(s):
        pen += 0.48
    if RE_BINOMIAL_LATIN.search(s):
        pen += 0.35
    if RE_SPECIALIST_JARGON.search(s) or (extra and RE_SPECIALIST_JARGON.search(extra)):
        pen += 0.32
    if len(s) >= 28:
        pen += 0.14
    elif len(s) >= 20:
        pen += 0.06
    non_ascii = sum(1 for ch in s if ord(ch) > 127)
    if non_ascii >= 2:
        pen += 0.14
    elif non_ascii == 1:
        pen += 0.04
    # Leading asteroid number like "8336 Šafařík" or "2 Pallas"
    if re.match(r"^\d{2,}\s+", s):
        pen += 0.34
    return min(0.65, pen)


def resolve_row_dict(
    row: Sequence[Any], cols: Sequence[str], pool_cols: Set[int], pool: Sequence[str]
) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    for ci, cname in enumerate(cols):
        if ci >= len(row):
            continue
        v = row[ci]
        if ci in pool_cols and isinstance(v, int) and 0 <= v < len(pool):
            out[cname] = pool[v]
        else:
            out[cname] = v
    return out


def extract_year(ctx: Dict[str, Any]) -> Optional[int]:
    for k in ("year", "debut"):
        if k in ctx:
            try:
                y = int(ctx[k])
                if -3500 <= y <= 2030:
                    return y
            except (TypeError, ValueError):
                pass
    return None


def score_shard_row(
    table_type: str,
    domain_id: int,
    row_idx: int,
    total_rows: int,
    ctx: Dict[str, Any],
    raw_irt_int: int,
) -> Tuple[float, float]:
    """
    Synthesizes all 5 psychometric algorithms for a single shard row:
      Returns (fameScore [0.00..1.00], difficultyScore [1.0..10.0]).
    """
    cat_floor, min_star, max_star, min_stage, _ = TABLE_CURRICULUM.get(
        table_type, (0.45, 3.0, 9.6, 3, "GENERAL")
    )
    primary = str(ctx.get("name") or ctx.get("title") or ctx.get("park") or ctx.get("honor") or ctx.get("stmt") or "").strip()
    secondary = str(
        ctx.get("country")
        or ctx.get("artist")
        or ctx.get("director")
        or ctx.get("author")
        or ctx.get("maker")
        or ctx.get("team")
        or ctx.get("capital")
        or ctx.get("state")
        or ""
    ).strip()

    # 1. Normalized shard IRT & row-rank prior (heavily damped so ties at -150 NEVER dominate!)
    irt_norm = clamp((raw_irt_int + 150.0) / 390.0, 0.0, 1.0)
    rank01 = row_idx / max(1, total_rows - 1) if total_rows > 1 else 0.0
    rank_prior = 1.0 - math.pow(rank01, 0.58)

    # 2. Household Canon Prior (Algorithm 2)
    canon_primary = check_canon_match(primary)
    canon_secondary = check_canon_match(secondary)
    # Don't let a famous country name ("France", "Saudi Arabia") disguise an obscure medieval battle or scholar!
    if table_type in ("hist_battle", "hist_figure", "sub_hist_figures_deep", "sub_hist_dynasty", "sci_scientist", "lit_author", "art_creator", "soc_leader", "sub_soc_party_leader", "math_person"):
        canon_prior = max(canon_primary, canon_secondary * 0.12)
    else:
        canon_prior = max(canon_primary, canon_secondary * 0.42)

    # Table-specific structural fame boosters & strict anti-obscurity rules!
    structural_boost = 0.0
    structural_penalty = 0.0

    if table_type == "soc_country":
        # CRITICAL FIX: soc_country was sorted alphabetically (Afghanistan = row 0)!
        if norm_key(primary) in TIER_A_COUNTRIES:
            canon_prior = 1.0
            structural_boost += 0.22
        else:
            # Mid/niche nations pushed to Stages 03-08 instead of Stage 01!
            canon_prior = 0.22
            structural_penalty += 0.24
    elif table_type == "geo_city":
        # CRITICAL FIX: Chengdu/Guangzhou/Wuhan had pop_k > 13,000 -> don't let raw pop override global fame!
        pop_k = float(ctx.get("pop_k") or 0)
        if norm_key(primary) in TIER_A_CITIES:
            canon_prior = 1.0
            structural_boost += 0.24
        elif pop_k >= 5000:
            structural_boost += 0.04
            structural_penalty += 0.14  # Mega-cities outside Western household canon -> Stage 03-05
        elif pop_k < 500:
            structural_penalty += 0.26
    elif table_type == "sub_geo_us_city":
        pop_k = float(ctx.get("pop_k") or 0)
        if norm_key(primary) in TIER_A_CITIES:
            canon_prior = 0.96
            structural_boost += 0.16
        elif pop_k >= 400:
            structural_boost += 0.08
        elif pop_k < 80:
            structural_penalty += 0.28
    elif table_type == "nat_species":
        # CRITICAL FIX: nat_species had Common Blackbird / Eurasian Hoopoe at row 0!
        if norm_key(primary) in TIER_A_ANIMALS_NATURE:
            canon_prior = 1.0
            structural_boost += 0.22
        else:
            structural_penalty += 0.26
    elif table_type == "sub_nat_breed":
        if norm_key(primary) in TIER_A_ANIMALS_NATURE:
            canon_prior = 0.95
            structural_boost += 0.18
        else:
            structural_penalty += 0.16
    elif table_type == "sci_element":
        anum = int(ctx.get("anum") or 99)
        if norm_key(primary) in TIER_A_SCIENCE_ARTS_LIT_HIST and anum <= 82:
            canon_prior = 0.96
            structural_boost += 0.16
        elif anum > 86:
            structural_penalty += 0.24
    elif table_type == "sci_chemical":
        if norm_key(primary) in TIER_A_SCIENCE_ARTS_LIT_HIST:
            canon_prior = 0.94
            structural_boost += 0.18
        else:
            structural_penalty += 0.34
    elif table_type == "sci_scientist":
        # CRITICAL FIX: row 0 was François Rabelais (1494), row 1 Giordano Bruno (1548)!
        if norm_key(primary) in TIER_A_SCIENCE_ARTS_LIT_HIST:
            canon_prior = 1.0
            structural_boost += 0.24
        else:
            structural_penalty += 0.24
    elif table_type == "hist_battle":
        # CRITICAL FIX: Battle of Badr (624 AD) was row 0!
        if norm_key(primary) in TIER_A_SCIENCE_ARTS_LIT_HIST:
            canon_prior = 0.85
            structural_boost += 0.05
        else:
            structural_penalty += 0.44
    elif table_type in ("hist_figure", "hist_empire", "sub_hist_arch_site"):
        if norm_key(primary) in ALL_HOUSEHOLD_CANON:
            canon_prior = 0.96
            structural_boost += 0.18
        else:
            structural_penalty += 0.20
    elif table_type in ("pop_film", "pop_song", "pop_band", "pop_tv", "pop_album", "sub_pop_actor", "food_item", "food_brand", "art_landmark", "art_work", "sport_athlete", "sport_videogame", "tech_company"):
        # High-accessibility everyday tables still reward canon icons strongly for Stage 01!
        if canon_primary >= 0.85:
            structural_boost += 0.18
        elif canon_secondary >= 0.85 and rank01 <= 0.15:
            structural_boost += 0.12
        elif rank01 > 0.25:
            structural_penalty += 0.12

    # 3. Era & Cultural Ubiquity (Algorithm 3)
    year_val = extract_year(ctx)
    era_u = era_ubiquity_score(year_val, domain_id, table_type, canon_prior)

    # 4. Orthographic & Catalog Obscurity Penalty (Algorithm 2)
    extra_blob = str(ctx.get("sci") or ctx.get("formula") or "")
    orth_pen = orthographic_obscurity_penalty(primary, extra_blob)
    if table_type == "nat_species" and norm_key(primary) not in TIER_A_ANIMALS_NATURE:
        orth_pen += 0.10  # Keep un-canonized obscure species out of warmup

    # 5. Table Accessibility Prior (Algorithm 5)
    table_access = 1.0 - cat_floor

    # Composite Household Fame Score in [0.00, 1.00]
    fame = (
        0.28 * table_access
        + 0.34 * canon_prior
        + 0.18 * era_u
        + 0.20 * rank_prior
        + structural_boost
        - orth_pen
        - structural_penalty
    )
    fame = round(clamp(fame, 0.02, 0.99), 3)

    # Lexical / Answer specificity factor in [0.0, 1.0]
    ans_len = len(secondary or primary)
    lex_spec = clamp((ans_len - 6) / 26.0, 0.0, 1.0)
    if year_val is not None and year_val < 1800 and year_val not in ICONIC_YEARS and canon_prior < 0.8:
        lex_spec = min(1.0, lex_spec + 0.35)

    # Synthesized Continuous Difficulty Score [1.0 .. 10.0]
    raw_unit = (
        0.52 * (1.0 - fame)
        + 0.24 * cat_floor
        + 0.14 * irt_norm
        + 0.10 * lex_spec
    )
    diff = 1.0 + 9.0 * clamp(raw_unit, 0.0, 1.0)

    # Enforce strict Stage-World curriculum floor so banned tables & arcane medieval battles NEVER leak early!
    stage_floor_star = 1.0 if min_stage <= 1 else float(min_stage)
    if min_stage == 1 and canon_prior < 0.72 and table_type not in ("pop_film", "pop_song", "pop_band", "pop_tv", "food_item", "food_brand", "sub_lit_char", "sub_nat_breed"):
        # Non-canon entries inside mixed tables (like geo_city, sci_scientist, hist_empire) start at Stage 02+
        diff = max(diff, 2.2)
    if table_type == "hist_battle" and canon_primary < 0.8 and (year_val is None or year_val < 1750):
        # Obscure pre-1750 medieval/ancient battles strictly reserved for late Championship stages (★ 7.6–10.0)!
        diff = max(diff, 7.6 + (0.6 if (year_val is not None and year_val < 1200) else 0.0))
    if table_type == "nat_species" and canon_primary < 0.5 and row_idx > 250:
        diff = max(diff, 6.2)
    diff = clamp(diff, max(min_star, stage_floor_star), max_star)
    diff = round(diff, 2)

    return fame, diff


def score_curated_item(rec: Dict[str, Any], pack_name: str) -> Tuple[float, float]:
    """Calibrates a curated Tier-1 item (questions.json / gold_venue / jeopardy / visual / curated_v4) to (fame, diff 1.0..10.0)."""
    prompt = str(rec.get("prompt", "")).strip()
    ans = str(rec.get("answerCorrect", "")).strip()
    if not ans and isinstance(rec.get("choices"), list) and rec.get("choices"):
        ci = int(rec.get("correctIndex", 0))
        if 0 <= ci < len(rec["choices"]):
            ans = str(rec["choices"][ci])
    cat = str(rec.get("l1Category") or rec.get("categoryLabel") or "").strip()
    dom = int(rec.get("l0Domain", rec.get("domainId", 0)))

    irt_b = float(rec.get("irtB", 0.0))
    # Map curated_v4 difficultyTier when irtB is 0.0
    tier_str = str(rec.get("difficultyTier", "")).upper()
    if pack_name == "curated_v4" and tier_str:
        tier_irt_map = {
            "MIDDLE_SCHOOL": -1.35,
            "HIGH_SCHOOL": -0.55,
            "COLLEGE": 0.25,
            "GRADUATE": 1.05,
            "MENSA": 1.95,
        }
        irt_b = tier_irt_map.get(tier_str, 0.0)

    irt_norm = clamp((irt_b + 1.80) / 4.40, 0.0, 1.0)

    # Check household canon in answer & prompt
    canon_ans = check_canon_match(ans)
    p_low = norm_key(prompt)
    canon_prompt = 0.0
    for term in (
        "star wars", "titanic", "mona lisa", "eiffel tower", "statue of liberty",
        "apollo 11", "pac-man", "beatles", "olympic", "world cup", "super bowl",
        "pizza", "sushi", "chocolate", "blue whale", "sahara", "everest", "amazon",
        "nile", "shakespeare", "einstein", "newton", "darwin", "michelangelo",
        "da vinci", "picasso", "van gogh", "mozart", "beethoven", "harry potter",
        "simpsons", "disney", "mario", "minecraft", "chess", "fenway", "yankees",
        "jordan", "messi", "pele", "ali", "serena", "bolt", "tokyo", "paris",
        "london", "rome", "egypt", "france", "japan", "italy", "brazil", "australia",
        "pompeii", "machu picchu", "pyramids", "colosseum", "taj mahal", "great wall",
        "oxygen", "carbon", "gold", "silver", "iron", "mars", "jupiter", "saturn",
    ):
        if term in p_low:
            canon_prompt = 0.85
            break
    canon_prior = max(canon_ans, canon_prompt * 0.85)

    # Penalize specialist jargon, Latin binomials, or obscure history in early stages
    jargon_pen = 0.0
    if RE_SPECIALIST_JARGON.search(prompt) or RE_SPECIALIST_JARGON.search(ans):
        jargon_pen += 0.35
    if RE_BINOMIAL_LATIN.search(prompt) or RE_BINOMIAL_LATIN.search(ans):
        jargon_pen += 0.30

    # Domain warmup friendliness (Pop/Food/Sports/Geo/Nature/Art warmer than Law/Math/Deep History)
    dom_floor = {
        4: 0.08, 9: 0.10, 5: 0.14, 2: 0.14, 7: 0.16, 3: 0.18,
        6: 0.20, 10: 0.20, 1: 0.24, 0: 0.28, 8: 0.32, 11: 0.38,
    }.get(dom, 0.24)

    # Check if robotic QID 833..4964 Wikidata stub in questions.json
    qid = int(rec.get("qid", 0))
    is_wikidata_stub = pack_name == "questions_clean" and qid > 832

    fame = clamp(
        0.34 * (1.0 - irt_norm)
        + 0.34 * canon_prior
        + 0.22 * (1.0 - dom_floor)
        + (0.10 if not is_wikidata_stub else -0.08)
        - jargon_pen,
        0.04,
        0.99,
    )

    words = len(prompt.split())
    lex_comp = clamp((words - 10) / 24.0, 0.0, 1.0)
    raw_unit = 0.44 * (1.0 - fame) + 0.36 * irt_norm + 0.12 * dom_floor + 0.08 * lex_comp
    diff = 1.0 + 9.0 * clamp(raw_unit, 0.0, 1.0)
    if is_wikidata_stub and canon_prior < 0.7:
        diff = max(diff, 3.5)
    if jargon_pen > 0:
        diff = max(diff, 6.2)

    return round(fame, 3), round(clamp(diff, 1.0, 10.0), 2)


def main() -> int:
    t0 = dt.datetime.now(dt.timezone.utc)
    print("[v6_calibrate_corpus] Scanning all 28 shards + core packs...")

    manifest = json.loads((SHARDS_DIR / "shard_manifest.json").read_text(encoding="utf-8"))
    taxonomy = json.loads((SHARDS_DIR / "taxonomy_tree.json").read_text(encoding="utf-8"))
    all_type_specs: Dict[str, Any] = {}
    all_type_specs.update(manifest.get("types", {}))
    all_type_specs.update(taxonomy.get("types", {}))

    global_band_hist = [0] * 10
    domain_band_hist: Dict[str, List[int]] = {str(d): [0] * 10 for d in range(12)}

    # =========================================================================
    # 1. CALIBRATE CURATED PACKS (Exact Dense QIDs 0 .. 8,187)
    # =========================================================================
    packs_meta: Dict[str, Any] = {}
    next_dense_qid = 0

    def process_curated_pack(
        pack_key: str,
        rel_path: str,
        records: List[Dict[str, Any]],
        filter_clean: bool = True,
    ) -> int:
        nonlocal next_dense_qid
        dense_base = next_dense_qid
        band_counts = [0] * 10
        # Compact band map: band_str -> list of [origQid, denseQid, diffX10, fameX100, domId]
        band_items: Dict[str, List[List[int]]] = {str(b): [] for b in range(10)}
        kept = 0
        for rec in records:
            if filter_clean and not is_clean_curated_record(rec):
                continue
            orig_qid = int(rec.get("qid", 0))
            dom = max(0, min(11, int(rec.get("l0Domain", rec.get("domainId", 0)))))
            fame, diff = score_curated_item(rec, pack_key)
            band = difficulty_to_band(diff)
            dense_qid = next_dense_qid
            next_dense_qid += 1
            kept += 1
            band_counts[band] += 1
            global_band_hist[band] += 1
            domain_band_hist[str(dom)][band] += 1
            # Keep every curated item indexed cleanly (curated total is ~8,180 rows -> compact!)
            band_items[str(band)].append(
                [orig_qid, dense_qid, int(round(diff * 10)), int(round(fame * 100)), dom]
            )

        # Sort each band descending by fameX100 so highest-fame crowd-pleasers surface first
        for b_str in band_items:
            band_items[b_str].sort(key=lambda x: (-x[3], x[2], x[0]))

        packs_meta[pack_key] = {
            "path": rel_path,
            "denseBaseQid": dense_base,
            "denseEndQid": next_dense_qid - 1 if kept > 0 else dense_base,
            "count": kept,
            "bandCounts": band_counts,
            "bandItems": band_items,
        }
        return kept

    # 1a. questions.json (clean QIDs < 4965)
    q_raw = json.loads((DATA_DIR / "questions.json").read_text(encoding="utf-8"))["questions"]
    n_q_clean = process_curated_pack("questions_clean", "questions.json", q_raw, filter_clean=True)

    # 1b. gold_venue_packs.json (640 + 72 boss chain steps)
    gv_data = json.loads((DATA_DIR / "gold_venue_packs.json").read_text(encoding="utf-8"))
    gv_items = list(gv_data.get("questions", []))
    for chain in gv_data.get("bossChains", []):
        for step in chain.get("steps", []):
            gv_items.append(step)
    n_gold = process_curated_pack("gold_venue", "gold_venue_packs.json", gv_items, filter_clean=True)

    # 1c. jeopardy_signature_packs.json (1,764)
    jp_items = json.loads((DATA_DIR / "jeopardy_signature_packs.json").read_text(encoding="utf-8"))["questions"]
    n_jeop = process_curated_pack("jeopardy_signature", "jeopardy_signature_packs.json", jp_items, filter_clean=True)

    # 1d. visual_globe_packs.json (340)
    vg_items = json.loads((DATA_DIR / "visual_globe_packs.json").read_text(encoding="utf-8"))["questions"]
    n_vis = process_curated_pack("visual_globe", "visual_globe_packs.json", vg_items, filter_clean=True)

    # 1e. curated_v4_witty_pack.json (408)
    c4_items = json.loads((DATA_DIR / "curated_v4_witty_pack.json").read_text(encoding="utf-8"))["cards"]
    n_c4 = process_curated_pack("curated_v4", "curated_v4_witty_pack.json", c4_items, filter_clean=False)

    curated_total = n_q_clean + n_gold + n_jeop + n_vis + n_c4
    print(
        f"  Curated packs calibrated: questions_clean={n_q_clean}, gold_venue={n_gold}, "
        f"jeopardy={n_jeop}, visual_globe={n_vis}, curated_v4={n_c4} -> TOTAL={curated_total} (nextDenseQid={next_dense_qid})"
    )

    # =========================================================================
    # 2. CALIBRATE ALL 26 DATA SHARD FILES (28 total in public/data/shards/)
    # =========================================================================
    shard_files = sorted(glob.glob(str(SHARDS_DIR / "*.json")))
    assert len(shard_files) == 28, f"Expected 28 shard files, found {len(shard_files)}"

    # Order deterministically: main domain shards first, then specialist subcat shards
    data_shard_paths = [
        Path(p) for p in shard_files
        if os.path.basename(p) not in ("shard_manifest.json", "taxonomy_tree.json")
    ]
    main_shards = sorted([p for p in data_shard_paths if p.name.startswith("domain_") and not p.name.startswith("domain_subcats_")])
    subcat_shards = sorted([p for p in data_shard_paths if p not in main_shards])

    tables_index: Dict[str, Any] = {}
    shard_rows_total = 0
    shard_questions_total = 0
    stage01_samples: List[Dict[str, Any]] = []
    stage10_samples: List[Dict[str, Any]] = []
    battle_of_badr_diag: Dict[str, Any] = {}

    # Cap stored row lists per band so startup JSON stays ~240 KB (<15ms parse!) while 100% of rows remain reachable via bandRanges
    EARLY_BAND_ROW_CAP = 110
    LATE_BAND_ROW_CAP = 36

    for shard_path in main_shards + subcat_shards:
        shard_name = shard_path.name
        is_subcat = shard_path in subcat_shards
        data = json.loads(shard_path.read_text(encoding="utf-8"))
        pool = data.get("p", [])
        local_types = data.get("types", {})

        for tbl_idx, tbl in enumerate(data.get("t", [])):
            t_type = tbl["type"]
            rows = tbl.get("r", [])
            legacy_base_qid = int(tbl.get("baseQid", 0))
            spec = local_types.get(t_type) or all_type_specs.get(t_type)
            if not spec:
                raise RuntimeError(f"Missing spec for shard table type {t_type} in {shard_name}")

            dom_id = int(spec["l0Domain"])
            cols = spec["cols"]
            pool_cols = set(spec.get("poolCols", []))
            angles = spec["angles"]
            n_angles = len(angles)
            n_rows = len(rows)
            n_questions = n_rows * n_angles

            dense_base_qid = next_dense_qid
            next_dense_qid += n_questions
            shard_rows_total += n_rows
            shard_questions_total += n_questions

            cat_floor, min_star_cfg, max_star_cfg, min_stage, human_cat = TABLE_CURRICULUM.get(
                t_type, (0.45, 3.0, 9.6, 3, spec.get("l1Category", "GENERAL").upper())
            )
            stage_mask = stage_mask_from_min_stage(min_stage, 10)

            band_counts = [0] * 10
            # Collect (fame, diff, row_idx) per band
            per_band_scored: List[List[Tuple[float, float, int]]] = [[] for _ in range(10)]
            row_diffs: List[float] = []

            for ri, row in enumerate(rows):
                ctx = resolve_row_dict(row, cols, pool_cols, pool)
                raw_irt = int(row[-1]) if isinstance(row[-1], (int, float)) else 0
                fame, base_diff = score_shard_row(t_type, dom_id, ri, n_rows, ctx, raw_irt)
                row_diffs.append(base_diff)

                # Capture Battle of Badr diagnostic!
                if t_type == "hist_battle" and ri == 0:
                    battle_of_badr_diag = {
                        "entity": str(ctx.get("name", "")),
                        "year": ctx.get("year"),
                        "rowIdx": ri,
                        "rawShardIrt": raw_irt,
                        "calibratedFame": fame,
                        "calibratedDifficulty": base_diff,
                        "stage01Eligible": bool(stage_mask & 1),
                    }

                # Each angle shifts difficulty slightly via its irtOffset (e.g. calibrator/reverse angles slightly harder)
                for ai, ang in enumerate(angles):
                    ang_off = float(ang.get("irtOffset", 0.0)) * 0.45
                    if ang.get("archetype") == "CALIBRATOR_DIAL":
                        ang_off += 0.35
                    elif ang.get("archetype") == "CODEX_DUAL_RING":
                        ang_off += 0.45
                    stage_floor = 1.0 if min_stage <= 1 else float(min_stage)
                    d_ang = clamp(base_diff + ang_off, max(min_star_cfg, stage_floor), max_star_cfg)
                    b_ang = difficulty_to_band(d_ang)
                    band_counts[b_ang] += 1
                    global_band_hist[b_ang] += 1
                    domain_band_hist[str(dom_id)][b_ang] += 1

                b_row = difficulty_to_band(base_diff)
                per_band_scored[b_row].append((fame, base_diff, ri))

                # Collect human-auditable Stage 01 & Stage 10 samples across ALL domains
                if (stage_mask & 1) and b_row == 0 and fame >= 0.78:
                    if sum(1 for s in stage01_samples if s["table"] == t_type) < 2 and len(stage01_samples) < 80:
                        stage01_samples.append({
                            "table": t_type,
                            "domainId": dom_id,
                            "entity": str(ctx.get("name") or ctx.get("title") or ctx.get("park") or ""),
                            "fame": fame,
                            "difficulty": base_diff,
                            "rowIdx": ri,
                        })
                if b_row == 9 and ri % max(1, n_rows // 6) == 0:
                    if sum(1 for s in stage10_samples if s["table"] == t_type) < 2 and len(stage10_samples) < 40:
                        stage10_samples.append({
                            "table": t_type,
                            "domainId": dom_id,
                            "entity": str(ctx.get("name") or ctx.get("title") or ctx.get("park") or ""),
                            "fame": fame,
                            "difficulty": base_diff,
                            "rowIdx": ri,
                        })

            band_rows_compact: Dict[str, List[int]] = {}
            band_ranges_compact: Dict[str, List[int]] = {}
            for b in range(10):
                bucket = per_band_scored[b]
                if not bucket:
                    continue
                # Sort early bands by highest fame first; late bands spread across row indices
                if b <= 3:
                    bucket.sort(key=lambda x: (-x[0], x[1], x[2]))
                    band_rows_compact[str(b)] = [x[2] for x in bucket[:EARLY_BAND_ROW_CAP]]
                else:
                    bucket.sort(key=lambda x: x[2])
                    min_r = bucket[0][2]
                    max_r = bucket[-1][2]
                    band_ranges_compact[str(b)] = [min_r, max_r, len(bucket)]
                    if len(bucket) <= LATE_BAND_ROW_CAP:
                        band_rows_compact[str(b)] = [x[2] for x in bucket]
                    else:
                        step = len(bucket) / LATE_BAND_ROW_CAP
                        band_rows_compact[str(b)] = [bucket[int(i * step)][2] for i in range(LATE_BAND_ROW_CAP)]

            row_diffs_sorted = sorted(row_diffs)
            min_d = row_diffs_sorted[0] if row_diffs_sorted else min_star_cfg
            med_d = row_diffs_sorted[len(row_diffs_sorted) // 2] if row_diffs_sorted else 5.0
            max_d = row_diffs_sorted[-1] if row_diffs_sorted else max_star_cfg

            tables_index[t_type] = {
                "file": shard_name,
                "isSubcat": is_subcat,
                "domainId": dom_id,
                "categoryLabel": human_cat,
                "tableIndex": tbl_idx,
                "legacyBaseQid": legacy_base_qid,
                "denseBaseQid": dense_base_qid,
                "denseEndQid": next_dense_qid - 1,
                "rowCount": n_rows,
                "angleCount": n_angles,
                "questionCount": n_questions,
                "stageMask": stage_mask,
                "minStage": min_stage,
                "minStar": round(min_d, 2),
                "medianStar": round(med_d, 2),
                "maxStar": round(max_d, 2),
                "bandCounts": band_counts,
                "bandRows": band_rows_compact,
                "bandRanges": band_ranges_compact,
            }

    # =========================================================================
    # 3. DETERMINISTIC MULTI-ROW TOY SYNTHESIS (50,400 slots across 12 domains)
    # =========================================================================
    synth_dense_base = next_dense_qid
    synth_total = SYNTHESIS_PER_DOMAIN * 12  # 50,400
    next_dense_qid += synth_total
    assert next_dense_qid <= PRIME_TIME_QID_MIN, (
        f"Dense QID overflow into prime_time_witty_clues_v6 range! {next_dense_qid} > {PRIME_TIME_QID_MIN}"
    )

    # Distribute synthesis evenly across bands 0..9 (weighted for mid/late variety + warmup Dis-or-Dat)
    synth_weights = [0.07, 0.09, 0.11, 0.12, 0.12, 0.12, 0.11, 0.10, 0.09, 0.07]
    synth_band_counts = [0] * 10
    for d in range(12):
        rem = SYNTHESIS_PER_DOMAIN
        for b in range(10):
            cnt = int(round(SYNTHESIS_PER_DOMAIN * synth_weights[b])) if b < 9 else rem
            rem -= cnt
            synth_band_counts[b] += cnt
            global_band_hist[b] += cnt
            domain_band_hist[str(d)][b] += cnt

    # =========================================================================
    # 4. OPTIONAL PRIME-TIME WITTY CLUES V6 CHECK
    # =========================================================================
    prime_time_path = DATA_DIR / "v6" / "prime_time_witty_clues_v6.json"
    prime_time_count = 0
    if prime_time_path.exists():
        pt_data = json.loads(prime_time_path.read_text(encoding="utf-8"))
        pt_list = pt_data if isinstance(pt_data, list) else pt_data.get("clues", pt_data.get("questions", []))
        prime_time_count = len(pt_list)
        for item in pt_list:
            b = difficulty_to_band(float(item.get("difficultyScore", 5.0)))
            d = max(0, min(11, int(item.get("domainId", 0))))
            global_band_hist[b] += 1
            domain_band_hist[str(d)][b] += 1

    total_playable = curated_total + shard_questions_total + synth_total + prime_time_count
    assert total_playable >= 1_279_399, (
        f"Playable corpus count shrunk below 1,279,399! Got {total_playable}"
    )
    assert battle_of_badr_diag.get("calibratedDifficulty", 0) >= 7.5, (
        f"Battle of Badr MUST be calibrated >= 7.5! Got {battle_of_badr_diag}"
    )
    assert not battle_of_badr_diag.get("stage01Eligible", True), (
        "hist_battle MUST be blocked from Stage 01!"
    )

    out_payload = {
        "schemaVersion": "WS_V6_CALIBRATION_INDEX_1",
        "generatedAt": dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "totalShardFilesScanned": len(shard_files),
        "totalShardTables": len(tables_index),
        "totalShardRows": shard_rows_total,
        "totalShardQuestions": shard_questions_total,
        "totalCuratedQuestions": curated_total,
        "totalSynthesisQuestions": synth_total,
        "primeTimeWittyLoadedCount": prime_time_count,
        "totalPlayableQuestions": total_playable,
        "bitsetBytes": BITSET_BYTES,
        "bitsetCapacityBits": BITSET_CAPACITY_BITS,
        "denseQidMaxAllocated": next_dense_qid - 1,
        "primeTimeWittyQidRange": [PRIME_TIME_QID_MIN, PRIME_TIME_QID_MAX],
        "globalBandHistogram": global_band_hist,
        "domainBandHistogram": domain_band_hist,
        "packs": packs_meta,
        "tables": tables_index,
        "synthesis": {
            "denseBaseQid": synth_dense_base,
            "denseEndQid": synth_dense_base + synth_total - 1,
            "perDomain": SYNTHESIS_PER_DOMAIN,
            "total": synth_total,
            "bandCounts": synth_band_counts,
        },
        "diagnostics": {
            "battleOfBadrCheck": battle_of_badr_diag,
            "stage01WarmupSamples": stage01_samples[:24],
            "stage10LegendSamples": stage10_samples[:16],
        },
    }

    OUT_INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    raw_json = json.dumps(out_payload, ensure_ascii=False, separators=(",", ":"))
    OUT_INDEX_PATH.write_text(raw_json, encoding="utf-8")
    elapsed_ms = (dt.datetime.now(dt.timezone.utc) - t0).total_seconds() * 1000.0

    print("\n=== WORLD'S SMARTEST v6.0 CORPUS CALIBRATION COMPLETE ===")
    print(f"  Output index          : {OUT_INDEX_PATH.relative_to(ROOT)} ({len(raw_json)/1024:.1f} KB)")
    print(f"  Shard files scanned   : {len(shard_files)} (79 tables, {shard_rows_total:,} rows)")
    print(f"  Shard questions       : {shard_questions_total:,}")
    print(f"  Curated clean packs   : {curated_total:,}")
    print(f"  Multi-toy synthesis   : {synth_total:,}")
    print(f"  Prime-Time Witty v6   : {prime_time_count:,} (reserved QIDs {PRIME_TIME_QID_MIN:,}..{PRIME_TIME_QID_MAX:,})")
    print(f"  TOTAL PLAYABLE CLUES  : {total_playable:,} (REQUIRED >= 1,279,399 -> PASS!)")
    print(f"  Dense QID allocation  : 0 .. {next_dense_qid - 1:,} (Bitset capacity: {BITSET_CAPACITY_BITS:,} bits / {BITSET_BYTES:,} bytes)")
    print(f"  Elapsed               : {elapsed_ms:.0f} ms")
    print("\n  10-Band Stage Difficulty Histogram (★ 1.0 .. ★ 10.0):")
    band_labels = [
        "★ 1.0–1.9", "★ 1.9–2.8", "★ 2.8–3.7", "★ 3.7–4.6", "★ 4.6–5.5",
        "★ 5.5–6.4", "★ 6.4–7.3", "★ 7.3–8.2", "★ 8.2–9.1", "★ 9.1–10.0",
    ]
    for b, cnt in enumerate(global_band_hist):
        bar = "#" * max(1, int(cnt / max(global_band_hist) * 32))
        print(f"    Stage {b+1:2d} ({band_labels[b]:10s}): {cnt:9,d}  {bar}")
    print(f"\n  Battle of Badr Check  : {battle_of_badr_diag}")
    print("  Stage 01 Warmup Sample Entities (★ 1.0–1.9 across domains):")
    # Pick diverse domains for summary display
    shown = []
    seen_doms = set()
    for s in stage01_samples:
        if s["domainId"] not in seen_doms or len(shown) < 16:
            shown.append(s)
            seen_doms.add(s["domainId"])
        if len(shown) >= 18:
            break
    for s in shown:
        print(f"    D{s['domainId']:02d} [{s['table']:16s}] {s['entity']:28s} fame={s['fame']:.2f} diff=★{s['difficulty']:.1f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
