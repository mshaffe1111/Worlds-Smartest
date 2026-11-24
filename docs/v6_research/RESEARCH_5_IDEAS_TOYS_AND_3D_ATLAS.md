# World's Smartest v6.0 — Deep Research & 5-Idea Matrix: Ultra-HD 3D Shaded-Relief Atlas & 50 Zero-Scroll Tactile Question Toys (`001–050`)

> **Author:** `@v6-toys-relief-atlas` (Principal Interactive Stage-Toy & 3D Cartography Engineer)
> **Scope:** `AtlasReliefGlobe3DV6.ts`, `scripts/v6_bake_relief_earth.py`, `public/assets/textures/v6/*`, `ToyCatalog001To050.ts`, `ToyStageRendererA.ts`
> **Mandate:** Permanently eradicate `v5.0`'s *"badly drawn maps"* and *"having to scroll to see full questions and answers"*. Deliver museum-grade 4K Shaded-Relief 3D Cartography + 50 genuinely distinct, tactile, **100% zero-scroll** interactive question toys across Portrait (`360×640`–`430×932`), Tablet (`768×1024`), Desktop, and Landscape Phone Split-Stage (`660×340` & `844×390`).

---

## 1. Reference Study — Why Great Tactile Games Feel Effortless

Before writing a line of TypeScript, we dissected four gold-standard reference pillars:

| Pillar | Reference Game / Product | Core Mechanical Secret Extracted for `v6.0` | What We Explicitly Reject |
| :--- | :--- | :--- | :--- |
| **Diegetic Risk & Elimination** | *Keep Talking and Nobody Explodes* | **The UI *is* the physical bomb.** Players snip real braided wires, flip guarded toggles, and read live Nixie countdowns. Inverting "pick 1 right answer" into **"defuse 3 wrong hazards"** transforms passive multiple-choice into visceral tension with sparks, snips, and `✓ SAFE` tags. | Flat colored buttons labeled "Wire A" with no snip physics, sparks, or remaining-hazard tension. |
| **Weighted Materiality & Precision** | *The Room* (Fireproof Games) | **Brushed brass, chamfered steel, rotary detent clicks, and engraved letter rings.** A brass Cryptex tumbler or rotary safe dial signals affordance through knurled rims, specular highlights, and magnetic alignment windows — requiring almost zero tutorial text. | Generic HTML `<input type="range">` sliders, flat SaaS cards, or neon-outline sci-fi boxes. |
| **Ultra-HD 3D Cartography** | *GeoGuessr* × *Apple Maps 3D Globe* | **True spherical intuition + real physical relief + exponential Haversine scoring.** Mountain ranges catch directional raking light; deep ocean bathymetry guides geography naturally; 1-finger inertial spin & 2-finger pinch-zoom feel frictionless; dropping a 3D ruby pin shoots a glowing golden geodesic arc & shockwave to the truth. | Flat 2D Mercator SVG country blobs, distorted poles, blurry procedural noise continents, or online map tiles that break offline. |
| **Instant Micro-Grammar** | *WarioWare* | **`<= 1.5s` comprehension.** Every toy opens with a punchy `<= 5-word` imperative action callout (`CUT 3 WRONG WIRES`, `SPIN BRASS RINGS`, `SLAM DIS OR DAT`) and a single unmistakable primary gesture. Every tap yields instant spring physics + particle feedback. | Multi-paragraph rule explanations, 2-step confirmation modals on reflex toys, or vertical scrollbars hiding answers. |

---

## 2. Part A — Ultra-HD Offline-Ready 3D Shaded-Relief World Globe (6-Idea Evaluation Matrix)

