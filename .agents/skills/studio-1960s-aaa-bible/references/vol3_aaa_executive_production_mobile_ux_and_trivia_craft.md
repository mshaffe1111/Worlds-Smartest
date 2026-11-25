# Volume 3: AAA Game Studio Executive Production, Mobile/Tablet-First UX, Question Craft & Daily Shareable Game Design

## 1. How an Elite AAA Game Studio Producer / Project Manager Operates ("Metacritic 90+" Discipline)

### A. Core Studio Methodologies Synthesized
1. **Stage-Gate Risk Retirement & The Vertical Slice Calibration Standard (Naughty Dog / EA / Sony Santa Monica):**
   - Never treat Pre-Production as "vague brainstorming" or scale prematurely across 10 levels.
   - **Gate 0 (Concept & Paper Math):** Prove turn count (`10 turns`), clock (`30s`), format ratio (`75% 4-choice / 25% showcase`), and board twist payouts make sense on paper.
   - **Gate 1 (First Playable / Nintendo EPD Toy-First Law):** Strip away clutter and test tactile feel + 0.5-second readability on target mobile viewports (`390×844` Portrait & `768×1024` Tablet).
   - **Gate 2 (Vertical Slice — The "92%+ Calibration Bar"):** Build **1 complete end-to-end slice** (Animated 1966 Title -> Story/Rules Cold Open -> Stage 1 Living Color Trilon Board + TV Twists -> Real Sampled 1960s Soundtrack + Studio Foley -> 10-Turn Match -> Victory/Loss Ceremony -> Daily Shareable Show) to **100% shippable polish** before replicating across Stages 2–10!
   - **Gate 3 & 4 (Alpha Wiring Complete -> Beta Concentric Polish & Zero-A-Bug Gold Master):** Enforce transactional scope control (*"If a noisy widget competes with the Board or Question, cut it immediately"*).
2. **Blizzard's "Concentric Circles of Polish":**
   - Polish from the **innermost loop outward**:
     - *Circle 1 (Every 15 Seconds):* Reading the Board Tile -> Tapping -> Reading the Clue -> Tapping an Answer -> Hearing the Bell/Applause + Seeing Dollars Count Up. **If Circle 1 isn't a 9.5/10 joy, outer circles (90-episode meta, 36 trophies) CANNOT save the game!**
     - *Circle 2 (Every 3 Minutes):* Board Twists (`Locked`, `Secret Square`, `Mystery Curtain`, `Opponent's Choice`, `Instant Bargain`), Rival rivalry & comeback drama, Episode Ceremony.
     - *Circle 3 (Every Session / Day):* Campaign Story progression, Animated 1966 Title Hub, Daily Shareable Broadcast & Streak.
3. **Pixar Braintrust (Ed Catmull) & Supercell "Cell" Candor:**
   - Separate ego from the build: admit candidly when *"the baby is ugly"* (e.g., gloomy brown boards or synthetic 80s keyboard audio) and upend the tea table immediately rather than defending sunk lines of code.
   - Weekly/milestone playtests must observe **unassisted first-time player comprehension**—if a player has to ask *"Wait, why am I here and what do these buttons do?"*, onboarding has failed.

---

## 2. Celia Hodent's *The Gamer's Brain* UX + Mobile & Tablet Responsive Engineering

### A. First-5-Minutes Onboarding Laws (Cognitive Load & Scaffolding)
- **Working Memory Limit (`3–4` chunks max):** Never dump unexplained fictional jargon (`Lien Goal`, `Stage Vice`, `Censor Capacitor`, `Booth Arrest`, `Voronoi Canary`) on a brand-new player before Turn 1!
- **Immediate Story + Rules Framing:** When Campaign starts, present a brisk, theatrical **1966 TV Cold Open (3 visual cards, `< 25 seconds`)** answering:
  1. *Story Premise:* Why you're standing under hot color cameras in 1966 with 50 million watching.
  2. *Board & Twists:* Tap open dollar tiles; watch for fun TV twists (`🔒 Locked`, `⭐ Secret Square`, `🎭 Rival's Pick`, `❓ Mystery`).
  3. *Winning:* 10 turns vs. the Champion; highest cash total wins the episode!
