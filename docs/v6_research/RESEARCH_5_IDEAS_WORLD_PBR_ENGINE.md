# World's Smartest v6.0 — 3D Stage Worlds, PBR Lighting & Horology CAD Architecture
## Deep Research & 5-Idea Anti-Tunnel-Vision Design Matrix

**Author:** `v6-world-pbr-engine` (Principal 3D Graphics & Architectural World Director)
**Branch:** `feat/v6-world-pbr-engine`
**Scope:** `StageThemesCatalogV6.ts`, `HorologyCADKit.ts`, `StageWorldArchitecturesV6.ts`, `CameraDirectorV6.ts`, `StageWebGL2Engine.ts`

---

## 1. Masterwork Craft Audit & The "Zero AI Slop" Kill-List

Before authoring a single line of WebGL2 code, we audited nine iconic human visual masterworks to isolate what creates *physical belief*, *architectural memory*, and *material gravitas* on a mobile/desktop screen:

| Reference Masterwork | What Makes It Unforgettable | Direct Architectural Translation in v6.0 |
|---|---|---|
| **Monument Valley 3** | Architectural scale clarity, graphic shadow planes, restrained mineral/terracotta/sea-salt material pairings, vertical framing | Strict **Sacred Gameplay Clear-Zone** framing with unmistakable architectural silhouettes behind the board & vertical composition tuned for `390x844` portrait and `844x390` landscape |
| **The Room** (Fireproof Games) | Tactile horological bevels, dark patina in recessed crevices, tight specular pools on oiled mahogany and brushed brass | `HorologyCADKit.ts` involute extruded gear teeth with chamfers, thermally-blued screws, ruby bearings, and paired procedural normal/roughness wear maps |
| **Control** (Remedy) | Brutalist architectural monumentality, motivated practical fixtures (tungsten lamps vs sodium/fluorescent accents), suspended dust in directional light cones | Volumetric Fresnel-faded theatrical light shafts + calibrated key-to-fill contrast ratios + `1969 Analog Bunker` industrial steel geometry |
| **BioShock** (Rapture) | Heavy riveted Art Deco bronze framing living oceanic Voronoi caustics, wet volcanic stone contrast | `Stage 08: Sunken Bathysphere` — deep riveted bronze porthole bulkheads, wet pooled-roughness basalt deck, dual-layer GLSL caustic shafts & rising bubbles |
| **Dishonored 2** (Clockwork Mansion) | Architecture that *physically transforms* — moving stage parquetry exposing brass pistons and counter-rotating under-floor gears | Embedded flush **Double-Leaf 3D Stage Trapdoor** in every stage floor opening on real damped brass hinges (`0° -> 108°`) into a deep rotating-gear **Clockwork Pit Shaft** |
| **1928 Broadway Palaces** (Palace / Belasco) | Pleated crimson velvet proscenium swags, gilded plaster architraves, scalloped brass Edison shell footlights, scuffed mahogany stage planks | `Stage 01: Vaudeville Palace` — anisotropic scuffed stage planks, warm `2650K` Edison tungsten footlight glow, pleated velvet normal maps, orchestra balcony depth |
| **Swiss Haute Horlogerie** (Geneva Seal) | *Côtes de Genève* machined stripes, rose-gold tourbillon cages, blued steel hands, luminous alabaster/Carrara daylight | `Stage 02: Geneva Conservatory` — veined Carrara marble floor, wrought-iron glass conservatory dome, giant overhead ticking rose-gold & blued-steel tourbillon |
| **Kyoto Urushi & Kintsugi** | Deep mirror-gloss cinnabar/black clearcoat lacquer (`roughness ~0.06`), 24k metallic gold repair seams (`roughness ~0.24`), glowing *washi* shoji reflected in black still water | `Stage 06: Kyoto Lacquer Pavilion` — dual-roughness Urushi + Kintsugi procedural texture pair, animated black-water reflection moat shader, backlit cedar shoji lanterns |
| **1969 Bell Labs / NORAD Consoles** | Olive-slate pebble wrinkle-enamel steel, borosilicate IN-18 orange neon Nixie tubes with fine cathode mesh, twin 10.5" tape reels, P7 green phosphor radar persistence | `Stage 05: Analog Bunker 1969` — live animated Nixie banks, asymmetrical spinning/seeking magnetic tape reels, curved GLSL exponential-persistence radar scope |