| # | Architecture Concept | Visual Fidelity | Offline Ready? | Mobile 60fps & Bundle Weight | Decision & Rationale |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | **Flat 2D SVG Vector Country Polygons (Mercator / Natural Earth GeoJSON)** | 2/10 *(Flat blobs, zero mountains or ocean depth — repeats `v5.0`)* | Yes | Fast, ~300 KB | **KILLED.** Directly repeats the user-roasted *"badly drawn maps"* defect and breaks spherical great-circle intuition. |
| **2** | **Procedural Noise / Fractal Landmass Synthesis** | 3/10 *(Unrecognizable coastlines; wrong geography for trivia)* | Yes | Fast, ~50 KB | **KILLED.** Trivia cartography requires real, accurate coastlines, mountain chains (Himalayas, Andes, Rockies, Alps), islands, and trenches. |
| **3** | **Live Streaming Map Tiles (Mapbox / OSM / Cesium Quadtree)** | 9/10 *(When online)* | **NO** *(Breaks offline PWA / Capacitor & adds API key / CORS failures)* | Tile pop-in jitter on fast 3D spin | **KILLED.** Violates offline-first bundle reliability and fails in isolated/airplane/headless verification environments. |
| **4** | **High-Poly Vertex-Displaced Terrain Sphere (`512×256` mesh = 262k tris)** | 8.5/10 *(Real silhouette ridges)* | Yes | Heavy GPU vertex throughput; breaks clean spherical pin surface-normal math | **REJECTED AS PRIMARY.** Overkills mobile vertex budget and complicates sub-degree `Raycaster` lat/lng conversion. |
| **5** | **Baked Public-Domain Natural Earth 4K Shaded-Relief PBR Sphere + 2K Elevation Bump + 2K Ocean Specular + Fresnel Atmosphere + Brass Armillary Cradle** | **10/10** *(Museum-grade Tom Patterson cartography + dynamic raking mountain shadows + satin sapphire oceans + brass horology frame)* | **YES (100% Local WebP)** | **Locked 60fps** (`SphereGeometry(1, 128, 96)`, ~1.5–2.2 MB total WebP) | **SELECTED WINNER.** Combines real 10,800×5,400 CC0 Natural Earth II (`NE2_50M_SR_W`) + Cross-Blended Hypsometric Relief (`HYP_50M_SR_W`) + Ocean Bathymetry (`GRAY_50M_SR_OB`) + Land Mask (`SR_50M`) downsampled via Lanczos3 into razor-sharp 4K Albedo + 2K Elevation Bump + 2K Specular/Roughness maps. |
| **6** | **Procedural Shader Micro-Graticule + Solar Terminator + Geodesic Arc Layer** | **9.5/10** *(Crisp sub-pixel gold parallels/meridians even at max zoom)* | **YES** | Negligible GPU cost (procedural line meshes + lightweight `ShaderMaterial`) | **SELECTED COMPLEMENT.** Layers 15° antique gold lat/lng lines, glowing Equator/Tropics, optional live Sun Terminator shadow (Toy 17), and 3D `TubeGeometry` golden great-circle flight arcs + animated shockwave target rings directly onto Concept #5. |

### 2.1 Exact Offline Texture Pipeline (`scripts/v6_bake_relief_earth.py`)
1. Downloads & locally caches public-domain CC0 Natural Earth 50m GeoTIFF rasters (`NE2_50M_SR_W.zip`, `HYP_50M_SR_W.zip`, `GRAY_50M_SR_OB.zip`, `SR_50M.zip`) from the official NACIS CDN (`naciscdn.org`), with a deterministic high-detail procedural fallback if run completely offline without cache.
2. **Color-Graded Museum Atlas Albedo (`earth_relief_albedo_4k.webp`, `4096×2048`):**
   - Cross-blends Natural Earth II natural biomes (62%) with Hypsometric Elevation Tints (38%) so the Himalayas, Andes, Alps, and Rockies radiate luminous alpine snow & ochre plateaus while Amazon/Congo/Europe remain deep emerald and ocean basins show rich sapphire-cobalt continental shelves and abyssal trenches (Mariana, Mid-Atlantic Ridge, Peru-Chile Trench).
   - Subtle unsharp mask (`radius=1.1, percent=65`) after Lanczos resampling keeps island chains (Japan, Greece, Indonesia, UK, Caribbean) razor-sharp on 3× Retina displays.
3. **Dynamic Mountain Relief Bump (`earth_elevation_bump_2k.webp`, `2048×1024`):**
   - Combines `SR_50M` land shaded relief with high-pass elevation gradient and subtle `GRAY_50M_SR_OB` seafloor ridges so studio key/rim lights sculpt moving shadows across mountain ranges as the player spins the globe.
