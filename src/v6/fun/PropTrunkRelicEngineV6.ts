// ============================================================================
// WORLD'S SMARTEST v6.0 — Frankie's Velvet Flight Trunk & Balatro Relic Engine
//   - 24 Sculpted 3D Relics (+Chips, +Mult, xMult, Left-Neighbor Blueprint)
//   - 18 Holographic Foil Dirty-Trick Cards (All 9 FoilTrickCardV6 kinds x 2)
//   - Strict Left-to-Right Slot-Order Domino Scoring Cascade (180ms cadence)
//   - Zero-Scroll Burgundy-Velvet & Riveted-Brass Trunk UI with live
//     Drag / 1-Tap Slot Reordering & Live Projected Score Math Preview!
//
// Zero-Scroll · Custom Brass Controls · Crisp Velvet Surfaces · Pure SVG Icons
// ============================================================================

import type {
  CalibratedClueV6,
  FoilTrickCardV6,
  FoleySfxIdV6,
  RelicDefinitionV6,
  ToyDefinitionV6,
  ToyResolutionV6,
} from '../contracts_v6';

// ============================================================================
// EXTENDED RELIC & CASCADE CONTRACTS
// ============================================================================

export type RelicCascadeOpV6 = '+CHIPS' | '+MULT' | 'xMULT';

export interface RelicEvalContextV6 {
  readonly baseChips: number;
  readonly baseMult: number;
  readonly clue?: CalibratedClueV6;
  readonly toySpec?: ToyDefinitionV6;
  readonly resolution?: ToyResolutionV6;
  readonly equippedRelicIds: readonly string[];
  readonly activeFoilKinds?: readonly FoilTrickCardV6['effectKind'][];
  readonly streakCount: number;
  readonly survivedTrapdoorCount: number;
  readonly bankrollCash: number;
  readonly stageHeat: number; // 0 .. 100
  readonly isClimaxTurn?: boolean;
}

export interface RelicTriggerOutputV6 {
  readonly triggered: boolean;
  readonly op: RelicCascadeOpV6;
  readonly value: number; // additive chips/mult OR multiplier factor (>1)
  readonly label: string; // crisp badge e.g. "+140 CHIPS", "+2.5 MULT", "x2.0 MULT"
}

export interface RelicSpecV6 extends RelicDefinitionV6 {
  readonly archetypeTag:
    | 'SPEED'
    | 'CASINO'
    | 'DAREDEVIL'
    | 'FORENSIC'
    | 'STREAK'
    | 'CONTRABAND';
  readonly cascadeOp: RelicCascadeOpV6;
  readonly flavorQuip: string;
  readonly evaluate: (ctx: RelicEvalContextV6, leftNeighbor?: RelicSpecV6) => RelicTriggerOutputV6;
}

export interface RelicCascadeStepV6 {
  readonly stepIndex: number;
  readonly slotIndex: number;
  readonly relicId: string;
  readonly relicName: string;
  readonly op: RelicCascadeOpV6;
  readonly value: number;
  readonly deltaLabel: string;
  readonly chipsAfter: number;
  readonly multAfter: number;
  readonly delayMs: number;
  readonly sfxCue: FoleySfxIdV6;
}

export interface RelicCascadeResultV6 {
  readonly startChips: number;
  readonly startMult: number;
  readonly finalChips: number;
  readonly finalMult: number;
  readonly totalPayout: number;
  readonly steps: readonly RelicCascadeStepV6[];
}

// ============================================================================
// 24 BALATRO-SYNERGY 3D RELICS (LEFT-TO-RIGHT ORDER MATTERS!)
// ============================================================================

