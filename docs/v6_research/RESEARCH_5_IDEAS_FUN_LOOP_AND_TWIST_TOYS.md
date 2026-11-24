# World's Smartest v6.0 — Deep Research & 5-Idea Matrix: Arcade Fun-Loop, Mind-Game Twist Toys, Trapdoor Survival & Balatro Relic Synergies

**Author:** Principal Arcade Fun-Loop, Mind-Game Twist Toy, Trapdoor Survival & Balatro Relic Designer (`v6-toys-trapdoor-fun`)  
**Scope:** Question Toys `051–100` (Families VI–X), `StageTrapdoorGambitV6` (10 Survival Mini-Games), `PropTrunkRelicEngineV6` (24 Relics + 18 Holographic Foil Cards), and `UnifiedToyManagerV6`  
**Mandate:** Kill the *"THE GAME IS NOT FUN!!!!"* failure mode of v5.0 forever. Zero scrolling (`100dvh` locked, auto Split-Stage in landscape), zero flat 4-button quiz clones, zero AI clichés (`0` `<input type="range">`, `0` `backdrop-filter`, `0` OS color emojis), and **100x more kinetic, mischievous, and tactile than our approved baseline mockups**.

---

## 0. Brutal Post-Mortem: Why v5.0 Felt Like Homework Instead of a Hit Arcade Game

Before designing a single toy, we diagnosed the five exact fun-killers that plagued v5.0:

1. **Single Cognitive Verb Fatigue:** Even with different borders, 80% of prompts boiled down to *"read neutral encyclopedia sentence -> tap 1 of 4 rectangles"*. The player's thumb and brain ran the exact same neural track for 20 minutes.
2. **The Wrong-Answer Dopamine Cliff:** Missing a clue displayed a flat red rejection banner and wiped the streak. Zero recovery drama, zero laugh, zero clutch comeback moment.
3. **Linear Flat Scoring (`+100`, `+100`, `+100`):** Without multiplicative build synergies (`+Chips × Mult`), round 12 felt mathematically identical to round 1. Players had no reason to covet props, hunt combos, or feel like a mischievous genius breaking the show's bank.
4. **Static Numerical Feedback:** Saying `"Off by 18"` in small text creates zero emotion. Watching a carved wooden mountaineer march 18 ticks up a steep brass slope toward an abyss while every step clicks louder creates *unforgettable television tension*.
5. **Vertical Overflow & Unbounded Controls:** Prompt blocks + 4 tall cards forced scrolling on `390x844` and clipped horizontally on `844x390` landscape. Scrolling during a timed trivia show instantaneously destroys flow state.

---

## 1. Deep Reference Deconstruction & The 5+1 Radical Fun-Loop Concepts

### Idea 1 — Failure-Inversion Panic (*Trivia Murder Party 2* Killing Floor DNA -> `StageTrapdoorGambitV6`)
* **Core Insight from *Trivia Murder Party 2*:** The genius of *TMP2* is that answering a trivia question *wrong* is often **more fun than answering right**. Instead of punishment-by-boredom, a wrong answer rips the floor out and thrusts you into a 6–8 second high-comedy reflex/intuition gauntlet where survival feels like stealing thunder from the host.
* **What We Kill (Anti-Cliché Filter):** No generic "second chance quiz" (just answering another boring multiple-choice question!) and no unfair pixel-perfect twitch impossible on a phone thumb.
* **v6.0 Design (`StageTrapdoorGambitV6` — 10 Rotating 6–8s Pit Mini-Games):**
  1. **REAL ROCK BAND OR FAKE?** — Brass rubber-stamp slamming real legendary bands (`RADIOHEAD`, `FLEETWOOD MAC`, `DAFT PUNK`) while dodging absurd fakes (`VELVET TOASTER`, `SOCK PUPPET ALIBI`, `DAMP CARPET`).
  2. **CLOSING-BLADE SAFE DIAL** — Spin a heavy brass dial to hit 3 glowing lock notches (`±6°`) while twin steel shutter blades steadily close from left & right.
  3. **SNIP THE LIVE GREEN FUSE** — 6 braided cables pulse under flickering pit light; sever every live emerald fuse before the thermal bar peaks, never touching red short-circuits.
  4. **REAL COUNTRY OR FICTIONAL KINGDOM?** — Rapidly sort genuine sovereign nations (`BHUTAN`, `URUGUAY`, `ESTONIA`) from invented realms (`WEST KRAKOZIA`, `NORDLANDIA`, `ZUBROWKA`).
  5. **PNEUMATIC LAVA PISTON** — Rapidly pump twin brass bellows pistons in alternating rhythm (`LEFT -> RIGHT`) to lift your platform above rising molten brass for 6.5 seconds.
  6. **PERIODIC ELEMENT OR SNAKE-OIL POTION?** — Tap real periodic table elements (`TUNGSTEN`, `BISMUTH`, `XENON`) and swat away phony apothecary brews (`ETHERIUM`, `GOBLINITE`, `MITHRILIUM`).
  7. **COUNTERFEIT BANKNOTE SHREDDER** — Conveyor shoots stamped studio bills; tap `SHRED` on bills with bogus portraits/denominations (`$37 BILL`, `KING ELVIS`) and let authentic bills pass.
  8. **OSCILLOSCOPE DEADMAN HOLD** — Press-and-drag a brass tuning slider to keep your glowing phosphor sine wave locked inside a drifting target band for 4.0 cumulative seconds before 8s expires.
  9. **PRESSURE-VALVE STEAM VENT** — 4 riveted bronze boiler valves climb toward redline at staggered speeds; tap overpressured valves (`>75%`) to bleed steam and survive 7.0s without a blowout.
  10. **CURSED MIRROR DECODER** — Words flash backward in brass reflection; tap ONLY the 3 real animals hidden in mirrored script (`REGIT -> TIGER`, `ADNAP -> PANDA`) while avoiding non-animal decoys!
