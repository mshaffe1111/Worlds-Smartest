// ============================================================================
// WORLD'S SMARTEST — 1966 Studio Orchestra & Real Foley Sample Pack Builder
// Fetches CC0 / CC-BY real recorded acoustic multi-samples, real Boston jazz
// drum kit recordings (Virtuosity Drums CC0), and real Wikimedia Commons
// studio crowd & mechanical foley, then trims/normalizes/encodes crisp 44.1kHz
// mobile-compatible MP3s into `public/assets/v7/audio/`.
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, 'public', 'assets', 'v7', 'audio');
const RAW_DIR = path.join(
  'C:',
  'Users',
  'mshaf',
  '.gemini',
  'antigravity',
  'brain',
  '459adf44-b11c-43a7-82dd-2ed4116b9812',
  'scratch',
  'raw_samples',
);
const LEGACY_RAW_DIR = path.join(
  'C:',
  'Users',
  'mshaf',
  '.gemini',
  'antigravity',
  'brain',
  'f4701086-cbc2-473c-a60d-bc6ad6c376c2',
  'scratch',
  'raw_samples',
);
const REBUILD_ALL = process.argv.includes('--rebuild-all');
const EXISTING_MANIFEST_PATH = path.join(OUT_DIR, 'manifest.json');
const EXISTING_MANIFEST = fs.existsSync(EXISTING_MANIFEST_PATH)
  ? JSON.parse(fs.readFileSync(EXISTING_MANIFEST_PATH, 'utf8'))
  : null;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(RAW_DIR, { recursive: true });

// Resolve ffmpeg binary bundled with Python imageio_ffmpeg
function resolveFfmpegPath() {
  const out = execFileSync(
    'python',
    ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'],
    { encoding: 'utf8' },
  ).trim();
  if (!out || !fs.existsSync(out)) {
    throw new Error(`Could not resolve ffmpeg binary from imageio_ffmpeg: ${out}`);
  }
  return out;
}

const FFMPEG = resolveFfmpegPath();
console.log('[audio-build] Using ffmpeg:', FFMPEG);

const USER_AGENT = 'WorldsSmartest1966AudioBuilder/1.0 (https://github.com/worlds-smartest; educational game audio)';

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    redirect: 'follow',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

function runFfmpeg(args) {
  execFileSync(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', ...args], {
    stdio: 'inherit',
  });
}

// Convert/trim any input audio file into crisp 44.1kHz MP3 with optional trim/fade/filters
function transcodeMp3(inPath, outPath, opts = {}) {
  const {
    startSec = null,
    durSec = null,
    channels = 1,
    bitrate = '96k',
    trimSilence = true,
    fadeOutSec = 0.08,
    fadeInSec = 0.0,
    extraFilter = '',
    normalize = true,
  } = opts;

  const filters = [];
  if (trimSilence) {
    // Strip leading silence below -48dB so sample onset is sample-accurate (< 2ms latency!)
    filters.push('silenceremove=start_periods=1:start_duration=0:start_threshold=-48dB');
  }
  if (startSec !== null && startSec > 0) {
    filters.push(`atrim=start=${startSec.toFixed(3)},asetpts=PTS-STARTPTS`);
  }
  if (durSec !== null && durSec > 0) {
    filters.push(`atrim=duration=${durSec.toFixed(3)},asetpts=PTS-STARTPTS`);
    if (fadeOutSec > 0 && durSec > fadeOutSec + 0.02) {
      const fStart = Math.max(0.01, durSec - fadeOutSec);
      filters.push(`afade=t=out:st=${fStart.toFixed(3)}:d=${fadeOutSec.toFixed(3)}`);
    }
  }
  if (fadeInSec > 0) {
    filters.push(`afade=t=in:st=0:d=${fadeInSec.toFixed(3)}`);
  }
  if (extraFilter) {
    filters.push(extraFilter);
  }
  if (normalize) {
    // Gentle peak/RMS leveling so all zones match smoothly
    filters.push('dynaudnorm=f=150:g=11:p=0.92:m=4.0');
  }

  const args = ['-i', inPath];
  if (filters.length > 0) {
    args.push('-af', filters.join(','));
  }
  args.push(
    '-ar', '44100',
    '-ac', String(channels),
    '-codec:a', 'libmp3lame',
    '-b:a', bitrate,
    outPath,
  );
  runFfmpeg(args);
}

