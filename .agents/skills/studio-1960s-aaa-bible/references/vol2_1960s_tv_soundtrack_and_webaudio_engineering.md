# Volume 2: 1960s TV Game Show Soundtrack, Studio Foley & Sample-Based WebAudio Engineering

## 1. Forensic Diagnosis: Why Pure Procedural WebAudio Sounds Like an Early-1980s Casio Keyboard
In `ShowbandAudioEngineV7.ts`, the previous build proudly boasted `"0 MB Network MP3 Dependencies: 100% deterministic WebAudio + 32kHz OfflineAudioContext boot-baked instrument kernels"`. The player immediately graded Sound an **F (*"sounds like a keyboard from the early 1980's. just horrible"*)**. Here is the exact psychoacoustic science of why:

1. **Missing Chaotic Acoustic Transients (First `5–40 ms`):**
   - Human auditory cortex identifies real acoustic instruments almost entirely from the **non-periodic physical attack transient**: brass lip-buzz turbulence + mute chiff, upright bass finger-callus scrape against gut/steel strings, felt hammer thud + soundboard knock on a grand piano, wire brush swish on a coated calfskin snare head, and wooden mallet clack on marimba/vibraphone bars.
   - Mathematical `OscillatorNode` waveforms (`sine`, `triangle`, `sawtooth`, FM ratios) lack real physical chaos—making them acoustically identical to 1981–1985 Casio/Yamaha home keyboards!
2. **Static Formants & Phase Lock Across Pitch:**
   - Real instruments have fixed body resonances (formants) that stay stationary as pitch changes, plus natural micro-pitch drift, vibrato delay, brass fall-offs/doits, and room bleed into RCA 44-BX ribbon mics. Pitch-shifting simple oscillator kernels or looping rigid mathematical envelopes screams "1983 MIDI chip."
3. **The One Genuine Exception (Tonewheel Organs!):**
   - A **1960s Hammond B3 / Lowrey Studio Organ** literally *is* an electro-mechanical 9-drawbar additive sine-wave generator (`16', 5-1/3', 8', 4', 2-2/3', 2', 1-3/5', 1-1/3', 1'`) with `2nd/3rd` harmonic percussive key-click and a **rotating Leslie 122 Dual-Rotor Horn/Drum speaker** (Doppler pitch + amplitude modulation + warm tube overdrive)! Properly modeled drawbar organ + Leslie cabinet sounds genuinely 1960s—*when paired with real sampled brass, real sampled upright bass, real sampled jazz drums, and real sampled vibraphone/piano!*

---

## 2. Authentic 1960s TV Game Show Musical Styles & Orchestration Reference

1. **The "Tijuana Brass / Chuck Barris" Bounce (*The Dating Game*, *Newlywed Game*, 1965–1968):**
   - **Inspiration:** Herb Alpert & The Tijuana Brass (*Spanish Flea*, *Whipped Cream*, *Tijuana Taxi*), Milton DeLugg.
   - **Instrumentation:** Two staccato bright trumpets in thirds/sixths, marimba doubling the melody, nylon/clean rhythm guitar *chunk* on beats 2 & 4, bouncy two-beat upright bass (`root–fifth`), crisp snare rim/brushes + tambourine.
   - **Mood:** Sunny, mischievous, infectious, impossible not to smile at on the Start Screen and Daytime Board!
