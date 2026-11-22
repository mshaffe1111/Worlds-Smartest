#!/usr/bin/env node
/**
 * PILLAR-SOUND-DIRECTOR — Studio Audio Engine, Foley, Voice & Anti-Annoyance Verification Suite
 * Tests StudioAudioEngine & HapticsEngine edge cases + scans all src/ audio hooks + verifies all audio assets on disk.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const SRC = path.join(ROOT, 'src');
const PUBLIC = path.join(ROOT, 'public');

// ----------------------------------------------------------------------------
// Deterministic Mock Browser Audio / DOM Harness
// ----------------------------------------------------------------------------
const storageMap = new Map();
const winListeners = new Map();
const docListeners = new Map();

function addMapListener(map, type, fn) {
  if (!map.has(type)) map.set(type, new Set());
  map.get(type).add(fn);
}
function removeMapListener(map, type, fn) {
  map.get(type)?.delete(fn);
}
function fireWindowEvent(type) {
  const set = winListeners.get(type);
  if (!set) return;
  for (const fn of [...set]) fn({});
}
function fireDocEvent(type) {
  const set = docListeners.get(type);
  if (!set) return;
  for (const fn of [...set]) fn({});
}

let mockDocHidden = false;
globalThis.localStorage = {
  getItem: (k) => (storageMap.has(k) ? storageMap.get(k) : null),
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear(),
};

// Track Audio instances & WebAudio operations
const createdAudioEls = [];
let autoplayBlocked = false;
let mockCtxState = 'suspended';
let mockCurrentTime = 0;
let createdSources = [];
let createdCompressors = [];
let fetchCalls = [];
let vibrateCalls = [];

class MockAudioParam {
  constructor(initial = 1) {
    this.value = initial;
    this.events = [];
  }
  setValueAtTime(v, t) {
    this.value = v;
    this.events.push({ op: 'set', v, t });
    return this;
  }
  linearRampToValueAtTime(v, t) {
    this.events.push({ op: 'ramp', v, t });
    return this;
  }
  cancelScheduledValues(t) {
    this.events.push({ op: 'cancel', t });
    return this;
  }
  cancelAndHoldAtTime(t) {
    this.events.push({ op: 'cancelAndHold', t });
    return this;
  }
}

class MockAudioBuffer {
  constructor(duration = 0.955, sampleRate = 48000) {
    this.duration = duration;
    this.sampleRate = sampleRate;
    this.numberOfChannels = 1;
    this.length = Math.floor(duration * sampleRate);
    this._ch0 = new Float32Array(this.length);
    // Clean sine wave so exact rising zero-crossings exist throughout
    for (let i = 0; i < this.length; i++) {
      this._ch0[i] = Math.sin((2 * Math.PI * 220 * i) / sampleRate) * 0.25;
    }
  }
  getChannelData() {
    return this._ch0;
  }
}

class MockBufferSource {
  constructor() {
    this.buffer = null;
    this.loop = false;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.playbackRate = new MockAudioParam(1);
    this.started = false;
    this.stopped = false;
    this.stopAt = null;
    this.disconnected = false;
    this.connectedTo = [];
    this.onended = null;
    createdSources.push(this);
  }
  connect(dest) {
    this.connectedTo.push(dest);
    return dest;
  }
  disconnect() {
    this.disconnected = true;
  }
  start(when = 0) {
    this.started = true;
    this.startAt = when;
  }
  stop(when = 0) {
    this.stopped = true;
    this.stopAt = when;
    if (this.onended) this.onended();
  }
}

class MockGainNode {
  constructor() {
    this.gain = new MockAudioParam(1);
    this.connectedTo = [];
    this.disconnected = false;
  }
  connect(dest) {
    this.connectedTo.push(dest);
    return dest;
  }
  disconnect() {
    this.disconnected = true;
  }
}

class MockCompressorNode {
  constructor() {
    this.threshold = new MockAudioParam(-24);
    this.knee = new MockAudioParam(30);
    this.ratio = new MockAudioParam(12);
    this.attack = new MockAudioParam(0.003);
    this.release = new MockAudioParam(0.25);
    this.connectedTo = [];
    this.disconnected = false;
    createdCompressors.push(this);
  }
  connect(dest) {
    this.connectedTo.push(dest);
    return dest;
  }
  disconnect() {
    this.disconnected = true;
  }
}

class MockAudioContext {
  constructor() {
    this.state = mockCtxState;
    this.destination = { kind: 'destination' };
    this.resumeCalls = 0;
    this.closed = false;
  }
  get currentTime() {
    return mockCurrentTime;
  }
  async resume() {
    this.resumeCalls += 1;
    this.state = 'running';
    mockCtxState = 'running';
  }
  async close() {
    this.closed = true;
    this.state = 'closed';
  }
  createBufferSource() {
    return new MockBufferSource();
  }
  createGain() {
    return new MockGainNode();
  }
  createDynamicsCompressor() {
    return new MockCompressorNode();
  }
  createAnalyser() {
    return {
      fftSize: 128,
      smoothingTimeConstant: 0.76,
      frequencyBinCount: 64,
      connect: () => {},
      disconnect: () => {},
      getByteFrequencyData: (arr) => arr.fill(40),
    };
  }
  createMediaElementSource() {
    return { connect: () => {}, disconnect: () => {} };
  }
  async decodeAudioData() {
    // Yield a microtask + short timer to simulate real async audio decode
    await new Promise((r) => setTimeout(r, 8));
    return new MockAudioBuffer(0.955, 48000);
  }
}

class MockHTMLAudio {
  constructor(url = '') {
    this.src = url;
    this.preload = 'auto';
    this.loop = false;
    this.volume = 1;
    this.paused = true;
    this.ended = false;
    this.currentTime = 0;
    this.dataset = {};
    this._listeners = new Map();
    this.removedSrc = false;
    this.loadCalls = 0;
    createdAudioEls.push(this);
  }
  addEventListener(type, fn, opts) {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type).push({ fn, once: Boolean(opts?.once) });
  }
  emit(type) {
    const list = this._listeners.get(type) ?? [];
    this._listeners.set(type, list.filter((e) => !e.once));
    for (const entry of list) entry.fn({});
  }
  play() {
    if (autoplayBlocked) {
      this.paused = true;
      return Promise.reject(new Error('NotAllowedError: Autoplay blocked'));
    }
    this.paused = false;
    this.ended = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  removeAttribute(attr) {
    if (attr === 'src') {
      this.src = '';
      this.removedSrc = true;
    }
  }
  load() {
    this.loadCalls += 1;
  }
}

globalThis.window = {
  localStorage: globalThis.localStorage,
  AudioContext: MockAudioContext,
  addEventListener: (type, fn) => addMapListener(winListeners, type, fn),
  removeEventListener: (type, fn) => removeMapListener(winListeners, type, fn),
};
globalThis.document = {
  get hidden() {
    return mockDocHidden;
  },
  addEventListener: (type, fn) => addMapListener(docListeners, type, fn),
  removeEventListener: (type, fn) => removeMapListener(docListeners, type, fn),
};
globalThis.Audio = MockHTMLAudio;
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: {
    vibrate: (pat) => {
      vibrateCalls.push(pat);
      return true;
    },
  },
});

globalThis.fetch = async (urlStr) => {
  fetchCalls.push(String(urlStr));
  const clean = String(urlStr).replace(/^\.\//, '').replace(/^\//, '');
  const full = path.join(PUBLIC, clean);
  if (!fs.existsSync(full)) {
    return { ok: false, status: 404, headers: { get: () => 'text/plain' } };
  }
  const buf = fs.readFileSync(full);
  return {
    ok: true,
    status: 200,
    headers: { get: () => 'audio/mpeg' },
    arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
  };
};

async function bundleImport(relPath) {
  const res = await build({
    entryPoints: [path.join(ROOT, relPath)],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'neutral',
    target: 'es2022',
  });
  const code = res.outputFiles[0].text;
  return import(`data:text/javascript;base64,${Buffer.from(code, 'utf8').toString('base64')}`);
}

function assert(cond, msg) {
  if (!cond) throw new Error(`ASSERTION FAILED: ${msg}`);
}

function resetHarness() {
  storageMap.clear();
  winListeners.clear();
  docListeners.clear();
  createdAudioEls.length = 0;
  createdSources = [];
  createdCompressors = [];
  fetchCalls = [];
  vibrateCalls = [];
  autoplayBlocked = false;
  mockCtxState = 'suspended';
  mockCurrentTime = 0;
  mockDocHidden = false;
}

async function runTests() {
  const audioMod = await bundleImport('src/audio/StudioAudioEngine.ts');
  const hapticsMod = await bundleImport('src/audio/HapticsEngine.ts');
  const { StudioAudioEngine } = audioMod;
  const { HapticsEngine } = hapticsMod;

  const results = [];
  const check = async (name, fn) => {
    try {
      await fn();
      results.push({ test: name, pass: true });
    } catch (err) {
      results.push({ test: name, pass: false, error: err.message });
    }
  };

  // TEST 1: AMBIENCE: OFF default & dual localStorage sync
  await check('AMBIENCE_OFF_DEFAULT_AND_STORAGE_SYNC', async () => {
    resetHarness();
    const eng = new StudioAudioEngine();
    assert(eng.isMusicEnabled() === false, 'Ambience must default OFF');
    assert(eng.isSfxEnabled() === true, 'SFX must default ON');
    assert(eng.isVoiceEnabled() === true, 'Voice must default ON');

    eng.setMusicEnabled(true);
    assert(storageMap.get('ws_ambience_enabled_v2') === '1', 'ws_ambience_enabled_v2 should sync to "1"');
    assert(storageMap.get('ws_studio_music_enabled_v2') === 'true', 'ws_studio_music_enabled_v2 should sync to "true"');

    const eng2 = new StudioAudioEngine();
    assert(eng2.isMusicEnabled() === true, 'Second instance must hydrate ON from storage');
    eng2.setMusicEnabled(false);
    assert(storageMap.get('ws_ambience_enabled_v2') === '0', 'ws_ambience_enabled_v2 should sync to "0"');
    eng.dispose();
    eng2.dispose();
  });

  // TEST 2: First-tap iOS/Android unlock & concurrent prewarm playSfx (ZERO dropped taps!)
  await check('FIRST_TAP_UNLOCK_AND_CONCURRENT_PREWARM_NO_DROP', async () => {
    resetHarness();
    const eng = new StudioAudioEngine();
    // Simulate iOS Safari touchend capture unlock + immediate button click 0ms later
    fireWindowEvent('touchend');
    eng.playSfx('ui_tap');
    await new Promise((r) => setTimeout(r, 120));
    assert(createdSources.length >= 1, `Expected first-tap ui_tap to play after concurrent prewarm, got ${createdSources.length} (fetches=${fetchCalls.length})`);
    assert(createdCompressors.length === 1, 'Expected master soft-limiter DynamicsCompressorNode on SFX bus');

    // Verify shared URL cache: streak_2..5 should reuse gold_resonance buffer with ZERO extra fetch() calls!
    const fetchesBeforeStreaks = fetchCalls.length;
    eng.playStreakFanfare(2);
    eng.playStreakFanfare(4);
    eng.playSfx('cutscene_whoosh');
    await new Promise((r) => setTimeout(r, 20));
    assert(fetchCalls.length === fetchesBeforeStreaks, `Shared URL aliases should not re-fetch (before=${fetchesBeforeStreaks}, after=${fetchCalls.length})`);
    eng.dispose();
  });

  // TEST 3: Rapid-duplicate dedupe kills double vault_thunk flanging & double lockThunk vibration
  await check('DOUBLE_VAULT_THUNK_DEDUPE_AND_HAPTICS_DEDUPE', async () => {
    resetHarness();
    const eng = new StudioAudioEngine();
    fireWindowEvent('pointerdown');
    await new Promise((r) => setTimeout(r, 35));
    createdSources = [];

    // Reproduces OverclockGestureController + SovereignMasterController firing within 0.2ms
    eng.playSfx('vault_thunk', { rate: 1.04, volumeScale: 0.78 });
    eng.playSfx('vault_thunk');
    assert(createdSources.length === 1, `Double vault_thunk must dedupe to 1 source, got ${createdSources.length}`);

    // Wait 100ms -> next lock should fire cleanly
    await new Promise((r) => setTimeout(r, 100));
    eng.playSfx('vault_thunk');
    assert(createdSources.length === 2, `Vault thunk after 100ms should play, got ${createdSources.length}`);

    const hap = new HapticsEngine();
    vibrateCalls = [];
    hap.lockThunk();
    hap.lockThunk();
    assert(vibrateCalls.length === 1, `Double Haptics.lockThunk must dedupe to 1 vibration, got ${vibrateCalls.length}`);
    eng.dispose();
  });

  // TEST 4: Overclock charge zero-crossing sustain loop + click-free stop on release/cancel/hidden/blur
  await check('OVERCLOCK_CHARGE_ZERO_CROSSING_SUSTAIN_AND_INSTANT_STOP', async () => {
    resetHarness();
    const eng = new StudioAudioEngine();
    fireWindowEvent('pointerdown');
    await new Promise((r) => setTimeout(r, 35));
    createdSources = [];

    mockCurrentTime = 2.0;
    eng.startOverclockCharge();
    assert(createdSources.length === 1, 'Expected overclock_charge BufferSource');
    const ocSrc = createdSources[0];
    assert(ocSrc.loop === true, 'Overclock charge must loop sustain plateau past 1.05s hold');
    assert(ocSrc.loopStart >= 0.50 && ocSrc.loopEnd <= 0.82 && ocSrc.loopEnd > ocSrc.loopStart + 0.1,
      `Loop points out of plateau range: [${ocSrc.loopStart}, ${ocSrc.loopEnd}]`);

    // Verify rising zero-crossing at loopStart & loopEnd
    const ch0 = ocSrc.buffer.getChannelData(0);
    const sIdx = Math.round(ocSrc.loopStart * ocSrc.buffer.sampleRate);
    const eIdx = Math.round(ocSrc.loopEnd * ocSrc.buffer.sampleRate);
    assert(Math.abs(ch0[sIdx]) < 0.03 && Math.abs(ch0[eIdx]) < 0.03,
      `Loop boundaries not near zero-crossing: start=${ch0[sIdx]}, end=${ch0[eIdx]}`);

    // Stop cleanly on visibilitychange (phone lock / tab switch)
    mockCurrentTime = 2.4;
    mockDocHidden = true;
    fireDocEvent('visibilitychange');
    assert(ocSrc.stopped === true, 'Overclock charge must stop immediately on document.hidden');
    assert(ocSrc.stopAt >= 2.4 && ocSrc.stopAt <= 2.48, `Expected hardware-clock stop ~45-55ms after t=2.4, got ${ocSrc.stopAt}`);

    // Verify async chargeToken guard: start while unloaded, stop before decode finishes -> NEVER starts!
    resetHarness();
    const eng2 = new StudioAudioEngine();
    eng2.startOverclockCharge();
    eng2.stopOverclockCharge();
    await new Promise((r) => setTimeout(r, 35));
    assert(createdSources.length === 0, `Cancelled async overclock_charge must never launch, got ${createdSources.length}`);
    eng.dispose();
    eng2.dispose();
  });

  // TEST 5: Zero overlapping VO lines & zero zombie pendingVoiceRequest resurrection
  await check('ZERO_OVERLAPPING_VO_AND_NO_ZOMBIE_RESURRECTION', async () => {
    resetHarness();
    const eng = new StudioAudioEngine();
    fireWindowEvent('pointerdown');

    let endedA = 0;
    let endedB = 0;
    eng.playVoice('cutscene_act0_1', () => { endedA += 1; });
    const elA = createdAudioEls[0];
    assert(eng.isVoicePlaying() === true, 'VO A should be playing');

    // Immediately start VO B -> VO A must be paused & unloaded, its late error/ended must NOT fire endedA!
    eng.playVoice('cutscene_act0_2', () => { endedB += 1; });
    const elB = createdAudioEls[1];
    assert(elA.paused === true && elA.removedSrc === true, 'VO A must be paused and src removed');
    elA.emit('error');
    elA.emit('ended');
    assert(endedA === 0, `Aborted VO A must NEVER fire onEnded, got ${endedA}`);
    assert(eng.isVoicePlaying() === true && eng.getActiveVoiceElement() === elB, 'Only VO B should be active');

    // Natural end of VO B fires endedB exactly once
    elB.ended = true;
    elB.emit('ended');
    elB.emit('ended');
    assert(endedB === 1, `VO B onEnded should fire once, got ${endedB}`);
    assert(eng.isVoicePlaying() === false, 'isVoicePlaying must be false after ended');

    // Pre-unlock autoplay block + stopVoice before first gesture -> cancelled clip must NEVER resurrect on tap!
    resetHarness();
    autoplayBlocked = true;
    const eng2 = new StudioAudioEngine();
    eng2.playVoice('cutscene_act0_1');
    eng2.stopVoice(); // User skipped scene before unlocking audio!
    await new Promise((r) => setTimeout(r, 15));
    autoplayBlocked = false;
    const countBeforeTap = createdAudioEls.length;
    fireWindowEvent('click');
    assert(createdAudioEls.length === countBeforeTap, 'Cancelled pre-unlock VO must NOT resurrect on next tap!');
    assert(eng2.isVoicePlaying() === false, 'No VO should play after skipped pre-unlock scene');

    // Non-cancelled pre-unlock VO SHOULD resume on first tap!
    resetHarness();
    autoplayBlocked = true;
    const eng3 = new StudioAudioEngine();
    eng3.playVoice('cutscene_act0_2');
    await new Promise((r) => setTimeout(r, 15));
    autoplayBlocked = false;
    fireWindowEvent('touchend');
    assert(eng3.isVoicePlaying() === true, 'Queued non-cancelled pre-unlock VO must play on first iOS touchend!');

    eng.dispose();
    eng2.dispose();
    eng3.dispose();
  });

  // TEST 6: Per-venue room-air loudness normalization + VO ducking + clean dispose listener removal
  await check('VENUE_AMBIENCE_NORMALIZATION_DUCKING_AND_DISPOSE_CLEANUP', async () => {
    resetHarness();
    const eng = new StudioAudioEngine();
    fireWindowEvent('click');
    eng.setMusicEnabled(true);
    eng.setVenueAmbience('ch');
    await new Promise((r) => setTimeout(r, 10));
    const chEl = createdAudioEls.find((e) => e.dataset.cueUrl?.includes('chamber_room'));
    assert(Boolean(chEl), 'Expected Geneva chamber room-air bed');

    eng.setVenueAmbience('gb');
    await new Promise((r) => setTimeout(r, 10));
    const gbEl = createdAudioEls.find((e) => e.dataset.cueUrl?.includes('london_rain'));
    assert(Boolean(gbEl) && chEl.paused, 'Switching venue must pause previous bed and start London rain');
    assert(gbEl.volume < 0.23, `London rain should be loudness-trimmed (~0.213), got ${gbEl.volume}`);

    // VO ducking drops ambience to ~34%
    const preDuck = gbEl.volume;
    eng.playVoice('cutscene_act0_1');
    assert(gbEl.volume < preDuck * 0.45, `VO should duck ambience (${preDuck} -> ${gbEl.volume})`);
    eng.stopVoice();
    assert(Math.abs(gbEl.volume - preDuck) < 0.02, `stopVoice should restore ambience (${gbEl.volume} vs ${preDuck})`);

    // Dispose must remove ALL window & document listeners!
    eng.dispose();
    const remainingWin = [...winListeners.values()].reduce((acc, s) => acc + s.size, 0);
    const remainingDoc = [...docListeners.values()].reduce((acc, s) => acc + s.size, 0);
    assert(remainingWin === 0 && remainingDoc === 0, `dispose() leaked listeners: win=${remainingWin}, doc=${remainingDoc}`);
  });

  // TEST 7: Static Codebase Audio Integrity & Asset Existence Scan
  await check('ZERO_MIDI_ZERO_SYNTH_ZERO_COSTLY_AND_ASSETS_COMPLETE', async () => {
    const midiExts = new Set(['.mid', '.midi', '.sf2', '.kar', '.xm', '.mod']);
    const midiHits = [];
    const synthHits = [];
    const costlyCodeHits = [];

    function walk(dir, checkSynth) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full, checkSynth);
        else {
          if (midiExts.has(path.extname(entry.name).toLowerCase())) {
            midiHits.push(path.relative(ROOT, full));
          }
          if (checkSynth && /\.(ts|tsx|js|mjs)$/.test(entry.name)) {
            const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
            lines.forEach((line, idx) => {
              const t = line.trim();
              if (t.startsWith('//') || t.startsWith('*')) return;
              if (/\b(createOscillator|OscillatorNode|createPeriodicWave|requestMIDIAccess|Tone\.Synth)\b/.test(line)) {
                synthHits.push(`${path.relative(ROOT, full)}:${idx + 1}`);
              }
              if (/costly misstep/i.test(line)) {
                costlyCodeHits.push(`${path.relative(ROOT, full)}:${idx + 1}`);
              }
            });
          }
        }
      }
    }
    walk(SRC, true);
    walk(PUBLIC, false);
    assert(midiHits.length === 0, `MIDI files found: ${midiHits.join(', ')}`);
    assert(synthHits.length === 0, `Procedural synth code hits: ${synthHits.join(', ')}`);
    assert(costlyCodeHits.length === 0, `Costly misstep code hits: ${costlyCodeHits.join(', ')}`);

    // Verify all 10 Foley MP3s + 5 Ambience MP3s + 144 VO MP3s exist and are non-empty
    const expectedAudio = [
      'sfx_ui_tap.mp3', 'sfx_spin_tick.mp3', 'sfx_sightline_snap.mp3', 'sfx_shutter_peel.mp3',
      'sfx_glass_shatter.mp3', 'sfx_overclock_charge.mp3', 'sfx_vault_thunk.mp3',
      'sfx_gold_resonance.mp3', 'sfx_backfire_fracture.mp3', 'sfx_passport_stamp.mp3',
      'ambience_chamber_room.mp3', 'ambience_london_rain.mp3', 'ambience_tokyo_neon_rain.mp3',
      'ambience_cairo_vault_air.mp3', 'ambience_ocean_storm_air.mp3',
    ];
    for (const f of expectedAudio) {
      const p = path.join(PUBLIC, 'assets', 'audio', f);
      assert(fs.existsSync(p) && fs.statSync(p).size > 1000, `Missing/empty audio asset: ${f}`);
    }
    const voMp3s = fs.readdirSync(path.join(PUBLIC, 'assets', 'voice')).filter((f) => f.endsWith('.mp3'));
    assert(voMp3s.length === 144, `Expected 144 VO mp3s, found ${voMp3s.length}`);
  });

  // TEST 8: Code-trace audit of remaining non-owned UI/Cinema/Meta audio hook gaps (informational report)
  const smc = fs.readFileSync(path.join(SRC, 'ui', 'SovereignMasterController.ts'), 'utf8');
  const bpb = fs.readFileSync(path.join(SRC, 'cinema', 'BossPhaseBannerDirector.ts'), 'utf8');
  const dpb = fs.readFileSync(path.join(SRC, 'meta', 'DiplomaticPassportBook.ts'), 'utf8');
  const iov = fs.readFileSync(path.join(SRC, 'meta', 'IntelObservatoryView.ts'), 'utf8');

  const externalHookFindings = {
    smcStopVoiceCount: (smc.match(/\.stopVoice\(/g) || []).length,
    bossBannerStopVoiceCount: (bpb.match(/\.stopVoice\(/g) || []).length,
    passportStopVoiceCount: (dpb.match(/\.stopVoice\(/g) || []).length,
    observatoryStopVoiceCount: (iov.match(/\.stopVoice\(/g) || []).length,
  };

  const passedCount = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass);
  console.log(JSON.stringify({
    suite: 'PILLAR-SOUND-DIRECTOR',
    passed: failed.length === 0,
    score: `${passedCount}/${results.length}`,
    results,
    externalHookFindings,
  }, null, 2));

  if (failed.length > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