export const RELIC_SPECS_V6: readonly RelicSpecV6[] = [
  // --- ARCHETYPE A: SPEED & DEFUSAL ---
  {
    relicId: 'relic_01_rigged_capacitor',
    name: 'RIGGED CAPACITOR',
    shortEffect: '+160 CHIPS IF >5s REMAINING',
    costCash: 220,
    rarity: 'BRASS',
    meshArchetype: 'VACUUM_TUBE',
    archetypeTag: 'SPEED',
    cascadeOp: '+CHIPS',
    flavorQuip: 'Frankie swiped it off a 1968 color camera.',
    evaluate: (ctx) => {
      const fast = (ctx.resolution?.secondsRemaining ?? 8) >= 5;
      return { triggered: fast, op: '+CHIPS', value: 160, label: '+160 CHIPS' };
    },
  },
  {
    relicId: 'relic_02_geneva_escapement',
    name: 'GENEVA ESCAPEMENT',
    shortEffect: '+25 CHIPS PER SECOND LEFT',
    costCash: 260,
    rarity: 'STERLING',
    meshArchetype: 'POCKET_WATCH',
    archetypeTag: 'SPEED',
    cascadeOp: '+CHIPS',
    flavorQuip: 'Swiss tick precision turned into raw stage cash.',
    evaluate: (ctx) => {
      const secs = Math.max(1, Math.round(ctx.resolution?.secondsRemaining ?? 6));
      const bonus = secs * 25;
      return { triggered: true, op: '+CHIPS', value: bonus, label: `+${bonus} CHIPS` };
    },
  },
  {
    relicId: 'relic_03_wiremans_shears',
    name: "WIREMAN'S SHEARS",
    shortEffect: '+2.0 MULT ON DEFUSAL & KINETIC TOYS',
    costCash: 280,
    rarity: 'STERLING',
    meshArchetype: 'TELEGRAPH_KEY',
    archetypeTag: 'SPEED',
    cascadeOp: '+MULT',
    flavorQuip: 'Rubber handles optional. Courage mandatory.',
    evaluate: (ctx) => {
      const fam = ctx.toySpec?.family;
      const hit = !fam || fam === 'DEFUSAL_ELIMINATION' || fam === 'KINETIC_CONTRAPTIONS' || fam === 'RAPID_PADDLES_REFLEX';
      return { triggered: hit, op: '+MULT', value: 2.0, label: '+2.0 MULT' };
    },
  },
  {
    relicId: 'relic_04_nixie_overclock',
    name: 'NIXIE OVERCLOCK VALVE',
    shortEffect: 'x1.6 MULT WHEN SOLVED UNDER 6s',
    costCash: 360,
    rarity: 'GOLD',
    meshArchetype: 'NIXIE_VALVE',
    archetypeTag: 'SPEED',
    cascadeOp: 'xMULT',
    flavorQuip: 'Glows neon orange when your thumb flies.',
    evaluate: (ctx) => {
      const fast = (ctx.resolution?.secondsRemaining ?? 9) >= 8;
      return { triggered: fast, op: 'xMULT', value: 1.6, label: 'x1.6 MULT' };
    },
  },

  // --- ARCHETYPE B: CASINO & HIGH-ROLLER ---
  {
    relicId: 'relic_05_loaded_monte_die',
    name: 'LOADED MONTE DIE',
    shortEffect: '+2.5 MULT ON CASINO & WAGER TOYS',
    costCash: 300,
    rarity: 'STERLING',
    meshArchetype: 'GOLD_DICE',
    archetypeTag: 'CASINO',
    cascadeOp: '+MULT',
    flavorQuip: 'Banned from three Riviera salons since 1964.',
    evaluate: (ctx) => {
      const fam = ctx.toySpec?.family;
      const hit = !fam || fam === 'CASINO_BLUFF_STAKES' || fam === 'WAGER_SCALE_CHRONOLOGY';
      return { triggered: hit, op: '+MULT', value: 2.5, label: '+2.5 MULT' };
    },
  },
  {
    relicId: 'relic_06_croupiers_coin',
    name: "CROUPIER'S LUCKY COIN",
    shortEffect: '+20 CHIPS PER $200 IN BANKROLL',
    costCash: 250,
    rarity: 'BRASS',
    meshArchetype: 'LUCKY_COIN',
    archetypeTag: 'CASINO',
    cascadeOp: '+CHIPS',
    flavorQuip: 'Money attracts louder applause.',
    evaluate: (ctx) => {
      const bonus = Math.min(400, Math.max(40, Math.floor(ctx.bankrollCash / 200) * 20));
      return { triggered: true, op: '+CHIPS', value: bonus, label: `+${bonus} CHIPS` };
    },
  },
  {
    relicId: 'relic_07_velvet_bank_seal',
    name: 'VELVET BANK SEAL',
    shortEffect: 'x1.5 MULT IF BANKROLL >= $1,000',
    costCash: 390,
    rarity: 'GOLD',
    meshArchetype: 'CROWN_SEAL',
    archetypeTag: 'CASINO',
    cascadeOp: 'xMULT',
    flavorQuip: 'The studio accountant hates seeing this onstage.',
    evaluate: (ctx) => {
      const rich = ctx.bankrollCash >= 1000;
      return { triggered: rich, op: 'xMULT', value: 1.5, label: 'x1.5 MULT' };
    },
  },
  {
    relicId: 'relic_08_brass_chip_magnet',
    name: 'BRASS CHIP MAGNET',
    shortEffect: '+120 CHIPS ON EVERY CORRECT CLUE',
    costCash: 190,
    rarity: 'BRASS',
    meshArchetype: 'MAGNET_HORSESHOE',
    archetypeTag: 'CASINO',
    cascadeOp: '+CHIPS',
    flavorQuip: 'Reliable iron pull for steady early scaling.',
    evaluate: () => ({ triggered: true, op: '+CHIPS', value: 120, label: '+120 CHIPS' }),
  },

  // --- ARCHETYPE C: TRAPDOOR DAREDEVIL ---
  {
    relicId: 'relic_09_trapdoor_token',
    name: 'TRAPDOOR TOKEN',
    shortEffect: '+1.5 MULT PER TRAPDOOR SURVIVED',
    costCash: 290,
    rarity: 'STERLING',
    meshArchetype: 'LUCKY_COIN',
    archetypeTag: 'DAREDEVIL',
    cascadeOp: '+MULT',
    flavorQuip: 'Minted from a sheared trapdoor hinge.',
    evaluate: (ctx) => {
      const count = Math.max(1, ctx.survivedTrapdoorCount);
      const gain = Number((count * 1.5).toFixed(2));
      return { triggered: true, op: '+MULT', value: gain, label: `+${gain} MULT` };
    },
  },
  {
    relicId: 'relic_10_kintsugi_bowl',
    name: 'KINTSUGI BOWL',
    shortEffect: 'x1.75 MULT IF YOU SURVIVED A TRAPDOOR',
    costCash: 410,
    rarity: 'GOLD',
    meshArchetype: 'CROWN_SEAL',
    archetypeTag: 'DAREDEVIL',
    cascadeOp: 'xMULT',
    flavorQuip: 'Golden lacquer turns every crack into spectacle.',
    evaluate: (ctx) => {
      const scarred = ctx.survivedTrapdoorCount >= 1;
      return { triggered: scarred, op: 'xMULT', value: 1.75, label: 'x1.75 MULT' };
    },
  },
  {
    relicId: 'relic_11_phoenix_fuse',
    name: 'PHOENIX FUSE',
    shortEffect: '+4 CHIPS PER STAGE HEAT POINT',
    costCash: 240,
    rarity: 'BRASS',
    meshArchetype: 'NIXIE_VALVE',
    archetypeTag: 'DAREDEVIL',
    cascadeOp: '+CHIPS',
    flavorQuip: 'Runs hottest right after near-catastrophe.',
    evaluate: (ctx) => {
      const bonus = Math.max(40, Math.round(ctx.stageHeat * 4));
      return { triggered: true, op: '+CHIPS', value: bonus, label: `+${bonus} CHIPS` };
    },
  },
  {
    relicId: 'relic_12_scarred_pendulum',
    name: 'SCARRED PENDULUM',
    shortEffect: 'x1.4 MULT WHEN STAGE HEAT >= 40',
    costCash: 370,
    rarity: 'GOLD',
    meshArchetype: 'POCKET_WATCH',
    archetypeTag: 'DAREDEVIL',
    cascadeOp: 'xMULT',
    flavorQuip: 'Swings faster when the crowd gets loud.',
    evaluate: (ctx) => {
      const hot = ctx.stageHeat >= 40;
      return { triggered: hot, op: 'xMULT', value: 1.4, label: 'x1.4 MULT' };
    },
  },

  // --- ARCHETYPE D: FORENSIC & TWIST SAVANT ---
  {
    relicId: 'relic_13_hot_mic',
    name: 'HOT MIC',
    shortEffect: '+3.0 MULT ON MIND-GAME TWIST TOYS',
    costCash: 320,
    rarity: 'STERLING',
    meshArchetype: 'VINTAGE_MIC',
    archetypeTag: 'FORENSIC',
    cascadeOp: '+MULT',
    flavorQuip: 'Catches Julian muttering the answers off-air.',
    evaluate: (ctx) => {
      const isTwist = ctx.toySpec ? (ctx.toySpec.isTwistToy || ctx.toySpec.family === 'MIND_GAME_TWISTS') : true;
      return { triggered: isTwist, op: '+MULT', value: 3.0, label: '+3.0 MULT' };
    },
  },
  {
    relicId: 'relic_14_uv_prism_lens',
    name: 'UV PRISM LENS',
    shortEffect: '+2.2 MULT ON FORENSIC & ATLAS TOYS',
    costCash: 290,
    rarity: 'STERLING',
    meshArchetype: 'PRISM_LENS',
    archetypeTag: 'FORENSIC',
    cascadeOp: '+MULT',
    flavorQuip: 'Sees straight through studio sleight of hand.',
    evaluate: (ctx) => {
      const fam = ctx.toySpec?.family;
      const hit = !fam || fam === 'FORENSIC_DETECTIVE' || fam === 'ATLAS_RELIEF_SPATIAL' || fam === 'PROGRESSIVE_AUDIO_REVEAL';
      return { triggered: hit, op: '+MULT', value: 2.2, label: '+2.2 MULT' };
    },
  },
  {
    relicId: 'relic_15_astrolabe_compass',
    name: 'ASTROLABE COMPASS',
    shortEffect: '+200 CHIPS ON DIFFICULTY ★5.0+ CLUES',
    costCash: 270,
    rarity: 'BRASS',
    meshArchetype: 'ASTROLABE',
    archetypeTag: 'FORENSIC',
    cascadeOp: '+CHIPS',
    flavorQuip: 'Points true north when the clues bite back.',
    evaluate: (ctx) => {
      const hard = (ctx.clue?.difficultyScore ?? 5.5) >= 5.0;
      return { triggered: hard, op: '+CHIPS', value: 200, label: '+200 CHIPS' };
    },
  },
  {
    relicId: 'relic_16_twister_tuning_fork',
    name: 'RESONANCE TUNING FORK',
    shortEffect: 'x1.8 MULT ON ANY TWIST TOY',
    costCash: 430,
    rarity: 'GOLD',
    meshArchetype: 'TUNING_FORK',
    archetypeTag: 'FORENSIC',
    cascadeOp: 'xMULT',
    flavorQuip: 'Hums at 440Hz whenever the rules flip.',
    evaluate: (ctx) => {
      const isTwist = ctx.toySpec ? ctx.toySpec.isTwistToy : true;
      return { triggered: isTwist, op: 'xMULT', value: 1.8, label: 'x1.8 MULT' };
    },
  },

  // --- ARCHETYPE E: STREAK & PRECISION ---
  {
    relicId: 'relic_17_streak_metronome',
    name: 'BRASS STREAK PENDULUM',
    shortEffect: '+0.8 MULT PER ACTIVE STREAK',
    costCash: 310,
    rarity: 'STERLING',
    meshArchetype: 'TUNING_FORK',
    archetypeTag: 'STREAK',
    cascadeOp: '+MULT',
    flavorQuip: 'Snowballs wildly once you lock three in a row.',
    evaluate: (ctx) => {
      const st = Math.max(1, ctx.streakCount);
      const gain = Number((st * 0.8).toFixed(2));
      return { triggered: true, op: '+MULT', value: gain, label: `+${gain} MULT` };
    },
  },
  {
    relicId: 'relic_18_bullseye_caliper',
    name: 'PRECISION CALIPER',
    shortEffect: 'x1.5 MULT ON >=90% ACCURACY',
    costCash: 380,
    rarity: 'GOLD',
    meshArchetype: 'ASTROLABE',
    archetypeTag: 'STREAK',
    cascadeOp: 'xMULT',
    flavorQuip: 'Rewards spotless locks and dial bullseyes.',
    evaluate: (ctx) => {
      const clean = (ctx.resolution?.accuracyRatio ?? 1) >= 0.9;
      return { triggered: clean, op: 'xMULT', value: 1.5, label: 'x1.5 MULT' };
    },
  },
  {
    relicId: 'relic_19_telegraph_combo',
    name: 'GOLD TELEGRAPH KEY',
    shortEffect: '+65 CHIPS PER ACTIVE STREAK',
    costCash: 230,
    rarity: 'BRASS',
    meshArchetype: 'TELEGRAPH_KEY',
    archetypeTag: 'STREAK',
    cascadeOp: '+CHIPS',
    flavorQuip: 'Taps out Morse applause across five studios.',
    evaluate: (ctx) => {
      const bonus = Math.max(65, ctx.streakCount * 65);
      return { triggered: true, op: '+CHIPS', value: bonus, label: `+${bonus} CHIPS` };
    },
  },
  {
    relicId: 'relic_20_studio_tube_amp',
    name: 'BROADCAST TUBE AMP',
    shortEffect: '+1.5 MULT ON EVERY CORRECT CLUE',
    costCash: 240,
    rarity: 'BRASS',
    meshArchetype: 'VACUUM_TUBE',
    archetypeTag: 'STREAK',
    cascadeOp: '+MULT',
    flavorQuip: 'Warm analog gain — place LEFT of xMult relics!',
    evaluate: () => ({ triggered: true, op: '+MULT', value: 1.5, label: '+1.5 MULT' }),
  },

  // --- ARCHETYPE F: CONTRABAND RULE-BREAKERS ---
  {
    relicId: 'relic_21_frankies_master_key',
    name: "FRANKIE'S DUPLICATOR",
    shortEffect: 'COPIES RELIC DIRECTLY TO ITS LEFT!',
    costCash: 520,
    rarity: 'CONTRABAND',
    meshArchetype: 'PRISM_LENS',
    archetypeTag: 'CONTRABAND',
    cascadeOp: 'xMULT',
    flavorQuip: 'Put this RIGHT of your strongest relic to double its fireworks!',
    evaluate: (ctx, leftNeighbor) => {
      if (!leftNeighbor || leftNeighbor.relicId === 'relic_21_frankies_master_key') {
        return { triggered: false, op: '+MULT', value: 0, label: 'PLACE RIGHT OF RELIC' };
      }
      const res = leftNeighbor.evaluate(ctx);
      return {
        triggered: res.triggered,
        op: res.op,
        value: res.value,
        label: `COPY ${res.label}`,
      };
    },
  },
  {
    relicId: 'relic_22_stagehand_magnet',
    name: "STAGEHAND'S MAGNET",
    shortEffect: '+1.2 MULT PER EQUIPPED RELIC',
    costCash: 460,
    rarity: 'CONTRABAND',
    meshArchetype: 'MAGNET_HORSESHOE',
    archetypeTag: 'CONTRABAND',
    cascadeOp: '+MULT',
    flavorQuip: 'Full 5-relic velvet tray turns into +6.0 MULT!',
    evaluate: (ctx) => {
      const gain = Number((Math.max(1, ctx.equippedRelicIds.length) * 1.2).toFixed(2));
      return { triggered: true, op: '+MULT', value: gain, label: `+${gain} MULT` };
    },
  },
  {
    relicId: 'relic_23_contraband_hot_dice',
    name: 'OBSIDIAN DOUBLE DIE',
    shortEffect: 'x2.0 MULT IF STREAK >= 3',
    costCash: 500,
    rarity: 'CONTRABAND',
    meshArchetype: 'GOLD_DICE',
    archetypeTag: 'CONTRABAND',
    cascadeOp: 'xMULT',
    flavorQuip: 'Turns hot streaks into broadcast bank-breakers.',
    evaluate: (ctx) => {
      const hot = ctx.streakCount >= 3;
      return { triggered: hot, op: 'xMULT', value: 2.0, label: 'x2.0 MULT' };
    },
  },
  {
    relicId: 'relic_24_sovereign_crown_seal',
    name: 'SOVEREIGN CROWN SEAL',
    shortEffect: 'x2.5 MULT ON CLIMAX OR HEAT >= 70',
    costCash: 580,
    rarity: 'CONTRABAND',
    meshArchetype: 'CROWN_SEAL',
    archetypeTag: 'CONTRABAND',
    cascadeOp: 'xMULT',
    flavorQuip: 'The championship relic forged beneath Stage 10.',
    evaluate: (ctx) => {
      const fire = Boolean(ctx.isClimaxTurn) || ctx.stageHeat >= 70;
      return { triggered: fire, op: 'xMULT', value: 2.5, label: 'x2.5 MULT' };
    },
  },
] as const;

