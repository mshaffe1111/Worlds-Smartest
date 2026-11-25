// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Prime-Time Gold Pack K-10 (`scripts/seed_data/packs/pack_k_10_fallacies_odds.mjs`)
// 216 All-Era (Ancient thru 2026) Game-Night Gems: FALLACIES (108) + ODDS (108)
//   - ~40% Modern/Current (2000s-2026), ~35% 1960s-1990s, ~25% History/Bar-Bets
//   - >= 36 QI-style `isKlaxonMyth: true` myth-busters & Mandela Effects
//   - +26 tactile `numeric` Vernier/Throttle showcase payloads
//   - Exact [25%, 25%, 25%, 25%] A/B/C/D rotation & zero corpus collisions
// ============================================================================

function g(category, difficulty, canonicalEntityKey, stem, choices, answerIdx, ahaFactoid, extra = {}) {
  const baseToys = [
    'TOY_01_KNIFE_SWITCH',
    'TOY_02_CONFIDENCE_PNEUMATIC',
    'TOY_06_FUSE_WIRE_SNIPPER',
  ];
  if (extra.numeric) {
    baseToys.push('TOY_03_VERNIER_DIAL');
    if (extra.numeric.target >= 0 && extra.numeric.target <= 100 && extra.numeric.max <= 120) {
      baseToys.push('TOY_10_CLIFFHANGERS_THROTTLE');
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
    supportedToys: baseToys,
    ...extra,
  };
}

export const CLUES = [
  // ======================== 1. FALLACIES (108: 49 D1, 43 D2, 16 D3) ========================

  // --- FALLACIES D1 (49 clues) ---
  g('FALLACIES', 1, 'febreze_single_e_spelling_mandela_myth',
    'Laundry-aisle Mandela check: shoppers swear P&G’s fabric spray is spelled "Febreeze"—how is the real bottle spelled?',
    ['Febreze (one E)', 'Fabreeze (with A)', 'Febreaze (with EA)', 'Phabreze (with PH)'], 0,
    'Blending "fabric" + "breeze," Procter & Gamble dropped the extra E in 1996—yet millions still hallucinate a double E!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'pikachu_tail_tip_no_black_stripe_mandela',
    'Sketch Pikachu from memory and fans color his tail tip black—where is that dark brown patch actually located?',
    ['Behind both red cheeks', 'Right at the tail base', 'Along both yellow ears', 'Nowhere—he is all yellow'], 1,
    'Pikachu’s ear tips are black, tricking millions of brains into pasting a phantom black stripe onto his yellow tail tip!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'curious_george_zero_tail_monkey_myth',
    'Picture Curious George swinging through jungle trees—what detail shocks grown readers opening the original books?',
    ['He wears green corduroy', 'His hat is bright cobalt', 'He has no tail at all', 'He lives inside London Zoo'], 2,
    'H.A. and Margret Rey drew George tailless like a chimpanzee even while calling him a curious little monkey!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'the_dress_2015_viral_blue_and_black',
    'Splitting the internet in February 2015, that viral party dress looked white-and-gold to millions—what was its real color?',
    ['Lavender and bronze lace', 'Cream silk and navy trim', 'Silver satin and espresso', 'Royal blue and jet black'], 3,
    'Brains assuming warm indoor shadow subtracted yellow light, flipping dark blue-and-black fabric into white-and-gold!'),

  g('FALLACIES', 1, 'yanny_vs_laurel_2018_viral_audio_clip',
    'In 2018’s viral Vocabulary.com audio illusion, high-frequency ears heard "Yanny"—what word had the speaker actually read?',
    ['Laurel', 'Yarrow', 'Corals', 'Morals'], 0,
    'Broadway singer Jay Aubrey Jones recorded "Laurel"; tinny phone speakers boosted upper overtones that sounded like "Yanny"!'),

  g('FALLACIES', 1, 'star_wars_vader_no_i_am_your_father',
    'Klaxon alert! Fans rasp "Luke, I am your father," yet what exact five-word line did Darth Vader speak in 1980?',
    ['Son, I am your father!', 'No, I am your father', 'Know I am your father!', 'Yes, I am your father!'], 1,
    'Answering Luke’s "He told me you killed him!", James Earl Jones delivered cinema’s most misquoted five-word twist.',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'snow_white_magic_mirror_not_mirror_mirror',
    'Fans quote 1937’s "Snow White" chanting "Mirror, mirror on the wall"—what opening words did Disney’s Queen actually use?',
    ['Silver mirror, tell it all', 'Darkest mirror in the hall', 'Magic mirror on the wall', 'Royal mirror, hear my call'], 2,
    'Grimm translations often used "Mirror, mirror," whereas Walt Disney’s Evil Queen always summoned her "Magic mirror"!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'kit_kat_wrapper_no_hyphen_mandela',
    'Candy-aisle Mandela check: fans draw a hyphen in "Kit-Kat"—what sits between "Kit" and "Kat" on real wrappers?',
    ['A tiny golden wafer star', 'A slanted red slash mark', 'A raised chocolate dot', 'Just a clean open space'], 3,
    'Nestlé and Hershey’s logos spell "Kit Kat" with zero hyphen—proof our brains love tidying up familiar logos!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'passing_second_place_in_race_riddle',
    'Buzzer riddle! Sprint down a marathon homestretch and pass the runner in SECOND place—what place are you in now?',
    ['Second place', 'First place overall', 'Third place behind', 'Tied for the lead'], 0,
    'Taking second place away from #2 leaves the first-place leader still striding ahead of you!'),

  g('FALLACIES', 1, 'thirty_divided_by_half_plus_ten_riddle',
    'Mental-math speed trap: divide 30 by ONE-HALF—do not multiply by half!—and add 10. What total lights up?',
    ['25', '70', '40', '16'], 1,
    'Thirty contains sixty halves (30 ÷ 0.5 = 60); tack on 10 for 70 while hasty buzzers blurt out 25!',
    { numeric: { target: 70, min: 10, max: 100, step: 5, unit: 'total' } }),

  g('FALLACIES', 1, 'three_pills_every_thirty_minutes_riddle',
    'A doctor gives you 3 pills to take one every 30 minutes—taking pill #1 now, how many minutes until pill #3?',
    ['90 minutes', '45 minutes', '60 minutes', '120 minutes'], 2,
    'Pill #1 at minute 0, pill #2 at minute 30, and pill #3 at minute 60—two intervals, not three!',
    { numeric: { target: 60, min: 15, max: 120, step: 15, unit: 'minutes' } }),

  g('FALLACIES', 1, 'electric_train_smoke_direction_riddle',
    'An electric bullet train speeds north at 110 mph into a 30-mph north headwind—which way does its smoke blow?',
    ['Straight due southwards', 'Southwest at 45 degrees', 'Straight up into clouds', 'Zero smoke on electric'], 3,
    'Oldest trick on the rails: overhead electric trains have no smokestack and puff zero smoke in any wind!'),

  g('FALLACIES', 1, 'daddy_longlegs_venom_mythbusters_bite',
    'Campfire lore claims cellar spiders ("daddy longlegs") hide Earth’s deadliest venom—what did "MythBusters" prove?',
    ['Mild tingle, weak venom', 'Fangs cannot pierce skin', 'Deadlier than king cobras', 'Zero venom glands exist'], 0,
    'Adam Savage let one bite his arm on camera: its tiny fangs pierced skin fine and delivered barely a two-second itch!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'dogs_see_blue_and_yellow_color_myth',
    'Ditch the myth that dogs see in black-and-white TV—canine eyes pack two color-cone types tuned to which hues?',
    ['Bright reds and greens', 'Blues and warm yellows', 'Purples and deep oranges', 'Sepia browns and pinks'], 1,
    'A bright red ball blends brownish-gray into green grass for Fido, while a royal-blue tennis ball pops brilliantly!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'bulls_charge_cape_motion_not_red_myth',
    'Cattle are red-green colorblind! In "MythBusters" bullring tests with red, blue, and white capes, what sparked charges?',
    ['Scent of tanned leather', 'Bright sunlight flashes', 'Whippy cape movement', 'Scraping boots in sand'], 2,
    'Matadors use crimson "muleta" capes late in bouts mainly to mask bloodstains for the crowd—the bull only hates the waving!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'msg_chinese_restaurant_letter_parmesan',
    'Menus boasted "NO MSG" after a 1968 letter—while diners happily ate rich natural glutamate inside tomatoes and what?',
    ['Mild cottage curds', 'Fresh mozzarella balls', 'Creamy French goat brie', 'Aged Parmesan cheese'], 3,
    'Blind clinical trials failed to trigger headaches without suggestion—and Parmigiano-Reggiano packs massive natural glutamate!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'five_second_rule_dropped_food_myth',
    'Shouting "Five-second rule!" over dropped snacks flunks Rutgers lab tests—how fast do wet bacteria hop onto dropped food?',
    ['Under one second', 'After six full seconds', 'Once food cools down', 'After ten full seconds'], 0,
    'Watermelon picked up bacteria almost instantaneously on contact—moisture, not your stopwatch, rules transfer speed!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'apple_rice_bag_wet_iphone_warning_2024',
    'In 2024 Apple officially warned owners NOT to put wet iPhones in uncooked rice—why does the rice bag backfire?',
    ['Rice heats lithium cells', 'Starch dust clogs ports', 'Salt etches camera glass', 'Grains block Wi-Fi resets'], 1,
    'Airflow beside a fan dries connectors faster than rice without wedging swollen starch paste inside your USB-C port!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'closing_phone_apps_drains_battery_myth',
    'Apple and Android engineers beg users NOT to swipe up to force-quit paused apps—why does app-killing waste battery?',
    ['Screens overheat phone RAM', 'Icons redraw at full power', 'Cold reloads burn CPU', 'Modems ping distant towers'], 2,
    'Paused background apps sit frozen in low-power RAM using zero CPU—force-quitting makes your chip rebuild them from scratch!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'cracking_knuckles_arthritis_ig_nobel',
    'Dr. Donald Unger cracked ONLY his left knuckles daily for 60 years—winning an Ig Nobel after proving it caused what?',
    ['Stiffer morning thumb joints', 'Slightly wider wrist bones', 'Weaker tennis racket grip', 'Zero arthritis difference'], 3,
    'Popping collapses tiny gas bubbles in joint fluid—earning Unger a 2009 Ig Nobel Prize and a grin toward Mom!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'shaving_hair_blunt_tip_illusion_myth',
    'Teens swear shaving makes stubble grow back thicker and darker—what actually makes freshly shaved hair feel coarser?',
    ['Blunt tips lack taper', 'Razors wake extra roots', 'Cool air hardens keratin', 'Soap swells hair shafts'], 0,
    'Unshaven hair wears down to a soft tapered point; slicing mid-shaft leaves a flat stump without changing root thickness one bit!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'swallowed_gum_passes_in_days_myth',
    'Playground lore claims swallowed bubble gum stays in your stomach for seven years—how does it actually leave?',
    ['Dissolves in lemon acid', 'Passes out in days', 'Melts during hot showers', 'Absorbs into bloodstream'], 1,
    'Stomach enzymes cannot digest rubbery gum base, yet normal gut contractions escort it right out alongside corn kernels!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'bus_driver_eye_color_you_riddle',
    'Listen closely! YOU drive a city bus: 9 board at First, 3 exit at Elm, 5 board at Oak—what color are the driver’s eyes?',
    ['Dark hazel brown', 'Pale slate blue', 'Your own eye color', 'Impossible to know'], 2,
    'Nine out of ten players scramble to add and subtract passengers, forgetting word #3: YOU are driving the bus!'),

  g('FALLACIES', 1, 'one_story_pink_house_stairs_riddle',
    'Inside a sunny ONE-STORY ranch house, the rug, toaster, and curtains are all bright pink—what color are the stairs?',
    ['Bright bubblegum pink', 'Unpainted golden oak', 'Checkered white marble', 'Zero stairs in one story'], 3,
    'A single-story bungalow has no upstairs flight to paint pink or any other Living Color!'),

  g('FALLACIES', 1, 'bury_survivors_border_crash_riddle',
    'A small plane clips a ridge directly on the U.S.–Canada border—in which country do rescue crews bury the SURVIVORS?',
    ['Never bury survivors', 'Split evenly fifty-fifty', 'Country of ticket sale', 'Where the tailcone lands'], 0,
    'Survivors much prefer a warm blanket and hot cocoa over a shovel on either side of the border!'),

  g('FALLACIES', 1, 'two_coins_thirty_cents_not_a_nickel',
    'Two U.S. coins in my hand total 30 cents, and ONE of them is not a nickel! Which two coins am I holding?',
    ['Three flat silver dimes', 'Quarter and a nickel', 'Two rare 15-cent pieces', 'Half-dollar minus twenty'], 1,
    'Only ONE coin is not a nickel (the 25-cent quarter)—the other coin happily is a 5-cent nickel!'),

  g('FALLACIES', 1, 'shepherd_seventeen_sheep_all_but_nine',
    'A rancher counts 17 sheep in his pen; a storm blows the gate open and ALL BUT 9 bolt—how many sheep remain?',
    ['8 sheep', '17 sheep', '9 sheep', '12 sheep'], 2,
    'Subtracting 17 - 9 = 8 is the reflex trap—"all but 9" tells you directly that 9 sheep stayed put!',
    { numeric: { target: 9, min: 1, max: 20, step: 1, unit: 'sheep' } }),

  g('FALLACIES', 1, 'johnny_mother_three_kids_april_may',
    'Catch word #1: Johnny’s mother had three kids—she named the eldest April, the middle May, and the youngest what?',
    ['June', 'Julie', 'August', 'Johnny'], 3,
    'Pattern-completion shouts "June!" before your brain loops back to remember it was JOHNNY’s mother all along!'),

  g('FALLACIES', 1, 'doomscrolling_evolutionary_negativity_bias',
    'Why do bleak 2 AM headlines glue thumbs to screens twice as hard as good news? Psychologists blame stone-age what?',
    ['Negativity bias', 'Optimism blindness', 'Novelty euphoria', 'Recency daydreams'], 0,
    'Ancestors who ignored rustling bushes got eaten while ignoring a pretty flower cost nothing—wiring brains to lock onto threats!'),

  g('FALLACIES', 1, 'zoom_fatigue_self_view_mirror_stanford_2021',
    'Stanford’s 2021 "Zoom Fatigue" study traced exhausting video calls largely to hours spent staring at what unnatural sight?',
    ['Tiny red muted mic icons', 'Your own live mirror face', 'Blurred bedroom bookshelves', 'Lagging mouse slide arrows'], 1,
    'In real life nobody follows you around holding a pocket mirror 18 inches from your nose while you speak in meetings!'),

  g('FALLACIES', 1, 'organ_donor_opt_out_default_nudge_2003',
    'Why did Austria hit 99% organ-donor signup while neighboring Germany sat at 12%? Behavioral economists pointed to what?',
    ['Generous tax-refund checks', 'Mandatory driver-exam quiz', 'Opt-out form defaults', 'Free city hospital parking'], 2,
    'Dan Ariely and Richard Thaler showed people rarely tick boxes either way—"check to opt out" flips national rates overnight!'),

  g('FALLACIES', 1, 'sugar_hyperactivity_double_blind_myth',
    'Tell parents kids drank sugary soda—when it was actually diet—and parents STILL rate kids wilder! What do blind trials show?',
    ['Sugar spikes sprints 40%', 'Only red dye drives zoomies', 'Cocoa calms noisy toddlers', 'Zero sugar hyper spike'], 3,
    'Birthday excitement, games, and parental expectation create the chaos—double-blind trials cleared sucrose repeatedly!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'bats_not_blind_all_species_see_myth',
    'Retire "blind as a bat" for good: alongside sonar, how many of Earth’s ~1,400 bat species possess working eyes?',
    ['All of them can see', 'Roughly half are sightless', 'Only fruit bats have eyes', 'Under ten cave species'], 0,
    'Large fruit bats ("flying foxes") don’t even echolocate—they spot ripe figs at dusk with night vision sharper than ours!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'lightning_strikes_empire_state_25_times',
    'Forget "lightning never strikes twice"—roughly how many times per year do bolts hit Manhattan’s Empire State Building?',
    ['Once every leap year', 'About 25 times', 'Three times a decade', 'Over 400 times weekly'], 1,
    'Tall steel spires act as skyward lightning rods—Manhattan’s icon once took eight separate strikes inside 24 minutes!',
    { isKlaxonMyth: true, numeric: { target: 25, min: 1, max: 100, step: 1, unit: 'strikes' } }),

  g('FALLACIES', 1, 'frankenstein_nameless_creature_shelley',
    'Pedant klaxon! Victor Frankenstein is the scientist in Mary Shelley’s 1818 novel—what name did he give his creation?',
    ['Young Master Adam', 'Hunchbacked Igor', 'No name at all', 'Lord Prometheus'], 2,
    'Shelley’s text calls him only "creature," "fiend," "wretch," or "monster"—and zero hunchbacked Igor appears in her book either!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'cubic_feet_of_dirt_in_empty_hole_riddle',
    'Dig a neat garden pit 3 feet long, 3 feet wide, and 3 feet deep—how many cubic feet of dirt sit IN that hole?',
    ['27 cubic feet', '9 cubic feet total', '18 cubic feet', '0 cubic feet'], 3,
    'Multiply 3 × 3 × 3 = 27 if you want the pile BESIDE your boots—inside a freshly dug hole sits nothing but air!'),

  g('FALLACIES', 1, 'dark_cabin_light_the_match_first_riddle',
    'Freezing in a dark cabin with ONE matchstick beside a stove, oil lamp, and wax candle, what do you light first?',
    ['The matchstick', 'The tall wax candle', 'The glass oil lamp', 'Dry birch kindling'], 0,
    'Good luck lighting wicks or kindling in the dark before striking your lone matchstick!'),

  g('FALLACIES', 1, 'two_fathers_two_sons_three_tickets_riddle',
    'Two fathers and two sons enter a cinema, each person buys a ticket, yet the usher tears only THREE stubs—how?',
    ['One twin hid under coats', 'Grandpa, father, and son', 'Matinee two-for-one pass', 'The usher was one father'], 1,
    'Three generations in a line: Dad sits in the middle counting simultaneously as Grandpa’s son and Junior’s father!'),

  g('FALLACIES', 1, 'incognito_mode_local_history_myth_2024',
    'Google settled a 2024 suit after users thought Chrome’s "Incognito" hat hid traffic from Wi-Fi bosses—what does it skip?',
    ['Encrypting bank logins', 'Hiding IP from websites', 'Saving local history', 'Blocking cellular towers'], 2,
    'Your ISP, office router, and visited sites still see requests—Incognito mainly keeps searches off your own laptop’s history!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'pareidolia_faces_in_clouds_and_toast',
    'Spotting a grumpy face in car headlights, shapes in clouds, or Elvis on burnt toast comes from what brain reflex?',
    ['Synesthesia color cross', 'Aphantasia mind blanking', 'Prosopagnosia face blur', 'Pareidolia'], 3,
    'Evolution tuned human fusiform cortexes so hair-trigger sensitive to eyes-and-mouth triangles that outlets and grilles smile back!'),

  g('FALLACIES', 1, 'appeal_to_nature_poison_ivy_fallacy',
    'Assuming an herb is safe purely because its bottle shouts "ALL-NATURAL"—forgetting arsenic is natural—is what fallacy?',
    ['Appeal to nature', 'Genetic dismissal', 'Middle-ground bias', 'False equivalence'], 0,
    'Botany packs Earth’s deadliest toxins (hemlock, ricin, nightshade) alongside blueberries—"natural" never automatically equals gentle!'),

  g('FALLACIES', 1, 'loaded_question_stopped_cheating_trap',
    'Asking a rival, "Have you finally stopped peeking at other players’ buzzers?" traps both Yes and No inside what ploy?',
    ['Circular definition', 'A loaded question', 'Hasty generalization', 'Appeal to flattery'], 1,
    'Smuggling an unproven accusation inside the question forces wise witnesses to reject the premise before answering Yes or No!'),

  g('FALLACIES', 1, 'loss_aversion_twenty_dollar_pain_twice',
    'Dropping a $20 bill stings roughly TWICE as hard as finding $20 on the sidewalk feels good—Kahneman called this what?',
    ['Hyperbolic discounting', 'Mental accounting split', 'Loss aversion', 'Status-quo paralysis'], 2,
    'Prospect Theory proved losses loom ~2x larger than equal gains—explaining why investors cling desperately to sinking stocks!'),

  g('FALLACIES', 1, 'parasocial_relationship_podcast_streamer',
    'Feeling like your favorite podcaster or Twitch streamer is a personal pal—though you’ve never met—is called what?',
    ['Mutual mirror bonding', 'Shared crowd contagion', 'Ambient social osmosis', 'Parasocial bond'], 3,
    'Coined for 1950s TV anchors in 1956, daily earbuds and livestreams supercharged one-way intimacy into the 2020s!'),

  g('FALLACIES', 1, 'toads_bumps_zero_human_warts_myth',
    'Pick up a bumpy garden toad and nobody catches warts! What actually causes human warts while toad bumps deter raccoons?',
    ['Human papillomavirus', 'Damp garden moss spores', 'Pinched skin capillaries', 'Alkaline puddle mud'], 0,
    'Toad "warts" are normal parotoid poison glands built for hungry predators—human warts come strictly from human viruses!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'swimming_after_eating_cramps_myth',
    'Generations waited 30 minutes on pool towels after eating lunch—what do Red Cross reviews say about casual post-meal swims?',
    ['Wait forty-five minutes', 'Safe without waiting', 'Sip warm saltwater first', 'Swim backstroke only'], 1,
    'Plenty of blood serves both digestion and recreational splashing—elite marathon swimmers even snack mid-race!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'baby_bird_human_scent_touch_myth',
    'Spot a fallen robin chick and folks yell "Don’t touch it—Mom will smell human scent!" Why do ornithologists laugh?',
    ['Chicks wash feathers hourly', 'Rain rinses human oils off', 'Songbirds barely smell', 'Fathers guard fallen nests'], 2,
    'Songbirds hunt by sight and hearing with tiny olfactory bulbs—gently lifting a healthy nestling back into its nest saves lives!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'silence_of_lambs_good_morning_mandela',
    'Fans imitate Hannibal Lecter hissing "Hello, Clarice"—what two words did Anthony Hopkins actually greet her with in 1991?',
    ['Step closer, kid', 'Welcome, Starling', 'Sit down, Agent', 'Good morning'], 3,
    'Hopkins politely says "Good morning" on their first meeting, sealing another A-list movie Mandela Effect!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 1, 'earth_closest_to_sun_january_myth',
    'Sunbathers guess July sizzles because Earth orbits closer to the Sun—in which month is Earth actually closest to the Sun?',
    ['Early January', 'Late tropical June', 'Humid mid-August', 'Sunny late April'], 0,
    'Seasons come from Earth’s 23.5° axial tilt, not distance—Earth sweeps 3 million miles closer to the Sun during Northern winter!',
    { isKlaxonMyth: true }),

  // --- FALLACIES D2 (43 clues) ---
  g('FALLACIES', 2, 'sinbad_shazaam_nonexistent_90s_vhs_mandela',
    '90s kids swear comedian Sinbad starred in a genie VHS called "Shazaam"—fusing memories with what real 1996 Shaq genie flick?',
    ['Steel', 'Kazaam', 'Aladdin', 'Flubber'], 1,
    'Sinbad hosted a 1994 Sinbad-the-Sailor afternoon movie marathon in baggy pants, which memory fused with Shaq’s 1996 "Kazaam"!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'jaws_youre_gonna_need_bigger_boat_mandela',
    'Movie fans quote 1975’s "Jaws" as "WE’RE gonna need a bigger boat"—what opening word did Roy Scheider actually ad-lib?',
    ['They’re gonna need one', 'Quint’s gonna need one', 'You’re gonna need one', 'She’s gonna need one'], 2,
    'Backing away from the surging great white, Chief Brody tells stingy boat-owner Quint: "You’re gonna need a bigger boat!"',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'chatgpt_mata_v_avianca_hallucinated_cases_2023',
    'Two attorneys were sanctioned $5,000 in a 2023 Manhattan court after citing six bogus airline lawsuits invented by what?',
    ['Outdated microfilm reels', 'Rival paralegal pranks', 'Corrupted Westlaw caches', 'ChatGPT hallucinations'], 3,
    'Predicting plausible-sounding legal prose word-by-word, the chatbot cheerfully fabricated case names, quotes, and docket numbers!'),

  g('FALLACIES', 2, 'stradivarius_2014_paris_blind_goggles_test',
    'Soloists wore dark welder goggles in a 2014 Paris blind test pitting $10M Stradivarius violins against new ones—picking what?',
    ['New violins won most', 'Every pro nailed Strads', 'Strings snapped in dark', 'Old varnish smelled sweet'], 0,
    'Stripped of priceless Italian label prestige (Halo Effect!), virtuosos preferred modern makers’ projection over 300-year-old Strads!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'pepsi_challenge_single_sip_new_coke_trap',
    'Sweeter Pepsi beat Coke in 1980s blind mall sips—sparking the 1985 New Coke flop because 1-ounce taste cups missed what?',
    ['Crushed ice melt rates', 'Drinking a whole can', 'Glass bottle fizz psi', 'Salty movie-popcorn salt'], 1,
    'Malcolm Gladwell highlighted the research flaw in "Blink": extra sugar wins a 1-sip sprint yet cloys across a full 12-ounce can!'),

  g('FALLACIES', 2, 'endowment_effect_thaler_cornell_coffee_mugs',
    'Hand half a class a $6 Cornell mug and owners immediately demand $7+ while non-owners offer $3—naming Richard Thaler’s what?',
    ['Scarcity markup premium', 'Sunk-trophy attachment', 'Endowment effect', 'Winner’s curse spread'], 2,
    'Merely touching and owning an object for two minutes wires Loss Aversion in, doubling its subjective price tag!'),

  g('FALLACIES', 2, 'peak_end_rule_kahneman_ice_water_memory',
    'Volunteers preferred 90s in icy water over 60s IF the final 30s warmed slightly—proving memory judges experiences by what?',
    ['Total elapsed clock time', 'Opening five-second shock', 'Average minute comfort', 'Peak plus final ending'], 3,
    'Theme parks and concert encores live by Kahneman’s Peak-End Rule: nail one showstopper moment and a triumphant finale!'),

  g('FALLACIES', 2, 'availability_heuristic_letter_k_first_vs_third',
    'Folks guess more words start with K than have K THIRD because "king" pops to mind faster than "ask"—illustrating what?',
    ['Availability heuristic', 'Phonetic priming drift', 'Alphabetical anchoring', 'Clustering coincidence'], 0,
    'Words with K third ("ask, make, like, bake") outnumber K-starters roughly 2-to-1, yet our mental dictionary indexes by first letters!'),

  g('FALLACIES', 2, 'fundamental_attribution_error_traffic_excuse',
    'Run a yellow light and YOU had an emergency; watch a stranger do it and THEY are a selfish maniac! Lee Ross named this what?',
    ['Self-serving spotlighting', 'Attribution error', 'Just-world rationalizing', 'In-group halo shielding'], 1,
    'Coined as the Fundamental Attribution Error in 1977, we excuse our own slip-ups via bad luck while blaming others’ character.'),

  g('FALLACIES', 2, 'pratfall_effect_aronson_1966_spilled_coffee',
    'In Elliot Aronson’s 1966 study, an ace quiz whiz grew MORE likable right after spilling coffee on his suit—dubbed what?',
    ['Underdog sympathy bonus', 'Slapstick relief reflex', 'Pratfall effect', 'Humblebrag warmth shift'], 2,
    'Crucial catch: clumsy coffee spills charmed audiences ONLY when the contestant had already proven brilliant—mediocre spillers dropped!'),

  g('FALLACIES', 2, 'groupthink_irving_janis_1972_cabinet_harmony',
    'Yale psychologist Irving Janis coined what 1972 word explaining why smart teams stay silent about obvious flaws for harmony?',
    ['Echo-chamber consensus', 'Collective tunnel vision', 'Polite committee freeze', 'Groupthink'], 3,
    'Studying Bay of Pigs memos, Janis urged leaders to appoint an official "Devil’s Advocate" in every big strategy meeting!'),

  g('FALLACIES', 2, 'ten_thousand_steps_1965_japanese_pedometer_ad',
    'Smartwatches cheer at 10,000 daily steps—a round goal born NOT in medical labs, but in a 1965 ad campaign for what gadget?',
    ['Tokyo pocket pedometer', 'Olympic marathon shoes', 'Bullet-train turnstiles', 'Army paratrooper insoles'], 0,
    'Yamasa named its 1965 meter "Manpo-kei" ("10,000-steps meter") because Japanese character 万 ("10,000") looked like a walker!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'twenty_one_days_habit_myth_66_days_ucl',
    'Influencers claim habits lock in after 21 days—yet UCL’s real habit study clocked automaticity averaging how many days?',
    ['14 full days', '66 days', '100 full days', '36 full days'], 1,
    'Surgeon Maxwell Maltz merely noted patients took *at least* 21 days adjusting to nose jobs—pop books turned minimum into law!',
    { isKlaxonMyth: true, numeric: { target: 66, min: 10, max: 120, step: 2, unit: 'days' } }),

  g('FALLACIES', 2, 'eight_glasses_water_1945_solid_food_clause',
    'Folks quote the 1945 tip to drink ~64 oz of water daily—missing its next sentence noting most daily water arrives in what?',
    ['Cool morning humid air', 'Chewed peppermint gum', 'Everyday solid food', 'Metabolic muscle burn'], 2,
    'Soup, oranges, cucumbers, pasta, and coffee count heavily—healthy kidneys already own an exquisite thirst alarm!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'blue_light_glasses_2023_cochrane_eye_strain',
    'A 2023 Cochrane review found "blue-light" glasses barely budged screen eye strain, which comes mainly from forgetting what?',
    ['Dimming overhead lamps', 'Tilting screens 30 degrees', 'Switching fonts to serif', 'Blinking and resting eyes'], 3,
    'Staring at spreadsheets slashes human blink rates by ~60%—follow the free 20-20-20 rule (look 20 feet away every 20 minutes)!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'lemmings_cliff_jump_1958_disney_turntable_myth',
    'Wild lemmings NEVER leap off cliffs in mass suicide! Why did viewers see them plunge in Disney’s 1958 "White Wilderness"?',
    ['Crew pushed them off', 'Eagles chased tame packs', 'Snowmelt flooded burrows', 'Mirrors tricked the herd'], 0,
    'Shot in landlocked Alberta far from Arctic seas, camera crews spun bought lemmings off snow turntables above the Bow River!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'chimborazo_farthest_from_earth_center_myth',
    'Everest tops sea level, yet Earth’s equatorial bulge pushes which peak’s summit 1.3 miles FARTHER from Earth’s core?',
    ['Tanzania’s Kilimanjaro', 'Ecuador’s Chimborazo', 'Alaska’s Mount Denali', 'Papua’s Puncak Jaya'], 1,
    'Because spinning Earth bulges 13 miles wider at the Equator, Chimborazo’s peak sits closest to the stars of any spot on Earth!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'einstein_never_flunked_math_swiss_grade_flip',
    'Einstein laughed at a 1935 "Ripley’s" claim that he failed school math—he aced calculus at 15! What confused biographers?',
    ['A cousin shared his name', 'Ink smudged his report card', 'Swiss grades flipped 1 & 6', 'Fire burned Munich ledgers'], 2,
    'Aargau’s school switched grading so "6" became top marks instead of "1," making earlier "1"s look like flunks to later writers!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'ed_mcmahon_never_worked_publishers_clearing',
    'Millions picture Ed McMahon holding giant Publishers Clearing House checks—which rival sweepstakes did Ed actually pitch?',
    ['Reader’s Digest Prizes', 'Sweepstakes of America', 'Columbia House Patrol', 'American Family Sweepstakes'], 3,
    'PCH invented the Prize Patrol van, while McMahon’s smiling face graced American Family Publishers envelopes—fusing in memory!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'risky_business_tom_cruise_zero_sunglasses',
    'Copycats recreate Tom Cruise’s 1983 "Risky Business" sock slide in dark Ray-Bans—what eyewear did he wear in that scene?',
    ['Zero sunglasses', 'Clear horn-rim frames', 'Silver aviator mirrors', 'Flip-up sports shades'], 0,
    'Cruise wore Ray-Bans on the movie POSTER, so millions mentally pasted them onto his barefaced Bob Seger living-room dance!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'star_trek_beam_me_up_scotty_never_verbatim',
    'Across 79 episodes and six movies, Captain Kirk said "Scotty, beam us up," yet NEVER spoke what exact four-word quote?',
    ['Make it so, Mr. Scott', 'Beam me up, Scotty', 'Energize now, Mr. Scott', 'Lock phasers, Mr. Scott'], 1,
    'Like "Play it again, Sam," fans distilled dozens of close transporter commands into a punchier four-word pop-culture quote!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'berenstain_bears_spelled_with_a_mandela',
    'Sparking online Mandela Effect debates, grown readers swore their childhood bear books ended in "-stein" instead of what?',
    ['Berenstine', 'Berenstane', 'Berenstain', 'Baronstein'], 2,
    'Creators Stan and Jan Berenstain always spelled their own family name with an A—even 1980s knockoff VHS labels occasionally typoed it!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'looney_tunes_spelled_tunes_warner_music',
    'Animation Mandela check: why did Warner Bros. spell Bugs Bunny’s banner "Looney TUNES" instead of "Toons" back in 1930?',
    ['Dodged Disney’s Toon mark', 'Typist misread pen script', 'Ink blurred double O’s', 'Plugged song catalogs'], 3,
    'Paired with "Merrie Melodies" to showcase Warner’s newly bought sheet-music library, both titles riffed on "Silly Symphonies"!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'marie_antoinette_let_them_eat_cake_rousseau',
    'Rousseau wrote the "let them eat brioche" tale around 1765—when future queen Marie Antoinette was a 9-year-old living where?',
    ['Palaces in Vienna', 'Royal court in Madrid', 'Gardens at Versailles', 'Convents in Florence'], 0,
    'Anti-royalist pamphleteers pinned a century-old stock folktale onto Marie Antoinette decades later—zero record links her to it!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'salem_1692_hanging_zero_burned_at_stake',
    'Tourists ask where Salem burned witches at the stake in 1692—how did colonial Massachusetts actually execute the 19 victims?',
    ['Drowned in Salem Harbor', 'Hanged at Proctor’s Ledge', 'Banished into winter snow', 'Walled inside sea towers'], 1,
    'Continental Europe burned accused witches, whereas English law classified witchcraft as a felony punished by hanging!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'paul_revere_the_regulars_are_coming_out',
    'Riding past Crown patrols among colonists who still considered themselves British in 1775, Paul Revere warned who were coming?',
    ['King George’s Dragoons', 'The Scarlet Lobsterbacks', 'The Regulars', 'General Gage’s Hessians'], 2,
    'Eyewitness accounts record Revere warning Lexington households that "The Regulars are coming out!"—Longfellow romanticized the rest.',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'flat_earth_columbus_myth_salamanca_size',
    'Educated 1492 Europeans knew Earth was round! Why did Salamanca scholars actually warn against funding Columbus’s voyage?',
    ['Compass needles spun west', 'Sea monsters Ringed Azores', 'Trade winds blew one way', 'He shrank Earth’s girth'], 3,
    'Salamanca’s geographers trusted Eratosthenes’s 25,000-mile globe—had the Americas not blocked Columbus, his ships would have starved!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'nero_fiddled_rome_violin_invented_1500s',
    'Two facts sink "Nero fiddled while Rome burned" in 64 CE: Nero was away at Antium, and bowed violins arrived how much later?',
    ['About 15 centuries later', 'Four hundred years later', 'During Charlemagne’s rule', 'Right after First Crusade'], 0,
    'Bowed Renaissance violins emerged in 16th-century northern Italy—even if Nero sang, he would have plucked an ancient cithara lyre!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'cathedral_glass_crown_spinning_not_liquid',
    'Guides claim medieval cathedral glass is thicker at the bottom because glass "flows downward"—what really made panes uneven?',
    ['Lead frames squeezed glass', 'Hand-spun glass varied', 'Acid rain etched the tops', 'Frost heaved lower sills'], 1,
    'Ancient Roman glass goblets stay paper-thin after 2,000 years—medieval glaziers simply mounted heavier edges downward!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'hair_and_nails_shrink_skin_after_death_myth',
    'Spooky tales claim hair and fingernails keep growing after death—since dead cells stop dividing, what causes that illusion?',
    ['Keratin absorbs damp air', 'Gravity stretches cuticles', 'Drying skin pulls back', 'Minerals coat nail tips'], 2,
    'Dehydrating skin pulls back around hair shafts and nail cuticles like a shrinking sleeve, exposing a millimeter more keratin!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'left_brain_right_brain_2013_utah_mri_myth',
    'Pop quizzes sort folks into "math left-brainers" vs "artsy right-brainers"—what did Utah’s 2013 scan of 1,011 brains find?',
    ['Left rules after age 30', 'Artists use 80% right side', 'Lefties flip brain sides', 'Neither side dominates'], 3,
    'Specific tasks lateralize (like speech centers), yet creative art and hard math both light up dense cross-hemisphere teamwork!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'peter_principle_rise_to_incompetence_1969',
    'Promote an ace rep into management until they stall—illustrating Laurence Peter’s 1969 law that workers rise to what?',
    ['Level of incompetence', 'Median executive salary', 'Peak committee headcount', 'Maximum weekly meetings'], 0,
    'Because promotions reward mastery of your CURRENT job rather than the skills of the NEXT rung, stars keep climbing until stuck!'),

  g('FALLACIES', 2, 'abilene_paradox_nobody_wanted_to_go_1974',
    'Four relatives sweat through a 104°F drive to a bad diner—learning later NOBODY wanted to go and each agreed politely! Name it:',
    ['Texas Courtesy Escalator', 'The Abilene paradox', 'Groupthink dinner spiral', 'Polite Prisoner’s Loop'], 1,
    'Professor Jerry Harvey coined the Abilene Paradox in 1974 for meetings that unanimously approve plans every member privately hates!'),

  g('FALLACIES', 2, 'foot_in_the_door_tiny_decal_giant_sign',
    'Accepting a tiny 3-inch "Drive Safely" window decal made 1966 homeowners 4x likelier weeks later to allow a huge lawn sign via what?',
    ['Reciprocity guilt anchor', 'Bait-and-switch leverage', 'Foot-in-the-door ploy', 'Scarcity deadline nudge'], 2,
    'Freedman and Fraser (1966) showed saying Yes to a painless micro-favor subtly shifts self-image into "I’m a civic-minded helper"!'),

  g('FALLACIES', 2, 'door_in_the_face_cialdini_zoo_trip_1975',
    'Ask students to volunteer TWO YEARS ("No!"), then ask for a 2-hour zoo chaperone shift—tripling Yeses via Cialdini’s what?',
    ['Lowball invoice creep', 'Reverse psychology dare', 'Sunk-apology concession', 'Door-in-the-face move'], 3,
    'Robert Cialdini showed retreating from a huge request makes the smaller follow-up feel like a mutual compromise you ought to match!'),

  g('FALLACIES', 2, 'roach_motel_ux_dark_pattern_cancel_trap',
    'UX designer Harry Brignull dubbed a "Dark Pattern" where app signup takes 1 tap yet canceling requires phone mazes what?',
    ['A Roach Motel', 'Velvet Lobster Basket', 'Endless Revolving Door', 'Sticky Flypaper Funnel'], 0,
    'Borrowing Black Flag’s slogan ("Roaches check in, but they don’t check out!"), FTC regulators targeted click-to-cancel traps in 2024!'),

  g('FALLACIES', 2, 'uncanny_valley_mori_almost_human_creepiness',
    'Masahiro Mori charted warmth rising as robots look lifelike—until "95% human" CGI eyes trigger sudden revulsion called what?',
    ['Synthetic mirror recoil', 'The Uncanny Valley', 'Automaton blink shudder', 'Doppelganger dread dip'], 1,
    'From 2004’s "Polar Express" to 2019’s "Cats," tiny mismatches in almost-human faces trip pathogen alarm bells in our brains!'),

  g('FALLACIES', 2, 'fencepost_error_ten_gaps_eleven_posts',
    'Build a straight 100-foot fence spacing posts every 10 feet and rookies buy 10 posts instead of 11—tripping over what trap?',
    ['Modulo remainder drift', 'Rounding floor blunder', 'Fencepost error', 'Boundary zero paradox'], 2,
    'Coders call it an "off-by-one error": reading pages 10 through 20 of a novel isn’t 10 pages tonight—it’s 11!'),

  g('FALLACIES', 2, 'marshmallow_test_2018_affluence_replication',
    'Stanford’s Marshmallow Test linked 15-minute waiting to life success—until a 900-kid replication traced most of the gap to what?',
    ['Older sibling birth rank', 'Preschool nap schedules', 'Sweet vs salty cravings', 'Family financial stability'], 3,
    'Kids from steady, well-stocked homes knew promised second treats reliably arrived; kids used to broken promises rationally ate #1 fast!'),

  g('FALLACIES', 2, 'subliminal_popcorn_vicary_1957_hoax',
    'Adman James Vicary spooked 1957 moviegoers claiming hidden cinema flashes spiked popcorn sales 58%—what did he confess in 1962?',
    ['He faked the numbers', 'Ushers gave free salt cups', 'Projector bulbs misfired', 'Kids read slow-mo frames'], 0,
    'Scrambling to save his struggling marketing consultancy, Vicary invented a PR stunt that still fuels conspiracy thrillers decades later!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 2, 'london_tube_holborn_stand_both_sides_paradox',
    'Commuters bark "Walk left, stand right!"—yet London’s tall Holborn escalators moved 30% MORE riders per minute by ordering what?',
    ['Sprinting two steps per', 'Standing on both sides', 'Leaving empty buffer gaps', 'Reversing middle stairs'], 1,
    'Walking riders demand 3 empty steps of personal space; standing two-abreast packs long escalators far denser when nobody walks!'),

  g('FALLACIES', 2, 'false_consensus_eat_at_joes_sign_1977',
    'Students who wore an "EAT AT JOE’S" sandwich board assumed 62% of peers would too, while refusers guessed most wouldn’t—called what?',
    ['Pluralistic ignorance', 'Projection echo chamber', 'False consensus effect', 'Herd mirror assumption'], 2,
    'Whether pineapple pizza or hot takes online, we chronically overestimate how much the silent majority shares our own choices!'),

  g('FALLACIES', 2, 'mere_exposure_zajonc_familiarity_liking',
    'Hate a quirky pop hook Monday, hum it Wednesday, love it Friday—Robert Zajonc proved sheer repetition breeds fondness via what?',
    ['Sunk listening loyalty', 'Acoustic Stockholm shift', 'Echoic primacy anchoring', 'Mere-exposure effect'], 3,
    'Even reversed mirror-photos of your own face look "better" to YOU than true photos simply because bathroom mirrors made that flip familiar!'),

  // --- FALLACIES D3 (16 clues) ---
  g('FALLACIES', 3, 'mandela_effect_coined_fiona_broome_2009_year',
    'Fiona Broome coined "Mandela Effect" in 2009 after strangers swore Nelson Mandela died in prison—what year did he pass away?',
    ['2013', '1999', '2004', '2018'], 0,
    'Mandela walked free in 1990, served as South Africa’s President (1994–99), and lived to age 95 in December 2013!',
    { numeric: { target: 2013, min: 1990, max: 2025, step: 1, unit: 'year' } }),

  g('FALLACIES', 3, 'reversal_test_bostrom_status_quo_bias_2006',
    'To expose kneejerk status-quo bias when people oppose extending human lifespan, philosopher Nick Bostrom asks if they’d back what?',
    ['Doubling retirement taxes', 'Shortening lifespan today', 'Freezing adult memories', 'Capping city populations'], 1,
    'Called the "Reversal Test" (2006): if BOTH increasing and decreasing a trait sound bad without reason, status-quo bias is driving!'),

  g('FALLACIES', 3, 'iron_maiden_nuremberg_1800s_museum_fake',
    'Spooky "medieval" Iron Maiden spike cabinets toured shows—when historians traced Nuremberg’s icon, when was it built?',
    ['Around 1348 plague years', 'During 1525 peasant wars', 'Assembled in the 1800s', 'Cast for 1648 peace courts'], 2,
    'Nineteenth-century showmen bolted stray antique armor plates and bayonet spikes onto a cloak cabinet to sell sensational tickets!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 3, 'sherlock_elementary_my_dear_watson_wodehouse',
    'Doyle’s 60 Sherlock tales never print "Elementary, my dear Watson!"—whose 1915 novel "Psmith, Journalist" printed it first?',
    ['Dame Agatha Christie', 'Critic G.K. Chesterton', 'Author Dorothy L. Sayers', 'P.G. Wodehouse'], 3,
    'Stage actor William Gillette popularized "Oh, this is elementary, my dear fellow" in 1899 before Wodehouse and 1929 talkies sealed it!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 3, 'stanford_prison_2018_tapes_coached_guards',
    'Zimbardo’s 1971 Stanford Prison study claimed guards turned cruel spontaneously—until 2018 tapes caught staff doing what?',
    ['Coaching guards to be tough', 'Paying inmates per tantrum', 'Locking fire exits shut', 'Cutting calendar days short'], 0,
    'Recorded orientation briefings urged hesitant student "guards" to create boredom and fear so the study would produce dramatic results!'),

  g('FALLACIES', 3, 'kitty_genovese_1964_witnesses_did_call_myth',
    'A 1964 NYT story claimed 38 Queens neighbors watched Kitty Genovese’s attack in total silence—what did later audits prove?',
    ['Only six windows faced out', 'Neighbors yelled & phoned', 'Storms downed phone lines', 'Thick fog hid streetlamps'], 1,
    'Witnesses yelled out windows scaring the attacker off once, phoned precinct lines pre-911, and Sophia Farrar held Kitty until help came!',
    { isKlaxonMyth: true }),

  g('FALLACIES', 3, 'chestertons_fence_never_remove_unexplained_rule',
    'G.K. Chesterton’s 1929 reform rule warns NEVER to tear down an odd-looking barrier across a road until first learning what?',
    ['How much timber costs', 'Who owns nearby cattle', 'Why someone built it', 'Where county lines run'], 2,
    'Known in engineering and policy as "Chesterton’s Fence": legacy rules that look silly often guard against forgotten disasters!'),

  g('FALLACIES', 3, 'concorde_fallacy_dawkins_animal_sunk_cost',
    'Before MBAs called throwing good money after bad "sunk cost," biologist Richard Dawkins named it in 1976 after what jet?',
    ['The Boeing 2707 transport', 'Howard Hughes’s Hercules', 'Britain’s Comet airliner', 'Supersonic Concorde'], 3,
    'Britain and France kept funding the unprofitable airliner for decades because walking away meant admitting prior billions were gone!'),

  g('FALLACIES', 3, 'skinner_1948_superstitious_pigeons_timer',
    'Drop birdseed every 15 seconds regardless of action and hungry birds twirl "lucky" rituals—in whose 1948 cage experiment?',
    ['B.F. Skinner', 'Ivan Petrovich Pavlov', 'John Broadus Watson', 'Konrad Zacharias Lorenz'], 0,
    'Whatever head-bob a pigeon happened to perform right before the clockwork feeder clicked got reinforced into a "superstitious" dance!'),

  g('FALLACIES', 3, 'ecological_fallacy_robinson_group_to_person',
    'Seeing towns with bigger library budgets drink more espresso and assuming your librarian chugs lattes commits what error?',
    ['Berkson hospital skewing', 'Ecological fallacy', 'Survivorship inversion', 'Gambler’s cluster mirage'], 1,
    'William Robinson demonstrated in 1950 that aggregate regional averages routinely reverse when projected onto single individuals!'),

  g('FALLACIES', 3, 'equivocation_fallacy_double_meaning_shift',
    '"A feather is light; what is light cannot be dark; so a feather cannot be dark!" Shifting word meanings mid-proof is what?',
    ['Amphiboly grammar tangle', 'Accent emphasis switching', 'Equivocation', 'Reification abstraction'], 2,
    'Latin "aequivocus" ("equal voice") flags arguments that swap definitions of "light," "free," or "theory" halfway down the syllogism!'),

  g('FALLACIES', 3, 'genetic_fallacy_kekule_benzene_snake_dream',
    'Dismissing Kekulé’s hexagonal benzene ring solely because it sparked in a daydream of a tail-biting snake commits what?',
    ['Naturalistic leapfrog', 'Chronological snobbery', 'Appeal to shiny novelty', 'Genetic fallacy'], 3,
    'How a hypothesis sparked—dream, bathtub, or fallen apple—never decides whether lab evidence proves it true or false!'),

  g('FALLACIES', 3, 'historians_fallacy_fischer_hindsight_pearl',
    'Judging 1912 "Titanic" lookouts as if they already held tomorrow’s iceberg map—assuming past actors knew the future—is what?',
    ['Historian’s fallacy', 'Presentism slang drift', 'Whig progress teleology', 'Nostalgia rosiness bias'], 0,
    'Coined by David Hackett Fischer in 1970, fair history reconstructs ONLY the fog-of-the-moment clues people actually possessed that night!'),

  g('FALLACIES', 3, 'courtiers_reply_emperors_new_clothes_myers',
    'Scolding the kid who yells "The Emperor is naked!" for lacking a PhD in Parisian silk-weaving is PZ Myers’s satirical what?',
    ['Royal Tailor’s gambit', 'Courtier’s Reply', 'Velvet rope gatekeeping', 'Grand Mandarin’s dodge'], 1,
    'Demanding encyclopedic credentials in intricate nonsense before allowing someone to point out zero clothes exist on stage!'),

  g('FALLACIES', 3, 'kafkatrap_denial_treated_as_proof_of_guilt',
    'Accusing someone of secret bias—then declaring their calm "No, I’m not!" proves deep denial—springs what circular snare?',
    ['Catch-22 flight paradox', 'Morton’s tax-collector fork', 'A Kafkatrap', 'Hobson’s lone stable horse'], 2,
    'Named after Josef K.’s surreal nightmare in Franz Kafka’s "The Trial," where protesting innocence is logged as evidence of guilt!'),

  g('FALLACIES', 3, 'poinsettia_500_leaves_nonlethal_holiday_myth',
    'Holiday lore calls red poinsettias deadly—toxicologists found a 50-lb kid would have to chew past bitter sap through how many leaves?',
    ['Just 3 small leaves', 'Roughly 15 red leaves', 'Exactly 40 green leaves', 'Over 500 leaves'], 3,
    'Poinsettia sap can mildly upset tummies or itch skin, yet zero human fatalities appeared across 22,000 poison-control exposures!',
    { isKlaxonMyth: true, numeric: { target: 500, min: 50, max: 1000, step: 25, unit: 'leaves' } }),

  // ======================== 2. ODDS (108: 49 D1, 43 D2, 16 D3) ========================

  // --- ODDS D1 (49 clues) ---
  g('ODDS', 1, 'wordle_curated_answer_bank_2300_words',
    'Josh Wardle pruned obscure 5-letter words out of Wordle’s 2021 secret solution bank—roughly how many everyday words made it?',
    ['About 2,300 words', 'Exactly 500 common words', 'Over 12,900 valid words', 'Around 50,000 entries'], 0,
    'Wardle’s partner Palak Shah sorted 12,000+ five-letter English words into "known" vs "obscure" so daily answers felt fair!'),

  g('ODDS', 1, 'nyt_connections_four_mistakes_allowed',
    'Play the New York Times’ daily 16-tile game "Connections"—how many wrong group guesses are allowed before Game Over?',
    ['3 mistakes', '4 mistakes', '5 mistakes', '6 mistakes'], 1,
    'With 1,820 possible four-tile combos on Tap #1, those four little gray mistake dots vanish fast when purple wordplay strikes!',
    { numeric: { target: 4, min: 1, max: 10, step: 1, unit: 'mistakes' } }),

  g('ODDS', 1, 'powerball_red_drum_26_balls_count',
    'After drawing 5 white balls from 69, modern Powerball pulls its red jackpot ball from a second drum of how many balls?',
    ['15 red balls', '35 red balls', '26 red balls', '42 red balls'], 2,
    'Matching just the lone red Powerball out of 26 pays $4—while matching all 5 white plus red climbs to 1 in 292.2 million!',
    { numeric: { target: 26, min: 10, max: 50, step: 1, unit: 'balls' } }),

  g('ODDS', 1, 'lottery_birthdays_split_jackpot_trap',
    'Playing family birthdays (1–31) on a lottery ticket never changes win odds—why do math pros still warn against it?',
    ['Drums draw high balls more', 'Quick-Pick slips pay first', 'Taxes jump on low numbers', 'Winners split the pot'], 3,
    'Every 6-number combo is equally likely, yet millions play calendar dates—turning a solo jackpot into a 12-way slice!'),

  g('ODDS', 1, 'sock_drawer_three_socks_pigeonhole_bet',
    'Power’s out! A drawer mixes 10 loose black socks and 10 loose navy socks—how few grabbed blindly GUARANTEE a matched pair?',
    ['3 socks', '11 socks', '2 socks', '5 socks'], 0,
    'With only two colors in the drawer, Sock #3 has nowhere left to hide—by the Pigeonhole Principle, two must match!',
    { numeric: { target: 3, min: 1, max: 12, step: 1, unit: 'socks' } }),

  g('ODDS', 1, 'glove_bin_eleven_gloves_left_right_bet',
    'Upgrade the sock riddle! A dark bin holds 10 pairs of black leather gloves—how many pulls guarantee a LEFT-and-RIGHT pair?',
    ['3 gloves', '11 gloves', '6 gloves', '19 gloves'], 1,
    'Unlike reversible tube socks, your worst-case streak pulls all 10 left-handed gloves in a row before Glove #11 seals a pair!',
    { numeric: { target: 11, min: 2, max: 20, step: 1, unit: 'gloves' } }),

  g('ODDS', 1, 'vegas_blackjack_6_to_5_payout_trap',
    'Savvy Vegas players walk past $15 Blackjack tables printing "BLACKJACK PAYS 6 TO 5" instead of 3-to-2—what happens to edge?',
    ['Dealers peek at two cards', 'Splits cost double chips', 'House edge jumps 4x', 'Aces count only as one'], 2,
    'Winning $12 instead of $15 on every $10 natural 21 quietly balloons basic-strategy house edge from ~0.5% to nearly 2%!'),

  g('ODDS', 1, 'vegas_triple_zero_roulette_769_edge',
    'Single-zero roulette takes 2.7% and Vegas 00 takes 5.26%—adding a third green "000" pocket hikes house edge to what?',
    ['3.15%', '5.80%', '12.50%', '7.69%'], 3,
    'Introduced on Strip floors in 2016 disguised behind flashy logos, 39-pocket triple-zero wheels quietly shave 3 slots in 39!'),

  g('ODDS', 1, 'monopoly_jail_roll_doubles_one_in_six',
    'Locked in Monopoly’s Jail hoping to roll Doubles on two dice instead of paying $50—what are your exact odds per turn?',
    ['1 in 6', '1 in 12', '1 in 36', '1 in 4'], 0,
    'Whatever number Die #1 lands on (1 through 6), Die #2 has a clean 1-in-6 shot at matching it!'),

  g('ODDS', 1, 'uno_standard_deck_108_cards_count',
    'Open a classic Mattel UNO box for game night—counting numbers, Skips, Reverses, and Wilds, how many cards sit inside?',
    ['52 cards', '108 cards', '76 cards', '120 cards'], 1,
    'Ohio barber Merle Robbins invented UNO at his dining table in 1971—packing 108 colorful cards to settle Crazy Eights rules!',
    { numeric: { target: 108, min: 50, max: 120, step: 2, unit: 'cards' } }),

  g('ODDS', 1, 'rubiks_cube_gods_number_20_moves',
    'Scramble a 3×3×3 Rubik’s Cube any way you like—Google servers proved in 2010 EVERY position solves in at most how many moves?',
    ['54 moves', '36 moves', '20 moves', '12 moves'], 2,
    'Dubbed "God’s Number," optimal solutions rarely even need all 20 turns—most scrambles untangle in 18!',
    { numeric: { target: 20, min: 5, max: 60, step: 1, unit: 'moves' } }),

  g('ODDS', 1, 'stock_down_fifty_needs_hundred_percent_gain',
    'Wall Street napkin trap: your $100 stock drops 50% on Monday down to $50—what percentage gain Tuesday gets you back to $100?',
    ['50% gain', '75% gain', '200% gain', '100% gain'], 3,
    'Percentages ride the NEW base: losing half of $100 leaves $50, which must double (+100%) just to break even!',
    { numeric: { target: 100, min: 25, max: 120, step: 5, unit: '%' } }),

  g('ODDS', 1, 'clearance_50_off_plus_extra_50_off_75',
    'A rack sign shouts "50% OFF—PLUS EXTRA 50% OFF AT REGISTER!" Instead of $0 free, what total discount did you score?',
    ['75% off list', '100% totally free', '65% off list price', '80% off list price'], 0,
    'Half off $100 drops it to $50, and half off $50 trims another $25—leaving a $25 bill (75% off)!',
    { numeric: { target: 75, min: 25, max: 100, step: 5, unit: '%' } }),

  g('ODDS', 1, 'eighteen_inch_pizza_beats_two_twelve_inch',
    'Pizzeria geometry hack: because circle area scales with radius squared, ONE 18-inch XL pie gives you more pizza than what?',
    ['Three 14-inch rounds', 'Two 12-inch pies', 'Four 10-inch rounds', 'Two 16-inch rounds'], 1,
    'One 18-inch pie gives ~254 square inches of cheesy glory vs ~226 square inches across two 12-inch pies—almost 30 extra inches!'),

  g('ODDS', 1, 'nfl_overtime_both_teams_possess_2022_rule',
    'After Buffalo lost a 2022 playoff OT thriller to KC without Josh Allen touching the ball, NFL owners guaranteed what?',
    ['Sudden-death field goals', 'Two-point kickoff duels', 'Both teams get one ball', 'Visiting captains choose'], 2,
    'Playoff overtime coin-toss winners previously won >50% on the opening march—prompting owners to guarantee both offenses a turn!'),

  g('ODDS', 1, 'shohei_ohtani_2024_fifty_fifty_club_prior',
    'Before Shohei Ohtani founded MLB’s 50-homer / 50-steal club in September 2024, how many MLB players had hit 50/50?',
    ['Three Hall of Famers', 'Only Barry Bonds once', 'Two 1920s speedsters', 'Zero players ever'], 3,
    'Ohtani sealed 50/50 in style—going 6-for-6 with 3 home runs, 2 stolen bases, and 10 RBIs in one Miami afternoon!'),

  g('ODDS', 1, 'march_madness_9_quintillion_coin_bracket',
    'Buffett offered $1B for a flawless 63-game March Madness bracket—coin-flipping every game hits 63-for-63 at 1 in what?',
    ['9.2 quintillion', '4.5 million tries', '820 billion tries', '64 trillion tries'], 0,
    'Even accounting for heavy #1-seed favorites, sports statisticians estimate an informed fan’s true odds sit past 1 in 120 billion!'),

  g('ODDS', 1, 'rule_of_72_compound_doubling_years',
    'Napkin finance shortcut: divide 72 by annual return (72 ÷ 8% = 9 years) to estimate how long savings take to do what?',
    ['Outpace cumulative CPI', 'Double in value', 'Clear mortgage interest', 'Triple after taxes'], 1,
    'Luca Pacioli noted the shortcut back in 1494—at 6% interest your nest egg doubles in ~12 years; at 9% in ~8!'),

  g('ODDS', 1, 'average_speed_60_out_30_back_40_mph',
    'Drive 60 miles out at 60 mph (1 hr) and crawl 60 miles home at 30 mph (2 hrs)—what was your round-trip average speed?',
    ['45 miles/hr', '48 miles/hr', '40 mph', '35 miles/hr'], 2,
    'You spent TWICE as many hours crawling at 30 mph as cruising at 60: 120 total miles ÷ 3 total hours = 40 mph, not 45!',
    { numeric: { target: 40, min: 20, max: 70, step: 5, unit: 'mph' } }),

  g('ODDS', 1, 'two_factor_six_digit_code_million_odds',
    'Your bank texts a random 6-digit login code (000000–999999)—a blind one-shot guess hits at what exact probability?',
    ['1 in 60,000 tries', '1 in 100,000 tries', '1 in 10 million', '1 in 1 million'], 3,
    'Ten choices across six independent slots (10^6) yields exactly 1,000,000 codes—which is why apps lock out after 3–5 tries!'),

  g('ODDS', 1, 'connect_four_solved_center_column_win',
    'Victor Allis solved 7×6 "Connect Four" in 1988—proving Player 1 forces victory every time by dropping Disk #1 where?',
    ['Center fourth column', 'Far-left corner column', 'Second slot from right', 'Alternating outer rims'], 0,
    'Center-column control threads so many horizontal and diagonal fours that playing any other opener hands parity away!'),

  g('ODDS', 1, 'battleship_tiniest_patrol_boat_two_pegs',
    'Hunting across a 10×10 "Battleship" grid gets toughest late-game tracking the smallest vessel, spanning how many holes?',
    ['3 peg holes', '2 holes', '4 peg holes', '5 peg holes'], 1,
    'Smart captains fire in a checkerboard grid—since even the 2-hole Patrol Boat must straddle one light and one dark square!',
    { numeric: { target: 2, min: 1, max: 8, step: 1, unit: 'holes' } }),

  g('ODDS', 1, 'twister_spinner_sixteen_equal_sectors',
    'Flick the arrow on a classic 1966 "Twister" spinner (4 limbs × 4 colors)—into how many equal wedges is it divided?',
    ['8 color wedges', '12 color wedges', '16 wedges', '24 color wedges'], 2,
    'Johnny Carson and Eva Gabor tangled across those 16 spinner combinations on "The Tonight Show" in May 1966, igniting a craze!',
    { numeric: { target: 16, min: 4, max: 32, step: 2, unit: 'wedges' } }),

  g('ODDS', 1, 'three_burgers_two_slot_grill_90_seconds',
    'A small griddle fits ONLY 2 burgers at once, and each side needs 30 seconds—swapping smartly, how fast do 3 burgers cook?',
    ['120 full seconds', '60 brisk seconds', '150 full seconds', '90 seconds'], 3,
    'Grill A1+B1 (30s), flip A2 and swap B out for C1 (30s), then finish B2+C2 together (30s) = 90 crisp seconds!',
    { numeric: { target: 90, min: 30, max: 120, step: 15, unit: 'seconds' } }),

  g('ODDS', 1, 'ten_party_guests_45_champagne_clinks',
    'Ten finalists clink champagne flutes backstage, each clinking once with every neighbor—how many total clinks ring out?',
    ['45 clinks', '90 loud clinks', '55 loud clinks', '100 loud clinks'], 0,
    'Ten people times nine neighbors would double-count every pair—divide 90 by 2 for 45 distinct toasts!',
    { numeric: { target: 45, min: 10, max: 100, step: 5, unit: 'clinks' } }),

  g('ODDS', 1, 'airline_overbooking_predictable_no_shows',
    'How can airlines sell 186 tickets for a 180-seat jet and still depart with zero bumped flyers on most flights?',
    ['Fold-down crew jumpseats', 'Predictable no-shows', 'Standby luggage credits', 'Last-row infant swaps'], 1,
    'Binomial models of missed connections and late sleepers let carriers sell phantom seats—paying vouchers only when everyone shows!'),

  g('ODDS', 1, 'poker_flush_beats_straight_fewer_ways',
    'Friday-night poker check: why does a five-card Flush always outrank a five-card Straight in official hand rankings?',
    ['Royal suits date to 1400', 'Flushes use high kickers', 'Fewer Flushes exist', 'Straights wrap past Aces'], 2,
    'Poker ranks strictly by scarcity: out of 2.6 million deals, 10,200 make Straights while barely half as many (5,108) make Flushes!'),

  g('ODDS', 1, 'gacha_mobile_game_pity_timer_guarantee',
    'Mobile games like "Genshin Impact" publish 0.6% five-star odds AND guarantee a top drop within 90 pulls via what rule?',
    ['Mercy crystal refunding', 'Streak multiplier wheel', 'Wildcard duplicate burn', 'A pity timer'], 3,
    'Without guaranteed pity ceilings, 1-in-167 geometric dry spells would leave unlucky players empty-handed past 400 pulls!'),

  g('ODDS', 1, 'wordle_starter_consonants_beat_adieu',
    'Millions start Wordle with vowel-packed ADIEU, yet NYT’s WordleBot crowns SLATE and TRACE—why do they win faster?',
    ['Consonants prune tighter', 'Hard-mode locks vowels out', 'Double letters add clues', 'Dictionary order leaks'], 0,
    'You will spot A and E soon anyway—testing crisp workhorse consonants (S, L, T, R, C, N) slashes remaining words far faster!'),

  g('ODDS', 1, 'catan_red_six_and_eight_most_rolled',
    'In "Catan," why are number tokens 6 and 8 printed in bold red and barred from sitting side-by-side at setup?',
    ['Robber spawns on sixes', 'Top non-7 dice rolls', 'Cities pay triple brick', 'Harbors double red hexes'], 1,
    'With 7 triggering the Robber (6/36), 6 and 8 tie as Catan’s richest production numbers at 5 ways in 36 (~13.9%) each!'),

  g('ODDS', 1, 'die_hard_three_and_five_jugs_four_gallons',
    'In 1995’s "Die Hard with a Vengeance," ungraduated 3-gallon and 5-gallon jugs disarm a fountain bomb by measuring what?',
    ['Exactly 2 gallons', 'Exactly 6 gallons', '4 gallons', 'Exactly 7 gallons'], 2,
    'Fill 5, pour into 3 leaving 2 gallons; dump 3, pour the 2 into 3, refill 5, and top off the last 1-gallon gap to leave 4!',
    { numeric: { target: 4, min: 1, max: 8, step: 1, unit: 'gallons' } }),

  g('ODDS', 1, 'blackjack_natural_21_once_in_21_hands_odds',
    'Sit at a freshly shuffled single-deck Blackjack table—roughly once in how many hands will you catch a natural two-card 21?',
    ['Every 8 hands dealt', 'Every 52 hands dealt', 'Every 100 hands dealt', 'Every 21 hands'], 3,
    'Pulling an Ace (4/52) paired with a 10-value card (16/51) in either order hits 4.83%—almost literally 1 in 21!',
    { numeric: { target: 21, min: 5, max: 60, step: 1, unit: 'hands' } }),

  g('ODDS', 1, 'baccarat_banker_bet_tiny_one_percent_edge',
    'Why does James Bond love Baccarat? Even after a 5% win commission, betting "Banker" carries a tiny house edge near what?',
    ['About 1.06%', 'Exactly 5.26% cut', 'Nearly 9.50% cut', 'Zero house profit'], 0,
    'Compare that gentle 1.06% Banker cut to Baccarat’s tempting "Tie" bet right beside it, which wallops tourists for 14.4%!'),

  g('ODDS', 1, 'craps_free_odds_zero_house_edge_vegas',
    'Behind your Pass Line chips on a Vegas craps felt sits the ONLY casino bet with a true 0.00% house edge—called what?',
    ['Hardways Eight box', 'Taking Free Odds', 'Any Seven Horn bet', 'Double Field rail'], 1,
    'Casinos never print a giant neon box for Free Odds on the felt because paying true 2:1, 3:2, and 6:5 yields zero house profit!'),

  g('ODDS', 1, 'keno_lounge_brutal_25_to_35_house_edge',
    'Mark 10 numbers on a casino lounge Keno slip—mathematicians warn traditional Keno carries roughly what steep house edge?',
    ['Under 1.5% hold', 'Around 4.5% hold', '25% to 35%', 'Exactly 10% hold'], 2,
    'State lotteries and lounge Keno offer giant top-prize dreams funded by casino gambling’s steepest everyday house hold!'),

  g('ODDS', 1, 'pokemon_tcg_all_holo_god_pack_pull',
    'Rip open a modern Pokémon card pack to find EVERY card inside is a rare holo (~1 in 1,000+ packs)—collectors call it what?',
    ['A Royal Flush pack', 'A Phantom Foil box', 'A Midas Master set', 'A God pack'], 3,
    'Borrowed from Japanese "Kami Pack" hobbyists, pulling one on livestream sends trading-card chat rooms into orbit!'),

  g('ODDS', 1, 'passphrase_four_random_words_entropy_xkcd',
    'Security pros and XKCD showed why "correct-horse-battery-staple" beats "Tr0ub4dor&3" against crackers—what wins?',
    ['Length beats swaps', 'Hyphens jam GPU rigs', 'Nouns dodge wordlists', 'Vowels slow hashing'], 0,
    'Swapping "o" for "0" fools humans, not computers—28 characters of four random words explodes search entropy exponentially!'),

  g('ODDS', 1, 'taylor_swift_eras_presale_3_5_billion_pings',
    'Over 3.5 billion requests crashed Ticketmaster in November 2022 as 14 million fans battled bots for whose stadium tour?',
    ['Beyoncé Giselle', 'Taylor Swift', 'Benito Bad Bunny', 'Edward Sheeran'], 1,
    'Ticketmaster calculated it would have taken 900 consecutive stadium shows just to seat everyone waiting in the Eras Tour queue!'),

  g('ODDS', 1, 'chris_moneymaker_86_dollar_wsop_boom_2003',
    'Accountant Chris Moneymaker ignited TV’s 2000s poker boom by turning an $86 online satellite entry into what 2003 prize?',
    ['A Monte Carlo superyacht', 'Bellagio resort equity', '$2.5M WSOP title', 'Ten gold WSOP bracelets'], 2,
    'Bluffing pro Sam Farha heads-up on ESPN convinced millions of home viewers that an $86 amateur could conquer Vegas!'),

  g('ODDS', 1, 'texas_holdem_169_distinct_starting_hands',
    'Before the flop in Texas Hold’em, suits carry equal value—collapsing 1,326 two-card deals into how many starting hands?',
    ['52 unique hands', '1,000 unique hands', '91 unique hands', '169 hands'], 3,
    'Thirteen pocket pairs + 78 suited combos + 78 offsuit combos neatly fill poker’s classic 13×13 preflop strategy chart!'),

  g('ODDS', 1, 'clue_mansion_324_murder_combinations',
    'Tuck 1 of 6 Suspects, 1 of 6 Weapons, and 1 of 9 Rooms into "Clue"’s envelope—how many crime combinations exist?',
    ['324 combos', '21 crime combos', '108 crime combos', '729 crime combos'], 0,
    'Simple multiplication rule (6 × 6 × 9 = 324) turns mansion deduction into brisk process-of-elimination theater!'),

  g('ODDS', 1, 'baseball_300_hitter_zero_for_four_quarter',
    'Fans boo when a .300 star goes 0-for-4—yet (0.70)^4 means a true .300 hitter goes hitless in 4 at-bats what % of games?',
    ['Under 3% of games', 'About 24%', '50% of night games', 'Over 70% of games'], 1,
    'Even elite .300 batters make outs 7 times in 10—stringing four outs together happens nearly once every four nights!',
    { numeric: { target: 24, min: 5, max: 60, step: 1, unit: '%' } }),

  g('ODDS', 1, 'super_bowl_51_patriots_28_3_win_prob_996',
    'Trailing Atlanta 28–3 late in the third quarter of Super Bowl LI (2017), New England defied live win-model odds near what?',
    ['82.5% Falcons win', '90.0% Falcons win', '99.6% Falcons', '94.2% Falcons win'], 2,
    'Thirty-one unanswered Patriot points capped the first overtime in Super Bowl history and broke every live analytics chart!'),

  g('ODDS', 1, 'rich_strike_2022_kentucky_derby_80_to_1_upset',
    'Entered off the alternate list 30 seconds before Friday’s deadline, Rich Strike shocked the 2022 Kentucky Derby at what odds?',
    ['15-to-1 longshot', '30-to-1 longshot', '50-to-1 longshot', '80-to-1 odds'], 3,
    'Weaving along the inner rail under Sonny Leon, Rich Strike posted the second-biggest upset in 148 years at Churchill Downs!',
    { numeric: { target: 80, min: 10, max: 100, step: 5, unit: 'to 1' } }),

  g('ODDS', 1, 'monty_hall_100_doors_99_percent_switch',
    'Scale Monty Hall to 100 doors: pick #1, watch Monty open 98 goat doors leaving #73 shut—switching now wins what %?',
    ['99%', '50%', '67%', '12%'], 0,
    'Door #1 still holds its tiny 1-in-100 opening shot while Monty’s careful filtering concentrates 99/100 onto Door #73!',
    { numeric: { target: 99, min: 50, max: 100, step: 1, unit: '%' } }),

  g('ODDS', 1, 'eight_coins_two_weighings_heavy_fake',
    'One of 8 gold coins is heavier—splitting 3 vs 3 on a two-pan balance scale spots the heavy fake in how few weighings?',
    ['4 weighings', '2 weighings', '3 weighings', '5 weighings'], 1,
    'Every balance tip gives THREE outcomes (left, right, or level), so 3^2 = 9 handles up to 9 coins in just 2 weighings!',
    { numeric: { target: 2, min: 1, max: 8, step: 1, unit: 'weighings' } }),

  g('ODDS', 1, 'pac_man_level_256_eight_bit_255_overflow',
    '1980 arcade "Pac-Man" garbles into a split-screen kill maze on Level 256 because an 8-bit counter overflows past what max?',
    ['128', '512', '255', '999'], 2,
    'Eight binary bits store 0 through 255—rolling to 256 dumps garbage fruit tiles across the right half of the screen!'),

  g('ODDS', 1, 'tetris_seven_bag_stops_long_bar_drought',
    '1989 NES "Tetris" could starve you of a straight I-bar for 50 drops—modern Tetris deals all 7 shapes out of what?',
    ['Weighted mercy queues', 'Alternating odd-even sets', 'A 14-piece mirror shoe', 'Shuffled 7-piece bag'], 3,
    'Drawing every tetromino once per 7-bag caps the worst possible I-bar wait at 12 pieces instead of infinity!'),

  g('ODDS', 1, 'gukesh_youngest_world_chess_champ_18_2024',
    'Upsetting title odds in Singapore in December 2024, India’s Gukesh Dommaraju became youngest World Chess Champ at what age?',
    ['18 years old', '21 full years old', '15 full years old', '24 full years old'], 0,
    'Breaking Garry Kasparov’s 1985 record (age 22) by four years, Gukesh capitalized on a stunned endgame blunder in Game 14!',
    { numeric: { target: 18, min: 12, max: 35, step: 1, unit: 'years' } }),

  // --- ODDS D2 (43 clues) ---
  g('ODDS', 2, 'ed_thorp_1962_beat_the_dealer_tens_aces',
    'MIT’s Edward Thorp used an IBM 704 in 1962 to prove Blackjack’s edge flips to players when undealt cards run rich in what?',
    ['Twos through Fives', 'Tens and Aces', 'Red suited Jacks', 'Sevens and Eights'], 1,
    'High cards hand players 3-to-2 Blackjacks while forcing stiff dealer 12–16 hands to bust far more often!'),

  g('ODDS', 2, 'mit_blackjack_team_spotter_big_player_call',
    'Why didn’t MIT’s 1990s Blackjack counters suddenly jump their own bets from $10 to $5,000 when a shoe turned hot?',
    ['Table maxes stopped at $500', 'Dealers shuffled on big wins', 'Waved a Big Player in', 'Tipping laws capped raises'], 2,
    'Flat-betting "Spotters" counted quietly, then crossed arms to summon a high-rolling "Big Player" acting like a reckless whale!'),

  g('ODDS', 2, 'roulette_worst_five_number_basket_bet_789',
    'Every American 00 roulette bet takes 5.26% EXCEPT one 7.89% stinker ("The Basket") covering which five pockets?',
    ['Red corners 1-3-7-9-0', 'All five single primes', 'Middle column plus 00', '0, 00, 1, 2, and 3'], 3,
    'Paying 6-to-1 across 5 of 38 pockets shortchanges bettors an extra 2.6%—pit veterans call it the sucker bet of the wheel!'),

  g('ODDS', 2, 'press_your_luck_1984_larson_five_patterns',
    'Michael Larson won $110,237 on 1984’s "Press Your Luck" after VCR-spotting the prize board cycled how many light patterns?',
    ['5 patterns', '18 light loops', '32 light loops', '12 light loops'], 0,
    'Knowing Squares #4 and #8 NEVER held a Whammy, Larson hammered his buzzer 45 straight spins while CBS execs sweated backstage!',
    { numeric: { target: 5, min: 2, max: 25, step: 1, unit: 'patterns' } }),

  g('ODDS', 2, 'nba_draft_lottery_flattened_14_percent_top3',
    'To curb April "tanking," 2019 NBA Draft Lottery reforms capped each of the worst three clubs’ #1-pick odds at what?',
    ['25% top-pick odds', '14% each', '33% top-pick odds', '18% top-pick odds'], 1,
    'In 2024 the Atlanta Hawks proved lottery chaos lives—leaping all the way to Pick #1 despite holding just a 3% ping-pong shot!',
    { numeric: { target: 14, min: 5, max: 50, step: 1, unit: '%' } }),

  g('ODDS', 2, 'sportsbook_minus_110_vig_524_breakeven',
    'Betting NFL spreads at standard "-110" vig (risk $110 to profit $100) requires beating what win rate just to break even?',
    ['Exactly 50.1%', 'Roughly 55.0%', '52.4%', 'Nearly 58.5%'], 2,
    'Risking $110 for a $210 return means 110 ÷ 210 = 52.38%—that slim 2.4% gap builds towering marble sportsbooks in the desert!'),

  g('ODDS', 2, 'texas_holdem_pocket_pair_vs_ak_coin_flip',
    'All-in preflop in Hold’em with Pocket Tens (10-10) vs Ace-King offsuit—called a "coin flip," yet who leads ~55%?',
    ['Ace-King suited or off', 'Exact 50/50 split tie', 'Whichever holds spades', 'Pocket pair (10-10)'], 3,
    'Ace-King misses both pair cards on the board ~55% of the time—making "Snowmen" or "Dimes" a slight favorite in tournament races!'),

  g('ODDS', 2, 'texas_holdem_rule_of_4_and_2_turn_outs',
    'Chasing 9 heart "outs" in Hold’em: multiply outs by 4 on the flop (~36%) or by what number with one river card left?',
    ['Multiply by 2', 'Multiply outs by 3', 'Divide outs by 2', 'Square outs minus 5'], 0,
    'With 9 outs among 46 unseen cards (9/46 = 19.6%), multiplying 9 × 2 = 18% gives instant table-ready math under pressure!',
    { numeric: { target: 2, min: 1, max: 10, step: 1, unit: 'multiplier' } }),

  g('ODDS', 2, 'mit_cash_winfall_rolldown_lottery_exploit',
    'MIT students legally netted millions from Massachusetts’s "Cash WinFall" lottery by buying 100,000 slips ONLY during what?',
    ['Leap-year Friday draws', 'Uncapped rolldown weeks', 'Blizzard low-sales days', 'Televised bonus nights'], 1,
    'Whenever nobody hit 6-of-6 past $2M, jackpot cash "rolled down" into 4- and 5-match tiers—turning $2 tickets worth ~$2.30!'),

  g('ODDS', 2, 'srivastava_2003_singleton_scratch_off_crack',
    'Statistician Mohan Srivastava cracked Ontario’s 2003 Tic-Tac-Toe scratch-offs without scratching latex by spotting what?',
    ['Thicker metallic ink', 'Prime serial endings', 'Visible singleton digits', 'Crooked barcode corners'], 2,
    'To prevent fake extra three-in-a-rows, printing software rarely repeated winning digits—letting him sort winners at 90% accuracy!'),

  g('ODDS', 2, 'squid_game_glass_bridge_18_steps_odds',
    'In "Squid Game," crossing 18 left-or-right glass panel pairs first (1/2^18) gave Player #1 raw survival odds of 1 in what?',
    ['Only 4,096', 'About 32,768', 'Over 1,048,576', '262,144'], 3,
    'Expected deaths clear ~9 of the 16 players on average while trailing numbers coast across revealed safe panes!'),

  g('ODDS', 2, 'minecraft_speedrun_7_5_trillion_rng_paper',
    'Four PhD statisticians wrote a 2020 paper clocking 1-in-7.5-trillion drop luck inside which game’s speedrun community?',
    ['Minecraft', 'Super Mario 64', 'Elden Ring', 'Hollow Knight'], 0,
    'Piglin Ender Pearl trades and Blaze Rod drops ran impossibly hot across six livestreams—sparking gaming’s biggest math investigation!'),

  g('ODDS', 2, 'alphago_move_37_one_in_ten_thousand_2016',
    'Commentators thought AlphaGo misclicked on "Move 37" against Go icon Lee Sedol in 2016—scoring human odds at what?',
    ['About 1 in 50', '1 in 10,000', '1 in 1 billion', '50/50 book play'], 1,
    'Breaking centuries of fifth-line taboo, Move 37 pivoted the board to victory and reshaped how human grandmasters study Go!'),

  g('ODDS', 2, 'watermelon_99_to_98_percent_water_50_lbs',
    '100 lbs of berries (99% water, 1 lb dry pulp) sit in sun until water dips slightly to 98%—what do the berries weigh now?',
    ['98 full pounds', '90 full pounds', '50 pounds', '75 full pounds'], 2,
    'That 1 pound of dry berry pulp never evaporated! For 1 lb to equal 2% of total weight (98% water), total weight halved to 50 lbs!',
    { numeric: { target: 50, min: 10, max: 99, step: 5, unit: 'pounds' } }),

  g('ODDS', 2, 'two_burning_ropes_measure_45_minutes',
    'Two erratic 60-minute fuses: light Fuse A at BOTH ends and Fuse B at ONE end, then light B’s other end when A finishes to time what?',
    ['20 exact minutes', '30 exact minutes', '50 exact minutes', '45 minutes'], 3,
    'Fuse A meets in the middle at 30 minutes regardless of uneven speed, leaving 30 minutes on Fuse B burned from both ends (15m)!',
    { numeric: { target: 45, min: 15, max: 90, step: 5, unit: 'minutes' } }),

  g('ODDS', 2, 'secret_santa_derangement_37_percent_no_self',
    'Toss 50 names into a Secret Santa bowl—whether 10 or 10,000 play, odds NOBODY draws their own name settle near what?',
    ['About 37%', 'Under 1% odds', '50% coin flip', 'Over 85% odds'], 0,
    'Combinatorics calls zero-fixed-point shuffles "derangements," which converge rapidly to 1/e (~36.79%) once past 6 guests!'),

  g('ODDS', 2, 'bertrands_box_gold_coin_two_thirds_odds',
    'Three chests hold [Gold,Gold], [Silver,Silver], and [Gold,Silver]; pull one coin and see GOLD—odds its partner is Gold?',
    ['1 in 2 (even)', '2 in 3', '1 in 3 (long)', '3 in 4 (high)'], 1,
    'You pulled one of THREE gold coins in the room—two of those three sit inside the [Gold,Gold] chest, beating the 50/50 trap!'),

  g('ODDS', 2, 'simpsons_baseball_jeter_vs_justice_1995_96',
    'MLB stat twist: David Justice hit for a higher average than Derek Jeter in 1995 AND in 1996—who led 1995–96 COMBINED?',
    ['Exact .300 tie', 'David Justice', 'Derek Jeter', 'Bernie Williams'], 2,
    'Jeter took 48 at-bats in low-average 1995 and 582 in hot .314 1996, weighting his two-year sum (.310) past Justice (.270)!'),

  g('ODDS', 2, 'risk_board_game_3_vs_2_dice_attacker_edge',
    'In "Risk," ties go to defense—when an attacker rolls maximum 3 red dice vs 2 white dice, who loses fewer armies overall?',
    ['2-dice defender wins 60%', 'Dead-even 50/50 split', 'White defense sweeps', '3-dice attacker'], 3,
    'Out of 7,776 five-dice outcomes, 3v2 costs defenders ~1.08 armies per roll vs ~0.92 for attackers—making full 3-die attacks essential!'),

  g('ODDS', 2, 'mastermind_donald_knuth_five_guesses_max',
    'With 6 peg colors in 4 holes (1,296 codes), Donald Knuth proved in 1977 any "Mastermind" code cracks within how many turns?',
    ['5 guesses', '8 peg guesses', '10 peg guesses', '4 peg guesses'], 0,
    'Opening with two pairs (1-1-2-2) worst-case prunes 1,296 possibilities down to 1 inside five minimax moves!',
    { numeric: { target: 5, min: 2, max: 15, step: 1, unit: 'guesses' } }),

  g('ODDS', 2, 'checkers_solved_2007_chinook_guaranteed_draw',
    'Crunching 500 billion board positions over 18 years, "Chinook" proved in 2007 that error-free 8×8 Checkers ends how?',
    ['Black forces a win', 'Guaranteed draw', 'Red wins in 42 moves', 'First king sweeps'], 1,
    'With 5 × 10^20 total configurations, Checkers remains the largest classic parlor game weakly solved end-to-end by computer!'),

  g('ODDS', 2, 'elo_rating_400_point_gap_ten_to_one',
    'Arpad Elo scaled chess ratings in 1960 so a player rated 400 points above their rival is expected to score what share?',
    ['Roughly 60% of points', 'Exactly 75% of points', 'About 91% (10:1)', 'Nearly 99.9% sweep'], 2,
    'Every 400 Elo points multiplies expected win-to-loss ratio by 10—so an 800-point gap jumps to 100-to-1!'),

  g('ODDS', 2, 'tennis_scoring_magnifies_55_rally_to_80_match',
    'Win 55% of individual tennis rallies and scoring by games and best-of-three sets magnifies match-win probability near what?',
    ['Drops down to 51%', 'Stays flat at 55%', 'Reaches roughly 62%', 'Over 80%'], 3,
    'Nested win-by-two thresholds filter out lucky bounces—explaining why top tennis seeds dominate Grand Slams far steadier than baseball!'),

  g('ODDS', 2, 'false_positive_credit_card_fraud_alert_bayes',
    'An AI catches 99% of thefts and misflags 0.5% of honest swipes—if 1 swipe in 5,000 is stolen, most fraud alerts are what?',
    ['False-positive alarms', 'Confirmed stolen plastic', 'Duplicate terminal taps', 'Cloned overseas cards'], 0,
    'Across 5,000 swipes, 1 thief triggers ~1 true catch while 4,999 honest shoppers generate ~25 false alarms—Bayes’s base rate rules!'),

  g('ODDS', 2, 'wisdom_of_crowds_galton_ox_independence_key',
    '787 fairgoers’ averaged guesses nailed an ox’s weight within 1 lb—"Wisdom of Crowds" fails the instant guessers do what?',
    ['Round to nearest ten', 'Copy others’ bids', 'Use ballpoint pens', 'Include kids under 12'], 1,
    'Errors cancel out ONLY when guesses stay independent—once crowds peek at a leaderboard, variance collapses into a herd bubble!'),

  g('ODDS', 2, 'virginia_1992_lottery_bought_five_million_slips',
    'When Virginia’s 1992 jackpot hit $27M across just 7.1M combinations ($1 each), an Aussie syndicate raced clerks to do what?',
    ['Hack state fax modems', 'Weigh ping-pong balls', 'Buy 5M $1 tickets', 'Short state bond yields'], 2,
    'Time ran out at 5 million hand-rung tickets before Saturday’s draw—luckily the winning $27M combo sat right inside their stack!'),

  g('ODDS', 2, 'solar_eclipse_same_town_375_years_average',
    'Total solar eclipses hit Earth every ~18 months somewhere—yet any ONE hometown waits on average how long between totalities?',
    ['Every 19 solar years', 'Roughly 76 Halley years', 'Over 2,000 calendar years', 'About 375 years'], 3,
    'Totality’s shadow ribbon is ~70 miles narrow—though lucky Carbondale, Illinois caught both 2017 and 2024 seven years apart!'),

  g('ODDS', 2, 'bridge_deal_635_billion_thirteen_card_hands',
    'Deal 13 cards to South from a 52-card Bridge deck—how many billion distinct 13-card Bridge hands exist for one player?',
    ['635 billion', 'Just 4 billion', '52 billion deals', '19 billion deals'], 0,
    'And multiplying all four seats around the table rockets full Bridge deals past 53 octillion (5.36 × 10^28)!'),

  g('ODDS', 2, 'klondike_solitaire_80_percent_winnable_deals',
    'Computer solvers studying 3-card "Klondike" Solitaire proved roughly what % of shuffled deals are theoretically winnable?',
    ['Barely 18% of deals', 'Around 80%', '100% of every deck', 'Exactly 50% of deals'], 1,
    'Human players win ~30–40% in practice because picking the wrong face-down King or red Seven early seals hidden traps!'),

  g('ODDS', 2, 'penalty_shootout_first_kicker_60_percent_edge',
    'World Cup and Euro shootout data clocked teams kicking FIRST winning ~60%—economists traced that gap mainly to what?',
    ['Fresh penalty-spot turf', 'Goalkeeper leg cramps', 'Chasing-team stress', 'Stadium floodlight glare'], 2,
    'Shooting second means late kickers frequently step up knowing a miss ends the tournament—shrinking targets under pressure!'),

  g('ODDS', 2, 'streaming_long_tail_power_law_skew',
    'Over 100M tracks sit on music apps, yet ~1% capture ~90% of streams while millions get zero—analysts call this curve what?',
    ['Uniform flat plateau', 'Bimodal camelback wave', 'Symmetric Gaussian arch', 'Long-tail power law'], 3,
    'Unlimited digital shelf space birthed a massive "long tail" of niche tracks alongside superstar mega-concentration at the top!'),

  g('ODDS', 2, 'cardano_1564_first_gambling_odds_manual',
    'A century before Pascal and Fermat, which dice-hustling Italian polymath wrote Europe’s first book on gambling probability?',
    ['Gerolamo Cardano', 'Niccolò Machiavelli', 'Galileo of Pisa', 'Leonardo Fibonacci'], 0,
    'Cardano paid his medical tuition playing tavern dice and backgammon—keeping his winning 36-outcome math unpublished during his lifetime!'),

  g('ODDS', 2, 'astragali_ancient_sheep_knucklebone_dice',
    'Before symmetric ivory cubes, Greeks and Romans rolled sheep anklebones ("astragali") whose curved sides caused what?',
    ['Guaranteed matching pairs', 'Unequal face odds', 'Sparks on marble slabs', 'Floating tests for cheats'], 1,
    'Broad sides landed ~38% each while narrow sides hit ~12%—making rolling four distinct faces ("The Venus Throw") jackpot luck!'),

  g('ODDS', 2, 'john_graunt_1662_london_plague_life_tables',
    'Haberdasher John Graunt founded actuarial math in 1662 London by tallying parish death sheets printed to track what?',
    ['Thames ferry sinkings', 'Bakery chimney fires', 'Bubonic plague', 'Royal navy press-gangs'], 2,
    'Spotting remarkably steady ratios of births and illnesses across quiet weeks birthed modern life-insurance mortality tables!'),

  g('ODDS', 2, 'nightingale_1858_coxcomb_hospital_sanitation',
    'Florence Nightingale’s 1858 polar-area charts proved far more Crimean War troops died from unsanitary hospitals than what?',
    ['Frozen winter rations', 'Sunken supply transports', 'Friendly artillery fire', 'Battlefield wounds'], 3,
    'Her vivid blue-and-red "coxcomb" wedges proved scrubbing sewers slashed mortality 90%—earning election to the Royal Statistical Society!'),

  g('ODDS', 2, 'student_t_test_gosset_guinness_brewery_1908',
    'Why did chemist William Sealy Gosset publish statistics’ 1908 "Student’s t-test" under the anonymous pen name "Student"?',
    ['Guinness ban on names', 'Oxford barred beer funds', 'Rival journals snubbed him', 'He was nineteen years old'], 0,
    'Testing tiny batches of barley malt for Guinness in Dublin, Gosset hid trade secrets behind statistics’ most famous pseudonym!'),

  g('ODDS', 2, 'lady_tasting_tea_fisher_milk_first_8_cups',
    'Hypothesis testing (p < 0.05) began when Muriel Bristol nailed 8 of 8 cups (1 in 70) tasting whether tea or what went first?',
    ['Loose Darjeeling leaves', 'Cold dairy milk', 'Fresh Meyer lemon peel', 'Boiling copper-kettle mist'], 1,
    'Ronald Fisher designed his exact permutation test on the lawn—and Dr. Bristol calmly aced every single cup!'),

  g('ODDS', 2, 'higgs_boson_2012_five_sigma_3_5_million',
    'CERN physicists waited until 2012 data cleared "5-sigma" to announce the Higgs boson—capping fluke odds near 1 in what?',
    ['500 million runs', '50 million runs', '3.5 million', '100 million runs'], 2,
    'After earlier "3-sigma" bumps evaporated in particle colliders, physics adopted 5-sigma (~1 in 3.5M) as discovery gold standard!'),

  g('ODDS', 2, 'efrons_non_transitive_dice_buffett_gates',
    'Shown Warren Buffett’s trick dice where A beats B, B beats C, C beats D, AND D beats A, Bill Gates told Buffett to do what?',
    ['Roll all four together', 'Swap the green die out', 'Double the table stakes', 'Pick his die first'], 3,
    'Like Rock-Paper-Scissors disguised as numbered cubes, Efron’s non-transitive dice guarantee the SECOND chooser a 2-to-1 edge!'),

  g('ODDS', 2, 'penneys_game_thh_beats_hhh_seven_to_one',
    'Let a bar friend pick Heads-Heads-Heads (HHH) in coin flips—which 3-flip sequence beats HHH an astonishing 7 times in 8?',
    ['Tails-Heads-Heads', 'Heads-Tails-Heads (HTH)', 'Tails-Tails-Tails (TTT)', 'Heads-Heads-Tails (HHT)'], 0,
    'Unless flips #1–#3 start H-H-H immediately (1 in 8), ANY Tails encountered hijacks your rival’s H-H run into T-H-H first!'),

  g('ODDS', 2, 'hundred_prisoners_loop_strategy_31_percent',
    'Opening 50 of 100 drawers randomly dooms 100 prisoners—following number-pointer loops lifts ALL-survive odds above what?',
    ['12%', '31%', '75%', '90%'], 1,
    'Everyone finds their slip unless the permutation hides a cycle longer than 50—leaving a miraculous 31.18% joint escape rate!',
    { numeric: { target: 31, min: 5, max: 85, step: 1, unit: '%' } }),

  g('ODDS', 2, 'kelly_criterion_1956_bell_labs_bankroll',
    'Bell Labs’ John Kelly proved in 1956 that even with a 60/40 edge, betting 100% of bankroll ruins you—sizing optimal bets how?',
    ['Doubling after every loss', 'Fixed $100 flat chip units', 'Edge divided by odds', 'Square root of net wealth'], 2,
    'On an even-money 60/40 coin, Kelly bets 20% (0.60 - 0.40) of current bankroll—maximizing long-run compound growth!'),

  g('ODDS', 2, 'st_petersburg_paradox_bernoulli_utility_1738',
    'Double a $2 pot every coin flip until Tails: expected cash is infinite, yet Bernoulli (1738) showed folks cap bids due to what?',
    ['Counterfeit silver risk', 'Finite royal mint bullion', 'Croupier wrist fatigue', 'Diminishing utility'], 3,
    'Winning $20M instead of $10M barely changes happiness compared to your first $10k—valuing log-wealth tames the game near $20!'),

  // --- ODDS D3 (16 clues) ---
  g('ODDS', 3, 'parrondos_paradox_two_losing_games_win_1996',
    'Juan Parrondo proved in 1996 two coin games that EACH lose money solo can turn a steady profit simply by doing what?',
    ['Alternating both games', 'Playing only prime turns', 'Flipping heads for tails', 'Halving stakes at midnight'], 0,
    'Modeled on Brownian ratchets in physics, capital-dependent Game B ratchets asymmetric coin biases uphill when interleaved with Game A!'),

  g('ODDS', 3, 'boy_born_on_tuesday_13_in_27_paradox',
    '"Two kids, at least one boy" gives 1/3 for two boys—adding "born on a Tuesday" nudges two-boy odds to what fraction?',
    ['Exactly 1 in 2', '13 in 27', 'Roughly 7 in 14', 'Barely 2 in 5'], 1,
    'Two-boy families get almost TWICE as many shots at producing a Tuesday boy (13 of 27 valid grid cells = 48.1%) as boy-girl pairs!'),

  g('ODDS', 3, 'sleeping_beauty_coin_puzzle_elga_one_third',
    'Woken Monday on Heads—or Monday AND Tuesday with memory wiped on Tails—Sleeping Beauty splits "Halfers" vs what "Thirder" odds?',
    ['One-fourth odds', 'Two-fifths odds', 'One-third', 'Three-eighths odds'], 2,
    'Popularized by Adam Elga in 2000: out of three indistinguishable awakenings across long runs, only ONE occurs on Heads!'),

  g('ODDS', 3, 'two_envelopes_switching_paradox_variable_trap',
    'One envelope holds 2X the other; seeing $100 in yours, naive math (0.5×$50 + 0.5×$200 = $125) says swap—what flaw hides inside?',
    ['Ignores tax withholdings', 'Divides zero by one-half', 'Drops compound discounting', 'Equates two different Xs'], 3,
    'Before peeking, one envelope isn’t simultaneously $50 and $200 with equal prior probability across unbounded dollar amounts!'),

  g('ODDS', 3, 'german_tank_problem_serial_numbers_wwii',
    'Allied statisticians pegged Nazi tank output near 270/month—crushing spy guesses of 1,400!—reading captured gearboxes’ what?',
    ['Serial numbers', 'Bearing grease dates', 'Foundry chalk marks', 'Odometer test miles'], 0,
    'Postwar Munich factory ledgers logged 276 tanks/month—proving maximum-spacing estimators beat cloak-and-dagger espionage!'),

  g('ODDS', 3, 'laplace_rule_of_succession_sunrise_plus_two',
    'Seen an event succeed k times in n tries? Laplace’s "Rule of Succession" estimates next-try probability via what formula?',
    ['Simply k over n', '(k + 1) / (n + 2)', 'k squared over 2n', '(2k - 1) over 2n'], 1,
    'Starting from a uniform prior avoids absurd 0% or 100% certainties after a tiny sample—modern AI calls it Laplace smoothing!'),

  g('ODDS', 3, 'wald_sequential_analysis_wartime_classified',
    'Abraham Wald’s "Sequential Probability Ratio Test" saved so many WWII test shells by stopping early that Washington did what?',
    ['Put Wald on war posters', 'Patented slide-rule scales', 'Classified the math', 'Burned fixed-sample tables'], 2,
    'Checking pass/fail boundaries after EACH shell cut required test batches roughly in half—keeping Wald’s paper classified until 1945!'),

  g('ODDS', 3, 'borsuk_ulam_antipodal_earth_temp_pressure',
    'Topology’s Borsuk-Ulam Theorem guarantees right now SOME pair of opposite points on Earth shares identical temperature and what?',
    ['Wind speed and tide', 'Cloud cover and dew', 'Latitude and slope', 'Barometric pressure'], 3,
    'Map any continuous two-value weather pair from a 3D sphere onto a 2D plane and two antipodal twins MUST collide!'),

  g('ODDS', 3, 'coupon_harmonic_twelve_zodiac_cards_37_packs',
    'Collecting all 12 equally common zodiac cards in gum packs takes MORE than 12 packs—Harmonic sums average how many packs?',
    ['37 packs', '18 gum packs', '60 gum packs', '24 gum packs'], 0,
    'Card #1 arrives on Pack 1, yet hunting Card #12 alone averages 12 packs: 12 times the 12th Harmonic number ≈ 37.2 packs!',
    { numeric: { target: 37, min: 12, max: 80, step: 1, unit: 'packs' } }),

  g('ODDS', 3, 'catalan_ballot_theorem_candidate_leads_always',
    'Candidate A beats B by p votes to q—Bertrand’s 1887 Ballot Theorem proves odds A stays STRICTLY ahead all night equal what?',
    ['p over (p + q) votes', '(p - q) / (p + q)', '(p - q) squared over n', 'Half of (p - q) votes'], 1,
    'André’s mirror-reflection proof turned election-night lead counting into random-walk combinatorics’ sleekest classic!'),

  g('ODDS', 3, 'poisson_horse_kick_prussian_cavalry_bortkiewicz',
    'Bortkiewicz made Poisson’s rare-event distribution famous in 1898 fitting 20 years of Prussian army records tracking fatal what?',
    ['Cavalry saber nicks', 'Lightning tent strikes', 'Mule and horse kicks', 'Unexploded cannon duds'], 2,
    'Across 14 corps over two decades, rare fatal kicks followed Poisson’s exponential curve down to the decimal!'),

  g('ODDS', 3, 'doomsday_rule_conway_weekday_calendar_math',
    'John Horton Conway named the weekday of ANY date in two seconds flat using anchor dates (4/4, 6/6, 8/8) in what method?',
    ['Zeller’s finger abacus', 'Gauss’s Easter wheel', 'Modulo-12 knuckle rule', 'Doomsday algorithm'], 3,
    'Notice 4/4, 6/6, 8/8, 10/10, 12/12, plus Pi Day (3/14!) ALWAYS land on the exact same weekday inside any calendar year!'),

  g('ODDS', 3, 'polya_urn_rich_get_richer_reinforcement_balls',
    'Draw from an urn of 1 red and 1 blue ball, returning it PLUS one extra of that SAME color forever—red’s share settles where?',
    ['Anywhere 0 to 1 flat', 'Always snaps to 50/50', 'Hits 100% or 0% only', 'Cycles around 61.8%'], 0,
    'George Pólya’s 1923 urn stunned students: early lucky draws lock in path-dependent shares uniformly anywhere between 0% and 100%!'),

  g('ODDS', 3, 'galton_watson_surname_extinction_branching',
    'Galton and Watson founded branching-process math in 1874 after Victorian aristocrats worried about the dying out of what?',
    ['Thoroughbred derby lines', 'Family surnames', 'House of Lords quorums', 'Heirloom apple orchards'], 1,
    'Even when fathers average 1.0 sons, random zero-son generations inexorably extinguish most surnames while a few multiply!'),

  g('ODDS', 3, 'stein_paradox_baseball_shrinkage_james_stein',
    'Charles Stein stunned stats in 1956 proving you estimate three unrelated averages—batting, rain, hog weight—better how?',
    ['Dropping middle medians', 'Squaring extreme outliers', 'Shrinking to grand mean', 'Weighting odd days twice'], 2,
    'Demonstrated vividly on MLB April batting averages in 1975, James-Stein shrinkage beat individual averages on total squared error!'),

  g('ODDS', 3, 'price_is_right_big_wheel_twenty_nickel_wedges',
    'From 5 cents to $1.00 in 5-cent steps, how many equal wedges line "The Price Is Right"’s Showcase Showdown Big Wheel?',
    ['10 dollar wedges', '25 nickel wedges', '18 dollar wedges', '20 wedges'], 3,
    'Spinning first against two rivals behind you requires nerve—game theorists proved stopping below 70 cents loses more often than spinning!',
    { numeric: { target: 20, min: 10, max: 40, step: 2, unit: 'wedges' } }),
];
