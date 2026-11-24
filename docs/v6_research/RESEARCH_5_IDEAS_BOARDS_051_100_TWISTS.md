# World's Smartest v6.0 — Deep Research & 7-Idea Twist Architecture Matrix
**Scope:** Boards `051–100` (Families VI–X), `BoardContraptionRendererB`, Live Mid-Match `BoardTwistDirectorV6` (All `16` `BoardTwistMutationIdV6` Mutations + Foil Trick Card Counter-Plays), and `UnifiedBoardManagerV6`.

---

## 1. Design North Star: Why Trivia Boards Feel Flat—and How Masterwork Games Break the Mold

Most trivia games treat "the board" as a glorified menu: a static 4×3 grid of text rectangles where picking tile `(2,1)` just changes a color. Even when they add "modifiers," they fall into the **Spreadsheet Trap** (`"+15% Science Points"`, `"Double Score Round"`), which never changes *how the player thinks, reads the 3D stage, or outplays a rival*.

To make Boards `051–100` feel **100× beyond a static mockup** and deliver unforgettable "did you just see what the stage did?!" moments, we studied six landmark rule-mutating games and television formats:

| Reference Masterwork | Core Mechanical Lesson Extracted | Direct Translation to World's Smartest v6.0 |
| :--- | :--- | :--- |
| ***Inscryption*** (Daniel Mullins) | **Physical rule rewrites & consumable counter-play.** Bosses physically swap masks and alter board topology (e.g., the Prospector turning cards to gold, the conveyor belt sliding pieces every turn), while tabletop items (Scissors, Pliers, Hourglass) let players bend the rules back. | **Living Contraption Kinetics + Foil Trick Cards:** Conveyor crates physically advance toward a smelter every turn; Ferris Wheel gondolas rotate into the active loading dock; Foil Cards (`FREEZE_NODE`, `SHATTER_CHAINS`, `ROTATE_RING_FREE`, `REVEAL_MOLE`) act as high-agency tactile rule-breakers. |
| ***Balatro*** (LocalThunk) | **Boss Blinds change decision geometry, never raw HP.** *The Eye*, *The Hook*, *Cerulean Bell*, and *The Flint* never just say "+20% difficulty"—they force a fresh tactical puzzle on the exact same deck, triggering massive `+Chips × Mult` adrenaline when overcome. | **Halftime Stage-Siren Mutations (`BoardTwistDirectorV6`):** All `16` `BoardTwistMutationIdV6` mutations reshape spatial routing, visibility, decay timers, or link topology—never passive "+10% score" filler. |
| ***Mario Party*** (Halftime & Dynamic Boards) | **Telegraphed board-state phase shifts.** Day/Night flips (*Faire Square*), rising peak costs (*Pagoda Peak*), and Last-5-Turns events create electric swing potential while remaining 100% readable in 3D space. | **Halftime Siren Shakeups & Tidal Floods:** Turn `ceil(maxTurns/2)` fires a horological brass siren (`twist_siren_chime`), morphing the 3D board (rising floodwater planes submerging outer rings, golden bounties descending on crane hooks, or gravity inverting the pyramid). |
| ***Takeshi's Castle*** | **Kinetic readability & physical "tells."** On *Skipping Stones*, a keen viewer spots the slight buoyancy wobble of a fake stone before stepping. The comedy and tension come from **readable physicality**, never unfair RNG. | **Physical 3D Tells on Sabotage Nodes:** `DOUBLE_AGENT_MOLE` tiles masquerade as high-value gems, but display a real 3D mechanical micro-wobble (`sin(t*13)` axial shiver) and brass screw-glint so eagle-eyed players can read the bluff without needing a card! |
| ***Taskmaster*** | **Lateral rule subversion & hidden studio twists.** Secret tasks under the table, sabotage roles, and live auctions turn straightforward trivia/challenges into theatrical mind games. | **Family X (`RULE_BENDER_TWISTS`) + `HOST_BLIND_AUCTION`:** Frankie's Rigged Auction House drops a physical velvet cloche over contested nodes; players secretly bid Chips or bait the rival into overpaying for a chained trap. |
| ***Golden Balls*** (*Split or Steal*) | **Asymmetric Prisoner's Dilemma climax.** Two contestants hold identical golden spheres containing `SPLIT` or `STEAL`, reading tells before the simultaneous reveal. | **`SPLIT_OR_STEAL_VAULT` (Board 93 & Twist Mutation):** Climax vault locks both sides into a dramatic 3D twin-sphere commitment (`SPLIT/SPLIT` = shared vault jackpot + `×1.5 Mult`, `STEAL/SPLIT` = full loot hijack, `STEAL/STEAL` = vault implosion & Trapdoor Hazard!). |