### Ruthlessly Killed Clichés (Explicitly Banned from v6.0)
1. **KILLED — "Recolored Single-Stage Palette Swap":** Reusing one generic arena geometry or one uniform white-box `RoomEnvironment` across stages and tinting the floor. Every stage has **bespoke 3D architecture**, **bespoke procedural PBR material textures**, **bespoke HDRI PMREM light-box**, **bespoke atmospheric particles**, and **unique kinetic set-pieces**.
2. **KILLED — "AI Cyberpunk Cyan/Magenta Neon Void":** Drenching dark empty voids in saturated `#00f5ff` / `#ff00cc` glow strips. Every emissive source in v6.0 is **physically motivated** (Edison filaments, Nixie neon cathodes, backlit shoji washi paper, burning brazier coals, marquis incandescent bulbs, polar Aurora ribbons, underwater refracted sunlight).
3. **KILLED — "Smooth Plastic Untextured Primitives":** Bare `MeshStandardMaterial({ color, roughness: 0.5 })` surfaces. Every primary architectural surface receives a **paired deterministic procedural Albedo + Sobel Tangent-Space Normal + Micro-Roughness Map** with max hardware anisotropy.
4. **KILLED — "Bland Bilateral Hallway Symmetry":** Sterile mirrored pillars left and right. Each stage uses **intentional lived-in theatrical asymmetry** (offset tourbillon balance, skewed shoji tea screen across the moat, ascending calliope pipes stage-left vs marquee arch stage-right, telemetry rack left vs sweeping radar dome right) while protecting the central gameplay zone.
5. **KILLED — "Detached Camera Cut / Floaty Lerp Tweening":** Teleporting or frame-rate-dependent `lerp(0.1)` transitions. Every camera sweep uses physically integrated second-order `SpringDamper3D` kinematics with exact responsive portrait/landscape framing math.

---

## 2. Five Out-of-the-Box 3D Rendering, Lighting & Architectural Ideas (Evaluated & Synthesized)

### Idea 1: Per-Stage Virtual HDRI Studio Light-Boxes (`PMREMGenerator` Venue IBL)
- **Concept:** Instead of calling Three.js's single stock `RoomEnvironment`, `StageWebGL2Engine.ts` constructs a lightweight, stage-bespoke virtual HDR studio room for each of the 10 `StageWorldIdV6` venues and bakes it via `THREE.PMREMGenerator.fromScene(hdriScene, 0.035)` (cached per `stageId`).
- **Why It Transforms PBR Realism:** Metals (`metalness: 0.85–0.96`) and clearcoat surfaces (Urushi lacquer, polished Nero marble, optical crystal hexes) derive 80–90% of their perceived luxury from environment reflections. Baking warm scalloped footlight bands + dark crimson velvet absorbers for Stage 01 vs. crisp zenith skylight arches for Stage 02 vs. emerald/violet polar sky ribbons for Stage 09 makes the *exact same brass gear* feel physically teleported into that room.
- **Critique & Hardening:** A uniformly bright light-box kills specular punch; an all-dark box turns chrome black. We enforce a **high-contrast lighting ratio** (HDR emissive strips at luminance `2.8–6.0` separated by matte architectural shadow baffles at `0.02–0.10`) plus a subtly tinted floor bounce card so underside bevels catch authentic ground color.
- **Verdict:** **ADOPTED** (Core Pillar of `StageWebGL2Engine.ts`).

### Idea 2: Deterministic Procedural Heightfield-to-Sobel-Normal & Micro-Roughness PBR Factory
- **Concept:** Generate 512×512 seamless procedural PBR texture triads (`map`, tangent-space `normalMap` via 3×3 Sobel derivative on a synthetic heightfield, and `roughnessMap`) inside `HorologyCADKit.ts` with zero external network dependencies and strict GPU cache/disposal discipline.
- **12 Bespoke Architectural Material Recipes:**
  1. `MAHOGANY_STAGE_PLANKS` (staggered boards, dark bevel seams, wood grain fibers, scuffed glossy traffic lanes)
  2. `CARRARA_MARBLE` (white/cool-ivory mineral base, domain-warped gray calcite veins, matte micro-fissures)
  3. `NERO_GOLD_MARBLE` (deep obsidian-charcoal stone, crisp fractured 24k gold mineral veining with lower metallic-like sheen)
  4. `EMERALD_CASINO_FELT` (fine baize twill micro-normal, high matte roughness `0.86–0.94`, soft radial table patina)
  5. `AGED_TEAK_DECK` (caulked pitch seams, warm weathered honey-brown grain, subtle salt-spray wear)
  6. `WRINKLE_OLIVE_STEEL` (1969 Bell Labs stippled wrinkle-enamel normal map, satin olive-slate reflectance)
  7. `URUSHI_KINTSUGI_LACQUER` (mirror-black & cinnabar vermilion urushi panels fractured with luminous metallic-gold kintsugi rivers)
  8. `HAMMERED_COPPER` (Voronoi peen-hammer dimple heightfield yielding rich specular facets + optional verdigris crevice tint)
  9. `WET_VOLCANIC_BASALT` (porous volcanic pits + glossy moisture puddles in the roughness channel)
  10. `PLEATED_CRIMSON_VELVET` (vertical drapery flute normals + deep velvet fold darkening)
  11. `COTES_DE_GENEVE_BRASS` (machined circular horology striping for watch bridges, gears, and bezels)
  12. `BRAIDED_CLOTH_WIRE` (diagonal textile braid normal & two-tone thread albedo for defusal cables and switchboards)