* **Payoff:** Surviving triggers **STREAK SAVED! + +150 DAREDEVIL CHIPS + CROWD ROARS (`crowd_studio_roar`)** and stamps `trapdoor_survived` into `MatchEventMemoryV6` so Frankie & Julian directly rib you about it backstage.

---

### Idea 2 — Cognitive Inversion & Rule-Bending Twists (*You Don't Know Jack* DNA -> Family X `MIND_GAME_TWISTS`, Toys 91–100)
* **Core Insight from *You Don't Know Jack*:** Comedy and thrill come from **breaking the invisible contract of trivia**. Players expect to pick the one right noun from a list. Subverting *what* they tap, *when* time refills, *who* sabotaged the board, or *how* clues link together sparks instant "OHHH THAT'S CLEVER!" delight.
* **What We Kill (Anti-Cliché Filter):** No wall-of-text rule explanations! Every twist toy must communicate its entire rule in a **<= 5-word brass marquee callout** (e.g. `TAP THE 1 LYING WORD`, `PICK THE 1 ODD-OUT`, `DRAG SPOTLIGHT IN DARK`) and demonstrate its affordance visually within 0.4 seconds.
* **v6.0 Design (10 Signature Twist Toys `091–100`):**
  - **91. Spot the Host's Lie:** Julian's statement appears as interactive sculpted brass word-tiles—exactly ONE word is slyly falsified. Tap the corrupted word itself to slam a `"LIAR!"` red stamp on it and reveal the truth correction!
  - **92. Reverse Jeopardy:** A giant brass marquee locks the **Answer** at top (e.g. `1969` or `PARIS`). Below sit 4 clues — tap the **ONLY** clue that does **NOT** match that answer!
  - **93. Rival-Cursed Bomb Wire:** Frankie's glowing crimson tamper-seal booby-traps 1 wire (it emits subtle electrical sparks & warning hum). You must sever the **non-cursed** false wires while isolating the true answer — cutting Frankie's cursed wire instantly shorts `+3.5s` off your clock!
  - **94. Two Truths & A Sabotage:** Three outrageous-sounding dossier cards unfold; two are bizarre real facts and one is a studio-fabricated sabotage. Pin the sabotage!
  - **95. Defibrillator `+2.0s` Blitz:** Heart-monitor clock starts at a terrifying **`3.0s`**! A rapid 4-beat sequence of micro-truth checks fires; every correct tap triggers a capacitor discharge injecting **`+2.0s`** back onto the clock!
  - **96. Mirror-Script Backwards Read:** The clue is engraved in reversed brass mirror script (`scaleX(-1)`). Drag the **pivoting brass vanity mirror** to the calibrated `45°` optical angle so the reflection straightens into readable text, then lock the true choice!
  - **97. Domino Dual-Link:** Two linked brass plaques: solving **Clue A** (micro-fact) drops a physical domino that unlatches the combination selector for **Clue B** (target clue) for a `×2.0` chain bonus!
  - **98. Bidding War vs. Rival:** Before seeing the item rack, Frankie shouts a bid (`"I can nail 3 of 4!"`). Raise the bid (`2`, `3`, or `4/4 ALL-IN`) to steal control, then rapidly pick your promised number of truth tiles before time runs out!
  - **99. Sabotaged Spotlight Blackout:** Frankie cuts the studio breakers! The option field goes dark velvet; drag your thumb's **warm radial Edison spotlight beam** across the stage to illuminate and inspect each concealed placard before your battery meter (`100% -> 0%`) drains!
  - **100. The Sovereign Triple-Lock:** Championship 3-step micro-gauntlet in a single zero-scroll stage: **Lock 1 (Snip 1 Decoy Wire) -> Lock 2 (Align Brass Dial Zone) -> Lock 3 (Slam Final Gold Lever)** for a monstrous **`×5.0 MULT`** finale!

