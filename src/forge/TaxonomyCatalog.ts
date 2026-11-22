// ============================================================================
// WORLD'S SMARTEST — 3-LEVEL TAXONOMY CATALOG (L0 -> L1 -> L2, 150+ TOPICS)
// Built-in instant hierarchy across all 12 L0 Domains -> 48 L1s -> 150 L2s
// + Seamless runtime hydration of `public/data/shards/taxonomy_tree.json`
// ============================================================================

import { FORGE_DOMAINS, type DomainId } from './types';

export interface TaxonomyShardRule {
  /** Shard table `type` ID in `domain_<d>.json` or `domain_subcats_<d>.json` */
  type: string;
  /** Optional column index or column name to filter entity rows (e.g., `1` or `'sport'`) */
  filterCol?: number | string | null;
  /** Case-insensitive exact values (or substrings if `matchMode === 'contains'`) */
  filterValues?: string[];
  matchMode?: 'exact' | 'contains';
  /** Explicit non-self-answering angle IDs allowed when `filterCol` is active */
  allowedAngleIds?: string[];
}

export interface TaxonomyL2TopicSeed {
  id: string;
  name: string;
  keywords: string[];
  estimatedBaseCount: number;
  shardRules: TaxonomyShardRule[];
  qidRanges?: Array<[number, number]>;
  shardFiles?: string[];
}

export interface TaxonomyL1CategorySeed {
  id: string;
  name: string;
  keywords: string[];
  shardRules?: TaxonomyShardRule[];
  shardFiles?: string[];
  l2Topics: TaxonomyL2TopicSeed[];
}

export interface TaxonomyL0DomainSeed {
  domainId: DomainId;
  l1Subcategories: TaxonomyL1CategorySeed[];
}

export interface TaxonomyL2Node {
  id: string;
  domainId: DomainId;
  l1Id: string;
  l1Name: string;
  name: string;
  breadcrumb: string;
  medallionUrl: string;
  accentHex: string;
  verifiedCount: number;
  unseenCount: number;
  keywords: string[];
  shardRules: TaxonomyShardRule[];
  qidRanges: Array<[number, number]>;
  shardFiles: string[];
}

export interface TaxonomyL1Node {
  id: string;
  domainId: DomainId;
  domainName: string;
  name: string;
  breadcrumb: string;
  medallionUrl: string;
  accentHex: string;
  verifiedCount: number;
  unseenCount: number;
  keywords: string[];
  shardRules: TaxonomyShardRule[];
  shardFiles: string[];
  l2Topics: TaxonomyL2Node[];
}

export interface TaxonomyL0Node {
  domainId: DomainId;
  key: string;
  name: string;
  shortName: string;
  medallionUrl: string;
  accentHex: string;
  verifiedCount: number;
  totalPlayableCount: number;
  unseenCount: number;
  l1Subcategories: TaxonomyL1Node[];
}

export interface ForgeTaxonomyTree {
  schemaVersion: string;
  hydratedFromDisk: boolean;
  totalVerifiedQuestions: number;
  totalPlayableQuestions: number;
  totalL1Count: number;
  totalL2Count: number;
  domains: TaxonomyL0Node[];
}

export interface TaxonomySearchHit {
  level: 'L0' | 'L1' | 'L2';
  domainId: DomainId;
  l1Id?: string;
  l2Id?: string;
  /** Convenience aliases matching ForgeQueryRequest parameter names */
  l1SubcategoryId?: string;
  l2TopicId?: string;
  name: string;
  breadcrumb: string;
  medallionUrl: string;
  accentHex: string;
  verifiedCount: number;
  unseenCount: number;
}

/**
 * Comprehensive 3-Level Built-in Seed Tree (12 L0 -> 48 L1 -> 150 L2 Topics).
 * Pre-wired to existing WS_SHARD_V1 table predicates with strict non-self-answering
 * `allowedAngleIds` (`answerCol !== filterCol` & `fakeCol !== filterCol`), and upgraded
 * automatically when `public/data/shards/taxonomy_tree.json` loads!
 */