- **Critique & Hardening:** Naive random noise looks muddy at 3× Retina DPR. Every recipe layers crisp architectural geometry (plank seams, Voronoi hammer cells, twill stripes, gold fractures) over smooth fBM harmonics and enables hardware anisotropic filtering (`maxAnisotropy`) on floor/apron meshes.
- **Verdict:** **ADOPTED** (Core Pillar of `HorologyCADKit.ts`).

### Idea 3: Five Surgical Mobile-60FPS Custom GLSL Atmospheric Shaders
- **Concept:** Pair handcrafted 3D architectural geometry with five lightweight, analytic GLSL shaders that give specific stages unmistakable visual signatures impossible with standard `MeshStandardMaterial`:
  1. **Volumetric Light Shaft Cones (`GodRayShader`)**: View-angle Fresnel edge falloff + subtle upward-drifting micro-dust modulation (Vaudeville footlight beams, Geneva alpine sunbeams, Bathysphere oceanic shafts).
  2. **Abyssal Voronoi Underwater Caustics (`CausticsShader`)**: Dual-frequency trigonometric interference lattice projecting shimmering turquoise caustic webs onto the wet basalt deck and glass portholes in Stage 08.
  3. **Live Multi-Ribbon Aurora Borealis Sky Dome (`AuroraSkyShader`)**: Starfield zenith + three undulating curtains of emerald, polar cyan, and amethyst-gold aurora light visible through the split hammered-copper telescope dome of Stage 09.
  4. **Kyoto Dark-Water Lantern Reflection Moat (`ReflectionMoatShader`)**: Subtle concentric water ripples around the lacquer pavilion carrying warm vertical reflections of glowing amber shoji lanterns and vermilion eaves in Stage 06.
  5. **Living Brazier Fire & P7 Phosphor Sweep Radar (`FlameShader` & `PhosphorRadarShader`)**: Organic turbulent flame tongues inside Stage 10's bronze braziers (synchronized with dynamic firelight intensity/color jitter) and an authentic exponential-decay rotating radar sweep + phosphor blips inside Stage 05's 1969 Analog Bunker.
- **Critique & Hardening:** Full volumetric raymarching destroys mobile GPUs at `ULTRA_3X` DPR. Every shader uses closed-form analytic math (zero raymarch loops, `AdditiveBlending` / alpha-blended depthWrite=false where appropriate) targeting `< 0.4ms` GPU fragment cost.
- **Verdict:** **ADOPTED** (Core Pillar of `StageWorldArchitecturesV6.ts`).

### Idea 4: Embedded Physical 3D Stage Trapdoor + Clockwork Pit Shaft + Sacred Clear-Zone Framing
- **Concept:** Rather than treating the Stage Trapdoor Gambit as a 2D popup overlay, every single Stage World embeds a **flush, stage-themed Double-Leaf Mechanical Trapdoor** centered at `(0, 0.005, 0)` with solid brass hinges, bolted edge coaming, yellow/black under-leaf hazard plates, and an illuminated **7.5m deep Clockwork Pit Shaft** directly beneath the stage floor lined with counter-rotating involute brass gears, steel ladder ribs, and crimson warning beacons.
- When `CameraDirectorV6` receives `TRAPDOOR_PIT_PLUNGE`, the double leaves snap downward (`0° -> 108°` with mechanical spring bounce) while the camera crane accelerates smoothly through the opening straight down into the spinning horological pit!
- Meanwhile, all 10 stage sets obey a strict **Sacred Gameplay Clear-Zone** (`r < 3.5m`, `Y: 0.0 -> 3.6m`) so zero architectural props ever occlude the 100 playing boards, 3D relief globe, or close-up question toys across `390×844` portrait or `844×390` landscape viewports.
- **Critique & Hardening:** A transparent hole in a solid floor mesh needs clean geometry rather than brittle CSG booleans. We build every stage floor with a **4-slab apron ring around a precise `2.3m × 1.8m` central trapdoor cutout** covered seamlessly by the closed double leaves during normal play—zero z-fighting, real physical depth beneath!
- **Verdict:** **ADOPTED** (Core Pillar of `StageWorldArchitecturesV6.ts` + `CameraDirectorV6.ts`).

