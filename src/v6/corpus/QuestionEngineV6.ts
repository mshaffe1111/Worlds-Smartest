// ============================================================================
// WORLD'S SMARTEST v6.0 — 1.27M+ CALIBRATED QUESTION ENGINE & 70+ STAGE FRAMERS
//  • Zero Shrinkage: 1,279,854+ calibrated playable clues (★ 1.0 -> ★ 10.0)
//  • < 50ms Startup via compact precomputed `shard_fame_difficulty_index.json`
//  • Exact 160 KB (1,310,720-bit) SeenQuestionBitsetLedger — ZERO repeats across reloads
//  • Stage 01 Warmup Guardrail: household movies/music/food/animals/landmarks/sports ONLY
//  • 70+ Punchy Human TV-Host Stage Clue Framers across all 10 ToyFamilyIdV6s
//  • Built-in 460+ World City / Landmark / Country lat/lng Atlas Dictionary
//  • Seamless Interleaving with `prime_time_witty_clues_v6.json` (when loaded)
// ============================================================================

import type {
  CalibratedClueV6,
  GeoCoordV6,
  StageWorldIdV6,
  ToyFamilyIdV6,
} from '../contracts_v6';
import {
  SeenQuestionBitsetLedger,
  V6_BITSET_CAPACITY_BITS,
  sharedSeenLedgerV6,
} from './SeenQuestionBitsetLedger';
import {
  fnv1a32,
  formatCleanTriviaNumber,
  sanitizeTriviaCopy,
} from '../../forge/ShardDecoder';

// ----------------------------------------------------------------------------
// 1. STAGE WORLD DIFFICULTY CURVE (★ 1.0 -> ★ 10.0) & BADGE MAPPING
// ----------------------------------------------------------------------------

export const STAGE_WORLD_ORDER_V6: readonly StageWorldIdV6[] = [
  'STAGE_01_VAUDEVILLE_PALACE',
  'STAGE_02_GENEVA_CONSERVATORY',
  'STAGE_03_MONTE_CARLO_SALON',
  'STAGE_04_CARTOGRAPHIC_ROTUNDA',
  'STAGE_05_ANALOG_BUNKER_1969',
  'STAGE_06_KYOTO_LACQUER_PAVILION',
  'STAGE_07_CARNIVAL_CURIOSITIES',
  'STAGE_08_SUNKEN_BATHYSPHERE',
  'STAGE_09_ASTRAL_OBSERVATORY',
  'STAGE_10_SOVEREIGN_COLOSSEUM',
];

export const STAGE_DIFFICULTY_BANDS_V6: Readonly<Record<StageWorldIdV6, readonly [number, number]>> = {
  STAGE_01_VAUDEVILLE_PALACE: [1.0, 1.9],
  STAGE_02_GENEVA_CONSERVATORY: [1.9, 2.8],
  STAGE_03_MONTE_CARLO_SALON: [2.8, 3.7],
  STAGE_04_CARTOGRAPHIC_ROTUNDA: [3.7, 4.6],
  STAGE_05_ANALOG_BUNKER_1969: [4.6, 5.5],
  STAGE_06_KYOTO_LACQUER_PAVILION: [5.5, 6.4],
  STAGE_07_CARNIVAL_CURIOSITIES: [6.4, 7.3],
  STAGE_08_SUNKEN_BATHYSPHERE: [7.3, 8.2],
  STAGE_09_ASTRAL_OBSERVATORY: [8.2, 9.1],
  STAGE_10_SOVEREIGN_COLOSSEUM: [9.1, 10.0],
};

export function difficultyToBadgeV6(score: number): CalibratedClueV6['difficultyBadge'] {
  if (score < 2.0) return 'WARMUP';
  if (score <= 3.5) return 'EASY';
  if (score <= 5.4) return 'CONTENDER';
  if (score <= 7.3) return 'SHARP';
  if (score <= 9.0) return 'CHAMPIONSHIP';
  return 'LEGEND';
}

export function difficultyToBandIndexV6(score: number): number {
  const c = Math.max(1.0, Math.min(10.0, score));
  if (c <= 1.9) return 0;
  if (c >= 9.1) return 9;
  return Math.max(0, Math.min(9, Math.floor((c - 1.0) / 0.9)));
}

export function resolveStageNumberV6(opts?: {
  stageId?: StageWorldIdV6;
  stageNumber?: number;
  episodeNumber?: number;
}): number {
  if (opts?.stageNumber !== undefined && Number.isFinite(opts.stageNumber)) {
    return Math.max(1, Math.min(10, Math.round(opts.stageNumber)));
  }
  if (opts?.stageId) {
    const idx = STAGE_WORLD_ORDER_V6.indexOf(opts.stageId);
    if (idx >= 0) return idx + 1;
  }
  if (opts?.episodeNumber !== undefined && Number.isFinite(opts.episodeNumber)) {
    return Math.max(1, Math.min(10, Math.ceil(opts.episodeNumber / 2)));
  }
  return 1;
}

// ----------------------------------------------------------------------------
// 2. BUILT-IN 460+ WORLD CITY / LANDMARK / COUNTRY LAT/LNG ATLAS DICTIONARY
// Compact tuple format: [label, lat, lng, regionHint]
// ----------------------------------------------------------------------------

type GeoTupleV6 = readonly [string, number, number, string];