// Map note name like "Bb4" or "F4" to MIDI number
const NOTE_SEMI = {
  C: 0, Db: 1, D: 2, Eb: 3, E: 4, F: 5, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
};
function noteToMidi(noteName) {
  const m = /^([A-G]b?)(-?\d)$/.exec(noteName);
  if (!m) throw new Error(`Bad note name: ${noteName}`);
  return (parseInt(m[2], 10) + 1) * 12 + NOTE_SEMI[m[1]];
}

// ----------------------------------------------------------------------------
// 1. Real Acoustic Instruments from MusyngKite (gleitz/midi-js-soundfonts)
// ----------------------------------------------------------------------------
const SOUNDFONT_BASE = 'https://gleitz.github.io/midi-js-soundfonts/MusyngKite';

const INSTRUMENT_SPECS = [
  { id: 'electric_bass', sf: 'electric_bass_finger', notes: ['E1', 'A1', 'D2', 'G2', 'C3'], dur: 1.55, bitrate: '96k' },
  { id: 'upright_bass', sf: 'acoustic_bass', notes: ['E1', 'A1', 'D2', 'G2', 'C3'], dur: 1.45, bitrate: '96k' },
  { id: 'electric_piano', sf: 'electric_piano_1', notes: ['C2', 'G2', 'C3', 'G3', 'C4'], dur: 2.0, bitrate: '96k' },
  { id: 'grand_piano', sf: 'acoustic_grand_piano', notes: ['C2', 'G2', 'C3', 'G3', 'C4', 'G4', 'C5'], dur: 2.1, bitrate: '96k' },
  { id: 'jazz_guitar', sf: 'electric_guitar_jazz', notes: ['E2', 'A2', 'C3', 'G3', 'C4'], dur: 1.5, bitrate: '96k' },
  { id: 'clean_guitar', sf: 'electric_guitar_clean', notes: ['E2', 'A2', 'D3', 'G3', 'C4'], dur: 1.5, bitrate: '96k' },
  { id: 'baritone_sax', sf: 'baritone_sax', notes: ['A1', 'D2', 'G2', 'C3'], dur: 1.55, bitrate: '96k' },
  { id: 'tenor_sax', sf: 'tenor_sax', notes: ['C3', 'F3', 'C4', 'F4'], dur: 1.45, bitrate: '96k' },
  { id: 'trombone', sf: 'trombone', notes: ['F2', 'C3', 'F3', 'Bb3'], dur: 1.5, bitrate: '96k' },
  { id: 'brass', sf: 'brass_section', notes: ['C3', 'F3', 'Bb3', 'D4', 'G4'], dur: 1.55, bitrate: '96k' },
  { id: 'muted_trumpet', sf: 'muted_trumpet', notes: ['C4', 'F4', 'Bb4'], dur: 1.25, bitrate: '96k' },
  { id: 'trumpet', sf: 'trumpet', notes: ['C4', 'F4', 'Bb4', 'D5', 'G5'], dur: 1.45, bitrate: '96k' },
  { id: 'vibraphone', sf: 'vibraphone', notes: ['C3', 'G3', 'C4', 'F4', 'Bb4', 'E5'], dur: 2.0, bitrate: '96k' },
  { id: 'marimba', sf: 'marimba', notes: ['C3', 'G3', 'C4', 'G4', 'C5'], dur: 1.2, bitrate: '96k' },
  { id: 'strings', sf: 'string_ensemble_1', notes: ['C3', 'G3', 'C4', 'G4'], dur: 2.35, bitrate: '112k', channels: 2 },
  { id: 'glockenspiel', sf: 'glockenspiel', notes: ['C5', 'G5'], dur: 1.35, bitrate: '96k' },
  { id: 'tubular_bell', sf: 'tubular_bells', notes: ['C5', 'G5'], dur: 2.0, bitrate: '96k' },
  { id: 'woodblock', sf: 'woodblock', notes: ['C5', 'G5'], dur: 0.45, bitrate: '96k' },
  { id: 'timpani', sf: 'timpani', notes: ['C3', 'G3'], dur: 1.35, bitrate: '96k' },
];