---

### Idea 3 — The `+Chips × Mult` Domino Cascade (*Balatro* Synergy Engine -> `PropTrunkRelicEngineV6`)
* **Core Insight from *Balatro*:** Players don't fall in love with "+10% score." Players fall in love with **synergy engines** where 4 weird physical trinkets talk to each other and turn a modest `200 Chips` answer into `200 -> 450 -> 700 × 2.5 -> × 5.0 -> × 10.0 = $7,000` in a crisp, rhythmic, escalating chime cascade!
* **What We Kill (Anti-Cliché Filter):** No boring RPG stat bloat (`+3% Wisdom`, `+5% Luck`), no opaque formulas, and no cramped scrollable inventory menus. Every relic fits in a crisp zero-scroll **5-Slot Velvet Pedestal Rack** with short `<= 8 word` effects (`+2.5 MULT ON TWIST TOYS`, `SURVIVING TRAPDOOR ADDS +1.5X FOREVER`).
* **v6.0 Design (`PropTrunkRelicEngineV6` — `24` Relics across 6 Build Archetypes):**
  - **Archetype A — Speed & Defusal (`RIGGED CAPACITOR`, `GENEVA ESCAPEMENT`, `STOPWATCH HAIRSPRING`, `WIREMAN'S SHEARS`):** Rewards fast locks (`>50%` time left) and Family I/IV/IX reflex hits.
  - **Archetype B — Casino & High-Roller (`LOADED MONTE DIE`, `CROUPIER'S RAKE`, `VELVET CHIP STACK`, `INSURANCE POLICY`):** Scales off bankroll cash, wager toys (Family VI/VII), and risk-taking.
  - **Archetype C — Trapdoor Daredevil (`TRAPDOOR TOKEN`, `PHOENIX FUSE`, `SCARRED PENDULUM`, `KINTSUGI BOWL`):** Literally rewards surviving Trapdoor Gambits with permanent scaling `+Mult` and `×Mult`, turning near-death into a snowball build!
  - **Archetype D — Forensic & Twist Savant (`UV PRISM LENS`, `HOT MIC`, `POLYGRAPH NEEDLE`, `SOVEREIGN CIPHER RING`):** Supercharges Family VIII Forensic & Family X Mind-Game Twist toys.
  - **Archetype E — Streak & Precision (`PRECISION CALIPER`, `TUNING FORK RESONATOR`, `GOLDEN TELEGRAPH KEY`, `MARQUEE DIMMER`):** Escalates exponentially on consecutive streaks and `>= 0.90` accuracy bullseyes.
  - **Archetype F — Contraband Rule-Breakers (`FRANKIE'S MASTER KEY`, `STAGEHAND'S MAGNET`, `BROKEN METRONOME`, `CROWN SOVEREIGN SEAL`):** Rare high-cost wildcards that duplicate left-neighbor relic triggers, convert leftover seconds directly into `×Mult`, or grant `×3.0` on Episode Climax turns!
* **Scoring Resolution Order (Strict *Balatro* Grammar):**
  1. Start with `(baseChips, baseMult)` from the Board Node + Toy accuracy/speed.
  2. Trigger equipped Relics **left-to-right (Slots 1 -> 5)**: apply `+Chips`, `+Mult`, and `×Mult` in order (so **slot ordering matters strategically** — placing `+Mult` relics left of `×Mult` relics yields dramatically higher payouts!).
  3. Apply active Foil Card modifiers (e.g., `DOUBLE_MULT`).
  4. Emit an ordered `RelicCascadeStepV6[]` array with pitch index (`0..N`) & `FoleySfxIdV6` cue for crisp staggered animation (`180ms` per pop).

