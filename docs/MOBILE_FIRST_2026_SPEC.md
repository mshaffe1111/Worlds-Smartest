# World's Smartest — 2026 Mobile-First Sleek UX & Layout Specification

> **Author:** `@ux-research-architect`
> **Target Implementers:** `@sleek-css-architect` · `@mobile-hud-architect` · `@sleek-modals-architect` · `@meta-sheets-architect` · `@stage3d-mobile-framer` · `@cinema-actor-sleek-lead` · `@touch-submit-engineer`
> **Design Benchmark:** Apple Design Award · *Monument Valley* · *Supercell* · Linear / Rolex Horology Minimalism (2026 Editorial Dark-Velvet Luxury)
> **Supersedes:** NinePatch bordered picture frames (`ws-has-ninepatch`), multi-row utility pill bars, and stacked boxes-within-boxes.

---

## 1. Forensic Autopsy of User-Reported Mobile Defects (4 Live Screenshots)

| Screenshot Evidence | Root Cause Observed in Codebase | Mandatory 2026 Fix |
| :--- | :--- | :--- |
| **#1 Baseball Question Box** (`media_1795324224595_802f97ec.jpg`) | `.ws-has-ninepatch .ws-frame-tableau` stole `46px` vertical border-image + padding (`~72px` total chrome). `.ws-dock-meta-row` wrapped into 2 rows (`~74px`). `.ws-dock-pinned-actions` stacked `PEEL CROWN` + 2-line `OVERCLOCK` vertically (`~118px`). `.ws-broadcast-dock { max-height: min(50dvh, 430px); overflow: hidden; }` squeezed `.ws-dock-scroll-region` down to `~140px`, hiding **100% of `A–D` answers** behind the scrollbar and pinned buttons. *(Also note data punctuation defect `"Detroit. MI?"` → `"Detroit, MI?"`.)* | Rip out NinePatch `border-image` completely. Collapse meta to 1 row (`22–26px`). Pin `PEEL` + `LOCK/OVERCLOCK` side-by-side in **ONE single `44px` horizontal grid row**. Use adaptive `2×2` grid on compact portrait (`vh <= 740`) and flush 1-col strips on tall portrait (`vh >= 741`). Set `flex-shrink: 0` on `.ws-facet-strip` so `A–D` **NEVER** scroll or get covered! |
| **#2 & #3 Portrait Start Screen** (`media_1795324272103_9b278a80.jpg`, `51e1f32f.png`) | `.ws-topbar` rendered the chyron pill + **9 wrapped utility pills across 2 extra rows (`~136px`)**. `.ws-title-pedestal.ws-frame-cinema` was a giant opaque gold-bordered rectangle (`~540px`, `65%` height) holding a 4-line paragraph + Saves box + 5 wrapped mode pills — burying **85% of the 3D Veritas Prism**. | Whisper-thin single-row `42px` top bar (`🔊` + `☰ VAULT` drawer). Frameless floating serif wordmark at top (`0..13dvh`). **`>= 52dvh` (`59–66dvh` actual) unobstructed 3D Prism window**. Frameless bottom atmospheric scrim with **1 gold CTA + 1 single-row 5-mode hairline strip + 1 discreet Saves link**. |
| **#4 Portrait 3D Intel Observatory** (`media_1795324491363_1c65122e.jpg`) | Bottom `.ws-meta-shell` (`55dvh` tall) sliced the center-framed 3D Championship Crown in half. Inside the sheet, **14 boxed buttons** (6 cross-nav pills + 3 giant tab boxes + 5 stage tool boxes in 2 rows) pushed the relic dossier completely below the fold. | Exact **`50dvh` open 3D stage (top) / `50dvh` frameless inspector sheet (bottom)** on portrait. Frame 3D Crown/Relic/Atelier inside **`y = 7dvh..47dvh`**. Strip all 5 redundant cross-nav boxes from header (keep only floating `←` / `✕` at top). Use underline tabs (`36px`) + 1-row icon tool bar (`38px`) + horizontal swipeable relic rail (`42px`) so provenance & UV dossier sit **above the fold**. |

