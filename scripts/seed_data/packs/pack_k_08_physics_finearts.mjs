// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.0 Gold Master)
// Prime-Time Gold Pack K-08 (`scripts/seed_data/packs/pack_k_08_physics_finearts.mjs`)
// 216 Sparkling All-Era Game-Night Clues (108 PHYSICS + 108 FINE ARTS, +21 numeric)
// Crafted in the tradition of Trivial Pursuit, Millionaire, Jeopardy!, QI & YDKJ:
//   - All-Era Span: ~40% Modern/Current (2000s-2026), ~35% 1960s-90s, ~25% Timeless/History
//   - Two-path "Aha!" deduction pins, crisp Blitz stems, parallel <=28-char choices
//   - Exact [54, 54, 54, 54] A/B/C/D balance & zero corpus entity/answer collisions!
// ============================================================================

function g(category, difficulty, canonicalEntityKey, stem, choices, answerIdx, ahaFactoid, extra = {}) {
  const supportedToys = [
    'TOY_01_KNIFE_SWITCH',
    'TOY_02_CONFIDENCE_PNEUMATIC',
    'TOY_06_FUSE_WIRE_SNIPPER',
  ];
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
  // ======================== PHYSICS (108 CLUES) ========================
  g("PHYSICS", 1, "jwst_18_gold_beryllium_hex_mirrors",
    "Unfolding like cosmic origami in 2022, the James Webb Telescope catches starlight across how many gold-plated hex mirrors?",
    ["18 hex mirrors","6 giant mirrors","36 flat mirrors","64 tiny mirrors"], 0,
    "Tiny motors steer each beryllium hexagon within nanometers so all 18 segments focus together as one 21-foot eye!",
    {"numeric":{"target":18,"min":4,"max":64,"step":1,"unit":"mirrors"}}),

  g("PHYSICS", 2, "jwst_infrared_gold_reflects_red_heat",
    "Why did NASA coat James Webb’s giant mirror in three grams of pure gold rather than standard telescope silver or aluminum?",
    ["Blocks solar X-ray glare","Reflects infrared light","Stops micrometeor dents","Melts space frost away"], 1,
    "Distant galaxies stretch into infrared wavelengths, and microscopic gold reflects roughly 99% of incoming infrared light."),

  g("PHYSICS", 3, "jwst_five_layer_kapton_sunshield_tennis",
    "Sized like a tennis court to chill James Webb below -370°F, its five-layer sunshield blocks heat using sheets of what?",
    ["Woven carbon Kevlar mesh","Spun quartz fiberglass","Coated Kapton polyimide","Pressed titanium foil"], 2,
    "Hair-thin Kapton membranes bounce 600,000 times more heat away on the sunlit side than reaches the cold dark instruments."),

  g("PHYSICS", 1, "mars_ingenuity_helicopter_72_flights",
    "Built for five test hops in Mars’s thin air, NASA’s Ingenuity helicopter flew how many times before retiring in 2024?",
    ["19 short flights","42 desert flights","98 canyon flights","72 Mars flights"], 3,
    "Spinning dual carbon-fiber rotors near 2,500 RPM, four-pound Ingenuity scouted miles ahead of Perseverance for three years!",
    {"numeric":{"target":72,"min":5,"max":100,"step":1,"unit":"flights"}}),

  g("PHYSICS", 1, "mars_ingenuity_wright_flyer_muslin_swatch",
    "Taped beneath Mars helicopter Ingenuity’s solar panel sat a postage-stamp swatch of wing fabric from what historic craft?",
    ["1903 Wright Flyer","Spirit of St. Louis","Amelia’s red Vega","Chuck Yeager’s X-1"], 0,
    "Carrying Kitty Hawk spruce-wing muslin linked humanity’s first powered Earth flight in 1903 to the first on another world in 2021."),

  g("PHYSICS", 1, "eht_2019_first_black_hole_photo_m87",
    "Unveiled in April 2019 like a blazing orange donut, humanity’s first direct black hole photo peered inside what galaxy?",
    ["Triangulum Spiral","Messier 87 (M87)","Whirlpool Galaxy","Large Magellanic"], 1,
    "Eight linked radio dishes turned Earth itself into a virtual telescope sharp enough to read a newspaper in New York from Paris!"),

  g("PHYSICS", 2, "eht_black_hole_data_flown_boeing_crates",
    "Why did Event Horizon Telescope scientists fly crates of hard drives on cargo jets instead of emailing raw black hole files?",
    ["Hackers jammed fiber lines","Cosmic rays wiped clouds","Jets beat internet speed","Treaties banned uploads"], 2,
    "Shipping five petabytes of raw radio recordings on Boeing 747s beat global internet transfer speeds by months—Antarctica waited for spring!"),

  g("PHYSICS", 1, "sagittarius_a_star_milky_way_black_hole",
    "In May 2022, astronomers revealed a glowing ring photo of the giant black hole anchoring our own Milky Way: which one?",
    ["Cygnus X-1 Binary","Centaurus A Core","Betelgeuse Cavity","Sagittarius A*"], 3,
    "Because Sagittarius A\" is 1,000 times smaller than M87\", hot gas swirled around it every few minutes like a squirming puppy on film."),

  g("PHYSICS", 2, "nasa_dart_2022_dimorphos_asteroid_nudge",
    "Smashing head-on into asteroid Dimorphos in 2022, NASA’s DART probe shortened its orbit by roughly how many minutes?",
    ["33 minutes","4 minutes flat","12 full minutes","85 long minutes"], 0,
    "Flying gravel recoiling off Dimorphos acted like a bonus rocket thruster—multiplying DART’s punch in humanity’s first planetary defense test!",
    {"numeric":{"target":33,"min":1,"max":90,"step":1,"unit":"minutes"}}),

  g("PHYSICS", 1, "eclipse_2024_pinhole_crescent_leaf_shadows",
    "Stand under a leafy tree during a solar eclipse like April 2024’s and tiny gaps between leaves project thousands of what?",
    ["Sharp hexagonal rings","Mini crescent suns","Violet prism rainbows","Double shadow silhouettes"], 1,
    "Every overlapping leaf gap acts as a natural pinhole camera, carpeting sidewalks in shimmering crescents before totality hits!"),

  g("PHYSICS", 2, "eclipse_bailys_beads_lunar_mountain_valleys",
    "Seconds before a total solar eclipse, \"Baily’s beads\" sparkle along the Moon’s dark rim as sunlight peeks through what?",
    ["Solar flare loops","High cirrus ice clouds","Lunar canyon valleys","Telescope lens dust"], 2,
    "Named after astronomer Francis Baily in 1836, the final solitary bead creates the dazzling \"diamond ring\" gasp overhead."),

  g("PHYSICS", 1, "cern_27km_border_tunnel_france_switzerland",
    "Buried 300 feet beneath farmland near Geneva, CERN’s 17-mile particle ring crosses the border between which nations?",
    ["Austria and Italy","Belgium and Germany","Spain and Andorra","France & Switzerland"], 3,
    "Protons lap the 27-kilometer superconducting tunnel 11,245 times every second—zipping under the Franco-Swiss border twice per lap!"),

  g("PHYSICS", 3, "nif_2022_laser_fusion_ignition_net_gain",
    "Achieving net-energy fusion ignition in December 2022, California’s NIF lab fired how many giant lasers at one tiny pellet?",
    ["192 UV lasers","24 ruby lasers","64 X-ray lasers","108 green lasers"], 0,
    "For billionths of a second inside a gold cylinder, 2.05 megajoules of laser light squeezed hydrogen isotopes into 3.15 megajoules of star power!",
    {"numeric":{"target":192,"min":12,"max":250,"step":1,"unit":"lasers"}}),

  g("PHYSICS", 1, "parker_solar_probe_fastest_human_craft",
    "Diving through the Sun’s outer corona past 430,000 mph in 2024, what NASA craft became the fastest human-made object?",
    ["New Horizons Pluto flyby","Parker Solar Probe","Juno polar orbiter","Solar Orbiter craft"], 1,
    "Fast enough to zip from New York to Tokyo in under a minute, Parker hides cool instruments behind a 4.5-inch carbon-foam shield."),

  g("PHYSICS", 1, "chandrayaan_3_india_lunar_south_pole_2023",
    "Touching down in August 2023 to scout shadowed water ice, India’s Chandrayaan-3 made history’s first soft landing near where?",
    ["Sea of Tranquility","Tycho crater rim","Lunar south pole","Lunar far-side basin"], 2,
    "Sunlight never reaches deep south-polar crater floors, preserving ancient frost future astronauts could split into rocket fuel!"),

  g("PHYSICS", 2, "osiris_rex_2023_bennu_carbon_pebbles",
    "Parachuting into Utah in September 2023, NASA’s OSIRIS-REx capsule returned carbon-rich black rubble from which asteroid?",
    ["Eros boulder belt","Vesta Dawn ridge","Ceres salt dome","Asteroid Bennu"], 3,
    "So much loose rubble flooded the collector head that engineers skipped weighing it in orbit and stowed the overflowing haul fast!"),

  g("PHYSICS", 2, "nobel_2023_attosecond_pulses_electron_film",
    "Crowned by the 2023 Physics Nobel Prize, \"attosecond\" laser flashes slice time fine enough to freeze the motion of what?",
    ["Orbiting electrons","Tectonic fault slips","Hummingbird wingtips","Splitting bacteria"], 0,
    "One attosecond is to a single second what one second is to roughly twice the entire 13.8-billion-year age of the universe!"),

  g("PHYSICS", 1, "nobel_2014_blue_led_gallium_nitride",
    "Red and green LEDs glowed for decades, yet white smartphone screens waited until 1990s physicists finally invented what LED?",
    ["Infrared heat LEDs","Bright blue LEDs","Amber sodium LEDs","Ultraviolet C LEDs"], 1,
    "Isamu Akasaki, Hiroshi Amano, and Shuji Nakamura tamed stubborn gallium nitride crystals—slashing global lighting power use!"),

  g("PHYSICS", 1, "noise_canceling_earbuds_mirror_anti_noise",
    "How do modern noise-canceling AirPods and headphones hush airplane cabin roar before it reaches your eardrum?",
    ["Thick acoustic baffle pads","Ultrasonic heat pulses","Inverted anti-noise wave","Magnetic eardrum shield"], 2,
    "Outer mics sample engine drone and play an exact upside-down pressure wave—summing crest and trough to near-zero silence!"),

  g("PHYSICS", 1, "qi_wireless_phone_charging_copper_coils",
    "Drop your phone onto a bedside wireless pad and power hops across glass without plugs via alternating magnetic what?",
    ["Static spark arcs","Piezoelectric hums","Thermal infrared rays","Inductive flux coils"], 3,
    "Michael Faraday’s 1831 law runs inside your nightstand: oscillating current in the pad’s copper coil induces current in the phone’s coil."),

  g("PHYSICS", 1, "smartphone_touchscreen_capacitive_gloves",
    "Why do thick wool winter mittens fail to swipe a smartphone screen while a bare finger—or even a hot dog—works instantly?",
    ["Skin conducts charge","Fingertips press harder","Body heat melts pixels","Fingerprints bend glass"], 0,
    "Capacitive glass projects a tiny electrostatic grid; anything water-salty and conductive sips trace charge at the touch spot!"),

  g("PHYSICS", 2, "induction_cooktop_cool_glass_eddy_currents",
    "Slip a paper towel under an iron skillet on an induction stove: eggs sizzle unburned thanks to swirling magnetic what?",
    ["Focused microwave beams","Swirling eddy currents","Friction vibration waves","Infrared plasma arcs"], 1,
    "Rapidly flipping magnetic fields stir electrical whirlpools directly inside magnetic cookware steel while ceramic glass stays cool."),

  g("PHYSICS", 2, "mri_scanner_quench_liquid_helium_boil",
    "Hospital MRI magnets stay energized 24/7 because superconducting coils work only while chilled near -452°F inside what?",
    ["Dry ice slurry tanks","Freon brine jackets","Liquid helium bath","Chilled heavy water"], 2,
    "Never carry steel scissors near an MRI room—its magnetic tug outmuscles Earth’s natural magnetic field by roughly 30,000 times!"),

  g("PHYSICS", 1, "starlink_low_earth_orbit_latency_advantage",
    "Why does low-Earth Starlink internet feel snappier on video calls than classic TV satellites parked 22,236 miles high?",
    ["Uses faster X-ray beams","Skips Earth’s ionosphere","Runs thicker gold dishes","Orbits 60x closer down"], 3,
    "Even at light speed, a round-trip radio hop to 22,236 miles adds half a second of lag; orbiting 340 miles up trims lag to ~25 milliseconds."),

  g("PHYSICS", 1, "may_2024_g5_aurora_coronal_mass_ejection",
    "Painting pink auroras down to Florida in May 2024, extreme solar storms erupt when the Sun hurls billion-ton clouds of what?",
    ["Magnetized plasma","Frozen comet gravel","Dark matter wisps","Liquid iron droplets"], 0,
    "Earth’s magnetic shield funnels solar storm particles toward the poles, making high-altitude nitrogen and oxygen glow like neon tubes."),

  g("PHYSICS", 1, "f1_drs_rear_wing_flap_cuts_straight_drag",
    "Formula 1 drivers hit \"DRS\" on straightaways to pop their rear wing open—trading corner downforce for reduced what?",
    ["Tire rubber heat","Aerodynamic drag","Engine exhaust backflow","Brake caliper fade"], 1,
    "Flattening the rear wing sheds sticky turbulent drag and adds 10–15 mph of passing speed before snapping shut under braking!"),

  g("PHYSICS", 2, "pickleball_40_holes_whiffle_drag_brake",
    "Regulation outdoor pickleballs tame fierce smashes into playable rallies using how many precision-drilled aerodynamic holes?",
    ["18 wide vent holes","26 indoor holes","40 round holes","64 micro-drilled holes"], 2,
    "Indoor pickleballs use 26 larger holes while windy outdoor balls drill 40 smaller holes so gusts push shots sideways less!",
    {"numeric":{"target":40,"min":12,"max":64,"step":1,"unit":"holes"}}),

  g("PHYSICS", 1, "wind_turbine_three_blades_betz_balance",
    "Two blades wobble in gusts and four add costly drag—so modern utility wind turbines standardize on how many blades?",
    ["5 curved blades","6 narrow blades","2 wide blades","3 sleek blades"], 3,
    "Three-bladed rotors balance gyroscopic forces smoothly as nacelles pivot into shifting winds while capturing near-peak wind energy.",
    {"numeric":{"target":3,"min":1,"max":8,"step":1,"unit":"blades"}}),

  g("PHYSICS", 1, "graphene_2004_scotch_tape_nobel_peel",
    "Physicists won a 2010 Nobel Prize after isolating one-atom-thick \"graphene\" from ordinary pencil lead using a roll of what?",
    ["Sticky Scotch tape","Surgical silk gauze","Static cling film","Waxed butcher paper"], 0,
    "Folding sticky tape repeatedly over graphite flakes during a Friday-night lab whim revealed history’s strongest 2D carbon sheet!"),

  g("PHYSICS", 2, "gw170817_neutron_star_crash_forges_gold",
    "When two neutron stars collided in 2017, telescope flashes confirmed such cosmic kilonova crashes forge heavy what?",
    ["Hydrogen fuel clouds","Gold and platinum","Pure silicon sand","Lithium salt crusts"], 1,
    "That gold wedding band on your finger likely formed billions of years ago inside dead stars smashing together at a third of light speed!"),

  g("PHYSICS", 2, "perseverance_moxie_mars_co2_to_oxygen",
    "Aboard Mars rover Perseverance since 2021, a toaster-sized box called MOXIE brewed breathable oxygen straight from what?",
    ["Crushed red rust dust","Subsurface brine ice","Thin Martian CO2 air","Solar wind protons"], 2,
    "Splitting carbon dioxide at 1,470°F yielded enough clean oxygen to keep a small dog breathing—proving astronauts can \"live off the land\"!"),

  g("PHYSICS", 3, "pyramid_void_cosmic_ray_tracks_2023",
    "Without drilling one stone, physicists mapped a hidden corridor inside Giza’s Great Pyramid by counting subatomic what?",
    ["Deep seismic echoes","Neutron decay sparks","Thermal infrared leaks","Cosmic-ray tracks"], 3,
    "High-energy particles raining constantly from deep space pass easier through hollow chambers than solid limestone—like a giant X-ray!"),

  g("PHYSICS", 1, "quantum_entanglement_2022_nobel_spooky_bell",
    "Einstein called it \"spooky action at a distance,\" yet the 2022 Physics Nobel proved distant twin particles share instant what?",
    ["Quantum entanglement","Thermal equilibrium","Gravitational lensing","Magnetic induction"], 0,
    "Alain Aspect, John Clauser, and Anton Zeilinger closed every loophole, paving the road for unhackable quantum encryption."),

  g("PHYSICS", 1, "oled_phone_pixels_true_black_switched_off",
    "Why does switching your phone apps to pure black \"Dark Mode\" save real battery power on OLED screens but not older LCDs?",
    ["Black blocks Wi-Fi drain","Black pixels switch off","Dark glass cools chips","Blue subpixels double up"], 1,
    "LCD backlights glow full-time behind shuttered crystals, whereas every individual OLED pixel generates its own light and naps on black!"),

  g("PHYSICS", 2, "e_ink_kindle_microcapsules_pigment_beads",
    "How can an e-reader hold a crisp page of book text in bright beach sunshine for weeks while drawing zero battery power?",
    ["Solar ink recharges it","UV light freezes pixels","Charged ink beads lock","Mirrors trap noon glare"], 2,
    "Bistable microcapsules pull black carbon or white titanium beads to the surface once, where they stay parked until the next page turn!"),

  g("PHYSICS", 1, "water_bottle_flip_2016_one_third_full_spin",
    "Schoolyard \"water bottle flips\" stick upright landings best around one-third full because sloshing water brakes what?",
    ["Gravity’s downward pull","Air drag under the cap","Plastic bounce recoil","Rotational spin rate"], 3,
    "As water spreads along the bottle mid-arc, its moment of inertia jumps—braking the spin like a skater extending both arms so it drops flat!"),

  g("PHYSICS", 2, "spacex_booster_return_double_sonic_boom",
    "Why do SpaceX Falcon 9 and Super Heavy boosters announce every landing with a rapid \"crack-CRACK!\" double sonic boom?",
    ["Nose & tail shockwaves","Twin fuel valves venting","Echo off ocean swells","Engines relighting twice"], 0,
    "Any long supersonic cylinder pushes air aside at its leading tip and snaps air back together behind its tail—firing two distinct booms!"),

  g("PHYSICS", 3, "vera_rubin_observatory_3200_megapixel_cam",
    "Perched atop Chile’s Cerro Pachón for 2020s sky movies, the SUV-sized Vera Rubin camera shoots night skies at what scale?",
    ["400 megapixels wide","3,200 megapixels","850 megapixels sharp","12,000 megapixels"], 1,
    "Displaying just ONE full Rubin sky frame at native clarity requires 378 ultra-high-definition 4K televisions tiled wall to wall!"),

  g("PHYSICS", 3, "superfluid_helium_climbs_beaker_walls",
    "Chill liquid Helium-4 two degrees above absolute zero and zero viscosity lets the quantum \"superfluid\" defy containers how?",
    ["Turns solid as diamond","Flashes bright violet","Creeps up glass walls","Repels nearby magnets"], 2,
    "Frictionless Rollin films climb straight up the inside of an open beaker and drip steadily off the bottom until the cup empties!"),

  g("PHYSICS", 3, "schumann_resonance_earth_lightning_hum",
    "Roughly 50 lightning bolts strike Earth each second, ringing our sky-to-ground shell like a bass bell near what pitch?",
    ["60.0 Hertz power hum","440 Hertz concert A","24.5 Hertz ocean pulse","7.83 Hertz Earth hum"], 3,
    "Predicted by Winfried Otto Schumann in 1952, the fundamental wave circles Earth’s 25,000-mile circumference ~7.8 times per second."),

  g("PHYSICS", 1, "europa_clipper_2024_subsurface_salty_ocean",
    "Launched in October 2024, NASA’s Clipper probe carries ice-penetrating radar to scout a hidden ocean inside which moon?",
    ["Icy moon Europa","Cratered Callisto","Dusty moon Deimos","Retrograde Triton"], 0,
    "Jupiter’s tidal tug kneads Europa’s interior warm, keeping twice as much liquid saltwater sloshing beneath its ice as all Earth’s seas!"),

  g("PHYSICS", 2, "aerogel_frozen_smoke_99_percent_air",
    "NASA’s Stardust probe caught fast comet dust intact inside ghostly \"frozen smoke\" aerogel blocks made of 99.8% what?",
    ["Spun helium bubbles","Trapped air pockets","Frozen nitrogen mist","Hollow carbon rings"], 1,
    "Replace liquid inside silica gel with gas and a brick-sized sponge left behind weighs less than two marshmallows yet blocks blowtorch heat!"),

  g("PHYSICS", 3, "time_crystal_perpetual_quantum_beat_2021",
    "Proposed by Frank Wilczek and built inside 2020s quantum chips, what exotic phase repeats patterns across ticks of time?",
    ["A Dirac spin-liquid web","A Fermi pasta lattice","A quantum time crystal","A Wigner electron ice"], 2,
    "Ordinary salt or quartz crystals repeat atoms neatly in space; time crystals flip spins rhythmically without absorbing heating energy!"),

  g("PHYSICS", 2, "jwst_lagrange_million_miles_beyond_moon",
    "Why could spacewalkers repair Hubble in the 1990s, whereas James Webb had to unfold flawlessly on its own in 2022?",
    ["Spins at 400 RPM nonstop","Flies inside Venus’s path","Carries toxic hydrazine","Orbits 1M miles away"], 3,
    "Hubble circles 340 miles up, while Webb parks nearly four times farther out than the Moon to keep Sun, Earth, and Moon behind one shield!"),

  g("PHYSICS", 1, "apollo_15_david_scott_falcon_feather_hammer",
    "Live on lunar TV in 1971, Apollo 15’s David Scott proved Galileo right in vacuum by dropping a hammer beside what?",
    ["A falcon feather","A golf scorecard","A silver dime coin","A crumpled foil wrap"], 0,
    "Named after the Air Force Academy’s mascot, the \"Falcon\" lunar module’s matching feather hit the dusty regolith dead-even with the hammer!"),

  g("PHYSICS", 2, "apollo_11_lunar_laser_retroreflector_mirrors",
    "How do astronomers prove the Moon drifts 1.5 inches away yearly using passive gear Apollo 11 left behind in 1969?",
    ["Timing radio pings back","Bouncing laser pulses","Tracking shadow creep","Weighing ocean tides"], 1,
    "Corner-cube prisms on Tranquility Base bounce observatory laser flashes straight back to Earth—timing distance down to millimeters!"),

  g("PHYSICS", 1, "feynman_challenger_1986_rubber_oring_ice_water",
    "At the 1986 Challenger hearing, physicist Richard Feynman exposed stiff cold booster seals by dunking an O-ring into what?",
    ["Boiling black coffee","Liquid nitrogen vapor","A cup of ice water","Salty vinegar brine"], 2,
    "Clamping rubber in his own glass of 32°F ice water showed millions instantly why launch-morning frost robbed the seal of springiness."),

  g("PHYSICS", 1, "hubble_1993_costar_corrective_eyeglasses",
    "After a misground mirror blurred Hubble’s 1990 debut, NASA spacewalkers fixed its sharp vision in 1993 with corrective what?",
    ["Laser polishing arms","Liquid mercury pools","Diamond scraper blades","Relay mirror glasses"], 3,
    "Ground off by just 1/50th the thickness of a human hair, Hubble’s flaw vanished the night COSTAR’s coin-sized mirrors clicked in!"),

  g("PHYSICS", 2, "chernobyl_cherenkov_eerie_blue_water_glow",
    "Submerged nuclear reactor cores glow haunting electric blue because speeding electrons outrun the local speed of light inside water—creating what?",
    ["Cherenkov radiation","Compton X-ray scatter","Rabi spin fluorescence","Zeeman spectral arcs"], 0,
    "Nothing beats \"c\" in a vacuum, yet light slows to 75% inside water—so faster beta particles kick up an optical \"sonic boom\" in blue!"),

  g("PHYSICS", 2, "jocelyn_bell_burnell_1967_spinning_pulsars",
    "Spotting clockwork radio blips every 1.33 seconds as a grad student in 1967, Jocelyn Bell Burnell discovered spinning what?",
    ["Binary white dwarfs","Radio pulsars","Solar wind shockwaves","Gamma-ray blazars"], 1,
    "City-sized cores spinning faster than kitchen blenders sweep lighthouse radio beams past Earth with atomic-clock precision!"),

  g("PHYSICS", 1, "voyager_1_heliopause_interstellar_2012",
    "Launched in 1977 on a Grand Tour, which probe crossed the Sun’s magnetic bubble into interstellar space first in 2012?",
    ["Pioneer 10 plaque ship","Cassini Saturn craft","Voyager 1 probe","Mariner 10 scout"], 2,
    "Over 15 billion miles from home, Voyager 1’s radio whispers take more than 22 hours at light speed just to reach NASA dishes!"),

  g("PHYSICS", 1, "lava_lamp_1963_wax_density_expansion_dance",
    "Invented in 1963 England, a groovy Lava Lamp rises and sinks endlessly because a bottom lightbulb nudges the density of what?",
    ["Liquid mercury droplets","Dyed silicone gel","Pressurized neon gas","Colored paraffin wax"], 3,
    "Cold wax sits fractionally denser than water; bottom bulb warmth expands it just enough to float up, cool at the cap, and sink again!"),

  g("PHYSICS", 2, "concorde_mach_2_cabin_stretches_eight_inches",
    "Mach 2 air friction heated Concorde’s nose past 250°F—stretching the supersonic jet mid-flight by roughly how many inches?",
    ["8 full inches","2 tiny inches","24 long inches","48 wide inches"], 0,
    "On Concorde’s final flight, the flight engineer wedged his cap into an 8-inch cockpit bulkhead gap before landing shrunk it tight forever!",
    {"numeric":{"target":8,"min":1,"max":30,"step":1,"unit":"inches"}}),

  g("PHYSICS", 1, "slinky_dropped_bottom_hangs_in_midair",
    "Dangle a stretched metal Slinky from chest height and let go: what astonishing thing does the bottom coil do at first?",
    ["Snaps upward immediately","Hovers still in midair","Drops twice as fast","Spins clockwise hard"], 1,
    "Bad news that your fingers let go can only travel down the coils as a tension wave—until the top arrives, gravity and pull still cancel!"),

  g("PHYSICS", 3, "microwave_oven_chocolate_speed_of_light_test",
    "Remove your kitchen microwave’s spinning tray and zap a flat chocolate bar: doubling the distance between melted spots gives the wave’s what?",
    ["Peak voltage wattage","Magnetron spin rate","Full wavelength","Cavity Q resonance"], 2,
    "Multiply that full wavelength (~12 cm) by the oven’s 2.45 GHz label on back and you measure the speed of light right on toast or cocoa!"),

  g("PHYSICS", 2, "arthur_c_clarke_geostationary_belt_22236",
    "Rooftop TV dishes point at one fixed sky spot forever because satellites 22,236 miles above the equator match what period?",
    ["Moon’s 27-day sidereal lap","Half a 12-hour solar day","90-minute low ISS orbit","Earth’s 24-hour spin"], 3,
    "Proposed by sci-fi writer Arthur C. Clarke in 1945, the \"Clarke Belt\" lets weather and TV satellites hover motionless overhead."),

  g("PHYSICS", 3, "wow_signal_1977_big_ear_72_seconds",
    "Astronomer Jerry Ehman scribbled \"Wow!\" in red ink in 1977 after Ohio’s Big Ear telescope caught a narrowband blast lasting how many seconds?",
    ["72 full seconds","8 brief seconds","30 even seconds","115 long seconds"], 0,
    "Seventy-two seconds matched the exact window Earth’s spin swept Big Ear’s beam across one fixed point in Sagittarius—never heard again!",
    {"numeric":{"target":72,"min":5,"max":120,"step":1,"unit":"seconds"}}),

  g("PHYSICS", 3, "charles_kao_fiber_optic_ultrapure_glass",
    "Skeptics in 1966 laughed at sending phone calls down glass threads until Charles Kao proved light faded only because glass held trace what?",
    ["Trapped argon bubbles","Impure metal ions","Crystalline salt veins","Static surface dust"], 1,
    "Purifying silica so clear you could peer cleanly through miles of windowpane won Kao the 2009 Nobel Prize and wired the global internet."),

  g("PHYSICS", 1, "stephen_hawking_1988_brief_history_of_time",
    "Warned that equations halve book sales, Stephen Hawking kept just E=mc² and sold millions of what 1988 cosmic classic?",
    ["Cosmos & Distant Starlight","The Elegant String Universe","A Brief History of Time","Six Easy Physics Pieces"], 2,
    "Spending a record 237 weeks atop London bestseller charts, it turned event horizons and imaginary time into coffee-table conversation."),

  g("PHYSICS", 2, "f117_stealth_faceted_flat_angles_scatter_radar",
    "1980s F-117 Nighthawk stealth jets looked like faceted black diamonds because flat angled panels did what to radar beams?",
    ["Turned beams into heat","Bent waves behind wings","Cancelled wave phase out","Deflected pings away"], 3,
    "1970s Skunk Works computers couldn’t yet solve curved radar math, so engineers tiled flat facets that bounced radar everywhere EXCEPT back!"),

  g("PHYSICS", 2, "polaroid_rainbow_polarization_stress_plastic",
    "Sandwich a clear plastic cafeteria fork between two polarized lenses and vivid rainbow bands map out where the plastic hides internal what?",
    ["Mechanical stress","Leftover static charge","Microscopic air pores","Uncured monomer oil"], 0,
    "Engineers carved clear plastic bridge models and viewed them under polarized filters to spot dangerous stress hotspots before pouring steel!"),

  g("PHYSICS", 3, "rubber_band_heated_shrinks_polymer_entropy",
    "Hang a coffee mug from a taut rubber band and warm the band with a hairdryer: unlike steel wire, polymer entropy makes rubber do what?",
    ["Stretch two inches down","Pull the mug upward","Snap cleanly in half","Twist counterclockwise"], 1,
    "Heat jiggles stretched polymer chains into tangled random coils—making warmed rubber contract forcefully instead of expanding!"),

  g("PHYSICS", 2, "carl_sagan_golden_record_uranium_clock",
    "Electroplated onto Voyager’s 1977 Golden Record cover, ultra-pure Uranium-238 lets alien finders date the launch using its steady what?",
    ["Magnetic polar reversal","Crystal lattice sagging","Radioactive half-life","Solar wind surface pits"], 2,
    "With a 4.47-billion-year half-life decaying into lead, that tiny smudge works as a cosmic stopwatch accurate across eons!"),

  g("PHYSICS", 1, "doppler_hook_echo_spinning_tornado_radar",
    "TV meteorologists sound tornado warnings the moment weather radar paints a coiled rainband signature shaped unmistakably like what?",
    ["A three-leaf clover","A sharp lightning bolt","An inverted triangle","A curved fishhook"], 3,
    "First photographed by Illinois radar in 1953, a \"hook echo\" forms as violent rotating winds wrap rain and hail around a mesocyclone."),

  g("PHYSICS", 2, "laser_acronym_stimulated_emission_1960",
    "Theodore Maiman fired the first ruby \"LASER\" in 1960 Malibu—what word does the letter \"S\" stand for in that acronym?",
    ["Stimulated","Synchronized","Superheated","Subatomic"], 0,
    "Predicted by Einstein in 1917, \"Stimulated\" Emission lets one passing photon clone an identical twin marching in lockstep phase!"),

  g("PHYSICS", 2, "drinking_bird_desk_toy_evaporative_head",
    "What simple classroom physics keeps a retro felt-beaked \"Drinking Bird\" desk toy dipping endlessly into a glass of water?",
    ["Capillary siphon pull","Evaporative cooling","Static glass attraction","Barometric air swings"], 1,
    "Water evaporating off the wet fuzzy beak chills inner vapor, lowering head pressure so colored bottom fluid climbs the neck and tips it!"),

  g("PHYSICS", 2, "super_soaker_lonnie_johnson_heat_pump_nozzle",
    "NASA engineer Lonnie Johnson invented 1989’s blockbuster Super Soaker squirt gun at home while testing a high-pressure nozzle for what?",
    ["A Mars soil drill","A jet fuel injector","An eco heat pump","A firehose mist valve"], 2,
    "Blasting a stream clean across his bathroom convinced Johnson a compressed-air water toy beat holiday lab paperwork hands down!"),

  g("PHYSICS", 1, "newton_cradle_desk_spheres_conservation_pair",
    "Swing TWO steel balls into a five-ball executive \"Newton’s Cradle\"—why don’t one ball pop out twice as fast instead of two?",
    ["Air drag caps top speed","Strings absorb half force","Steel magnetizes on impact","Breaks kinetic energy law"], 3,
    "One ball at double speed would match momentum (2mv), yet carry FOUR times the kinetic energy (½m(2v)²)—so nature pops out two!"),

  g("PHYSICS", 1, "maglev_train_eddy_repulsion_zero_wheel_friction",
    "Floating above guideways past 370 mph in Japan, Maglev bullet trains erase wheel rolling friction completely using what?",
    ["Superconducting magnets","Pressurized hovercraft pads","Spinning gyroscopic wheels","Helium ballast bladders"], 0,
    "Once magnetic coils lift the train off rubber tires around 90 mph, aerodynamic air drag is virtually the lone force fighting forward speed."),

  g("PHYSICS", 1, "lcd_calculator_twisted_liquid_crystals_1970s",
    "1970s pocket calculators ran for years on tiny coin batteries because black LCD digits don’t emit light—they block room light using what?",
    ["Magnetic iron filings","Twisted liquid crystals","Bimetallic shutter strips","Electrochromic soot dye"], 1,
    "Tiny voltages untwist rod-shaped liquid crystals between crossed polarizers, turning bright mirror segments dark grey for micro-amps!"),

  g("PHYSICS", 2, "cosmic_hiss_1964_pigeon_droppings_horn_antenna",
    "Penzias and Wilson confirmed the Big Bang’s faint microwave hiss in 1964 only after scrubbing their New Jersey radio horn clean of what?",
    ["Salty Atlantic sea spray","Rusty copper verdigris","Warm pigeon droppings","Dead cicada shells"], 2,
    "Calling it \"white dielectric material\" in papers, they relocated the nesting pigeons—yet the 2.7-Kelvin cosmic glow echoed from every sky spot!"),

  g("PHYSICS", 2, "space_shuttle_black_silica_tiles_cool_edges",
    "Pulled glowing white-hot from a 2,200°F oven, a Space Shuttle belly tile can be held bare-handed by its edges because silica fibers do what?",
    ["Sweat cooling freon gas","Reflect finger heat away","Conduct heat terribly","Freeze outer room air"], 3,
    "Ninety percent air trapped in pure sand fibers sheds surface heat fast while blocking interior warmth from creeping half an inch to your thumb!"),

  g("PHYSICS", 2, "sonic_boom_continuous_mach_cone_carpet",
    "Movies imply a jet booms only once as it crosses Mach 1; in reality, a supersonic plane drags its sonic boom how?",
    ["Nonstop along its path","Only when banking sharp","Once every ten miles","Solely during dive pullup"], 0,
    "Like a speedboat’s continuous V-wake slapping every dock it passes, a supersonic shock cone sweeps a \"boom carpet\" across everyone below!"),

  g("PHYSICS", 2, "bar_code_laser_reads_white_gaps_not_black",
    "Supermarket scanners introduced in 1974 actually decode the bright laser light bouncing back off a barcode’s what?",
    ["Outer guard numbers","White spaces between","Glossy plastic wrapper","Magnetic black ink"], 1,
    "Black stripes swallow red laser light while bright white gaps bounce pulses back into a photodiode as binary ones and zeroes!"),

  g("PHYSICS", 2, "quartz_wristwatch_32768_tuning_fork_crystal",
    "Inside a classic Quartz watch, battery power pings a tiny crystal tuning fork 32,768 (2¹⁵) times per second—halved 15 times to mark what?",
    ["One full 60-minute hour","One 1/100th split second","One exact 1-second tick","One 12-hour dial sweep"], 2,
    "Seiko’s 1969 Astron unleashed piezoelectric quartz timekeeping accurate within seconds a month—upending Swiss mechanical watchmaking."),

  g("PHYSICS", 1, "vomit_comet_parabolic_dive_weightlessness",
    "How do NASA’s \"Vomit Comet\" airplanes give trainees 25-second stretches of true weightlessness just six miles above Texas?",
    ["Pumping cabin air out","Switching floor magnets on","Spinning barrel rolls","Flying parabolic arcs"], 3,
    "Cresting a steep climb and arcing downward in controlled freefall lets passengers float right alongside the surrounding cabin walls!"),

  g("PHYSICS", 3, "smoke_ring_toroidal_vortex_air_cannon",
    "Thump the back of a trash-can air cannon and an invisible spinning ring of air blows out candles 30 feet away: what shape holds it together?",
    ["Toroidal air vortex","Spherical pressure wave","Helical corkscrew jet","Laminar parabolic cone"], 0,
    "Air curling tightly around a closed donut loop shields itself from surrounding drag—the exact trick dolphins use blowing underwater bubble rings!"),

  g("PHYSICS", 1, "mood_ring_1975_thermotropic_finger_warmth",
    "1975’s smash-fad \"Mood Rings\" promised to reveal passion or stress, though their liquid-crystal stones shifted color solely from what?",
    ["Skin sweat saltiness","Fingertip temperature","Arterial pulse pressure","Static wool sweater rub"], 1,
    "Cozy relaxed hands pump warm blood to fingertips (twisting crystals sapphire blue), while cold or anxious hands chill them dark amber-black."),

  g("PHYSICS", 2, "solar_sail_sunlight_photon_momentum_push",
    "Though photons have zero rest mass, probes like Japan’s IKAROS unfurl mirror sails pushed gently forward by what?",
    ["Galactic cosmic ray wind","Planetary magnetic lines","Sunlight momentum push","Electrostatic dust push"], 2,
    "Light carries momentum (p = E/c)—bouncing trillions of photons off a reflective sail yields tiny, fuel-free acceleration 24 hours a day!"),

  g("PHYSICS", 3, "helium_voice_throat_timbre_not_cord_pitch",
    "Inhaling party-balloon helium makes you sound like a cartoon chipmunk NOT because vocal cords vibrate faster, but because lighter gas shifts what?",
    ["Inner eardrum air pressure","Lung diaphragm rebounding","Lip whistle air vortices","Vocal tract resonances"], 3,
    "Sound races nearly 3x faster through light helium, boosting high overtone frequencies in your throat while your base cord pitch stays put!"),

  g("PHYSICS", 1, "helium_balloon_minivan_accelerates_forward",
    "Floor the gas in a closed minivan and riders press back into seats—which way does a floating party helium balloon tilt?",
    ["Tilts straight forward","Swings toward rear window","Drops flat onto carpet","Hangs plumb vertical"], 0,
    "Heavy cabin air sloshes toward the rear bumper like water in a pan, crowding out lighter helium and shoving the balloon toward the windshield!"),

  g("PHYSICS", 2, "hot_water_pour_pitch_lower_viscosity",
    "Close your eyes while someone pours boiling water versus iced water into identical mugs: you hear the difference instantly because heat lowers what?",
    ["Mug porcelain ring","Water’s viscosity","Dissolved oxygen fizz","Room air humidity"], 1,
    "Hot water is five times less viscous (runnier) than icy water, splashing larger air bubbles that thrum with a noticeably deeper bass gurgle!"),

  g("PHYSICS", 1, "toast_butter_side_down_table_height_flip",
    "Physicists won an Ig Nobel proving dropped breakfast toast lands butter-side down mostly because waist-high kitchen tables allow only what?",
    ["Butter’s extra weight","Updrafts off linoleum","Half a spin to floor","Crust aerodynamic lift"], 2,
    "Sliding off a 30-inch table sets toast rotating at a rate tied to Earth’s gravity & human height—raise tables to 10 feet and it lands butter-up!"),

  g("PHYSICS", 2, "stars_twinkle_planets_steady_disk_turbulence",
    "Look up tonight: distant stars twinkle constantly while Venus and Mars shine rock-steady because planets appear through air as tiny what?",
    ["Polarized light rings","Infrared heat beacons","Reflected UV beams","Multi-ray disks"], 3,
    "Starlight arrives as a single razor-thin ray easily jittered by warm air pockets, whereas a planet’s wider disk averages atmospheric shimmer out!"),

  g("PHYSICS", 1, "moon_horizon_illusion_outstretched_pinky_test",
    "A harvest Moon looks huge above trees, yet your outstretched pinky nail still covers all 0.5° of it—proving the giant Moon is what?",
    ["A brain visual illusion","Humid air lens zooming","Elliptical orbit perigee","Dusk horizon light bend"], 0,
    "Snap a photo at moonrise and midnight with the same zoom lens: both Moons measure the exact same pixel width (actually 1.5% wider overhead!)."),

  g("PHYSICS", 2, "golf_ball_dimples_cut_wake_drag_half",
    "Smooth golf balls fly barely half as far as dimpled ones! Tour golf balls shrink low-pressure wake drag using roughly how many dimples?",
    ["84 deep saucer dimples","336 round dimples","120 hexagonal dimples","720 pinpoint dimples"], 1,
    "Early golfers noticed nicked, scuffed gutta-percha balls flew much farther than brand-new smooth ones—sparking dimple aerodynamics!",
    {"numeric":{"target":336,"min":80,"max":600,"step":2,"unit":"dimples"}}),

  g("PHYSICS", 1, "knuckle_pop_joint_fluid_cavitation_bubble",
    "Real-time MRI scans settled an old debate: cracking your knuckles makes its sharp \"pop!\" when stretching joint fluid forms a sudden what?",
    ["Tendon snap over bone","Cartilage static spark","Gas cavity bubble","Ligament suction seal"], 2,
    "Dissolved gas flashes into a microscopic vacuum cavity inside synovial fluid—requiring ~20 minutes to redissolve before you can pop again!"),

  g("PHYSICS", 2, "cheerios_effect_cereal_clumps_meniscus_bowl",
    "Why do the last lonely oat O’s in a cereal bowl drift together and cling to the spoon—a quirk physicists dub the \"Cheerios effect\"?",
    ["Static sugar glaze cling","Warm milk thermal swirls","Tiny bowl Coriolis spin","Curved milk meniscus"], 3,
    "Buoyant cereal dimples milk upward slightly; sliding up a neighbor’s sloped liquid meniscus lowers energy just like bubbles rafting together!"),

  g("PHYSICS", 2, "wet_shirt_spot_looks_darker_internal_bounce",
    "Splash clear water onto light-gray khaki shorts and the wet spot looks charcoal dark—why does damp cloth send less light back to your eyes?",
    ["Water traps bouncing rays","Wet cotton swells opaque","Tap minerals stain threads","Evaporative chill dims it"], 0,
    "Dry fibers scatter white light outward right away; thin water films bend light deeper into threads via internal reflection to get absorbed!"),

  g("PHYSICS", 2, "shower_curtain_billows_inward_vortex_drop",
    "Turn on a brisk shower and the vinyl curtain creeps \"inward\" against your legs—pulled by rising steam and a spinning low-pressure what?",
    ["Drain suction vacuum","Horizontal air vortex","Static water-drop pull","Cold tile condensation"], 1,
    "Fluid dynamicist David Schmidt modeled sprays in 2001, finding falling droplets spin a mini sideways hurricane eye that sucks curtains in!"),

  g("PHYSICS", 3, "anders_celsius_upside_down_1742_thermometer",
    "When Swedish astronomer Anders Celsius built his 100-degree thermometer in 1742, what surprising number marked boiling water?",
    ["212 degrees top","50 degrees mid","0 degrees boil","373 degrees hot"], 2,
    "Celsius put 0° at boiling and 100° at freezing to avoid minus signs in Swedish winters—botanist Carl Linnaeus flipped it right-side up!",
    {"numeric":{"target":0,"min":0,"max":100,"step":1,"unit":"degrees"}}),

  g("PHYSICS", 3, "ole_romer_1676_jupiter_io_light_delay",
    "Proving in 1676 that light has a finite speed, Danish astronomer Ole Rømer noticed eclipses ran minutes late when Earth moved away from Jupiter’s moon what?",
    ["Cratered Ganymede","Ringing Amalthea","Distant Sinope","Volcanic moon Io"], 3,
    "Clockwork Io ducked behind Jupiter ~16 minutes later from Earth’s far side of the Sun—letting Huygens estimate light near 131,000 miles/sec!"),

  g("PHYSICS", 1, "rutherford_1909_gold_foil_empty_space_atom",
    "Shocked when rare particles ricocheted straight backward off tissue-thin gold foil, Ernest Rutherford deduced that every atom is mostly what?",
    ["Vast empty space","Solid positive jelly","Swirling ether rings","Packed neutron shells"], 0,
    "Rutherford marveled it was like firing a 15-inch naval shell at tissue paper and watching it bounce right back at you!"),

  g("PHYSICS", 2, "henry_cavendish_1798_torsion_weighing_earth",
    "Peering through a spyglass into a sealed garden shed in 1798 as lead balls twisted a thin wire, shy Henry Cavendish famously \"weighed\" what?",
    ["Sunlight’s pressure","Planet Earth itself","One cubic mile of air","Halley’s passing comet"], 1,
    "Measuring the tiny gravitational tug between lead spheres nailed Earth’s density within 1% of modern satellite figures!"),

  g("PHYSICS", 1, "whispering_gallery_st_pauls_curved_dome_wall",
    "Whisper softly into the stone walkway high inside St. Paul’s Cathedral and a friend 100 feet across hears clearly because sound skims what?",
    ["Suspended bronze bells","Polished marble floor slabs","Curved circular walls","Hollow lead organ pipes"], 2,
    "Lord Rayleigh explained in 1878 how sound waves creep smoothly around concave stone curves via repeated shallow reflections without spreading out."),

  g("PHYSICS", 3, "ice_skating_blade_premelted_quasi_liquid_film",
    "Skate pressure alone cannot melt cold rink ice—physicists proved ice stays slippery because surface H2O molecules always form what?",
    ["Static air cushions","Hexagonal frost spikes","Dry vapor pockets","Quasi-liquid film"], 3,
    "Missing neighbors above them, top water molecules jiggle loosely like microscopic ball bearings even well below freezing—amplified by frictional heat!"),

  g("PHYSICS", 1, "sunset_crimson_long_atmosphere_slant_path",
    "High-noon sunshine looks white-gold while sunsets blaze fiery tangerine because horizon sunbeams travel through roughly ten times more what?",
    ["Atmosphere thickness","Warm ocean salt haze","Van Allen dust belts","Upper ozone curvature"], 0,
    "Air molecules scatter short blue and green wavelengths sideways all along that long slant path, leaving warm reds and oranges to reach your eyes."),

  g("PHYSICS", 1, "magnifying_glass_ant_focal_converging_lens",
    "Why can a pocket magnifying glass focus noon sunshine into a hot pinpoint while nearsighted eyeglass lenses spread sunbeams harmlessly out?",
    ["Pure quartz traps UV rays","Convex lenses converge","Thick brass rims block air","Heavy flint glass heats"], 1,
    "Bulging outward in the center (\"convex\"), a magnifier bends parallel sunbeams inward to meet at one bright focal spot."),

  g("PHYSICS", 1, "baseball_sweet_spot_node_zero_sting_bat",
    "Connect squarely on a baseball bat’s \"sweet spot\" six inches from the barrel end and your hands feel zero sting because you struck a vibrational what?",
    ["Center of gravity","Wood grain spiral","Quiet wave node","Hollow core pocket"], 2,
    "Impact right on the bat’s fundamental bending node wastes zero energy shaking the handle—putting maximum pop straight into the ball!"),

  g("PHYSICS", 2, "pendulum_clock_period_length_not_bob_weight",
    "Swap a grandfather clock’s brass pendulum bob for one twice as heavy at the exact same rod length—what happens to its tick-tock speed?",
    ["Ticks twice as rapidly","Slows down by half speed","Gains ten minutes daily","Stays the exact same"], 3,
    "Just like Galileo’s falling balls, twice the mass feels twice gravity’s pull yet resists acceleration twice as hard—canceling mass out cleanly!"),

  g("PHYSICS", 2, "double_rainbow_outer_arc_reversed_colors",
    "Spot a faint second rainbow glowing outside a bright primary arc: two bounces inside raindrops flip the outer bow so red sits where?",
    ["On the inner bottom","Along the outer top rim","Twisted down the center","Split equally at ends"], 0,
    "Primary rainbows put red on top (ROYGBIV downward); the double-reflected secondary bow reverses into VIBGYOR across dark Alexander’s band!"),

  g("PHYSICS", 1, "tesla_vs_edison_transformers_ac_long_grid",
    "Why did Tesla and Westinghouse’s alternating current win the 1890s \"War of the Currents\" over Edison’s direct current for power grids?",
    ["AC copper wires stay cool","Transformers step AC up","DC fails inside filaments","AC electrons move faster"], 1,
    "Stepping AC up to hundreds of kilovolts slashes line-current heat losses across states before neighborhood pole transformers step it safely down!"),

  g("PHYSICS", 3, "pressure_straw_limit_34_feet_vacuum_ceiling",
    "Even the strongest vacuum pump at sea level cannot suck water up a vertical straw higher than roughly how many feet?",
    ["12 vertical pipe feet","68 vertical pipe feet","34 vertical feet","95 vertical pipe feet"], 2,
    "Suction doesn’t pull—outside air \"pushes\" (14.7 psi)! Above 34 feet, water’s column weight equals air pressure and boils into vacuum at top.",
    {"numeric":{"target":34,"min":5,"max":100,"step":1,"unit":"feet"}}),

  g("PHYSICS", 2, "compass_north_magnetic_pole_actually_south",
    "Since opposite magnetic poles attract, the magnetic pole sitting up in Earth’s Arctic that pulls your compass’s \"N\" needle is physically what?",
    ["Pure electric positive","Spinning neutral iron","Alternating polarity","A magnetic south pole"], 3,
    "Early navigators named the needle tip \"north-seeking pole\" (N)—meaning Earth’s geographic north houses a magnetic \"south\" pole!"),

  g("PHYSICS", 1, "spinning_raw_vs_hardboiled_egg_kitchen_test",
    "Spin a mystery egg on the counter, tap a finger briefly on top to stop it, and let go immediately: if it starts spinning again, what’s inside?",
    ["Sloshing raw yolk","Solid hardboiled white","A double-shell twin","A hollow air pocket"], 0,
    "Stopping the shell leaves liquid raw yolk swirling inside by inertia—once you lift your finger, internal drag spins the whole egg right back up!"),

  g("PHYSICS", 3, "bicycle_spoke_tension_hangs_from_top_rim",
    "Wire bicycle spokes buckle instantly if pushed—so a rider’s weight on a spoked bike wheel actually hangs suspended from taut spokes where?",
    ["Pushing up from bottom","Pulling from top rim","Bracing left & right","Twisting at hub gears"], 1,
    "Bottom spokes slacken slightly over pavement while the stiff rim transfers your load overhead so the axle literally hangs from the top arch!"),

  g("PHYSICS", 1, "jwst_pillars_of_creation_pierces_dust",
    "Why can the James Webb Telescope peer straight through cosmic dust clouds that hid newborn stars from Hubble?",
    ["Radio waves bend dust","X-rays burn dust away","Infrared pierces dust","Gamma rays melt gas"], 2,
    "Tiny dust grains scatter short visible blue light like fog, while longer infrared waves slip cleanly past to reveal infant stars!"),

  g("PHYSICS", 1, "perseverance_rover_2021_sky_crane_cables",
    "Too heavy for bounce airbags in 2021, how did NASA’s SUV-sized Perseverance rover touch down softly on Mars?",
    ["Giant cork crush pads","Belly-flop foam sleds","Inflatable helium skirt","Lowered on sky-crane cables"], 3,
    "Hovering on eight rocket thrusters, the Sky Crane winched Perseverance down on 25-foot nylon bridles, snipped them, and flew clear!"),

  // ======================== FINE ARTS (108 CLUES) ========================
  g("FINE ARTS", 1, "vegas_sphere_2023_u2_opening_led_dome",
    "Lighting up the Las Vegas Strip in September 2023, the 366-foot Sphere arena opened with a 40-night residency by who?",
    ["Rock band U2","Coldplay live","Adele residency","Daft Punk duo"], 0,
    "Playing \"Achtung Baby\" beneath soaring desert visuals, U2 christened a 17,600-seat bowl backed by 167,000 beamforming speakers!"),

  g("FINE ARTS", 1, "vegas_sphere_16k_interior_wraparound_screen",
    "Wrapping fans overhead like an electric sky, the Las Vegas Sphere boasts the sharpest LED screen at how many \"K\"?",
    ["4K cinema curve","16K LED dome","8K IMAX vault","32K laser wall"], 1,
    "Spanning three football fields of continuous LEDs (16K × 16K), filmmakers had to invent a custom camera system called \"Big Sky\" just to shoot for it!",
    {"numeric":{"target":16,"min":2,"max":32,"step":1,"unit":"K"}}),

  g("FINE ARTS", 1, "hamilton_lin_manuel_miranda_white_house_mixtape",
    "Years before sweeping 11 Tonys, Lin-Manuel Miranda tested his very first \"Hamilton\" rap to laughs—then gasps—in 2009 where?",
    ["A Brooklyn subway car","Saturday Night Live","The White House","Central Park’s stage"], 2,
    "Invited to perform from \"In the Heights\" for the Obamas, Miranda debuted a solo track about Treasury Secretary Alexander Hamilton instead!"),

  g("FINE ARTS", 1, "hamilton_stage_double_concentric_turntables",
    "Scenic designer David Korins gave Broadway’s \"Hamilton\" kinetic cyclone motion by marching actors in opposite directions on twin stage what?",
    ["Hydraulic scissor lifts","Suspended rope bridges","Sloped glass treadmills","Concentric turntables"], 3,
    "Spinning an inner disk against an outer ring let choreography visualize passing years, hurricanes, and duelists pacing ten steps apart!"),

  g("FINE ARTS", 1, "banksy_shredded_canvas_retitled_love_in_bin",
    "Hours after \"Girl with Balloon\" half-shredded itself at Sotheby’s in 2018, Banksy officially retitled the piece what?",
    ["Love is in the Bin","Money to Burn Now","Gone With the Wind","Half Off at Auction"], 0,
    "Instead of voiding the £1M purchase, the stunned buyer kept it—and resold the half-ripped icon three years later for £18.6 million!"),

  g("FINE ARTS", 1, "cattelan_comedian_duct_tape_banana_art_basel",
    "Going viral at Art Basel Miami in 2019—and auctioning for $6.2M in 2024—Cattelan’s \"Comedian\" duct-taped what to a wall?",
    ["A slice of NY pizza","A fresh yellow banana","A glazed pink donut","A crusty French baguette"], 1,
    "Buyers actually purchase a certificate of authenticity with diagrammed rules on replacing the ripening grocery-stand banana weekly!"),

  g("FINE ARTS", 1, "notre_dame_2024_reopening_medieval_oak_forest",
    "Reopening to global applause in December 2024 after its 2019 fire, Paris’s Notre-Dame rebuilt its medieval \"Forest\" roof using hand-axed what?",
    ["Cast architectural bronze","Laminated Nordic pinewood","Solid French oak beams","Woven carbon-fiber beams"], 2,
    "Hundreds of traditional \"compagnons\" carpenters shaped over 1,200 oak trees with medieval broadaxes so the attic matches 13th-century joinery!"),

  g("FINE ARTS", 2, "notre_dame_spire_surviving_copper_rooster",
    "Pulled dented but intact from Notre-Dame’s smoking 2019 rubble, what copper bird atop the fallen spire held relics inside?",
    ["A gilded Parisian swallow","A Napoleonic golden eagle","A crowned olive peace dove","The Gallic rooster"], 3,
    "Now retired to display with a gleaming golden phoenix-like successor perched high overhead, the 1935 rooster sheltered relics from the fire."),

  g("FINE ARTS", 2, "salvator_mundi_450_million_auction_record",
    "Setting an all-time art auction record at Christie’s New York in 2017, Leonardo’s \"Salvator Mundi\" hammered down near how many million dollars?",
    ["$450 million","$125 million","$275 million","$1,100 million"], 0,
    "Bought at a dusty 2005 estate sale for just $1,175 while heavily overpainted, conservation revealed smoky Renaissance walnut-panel brushwork!",
    {"numeric":{"target":450,"min":50,"max":600,"step":10,"unit":"million USD"}}),

  g("FINE ARTS", 1, "kehinde_wiley_barack_obama_ivy_portrait_2018",
    "Drawing huge Smithsonian lines since 2018, Kehinde Wiley painted Barack Obama leaning forward amid a lush wall of what?",
    ["Fluted white marble pillars","Botanical ivy & flowers","Starlit navy velvet drapes","Stacked antique law books"], 1,
    "Chrysanthemums, African blue lilies, and jasmine woven through the greenery symbolized Chicago, Kenya, and Hawaii respectively!"),

  g("FINE ARTS", 2, "amy_sherald_michelle_obama_grayscale_skin",
    "Unveiled alongside Barack Obama’s portrait in 2018, painter Amy Sherald rendered Michelle Obama’s skin in her signature sculptural shades of what?",
    ["Burnished copper leaf","Cobalt pastel blue","Warm grisaille gray","Terracotta sienna"], 2,
    "Sherald paints skin in calm grisaille gray to invite viewers past surface color straight into inner poise—paired with a bold geometric gown!"),

  g("FINE ARTS", 1, "vantablack_anish_kapoor_absorbs_9996_light",
    "Licensed exclusively for art by Anish Kapoor in 2016, nanotube coating \"Vantablack\" makes 3D sculptures look like what?",
    ["Glowing neon ghosts","Polished chrome mirrors","Frosted ice sculptures","Flat 2D black holes"], 3,
    "Swallowing 99.965% of light erases every wrinkle—prompting rival Stuart Semple to sell \"Pinkest Pink\" to everyone except Kapoor!"),

  g("FINE ARTS", 1, "christo_2021_wrapped_arc_de_triomphe_paris",
    "Sixty years after first sketching the dream, Christo and Jeanne-Claude’s team posthumously wrapped which Paris landmark in silver-blue fabric in 2021?",
    ["Arc de Triomphe","Place Vendôme column","Sacré-Cœur basilica","Luxor Obelisk needle"], 0,
    "Recyclable polypropylene shimmering with red rope transformed Napoleon’s stone arch into a living, wind-rippling sculpture for sixteen autumn days."),

  g("FINE ARTS", 1, "met_gala_first_monday_in_may_costume_wing",
    "Staged every \"First Monday in May\" up the Met’s grand stairs, fashion’s star-studded Met Gala funds which museum wing?",
    ["Arms and Armor Hall","The Costume Institute","Modern Design Loft","American Textile Vault"], 1,
    "Founded by publicist Eleanor Lambert in 1948 with $50 dinner tickets, Anna Wintour turned the benefit into fashion’s annual Super Bowl!"),

  g("FINE ARTS", 2, "coperni_2022_bella_hadid_spray_on_dress",
    "Going viral at October 2022 Paris Fashion Week, Coperni sprayed liquid cotton fibers onto Bella Hadid live to form what?",
    ["A feathered opera bonnet","Knee-high Chantilly boots","A wearable white dress","A cropped satin blazer"], 2,
    "Invented by Manel Torres (\"Fabrican\"), the aerosol solvent evaporated on skin contact into soft stretch fabric slit live on the runway!"),

  g("FINE ARTS", 1, "barbie_2023_set_global_rosco_pink_shortage",
    "Building life-size Dreamhouses for 2023’s \"Barbie\" movie required so many gallons of fluorescent paint that sets briefly wiped out global stocks of what?",
    ["Pantone Coral Matte","Winsor Crimson Oil","Krylon Neon Violet","Rosco bright pink"], 3,
    "Production designer Sarah Greenwood joked \"the world ran out of pink\" after coating palm trees, lampposts, and cul-de-sacs in custom Rosco fluorescent!"),

  g("FINE ARTS", 1, "kusama_polka_dot_giant_yellow_pumpkins",
    "Alongside her \"Infinity Mirror Rooms,\" Japanese icon Yayoi Kusama dots island piers with giant yellow sculptures of what?",
    ["Plump yellow pumpkins","Folded paper cranes","Redspotted toadstools","Striped porcelain cats"], 0,
    "Kusama fell in love with squat kabocha pumpkins on her family’s seed farm for their \"humorous form and warm spiritual balance.\""),

  g("FINE ARTS", 2, "ai_weiwei_100_million_porcelain_sunflower_seeds",
    "Carpeting Tate Modern’s vast hall in 2010, artist Ai Weiwei employed 1,600 artisans to hand-paint roughly how many million porcelain sunflower seeds?",
    ["12 million ceramic seeds","100 million seeds","45 million glazed seeds","180 million clay seeds"], 1,
    "Every tiny grey-and-white seed received 30 brushstrokes in Jingdezhen—questioning \"Made in China\" mass production through intimate handwork!",
    {"numeric":{"target":100,"min":10,"max":200,"step":5,"unit":"million"}}),

  g("FINE ARTS", 1, "marina_abramovic_moma_2010_silent_gaze_chair",
    "Across 736 silent hours in MoMA’s 2010 \"The Artist Is Present,\" Marina Abramović invited strangers one by one to do what?",
    ["Sketch her portrait","Whisper one confession","Lock eyes in silence","Trade wristwatches"], 2,
    "Over 1,500 strangers wept or smiled across the wooden table—most famously when former partner Ulay sat down unexpectedly after decades apart!"),

  g("FINE ARTS", 2, "olafur_eliasson_tate_indoor_mist_sun_2003",
    "Turning Tate Modern’s Turbine Hall into a glowing amber sunset in \"The Weather Project\", Olafur Eliasson paired a misted half-disk lamp with a ceiling of what?",
    ["Stained-glass skylights","Spinning brass prisms","Backlit silk clouds","Reflective mirror foil"], 3,
    "Ceiling mirrors completed the giant sun into a full sphere overhead while thousands of Londoners stretched out on the floor waving at tiny reflections!"),

  g("FINE ARTS", 2, "the_shard_london_renzo_piano_open_spire",
    "Topping out over London in 2012, Renzo Piano left the glass panels at the very peak of \"The Shard\" open to do what?",
    ["Vent heat & wind pressures","Collect rainwater mist","Nest peregrine falcons","Beam midnight searchlights"], 0,
    "Rather than sealing into a sharp pyramid point, angled glass shards stop short of touching so the 1,016-foot tower breathes into the clouds!"),

  g("FINE ARTS", 1, "nyc_high_line_abandoned_freight_rail_park",
    "Winding 30 feet above Manhattan’s Chelsea district since 2009, the High Line park repurposed 1.45 miles of 1930s what?",
    ["Aqueduct water pipes","Elevated freight rail","Trolley streetcar barns","Dry-dock ship piers"], 1,
    "Originally built so meatpacking trains stopped colliding with Tenth Avenue horse traffic, self-seeded wildflowers inspired its linear park rebirth!"),

  g("FINE ARTS", 2, "copenhill_bjarke_ingels_power_plant_ski_slope",
    "Architect Bjarke Ingels topped Copenhagen’s clean 2019 CopenHill power plant with a sloped green roof built for what sport?",
    ["Outdoor opera concerts","Formula E kart racing","Year-round dry skiing","Rooftop sailboat pools"], 2,
    "Complete with a chairlift and world’s tallest climbing wall, its chimney puffs giant harmless steam rings into the sky!"),

  g("FINE ARTS", 1, "basquiat_1982_untitled_skull_110_million",
    "Starting with \"SAMO\" street tags in 1970s SoHo, which young Neo-Expressionist set a $110.5M American auction mark in 2017?",
    ["Julian Schnabel plate art","Kenny Scharf pop murals","George Condo oil cubism","Jean-Michel Basquiat"], 3,
    "Painted at age 21 in electric blues, fiery reds, and anatomical crown lines, Basquiat’s 1982 skull soared past Warhol’s previous auction high!"),

  g("FINE ARTS", 1, "david_hockney_ipad_brushes_royal_academy",
    "Delighting London’s Royal Academy in his seventies and eighties, painter David Hockney showed spring landscapes drawn on what?",
    ["An Apple iPad screen","Frosted pub windows","Cardboard pizza boxes","Etch A Sketch dials"], 0,
    "Hockney loved that backlights let him sketch Yorkshire sunrises in bed at dawn without fumbling in the dark for turpentine or wet rags!"),

  g("FINE ARTS", 1, "kaws_companion_crossed_out_gloved_eyes",
    "From museum plazas to Macy’s balloons, Brooklyn artist KAWS marks his gloved \"Companion\" figures with what eye detail?",
    ["Upside-down smiles","Twin X-ed out eyes","Gold lightning cheeks","Three vertical pupils"], 1,
    "Brian Donnelly (\"KAWS\") began painting playful X X eyes over bus-shelter fashion billboards in 1990s New Jersey and Manhattan."),

  g("FINE ARTS", 1, "pantone_color_of_the_year_annual_swatch",
    "Every December since 2000, fashion and home designers rally around a signature \"Color of the Year\" crowned by who?",
    ["Bauhaus Design Archive","Cooper Hewitt Design Wing","Pantone Color Institute","Sotheby’s Decorative Arts"], 2,
    "Recent cultural picks like 2023’s \"Viva Magenta\", 2024’s \"Peach Fuzz\", and 2025’s \"Mocha Mousse\" ripple straight onto sneakers, phones, and sofas."),

  g("FINE ARTS", 2, "virgil_abloh_off_white_quotation_marks",
    "Trained in civil engineering and architecture before leading Louis Vuitton menswear, Virgil Abloh stamped ironic \"LACES\" labels inside what?",
    ["Bright red square brackets","Fluorescent barcode tags","Dotted tailor-scissor hems","Bold quotation marks"], 3,
    "Abloh’s \"3% rule\"—tweaking a classic sneaker or industrial zip-tie by just three percent with \"AIR\" quotes—redefined 2010s luxury streetwear."),

  g("FINE ARTS", 2, "guo_pei_rihanna_2015_yellow_canary_train",
    "Embroidered over 50,000 hours by Beijing couturier Guo Pei, Rihanna’s show-stopping 2015 Met Gala cape cascaded 16 feet in what royal color?",
    ["Imperial canary yellow","Emperor jade-emerald silk","Deep Ming lacquer crimson","Midnight Forbidden indigo"], 0,
    "Weighing 55 pounds and requiring three attendants up the Met steps, the fur-trimmed masterpiece instantly turned couture into pop legend!"),

  g("FINE ARTS", 3, "kara_walker_2014_domino_sugar_sphinx",
    "Inside a doomed Brooklyn Domino refinery in 2014, Kara Walker sculpted a 35-foot sphinx coated in 40 tons of what?",
    ["Crushed oyster shells","Bleached white sugar","Carved alabaster salt","Raw unspun cotton"], 1,
    "Titled \"A Subtlety\", the monumental sphinx confronted the bittersweet history of Caribbean cane labor right inside sticky molasses-scented walls."),

  g("FINE ARTS", 2, "cloud_gate_chicago_168_seamless_steel_plates",
    "Tourists hunt in vain for joints on Chicago’s mirrored 2006 \"Cloud Gate\" (\"The Bean\") because crews polished its 168 steel plates until it showed what?",
    ["Faint rainbow rivets","Hidden drainage slots","Zero visible weld seams","Etched lake contours"], 2,
    "Five rounds of grinding and jeweler’s-rouge buffing erased two miles of welds into one continuous 110-ton funhouse skyline mirror!"),

  g("FINE ARTS", 2, "rijks_2013_rembrandt_bicycle_tunnel_through",
    "Unique among world art temples, Amsterdam’s grand Rijksmuseum splits its vaulted ground floor open around a breezy public tunnel built for what?",
    ["Canal tour gondolas","Royal horse carriages","Streetcar trams","Daily city cyclists"], 3,
    "Locals pedal commuters’ bikes straight beneath Rembrandt’s \"Night Watch\" gallery overhead, whistling tunes into the brick acoustics!"),

  g("FINE ARTS", 2, "norman_foster_reichstag_glass_gherkin_millau",
    "Which British architect crowned Berlin’s Reichstag with a walkable glass dome and shaped London’s bullet-like \"Gherkin\"?",
    ["Norman Foster","Santiago Calatrava","Rem Koolhaas","Tadao Ando"], 0,
    "Inside Foster’s Reichstag dome, citizens walk spiraling ramps literally \"above\" elected lawmakers’ heads—symbolizing democratic transparency!"),

  g("FINE ARTS", 2, "teamlab_borderless_tokyo_interactive_projection",
    "Drawing millions in Tokyo since 2018, digital art collective teamLab surrounds darkened rooms in touch-responsive what?",
    ["Kinetic wire mobiles","Wandering projections","Hologram glass cubes","Robotic oil brushes"], 1,
    "Projected waterfalls part around your shoes and digital blossoms scatter whenever your hand brushes a wall—never repeating the same moment twice!"),

  g("FINE ARTS", 3, "heatherwick_seed_cathedral_60000_acrylic_rods",
    "Swaying like a giant dandelion at Expo 2010, Thomas Heatherwick’s UK \"Seed Cathedral\" pierced walls with 60,000 clear rods holding real what?",
    ["Amber fossil insects","Pressed alpine ferns","Kew Bank plant seeds","Tiny blown glass bees"], 2,
    "Daylight funneled down each 25-foot optic hair to illuminate 250,000 seeds inside; at night, inner bulbs turned the whole cube into a glowing sea urchin!"),

  g("FINE ARTS", 1, "lion_king_broadway_julie_taymor_double_event",
    "Making Broadway history in 1998—still roaring nightly—director Julie Taymor kept \"The Lion King\" actors’ human faces visible right beneath what?",
    ["Projected laser pelts","Inflatable mane hoods","Painted silk veils","Sculpted animal masks"], 3,
    "Taymor called seeing both weeping actor and prowling carbon-fiber lion mask at once the \"double event\"—letting audiences co-create the magic!"),

  g("FINE ARTS", 1, "wicked_broadway_defying_gravity_hydraulic_lift",
    "Belting \"Defying Gravity\" 20 feet high since 2003, Broadway’s \"Wicked\" hides Elphaba’s hydraulic lift under a billowing what?",
    ["Floor-length black cape","Swirling green smoke","Emerald mirror curtain","Stacked broomstick prop"], 0,
    "Stagehands unfurl yards of black fabric pinned to the stage deck so lighting turns the rising witch into a towering cone of midnight flight!"),

  g("FINE ARTS", 2, "bosco_verticale_milan_900_balcony_trees",
    "Stefano Boeri’s 2014 \"Bosco Verticale\" residential towers in Milan pack staggered balconies with roughly 900 living what?",
    ["Bonsai cedar pots","Full-grown trees","Hanging orchid cages","Hydroponic grape vines"], 1,
    "Wind-tunnel tested in Miami against hurricane gusts, \"arborist-climbers\" rappel down the skyscrapers twice a year to prune the sky forest!"),

  g("FINE ARTS", 1, "louvre_mona_lisa_bulletproof_climate_case",
    "When protesters hurled pumpkin soup at the \"Mona Lisa\" in 2024, zero paint suffered harm because Leonardo’s fragile poplar board rests behind what?",
    ["Invisible air curtains","Retractable steel doors","Bulletproof clear glass","Replica decoy canvas"], 2,
    "Ever since a visitor tossed a teacup in 1956, climate-controlled non-reflective armor keeps humidity near 50% so the 500-year wood won’t warp!"),

  g("FINE ARTS", 2, "jr_street_art_giant_wheatpaste_portraits",
    "French street artist JR turns rooftops and border walls into open galleries by pasting building-sized black-and-white what?",
    ["Calligraphic poems","Geometric op-art grids","Vintage botanical plates","Everyday human photos"], 3,
    "In 2017, JR erected a 70-foot scaffold portrait of Mexican toddler \"Kikito\" playfully peeking right over the border fence into California!"),

  g("FINE ARTS", 1, "grand_egyptian_museum_giza_glass_pyramid_view",
    "Welcoming visitors beside Cairo’s desert edge in 2024–2025, the billion-dollar Grand Egyptian Museum aligns its panoramic glass atrium straight with what?",
    ["Giza’s Three Pyramids","Alexandria’s harbor","Luxor’s Karnak avenue","The Aswan High Dam"], 0,
    "Designed by Heneghan Peng with translucent alabaster triangles, it displays all 5,000+ artifacts from Tutankhamun’s tomb together for the first time!"),

  g("FINE ARTS", 1, "sphere_exosphere_580000_sqft_giant_eyeball",
    "Spotted easily from airplanes descending into Vegas since 2023, the Sphere’s outer LED \"Exosphere\" playfully morphs into basketballs, moons, and what?",
    ["A ticking cuckoo clock","A giant blinking eyeball","A spinning roulette wheel","A flaming neon guitar"], 1,
    "On Halloween and golf mornings alike, the 580,000-square-foot eyeball tracks passing monorails and golfers teeing off next door!"),

  g("FINE ARTS", 3, "kehinde_wiley_rumors_of_war_times_square",
    "Reimagining equestrian bronze monuments as a young rider in dreadlocks, hoodie, and Nike high-tops, Kehinde Wiley unveiled \"Rumors of War\" permanently in what city?",
    ["Savannah, Georgia","Charleston, South Carolina","Richmond, Virginia","Montgomery, Alabama"], 2,
    "Debuting first in Times Square in 2019, the 27-foot bronze now stands outside the Virginia Museum of Fine Arts minutes from Monument Avenue."),

  g("FINE ARTS", 1, "hermes_birkin_1984_airplane_sickness_bag",
    "Still commanding waitlists in 2026, the Hermès Birkin bag was sketched on a 1984 flight across the back of an airline what?",
    ["First-class wine menu","Paper air-sickness bag","Laminated safety card","Boarding pass stub"], 3,
    "Jane Birkin’s straw basket spilled overhead right onto Hermès chief Jean-Louis Dumas—who sketched her dream roomy weekend bag mid-flight!"),

  g("FINE ARTS", 1, "louvre_pyramid_im_pei_1989_glass_diamond",
    "Protested during 1980s construction before winning Paris’s heart in 1989, which architect designed the glass Louvre Pyramid?",
    ["I. M. Pei","Eero Saarinen","Philip Johnson","César Pelli"], 0,
    "Pei had engineers brew custom water-clear \"extra-white\" glass without green iron tint so warm limestone palace facades shone right through!"),

  g("FINE ARTS", 3, "louvre_pyramid_673_panes_urban_legend_666",
    "Thriller novels spread a myth of 666 panes—the Louvre’s official architectural tally on I. M. Pei’s glass pyramid actually counts how many panes?",
    ["540 glass panes","673 glass panes","612 glass panes","777 glass panes"], 1,
    "603 diamond rhombuses plus 70 triangles equal 673 panes—three extra triangles were cut out of one base side just to form the entrance doorway!",
    {"numeric":{"target":673,"min":500,"max":800,"step":1,"unit":"panes"}}),

  g("FINE ARTS", 2, "guggenheim_bilbao_frank_gehry_titanium_scales",
    "Rippling beside Spain’s Nervión River since 1997, Frank Gehry wrapped the Guggenheim Bilbao in 33,000 paper-thin sheets of what aerospace metal?",
    ["Brushed nickel alloy","Anodized aluminum","Rolled titanium","Polished zinc plate"], 2,
    "A post-Cold War dip in Russian titanium prices let Gehry buy golden-shimmering metal half a millimeter thick that pillows softly in the wind!"),

  g("FINE ARTS", 2, "pompidou_center_inside_out_color_coded_pipes",
    "Turning Paris’s 1977 Pompidou Center \"inside out,\" Piano and Rogers painted air ducts blue, water green, electricity yellow, and escalators what color?",
    ["Bright royal purple","Glossy jet-black enamel","Metallic silver leaf","Fire-engine red"], 3,
    "Pushing pipes and elevators onto the facade freed every gallery floor inside into wide-open, column-free creative space!"),

  g("FINE ARTS", 1, "vietnam_memorial_reflective_black_stone",
    "Why was Washington’s 1982 Vietnam Veterans Memorial polished to a mirror finish from dark stone instead of white marble?",
    ["Reflects living faces","Sheds winter snow fast","Glows blue at midnight","Blocks camera flash"], 0,
    "Visitors touching 58,000+ engraved names see their own living faces gazing directly back out from inside the quiet earth wall."),

  g("FINE ARTS", 1, "bob_ross_joy_of_painting_alla_prima_wet_oil",
    "Completing \"happy little trees\" in 26 television minutes across the 1980s, Bob Ross skipped days of drying by painting over wet base coat via what method?",
    ["Hot beeswax encaustic","Wet-on-wet alla prima","Dry plaster secco","Egg-yolk tempera"], 1,
    "Slick \"Liquid White\" base coat let fan brushes glide mountain snow on in effortless strokes—and Ross filmed PBS episodes unpaid to sell supplies!"),

  g("FINE ARTS", 2, "keith_haring_1980s_nyc_subway_matte_chalk",
    "Before museum fame, young Keith Haring dashed off thousands of radiant babies and barking dogs in 1980s NYC subways using white chalk on what?",
    ["Glazed ceramic tiles","Steel pillar girders","Matte black ad paper","Frosted train windows"], 2,
    "Whenever transit crews pasted matte black paper over expired ads, Haring hopped off trains to draw 40 crisp chalk murals a day freehand!"),

  g("FINE ARTS", 1, "diane_von_furstenberg_1974_jersey_wrap_dress",
    "Selling five million pieces by 1976 with zero zippers or buttons, Diane von Furstenberg reshaped fashion with her knit what?",
    ["Pleated maxi tunic","Halter palazzo suit","Bell-sleeve shift","Tie-waist wrap dress"], 3,
    "Inspired by ballerinas’ knit wrap tops, her slogan \"\"Feel like a woman, wear a dress!\"\" landed the 29-year-old on \"Newsweek\"’s cover."),

  g("FINE ARTS", 2, "mary_quant_1960s_chelsea_miniskirt_mini_car",
    "Swinging 1960s London designer Mary Quant hiked hemlines boldly—naming the \"miniskirt\" after her favorite little what?",
    ["Austin Mini car","Miniature poodle","Mini transistor radio","Minuet ballet step"], 0,
    "Chelsea youths sprinting for double-decker buses cheered hemlines that freed movement—Quant later received a British damehood in miniskirt spirit!"),

  g("FINE ARTS", 1, "tinker_hatfield_air_max_1_pompidou_window",
    "Fresh from visiting Paris’s \"inside-out\" Pompidou Center, architect-turned-Nike designer Tinker Hatfield cut a 1987 sneaker heel window to expose what?",
    ["Carbon-fiber arch springs","Pressurized Air-Sole","Woven Kevlar laces","Honeycomb gel pads"], 1,
    "Nike marketers panicked that buyers would think the bubble might pop—instead, the visible Air Max 1 launched a multi-billion-dollar sneaker dynasty!"),

  g("FINE ARTS", 1, "phantom_broadway_1988_falling_crystal_chandelier",
    "Nightly across 13,981 Broadway performances starting in 1988, Andrew Lloyd Webber’s \"Phantom of the Opera\" sent what stage prop swooping at the seats?",
    ["A flaming gondola boat","A velvet guillotine","A crystal chandelier","A gilded pipe organ"], 2,
    "Six thousand sparkling beads plunged at seven feet per second on steel guide cables, braking thrillingly feet above orchestra heads!"),

  g("FINE ARTS", 2, "a_chorus_line_1975_single_white_audition_stripe",
    "Trading glitzy Broadway sets for raw honesty in 1975, \"A Chorus Line\" lined 17 hopeful dancers shoulder to shoulder behind a bare stage’s lone what?",
    ["Velvet brass stanchion","Footlight mirror bar","Chalk rehearsal circle","White painted line"], 3,
    "Born from late-night tape-recorded confessions of real Broadway ensemble dancers, it won nine Tonys and the Pulitzer Prize for Drama."),

  g("FINE ARTS", 1, "warhol_silver_factory_billy_name_aluminum_foil",
    "Why did Andy Warhol’s 1964 Midtown Manhattan studio earn its legendary Pop Art nickname, the \"Silver Factory\"?",
    ["Walls wrapped in foil","Built in a mint vault","Paid models in coins","Sold sterling spoons"], 0,
    "Photographer Billy Name covered bricks, pipes, elevators, and even the toilet in aluminum foil and silver spray paint for round-the-clock screenprinting!"),

  g("FINE ARTS", 3, "ansel_adams_zone_system_zero_to_ten_tones",
    "Formulated by Ansel Adams and Fred Archer for luminous Yosemite prints, the \"Zone System\" maps pure black through pure white across how many zones?",
    ["5 tonal zones","11 tonal zones","7 tonal zones","24 tonal zones"], 1,
    "Mapping Roman numerals 0 (pure black) through X (pure white) with Zone V at 18% middle gray let photographers pre-visualize prints cleanly!",
    {"numeric":{"target":11,"min":3,"max":24,"step":1,"unit":"zones"}}),

  g("FINE ARTS", 3, "judy_chicago_dinner_party_39_womens_plates",
    "Arranged as a grand open triangle at the Brooklyn Museum, Judy Chicago’s 1979 \"The Dinner Party\" sets embroidered runners for how many women?",
    ["12 mythic seats","24 royal seats","39 place settings","64 studio seats"], 2,
    "Thirteen settings along each wing—echoing Last Supper counts—honor trailblazers from Sappho and Hatshepsut to Emily Dickinson and Sojourner Truth!",
    {"numeric":{"target":39,"min":10,"max":64,"step":1,"unit":"places"}}),

  g("FINE ARTS", 2, "polaroid_sx70_1972_folding_leather_slr",
    "At a 1972 company meeting, inventor Edwin Land pulled a flat chrome-and-tan-leather camera from his coat pocket and snapped 5 shots in 10 seconds: what model?",
    ["Kodak Brownie Flash","Leica M3 Rangefinder","Hasselblad 500C Moon","Polaroid SX-70"], 3,
    "Andy Warhol and Ansel Adams adored the folding SLR whose self-contained prints developed cleanly in daylight with zero sticky peel-apart trash!"),

  g("FINE ARTS", 1, "audrey_hepburn_givenchy_tiffany_black_dress",
    "Nibbling a Danish outside Fifth Avenue windows at dawn in 1961’s \"Breakfast at Tiffany’s\", Audrey Hepburn immortalized a sleek black gown by who?",
    ["Hubert de Givenchy","Cristóbal Balenciaga","Pierre Cardin","Emilio Pucci"], 0,
    "Paired with pearl strands and elbow gloves, Givenchy’s satin sheath sold at Christie’s in 2006 for over $900,000 for charity!"),

  g("FINE ARTS", 2, "saul_bass_vertigo_lissajous_spiral_posters",
    "Transforming 1950s–60s movie credits from dull cast cards into kinetic mini-films for \"Vertigo\", \"Psycho\", and \"Anatomy of a Murder\" was whose trademark?",
    ["Herb Lubalin","Saul Bass","Paul Rand","Raymond Loewy"], 1,
    "Projectionists used to keep curtains shut over credits—until Bass’s cut-paper suspense made studios stamp reels \"Pull curtains BEFORE titles!\""),

  g("FINE ARTS", 3, "massimo_vignelli_1972_nyc_subway_diagram",
    "Which Italian modernist designer untangled 1970s New York subway signage and drew the iconic 1972 45°/90° geometric transit diagram now in MoMA?",
    ["Ettore Sottsass","Gio Ponti","Massimo Vignelli","Bruno Munari"], 2,
    "Vignelli also crafted Bloomingdale’s minimalist \"Big Brown Bag\" and American Airlines’ timeless red-white-and-blue eagle identity!"),

  g("FINE ARTS", 1, "milton_glaser_1977_i_heart_ny_taxi_crayon",
    "Riding across Manhattan in a 1976 yellow cab, designer Milton Glaser sketched the \"I ♥ NY\" logo in red crayon on what?",
    ["A diner paper napkin","A subway token card","A Playbill back page","A torn envelope scrap"], 3,
    "Glaser donated the pro-bono work free to lift New York out of its 1970s fiscal slump; his original crumpled crayon scrap lives in MoMA!"),

  g("FINE ARTS", 2, "christo_1983_surrounded_islands_pink_biscayne",
    "For two bright weeks in May 1983, Christo and Jeanne-Claude ringed eleven islands in Miami’s Biscayne Bay with 6.5 million square feet of what color?",
    ["Flamingo-bright pink","Canary sunshine gold","Cobalt ocean blue","Tangerine safety orange"], 0,
    "Floating polypropylene skirts echoed tropical hibiscus and Art Deco pastels—while crews hauled 40 tons of litter off the islands beforehand!"),

  g("FINE ARTS", 2, "vivienne_westwood_1970s_kings_road_punk_plaid",
    "Operating a rebellious 1970s London boutique at 430 King’s Road before conquering Paris runways, who fused royal tartan with safety-pin punk?",
    ["Zandra Rhodes","Vivienne Westwood","Sonia Rykiel","Elsa Schiaparelli"], 1,
    "Dame Vivienne turned ripped seams, bondage straps, and 18th-century corsets into high-fashion insurgency for half a century."),

  g("FINE ARTS", 3, "rothko_chapel_houston_14_dark_canvases",
    "Opened in Houston in 1971 as a quiet non-denominational sanctuary, the octagonal Rothko Chapel surrounds visitors with how many dark Rothko canvases?",
    ["7 tall canvases","21 square canvases","14 dark canvases","32 small canvases"], 2,
    "Lit gently from an overhead baffled skylight, Mark Rothko’s deep plum-and-charcoal fields shift subtly as Texas clouds drift past outside.",
    {"numeric":{"target":14,"min":4,"max":32,"step":1,"unit":"canvases"}}),

  g("FINE ARTS", 2, "habitat_67_moshe_safdie_montreal_stacked_cubes",
    "Built from 29-year-old Moshe Safdie’s thesis for Montreal’s Expo 67, \"Habitat 67\" stacked 354 concrete modules so every home enjoyed its own what?",
    ["Indoor lap pool","Private boat slip","Helipad skylight","Sunny roof garden"], 3,
    "Tested first with LEGO bricks, hoisting precast boxes by crane gave apartment dwellers suburban terrace gardens and cross-breezes mid-sky!"),

  g("FINE ARTS", 2, "verner_panton_1967_single_piece_s_chair",
    "Debuting in 1967 Living Color red and tangerine, Verner Panton’s curvy S-shaped chair became the first cantilevered seat molded from one piece of what?",
    ["Injection plastic","Bent birch plywood","Spun fiberglass yarn","Tubular chrome steel"], 0,
    "Ten manufacturers told Danish visionary Panton a legless plastic S-curve would snap—until Vitra perfected glossy stackable Pop perfection!"),

  g("FINE ARTS", 3, "yves_klein_ikb_ultramarine_matte_resin_bind",
    "French artist Yves Klein registered \"International Klein Blue\" in 1960 after finding a synthetic resin binder that preserved dry pigment’s what?",
    ["Metallic gold fleck","Velvety matte glow","Glow-in-dark charge","Waterproof oil gloss"], 1,
    "Linseed oil dulled pure ultramarine powder dark; Rhodopas M60A suspended every grain like electric cobalt velvet with zero murky sheen!"),

  g("FINE ARTS", 2, "supergraphics_1967_sea_ranch_bold_wall_stripes",
    "Popularized at California’s Sea Ranch in 1967, giant diagonal rainbow bands and bold geometric numbers painted right across walls and doors were dubbed what?",
    ["Brutalist Frescoes","De Stijl Grids","Bold Supergraphics","Kinetic Trompe-l’œil"], 2,
    "Architect Barbara Stauffacher Solomon Armed with house paint and Swiss Helvetica turned raw cedar athletic club interiors into joyful 3D posters!"),

  g("FINE ARTS", 2, "steve_mccurry_1984_afghan_girl_kodachrome",
    "Haunting sea-green eyes on \"National Geographic\"’s June 1985 cover made Sharbat Gula iconic—Steve McCurry shot her portrait on what legendary film?",
    ["Polaroid Type 55","Ilford HP5 black","Fujifilm Velvia 50","Kodachrome 64 slide"], 3,
    "Kodak’s archival dye chemistry held rich crimson headscarf and emerald iris tones so vividly that Kodak granted McCurry the final roll made in 2010!"),

  g("FINE ARTS", 1, "dale_chihuly_blown_glass_bellagio_fiori_ceiling",
    "Wearing a signature eyepatch since 1976, which glass maestro hung 2,000 blown-glass blossoms across Bellagio’s ceiling?",
    ["Dale Chihuly","Louis Comfort Tiffany","René Lalique","Lino Tagliapietra"], 0,
    "Spanning 2,100 square feet on a 10,000-pound steel armature, \"Fiori di Como\" bathes arriving guests in sunlit Venetian-style Living Color!"),

  g("FINE ARTS", 1, "space_needle_1962_seattle_coaster_sketch",
    "Sketched on a coffee-house coaster for Seattle’s 1962 World’s Fair, the 605-foot Space Needle topped its tower with what?",
    ["Roman torch brazier","Flying saucer UFO","Lighthouse lantern","Martian water tower"], 1,
    "Painted \"Galaxy Gold\" and \"Astronaut White\" for the Century 21 Exposition, its revolving dining ring originally spun on a tiny 1-horsepower motor!"),

  g("FINE ARTS", 2, "nam_june_paik_electronic_superhighway_tvs",
    "Father of video art Nam June Paik coined \"Electronic Superhighway\" and built a 40-foot Smithsonian U.S. map outlined in neon and 336 flickering what?",
    ["Pinball backglasses","Cathode TV monitors","Car dashboard radios","Airport split-flaps"], 2,
    "Oklahoma plays \"The Wizard of Oz\" inside neon borders while Iowa loops presidential primary clips—prophesying our screen-saturated world in 1995!"),

  g("FINE ARTS", 1, "jean_paul_gaultier_1990_madonna_cone_corset",
    "Turning backstage corsetry into stadium armor on Madonna’s 1990 tour, which French designer sewed her pink cone-bra look?",
    ["Thierry Mugler","Christian Lacroix","Karl Lagerfeld","Jean Paul Gaultier"], 3,
    "Gaultier first stitched a torpedo-cone bra onto his childhood teddy bear \"Nana\" decades before Madonna made it 1990s stage royalty!"),

  g("FINE ARTS", 1, "annie_leibovitz_1980_lennon_ono_polaroid_hug",
    "On the afternoon of December 8, 1980—hours before tragedy—which \"Rolling Stone\" photographer captured John Lennon curled tight around Yoko Ono?",
    ["Annie Leibovitz","Richard Avedon","Diane Arbus","Irving Penn"], 0,
    "Lennon looked at the test Polaroid and beamed, \"\"You’ve captured our relationship exactly\"\"—making the January 1981 issue an unforgettable cover."),

  g("FINE ARTS", 2, "frank_stella_shaped_canvases_what_you_see",
    "Declaring bluntly \"\"What you see is what you see,\"\" 1960s Minimalist pioneer Frank Stella broke away from rectangular frames using notched what?",
    ["Inflatable vinyl tubes","Shaped canvases","Sandblasted mirrors","Hinged cedar shutters"], 1,
    "Cutting V-notches and protractors out of stretcher bars forced viewers to read paintings as bold physical wall objects rather than window illusions."),

  g("FINE ARTS", 1, "les_miserables_revolving_barricade_1985_stage",
    "Decades before \"Hamilton,\" 1985’s \"Les Misérables\" spun a two-story pile of chairs and carts into a fierce Parisian what?",
    ["Guillotine scaffold","Cathedral bellfrey","Street barricade","Seine canal barge"], 2,
    "Sixty-three turntable cues per performance carried Jean Valjean seamlessly through sewers and student uprisings without dropping the curtain!"),

  g("FINE ARTS", 1, "geodesic_dome_buckminster_fuller_expo_67",
    "Towering 20 stories high as the U.S. Pavilion at Montreal’s Expo 67, Buckminster Fuller’s clear acrylic sphere popularized what triangle-grid shell?",
    ["A Mansard vault","A Quonset arch","A Flying rotunda","A geodesic dome"], 3,
    "Triangles distribute compression and tension evenly with zero interior pillars—making geodesic spheres grow \"lighter\" per cubic foot as they scale up!"),

  g("FINE ARTS", 1, "xian_terracotta_army_8000_unique_clay_faces",
    "Unearthed by well-diggers in 1974 China, Emperor Qin’s buried army guards his tomb with roughly how many clay warriors?",
    ["8,000 clay warriors","800 clay warriors","2,500 clay warriors","25,000 clay warriors"], 0,
    "Artisans mixed modular ears, noses, mustaches, and hairstyles with hand carving so no two archers, generals, or charioteers share the same face!",
    {"numeric":{"target":8000,"min":500,"max":15000,"step":500,"unit":"warriors"}}),

  g("FINE ARTS", 1, "leonardo_da_vinci_mirror_writing_left_hand",
    "Why did left-handed Leonardo da Vinci write thousands of personal notebook pages backward from right to left?",
    ["Dodged Medici tax spies","Kept wet ink unsmudged","Saved costly goose quills","Copied Arabic star charts"], 1,
    "Pulling a left hand right-to-left across rag paper kept his knuckles ahead of fresh iron-gall ink—though he wrote normally whenever addressing patrons!"),

  g("FINE ARTS", 2, "last_supper_flaking_tempera_on_dry_plaster",
    "Why did Leonardo’s \"The Last Supper\" begin flaking off its Milan wall within twenty years while Michelangelo’s Sistine fresco stayed bonded?",
    ["Monks scrubbed it weekly","Napoleon’s troops shot it","Painted on dry plaster","Used cheap lead pigment"], 2,
    "True \"buon fresco\" locks fast into wet lime; wanting slow oil-like shading, Leonardo painted tempera-oil atop dry stone above a steamy kitchen!"),

  g("FINE ARTS", 2, "leonardo_sfumato_mona_lisa_smoky_soft_corners",
    "From the Italian word for \"smoke,\" what gossamer glazing technique softens the corners of the \"Mona Lisa\" smile?",
    ["Sharp impasto knife","Scraffito scratching","Pointillist stippling","Smoky sfumato glaze"], 3,
    "X-ray scans show up to 30 microscopic translucent layers thinner than a human hair—erasing hard outlines so peripheral vision catches a grin!"),

  g("FINE ARTS", 2, "taj_mahal_four_minarets_lean_slightly_outward",
    "Peer closely at the Taj Mahal’s four slender marble minarets: 17th-century architects deliberately tilted all four towers slightly where?",
    ["Outward from the dome","Inward toward Mecca","Clockwise into winds","North toward Agra Fort"], 0,
    "If a major earthquake ever toppled the 130-foot towers, their subtle outward tilt drops every marble block harmlessly into the gardens!"),

  g("FINE ARTS", 1, "forbidden_city_timber_brackets_zero_iron_nails",
    "Riding out 200+ earthquakes in Beijing since 1420, the Forbidden City’s grand wooden palace roofs flex safely using puzzle brackets and zero what?",
    ["Clay roof tiles","Hammered iron nails","Granite column bases","Carved cedar beams"], 1,
    "Called \"dougong\", interlocking wooden brackets slide and absorb seismic shockwaves like giant wooden springs without cracking!"),

  g("FINE ARTS", 2, "brunelleschi_florence_duomo_double_shell_1436",
    "Raising history’s largest masonry dome over Florence in 1436 \"without\" ground timber scaffolding was the masterstroke of which Renaissance mind?",
    ["Donatello di Betto","Sandro Botticelli","Filippo Brunelleschi","Giorgio Vasari"], 2,
    "Trained as a clockmaker and goldsmith, Brunelleschi invented ox-driven reversible hoists and nested an inner dome inside a lighter outer weather shell!"),

  g("FINE ARTS", 2, "jan_van_eyck_was_here_1434_latin_graffiti",
    "Right above the convex wall mirror in 1434’s \"Arnolfini Portrait\", Flemish oil pioneer Jan van Eyck painted ornate Latin words saying what?",
    ["Love conquers time","Painted by candlelight","Bruges guild approved","Jan van Eyck was here"], 3,
    "Zoom into that three-inch mirror beneath \"\"Johannes de Eyck fuit hic\"\" and two tiny visitors—likely including the painter himself—stand in the doorway!"),

  g("FINE ARTS", 1, "rembrandt_chiaroscuro_candlelit_spotlight_dark",
    "Combining Italian words for \"light-dark,\" Baroque masters like Rembrandt lifted glowing faces out of shadow via what?",
    ["Chiaroscuro contrast","Pastel gouache wash","Flat fresco gilding","Grisaille underdraw"], 0,
    "Spotlight-like chiaroscuro inspired early Hollywood cinematographers, who literally nicknamed dramatic side-cheek triangle lighting \"Rembrandt lighting\"!"),

  g("FINE ARTS", 2, "vermeer_widow_paid_delft_baker_two_paintings",
    "Leaving eleven children and crushing debt behind in 1675 Delft, Johannes Vermeer forced his widow Catharina to settle a huge family bill for what with two paintings?",
    ["Imported silk lace","Years of bakery bread","Tulip bulb futures","Canal barge tolls"], 1,
    "Master baker Hendrick van Buyten accepted two priceless Vermeers to cover over 600 guilders of unpaid loaves!"),

  g("FINE ARTS", 2, "mens_suit_bottom_button_unbuttoned_edward_vii",
    "Tailoring etiquette still dictates leaving the bottom button of a suit vest or jacket undone—copying which portly British monarch after 1901?",
    ["King George III","Prince Albert","King Edward VII","King Henry VIII"], 2,
    "Fond of multi-course banquets, \"Bertie\" unbuttoned his tight bottom waistcoat button for comfort—and polite courtiers immediately copied him worldwide!"),

  g("FINE ARTS", 1, "bikini_swimsuit_1946_louis_reard_atomic_test",
    "Debuting a tiny four-triangle swimsuit at a Paris pool in July 1946, French engineer Louis Réard named it after headlines from four days earlier where?",
    ["Monte Carlo Casino","Cannes Film Beach","Capri Blue Grotto","Bikini Atoll tests"], 3,
    "Billed as \"smaller than the world’s smallest bathing suit,\" Réard bet his daring two-piece would spark an atomic-scale cultural sensation!"),

  g("FINE ARTS", 2, "tuxedo_jacket_1886_griswold_lorillard_country",
    "Why do Americans call a black-tie satin-lapel evening jacket a \"tuxedo\" instead of the British \"dinner jacket\"?",
    ["Debuted at Tuxedo Park","Named for silk weaver","Cut from tuxedo wool","Worn by Mayor Tuxedo"], 0,
    "Young tobacco heir Griswold Lorillard scandalized New York’s exclusive Tuxedo Park Autumn Ball in October 1886 by chopping off his swallowtails!"),

  g("FINE ARTS", 1, "levi_strauss_jacob_davis_copper_pocket_rivets",
    "Miners kept ripping heavy pockets off work pants until Jacob Davis and Levi Strauss reinforced denim in 1873 with what?",
    ["Waxed leather patches","Hammered copper rivets","Double brass zippers","Braided horsehair seams"], 1,
    "Snipping copper horse-blanket rivets onto pocket corners birthed Patent #139,121—the classic blue jeans silhouette still worn everywhere today!"),

  g("FINE ARTS", 2, "burberry_trench_coat_ww1_belt_d_rings",
    "Brass \"D-rings\" stitched onto classic gabardine trench coat belts weren’t high-fashion flair—WWI officers clipped map cases, binoculars, and what there?",
    ["Silver pocket flasks","Rolled wool blankets","Hand grenades & swords","Wire-cutter shears"], 2,
    "Shoulder straps held officer rank badges while storm flaps cushioned rifle kickback in muddy trenches before Humphrey Bogart made the coat cinema cool!"),

  g("FINE ARTS", 3, "bayeux_linen_230_feet_wool_embroidery_stitch",
    "Chronicle of 1066’s Battle of Hastings, the famous medieval Bayeux hanging is actually crewel wool embroidery stitched across roughly how many feet of linen?",
    ["65 feet of linen","120 feet of linen","380 feet of linen","230 feet of linen"], 3,
    "Eight shades of plant-dyed wool yarn gallop 626 people, 202 horses, and Halley’s Comet across nine joined panels—never woven on a loom!",
    {"numeric":{"target":230,"min":50,"max":400,"step":10,"unit":"feet"}}),

  g("FINE ARTS", 3, "stradivarius_violins_little_ice_age_dense_spruce",
    "Dendrochronologists studying 1700s Cremona violins argue Antonio Stradivari’s ringing soundplates owe extra stiffness to alpine spruce slowed by what?",
    ["The Little Ice Age","Salty Adriatic winds","Full-moon timber cuts","Volcanic ash soil"], 0,
    "Chilly Maunder Minimum summers between 1645 and 1715 grew unusually narrow, even-density wood rings ideal for acoustic resonance!"),

  g("FINE ARTS", 3, "botticelli_primavera_500_painted_plants",
    "Botanists studying Sandro Botticelli’s lush 1482 \"Primavera\" in Florence’s Uffizi have counted roughly how many distinct painted plants underfoot?",
    ["45 painted plants","500 painted plants","120 painted plants","900 painted plants"], 1,
    "Nearly 190 distinct floral species—from wild strawberries and cornflowers to irises—bloom simultaneously regardless of real Tuscan seasons!",
    {"numeric":{"target":500,"min":40,"max":900,"step":20,"unit":"plants"}}),

  g("FINE ARTS", 1, "michelangelo_pieta_only_signed_sash_carving",
    "Overhearing visitors credit a Milan rival for his 1499 marble \"Pietà\", 24-year-old Michelangelo slipped in at night to carve his ONLY signature across what?",
    ["The marble base step","A folded robe hem","Mary’s diagonal sash","Behind Mary’s left ear"], 2,
    "Chiseling \"\"MICHAEL ANGELUS BONAROTUS FLORENT FACIEBAT\"\" across her chest, he instantly regretted his burst of pride and swore never to sign again!"),

  g("FINE ARTS", 2, "michelangelo_moses_horns_hebrew_translation",
    "Tourists in Rome blink twice at Michelangelo’s marble \"Moses\" sprouting two small horns—sparked by St. Jerome translating Hebrew qaran (\"shone\") as what?",
    ["Crowned with olive","Braided with fire","Haloed in gold","Grew animal horns"], 3,
    "Without written vowels, Hebrew q-r-n could mean radiant beams of light OR horns—steering a thousand years of medieval and Renaissance sculpture!"),

  g("FINE ARTS", 1, "machu_picchu_ashlar_granite_zero_mortar_quake",
    "Inca masons shaped Machu Picchu’s granite blocks without mortar so tightly a credit card won’t slip in—allowing walls during earthquakes to do what?",
    ["Dance & resettle snug","Lock rigid like steel","Drain mountain mud","Shatter sacrificial caps"], 0,
    "Without brittle mortar cracking apart, beveled multi-angled stones shimmy during Peruvian tremors and drop right back into their jigsaw seats!"),

  g("FINE ARTS", 2, "tiffany_dragonfly_leaded_copper_foil_seam",
    "Instead of thick medieval church lead bars, Tiffany Studios pieced intricate curved dragonfly and wisteria lamps together by wrapping glass edges in what?",
    ["Braided silver wire","Adhesive copper foil","Molten pewter paste","Shellac silk ribbon"], 1,
    "Beeswax-backed copper foil tape let artisans solder hundreds of tiny pebble-and-confetti glass shards along delicate organic curves!"),

  g("FINE ARTS", 3, "wedgwood_jasperware_matte_blue_white_cameos",
    "Matte pastel \"Wedgwood Blue\" teapots adorned with crisp white classical reliefs turned Josiah Wedgwood into a global name via what stoneware?",
    ["Tin-glazed Majolica","Bone-ash Celadon","Un-glazed Jasperware","Salt-fired Delftware"], 2,
    "After 5,000 kiln trials in 1770s Staffordshire, Wedgwood perfected barium-sulfate stoneware tinted through the body with cobalt oxide!"),

  g("FINE ARTS", 1, "pointillism_seurat_optical_color_mixing_eye",
    "Rather than muddying blue and yellow paint together on his palette to get green, Pointillist Georges Seurat placed tiny pure dots side by side to blend where?",
    ["Under wet turpentine","Across glossy varnish","Through convex glass","In the viewer’s eye"], 3,
    "Step right up to Seurat’s \"Sunday Afternoon\" in Chicago and you see confetti specks; step back ten feet and optical mixing fuses luminous summer grass!"),

  g("FINE ARTS", 1, "camera_smile_victorian_long_exposure_blur",
    "Why do 1840s daguerreotype ancestors stare solemnly with closed lips instead of flashing toothy grins like modern camera-phone selfies?",
    ["Long exposures blurred","Grins broke church law","Flash powder burned lips","Teeth cost extra silver"], 0,
    "Holding a wide grin steady for 20+ seconds twitched into a ghostly blur—plus Victorian portrait etiquette favored formal oil-painting poise!"),

  g("FINE ARTS", 3, "gutenberg_oil_based_linseed_soot_metal_ink",
    "Watery quill-pen ink beaded helplessly off Johann Gutenberg’s metal type—so around 1450 he formulated tacky printing ink from boiled linseed oil, varnish, and what?",
    ["Crushed oak galls","Lampblack soot","Cuttlefish sepia","Ground slate ash"], 1,
    "Borrowing oil-paint chemistry from Flemish easel painters let ink cling evenly to lead-tin-antimony letters—still gleaming jet-black 575 years later!"),

  g("FINE ARTS", 2, "uffizi_gallery_florence_medici_offices_origin",
    "Home to Botticelli’s masterpieces in Florence, what does the museum name \"Uffizi\" literally mean in Italian from its 1560 Cosimo de’ Medici roots?",
    ["Sacred Treasure Hall","Painted River Loggia","Government Offices","Goldsmiths’ Guild"], 2,
    "Built by Giorgio Vasari to house Florentine magistrates’ administrative offices, its top-floor corridor became Europe’s oldest public museum!"),

  g("FINE ARTS", 1, "winged_victory_samothrace_stone_warship_prow",
    "Standing wind-swept atop the Louvre’s grand staircase, the headless \"Winged Victory\" alights onto a carved stone what?",
    ["Marble chariot wheel","Coiled sea-serpent back","Broken Ionic column","Greek warship prow"], 3,
    "Carved around 190 BCE so spray and sea wind seemed to whip wet drapery against Nike’s legs, her marble ship base came from Rhodes!"),

];