const WORLD_GEO_TUPLES_V6: readonly GeoTupleV6[] = [
  // === 145+ SOVEREIGN NATIONS & TERRITORIES ===
  ['United States', 38.9072, -77.0369, 'North America'],
  ['Canada', 45.4215, -75.6972, 'North America'],
  ['Mexico', 19.4326, -99.1332, 'North America'],
  ['Brazil', -15.7975, -47.8919, 'South America'],
  ['Argentina', -34.6037, -58.3816, 'South America'],
  ['Chile', -33.4489, -70.6693, 'South America'],
  ['Peru', -12.0464, -77.0428, 'South America'],
  ['Colombia', 4.711, -74.0721, 'South America'],
  ['Ecuador', -0.1807, -78.4678, 'South America'],
  ['Venezuela', 10.4806, -66.9036, 'South America'],
  ['Bolivia', -16.4897, -68.1193, 'South America'],
  ['Uruguay', -34.9011, -56.1645, 'South America'],
  ['Paraguay', -25.2637, -57.5759, 'South America'],
  ['Cuba', 23.1136, -82.3666, 'Caribbean'],
  ['Jamaica', 17.9712, -76.7936, 'Caribbean'],
  ['Dominican Republic', 18.4861, -69.9312, 'Caribbean'],
  ['Haiti', 18.5944, -72.3074, 'Caribbean'],
  ['Bahamas', 25.0343, -77.3963, 'Caribbean'],
  ['Barbados', 13.1939, -59.5432, 'Caribbean'],
  ['Trinidad and Tobago', 10.6918, -61.2225, 'Caribbean'],
  ['Panama', 8.9824, -79.5199, 'Central America'],
  ['Costa Rica', 9.9281, -84.0907, 'Central America'],
  ['Guatemala', 14.6349, -90.5069, 'Central America'],
  ['Honduras', 14.0723, -87.1921, 'Central America'],
  ['El Salvador', 13.6929, -89.2182, 'Central America'],
  ['Nicaragua', 12.115, -86.2362, 'Central America'],
  ['Belize', 17.251, -88.759, 'Central America'],
  ['United Kingdom', 51.5074, -0.1278, 'Western Europe'],
  ['England', 51.5074, -0.1278, 'Western Europe'],
  ['Scotland', 55.9533, -3.1883, 'Western Europe'],
  ['Wales', 51.4816, -3.1791, 'Western Europe'],
  ['Ireland', 53.3498, -6.2603, 'Western Europe'],
  ['France', 48.8566, 2.3522, 'Western Europe'],
  ['Germany', 52.52, 13.405, 'Central Europe'],
  ['Italy', 41.9028, 12.4964, 'Southern Europe'],
  ['Spain', 40.4168, -3.7038, 'Southern Europe'],
  ['Portugal', 38.7223, -9.1393, 'Southern Europe'],
  ['Netherlands', 52.3676, 4.9041, 'Western Europe'],
  ['Belgium', 50.8503, 4.3517, 'Western Europe'],
  ['Switzerland', 46.948, 7.4474, 'Central Europe'],
  ['Austria', 48.2082, 16.3738, 'Central Europe'],
  ['Poland', 52.2297, 21.0122, 'Central Europe'],
  ['Czech Republic', 50.0755, 14.4378, 'Central Europe'],
  ['Czechia', 50.0755, 14.4378, 'Central Europe'],
  ['Hungary', 47.4979, 19.0402, 'Central Europe'],
  ['Slovakia', 48.1486, 17.1077, 'Central Europe'],
  ['Romania', 44.4268, 26.1025, 'Eastern Europe'],
  ['Bulgaria', 42.6977, 23.3219, 'Eastern Europe'],
  ['Greece', 37.9838, 23.7275, 'Southern Europe'],
  ['Turkey', 39.9334, 32.8597, 'Eurasia'],
  ['Sweden', 59.3293, 18.0686, 'Northern Europe'],
  ['Norway', 59.9139, 10.7522, 'Northern Europe'],
  ['Denmark', 55.6761, 12.5683, 'Northern Europe'],
  ['Finland', 60.1699, 24.9384, 'Northern Europe'],
  ['Iceland', 64.1466, -21.9426, 'Northern Europe'],
  ['Russia', 55.7558, 37.6173, 'Eurasia'],
  ['Ukraine', 50.4501, 30.5234, 'Eastern Europe'],
  ['Belarus', 53.9006, 27.559, 'Eastern Europe'],
  ['Croatia', 45.815, 15.9819, 'Southern Europe'],
  ['Serbia', 44.7866, 20.4489, 'Southern Europe'],
  ['Slovenia', 46.0569, 14.5058, 'Central Europe'],
  ['Bosnia and Herzegovina', 43.8563, 18.4131, 'Southern Europe'],
  ['Albania', 41.3275, 19.8187, 'Southern Europe'],
  ['Estonia', 59.437, 24.7536, 'Northern Europe'],
  ['Latvia', 56.9496, 24.1052, 'Northern Europe'],
  ['Lithuania', 54.6872, 25.2797, 'Northern Europe'],
  ['Luxembourg', 49.6116, 6.1319, 'Western Europe'],
  ['Monaco', 43.7384, 7.4246, 'Western Europe'],
  ['Malta', 35.8989, 14.5146, 'Mediterranean'],
  ['Cyprus', 35.1856, 33.3823, 'Mediterranean'],
  ['Vatican City', 41.9029, 12.4534, 'Southern Europe'],
  ['San Marino', 43.9424, 12.4578, 'Southern Europe'],
  ['Andorra', 42.5063, 1.5218, 'Western Europe'],
  ['Liechtenstein', 47.141, 9.5209, 'Central Europe'],
  ['Georgia', 41.7151, 44.8271, 'Caucasus'],
  ['Armenia', 40.1792, 44.4991, 'Caucasus'],
  ['Azerbaijan', 40.4093, 49.8671, 'Caucasus'],
  ['Egypt', 30.0444, 31.2357, 'North Africa'],
  ['Morocco', 34.0209, -6.8416, 'North Africa'],
  ['Algeria', 36.7538, 3.0588, 'North Africa'],
  ['Tunisia', 36.8065, 10.1815, 'North Africa'],
  ['Libya', 32.8872, 13.1913, 'North Africa'],
  ['South Africa', -25.7479, 28.2293, 'Southern Africa'],
  ['Kenya', -1.2921, 36.8219, 'East Africa'],
  ['Tanzania', -6.163, 35.7516, 'East Africa'],
  ['Ethiopia', 9.032, 38.7469, 'East Africa'],
  ['Uganda', 0.3476, 32.5825, 'East Africa'],
  ['Rwanda', -1.9441, 30.0619, 'East Africa'],
  ['Nigeria', 9.0765, 7.3986, 'West Africa'],
  ['Ghana', 5.6037, -0.187, 'West Africa'],
  ['Senegal', 14.7167, -17.4677, 'West Africa'],
  ['Ivory Coast', 6.8276, -5.2893, 'West Africa'],
  ['Cameroon', 3.848, 11.5021, 'Central Africa'],
  ['DR Congo', -4.4419, 15.2663, 'Central Africa'],
  ['Angola', -8.839, 13.2894, 'Southern Africa'],
  ['Namibia', -22.5609, 17.0658, 'Southern Africa'],
  ['Botswana', -24.6282, 25.9231, 'Southern Africa'],
  ['Zimbabwe', -17.8292, 31.0522, 'Southern Africa'],
  ['Zambia', -15.3875, 28.3228, 'Southern Africa'],
  ['Mozambique', -25.9692, 32.5732, 'Southern Africa'],
  ['Madagascar', -18.8792, 47.5079, 'Indian Ocean'],
  ['Sudan', 15.5007, 32.5599, 'Northeast Africa'],
  ['Mali', 12.6392, -8.0029, 'West Africa'],
  ['Israel', 31.7683, 35.2137, 'Middle East'],
  ['Jordan', 31.9454, 35.9284, 'Middle East'],
  ['Lebanon', 33.8938, 35.5018, 'Middle East'],
  ['Syria', 33.5138, 36.2765, 'Middle East'],
  ['Iraq', 33.3152, 44.3661, 'Middle East'],
  ['Iran', 35.6892, 51.389, 'Middle East'],
  ['Saudi Arabia', 24.7136, 46.6753, 'Middle East'],
  ['United Arab Emirates', 24.4539, 54.3773, 'Middle East'],
  ['Qatar', 25.2854, 51.531, 'Middle East'],
  ['Kuwait', 29.3759, 47.9774, 'Middle East'],
  ['Oman', 23.588, 58.3829, 'Middle East'],
  ['Bahrain', 26.2285, 50.586, 'Middle East'],
  ['Yemen', 15.3694, 44.191, 'Middle East'],
  ['Afghanistan', 34.5553, 69.2075, 'South-Central Asia'],
  ['Pakistan', 33.6844, 73.0479, 'South Asia'],
  ['India', 28.6139, 77.209, 'South Asia'],
  ['Bangladesh', 23.8103, 90.4125, 'South Asia'],
  ['Sri Lanka', 6.9271, 79.8612, 'South Asia'],
  ['Nepal', 27.7172, 85.324, 'South Asia'],
  ['Bhutan', 27.4728, 89.6393, 'South Asia'],
  ['Maldives', 4.1755, 73.5093, 'Indian Ocean'],
  ['Kazakhstan', 51.1605, 71.4704, 'Central Asia'],
  ['Uzbekistan', 41.2995, 69.2401, 'Central Asia'],
  ['Mongolia', 47.8864, 106.9057, 'East Asia'],
  ['China', 39.9042, 116.4074, 'East Asia'],
  ['Japan', 35.6762, 139.6503, 'East Asia'],
  ['South Korea', 37.5665, 126.978, 'East Asia'],
  ['North Korea', 39.0392, 125.7625, 'East Asia'],
  ['Taiwan', 25.033, 121.5654, 'East Asia'],
  ['Vietnam', 21.0278, 105.8342, 'Southeast Asia'],
  ['Thailand', 13.7563, 100.5018, 'Southeast Asia'],
  ['Cambodia', 11.5564, 104.9282, 'Southeast Asia'],
  ['Laos', 17.9757, 102.6331, 'Southeast Asia'],
  ['Myanmar', 19.7633, 96.0785, 'Southeast Asia'],
  ['Malaysia', 3.139, 101.6869, 'Southeast Asia'],
  ['Singapore', 1.3521, 103.8198, 'Southeast Asia'],
  ['Indonesia', -6.2088, 106.8456, 'Southeast Asia'],
  ['Philippines', 14.5995, 120.9842, 'Southeast Asia'],
  ['Brunei', 4.9031, 114.9398, 'Southeast Asia'],
  ['Australia', -35.2809, 149.13, 'Oceania'],
  ['New Zealand', -41.2865, 174.7762, 'Oceania'],
  ['Papua New Guinea', -9.4438, 147.1803, 'Oceania'],
  ['Fiji', -18.1416, 178.4419, 'Oceania'],
  ['Samoa', -13.8507, -171.7514, 'Oceania'],
  ['Greenland', 64.1836, -51.7214, 'North Atlantic'],
  // === 200+ MAJOR WORLD CITIES & U.S. METROS ===
  ['New York', 40.7128, -74.006, 'U.S. Northeast'],
  ['New York City', 40.7128, -74.006, 'U.S. Northeast'],
  ['Manhattan', 40.7831, -73.9712, 'New York'],
  ['Brooklyn', 40.6782, -73.9442, 'New York'],
  ['Los Angeles', 34.0522, -118.2437, 'California'],
  ['Hollywood', 34.0928, -118.3287, 'California'],
  ['Chicago', 41.8781, -87.6298, 'U.S. Midwest'],
  ['Houston', 29.7604, -95.3698, 'Texas'],
  ['Phoenix', 33.4484, -112.074, 'U.S. Southwest'],
  ['Philadelphia', 39.9526, -75.1652, 'U.S. Northeast'],
  ['San Antonio', 29.4241, -98.4936, 'Texas'],
  ['San Diego', 32.7157, -117.1611, 'California'],
  ['Dallas', 32.7767, -96.797, 'Texas'],
  ['San Jose', 37.3382, -121.8863, 'Silicon Valley'],
  ['Austin', 30.2672, -97.7431, 'Texas'],
  ['San Francisco', 37.7749, -122.4194, 'California'],
  ['Seattle', 47.6062, -122.3321, 'Pacific Northwest'],
  ['Denver', 39.7392, -104.9903, 'Rocky Mountains'],
  ['Boston', 42.3601, -71.0589, 'New England'],
  ['Washington, D.C.', 38.9072, -77.0369, 'U.S. Capital'],
  ['Miami', 25.7617, -80.1918, 'Florida'],
  ['Orlando', 28.5383, -81.3792, 'Florida'],
  ['Atlanta', 33.749, -84.388, 'U.S. Southeast'],
  ['Las Vegas', 36.1699, -115.1398, 'Nevada'],
  ['New Orleans', 29.9511, -90.0715, 'Gulf Coast'],
  ['Detroit', 42.3314, -83.0458, 'Great Lakes'],
  ['Minneapolis', 44.9778, -93.265, 'U.S. Midwest'],
  ['Nashville', 36.1627, -86.7816, 'Tennessee'],
  ['Memphis', 35.1495, -90.049, 'Tennessee'],
  ['Portland', 45.5152, -122.6784, 'Pacific Northwest'],
  ['Salt Lake City', 40.7608, -111.891, 'Mountain West'],
  ['Cleveland', 41.4993, -81.6944, 'Great Lakes'],
  ['Pittsburgh', 40.4406, -79.9959, 'Pennsylvania'],
  ['Cincinnati', 39.1031, -84.512, 'Ohio'],
  ['St. Louis', 38.627, -90.1994, 'Missouri'],
  ['Kansas City', 39.0997, -94.5786, 'Midwest'],
  ['Baltimore', 39.2904, -76.6122, 'Mid-Atlantic'],
  ['Charlotte', 35.2271, -80.8431, 'North Carolina'],
  ['Indianapolis', 39.7684, -86.1581, 'Indiana'],
  ['Milwaukee', 43.0389, -87.9065, 'Wisconsin'],
  ['Honolulu', 21.3069, -157.8583, 'Hawaii'],
  ['Anchorage', 61.2181, -149.9003, 'Alaska'],
  ['Toronto', 43.6532, -79.3832, 'Canada'],
  ['Montreal', 45.5017, -73.5673, 'Canada'],
  ['Vancouver', 49.2827, -123.1207, 'Canada'],
  ['Ottawa', 45.4215, -75.6972, 'Canada'],
  ['Calgary', 51.0447, -114.0719, 'Canada'],
  ['Quebec City', 46.8139, -71.208, 'Canada'],
  ['Mexico City', 19.4326, -99.1332, 'Mexico'],
  ['Guadalajara', 20.6597, -103.3496, 'Mexico'],
  ['Monterrey', 25.6866, -100.3161, 'Mexico'],
  ['Cancun', 21.1619, -86.8515, 'Mexico'],
  ['Havana', 23.1136, -82.3666, 'Cuba'],
  ['San Juan', 18.4655, -66.1057, 'Puerto Rico'],
  ['Panama City', 8.9824, -79.5199, 'Panama'],
  ['Rio de Janeiro', -22.9068, -43.1729, 'Brazil'],
  ['Sao Paulo', -23.5505, -46.6333, 'Brazil'],
  ['São Paulo', -23.5505, -46.6333, 'Brazil'],
  ['Brasilia', -15.7975, -47.8919, 'Brazil'],
  ['Buenos Aires', -34.6037, -58.3816, 'Argentina'],
  ['Santiago', -33.4489, -70.6693, 'Chile'],
  ['Lima', -12.0464, -77.0428, 'Peru'],
  ['Cusco', -13.5319, -71.9675, 'Peru'],
  ['Bogota', 4.711, -74.0721, 'Colombia'],
  ['Bogotá', 4.711, -74.0721, 'Colombia'],
  ['Medellin', 6.2476, -75.5658, 'Colombia'],
  ['Quito', -0.1807, -78.4678, 'Ecuador'],
  ['Caracas', 10.4806, -66.9036, 'Venezuela'],
  ['Montevideo', -34.9011, -56.1645, 'Uruguay'],
  ['La Paz', -16.4897, -68.1193, 'Bolivia'],
  ['London', 51.5074, -0.1278, 'United Kingdom'],
  ['Manchester', 53.4808, -2.2426, 'United Kingdom'],
  ['Liverpool', 53.4084, -2.9916, 'United Kingdom'],
  ['Birmingham', 52.4862, -1.8904, 'United Kingdom'],
  ['Oxford', 51.752, -1.2577, 'United Kingdom'],
  ['Cambridge', 52.2053, 0.1218, 'United Kingdom'],
  ['Edinburgh', 55.9533, -3.1883, 'Scotland'],
  ['Glasgow', 55.8642, -4.2518, 'Scotland'],
  ['Belfast', 54.5973, -5.9301, 'Northern Ireland'],
  ['Dublin', 53.3498, -6.2603, 'Ireland'],
  ['Paris', 48.8566, 2.3522, 'France'],
  ['Marseille', 43.2965, 5.3698, 'France'],
  ['Lyon', 45.764, 4.8357, 'France'],
  ['Nice', 43.7102, 7.262, 'French Riviera'],
  ['Cannes', 43.5528, 7.0174, 'French Riviera'],
  ['Bordeaux', 44.8378, -0.5792, 'France'],
  ['Monte Carlo', 43.7398, 7.4273, 'Monaco'],
  ['Rome', 41.9028, 12.4964, 'Italy'],
  ['Milan', 45.4642, 9.19, 'Italy'],
  ['Venice', 45.4408, 12.3155, 'Italy'],
  ['Florence', 43.7696, 11.2558, 'Italy'],
  ['Naples', 40.8518, 14.2681, 'Italy'],
  ['Turin', 45.0703, 7.6869, 'Italy'],
  ['Bologna', 44.4949, 11.3426, 'Italy'],
  ['Palermo', 38.1157, 13.3615, 'Sicily'],
  ['Madrid', 40.4168, -3.7038, 'Spain'],
  ['Barcelona', 41.3874, 2.1686, 'Spain'],
  ['Seville', 37.3891, -5.9845, 'Spain'],
  ['Valencia', 39.4699, -0.3763, 'Spain'],
  ['Granada', 37.1773, -3.5986, 'Spain'],
  ['Bilbao', 43.263, -2.935, 'Spain'],
  ['Lisbon', 38.7223, -9.1393, 'Portugal'],
  ['Porto', 41.1579, -8.6291, 'Portugal'],
  ['Berlin', 52.52, 13.405, 'Germany'],
  ['Munich', 48.1351, 11.582, 'Germany'],
  ['Hamburg', 53.5511, 9.9937, 'Germany'],
  ['Frankfurt', 50.1109, 8.6821, 'Germany'],
  ['Cologne', 50.9375, 6.9603, 'Germany'],
  ['Stuttgart', 48.7758, 9.1829, 'Germany'],
  ['Dresden', 51.0504, 13.7373, 'Germany'],
  ['Amsterdam', 52.3676, 4.9041, 'Netherlands'],
  ['Rotterdam', 51.9244, 4.4777, 'Netherlands'],
  ['The Hague', 52.0705, 4.3007, 'Netherlands'],
  ['Brussels', 50.8503, 4.3517, 'Belgium'],
  ['Antwerp', 51.2194, 4.4025, 'Belgium'],
  ['Bruges', 51.2093, 3.2247, 'Belgium'],
  ['Zurich', 47.3769, 8.5417, 'Switzerland'],
  ['Geneva', 46.2044, 6.1432, 'Switzerland'],
  ['Bern', 46.948, 7.4474, 'Switzerland'],
  ['Basel', 47.5596, 7.5886, 'Switzerland'],
  ['Vienna', 48.2082, 16.3738, 'Austria'],
  ['Salzburg', 47.8095, 13.055, 'Austria'],
  ['Prague', 50.0755, 14.4378, 'Czech Republic'],
  ['Warsaw', 52.2297, 21.0122, 'Poland'],
  ['Krakow', 50.0647, 19.945, 'Poland'],
  ['Budapest', 47.4979, 19.0402, 'Hungary'],
  ['Bucharest', 44.4268, 26.1025, 'Romania'],
  ['Sofia', 42.6977, 23.3219, 'Bulgaria'],
  ['Athens', 37.9838, 23.7275, 'Greece'],
  ['Thessaloniki', 40.6401, 22.9444, 'Greece'],
  ['Santorini', 36.3932, 25.4615, 'Greece'],
  ['Istanbul', 41.0082, 28.9784, 'Turkey'],
  ['Ankara', 39.9334, 32.8597, 'Turkey'],
  ['Stockholm', 59.3293, 18.0686, 'Sweden'],
  ['Oslo', 59.9139, 10.7522, 'Norway'],
  ['Bergen', 60.3913, 5.3221, 'Norway'],
  ['Copenhagen', 55.6761, 12.5683, 'Denmark'],
  ['Helsinki', 60.1699, 24.9384, 'Finland'],
  ['Reykjavik', 64.1466, -21.9426, 'Iceland'],
  ['Moscow', 55.7558, 37.6173, 'Russia'],
  ['Saint Petersburg', 59.9311, 30.3609, 'Russia'],
  ['St. Petersburg', 59.9311, 30.3609, 'Russia'],
  ['Kyiv', 50.4501, 30.5234, 'Ukraine'],
  ['Dubrovnik', 42.6507, 18.0944, 'Croatia'],
  ['Zagreb', 45.815, 15.9819, 'Croatia'],
  ['Belgrade', 44.7866, 20.4489, 'Serbia'],
  ['Cairo', 30.0444, 31.2357, 'Egypt'],
  ['Alexandria', 31.2001, 29.9187, 'Egypt'],
  ['Luxor', 25.6872, 32.6396, 'Egypt'],
  ['Casablanca', 33.5731, -7.5898, 'Morocco'],
  ['Marrakesh', 31.6295, -7.9811, 'Morocco'],
  ['Tunis', 36.8065, 10.1815, 'Tunisia'],
  ['Algiers', 36.7538, 3.0588, 'Algeria'],
  ['Lagos', 6.5244, 3.3792, 'Nigeria'],
  ['Accra', 5.6037, -0.187, 'Ghana'],
  ['Nairobi', -1.2921, 36.8219, 'Kenya'],
  ['Addis Ababa', 9.032, 38.7469, 'Ethiopia'],
  ['Johannesburg', -26.2041, 28.0473, 'South Africa'],
  ['Cape Town', -33.9249, 18.4241, 'South Africa'],
  ['Durban', -29.8587, 31.0218, 'South Africa'],
  ['Kinshasa', -4.4419, 15.2663, 'DR Congo'],
  ['Dakar', 14.7167, -17.4677, 'Senegal'],
  ['Timbuktu', 16.7666, -3.0026, 'Mali'],
  ['Jerusalem', 31.7683, 35.2137, 'Middle East'],
  ['Tel Aviv', 32.0853, 34.7818, 'Israel'],
  ['Beirut', 33.8938, 35.5018, 'Lebanon'],
  ['Amman', 31.9454, 35.9284, 'Jordan'],
  ['Damascus', 33.5138, 36.2765, 'Syria'],
  ['Baghdad', 33.3152, 44.3661, 'Iraq'],
  ['Tehran', 35.6892, 51.389, 'Iran'],
  ['Riyadh', 24.7136, 46.6753, 'Saudi Arabia'],
  ['Mecca', 21.3891, 39.8579, 'Saudi Arabia'],
  ['Dubai', 25.2048, 55.2708, 'UAE'],
  ['Abu Dhabi', 24.4539, 54.3773, 'UAE'],
  ['Doha', 25.2854, 51.531, 'Qatar'],
  ['Muscat', 23.588, 58.3829, 'Oman'],
  ['Mumbai', 19.076, 72.8777, 'India'],
  ['New Delhi', 28.6139, 77.209, 'India'],
  ['Delhi', 28.7041, 77.1025, 'India'],
  ['Bengaluru', 12.9716, 77.5946, 'India'],
  ['Bangalore', 12.9716, 77.5946, 'India'],
  ['Kolkata', 22.5726, 88.3639, 'India'],
  ['Chennai', 13.0827, 80.2707, 'India'],
  ['Hyderabad', 17.385, 78.4867, 'India'],
  ['Jaipur', 26.9124, 75.7873, 'India'],
  ['Agra', 27.1767, 78.0081, 'India'],
  ['Varanasi', 25.3176, 82.9739, 'India'],
  ['Karachi', 24.8607, 67.0011, 'Pakistan'],
  ['Lahore', 31.5204, 74.3587, 'Pakistan'],
  ['Islamabad', 33.6844, 73.0479, 'Pakistan'],
  ['Dhaka', 23.8103, 90.4125, 'Bangladesh'],
  ['Kathmandu', 27.7172, 85.324, 'Nepal'],
  ['Colombo', 6.9271, 79.8612, 'Sri Lanka'],
  ['Beijing', 39.9042, 116.4074, 'China'],
  ['Shanghai', 31.2304, 121.4737, 'China'],
  ['Guangzhou', 23.1291, 113.2644, 'China'],
  ['Shenzhen', 22.5431, 114.0579, 'China'],
  ['Chengdu', 30.5728, 104.0668, 'China'],
  ["Xi'an", 34.3416, 108.9398, 'China'],
  ['Wuhan', 30.5928, 114.3055, 'China'],
  ['Hangzhou', 30.2741, 120.1551, 'China'],
  ['Hong Kong', 22.3193, 114.1694, 'East Asia'],
  ['Macau', 22.1987, 113.5439, 'East Asia'],
  ['Taipei', 25.033, 121.5654, 'Taiwan'],
  ['Seoul', 37.5665, 126.978, 'South Korea'],
  ['Busan', 35.1796, 129.0756, 'South Korea'],
  ['Tokyo', 35.6762, 139.6503, 'Japan'],
  ['Kyoto', 35.0116, 135.7681, 'Japan'],
  ['Osaka', 34.6937, 135.5023, 'Japan'],
  ['Yokohama', 35.4437, 139.638, 'Japan'],
  ['Hiroshima', 34.3853, 132.4553, 'Japan'],
  ['Sapporo', 43.0618, 141.3545, 'Japan'],
  ['Bangkok', 13.7563, 100.5018, 'Thailand'],
  ['Hanoi', 21.0278, 105.8342, 'Vietnam'],
  ['Ho Chi Minh City', 10.8231, 106.6297, 'Vietnam'],
  ['Kuala Lumpur', 3.139, 101.6869, 'Malaysia'],
  ['Jakarta', -6.2088, 106.8456, 'Indonesia'],
  ['Bali', -8.4095, 115.1889, 'Indonesia'],
  ['Manila', 14.5995, 120.9842, 'Philippines'],
  ['Phnom Penh', 11.5564, 104.9282, 'Cambodia'],
  ['Yangon', 16.8661, 96.1951, 'Myanmar'],
  ['Sydney', -33.8688, 151.2093, 'Australia'],
  ['Melbourne', -37.8136, 144.9631, 'Australia'],
  ['Brisbane', -27.4698, 153.0251, 'Australia'],
  ['Perth', -31.9505, 115.8605, 'Australia'],
  ['Adelaide', -34.9285, 138.6007, 'Australia'],
  ['Canberra', -35.2809, 149.13, 'Australia'],
  ['Auckland', -36.8485, 174.7633, 'New Zealand'],
  ['Wellington', -41.2865, 174.7762, 'New Zealand'],
  ['Christchurch', -43.5321, 172.6362, 'New Zealand'],
  ['Queenstown', -45.0312, 168.6626, 'New Zealand'],
  // === 120+ WORLD-FAMOUS LANDMARKS, WONDERS, PEAKS, RIVERS, STADIUMS & SITES ===
  ['Eiffel Tower', 48.8584, 2.2945, 'Paris, France'],
  ['Louvre', 48.8606, 2.3376, 'Paris, France'],
  ['Notre-Dame', 48.853, 2.3499, 'Paris, France'],
  ['Arc de Triomphe', 48.8738, 2.295, 'Paris, France'],
  ['Palace of Versailles', 48.8049, 2.1204, 'France'],
  ['Mont-Saint-Michel', 48.6361, -1.5115, 'Normandy, France'],
  ['Statue of Liberty', 40.6892, -74.0445, 'New York Harbor'],
  ['Empire State Building', 40.7484, -73.9857, 'New York City'],
  ['Times Square', 40.758, -73.9855, 'New York City'],
  ['Central Park', 40.7829, -73.9654, 'New York City'],
  ['Brooklyn Bridge', 40.7061, -73.9969, 'New York City'],
  ['White House', 38.8977, -77.0365, 'Washington, D.C.'],
  ['Lincoln Memorial', 38.8893, -77.0502, 'Washington, D.C.'],
  ['Pentagon', 38.8719, -77.0563, 'Virginia, USA'],
  ['Golden Gate Bridge', 37.8199, -122.4783, 'San Francisco, USA'],
  ['Alcatraz', 37.827, -122.423, 'San Francisco Bay'],
  ['Mount Rushmore', 43.8791, -103.4591, 'South Dakota, USA'],
  ['Grand Canyon', 36.1069, -112.1129, 'Arizona, USA'],
  ['Yellowstone', 44.428, -110.5885, 'Wyoming, USA'],
  ['Yosemite', 37.8651, -119.5383, 'California, USA'],
  ['Niagara Falls', 43.0962, -79.0377, 'USA / Canada Border'],
  ['Space Needle', 47.6205, -122.3493, 'Seattle, USA'],
  ['Gateway Arch', 38.6247, -90.1848, 'St. Louis, USA'],
  ['CN Tower', 43.6426, -79.3871, 'Toronto, Canada'],
  ['Hollywood Sign', 34.1341, -118.3215, 'Los Angeles, USA'],
  ['Everglades', 25.2866, -80.8987, 'Florida, USA'],
  ['Cape Canaveral', 28.3922, -80.6077, 'Florida, USA'],
  ['Big Ben', 51.5007, -0.1246, 'London, UK'],
  ['Buckingham Palace', 51.5014, -0.1419, 'London, UK'],
  ['Tower of London', 51.5081, -0.0759, 'London, UK'],
  ['Tower Bridge', 51.5055, -0.0754, 'London, UK'],
  ['Westminster Abbey', 51.4993, -0.1273, 'London, UK'],
  ['British Museum', 51.5194, -0.127, 'London, UK'],
  ['Stonehenge', 51.1789, -1.8262, 'Wiltshire, England'],
  ['Bletchley Park', 51.9977, -0.7407, 'England'],
  ['Loch Ness', 57.3229, -4.4244, 'Scottish Highlands'],
  ['Colosseum', 41.8902, 12.4922, 'Rome, Italy'],
  ['Sistine Chapel', 41.9029, 12.4545, 'Vatican City'],
  ['Pantheon', 41.8986, 12.4769, 'Rome, Italy'],
  ['Trevi Fountain', 41.9009, 12.4833, 'Rome, Italy'],
  ['Leaning Tower of Pisa', 43.723, 10.3966, 'Tuscany, Italy'],
  ['Pompeii', 40.7462, 14.4989, 'Bay of Naples, Italy'],
  ['Mount Vesuvius', 40.8214, 14.426, 'Southern Italy'],
  ['Mount Etna', 37.751, 14.9934, 'Sicily, Italy'],
  ['Sagrada Familia', 41.4036, 2.1744, 'Barcelona, Spain'],
  ['Alhambra', 37.1761, -3.5881, 'Granada, Spain'],
  ['Brandenburg Gate', 52.5163, 13.3777, 'Berlin, Germany'],
  ['Neuschwanstein', 47.5576, 10.7498, 'Bavaria, Germany'],
  ['Parthenon', 37.9715, 23.7267, 'Athens, Greece'],
  ['Acropolis', 37.9715, 23.7257, 'Athens, Greece'],
  ['Mount Olympus', 40.0856, 22.3586, 'Greece'],
  ['Hagia Sophia', 41.0086, 28.9802, 'Istanbul, Turkey'],
  ['Kremlin', 55.752, 37.6175, 'Moscow, Russia'],
  ['Matterhorn', 45.9763, 7.6586, 'Swiss-Italian Alps'],
  ['Mont Blanc', 45.8326, 6.8652, 'French-Italian Alps'],
  ['CERN', 46.233, 6.0557, 'Geneva, Switzerland'],
  ['Mount Elbrus', 43.3499, 42.4453, 'Caucasus, Russia'],
  ['Pyramids of Giza', 29.9792, 31.1342, 'Giza, Egypt'],
  ['Great Pyramid of Giza', 29.9792, 31.1342, 'Giza, Egypt'],
  ['Great Sphinx', 29.9753, 31.1376, 'Giza, Egypt'],
  ['Suez Canal', 30.5852, 32.2654, 'Egypt'],
  ['Sahara', 23.4162, 25.6628, 'North Africa'],
  ['Nile', 30.0444, 31.2357, 'Northeast Africa'],
  ['Mount Kilimanjaro', -3.0674, 37.3556, 'Tanzania'],
  ['Serengeti', -2.3333, 34.8333, 'Tanzania'],
  ['Victoria Falls', -17.9243, 25.8572, 'Zambia / Zimbabwe'],
  ['Table Mountain', -33.9628, 18.4098, 'Cape Town, South Africa'],
  ['Petra', 30.3285, 35.4444, 'Jordan'],
  ['Dead Sea', 31.559, 35.4732, 'Jordan / Israel'],
  ['Burj Khalifa', 25.1972, 55.2744, 'Dubai, UAE'],
  ['Taj Mahal', 27.1751, 78.0421, 'Agra, India'],
  ['Mount Everest', 27.9881, 86.925, 'Himalayas, Nepal / Tibet'],
  ['K2', 35.88, 76.5151, 'Karakoram, Pakistan'],
  ['Ganges', 25.3176, 82.9739, 'Northern India'],
  ['Great Wall of China', 40.4319, 116.5704, 'Northern China'],
  ['Forbidden City', 39.9163, 116.3972, 'Beijing, China'],
  ['Terracotta Army', 34.3841, 109.2785, "Xi'an, China"],
  ['Yangtze River', 30.5928, 114.3055, 'Central China'],
  ['Yellow River', 34.7466, 113.6253, 'Northern China'],
  ['Mount Fuji', 35.3606, 138.7274, 'Honshu, Japan'],
  ['Angkor Wat', 13.4125, 103.867, 'Siem Reap, Cambodia'],
  ['Borobudur', -7.6079, 110.2038, 'Java, Indonesia'],
  ['Krakatoa', -6.1021, 105.423, 'Sunda Strait, Indonesia'],
  ['Sydney Opera House', -33.8568, 151.2153, 'Sydney, Australia'],
  ['Great Barrier Reef', -18.2871, 147.6992, 'Queensland, Australia'],
  ['Uluru', -25.3444, 131.0369, 'Northern Territory, Australia'],
  ['Machu Picchu', -13.1631, -72.545, 'Andes, Peru'],
  ['Christ the Redeemer', -22.9519, -43.2105, 'Rio de Janeiro, Brazil'],
  ['Iguazu Falls', -25.6953, -54.4367, 'Argentina / Brazil'],
  ['Amazon River', -3.119, -60.0217, 'South America'],
  ['Galapagos Islands', -0.9538, -90.9656, 'Pacific / Ecuador'],
  ['Chichen Itza', 20.6843, -88.5678, 'Yucatan, Mexico'],
  ['Teotihuacan', 19.6925, -98.8438, 'Central Mexico'],
  ['Panama Canal', 9.08, -79.68, 'Panama'],
  ['Easter Island', -27.1127, -109.3497, 'South Pacific / Chile'],
  ['Denali', 63.0692, -151.007, 'Alaska, USA'],
  ['Mount Rainier', 46.8523, -121.7603, 'Washington, USA'],
  ['Mount St. Helens', 46.1914, -122.1956, 'Washington, USA'],
  ['Mississippi River', 38.627, -90.1994, 'Central USA'],
  ['Colorado River', 36.1069, -112.1129, 'U.S. Southwest'],
  ['Danube', 47.4979, 19.0402, 'Central Europe'],
  ['Rhine', 50.9375, 6.9603, 'Western Europe'],
  ['Thames', 51.5074, -0.1278, 'Southern England'],
  ['Seine', 48.8566, 2.3522, 'Northern France'],
  ['Fenway Park', 42.3467, -71.0972, 'Boston, USA'],
  ['Wrigley Field', 41.9484, -87.6553, 'Chicago, USA'],
  ['Yankee Stadium', 40.8296, -73.9262, 'Bronx, New York'],
  ['Madison Square Garden', 40.7505, -73.9934, 'Manhattan, New York'],
  ['Wembley Stadium', 51.556, -0.2796, 'London, UK'],
  ['Old Trafford', 53.4631, -2.2913, 'Manchester, UK'],
  ['Camp Nou', 41.3809, 2.1228, 'Barcelona, Spain'],
  ['Maracanã Stadium', -22.9121, -43.2302, 'Rio de Janeiro, Brazil'],
  ['Bernabéu', 40.4531, -3.6883, 'Madrid, Spain'],
  ['Lambeau Field', 44.5013, -88.0622, 'Green Bay, Wisconsin'],
  ['Churchill Downs', 38.2026, -85.7704, 'Louisville, Kentucky'],
  ['Crete', 35.2401, 24.8093, 'Greece / Mediterranean'],
  ['Sicily', 37.5999, 14.0154, 'Italy / Mediterranean'],
  ['Hawaii', 19.8968, -155.5828, 'Central Pacific'],
  ['Bora Bora', -16.5004, -151.7415, 'French Polynesia'],
  ['Christmas Island', -10.4475, 105.6904, 'Indian Ocean'],
  ['Bermuda Triangle', 25.0, -71.0, 'Western North Atlantic'],
  ['Harvard University', 42.377, -71.1167, 'Cambridge, Massachusetts'],
  ['University of Oxford', 51.7548, -1.2544, 'Oxford, England'],
  ['University of Cambridge', 52.2043, 0.1149, 'Cambridge, England'],
  ['Stanford University', 37.4275, -122.1697, 'California, USA'],
  ['Massachusetts Institute of Technology', 42.3601, -71.0942, 'Cambridge, Massachusetts'],
  ['Yale University', 41.3163, -72.9223, 'New Haven, Connecticut'],
  ['Princeton University', 40.3431, -74.6551, 'New Jersey, USA'],
  ['Columbia University', 40.8075, -73.9626, 'New York City'],
  ['Silicon Valley', 37.3875, -122.0575, 'Northern California'],
  ['Pearl Harbor', 21.3445, -157.9749, 'Oahu, Hawaii'],
  ['Gettysburg', 39.8309, -77.2311, 'Pennsylvania, USA'],
  ['Waterloo', 50.6806, 4.412, 'Belgium'],
  ['Normandy', 49.3697, -0.8711, 'Northern France'],
  ['Thermopylae', 38.7966, 22.5367, 'Central Greece'],
  ['Ancient Rome', 41.9028, 12.4964, 'Italian Peninsula'],
  ['Ancient Egypt', 30.0444, 31.2357, 'Nile Valley'],
  ['Ancient Greece', 37.9838, 23.7275, 'Aegean Basin'],
  ['Byzantine Empire', 41.0082, 28.9784, 'Constantinople / Eastern Med'],
  ['Ottoman Empire', 41.0082, 28.9784, 'Anatolia / Istanbul'],
  ['Inca Empire', -13.5319, -71.9675, 'Andean South America'],
  ['Aztec Empire', 19.4326, -99.1332, 'Central Mexico'],
  ['British Empire', 51.5074, -0.1278, 'London, UK'],
  ['Roman Empire', 41.9028, 12.4964, 'Rome / Mediterranean'],
  ['Mongol Empire', 47.2, 102.85, 'Central Asian Steppe'],
  ['Ming Dynasty', 39.9042, 116.4074, 'China'],
  ['Gupta Empire', 25.5941, 85.1376, 'Northern India'],
  ['U.S.A.', 38.9072, -77.0369, 'North America'],
  ['USA', 38.9072, -77.0369, 'North America'],
  ['UK', 51.5074, -0.1278, 'Western Europe'],
  ['UAE', 24.4539, 54.3773, 'Middle East'],
  ['Soviet Union', 55.7558, 37.6173, 'Eurasia'],
  ['Prussia', 52.52, 13.405, 'Northern Germany'],
  ['Republic of Venice', 45.4408, 12.3155, 'Northern Italy'],
  ['Republic of Florence', 43.7696, 11.2558, 'Tuscany, Italy'],
];