export const RELIC_CATALOG_V6: readonly RelicDefinitionV6[] = RELIC_SPECS_V6;
export const RELIC_SPECS_BY_ID: ReadonlyMap<string, RelicSpecV6> = new Map(
  RELIC_SPECS_V6.map((r) => [r.relicId, r]),
);

// ============================================================================
// 18 HOLOGRAPHIC FOIL DIRTY-TRICK CARDS (ALL 9 EFFECT KINDS x 2 VARIANTS)
// ============================================================================

export const FOIL_TRICK_CATALOG_V6: readonly FoilTrickCardV6[] = [
  { cardId: 'foil_01_double_stake', name: 'DOUBLE STAKE', shortEffect: 'DOUBLE FINAL MULT THIS TURN', costCash: 160, effectKind: 'DOUBLE_MULT' },
  { cardId: 'foil_02_velvet_surge', name: 'VELVET SPOTLIGHT', shortEffect: 'x2.0 MULT ON TWIST OR VAULT', costCash: 180, effectKind: 'DOUBLE_MULT' },
  { cardId: 'foil_03_screw_rival', name: 'SCREW RIVAL', shortEffect: 'FORCE RIVAL ONTO HARDEST TILE', costCash: 170, effectKind: 'SCREW_RIVAL' },
  { cardId: 'foil_04_blind_rival', name: 'BLIND RIVAL', shortEffect: 'JAM RIVAL BOARD WITH STUDIO FOG', costCash: 165, effectKind: 'SCREW_RIVAL' },
  { cardId: 'foil_05_shatter_chains', name: 'SHATTER CHAINS', shortEffect: 'BREAK ALL IRON LOCKS ON TILE', costCash: 145, effectKind: 'SHATTER_CHAINS' },
  { cardId: 'foil_06_thermite_key', name: 'THERMITE LOCKPICK', shortEffect: 'CRACK LOCKED VAULT INSTANTLY', costCash: 175, effectKind: 'SHATTER_CHAINS' },
  { cardId: 'foil_07_swap_clue_toy', name: 'SWAP CLUE TOY', shortEffect: 'REROUTE CLUE TO NEW STAGE TOY', costCash: 120, effectKind: 'SWAP_CLUE_TOY' },
  { cardId: 'foil_08_dealers_wild', name: "DEALER'S WILD SWITCH", shortEffect: 'SWAP ACTIVE TOY FOR TWIST TOY', costCash: 150, effectKind: 'SWAP_CLUE_TOY' },
  { cardId: 'foil_09_freeze_node', name: 'LIQUID NITROGEN', shortEffect: 'FREEZE 1 NODE AGAINST RIVAL', costCash: 135, effectKind: 'FREEZE_NODE' },
  { cardId: 'foil_10_ice_padlock', name: 'ICE-BOX CLAMP', shortEffect: 'LOCK DOWN HIGH-VALUE TILE', costCash: 140, effectKind: 'FREEZE_NODE' },
  { cardId: 'foil_11_orrery_crank', name: 'FREE ORRERY CRANK', shortEffect: 'ROTATE ANY RING WITHOUT TURN', costCash: 130, effectKind: 'ROTATE_RING_FREE' },
  { cardId: 'foil_12_gear_shift', name: 'BACKSTAGE GEAR SHIFT', shortEffect: 'ALIGN STAGE RINGS FOR JACKPOT', costCash: 155, effectKind: 'ROTATE_RING_FREE' },
  { cardId: 'foil_13_uv_mole_scan', name: 'UV MOLE SCANNER', shortEffect: 'EXPOSE HIDDEN DOUBLE-AGENT TILE', costCash: 140, effectKind: 'REVEAL_MOLE' },
  { cardId: 'foil_14_wiretap_tape', name: 'WIRETAP TRANSCRIPT', shortEffect: 'REVEAL ALL CURSED TRAPS NOW', costCash: 160, effectKind: 'REVEAL_MOLE' },
  { cardId: 'foil_15_insulated_snips', name: 'INSULATED SNIPS', shortEffect: 'AUTO-DEFUSE 1 DECOY WIRE', costCash: 125, effectKind: 'DEFUSE_ONE_WIRE' },
  { cardId: 'foil_16_short_circuit', name: 'DECOY SHORT-OUT', shortEffect: 'ELIMINATE 1 FALSE ANSWER LIVE', costCash: 135, effectKind: 'DEFUSE_ONE_WIRE' },
  { cardId: 'foil_17_pickpocket_cane', name: "PICKPOCKET'S CANE", shortEffect: 'SIPHON 20% OF RIVAL TURN POT', costCash: 190, effectKind: 'STEAL_RIVAL_POT' },
  { cardId: 'foil_18_skim_envelope', name: 'BACKSTAGE SKIM', shortEffect: 'STEAL RIVAL STREAK BONUS CASH', costCash: 210, effectKind: 'STEAL_RIVAL_POT' },
] as const;