### Idea 5: Shared Horological CAD Kit & Second-Order Spring-Damper Kinematics
- **Concept:** Empower the entire v6 swarm (`Boards`, `Toys`, `Trophies`, `Prop Trunk`) with a precision procedural CAD library (`HorologyCADKit.ts`) and spring-physics engine (`SpringDamper3D`, `GpuSparkBurst`):
  - **`createInvoluteBrassGear`**: True involute-approximated gear teeth via `THREE.Shape` + beveled `ExtrudeGeometry`, spoked cutouts, collared hub, thermally-blued bolts, optional synthetic ruby bearing.
  - **`createBeveledCrystalHex`**: Faceted optical crystal / obsidian / marble hex tile with clearcoat bevels, brass socket trim, and optional chain lug rings.
  - **`createBraidedClothWire`**: `TubeGeometry` along `CatmullRomCurve3` with braided cloth normal/albedo maps, crimped brass terminals, and live snip-split geometry capability.
  - **`createNixieTubeDisplay`**: Borosilicate glass dome, metallic exhaust tip, cathode wire-mesh cage, ceramic pins, bakelite base, and live-updatable glowing orange neon digit canvas (`setValue(text)`).
  - **`createSculptedTrophyMesh` & `createCastMedalMesh`**: Lathe-turned architectural chalices/columns/crowns/globes across all 5 `HonorAwardDefinitionV6['materialTier']` finishes + knurled cloisonné cast medals with silk grosgrain ribbons.
  - **`createRelicArtifactMesh`**: Dedicated multi-part 3D PBR builds for all 12 `RelicDefinitionV6['meshArchetype']` relics (`VACUUM_TUBE` through `CROWN_SEAL`).
  - **`SpringDamper3D` & `GpuSparkBurst`**: Frame-rate-independent sub-stepped spring kinematics + gravity-and-floor-bounce ember spark bursts with blackbody heat-color cooling.
- **Critique & Hardening:** Heavy `ExtrudeGeometry` curve segments per gear can inflate triangle counts if misused by board builders creating 20+ gears. We expose explicit `detail` / `bevelSegments` controls with smart mobile-friendly defaults (~600–1,400 tris per hero gear) so scenes stay razor-crisp and lightweight.
- **Verdict:** **ADOPTED** (Core Pillar of `HorologyCADKit.ts`).

---

## 3. Ten Radically Distinct Stage World Architectural Blueprints

