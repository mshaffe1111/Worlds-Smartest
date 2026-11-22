# Research Report #2: Mobile 3D UX, Luxury Presentation & Layout Bible

> **Project:** *World's Smartest* (Godot 4.7.2 — Mobile-First Android/Web 9:16 Portrait + Panoramic Responsive Desktop)
> **Owner:** Researcher #2 (`@research-mobile-ux`)
> **Consumers:** `@godot-aaa-director` (Implementation Spec) · `@qa-art-critic` (Gate 3 Binary Audit Rubric) · `@coordinator`
> **Reference Canvas:** `1080 × 1920 px` (`9:16` logical portrait, `canvas_items` stretch, `expand` aspect)

---

## 0. Forensic Autopsy: Why Our Previous Build Looked Like "HTML Cards Over 1988 Blocks"

Before specifying the AAA rebuild, every concrete failure in the prior `godot/scenes/Main.tscn`, `godot/scripts/VeritasPrism.gd`, and `src/ui/UIManager.ts` is documented here and **permanently banned**:

| Prior Defect (Observed in Codebase) | Exact Failure Mechanism | Mandatory AAA Replacement |
| :--- | :--- | :--- |
| **5 Stacked Opaque `PanelContainer`s in `Main.tscn`** (`TopPanel`, `PromptCard`, `SightlinePanel`, `DialoguePanel`, `ActionDock`) | Consumed **~65% of vertical screen height**, leaving `< 35%` for the 3D scene and turning the game into a cramped dark-mode web form. | **>= 56% unobstructed 3D cinema** during gameplay; replace opaque box stacks with feather-soft edge scrims + translucent glass pills. |
| **5 Dark Dashboard Cards on Title Screen** (`UIManager.ts`: 1 two-line gold banner + 2×2 grid of 4 dark metadata cards) | Buried the lower half of the live 3D chamber under a SaaS crypto-dashboard grid with 14+ strings of text. | **>= 68% live 3D Vetting Chamber** + embossed gold serif title + **1 crisp `PLAY` CTA** + 1 sleek hairline mode ribbon. |
| **Giant Rectangular Billboards Welded to the 3D Orb** (`VeritasPrism.gd` `Label3D` + box housings) | Destroyed the sculpted Fabergé astrolabe silhouette and created illegible oblique text on 6-inch screens. | **Zero billboards on 3D meshes.** Keep `veritas_astrolabe_orb.glb` pure horological sculpture; synchronize 1:1 with razor-sharp bottom-thumb glass Answer Pills. |
| **Floating 3D Picture Frame & Boxed Thumbnail** (`StageMonolithAnchor/PortraitScreen` `QuadMesh` + `DialoguePanel/PortraitFrame` `96×118` box) | Looked like a floating passport photo pasted onto a wall; permanently stole 150px of gameplay height even when nobody was speaking. | **Delete both.** Use full-bleed **alpha-matted cutout portraits** (`portraits_cutout/*.png`, *Hades*-style) composited cleanly over 3D interview cuts, and 1.8s ephemeral reaction toasts during gameplay. |
| **Microscopic Mobile Typography & Rage-Tap Hitboxes** (`PromptLabel = 28 px` ≈ `9.3 sp`; `SpinLeftBtn = 68×56 px` ≈ `22×18 dp`; `ActionDock = 84 px` ≈ `28 dp`) | Failed Apple HIG (`44 pt`), Material 3 (`48 dp`), and minimum `16–18 sp` readability floors on real 6-inch phones. | Enforce **`>= 44–54 px` (`16–18+ sp`)** prompts/answers/subtitles and **`>= 128–144 px` (`44–48 dp`)** interactive hitboxes. |
| **Developer Telemetry on Live HUD** (`JSON 832 Qs · 0 SEEN`, `BROADCAST/FRACTURE` toggle, `CAST ▸` cycle button) | Broke prestige broadcast immersion instantly. | **Zero debug labels or dev toggles** on player HUD. Move audio/haptics/debug exclusively into the corner Pause/Settings sheet. |
| **Monochrome Dingbat Daily Share** (`✦ ◈ ◇ ✖` mixed with `💎 🎯` + marketing tagline) | Broke cross-OS baseline alignment and failed the Picture Superiority Effect in SMS/WhatsApp/Discord. | **5-line Wordle/Connections-grade full-color emoji narrative strip** (`💎🟨🟩💥🟦🎯`) with universal width & zero spoilers. |

---

## 1. Mobile 3D Ergonomics, Safe-Area Framing & The >= 55% Cinema Mandate

### 1.1 Steven Hoober Thumb-Zone Biomechanics Mapped to `1080 × 1920`

Steven Hoober's observational mobile studies establish that **49% of mobile users operate one-handed**, **36% use a cradled grip** (one hand holds, opposite thumb/finger taps), and **15% use two hands**—meaning **>= 75% of all portrait interactions are thumb-driven**. Crucially, Hoober's follow-up precision research proved a second rule: **motor precision peaks in the center-middle band, while accuracy drops sharply at the outer 4–5% bezels and top corners.**

Mapped directly onto our `1080 × 1920` Godot reference canvas:

| Ergonomic Zone | Vertical Span (`1080×1920`) | % of Height | Biomechanical Role in *World's Smartest* | Hard Rules |
| :--- | :--- | :--- | :--- | :--- |
| **System Bleed / Top Safe Inset** | `Y: 0 – 120 px` *(dynamic)* | `0 – 6.2%` | Pure edge-to-edge 3D cinema bleed behind notch / Dynamic Island / status bar. | **ZERO interactive controls or text.** 3D scene renders full-bleed here. |
| **Red Zone (Hard Reach — View Only)** | `Y: 120 – 430 px` | `6.2 – 22.4%` | Minimal top telemetry scrim, Pause/Audio corner button (infrequent/safe from accidental taps), and floating **Question Prompt Ribbon**. | Never place timed answer/gameplay actions here. Corner icon gets `128×128 px` invisible hit-slop. |
| **Yellow / Precision Cinema Stage** | `Y: 430 – 1220 px` | `22.4 – 63.5%` | **Primary 3D Cinema & Direct Manipulation Stage** — Veritas Astrolabe Orb, marble table, chess set, desk lamp, Calibrator Chronometer, Codex Cryptex, Gauntlet plaques. | **Zero opaque UI panels.** Full `MOUSE_FILTER_IGNORE` pass-through so thumb drags spin/peel/swipe 3D artifacts seamlessly. |
| **Green Zone (Natural Thumb Sweep)** | `Y: 1220 – 1818 px` | `63.5 – 94.7%` | **Primary Rapid-Action Control Arc** — Answer Pills, Peel Seal, Hold-to-Overclock / Lock, Story Branch Choices, Title Primary CTA + Mode Ribbon. | Inset horizontally `>= 48 px` (`X: 48–1032`) to avoid edge-accuracy falloff. Minimum `20 px` gutter between siblings. |
| **Bottom Gesture Bleed** | `Y: 1818 – 1920 px` *(dynamic)* | `94.7 – 100%` | Clearance for iOS Home Indicator (`34 pt`) and Android Edge-to-Edge Gesture Pill (`16–24 dp`). | **ZERO buttons below `Y = 1818`** (or dynamic safe bottom). Background scrim/3D bleeds to `Y = 1920`. |

### 1.2 DPI Conversion Math & Non-Negotiable Touch/Typography Floors

Modern Android/iOS portrait viewports span `360 dp` (`3.0×` scale to `1080 px`) up to `412 dp` (`2.625×` scale to `1080 px`, e.g., Pixel 8 / Galaxy S24) and `393 pt` (`2.75×`, iPhone 15/16). Using `2.75×–3.0×` as our authoritative conversion factor:

* **Touch Target Minimums (Apple HIG `44×44 pt` / Material 3 `48×48 dp`):**
  * **Primary Action Buttons (`PLAY`, `OVERCLOCK`, `PEEL`, `NEXT`):** Height **`136–144 px`** (`45–52 dp`), Width `>= 280 px`.
  * **Answer Pills (2×2 Grid):** **`476 × 128 px`** (`173 × 46.5 dp` at `2.75×`), separated by **`20 px`** horizontal and **`18 px`** vertical gutters.
  * **Corner Utility Icons (Pause, Audio, Settings, Close `×`):** Visible vector glyph `40–48 px`, wrapped inside a **`128 × 128 px`** (`46.5 dp`) transparent touch hitbox (`custom_minimum_size = Vector2(128, 128)`).