export const FOIL_CARDS_BY_ID: ReadonlyMap<string, FoilTrickCardV6> = new Map(
  FOIL_TRICK_CATALOG_V6.map((c) => [c.cardId, c]),
);

// ============================================================================
// STRICT BALATRO LEFT-TO-RIGHT SCORING CASCADE EVALUATOR
// ============================================================================

const STREAK_CHORDS: readonly FoleySfxIdV6[] = [
  'streak_chord_1',
  'streak_chord_2',
  'streak_chord_3',
  'streak_chord_4',
  'streak_fanfare_5',
];

export function evaluateRelicScoringCascadeV6(ctx: RelicEvalContextV6): RelicCascadeResultV6 {
  let chips = Math.max(0, Math.round(ctx.baseChips));
  let mult = Math.max(1, Number(ctx.baseMult.toFixed(2)));
  const startChips = chips;
  const startMult = mult;
  const steps: RelicCascadeStepV6[] = [];

  for (let slot = 0; slot < ctx.equippedRelicIds.length; slot++) {
    const relicId = ctx.equippedRelicIds[slot];
    const spec = RELIC_SPECS_BY_ID.get(relicId);
    if (!spec) continue;
    const leftSpec = slot > 0 ? RELIC_SPECS_BY_ID.get(ctx.equippedRelicIds[slot - 1]) : undefined;
    const out = spec.evaluate(ctx, leftSpec);
    if (!out.triggered) continue;

    if (out.op === '+CHIPS') {
      chips += Math.round(out.value);
    } else if (out.op === '+MULT') {
      mult = Number((mult + out.value).toFixed(2));
    } else if (out.op === 'xMULT') {
      mult = Number((mult * out.value).toFixed(2));
    }

    const stepIndex = steps.length;
    steps.push({
      stepIndex,
      slotIndex: slot,
      relicId: spec.relicId,
      relicName: spec.name,
      op: out.op,
      value: out.value,
      deltaLabel: out.label,
      chipsAfter: chips,
      multAfter: mult,
      delayMs: stepIndex * 180,
      sfxCue: STREAK_CHORDS[Math.min(STREAK_CHORDS.length - 1, stepIndex)],
    });
  }

  if (ctx.activeFoilKinds?.includes('DOUBLE_MULT')) {
    mult = Number((mult * 2).toFixed(2));
    const stepIndex = steps.length;
    steps.push({
      stepIndex,
      slotIndex: -1,
      relicId: 'foil_double_mult',
      relicName: 'DOUBLE STAKE FOIL',
      op: 'xMULT',
      value: 2.0,
      deltaLabel: 'x2.0 FOIL',
      chipsAfter: chips,
      multAfter: mult,
      delayMs: stepIndex * 180,
      sfxCue: 'streak_fanfare_5',
    });
  }

  return {
    startChips,
    startMult,
    finalChips: chips,
    finalMult: mult,
    totalPayout: Math.round(chips * mult),
    steps,
  };
}

