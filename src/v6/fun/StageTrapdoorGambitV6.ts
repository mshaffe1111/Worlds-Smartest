// ============================================================================
// WORLD'S SMARTEST v6.0 — Stage Trapdoor Gambit (8-Second 3D Survival Pit!)
// Inspired by Trivia Murder Party 2's Killing Floor:
//   When a player misses a clue, instead of a dull failure screen, the 3D
//   stage trapdoor bursts open into 10 rotating, hilarious, high-adrenaline
//   6.5–8.0 second survival mini-games!
//   Survive -> STREAK SAVED + DAREDEVIL CHIPS + STAGE HEAT + CROWD ROARS!
//
// Zero-Scroll · Custom Brass Controls · Crisp Physical Surfaces · Pure SVG Icons
// ============================================================================

import type { FoleySfxIdV6 } from '../contracts_v6';

export type TrapdoorPitIdV6 =
  | 'pit_01_rock_band_or_fake'
  | 'pit_02_safe_dial_blades'
  | 'pit_03_live_green_fuse'
  | 'pit_04_real_country_or_fake'
  | 'pit_05_pneumatic_lava_piston'
  | 'pit_06_element_or_potion'
  | 'pit_07_counterfeit_shredder'
  | 'pit_08_oscilloscope_hold'
  | 'pit_09_boiler_steam_vent'
  | 'pit_10_mirrored_animals';

export interface TrapdoorPitDefinitionV6 {
  readonly pitId: TrapdoorPitIdV6;
  readonly pitNumber: number; // 1 .. 10
  readonly title: string;
  readonly callout: string; // <= 6 words
  readonly durationSec: number;
  readonly hostTaunt: string;
}

export interface TrapdoorGambitResultV6 {
  readonly survived: boolean;
  readonly pitId: TrapdoorPitIdV6;
  readonly pitName: string;
  readonly secondsRemaining: number;
  readonly streakSaved: boolean;
  readonly rescueChips: number;
  readonly daredevilHeatEarned: number;
  readonly actionTag: string; // e.g. 'trapdoor_survived' | 'trapdoor_claimed'
}

export interface TrapdoorGambitOptionsV6 {
  readonly pitId?: TrapdoorPitIdV6;
  readonly seed?: number;
  readonly currentStreak?: number;
  readonly missedAnswerLabel?: string;
  readonly onSfx?: (sfx: FoleySfxIdV6) => void;
  readonly onComplete: (result: TrapdoorGambitResultV6) => void;
}

export interface TrapdoorGambitHandleV6 {
  readonly pitDef: TrapdoorPitDefinitionV6;
  dispose(): void;
}

export const TRAPDOOR_PIT_CATALOG_V6: readonly TrapdoorPitDefinitionV6[] = [
  {
    pitId: 'pit_01_rock_band_or_fake',
    pitNumber: 1,
    title: 'REAL ROCK BAND OR FAKE?',
    callout: 'SLAM THE 3 REAL BANDS — DODGE FAKES!',
    durationSec: 7.5,
    hostTaunt: 'Down the hatch! Spot the legends — do NOT stamp "VELVET TOASTER"!',
  },
  {
    pitId: 'pit_02_safe_dial_blades',
    pitNumber: 2,
    title: 'CLOSING-BLADE SAFE DIAL',
    callout: 'HIT 3 EMERALD NOTCHES BEFORE BLADES CLOSE!',
    durationSec: 8.0,
    hostTaunt: 'Spin the brass tumbler before the twin steel shutters snap shut!',
  },
  {
    pitId: 'pit_03_live_green_fuse',
    pitNumber: 3,
    title: 'SNIP THE LIVE GREEN FUSE',
    callout: 'CUT ALL 3 GREEN FUSES — AVOID RED!',
    durationSec: 7.0,
    hostTaunt: 'Green saves your streak. Red fries your hairdo. Snip fast!',
  },
  {
    pitId: 'pit_04_real_country_or_fake',
    pitNumber: 4,
    title: 'REAL COUNTRY OR FAKE REALM?',
    callout: 'TAP ONLY THE 3 REAL COUNTRIES!',
    durationSec: 7.5,
    hostTaunt: 'Check your passport! Do not book a flight to West Krakozia!',
  },
  {
    pitId: 'pit_05_pneumatic_lava_piston',
    pitNumber: 5,
    title: 'PNEUMATIC LAVA PISTON',
    callout: 'ALTERNATE LEFT / RIGHT TO STAY ABOVE LAVA!',
    durationSec: 6.5,
    hostTaunt: 'Pump those brass bellows left-right-left — the floor is literally lava!',
  },
  {
    pitId: 'pit_06_element_or_potion',
    pitNumber: 6,
    title: 'REAL ELEMENT OR SNAKE-OIL?',
    callout: 'CATCH 3 REAL ELEMENTS — DODGE POTIONS!',
    durationSec: 7.5,
    hostTaunt: 'Periodic table only! Leave the Goblinite on Frankie’s shelf!',
  },
  {
    pitId: 'pit_07_counterfeit_shredder',
    pitNumber: 7,
    title: 'COUNTERFEIT BILL SHREDDER',
    callout: 'SHRED ONLY THE 3 BOGUS BILLS!',
    durationSec: 7.5,
    hostTaunt: 'Frankie printed $37 bills again — shred the phonies, keep real cash!',
  },
  {
    pitId: 'pit_08_oscilloscope_hold',
    pitNumber: 8,
    title: 'OSCILLOSCOPE DEADMAN HOLD',
    callout: 'TRACK THE GREEN BAND FOR 3.2 SECONDS!',
    durationSec: 7.5,
    hostTaunt: 'Slide the brass tuner to hold the rescue frequency lock!',
  },
  {
    pitId: 'pit_09_boiler_steam_vent',
    pitNumber: 9,
    title: 'BOILER STEAM VENT PANIC',
    callout: 'TAP REDLINE VALVES TO PREVENT BLOWOUT!',
    durationSec: 7.0,
    hostTaunt: 'Four vintage boilers, one nervous contestant — keep all four under 100%!',
  },
  {
    pitId: 'pit_10_mirrored_animals',
    pitNumber: 10,
    title: 'CURSED MIRROR ANIMALS',
    callout: 'TAP THE 3 BACKWARDS REAL ANIMALS!',
    durationSec: 7.5,
    hostTaunt: 'Read backwards fast! A TIGER in a mirror still bites!',
  },
] as const;