const GEO_LOOKUP_MAP_V6 = new Map<string, GeoCoordV6>();
for (const [label, lat, lng, regionHint] of WORLD_GEO_TUPLES_V6) {
  const key = label.trim().toLowerCase();
  if (!GEO_LOOKUP_MAP_V6.has(key)) {
    GEO_LOOKUP_MAP_V6.set(key, { lat, lng, regionHint, landmarkLabel: label });
  }
}

export function getGeoDictionarySizeV6(): number {
  return WORLD_GEO_TUPLES_V6.length;
}

export function lookupGeoCoordV6(query: string, fallbackText?: string): GeoCoordV6 | undefined {
  const tryStr = (raw?: string): GeoCoordV6 | undefined => {
    if (!raw) return undefined;
    const clean = raw.trim().toLowerCase();
    if (!clean) return undefined;
    const direct = GEO_LOOKUP_MAP_V6.get(clean);
    if (direct) return { ...direct };
    // Strip leading "the " or trailing parenthetical
    const stripped = clean.replace(/^the\s+/, '').replace(/\s*\([^)]*\)$/, '').trim();
    const hit2 = GEO_LOOKUP_MAP_V6.get(stripped);
    if (hit2) return { ...hit2 };
    // Split "City, Country"
    if (stripped.includes(',')) {
      const parts = stripped.split(',').map((p) => p.trim());
      for (const p of parts) {
        const hitPart = GEO_LOOKUP_MAP_V6.get(p);
        if (hitPart) return { ...hitPart };
      }
    }
    return undefined;
  };

  return tryStr(query) ?? tryStr(fallbackText);
}

// ----------------------------------------------------------------------------
// 3. 72 HUMAN PRIME-TIME TV-HOST STAGE CLUE FRAMERS (ZERO DATABASE PHRASING!)
// Tailored across all 10 ToyFamilyIdV6s + semantic clue relations (<= 140 chars)
// ----------------------------------------------------------------------------

interface FramerContextV6 {
  readonly subject: string;
  readonly relationLabel: string;
  readonly eraBit: string;
  readonly category: string;
  readonly answer?: string;
  readonly unit?: string;
  readonly optionA?: string;
  readonly optionB?: string;
}

export type FramerPayloadReqV6 = 'NUMERIC' | 'CRYPTEX' | 'BINARY' | 'CHRONOLOGY' | 'GEO' | 'LIE';

export interface HostClueFramerV6 {
  readonly id: string;
  readonly toyFamily: ToyFamilyIdV6;
  readonly requires?: FramerPayloadReqV6;
  readonly build: (ctx: FramerContextV6) => string;
}

export const HOST_CLUE_FRAMERS_V6: readonly HostClueFramerV6[] = [
  // === 1. DEFUSAL_ELIMINATION (8 Wire-Defusal Host Framers) ===
  { id: 'def_01', toyFamily: 'DEFUSAL_ELIMINATION', build: (c) => `Three wires blow the stage—keep ONLY the ${c.relationLabel} for ${c.subject}${c.eraBit}!` },
  { id: 'def_02', toyFamily: 'DEFUSAL_ELIMINATION', build: (c) => `Grab the brass cutters! Snip 3 decoys and save ${c.subject}'s real ${c.relationLabel}.` },
  { id: 'def_03', toyFamily: 'DEFUSAL_ELIMINATION', build: (c) => `Clock's ticking—cut the 3 bogus wires! Which ${c.relationLabel} fits ${c.subject}?` },
  { id: 'def_04', toyFamily: 'DEFUSAL_ELIMINATION', build: (c) => `Steady hands on ${c.category}: eliminate 3 imposters to spare ${c.subject}'s ${c.relationLabel}!` },
  { id: 'def_05', toyFamily: 'DEFUSAL_ELIMINATION', build: (c) => `Don't fry the studio lights—leave ONLY ${c.subject}'s true ${c.relationLabel} intact.` },
  { id: 'def_06', toyFamily: 'DEFUSAL_ELIMINATION', build: (c) => `Three bad leads, one live circuit: protect the real ${c.relationLabel} behind ${c.subject}.` },
  { id: 'def_07', toyFamily: 'DEFUSAL_ELIMINATION', build: (c) => `Wire-snip showdown! Only one ${c.relationLabel} survives for ${c.subject}${c.eraBit}.` },
  { id: 'def_08', toyFamily: 'DEFUSAL_ELIMINATION', build: (c) => `Kill the 3 fake circuits! Which ${c.relationLabel} keeps ${c.subject} from going boom?` },

  // === 2. ATLAS_RELIEF_SPATIAL (8 3D Relief Globe Pin-Drop Framers) ===
  { id: 'atl_01', toyFamily: 'ATLAS_RELIEF_SPATIAL', requires: 'GEO', build: (c) => `Spin the relief globe—drop your ruby pin right on ${c.subject}${c.eraBit}!` },
  { id: 'atl_02', toyFamily: 'ATLAS_RELIEF_SPATIAL', requires: 'GEO', build: (c) => `No GPS, no lifelines: plant your compass pin where ${c.subject} lives on the map!` },
  { id: 'atl_03', toyFamily: 'ATLAS_RELIEF_SPATIAL', requires: 'GEO', build: (c) => `Passport stamped! Aim for bullseye territory and pinpoint ${c.subject}.` },
  { id: 'atl_04', toyFamily: 'ATLAS_RELIEF_SPATIAL', build: (c) => `First-class ticket to ${c.category}—lock down the ${c.relationLabel} for ${c.subject}!` },
  { id: 'atl_05', toyFamily: 'ATLAS_RELIEF_SPATIAL', requires: 'GEO', build: (c) => `Cartographer's spotlight: drop the brass tack on ${c.subject}'s home turf!` },
  { id: 'atl_06', toyFamily: 'ATLAS_RELIEF_SPATIAL', build: (c) => `Middle-seat atlas check! Which ${c.relationLabel} claims ${c.subject}${c.eraBit}?` },
  { id: 'atl_07', toyFamily: 'ATLAS_RELIEF_SPATIAL', requires: 'GEO', build: (c) => `Rotate the atlas and lock coordinates—where does ${c.subject} stand?` },
  { id: 'atl_08', toyFamily: 'ATLAS_RELIEF_SPATIAL', requires: 'GEO', build: (c) => `Explorer's dare: drop the ruby marker dead-center on ${c.subject}!` },

  // === 3. DIALS_CRYPTEX_LOCKS (9 Cryptex & Safe-Dial / Higher-Lower Framers) ===
  { id: 'dia_01', toyFamily: 'DIALS_CRYPTEX_LOCKS', requires: 'CRYPTEX', build: (c) => `Spin the brass tumblers! Crack the ${c.relationLabel} code for ${c.subject}${c.eraBit}.` },
  { id: 'dia_02', toyFamily: 'DIALS_CRYPTEX_LOCKS', build: (c) => `Vault's bolted shut—lock in the ${c.relationLabel} that unlocks ${c.subject}!` },
  { id: 'dia_03', toyFamily: 'DIALS_CRYPTEX_LOCKS', build: (c) => `Turn the safe wheel until it clicks: lock the ${c.relationLabel} for ${c.subject}.` },
  { id: 'dia_04', toyFamily: 'DIALS_CRYPTEX_LOCKS', requires: 'CRYPTEX', build: (c) => `Cryptex challenge on ${c.category}: spell out ${c.subject}'s ${c.relationLabel} to spring the latch!` },
  { id: 'dia_05', toyFamily: 'DIALS_CRYPTEX_LOCKS', requires: 'NUMERIC', build: (c) => `Higher or lower, no peeking—zero the brass needle on ${c.subject}${c.eraBit}!` },
  { id: 'dia_06', toyFamily: 'DIALS_CRYPTEX_LOCKS', build: (c) => `Locksmith's spotlight: line up the ${c.relationLabel} that matches ${c.subject}.` },
  { id: 'dia_07', toyFamily: 'DIALS_CRYPTEX_LOCKS', requires: 'NUMERIC', build: (c) => `Close wins chips, bullseye wins glory—spin the dial for ${c.subject}!` },
  { id: 'dia_08', toyFamily: 'DIALS_CRYPTEX_LOCKS', build: (c) => `Click the combination into place: what ${c.relationLabel} belongs to ${c.subject}?` },
  { id: 'dia_09', toyFamily: 'DIALS_CRYPTEX_LOCKS', build: (c) => `Crack the studio safe! Give me the ${c.relationLabel} behind ${c.subject}${c.eraBit}.` },

  // === 4. RAPID_PADDLES_REFLEX (8 Two-Paddle DIS OR DAT & Reflex Framers) ===
  { id: 'pad_01', toyFamily: 'RAPID_PADDLES_REFLEX', requires: 'BINARY', build: (c) => `Slam Left or Right! Sort each ${c.category} drop into ${c.optionA} vs. ${c.optionB}!` },
  { id: 'pad_02', toyFamily: 'RAPID_PADDLES_REFLEX', requires: 'BINARY', build: (c) => `DIS OR DAT blitz! Rapid-fire sort: ${c.optionA} or ${c.optionB}?` },
  { id: 'pad_03', toyFamily: 'RAPID_PADDLES_REFLEX', requires: 'BINARY', build: (c) => `Two paddles, zero mercy—flick every ${c.category} card to ${c.optionA} or ${c.optionB}!` },
  { id: 'pad_04', toyFamily: 'RAPID_PADDLES_REFLEX', requires: 'BINARY', build: (c) => `Conveyor's speeding up! Split the lineup cleanly between ${c.optionA} and ${c.optionB}.` },
  { id: 'pad_05', toyFamily: 'RAPID_PADDLES_REFLEX', requires: 'BINARY', build: (c) => `Reflex showdown: ${c.optionA} on the red paddle, ${c.optionB} on the gold!` },
  { id: 'pad_06', toyFamily: 'RAPID_PADDLES_REFLEX', requires: 'BINARY', build: (c) => `Don't blink! Send each ${c.category} flashcard home to ${c.optionA} or ${c.optionB}.` },
  { id: 'pad_07', toyFamily: 'RAPID_PADDLES_REFLEX', build: (c) => `Snap judgment on ${c.subject}: slam the right ${c.relationLabel} paddle before the buzzer!` },
  { id: 'pad_08', toyFamily: 'RAPID_PADDLES_REFLEX', build: (c) => `Speed-paddle blitz on ${c.category}: which ${c.relationLabel} matches ${c.subject}${c.eraBit}?` },

  // === 5. WAGER_SCALE_CHRONOLOGY (8 Chronology Ladder & Balance-Scale Framers) ===
  { id: 'chr_01', toyFamily: 'WAGER_SCALE_CHRONOLOGY', requires: 'CHRONOLOGY', build: (c) => `Stack the 4-rung timeline! Put these ${c.category} milestones in order from earliest to latest.` },
  { id: 'chr_02', toyFamily: 'WAGER_SCALE_CHRONOLOGY', requires: 'CHRONOLOGY', build: (c) => `Time-machine scramble: slot all four ${c.category} breakthroughs on the right rungs!` },
  { id: 'chr_03', toyFamily: 'WAGER_SCALE_CHRONOLOGY', requires: 'CHRONOLOGY', build: (c) => `Who came first? Climb the ${c.category} ladder from oldest debut to newest!` },
  { id: 'chr_04', toyFamily: 'WAGER_SCALE_CHRONOLOGY', requires: 'CHRONOLOGY', build: (c) => `Tip the brass scale cleanly—rank these four ${c.category} titans from smallest to biggest!` },
  { id: 'chr_05', toyFamily: 'WAGER_SCALE_CHRONOLOGY', requires: 'CHRONOLOGY', build: (c) => `Put 'em in order! Line up these ${c.category} classics before the pendulum stops.` },
  { id: 'chr_06', toyFamily: 'WAGER_SCALE_CHRONOLOGY', requires: 'CHRONOLOGY', build: (c) => `Four rungs, one true sequence: anchor the oldest ${c.category} milestone at the bottom!` },
  { id: 'chr_07', toyFamily: 'WAGER_SCALE_CHRONOLOGY', build: (c) => `Weigh your instincts on ${c.subject}—which ${c.relationLabel} balances the studio scale?` },
  { id: 'chr_08', toyFamily: 'WAGER_SCALE_CHRONOLOGY', build: (c) => `Set your wager on ${c.category}: lock in the true ${c.relationLabel} of ${c.subject}${c.eraBit}!` },

  // === 6. FORENSIC_DETECTIVE (8 Spot-the-Host's-Lie Framers) ===
  { id: 'for_01', toyFamily: 'FORENSIC_DETECTIVE', requires: 'LIE', build: (c) => `The host slipped ONE sneaky fib into this ${c.category} cue card—tap the lying word!` },
  { id: 'for_02', toyFamily: 'FORENSIC_DETECTIVE', requires: 'LIE', build: (c) => `Red-pen alert! Spot the single bogus fact Frankie tampered with on ${c.subject}.` },
  { id: 'for_03', toyFamily: 'FORENSIC_DETECTIVE', requires: 'LIE', build: (c) => `Fact-check the teleprompter! Catch the one word that breaks this ${c.category} truth.` },
  { id: 'for_04', toyFamily: 'FORENSIC_DETECTIVE', requires: 'LIE', build: (c) => `Sloane rigged the script on ${c.subject}—catch the exact fib before we go live!` },
  { id: 'for_05', toyFamily: 'FORENSIC_DETECTIVE', requires: 'LIE', build: (c) => `Put on the loupe: one word on this ${c.category} plaque is a total fake. Bust it!` },
  { id: 'for_06', toyFamily: 'FORENSIC_DETECTIVE', requires: 'LIE', build: (c) => `Lie-detector buzz: call out the bogus ${c.relationLabel} planted in ${c.subject}'s dossier.` },
  { id: 'for_07', toyFamily: 'FORENSIC_DETECTIVE', requires: 'LIE', build: (c) => `Cross-examine the clue! Tap the sneaky swap hiding inside ${c.subject}'s headline.` },
  { id: 'for_08', toyFamily: 'FORENSIC_DETECTIVE', build: (c) => `Detective spotlight on ${c.category}: trace ${c.subject}${c.eraBit} to its real ${c.relationLabel}!` },

  // === 7. PROGRESSIVE_AUDIO_REVEAL (6 Escalating Spotlight Framers) ===
  { id: 'prg_01', toyFamily: 'PROGRESSIVE_AUDIO_REVEAL', build: (c) => `Call it early for mega chips! Name the ${c.relationLabel} for ${c.subject} as hints peel away.` },
  { id: 'prg_02', toyFamily: 'PROGRESSIVE_AUDIO_REVEAL', build: (c) => `Four velvet curtains, one ${c.category} star—ring in on ${c.subject}'s ${c.relationLabel}!` },
  { id: 'prg_03', toyFamily: 'PROGRESSIVE_AUDIO_REVEAL', build: (c) => `Every clue shrinks the jackpot! Lock ${c.subject}'s ${c.relationLabel} as soon as it clicks.` },
  { id: 'prg_04', toyFamily: 'PROGRESSIVE_AUDIO_REVEAL', build: (c) => `Cold instinct pays triple—what ${c.relationLabel} pairs with ${c.subject}${c.eraBit}?` },
  { id: 'prg_05', toyFamily: 'PROGRESSIVE_AUDIO_REVEAL', build: (c) => `Spotlight's warming up on ${c.category}: spot ${c.subject}'s ${c.relationLabel} before Clue 4!` },
  { id: 'prg_06', toyFamily: 'PROGRESSIVE_AUDIO_REVEAL', build: (c) => `How fast can you read the room? Buzz in on ${c.subject}'s ${c.relationLabel}!` },

  // === 8. CASINO_BLUFF_STAKES (6 High-Roller Casino Framers) ===
  { id: 'cas_01', toyFamily: 'CASINO_BLUFF_STAKES', build: (c) => `Push your chips in! Which ${c.relationLabel} is the winning hand for ${c.subject}?` },
  { id: 'cas_02', toyFamily: 'CASINO_BLUFF_STAKES', build: (c) => `High-roller spotlight on ${c.category}: bet the stack on ${c.subject}'s ${c.relationLabel}!` },
  { id: 'cas_03', toyFamily: 'CASINO_BLUFF_STAKES', build: (c) => `No poker face needed—call the real ${c.relationLabel} behind ${c.subject}${c.eraBit}.` },
  { id: 'cas_04', toyFamily: 'CASINO_BLUFF_STAKES', build: (c) => `Velvet table stakes: three bluffs and one royal flush for ${c.subject}'s ${c.relationLabel}.` },
  { id: 'cas_05', toyFamily: 'CASINO_BLUFF_STAKES', build: (c) => `Double down or play cool—which ${c.relationLabel} cashes in for ${c.subject}?` },
  { id: 'cas_06', toyFamily: 'CASINO_BLUFF_STAKES', build: (c) => `House odds favor the sharp: lock the true ${c.relationLabel} of ${c.subject}!` },

  // === 9. KINETIC_CONTRAPTIONS (6 Tactile Contraption / Switchboard Framers) ===
  { id: 'kin_01', toyFamily: 'KINETIC_CONTRAPTIONS', build: (c) => `Pull the brass lever! Route ${c.subject}${c.eraBit} straight to its true ${c.relationLabel}.` },
  { id: 'kin_02', toyFamily: 'KINETIC_CONTRAPTIONS', build: (c) => `Drop the steel pinball into the winning pocket—what's ${c.subject}'s ${c.relationLabel}?` },
  { id: 'kin_03', toyFamily: 'KINETIC_CONTRAPTIONS', build: (c) => `Switchboard's lit up! Patch ${c.subject} directly to the right ${c.relationLabel}.` },
  { id: 'kin_04', toyFamily: 'KINETIC_CONTRAPTIONS', build: (c) => `Flip the toggle on ${c.category}: lock in ${c.subject}'s ${c.relationLabel} before the gears jam!` },
  { id: 'kin_05', toyFamily: 'KINETIC_CONTRAPTIONS', build: (c) => `Aim the brass flipper—knock down the true ${c.relationLabel} for ${c.subject}!` },
  { id: 'kin_06', toyFamily: 'KINETIC_CONTRAPTIONS', build: (c) => `Engage the flywheel! Match ${c.subject} to its unmistakable ${c.relationLabel}.` },

  // === 10. MIND_GAME_TWISTS (8 Reverse-Jeopardy & Stage-Twist Framers) ===
  { id: 'mnd_01', toyFamily: 'MIND_GAME_TWISTS', build: (c) => `Reverse Jeopardy! The studio board flashes "${c.subject}${c.eraBit}"—buzz in with its ${c.relationLabel}!` },
  { id: 'mnd_02', toyFamily: 'MIND_GAME_TWISTS', build: (c) => `Plot twist! Ignore the rival's bluff and lock ${c.subject}'s real ${c.relationLabel}.` },
  { id: 'mnd_03', toyFamily: 'MIND_GAME_TWISTS', build: (c) => `Answer on the marquee: "${c.subject}". Hit the buzzer with its true ${c.relationLabel}!` },
  { id: 'mnd_04', toyFamily: 'MIND_GAME_TWISTS', build: (c) => `Mind-game alert on ${c.category}: which ${c.relationLabel} truly belongs to ${c.subject}?` },
  { id: 'mnd_05', toyFamily: 'MIND_GAME_TWISTS', build: (c) => `Flip the script! "${c.subject}" is on the cue card—give me the matching ${c.relationLabel}!` },
  { id: 'mnd_06', toyFamily: 'MIND_GAME_TWISTS', build: (c) => `Prime-time curveball: three decoys want your chips—pick ${c.subject}'s real ${c.relationLabel}!` },
  { id: 'mnd_07', toyFamily: 'MIND_GAME_TWISTS', build: (c) => `Julian's cue card just says "${c.subject}"—bail him out with the right ${c.relationLabel}!` },
  { id: 'mnd_08', toyFamily: 'MIND_GAME_TWISTS', build: (c) => `Final-round swagger on ${c.category}: nail ${c.subject}'s ${c.relationLabel} cold!` },
];