// ============================================================================
// PROCEDURAL BRASS/GOLD SVG ARTIFACT RENDERER (ZERO OS EMOJIS!)
// ============================================================================

function renderRelicSvgIcon(archetype: RelicDefinitionV6['meshArchetype'], rarity: RelicDefinitionV6['rarity']): string {
  const stroke = rarity === 'CONTRABAND' ? '#ff708d' : rarity === 'GOLD' ? '#ffe074' : rarity === 'STERLING' ? '#b8e8ff' : '#e6b253';
  const fill = rarity === 'CONTRABAND' ? '#4a1020' : rarity === 'GOLD' ? '#4f3509' : rarity === 'STERLING' ? '#173042' : '#33200d';

  const inner: Record<RelicDefinitionV6['meshArchetype'], string> = {
    VACUUM_TUBE: `<rect x="14" y="6" width="12" height="22" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="2"/><path d="M17 18h6M20 12v10M15 28h10v4H15z" stroke="${stroke}" stroke-width="1.8"/>`,
    LUCKY_COIN: `<circle cx="20" cy="20" r="13" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/><circle cx="20" cy="20" r="8.5" fill="none" stroke="${stroke}" stroke-dasharray="3 2"/><path d="M20 14l1.8 4 4.2.5-3.2 2.8.9 4.2L20 23.4 16.3 25.5l.9-4.2L14 18.5l4.2-.5z" fill="${stroke}"/>`,
    VINTAGE_MIC: `<rect x="13" y="6" width="14" height="17" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="2"/><path d="M14 12h12M14 16h12M20 23v8M14 31h12" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`,
    ASTROLABE: `<circle cx="20" cy="20" r="13" fill="${fill}" stroke="${stroke}" stroke-width="2"/><ellipse cx="20" cy="20" rx="13" ry="5" fill="none" stroke="${stroke}" stroke-width="1.5"/><line x1="10" y1="29" x2="30" y2="11" stroke="${stroke}" stroke-width="2"/>`,
    POCKET_WATCH: `<circle cx="20" cy="22" r="11" fill="${fill}" stroke="${stroke}" stroke-width="2"/><path d="M17 7h6M20 7v4M20 22l4-5M20 22h-4" stroke="${stroke}" stroke-width="2" stroke-linecap="round"/>`,
    TUNING_FORK: `<path d="M15 7v11a5 5 0 0010 0V7M20 23v10" fill="none" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round"/>`,
    PRISM_LENS: `<polygon points="20,6 33,30 7,30" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/><line x1="4" y1="22" x2="15" y2="20" stroke="#fff" stroke-width="2"/><line x1="25" y1="20" x2="36" y2="15" stroke="#5ef2c6" stroke-width="2"/><line x1="26" y1="22" x2="36" y2="25" stroke="#ff6b8b" stroke-width="2"/>`,
    MAGNET_HORSESHOE: `<path d="M12 10v11a8 8 0 0016 0V10" fill="none" stroke="${stroke}" stroke-width="4" stroke-linecap="round"/><rect x="9" y="8" width="6" height="5" fill="#fff3c4"/><rect x="25" y="8" width="6" height="5" fill="#fff3c4"/>`,
    NIXIE_VALVE: `<rect x="11" y="7" width="18" height="24" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2"/><circle cx="20" cy="15.5" r="3.2" fill="none" stroke="#ff9f43" stroke-width="2"/><circle cx="20" cy="22.5" r="3.8" fill="none" stroke="#ff9f43" stroke-width="2"/>`,
    GOLD_DICE: `<rect x="9" y="9" width="22" height="22" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="2.2"/><circle cx="15" cy="15" r="2" fill="${stroke}"/><circle cx="25" cy="15" r="2" fill="${stroke}"/><circle cx="20" cy="20" r="2" fill="${stroke}"/><circle cx="15" cy="25" r="2" fill="${stroke}"/><circle cx="25" cy="25" r="2" fill="${stroke}"/>`,
    TELEGRAPH_KEY: `<path d="M8 27h24M12 22h16M18 14h8v8h-8zM24 14l6-4" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round"/><circle cx="31" cy="10" r="3" fill="${stroke}"/>`,
    CROWN_SEAL: `<path d="M8 28l3-15 6 7 3-10 3 10 6-7 3 15z" fill="${fill}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>`,
  };

  return `<svg viewBox="0 0 40 40" width="32" height="32" aria-hidden="true">${inner[archetype]}</svg>`;
}

// ============================================================================
// FRANKIE'S VELVET BACKSTAGE FLIGHT TRUNK UI (ZERO SCROLL · DRAG REORDER!)
// ============================================================================

export interface PropTrunkStateV6 {
  bankrollCash: number;
  equippedRelicIds: string[]; // ordered left -> right, maxSlots default 5
  ownedFoilCardIds: string[]; // max 3 active foil trick cards
  maxRelicSlots: number;
  maxFoilSlots: number;
  streakCount: number;
  survivedTrapdoorCount: number;
  stageHeat: number;
}

