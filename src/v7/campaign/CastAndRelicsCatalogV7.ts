// ============================================================================
// WORLD'S SMARTEST: FIFTY MILLION WATCHING (v7.6 — 1966 IN LIVING COLOR)
// `src/v7/campaign/CastAndRelicsCatalogV7.ts`
// 24 Authentic 1960s Champions (6 per Season Tier, S01E01 42% -> S04 85%
// Masterminds, 20/20 Weak & Strong Category Coverage, 5 CPU Playstyles x 4
// Temperaments, Non-Spoilery 1966 TV Guide Wit) + 3 Booth Power Brokers,
// 28 Plain-English Studio Relics x 4 Foils, 36 Sovereign Trophies &
// Bounded 10-Turn Economy (`0.0%` 1/5 Fluke Wins, Exact $1 Integer Ledger).
// ============================================================================

import {
  ALL_CATEGORIES_V7,
  ALL_RIVAL_IDS_V7,
  type BoardTileNodeV7,
  type BrokerIdV7,
  type CastIdV7,
  type CastProfileV7,
  type CategoryIdV7,
  type ClueRecordV7,
  type ContestantWaiverV7,
  type CoupRegimeIdV7,
  type DomainIdV7,
  type FoilFinishV7,
  type OwnedRelicV7,
  type PortraitEmotionV7,
  type RelicSpecV7,
  type RivalIdV7,
  type ToyResolutionV7,
  type TrophySpecV7,
} from '../contracts_v7';
import { TROPHY_CATALOG_V7 } from '../engine/LitTrophyVaultV7';

export { TROPHY_CATALOG_V7, type TrophySpecV7 };

// ----------------------------------------------------------------------------
// 1. 2x2 1966 TV Guide Gouache Sprite Sheet Coordinates (100% Painted Portraits)
// ----------------------------------------------------------------------------

/** Canonical 1966 Studio 6A Emcee & Network Host (Grant Bellamy painted 2x2 sheet). */
export const EMCEE_PORTRAIT_ASSET_V7 = './assets/v7/portraits/grant_bellamy.jpg';

/** All 9 verified hand-painted 1966 gouache 2x2 portrait sheets on disk. */
export const VERIFIED_PAINTED_PORTRAIT_FILES_V7 = [
  './assets/v7/portraits/alastair_kerr.jpg',
  './assets/v7/portraits/carmen_delgado.jpg',
  './assets/v7/portraits/grant_bellamy.jpg',
  './assets/v7/portraits/inez_callahan.jpg',
  './assets/v7/portraits/rex_calloway.jpg',
  './assets/v7/portraits/roz_korman.jpg',
  './assets/v7/portraits/seo_yun_kang.jpg',
  './assets/v7/portraits/toby_okafor.jpg',
  './assets/v7/portraits/vera_karp.jpg',
] as const;

export const PORTRAIT_SPRITE_POSITIONS_V7: Record<
  PortraitEmotionV7,
  {
    readonly bgPosX: string;
    readonly bgPosY: string;
    readonly bgPosition: string;
    readonly badgeLabel: string;
  }
> = {
  POISED: { bgPosX: '0%', bgPosY: '0%', bgPosition: '0% 0%', badgeLabel: 'POISED' },
  TELL: { bgPosX: '100%', bgPosY: '0%', bgPosition: '100% 0%', badgeLabel: 'LIVE TELL' },
  RATTLED: { bgPosX: '0%', bgPosY: '100%', bgPosition: '0% 100%', badgeLabel: 'RATTLED' },
  BREAKDOWN: { bgPosX: '100%', bgPosY: '100%', bgPosition: '100% 100%', badgeLabel: 'CRACKING' },
};

/** All 24 1960s Champions in smooth Season 1 (Easy) -> Season 4 (Mastermind) order. */
export const RIVAL_IDS_V7: readonly RivalIdV7[] = ALL_RIVAL_IDS_V7;

export const SEASON_RIVALS_V7: Readonly<Record<1 | 2 | 3 | 4, readonly RivalIdV7[]>> = {
  1: [
    'CARMEN_DELGADO',
    'TOBY_OKAFOR',
    'INEZ_CALLAHAN',
    'DOTTY_VANCE',
    'CHET_KOWALSKI',
    'PEGGY_SUE_CONNORS',
  ],
  2: [
    'BUZZ_HALVORSEN',
    'GIGI_ST_CLAIR',
    'MILES_ELLINGTON',
    'BETTY_LOU_HARPER',
    'WALTER_PRINGLE',
    'SYLVIE_BEAUMONT',
  ],
  3: [
    'MARGO_STERLING',
    'HANK_MCCOY',
    'ALASTAIR_KERR',
    'LANA_STARLING',
    'VINCE_CASTELLANO',
    'REX_CALLOWAY',
  ],
  4: [
    'ARTHUR_PENDLETON',
    'NORMA_JEAN_BAKER',
    'STERLING_VANCE',
    'SEO_YUN_KANG',
    'CLARA_VON_BERG',
    'VICTOR_LAZAR',
  ],
};

export const BROKER_IDS_V7: readonly BrokerIdV7[] = [
  'GRANT_BELLAMY',
  'ROZ_KORMAN',
  'VERA_KARP',
];

// ----------------------------------------------------------------------------
// 2. 24 Authentic 1960s Champions (6 per Season Tier) + 3 Booth Power Brokers
//    20/20 Weak & Strong Category Coverage; Vivid 1966 TV Guide Bios & Private
//    Backstage Dossiers Subtly Hinting Strengths & Blind Spots (Zero Spoilers!)
// ----------------------------------------------------------------------------

export interface ChampionVoiceKitV7 {
  readonly voiceArchetype: string;
  readonly greenRoomDossier: string;
  readonly dossierHintStrong: string;
  readonly dossierHintWeak: string;
  readonly smirkLines: readonly [string, string];
  readonly fumbleLines: readonly [string, string];
  readonly clutchLine: string;
  readonly zonkLine: string;
  readonly wheelLine: string;
  readonly scoutStrongCall: string;
  readonly scoutWeakCall: string;
}