- **Progressive Scaffolding:** Introduce advanced meta systems (Props/Relics, Control Booth tells, backstage conspiracy choices) *naturally across Episodes 1 -> 2 -> 3* once the core trivia & board loop feels effortless!

### B. Mobile Phone & Tablet Responsive Layout Math (Apple HIG `>=44pt` + Material 3 `>=48dp`)
**Golden Rule: THE BOARD AND THE QUESTION ARE THE STARS (`75–85%` of screen weight).**

| Form Factor | Reference Viewports | Board Layout & Tile Sizing | Question Card & Choice Sizing |
| :--- | :--- | :--- | :--- |
| **Mobile Phone Portrait (`9:16`)** | `360×640`, `390×660`, `390×844`, `430×932` | **3-Column × 4-Row Giant Tote Rack** filling `92–96%` width (`~360px` wide on `390px` phone). Each tile `>= 110px × 92px`, Category `15–17px` bold, Dollar `$200..$500` `24–28px` bold! | Eye-level centered TV Monitor (`94%` width), Clue text `18–21px` (`line-height: 1.35`), 4 full-width stacked or large 2×2 pill buttons (`min-height: 54px`, `16–18px` label). |
| **Mobile Phone Landscape (`16:9` / `19.5:9`)** | `844×390`, `932×430` | **4-Column × 3-Row Wide Tote Board** filling center `78%` height with ultra-slim `42px` top score strip. | Side-by-side 2-column Broadcast Monitor: Left `44%` Clue + Clock, Right `56%` `2×2` big Choice Pads (`>= 52px` tall). |
| **Tablet Portrait (`3:4`)** | `768×1024`, `820×1180` | **3×4 or 4×3 Deluxe Studio Tote Board** framed by visible 1966 NBC/CBS marquee pillars & studio cameras; tiles `>= 165px × 125px`, `20px` categories, `34px` dollars! | Centered `680px` max-width Prestige Cue Card, `24px` clue copy, `2×2` spacious answer pads (`>= 68px` tall, `20px` copy). |
| **Tablet Landscape & Desktop (`4:3` / `16:9`)** | `1024×768`, `1280×800`, `1440×900`, `1920×1080` | Full 1966 Network Soundstage panorama framing a bold, high-contrast foreground Tote Board (`65–72%` viewport width, zero tiny distant tiles). | Centered `760–860px` eye-level TV Question Monitor (`24–28px` clue text, `2×2` illuminated Bakelite/Acrylite choice pads). |

---

## 3. Gameplay Pacing, 75/25 Format Balance & Authentic TV Board Twists

1. **The `75% / 25%` Trivia Format Law:**
   - **`75%` Classic 4-Option TV Trivia (`7–8` of 10 turns):** Clean, unmistakable `A / B / C / D` multiple choice styled as glowing 1966 broadcast push-buttons. Fast to read, zero mechanical confusion, pure trivia joy.
   - **`25%` Special TV Showcase Rounds (`2–3` of 10 turns, badged on special tiles!):** Fun variety moments (*Price Is Right* / *Wits & Wagers* dial estimation, *Wheel / Only Connect* missing-vowels word board, 3D Earth spin, or Picture Clue)—clearly heralded as a **"★ STUDIO BONUS FORMAT!"** with a 1-line instruction and extra `35–40s` timer!
2. **Relaxed, Fair Broadcast Clocks:**
   - Standard 4-Choice Question: **`30 seconds`** (`35 seconds` on Special Showcase formats; `20 seconds` in Turn 9–10 Lightning Finale).
   - First `23s`: Relaxed *Think!* jazz groove, calm progress bar. Final `7s`: Amber marquee pulse + crisp studio woodblock tick every second.