| # | `StageWorldIdV6` | Floor & Primary Material | Iconic Background Architecture & Kinetic Set-Pieces | HDRI / Lighting Mood | Particle System |
|---|---|---|---|---|---|
| 01 | `STAGE_01_VAUDEVILLE_PALACE` | Scuffed 1928 Broadway mahogany planks | Gilded proscenium arch, pleated crimson velvet curtains with gold tie-backs, scalloped Edison footlight shells, balcony rail silhouettes | Warm `2700K` tungsten key + ruby velvet bounce + golden light cones | `GOLDEN_DUST` |
| 02 | `STAGE_02_GENEVA_CONSERVATORY` | White Carrara veined marble compass inlay | Wrought-iron & glass barrel-vault conservatory dome, **giant ticking rose-gold & blued-steel overhead tourbillon**, brass barometer pillars | Crisp Swiss alpine daylight (`5600K`) + rose-gold rim + sunbeam shafts | `SUNBEAM_POLLEN` |
| 03 | `STAGE_03_MONTE_CARLO_SALON` | Emerald billiard felt + burled walnut rails | Arched Riviera salon mirrors, brass chip gutters, **tiered crystal & brass refracting chandelier**, twilight Mediterranean arched windows | Warm champagne chandelier key + Riviera twilight sapphire rim | `CHAMPAGNE_SPARKLE` |
| 04 | `STAGE_04_CARTOGRAPHIC_ROTUNDA` | Caulked aged teak ship-deck + compass inlay | **Towering verdigris-copper astrolabe meridian arches**, slowly rotating brass ecliptic ring, **swaying gimbaled ship lanterns**, flanking sapphire globes | Warm swaying amber lantern key + oceanic teal verdigris rim | `COMPASS_FIREFLIES` |
| 05 | `STAGE_05_ANALOG_BUNKER_1969` | Olive wrinkle-steel grating + bolted floor plates | Angled 1969 Bell Labs telemetry racks, **live ticking orange Nixie banks**, **twin asymmetric spinning 10.5" tape reels**, **curved GLSL green-phosphor radar dome** | Cool industrial overhead tungsten + orange Nixie & green phosphor bounce | `OSCILLOSCOPE_STATIC` |
| 06 | `STAGE_06_KYOTO_LACQUER_PAVILION` | Mirror black & vermilion Urushi + **24k gold Kintsugi seams** | Sculpted vermilion timber eaves, **dark animated water reflection moat**, warm glowing cedar/washi **Shoji lantern screens** over water | Moonlit indigo zenith + warm honey-amber shoji bounce + crimson specular | `LANTERN_EMBERS` |
| 07 | `STAGE_07_CARNIVAL_CURIOSITIES` | Damp midnight pier timber planks | Asymmetric **hammered-copper steam calliope pipe ranks**, **chasing ruby & turquoise vintage marquee bulb arches**, carnival brass flywheel | Deep coastal midnight teal mist + warm ruby/amber/turquoise marquee glow | `COASTAL_MIST_BULBS` |
| 08 | `STAGE_08_SUNKEN_BATHYSPHERE` | Wet porous volcanic basalt with puddles | Heavy **riveted cast-bronze submarine bulkheads**, deep circular **abyssal glass portholes**, brass depth-gauge manifolds, **GLSL Voronoi water caustics** | Shimmering turquoise overhead ocean caustic shafts + bronze interior warmth | `ABYSSAL_CAUSTIC_BUBBLES` |
| 09 | `STAGE_09_ASTRAL_OBSERVATORY` | Veined white alabaster + brass meridian ring | **Split open hammered-copper telescope dome** with riveted shutters, flanking **rainbow optical glass prisms**, **live GLSL Aurora Borealis & starfield sky** | Cool starlight alabaster key + undulating emerald/violet aurora sky IBL | `AURORA_STARDUST` |
| 10 | `STAGE_10_SOVEREIGN_COLOSSEUM` | Veined Nero Marquina black-and-gold marble | **Towering fluted black-marble & 24k gold-capital amphitheatre columns**, **4 live GLSL flickering bronze fire braziers**, grand 24k gold championship altar arch | Dramatic flickering firelight orange + monumental gilded crown overhead key | `COLOSSEUM_FIRE_SPARKS` |

---

## 4. Camera Framing & Responsive Safe-Window Mathematics (`CameraDirectorV6`)

To guarantee **zero clipping** and **zero HUD occlusion** on both mobile portrait (`390×844`, `360×560`) and mobile landscape (`844×390`, `660×340`) as well as desktop ultrawide:
- Every one of the 8 `CameraStageZoneV6` presets defines base `position`, `lookAt`, `fov`, plus a responsive `aspectAdaptation` curve that pulls dolly distance back and smoothly widens vertical FOV when `aspect < 0.85` (portrait) so a `5.0m`-wide board contraption fits comfortably inside `86%` of horizontal screen width while clearing top HUD (`14%`) and bottom thumb dock (`18%`).
- `CameraMotionModeV6` controls kinetic expression:
  - `CINEMATIC`: organic dual-frequency breathing crane sway + pointer parallax + impact recoil shakes.
  - `SUBTLE`: 35% amplitude drift, damped gentle settles.
  - `REDUCED`: zero idle sway, zero camera shake, snappy critically-damped transitions.

---

## 5. Verification Plan

1. Zero-error strict TypeScript build (`npx.cmd tsc --noEmit`).
2. Standalone hardware-accelerated WebGL2 GPU verification harness (`tests` / scratch HTML via Vite dev server rendered in real GPU-enabled Chromium/Edge — **NEVER** `--disable-gpu`) showcasing multi-stage visual verification screenshots proving radically distinct architecture, PBR materials, reflections, custom GLSL shaders (Aurora, Water Caustics, Fire Braziers, Urushi Moat, Phosphor Radar), Horology CAD Kit showcase (Involute Gears, Nixie Tubes, Crystal Hexes, Braided Wires, Sculpted Trophies, Cast Medals, Relics), and the physical Open Stage Trapdoor Clockwork Pit Plunge!