4. **Ocean Specular / Roughness Mask (`earth_ocean_specular_2k.webp`, `2048×1024`):**
   - Extracts precise water vs. land segmentation from `SR_50M` (flat water value vs. textured land), producing satin-glossy oceans (`roughness ~0.28`) contrasted against matte topographic continents (`roughness ~0.82`) for instant Apple Maps 3D / luxury studio legibility.

### 2.2 Mathematical Precision (`AtlasReliefGlobe3DV6.ts`)
- **Spherical UV ↔ Lat/Lng Alignment:** Exact Three.js `SphereGeometry` equirectangular convention (`phi = (90 - lat) * π/180`, `theta = (lng + 180) * π/180`), verified both forward (`latLngToVector3`) and inverse (`vector3ToLatLng`) with unit round-trip accuracy `< 0.001°`.
- **Haversine Great-Circle Distance:** `R = 6371.0088 km`, returning exact `km` and `mi`.
- **GeoGuessr-Calibrated `0..1000` Scoring Curve:**
  - `<= 120 km` → `1000 pts` (**BULLSEYE** golden ring burst)
  - `> 120 km` → `round(1000 * exp(-(km - 120) / 1850))` clamped to `0..1000` (`accuracyRatio = pts / 1000`).
  - Smoothly scales to strict (`450 km` threshold) or generous (`1800 km` threshold) win grading depending on Stage difficulty.
- **Armillary Brass Meridian Cradle:** Brushed-brass outer meridian ring (`TorusGeometry`, `metalness: 0.90`, `roughness: 0.24`), vernier degree pips every `15°`, north/south brass finials, and warm Fresnel atmospheric rim (`ShaderMaterial`, `AdditiveBlending`, `BackSide`).

---

## 3. Part B — 50 Zero-Scroll Tactile Question Toys (`001–050`): 6-Idea Architecture Matrix

| # | Layout / Rendering Paradigm | Zero-Scroll Guarantee (`360×640` & `660×340`) | Retina Text Crispness | Toy Diversity (50 Toys) | Decision |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **1** | **Classic Stacked Trivia Card + Scrollable Choices** | **FAIL** *(Scrolls on 640px & landscape)* | Good | 1/10 | **KILLED.** Direct cause of the user's `v5.0` complaint. |
| **2** | **Pure SVG Canvas (Vector Art + `<text>` inside `<svg>`)** | Fragile | **POOR** *(Blurs/scales unevenly, weak line wrapping)* | 4/10 | **KILLED.** Violates the zero-SVG-blur-text Retina mandate. |
| **3** | **100% WebGL 3D Text (`troika-three-text`) for Prompt & All Answers** | Hard to guarantee 44px HIG hit targets on narrow phones | Good at fixed distance, awkward reflow | 6/10 | **REJECTED FOR TEXT.** Reserved purely for 3D scene widgets (globe pins/arcs), never cramped question text. |
| **4** | **Single A/B/C/D Lozenge Template with 50 CSS Skins** | Easy | Good | **2/10 (Fake variety!)** | **KILLED.** Cosmetic skinning is tunnel vision; each family must play differently. |
| **5** | **Strict `22% / 78%` Zero-Scroll Adaptive Split-Stage + 5 Deep Tactile Mechanical Engines (DOM Retina Typography + Canvas2D Sparks/Physics + Three.js 3D Globe)** | **100% ZERO SCROLL (`scrollHeight <= clientHeight`)** across `360×640`, `390×844`, `660×340`, `844×390`, `1280×800` | **3× Native OS Retina Flat Typography** (`Inter` / `Cinzel` / `JetBrains Mono`, `0` SVG blur text, `0` `backdrop-filter`) | **10/10** *(5 genuinely distinct interaction engines × 10 bespoke physical variants = 50 toys)* | **SELECTED WINNER.** |
| **6** | **Stage-World Chameleon PBR Trim Inheritance** | Preserved | Preserved | Multiplies visual freshness across all 10 Stage Worlds | **SELECTED COMPLEMENT.** Reads `StageAtmosphereThemeV6.hudTheme` CSS tokens so every toy automatically harmonizes with Vaudeville Mahogany, Geneva Marble, Monte Carlo Emerald, Analog Bunker Olive, Kyoto Urushi Lacquer, or Sovereign Colosseum Gold! |