// ============================================================================
// CURATED COMEDY & REFLEX CARD POOLS (ZERO BORING REPEATS!)
// ============================================================================

const REAL_ROCK_BANDS = [
  'RADIOHEAD', 'FLEETWOOD MAC', 'DAFT PUNK', 'NIRVANA', 'TALKING HEADS',
  'PINK FLOYD', 'TAME IMPALA', 'ARCTIC MONKEYS', 'THE CLASH', 'GORILLAZ',
  'BLONDIE', 'PEARL JAM', 'THE SMITHS', 'METALLICA', 'OUTKAST', 'QUEEN',
];
const FAKE_ROCK_BANDS = [
  'VELVET TOASTER', 'SOCK PUPPET ALIBI', 'DAMP CARPET', 'WET RECEIPT',
  'TUPPERWARE LID', 'MILD CHEDDAR CULT', 'SOGGY CROISSANT', 'THE LAUNDRY TAX',
  'COUCH CUSHION RIOT', 'GRANDMA WIFI', 'RUSTY BANANA', 'BUREAUCRATIC GOOSE',
];

const REAL_COUNTRIES = [
  'BHUTAN', 'URUGUAY', 'ESTONIA', 'SURINAME', 'LESOTHO', 'MALAWI',
  'BELIZE', 'OMAN', 'ANDORRA', 'PALAU', 'MALTA', 'LAOS', 'VANUATU', 'TOGO',
];
const FAKE_COUNTRIES = [
  'WEST KRAKOZIA', 'ZUBROWKA', 'GENOVIA', 'FREEDONIA', 'LATVERIA',
  'NORDLANDIA', 'ELBONIA', 'SYLDAVIA', 'RURITANIA', 'SOKOVIA', 'PETORIA', 'BORDURIA',
];

const REAL_ELEMENTS = [
  'TUNGSTEN', 'BISMUTH', 'XENON', 'COBALT', 'OSMIUM', 'GALLIUM',
  'RADON', 'NIOBIUM', 'CADMIUM', 'ARGON', 'KRYPTON', 'BARIUM', 'YTTRIUM',
];
const FAKE_POTIONS = [
  'MITHRILIUM', 'GOBLINITE', 'UNICORNIUM', 'ETHERIUM', 'DRAGONIUM',
  'SNEEZIUM', 'GLITTERITE', 'VAMPIRIUM', 'NOODLIUM', 'PHLOGISTON', 'TOASTIUM',
];

const FAKE_BILLS = [
  '$37 FRANKIE BILL', 'KING ELVIS $99', 'MARS RESERVE $77', '$13 LUCKY NOTE',
  'ZERO-DOLLAR MINT', 'PIRATE $42 NOTE', '99-CENT PAPER', 'CHEESE BANK $66',
];
const REAL_BILLS = [
  'US $20 BILL', 'EURO €50 NOTE', 'JAPAN ¥1000', 'UK £10 POUND',
  'SWISS 20 CHF', 'CANADA $5 BILL', 'AUSTRALIA $10', 'MEXICO $50 PESO',
];

const MIRROR_ANIMALS: ReadonlyArray<{ reversed: string; plain: string }> = [
  { reversed: 'REGIT', plain: 'TIGER' },
  { reversed: 'ADNAP', plain: 'PANDA' },
  { reversed: 'ARBEZ', plain: 'ZEBRA' },
  { reversed: 'ELGAE', plain: 'EAGLE' },
  { reversed: 'KRAHS', plain: 'SHARK' },
  { reversed: 'RETTO', plain: 'OTTER' },
  { reversed: 'ESROH', plain: 'HORSE' },
  { reversed: 'ELAHW', plain: 'WHALE' },
  { reversed: 'ALOK', plain: 'KOLA' }, // fallback excluded below
].slice(0, 8);