---

### Idea 4 — Physicalized Tabletop Sabotage (*Inscryption* Consumable Items -> `18` Holographic Foil Dirty-Trick Cards)
* **Core Insight from *Inscryption*:** Consumables should feel **illicit, physical, and decisive** — like slipping a brass key or pair of wire-cutters out of a velvet smuggling trunk while the referee isn't looking.
* **What We Kill (Anti-Cliché Filter):** No generic "50/50 Lifeline" clones. Every card either bends the board, sabotages the rival, transforms the active toy, or rescues a doomed turn.
* **v6.0 Design (`18` Foil Cards across all 9 `FoilTrickCardV6['effectKind']` categories, 2 distinct tactical cards per kind):**
  - `FREEZE_NODE`: *Liquid Nitrogen Vial*, *Ice-Box Padlock*
  - `DOUBLE_MULT`: *Double Stake Foil*, *Velvet Spotlight Surge*
  - `SCREW_RIVAL`: *Screw Rival!*, *Blind Rival Fog-Bomb*
  - `ROTATE_RING_FREE`: *Free Orrery Crank*, *Backstage Gear Shift*
  - `REVEAL_MOLE`: *UV Mole Scanner*, *Wiretap Transcript*
  - `DEFUSE_ONE_WIRE`: *Insulated Snips*, *Decoy Short-Out*
  - `SHATTER_CHAINS`: *Bolt-Cutter Crowbar*, *Thermite Padlock Key*
  - `STEAL_RIVAL_POT`: *Pickpocket's Cane*, *Host's Skim Envelope*
  - `SWAP_CLUE_TOY`: *Swap Clue Toy*, *Dealer's Wild Switch*
* **Trunk Visual Craft:** Deep burgundy-velvet quilted flight case (`#3a0e1a` -> `#1d060c`), riveted antique brass corner brackets, physical leather trunk straps, live pointer-angle holographic prismatic rainbow sheen on Foil Cards (pure CSS `--hx/--hy` custom properties + crisp SVG filigree, ZERO `backdrop-filter`), and a strict zero-scroll 2-bay Split Trunk (`Equipped 5-Relic Pedestal Rail` + `Shop Tray: 3 Relics + 3 Foil Cards + Reroll Crank`).

---