export const BUILTIN_TAXONOMY_SEEDS: ReadonlyArray<TaxonomyL0DomainSeed> = [
  // 0: WORLD HISTORY
  {
    domainId: 0,
    l1Subcategories: [
      {
        id: 'hist_military',
        name: 'Military History & Conflicts',
        keywords: ['battle', 'war', 'siege', 'campaign', 'military'],
        l2Topics: [
          {
            id: 'hist_ww2',
            name: 'World War II',
            keywords: ['world war ii', 'second world war', 'normandy', 'stalingrad', 'axis', 'allies', 'enigma'],
            estimatedBaseCount: 6400,
            shardRules: [
              { type: 'hist_battle', filterCol: 1, filterValues: ['World War II', 'Pacific War', 'Eastern Front', 'Western Front'], matchMode: 'contains', allowedAngleIds: ['hb_country', 'hb_tf', 'hb_year'] },
              { type: 'hist_war', filterCol: 0, filterValues: ['World War II', 'Campaign', 'Front', 'Operation'], matchMode: 'contains' },
            ],
          },
          {
            id: 'hist_ww1_modern_wars',
            name: 'World War I & 20th-Century Wars',
            keywords: ['world war i', 'cold war', 'korean war', 'vietnam', 'somme', 'verdun'],
            estimatedBaseCount: 4800,
            shardRules: [
              { type: 'hist_battle', filterCol: 1, filterValues: ['World War I', 'Korean War', 'Vietnam War', 'Spanish Civil War', 'Russian Civil War'], matchMode: 'contains', allowedAngleIds: ['hb_country', 'hb_tf', 'hb_year'] },
            ],
          },
          {
            id: 'hist_napoleonic_early_modern',
            name: 'Napoleonic & Revolutionary Wars',
            keywords: ['napoleon', 'waterloo', 'american revolution', 'civil war', 'french revolution'],
            estimatedBaseCount: 5200,
            shardRules: [
              { type: 'hist_battle', filterCol: 1, filterValues: ['Napoleonic', 'American Civil War', 'American Revolutionary', 'Seven Years', 'French Revolutionary'], matchMode: 'contains', allowedAngleIds: ['hb_country', 'hb_tf', 'hb_year'] },
            ],
          },
          {
            id: 'hist_ancient_medieval_battles',
            name: 'Ancient & Medieval Warfare',
            keywords: ['crusade', 'roman', 'punic', 'peloponnesian', 'hundred years', 'medieval'],
            estimatedBaseCount: 5400,
            shardRules: [
              { type: 'hist_battle', filterCol: 1, filterValues: ['Crusade', 'Punic', 'Roman', 'Byzantine', 'Hundred Years', 'Mongol', ' Sengoku'], matchMode: 'contains', allowedAngleIds: ['hb_country', 'hb_tf', 'hb_year'] },
            ],
          },
        ],
      },
      {
        id: 'hist_empires',
        name: 'Empires, Dynasties & Realms',
        keywords: ['empire', 'dynasty', 'kingdom', 'caliphate', 'republic'],
        l2Topics: [
          {
            id: 'hist_classical_antiquity',
            name: 'Ancient Rome, Greece & Egypt',
            keywords: ['roman', 'greece', 'athens', 'sparta', 'pharaoh', 'ptolemaic', 'persian'],
            estimatedBaseCount: 3800,
            shardRules: [{ type: 'hist_empire' }],
          },
          {
            id: 'hist_asian_islamic_empires',
            name: 'Imperial Asia & Islamic Caliphates',
            keywords: ['dynasty', 'qing', 'ming', 'tang', 'ottoman', 'mughal', 'shogunate', 'caliphate'],
            estimatedBaseCount: 3600,
            shardRules: [{ type: 'hist_empire' }],
          },
          {
            id: 'hist_european_crowns',
            name: 'European Kingdoms & Empires',
            keywords: ['habsburg', 'prussia', 'tudor', 'british empire', 'holy roman', 'byzantine'],
            estimatedBaseCount: 4100,
            shardRules: [{ type: 'hist_empire' }, { type: 'hist_war' }],
          },
        ],
      },
      {
        id: 'hist_leaders_figures',
        name: 'Historical Figures & Rulers',
        keywords: ['monarch', 'emperor', 'queen', 'king', 'statesman', 'explorer'],
        l2Topics: [
          {
            id: 'hist_monarchs_rulers',
            name: 'Monarchs, Emperors & Sovereign Rulers',
            keywords: ['monarch', 'king', 'queen', 'emperor', 'sultan', 'tsar', 'pharaoh'],
            estimatedBaseCount: 9500,
            shardRules: [
              { type: 'hist_figure', filterCol: 1, filterValues: ['Monarch', 'Ruler', 'Emperor', 'Aristocrat', 'Sovereign'], matchMode: 'contains', allowedAngleIds: ['hf_country', 'hf_rev', 'hf_tf', 'hf_year'] },
            ],
          },
          {
            id: 'hist_statesmen_revolutionaries',
            name: 'Statesmen, Diplomats & Revolutionaries',
            keywords: ['diplomat', 'revolutionary', 'president', 'prime minister', 'activist', 'politician'],
            estimatedBaseCount: 11200,
            shardRules: [
              { type: 'hist_figure', filterCol: 1, filterValues: ['Statesman', 'Politician', 'Diplomat', 'Revolutionary', 'Activist'], matchMode: 'contains', allowedAngleIds: ['hf_country', 'hf_rev', 'hf_tf', 'hf_year'] },
            ],
          },
          {
            id: 'hist_explorers_commanders',
            name: 'Explorers, Navigators & Commanders',
            keywords: ['explorer', 'navigator', 'general', 'admiral', 'commander', 'historian'],
            estimatedBaseCount: 7800,
            shardRules: [
              { type: 'hist_figure', filterCol: 1, filterValues: ['Explorer', 'Military', 'Commander', 'General', 'Admiral', 'Historian'], matchMode: 'contains', allowedAngleIds: ['hf_country', 'hf_rev', 'hf_tf', 'hf_year'] },
            ],
          },
        ],
      },
      {
        id: 'hist_treaties_eras',
        name: 'Treaties, Charters & Turning Points',
        keywords: ['treaty', 'charter', 'convention', 'renaissance', 'reformation'],
        l2Topics: [
          {
            id: 'hist_diplomatic_treaties',
            name: 'Peace Treaties & Diplomatic Summits',
            keywords: ['treaty', 'congress', 'peace of', 'accord', 'convention', 'charter'],
            estimatedBaseCount: 3100,
            shardRules: [{ type: 'hist_war' }],
          },
          {
            id: 'hist_revolutions_reforms',
            name: 'Social Revolutions & Industrial Era',
            keywords: ['industrial', 'suffrage', 'abolition', 'enlightenment', 'reformation'],
            estimatedBaseCount: 2900,
            shardRules: [{ type: 'hist_figure' }, { type: 'hist_war' }],
          },
        ],
      },
    ],
  },

  // 1: SCIENCE & SPACE
  {
    domainId: 1,
    l1Subcategories: [
      {
        id: 'sci_astronomy_space',
        name: 'Astronomy, Cosmology & Spaceflight',
        keywords: ['space', 'planet', 'exoplanet', 'star', 'galaxy', 'nasa', 'orbit'],
        l2Topics: [
          {
            id: 'sci_exoplanets',
            name: 'Exoplanets & Planetary Systems',
            keywords: ['exoplanet', 'kepler', 'tess', 'radial velocity', 'transit'],
            estimatedBaseCount: 16500,
            shardRules: [{ type: 'sci_exoplanet' }],
          },
          {
            id: 'sci_stars_galaxies',
            name: 'Stars, Nebulae & Constellations',
            keywords: ['constellation', 'nebula', 'galaxy', 'supernova', 'star cluster', 'pulsar'],
            estimatedBaseCount: 12400,
            shardRules: [{ type: 'sci_astro' }],
          },
          {
            id: 'sci_space_missions',
            name: 'Space Missions, Probes & Rockets',
            keywords: ['apollo', 'voyager', 'mars', 'spacecraft', 'satellite', 'nasa', 'esa'],
            estimatedBaseCount: 3400,
            shardRules: [{ type: 'sci_space' }],
          },
        ],
      },
      {
        id: 'sci_chemistry',
        name: 'Chemistry & Elements',
        keywords: ['element', 'chemical', 'periodic', 'molecule', 'compound', 'atomic'],
        l2Topics: [
          {
            id: 'sci_periodic_elements',
            name: 'Periodic Table of Elements',
            keywords: ['atomic number', 'noble gas', 'alkali', 'lanthanide', 'transition metal', 'element'],
            estimatedBaseCount: 2800,
            shardRules: [{ type: 'sci_element' }],
          },
          {
            id: 'sci_compounds_molecules',
            name: 'Chemical Compounds & Formulas',
            keywords: ['formula', 'molecular', 'acid', 'oxide', 'organic', 'compound'],
            estimatedBaseCount: 18500,
            shardRules: [{ type: 'sci_chemical' }],
          },
          {
            id: 'sci_nobel_chemists',
            name: 'Famous Chemists & Discoveries',
            keywords: ['chemist', 'chemistry', 'catalysis', 'polymer', 'nobel'],
            estimatedBaseCount: 5200,
            shardRules: [
              { type: 'sci_scientist', filterCol: 1, filterValues: ['Chemist', 'Chemistry', 'Biochemist'], matchMode: 'contains', allowedAngleIds: ['ss_country', 'ss_rev', 'ss_year'] },
            ],
          },
        ],
      },
      {
        id: 'sci_physics',
        name: 'Physics & Quantum Mechanics',
        keywords: ['physics', 'quantum', 'relativity', 'thermodynamics', 'electromagnetism', 'particle'],
        l2Topics: [
          {
            id: 'sci_physicists',
            name: 'Physicists & Nobel Laureates',
            keywords: ['physicist', 'quantum', 'relativity', 'nobel', 'cern', 'boson'],
            estimatedBaseCount: 8400,
            shardRules: [
              { type: 'sci_scientist', filterCol: 1, filterValues: ['Physicist', 'Physics', 'Astrophysicist', 'Astronomer'], matchMode: 'contains', allowedAngleIds: ['ss_country', 'ss_rev', 'ss_year'] },
            ],
          },
          {
            id: 'sci_mechanics_optics',
            name: 'Classical Mechanics, Waves & Optics',
            keywords: ['force', 'energy', 'momentum', 'optics', 'wavelength', 'gravity', 'circuit'],
            estimatedBaseCount: 3800,
            shardRules: [{ type: 'sci_scientist' }],
          },
        ],
      },
      {
        id: 'sci_life_medical',
        name: 'Medicine, Genetics & Earth Science',
        keywords: ['medicine', 'genetics', 'cell', 'anatomy', 'geology', 'climate'],
        l2Topics: [
          {
            id: 'sci_biomedical_pioneers',
            name: 'Medicine, Physiology & Genetics',
            keywords: ['physician', 'geneticist', 'biologist', 'neuroscientist', 'immunology', 'dna', 'enzyme'],
            estimatedBaseCount: 9200,
            shardRules: [
              { type: 'sci_scientist', filterCol: 1, filterValues: ['Physician', 'Biologist', 'Geneticist', 'Medical', 'Physiologist', 'Neuroscientist'], matchMode: 'contains', allowedAngleIds: ['ss_country', 'ss_rev', 'ss_year'] },
            ],
          },
          {
            id: 'sci_earth_atmosphere',
            name: 'Earth Science, Geology & Climate',
            keywords: ['geologist', 'meteorology', 'plate tectonics', 'mineral', 'atmosphere', 'seismic'],
            estimatedBaseCount: 3200,
            shardRules: [
              { type: 'sci_scientist', filterCol: 1, filterValues: ['Geologist', 'Earth', 'Meteorolog', 'Oceanograph'], matchMode: 'contains', allowedAngleIds: ['ss_country', 'ss_rev', 'ss_year'] },
            ],
          },
        ],
      },
    ],
  },

  // 2: GEOGRAPHY & WONDERS
  {
    domainId: 2,
    l1Subcategories: [
      {
        id: 'geo_world_cities',
        name: 'World Cities & Urban Centers',
        keywords: ['city', 'metropolis', 'population', 'urban', 'province'],
        l2Topics: [
          {
            id: 'geo_cities_europe_americas',
            name: 'Cities of Europe & the Americas',
            keywords: ['europe', 'united states', 'canada', 'brazil', 'mexico', 'france', 'germany', 'italy'],
            estimatedBaseCount: 42000,
            shardRules: [
              { type: 'geo_city', filterCol: 1, filterValues: ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Colombia', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Poland', 'Netherlands', 'Sweden', 'Switzerland'], allowedAngleIds: ['gc_country', 'gc_rev', 'gc_reg', 'gc_tf', 'gc_pop'] },
            ],
          },
          {
            id: 'geo_cities_asia_pacific',
            name: 'Cities of Asia & Oceania',
            keywords: ['china', 'japan', 'india', 'indonesia', 'korea', 'australia', 'vietnam', 'thailand'],
            estimatedBaseCount: 44000,
            shardRules: [
              { type: 'geo_city', filterCol: 1, filterValues: ['China', 'Japan', 'India', 'South Korea', 'Indonesia', 'Philippines', 'Vietnam', 'Thailand', 'Australia', 'New Zealand', 'Malaysia', 'Singapore', 'Turkey'], allowedAngleIds: ['gc_country', 'gc_rev', 'gc_reg', 'gc_tf', 'gc_pop'] },
            ],
          },
          {
            id: 'geo_cities_africa_mena',
            name: 'Cities of Africa & the Middle East',
            keywords: ['egypt', 'nigeria', 'south africa', 'kenya', 'morocco', 'saudi', 'iran'],
            estimatedBaseCount: 18500,
            shardRules: [
              { type: 'geo_city', filterCol: 1, filterValues: ['Egypt', 'Nigeria', 'South Africa', 'Kenya', 'Morocco', 'Ethiopia', 'Algeria', 'Ghana', 'Tanzania', 'Saudi Arabia', 'United Arab Emirates', 'Israel', 'Iran', 'Iraq'], allowedAngleIds: ['gc_country', 'gc_rev', 'gc_reg', 'gc_tf', 'gc_pop'] },
            ],
          },
        ],
      },
      {
        id: 'geo_physical_relief',
        name: 'Mountains, Volcanoes & Peaks',
        keywords: ['mountain', 'peak', 'summit', 'volcano', 'alps', 'andes', 'himalayas'],
        l2Topics: [
          {
            id: 'geo_high_summits',
            name: 'World Mountains & Summit Elevations',
            keywords: ['mountain', 'mount', 'peak', 'elevation', 'everest', 'matterhorn', 'fuji'],
            estimatedBaseCount: 16200,
            shardRules: [{ type: 'geo_mountain' }],
          },
          {
            id: 'geo_islands_archipelagos',
            name: 'Islands, Peninsulas & Volcanoes',
            keywords: ['island', 'archipelago', 'volcano', 'atoll', 'peninsula'],
            estimatedBaseCount: 5400,
            shardRules: [
              { type: 'geo_wonder', filterCol: 1, filterValues: ['Island', 'Volcano', 'Archipelago', 'Peninsula'], matchMode: 'contains', allowedAngleIds: ['gw_country', 'gw_rev', 'gw_tf'] },
            ],
          },
        ],
      },
      {
        id: 'geo_hydrology',
        name: 'Rivers, Lakes & Seas',
        keywords: ['river', 'lake', 'strait', 'sea', 'ocean', 'waterfall', 'bay'],
        l2Topics: [
          {
            id: 'geo_major_rivers',
            name: 'Major World Rivers & Lengths',
            keywords: ['river', 'nile', 'amazon', 'danube', 'rhine', 'yangtze', 'estuary'],
            estimatedBaseCount: 11800,
            shardRules: [{ type: 'geo_river' }],
          },
          {
            id: 'geo_lakes_straits_wonders',
            name: 'Lakes, Glaciers, Deserts & Wonders',
            keywords: ['lake', 'glacier', 'desert', 'waterfall', 'canyon', 'national park'],
            estimatedBaseCount: 8200,
            shardRules: [
              { type: 'geo_wonder', filterCol: 1, filterValues: ['Lake', 'Waterfall', 'Glacier', 'Desert', 'Valley', 'National Park', 'Protected'], matchMode: 'contains', allowedAngleIds: ['gw_country', 'gw_rev', 'gw_tf'] },
            ],
          },
        ],
      },
      {
        id: 'geo_aviation_hubs',
        name: 'Global Aviation & IATA Hubs',
        keywords: ['airport', 'iata', 'hub', 'international airport', 'terminal'],
        l2Topics: [
          {
            id: 'geo_iata_codes',
            name: 'World Airports & 3-Letter IATA Codes',
            keywords: ['airport', 'iata', 'heathrow', 'narita', 'changi', 'jfk'],
            estimatedBaseCount: 14500,
            shardRules: [{ type: 'geo_airport' }],
          },
        ],
      },
    ],
  },

  // 3: ARTS & ARCHITECTURE
  {
    domainId: 3,
    l1Subcategories: [
      {
        id: 'arts_fine_art',
        name: 'Fine Art, Painting & Sculpture',
        keywords: ['painting', 'sculpture', 'canvas', 'museum', 'portrait', 'gallery'],
        l2Topics: [
          {
            id: 'arts_paintings_masters',
            name: 'Masterpiece Paintings & Painters',
            keywords: ['painting', 'oil on canvas', 'fresco', 'renaissance', 'impressionism', 'portrait'],
            estimatedBaseCount: 28000,
            shardRules: [
              { type: 'art_work', filterCol: 3, filterValues: ['Painting', 'Oil', 'Canvas', 'Tempera', 'Watercolor'], matchMode: 'contains', allowedAngleIds: ['aw_artist', 'aw_rev', 'aw_tf', 'aw_year'] },
            ],
          },
          {
            id: 'arts_sculpture_prints',
            name: 'Sculpture, Prints & Decorative Arts',
            keywords: ['sculpture', 'marble', 'bronze', 'engraving', 'woodcut', 'etching', 'drawing'],
            estimatedBaseCount: 24000,
            shardRules: [
              { type: 'art_work', filterCol: 3, filterValues: ['Sculpture', 'Print', 'Drawing', 'Bronze', 'Marble', 'Photograph'], matchMode: 'contains', allowedAngleIds: ['aw_artist', 'aw_rev', 'aw_tf', 'aw_year'] },
            ],
          },
        ],
      },
      {
        id: 'arts_architecture',
        name: 'World Architecture & Monuments',
        keywords: ['architecture', 'cathedral', 'palace', 'castle', 'bridge', 'tower', 'museum'],
        l2Topics: [
          {
            id: 'arts_sacred_cathedrals',
            name: 'Cathedrals, Temples & Sacred Landmarks',
            keywords: ['cathedral', 'temple', 'mosque', 'basilica', 'abbey', 'shrine', 'church'],
            estimatedBaseCount: 9600,
            shardRules: [
              { type: 'art_landmark', filterCol: 1, filterValues: ['Cathedral', 'Church', 'Temple', 'Mosque', 'Abbey', 'Shrine', 'Monastery'], matchMode: 'contains', allowedAngleIds: ['al_country', 'al_rev', 'al_tf', 'al_year'] },
            ],
          },
          {
            id: 'arts_palaces_castles_museums',
            name: 'Castles, Palaces, Bridges & Museums',
            keywords: ['castle', 'palace', 'museum', 'bridge', 'skyscraper', 'tower', 'monument'],
            estimatedBaseCount: 14800,
            shardRules: [
              { type: 'art_landmark', filterCol: 1, filterValues: ['Castle', 'Palace', 'Museum', 'Bridge', 'Tower', 'Skyscraper', 'Monument', 'Theater'], matchMode: 'contains', allowedAngleIds: ['al_country', 'al_rev', 'al_tf', 'al_year'] },
            ],
          },
        ],
      },
      {
        id: 'arts_creators_movements',
        name: 'Visual Artists, Architects & Composers',
        keywords: ['architect', 'painter', 'sculptor', 'composer', 'photographer', 'designer'],
        l2Topics: [
          {
            id: 'arts_architects_designers',
            name: 'Master Architects & Urban Designers',
            keywords: ['architect', 'bauhaus', 'baroque', 'brutalist', 'modernist'],
            estimatedBaseCount: 6800,
            shardRules: [
              { type: 'art_creator', filterCol: 1, filterValues: ['Architect', 'Designer'], matchMode: 'contains', allowedAngleIds: ['ac_country', 'ac_year'] },
            ],
          },
          {
            id: 'arts_classical_composers',
            name: 'Classical Music, Opera & Composers',
            keywords: ['composer', 'symphony', 'opera', 'concerto', 'sonata', 'baroque', 'romantic'],
            estimatedBaseCount: 9200,
            shardRules: [
              { type: 'art_creator', filterCol: 1, filterValues: ['Composer', 'Conductor', 'Opera'], matchMode: 'contains', allowedAngleIds: ['ac_country', 'ac_year'] },
            ],
          },
          {
            id: 'arts_painters_sculptors',
            name: 'World Painters, Sculptors & Photographers',
            keywords: ['painter', 'sculptor', 'photographer', 'illustrator'],
            estimatedBaseCount: 12500,
            shardRules: [
              { type: 'art_creator', filterCol: 1, filterValues: ['Painter', 'Sculptor', 'Photographer'], matchMode: 'contains', allowedAngleIds: ['ac_country', 'ac_year'] },
            ],
          },
        ],
      },
    ],
  },

  // 4: FILM, MUSIC & POP
  {
    domainId: 4,
    l1Subcategories: [
      {
        id: 'pop_cinema',
        name: 'World Cinema & Directors',
        keywords: ['film', 'movie', 'director', 'oscar', 'academy award', 'screenplay'],
        l2Topics: [
          {
            id: 'pop_hollywood_modern_film',
            name: 'Hollywood & Modern Feature Films',
            keywords: ['united states', 'hollywood', 'oscar', 'blockbuster', 'director'],
            estimatedBaseCount: 22000,
            shardRules: [
              { type: 'pop_film', filterCol: 3, filterValues: ['United States', 'Canada', 'Australia', 'New Zealand'], allowedAngleIds: ['pf_dir', 'pf_rev', 'pf_tf', 'pf_year'] },
            ],
          },
          {
            id: 'pop_international_cinema',
            name: 'International, European & Asian Cinema',
            keywords: ['japan', 'france', 'united kingdom', 'italy', 'korea', 'cannes', 'animation'],
            estimatedBaseCount: 16500,
            shardRules: [
              { type: 'pop_film', filterCol: 3, filterValues: ['United Kingdom', 'France', 'Japan', 'Italy', 'Germany', 'South Korea', 'India', 'Spain', 'Hong Kong', 'Sweden'], allowedAngleIds: ['pf_dir', 'pf_rev', 'pf_tf', 'pf_year'] },
            ],
          },
        ],
      },
      {
        id: 'pop_music_recording',
        name: 'Music, Albums, Songs & Bands',
        keywords: ['album', 'song', 'band', 'singer', 'grammy', 'billboard', 'rock', 'pop'],
        l2Topics: [
          {
            id: 'pop_albums',
            name: 'Landmark Studio Albums & Artists',
            keywords: ['album', 'lp', 'record', 'studio album', 'discography'],
            estimatedBaseCount: 24500,
            shardRules: [{ type: 'pop_album' }],
          },
          {
            id: 'pop_songs',
            name: 'Iconic Hit Songs & Singles',
            keywords: ['song', 'single', 'ballad', 'anthem', 'track'],
            estimatedBaseCount: 15800,
            shardRules: [{ type: 'pop_song' }],
          },
          {
            id: 'pop_bands_ensembles',
            name: 'Bands, Groups & Musical Ensembles',
            keywords: ['band', 'rock band', 'quartet', 'duo', 'group'],
            estimatedBaseCount: 9400,
            shardRules: [{ type: 'pop_band' }],
          },
        ],
      },
      {
        id: 'pop_television_media',
        name: 'Television, Streaming & Broadcast',
        keywords: ['television', 'series', 'sitcom', 'drama', 'emmy', 'show', 'broadcast'],
        l2Topics: [
          {
            id: 'pop_tv_series',
            name: 'Television Series & Prestige Drama',
            keywords: ['television', 'tv', 'series', 'network', 'debut'],
            estimatedBaseCount: 9200,
            shardRules: [{ type: 'pop_tv' }],
          },
        ],
      },
    ],
  },

  // 5: SPORTS & GAMES (Explicit User Showcase: Sports & Games -> Sports -> Baseball!)
  {
    domainId: 5,
    l1Subcategories: [
      {
        id: 'sports',
        name: 'Sports',
        keywords: ['sport', 'athlete', 'league', 'championship', 'stadium', 'team'],
        l2Topics: [
          {
            id: 'sports_baseball',
            name: 'Baseball',
            keywords: ['baseball', 'mlb', 'world series', 'pitcher', 'home run', 'ballpark', 'inning', 'yankees', 'dodgers', 'red sox'],
            estimatedBaseCount: 5400,
            shardRules: [
              { type: 'sport_athlete', filterCol: 1, filterValues: ['Baseball'], allowedAngleIds: ['spa_country', 'spa_rev', 'spa_year'] },
              { type: 'sport_club', filterCol: 3, filterValues: ['Baseball'], allowedAngleIds: ['spc_country', 'spc_year'] },
              { type: 'sub_baseball' },
            ],
          },
          {
            id: 'sports_basketball',
            name: 'Basketball',
            keywords: ['basketball', 'nba', 'wnba', 'fiba', 'three-pointer', 'rebound', 'lakers', 'celtics', 'bulls'],
            estimatedBaseCount: 8200,
            shardRules: [
              { type: 'sport_athlete', filterCol: 1, filterValues: ['Basketball'], allowedAngleIds: ['spa_country', 'spa_rev', 'spa_year'] },
              { type: 'sport_club', filterCol: 3, filterValues: ['Basketball'], allowedAngleIds: ['spc_country', 'spc_year'] },
              { type: 'sub_basketball' },
            ],
          },
          {
            id: 'sports_american_football',
            name: 'American Football',
            keywords: ['american football', 'nfl', 'super bowl', 'quarterback', 'touchdown', 'gridiron', 'heisman'],
            estimatedBaseCount: 5200,
            shardRules: [
              { type: 'sport_athlete', filterCol: 1, filterValues: ['American Football', 'Canadian Football'], allowedAngleIds: ['spa_country', 'spa_rev', 'spa_year'] },
              { type: 'sport_club', filterCol: 3, filterValues: ['American Football'], allowedAngleIds: ['spc_country', 'spc_year'] },
              { type: 'sub_american_football' },
            ],
          },
          {
            id: 'sports_soccer',
            name: 'Soccer & World Football',
            keywords: ['soccer', 'fifa', 'world cup', 'premier league', 'champions league', 'la liga', 'striker'],
            estimatedBaseCount: 22400,
            shardRules: [
              { type: 'sport_athlete', filterCol: 1, filterValues: ['Soccer'], allowedAngleIds: ['spa_country', 'spa_rev', 'spa_year'] },
              { type: 'sport_club', filterCol: 3, filterValues: ['Soccer'], allowedAngleIds: ['spc_country', 'spc_year'] },
              { type: 'sub_soccer' },
            ],
          },
          {
            id: 'sports_ice_hockey',
            name: 'Ice Hockey',
            keywords: ['ice hockey', 'nhl', 'stanley cup', 'goalie', 'puck'],
            estimatedBaseCount: 4900,
            shardRules: [
              { type: 'sport_athlete', filterCol: 1, filterValues: ['Ice Hockey'], allowedAngleIds: ['spa_country', 'spa_rev', 'spa_year'] },
              { type: 'sport_club', filterCol: 3, filterValues: ['Ice Hockey'], allowedAngleIds: ['spc_country', 'spc_year'] },
              { type: 'sub_ice_hockey' },
            ],
          },
          {
            id: 'sports_tennis_golf',
            name: 'Tennis & Golf',
            keywords: ['tennis', 'wimbledon', 'grand slam', 'roland-garros', 'golf', 'masters', 'pga'],
            estimatedBaseCount: 5600,
            shardRules: [
              { type: 'sport_athlete', filterCol: 1, filterValues: ['Tennis', 'Golf', 'Table Tennis', 'Badminton'], allowedAngleIds: ['spa_country', 'spa_rev', 'spa_year'] },
              { type: 'sub_tennis_golf' },
            ],
          },
          {
            id: 'sports_olympics_track_swim',
            name: 'Olympics, Track & Swimming',
            keywords: ['olympic', 'track and field', 'marathon', 'sprint', 'swimming', 'gymnastics', 'skiing', 'skating'],
            estimatedBaseCount: 9800,
            shardRules: [
              { type: 'sport_athlete', filterCol: 1, filterValues: ['Track and Field', 'Swimming', 'Gymnastics', 'Alpine Skiing', 'Figure Skating', 'Speed Skating', 'Rowing', 'Cycling'], allowedAngleIds: ['spa_country', 'spa_rev', 'spa_year'] },
              { type: 'sub_olympics' },
            ],
          },
          {
            id: 'sports_combat_motorsport',
            name: 'Combat Sports, Motorsport & Global Pitch',
            keywords: ['boxing', 'mma', 'judo', 'wrestling', 'sumo', 'formula one', 'auto racing', 'cricket', 'rugby'],
            estimatedBaseCount: 6800,
            shardRules: [
              { type: 'sport_athlete', filterCol: 1, filterValues: ['Boxing', 'Mixed Martial Arts', 'Wrestling', 'Judo', 'Formula One', 'Auto Racing', 'Cricket', 'Rugby'], allowedAngleIds: ['spa_country', 'spa_rev', 'spa_year'] },
              { type: 'sport_club', filterCol: 3, filterValues: ['Cricket', 'Rugby'], allowedAngleIds: ['spc_country', 'spc_year'] },
              { type: 'sub_combat_motor' },
            ],
          },
          {
            id: 'sports_stadiums_arenas',
            name: 'Iconic Stadiums, Ballparks & Arenas',
            keywords: ['stadium', 'arena', 'ballpark', 'capacity', 'velodrome', 'circuit'],
            estimatedBaseCount: 3800,
            shardRules: [{ type: 'sport_stadium' }],
          },
        ],
      },
      {
        id: 'games_esports',
        name: 'Games, Chess & Video Games',
        keywords: ['video game', 'chess', 'board game', 'console', 'esports', 'card game'],
        l2Topics: [
          {
            id: 'games_videogames',
            name: 'Video Games, Studios & Consoles',
            keywords: ['video game', 'nintendo', 'playstation', 'arcade', 'rpg', 'developer'],
            estimatedBaseCount: 11200,
            shardRules: [{ type: 'sport_videogame' }, { type: 'sub_videogames' }],
          },
          {
            id: 'games_chess_tabletop',
            name: 'Chess, Board Games & Strategy',
            keywords: ['chess', 'grandmaster', 'checkmate', 'go', 'poker', 'board game', 'backgammon'],
            estimatedBaseCount: 2800,
            shardRules: [
              { type: 'sport_athlete', filterCol: 1, filterValues: ['Chess'], allowedAngleIds: ['spa_country', 'spa_rev', 'spa_year'] },
              { type: 'sub_chess_strategy' },
            ],
          },
        ],
      },
    ],
  },

  // 6: TECH & COMPUTING
  {
    domainId: 6,
    l1Subcategories: [
      {
        id: 'tech_computing_software',
        name: 'Computing, Software & AI',
        keywords: ['software', 'programming', 'operating system', 'internet', 'web', 'ai', 'algorithm'],
        l2Topics: [
          {
            id: 'tech_software_os',
            name: 'Operating Systems, Languages & Protocols',
            keywords: ['operating system', 'linux', 'unix', 'programming language', 'browser', 'database', 'http'],
            estimatedBaseCount: 7400,
            shardRules: [{ type: 'tech_software' }],
          },
          {
            id: 'tech_cs_pioneers',
            name: 'Computer Scientists & Inventors',
            keywords: ['computer scientist', 'inventor', 'engineer', 'turing', 'lovelace', 'berners-lee'],
            estimatedBaseCount: 14200,
            shardRules: [{ type: 'tech_pioneer' }],
          },
        ],
      },
      {
        id: 'tech_industry_hardware',
        name: 'Tech Giants, Semiconductors & Industry',
        keywords: ['semiconductor', 'company', 'silicon valley', 'telecommunications', 'electronics'],
        l2Topics: [
          {
            id: 'tech_companies',
            name: 'Global Tech, Telecom & Electronics Firms',
            keywords: ['technology', 'software', 'electronics', 'semiconductor', 'telecommunications', 'founded'],
            estimatedBaseCount: 18400,
            shardRules: [{ type: 'tech_company' }],
          },
        ],
      },
      {
        id: 'tech_aerospace_automotive',
        name: 'Automotive, Aviation & Aerospace Hardware',
        keywords: ['aircraft', 'spacecraft', 'car', 'locomotive', 'ship', 'aerospace'],
        l2Topics: [
          {
            id: 'tech_aircraft_ships',
            name: 'Aircraft, Spacecraft & Naval Vessels',
            keywords: ['aircraft', 'jet', 'airliner', 'helicopter', 'ship', 'submarine'],
            estimatedBaseCount: 9200,
            shardRules: [
              { type: 'tech_vehicle', filterCol: 2, filterValues: ['Aircraft', 'Airliner', 'Ship', 'Spacecraft', 'Locomotive', 'Train'], matchMode: 'contains', allowedAngleIds: ['tv_maker', 'tv_rev', 'tv_tf'] },
            ],
          },
          {
            id: 'tech_automobiles',
            name: 'Automobiles, Supercars & Engineering',
            keywords: ['car', 'automobile', 'coupe', 'sedan', 'ev', 'hybrid', 'engine'],
            estimatedBaseCount: 9800,
            shardRules: [
              { type: 'tech_vehicle', filterCol: 2, filterValues: ['Car', 'Automobile', 'Sports', 'Vehicle', 'Motorcycle'], matchMode: 'contains', allowedAngleIds: ['tv_maker', 'tv_rev', 'tv_tf'] },
            ],
          },
        ],
      },
    ],
  },

  // 7: NATURE & BIOLOGY
  {
    domainId: 7,
    l1Subcategories: [
      {
        id: 'nat_vertebrates',
        name: 'Mammals, Birds & Reptiles',
        keywords: ['mammal', 'bird', 'reptile', 'amphibian', 'wildlife', 'vertebrate'],
        l2Topics: [
          {
            id: 'nat_mammals',
            name: 'Mammals of Land & Sea',
            keywords: ['mammal', 'whale', 'primate', 'carnivore', 'marsupial', 'feline'],
            estimatedBaseCount: 12400,
            shardRules: [
              { type: 'nat_species', filterCol: 2, filterValues: ['Mammal'], allowedAngleIds: ['ns_sci', 'ns_rev'] },
            ],
          },
          {
            id: 'nat_birds',
            name: 'Birds & Avian Life',
            keywords: ['bird', 'falcon', 'owl', 'eagle', 'penguin', 'songbird', 'avian'],
            estimatedBaseCount: 14200,
            shardRules: [
              { type: 'nat_species', filterCol: 2, filterValues: ['Bird'], allowedAngleIds: ['ns_sci', 'ns_rev'] },
            ],
          },
          {
            id: 'nat_reptiles_amphibians',
            name: 'Reptiles & Amphibians',
            keywords: ['reptile', 'amphibian', 'frog', 'snake', 'lizard', 'turtle', 'crocodile'],
            estimatedBaseCount: 8600,
            shardRules: [
              { type: 'nat_species', filterCol: 2, filterValues: ['Reptile', 'Amphibian'], allowedAngleIds: ['ns_sci', 'ns_rev'] },
            ],
          },
        ],
      },
      {
        id: 'nat_marine_invertebrates',
        name: 'Marine Life, Insects & Invertebrates',
        keywords: ['fish', 'shark', 'insect', 'arachnid', 'mollusk', 'crustacean', 'ocean'],
        l2Topics: [
          {
            id: 'nat_fish_sharks',
            name: 'Fish, Sharks & Ocean Predators',
            keywords: ['fish', 'shark', 'ray', 'reef', 'marine'],
            estimatedBaseCount: 9800,
            shardRules: [
              { type: 'nat_species', filterCol: 2, filterValues: ['Fish', 'Shark or Ray', 'Shark'], matchMode: 'contains', allowedAngleIds: ['ns_sci', 'ns_rev'] },
            ],
          },
          {
            id: 'nat_insects_invertebrates',
            name: 'Insects, Arachnids, Mollusks & Crustaceans',
            keywords: ['insect', 'butterfly', 'beetle', 'spider', 'octopus', 'crab', 'mollusk'],
            estimatedBaseCount: 8400,
            shardRules: [
              { type: 'nat_species', filterCol: 2, filterValues: ['Insect', 'Arachnid', 'Mollusk', 'Crustacean'], allowedAngleIds: ['ns_sci', 'ns_rev'] },
            ],
          },
        ],
      },
      {
        id: 'nat_botany_fungi',
        name: 'Botany, Trees, Flora & Fungi',
        keywords: ['plant', 'tree', 'flower', 'fungus', 'mushroom', 'photosynthesis', 'forest'],
        l2Topics: [
          {
            id: 'nat_plants_trees',
            name: 'Plants, Trees & Botanical Taxonomy',
            keywords: ['plant', 'tree', 'orchid', 'conifer', 'fern', 'botanical'],
            estimatedBaseCount: 9200,
            shardRules: [
              { type: 'nat_species', filterCol: 2, filterValues: ['Plant', 'Fungus'], allowedAngleIds: ['ns_sci', 'ns_rev'] },
            ],
          },
        ],
      },
    ],
  },

  // 8: WORLD AFFAIRS & LAW
  {
    domainId: 8,
    l1Subcategories: [
      {
        id: 'soc_nations_geopolitics',
        name: 'Sovereign Nations, Capitals & Currencies',
        keywords: ['capital', 'currency', 'sovereign', 'continent', 'flag', 'country'],
        l2Topics: [
          {
            id: 'soc_capitals_currencies',
            name: 'World Capitals, Continents & Currencies',
            keywords: ['capital', 'currency', 'franc', 'yen', 'peso', 'dinar', 'continent'],
            estimatedBaseCount: 2800,
            shardRules: [{ type: 'soc_country' }],
          },
          {
            id: 'soc_intl_orgs',
            name: 'International Organizations, NGOs & Alliances',
            keywords: ['united nations', 'nato', 'treaty', 'agency', 'humanitarian', 'organization'],
            estimatedBaseCount: 14200,
            shardRules: [{ type: 'soc_org' }],
          },
        ],
      },
      {
        id: 'soc_governance_law',
        name: 'World Leaders, Law & Constitutional Order',
        keywords: ['president', 'prime minister', 'chancellor', 'supreme court', 'constitution', 'law'],
        l2Topics: [
          {
            id: 'soc_heads_of_state',
            name: 'Heads of State, Prime Ministers & Jurists',
            keywords: ['president', 'prime minister', 'chancellor', 'jurist', 'judge', 'secretary-general'],
            estimatedBaseCount: 38000,
            shardRules: [{ type: 'soc_leader' }],
          },
        ],
      },
      {
        id: 'soc_academia_economics',
        name: 'World Universities, Economics & Institutions',
        keywords: ['university', 'college', 'economics', 'central bank', 'academy'],
        l2Topics: [
          {
            id: 'soc_universities',
            name: 'Historic & Research Universities Worldwide',
            keywords: ['university', 'oxford', 'cambridge', 'sorbonne', 'harvard', 'founded'],
            estimatedBaseCount: 13800,
            shardRules: [{ type: 'soc_university' }],
          },
        ],
      },
    ],
  },

  // 9: FOOD, CRAFT & DESIGN
  {
    domainId: 9,
    l1Subcategories: [
      {
        id: 'food_gastronomy',
        name: 'World Gastronomy, Dishes & Beverages',
        keywords: ['dish', 'cuisine', 'cheese', 'bread', 'pastry', 'wine', 'tea', 'coffee'],
        l2Topics: [
          {
            id: 'food_world_dishes',
            name: 'National Dishes, Cheeses, Pastries & Drinks',
            keywords: ['dish', 'cheese', 'dessert', 'soup', 'pasta', 'bread', 'beverage', 'wine', 'tea'],
            estimatedBaseCount: 14600,
            shardRules: [{ type: 'food_item' }],
          },
        ],
      },
      {
        id: 'food_heritage_brands',
        name: 'Heritage Houses, Horology & Luxury Brands',
        keywords: ['watch', 'horology', 'fashion', 'luxury', 'brand', 'atelier', 'brewery'],
        l2Topics: [
          {
            id: 'food_luxury_brands',
            name: 'Horology, Fashion Houses & Culinary Brands',
            keywords: ['brand', 'watchmaker', 'breguet', 'fashion', 'confectionery', 'founded'],
            estimatedBaseCount: 16200,
            shardRules: [{ type: 'food_brand' }],
          },
          {
            id: 'food_master_artisans',
            name: 'Chefs, Couturiers & Master Artisans',
            keywords: ['chef', 'fashion designer', 'watchmaker', 'industrial designer', 'jeweler'],
            estimatedBaseCount: 15200,
            shardRules: [{ type: 'food_maker' }],
          },
        ],
      },
    ],
  },

  // 10: MYTH & LITERATURE
  {
    domainId: 10,
    l1Subcategories: [
      {
        id: 'myth_world_literature',
        name: 'World Literature, Novels & Poetry',
        keywords: ['novel', 'book', 'author', 'poet', 'playwright', 'tragedy', 'nobel'],
        l2Topics: [
          {
            id: 'myth_classic_modern_works',
            name: 'Classic & Modern Novels, Plays & Epics',
            keywords: ['novel', 'play', 'poem', 'published', 'wrote', 'shakespeare', 'tolkien', 'dickens'],
            estimatedBaseCount: 34000,
            shardRules: [{ type: 'lit_work' }],
          },
          {
            id: 'myth_world_authors',
            name: 'Novelists, Poets, Playwrights & Philosophers',
            keywords: ['author', 'novelist', 'poet', 'playwright', 'philosopher', 'laureate'],
            estimatedBaseCount: 24500,
            shardRules: [
              { type: 'lit_author', allowedAngleIds: ['la_country', 'la_tf', 'la_year'] },
            ],
          },
        ],
      },
      {
        id: 'myth_pantheons_folklore',
        name: 'Classical Mythology, Deities & Legends',
        keywords: ['mythology', 'deity', 'greek', 'norse', 'egyptian', 'hindu', 'folklore', 'legend'],
        l2Topics: [
          {
            id: 'myth_greek_roman',
            name: 'Greek & Roman Mythology',
            keywords: ['greek', 'roman', 'olympus', 'zeus', 'athena', 'apollo', 'odyssey', 'iliad'],
            estimatedBaseCount: 4200,
            shardRules: [
              { type: 'lit_myth', filterCol: 1, filterValues: ['Greek', 'Roman'], matchMode: 'contains', allowedAngleIds: ['lm_rev'] },
            ],
          },
          {
            id: 'myth_norse_egypt_world',
            name: 'Norse, Egyptian, Celtic & World Myth',
            keywords: ['norse', 'egyptian', 'celtic', 'japanese', 'hindu', 'mesopotamian', 'odin', 'osiris'],
            estimatedBaseCount: 4400,
            shardRules: [
              { type: 'lit_myth', filterCol: 1, filterValues: ['Norse', 'Egyptian', 'Celtic', 'Hindu', 'Japanese', 'Slavic', 'Mesopotamian', 'Arthurian'], matchMode: 'contains', allowedAngleIds: ['lm_rev', 'lm_trad', 'lm_tf'] },
            ],
          },
        ],
      },
    ],
  },

  // 11: LOGIC & MATH
  {
    domainId: 11,
    l1Subcategories: [
      {
        id: 'logic_pure_applied_math',
        name: 'Arithmetic, Algebra, Number Theory & Geometry',
        keywords: ['prime', 'fibonacci', 'sequence', 'geometry', 'algebra', 'combinatorics', 'probability'],
        l2Topics: [
          {
            id: 'logic_number_theory_primes',
            name: 'Primes, Sequences & Number Theory',
            keywords: ['prime', 'divisor', 'gcd', 'lcm', 'modular', 'fibonacci', 'factorial'],
            estimatedBaseCount: 22000,
            shardRules: [
              { type: 'math_num', filterCol: 5, filterValues: ['Number Theory', 'Primes', 'Sequences', 'Modular'], matchMode: 'contains' },
              { type: 'math_num' },
            ],
          },
          {
            id: 'logic_geometry_algebra',
            name: 'Geometry, Combinatorics & Mental Math',
            keywords: ['triangle', 'circle', 'polygon', 'volume', 'area', 'permutation', 'combination', 'equation'],
            estimatedBaseCount: 24000,
            shardRules: [
              { type: 'math_num', filterCol: 5, filterValues: ['Geometry', 'Combinatorics', 'Algebra', 'Arithmetic'], matchMode: 'contains' },
              { type: 'math_word' },
            ],
          },
        ],
      },
      {
        id: 'logic_puzzles_cryptography',
        name: 'Deductive Logic, Ciphers & Mathematicians',
        keywords: ['logic', 'cipher', 'paradox', 'mathematician', 'theorem', 'riddle'],
        l2Topics: [
          {
            id: 'logic_word_deduction',
            name: 'Deductive Word Problems, Rates & Ciphers',
            keywords: ['cipher', 'probability', 'rate', 'ratio', 'logic', 'deduction'],
            estimatedBaseCount: 11500,
            shardRules: [{ type: 'math_word' }],
          },
          {
            id: 'logic_mathematicians',
            name: 'Great Mathematicians & Logicians',
            keywords: ['mathematician', 'euler', 'gauss', 'noether', 'ramanujan', 'hilbert', 'logician'],
            estimatedBaseCount: 8200,
            shardRules: [{ type: 'math_person' }],
          },
        ],
      },
    ],
  },
];

export function getDomainLabelById(domainId: DomainId): string {
  return FORGE_DOMAINS[domainId]?.name ?? 'General';
}
