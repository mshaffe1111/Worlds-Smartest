# World's Smartest v6.0 — Deep Research & 5-Idea Master Game-Loop Pacing Matrix

**Author:** `v6-showtime-director` (Principal Game Director & Master Systems Architect)  
**Branch:** `feat/v6-showtime-director`  
**Scope:** Master gameplay flow, pacing, tension/comedy elasticity, persistent career economy, 10-Stage Champion Rival AI, 36-Award automatic telemetry evaluation, and dependency-injected integration spine across all 11 sibling `v6.0` subsystems.

---

## 1. Diagnosis of v5.0's Fun Deficit (Why Great Systems Still Felt Flat)

Before proposing structures, we audited why players rejected `v5.0` despite high content counts:
1. **Flat Pacing Curve (Start Hard, End Hard):** Clues lacked calibrated `★ 1.0 → ★ 10.0` ramp, so Episode 1 felt like an ambush rather than a warm-up showcase.
2. **Punishing Dead-Air on Wrong Answers:** Missing a clue terminated momentum with a silent red banner instead of converting tension into playable adrenaline.
3. **Shop & Build Disconnection:** Relics/Charms felt decorative rather than transformative counter-play against visible upcoming twists and Rival habits.
4. **Repetition Blindness:** Without cross-session rotation windows for Boards, Toys, *and* Toy Families alongside the 1.27M-clue bitset, players hit repeats back-to-back.
5. **Passive / Generic Rivals:** A score-rolling AI ticker has no personality, no spatial board intelligence, and no telegraphed counter-play.

---

## 2. Structural Study of Four Generational Reference Loops

| Reference Title | Structural Mechanism Studied | Direct Translation into `World's Smartest v6.0` |
| :--- | :--- | :--- |
| ***Balatro*** | **Asymmetric Blind Escalation + Post-Win Warm-Cash Shop + Scoring Cascade:** Small/Big/Boss cadence where you *see the next Boss Blind* while spending fresh winnings, and score builds rhythmically (`+Chips` → `×Mult` → re-triggers) with rising pitch stingers. | Each Stage World runs a crisp **2-Episode Arc** (Venue Showcase → Stage Title Bout). Frankie's **Backstage Prop Trunk** opens immediately after Episode Ceremony with a **Champion Scouting Dossier** showing the next Episode's Twist & Rival tell, so buying Relics/Foils is deliberate counter-play. Scoring cascades through `streak_chord_1..5`. |
| ***Hades*** | **Fail-Forward Reactive Hub Loop:** Never halt play with prose walls. Every post-run pitstop reacts to *exactly how you won or died* via priority memory buckets, turning even a loss into story momentum and build curiosity. | `MatchEventMemoryV6` logs exact Stage, Board, Toy, action tags (`cut_blue_wire`, `trapdoor_clutch`, `screwed_rival`, `broke_bankroll`), and feeds `ReactiveShowrunnerV6` inside Frankie's Trunk (strict max 2 lines, ≤22 words/line). Losing never wipes your career; it triggers tailored banter, consolation cash, and a fresh board/toy rematch. |
| ***Trivia Murder Party*** | **Elastic Tension Valve (Failure → Frantic 8s Survival):** A wrong answer doesn't end the thrill—it drops the floor into a comedic 8-second physical survival test where skill can salvage pride and streak. | Any missed clue springs the 3D Stage Floor (`TRAPDOOR_PIT_PLUNGE`) into **Stage Trapdoor Gambit** (10 rotating 6–8s survival mini-games). Surviving preserves `×Mult` streak and awards half chips + crowd roar. Includes a **Trapdoor Fatigue Valve** (never repeats a pit game within an episode; `TRAPDOOR TOKEN` relic can auto-bypass). |
| ***Slay the Spire*** | **Biome Identity + Telegraphed Enemy Intents + Act Power Curve:** Each Act introduces distinct spatial rules and enemy moves; telegraphing the enemy's *next* move transforms guessing into crisp tactical puzzles. | All **10 Stage Worlds** pair bespoke 3D architecture, symphony, native Board Families, and a unique **Stage Champion AI** who **telegraphs their next board intent** (target node, chain-lock, ring spin, auction bid, or Screw bluff) before the player picks a node. |

---

## 3. The 5-Idea Master Run Structure Matrix (Anti-Tunnel-Vision Audit)

We designed and stress-tested **five genuinely distinct run architectures** against mobile session length (`3.5–5.5 min/episode`), 10-Stage visual variety, 100-Board/100-Toy discovery, and zero-scroll clarity.