### 3.1 Strict Zero-Scroll Viewport Budget Math

| Viewport Class | Grid Layout | Prompt Header Budget | Interactive Gadget Stage | Scrollbar? |
| :--- | :--- | :--- | :--- | :---: |
| **Compact Portrait (`360×640`, `375×667`)** | Vertical 2-row (`100dvh`) | `max-height: 22dvh` (`<= 140px`): 1-row slim meta/timer (`24px`) + crisp 2-line prompt (`clamp(13px, 3.6vw, 16px)`) + action pill | `78dvh` (`>= 498px`): full tactile gadget, `min-height: 0; overflow: hidden` | **0px** |
| **Standard/Pro Portrait (`390×844`, `430×932`)** | Vertical 2-row (`100dvh`) | `max-height: 21dvh` (`<= 176px`): crisp 2–3 line Retina prompt (`clamp(15px, 3.9vw, 18px)`) + Nixie timer bar | `79dvh` (`>= 666px`): spacious 3D globe, briefcase, cryptex, or spring paddles | **0px** |
| **Phone Landscape Split-Stage (`660×340`, `844×390`)** | **2-Column Split-Stage** (`39vw` Left / `61vw` Right, `100dvh`) | **Left Column (`39vw`):** Category crest + Action Callout + Crisp Prompt + Timer + Live Feedback/Hint (`flex`, `overflow: hidden`) | **Right Column (`61vw`):** Full-height 3D Relief Globe, Brass Cryptex, Wire Briefcase, or Dual Spring Paddles! | **0px** |
| **Tablet / Desktop (`768×1024`, `1280×800`)** | Centered Stage (`max-width: 1120px`, Split on wide `>= 900px` or `20%/80%` stacked) | `<= 20dvh` (`160px` max) | `80dvh` (`640px`+) theater showcase | **0px** |

---

## 4. Complete 50-Toy Architectural Map (`ToyCatalog001To050.ts` & `ToyStageRendererA.ts`)