---

## 2. The Graveyard of Killed Boring Modifiers (Anti-Tunnel-Vision Purge)

Every candidate twist went through a ruthless kill-gate. Anything that failed the **"Can you SEE it in 3D and FEEL it change your next tap?"** test was killed immediately:

| Killed Cliché / Boring Idea | Why It Was Killed | What Replaced It |
| :--- | :--- | :--- |
| `"+10% Score on History Tiles"` | Pure spreadsheet arithmetic; invisible on the 3D stage; zero tactical change. | **`HIGH_VOLTAGE_CHAIN` & `RICOCHET_LASER_BONUS`:** Visible copper plasma arcs & ruby beam bounces that link distant tiles into 3D geometric combos. |
| `"Fog of War = Flat Gray Square"` | Looks like an unfinished spreadsheet; zero tactile curiosity or skill expression. | **`BLACKOUT_SPOTLIGHT`:** Studio house lights actually dim; player sweeps a volumetric 3D golden Fresnel spotlight cone across dark brass tiles to scout categories before locking in! |
| `"Random 20% Chance Tile Explodes"` | Unfair un-telegraphed RNG makes players feel cheated, not clever. | **`CHAIN_FUSE_DETONATION` & `DOUBLE_AGENT_MOLE`:** Every bomb has a visible 3D burning spark fuse ticking down (`2 -> 1 -> BOOM`), and every Mole has a subtle physical wobble tell + `REVEAL_MOLE` Foil counter. |
| `"Recolored 4×3 Grid with New Background"` | Violates the user's mandate that every contraption and stage feel genuinely distinct. | **10 Distinct 3D Structural Topologies in `BoardContraptionRendererB`:** 4-3-2-1 Stepped Gold Pyramids, animated Conveyor Belts with smelters, vertical rotating Ferris Wheel gondolas, moving Tin-Duck Galleries, 3-axis Armillary Meridian Rings, Quantum Entangled Orb Pairs, and Inverted-Gravity Escher Pyramids! |
| `"Rival Simply Gets +250 Bonus Points"` | Feels like rubber-banding AI cheating with zero counter-play. | **Interactive Rival Sabotage & Counter-Play:** Rival activates `RIVAL_FOG_JAMMER`, `SCREW_RIVAL`, or steals an auction—and the player can shatter it live with `SHATTER_CHAINS`, `FREEZE_NODE`, or `STEAL_RIVAL_POT`. |

---

## 3. Seven Out-of-the-Box Board Twist Systems (Architectural Blueprint)

### Idea 1 — **Kinetic Conveyor, Ferris & Flood Drift ("The Living Machine")**
- **Boards:** *Factory Conveyor Belt* (52), *Skyscraper Express Elevators* (53), *Carousel Ferris Wheel* (71), *Penny-Arcade Tin-Duck Gallery* (72), *Shrinking Flood Island* (94).
- **Twist Mutations:** `RISING_FLOOD_STAGE`, `OVERCLOCK_DOUBLE_SPEED`.
- **How It Plays:** The board does not sit still between turns. On Conveyor boards, crates advance `1` notch per turn (`2` notches under `OVERCLOCK_DOUBLE_SPEED`) toward a molten Foundry Crucible; grabbing a crate right before the smelter awards a **Last-Second Salvage `×1.5` Mult**. On Ferris Wheel / Elevator boards, only gondolas aligned in the lit **Boarding Zone** are unlocked—unless you burn `ROTATE_RING_FREE` to crank the wheel `90°` on demand! Under `RISING_FLOOD_STAGE`, an animated translucent caustic water plane rises every 2 turns, submerging outer-ring nodes into high-stakes sunken tiles while concentrating payouts at the dry summit.