const manifest = {
  version: 'v7.6-1966-wrecking-crew-showband',
  instruments: {},
  drums: {},
  foley: {},
  crowd: {},
};

async function fetchSoundfontInstruments() {
  console.log('\n[1/4] Fetching real acoustic studio multi-samples from MusyngKite...');
  for (const spec of INSTRUMENT_SPECS) {
    manifest.instruments[spec.id] = [];
    for (const note of spec.notes) {
      const midi = noteToMidi(note);
      const rawName = `sf_${spec.id}_${note}.mp3`;
      const legacyRawPath = path.join(LEGACY_RAW_DIR, rawName);
      const rawPath = fs.existsSync(legacyRawPath) ? legacyRawPath : path.join(RAW_DIR, rawName);
      const outName = `inst_${spec.id}_${note}.mp3`;
      const outPath = path.join(OUT_DIR, outName);

      if (!REBUILD_ALL && fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
        manifest.instruments[spec.id].push({
          note,
          midi,
          file: outName,
          bytes: fs.statSync(outPath).size,
        });
        continue;
      }

      if (!fs.existsSync(rawPath)) {
        const url = `${SOUNDFONT_BASE}/${spec.sf}-mp3/${note}.mp3`;
        try {
          const buf = await fetchBuffer(url);
          fs.writeFileSync(rawPath, buf);
          process.stdout.write(`  + ${spec.id}:${note} (${(buf.length / 1024).toFixed(1)}KB)\n`);
        } catch (err) {
          console.warn(`  ! MusyngKite failed for ${spec.sf}/${note}, trying FluidR3_GM... (${err.message})`);
          const fallbackUrl = `https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/${spec.sf}-mp3/${note}.mp3`;
          const buf = await fetchBuffer(fallbackUrl);
          fs.writeFileSync(rawPath, buf);
          process.stdout.write(`  + [FluidR3] ${spec.id}:${note} (${(buf.length / 1024).toFixed(1)}KB)\n`);
        }
      }

      transcodeMp3(rawPath, outPath, {
        durSec: spec.dur,
        channels: spec.channels ?? 1,
        bitrate: spec.bitrate ?? '96k',
        trimSilence: true,
        fadeOutSec: 0.12,
        normalize: false, // preserve authentic acoustic decay dynamics!
        extraFilter: 'volume=1.15,alimiter=limit=0.95',
      });

      const stat = fs.statSync(outPath);
      manifest.instruments[spec.id].push({
        note,
        midi,
        file: outName,
        bytes: stat.size,
      });
    }
  }
}