* **Typography Minimums (`>= 16–18 sp`) & Scannable Line Budget:**
  * **Question Prompts:** **`46 px`** default (`17.5 sp` on 412dp / `15.3 sp` on 360dp; auto-steps smoothly to `42 px` only if `prompt.length() > 95`, never below `42 px`). Target **34–42 characters per line (CPL)** inside `940 px` max text width → crisp **2 lines** for standard `75–90 char` prompts, hard cap **3 lines** at `140 chars`.
  * **Answer Pill Labels:** **`44 px`** (`~16 sp`, SemiBold; auto-steps to `38 px` only for 22–28 char answers). Maximum **2 lines** (`<= 28 chars` enforced by FORGE validator).
  * **Cinema Dialogue Subtitles:** **`44 px`** (`~16 sp`), max **3 lines**, `36–42 CPL`.
  * **Absolute Floor (Micro-Badges / Timers / Eyebrows):** **`30–34 px`** (`11–12.5 sp`), **Bold or SemiBold uppercase only** — zero Regular/Light weights below `38 px` (thin strokes break on sub-pixel mobile displays).

### 1.3 Hardware Safe-Area Metrics & Godot 4.7.2 Dual-Platform Safe-Area Script

| Platform / Hardware Class | Top Inset (Physical) | Bottom Inset (Physical) | Equivalent on `1080×1920` Canvas |
| :--- | :--- | :--- | :--- |
| **iPhone 14/15/16 Dynamic Island** | `59 – 62 pt` (Air: `68 pt`) | `34 pt` (Home Indicator) | Top `162 – 186 px` · Bottom `94 – 102 px` |
| **Android 15/16 Edge-to-Edge (Punch-Hole)** | `24 – 36 dp` | `16 – 24 dp` (Gesture Pill) | Top `72 – 108 px` · Bottom `48 – 72 px` |
| **Android Legacy 3-Button Nav** | `24 – 32 dp` | `48 dp` | Top `72 – 96 px` · Bottom `132 – 144 px` |
| **Mobile Web (Chrome / Safari)** | `env(safe-area-inset-top)` | `env(safe-area-inset-bottom)` | Dynamic via `JavaScriptBridge` CSS vars |
| **Desktop / Baseline Floor Default** | — | — | **Floor:** Top `72 px` · Bottom `56 px` · Sides `48 px` |

**Mandatory Godot 4.7.2 `SafeMarginContainer.gd` (Native Android/iOS + Web HTML5 CSS Fallback):**
Attach to `$HUDLayer/HUDColumn/SafeMarginContainer` (NEVER wrap the 3D scene or edge scrims inside it—those render full-bleed behind cutouts!):

```gdscript
class_name SafeMarginContainer
extends MarginContainer

const FLOOR_TOP: int = 72
const FLOOR_BOTTOM: int = 56
const FLOOR_SIDE: int = 48

func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	get_viewport().size_changed.connect(_apply_safe_margins)
	call_deferred("_apply_safe_margins")

func _apply_safe_margins() -> void:
	var left: float = float(FLOOR_SIDE)
	var right: float = float(FLOOR_SIDE)
	var top: float = float(FLOOR_TOP)
	var bottom: float = float(FLOOR_BOTTOM)

	if OS.has_feature("mobile") and not OS.has_feature("web"):
		var safe_rect: Rect2 = Rect2(DisplayServer.get_display_safe_area())
		if safe_rect.size.x > 0.0 and safe_rect.size.y > 0.0:
			var xform_inv: Transform2D = get_viewport().get_final_transform().affine_inverse()
			var vp_safe: Rect2 = safe_rect * xform_inv
			var vp_full: Rect2 = get_viewport().get_visible_rect()
			left = maxf(left, vp_safe.position.x - vp_full.position.x + 24.0)
			top = maxf(top, vp_safe.position.y - vp_full.position.y + 18.0)
			right = maxf(right, vp_full.end.x - vp_safe.end.x + 24.0)
			bottom = maxf(bottom, vp_full.end.y - vp_safe.end.y + 18.0)
	elif OS.has_feature("web"):
		# Reads CSS env(safe-area-inset-*) exposed by custom export shell
		var raw: Variant = JavaScriptBridge.eval("window.__wsSafeInsets ? window.__wsSafeInsets() : ''")
		if raw is String and not (raw as String).is_empty():
			var parsed: Variant = JSON.parse_string(raw as String)
			if parsed is Dictionary:
				var d: Dictionary = parsed as Dictionary
				var scale_y: float = get_viewport().get_visible_rect().size.y / maxf(1.0, float(d.get("vh", 1920)))
				top = maxf(top, float(d.get("top", 0)) * scale_y + 18.0)
				bottom = maxf(bottom, float(d.get("bottom", 0)) * scale_y + 18.0)

	begin_bulk_theme_override()
	add_theme_constant_override("margin_left", roundi(left))
	add_theme_constant_override("margin_top", roundi(top))
	add_theme_constant_override("margin_right", roundi(right))
	add_theme_constant_override("margin_bottom", roundi(bottom))
	end_bulk_theme_override()
```

### 1.4 Screen Real-Estate Budget: The >= 55% Pure 3D Cinema Rule

Every screen state is audited by computing `Unobstructed 3D Cinema % = 100% − (Opaque + Frosted UI Bounding Area / 2,073,600 px²)`:

| Screen State | Max Allowed UI Footprint | Mandatory Unobstructed 3D Cinema | Key Spatial Guarantee |
| :--- | :--- | :--- | :--- |
| **Title Screen (`CAM_TITLE_ORBIT`)** | `<= 30%` | **`>= 70%`** *(Hard Floor `>= 65%`)* | Continuous open 3D hero window `Y: 360–1440 px` (`1080 px` tall!). |
| **Sightline Lock (`SIGHTLINE_LOCK`)** | `<= 42%` | **`>= 58%`** *(Hard Floor `>= 55%`)* | Unobstructed Orb & marble table `Y: 420–1240 px` (`820 px` tall) + translucent gaps. |
| **Calibrator Dial (`CALIBRATOR_DIAL`)** | `<= 32%` | **`>= 68%`** *(Hard Floor `>= 60%`)* | Brass chronometer & glowing tolerance cone own center `Y: 400–1300 px`. |
| **Codex Cryptex (`CODEX_DUAL_RING`)** | `<= 43%` | **`>= 57%`** *(Hard Floor `>= 55%`)* | Walnut/brass cryptex owns `Y: 410–1190 px`; slim conduit bars below. |
| **Gauntlet Shatter (`GAUNTLET_SHATTER`)** | `<= 28%` | **`>= 72%`** *(Hard Floor `>= 65%`)* | Full swipe stage across table; floating translucent edge chevrons only. |
| **Voiced Story Interview (`CAM_INTERVIEW_OTS`)** | `<= 36%` | **`>= 64%`** *(3D Room + Alpha Cutout)* | Cutout character overlaps live 3D room; soft gradient scrim only below `Y=1160`. |

---

## 2. AAA Mobile Title Screen Standard (Design by Subtraction)

### 2.1 Industry Benchmarks We Match

* ***Monument Valley*:** Title floats directly over impossible live 3D geometry; zero container box, zero menu clutter, single tactile entry into the world.
* ***The Room*:** Camera orbits an antique tactile puzzle object under moody warm spotlighting; touching the object responds immediately; menus tuck out of sight.
* ***Genshin Impact* & *Sky: Children of the Light*:** Full-bleed live 3D horizon with atmospheric particles; secondary controls shrink into whisper-quiet corner icons; entry is one unmistakable central threshold.
* ***Hitman GO*:** Luxury diorama table presentation with crisp geometric negative space and zero HUD until needed.

### 2.2 *World's Smartest* Title Screen Specification (`CAM_TITLE_ORBIT`)

