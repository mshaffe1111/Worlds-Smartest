# World's Smartest v6.0 — Deep Mechanical Contraption Research (Boards 001–050)

**Owner:** `v6-boards-contrapt-a` (Principal 3D Game-Board Contraption Designer — Families I–V)  
**Scope:** Boards `001–050` across `CLOCKWORK_ROTARY`, `TURF_WAR_BRIDGES`, `GRAVITY_PHYSICS`, `CASINO_PUSH_LUCK`, and `STEALTH_OPTICS_RADAR` + `BoardContraptionRendererA.ts` (Pure Three.js WebGL2 PBR).  
**Mandate:** Kill every "recolored 4x3 Jeopardy box grid" cliché. Every board family must behave like a physical museum-grade kinetic tabletop instrument whose mechanics, silhouette, lighting, sound cues, and tactical win conditions could NEVER be reduced to a flat button array.

---

## 0. Anti-Tunnel-Vision Audit: What We Explicitly Kill

Before designing a single node, we outlaw five lazy AI-game-board failure modes:
1. **The Recolored 4x3 Grid Trap:** Changing tile border colors from gold to cyan while keeping identical pick-any-tile rules. *Killed:* Every family uses its own spatial topology (polar gear rings, hex/circuit graphs, inclined Newtonian trajectories, casino table shoes/wheels, optical raycast benches & polar radar scopes).
2. **Passive "Decorative" 3D Geometry:** Spinning gears in the background that have zero effect on which tiles are legal, locked, boosted, or captured. *Killed:* Every visible gear, iron chain, pinball bumper, roulette pocket, blackjack total, laser mirror, and sonar sweep directly drives live `BoardRuntimeStateV6` legality, multipliers, or win conditions.
3. **Static All-Nodes-Equal Pick Economy:** Letting players mindlessly click the highest dollar value every turn. *Killed:* Alignment windows, chain-breaking prerequisites, encirclement flips, gravity cascades, blackjack bust tension, and mirror-bounce routing create real spatial planning 2–3 turns ahead.
4. **Uniform Material Washing:** Using one generic shiny gold shader across all stages. *Killed:* `BoardContraptionRendererA` ingests `StageAtmosphereThemeV6.materials` dynamically—transforming the same mechanical family from Carrara marble & rose-gold in Geneva (`STAGE_02`) to vermilion Urushi lacquer & kintsugi gold in Kyoto (`STAGE_06`), walnut burl & emerald baize in Monte Carlo (`STAGE_03`), or olive wrinkle-steel & glowing Nixie glass in the 1969 Bunker (`STAGE_05`).
5. **Unreadable 3D Clutter on Mobile Screens:** Tiny floating labels or blurry low-res textures. *Killed:* Every board respects a camera-angled tabletop silhouette readable at `390x844` portrait AND `844x390` landscape, with crisp high-DPI procedural `CanvasTexture` brass/enamel plaques and unambiguous hover/selection elevation + emissive rim cues.

---

## 1. Family I — `CLOCKWORK_ROTARY` (Boards 001–010)
**Signature Worlds:** `STAGE_02_GENEVA_CONSERVATORY` & `STAGE_01_VAUDEVILLE_PALACE`  
**Real-World Reference Studies:** Antikythera differential epicycle mechanism, Breguet double-axis tourbillon escapements, 1928 revolving Broadway proscenium stages, Mosler multi-wheel safe fences, Wurlitzer 1015 turntable tonearms, and *The Room* interlocking brass puzzle rings.