---

## 2. Exact `dvh` & Pixel Vertical Budget Math (All 6 Target Viewports)

### 2.1 Live Gameplay & Reveal Budget Matrix — ZERO Scrollbars, ZERO Covered `A–D`

**Responsive Layout Breakpoint Rules for `.ws-facet-strip` (alias `.ws-facets-grid`):**
- **Compact Portrait (`max-height: 740px` and `orientation: portrait`, e.g. `360×640`, `375×667`):** **`2×2` grid** (`grid-template-columns: repeat(2, minmax(0, 1fr))`, `gap: 6px`, tile `min-height: 44px`). Saves `96px` vs 4 stacked rows while preserving Apple HIG `44px` tap targets!
- **Tall Portrait (`min-height: 741px` and `max-width: 599px`, e.g. `390×844`, `430×932`):** **1-column full-width frameless strips** (`min-height: clamp(40px, 4.9dvh, 46px)`, `gap: 5px`; compact `38px–40px` on `.is-reveal`) for effortless full-width reading.
- **Tablet Portrait (`min-width: 600px` and `orientation: portrait`, e.g. `768×1024`):** **`2×2` grid** (`max-width: 720px` centered, tile `min-height: 50px`, `gap: 8px`).
- **Landscape Mobile (`max-height: 520px` and `orientation: landscape`, e.g. `844×390`):** **2-Column Side-by-Side Split** — **Left `46vw` open 3D Prism**, **Right `54vw` frameless dock** (`2×2` facets, `44px` live / `40px` reveal).

