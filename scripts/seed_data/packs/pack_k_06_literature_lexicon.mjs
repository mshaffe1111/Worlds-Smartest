// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Prime-Time Gold Pack K-06 (`scripts/seed_data/packs/pack_k_06_literature_lexicon.mjs`)
// 216 All-Era (Ancient thru 2026!) Human-Written Game-Night Clues:
//   - 108 LITERATURE (Harry Potter, Hunger Games, Dune, GoT, King, 2024-2025 hits & classics)
//   - 108 LEXICON (2020s Words of the Year, Spotify/Google/Nike origins, idioms & +24 Vowel Wheels)
//   - Exact [54, 54, 54, 54] A/B/C/D balance, <=28-char choices, >50% Blitz-legal, 0 collisions!
// ============================================================================

function maskMissingVowels(upperStr) {
  let masked = '';
  for (const ch of upperStr) {
    if ('AEIOU'.includes(ch)) continue;
    if (ch === ' ') {
      masked += '   ';
    } else {
      masked += (masked && !masked.endsWith(' ') ? ' ' : '') + ch;
    }
  }
  return masked.trim();
}

function g(category, difficulty, canonicalEntityKey, stem, choices, answerIdx, ahaFactoid, extra = {}) {
  return {
    isPrimeTimeGold: true,
    category,
    difficulty,
    canonicalEntityKey,
    stem,
    choices,
    answerIdx,
    ahaFactoid,
    supportedToys: extra.supportedToys || [
      'TOY_01_KNIFE_SWITCH',
      'TOY_02_CONFIDENCE_PNEUMATIC',
      'TOY_06_FUSE_WIRE_SNIPPER',
    ],
    ...extra,
  };
}

function gv(category, difficulty, canonicalEntityKey, stem, choices, answerIdx, vowelChoices, ahaFactoid, extra = {}) {
  const fullAnswer = String(choices[answerIdx]).toUpperCase().trim();
  return g(
    category,
    difficulty,
    canonicalEntityKey,
    stem,
    choices,
    answerIdx,
    ahaFactoid,
    {
      ...extra,
      supportedToys: [
        'TOY_01_KNIFE_SWITCH',
        'TOY_02_CONFIDENCE_PNEUMATIC',
        'TOY_06_FUSE_WIRE_SNIPPER',
        'TOY_11_MISSING_VOWELS_WHEEL',
      ],
      vowels: {
        maskedDisplay: maskMissingVowels(fullAnswer),
        fullAnswer,
        vowelChoices,
        correctChoiceIdx: answerIdx,
      },
    },
  );
}