export const CAST_PROFILES_V7: Record<CastIdV7, CastProfileV7> = {
  // ======================= SEASON 1 — EASY (0.42–0.48) ======================
  CARMEN_DELGADO: {
    id: 'CARMEN_DELGADO',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Carmen Delgado',
    age: 34,
    title: 'Bellevue Head Triage Clinician',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/carmen_delgado.jpg',
    accentHex: '#FF6738',
    weakCategories: ['FINANCE', 'DYNASTIES', 'FINE ARTS'],
    strongCategories: ['MEDICINE', 'CHEMISTRY', 'CUISINE'],
    signatureTellText:
      'Twists her blue triage ballpoint pen cleanly between her fingers whenever a Truce square opens—honor her truce and she keeps the broadcast spotless.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.42,
    playstyle: 'PROFESSOR',
    temperament: 'STEADY',
    seasonTier: 1,
    eraFashionTag: '1966 Silver-Streaked Bob · Crisp White Clinical Jacket, Burgundy Blouse & Blue Pen',
    bio: 'Twelve years running Bellevue’s midnight triage desk left her razor-sharp on clinical dosages, apothecary compounds, and the Cuban café-con-leche recipes that keep Floor Four upright until dawn.',
  },
  TOBY_OKAFOR: {
    id: 'TOBY_OKAFOR',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Toby Okafor',
    age: 41,
    title: 'Con Ed High-Voltage Lineman',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/toby_okafor.jpg',
    accentHex: '#F4A91F',
    weakCategories: ['LITERATURE', 'LEXICON', 'CUISINE'],
    strongCategories: ['ENGINES', 'PHYSICS', 'GADGETS'],
    signatureTellText:
      'Lifts his brass inspection lens and cocks an ear toward the floor cables whenever Control Booth A juices a square—calm, rock-steady blocker who seals off your rows like a Manhattan circuit breaker.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.44,
    playstyle: 'BLOCKER',
    temperament: 'STEADY',
    seasonTier: 1,
    eraFashionTag: '1966 Mustard Utility Jacket · Striped Crew Tee & Brass Insulated Goggles',
    bio: 'Keeps Midtown’s substations humming through July heatwaves, solders shortwave receivers on his Brooklyn stoop, and diagnoses a slipping turbine shaft from half a city block away.',
  },
  INEZ_CALLAHAN: {
    id: 'INEZ_CALLAHAN',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Inez Callahan',
    age: 63,
    title: 'Fifth Avenue Head Librarian',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/inez_callahan.jpg',
    accentHex: '#0096A6',
    weakCategories: ['GADGETS', 'ENGINES', 'SPORTS'],
    strongCategories: ['LITERATURE', 'LEXICON', 'FOLKLORE'],
    signatureTellText:
      'Peers calmly over her tortoiseshell cat-eye glasses and stirs her porcelain teacup before dissecting a tricky clue—ice-veined even when the Turn-10 bell looms.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.46,
    playstyle: 'PROFESSOR',
    temperament: 'ICE_VEINED',
    seasonTier: 1,
    eraFashionTag: '1966 Silver Double-Bun · Tortoiseshell Cat-Eye Glasses, Emerald Blazer & Teacup',
    bio: 'Forty years ruling the Fifth Avenue Reference Room left her fluent in dog-eared first editions, obscure Latin root words, and every old myth ever smuggled past a municipal censor.',
  },
  DOTTY_VANCE: {
    id: 'DOTTY_VANCE',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Dotty Vance',
    age: 38,
    title: 'Topeka Blue-Ribbon Bake-Off Queen',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/roz_korman.jpg',
    accentHex: '#FF6738',
    weakCategories: ['PHYSICS', 'ENGINES', 'FINANCE'],
    strongCategories: ['CUISINE', 'PRICING', 'FOLKLORE'],
    signatureTellText:
      'Pats her honey-blonde bouffant twice and beams at Camera One whenever a Mystery Curtain or pantry bargain gleams—plays strictly by Kansas church-supper rules.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.46,
    playstyle: 'GAMBLER',
    temperament: 'SHOWBOAT',
    seasonTier: 1,
    eraFashionTag: '1966 Honey-Blonde Bouffant · Coral Gingham Dress & Pearl Clip-Ons',
    bio: 'Swept four Kansas county fairs with a three-layer pecan chiffon, clips A&P supermarket coupons down to the half-cent, and remembers every old prairie tall tale her grandmother whispered over the mixing bowl.',
  },
  CHET_KOWALSKI: {
    id: 'CHET_KOWALSKI',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Chet Kowalski',
    age: 36,
    title: 'Milwaukee 300-Game Pro Bowler',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/rex_calloway.jpg',
    accentHex: '#0096A6',
    weakCategories: ['LITERATURE', 'FINE ARTS', 'MEDICINE'],
    strongCategories: ['SPORTS', 'JUKEBOX', 'ENGINES'],
    signatureTellText:
      'Blows rosin dust off his bowling thumb before charging straight at the fattest top-row plaque—turns red as a Milwaukee tavern neon sign if you poach his lane!',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.47,
    playstyle: 'HIGH_ROLLER',
    temperament: 'HOTHEAD',
    seasonTier: 1,
    eraFashionTag: '1966 Boxy Flattop Crew Cut · Turquoise & Gold Chain-Stitched Bowling Shirt',
    bio: 'Recites every National League box score since ’49 from memory, knows every nickel-spin 45 on the Schlitz Lanes Wurlitzer, and rebuilt his ’63 Impala four-barrel carburetor on a Sunday dare.',
  },
  PEGGY_SUE_CONNORS: {
    id: 'PEGGY_SUE_CONNORS',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Peggy Sue Connors',
    age: 25,
    title: 'Pan Am Clipper Stewardess',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/seo_yun_kang.jpg',
    accentHex: '#1E56C5',
    weakCategories: ['CHEMISTRY', 'ODDS', 'FALLACIES'],
    strongCategories: ['ATLAS', 'SCREEN', 'PRICING'],
    signatureTellText:
      'Tilts her sky-blue Pan Am pillbox cap whenever the Big Wheel or a Mystery Curtain lights up—treats every spin like a first-class champagne upgrade.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.48,
    playstyle: 'GAMBLER',
    temperament: 'SHOWBOAT',
    seasonTier: 1,
    eraFashionTag: '1966 Pan Am Sky-Blue Pillbox Cap · Tailored Flight Suit & White Gloves',
    bio: 'Stamps passports from Lisbon to Tokyo before breakfast, trades first-class gossip with jet-setting movie stars over the Atlantic, and calculates duty-free bargains across four currencies without blinking.',
  },

  // ===================== SEASON 2 — STANDARD (0.54–0.62) ====================
  BUZZ_HALVORSEN: {
    id: 'BUZZ_HALVORSEN',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Buzz Halvorsen',
    age: 33,
    title: 'Cape Canaveral Flight Engineer',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/alastair_kerr.jpg',
    accentHex: '#1E56C5',
    weakCategories: ['FINE ARTS', 'JUKEBOX', 'CUISINE'],
    strongCategories: ['PHYSICS', 'ENGINES', 'ODDS'],
    signatureTellText:
      'Snaps his ivory pocket slide rule into alignment before methodical picks—flies every broadcast strictly by Gemini checklist and never flinches on the clock.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.54,
    playstyle: 'PROFESSOR',
    temperament: 'ICE_VEINED',
    seasonTier: 2,
    eraFashionTag: '1966 Buzz Crew Cut · Short-Sleeve Crisp Shirt, Skinny Black Tie & Slide Rule',
    bio: 'Spends mornings plotting Gemini Agena orbital burns, afternoons calculating launch probability margins, and evenings debating jet-propulsion ratios over black coffee at the Cocoa Beach diner.',
  },
  GIGI_ST_CLAIR: {
    id: 'GIGI_ST_CLAIR',
    role: 'RIVAL_HEEL',
    name: 'Gigi St. Clair',
    age: 24,
    title: 'Carnaby Street Mod Buyer',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/seo_yun_kang.jpg',
    accentHex: '#E63B7A',
    weakCategories: ['DYNASTIES', 'CHEMISTRY', 'SPORTS'],
    strongCategories: ['FINE ARTS', 'JUKEBOX', 'PRICING'],
    signatureTellText:
      'Flashes her mirrored compact toward her mod entourage in Row C whenever a wild square glows—slap CATCH CHEAT the instant LIVE TELL blinks!',
    cheatChannel: 'ROW_C_GLINT',
    baseAccuracy: 0.56,
    playstyle: 'GAMBLER',
    temperament: 'SHOWBOAT',
    seasonTier: 2,
    eraFashionTag: '1966 Vidal Sassoon Geometric Bob · Op-Art Color-Block Mod Minidress',
    bio: 'Jets straight from Soho pop-art gallery openings to Abbey Road vinyl pressing sessions, and can quote the exact West End retail markup on a Mary Quant shift before the seams cool.',
  },
  WALTER_PRINGLE: {
    id: 'WALTER_PRINGLE',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Walter Pringle',
    age: 54,
    title: 'Hartford Sunday Crossword Editor',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/grant_bellamy.jpg',
    accentHex: '#F4A91F',
    weakCategories: ['SPORTS', 'PRICING', 'GADGETS'],
    strongCategories: ['LEXICON', 'LITERATURE', 'FALLACIES'],
    signatureTellText:
      'Tweaks his polka-dot bow tie while mapping out defensive blocks across the Tote—steady as a grandfather clock and fond of fencing careless challengers into a corner.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.58,
    playstyle: 'BLOCKER',
    temperament: 'STEADY',
    seasonTier: 2,
    eraFashionTag: '1966 Herringbone Tweed Jacket · Polka-Dot Bow Tie & Round Wire-Rims',
    bio: 'Torments Sunday commuters with wickedly clued anagrams, quotes Victorian doorstoppers from memory, and delights in puncturing slippery bar-room logic with a ruby fountain pen.',
  },
  BETTY_LOU_HARPER: {
    id: 'BETTY_LOU_HARPER',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Betty Lou Harper',
    age: 29,
    title: 'Nashville Studio Session Singer',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/roz_korman.jpg',
    accentHex: '#FF6738',
    weakCategories: ['FINANCE', 'PHYSICS', 'MEDICINE'],
    strongCategories: ['JUKEBOX', 'FOLKLORE', 'SCREEN'],
    signatureTellText:
      'Saves her showstopping grand-finale belt for Turns 8 through 10—watches the Split-Flap like a Billboard chart countdown and swings for the chandeliers when trailing.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.59,
    playstyle: 'CLUTCH_SHARK',
    temperament: 'SHOWBOAT',
    seasonTier: 2,
    eraFashionTag: '1966 Sky-High Auburn Beehive · Sequined Collar Turquoise Gown',
    bio: 'Laid down silken harmony on thirty RCA Studio B chart-toppers, grew up trading Appalachian ghost yarns on the porch, and never misses a Saturday matinee Technicolor double feature.',
  },
  MILES_ELLINGTON: {
    id: 'MILES_ELLINGTON',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Miles Ellington',
    age: 39,
    title: 'Village Vanguard Jazz Critic',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/toby_okafor.jpg',
    accentHex: '#0096A6',
    weakCategories: ['PRICING', 'ENGINES', 'ODDS'],
    strongCategories: ['JUKEBOX', 'HEADLINES', 'FINE ARTS'],
    signatureTellText:
      'Snaps a quiet two-and-four off-beat against his lectern before slicing off your bridge or tic-tac line—cool as dry ice even when the Monoscope static howls nearby.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.6,
    playstyle: 'BLOCKER',
    temperament: 'ICE_VEINED',
    seasonTier: 2,
    eraFashionTag: '1966 Beatnik Charcoal Turtleneck · Black Wool Beret & Jazz Shades',
    bio: 'Files 2:00 AM liner notes on hard-bop horn charts, recalls every front-page wire scoop since the Truman administration, and argues abstract brushwork with SoHo gallery painters till sunrise.',
  },
  SYLVIE_BEAUMONT: {
    id: 'SYLVIE_BEAUMONT',
    role: 'RIVAL_HEEL',
    name: 'Sylvie Beaumont',
    age: 37,
    title: 'Montreal Gourmet Dining Critic',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/vera_karp.jpg',
    accentHex: '#E63B7A',
    weakCategories: ['GADGETS', 'PHYSICS', 'SPORTS'],
    strongCategories: ['CUISINE', 'ATLAS', 'DYNASTIES'],
    signatureTellText:
      'Glances imperiously up toward Spotlight #4 for a whispered cue whenever a $500 plaque glows—slap CATCH CHEAT to collapse her soufflé live on network air!',
    cheatChannel: 'FRESNEL_LAMP',
    baseAccuracy: 0.62,
    playstyle: 'HIGH_ROLLER',
    temperament: 'HOTHEAD',
    seasonTier: 2,
    eraFashionTag: '1966 Cerise Jackie-O Pillbox Hat · Silk Scarf & Pearl Studs',
    bio: 'Grades consommé from Montreal to Lyon with a lethal fountain pen, maps vineyard appellations blindfolded, and traces every royal court banquet from Versailles to imperial Vienna.',
  },

  // ======================= SEASON 3 — HARD (0.66–0.74) ======================
  MARGO_STERLING: {
    id: 'MARGO_STERLING',
    role: 'RIVAL_HEEL',
    name: 'Margo Sterling',
    age: 40,
    title: 'Madison Avenue Ad Director',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/carmen_delgado.jpg',
    accentHex: '#0096A6',
    weakCategories: ['FOLKLORE', 'CHEMISTRY', 'ATLAS'],
    strongCategories: ['PRICING', 'FINANCE', 'HEADLINES'],
    signatureTellText:
      'Checks the angle of Spotlight #4 off her gold cocktail brooch—surgical tactical blocker who loves killing a challenger’s hot streak before the first commercial.',
    cheatChannel: 'FRESNEL_LAMP',
    baseAccuracy: 0.66,
    playstyle: 'BLOCKER',
    temperament: 'ICE_VEINED',
    seasonTier: 3,
    eraFashionTag: '1966 Sculpted French Chignon · Emerald Box-Jacket Suit & Gold Brooch',
    bio: 'Pitches million-dollar network campaigns over bone-dry martinis, tracks consumer price sheets and Madison Avenue mergers in her head, and strips three morning newspapers before nine o’clock.',
  },
  HANK_MCCOY: {
    id: 'HANK_MCCOY',
    role: 'RIVAL_HEEL',
    name: 'Hank McCoy',
    age: 51,
    title: 'Houston Oil-Patch Wildcatter',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/rex_calloway.jpg',
    accentHex: '#F4A91F',
    weakCategories: ['LITERATURE', 'FINE ARTS', 'LEXICON'],
    strongCategories: ['FINANCE', 'ATLAS', 'ENGINES'],
    signatureTellText:
      'Rests his knuckles along the lectern rim to feel Roz’s rigged buzz—charges straight at $500 vaults and blows his Silverbelly top whenever a Signal Jam zonks his lead!',
    cheatChannel: 'SOLENOID_SPARK',
    baseAccuracy: 0.68,
    playstyle: 'HIGH_ROLLER',
    temperament: 'HOTHEAD',
    seasonTier: 3,
    eraFashionTag: '1966 Silverbelly Stetson Hat · Tan Gabardine Suit & Turquoise Bolo Tie',
    bio: 'Drilled wildcat gushers from the Permian Basin to the Persian Gulf, reads closing ticker tape like a cattle brand, and knows heavy diesel torque better than his own wedding anniversary.',
  },
  ALASTAIR_KERR: {
    id: 'ALASTAIR_KERR',
    role: 'RIVAL_HEEL',
    name: 'Alastair Kerr',
    age: 49,
    title: 'Savile Row 9-Week Champion',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/alastair_kerr.jpg',
    accentHex: '#F4A91F',
    weakCategories: ['PRICING', 'PHYSICS', 'JUKEBOX'],
    strongCategories: ['FINE ARTS', 'DYNASTIES', 'LITERATURE'],
    signatureTellText:
      'Adjusts his monogrammed gold cufflink toward Spotlight #4 for Roz’s secret blink—slap CATCH CHEAT when LIVE TELL flashes and watch his Mayfair poise dissolve!',
    cheatChannel: 'FRESNEL_LAMP',
    baseAccuracy: 0.7,
    playstyle: 'PROFESSOR',
    temperament: 'HOTHEAD',
    seasonTier: 3,
    eraFashionTag: '1966 Savile Row Midnight Suit · Crimson Silk Tie & Gold Cufflinks',
    bio: 'Appraises Renaissance oils for Mayfair estates, recites Habsburg family trees over vintage port, and regards everyday supermarket price tags as a distasteful colonial rumor.',
  },
  LANA_STARLING: {
    id: 'LANA_STARLING',
    role: 'RIVAL_HEEL',
    name: 'Lana Starling',
    age: 27,
    title: 'Burbank Prime-Time Sitcom Starlet',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/roz_korman.jpg',
    accentHex: '#E63B7A',
    weakCategories: ['CHEMISTRY', 'PHYSICS', 'ODDS'],
    strongCategories: ['SCREEN', 'JUKEBOX', 'HEADLINES'],
    signatureTellText:
      'Flutters her Hollywood lashes toward her press agent in Row C right before spinning a wild plaque—bust her LIVE TELL while Camera Two zooms in!',
    cheatChannel: 'ROW_C_GLINT',
    baseAccuracy: 0.71,
    playstyle: 'GAMBLER',
    temperament: 'SHOWBOAT',
    seasonTier: 3,
    eraFashionTag: '1966 Platinum Flip Hairdo · Champagne Satin Gown & Mink-Trimmed Stole',
    bio: 'Steals every Desilu soundstage close-up, memorizes every Hollywood gossip column before hair-and-makeup finishes, and sang live on three coast-to-coast variety specials before twenty-five.',
  },
  VINCE_CASTELLANO: {
    id: 'VINCE_CASTELLANO',
    role: 'RIVAL_HEEL',
    name: 'Vince Castellano',
    age: 45,
    title: 'Las Vegas Sands Casino Pit Boss',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/grant_bellamy.jpg',
    accentHex: '#FF6738',
    weakCategories: ['MEDICINE', 'FOLKLORE', 'CUISINE'],
    strongCategories: ['ODDS', 'FINANCE', 'FALLACIES'],
    signatureTellText:
      'Taps his gold pinky ring on the lectern solenoid when the late turns tighten—ice-cold Turn 8–10 closer who lives for taking the pot on the final card.',
    cheatChannel: 'SOLENOID_SPARK',
    baseAccuracy: 0.72,
    playstyle: 'CLUTCH_SHARK',
    temperament: 'ICE_VEINED',
    seasonTier: 3,
    eraFashionTag: '1966 Iridescent Silver Sharkskin Suit · Slick Pompadour & Gold Pinky Ring',
    bio: 'Spots a shaved die across the Sands casino carpet, computes house vigorish before the chips finish clinking, and smells a crooked hustle a mile down the Las Vegas Strip.',
  },
  REX_CALLOWAY: {
    id: 'REX_CALLOWAY',
    role: 'RIVAL_HEEL',
    name: 'Rex Calloway',
    age: 38,
    title: 'Syndicated Sports Columnist',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/rex_calloway.jpg',
    accentHex: '#E63B7A',
    weakCategories: ['CHEMISTRY', 'DYNASTIES', 'FALLACIES'],
    strongCategories: ['SPORTS', 'HEADLINES', 'SCREEN'],
    signatureTellText:
      'Flashes his camera-ready grin and coughs behind his fist toward Row C Seat 14 for an opera-glass cue—tap CATCH CHEAT the instant LIVE TELL lights to turn his face crimson!',
    cheatChannel: 'ROW_C_GLINT',
    baseAccuracy: 0.73,
    playstyle: 'CLUTCH_SHARK',
    temperament: 'SHOWBOAT',
    seasonTier: 3,
    eraFashionTag: '1966 Burgundy Velvet Dinner Tuxedo · Pompadour Wave & Silk Bow Tie',
    bio: 'Covered every World Series and heavyweight title bout since ’54, dictates syndicated wire copy from press row, and swaps wisecracks with Hollywood regulars at ringside.',
  },

  // ==================== SEASON 4 — MASTERMIND (0.76–0.85) ===================
  ARTHUR_PENDLETON: {
    id: 'ARTHUR_PENDLETON',
    role: 'RIVAL_SYMPATHETIC',
    name: 'Arthur Pendleton',
    age: 58,
    title: 'Oxford Regius History Don',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/grant_bellamy.jpg',
    accentHex: '#1E56C5',
    weakCategories: ['GADGETS', 'JUKEBOX', 'PRICING'],
    strongCategories: ['DYNASTIES', 'LITERATURE', 'LEXICON'],
    signatureTellText:
      'Straightens his gold silk ascot with donnish amusement before sweeping classical squares—refuses Control Booth fixes as “unsporting nonsense.”',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.76,
    playstyle: 'PROFESSOR',
    temperament: 'STEADY',
    seasonTier: 4,
    eraFashionTag: '1966 Claret Crushed-Velvet Blazer · Silk Ascot Cravat & Silver Waves',
    bio: 'Lectures on imperial dynasties at Magdalen College by afternoon, translates obscure folios by candlelight, and dissects Greek and Latin etymologies with wicked high-table glee.',
  },
  NORMA_JEAN_BAKER: {
    id: 'NORMA_JEAN_BAKER',
    role: 'RIVAL_HEEL',
    name: 'Norma Jean Baker',
    age: 26,
    title: 'Jet-Set Chess Grandmaster',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/carmen_delgado.jpg',
    accentHex: '#0096A6',
    weakCategories: ['CUISINE', 'JUKEBOX', 'MEDICINE'],
    strongCategories: ['ODDS', 'FALLACIES', 'ATLAS'],
    signatureTellText:
      'Lowers her oversized white mod shades just enough to catch Spotlight #4’s reflection—ruthless positional blocker plotting your Turn-9 fork on Turn 3.',
    cheatChannel: 'FRESNEL_LAMP',
    baseAccuracy: 0.78,
    playstyle: 'BLOCKER',
    temperament: 'ICE_VEINED',
    seasonTier: 4,
    eraFashionTag: '1966 Oversized White Mod Sunglasses · Houndstooth Coat & Sleek Bob',
    bio: 'Plays twelve-board blindfold exhibitions across European capitals, spots deceptive forks and flawed syllogisms in two breaths, and prices endgame probabilities faster than an IBM 360.',
  },
  STERLING_VANCE: {
    id: 'STERLING_VANCE',
    role: 'RIVAL_HEEL',
    name: 'Sterling Vance',
    age: 52,
    title: 'Broad Street Tape-Reader',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/alastair_kerr.jpg',
    accentHex: '#1E56C5',
    weakCategories: ['FOLKLORE', 'SCREEN', 'FINE ARTS'],
    strongCategories: ['FINANCE', 'ODDS', 'HEADLINES'],
    signatureTellText:
      'Thumbs his gold waistcoat chain while reading rigged podium pulses—raids $600 Blind squares and locked vaults like a hostile proxy takeover.',
    cheatChannel: 'SOLENOID_SPARK',
    baseAccuracy: 0.8,
    playstyle: 'HIGH_ROLLER',
    temperament: 'ICE_VEINED',
    seasonTier: 4,
    eraFashionTag: '1966 Chalk-Stripe Three-Piece Suit · Gold Watch Chain & Crimson Tie',
    bio: 'Reads closing tickers off Broad Street like symphonic sheet music, prices actuarial odds before the bell rings, and treats every morning headline as an arbitrage sheet.',
  },
  SEO_YUN_KANG: {
    id: 'SEO_YUN_KANG',
    role: 'RIVAL_HEEL',
    name: 'Seo-Yun Kang',
    age: 31,
    title: 'Geneva Molecular Biochemist',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/seo_yun_kang.jpg',
    accentHex: '#1E56C5',
    weakCategories: ['FOLKLORE', 'SCREEN', 'SPORTS'],
    strongCategories: ['CHEMISTRY', 'MEDICINE', 'ODDS'],
    signatureTellText:
      'Clicks her chrome pen against the lectern trim right as Control Booth A pulses a rigged signal—bust her LIVE TELL before she runs the laboratory row!',
    cheatChannel: 'SOLENOID_SPARK',
    baseAccuracy: 0.82,
    playstyle: 'PROFESSOR',
    temperament: 'ICE_VEINED',
    seasonTier: 4,
    eraFashionTag: '1966 Sleek Jet-Black Pageboy Bob · Ivory Turtleneck & Tailored Slate Blazer',
    bio: 'Published three celebrated Geneva papers on enzyme synthesis, dissects clinical trial data for sport, and calculates variance before the studio clock ticks its first beat.',
  },
  CLARA_VON_BERG: {
    id: 'CLARA_VON_BERG',
    role: 'RIVAL_HEEL',
    name: 'Clara von Berg',
    age: 44,
    title: 'Vienna State Opera Conductor',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/vera_karp.jpg',
    accentHex: '#E63B7A',
    weakCategories: ['ENGINES', 'GADGETS', 'FINANCE'],
    strongCategories: ['FINE ARTS', 'DYNASTIES', 'FOLKLORE'],
    signatureTellText:
      'Signals Spotlight #4 with a razor flick of her wooden baton—imperious blocker whose Viennese fury erupts the instant you break her tempo!',
    cheatChannel: 'FRESNEL_LAMP',
    baseAccuracy: 0.83,
    playstyle: 'BLOCKER',
    temperament: 'HOTHEAD',
    seasonTier: 4,
    eraFashionTag: '1966 Platinum Chignon Updo · Tailored Opera Tails & White Satin Bow',
    bio: 'Commands Wagnerian cycles beneath gilded European balconies, traces five centuries of royal court patronage, and knows every ancient legend that ever inspired a grand libretto.',
  },
  VICTOR_LAZAR: {
    id: 'VICTOR_LAZAR',
    role: 'RIVAL_HEEL',
    name: 'Victor Lazar',
    age: 47,
    title: '11-Week Undefeated Studio Sphinx',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/rex_calloway.jpg',
    accentHex: '#F4A91F',
    weakCategories: ['CUISINE', 'JUKEBOX', 'HEADLINES'],
    strongCategories: ['PHYSICS', 'FALLACIES', 'LEXICON'],
    signatureTellText:
      'Never raises his voice above a midnight whisper until Turn 8—watch for a faint solenoid glint beside his onyx lapel pin and hammer CATCH CHEAT!',
    cheatChannel: 'SOLENOID_SPARK',
    baseAccuracy: 0.85,
    playstyle: 'CLUTCH_SHARK',
    temperament: 'ICE_VEINED',
    seasonTier: 4,
    eraFashionTag: '1966 Midnight Nehru-Collar Tuxedo · Silver Temple Wings & Onyx Pin',
    bio: 'Eleven consecutive Fridays without surrendering the center lectern—slices through quantum riddles, logical paradoxes, and semantic traps like an Antwerp diamond through glass.',
  },

  // ========================= 3 BOOTH POWER BROKERS ==========================
  GRANT_BELLAMY: {
    id: 'GRANT_BELLAMY',
    role: 'BOOTH_BROKER',
    name: 'Grant Bellamy',
    age: 57,
    title: 'Velvet Voice of Eight O’Clock',
    silhouetteShape: 'SQUARE',
    portraitAsset: './assets/v7/portraits/grant_bellamy.jpg',
    accentHex: '#F4A91F',
    weakCategories: ['ATLAS', 'HEADLINES', 'PRICING', 'FALLACIES'],
    strongCategories: ['SCREEN', 'DYNASTIES', 'LITERATURE', 'JUKEBOX'],
    signatureTellText:
      'Glances coolly at his gold wristwatch and drops his baritone half an octave right before tightening the clock—charming until you threaten his 36th-Floor Penthouse.',
    cheatChannel: 'SOLENOID_SPARK',
    baseAccuracy: 0.82,
    playstyle: 'CLUTCH_SHARK',
    temperament: 'SHOWBOAT',
    seasonTier: 4,
    eraFashionTag: '1966 Midnight Shawl-Collar Tuxedo · Silver Temples & Brass Studio Mic',
    bio: 'Television’s smoothest master of ceremonies charms fifty million homes at eight sharp while keeping one manicured hand on the 36th-Floor Penthouse keys.',
  },
  ROZ_KORMAN: {
    id: 'ROZ_KORMAN',
    role: 'BOOTH_BROKER',
    name: 'Roz Korman',
    age: 46,
    title: 'VP of Sponsor Accounts',
    silhouetteShape: 'TRIANGLE',
    portraitAsset: './assets/v7/portraits/roz_korman.jpg',
    accentHex: '#E63B7A',
    weakCategories: ['MEDICINE', 'FOLKLORE', 'PHYSICS'],
    strongCategories: ['FINANCE', 'PRICING', 'ODDS'],
    signatureTellText:
      'Taps her broadcast headset boom mic right before sliding a wax-sealed canary sponsor tip onto your lectern.',
    cheatChannel: 'FRESNEL_LAMP',
    baseAccuracy: 0.8,
    playstyle: 'HIGH_ROLLER',
    temperament: 'HOTHEAD',
    seasonTier: 4,
    eraFashionTag: '1966 Olive Control-Booth Shirt · Broadcast Headset & Wax-Sealed Canary Envelopes',
    bio: 'Madison Avenue’s sharpest fixer protects sponsor ratings with wax-sealed halftime envelopes—always inspect her ink before trusting a free hint.',
  },
  VERA_KARP: {
    id: 'VERA_KARP',
    role: 'BOOTH_BROKER',
    name: 'Vera Karp',
    age: 52,
    title: 'Broadcast Standards Chief',
    silhouetteShape: 'CIRCLE',
    portraitAsset: './assets/v7/portraits/vera_karp.jpg',
    accentHex: '#0096A6',
    weakCategories: ['JUKEBOX', 'SPORTS', 'SCREEN'],
    strongCategories: ['FALLACIES', 'HEADLINES', 'LEXICON'],
    signatureTellText:
      'Peers through her jeweler’s loupe and clicks her brass stopwatch twice every time you torch a dirty sponsor tip or bust Control Booth rigging live on air.',
    cheatChannel: 'HONEST',
    baseAccuracy: 0.79,
    playstyle: 'BLOCKER',
    temperament: 'ICE_VEINED',
    seasonTier: 4,
    eraFashionTag: '1966 Braided Silver Crown · Dark Charcoal Blouse, Leather Apron & Brass Stopwatch',
    bio: 'Standards & Practices’ sleepless investigator pays certified bounties to challengers who expose booth rigging on camera.',
  },
};