| Viewport (`W × H`) | Mode / State | Top Safe + Bar + Slim Telemetry | Open 3D Stage (`dvh` & `px`) | Dock Meta + Stem (+ Clue) | All 4 `A–D` Facets | Intel Flash (Reveal Only) | Single-Row Actions | Total Dock (`px` / `dvh`) | Scrollbar? |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`360 × 640`** *(Android Compact)* | **Live (Tier 1, 3-line stem)** | `10 + 36 + 30 = 76px` (`11.9%`) | **`323px` (`50.5dvh`)** | `22 + 52 = 74px` | `94px` (`2×2`, `44px`) | — | `44px` | `241px` (`37.7dvh`) | **NO (`0px`)** |
| **`360 × 640`** | **Live (Tier 3 Peeled + Clue)** | `76px` (`11.9%`) | **`286px` (`44.7dvh`)** | `22 + 52 + 32 = 106px` | `94px` (`2×2`, `44px`) | — | `44px` | `278px` (`43.4dvh`) | **NO (`0px`)** |
| **`360 × 640`** | **Reveal (Graded `A–D` + Flash)** | `76px` (`11.9%`) | **`274px` (`42.8dvh`)** | `22 + 36 = 58px` *(2-line)* | `90px` (`2×2`, `42px`) | `64px` *(3-line)* | `44px` | `290px` (`45.3dvh`) | **NO (`0px`)** |
| **`375 × 667`** *(iPhone SE)* | **Live (Tier 3 Peeled + Clue)** | `12 + 36 + 30 = 78px` (`11.7%`) | **`305px` (`45.7dvh`)** | `22 + 54 + 34 = 110px` | `96px` (`2×2`, `45px`) | — | `44px` | `284px` (`42.6dvh`) | **NO (`0px`)** |
| **`375 × 667`** | **Reveal (Graded `A–D` + Flash)** | `78px` (`11.7%`) | **`293px` (`43.9dvh`)** | `22 + 38 = 60px` | `92px` (`2×2`, `43px`) | `66px` *(3-line)* | `44px` | `296px` (`44.4dvh`) | **NO (`0px`)** |
| **`390 × 844`** *(iPhone 14/15/16)* | **Live (Tier 1, 3-line stem)** | `16 + 42 + 36 = 94px` (`11.1%`) | **`397px` (`47.0dvh`)** | `24 + 58 = 82px` | `183px` (`1-col`, `42px`) | — | `46px` | `353px` (`41.8dvh`) | **NO (`0px`)** |
| **`390 × 844`** | **Live (Tier 3 Peeled + Clue)** | `94px` (`11.1%`) | **`359px` (`42.5dvh`)** | `24 + 58 + 34 = 116px` | `183px` (`1-col`, `42px`) | — | `46px` | `391px` (`46.3dvh`) | **NO (`0px`)** |
| **`390 × 844`** | **Reveal (Graded `A–D` + Flash)** | `94px` (`11.1%`) | **`351px` (`41.6dvh`)** | `24 + 38 = 62px` *(2-line)* | `175px` (`1-col`, `40px`) | `68px` *(3-line)* | `46px` | `399px` (`47.3dvh`) | **NO (`0px`)** |
| **`430 × 932`** *(iPhone Pro Max)* | **Live (Tier 3 Peeled + Clue)** | `18 + 42 + 38 = 98px` (`10.5%`) | **`416px` (`44.6dvh`)** | `26 + 60 + 36 = 122px` | `198px` (`1-col`, `45px`) | — | `48px` | `418px` (`44.8dvh`) | **NO (`0px`)** |
| **`430 × 932`** | **Reveal (Graded `A–D` + Flash)** | `98px` (`10.5%`) | **`406px` (`43.6dvh`)** | `26 + 42 = 68px` | `186px` (`1-col`, `42px`) | `74px` *(3-line)* | `48px` | `428px` (`45.9dvh`) | **NO (`0px`)** |
| **`768 × 1024`** *(Portrait Tablet)* | **Live (Tier 3 Peeled + Clue)** | `20 + 44 + 42 = 106px` (`10.4%`) | **`576px` (`56.3dvh`)** | `28 + 54 + 38 = 120px` | `112px` (`2×2`, `52px`) | — | `50px` | `342px` (`33.4dvh`) | **NO (`0px`)** |
| **`768 × 1024`** | **Reveal (Graded `A–D` + Flash)** | `106px` (`10.4%`) | **`534px` (`52.1dvh`)** | `28 + 48 = 76px` | `112px` (`2×2`, `52px`) | `84px` *(3-line)* | `50px` | `384px` (`37.5dvh`) | **NO (`0px`)** |
| **`844 × 390`** *(Landscape Mobile)* | **Live (Tier 3) — Right 54vw** | `6 + 36 = 42px` *(full width)* | **Left `46vw × 342px`** | `20 + 36 + 30 = 86px` | `93px` (`2×2`, `44px`) | — | `44px` | `254px / 342px` avail | **NO (`0px`)** |
| **`844 × 390`** | **Reveal — Right 54vw** | `42px` | **Left `46vw × 342px`** | `20 + 32 = 52px` | `85px` (`2×2`, `40px`) | `56px` *(3-line)* | `44px` | `269px / 342px` avail | **NO (`0px`)** |

*(Note: Total Dock heights include internal vertical padding `14–28px` and flex gaps `15–32px`. On extreme legacy `320×568` screens, drop stem to `13px`, `2×2` tiles to `40px`, and emergency `overflow-y: auto` triggers only above `64dvh` while keeping `A–D` `flex-shrink: 0`.)*

### 2.2 Other 3 Archetypes Compact Portrait Budgets (`360×640` → `430×932`)
- **`CALIBRATOR_DIAL`:** Meta `24px` + Stem `42px` + Frameless Estimate Row (`1969`, **no commas on years!** + `[-big][-1][+1][+big]` buttons, `34px`) + Range Slider (`28px`) + 3-Segment Hairline Cone Bar (`36px`) + Single-Row Action Bar (`44px`) = **`~240px`** (`37.5dvh` on 640, `28.4dvh` on 844).
- **`CODEX_DUAL_RING`:** Meta `24px` + Stem `40px` + 3 Single-Line Horizontal Conduit Rows (`3 × 38px + 10px gap = 124px`, Subject left · `◀ Target ▶` right) + Single-Row Action Bar (`44px`) = **`~265px`** (`41.4dvh` on 640, `31.4dvh` on 844).
- **`GAUNTLET_SHATTER`:** Meta `24px` + Stem `44px` + Single 3-Way Tap Parity Bar (`◀ FALSE` | `▲ TRICK 2×` | `TRUE ▶`, `48px` tall) = **`~152px`** (`>= 64dvh` open 3D swipe arena!).

