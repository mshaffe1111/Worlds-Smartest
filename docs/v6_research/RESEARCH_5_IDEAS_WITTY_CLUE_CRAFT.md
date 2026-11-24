# World's Smartest v6.0 — Deep Research & 5-Idea Matrix: Witty Prime-Time Clue Craft

**Author:** Principal Comedy Trivia Head Writer (`v6-witty-playwright`)  
**Target Deliverables:** `public/data/v6/prime_time_witty_clues_v6.json` (`2,500+` bespoke `CalibratedClueV6` entries, `qid` `1280000..1282999`) & `scripts/v6_verify_witty_pack.py`

---

## 1. Forensic Autopsy: Why `v5.0` Clues Felt Robotic & Unfun

Inspecting `public/data/curated_v4_witty_pack.json` and the raw `v4`/`v5` shard outputs exposed six root failures that killed joy on stage:

1. **Encyclopedia-Lead Phrasing:** Prompts like *"Which English king sealed Magna Carta?"* read like a 1998 Quizlet deck. There is no hook, no mental image, and no smile.
2. **Scrolling Paragraph Clues:** Multiple v4/v5 prompts ran `160–185` characters (e.g., *"In 1788, Habsburg soldiers reportedly mistook their own multilingual comrades for Ottoman raiders after a schnapps brawl, sparking a chaotic nighttime rout named for what town?"*), forcing phone players to scroll and killing live-broadcast pace.
3. **Database Template Fatigue:** Repeating `"Which X is known for..."` and `"In what year did..."` trained players to perceive an SQL table rather than a live prime-time host.
4. **Difficulty Whiplash:** Stage 1 served obscure 7th-century battles and 1788 Habsburg skirmishes next to grade-school planet questions—destroying the `★ 1.0 → ★ 10.0` campaign climb.
5. **Single-Format Starvation:** Clues were conceived only as 4-button multiple choice, starving v6.0's physical 3D toys (*Cut 3 Wrong Bomb Wires*, *3D Relief Globe Pin-Drop*, *3D Brass Cryptex*, *Yodel Cliffhanger*, *2-Paddle DIS OR DAT*, *Chronology Snap*, *Spot the Host's Lie*) of bespoke, hand-crafted payloads.
6. **AI-Smelling Aftermath Copy:** Explanations either dragged into earnest textbook paragraphs or drifted toward synthetic filler prose.

---

## 2. Five-Idea Matrix: Five Distinct Human Comedy-Trivia Schools

To kill tunnel vision and guarantee zero AI templates, we researched and stress-tested **five classic human television/game-show clue-writing schools**:

| # | School & Real-World Masters | Core Mechanic | Where It Shines in `v6.0` | Failure Mode (What We Kill) | Verdict |
|---|---|---|---|---|---|
| **1** | **High/Lowbrow Collision** (*You Don't Know Jack*, *Taskmaster*) | Slam prestige history, science, or fine art headfirst into mundane everyday annoyance, petty gossip, or sharp pop-culture framing. | Stage `01–04` crowd-pleasers, *Cut 3 Wrong Bomb Wires*, *2-Paddle DIS OR DAT* (`IKEA Shelf or Metal Band?`, `Cheese or Font?`). | Forced edgy snark, perishable slang, or jokes that bury the actual question verb. | **ADOPT (Core Voice — 25% lead)** |
| **2** | **Counter-Intuitive Truth** (*QI*, *No Such Thing as a Fish*) | Flip an everyday assumption with a 100% verifiable "Wait—seriously?!" fact (e.g., Oxford predates the Aztecs; Nintendo started in 1889; bananas are berries). | *Yodel Mountain Cliffhanger* / *Rotary Safe Dial*, *4-Rung Chronology Snap*, *Spot the Host's Lie*, `wittyHostAside` payoffs. | Smug "well, actually..." pedantry or unfair semantics gotchas. | **ADOPT (Core Engine — 25% lead)** |
| **3** | **Lateral Two-Step Click** (*Only Connect*, cryptic crosswords, *Jeopardy!* Double) | Connect two familiar domains so the player earns a genuine **"AHA!"** deduction rather than pure trivia-bowl recall. | Mid-to-late stages (`★ 5.5 → ★ 10.0`), *3D Brass Cryptex* (`4–8` letter locks), *4-Clue Cascading Jackpot*. | Unfairly opaque riddles in early stages where players need snappy momentum. | **ADOPT (Escalation Engine — 20% lead)** |
| **4** | **Deadpan Broadcast Bluff** (*Wait Wait... Don't Tell Me!*, *Would I Lie to You?*) | Deliver an outrageous fact straight-faced—or hide **one surgical, plausible lie** inside a rock-solid sentence so the player's BS detector fires. | *Spot the Host's Lie* (`corruptedLieWord`), *Two Truths & A Sabotage*, plausible decoy wires (`wrongWireIndices`). | Ambiguous lies where two words could arguably be wrong, or silly throwaway distractors. | **ADOPT (Twist & Bluff Engine — 15% lead)** |
| **5** | **Concrete 12-Word Stage Hook** (*Jeopardy!* Masters, *Who Wants to Be a Millionaire* hot-seat) | Lead with one vivid physical object, sensory cue, or absurd constraint; end with a crisp verb; save the laugh for the post-reveal `wittyHostAside`. | **Universal structural spine** enforcing the `<= 135` char zero-scroll rule across all 100 Toys, especially *3D Relief Globe* & *Rapid Blitzes*. | Dryness if stripped of voice—must always pair with a human angle from Schools 1–4. | **ADOPT (Structural Spine — 15% lead + 100% length discipline)** |

### What We Ruthlessly Killed
- **Killed Idea A — "Pun-Every-Line Dad-Joke Pack":** Relentless puns feel exhausting after 5 questions and scream synthetic wordplay. Real comedy writers vary rhythm: deadpan, observational, absurd, and sharp.
- **Killed Idea B — "Wikipedia-First-Sentence Remixer":** Taking encyclopedic definitions and slapping a quirky prefix (`"Fun fact! ..."`) onto them still smells like a database. Every clue is authored from the *human angle* first.
- **Killed Idea C — "Trivia-Bowl Obscurity = Difficulty":** Making Stage 10 hard by asking for the 14th vice president's middle name is boring. High-difficulty `v6.0` clues (`★ 8.0–10.0`) stay genuinely intriguing—lateral science, wild geopolitical quirks, deep art/music/literary twists, and razor-close distractors.

---

## 3. Non-Negotiable Anti-AI & Zero-Scroll House Rules

Every single entry in `public/data/v6/prime_time_witty_clues_v6.json` is audited by `scripts/v6_verify_witty_pack.py` against these hard laws:

1. **Zero AI Tells (Hard Regex Reject):** Zero occurrences of `delve`, `tapestry`, `testament`, `vibrant`, `realm`, `beacon`, `unveil`, `embark`, `intricate`, `bustling`, `pivotal`, `paramount`, `whimsical`, `symphony of`, `mosaic of`, `rich history`, `stands as a`, `nestled in`, `renowned for`, `captivated audiences`, `indelible mark`, `ever-evolving`, `groundbreaking`, `game-changer`, `not only`, `fascinatingly`, `remarkably`, `interestingly`, `in a world where`.
2. **Zero Dry Database Templates:** Zero prompts starting with `"Which entity is associated with"`, `"Identify the"`, `"Select the correct"`, `"Which of the following"`, or robotic un-angled `"In what year was..."` stubs.
3. **Strict Zero-Scroll Phone Budget:** Every `prompt` is **`<= 135` characters** (sweet spot `55–118` chars) so it fits inside the top `22%` frosted header at `390x660` portrait AND `660x340` landscape without ever scrolling or truncating.
4. **Punchy Post-Reveal Tag (`wittyHostAside`):** Every clue carries a human **`<= 14`-word** punchline delivered *after* reveal—dry, surprising, or cheekily reinforcing the answer without lecturing.
5. **Plausible Parallel Distractors:** All 4 choices match grammatical form, specificity, and approximate character length; `wrongWireIndices` explicitly tags all 3 tempting decoys so *Cut 3 Wrong Bomb Wires* creates genuine sweat.
6. **Smooth `★ 1.0 → ★ 10.0` Campaign Curve (All 10 Stage Worlds):**

| Stage World | Difficulty Band | `difficultyBadge` | `fameScore` | Target Share (`2,500+`) | Tone & Player Feeling |
|---|---|---|---|---|---|
| 01 Vaudeville Palace | `★ 1.0–1.9` | `WARMUP` | `0.86–0.99` | `~250+` | Breezy instant grins: everyday food, hit movies, iconic animals, household legends |
| 02 Geneva Conservatory | `★ 2.0–2.9` | `EASY` | `0.78–0.94` | `~250+` | Clever angles on landmarks, chart-toppers, famous inventions & sports icons |
| 03 Monte Carlo Salon | `★ 3.0–3.9` | `EASY` | `0.70–0.88` | `~250+` | Playful pub-quiz sweet spot: surprising truths about familiar things |
| 04 Cartographic Rotunda | `★ 4.0–4.9` | `CONTENDER` | `0.60–0.82` | `~250+` | World-traveler wit: borders, cuisine, cinema, quirky history, globe pin-drops |
| 05 Analog Bunker 1969 | `★ 5.0–5.9` | `CONTENDER` | `0.50–0.75` | `~250+` | Cold-War espionage, tech lore, lateral two-step connections, tricky bluffs |
| 06 Kyoto Lacquer Pavilion | `★ 6.0–6.9` | `SHARP` | `0.42–0.68` | `~250+` | Worldly arts, physics/biology mechanisms, mind-bending timelines |
| 07 Carnival Curiosities | `★ 7.0–7.9` | `SHARP` | `0.34–0.60` | `~250+` | Counter-intuitive QI gems, razor-close distractors, sneaky host lies |
| 08 Sunken Bathysphere | `★ 8.0–8.9` | `CHAMPIONSHIP` | `0.25–0.50` | `~250+` | Championship *Jeopardy!* / *Only Connect* caliber with genuine flair |
| 09 Astral Observatory | `★ 9.0–9.4` | `CHAMPIONSHIP` | `0.18–0.42` | `~250+` | Fierce synthesis across astrophysics, linguistics, classical lore, economics |
| 10 Sovereign Colosseum | `★ 9.5–10.0` | `LEGEND` | `0.12–0.35` | `~250+` | Grand-Master finals: wickedly clever, still witty, never dry trivia-bowl dust |

---

## 4. Multi-Toy Coverage Blueprint (`qid` `1280000 .. 1282999`)

All `2,500+` clues populate native `CalibratedClueV6` fields inside the `1,310,720`-bit `SeenQuestionBitsetLedger` window (`qid` `1280000..1282999`) across all 12 canonical domains (`0..11`) and all 10 Toy Families:

- **`wrongWireIndices` + `wittyHostAside` + `progressiveHints`:** `100%` of clues (`2,500+`).
- **`geoTarget` (`lat`, `lng`, `regionHint`, `landmarkLabel`):** `300+` iconic & surprising global pins (from Machu Picchu and Petra to Point Nemo, Svalbard Seed Vault, Lake Hillier, and the Darien Gap) for the *3D Shaded-Relief Globe*.
- **`cryptexWord` (`4–8` uppercase `A–Z` letters):** `600+` clues whose target unlocks the *3D Brass Cryptex*, *Airport Split-Flap*, and *Anagram Rail*.
- **`numericTarget` + `numericMin`/`numericMax`/`numericUnit`:** `400+` verified numbers, years, records, and astonishing scales for *Yodel Cliffhanger*, *Rotary Vault Safe-Cracker*, *Higher/Lower*, and *Brass Balance Scale*.
- **`chronologyItems` (4 ordered milestones):** `250+` genuine *"Wait, THAT came first?!"* timelines for *4-Rung Chronology Snap*.
- **`binaryPair` (2 buckets × 6 rapid items):** `250+` hilarious, fast-twitch *2-Paddle DIS OR DAT* & *Conveyor Sorter* blitzes.
- **`corruptedLieWord` (`sentenceWithLie`, `lieToken`, `truthCorrection`):** `300+` surgical single-word lies for *Spot the Host's Lie* & *Polygraph Needle*.