export const CLUES = [

  // ======================== LITERATURE (108) ========================
  g("LITERATURE", 1, "lit_k06_hp_platform_nine_three_quarters",
    "At London’s King’s Cross Station, young wizards sprint through a brick wall to catch the Hogwarts Express at what platform?",
    ["Platform 9 3/4","Platform 7 1/2 East","Track 13 North","Gate 11 West"], 0,
    "Real King’s Cross installed a luggage trolley vanishing halfway into the brick wall—though Rowling pictured Euston’s layout by mistake!"),

  g("LITERATURE", 1, "lit_k06_hp_golden_snitch_points",
    "Catching the winged Golden Snitch immediately ends a Hogwarts Quidditch match and awards the Seeker’s team how many points?",
    ["50 match bonus points","150 match points","100 flat points","250 sweep points"], 1,
    "Rarely, a team trailing by more than 150 can still lose while catching the Snitch—just ask Viktor Krum at the 1994 World Cup!"),

  g("LITERATURE", 1, "lit_k06_hunger_games_channel_surfing",
    "Suzanne Collins conceived \"The Hunger Games\" late one night while channel-surfing between Iraq War footage and what?",
    ["Olympic gymnastics","Late-night infomercials","televised poker tours","Reality game shows"], 3,
    "Watching young contestants compete for cash right beside real combat footage blurred together into Panem’s televised arena."),

  g("LITERATURE", 1, "lit_k06_hunger_games_sunrise_reaping_2025",
    "Suzanne Collins’s 2025 bestseller \"Sunrise on the Reaping\" flashes back to the brutal 50th Games won by which mentor?",
    ["Cinna the stylist","Plutarch Heavensbee","Finnick Odair","Haymitch Abernathy"], 3,
    "Because the Second Quarter Quell doubled the tribute pool to 48 kids, teenage Haymitch outwitted the Capitol’s own force-field rim!"),

  g("LITERATURE", 1, "lit_k06_stephen_king_carrie_trash_tabitha",
    "After three pages, Stephen King trashed his 1973 draft of \"Carrie\"—who fished it out of the wastebasket and saved it?",
    ["His wife Tabitha","Agent Kirby McCauley","Editor Bill Thompson","Neighbor Peter Straub"], 0,
    "Tabitha brushed cigarette ashes off the pages, helped him nail the girls’ locker-room scene, and watched paperback rights fetch $400,000!"),

  g("LITERATURE", 1, "lit_k06_dune_chilton_auto_manuals",
    "Twenty houses rejected Frank Herbert’s 1965 sci-fi epic \"Dune\" before a firm famous for printing what took the gamble?",
    ["Seed-packet catalogs","Auto-repair manuals","Railroad timetables","Church choir hymnals"], 1,
    "Chilton Books usually taught mechanics how to rebuild carburetors—their $7,500 advance launched sci-fi’s biggest-selling novel!"),

  g("LITERATURE", 1, "lit_k06_got_hadrians_wall_inspiration",
    "Standing atop which windswept Roman ruin in 1981 inspired George R.R. Martin to dream up Westeros’s 700-foot Ice Wall?",
    ["Old Antonine Turf Rampart","Offa’s Border Dyke","Hadrian’s Stone Wall","Tintagel Sea Keep"], 2,
    "Gazing north at twilight like a Roman centurion from the Mediterranean, Martin imagined supernatural horrors lurking beyond the frost."),

  g("LITERATURE", 1, "lit_k06_percy_jackson_adhd_dyslexia",
    "Rick Riordan invented \"Percy Jackson\" for his son Haley—turning ADHD and dyslexia into proof a kid carries what?",
    ["Lost Atlantis royal blood","Time-traveling vision","Norse rune telepathy","Olympian demigod blood"], 3,
    "Percy’s brain scrambles English letters because it is hardwired for Ancient Greek, while ADHD is battle-ready Olympian reflexes!"),

  g("LITERATURE", 1, "lit_k06_martian_andy_weir_blog_serial",
    "Before Hollywood filmed \"The Martian,\" programmer Andy Weir posted Mark Watney’s survival chapters free on what?",
    ["His personal website","A NASA message board","Reddit’s sci-fi club","Back-page zine flyers"], 0,
    "Fans begged for an e-reader file, so Weir uploaded it to Kindle at the 99-cent minimum—and accidentally outsold major publishers!"),

  g("LITERATURE", 1, "lit_k06_fourth_wing_dragon_riders",
    "Dominating BookTok through 2025’s \"Onyx Storm,\" Rebecca Yarros’s \"Fourth Wing\" follows cadets at a war college for what?",
    ["Starship navigators","Lethal dragon riders","Submarine codebreakers","Clockwork alchemists"], 1,
    "Fragile scribe-trainee Violet Sorrengail has to survive threshing on the parapet because Basgiath dragons torch weaklings on sight!"),

  g("LITERATURE", 1, "lit_k06_wimpy_kid_cheese_touch_kinney",
    "Before selling 290 million print copies, Jeff Kinney’s cartoon middle-schooler Greg Heffley debuted inside which series?",
    ["Big Nate’s Locker","Dork Tales Weekly","Diary of a Wimpy Kid","Middle School Confidential"], 2,
    "Kinney originally pitched Greg’s cartoons to newspaper syndicates as nostalgic adult humor before editors realized kids devoured it!"),

  g("LITERATURE", 1, "lit_k06_dog_man_dav_pilkey_second_grade",
    "Dav Pilkey created both \"Captain Underpants\" and megahit cop \"Dog Man\" while exiled to the school hallway in what grade?",
    ["Senior year study hall","Kindergarten nap hour","Sixth-grade detention","Second-grade corridor"], 3,
    "His teacher sat a desk outside the door for disruptive Dav, where he stapled together homemade comic books starring canine heroes."),

  g("LITERATURE", 1, "lit_k06_twilight_stephenie_meyer_meadow_dream",
    "Waking on June 2, 2003 from a vivid dream about a girl and a sparkling vampire in a sunny meadow launched what series?",
    ["Twilight","Divergent","Shadowhunters","Graceling"], 0,
    "First-time novelist Stephenie Meyer typed out rainy Forks, Washington in three months—selling over 160 million copies!"),

  g("LITERATURE", 1, "lit_k06_hitchhiker_number_forty_two",
    "Supercomputer Deep Thought spends 7.5 million years pondering Life, the Universe, and Everything—spitting out what answer?",
    ["One blank paper printout","The plain number 42","One lukewarm teacup","Try asking again"], 1,
    "Adams swore there was zero secret math joke—he stared into a garden, thought \"42 sounds funny and ordinary,\" and typed it down!"),

  g("LITERATURE", 1, "lit_k06_very_hungry_caterpillar_punch",
    "Playfully punching holes into studio paper inspired Eric Carle’s die-cut 1969 picture classic about which ravenous bug?",
    ["Grouchy red ladybug","Busy web-spinning spider","Very hungry caterpillar","Quiet clicking cricket"], 2,
    "Carle first planned \"A Week with Willi the Worm\" until his editor wisely suggested a green caterpillar transforming into a butterfly!"),

  g("LITERATURE", 1, "lit_k06_wild_things_sendak_horses",
    "Maurice Sendak first titled his 1963 classic \"Where the Wild Horses Are\"—why did he swap horses out for monsters?",
    ["Lawyers blocked the name","Kids feared dark stables","Printers ran out of brown","He could not draw horses"], 3,
    "Asked what \"Wild Things\" looked like instead, Sendak modeled those big yellow eyes and messy hair on his loud Brooklyn relatives!"),

  g("LITERATURE", 1, "lit_k06_outsiders_se_hinton_sixteen",
    "Using initials so critics wouldn’t dismiss a girl writing Greaser rumbles, S.E. Hinton began \"The Outsiders\" at what age?",
    ["Fifteen in high school","Twenty-four waitressing","Thirty-one teaching","Eleven at summer camp"], 0,
    "Susan Eloise Hinton was still a Tulsa teenager when Viking published Ponyboy’s \"Stay gold\" story in 1967 and invented modern YA!"),

  g("LITERATURE", 1, "lit_k06_holes_stanley_yelnats_palindrome",
    "Sent to dig desert pits at Camp Green Lake in Louis Sachar’s \"Holes,\" hero Stanley Yelnats has a name that does what?",
    ["Anagrams to hidden Texas","Reads identical backward","Rhymes in three dialects","Spells secret Morse code"], 1,
    "Every firstborn son gets named \"Stanley\" because backward-matching \"Yelnats\" works seamlessly down generations!"),

  g("LITERATURE", 1, "lit_k06_poirot_nyt_front_page_obituary",
    "Dying in 1975’s \"Curtain,\" which Agatha Christie sleuth got history’s ONLY front-page New York Times fictional obituary?",
    ["Miss Jane Marple","Tommy Beresford","Hercule Poirot","Inspector Japp"], 2,
    "Christie actually locked \"Curtain\" in a bank vault during the 1940s London Blitz so her mustachioed Belgian detective had a proper finale."),

  g("LITERATURE", 1, "lit_k06_and_then_there_were_none_record",
    "Stranding ten guilty strangers on Soldier Island, which Agatha Christie mystery has sold over 100 million copies?",
    ["Murder on the Orient","Death on the Nile","The ABC Murders","And Then There Were None"], 3,
    "Without Poirot or Marple anywhere in sight, every single suspect appears dead when Scotland Yard arrives—forcing an epilogue confession!"),

  g("LITERATURE", 1, "lit_k06_narnia_wardrobe_snowy_lamppost",
    "Pushing past fur coats in C.S. Lewis’s 1950 classic, young Lucy Pevensie steps into snowy Narnia beside a glowing what?",
    ["Wrought-iron lamppost","Frozen marble fountain","Talking golden oak","Candlit stone chapel"], 0,
    "Lewis carried that single picture—a faun holding an umbrella and parcels under a snowy gaslight—in his head since age sixteen!"),

  g("LITERATURE", 1, "lit_k06_around_world_eighty_days_dateline",
    "Phileas Fogg thinks he lost his 80-day wager by minutes in Jules Verne’s novel—until sailing eastward gained him what?",
    ["Strong tail-wind steam knots","An entire calendar day","Leap-year bonus hours","Greenwich tide credit"], 1,
    "Crossing the International Date Line from west to east shaved four minutes off every degree of longitude—handing Fogg twenty-four extra hours!"),

  g("LITERATURE", 1, "lit_k06_war_of_worlds_humble_bacteria",
    "Artillery fails in H.G. Wells’s 1898 \"The War of the Worlds\"—what humble Earth defenders finally wipe out the Martians?",
    ["Swarming locust clouds","Acidic London coal fog","Everyday germs & microbes","Freak solar lightning storms"], 2,
    "Having wiped out disease on Mars ages earlier, the tripod invaders lacked antibodies against the tiniest bacteria in Thames mud!"),

  g("LITERATURE", 1, "lit_k06_little_women_alcott_thrillers",
    "Louisa May Alcott wrote \"Little Women\" reluctantly—secretly preferring to publish lurid pseudonym potboilers full of what?",
    ["Arctic whaling mutinies","Wall Street bank panics","Wild West cattle rustlers","Gothic blood and thunder"], 3,
    "Writing secretly as \"A. M. Barnard,\" Alcott loved passionate revenge potboilers—yet Meg, Jo, Beth, and Amy never went out of print!"),

  g("LITERATURE", 1, "lit_k06_black_beauty_bearing_rein_law",
    "Anna Sewell narrated 1877’s \"Black Beauty\" from a horse’s viewpoint specifically to outlaw which cruel carriage gear?",
    ["Tight bearing checkreins","Spiked winter horseshoes","Heavy leather horse blinders","Iron curb-chain muzzles"], 0,
    "Fashionable Victorian \"bearing reins\" yanked horses’ heads painfully skyward; public tears over Sewell’s novel helped ban the practice!"),

  g("LITERATURE", 1, "lit_k06_gone_girl_cool_girl_flynn",
    "Gillian Flynn stunned 2012 readers midway through \"Gone Girl\" by revealing missing Missouri wife Amy actually did what?",
    ["Joined witness protection","Staged her own framing","Lost five years of memory","Swapped twins at college"], 1,
    "Switching narrators halfway to Amy’s razor-sharp diary detonated the modern domestic-thriller boom overnight."),

  g("LITERATURE", 1, "lit_k06_da_vinci_code_louvre_opening",
    "Dan Brown’s blockbuster \"The Da Vinci Code\" opens past midnight with a slain curator posed inside which Paris landmark?",
    ["Notre-Dame’s North Bell Loft","Paris Catacombs bone crypt","The Louvre’s Grand Gallery","Versailles Mirror Ballroom"], 2,
    "Jacques Saunière arranges himself like Leonardo’s Vitruvian Man to point Harvard symbologist Robert Langdon down a trail of ciphers."),

  g("LITERATURE", 1, "lit_k06_book_thief_narrated_by_death",
    "Following foster girl Liesel rescuing books in wartime Germany, Markus Zusak’s \"The Book Thief\" is narrated by whom?",
    ["A perched churchyard raven","Liesel’s old granddaughter","A burned library phantom","World-weary Death"], 3,
    "Zusak’s narrator isn’t spooky with a scythe—Death notices sky colors first to distract himself from human heartbreak."),

  g("LITERATURE", 1, "lit_k06_bridgerton_eight_alphabetical_siblings",
    "In Julia Quinn’s \"Bridgerton\" novels, how did Viscountess Violet name all eight children from Anthony to Hyacinth?",
    ["Alphabetically A to H","After Tudor monarchs","By spring birth-flowers","Greek star constellations"], 0,
    "Anthony, Benedict, Colin, Daphne, Eloise, Francesca, Gregory, and Hyacinth marched neatly down the Regency nursery!"),

  g("LITERATURE", 1, "lit_k06_kite_runner_for_you_thousand_times",
    "Physician Khaled Hosseini woke at 5 a.m. before hospital shifts to write which 2003 novel set in Kabul kite tournaments?",
    ["A Thousand Splendid Suns","The Kite Runner","And the Mountains Echoed","The Beekeeper of Aleppo"], 1,
    "Loyal friend Hassan’s parting promise—\"For you, a thousand times over\"—turned a first-time novelist into a two-year #1 phenomenon."),

  g("LITERATURE", 1, "lit_k06_fault_in_our_stars_john_green",
    "Twisting a line from Shakespeare’s \"Julius Caesar,\" John Green’s 2012 bestseller about Hazel and Gus bears what title?",
    ["Looking for Alaska","Paper Towns Forever","The Fault in Our Stars","Turtles All the Way Down"], 2,
    "Cassius tells Brutus the fault is NOT in our stars, \"but in ourselves\"—Green flipped the line for two witty kids dealt unfair medical cards."),

  g("LITERATURE", 1, "lit_k06_handmaids_tale_real_history_rule",
    "Writing \"The Handmaid’s Tale\" in 1984 West Berlin, Margaret Atwood obeyed one strict rule: include nothing that what?",
    ["Set inside North America","Powered by modern gadgets","Broadcast on evening news","Not already done in history"], 3,
    "Atwood kept massive newspaper-clipping files so critics could never dismiss Gilead’s laws as impossible science-fiction fantasy."),

  g("LITERATURE", 1, "lit_k06_princess_bride_abridged_framing",
    "William Goldman tricked \"The Princess Bride\" readers by claiming he merely abridged the \"good parts\" from whose book?",
    ["Fake author S. Morgenstern","Forgotten Count Florin","Fencing master Montoya’s log","Real monk Brother Westley"], 0,
    "Bookstores fielded thousands of requests for Morgenstern’s \"unabridged\" Florinese history—every charming word was Goldman’s invention!"),

  g("LITERATURE", 1, "lit_k06_fight_club_soap_palahniuk",
    "After coworkers politely ignored bruises from a wild camping trip, diesel mechanic Chuck Palahniuk wrote which novel?",
    ["American Psycho","Fight Club","Trainspotting","A Clockwork Orange"], 1,
    "Realizing polite office workers craved raw catharsis—and learning homemade soap shared ingredients with explosives—gave birth to Tyler Durden."),

  g("LITERATURE", 1, "lit_k06_godfather_puzo_gambling_debts",
    "Broke with $20,000 in gambling debts and zero Mafia pals, Mario Puzo used library research to write which 1969 smash?",
    ["Wiseguy Tales","The Sicilian Clan","The Godfather","Donnie Brasco"], 2,
    "Puzo literally coined pop-culture Mob lingo like calling the boss \"Godfather\" from pure imagination—then real gangsters started copying his book!"),

  g("LITERATURE", 1, "lit_k06_giver_lois_lowry_fading_memory",
    "Visiting her aging father as old memories slipped away inspired Lois Lowry’s 1993 Newbery classic titled what?",
    ["Number the Stars","Gathering Blue","Tuck Everlasting","The Giver"], 3,
    "Readers only realize midway through that Jonas’s polite community lacks color vision—until an apple flashes red!"),

  g("LITERATURE", 1, "lit_k06_ramona_beverly_cleary_patron_boy",
    "Librarian Beverly Cleary created Ramona Quimby after a frustrated boy stood at her desk asking where to find what?",
    ["Books about kids like us","Stories with talking dogs","Tales without homework","Mysteries set in Oregon"], 0,
    "Tired of prim Victorian manor children, Cleary populated Klickitat Street with scraped knees, hand-me-downs, and real neighborhood messes."),

  g("LITERATURE", 1, "lit_k06_lorax_seuss_rhymed_with_voice",
    "Dr. Seuss pronounced his real middle name \"Zoice\" (like \"voice\") because Theodor Seuss Geisel’s family spoke what?",
    ["Flemish Dutch","Bavarian German","Alsatian French","Jutland Danish dialect"], 1,
    "Americans kept rhyming \"Seuss\" with \"Mother Goose,\" so Geisel shrugged and rolled with it—figuring a friendly goose suited children’s books!"),

  g("LITERATURE", 1, "lit_k06_caged_bird_sings_dunbar_poem",
    "Encouraged by James Baldwin, Maya Angelou titled \"I Know Why the Caged Bird Sings\" after a classic poem by whom?",
    ["Phillis Wheatley","Countee Cullen","Paul Laurence Dunbar","Poet Gwendolyn Brooks"], 2,
    "Dunbar’s 1899 lyric \"Sympathy\" gave Angelou’s childhood silence and eventual literary voice its unforgettable title."),

  g("LITERATURE", 1, "lit_k06_peter_rabbit_beatrix_potter_farms",
    "After self-printing 250 copies of \"Peter Rabbit,\" Beatrix Potter used her millions in book royalties to preserve what?",
    ["Scottish lighthouse towers","Cornwall tin-mine ponies","Thames wooden houseboats","Lake District hill farms"], 3,
    "Potter bought over 4,000 acres of Herdwick sheep country and left the entire breathtaking landscape to Britain’s National Trust!"),

  g("LITERATURE", 1, "lit_k06_count_monte_cristo_chateau_dif",
    "Framed on his wedding day in \"The Count of Monte Cristo,\" Edmond Dantès escapes after 14 years inside what island jail?",
    ["Marseille’s Château d’If","Old Paris’s grim Bastille","Corsica’s Devil’s Keep","Venice’s Bridge of Sighs"], 0,
    "Real tourists visiting Marseille’s island fortress today find a \"Cell of Edmond Dantès\" carved out just to honor Dumas’s fictional hero!"),

  g("LITERATURE", 1, "lit_k06_chekhovs_gun_dramatic_law",
    "Anton Chekhov gave writers a famous rule: if you hang a loaded rifle on the wall in Act One, what MUST happen later?",
    ["The hero unloads it safely","It fires before curtain","Police lock up the weapon","Nobody touches the prop"], 1,
    "Known worldwide as \"Chekhov’s gun,\" the principle warns writers never to plant flashy false promises on stage that go nowhere."),

  g("LITERATURE", 1, "lit_k06_sphinx_riddle_oedipus_legs",
    "Outside Thebes, the Sphinx asks Oedipus what walks on four legs at dawn, two at noon, and three at what time of life?",
    ["Across icy winter rivers","Inside dark temple halls","At twilight with a cane","Climbing steep hills"], 2,
    "Oedipus solves the metaphor of human life—crawling baby, upright adult, elder leaning on a walking stick—sending the Sphinx off her cliff!"),

  g("LITERATURE", 1, "lit_k06_project_hail_mary_rocky_weir",
    "Waking solo with amnesia on a starship in Andy Weir’s \"Project Hail Mary,\" astronaut Ryland Grace befriends whom?",
    ["A rogue shipboard computer","A cloned backup astronaut","A stowaway ship botanist","Spider-like alien Rocky"], 3,
    "Communicating in musical chords while fixing engines with \"xenonite,\" Rocky quickly became modern sci-fi’s favorite five-legged engineer!"),

  g("LITERATURE", 1, "lit_k06_crawdads_sing_delia_owens",
    "Before selling 18 million copies of \"Where the Crawdads Sing\" at age 69, Delia Owens spent decades working as what?",
    ["Wildlife biologist in Africa","Charleston harbor navigator","Appalachian circuit judge","Smithsonian bird illustrator"], 0,
    "Years studying Kalahari lions and elephants shaped how vividly Owens wrote \"Marsh Girl\" Kya’s solitary survival on the Carolina coast."),

  g("LITERATURE", 1, "lit_k06_girl_dragon_tattoo_swedish_title",
    "Published after Stieg Larsson’s sudden death, \"The Girl with the Dragon Tattoo\" bore what blunt original Swedish title?",
    ["Ghosts of Stockholm Bay","Men Who Hate Women","The Hacker of Hedeby","Fire Over Frozen Water"], 1,
    "Larsson handed all three Millennium manuscripts starring punk prodigy Lisbeth Salander to his publisher right before suffering a fatal heart attack."),

  g("LITERATURE", 1, "lit_k06_seven_husbands_evelyn_hugo_reid",
    "BookTok propelled Taylor Jenkins Reid’s 2017 hit back up the charts—chronicling screen icon Evelyn Hugo and how many husbands?",
    ["Five studio moguls","Nine leading men","Seven strategic husbands","Six tempestuous marriages"], 2,
    "Hugo summons unknown magazine reporter Monique Grant to spill which marriage hid the one true love of her life."),

  gv("LITERATURE", 1, "lit_k06_shining_room_217_stanley_hotel",
    "Checking into an empty Colorado mountain hotel before winter snows in 1974 handed Stephen King the plot of what novel?",
    ["SALEM LOT","PET SEMATARY","MISERY","THE SHINING"], 3,
    ["E-A-I","U-I-I","E-I-U","E-I-I"],
    "Wandering empty hallways and dining alone beneath orchestral tape music at Colorado’s Stanley Hotel birthed the Overlook’s cabin fever!"),

  gv("LITERATURE", 1, "lit_k06_james_percival_everett_pulitzer",
    "Percival Everett won the 2025 Pulitzer Prize by retelling Mark Twain’s Mississippi raft classic through whose eyes?",
    ["ENSLAVED JIM","TOM SAWYER","WIDOW DOUGLAS","JUDGE THATCHER"], 0,
    ["E-A-E-I","O-A-A-I","E-U-E-O","A-A-I-I"],
    "In \"James,\" Jim secretly teaches enslaved children code-switching into \"folksy\" dialect only when white townsfolk are listening!"),

  g("LITERATURE", 2, "lit_k06_hp_alice_newton_eight_year_old",
    "After twelve publishers rejected \"Harry Potter,\" Bloomsbury chairman Nigel Newton bought it for £1,500 because who demanded chapter two?",
    ["Queen Elizabeth’s page","His 8-year-old daughter","A night-shift janitor","Foyles’ head fiction buyer"], 1,
    "Eight-year-old Alice Newton raved it beat everything else—though Bloomsbury still advised Rowling to keep a day job!"),

  g("LITERATURE", 2, "lit_k06_hp_robert_galbraith_leak_lawyer",
    "Selling modest mystery copies in 2013 as retired military investigator \"Robert Galbraith,\" J.K. Rowling’s cover blew when a lawyer tipped off whom?",
    ["Scotland Yard’s press desk","Her Edinburgh postman","Wife’s friend on Twitter","BBC’s literary quiz panel"], 2,
    "\"The Cuckoo’s Calling\" rocketed over 150,000% on Amazon hours after Sunday Times reporters confirmed a partner’s loose-lipped chat!"),

  g("LITERATURE", 2, "lit_k06_hunger_games_katniss_swamp_potato",
    "Before firing arrows in Panem, Katniss Everdeen owes her first name to a real North American marsh plant whose submerged tubers taste like what?",
    ["Bitter woodland chestnuts","Spiced wintergreen bark","Tart wild crabapples","Roasted sweet potatoes"], 3,
    "Sagittaria (\"arrowhead\" in Latin—a second archery wink!) feeds starving foragers with starchy underwater tubers."),

  g("LITERATURE", 2, "lit_k06_got_wars_of_roses_lannister_stark",
    "Swap two letters in England’s 15th-century Wars of the Roses—Red Lancaster vs. White York—and you unlock George R.R. Martin’s feud between whom?",
    ["Lannister and Stark","Targaryen and Martell","Baratheon and Greyjoy","Tyrell and Hightower"], 0,
    "Even Westeros’s infamous \"Red Wedding\" fused two real Scottish dinner massacres: the 1440 Black Dinner and 1692 Glencoe!"),

  g("LITERATURE", 2, "lit_k06_dune_oregon_coastal_sand_hills",
    "Journalist Frank Herbert dreamed up desert planet Arrakis in 1957 while flying over USDA grass-planting teams stabilizing dunes in which U.S. state?",
    ["Southern New Mexico","Coastal Oregon","Western Mojave Utah","Panhandle Texas"], 1,
    "Watching wind-driven sand swallow highways near Florence, Oregon sparked an unpublished magazine article that snowballed into \"Dune\"!"),

  g("LITERATURE", 2, "lit_k06_stephen_king_bachman_bookstore_clerk",
    "Publishing five gritty paperbacks as \"Richard Bachman\" to test if talent beat fame, Stephen King got unmasked in 1985 by a sharp-eyed D.C. what?",
    ["Sharp-eyed IRS tax auditor","Bangor postal meter clerk","Clerk Steve Brown","Library copyright lawyer"], 2,
    "Spotting King’s signature rhythm in \"Thinner,\" Brown checked Library of Congress copyright filings and found King’s own agent’s name on one form!"),

  g("LITERATURE", 2, "lit_k06_sanderson_kickstarter_41_million",
    "Confessing on YouTube that pandemic lockdowns made him \"accidentally write four secret novels,\" which fantasy author broke Kickstarter’s $41M record?",
    ["Author Patrick Rothfuss","Joe Abercrombie","Robin Hobb","Brandon Sanderson"], 3,
    "Over 185,000 backers pledged $41.7 million in thirty days in 2022—more than doubling Kickstarter’s previous all-time record!"),

  g("LITERATURE", 2, "lit_k06_han_kang_2024_nobel_vegetarian",
    "Making literary history in 2024 as both the first South Korean and first Asian woman awarded the Literature Nobel, Han Kang broke out globally with what?",
    ["The Vegetarian","Pachinko Saga","Crying in H Mart","Human Acts"], 0,
    "Dreaming of violence, Seoul homemaker Yeong-hye simply stops eating meat—triggering an unsettling family rebellion across three lean acts."),

  g("LITERATURE", 2, "lit_k06_acotar_sarah_j_maas_prythian_fae",
    "Fueling the modern \"romantasy\" boom across BookTok, Sarah J. Maas’s \"A Court of Thorns and Roses\" sweeps Feyre into what fae realm?",
    ["Sunken island Numenor","Faerie land Prythian","Shadow-cursed Ravka","Floating cloud Laputa"], 1,
    "Loosely remixing \"Beauty and the Beast\" with Scottish ballad Tam Lin, Maas built a multi-series fantasy universe!"),

  g("LITERATURE", 2, "lit_k06_cormac_mccarthy_road_no_quotes",
    "Winning the 2007 Pulitzer for bleak father-son journey \"The Road,\" Cormac McCarthy famously omitted which punctuation?",
    ["Every final period","All capital letters","Quotation marks","Question marks"], 2,
    "McCarthy told Oprah there was zero reason to \"blot the page up with weird little marks\" if crisp dialogue already made speakers obvious!"),

  g("LITERATURE", 2, "lit_k06_three_body_problem_liu_cixin",
    "Engineer Liu Cixin became the first Asian author to win sci-fi’s Hugo Award for Best Novel with which alien epic?",
    ["Folding Beijing","Children of Time","Ann Leckie’s Ancillary War","The Three-Body Problem"], 3,
    "Trisolaris orbits three chaotic suns that alternately scorch and freeze the planet—forcing inhabitants to \"dehydrate\" like dry canvases!"),

  g("LITERATURE", 2, "lit_k06_tomorrow_macbeth_zec_zevin",
    "Following thirty years of video-game designers Sam and Sadie, Gabrielle Zevin lifted \"Tomorrow, and Tomorrow, and Tomorrow\" from which Shakespeare play?",
    ["Tragic Macbeth","Stormy Tempest","Witty Twelfth Night","Bloody Titus"], 0,
    "Where Macbeth despairs at life’s fleeting stage, Zevin’s game makers turn \"tomorrow\" into infinite restarts and second chances!"),

  g("LITERATURE", 2, "lit_k06_babel_rf_kuang_silver_translation",
    "In R.F. Kuang’s 2022 dark-academia smash \"Babel,\" Victorian Oxford’s empire runs on enchanted silver bars powered by what linguistic gap?",
    ["Silent vowel sound shifts","Nuance lost in translation","Backwards Latin hexes","Forgotten Old Norse runes"], 1,
    "Matching English \"match\" with French \"trahir\" captures the tiny nuance lost between two tongues and releases kinetic magic into the silver!"),

  g("LITERATURE", 2, "lit_k06_song_of_achilles_patroclus_miller",
    "Ten years in the writing by Latin teacher Madeline Miller—and propelled back to #1 a decade later by BookTok—\"The Song of Achilles\" is told by whom?",
    ["Clever King Odysseus","Trojan prophetess Cassandra","Exiled prince Patroclus","Immortal nymph Thetis"], 2,
    "Exiled boyhood companion Patroclus narrates from Phthia through Troy—even lingering past his own death until Achilles’s ashes mingle with his."),

  g("LITERATURE", 2, "lit_k06_atwood_future_library_2114_norway",
    "In 2014, Margaret Atwood handed over \"Scribbler Moon\" as Manuscript #1 of Oslo’s \"Future Library\"—locked unread until trees planted that year do what?",
    ["Survive three eclipses","Reach 200 feet tall","Outlive fossil fuels","Grow paper for 2114"], 3,
    "One author contributes a secret work yearly for a century—including Han Kang and Karl Ove Knausgård—to be printed on 1,000 Norwegian spruces in 2114!"),

  g("LITERATURE", 2, "lit_k06_slaughterhouse_five_dresden_locker",
    "Captured as a WWII scout, Kurt Vonnegut survived the 1945 Dresden firebombing deep underground inside what room?",
    ["Meatpacking cooler #5","Dresden subway station #9","Brewery wine cellar","Salt-mine bunker #3"], 0,
    "German guards stamped their POW address \"Schlachthof-Fünf\" (\"Slaughterhouse-Five\")—giving Billy Pilgrim’s time-unstuck antiwar classic its title."),

  g("LITERATURE", 2, "lit_k06_murakami_baseball_double_epiphany",
    "Running a Tokyo jazz club at age 29 with zero fiction experience, Haruki Murakami suddenly knew he could write a novel after hearing what sound?",
    ["Midnight subway brakes","Crack of a baseball bat","Monsoon temple bell","Crisp Coltrane tenor solo"], 1,
    "Watching Yakult Swallows batter Dave Hilton smack a crisp opening-inning double at Jingu Stadium in 1978, Murakami bought a fountain pen that night!"),

  g("LITERATURE", 2, "lit_k06_toni_morrison_random_house_editor",
    "Waking at 4 a.m. as a single mother to write \"The Bluest Eye,\" Toni Morrison spent nearly twenty daytime years at Random House editing whom?",
    ["Norman Mailer & Gore Vidal","Stephen King & Crichton","Muhammad Ali & Toni Cade","Kurt Vonnegut & John Updike"], 2,
    "Senior editor Chloe Wofford (\"Toni Morrison\") championed Angela Davis, Gayl Jones, Henry Dumas, and Ali’s autobiography before writing full-time!"),

  g("LITERATURE", 2, "lit_k06_john_le_carre_mi6_bus_poster",
    "Why did \"The Spy Who Came in from the Cold\" author David Cornwell invent the pen name \"John le Carré\" in 1961?",
    ["Tax shelters in Zurich","His uncle sued over libel","French publishers paid more","Active MI6 officers had to"], 3,
    "Foreign Office rules forbade serving British intelligence officers from publishing under real names—until Kim Philby blew Cornwell’s cover anyway!"),

  g("LITERATURE", 2, "lit_k06_in_cold_blood_capote_harper_lee",
    "Pioneering the \"nonfiction novel\" in 1959 Kansas for \"In Cold Blood,\" flamboyant New Yorker Truman Capote won wary locals’ trust by bringing whom?",
    ["Pal Nelle Harper Lee","Kansas Sheriff Roy Church","CBS producer Don Hewitt","Retired G-man Melvin Purvis"], 0,
    "Months before her own \"To Kill a Mockingbird\" made her world-famous, warm Alabamian Nelle Harper Lee typed 150 pages of Holcomb interview notes!"),

  g("LITERATURE", 2, "lit_k06_do_androids_dream_blade_runner",
    "Ridley Scott’s neon-soaked 1982 sci-fi noir \"Blade Runner\" adapted Philip K. Dick’s 1968 novel bearing what unforgettable philosophical question?",
    ["Can Clockwork Men Cry Tears?","Do Androids Dream of Sheep?","Who Built Yesterday’s Sun?","Where Do Chrome Angels Go?"], 1,
    "In \"Do Androids Dream of Electric Sheep?\", Rick Deckard keeps a battery-powered rooftop sheep because real animals are status symbols after fallout!"),

  g("LITERATURE", 2, "lit_k06_discworld_four_elephants_turtle",
    "Across 41 comic fantasy novels by Terry Pratchett, flat Discworld rests on four giant elephants standing atop what?",
    ["Atlas’s bronze shoulders","World-serpent Jörmungandr","Star turtle Great A’Tuin","A clockwork brass whale"], 2,
    "Borrowing ancient Hindu world-tortoise myth, Pratchett joked Discworld scientists lowered a brass capsule over the rim just to check A’Tuin’s sex!"),

  g("LITERATURE", 2, "lit_k06_watchmen_time_top_100_novels",
    "Deconstructing caped vigilantes beside a ticking Doomsday Clock in 1986, which Alan Moore & Dave Gibbons work made Time’s Top 100 English Novels?",
    ["V for Vendetta","The Sandman","Dark Knight Returns","Watchmen"], 3,
    "Critics marveled at Issue #5 (\"Fearful Symmetry\"), whose panel layouts mirror front-to-back like Rorschach’s inkblot mask!"),

  g("LITERATURE", 2, "lit_k06_octavia_butler_macarthur_genius",
    "Sending modern Black writer Dana hurtling back to an antebellum Maryland plantation in \"Kindred,\" which author won sci-fi’s first MacArthur Grant?",
    ["Octavia E. Butler","Samuel R. Delany","Author N.K. Jemisin","Ursula K. Le Guin"], 0,
    "Rising at 2 a.m. in Pasadena before warehouse and dishwashing shifts, shy six-foot trailblazer Butler rewrote speculative fiction’s DNA."),

  g("LITERATURE", 2, "lit_k06_name_of_the_rose_blind_jorge",
    "In Umberto Eco’s 1980 medieval monastery whodunit \"The Name of the Rose,\" monks die with blackened fingertips after licking poisoned pages of what?",
    ["Forbidden royal love letters","Aristotle’s book on comedy","Galileo’s banned star maps","Cleopatra’s alchemy scroll"], 1,
    "Notice Eco’s affectionate wink: the blind keeper of the labyrinthine library is \"Jorge of Burgos\"—honoring blind master Jorge Luis Borges!"),

  g("LITERATURE", 2, "lit_k06_house_of_spirits_january_eighth",
    "Isabel Allende always begins every new book on January 8—the exact date in 1981 she started a farewell letter to her dying grandfather that became what?",
    ["Distant Star","Portrait in Sepia","The House of the Spirits","The Japanese Lover’s Ring"], 2,
    "Living in exile in Caracas, Allende wrote 500 magical-realist pages at night on her kitchen counter after her 99-year-old Tata passed away."),

  g("LITERATURE", 2, "lit_k06_reichenbach_falls_black_armbands",
    "Sick of detective yarns blocking his historical novels, Arthur Conan Doyle plunged Sherlock Holmes and Moriarty over which Swiss cataract in 1893?",
    ["Thundering Rhine Cataracts","Lauterbrunnen Cliff Drop","Trümmelbach Glacier Gorge","Reichenbach Falls"], 3,
    "Twenty thousand angry readers canceled The Strand Magazine and City clerks wore black mourning crêpe on their hats until Doyle relented!"),

  g("LITERATURE", 2, "lit_k06_emily_dickinson_hand_sewn_fascicles",
    "Publishing fewer than a dozen poems anonymously in life, Emily Dickinson left sister Lavinia a wooden chest holding 1,800 verses stitched into what?",
    ["40 hand-sewn booklets","Quilted calico linings","Pressed herbarium jars","Rolled wallpaper tubes"], 0,
    "Scholars call those needle-and-string packets \"fascicles\"; early editors smoothed out her radical dashes until 1955 restored her true voice!"),

  g("LITERATURE", 2, "lit_k06_sophia_tolstaya_copied_war_peace",
    "Before typewriters or carbon paper existed in 1860s Russia, how many times did Countess Sophia Tolstaya copy \"War and Peace\" by candlelight?",
    ["Twice from dictation","Seven complete times","Twelve chapter drafts","Once on parchment"], 1,
    "Deciphering Leo Tolstoy’s microscopic cross-outs with a magnifying glass after putting children to bed, Sophia acted as editor, scribe, and publisher!"),

  g("LITERATURE", 2, "lit_k06_dostoevsky_mock_firing_squad_1849",
    "Blindfolded before a St. Petersburg firing squad in 1849, which future Russian master heard Tsar Nicholas I’s last-second reprieve drumroll?",
    ["Novelist Ivan Turgenev","Playwright Anton Chekhov","Fyodor Dostoevsky","Poet Boris Pasternak"], 2,
    "Shackled four years in a Siberian prison camp right afterward, Dostoevsky poured that raw near-death terror straight into \"The Idiot\"!"),

  g("LITERATURE", 2, "lit_k06_shirley_jackson_lottery_mailstorm",
    "Printing Shirley Jackson’s sunny village story \"The Lottery\" in June 1948 triggered the biggest flood of furious reader mail in whose history?",
    ["The Atlantic Monthly","Saturday Evening Post","Harper’s Bazaar","The New Yorker"], 3,
    "Hundreds canceled subscriptions—and dozens bewilderingly wrote asking which New England town they could visit to watch the real stoning!"),

  g("LITERATURE", 2, "lit_k06_poe_murders_rue_morgue_orangutan",
    "Inventing modern detective fiction in 1841’s \"The Murders in the Rue Morgue,\" Edgar Allan Poe’s sleuth Dupin proves the locked-room killer was what?",
    ["A sailor’s pet orangutan","An escaped circus bear","Twin trapeze acrobats","A trained carrier hawk"], 0,
    "Thirty-six years before Sherlock Holmes existed, C. Auguste Dupin pioneered armchair deduction, baffled police, and the loyal narrating sidekick!"),

  g("LITERATURE", 2, "lit_k06_hemingway_iceberg_theory_omission",
    "Trained on tight Kansas City Star cables, Ernest Hemingway compared great prose to what ocean hazard—strong because seven-eighths stays unseen?",
    ["A submerged coral reef","A drifting iceberg","An undertow rip tide","A deep trench fault"], 1,
    "Hemingway argued a writer may omit anything they truly know, and readers will feel its quiet gravity beneath spare sentences."),

  g("LITERATURE", 2, "lit_k06_raisin_in_the_sun_langston_hughes",
    "Lorraine Hansberry took the title of Broadway’s trailblazing 1959 play \"A Raisin in the Sun\" from \"Harlem,\" an eleven-line poem by whom?",
    ["Claude McKay","Jean Toomer","Langston Hughes","Playwright Amiri Baraka"], 2,
    "\"What happens to a dream deferred? Does it dry up like a raisin in the sun?\" made 29-year-old Hansberry the first Black woman produced on Broadway!"),

  g("LITERATURE", 2, "lit_k06_zora_neale_hurston_anthropologist",
    "Before writing 1937’s Harlem Renaissance gem \"Their Eyes Were Watching God\" in seven weeks in Haiti, Zora Neale Hurston trained at Barnard in what?",
    ["Classical pipe organ","Cultural anthropology","Marine invertebrate lab","Constitutional tort law"], 1,
    "Studying under Franz Boas, Hurston drove across Florida and New Orleans with a pistol and recording horn preserving authentic Southern folklore!"),

  g("LITERATURE", 2, "lit_k06_pablo_neruda_green_ink_signature",
    "Calling it the color of hope, Chilean Nobel poet Pablo Neruda insisted on hand-writing his odes using what ink?",
    ["Crushed violet berry ink","Dark pumice charcoal nibs","Green fountain-pen ink","Liquid copperplate gold"], 2,
    "Born Ricardo Eliécer Neftalí Reyes Basoalto, teenage Neruda adopted Czech poet Jan Neruda’s surname so his railway-worker father wouldn’t spot his verses!"),

  g("LITERATURE", 2, "lit_k06_basho_frog_jumps_old_pond_haiku",
    "Japan’s most celebrated 17-syllable haiku—written in 1686 by wandering master Matsuo Bashō—ends not with a bird or blossom, but the sound of what?",
    ["Heavy snow snapping bamboo","Temple incense ash","Crickets under frost","Water from a jumping frog"], 3,
    "\"Old pond / a frog jumps in / the sound of water\"—Bashō startled court poets by honoring a humble green frog instead of aristocratic nightingales!"),

  g("LITERATURE", 2, "lit_k06_sappho_island_of_lesbos_lyric",
    "Praised by Plato as the \"Tenth Muse,\" 6th-century BCE poet Sappho sang personal lyrics to the strumming of a lyre on which Aegean island?",
    ["Sunlit Lesbos","Rocky Ithaca","Marble Paros","Volcanic Santorini"], 0,
    "Both English words \"sapphic\" (from her name) and \"lesbian\" (literally \"of Lesbos\") descend directly from her ancient island verses!"),

  g("LITERATURE", 2, "lit_k06_goldfinch_donna_tartt_painting",
    "Surviving a museum bombing in Donna Tartt’s 2014 Pulitzer winner, teenager Theo Decker smuggles out Carel Fabritius’s tiny 1654 masterpiece of what?",
    ["A chained pet goldfinch","A spilled pewter goblet","A sleeping brindle hound","A pearl-earringed lute"], 0,
    "Tragically in real life, Dutch master Fabritius perished the very year he painted \"The Goldfinch\" when Delft’s gunpowder magazine exploded!"),

  gv("LITERATURE", 2, "lit_k06_wolf_hall_hilary_mantel_cromwell",
    "Winning back-to-back Booker Prizes for \"Wolf Hall\" and \"Bring Up the Bodies,\" Hilary Mantel rehabilitated which Tudor fixer from villain to hero?",
    ["CARDINAL WOLSEY","THOMAS CROMWELL","THOMAS MORE","DUKE OF NORFOLK"], 1,
    ["A-A-I-E","O-A-O-E","O-U-O-I","I-A-U-E"],
    "Usually cast as a sneering stage schemer, Putney blacksmith’s son Cromwell emerges in Mantel’s trilogy as the sharpest mind in Henry VIII’s court!"),

  gv("LITERATURE", 2, "lit_k06_good_omens_gaiman_pratchett_phone",
    "Swapping midnight floppy disks and reading chapters aloud by phone, Terry Pratchett and Neil Gaiman co-wrote which comic apocalypse novel?",
    ["AMERICAN GODS","NEVERWHERE","GOOD OMENS","SMALL GODS"], 2,
    ["O-E-O-E","E-O-O-E","O-O-O-E","O-O-O-O"],
    "Fussy angel Aziraphale and Queen-loving demon Crowley team up because neither wants Heaven or Hell ruining cozy Oxfordshire bookshops!"),

  g("LITERATURE", 2, "lit_k06_yellowface_rf_kuang_satire_2023",
    "In R.F. Kuang’s biting 2023 publishing satire \"Yellowface,\" struggling writer June Hayward steals an unpublished WWI novel right after what happens?",
    ["A cloud ransomware breach","A midnight train bag swap","A heated MFA book party","Athena chokes on pancakes"], 3,
    "Rebranding herself \"Juniper Song,\" June spirals into social-media paranoia as anonymous burner accounts hint that Athena’s ghost knows the truth!"),

  g("LITERATURE", 2, "lit_k06_normal_people_sally_rooney_trinity",
    "Tracing secret high-school sweethearts Connell and Marianne from small-town Sligo to Dublin’s Trinity College, which 2018 novel crowned Sally Rooney?",
    ["Conversations w/ Friends","Beautiful World, Where","Normal People","Intermezzo"], 2,
    "Like McCarthy, Rooney skips quotation marks—letting awkward text messages, class anxiety, and unspoken pauses carry huge emotional punch."),

  g("LITERATURE", 3, "lit_k06_hp_nicolas_flamel_real_scribe",
    "Hogwarts fans think Rowling invented Nicolas Flamel—in truth, the real 14th-century Parisian worked quietly as what?",
    ["Manuscript seller & scribe","Notre-Dame stained glassier","Royal mint coin assayer","Sorbonne plague apothecary"], 0,
    "Real Flamel funded Paris shelters—and his 1407 stone house still stands—sparking centuries of wild alchemy legends!"),

  g("LITERATURE", 3, "lit_k06_melville_customs_inspector_hawthorne",
    "After \"Moby-Dick\" flopped commercially and a warehouse fire torched unsold copies, Herman Melville supported his family for 19 years working where?",
    ["Nantucket lighthouse keep","NYC docks customs office","Boston post-office dead room","Concord town tax ledger"], 1,
    "Walking Manhattan piers daily at $4 a day in obscurity, Melville left \"Billy Budd\" tucked inside a tin breadbox when he died in 1891!"),

  g("LITERATURE", 3, "lit_k06_tagore_gitanjali_first_asian_nobel",
    "Translating his Bengali song-offerings \"Gitanjali\" on a ship bound for England, who became the first non-European Literature Nobel laureate in 1913?",
    ["Khalil Gibran","Kenzaburo Oe","Rabindranath Tagore","Novelist Yasunari Kawabata"], 2,
    "Remarkably, Tagore remains history’s lone poet whose songs became the official national anthems of TWO nations: India and Bangladesh!"),

  g("LITERATURE", 3, "lit_k06_master_margarita_manuscripts_burn",
    "Writing in secret under Stalin while Satan’s retinue and a talking cat rattle Moscow, Mikhail Bulgakov penned what?",
    ["Doctor Zhivago","One Day in Ivan Denisovich","We by Zamyatin","The Master and Margarita"], 3,
    "Published 26 years after Bulgakov’s death, Woland delivers Russia’s defiant proverb against censors: \"Manuscripts don’t burn!\""),

  g("LITERATURE", 3, "lit_k06_ishiguro_never_let_me_go_hailsham",
    "Nobel laureate Kazuo Ishiguro’s quiet 2005 novel \"Never Let Me Go\" slowly reveals polite English boarding-school students at Hailsham are actually what?",
    ["Organ-donor human clones","Cold War sleeper orphans","Telepathic radar listeners","Time-looped evacuees"], 0,
    "Without a single laser gun or laboratory chase, Kathy H.’s calm nostalgia makes realizing what \"completing\" means doubly chilling."),

  g("LITERATURE", 3, "lit_k06_wind_in_willows_bedtime_letters",
    "Bank of England secretary Kenneth Grahame spun Mole, Ratty, and motorcar-obsessed Mr. Toad in \"The Wind in the Willows\" from mailed letters to whom?",
    ["Wounded Boer War nurses","His young son Alastair","Cousin Beatrix Potter","King Edward’s grandchildren"], 1,
    "Vacationing nanny Miss Smedley carefully saved every vacation bedtime letter—rescuing English children’s literature’s coziest riverbank!"),

  g("LITERATURE", 3, "lit_k06_bell_jar_victoria_lucas_plath",
    "Published in London one month before Sylvia Plath’s death in January 1963, \"The Bell Jar\" originally hit shelves under which protective pen name?",
    ["Esther Greenwood","Ariel Hughes","Victoria Lucas","Clara Lowell"], 2,
    "Worried thinly veiled portraits would hurt her mother and New York magazine mentors, Plath shielded the UK first edition behind a pseudonym."),

  g("LITERATURE", 3, "lit_k06_midnight_children_triple_booker",
    "Tracking telepathic Saleem Sinai born at the exact stroke of India’s August 1947 independence, which Salman Rushdie novel won the \"Best of the Booker\"?",
    ["The Satanic Verses","Victory City","The Moor’s Last Sigh","Midnight’s Children"], 3,
    "Winning the 1981 Booker, the 25th-anniversary \"Booker of Bookers\" (1993), AND the 40th-anniversary public vote (2008), it swept three crowns!"),

  g("LITERATURE", 3, "lit_k06_god_of_small_things_arundhati_roy",
    "Trained as a Delhi architect with zero prior novels, Arundhati Roy won the 1997 Booker Prize for which lush tragedy set in Kerala’s pickle factory?",
    ["The God of Small Things","A Fine Balance in Bombay","Aravind Adiga’s White Tiger","Amitav Ghosh’s Poppy Sea"], 0,
    "Writing non-sequentially over four and a half years around fraternal twins Rahel and Estha, Roy landed the biggest debut advance in Indian history."),

  g("LITERATURE", 3, "lit_k06_americanah_adichie_braiding_blog",
    "Framing race in America through a Princeton hair-braiding salon and sharp blog posts, Chimamanda Ngozi Adichie won the Critics Circle prize for what?",
    ["Half of a Yellow Sun","Americanah","Purple Hibiscus","Dream Count"], 1,
    "Ifemelu realizes she never thought of herself as \"Black\" back home in Lagos—she only \"became Black\" upon stepping off the plane in the U.S.!"),

  g("LITERATURE", 3, "lit_k06_gonzo_thompson_kentucky_derby",
    "Before \"Fear and Loathing in Las Vegas,\" Hunter S. Thompson accidentally invented manic first-person \"Gonzo\" journalism by mailing raw notebook pages from where?",
    ["Woodstock’s mud stage","Apollo 11’s press bleachers","1970 Kentucky Derby","Nixon’s Miami convention"], 2,
    "Deadlocked on deadline with zero finished article, Thompson ripped unedited pages straight from his binder and wired them to Scanlan’s Monthly!"),

  g("LITERATURE", 3, "lit_k06_carl_sagan_contact_wormhole_thorne",
    "Wanting Dr. Ellie Arroway’s faster-than-light transit in 1985’s \"Contact\" to obey real relativity, Carl Sagan phoned Caltech pal Kip Thorne—sparking what?",
    ["Gravitational laser waves","Dark-energy expansion math","Black-hole Hawking radiation","Traversable wormholes"], 3,
    "Instead of waving sci-fi \"hyperspace,\" Thorne worked out real Einstein field equations for exotic-matter wormholes—publishing a landmark physics paper!"),

  g("LITERATURE", 3, "lit_k06_rumi_whirling_masnavi_konya",
    "Revered from 13th-century Anatolia to modern wedding readings, Sufi mystic poet Rumi composed his 25,000-couplet \"Masnavi\" in which language?",
    ["Classical Persian","Imperial Ottoman Turkish","Ancient Syrian Aramaic","Medieval Spanish Ladino"], 0,
    "Born in Balkh and buried in Turkish Konya, Jalāl al-Dīn Rūmī dictated spinning ecstatic verses in melodic Persian as scribes raced behind him."),

  g("LITERATURE", 3, "lit_k06_annie_ernaux_years_2022_nobel",
    "Awarded the 2022 Nobel Prize for uncovering \"the roots and collective restraints of personal memory,\" French pioneer Annie Ernaux wrote \"The Years\" avoiding what?",
    ["Any exact calendar dates","First-person singular \"I\"","Real French street names","All past-tense verbs"], 1,
    "Spanning postwar France from 1941 to 2006 through shared \"we\" and \"one,\" Ernaux turned one woman’s photo album into an entire generation’s mirror!"),

  gv("LITERATURE", 3, "lit_k06_it_ends_with_us_colleen_hoover",
    "Starting out self-publishing from a single-wide Texas trailer while earning $9 an hour as a social worker, who wrote runaway #1 \"It Ends with Us\"?",
    ["EMILY HENRY","TESSA BAILEY","COLLEEN HOOVER","ALI HAZELWOOD"], 2,
    ["A-E-A-O-U-E","O-A-E-U-O-U","O-E-E-O-O-E","I-E-I-O-E-E"],
    "In 2022 alone, Hoover held six of the top ten print fiction slots across all of America—outselling the Bible in several retail weeks!"),

  gv("LITERATURE", 3, "lit_k06_floriography_hermione_winters_tale",
    "J.K. Rowling lifted Hermione Granger’s rare Greek first name—so readers wouldn’t tease real schoolgirls—from a wrongly accused queen in which play?",
    ["CYMBELINE","PERICLES","MEASURE FOR MEASURE","THE WINTERS TALE"], 3,
    ["E-A-E-A-E","U-I-E-A-O","E-I-E-I-E","E-I-E-A-E"],
    "Rowling pictured clever dentist parents picking a rare Shakespearean name—until Viktor Krum mangled its syllables!"),

  // ======================== LEXICON (108) ========================
  gv("LEXICON", 1, "lex_k06_oxford_2024_brain_rot_thoreau",
    "Crowned Oxford’s 2024 Word of the Year for junk-video scrolling, which phrase did Thoreau coin in 1854’s \"Walden\"?",
    ["BRAIN ROT","DOOM LOOPING","MIND FOGGING","FEED BLUR"], 0,
    ["A-I-O","I-I-I","A-E-O","U-I-U"],
    "Thoreau grumbled in 1854 that England tried curing potato rot while nobody cured \"brain-rot\"—170 years before short-form video existed!"),

  g("LEXICON", 1, "lex_k06_demure_2024_dictionary_word_jools",
    "Boosted by Jools Lebron’s \"very mindful\" TikToks, which modest word won Dictionary.com’s 2024 Word of the Year?",
    ["Very demure","Quietly poised","Primly reserved","Gently polished"], 0,
    "Usage of 15th-century French-rooted \"demure\" jumped nearly 1,200% in August 2024 as workplaces joked in unison!"),

  gv("LEXICON", 1, "lex_k06_delulu_gen_z_solulu_clipping",
    "Born in K-pop fan forums before inspiring \"is the solulu,\" what playful Gen-Z slang clips \"delusional\" into bold daydreaming?",
    ["BESPOKE","DELULU","CRINGEY","LOWKEY"], 1,
    ["O-U-O","E-U-U","E-O-U","A-U-A"],
    "Turning \"delusional\" into cheerful \"delulu is the solulu\" joked that wild self-belief is the best solution!"),

  gv("LEXICON", 1, "lex_k06_oxford_2025_rage_bait_clicks",
    "Named Oxford’s 2025 Word of the Year, what term describes infuriating posts engineered purely to harvest angry clicks?",
    ["CLOUT TRAP","SPITE HOOK","RAGE BAIT","FURY LURE"], 2,
    ["A-U-A-I","O-E-A-I","A-E-A-I","A-E-A-U"],
    "Algorithms reward heated comment sections as \"high engagement,\" turning deliberately infuriating videos into cash machines!"),

  gv("LEXICON", 1, "lex_k06_bluetooth_viking_king_harald",
    "Wireless earbuds owe their name and runic logo to 10th-century Viking King Harald Gormsson, nicknamed what?",
    ["IRONBEARDED","SILVERJAWED","REDTONGUED","BLUETOOTH"], 3,
    ["E-E-I-O","U-A-O-U","O-E-U-O","U-E-O-O"],
    "Just as King Harald united rival Scandinavian tribes, Intel engineer Jim Kardach pitched \"Bluetooth\" in 1996 for uniting PCs and phones!"),

  gv("LEXICON", 1, "lex_k06_spotify_misheard_stockholm_shout",
    "Brainstorming across two Stockholm rooms in 2006, Daniel Ek and Martin Lorentzon named what app from a misheard shout?",
    ["SPOTIFY","SHAZAM APP","PANDORA BOX","AUDIBLE"], 0,
    ["O-I","A-A","E-E","I-I"],
    "Embarrassed that a random misheard syllable had zero meaning, the duo retroactively told reporters it blended \"spot\" and \"identify\"!"),

  g("LEXICON", 1, "lex_k06_google_stanford_googol_typo",
    "Larry Page meant to name his 1997 search engine \"Googol\" (10 to the 100th) until a Stanford labmate did what?",
    ["Lost a midnight coin toss","Snapped the G keycap off","Typed google.com","Misread handwriting"], 2,
    "Grad student Sean Anderson typed \"google.com\" checking domain availability—Page liked the cleaner spelling and registered it within hours!"),

  g("LEXICON", 1, "lex_k06_wifi_not_wireless_fidelity_myth",
    "Tech-myth alert: despite folks guessing \"Wireless Fidelity,\" what did creator Interbrand say \"Wi-Fi\" stands for?",
    ["Wideband Radio Frequency","Wired-Free Local Link","Nothing (a hi-fi pun)","Waveband Interface"], 2,
    "Engineers called the 1999 standard \"IEEE 802.11b Direct Sequence\"—marketers invented catchy \"Wi-Fi\" purely to echo classic stereo \"hi-fi\"!", {"isKlaxonMyth":true}),

  g("LEXICON", 1, "lex_k06_nike_winged_greek_victory_dream",
    "Phil Knight nearly called his sneaker company \"Dimension Six\" before Jeff Johnson woke from a dream naming what goddess?",
    ["Fleet huntress Diana","Dawn runner Eos","Hearth keeper Hestia","Winged victory Nike"], 3,
    "Design student Carolyn Davidson sketched the matching winged Swoosh logo for just $35—later receiving a diamond Swoosh ring and Nike stock!"),

  g("LEXICON", 1, "lex_k06_lego_danish_leg_godt_play_well",
    "Danish carpenter Ole Kirk Christiansen coined \"LEGO\" in 1934 by contracting \"leg godt\"—two words meaning what?",
    ["Play well","Snap tight","Little town","Bright blocks"], 0,
    "Years later the family delightedly learned \"lego\" ALSO happens to mean \"I put together\" or \"I gather\" in classical Latin!"),

  gv("LEXICON", 1, "lex_k06_starbucks_moby_dick_first_mate",
    "Three Seattle pals named their 1971 coffee shop after Captain Ahab’s calm first mate in \"Moby-Dick\"—creating what?",
    ["PEQUOD BREW","STARBUCKS","CARIBOU CUP","QUEEQUEGS"], 1,
    ["I-I","A-U","O-O","U-U"],
    "Co-founder Gordon Bowker nearly chose \"Cargo House\" or Ahab’s ship \"Pequod\" before artist Terry Heckler warned nobody wants \"a cup of Pee-quod\"!"),

  g("LEXICON", 1, "lex_k06_amazon_cadabra_misheard_cadaver",
    "Jeff Bezos first registered his 1994 bookstore as \"Cadabra\"—why did he hastily rename it \"Amazon\" months later?",
    ["Magicians threatened suit","Postmen lost the address","Lawyer heard \"Cadaver\"","Wall Street banned magic"], 2,
    "Paging through the \"A\" dictionary section so alphabetical web directories listed him first, Bezos picked Earth’s biggest river for Earth’s biggest store!"),

  g("LEXICON", 1, "lex_k06_manifest_2024_cambridge_word_year",
    "Used by Simone Biles and Dua Lipa for visualizing dreams into reality, what verb won Cambridge’s 2024 Word of the Year?",
    ["Foreshadowing","Daydreaming","Visualizing","To manifest"], 3,
    "Lookups for 600-year-old Latin-rooted \"manifest\" jumped past 130,000 as athletes credited mental visualization!"),

  g("LEXICON", 1, "lex_k06_wikipedia_hawaiian_airport_shuttle",
    "Ward Cunningham—and later \"Wikipedia\"—borrowed speedy \"wiki\" after riding an airport shuttle bus in what U.S. city?",
    ["Sunny Honolulu","Rainy Seattle","Breezy San Diego","Snowy Anchorage"], 0,
    "Honolulu International Airport’s \"Wiki Wiki Shuttle\" taught Cunningham his first Hawaiian word—\"wiki\" means \"quick\"!"),

  g("LEXICON", 1, "lex_k06_oxford_2015_tears_of_joy_emoji",
    "Lexicographers gasped in 2015 when Oxford awarded its official \"Word of the Year\" to an entry containing zero what?",
    ["Spoken vowel sounds","Consonant letter clusters","Spoken English syllables","Alphabetical letters"], 3,
    "Oxford crowned the \"Face with Tears of Joy\" emoji after data showed it accounted for 20% of all UK emojis sent that year!"),

  gv("LEXICON", 1, "lex_k06_gaslighting_1938_attic_lamps_play",
    "Merriam-Webster’s 2022 Word of the Year—making someone doubt their own sanity—comes from dimmed stage lamps in what?",
    ["BLITHE SPIRIT","DIAL M FOR MURDER","GASLIGHTING","ROPE TRICK"], 2,
    ["A-A-I","O-I-I","A-I-I","A-I-U"],
    "In Patrick Hamilton’s 1938 play \"Gas Light,\" scheming Jack dims the parlor gas lamps while insisting Bella imagined it!"),

  gv("LEXICON", 1, "lex_k06_nepo_baby_2022_hollywood_phrase",
    "Coined in a viral 2022 New York Magazine cover story, what two-word phrase roasts young stars boosted by famous parents?",
    ["INDUSTRY PLANT","TRUST HEIRESS","STUDIO DARLING","NEPO BABY"], 3,
    ["A-O-E","E-I-A","O-E-A","E-O-A"],
    "Shortening \"nepotism baby,\" Vulture’s family-tree cover sparked weeks of defensive Hollywood interviews—and proud tee shirts!"),

  g("LEXICON", 1, "lex_k06_stan_eminem_obsessed_penpal_2000",
    "Added to Oxford’s dictionary in 2017 for a devoted superfan, \"stan\" came straight from whose 2000 storytelling song?",
    ["Rapper Eminem","Pop star Britney Spears","Hitmaker Timbaland","OutKast’s Andre 3000"], 0,
    "Although folk etymology calls it \"stalker + fan,\" the word actually honors fictional letter-writer Stanley in Eminem’s storytelling single!"),

  g("LEXICON", 1, "lex_k06_selfie_2002_australian_lip_post",
    "Before iPhones existed, 2013 Word of the Year \"selfie\" debuted in 2002 on an Aussie forum after a student did what?",
    ["Won an amateur surf title","Tripped & split his lip","Rescued a baby wombat","Finished dental school"], 1,
    "Sharing a close-up of his stitched lip at a 21st party, Nathan Hope apologized \"because it was a selfie\"—pure Aussie slang!"),

  g("LEXICON", 1, "lex_k06_finsta_private_second_instagram",
    "Teens keep a polished main profile for family while posting candid jokes for close pals on a \"finsta\"—short for what?",
    ["Filtered-out Insta feed","Fast-refresh Insta","Fake Instagram","Friends-only status"], 2,
    "Ironically, a \"fake\" Instagram (\"finsta\") holds a user’s REAL unvarnished life while the main grid stays curated!"),

  g("LEXICON", 1, "lex_k06_goat_acronym_muhammad_ali_lonnie",
    "Fans text goat emojis for \"Greatest Of All Time\"—whose wife incorporated \"G.O.A.T. Inc.\" way back in 1992?",
    ["Michael Jordan","Wayne Gretzky","Pelé Nascimento","Muhammad Ali"], 3,
    "Decades after roaring \"I am the greatest!\", Ali’s wife Lonnie trademarked G.O.A.T. Inc. to manage the champ’s licensing legacy!"),

  gv("LEXICON", 1, "lex_k06_firewall_brick_theater_curtain",
    "Victorian theaters built thick brick walls between gaslit stages and spectators—giving cybersecurity what safeguard?",
    ["FIREWALL","FLOODGATES","SMOKEJACKS","DRAFTDOORS"], 0,
    ["I-E-A","I-U-A","A-E-A","I-E-I"],
    "Because gas footlights routinely ignited painted canvas backdrops, brick firewalls and iron safety curtains sealed the stage off from spectators!"),

  g("LEXICON", 1, "lex_k06_computer_bug_1947_harvard_moth",
    "Computer \"debugging\" turned literal in 1947 when Grace Hopper’s Harvard team taped what culprit inside their logbook?",
    ["A copper penny","A squashed moth","A burnt matchstick","A stray paperclip"], 1,
    "Still preserved at the Smithsonian, the logbook caption grins: \"Relay #70 Panel F (moth) in relay. First actual case of bug being found.\""),

  g("LEXICON", 1, "lex_k06_laser_light_amplification_acronym",
    "Used in lowercase today, \"laser\" debuted in 1959 as an acronym starting with \"Light Amplification by\" what process?",
    ["Solar Energy Reflection","Subatomic Electron Rays","Stimulated Emission","Synchronized Excitation"], 2,
    "Columbia researcher Gordon Gould jotted \"LASER\" in a 1957 notebook notarized at a neighborhood Bronx candy store—sparking a 30-year patent war!"),

  g("LEXICON", 1, "lex_k06_scuba_underwater_breathing_acronym",
    "Hiding an acronym in plain sight, dive gear \"scuba\" stands for \"Self-Contained Underwater Breathing\" what?",
    ["Tank Assembly","Valve Air-tank","Lung Actuator","Apparatus"], 3,
    "Twenty-year-old medical student Christian Lambertsen coined \"SCUBA\" during World War II for U.S. military frogmen rebreathers!"),

  g("LEXICON", 1, "lex_k06_zip_code_zone_improvement_plan",
    "Rolled out across U.S. mailbags in 1963 with cartoon mascot \"Mr. ZIP,\" what does \"ZIP\" in ZIP Code stand for?",
    ["Zone Improvement Plan","Zero Delay Mail Post","Zonal Index Parcel Code","Zippy Interstate Pathway"], 0,
    "Philadelphia postal clerk Robert Moon first proposed regional digit codes in 1944 as wartime mail volume doubled!"),

  gv("LEXICON", 1, "lex_k06_blockbuster_wwii_city_aerial_bomb",
    "Before \"Jaws\" smashed cinema records, a 1940s RAF four-ton bomb capable of leveling a city street coined what word?",
    ["BUNKER DOMES","BLOCKBUSTER","HARBOR PIERS","WAR BRIDGES"], 1,
    ["A-U-A","O-U-E","O-O-E","I-U-I"],
    "Variety critics borrowed the explosive wartime slang in the late 1940s for big-budget spectacles that smashed box-office records!"),

  gv("LEXICON", 1, "lex_k06_bucket_list_1999_screenplay_origin",
    "Surprise bar-bet: despite sounding ancient, what life-goals phrase did screenwriter Justin Zackham coin in 1999?",
    ["GOLDEN WISH","DREAM CHART","BUCKET LIST","FINAL ROSTER"], 2,
    ["U-U-I","I-E-I","U-E-I","U-E-U"],
    "Shortening \"Things to Do Before I Kick the Bucket\" to \"Justin’s Bucket List\" launched the 2007 Nicholson/Freeman hit!"),

  gv("LEXICON", 1, "lex_k06_soap_opera_detergent_radio_sponsors",
    "1930s daytime radio serials bankrolled by detergent giants like Procter & Gamble earned what lasting genre nickname?",
    ["SUDS SERIAL","WASH DRAMA","LATHER PLAY","SOAP OPERA"], 3,
    ["A-A-I-E-E","O-U-O-I-A","I-A-U-E-O","O-A-O-E-A"],
    "Listeners tuned in daily to \"Guiding Light\" between commercials for Procter & Gamble’s Oxydol and Ivory soap flakes!"),

  gv("LEXICON", 1, "lex_k06_movie_trailers_originally_played_after",
    "If movie previews play BEFORE the feature film starts, why on earth does Hollywood still call them what?",
    ["TRAILERS","FILM TEASERS","REEL PREVIEWS","SHOW OPENERS"], 0,
    ["A-I-E","A-A-E","O-I-E","A-I-O"],
    "In 1913 Broadway nickelodeons, upcoming serial promos genuinely trailed AFTER the final reel—until theater owners noticed patrons bolted for the exits!"),

  g("LEXICON", 1, "lex_k06_muppet_henson_marionette_puppet",
    "Jim Henson told reporters he coined \"Muppet\" in 1956 by blending \"puppet\" with which stringed theater cousin?",
    ["Mime troupe","Marionette","Masquerade","Music-hall"], 1,
    "Later in life Henson mischievously winked that he actually just liked the bouncy sound of \"Muppet\" and invented the \"marionette\" blend for reporters!"),

  g("LEXICON", 1, "lex_k06_sos_morse_rhythm_not_save_our_ship",
    "Myth alert: sailors adopted \"SOS\" in 1906 NOT for \"Save Our Ship,\" but strictly because its Morse signal had what?",
    ["Matched in seven alphabets","Honored inventor S.O.S.","Unmistakable Morse rhythm","Used lowest battery power"], 2,
    "Three dots, three dashes, three dots runs together as one unmistakable alarm even through howling ocean storm static!", {"isKlaxonMyth":true}),

  g("LEXICON", 1, "lex_k06_wd40_fortieth_rocket_formula",
    "Grab that blue-and-yellow garage can of \"WD-40\"—its lab name literally stands for \"Water Displacement\" and what?",
    ["40-degree freeze point","40-weight mineral oil","40-minute rust barrier","40th lab attempt"], 3,
    "San Diego chemist Norm Larsen failed 39 straight batches in 1953 before Formula #40 successfully kept condensation rust off Atlas rocket skins!"),

  g("LEXICON", 1, "lex_k06_velcro_french_velvet_and_hook",
    "Plucking burrs off his dog’s coat in the Alps, George de Mestral coined \"Velcro\" from two French words for what?",
    ["Velvet and hook","Vellum and cross","Velour and crown","Veneer and cloth"], 0,
    "French \"velours\" (velvet) + \"crochet\" (little hook)! Today Velcro’s own lawyers sing playful YouTube songs begging us to say \"hook and loop fastener.\""),

  g("LEXICON", 1, "lex_k06_teddy_bear_roosevelt_mississippi_hunt",
    "Brooklyn’s Michtoms stitched the first \"Teddy’s bear\" in 1902 after President Roosevelt refused to do what on a hunt?",
    ["Tax Christmas wooden toys","Shoot a roped black bear","Log Yellowstone forests","Cage a pet raccoon"], 1,
    "Guides clubbed and roped an exhausted bear to a willow tree for an easy presidential shot—TR disgustedly refused, winning every heart in America!"),

  g("LEXICON", 1, "lex_k06_bikini_pacific_atomic_atoll_1946",
    "Louis Réard named his daring 1946 two-piece swimsuit \"the bikini\" four days after headlines flashed from where?",
    ["Cannes Beach Film Premiere","Tahiti’s Royal Lagoon","Bikini Atoll’s atom test","Monte Carlo’s Yacht Club"], 2,
    "Advertising it as \"smaller than the world’s smallest bathing suit,\" Réard bet its cultural shockwave would rival the Pacific nuclear test!"),

  g("LEXICON", 1, "lex_k06_nerd_dr_seuss_if_i_ran_the_zoo",
    "Before labeling straight-A tech whizzes in 1950s slang, where did the printed word \"nerd\" make its 1950 debut?",
    ["MIT’s freshman handbook","Popular Mechanics ads","Isaac Asimov’s robot tales","A Dr. Seuss picture book"], 3,
    "In \"If I Ran the Zoo,\" young Gerald McGrew promises to collect \"a Ka-Troo, and a Nerd, and a Seersucker too\" from the land of Ka-Troo!"),

  g("LEXICON", 1, "lex_k06_cut_to_the_chase_silent_movies",
    "\"Cut to the chase!\" began as a 1920s Hollywood memo telling silent-film editors to trim dialogue and jump to what?",
    ["Climactic horse/car chases","Steeplechase betting booths","Foxhunting brass bugles","Vaudeville pie finales"], 0,
    "Whenever romantic parlor scenes dragged in test screenings, studio chiefs scribbled \"Cut to the chase!\" to wake audiences right back up."),

  gv("LEXICON", 1, "lex_k06_dashboard_horse_carriage_mud_shield",
    "Before holding speedometers, a sleigh’s front wooden panel blocked mud flung up by hooves—giving cars what word?",
    ["FOOTBOARD","SPLASHRAIL","DASHBOARD","BUCKBOARD"], 2,
    ["I-O-U","A-I-A","A-O-A","U-O-E"],
    "When horseless carriages swapped galloping horses for greasy front engines around 1900, that wooden mud-shield stayed right in front of the driver!"),

  g("LEXICON", 1, "lex_k06_mad_as_a_hatter_mercury_vapors",
    "\"Mad as a hatter\" echoed real 19th-century nerve tremors among milliners who steamed felt hats using toxic what?",
    ["Boiling green arsenic dye","Toxic mercury nitrate","Powdered white lead chalk","Heated turpentine fumes"], 1,
    "Steaming rabbit fur with orange-tinted mercury solution in unventilated workshops caused \"hatter’s shakes,\" shyness, and hallucinations."),

  g("LEXICON", 1, "lex_k06_turn_a_blind_eye_admiral_nelson",
    "Signaled to retreat at Copenhagen in 1801, which one-eyed hero clapped his spyglass to his blind eye and fought on?",
    ["Sir Francis Drake","Captain James Cook","Duke of Wellington","Horatio Nelson"], 3,
    "Winking to his flag captain—\"I have a right to be blind sometimes; I really do not see the signal!\"—Nelson won the battle and coined the idiom!"),

  g("LEXICON", 1, "lex_k06_orangutan_malay_person_of_forest",
    "Red-haired apes of Borneo take their name \"orangutan\" directly from two Malay words translating to what?",
    ["Person of the forest","Red cousin of the sun","Old keeper of the figs","Silent treetop elder"], 0,
    "Malay \"orang\" (person) + \"hutan\" (forest)—locals recognized their thoughtful eyes and tool-making intelligence centuries before European zoos!"),

  g("LEXICON", 1, "lex_k06_dandelion_french_lions_tooth",
    "Blow wish-seeds off a yellow \"dandelion\" and you are speaking Old French \"dent-de-lion\"—literally meaning what?",
    ["Bright crown of gold","Lion’s jagged tooth","Summer sun’s bright mane","Golden meadow lantern"], 1,
    "Skip the fluffy yellow puffball and inspect the green leaves underneath: those sharp, serrated edges look just like a row of lion’s teeth!"),

  g("LEXICON", 1, "lex_k06_canary_islands_named_for_dogs",
    "Canary birds took their name from the Canary Islands—yet ancient Romans named those islands \"Canaria\" after giant what?",
    ["Singing sea finches","Golden date palms","Fierce island dogs","Sulfur volcano cones"], 2,
    "Latin \"canis\" means dog (like \"canine\")! Pliny the Elder recorded gifts of huge mastiff-sized Canary dogs—the yellow songbirds came much later!", {"isKlaxonMyth":true}),

  gv("LEXICON", 1, "lex_k06_bankrupt_italian_broken_bench",
    "In Renaissance Italy, officials smashed an insolvent plaza moneychanger’s wooden table (\"banca rotta\")—giving us what?",
    ["BANKRUPT","FORECLOSED","DEFAULTED","CASHLESS"], 0,
    ["A-U","I-I","O-O","U-U"],
    "Italian \"banca rotta\" (\"broken bench\") advertised to every merchant in the square that this dealer was officially out of business!"),

  g("LEXICON", 1, "lex_k06_shampoo_hindi_scalp_massage",
    "Brought to Brighton bathhouses in 1762 from India, \"shampoo\" comes from Hindi \"champo\"—originally meaning what?",
    ["Whipped warm coconut foam","Head knead or massage","Fragrant river-herb rinse","Crushed sandalwood paste"], 1,
    "King George IV loved Mahomed’s therapeutic steam-and-massage treatments so much he appointed him official \"Shampooing Surgeon\"!"),

  g("LEXICON", 1, "lex_k06_three_sheets_to_the_wind_ropes",
    "Stagger \"three sheets to the wind\" and sailors grin—aboard a square-rigged ship, a \"sheet\" is actually a what?",
    ["Copper rudder pin","Lead depth weight","Corner control rope","Below-deck hammock"], 2,
    "If three corner \"sheet\" lines snap loose in a gale, the sails flap wildly and the vessel lurches across the waves like a tipsy sailor!"),

  g("LEXICON", 1, "lex_k06_quiet_quitting_2022_tiktok_work",
    "Trending since 2022, \"quiet quitting\" involves zero resignation letters—instead burned-out workers simply do what?",
    ["Switch to rival firms","Delete Slack on Fridays","Work from beach hotels","Skip unpaid extra hustle"], 3,
    "Fulfilling your exact job description between 9 and 5—without answering midnight emails for free—sparked a generational tug-of-war over hustle culture!"),

  g("LEXICON", 1, "lex_k06_brat_summer_2024_collins_word",
    "Painted lime-green across summer 2024 by pop star Charli XCX, which four-letter word won Collins Word of the Year?",
    ["Brat","Glow","Lush","Slay"], 0,
    "Flipping an old scolding label for unruly kids into confident, smudge-eyeliner honesty, \"brat\" even reshaped 2024 campaign billboards!"),

  g("LEXICON", 2, "lex_k06_vibe_coding_2025_collins_karpathy",
    "Crowned Collins’s 2025 Word of the Year after AI pioneer Andrej Karpathy tweeted it in February, what phrase means building apps purely by chatting in English?",
    ["Dream scripting","Vibe coding","Prompt weaving","Ghost compiling"], 1,
    "Karpathy joked about \"forgetting that the code even exists\"—accepting AI diffs by voice and pasting error messages straight back in!"),

  gv("LEXICON", 2, "lex_k06_parasocial_2025_cambridge_word",
    "Named Cambridge’s 2025 Word of the Year as fans treat livestreamers and pop stars like close personal friends, what 1956 sociology term means one-way intimacy?",
    ["PSEUDOBOND","PARASOCIAL","TELEFRIEND","HYPERLINKED"], 1,
    ["I-A-I-I-E","A-A-O-I-A","A-U-O-O-A","U-A-U-I-O"],
    "Sociologists Donald Horton and R. Richard Wohl coined it in 1956 watching early TV viewers talk back warmly to evening news anchors!"),

  g("LEXICON", 2, "lex_k06_meme_richard_dawkins_1976_gene",
    "Decades before grumpy cats or distracted boyfriends, evolutionary biologist Richard Dawkins coined \"meme\" in 1976’s \"The Selfish Gene\" to rhyme with \"gene\" from Greek for what?",
    ["Shared joke","Quick spark","Imitated thing","Sticky tune"], 2,
    "Trimming Greek \"mimema\" (\"that which is imitated\") down to one syllable gave Dawkins a cultural twin to biological DNA replication!"),

  g("LEXICON", 2, "lex_k06_truthiness_stephen_colbert_2005",
    "Coined minutes into the October 2005 premiere of \"The Colbert Report,\" what Word of the Year meant believing something from your gut regardless of facts?",
    ["Factoidism","Gut-checkery","Believitude","Truthiness"], 3,
    "Merriam-Webster named it 2006 Word of the Year—and the American Dialect Society later crowned \"truthiness\" Word of the entire 2000s decade!"),

  g("LEXICON", 2, "lex_k06_venmo_latin_vendere_plus_mobile",
    "Splitting dinner tabs since 2009, payment app \"Venmo\" fuses \"mobile\" with Latin \"vendere\"—meaning what?",
    ["To sell","To borrow","To split","To trust"], 0,
    "Founders Andrew Kortina and Iqram Magdon-Ismail liked that \"Venmo\" worked smoothly as a casual English verb: \"Just Venmo me five bucks!\""),

  g("LEXICON", 2, "lex_k06_hulu_mandarin_gourd_precious_things",
    "Streaming service \"Hulu\" sounds like playful nonsense in English, yet CEO Jason Kilar chose it from two Mandarin Chinese proverbs referencing a hollow what?",
    ["Bamboo flute","Bottle gourd","Jade lantern","Silk scroll"], 1,
    "In Mandarin folklore, a dried \"húlu\" gourd acts as a \"holder of precious things,\" while rhyming \"hùlù\" means \"interactive recording\"!"),

  gv("LEXICON", 2, "lex_k06_catfishing_cod_tank_documentary",
    "Popularized by Nev Schulman’s 2010 documentary about fake online romances, what aquatic verb comes from a yarn about keeping shipped North Atlantic cod agile?",
    ["BAITCASTING","NETTING","CATFISHING","TRAWLING"], 2,
    ["A-A-I","O-I-I","A-I-I","A-I-U"],
    "In the film’s closing parable, packing one nippy catfish inside cod vats supposedly kept sluggish cod moving all the way to market!"),

  g("LEXICON", 2, "lex_k06_phishing_spelled_ph_phone_phreaks",
    "Why do cybersecurity teams spell fake password-stealing emails \"phishing\" with a \"ph\" instead of a plain fisherman’s \"f\"?",
    ["Greek root phobos (fear)","IBM trademarked \"fishing\"","Philadelphia lab origin","Homage to 70s phone phreaks"], 3,
    "1970s \"phone phreaks\" blew 2600-Hz whistles into payphones for free calls—passing playful \"ph-\" spelling to 1996 scammers!"),

  g("LEXICON", 2, "lex_k06_captcha_alan_turing_acronym_2003",
    "Squinting at crosswalk photos proves you’re human via a \"CAPTCHA\"—coined at Carnegie Mellon in 2003 as an acronym tipping its hat to which pioneer?",
    ["Codebreaker Alan Turing","Logician George Boole","Countess Ada Lovelace","Bell star Claude Shannon"], 0,
    "\"Completely Automated Public Turing test to tell Computers and Humans Apart\"—ironically flipping Turing’s 1950 test because here a computer judges YOU!"),

  g("LEXICON", 2, "lex_k06_hodl_2013_bitcoin_forum_typo",
    "Before traders invented \"Hold On for Dear Life,\" how was crypto rallying cry \"HODL\" actually born in 2013?",
    ["Korean exchange ticker","Whiskey-fueled forum typo","Satoshi’s genesis hash","Swiss vault serial code"], 1,
    "Typing \"I AM HODLING\" at 10 a.m. after whiskey, BitcoinTalk user GameKyuubi admitted he spotted his typo in the subject line and refused to fix it!"),

  g("LEXICON", 2, "lex_k06_qr_code_japanese_go_board_1994",
    "Invented in 1994 by Denso Wave engineer Masahiro Hara to scan auto parts ten times faster than barcodes, \"QR\" stands for \"Quick Response\" and was inspired by what?",
    ["Crossword newspaper grids","Silk kimono tartan looms","Stones on a Go board","Shinkansen punch tickets"], 2,
    "Playing Go on his lunch break, Hara realized crisp black-and-white corner finder squares let cameras read matrix grids upside-down at any angle!"),

  gv("LEXICON", 2, "lex_k06_skeuomorph_floppy_save_icon",
    "Your smartphone still plays a mechanical shutter click and uses a 1980s floppy disk for \"Save\"—designers call an ornamental carryover from old hardware a what?",
    ["PALIMPSEST","RETROGLYPH","TECHNORELIC","SKEUOMORPH"], 3,
    ["O-U-I-O","E-O-O-U","A-U-U-O","E-U-O-O"],
    "From Greek \"skeuos\" (vessel/tool) + \"morphe\" (form): ancient Greek stone temples even carved fake wooden beam-ends copied from earlier timber huts!"),

  g("LEXICON", 2, "lex_k06_taser_tom_swift_electric_rifle",
    "Shocking etymology! NASA physicist Jack Cover coined \"TASER\" in 1970 as an acronym honoring which boyhood sci-fi adventure hero?",
    ["Tom Swift’s Electric Rifle","Flash Gordon’s Stun Ray","Buck Rogers’s Arc Lance","Doc Savage’s Bolt Gun"], 0,
    "\"Thomas A. Swift’s Electric Rifle\" paid tribute to Victor Appleton’s 1911 juvenile novel—Cover added the middle initial \"A\" just so \"TSER\" had a vowel!"),

  g("LEXICON", 2, "lex_k06_haagen_dazs_bronx_fake_danish",
    "Stroll past a \"Häagen-Dazs\" scoop shop and guess its homeland—founder Reuben Mattus actually invented that totally meaningless name in 1960 where?",
    ["Copenhagen’s harbor","The Bronx, New York","Brussels’s waffle row","Zurich’s dairy valley"], 1,
    "Bronx ice-cream maker Reuben Mattus wanted a classy Danish aura—even though real Danish doesn’t use an umlaut \"ä\"!"),

  g("LEXICON", 2, "lex_k06_tetris_greek_four_plus_tennis",
    "Moscow programmer Alexey Pajitnov named his addictive 1984 falling-block puzzle \"Tetris\" by fusing his favorite sport, tennis, with Greek \"tetra-\" for what?",
    ["Four speed levels","Four screen walls","Four squares per piece","Four studio coders"], 2,
    "Every single falling \"tetromino\" shape—I, O, T, S, Z, J, and L—is built out of exactly four connected unit squares!"),

  g("LEXICON", 2, "lex_k06_adidas_puma_feuding_cobbler_brothers",
    "German cobbler Adolf \"Adi\" Dassler stitched his nickname and surname into \"Adidas\" in 1949 right after his brother Rudolf stormed across the river to found what?",
    ["Reebok","Fila","Diadora","Puma"], 3,
    "Bavarian town Herzogenaurach split in half for decades—\"the town of bent necks,\" where locals checked strangers’ shoes before speaking to them!"),

  g("LEXICON", 2, "lex_k06_ikea_ingvar_kamprad_farm_village",
    "Seventeen-year-old Swedish farmboy Ingvar Kamprad registered \"IKEA\" in 1943—after his own initials \"I.K.\", what do the final letters \"E\" and \"A\" stand for?",
    ["His boyhood farm & village","Economy & Assembly","European Pine & Ash","Everyday Home Art"], 0,
    "Elmtaryd (his family’s Småland farm) and Agunnaryd (his home parish)—he started out peddling matches, pens, and nylon stockings by mail!"),

  g("LEXICON", 2, "lex_k06_haribo_hans_riegel_bonn_gummy",
    "Gummy-bear giant \"HARIBO\" stitches together founder Hans Riegel’s first four letters and which German hometown?",
    ["Bochum","Bonn","Bremen","Bamberg"], 1,
    "HAns RIegel BOnn started with a sack of sugar and a copper kettle in a backyard laundry kitchen—inventing \"Dancing Bears\" two years later!"),

  g("LEXICON", 2, "lex_k06_sony_latin_sonus_plus_sonny_boy",
    "Rebranding Tokyo Tsushin Kogyo for global transistor-radio buyers in 1955, Akio Morita blended Latin \"sonus\" (sound) with 1950s American slang for what?",
    ["Sunny California skies","Sunday jazz broadcasts","Bright young \"sonny boys\"","Supersonic jet engines"], 2,
    "Postwar Tokyo youth loved GI slang \"sonny\"—Morita dropped one \"n\" because \"sonny\" sounded like \"losing money\" in Japanese!"),

  g("LEXICON", 2, "lex_k06_atari_japanese_go_board_check",
    "Video-game pioneer Nolan Bushnell skipped English words for his 1972 arcade giant—picking \"Atari\" from a polite warning in the Japanese board game Go akin to what?",
    ["Shuffle the deck","Roll double sixes","Crown my king","Check in chess"], 3,
    "Calling \"Atari!\" tells your opponent their stones have one liberty left and are about to be surrounded and swept off the board!"),

  gv("LEXICON", 2, "lex_k06_interrobang_1962_question_exclamation",
    "Tired of ad headlines cluttering \"?!\", Madison Avenue executive Martin K. Speckter invented the single merged \"‽\" mark in 1962—christening it the what?",
    ["INTERROBANG","SHOCKMARK","QUERYSCREAM","DOUBLESPIKE"], 0,
    ["I-E-O-A","I-U-O-A","A-E-O-A","I-E-O-I"],
    "Latin \"interrogatio\" (question) + printers’ slang \"bang\" (exclamation point)! Remington even added an interrobang key to late-1960s typewriters!"),

  g("LEXICON", 2, "lex_k06_retronym_acoustic_guitar_snail_mail",
    "Nobody called a guitar \"acoustic\" before electric pickups arrived, or mail \"snail mail\" before email—NPR chief Frank Mankiewicz coined what word for such retro-labels?",
    ["Backronym","Retronym","Chrononym","Contronym"], 1,
    "Mankiewicz noticed the pattern in 1980 after hearing Ringo Starr mention \"natural turf\" baseball fields and reading \"hardcover book\"!"),

  g("LEXICON", 2, "lex_k06_at_sign_italian_snail_dutch_monkey",
    "Rescued from dusty accounting keyboards in 1971 by email inventor Ray Tomlinson, the `@` symbol is charmingly called a \"little snail\" in Italian and what in Dutch?",
    ["Curled pretzel","Sleeping cat","Monkey’s tail","Cinnamon roll"], 2,
    "Dutch speakers say \"apestaartje\" (little monkey tail), Germans say \"spider monkey,\" and Danes call `@` an elephant’s trunk (\"snabel-a\")!"),

  g("LEXICON", 2, "lex_k06_blue_chip_1923_high_stakes_poker",
    "Wall Street’s safest corporate titans are called \"blue-chip stocks\" because Dow Jones reporter Oliver Gingold spotted $25 blue tokens used where in 1923?",
    ["Tiffany’s silver vaults","Belmont’s turf club","Cunard’s first-class deck","High-stakes poker tables"], 3,
    "Traditional 19th-century poker sets valued white chips at $1, red at $5, and stately blue chips highest of all at $25!"),

  gv("LEXICON", 2, "lex_k06_gerrymander_salamander_map_1812",
    "When 1812 Massachusetts Governor Elbridge Gerry signed off on a coiled partisan election district, a Boston cartoonist added claws and wings—birthing what word?",
    ["FILIBUSTER","GERRYMANDER","MUGWUMPING","PORKBARREL"], 1,
    ["E-O-E","E-A-E","U-A-E","E-A-O"],
    "Poor Governor Gerry actually pronounced his surname with a hard G (like \"Gary\")—and privately called the twisted salamander map \"highly disagreeable\"!"),

  gv("LEXICON", 2, "lex_k06_spoonerism_blushing_crow_oxford",
    "Absent-minded Oxford Warden William Spooner lent his surname to swapping initial word sounds—reportedly toasting Queen Victoria as \"our queer old dean\" in a what?",
    ["MALAPROPISM","MONDEGREEN","SPOONERISM","TAUTOLOGY"], 2,
    ["A-O-A-I","O-I-E-O","O-O-E-I","I-O-I-I"],
    "Generations of mischievous Oxford undergrads invented extra gems for him, like scolding a truant: \"You have tasted two whole worms!\""),

  gv("LEXICON", 2, "lex_k06_juggernaut_puri_temple_chariot",
    "Witnessing devotees pull a 45-foot, 16-wheeled wooden temple chariot of Lord Jagannath through Puri inspired British writers to coin which unstoppable noun?",
    ["BEHEMOTH","COLOSSUS","LEVIATHAN","JUGGERNAUT"], 3,
    ["U-U-A-U","I-E-A-U","U-E-A-E","U-E-A-U"],
    "Sanskrit \"Jagannātha\" means \"Lord of the Universe\"—three giant wooden carts are still rebuilt fresh from sacred neem timber every summer!"),

  gv("LEXICON", 2, "lex_k06_portmanteau_humpty_dumpty_suitcase",
    "Explaining \"slithy\" (lithe + slimy) to Alice, Humpty Dumpty named blended words like \"brunch\" and \"smog\" after a leather two-sided French suitcase—a what?",
    ["VALISEWORD","TRUNKBLEND","DUFFELNOUN","PORTMANTEAU"], 3,
    ["A-A-A-A-A","O-U-E-E-U","I-A-I-A-I","O-A-E-A-U"],
    "\"You see it’s like a portmanteau—there are two meanings packed up into one word!\" Lewis Carroll single-handedly gave modern linguistics the term."),

  g("LEXICON", 2, "lex_k06_posh_port_out_starboard_home_myth",
    "Klaxon alert! Tour guides love claiming \"posh\" came from \"Port Out, Starboard Home\" stamped on shaded P&O steamship tickets to India—what did historians find?",
    ["Zero such tickets existed","Only cargo crates bore it","Royal Navy subs used it","Zeppelins stamped it first"], 0,
    "Historians combed P&O archives without finding a single \"P.O.S.H.\" stamp—it likely stems from slang \"posh\" (dandy/halfpenny)!", {"isKlaxonMyth":true}),

  g("LEXICON", 2, "lex_k06_golf_not_gentlemen_only_acronym",
    "Chain-email myth alert! \"GOLF\" does NOT stand for \"Gentlemen Only, Ladies Forbidden\"—linguistic records trace it to medieval Scots and Dutch words for what?",
    ["Windy coastal dunes","Wooden club or bat","Sheep-grazed pasture","Pebble-filled cup"], 1,
    "Mary, Queen of Scots famously played St Andrews links in 1567! Acronym-style word coinages barely existed anywhere in English before the 20th century.", {"isKlaxonMyth":true}),

  g("LEXICON", 2, "lex_k06_focus_latin_fireplace_hearth_kepler",
    "Astronomer Johannes Kepler repurposed the everyday Latin noun \"focus\" in 1604 for where a lens concentrates light rays—in Roman homes, a \"focus\" was literally what?",
    ["The brass keyhole","The sunny courtyard","The family fireplace","The roof skylight"], 2,
    "Because a magnifying glass gathers sunbeams into one scorching \"burning point,\" Kepler playfully called that spot the lens’s hearth (\"focus\")!"),

  g("LEXICON", 2, "lex_k06_arena_latin_sand_gladiator_blood",
    "Modern fans pack a basketball or concert \"arena\" without realizing Latin \"harena\" named the absorbent material raked across Roman colosseum floors—namely what?",
    ["Crushed marble chalk","Cedar sawdust","Volcanic ash","Fine ground sand"], 3,
    "Smooth stone paving turned treacherously slick during gladiator bouts, so attendants spread fresh sand (\"harena\") between matches!"),

  g("LEXICON", 2, "lex_k06_rival_sharing_same_irrigation_brook",
    "Look inside \"river\" and \"rival\" and you spot the exact same Latin root \"rivus\"—originally, two \"rivals\" were simply neighbors who shared what?",
    ["One irrigation stream","A party-wall chimney","Two boundary olive trees","A ferryman’s rope"], 0,
    "Upstream farmers diverting water during dry Roman summers sparked so many lawsuits that \"rivales\" (\"stream-sharers\") came to mean fierce competitors!"),

  g("LEXICON", 2, "lex_k06_calculate_latin_pebble_abacus",
    "Dentists scrape \"calculus\" off teeth while students sweat \"calculus\" exams—both trace straight to Latin \"calculus,\" meaning a small limestone what?",
    ["Chalk slate","Counting pebble","Sundial gnomon","Wax stylus"], 1,
    "Roman merchants did arithmetic by sliding smooth pebbles (\"calculi\") along grooved counting boards—the exact same root for kidney stones!"),

  gv("LEXICON", 2, "lex_k06_nostalgia_1688_swiss_homesick_pain",
    "Coined in 1688 as a potentially fatal medical diagnosis for Swiss mercenaries weeping at Alpine cowbell tunes abroad, Greek \"homecoming + pain\" yielded what?",
    ["MELANCHOLIA","NOSTALGIA","WANDERLUST","SOLASTALGIA"], 1,
    ["O-O-I-A","O-A-I-A","E-A-I-A","O-A-I-I"],
    "Johannes Hofer joined Homeric \"nostos\" (homecoming) + \"algos\" (pain)—officers even banned whistling Alpine cowbell tunes!"),

  g("LEXICON", 2, "lex_k06_influenza_medieval_star_influence",
    "Why do English speakers still catch Italian \"influenza\" every winter? Fifteenth-century Florentine physicians blamed sudden citywide fevers on the occult \"influence\" of what?",
    ["Swamp marsh mists","Foreign spice ships","Cold stars and planets","Unrung cathedral bells"], 2,
    "Doctors wrote \"influenza di freddo\" or \"influenza delle stelle\"—assuming aligned winter planets rained invisible sickness over whole cities at once!"),

  g("LEXICON", 2, "lex_k06_steal_someones_thunder_1709_macbeth",
    "Furious playwright John Dennis shouted \"They steal my thunder!\" in a 1709 London theater after flopping with his own play yet hearing rivals copy his what?",
    ["Trapdoor ghost smoke","Fiery cannon salute","Rhyming witches’ chant","Stage thunder effect"], 3,
    "Drury Lane canceled Dennis’s tragedy after nights—then shamelessly rattled his newly invented trough-of-cannonballs thunder machine during \"Macbeth\"!"),

  g("LEXICON", 2, "lex_k06_laconic_spartan_single_word_if",
    "Philip of Macedon warned Sparta’s Laconia, \"If I invade, I will destroy you forever\"—what laconic word did Sparta send back?",
    ["\"If.\"","\"Try.\"","\"Come.\"","\"When?\""], 0,
    "Neither Philip II nor his son Alexander the Great ever bothered marching down into Laconia after receiving that icy two-letter dispatch!"),

  g("LEXICON", 2, "lex_k06_stoic_athens_painted_porch_zeno",
    "Keep a calm upper lip and folks call you \"stoic\"—surprisingly named NOT after philosopher Zeno himself, but the public Athenian colonnade where he lectured: a painted what?",
    ["Marble fountain","Market porch (stoa)","Olive hillside","Potters’ kiln"], 1,
    "Shipwrecked merchant Zeno couldn’t rent private halls, so rich and poor alike gathered on Athens’s Painted Porch (\"Stoa\")!"),

  g("LEXICON", 2, "lex_k06_jacuzzi_toddler_arthritis_pump",
    "Long before champagne ski-chalet hot tubs, seven Italian-American aviation brothers invented the portable \"Jacuzzi\" pump in 1956 California to soothe what?",
    ["Astronaut muscle cramps","Racehorse tendon sprains","A toddler’s arthritis","Deep-sea diver bends"], 2,
    "Candido Jacuzzi adapted his farm water-pump engineering so 15-month-old son Kenny could receive comforting hydrotherapy right in the family bathtub!"),

  g("LEXICON", 2, "lex_k06_tuxedo_1886_new_york_country_club",
    "Why do Americans call a black-tie dinner jacket a \"tuxedo\" while Britons say \"dinner jacket\"? Tobacco heir Griswold Lorillard wore a tailless coat in 1886 to where?",
    ["Saratoga’s spring casino","Newport’s yacht regatta","Waldorf’s grand ballroom","Tuxedo Park’s autumn ball"], 3,
    "Shocking elders in Orange County, New York by chopping the swallowtails off his formal dress coat, young Lorillard started a sensation within weeks!"),

  g("LEXICON", 2, "lex_k06_tycoon_japanese_shogun_lincoln",
    "Wall Street \"tycoons\" owe their title to Commodore Perry’s 1854 Japan treaty—where officials styled the Tokugawa Shogun \"taikun\" (\"great lord\") before whose aides adopted it?",
    ["Abraham Lincoln’s staff","Cornelius Vanderbilt’s crew","Andrew Carnegie’s clerks","Queen Victoria’s envoys"], 0,
    "White House secretaries John Hay and John Nicolay affectionately nicknamed boss Abraham Lincoln \"the Tycoon\" in their daily Civil War diaries!"),

  g("LEXICON", 2, "lex_k06_rule_of_thumb_carpenter_inch_myth",
    "Bust a stubborn modern myth! \"Rule of thumb\" did NOT come from an alleged old English law about stick thickness—17th-century records tie it cleanly to whom?",
    ["Archers stringing longbows","Carpenters & brewers","Falconers perching hawks","Tailors pinning cuffs"], 1,
    "Carpenters measured rough inches with a thumb joint and brewers tested mash heat—no stick statute ever existed in English law!", {"isKlaxonMyth":true}),

  g("LEXICON", 3, "lex_k06_dunce_john_duns_scotus_philosopher",
    "Being called a \"dunce\" in a pointed cap ironically insults followers of 13th-century Franciscan genius John Duns Scotus—who argued smart kids learned faster wearing what?",
    ["Braided rosemary wreaths","Saffron-dyed sleeves","Cone-shaped wizard hats","Copper forehead bands"], 2,
    "Scotus thought conical caps funneled wisdom downward—later Renaissance critics mocked stubborn \"Duns men\" into \"dunces\"!"),

  g("LEXICON", 3, "lex_k06_pecuniary_latin_pecus_cattle_wealth",
    "Financial penalties are called \"pecuniary\" from Latin \"pecunia\" (money)—trace \"pecunia\" one step deeper into pastoral Rome and wealth was literally counted in what?",
    ["Salt loaves","Barley sacks","Bronze spearheads","Heads of cattle"], 3,
    "Latin \"pecus\" means livestock or cattle—the exact same root hiding inside \"peculiar,\" which originally meant your private herd of cows!"),

  g("LEXICON", 3, "lex_k06_cynic_diogenes_greek_dog_like",
    "Before meaning a jaded skeptic, ancient Athenians hurled \"Cynic\" (\"kynikos\") at tub-dwelling philosopher Diogenes of Sinope—translating literally to what?",
    ["Shameless street dog","Bitter unripe olive","Cracked clay lantern","Ragged winter crow"], 0,
    "Delighted by the insult, Diogenes grinned that unlike polite flatterers, he wagged his tail at honest friends and barked at greedy frauds!"),

  g("LEXICON", 3, "lex_k06_pandemonium_john_milton_hell_capital",
    "When a toddler birthday party erupts into \"pandemonium,\" thank blind poet John Milton—who coined the word in 1667’s \"Paradise Lost\" as the literal name for what?",
    ["Babel’s shattered tower","The capital palace of Hell","Poseidon’s whirlpool","Chaos’s outer abyss"], 1,
    "Stitched from Greek \"pan-\" (all) + \"daimonion\" (little demon), \"Pandaemonium\" rises out of molten gold as Satan’s parliamentary hall!"),

  g("LEXICON", 3, "lex_k06_serendipity_three_princes_of_serendip",
    "Horace Walpole coined \"serendipity\" in a 1754 letter after reading a delightful Persian fairy tale about three observant princes from \"Serendip\"—today’s island of what?",
    ["Madagascar","Zanzibar","Sri Lanka","Sumatra"], 2,
    "Without ever seeing a lost camel, the princes deduce it is blind in one eye and missing a tooth purely from half-chewed grass along one side of the road!"),

  g("LEXICON", 3, "lex_k06_utopia_thomas_more_no_place_pun",
    "Sir Thomas More titled his 1516 island treatise \"Utopia\" as a sly double Greek pun—sounding identical in English to \"eu-topos\" (\"good place\") while spelling what?",
    ["Faraway horizon","Golden orchard","Philosopher’s harbor","No place at all"], 3,
    "Greek \"ou\" (not) + \"topos\" (place)! More winked to fellow Renaissance scholars that a 100% perfect human society literally exists nowhere on Earth."),

  g("LEXICON", 3, "lex_k06_tilde_medieval_scribes_tiny_letter_n",
    "That wavy tilde (`~`) floating atop Spanish \"mañana\" began in medieval monasteries to save pricey parchment—scribes drew a miniature version of which omitted letter?",
    ["A stacked second N","A silent trailing S","An aspirated H","A palatalized L"], 0,
    "Writing Latin \"annus\" (year) as \"ãnus\" with a tiny N hovering overhead saved thousands of pen strokes—evolving straight into Spanish \"año\"!"),

  g("LEXICON", 3, "lex_k06_chancellor_cancel_roman_lattice_bars",
    "Prime ministers (\"chancellors\") and calling off plans (\"canceling\") shockingly share the same Roman courtroom root \"cancelli\"—meaning crossed wooden what?",
    ["Gavel mallets","Latticework bars","Tally sticks","Seal stamps"], 1,
    "A \"cancellarius\" guarded the latticework screen separating judges from crowds; drawing criss-cross lattice lines over bad ink text \"canceled\" it!"),

  g("LEXICON", 3, "lex_k06_aptronym_usain_bolt_wordsworth",
    "Sprinter Usain Bolt and poet William Wordsworth delight linguists as real-world examples of what naming quirk?",
    ["Heteronym","Metonymy","Aptronym","spooner-twin"], 2,
    "Coined by columnist Franklin P. Adams by rearranging \"patronym\" so the first three letters spelled \"apt,\" an aptronym fits your career like a glove!"),

  g("LEXICON", 3, "lex_k06_slapstick_italian_hinged_clapper",
    "Physical pie-in-the-face comedy owes its name \"slapstick\" to 16th-century Italian commedia dell’arte clown Arlecchino swinging a two-piece wooden paddle built to do what?",
    ["Launch rubber turnips","Vault over footlights","Tickle sleepy patrons","Crack loud without bruising"], 3,
    "Two thin slats smacked together with an ear-splitting WHACK! on the gentlest tap—letting stage comics whack rivals safely all night long!"),

  g("LEXICON", 3, "lex_k06_blackmail_scottish_highland_cattle_rent",
    "Before meaning hush-money extortion, 1500s Scottish border farmers paid \"blackmail\" (\"mail\" = rent) to Highland clan raiders—why was that tribute called \"black\"?",
    ["Paid in iron pots & cattle","Collected on moonless nights","Sealed with pitch wax","Signed by outlawed priests"], 0,
    "Honest landlords took \"white mail\" (shiny silver coins, \"white money\"), whereas extortionate border protection tribute took dark cattle, grain, or iron!"),

  g("LEXICON", 3, "lex_k06_white_elephant_sacred_siam_monarch",
    "Why do holiday gift swaps call a pricey, impractical present a \"white elephant\"? According to diplomatic lore from old Siam (Thailand), kings gifted rare pale elephants to whom?",
    ["Visiting Portuguese captains","Courtiers who annoyed them","Retired palace astrologers","Rival Burmese generals"], 1,
    "Sacred pale elephants couldn’t do farm work yet ate mountains of fruit daily—politely bankrupting any annoying courtier!"),

  g("LEXICON", 3, "lex_k06_beyond_the_pale_wooden_fence_stakes",
    "Behave outrageously and polite company calls it \"beyond the pale\"—\"pale\" here has zero tie to pale skin; it comes from Latin \"palus,\" meaning a pointed what?",
    ["Limestone milestone","Watchtower torch","Wooden fence stake","Harbor buoy"], 2,
    "Same root as \"palisade\" and \"impale\"! Stepping outside the fenced English \"Pale\" around medieval Dublin meant leaving royal law behind."),

  g("LEXICON", 3, "lex_k06_pull_out_all_the_stops_pipe_organ",
    "Go all-out with \"pulling out all the stops\" and you are sitting not in a steam locomotive or racecar, but at the console of a grand cathedral what?",
    ["Bell carillon","Harpsichord","Timpani rack","Pipe organ"], 3,
    "Pushing knobs IN blocks wind from pipe ranks—yanking every drawknob OUT unleashes the full roar of every pipe at once!"),

  g("LEXICON", 3, "lex_k06_nintendo_1889_kyoto_leave_luck_heaven",
    "Founded in 1889 Kyoto painting floral \"hanafuda\" playing cards by hand, Fusajiro Yamauchi’s company name \"Nintendo\" uses three kanji commonly translated as what?",
    ["Leave luck to heaven","Joy inside small boxes","Seven stars rising east","Playful plum garden"], 0,
    "Nin (entrust/duty) + ten (heaven) + dō (temple/hall)—a fitting motto for a card workshop that survived a century to birth Mario and Zelda!"),

  g("LEXICON", 3, "lex_k06_slop_2024_ai_spam_18th_century_swill",
    "Revived across the internet in 2024–2025 to roast low-effort mass AI text and six-fingered images, four-letter \"slop\" originally entered English from muddy puddles and what?",
    ["Spoiled whale blubber","Watery kitchen pig swill","Cracked tallow candles","Sawdust tavern sweepings"], 1,
    "Just as \"spam\" mapped canned meat onto unwanted 1990s email floods, \"slop\" became the 2020s shorthand for uncurated synthetic filler!"),

];