3. **Five Signature 1960s TV Board Twists (Visible & Exciting on Every Board):**
   - **🔒 LOCKED VAULT (`$500`):** Padlocked gold center/top tile. Unlocks with a mechanical tumbler clunk as soon as any adjacent tile is won (or on a `2+` streak)!
   - **⭐ SECRET SQUARE / DAILY DOUBLE:** Hidden under 1–2 tiles per board; uncovering it rings the 1966 chime, flashes marquee bulbs, and lets you play for **Double Dollars (`2×`)** or wager up to `$400`!
   - **🎭 OPPONENT'S CHOICE:** Marked with twin comedy/tragedy TV masks—when claimed or triggered, you pick which category your Rival is forced to play next (or survive a category chosen by your Rival for `1.5×` Spite Bonus!).
   - **❓ MYSTERY CURTAIN (`DOOR #1 / #2 / #3`):** Inspired by *Let's Make a Deal* & *Concentration*—pops open a quick 3-Curtain or Trilon spin yielding `+$250 Instant Cash`, `STEAL $200 FROM RIVAL`, `FREE 50/50 ELIMINATOR`, or a harmless comedic `CATEGORY SWAP`!
   - **🔔 INSTANT BARGAIN (*Sale of the Century* 1969):** Once per match around Turn 4–7 when you hold cash, the Bargain Bell rings offering a discounted studio power-up right off the prize turntable!

---

## 4. Elite Trivia Question Craft (*Trivial Pursuit*, *Millionaire*, *Jeopardy!*, *You Don't Know Jack*)

### A. Ban Robot/Database Phrasing — Write With Human Hooks!
- **BAD (Database/AI Slop):** *"Which chemical element has the atomic number 79 and symbol Au?"* / *"In which country is the city of Kyoto located?"*
- **GOOD (*Jeopardy! / Millionaire / YDKJ* Two-Pin Hook):** *"Named after the Latin word for 'shining dawn,' which precious metal stays so immune to rust that sunken Spanish treasure coins still gleam centuries later?"* -> `Gold` (vs `Silver`, `Platinum`, `Copper`).
- **Four Laws of Great Game-Show Questions:**
  1. **Conversational Bar-Bet Energy (*Trivial Pursuit*):** Every question should make you want to read it out loud to someone sitting next to you on the couch.
  2. **Two-Path Pinning (*Jeopardy!*):** Give a vivid cultural/sensory hook *plus* a logical clue so players who don't have instant recall can deduce it and feel brilliant (*"Aha!"*).
  3. **Magnetic Parallel Distractors + Occasional Wink (*Millionaire* & *YDKJ*):** All 4 options must belong to the exact same grammatical type and era/plausibility tier—never 1 detailed answer and 3 lazy fillers. On lighter Stage 1–3 questions, include 1 subtly witty distractor that sparks a grin without giving away the answer.
  4. **Friendly, Recognizable TV Categories:** Group categories into clear, inviting television banners (`POP & SCREEN`, `HIT PARADE / MUSIC`, `HISTORY & HEADLINES`, `SCIENCE & INVENTIONS`, `WORLD ATLAS`, `FOOD & CULTURE`, `SPORTS & GAMES`, `WORDS & WIT`).

---

## 5. Shareable Daily Game Architecture (*Wordle* / *NYT Connections* Standard)

- **Mode Name:** **`DAILY 1966 BROADCAST`** (prominent badge right on the Start Screen Hub showing today's Episode `#` and current `🔥 Day Streak`).
- **Deterministic Global Seed (`YYYY-MM-DD`):** Every player worldwide gets the **exact same 6-Turn Daily Tote Board** (4 classic 4-choice questions + 1 Secret Square Double + 1 Studio Showcase Finale, including 1 Mystery Curtain & 1 Locked Vault!).
- **3-Minute Coffee-Break Session:** Fast, punchy vs. Today's Featured Network Champion.
- **Zero-Spoiler Viral Share Card (`navigator.share` on iOS/Android + 1-Tap Copy Toast):**
  ```text
  📺 WORLD'S SMARTEST · Daily Broadcast #142 (Nov 24)
  🏆 $2,450 · BEAT THE CHAMP! (5/6 Correct · 🔥 Streak: 4)
  🟦🟩 ⭐🟩 🔒🟩 ❓🟩 🟥 🎯🟩
  Play today's 1966 TV board!
  ```
- **Persistence:** Saves daily completion state, score breakdown, win %, and streak in `localStorage` so you play once per day for official streak credit (with an optional `"Replay Just for Fun"` button after finishing).