/**
 * 24 Bespoke 1966 Champion Voice & Backstage Scouting Kits (`CHAMPION_VOICE_KITS_V7`).
 * Zero copy-paste templates: every Champion speaks in their own 1966 cadence across
 * smirks, fumbles, Turn 8–10 clutch drama, Gremlin Zonks, Wheel spins & Scouting Wires.
 */
export const CHAMPION_VOICE_KITS_V7: Record<RivalIdV7, ChampionVoiceKitV7> = {
  DOTTY_VANCE: {
    voiceArchetype: 'Sunny 1966 Topeka Bake-Off Sweetheart',
    greenRoomDossier: 'Left two frosted pecan chiffon tins for the camera crew and reorganized the Green Room coffee table by A&P coupon expiration date.',
    dossierHintStrong: 'Unstoppable around recipes, checkout bargains, and hearthside tall tales.',
    dossierHintWeak: 'Blinks politely whenever lab equations, V8 blocks, or Wall Street jargon pop up.',
    smirkLines: [
      '“Oh, sugar, that went down smoother than lemon meringue!” — Dotty banks {cash} on {category}!',
      '“Wait till my Topeka bridge club sees that in color!” — Dotty scoops {cash} off {category}!',
    ],
    fumbleLines: [
      '“Well, butter my biscuit—I completely blanked!” Dotty misses {category} — grab the +{rebound} Rebound!',
      '“Oh dear, my kitchen timer dinged too early!” Dotty drops {category} (+{rebound} Rebound live!)',
    ],
    clutchLine: '“Don’t let the gingham fool you, honey—I’ve won four Kansas bake-offs with thirty seconds on the oven clock!”',
    zonkLine: '“Mercy me! That dreadful test pattern just tripped the toaster breaker and ate {cash}!”',
    wheelLine: '“Ooooh, spin that gleaming beauty! Come on, chrome dinette or $1,000!”',
    scoutStrongCall: 'Dotty beamed like a state-fair judge—kitchen & bargain squares are pure home cooking for her!',
    scoutWeakCall: 'Dotty’s sunny grin froze solid on {category}—underline that weakness for your next pick!',
  },
  CARMEN_DELGADO: {
    voiceArchetype: 'Steady Bellevue Night-Shift Triage Clinician',
    greenRoomDossier: 'Clipped her blue triage ballpoint inside her crisp white coat pocket and traded hot Cuban espresso with the boom-mic crew before rehearsal.',
    dossierHintStrong: 'Clinical memory for hospital charts, lab compounds, and late-night kitchen craft.',
    dossierHintWeak: 'Shrugs off stock tickers, royal bloodlines, and stuffy museum auctions.',
    smirkLines: [
      '“Pulse steady, chart clean—that’s {cash} for the Queens clinic!” Carmen nails {category}!',
      '“Twelve-hour triage shifts sharpen your recall, darling.” Carmen banks {cash} on {category}!',
    ],
    fumbleLines: [
      '“Call a code blue on that answer!” Carmen misses {category} — +{rebound} Rebound sits wide open!',
      '“Not on my midnight clipboard, I’m afraid!” Carmen drops {category} — steal +{rebound} extra!',
    ],
    clutchLine: '“Two turns left and my heart rate hasn’t budged past sixty—let’s finish this square!”',
    zonkLine: '“Ay, bendito—someone defibrillate that transmitter! Signal jam just clipped Carmen for {cash}!”',
    wheelLine: '“Steady wrist, clean spin—come on, clinic mortgage payoff!”',
    scoutStrongCall: 'Carmen didn’t even uncap her blue pen—Bellevue science and kitchen clues are her comfort zone!',
    scoutWeakCall: 'Carmen gripped her blue pen tight on {category}—you just uncovered a rare clinical blind spot!',
  },
  CHET_KOWALSKI: {
    voiceArchetype: 'Boisterous Milwaukee Bowling-Alley Regular',
    greenRoomDossier: 'Brought a monogrammed rosin bag onto Studio 6A and spent rehearsal humming Del Shannon 45s while arguing spark-plug gaps with the grips.',
    dossierHintStrong: 'Deadly on box scores, jukebox rock-and-roll, and Detroit horsepower.',
    dossierHintWeak: 'Gets itchy collars around classic novels, oil paintings, and medical Latin.',
    smirkLines: [
      '“STRIKE right in the 1-3 pocket, baby!” Chet slams {cash} on {category}!',
      '“Buy Schlitz Lanes a round—that’s {cash} heading to Milwaukee!” Chet buries {category}!',
    ],
    fumbleLines: [
      '“Gutter ball! Somebody over-oiled these lanes!” Chet whiffs {category} — +{rebound} Rebound open!',
      '“Left the 7-10 split! Aw, nuts!” Chet misses {category} — scoop up +{rebound} bonus!',
    ],
    clutchLine: '“Tenth frame, turkey on the line—Chet Kowalski lives for the big money roll!”',
    zonkLine: '“FOUL BUZZER?! That rotten test-pattern jam just kicked my scoreboard for {cash}!”',
    wheelLine: '“Watch the wrist English, pal—this drum’s rolling straight for $1,000!”',
    scoutStrongCall: 'Chet fist-pumped like a 300-game—keep him off stadium stats, vinyl, and V8s!',
    scoutWeakCall: 'Chet tugged his bowling collar on {category}—hammer that lane whenever it lights up!',
  },
  PEGGY_SUE_CONNORS: {
    voiceArchetype: 'Glamorous 1966 Pan Am Jet-Age Hostess',
    greenRoomDossier: 'Checked her lipstick in a silver compact stamped “JFK–Rome” and bragged about serving Cary Grant dry vermouth at 35,000 feet.',
    dossierHintStrong: 'Breezes through world capitals, silver-screen glamour, and duty-free price tags.',
    dossierHintWeak: 'Bails out fast whenever test tubes, card odds, or logic traps show up.',
    smirkLines: [
      '“Smooth touchdown in First Class—thank you for flying Peggy Sue!” Banks {cash} on {category}!',
      '“Champagne for Row A, darling!” Peggy Sue cruises through {category} for {cash}!',
    ],
    fumbleLines: [
      '“Fasten your seatbelts—unexpected air pocket on {category}!” +{rebound} Rebound ready!',
      '“Oops! Wrong gate, wrong hemisphere!” Peggy Sue misses {category} — claim +{rebound} extra!',
    ],
    clutchLine: '“Final approach into Studio 6A—seatbacks upright and aiming straight for the winner’s check!”',
    zonkLine: '“My pillbox hat! Radio static on the carrier just grounded my purse for {cash}!”',
    wheelLine: '“Wheels up, America! Let’s spin a first-class jackpot!”',
    scoutStrongCall: 'Peggy Sue flashed a billboard smile—world maps, movies, and price tags are her runway!',
    scoutWeakCall: 'Peggy Sue hit clear-air turbulence on {category}—file that away for your next detour!',
  },
  TOBY_OKAFOR: {
    voiceArchetype: 'Grounded Brooklyn Con Ed Master Lineman',
    greenRoomDossier: 'Walked the stage apron before air tapping his insulated boots to test whether Booth A had hidden solenoids wired beneath Podium Two.',
    dossierHintStrong: 'Master of heavy machinery, electrical forces, and clever mechanical contraptions.',
    dossierHintWeak: 'Leaves poetry readings, fancy word games, and gourmet sauces to Manhattan.',
    smirkLines: [
      '“Clean circuit, zero hum—{cash} straight onto the meter!” Toby locks {category}!',
      '“That answer ran at full voltage!” Toby banks {cash} on {category}!',
    ],
    fumbleLines: [
      '“Blew a main fuse on that one—yours if you want it!” Toby misses {category} (+{rebound} Rebound!)',
      '“Short-circuited! Grab the spare, kid!” Toby drops {category} — +{rebound} Rebound open!',
    ],
    clutchLine: '“Summer blackout rolling into the final two turns—good thing I packed rubber gloves!”',
    zonkLine: '“Whoa! Arc flash in the master tube—that signal jam just shorted Toby for {cash}!”',
    wheelLine: '“Nice balanced bearings on this drum—let’s see where the copper stops!”',
    scoutStrongCall: 'Toby nodded like a tested transformer—never hand the lineman hardware or physics for free!',
    scoutWeakCall: 'Toby scratched behind his goggles on {category}—steer him right back into that gap!',
  },
  INEZ_CALLAHAN: {
    voiceArchetype: 'Razor-Witted Fifth Avenue Reference Librarian',
    greenRoomDossier: 'Quietly corrected three typos on the network cue cards with a red pencil while sipping Earl Grey from her own bone-china saucer.',
    dossierHintStrong: 'Unmatched recall of classic shelves, etymology, and dusty mythic folklore.',
    dossierHintWeak: 'Has zero patience for shiny gadgets, grease-monkey motors, or stadium box scores.',
    smirkLines: [
      '“Dewey Decimal 813, third shelf from the left—{cash}, please.” Inez owns {category}!',
      '“Shhh—let the Split-Flap do the shouting.” Inez banks {cash} on {category}!',
    ],
    fumbleLines: [
      '“Hmph! Clearly a misfiled overdue volume.” Inez misses {category} — +{rebound} Rebound waiting!',
      '“Not in MY card catalog!” Inez fumbles {category} — check out that +{rebound} Rebound!',
    ],
    clutchLine: '“Closing bell at the Fifth Avenue Reference Desk, young challenger—mind your footnotes!”',
    zonkLine: '“Well, I NEVER! That rude broadcast static just fined me {cash} without a receipt!”',
    wheelLine: '“A terribly loud contraption, yet one must humor the mezzanine…”',
    scoutStrongCall: 'Inez peered smoothly over her cat-eyes—books, roots, and folklore belong to her shelf!',
    scoutWeakCall: 'Inez rattled her saucer on {category}—stamp that blind spot in red ink!',
  },
  BUZZ_HALVORSEN: {
    voiceArchetype: 'Crisp Cape Canaveral Gemini Flight Engineer',
    greenRoomDossier: 'Timed the studio camera dolly speed with his wristwatch and muttered that the Tote Board bulbs drew 4.2 kilowatts over spec.',
    dossierHintStrong: 'Surgical mastery of orbital laws, rocket propulsion, and flight-margin odds.',
    dossierHintWeak: 'Baffled by gallery paintings, teenage hit records, and fussy dinner menus.',
    smirkLines: [
      '“Telemetry green, trajectory nominal—add {cash} to the ledger.” Buzz aces {category}!',
      '“Slide rule checks out to three decimals—{cash}!” Buzz clears {category}!',
    ],
    fumbleLines: [
      '“Check the gimbal—slight yaw drift on {category}!” Buzz misses — +{rebound} Rebound live!',
      '“Scrubbed that launch—pad’s all yours!” Buzz whiffs {category} for a +{rebound} Rebound!',
    ],
    clutchLine: '“T-minus two turns to splashdown—all switches locked on manual override.”',
    zonkLine: '“Loss of signal! That rogue carrier jam just scrubbed {cash} off my flight plan!”',
    wheelLine: '“Angular momentum looks clean—initiating Showcase Wheel burn!”',
    scoutStrongCall: 'Buzz snapped his slide rule shut—rocket science, propulsion, and launch odds are effortless orbit for him!',
    scoutWeakCall: 'Buzz lost telemetry on {category}—pull him down to earth on that category next turn!',
  },
  GIGI_ST_CLAIR: {
    voiceArchetype: 'Mod 1966 Carnaby Street Trendsetter',
    greenRoomDossier: 'Refused standard studio hairspray, unpacked three Beatles import singles, and winked twice at a sharp-dressed friend seated in Row C.',
    dossierHintStrong: 'Lives and breathes Pop Art, London vinyl charts, and boutique retail margins.',
    dossierHintWeak: 'Yawns loudly through medieval kings, chemistry formulas, and muddy sports stats.',
    smirkLines: [
      '“Fab, gear, and {cash} richer, luv!” Gigi breezes through {category}!',
      '“Absolutely smashing—straight to Mayfair for {cash}!” Gigi claims {category}!',
    ],
    fumbleLines: [
      '“Oh, what a frightful drag—I flubbed {category}!” +{rebound} Rebound sitting pretty!',
      '“Positively square question, darling!” Gigi misses {category} — nab the +{rebound} Rebound!',
    ],
    clutchLine: '“Don’t be a square now—watch Carnaby Street pinch this trophy in the final two turns!”',
    zonkLine: '“Blimey! That beastly test pattern just melted my telly signal AND {cash}!”',
    wheelLine: '“Groovy! Spin that shiny wheel and give Swinging London a show!”',
    scoutStrongCall: 'Gigi snapped her compact smugly—Pop Art, vinyl charts, and retail tags are her catwalk!',
    scoutWeakCall: 'Gigi rolled her winged lashes at {category}—totally out of her mod orbit!',
  },
  WALTER_PRINGLE: {
    voiceArchetype: 'Droll Hartford Sunday Crossword Curmudgeon',
    greenRoomDossier: 'Worked a London Times cryptic in ink during makeup and muttered that half the contestant roster couldn’t spell “syzygy” under oath.',
    dossierHintStrong: 'Formidable across vocabulary traps, classic books, and sly logical puzzles.',
    dossierHintWeak: 'Couldn’t quote a batting average, milk price, or transistor patent to save his tweed.',
    smirkLines: [
      '“Seven letters, fits snugly across—that’s {cash}!” Walter inks {category}!',
      '“Elementary clue-pinning, my dear challenger—{cash}!” Walter takes {category}!',
    ],
    fumbleLines: [
      '“Confound it—hand me an ink eraser on {category}!” +{rebound} Rebound wide open!',
      '“A terribly sloppy clue, frankly!” Walter whiffs {category} — scoop the +{rebound} Rebound!',
    ],
    clutchLine: '“Two empty boxes left in the Sunday grid—let’s see who knows the final crossing word.”',
    zonkLine: '“Good heavens! That ghastly test-pattern static just blotted {cash} off my clean margin!”',
    wheelLine: '“Pure vulgar chance—still, I suppose one must indulge the brass hardware.”',
    scoutStrongCall: 'Walter tweaked his polka-dot bow tie—wordplay, literature, and logic puzzles are his Sunday grid!',
    scoutWeakCall: 'Walter’s wire-rims fogged over on {category}—box him straight back into that corner!',
  },
  BETTY_LOU_HARPER: {
    voiceArchetype: 'Sparkling Nashville Studio Session Vocalist',
    greenRoomDossier: 'Warmed up her soprano in Dressing Room B with Patsy Cline licks while trading mountain superstitions with the wardrobe lady.',
    dossierHintStrong: 'Shines on hit-parade vinyl, back-porch legends, and Saturday-matinee cinema.',
    dossierHintWeak: 'Stumbles whenever Wall Street balances, physics, or medical charts intrude.',
    smirkLines: [
      '“Hit that high note, honey—{cash} straight to Number One!” Betty Lou nails {category}!',
      '“Well, thank you kindly, Studio 6A—{cash} in the tambourine!” Takes {category}!',
    ],
    fumbleLines: [
      '“Ooh, sang that one a half-step flat!” Betty Lou misses {category} — +{rebound} Rebound open!',
      '“Lost the downbeat on {category}, y’all!” Grab that +{rebound} Rebound while it’s hot!',
    ],
    clutchLine: '“Save your applause, sugar—Nashville girls always bring the house down on the final chorus!”',
    zonkLine: '“Lord have mercy! Broadcast static just blew out my Studio B amp for {cash}!”',
    wheelLine: '“Spin it like a gold 45 on a Saturday night, y’all!”',
    scoutStrongCall: 'Betty Lou grinned under that beehive—vinyl hits, folklore, and Technicolor films are pure Music Row!',
    scoutWeakCall: 'Betty Lou hit a sour note on {category}—keep dragging her off-key there!',
  },
  MILES_ELLINGTON: {
    voiceArchetype: 'Velvet-Cool Greenwich Village Jazz Critic',
    greenRoomDossier: 'Showed up wearing dark tortoise shades indoors, read the late-edition Herald Tribune front-to-back, and critiqued the showband’s hi-hat tempo.',
    dossierHintStrong: 'Effortless command of vinyl history, front-page news, and modern fine art.',
    dossierHintWeak: 'Treats retail prices, engine specs, and casino odds as strictly square business.',
    smirkLines: [
      '“Right in the pocket, baby—cool {cash} on the downbeat.” Miles claims {category}!',
      '“Dig that swing—{cash} without wrinkling a cuff.” Miles locks {category}!',
    ],
    fumbleLines: [
      '“Clam on the bridge—all yours, cat.” Miles misses {category} — +{rebound} Rebound waiting!',
      '“Way too square for my ears, man.” Miles passes {category} — snatch +{rebound} extra!',
    ],
    clutchLine: '“Last eight bars of the set—time to trade fours and see who keeps their cool.”',
    zonkLine: '“Man, that test-pattern whine is sharp of B-flat—just blew {cash} clean out the horn!”',
    wheelLine: '“Let that spun-aluminum platter spin like a Blue Note LP, dig?”',
    scoutStrongCall: 'Miles gave one cool finger-snap—jazz vinyl, headlines, and gallery art are strictly in his pocket!',
    scoutWeakCall: 'Miles peered over his dark shades on {category}—that’s where you knock him off the beat!',
  },
  SYLVIE_BEAUMONT: {
    voiceArchetype: 'Haughty Montreal Three-Star Dining Critic',
    greenRoomDossier: 'Sent back the studio catering sandwich twice, checked her reflection under Spotlight #4, and rattled off three Burgundian vintages to the floor manager.',
    dossierHintStrong: 'Imperious authority on haute kitchens, world geography, and royal houses.',
    dossierHintWeak: 'Scoffs in frustration at household gadgets, physics, and locker-room sports.',
    smirkLines: [
      '“Magnifique! Three Michelin stars and {cash}!” Sylvie sweeps {category}!',
      '“Perfection, naturally—{cash} to the connoisseur.” Sylvie claims {category}!',
    ],
    fumbleLines: [
      '“Sacré bleu—inedible!” Sylvie misses {category} — +{rebound} Rebound served piping hot!',
      '“Quelle catastrophe! Take it back to the kitchen!” Sylvie drops {category} (+{rebound} Rebound!)',
    ],
    clutchLine: '“Two courses left, challenger—and I never surrender dessert to an amateur!”',
    zonkLine: '“Mon Dieu! That hideous test pattern just collapsed my soufflé AND stole {cash}!”',
    wheelLine: '“A vulgar carnival wheel—though a crisp thousand dollars spends marvelously in Montreal!”',
    scoutStrongCall: 'Sylvie tilted her pillbox chin high—fine dining, world maps, and royal courts are her private menu!',
    scoutWeakCall: 'Sylvie dropped her tasting spoon on {category}—keep serving her that bitter dish!',
  },
  MARGO_STERLING: {
    voiceArchetype: 'Razor-Sharp Madison Avenue Ad Executive',
    greenRoomDossier: 'Redlined a network commercial storyboard in five minutes flat while quietly taking notes on the angle of Spotlight #4.',
    dossierHintStrong: 'Lethal fluency in pricing campaigns, corporate markets, and breaking press.',
    dossierHintWeak: 'Dismisses old fairy tales, chemistry labs, and obscure maps as non-billable fluff.',
    smirkLines: [
      '“Client approved, invoice paid—that’s {cash}!” Margo closes {category}!',
      '“Sold in thirty seconds flat for {cash}, sweetheart.” Margo banks {category}!',
    ],
    fumbleLines: [
      '“Kill that campaign—we’re pulling the spots!” Margo misses {category} — +{rebound} Rebound live!',
      '“Dreadful focus-group copy!” Margo whiffs {category} — cash in on +{rebound} extra!',
    ],
    clutchLine: '“Fourth quarter, eight o’clock slot—this is where Madison Avenue signs the check.”',
    zonkLine: '“Who cleared that carrier blackout with the agency?! Static just torched {cash} off my billings!”',
    wheelLine: '“Terrific visual hook—let’s spin this wheel and spike the Nielsen share!”',
    scoutStrongCall: 'Margo smiled like a signed retainer—pricing, finance, and front-page press are her account turf!',
    scoutWeakCall: 'Margo’s conference-room poker face cracked on {category}—pitch that right back at her!',
  },
  HANK_MCCOY: {
    voiceArchetype: 'Booming Houston Oil-Patch Wildcatter',
    greenRoomDossier: 'Tipped the stagehands silver dollars to polish his boots and bragged that a $500 plaque was “barely pocket change for a rig hand.”',
    dossierHintStrong: 'Knows big money markets, global oilfields, and heavy diesel engines cold.',
    dossierHintWeak: 'Gets tangled fast in dusty books, gallery canvases, and fancy vocabulary.',
    smirkLines: [
      '“GUSHER! Roll out the barrels—that’s {cash}!” Hank drills {category}!',
      '“Yee-haw! Pure West Texas crude worth {cash}!” Hank stomps {category}!',
    ],
    fumbleLines: [
      '“Dry hole! Dagnabbit!” Hank misses {category} — +{rebound} Rebound sitting right there!',
      '“Busted drill bit on {category}!” Hank whiffs — swoop in for +{rebound} bonus!',
    ],
    clutchLine: '“Down to the last two rigs—Hank McCoy bets the whole ranch on the top row!”',
    zonkLine: '“BLOWOUT! That cussed signal jam just blew my Stetson clean off for {cash}!”',
    wheelLine: '“Stand back, Manhattan—watch a Texan spin this brass rig off its axle!”',
    scoutStrongCall: 'Hank slapped his silver buckle—big finance, geography, and roaring motors are Texas territory!',
    scoutWeakCall: 'Hank chewed his mustache over {category}—keep drilling right into that dry hole!',
  },
  ALASTAIR_KERR: {
    voiceArchetype: 'Pompous Savile Row 9-Week Velvet Champion',
    greenRoomDossier: 'Had his custom dinner lapels steamed twice and exchanged icy nods with Roz Korman beneath overhead Spotlight #4.',
    dossierHintStrong: 'Encyclopedic pride in Old Master art, royal houses, and canonical books.',
    dossierHintWeak: 'Clueless on grocery checkout totals, modern physics, and pop jukebox hits.',
    smirkLines: [
      '“Really, must they make it quite this effortless? {cash}.” Alastair sweeps {category}!',
      '“One doesn’t hold nine weeks by accident—{cash}!” Alastair pockets {category}!',
    ],
    fumbleLines: [
      '“Preposterous wording—I demand a steward!” Alastair whiffs {category} (+{rebound} Rebound!)',
      '“Utterly beneath Savile Row!” Alastair drops {category} — collect +{rebound} Rebound!',
    ],
    clutchLine: '“My corner table at ‘21’ awaits at nine sharp—kindly step aside for the closing turns.”',
    zonkLine: '“OUTRAGEOUS! Some ghastly test pattern just vandalized my purse for {cash}!”',
    wheelLine: '“Dreadfully provincial gadget, yet I shall graciously accept its tribute.”',
    scoutStrongCall: 'Alastair buffed his gold cufflink—Old Masters, dynasties, and literature are Mayfair ground!',
    scoutWeakCall: 'Alastair’s brow beaded sweat on {category}—watch his Savile Row poise melt there!',
  },
  LANA_STARLING: {
    voiceArchetype: 'Dazzling Burbank Sitcom Starlet',
    greenRoomDossier: 'Insisted Camera Two add a pink diffusion filter and whispered studio-lot gossip to her press agent sitting conspicuously in Row C.',
    dossierHintStrong: 'Owns Hollywood soundstages, chart-topping tunes, and front-page tabloids.',
    dossierHintWeak: 'Frowns behind her mink stole at chemistry flasks, physics, and probability tables.',
    smirkLines: [
      '“Cut and print, darling—{cash} and catch my good side!” Lana dazzles on {category}!',
      '“Hear those ratings climb? That’s {cash}, baby!” Lana sparkles on {category}!',
    ],
    fumbleLines: [
      '“Line?! Who rewrote my cue card?!” Lana flubs {category} — +{rebound} Rebound waiting!',
      '“Stop rolling—my false lashes blinked!” Lana misses {category} — snag +{rebound} extra!',
    ],
    clutchLine: '“Two scenes left before the credits roll—and Lana Starling ALWAYS owns the close-up!”',
    zonkLine: '“EEK! Get that hideous test pattern out of my key light—it just cost me {cash}!”',
    wheelLine: '“Zoom in tight, boys—watch Hollywood spin pure gold!”',
    scoutStrongCall: 'Lana blew a kiss to Camera Two—silver screen, hit tunes, and gossip headlines are her lot!',
    scoutWeakCall: 'Lana’s starlet smile dipped on {category}—keep her out of her close-up there!',
  },
  VINCE_CASTELLANO: {
    voiceArchetype: 'Smooth Las Vegas Sands Casino Pit Boss',
    greenRoomDossier: 'Shuffled a stack of $500 clay chips single-handed in the hallway and inspected the brass edge of Podium Two like a rigged blackjack shoe.',
    dossierHintStrong: 'Ice-cold shark on gambling probabilities, high finance, and spotting bluffs.',
    dossierHintWeak: 'Careless around medical charts, campfire myths, and fussy gourmet cooking.',
    smirkLines: [
      '“House always collects, kid—mark down {cash}.” Vince locks {category}!',
      '“Counted that shoe ten minutes ago—{cash} to the pit.” Vince takes {category}!',
    ],
    fumbleLines: [
      '“Cold deck—don’t get comfortable.” Vince misses {category} — +{rebound} Rebound open!',
      '“Busted on twenty-two—help yourself, pal.” Vince drops {category} (+{rebound} Rebound!)',
    ],
    clutchLine: '“Final two hands of the evening—this is where Vegas separates tourists from pros.”',
    zonkLine: '“Snake eyes! That buzzing transmitter blackout just raked {cash} off my stack!”',
    wheelLine: '“I’ve watched ten thousand roulette wheels—let’s teach this one manners.”',
    scoutStrongCall: 'Vince flashed his gold pinky ring—card odds, finance, and logic traps are house territory!',
    scoutWeakCall: 'Vince’s sharkskin calm twitched on {category}—you just beat the pit boss’s spread!',
  },
  REX_CALLOWAY: {
    voiceArchetype: 'Swaggering Syndicated Sports Columnist',
    greenRoomDossier: 'Autographed three glossy press photos before soundcheck and double-checked that his buddy in Row C Seat 14 had clean sightlines.',
    dossierHintStrong: 'Master of championship box scores, front-page wire stories, and studio celeb lore.',
    dossierHintWeak: 'Blinks hard when periodic tables, royal dynasties, or brain-twisters come up.',
    smirkLines: [
      '“STOP THE PRESSES—Calloway knocks it into the upper deck for {cash}!” Nails {category}!',
      '“Tomorrow’s back-page banner: {cash}!” Rex cruises on {category}!',
    ],
    fumbleLines: [
      '“Swing and a miss—blame the stadium lights!” Rex whiffs {category} (+{rebound} Rebound!)',
      '“Print a correction—I blew {category}!” Grab that +{rebound} Rebound while he sweats!',
    ],
    clutchLine: '“Bottom of the ninth, bases loaded—Rex Calloway was born for the walk-off!”',
    zonkLine: '“EJECTED?! That bush-league signal jam just wiped {cash} clean off my box score!”',
    wheelLine: '“Watch the press-box golden arm take this Showcase Wheel for a ride!”',
    scoutStrongCall: 'Rex fired finger-guns at Camera Three—sports, wire news, and showbiz are his home beat!',
    scoutWeakCall: 'Rex flushed lobster-red on {category}—keep throwing that curveball right past him!',
  },
  ARTHUR_PENDLETON: {
    voiceArchetype: 'Urbane Oxford Regius History Don',
    greenRoomDossier: 'Politely declined Roz Korman’s halftime envelope before the cameras even warmed, remarking that honest inquiry needed no back-room varnish.',
    dossierHintStrong: 'Monumental command of empires, classic literature, and classical word roots.',
    dossierHintWeak: 'Pleasantly adrift among modern gadgets, pop jukeboxes, and retail sticker prices.',
    smirkLines: [
      '“Splendidly put—{cash} for Magdalen High Table.” Professor Pendleton clears {category}!',
      '“Quite right; we covered that in Michaelmas term—{cash}!” Takes {category}!',
    ],
    fumbleLines: [
      '“Ah—a charming modern blind spot! Do take it.” Pendleton misses {category} (+{rebound}!)',
      '“Touché, my friend—my scholarly lapse is your +{rebound} Rebound!”',
    ],
    clutchLine: '“Two turns remaining—what a delightfully brisk tutorial under incandescent lamps!”',
    zonkLine: '“Good gracious! What an uncivilized transmitter fault—{cash} vanished in a puff of static!”',
    wheelLine: '“Fortuna’s wheel in brushed aluminum—let us see what providence decrees.”',
    scoutStrongCall: 'Pendleton chuckled over his silver cuffs—empires, classics, and etymology are Oxford turf!',
    scoutWeakCall: 'Pendleton smiled wryly at his slip on {category}—rare chink in the High Table armor!',
  },
  NORMA_JEAN_BAKER: {
    voiceArchetype: 'Ice-Cold Jet-Set Chess Prodigy',
    greenRoomDossier: 'Played a silent mental game with a pocket white knight in the Green Room and mapped every board lock topology before stepping on set.',
    dossierHintStrong: 'Razor calculation on probabilities, logical traps, and world capitals.',
    dossierHintWeak: 'Bores easily on gourmet recipes, pop jukeboxes, and clinical medicine.',
    smirkLines: [
      '“Check—and {cash} to the center.” Norma Jean executes {category}!',
      '“Forced mate in three moves—{cash}.” Norma Jean claims {category}!',
    ],
    fumbleLines: [
      '“An unexpected inaccuracy—fascinating.” Norma Jean misses {category} (+{rebound} Rebound!)',
      '“Blunder on the kingside—your move.” She drops {category} — +{rebound} Rebound live!',
    ],
    clutchLine: '“Endgame, two ticks on the clock—you’re already in zugzwang, challenger.”',
    zonkLine: '“Illogical! That chaotic signal blackout just sacrificed {cash} off my board!”',
    wheelLine: '“Stochastic variance—still, the expected value justifies the spin.”',
    scoutStrongCall: 'Norma Jean lowered her white shades—odds, logic traps, and global maps are her grandmaster board!',
    scoutWeakCall: 'Norma Jean miscalculated {category}—exploit that rare tactical blunder immediately!',
  },
  STERLING_VANCE: {
    voiceArchetype: 'Imperious Broad Street Tape-Reader',
    greenRoomDossier: 'Checked closing New York Stock Exchange quotes via studio courier and asked the producer how much the network itself would cost to buy.',
    dossierHintStrong: 'Dominates finance, market probabilities, and breaking national headlines.',
    dossierHintWeak: 'Shows open contempt for folklore myths, matinee movies, and museum brushwork.',
    smirkLines: [
      '“Blue-chip yield—book {cash} to the balance sheet.” Sterling buys {category}!',
      '“Undervalued square, instant {cash} dividend.” Sterling closes {category}!',
    ],
    fumbleLines: [
      '“Minor market correction—nothing more.” Sterling misses {category} (+{rebound} Rebound!)',
      '“Write it off as overhead!” Sterling drops {category} — seize +{rebound} bonus!',
    ],
    clutchLine: '“Two minutes to the closing bell—watch a hostile takeover in Living Color.”',
    zonkLine: '“MARGIN CALL?! Fire the chief engineer—that carrier crash just liquidated {cash}!”',
    wheelLine: '“High-beta speculation—let’s see what dividend this turntable prints.”',
    scoutStrongCall: 'Sterling pocketed his gold watch—Wall Street, market odds, and headlines are his trading floor!',
    scoutWeakCall: 'Sterling’s chalk-stripe composure slipped on {category}—short him right there!',
  },
  SEO_YUN_KANG: {
    voiceArchetype: 'Clinical Geneva Molecular Biochemist',
    greenRoomDossier: 'Reviewed her competitor dossier with a silver ballpoint like a peer-reviewed journal and calculated exact multiplier ceilings on a cocktail napkin.',
    dossierHintStrong: 'Peerless precision in chemistry, medical science, and statistical odds.',
    dossierHintWeak: 'Occasionally blindsided by ancient folklore, silver-screen gossip, and sports.',
    smirkLines: [
      '“Hypothesis confirmed to 99.9%—{cash}.” Seo-Yun dissects {category}!',
      '“Clean synthesis, optimal yield—{cash}.” Seo-Yun secures {category}!',
    ],
    fumbleLines: [
      '“Statistical outlier—recalibrating.” Seo-Yun misses {category} (+{rebound} Rebound!)',
      '“Contaminated variable on {category}!” Seo-Yun fumbles — claim the +{rebound} Rebound!',
    ],
    clutchLine: '“Final two trials remaining—your margin for error just reached absolute zero.”',
    zonkLine: '“Equipment fault! That absurd carrier jam just incinerated {cash} in one oscilloscope spike!”',
    wheelLine: '“Twenty uniform sectors—let us observe the empirical distribution.”',
    scoutStrongCall: 'Seo-Yun clicked her silver pen twice—chemistry, medicine, and hard math are her Geneva lab!',
    scoutWeakCall: 'Seo-Yun’s calm brow creased on {category}—you found a genuine crack in the laboratory glass!',
  },
  CLARA_VON_BERG: {
    voiceArchetype: 'Fiery Vienna State Opera Maestro',
    greenRoomDossier: 'Corrected the studio showband’s brass intonation from the corridor and tapped her conductor’s baton impatiently until the red tally light burned.',
    dossierHintStrong: 'Sublime command of classical arts, royal dynasties, and operatic myth.',
    dossierHintWeak: 'Detests greasy engines, mechanical gadgets, and crass stock ledgers.',
    smirkLines: [
      '“BRAVISSIMA! Fortissimo {cash}!” Clara commands {category}!',
      '“In flawless tempo—{cash} to the podium!” Clara claims {category}!',
    ],
    fumbleLines: [
      '“DISHARMONY! Who wrote this dreadful libretto?!” Clara misses {category} (+{rebound} Rebound!)',
      '“Flat! Utterly barbaric!” Clara drops {category} — steal that +{rebound} Rebound!',
    ],
    clutchLine: '“Crescendo into the final two bars—try to keep tempo with Vienna, amateur!”',
    zonkLine: '“SCHRECKLICH! That wretched static squeal just shattered my finale for {cash}!”',
    wheelLine: '“Allegro vivace! Spin the wheel and let the brass pit roar!”',
    scoutStrongCall: 'Clara swept her wooden baton—high art, royal houses, and mythic scores are her opera stage!',
    scoutWeakCall: 'Clara flared in Viennese fury over {category}—knock her off tempo there every chance you get!',
  },
  VICTOR_LAZAR: {
    voiceArchetype: 'Enigmatic 11-Week Undefeated Studio 6A Sphinx',
    greenRoomDossier: 'Arrived in a tailored midnight Nehru jacket three minutes before air, spoke to nobody, and gazed calmly at the 36th-Floor Penthouse trophy case.',
    dossierHintStrong: 'Terrifying clarity across theoretical physics, paradoxes, and precision lexicon.',
    dossierHintWeak: 'Even the Sphinx occasionally drifts on kitchen recipes, hit records, and tabloid press.',
    smirkLines: [
      '“Inevitability has a pleasant chime—{cash}.” Victor Lazar claims {category}.',
      '“Eleven Fridays, identical outcome—{cash}.” The Sphinx silences {category}.',
    ],
    fumbleLines: [
      '“Fascinating… a genuine surprise on {category}.” Victor misses — +{rebound} Rebound LIVE!',
      '“Even marble reveals a hairline fissure!” Victor Lazar fumbles {category} — +{rebound} Rebound!',
    ],
    clutchLine: '“Turn 9. The spotlights warm up, fifty million hold their breath, and I close the broadcast.”',
    zonkLine: '“Hmph—for the first time in eleven weeks, it took a transmitter blackout to dent me for {cash}!”',
    wheelLine: '“Chance bends to composure. Let the twenty wedges speak.”',
    scoutStrongCall: 'Victor’s half-smile barely stirred—physics, paradoxes, and lexicon are the Sphinx’s fortress!',
    scoutWeakCall: 'History on live TV! You exposed a rare chink in Victor Lazar on {category}!',
  },
};