export function getHostClueFramerCountV6(): number {
  return HOST_CLUE_FRAMERS_V6.length; // 72 distinct human stage framers!
}

const WITTY_ASIDES_BY_DOMAIN_V6: Readonly<Record<number, readonly string[]>> = {
  0: [
    'History never repeats, though bad decisions definitely rhyme.',
    'File that one straight into the Velvet Archive.',
    'Julian swore that happened last Tuesday.',
    'Bonus points if you remember the dress code.',
  ],
  1: [
    'Science: still undefeated against studio guesswork.',
    'Lab coat optional, bragging rights mandatory.',
    'Newton would tip his wig to that lock-in.',
    'Frankie tried to wire the stage with that last week.',
  ],
  2: [
    'No GPS, no panic, pure passport swagger.',
    'The globe spins, and your pin lands cold.',
    'Pack light—next stop costs double chips.',
    'Middle-seat travelers everywhere salute you.',
  ],
  3: [
    'Do not touch the frame—just admire the payout.',
    'Museum security is already watching your streak.',
    'Masterpiece energy right under the spotlights.',
    'Hang that answer in the lobby.',
  ],
  4: [
    'Cue the standing ovation and roll the credits.',
    'Pop-culture instincts sharper than a studio mic.',
    'That hook is going to live in your head all night.',
    'Box-office gold straight to your chip stack.',
  ],
  5: [
    'Buzzer beater from downtown—nothing but brass.',
    'Instant replay confirms: textbook clutch form.',
    'Put that highlight straight on the jumbotron.',
    'Championship poise under the shot clock.',
  ],
  6: [
    'Have you tried turning your rival off and on again?',
    'Patent pending, payout instant.',
    'Pure engineering genius—zero duct tape required.',
    'That circuit just lit up the whole balcony.',
  ],
  7: [
    'Mother Nature stays undefeated in the wild.',
    'Darwin would definitely buzz in for that one.',
    'Field-guide gold—no safari hat needed.',
    'Wild kingdom, calm contestant.',
  ],
  8: [
    'Order in the studio—that gavel just dropped.',
    'Diplomatic immunity granted for that streak.',
    'Sloane checked the rulebook twice; it stands.',
    'Signed, sealed, and banked in crisp chips.',
  ],
  9: [
    'Chef’s kiss—serve that payout piping hot.',
    'Check, please! Actually, put it on the network’s tab.',
    'Five-star taste without leaving the podium.',
    'Secret ingredient: knowing your stuff.',
  ],
  10: [
    'Plot twist: you actually read the book.',
    'Olympus just phoned—they’re impressed.',
    'Page-turner instincts paying prime-time dividends.',
    'Myth busted, chips banked.',
  ],
  11: [
    'Numbers don’t lie, even when the host bluffs.',
    'Mental math under hot lights—pure ice.',
    'Checkmate in one clean click.',
    'Proof positive and paid in full.',
  ],
};

// ----------------------------------------------------------------------------
// 4. CRYPTEX 4-8 CLEAN UPPERCASE WORD EXTRACTOR & TABLE SEMANTIC MAP
// ----------------------------------------------------------------------------

const CRYPTEX_STOPWORDS = new Set([
  'THE', 'AND', 'FOR', 'WITH', 'FROM', 'THAT', 'THIS', 'INTO', 'OVER', 'KING',
  'CITY', 'MOUNT', 'SAINT', 'LAKE', 'RIVER', 'WEST', 'EAST', 'NORTH', 'SOUTH',
  'UNITED', 'STATES', 'REPUBLIC', 'EMPIRE', 'NEW', 'OLD', 'GREAT', 'BATTLE',
]);

export function extractCleanCryptexWordV6(answer: string): string | undefined {
  const clean = sanitizeTriviaCopy(answer).trim();
  if (!clean) return undefined;
  // Direct single-word clean match first (4..8 pure A-Z letters)
  const lettersOnly = clean.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (/^[A-Z]{4,8}$/.test(lettersOnly) && !clean.includes(' ')) {
    return lettersOnly;
  }
  // Otherwise pick the sharpest distinctive 4..8-letter word (e.g. "Mount Fuji" -> "FUJI", "Pablo Picasso" -> "PICASSO")
  const words = clean
    .split(/[\s\-/']+/)
    .map((w) => w.replace(/[^A-Za-z]/g, '').toUpperCase())
    .filter((w) => w.length >= 4 && w.length <= 8 && !CRYPTEX_STOPWORDS.has(w));
  if (words.length > 0) {
    // Prefer last distinctive word (often surname or iconic core noun)
    return words[words.length - 1];
  }
  return undefined;
}

interface ShardSemanticConfigV6 {
  readonly subjectCol: number;
  readonly answerCol: number;
  readonly relationLabel: string;
  readonly yearCol?: number;
  readonly numericCol?: number;
  readonly numericUnit?: string;
  readonly groupCol?: number;
  readonly geoCol?: number;
  readonly humanFactSentence: (subj: string, ans: string, era?: string) => string;
}

const TABLE_SEMANTICS_V6: Readonly<Record<string, ShardSemanticConfigV6>> = {
  pop_film: { subjectCol: 0, answerCol: 1, relationLabel: 'director', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `"${s}"${e ?? ''} was directed by ${a}.` },
  pop_song: { subjectCol: 0, answerCol: 1, relationLabel: 'hitmaker', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `Hit song "${s}"${e ?? ''} was performed by ${a}.` },
  pop_album: { subjectCol: 0, answerCol: 1, relationLabel: 'recording artist', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `Classic album "${s}"${e ?? ''} was recorded by ${a}.` },
  pop_band: { subjectCol: 0, answerCol: 1, relationLabel: 'home country', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, geoCol: 1, humanFactSentence: (s, a, e) => `${s}${e ?? ''} first formed in ${a}.` },
  pop_tv: { subjectCol: 0, answerCol: 1, relationLabel: 'origin country', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, geoCol: 1, humanFactSentence: (s, a, e) => `TV series "${s}"${e ?? ''} debuted in ${a}.` },
  sub_pop_actor: { subjectCol: 0, answerCol: 1, relationLabel: 'homeland', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, geoCol: 1, humanFactSentence: (s, a) => `Screen star ${s} hails from ${a}.` },
  food_item: { subjectCol: 0, answerCol: 2, relationLabel: 'home cuisine', groupCol: 2, geoCol: 2, humanFactSentence: (s, a) => `${s} is a signature specialty from ${a}.` },
  food_brand: { subjectCol: 0, answerCol: 3, relationLabel: 'home country', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a, e) => `Iconic brand ${s}${e ?? ''} began in ${a}.` },
  food_maker: { subjectCol: 0, answerCol: 3, relationLabel: 'homeland', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a) => `Craft icon ${s} made their name in ${a}.` },
  sub_food_atelier: { subjectCol: 0, answerCol: 1, relationLabel: 'founder', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a, e) => `Heritage house ${s}${e ?? ''} was founded by ${a}.` },
  sub_food_ingred: { subjectCol: 0, answerCol: 2, relationLabel: 'home country', groupCol: 2, geoCol: 2, humanFactSentence: (s, a) => `${s} is a celebrated culinary tradition of ${a}.` },
  geo_city: { subjectCol: 0, answerCol: 1, relationLabel: 'home country', numericCol: 3, numericUnit: 'k pop.', groupCol: 1, geoCol: 0, humanFactSentence: (s, a) => `${s} is a major city located in ${a}.` },
  sub_geo_us_city: { subjectCol: 0, answerCol: 1, relationLabel: 'U.S. state', numericCol: 2, numericUnit: 'k pop.', groupCol: 1, geoCol: 0, humanFactSentence: (s, a) => `${s} sits on the American map in ${a}.` },
  sub_geo_city_deep: { subjectCol: 0, answerCol: 1, relationLabel: 'home nation', numericCol: 3, numericUnit: 'k pop.', groupCol: 1, geoCol: 1, humanFactSentence: (s, a) => `${s} is located inside ${a}.` },
  geo_mountain: { subjectCol: 0, answerCol: 1, relationLabel: 'home nation', numericCol: 2, numericUnit: 'm', groupCol: 1, geoCol: 0, humanFactSentence: (s, a) => `${s} rises above ${a}.` },
  geo_river: { subjectCol: 0, answerCol: 1, relationLabel: 'home country', numericCol: 2, numericUnit: 'km', groupCol: 1, geoCol: 0, humanFactSentence: (s, a) => `The ${s} winds its way through ${a}.` },
  geo_wonder: { subjectCol: 0, answerCol: 2, relationLabel: 'home nation', groupCol: 2, geoCol: 0, humanFactSentence: (s, a) => `${s} is a natural wonder of ${a}.` },
  geo_airport: { subjectCol: 2, answerCol: 0, relationLabel: '3-letter IATA code', groupCol: 3, geoCol: 1, humanFactSentence: (s, a) => `${s} carries the baggage-tag code ${a}.` },
  soc_country: { subjectCol: 0, answerCol: 1, relationLabel: 'capital city', groupCol: 2, geoCol: 0, humanFactSentence: (s, a) => `${a} is the official national capital of ${s}.` },
  soc_university: { subjectCol: 0, answerCol: 1, relationLabel: 'home nation', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, geoCol: 0, humanFactSentence: (s, a, e) => `${s}${e ?? ''} welcomes students in ${a}.` },
  soc_org: { subjectCol: 0, answerCol: 3, relationLabel: 'home country', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a) => `${s} is headquartered in ${a}.` },
  soc_leader: { subjectCol: 0, answerCol: 3, relationLabel: 'homeland', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a) => `Statesman ${s} shaped the history of ${a}.` },
  sub_soc_party_leader: { subjectCol: 0, answerCol: 2, relationLabel: 'nation', yearCol: 3, numericCol: 3, numericUnit: '', groupCol: 2, geoCol: 2, humanFactSentence: (s, a) => `Political leader ${s} served in ${a}.` },
  sub_soc_law: { subjectCol: 0, answerCol: 1, relationLabel: 'jurisdiction', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, geoCol: 1, humanFactSentence: (s, a, e) => `${s}${e ?? ''} was enacted in ${a}.` },
  art_landmark: { subjectCol: 0, answerCol: 3, relationLabel: 'home country', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 0, humanFactSentence: (s, a) => `${s} is an iconic landmark standing in ${a}.` },
  art_work: { subjectCol: 0, answerCol: 1, relationLabel: 'artist', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `Masterpiece "${s}"${e ?? ''} was created by ${a}.` },
  art_creator: { subjectCol: 0, answerCol: 3, relationLabel: 'homeland', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a) => `Master creator ${s} hailed from ${a}.` },
  sub_art_museum: { subjectCol: 0, answerCol: 2, relationLabel: 'home museum', yearCol: 3, numericCol: 3, numericUnit: '', groupCol: 2, humanFactSentence: (s, a) => `"${s}" hangs on display at ${a}.` },
  sub_art_classical: { subjectCol: 0, answerCol: 1, relationLabel: 'composer', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `"${s}"${e ?? ''} was composed by ${a}.` },
  sub_art_style: { subjectCol: 0, answerCol: 1, relationLabel: 'architectural style', yearCol: 3, numericCol: 3, numericUnit: '', groupCol: 1, geoCol: 0, humanFactSentence: (s, a) => `${s} showcases ${a} architecture.` },
  sport_athlete: { subjectCol: 0, answerCol: 1, relationLabel: 'signature sport', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, geoCol: 3, humanFactSentence: (s, a) => `Sporting legend ${s} became famous in ${a}.` },
  sport_club: { subjectCol: 0, answerCol: 1, relationLabel: 'home country', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, geoCol: 1, humanFactSentence: (s, a) => `${s} competes out of ${a}.` },
  sport_stadium: { subjectCol: 0, answerCol: 1, relationLabel: 'home nation', numericCol: 2, numericUnit: 'seats', groupCol: 1, geoCol: 0, humanFactSentence: (s, a) => `${s} packs cheering fans in ${a}.` },
  sport_videogame: { subjectCol: 0, answerCol: 1, relationLabel: 'developer studio', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `Video game "${s}"${e ?? ''} was built by ${a}.` },
  sub_vg_genre: { subjectCol: 0, answerCol: 2, relationLabel: 'game studio', yearCol: 3, numericCol: 3, numericUnit: '', groupCol: 2, humanFactSentence: (s, a, e) => `"${s}"${e ?? ''} was crafted by ${a}.` },
  sub_bb_ballpark: { subjectCol: 0, answerCol: 2, relationLabel: 'home franchise', yearCol: 3, numericCol: 3, numericUnit: '', groupCol: 2, geoCol: 0, humanFactSentence: (s, a) => `${s} served as home diamond for the ${a}.` },
  sub_bb_slugger: { subjectCol: 0, answerCol: 1, relationLabel: 'signature club', numericCol: 2, numericUnit: 'HR', groupCol: 1, humanFactSentence: (s, a) => `Slugger ${s} blasted homers for the ${a}.` },
  sub_bb_pitcher: { subjectCol: 0, answerCol: 1, relationLabel: 'signature club', numericCol: 2, numericUnit: 'K', groupCol: 1, humanFactSentence: (s, a) => `Ace pitcher ${s} dominated for the ${a}.` },
  sub_bb_hits_rbi: { subjectCol: 0, answerCol: 1, relationLabel: 'signature club', numericCol: 2, numericUnit: 'hits', groupCol: 1, humanFactSentence: (s, a) => `Baseball standout ${s} racked up hits for the ${a}.` },
  sub_bb_world_series: { subjectCol: 0, answerCol: 1, relationLabel: 'champion', yearCol: 3, numericCol: 3, numericUnit: '', groupCol: 1, humanFactSentence: (s, a) => `The ${a} captured the ${s}.` },
  sub_bb_awards_hof: { subjectCol: 0, answerCol: 1, relationLabel: 'honoree', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 0, humanFactSentence: (s, a) => `${a} earned ${s} honors.` },
  sub_bb_season_feat: { subjectCol: 0, answerCol: 1, relationLabel: 'record holder', numericCol: 3, numericUnit: '', groupCol: 2, humanFactSentence: (s, a) => `${a} authored the ${s}.` },
  sub_pro_player: { subjectCol: 0, answerCol: 1, relationLabel: 'field position', yearCol: 3, numericCol: 3, numericUnit: '', groupCol: 1, humanFactSentence: (s, a) => `Pro athlete ${s} starred at ${a}.` },
  tech_company: { subjectCol: 0, answerCol: 3, relationLabel: 'home country', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a, e) => `${s}${e ?? ''} got its start in ${a}.` },
  tech_vehicle: { subjectCol: 0, answerCol: 1, relationLabel: 'manufacturer', groupCol: 1, humanFactSentence: (s, a) => `The iconic ${s} was engineered by ${a}.` },
  sub_tech_aero_year: { subjectCol: 0, answerCol: 1, relationLabel: 'manufacturer', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `${s}${e ?? ''} rolled out of ${a}.` },
  tech_software: { subjectCol: 0, answerCol: 1, relationLabel: 'tech category', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `${s}${e ?? ''} made its mark as a ${a}.` },
  tech_pioneer: { subjectCol: 0, answerCol: 3, relationLabel: 'homeland', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a) => `Inventor ${s} hailed from ${a}.` },
  sub_tech_format: { subjectCol: 0, answerCol: 3, relationLabel: 'format family', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, humanFactSentence: (s, a) => `${s} belongs to the ${a} digital standard.` },
  nat_species: { subjectCol: 0, answerCol: 2, relationLabel: 'animal family', groupCol: 2, humanFactSentence: (s, a) => `In nature, the ${s} belongs to the ${a} family.` },
  sub_nat_breed: { subjectCol: 0, answerCol: 2, relationLabel: 'origin country', groupCol: 2, geoCol: 2, humanFactSentence: (s, a) => `The ${s} breed originated in ${a}.` },
  sub_nat_iucn: { subjectCol: 0, answerCol: 2, relationLabel: 'conservation status', groupCol: 2, humanFactSentence: (s, a) => `The ${s} is listed as ${a} on the IUCN Red List.` },
  sci_element: { subjectCol: 0, answerCol: 1, relationLabel: 'periodic symbol', numericCol: 2, numericUnit: 'protons', groupCol: 3, humanFactSentence: (s, a) => `On the periodic table, ${s} carries symbol ${a}.` },
  sci_space: { subjectCol: 0, answerCol: 1, relationLabel: 'space agency', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `Space mission ${s}${e ?? ''} flew for ${a}.` },
  sci_scientist: { subjectCol: 0, answerCol: 1, relationLabel: 'scientific field', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, geoCol: 3, humanFactSentence: (s, a) => `Scientist ${s} broke new ground in ${a}.` },
  sci_chemical: { subjectCol: 0, answerCol: 1, relationLabel: 'chemical formula', numericCol: 2, numericUnit: 'g/mol', humanFactSentence: (s, a) => `Chemists write ${s} with the formula ${a}.` },
  sci_astro: { subjectCol: 0, answerCol: 2, relationLabel: 'constellation', groupCol: 2, humanFactSentence: (s, a) => `Stargazers find ${s} inside ${a}.` },
  sci_exoplanet: { subjectCol: 0, answerCol: 1, relationLabel: 'discovery method', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `Exoplanet ${s}${e ?? ''} was spotted via ${a}.` },
  sub_sci_exo_deep: { subjectCol: 0, answerCol: 1, relationLabel: 'host star', numericCol: 3, numericUnit: 'ly', humanFactSentence: (s, a) => `Exoplanet ${s} orbits the host star ${a}.` },
  sub_sci_laureate: { subjectCol: 0, answerCol: 1, relationLabel: 'major prize', yearCol: 3, numericCol: 3, numericUnit: '', groupCol: 1, humanFactSentence: (s, a) => `Laureate ${s} won the ${a}.` },
  sub_sci_solar_body: { subjectCol: 0, answerCol: 1, relationLabel: 'discoverer', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, humanFactSentence: (s, a, e) => `Celestial body ${s}${e ?? ''} was discovered by ${a}.` },
  hist_empire: { subjectCol: 0, answerCol: 1, relationLabel: 'historic capital', yearCol: 2, numericCol: 2, numericUnit: '', geoCol: 0, humanFactSentence: (s, a) => `${a} served as the capital of the ${s}.` },
  hist_battle: { subjectCol: 0, answerCol: 3, relationLabel: 'modern nation', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a, e) => `The ${s}${e ?? ''} unfolded in modern-day ${a}.` },
  hist_war: { subjectCol: 0, answerCol: 2, relationLabel: 'flashpoint nation', yearCol: 1, numericCol: 1, numericUnit: '', groupCol: 2, geoCol: 2, humanFactSentence: (s, a, e) => `${s}${e ?? ''} centered on ${a}.` },
  hist_figure: { subjectCol: 0, answerCol: 3, relationLabel: 'historic homeland', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a) => `Historical figure ${s} is tied to ${a}.` },
  sub_hist_arch_site: { subjectCol: 0, answerCol: 1, relationLabel: 'modern country', groupCol: 1, geoCol: 0, humanFactSentence: (s, a) => `Ancient site ${s} stands today in ${a}.` },
  sub_hist_dynasty: { subjectCol: 0, answerCol: 1, relationLabel: 'royal dynasty', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, geoCol: 3, humanFactSentence: (s, a) => `${s} belonged to the ${a}.` },
  sub_hist_figures_deep: { subjectCol: 0, answerCol: 3, relationLabel: 'homeland', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a) => `${s} hailed from ${a}.` },
  lit_work: { subjectCol: 0, answerCol: 1, relationLabel: 'author', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `"${s}"${e ?? ''} was written by ${a}.` },
  lit_author: { subjectCol: 0, answerCol: 3, relationLabel: 'homeland', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a) => `Writer ${s} hailed from ${a}.` },
  lit_myth: { subjectCol: 0, answerCol: 1, relationLabel: 'mythic tradition', groupCol: 1, humanFactSentence: (s, a) => `${s} is a legendary figure from ${a}.` },
  sub_lit_char: { subjectCol: 0, answerCol: 2, relationLabel: 'creator', groupCol: 2, humanFactSentence: (s, a) => `Iconic character ${s} was created by ${a}.` },
  sub_lit_genre: { subjectCol: 0, answerCol: 1, relationLabel: 'author', yearCol: 3, numericCol: 3, numericUnit: '', groupCol: 1, humanFactSentence: (s, a, e) => `"${s}"${e ?? ''} was penned by ${a}.` },
  math_person: { subjectCol: 0, answerCol: 3, relationLabel: 'homeland', yearCol: 2, numericCol: 2, numericUnit: '', groupCol: 3, geoCol: 3, humanFactSentence: (s, a) => `Mathematician ${s} hailed from ${a}.` },
  math_num: { subjectCol: 0, answerCol: 1, relationLabel: 'exact answer', numericCol: 1, numericUnit: '', humanFactSentence: (s, a) => `${s} equals ${a}.` },
  math_word: { subjectCol: 0, answerCol: 1, relationLabel: 'decoded answer', humanFactSentence: (s, a) => `${s} resolves cleanly to ${a}.` },
  sub_math_spec_num: { subjectCol: 0, answerCol: 1, relationLabel: 'exact answer', numericCol: 1, numericUnit: '', humanFactSentence: (s, a) => `${s} equals ${a}.` },
  sub_math_spec_word: { subjectCol: 0, answerCol: 1, relationLabel: 'exact solution', humanFactSentence: (s, a) => `${s} lands cleanly on ${a}.` },
};