### Idea A — *Classic 20-Episode Linear Arcade Ladder*
- **Design:** Straight Episode `1 → 20` ladder, 10 turns per match, passive score-race AI, shop only between Stage Worlds (every 2 episodes).
- **Strengths:** Dead simple mental model; predictable length.
- **Fatal Flaws:** 10 turns per episode runs `9–12 min` (too heavy for portrait phone sessions); waiting 2 matches to spend cash breaks *Balatro*'s warm-cash reward loop; passive score-ticker ignores 3D spatial board geometry.
- **Verdict:** **KILLED.**

### Idea B — *Full Permadeath Roguelike Season*
- **Design:** Every run begins at Stage 01 (`$0`, `0` Relics). Losing any episode wipes Relics, Foils, cash, and bounces you back to Vaudeville Palace Ep 1.
- **Strengths:** Extreme adrenaline; pure *Balatro* / *Slay the Spire* stakes.
- **Fatal Flaws:** Catastrophic for a 10-Stage trivia game! Players would replay Stages 01–03 repeatedly and rarely see Kyoto Lacquer (`Stage 06`), Sunken Bathysphere (`Stage 08`), or Sovereign Colosseum (`Stage 10`), wasting 70% of our bespoke 3D worlds & symphonies and making hard clues feel punishing rather than thrilling.
- **Verdict:** **KILLED for Main Campaign** *(salvaged as optional Lobby mode: `TRAPDOOR GAUNTLET` endless high-stakes streak!).*

### Idea C — *Total Sandbox / Free-Pick Playlist*
- **Design:** All 10 Stage Worlds, 100 Boards, and 100 Toys unlocked at boot with zero campaign progression or structured escalation.
- **Strengths:** Instant access to any content for returning players.
- **Fatal Flaws:** Obliterates the `★ 1.0 → ★ 10.0` difficulty ramp, destroys *Hades* serialized backstage rivalry payoff, and triggers severe choice paralysis (100×100 combinations with no anchor).
- **Verdict:** **KILLED as Primary Spine** *(salvaged as progressive `100-BOARD QUICK SHOW` stage picker unlocking Stage Worlds as you reach them!).*