```text
 0 px  ┌────────────────────────────────────────────────────────┐
       │  [Full-Bleed 3D Vetting Chamber — Edge-to-Edge Bleed]  │  <- Safe Top Inset
120 px │                                                 (⚙) (🔊)│  <- 128px hitboxes, 42px thin glyphs
160 px │                  ─  THE MERIDIAN  ─                    │  <- 30px tracked gold uppercase
210 px │                 WORLD'S SMARTEST                       │  <- 86px Embossed Gold Serif (NO BOX!)
315 px │            Geneva · Vetting Chamber                    │  <- 32px warm ivory @ 72% alpha
360 px ├························································┤
       │                                                        │
       │                                                        │
       │         ★ PURE UNOBSTRUCTED 3D CINEMA WINDOW ★         │
       │       Slow 3.5°/s cinematic dolly-orbit across:        │
       │       • Marble & dark walnut Vetting Table             │  <- 1,080 px tall!
       │       • Sculpted Veritas Astrolabe Orb (draggable!)    │     (>= 68% total screen)
       │       • Brass desk lamp, chess set, pocket watch       │
       │       • Floating golden dust motes & Rembrandt light   │
       │                                                        │
       │                                                        │
1440px ├························································┤
       │                                                        │
1460px │         ┌────────────────────────────────────┐         │  <- 680 × 144 px Brushed-Gold Pill
       │         │            ▶   PLAY                │         │     (or CONTINUE · ACT I LONDON)
1604px │         └────────────────────────────────────┘         │
       │                                                        │
1656px │   Campaign  ·  Daily  ·  Endless  ·  Briefing  ·  Trials│  <- Single floating hairline tab strip
       │      ●                                                 │     (108 px tall hitbox per item)
1764px │                     [ ✦ Vault ]                        │  <- Optional compact icon pill (or right tab)
1820px │  [Soft Bottom Vignette Gradient — Safe Gesture Area]   │
1920px └────────────────────────────────────────────────────────┘
```

**Strict Title Screen Laws:**
1. **Zero Box Behind the Wordmark:** `WORLD'S SMARTEST` uses soft drop shadow (`offset (0, 6)`, `alpha 0.65`) over a subtle top vignette (`alpha 0.45 → 0.0`)—NEVER a dark rectangular header card.
2. **One Hero CTA Only:** One `680 × 144 px` champagne-gold metallic pill (`PLAY` on fresh save; `CONTINUE` with subtle `30 px` sub-line `ACT I · LONDON · M06` on returning save). Tapping launches the active highlighted mode immediately with a smooth `650 ms` 3D camera push-in onto the table (zero jarring hard cut!).
3. **Minimal Single-Row Mode Drawer:** Five crisp mode tabs (`Campaign · Daily · Endless · Briefing · Trials`) sit on ONE sleek translucent obsidian ribbon (`rgba(9, 13, 22, 0.56)` + `1 px` top gold hairline, `112 px` tall). Selecting `Daily` displays a subtle cyan/gold status dot (`LIVE` vs `✓ DONE`) right next to the word `Daily`—NOT a bulky 4-line card! Tapping an inactive mode smoothly crossfades the primary CTA subtitle (`7-Prism UTC Broadcast · 3 min`, `3 Shields · Push-Your-Luck`, etc.) OR tapping twice launches immediately.
4. **Tactile *The Room* Easter Egg:** Dragging anywhere inside the `Y: 360–1440 px` 3D window physically spins `veritas_astrolabe_orb.glb` on the Title Screen with gentle `sfx_spin_tick.wav` Foley and subtle haptic clicks, proving the 3D world is genuinely live before the player even hits `PLAY`.

---

## 3. Diegetic & Minimal Luxury HUD Presentation (All 6 Core Mechanics)

### 3.1 The Golden Separation Rule (Zero Welded 3D Billboards!)

The 3D **`veritas_astrolabe_orb.glb`** on the marble table is **pure luxury horological sculpture**: concentric rotating brass armillary rings, blooming `Petal_0..5` Fabergé shutters, clamping `Caliper_0..3` jaws, and an incandescent `Crystal_Core`.
* **NEVER** glue rectangular `Label3D` text slabs, opaque flat plates, or boxy billboards onto the 3D Orb.
* Instead, couple the 3D artifact to **razor-sharp 2D Sovereign Glass Controls** anchored strictly in the bottom thumb zone (`Y: 1240–1760 px`), linked by synchronized motion, color harmony, sparks, camera framing, and machined-luxury audio/haptics.

### 3.2 Persistent Minimal Top Bar & Floating Prompt Ribbon (Gameplay States)

```text
 0 px  ┌────────────────────────────────────────────────────────┐
       │ [Top-Down Gradient Scrim: rgba(6,9,15,0.68) -> 0.0]    │  <- Seamless fade, NO opaque top box!
 88 px │ (⏸)  GENEVA · Q 2/7                 12,450   [3.0× 🔥3]│  <- 34px tabular nums; gold/amber/slate pill
168 px │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░  14.8s     │  <- 6px molten-gold Chrono-Line + 36px timer
216 px │ ┌────────────────────── HISTORY ─────────────────────┐ │  <- 1px champagne hairline glass ribbon
       │ │ Which 1815 diplomatic summit redrew Europe's       │ │  <- 46px SemiBold Ivory (#F5F1E6), 2 lines!
       │ │ borders — nicknamed "The Dancing Congress"?        │ │     rgba(8,12,20,0.62), radius 20px
380 px │ └────────────────────────────────────────────────────┘ │
420 px ├························································┤
       │                                                        │
       │            ★ UNOBSTRUCTED 3D MARBLE TABLE ★            │
       │         Veritas Astrolabe Orb · Chess · Lamp           │  <- 800 px tall live 3D stage!
       │     (Drag horizontally = spin · Drag down = peel)      │     (>= 58% total screen pure 3D)
       │                                                        │
1120px │    [ Optional Tier-2/3 Translucent Clue Strip — 92px ] │  <- Appears ONLY after Peel!
1220px ├························································┤
```

* **Zero Clutter Top Row (`Y: 88–158 px`):**
  * Left: `128×128 px` invisible hitbox around a thin `38 px` Pause `⏸` glyph + terse `32 px` Venue/Progress tag (`GENEVA · 2/7`).
  * Right: Crisp tabular-numeral Score (`40 px` gold `#F4D58D`, rolls smoothly with count-up tween) + compact Multiplier/Streak capsule (`3.0×` gold at Tier 1 → `2.0×` amber at Tier 2 → `1.2×` cool silver at Tier 3; streak `🔥3` appears only when `streak >= 2`).
  * **Endless Mode Extension:** Tiny 3-diamond Shield pip row (`◆ ◆ ◇`) sits tucked beneath the score (`24 px` tall) — zero health bars!
* **Chrono-Line (`Y: 168–204 px`):** Razor-thin `6 px` rounded progress line glowing warm champagne gold (`#E8C474`), smoothly transitioning to urgent crimson (`#FF4D63`) with subtle `2 Hz` opacity pulse at `<= 5.0 s`. Right-aligned tabular numeral (`14.8s`, `34 px` Bold).
* **Floating Prompt Ribbon (`Y: 216–396 px`):** Compact frosted obsidian glass (`rgba(8, 12, 20, 0.62)`, `1.5 px` hairline border tinted to active Domain accent at 35% alpha, `20 px` corner radius, padding `22 px` vertical / `28 px` horizontal). Domain tag (`HISTORY · COLD INSTINCT`) sits as an `28 px` tracked uppercase micro-eyebrow inside the top padding. Max height **`180 px`** (2–3 crisp lines).

### 3.3 Mechanic-by-Mechanic Luxury Interaction Layouts (Bottom Thumb Arc `Y: 1240–1780 px`)

#### A. Sightline Lock (`SIGHTLINE_LOCK` — 60% of Match Questions)
```text
1240px │  ┌────────────────────┐    ┌────────────────────┐      │  <- 476 × 128 px Translucent Glass Pills
       │  │       PARIS        │    │      UTRECHT       │      │     20px H-gap, 18px V-gap
1368px │  └────────────────────┘    └────────────────────┘      │     44px SemiBold Ivory (#F5F1E6)
1386px │  ┌════════════════════┐    ┌────────────────────┐      │
       │  ║     ★ VIENNA ★     ║    │     WESTPHALIA     │      │  <- FOCUSED PILL: 2.5px Molten Gold border
1514px │  └════════════════════┘    └────────────────────┘      │     + warm 16% gold inner glow + 3D Orb aligned
1548px │  ┌──────────────┐   ┌────────────────────────────────┐ │
       │  │  ✦ PEEL 2.0× │   │  🔒 LOCK  ·  HOLD OVERCLOCK    │ │  <- 140px tall Prime Green-Zone Dock
1688px │  └──────────────┘   └────────────────────────────────┘ │     Left 34% (330px) | Right 63% (616px)
1780px │                  [Safe Bottom Margin]                  │
```
* **Dual-Input Synchronization:**
  * **Swipe/Drag anywhere on the 3D Orb (`Y: 400–1220 px`):** Spins `veritas_astrolabe_orb.glb` with viscous inertia (`damping = 4.8`), triggering `sfx_spin_tick.wav` + `8 ms` crisp haptic detent per `90°` step and sweeping the **Focused Molten-Gold Highlight** across the 4 Answer Pills live!
  * **Direct Thumb Tap on any Answer Pill:** Immediately focuses that pill, smoothly rotates the 3D Orb (`220 ms` Ease-Out-Back) to that sector with a brass click, and activates the **`LOCK · HOLD OVERCLOCK`** bar. *(Power-user shortcut: double-tapping an already focused pill triggers an instant Safe Lock!)*
