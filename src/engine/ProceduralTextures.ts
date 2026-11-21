import * as THREE from 'three';

export interface PBRTextureSet {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

export interface EarthTextureSet extends PBRTextureSet {
  emissiveMap: THREE.CanvasTexture;
}

export interface FacetTextureOptions {
  active?: boolean;
  accentHex?: string;
  stressFracture?: boolean;
  redacted?: boolean;
  correct?: boolean;
  wrong?: boolean;
  indexLabel?: string;
  overclockProgress?: number;
}

// Deterministic fast PRNG for crisp reproducible procedural grain
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not acquire 2D context for procedural texture');
  }
  return [canvas, ctx];
}

function configureRepeatTexture(tex: THREE.CanvasTexture, srgb: boolean, repeatX = 1, repeatY = 1): THREE.CanvasTexture {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

let cachedBrass: PBRTextureSet | null = null;
let cachedObsidian: PBRTextureSet | null = null;
let cachedTravertine: PBRTextureSet | null = null;
let cachedEarth: EarthTextureSet | null = null;
let cachedGlowSprite: THREE.CanvasTexture | null = null;

/**
 * Brushed champagne brass PBR map set (machined horological metal).
 */
export function getBrushedBrassTextures(): PBRTextureSet {
  if (cachedBrass) return cachedBrass;
  const size = 512;
  const rand = mulberry32(1013);

  const [cMap, ctxMap] = makeCanvas(size, size);
  const [cRough, ctxRough] = makeCanvas(size, size);
  const [cBump, ctxBump] = makeCanvas(size, size);

  // Base warm champagne brass gradient
  const grad = ctxMap.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#d8b467');
  grad.addColorStop(0.35, '#e7c87e');
  grad.addColorStop(0.68, '#b99245');
  grad.addColorStop(1, '#d9b568');
  ctxMap.fillStyle = grad;
  ctxMap.fillRect(0, 0, size, size);

  ctxRough.fillStyle = '#484848'; // ~0.28 base roughness
  ctxRough.fillRect(0, 0, size, size);

  ctxBump.fillStyle = '#808080';
  ctxBump.fillRect(0, 0, size, size);

  // Fine horizontal anisotropic brushed streaks
  for (let i = 0; i < 1600; i++) {
    const y = rand() * size;
    const x = rand() * size;
    const len = 40 + rand() * 220;
    const bright = rand() > 0.5;
    const alpha = 0.04 + rand() * 0.1;

    ctxMap.strokeStyle = bright ? `rgba(255, 240, 198, ${alpha})` : `rgba(82, 56, 18, ${alpha})`;
    ctxMap.lineWidth = 0.6 + rand() * 1.1;
    ctxMap.beginPath();
    ctxMap.moveTo(x, y);
    ctxMap.lineTo(x + len, y);
    ctxMap.stroke();

    const rVal = bright ? 58 : 112;
    ctxRough.strokeStyle = `rgba(${rVal},${rVal},${rVal},${alpha * 1.4})`;
    ctxRough.lineWidth = 1;
    ctxRough.beginPath();
    ctxRough.moveTo(x, y);
    ctxRough.lineTo(x + len, y);
    ctxRough.stroke();

    const bVal = bright ? 168 : 96;
    ctxBump.strokeStyle = `rgba(${bVal},${bVal},${bVal},${alpha * 1.5})`;
    ctxBump.lineWidth = 1;
    ctxBump.beginPath();
    ctxBump.moveTo(x, y);
    ctxBump.lineTo(x + len, y);
    ctxBump.stroke();
  }

  cachedBrass = {
    map: configureRepeatTexture(new THREE.CanvasTexture(cMap), true, 2, 2),
    roughnessMap: configureRepeatTexture(new THREE.CanvasTexture(cRough), false, 2, 2),
    bumpMap: configureRepeatTexture(new THREE.CanvasTexture(cBump), false, 2, 2),
  };
  return cachedBrass;
}

/**
 * Honed volcanic obsidian PBR texture set with delicate mineral veining & satin sheen.
 */
export function getObsidianTextures(): PBRTextureSet {
  if (cachedObsidian) return cachedObsidian;
  const size = 512;
  const rand = mulberry32(2047);

  const [cMap, ctxMap] = makeCanvas(size, size);
  const [cRough, ctxRough] = makeCanvas(size, size);
  const [cBump, ctxBump] = makeCanvas(size, size);

  const grad = ctxMap.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, '#0a0d15');
  grad.addColorStop(0.5, '#121826');
  grad.addColorStop(1, '#090c13');
  ctxMap.fillStyle = grad;
  ctxMap.fillRect(0, 0, size, size);

  ctxRough.fillStyle = '#383838'; // glossy honed finish (~0.22)
  ctxRough.fillRect(0, 0, size, size);

  ctxBump.fillStyle = '#808080';
  ctxBump.fillRect(0, 0, size, size);

  // Subtle smoked mineral clouds
  for (let i = 0; i < 90; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 20 + rand() * 85;
    const g = ctxMap.createRadialGradient(x, y, 2, x, y, r);
    const shade = rand() > 0.45 ? 'rgba(34, 46, 72, 0.08)' : 'rgba(4, 6, 10, 0.14)';
    g.addColorStop(0, shade);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctxMap.fillStyle = g;
    ctxMap.fillRect(x - r, y - r, r * 2, r * 2);

    const rg = ctxRough.createRadialGradient(x, y, 2, x, y, r);
    rg.addColorStop(0, rand() > 0.5 ? 'rgba(95,95,95,0.12)' : 'rgba(26,26,26,0.12)');
    rg.addColorStop(1, 'rgba(56,56,56,0)');
    ctxRough.fillStyle = rg;
    ctxRough.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Ultra-fine diagonal quartz micro-veins
  for (let v = 0; v < 14; v++) {
    let px = rand() * size;
    let py = rand() * size;
    ctxMap.strokeStyle = `rgba(110, 128, 165, ${0.03 + rand() * 0.05})`;
    ctxMap.lineWidth = 0.6 + rand() * 0.9;
    ctxBump.strokeStyle = 'rgba(148, 148, 148, 0.18)';
    ctxBump.lineWidth = 0.8;

    ctxMap.beginPath();
    ctxBump.beginPath();
    ctxMap.moveTo(px, py);
    ctxBump.moveTo(px, py);
    for (let s = 0; s < 12; s++) {
      px += 16 + rand() * 26;
      py += (rand() - 0.35) * 24;
      ctxMap.lineTo(px, py);
      ctxBump.lineTo(px, py);
    }
    ctxMap.stroke();
    ctxBump.stroke();
  }

  // Micro mineral speckles
  for (let i = 0; i < 1200; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const a = 0.03 + rand() * 0.06;
    ctxMap.fillStyle = `rgba(170, 185, 220, ${a})`;
    ctxMap.fillRect(x, y, 1.2, 1.2);
  }

  cachedObsidian = {
    map: configureRepeatTexture(new THREE.CanvasTexture(cMap), true, 2, 2),
    roughnessMap: configureRepeatTexture(new THREE.CanvasTexture(cRough), false, 2, 2),
    bumpMap: configureRepeatTexture(new THREE.CanvasTexture(cBump), false, 2, 2),
  };
  return cachedObsidian;
}

/**
 * Architectural dark travertine / honed limestone for Sovereign venues.
 */
export function getTravertineTextures(): PBRTextureSet {
  if (cachedTravertine) return cachedTravertine;
  const size = 512;
  const rand = mulberry32(3089);

  const [cMap, ctxMap] = makeCanvas(size, size);
  const [cRough, ctxRough] = makeCanvas(size, size);
  const [cBump, ctxBump] = makeCanvas(size, size);

  ctxMap.fillStyle = '#2d2924';
  ctxMap.fillRect(0, 0, size, size);

  ctxRough.fillStyle = '#b4b4b4';
  ctxRough.fillRect(0, 0, size, size);

  ctxBump.fillStyle = '#808080';
  ctxBump.fillRect(0, 0, size, size);

  // Sedimentary horizontal banding
  for (let y = 0; y < size; y += 3) {
    const wave = Math.sin(y * 0.05) * 10 + (rand() - 0.5) * 14;
    const r = Math.max(24, Math.min(82, 49 + wave));
    const g = Math.max(22, Math.min(76, 44 + wave * 0.92));
    const b = Math.max(18, Math.min(68, 37 + wave * 0.8));
    ctxMap.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, 0.45)`;
    ctxMap.fillRect(0, y, size, 3 + rand() * 4);

    const bShade = 128 + wave * 1.4;
    ctxBump.fillStyle = `rgba(${bShade | 0},${bShade | 0},${bShade | 0}, 0.25)`;
    ctxBump.fillRect(0, y, size, 3);
  }

  // Travertine pores & subtle warm mineral flecks
  for (let i = 0; i < 600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const w = 4 + rand() * 18;
    const h = 1 + rand() * 2.5;
    ctxMap.fillStyle = rand() > 0.3 ? 'rgba(18, 16, 14, 0.26)' : 'rgba(145, 126, 98, 0.14)';
    ctxMap.fillRect(x, y, w, h);

    ctxRough.fillStyle = 'rgba(220, 220, 220, 0.28)';
    ctxRough.fillRect(x, y, w, h);

    ctxBump.fillStyle = 'rgba(65, 65, 65, 0.35)';
    ctxBump.fillRect(x, y, w, h);
  }

  // Subtle architectural ashlar block seam lines
  ctxMap.strokeStyle = 'rgba(12, 10, 9, 0.35)';
  ctxMap.lineWidth = 2;
  ctxBump.strokeStyle = 'rgba(40, 40, 40, 0.6)';
  ctxBump.lineWidth = 2;
  for (let row = 0; row < 4; row++) {
    const y = (row * size) / 4;
    ctxMap.beginPath();
    ctxMap.moveTo(0, y);
    ctxMap.lineTo(size, y);
    ctxMap.stroke();
    ctxBump.beginPath();
    ctxBump.moveTo(0, y);
    ctxBump.lineTo(size, y);
    ctxBump.stroke();
  }

  cachedTravertine = {
    map: configureRepeatTexture(new THREE.CanvasTexture(cMap), true, 2, 2),
    roughnessMap: configureRepeatTexture(new THREE.CanvasTexture(cRough), false, 2, 2),
    bumpMap: configureRepeatTexture(new THREE.CanvasTexture(cBump), false, 2, 2),
  };
  return cachedTravertine;
}

// Simplified authentic continent polygons in [lon, lat] degrees for procedural equirectangular Earth
const CONTINENT_POLYGONS: Array<Array<[number, number]>> = [
  // North America
  [
    [-168, 66], [-152, 71], [-132, 69], [-112, 68], [-94, 62], [-80, 62], [-64, 54],
    [-55, 48], [-66, 44], [-74, 40], [-81, 30], [-82, 25], [-89, 30], [-97, 26],
    [-96, 18], [-88, 21], [-83, 10], [-78, 8], [-85, 11], [-94, 15], [-105, 20],
    [-112, 28], [-117, 32], [-124, 40], [-125, 49], [-136, 57], [-152, 60], [-164, 55],
  ],
  // Greenland
  [
    [-52, 60], [-42, 61], [-32, 69], [-19, 77], [-28, 82], [-52, 82], [-66, 76], [-56, 68],
  ],
  // South America
  [
    [-78, 9], [-71, 12], [-61, 10], [-50, 2], [-35, -6], [-38, -14], [-41, -22],
    [-48, -26], [-54, -34], [-63, -40], [-67, -54], [-74, -52], [-73, -40], [-71, -20],
    [-80, -5], [-79, 4],
  ],
  // Europe (Continental)
  [
    [-9, 37], [-9, 43], [-2, 43], [-4, 48], [2, 51], [8, 54], [10, 58], [5, 60],
    [12, 66], [22, 70], [31, 70], [42, 66], [58, 68], [60, 55], [48, 46], [38, 45],
    [29, 41], [23, 37], [16, 40], [12, 44], [6, 43], [0, 39], [-5, 36],
  ],
  // Great Britain & Ireland
  [
    [-6, 50], [1, 51], [1, 53], [-2, 58], [-6, 58], [-5, 54],
  ],
  [
    [-10, 52], [-6, 52], [-6, 55], [-9, 55],
  ],
  // Iceland
  [
    [-24, 64], [-14, 64], [-15, 66], [-23, 66],
  ],
  // Africa
  [
    [-17, 15], [-13, 28], [-6, 36], [10, 37], [12, 33], [24, 32], [33, 31],
    [40, 20], [43, 12], [51, 11], [41, -2], [40, -15], [35, -24], [28, -33],
    [18, -34], [14, -22], [12, -8], [9, 4], [2, 6], [-8, 5], [-16, 11],
  ],
  // Madagascar
  [
    [44, -25], [47, -25], [50, -13], [47, -14], [44, -20],
  ],
  // Asia
  [
    [35, 36], [42, 42], [50, 40], [56, 54], [60, 68], [76, 72], [104, 76], [134, 72],
    [168, 66], [160, 58], [142, 54], [136, 45], [128, 38], [122, 40], [121, 31],
    [118, 24], [108, 21], [109, 12], [103, 2], [100, 7], [98, 16], [90, 22],
    [80, 15], [77, 8], [72, 21], [66, 25], [58, 25], [50, 29], [59, 22], [54, 16],
    [44, 13], [36, 28], [35, 33],
  ],
  // Japan Archipelago
  [
    [130, 31], [132, 33], [136, 34], [140, 36], [142, 41], [145, 44], [141, 44],
    [139, 39], [135, 36], [130, 34],
  ],
  // Southeast Asia / Indonesia / Philippines
  [
    [96, 5], [105, -6], [116, -8], [114, -6], [104, -2], [98, 2],
  ],
  [
    [109, 1], [117, 6], [118, 0], [112, -3],
  ],
  [
    [120, 18], [124, 14], [126, 7], [122, 8], [120, 14],
  ],
  // Australia
  [
    [114, -22], [122, -17], [131, -12], [136, -12], [142, -11], [146, -18],
    [153, -27], [150, -37], [141, -38], [136, -34], [126, -33], [115, -34], [113, -27],
  ],
  // New Zealand
  [
    [167, -46], [174, -41], [178, -37], [174, -35], [171, -42],
  ],
  // Antarctica subtle polar ring
  [
    [-180, -72], [-120, -73], [-60, -68], [0, -70], [60, -69], [120, -67], [180, -72],
    [180, -89], [-180, -89],
  ],
];

/**
 * Procedural Sovereign Obsidian-and-Gold Equirectangular World Globe PBR textures.
 */
export function getEarthTextures(): EarthTextureSet {
  if (cachedEarth) return cachedEarth;
  const w = 1024;
  const h = 512;

  const [cMap, ctxMap] = makeCanvas(w, h);
  const [cRough, ctxRough] = makeCanvas(w, h);
  const [cEmit, ctxEmit] = makeCanvas(w, h);
  const [cBump, ctxBump] = makeCanvas(w, h);

  const lonToX = (lon: number) => ((lon + 180) / 360) * w;
  const latToY = (lat: number) => ((90 - lat) / 180) * h;

  // Glossy dark obsidian ocean base
  const oceanGrad = ctxMap.createLinearGradient(0, 0, 0, h);
  oceanGrad.addColorStop(0, '#09101e');
  oceanGrad.addColorStop(0.5, '#070c16');
  oceanGrad.addColorStop(1, '#09101e');
  ctxMap.fillStyle = oceanGrad;
  ctxMap.fillRect(0, 0, w, h);

  // Ocean is sleek low-roughness obsidian glass (~0.18)
  ctxRough.fillStyle = '#2e2e2e';
  ctxRough.fillRect(0, 0, w, h);

  ctxEmit.fillStyle = '#000000';
  ctxEmit.fillRect(0, 0, w, h);

  ctxBump.fillStyle = '#585858';
  ctxBump.fillRect(0, 0, w, h);

  // Brass graticule grid (every 15° longitude, 15° latitude)
  ctxMap.strokeStyle = 'rgba(212, 168, 83, 0.16)';
  ctxMap.lineWidth = 1;
  ctxEmit.strokeStyle = 'rgba(180, 138, 60, 0.12)';
  ctxEmit.lineWidth = 0.8;

  for (let lon = -180; lon <= 180; lon += 15) {
    const x = lonToX(lon);
    const isMajor = lon === 0 || lon === -90 || lon === 90;
    ctxMap.strokeStyle = isMajor ? 'rgba(232, 194, 108, 0.34)' : 'rgba(212, 168, 83, 0.13)';
    ctxMap.lineWidth = isMajor ? 1.5 : 0.8;
    ctxMap.beginPath();
    ctxMap.moveTo(x, 0);
    ctxMap.lineTo(x, h);
    ctxMap.stroke();

    if (isMajor) {
      ctxEmit.beginPath();
      ctxEmit.moveTo(x, 0);
      ctxEmit.lineTo(x, h);
      ctxEmit.stroke();
    }
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = latToY(lat);
    const isEq = lat === 0;
    const isTropic = Math.abs(lat) === 30 || Math.abs(lat) === 60;
    ctxMap.strokeStyle = isEq
      ? 'rgba(247, 223, 156, 0.42)'
      : isTropic
      ? 'rgba(212, 168, 83, 0.22)'
      : 'rgba(212, 168, 83, 0.12)';
    ctxMap.lineWidth = isEq ? 1.8 : 0.8;
    ctxMap.beginPath();
    ctxMap.moveTo(0, y);
    ctxMap.lineTo(w, y);
    ctxMap.stroke();

    if (isEq) {
      ctxEmit.strokeStyle = 'rgba(212, 168, 83, 0.24)';
      ctxEmit.beginPath();
      ctxEmit.moveTo(0, y);
      ctxEmit.lineTo(w, y);
      ctxEmit.stroke();
    }
  }

  // Draw continents in raised slate-bronze with luminous gold coastlines
  const drawPoly = (ctx: CanvasRenderingContext2D, pts: Array<[number, number]>) => {
    ctx.beginPath();
    pts.forEach(([lon, lat], idx) => {
      const x = lonToX(lon);
      const y = latToY(lat);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
  };

  for (const poly of CONTINENT_POLYGONS) {
    // Albedo landmass: refined deep bronze-slate with champagne gold shore
    drawPoly(ctxMap, poly);
    ctxMap.fillStyle = '#1d2434';
    ctxMap.fill();
    ctxMap.strokeStyle = '#e8c474';
    ctxMap.lineWidth = 2.0;
    ctxMap.lineJoin = 'round';
    ctxMap.stroke();

    // Land is satin-matte (~0.62 roughness) contrasting against glossy oceans
    drawPoly(ctxRough, poly);
    ctxRough.fillStyle = '#9e9e9e';
    ctxRough.fill();
    ctxRough.strokeStyle = '#404040';
    ctxRough.lineWidth = 2.0;
    ctxRough.stroke();

    // Raised elevation bump
    drawPoly(ctxBump, poly);
    ctxBump.fillStyle = '#b8b8b8';
    ctxBump.fill();
    ctxBump.strokeStyle = '#e5e5e5';
    ctxBump.lineWidth = 2.2;
    ctxBump.stroke();

    // Luminous thin golden coastlines in emissive map
    drawPoly(ctxEmit, poly);
    ctxEmit.fillStyle = 'rgba(30, 38, 56, 0.18)';
    ctxEmit.fill();
    ctxEmit.strokeStyle = 'rgba(235, 190, 96, 0.65)';
    ctxEmit.lineWidth = 1.6;
    ctxEmit.lineJoin = 'round';
    ctxEmit.stroke();
  }

  // Subtle golden city/circuit glows at key Meridian nodes
  const hubs: Array<[number, number, string]> = [
    [6.1, 46.2, 'rgba(247, 223, 156, 0.85)'], // CH
    [-0.1, 51.5, 'rgba(247, 223, 156, 0.85)'], // GB
    [139.7, 35.7, 'rgba(92, 225, 230, 0.85)'], // JP
    [-43.2, -22.9, 'rgba(212, 168, 83, 0.45)'], // BR
    [31.2, 30.0, 'rgba(212, 168, 83, 0.55)'], // EG
    [-21.9, 64.1, 'rgba(130, 190, 240, 0.45)'], // IS
    [103.8, 1.35, 'rgba(212, 168, 83, 0.45)'], // SG
  ];
  for (const [lon, lat, col] of hubs) {
    const x = lonToX(lon);
    const y = latToY(lat);
    const g = ctxEmit.createRadialGradient(x, y, 1, x, y, 14);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctxEmit.fillStyle = g;
    ctxEmit.fillRect(x - 14, y - 14, 28, 28);
  }

  const mk = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return t;
  };

  cachedEarth = {
    map: mk(cMap, true),
    roughnessMap: mk(cRough, false),
    emissiveMap: mk(cEmit, true),
    bumpMap: mk(cBump, false),
  };
  return cachedEarth;
}

/**
 * Soft additive glow particle texture for dust motes, sparks, and halos.
 */
export function getGlowSpriteTexture(): THREE.CanvasTexture {
  if (cachedGlowSprite) return cachedGlowSprite;
  const size = 128;
  const [canvas, ctx] = makeCanvas(size, size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  g.addColorStop(0.22, 'rgba(255, 245, 215, 0.85)');
  g.addColorStop(0.55, 'rgba(220, 180, 100, 0.24)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  cachedGlowSprite = tex;
  return tex;
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) {
        lines.push(current);
        current = word;
      } else {
        lines.push(word);
        current = '';
      }
      if (lines.length === maxLines - 1) {
        // Put remainder on last line (font scaling handles width)
        continue;
      }
    }
  }
  if (current) lines.push(current);

  if (lines.length > maxLines) {
    const merged = lines.slice(maxLines - 1).join(' ');
    lines.length = maxLines - 1;
    lines.push(merged);
  }
  return lines;
}

/**
 * High-DPI frosted obsidian-glass Answer Facet plaque texture (512x256).
 * Engineered for razor-sharp mobile 9:16 legibility with beveled champagne gold trim,
 * active glow, Horizon Lens diagonal stress fractures, and Diplomatic Redaction bars.
 */
export function createFacetTexture(text: string, options: FacetTextureOptions = {}): THREE.CanvasTexture {
  const w = 512;
  const h = 256;
  const [canvas, ctx] = makeCanvas(w, h);

  const active = Boolean(options.active);
  const accent = options.accentHex ?? '#d4a853';
  const stressFracture = Boolean(options.stressFracture);
  const redacted = Boolean(options.redacted);
  const correct = Boolean(options.correct);
  const wrong = Boolean(options.wrong);
  const oc = options.overclockProgress ?? 0;

  // Base frosted obsidian glass background
  const bg = ctx.createLinearGradient(0, 0, w, h);
  if (correct) {
    bg.addColorStop(0, '#0c261f');
    bg.addColorStop(0.5, '#12382c');
    bg.addColorStop(1, '#081b15');
  } else if (wrong) {
    bg.addColorStop(0, '#2a0d14');
    bg.addColorStop(0.5, '#1b0910');
    bg.addColorStop(1, '#12060a');
  } else if (active) {
    bg.addColorStop(0, '#101829');
    bg.addColorStop(0.5, '#172238');
    bg.addColorStop(1, '#0c1220');
  } else {
    bg.addColorStop(0, '#090e18');
    bg.addColorStop(0.5, '#0d1423');
    bg.addColorStop(1, '#070a12');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle diagonal frosted glass reflection sheen
  const sheen = ctx.createLinearGradient(0, 0, w * 0.8, h);
  sheen.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
  sheen.addColorStop(0.32, 'rgba(255, 255, 255, 0.02)');
  sheen.addColorStop(0.52, 'rgba(255, 255, 255, 0.0)');
  sheen.addColorStop(1, active ? 'rgba(247, 223, 156, 0.07)' : 'rgba(255, 255, 255, 0.02)');
  ctx.fillStyle = sheen;
  ctx.fillRect(10, 10, w - 20, h - 20);

  // Overclock incandescent molten inner bloom when holding lock
  if (active && oc > 0.02) {
    const ocGrad = ctx.createRadialGradient(w / 2, h / 2, 16, w / 2, h / 2, w * 0.56);
    ocGrad.addColorStop(0, `rgba(255, 224, 128, ${0.32 * oc})`);
    ocGrad.addColorStop(0.65, `rgba(245, 168, 52, ${0.24 * oc})`);
    ocGrad.addColorStop(1, 'rgba(255, 110, 30, 0)');
    ctx.fillStyle = ocGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Outer beveled champagne-gold border
  const borderColor = correct
    ? '#57f2a8'
    : wrong
    ? '#ff5263'
    : active
    ? oc > 0.35
      ? '#fff2ba'
      : '#f7df9c'
    : 'rgba(212, 168, 83, 0.55)';

  ctx.save();
  if (active || correct || wrong) {
    ctx.shadowColor = correct
      ? 'rgba(87, 242, 168, 0.85)'
      : wrong
      ? 'rgba(255, 70, 90, 0.85)'
      : 'rgba(247, 223, 156, 0.85)';
    ctx.shadowBlur = active ? 18 + oc * 18 : 16;
  }
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = active || correct || wrong ? 6 : 3.5;
  ctx.strokeRect(10, 10, w - 20, h - 20);
  ctx.restore();

  // Inner hairline architectural bevel
  ctx.strokeStyle = active ? 'rgba(247, 223, 156, 0.48)' : 'rgba(212, 168, 83, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(20, 20, w - 40, h - 40);

  // Domain accent top & bottom precision bars
  ctx.fillStyle = correct ? '#57f2a8' : wrong ? '#ff5263' : accent;
  ctx.globalAlpha = active ? 0.95 : 0.5;
  ctx.fillRect(w / 2 - 64, 10, 128, 5);
  ctx.fillRect(w / 2 - 44, h - 15, 88, 4);
  ctx.globalAlpha = 1;

  // Art-Deco corner L-brackets
  const bk = 24;
  ctx.strokeStyle = active ? '#fff0c2' : '#c69d4c';
  ctx.lineWidth = 3;
  const corners: Array<[number, number, number, number]> = [
    [22, 22, 1, 1],
    [w - 22, 22, -1, 1],
    [22, h - 22, 1, -1],
    [w - 22, h - 22, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + dy * bk);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + dx * bk, cy);
    ctx.stroke();
  }

  // Index numeral badge (top-left)
  if (options.indexLabel) {
    ctx.font = '700 18px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = active ? 'rgba(247, 223, 156, 0.85)' : 'rgba(168, 179, 199, 0.45)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(options.indexLabel, 32, 28);
  }

  // Horizon Probability Lens: subtle crimson diagonal glass fracture lines!
  if (stressFracture && !redacted) {
    ctx.save();
    ctx.strokeStyle = 'rgba(235, 68, 90, 0.78)';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(235, 68, 90, 0.7)';
    ctx.shadowBlur = 8;

    // Top-right stress fracture cluster
    ctx.beginPath();
    ctx.moveTo(w - 18, 18);
    ctx.lineTo(w - 88, 72);
    ctx.lineTo(w - 140, 118);
    ctx.moveTo(w - 88, 72);
    ctx.lineTo(w - 64, 128);
    ctx.moveTo(w - 88, 72);
    ctx.lineTo(w - 148, 56);
    // Bottom-left matching hairline stress line
    ctx.moveTo(18, h - 18);
    ctx.lineTo(94, h - 76);
    ctx.lineTo(138, h - 98);
    ctx.moveTo(94, h - 76);
    ctx.lineTo(116, h - 38);
    ctx.stroke();

    // Subtle telemetry label
    ctx.shadowBlur = 0;
    ctx.font = '700 15px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = 'rgba(255, 110, 125, 0.88)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('◈ STRESS', w - 32, 28);
    ctx.restore();
  }

  // Main Answer Typography — clean multi-line wrap & auto-fit for <= 28 char text
  const maxTextW = w - 84;
  let fontSize = text.length <= 12 ? 46 : text.length <= 20 ? 38 : 33;
  let lines: string[] = [text];

  for (; fontSize >= 22; fontSize -= 2) {
    ctx.font = `700 ${fontSize}px "Inter", "Segoe UI", system-ui, sans-serif`;
    lines = wrapLines(ctx, text, maxTextW, 3);
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width));
    if (widest <= maxTextW && lines.length <= 3) break;
  }

  const lineHeight = fontSize * 1.22;
  const totalTextH = lines.length * lineHeight;
  const startY = h / 2 - totalTextH / 2 + lineHeight * 0.5;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (redacted) {
    // Muted ghost text behind heavy classified redaction bars
    ctx.fillStyle = 'rgba(130, 140, 160, 0.16)';
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, startY + i * lineHeight);
    });

    // Diagonal hazard & solid obsidian classified bars
    ctx.save();
    ctx.fillStyle = '#07090f';
    ctx.fillRect(42, h / 2 - 42, w - 84, 84);
    ctx.strokeStyle = '#e64553';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(42, h / 2 - 42, w - 84, 84);

    // Subtle diagonal tape stripes inside bar
    ctx.beginPath();
    ctx.rect(44, h / 2 - 40, w - 88, 80);
    ctx.clip();
    ctx.strokeStyle = 'rgba(230, 69, 83, 0.18)';
    ctx.lineWidth = 10;
    for (let sx = -80; sx < w + 80; sx += 28) {
      ctx.beginPath();
      ctx.moveTo(sx, h / 2 - 48);
      ctx.lineTo(sx + 60, h / 2 + 48);
      ctx.stroke();
    }
    ctx.restore();

    ctx.font = '700 34px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = '#ff6675';
    ctx.shadowColor = 'rgba(230, 69, 83, 0.65)';
    ctx.shadowBlur = 10;
    ctx.fillText('REDACTED', w / 2, h / 2 + 1);
    ctx.shadowBlur = 0;
  } else {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.92)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = correct ? '#e8fff3' : wrong ? '#ffd5d9' : active ? '#ffffff' : '#cfd7e6';
    lines.forEach((line, i) => {
      ctx.fillText(line, w / 2, startY + i * lineHeight);
    });
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Engraved brass & obsidian plate texture for CODEX_DUAL_RING upper & lower rings.
 */
export function createRingLabelTexture(
  text: string,
  accentHex: string,
  isTop: boolean,
  highlighted = false
): THREE.CanvasTexture {
  const w = 512;
  const h = 168;
  const [canvas, ctx] = makeCanvas(w, h);

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, isTop ? '#111828' : '#0b101c');
  grad.addColorStop(0.5, isTop ? '#19243b' : '#121b2d');
  grad.addColorStop(1, '#0a0f1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Brass beveled trim
  ctx.strokeStyle = highlighted ? '#f7df9c' : accentHex;
  ctx.lineWidth = highlighted ? 5 : 3.5;
  ctx.strokeRect(8, 8, w - 16, h - 16);

  ctx.strokeStyle = 'rgba(247, 223, 156, 0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, w - 32, h - 32);

  // Direction pip indicating alignment conduit (bottom edge for TOP ring, top edge for BOTTOM ring)
  ctx.fillStyle = highlighted ? '#5ce1e6' : '#f7df9c';
  ctx.beginPath();
  if (isTop) {
    ctx.moveTo(w / 2 - 14, h - 10);
    ctx.lineTo(w / 2 + 14, h - 10);
    ctx.lineTo(w / 2, h - 2);
  } else {
    ctx.moveTo(w / 2 - 14, 10);
    ctx.lineTo(w / 2 + 14, 10);
    ctx.lineTo(w / 2, 2);
  }
  ctx.closePath();
  ctx.fill();

  // Ring tier eyebrow
  ctx.font = '700 14px "JetBrains Mono", Consolas, monospace';
  ctx.fillStyle = isTop ? 'rgba(247, 223, 156, 0.72)' : 'rgba(92, 225, 230, 0.78)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(isTop ? 'SUBJECT' : 'TARGET', w / 2, 20);

  // Auto-fitted plate text
  const maxW = w - 56;
  let fontSize = text.length <= 14 ? 34 : text.length <= 22 ? 28 : 24;
  let lines: string[] = [text];
  for (; fontSize >= 18; fontSize -= 2) {
    ctx.font = `700 ${fontSize}px "Inter", "Segoe UI", sans-serif`;
    lines = wrapLines(ctx, text, maxW, 2);
    if (Math.max(...lines.map((l) => ctx.measureText(l).width)) <= maxW) break;
  }

  const lh = fontSize * 1.18;
  const startY = h / 2 + 12 - ((lines.length - 1) * lh) / 2;
  ctx.fillStyle = '#f6f8fc';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.85)';
  ctx.shadowBlur = 8;
  lines.forEach((line, idx) => {
    ctx.fillText(line, w / 2, startY + idx * lh);
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * High-contrast crystalline obsidian Veritas Plate texture for GAUNTLET_SHATTER.
 */
export function createGauntletPlateTexture(
  prompt: string,
  domainName: string,
  accentHex: string
): THREE.CanvasTexture {
  const w = 768;
  const h = 512;
  const [canvas, ctx] = makeCanvas(w, h);

  // Obsidian crystalline slab
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#0a101d');
  bg.addColorStop(0.5, '#131d32');
  bg.addColorStop(1, '#080c16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle crystalline facet reflection geometry
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.62, 0);
  ctx.lineTo(w * 0.25, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Champagne gold outer bevel + inner frame
  ctx.strokeStyle = '#f7df9c';
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, w - 28, h - 28);

  ctx.strokeStyle = accentHex;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 26, w - 52, h - 52);
  ctx.globalAlpha = 1;

  // Domain eyebrow badge
  ctx.font = '700 20px "JetBrains Mono", Consolas, monospace';
  const badgeText = `VERITAS RAPID CHECK · ${domainName.toUpperCase()}`;
  ctx.fillStyle = accentHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(badgeText, w / 2, 46);

  // Thin divider rule
  ctx.fillStyle = 'rgba(247, 223, 156, 0.35)';
  ctx.fillRect(w / 2 - 140, 82, 280, 2);

  // Main statement typography
  const maxW = w - 110;
  let fontSize = prompt.length <= 55 ? 40 : prompt.length <= 95 ? 34 : 29;
  let lines: string[] = [prompt];
  for (; fontSize >= 22; fontSize -= 2) {
    ctx.font = `600 ${fontSize}px "Inter", "Segoe UI", sans-serif`;
    lines = wrapLines(ctx, prompt, maxW, 5);
    if (Math.max(...lines.map((l) => ctx.measureText(l).width)) <= maxW && lines.length <= 5) break;
  }

  const lh = fontSize * 1.3;
  const totalH = lines.length * lh;
  const startY = h / 2 - totalH / 2 + lh * 0.45;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 10;
  lines.forEach((l, i) => ctx.fillText(l, w / 2, startY + i * lh));
  ctx.shadowBlur = 0;

  // Etched directional swipe cues at bottom edge
  ctx.font = '700 18px "JetBrains Mono", Consolas, monospace';
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(230, 100, 118, 0.85)';
  ctx.fillText('◀ FALSE', 44, h - 38);

  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(92, 225, 230, 0.9)';
  ctx.fillText('▲ CHALLENGE 2×', w / 2, h - 38);

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(110, 238, 175, 0.9)';
  ctx.fillText('TRUE ▶', w - 44, h - 38);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

function formatDialTickValue(v: number, range: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 10_000) return `${(v / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  if (range <= 20 && !Number.isInteger(v)) return v.toFixed(1);
  return String(Math.round(v));
}

/**
 * Precision engraved horological Astrolabe Dial face for CALIBRATOR_DIAL.
 * Displays the active question's real numeric scale when minVal/maxVal are provided.
 */
export function createCalibratorDialTexture(
  accentHex: string,
  minVal = 0,
  maxVal = 100,
  logScale = false
): THREE.CanvasTexture {
  const size = 1024;
  const cx = size / 2;
  const cy = size / 2;
  const [canvas, ctx] = makeCanvas(size, size);

  // Deep obsidian sapphire dial plate
  const bg = ctx.createRadialGradient(cx, cy, 40, cx, cy, size * 0.5);
  bg.addColorStop(0, '#131b2e');
  bg.addColorStop(0.55, '#0b101d');
  bg.addColorStop(0.88, '#141925');
  bg.addColorStop(1, '#261f14');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Concentric astrolabe rings
  const ringRadii = [472, 435, 360, 255, 140];
  ringRadii.forEach((r, idx) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = idx === 0 ? '#f7df9c' : idx === 1 ? accentHex : 'rgba(212, 168, 83, 0.28)';
    ctx.lineWidth = idx === 0 ? 5 : idx === 1 ? 2.5 : 1.5;
    ctx.stroke();
  });

  // Subtle celestial crosshair
  ctx.strokeStyle = 'rgba(212, 168, 83, 0.16)';
  ctx.lineWidth = 1.5;
  for (let a = 0; a < 8; a++) {
    const rad = (a * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * 140, cy + Math.sin(rad) * 140);
    ctx.lineTo(cx + Math.cos(rad) * 435, cy + Math.sin(rad) * 435);
    ctx.stroke();
  }

  // Sweeping 260° active calibration arc (-130° .. +130° around 12 o'clock = -90° in canvas coords)
  const totalTicks = 60;
  const spanRad = (260 * Math.PI) / 180;
  const startRad = -Math.PI / 2 - spanRad / 2;

  for (let i = 0; i <= totalTicks; i++) {
    const t = i / totalTicks;
    const rad = startRad + t * spanRad;
    const isMajor = i % 10 === 0;
    const isMid = i % 5 === 0;
    const rOut = 464;
    const rIn = isMajor ? 404 : isMid ? 422 : 438;

    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(rad) * rIn, cy + Math.sin(rad) * rIn);
    ctx.lineTo(cx + Math.cos(rad) * rOut, cy + Math.sin(rad) * rOut);
    ctx.strokeStyle = isMajor ? '#f7df9c' : isMid ? accentHex : 'rgba(212, 168, 83, 0.48)';
    ctx.lineWidth = isMajor ? 4 : isMid ? 2.5 : 1.5;
    ctx.stroke();

    if (isMajor) {
      const labelR = 372;
      const range = Math.max(1e-6, maxVal - minVal);
      const tickVal =
        logScale && minVal > 0 && maxVal > minVal
          ? minVal * Math.pow(maxVal / minVal, t)
          : minVal + t * range;
      const tickStr = formatDialTickValue(tickVal, range);
      ctx.font = '700 22px "JetBrains Mono", Consolas, monospace';
      ctx.fillStyle = 'rgba(247, 223, 156, 0.88)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tickStr, cx + Math.cos(rad) * labelR, cy + Math.sin(rad) * labelR);
    }
  }

  // Bottom engraved Meridian plate crest
  ctx.font = '600 24px "Cinzel", Georgia, serif';
  ctx.fillStyle = 'rgba(247, 223, 156, 0.65)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('MERIDIAN CALIBRATOR', cx, cy + 318);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}