export interface PropTrunkViewOptionsV6 {
  readonly state: PropTrunkStateV6;
  readonly seed?: number;
  readonly nextTwistPreview?: string;
  readonly frankieGreeting?: string;
  readonly onSfx?: (sfx: FoleySfxIdV6) => void;
  readonly onStateChange: (nextState: PropTrunkStateV6) => void;
  readonly onContinueToStage: (finalState: PropTrunkStateV6) => void;
}

export interface PropTrunkViewHandleV6 {
  dispose(): void;
}

const STYLE_ID_TRUNK = 'v6-prop-trunk-styles';

function ensurePropTrunkStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID_TRUNK)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID_TRUNK;
  style.textContent = `
.v6tr-root {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  background: radial-gradient(circle at 50% 18%, #471121 0%, #240710 68%, #130308 100%);
  border: 2.5px solid #d9ab4c;
  border-radius: 14px;
  color: #fff6e5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  user-select: none;
  -webkit-user-select: none;
  box-shadow: inset 0 0 36px rgba(0, 0, 0, 0.72), 0 14px 36px rgba(0, 0, 0, 0.78);
}
.v6tr-root *, .v6tr-root *::before, .v6tr-root *::after {
  box-sizing: border-box;
}
.v6tr-top {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 5px;
  border-bottom: 1.5px solid rgba(217, 171, 76, 0.48);
}
.v6tr-title {
  margin: 0;
  font-family: Georgia, serif;
  font-size: clamp(14px, 2.3dvh, 18px);
  font-weight: 900;
  color: #ffe28a;
  letter-spacing: 0.04em;
}
.v6tr-sub {
  font-size: 10px;
  line-height: 1.18;
  color: #e6c6cf;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.v6tr-cash-pill {
  font-family: "Courier New", monospace;
  font-size: 15px;
  font-weight: 900;
  color: #6df7b8;
  background: #14060a;
  border: 1.5px solid #d9ab4c;
  border-radius: 9px;
  padding: 3px 10px;
  white-space: nowrap;
}
.v6tr-body {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}
.v6tr-root.v6tr-landscape .v6tr-body {
  flex-direction: row;
}
.v6tr-rail-panel {
  flex: 0 0 auto;
  background: linear-gradient(180deg, #2d0914 0%, #19040a 100%);
  border: 1.5px solid rgba(217, 171, 76, 0.6);
  border-radius: 10px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.v6tr-root.v6tr-landscape .v6tr-rail-panel {
  flex: 0 0 44%;
  height: 100%;
  justify-content: space-between;
}
.v6tr-order-math {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 10.5px;
  font-weight: 900;
  color: #ffe082;
  background: #120408;
  padding: 4px 8px;
  border-radius: 7px;
  border: 1px solid rgba(240, 196, 88, 0.35);
}
.v6tr-slots {
  display: grid;
  grid-template-columns: repeat(var(--v6tr-slot-cols, 4), minmax(0, 1fr));
  gap: 5px;
}
.v6tr-slot {
  border: 1.5px solid #b5893a;
  border-radius: 8px;
  background: linear-gradient(180deg, #3a111e 0%, #1c060d 100%);
  padding: 4px 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 2px;
  text-align: center;
  min-height: clamp(46px, 8.2dvh, 72px);
  cursor: grab;
}
.v6tr-slot.empty {
  border-style: dashed;
  border-color: rgba(217, 171, 76, 0.35);
  background: rgba(16, 4, 8, 0.45);
  justify-content: center;
  color: #8c6a74;
  font-size: 9.5px;
  font-weight: 800;
  cursor: default;
}
.v6tr-slot.drag-over {
  border-color: #46f0a5;
  box-shadow: 0 0 0 2px rgba(70, 240, 165, 0.4);
}
.v6tr-slot-name {
  font-size: 9px;
  font-weight: 900;
  color: #fff6e0;
  line-height: 1.1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.v6tr-slot-op {
  font-size: 8.5px;
  font-weight: 900;
  padding: 1px 4px;
  border-radius: 4px;
  background: #140509;
  color: #6df7b8;
}
.v6tr-slot-op.xmult {
  color: #ff708d;
}
.v6tr-slot-ctrls {
  display: flex;
  gap: 2px;
  width: 100%;
  justify-content: center;
}
.v6tr-mini-btn {
  appearance: none;
  border: 1px solid #b5893a;
  border-radius: 4px;
  background: #230911;
  color: #ffe399;
  font-size: 9px;
  font-weight: 900;
  padding: 2px 4px;
  cursor: pointer;
}
.v6tr-shop-panel {
  flex: 1 1 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
}
.v6tr-shop-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  flex: 1 1 0;
  min-height: 0;
}
.v6tr-item-card {
  position: relative;
  border: 1.5px solid #c99a44;
  border-radius: 10px;
  background: linear-gradient(160deg, #33101b 0%, #17050a 100%);
  padding: clamp(3px, 0.7dvh, 6px) 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  gap: 2px;
  min-height: 0;
  overflow: hidden;
}
.v6tr-item-card svg {
  width: clamp(18px, 3.2dvh, 28px);
  height: clamp(18px, 3.2dvh, 28px);
  flex-shrink: 0;
}
.v6tr-item-card.foil {
  --hx: 50%;
  --hy: 30%;
  border-color: #9cecff;
  background:
    radial-gradient(circle at var(--hx) var(--hy), rgba(156, 236, 255, 0.32) 0%, rgba(255, 118, 178, 0.14) 36%, rgba(16, 12, 30, 0.94) 76%),
    linear-gradient(145deg, #271b47 0%, #120b24 100%);
}
.v6tr-buy-btn {
  appearance: none;
  width: 100%;
  flex-shrink: 0;
  border: 1.5px solid #ffe074;
  border-radius: 6px;
  background: linear-gradient(180deg, #f0be4a 0%, #b57a16 100%);
  color: #190f04;
  font-size: clamp(9px, 1.45dvh, 10.5px);
  font-weight: 900;
  padding: clamp(2px, 0.45dvh, 4px) 5px;
  cursor: pointer;
}
.v6tr-buy-btn:disabled {
  opacity: 0.4;
  cursor: default;
}
.v6tr-footer {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.v6tr-cta {
  appearance: none;
  border: 2px solid #84f7c3;
  border-radius: 10px;
  background: linear-gradient(180deg, #2fd687 0%, #15824c 100%);
  color: #051c10;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 8px 14px;
  cursor: pointer;
  box-shadow: 0 3px 0 #093d22;
}
.v6tr-reroll {
  appearance: none;
  border: 1.5px solid #d9ab4c;
  border-radius: 10px;
  background: linear-gradient(180deg, #3e1522 0%, #20070f 100%);
  color: #ffe28a;
  font-size: 11px;
  font-weight: 900;
  padding: 8px 12px;
  cursor: pointer;
}
.v6tr-reroll:disabled {
  opacity: 0.4;
}
`;
  document.head.appendChild(style);
}