* **Clue Peeling (`PEEL SEAL`):**
  * Triggered EITHER by tapping **`✦ PEEL 2.0×`** (`330 × 140 px`) OR swiping **downward** (`dy > 110 px`) directly on the 3D Orb.
  * **3D + 2D Choreography:** `Petal_0..5` bloom outward with `sfx_peel_open.wav`; `Crystal_Core` flares bright cyan/gold; the slim **Translucent Clue Strip** (`Y: 1110–1214 px`, `940 × 104 px`, `38 px` italic champagne `#F7E3B0`) unfurls cleanly between the Orb and Answer Pills (never shifting the Orb!).
  * Second Peel (`PEEL 1.2×`): `Petal_0..5` open full blueprint; **2 decoy Answer Pills physically shatter/dissolve** (`alpha → 0.20`, hairline strike-through, `disabled = true`) in sync with golden 3D spark bursts, leaving a razor-tense 2-pill duel + Pinpoint Clue. Button transitions to subtle muted `CROWN OPEN` (`disabled`).
* **Hold-to-Overclock (`OVERCLOCK`):**
  * **Quick Tap (`< 220 ms`):** Safe Lock at active tier (`3.0×` / `2.0×` / `1.2×`).
  * **Press & Hold (`220 ms → 1050 ms`):** Right `616 × 140 px` bar illuminates left-to-right with liquid molten-gold progress fill (`OVERCLOCKING 1.65× — RELEASE TO LOCK`); in 3D, camera pushes forward (`ΔZ = -0.55 m`, FOV `44° → 36°`), `Caliper_0..3` clamp tight, `Crystal_Core` ignites incandescent white-gold, golden sparks surge upward, `sfx_overclock_rise.wav` climbs in pitch, and rhythmic heartbeat haptics escalate.
  * **Horizontal Cancel Gesture:** Sliding thumb horizontally off the button (`|dx| > 110 px` while held) vents Overclock safely with a soft steam hiss (`sfx_overclock_cancel.wav`), preventing trapped accidental locks.

#### B. Calibrator Estimation (`CALIBRATOR_DIAL` — `calibrator_chronometer.glb`)
* **3D Framing (`Y: 400–1260 px`):** Camera glides (`420 ms`) to a `55°` luxury watchmaker overhead angle framing the sculpted brass chronometer + luminous translucent amber **Tolerance Cone** projected across the dial face.
* **Floating Tabular Readout (`Y: 1270–1370 px`):** Centered frameless luxury readout — large **`58 px` Gold Tabular Value (`1815`)** flanked by **`36 px` Margin Pill (`± 8 yrs`)** and **`36 px` Risk Multiplier (`2.6×`)** (`<= ±2%` cone glows white-gold `3.5× BULLSEYE!`).
* **Precision Control Deck (`Y: 1390–1520 px`):**
  * Dragging **horizontally anywhere on the 3D dial** sweeps `Chronometer_Needle` smoothly with crisp escapement ticks.
  * Dragging **vertically on the dial** OR sliding a minimal horizontal **Cone Width Rail (`SAFE 1.0× ◄──●──► BULLSEYE 3.5×`)** at `Y: 1410–1510 px` smoothly pinches/widens the 3D amber Tolerance Cone in real time!
* **Primary Lock (`Y: 1550–1690 px`):** Single centered `680 × 140 px` gold pill **`LOCK CALIBRATION`**.

#### C. Codex Pairing (`CODEX_DUAL_RING` — `codex_cryptex.glb`)
* **3D Framing (`Y: 400–1160 px`):** Camera frames the walnut-and-brass da Vinci cryptex spinning smoothly above the marble surface.
* **3 Slim Conduit Alignment Bars (`Y: 1185–1525 px`):** Three `98 px` tall translucent glass rows (`14 px` gap) representing the 3 cryptex bands:
  * Left 44%: Fixed engraved Subject (`36 px` Ivory SemiBold, e.g., `EINSTEIN`).
  * Center 12%: Glowing gold conduit node (`━━✦━━`, lights up solid gold when changed/aligned).
  * Right 44%: Interactive Target Rotor (`◄  1905  ►`, `38 px` Gold SemiBold; tap Left/Right OR drag horizontally on that cryptex band in 3D to rotate through the 4 targets = 3 true + 1 decoy, synchronized 1:1 with `Ring_0..2` rotation in 3D!).
* **Primary Lock (`Y: 1555–1695 px`):** Single centered `680 × 140 px` gold pill **`SEAL CRYPTEX`**.

#### D. Gauntlet Swipes (`GAUNTLET_SHATTER`)
* **3D Framing (`Y: 400–1520 px` = `>= 72%` 3D Cinema!):** Frosted obsidian-crystal cipher plaques glide smoothly along the marble table toward the foreground camera with a `10.0 s` racing golden edge glow.
* **Direct Full-Stage Swipe + Dynamic Edge Chevrons:**
  * Dragging Left reveals a glowing crimson left-edge aura (`✕ FALSE`), dragging Right reveals an emerald-gold right-edge aura (`✓ TRUE`), flicking Up ignites an electric cyan top-arc aura (`▲ CHALLENGE 2.0×` for trick statements). Release beyond `130 px` threshold shatters the 3D plaque into velocity-inherited crystalline shards!
* **Thumb Tap Parity Dock (`Y: 1550–1690 px`):** Three sleek translucent pills (`✕ FALSE` `290 px` | `▲ TRICK 2×` `320 px` | `✓ TRUE` `290 px`, `140 px` tall) so players in tight spaces or one-handed grip can tap just as fast as swiping!

#### E. Verdict & Micro-"Aha!" Intel Flash (Zero Full-Screen Modal!)
After answer lock + `380 ms` suspense beat, the bottom controls (`Y: 1240–1700 px`) smoothly crossfade (`240 ms`) into a single refined **Intel Flash Glass Ribbon** while the entire upper **65% 3D arena celebrates**:
* **Header Row (`Y: 1265–1335 px`):** Crisp status badge (`✦ LOCKED · +1,840 PTS` in champagne gold, or `✕ BACKFIRE · ANS: VIENNA` in crimson, `40 px` Bold) + tiny `Bookmark ★` toggle icon (`112×112 px` hitbox) on the right.
* **Micro-Aha! Fact (`Y: 1345–1515 px`):** Crisp `38 px` (`~14.5 sp`) warm ivory 2–3 line `whyExplanation` (`<= 180 chars`) — punchy cocktail-party payoff!
* **Continue CTA (`Y: 1545–1685 px`):** Full-width `940 × 140 px` champagne-gold **`NEXT QUESTION ▸`** (or **`VIEW DISPATCH ▸`** on final question).

---

## 4. Character Dialogue & Cutout Portrait Presentation (*Hades* × *Persona 5* × *Disco Elysium*)

### 4.1 Synthesis of AAA Reference Craft
* ***Hades* (Supergiant):** High-craft 2D illustrated character bust with **full alpha cutout** breaking freely out of any bounding frame to overlap the live 3D environment; grounded lower-third typography with generous padding; subtle breathing sway creates theatrical intimacy without hiding the world.
* ***Persona 5* (Atlus):** Energetic cut-in entrance with horizontal slip + chamfered high-contrast speaker banner; UI geometry snaps decisively when transitioning from passive reading to high-stakes player choices.
* ***Disco Elysium* (ZA/UM):** Literary rhythm, distinct typographic styling for observational subtext/tells (italics in muted accent), and moral weight conveyed through subtle voice cadence rather than cartoonish exclamation marks.

### 4.2 World's Smartest Voiced Interview & Cutscene Spec (`CAM_INTERVIEW_OTS`)

**HARD BAN:** Zero `QuadMesh` floating picture frames in 3D space (`StageMonolithAnchor/PortraitScreen` MUST be deleted). Zero boxed `PortraitFrame` thumbnails (`96×118`) inside dialogue panels.