### Idea D — *Two-Episode Stage Arcs ("Venue Showcase → Stage Title Bout") + Warm-Cash Backstage Trunk + Telegraphed Rival Intents* (**SELECTED WINNER**)
- **Design:** Each of the **10 Stage Worlds** is a tight **2-Episode Broadcast Arc (`20` Episodes total)** tuned for `3.5–5.5 min` mobile sessions:
  - **Odd Episodes (`1, 3, 5, ..., 19` — Venue Showcase):** `5` player turns. Showcases a native contraption from that Stage World's architectural family. Clean `★` difficulty floor for that band (`Stage 01` starts at `★ 1.0–1.5` crowd-pleasers!). One **Halftime Twist** triggers on Turn `3` with a broadcast siren + 1-line Julian alert. Rival plays crisp positional board strategy without unfair cheap shots on Ep 1–2.
  - **Even Episodes (`2, 4, 6, ..., 20` — Stage Title Bout vs. Stage Champion):** `6` player turns. Escalates to a signature Twist/Boss contraption for that Stage World, opens with a telegraphed Venue Twist + Halftime Escalation, activates the Stage Champion's signature **Telegraphed Tactical Intent** (visible icon + target highlight on the 3D board before your turn!), and awards **1.6× Purse + Next Stage World Unlock + Stage Championship Trophy check**!
  - **Immediate Post-Episode Backstage Trunk:** Every episode flows cleanly through `EPISODE_CEREMONY` → `BACKSTAGE_TRUNK` (Frankie's Velvet Trunk) with warm cash, a 2-line *Hades*-reactive backstage beat tied to `MatchEventMemoryV6`, and a **Next Broadcast Scouting Card** previewing the upcoming Stage Twist so Relic (`max 4`, expandable to `5` via `CONTRABAND` / Stage 05 milestone) and Foil Card (`max 3`) purchases are pure strategy.
  - **Fail-Forward Rematch Loop:** Losing an episode retains all unlocked Stage Worlds, Trophies/Medals, equipped Podium Relics, and grants a `35%` appearance purse + fresh Trunk stock + Rival-taunt reactive dialogue so you bounce straight back onto a **different, non-repeating Board & Toy set**!
- **Strengths:** Perfect mobile session pacing (`5–6` turns), guarantees players experience all 10 Stage Worlds & 20 Episodes on a smooth `★ 1.0 → ★ 10.0` curve, maximizes *Balatro* build crafting + *Hades* reactive comedy + *TMP* Trapdoor rescue + *StS* tactical board clarity.
- **Verdict:** **SELECTED AS MASTER SPINE.**

### Idea E — *Branching 30-Node World-Map Tournament Tree*
- **Design:** Multi-lane branching node map between episodes (Match / Auction / Mystery Event / Rest Stop) across 5 Acts.
- **Strengths:** Strategic macro-routing between matches.
- **Fatal Flaws:** Duplicates v5.0's clunky Tour Trunk corkboard navigation tax on phones; breaks clean `10 Stage Worlds × 2 Episodes = 20` symmetry; hides the 3D proscenium behind map UI menus.
- **Verdict:** **KILLED as Macro-Screen** *(best mechanic salvaged directly into **Intra-Board Risk/Reward Pathing**—safe low-diff outer nodes vs. chained high-mult inner vaults & Mystery Auctions right on the 3D board!).*

---

## 4. Selected Master Pacing Blueprint (Idea D + Salvaged Highlights)

### 4.1 The 4-Beat Micro-Turn Rhythm (Target: `25–38s` per full turn)
1. **Board Tactical Read (`6–12s` — `BOARD_TURN`):** Inspect 3D contraption state, active `BoardTwistMutationIdV6`, and **Rival's Telegraphed Next Intent** (e.g., *"Contessa Vittoria is eyeing Node #7 (×2.5) to complete a Casino 21!"*). Optionally fire a held **Foil Trick Card** (`FREEZE_NODE`, `DOUBLE_MULT`, `SCREW_RIVAL`, `ROTATE_RING_FREE`, `REVEAL_MOLE`, `SHATTER_CHAINS`, `STEAL_RIVAL_POT`). Tap target 3D node.
2. **Zero-Scroll Tactile Toy Encounter (`8–18s` — `TOY_ENCOUNTER`):** Camera dollies to `TOY_CLOSEUP_STAGE`. Non-repeating Toy launches with calibrated clue difficulty (`stageBand + node.difficultyOffset + turnRamp`). Player may burn `DEFUSE_ONE_WIRE` or `SWAP_CLUE_TOY` Foil pre-lock.
3. **Elastic Resolution (`3–8s`):**
   - **Correct:** Ascending symphonic streak chord (`streak_chord_1..5`), `+Chips × Mult` Relic synergy burst, 3D board physics update, ≤14-word Julian/Rival live quip, instant Trophy/Medal trigger check!
   - **Wrong → `TRAPDOOR_GAMBIT`:** 3D double-leaf floor plunges (`TRAPDOOR_PIT_PLUNGE`), `trapdoor_survival_blitz` kicks in, 6–8s physical mini-game. **Survive** → Streak preserved (`×Mult` intact!), `40%` base chips salvaged, crowd roars. **Fall** → Streak resets to `1`, Rival takes momentum bonus (`+$150 × stageNumber`), Julian drops sharp 1-line quip.
4. **Brisk Rival Turn & Next Telegraph (`2.5–3.5s`):** Rival executes their deterministic/seeded personality action (with visual node highlight + 1-line bark), board kinetics tick (rings rotate, conveyor moves, flood rises), halftime twist fires at Turn `3` (`TWIST_MUTATION`), and the Rival telegraphs their next move.

### 4.2 The 10-Stage / 20-Episode Difficulty, Economy & Champion Matrix

| Stage | World ID & Era | Eps | Clue Band (`★`) | Stage Champion Rival AI *(Clause 14-B Cast)* | Signature Tactical Style & Bluff Tell |
| :---: | :--- | :---: | :---: | :--- | :--- |
| **01** | `STAGE_01_VAUDEVILLE_PALACE` *(1928 Broadway)* | 1–2 | `1.0 – 1.9` | **Barnaby "Two-Takes" Vance** | Showman frontrunner; chases high-visibility outer nodes; rarely chains; telegraphs bravado bluffs cleanly. |
| **02** | `STAGE_02_GENEVA_CONSERVATORY` *(Swiss Horology)* | 3–4 | `2.0 – 2.9` | **Dr. Sabine Vogt** | Precision alignment specialist; optimizes concentric ring/gear alignments (`x3` beams) & high-accuracy nodes. |
| **03** | `STAGE_03_MONTE_CARLO_SALON` *(1962 Riviera)* | 5–6 | `3.0 – 3.9` | **Countess Mireille de Valois** | High-roller push-luck gambler; hunts `21` Blackjack targets, Mystery Auctions & bluffs high bids; vulnerable to `FREEZE_NODE`. |
| **04** | `STAGE_04_CARTOGRAPHIC_ROTUNDA` *(Age of Exploration)* | 7–8 | `4.0 – 4.9` | **Capt. Alistair Finch-Harrow** | Graph-bridge expander; computes shortest bridge paths across hex/subway/archipelago topologies to cut off your territory. |
| **05** | `STAGE_05_ANALOG_BUNKER_1969` *(Cold-War Console)* | 9–10 | `5.0 – 5.9` | **Walter "Redline" Kowalski** | Chain-lock saboteur; drops iron chains on your highest-mult neighbor, plants Double-Agent Moles, exploits sonar/laser bottlenecks. |
| **06** | `STAGE_06_KYOTO_LACQUER_PAVILION` *(Urushi Kintsugi)* | 11–12 | `6.0 – 6.9` | **Kenzo Taniguchi** | Patient Go-web strategist; builds quiet adjacent clusters, triggers harmonic/domino cascades on Turns 4–6. |
| **07** | `STAGE_07_CARNIVAL_CURIOSITIES` *(Midnight Pier)* | 13–14 | `7.0 – 7.9` | **Delilah "Nickel-Slot" Kerr** | Kinetic chaos trickster; times Ferris Wheel / Pinball / Duck-Gallery windows and throws sudden `SCREW` dares. |
| **08** | `STAGE_08_SUNKEN_BATHYSPHERE` *(Abyssal Bronze)* | 15–16 | `8.0 – 8.5` | **Dr. Henrik Lindholm** | Pressure-cooker attrition tactician; dominates inner high-pressure nodes before flood/airlock twists seal outer rings. |
| **09** | `STAGE_09_ASTRAL_OBSERVATORY` *(Aurora Dome)* | 17–18 | `8.5 – 9.2` | **Nadia Okafor-Voss** | Quantum/optical sniper; abuses Mirror-Twin Links, Prism Splitters, and Entangled Pairs to flip two nodes in one turn. |
| **10** | `STAGE_10_SOVEREIGN_COLOSSEUM` *(Nero Marble Altar)* | 19–20 | `9.0 – 10.0` | **Arthur "The Archivist" Pendelton** | $900k-retainer Grandmaster boss; mirrors player's strongest domain, locks Apex vaults, uses calculated Split-or-Steal mind games, yet remains **100% mathematically fair** (zero rubber-band cheating!). |

### 4.3 Non-Repeating Rotation & Anti-Staleness Contract
- **Boards (`100`):** Rolling history buffer (`recentBoardIds`, length `25`) persisted in `CareerSaveStoreV6`. Selection prioritizes boards matching the current `StageWorldIdV6` signature first, then family variety, **strictly forbidding** the immediately previous board (`lastBoardId`) or any board in the active cooldown window unless all 100 are exhausted.
- **Toys (`100`):** Rolling history buffer (`recentToyIds`, length `20`) + `lastToyFamily` anti-streak check. Players **never** play the same toy twice in a row AND never hit the same Toy Family back-to-back within a match (unless explicitly overridden by QA URL harness `?toy=N`).
- **Trapdoor Mini-Games (`10`):** Rolling `recentTrapdoorIndices` queue guarantees all 10 survival pits rotate before repeating.
- **Relic Slot Expansion:** Players start with `4` Podium Relic slots; clearing **Episode 10 (Stage 05 Analog Bunker Title Bout)** or purchasing the Backstage Expansion unlocks the **5th Podium Relic Slot** (persisted in `ws_v6_career_state_v1`).

### 4.4 Clean Dependency-Injected Architecture for Zero-Conflict Master Integration
`ShowtimeMasterDirectorV6` accepts an optional `ShowtimeDependenciesV6` injection bag (with crisp TypeScript adapter interfaces matching every sibling subsystem's exact brief: `StageWebGL2Engine`, `CameraDirectorV6`, `StudioAudioEngineV6`, `QuestionEngineV6`, `UnifiedBoardManagerV6`, `BoardTwistDirectorV6`, `UnifiedToyManagerV6`, `StageTrapdoorGambitV6`, `PropTrunkRelicEngineV6`, `ReactiveShowrunnerV6`, `GrandLobbyHubV6`, `TrophyMedalVault3DV6`, `BroadcastOptionsConsoleV6`, `PostMatchCeremonyV6`).
- Every optional dependency has a **graceful zero-scroll built-in fallback adapter** so the state machine, top HUD stage-bar, 1-tap Fullscreen control, and QA URL deep-link harness (`?v6view=lobby|board|toy|trapdoor|trunk|trophies|options&stage=1..10&board=1..100&toy=1..100`) run deterministically both standalone AND once all 11 sibling modules wire into `src/main.ts`!