/** 24 Bespoke, character-driven 1966 Curtain-Raiser hooks (<= 118ch, zero generic filler!). */
export const CHAMPION_CURTAIN_RAISER_LINES_V7: Record<RivalIdV7, string> = {
  CARMEN_DELGADO:
    'Fresh off Bellevue midnight triage in my crisp white coat—ten clean turns on the Tote, challenger, no tricks!',
  TOBY_OKAFOR:
    'Con Ed trained me to hear loose wiring a block away—I play square, I block tight, and nothing gets past Podium Two!',
  INEZ_CALLAHAN:
    'Forty years at the Fifth Avenue Reference Desk taught me to read twice—chain two wins to crack that $500 Vault!',
  DOTTY_VANCE:
    'Brought my Topeka blue-ribbon apron and two pecan chiffons—let’s see what hides behind tonight’s Mystery Curtain!',
  CHET_KOWALSKI:
    'Three 300-games in Milwaukee taught me to aim for the fattest top-row cash—steal my lane and watch my collar steam!',
  PEGGY_SUE_CONNORS:
    'Just touched down on the Pan Am Clipper from Rome—tray tables locked when that Big Wheel or Curtain lights up!',
  BUZZ_HALVORSEN:
    'T-minus ten turns to liftoff—slide rule calibrated, Gemini checklist green, zero margin for sloppy arithmetic.',
  GIGI_ST_CLAIR:
    'Fabulous studio lighting, luv—spin that Big Wheel and watch Carnaby Street sweep this broadcast in Living Color!',
  WALTER_PRINGLE:
    'Treat this Tote Board like a Hartford Sunday crossword, my friend—block the crossings and watch your rival stall.',
  BETTY_LOU_HARPER:
    'Teased this Nashville beehive three inches higher just for the color cameras—wait till you hear my Turn-9 encore!',
  MILES_ELLINGTON:
    'Dig the swing on that Hammond organ, cat—I’ll play the cool blocks and let you rush the downbeat.',
  SYLVIE_BEAUMONT:
    'Mon Dieu, I do not nibble at $150 appetizers—bring me the $500 plaques before my soufflé loses patience!',
  MARGO_STERLING:
    'In my Madison Avenue boardroom nobody talks until the numbers close—I’ll kill your streak before commercial one.',
  HANK_MCCOY:
    'Yee-haw! Back in Houston we don’t drill shallow holes—point me straight at the $500 vaults and stand back!',
  ALASTAIR_KERR:
    'Nine weeks undefeated in Savile Row wool—my table at “21” is at nine sharp, so let’s keep this brief.',
  LANA_STARLING:
    'Make sure Camera Two gets my left profile, sweetie—I’m spinning the Big Wheel and stealing the whole broadcast!',
  VINCE_CASTELLANO:
    'At the Sands we love players who celebrate at Turn 5—because the pit boss always collects between Turns 8 and 10.',
  REX_CALLOWAY:
    'Give Camera Three your good side, pal—my syndicate editor already printed tomorrow’s banner: Calloway Cruises!',
  ARTHUR_PENDLETON:
    'How refreshingly civilized—an honest contest of scholarship under incandescent lamps. Shall we begin?',
  NORMA_JEAN_BAKER:
    'I mapped the next six moves during the theme song—behind these mod shades, your opening pick is already forced.',
  STERLING_VANCE:
    'Every plaque on this rack is an undervalued asset—watch Broad Street execute a hostile takeover of the top row.',
  SEO_YUN_KANG:
    'I ran your expected score during soundcheck—anything short of a hot streak belongs straight to my Geneva ledger.',
  CLARA_VON_BERG:
    'Tonight’s broadcast moves at Vienna’s tempo—slip off-beat on one square and I shall cut your lead in half!',
  VICTOR_LAZAR:
    'Eleven Fridays undefeated. Eleven challengers certain they found a crack in the marble. Let us test your theory.',
};