### 5+ Researched Mechanical Gameplay Architectures
1. **Concentric Involute Gear Train + Optical Alignment Meridian (`The Grand Clockwork Orrery`, #001):**
   - Three coaxial brass rings (Outer: 8 nodes, Mid: 6 nodes, Inner: 4 nodes) with true extruded involute gear teeth and spokes.
   - Solving a node drives its ring clockwise by one tooth-step (`+45° / +60° / +90°`) and back-drives meshed neighboring rings via gear-ratio counter-rotation.
   - Whenever 3 jewel sockets line up along the fixed 12-o'clock brass meridian emitter, a glowing volumetric ruby/gold beam bridges all three rings for an immediate **`x3` Alignment Multiplier**!
2. **Deadbeat Anchor Escapement Impulse Window (`Geneva Tourbillon Escapement`, #002):**
   - An animated blued-steel anchor pallet rocks left/right every turn.
   - Only nodes rotating through the two active **Impulse Jewel Windows** (`±30°` of North/South) can be unlocked that turn, turning turn order into a rhythmic horological trap where you steer high-value vaults out of your rival's reach.
3. **Revolving Stage Wing-Curtain Occlusion (`Vaudeville Revolving Stage`, #003):**
   - A mahogany revolving stage turns `60°` each round beneath crimson velvet proscenium wings.
   - Nodes spinning backstage into wing shadow are temporarily masked, accruing **`+150` Curtain Anticipation** chips per concealed turn before emerging under the Edison footlights as spotlight headliners!
4. **Triple-Notch Safe Fence Combination (`Safe-Vault Combination Wheel`, #006):**
   - Three brushed-steel tumbler dials carry physical milled U-gates (`0°` target notch). Alternating clockwise/counter-clockwise solves walk each gate beneath a spring-loaded brass fence bar; dropping all three gates cracks the central `$2,500` Bullion Core!
5. **Dual-Ring Eclipse & Epicyclic Syzygy (`Astrolabe Eclipse Rings`, #004 & `Planetary Epicycle`, #009):**
   - Eccentric tilted meridian rings and orbiting planet sub-carriers dynamically change graph adjacency every turn; answering a node at **Syzygy Conjunction** (minimum orbital separation) chains an automatic bonus claim onto its orbiting satellite!
6. **Acoustic Groove Sweep & Carillon Hammer Track (`Vinyl Jukebox Turntable`, #007 & `Midnight Chime Carillon`, #010):**
   - A brass tracking tonearm (or striking bell hammer) advances inward one groove per turn. Claiming a node sitting directly underneath the live stylus head plays a harmonic arpeggio and banks `+0.5x` Resonance Multiplier without spending streak momentum!
7. **Coupled Cuckoo Counter-Pendulums & Gimbal Compass (`Twin Cuckoo Pendulum Gears`, #005 & `Compass Rose Gyroscope`, #008):**
   - Dual meshing side-by-side gear wheels (figure-8 contact tooth) transfer spin across an interlocking center pinion; the Compass Rose tilts along a 3D Cardan gimbal ring so North/South magnetic polarity doubles the chips of whichever hemisphere dips toward the player!

### Selected Architecture Mapping (Boards 001–010)
All 10 boards share the `CONCENTRIC_RINGS` PBR horology base while specializing ring counts, meshing ratios, curtain occlusion, tonearm sweep, twin-gear figure-8 layout, and notch alignment win conditions via rich `ClockworkSpec` metadata.

---

## 2. Family II — `TURF_WAR_BRIDGES` (Boards 011–020)
**Signature Worlds:** `STAGE_01_VAUDEVILLE_PALACE` & `STAGE_06_KYOTO_LACQUER_PAVILION`  
**Real-World Reference Studies:** Piet Hein & John Nash's *Hex*, classic *Go* liberty capture, *TwixT* bridge networks, London/Tokyo subway transfer diagrams, Chartres Gothic rose windows, Venetian canal lock bridges, and differential PCB copper traces.

### 5+ Researched Mechanical Gameplay Architectures
1. **19-Hex Crystal & Obsidian Bridge Span with 3D Iron Chains (`Hexagon Bridge Turf-War`, #011):**
   - Radius-2 beveled crystal/obsidian hexagonal prism lattice (`19` tiles). Central choke-point hexes are physically strapped beneath draped 3D interlocking wrought-iron chain links (`lockedChains: 1..2`).
   - Capturing adjacent hexes shatters iron links into animated flying shards. First contender to connect the **West Brass Pier** to the **East Brass Pier** via contiguous owned hexes claims the Bridge Sovereign bonus (`+1,200` chips + instant win condition!).
2. **Kyoto Urushi Kintsugi Go-Encirclement (`Kyoto Kintsugi Stone Go-Web`, #012):**
   - Mirror-gloss vermilion & black lacquer stone nodes linked by glowing molten-gold kintsugi channels.
   - Surrounding any rival stone (or 2-stone cluster) so all its connected gold fissures terminate on your stones floods the fissure network and **flips the encircled rival tiles** to your banner!
3. **Multi-Line Express Transit Electrification (`Subway Express Takeover`, #013):**
   - Three intersecting illuminated brass rail lines (`LINE A / B / C`) crossing at elevated transfer concourses.
   - Owning both terminal stations of a line plus any transfer hub sends an electric golden surge down the track, adding `+1.0x` Express Multiplier to every station along that corridor!
4. **Polar Stained-Glass Rose Window & Copper Circuit Bus (`Stained-Glass Rose Window`, #014 & `Circuit-Trace Crossfire`, #015):**
   - Radial concentric petals (1 Oculus + 6 Lancets + 12 Trefoils) reward completing a full radial light-ray from rim to center with stained-glass caustic flares; Circuit-Trace Crossfire radiates live copper power from a central capacitor so cutting a rival's upstream bridge browns out their disconnected branch!
5. **Physical Tug-of-War Rope Tension & Canal Lock Floodgates (`Tug-of-War Rope Span`, #016 & `Venetian Canal Bridges`, #017):**
   - Nodes sit along a braided tensioned rope bridge where every correct solve yanks the crimson brass knot marker 1 notch toward your side (bonus `+2x` when pulling from behind!). Venetian Canal Bridges alternate open/closed brass bascule spans across water channels, forcing creative flanking routes.
6. **Diagonal King-Leap, Tiered Battlements & Rhombus Lattice (`Checkers King Leap`, #018, `Siege Battlement`, #019, `Diamond Lattice Duel`, #020):**
   - Diagonal jump adjacency allows leaping *over* a rival-held node to land behind them and siphon `250` chips; Siege Battlements guard a chained Crown Keep behind 2 outer wall rings; Diamond Lattice Duel pits orthogonal vs. diagonal expansion!

---

## 3. Family III — `GRAVITY_PHYSICS` (Boards 021–030)
**Signature Worlds:** `STAGE_07_CARNIVAL_CURIOSITIES` & `STAGE_02_GENEVA_CONSERVATORY`  
**Real-World Reference Studies:** 1950s Gottlieb wood-rail pinball tables, Nagoya brass Pachinko parlors, branching domino topple displays, Swiss brass apothecary balances, Sir Isaac Newton's momentum cradle, and logarithmic coin-vortex funnels.

### 5+ Researched Mechanical Gameplay Architectures
1. **Inclined Chrome Steel Pinball Playfield (`Pinball Bumper Drop`, #021):**
   - Sloped polished pier-wood & copper playfield framed by brass guardrails, 5 glowing pop-bumpers, and lower category collector saucers.
   - Selecting a launch lane or target node fires a mirror-chrome 3D steel sphere under real 2D/3D elastic bounce kinematics—each pop-bumper impact flashes warm amber, plays a mechanical coil pulse, and injects **`+75` Bumper Chips** into the target clue's stake before the ball settles into the saucer!
2. **Rigid-Body Forked Domino Topple Cascade (`Domino Chain Reaction`, #022):**
   - Standing beveled ivory-and-brass 3D dominoes arranged in three forked switchback paths with brass junction splitters.
   - Answering a standing lead domino tips it smoothly (`0° -> 74°`) into the next owned tile; every contiguous chain link multiplies the cascade (`+0.35x` per domino toppled in one continuous run)!
3. **Oscillating Counterweight Pendulum Drawbridge (`Pendulum Drawbridge`, #023):**
   - A heavy machined-brass pendulum swings beneath twin articulated drawbridge spans.
   - The pendulum phase alternates active bridge lock between the Left Bastion, Center Crown, and Right Vault—striking the Center Crown while the pendulum crosses `0°` vertical triggers a **`x2.5` Dead-Center Timing Bonus**!
4. **Two-Pan Apothecary Torque Balance (`Balance-Beam Apothecary Scale`, #025):**
   - Twin brass pans hang from a knife-edge fulcrum beam, holding weighted category ingots (`100g` to `500g`).
   - Claiming a node drops its weight onto the left or right pan, physically tilting the 3D beam (`±26°`). Keeping the scale balanced within `±6°` triggers **Golden Equilibrium (`x2.5`)**, while deliberately overloading the rival's pan tips their unbanked bonus weights off the brass tray!
5. **Pachinko Peg Deflection, Spiral Vortex & Momentum Transfer (`Pachinko Brass Pegboard`, #024; `Marble Vortex Funnel`, #026; `Plinko Multiplier Wall`, #027; `Newton's Cradle Momentum`, #028; `Seesaw Catapult`, #029; `Avalanche Chute`, #030):**
   - Pachinko & Plinko simulate multi-row brass peg deflections with deterministic visual chrome-marble trajectories into multiplier chutes (`x1 / x2 / x3 / JACKPOT`);
   - Marble Vortex Funnel orbits a steel sphere down a parabolic spun-brass hyperbolic funnel where inner-ring nodes spin faster for higher stakes;
   - Newton's Cradle suspends 5 gleaming steel spheres on fine twin filaments—clearing an end sphere swings it out and transfers impulse instantly to the opposite end vault;
   - Seesaw Catapult launches a brass counter-weight token across the board to unlock a distant chained target, while Avalanche Chute drops upper high-value boulders down gravity tracks whenever lower support stones are cleared!

---

## 4. Family IV — `CASINO_PUSH_LUCK` (Boards 031–040)
**Signature Worlds:** `STAGE_03_MONTE_CARLO_SALON`  
**Real-World Reference Studies:** 1962 Casino de Monte-Carlo Chemin de Fer & Blackjack felt tables, Huxley walnut European roulette wheels, classic Minesweeper deduction grids, street Three-Shell Monte sleight-of-hand, high-limit craps tables, and Sotheby's gavel auctions.

### 5+ Researched Mechanical Gameplay Architectures
1. **Blackjack 21 Sum Felt & Trapdoor Bust Tension (`Monte Carlo Blackjack 21 Felt`, #031):**
   - Emerald baize felt inlaid with brass-rimmed card-value medallions (`2, 3, 4, 5, 6, 7, 8, 9, 10, 11`).
   - Every solved node adds its value to the player's active **21 Hand Total**. Hitting **exact `21`** erupts in a golden Riviera chip cascade (**`x4` BLACKJACK JACKPOT** + clean hand reset). Pushing over `21` triggers a red **BUST SHUDDER**, slashes unbanked hand chips, and arms the Stage Trapdoor hazard—forcing thrilling tactical route choices between safe low-pip tiles and risky `10/11` high rollers!
2. **Spinning European Roulette Multiplier Sector (`Roulette Multiplier Wheel`, #032):**
   - A recessed rotating mahogany-and-brass European roulette rotor sits at center table, surrounded by betting-felt sector plaques (`RED`, `BLACK`, `EVEN`, `ODD`, `ZERO 0`).
   - Each turn the rotor decelerates and the ivory ball drops into a live pocket—supercharging every matching sector plaque to **`x2.5`** (or **`x5.0`** on Zero Emerald!) for that round!
3. **Deductive Brass Minesweeper Vaults (`Minesweeper Brass Vaults`, #033):**
   - 16 recessed brushed-brass floor vaults conceal 3 armed Frankie sabotage mines (`hasTrapFuse`).
   - Opening any safe vault stamps its brass lid with an illuminated proximity count (`0..3` mines in 8-neighbor ring). Daring players who solve vaults directly bordering `2+` armed mines collect a **`+1.25x` High-Nerve Sweeper Bonus**!
4. **Spline-Choreographed Three-Shell Monte Bluff (`Three-Shell Monte Bluff`, #034):**
   - Three lathe-turned burnished brass cups sit on plush emerald velvet alongside 9 betting plaques.
   - At turn start, the cups lift briefly to reveal the **Emerald Jackpot Pearl (`x3`)**, **Silver Coin (`x1.5`)**, and **Rival Decoy (`MOLE`)**, then execute crisp multi-step Bezier figure-8 swaps across the felt. Selecting the true pearl cup locks `x3` onto your chosen category clue!
5. **Craps Dice Point, Poker 5-Card River, Blind Auction & Bank-or-Bust (`High-Roller Craps Arena`, #035; `Baccarat Sabotage Shoe`, #036; `Host's Blind Auction Gavel`, #037; `Poker 5-Card River`, #038; `Bank-or-Bust Ladder`, #039; `Velvet VIP High-Limit Table`, #040):**
   - Craps Arena tumbles twin 3D ivory-and-brass dice to establish the active Point (`4..10`), lighting matching odds bays;
   - Poker 5-Card River stamps every board node with a playing-card rank & suit (`A♠`, `K♠`, `Q♥`...) so your 5 claimed tiles assemble real poker hands (Flush `+750`, Straight `+900`, Full House `+1,500`!);
   - Host's Blind Auction Gavel features a strikeable walnut gavel block where bidding banked chips wins exclusive rights to a `x4` Velvet Mystery Vault;
   - Bank-or-Bust Ladder climbs escalating multiplier rungs (`x1.0 -> x1.5 -> x2.2 -> x3.5 -> x5.0`) where each step doubles both reward and rival steal risk!

---

## 5. Family V — `STEALTH_OPTICS_RADAR` (Boards 041–050)
**Signature Worlds:** `STAGE_05_ANALOG_BUNKER_1969` & `STAGE_08_SUNKEN_BATHYSPHERE`  
**Real-World Reference Studies:** *Laser Chess / Khet* optical reflection puzzles, Cold War circular PPI phosphor radar scopes, 1969 Burroughs B-5092 Nixie tubes & Bakelite breaker panels, Trieste deep-sea bathysphere pressure bulkheads, Enigma M4 stepped cipher rotors, and Newton crown-glass dispersion prisms.

### 5+ Researched Mechanical Gameplay Architectures
1. **Interactive 45° Brass Mirror Raycast Optical Bench (`Laser Mirror Vault`, #041):**
   - A 4x4 matte olive-steel optical bench houses a high-energy ruby laser emitter, 6 rotatable 45° chamfered brass mirror turrets, and 10 armored category vault receptors.
   - Clicking a mirror turret rotates its optical normal by `45°` (with tactile brass gear detent!), recomputing the live 3D raycast beam path in real time. Vaults pierced by the reflected laser beam unlock with **`+0.6x` per optical bounce**!
2. **Custom GLSL Phosphor PPI Sonar Sweep (`Submarine Phosphor Sonar Sweep`, #042):**
   - A circular recessed oscilloscope screen rendered with a custom GLSL `ShaderMaterial` sweeps a glowing P1 emerald-phosphor beam (`360° / 6s`) with realistic exponential afterglow persistence, concentric range rings, and bearing ticks.
   - Submarine category contacts ping brightly as the sweep arm passes over them; claiming a node within its active **Phosphor Peak Window** triggers a **`x2.5` Acoustic Lock**!
3. **1969 Nixie Tube Busbar Breaker Matrix (`1969 Nixie Breaker Matrix`, #043):**
   - Warm-glowing blown-glass Nixie numerals sit atop heavy Bakelite throw-breakers wired along horizontal & vertical copper power rails.
   - Closing breakers routes high-voltage cathode current into locked high-tier relays while forcing players to bypass glowing redline overload fuses!
4. **Sequential Deep-Sea Pressure Airlocks (`Bathysphere Pressure Airlocks`, #044):**
   - Riveted bronze porthole nodes layered in concentric pressure tiers (`100m`, `500m`, `1500m`, `4000m Abyss`) over undulating turquoise water caustics.
   - Adjacent airlock handwheels spin smoothly (`720°`) to equalize hull pressure before deep-trench vaults can be cracked without suffering a Hull Breach penalty!
5. **Optical Dispersion, Enigma Rotors, Periscope & Stealth Scanners (`Enigma Cipher Rotors`, #045; `Periscope Torpedo Grid`, #046; `Prism Rainbow Splitter`, #047; `Searchlight Heist Yard`, #048; `X-Ray Baggage Scanner`, #049; `Triangulation Relay`, #050):**
   - Prism Rainbow Splitter fires white tungsten beam into a rotatable 3D crystal prism, refracting separate **Ruby (`x2`), Emerald (`x2`), and Sapphire (`x2`)** spectral rays onto matching domain vaults;
   - Enigma Cipher Rotors step 3 coaxial brass letter drums on every solve to unmask encrypted high-value slots;
   - Searchlight Heist Yard sweeps dual volumetric spotlights across darkened heist crates—only illuminated nodes show their true multiplier until scanned;
   - X-Ray Baggage Scanner glides concealed luggage cases beneath a cyan fluoroscope arch revealing hidden golden contraband bonuses inside, while Triangulation Relay demands claiming 3 perimeter radar dishes to lock intersecting bearing lines onto a central `$2,000` Signal Core!

---

## 6. Unified Technical Architecture (`BoardCatalog001To050.ts` & `BoardContraptionRendererA.ts`)

1. **Zero-Conflict Data Separation:**
   - `BoardCatalog001To050.ts` exports `BOARD_CATALOG_001_TO_050` (`readonly BoardDefinitionV6[]`, `boardNumber: 1..50`), `BOARD_SPECS_001_TO_050` (per-board topological, mechanical, and physical rules), lookup helpers, and deterministic `createInitialBoardRuntimeStateA(...)` builders using all 12 canonical corpus domains (`0..11`).
   - Zero edits to `src/v6/contracts_v6.ts` or any sibling file.
2. **Pure Three.js WebGL2 PBR Engine (`BoardContraptionRendererA.ts`):**
   - Procedural high-craft PBR textures generated synchronously on offscreen canvases (brushed brass anisotropic streaks, emerald casino baize felt weave, obsidian crystal facets, olive wrinkle-painted bunker steel, etched brass category/value plaques — **zero external URL dependencies, zero blurry SVG text, zero OS emojis**).
   - True 3D procedural geometry: involute extruded gear teeth, chamfered crystal hex prisms with interlocking `TorusGeometry` iron chains that shatter into animated debris, chrome steel pinballs/marbles with elastic trajectory physics, toppling rigid-body dominoes, swinging pendulum drawbridges, tilting brass balance scales, 3D stacked casino chips & rotating European roulette rotor, rotatable 45° laser mirror turrets with live volumetric raycast laser beams, and custom GLSL `ShaderMaterial` phosphor sonar persistence sweep!
   - Full `THREE.Raycaster` interactive hit-testing (`onPointerMove`, `onPointerDown`, `onPointerUp`) with smooth spring-damper hover lift, auxiliary contraption interactions (rotate laser mirror turret, nudge clockwork dial, launch pinball, trigger shell shuffle), and full `applyStageTheme(theme: StageAtmosphereThemeV6)` live PBR world adaptation!
   - Deterministic turn-physics resolver (`resolveContraptionTurnA`) updating `BoardRuntimeStateV6` (ring rotations, laser/alignment bonuses, chain shatters, Go encirclement flips, pinball/domino/balance physics, blackjack 21/bust, roulette sector bonus, sonar resonance lock, and win-condition evaluation) with crisp `FoleySfxIdV6` sound-cue recommendations for the audio engine!
