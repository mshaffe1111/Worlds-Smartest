# Research Report 01: Trivia Craft, Player Psychology & Market Differentiation
**Project:** *World's Smartest* (Mobile-First 3D Android + Web Trivia Thriller — Godot 4.7.2)  
**Author:** Researcher #1 — Trivia Craft, Player Psychology & Market Differentiation Lead (`research-trivia-craft`)  
**Audience:** `@godot-aaa-director`, `@campaign-20hr-writer`, `@qa-art-critic`, `@coordinator`  
**Status:** Studio Production Mandate v1.0 (Audited at Gate 3)

---

## Executive Thesis: Why *World's Smartest* Can Own an Untapped Category

The mobile trivia market is trapped in a **decade-old 2D multiple-choice monoculture**. Legacy hits (*Trivia Crack*, *Trivia Star*, *Jeopardy! World Tour*) have systematically burned player goodwill through aggressive ad walls, pay-to-win power-ups, shallow US-centric question banks, and repetitive 4-button clicking. Meanwhile, two explosive adjacent genres have proven what modern players actually crave:

1. **Daily Deduction & Lateral Logic** (*NYT Connections*, *Wordle*, *TimeGuessr*, *The 1% Club*, *Only Connect*) — players want **deductive agency**, fair "Aha!" breakthroughs, and spoiler-free social bragging rights, *not* rote memorization pop quizzes.
2. **Intimate 3D Tabletop Psychological Thrillers** (*Inscryption*, *Buckshot Roulette*, *The Room*, *Liar's Bar*) — players love tactile physical objects, zero-HUD diegetic stakes, and nerve-shredding eye-contact tension across a dimly lit table.

**The Market White Space:** *Nobody* has fused **museum-grade 3D tabletop horology & forensic tactile play** with **psychometrically tuned deductive trivia, calibrated confidence wagering, and a 20+ hour espionage-thriller campaign**. By turning every question from a flat "Do I know it? (Y/N)" click into a tactile **Hook → Deduction → Risk Commit → Suspense Pause → Euphoric Payoff → Micro-Aha!** thriller loop across the Vetting Chamber's marble table, *World's Smartest* breaks completely out of the casual quiz ghetto and claims a prestige AAA niche.

---

## Part 1: Empirical Teardown — What Makes Great Trivia & Why Mediocre Apps Die

### 1.1 Proven Hits & Cult Favorites: Mechanics That Actually Drive Love & Retention

| Title / Benchmark | Core Secret Weapon | Psychological Trigger Exploited | Direct Lesson for *World's Smartest* |
| :--- | :--- | :--- | :--- |
| **NYT Games (*Wordle*, *Connections*)** | One shared daily puzzle; Wyna Liu's mischievous "red herring" categories; **zero-semantic-leakage emoji grids** (🟩🟨🟦🟪). | **Scarcity Principle** (prevents burnout), **Zeigarnik Effect** (near-misses linger all day), and the **Isolation-to-Community Paradox** (safe bragging without spoiling friends). | Our Daily *Global Feed* MUST use a deterministic UTC 7-question broadcast + 1-tap spoiler-free emoji/glyph share card encoding Tier Peel, Overclock, and Precision without leaking any clue text. |
| ***Jeopardy!*** | **"Pinning" clue craft** (`Context + Unique Constraint/Pivot = Single Unambiguous Target`) + Daily Double asymmetric wagering. | **Lateral Deduction & Gettability** — players feel brilliant when they synthesize two hints into an answer they didn't realize they knew. | Ban rote obscurity ("What year was Treaty X signed?"). Every question in `questions.json` MUST be "pinned" with at least one deductive bridge and two progressive peel clues. |
| ***Who Wants to Be a Millionaire*** | **Weaponized silence** ("Final Answer" commitment contract), chiaroscuro interrogation lighting, Keith & Matthew Strachan's descending-pitch heartbeat score, and **Safe Havens** ($1K/$32K). | **Commitment Bias** + **Loss Aversion Inversion** (Kahneman & Tversky: once a Safe Haven secures a floor, greed overrides caution and drives dramatic risk-taking). | Hold-to-Overclock (`0.30s–1.00s`) acts as our tactile "Final Answer" contract; dynamic **Suspense Pauses** (`0.35s–1.15s`) + music cut-to-heartbeat + Safe Haven Extraction Airlocks recreate prime-time tension on mobile. |
| ***HQ Trivia*** *(Peak & Postmortem)* | Live appointment FOMO + charismatic host pushed **2M+ concurrent players**. **Died from:** micro-split payouts ($0.82 wins), rigid schedule fatigue, lag/botting, VC cash-burn. | **Shared Cultural FOMO** (win) vs. **Anticlimactic Payoff & Integrity Collapse** (death). | Never gate play behind rigid live appointment clocks or fake cash promises. Deliver prestige *identity* stakes (World Rank / Meridian Seat / Rival Dossiers) on the player's schedule with zero cheating exposure. |
| ***QuizUp*** *(Beloved & Postmortem)* | Hyper-specific topic mastery badges + razor-fast 1v1 duels built fierce fandom. **Died from:** unsustainable ad/server unit economics, late-stage **energy/play limits**, and dead matchmaking queues in niche topics. | **Competence Identity** ("#1 in World History") (win) vs. **Energy-Lock Betrayal** (death). | Preserve deep domain mastery progression (12 L0 Domains in `questions.json` + Title Crests) while guaranteeing **instant, zero-wait play** via rich Campaign Rivals & deterministic Daily/Endless modes (never dead lobbies, never energy walls). |
| ***Trivia Crack*** *(Peak & Churn)* | Accessible board-game spin + social turns. **Churns from:** suffocating interstitial video ads (often after every wrong answer), pay-to-win power-ups, broken UGC Question Factory, and repetitive dumbed-down questions. | **Social Turn Friction** (friends stop replying) + **Monetization Fatigue** (feels like an ad casino, not an intellect test). | Zero ads between questions, zero pay-to-win hint currencies, zero UGC spelling errors. Every question is curated, edited, and paired with real 3D physicality rather than a spinning 2D cartoon wheel. |
| ***Jackbox / Trivia Murder Party*** | **The Killing Floor & Ghost Mechanic** — wrong answers trigger survival minigames; "dead" players stay active and can still steal victory in the finale. | **Anti-Snowballing / Failure as Content Generator** + **Tension-and-Release Sine Wave** (analytical trivia → reflex panic → dark comedic relief). | Never punish a missed question with a boring dead-end "Try Again" modal. Missing an Overclock fractures a Prism Shield, shifts lighting/audio into high-tension recovery, and queues a **Redemption Callback** so failure feeds future drama. |
| ***Kahoot!*** | Millisecond visual/audio feedback, ticking tempo, volatile comeback leaderboard, **Answer Streak multipliers**. | **Eustress (Euphoric Stress)** + **Streak Loss Aversion** + Self-Determination Theory (Autonomy, Competence, Relatedness). | Couple instant hit-stop feedback (`0.08s`), kinetic brass chimes, and **Streak Momentum** (`1.0x → 1.5x → 2.0x`)—especially in `GAUNTLET_SHATTER` rapid bursts—to balance *Millionaire*'s slow dread with explosive kinetic highs. |
| ***80 Days*** *(Inkle)* | Tactile rotating **3D Globe**, beat-by-beat "Blackjack" micro-choices instead of text walls, **narrative geography**, and **failure-as-detour** (missing a train launches a new storyline instead of Game Over). | **Spatial Embodiment** + **Continuous Momentum** (1–2 sentence punchy beats keep reading breathless). | Our `meridian_world_globe.glb` and 8-country *Meridian Circuit* campaign MUST treat geography as a playable strategic board, keeping story beats crisp (1–2 spoken sentences) and making campaign losses branch into underground Black Salons rather than brick walls. |
| **Modern Cult Trio: *The 1% Club*, *Only Connect*, *Half-Truth* & *TimeGuessr*** | *1% Club*: empirical public percentile ("10% question") + lateral logic. *Only Connect*: progressive 4-clue decay (5→3→2→1 pts). *Half-Truth* (Garfield & Jennings): push-your-luck multi-betting. *TimeGuessr*: continuous proximity scoring. | **Democratic Meritocracy** (anyone can deduce), **Uncertainty Management**, and **Partial-Credit Encouragement** ("Off by only 4 years!"). | Directly powers our **3-Tier Veritas Peel** (`3.0x → 2.0x → 1.2x`), **Calibrator Tolerance Cone** proximity scoring, and our Daily Share **"Top X% Mind"** calibration badge. |

---

### 1.2 Cognitive Neuroscience of Why Players Fall in Love With Great Trivia

Great trivia is not an academic test; it is a **precisely engineered neurochemical loop**. Five peer-reviewed behavioral & cognitive findings directly govern our design:

1. **Information Gap Theory & The "Tip-of-the-Tongue" (TOT) Itch (Loewenstein, 1994; Kang et al., 2009):**  
   Curiosity is not a vague trait—it is a state of *cognitive deprivation* triggered when a player becomes acutely aware of a narrow gap between what they know and what they want to know. fMRI scans using trivia questions (Kang et al., 2009) proved that high-curiosity TOT states ignite the **caudate nucleus** and **inferior frontal gyrus** (reward anticipation), making the answer reveal function neurologically like a primary reward (food/money).  
   *Design implication:* Questions that are **too obscure** create *zero* curiosity gap (the player feels nothing and guesses blindly). Questions pitched inside the **TOT zone**—where the player recognizes the domain and feels the answer *just* out of reach—maximize dopamine anticipation.

2. **Curiosity-Driven Hippocampal Encoding ("Cocktail-Party" Learning — Gruber et al., 2014):**  
   Neuroscientist Matthias Gruber demonstrated that high-curiosity trivia states trigger midbrain dopamine bursts directly linked to the **hippocampus**, putting the brain into a temporary "memory sponge" state where players retain both the trivia answer *and* surrounding narrative context far longer.  
   *Design implication:* The `whyExplanation` ("Micro-Aha!") shown right after resolution lands at the **exact peak of hippocampal receptivity**. If it simply repeats the question, we waste the moment. If it delivers a razor-sharp, surprising 1-sentence **"cocktail-party fact"** players want to repeat at dinner, *World's Smartest* becomes famous for making players *actually smarter*.

3. **The Hypercorrection Effect (Butterfield & Metcalfe, 2001):**  
   Counterintuitively, when people get a trivia question **wrong with high confidence**, the intense surprise violation focuses attention and makes them remember the true answer **dramatically better** than low-confidence mistakes—often unlocking latent partial knowledge ("OH, of course!").  
   *Design implication:* Our **Hold-to-Overclock** mechanic explicitly forces players to declare high confidence. When an Overclock backfires, the player's brain enters peak hypercorrection encoding. Logging that exact miss and surfacing an adjacent **Redemption Callback** 2–4 missions later turns their most memorable sting into their proudest vindication.

4. **Adaptive Flow Channel via 2PL Item Response Theory (Csikszentmihalyi; Duolingo "Birdbrain" Benchmark):**  
   Psychometric adaptive systems model win probability using 2-Parameter Logistic IRT:  
   $$P(\text{correct} \mid \theta, a, b) = \frac{1}{1 + e^{-a(\theta - b)}}$$  
   Empirical learning/game studies show players stay locked in **Flow** at a **70%–80% success rate**. Above ~90% triggers boredom; below ~55% triggers anxiety and churn. Because `godot/data/questions.json` *already* carries calibrated `irtB` (difficulty) and `irtA` (discrimination) on every question, *World's Smartest* can maintain a surgical Flow Channel across 20+ hours!

5. **Loss Aversion & Asymmetric Commitment (Kahneman & Tversky):**  
   Humans feel losses roughly **2× more acutely** than equivalent gains. Flat trivia has zero loss tension—missing a question just yields `+0`. Introducing **Streak Multipliers**, **Prism Shields**, **Overclock Backfires**, and **Safe-Haven Extraction Airlocks** makes every single button press carry genuine emotional weight.

---

### 1.3 Why Players Abandon Mediocre Trivia Apps (Market Churn Autopsy)

Industry benchmarks from GameAnalytics and Sensor Tower place mobile Puzzle/Trivia retention at:
- **Day 1:** ~25–28% median | **31–33%+ top quartile** *(D1 failure = weak FTUE or ugly/confusing first 60 seconds)*
- **Day 7:** ~4–5% median | **12–15%+ top quartile** *(D7 failure = repetitive 4-button fatigue or difficulty spikes)*
- **Day 30:** ~0.8–1.5% median | **5–7.5%+ top quartile** *(D30 failure = shallow question pool, ad/monetization burnout, or lack of daily habit loop)*

Synthesizing 1-star App Store / Google Play reviews and postmortems across *Trivia Crack*, *Trivia Star*, *Jeopardy! World Tour*, *QuizUp*, and *HQ Trivia* reveals the **7 Deadly Sins of Trivia Abandonment**:

1. **Unfair, Ungettable Obscurity:** Asking pure rote dates/statistics with no deductive foothold ("What was the population of X in 1912?"), causing helpless guessing instead of brainwork.
2. **Repetitive 4-Button Clicking Fatigue:** Identical visual template × identical input verb × 500 questions = hypnotic autopilot within 10 minutes.
3. **Ad Bloat & Animation Drag:** Forced interstitial ads, 4-second fake "spinning wheel" delays, and unskippable victory popups break Nielsen's **1.0-second thought-flow threshold** and turn 3 minutes of trivia into 2 minutes of waiting.
4. **Pay-to-Win & Energy-Gate Betrayal:** Charging "gold" to enter matches (*Jeopardy! World Tour*), selling answer-change power-ups, or locking hardcore players out via heart/energy timers (*QuizUp*'s late-stage death blow) destroys the core fantasy of *intellectual meritocracy*.
5. **Broken, Stale, or Insular Question Banks:** Typos, factual disputes, tiny looping banks (*Trivia Star*), or heavy US-only cultural bias (*Jeopardy! World Tour* alienating global Android/Web players).
6. **Sterile, Ugly, Generic 2D UI:** Dark HTML boxes, stock vector mascots, and flat gradients look disposable—failing to justify attention against prestige mobile games (*Monument Valley*, *The Room*, *Balatro*).
7. **Dead-End Snowballing & Zero Emotional Escalation:** Missing early questions with no comeback path or dramatic pacing variance turns sessions flat and joyless.

---

## Part 2: Untapped White Space — 8 Concrete Innovative 3D Trivia Mechanics

Mobile trivia is still overwhelmingly **2D flat cards**. Meanwhile, *Inscryption*, *Buckshot Roulette*, *Liar's Bar*, and *The Room* proved that anchoring a game to an **intimate 3D tabletop**—with weighted mechanical props, zero-HUD diegetic stakes, and an adversary watching from across the table—multiplies tension by an order of magnitude.

*World's Smartest* already has museum-grade 3D hardware in production (`veritas_astrolabe_orb.glb`, `calibrator_chronometer.glb`, `codex_cryptex.glb`, 4 sculpted global architectural chambers, and real Poly Haven scanned tabletop props: `desk_lamp_arm_01`, `chess_set`, `pocket_watch`, `magnifying_glass_01`, `book_encyclopedia_set_01`). Below are **8 concrete, buildable 3D trivia mechanics** that exploit this exact white space:

### 1. Progressive Clue-Peeling Deduction (*Only Connect* × Fabergé Astrolabe)
- **Beyond 4-Button Choice:** Every `SIGHTLINE_LOCK` question opens sealed inside the smooth gilded `veritas_astrolabe_orb.glb` at **Tier 1: Cold Instinct (`3.0x` multiplier)**—prompt + answer choices only.
- **Tactile Action:** Drag/tap **PEEL SEAL** to physically bloom open `Petal_0..5` with pneumatic brass ratchet Foley (`sfx_peel_open.wav`).
  - **Tier 1 → Tier 2 (`3.0x → 2.0x`):** Reveals `clues[0]` (**Lateral Bridge Clue**) as the inner `Crystal_Core` ignites warm gold.
  - **Tier 2 → Tier 3 (`2.0x → 1.2x`):** Reveals `clues[1]` (**Pinpoint Clue**) and **shatters/dissolves the lowest-plausibility decoy answers** (sorted by `distractors[].plausibility` in `questions.json`), leaving a razor-tense 2-option duel!
- **Why It's Addictive:** Replaces shameful "buy a 50/50 lifeline" tropes with a proud tactical question: *"How little intel do I need to solve this before the Chrono-Ring bleeds out?"*

### 2. Calibrated Confidence Wagering (*Millionaire* "Final Answer" × Hold-to-Overclock)
- **Beyond Binary Answering:** Selecting an answer is only Step 1; **declaring your conviction** is Step 2.
  - **Quick Tap (`≤0.20s` — Safe Lock):** Locks at current Peel Tier (`3.0x / 2.0x / 1.2x`) with standard miss penalty.
  - **Press & Hold (`0.30s → 1.00s` — Conviction Overclock):** Camera smoothly narrows FOV (`42° → 34°`) toward the Orb, `Caliper_0..3` clamp inward, `Crystal_Core` shifts incandescent molten gold, golden sparks surge off the table, and heartbeat/turbine Foley swells (`sfx_overclock_rise.wav`). Releasing slams `sfx_lock_thunk.wav` + haptic pulse for **+100% Payout (`6.0x` max on a Tier-1 Cold Overclock!)**.
  - **Tactile Flick-Cancel:** Second-guessing mid-charge? Slide thumb off/sideways before `1.00s` to vent steam cleanly (costs ~1.0s of clock).
  - **Real Stakes:** Missing an Overclock triggers **Crimson Backfire**—shattering a Prism Shield (or gifting your Rival momentum) AND logging the question into the **Hypercorrection Redemption Queue**.

### 3. Spatial / Timeline / Estimation Precision Cones (`calibrator_chronometer.glb`)
- **Beyond Binary Recall (*TimeGuessr* × *Wits & Wagers* × *Timeline*):** Numerical, chronological, geographic-distance, and magnitude questions (`CALIBRATOR_DIAL`, ~15% of pool) sweep the camera directly over the sculpted brass chronometer on the dark marble table.
- **Two-Axis Thumb Control:**
  - **Drag Horizontally:** Sweep the gilded `Chronometer_Needle` across the graduated brass bezel (e.g., Year `1750–1950`, Altitude `0–10,000m`, Distance `0–15,000km`).
  - **Drag Vertically (or Pinch):** Narrow or widen the translucent amber **Tolerance Cone** (`±2%` razor sliver up to `±20%` safety arc).
- **Non-Linear Precision Math:**
  - Exact Cone Hit scores `Base × (1.0 + 3.0 × (1.0 - cone_width_norm)²)`: a razor-tight `±3%` cone pays **3.8×**, whereas a wide `±18%` safety net pays **1.2×**.
  - **Near-Miss Grace:** Landing within `1.5×` outside your cone gives a **"Grazing Hit" (`0.35×` partial credit, preserves Streak/Shield)**—directly importing *TimeGuessr*'s anti-frustration encouragement ("Off by only 4 years!").

### 4. Dual-Ring Pairing & Cross-Question Chain Synthesis (`codex_cryptex.glb`)
- **Beyond Isolated Facts (*Connections* × *Only Connect* Wall):**
  - **3D Cryptex Pairing (`CODEX_DUAL_RING`, ~12–15% of pool):** The brass-and-walnut `codex_cryptex.glb` rises on the marble table. Players independently swipe counter-rotating rings to link **3 Subjects ↔ 3 Targets (+ 1 Plausible Red-Herring Decoy)** until golden laser conduits lock all three pairs.
  - **`CHAIN_SYNTHESIS` Meta-Puzzle (Campaign & Boss Mutator):** Across 3 rapid questions (e.g., Q1 answer = *Mercury*, Q2 = *Venus*, Q3 = *Mars* — or Q1 = *Geneva*, Q2 = *Vienna*, Q3 = *Nairobi*), Q4 asks for the **hidden lateral connection uniting Q1–Q3** (*UN Headquarters cities*, etc.) while the 3 solved brass tokens glow diegetically on the table rim!

### 5. Physical 3D Tabletop Object Inspection ("The Forensic Table" — *The Room* × *Inscryption*)
- **The Ultimate Mobile 3D Differentiator:** Every rival trivia app shows text on a flat background. *World's Smartest* places real photogrammetry Poly Haven artifacts right on the Vetting Chamber's dark marble & stitched-leather table (`pocket_watch`, `chess_set`, `magnifying_glass_01`, `book_encyclopedia_set_01`, plus unlocked venue relics like `armillary_orrery` and `master_ledger`).
- **Playable Mechanic (`HERO_ARTIFACT_SYNTHESIS` + Covert Salon Investigations):**
  - Between rounds in Mission 2/4 of each Country Hub (or during dedicated Forensic Bonus Prompts), a warm rim-light glint pulses on **one physical tabletop prop** (e.g., Julian Vance's `pocket_watch` or the mid-gambit `chess_set`).
  - Tapping the prop triggers a silky `0.55s` **Camera Inspection Cut** (`CAM_PROP_INSPECT`) where the player drags to orbit the 3D object under `desk_lamp_arm_01`'s Rembrandt beam (with optional `magnifying_glass_01` zoom overlay!).
  - Spotting a subtle diegetic clue—a chess fork setup (Sicilian Defense), a pocket-watch engraving (`1863 • SOLFERINO`), a leather book spine title, or a red-wax diplomatic seal—grants either the direct answer to a **Forensic Synthesis Question** OR banks a **Free Tier-2 Peel Token** for the upcoming Boss Showdown!

### 6. Fair, Deterministic Rival Bluff-Reading (*Liar's Bar* × *Ace Attorney*)
- **Zero-RNG Mind Games:** During Head-to-Head Rival Mind-Games and the `BLUFF_WAGER` mutator, your opponent isn't an invisible score counter—they sit across the table (alpha-matted cutout portrait + voiced audio + diegetic lock indicator on the table).
- **The 3 Rules of Fair Bluff-Reading:**
  1. **Consistent Per-Rival Profiles:** Every rival has learnable domain strengths, weaknesses, and tell patterns:
     - **Nadia Rostova (London):** High accuracy in Law/History; rarely bluffs, takes `7–10s` methodical locks. *Tell:* When cornered in Pop/Tech, her lock time stretches past `11s` and she subtly shifts posture/breathes sharply.
     - **Soren Takahashi (Tokyo):** Hyper-fast `3–5s` tempo pressure; frequently **Fake-Overclocks** in his weak domains (Arts/Literature) to intimidate you into rushing. *Tell:* Instant `<2.8s` Overclock on a high-`irtB` (`>1.2`) Humanities question = high probability bluff!
     - **Henrik Lindqvist (Geneva/Singapore):** Conservative institutionalist; almost never Overclocks unless `>85%` certain—EXCEPT when trailing in the final 2 questions.
     - **Julian Vance (Apex Arbiter):** Adaptive mirror who matches your exact Peel/Overclock rhythm until Phase 3.
  2. **Readable Micro-Tells:** Combine **lock-timing cadence** + **subtle audio breath/table-tap Foley** + **one-line voiced bark** (e.g., Soren's cocky speed brag).
  3. **"CALL BLUFF" Counter Window (`1.8s`):** When a rival locks an Overclock first in `BLUFF_WAGER` missions, a clean brass **"CALL BLUFF"** pill illuminates for `1.8s` (or before your lock). Calling correctly when the rival missed steals their entire Overclock bonus and shatters their Shield; calling wrong when they answered truthfully doubles their lead!

### 7. Push-Your-Luck Extraction Airlocks & Safe Havens (*Balatro* × *Press Your Luck* × *Millionaire*)
- **Solving Endless Mode Fatigue:** Endless trivia usually dies from boredom because nothing escalates except a linear counter (`Score: 14 → 15`).
- **The Extraction Airlock Loop (*The Archive Descent*):**
  - Every **5 questions**, the Vetting Chamber's ambient light shifts amber-gold and a physical **Brass Extraction Lever** rises on the table (`SAFE HAVEN REACHED`).
  - **Compounding Escalation Curve:**
    - Depth 1–5 (`1.0x` Archive Yield) → Airlock 1
    - Depth 6–10 (`1.5x` Yield, +1 Mutator active) → Airlock 2
    - Depth 11–15 (`2.25x` Yield, 5-Facet Prism) → Airlock 3
    - Depth 16–20 (`3.5x` Yield, High-IRT Vault) → Airlock 4
    - Depth 21+ (`5.0x` Sovereign Descent)
  - **The Greed vs. Safety Dilemma:** **EXTRACT NOW** banks 100% of accumulated Meridian Prestige XP, Archive Shards, and Leaderboard Depth safely. **DESCEND DEEPER** risks **50% of unbanked haul** if all 3 Prism Shields shatter before the next Airlock—creating genuine *Balatro*/*Millionaire* pulse spikes!

### 8. Hypercorrection "Redemption" Callbacks (Turning Mistakes Into Euphoria)
- **Science-Backed Comeback Loop:** Whenever a player misses a question—prioritizing **Overclock Backfires (2× priority weight)** because Butterfield & Metcalfe's Hypercorrection Effect proves those memories are seared deepest—`SaveManager` records `{qid, microTopicId, l2Subcategory, was_overclock, timestamp}` into a capped 12-slot `redemption_queue`.
- **The Payoff Beat:** Every 3rd Campaign Mission (or once per 10-question Endless run), the Host delivers a cool voiced provocation (*"You stumbled on Geneva neutrality earlier. Let's see if you actually learned."*), the Orb rims ignite **Gold-Crimson**, and the game serves a **fresh sibling/adjacent question** from the same `l2Subcategory` (or an inverted-angle re-test of the concept).
- **Vindication Reward:** Solving a Redemption Callback restores **+1 shattered Prism Shield** (or grants **`+1.5x` Vindication Multiplier**) and visibly crosses the scar off your Dossier—transforming earlier humiliation into one of the most memorable moments in the game.

---

## Part 3: 10 Concrete, Buildable Design Mandates for *World's Smartest* (Godot 4.7.2)

> **Directive for `@godot-aaa-director`, `@campaign-20hr-writer`, and `@qa-art-critic` (Gate 3 Audit):**  
> Every mandate below is concrete, measurable, and directly implementable using our existing Godot 4.7.2 architecture, `questions.json` schema, and `campaign_20hr.json` campaign pipeline.

---

### MANDATE 1: The 6-Beat Emotional Question Curve & Exact Timing Targets
Mobile players read silently at **~200–240 WPM (~3.5–4.0 words/sec)**, experience delays `<0.1s` as instantaneous, lose thought-flow past `1.0s` of unexplained silence (Nielsen/Miller thresholds), and quit immediately if animations feel sluggish. Every standard question MUST execute this exact 6-beat choreography:

| Beat | Phase Name | Exact Timing Target | Visual, Camera, Audio & Input Rules (Godot 4.7.2) |
| :--- | :--- | :--- | :--- |
| **1** | **HOOK** *(Stem Read)* | **`0.00s → 1.40s` grace** *(total read ~2.4s)* | Prompt fades in (`0.18s` cubic ease-out, **2 lines max, ≤125 chars**). **Chrono-Ring DOES NOT DRAIN for the first `1.20s` (Reading Grace Window)** so thoughtful players aren't punished for reading carefully! Orb rotates smoothly into neutral idle. |
| **2** | **DEDUCTION** *(Spin / Peel / Dial)* | **`1.20s → 17.20s`** *(16s `SIGHTLINE`, 20s `CALIBRATOR`/`CODEX`, 8s/item `GAUNTLET`)* | Chrono-Ring drains smoothly clockwise. Dragging the Orb fires `<0.05s` tactile response + `sfx_spin_tick.wav` every detent. **PEEL SEAL** blooms `Petal_0..5` in **`0.42s`** (ease-out-back) and reveals Clue 1 (`2.0x`) / Clue 2 + decoy shatter (`1.2x`). At **`4.0s` remaining**, ambient rim shifts warm amber and subtle heartbeat pulse enters (`-12 dB → -6 dB`). |
| **3** | **RISK COMMIT** *(Safe Lock vs. Overclock)* | **Safe:** `≤0.20s` tap<br>**Overclock:** `0.30s → 1.00s` hold | **Safe Lock:** instant brass *clack*. **Hold-to-Overclock:** over `0.70s`, Camera FOV smoothly narrows `42° → 34°`, `Caliper_0..3` clamp inward, `Crystal_Core` emission climbs `1.0 → 2.6`, `sfx_overclock_rise.wav` pitches up, mobile haptics ramp (`Input.vibrate_handheld`). Sideways flick before `1.00s` cancels cleanly. Release fires `sfx_lock_thunk.wav`. |
| **4** | **SUSPENSE PAUSE** *("Final Answer Breath")* | **Safe Lock:** `0.35s`<br>**Overclock:** `0.75s`<br>**Boss / Final Q:** `1.15s`<br>*(HARD CAP: `≤1.25s`)* | Music abruptly ducks `-14 dB` (Millionaire silence trick), single low sub-bass heartbeat *THUMP* plays at `t+0.15s`, `Crystal_Core` holds suspended pulse. **Never exceed `1.25s`**—beyond that, mobile users perceive lag rather than drama. |
| **5** | **EUPHORIC PAYOFF / BACKFIRE** | **Hit-stop:** `0.08s`<br>**Burst:** `0.65s` | **`0.08s` crisp hit-stop** before impact burst. **Correct:** emerald-gold core bloom, rising golden `CPUParticles3D` sparks off the table, brass harmonic chord, score roll-up (`0.45s`), streak flame tick. **Wrong/Backfire:** crimson core fracture, micro camera trauma shake (`0.018m` damped `0.25s`), glass-crack Shield break (if Overclocked), correct option cleanly highlighted in soft gold. |
| **6** | **MICRO-AHA!** *(Cocktail-Party Fact)* | **Hold:** `1.80s–3.20s` auto / **Tap-Skip unlocked at `0.60s`** | Sleek translucent bottom card reveals `whyExplanation` (**≤130 chars, 2 lines max**). **Veteran Speed Rule:** Tapping anywhere after **`0.60s`** immediately advances to next question (`0.22s` transition) so fast players NEVER wait on slow menus—while curious players can linger or tap `[+ Dossier]` freely! |

**Total Target Tempo:** **14–22 seconds per standard question** (a 7-question Daily *Global Feed* finishes in a crisp **2.2–3.0 minutes**—the exact *Wordle*/*Connections* coffee-break sweet spot!).

---

### MANDATE 2: The "Pinning, Two-Path Gettability & Psychometric Distractor" Writing Standard
For `@campaign-20hr-writer` and the 3,000+ question generator/validator (`questions.json`):
1. **Strict Brevity Caps (Mobile First):**
   - `prompt`: **≤125 characters (~16–22 words)** — guarantees 2–3 clean lines at `≥18sp` on 9:16 Android portrait with zero vertical scrolling.
   - `answerCorrect` & `distractors[].text`: **≤26 characters** — fits cleanly inside bottom glass Answer Pills without ellipsis truncation.
   - `clues[0]` & `clues[1]`: **≤95 characters each** — instant scan mid-timer.
   - `whyExplanation`: **≤140 characters** — MUST deliver a **surprising "cocktail-party" insight** (a twist, etymology, irony, or vivid origin) rather than lazily repeating the prompt!
2. **Pinning & Two-Path Gettability Rule:** Every prompt MUST contain `[Broad Context] + [Unambiguous Unique Pivot]` so there is **zero factual ambiguity** and **two mental paths** to deduce it (direct recall OR lateral reasoning via `clues[0]`).
3. **Psychometric Distractor Rules:**
   - **Homogeneity:** All options MUST match grammatical form, tense, and rough length (preventing "longest answer is right" test-taking exploits).
   - **1-Step Proximity & Misconception Traps:** Distractors MUST sit in the same semantic neighborhood (e.g., sibling treaty, neighboring century, famous misconception) with calibrated `plausibility` (`0.55–0.92`) so **Tier-3 Peel** reliably eliminates the weakest distractors while keeping the single deadliest rival option alive for a dramatic final 50/50!
4. **Global Cosmopolitan Tone:** Zero insular US-only trivia in the `GLOBAL` pool (state trivia, domestic cable TV, local college sports are BANNED from `GLOBAL`; regional culture lives inside explicit country tags `CH`, `GB`, `JP`, `BR`, `EG`, `IS`, `SG` and remains deducible by an international audience).

---

### MANDATE 3: 2PL IRT Adaptive Flow-Channel Engine (`TriviaDB` Selector)
`@godot-aaa-director` MUST wire the existing `irtB` and `irtA` attributes in `godot/data/questions.json` to a lightweight persistent player ability estimate `player_theta` (initialized at `0.0`, updated per question via simplified Elo/IRT step: `theta += 0.18 * (actual - P_expected)` clamped `[-2.5, +2.5]`):
- **Match Emotional Wave (Target `P(correct)` per slot in a 5–7 question match):**
  - **Q1 — Confidence Opener:** Target `P ≈ 0.85` (`irtB ≈ theta - 1.2`). Hooks competence immediately, lights up Streak `1x`.
  - **Q2–Q4 — Flow Channel:** Target `P ≈ 0.72–0.78` (`irtB ≈ theta - 0.5 .. -0.2`). Classic TOT tension; invites strategic Tier-2 Peels and selective Overclocks.
  - **Q5–Q6 — Prestige Escalation:** Target `P ≈ 0.62–0.68` (`irtB ≈ theta + 0.1 .. +0.4`). Genuine sweat; rewards lateral deduction.
  - **Final Q (Boss / Climax):** Target `P ≈ 0.52–0.60` (`irtB ≈ theta + 0.5 .. +0.8`). Peak drama; demands composure or a Tier-2 Peel.
  - **Anti-Tilt Recovery Override:** If the player suffers **2 consecutive misses** or **shatters a Shield on an Overclock Backfire**, the next non-Boss question temporarily eases target to **`P ≈ 0.82`** (`irtB ≈ theta - 1.0`) to restore agency and prevent rage-quits!

---

### MANDATE 4: Strict Archetype Rotation Rule (Zero 4-Button Fatigue)
To kill the #1 killer of trivia apps (mindless 4-button clicking):
- **Hard Rule:** **NEVER serve more than 2 consecutive `SIGHTLINE_LOCK` questions** in any Campaign Mission, Daily Broadcast, or Endless run.
- **Standard 7-Question Daily *Global Feed* Mix:**
  - `Q1`: `SIGHTLINE_LOCK` (Opener, `P ≈ 0.85`)
  - `Q2`: `CALIBRATOR_DIAL` (Precision Chronometer Estimation)
  - `Q3`: `SIGHTLINE_LOCK` (Peel/Overclock Deduction)
  - `Q4`: `CODEX_DUAL_RING` (3-Pair Cryptex Synthesis)
  - `Q5`: `GAUNTLET_SHATTER` (Rapid 3-Plaque Kinetic Swipe Blitz — Kahoot adrenaline spike!)
  - `Q6`: `SIGHTLINE_LOCK` (High-IRT Thriller Question)
  - `Q7`: `HERO_ARTIFACT_SYNTHESIS` or Boss `CALIBRATOR_DIAL` / `SIGHTLINE_LOCK` Climax (`P ≈ 0.55`)
- **Campaign Mission Mix (`campaign_20hr.json`):** Every 5-mission Country Hub MUST showcase all 4 hardware morphs + at least 1 `HERO_ARTIFACT_SYNTHESIS` Forensic Inspection beat + distinct Mutators so no two consecutive missions share the same mechanical rhythm.

---

### MANDATE 5: Tactile 3D Tabletop Forensic Inspection ("The Room" Beat)
Make the 3D Vetting Chamber table *playable*, not wallpaper:
- In `@godot-aaa-director`'s Chamber scene, make at least **4 real Poly Haven tabletop props** (`pocket_watch`, `chess_set`, `magnifying_glass_01`, `book_encyclopedia_set_01`) interactive during **Covert Salon / Investigation Missions** (Missions #2 and #4 of each Country Hub) and **Briefing Room** inspections.
- **Mechanic:** A subtle warm gold glint (`emissive pulse 0.25`) draws the eye to one tabletop artifact before the match or on a `HERO_ARTIFACT_SYNTHESIS` prompt. Tapping smoothly cuts the camera (`0.55s`) into close-up inspection (`CAM_PROP_INSPECT`), letting the player rotate/inspect the 3D mesh to uncover a diegetic text/engraving clue (`clue_plate`) that awards **+1 Free Tier-2 Peel Token** (no multiplier penalty!) or unlocks a hidden forensic answer choice.

---

### MANDATE 6: Fair, Readable Rival Bluff-Reading & Mind-Games
For `BLUFF_WAGER` missions and Head-to-Head Showdowns (Mission #3 & #5 of each Hub):
- Store explicit deterministic personality parameters per Rival in `campaign_20hr.json`: `{strong_domains, weak_domains, base_lock_sec, bluff_rate_weak, tell_type}`.
- **Diegetic Telemetry:** Display a sleek, minimal Rival Status Line (e.g., `SOREN • ANALYZING...` → `LOCKED 3.4s • OVERCLOCK!`) paired with subtle audio breath/chair-shift Foley and portrait micro-reaction.
- **Fair Skill Counterplay:** Whenever a rival commits an Overclock first in `BLUFF_WAGER`, expose a **`CALL BLUFF`** button for **`1.80s`** (or until the player locks). Calling a genuine bluff triggers a dramatic *Ace Attorney*-style shatter sound, steals `+500` prestige momentum, and voices a rattled rival line—rewarding attentive players who track rival domain weaknesses and timing tells!

---

### MANDATE 7: Hypercorrection `RedemptionManager` (Memory-Backed Callbacks)
Implement a lightweight persistent queue in `SaveManager` (`redemption_queue`, max 12 entries):
1. Any wrong answer pushes `{qid, microTopicId, l2Subcategory, priority: was_overclock ? 2 : 1}` into `redemption_queue`.
2. Every **3rd Campaign Mission** (or Question #8 of every 10-question Endless tier), if `redemption_queue` is non-empty, pop the highest-priority entry and pull a fresh sibling question sharing `l2Subcategory` (or `microTopicId` fallback) that the player hasn't solved yet.
3. Frame the question with a **`REDEMPTION CALLBACK`** gold-crimson banner, cool Host VO cue, and award **`+1.5x` Vindication Multiplier + Restore 1 Shattered Shield** on a correct solve!

---

### MANDATE 8: Push-Your-Luck Safe Havens & Extraction Airlocks
In **Endless (*The Archive Descent*)** and **3-Phase Boss Showdowns**:
- Every **5 questions** in Endless, open the **Extraction Airlock** overlay over the amber-lit Chamber table showing:
  - **Secured Bank** vs. **At-Risk Unbanked Vault**
  - **Next Tier Multiplier Escalation** (`1.0x → 1.5x → 2.25x → 3.5x → 5.0x`) + Preview of next active Mutator
  - Two bold tactile actions: **`EXTRACT & BANK`** (safe prestige lock-in) vs. **`DESCEND DEEPER`** (risks 50% of unbanked haul if Shields hit 0, with rising bass drone & haptic thud).
- In 3-Phase Campaign Bosses, Phase 2 → Phase 3 offers a dramatic **Double-or-Nothing Gamble** (`DOUBLE_OR_NOTHING` mutator) when trailing, giving underdogs a clutch *Trivia Murder Party* comeback path.

---

### MANDATE 9: Viral Zero-Leakage Daily Share Card (*The Global Feed*)
Every completed Daily *Global Feed* run MUST display a prominent **`COPY RESULT CARD`** button backed by `DisplayServer.clipboard_set(text)` + Web JS `navigator.clipboard.writeText` fallback, generating this exact **spoiler-free** share format (optimized for SMS, WhatsApp, X, and Discord):

```text
WORLD'S SMARTEST · Global Feed #2026-11-21
Top 6% Mind · 14,850 pts · Streak 6🔥

Q1 🔮 3.0x ⚡  (Cold Overclock)
Q2 🧭 ±2%  🎯  (Chronometer Bullseye)
Q3 🔮 2.0x ✓   (1 Peel)
Q4 🔐 3/3  ✓   (Cryptex Sync)
Q5 💥 3/3  ⚡  (Gauntlet Sweep)
Q6 🔮 1.2x ✓   (2 Peels)
Q7 🏆 6.0x ⚡  (Boss Cold Overclock!)

🛡️ 3/3 Shields · Play: worldssmartest.game
```

**Why this format goes viral:**
- **Zero Semantic Leakage:** Not a single trivia word, category, or answer is spoiled.
- **High-Status Telemetry:** Shows *how* you won (did you Cold Overclock `⚡`, Peel twice `1.2x`, hit a `±2%` Chronometer bullseye `🎯`, or suffer a Crimson Backfire `💥❌`?).
- **Empirical Prestige Hook (*The 1% Club* DNA):** Displays an estimated global percentile (`Top 6% Mind`) derived from the player's IRT score vs. expected population distribution, daring friends to beat it!

---

### MANDATE 10: The Anti-Bloat & Ethical Respect Charter (Zero Dark Patterns)
To permanently differentiate *World's Smartest* from the 1-star uninstall graveyard of *Trivia Crack*, *Trivia Star*, and *Jeopardy! World Tour*:
1. **ZERO Forced Energy / Lives Lockouts:** Players can play Campaign, Endless, and Briefing Room as long as they want. Losing a mission triggers instant retry or narrative branch—never a "Wait 30 minutes or pay $1.99" wall.
2. **ZERO Pay-to-Win Answers or Power-Ups:** Every player faces the same fair Veritas Peel (`3.0x → 2.0x → 1.2x`) and Overclock rules; intellect and nerve decide every match.
3. **ZERO Interstitial Ad Interruptions or Slow Fake Animations:** No 4-second wheel spins, no forced unskippable score tallies (tap-to-skip unlocked at `0.60s` on Micro-Aha! and `0.85s` on Round Summary).
4. **Honest Single-Player & Async Integrity:** Rivals in the 40-mission Campaign are proud, voice-acted, personality-driven thriller characters—never deceptive fake bots pretending to be human matchmaking.

---

## Gate 3 QA Verification Matrix (For `@qa-art-critic`)

`@qa-art-critic` will audit `@godot-aaa-director` and `@campaign-20hr-writer` against these concrete binary checks:

| Check ID | Owner | Auditable Acceptance Criterion | Pass / Fail Test |
| :--- | :--- | :--- | :--- |
| **R1-01** | `@godot-aaa-director` | **Reading Grace + 6-Beat Timing:** Chrono-Ring holds `1.20s` before draining; Hold-to-Overclock ramps `0.30s–1.00s` with FOV narrow + caliper clamp; Suspense Pause is dynamic (`0.35s / 0.75s / 1.15s`, `≤1.25s`); Micro-Aha! tap-skip unlocks at `0.60s`. | Code + timer constant audit in match controller script. |
| **R1-02** | `@campaign-20hr-writer` & DB | **Brevity & Gettability Standard:** `>=98%` of `questions.json` prompts `≤125 chars`, answer options `≤26 chars`, 2 progressive clues present, `plausibility` scores populated, and surprising `whyExplanation` (`≤140 chars`) on every row. | Automated validation script report (`0` schema errors). |
| **R1-03** | `@godot-aaa-director` | **2PL IRT Adaptive Flow Selector:** `TriviaDB` tracks `player_theta`, computes 2PL probability using `irtB`/`irtA`, shapes Q1 opener (`P≈0.85`) → Flow (`0.75`) → Boss (`0.55`), and triggers Anti-Tilt recovery (`0.82`) after 2 misses. | Unit/self-test verification of IRT selection curve. |
| **R1-04** | `@godot-aaa-director` & `@campaign-20hr-writer` | **Archetype Rotation:** Daily 7-question broadcast and Campaign missions NEVER fire `>2` consecutive `SIGHTLINE_LOCK` prompts; all 4 morphs (`SIGHTLINE`, `CALIBRATOR`, `CODEX`, `GAUNTLET`) + `HERO_ARTIFACT_SYNTHESIS` are playable. | Inspect `campaign_20hr.json` `morph_mix` + Daily generator self-test. |
| **R1-05** | `@godot-aaa-director` | **3D Tabletop Prop Inspection:** Poly Haven tabletop artifacts (`pocket_watch`, `chess_set`, `magnifying_glass_01`, `book_encyclopedia_set_01`) support inspectable focus/glint interaction feeding forensic clues or Free Peel tokens. | Scene tree + interaction script check. |
| **R1-06** | `@godot-aaa-director` & `@campaign-20hr-writer` | **Fair Rival Bluff-Reading:** Rivals carry deterministic domain/timing profiles in `campaign_20hr.json`, surface visible lock-speed/posture tells, and expose a `1.80s` `CALL BLUFF` counter window during `BLUFF_WAGER`. | Inspect rival profiles + `BLUFF_WAGER` handler. |
| **R1-07** | `@godot-aaa-director` | **Hypercorrection Redemption Queue:** Missed questions (2× weight on Overclock Backfire) persist in `redemption_queue` and trigger `+1.5x` Vindication / Shield-restore Callbacks. | Inspect `SaveManager` / `RedemptionManager` logic. |
| **R1-08** | `@godot-aaa-director` | **Endless Extraction Airlocks:** Every 5th Endless question opens Safe-Haven `EXTRACT & BANK` vs. `DESCEND DEEPER` (`1.0x → 1.5x → 2.25x → 3.5x → 5.0x`) with 50% unbanked risk. | Inspect Endless controller state machine. |
| **R1-09** | `@godot-aaa-director` | **Zero-Leakage Daily Share Card:** One-tap copy button works via `DisplayServer.clipboard_set` + Web JS bridge and outputs exact spoiler-free emoji/percentile format with zero leaked prompt text. | Self-test output of `format_daily_share_card()`. |
| **R1-10** | All | **Zero Dark Patterns:** Zero energy timers, zero pay-to-win hint walls, zero unskippable inter-question bloat. | Full UI & loop inspection. |

---

## Primary Empirical & Industry Sources Synthesized
- **Cognitive Neuroscience & Psychometrics:** Loewenstein, G. (1994), *The Psychology of Curiosity: Information Gap Theory*; Kang, M. J. et al. (2009), *The Wick in the Candle of Learning: fMRI Reward Circuitry of Trivia Curiosity*; Gruber, M. J. et al. (2014), *States of Curiosity Modulate Hippocampus-Dependent Learning via the Dopaminergic Circuit* (Neuron); Butterfield, B. & Metcalfe, J. (2001), *Errors Committed with High Confidence Are Hypercorrected* (JEP:LMC); Kahneman, D. & Tversky, A., *Prospect Theory / Loss Aversion*; Csikszentmihalyi, M., *Flow Theory*; Duolingo *Birdbrain* 2PL IRT adaptive modeling.
- **Game Design & Market Case Studies:** NYT Games (*Wordle*, *Connections* / Wyna Liu); *Jeopardy!* clue pinning & Ken Jennings / Richard Garfield (*Half-Truth*); *Who Wants to Be a Millionaire* (David Briggs, Keith & Matthew Strachan audio pacing); *The 1% Club*; BBC *Only Connect*; *Wits & Wagers*; *Timeline*; *TimeGuessr* / *GeoGuessr* / *Framed*; Jackbox *Trivia Murder Party*; *Kahoot!*; Inkle *80 Days* (Meg Jayanth, Jon Ingold); *Inscryption*; *Buckshot Roulette*; *The Room*; *Liar's Bar*; *Ace Attorney*; *Balatro*.
- **Mobile Retention & UX Benchmarks:** GameAnalytics & Sensor Tower Mobile Casual/Puzzle Retention Benchmarks (D1/D7/D30 quartiles); Nielsen Norman Group Response Time Limits (`0.1s / 1.0s / 10s`); App Store / Google Play churn analysis for *Trivia Crack*, *Trivia Star*, *Jeopardy! World Tour*, *QuizUp*, and *HQ Trivia*.