```text
 0 px  ┌────────────────────────────────────────────────────────┐
       │ [Live 3D Vetting Chamber — CAM_INTERVIEW_OTS Over Table]│
 88 px │ (⏸)  ACT I · GENEVA                      [SKIP ▸] [🔊] │  <- Minimal top-edge controls
260 px │                                                        │
       │                    .-""""""-.                          │
       │                  .'  (o  o)  '.  <─ Alpha-Matted PNG   │  <- godot/assets/portraits_cutout/
       │                 /    \ == /    \    ZERO BORDER/FRAME! │     vance.png (transparent alpha!)
       │                |   .-'----'-.   |   Eyes @ Y=480-560px │
       │               /   /   \  /   \   \  Subtle ±5px breathe│
       │              /   /     \/     \   \ + Voice Rim Pulse! │
1060px │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│  <- Seamless Bottom-Up Scrim begins
1180px │  ┃ JULIAN VANCE  ·  Chief Arbiter               ılılı  │  <- Chamfered Gold Nameplate + Live VO Bars
1255px │  "Two billion viewers are watching the prism. Trust    │  <- 44px Ivory Cinema Subtitles
       │   your first sightline—or peel the crown if doubt      │     (Max 3 lines, 36-42 CPL)
       │   creeps in."                                          │
1425px │   — Vance adjusts his left brass cufflink.             │  <- 34px Italic Champagne-Cyan Tell Hint
1495px │  ┌──────────────────────────────────────────────────┐  │
       │  │ Flag the mirror breach to Vance      [+INTEGRITY]│  │  <- 108px tall Luxury Choice Pills
1603px │  └──────────────────────────────────────────────────┘  │     (16px vertical gap; max 3 choices)
1619px │  ┌──────────────────────────────────────────────────┐  │
       │  │ Exploit the reflected hint silently  [+AMBITION] │  │
1727px │  └──────────────────────────────────────────────────┘  │
1820px │                [Safe Bottom Gesture Margin]            │
1920px └────────────────────────────────────────────────────────┘
```

**Exact Implementation Rules for `@godot-aaa-director`:**
1. **Cutout Compositing & Positioning:**
   * Load transparent alpha-matted `godot/assets/portraits_cutout/<speaker_id>.png` into a `TextureRect` (`expand_mode = EXPAND_IGNORE_SIZE`, `stretch_mode = STRETCH_KEEP_ASPECT_CENTERED`, `mouse_filter = MOUSE_FILTER_IGNORE`) occupying `X: 60–1020 px`, `Y: 240–1360 px` (`Z-index` **below** the Subtitle Scrim so the lower torso dissolves seamlessly behind the bottom gradient—never cut off by a hard horizontal edge!).
   * **Zero Outline / Zero Drop-Shadow Box:** Apply ONLY a soft subtle bottom alpha-fade shader (`smoothstep(0.72, 0.98, UV.y)`) so the torso feathers cleanly into the obsidian scrim!
2. **Living Portrait Animation & Real Neural Voice Sync (`voice/*.mp3`):**
   * **Entrance:** `position.x` slides `+48 px → 0` (`TRANS_CUBIC`, `EASE_OUT`, `320 ms`), `modulate.a` `0.0 → 1.0` (`260 ms`), `scale` `0.97 → 1.00`.
   * **Speaker Switch:** Outgoing portrait fades out (`180 ms`, `-30 px` drift) while incoming glides in (`280 ms`), overlapping smoothly.
   * **Idle Breathing:** `position.y = base_y + sin(t * 1.65) * 5.0` and `scale = Vector2.ONE * (1.0 + sin(t * 1.65) * 0.006)`.
   * **Live Neural Voice Reactivity:** Sample `AudioServer.get_bus_peak_volume_left_db(voice_bus_idx)` every frame; drive the **3 vertical gold VO equalizer bars** (`ılılı`) beside the nameplate AND apply a gentle `+0.06` warm specular lift (`modulate` brightness `1.0 → 1.06`) while speaking!
   * **Observational Tell Cue:** When `DialogueDisplay.tellHint` is present, render it at `34 px` italic muted cyan-gold (`#9BD5E8`), subtly pulsing alpha `0.75 ↔ 1.0` once on reveal to reward observant players without feeling gamey.
3. **Gameplay Mid-Match Micro-Reactions (No Permanent Dialogue Box!):**
   * During active trivia (`SIGHTLINE_LOCK`, etc.), the full interview portrait is **HIDDEN**.
   * After a big play (Tier-1 Overclock, Backfire, Rival Bluff), glide in a **non-blocking 1.8-second floating Cinema Quip Toast** at `Y: 1110–1210 px` (`880 × 96 px` translucent pill): left `80 × 80 px` circular-masked cutout head + 1-line `34 px` spoken quip (`<= 60 chars`) synced to short Tier-2 voice sting, then dissolve cleanly (`220 ms`).

---

## 5. Viral Daily Result Text-Share Specification (*The Global Feed*)

### 5.1 Behavioral Psychology Behind Wordle, Connections & TimeGuessr Virality

Research into daily puzzle sharing reveals **five non-negotiable engineering rules** for organic SMS/WhatsApp/Discord virality:
1. **The Picture Superiority Effect:** Vivid, high-contrast full-color emoji matrices stop scroll velocity in messaging threads; monochrome Unicode symbols (`✦ ◈ ◇ ✖`) blend into prose and fail cross-OS baseline alignment.
2. **The Cryptic Zero-Spoiler Narrative:** Outsiders see an intriguing visual code; fellow players instantly read the exact emotional arc (*"Wait—you Overclocked Q4 AND blew up on Q5 too?!"*), creating an immediate **virtual watercooler** conversation.
3. **Zero Line-Wrap / Zero Alignment Drift:** Every emoji in the visual strip MUST be a **standard full-width Unicode color emoji** (no mixed half-width symbols like `▫️` or `✖`, no spaces forcing wrap on 320px SMS bubbles). Single-strip design guarantees 100% alignment across iOS Messages, Android Google Messages, WhatsApp, Discord, Slack, and X.
4. **Compact Envelope (`5–6 lines`, `<= 165 chars`):** Feels like a crisp personal artifact, NOT a promotional billboard. Ban marketing slogans (`Spin · Peel · Overclock`) and duplicate percentile phrasing (`Top 4% (96th %ile)`).
5. **Dual-Channel Legibility (Color-Blind Safe):** Pair distinct emoji silhouettes (`💎`, `🟨`, `🟩`, `🟦`, `🎯`, `💥`, `⬛`) with an explicit compact stat summary line.

### 5.2 Exact *World's Smartest* Daily Share Card Format

**Edition Numbering:** Deterministic UTC sequential dispatch number starting from Launch Epoch `2026-07-01` (or `day_index = floor((utc_epoch - epoch_start) / 86400) + 1`), displayed as `#144` alongside score & global percentile.

**Exact 7-Glyph Semantic Alphabet (100% Full-Width Universal Color Emojis):**

| Emoji | Mechanical Meaning (Zero Spoilers) | Emotional Watercooler Signal |
| :---: | :--- | :--- |
| `💎` | **Tier-1 Overclock Hit (`3.0×` + Overclock)** | Pure cold-instinct nerve — peak prestige flex! |
| `🟨` | **Tier-1 Cold Instinct (`3.0×`, Safe Lock)** | Unassisted gold mastery — no clues needed. |
| `🟩` | **Tier-2 Peel Solve (`2.0×`, Lateral Clue)** | Sharp deduction after cracking one shutter. |
| `🟦` | **Tier-3 Blueprint Solve (`1.2×`, Pinpoint)** | Survived via exploded blueprint & decoy shatter. |
| `🎯` | **Calibrator Bullseye (`<= ±3%` Margin)** | Surgical precision on the Q7 Brass Chronometer! |
| `💥` | **Overclock Backfire (Wager Crashed!)** | The funniest, most viral tragedy in group chats! |
| `⬛` | **Missed / Chrono Expired** | Clean non-overclock miss or timeout. |

*(Priority rule for each of the 7 Daily Questions: if `!correct && backfired` → `💥`; else if `!correct` → `⬛`; else if `bullseye` → `🎯`; else if `overclocked && peel_tier == 1` → `💎`; else if `peel_tier == 1` → `🟨`; else if `peel_tier == 2` → `🟩`; else → `🟦`.)*

**Exact Output Template (5 Lines — Zero Fluff!):**

```text
WORLD'S SMARTEST · #144
🏆 14,820 · Top 4%

💎🟨🟩💎💥🟦🎯

6/7 · ⚡2 Overclocks · 🔥4 Streak
```