### 2.3 Portrait Start Screen & 3D Observatory / Atelier Budgets (`>= 50dvh` Pure 3D Mandate!)

| Screen | Viewport | Top Floating Zone | **Unobstructed 3D Stage (HARD FLOOR `>= 50dvh`)** | Bottom Frameless Dock / Sheet |
| :--- | :--- | :---: | :---: | :---: |
| **Start Screen (`TITLE_ESTABLISHING`)** | `360 × 640` | `0..14dvh` (`90px`: 38px bar + floating serif title, NO box) | **`14..73dvh` = `59.1dvh` (`378px`)** | `73..100dvh` (`172px`: 1 gold CTA `48px` + 5-mode hairline strip `44px` + Saves whisper `32px`) |
| **Start Screen** | `390 × 844` | `0..12.3dvh` (`104px`) | **`12.3..78.2dvh` = `65.9dvh` (`556px`)** | `78.2..100dvh` (`184px` frameless atmospheric scrim) |
| **Start Screen** | `430 × 932` | `0..11.6dvh` (`108px`) | **`11.6..79.4dvh` = `67.8dvh` (`632px`)** | `79.4..100dvh` (`192px`) |
| **Start Screen** | `768 × 1024` | `0..11.0dvh` (`112px`) | **`11.0..80.0dvh` = `69.0dvh` (`706px`)** | `80.0..100dvh` (`206px`, centered `max-width: 560px`) |
| **Start Screen** | `844 × 390` | `0..10dvh` (`38px` bar) | **Left `50vw` full-height 3D Prism** | **Right `50vw` frameless title + CTA + 5-mode strip** |
| **3D Observatory / Atelier (`RELIC_OBSERVATORY`)** | `360×640` – `768×1024` | `0..6.5dvh` (`42px` transparent floating `←` Title `✕` only) | **`0..50dvh` = `50.0dvh` (interactive 1-finger 360° orbit!)** | **`50..100dvh` (`50dvh` max)**: Handle `12px` + Underline Tabs `36px` + 1-Row Tool Bar `38px` + Horizontal Relic Rail `42px` + Frameless Dossier scroll |
| **3D Observatory / Atelier** | `844 × 390` *(Landscape)* | `0..10dvh` (`36px` bar) | **Left `50vw` full-height 3D Relic/Crown** | **Right `50vw` frameless side inspector (`justify-content: flex-end`!)** |

---

## 3. 2026 Sleek Anti-Boxiness Design Tokens & CSS Architecture

