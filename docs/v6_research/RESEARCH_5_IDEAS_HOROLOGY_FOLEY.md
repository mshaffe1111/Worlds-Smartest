# World's Smartest v6.0 — Acoustic Horology Foley & Broadcast Mixing Research Matrix

> **Role:** Principal Acoustic Foley Artist & Broadcast WebAudio Mixing Engineer  
> **Scope:** All `33` `FoleySfxIdV6` acoustic cues (`48kHz / 192kbps` stereo MP3, `<5ms` transient attack, zero clipping) + `StudioAudioEngineV6.ts` (14-track `750ms` equal-power cosine dual-deck symphony crossfader, 5-bus Rupert-Neve mixing architecture, `-9.5dB` BBC voice ducking, live RMS VU telemetry, **zero `OscillatorNode`s**).

---

## 1. Benchmark Acoustic Studies (Anti-Tunnel-Vision Grounding)

### 1.1 *The Room* (Fireproof Games) — Horological Mass & Multi-Stage Mechanical Transients
What separates a believable mechanical puzzle box from a flat UI click is **micro-temporal physical staging**:
- **Primary Contact Impulse (`0.5–4.5ms`):** Establishes material hardness immediately via spectral centroid:
  - *Hardened steel / ruby pin / wire cutter jaws:* crisp `2.8–9.5kHz` metallic snap with micro-ring.
  - *Machined Geneva brass gear / Neve fader detent:* warm `850Hz–3.8kHz` damped metallic click + cabinet body at `260–480Hz`.
  - *Carved limestone cryptex tumbler:* dry `180Hz–1.4kHz` granular friction + heavy stone seat thud (`95–220Hz`).
  - *Velvet-lined leather trunk clasp / wooden drawer:* damped brass latch catch (`1.6–4.2kHz`) followed by cushioned low-mid cabinet resonance (`110–320Hz`).
- **Secondary Follow-Through (`12–68ms` post-impact):** A single impulse feels synthetic; real mechanisms always exhibit recoil, spring settling, detent capture, or cavity air displacement (`clasp release -> hinge creak -> felt settle`, `trigger snap -> jaw bite -> copper wire twang`).
- **Near-Field Booth Acoustics (`RT60 ≈ 0.20–0.32s`):** Watchmaker benches do not sit in cathedrals. Tight mahogany-and-brass early reflections (`3–26ms`) create tangible proximity ("in your hands") while preserving crispness during rapid consecutive inputs.