// ----------------------------------------------------------------------------
// 2. Real Boston Jazz Drum Kit (Virtuosity Drums CC0 on GitHub!) + Percussion
// ----------------------------------------------------------------------------
async function fetchRealJazzDrums() {
  console.log('\n[2/4] Fetching real acoustic jazz drums from sfzinstruments/virtuosity_drums (CC0)...');
  // Fetch repo tree from GitHub API to pick exact crisp jazz drum files
  let tree = [];
  try {
    const data = await fetchJson('https://api.github.com/repos/sfzinstruments/virtuosity_drums/git/trees/master?recursive=1');
    tree = (data.tree || []).filter((n) => n.type === 'blob' && /\.(wav|flac|ogg|mp3)$/i.test(n.path));
    console.log(`  Found ${tree.length} real drum recordings in virtuosity_drums`);
  } catch (err) {
    console.warn('  Could not list virtuosity_drums tree:', err.message);
  }

  // Log distinct mic folders and drum folders so selection is 100% transparent
  if (tree.length > 0) {
    const dirs = [...new Set(tree.map((t) => path.dirname(t.path)))];
    const percDirs = dirs.filter((d) => /perc|brush|snare|kick|ride|hh|oh|mid/i.test(d)).slice(0, 35);
    console.log('  Selected mic/perc dirs:', percDirs.join(' | '));
  }

  // Strictly match folder + filename separately so 'kickmic/' NEVER fools 'kick' regex!
  const pickByFolder = (folderRe, fileRe, fallbackFileRe = null) => {
    const inFolder = tree.filter((n) => folderRe.test(path.dirname(n.path).replace(/\\/g, '/')));
    if (inFolder.length === 0) return null;
    // Prefer medium-strong velocity layers (vl4..vl7 or v3..v5) over whisper-quiet vl1!
    const strong = inFolder.filter((n) => /(?:vl[4567]|_v[345]|mf)/i.test(path.basename(n.path)));
    const pool = strong.length > 0 ? strong : inFolder;
    const hit = pool.find((n) => fileRe.test(path.basename(n.path)));
    if (hit) return hit.path;
    if (fallbackFileRe) {
      const fb = pool.find((n) => fallbackFileRe.test(path.basename(n.path)));
      if (fb) return fb.path;
    }
    return pool[0]?.path ?? null;
  };

  const drumTargets = [
    {
      id: 'kick',
      dur: 0.48,
      repoPath:
        pickByFolder(/^Samples\/(?:mid|oh|kickmic)\/kick$/i, /kick.*rr1/i, /kick/i) ||
        pickByFolder(/\/kick$/i, /kick/i),
      volume: 1.65,
      filter: 'highpass=f=32,lowpass=f=3800',
    },
    {
      id: 'snare_stick',
      dur: 0.42,
      repoPath:
        pickByFolder(/^Samples\/(?:mid|oh)\/snare$/i, /center.*rr1/i, /center|hit/i) ||
        pickByFolder(/\/snare$/i, /center/i),
      volume: 1.55,
      filter: 'highpass=f=90',
    },
    {
      id: 'snare_brush',
      dur: 0.38,
      // Virtuosity Drums snareoff / light rim-wire or VCSL brush (upgraded below if VCSL has explicit brush)
      repoPath:
        pickByFolder(/^Samples\/(?:mid|oh)\/snareoff$/i, /center|edge|hit/i) ||
        pickByFolder(/^Samples\/(?:mid|oh)\/snare$/i, /edge|flam|ghost|vl[23]/i),
      volume: 1.45,
      filter: 'highpass=f=180,lowpass=f=6800',
    },
    {
      id: 'snare_rim',
      dur: 0.30,
      repoPath:
        pickByFolder(/^Samples\/(?:mid|oh)\/snare$/i, /crossstick|sidestick|rim/i) ||
        pickByFolder(/^Samples\/(?:mid|oh)\//i, /crossstick|sidestick/i),
      volume: 1.65,
      filter: 'highpass=f=160',
    },
    {
      id: 'hihat_closed',
      dur: 0.24,
      repoPath:
        pickByFolder(/^Samples\/(?:mid|oh)\/hh$/i, /closed.*rr1/i, /closed/i),
      volume: 1.5,
      filter: 'highpass=f=300',
    },
    {
      id: 'hihat_pedal',
      dur: 0.28,
      repoPath:
        pickByFolder(/^Samples\/(?:mid|oh)\/hh$/i, /pedal.*rr1/i, /pedal|chick/i),
      volume: 1.5,
      filter: 'highpass=f=260',
    },
    {
      id: 'ride',
      dur: 1.05,
      repoPath:
        pickByFolder(/^Samples\/(?:mid|oh)\/(?:ride|flatride)$/i, /ride_vl[456]|ride_ride_vl[456]/i, /ride/i),
      volume: 1.55,
      filter: 'highpass=f=240',
    },
    {
      id: 'ride_bell',
      dur: 1.0,
      repoPath:
        pickByFolder(/^Samples\/(?:mid|oh)\/ride$/i, /bell.*rr1/i, /bell/i),
      volume: 1.45,
      filter: 'highpass=f=240',
    },
    {
      id: 'crash',
      dur: 1.55,
      repoPath:
        pickByFolder(/^Samples\/(?:mid|oh)\/crash$/i, /crash.*vl[345]/i, /crash/i),
      volume: 1.35,
      filter: 'highpass=f=220',
    },
    {
      id: 'tambourine',
      dur: 0.45,
      repoPath: pickByFolder(/perc.*tambourine/i, /hit|shake/i),
      volume: 1.45,
      filter: 'highpass=f=400',
    },
    {
      id: 'cowbell',
      dur: 0.42,
      repoPath: pickByFolder(/perc.*cowbell/i, /normal/i),
      volume: 1.35,
      filter: 'highpass=f=200',
    },
    {
      id: 'tom_mid',
      dur: 0.58,
      repoPath: pickByFolder(/^Samples\/(?:mid|oh)\/htom$/i, /center/i),
      volume: 1.55,
      filter: 'highpass=f=60',
    },
  ];

  for (const dt of drumTargets) {
    const repoPath = dt.repoPath;
    if (!repoPath) {
      console.log(`  - No direct match in virtuosity_drums for ${dt.id}`);
      continue;
    }
    const ext = path.extname(repoPath);
    const rawPath = path.join(RAW_DIR, `vd2_${dt.id}${ext}`);
    const outName = `drum_${dt.id}.mp3`;
    const outPath = path.join(OUT_DIR, outName);

    if (!fs.existsSync(rawPath)) {
      const encodedPath = repoPath.split('/').map(encodeURIComponent).join('/');
      const url = `https://raw.githubusercontent.com/sfzinstruments/virtuosity_drums/master/${encodedPath}`;
      try {
        const buf = await fetchBuffer(url);
        fs.writeFileSync(rawPath, buf);
        console.log(`  + [Virtuosity] ${dt.id} <- ${repoPath} (${(buf.length / 1024).toFixed(1)}KB)`);
      } catch (err) {
        console.warn(`  ! Failed downloading ${repoPath}: ${err.message}`);
        continue;
      }
    }

    transcodeMp3(rawPath, outPath, {
      durSec: dt.dur,
      channels: dt.id === 'ride' || dt.id === 'crash' ? 2 : 1,
      bitrate: '112k',
      trimSilence: true,
      fadeOutSec: 0.06,
      normalize: false,
      extraFilter: `${dt.filter ? dt.filter + ',' : ''}volume=${dt.volume ?? 1.4},alimiter=limit=0.95`,
    });

    manifest.drums[dt.id] = {
      file: outName,
      bytes: fs.statSync(outPath).size,
      source: `virtuosity_drums:${repoPath}`,
    };
  }
}

// ----------------------------------------------------------------------------
// 3. Real Studio Audience & Physical Mechanical Foley (Wikimedia Commons + VCSL)
// ----------------------------------------------------------------------------
async function resolveCommonsFileUrl(fileTitle) {
  const apiUrl =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|mime|size&titles=' +
    encodeURIComponent(fileTitle);
  const data = await fetchJson(apiUrl);
  const pages = data?.query?.pages || {};
  for (const p of Object.values(pages)) {
    const info = p?.imageinfo?.[0];
    if (info?.url) return info;
  }
  return null;
}

async function searchCommonsAudio(query, limit = 8) {
  const apiUrl =
    'https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srlimit=' +
    limit +
    '&srsearch=' +
    encodeURIComponent(query);
  const data = await fetchJson(apiUrl);
  return (data?.query?.search || [])
    .map((s) => s.title)
    .filter((t) => /\.(ogg|oga|wav|mp3|flac)$/i.test(t));
}

async function fetchRealCrowdAndFoley() {
  console.log('\n[3/4] Fetching real studio audience & mechanical foley from Wikimedia Commons & VCSL...');

  // Also check VCSL CC0 for real hand bells, desk bells, orchestral percussion, whips/ratchets!
  try {
    const vcslData = await fetchJson('https://api.github.com/repos/sgossner/VCSL/git/trees/master?recursive=1');
    const vcslFiles = (vcslData.tree || []).filter((n) => n.type === 'blob' && /\.wav$/i.test(n.path));
    console.log(`  Found ${vcslFiles.length} CC0 real acoustic WAVs in sgossner/VCSL`);

    const vcslTargets = [
      { bucket: 'foley', id: 'desk_bell', re: /(?:bell|triangle|agogo).*\.wav$/i, dur: 1.4, prefer: /(?:Triangle.*Open|HandBell|Desk|Agogo_High)/i },
      { bucket: 'foley', id: 'ratchet_click', re: /(?:ratchet|castanet|claves|woodblock|slapstick).*\.wav$/i, dur: 0.45, prefer: /(?:Castanet|Claves|Woodblock)/i },
      { bucket: 'drums', id: 'snare_brush', re: /(?:brush|swish|sweep|stir).*\.wav$/i, dur: 0.45, prefer: /(?:brush.*hit|brush.*tap|brush.*swish|brush)/i },
      { bucket: 'drums', id: 'bongo_hi', re: /(?:bongo|conga).*\.wav$/i, dur: 0.35, prefer: /(?:bongo.*hi|bongo.*high|bongo.*1)/i },
      { bucket: 'drums', id: 'bongo_lo', re: /(?:bongo|conga).*\.wav$/i, dur: 0.40, prefer: /(?:bongo.*lo|bongo.*low|bongo.*2)/i },
      { bucket: 'drums', id: 'shaker', re: /(?:shaker|maraca|cabasa).*\.wav$/i, dur: 0.28, prefer: /(?:shaker|cabasa|maraca)/i },
      { bucket: 'foley', id: 'sleigh_sparkle', re: /(?:belltree|windchime|marktree|chimes|sleigh).*\.wav$/i, dur: 1.6, prefer: /(?:belltree|marktree|windchime)/i },
    ];

    for (const vt of vcslTargets) {
      const candidates = vcslFiles.filter((f) => vt.re.test(f.path));
      const picked = candidates.find((f) => vt.prefer.test(f.path)) || candidates[0];
      if (!picked) {
        console.log(`  - VCSL no match for ${vt.id}`);
        continue;
      }
      const rawPath = path.join(RAW_DIR, `vcsl_${vt.id}.wav`);
      const prefix = vt.bucket === 'drums' ? 'drum' : 'foley';
      const outName = `${prefix}_${vt.id}.mp3`;
      const outPath = path.join(OUT_DIR, outName);
      if (!fs.existsSync(rawPath)) {
        const enc = picked.path.split('/').map(encodeURIComponent).join('/');
        const url = `https://raw.githubusercontent.com/sgossner/VCSL/master/${enc}`;
        const buf = await fetchBuffer(url);
        fs.writeFileSync(rawPath, buf);
        console.log(`  + [VCSL CC0] ${vt.id} <- ${picked.path}`);
      }
      transcodeMp3(rawPath, outPath, {
        durSec: vt.dur,
        channels: 1,
        bitrate: '112k',
        trimSilence: true,
        fadeOutSec: 0.06,
        normalize: false,
        extraFilter: 'volume=1.35,alimiter=limit=0.95',
      });
      manifest[vt.bucket][vt.id] = { file: outName, bytes: fs.statSync(outPath).size, source: `VCSL:${picked.path}` };
    }
  } catch (err) {
    console.warn('  VCSL lookup warning:', err.message);
  }

  // Known verified Wikimedia Commons real recordings!
  const commonsItems = [
    {
      bucket: 'crowd',
      id: 'applause_warm',
      title: 'File:Applause ii.ogg',
      startSec: 1.6,
      durSec: 3.4,
      channels: 2,
      bitrate: '112k',
      fadeInSec: 0.05,
      fadeOutSec: 0.45,
      extraFilter: 'highpass=f=110,lowpass=f=7800,volume=1.45,alimiter=limit=0.92',
    },
    {
      bucket: 'crowd',
      id: 'applause_big',
      title: 'File:Applause.ogg',
      startSec: 1.5,
      durSec: 4.2,
      channels: 2,
      bitrate: '112k',
      fadeInSec: 0.12,
      fadeOutSec: 0.55,
      extraFilter: 'highpass=f=100,lowpass=f=8200,volume=1.35,alimiter=limit=0.92',
    },
    {
      bucket: 'crowd',
      id: 'cheer_hurray',
      title: 'File:Clapping hurray.ogg',
      startSec: 0.0,
      durSec: 3.2,
      channels: 2,
      bitrate: '112k',
      fadeInSec: 0.04,
      fadeOutSec: 0.4,
      extraFilter: 'highpass=f=110,lowpass=f=8000,volume=1.3,alimiter=limit=0.92',
    },
    {
      bucket: 'crowd',
      id: 'studio_laugh',
      title: 'File:Small group laughter.ogg',
      startSec: 0.0,
      durSec: 2.6,
      channels: 1,
      bitrate: '96k',
      fadeInSec: 0.04,
      fadeOutSec: 0.3,
      extraFilter: 'highpass=f=120,lowpass=f=7200,volume=1.3,alimiter=limit=0.92',
    },
    {
      bucket: 'foley',
      id: 'cash_register_bell',
      title: 'File:Cash register.ogg',
      startSec: 0.0,
      durSec: 1.45,
      channels: 1,
      bitrate: '112k',
      fadeInSec: 0.0,
      fadeOutSec: 0.12,
      extraFilter: 'volume=1.25,alimiter=limit=0.95',
    },
    {
      bucket: 'foley',
      id: 'mechanical_clack',
      title: 'File:WWS Typewriter.ogg',
      startSec: 0.35,
      durSec: 0.45,
      channels: 1,
      bitrate: '112k',
      fadeInSec: 0.0,
      fadeOutSec: 0.04,
      extraFilter: 'highpass=f=180,volume=1.45,alimiter=limit=0.95',
    },
    {
      bucket: 'foley',
      id: 'flap_click',
      title: 'File:WWS Typewriter.ogg',
      startSec: 0.38,
      durSec: 0.09,
      channels: 1,
      bitrate: '112k',
      fadeInSec: 0.0,
      fadeOutSec: 0.015,
      extraFilter: 'highpass=f=200,volume=1.55,alimiter=limit=0.95',
    },
    {
      bucket: 'foley',
      id: 'typewriter_bell',
      title: 'File:WWS Typewriter.ogg',
      startSec: 1.55,
      durSec: 0.75,
      channels: 1,
      bitrate: '112k',
      fadeInSec: 0.0,
      fadeOutSec: 0.08,
      extraFilter: 'highpass=f=450,volume=1.55,alimiter=limit=0.95',
    },
    {
      bucket: 'foley',
      id: 'studio_bell_gong',
      title: 'File:Gong or bell vibrant (short).ogg',
      startSec: 0.0,
      durSec: 1.6,
      channels: 1,
      bitrate: '112k',
      fadeInSec: 0.0,
      fadeOutSec: 0.15,
      extraFilter: 'volume=1.2,alimiter=limit=0.95',
    },
  ];

  // Also dynamically search Wikimedia Commons for real service/desk bell, buzzer, audience gasp/aww
  const extraSearches = [
    { bucket: 'foley', id: 'service_bell', query: 'service bell OR desk bell OR reception bell OR boxing bell', durSec: 1.5 },
    { bucket: 'foley', id: 'electric_buzzer', query: 'buzzer OR doorbell buzz OR electric buzzer', durSec: 0.9 },
    { bucket: 'crowd', id: 'audience_gasp', query: 'audience gasp OR crowd gasp OR crowd ooh OR crowd reaction', durSec: 1.8 },
  ];

  for (const s of extraSearches) {
    try {
      const titles = await searchCommonsAudio(s.query, 6);
      console.log(`  Commons search [${s.id}]:`, titles.slice(0, 4).join(' | '));
      if (titles.length > 0) {
        commonsItems.push({
          bucket: s.bucket,
          id: s.id,
          title: titles[0],
          startSec: 0.0,
          durSec: s.durSec,
          channels: 1,
          bitrate: '112k',
          fadeInSec: 0.01,
          fadeOutSec: 0.12,
          extraFilter: 'volume=1.25,alimiter=limit=0.95',
        });
      }
    } catch (err) {
      console.warn(`  Commons search failed for ${s.id}:`, err.message);
    }
  }

  for (const item of commonsItems) {
    try {
      const info = await resolveCommonsFileUrl(item.title);
      if (!info?.url) {
        console.warn(`  ! Commons file not found: ${item.title}`);
        continue;
      }
      const ext = path.extname(new URL(info.url).pathname) || '.ogg';
      const rawPath = path.join(RAW_DIR, `commons_${item.id}${ext}`);
      const outName = `${item.bucket}_${item.id}.mp3`;
      const outPath = path.join(OUT_DIR, outName);

      if (!fs.existsSync(rawPath)) {
        const buf = await fetchBuffer(info.url);
        fs.writeFileSync(rawPath, buf);
        console.log(`  + [Commons] ${item.id} <- ${item.title} (${(buf.length / 1024).toFixed(1)}KB)`);
      }

      transcodeMp3(rawPath, outPath, {
        startSec: item.startSec,
        durSec: item.durSec,
        channels: item.channels,
        bitrate: item.bitrate,
        trimSilence: item.startSec === 0,
        fadeInSec: item.fadeInSec,
        fadeOutSec: item.fadeOutSec,
        normalize: false,
        extraFilter: item.extraFilter,
      });

      manifest[item.bucket][item.id] = {
        file: outName,
        bytes: fs.statSync(outPath).size,
        source: `WikimediaCommons:${item.title}`,
      };
    } catch (err) {
      console.warn(`  ! Failed Commons item ${item.id} (${item.title}): ${err.message}`);
    }
  }

  // Also pull MusyngKite GM Applause as a warm backup/blendable studio clap layer!
  try {
    const rawPath = path.join(RAW_DIR, 'sf_applause_C4.mp3');
    const outName = 'crowd_studio_clap.mp3';
    const outPath = path.join(OUT_DIR, outName);
    if (!fs.existsSync(rawPath)) {
      const buf = await fetchBuffer(`${SOUNDFONT_BASE}/applause-mp3/C4.mp3`);
      fs.writeFileSync(rawPath, buf);
    }
    transcodeMp3(rawPath, outPath, {
      durSec: 2.6,
      channels: 2,
      bitrate: '112k',
      trimSilence: true,
      fadeInSec: 0.04,
      fadeOutSec: 0.35,
      normalize: false,
      extraFilter: 'highpass=f=120,lowpass=f=7600,volume=1.25,alimiter=limit=0.92',
    });
    manifest.crowd.studio_clap = {
      file: outName,
      bytes: fs.statSync(outPath).size,
      source: 'MusyngKite:applause:C4',
    };
    console.log('  + [MusyngKite] studio_clap (applause C4)');
  } catch (err) {
    console.warn('  ! MusyngKite applause failed:', err.message);
  }
}

async function main() {
  await fetchSoundfontInstruments();

  // Preserve verified existing real CC0 drums, foley & studio crowd files on disk unless --rebuild-all!
  const canReuseGroup = (groupObj) =>
    !REBUILD_ALL &&
    groupObj &&
    Object.keys(groupObj).length > 0 &&
    Object.values(groupObj).every((e) => e?.file && fs.existsSync(path.join(OUT_DIR, e.file)));

  if (
    EXISTING_MANIFEST &&
    canReuseGroup(EXISTING_MANIFEST.drums) &&
    canReuseGroup(EXISTING_MANIFEST.foley) &&
    canReuseGroup(EXISTING_MANIFEST.crowd)
  ) {
    console.log('\n[2-3/4] Preserving verified on-disk CC0 Boston Jazz Drums, Foley & Studio Crowd MP3s...');
    for (const bucket of ['drums', 'foley', 'crowd']) {
      for (const [k, entry] of Object.entries(EXISTING_MANIFEST[bucket])) {
        const fp = path.join(OUT_DIR, entry.file);
        manifest[bucket][k] = {
          ...entry,
          bytes: fs.statSync(fp).size,
        };
      }
    }
  } else {
    await fetchRealJazzDrums();
    await fetchRealCrowdAndFoley();
  }

  // Compute totals and write manifest.json
  let totalBytes = 0;
  let totalFiles = 0;
  for (const list of Object.values(manifest.instruments)) {
    for (const z of list) {
      totalBytes += z.bytes;
      totalFiles++;
    }
  }
  for (const group of [manifest.drums, manifest.foley, manifest.crowd]) {
    for (const entry of Object.values(group)) {
      totalBytes += entry.bytes;
      totalFiles++;
    }
  }

  manifest.totalFiles = totalFiles;
  manifest.totalBytes = totalBytes;

  const manifestPath = path.join(OUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n[4/4] DONE! Packed ${totalFiles} real acoustic/studio MP3s (${(totalBytes / 1024 / 1024).toFixed(2)} MB) -> ${manifestPath}`);
}

main().catch((err) => {
  console.error('[audio-build] FATAL:', err);
  process.exit(1);
});
