// ============================================================================
// WORLD'S SMARTEST: 1966 IN LIVING COLOR (v9.0 Production Release)
// `src/v9/ShowroomAndCatalogsV9.ts`
// Isolated Showroom Currency, 96-Item-Ready Prize/Zonk Catalogs, Unowned-First
// Non-Repeating Dealing, Curtain Gamble (2-Zonk Pity Shield, 94.39% Maxed RTP),
// 12 Fair Cosmetics, 4 Winner's Den Tiers, 7 VIP Celebrities, 8 Sweeps Sponsors,
// 5-Lane 120Hz Starburst Plinko Physics (<= 91.4% RTP), 6 Vibe Packs,
// 4 Season Visual Specs & Gouache Atlas Manifest Loader.
// ============================================================================

import {
  ALL_CATEGORIES_V7,
  type AtlasManifestV9,
  type AtlasSpriteEntryV9,
  type CategoryIdV7,
  type CosmeticItemV9,
  type CurtainDoorOutcomeV9,
  type CurtainGambleResultV9,
  type DenTierSpecV9,
  type GrandPrizeIdV9,
  type PlinkoLaneIndexV9,
  type PlinkoModeV9,
  type PlinkoOutcomeV9,
  type PrizeItemV9,
  type SeasonIdV7,
  type SeasonVisualSpecV9,
  type ShowroomStateV9,
  type SponsorIdV9,
  type SponsorPlaqueSpecV9,
  type SweepsNightNumberV9,
  type SweepsWeekStateV9,
  type VibePackIdV9,
  type VibePackSpecV9,
  type VipBluffScenarioV9,
  type VipCelebIdV9,
  type VipCelebritySpecV9,
  type ZonkItemV9,
} from '../v7/contracts_v7';

export const SHOWROOM_SAVE_KEY_V9 = 'ws_v9_showroom_save_1';
export const SWEEPS_SAVE_KEY_V9 = 'ws_v9_sweeps_save_1';
export const CURTAIN_ENTRY_COST_SC = 750;
export const PLINKO_ENTRY_COST_SC = 400;
export const RECENT_OFFERED_CAP_V9 = 12;
export const MAX_DEN_PINS_V9 = 15;

// ----------------------------------------------------------------------------
// 1. SSR/Node-Safe Storage Adapter & Currency Rounding Helpers
// ----------------------------------------------------------------------------

const memoryStorageFallbackV9 = new Map<string, string>();

function readRawStorageV9(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // Fall back to in-memory store
  }
  return memoryStorageFallbackV9.get(key) ?? null;
}

function writeRawStorageV9(key: string, serialized: string): void {
  memoryStorageFallbackV9.set(key, serialized);
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, serialized);
      return;
    }
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, serialized);
    }
  } catch {
    // Ignore quota/sandbox exceptions; memory fallback retains state
  }
}

function sanitizeFiniteNonNegIntV9(
  val: unknown,
  fallback = 0,
  max = 100_000_000,
): number {
  if (val === null || val === undefined || typeof val === 'boolean' || val === '') {
    return fallback;
  }
  const n = Number(val);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(0, Math.floor(n)));
}

export function roundTo5SC(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.max(0, Math.round(amount / 5) * 5);
}

// ----------------------------------------------------------------------------
// 2. Prize, Zonk, Cosmetic & Winner's Den Catalogs (96-Item Expandable)
// ----------------------------------------------------------------------------

/**
 * Full 96-Item 1966 Prize & Zonk Catalog (`72` Showcase Prizes + `24` Collectible Zonks)
 * spanning Chapters 1..10 (`Episodes 1..90` in 9-episode waves), Seasons 1..4, and Den Room Slots.
 */