/** Returns a character-driven Curtain-Raiser hook for any Champion (zero generic Ep-1 bleed!). */
export function getChampionCurtainRaiserLineV7(rivalId: RivalIdV7): string {
  return (
    CHAMPION_CURTAIN_RAISER_LINES_V7[rivalId] ??
    CHAMPION_CURTAIN_RAISER_LINES_V7.CARMEN_DELGADO
  );
}

/** Vivid 1966 TV Guide "Close-Up" 1-line profiles (subtle hints—zero raw category spoilers!). */
export const CAST_TV_GUIDE_BIOS_V7: Record<CastIdV7, string> = {
  DOTTY_VANCE:
    'TV GUIDE CLOSE-UP: Topeka’s four-time bake-off sweetheart rules recipe tins, A&P bargains, and prairie yarns, though high-tech lab chatter makes her giggle.',
  CARMEN_DELGADO:
    'TV GUIDE CLOSE-UP: Straight off Bellevue midnight triage in her crisp white coat and burgundy blouse, Delgado’s calm clinical brilliance hides zero love for Wall Street tape or royal genealogy.',
  CHET_KOWALSKI:
    'TV GUIDE CLOSE-UP: Milwaukee’s 300-game alley legend lives for box scores, Wurlitzer 45s, and V8 motors—just don’t hand him an art-museum brochure.',
  PEGGY_SUE_CONNORS:
    'TV GUIDE CLOSE-UP: Pan Am’s globe-trotting clipper hostess trades jet-set postcards, starlet scoops, and duty-free deals while cheerfully skipping chemistry lab.',
  TOBY_OKAFOR:
    'TV GUIDE CLOSE-UP: The Con Ed lineman who keeps Midtown lit hears loose wiring from the hallway, though Victorian verse and French sauces leave him shrugging.',
  INEZ_CALLAHAN:
    'TV GUIDE CLOSE-UP: Forty years running the Fifth Avenue Reference Room made Callahan razor-sharp on ink and legend—keep her far from locker rooms and carburetors.',
  BUZZ_HALVORSEN:
    'TV GUIDE CLOSE-UP: Cape Canaveral’s crew-cut flight engineer orbits effortlessly around thrust equations and launch odds, yet couldn’t name a Top-40 crooner to save his tie.',
  GIGI_ST_CLAIR:
    'TV GUIDE CLOSE-UP: Carnaby Street’s op-art whirlwind buys gallery prints and London vinyl at dawn while treating royal genealogy like last season’s hemline.',
  WALTER_PRINGLE:
    'TV GUIDE CLOSE-UP: Hartford’s tweed-clad Sunday crossword terror turns wordplay and brain-benders into sport while misplacing his own grocery receipts.',
  BETTY_LOU_HARPER:
    'TV GUIDE CLOSE-UP: Nashville’s beehive-crowned studio vocalist shines brightest on vinyl hooks, mountain yarns, and silver-screen magic when the final turns heat up.',
  MILES_ELLINGTON:
    'TV GUIDE CLOSE-UP: Straight from a smoky Village Vanguard corner booth, Ellington reads front-page jazz history like poetry and ignores price tags altogether.',
  SYLVIE_BEAUMONT:
    'TV GUIDE CLOSE-UP: Montreal’s pillbox-hatted dining critic pairs royal banquets with world wine maps and sniffs loudly at anything involving wrenches or box scores.',
  MARGO_STERLING:
    'TV GUIDE CLOSE-UP: Madison Avenue’s emerald-suited ad dynamo speaks fluent balance sheet and morning press while dismissing folklore as unpaid copy.',
  HANK_MCCOY:
    'TV GUIDE CLOSE-UP: Houston’s Stetson-wearing oilman chases gusher payouts, diesel rigs, and global oilfields—and leaves the poetry books to the Ivy League.',
  ALASTAIR_KERR:
    'TV GUIDE CLOSE-UP: Nine weeks undefeated in custom Savile Row tailoring, Kerr quotes museum catalogs and royal lineages while blanking on pop records and checkout prices.',
  LANA_STARLING:
    'TV GUIDE CLOSE-UP: Burbank’s platinum-flip sitcom darling knows every studio premiere and chart hit, though test tubes and probability tables dull her sparkle.',
  VINCE_CASTELLANO:
    'TV GUIDE CLOSE-UP: The Sands’ sharkskin-suited pit boss spots crooked angles and long-shot payouts in a heartbeat—just steer clear of fancy French kitchens.',
  REX_CALLOWAY:
    'TV GUIDE CLOSE-UP: America’s flashiest press-box columnist glides through pennant races, front-page scandals, and studio backlots until a chemistry flask melts his grin.',
  ARTHUR_PENDLETON:
    'TV GUIDE CLOSE-UP: Oxford’s crushed-velvet don commands classical empires and dusty libraries with effortless charm while regarding modern gadgets as noisy toys.',
  NORMA_JEAN_BAKER:
    'TV GUIDE CLOSE-UP: Behind oversized white mod shades, this jet-set chess prodigy maps capitals, paradoxes, and endgame math six moves before her rival blinks.',
  STERLING_VANCE:
    'TV GUIDE CLOSE-UP: Broad Street’s chalk-striped tape-reader calculates market odds and breaking headlines to the penny, though Broadway openings bore him to tears.',
  SEO_YUN_KANG:
    'TV GUIDE CLOSE-UP: Recruited from Geneva’s top biochemistry institute, Kang pairs molecular rigor with ruthless odds—drag her into movie trivia or campfire myths.',
  CLARA_VON_BERG:
    'TV GUIDE CLOSE-UP: Vienna’s fierce podium maestro commands grand opera houses, royal patrons, and mythic scores while refusing to touch a single carburetor.',
  VICTOR_LAZAR:
    'TV GUIDE CLOSE-UP: Eleven undefeated Fridays turned Studio 6A’s Nehru-jacketed Sphinx into a prime-time legend—even he occasionally fumbles a jukebox tune or recipe.',
  GRANT_BELLAMY:
    'TV GUIDE CLOSE-UP: Television’s smoothest emcee charms fifty million homes at eight o’clock while guarding the 36th-Floor Penthouse keys.',
  ROZ_KORMAN:
    'TV GUIDE CLOSE-UP: Madison Avenue’s sharpest fixer protects sponsor ratings with canary-yellow halftime tips—always check her ink for traps.',
  VERA_KARP:
    'TV GUIDE CLOSE-UP: Standards & Practices’ sleepless investigator pays clean certified bounties to challengers who expose booth rigging on camera.',
};

