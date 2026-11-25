// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Prime-Time Gold Pack K-09 (`scripts/seed_data/packs/pack_k_09_folklore_finance.mjs`)
// 216 All-Era (Ancient thru 2026) Human-Crafted Game-Night Clues:
//   - FOLKLORE (108): Creepypasta, modern cryptids, Marvel-vs-Norse/Greek, Grimms & holidays
//   - FINANCE  (108): Bitcoin Pizza Day, NVIDIA/Apple $3T+, GameStop, Buffett, brand wars & heists
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
  if (extra.shutters) {
    supportedToys.push('TOY_14_FOUR_SHUTTER_REEL');
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
  // 1. FOLKLORE (108 CLUES: 49 D1, 43 D2, 16 D3 | ~40% 2000s-2026, ~35% 60s-90s, ~25% Classic)
  // ==========================================================================

  // --- FOLKLORE D1 (49 clues) ---
  g('FOLKLORE', 1, 'k09_slender_man_2009_photoshop_forum',
    'Faceless suited stalker Slender Man entered modern folklore in June 2009 via a Photoshop contest on which site?',
    ['Something Awful', 'Newgrounds Portal', 'Fark Photo Thread', 'Digg Frontpage'], 0,
    'Creator Eric Knudsen ("Victor Surge") spliced a tall suited silhouette into two playground photos—birthing the internet’s signature boogeyman.'),

  g('FOLKLORE', 1, 'k09_backrooms_yellow_carpet_creepypasta',
    'Viral 2019 legend "The Backrooms" traps wanderers inside endless rooms of buzzing lights and damp what?',
    ['Cracked wall tile', 'Mono-yellow carpet', 'Rusted chain fences', 'Peeling floral vinyl'], 1,
    'Five years after the 4chan post went viral, sleuths in 2024 traced the real photo to a renovated hobby shop in Oshkosh, Wisconsin!'),

  g('FOLKLORE', 1, 'k09_mjolnir_short_handle_horsefly_loki',
    'Marvel says only the "worthy" lift Mjölnir—in Norse myth, biting horsefly Loki gave Thor’s hammer what flaw?',
    ['Cracked iron head', 'Hollow wooden core', 'Stubby short handle', 'Crooked leather strap'], 2,
    'Loki bit dwarf smith Brokkr’s eyelid mid-bellows, leaving Thor’s hammer awkwardly one-handed—and requiring iron gloves just to grip it!'),

  g('FOLKLORE', 1, 'k09_norse_hel_half_blue_black_visage',
    'Marvel’s "Thor: Ragnarok" made Hela Odin’s sleek daughter—in Norse Eddas, Loki’s daughter Hel looks how below the waist?',
    ['Wrapped in wolf fur', 'Scaled like cold sea snakes', 'Carved of pale glacier ice', 'Corpse-blue and black'], 3,
    'Snorri Sturluson describes underworld ruler Hel as half flesh-toned and half decaying blue-black so nobody mistakes her realm.'),

  g('FOLKLORE', 1, 'k09_moon_knight_taweret_childbirth_hippo',
    'Featured in Marvel’s 2022 "Moon Knight," hippo goddess Taweret was prayed to in Egyptian homes to guard what?',
    ['Safe childbirth', 'Nile grain boats', 'Royal tomb locks', 'Desert spice trails'], 0,
    'Wild mother hippos ferociously defend calves from Nile crocodiles—making gentle-bellied Taweret Egypt’s favorite nursery protector.'),

  g('FOLKLORE', 1, 'k09_percy_jackson_600th_floor_olympus',
    'Rick Riordan’s "Percy Jackson" books update Greek myth by anchoring Mount Olympus above the 600th floor of where?',
    ['Chrysler Spire', 'Empire State Tower', 'Flatiron Roof Penthouse', 'Grand Central Clock'], 1,
    'Riordan reasoned Olympus follows Western civilization’s bright lights—reachable via a keycard elevator in Manhattan’s Empire State Building.'),

  g('FOLKLORE', 1, 'k09_minecraft_herobrine_blank_white_eyes',
    '2010 creepypasta "Herobrine" haunts foggy single-player Minecraft maps dressed like Steve with what eerie twist?',
    ['Backwards pickaxe', 'Blood-red cape trim', 'Blank glowing eyes', 'Floating iron crown'], 2,
    'Mojang leaned into the gag for over a decade, ending almost every official Minecraft patch changelog with "- Removed Herobrine."'),

  g('FOLKLORE', 1, 'k09_siren_head_trevor_henderson_cryptid',
    'Artist Trevor Henderson created viral 2018 cryptid "Siren Head," topping a 40-foot gaunt frame with a pole of what?',
    ['Spinning radar', 'Broken highway lamps', 'Coiled copper antennas', 'Twin air-raid sirens'], 3,
    'Siren Head lures lost hikers into dark woods by broadcasting static-warped emergency alerts and stolen voices of friends.'),

  g('FOLKLORE', 1, 'k09_storm_area_51_naruto_run_meme',
    'Two million fans RSVP’d to 2019’s viral "Storm Area 51" joke vowing guards couldn’t catch raiders sprinting how?',
    ['Arms-back Naruto run', 'Backwards moonwalk step', 'Sack-race hopping', 'Sideways crab shuffle'], 0,
    'Only ~150 costumed fans actually strolled up to Nevada’s Groom Lake gate—where one kid Naruto-ran straight behind a live TV reporter!'),

  g('FOLKLORE', 1, 'k09_birds_arent_real_powerline_charging',
    'Gen-Z spoof folklore "Birds Aren’t Real" deadpans that pigeons perching on power lines are secretly doing what?',
    ['Tapping cellular phone calls', 'Recharging batteries', 'Melting winter cable frost', 'Warming cold claws'], 1,
    'Peter McIndoe improvised the spoof on a 2017 Memphis street corner—soon plastering cheeky "Pigeons Are Liars" billboards nationwide.'),

  g('FOLKLORE', 1, 'k09_elf_on_the_shelf_2005_debut_year',
    'Families treat "The Elf on the Shelf" like old Yule lore, yet Carol Aebersold published it in what modern year?',
    ['2005', '1978', '1991', '2014'], 0,
    'Turned down by publishers, Aebersold and daughter Chanda Bell sold Scout Elves out of boxes in 2005 before selling 20+ million copies!',
    { numeric: { target: 2005, min: 1960, max: 2025, step: 1, unit: 'year' } }),

  g('FOLKLORE', 1, 'k09_teal_pumpkin_project_allergy_treats',
    'Since 2014, setting a bright teal pumpkin on your porch on Halloween night tells trick-or-treaters you hand out what?',
    ['Full-size chocolate bars', 'Hot apple cider', 'Allergy-safe trinkets', 'Homemade caramel popcorn'], 2,
    'Started by a Tennessee mom in 2014, the Teal Pumpkin Project lets kids with nut or dairy allergies grab glow sticks and stickers safely.'),

  g('FOLKLORE', 1, 'k09_australian_drop_bear_koala_prank',
    'Aussies love warning gullible tourists to dab Vegemite behind their ears to stop ambushes from tree-leaping what?',
    ['Saber-toothed wombats', 'Venomous bush kangaroos', 'Funnel possums', 'Fanged Drop Bears'], 3,
    'Even the Australian Museum hosted a deadpan scientific entry for Thylarctos plummetus—a fictional carnivorous cousin of sleepy koalas!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 1, 'k09_loch_ness_2019_edna_giant_eels',
    'Geneticists testing 250 Loch Ness water samples in 2019 found zero reptile monster DNA—just plenty of slippery what?',
    ['Giant European eels', 'Deepwater lake sturgeon', 'Wild harbor seals', 'Blind cavern catfish'], 0,
    'Lead geneticist Neil Gemmell noted Loch Ness teems with eel DNA—leaving room for an oversized four-meter eel mistaken for Nessie!'),

  g('FOLKLORE', 1, 'k09_fresno_nightcrawlers_pajama_cryptid',
    'Caught wobbling across a lawn on 2007 security video, cryptid "Fresno Nightcrawlers" look like walking pairs of what?',
    ['Rubber boots', 'White pajama pants', 'Folded patio chairs', 'Stuffed burlap sacks'], 1,
    'With zero arms and stilt-like legs rising right to tiny heads, the armless "pants cryptid" became an instant plushie darling.'),

  g('FOLKLORE', 1, 'k09_atari_et_landfill_2014_excavation',
    'Mocked for 30 years as an 80s gaming myth, 2014 diggers in Alamogordo, New Mexico actually unearthed crushed what?',
    ['Golden arcade coin tokens', 'Prototype video laserdiscs', 'Unsold E.T. game carts', 'Old pinball tables'], 2,
    'Atari really had dumped ~700,000 unsold cartridges under desert concrete in 1983—recovered carts later fetched over $1,500 at auction!'),

  g('FOLKLORE', 1, 'k09_lunar_new_year_hongbao_skip_four',
    'Lunar New Year red envelopes ("hongbao") skip gift totals with the digit 4 because Mandarin "four" sounds like what?',
    ['Empty porcelain bowls', 'Cold north wind', 'Cracked green jade rings', 'The word for death'], 3,
    'Conversely, givers love stuffing crisp bills totaling 88 or 888 because "eight" ("ba") chimes with "prosperity" ("fa")!'),

  g('FOLKLORE', 1, 'k09_five_second_rule_rutgers_watermelon',
    'Kitchen lore’s "Five-Second Rule" flunked lab tests when Rutgers proved dropped watermelon grabs bacteria how fast?',
    ['Under one split second', 'Right after four seconds', 'Only past ten full seconds', 'Once juice dries'], 0,
    'Moisture acts like an instant bacterial slip-and-slide—though dry gummy bears on carpet transferred remarkably few microbes!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 1, 'k09_krampusnacht_december_saint_nicholas',
    'Every December 5 across Alpine parades and modern cities, horned demon Krampus rattles chains beside which bishop?',
    ['Saint Valentine', 'Saint Nicholas', 'Saint Patrick', 'Saint Christopher'], 1,
    'While Saint Nick drops oranges and walnuts into polished boots on December 6, Krampus hands birch switches to unrepentant troublemakers.'),

  g('FOLKLORE', 1, 'k09_mothman_festival_canned_beans_tribute',
    'Every September in Point Pleasant, West Virginia, fans pile cans of pork-and-beans at the chrome statue of whom?',
    ['Flatwoods Spacer', 'Swamp Skunk Ape', 'Winged Mothman', 'Ozark Howler'], 2,
    'Folklore podcasters joked cans of beans looked like tiny tributes on the statue plinth—and rangers now donate mountains of them to food banks!'),

  g('FOLKLORE', 1, 'k09_disney_hercules_mortal_mother_alcmene',
    'Disney’s "Hercules" gives him loving mom Hera—in Greek myth, Hera hated him because Zeus fathered him with whom?',
    ['Queen Hecuba', 'Spartan royal queen Leda', 'Cretan island bride Ariadne', 'Mortal queen Alcmene'], 3,
    'Greek name "Heracles" literally means "Glory of Hera"—an appeasement label that did zero to stop Hera sending twin cobras into his crib!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 1, 'k09_ratatoskr_yggdrasil_insult_squirrel',
    'Spotlit in 2022’s "God of War Ragnarök," Norse squirrel Ratatoskr sprints world-tree Yggdrasil delivering what?',
    ['Spiteful insults', 'Golden acorns', 'Valkyrie love notes', 'Runic weather maps'], 0,
    'Ratatoskr gleefully stirs drama between the eagle perched atop Yggdrasil’s crown and dragon Níðhöggr gnawing its roots below.'),

  g('FOLKLORE', 1, 'k09_swallowed_chewing_gum_seven_year_myth',
    'Playground lore warns swallowed bubblegum stays in your gut seven years—how does digestion actually handle gum base?',
    ['Dissolves it in bile', 'Passes it in days', 'Stores near ribs', 'Burns it as glucose'], 1,
    'Stomach enzymes digest the sugar and mint flavoring, then normal peristalsis escorts the chewy rubber base right out within ~48 hours.',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 1, 'k09_patterson_gimlin_1967_bigfoot_patty',
    'Filmed striding beside Bluff Creek in October 1967, Frame 352’s famous shoulder-turning Sasquatch was nicknamed what?',
    ['Big Uncle Hank', 'Old Redwood Tracker Joe', 'Patty (a female)', 'Chief Shasta Creek Sam'], 2,
    'Bob Gimlin insisted for decades no 1967 Hollywood ape suit could ripple thigh muscles like "Patty" as she calmly walked into the trees.'),

  g('FOLKLORE', 1, 'k09_chupacabra_1995_puerto_rico_debut',
    'Unlike old werewolf lore, spiky livestock-draining cryptid "El Chupacabra" was first reported in March 1995 where?',
    ['Baja California', 'Costa Rica coast', 'Baja desert', 'Puerto Rico'], 3,
    'Folklorist Benjamin Radford traced eyewitness Madelyne Tolentino’s spiky 1995 description to sci-fi thriller "Species," which had just opened!'),

  g('FOLKLORE', 1, 'k09_norad_tracks_santa_1955_sears_typo',
    'Holiday tradition "NORAD Tracks Santa" began in 1955 when a Sears ad misprinted Santa’s phone number, ringing whom?',
    ['Air Defense Command', 'Cheyenne Police', 'Denver Weather Bureau', 'Pike’s Peak Ski Patrol'], 0,
    'Instead of hanging up on little kids, Colonel Harry Shoup ordered radar airmen to check the North Pole for southbound sleigh echoes!'),

  g('FOLKLORE', 1, 'k09_bermuda_triangle_third_corner_sanjuan',
    'Coined in a 1964 magazine yarn, the mysterious "Bermuda Triangle" links Bermuda, Miami, and which Caribbean port city?',
    ['Havana, Cuba', 'San Juan, PR', 'Nassau, Bahamas', 'Kingston, Jamaica'], 1,
    'Coast Guard insurers charge zero extra premium inside the Triangle—busy hurricane lanes explain its shipwrecks no worse than anywhere else.'),

  g('FOLKLORE', 1, 'k09_life_cereal_mikey_pop_rocks_ad_exec',
    '1970s kids swore "Life" cereal star Little Mikey burst mixing Pop Rocks and soda—what really happened to John Gilchrist?',
    ['Moved to Tibet', 'Joined Houston NASA', 'Became an ad exec', 'Opened a rye bakery'], 2,
    'Very much alive in New York media sales, Gilchrist even reprised the commercial decades later—laughing off schoolyard tummy-explosion tales!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 1, 'k09_nyc_sewer_alligators_florida_pets',
    'Classic NYC urban folklore swore pale alligators lurked under manholes after families flushed baby souvenirs from where?',
    ['Bayou airboats', 'Panama Canal cruises', 'Coney Island sideshows', 'Florida vacations'], 3,
    'Real teen shovelers actually hauled an eight-foot gator out of an East Harlem storm sewer in February 1935—fueling decades of tall tales!'),

  g('FOLKLORE', 1, 'k09_paul_is_dead_abbey_road_barefoot',
    '1969 DJs stoked the "Paul Is Dead" Beatles rumor by pointing out Paul McCartney crossed Abbey Road wearing what?',
    ['Nothing on his feet', 'Two left boots', 'White hospital socks', 'Brass spurs on loafers'], 0,
    'Paul later laughed that August 8, 1969 was simply a hot London afternoon, so he kicked his sandals off for a couple crosswalk snaps!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 1, 'k09_loch_ness_1934_surgeons_photo_toy_sub',
    'Confessed in 1994, the iconic 1934 "Surgeon’s Photo" of Nessie’s graceful neck was wood putty glued onto what?',
    ['Wood decoy duck', 'Tin toy submarine', 'Bicycle inner tube', 'Floating driftwood'], 1,
    'Big-game hunter Marmaduke Wetherell built the 12-inch Woolworth submarine prop as revenge after newspapers mocked his fake hippo-foot tracks!'),

  g('FOLKLORE', 1, 'k09_festivus_unadorned_aluminum_pole',
    'Immortalized on 1997 "Seinfeld," December 23’s holiday "Festivus" skips glittering trees to gather round a bare what?',
    ['Cast-iron radiator', 'Polished coat rack', 'Aluminum pole', 'Iron stove'], 2,
    'Frank Costanza praised aluminum’s high strength-to-weight ratio right before kicking off the "Airing of Grievances" and "Feats of Strength."'),

  g('FOLKLORE', 1, 'k09_kwanzaa_kinara_seven_candles_count',
    'Created in 1966, weeklong Kwanzaa lights a wooden kinara holding red, green, and black candles totaling how many?',
    ['5 candles', '9 candles', '12 candles', '7 candles'], 3,
    'One black center candle, three red on the left, and three green on the right honor the Nguzo Saba—the Seven Principles of heritage.',
    { numeric: { target: 7, min: 1, max: 15, step: 1, unit: 'candles' } }),

  g('FOLKLORE', 1, 'k09_gremlins_raf_wwii_plane_imps',
    'Before 1984’s movie rules, WWII Royal Air Force pilots coined "Gremlins" to blame mid-flight engine glitches on what?',
    ['Saboteur plane imps', 'Magnetic storm sprites', 'Cloud-riding sky trolls', 'Runway goblins'], 0,
    'Young RAF pilot Roald Dahl wrote a 1943 storybook about wing-drilling Gremlins—nearly forty years before Joe Dante’s cinema hit!'),

  g('FOLKLORE', 1, 'k09_punxsutawney_phil_six_weeks_shadow',
    'Every February 2 at Gobbler’s Knob, top-hatted handlers say Punxsutawney Phil’s shadow brings how many winter weeks?',
    ['4 weeks', '6 weeks', '8 weeks', '12 weeks'], 1,
    'NOAA scorecards show Phil’s weather accuracy hovers below a coin flip (~35–40%), yet tens of thousands cheer his stump at dawn anyway!',
    { numeric: { target: 6, min: 1, max: 16, step: 1, unit: 'weeks' } }),

  g('FOLKLORE', 1, 'k09_jersey_devil_pine_barrens_13th_child',
    'Saluted by NHL’s New Jersey Devils, the Pine Barrens cryptid was supposedly cursed in 1735 as Mother Leeds’s which child?',
    ['7th child', '9th child', '13th child', '21st child'], 2,
    'Exhausted Mother Leeds allegedly cried "Let this one be a devil!"—whereupon the infant sprouted hooves and flew straight up the chimney.',
    { numeric: { target: 13, min: 1, max: 25, step: 1, unit: 'child' } }),

  g('FOLKLORE', 1, 'k09_bloody_mary_mirror_three_chants',
    'Sleepover dares challenge kids to stand by candlelight before a dark bathroom mirror and chant "Bloody Mary" how many times?',
    ['5 times', '7 times', '12 times', '3 times'], 3,
    'Folklorists note triple repetition ("rule of three") powers summonings from Macbeth’s witches right down to Beetlejuice and Candyman!',
    { numeric: { target: 3, min: 1, max: 15, step: 1, unit: 'times' } }),

  g('FOLKLORE', 1, 'k09_walt_disney_cryogenic_freeze_myth',
    'Urban lore claims Walt Disney lies frozen under Disneyland—in reality, two days after his 1966 death his remains were what?',
    ['Cremated and interred', 'Buried in rural Missouri', 'Scattered out at sea', 'Entombed in sunny Paris'], 0,
    'Walt’s urn rests openly at Forest Lawn Memorial Park in Glendale; California’s first cryonics freezing happened a month later to someone else!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 1, 'k09_grimm_frog_prince_thrown_at_wall',
    'Forget Disney’s kiss: in the Brothers Grimm’s 1812 "Frog Prince," how does the annoyed princess break the frog’s spell?',
    ['Tosses him in pond', 'Hurls him at the wall', 'Bakes him inside pie crust', 'Locks him out in snow'], 1,
    'Fed up when the talking frog demands to sleep on her silk pillow, she splats him hard against the bedroom wall—and up stands a prince!'),

  g('FOLKLORE', 1, 'k09_princess_and_the_pea_20_mattresses',
    'In Hans Christian Andersen’s tale, a soggy princess feels one pea under twenty featherbeds and how many mattresses?',
    ['8 mattresses', '12 mattresses', '20 mattresses', '40 mattresses'], 2,
    'Andersen ended the 1835 fairy tale deadpanning that the famous pea was later placed in the Royal Museum "if nobody has stolen it."',
    { numeric: { target: 20, min: 1, max: 50, step: 1, unit: 'mattresses' } }),

  g('FOLKLORE', 1, 'k09_athena_olive_tree_beats_poseidon',
    'Poseidon struck the Acropolis for salt water, yet Athena won naming rights to Athens by sprouting the city’s first what?',
    ['Golden autumn wheat sheaf', 'Climbing purple grapevine', 'Wild fig grove', 'Fruitful olive tree'], 3,
    'King Cecrops ruled olive oil gave Athenians lamp light, cooking fat, and export wealth—beats drinking salty seawater any day!'),

  g('FOLKLORE', 1, 'k09_romulus_remus_tiber_she_wolf',
    'Set adrift on the flooded Tiber River, Rome’s twin founders Romulus and Remus survived after being nursed by what beast?',
    ['A wild she-wolf', 'A spotted mountain lynx', 'A temple deer', 'A crested golden eagle'], 0,
    'A woodpecker belonging to war-god Mars also brought berries to the cave ("Lupercal") until shepherd Faustulus adopted the boys.'),

  g('FOLKLORE', 1, 'k09_charon_coin_under_tongue_river_styx',
    'Ancient Greeks tucked a coin ("obol") under a dead relative’s tongue to pay gruff ferryman Charon across which river?',
    ['The River Rubicon', 'The River Styx', 'River Tiber', 'The River Jordan'], 1,
    'Souls buried without fare were said to pace the misty banks for a full century before Charon let penniless stragglers aboard.'),

  g('FOLKLORE', 1, 'k09_sword_of_damocles_single_horsehair',
    'King Dionysius taught flatterer Damocles the dread of power by seating him beneath a banquet sword hung by one what?',
    ['Twisted silk thread', 'Copper wire', 'Single horsehair', 'Braided spider strand'], 2,
    'Glancing upward mid-feast at the gleaming point above his neck, Damocles immediately begged leave to go back to being ordinary!'),

  g('FOLKLORE', 1, 'k09_leprechaun_solitary_cobbler_trade',
    'Irish folklore gives every leprechaun a hidden pot of gold—saved coin by coin practicing what solitary fairy trade?',
    ['Weaving green clover cloaks', 'Brewing peat ale', 'Forging tiny brass buckles', 'Cobbling fairy shoes'], 3,
    'Folklorists trace "leprechaun" to Old Irish luchorpán ("small body")—listen in hedgerows for the tap-tap-tap of his tiny cobbler’s hammer!'),

  g('FOLKLORE', 1, 'k09_roman_janus_january_two_faces',
    'January honors Roman doorway god Janus, stamped on bronze coins gazing into past and future with how many faces?',
    ['2 faces', '3 faces', '4 faces', '12 faces'], 0,
    'Rome threw open the bronze doors of the Temple of Janus in wartime and bolted them shut during rare moments of empire-wide peace.',
    { numeric: { target: 2, min: 1, max: 12, step: 1, unit: 'faces' } }),

  g('FOLKLORE', 1, 'k09_lucky_rabbits_foot_left_hind_paw',
    'Old tavern superstition gets picky: not just any paw works—a true "lucky rabbit’s foot" must come from which leg?',
    ['Front paw', 'Left hind foot', 'Right hind foot', 'Left front paw'], 1,
    'Because a running rabbit’s back paws land ahead of its front paws, folk magic credited the left rear foot with extra reversal luck.'),

  g('FOLKLORE', 1, 'k09_horseshoe_points_up_cup_of_luck',
    'Blacksmith lore insists you nail an iron horseshoe above a barn door with its ends pointing UPWARD for what reason?',
    ['Snag passing summer thunder', 'Pierce prowling night imps', 'Hold luck like a cup', 'Point at Polaris'], 2,
    'Turn the U upside-down, half of country lore warns, and all the good fortune runs straight out onto your boots!'),

  g('FOLKLORE', 1, 'k09_rumpelstiltskin_night_three_baby_price',
    'After taking her necklace and ring to spin straw into gold, Rumpelstiltskin demands what steep payment on night three?',
    ['Half the castle', 'Seven sacks of red rubies', 'Her golden spinning wheel', 'Her firstborn baby'], 3,
    'Overhearing him sing his real name around a forest campfire saves the new queen—making Rumpelstiltskin stomp clean through the floor!'),

  // --- FOLKLORE D2 (43 clues) ---
  g('FOLKLORE', 2, 'k09_scp_173_concrete_statue_blink_rule',
    'Collaborative horror wiki "SCP Foundation" began in 2007 with SCP-173, a concrete statue that lunges when guards do what?',
    ['Blink or look away', 'Speak above low whispers', 'Shine lanterns', 'Switch off room heaters'], 0,
    'Written weeks after "Doctor Who" debuted its Weeping Angels, three D-Class staff must announce every blink before stepping inside.'),

  g('FOLKLORE', 2, 'k09_polybius_1981_portland_arcade_myth',
    'Gaming’s spookiest urban legend claims dark-suited agents harvested player minds in 1981 Portland arcades via what cabinet?',
    ['Tempest Zero', 'Polybius', 'Berzerk Black', 'Qix Plus'], 1,
    'Historians found real 1981 Portland FBI raids busted illegal arcade gambling—mixed with teenagers getting dizzy playing vector-screen Tempest!'),

  g('FOLKLORE', 2, 'k09_flores_hobbit_ebu_gogo_cave_folklore',
    'Villagers on Indonesia’s Flores Island told tales of tiny cave-raiders ("Ebu Gogo") right where diggers found bones dubbed what?',
    ['The Java Pixie', 'Sumatra Mountain Gnome', 'The Flores Hobbit', 'Timor Island Brownie'], 2,
    'Three-foot-six Homo floresiensis hunted dwarf elephants as recently as ~50,000 years ago—hinting oral folk memory may preserve deep echoes!'),

  g('FOLKLORE', 2, 'k09_mayan_2012_calendar_13th_baktun_rollover',
    'December 21, 2012 doomsday panic misread Maya stelae—hitting 13.0.0.0.0 simply rolled the odometer on which 394-year cycle?',
    ['Seventh Golden Sun Wheel', '9th Moon Ring', 'Sacred Jaguar Moon Count', 'The 13th Baktun'], 3,
    'Maya inscriptions at Palenque cheerfully reference anniversaries thousands of years past 2012—treating Baktun 13 like New Year’s Eve!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 2, 'k09_bloody_mary_caputo_troxler_mirror',
    'Psychologist Giovanni Caputo proved dim mirror-staring—like "Bloody Mary" dares—warps your reflection via what brain quirk?',
    ['Troxler visual fading', 'Rapid REM micro-slumber', 'Synchronized pupil pulse', 'Ear canal spin'], 0,
    'Within 60 seconds in dim light, starved edge neurons misassemble your reflection into giant eyes, strangers, or imaginary monsters!'),

  g('FOLKLORE', 2, 'k09_iceland_yule_cat_new_winter_clothes',
    'Icelandic kids unwrap socks with relief on Christmas Eve so giant folklore prowler Jólakötturinn skips eating anyone wearing what?',
    ['Unmade wool beds', 'New winter clothes', 'Cold oat porridge', 'Unpolished boots'], 1,
    'Wool-farming parents spun the monster "Yule Cat" yarn so every farmhand finished carding and knitting autumn fleece before midwinter!'),

  g('FOLKLORE', 2, 'k09_sweden_gavle_goat_golden_straw_arson',
    'Every December since 1966, guards and webcams in Gävle, Sweden protect a 42-foot Christmas goat woven of what against arson?',
    ['Split birch logs', 'Waxed green pine boughs', 'Bundled golden straw', 'Tarred harbor hemp rope'], 2,
    'Despite fences, dogs, and flameproofing, sneaky flame-arrows and Santa-suited vandals have torched the Gävle Goat over thirty times!'),

  g('FOLKLORE', 2, 'k09_catalonia_tio_de_nadal_nougat_log',
    'Catalan kids feed orange peels to a hollow smiling log ("Tió de Nadal") and tap it with sticks on Christmas Eve so it drops what?',
    ['Hot roasted chestnuts', 'Silver pesetas', 'Painted clay whistles', 'Nougat candy treats'], 3,
    'Parents slip turrón almond nougat under the log’s cozy red blanket while sending children into the kitchen to warm up their sticks!'),

  g('FOLKLORE', 2, 'k09_russian_sleep_experiment_15_days',
    'Mistaken online for real 1940s files, creepypasta "The Russian Sleep Experiment" kept subjects awake on gas for how many days?',
    ['15 days', '7 days', '30 days', '100 days'], 0,
    'Real teenager Randy Gardner stayed awake 11 days for a 1964 San Diego science fair—recovering fine after one long fourteen-hour snooze!',
    { numeric: { target: 15, min: 3, max: 100, step: 1, unit: 'days' } }),

  g('FOLKLORE', 2, 'k09_pokemon_mew_under_pickup_truck_rumor',
    'Pre-YouTube 1998 playgrounds swore Pokémon Red & Blue hid mythical #151 Mew near the S.S. Anne ship underneath what sprite?',
    ['Harbor boulder', 'Parked pickup truck', 'Captain’s trash barrel', 'Stack of wooden crates'], 1,
    'Game Freak tipped their cap to the legendary hoax in 2004’s FireRed & LeafGreen by hiding a cheeky Lava Cookie right beside that truck!'),

  g('FOLKLORE', 2, 'k09_slavic_leshy_forest_shoes_backward',
    'Featured in "The Witcher," Slavic forest spirit the Leshy spins hikers in circles unless they pause and flip what?',
    ['Compass needles due south', 'Coat pockets inside out', 'Shoes & coat backward', 'Hats inside out'], 2,
    'Swapping left and right boots broke the woodland trickster’s symmetry spell—giving lost mushroom pickers an excuse for sore feet!'),

  g('FOLKLORE', 2, 'k09_coco_aztec_xolo_spirit_guide_dog',
    'Celebrated in Pixar’s "Coco," Mexican Day of the Dead lore trusts which hairless ancient dog breed to guide souls home?',
    ['Inca hairless', 'Peruvian Inca sighthound', 'Golden techichi lapdog', 'Xoloitzcuintli'], 3,
    'Folklore warns you must treat dogs kindly in life—otherwise no warm Xoloitzcuintli will swim your soul across Mictlan’s wide river!'),

  g('FOLKLORE', 2, 'k09_caracas_christmas_roller_skate_mass',
    'Every December week before Christmas in Caracas, Venezuela, morning streets close to cars so families glide to Mass on what?',
    ['Quad roller skates', 'Wooden soapbox carts', 'Bamboo stilts', 'Unicycles with bells'], 0,
    'Kids used to tie one end of a string to their big toe and dangle the other out the window so passing skaters could tug them awake!'),

  g('FOLKLORE', 2, 'k09_korean_fan_death_closed_room_myth',
    'Decades of South Korean summer urban lore warned against sleeping in a closed room with a fan running, blaming imaginary what?',
    ['Static spark fires', 'Chopped air hypoxia', 'Hot copper motor fumes', 'Chilled freon frostbite'], 1,
    'Electric fan blades cannot slice oxygen molecules apart—though Korean manufacturers still build convenient sleep timers onto fans!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 2, 'k09_oaxaca_night_of_the_radishes_carving',
    'Every December 23 in Oaxaca, Mexico, folk artists race wilting clocks to carve holiday nativity scenes from oversized what?',
    ['Sweet butternut squashes', 'Crisp jicama root bulbs', 'Red garden radishes', 'Green papayas'], 2,
    'Grown up to six pounds specifically for "Noche de Rábanos," the crimson skin and crisp white flesh create natural two-tone relief art!'),

  g('FOLKLORE', 2, 'k09_brunvand_vanishing_hitchhiker_1981',
    'Folklorist Jan Harold Brunvand popularized the term "urban legend" in his 1981 bestseller named after what phantom rider?',
    ['Midnight Bus Driver', 'Phantom Toll Collector', 'Runaway Station Wagon', 'Vanishing Hitchhiker'], 3,
    'In nearly every state’s version, a shivering girl borrows the driver’s letterman jacket—found neatly folded next morning on her gravestone.'),

  g('FOLKLORE', 2, 'k09_doug_dave_1991_crop_circle_planks',
    'Retired English pals Doug Bower and Dave Chorley stunned UFO buffs in 1991 proving they flattened 200+ crop circles with what?',
    ['Rope & wooden planks', 'Lawn-roller rig', 'Wide golf-cart snowshoes', 'Spinning iron tether poles'], 0,
    'Armed only with four-foot boards, clothesline, and a baseball cap wire sight, Doug and Dave sketched patterns over pints at their pub!'),

  g('FOLKLORE', 2, 'k09_babysitter_call_inside_the_house_1979',
    '1960s babysitter lore inspired 1979’s "When a Stranger Calls" via one chilling phone-trace line: the caller is dialing where?',
    ['Back garage', 'Inside the house', 'Down in the cellar', 'Front porch payphone'], 1,
    'Before two-line mansions were common, operators tracing an extension line sparked pure suburban goosebumps around every 1970s campfire.'),

  g('FOLKLORE', 2, 'k09_japan_1979_kuchisake_onna_mask_panic',
    'Spring 1979 rumors swept Japanese schools over "Kuchisake-onna," a masked woman stopping kids on sidewalks with what question?',
    ['"Where is my comb?"', '"Want red or blue?"', '"Am I pretty?"', '"Got candy?"'], 2,
    'Clever schoolkids invented an escape loophole: answer "You look average" to confuse her just long enough to sprint home—or toss hard candy!'),

  g('FOLKLORE', 2, 'k09_halloween_stranger_poison_candy_hoax',
    'Sociologist Joel Best studied 35+ years of "stranger-poisoned Halloween candy" panic and proved random neighbors killed how many?',
    ['Roughly five every fall', 'Twelve across the 1970s', 'Three in Ohio', 'Zero confirmed kids'], 3,
    'Nearly every needle-in-an-apple report turned out to be a sibling prank chasing extra chocolate—yet hospitals still offered free X-rays!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 2, 'k09_mothman_1966_point_pleasant_tnt_area',
    'November 1966’s famous Mothman car chase began when couples drove past concrete WWII munition domes locally nicknamed what?',
    ['The TNT Area', 'Bunker Hill Nine', 'Powder Keg Hollow', 'Ammo Hollow'], 0,
    'Witness Roger Scarberry swore a seven-foot winged figure with glowing red eyes kept pace effortlessly as his Chevy hit 100 mph!'),

  g('FOLKLORE', 2, 'k09_mrs_fields_250_cookie_recipe_chain',
    'Photocopied across 1980s offices—then emailed in the 90s—which cookie chain got hit by a fake "$250 recipe bill" legend?',
    ['Famous Amos Cookie Tin', 'Mrs. Fields Cookies', 'Pepperidge Farm', 'Entenmann’s Pastry Box'], 1,
    'The exact same "revenge recipe" hoax had targeted Waldorf-Astoria red velvet cake in the 1940s and Neiman Marcus in the 1990s!'),

  g('FOLKLORE', 2, 'k09_car_door_hook_lovers_lane_handle',
    'In 1960s campfire classic "The Hook," teens speed home from Lover’s Lane after a radio bulletin and find a hook hanging where?',
    ['Rear tail bumper', 'Driver windshield wiper', 'Passenger door handle', 'Bent radio whip antenna'], 2,
    'Dear Abby printed a reader’s version in November 1960, cementing America’s quintessential cautionary drive-in ghost story.'),

  g('FOLKLORE', 2, 'k09_headlight_flash_gang_initiation_hoax',
    'Faxed through 1993 offices and revived online every decade, a bogus alert warned drivers never to flash high-beams at what?',
    ['Parked yellow delivery vans', 'Slow tow trucks', 'Sedans with hazard blinkers', 'Night cars lights-off'], 3,
    'Police departments nationwide debunked the "gang initiation" chain memo repeatedly—reminding motorists a polite flash just helps forgetful drivers!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 2, 'k09_wyoming_jackalope_herrick_brothers',
    'Postcards of the antlered "Jackalope" boomed after 1930s teen taxidermists Douglas and Ralph Herrick grafted prongs where?',
    ['Douglas, Wyoming', 'Roswell, New Mexico', 'Moab, Utah', 'Bozeman, Montana'], 0,
    'Douglas Chamber of Commerce still issues official "Jackalope Hunting Licenses"—valid strictly for two hours on June 31!'),

  g('FOLKLORE', 2, 'k09_canada_ogopogo_okanagan_palindrome',
    'British Columbia’s famous lake serpent—whose palindrome name "Ogopogo" came from a 1924 song—reportedly swims which lake?',
    ['Great Bear Lake', 'Okanagan Lake', 'Lake Winnipeg', 'Lake Louise'], 1,
    'Long before settlers coined "Ogopogo," Syilx Okanagan elders respected lake spirit N’ha-a-itk when paddling calm waters near Kelowna.'),

  g('FOLKLORE', 2, 'k09_wizard_of_oz_crane_vhs_rumor',
    'Fuzzy 1990 VHS pauses of "The Wizard of Oz" fueled a grim rumor—until HD remasters proved the background flutter was what?',
    ['Falling painted stage leaf', 'Stagehand’s coat', 'Exotic zoo crane bird', 'Swinging hemp rope pulley'], 2,
    'MGM rented live peacocks, toucans, and a big sarus crane from the Los Angeles Zoo so Oz’s Technicolor forest looked bustling!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 2, 'k09_phil_collins_in_the_air_drowning_myth',
    'Quoted in Eminem’s "Stan," an 80s rock urban legend claimed Phil Collins wrote "In the Air Tonight" to expose a man who did what?',
    ['Robbed a London orphanage', 'Fled a rainy hit-and-run', 'Burned old tapes', 'Watched someone drown'], 3,
    'Collins laughed on BBC interviews that he improvised those haunting lyrics off the cuff during messy divorce heartbreak—zero crime scenes!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 2, 'k09_kidney_theft_ice_bathtub_1997_email',
    'Forwarded to millions of 1997 inboxes, a classic travel urban legend ended with a groggy victim waking inside what?',
    ['Motel tub of ice', 'Airport baggage bin', 'Bus terminal', 'Subway sleeper car'], 0,
    'Real transplant surgeons pointed out human kidneys require hours of HLA tissue-matching before surgery—never a spontaneous hotel ice bucket!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 2, 'k09_bubble_yum_spider_eggs_1977_ads',
    'Life Savers ran full-page 1977 newspaper ads to quash schoolyard rumors that soft pink Bubble Yum owed its chewiness to what?',
    ['Rubber erasers', 'Ground spider eggs', 'Boiled bay jellyfish', 'Powdered silkworms'], 1,
    'Rival candy rumors spread so fast among seventh-graders that sales dipped in two weeks before executives published every real ingredient!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 2, 'k09_flatwoods_monster_ace_of_spades_hood',
    'Spotted in 1952 West Virginia—and featured in Fallout 76—the 10-foot Flatwoods Monster frames glowing eyes inside what shape?',
    ['Crescent silver moon horn', 'Jagged lightning starburst', 'Ace-of-spades cowl', 'Brass dive helm'], 2,
    'Skeptics suspect a bright fireball meteor followed by a hissed-at barn owl perched on an oak limb created that iconic spade-shaped silhouette.'),

  g('FOLKLORE', 2, 'k09_amityville_horror_315_am_wakeup_lore',
    'Jay Anson’s 1977 "Amityville Horror" shaped haunted-house lore by claiming George Lutz bolted wide awake nightly at what hour?',
    ['12:01 AM sharp', '2:22 AM chimes', '4:44 AM frost', '3:15 AM'], 3,
    'Subsequent horror movies turned ~3:00–3:15 AM into cinema’s "witching hour" shorthand whenever digital nightstand clocks flicker onscreen.'),

  g('FOLKLORE', 2, 'k09_birthday_candles_artemis_moon_cakes',
    'Blowing out birthday candles traces back to ancient Greeks setting tapers on round honey cakes for which moon goddess?',
    ['Huntress Artemis', 'Hearth Hestia', 'Harvest queen Demeter', 'Rainbow messenger Iris'], 0,
    'Rising candle smoke was thought to carry silent wishes upward to Artemis—while 18th-century German Kinderfest added one extra "light of life" candle!'),

  g('FOLKLORE', 2, 'k09_arachne_weaving_scandal_tapestry',
    'Spiders are called "arachnids" after mortal weaver Arachne outraged Athena—not by losing, yet by weaving flawless scenes of what?',
    ['Athena’s armored childhood', 'Olympian love scandals', 'Troy walls burning', 'Chained Titans breaking out'], 1,
    'Ovid notes Athena found zero flaw in Arachne’s needlework—furious at Zeus’s depicted swan-and-bull disguises, she turned Arachne into a spider!'),

  g('FOLKLORE', 2, 'k09_apollo_daphne_bay_laurel_wreath',
    'Fleeing lovestruck Apollo, river nymph Daphne turned into evergreen bark—explaining why Greek victors wore crowns of what?',
    ['Silver mountain birch', 'Wild rosemary', 'Bay laurel leaves', 'Weeping willow fronds'], 2,
    'Greek "daphne" literally means bay laurel—giving modern winners the phrase "resting on your laurels" and "poet laureate"!'),

  g('FOLKLORE', 2, 'k09_thor_bridal_veil_thrymskvida_wedding',
    'When frost giant Thrym demanded Freyja’s hand for stolen Mjölnir, bearded Thor crashed the wedding feast disguised in what?',
    ['Jester’s motley bells', 'Harp-player’s wool cloak', 'Bearskin apron', 'Linen bridal veil'], 3,
    'Bridesmaid Loki fast-talked suspicious Thrym ("Freyja hasn’t eaten in eight days from excitement!") after veiled Thor ate an entire ox!'),

  g('FOLKLORE', 2, 'k09_freyja_first_pick_slain_cat_chariot',
    'Valkyries bring Odin second half: which Norse goddess claims FIRST pick of slain warriors, riding a chariot pulled by two cats?',
    ['Goddess Freyja', 'Golden-haired Sif', 'Apple-keeper Idunn', 'Queen Frigg'], 0,
    'Grímnismál states Freyja welcomes half the slain heroes every battle into her meadow hall Fólkvangr—leaving the remaining half to Odin!'),

  g('FOLKLORE', 2, 'k09_andersen_little_mermaid_1837_sea_foam',
    'Skip singing crabs: in Hans Christian Andersen’s 1837 "Little Mermaid," she spares the sleeping prince and dissolves into what?',
    ['Coral branches', 'Buoyant sea foam', 'Singing white pearls', 'Warm southern winds'], 1,
    'Daughters of the Air welcome her kindly, promising she can still earn an immortal soul through three centuries of unseen good deeds.'),

  g('FOLKLORE', 2, 'k09_rapunzel_named_for_stolen_rampion',
    'Why did the Grimms’ sorceress name Rapunzel "Rapunzel"? Her father climbed the garden wall to steal what salad craving?',
    ['Wild raspberries', 'Golden orchard quinces', 'Crisp rampion greens', 'Sweet Mediterranean figs'], 2,
    'In German, "Rapunzel" is crunchy bellflower/lamb’s lettuce—making fairy-tale history’s most famous princess literally named "Salad"!'),

  g('FOLKLORE', 2, 'k09_wedding_ring_fourth_finger_heart_vein',
    'Romans and Tudors placed wedding rings on the left fourth finger trusting folk anatomy’s "vena amoris"—a vein running where?',
    ['Up to the left tear duct', 'To the tongue', 'Across both collarbones', 'Straight to the heart'], 3,
    'Real circulatory veins branch identically across all five fingers—yet the romantic myth stuck permanently across Western weddings!',
    { isKlaxonMyth: true }),

  g('FOLKLORE', 2, 'k09_bridal_veil_matching_bridesmaids_decoys',
    'Ancient Roman brides wore flame-bright veils surrounded by matching bridesmaids—not for portraits, yet to confuse whom?',
    ['Jealous evil spirits', 'Tax-collecting scribes', 'Rival patrician clans', 'Tavern crashers'], 0,
    'Decoy bridesmaids dressed just like the bride acted as spiritual bodyguards so ill-wishing demons couldn’t tell which woman to hex!'),

  g('FOLKLORE', 2, 'k09_grimm_hansel_gretel_spiced_cake_roof',
    'In the Brothers Grimm woods, starving Hansel and Gretel nibble a witch’s house of bread, clear sugar panes, and a roof of what?',
    ['Salted Bavarian pretzels', 'Spiced gingerbread cake', 'Candied Seville oranges', 'Whipped meringue'], 1,
    'Clever Gretel fakes not knowing how to check the oven temperature—tricking the nearsighted witch into leaning inside first!'),

  g('FOLKLORE', 2, 'k09_skinwalker_ranch_navajo_pelt_taboo',
    'TV turned Utah’s "Skinwalker Ranch" into UFO lore, borrowing a solemn Navajo term ("yee naaldlooshii") for witches wearing what?',
    ['Woven reed masks', 'Painted white owl plumes', 'Coyote or wolf pelts', 'Hammered blue turquoise'], 2,
    'Traditional Diné culture treats speaking of skinwalkers to outsiders as deeply taboo—far removed from modern reality-TV laser experiments.'),

  // --- FOLKLORE D3 (16 clues) ---
  g('FOLKLORE', 3, 'k09_conjuring_real_annabelle_raggedy_ann',
    'Hollywood’s "Conjuring" swapped in scary porcelain—Connecticut’s real locked-case Annabelle is actually a plush what?',
    ['Kewpie cutie', 'Chatty Cathy playmate', 'Velveteen patch bunny', 'Raggedy Ann doll'], 3,
    'Filmmakers feared a triangle-nosed yarn Raggedy Ann looked too cuddly on IMAX posters—plus Hasbro wasn’t eager to license a horror slasher!',
    {
      shutters: {
        shutters: [
          'Gifted to a Hartford nursing student in 1970',
          'Kept behind blessed glass in Monroe, Connecticut',
          'Hollywood replaced its red yarn hair with cracked china',
          'Classic storybook stitched toy sporting a triangle nose',
        ],
      },
    }),

  g('FOLKLORE', 3, 'k09_2016_creepy_clown_panic_greenville',
    'August 2016 sparked a global viral folklore panic after Greenville, South Carolina kids reported creepy clowns doing what?',
    ['Whispering in woods', 'In circus vans', 'Juggling on footbridges', 'Tying red sewer balloons'], 0,
    'Zero clowns showed up on Greenville police cameras, yet copycat pranks and Stephen King "It" buzz spread sightings to twenty countries in weeks!'),

  g('FOLKLORE', 3, 'k09_iceland_13_yule_lads_door_slammer',
    'Instead of one Santa, Icelandic kids leave windowsill shoes for 13 nights visited by brothers like "Spoon-Licker" and who?',
    ['Chimney-Whistler', 'Door-Slammer', 'Pot-Scraper', 'Candle-Snuffer'], 1,
    'Good kids wake to candy in their shoe; lazy kids get a raw rotting potato from pranksters Sausage-Swiper, Bowl-Licker, and Door-Slammer!'),

  g('FOLKLORE', 3, 'k09_men_in_black_gray_barker_1956_book',
    'Before Will Smith’s 1997 hit, West Virginia author Gray Barker popularized UFO lore’s dark-suited "Men in Black" silencing whom?',
    ['Antarctic radio crews', 'Nevada rocket pilots', 'Saucer witnesses', 'Radar techs'], 2,
    'Barker’s tongue-in-cheek 1956 book "They Knew Too Much About Flying Saucers" turned Cadillac-driving mystery visitors into permanent sci-fi myth.'),

  g('FOLKLORE', 3, 'k09_blair_witch_1999_imdb_missing_marketing',
    '1999’s "Blair Witch Project" pioneered viral internet folklore by listing its three healthy young actors how on IMDb?',
    ['Under federal witness care', 'Filming sequels in Prague', 'Quit acting young', 'Missing, presumed dead'], 3,
    'Shot for ~$60,000 with improvised woods scares, its fake Maryland mythology website convinced millions they were watching recovered police tape!'),

  g('FOLKLORE', 3, 'k09_rhinelander_wisconsin_hodag_hoax',
    'Prankster Eugene Shepard carved—and staged ox-pit photos of—which green-spined cryptid mascot of Rhinelander, Wisconsin?',
    ['The Hodag', 'Skunk Ape', 'The Squonk', 'The Snallygaster'], 0,
    'When Smithsonian scientists announced they were coming to inspect Shepard’s "captured" Hodag in 1896, he hastily confessed the carved-wood gag!'),

  g('FOLKLORE', 3, 'k09_lake_champlain_monster_champ_laws',
    'Protected by affectionate resolutions in both Vermont and New York, Lake Champlain’s storied cousin of Nessie is nicknamed what?',
    ['Chessie', 'Champ', 'Memphre', 'Bessie'], 1,
    'Sandra Mansi’s sunlit 1977 Polaroid of a dark head rising off Lake Champlain remains North America’s most debated lake-monster snapshot.'),

  g('FOLKLORE', 3, 'k09_microwave_pet_legend_1940s_gas_ovens',
    'Folklorists showed the 1970s "poodle dried in a microwave" urban legend simply recycled 1940s technophobia tales blaming new what?',
    ['Spin-dry tubs', 'Electric hair bonnets', 'Gas baking ovens', 'Sunlamp tanning beds'], 2,
    'Whenever an unfamiliar heating gadget enters kitchens, folklore recycles the exact same cautionary plot onto the newest appliance!'),

  g('FOLKLORE', 3, 'k09_snopes_born_on_usenet_alt_folklore',
    'Fact-checking site Snopes.com grew out of Barbara and David Mikkelson’s 1994 hobby debunking chain tales on which forum?',
    ['AOL Ghost Chat', 'Prodigy Rumor Exchange', 'AOL Ghost Story Keyword', 'Usenet alt.folklore'], 3,
    'David posted under handle "Snopes"—borrowed from William Faulkner’s recurring Southern family—turning a hobby newsgroup into the web’s rumor desk!',
    {
      shutters: {
        shutters: [
          'Started in 1994 before modern search engines existed',
          'Named after a scheming clan in William Faulkner novels',
          'Debunked faxed and emailed chain warnings one by one',
          'Born on dial-up text discussion boards for urban rumors',
        ],
      },
    }),

  g('FOLKLORE', 3, 'k09_gilgamesh_plant_of_youth_stolen_snake',
    'Exhausted king Gilgamesh dives to the seabed for a thorny herb restoring youth—only to lose it while bathing to what thief?',
    ['A slithering snake', 'A laughing black raven', 'A river crab', 'A disguised ferryman'], 0,
    'Mesopotamia’s 4,000-year-old epic explains that snakes shed their old skins right on the spot—leaving weeping mortals to grow gray!'),

  g('FOLKLORE', 3, 'k09_grimm_snow_white_red_hot_iron_shoes',
    'At Snow White’s wedding in the 1812 Grimm tale, waiters bring fire tongs forcing the wicked stepmother to dance wearing what?',
    ['Weighted lead boots', 'Glowing iron shoes', 'Briar-thorn slippers', 'Tarred clogs'], 1,
    'Nineteenth-century parents eventually asked Jacob and Wilhelm Grimm to tone down several punishments across later nursery editions!'),

  g('FOLKLORE', 3, 'k09_sun_wukong_72_earthly_transformations',
    'In Ming classic "Journey to the West," Monkey King Sun Wukong outwits Heaven’s army mastering how many shapeshifting forms?',
    ['36 forms', '49 forms', '72 forms', '108 forms'], 2,
    'His one telltale shapeshifting blindspot is his monkey tail—once turning himself into a roadside temple with his tail disguised as the flagpole!',
    { numeric: { target: 72, min: 12, max: 108, step: 1, unit: 'forms' } }),

  g('FOLKLORE', 3, 'k09_maui_north_island_giant_stingray_fish',
    'Māori lore names New Zealand’s North Island "Te Ika-a-Māui" because demigod Māui hauled it up shaped like what sea creature?',
    ['A mako shark', 'A leatherback turtle', 'A bluefin ocean tuna', 'A giant stingray'], 3,
    'Look at Wellington Harbor and East Cape on a map—Māui’s impatient brothers hacked into the giant ray’s back, carving North Island’s mountains!'),

  g('FOLKLORE', 3, 'k09_abominable_snowman_1921_calcutta_cable',
    'How did "Abominable Snowman" enter English in 1921? A Calcutta reporter translated Tibetan "metoh-kangmi" ("man-bear") as what?',
    ['Howling glacier monarch', 'Filthy or abominable', 'Shaggy summit wanderer', 'Glacier hermit'], 1,
    'Everest expedition Sherpas merely said "wild man-bear of the snows," yet Henry Newman’s spooky adjective sold newspapers worldwide!'),

  g('FOLKLORE', 3, 'k09_oshkosh_wisconsin_backrooms_hobbytown',
    'Internet sleuths cracked creepypasta’s top mystery in May 2024, tracing the 2002 "Backrooms" photo to a shop in which state?',
    ['Minnesota', 'Michigan', 'Wisconsin', 'Illinois'], 2,
    'Archived 2003 Yahoo renovation snapshots of Oshkosh’s former Rohner’s Furniture—now an RC car track at HobbyTown—matched every pillar!',
    {
      shutters: {
        shutters: [
          'Tracked down in May 2024 via Wayback Machine archives',
          'Originally snapped in 2002 during upstairs remodeling',
          'Former furniture showroom converted into an RC raceway',
          'Midwestern Badger State famous for cheese and airshows',
        ],
      },
    }),

  g('FOLKLORE', 3, 'k09_wendigo_algonquian_winter_greed_taboo',
    'Before Hollywood added deer antlers, Algonquian winter lore invoked the gaunt Wendigo to warn communities against icy what?',
    ['Poaching sacred white elk', 'Cracking frozen beaver dams', 'Cold hearths', 'Greed & hoarding'], 3,
    'In Cree and Ojibwe teachings, the Wendigo grows taller with every bite it eats, embodying insatiable avarice during brutal subzero winters.',
    {
      shutters: {
        shutters: [
          'Traditional Cree and Ojibwe cautionary winter spirit',
          'Deer antlers were added much later by 20th-century art',
          'Grows larger in proportion to everything it devours',
          'Warns neighbors never to forsake sharing during blizzards',
        ],
      },
    }),

  // ==========================================================================
  // 2. FINANCE (108 CLUES: 49 D1, 43 D2, 16 D3 | ~42% 2000s-2026, ~34% 60s-90s, ~24% Classic)
  // ==========================================================================

  // --- FINANCE D1 (49 clues) ---
  g('FINANCE', 1, 'k09_bitcoin_pizza_day_papa_johns_10000',
    'Every May 22 marks "Bitcoin Pizza Day" because coder Laszlo Hanyecz spent 10,000 BTC in 2010 on two pies from which chain?',
    ['Papa John’s', 'Domino’s Pizza', 'Little Caesars', 'Sbarro'], 0,
    'Worth ~$41 at the time, those two Jacksonville pizzas would top hundreds of millions of dollars at modern 2025–2026 Bitcoin prices!'),

  g('FINANCE', 1, 'k09_bitcoin_21_million_hard_supply_cap',
    'Unlike central banks printing extra bills, Satoshi Nakamoto’s code permanently caps total Bitcoin supply at how many million?',
    ['10 million', '21 million', '50 million', '100 million'], 1,
    'Block rewards halve roughly every four years, meaning the final tiny satoshis won’t finish mining until around the year 2140!',
    { numeric: { target: 21, min: 1, max: 100, step: 1, unit: 'million' } }),

  g('FINANCE', 1, 'k09_apple_first_3_trillion_market_cap',
    'Which Cupertino giant made Wall Street history in June 2023 as the first public company to close above a $3 trillion value?',
    ['Dell Tech', 'Amazon Web Corp', 'Apple Inc.', 'Meta Platforms'], 2,
    'Apple crossed $1T in 2018, $2T in 2020, and $3T in 2023—making one single California company worth more than London’s entire FTSE 100!'),

  g('FINANCE', 1, 'k09_nvidia_dennys_booth_ai_3_trillion',
    'Sketched at a San Jose Denny’s booth in 1993 for 3D PC games, which green-logo chipmaker rocketed past $3T fueling global AI?',
    ['Broadcom', 'Qualcomm Snapdragon', 'AMD Radeon Systems', 'NVIDIA Corp'], 3,
    'CEO Jensen Huang washed dishes at Denny’s as a teen—decades later, the diner put a commemorative plaque over NVIDIA’s founding booth!'),

  g('FINANCE', 1, 'k09_gamestop_2021_reddit_short_squeeze',
    'In January 2021, Reddit’s r/WallStreetBets traders squeezed multibillion-dollar hedge funds shorting which mall chain?',
    ['GameStop', 'RadioShack', 'Circuit City', 'Spencer Gifts'], 0,
    'Hedge funds had shorted over 140% of GameStop’s available shares—forcing frantic buybacks as the stock leaped from ~$17 to $483!'),

  g('FINANCE', 1, 'k09_diamond_hands_vs_paper_hands_slang',
    'Meme-stock traders flash diamond emojis ("diamond hands") when holding steady—teasing nervous early sellers as having what?',
    ['Butter fingers', 'Paper hands', 'Silk palms', 'Glass wrists'], 1,
    'Born on WallStreetBets options threads, "diamond hands vs. paper hands" jumped into mainstream CNBC anchors’ vocabulary overnight in 2021.'),

  g('FINANCE', 1, 'k09_taylor_swift_fed_beige_book_2023',
    'In July 2023, the Philadelphia Fed’s official "Beige Book" credited surging summer hotel tax revenue to whose stadium tour?',
    ['Beyoncé Knowles', 'Bruno Mars', 'Taylor Swift', 'Bruce Springsteen'], 2,
    'Economists coined "Swiftonomics" as Eras Tour fans packed downtown hotels, trains, and restaurants across five continents!'),

  g('FINANCE', 1, 'k09_netflix_50m_blockbuster_rejection_2000',
    'In 2000, Reed Hastings flew to Dallas offering to sell young Netflix for $50 million—getting turned down cold by which chain?',
    ['Suncoast Video', 'Tower Records USA', 'Suncoast Motion Video', 'Blockbuster Video'], 3,
    'Ten years later Blockbuster filed for bankruptcy while Netflix grew past a $300+ billion streaming titan—with one lone Bend, Oregon store left!'),

  g('FINANCE', 1, 'k09_dogecoin_shiba_inu_kabosu_parody',
    'Coded in two hours in 2013 to parody crypto hype, multi-billion-dollar Dogecoin features the face of what Japanese dog breed?',
    ['Shiba Inu', 'Curly Akita', 'Hokkaido', 'Tosa Mastiff'], 0,
    'Rescue dog Kabosu’s side-eyeing couch photo became the "Doge" meme—inspiring a joke token that briefly passed $80 billion in market value!'),

  g('FINANCE', 1, 'k09_berkshire_class_a_house_share_price',
    'Because Warren Buffett refuses to split Berkshire Hathaway’s Class A stock, buying ONE single share in 2025 costs roughly what?',
    ['A Swiss gold wristwatch', 'A suburban family home', 'A family sedan', 'Four first-class tickets'], 1,
    'Trading north of $650,000–$750,000 per single share, BRK.A forced Nasdaq computers to upgrade integer limits just to display its price!'),

  g('FINANCE', 1, 'k09_lehman_brothers_2008_record_bankruptcy',
    'Hauling boxes out of Manhattan on September 15, 2008, which 158-year-old Wall Street bank filed the largest U.S. bankruptcy?',
    ['Bear Stearns', 'Merrill Lynch Co.', 'Lehman Brothers', 'Salomon Smith Co.'], 2,
    'Started by three Bavarian dry-goods brothers in 1850 Alabama, Lehman’s sudden Monday collapse froze global credit markets within hours.'),

  g('FINANCE', 1, 'k09_negative_37_oil_futures_april_2020',
    'When April 2020 lockdowns filled Oklahoma oil tanks to the brim, panicked futures traders settled U.S. crude near what price?',
    ['Zero dollars', 'Plus two dollars even', 'Ten cents per gallon', 'Minus $37 a barrel'], 3,
    'Holders of expiring May contracts had nowhere to park real physical oil in Cushing, Oklahoma—so they paid buyers $37 a barrel to haul it!'),

  g('FINANCE', 1, 'k09_silicon_valley_bank_2023_mobile_run',
    'Spurred by VC group chats and mobile banking apps in March 2023, startups wired $42 billion in one day out of which lender?',
    ['Silicon Valley Bank', 'First Republic West', 'Sand Hill Bank', 'Sand Hill Bancorp'], 0,
    'Unlike 1930s sidewalk lines in the rain, history’s fastest digital bank run happened silently via iPhones between breakfast and dinner!'),

  g('FINANCE', 1, 'k09_ftx_2022_bahamas_penthouse_collapse',
    'Before FTX’s $32 billion crypto exchange imploded in eight days in 2022, Sam Bankman-Fried ran trades from which islands?',
    ['Isle of Man', 'The Bahamas', 'Bermuda Atoll', 'Virgin Islands'], 1,
    'Ten roommates traded billions in customer funds out of a $30 million Nassau "Orchid" penthouse before bankruptcy lawyers pulled the plug.'),

  g('FINANCE', 1, 'k09_costco_membership_fees_operating_profit',
    'Costco caps retail grocery markups around 14%, earning the vast majority of its annual operating profit from what source?',
    ['Parking-lot gas stations', 'Food-court pizza', 'Annual membership fees', 'Pharmacy co-pay spreads'], 2,
    'Renewal rates top 90%—letting Costco sell $4.99 rotisserie chickens and $1.50 hot dogs at razor margins while banking billions in dues!'),

  g('FINANCE', 1, 'k09_starbucks_app_float_commercial_banks',
    'Customers keep over $1.5 billion preloaded inside the Starbucks app—handing the chain more zero-interest float than many what?',
    ['State lottery jackpots', 'Interstate tollways', 'Casino cages', 'Regional deposit banks'], 3,
    'Plus roughly 10% of gift cards never get redeemed ("breakage")—turning forgotten stocking stuffers into pure zero-bean profit!'),

  g('FINANCE', 1, 'k09_suez_canal_ever_given_2021_sandstorm',
    'Wedged across Egypt’s Suez Canal for six days in March 2021, megaship Ever Given froze $9B a day in trade during gusty what?',
    ['Desert sandstorms', 'Red Sea whirlpools', 'Harbor fogs', 'Tidal bore swells'], 0,
    'One tiny yellow Komatsu excavator digging at the 1,300-foot hull’s bow became 2021’s most relatable workplace productivity meme!'),

  g('FINANCE', 1, 'k09_us_mint_penny_costs_nearly_four_cents',
    'Why did U.S. Treasury officials move in 2025–2026 to stop minting Lincoln pennies? Striking each 1-cent coin cost roughly what?',
    ['Half a cent', 'Nearly 4 cents each', 'Exactly 12 cents each', 'Twenty-five cents'], 1,
    'Mint reports showed taxpayers lost over $85 million a year manufacturing billions of zinc-core pennies destined straight for dresser jars!'),

  g('FINANCE', 1, 'k09_canada_2013_penny_free_cash_rounding',
    'Since Canada retired its penny in 2013, card taps still bill exact cents ($4.02) while cash totals round to the nearest what?',
    ['Ten-cent silver dime', 'Twenty-five-cent coin', 'Five-cent nickel', 'Whole loonie'], 2,
    'Economists confirmed rounding $4.01–$4.02 down and $4.03–$4.04 up washes out completely neutral—saving cashiers millions of hours!'),

  g('FINANCE', 1, 'k09_fico_credit_score_850_top_ceiling',
    'Created by Fair, Isaac and Company, America’s standard FICO credit score grades borrowers from 300 up to what top ceiling?',
    ['750', '800', '990', '850'], 3,
    'Roughly 1.5% of Americans hold a spotless 850—though lenders hand out identical rock-bottom mortgage rates anywhere above ~760–780!',
    { numeric: { target: 850, min: 300, max: 1000, step: 10, unit: 'score' } }),

  g('FINANCE', 1, 'k09_wework_ipo_5_9_million_we_trademark',
    'In WeWork’s infamous 2019 IPO filing, investors gasped seeing CEO Adam Neumann billed his own firm $5.9M for rights to what?',
    ['The word "We"', 'Free office beer taps', 'His barefoot sketch', 'Logo mugs'], 0,
    'Public uproar forced Neumann to return the $5.9 million "We" trademark fee within days—right before WeWork pulled its IPO completely!'),

  g('FINANCE', 1, 'k09_airline_miles_2020_worth_more_than_jets',
    'During 2020’s pandemic travel freeze, major U.S. airlines raised billions after Wall Street valued what higher than their jets?',
    ['Airport lounge buffets', 'Frequent-flyer programs', 'Takeoff slots', 'Belly mail contracts'], 1,
    'Credit-card banks buy billions of dollars in airline miles every year—making United’s MileagePlus worth ~$22B when United itself was $9B!'),

  g('FINANCE', 1, 'k09_new_coke_1985_79_day_u_turn',
    'Rattled by Pepsi taste tests in 1985, Coca-Cola scrapped its 1886 formula—then rushed "Classic" back after how many days?',
    ['14 days', '45 days', '79 days', '180 days'], 2,
    'Angry callers flooded Atlanta’s 1-800 hotline 8,000 times a day—making Coca-Cola Classic’s July return outsell Pepsi by year-end!',
    { numeric: { target: 79, min: 10, max: 120, step: 1, unit: 'days' } }),

  g('FINANCE', 1, 'k09_aw_third_pound_burger_fraction_flop',
    'A&W’s cheaper, juicier 1/3-pound burger lost 1980s burger wars against McDonald’s Quarter Pounder because shoppers thought what?',
    ['A&W mixed turkey meat in', 'Sold raw sliders', 'Root beer ruined beef fat', '1/3 lb weighed less'], 3,
    'Focus groups complained "Why pay the same for less meat?" because 4 is bigger than 3—turning basic fractions into marketing heartbreak!',
    { isKlaxonMyth: true }),

  g('FINANCE', 1, 'k09_lamborghini_1963_enzo_ferrari_clutch',
    'Tractor tycoon Ferruccio Lamborghini started building V12 supercars in 1963 after Enzo Ferrari mocked his complaint about what?',
    ['Sports-car clutch', 'Stiff leather bucket seat', 'Loud tailpipes', 'Foggy dash tachometer'], 0,
    'Discovering Ferrari bolted the exact same Borg & Beck clutch used in his farm tractors onto luxury GT cars, Lamborghini built his own rival!'),

  g('FINANCE', 1, 'k09_nike_1971_35_dollar_swoosh_invoice',
    'Before later gifting her lucrative stock, Phil Knight paid student Carolyn Davidson how many dollars in 1971 for Nike’s Swoosh?',
    ['$10', '$35', '$75', '$100'], 1,
    'Billed at $2 an hour for 17.5 hours, Knight shrugged "I don’t love it, maybe it will grow on me"—before gifting her stock plus a diamond Swoosh ring!',
    { numeric: { target: 35, min: 5, max: 100, step: 5, unit: 'dollars' } }),

  g('FINANCE', 1, 'k09_microsoft_150m_apple_lifeline_1997',
    'Weeks from insolvency in August 1997, Steve Jobs stunned booing Macworld fans announcing a $150M investment from which rival?',
    ['Sun Micro', 'Oracle Corp', 'Microsoft', 'Intel Corp'], 2,
    'Bill Gates beamed down on a giant overhead screen while Jobs told the crowd Apple had to drop zero-sum rivalries to survive—and build the iMac!'),

  g('FINANCE', 1, 'k09_yahoo_passes_on_1m_google_1998',
    'Grad students Larry Page and Sergey Brin offered to sell Google for $1M in 1998 to finish Stanford—which portal said no?',
    ['Ask Jeeves', 'Lycos Search', 'AltaVista', 'Yahoo!'], 3,
    'Yahoo didn’t want users clicking away from banner ads fast—four years later Yahoo offered $3B, Google asked $5B, and Yahoo passed again!'),

  g('FINANCE', 1, 'k09_fedex_hidden_white_arrow_1994_logo',
    'Look closely between the "E" and "x" on any FedEx van since 1994 and negative white space secretly forms what crisp shape?',
    ['Right-pointing arrow', 'Winged parcel carton', 'Spinning compass star', 'Checkered flag'], 0,
    'Designer Lindon Leader tweaked two fonts over 200 times so the hidden white arrow whispered forward speed without cluttering the truck.'),

  g('FINANCE', 1, 'k09_black_monday_1987_22_percent_drop',
    'Still the steepest one-day percentage drop in Dow Jones history, "Black Monday" in October 1987 wiped out roughly what percent?',
    ['12%', '22%', '38%', '50%'], 1,
    'Dow plunged 508 points (22.6%) in six hours as portfolio-insurance computers snowballed sell orders across Tokyo, London, and New York.',
    { numeric: { target: 22, min: 5, max: 50, step: 1, unit: 'percent' } }),

  g('FINANCE', 1, 'k09_buffett_1965_berkshire_cotton_mills',
    'Warren Buffett calls buying Berkshire Hathaway in 1965 a spiteful mistake—back then, the struggling New England firm wove what?',
    ['Sailboat canvas', 'Woolen army blankets', 'Cotton suit linings', 'Patterned silk neckties'], 2,
    'Angered when CEO Seabury Stanton chipped 12.5 cents off a tender offer, Buffett bought control out of pique—then pivoted into insurance!'),

  g('FINANCE', 1, 'k09_db_cooper_1971_200k_ransom_bills',
    'Clip-on tie neat, skyjacker "D.B. Cooper" leaped from a Boeing 727 in November 1971 clutching $20 bills totaling how much?',
    ['$50,000', '$100,000', '$500,000', '$200,000'], 3,
    'None of the 10,000 recorded serial numbers ever entered bank circulation—until an eight-year-old boy dug $5,800 out of Columbia River sand in 1980!'),

  g('FINANCE', 1, 'k09_gardner_museum_1990_empty_gold_frames',
    'Thieves dressed as Boston cops stole $500M in art in 1990—and the Gardner Museum still hangs what on its gallery walls?',
    ['Empty gilded frames', 'Velvet drapes', 'Wanted-poster prints', 'Chalk outline sketches'], 0,
    'Left hanging as placeholders awaiting the paintings’ return, the empty frames draw visitors alongside a standing $10 million reward.'),

  g('FINANCE', 1, 'k09_australia_1988_polymer_plastic_bills',
    'Tired of counterfeiters and soggy surf pockets, which nation debuted clear-window polymer plastic banknotes in 1988?',
    ['New Zealand', 'Australia', 'Singapore', 'Switzerland'], 1,
    'Developed by CSIRO scientists and the Reserve Bank of Australia, polymer bills last four times longer than paper and recycle into plant pots!'),

  g('FINANCE', 1, 'k09_first_barcode_1974_juicy_fruit_gum',
    'At 8:01 AM on June 26, 1974 in an Ohio supermarket, history’s first laser UPC barcode checkout beeped on a pack of what?',
    ['Campbell’s tomato soup', 'Ritz butter crackers', 'Juicy Fruit gum', 'Ivory soap bars'], 2,
    'Skeptics doubted barcodes could ever wrap around tiny chewing-gum sticks—so Wrigley’s 67-cent ten-pack went first and now sits in the Smithsonian!'),

  g('FINANCE', 1, 'k09_state_quarters_1999_delaware_first',
    'Sparking a 10-year coin-jar craze in January 1999, which "First State" rode onto America’s very first State Quarter?',
    ['Pennsylvania', 'Massachusetts', 'Connecticut', 'Delaware'], 3,
    'Issued in strict order of Constitution ratification, the 50 State Quarters earned the U.S. Mint ~$6 billion in collector seigniorage profit!'),

  g('FINANCE', 1, 'k09_roman_salarium_salt_salary_origin',
    'Every payday echoes Rome: English "salary" descends from Latin "salarium," tied to soldiers’ rations or routes of what staple?',
    ['Crystalline salt', 'Pressed olive oil', 'Olive oil', 'Sun-dried sweet figs'], 0,
    'Pliny the Elder connected "salarium" to life-preserving sea salt—also giving us the workplace compliment "worth your salt"!'),

  g('FINANCE', 1, 'k09_pieces_of_eight_two_bits_25_cents',
    'Colonial shopkeepers chopped Spanish silver "Pieces of Eight" into eight wedges ("bits")—so "two bits" equals how many cents?',
    ['10 cents', '25 cents', '50 cents', '75 cents'], 1,
    'Spanish milled dollars circulated legally across America until 1857—and Wall Street priced stocks in eighths of a dollar right up to 1997!',
    { numeric: { target: 25, min: 5, max: 100, step: 5, unit: 'cents' } }),

  g('FINANCE', 1, 'k09_medici_crest_three_gold_pawn_balls',
    'Those three golden spheres hanging outside pawnshops trace directly back to the medieval crest of which banking dynasty?',
    ['Borgia Clan', 'The Sforza Dukes', 'The Medici family', 'Doges of Venice'], 2,
    'Legend claimed a Medici ancestor dented his shield slaying a giant with three gilded mace balls—turning Florence’s crest into credit’s universal sign.'),

  g('FINANCE', 1, 'k09_adidas_vs_puma_dassler_brothers_feud',
    'Bavarian brothers Adolf and Rudolf Dassler feuded so bitterly in 1948 they split their shoe shop into Adidas and what rival?',
    ['Reebok', 'Diadora', 'Karhu', 'Puma'], 3,
    'For decades their hometown of Herzogenaurach earned the nickname "the town of bent necks" because locals checked strangers’ shoes before chatting!'),

  g('FINANCE', 1, 'k09_bohemian_joachimsthaler_silver_dollar',
    'Where did America get the word "dollar"? From 1520 Czech silver coins minted in Saint Joachim’s Valley and shortened to what?',
    ['Thaler', 'Florin', 'Ducat', 'Groschen'], 0,
    'Dutch settlers brought "leeuwendaalders" ("lion talers") to New Amsterdam, where English speakers smoothed "daalder" into "dollar."'),

  g('FINANCE', 1, 'k09_lydia_600_bce_electrum_first_coins',
    'Around 600 BCE in Lydia (modern Turkey), kings stamped lions onto history’s first standardized coins of gold mixed with what?',
    ['Pure tin', 'Natural silver', 'Meteoritic iron', 'Hammered lead'], 1,
    'Washed down the Pactolus River as pale-yellow "electrum," standardized weight stamps meant merchants finally stopped weighing raw nuggets!'),

  g('FINANCE', 1, 'k09_song_dynasty_jiaozi_first_paper_money',
    'Five centuries before Europe printed bills, Song Dynasty China adopted state paper money so merchants stopped hauling heavy what?',
    ['Carved green jade slabs', 'Bolt-silk rolls', 'Strings of metal coins', 'Pressed rock-salt bricks'], 2,
    'Nicknamed "flying cash" because breezes could blow them away, copper-short Sichuan merchants cheered swapping mule-loads of iron coins for paper!'),

  g('FINANCE', 1, 'k09_aztec_cacao_beans_mud_counterfeits',
    'In Aztec markets, 100 cacao beans bought a turkey—tempting sneaky counterfeiters to hollow empty shells and pack them with what?',
    ['Crushed yellow pine bark', 'Ground toasted maize meal', 'River sand', 'Packed wet clay'], 3,
    'Savvy Tenochtitlan market vendors squeezed suspect cacao beans between thumb and forefinger to catch heavy mud-stuffed fakes!'),

  g('FINANCE', 1, 'k09_rich_as_croesus_lydian_gold_refining',
    'Why say "rich as Croesus"? Sixth-century BCE King Croesus grew famously wealthy minting history’s first separate pure what?',
    ['Gold & silver coins', 'Stamped bronze ingots', 'Platinum signet rings', 'Amber beads'], 0,
    'Croesus’s metallurgists learned to bake electrum with salt in furnaces ("cementation"), parting mixed river metal into gleaming pure gold and silver.'),

  g('FINANCE', 1, 'k09_dutch_east_india_1602_first_ipo',
    'Chartered in 1602 Amsterdam for Asian spice voyages, which trading giant invited citizens to buy history’s first IPO shares?',
    ['Hanseatic League Guild', 'Dutch East India Co.', 'Hudson’s Bay Adventurers', 'Muscovy Guild'], 1,
    'Even housemaids bought fractional VOC shares—creating the Amsterdam Stock Exchange so investors could sell shares before ten-year voyages returned!'),

  g('FINANCE', 1, 'k09_lincoln_penny_faces_right_other_coins',
    'Line up a penny, nickel, dime, and quarter heads-up: Lincoln faces right while Jefferson, FDR, and Washington all face where?',
    ['Straight forward', 'Straight up', 'To the left', 'Slightly downward'], 2,
    'Zero conspiracy against Honest Abe—sculptor Victor David Brenner simply adapted an existing 1907 bronze plaque profile facing right!'),

  g('FINANCE', 1, 'k09_civil_war_greenbacks_anti_camera_ink',
    'Lincoln’s Treasury printed 1862 Civil War "Greenbacks" in special green ink because early wet-plate cameras couldn’t do what?',
    ['Focus on micro-engraving', 'Copy cotton rag', 'Capture bearded portraits', 'Copy green separately'], 3,
    'Early black-and-white photography turned both black AND green ink flat black—foiling counterfeiters unless they chemically stripped the green!'),

  g('FINANCE', 1, 'k09_buffett_10_year_million_hedge_bet',
    'Warren Buffett won a $1M charity bet proving a plain S&P 500 index fund would beat Wall Street hedge funds over how many years?',
    ['10 years', '3 years', '5 years', '25 years'], 0,
    'Running 2008 through 2017, Buffett’s Vanguard index gained ~125.8% while Protégé Partners’ five hedge-fund baskets averaged just ~36%!',
    { numeric: { target: 10, min: 1, max: 30, step: 1, unit: 'years' } }),

  // --- FINANCE D2 (43 clues) ---
  g('FINANCE', 2, 'k09_bangladesh_bank_2016_fandation_typo',
    'Hackers nearly drained $1B from Bangladesh’s NY Fed account in 2016—until compliance alerts froze a typo spelling "foundation" how?',
    ['"Foundashun"', '"Fandation"', '"Fundatione"', '"Fowndation"'], 1,
    'Lazarus hackers still got away with $81M via Manila casinos, yet that single missing "o" in "Shalika Fandation" saved $850 million!'),

  g('FINANCE', 2, 'k09_el_salvador_2021_chivo_30_dollar_bonus',
    'When El Salvador made Bitcoin legal tender in September 2021, citizens downloading its Chivo wallet got what free starter bonus?',
    ['$5 bonus', '$15 bonus', '$30 bonus', '$100 bonus'], 2,
    'President Nayib Bukele hoped the $30 giveaway would jump-start everyday crypto coffee taps—though most users cashed out into dollars!',
    { numeric: { target: 30, min: 5, max: 100, step: 5, unit: 'dollars' } }),

  g('FINANCE', 2, 'k09_antwerp_2003_diamond_heist_salami_dna',
    'Thieves beat heat sensors and a 3-ton vault in Antwerp’s $100M 2003 diamond heist, getting caught via DNA on a discarded what?',
    ['Crushed paper espresso cup', 'Chewed stick of mint gum', 'Torn black glove', 'Half-eaten salami sub'], 3,
    'Accomplice "Speedy" panicked on the highway and dumped garbage bags in woods owned by a meticulous hunter who called Belgian police!'),

  g('FINANCE', 2, 'k09_big_short_burry_credit_default_swaps',
    'In "The Big Short," Dr. Michael Burry made $700M in 2007 asking surprised Wall Street banks to write subprime mortgage what?',
    ['Credit default swaps', 'Zero-tax munis', 'Convertible call warrants', 'Straddle treasury puts'], 0,
    'Goldman and Deutsche Bank gladly pocketed Burry’s insurance premiums for two years—until teaser-rate housing defaults detonated in 2007!'),

  g('FINANCE', 2, 'k09_enron_2001_mark_to_market_accounting',
    'Before imploding in December 2001, Houston energy giant Enron booked imaginary 20-year future profits on day one via what method?',
    ['Cash basis', 'Mark-to-market books', 'Last-in first-out', 'Sinking-fund reserves'], 1,
    'Signing a shaky 20-year gas or broadband deal let Enron record decades of hypothetical profit immediately—even when zero cash came in!'),

  g('FINANCE', 2, 'k09_madoff_ponzi_locked_17th_floor_ibm',
    'Bernie Madoff ran his $65B Ponzi scheme from Manhattan’s Lipstick Building, barring his real traders from which secret floor?',
    ['13th floor', '29th floor', '17th floor', '42nd floor'], 2,
    'Down on Floor 17, an antique 1980s IBM AS/400 computer and dot-matrix printers churned out decades of completely fictional split-strike trades!',
    { numeric: { target: 17, min: 1, max: 45, step: 1, unit: 'floor' } }),

  g('FINANCE', 2, 'k09_theranos_edison_finger_prick_fraud',
    'Valued at $9B before exposés, Elizabeth Holmes’s Theranos falsely claimed its tabletop "Edison" box ran 200 lab tests on what?',
    ['Exhaled morning breath mist', 'Cheek-swab spit', 'Plucked single eyelash root', 'Tiny finger-prick drops'], 3,
    'Whistleblowers revealed Theranos secretly diluted samples and ran most Walgreens patient blood on ordinary commercial Siemens machines!'),

  g('FINANCE', 2, 'k09_kenya_2007_mpesa_mobile_airtime_cash',
    'Years before Apple Pay, millions of Kenyans texted cash and paid market stalls on basic Nokia phones via which 2007 service?',
    ['M-Pesa', 'Safaripay', 'NairoCash', 'SimShilling'], 0,
    'Swahili "pesa" means money—researchers spotted Kenyans texting prepaid phone-minute codes to rural relatives as makeshift digital cash!'),

  g('FINANCE', 2, 'k09_hatton_garden_2015_retiree_gem_heist',
    'Drilling six feet of concrete over Easter 2015 to loot £14M from London’s Hatton Garden vault, the crew turned out to be mostly who?',
    ['Subway crew', 'Retirees in their 60s–70s', 'Acrobatic circus brothers', 'Disgruntled bank locksmiths'], 1,
    'Ringleader Brian Reader (age 76) actually rode his free senior-citizen Freedom Pass bus straight to the diamond district heist!'),

  g('FINANCE', 2, 'k09_satoshi_genesis_block_british_banks',
    'Stamped permanently inside Bitcoin’s January 2009 Genesis Block is a London Times front-page headline on a second bailout for whom?',
    ['US automakers', 'Greek shipping tycoons', 'Troubled British banks', 'Icelandic pension funds'], 2,
    '"Chancellor on brink of second bailout for banks" served both as a live timestamp proof and Satoshi’s sharp manifesto on central banking.'),

  g('FINANCE', 2, 'k09_zimbabwe_2008_100_trillion_banknote',
    'During 2008 hyperinflation, Zimbabwe’s central bank printed monetary history’s zero-heaviest bill: one blue note for how many trillions?',
    ['10 trillion', '25 trillion', '50 trillion', '100 trillion'], 3,
    'Barely covering bus fare in Harare by January 2009, crisp uncirculated $100,000,000,000,000 bills later became $100+ collector souvenirs!',
    { numeric: { target: 100, min: 1, max: 100, step: 1, unit: 'trillion' } }),

  g('FINANCE', 2, 'k09_flash_crash_may_2010_36_minutes',
    'High-frequency algorithms snowballed on May 6, 2010 ("Flash Crash"), erasing ~$1T from U.S. stocks and rebounding in how long?',
    ['36 minutes', '4 minutes', '95 minutes', '6 full hours'], 0,
    'Blue-chip Accenture briefly traded for one single penny while Apple flashed at $100,000 before stunned exchanges canceled erroneous prints!',
    { numeric: { target: 36, min: 1, max: 120, step: 1, unit: 'minutes' } }),

  g('FINANCE', 2, 'k09_southwest_airlines_luv_ticker_dallas',
    'Ferrari trades on the NYSE as "RACE" and Harley-Davidson used "HOG"—why does Southwest Airlines trade under ticker "LUV"?',
    ['CEO Herb’s Valentine IPO', 'Dallas Love Field home', 'Free honeymoon companion', 'Heart-shaped snack bags'], 1,
    'Blocked from flying out of giant DFW in the 1970s, scrappy Southwest turned inner-city Dallas Love Field ("LUV") into inflight romance branding!'),

  g('FINANCE', 2, 'k09_wall_street_2024_t_plus_1_robinhood',
    'In May 2024, U.S. stock trades sped clearing from two days (T+2) to one (T+1)—spurred by 2021 collateral freezes on which app?',
    ['E*Trade Mobile', 'TD Mobile', 'Robinhood', 'Coinbase Pro'], 2,
    'Two-day clearing delays forced Robinhood to post $3B in overnight collateral during January 2021’s GameStop surge, halting buy buttons.'),

  g('FINANCE', 2, 'k09_paypal_mafia_2002_ebay_1_5b_sale',
    'Before launching Tesla, YouTube, and LinkedIn, Silicon Valley’s "PayPal Mafia" cashed out in 2002 selling PayPal for $1.5B how?',
    ['Merged into Western Union', 'Sold to AmEx', 'Acquired by Amazon Pay', 'Bought out by eBay'], 3,
    'Power-sellers on eBay loved PayPal so fiercely over eBay’s own Billpoint system that eBay gave up competing and bought the whole team!'),

  g('FINANCE', 2, 'k09_india_2016_midnight_rupee_demonetization',
    'With just four hours’ TV notice in November 2016, India voided every 500- and 1,000-rupee bill—retiring 86% of its what?',
    ['Paper banknotes', 'Silver wedding coins', 'Postal savings bonds', 'Bridge tokens'], 0,
    'Aimed at untaxed shadow cash, the shock spurred hundreds of millions of Indians to adopt instant QR smartphone payments (UPI)!'),

  g('FINANCE', 2, 'k09_klarna_bnpl_four_split_installments',
    'Fintech apps Klarna and Affirm reshaped Gen-Z online checkouts with "Pay in X"—splitting carts into how many interest-free slices?',
    ['3 slices', '4 slices', '6 slices', '12 slices'], 1,
    'Merchant fees subsidize the six-week split (25% today, then three biweekly chunks)—rehabbing Grandma’s department-store layaway in reverse!',
    { numeric: { target: 4, min: 2, max: 12, step: 1, unit: 'slices' } }),

  g('FINANCE', 2, 'k09_nick_leeson_88888_sinks_barings_1995',
    'Britain’s 233-year-old Barings Bank collapsed for £1 in 1995 after trader Nick Leeson hid £827M of losses inside which account?',
    ['Account 00700', 'Account 13131', 'Account 88888', 'Account 99999'], 2,
    'Doubling down on Nikkei futures after the Kobe earthquake, 28-year-old Leeson left a desk note reading "I’m sorry" and fled to Frankfurt!'),

  g('FINANCE', 2, 'k09_soros_1992_black_wednesday_erm_exit',
    'Shorting $10B in British pounds on "Black Wednesday" 1992, George Soros made $1B in a day forcing London out of what currency peg?',
    ['Gold Bullion', 'Sterling Commonwealth Peg', 'Bretton Woods Par Grid', 'European ERM'], 3,
    'Even hiking British interest rates twice in one morning couldn’t defend the overvalued pound—ironically sparking a brisk UK export recovery!'),

  g('FINANCE', 2, 'k09_jack_bogle_1976_vanguard_sp500_folly',
    'Wall Street mocked Vanguard founder Jack Bogle’s 1976 fund as "un-American" because instead of picking stocks, it copied what?',
    ['The S&P 500 index', 'Dow 30 industrials', 'South African gold mines', 'Transcontinental railroads'], 0,
    'Posters read "Stamp Out Index Funds!" in 1976—today low-cost index funds save everyday savers hundreds of billions of dollars in Wall Street fees.'),

  g('FINANCE', 2, 'k09_hunt_brothers_1980_silver_thursday',
    'Texas billionaire brothers Nelson and William Hunt triggered March 1980’s "Silver Thursday" panic after hoarding one-third of global what?',
    ['Copper wire', 'Silver bullion', 'Platinum bar ingots', 'Supertanker crude'], 1,
    'Silver spiked from $6 to $49.45 an ounce—Tiffany ran an ad scolding greedy hoarders right before margin-rule changes popped the bubble!'),

  g('FINANCE', 2, 'k09_goodfellas_1978_jfk_lufthansa_heist',
    'Dramatized in Scorsese’s "Goodfellas," December 1978’s record $5.8M cash-and-jewel heist raided a Lufthansa cargo vault where?',
    ['Newark Liberty Hub', 'LaGuardia Hangar', 'JFK Airport', 'Logan Cargo'], 2,
    'Inside tipster Louis Werner owed gambling debts, helping masked gunmen walk out during a 3:00 AM guard coffee break with untraceable bills.'),

  g('FINANCE', 2, 'k09_susan_b_anthony_1979_quarter_confusion',
    'Why did riders and bartenders reject the U.S. Mint’s 1979 Susan B. Anthony $1 coin? Its size and ridged rim felt just like what?',
    ['Five-cent Jefferson coin', 'Canadian two-dollar piece', 'Subway token', 'A 25-cent quarter'], 3,
    'Mint vaults piled up hundreds of millions of unwanted "Susies" until NYC subway token machines gave them a second life in the 1990s!'),

  g('FINANCE', 2, 'k09_nasdaq_1971_automated_quotations',
    'Launched in February 1971 with zero trading floor, "NASDAQ" stood for National Association of Securities Dealers Automated what?',
    ['Quotations', 'Queues', 'Clearances', 'Portfolios'], 0,
    'Built first just to display bid-ask quotes electronically on CRT screens, Nasdaq grew into the trillions-deep home of Apple, Microsoft, and NVIDIA.'),

  g('FINANCE', 2, 'k09_vhs_beats_betamax_two_hour_movie_tape',
    'Sony’s sharper Betamax lost the 1980s VCR war to JVC’s VHS mainly because early Betamax tapes capped at 60 minutes—too short for what?',
    ['Evening network news', 'A full feature movie', 'Saturday morning toons', 'Sitcom reruns'], 1,
    'Plus JVC licensed VHS cheaply to RCA, Panasonic, and Sharp—flooding video rental stores with two-hour VHS cassettes!'),

  g('FINANCE', 2, 'k09_barbarians_at_the_gate_1989_rjr_nabisco',
    'Wall Street’s epic $25 billion 1989 leveraged-buyout war ("Barbarians at the Gate") battled over snack-and-tobacco giant RJR what?',
    ['Nabisco', 'RJR Kraft Foods', 'RJR Nabisco', 'RJR Quaker Oats'], 2,
    'CEO Ross Johnson’s fleet of ten corporate jets—once flying his German Shepherd solo as "G. Shepherd"—became the poster child of 80s excess!'),

  g('FINANCE', 2, 'k09_401k_ted_benna_1978_tax_code_clause',
    'Over 70 million Americans save inside a "401(k)"—named after benefits consultant Ted Benna spotted a quiet subsection where?',
    ['Social Security Amendments', 'Fed Reserve Act', 'Securities Exchange Rules', 'Internal Revenue Code'], 3,
    'Studying Congress’s 1978 Revenue Act over a weekend, Benna realized pairing employer matches with subsection 401(k) sheltered worker savings!'),

  g('FINANCE', 2, 'k09_great_train_robbery_1963_signal_glove',
    'Bruce Reynolds’s gang stopped Britain’s £2.6M 1963 Royal Mail night train without a shot by covering a green track lamp with what?',
    ['An old leather glove', 'Black wool bowler hat', 'Tin biscuit lid', 'Tarred canvas mailbag'], 0,
    'Wiring a 6-volt battery to light the red stop bulb below, the gang walked off with 120 mailbags—before fingerprints on a Monopoly set caught them!'),

  g('FINANCE', 2, 'k09_paul_volcker_1981_20_percent_rates',
    'To crush stubborn 1970s inflation in 1981, towering Fed Chair Paul Volcker pushed benchmark U.S. interest rates near what peak?',
    ['10 percent', '20 percent', '32 percent', '45 percent'], 1,
    'Homebuilders mailed Volcker sawed-off 2x4 lumber in protest as mortgages hit 18.6%—yet inflation tumbled from ~14% down near 3% by 1983!',
    { numeric: { target: 20, min: 1, max: 35, step: 1, unit: 'percent' } }),

  g('FINANCE', 2, 'k09_nyse_1987_market_circuit_breakers',
    'After October 1987’s crash, NYSE engineers installed mandatory 15-minute trading pauses nicknamed after household electrical what?',
    ['Smoke alarms', 'Boiler safety valves', 'Circuit breakers', 'Outlet surge strips'], 2,
    'Triggered four times during March 2020’s pandemic swings, Level 1–3 circuit breakers give panicked humans 15 minutes to breathe and check math.'),

  g('FINANCE', 2, 'k09_amazon_1994_cadabra_misheard_cadaver',
    'Jeff Bezos incorporated his 1994 online bookstore as "Cadabra" until his lawyer misheard it over the phone as what grim word?',
    ['"Candelabra"', '"Chupacabra"', '"Catacomb"', '"Cadaver"'], 3,
    'Not eager to sell books from a corpse-sounding URL, Bezos flipped open an A-section dictionary and picked Earth’s biggest river: Amazon!'),

  g('FINANCE', 2, 'k09_euro_1999_cashless_before_2002_coins',
    'Eleven European nations locked into the Euro on January 1, 1999—yet shoppers waited three years until 2002 to touch physical what?',
    ['Euro bills and coins', 'Smart chip-and-PIN cards', 'Banker drafts', 'Stamped customs booklets'], 0,
    'For three transitional years, stocks and bank wires priced in Euros while cafés still gave change in francs, marks, and lire!'),

  g('FINANCE', 2, 'k09_may_day_1975_sec_discount_brokers',
    'Before the SEC’s "May Day" reform on May 1, 1975, Charles Schwab couldn’t offer discount trades because NYSE rules enforced fixed what?',
    ['Minimum 500-share blocks', 'Brokerage commissions', 'Formal trading-floor coats', 'Stock scripts'], 1,
    'Ending 183 years of Buttonwood cartel fees slashed retail trading costs from ~$100+ per trade all the way down to today’s $0 apps!'),

  g('FINANCE', 2, 'k09_visa_1958_fresno_drop_unsolicited_cards',
    'Bank of America launched modern Visa cards in 1958 by mailing 60,000 unsolicited, ready-to-swipe live credit cards to families where?',
    ['Reno, Nevada', 'Peoria, Illinois', 'Fresno, California', 'Tucson, Arizona'], 2,
    'Picked because 45% of Fresno residents banked with BofA, the daring "Fresno Drop" solved the merchant-vs-shopper chicken-and-egg overnight!'),

  g('FINANCE', 2, 'k09_crassus_roman_fire_brigade_bargains',
    'Rome’s richest tycoon, Crassus, rushed his private 500-man fire brigade to burning villas and withheld water until owners did what?',
    ['Backed his senate slate', 'Gave up silver', 'Enlisted in his legion', 'Sold the house cheap'], 3,
    'Once the desperate homeowner signed for pennies on the denarius, Crassus’s bucket crew doused the embers and rebuilt rental tenements!'),

  g('FINANCE', 2, 'k09_peter_the_great_1698_beard_tax_token',
    'Modernizing Moscow nobles in 1698, Tsar Peter the Great taxed beards up to 100 rubles and gave payers a copper token calling beards what?',
    ['A useless burden', 'Old boyar vanity', 'A winter blanket', 'Steppe relic'], 0,
    'Peter personally whipped out barber shears at a palace banquet to snip courtiers’ whiskers—exempting only Russian Orthodox priests and peasants!'),

  g('FINANCE', 2, 'k09_knights_templar_pilgrim_letters_credit',
    'Centuries before Visa, Knights Templar monks let Jerusalem pilgrims deposit silver in Paris and withdraw cash abroad using what?',
    ['Split hazelnut tallies', 'Coded letters of credit', 'Beeswax seals', 'Engraved bronze rings'], 1,
    'Highway bandits couldn’t spend an encrypted parchment note—making Templar preceptories medieval Europe’s most trusted ATM network!'),

  g('FINANCE', 2, 'k09_britain_1799_temporary_napoleon_tax',
    'Britain’s William Pitt the Younger introduced the first modern national income tax in 1799 promising voters it was temporary to beat whom?',
    ['George Washington’s navy', 'Tsar Paul of St. Petersburg', 'Napoleon Bonaparte', 'Spanish Armada'], 2,
    'Brief peace repealed it in 1802 and 1816—yet governments soon discovered "temporary" wartime income taxes were far too handy to retire!'),

  g('FINANCE', 2, 'k09_sumerian_3000_bce_clay_barley_loans',
    'Two millennia before coins, Mesopotamian scribes pressed history’s earliest interest loans into wet clay measured in silver and what?',
    ['Woven flax linen bolts', 'Sun-dried date baskets', 'Bronze axes', 'Bushels of barley'], 3,
    'Sumerian word "mash" meant both "interest" and "young calf"—because loaned livestock literally reproduced extra interest on the hoof!'),

  g('FINANCE', 2, 'k09_mansa_musa_1324_cairo_gold_crash',
    'Mali emperor Mansa Musa gifted so much West African gold on his 1324 pilgrimage to Mecca that Cairo’s gold price slumped for how long?',
    ['Over a decade', 'Three market days', 'Six months', 'One full century'], 0,
    'Realizing his generosity had sparked runaway Egyptian inflation, Mansa Musa borrowed gold back at high interest on his return trip just to steady prices!'),

  g('FINANCE', 2, 'k09_venetian_gazzetta_coin_newspaper_name',
    'Why are newspapers called "gazettes"? Sixteenth-century Venetians paid one copper coin ("gazzetta") to read bulletins of shipping and what?',
    ['Grand opera librettos', 'Harbor shipping news', 'Papal star horoscopes', 'Masked ball invitations'], 1,
    'One gazzetta was worth roughly two soldi—just enough for harbor merchants to check whether spice galleys dodged Mediterranean pirates!'),

  g('FINANCE', 2, 'k09_good_delivery_gold_bar_27_pounds',
    'Heist movies show thieves tossing gold bricks one-handed—in reality, one central-bank "Good Delivery" vault bar weighs roughly what?',
    ['Five pounds', 'Twelve pounds even', '27.4 pounds', 'Sixty-five pounds'], 2,
    'Measuring 400 troy ounces (~12.4 kg), stuffing just ten real vault bars into one gym bag would rip the straps at 274 pounds!',
    { isKlaxonMyth: true }),

  g('FINANCE', 2, 'k09_coca_cola_pepsi_sip_bias_full_can',
    'Malcolm Gladwell noted sweeter Pepsi won 1980s mall "Pepsi Challenges" on one tiny sip—while drinkers still preferred Coke across what?',
    ['Chilled green glass bottles', 'Crushed soda-fountain ice', 'Smell tests', 'A full 12-ounce can'], 3,
    'One thimbleful rewards an immediate sugar burst, whereas across twelve ounces extra sweetness starts tasting cloying—fooling New Coke’s researchers!'),

  // --- FINANCE D3 (16 clues) ---
  g('FINANCE', 3, 'k09_socgen_2008_jerome_kerviel_rogue_loss',
    'Months before Lehman fell in 2008, former clerk Jérôme Kerviel racked up history’s largest solo rogue-trader loss (€4.9B) at which bank?',
    ['Société Générale', 'UBS Zurich', 'Frankfurt Commerzbank', 'Zurich Credit Suisse'], 0,
    'Knowing every internal compliance check from his junior back-office job, Kerviel quietly built €50 billion in unauthorized European index positions!'),

  g('FINANCE', 3, 'k09_passive_funds_surpass_active_aum_2024',
    'Fulfilling Jack Bogle’s 1976 heresy, U.S. passive index funds officially overtook human-picked active funds by 2024 in total what?',
    ['Hot tech IPO allocations', 'Assets under management', 'Short-sale pool', 'Proxy corporate board seats'], 1,
    'Decades of S&P SPIVA scorecards showed ~85–90% of high-fee active stock-pickers trailed plain index benchmarks over fifteen-year stretches.'),

  g('FINANCE', 3, 'k09_jpmorgan_2012_london_whale_bond_index',
    'JPMorgan’s Bruno Iksil earned 2012’s nickname "The London Whale" ($6.2B loss) after his derivative bets grew huge enough to skew what?',
    ['British gilt bond auctions', 'Gold-fix spreads', 'Corporate CDX credit index', 'Swiss franc currency caps'], 2,
    'Rival hedge funds spotted one London desk cornering the CDX.NA.IG.9 credit index and gleefully bet the opposite side until JPMorgan blinked!'),

  g('FINANCE', 3, 'k09_wirecard_2020_missing_1_9_billion_cash',
    'German DAX fintech star Wirecard imploded in June 2020 when auditors admitted €1.9 billion supposedly sitting in Manila banks was what?',
    ['Frozen in Swiss gold bars', 'Converted into Japanese yen', 'Tied in probate', 'Completely nonexistent'], 3,
    'Philippine central bankers confirmed rogue executives forged balance letters—sending COO Jan Marsalek fleeing toward Moscow!',
    {
      shutters: {
        shutters: [
          'Once hailed as Munich’s pride in Germany’s elite DAX 30',
          'Financial Times reporters questioned its Asian profits for years',
          'Philippine banks denied ever holding its €1.9 billion escrow',
          'Collapsed in June 2020 in postwar Germany’s biggest audit scandal',
        ],
      },
    }),

  g('FINANCE', 3, 'k09_archegos_2021_total_return_swaps_call',
    'Bill Hwang’s Archegos sparked $10B in March 2021 bank losses using hidden "total return swaps" to lever concentrated bets on what?',
    ['Media & tech stocks', 'Arctic LNG supertankers', 'Grain futures', 'Subprime auto-loan pools'], 0,
    'Goldman Sachs bolted for the exit door first on Friday morning while slower Credit Suisse ate a devastating $5.5 billion hit!'),

  g('FINANCE', 3, 'k09_milken_drexel_beverly_hills_junk_bonds',
    'Working a Beverly Hills desk at 4:30 AM for New York’s open, Drexel’s Michael Milken fueled 1980s takeovers pioneering high-yield what?',
    ['Municipal turnpike debt', 'Corporate junk bonds', 'Rural farm land trusts', 'Bullion notes'], 1,
    'Milken proved fallen-angel and non-investment-grade debt paid more than enough extra yield to cover historical defaults—funding MCI, CNN, and raids.'),

  g('FINANCE', 3, 'k09_ronald_wayne_apple_third_founder_800',
    'Apple’s third co-founder, Ronald Wayne, drew the 1976 Newton logo—then feared debt and sold his 10% Apple stake after 12 days for what?',
    ['$250', '$5,000', '$800', '$25,000'], 2,
    'As the lone 41-year-old with assets beside broke twenty-somethings Jobs and Wozniak, Wayne cashed out early—passing up ~$300+ billion today!',
    {
      numeric: { target: 800, min: 100, max: 5000, step: 50, unit: 'dollars' },
      shutters: {
        shutters: [
          'Drafted the original April 1976 partnership contract',
          'Illustrated Sir Isaac Newton sitting under an apple tree',
          'Feared Byte Shop creditors could seize his personal assets',
          'Sold a 10% founding stake in Cupertino after twelve days',
        ],
      },
    }),

  g('FINANCE', 3, 'k09_geico_gecko_1999_actors_strike_birth',
    'Why did Buffett-owned insurer GEICO debut its CGI green gecko in 1999? Ad agencies couldn’t hire live human actors during a what?',
    ['Studio flood', 'Super Bowl power outage', 'Kodak film stock shortage', 'Screen Actors strike'], 3,
    'Playing off people mispronouncing "GEICO" as "gecko," one animated stopgap spot during the 1999–2000 SAG commercial strike ran for decades!'),

  g('FINANCE', 3, 'k09_tylenol_1982_tamper_evident_foil_caps',
    'MBA classes still hail Johnson & Johnson’s $100M 1982 crisis move—pulling 31 million Tylenol bottles to pioneer triple-seal what?',
    ['Tamper-evident caps', 'Push-turn tops', 'UV-shielded amber glass', 'Dated aluminum blisters'], 0,
    'Wall Street predicted the Tylenol brand was dead forever—yet putting public safety ahead of quarterly earnings won back 95%+ market share within a year!'),

  g('FINANCE', 3, 'k09_hostile_takeover_friendly_white_knight',
    'In Wall Street M&A slang, when a target firm escapes a hostile corporate raider by selling to a friendly rescuer, that buyer is what?',
    ['A golden parachute', 'A white knight', 'Poison pill', 'A greenmail squire'], 1,
    'Conversely, an unwelcome bidder is a "black knight," while a fence-sitting suitor waiting to pounce opportunistically is a "gray knight."'),

  g('FINANCE', 3, 'k09_1869_gould_fisk_original_black_friday',
    'Long before mall sales, Wall Street’s original September 1869 "Black Friday" erupted when Jay Gould and Jim Fisk tried to corner what?',
    ['Pennsylvania kerosene oil', 'Union Pacific rail cars', 'US physical gold', 'Cotton bales'], 2,
    'President Ulysses S. Grant smashed their corner in minutes by ordering the Treasury to dump $4 million of federal gold straight onto the market!'),

  g('FINANCE', 3, 'k09_athens_liturgy_rich_funding_triremes',
    'Instead of modern tax forms, classical Athens tapped rich citizens via "liturgies"—vying for civic honor by funding a chorus or what?',
    ['Carved marble aqueducts', 'Four-horse chariot teams', 'Border walls', 'A trireme warship'], 3,
    'If a rich Athenian whined someone else was wealthier, Greek law ("antidosis") challenged that rival either to fund the warship OR swap entire estates!'),

  g('FINANCE', 3, 'k09_1933_double_eagle_18_9m_gold_recall',
    'Why did one 1933 Saint-Gaudens $20 Double Eagle fetch $18.9M in 2021? FDR’s 1933 gold recall melted 445,500 of them before they did what?',
    ['Left the federal Mint', 'Received edge lettering', 'Passed assay weight tests', 'Shipped out to Fort Knox'], 0,
    'About twenty escaped in a Mint cashier’s pocket; Secret Service seized nearly all except one monetized survivor once owned by Egypt’s King Farouk!',
    {
      shutters: {
        shutters: [
          'Designed by Augustus Saint-Gaudens for twenty-dollar gold',
          '445,500 were struck in Philadelphia then melted into bars',
          'Once sat in Cairo’s royal palace collection under Farouk',
          'Auctioned in 2021 for $18.9M as the lone legal example',
        ],
      },
    }),

  g('FINANCE', 3, 'k09_betty_grable_lloyds_million_dollar_legs',
    '20th-Century Fox made "Million-Dollar Legs" pop-finance shorthand in 1943 by buying a specialty Lloyd’s policy on which star?',
    ['Rita Hayworth', 'Betty Grable', 'Ava Gardner', 'Veronica Lake'], 1,
    'Underwriters at Lloyd’s later insured Bruce Springsteen’s vocal cords, Keith Richards’s guitar hands, and wine critics’ noses!'),

  g('FINANCE', 3, 'k09_hammurabi_code_grain_silver_usury_cap',
    'Usury caps are 3,750 years old: Babylon’s Code of Hammurabi voided a loan if interest topped 20% on silver or 33.3% on what?',
    ['Pressed sesame-seed oil', 'Imported Lebanese cedar', 'Loaned barley grain', 'Sheared wool'], 2,
    'Carved onto basalt stelae around 1750 BCE, Hammurabi also canceled farmers’ crop interest altogether whenever storm god Adad flooded their fields!'),

  g('FINANCE', 3, 'k09_pin_money_14th_century_new_year_pins',
    'Why is spare pocket cash called "pin money"? Before wire mills, pricey brass dress pins were sold openly in England mainly when?',
    ['On Easter Sunday morning', 'During Midsummer Eve fairs', 'Michaelmas Eve', 'Jan 1–2 New Year'], 3,
    'Parliament initially let pin-makers sell open-market stock only on January 1 and 2, so husbands handed wives a dedicated New Year "pin money" purse!',
    {
      shutters: {
        shutters: [
          'Coined in medieval England before mechanized wire drawing',
          'Parliament restricted open retail sales to two winter days',
          'Wives received a dedicated purse allowance for tailoring',
          'Today means spare pocket cash for small everyday treats',
        ],
      },
    }),
];