**Why This Exact Card Dominates Group Chats (Compare 3 Player Archetypes):**
* *The Cold Genius (Perfect Run):* `💎💎🟨💎🟨🟨🎯` → `7/7 · ⚡3 Overclocks · 🔥7 Streak`
* *The Reckless Maverick (High Drama):* `💎💥💎💥💎🟨🎯` → `5/7 · ⚡3 Overclocks · 🔥2 Streak`
* *The Methodical Detective (Safe):* `🟨🟩🟩🟦🟩🟨🟩` → `7/7 · ⚡0 Overclocks · 🔥7 Streak`

### 5.3 Reliable One-Tap Clipboard Copy (Native Android/Desktop + Web Chrome/Safari)

Web browsers block `navigator.clipboard.writeText()` outside a direct user gesture or non-HTTPS origin. `@godot-aaa-director` MUST implement this exact dual-path helper called directly from the `COPY RESULT` button's `pressed` signal:

```gdscript
class_name ShareClipboard
extends RefCounted

static func copy_text(text: String) -> bool:
	if not OS.has_feature("web"):
		DisplayServer.clipboard_set(text)
		return true
	var escaped: String = JSON.stringify(text)
	var js: String = """
	(function(txt){
		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(txt).catch(function(){
				var ta = document.createElement('textarea');
				ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
				document.body.appendChild(ta); ta.focus(); ta.select();
				try { document.execCommand('copy'); } catch(e) {}
				document.body.removeChild(ta);
			});
			return true;
		}
		var ta = document.createElement('textarea');
		ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
		document.body.appendChild(ta); ta.focus(); ta.select();
		var ok = false;
		try { ok = document.execCommand('copy'); } catch(e) {}
		document.body.removeChild(ta);
		return ok;
	})(%s);
	""" % escaped
	JavaScriptBridge.eval(js)
	return true
```
* **UX Feedback on Tap:** Button text morphs for `2.0 s` from **`📋 COPY SHARE CARD`** → **`✓ COPIED TO CLIPBOARD`** with an emerald-gold border flash + `12 ms` crisp double-tick haptic + subtle `sfx_brass_snap.wav`. Display the live emoji preview inside a sleek monospace/emoji preview box above the button so players see their trophy grid before tapping copy!

---

## 6. Exact Pixel/Percentage Blueprint for Godot 4.7.2 (`1080 × 1920` + Responsive Desktop)

### 6.1 Master Layout Zones & Coordinates Table (`1080 × 1920` Reference)

| Zone ID | Y Range (px) | Y Range (%) | Height (px) | X Inset (px) | Godot Anchor / Container | `mouse_filter` |
| :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| `SafeTopBleed` | `0 – 72` *(dyn)* | `0.0 – 3.8%` | `72+` | `0` | Outside `SafeMarginContainer` | `IGNORE` |
| `TopScrim` | `0 – 240` | `0.0 – 12.5%` | `240` | `0` | Full-Width `TextureRect` gradient | `IGNORE` |
| `TopHUDRow` | `72 – 160` | `3.8 – 8.3%` | `88` | `48` | `HBoxContainer` inside SafeMargin | `IGNORE` (Btns `STOP`) |
| `ChronoRail` | `168 – 206` | `8.8 – 10.7%` | `38` | `48` | `HBoxContainer` (`6px` bar + `34px` time) | `IGNORE` |
| `PromptRibbon` | `216 – 396` | `11.3 – 20.6%` | `156 – 180` | `48` | `PanelContainer` (translucent glass) | `IGNORE` |
| **`Cinema3DWindow`** | **`396 – 1230`** | **`20.6 – 64.1%`** | **`834`** | **`0`** | **Empty `Control` (`SIZE_EXPAND_FILL`)** | **`IGNORE` (Mandatory!)** |
| `PeelClueStrip` | `1110 – 1216` | `57.8 – 63.3%` | `106` | `64` | Floating overlay (visible Tier 2/3 only) | `IGNORE` |
| `AnswerPillGrid` | `1240 – 1516` | `64.6 – 79.0%` | `276` | `54` | `GridContainer` (`columns = 2`, gap `20/18`) | `PASS` (Pills `STOP`) |
| `PrimaryActionDock` | `1548 – 1688` | `80.6 – 87.9%` | `140` | `54` | `HBoxContainer` (`34% Peel` + `63% OC`) | `IGNORE` (Btns `STOP`) |
| `BottomScrim` | `1160 – 1920` | `60.4 – 100%` | `760` | `0` | Full-Width `TextureRect` gradient | `IGNORE` |
| `SafeBottomBleed` | `1818 – 1920` *(dyn)* | `94.7 – 100%` | `102+` | `0` | Outside `SafeMarginContainer` | `IGNORE` |

### 6.2 Responsive Desktop / Widescreen (`16:9`) Hybrid Layout Spec

Do **NOT** lock desktop browsers into a cramped pillarboxed phone rectangle flanked by dead black bars! Configure `project.godot` as:
```ini
[display]
window/size/viewport_width=1080
window/size/viewport_height=1920
window/stretch/mode="canvas_items"
window/stretch/aspect="expand"
```
And apply this exact **Two-Layer Responsive Rule** inside `HUDRoot`:
1. **3D Scene (`Camera3D`):** Set `keep_aspect = Camera3D.KEEP_HEIGHT` (default `fov = 44.0°`). On a `16:9` desktop monitor, the 3D Vetting Chamber, marble table, chess set, desk lamp, and architectural columns expand **panoramically edge-to-edge** in full widescreen cinema!
2. **2D HUD Column (`HUDColumn` Control):**
   * On **Portrait (`vp.x <= vp.y * 0.72`):** `HUDColumn` fills `100%` width (`anchor_left = 0.0`, `anchor_right = 1.0`).
   * On **Landscape / Tablet / Desktop (`vp.x > vp.y * 0.72`):** Center `HUDColumn` horizontally with **`custom_minimum_size.x = 1080.0`** (max width capped at `1080 px` logical units, anchored `0.5` horizontally!) so buttons, prompts, and answer pills NEVER stretch into grotesque 2,400px-wide ribbons, while `TopScrim` and `BottomScrim` span `100%` viewport width cleanly!

### 6.3 Sovereign Modernism Typography Scale (`1080 × 1920` Reference)

**Font Pairing (Bundled `.ttf`/`.otf` with Godot MSDF Enabled: `msdf_size = 48`, `msdf_pixel_range = 8`, `generate_mipmaps = true`):**
* **Display / Prestige Serif:** *Cinzel* or *Cormorant Garamond SemiBold/Bold* (Title wordmark, Venue names, Chapter headers, Daily Dispatch title).
* **UI / Editorial Sans:** *Inter* or *Plus Jakarta Sans* (`Medium`, `SemiBold`, `Bold` — NEVER Light/Thin!; enable tabular numerals for scores/timers).

| Token | Role | Font Family | Size (`1080p` px) | Mobile `sp` (`360–412dp`) | Weight | Line Height | Max Measure |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `TYPE_HERO` | Title Wordmark (`WORLD'S SMARTEST`) | Prestige Serif | `86 px` | `29–33 sp` | Bold | `1.08` | 1–2 lines |
| `TYPE_H1` | Overlay / Dispatch / Chapter Title | Prestige Serif | `58 px` | `19–22 sp` | Bold | `1.15` | `<= 26 chars` |
| `TYPE_NUM_HERO` | Calibrator Big Value / Final Score | Editorial Sans (`tnum`) | `58 px` | `19–22 sp` | Bold | `1.05` | 1 line |
| `TYPE_PROMPT` | Trivia Question Prompt | Editorial Sans | `46 px` *(min `42 px`)* | **`16–18 sp`** | SemiBold | `1.26` | **34–42 CPL · 2–3 lines** |
| `TYPE_PILL` | Answer Pill Text / Primary CTA | Editorial Sans | `44 px` *(min `38 px`)* | **`15–17 sp`** | SemiBold | `1.15` | `<= 28 chars` (1–2 lines) |
| `TYPE_SUBTITLE` | Voiced Interview Cinema Subtitles | Editorial Sans | `44 px` | **`15–17 sp`** | Medium | `1.30` | **36–42 CPL · max 3 lines** |
| `TYPE_INTEL` | Peel Clue / Verdict "Why" Micro-Fact | Editorial Sans | `38 px` | `13–14.5 sp` | Regular/Italic | `1.28` | `<= 180 chars` (2–3 lines) |
| `TYPE_HUD` | Score, Timer, Speaker Nameplate, Choices | Editorial Sans (`tnum`) | `36 – 40 px` | `13–15 sp` | Bold | `1.15` | 1 line |
| `TYPE_BADGE` | Eyebrow / Domain Pill / Tag *(FLOOR!)* | Editorial Sans | **`30 – 32 px`** | **`11–12 sp`** | **Bold Uppercase** | `1.10` | `<= 22 chars` |