### Idea 2 — **Diegetic Volumetric Blackout & Physical Tell Espionage ("The Heist Stage")**
- **Boards:** *The Blackout Spotlight Heist* (91), *Double-Agent Mole Board* (92), *Hall of Trick Mirrors* (75), *Fortune-Teller Automaton* (78).
- **Twist Mutations:** `BLACKOUT_SPOTLIGHT`, `DOUBLE_AGENT_MOLE`, `RIVAL_FOG_JAMMER`.
- **How It Plays:** In `BLACKOUT_SPOTLIGHT`, overhead studio beams cut to moody sapphire twilight and a crisp 3D spotlight rig illuminates only nodes inside the player's movable cone (`spotTarget` controllable via pointer/click). Nodes outside the cone can't be read until swept! In `DOUBLE_AGENT_MOLE`, two tempting high-chip nodes are covert rival plants: claiming one without disarming hands the payout to the rival and snaps a chain onto your neighbor. **Skill Expression:** Mole gems exhibit a subtle 3D high-frequency micro-tremor and brass-pin glint (`tellIntensity`), rewarding sharp eyes—or instant unmasking via the `REVEAL_MOLE` Foil Card (turning the Mole into a `+300` Counter-Intel Bounty!).

### Idea 3 — **Quantum Entanglement & Harmonic Resonance Coupling ("Non-Local Rube Goldberg")**
- **Boards:** *Grand Pipe Organ Resonance* (54), *Aurora Constellation Loom* (81), *Binary Eclipse Twin-Orbits* (82), *Prism Wavelength Fan* (86), *Quantum Entangled Pairs* (88), *Mirror-Twin Sabotage* (97).
- **Twist Mutations:** `MIRROR_TWIN_LINK`, `HIGH_VOLTAGE_CHAIN`, `RICOCHET_LASER_BONUS`.
- **How It Plays:** Pairs of non-adjacent 3D nodes share a glowing crystalline harmonic conduit (visible curved `CatmullRomCurve3` energy filaments). Claiming Node `A` instantaneously flips or supercharges its twin `A'` (`MIRROR_TWIN_LINK`)—even stealing `A'` away from a rival if `A'` isn't shielded by `FREEZE_NODE`! Under `HIGH_VOLTAGE_CHAIN`, owning 3+ connected nodes turns the entire conductive cluster into a live Tesla arc yielding `+0.75 Mult` per chained link.

### Idea 4 — **High-Drama Game-Show Bluffing ("Blind Auction Cloche & Split-or-Steal Vault")**
- **Boards:** *Split-or-Steal Final Vault* (93), *Frankie's Rigged Auction House* (98), *Silk-Road Caravan Oasis* (67), *Sovereign Colosseum Chariot Track* (60).
- **Twist Mutations:** `HOST_BLIND_AUCTION`, `SPLIT_OR_STEAL_VAULT`, `GOLDEN_BOUNTY_HUNT`.
- **How It Plays:** `HOST_BLIND_AUCTION` drops a velvet-draped brass auction cloche on a mystery high-value node; player commits a Chip bid (`0`, `150`, `300`, `500`) against the rival's hidden valuation—winning grants a `×2` Vault Node, while strategically bidding `0` lets the rival waste bankroll on a fused decoy. `SPLIT_OR_STEAL_VAULT` triggers on the final apex vault: players choose `SPLIT` or `STEAL` against a personality-modeled rival bluff profile (Frankie bluffs aggressively when trailing; Julian splits when ahead; Sloane calculates expected value).