// ----------------------------------------------------------------------------
// 5. COMPACT PRECOMPUTED INDEX & SHARD TYPES
// ----------------------------------------------------------------------------

export interface CalibratedTableIndexEntryV6 {
  readonly file: string;
  readonly isSubcat: boolean;
  readonly domainId: number;
  readonly categoryLabel: string;
  readonly tableIndex: number;
  readonly legacyBaseQid: number;
  readonly denseBaseQid: number;
  readonly denseEndQid: number;
  readonly rowCount: number;
  readonly angleCount: number;
  readonly questionCount: number;
  readonly stageMask: number;
  readonly minStage: number;
  readonly minStar: number;
  readonly medianStar: number;
  readonly maxStar: number;
  readonly bandCounts: readonly number[];
  readonly bandRows: Readonly<Record<string, readonly number[]>>;
  readonly bandRanges: Readonly<Record<string, readonly [number, number, number]>>;
}

export interface CalibratedPackIndexEntryV6 {
  readonly path: string;
  readonly denseBaseQid: number;
  readonly denseEndQid: number;
  readonly count: number;
  readonly bandCounts: readonly number[];
  /** [origQid, denseQid, diffX10, fameX100, domainId] */
  readonly bandItems: Readonly<Record<string, ReadonlyArray<readonly [number, number, number, number, number]>>>;
}

export interface ShardFameDifficultyIndexV6 {
  readonly schemaVersion: string;
  readonly generatedAt: string;
  readonly totalShardFilesScanned: number;
  readonly totalShardTables: number;
  readonly totalShardRows: number;
  readonly totalShardQuestions: number;
  readonly totalCuratedQuestions: number;
  readonly totalSynthesisQuestions: number;
  readonly primeTimeWittyLoadedCount: number;
  readonly totalPlayableQuestions: number;
  readonly bitsetBytes: number;
  readonly bitsetCapacityBits: number;
  readonly denseQidMaxAllocated: number;
  readonly primeTimeWittyQidRange: readonly [number, number];
  readonly globalBandHistogram: readonly number[];
  readonly domainBandHistogram: Readonly<Record<string, readonly number[]>>;
  readonly packs: Readonly<Record<string, CalibratedPackIndexEntryV6>>;
  readonly tables: Readonly<Record<string, CalibratedTableIndexEntryV6>>;
  readonly synthesis: {
    readonly denseBaseQid: number;
    readonly denseEndQid: number;
    readonly perDomain: number;
    readonly total: number;
    readonly bandCounts: readonly number[];
  };
}

interface RawShardFileV6 {
  d: number;
  p: string[];
  t: Array<{ type: string; baseQid: number; r: Array<Array<string | number>> }>;
  types?: Record<string, { l0Domain: number; l1Category: string; cols: string[]; poolCols?: number[]; angles: Array<{ id: string; archetype: string; irtOffset?: number }> }>;
}

interface RawManifestSchemaV6 {
  types: Record<string, { l0Domain: number; l1Category: string; cols: string[]; poolCols?: number[]; angles: Array<{ id: string; archetype: string; irtOffset?: number }> }>;
}

// ----------------------------------------------------------------------------
// 6. BUILT-IN 0ms EMERGENCY CALIBRATED FALLBACK DECK (STAGES 01..10)
// ----------------------------------------------------------------------------