### 3.1 Permanently Banned Patterns (Zero Tolerance)
1. **ZERO NinePatch `border-image` Picture Frames:** Remove `.ws-has-ninepatch .ws-frame-tableau` and `.ws-has-ninepatch .ws-frame-cinema` `border-image` rules completely. Stop adding `ws-has-ninepatch` in `SovereignHUD.ts`.
2. **ZERO Nested Bordered Boxes (`nestedBoxViolations === 0`):** NEVER place an element with a visible `border >= 1px` inside another container with a visible `border >= 1px`. Use **atmospheric scrims**, **`1px` single-edge hairlines** (`::before` gradient or `border-top`/`border-bottom`), and **`inset` left accent bars** (`box-shadow: inset 3px 0 0 var(--indicator-...)`) instead of all-around rectangle borders!
3. **ZERO Multi-Row Top Bars:** `.ws-topbar` is strictly `flex-wrap: nowrap; height: var(--topbar-h)` (`36–42px`), holding at most `←` + Title on the left and `🔊` + `☰ VAULT` on the right.
4. **ZERO `backdrop-filter: blur(...)` Over WebGL:** Keep `backdrop-filter: none !important` on all gameplay & 3D showcase overlays to preserve locked 60fps WebGL2 compositing.
5. **ZERO Stacked Peel + Overclock Buttons:** `.ws-action-row` is ALWAYS a single horizontal CSS Grid row (`grid-template-columns: auto 1fr; gap: 8px`).
6. **ZERO Commas in 4-Digit Years (`1000..2150`):** Use `formatHudValue(val, unit, prompt)` across HUD, Modals, Cinema, and 3D Calibrator ticks (`1984`, NEVER `1,984`; keep commas on `PTS` and question counts).

### 3.2 Canonical `:root` Design Tokens (For `@sleek-css-architect` & All Views)

```css
:root {
  /* Palette (OLED-safe Luxury Obsidian + 24K Champagne Gold) */
  --bg-obsidian: #050810;
  --gold-bright: #f2cf7e;
  --gold-24k: #d8af57;
  --gold-deep: #8f6b29;
  --ivory-primary: #f5f1e6;
  --ivory-muted: #b8bfcc;
  --ivory-dim: #788296;
  --cyan-clue: #56d4f5;
  --emerald-win: #39d49a;
  --crimson-alert: #e05263;
  --amber-warn: #f09d46;

  /* 2026 Frameless Atmospheric Scrims & Tinted Surfaces (NO picture frames!) */
  --scrim-top-float: linear-gradient(180deg, rgba(4, 7, 14, 0.72) 0%, rgba(4, 7, 14, 0.22) 68%, rgba(4, 7, 14, 0) 100%);
  --scrim-bottom-dock: linear-gradient(180deg, rgba(5, 8, 16, 0) 0%, rgba(6, 10, 20, 0.88) 14%, rgba(4, 7, 14, 0.98) 100%);
  --scrim-title-bottom: linear-gradient(180deg, rgba(4, 7, 14, 0) 0%, rgba(5, 9, 18, 0.82) 24%, rgba(4, 7, 14, 0.98) 100%);
  --surface-sheet: linear-gradient(180deg, rgba(9, 13, 24, 0.95) 0%, rgba(5, 8, 15, 0.99) 100%);
  --surface-row: rgba(255, 255, 255, 0.042);
  --surface-row-hover: rgba(242, 207, 126, 0.09);
  --surface-row-selected: linear-gradient(90deg, rgba(242, 207, 126, 0.18) 0%, rgba(242, 207, 126, 0.05) 100%);

  /* 1px Architectural Hairlines & Inset Left Indicators (Guarantees 0 nestedBoxViolations!) */
  --hairline-gold-grad: linear-gradient(90deg, transparent 4%, rgba(232, 197, 116, 0.42) 50%, transparent 96%);
  --hairline-subtle: rgba(255, 255, 255, 0.08);
  --hairline-gold: rgba(232, 197, 116, 0.24);
  --indicator-gold: inset 3px 0 0 #f2cf7e;
  --indicator-emerald: inset 3px 0 0 #39d49a;
  --indicator-crimson: inset 3px 0 0 #e05263;
  --indicator-cyan: inset 2.5px 0 0 #56d4f5;

  /* Ergonomic Rhythm & Fluid Mobile-First Scale */
  --topbar-h: clamp(36px, 5dvh, 42px);
  --touch-min: 44px;
  --sheet-radius-top: 20px;
  --safe-top: max(6px, env(safe-area-inset-top, 0px));
  --safe-right: max(12px, env(safe-area-inset-right, 0px));
  --safe-bottom: max(8px, env(safe-area-inset-bottom, 0px));
  --safe-left: max(12px, env(safe-area-inset-left, 0px));
}
```