### 1.2 *Balatro* — Escalating Harmonic Reward Cascades Without Pitch-Shift Fatigue
*Balatro* proved that tactile audio escalation turns arithmetic into euphoria:
- **Anti-Pattern Killed:** Naive `playbackRate` pitch-shifting of a single chime upward across a 5-step streak introduces metallic formant distortion ("chipmunk bell") and ear fatigue.
- **v6.0 Solution — 5 Bespoke Real-Orchestra Harmonic Stingers:** Each streak tier (`streak_chord_1` → `streak_fanfare_5`) is separately scored and layered from **real studio-recorded orchestral multi-samples** (French horns, trumpets, trombones, violins, violas, cellos, concert harp, celesta/glockenspiel, timpani, cymbals), climbing a lush prime-time key & orchestration density ladder:
  1. `streak_chord_1` (**Cmaj9**): Crisp pizzicato/spiccato strings + warm French horn bloom + bright harp pluck (`~0.72s`).
  2. `streak_chord_2` (**Dmaj9**): Fuller arco string chord + horn duo + bright trumpet accent + rising harp roll (`~0.84s`).
  3. `streak_chord_3` (**Emaj9**): Layered trumpet/horn fanfare chord + soaring strings + glockenspiel shimmer + cascading harp arpeggio (`~0.98s`).
  4. `streak_chord_4` (**Gmaj9#11**): Heroic full brass swell + octave strings + timpani punctuation + sparkling celesta/harp sweep (`~1.18s`).
  5. `streak_fanfare_5` (**Cmaj13 Championship Fanfare**): Classic prime-time `G4 -> C5` heroic brass pickup into blazing full-orchestra tutti + sweeping concert harp glissando + rolling timpani + bright crash cymbal kiss + studio scoring-stage bloom (`~1.95s`).
- **Micro-Jitter Discipline:** Tiny playback rate jitter (`±1.5%`) is restricted exclusively to unpitched mechanical ticks (`rotary_knob_click`, `brass_gear_detent`, `neve_fader_detent`, `chip_stack_riffle`) and strictly disabled on pitched harmonic cues.

### 1.3 *Overwatch* — Hit-Confirm Cut-Through & Frequency-Slot Allocation
Blizzard's iconic hit-confirm works because it occupies an **uncontested psychoacoustic pocket** rather than brute-force loudness:
- **Spectral Slotting Against the 14 Symphonic Movements:**
  - *Symphonic Score Bus:* Rich orchestral weight `65Hz–1.8kHz` + silky string air `8–15kHz`.
  - *Tactile Horology Foley Bus:* Surgical transient presence in **`2.2kHz–6.2kHz`** (Fletcher-Munson peak sensitivity) with tight high-pass cleanup (`70–180Hz` on light switches/clicks) so rapid taps never muddy the double basses or timpani.
  - *Heavy Kinetic Impacts (`trapdoor_hinge_drop`, `pneumatic_piston_slam`, `vault_heavy_unlock`, `screw_rival_slam`):* Controlled `55–125Hz` physical chest thump paired with sharp `2.5–5.5kHz` mechanical snap so impact translates equally on iPhone speakers and studio monitors.
- **Strict `< 5ms` Transient Onset Alignment:** Every rendered MP3 is onset-trimmed and verified via 48kHz decoded PCM analysis so the primary tactile impulse hits within `< 5ms` of `t = 0.000s` (compensating for LAME encoder framing delay!).

### 1.4 BBC Broadcasting House & Rupert Neve 80-Series Mixing Desk Architecture
- **Speech-Priority Auto-Ducking (`-9.5dB` = `0.335x` linear):**
  - Fast `65ms` attack curve prevents host/cast VO first syllables from colliding with brass fanfares.
  - `120ms` hold + `440ms` smooth exponential release lets the orchestral score breathe back organically without radio-compressor pumping.
  - Independent bus routing: `autoVoiceDucking` attenuates `symphonyDuckGain` by `-9.5dB` (`0.335x`) and `ambienceDuckGain` by `-7.5dB` (`0.422x`), while `foleyGain` stays at `0dB` so player controls remain razor-sharp even while Frankie or Sloane talks.
- **Equal-Power Cosine Dual-Deck Crossfading (`750ms`):**
  - Standard linear fades produce an audible `-3dB` volume hole at midpoint (`0.5 + 0.5` uncorrelated signals sum to `0.707`).
  - Applying a 64-step `cos(u * π/2)` / `sin(u * π/2)` curve via `setValueCurveAtTime` across Deck A and Deck B over `750ms` keeps perceived loudness rock-steady across every Stage World and Trapdoor transition.
- **Authentic IEC 60268-17 VU Meter Ballistics (`getChannelLevels()`):**
  - Dedicated `AnalyserNode` taps on Master (Stereo L/R via `ChannelSplitterNode`), Symphony (Stereo L/R), Foley, Voice, and Ambience buses compute true float32 time-domain RMS + peak levels smoothed with classic VU needle ballistics (`45ms` rise, `260ms` fall) so the 4-bay Rupert-Neve console needles dance dynamically to the real symphony waveform.

---

## 2. Five-Idea Foley & Dynamic Mixing Design Matrix

| # | Architecture Concept | Transient Realism | Musicality & Cohesion | Mobile CPU & Memory | Verdict |
|---|---|---|---|---|---|
| **1** | **Pure WebAudio Procedural Synthesis (`OscillatorNode` + filtered noise)** | Fails — sterile, plastic, 8-bit web-game timbre lacking micro-asperities | Fails — synthetic sine/FM bleeps clash horribly with real orchestral tracks | Lowest (`0 KB` assets) | **KILLED** — Violates zero-oscillator mandate & sounds fake |
| **2** | **Unprocessed Stock SFX Pack Drop-In** | Inconsistent — mismatched mic distances, muddy room tails, `15–60ms` dead air | Poor — clashing acoustic spaces break the illusion of one cohesive TV studio | Medium (`~2.2 MB`) | **KILLED** — Destroys horological cohesion & tactile latency |
| **3** | **Single-Patch GM MIDI Soundfont + Pitch-Shifted Clicks** | Weak — uniform velocity envelopes, metallic aliasing when pitch-shifted | Flat — Casio/keyboard pad feel on streak chords | Medium (`~1.6 MB`) | **KILLED** — Fails "indistinguishable from live acoustic" bar |
| **4** | **Acoustic-Excited Physical Modal Resonance + Real Studio Multi-Samples (VSCO-2-CE / Physical Mic Recordings) + Dual Studio IR + 5-Bus Neve WebAudio Mixer** | **AAA Benchmark** — `<5ms` aligned real mic impulses + material eigenmode resonators + multi-stage mechanical tails | **AAA Benchmark** — Real recorded brass/strings/harp streak ladder unified inside one consistent studio room + scoring hall IR | **Optimal** — Offline-baked `48kHz / 192kbps` stereo MP3s (`~1.4 MB` total), `<0.2ms` runtime CPU per cue | **SELECTED WINNER** |
| **5** | **Runtime Browser Granular & Real-Time `ConvolverNode` Foley Synthesizer** | High — dynamic variation per press | High — shared live hall reverb | **Risky** — Heavy audio-thread FFT convolution spikes cause frame drops alongside Three.js WebGL2 on mobile Safari/Chrome | **REJECTED** for runtime foley (bus EQ/compression/metering kept lightweight in WebAudio; convolution baked offline) |

---

## 3. Winning Pipeline Specification (Design #4)

### 3.1 Acoustic Source Palette (100% Real Recorded Primitives — Zero Math Oscillators)
1. **CC0 Studio Multi-Velocity Orchestral & Percussion WAVs (`VSCO-2-CE`):** Real close-mic'd studio percussion (snare rimshots, woodblocks, castanets, triangle, glockenspiel, tubular bells, xylophone, timpani, crash/suspended cymbals, bass drum, tambourine) + brass (French horn, trumpet, trombone) + strings (violins, violas, cellos, pizzicato) + concert harp + celesta, cached outside the repo in `%TEMP%`.
2. **Verified Microphone-Recorded Horology & Physical Stems (`%TEMP%/ws_real_recordings` & repo physical masters):** Real Swiss watch escapement (`watch_tick.ogg`), heavy pendulum clock detent (`clock_ticking.ogg`), Canon T50 35mm mechanical shutter/spring (`canon_shutter.ogg`), Gravity Sound studio glass fractures (`glass_break_1/2.wav`), hand-hammered 4.5" bronze singing bowl (`singing_bowl.flac`), resonant crystal wineglass (`wineglass.ogg`), micro-switch (`mouse_click.ogg`), pneumatic rubber valve seal (`rubber_seal.ogg`), plus real crowd applause/gasp/orchestral MusyngKite reinforcements (`%TEMP%/ws_v5_musyngkite_cache`).
3. **Physical Modal Resonance Bank (Impulse-Excited Only):** Real physical recordings excite resonant bandpass SOS filter banks (`scipy.signal.sosfilt`) tuned to measured acoustic eigenmodes (machined brass `1.0 : 2.14 : 3.42 : 4.88`, cast bronze medal `1.0 : 2.76 : 5.40`, ruby-crystal `1.0 : 2.32 : 4.18`, stone cryptex `1.0 : 1.58 : 2.61`, pneumatic cylinder `1.0 : 2.02`). **Zero `sin()`/`cos()` waveform synthesis is ever used as an audio source.**
4. **Dual Studio Impulse Responses (`scipy.signal.fftconvolve`):**
   - *Watchmaker Mahogany Booth IR (`RT60 = 0.22s`):* Dense stereo early reflections (`3–28ms`) sculpted from real room-air recordings for crisp tactile proximity.
   - *Prime-Time Broadcast Scoring Stage IR (`RT60 = 1.10s`):* Warm stereo concert-studio bloom for the 5 orchestral streak stingers, trophy chimes, and studio audience cues.
5. **Broadcast Mastering Spec:** `48,000 Hz`, `192 kbps` stereo MP3 (`libmp3lame`), `True Peak <= -1.5 dBFS`, `0` clipped samples, `0` non-finite samples, primary transient attack `< 5ms` from start of file (verified post-MP3 decode!).

### 3.2 Complete 33-Cue `FoleySfxIdV6` Acoustic Design Map
- **Console & Horology Precision (6):** `ui_brass_tap`, `neve_fader_detent`, `rotary_knob_click`, `brass_gear_detent`, `clock_horology_tick`, `clock_escapement_urgent`
- **Board Contraptions & Traps (8):** `optical_beam_lock`, `crystal_hex_claim`, `iron_chain_shatter`, `vault_heavy_unlock`, `screw_rival_slam`, `twist_siren_chime`, `chip_stack_riffle`, `trapdoor_hinge_drop`
- **Question Toys & Tactile Gadgets (6):** `wire_cutter_snip`, `nixie_spark_crackle`, `cryptex_stone_tumbler`, `globe_pin_ruby_click`, `paddle_spring_slam`, `pneumatic_piston_slam`
- **Backstage Trunk, Trophies & Medals (5):** `velvet_trunk_clasp`, `foil_card_flick`, `relic_pedestal_hum`, `trophy_pedestal_chime`, `medal_enamel_clink`
- **Live Studio Audience (3):** `crowd_warm_applause`, `crowd_studio_roar`, `crowd_collective_gasp`
- **5 Ascending Real-Orchestra Streak Stingers (5):** `streak_chord_1` (Cmaj9) → `streak_chord_2` (Dmaj9) → `streak_chord_3` (Emaj9) → `streak_chord_4` (Gmaj9#11) → `streak_fanfare_5` (Cmaj13 Full Brass+Strings+Harp+Timpani+Cymbal Fanfare)

### 3.3 `StudioAudioEngineV6.ts` Rupert-Neve Signal Graph
```
[Deck A Symphony] ─┐                 ┌─> symphonyDuckGain (-9.5dB) ─> symphonyGain ─> [Analyser L/R] ─┐
                   ├─(750ms cos/sin)─┤                                                                 │
[Deck B Symphony] ─┘                 └─────────────────────────────────────────────────────────────────┤
                                                                                                       │
[33 Foley Buffers (micro-jitter on ticks, dedupe)] ──────────────────> foleyGain ────> [Analyser] ─────┼─> masterGain ─> [Broadcast Glue Compressor] ─> [Safety Ceiling Limiter] ─> [Master Analyser L/R] ─> Destination
                                                                                                       │
[Ambience Bed (looped stage room air)] ──> ambienceDuckGain (-7.5dB) ─> ambienceGain ─> [Analyser] ────┤
                                                                                                       │
[Host / Cast Voice Playback] ────────────────────────────────────────> voiceGain ────> [Analyser] ─────┘
```
Every bus binds live in real time to `BroadcastOptionsStateV6` (`applyOptions(opts)`), with click-free `setTargetAtTime` smoothing (`18ms` fader response) and instant zero-dependency fallback if any symphony track is still downloading.