/** Helper returning smooth onboarding Rival accuracy (S01E01 ~42% breezy -> S04 85% Masterminds). */
export function getEpisodeRivalAccuracyV7(
  rivalId: RivalIdV7,
  episodeNumber: number,
): number {
  const base = CAST_PROFILES_V7[rivalId]?.baseAccuracy ?? 0.56;
  if (episodeNumber <= 1) return Math.min(base, 0.42);
  if (episodeNumber === 2) return Math.min(base, 0.44);
  if (episodeNumber === 3) return Math.min(base, 0.46);
  if (episodeNumber <= 6) return Math.min(base, 0.48);
  return base;
}

/** Verifies all 24 Champions x 3 weak categories cover 20/20 categories cleanly with zero strong/weak overlap. */
export function verifyCastCategoryCoverageV7(): {
  readonly rivalCount: number;
  readonly rivalWeakCount: number;
  readonly rivalDistinctWeakCount: number;
  readonly rivalDistinctStrongCount: number;
  readonly totalCoveredCount: number;
  readonly uncovered: readonly CategoryIdV7[];
  readonly valid: boolean;
} {
  const rivalWeakSet = new Set<CategoryIdV7>();
  const rivalStrongSet = new Set<CategoryIdV7>();
  let rivalWeakCount = 0;
  let hasOverlap = false;

  for (const rivalId of RIVAL_IDS_V7) {
    const profile = CAST_PROFILES_V7[rivalId];
    const strongCheck = new Set(profile.strongCategories);
    for (const cat of profile.weakCategories) {
      rivalWeakCount += 1;
      rivalWeakSet.add(cat);
      if (strongCheck.has(cat)) hasOverlap = true;
    }
    for (const cat of profile.strongCategories) {
      rivalStrongSet.add(cat);
    }
  }
  const unionSet = new Set<CategoryIdV7>(rivalWeakSet);
  for (const cat of CAST_PROFILES_V7.GRANT_BELLAMY.weakCategories) {
    unionSet.add(cat);
  }
  const uncovered = ALL_CATEGORIES_V7.filter((c) => !unionSet.has(c));
  return {
    rivalCount: RIVAL_IDS_V7.length,
    rivalWeakCount,
    rivalDistinctWeakCount: rivalWeakSet.size,
    rivalDistinctStrongCount: rivalStrongSet.size,
    totalCoveredCount: unionSet.size,
    uncovered,
    valid:
      RIVAL_IDS_V7.length === 24 &&
      rivalWeakCount === 72 &&
      rivalWeakSet.size === 20 &&
      rivalStrongSet.size === 20 &&
      unionSet.size === 20 &&
      uncovered.length === 0 &&
      !hasOverlap,
  };
}