const MIRROR_OBJECTS: ReadonlyArray<{ reversed: string; plain: string }> = [
  { reversed: 'RIAHC', plain: 'CHAIR' },
  { reversed: 'ELBAT', plain: 'TABLE' },
  { reversed: 'NOOPS', plain: 'SPOON' },
  { reversed: 'KCOLC', plain: 'CLOCK' },
  { reversed: 'RETSAO', plain: 'OASTER' },
  { reversed: 'KOOB', plain: 'BOOK' },
  { reversed: 'PMAL', plain: 'LAMP' },
  { reversed: 'KROF', plain: 'FORK' },
];

// ============================================================================
// ZERO-REPEAT ROTATION TRACKER
// ============================================================================

let pitRotationQueue: TrapdoorPitIdV6[] = [];

function nextRotatedPitId(seed: number): TrapdoorPitIdV6 {
  if (pitRotationQueue.length === 0) {
    const all = TRAPDOOR_PIT_CATALOG_V6.map((p) => p.pitId);
    let s = (seed ^ 0x517cc1b7) >>> 0;
    for (let i = all.length - 1; i > 0; i--) {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      const j = s % (i + 1);
      [all[i], all[j]] = [all[j], all[i]];
    }
    pitRotationQueue = all;
  }
  return pitRotationQueue.shift()!;
}

export function resetTrapdoorRotation(): void {
  pitRotationQueue = [];
}

function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function clamp(n: number, lo: number, hi: number): number {
  return n < lo ? lo : n > hi ? hi : n;
}

function pickRandomSubset<T>(arr: readonly T[], count: number, seed: number): T[] {
  const copy = [...arr];
  let s = (seed ^ 0x85ebca6b) >>> 0;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// ============================================================================
// SCOPED PIT STYLES (ZERO SCROLL · ZERO BLUR · HIGH-ADRENALINE INDUSTRIAL BRASS)
// ============================================================================

const STYLE_ID_TRAPDOOR = 'v6-trapdoor-pit-styles';

function ensureTrapdoorStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID_TRAPDOOR)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID_TRAPDOOR;
  style.textContent = `
.v6pit-root {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% 35%, rgba(46, 12, 10, 0.42) 0%, rgba(18, 5, 5, 0.72) 76%, rgba(10, 3, 3, 0.88) 100%);
  color: #fff6e8;
  border: 2.5px solid #e65138;
  border-radius: 14px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  box-shadow: inset 0 0 38px rgba(230, 52, 34, 0.28), 0 14px 36px rgba(0, 0, 0, 0.75);
}
.v6pit-root *, .v6pit-root *::before, .v6pit-root *::after {
  box-sizing: border-box;
}
.v6pit-hazard-strip {
  height: 7px;
  flex: 0 0 7px;
  background: repeating-linear-gradient(
    -45deg,
    #f2b830 0px,
    #f2b830 12px,
    #190e08 12px,
    #190e08 24px
  );
}
.v6pit-head {
  flex: 0 0 auto;
  padding: 8px 12px 6px;
  background: linear-gradient(180deg, #2d0d0b 0%, #1c0807 100%);
  border-bottom: 2px solid rgba(242, 184, 48, 0.55);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.v6pit-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.v6pit-alarm-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #d92638;
  color: #fff8f8;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid #ff9ca6;
}
.v6pit-clock {
  font-family: "Courier New", Courier, monospace;
  font-variant-numeric: tabular-nums;
  font-size: 18px;
  font-weight: 900;
  color: #ffd166;
  background: #120504;
  border: 1.5px solid #e65138;
  border-radius: 8px;
  padding: 2px 9px;
  text-shadow: 0 0 10px rgba(255, 110, 64, 0.8);
}
.v6pit-title {
  margin: 0;
  font-size: clamp(14px, 2.5dvh, 19px);
  font-weight: 900;
  letter-spacing: 0.04em;
  color: #ffe28a;
}
.v6pit-callout {
  font-size: 11.5px;
  font-weight: 900;
  letter-spacing: 0.07em;
  color: #6df7b8;
  text-transform: uppercase;
}
.v6pit-taunt {
  font-size: 11px;
  color: #e6c6b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.v6pit-bar-bg {
  width: 100%;
  height: 5px;
  background: #0d0403;
  border-radius: 999px;
  overflow: hidden;
}
.v6pit-bar-fill {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #ff3850 0%, #ff9f43 50%, #46f0a5 100%);
  transition: width 0.08s linear;
}
.v6pit-arena {
  flex: 1 1 0;
  min-height: 0;
  overflow: hidden;
  padding: 8px 10px 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  position: relative;
}
.v6pit-root.v6pit-landscape {
  flex-direction: row;
}
.v6pit-root.v6pit-landscape .v6pit-hazard-strip {
  display: none;
}
.v6pit-root.v6pit-landscape .v6pit-head {
  flex: 0 0 38%;
  max-width: 38%;
  height: 100%;
  border-bottom: none;
  border-right: 2px solid rgba(242, 184, 48, 0.55);
  justify-content: space-between;
  padding: 10px 12px;
}
.v6pit-root.v6pit-landscape .v6pit-taunt {
  white-space: normal;
}
.v6pit-root.v6pit-landscape .v6pit-arena {
  flex: 1 1 62%;
  height: 100%;
}

.v6pit-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
  flex: 1 1 0;
  align-content: center;
}
.v6pit-stamp-card {
  appearance: none;
  border: 2px solid #c99441;
  border-radius: 10px;
  background: linear-gradient(180deg, #2d1814 0%, #190c0a 100%);
  color: #fff8ea;
  font-size: clamp(12.5px, 2.2dvh, 16px);
  font-weight: 900;
  letter-spacing: 0.04em;
  padding: 11px 8px;
  text-align: center;
  cursor: pointer;
  box-shadow: 0 3px 0 #0a0403, inset 0 1px 0 rgba(255, 224, 150, 0.25);
  transition: transform 0.07s ease, background 0.1s ease, border-color 0.1s ease;
}
.v6pit-stamp-card:active {
  transform: translateY(2px);
}
.v6pit-stamp-card.hit {
  border-color: #36e896;
  background: linear-gradient(180deg, #135c3b 0%, #09301e 100%);
  color: #dcfff0;
  pointer-events: none;
}
.v6pit-stamp-card.boom {
  border-color: #ff3850;
  background: linear-gradient(180deg, #75111f 0%, #3d060d 100%);
}
.v6pit-btn {
  appearance: none;
  border: 2px solid #ffe074;
  border-radius: 10px;
  background: linear-gradient(180deg, #f0be4a 0%, #b37817 100%);
  color: #1a1004;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 11px 14px;
  cursor: pointer;
  box-shadow: 0 3px 0 #4d3006;
}
.v6pit-btn:active {
  transform: translateY(2px);
}
.v6pit-btn.emerald {
  border-color: #84f7c3;
  background: linear-gradient(180deg, #2fd687 0%, #15824c 100%);
  color: #061c10;
  box-shadow: 0 3px 0 #093d22;
}
.v6pit-btn.crimson {
  border-color: #ffa3ad;
  background: linear-gradient(180deg, #eb3b52 0%, #991728 100%);
  color: #fff;
  box-shadow: 0 3px 0 #4a0912;
}
.v6pit-outcome-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px;
  text-align: center;
  z-index: 30;
  background: rgba(14, 6, 5, 0.92);
}
.v6pit-outcome-overlay.win {
  background: radial-gradient(circle, rgba(16, 82, 51, 0.96) 0%, rgba(7, 33, 21, 0.97) 100%);
}
.v6pit-outcome-overlay.loss {
  background: radial-gradient(circle, rgba(102, 16, 28, 0.96) 0%, rgba(36, 5, 10, 0.97) 100%);
}
`;
  document.head.appendChild(style);
}