function escapeHtml(raw: string): string {
  return String(raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function mountPropTrunkViewV6(
  container: HTMLElement,
  options: PropTrunkViewOptionsV6,
): PropTrunkViewHandleV6 {
  ensurePropTrunkStyles();

  const state: PropTrunkStateV6 = {
    bankrollCash: options.state.bankrollCash,
    equippedRelicIds: [...options.state.equippedRelicIds],
    ownedFoilCardIds: [...options.state.ownedFoilCardIds],
    maxRelicSlots: options.state.maxRelicSlots || 5,
    maxFoilSlots: options.state.maxFoilSlots || 3,
    streakCount: options.state.streakCount,
    survivedTrapdoorCount: options.state.survivedTrapdoorCount,
    stageHeat: options.state.stageHeat,
  };

  let rerollSeed = (options.seed ?? Date.now()) >>> 0;
  const rerollCost = 75;
  let dragFromSlot: number | null = null;
  let disposed = false;
  const cleanups: Array<() => void> = [];

  const sfx = (id: FoleySfxIdV6) => {
    if (!disposed) options.onSfx?.(id);
  };
  sfx('velvet_trunk_clasp');

  const rollStock = () => {
    const availRelics = RELIC_SPECS_V6.filter((r) => !state.equippedRelicIds.includes(r.relicId));
    const pick = <T,>(arr: readonly T[], count: number, salt: number): T[] => {
      const copy = [...arr];
      let s = (rerollSeed ^ salt) >>> 0;
      for (let i = copy.length - 1; i > 0; i--) {
        s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
        const j = s % (i + 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, count);
    };
    return {
      relics: pick(availRelics, 3, 0x9e3779b9),
      foils: pick(FOIL_TRICK_CATALOG_V6, 3, 0x85ebca6b),
    };
  };

  let stock = rollStock();

  container.innerHTML = '';
  const root = document.createElement('div');
  root.className = 'v6tr-root';
  container.appendChild(root);

  const syncLayout = () => {
    const r = root.getBoundingClientRect();
    root.classList.toggle('v6tr-landscape', r.width > 520 && r.height > 120 && r.width / r.height > 1.25 && r.height < 560);
  };
  syncLayout();
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(syncLayout);
    ro.observe(root);
    cleanups.push(() => ro.disconnect());
  }

  const swapEquippedSlots = (a: number, b: number) => {
    if (a < 0 || b < 0 || a >= state.equippedRelicIds.length || b >= state.equippedRelicIds.length || a === b) return;
    const copy = [...state.equippedRelicIds];
    [copy[a], copy[b]] = [copy[b], copy[a]];
    state.equippedRelicIds = copy;
    sfx('relic_pedestal_hum');
    options.onStateChange({ ...state, equippedRelicIds: [...state.equippedRelicIds], ownedFoilCardIds: [...state.ownedFoilCardIds] });
    render();
  };

  const render = () => {
    // Live Balatro Slot-Order Math Preview (200 Base Chips -> Left-to-Right Cascade!)
    const sim = evaluateRelicScoringCascadeV6({
      baseChips: 200,
      baseMult: 1.0,
      equippedRelicIds: state.equippedRelicIds,
      streakCount: Math.max(2, state.streakCount),
      survivedTrapdoorCount: Math.max(1, state.survivedTrapdoorCount),
      bankrollCash: state.bankrollCash,
      stageHeat: Math.max(40, state.stageHeat),
    });

    const slotsHtml = Array.from({ length: state.maxRelicSlots }, (_, idx) => {
      const rid = state.equippedRelicIds[idx];
      const spec = rid ? RELIC_SPECS_BY_ID.get(rid) : undefined;
      if (!spec) {
        return `<div class="v6tr-slot empty">SLOT ${idx + 1}</div>`;
      }
      const sellVal = Math.round(spec.costCash * 0.5);
      return `
        <div class="v6tr-slot" draggable="true" data-slot="${idx}" title="${escapeHtml(spec.shortEffect)}">
          ${renderRelicSvgIcon(spec.meshArchetype, spec.rarity)}
          <div class="v6tr-slot-name">${escapeHtml(spec.name)}</div>
          <span class="v6tr-slot-op ${spec.cascadeOp === 'xMULT' ? 'xmult' : ''}">${spec.cascadeOp}</span>
          <div class="v6tr-slot-ctrls">
            <button type="button" class="v6tr-mini-btn" data-mv="${idx}:-1" ${idx === 0 ? 'disabled' : ''}>◀</button>
            <button type="button" class="v6tr-mini-btn" data-sell="${idx}">$${sellVal}</button>
            <button type="button" class="v6tr-mini-btn" data-mv="${idx}:1" ${idx === state.equippedRelicIds.length - 1 ? 'disabled' : ''}>▶</button>
          </div>
        </div>
      `;
    }).join('');

    root.innerHTML = `
      <div class="v6tr-top">
        <div style="min-width:0;">
          <h3 class="v6tr-title">FRANKIE'S BACKSTAGE VELVET TRUNK</h3>
          <div class="v6tr-sub">${escapeHtml(options.frankieGreeting ?? 'Drag or nudge Relics LEFT → RIGHT: put +MULT left of xMULT!')}</div>
        </div>
        <div class="v6tr-cash-pill">$${state.bankrollCash.toLocaleString('en-US')}</div>
      </div>

      <div class="v6tr-body">
        <div class="v6tr-rail-panel">
          <div class="v6tr-order-math">
            <span>L→R ORDER SIM (200 CHIPS): ${sim.finalChips} × ${sim.finalMult.toFixed(2)}</span>
            <span style="color:#6df7b8;">= $${sim.totalPayout.toLocaleString('en-US')}</span>
          </div>
          <div class="v6tr-slots" id="v6trSlots" style="--v6tr-slot-cols:${state.maxRelicSlots};">${slotsHtml}</div>
          <div style="display:flex;justify-content:space-between;font-size:10px;color:#d9b5c0;font-weight:700;">
            <span>FOIL HAND: ${state.ownedFoilCardIds.length}/${state.maxFoilSlots} (${state.ownedFoilCardIds.map((id) => FOIL_CARDS_BY_ID.get(id)?.name ?? '').filter(Boolean).join(', ') || 'EMPTY'})</span>
            <span>HEAT ${state.stageHeat}</span>
          </div>
        </div>

        <div class="v6tr-shop-panel">
          <div class="v6tr-shop-grid">
            ${stock.relics.map((r) => {
              const canBuy = state.bankrollCash >= r.costCash && state.equippedRelicIds.length < state.maxRelicSlots;
              return `
                <div class="v6tr-item-card">
                  <div style="font-size:8.5px;font-weight:900;color:#ffe082;letter-spacing:0.08em;">${r.rarity} RELIC</div>
                  ${renderRelicSvgIcon(r.meshArchetype, r.rarity)}
                  <div style="font-size:10.5px;font-weight:900;line-height:1.12;">${escapeHtml(r.name)}</div>
                  <div style="font-size:9px;color:#ead0d8;line-height:1.15;">${escapeHtml(r.shortEffect)}</div>
                  <button type="button" class="v6tr-buy-btn" data-buy-relic="${r.relicId}" ${canBuy ? '' : 'disabled'}>BUY $${r.costCash}</button>
                </div>
              `;
            }).join('')}
          </div>
          <div class="v6tr-shop-grid">
            ${stock.foils.map((f) => {
              const canBuy = state.bankrollCash >= f.costCash && state.ownedFoilCardIds.length < state.maxFoilSlots;
              return `
                <div class="v6tr-item-card foil" data-foil-card="${f.cardId}">
                  <div style="font-size:8.5px;font-weight:900;color:#9cecff;letter-spacing:0.1em;">HOLO FOIL TRICK</div>
                  <div style="font-size:10.5px;font-weight:900;color:#ffffff;">${escapeHtml(f.name)}</div>
                  <div style="font-size:9px;color:#d6e9ff;line-height:1.15;">${escapeHtml(f.shortEffect)}</div>
                  <button type="button" class="v6tr-buy-btn" data-buy-foil="${f.cardId}" ${canBuy ? '' : 'disabled'}>TUCK $${f.costCash}</button>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="v6tr-footer">
        <button type="button" class="v6tr-reroll" id="v6trReroll" ${state.bankrollCash >= rerollCost ? '' : 'disabled'}>REROLL TRUNK ($${rerollCost})</button>
        <div style="font-size:10px;color:#f5c782;font-weight:800;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
          ${escapeHtml(options.nextTwistPreview ? `NEXT STAGE: ${options.nextTwistPreview}` : 'ORDER MATTERS: +MULT LEFT OF xMULT')}
        </div>
        <button type="button" class="v6tr-cta" id="v6trGo">STEP ON STAGE →</button>
      </div>
    `;

    // Bind 1-Tap Reorder & Sell + HTML5 Drag-and-Drop Reordering
    root.querySelectorAll<HTMLButtonElement>('[data-mv]').forEach((b) => {
      b.addEventListener('click', () => {
        const [iS, dS] = (b.dataset.mv ?? '0:0').split(':');
        swapEquippedSlots(Number(iS), Number(iS) + Number(dS));
      });
    });
    root.querySelectorAll<HTMLButtonElement>('[data-sell]').forEach((b) => {
      b.addEventListener('click', () => {
        const idx = Number(b.dataset.sell);
        const rid = state.equippedRelicIds[idx];
        const spec = RELIC_SPECS_BY_ID.get(rid);
        if (!spec) return;
        state.equippedRelicIds.splice(idx, 1);
        state.bankrollCash += Math.round(spec.costCash * 0.5);
        sfx('chip_stack_riffle');
        options.onStateChange({ ...state, equippedRelicIds: [...state.equippedRelicIds], ownedFoilCardIds: [...state.ownedFoilCardIds] });
        render();
      });
    });
    root.querySelectorAll<HTMLElement>('[data-slot]').forEach((slotEl) => {
      const idx = Number(slotEl.dataset.slot);
      slotEl.addEventListener('dragstart', () => { dragFromSlot = idx; });
      slotEl.addEventListener('dragover', (e) => { e.preventDefault(); slotEl.classList.add('drag-over'); });
      slotEl.addEventListener('dragleave', () => { slotEl.classList.remove('drag-over'); });
      slotEl.addEventListener('drop', (e) => {
        e.preventDefault();
        slotEl.classList.remove('drag-over');
        if (dragFromSlot !== null) {
          swapEquippedSlots(dragFromSlot, idx);
          dragFromSlot = null;
        }
      });
    });

    // Live Holographic Prismatic Tilt on Foil Cards
    root.querySelectorAll<HTMLElement>('[data-foil-card]').forEach((cardEl) => {
      cardEl.addEventListener('pointermove', (e) => {
        const rect = cardEl.getBoundingClientRect();
        if (rect.width <= 1 || rect.height <= 1) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        cardEl.style.setProperty('--hx', `${x.toFixed(1)}%`);
        cardEl.style.setProperty('--hy', `${y.toFixed(1)}%`);
      });
    });

    // Buy Relic / Foil / Reroll / Continue
    root.querySelectorAll<HTMLButtonElement>('[data-buy-relic]').forEach((b) => {
      b.addEventListener('click', () => {
        const rid = b.dataset.buyRelic!;
        const spec = RELIC_SPECS_BY_ID.get(rid);
        if (!spec || state.bankrollCash < spec.costCash || state.equippedRelicIds.length >= state.maxRelicSlots) return;
        state.bankrollCash -= spec.costCash;
        state.equippedRelicIds.push(spec.relicId);
        stock.relics = stock.relics.filter((r) => r.relicId !== rid);
        sfx('relic_pedestal_hum');
        options.onStateChange({ ...state, equippedRelicIds: [...state.equippedRelicIds], ownedFoilCardIds: [...state.ownedFoilCardIds] });
        render();
      });
    });
    root.querySelectorAll<HTMLButtonElement>('[data-buy-foil]').forEach((b) => {
      b.addEventListener('click', () => {
        const cid = b.dataset.buyFoil!;
        const card = FOIL_CARDS_BY_ID.get(cid);
        if (!card || state.bankrollCash < card.costCash || state.ownedFoilCardIds.length >= state.maxFoilSlots) return;
        state.bankrollCash -= card.costCash;
        state.ownedFoilCardIds.push(card.cardId);
        stock.foils = stock.foils.filter((f) => f.cardId !== cid);
        sfx('foil_card_flick');
        options.onStateChange({ ...state, equippedRelicIds: [...state.equippedRelicIds], ownedFoilCardIds: [...state.ownedFoilCardIds] });
        render();
      });
    });
    root.querySelector('#v6trReroll')?.addEventListener('click', () => {
      if (state.bankrollCash < rerollCost) return;
      state.bankrollCash -= rerollCost;
      rerollSeed = (Math.imul(rerollSeed, 1664525) + 1013904223) >>> 0;
      stock = rollStock();
      sfx('brass_gear_detent');
      options.onStateChange({ ...state, equippedRelicIds: [...state.equippedRelicIds], ownedFoilCardIds: [...state.ownedFoilCardIds] });
      render();
    });
    root.querySelector('#v6trGo')?.addEventListener('click', () => {
      sfx('velvet_trunk_clasp');
      options.onContinueToStage({
        ...state,
        equippedRelicIds: [...state.equippedRelicIds],
        ownedFoilCardIds: [...state.ownedFoilCardIds],
      });
    });
  };

  render();

  return {
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