### Idea 5 — Analog Physical Suspense (*Price Is Right* Cliffhangers, *Money Drop*, *The Room* -> Families VI, VII, VIII, IX, Toys 051–090)
* **Core Insight:** Turning an abstract trivia guess into a **physical machine with inertia, weight, light, or risk** makes even a classic question feel brand new!
* **Architecture Across Families VI–IX (40 Distinct Tactile Toys):**
  - **Family VI — `WAGER_SCALE_CHRONOLOGY` (Toys 51–60):**
    - *51. Yodel Mountain Cliffhanger* — Custom brass dial estimate; on lock-in, your carved mountaineer hikes step-by-step up a 25-step alpine ridge by `scaledError` steps! Stop before Step 25 -> survive & cash out; hit Step 25 -> comedic cliff plunge!
    - *52. Higher / Lower Brass Cards* — Ornate tarot-sized gilded anchor card vs. challenger card; slam `HIGHER` or `LOWER` brass flip paddles across a 3-card chain.
    - *53. 4-Rung Chronology Snap* — Slotted mahogany track where players drag or tap-swap 4 engraved brass rungs from earliest to latest.
    - *54. Apothecary Two-Pan Brass Balance Scale* — Animated SVG brass balance beam physically tilts left/right as you drop weighted choice tokens onto the target pan to balance the truth!
    - *55. 4-Plug Braided Switchboard* — Coaxial brass sockets + live glowing braided SVG cables linking Clue Pins to Answer Jacks.
    - *56. Confidence Chip Slider (`10%–100%`)* — Custom pointer-drag brass caliper rail (ZERO `<input type="range">`!) letting you stake `10%..100%` confidence BEFORE locking your answer — high confidence multiplies Chips, overconfidence risks Trapdoor!
    - *57. Smallest-to-Largest Tower Stack* — Stack 4 stepped brass/obsidian monolith blocks in ascending order with tactile click-snap slots.
    - *58. 2-Circle Venn Sorter* — Twin overlapping illuminated brass rings (`SET A`, `BOTH`, `SET B`); tap/route items into the exact intersection zone.
    - *59. Century Timeline Pin* — Drag a ruby brass caliper pin along an engraved 1500–2026 brass ruler with decade detents and live Nixie year readout.
    - *60. Exact-Change Coin Tray* — Tap gilded studio coins (`+100`, `+25`, `+10`, `+5`, `+1`) onto a velvet tray to sum the exact numeric target (or answer value)!
  - **Family VII — `CASINO_BLUFF_STAKES` (Toys 61–70, Stage 03 Riviera Emerald Felt DNA):**
    - *61. Split-100-Chips Across 3 Trapdoors* — Iconic *Money Drop* tension! Allocate 100 casino chips across 3 hinged brass trapdoors (must leave >=1 door empty!). On lock, 2 trapdoors drop open — you KEEP every chip left standing!
    - *62. Blackjack 21 Fact Sum* — Hit or Stand on fact cards (`TRUE` adds safe points, `FALSE` risks busting over 21!) to outscore the dealer.
    - *63. Host's Bribe* — Julian slides a wax-sealed `$350 GUARANTEED BRIBE` across the felt vs. answering the clue to crack the `$1,500 VELVET VAULT`!
    - *64. Double-or-Nothing Second-Guess* — Lock initial answer -> sudden `"DOUBLE FOR 2X?"` brass flip-switch before reveal!
    - *65. Roulette Odd/Even Fact Bet* — Place brass casino chips on a spinning European roulette wheel sector (`TRUE/RED`, `FALSE/BLACK`, or `EXACT STRAIGHT-UP` for `3×`).
    - *66. Poker Truth Hand* — Deal 4 enameled cards; discard 2 decoys and `SHOWDOWN` your winning truth card(s).
    - *67. Blind High-Card Draw* — Flip clue modifiers (risk/reward blind multiplier cards) before revealing and snapping the right choice.
    - *68. Insurance Hedge Bet* — Pick a PRIMARY answer (`100%`) plus an optional hedged BACKUP (`40%` safety net) for tactical risk control.
    - *69. Press-Your-Luck Vaults* — 4 brass safe drawers; crack up to 3 safe drawers for compounding cash (`+200 -> +500 -> +1000`), cash out anytime, or hit the 1 booby-trapped lie drawer!
    - *70. All-In Final Showdown* — Push the heavy velvet chip-rack bar forward to wager your turn pot before locking the championship answer.
  - **Family VIII — `FORENSIC_DETECTIVE` (Toys 71–80, Stage 05/04 Cold-War Bunker & Rotunda DNA):**
    - *71. UV Blacklight Hidden Ink* — Drag a live ultraviolet lens cone across 4 blank cream evidence slips to expose hidden luminous ink clues & pinpoint the truth!
    - *72. Microfilm Scroll Reader* — Crank a horizontal brass microfilm sprocket wheel to scan 4 photographic negatives through a crisp illuminated optical loupe and stamp the match.
    - *73. Fingerprint Evidence Match* — Compare the crime-scene brass whorl/loop ridge pattern against 4 suspect evidence cards, toggling an overlay alignment reticle.
    - *74. Polygraph Lie-Needle* — Live vibrating SVG ink-stylus polygraph chart! Each option causes either steady green alpha waves or jagged crimson stress spikes as you inspect, aiding intuition under a tight clock.
    - *75. Morse / Cipher Decoder Wheel* — Rotate a concentric dual-ring brass Caesar/Morse decoder disc (`+3` offset key) to decode a scrambled 1-word answer plaque!
    - *76. Torn Document Jigsaw* — Tap-rotate/assemble 4 torn parchment shreds into a coherent fact plaque, then stamp the matching verdict.
    - *77. Periscope Silhouette Lock* — Pan an underwater brass periscope viewfinder horizontally across 4 target silhouettes, align crosshairs, and pull `FIRE LOCK`.
    - *78. Suspect Alibi Cross-Check* — 3 dossier cards with timestamps/locations; spot the single alibi contradiction that matches the clue!
    - *79. X-Ray Relic Scan* — Drag a glowing phosphor X-ray fluoroscope shutter over 4 sealed crates to inspect the real internal object silhouette/tag.
    - *80. Red-String Corkboard Link* — Pin a taut crimson cotton string between the central Polaroid evidence card and the true suspect/fact tack!
  - **Family IX — `KINETIC_CONTRAPTIONS` (Toys 81–90, Stage 07/08/09 Carnival / Bathysphere / Observatory DNA):**
    - *81. Calliope Pipe Pitch Match* — 4 gleaming copper organ pipes pulse with visual steam plumes & musical intervals; pump the matching pipe valve to sound the truth!
    - *82. Submarine Depth-Valve Equalizer* — Spin a spoked bronze wheel valve to equalize twin pressure needles into the target answer sector before hull depth warnings spike.
    - *83. Prism Beam Color Aim* — Rotate a crystal brass prism mirror so a live refracted golden beam bounces directly into the crystal housing of the true answer!
    - *84. Clockwork Gear-Ratio Match* — Mesh the driving brass gear with the exact tooth-ratio answer cog so the escapement locks into golden rotation.
    - *85. Carnival Ring-Toss Aim* — Time an oscillating horizontal brass throwing arc and tap `TOSS` to land a glowing ring over the true carnival peg (with smooth assistive magnetism!).
    - *86. Steam Pressure Gauge Hold* — Hold a tactile brass throttle lever to build boiler pressure into the selected option's pressure band and release to lock!
    - *87. Magnetic Pendulum Catch* — A brass electromagnetic bob swings smoothly across 4 answer coils; energize `CLAMP` at the exact arc apex over your chosen answer!
    - *88. Shooting-Gallery Moving Plates* — 4 enameled tin carnival plates glide across dual parallax brass rails; tap the true moving plate cleanly to flip it down with spark particles!
    - *89. Bathysphere Airlock Sequence* — Flip 3 heavy riveted bronze bulkhead latches in the valid clue-guided sequence to seal the airlock!
    - *90. Aurora Star-Connect* — Tap constellations on an alabaster star-chart dome to draw glowing aurora filaments connecting the true astronomical/fact star node!