### Idea 5 — **Inverted Gravity, Magnetic Polarity & Chain-Fuse Escalation ("Physics Under Fire")**
- **Boards:** *Stepped Gold Pyramid* (51), *Inverted-Gravity Escher Pyramid* (95), *Ticking Fuse Chain-Bomb* (96), *Magnetic Repulsor Puck* (99), *Supernova Core* (90), *The 100th Board: Sovereign Mind Reactor* (100).
- **Twist Mutations:** `GRAVITY_INVERSION`, `CHAIN_FUSE_DETONATION`, `MAGNETIC_REPULSOR`, `SUDDEN_TRAPDOOR_HAZARD`.
- **How It Plays:**
  - **`GRAVITY_INVERSION`:** Physically rotates the 3D board contraption upside-down (`180°` spring interpolation around the Z-axis) and inverts tier payouts—what used to be easy base-row nodes become suspended Apex Vaults while the old apex drops into the Pit!
  - **`CHAIN_FUSE_DETONATION`:** Sparks travel along a 3D braided fuse cord across 2–3 hot nodes; defusing a fused node on a correct answer awards a `+250` Bomb-Squad Bonus & breaks an adjacent lock, whereas ignoring it until `fuseTurns === 0` detonates a shockwave that adds `+1` iron chain to neighboring nodes.
  - **`MAGNETIC_REPULSOR`:** Places a spinning copper/cobalt electromagnet at board center—each claim fires a polarity pulse that slides unclaimed bonus chips outward to rim nodes and pushes back rival territory influence.
  - **`SUDDEN_TRAPDOOR_HAZARD`:** Marks 2 volatile tiles with brass hazard chevrons; answering correctly earns a **Daredevil `+1.0 Mult`**, while missing drops straight into `StageTrapdoorGambitV6` with double rescue stakes!

### Idea 6 — **Decay Pressure & Halftime Director Choreography ("No Dead Turns")**
- **Twist Mutations:** `CURSED_MULTIPLIER_DECAY`, `GOLDEN_BOUNTY_HUNT`, `OVERCLOCK_DOUBLE_SPEED`.
- **How It Plays:** `CURSED_MULTIPLIER_DECAY` drains `-0.25x` off unclaimed multiplier pedestals every turn (visible golden sand draining from miniature brass hourglasses), rewarding decisive, aggressive routing—while `FREEZE_NODE` locks a jewel pedestal's multiplier at peak value! At halftime (`turn === ceil(maxTurns / 2)`), `BoardTwistDirectorV6` evaluates the match score delta: if it's a blowout or stalemate, it injects an authentic stage-siren halftime mutation tailored to the board's family, keeping every match taut through the final turn.

### Idea 7 — **Zero-Soft-Lock Mathematical Guarantee & Stage-Native PBR Chameleon Materials**
- **Zero-Soft-Lock Guarantee:** Even when stacked twists (`RISING_FLOOD_STAGE` + `BLACKOUT_SPOTLIGHT` + `CHAIN_FUSE_DETONATION` + rival `lockedChains`) tighten the board, `BoardTwistDirectorV6.ensurePlayableNodes()` guarantees at least `2` accessible, non-submerged, unchained (or explicitly breakable) nodes remain playable every turn via an automatic **Emergency Stage Surge** release.
- **Stage-Native Material Adaptation:** `BoardContraptionRendererB` never hardcodes a flat neon look. Every structural beam, bevel, chain, fluid surface, and crystal node consumes `StageAtmosphereThemeV6.materials` (`floorColorHex`, `trimMetalHex`, `stoneOrWoodHex`, `jewelPrimaryHex`, `jewelSecondaryHex`, `trimRoughness`, `trimMetalness`), so the same structural contraption class harmonizes effortlessly with Stage 04's Verdigris Copper & Teak, Stage 06's Kyoto Urushi Lacquer & Kintsugi Gold, Stage 07's Midnight Pier Copper, Stage 08's Volcanic Basalt & Turquoise Caustics, Stage 09's Hammered Copper & Aurora Prisms, and Stage 10's Veined Nero Marble & 24k Gold!