2. **The "30 Rock / Score Productions" Jazz Showband (*Jeopardy! '64 "Take Ten"*, *Password*, *Match Game*, *Hollywood Squares*):**
   - **Inspiration:** Julann & Merv Griffin, Robert Israel & Bob Cobert (Score Productions), Mort Lindsey, Quincy Jones (*Soul Bossa Nova*).
   - **Instrumentation:** Walking acoustic upright double bass (4-to-the-bar swing), brushed jazz ride & hi-hat on `2 & 4`, vibraphone + acoustic grand piano comping `maj7 / 6 / 9 / 13` voicings, Hammond B3 organ pads, and punchy big-band horn section stabs on transitions!
3. **The "Merv Griffin *Think!*" Thinking Bed (During `QUESTION_OPEN`):**
   - **Inspiration:** Merv Griffin's 1963 *"A Time for Tony" / "Think!"* & Score Productions thinking cues.
   - **Arrangement Law:** When a player is reading a question, **NEVER blast busy melodies or harsh high frequencies!** Play a spacious, warm, calming `92–104 BPM` chamber jazz loop: soft pizzicato upright bass, delicate vibraphone/celesta + felt piano alternating `I6 - vi7 - ii7 - V7`, light woodblock/brush pulse, ducked `-6 dB` in the `1–3 kHz` vocal/reading band—shifting smoothly into urgent woodblock/brass tension only in the **final `5–7` seconds**!
4. **The "1960s Studio Recording Chain" (RCA Studio A / Capitol Chambers):**
   - **RCA 44-BX Ribbon Mic Rolloff:** Gentle warm shelf above `5.5 kHz` + warm `180–350 Hz` body (zero piercing digital fizz).
   - **Wide Living-Stereo Stage:** Esquivel / Command Records tasteful stereo placement (`Bass & Kick` dead center, `Piano/Guitar` `-30% L`, `Vibraphone/Hammond` `+30% R`, `Brass Section` wide stereo spread) glued together by a `1.4s` warm Capitol concrete/wood studio chamber `ConvolverNode` + subtle tape saturation (`tanh` soft clip).

---

## 3. Essential 1960s Game Show Studio & Board Sound Effects (Must Have Real Depth!)

A 1960s game show feels alive because **every physical object on stage makes a gratifying mechanical or human sound**:

1. **Board & Scoreboard Mechanical Foley:**
   - **Motorized Trilon Tile Hover:** Soft Bakelite/relay detent click (`15–25ms` crisp mechanical transient).
   - **Trilon Tile Flip / Select:** Motorized 3-sided prism spin + solenoid latch (`clack-whirr-THUNK!` + warm brass chime).
   - **Solari Split-Flap Dollar Tally:** Rapid mechanical plastic-flap cascade (`clack-clack-clack-clack-DING!`) as `$Cash` rolls onto the scoreboard!
   - **Secret Square / Daily Double Discovery:** Iconic 1960s warbling vibraphone/chime arpeggio + chasing bulb relay sparkle + studio audience *"Ooooh!"* + applause swell!
   - **Locked Vault Unlock:** Heavy safe tumbler clunk + spring latch release + bright bell ring.
   - **Mystery Curtain / Prize Wheel Spin:** Wooden peg-and-leather-flapper wheel clicks decelerating smoothly into a reveal fanfare (or comical trombone *wah-wah-wahhh* on a Zonk!).
   - **Instant Bargain Bell:** Authentic double-strike brass shopkeeper/prize bell (*DING-DING-DING!*).
2. **Question & Answer Broadcast Cues:**
   - **Answer Lock-In (`A/B/C/D` Tap):** Crisp illuminated studio push-button switch + subtle warm chime note.
   - **Correct Answer:** Authentic **Solenoid Tone-Bar Bell (`DING!`)** + upbeat 3-chord brass/vibes fanfare sting + warm live studio audience applause!
   - **Wrong Answer / Timeout:** Authentic **1960s Edwards AC Magnetic Studio Buzzer (`BRZZZT!`)**—raspy, low-mid electro-mechanical buzz (never a shrill 8-bit square beep!) + sympathetic studio audience *"Awww / Groan"*.
   - **Final 5-Second Clock:** Crisp studio woodblock/escapement tick-tock alternating pitches (`F5 -> C5`) with subtle heartbeat bass pulse on `3.. 2.. 1..`.
3. **Live Studio Audience ("50 Million Watching, 300 in the Bleachers"):**
   - Warm, carpeted 1966 TV studio crowd reactions: **Walk-On Theme Applause**, **Polite Clap** (standard correct), **Big Cheer + Whistles** (Daily Double / Streak >= 3 / Comeback), **Collective Gasp / "Ooooh!"** (Secret Square / tight lead change), **Sympathetic "Awww"** (miss), and **Standing Ovation Roar** (Episode Victory!).

---

## 4. Technical Blueprint for Shipping Real Sampled Audio in `Worlds Smartest`

1. **Sample-Backed Instrument Engine (`public/assets/v7/audio/` or Local Compressed Sample Sprites):**
   - Never rely on naked `OscillatorNode` math for acoustic instruments!
   - Bundle compact, high-character **real recorded acoustic samples / SoundFont multi-samples** (`.mp3` / `.ogg` / `.wav` decoded into `AudioBuffer` at boot, keeping total boot payload lean `< 1.5–2.5 MB` cached by Service Worker):
     - Real **Acoustic Grand Piano** multi-zone samples (`C2, C3, C4, C5`)
     - Real **Plucked Upright Double Bass** samples (`E1, A1, D2, G2`)
     - Real **Trumpet / Brass Section** stabs, swells & falls
     - Real **Vibraphone / Marimba** struck bar samples
     - Real **Jazz Drum Kit** samples (`Brushed Snare`, `Crisp Rim/Stick Snare`, `Warm Felt Kick`, `Jazz Ride Cymbal`, `Hi-Hat Chick`, `Tambourine`, `Bongo`)
     - Real **Studio Crowd** (`Applause`, `Big Cheer`, `Ooh/Gasp`, `Aww Groan`) & **Mechanical Bells / Split-Flaps**
   - Combine those real `AudioBuffer` recordings with WebAudio velocity filtering, human swing micro-timing (`58–62%` eighth-note swing ratio + `±6ms` humanization), dynamic voice-leading across 8–16 bar compositions, and the Capitol Chamber `ConvolverNode` + 5 XAG gain buses (`master`, `music`, `sfx`, `crowd`, `ambience`) so `recordMasterAudioSamples()` captures the exact rich stereo studio mix!
2. **Mandatory Perceptual Verification:**
   - Every audio change MUST be verified by recording `5–8s` `.wav` files from Title Screen, Board Groove, Thinking Bed, Correct Bell + Applause, and Wrong Buzzer via `recordMasterAudioSamples()` and listening to them directly via `read_file`.