### 3.3 Component-by-Component Anti-Boxiness Recipes (Locked Class Contracts `#222` / `#230` / `#231`)

1. **Single-Row `42px` Top Bar (`.ws-topbar`):**
   - Full-width transparent bar backed by `--scrim-top-float` (NO bordered chyron capsule!).
   - `.ws-topbar-left`: Optional `.ws-topbar-back` (`←` ghost icon button, `40×40px` visual / `44×44px` tap target) + concise tracked gold venue/stage title (`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`).
   - `.ws-topbar-right`: Compact `.ws-topbar-icon-btn` (`🔊`/`🔇` quick audio toggle) + sleek `.ws-vault-trigger` (`☰ VAULT`, borderless subtle pill `rgba(255,255,255,0.06)`, `min-height: 36px` visual / `44px` tap area).
2. **`☰ VAULT` Slide-Over Drawer (`.ws-vault-backdrop` + `.ws-vault-drawer.is-open`):**
   - Slides from right (`width: min(320px, 86vw); height: 100dvh; background: var(--surface-sheet)`), single `1px` left gold hairline, **ZERO inner boxed cards**.
   - `.ws-vault-header` + `.ws-vault-list` with clean `48px` frameless `.ws-vault-item` rows separated by `1px solid var(--hairline-subtle)` (`Passport`, `Career Stats & Graphs`, `64 Trophies & Unlockables`, `3D Intel Observatory`, `Prism Atelier`, `Campaign Saves (5 Slots)`, `12-Clue Dossier`), plus `.ws-vault-section-label` and inline `SFX` & `Room Ambience` toggles.
3. **Start Screen (`.ws-title-showcase`):**
   - Top frameless `.ws-title-hero` (`.ws-title-eyebrow` + `.ws-title-wordmark`, zero box!), open `>= 52dvh` (`59–69dvh` actual) middle 3D Prism window, bottom frameless `.ws-title-dock` (alias `.ws-title-pedestal`) with 1 gold CTA + single-row 5-mode `.ws-title-mode-strip` (alias `.ws-title-quick-modes`) + discreet `.ws-title-saves-link`.
4. **Gameplay Bottom Question Dock (`.ws-broadcast-dock`, `.is-revealed`):**
   - Portrait mobile (`max-width: 680px`): **Full-bleed bottom sheet** (`width: 100%; border-radius: 0; border: none; background: var(--scrim-bottom-dock);`) with a `1px` champagne top hairline via `::before` (`background: var(--hairline-gold-grad)`).
   - **Cascade Rule (`ViewportFitGuard.ts`):** Raise portrait `--ws-dock-max-h` ceiling to `58dvh` (Live) / `64dvh` (Reveal) — or defer dock `max-height` to `sovereign.css` — so `ViewportFitGuard`'s injected style tag NEVER re-clamps `.ws-broadcast-dock` back to `50–52dvh` and crushes `A–D`!
   - **Telemetry Ribbon (`.ws-stage-story-strip`):** Single slim frameless bar right under `.ws-topbar` (`Score` gold tabular left, `Rival` cyan right, `3px` tug-of-war hairline directly beneath — **ZERO bordered boxes!**). Character Tell appears as an ephemeral frameless floating whisper chip at bottom of `.ws-spotlight-plane` (hidden when empty).
   - **Answer Strips (`.ws-facet-strip.ws-facets-grid`):**
     - `flex-shrink: 0` (NEVER collapses!). Adaptive breakpoint: `2×2` on compact portrait (`max-height: 700px–740px`, e.g. `320×568`..`375×667`), 1-column full-width strips on tall portrait (`max-width: 479px` & `min-height: 701px`, e.g. `390×844`..`430×932`), `2×2` on tablet (`480..720px`) & `844×390` landscape, 4-col on desktop.
     - Each `.ws-facet-pill`: `border: none; border-radius: 10px; background: var(--surface-row);` + flush `22×22px` letter chip (`A`–`D`).
     - Focused (`.is-sightline`): `background: var(--surface-row-selected); box-shadow: var(--indicator-gold);` + unmistakable `.ws-facet-armed-badge` highlight.
     - Graded Reveal: `.is-correct` uses emerald wash + `var(--indicator-emerald)`; `.is-wrong` uses crimson wash + `var(--indicator-crimson)`.
   - **Single-Row Action Bar (`.ws-action-row`, `.has-veto`):**
     - `display: grid; grid-template-columns: auto 1fr; gap: 8px;` (`.has-veto` uses `auto auto 1fr`).
     - `#ws-btn-peel`: Concise label **`▼ PEEL · 2.0×`** (`▼ PEEL · 1.2×` at Tier 2; `✦ CUE · 3.0×` if free Nadia cue; `✓ OPEN` disabled at Tier 3). `border: none`, `box-shadow: inset 0 0 0 1px rgba(86,212,245,0.28)`, `min-height: 44px`, `padding: 0 12px`.
     - `#ws-btn-overclock`: 24K liquid-gold primary pill (`min-height: 44px`, `border: none`). Concise single-line label: **`LOCK 3.0× · HOLD 6.0×`** (`< 460px`) / **`TAP: LOCK (3.0×) · HOLD: OVERCLOCK`** (`>= 460px`) — synced in `OverclockGestureController.syncIdleHudLabel()`.
     - On Reveal (`.is-revealed`): `.ws-intel-flash` is a frameless `border: none` tinted strip with `box-shadow: var(--indicator-emerald)` (win) or `var(--indicator-crimson)` (miss), `max-lines: 3`, sitting **ABOVE** the single-row `44px` `.ws-action-row` (`☆ SAVE` auto left + `NEXT PRISM ▶` `1fr` right) and **BELOW** all 4 graded `A–D` facets!