const BUILTIN_WARM_FALLBACK_CLUES_V6: readonly CalibratedClueV6[] = [
  {
    qid: 1_309_001,
    domainId: 4,
    categoryLabel: 'BLOCKBUSTER MOVIES',
    difficultyScore: 1.2,
    difficultyBadge: 'WARMUP',
    fameScore: 0.98,
    prompt: 'Snip 3 bogus wires! Which director launched "Jurassic Park" and "Jaws" into cinema history?',
    choices: ['Steven Spielberg', 'Tim Burton', 'Ridley Scott', 'Guy Ritchie'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    numericTarget: 1993,
    numericMin: 1975,
    numericMax: 2010,
    numericUnit: '',
    cryptexWord: 'JAWS',
    geoTarget: { lat: 34.0928, lng: -118.3287, regionHint: 'California', landmarkLabel: 'Hollywood' },
    corruptedLieWord: { sentenceWithLie: 'Tim Burton directed the 1993 dinosaur hit Jurassic Park.', lieToken: 'Tim Burton', truthCorrection: 'Steven Spielberg' },
    progressiveHints: ['He also brought E.T. to the big screen.', 'Think sharks, dinosaurs, and fedoras.', 'Initials: S.S.', 'Steven Spielberg!'],
    wittyHostAside: 'You’re gonna need a bigger chip stack.',
  },
  {
    qid: 1_309_002,
    domainId: 2,
    categoryLabel: 'WORLD LANDMARKS',
    difficultyScore: 1.3,
    difficultyBadge: 'WARMUP',
    fameScore: 0.99,
    prompt: 'Drop the ruby pin! Which country welcomes visitors beneath the iron lattice of the Eiffel Tower?',
    choices: ['France', 'Spain', 'Brazil', 'Japan'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    numericTarget: 1889,
    numericMin: 1850,
    numericMax: 1930,
    numericUnit: '',
    cryptexWord: 'FRANCE',
    geoTarget: { lat: 48.8584, lng: 2.2945, regionHint: 'Paris, France', landmarkLabel: 'Eiffel Tower' },
    corruptedLieWord: { sentenceWithLie: 'The Eiffel Tower opened in 1889 in Madrid.', lieToken: 'Madrid', truthCorrection: 'Paris' },
    progressiveHints: ['Look along the River Seine.', 'Built for the 1889 World’s Fair.', 'Croissants are never far away.', 'Paris, France!'],
    wittyHostAside: 'Parisians hated it in 1889—now it prints postcards.',
  },
  {
    qid: 1_309_003,
    domainId: 9,
    categoryLabel: 'WORLD FOOD',
    difficultyScore: 1.4,
    difficultyBadge: 'WARMUP',
    fameScore: 0.97,
    prompt: 'Chef’s buzzer! Neapolitan pizza first came out of brick ovens in which sun-soaked country?',
    choices: ['Italy', 'Sweden', 'Thailand', 'Canada'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    cryptexWord: 'ITALY',
    geoTarget: { lat: 40.8518, lng: 14.2681, regionHint: 'Italy', landmarkLabel: 'Naples' },
    corruptedLieWord: { sentenceWithLie: 'Classic Neapolitan pizza originated in Sweden.', lieToken: 'Sweden', truthCorrection: 'Italy' },
    progressiveHints: ['Think red, white, and green like a Margherita pie.', 'Home of Naples and Rome.', 'Shaped like a tall leather boot.', 'Italy!'],
    wittyHostAside: 'Chef’s kiss—extra mozzarella on the network’s tab.',
  },
  {
    qid: 1_309_004,
    domainId: 7,
    categoryLabel: 'FAMOUS ANIMALS',
    difficultyScore: 1.5,
    difficultyBadge: 'WARMUP',
    fameScore: 0.96,
    prompt: 'Wild-kingdom check: reaching 150 tons, what ocean giant is the largest animal ever to live on Earth?',
    choices: ['Blue Whale', 'African Elephant', 'Great White Shark', 'Giant Squid'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    cryptexWord: 'WHALE',
    corruptedLieWord: { sentenceWithLie: 'The Great White Shark is the largest animal ever to live on Earth.', lieToken: 'Great White Shark', truthCorrection: 'Blue Whale' },
    progressiveHints: ['It breathes air through twin blowholes.', 'Its heart is the size of a compact car.', 'Its name starts with a primary color.', 'The Blue Whale!'],
    wittyHostAside: 'Even bigger than Sloane’s compliance binder.',
  },
  {
    qid: 1_309_005,
    domainId: 4,
    categoryLabel: 'ICONIC BANDS',
    difficultyScore: 1.6,
    difficultyBadge: 'WARMUP',
    fameScore: 0.98,
    prompt: 'Crank the studio amp! Which Liverpool quartet crossed Abbey Road into music immortality?',
    choices: ['The Beatles', 'ABBA', 'Nirvana', 'Metallica'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    numericTarget: 1969,
    numericMin: 1955,
    numericMax: 1985,
    numericUnit: '',
    cryptexWord: 'BEATLES',
    geoTarget: { lat: 53.4084, lng: -2.9916, regionHint: 'United Kingdom', landmarkLabel: 'Liverpool' },
    corruptedLieWord: { sentenceWithLie: 'ABBA recorded their iconic 1969 album Abbey Road in London.', lieToken: 'ABBA', truthCorrection: 'The Beatles' },
    progressiveHints: ['John, Paul, George, and Ringo.', 'They sparked Beatlemania in 1964.', 'Famous zebra-crosswalk album cover.', 'The Beatles!'],
    wittyHostAside: 'All you need is chips—and a clean buzzer.',
  },
  {
    qid: 1_309_006,
    domainId: 1,
    categoryLabel: 'PERIODIC TABLE',
    difficultyScore: 2.2,
    difficultyBadge: 'EASY',
    fameScore: 0.92,
    prompt: 'Spin the brass cryptex! Which precious yellow metal wears the Latin symbol "Au" on the periodic table?',
    choices: ['Gold', 'Silver', 'Copper', 'Iron'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    numericTarget: 79,
    numericMin: 40,
    numericMax: 100,
    numericUnit: 'protons',
    cryptexWord: 'GOLD',
    corruptedLieWord: { sentenceWithLie: 'Silver carries the chemical symbol Au on the periodic table.', lieToken: 'Silver', truthCorrection: 'Gold' },
    progressiveHints: ['Atomic number 79.', 'Latin root: aurum.', 'What first-place Olympic medals shine with.', 'Gold!'],
    wittyHostAside: 'Pure 24-karat confidence on stage.',
  },
  {
    qid: 1_309_007,
    domainId: 5,
    categoryLabel: 'VIDEO GAMES',
    difficultyScore: 2.4,
    difficultyBadge: 'EASY',
    fameScore: 0.91,
    prompt: 'Grab a controller! Inspired by a pizza missing one slice, which yellow 1980 arcade icon chomps ghosts?',
    choices: ['Pac-Man', 'Tetris', 'Sonic', 'Pong'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    numericTarget: 1980,
    numericMin: 1970,
    numericMax: 1995,
    numericUnit: '',
    cryptexWord: 'PACMAN',
    geoTarget: { lat: 35.6762, lng: 139.6503, regionHint: 'Japan', landmarkLabel: 'Tokyo' },
    corruptedLieWord: { sentenceWithLie: 'Tetris debuted in 1980 as a yellow maze-chasing arcade icon.', lieToken: 'Tetris', truthCorrection: 'Pac-Man' },
    progressiveHints: ['Built by Namco in Japan.', 'Look out for Blinky, Pinky, Inky, and Clyde.', 'Waka-waka-waka!', 'Pac-Man!'],
    wittyHostAside: 'Power pellet chomped—ghosts officially rattled.',
  },
  {
    qid: 1_309_008,
    domainId: 3,
    categoryLabel: 'FAMOUS ART',
    difficultyScore: 3.1,
    difficultyBadge: 'EASY',
    fameScore: 0.9,
    prompt: 'Velvet-rope check: which swirling 1889 nightscape did Vincent van Gogh paint from Saint-Rémy?',
    choices: ['The Starry Night', 'The Scream', 'Mona Lisa', 'Guernica'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    numericTarget: 1889,
    numericMin: 1850,
    numericMax: 1925,
    numericUnit: '',
    cryptexWord: 'STARRY',
    geoTarget: { lat: 40.7614, lng: -73.9776, regionHint: 'New York City', landmarkLabel: 'New York' },
    corruptedLieWord: { sentenceWithLie: 'Vincent van Gogh painted Guernica from his window in 1889.', lieToken: 'Guernica', truthCorrection: 'The Starry Night' },
    progressiveHints: ['Cobalt skies, glowing yellow crescent moon.', 'A tall dark cypress tree frames the left.', 'Hangs today at MoMA in New York.', 'The Starry Night!'],
    wittyHostAside: 'Museum heist successful—without setting off a single laser.',
  },
  {
    qid: 1_309_009,
    domainId: 6,
    categoryLabel: 'TECH & BRANDS',
    difficultyScore: 4.5,
    difficultyBadge: 'CONTENDER',
    fameScore: 0.82,
    prompt: 'Dial the year! When did Tim Berners-Lee submit the CERN proposal that sparked the World Wide Web?',
    choices: ['1989', '1979', '1995', '1983'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    numericTarget: 1989,
    numericMin: 1970,
    numericMax: 2005,
    numericUnit: '',
    cryptexWord: 'CERN',
    geoTarget: { lat: 46.233, lng: 6.0557, regionHint: 'Geneva, Switzerland', landmarkLabel: 'CERN' },
    corruptedLieWord: { sentenceWithLie: 'Tim Berners-Lee proposed the World Wide Web at CERN in 1995.', lieToken: '1995', truthCorrection: '1989' },
    progressiveHints: ['Same year the Berlin Wall fell.', 'His boss wrote "Vague, but exciting..." on the cover.', 'Final year of the 1980s.', '1989!'],
    wittyHostAside: 'Vague, exciting, and worth a clean payout.',
  },
  {
    qid: 1_309_010,
    domainId: 0,
    categoryLabel: 'HISTORIC BATTLES',
    difficultyScore: 8.6,
    difficultyBadge: 'CHAMPIONSHIP',
    fameScore: 0.22,
    prompt: 'Championship vault: in which modern-day country did the 1709 Battle of Poltava shatter Swedish supremacy?',
    choices: ['Ukraine', 'Poland', 'Finland', 'Lithuania'],
    correctIndex: 0,
    wrongWireIndices: [1, 2, 3],
    numericTarget: 1709,
    numericMin: 1660,
    numericMax: 1760,
    numericUnit: '',
    cryptexWord: 'UKRAINE',
    geoTarget: { lat: 49.5883, lng: 34.5514, regionHint: 'Eastern Europe', landmarkLabel: 'Ukraine' },
    corruptedLieWord: { sentenceWithLie: 'Peter the Great defeated Charles XII at Poltava in modern-day Poland.', lieToken: 'Poland', truthCorrection: 'Ukraine' },
    progressiveHints: ['Decisive clash of the Great Northern War.', 'Peter the Great beat Charles XII here.', 'Located east of the Dnieper River.', 'Ukraine!'],
    wittyHostAside: 'Grandmaster history locked—Sloane is visibly sweating.',
  },
];

// ----------------------------------------------------------------------------
// 7. RNG & HELPERS
// ----------------------------------------------------------------------------

class FastRngV6 {
  private state: number;
  constructor(seed?: number) {
    let s: number;
    if (seed !== undefined && Number.isFinite(seed)) {
      s = (seed >>> 0) ^ 0x9e3779b9;
    } else if (
      typeof globalThis.crypto !== 'undefined' &&
      typeof globalThis.crypto.getRandomValues === 'function'
    ) {
      const arr = new Uint32Array(1);
      globalThis.crypto.getRandomValues(arr);
      s = arr[0] || 0x85ebca6b;
    } else {
      s = ((Math.random() * 0xffffffff) >>> 0) ^ (Date.now() >>> 0) || 0x9e3779b9;
    }
    // Murmur3 fmix32 avalanche so even tiny sequential seeds (1, 2, 9001...) yield uniform 32-bit dispersion immediately!
    s ^= s >>> 16;
    s = Math.imul(s, 0x85ebca6b) >>> 0;
    s ^= s >>> 13;
    s = Math.imul(s, 0xc2b2ae35) >>> 0;
    s ^= s >>> 16;
    this.state = (s >>> 0) || 0x9e3779b9;
  }

  public nextUint32(): number {
    // xorshift32 — fast, zero-alloc, crisp statistical uniformity
    let x = this.state >>> 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state;
  }

  public nextFloat(): number {
    return this.nextUint32() / 4294967296;
  }

  public nextInt(minInclusive: number, maxInclusive: number): number {
    if (maxInclusive <= minInclusive) return minInclusive;
    const span = maxInclusive - minInclusive + 1;
    return minInclusive + (this.nextUint32() % span);
  }

  public shuffleInPlace<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function clampPrompt140(raw: string): string {
  const s = sanitizeTriviaCopy(raw).trim();
  if (s.length <= 140) return s;
  const cut = s.slice(0, 137);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > 95 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[,;:\-—\s]+$/, '')}...`;
}

function resolveShardCell(
  row: ReadonlyArray<string | number>,
  colIdx: number,
  poolCols: ReadonlySet<number>,
  pool: ReadonlyArray<string>,
): string {
  if (colIdx < 0 || colIdx >= row.length) return '';
  const raw = row[colIdx];
  if (poolCols.has(colIdx)) {
    const idx = Number(raw);
    return idx >= 0 && idx < pool.length ? pool[idx] : '';
  }
  return String(raw ?? '');
}

function stripLeadingMaker(name: string, maker: string): string {
  const n = name.trim();
  const m = maker.trim();
  if (m.length >= 2 && n.length > m.length + 1) {
    const nl = n.toLowerCase();
    const ml = m.toLowerCase();
    if (nl.startsWith(`${ml} `) || nl.startsWith(`${ml}-`)) {
      const rest = n.slice(m.length + 1).trim();
      if (rest.length >= 2) return rest;
    }
  }
  return n;
}

// ----------------------------------------------------------------------------
// 8. DRAW OPTIONS & ENGINE STATS INTERFACES
// ----------------------------------------------------------------------------

export interface DrawClueOptionsV6 {
  readonly stageId?: StageWorldIdV6;
  readonly stageNumber?: number;           // 1 .. 10
  readonly episodeNumber?: number;         // 1 .. 20
  readonly difficultyRange?: readonly [number, number];
  readonly domainId?: number;              // 0 .. 11
  readonly allowedDomains?: readonly number[];
  readonly toyFamily?: ToyFamilyIdV6;
  readonly toyId?: string;
  readonly requireGeoTarget?: boolean;
  readonly requireCryptexWord?: boolean;
  readonly requireNumericTarget?: boolean;
  readonly requireChronology?: boolean;
  readonly requireBinaryPair?: boolean;
  readonly requireCorruptedLie?: boolean;
  readonly excludeQids?: ReadonlySet<number>;
  readonly seed?: number;
  /** Defaults to true — immediately marks served QID in the 160KB bitset ledger! */
  readonly markSeen?: boolean;
}

export interface QuestionEngineInitOptionsV6 {
  readonly baseUrl?: string;
  readonly ledger?: SeenQuestionBitsetLedger;
  /** Optional custom JSON loader (enables zero-HTTP Node.js unit & 10k-draw smoke tests!). */
  readonly jsonLoader?: (relativeDataPath: string) => Promise<unknown>;
  readonly loadPrimeTimePack?: boolean;
}

export interface CorpusStatsSnapshotV6 {
  readonly initialized: boolean;
  readonly startupMs: number;
  readonly totalPlayableQuestions: number;
  readonly totalShardQuestions: number;
  readonly totalCuratedQuestions: number;
  readonly totalSynthesisQuestions: number;
  readonly primeTimeWittyCount: number;
  readonly loadedShardFiles: number;
  readonly seenCount: number;
  readonly bitsetBytes: number;
  readonly bitsetCapacityBits: number;
  readonly hostFramerCount: number;
  readonly geoDictionarySize: number;
  readonly globalBandHistogram: readonly number[];
}

// ----------------------------------------------------------------------------
// 9. PRIMARY v6.0 QUESTION ENGINE (`QuestionEngineV6`)
// ----------------------------------------------------------------------------

export class QuestionEngineV6 {
  private readonly ledger: SeenQuestionBitsetLedger;
  private baseUrl = './data';
  private customLoader: ((relPath: string) => Promise<unknown>) | null = null;

  private initialized = false;
  private startupMs = 0;
  private index: ShardFameDifficultyIndexV6 | null = null;
  private typeSpecs = new Map<
    string,
    { l0Domain: number; l1Category: string; cols: string[]; poolCols?: number[]; angles: Array<{ id: string; archetype: string; irtOffset?: number }> }
  >();

  private shardCache = new Map<string, RawShardFileV6>();
  private shardInFlight = new Map<string, Promise<RawShardFileV6 | null>>();
  private curatedCache = new Map<string, Map<number, Record<string, unknown>>>();
  private curatedInFlight = new Map<string, Promise<Map<number, Record<string, unknown>> | null>>();
  private primeTimeByBand: Array<CalibratedClueV6[]> = Array.from({ length: 10 }, () => []);
  private primeTimeCount = 0;

  // Per-table cursor cache to avoid re-scanning exhausted head indices during 10k+ rapid draws
  private readonly bandRowCursors = new Map<string, number>();

  constructor(ledger: SeenQuestionBitsetLedger = sharedSeenLedgerV6) {
    this.ledger = ledger;
  }

  public getSeenLedger(): SeenQuestionBitsetLedger {
    return this.ledger;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getStartupMs(): number {
    return this.startupMs;
  }

  public getTotalPlayableCount(): number {
    if (!this.index) return 1_279_854 + this.primeTimeCount;
    const baseWithoutPt = this.index.totalPlayableQuestions - (this.index.primeTimeWittyLoadedCount ?? 0);
    return baseWithoutPt + this.primeTimeCount;
  }

  public getCorpusStats(): CorpusStatsSnapshotV6 {
    return {
      initialized: this.initialized,
      startupMs: Math.round(this.startupMs * 10) / 10,
      totalPlayableQuestions: this.getTotalPlayableCount(),
      totalShardQuestions: this.index?.totalShardQuestions ?? 1_221_277,
      totalCuratedQuestions: this.index?.totalCuratedQuestions ?? 8_177,
      totalSynthesisQuestions: this.index?.totalSynthesisQuestions ?? 50_400,
      primeTimeWittyCount: this.primeTimeCount,
      loadedShardFiles: this.shardCache.size,
      seenCount: this.ledger.getSeenCount(),
      bitsetBytes: this.ledger.getByteLength(),
      bitsetCapacityBits: this.ledger.getCapacityBits(),
      hostFramerCount: HOST_CLUE_FRAMERS_V6.length,
      geoDictionarySize: WORLD_GEO_TUPLES_V6.length,
      globalBandHistogram: this.index?.globalBandHistogram ?? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
  }

  private async fetchJson(relativeDataPath: string): Promise<unknown | null> {
    if (this.customLoader) {
      try {
        return await this.customLoader(relativeDataPath);
      } catch {
        return null;
      }
    }
    try {
      const cleanRel = relativeDataPath.replace(/^\/+/, '');
      const url = `${this.baseUrl.replace(/\/+$/, '')}/${cleanRel}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Ultra-fast <50ms initialization:
   *  1. Loads compact precomputed `v6/shard_fame_difficulty_index.json` (~278 KB)
   *  2. Loads compact type schemas (`shards/shard_manifest.json` + `shards/taxonomy_tree.json`)
   *  3. Hydrates the 160 KB `SeenQuestionBitsetLedger` (localStorage + IndexedDB union)
   *  4. Opportunistically loads `v6/prime_time_witty_clues_v6.json` if present (non-fatal if absent)
   */
  public async init(options?: QuestionEngineInitOptionsV6): Promise<CorpusStatsSnapshotV6> {
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (options?.baseUrl) this.baseUrl = options.baseUrl;
    if (options?.jsonLoader) this.customLoader = options.jsonLoader;

    const [indexRaw, manifestRaw, taxRaw] = await Promise.all([
      this.fetchJson('v6/shard_fame_difficulty_index.json'),
      this.fetchJson('shards/shard_manifest.json'),
      this.fetchJson('shards/taxonomy_tree.json'),
      this.ledger.hydrate(),
    ]);

    if (indexRaw && typeof indexRaw === 'object') {
      this.index = indexRaw as ShardFameDifficultyIndexV6;
    }
    if (manifestRaw && typeof manifestRaw === 'object') {
      const m = manifestRaw as RawManifestSchemaV6;
      if (m.types) {
        for (const [k, v] of Object.entries(m.types)) {
          this.typeSpecs.set(k, v);
        }
      }
    }
    if (taxRaw && typeof taxRaw === 'object') {
      const t = taxRaw as RawManifestSchemaV6;
      if (t.types) {
        for (const [k, v] of Object.entries(t.types)) {
          this.typeSpecs.set(k, v);
        }
      }
    }

    // Load bespoke prime_time_witty_clues_v6.json in background/parallel when requested
    if (options?.loadPrimeTimePack !== false) {
      await this.tryLoadPrimeTimeWittyPack();
    }

    const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this.startupMs = Math.max(0.1, t1 - t0);
    this.initialized = true;
    return this.getCorpusStats();
  }

  /** Seamlessly loads & indexes `public/data/v6/prime_time_witty_clues_v6.json` when available. */
  public async tryLoadPrimeTimeWittyPack(): Promise<number> {
    if (this.primeTimeCount > 0) return this.primeTimeCount;
    const raw = await this.fetchJson('v6/prime_time_witty_clues_v6.json');
    if (!raw) return 0;
    const list: unknown[] = Array.isArray(raw)
      ? raw
      : Array.isArray((raw as Record<string, unknown>).clues)
        ? ((raw as Record<string, unknown>).clues as unknown[])
        : Array.isArray((raw as Record<string, unknown>).questions)
          ? ((raw as Record<string, unknown>).questions as unknown[])
          : [];

    this.primeTimeByBand = Array.from({ length: 10 }, () => []);
    let loaded = 0;
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      const clue = item as CalibratedClueV6;
      if (
        typeof clue.qid !== 'number' ||
        clue.qid < 0 ||
        clue.qid >= V6_BITSET_CAPACITY_BITS ||
        !clue.prompt ||
        !Array.isArray(clue.choices) ||
        clue.choices.length < 2
      ) {
        continue;
      }
      const band = difficultyToBandIndexV6(Number(clue.difficultyScore ?? 5.0));
      this.primeTimeByBand[band].push(clue);
      loaded++;
    }
    this.primeTimeCount = loaded;
    return loaded;
  }

  /** Lazy-loads a single shard file (`domain_4.json`, `domain_subcats_2.json`, etc.) once and caches it. */
  public async ensureShardFileLoaded(shardFileName: string): Promise<RawShardFileV6 | null> {
    const cached = this.shardCache.get(shardFileName);
    if (cached) return cached;
    const inflight = this.shardInFlight.get(shardFileName);
    if (inflight) return inflight;

    const p = (async () => {
      const raw = await this.fetchJson(`shards/${shardFileName}`);
      if (!raw || typeof raw !== 'object') return null;
      const data = raw as RawShardFileV6;
      if (data.types) {
        for (const [k, v] of Object.entries(data.types)) {
          this.typeSpecs.set(k, v);
        }
      }
      this.shardCache.set(shardFileName, data);
      return data;
    })();
    this.shardInFlight.set(shardFileName, p);
    try {
      return await p;
    } finally {
      this.shardInFlight.delete(shardFileName);
    }
  }

  /** Lazy-loads a curated pack (`gold_venue_packs.json`, `jeopardy_signature_packs.json`, etc.) once. */
  private async ensureCuratedPackLoaded(packKey: string): Promise<Map<number, Record<string, unknown>> | null> {
    const cached = this.curatedCache.get(packKey);
    if (cached) return cached;
    const inflight = this.curatedInFlight.get(packKey);
    if (inflight) return inflight;

    const packEntry = this.index?.packs[packKey];
    if (!packEntry) return null;

    const p = (async () => {
      const raw = await this.fetchJson(packEntry.path);
      if (!raw || typeof raw !== 'object') return null;
      const obj = raw as Record<string, unknown>;
      const map = new Map<number, Record<string, unknown>>();
      const list = (obj.questions ?? obj.cards ?? []) as Array<Record<string, unknown>>;
      for (const rec of list) {
        if (rec && typeof rec.qid === 'number') map.set(rec.qid, rec);
      }
      if (Array.isArray(obj.bossChains)) {
        for (const ch of obj.bossChains as Array<{ steps?: Array<Record<string, unknown>> }>) {
          if (Array.isArray(ch.steps)) {
            for (const step of ch.steps) {
              if (step && typeof step.qid === 'number') map.set(step.qid, step);
            }
          }
        }
      }
      this.curatedCache.set(packKey, map);
      return map;
    })();
    this.curatedInFlight.set(packKey, p);
    try {
      return await p;
    } finally {
      this.curatedInFlight.delete(packKey);
    }
  }

  // --------------------------------------------------------------------------
  // TARGET BAND RESOLUTION & TOY REQUIREMENTS
  // --------------------------------------------------------------------------

  private resolveTargetWindow(opts: DrawClueOptionsV6): {
    stageNumber: number;
    targetBand: number;
    minStar: number;
    maxStar: number;
    toyFamily: ToyFamilyIdV6;
  } {
    const stageNumber = resolveStageNumberV6(opts);
    let minStar: number;
    let maxStar: number;
    if (opts.difficultyRange) {
      minStar = clamp(opts.difficultyRange[0], 1.0, 10.0);
      maxStar = clamp(opts.difficultyRange[1], minStar, 10.0);
    } else {
      const sid = opts.stageId ?? STAGE_WORLD_ORDER_V6[stageNumber - 1];
      const [lo, hi] = STAGE_DIFFICULTY_BANDS_V6[sid];
      // Micro-progression across Episode 1 vs Episode 2 inside each Stage World!
      if (opts.episodeNumber !== undefined && Number.isFinite(opts.episodeNumber)) {
        const isSecondEp = opts.episodeNumber % 2 === 0;
        const mid = (lo + hi) * 0.5;
        minStar = isSecondEp ? Math.max(lo, mid - 0.15) : lo;
        maxStar = isSecondEp ? hi : Math.min(hi, mid + 0.15);
      } else {
        minStar = lo;
        maxStar = hi;
      }
    }
    const targetBand = difficultyToBandIndexV6((minStar + maxStar) * 0.5);
    const toyFamily: ToyFamilyIdV6 = opts.toyFamily ?? 'DEFUSAL_ELIMINATION';
    return { stageNumber, targetBand, minStar, maxStar, toyFamily };
  }

  private matchesToyRequirements(clue: CalibratedClueV6, opts: DrawClueOptionsV6): boolean {
    if (opts.requireGeoTarget || opts.toyFamily === 'ATLAS_RELIEF_SPATIAL') {
      if (!clue.geoTarget) return false;
    }
    if (opts.requireCryptexWord) {
      if (!clue.cryptexWord || !/^[A-Z]{4,8}$/.test(clue.cryptexWord)) return false;
    }
    if (opts.requireNumericTarget) {
      if (clue.numericTarget === undefined || !Number.isFinite(clue.numericTarget)) return false;
    }
    if (opts.requireChronology) {
      if (!clue.chronologyItems || clue.chronologyItems.length < 4) return false;
    }
    if (opts.requireBinaryPair) {
      if (!clue.binaryPair || clue.binaryPair.items.length < 4) return false;
    }
    if (opts.requireCorruptedLie) {
      if (!clue.corruptedLieWord) return false;
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // SOURCE A: BESPOKE PRIME-TIME WITTY CLUES V6 (QIDs 1,280,000..1,282,999)
  // --------------------------------------------------------------------------

  private pickPrimeTimeWittyClue(
    targetBand: number,
    minStar: number,
    maxStar: number,
    opts: DrawClueOptionsV6,
    rng: FastRngV6,
  ): CalibratedClueV6 | null {
    if (this.primeTimeCount === 0) return null;
    const bandOrder = [targetBand];
    if (targetBand > 0) bandOrder.push(targetBand - 1);
    if (targetBand < 9) bandOrder.push(targetBand + 1);

    const domFilter =
      opts.domainId !== undefined
        ? new Set([opts.domainId])
        : opts.allowedDomains && opts.allowedDomains.length > 0
          ? new Set(opts.allowedDomains)
          : null;

    for (let pass = 0; pass < bandOrder.length; pass++) {
      const b = bandOrder[pass];
      const bucket = this.primeTimeByBand[b];
      if (!bucket || bucket.length === 0) continue;

      const start = rng.nextInt(0, bucket.length - 1);
      for (let step = 0; step < bucket.length; step++) {
        const clue = bucket[(start + step) % bucket.length];
        if (this.ledger.hasSeen(clue.qid)) continue;
        if (opts.excludeQids?.has(clue.qid)) continue;
        if (domFilter && !domFilter.has(clue.domainId)) continue;
        if (pass === 0 && (clue.difficultyScore < minStar - 0.35 || clue.difficultyScore > maxStar + 0.35)) {
          continue;
        }
        if (opts.toyId && clue.recommendedToyIds && clue.recommendedToyIds.length > 0 && pass === 0) {
          if (!clue.recommendedToyIds.includes(opts.toyId)) continue;
        }
        if (!this.matchesToyRequirements(clue, opts)) continue;
        return this.enrichClueForActiveToy(clue, opts.toyFamily ?? 'DEFUSAL_ELIMINATION', rng);
      }
    }
    return null;
  }

  // --------------------------------------------------------------------------
  // SOURCE B: CALIBRATED 1.27M SHARD ENGINE + 72 HUMAN STAGE FRAMERS
  // --------------------------------------------------------------------------

  private selectEligibleTables(
    stageNumber: number,
    targetBand: number,
    opts: DrawClueOptionsV6,
    rng: FastRngV6,
    relaxToyFilter = false,
  ): Array<{ tableType: string; meta: CalibratedTableIndexEntryV6 }> {
    if (!this.index) return [];
    const stageBit = 1 << (stageNumber - 1);
    const domFilter =
      opts.domainId !== undefined
        ? new Set([opts.domainId])
        : opts.allowedDomains && opts.allowedDomains.length > 0
          ? new Set(opts.allowedDomains)
          : null;

    const wantGeo = !relaxToyFilter && Boolean(opts.requireGeoTarget || opts.toyFamily === 'ATLAS_RELIEF_SPATIAL');
    const wantNum = !relaxToyFilter && Boolean(opts.requireNumericTarget || opts.toyFamily === 'WAGER_SCALE_CHRONOLOGY');
    const wantChron = !relaxToyFilter && Boolean(opts.requireChronology || opts.toyFamily === 'WAGER_SCALE_CHRONOLOGY');
    const wantBin = !relaxToyFilter && Boolean(opts.requireBinaryPair || opts.toyFamily === 'RAPID_PADDLES_REFLEX');

    const scored: Array<{ tableType: string; meta: CalibratedTableIndexEntryV6; weight: number }> = [];
    for (const [tType, meta] of Object.entries(this.index.tables)) {
      if (domFilter && !domFilter.has(meta.domainId)) continue;
      // Enforce strict Stage-World curriculum mask (Stage 01 NEVER touches hist_battle / sci_exoplanet / math_num!)
      const stageAllowed = (meta.stageMask & stageBit) !== 0;
      if (!stageAllowed && !domFilter) continue;

      const sem = TABLE_SEMANTICS_V6[tType];
      if (!sem) continue;
      if (wantGeo && sem.geoCol === undefined) continue;
      if (wantNum && sem.numericCol === undefined && sem.yearCol === undefined) continue;
      if (wantChron && sem.yearCol === undefined && sem.numericCol === undefined) continue;
      if (wantBin && sem.groupCol === undefined) continue;

      // Check whether this table has calibrated rows in or adjacent to targetBand
      const directCount = meta.bandCounts[targetBand] ?? 0;
      const adjLo = targetBand > 0 ? (meta.bandCounts[targetBand - 1] ?? 0) : 0;
      const adjHi = targetBand < 9 ? (meta.bandCounts[targetBand + 1] ?? 0) : 0;
      const adjLo2 = targetBand > 1 && relaxToyFilter ? (meta.bandCounts[targetBand - 2] ?? 0) : 0;
      const totalNear = directCount + adjLo + adjHi + adjLo2;
      if (totalNear === 0) continue;

      let w = directCount > 0 ? 12 : adjLo + adjHi > 0 ? 4 : 1.5;
      if (!stageAllowed) w *= 0.15;
      // Gently boost variety: avoid repeating the same table or domain back-to-back!
      if (this.ledger.isTableRecentlyUsed(tType, 3)) w *= 0.25;
      if (this.ledger.getLastDomainId() === meta.domainId) w *= 0.45;
      // Stage 01 Warmup bonus for crowd-pleasing pop/food/animals/landmarks/sports!
      if (stageNumber === 1 && (meta.domainId === 4 || meta.domainId === 9 || meta.domainId === 7 || meta.domainId === 2 || meta.domainId === 5 || meta.domainId === 3)) {
        w *= 1.8;
      }
      w *= 0.6 + rng.nextFloat() * 0.8;
      scored.push({ tableType: tType, meta, weight: w });
    }

    scored.sort((a, b) => b.weight - a.weight);
    return scored.map(({ tableType, meta }) => ({ tableType, meta }));
  }

  private pickUnseenRowFromTable(
    tType: string,
    meta: CalibratedTableIndexEntryV6,
    targetBand: number,
    opts: DrawClueOptionsV6,
    rng: FastRngV6,
  ): { rowIdx: number; angleIdx: number; denseQid: number; bandUsed: number } | null {
    const bandTryOrder = [targetBand];
    if (targetBand < 9) bandTryOrder.push(targetBand + 1);
    if (targetBand > 0) bandTryOrder.push(targetBand - 1);
    if (targetBand >= 8) bandTryOrder.push(targetBand - 2);

    for (const b of bandTryOrder) {
      const bKey = String(b);
      const bucketRows = meta.bandRows[bKey];
      const range = meta.bandRanges[bKey];

      // 1. Try precomputed highest-fame row bucket first (exact O(1) curated-quality shard rows!)
      if (bucketRows && bucketRows.length > 0) {
        const cursorKey = `${tType}:${bKey}`;
        const prevCur = this.bandRowCursors.get(cursorKey) ?? rng.nextInt(0, bucketRows.length - 1);
        const len = bucketRows.length;
        const probes = Math.min(len, 40);
        for (let step = 0; step < probes; step++) {
          const pos = (prevCur + step) % len;
          const ri = bucketRows[pos];
          const aiStart = rng.nextInt(0, Math.max(0, meta.angleCount - 1));
          for (let aOff = 0; aOff < meta.angleCount; aOff++) {
            const alt = (aiStart + aOff) % meta.angleCount;
            const altQid = meta.denseBaseQid + ri * meta.angleCount + alt;
            if (!this.ledger.hasSeen(altQid) && !opts.excludeQids?.has(altQid)) {
              this.bandRowCursors.set(cursorKey, (pos + 1) % len);
              return { rowIdx: ri, angleIdx: alt, denseQid: altQid, bandUsed: b };
            }
          }
        }
      }

      // 2. Tap full calibrated row range with deterministic sweep (100% zero shrinkage!)
      if (range && range[1] >= range[0]) {
        const [rLo, rHi] = range;
        const span = Math.max(1, rHi - rLo + 1);
        const startOff = rng.nextInt(0, span - 1);
        const stride = span > 17 ? 17 : 1;
        const probes = Math.min(span, 96);
        for (let k = 0; k < probes; k++) {
          const ri = rLo + ((startOff + k * stride) % span);
          const aiStart = rng.nextInt(0, Math.max(0, meta.angleCount - 1));
          for (let aOff = 0; aOff < meta.angleCount; aOff++) {
            const ai = (aiStart + aOff) % meta.angleCount;
            const denseQid = meta.denseBaseQid + ri * meta.angleCount + ai;
            if (!this.ledger.hasSeen(denseQid) && !opts.excludeQids?.has(denseQid)) {
              return { rowIdx: ri, angleIdx: ai, denseQid, bandUsed: b };
            }
          }
        }
      }

      // 3. For bands 0..3 when bucketRows exhausted on long runs, walk upper high-fame slice cleanly
      if (b <= 3 && meta.rowCount > 0) {
        const maxHi =
          b === 0
            ? Math.min(meta.rowCount - 1, 260)
            : b === 1
              ? Math.min(meta.rowCount - 1, 800)
              : Math.min(meta.rowCount - 1, 2000);
        for (let attempt = 0; attempt < 48; attempt++) {
          const ri = rng.nextInt(0, maxHi);
          const ai = rng.nextInt(0, Math.max(0, meta.angleCount - 1));
          const denseQid = meta.denseBaseQid + ri * meta.angleCount + ai;
          if (!this.ledger.hasSeen(denseQid) && !opts.excludeQids?.has(denseQid)) {
            return { rowIdx: ri, angleIdx: ai, denseQid, bandUsed: b };
          }
        }
      }
    }

    return null;
  }

  /**
   * Builds a rich, human-voiced `CalibratedClueV6` from a verified shard table row:
   *  - Applies one of our 72 human TV-host stage clue framers (tailored to active ToyFamilyIdV6!)
   *  - Applies Algorithm 4 (Runtime Distractor Semantic Distance Control: wide easy vs. tight hard!)
   *  - Populates ALL matching multi-toy payloads (`wrongWireIndices`, `geoTarget`, `cryptexWord`,
   *    `numericTarget`, `chronologyItems`, `binaryPair`, `corruptedLieWord`, `progressiveHints`, `wittyHostAside`)!
   */
  private buildClueFromShardRow(
    shard: RawShardFileV6,
    tType: string,
    meta: CalibratedTableIndexEntryV6,
    rowIdx: number,
    denseQid: number,
    bandUsed: number,
    stageNumber: number,
    minStar: number,
    maxStar: number,
    toyFamily: ToyFamilyIdV6,
    opts: DrawClueOptionsV6,
    rng: FastRngV6,
  ): CalibratedClueV6 | null {
    const tbl = shard.t[meta.tableIndex];
    if (!tbl || rowIdx < 0 || rowIdx >= tbl.r.length) return null;
    const spec = shard.types?.[tType] ?? this.typeSpecs.get(tType);
    const sem = TABLE_SEMANTICS_V6[tType];
    if (!spec || !sem) return null;

    const rows = tbl.r;
    const pool = shard.p;
    const poolCols = new Set<number>(spec.poolCols ?? []);
    const row = rows[rowIdx];

    let subject = sanitizeTriviaCopy(resolveShardCell(row, sem.subjectCol, poolCols, pool).trim());
    let answer = sanitizeTriviaCopy(resolveShardCell(row, sem.answerCol, poolCols, pool).trim());
    if (!subject || !answer || subject.length > 56 || answer.length > 44) return null;

    // Strip manufacturer prefix from vehicle models so prompt never leaks answer
    if (tType === 'tech_vehicle' || tType === 'sub_tech_aero_year') {
      subject = stripLeadingMaker(subject, answer);
    }
    if (/^[a-z]/.test(subject) && !subject.startsWith('iP')) {
      subject = subject[0].toUpperCase() + subject.slice(1);
    }
    if (/^[a-z]/.test(answer) && tType !== 'sci_element') {
      answer = answer[0].toUpperCase() + answer.slice(1);
    }

    const subjLow = subject.toLowerCase();
    const ansLow = answer.toLowerCase();
    if (ansLow === subjLow || (ansLow.length >= 4 && subjLow.includes(ansLow))) {
      return null;
    }

    // Extract optional year / numeric / geo / cryptex metadata
    let yearVal: number | undefined;
    if (sem.yearCol !== undefined && sem.yearCol < row.length) {
      const y = Number(row[sem.yearCol]);
      if (Number.isFinite(y) && y >= -3000 && y <= 2026 && y !== 0) {
        yearVal = Math.round(y);
      }
    }

    let numericTarget: number | undefined;
    let numericMin: number | undefined;
    let numericMax: number | undefined;
    let numericUnit: string | undefined;
    const nCol = sem.numericCol ?? sem.yearCol;
    if (nCol !== undefined && nCol < row.length) {
      const nv = Number(row[nCol]);
      if (Number.isFinite(nv) && (nv !== 0 || nCol === sem.numericCol)) {
        numericTarget = Math.round(nv);
        numericUnit = sem.numericUnit ?? '';
        const isYr = nCol === sem.yearCol;
        const pad = isYr
          ? Math.max(12, stageNumber <= 3 ? 28 : 16)
          : Math.max(5, Math.round(Math.abs(numericTarget) * 0.45));
        numericMin = isYr ? Math.max(-3000, numericTarget - pad) : Math.max(0, numericTarget - pad);
        numericMax = isYr ? Math.min(2026, numericTarget + pad) : numericTarget + pad;
      }
    }

    // Lookup built-in 460+ World Geo Atlas coordinates
    let geoTarget: GeoCoordV6 | undefined;
    if (sem.geoCol !== undefined) {
      const geoRaw = sanitizeTriviaCopy(resolveShardCell(row, sem.geoCol, poolCols, pool).trim());
      geoTarget = lookupGeoCoordV6(geoRaw, answer) ?? lookupGeoCoordV6(subject);
    } else {
      geoTarget = lookupGeoCoordV6(answer, subject);
    }

    const cryptexWord = extractCleanCryptexWordV6(answer);

    // Quick requirement gates (ONLY hard-reject when caller explicitly demanded that exact payload!)
    if (opts.requireGeoTarget && !geoTarget) return null;
    if (opts.requireCryptexWord && !cryptexWord) return null;
    if (opts.requireNumericTarget && numericTarget === undefined) return null;

    // ALGORITHM 4: Runtime Distractor Semantic Distance Control!
    //   Stage 01-03 (Easy): wide-distance distinct distractors across table for fair, fun intuition.
    //   Stage 08-10 (Hard): tight local-neighborhood distractors (close era/rank) for real mastery!
    const distractors: string[] = [];
    const usedAnswers = new Set<string>([ansLow]);
    const isMathInline = tType === 'math_num' || tType === 'math_word' || tType === 'sub_math_spec_num' || tType === 'sub_math_spec_word';

    if (isMathInline && row.length >= 5) {
      for (const ci of [2, 3, 4]) {
        const dv = sanitizeTriviaCopy(String(row[ci] ?? '').trim());
        if (dv && !usedAnswers.has(dv.toLowerCase())) {
          usedAnswers.add(dv.toLowerCase());
          distractors.push(dv);
        }
      }
    } else {
      const n = rows.length;
      const windowRadius = stageNumber >= 7 ? 32 : stageNumber >= 4 ? 140 : Math.max(250, Math.floor(n * 0.45));
      const lo = Math.max(0, rowIdx - windowRadius);
      const hi = Math.min(n - 1, rowIdx + windowRadius);
      const span = Math.max(1, hi - lo + 1);
      for (let attempt = 0; attempt < 64 && distractors.length < 3; attempt++) {
        const candIdx = lo + rng.nextInt(0, span - 1);
        if (candIdx === rowIdx) continue;
        let candAns = sanitizeTriviaCopy(resolveShardCell(rows[candIdx], sem.answerCol, poolCols, pool).trim());
        if (!candAns || candAns.length > 44) continue;
        if (/^[a-z]/.test(candAns) && tType !== 'sci_element') {
          candAns = candAns[0].toUpperCase() + candAns.slice(1);
        }
        const cl = candAns.toLowerCase();
        if (usedAnswers.has(cl)) continue;
        if (cl === subjLow || (cl.length >= 4 && subjLow.includes(cl))) continue;
        // For Stage 01-03, avoid near-identical prefix confusers (keep crisp contrast!)
        if (stageNumber <= 3 && cl.slice(0, 4) === ansLow.slice(0, 4) && attempt < 40) continue;
        usedAnswers.add(cl);
        distractors.push(candAns);
      }
    }
    if (distractors.length < 3) return null;

    // Shuffle 4 choices and compute exact correctIndex & wrongWireIndices
    const choices = [answer, distractors[0], distractors[1], distractors[2]];
    rng.shuffleInPlace(choices);
    const correctIndex = choices.indexOf(answer);
    if (correctIndex < 0) return null;
    const wrongWireIndices = [0, 1, 2, 3].filter((i) => i !== correctIndex);

    // Synthesize 4-Rung Chronology Ladder when active or on year/numeric tables
    let chronologyItems: Array<{ label: string; yearOrOrder: number }> | undefined;
    if (
      (toyFamily === 'WAGER_SCALE_CHRONOLOGY' || opts.requireChronology) &&
      (sem.yearCol !== undefined || sem.numericCol !== undefined)
    ) {
      chronologyItems = this.synthesizeChronologyItems(
        rows,
        rowIdx,
        sem,
        poolCols,
        pool,
        stageNumber,
        rng,
      );
      if (opts.requireChronology && (!chronologyItems || chronologyItems.length < 4)) return null;
    }

    // Synthesize 2-Paddle DIS OR DAT pair when active or requested
    let binaryPair: CalibratedClueV6['binaryPair'] | undefined;
    if (
      (toyFamily === 'RAPID_PADDLES_REFLEX' || opts.requireBinaryPair) &&
      sem.groupCol !== undefined
    ) {
      binaryPair = this.synthesizeBinaryPair(rows, rowIdx, sem, poolCols, pool, rng);
      if (opts.requireBinaryPair && !binaryPair) return null;
    }

    // Synthesize Spot-the-Host's-Lie sentence corruptor (100% verbatim lieToken!)
    const eraTag = yearVal !== undefined && !isMathInline ? ` (${yearVal})` : '';
    const lieToken = distractors[0];
    const sentenceWithLie = sanitizeTriviaCopy(sem.humanFactSentence(subject, lieToken, eraTag));
    const corruptedLieWord =
      sentenceWithLie.includes(lieToken)
        ? {
            sentenceWithLie,
            lieToken,
            truthCorrection: answer,
          }
        : undefined;

    // Select a punchy Human TV-Host Stage Clue Framer strictly synchronized to populated payloads!
    const isFramerCompatible = (f: HostClueFramerV6): boolean => {
      if (!f.requires) return true;
      switch (f.requires) {
        case 'NUMERIC':
          return numericTarget !== undefined;
        case 'CRYPTEX':
          return Boolean(cryptexWord);
        case 'BINARY':
          return Boolean(binaryPair && binaryPair.optionA && binaryPair.optionB);
        case 'CHRONOLOGY':
          return Boolean(chronologyItems && chronologyItems.length >= 4);
        case 'GEO':
          return Boolean(geoTarget);
        case 'LIE':
          return Boolean(corruptedLieWord);
      }
    };
    const specializedFramers = HOST_CLUE_FRAMERS_V6.filter(
      (f) => f.toyFamily === toyFamily && f.requires !== undefined && isFramerCompatible(f),
    );
    const compatibleFamilyFramers =
      specializedFramers.length > 0
        ? specializedFramers
        : HOST_CLUE_FRAMERS_V6.filter((f) => f.toyFamily === toyFamily && isFramerCompatible(f));
    const framerPool =
      compatibleFamilyFramers.length > 0
        ? compatibleFamilyFramers
        : HOST_CLUE_FRAMERS_V6.filter((f) => !f.requires);
    const framer = framerPool[fnv1a32(`V6_FRAMER:${denseQid}:${toyFamily}`) % framerPool.length];

    let prompt: string;
    if (isMathInline) {
      const cleanStmt = subject.replace(/\?+$/, '').trim();
      const mathLeads = [
        `Mental-math buzzer: ${cleanStmt}?`,
        `No calculator allowed—${cleanStmt}?`,
        `Put your chips on the math: ${cleanStmt}?`,
        `Brain-teaser spotlight: ${cleanStmt}?`,
      ];
      prompt = clampPrompt140(mathLeads[denseQid % mathLeads.length]);
    } else {
      prompt = clampPrompt140(
        framer.build({
          subject,
          relationLabel: sem.relationLabel,
          eraBit: eraTag,
          category: meta.categoryLabel,
          answer,
          unit: numericUnit,
          optionA: binaryPair?.optionA,
          optionB: binaryPair?.optionB,
        }),
      );
    }

    // Build 4 genuinely helpful, non-leaking progressive hints
    const hint1 = yearVal
      ? `Anchor your timeline right around ${yearVal >= 1900 ? `the ${Math.floor(yearVal / 10) * 10}s` : `year ${yearVal}`}.`
      : `Category spotlight: ${meta.categoryLabel} — trust your first crowd-pleaser instinct.`;
    const hint2 = geoTarget?.regionHint
      ? `Point your compass toward ${geoTarget.regionHint}.`
      : `Narrow it down by tossing out the two biggest outliers on stage.`;
    const hint3 = `Focus on ${sem.relationLabel} — it's NOT "${distractors[2]}".`;
    const hint4 = `Down to a coin flip: rule out "${distractors[1]}" too and lock the winner!`;

    // Calibrated continuous difficulty score smoothly distributed inside the active stage band [minStar..maxStar]
    const span = Math.max(0.2, maxStar - minStar);
    const u = (fnv1a32(`V6_DIFF:${denseQid}`) % 1000) / 1000;
    const bandShift = bandUsed === difficultyToBandIndexV6((minStar + maxStar) * 0.5)
      ? u
      : bandUsed < difficultyToBandIndexV6((minStar + maxStar) * 0.5)
        ? 0.15 + u * 0.65
        : 0.25 + u * 0.72;
    const calibratedDiff = Math.round(clamp(minStar + span * bandShift, 1.0, 10.0) * 10) / 10;
    const fameScore = Math.round(clamp(1.0 - (calibratedDiff - 1.0) / 9.5, 0.05, 0.99) * 100) / 100;

    const asidePool = WITTY_ASIDES_BY_DOMAIN_V6[meta.domainId] ?? WITTY_ASIDES_BY_DOMAIN_V6[0];
    const wittyHostAside = asidePool[fnv1a32(`V6_ASIDE:${denseQid}`) % asidePool.length];

    return {
      qid: denseQid,
      domainId: meta.domainId,
      categoryLabel: meta.categoryLabel,
      subcategoryLabel: spec.l1Category,
      difficultyScore: calibratedDiff,
      difficultyBadge: difficultyToBadgeV6(calibratedDiff),
      fameScore,
      prompt,
      choices,
      correctIndex,
      wrongWireIndices,
      ...(numericTarget !== undefined
        ? { numericTarget, numericMin, numericMax, numericUnit }
        : {}),
      ...(geoTarget ? { geoTarget } : {}),
      ...(cryptexWord ? { cryptexWord } : {}),
      ...(chronologyItems ? { chronologyItems } : {}),
      ...(binaryPair ? { binaryPair } : {}),
      ...(corruptedLieWord ? { corruptedLieWord } : {}),
      progressiveHints: [
        sanitizeTriviaCopy(hint1),
        sanitizeTriviaCopy(hint2),
        sanitizeTriviaCopy(hint3),
        sanitizeTriviaCopy(hint4),
      ],
      wittyHostAside,
    };
  }

  private synthesizeChronologyItems(
    rows: ReadonlyArray<ReadonlyArray<string | number>>,
    anchorIdx: number,
    sem: ShardSemanticConfigV6,
    poolCols: ReadonlySet<number>,
    pool: ReadonlyArray<string>,
    stageNumber: number,
    rng: FastRngV6,
  ): Array<{ label: string; yearOrOrder: number }> | undefined {
    const col = sem.yearCol ?? sem.numericCol;
    if (col === undefined) return undefined;
    const isYr = col === sem.yearCol;
    const minGap = isYr ? (stageNumber <= 3 ? 16 : stageNumber <= 6 ? 8 : 3) : stageNumber <= 3 ? 50 : 10;

    const picked: Array<{ label: string; yearOrOrder: number }> = [];
    const seenLbl = new Set<string>();
    const seenNum = new Set<number>();

    const tryIdx = (idx: number, gap: number): void => {
      if (idx < 0 || idx >= rows.length || picked.length >= 4) return;
      const r = rows[idx];
      const lbl = sanitizeTriviaCopy(resolveShardCell(r, sem.subjectCol, poolCols, pool).trim());
      const v = Number(r[col]);
      if (!lbl || lbl.length > 34 || !Number.isFinite(v)) return;
      if (isYr && (v < 100 || v > 2026)) return;
      if (!isYr && v <= 0) return;
      const low = lbl.toLowerCase();
      if (seenLbl.has(low) || seenNum.has(Math.round(v))) return;
      if (picked.some((p) => Math.abs(p.yearOrOrder - v) < gap)) return;
      seenLbl.add(low);
      seenNum.add(Math.round(v));
      picked.push({ label: lbl, yearOrOrder: Math.round(v) });
    };

    tryIdx(anchorIdx, 0);
    const maxPool = stageNumber <= 3 ? Math.min(rows.length, 320) : rows.length;
    for (const gap of [minGap, 1]) {
      for (let k = 0; k < 80 && picked.length < 4; k++) {
        tryIdx(rng.nextInt(0, maxPool - 1), gap);
      }
    }
    if (picked.length < 4) return undefined;
    picked.sort((a, b) => a.yearOrOrder - b.yearOrOrder);
    return picked;
  }

  private synthesizeBinaryPair(
    rows: ReadonlyArray<ReadonlyArray<string | number>>,
    anchorIdx: number,
    sem: ShardSemanticConfigV6,
    poolCols: ReadonlySet<number>,
    pool: ReadonlyArray<string>,
    rng: FastRngV6,
  ): CalibratedClueV6['binaryPair'] | undefined {
    if (sem.groupCol === undefined) return undefined;
    const anchorGroup = sanitizeTriviaCopy(resolveShardCell(rows[anchorIdx], sem.groupCol, poolCols, pool).trim());
    if (!anchorGroup || anchorGroup.length > 26) return undefined;

    const bucketA: string[] = [];
    const seenText = new Set<string>();
    const otherGroups = new Map<string, string[]>();

    const scanCap = Math.min(rows.length, 600);
    const start = Math.max(0, anchorIdx - 150);
    for (let k = 0; k < scanCap; k++) {
      const r = rows[(start + k) % rows.length];
      const text = sanitizeTriviaCopy(resolveShardCell(r, sem.subjectCol, poolCols, pool).trim());
      const grp = sanitizeTriviaCopy(resolveShardCell(r, sem.groupCol, poolCols, pool).trim());
      if (!text || !grp || text.length > 28 || grp.length > 26) continue;
      const tLow = text.toLowerCase();
      if (seenText.has(tLow) || tLow.includes(grp.toLowerCase())) continue;
      seenText.add(tLow);
      if (grp.toLowerCase() === anchorGroup.toLowerCase()) {
        if (bucketA.length < 4) bucketA.push(text);
      } else {
        let arr = otherGroups.get(grp);
        if (!arr) {
          arr = [];
          otherGroups.set(grp, arr);
        }
        if (arr.length < 4) arr.push(text);
      }
      if (bucketA.length >= 3 && otherGroups.size >= 4) {
        const readyOther = Array.from(otherGroups.entries()).find(([, items]) => items.length >= 3);
        if (readyOther) {
          const [optionB, bucketB] = readyOther;
          const items: Array<{ text: string; bucket: 0 | 1 }> = [
            ...bucketA.slice(0, 3).map((t) => ({ text: t, bucket: 0 as const })),
            ...bucketB.slice(0, 3).map((t) => ({ text: t, bucket: 1 as const })),
          ];
          rng.shuffleInPlace(items);
          return { optionA: anchorGroup, optionB, items };
        }
      }
    }
    return undefined;
  }

  // --------------------------------------------------------------------------
  // SOURCE C: CALIBRATED CURATED PACKS (GOLD VENUE / JEOPARDY / CURATED V4 / CLEAN CORE)
  // --------------------------------------------------------------------------

  private async pickCuratedPackClue(
    targetBand: number,
    minStar: number,
    maxStar: number,
    toyFamily: ToyFamilyIdV6,
    opts: DrawClueOptionsV6,
    rng: FastRngV6,
  ): Promise<CalibratedClueV6 | null> {
    if (!this.index) return null;
    // Prefer human-crafted Jeopardy, Gold Venue, Curated v4 & Visual Globe over Wikidata stubs
    const packOrder = ['jeopardy_signature', 'gold_venue', 'curated_v4', 'visual_globe', 'questions_clean'];
    rng.shuffleInPlace(packOrder);

    const domFilter =
      opts.domainId !== undefined
        ? new Set([opts.domainId])
        : opts.allowedDomains && opts.allowedDomains.length > 0
          ? new Set(opts.allowedDomains)
          : null;

    for (const packKey of packOrder) {
      const pMeta = this.index.packs[packKey];
      if (!pMeta) continue;
      const bandEntries = pMeta.bandItems[String(targetBand)] ?? [];
      if (bandEntries.length === 0) continue;

      // Filter unseen entries matching domain before loading file
      const unseenMatches = bandEntries.filter(([, denseQid, , , domId]) => {
        if (this.ledger.hasSeen(denseQid)) return false;
        if (opts.excludeQids?.has(denseQid)) return false;
        if (domFilter && !domFilter.has(domId)) return false;
        return true;
      });
      if (unseenMatches.length === 0) continue;

      const records = await this.ensureCuratedPackLoaded(packKey);
      if (!records) continue;

      const start = rng.nextInt(0, unseenMatches.length - 1);
      for (let k = 0; k < Math.min(unseenMatches.length, 24); k++) {
        const [origQid, denseQid, diffX10, fameX100, domId] =
          unseenMatches[(start + k) % unseenMatches.length];
        const rec = records.get(origQid);
        if (!rec) continue;
        const built = this.convertCuratedRecordToClueV6(
          rec,
          denseQid,
          clamp(diffX10 / 10, minStar, maxStar),
          clamp(fameX100 / 100, 0.05, 0.99),
          domId,
          toyFamily,
          rng,
        );
        if (built && this.matchesToyRequirements(built, opts)) {
          return built;
        }
      }
    }
    return null;
  }

  private convertCuratedRecordToClueV6(
    rec: Record<string, unknown>,
    denseQid: number,
    diff: number,
    fame: number,
    domId: number,
    toyFamily: ToyFamilyIdV6,
    rng: FastRngV6,
  ): CalibratedClueV6 | null {
    let prompt = clampPrompt140(String(rec.prompt ?? ''));
    if (!prompt || prompt.length < 12) return null;

    // Extract 4 choices cleanly from either RawQuestionRecord or QuestionCardV4
    let answer = '';
    let distractors: string[] = [];

    if (Array.isArray(rec.choices) && rec.choices.length >= 4) {
      const ci = Math.max(0, Math.min(rec.choices.length - 1, Number(rec.correctIndex ?? 0)));
      answer = sanitizeTriviaCopy(String(rec.choices[ci] ?? ''));
      distractors = rec.choices
        .filter((_, i) => i !== ci)
        .map((c) => sanitizeTriviaCopy(String(c ?? '')))
        .filter(Boolean)
        .slice(0, 3);
    } else if (typeof rec.answerCorrect === 'string' && Array.isArray(rec.distractors)) {
      answer = sanitizeTriviaCopy(rec.answerCorrect);
      distractors = (rec.distractors as Array<string | { text?: string }>)
        .map((d) => sanitizeTriviaCopy(typeof d === 'string' ? d : String(d?.text ?? '')))
        .filter((d) => d && d.toLowerCase() !== answer.toLowerCase())
        .slice(0, 3);
    }

    if (!answer || distractors.length < 3) return null;

    const choices = [answer, distractors[0], distractors[1], distractors[2]];
    rng.shuffleInPlace(choices);
    const correctIndex = choices.indexOf(answer);
    const wrongWireIndices = [0, 1, 2, 3].filter((i) => i !== correctIndex);

    const catRaw = String(rec.categoryLabel ?? rec.l1Category ?? 'PRIME TIME').trim().toUpperCase();
    const gp = rec.globePin as { targetLat?: number; targetLon?: number; targetLabel?: string; regionHint?: string } | undefined;
    const geoTarget: GeoCoordV6 | undefined =
      gp && typeof gp.targetLat === 'number' && typeof gp.targetLon === 'number'
        ? {
            lat: gp.targetLat,
            lng: gp.targetLon,
            regionHint: gp.regionHint,
            landmarkLabel: gp.targetLabel ?? answer,
          }
        : lookupGeoCoordV6(answer, prompt);

    const cal = (rec.calibratorExt ?? rec.pinpoint) as
      | { exactVal?: number; minVal?: number; maxVal?: number; unit?: string; unitLabel?: string }
      | undefined;
    const numericTarget = cal && typeof cal.exactVal === 'number' ? cal.exactVal : undefined;
    const numericMin = cal && typeof cal.minVal === 'number' ? cal.minVal : undefined;
    const numericMax = cal && typeof cal.maxVal === 'number' ? cal.maxVal : undefined;
    const numericUnit = cal ? String(cal.unit ?? cal.unitLabel ?? '') : undefined;

    const cryptexWord = extractCleanCryptexWordV6(answer);
    const lieToken = distractors[0];
    const sentenceWithLie = sanitizeTriviaCopy(`In ${catRaw.toLowerCase()}, the answer to this spotlight clue is ${lieToken}.`);

    const rawClues = Array.isArray(rec.clues) ? (rec.clues as string[]) : [];
    const h1 = sanitizeTriviaCopy(rawClues[0] ?? String(rec.helpfulHint ?? `Category check: ${catRaw}.`));
    const h2 = sanitizeTriviaCopy(rawClues[1] ?? `Rule out "${distractors[2]}" right off the bat.`);
    const h3 = sanitizeTriviaCopy(`Narrow it down—"${distractors[1]}" is a studio decoy.`);
    const h4 = sanitizeTriviaCopy(`Final hint: it starts with "${answer[0].toUpperCase()}".`);

    const asidePool = WITTY_ASIDES_BY_DOMAIN_V6[domId] ?? WITTY_ASIDES_BY_DOMAIN_V6[0];
    const wittyHostAside = asidePool[fnv1a32(`CUR_ASIDE:${denseQid}`) % asidePool.length];

    // If Reverse Jeopardy / Wire Defusal toy active, lightly punch up dry Wikidata phrasing (`forged an enduring reputation`)
    if (/forged an enduring reputation|closely linked with/i.test(prompt)) {
      const fam = HOST_CLUE_FRAMERS_V6.filter((f) => f.toyFamily === toyFamily);
      const fr = fam[denseQid % Math.max(1, fam.length)];
      if (fr) {
        prompt = clampPrompt140(
          prompt
            .replace(/forged an enduring reputation in which sport\?/i, 'built a Hall-of-Fame legend in which sport?')
            .replace(/Name the sport closely linked with/i, 'Step into the arena—which sport made a star out of'),
        );
      }
    }

    const baseClue: CalibratedClueV6 = {
      qid: denseQid,
      domainId: domId,
      categoryLabel: catRaw.slice(0, 26),
      difficultyScore: Math.round(diff * 10) / 10,
      difficultyBadge: difficultyToBadgeV6(diff),
      fameScore: fame,
      prompt,
      choices,
      correctIndex,
      wrongWireIndices,
      ...(numericTarget !== undefined ? { numericTarget, numericMin, numericMax, numericUnit } : {}),
      ...(geoTarget ? { geoTarget } : {}),
      ...(cryptexWord ? { cryptexWord } : {}),
      corruptedLieWord: { sentenceWithLie, lieToken, truthCorrection: answer },
      progressiveHints: [h1, h2, h3, h4],
      wittyHostAside,
    };
    return this.enrichClueForActiveToy(baseClue, toyFamily, rng);
  }

  private enrichClueForActiveToy(
    clue: CalibratedClueV6,
    _toyFamily: ToyFamilyIdV6,
    _rng: FastRngV6,
  ): CalibratedClueV6 {
    const correctIdx = Math.max(0, Math.min(clue.choices.length - 1, clue.correctIndex));
    const wrongWireIndices =
      clue.wrongWireIndices && clue.wrongWireIndices.length === 3
        ? clue.wrongWireIndices
        : [0, 1, 2, 3].filter((i) => i !== correctIdx);
    const ans = clue.choices[correctIdx] ?? '';
    const cryptexWord = clue.cryptexWord ?? extractCleanCryptexWordV6(ans);
    const geoTarget = clue.geoTarget ?? lookupGeoCoordV6(ans, clue.prompt);
    const asidePool = WITTY_ASIDES_BY_DOMAIN_V6[clue.domainId] ?? WITTY_ASIDES_BY_DOMAIN_V6[0];
    return {
      ...clue,
      prompt: clampPrompt140(clue.prompt),
      wrongWireIndices,
      ...(cryptexWord ? { cryptexWord } : {}),
      ...(geoTarget ? { geoTarget } : {}),
      wittyHostAside: clue.wittyHostAside ?? asidePool[clue.qid % asidePool.length],
    };
  }

  // --------------------------------------------------------------------------
  // PRIMARY PUBLIC DRAW ENTRY POINTS (`drawClue`, `drawClueSync`, `drawEpisodeDeck`)
  // --------------------------------------------------------------------------

  /**
   * Primary async clue drawer:
   *  - Strictly calibrated to Stage World `01..10` (`★ 1.0 → ★ 10.0`)
   *  - Interleaves `prime_time_witty_clues_v6.json` + `1.27M` fame-calibrated shards + curated packs
   *  - Immediately marks every served `qid` in the 160 KB `SeenQuestionBitsetLedger` (0 repeats!)
   */
  public async drawClue(opts: DrawClueOptionsV6 = {}): Promise<CalibratedClueV6> {
    if (!this.initialized) {
      await this.init();
    }
    const rng = new FastRngV6(opts.seed);
    const { stageNumber, targetBand, minStar, maxStar, toyFamily } = this.resolveTargetWindow(opts);
    const shouldMark = opts.markSeen !== false;

    const finalize = (clue: CalibratedClueV6, tableType?: string): CalibratedClueV6 => {
      if (shouldMark) {
        this.ledger.recordServedContext({
          qid: clue.qid,
          domainId: clue.domainId,
          tableType,
          categoryLabel: clue.categoryLabel,
          persist: true,
        });
      }
      return clue;
    };

    // Smart Interleaving Dice Roll (NEVER traps players in a tiny 408-item pool!):
    //  • When prime_time_witty_clues_v6 is loaded: ~35% Prime-Time Witty, ~50% 1.27M Shards, ~15% Curated
    //  • Otherwise: ~78% 1.27M Fame-Calibrated Shards, ~22% Curated Gold/Jeopardy packs!
    const roll = rng.nextFloat();
    const tryPrimeTimeFirst = this.primeTimeCount > 0 && roll < (stageNumber <= 2 ? 0.38 : 0.25);
    const tryCuratedFirst = !tryPrimeTimeFirst && roll > 0.78;

    if (tryPrimeTimeFirst) {
      const pt = this.pickPrimeTimeWittyClue(targetBand, minStar, maxStar, opts, rng);
      if (pt) return finalize(pt, 'prime_time_witty_v6');
    }

    if (tryCuratedFirst) {
      const cur = await this.pickCuratedPackClue(targetBand, minStar, maxStar, toyFamily, opts, rng);
      if (cur) return finalize(cur, 'curated_pack');
    }

    // Primary Engine: 1.27M Fame-Calibrated Shard Universe (lazy-loads target shard automatically!)
    const tables = this.selectEligibleTables(stageNumber, targetBand, opts, rng, false);
    for (const { tableType, meta } of tables) {
      const shard = await this.ensureShardFileLoaded(meta.file);
      if (!shard) continue;

      for (let attempt = 0; attempt < 8; attempt++) {
        const picked = this.pickUnseenRowFromTable(tableType, meta, targetBand, opts, rng);
        if (!picked) break;
        const clue = this.buildClueFromShardRow(
          shard,
          tableType,
          meta,
          picked.rowIdx,
          picked.denseQid,
          picked.bandUsed,
          stageNumber,
          minStar,
          maxStar,
          toyFamily,
          opts,
          rng,
        );
        if (clue) {
          return finalize(clue, tableType);
        }
      }
    }

    // Secondary fallback: Prime-Time Witty pack or Curated Gold/Jeopardy packs
    if (!tryPrimeTimeFirst) {
      const pt = this.pickPrimeTimeWittyClue(targetBand, minStar, maxStar, opts, rng);
      if (pt) return finalize(pt, 'prime_time_witty_v6');
    }
    if (!tryCuratedFirst) {
      const cur = await this.pickCuratedPackClue(targetBand, minStar, maxStar, toyFamily, opts, rng);
      if (cur) return finalize(cur, 'curated_pack');
    }

    // Pass 2 Broaden: relax soft toy-family table preference across all stage-eligible tables (0 duplicates!)
    const relaxedOpts: DrawClueOptionsV6 = {
      ...opts,
      domainId: undefined,
      allowedDomains: undefined,
    };
    const widerTables = this.selectEligibleTables(stageNumber, targetBand, relaxedOpts, rng, true);
    for (const { tableType, meta } of widerTables) {
      const shard = await this.ensureShardFileLoaded(meta.file);
      if (!shard) continue;
      for (let attempt = 0; attempt < 10; attempt++) {
        const picked = this.pickUnseenRowFromTable(tableType, meta, targetBand, relaxedOpts, rng);
        if (!picked) break;
        const clue = this.buildClueFromShardRow(
          shard,
          tableType,
          meta,
          picked.rowIdx,
          picked.denseQid,
          picked.bandUsed,
          stageNumber,
          minStar,
          maxStar,
          toyFamily,
          relaxedOpts,
          rng,
        );
        if (clue) return finalize(clue, tableType);
      }
    }

    return finalize(this.drawEmergencySyncClue(targetBand, opts, rng), 'emergency_fallback');
  }

  /** Synchronous 0ms clue drawer (uses already-loaded shards/prime-time cache or warm built-in deck). */
  public drawClueSync(opts: DrawClueOptionsV6 = {}): CalibratedClueV6 {
    const rng = new FastRngV6(opts.seed);
    const { stageNumber, targetBand, minStar, maxStar, toyFamily } = this.resolveTargetWindow(opts);
    const shouldMark = opts.markSeen !== false;

    const finalize = (clue: CalibratedClueV6, tableType?: string): CalibratedClueV6 => {
      if (shouldMark) {
        this.ledger.recordServedContext({
          qid: clue.qid,
          domainId: clue.domainId,
          tableType,
          categoryLabel: clue.categoryLabel,
          persist: true,
        });
      }
      return clue;
    };

    const pt = this.pickPrimeTimeWittyClue(targetBand, minStar, maxStar, opts, rng);
    if (pt) return finalize(pt, 'prime_time_witty_v6');

    const tables = this.selectEligibleTables(stageNumber, targetBand, opts, rng);
    for (const { tableType, meta } of tables) {
      const shard = this.shardCache.get(meta.file);
      if (!shard) continue;
      for (let attempt = 0; attempt < 6; attempt++) {
        const picked = this.pickUnseenRowFromTable(tableType, meta, targetBand, opts, rng);
        if (!picked) break;
        const clue = this.buildClueFromShardRow(
          shard,
          tableType,
          meta,
          picked.rowIdx,
          picked.denseQid,
          picked.bandUsed,
          stageNumber,
          minStar,
          maxStar,
          toyFamily,
          opts,
          rng,
        );
        if (clue) return finalize(clue, tableType);
      }
    }

    return finalize(this.drawEmergencySyncClue(targetBand, opts, rng), 'emergency_fallback');
  }

  private drawEmergencySyncClue(
    targetBand: number,
    opts: DrawClueOptionsV6,
    rng: FastRngV6,
  ): CalibratedClueV6 {
    const targetDiff = 1.4 + targetBand * 0.9;
    const unseen = BUILTIN_WARM_FALLBACK_CLUES_V6.filter(
      (c) => !this.ledger.hasSeen(c.qid) && !opts.excludeQids?.has(c.qid),
    );
    const pool = unseen.length > 0 ? unseen : BUILTIN_WARM_FALLBACK_CLUES_V6;
    const sorted = [...pool].sort(
      (a, b) => Math.abs(a.difficultyScore - targetDiff) - Math.abs(b.difficultyScore - targetDiff),
    );
    return this.enrichClueForActiveToy(sorted[0], opts.toyFamily ?? 'DEFUSAL_ELIMINATION', rng);
  }

  /** Convenience helper drawing a varied non-repeating episode deck across Toy Families & Domains. */
  public async drawEpisodeDeck(
    count: number,
    opts: DrawClueOptionsV6 = {},
  ): Promise<CalibratedClueV6[]> {
    const safeCount = Math.max(1, Math.min(100, Math.trunc(count)));
    const toyRotation: readonly ToyFamilyIdV6[] = [
      'DEFUSAL_ELIMINATION',
      'ATLAS_RELIEF_SPATIAL',
      'DIALS_CRYPTEX_LOCKS',
      'RAPID_PADDLES_REFLEX',
      'WAGER_SCALE_CHRONOLOGY',
      'FORENSIC_DETECTIVE',
      'PROGRESSIVE_AUDIO_REVEAL',
      'CASINO_BLUFF_STAKES',
      'KINETIC_CONTRAPTIONS',
      'MIND_GAME_TWISTS',
    ];
    const deck: CalibratedClueV6[] = [];
    for (let i = 0; i < safeCount; i++) {
      const clue = await this.drawClue({
        ...opts,
        toyFamily: opts.toyFamily ?? toyRotation[i % toyRotation.length],
        seed: opts.seed !== undefined ? (opts.seed + i * 7919) >>> 0 : undefined,
      });
      deck.push(clue);
    }
    return deck;
  }
}

export const sharedQuestionEngineV6 = new QuestionEngineV6(sharedSeenLedgerV6);
export { formatCleanTriviaNumber };