/** Lightweight 1966 Living Color studio monogram fallback shown briefly while painted JPG loads. */
export function buildCastMonogramSvgDataUriV7(
  castId: CastIdV7,
  emotion: PortraitEmotionV7 = 'POISED',
): string {
  const profile = CAST_PROFILES_V7[castId] ?? CAST_PROFILES_V7.CARMEN_DELGADO;
  const parts = profile.name.split(' ');
  const initials = parts
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const emotionRingHex =
    emotion === 'TELL'
      ? '#F4A91F'
      : emotion === 'RATTLED'
        ? '#FF6738'
        : emotion === 'BREAKDOWN'
          ? '#E63B7A'
          : '#0096A6';

  const shapeMarkup =
    profile.silhouetteShape === 'TRIANGLE'
      ? `<polygon points="48,14 82,76 14,76" fill="${profile.accentHex}" fill-opacity="0.34" stroke="${emotionRingHex}" stroke-width="2.6"/>`
      : profile.silhouetteShape === 'CIRCLE'
        ? `<circle cx="48" cy="48" r="32" fill="${profile.accentHex}" fill-opacity="0.34" stroke="${emotionRingHex}" stroke-width="2.6"/>`
        : `<rect x="16" y="16" width="64" height="64" rx="12" fill="${profile.accentHex}" fill-opacity="0.34" stroke="${emotionRingHex}" stroke-width="2.6"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96"><rect width="96" height="96" rx="48" fill="#0B1D30"/><circle cx="48" cy="48" r="44" fill="none" stroke="${emotionRingHex}" stroke-width="3"/>${shapeMarkup}<text x="48" y="57" text-anchor="middle" font-family="Jost,sans-serif" font-weight="800" font-size="28" fill="#F7EEDB" letter-spacing="1">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// ----------------------------------------------------------------------------
// 3. 28 Plain-English Studio Relics (16 Clean + 12 Backstage) & 4 Foil Finishes
// ----------------------------------------------------------------------------

export const LIVE_SCORE_BURN_SHOP_COST_V7 = 450;
export const MAX_TRUNK_SLOTS_V7 = 5;
export const MAX_MULT_DRIVER_SLOTS_V7 = 2;

export interface FoilBonusSpecV7 {
  readonly foil: FoilFinishV7;
  readonly label: string;
  readonly badgeHex: string;
  readonly summary: string;
}

export const FOIL_SPECS_V7: Record<FoilFinishV7, FoilBonusSpecV7> = {
  GILDED: {
    foil: 'GILDED',
    label: '24K Marquee Gold',
    badgeHex: '#F4A91F',
    summary: 'Warm tungsten-gold plate: +$18 bonus square dollars on every right answer.',
  },
  SILVER_HALIDE: {
    foil: 'SILVER_HALIDE',
    label: 'Royal Cobalt Chrome',
    badgeHex: '#1E56C5',
    summary: 'Quick-draw chrome finish: +0.08× multiplier whenever you lock in within 7 seconds.',
  },
  DICHROIC: {
    foil: 'DICHROIC',
    label: 'Peacock Teal Prism',
    badgeHex: '#0096A6',
    summary: 'Living-Color optical coat: +0.07× multiplier on ★ Weak-Spot or Channel 83 Halo squares.',
  },
  TAX_STAMPED: {
    foil: 'TAX_STAMPED',
    label: 'Certified Network Seal',
    badgeHex: '#FF6738',
    summary: 'Standards & Practices stamp: +$25 certified cash bonus on every winning turn.',
  },
};

export const RELIC_CATALOG_V7: readonly RelicSpecV7[] = [
  // ======================== 16 CLEAN NETWORK PROPS ==========================
  {
    relicId: 'relic_vera_audit_ledger',
    name: 'Vera’s Clean-Air Ledger',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 450,
    description:
      'Clothbound Standards ledger stamped in Federal blue: +0.35× multiplier whenever Backstage Cash is $0 (+0.50× in Clean-Air Season)!',
    triggerSummary:
      '+0.35× multiplier when Backstage Cash is $0 (+0.50× in Clean-Air Season)—certified clean-air bonus!',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_inez_root_scalpel',
    name: 'Inez’s Red Editor Pencil',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 420,
    description:
      'Fifth Avenue Reference Room blue-and-red editor’s pencil: crosses out 1 wrong choice on Turns 1–4 and adds +$65 on Arts & History!',
    triggerSummary:
      'Crosses out 1 wrong choice on Turns 1–4 and adds +$65 on Arts, Books & History—sharp early-show poise!',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_carmen_tourniquet',
    name: 'Carmen’s Bellevue Triage Pen',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 400,
    description:
      'Bellevue night-shift cobalt ballpoint: +$70 on Science & Medicine or while trailing, and keeps streaks alive on 50%+ close calls!',
    triggerSummary:
      '+$70 on Science & Medicine clues or while trailing, plus keeps your streak alive on 50%+ close dials!',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_solari_overdrive',
    name: 'Split-Flap Overdrive Gear',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 520,
    description:
      'Machined brass governor from Studio 6A’s Solari tote rack: +0.40× multiplier on a 2+ answer streak, surging to +0.55× at 4+!',
    triggerSummary:
      '+0.40× multiplier on a 2+ streak, jumping to +0.55× at 4+ straight—keeps the Solari tote spinning!',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_amber_chalk_holder',
    name: 'Green-Room Truce Chalk',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 450,
    description:
      'Brass backstage chalk clutch shared by honest challengers: +0.35× multiplier and +$45 Clean Purse bonus on every Studio Truce square!',
    triggerSummary:
      '+0.35× multiplier plus +$45 Clean Purse bonus on Studio Truce squares—a gentleman’s backstage handshake!',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_weston_peak_limiter',
    name: 'Quick-Draw Buzzer Spring',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 380,
    description:
      'Hair-trigger phosphor-bronze podium spring tuned by Studio 6A grips: banks +$75 speed bonus whenever you answer within 6 seconds!',
    triggerSummary:
      '+$75 quick-draw bonus whenever you lock in a right answer within 6 seconds—beat the studio clock!',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_brass_vernier_caliper',
    name: 'Price-Check Slide Rule',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 410,
    description:
      'Ivory-and-brass shopping-show pocket rule: +$85 on Numbers, Pricing & Atlas clues plus +15% forgiveness on dial and globe rounds!',
    triggerSummary:
      '+$85 on Numbers, Pricing & Atlas clues plus +15% margin on Estimation Dial, Scale & 3D Globe rounds!',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_chronometer_escapement',
    name: 'Prime-Time Gold Sweep Watch',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 490,
    description:
      'Engraved 18K sponsor presentation wristwatch: triggers a +0.45× multiplier across the decisive closing stretch (Turns 7–10)!',
    triggerSummary:
      '+0.45× multiplier across Turns 7–10—timed for dramatic Double-Dollars & Final Wager finishes!',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_patent_cyanotype_tube',
    name: 'World’s Fair Blueprint Tube',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 390,
    description:
      'Souvenir cyanotype tube from the ’64 Flushing Meadows Pavilion: +$80 on Science & Tech plus target highlights on Blueprint Monitors!',
    triggerSummary:
      '+$80 on Science, Space & Tech clues and lights up target guidance on Blueprint & Visual Monitors!',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_studio_b_on_air_prism',
    name: '“APPLAUSE” Sign Ruby Lens',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 500,
    description:
      'Cut-glass ruby lens from Studio 6A’s overhead APPLAUSE lightbox: fires +0.40× multiplier whenever you attack a Champion ★ Weak Spot!',
    triggerSummary:
      '+0.40× multiplier on Champion ★ Weak-Spot squares—turns backstage scouting notes into studio gold!',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_goodson_cue_bell',
    name: 'Stage Manager’s Cue Bell',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 360,
    description:
      'Solid-brass five-seconds-to-air desk bell: rings in an automatic +$95 burst on opening & post-commercial Turns 1, 2, 5, and 6!',
    triggerSummary:
      '+$95 cash burst on opening & post-commercial Turns 1, 2, 5, and 6—handy pocket cash for Instant Bargains!',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_subpoena_wax_signet',
    name: 'Broadcast Inspector’s Badge',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 440,
    description:
      'Federal quiz-oversight brass signet: doubles CATCH CHEAT bounties to $300, adds +$60 per busted cheat, and boosts Burn tips to $275!',
    triggerSummary:
      'Doubles live CATCH CHEAT bounties to $300, adds +$60 per bust, and upgrades Burn-on-Air tips to +$275!',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_ribbon_mic_windscreen',
    name: 'RCA 44-BX Velvet Mic Cover',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 370,
    description:
      'Burgundy silk pop-filter slipped off Bellamy’s ribbon mic: +$70 on Movies, Music & Arts and halves Double-or-Nothing miss penalties!',
    triggerSummary:
      '+$70 on Silver Screen, Hit Parade & Arts clues, plus cuts Double-or-Nothing miss stings in half!',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_world_fair_astrolabe',
    name: 'Unisphere Souvenir Globe',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 430,
    description:
      'Polished stainless-steel Queens pavilion keepsake: pays +$30 per distinct subject color conquered this episode (up to +$120/turn)!',
    triggerSummary:
      '+$30 per different subject color won this broadcast (up to +$120 every turn)—rewards broad scholarship!',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_bakelite_tally_counter',
    name: '30 Rock Usher’s Clicker',
    ledgerKind: 'CLEAN',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 350,
    description:
      'Chrome-bezel mezzanine attendance counter: adds +$25 for every right answer banked so far this broadcast (up to +$125 per turn)!',
    triggerSummary:
      'Adds +$25 for every right answer banked this show (up to +$125 per turn)—grows richer each round!',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_sovereign_plumb_bob',
    name: 'Top-Row Jackpot Weight',
    ledgerKind: 'CLEAN',
    slotKind: 'MULT_DRIVER',
    costCash: 540,
    description:
      'Turned-brass catwalk counterweight from the 36th-Floor Penthouse: unlocks +0.45× multiplier on tough top-row prime-time stumpers!',
    triggerSummary:
      '+0.45× multiplier on tough top-row stumpers—tailored for high-stakes championship broadcasts!',
    defaultFoil: 'TAX_STAMPED',
  },

  // ====================== 12 BACKSTAGE HUSTLE PROPS =========================
  {
    relicId: 'relic_toby_copper_shunt',
    name: 'Toby’s Grounding Clip',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 450,
    description:
      'Heavy-gauge Con Ed copper alligator clip: siphons +$110 off rigged booth squares and auto-exposes podium-buzz LIVE TELL cheats!',
    triggerSummary:
      '+$110 on rigged booth squares and automatically flags podium-buzz cheats for easy CATCH CHEAT hits!',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_uv_blacklight_loupe',
    name: 'Spymaster’s UV Pocket Lamp',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 450,
    description:
      '47th Street pawnshop ultraviolet penlight: auto-reveals poisoned Roz Korman decoys inside halftime envelopes and adds +$75 on tip turns!',
    triggerSummary:
      'Auto-exposes poisoned traps inside halftime envelopes without guessing, plus +$75 on tip turns!',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_channel_83_crystal',
    name: 'Pirate UHF Tuner Crystal',
    ledgerKind: 'CONTRABAND',
    slotKind: 'MULT_DRIVER',
    costCash: 480,
    description:
      'Quartz oscillator smuggled off Channel 83’s radio ship: +0.20× every turn, surging to +0.50× on Halo squares or Pirate UHF Season!',
    triggerSummary:
      '+0.20× multiplier every turn, jumping to +0.50× on Channel 83 Halo squares or during Pirate UHF Season!',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_roz_velvet_cufflink',
    name: 'Sponsor’s Gold Cufflink',
    ledgerKind: 'CONTRABAND',
    slotKind: 'MULT_DRIVER',
    costCash: 520,
    description:
      'Monogrammed Madison Avenue cufflink slipped under your dressing-room door: +0.45× multiplier & +$35 Backstage Cash after pocketing a tip!',
    triggerSummary:
      '+0.45× multiplier (+0.20× in Sponsor Season) and +$35 Backstage Cash per win after pocketing a tip!',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_monte_carlo_loaded_shoe',
    name: 'Monte Carlo Dealing Shoe',
    ledgerKind: 'CONTRABAND',
    slotKind: 'MULT_DRIVER',
    costCash: 530,
    description:
      'Rosewood Riviera baccarat shoe: fires +0.45× multiplier every time you cash a bold bonus wager, early shutter lock, or bonus showcase!',
    triggerSummary:
      '+0.45× multiplier on bold Showcase wagers, early-shutter locks & bonus rounds—classic Riviera nerve!',
    defaultFoil: 'GILDED',
  },
  {
    relicId: 'relic_row_c_opera_monocle',
    name: 'Row-C Pearl Opera Glasses',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 420,
    description:
      'Mother-of-pearl mezzanine binoculars: banks +$90 when you poach the Champion’s targeted square and auto-spots Row-C mirror flashes!',
    triggerSummary:
      '+$90 when you snatch the Champion’s targeted square and auto-spots Row-C cheats for CATCH CHEAT!',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_larson_pattern_rom',
    name: 'Tote-Board Master Punch Card',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 460,
    description:
      'Smuggled IBM 360 keypunch deck mapping top-row payouts: adds a flat +$95 bonus every time you conquer a $300–$500 upper plaque!',
    triggerSummary:
      '+$95 bonus on every $300–$500 upper-row square—turns top plaques and Gold Vaults into windfalls!',
    defaultFoil: 'DICHROIC',
  },
  {
    relicId: 'relic_fresnel_barn_filter',
    name: 'Stagehand’s Amber Lamp Gel',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 410,
    description:
      'Heat-resistant Fresnel lighting gel gifted by a friendly catwalk grip: +$85 against crooked Heel Champs and flags Spotlight #4 blinks!',
    triggerSummary:
      '+$85 on every hit against Heel Champions and auto-spots Spotlight #4 cheats for CATCH CHEAT!',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_atlantic_tilt_plumb',
    name: 'Steel Pier Pinball Tilt Wedge',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 390,
    description:
      'Weighted brass arcade plumb-bob from Atlantic City’s boardwalk: pays +$115 every time you expose the fake on a Spot-the-Myth card!',
    triggerSummary:
      '+$115 bonus whenever you expose the fake on a Spot-the-Myth card—sharp reward for skeptical ears!',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_vaudeville_sleeve_ace',
    name: 'Burbank Joke-Wall Sleeve Ace',
    ledgerKind: 'CONTRABAND',
    slotKind: 'MULT_DRIVER',
    costCash: 500,
    description:
      'Spring-loaded magician’s cuff liberated from Burbank’s Pop-Art set: kicks in a +0.50× multiplier whenever you trail by $200 or more!',
    triggerSummary:
      '+0.50× comeback multiplier whenever you trail the Champion by $200 or more—made for ninth-inning rallies!',
    defaultFoil: 'TAX_STAMPED',
  },
  {
    relicId: 'relic_isolation_wiretap_coil',
    name: '1964 Isolation-Booth Stethoscope',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 440,
    description:
      'Rubber-rimmed listening cup pressed to borosilicate glass: +$80 on History & World clues plus live preview of the Champion’s finish pace!',
    triggerSummary:
      '+$80 on History, Empires & World clues and reveals the Champion’s exact projected final score!',
    defaultFoil: 'SILVER_HALIDE',
  },
  {
    relicId: 'relic_dirty_marker_ledger',
    name: 'Pink-Carbon Side-Bet Book',
    ledgerKind: 'CONTRABAND',
    slotKind: 'CHIPS_OR_UTILITY',
    costCash: 450,
    description:
      'Backstage bookie’s tri-fold slip pad: pays +$25 per $500 stashed in Backstage Cash & Comeback Pot on every win (up to +$125)!',
    triggerSummary:
      '+$25 per $500 saved in Backstage Cash & Comeback Pot (up to +$125 per turn)—pays off hefty reserves!',
    defaultFoil: 'TAX_STAMPED',
  },
];

export const RELIC_BY_ID_V7: Readonly<Record<string, RelicSpecV7>> = Object.fromEntries(
  RELIC_CATALOG_V7.map((r) => [r.relicId, r]),
);

export function getRelicSpecV7(relicId: string): RelicSpecV7 | undefined {
  return RELIC_BY_ID_V7[relicId];
}

// ----------------------------------------------------------------------------
// 4. 5-Slot Studio Prop Trunk Validation (<= 2 MULT_DRIVER Law)
// ----------------------------------------------------------------------------

export interface TrunkValidationResultV7 {
  readonly ok: boolean;
  readonly reason?: string;
  readonly totalSlots: number;
  readonly multDriverCount: number;
}

export function validateTrunkLoadoutV7(
  loadout: readonly OwnedRelicV7[],
): TrunkValidationResultV7 {
  if (loadout.length > MAX_TRUNK_SLOTS_V7) {
    return {
      ok: false,
      reason: `Your Studio Prop Trunk holds up to ${MAX_TRUNK_SLOTS_V7} props.`,
      totalSlots: loadout.length,
      multDriverCount: 0,
    };
  }
  const seen = new Set<string>();
  let multDriverCount = 0;
  for (const item of loadout) {
    if (seen.has(item.relicId)) {
      return {
        ok: false,
        reason: 'Each studio prop can only be packed once.',
        totalSlots: loadout.length,
        multDriverCount,
      };
    }
    seen.add(item.relicId);
    const spec = RELIC_BY_ID_V7[item.relicId];
    if (!spec) {
      return {
        ok: false,
        reason: `Unknown studio prop ID: ${item.relicId}.`,
        totalSlots: loadout.length,
        multDriverCount,
      };
    }
    if (spec.slotKind === 'MULT_DRIVER') {
      multDriverCount += 1;
    }
  }
  if (multDriverCount > MAX_MULT_DRIVER_SLOTS_V7) {
    return {
      ok: false,
      reason: `You can pack up to ${MAX_MULT_DRIVER_SLOTS_V7} Multiplier Props at once—swap a Multiplier slot or pick a Dollars Prop.`,
      totalSlots: loadout.length,
      multDriverCount,
    };
  }
  return {
    ok: true,
    totalSlots: loadout.length,
    multDriverCount,
  };
}

// ----------------------------------------------------------------------------
// 5. Pre-Turn Live Waiver & Relic Toy Helper Hooks
// ----------------------------------------------------------------------------

export interface PreTurnRelicAssistV7 {
  readonly autoPruneChoiceIdx: number | null;
  readonly revealFreeShutter: boolean;
  readonly highlightCyanotypeChamfer: boolean;
  readonly showExactRivalEv: boolean;
  readonly exposesPoisonedCanaryInk: boolean;
  readonly spotsCheatChannels: readonly CastProfileV7['cheatChannel'][];
}

export function evaluatePreTurnRelicHooksV7(
  clue: Pick<ClueRecordV7, 'waiverPruneIdx' | 'domain'>,
  turnNumber: number,
  waiver: ContestantWaiverV7 | null,
  equippedRelics: readonly OwnedRelicV7[],
): PreTurnRelicAssistV7 {
  const ids = new Set(equippedRelics.slice(0, MAX_TRUNK_SLOTS_V7).map((r) => r.relicId));
  const autoPrune =
    (waiver?.dayJob === 'NIGHT_FACT_CHECKER' && turnNumber <= 2) ||
    (ids.has('relic_inez_root_scalpel') && turnNumber <= 4);

  const spots: CastProfileV7['cheatChannel'][] = [];
  if (ids.has('relic_toby_copper_shunt')) spots.push('SOLENOID_SPARK');
  if (ids.has('relic_row_c_opera_monocle')) spots.push('ROW_C_GLINT');
  if (ids.has('relic_fresnel_barn_filter')) spots.push('FRESNEL_LAMP');

  return {
    autoPruneChoiceIdx: autoPrune ? clue.waiverPruneIdx : null,
    revealFreeShutter: waiver?.dayJob === 'MONOLOGUE_WRITER',
    highlightCyanotypeChamfer:
      waiver?.dayJob === 'PATENT_CLERK' || ids.has('relic_patent_cyanotype_tube'),
    showExactRivalEv: waiver?.dayJob === 'VEGAS_ACTUARY' || ids.has('relic_isolation_wiretap_coil'),
    exposesPoisonedCanaryInk: ids.has('relic_uv_blacklight_loupe'),
    spotsCheatChannels: spots,
  };
}

// ----------------------------------------------------------------------------
// 6. Piece 3 Bounded 10-Turn Economy (`evaluateTurnEconomyV7`) & $450 Shop Burn
// ----------------------------------------------------------------------------

export interface TurnEconomyInputV7 {
  readonly tile: Pick<
    BoardTileNodeV7,
    | 'baseChips'
    | 'boardMultBonus'
    | 'category'
    | 'domain'
    | 'hasAmberTruce'
    | 'hasUhfHalo'
    | 'isRiggedSolenoid'
    | 'isRivalTarget'
    | 'isWheelhouse'
  >;
  readonly clue: Pick<ClueRecordV7, 'category' | 'domain' | 'difficulty' | 'isKlaxonMyth'>;
  readonly resolution: ToyResolutionV7;
  readonly turnNumber: number; // 1 .. 10
  readonly answerTimeSec: number;
  readonly currentStreak: number;
  readonly playerMatchScore: number;
  readonly rivalMatchScore: number;
  readonly rivalExpectedMatchScore: number;
  readonly rivalRole: CastProfileV7['role'];
  readonly waiver: ContestantWaiverV7 | null;
  readonly equippedRelics: readonly OwnedRelicV7[];
  readonly activeCoupRegime?: CoupRegimeIdV7;
  readonly contrabandTrunkCash?: number;
  readonly grudgeBountyPool?: number;
  readonly claimedDomainsThisMatch?: readonly DomainIdV7[];
  readonly correctCountBeforeTurn?: number;
  readonly pocketedCanaryThisMatch?: boolean;
  readonly activeCanaryTurn?: boolean;
  readonly boothArrestsThisMatch?: number;
  readonly juryBoonChips?: number;
  readonly juryBaneMultPenalty?: number;
  readonly isFinale?: boolean;
  readonly allowFinaleJackpot?: boolean;
}

export interface TurnEconomyBreakdownV7 {
  readonly scored: boolean;
  readonly baseChips: number;
  readonly bonusChips: number;
  readonly foilChips: number;
  readonly totalChips: number;
  readonly baseMult: number;
  readonly boardMult: number;
  readonly waiverMult: number;
  readonly relicMult: number;
  readonly foilMult: number;
  readonly totalMult: number;
  readonly actuaryMultiplier: number;
  readonly rawTurnCash: number;
  readonly turnCashCap: number;
  readonly wasCapped: boolean;
  readonly turnCash: number; // Exact $1 integer >= 0 added on scoring turns
  readonly penaltyCash: number; // Exact $1 integer deducted on Double-or-Nothing miss
  readonly netCashDelta: number; // turnCash - penaltyCash
  readonly cleanSideDividend: number; // Extra clean purse side bonus (e.g. Green-Room Truce Chalk)
  readonly contrabandSideCut: number; // Extra contraband side cut (e.g. Sponsor's Cufflink)
  readonly nextStreak: number;
  readonly triggeredRelicIds: readonly string[];
  readonly summaryNotes: readonly string[];
}

export function evaluateTurnEconomyV7(input: TurnEconomyInputV7): TurnEconomyBreakdownV7 {
  const validTrunk = input.equippedRelics.slice(0, MAX_TRUNK_SLOTS_V7);
  const relicIds = new Set(validTrunk.map((r) => r.relicId));
  const notes: string[] = [];
  const triggeredRelicIds: string[] = [];

  const rivalExpected = Math.max(1200, Math.floor(input.rivalExpectedMatchScore));
  // Finale jackpot unlocks higher mult ceiling when player has banked >= 2 correct answers (0.0% 1/5 fluke guarantee!)
  const finaleJackpotUnlocked =
    Boolean(input.isFinale) &&
    Boolean(input.allowFinaleJackpot) &&
    (input.correctCountBeforeTurn ?? 0) >= 2;
  const maxTotalMultCap = finaleJackpotUnlocked ? 4.5 : 3.5;
  const turnCashCap = Math.max(4500, rivalExpected * 2);

  let effectiveAccuracy = Math.max(0, Math.min(1, input.resolution.accuracyRatio));
  if (
    effectiveAccuracy > 0 &&
    effectiveAccuracy < 1 &&
    relicIds.has('relic_brass_vernier_caliper')
  ) {
    effectiveAccuracy = Math.min(1, effectiveAccuracy + 0.15);
    triggeredRelicIds.push('relic_brass_vernier_caliper');
  }

  const scored = input.resolution.isCorrect || effectiveAccuracy >= 0.35;

  if (!scored) {
    let penaltyCash = 0;
    if (input.waiver?.stageVice === 'DOUBLE_OR_NOTHING') {
      const baseSting = relicIds.has('relic_ribbon_mic_windscreen') ? 50 : 100;
      if (relicIds.has('relic_ribbon_mic_windscreen')) {
        triggeredRelicIds.push('relic_ribbon_mic_windscreen');
      }
      penaltyCash = Math.min(Math.max(0, Math.floor(input.playerMatchScore)), baseSting);
      if (penaltyCash > 0) {
        notes.push(`Double-or-Nothing miss penalty: -$${penaltyCash}`);
      }
    }
    return {
      scored: false,
      baseChips: 0,
      bonusChips: 0,
      foilChips: 0,
      totalChips: 0,
      baseMult: 1,
      boardMult: 0,
      waiverMult: 0,
      relicMult: 0,
      foilMult: 0,
      totalMult: 1,
      actuaryMultiplier: 1,
      rawTurnCash: 0,
      turnCashCap,
      wasCapped: false,
      turnCash: 0,
      penaltyCash,
      netCashDelta: -penaltyCash,
      cleanSideDividend: 0,
      contrabandSideCut: 0,
      nextStreak: 0,
      triggeredRelicIds,
      summaryNotes: notes,
    };
  }

  const nextStreak =
    input.resolution.isCorrect ||
    (effectiveAccuracy >= 0.5 && relicIds.has('relic_carmen_tourniquet'))
      ? input.currentStreak + 1
      : 0;

  if (
    !input.resolution.isCorrect &&
    effectiveAccuracy >= 0.5 &&
    relicIds.has('relic_carmen_tourniquet')
  ) {
    triggeredRelicIds.push('relic_carmen_tourniquet');
    notes.push('Carmen’s Bellevue Triage Pen saved your streak on a close call');
  }

  const clampedToyMult = Math.max(0.25, Math.min(2.25, input.resolution.chipMultiplier));
  const baseChips = Math.max(
    25,
    Math.round(input.tile.baseChips * effectiveAccuracy * clampedToyMult),
  );

  let bonusChips = 0;
  let foilChips = 0;
  let waiverMult = 0;
  let relicMult = 0;
  let foilMult = 0;
  let cleanSideDividend = 0;
  let contrabandSideCut = 0;
  let taxStampedDividend = 0;

  // Waiver DayJob live bonuses
  if (input.waiver) {
    if (input.waiver.dayJob === 'PATENT_CLERK' && input.clue.domain === 'SCI_TECH') {
      const add = Math.round(input.tile.baseChips * 0.2);
      bonusChips += add;
      notes.push(`Patent Clerk +$${add}`);
    } else if (input.waiver.dayJob === 'MONOLOGUE_WRITER' && input.clue.domain === 'POP_LIT') {
      const add = Math.round(input.tile.baseChips * 0.2);
      bonusChips += add;
      notes.push(`Monologue Writer +$${add}`);
    } else if (input.waiver.dayJob === 'NIGHT_FACT_CHECKER' && input.turnNumber <= 2) {
      bonusChips += 25;
      notes.push('Fact-Checker Bonus +$25');
    }

    // Waiver StageVice live bonuses
    if (input.waiver.stageVice === 'DOUBLE_OR_NOTHING' && nextStreak >= 2) {
      waiverMult += 0.45;
      notes.push('Double or Nothing +0.45×');
    } else if (input.waiver.stageVice === 'KNOW_IT_ALL' && input.answerTimeSec <= 4.5) {
      bonusChips += 60;
      notes.push('Quick Buzzer +$60');
    } else if (
      input.waiver.stageVice === 'SCOREBOARD_GRUDGE' &&
      input.playerMatchScore < input.rivalMatchScore
    ) {
      waiverMult += 0.5;
      notes.push('Comeback Boost +0.50×');
    }
  }

  // Board Mult (capped 2.0x cold / 3.0x streaking total board contribution)
  const rawBoardBonus =
    Math.max(0, input.tile.boardMultBonus) +
    (input.tile.hasAmberTruce ? 0.35 : 0) +
    (input.tile.isWheelhouse ? 0.5 : 0) +
    (input.tile.hasUhfHalo ? 0.2 : 0);
  const maxBoardBonus = nextStreak >= 2 ? 2.0 : 1.0;
  const boardMult = Math.min(maxBoardBonus, rawBoardBonus);
  if (input.tile.isWheelhouse) notes.push('Champion Weak Spot +0.50×');
  if (input.tile.hasAmberTruce) notes.push('Studio Truce Bonus +0.35×');

  // VIP Jury Boon / Bane
  if ((input.juryBoonChips ?? 0) > 0) {
    bonusChips += Math.floor(input.juryBoonChips ?? 0);
    notes.push(`VIP Balcony Cheer +$${Math.floor(input.juryBoonChips ?? 0)}`);
  }

  // Active Relics (strictly <= 2 MULT_DRIVER slots evaluated!)
  let multDriversUsed = 0;
  const contrabandCash = input.contrabandTrunkCash ?? 0;
  const grudgeCash = input.grudgeBountyPool ?? 0;

  for (const owned of validTrunk) {
    const spec = RELIC_BY_ID_V7[owned.relicId];
    if (!spec) continue;

    const canFireMult =
      spec.slotKind !== 'MULT_DRIVER' || multDriversUsed < MAX_MULT_DRIVER_SLOTS_V7;
    if (spec.slotKind === 'MULT_DRIVER' && canFireMult) {
      multDriversUsed += 1;
    }

    let fired = false;

    switch (spec.relicId) {
      case 'relic_vera_audit_ledger':
        if (canFireMult && contrabandCash === 0) {
          relicMult += input.activeCoupRegime === 'REGIME_C_VERA_FORENSIC' ? 0.5 : 0.35;
          fired = true;
        }
        break;
      case 'relic_inez_root_scalpel':
        if (input.clue.domain === 'POP_LIT' || input.clue.domain === 'HIST_FACT') {
          bonusChips += 65;
          fired = true;
        }
        break;
      case 'relic_carmen_tourniquet':
        if (
          input.clue.domain === 'SCI_TECH' ||
          input.playerMatchScore < input.rivalMatchScore
        ) {
          bonusChips += 70;
          fired = true;
        }
        break;
      case 'relic_solari_overdrive':
        if (canFireMult && nextStreak >= 2) {
          relicMult += nextStreak >= 4 ? 0.55 : 0.4;
          fired = true;
        }
        break;
      case 'relic_amber_chalk_holder':
        if (canFireMult && input.tile.hasAmberTruce) {
          relicMult += 0.35;
          cleanSideDividend += 45;
          fired = true;
        }
        break;
      case 'relic_weston_peak_limiter':
        if (input.answerTimeSec <= 6.0) {
          bonusChips += 75;
          fired = true;
        }
        break;
      case 'relic_brass_vernier_caliper':
        if (input.clue.domain === 'NUM_GEO') {
          bonusChips += 85;
          fired = true;
        }
        break;
      case 'relic_chronometer_escapement':
        if (canFireMult && input.turnNumber >= 7) {
          relicMult += 0.45;
          fired = true;
        }
        break;
      case 'relic_patent_cyanotype_tube':
        if (input.clue.domain === 'SCI_TECH') {
          bonusChips += 80;
          fired = true;
        }
        break;
      case 'relic_studio_b_on_air_prism':
        if (canFireMult && input.tile.isWheelhouse) {
          relicMult += 0.4;
          fired = true;
        }
        break;
      case 'relic_goodson_cue_bell':
        if (
          input.turnNumber === 1 ||
          input.turnNumber === 2 ||
          input.turnNumber === 5 ||
          input.turnNumber === 6
        ) {
          bonusChips += 95;
          fired = true;
        }
        break;
      case 'relic_subpoena_wax_signet':
        if ((input.boothArrestsThisMatch ?? 0) > 0) {
          bonusChips += 60 * Math.min(3, input.boothArrestsThisMatch ?? 0);
          fired = true;
        }
        break;
      case 'relic_ribbon_mic_windscreen':
        if (input.clue.domain === 'POP_LIT') {
          bonusChips += 70;
          fired = true;
        }
        break;
      case 'relic_world_fair_astrolabe': {
        const domainSet = new Set<DomainIdV7>(input.claimedDomainsThisMatch ?? []);
        domainSet.add(input.tile.domain);
        bonusChips += Math.min(120, domainSet.size * 30);
        fired = true;
        break;
      }
      case 'relic_bakelite_tally_counter': {
        const count = (input.correctCountBeforeTurn ?? 0) + 1;
        bonusChips += Math.min(125, count * 25);
        fired = true;
        break;
      }
      case 'relic_sovereign_plumb_bob':
        if (canFireMult && input.clue.difficulty >= 4) {
          relicMult += 0.45;
          fired = true;
        }
        break;
      case 'relic_toby_copper_shunt':
        if (input.tile.isRiggedSolenoid) {
          bonusChips += 110;
          fired = true;
        }
        break;
      case 'relic_uv_blacklight_loupe':
        if (input.activeCanaryTurn) {
          bonusChips += 75;
          fired = true;
        }
        break;
      case 'relic_channel_83_crystal':
        if (canFireMult) {
          const boosted =
            input.tile.hasUhfHalo || input.activeCoupRegime === 'REGIME_B_BELLAMY_UHF';
          relicMult += boosted ? 0.5 : 0.2;
          fired = true;
        }
        break;
      case 'relic_roz_velvet_cufflink':
        if (
          canFireMult &&
          (input.pocketedCanaryThisMatch || input.activeCoupRegime === 'REGIME_A_ROZ_PHARMA')
        ) {
          relicMult += input.pocketedCanaryThisMatch ? 0.45 : 0.2;
          contrabandSideCut += 35;
          fired = true;
        }
        break;
      case 'relic_monte_carlo_loaded_shoe':
        if (canFireMult && input.resolution.chipMultiplier > 1.0) {
          relicMult += 0.45;
          fired = true;
        }
        break;
      case 'relic_row_c_opera_monocle':
        if (input.tile.isRivalTarget) {
          bonusChips += 90;
          fired = true;
        }
        break;
      case 'relic_larson_pattern_rom':
        if (input.tile.baseChips >= 300) {
          bonusChips += 95;
          fired = true;
        }
        break;
      case 'relic_fresnel_barn_filter':
        if (input.rivalRole === 'RIVAL_HEEL') {
          bonusChips += 85;
          fired = true;
        }
        break;
      case 'relic_atlantic_tilt_plumb':
        if (input.clue.isKlaxonMyth && !input.resolution.triggeredKlaxon) {
          bonusChips += 115;
          fired = true;
        }
        break;
      case 'relic_vaudeville_sleeve_ace':
        if (canFireMult && input.rivalMatchScore - input.playerMatchScore >= 200) {
          relicMult += 0.5;
          fired = true;
        }
        break;
      case 'relic_isolation_wiretap_coil':
        if (input.clue.domain === 'HIST_FACT' || input.clue.domain === 'NUM_GEO') {
          bonusChips += 80;
          fired = true;
        }
        break;
      case 'relic_dirty_marker_ledger': {
        const stacks = Math.floor((contrabandCash + grudgeCash) / 500);
        if (stacks > 0) {
          bonusChips += Math.min(125, stacks * 25);
          fired = true;
        }
        break;
      }
    }

    if (fired && !triggeredRelicIds.includes(spec.relicId)) {
      triggeredRelicIds.push(spec.relicId);
    }

    // 4 Foil live bonuses
    if (owned.foil === 'GILDED') {
      foilChips += 18;
    } else if (owned.foil === 'SILVER_HALIDE' && input.answerTimeSec <= 7.0) {
      foilMult += 0.08;
    } else if (
      owned.foil === 'DICHROIC' &&
      (input.tile.isWheelhouse || input.tile.hasUhfHalo)
    ) {
      foilMult += 0.07;
    } else if (owned.foil === 'TAX_STAMPED') {
      taxStampedDividend += 25;
    }
  }

  // Season 3 Coup Regime global board/economy flavor
  let regimeMult = 0;
  if (input.activeCoupRegime === 'REGIME_A_ROZ_PHARMA' && input.pocketedCanaryThisMatch) {
    regimeMult += 0.15;
  } else if (input.activeCoupRegime === 'REGIME_B_BELLAMY_UHF' && input.tile.hasUhfHalo) {
    regimeMult += 0.2;
  } else if (input.activeCoupRegime === 'REGIME_C_VERA_FORENSIC' && contrabandCash === 0) {
    regimeMult += 0.15;
  }

  if (
    input.waiver?.dayJob === 'VEGAS_ACTUARY' &&
    input.resolution.chipMultiplier > 1.0
  ) {
    const actuaryAdd = Math.round(baseChips * 0.15);
    bonusChips += actuaryAdd;
    notes.push(`Vegas Actuary +$${actuaryAdd}`);
  }
  if (taxStampedDividend > 0) {
    foilChips += taxStampedDividend;
  }

  const banePenalty = Math.max(0, Math.min(0.35, input.juryBaneMultPenalty ?? 0));
  const totalChips = Math.max(
    25,
    Math.min(finaleJackpotUnlocked ? 1150 : 900, baseChips + bonusChips + foilChips),
  );
  const totalMult = Number(
    Math.min(
      maxTotalMultCap,
      Math.max(
        1.0,
        1.0 + boardMult + waiverMult + relicMult + foilMult + regimeMult - banePenalty,
      ),
    ).toFixed(2),
  );

  const actuaryMultiplier = 1.0;

  // Crisp $25 1966 Split-Flap Tote-Board Increments (zero awkward $166 / $262 / $566 odd payouts!)
  const rawTurnCash = Math.round(totalChips * totalMult);
  const wasCapped = false;
  const turnCash =
    rawTurnCash > 0 ? Math.max(25, Math.round(rawTurnCash / 25) * 25) : 0;

  return {
    scored: true,
    baseChips,
    bonusChips,
    foilChips,
    totalChips,
    baseMult: 1,
    boardMult: Number(boardMult.toFixed(2)),
    waiverMult: Number((waiverMult + regimeMult - banePenalty).toFixed(2)),
    relicMult: Number(relicMult.toFixed(2)),
    foilMult: Number(foilMult.toFixed(2)),
    totalMult,
    actuaryMultiplier,
    rawTurnCash,
    turnCashCap,
    wasCapped,
    turnCash,
    penaltyCash: 0,
    netCashDelta: turnCash,
    cleanSideDividend,
    contrabandSideCut,
    nextStreak,
    triggeredRelicIds,
    summaryNotes: notes,
  };
}

/** $450 Mid-Match Live Score-Burn Shop Buy (*Sale of the Century* live match lead bargain!). */
export interface LiveScoreBurnResultV7 {
  readonly ok: boolean;
  readonly reason?: string;
  readonly nextPlayerMatchScore: number;
  readonly nextEquippedRelics: OwnedRelicV7[];
  readonly costBurned: number;
}

export function executeLiveScoreBurnBuyV7(
  playerMatchScore: number,
  equippedRelics: readonly OwnedRelicV7[],
  relicId: string,
  foilOverride?: FoilFinishV7,
  replaceSlotIdx?: number,
): LiveScoreBurnResultV7 {
  const spec = RELIC_BY_ID_V7[relicId];
  if (!spec) {
    return {
      ok: false,
      reason: 'Selected prop is not in the Studio 6A Prop Shop.',
      nextPlayerMatchScore: playerMatchScore,
      nextEquippedRelics: [...equippedRelics],
      costBurned: 0,
    };
  }
  if (Math.floor(playerMatchScore) < LIVE_SCORE_BURN_SHOP_COST_V7) {
    return {
      ok: false,
      reason: `Need at least $${LIVE_SCORE_BURN_SHOP_COST_V7} on your live scoreboard to trade for a prop.`,
      nextPlayerMatchScore: playerMatchScore,
      nextEquippedRelics: [...equippedRelics],
      costBurned: 0,
    };
  }

  const nextOwned: OwnedRelicV7 = {
    relicId: spec.relicId,
    foil: foilOverride ?? spec.defaultFoil,
  };
  const candidate = [...equippedRelics];
  if (
    typeof replaceSlotIdx === 'number' &&
    replaceSlotIdx >= 0 &&
    replaceSlotIdx < candidate.length
  ) {
    candidate[replaceSlotIdx] = nextOwned;
  } else if (candidate.length < MAX_TRUNK_SLOTS_V7) {
    candidate.push(nextOwned);
  } else {
    return {
      ok: false,
      reason: 'All 5 Studio Trunk slots are full—unequip a prop first to make room.',
      nextPlayerMatchScore: playerMatchScore,
      nextEquippedRelics: [...equippedRelics],
      costBurned: 0,
    };
  }

  const check = validateTrunkLoadoutV7(candidate);
  if (!check.ok) {
    return {
      ok: false,
      reason: check.reason,
      nextPlayerMatchScore: playerMatchScore,
      nextEquippedRelics: [...equippedRelics],
      costBurned: 0,
    };
  }

  return {
    ok: true,
    nextPlayerMatchScore: Math.floor(playerMatchScore) - LIVE_SCORE_BURN_SHOP_COST_V7,
    nextEquippedRelics: candidate,
    costBurned: LIVE_SCORE_BURN_SHOP_COST_V7,
  };
}