5. **Full-Height Frameless Sheets (`BriefingCategoriesModal`, `CampaignSaveSlotsModal`, `EvidenceDossierModal`, `Passport`, `Honours`, `Analytics`, `Factions`):**
   - Use shared `.ws-sheet-header` (sticky frameless `48px`: `← Back` left · title center · `✕` right), `.ws-sheet-breadcrumbs`, `.ws-sheet-search`, `.ws-sheet-list`, `.ws-sheet-row` (`min-height: 48px`, `border-bottom: 1px solid var(--hairline-subtle)`), `.ws-sheet-footer`, `.ws-segmented-group`, `.ws-segmented-btn` — **ZERO bordered boxes inside bordered cards!**
6. **3D Observatory & Prism Atelier (`IntelObservatoryView`, `PrismAtelierView` — `@meta-sheets-architect`):**
   - **Portrait (`max-width: 780px` & portrait):** Top `0..50dvh` is `pointer-events: none` (allowing direct 1-finger 360° drag on `#canvas-root`) with ONLY transparent floating top-left `← Back`, top-right compact `Vault ▾` jumper, and bottom-right of the `50dvh` 3D zone holding 2 compact floating icon pills (`🔦 UV` + `⚙ Latches` + subtle `↻ Drag 3D to Orbit` whisper). Bottom `50..100dvh` is a frameless dark-velvet top-rounded (`20px 20px 0 0`) sheet (`border-top: 1px solid rgba(232,197,116,0.28)`), drag-handle pill, borderless underline tabs (`360° Relics · Saved Flashes · Recall Quiz`), horizontal scrollable Relic strip, and crisp frameless provenance prose.
   - **Landscape Mobile (`max-height: 520px` & landscape):** Align `.ws-meta-backdrop.is-stage-dock` to **`justify-content: flex-end`** (**Right `50vw` inspector** | **Left `50vw` open 3D Crown/Relic/Prism**) — matching Gameplay Landscape so the 3D object ALWAYS occupies the Left half and `@stage3d-mobile-framer`'s `targetLook.x += 0.55` aligns identically for Gameplay, Observatory, and Atelier!

---