// ============================================================================
// MAIN MOUNT: mountStageTrapdoorGambitV6
// ============================================================================

export function mountStageTrapdoorGambitV6(
  container: HTMLElement,
  options: TrapdoorGambitOptionsV6,
): TrapdoorGambitHandleV6 {
  ensureTrapdoorStyles();

  const seed = options.seed ?? Date.now();
  const pitId = options.pitId ?? nextRotatedPitId(seed);
  const pitDef = TRAPDOOR_PIT_CATALOG_V6.find((p) => p.pitId === pitId) ?? TRAPDOOR_PIT_CATALOG_V6[0];

  let timeLeft = pitDef.durationSec;
  let finished = false;
  let disposed = false;
  const cleanups: Array<() => void> = [];
  let onTimeout: (() => void) | null = null;

  const sfx = (id: FoleySfxIdV6) => {
    if (!disposed) options.onSfx?.(id);
  };

  sfx('trapdoor_hinge_drop');

  container.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'v6pit-root';
  root.dataset.pitId = pitDef.pitId;

  const streakNote = (options.currentStreak ?? 0) > 0
    ? `SAVE ${options.currentStreak}x STREAK`
    : 'SURVIVAL PIT';

  root.innerHTML = `
    <div class="v6pit-hazard-strip"></div>
    <div class="v6pit-head">
      <div class="v6pit-top-row">
        <span class="v6pit-alarm-pill">TRAPDOOR #${pitDef.pitNumber} · ${escapeHtml(streakNote)}</span>
        <span class="v6pit-clock" id="v6pitClock">${timeLeft.toFixed(1)}s</span>
      </div>
      <h3 class="v6pit-title">${escapeHtml(pitDef.title)}</h3>
      <div class="v6pit-callout">${escapeHtml(pitDef.callout)}</div>
      <div class="v6pit-taunt">${escapeHtml(pitDef.hostTaunt)}</div>
      <div class="v6pit-bar-bg"><div class="v6pit-bar-fill" id="v6pitBar"></div></div>
    </div>
    <div class="v6pit-arena" id="v6pitArena"></div>
    <div class="v6pit-hazard-strip"></div>
  `;
  container.appendChild(root);

  const arenaEl = root.querySelector<HTMLElement>('#v6pitArena')!;
  const clockEl = root.querySelector<HTMLElement>('#v6pitClock')!;
  const barEl = root.querySelector<HTMLElement>('#v6pitBar')!;

  const syncLayout = () => {
    const r = root.getBoundingClientRect();
    root.classList.toggle('v6pit-landscape', r.width > 480 && r.height > 120 && r.width / r.height > 1.25 && r.height < 560);
  };
  syncLayout();
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(syncLayout);
    ro.observe(root);
    cleanups.push(() => ro.disconnect());
  }

  const conclude = (survived: boolean, headline: string, detail: string) => {
    if (finished || disposed) return;
    finished = true;
    sfx(survived ? 'crowd_studio_roar' : 'crowd_collective_gasp');

    const overlay = document.createElement('div');
    overlay.className = `v6pit-outcome-overlay ${survived ? 'win' : 'loss'}`;
    overlay.innerHTML = `
      <div style="font-size:clamp(18px,3.2dvh,26px);font-weight:900;letter-spacing:0.06em;color:${survived ? '#7cf7bf' : '#ff9aa5'};">${escapeHtml(headline)}</div>
      <div style="font-size:13px;font-weight:700;color:#fff4dc;">${escapeHtml(detail)}</div>
      ${survived ? `<div style="margin-top:4px;font-size:12px;font-weight:900;color:#ffe074;">STREAK SAVED · +150 DAREDEVIL CHIPS · +20 STAGE HEAT</div>` : ''}
    `;
    arenaEl.appendChild(overlay);

    const t = window.setTimeout(() => {
      if (disposed) return;
      options.onComplete({
        survived,
        pitId: pitDef.pitId,
        pitName: pitDef.title,
        secondsRemaining: Number(timeLeft.toFixed(2)),
        streakSaved: survived,
        rescueChips: survived ? 150 : 0,
        daredevilHeatEarned: survived ? 20 : 5,
        actionTag: survived ? 'trapdoor_survived' : 'trapdoor_claimed',
      });
    }, 680);
    cleanups.push(() => window.clearTimeout(t));
  };

  let lastMs = performance.now();
  const timer = window.setInterval(() => {
    if (finished || disposed) return;
    const now = performance.now();
    const dt = Math.min(0.2, (now - lastMs) / 1000);
    lastMs = now;
    timeLeft = Math.max(0, timeLeft - dt);
    clockEl.textContent = `${timeLeft.toFixed(1)}s`;
    barEl.style.width = `${clamp((timeLeft / pitDef.durationSec) * 100, 0, 100).toFixed(1)}%`;
    if (timeLeft <= 0) {
      if (onTimeout) onTimeout();
      else conclude(false, 'TRAPDOOR CLAIMED YOU!', 'The clock hit 0.0s before you escaped the pit!');
    }
  }, 55);
  cleanups.push(() => window.clearInterval(timer));

  // Helper for the 5 high-comedy 6-card stamp/sort survival pits
  const buildSixCardStampPit = (
    goodPool: readonly string[],
    badPool: readonly string[],
    goodTag: string,
    badTag: string,
  ) => {
    const goods = pickRandomSubset(goodPool, 3, seed + 11).map((text) => ({ text, isTarget: true }));
    const bads = pickRandomSubset(badPool, 3, seed + 29).map((text) => ({ text, isTarget: false }));
    const cards = pickRandomSubset([...goods, ...bads], 6, seed + 47);
    let hits = 0;

    arenaEl.innerHTML = `
      <div class="v6pit-card-grid">
        ${cards.map((c, idx) => `
          <button type="button" class="v6pit-stamp-card" data-card="${idx}">${escapeHtml(c.text)}</button>
        `).join('')}
      </div>
    `;

    arenaEl.querySelectorAll<HTMLButtonElement>('[data-card]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (finished || disposed) return;
        const idx = Number(btn.dataset.card);
        const card = cards[idx];
        if (card.isTarget) {
          btn.classList.add('hit');
          hits += 1;
          sfx('paddle_spring_slam');
          if (hits >= 3) {
            conclude(true, 'ESCAPED THE TRAPDOOR!', `Nailed all 3 ${goodTag} with ${timeLeft.toFixed(1)}s left!`);
          }
        } else {
          btn.classList.add('boom');
          sfx('nixie_spark_crackle');
          conclude(false, `TRAPPED BY "${card.text}"!`, `That was a ${badTag}!`);
        }
      });
    });
  };

  // Dispatch exact pit mini-game!
  switch (pitDef.pitId) {
    case 'pit_01_rock_band_or_fake':
      buildSixCardStampPit(REAL_ROCK_BANDS, FAKE_ROCK_BANDS, 'real rock bands', 'hilarious studio fake');
      break;

    case 'pit_04_real_country_or_fake':
      buildSixCardStampPit(REAL_COUNTRIES, FAKE_COUNTRIES, 'sovereign nations', 'fictional kingdom');
      break;

    case 'pit_06_element_or_potion':
      buildSixCardStampPit(REAL_ELEMENTS, FAKE_POTIONS, 'periodic elements', 'bogus snake-oil potion');
      break;

    case 'pit_07_counterfeit_shredder':
      buildSixCardStampPit(FAKE_BILLS, REAL_BILLS, 'counterfeit notes shredded', 'real world currency');
      break;

    case 'pit_10_mirrored_animals':
      buildSixCardStampPit(
        MIRROR_ANIMALS.map((m) => m.reversed),
        MIRROR_OBJECTS.map((m) => m.reversed),
        'mirrored animals',
        'household decoy object',
      );
      break;

    case 'pit_02_safe_dial_blades': {
      const targets = [60, 195, 315];
      let targetIdx = 0;
      let dialDeg = 0;

      const renderDial = () => {
        const goal = targets[targetIdx];
        const bladePct = clamp((1 - timeLeft / pitDef.durationSec) * 38, 0, 38);
        const aligned = Math.abs(((dialDeg - goal + 540) % 360) - 180) <= 18;
        arenaEl.innerHTML = `
          <div style="flex:1 1 0;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;border:2px solid #c99441;border-radius:10px;background:#120806;">
            <div id="v6pitBladeL" style="position:absolute;left:0;top:0;bottom:0;width:${bladePct}%;background:linear-gradient(90deg,#5b6670,#c8d4de);border-right:3px solid #ff4757;"></div>
            <div id="v6pitBladeR" style="position:absolute;right:0;top:0;bottom:0;width:${bladePct}%;background:linear-gradient(270deg,#5b6670,#c8d4de);border-left:3px solid #ff4757;"></div>
            <svg viewBox="0 0 140 140" width="124" height="124" style="position:relative;z-index:2;">
              <circle cx="70" cy="70" r="58" fill="#23160c" stroke="#e8b852" stroke-width="5"/>
              <g transform="rotate(${goal} 70 70)">
                <rect x="65" y="6" width="10" height="16" rx="3" fill="#36e896"/>
              </g>
              <g transform="rotate(${dialDeg} 70 70)">
                <line x1="70" y1="70" x2="70" y2="18" stroke="#ffe074" stroke-width="5" stroke-linecap="round"/>
                <circle cx="70" cy="70" r="14" fill="#d9a136" stroke="#fff4cc" stroke-width="2"/>
              </g>
            </svg>
            <div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);z-index:3;font-size:10.5px;font-weight:900;color:#ffe499;background:rgba(16,8,4,0.88);padding:2px 8px;border-radius:999px;border:1px solid #d9a136;white-space:nowrap;">LOCK ${targetIdx + 1}/3 · ${dialDeg}°</div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1.5fr 1fr;gap:8px;">
            <button type="button" class="v6pit-btn" id="v6sdL">◀ -15°</button>
            <button type="button" class="v6pit-btn ${aligned ? 'emerald' : 'crimson'}" id="v6sdCrack">${aligned ? 'CRACK LOCK!' : `AIM ${goal}°`}</button>
            <button type="button" class="v6pit-btn" id="v6sdR">+15° ▶</button>
          </div>
        `;
        arenaEl.querySelector('#v6sdL')?.addEventListener('click', () => { dialDeg = (dialDeg + 345) % 360; sfx('rotary_knob_click'); renderDial(); });
        arenaEl.querySelector('#v6sdR')?.addEventListener('click', () => { dialDeg = (dialDeg + 15) % 360; sfx('rotary_knob_click'); renderDial(); });
        arenaEl.querySelector('#v6sdCrack')?.addEventListener('click', () => {
          if (finished || disposed) return;
          if (Math.abs(((dialDeg - goal + 540) % 360) - 180) <= 20) {
            sfx('vault_heavy_unlock');
            targetIdx += 1;
            if (targetIdx >= targets.length) {
              conclude(true, 'SAFE CRACKED BEFORE BLADES!', 'All 3 brass tumblers snapped open cleanly!');
            } else {
              renderDial();
            }
          } else {
            sfx('nixie_spark_crackle');
          }
        });
      };
      renderDial();
      break;
    }

    case 'pit_03_live_green_fuse': {
      const fuses = pickRandomSubset([true, true, true, false, false, false], 6, seed + 13);
      const cut = new Set<number>();
      let greenCut = 0;

      const renderFuses = () => {
        arenaEl.innerHTML = `
          <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;flex:1 1 0;align-content:center;">
            ${fuses.map((isGreen, idx) => `
              <button type="button" class="v6pit-stamp-card ${cut.has(idx) ? 'hit' : ''}" data-fuse="${idx}" style="border-color:${isGreen ? '#36e896' : '#ff4757'};background:${isGreen ? 'linear-gradient(180deg,#124a30,#092418)' : 'linear-gradient(180deg,#52121b,#29070c)'};">
                ${cut.has(idx) ? 'SNIPPED SAFE ✓' : isGreen ? `LIVE GREEN FUSE #${idx + 1}` : `DANGER RED SHORT #${idx + 1}`}
              </button>
            `).join('')}
          </div>
        `;
        arenaEl.querySelectorAll<HTMLButtonElement>('[data-fuse]').forEach((b) => {
          b.addEventListener('click', () => {
            if (finished || disposed) return;
            const i = Number(b.dataset.fuse);
            if (cut.has(i)) return;
            if (fuses[i]) {
              cut.add(i);
              greenCut += 1;
              sfx('wire_cutter_snip');
              if (greenCut >= 3) conclude(true, 'ALL 3 GREEN FUSES SEVERED!', 'Trapdoor hydraulics disarmed!');
              else renderFuses();
            } else {
              sfx('nixie_spark_crackle');
              conclude(false, 'SHORT-CIRCUITED RED FUSE!', 'Sparks lit up the pit floor!');
            }
          });
        });
      };
      renderFuses();
      break;
    }

    case 'pit_05_pneumatic_lava_piston': {
      let altitude = 58; // 0..100, lava line is 20
      let nextSide: 'L' | 'R' = 'L';

      arenaEl.innerHTML = `
        <div style="flex:1 1 0;display:flex;flex-direction:column;justify-content:space-between;padding:10px;border:2px solid #e67e22;border-radius:10px;background:#1a0905;position:relative;overflow:hidden;">
          <div style="font-size:11px;font-weight:900;color:#ffe082;z-index:2;text-align:center;" id="v6lavStat">PLATFORM HEIGHT: 58% · STAY ABOVE LAVA!</div>
          <div style="position:relative;flex:1;margin:6px 0;background:#120604;border-radius:8px;overflow:hidden;border:1px solid #8c4820;">
            <div style="position:absolute;left:0;right:0;bottom:0;height:22%;background:linear-gradient(180deg,#ff6b2b,#c92412);border-top:2px solid #ffe074;"></div>
            <div id="v6lavPlat" style="position:absolute;left:20%;right:20%;height:14px;bottom:58%;background:linear-gradient(180deg,#f2c14e,#9c6918);border:2px solid #fff3c4;border-radius:4px;"></div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <button type="button" class="v6pit-btn emerald" id="v6lavL">PUMP LEFT</button>
          <button type="button" class="v6pit-btn" id="v6lavR">PUMP RIGHT</button>
        </div>
      `;
      const platEl = arenaEl.querySelector<HTMLElement>('#v6lavPlat')!;
      const statEl = arenaEl.querySelector<HTMLElement>('#v6lavStat')!;
      const btnL = arenaEl.querySelector<HTMLButtonElement>('#v6lavL')!;
      const btnR = arenaEl.querySelector<HTMLButtonElement>('#v6lavR')!;

      const syncButtons = () => {
        btnL.className = `v6pit-btn ${nextSide === 'L' ? 'emerald' : ''}`;
        btnR.className = `v6pit-btn ${nextSide === 'R' ? 'emerald' : ''}`;
      };
      const pump = (side: 'L' | 'R') => {
        if (finished || disposed) return;
        const boost = side === nextSide ? 11 : 4;
        altitude = clamp(altitude + boost, 0, 92);
        nextSide = side === 'L' ? 'R' : 'L';
        syncButtons();
        sfx('pneumatic_piston_slam');
      };
      btnL.addEventListener('click', () => pump('L'));
      btnR.addEventListener('click', () => pump('R'));

      const sinkLoop = window.setInterval(() => {
        if (finished || disposed) return;
        altitude = Math.max(0, altitude - 1.55);
        platEl.style.bottom = `${altitude.toFixed(1)}%`;
        statEl.textContent = `PLATFORM HEIGHT: ${Math.round(altitude)}% · PUMP ${nextSide === 'L' ? 'LEFT' : 'RIGHT'}!`;
        if (altitude <= 20) {
          conclude(false, 'DUNKED IN MOLTEN BRASS!', 'Keep alternating Left & Right bellows faster!');
        }
      }, 65);
      cleanups.push(() => window.clearInterval(sinkLoop));
      onTimeout = () => conclude(true, 'HOIST LOCKED ABOVE LAVA!', 'Survived the full 6.5s molten surge!');
      break;
    }

    case 'pit_08_oscilloscope_hold': {
      let playerPos = 50; // 0..100
      let targetPos = 50;
      let lockedSec = 0;
      const neededSec = 3.2;
      let t = 0;

      arenaEl.innerHTML = `
        <div style="flex:1 1 0;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:10px;border:2px solid #36e896;border-radius:10px;background:#071710;">
          <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:900;color:#6ef7bb;">
            <span>FREQUENCY LOCK</span>
            <span id="v6oscProg">0.0s / 3.2s</span>
          </div>
          <div style="position:relative;height:38px;border-radius:8px;background:#040d09;border:1.5px solid #2b7a54;overflow:hidden;">
            <div id="v6oscBand" style="position:absolute;top:0;bottom:0;width:26%;left:37%;background:rgba(54,232,150,0.35);border-left:2px solid #36e896;border-right:2px solid #36e896;"></div>
            <div id="v6oscNeedle" style="position:absolute;top:2px;bottom:2px;width:6px;margin-left:-3px;left:50%;background:#ffe074;border-radius:3px;"></div>
          </div>
          <div id="v6oscTrack" style="position:relative;height:40px;border-radius:999px;background:#16100a;border:2px solid #d4a84c;touch-action:none;cursor:pointer;">
            <div id="v6oscThumb" style="position:absolute;top:50%;left:50%;width:32px;height:32px;margin-left:-16px;transform:translateY(-50%);border-radius:50%;background:radial-gradient(circle,#fff3c4,#c99124);border:2px solid #fff;"></div>
          </div>
        </div>
      `;

      const bandEl = arenaEl.querySelector<HTMLElement>('#v6oscBand')!;
      const needleEl = arenaEl.querySelector<HTMLElement>('#v6oscNeedle')!;
      const thumbEl = arenaEl.querySelector<HTMLElement>('#v6oscThumb')!;
      const progEl = arenaEl.querySelector<HTMLElement>('#v6oscProg')!;
      const trackEl = arenaEl.querySelector<HTMLElement>('#v6oscTrack')!;

      let dragging = false;
      const movePointer = (clientX: number) => {
        const rect = trackEl.getBoundingClientRect();
        if (rect.width <= 1) return;
        playerPos = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
        needleEl.style.left = `${playerPos.toFixed(1)}%`;
        thumbEl.style.left = `${playerPos.toFixed(1)}%`;
      };
      const onDown = (e: PointerEvent) => { dragging = true; movePointer(e.clientX); };
      const onMove = (e: PointerEvent) => { if (dragging) movePointer(e.clientX); };
      const onUp = () => { dragging = false; };
      trackEl.addEventListener('pointerdown', onDown);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      cleanups.push(() => {
        trackEl.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      });

      const loop = window.setInterval(() => {
        if (finished || disposed) return;
        t += 0.055;
        targetPos = 50 + Math.sin(t * 1.65) * 32;
        bandEl.style.left = `${(targetPos - 13).toFixed(1)}%`;
        const inside = Math.abs(playerPos - targetPos) <= 14;
        if (inside) {
          lockedSec += 0.055;
          progEl.textContent = `${lockedSec.toFixed(1)}s / ${neededSec.toFixed(1)}s`;
          if (lockedSec >= neededSec) {
            conclude(true, 'RESCUE FREQUENCY LOCKED!', 'Trapdoor winch hoisted you back onstage!');
          }
        }
      }, 55);
      cleanups.push(() => window.clearInterval(loop));
      break;
    }

    case 'pit_09_boiler_steam_vent': {
      const levels = [20, 45, 10, 35];
      const rates = [0.95, 1.15, 0.85, 1.05];

      arenaEl.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;flex:1 1 0;align-content:center;">
          ${levels.map((_, i) => `
            <button type="button" class="v6pit-stamp-card" data-valve="${i}" style="display:flex;flex-direction:column;gap:6px;align-items:stretch;">
              <div style="display:flex;justify-content:space-between;font-size:11px;">
                <span>BOILER #${i + 1}</span>
                <span id="v6bvPct${i}">0%</span>
              </div>
              <div style="height:10px;border-radius:999px;background:#0a0403;overflow:hidden;border:1px solid #c99441;">
                <div id="v6bvBar${i}" style="height:100%;width:20%;background:#36e896;"></div>
              </div>
            </button>
          `).join('')}
        </div>
      `;

      arenaEl.querySelectorAll<HTMLButtonElement>('[data-valve]').forEach((b) => {
        b.addEventListener('click', () => {
          if (finished || disposed) return;
          const i = Number(b.dataset.valve);
          levels[i] = Math.max(5, levels[i] - 48);
          sfx('pneumatic_piston_slam');
        });
      });

      const boilerLoop = window.setInterval(() => {
        if (finished || disposed) return;
        for (let i = 0; i < 4; i++) {
          levels[i] += rates[i];
          const pctEl = arenaEl.querySelector<HTMLElement>(`#v6bvPct${i}`);
          const bEl = arenaEl.querySelector<HTMLElement>(`#v6bvBar${i}`);
          if (pctEl) pctEl.textContent = `${Math.min(100, Math.round(levels[i]))}%`;
          if (bEl) {
            bEl.style.width = `${Math.min(100, levels[i]).toFixed(1)}%`;
            bEl.style.background = levels[i] > 75 ? '#ff3850' : levels[i] > 50 ? '#f2b830' : '#36e896';
          }
          if (levels[i] >= 100) {
            conclude(false, `BOILER #${i + 1} BLEW ITS TOP!`, 'Tap redline valves before pressure hits 100%!');
            return;
          }
        }
      }, 65);
      cleanups.push(() => window.clearInterval(boilerLoop));
      onTimeout = () => conclude(true, 'ALL 4 BOILERS STABILIZED!', 'Zero blowouts — you climb straight back onstage!');
      break;
    }
  }

  return {
    pitDef,
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const fn of cleanups) {
        try { fn(); } catch { /* noop */ }
      }
      cleanups.length = 0;
      root.remove();
    },
  };
}