---

### Bonus Idea 6 (Anti-Tunnel-Vision Wildcard) — The "Daredevil Heat Loop"
* **How All Three Subsystems Lock Together Into One Addictive Core Loop:**
  - Playing Twist Toys (`91–100`), staking high on Casino Toys (`61–70`), and surviving `StageTrapdoorGambitV6` builds **STAGE HEAT (`0..100`)**.
  - High Stage Heat activates **Contraband Relic triggers** in `PropTrunkRelicEngineV6` and boosts Foil Card drop rates between rounds.
  - Thus **Risk -> Adrenaline -> Survival -> Bigger Relics -> Bigger Multipliers -> Audacious Risk** forms a true self-sustaining *Balatro × TMP2* arcade compulsion loop!

---

## 2. Non-Negotiable Technical & Zero-Scroll Engineering Laws

1. **Zero-Scroll Lock (`100dvh` Strict Viewport Budget):**
   - Root container: `position: relative; width: 100%; height: 100%; overflow: hidden; box-sizing: border-box;`
   - Portrait (`aspect-ratio < 1.15`): Top architectural clue header (`flex: 0 0 auto; max-height: 22%`) + Bottom interactive gadget (`flex: 1 1 0; min-height: 0`).
   - Landscape (`max-height: 520px` & landscape): Automatic **2-Column Split-Stage** (`Prompt/Timer/Badges Left 38%` | `Interactive Tactile Gadget Right 62%`), guaranteeing zero clipping on `844x390` and `660x340` phones!
2. **Zero AI Cliché Audit:**
   - `0` `<input type="range">` elements (every slider/dial/caliper uses pointer events + SVG/DOM brass mechanics).
   - `0` `backdrop-filter` rules.
   - `0` OS color emojis (100% custom procedural vector SVG icons, gauges, cards, coins, cutters, and relics).
   - `0` commas in 4-digit years (`1969`, NEVER `1,969`).
3. **Resilient Clue-Payload Synthesis:**
   - Every toy (`051–100`) consumes `CalibratedClueV6` natively when optional fields (`numericTarget`, `chronologyItems`, `corruptedLieWord`, `binaryPair`, `progressiveHints`) are present, AND deterministically synthesizes rich, valid, enjoyable playable payloads from `prompt`/`choices`/`correctIndex`/`qid` whenever an optional field is omitted — guaranteeing `0` undefined labels, `0` unplayable traps, and `100%` compatibility with all `1,279,399+` corpus clues.
4. **Unified Pack-Plug Architecture (`UnifiedToyManagerV6`):**
   - Ships with Pack B (`TOY_CATALOG_051_TO_100` + `mountToyStageRendererB`) pre-registered AND exposes a strongly typed `registerToyPack(...)` adapter so Pack A (`ToyCatalog001To050` + `ToyStageRendererA`) snaps in seamlessly on integration with zero circular imports or compile breaks.