### 6.4 Sovereign Modernism Palette, Luxury `StyleBoxFlat` & WCAG 2.1 Contrast Spec

Avoid pure `#FFFFFF` on `#000000` (causes OLED halation glow in dark rooms). All pairings below clear **WCAG 2.1 Level AA (`>= 4.5:1` normal text, `>= 3.0:1` UI borders/components)** even over sunlit/lit 3D marble backdrops thanks to enforced scrims:

| Semantic Token | Hex / RGBA Value | Usage | Verified Contrast Ratio |
| :--- | :--- | :--- | :--- |
| `INK_IVORY` | `#F5F1E6` | Primary Prompts, Subtitles, Pill Labels | **`15.4 : 1`** over `GLASS_OBSIDIAN` |
| `INK_MUTED` | `#C3CCDC` | Secondary Roles, Metadata, Sub-labels | **`9.8 : 1`** over `GLASS_OBSIDIAN` |
| `GOLD_CHAMPAGNE` | `#F2D28B` | Focused Pill Border, Active Tab, Score, Wordmark | **`11.2 : 1`** over `GLASS_OBSIDIAN` |
| `GOLD_BRASS` | `#D4A853` | Primary CTA Fill Gradient (with `#11151E` Dark Ink!) | **`8.4 : 1`** (`#11151E` text on `#D4A853`) |
| `EMERALD_LOCK` | `#4CE0A0` | Verified Correct / Bullseye Accent | **`10.1 : 1`** over `GLASS_OBSIDIAN` |
| `CRIMSON_FRACTURE` | `#FF5C72` | Overclock Backfire, `<= 5s` Timer, Fracture State | **`5.9 : 1`** over `GLASS_OBSIDIAN` |
| `CYAN_INTEL` | `#6CE0F5` | Character Tell Hints, Daily Live Dot, Trick Challenge | **`11.6 : 1`** over `GLASS_OBSIDIAN` |
| `GLASS_OBSIDIAN` | `rgba(10, 14, 24, 0.72)` | Translucent Answer Pills & Prompt Ribbon fill | Base dark anchor |
| `GLASS_FOCUSED` | `rgba(38, 30, 16, 0.84)` | Focused Answer Pill fill + `2.5 px` `#F2D28B` border | High-arousal selection state |
| `SCRIM_EDGE` | `rgba(6, 9, 16, 0.0 → 0.88)` | Seamless top/bottom vignette scrim behind floating text | Guarantees `>= 7:1` over bright 3D speculars |

**`gl_compatibility` Web-Safe Luxury Glass Recipe (Zero Heavy Multi-Pass Blur Lag!):**
In Godot 4.7.2 WebGL2 (`gl_compatibility`), stacking `BackBufferCopy` shaders on 6 separate UI pills causes frame drops on mid-range Android Chrome. Instead, achieve true luxury smoked-glass depth at **zero extra render-pass cost** using `StyleBoxFlat` with:
* `bg_color = Color(0.039, 0.055, 0.094, 0.72)`
* `border_width_top = 2`, `border_width_left/right/bottom = 1` (asymmetric top-edge specular highlight!)
* `border_color = Color(0.949, 0.824, 0.545, 0.34)` (top light-catch rim!)
* `corner_radius_all = 18` (`70` full-pill on primary CTA!)
* `shadow_color = Color(0.0, 0.0, 0.0, 0.42)`, `shadow_size = 14`, `shadow_offset = Vector2(0, 6)`

### 6.5 Animation Timing, Easing, Hit-Stop & Game-Feel Spec (Godot 4.7.2 `Tween`)

**Zero Linear UI Tweens!** Every movement carries machined horological weight:

| Interaction / Beat | Duration | Anticipation / Hit-Stop | Godot `Tween` Curve (`TRANS` + `EASE`) | Cubic-Bezier Equiv. | Tactile 3D / Audio / Haptic Coupling |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **Button Touch Down** | `75 ms` | None | `TRANS_QUAD` + `EASE_OUT` | `(0.25, 1, 0.5, 1)` | Scale `1.0 → 0.96`; `sfx_ui_tick` (`-6 dB`); `8 ms` tap haptic. |
| **Button Release Spring** | `160 ms` | None | `TRANS_BACK` + `EASE_OUT` | `(0.34, 1.56, 0.64, 1)` | Scale `0.96 → 1.00`; border luminance flash `+25%`. |
| **Answer Pill Focus + Orb Snap** | `220 ms` | None | `TRANS_BACK` + `EASE_OUT` | `(0.22, 1.28, 0.36, 1)` | 3D Orb rotates to sector; `sfx_spin_tick.wav`; `10 ms` click; focused pill border blooms to `2.5 px` gold. |
| **Peel Seal (`Petal_0..5` Bloom)** | `340 ms` | `40 ms` slight inward compress | `TRANS_CUBIC` + `EASE_OUT` | `(0.22, 1, 0.36, 1)` | Petals spiral open; `sfx_peel_open.wav`; Clue Strip unfurls `240 ms`; multiplier badge punches `1.22× → 1.0×`. |
| **Tier-3 Decoy Pill Shatter** | `260 ms` | `60 ms` stagger per decoy | `TRANS_EXPO` + `EASE_OUT` | `(0.16, 1, 0.3, 1)` | Pill scale `1.0 → 0.94`, `alpha → 0.20`; 3D spark shower off Orb. |
| **Overclock Hold Charge** | `220 → 1050 ms` | Starts after `220 ms` hold | Continuous `ease(t, 0.75)` ramp | Smooth accelerating tension | Camera FOV `44° → 36°`, `ΔZ = -0.55 m`; `Caliper_0..3` clamp inward; `sfx_overclock_rise.wav`; pulsing haptics `12→28 ms`. |
| **Question Reveal & Grace** | `260 ms` | **`1,200 ms` Reading Grace** before Chrono drains *(aligns w/ Research #1 `R1-01`)* | `TRANS_CUBIC` + `EASE_OUT` | `(0.22, 1, 0.36, 1)` | Prompt Ribbon + 4 Answer Pills glide in (`18 px` upward stagger `35 ms`); Chrono-Line breathes softly for `1.20 s` before draining. |
| **Overclock Lock Slam** | `180 ms` | **`45–80 ms` HIT-STOP freeze!** | `TRANS_QUINT` + `EASE_OUT` | `(0.23, 1, 0.32, 1)` | Freeze 3D spin & charge bar `45–80 ms` → slam `sfx_lock_thunk.wav` + `45 ms` heavy thud haptic → Dynamic Suspense Silence (`350 ms` Safe / `750 ms` Overclock / `1150 ms` Boss, hard cap `<= 1250 ms`). |
| **Correct Gold Resonance** | `420 ms` | Follows Suspense Silence (`600 ms` Intel tap-skip unlock) | `TRANS_BACK` + `EASE_OUT` | `(0.34, 1.45, 0.64, 1)` | Golden particle burst off Orb; camera eases back to `44°`; score rolls up over `380 ms`; Intel Flash crossfades in (`240 ms`, tap-skip unlocked at `600 ms`). |
| **Backfire / Wrong Fracture** | `380 ms` | **`55 ms` HIT-STOP freeze!** | `TRANS_EXPO` + `EASE_OUT` | `(0.19, 1, 0.22, 1)` | Crimson Fracture light flash; damped camera trauma shake (`amp = 0.22`, decay `7.5/s`); `65 ms` rough buzz haptic; wrong pill shakes `±12 px` (`240 ms`). |
| **Cutout Portrait Cut-In** | `320 ms` | None | `TRANS_CUBIC` + `EASE_OUT` | `(0.22, 1, 0.36, 1)` | `ΔX: +48 px → 0`, `alpha 0 → 1`, `scale 0.97 → 1.0`; camera glides over table (`550 ms`, `TRANS_CUBIC` `EASE_IN_OUT`). |
| **Mode Drawer / Sheet Open** | `280 ms` | None | `TRANS_QUINT` + `EASE_OUT` | `(0.22, 1, 0.36, 1)` | Slides up `120 px → 0` with `alpha 0 → 1`; Exit faster (`200 ms`, `TRANS_QUAD` `EASE_IN`). |
| **Copy Share Toast** | `220 ms` in / `180 ms` out | Holds `2000 ms` | `TRANS_BACK` + `EASE_OUT` | `(0.34, 1.35, 0.64, 1)` | Emerald-gold border flash + `12 ms` double-tap haptic. |

### 6.6 Clean Godot 4.7.2 `CanvasLayer` Node Hierarchy Blueprint

```text
MainArena (Node3D)
├── WorldEnvironment (Poly Haven HDRI PanoramaSkyMaterial + ACES Filmic + subtle Glow bloom=0.08)
├── ArenaCamera (Camera3D — KEEP_HEIGHT, fov=44.0, smooth preset tweens)
├── LightingRig (Warm Rembrandt KeyLight + Cool Twilight Rim + Desk Lamp Spot + Bounce)
├── VenueRoot (Node3D — Real Blender architectural rooms + Poly Haven props on Y=0.78m table)
├── VeritasArtifactRig (Node3D — swaps veritas_astrolabe_orb / calibrator_chronometer / codex_cryptex / world_globe)
└── HUDLayer (CanvasLayer, layer = 10)
    └── HUDRoot (Control — Full Rect, MOUSE_FILTER_IGNORE)
        ├── TopScrim (TextureRect — Full Width, H=240, vertical gradient, MOUSE_FILTER_IGNORE)
        ├── BottomScrim (TextureRect — Full Width, H=760, vertical gradient, MOUSE_FILTER_IGNORE)
        ├── PortraitStage (Control — Full Rect, MOUSE_FILTER_IGNORE)
        │   └── CutoutPortraitRect (TextureRect — transparent PNG bust + bottom feather shader)
        └── HUDColumn (Control — responsive centered max-width 1080px, MOUSE_FILTER_IGNORE)
            └── SafeMargin (MarginContainer — SafeMarginContainer.gd, MOUSE_FILTER_IGNORE)
                ├── TitleOverlay (Control — Full Rect, MOUSE_FILTER_IGNORE)
                │   ├── TopCrest (Eyebrow + Embossed Serif Wordmark + Corner Utility Icons)
                │   └── BottomEntryDock (1 Gold PLAY CTA + Single-Row Mode Ribbon)
                ├── GameplayHUD (Control — Full Rect, MOUSE_FILTER_IGNORE)
                │   ├── TopBar (Pause/Venue | Score + Multiplier/Shields + ChronoLine)
                │   ├── PromptRibbon (Floating translucent 2-line question card)
                │   ├── PeelClueStrip (Appears Tier 2/3 only)
                │   ├── ReactionToast (1.8s ephemeral mid-match character quip)
                │   ├── MorphDeck (Swaps cleanly: Sightline2x2 | CalibratorReadout | CodexSlots | GauntletDock)
                │   ├── ActionDock (Peel Button + Hold-to-Overclock Bar)
                │   └── IntelFlashBar (Compact verdict + Why fact + NEXT CTA)
                ├── InterviewOverlay (Control — Full Rect, MOUSE_FILTER_IGNORE)
                │   ├── SpeakerBanner (Chamfered Nameplate + Live VO Equalizer Bars)
                │   ├── SubtitleBlock (44px 3-line max + Italic Tell Hint)
                │   └── ChoiceStack (Up to 3 sleek 108px luxury choice pills)
                └── ModalLayer (Control — Globe/Mission Drawer, Daily Dispatch Share Card, Settings)
```

---

## 7. Binary QA & Art Critic Audit Rubric (For `@qa-art-critic` Gate 3)

`@qa-art-critic` SHALL grade `@godot-aaa-director`'s live renders and screenshots against these **15 objective pass/reject criteria**. Any **single CRITICAL failure** triggers an immediate **REJECT** ticket:

| # | Severity | Measurable Criterion | PASS Threshold | Automatic REJECT Trigger |
| :-: | :---: | :--- | :--- | :--- |
| **1** | **CRITICAL** | **Title Screen 3D Cinema Ratio** | **`>= 65%`** unobstructed live 3D Vetting Chamber; ONLY Crest + 1 primary CTA + 1 single-row mode ribbon. | Any 2×2 dashboard grid, >1 primary card stack, or dark box behind `WORLD'S SMARTEST`. |
| **2** | **CRITICAL** | **Gameplay 3D Cinema Ratio** | **`>= 55%`** unobstructed live 3D table + Veritas Orb during active `SIGHTLINE_LOCK`. | Stacked opaque `PanelContainer`s squeezing the 3D window below `55%`. |
| **3** | **CRITICAL** | **Zero Welded 3D Billboards** | **`0`** giant rectangular `Label3D` / flat cards glued onto `veritas_astrolabe_orb.glb`. | Any flat box/rectangle floating around or welded onto the 3D Orb. |
| **4** | **CRITICAL** | **Zero Portrait Picture Frames** | **`0`** 3D `PortraitScreen` `QuadMesh` AND **`0`** boxed `PortraitFrame` thumbnails; transparent alpha-cutout busts only. | Any rectangular frame, visible crop box, or jagged white halo around character art. |
| **5** | **CRITICAL** | **Zero Permanent Gameplay Dialogue Box** | Dialogue container hidden during active trivia; mid-match reactions use ephemeral `<= 2s` toast only. | Permanent `DialoguePanel` eating bottom screen during trivia questions. |
| **6** | **CRITICAL** | **Zero Dev/Debug Clutter on Live HUD** | Zero `JSON N Qs`, `SEEN`, `BROADCAST/FRACTURE` debug toggles, or `CAST ▸` buttons on live HUD. | Any developer/debug telemetry visible outside Settings/Debug menu. |
| **7** | **CRITICAL** | **Prompt & Answer Typography Floor** | Prompts **`>= 42–46 px`** (`>= 16 sp`), Answer Pills **`>= 38–44 px`**, Subtitles **`>= 44 px`**, Micro-badges **`>= 30 px`** Bold; MSDF enabled. | Any body/prompt text `< 40 px` (old build was `28 px`) or overflowing `> 3` lines. |
| **8** | **CRITICAL** | **Thumb-Zone Ergonomics & Hitboxes** | All gameplay taps inside `Y >= 1220 px`; primary buttons **`>= 132 px`** tall; pills **`>= 124 px`** tall; gutters **`>= 18 px`**. | Tiny `< 100 px` buttons, answer controls placed in Top Red Zone, or colliding margins. |
| **9** | **CRITICAL** | **Safe-Area Clearance & Full-Bleed 3D** | `SafeMarginContainer` active (Native + Web CSS fallback); 3D scene bleeds `0..1920`; zero buttons below `Y=1818`. | UI clipped by notch/home bar OR ugly black letterbox bars cutting off the 3D background. |
| **10** | **HIGH** | **Responsive Desktop Widescreen** | On `16:9` desktop, 3D room spans full widescreen (`KEEP_HEIGHT`) while interactive HUD column clamps cleanly to `<= 1080 px` centered. | Stretched 2,500px-wide answer buttons OR tiny phone box trapped in black pillarboxes. |
| **11** | **HIGH** | **WCAG 2.1 Contrast Over 3D Scene** | All text clears **`>= 4.5:1`** (backed by translucent obsidian glass + edge vignette scrims); ivory `#F5F1E6` over dark glass. | Raw white text floating unreadably over bright marble/gold highlights with no scrim. |
| **12** | **HIGH** | **All 4 Morphs Distinct & One-Thumb Ready** | Distinct, uncluttered layouts for Sightline (2×2 pills + 3D spin), Calibrator (overhead chronometer + cone rail), Codex (3 conduit rows + 3D rings), Gauntlet (full-stage swipe + tap parity). | Reusing the same static 4-button layout for Calibrator/Codex/Gauntlet. |
| **13** | **HIGH** | **Juicy Motion, Hit-Stop & Feedback** | Non-linear `Tween` curves (`BACK`/`CUBIC`/`QUINT`), `45–55 ms` Overclock Lock hit-stop, camera FOV push-in on Overclock, `360 ms` suspense beat, crisp audio + haptics. | Instant snapping pop-ins, linear tweens, or silent button taps. |
| **14** | **CRITICAL** | **Viral Daily Share Format & Reliable Copy** | Exact **5-line full-color emoji card** (`💎🟨🟩🟦🎯💥⬛`), zero spoilers, zero monochrome dingbats, zero tagline spam; `ShareClipboard` works on Android Chrome + Desktop + Native with `✓ COPIED` toast. | Old dingbat format (`✦ ◈ ◇ ✖`), broken Web clipboard, or missing Share button on Daily summary. |
| **15** | **HIGH** | **Live Voice + Cutout Synchronization** | Neural VO (`voice/*.mp3`) plays with animated gold equalizer bars, subtle portrait breathing/rim-pulse, italic Tell cue, and crisp tap-to-advance pacing. | Silent frozen portrait or text overflowing behind choices. |