## 4. Exact 3D Camera Screen-Space Framing Targets (For `@stage3d-mobile-framer`)

Remember in Three.js perspective projection (`camera` at `+Z`, looking toward `0`):
- **Lowering `targetLook.y`** moves the 3D hero **UP** on screen (`screenY = 0.5 - 0.5 * ndcY`).
- **Raising `targetLook.x` (`+X`)** moves the 3D hero **LEFT** on screen (into the Left open pane during Landscape Mobile right-dock!).

| Camera Shot | Portrait Screen-Space Band (`aspect < 0.95`) | Portrait Target Center (`dvh` / NDC `y`) | Landscape Mobile (`vh <= 520`) Band |
| :--- | :---: | :---: | :--- |
| **`TITLE_ESTABLISHING`** *(Start Screen)* | **`y = 14dvh .. 60dvh`** *(100% above `73dvh` bottom dock!)* | **`37dvh`** (`ndcY ≈ +0.26`) | Left `50vw` (`x = 5..46vw`, `targetLook.x += 0.52`) |
| **`RELIC_OBSERVATORY` / `TROPHY_HERO` / Atelier** | **`y = 7dvh .. 47dvh`** *(100% above `50dvh` sheet!)* | **`27dvh`** (`ndcY ≈ +0.46`) | Left `50vw` (`x = 4..46vw`, `targetLook.x += 0.55`) |
| **`PRISM_STANDARD` / `PEEL` / `CALIBRATOR` / `CODEX` / `GAUNTLET`** | **`y = 11dvh .. 48dvh`** *(100% between `11dvh` telemetry & `50–55dvh` dock!)* | **`29.5dvh`** (`ndcY ≈ +0.41`) | Left `46vw` (`x = 4..43vw`, `targetLook.x += 0.58`) |
| **`INTERVIEW_CLOSEUP`** *(Ending Crown / Story)* | **`y = 8dvh .. 49dvh`** *(upper 50dvh clear!)* | **`28.5dvh`** (`ndcY ≈ +0.43`) | Centered or Left `50vw` |

---

## 5. Automated QA & Verification Gates (For `@touch-submit-engineer` & Final E2E)

Every build MUST pass these objective automated checks via `window.__wsAuditLayout()` across `360×640`, `375×667`, `390×844`, `430×932`, `768×1024`, and `844×390`:
1. **`hiddenOrCoveredFacets === 0`:** All 4 `[data-facet-idx]` buttons have `rect.height >= 38` (`>= 34` on `320×568`), `rect.top >= 0`, `rect.bottom <= window.innerHeight`, `0px` intersection with `.ws-dock-pinned-actions`, `#ws-btn-overclock`, `#ws-btn-next-q`, or `#ws-btn-bookmark`, AND `.ws-dock-scroll-region.scrollHeight <= clientHeight + 2` (zero internal scrollbar on standard stems!).
2. **`nestedBoxViolations === 0`:** Zero visible elements with `borderWidth >= 1px` nested inside another visible `borderWidth >= 1px` container.
3. **`topbarRowCount === 1` & `topbarHeight <= 46`:** Single-row floating top bar across every viewport and screen state.
4. **`unobstructed3dDvh >= 50`:** On Start Screen (`TITLE_ESTABLISHING`), 3D Observatory (`RELICS_3D`), and Prism Atelier, the open 3D stage is `>= 50dvh` (portrait) or `>= 48vw` (landscape) AND the 3D hero bounding box projects 100% inside that open window with `0px` sheet overlap.
5. **`submitClickSuccessRate === 100%`:** 100/100 simulated jittery pointer taps (`< 240ms`, up to `40px` drift) and native clicks on `#ws-btn-overclock` commit `SAFE_LOCK` cleanly; holds `>= 260ms` charge Overclock and allow `>= 88px` horizontal slide cancel.
6. **`yearCommaViolations === 0`:** Zero commas inside 4-digit historical years (`1000..2150` / `CE` / `BCE`).