---

## 4. Complete Architectural Mapping: Boards `051–100` (Families VI–X)

- **Family VI — `MONUMENT_INDUSTRIAL` (Boards `51–60`, Stages `10 / 05 / 06`):**
  51. *Stepped Gold Pyramid* · 52. *Factory Conveyor Belt* · 53. *Skyscraper Express Elevators* · 54. *Grand Pipe Organ Resonance* · 55. *Locomotive Switchyard* · 56. *Suspension Bridge Cables* · 57. *Hydro Spillway Gates* · 58. *Clocktower Scaffolding* · 59. *Foundry Crucible* · 60. *Sovereign Colosseum Chariot Track*
- **Family VII — `CARTOGRAPHY_EXPEDITION` (Boards `61–70`, Stage `04`):**
  61. *Armillary Meridian Rings* · 62. *Trade-Wind Galleon Route* · 63. *Archipelago Lighthouse Chain* · 64. *Transcontinental Rail Spike* · 65. *Polar Icebreaker Channels* · 66. *Sunken Treasure Grid* · 67. *Silk-Road Caravan Oasis* · 68. *Canyon Rope-Bridge* · 69. *Sextant Star-Fix* · 70. *Lost City Ziggurat*
- **Family VIII — `CARNIVAL_ARCADE` (Boards `71–80`, Stage `07`):**
  71. *Carousel Ferris Wheel* · 72. *Penny-Arcade Tin-Duck Gallery* · 73. *Calliope Steam Valves* · 74. *High-Striker Strongman Bell* · 75. *Hall of Trick Mirrors* · 76. *Claw-Machine Prize Pit* · 77. *Tilt-a-Whirl Cups* · 78. *Fortune-Teller Automaton* · 79. *Ring-Toss Bottleneck* · 80. *Roller-Coaster Loop*
- **Family IX — `ASTRAL_QUANTUM` (Boards `81–90`, Stages `09 / 08`):**
  81. *Aurora Constellation Loom* · 82. *Binary Eclipse Twin-Orbits* · 83. *Telescope Lens Alignment* · 84. *Tidal Gravity Wells* · 85. *Bathysphere Trench Descent* · 86. *Prism Wavelength Fan* · 87. *Meteor Shower Shield* · 88. *Quantum Entangled Pairs* · 89. *Sundial Shadow Sweep* · 90. *Supernova Core*
- **Family X — `RULE_BENDER_TWISTS` (Boards `91–100`, All Stages / Bosses):**
  91. *The Blackout Spotlight Heist* · 92. *Double-Agent Mole Board* · 93. *Split-or-Steal Final Vault* · 94. *Shrinking Flood Island* · 95. *Inverted-Gravity Escher Pyramid* · 96. *Ticking Fuse Chain-Bomb* · 97. *Mirror-Twin Sabotage* · 98. *Frankie's Rigged Auction House* · 99. *Magnetic Repulsor Puck* · 100. *The 100th Board: Sovereign Mind Reactor*

---

## 5. Clean Integration Contract (`UnifiedBoardManagerV6`)

To guarantee **zero merge conflicts** with `v6-boards-contrapt-a` (`BoardCatalog001To050.ts` & `BoardContraptionRendererA.ts`):
- `UnifiedBoardManagerV6.ts` owns the unified 100-board registry (`1..100`), stage-world filtering, campaign episode recommendation, board runtime hydration, and twist director orchestration.
- It automatically loads `BOARD_CATALOG_051_TO_100` statically and accepts `Boards 001–050` cleanly via **both** synchronous dependency injection (`registerBoards001To050(defs, rendererA)`) AND optional lazy dynamic import (`hydrateBoards001To050Async()`), degrading gracefully with full TypeScript strict safety even when tested standalone before branch merge!