| Family (`ToyFamilyIdV6`) | Toy Numbers | Core Gameplay Loop (Why It's Fun) | Bespoke Physical Mechanics Across the 10 Toys |
| :--- | :---: | :--- | :--- |
| **I. `DEFUSAL_ELIMINATION`** | `001–010` | **Eliminate 3 wrong hazards** to leave the 1 truth alive (instant catastrophe if you cut/smash the truth!). Live Canvas2D spark/shard bursts + `✓ SAFE` tags. | `01` Bomb Briefcase Wires (chrome shears + sparks) · `02` Impostor Statues (hammer cracks/shatters) · `03` 4-Tile Trapdoors (hinged steel floor drop) · `04` Lie Circuit Breakers (heavy toggle snap + arc) · `05` Crocodile Safe Teeth (jaw clamp tension) · `06` Decoy Wax Candles (snuff puffs & smoke) · `07` Short-Circuit Plugs (coaxial yank) · `08` Carnival Balloons (dart pop burst) · `09` Saboteur Escape Pods (airlock eject) · `10` Rigged Burning Fuse (live burning spark line snip). |
| **II. `ATLAS_RELIEF_SPATIAL`** | `011–020` | **Live 3D Shaded-Relief World Globe (`AtlasReliefGlobe3DV6`)** with raycaster ruby pushpin, Haversine distance, geodesic arcs & golden shockwaves. | `11` 3D Globe Pin-Drop · `12` Flight-Path Great-Circle Closer Duel · `13` Latitude Equator-to-Pole Ring Slider · `14` Ocean Trench Depth Plunge · `15` Continent Elevation Peak Pick · `16` Brass Compass Bearing Lock · `17` Time-Zone Sun Terminator · `18` 4-Quadrant Hemisphere Sorter · `19` Antipode Opposite-Earth Tunnel · `20` Landmark Orbit Zoom. |
| **III. `DIALS_CRYPTEX_LOCKS`** | `021–030` | **Weighted horological input** — spin brass cylinders, crack rotary safes, slide calipers, flip split-flaps, and stamp telegraph rhythms. | `21` 3D Brass Cryptex Ring Tumbler (vertical wheel drag/tap per letter ring!) · `22` Rotary Vault Safe-Cracker (radial spin + lock tumbler) · `23` 270° Brass Tachometer Needle (pointer drag arc + Nixie tube) · `24` Airport Split-Flap Clacker · `25` Missing-Vowel Marquee Bulbs · `26` Anagram Brass Tile Rail · `27` 4-Wheel Combination Padlock · `28` Vintage Cash-Register Plunger Keys · `29` Vernier Brass Caliper Gauge · `30` Telegraph Brass Key. |
| **IV. `RAPID_PADDLES_REFLEX`** | `031–040` | **High-tempo *WarioWare* reflex & combo streak** — chunky physical spring paddles, pistons, moving conveyors, shell shuffle, and redline chicken. | `31` Spring-Loaded 2-Paddle DIS OR DAT (rapid streak combo!) · `32` Pneumatic Whack-the-Truth Pistons · `33` Buzzer Chicken (Stop Before Redline!) · `34` Conveyor Left/Right Crate Sorter · `35` Falling Crate Catch Cart · `36` Quick-Draw Sheriff Paddles · `37` Guillotine True/False Pull-Lever · `38` 3-Cup Brass Shell Track · `39` Pinball Flipper Bumper Shot · `40` Hot-Mic VU Rapid Blitz. |
| **V. `PROGRESSIVE_AUDIO_REVEAL`** | `041–050` | **Information-unmasking risk/reward** — spend pot to peel clues, open mechanical irises, sweep searchlights, clamp year vises, or lock early for maximum chips! | `41` 4-Clue Cascading Jackpot (`$1,000 → $250`) · `42` Symphony Composer/Era Phonograph Ear-Test · `43` Mechanical Camera Iris Unmask · `44` Classified Redaction Tape Peel · `45` Darkroom Searchlight Reveal · `46` Detective Brass Magnifying Loupe · `47` Year-Vise Narrowing Clamp (tighter jaws = higher mult!) · `48` Quote Missing-Word Rubber Stamp · `49` 3-Clue Suspect Lineup · `50` Edison Riddle Brass Cylinder. |

---

## 5. Clean Integration Contract (For `UnifiedToyManagerV6` & `ShowtimeMasterDirectorV6`)

`ToyStageRendererA.ts` exports a self-contained, zero-leak imperative renderer API designed to mirror cleanly with `ToyStageRendererB.ts` (Toys `051–100`):

- `mountToyStageA(container: HTMLElement, toy: ToyDefinitionV6, clue: CalibratedClueV6, options: ToyStageMountOptionsV6): ToyStageHandleV6`
- `ToyStageMountOptionsV6`:
  - `stageTheme?: StageAtmosphereThemeV6` (chameleon styling across all 10 Stage Worlds)
  - `timeLimitSeconds?: number` (overrides `toy.baseSeconds` when Relaxed `+4s` option is enabled)
  - `onPlayFoley?: (sfx: FoleySfxIdV6) => void`
  - `onResolve: (result: ToyResolutionV6) => void`
  - `onInterimAction?: (tag: string, detail?: string) => void` (triggers Frankie/Julian live mid-toy broadcast quips!)
- `ToyStageHandleV6`:
  - `forceTimeout(): void` (graceful shot-clock expiry returning accurate partial/timeout `ToyResolutionV6`)
  - `applyFoilAssist?(kind: 'DEFUSE_ONE_WIRE' | 'REVEAL_HINT' | 'ADD_TIME'): boolean` (direct hook for Frankie's Foil Dirty-Trick Cards!)
  - `dispose(): void` (cleanly tears down WebGL `AtlasReliefGlobe3DV6`, Canvas2D loops, timers, pointer/keyboard listeners, and DOM nodes — zero leaks!).