export const GRAND_PRIZE_CATALOG_V9: readonly PrizeItemV9[] = [
  { targetId: 'prize_drip_o_lator', name: 'Copper Sunburst Electric Percolator', tier: 1, priceSC: 360, chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Brews twelve cups of jet-fuel coffee before the morning weather report!' },
  { targetId: 'prize_lava_lamp', name: 'Astro-Glow Space Age Lava Lamp', tier: 1, priceSC: 390, chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: "Hypnotic swirling wax blobs! The closest you'll get to orbit without NASA!" },
  { targetId: 'prize_blender_beehive', name: 'Turquoise Beehive Chrome Blender', tier: 1, priceSC: 420, chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Pulverizes ice cubes and doubts into silky-smooth Daiquiris in four seconds!' },
  { targetId: 'prize_toaster', name: 'Sunburst Chrome 4-Slice Toaster', tier: 1, priceSC: 450, chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Reflects your radiant smile while turning plain bread into tomorrow!' },
  { targetId: 'prize_polaroid_swinger', name: 'Instant Swinger Land Camera', tier: 1, priceSC: 480, chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Develops glossy black-and-white party snaps in sixty thrilling seconds!' },
  { targetId: 'prize_transistor_pocket', name: 'Starlight Transistor Pocket Radio', tier: 1, priceSC: 520, chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Hear the Top 40 countdown from the beach, the patio, or the bleachers!' },
  { targetId: 'prize_starburst_clock', name: 'Brass Atomic Starburst Wall Clock', tier: 1, priceSC: 590, chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Twelve walnut-and-brass rays keep your den ticking at crisp 1966 tempo!' },
  { targetId: 'prize_rotary_phone', name: 'Aqua Princess Rotary Phone', tier: 1, priceSC: 650, chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Twenty-five feet of coiled cord so you can pace every room in the house!' },
  { targetId: 'prize_waffle_baker', name: 'Chrome Reversible Belgian Waffle Baker', tier: 1, priceSC: 680, chapterUnlock: 2, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Flips one hundred eighty degrees for crispy Sunday brunch perfection!' },
  { targetId: 'prize_bar_cart', name: 'Brass & Smoked-Glass Rolling Bar Cart', tier: 1, priceSC: 720, chapterUnlock: 2, seasonAffinity: 1, roomSlot: 'ALCOVE', copy: 'Wheels effortlessly from the den to the terrace with zero martini spills!' },
  { targetId: 'prize_tiki_cocktail_set', name: 'Polynesian Ceramic Tiki Punch Set', tier: 1, priceSC: 760, chapterUnlock: 2, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Six grinning stoneware mugs ready for rum, pineapple, and tiny umbrellas!' },
  { targetId: 'prize_hair_dryer_hood', name: 'Harvest Gold Bonnet Hair Dryer', tier: 1, priceSC: 810, chapterUnlock: 2, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Salon-quality bouffant volume right at the kitchen table with zero rollers!' },
  { targetId: 'prize_ice_crusher', name: 'Harvest Gold Space-Dome Ice Crusher', tier: 1, priceSC: 850, chapterUnlock: 2, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Turns stubborn freezer trays into crunchy snowball mountains in a snap!' },
  { targetId: 'prize_typewriter_coral', name: 'Coral Portable Mod Typewriter', tier: 1, priceSC: 910, chapterUnlock: 2, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Snap-clack your Great American Novel in dashing coral-and-cream lacquer!' },
  { targetId: 'prize_fondue_set', name: 'Avocado Fondue Carousel', tier: 1, priceSC: 950, chapterUnlock: 2, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Twelve color-coded forks! Essential for every 1966 suburban key-party.' },
  { targetId: 'prize_vinyl_suitcase_player', name: 'Two-Tone Portable 45 RPM Record Player', tier: 2, priceSC: 1050, chapterUnlock: 3, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Stacks ten hot 45s on the spindle so the patio twist never stops!' },
  { targetId: 'prize_egg_chair', name: 'Tangerine Swivel Pod Egg Chair', tier: 2, priceSC: 1180, chapterUnlock: 3, seasonAffinity: 1, roomSlot: 'ALCOVE', copy: 'Fiberglass shell and tufted tangerine cushions built for deep lounging!' },
  { targetId: 'prize_super8_camera', name: 'Bell & Howell Super-8 Movie Camera', tier: 2, priceSC: 1260, chapterUnlock: 3, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Capture backyard barbecues in vivid living color with automatic zoom!' },
  { targetId: 'prize_mod_luggage', name: 'Peacock Hard-Shell 4-Piece Luggage Set', tier: 2, priceSC: 1350, chapterUnlock: 3, seasonAffinity: 1, roomSlot: 'TRAVEL_WALL', copy: 'Scuff-proof molded shells ready for Pan-Am overhead racks and bellhops!' },
  { targetId: 'prize_patio_hibachi', name: 'Cast-Iron Redwood Patio Grill Cart', tier: 2, priceSC: 1440, chapterUnlock: 3, seasonAffinity: 1, roomSlot: 'GARAGE_TERRACE', copy: 'Rolls out to the lawn for sizzling sirloins under the tiki torches!' },
  { targetId: 'prize_mink_stole', name: 'Champagne-Blonde Studio Mink Stole', tier: 2, priceSC: 1520, chapterUnlock: 3, seasonAffinity: 1, roomSlot: 'ALCOVE', copy: 'Drapes over your shoulders like opening night at the Waldorf-Astoria!' },
  { targetId: 'prize_hifi_credenza', name: 'Walnut Hi-Fi Stereo Credenza', tier: 2, priceSC: 1600, chapterUnlock: 3, seasonAffinity: 1, roomSlot: 'ALCOVE', copy: 'Warm tube stereo sound plus a secret drop-down bar for martini emergencies!' },
  { targetId: 'prize_reel_to_reel', name: 'Brushed-Chrome Reel-to-Reel Tape Deck', tier: 2, priceSC: 1550, chapterUnlock: 4, seasonAffinity: 2, roomSlot: 'CREDENZA', copy: 'Twin seven-inch spinning reels record your dinner party jazz in hi-fi!' },
  { targetId: 'prize_patio_umbrella_set', name: 'Striped Riviera Patio Table & Umbrella', tier: 2, priceSC: 1620, chapterUnlock: 4, seasonAffinity: 2, roomSlot: 'GARAGE_TERRACE', copy: 'Scalloped tangerine-and-cream awning with four wrought-iron swivel chairs!' },
  { targetId: 'prize_slr_camera_kit', name: 'Chrome 35mm SLR Camera & Telephoto Kit', tier: 2, priceSC: 1660, chapterUnlock: 4, seasonAffinity: 2, roomSlot: 'CREDENZA', copy: 'Leather-trimmed rangefinder body with three razor-sharp brass-ring lenses!' },
  { targetId: 'prize_sewing_cabinet', name: 'Walnut Zig-Zag Console Sewing Machine', tier: 2, priceSC: 1700, chapterUnlock: 4, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'Tailor your own Carnaby Street A-line dresses between evening broadcasts!' },
  { targetId: 'prize_telescope_brass', name: 'Equatorial Refractor Brass Telescope', tier: 2, priceSC: 1740, chapterUnlock: 4, seasonAffinity: 2, roomSlot: 'GARAGE_TERRACE', copy: 'Spot the Sea of Tranquility from your backyard before Apollo gets there!' },
  { targetId: 'prize_go_go_wardrobe', name: 'Carnaby Mod Boots & Mini-Coat Trunk', tier: 2, priceSC: 1770, chapterUnlock: 4, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'White patent go-go boots, houndstooth trench, and geometric sunglasses!' },
  { targetId: 'prize_fireplace_cone', name: 'Atomic Tangerine Cone Fireplace', tier: 2, priceSC: 1800, chapterUnlock: 4, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'Freestanding enameled steel hearth that warms every ski lodge and den!' },
  { targetId: 'prize_color_tv', name: 'RCA "In Living Color" Floor TV', tier: 3, priceSC: 2200, chapterUnlock: 5, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'See every brass horn and sequined gown in dazzling 1966 Living Color!' },
  { targetId: 'prize_jukebox_bubbler', name: 'Chrome & Neon 45s Studio Jukebox', tier: 3, priceSC: 2450, chapterUnlock: 5, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'Holds one hundred glowing singles behind curved glass and rainbow tubes!' },
  { targetId: 'prize_surfboard_woodie', name: 'Hand-Shaped Balsa Longboard Surfboard', tier: 3, priceSC: 2600, chapterUnlock: 5, seasonAffinity: 2, roomSlot: 'GARAGE_TERRACE', copy: 'Nine feet of glossy racing-striped fiberglass ready for Malibu swells!' },
  { targetId: 'prize_golf_set_cart', name: 'Pro Staff Leather Golf Bag & Electric Cart', tier: 3, priceSC: 2850, chapterUnlock: 5, seasonAffinity: 2, roomSlot: 'GARAGE_TERRACE', copy: 'Fourteen forged irons and a folding chrome caddy for Sunday country clubs!' },
  { targetId: 'prize_hammond_spinet', name: 'Walnut Spinet Home Organ & Bench', tier: 3, priceSC: 3000, chapterUnlock: 5, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'Dual keyboards and booming bass pedals bring the TV showband home!' },
  { targetId: 'prize_slate_pool_table', name: 'Peacock-Felt Championship Billiard Table', tier: 3, priceSC: 3150, chapterUnlock: 5, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'Solid slate bed, brass corner pockets, and turned walnut rack of cues!' },
  { targetId: 'prize_mod_scooter', name: 'Tangerine Mod Scooter & Helmet', tier: 3, priceSC: 3200, chapterUnlock: 5, seasonAffinity: 2, roomSlot: 'GARAGE_TERRACE', copy: 'Zip down Sunset Boulevard at a blistering thirty-two miles per hour!' },
  { targetId: 'prize_pinball_machine', name: 'Space-Rocket Backglass Pinball Cabinet', tier: 3, priceSC: 3350, chapterUnlock: 6, seasonAffinity: 3, roomSlot: 'ALCOVE', copy: 'Chrome flippers, pop bumpers, and chiming brass bells for basement champs!' },
  { targetId: 'prize_lounge_chair_ottoman', name: 'Molded Rosewood Lounge Chair & Ottoman', tier: 3, priceSC: 3500, chapterUnlock: 6, seasonAffinity: 3, roomSlot: 'ALCOVE', copy: 'Supple butter-cream leather and curved rosewood shells fit for an exec!' },
  { targetId: 'prize_riding_mower', name: 'Harvest-Gold Chrome Lawn Tractor', tier: 3, priceSC: 3650, chapterUnlock: 6, seasonAffinity: 3, roomSlot: 'GARAGE_TERRACE', copy: 'Manicure half an acre in fifteen minutes while sipping iced lemonade!' },
  { targetId: 'prize_tiki_bar_set', name: 'Bamboo & Rattan Backyard Tiki Pavilion', tier: 3, priceSC: 3800, chapterUnlock: 6, seasonAffinity: 3, roomSlot: 'GARAGE_TERRACE', copy: 'Thatched canopy, carved stools, and brass lantern glow for midnight luaus!' },
  { targetId: 'prize_acapulco_getaway', name: 'Acapulco Cliffside Holiday for Two', tier: 3, priceSC: 3950, chapterUnlock: 6, seasonAffinity: 3, roomSlot: 'TRAVEL_WALL', copy: 'Five sun-drenched nights watching cliff divers with mango cocktails in hand!' },
  { targetId: 'prize_sauna_barrel', name: 'Cedar Home Sauna & Copper Bucket', tier: 3, priceSC: 4080, chapterUnlock: 6, seasonAffinity: 3, roomSlot: 'GARAGE_TERRACE', copy: 'Finnish red-cedar steam cabin with glowing hot stones right off the patio!' },
  { targetId: 'prize_fiberglass_runabout', name: 'Turquoise Fiberglass Ski Boat & Outboard', tier: 3, priceSC: 4200, chapterUnlock: 6, seasonAffinity: 3, roomSlot: 'GARAGE_TERRACE', copy: 'Fourteen feet of gleaming tail-finned hull built for Lake Tahoe wakes!' },
  { targetId: 'prize_niagara_honeymoon', name: 'Niagara & Montreal Expo Travel Suite', tier: 3, priceSC: 4550, chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'TRAVEL_WALL', copy: 'First-class sleeper train tickets and penthouse views of the roaring falls!' },
  { targetId: 'prize_snowmobile_rally', name: 'Atomic-Orange Alpine Snowmobile', tier: 3, priceSC: 4750, chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'GARAGE_TERRACE', copy: 'Twin-ski winter cruiser built to tear across freshly powdered trails!' },
  { targetId: 'prize_diamond_watch', name: 'Champagne-Gold Swiss Chronograph Watch', tier: 3, priceSC: 4950, chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'CREDENZA', copy: 'Eighteen-karat bracelet and sunburst dial accurate to the split second!' },
  { targetId: 'prize_hawaii_luau_trip', name: 'Waikiki Outrigger & Surf Resort Week', tier: 3, priceSC: 5150, chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'TRAVEL_WALL', copy: 'Jet nonstop to Honolulu for catamarans, orchid leis, and sunset luaus!' },
  { targetId: 'prize_dune_buggy', name: 'Metal-Flake Cerise Sand Dune Buggy', tier: 3, priceSC: 5350, chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'GARAGE_TERRACE', copy: 'Exposed chrome engine, knobby tires, and roll bar built for desert surf!' },
  { targetId: 'prize_convertible', name: '1966 Turquoise Convertible Coupe', tier: 3, priceSC: 5500, chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'GARAGE_TERRACE', copy: 'Whitewall tires, push-button AM radio, and wind-whipped hair included!' },
  { targetId: 'prize_home_soda_fountain', name: 'Checkerboard Chrome Soda Fountain Bar', tier: 3, priceSC: 5800, chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'ALCOVE', copy: 'Dual milkshake spindles, syrup pumps, and red vinyl swivel stools!' },
  { targetId: 'prize_airstream_camper', name: 'Polished Silver Airstream Travel Trailer', tier: 4, priceSC: 6200, chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'GARAGE_TERRACE', copy: 'Riveted aerospace aluminum camper with turquoise awning for Route 66!' },
  { targetId: 'prize_swiss_ski_chalet', name: 'Zermatt Alpine Ski Week & Gear', tier: 4, priceSC: 6600, chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Wooden skis, cable-car passes, and crackling Swiss fondue by the slopes!' },
  { targetId: 'prize_emerald_necklace', name: 'Emerald & Baguette Diamond Collar', tier: 4, priceSC: 7000, chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'CREDENZA', copy: 'Velvet presentation box sparkling with red-carpet prime-time brilliance!' },
  { targetId: 'prize_london_carnaby_tour', name: 'Swinging London Double-Decker Tour', tier: 4, priceSC: 7400, chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'First-class BOAC flight, Savile Row tailoring, and Abbey Road strolls!' },
  { targetId: 'prize_silver_tea_service', name: 'Sterling Silver Five-Piece Tea Service', tier: 4, priceSC: 7800, chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'CREDENZA', copy: 'Hand-chased sterling tray, samovar, and goblets worthy of an embassy!' },
  { targetId: 'prize_roman_holiday', name: 'Pan-Am Jet-Set Roman Holiday', tier: 4, priceSC: 8000, chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Two weeks of Roman sunshine, Vespas, and pretending you speak Italian!' },
  { targetId: 'prize_amateur_astronaut_pod', name: 'Space-Age Home Planetarium Dome', tier: 4, priceSC: 8500, chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'ALCOVE', copy: 'Rotating star projector and walnut control console for stargazing indoors!' },
  { targetId: 'prize_tokyo_bullet_tour', name: 'Tokyo Imperial & Shinkansen Tour', tier: 4, priceSC: 9200, chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Ride the gleaming bullet train past Mount Fuji in dazzling modern style!' },
  { targetId: 'prize_african_photo_safari', name: 'East African Serengeti Photo Safari', tier: 4, priceSC: 10200, chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Canvas jeep expeditions, brass binoculars, and luxury starlight camps!' },
  { targetId: 'prize_caribbean_catamaran', name: 'Virgin Islands Private Catamaran Charter', tier: 4, priceSC: 11200, chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Seven turquoise days sailing coral coves with your own captain and chef!' },
  { targetId: 'prize_gullwing_coupe', name: 'Silver-Metallic 1966 Grand Touring Coupe', tier: 4, priceSC: 11800, chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'GARAGE_TERRACE', copy: 'Wire knock-off wheels, wood-rim steering wheel, and continental curves!' },
  { targetId: 'prize_grand_piano', name: 'Studio 6A Grand Champion Piano', tier: 4, priceSC: 12500, chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'ALCOVE', copy: 'The crown jewel of Broadcast Row—signed by the entire 1966 Showband!' },
  { targetId: 'prize_riviera_yacht_party', name: 'Monte Carlo Casino & Riviera Suite', tier: 4, priceSC: 13400, chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Tuxedos, cliffside terraces, and champagne overlooking harbor yachts!' },
  { targetId: 'prize_palm_springs_cabana', name: 'Palm Springs Mid-Century Poolside Cabana', tier: 4, priceSC: 14500, chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'GARAGE_TERRACE', copy: 'Breeze-block privacy wall, kidney pool float, and desert mountain sunset!' },
  { targetId: 'prize_orient_express', name: 'Grand European Orient Express Voyage', tier: 4, priceSC: 15500, chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Mahogany sleeper cars from Paris to Istanbul with silver dining service!' },
  { targetId: 'prize_chris_craft_yacht', name: 'Mahogany Chris-Craft Cabin Cruiser', tier: 4, priceSC: 17000, chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'GARAGE_TERRACE', copy: 'Varnished teak decks, twin V-8 purr, and gleaming brass nautical helm!' },
  { targetId: 'prize_private_island_cove', name: 'Bahamas Coral Cove Beach Villa', tier: 4, priceSC: 18500, chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'White sand hammock, seaplane dock, and endless peacock-blue lagoon!' },
  { targetId: 'prize_gold_bullion_chest', name: 'Velvet-Lined Solid Gold Mint Chest', tier: 4, priceSC: 19800, chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'CREDENZA', copy: 'Stacks of gleaming studio-minted gold bars locked inside walnut & brass!' },
  { targetId: 'prize_swiss_chalet_deed', name: 'Aspen A-Frame Mountain Retreat', tier: 4, priceSC: 21200, chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Floor-to-ceiling triangle glass overlooking snow-dusted evergreen peaks!' },
  { targetId: 'prize_space_age_living_room', name: 'Complete Tomorrowland Living Suite', tier: 4, priceSC: 22500, chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'ALCOVE', copy: 'Curved white sofa, chrome arc lamp, sunken rug, and stereo wall!' },
  { targetId: 'prize_round_the_world_jet', name: 'Pan-Am 30-Day Around-the-World Tour', tier: 4, priceSC: 23800, chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Six continents in first-class sleeper seats with VIP limousine transfers!' },
  { targetId: 'prize_golden_network_key', name: 'Broadcast Row Penthouse & Studio Key', tier: 4, priceSC: 25000, chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'ALCOVE', copy: 'Solid gold starburst key unlocking the legendary Studio 6A Champion Lounge!' },
];

export const ZONK_CATALOG_V9: readonly ZonkItemV9[] = [
  { targetId: 'zonk_clam_juice', name: '400 Cans of Clam Juice', chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: "A full year's supply of lukewarm briny refreshment! Do not shake near upholstery." },
  { targetId: 'zonk_prune_fountain', name: 'Warm Prune Juice Chocolate Fountain', chapterUnlock: 1, seasonAffinity: 1, roomSlot: 'CREDENZA', copy: 'Bubbles merrily at body temperature! Guaranteed to clear any cocktail party.' },
  { targetId: 'zonk_tandem_bike', name: 'No-Pedal Tandem Bike', chapterUnlock: 2, seasonAffinity: 2, roomSlot: 'GARAGE_TERRACE', copy: 'Built for two! Great for coasting downhill—terrible for getting back up.' },
  { targetId: 'zonk_square_wheel_wagon', name: 'Square-Wheeled Backyard Wagon', chapterUnlock: 2, seasonAffinity: 1, roomSlot: 'GARAGE_TERRACE', copy: 'Built for rugged flat-sided inertia! Extra-bumpy rides around the cul-de-sac.' },
  { targetId: 'zonk_banjo_badger', name: 'Taxidermied Banjo Badger', chapterUnlock: 3, seasonAffinity: 1, roomSlot: 'ALCOVE', copy: "Never misses a beat! Mostly because he's been frozen in D-minor since 1958." },
  { targetId: 'zonk_carpeted_bathtub', name: 'Avocado Shag-Carpeted Bathtub', chapterUnlock: 3, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'Soaks up forty gallons of bubble bath and never fully dries until 1974!' },
  { targetId: 'zonk_olive_loaf', name: '14-Foot Unrefrigerated Olive Loaf', chapterUnlock: 4, seasonAffinity: 3, roomSlot: 'CREDENZA', copy: 'Feeds an entire block party—for roughly the next twenty-two minutes!' },
  { targetId: 'zonk_accordion_goose', name: 'Velvet-Caped Accordion Goose', chapterUnlock: 4, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'Honks exclusively in polka time whenever anyone mentions your tax bracket!' },
  { targetId: 'zonk_bowling_ball', name: 'Slightly Damp Bowling Ball ("Al")', chapterUnlock: 5, seasonAffinity: 2, roomSlot: 'ALCOVE', copy: 'Custom-drilled for a left-handed bowler with two thumbs! Towel not included.' },
  { targetId: 'zonk_one_ski', name: 'Single Left-Footed Water Ski', chapterUnlock: 5, seasonAffinity: 2, roomSlot: 'GARAGE_TERRACE', copy: 'Perfect for half a thrill on Lake Tahoe! Right foot sold separately.' },
  { targetId: 'zonk_bow_tie_lobster', name: 'Live Lobster in a Bow Tie ("Gerald")', chapterUnlock: 6, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: "Meet Gerald! He's already deeply disappointed in your game-show strategy." },
  { targetId: 'zonk_tuna_jello_mold', name: 'Three-Tiered Lime-Tuna Jell-O Mold', chapterUnlock: 6, seasonAffinity: 3, roomSlot: 'CREDENZA', copy: 'Wobbles proudly under celery rings! Even the studio cat backed away slowly.' },
  { targetId: 'zonk_upside_down_lamp', name: 'Upside-Down Glass Floor Lamp', chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'ALCOVE', copy: 'Shines straight into your hardwood floor! Great for admiring lost pennies.' },
  { targetId: 'zonk_inflatable_anchor', name: 'Bright Yellow Inflatable Boat Anchor', chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'GARAGE_TERRACE', copy: 'Weighs eleven ounces! Keeps your yacht drifting majestically out to sea.' },
  { targetId: 'zonk_concrete_slippers', name: 'Pastel Fuzzy Concrete Slippers', chapterUnlock: 7, seasonAffinity: 3, roomSlot: 'ALCOVE', copy: 'Forty-two pounds per foot! Ideal for never wandering toward the fridge.' },
  { targetId: 'zonk_silent_tuba', name: 'Cork-Plugged Brass Marching Tuba', chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'ALCOVE', copy: 'Zero brassy racket! Just silent red-faced puffing for the whole neighborhood.' },
  { targetId: 'zonk_cheese_umbrella', name: 'Molded Swiss-Cheese Rain Umbrella', chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'TRAVEL_WALL', copy: 'Lets every refreshing raindrop right through while shading your left ear!' },
  { targetId: 'zonk_giant_cabbage', name: '85-Pound Blue-Ribbon Cabbage', chapterUnlock: 8, seasonAffinity: 4, roomSlot: 'CREDENZA', copy: 'Won third place at the county fair! Now lives rent-free in your parlor.' },
  { targetId: 'zonk_square_records', name: 'Stack of Square-Cornered Vinyl 45s', chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'CREDENZA', copy: 'Clicks rhythmically four times per second before snapping your diamond needle!' },
  { targetId: 'zonk_glass_hammer', name: 'Delicate Hand-Blown Crystal Hammer', chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'CREDENZA', copy: 'Good for exactly one dramatic tap before becoming shimmering confetti!' },
  { targetId: 'zonk_tartan_flamingo', name: 'Seven-Foot Tartan Lawn Flamingo', chapterUnlock: 9, seasonAffinity: 4, roomSlot: 'GARAGE_TERRACE', copy: 'Stares into your dining room window with judgmental highland dignity.' },
  { targetId: 'zonk_mothball_perfume', name: "Gallon Jug of Grandma's Mothball Mist", chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'CREDENZA', copy: 'Turns any elevator ride into an immediate solo VIP experience!' },
  { targetId: 'zonk_screen_submarine', name: 'Two-Seater Screen-Door Submarine', chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'GARAGE_TERRACE', copy: 'Unbeatable ocean breeze below deck! Strictly rated for dry-land diving.' },
  { targetId: 'zonk_bronze_trophy_onion', name: 'Velvet-Mounted Brass Trophy Onion', chapterUnlock: 10, seasonAffinity: 4, roomSlot: 'CREDENZA', copy: 'Commemorates a valiant fourth-place finish! Makes proud winners weep.' },
];

/** 12 100% Fair Studio Cosmetics (zero score stats, zero extra seconds). */
export const COSMETIC_CATALOG_V9: readonly CosmeticItemV9[] = [
  // Podium Trims (4)
  {
    cosmeticId: 'trim_walnut_classic',
    slot: 'PODIUM_TRIM',
    name: 'Walnut Classic Trim',
    priceSC: 0,
    subtitle: 'Original Studio 6A book-matched American walnut lectern trim.',
    accentHex: '#6E3B23',
    trimStyleKey: 'WALNUT_CLASSIC',
  },
  {
    cosmeticId: 'trim_peacock_chrome',
    slot: 'PODIUM_TRIM',
    name: 'Peacock Chrome Trim',
    priceSC: 500,
    subtitle: 'Radiant Peacock Teal bezel wrapped in mirror-polished chrome.',
    accentHex: '#008B94',
    trimStyleKey: 'PEACOCK_CHROME',
  },
  {
    cosmeticId: 'trim_champagne_brass',
    slot: 'PODIUM_TRIM',
    name: 'Champagne Brass Trim',
    priceSC: 900,
    subtitle: 'Fluted Park Avenue brushed brass molding with cream pinstripe.',
    accentHex: '#D9A441',
    trimStyleKey: 'CHAMPAGNE_BRASS',
  },
  {
    cosmeticId: 'trim_carnaby_tangerine',
    slot: 'PODIUM_TRIM',
    name: 'Carnaby Tangerine Trim',
    priceSC: 1500,
    subtitle: 'Googie Sunset Boulevard tangerine lacquer & starburst trim.',
    accentHex: '#FF6B35',
    trimStyleKey: 'CARNABY_TANGERINE',
  },
  // Buzzer Chimes (4)
  {
    cosmeticId: 'buzzer_solenoid_ding',
    slot: 'BUZZER_CHIME',
    name: 'Solenoid Studio Ding',
    priceSC: 0,
    subtitle: 'Crisp 1964 NBC mechanical brass solenoid bell.',
    accentHex: '#F2A922',
    trimStyleKey: 'SOLENOID_DING',
  },
  {
    cosmeticId: 'buzzer_tijuana_horn',
    slot: 'BUZZER_CHIME',
    name: 'Tijuana Horn Stab',
    priceSC: 500,
    subtitle: 'Punchy twin-trumpet brass fanfare lock-in hit.',
    accentHex: '#FF6B35',
    trimStyleKey: 'TIJUANA_HORN',
  },
  {
    cosmeticId: 'buzzer_hammond_b3',
    slot: 'BUZZER_CHIME',
    name: 'Hammond B3 Swell',
    priceSC: 900,
    subtitle: 'Warm rotary-speaker organ chord stab on every lock-in.',
    accentHex: '#008B94',
    trimStyleKey: 'HAMMOND_B3',
  },
  {
    cosmeticId: 'buzzer_sands_bell',
    slot: 'BUZZER_CHIME',
    name: 'Sands Casino Bell',
    priceSC: 1500,
    subtitle: 'High-roller Vegas vibraphone & silver chime shimmer.',
    accentHex: '#D9A441',
    trimStyleKey: 'SANDS_BELL',
  },
  // Trilon Tile Styles (4)
  {
    cosmeticId: 'trilon_acrylite_cream',
    slot: 'TRILON_STYLE',
    name: 'Acrylite Cream Classic',
    priceSC: 0,
    subtitle: 'Warm sunlit #FAF2DF backlit Acrylite panel tiles.',
    accentHex: '#FAF2DF',
    trimStyleKey: 'ACRYLITE_CREAM',
  },
  {
    cosmeticId: 'trilon_cobalt_glass',
    slot: 'TRILON_STYLE',
    name: 'CBS Cobalt Glass',
    priceSC: 600,
    subtitle: 'Broadcast Cobalt frosted glass trilons with cream numerals.',
    accentHex: '#1746A2',
    trimStyleKey: 'COBALT_GLASS',
  },
  {
    cosmeticId: 'trilon_atomic_gold',
    slot: 'TRILON_STYLE',
    name: 'Atomic Gold Foil',
    priceSC: 1100,
    subtitle: 'Harvest Gold sunburst leaf inlay with walnut border.',
    accentHex: '#F2A922',
    trimStyleKey: 'ATOMIC_GOLD',
  },
  {
    cosmeticId: 'trilon_cerise_checker',
    slot: 'TRILON_STYLE',
    name: 'Mod Cerise Checker',
    priceSC: 1800,
    subtitle: 'Carnaby Cerise & cream mod checkerboard accent framing.',
    accentHex: '#E6397A',
    trimStyleKey: 'CERISE_CHECKER',
  },
];

export const DEN_TIER_SPECS_V9: readonly DenTierSpecV9[] = [
  {
    tierId: 'WAITING_ROOM',
    title: 'Studio Green Room',
    subtitle: 'Fresh off the bus in Manhattan—your credenza awaits its first showcase prize!',
    minOwnedPrizes: 0,
    badgeHex: '#6E3B23',
  },
  {
    tierId: 'MOD_STARTER_PAD',
    title: 'Mod Starter Pad',
    subtitle: 'Sunlit Mid-Century studio apartment with walnut shelving and warm terrazzo glow.',
    minOwnedPrizes: 1,
    badgeHex: '#008B94',
  },
  {
    tierId: 'SPLIT_LEVEL_SHOWCASE',
    title: 'Split-Level Showcase',
    subtitle: 'Palm Springs sunken conversation pit brimming with 1966 catalog treasures.',
    minOwnedPrizes: 4,
    badgeHex: '#F2A922',
  },
  {
    tierId: 'NETWORK_PENTHOUSE',
    title: 'Network Penthouse',
    subtitle: 'Park Avenue trophy lounge overlooking Broadcast Row—true champion living!',
    minOwnedPrizes: 7,
    badgeHex: '#E6397A',
  },
];

const PRIZE_BY_ID_V9 = new Map<string, PrizeItemV9>(
  GRAND_PRIZE_CATALOG_V9.map((p) => [p.targetId, p]),
);
const ZONK_BY_ID_V9 = new Map<string, ZonkItemV9>(
  ZONK_CATALOG_V9.map((z) => [z.targetId, z]),
);
const COSMETIC_BY_ID_V9 = new Map<string, CosmeticItemV9>(
  COSMETIC_CATALOG_V9.map((c) => [c.cosmeticId, c]),
);

// ----------------------------------------------------------------------------
// 2b. Dynamic Packed Atlas Filtering (Seeded from 72 Staged PNGs, Live Synced)
// ----------------------------------------------------------------------------

/**
 * Exact 72 staged gouache PNG stems present in `.agents/v9_raw_art/*.png`
 * (`55` Prizes + `6` Zonks + `7` VIPs + `2` Backdrops + `2` Studio Crowd rows).
 * Used pre-fetch before `atlas_manifest_v9.json` resolves or during headless tests.
 */
export const DEFAULT_PACKED_TARGET_IDS_V9: ReadonlySet<string> = new Set<string>([
  // Backdrops (2)
  'curtain_backdrop_stage',
  'den_backdrop_lounge',
  // Studio Crowd rows (2)
  'studio_crowd_back',
  'studio_crowd_front',
  // VIP Celebrities (7)
  'vip_action_jackson',
  'vip_astrid_lindqvist',
  'vip_barnaby_quail',
  'vip_bea_delacroix',
  'vip_frankie_lombardo',
  'vip_kitty_fontaine',
  'vip_zoltan',
  // Zonks (6)
  'zonk_banjo_badger',
  'zonk_bow_tie_lobster',
  'zonk_bowling_ball',
  'zonk_clam_juice',
  'zonk_olive_loaf',
  'zonk_tandem_bike',
  // Prizes (55)
  'prize_acapulco_getaway',
  'prize_airstream_camper',
  'prize_bar_cart',
  'prize_blender_beehive',
  'prize_color_tv',
  'prize_convertible',
  'prize_diamond_watch',
  'prize_drip_o_lator',
  'prize_dune_buggy',
  'prize_egg_chair',
  'prize_emerald_necklace',
  'prize_fiberglass_runabout',
  'prize_fireplace_cone',
  'prize_fondue_set',
  'prize_go_go_wardrobe',
  'prize_golf_set_cart',
  'prize_grand_piano',
  'prize_hair_dryer_hood',
  'prize_hammond_spinet',
  'prize_hawaii_luau_trip',
  'prize_hifi_credenza',
  'prize_home_soda_fountain',
  'prize_ice_crusher',
  'prize_jukebox_bubbler',
  'prize_lava_lamp',
  'prize_lounge_chair_ottoman',
  'prize_mink_stole',
  'prize_mod_luggage',
  'prize_mod_scooter',
  'prize_niagara_honeymoon',
  'prize_patio_hibachi',
  'prize_patio_umbrella_set',
  'prize_pinball_machine',
  'prize_polaroid_swinger',
  'prize_reel_to_reel',
  'prize_riding_mower',
  'prize_roman_holiday',
  'prize_rotary_phone',
  'prize_sauna_barrel',
  'prize_sewing_cabinet',
  'prize_slate_pool_table',
  'prize_slr_camera_kit',
  'prize_snowmobile_rally',
  'prize_starburst_clock',
  'prize_super8_camera',
  'prize_surfboard_woodie',
  'prize_swiss_ski_chalet',
  'prize_telescope_brass',
  'prize_tiki_bar_set',
  'prize_tiki_cocktail_set',
  'prize_toaster',
  'prize_transistor_pocket',
  'prize_typewriter_coral',
  'prize_vinyl_suitcase_player',
  'prize_waffle_baker',
]);

export type AtlasManifestInputV9 =
  | AtlasManifestV9
  | {
      readonly version?: string;
      readonly entries: Readonly<Record<string, AtlasSpriteEntryV9>>;
      readonly sprites?: Readonly<Record<string, AtlasSpriteEntryV9>>;
    };

let loadedPackedManifestV9: AtlasManifestV9 | null = null;
let activePackedTargetIdsV9: ReadonlySet<string> = DEFAULT_PACKED_TARGET_IDS_V9;
let cachedAtlasManifestPromiseV9: Promise<AtlasManifestV9 | null> | null = null;
let cachedAtlasManifestV9: AtlasManifestV9 | null = null;

function extractManifestSpriteRecordV9(
  manifest: AtlasManifestInputV9 | null | undefined,
): Readonly<Record<string, AtlasSpriteEntryV9>> | null {
  if (!manifest || typeof manifest !== 'object') return null;
  const rec = manifest as {
    readonly sprites?: unknown;
    readonly entries?: unknown;
  };
  const hasSpritesObj =
    Boolean(rec.sprites) && typeof rec.sprites === 'object' && !Array.isArray(rec.sprites);
  const hasEntriesObj =
    Boolean(rec.entries) && typeof rec.entries === 'object' && !Array.isArray(rec.entries);

  if (hasSpritesObj) {
    const spritesRec = rec.sprites as Readonly<Record<string, AtlasSpriteEntryV9>>;
    if (!hasEntriesObj || Object.keys(spritesRec).length > 0) {
      return spritesRec;
    }
  }
  if (hasEntriesObj) {
    return rec.entries as Readonly<Record<string, AtlasSpriteEntryV9>>;
  }
  return null;
}

/**
 * Sets the active packed atlas manifest.
 * Passing `null` restores `DEFAULT_PACKED_TARGET_IDS_V9` pre-fetch fallback mode.
 * Passing a manifest dynamically activates the exact `targetId` keys in `manifest.entries` / `manifest.sprites`.
 */
export function setPackedAtlasManifest(manifest: AtlasManifestInputV9 | null): void {
  if (manifest === null) {
    loadedPackedManifestV9 = null;
    cachedAtlasManifestV9 = null;
    cachedAtlasManifestPromiseV9 = null;
    activePackedTargetIdsV9 = DEFAULT_PACKED_TARGET_IDS_V9;
    return;
  }
  const spriteMap = extractManifestSpriteRecordV9(manifest);
  if (!spriteMap) {
    loadedPackedManifestV9 = null;
    cachedAtlasManifestV9 = null;
    activePackedTargetIdsV9 = DEFAULT_PACKED_TARGET_IDS_V9;
    return;
  }
  const normalized: AtlasManifestV9 = {
    version:
      typeof manifest.version === 'string' && manifest.version.length > 0
        ? manifest.version
        : 'WS_V9_ATLAS_1',
    sprites: spriteMap,
  };
  loadedPackedManifestV9 = normalized;
  cachedAtlasManifestV9 = normalized;
  activePackedTargetIdsV9 = new Set<string>(Object.keys(spriteMap));
}

export function isTargetIdPackedV9(targetId: string): boolean {
  return activePackedTargetIdsV9.has(targetId);
}

export function getActivePrizesV9(): readonly PrizeItemV9[] {
  return GRAND_PRIZE_CATALOG_V9.filter((p) => isTargetIdPackedV9(p.targetId));
}

export function getActiveZonksV9(): readonly ZonkItemV9[] {
  return ZONK_CATALOG_V9.filter((z) => isTargetIdPackedV9(z.targetId));
}

const DEFAULT_EQUIPPED_COSMETICS_V9 = {
  PODIUM_TRIM: 'trim_walnut_classic',
  BUZZER_CHIME: 'buzzer_solenoid_ding',
  TRILON_STYLE: 'trilon_acrylite_cream',
} as const;

export function createDefaultShowroomLedgerV9(): ShowroomStateV9 {
  return {
    version: 'WS_V9_SHOWROOM_1',
    showroomCash: 0,
    plinkoTokens: 0,
    freeCurtainTickets: 0,
    consecutiveZonks: 0,
    ownedPrizeIds: [],
    ownedZonkIds: [],
    ownedCosmeticIds: [
      DEFAULT_EQUIPPED_COSMETICS_V9.PODIUM_TRIM,
      DEFAULT_EQUIPPED_COSMETICS_V9.BUZZER_CHIME,
      DEFAULT_EQUIPPED_COSMETICS_V9.TRILON_STYLE,
    ],
    equipped: { ...DEFAULT_EQUIPPED_COSMETICS_V9 },
    recentOfferedIds: [],
    pinnedDenIds: [],
    totalCurtainPulls: 0,
    totalPlinkoDrops: 0,
    lastUpdatedIso: new Date().toISOString(),
  };
}

export function sanitizeShowroomLedgerV9(raw: unknown): ShowroomStateV9 {
  const def = createDefaultShowroomLedgerV9();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return def;
  }
  const rec = raw as Record<string, unknown>;

  const ownedPrizeIds = Array.isArray(rec.ownedPrizeIds)
    ? [...new Set(rec.ownedPrizeIds.filter((id): id is string => typeof id === 'string' && PRIZE_BY_ID_V9.has(id)))]
    : [];
  const ownedZonkIds = Array.isArray(rec.ownedZonkIds)
    ? [...new Set(rec.ownedZonkIds.filter((id): id is string => typeof id === 'string' && ZONK_BY_ID_V9.has(id)))]
    : [];

  const ownedCosmeticsSet = new Set<string>(def.ownedCosmeticIds);
  if (Array.isArray(rec.ownedCosmeticIds)) {
    for (const id of rec.ownedCosmeticIds) {
      if (typeof id === 'string' && COSMETIC_BY_ID_V9.has(id)) {
        ownedCosmeticsSet.add(id);
      }
    }
  }

  const rawEq =
    rec.equipped && typeof rec.equipped === 'object' && !Array.isArray(rec.equipped)
      ? (rec.equipped as Record<string, unknown>)
      : {};
  const pickEquipped = (slot: 'PODIUM_TRIM' | 'BUZZER_CHIME' | 'TRILON_STYLE'): string => {
    const candidate = typeof rawEq[slot] === 'string' ? (rawEq[slot] as string) : '';
    const spec = COSMETIC_BY_ID_V9.get(candidate);
    if (spec && spec.slot === slot && ownedCosmeticsSet.has(candidate)) {
      return candidate;
    }
    return DEFAULT_EQUIPPED_COSMETICS_V9[slot];
  };

  const recentOfferedIds = Array.isArray(rec.recentOfferedIds)
    ? rec.recentOfferedIds
        .filter((id): id is string => typeof id === 'string' && (PRIZE_BY_ID_V9.has(id) || ZONK_BY_ID_V9.has(id)))
        .slice(-RECENT_OFFERED_CAP_V9)
    : [];

  const ownedCombinedSet = new Set<string>([...ownedPrizeIds, ...ownedZonkIds]);
  const pinnedDenIds = Array.isArray(rec.pinnedDenIds)
    ? [
        ...new Set(
          rec.pinnedDenIds.filter(
            (id): id is string => typeof id === 'string' && ownedCombinedSet.has(id),
          ),
        ),
      ].slice(0, MAX_DEN_PINS_V9)
    : [];

  return {
    version: 'WS_V9_SHOWROOM_1',
    showroomCash: sanitizeFiniteNonNegIntV9(rec.showroomCash, 0),
    plinkoTokens: sanitizeFiniteNonNegIntV9(rec.plinkoTokens, 0, 9999),
    freeCurtainTickets: sanitizeFiniteNonNegIntV9(rec.freeCurtainTickets, 0, 9999),
    consecutiveZonks: sanitizeFiniteNonNegIntV9(rec.consecutiveZonks, 0, 99),
    ownedPrizeIds,
    ownedZonkIds,
    ownedCosmeticIds: [...ownedCosmeticsSet],
    equipped: {
      PODIUM_TRIM: pickEquipped('PODIUM_TRIM'),
      BUZZER_CHIME: pickEquipped('BUZZER_CHIME'),
      TRILON_STYLE: pickEquipped('TRILON_STYLE'),
    },
    recentOfferedIds,
    pinnedDenIds,
    totalCurtainPulls: sanitizeFiniteNonNegIntV9(rec.totalCurtainPulls, 0),
    totalPlinkoDrops: sanitizeFiniteNonNegIntV9(rec.totalPlinkoDrops, 0),
    lastUpdatedIso:
      typeof rec.lastUpdatedIso === 'string' && rec.lastUpdatedIso.length > 0
        ? rec.lastUpdatedIso
        : new Date().toISOString(),
  };
}

export function loadShowroomLedgerV9(): ShowroomStateV9 {
  const raw = readRawStorageV9(SHOWROOM_SAVE_KEY_V9);
  if (!raw) return createDefaultShowroomLedgerV9();
  try {
    return sanitizeShowroomLedgerV9(JSON.parse(raw));
  } catch {
    return createDefaultShowroomLedgerV9();
  }
}

export function saveShowroomLedgerV9(ledger: ShowroomStateV9): ShowroomStateV9 {
  const clean = sanitizeShowroomLedgerV9({
    ...ledger,
    lastUpdatedIso: new Date().toISOString(),
  });
  writeRawStorageV9(SHOWROOM_SAVE_KEY_V9, JSON.stringify(clean));
  return clean;
}

export function resetShowroomLedgerV9(): ShowroomStateV9 {
  return saveShowroomLedgerV9(createDefaultShowroomLedgerV9());
}

export function creditShowroomCashV9(
  amount: number,
  _reason?: string,
): ShowroomStateV9 {
  const ledger = loadShowroomLedgerV9();
  const safeDelta = Math.max(0, Math.floor(Number.isFinite(amount) ? amount : 0));
  if (safeDelta <= 0) return ledger;
  ledger.showroomCash += safeDelta;
  return saveShowroomLedgerV9(ledger);
}

export function awardPlinkoTokensV9(count: number): ShowroomStateV9 {
  const ledger = loadShowroomLedgerV9();
  const delta = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  if (delta <= 0) return ledger;
  ledger.plinkoTokens += delta;
  return saveShowroomLedgerV9(ledger);
}

export function awardFreeCurtainTicketsV9(count: number): ShowroomStateV9 {
  const ledger = loadShowroomLedgerV9();
  const delta = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  if (delta <= 0) return ledger;
  ledger.freeCurtainTickets += delta;
  return saveShowroomLedgerV9(ledger);
}

// ----------------------------------------------------------------------------
// 3. Isolated Mode Earn Helpers (100% Win / 50% Consolation Loss)
// ----------------------------------------------------------------------------

export function computeMatchShowroomCashV9(opts: {
  readonly matchPurse: number;
  readonly won: boolean;
  readonly isQuickRematchWin?: boolean;
  readonly isOfficialDailyFirstRun?: boolean;
  readonly mode: 'CAMPAIGN' | 'QUICK' | 'DAILY';
}): number {
  if (opts.mode === 'DAILY' && opts.isOfficialDailyFirstRun === false) {
    return 0;
  }
  const safePurse = Math.max(0, Number.isFinite(opts.matchPurse) ? opts.matchPurse : 0);
  if (opts.won) {
    const base = Math.max(250, roundTo5SC(safePurse));
    const rematchBonus = opts.mode === 'QUICK' && opts.isQuickRematchWin ? 150 : 0;
    return base + rematchBonus;
  }
  return Math.max(150, roundTo5SC(safePurse * 0.5));
}

export function computeBlitzShowroomCashV9(
  blitzScore: number,
  hits: number,
): number {
  if (!Number.isFinite(hits) || hits < 1) return 0;
  const safeScore = Math.max(0, Number.isFinite(blitzScore) ? blitzScore : 0);
  return Math.max(100, roundTo5SC(safeScore));
}

export function computeWinnerCircleShowroomCashV9(
  bonusCashEarned: number,
  sweptAllSix: boolean = false,
): number {
  const base = Math.max(0, roundTo5SC(bonusCashEarned));
  return base + (sweptAllSix ? 500 : 0);
}

export function computeCouchShowdownShowroomCashV9(
  cluesAnswered: number,
): number {
  return cluesAnswered >= 6 ? 300 : 0;
}

export function computeSweepsShowroomCashV9(opts: {
  readonly outcome: 'CASH_OUT' | 'NIGHT_5_WIN' | 'LOSS';
  readonly safeDepositCash: number;
  readonly atRiskCash: number;
  readonly nightPurse: number;
}): number {
  const safeDep = Math.max(0, Number.isFinite(opts.safeDepositCash) ? opts.safeDepositCash : 0);
  const atRisk = Math.max(0, Number.isFinite(opts.atRiskCash) ? opts.atRiskCash : 0);
  const night = Math.max(0, Number.isFinite(opts.nightPurse) ? opts.nightPurse : 0);
  if (opts.outcome === 'NIGHT_5_WIN') {
    return roundTo5SC(safeDep + atRisk + 2500);
  }
  if (opts.outcome === 'CASH_OUT') {
    return roundTo5SC(safeDep + atRisk);
  }
  return Math.max(200, roundTo5SC(safeDep + night * 0.5));
}

// ----------------------------------------------------------------------------
// 4. Unowned-First & Non-Repeating Dealing + Showroom Actions
// ----------------------------------------------------------------------------

export function recordOfferedIdsV9(
  ledger: ShowroomStateV9,
  ids: readonly string[],
): ShowroomStateV9 {
  const next = [...ledger.recentOfferedIds];
  for (const id of ids) {
    if (!id) continue;
    const existingIdx = next.indexOf(id);
    if (existingIdx >= 0) {
      next.splice(existingIdx, 1);
    }
    next.push(id);
  }
  ledger.recentOfferedIds = next.slice(-RECENT_OFFERED_CAP_V9);
  return ledger;
}

function pickNonRepeatingUnownedV9<T extends { readonly targetId: string }>(
  pool: readonly T[],
  ownedSet: ReadonlySet<string>,
  recentSet: ReadonlySet<string>,
  count: number,
  rng: () => number,
): T[] {
  if (pool.length === 0 || count <= 0) return [];
  const tier1 = pool.filter((item) => !ownedSet.has(item.targetId) && !recentSet.has(item.targetId));
  const tier2 = pool.filter((item) => !ownedSet.has(item.targetId) && recentSet.has(item.targetId));
  const tier3 = pool.filter((item) => ownedSet.has(item.targetId) && !recentSet.has(item.targetId));
  const tier4 = pool.filter((item) => ownedSet.has(item.targetId) && recentSet.has(item.targetId));

  const shuffle = (arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  };

  const ordered = [
    ...shuffle(tier1),
    ...shuffle(tier2),
    ...shuffle(tier3),
    ...shuffle(tier4),
  ];
  return ordered.slice(0, Math.min(count, ordered.length));
}

export function getUnlockedPrizesForEpisode(
  episode: number = 90,
  includeUnpacked: boolean = false,
): PrizeItemV9[] {
  const clampedEp = Math.max(1, Math.min(90, Math.floor(episode || 1)));
  const chapter = Math.min(10, Math.max(1, Math.ceil(clampedEp / 9)));
  const source = includeUnpacked ? GRAND_PRIZE_CATALOG_V9 : getActivePrizesV9();
  return source.filter((p) => p.chapterUnlock <= chapter);
}

export function getFeaturedPrizesForEpisode(
  episode: number = 90,
  count: number = 4,
  ledger?: ShowroomStateV9,
  rng: () => number = Math.random,
): PrizeItemV9[] {
  const activeCatalog = getActivePrizesV9();
  if (activeCatalog.length === 0) return [];
  const safeCount = Math.max(1, Math.min(activeCatalog.length, Math.floor(count)));
  const activeLedger = ledger ?? loadShowroomLedgerV9();
  const ownedSet = new Set(activeLedger.ownedPrizeIds);
  const recentSet = new Set(activeLedger.recentOfferedIds);

  const unlocked = getUnlockedPrizesForEpisode(episode, false);
  const unownedUnlocked = unlocked.filter((p) => !ownedSet.has(p.targetId));
  const pool =
    unownedUnlocked.length >= safeCount ? unlocked : activeCatalog;

  const picked = pickNonRepeatingUnownedV9(
    pool,
    ownedSet,
    recentSet,
    safeCount,
    rng,
  );
  if (picked.length > 0) {
    recordOfferedIdsV9(
      activeLedger,
      picked.map((p) => p.targetId),
    );
    if (!ledger) {
      saveShowroomLedgerV9(activeLedger);
    }
  }
  return picked;
}

export function getFeaturedShowcaseItemsV9(opts?: {
  readonly chapterOrEpisode?: number;
  readonly count?: number;
  readonly recordAsOffered?: boolean;
  readonly rng?: () => number;
  readonly ledger?: ShowroomStateV9;
}): PrizeItemV9[];
export function getFeaturedShowcaseItemsV9(
  count: number,
  ledger?: ShowroomStateV9,
  chapterOrEpisode?: number,
): PrizeItemV9[];
export function getFeaturedShowcaseItemsV9(
  optsOrCount?:
    | {
        readonly chapterOrEpisode?: number;
        readonly count?: number;
        readonly recordAsOffered?: boolean;
        readonly rng?: () => number;
        readonly ledger?: ShowroomStateV9;
      }
    | number,
  ledgerArg?: ShowroomStateV9,
  chapterOrEpisodeArg?: number,
): PrizeItemV9[] {
  const opts =
    typeof optsOrCount === 'number'
      ? {
          count: optsOrCount,
          ledger: ledgerArg,
          chapterOrEpisode: chapterOrEpisodeArg,
        }
      : optsOrCount;
  const rng = opts?.rng ?? Math.random;
  const activeCatalog = getActivePrizesV9();
  if (activeCatalog.length === 0) return [];
  const count = Math.max(1, Math.min(activeCatalog.length, Math.floor(opts?.count ?? 4)));
  const rawCh = opts?.chapterOrEpisode ?? 10;
  // Accepts either chapter (1..10) or episode (1..90) seamlessly
  const episode = rawCh > 10 ? Math.min(90, Math.max(1, Math.floor(rawCh))) : Math.min(90, Math.max(1, Math.floor(rawCh) * 9));

  const ledger = opts?.ledger ?? loadShowroomLedgerV9();
  const ownedSet = new Set(ledger.ownedPrizeIds);
  const recentSet = new Set(ledger.recentOfferedIds);

  const chapterPool = getUnlockedPrizesForEpisode(episode, false);
  const unownedInChapter = chapterPool.filter((p) => !ownedSet.has(p.targetId));
  const activePool =
    unownedInChapter.length >= count
      ? chapterPool
      : activeCatalog;

  const picked = pickNonRepeatingUnownedV9(activePool, ownedSet, recentSet, count, rng);
  if (opts?.recordAsOffered !== false && picked.length > 0) {
    recordOfferedIdsV9(
      ledger,
      picked.map((p) => p.targetId),
    );
    if (!opts?.ledger) {
      saveShowroomLedgerV9(ledger);
    }
  }
  return picked;
}

export function togglePinnedDenItemV9(targetId: string): {
  readonly ok: boolean;
  readonly pinned: boolean;
  readonly ledger: ShowroomStateV9;
} {
  const ledger = loadShowroomLedgerV9();
  const isOwned =
    ledger.ownedPrizeIds.includes(targetId) || ledger.ownedZonkIds.includes(targetId);
  if (!isOwned) {
    return { ok: false, pinned: false, ledger };
  }
  const idx = ledger.pinnedDenIds.indexOf(targetId);
  let pinned = false;
  if (idx >= 0) {
    ledger.pinnedDenIds.splice(idx, 1);
    pinned = false;
  } else {
    ledger.pinnedDenIds.push(targetId);
    if (ledger.pinnedDenIds.length > MAX_DEN_PINS_V9) {
      ledger.pinnedDenIds.shift();
    }
    pinned = true;
  }
  return { ok: true, pinned, ledger: saveShowroomLedgerV9(ledger) };
}

export function buyGrandPrizeV9(prizeId: GrandPrizeIdV9): {
  readonly ok: boolean;
  readonly reason?: string;
  readonly prize?: PrizeItemV9;
  readonly ledger: ShowroomStateV9;
} {
  const ledger = loadShowroomLedgerV9();
  const prize = PRIZE_BY_ID_V9.get(prizeId);
  if (!prize) {
    return { ok: false, reason: 'Unknown prize catalog ID.', ledger };
  }
  if (!isTargetIdPackedV9(prize.targetId)) {
    return {
      ok: false,
      reason: `${prize.name} is not currently stocked in the Showcase Atlas.`,
      prize,
      ledger,
    };
  }
  if (ledger.ownedPrizeIds.includes(prize.targetId)) {
    return { ok: false, reason: `You already own ${prize.name}!`, prize, ledger };
  }
  if (ledger.showroomCash < prize.priceSC) {
    return {
      ok: false,
      reason: `Need $${prize.priceSC.toLocaleString()} SC to claim ${prize.name}.`,
      prize,
      ledger,
    };
  }
  ledger.showroomCash -= prize.priceSC;
  ledger.ownedPrizeIds.push(prize.targetId);
  if (!ledger.pinnedDenIds.includes(prize.targetId) && ledger.pinnedDenIds.length < MAX_DEN_PINS_V9) {
    ledger.pinnedDenIds.push(prize.targetId);
  }
  return { ok: true, prize, ledger: saveShowroomLedgerV9(ledger) };
}

export function buyOrEquipCosmeticV9(cosmeticId: string): {
  readonly ok: boolean;
  readonly reason?: string;
  readonly item?: CosmeticItemV9;
  readonly ledger: ShowroomStateV9;
} {
  const ledger = loadShowroomLedgerV9();
  const item = COSMETIC_BY_ID_V9.get(cosmeticId);
  if (!item) {
    return { ok: false, reason: 'Unknown studio cosmetic ID.', ledger };
  }
  const alreadyOwned = ledger.ownedCosmeticIds.includes(item.cosmeticId);
  if (!alreadyOwned) {
    if (ledger.showroomCash < item.priceSC) {
      return {
        ok: false,
        reason: `Need $${item.priceSC.toLocaleString()} SC to unlock ${item.name}.`,
        item,
        ledger,
      };
    }
    ledger.showroomCash -= item.priceSC;
    ledger.ownedCosmeticIds.push(item.cosmeticId);
  }
  ledger.equipped = {
    ...ledger.equipped,
    [item.slot]: item.cosmeticId,
  };
  return { ok: true, item, ledger: saveShowroomLedgerV9(ledger) };
}

export function getCurrentDenTierV9(
  ledger: ShowroomStateV9 = loadShowroomLedgerV9(),
): DenTierSpecV9 {
  const ownedCount = ledger.ownedPrizeIds.length;
  let best = DEN_TIER_SPECS_V9[0];
  for (const tier of DEN_TIER_SPECS_V9) {
    if (ownedCount >= tier.minOwnedPrizes) {
      best = tier;
    }
  }
  return best;
}

// ----------------------------------------------------------------------------
// 5. Curtain Gamble ($750 SC or Free Ticket, 2-Zonk Pity Shield, 94.39% RTP)
// ----------------------------------------------------------------------------

/**
 * Plays a 3-Bay Curtain Gamble pull.
 * Economy Lock (Markov-verified):
 *  - Stationary state weights with 2-Zonk Pity Shield: Door A = 12/39, Door B = 14/39, Door C = 13/39.
 *  - Maxed-catalog payouts: Door A = $150 SC, Door B = $600 SC, Door C = $1,200 SC + 40% Plinko Token (~$348 EV).
 *  - Steady-state maxed EV = (12/39)*150 + (14/39)*600 + (13/39)*(1200 + 0.40*348) = $707.93 < $750 (94.39% RTP).
 *  - Strictly prioritizes unowned Prizes/Zonks and excludes the last 12 `recentOfferedIds` while candidates exist.
 */
export function playCurtainGambleV9(
  chosenBay: 1 | 2 | 3,
  rng: () => number = Math.random,
): CurtainGambleResultV9 {
  const ledger = loadShowroomLedgerV9();
  const usedFreeTicket = ledger.freeCurtainTickets > 0;
  if (!usedFreeTicket && ledger.showroomCash < CURTAIN_ENTRY_COST_SC) {
    return {
      ok: false,
      reason: `Need $${CURTAIN_ENTRY_COST_SC} SC or 1 Free Curtain Ticket to open a Curtain.`,
      usedFreeTicket: false,
      pityShieldTriggered: false,
      chosenBay,
      chosenOutcome: null,
      allBays: [],
      ledger,
    };
  }

  if (usedFreeTicket) {
    ledger.freeCurtainTickets -= 1;
  } else {
    ledger.showroomCash -= CURTAIN_ENTRY_COST_SC;
  }

  const pityShieldTriggered = ledger.consecutiveZonks >= 2;
  const doorKinds: ('ZONK' | 'MID_SHOWCASE' | 'GRAND_SHOWCASE')[] = pityShieldTriggered
    ? ['MID_SHOWCASE', 'MID_SHOWCASE', 'GRAND_SHOWCASE']
    : ['ZONK', 'MID_SHOWCASE', 'GRAND_SHOWCASE'];

  // Fisher-Yates shuffle across Bays 1..3
  for (let i = doorKinds.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = doorKinds[i];
    doorKinds[i] = doorKinds[j];
    doorKinds[j] = tmp;
  }

  const ownedPrizeSet = new Set(ledger.ownedPrizeIds);
  const ownedZonkSet = new Set(ledger.ownedZonkIds);
  const recentSet = new Set(ledger.recentOfferedIds);

  const buildDoorOutcome = (
    bayNumber: 1 | 2 | 3,
    kind: 'ZONK' | 'MID_SHOWCASE' | 'GRAND_SHOWCASE',
    excludeIds: Set<string>,
  ): CurtainDoorOutcomeV9 => {
    if (kind === 'ZONK') {
      const activeZonks = getActiveZonksV9();
      const pool = activeZonks.filter((z) => !excludeIds.has(z.targetId));
      const picked =
        pickNonRepeatingUnownedV9(
          pool.length > 0 ? pool : activeZonks,
          ownedZonkSet,
          recentSet,
          1,
          rng,
        )[0] ?? activeZonks[0];
      if (!picked) {
        return {
          bayNumber,
          kind: 'ZONK',
          targetId: null,
          title: 'Studio Zonk Envelope',
          subtitle: 'Gag-reel consolation prize! Pocket a $150 SC Laugh Rebate!',
          cashAwardedSC: 150,
          plinkoTokenAwarded: false,
          isDuplicateCashEnvelope: true,
        };
      }
      excludeIds.add(picked.targetId);
      const alreadyOwned = ownedZonkSet.has(picked.targetId);
      return {
        bayNumber,
        kind: 'ZONK',
        targetId: picked.targetId,
        title: picked.name,
        subtitle: alreadyOwned
          ? `Already in your Den! ${picked.copy} (+$150 SC Laugh Rebate!)`
          : `${picked.copy} (+$150 SC Laugh Rebate!)`,
        cashAwardedSC: 150,
        plinkoTokenAwarded: false,
        isDuplicateCashEnvelope: alreadyOwned,
      };
    }

    if (kind === 'MID_SHOWCASE') {
      const midCandidates = getActivePrizesV9().filter(
        (p) => p.tier <= 2 && !ownedPrizeSet.has(p.targetId) && !excludeIds.has(p.targetId),
      );
      if (midCandidates.length > 0) {
        const picked = pickNonRepeatingUnownedV9(
          midCandidates,
          ownedPrizeSet,
          recentSet,
          1,
          rng,
        )[0];
        excludeIds.add(picked.targetId);
        return {
          bayNumber,
          kind: 'MID_SHOWCASE',
          targetId: picked.targetId,
          title: picked.name,
          subtitle: picked.copy,
          cashAwardedSC: 0,
          plinkoTokenAwarded: false,
          isDuplicateCashEnvelope: false,
        };
      }
      return {
        bayNumber,
        kind: 'MID_SHOWCASE',
        targetId: null,
        title: 'Showroom Mid-Tier Cash Envelope',
        subtitle: 'All Tier 1–2 showcase prizes claimed! Enjoy a crisp $600 SC cash envelope.',
        cashAwardedSC: 600,
        plinkoTokenAwarded: false,
        isDuplicateCashEnvelope: true,
      };
    }

    // GRAND_SHOWCASE (40% Plinko Token chance; Tier 2, 3, or 4)
    const tokenWon = rng() < 0.4;
    const grandCandidates = getActivePrizesV9().filter(
      (p) => p.tier >= 2 && !ownedPrizeSet.has(p.targetId) && !excludeIds.has(p.targetId),
    );
    if (grandCandidates.length > 0) {
      const picked = pickNonRepeatingUnownedV9(
        grandCandidates,
        ownedPrizeSet,
        recentSet,
        1,
        rng,
      )[0];
      excludeIds.add(picked.targetId);
      return {
        bayNumber,
        kind: 'GRAND_SHOWCASE',
        targetId: picked.targetId,
        title: picked.name,
        subtitle: tokenWon
          ? `${picked.copy} PLUS +1 Starburst Plinko Token!`
          : picked.copy,
        cashAwardedSC: 0,
        plinkoTokenAwarded: tokenWon,
        isDuplicateCashEnvelope: false,
      };
    }
    return {
      bayNumber,
      kind: 'GRAND_SHOWCASE',
      targetId: null,
      title: 'Grand Showcase Cash Envelope',
      subtitle: tokenWon
        ? 'All Grand Showcase prizes claimed! Pocket $1,200 SC + 1 Starburst Plinko Token!'
        : 'All Grand Showcase prizes claimed! Pocket a crisp $1,200 SC cash envelope!',
      cashAwardedSC: 1200,
      plinkoTokenAwarded: tokenWon,
      isDuplicateCashEnvelope: true,
    };
  };

  const usedInReveal = new Set<string>();
  const allBays: CurtainDoorOutcomeV9[] = [
    buildDoorOutcome(1, doorKinds[0], usedInReveal),
    buildDoorOutcome(2, doorKinds[1], usedInReveal),
    buildDoorOutcome(3, doorKinds[2], usedInReveal),
  ];

  const chosenOutcome = allBays[chosenBay - 1];
  if (chosenOutcome.kind === 'ZONK') {
    ledger.consecutiveZonks += 1;
    if (chosenOutcome.targetId && !ledger.ownedZonkIds.includes(chosenOutcome.targetId)) {
      ledger.ownedZonkIds.push(chosenOutcome.targetId);
    }
  } else {
    ledger.consecutiveZonks = 0;
    if (chosenOutcome.targetId && !ledger.ownedPrizeIds.includes(chosenOutcome.targetId)) {
      ledger.ownedPrizeIds.push(chosenOutcome.targetId);
    }
  }

  ledger.showroomCash += chosenOutcome.cashAwardedSC;
  if (chosenOutcome.plinkoTokenAwarded) {
    ledger.plinkoTokens += 1;
  }
  ledger.totalCurtainPulls += 1;

  const offeredToRecord = allBays
    .map((b) => b.targetId)
    .filter((id): id is string => Boolean(id));
  if (offeredToRecord.length > 0) {
    recordOfferedIdsV9(ledger, offeredToRecord);
  }

  const saved = saveShowroomLedgerV9(ledger);
  return {
    ok: true,
    usedFreeTicket,
    pityShieldTriggered,
    chosenBay,
    chosenOutcome,
    allBays,
    ledger: saved,
  };
}

// ----------------------------------------------------------------------------
// 6. 7 Recurring 1966 VIP Celebrities & Bluff Showdown Generator
// ----------------------------------------------------------------------------

export const VIP_CELEB_CATALOG_V9: readonly VipCelebritySpecV9[] = [
  {
    targetId: 'vip_kitty_fontaine',
    name: 'Kitty Fontaine',
    title: 'Broadway Diva',
    strengthBadge: 'PRO: SCREEN · TELL: YACHTS & EX-HUSBANDS',
    strongCategories: ['SCREEN', 'LEXICON', 'LITERATURE'],
    weakCategories: ['PHYSICS', 'CHEMISTRY', 'GADGETS'],
    baseBluffRate: 0.35,
    tellHint: 'Pivots to rich ex-husbands or yachts when bluffing.',
    honestQuips: [
      'Played opening night opposite that script! Go {OPT}, darling.',
      'Every drama critic in Manhattan knows it is {OPT}!',
      'Memorized that cue back at the Schubert! Pick {OPT}.',
    ],
    bluffQuips: [
      'My fourth husband owned one on his yacht! Go {OPT}, darling!',
      'Champagne on the Riviera taught me it is {OPT}—trust Kitty!',
      'My ex-husband’s penthouse had three! Definitely {OPT}, sweetie!',
    ],
  },
  {
    targetId: 'vip_barnaby_quail',
    name: 'Dr. Barnaby Quail',
    title: 'Tweed Panelist',
    strengthBadge: 'PRO: SCIENCE · TELL: FAKE LATIN & DECIMALS',
    strongCategories: ['PHYSICS', 'CHEMISTRY', 'MEDICINE', 'DYNASTIES', 'HEADLINES'],
    weakCategories: ['SCREEN', 'JUKEBOX'],
    baseBluffRate: 0.3,
    tellHint: 'Invents absurd decimals or fake Latin when bluffing.',
    honestQuips: [
      'Verified in the Oxford monographs: select {OPT} immediately.',
      'Elementary empirical fact—mark {OPT} on the tote board.',
      'Classical scholarship confirms {OPT} beyond dispute.',
    ],
    bluffQuips: [
      'By 418.6 parsecs—ipso facto, {OPT}! Do not check.',
      'According to Quail’s 7.39-sigma theorem, clearly {OPT}!',
      'A 19.4% sub-cranial flux proves {OPT}, quaeso!',
    ],
  },
  {
    targetId: 'vip_frankie_lombardo',
    name: 'Frankie Lombardo',
    title: 'Sands Crooner',
    strengthBadge: 'PRO: MUSIC · TELL: BLAMES HOBOKEN PAL SAL',
    strongCategories: ['JUKEBOX', 'SPORTS', 'ODDS'],
    weakCategories: ['ATLAS', 'CHEMISTRY'],
    baseBluffRate: 0.45,
    tellHint: 'Blames "my guy Sal in Hoboken" or his bookie when bluffing.',
    honestQuips: [
      'Played the Sands lounge to that chart! Lock {OPT}, pally.',
      'Heard that exact line back in sixty-two — go with {OPT}.',
      'Ring-a-ding cinch—put your chips on {OPT}, baby.',
    ],
    bluffQuips: [
      'My guy Sal in Hoboken swears it is {OPT}, baby!',
      'My bookie’s cousin drove through there—pick {OPT}, pal!',
      'Sal bet two Cadillacs on {OPT}. What could go wrong?',
    ],
  },
  {
    targetId: 'vip_astrid_lindqvist',
    name: 'Astrid Lindqvist',
    title: 'Pan-Am Hostess',
    strengthBadge: 'PRO: ATLAS · TELL: AIRLINE BROCHURE CHATTER',
    strongCategories: ['ATLAS', 'CUISINE'],
    weakCategories: ['SPORTS', 'ENGINES'],
    baseBluffRate: 0.25,
    tellHint: 'Uses chirpy airline-brochure filler when guessing blind.',
    honestQuips: [
      'Flew that exact route Tuesday morning! Choose {OPT}.',
      'Served that dish over Rome in First Class. Pick {OPT}!',
      'Stamped my passport there last spring—it is {OPT}.',
    ],
    bluffQuips: [
      'Fasten your seatbelt and enjoy {OPT}! Lovely weather!',
      'Thank you for flying Pan-Am toward {OPT}, dear passenger!',
      'Coffee, tea, or {OPT}? Simply delightful skies today!',
    ],
  },
  {
    targetId: 'vip_action_jackson',
    name: 'Action Jackson Boone',
    title: 'Stunt Cowboy',
    strengthBadge: 'PRO: SPORTS · TELL: OUTRAGEOUS TALL TALES',
    strongCategories: ['SPORTS', 'SCREEN', 'ENGINES'],
    weakCategories: ['LEXICON', 'LITERATURE'],
    baseBluffRate: 0.5,
    tellHint: 'Tells outrageous tall-tale bragging stories when bluffing.',
    honestQuips: [
      'Took a stunt fall on that set in sixty-four. Pick {OPT}, partner.',
      'Tuned that exact engine at Bonneville! Go {OPT}.',
      'Saw that championship play live from row one. Lock {OPT}!',
    ],
    bluffQuips: [
      'I once arm-wrestled the guy behind {OPT}! Mostly true.',
      'Rode a grizzly straight past {OPT} in sixty-one, partner!',
      'Invented {OPT} during a hurricane—no sweat, cowboy!',
    ],
  },
  {
    targetId: 'vip_bea_delacroix',
    name: 'Bea Delacroix',
    title: 'Society Critic',
    strengthBadge: 'PRO: FOOD & ARTS · TELL: "DREADFULLY PEDESTRIAN"',
    strongCategories: ['CUISINE', 'FINE ARTS', 'DYNASTIES', 'HEADLINES'],
    weakCategories: ['JUKEBOX', 'PHYSICS'],
    baseBluffRate: 0.4,
    tellHint: 'Dismisses the clue as "dreadfully pedestrian" when bluffing.',
    honestQuips: [
      'Reviewed that gallery gala last autumn—obviously {OPT}.',
      'Every proper chef knows it is {OPT}.',
      'Front-page society fact from fifty-nine: choose {OPT}.',
    ],
    bluffQuips: [
      'Dreadfully pedestrian—just pick {OPT} and move along.',
      'How terribly common. Call it {OPT} and spare my ears!',
      'Utterly bourgeois noise—surely {OPT} will suffice.',
    ],
  },
  {
    targetId: 'vip_zoltan',
    name: 'The Great Zoltan',
    title: 'TV Telepath',
    strengthBadge: 'PRO: WIT & LORE · TELL: ASTRAL TURBAN THEATRICS',
    strongCategories: ['LEXICON', 'FOLKLORE', 'ATLAS'],
    weakCategories: ['MEDICINE', 'CHEMISTRY', 'PHYSICS', 'GADGETS'],
    baseBluffRate: 0.6,
    tellHint: 'Deploys mystical turban theatrics when bluffing.',
    honestQuips: [
      'Pure folklore truth—the answer is clearly {OPT}.',
      'Wordplay never fools Zoltan! Select {OPT}.',
      'Read that legend in old Prague—pick {OPT}.',
    ],
    bluffQuips: [
      'The spirits of Studio 6A command {OPT}! Question nothing!',
      'Behold my emerald turban—it hums {OPT} from afar!',
      'Through the astral mist, Zoltan decrees {OPT}!',
    ],
  },
];

function deterministicUnitRngV9(seed: number): () => number {
  let s = (seed | 0) || 0x13579bdf;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let z = Math.imul(s ^ (s >>> 15), s | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
  };
}

export function generateVipBluffScenario(opts: {
  readonly vipId?: VipCelebIdV9;
  readonly category: CategoryIdV7;
  readonly clueStem?: string;
  readonly choices: readonly [string, string, string, string];
  readonly answerIdx: 0 | 1 | 2 | 3;
  readonly tileValue: number;
  readonly seed?: number;
}): VipBluffScenarioV9 {
  const rng =
    typeof opts.seed === 'number'
      ? deterministicUnitRngV9(opts.seed)
      : Math.random;

  let vip = opts.vipId
    ? VIP_CELEB_CATALOG_V9.find((v) => v.targetId === opts.vipId)
    : undefined;
  if (!vip) {
    const strongMatches = VIP_CELEB_CATALOG_V9.filter((v) =>
      v.strongCategories.includes(opts.category),
    );
    const weakMatches = VIP_CELEB_CATALOG_V9.filter((v) =>
      v.weakCategories.includes(opts.category),
    );
    let candidatePool: readonly VipCelebritySpecV9[] = VIP_CELEB_CATALOG_V9;
    if (strongMatches.length > 0 && weakMatches.length > 0) {
      candidatePool = rng() < 0.5 ? strongMatches : weakMatches;
    } else if (strongMatches.length > 0 || weakMatches.length > 0) {
      candidatePool = [...strongMatches, ...weakMatches];
    }
    vip = candidatePool[Math.floor(rng() * candidatePool.length)];
  }

  let bluffProbabilityUsed = vip.baseBluffRate;
  if (vip.strongCategories.includes(opts.category)) {
    bluffProbabilityUsed = 0.15;
  } else if (vip.weakCategories.includes(opts.category)) {
    bluffProbabilityUsed = 0.72;
  }

  const isBluffing = rng() < bluffProbabilityUsed;
  let suggestedChoiceIdx: 0 | 1 | 2 | 3 = opts.answerIdx;
  if (isBluffing) {
    const wrongIndices = ([0, 1, 2, 3] as const).filter((i) => i !== opts.answerIdx);
    suggestedChoiceIdx = wrongIndices[Math.floor(rng() * wrongIndices.length)];
  }
  const suggestedChoiceLabel = opts.choices[suggestedChoiceIdx];
  let quipPool = isBluffing ? vip.bluffQuips : vip.honestQuips;
  if (
    vip.targetId === 'vip_frankie_lombardo' &&
    !isBluffing &&
    opts.category !== 'JUKEBOX'
  ) {
    const nonMusicHonest = vip.honestQuips.filter(
      (q) => !/Sands lounge to that chart/i.test(q),
    );
    if (nonMusicHonest.length > 0) {
      quipPool = nonMusicHonest;
    }
  }
  const rawTemplate = quipPool[Math.floor(rng() * quipPool.length)];
  const trimmedOpt = suggestedChoiceLabel.replace(/[.!?]+$/, '').trim();
  const shortOpt =
    trimmedOpt.length > 26 ? `${trimmedOpt.slice(0, 24).trim()}…` : trimmedOpt;
  const quip = rawTemplate.replace('{OPT}', `‘${shortOpt}’`);

  const safeVal = Math.max(100, Math.round(opts.tileValue));
  return {
    vip,
    category: opts.category,
    clueStem: opts.clueStem,
    suggestedChoiceIdx,
    suggestedChoiceLabel,
    isBluffing,
    bluffProbabilityUsed,
    quip,
    tileValue: safeVal,
    trustHonestDelta: safeVal,
    trustBluffDelta: -Math.round(safeVal * 0.5),
    callHonestDelta: -Math.round(safeVal * 0.5),
    callBluffDelta: Math.round(safeVal * 1.5),
  };
}

// ----------------------------------------------------------------------------
// 7. Sweeps Week 5-Night Gauntlet & 8 Cigarette-Free 1966 Sponsors
// ----------------------------------------------------------------------------

export const SWEEPS_NIGHT_SPECS_V9: readonly {
  readonly night: SweepsNightNumberV9;
  readonly dayLabel: string;
  readonly multiplier: number;
  readonly rivalAccuracy: number;
  readonly boardHint: string;
}[] = [
  {
    night: 1,
    dayLabel: 'MON · NIGHT 1',
    multiplier: 1.0,
    rivalAccuracy: 0.58,
    boardHint: 'Classic Tote + 1 VIP Bluff Square',
  },
  {
    night: 2,
    dayLabel: 'TUE · NIGHT 2',
    multiplier: 1.25,
    rivalAccuracy: 0.64,
    boardHint: 'Louver Shutter OR Blind Purse',
  },
  {
    night: 3,
    dayLabel: 'WED · NIGHT 3',
    multiplier: 1.5,
    rivalAccuracy: 0.7,
    boardHint: 'Spotlight / Domino / Pressure Cooker + 2 VIPs',
  },
  {
    night: 4,
    dayLabel: 'THU · NIGHT 4',
    multiplier: 2.0,
    rivalAccuracy: 0.75,
    boardHint: 'Live-Wire Fuse (All Locked But One)',
  },
  {
    night: 5,
    dayLabel: 'FRI · FINALE',
    multiplier: 2.5,
    rivalAccuracy: 0.8,
    boardHint: 'Total Blackout Vault (+$2,500 SC & 3 Tokens)',
  },
];

export const SWEEPS_SPONSOR_CATALOG_V9: readonly SponsorPlaqueSpecV9[] = [
  {
    sponsorId: 'orbit_tang',
    name: 'ORBIT-TANG!',
    tagline: 'Powdered Breakfast of Gemini Astronauts!',
    effectSummary: '+$100 SC bonus on your first correct answer each night.',
    badgeHex: '#FF6B35',
    accentHex: '#F2A922',
  },
  {
    sponsorId: 'hold_fast_hairspray',
    name: 'HOLD-FAST! HAIRSPRAY',
    tagline: 'Bouffant-Grade Lacquer Since 1962!',
    effectSummary: '+25% payout on Mystery & Secret Squares.',
    badgeHex: '#E6397A',
    accentHex: '#FAF2DF',
  },
  {
    sponsorId: 'toast_o_matic_5000',
    name: 'TOAST-O-MATIC 5000',
    tagline: 'Chrome Precision For Modern Kitchens!',
    effectSummary: '+4s standard clue clock & +6s on Showcase turns.',
    badgeHex: '#D9A441',
    accentHex: '#6E3B23',
  },
  {
    sponsorId: 'shag_a_delia_rugs',
    name: 'SHAG-A-DELIA RUGS',
    tagline: 'Three Inches of Avocado Plush!',
    effectSummary: 'Rival loses -$100 whenever they miss a clue.',
    badgeHex: '#15803D',
    accentHex: '#F2A922',
  },
  {
    sponsorId: 'sonic_7_transistor',
    name: 'SONIC-7 TRANSISTOR',
    tagline: 'Seven Micro-Diodes in Your Pocket!',
    effectSummary: 'Auto-eliminates 1 wrong choice on your first $400+ clue each night.',
    badgeHex: '#008B94',
    accentHex: '#FFFDF7',
  },
  {
    sponsorId: 'jello_castle_kit',
    name: 'JELLO-CASTLE KIT',
    tagline: 'Lime-Gelatin Architectural Dining!',
    effectSummary: '+50% match cash on Turns 9 & 10.',
    badgeHex: '#15803D',
    accentHex: '#FAF2DF',
  },
  {
    sponsorId: 'jet_wax_glaze',
    name: 'JET-WAX! GLAZE',
    tagline: 'Mirrors You Can Comb Your Hair In!',
    effectSummary: 'VIP Bluff miss halved (-0.25x); caught bluff pays 1.75x.',
    badgeHex: '#1746A2',
    accentHex: '#D9A441',
  },
  {
    sponsorId: 'velvet_tone_needle',
    name: 'VELVET-TONE NEEDLE',
    tagline: 'Zero-Skip Hi-Fi Diamond Stylus!',
    effectSummary: 'First 3-hit streak each night grants +$350 bonus.',
    badgeHex: '#6E3B23',
    accentHex: '#F2A922',
  },
];

const SPONSOR_ID_SET_V9 = new Set<string>(
  SWEEPS_SPONSOR_CATALOG_V9.map((s) => s.sponsorId),
);

export function createDefaultSweepsStateV9(): SweepsWeekStateV9 {
  return {
    version: 'WS_V9_SWEEPS_1',
    activeRun: false,
    currentNight: 1,
    safeDepositCash: 0,
    atRiskVaultCash: 0,
    revengeJackpotPool: 1000,
    draftedSponsors: [],
    nextNightBonusMult: 0,
    freeFiftyFiftyArmed: false,
    pendingLossRematchNight: null,
    pendingPlinkoFreeDrop: false,
    pendingSponsorDraft: false,
    lastNightPurse: 0,
    nightsWonTotal: 0,
    sweepsCrownsWon: 0,
    lastUpdatedIso: new Date().toISOString(),
  };
}

export function sanitizeSweepsStateV9(raw: unknown): SweepsWeekStateV9 {
  const def = createDefaultSweepsStateV9();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return def;
  const rec = raw as Record<string, unknown>;
  const nightRaw = sanitizeFiniteNonNegIntV9(rec.currentNight, 1, 5);
  const currentNight = (nightRaw >= 1 && nightRaw <= 5 ? nightRaw : 1) as SweepsNightNumberV9;
  const rematchRaw = rec.pendingLossRematchNight;
  const pendingLossRematchNight =
    typeof rematchRaw === 'number' && rematchRaw >= 1 && rematchRaw <= 5
      ? (Math.floor(rematchRaw) as SweepsNightNumberV9)
      : null;

  const draftedSponsors = Array.isArray(rec.draftedSponsors)
    ? [
        ...new Set(
          rec.draftedSponsors.filter(
            (id): id is SponsorIdV9 => typeof id === 'string' && SPONSOR_ID_SET_V9.has(id),
          ),
        ),
      ].slice(0, 3)
    : [];

  return {
    version: 'WS_V9_SWEEPS_1',
    activeRun: Boolean(rec.activeRun),
    currentNight,
    safeDepositCash: sanitizeFiniteNonNegIntV9(rec.safeDepositCash, 0),
    atRiskVaultCash: sanitizeFiniteNonNegIntV9(rec.atRiskVaultCash, 0),
    revengeJackpotPool: Math.max(
      1000,
      Math.min(10_000, sanitizeFiniteNonNegIntV9(rec.revengeJackpotPool, 1000, 10_000)),
    ),
    draftedSponsors,
    nextNightBonusMult:
      typeof rec.nextNightBonusMult === 'number' && Number.isFinite(rec.nextNightBonusMult)
        ? Math.max(0, Math.min(2, rec.nextNightBonusMult))
        : 0,
    freeFiftyFiftyArmed: Boolean(rec.freeFiftyFiftyArmed),
    pendingLossRematchNight,
    pendingPlinkoFreeDrop: Boolean(rec.pendingPlinkoFreeDrop),
    pendingSponsorDraft: Boolean(rec.pendingSponsorDraft),
    lastNightPurse: sanitizeFiniteNonNegIntV9(rec.lastNightPurse, 0),
    nightsWonTotal: sanitizeFiniteNonNegIntV9(rec.nightsWonTotal, 0),
    sweepsCrownsWon: sanitizeFiniteNonNegIntV9(rec.sweepsCrownsWon, 0),
    lastUpdatedIso:
      typeof rec.lastUpdatedIso === 'string' && rec.lastUpdatedIso.length > 0
        ? rec.lastUpdatedIso
        : new Date().toISOString(),
  };
}

export function loadSweepsStateV9(): SweepsWeekStateV9 {
  const raw = readRawStorageV9(SWEEPS_SAVE_KEY_V9);
  if (!raw) return createDefaultSweepsStateV9();
  try {
    return sanitizeSweepsStateV9(JSON.parse(raw));
  } catch {
    return createDefaultSweepsStateV9();
  }
}

export function saveSweepsStateV9(state: SweepsWeekStateV9): SweepsWeekStateV9 {
  const clean = sanitizeSweepsStateV9({
    ...state,
    lastUpdatedIso: new Date().toISOString(),
  });
  writeRawStorageV9(SWEEPS_SAVE_KEY_V9, JSON.stringify(clean));
  return clean;
}

export function startNewSweepsWeekV9(): SweepsWeekStateV9 {
  const prev = loadSweepsStateV9();
  return saveSweepsStateV9({
    ...createDefaultSweepsStateV9(),
    activeRun: true,
    revengeJackpotPool: prev.revengeJackpotPool,
    nightsWonTotal: prev.nightsWonTotal,
    sweepsCrownsWon: prev.sweepsCrownsWon,
  });
}

export function resolveSweepsNightResultV9(opts: {
  readonly won: boolean;
  readonly matchPurse: number;
  readonly isRevengeMatch?: boolean;
}): {
  readonly state: SweepsWeekStateV9;
  readonly showroomCashAwarded: number;
  readonly plinkoTokensAwarded: number;
  readonly revengeJackpotClaimed: number;
  readonly completedSweepsWeek: boolean;
} {
  const state = loadSweepsStateV9();
  const purse = Math.max(0, Math.round(Number.isFinite(opts.matchPurse) ? opts.matchPurse : 0));
  const nightSpec = SWEEPS_NIGHT_SPECS_V9[state.currentNight - 1];
  const nightEscalator = nightSpec.multiplier + state.nextNightBonusMult;
  state.nextNightBonusMult = 0;
  state.lastNightPurse = purse;

  if (opts.won) {
    state.nightsWonTotal += 1;
    let revengeJackpotClaimed = 0;
    if (opts.isRevengeMatch || state.pendingLossRematchNight === state.currentNight) {
      revengeJackpotClaimed = state.revengeJackpotPool;
      state.revengeJackpotPool = 1000;
      state.pendingLossRematchNight = null;
    }

    const scaledPurse = roundTo5SC(purse * nightEscalator) + revengeJackpotClaimed;
    const halfSafe = roundTo5SC(scaledPurse * 0.5);
    const halfRisk = Math.max(0, scaledPurse - halfSafe);
    state.safeDepositCash += halfSafe;
    state.atRiskVaultCash += halfRisk;

    if (state.currentNight === 5) {
      const showroomCashAwarded = computeSweepsShowroomCashV9({
        outcome: 'NIGHT_5_WIN',
        safeDepositCash: state.safeDepositCash,
        atRiskCash: state.atRiskVaultCash,
        nightPurse: purse,
      });
      state.sweepsCrownsWon += 1;
      state.activeRun = false;
      state.safeDepositCash = 0;
      state.atRiskVaultCash = 0;
      state.pendingPlinkoFreeDrop = false;
      state.pendingSponsorDraft = false;
      creditShowroomCashV9(showroomCashAwarded, 'SWEEPS_NIGHT_5_CROWN');
      awardPlinkoTokensV9(3);
      return {
        state: saveSweepsStateV9(state),
        showroomCashAwarded,
        plinkoTokensAwarded: 3,
        revengeJackpotClaimed,
        completedSweepsWeek: true,
      };
    }

    state.pendingPlinkoFreeDrop = true;
    state.pendingSponsorDraft = state.currentNight <= 3 && state.draftedSponsors.length < 3;
    return {
      state: saveSweepsStateV9(state),
      showroomCashAwarded: 0,
      plinkoTokensAwarded: 0,
      revengeJackpotClaimed,
      completedSweepsWeek: false,
    };
  }

  // Dethroned on Night N: pay 50% Safe-Deposit + 50% Night Consolation (min $200 SC);
  // Night 2+ lost AtRiskVaultCash feeds 1:1 into RevengeJackpot (cap $10,000; 0 from Night 1 forfeits).
  const showroomCashAwarded = computeSweepsShowroomCashV9({
    outcome: 'LOSS',
    safeDepositCash: state.safeDepositCash,
    atRiskCash: state.atRiskVaultCash,
    nightPurse: purse,
  });
  if (state.currentNight > 1 && state.atRiskVaultCash > 0) {
    state.revengeJackpotPool = Math.min(10_000, state.revengeJackpotPool + state.atRiskVaultCash);
  }
  state.safeDepositCash = 0;
  state.atRiskVaultCash = 0;
  state.pendingLossRematchNight = state.currentNight;
  state.pendingPlinkoFreeDrop = false;
  state.pendingSponsorDraft = false;
  state.activeRun = false;
  creditShowroomCashV9(showroomCashAwarded, 'SWEEPS_LOSS_CONSOLATION');
  return {
    state: saveSweepsStateV9(state),
    showroomCashAwarded,
    plinkoTokensAwarded: 0,
    revengeJackpotClaimed: 0,
    completedSweepsWeek: false,
  };
}

export function chooseSweepsCashOutV9(): {
  readonly state: SweepsWeekStateV9;
  readonly showroomCashAwarded: number;
} {
  const state = loadSweepsStateV9();
  const showroomCashAwarded = computeSweepsShowroomCashV9({
    outcome: 'CASH_OUT',
    safeDepositCash: state.safeDepositCash,
    atRiskCash: state.atRiskVaultCash,
    nightPurse: state.lastNightPurse,
  });
  state.activeRun = false;
  state.safeDepositCash = 0;
  state.atRiskVaultCash = 0;
  state.pendingPlinkoFreeDrop = false;
  state.pendingSponsorDraft = false;
  if (showroomCashAwarded > 0) {
    creditShowroomCashV9(showroomCashAwarded, 'SWEEPS_CASH_OUT');
  }
  return { state: saveSweepsStateV9(state), showroomCashAwarded };
}

export function chooseSweepsRiskStreakV9(): SweepsWeekStateV9 {
  const state = loadSweepsStateV9();
  if (state.currentNight < 5) {
    state.currentNight = (state.currentNight + 1) as SweepsNightNumberV9;
  }
  state.activeRun = true;
  state.pendingPlinkoFreeDrop = false;
  state.pendingSponsorDraft = false;
  return saveSweepsStateV9(state);
}

export function draftSweepsSponsorV9(sponsorId: SponsorIdV9): {
  readonly ok: boolean;
  readonly state: SweepsWeekStateV9;
} {
  const state = loadSweepsStateV9();
  if (!SPONSOR_ID_SET_V9.has(sponsorId)) {
    return { ok: false, state };
  }
  if (state.draftedSponsors.includes(sponsorId) || state.draftedSponsors.length >= 3) {
    return { ok: false, state };
  }
  state.draftedSponsors.push(sponsorId);
  state.pendingSponsorDraft = false;
  return { ok: true, state: saveSweepsStateV9(state) };
}

export function applySweepsPlinkoOutcomeV9(
  outcome: PlinkoOutcomeV9,
): SweepsWeekStateV9 {
  const state = loadSweepsStateV9();
  if (outcome.sweepsBonusKind === 'VAULT_CASH' && outcome.sweepsVaultDelta > 0) {
    state.atRiskVaultCash += outcome.sweepsVaultDelta;
  } else if (outcome.sweepsBonusKind === 'FREE_5050') {
    state.freeFiftyFiftyArmed = true;
  } else if (outcome.sweepsBonusKind === 'NEXT_NIGHT_MULT') {
    state.nextNightBonusMult = Math.min(2, state.nextNightBonusMult + 0.5);
  }
  state.pendingPlinkoFreeDrop = false;
  return saveSweepsStateV9(state);
}

export function claimRevengeJackpotV9(): {
  readonly ok: boolean;
  readonly claimedAmount: number;
  readonly state: SweepsWeekStateV9;
} {
  const state = loadSweepsStateV9();
  if (state.pendingLossRematchNight === null) {
    return { ok: false, claimedAmount: 0, state };
  }
  const claimedAmount = state.revengeJackpotPool;
  state.currentNight = state.pendingLossRematchNight;
  state.pendingLossRematchNight = null;
  state.revengeJackpotPool = 1000;
  state.activeRun = true;
  return { ok: true, claimedAmount, state: saveSweepsStateV9(state) };
}

// ----------------------------------------------------------------------------
// 8. 5-Lane 120Hz Starburst Plinko Physics & Anti-Exploit Simulator
// ----------------------------------------------------------------------------

const PLINKO_PEG_ROWS_Y = [80, 132, 184, 236, 288, 338] as const;

function buildPlinkoPegsV9(): readonly { readonly x: number; readonly y: number; readonly r: number; readonly isDeflector: boolean }[] {
  const pegs: { x: number; y: number; r: number; isDeflector: boolean }[] = [];
  const spacing = 64;
  for (let rowIdx = 0; rowIdx < PLINKO_PEG_ROWS_Y.length; rowIdx++) {
    const y = PLINKO_PEG_ROWS_Y[rowIdx];
    const count = rowIdx % 2 === 0 ? 6 : 5;
    const totalW = (count - 1) * spacing;
    const startX = 180 - totalW / 2;
    for (let c = 0; c < count; c++) {
      pegs.push({
        x: startX + c * spacing,
        y,
        r: 6.5,
        isDeflector: false,
      });
    }
  }
  // Twin Brass Starburst Deflector Pyramid above Center Bucket #3 (dx = +/-24, r = 8.5 -> 31px opening for 20px ball)
  pegs.push({ x: 156, y: 368, r: 8.5, isDeflector: true });
  pegs.push({ x: 204, y: 368, r: 8.5, isDeflector: true });
  return pegs;
}

export const PLINKO_BOARD_CONFIG_V9 = {
  width: 360,
  height: 440,
  ballRadius: 10,
  pegRadius: 6.5,
  gravity: 780,
  restitution: 0.56,
  dt: 1 / 120,
  launchY: 26,
  launchLanesX: [46, 113, 180, 247, 314] as const,
  bucketDividersX: [72, 144, 216, 288] as const,
  dividerTopY: 394,
  bucketFloorY: 422,
  pegs: buildPlinkoPegsV9(),
  sweepsBuckets: [
    { label: '+$350 VAULT', kind: 'VAULT_CASH' as const, delta: 350 },
    { label: '★ FREE 50/50', kind: 'FREE_5050' as const, delta: 0 },
    { label: '👑 +0.50× NEXT', kind: 'NEXT_NIGHT_MULT' as const, delta: 0 },
    { label: '+$250 VAULT', kind: 'VAULT_CASH' as const, delta: 250 },
    { label: '+$350 VAULT', kind: 'VAULT_CASH' as const, delta: 350 },
  ] as const,
  showroomPayoutsSC: [400, 225, 1000, 225, 400] as const,
} as const;

export function runPlinkoDropV9(
  launchLane: PlinkoLaneIndexV9,
  mode: PlinkoModeV9 = 'SHOWROOM_TOKEN_OR_CASH',
  rng: () => number = Math.random,
): PlinkoOutcomeV9 {
  const cfg = PLINKO_BOARD_CONFIG_V9;
  const dt = cfg.dt;
  let x = cfg.launchLanesX[launchLane] + (rng() - 0.5) * 6;
  let y = cfg.launchY;
  let vx = (rng() - 0.5) * 28;
  let vy = 0;

  const trajectory: { x: number; y: number; t: number }[] = [{ x, y, t: 0 }];
  const pegHits: { x: number; y: number; t: number; noteIdx: number }[] = [];
  let stallTime = 0;
  let stallKicksCount = 0;
  let t = 0;
  const maxSteps = 900; // 7.5s hard cap at 120Hz

  for (let step = 0; step < maxSteps; step++) {
    t += dt;
    vy += cfg.gravity * dt;
    vx *= 0.9985;
    x += vx * dt;
    y += vy * dt;

    // Angled side-wall bumpers
    if (x < cfg.ballRadius + 6) {
      x = cfg.ballRadius + 6;
      vx = Math.abs(vx) * 0.72 + 18;
    } else if (x > cfg.width - cfg.ballRadius - 6) {
      x = cfg.width - cfg.ballRadius - 6;
      vx = -Math.abs(vx) * 0.72 - 18;
    }

    // Peg & Twin Brass Deflector collisions
    for (let pIdx = 0; pIdx < cfg.pegs.length; pIdx++) {
      const peg = cfg.pegs[pIdx];
      const dx = x - peg.x;
      const dy = y - peg.y;
      const minDist = cfg.ballRadius + peg.r;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDist * minDist && distSq > 1e-6) {
        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;
        x = peg.x + nx * (minDist + 0.35);
        y = peg.y + ny * (minDist + 0.35);
        const dot = vx * nx + vy * ny;
        if (dot < 0) {
          vx -= (1 + cfg.restitution) * dot * nx;
          vy -= (1 + cfg.restitution) * dot * ny;
          vx += (rng() - 0.5) * 32;
        }
        pegHits.push({
          x: Number(peg.x.toFixed(1)),
          y: Number(peg.y.toFixed(1)),
          t: Number(t.toFixed(3)),
          noteIdx: pIdx % 8,
        });
      }
    }

    // Bucket divider lips (y >= 394)
    if (y >= cfg.dividerTopY - cfg.ballRadius) {
      for (const divX of cfg.bucketDividersX) {
        const dx = x - divX;
        const absDx = Math.abs(dx);
        const minDivDist = cfg.ballRadius + 2.5;
        if (absDx < minDivDist) {
          if (y < cfg.dividerTopY) {
            const sign = dx >= 0 ? 1 : -1;
            x = divX + sign * (minDivDist + 0.25);
            vx = sign * Math.max(40, Math.abs(vx) * 0.65);
          } else {
            x = dx >= 0 ? divX + minDivDist : divX - minDivDist;
            vx = -vx * 0.45;
          }
        }
      }
    }

    // >100ms anti-stall kick
    const speed = Math.hypot(vx, vy);
    if (speed < 18) {
      stallTime += dt;
      if (stallTime > 0.1) {
        vx += (rng() < 0.5 ? -1 : 1) * (48 + rng() * 24);
        vy += 35;
        stallTime = 0;
        stallKicksCount += 1;
      }
    } else {
      stallTime = 0;
    }

    if (step % 2 === 0 || y >= cfg.bucketFloorY) {
      trajectory.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        t: Number(t.toFixed(3)),
      });
    }

    if (y >= cfg.bucketFloorY) {
      break;
    }
  }

  let bucketIndex: PlinkoLaneIndexV9 = 4;
  if (x < cfg.bucketDividersX[0]) bucketIndex = 0;
  else if (x < cfg.bucketDividersX[1]) bucketIndex = 1;
  else if (x < cfg.bucketDividersX[2]) bucketIndex = 2;
  else if (x < cfg.bucketDividersX[3]) bucketIndex = 3;

  if (mode === 'SWEEPS_FREE_DROP') {
    const b = cfg.sweepsBuckets[bucketIndex];
    return {
      mode,
      launchLane,
      bucketIndex,
      bucketLabel: b.label,
      cashWonSC: 0,
      sweepsBonusKind: b.kind,
      sweepsVaultDelta: b.delta,
      trajectory,
      pegHits,
      stallKicksCount,
    };
  }

  const cashWonSC = cfg.showroomPayoutsSC[bucketIndex];
  return {
    mode,
    launchLane,
    bucketIndex,
    bucketLabel: bucketIndex === 2 ? `★ $${cashWonSC.toLocaleString()} ★` : `$${cashWonSC}`,
    cashWonSC,
    sweepsVaultDelta: 0,
    trajectory,
    pegHits,
    stallKicksCount,
  };
}

export function playShowroomPlinkoDropV9(
  launchLane: PlinkoLaneIndexV9,
  useTokenFirst: boolean = true,
  rng: () => number = Math.random,
): {
  readonly ok: boolean;
  readonly reason?: string;
  readonly usedToken: boolean;
  readonly outcome: PlinkoOutcomeV9 | null;
  readonly ledger: ShowroomStateV9;
} {
  const ledger = loadShowroomLedgerV9();
  const useToken = useTokenFirst && ledger.plinkoTokens > 0;
  if (!useToken && ledger.showroomCash < PLINKO_ENTRY_COST_SC) {
    return {
      ok: false,
      reason: `Need 1 Plinko Token or $${PLINKO_ENTRY_COST_SC} SC to drop a puck.`,
      usedToken: false,
      outcome: null,
      ledger,
    };
  }
  if (useToken) {
    ledger.plinkoTokens -= 1;
  } else {
    ledger.showroomCash -= PLINKO_ENTRY_COST_SC;
  }

  const outcome = runPlinkoDropV9(launchLane, 'SHOWROOM_TOKEN_OR_CASH', rng);
  ledger.showroomCash += outcome.cashWonSC;
  ledger.totalPlinkoDrops += 1;

  return {
    ok: true,
    usedToken: useToken,
    outcome,
    ledger: saveShowroomLedgerV9(ledger),
  };
}

export function verifyPlinkoRtpV9(samplesPerLane: number = 2000): {
  readonly lanes: readonly {
    readonly lane: PlinkoLaneIndexV9;
    readonly meanCash: number;
    readonly rtpPct: number;
    readonly centerHitRate: number;
  }[];
  readonly allWithinCap: boolean;
} {
  const rng = deterministicUnitRngV9(19660908);
  const lanes: {
    lane: PlinkoLaneIndexV9;
    meanCash: number;
    rtpPct: number;
    centerHitRate: number;
  }[] = [];
  let allWithinCap = true;

  for (const lane of [0, 1, 2, 3, 4] as const) {
    let totalCash = 0;
    let centerHits = 0;
    for (let i = 0; i < samplesPerLane; i++) {
      const res = runPlinkoDropV9(lane, 'SHOWROOM_TOKEN_OR_CASH', rng);
      totalCash += res.cashWonSC;
      if (res.bucketIndex === 2) centerHits += 1;
    }
    const meanCash = totalCash / samplesPerLane;
    const rtpPct = (meanCash / PLINKO_ENTRY_COST_SC) * 100;
    if (rtpPct > 91.4) allWithinCap = false;
    lanes.push({
      lane,
      meanCash: Number(meanCash.toFixed(2)),
      rtpPct: Number(rtpPct.toFixed(2)),
      centerHitRate: Number((centerHits / samplesPerLane).toFixed(4)),
    });
  }

  return { lanes, allWithinCap };
}

// ----------------------------------------------------------------------------
// 9. 6 Custom Broadcast Booth Vibe Packs (Mapped 1:1 to Canonical Categories)
// ----------------------------------------------------------------------------

export const VIBE_PACK_CATALOG_V9: readonly VibePackSpecV9[] = [
  {
    packId: 'PRIMETIME_LIVING_COLOR',
    title: 'Primetime Living Color',
    tagline: 'Balanced all-20 mix across every studio wing.',
    accentHex: '#008B94',
    categories: ALL_CATEGORIES_V7,
  },
  {
    packId: 'AFTER_HOURS_LOUNGE',
    title: 'After-Hours Lounge',
    tagline: 'Silver Screen, Hit Parade, Words, Art & Velvet Wit.',
    accentHex: '#E6397A',
    categories: [
      'SCREEN',
      'JUKEBOX',
      'LEXICON',
      'FINE ARTS',
      'LITERATURE',
      'CUISINE',
      'FOLKLORE',
      'ODDS',
    ],
  },
  {
    packId: 'SPACE_RACE_TOMORROWLAND',
    title: 'Space Race & Tomorrowland',
    tagline: 'Physics, Chemistry, Gadgets, Machines & World Atlas.',
    accentHex: '#1746A2',
    categories: [
      'PHYSICS',
      'CHEMISTRY',
      'GADGETS',
      'ENGINES',
      'MEDICINE',
      'ATLAS',
      'PRICING',
      'FALLACIES',
    ],
  },
  {
    packId: 'SATURDAY_BAR_BET_CHAMPS',
    title: 'Saturday Bar-Bet Champs',
    tagline: 'Sports, Food & Drink, Odds, Headlines & Wild Lore.',
    accentHex: '#FF6B35',
    categories: [
      'SPORTS',
      'CUISINE',
      'ODDS',
      'HEADLINES',
      'FOLKLORE',
      'DYNASTIES',
      'FALLACIES',
      'PRICING',
    ],
  },
  {
    packId: 'BURBANK_COMEDY_WALL',
    title: 'Burbank Comedy Wall',
    tagline: 'Wordplay, Brain Twisters, Myths & Classic Pop.',
    accentHex: '#F2A922',
    categories: [
      'LEXICON',
      'FALLACIES',
      'FOLKLORE',
      'SCREEN',
      'JUKEBOX',
      'LITERATURE',
      'FINE ARTS',
      'CUISINE',
    ],
  },
  {
    packId: 'SWEEPS_SHARK_TANK',
    title: 'Sweeps Shark Tank',
    tagline: 'High-stakes history, hard science & deep-cut trivia.',
    accentHex: '#6E3B23',
    categories: [
      'DYNASTIES',
      'PHYSICS',
      'CHEMISTRY',
      'FINANCE',
      'LITERATURE',
      'FINE ARTS',
      'MEDICINE',
      'HEADLINES',
    ],
    preferredDifficulties: [3, 4, 5],
  },
];

export const VIBE_PACK_CATEGORIES_V9: Record<
  VibePackIdV9,
  readonly CategoryIdV7[]
> = {
  PRIMETIME_LIVING_COLOR: VIBE_PACK_CATALOG_V9[0].categories,
  AFTER_HOURS_LOUNGE: VIBE_PACK_CATALOG_V9[1].categories,
  SPACE_RACE_TOMORROWLAND: VIBE_PACK_CATALOG_V9[2].categories,
  SATURDAY_BAR_BET_CHAMPS: VIBE_PACK_CATALOG_V9[3].categories,
  BURBANK_COMEDY_WALL: VIBE_PACK_CATALOG_V9[4].categories,
  SWEEPS_SHARK_TANK: VIBE_PACK_CATALOG_V9[5].categories,
};

// ----------------------------------------------------------------------------
// 10. 4 Sunlit Per-Season Studio & Main Board Visual Specs (Zero Dark-Navy)
// ----------------------------------------------------------------------------

export const SEASON_VISUAL_SPECS_V9: Record<SeasonIdV7, SeasonVisualSpecV9> = {
  1: {
    season: 1,
    title: 'Studio 6A Flagship ("In Living Color")',
    subtitle: 'Book-matched walnut slats, peacock feather arch & champagne brass.',
    flagshipStageId: 'STAGE_01_IBC_DAYTIME_FUNK',
    cabinetHex: '#6E3B23',
    cabinetHexNum: 0x6e3b23,
    bezelTrimHex: '#D9A441',
    bezelTrimHexNum: 0xd9a441,
    tileFaceHex: '#FAF2DF',
    tileAccentHex: '#008B94',
    spotlightHex: '#F2A922',
    marqueeStyleLabel: 'SEASON 1 · WALNUT & PEACOCK',
  },
  2: {
    season: 2,
    title: 'Hollywood Blvd Starburst Palace',
    subtitle: 'Googie scalloped proscenium, spun chrome & atomic tangerine fins.',
    flagshipStageId: 'STAGE_02_IBC_PRIMETIME_JUBILEE',
    cabinetHex: '#FAF2DF',
    cabinetHexNum: 0xfaf2df,
    bezelTrimHex: '#D6DFE8',
    bezelTrimHexNum: 0xd6dfe8,
    tileFaceHex: '#FFFDF7',
    tileAccentHex: '#FF6B35',
    spotlightHex: '#E6397A',
    marqueeStyleLabel: 'SEASON 2 · GOOGIE STARBURST',
  },
  3: {
    season: 3,
    title: 'Manhattan Prime-Time Gold Vault',
    subtitle: 'Roasted teak cabinetry, fluted 24K brass columns & emerald bezels.',
    flagshipStageId: 'STAGE_07_1969_MONTE_CARLO_CASINO',
    cabinetHex: '#4F2917',
    cabinetHexNum: 0x4f2917,
    bezelTrimHex: '#F2A922',
    bezelTrimHexNum: 0xf2a922,
    tileFaceHex: '#FFF6E3',
    tileAccentHex: '#15803D',
    spotlightHex: '#D9A441',
    marqueeStyleLabel: 'SEASON 3 · GOLD VAULT',
  },
  4: {
    season: 4,
    title: 'Burbank Super-Stage Kaleidoscope',
    subtitle: 'Brushed spun stainless aerospace frame & cobalt-gold prism chevrons.',
    flagshipStageId: 'STAGE_10_SOVEREIGN_SANCTUM',
    cabinetHex: '#D6DFE8',
    cabinetHexNum: 0xd6dfe8,
    bezelTrimHex: '#1746A2',
    bezelTrimHexNum: 0x1746a2,
    tileFaceHex: '#FFFDF7',
    tileAccentHex: '#1746A2',
    spotlightHex: '#F2A922',
    marqueeStyleLabel: 'SEASON 4 · KALEIDOSCOPE',
  },
};

// ----------------------------------------------------------------------------
// 11. Gouache Atlas Manifest Loader (Strict Packed-Manifest Entries Only)
// ----------------------------------------------------------------------------

function resolveAssetsV9Base(): string {
  const base =
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL) ||
    './';
  const norm = base.endsWith('/') ? base : `${base}/`;
  return `${norm}assets/v9/`;
}

export async function loadAtlasManifestV9(): Promise<AtlasManifestV9 | null> {
  if (cachedAtlasManifestV9) return cachedAtlasManifestV9;
  if (cachedAtlasManifestPromiseV9) return cachedAtlasManifestPromiseV9;

  cachedAtlasManifestPromiseV9 = (async () => {
    try {
      if (typeof fetch !== 'function') return null;
      const resp = await fetch(`${resolveAssetsV9Base()}atlas_manifest_v9.json`);
      if (!resp.ok) return null;
      const parsed = (await resp.json()) as AtlasManifestInputV9 | null;
      const spriteMap = extractManifestSpriteRecordV9(parsed);
      if (!parsed || !spriteMap) {
        return null;
      }
      const normalized: AtlasManifestV9 = {
        version:
          typeof parsed.version === 'string' && parsed.version.length > 0
            ? parsed.version
            : 'WS_V9_ATLAS_1',
        sprites: spriteMap,
      };
      setPackedAtlasManifest(normalized);
      return normalized;
    } catch {
      return null;
    }
  })();

  return cachedAtlasManifestPromiseV9;
}

export function getAtlasSpriteEntryV9(
  targetId: string,
  manifest: AtlasManifestInputV9 | null = loadedPackedManifestV9 ?? cachedAtlasManifestV9,
): {
  readonly sprite: AtlasSpriteEntryV9;
  readonly assetUrl: string;
} | null {
  const spriteMap = extractManifestSpriteRecordV9(manifest);
  const sprite = spriteMap?.[targetId] ?? null;
  if (!sprite) {
    return null;
  }
  const base = resolveAssetsV9Base();
  const cleanFile = sprite.file.replace(/^\/+/, '');
  return {
    sprite,
    assetUrl: `${base}${cleanFile}`,
  };
}
