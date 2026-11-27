// ============================================================================
// WORLD'S SMARTEST: SWEETS WEEK DELUXE (v8.0) — DUAL SPOKEN STUDIO 6A VOICE BANK
// `src/v7/audio/StudioVoiceBankV8.ts`
//
// - 55 Pre-Baked 1966 RCA 44-BX Ribbon-Mastered Offline Broadcast Voice Cues
//   (`public/assets/v7/audio/vo/*.mp3`, 44.1 kHz mono, -14.5 dBFS active RMS):
//     1. BOOTH_ANNOUNCER — Golden-Age Deep Velvet Baritone (Don Pardo / Johnny Olson)
//     2. GRANT_BELLAMY   — Charismatic 1966 Prime-Time Emcee (Gene Rayburn / Peter Marshall)
//     3. STUDIO_GREMLIN  — Hanna-Barbera / UPA Slapstick Cartoon Studio Imp
// - Lazy on-demand fetch + `decodeAudioData` cache + non-blocking `warmPreloadCoreCues`
// - Single-Channel Priority Arbiter (`3 > 2 > 1`, ZERO overlapping voices):
//     * `newPriority >= activePriority`: smooth 45ms linear fade-out (`0.0001`) & stop
//       before launching the incoming cue (zero clicks, zero dual-voice talk-over)
//     * `newPriority < activePriority`: drops stale lower-tier quips cleanly
//     * `stopCurrentVoice(fadeSec = 0.045)`: instant studio hush on fast player taps
// - Automatic `-5.0 dB` showband music ducking via `onDuckMusic` callback
// ============================================================================

import type {
  GremlinSkitIdV8,
  StudioVoiceCueIdV8,
  StudioVoiceCueSpecV8,
  StudioVoicePoolIdV8,
  VoicePriorityTierV8,
  VoiceSpeakerIdV8,
} from '../contracts_v7';

export const DEFAULT_VOICE_VOLUME_V8 = 88;
export const DEFAULT_VOICE_DUCK_DB_V8 = -5.0;
const DEFAULT_CROSS_HUSH_SEC = 0.045;

/** Stored Gemini 3.8 Voice Design IDs for Studio 6A provenance. */
export const STUDIO_VOICE_DESIGN_IDS_V8: Readonly<Record<VoiceSpeakerIdV8, string>> = {
  BOOTH_ANNOUNCER: 'voice_rrh84z5dymb0',
  GRANT_BELLAMY: 'voice_qk23il7n9sbi',
  STUDIO_GREMLIN: 'voice_q93uh19vg0rz',
};

/**
 * Exhaustive 55-cue Studio 6A Voice Catalog (`100%` `StudioVoiceCueIdV8` coverage).
 */
export const STUDIO_VOICE_CUE_CATALOG_V8: Readonly<
  Record<StudioVoiceCueIdV8, StudioVoiceCueSpecV8>
> = {
  VO_COLD_OPEN_WELCOME: {
    cueId: 'VO_COLD_OPEN_WELCOME',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_cold_open_welcome.mp3',
    subtitle: "From Studio 6A, in Living Color \u2014 fifty million are watching World's Smartest!",
    durationSecEst: 5.15,
  },
  VO_SHOW_CURTAIN_RAISER: {
    cueId: 'VO_SHOW_CURTAIN_RAISER',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_show_curtain_raiser.mp3',
    subtitle: "Places everyone! Light the Tote Board \u2014 here comes your host, Grant Bellamy!",
    durationSecEst: 5.12,
  },
  VO_ACT2_DOUBLE_STAKES: {
    cueId: 'VO_ACT2_DOUBLE_STAKES',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_act2_double_stakes.mp3',
    subtitle: "Act Two is live \u2014 and the studio stakes just jumped to Double Dollars!",
    durationSecEst: 4.96,
  },
  VO_ACT3_FINAL_WAGER_INTRO: {
    cueId: 'VO_ACT3_FINAL_WAGER_INTRO',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_act3_final_wager_intro.mp3',
    subtitle: "Act Three! It all comes down to Tonight's Final Broadcast Wager!",
    durationSecEst: 5.07,
  },
  VO_DAILY_BROADCAST_OPEN: {
    cueId: 'VO_DAILY_BROADCAST_OPEN',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_daily_broadcast_open.mp3',
    subtitle: "Coast to coast, it's Today's Worldwide Daily Broadcast Challenge!",
    durationSecEst: 4.97,
  },
  VO_COUCH_2P_OPEN: {
    cueId: 'VO_COUCH_2P_OPEN',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_couch_2p_open.mp3',
    subtitle: "Two podiums, one living room \u2014 welcome to Couch Showdown Live!",
    durationSecEst: 4.78,
  },
  VO_TWIST_SECRET_SQUARE: {
    cueId: 'VO_TWIST_SECRET_SQUARE',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_secret_square.mp3',
    subtitle: "Hold everything \u2014 you've uncovered the Studio Secret Square!",
    durationSecEst: 4.52,
  },
  VO_TWIST_GOLD_VAULT_OPEN: {
    cueId: 'VO_TWIST_GOLD_VAULT_OPEN',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_gold_vault_open.mp3',
    subtitle: "The brass tumblers click \u2014 the Locked Gold Vault is wide open!",
    durationSecEst: 5.07,
  },
  VO_TWIST_BIG_WHEEL_SPIN: {
    cueId: 'VO_TWIST_BIG_WHEEL_SPIN',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_big_wheel_spin.mp3',
    subtitle: "Step right up and give the Big Studio Wheel a mighty spin!",
    durationSecEst: 4.53,
  },
  VO_TWIST_BIG_WHEEL_JACKPOT: {
    cueId: 'VO_TWIST_BIG_WHEEL_JACKPOT',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_big_wheel_jackpot.mp3',
    subtitle: "Top dollar on the Big Wheel \u2014 Prime-Time Jackpot!",
    durationSecEst: 3.54,
  },
  VO_TWIST_BIG_WHEEL_DOUBLE: {
    cueId: 'VO_TWIST_BIG_WHEEL_DOUBLE',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_big_wheel_double.mp3',
    subtitle: "Double on the Wheel! Your very next claim pays twice the cash!",
    durationSecEst: 4.65,
  },
  VO_TWIST_LIGHT_BOARD_OPEN: {
    cueId: 'VO_TWIST_LIGHT_BOARD_OPEN',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_light_board_open.mp3',
    subtitle: "Fire up the flashing Light Board \u2014 big bucks, no Studio Gremlins!",
    durationSecEst: 4.51,
  },
  VO_TWIST_LIGHT_BOARD_PASS: {
    cueId: 'VO_TWIST_LIGHT_BOARD_PASS',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_light_board_pass.mp3',
    subtitle: "Hot spins passed across the stage \u2014 your rival has to take the heat!",
    durationSecEst: 4.95,
  },
  VO_TWIST_MYSTERY_CURTAIN: {
    cueId: 'VO_TWIST_MYSTERY_CURTAIN',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_mystery_curtain.mp3',
    subtitle: "Curtain One, Two, or Three \u2014 let's make a prime-time deal!",
    durationSecEst: 4.66,
  },
  VO_TWIST_OPPONENT_CHOICE: {
    cueId: 'VO_TWIST_OPPONENT_CHOICE',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_opponent_choice.mp3',
    subtitle: "Opponent's Choice! Let's see how you handle a curveball category!",
    durationSecEst: 3.63,
  },
  VO_TWIST_PRIZE_MATCH_STEAL: {
    cueId: 'VO_TWIST_PRIZE_MATCH_STEAL',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_twist_prize_match_steal.mp3',
    subtitle: "Prize Match Steal! You snatched that pair right out from under them!",
    durationSecEst: 4.03,
  },
  VO_BOOTH_TELL_ALERT: {
    cueId: 'VO_BOOTH_TELL_ALERT',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_booth_tell_alert.mp3',
    subtitle: "Eyes on Control Booth A \u2014 somebody upstairs is tipping the clue!",
    durationSecEst: 3.32,
  },
  VO_BOOTH_FEED_INTERCEPTED: {
    cueId: 'VO_BOOTH_FEED_INTERCEPTED',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_booth_feed_intercepted.mp3',
    subtitle: "Busted on live television! Control Booth A's rigged signal is cut!",
    durationSecEst: 4.0,
  },
  VO_BARGAIN_ROLLOUT: {
    cueId: 'VO_BARGAIN_ROLLOUT',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_bargain_rollout.mp3',
    subtitle: "Roll out the velvet Curtain Call Instant Bargain Desk!",
    durationSecEst: 3.97,
  },
  VO_BARGAIN_SOLD: {
    cueId: 'VO_BARGAIN_SOLD',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_bargain_sold.mp3',
    subtitle: "Sold! Ring the bell \u2014 that studio bargain is all yours!",
    durationSecEst: 3.6,
  },
  VO_BARGAIN_NO_SALE: {
    cueId: 'VO_BARGAIN_NO_SALE',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_bargain_no_sale.mp3',
    subtitle: "No sale! Smart discipline \u2014 keeping every dollar of your lead!",
    durationSecEst: 3.63,
  },
  VO_MYTH_KLAXON_1: {
    cueId: 'VO_MYTH_KLAXON_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_myth_klaxon_1.mp3',
    subtitle: "Sound the Myth Klaxon! Everyone swears that's true \u2014 and everyone's wrong!",
    durationSecEst: 4.75,
  },
  VO_MYTH_KLAXON_2: {
    cueId: 'VO_MYTH_KLAXON_2',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_myth_klaxon_2.mp3',
    subtitle: "Ooh, the Popular Myth Trap strikes again! Folks fall for that every week!",
    durationSecEst: 4.1,
  },
  VO_QUICK_DRAW_1: {
    cueId: 'VO_QUICK_DRAW_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_quick_draw_1.mp3',
    subtitle: "Quick-Draw lightning on the buzzer \u2014 the ink wasn't even dry!",
    durationSecEst: 2.94,
  },
  VO_QUICK_DRAW_2: {
    cueId: 'VO_QUICK_DRAW_2',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_quick_draw_2.mp3',
    subtitle: "Fastest thumb in Studio 6A \u2014 didn't even blink!",
    durationSecEst: 2.84,
  },
  VO_DIAL_BULLSEYE: {
    cueId: 'VO_DIAL_BULLSEYE',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_dial_bullseye.mp3',
    subtitle: "Dead-center bullseye on the dial! Give that brain a cigar!",
    durationSecEst: 3.29,
  },
  VO_DIAL_NEAR_MISS: {
    cueId: 'VO_DIAL_NEAR_MISS',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_dial_near_miss.mp3',
    subtitle: "Razor-close on the dial! Right in the prime-time neighborhood!",
    durationSecEst: 2.86,
  },
  VO_SHUTTER_EARLY_JACKPOT: {
    cueId: 'VO_SHUTTER_EARLY_JACKPOT',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_shutter_early_jackpot.mp3',
    subtitle: "Solved before the shutters cleared \u2014 Early-Solve Bonus Payout!",
    durationSecEst: 3.93,
  },
  VO_REBOUND_POT_SCOOP: {
    cueId: 'VO_REBOUND_POT_SCOOP',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_rebound_pot_scoop.mp3',
    subtitle: "They fumbled it, and you scoop the glowing Studio Rebound Pot!",
    durationSecEst: 3.24,
  },
  VO_STREAK_3_HOT: {
    cueId: 'VO_STREAK_3_HOT',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_streak_3_hot.mp3',
    subtitle: "Three in a row! Call the fire marshal, this podium's heating up!",
    durationSecEst: 3.13,
  },
  VO_STREAK_5_UNSTOPPABLE: {
    cueId: 'VO_STREAK_5_UNSTOPPABLE',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_streak_5_unstoppable.mp3',
    subtitle: "Five straight on the Tote Board \u2014 an unstoppable prime-time heater!",
    durationSecEst: 3.44,
  },
  VO_HOST_RIGHT_1: {
    cueId: 'VO_HOST_RIGHT_1',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_1.mp3',
    subtitle: "Right on the money! Stack those crisp broadcast dollars!",
    durationSecEst: 3.01,
  },
  VO_HOST_RIGHT_2: {
    cueId: 'VO_HOST_RIGHT_2',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_2.mp3',
    subtitle: "Bingo! Clean as a whistle \u2014 put it on the Tote Board!",
    durationSecEst: 2.22,
  },
  VO_HOST_RIGHT_3: {
    cueId: 'VO_HOST_RIGHT_3',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_3.mp3',
    subtitle: "Nailed it! You made that look like Sunday morning!",
    durationSecEst: 2.14,
  },
  VO_HOST_RIGHT_4: {
    cueId: 'VO_HOST_RIGHT_4',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_4.mp3',
    subtitle: "Spot on! Our research department tips their hats to you!",
    durationSecEst: 3.22,
  },
  VO_HOST_WRONG_1: {
    cueId: 'VO_HOST_WRONG_1',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_1.mp3',
    subtitle: "Ooh, tough break! Our writers tucked a sneaky curveball in there!",
    durationSecEst: 3.54,
  },
  VO_HOST_WRONG_2: {
    cueId: 'VO_HOST_WRONG_2',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_2.mp3',
    subtitle: "Ah, just missed the mark \u2014 shake it off, plenty of board left!",
    durationSecEst: 3.26,
  },
  VO_HOST_WRONG_3: {
    cueId: 'VO_HOST_WRONG_3',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_3.mp3',
    subtitle: "Buzzer bites on that one \u2014 file that twist away for next time!",
    durationSecEst: 2.99,
  },
  VO_HOST_WRONG_4: {
    cueId: 'VO_HOST_WRONG_4',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_4.mp3',
    subtitle: "So tempting, yet no cigar! Let's win the next tile right back!",
    durationSecEst: 3.35,
  },
  VO_FINAL_WAGER_LOCKED: {
    cueId: 'VO_FINAL_WAGER_LOCKED',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_final_wager_locked.mp3',
    subtitle: "The wagers are sealed in the vault \u2014 here is your Final Clue!",
    durationSecEst: 2.96,
  },
  VO_FINAL_REVEAL_SHOWDOWN: {
    cueId: 'VO_FINAL_REVEAL_SHOWDOWN',
    speaker: 'GRANT_BELLAMY',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_final_reveal_showdown.mp3',
    subtitle: "Pencils down, fifty million leaning in \u2014 let's reveal the final answers!",
    durationSecEst: 4.01,
  },
  VO_CEREMONY_NEW_CHAMPION: {
    cueId: 'VO_CEREMONY_NEW_CHAMPION',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_ceremony_new_champion.mp3',
    subtitle: "Strike up the brass! Sign the check for our brand-new Champion!",
    durationSecEst: 5.06,
  },
  VO_CEREMONY_RETURNING_STREAK: {
    cueId: 'VO_CEREMONY_RETURNING_STREAK',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_ceremony_returning_streak.mp3',
    subtitle: "Still undefeated! Our Returning Champion defends the crown in Living Color!",
    durationSecEst: 4.86,
  },
  VO_CEREMONY_CLOSE_LOSS: {
    cueId: 'VO_CEREMONY_CLOSE_LOSS',
    speaker: 'GRANT_BELLAMY',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_ceremony_close_loss.mp3',
    subtitle: "What a photo finish! Hold your head high and come win it right back!",
    durationSecEst: 3.75,
  },
  VO_CEREMONY_CO_CHAMPION: {
    cueId: 'VO_CEREMONY_CO_CHAMPION',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_ceremony_co_champion.mp3',
    subtitle: "Dead-heat tie on the Tote Board \u2014 tonight we crown Co-Champions!",
    durationSecEst: 4.77,
  },
  VO_CEREMONY_DAILY_WIN: {
    cueId: 'VO_CEREMONY_DAILY_WIN',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_ceremony_daily_win.mp3',
    subtitle: "You conquered Today's Daily Broadcast \u2014 share your score coast to coast!",
    durationSecEst: 4.94,
  },
  VO_CEREMONY_COUCH_WINNER: {
    cueId: 'VO_CEREMONY_COUCH_WINNER',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_ceremony_couch_winner.mp3',
    subtitle: "Bragging rights in the living room \u2014 hail tonight's Couch Showdown Champion!",
    durationSecEst: 4.86,
  },
  VO_GREMLIN_REEL_MOWER: {
    cueId: 'VO_GREMLIN_REEL_MOWER',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_reel_mower.mp3',
    subtitle: "Nyah-ha-ha! Time to mow down that bankroll \u2014 trim it nice and short!",
    durationSecEst: 4.54,
  },
  VO_GREMLIN_CANISTER_VAC: {
    cueId: 'VO_GREMLIN_CANISTER_VAC',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_canister_vac.mp3',
    subtitle: "Hoo-hoo-ha! Stand back, folks \u2014 vacuuming up every shiny dollar!",
    durationSecEst: 4.25,
  },
  VO_GREMLIN_JACKHAMMER: {
    cueId: 'VO_GREMLIN_JACKHAMMER',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_jackhammer.mp3',
    subtitle: "Heh-heh-heh! Jackhammer crew coming through \u2014 watch out below, yikes!",
    durationSecEst: 4.32,
  },
  VO_GREMLIN_TNT_PLUNGER: {
    cueId: 'VO_GREMLIN_TNT_PLUNGER',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_tnt_plunger.mp3',
    subtitle: "Tee-hee-hee! Fire in the scoreboard \u2014 one push of the plunger, kaboom!",
    durationSecEst: 4.27,
  },
  VO_GREMLIN_CABLE_SHEARS: {
    cueId: 'VO_GREMLIN_CABLE_SHEARS',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_cable_shears.mp3',
    subtitle: "Snip-snip, nyah-ha! Oopsie \u2014 did you actually need that scoreboard cable?",
    durationSecEst: 4.44,
  },
  VO_GREMLIN_WATUSI_BROOM: {
    cueId: 'VO_GREMLIN_WATUSI_BROOM',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_watusi_broom.mp3',
    subtitle: "Do the Watusi, baby \u2014 sweeping your cash right into my dustpan!",
    durationSecEst: 4.48,
  },
  VO_GREMLIN_CATWALK_MAGNET: {
    cueId: 'VO_GREMLIN_CATWALK_MAGNET',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_catwalk_magnet.mp3',
    subtitle: "Yoink, heh-heh! Giant studio magnet coming down \u2014 thanks for the loot!",
    durationSecEst: 4.94,
  },
  VO_GREMLIN_TIN_UFO: {
    cueId: 'VO_GREMLIN_TIN_UFO',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_tin_ufo.mp3',
    subtitle: "Beep-boop, nyah-ha! Beaming your bankroll straight to outer space \u2014 bye-bye!",
    durationSecEst: 5.04,
  },
  VO_TV_INTRO_1: {
    cueId: 'VO_TV_INTRO_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_tv_intro_1.mp3',
    subtitle: "An IBC Living Color Presentation, live from Studio 6A! Step up for World's Smartest!",
    durationSecEst: 4.87,
  },
  VO_TV_INTRO_2: {
    cueId: 'VO_TV_INTRO_2',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_tv_intro_2.mp3',
    subtitle: "Direct from Television City in radiant Living Color \u2014 America's biggest battle of wits, World's Smartest!",
    durationSecEst: 4.86,
  },
  VO_TV_INTRO_3: {
    cueId: 'VO_TV_INTRO_3',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_tv_intro_3.mp3',
    subtitle: "Fifty million viewers coast to coast! Light the Tote Board \u2014 it's showtime on World's Smartest!",
    durationSecEst: 4.86,
  },
  VO_TV_INTRO_4: {
    cueId: 'VO_TV_INTRO_4',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_tv_intro_4.mp3',
    subtitle: "Cue the brass band and roll Camera One! Here is your star emcee, Grant Bellamy!",
    durationSecEst: 4.87,
  },
  VO_COLD_OPEN_ALT_1: {
    cueId: 'VO_COLD_OPEN_ALT_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_cold_open_alt_1.mp3',
    subtitle: "Good evening, America! The Tote Board is lit and big broadcast dollars are on the line!",
    durationSecEst: 4.87,
  },
  VO_COLD_OPEN_ALT_2: {
    cueId: 'VO_COLD_OPEN_ALT_2',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_cold_open_alt_2.mp3',
    subtitle: "Live under the Klieg lights, a brand-new challenger steps up to test tonight's Champion!",
    durationSecEst: 4.99,
  },
  VO_COLD_OPEN_ALT_3: {
    cueId: 'VO_COLD_OPEN_ALT_3',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_cold_open_alt_3.mp3',
    subtitle: "Hands on your buzzers and eyes on the board \u2014 let's play World's Smartest!",
    durationSecEst: 4.49,
  },
  VO_CREDITS_SIGNOFF_1: {
    cueId: 'VO_CREDITS_SIGNOFF_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_credits_signoff_1.mp3',
    subtitle: "World's Smartest was brought to you in Living Color! Good night from Studio 6A!",
    durationSecEst: 4.75,
  },
  VO_CREDITS_SIGNOFF_2: {
    cueId: 'VO_CREDITS_SIGNOFF_2',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_credits_signoff_2.mp3',
    subtitle: "For Grant Bellamy and our entire Studio 6A crew \u2014 so long, coast to coast!",
    durationSecEst: 4.81,
  },
  VO_CREDITS_SIGNOFF_3: {
    cueId: 'VO_CREDITS_SIGNOFF_3',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_credits_signoff_3.mp3',
    subtitle: "Stay tuned for the 11 O'Clock News on most of these IBC stations! Good night, everybody!",
    durationSecEst: 4.59,
  },
  VO_CREDITS_SIGNOFF_4: {
    cueId: 'VO_CREDITS_SIGNOFF_4',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_credits_signoff_4.mp3',
    subtitle: "Contestant accommodations furnished by the Beverly Continental! Join us next time on World's Smartest!",
    durationSecEst: 4.87,
  },
  VO_SECRET_SQUARE_ALT_1: {
    cueId: 'VO_SECRET_SQUARE_ALT_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_secret_square_alt_1.mp3',
    subtitle: "Ding-ding-ding! You just hit tonight's hidden Secret Square!",
    durationSecEst: 3.49,
  },
  VO_SECRET_SQUARE_ALT_2: {
    cueId: 'VO_SECRET_SQUARE_ALT_2',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_secret_square_alt_2.mp3',
    subtitle: "Flash those marquee bulbs \u2014 it's a double-payout Secret Square!",
    durationSecEst: 3.96,
  },
  VO_GOLD_VAULT_ALT_1: {
    cueId: 'VO_GOLD_VAULT_ALT_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gold_vault_alt_1.mp3',
    subtitle: "Swing open the steel door \u2014 the $500 Gold Vault is live!",
    durationSecEst: 4.73,
  },
  VO_GOLD_VAULT_ALT_2: {
    cueId: 'VO_GOLD_VAULT_ALT_2',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gold_vault_alt_2.mp3',
    subtitle: "Heavy brass bolts unlocked! Big vault money is up for grabs!",
    durationSecEst: 3.93,
  },
  VO_BIG_WHEEL_ALT_1: {
    cueId: 'VO_BIG_WHEEL_ALT_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_big_wheel_alt_1.mp3',
    subtitle: "Round and round goes the 20-Wedge Studio Wheel!",
    durationSecEst: 3.26,
  },
  VO_BIG_WHEEL_ALT_2: {
    cueId: 'VO_BIG_WHEEL_ALT_2',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_big_wheel_alt_2.mp3',
    subtitle: "Listen to that leather clapper click \u2014 big wheel cash on the line!",
    durationSecEst: 3.95,
  },
  VO_MYSTERY_CURTAIN_ALT_1: {
    cueId: 'VO_MYSTERY_CURTAIN_ALT_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_mystery_curtain_alt_1.mp3',
    subtitle: "Part the crimson velvet! What's hiding behind the Mystery Curtain?",
    durationSecEst: 3.64,
  },
  VO_MYSTERY_CURTAIN_ALT_2: {
    cueId: 'VO_MYSTERY_CURTAIN_ALT_2',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_mystery_curtain_alt_2.mp3',
    subtitle: "A prime-time gamble! Pick your velvet curtain and cross your fingers!",
    durationSecEst: 3.69,
  },
  VO_SHOWCASE_SPOTLIGHT_1: {
    cueId: 'VO_SHOWCASE_SPOTLIGHT_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_showcase_spotlight_1.mp3',
    subtitle: "Spotlight on center stage \u2014 it's a Studio 6A Special Showcase!",
    durationSecEst: 4.58,
  },
  VO_SHOWCASE_SPOTLIGHT_2: {
    cueId: 'VO_SHOWCASE_SPOTLIGHT_2',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_showcase_spotlight_2.mp3',
    subtitle: "Roll out our custom studio contraption for bonus multiplier cash!",
    durationSecEst: 4.38,
  },
  VO_SHOWCASE_SPOTLIGHT_3: {
    cueId: 'VO_SHOWCASE_SPOTLIGHT_3',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_showcase_spotlight_3.mp3',
    subtitle: "Hands-on television! Step up to the Special Showcase Monitor!",
    durationSecEst: 3.94,
  },
  VO_BOOTH_BUSTED_ALT_1: {
    cueId: 'VO_BOOTH_BUSTED_ALT_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_booth_busted_alt_1.mp3',
    subtitle: "Standards & Practices steps in! Caught red-handed on network TV!",
    durationSecEst: 4.31,
  },
  VO_BOOTH_BUSTED_ALT_2: {
    cueId: 'VO_BOOTH_BUSTED_ALT_2',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_booth_busted_alt_2.mp3',
    subtitle: "Pull the plug on Booth A! That sneaky signal just backfired!",
    durationSecEst: 4.06,
  },
  VO_BARGAIN_ROLLOUT_ALT_1: {
    cueId: 'VO_BARGAIN_ROLLOUT_ALT_1',
    speaker: 'BOOTH_ANNOUNCER',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_bargain_rollout_alt_1.mp3',
    subtitle: "Sound the bargain bell! Three tempting studio deals just hit the turntable!",
    durationSecEst: 4.91,
  },
  VO_HOST_RIGHT_5: {
    cueId: 'VO_HOST_RIGHT_5',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_5.mp3',
    subtitle: "Right on the money! Stack those crisp studio dollars!",
    durationSecEst: 3.51,
  },
  VO_HOST_RIGHT_6: {
    cueId: 'VO_HOST_RIGHT_6',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_6.mp3',
    subtitle: "Bingo! Clean as a whistle and straight into your bank!",
    durationSecEst: 3.02,
  },
  VO_HOST_RIGHT_7: {
    cueId: 'VO_HOST_RIGHT_7',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_7.mp3',
    subtitle: "Sharp thinking! Our research department tips its hat to you!",
    durationSecEst: 3.2,
  },
  VO_HOST_RIGHT_8: {
    cueId: 'VO_HOST_RIGHT_8',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_8.mp3',
    subtitle: "Nailed it! Look at that split-flap scoreboard climb!",
    durationSecEst: 3.36,
  },
  VO_HOST_RIGHT_9: {
    cueId: 'VO_HOST_RIGHT_9',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_9.mp3',
    subtitle: "Bullseye! You read that cue card like a seasoned pro!",
    durationSecEst: 2.92,
  },
  VO_HOST_RIGHT_10: {
    cueId: 'VO_HOST_RIGHT_10',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_10.mp3',
    subtitle: "Yes indeed! Ring the bell and light up another square!",
    durationSecEst: 3.13,
  },
  VO_HOST_RIGHT_11: {
    cueId: 'VO_HOST_RIGHT_11',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_11.mp3',
    subtitle: "Pure gold! That's how you command a prime-time board!",
    durationSecEst: 3.32,
  },
  VO_HOST_RIGHT_12: {
    cueId: 'VO_HOST_RIGHT_12',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_right_12.mp3',
    subtitle: "Count it! Not a shadow of a doubt on Podium One!",
    durationSecEst: 2.65,
  },
  VO_STREAK_HOT_ALT_1: {
    cueId: 'VO_STREAK_HOT_ALT_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_streak_hot_alt_1.mp3',
    subtitle: "Look out folks \u2014 Podium One is officially on a heater!",
    durationSecEst: 2.77,
  },
  VO_STREAK_HOT_ALT_2: {
    cueId: 'VO_STREAK_HOT_ALT_2',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_streak_hot_alt_2.mp3',
    subtitle: "Another one falls! Somebody check if that buzzer is smoking!",
    durationSecEst: 3.55,
  },
  VO_STREAK_HOT_ALT_3: {
    cueId: 'VO_STREAK_HOT_ALT_3',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_streak_hot_alt_3.mp3',
    subtitle: "Hot streak rolling! Every consecutive hit juices your multiplier!",
    durationSecEst: 3.83,
  },
  VO_COMEBACK_SURGE_1: {
    cueId: 'VO_COMEBACK_SURGE_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_comeback_surge_1.mp3',
    subtitle: "Hold the phone \u2014 we have got ourselves a prime-time comeback!",
    durationSecEst: 3.3,
  },
  VO_COMEBACK_SURGE_2: {
    cueId: 'VO_COMEBACK_SURGE_2',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_comeback_surge_2.mp3',
    subtitle: "Right back in contention! Never count this challenger out!",
    durationSecEst: 3.06,
  },
  VO_HOST_WRONG_5: {
    cueId: 'VO_HOST_WRONG_5',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_5.mp3',
    subtitle: "Ooh, close shave! Shake it off \u2014 plenty of cash still on the rack!",
    durationSecEst: 3.49,
  },
  VO_HOST_WRONG_6: {
    cueId: 'VO_HOST_WRONG_6',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_6.mp3',
    subtitle: "Ah, tricky curveball from our writers! File that fact away!",
    durationSecEst: 3.22,
  },
  VO_HOST_WRONG_7: {
    cueId: 'VO_HOST_WRONG_7',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_7.mp3',
    subtitle: "Not quite! And remember \u2014 misses feed $100 into the Rebound Pot!",
    durationSecEst: 3.56,
  },
  VO_HOST_WRONG_8: {
    cueId: 'VO_HOST_WRONG_8',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_8.mp3',
    subtitle: "Buzzer bites on that one! Don't sweat it \u2014 steal the momentum right back!",
    durationSecEst: 3.39,
  },
  VO_HOST_WRONG_9: {
    cueId: 'VO_HOST_WRONG_9',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_9.mp3',
    subtitle: "Oof, tempting decoy! Even our defending champs trip over that one!",
    durationSecEst: 3.82,
  },
  VO_HOST_WRONG_10: {
    cueId: 'VO_HOST_WRONG_10',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_host_wrong_10.mp3',
    subtitle: "Missed it by a whisker! Eyes on the next high-dollar square!",
    durationSecEst: 3.01,
  },
  VO_RIVAL_STUMBLED_1: {
    cueId: 'VO_RIVAL_STUMBLED_1',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_rival_stumbled_1.mp3',
    subtitle: "Aha, the Champion misses! That leaves the door wide open for you!",
    durationSecEst: 3.42,
  },
  VO_RIVAL_STUMBLED_2: {
    cueId: 'VO_RIVAL_STUMBLED_2',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_rival_stumbled_2.mp3',
    subtitle: "Even the reigning champ is human! Your turn to pounce on the board!",
    durationSecEst: 3.25,
  },
  VO_RIVAL_STUMBLED_3: {
    cueId: 'VO_RIVAL_STUMBLED_3',
    speaker: 'GRANT_BELLAMY',
    priority: 1,
    mp3Path: './assets/v7/audio/vo/vo_rival_stumbled_3.mp3',
    subtitle: "Swing and a miss on Podium Two \u2014 plus $100 into the Rebound Pot!",
    durationSecEst: 3.68,
  },
  VO_LIFELINE_5050_1: {
    cueId: 'VO_LIFELINE_5050_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_lifeline_5050_1.mp3',
    subtitle: "50/50 Studio Cut! Clear two wrong decoys off the monitor!",
    durationSecEst: 3.56,
  },
  VO_LIFELINE_5050_2: {
    cueId: 'VO_LIFELINE_5050_2',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_lifeline_5050_2.mp3',
    subtitle: "Smart move! Snipping two traps leaves you a clean 50/50 shot!",
    durationSecEst: 3.54,
  },
  VO_LIFELINE_5050_3: {
    cueId: 'VO_LIFELINE_5050_3',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_lifeline_5050_3.mp3',
    subtitle: "Control room, slice two wrong choices right off that board!",
    durationSecEst: 2.99,
  },
  VO_LIFELINE_POLL_1: {
    cueId: 'VO_LIFELINE_POLL_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_lifeline_poll_1.mp3',
    subtitle: "Let's poll our live Studio 6A audience! Light up your keypads, folks!",
    durationSecEst: 3.93,
  },
  VO_LIFELINE_POLL_2: {
    cueId: 'VO_LIFELINE_POLL_2',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_lifeline_poll_2.mp3',
    subtitle: "Going to the gallery! Let's see where fifty million viewers are leaning!",
    durationSecEst: 3.05,
  },
  VO_LIFELINE_POLL_3: {
    cueId: 'VO_LIFELINE_POLL_3',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_lifeline_poll_3.mp3',
    subtitle: "Audience Poll is in! Check those percentages right on your pads!",
    durationSecEst: 3.17,
  },
  VO_LIFELINE_SWAP_1: {
    cueId: 'VO_LIFELINE_SWAP_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_lifeline_swap_1.mp3',
    subtitle: "Free Cue-Card Swap! Toss that card out and deal a brand-new question!",
    durationSecEst: 4.1,
  },
  VO_LIFELINE_SWAP_2: {
    cueId: 'VO_LIFELINE_SWAP_2',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_lifeline_swap_2.mp3',
    subtitle: "Switching cue cards! Same cash stakes, fresh question on the monitor!",
    durationSecEst: 3.64,
  },
  VO_LIFELINE_SWAP_3: {
    cueId: 'VO_LIFELINE_SWAP_3',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_lifeline_swap_3.mp3',
    subtitle: "Smart audible! Let's pull a fresh envelope from the category stack!",
    durationSecEst: 3.2,
  },
  VO_BARGAIN_SOLD_ALT_1: {
    cueId: 'VO_BARGAIN_SOLD_ALT_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_bargain_sold_alt_1.mp3',
    subtitle: "Ring it up at the Bargain Desk! Let's see that bold investment pay off!",
    durationSecEst: 3.29,
  },
  VO_MYTH_KLAXON_3: {
    cueId: 'VO_MYTH_KLAXON_3',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_myth_klaxon_3.mp3',
    subtitle: "Whoop-whoop! Another famous urban legend bites the dust in Studio 6A!",
    durationSecEst: 4.16,
  },
  VO_REBOUND_SCOOP_ALT_1: {
    cueId: 'VO_REBOUND_SCOOP_ALT_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_rebound_scoop_alt_1.mp3',
    subtitle: "Cha-ching! You just swept every bonus dollar out of the Studio Rebound Pot!",
    durationSecEst: 4.14,
  },
  VO_COUCH_PASS_TURN_1: {
    cueId: 'VO_COUCH_PASS_TURN_1',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_couch_pass_turn_1.mp3',
    subtitle: "Hand the controls across the couch \u2014 Podium Two is up next!",
    durationSecEst: 2.93,
  },
  VO_COUCH_PASS_TURN_2: {
    cueId: 'VO_COUCH_PASS_TURN_2',
    speaker: 'GRANT_BELLAMY',
    priority: 2,
    mp3Path: './assets/v7/audio/vo/vo_couch_pass_turn_2.mp3',
    subtitle: "Pass the spotlight! Your couch rival steps up to the Tote Board!",
    durationSecEst: 3.06,
  },
  VO_GREMLIN_TAUNT_1: {
    cueId: 'VO_GREMLIN_TAUNT_1',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_taunt_1.mp3',
    subtitle: "Heh-heh-heh! Thanks for the shiny broadcast bucks, pal!",
    durationSecEst: 4.87,
  },
  VO_GREMLIN_TAUNT_2: {
    cueId: 'VO_GREMLIN_TAUNT_2',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_taunt_2.mp3',
    subtitle: "Boing-oing-oing! Should've hit STOP while you were ahead, hotshot!",
    durationSecEst: 3.49,
  },
  VO_GREMLIN_TAUNT_3: {
    cueId: 'VO_GREMLIN_TAUNT_3',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_taunt_3.mp3',
    subtitle: "Yoo-hoo from Studio 6A! Your stash just went poof!",
    durationSecEst: 4.47,
  },
  VO_GREMLIN_TAUNT_4: {
    cueId: 'VO_GREMLIN_TAUNT_4',
    speaker: 'STUDIO_GREMLIN',
    priority: 3,
    mp3Path: './assets/v7/audio/vo/vo_gremlin_taunt_4.mp3',
    subtitle: "Nyah-hah-hah! Gremlin tax collected in glorious Living Color!",
    durationSecEst: 4.38,
  },
};

export const STUDIO_VOICE_POOLS_V8: Readonly<Record<StudioVoicePoolIdV8, readonly StudioVoiceCueIdV8[]>> = {
  POOL_TV_INTRO: ['VO_TV_INTRO_1', 'VO_TV_INTRO_2', 'VO_TV_INTRO_3', 'VO_TV_INTRO_4'],
  POOL_COLD_OPEN: ['VO_COLD_OPEN_WELCOME', 'VO_SHOW_CURTAIN_RAISER', 'VO_COLD_OPEN_ALT_1', 'VO_COLD_OPEN_ALT_2', 'VO_COLD_OPEN_ALT_3'],
  POOL_ACT2_BUMPER: ['VO_ACT2_DOUBLE_STAKES'],
  POOL_ACT3_WAGER: ['VO_ACT3_FINAL_WAGER_INTRO', 'VO_FINAL_WAGER_LOCKED'],
  POOL_HOST_RIGHT: [
    'VO_HOST_RIGHT_1', 'VO_HOST_RIGHT_2', 'VO_HOST_RIGHT_3', 'VO_HOST_RIGHT_4',
    'VO_HOST_RIGHT_5', 'VO_HOST_RIGHT_6', 'VO_HOST_RIGHT_7', 'VO_HOST_RIGHT_8',
    'VO_HOST_RIGHT_9', 'VO_HOST_RIGHT_10', 'VO_HOST_RIGHT_11', 'VO_HOST_RIGHT_12',
  ],
  POOL_HOST_WRONG: [
    'VO_HOST_WRONG_1', 'VO_HOST_WRONG_2', 'VO_HOST_WRONG_3', 'VO_HOST_WRONG_4',
    'VO_HOST_WRONG_5', 'VO_HOST_WRONG_6', 'VO_HOST_WRONG_7', 'VO_HOST_WRONG_8',
    'VO_HOST_WRONG_9', 'VO_HOST_WRONG_10',
  ],
  POOL_QUICK_DRAW: ['VO_QUICK_DRAW_1', 'VO_QUICK_DRAW_2'],
  POOL_STREAK_HOT: ['VO_STREAK_3_HOT', 'VO_STREAK_5_UNSTOPPABLE', 'VO_STREAK_HOT_ALT_1', 'VO_STREAK_HOT_ALT_2', 'VO_STREAK_HOT_ALT_3'],
  POOL_COMEBACK: ['VO_COMEBACK_SURGE_1', 'VO_COMEBACK_SURGE_2'],
  POOL_LIFELINE_5050: ['VO_LIFELINE_5050_1', 'VO_LIFELINE_5050_2', 'VO_LIFELINE_5050_3'],
  POOL_LIFELINE_POLL: ['VO_LIFELINE_POLL_1', 'VO_LIFELINE_POLL_2', 'VO_LIFELINE_POLL_3'],
  POOL_LIFELINE_SWAP: ['VO_LIFELINE_SWAP_1', 'VO_LIFELINE_SWAP_2', 'VO_LIFELINE_SWAP_3'],
  POOL_SECRET_SQUARE: ['VO_TWIST_SECRET_SQUARE', 'VO_SECRET_SQUARE_ALT_1', 'VO_SECRET_SQUARE_ALT_2'],
  POOL_GOLD_VAULT: ['VO_TWIST_GOLD_VAULT_OPEN', 'VO_GOLD_VAULT_ALT_1', 'VO_GOLD_VAULT_ALT_2'],
  POOL_BIG_WHEEL: ['VO_TWIST_BIG_WHEEL_SPIN', 'VO_BIG_WHEEL_ALT_1', 'VO_BIG_WHEEL_ALT_2'],
  POOL_LIGHT_BOARD: ['VO_TWIST_LIGHT_BOARD_OPEN', 'VO_TWIST_LIGHT_BOARD_PASS'],
  POOL_MYSTERY_CURTAIN: ['VO_TWIST_MYSTERY_CURTAIN', 'VO_MYSTERY_CURTAIN_ALT_1', 'VO_MYSTERY_CURTAIN_ALT_2'],
  POOL_SHOWCASE_INTRO: ['VO_SHOWCASE_SPOTLIGHT_1', 'VO_SHOWCASE_SPOTLIGHT_2', 'VO_SHOWCASE_SPOTLIGHT_3'],
  POOL_BARGAIN_OPEN: ['VO_BARGAIN_ROLLOUT', 'VO_BARGAIN_ROLLOUT_ALT_1'],
  POOL_BARGAIN_SOLD: ['VO_BARGAIN_SOLD', 'VO_BARGAIN_SOLD_ALT_1'],
  POOL_BARGAIN_NOSALE: ['VO_BARGAIN_NO_SALE'],
  POOL_MYTH_KLAXON: ['VO_MYTH_KLAXON_1', 'VO_MYTH_KLAXON_2', 'VO_MYTH_KLAXON_3'],
  POOL_REBOUND_SCOOP: ['VO_REBOUND_POT_SCOOP', 'VO_REBOUND_SCOOP_ALT_1'],
  POOL_RIVAL_STUMBLED: ['VO_RIVAL_STUMBLED_1', 'VO_RIVAL_STUMBLED_2', 'VO_RIVAL_STUMBLED_3'],
  POOL_BOOTH_BUSTED: ['VO_BOOTH_FEED_INTERCEPTED', 'VO_BOOTH_BUSTED_ALT_1', 'VO_BOOTH_BUSTED_ALT_2'],
  POOL_COUCH_PASS: ['VO_COUCH_PASS_TURN_1', 'VO_COUCH_PASS_TURN_2'],
  POOL_CREDITS_SIGNOFF: ['VO_CREDITS_SIGNOFF_1', 'VO_CREDITS_SIGNOFF_2', 'VO_CREDITS_SIGNOFF_3', 'VO_CREDITS_SIGNOFF_4'],
  POOL_GREMLIN_GLEE: ['VO_GREMLIN_TAUNT_1', 'VO_GREMLIN_TAUNT_2', 'VO_GREMLIN_TAUNT_3', 'VO_GREMLIN_TAUNT_4'],
};

export const GREMLIN_SKIT_TO_VOICE_CUE_V8: Readonly<
  Record<GremlinSkitIdV8, StudioVoiceCueIdV8>
> = {
  REEL_MOWER: 'VO_GREMLIN_REEL_MOWER',
  CANISTER_VAC: 'VO_GREMLIN_CANISTER_VAC',
  JACKHAMMER_SANDBAG: 'VO_GREMLIN_JACKHAMMER',
  TNT_PLUNGER: 'VO_GREMLIN_TNT_PLUNGER',
  CABLE_SHEARS: 'VO_GREMLIN_CABLE_SHEARS',
  WATUSI_BROOM: 'VO_GREMLIN_WATUSI_BROOM',
  CATWALK_MAGNET: 'VO_GREMLIN_CATWALK_MAGNET',
  TIN_UFO: 'VO_GREMLIN_TIN_UFO',
};

/** Core showcase cues warmed asynchronously in the background (never blocking boot). */
export const CORE_WARM_PRELOAD_VOICE_CUES_V8: readonly StudioVoiceCueIdV8[] = [
  'VO_COLD_OPEN_WELCOME',
  'VO_SHOW_CURTAIN_RAISER',
  'VO_DAILY_BROADCAST_OPEN',
  'VO_COUCH_2P_OPEN',
  'VO_TWIST_SECRET_SQUARE',
  'VO_TWIST_BIG_WHEEL_SPIN',
  'VO_TWIST_BIG_WHEEL_JACKPOT',
  'VO_TWIST_LIGHT_BOARD_OPEN',
  'VO_TWIST_MYSTERY_CURTAIN',
  'VO_ACT2_DOUBLE_STAKES',
  'VO_ACT3_FINAL_WAGER_INTRO',
  'VO_FINAL_WAGER_LOCKED',
  'VO_FINAL_REVEAL_SHOWDOWN',
];

const HOST_RIGHT_QUIPS_V8: readonly StudioVoiceCueIdV8[] = STUDIO_VOICE_POOLS_V8.POOL_HOST_RIGHT;

const HOST_WRONG_QUIPS_V8: readonly StudioVoiceCueIdV8[] = STUDIO_VOICE_POOLS_V8.POOL_HOST_WRONG;

const MYTH_KLAXON_CALLS_V8: readonly StudioVoiceCueIdV8[] = STUDIO_VOICE_POOLS_V8.POOL_MYTH_KLAXON;

const QUICK_DRAW_CALLS_V8: readonly StudioVoiceCueIdV8[] = [
  'VO_QUICK_DRAW_1',
  'VO_QUICK_DRAW_2',
];

function resolveVoiceAssetUrl(mp3Path: string): string {
  const cleanRel = mp3Path.replace(/^\.\/+/, '').replace(/^\/+/, '');
  try {
    const metaEnv = (import.meta as unknown as { env?: { BASE_URL?: string } })?.env;
    if (metaEnv?.BASE_URL) {
      const base = metaEnv.BASE_URL.endsWith('/') ? metaEnv.BASE_URL : `${metaEnv.BASE_URL}/`;
      if (base !== './') {
        return `${base}${cleanRel}`;
      }
    }
  } catch {
    // Fallback below
  }
  if (typeof document !== 'undefined' && document.baseURI) {
    try {
      return new URL(`./${cleanRel}`, document.baseURI).toString();
    } catch {
      // Fallback below
    }
  }
  return `./${cleanRel}`;
}

/**
 * Strips tiny LAME MP3 encoder front padding (< ~25ms below -56 dBFS) while
 * keeping 4ms onset pre-roll and 100% of the mastered 145ms trailing consonant pad.
 */
function trimEncoderFrontDelay(ctx: AudioContext, decoded: AudioBuffer): AudioBuffer {
  const numCh = decoded.numberOfChannels;
  const len = decoded.length;
  const sr = decoded.sampleRate;
  if (len <= 128 || numCh <= 0) return decoded;

  const maxScan = Math.min(len, Math.round(sr * 0.045));
  const thresh = Math.pow(10, -56 / 20);
  let onset = 0;
  let found = false;
  for (let i = 0; i < maxScan; i++) {
    for (let c = 0; c < numCh; c++) {
      const v = decoded.getChannelData(c)[i];
      if (v >= thresh || v <= -thresh) {
        onset = i;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  const preRoll = Math.round(sr * 0.004);
  const startIdx = found ? Math.max(0, onset - preRoll) : 0;
  if (startIdx <= 16) return decoded;

  const outLen = Math.max(64, len - startIdx);
  const out = ctx.createBuffer(numCh, outLen, sr);
  for (let c = 0; c < numCh; c++) {
    out.getChannelData(c).set(decoded.getChannelData(c).subarray(startIdx, startIdx + outLen));
  }
  return out;
}

function volumeToLinearGain(vol0to100: number): number {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(vol0to100) ? vol0to100 : 0));
  if (clamped <= 0) return 0;
  return Math.pow(clamped / 100, 1.35);
}

interface ActiveVoicePlayback {
  readonly token: number;
  readonly cueId: StudioVoiceCueIdV8;
  readonly speaker: VoiceSpeakerIdV8;
  readonly priority: VoicePriorityTierV8;
  readonly source: AudioBufferSourceNode;
  readonly gainNode: GainNode;
  readonly startTime: number;
  readonly endTime: number;
  fadeDoneTime: number;
}

interface PendingVoicePlayback {
  readonly token: number;
  readonly cueId: StudioVoiceCueIdV8;
  readonly priority: VoicePriorityTierV8;
}

export interface StudioVoiceBankOptionsV8 {
  readonly ctx?: AudioContext | null;
  readonly destination?: AudioNode | null;
  readonly initialVolume?: number; // 0..100 (default 88)
  readonly duckDb?: number; // default -5.0 dB
  readonly onDuckMusic?: (durationSec: number, duckDb: number) => void;
  readonly onCueStart?: (spec: StudioVoiceCueSpecV8, durationSec: number) => void;
}

export interface PlayVoiceCueOptionsV8 {
  readonly ctx?: AudioContext | null;
  readonly destination?: AudioNode | null;
}

export class StudioVoiceBankV8 {
  private ctx: AudioContext | null = null;
  private destination: AudioNode | null = null;
  private voiceBusGain: GainNode | null = null;

  private voiceVolume: number = DEFAULT_VOICE_VOLUME_V8;
  private duckDb: number = DEFAULT_VOICE_DUCK_DB_V8;

  public onDuckMusic?: (durationSec: number, duckDb: number) => void;
  public onCueStart?: (spec: StudioVoiceCueSpecV8, durationSec: number) => void;

  private readonly bufferCache = new Map<StudioVoiceCueIdV8, AudioBuffer>();
  private readonly inflightDecodes = new Map<StudioVoiceCueIdV8, Promise<AudioBuffer | null>>();

  private activeVoice: ActiveVoicePlayback | null = null;
  private pendingVoice: PendingVoicePlayback | null = null;
  private arbiterSeq = 0;

  private warmPreloadStarted = false;
  private hostRightCursor = 0;
  private hostWrongCursor = 0;
  private mythKlaxonCursor = 0;
  private quickDrawCursor = 0;

  constructor();
  constructor(options: StudioVoiceBankOptionsV8);
  constructor(
    ctx: AudioContext | null,
    destination?: AudioNode | null,
    options?: Omit<StudioVoiceBankOptionsV8, 'ctx' | 'destination'>,
  );
  constructor(
    arg0?: AudioContext | StudioVoiceBankOptionsV8 | null,
    arg1?: AudioNode | null,
    arg2?: Omit<StudioVoiceBankOptionsV8, 'ctx' | 'destination'>,
  ) {
    if (arg0 && typeof (arg0 as AudioContext).createGain === 'function') {
      const opts = arg2 ?? {};
      if (typeof opts.initialVolume === 'number') {
        this.voiceVolume = Math.max(0, Math.min(100, opts.initialVolume));
      }
      if (typeof opts.duckDb === 'number') {
        this.duckDb = opts.duckDb;
      }
      this.onDuckMusic = opts.onDuckMusic;
      this.onCueStart = opts.onCueStart;
      this.attachAudioGraph(arg0 as AudioContext, arg1 ?? null);
    } else if (arg0 && typeof arg0 === 'object') {
      const opts = arg0 as StudioVoiceBankOptionsV8;
      if (typeof opts.initialVolume === 'number') {
        this.voiceVolume = Math.max(0, Math.min(100, opts.initialVolume));
      }
      if (typeof opts.duckDb === 'number') {
        this.duckDb = opts.duckDb;
      }
      this.onDuckMusic = opts.onDuckMusic;
      this.onCueStart = opts.onCueStart;
      if (opts.ctx) {
        this.attachAudioGraph(opts.ctx, opts.destination ?? null);
      }
    }
  }

  /**
   * Connects (or re-connects) the dedicated Studio Voice Bus into an `AudioContext`
   * and target `AudioNode` (e.g. `masterBus` or `sfxBus`).
   */
  public attachAudioGraph(ctx: AudioContext, destination?: AudioNode | null): void {
    const dest = destination ?? ctx.destination;
    if (this.ctx === ctx && this.destination === dest && this.voiceBusGain) {
      return;
    }

    if (this.voiceBusGain) {
      try {
        this.voiceBusGain.disconnect();
      } catch {
        // Ignore stale graph disconnect errors
      }
      this.voiceBusGain = null;
    }

    this.ctx = ctx;
    this.destination = dest;

    const bus = ctx.createGain();
    bus.gain.setValueAtTime(volumeToLinearGain(this.voiceVolume), ctx.currentTime);
    bus.connect(dest);
    this.voiceBusGain = bus;
  }

  /**
   * Sets voice bus volume on `[0..100]` (default `88`).
   * Setting `0` mutes immediately and skips future voice playback cleanly.
   */
  public setVoiceVolume(vol0to100: number): void {
    const clamped = Math.max(0, Math.min(100, Number.isFinite(vol0to100) ? vol0to100 : 0));
    this.voiceVolume = clamped;

    if (clamped <= 0) {
      this.stopCurrentVoice(0.03);
    }

    if (this.ctx && this.voiceBusGain) {
      const now = this.ctx.currentTime;
      const target = volumeToLinearGain(clamped);
      this.voiceBusGain.gain.cancelScheduledValues(now);
      this.voiceBusGain.gain.setTargetAtTime(target, now, 0.012);
    }
  }

  public getVoiceVolume(): number {
    return this.voiceVolume;
  }

  public isMuted(): boolean {
    return this.voiceVolume <= 0;
  }

  public getCueSpec(cueId: StudioVoiceCueIdV8): StudioVoiceCueSpecV8 {
    return STUDIO_VOICE_CUE_CATALOG_V8[cueId];
  }

  public getCachedCueCount(): number {
    return this.bufferCache.size;
  }

  public isSpeaking(): boolean {
    if (!this.ctx || !this.activeVoice) return false;
    return this.ctx.currentTime < this.activeVoice.endTime - 0.01;
  }

  public getActiveCueId(): StudioVoiceCueIdV8 | null {
    if (!this.isSpeaking() || !this.activeVoice) return null;
    return this.activeVoice.cueId;
  }

  /**
   * Optional non-blocking background preload of signature Cold Open, Twist & Finale cues.
   * Never blocks app boot or throws on offline/headless environments.
   */
  public warmPreloadCoreCues(
    ctx?: AudioContext | null,
    cues: readonly StudioVoiceCueIdV8[] = CORE_WARM_PRELOAD_VOICE_CUES_V8,
  ): Promise<void> {
    const targetCtx = ctx ?? this.ctx;
    if (!targetCtx) return Promise.resolve();
    if (!this.ctx) {
      this.attachAudioGraph(targetCtx, this.destination);
    }
    if (this.warmPreloadStarted && cues === CORE_WARM_PRELOAD_VOICE_CUES_V8) {
      return Promise.resolve();
    }
    if (cues === CORE_WARM_PRELOAD_VOICE_CUES_V8) {
      this.warmPreloadStarted = true;
    }

    let cursor = 0;
    const concurrency = 4;
    const workers: Promise<void>[] = [];
    for (let w = 0; w < Math.min(concurrency, cues.length); w++) {
      workers.push(
        (async () => {
          while (cursor < cues.length) {
            const cueId = cues[cursor++];
            await this.loadCueBuffer(targetCtx, cueId);
          }
        })(),
      );
    }
    return Promise.all(workers).then(() => undefined);
  }

  /**
   * Smoothly hushes any currently playing or in-flight voice cue over `fadeSec` (default `45ms`).
   */
  public stopCurrentVoice(fadeSec: number = DEFAULT_CROSS_HUSH_SEC): void {
    this.arbiterSeq += 1;
    this.pendingVoice = null;
    this.fadeOutActiveSource(fadeSec);
  }

  /**
   * Plays a Studio 6A voice cue through the Single-Channel Priority Arbiter (`3 > 2 > 1`):
   *  - Higher or equal priority (`newPriority >= activePriority`) smoothly ramps out the
   *    current cue in `45ms` (`linearRampToValueAtTime(0.0001, now + 0.045)`) before speaking.
   *  - Strictly lower priority (`newPriority < activePriority`) while a higher-tier cue is
   *    speaking or loading is cleanly dropped (never queued).
   */
  public async playCue(
    cueId: StudioVoiceCueIdV8,
    opts?: PlayVoiceCueOptionsV8,
  ): Promise<boolean> {
    const spec = STUDIO_VOICE_CUE_CATALOG_V8[cueId];
    if (!spec || this.voiceVolume <= 0) {
      return false;
    }

    const ctx = opts?.ctx ?? this.ctx;
    if (!ctx) {
      return false;
    }
    if (this.ctx !== ctx || (opts?.destination && this.destination !== opts.destination)) {
      this.attachAudioGraph(ctx, opts?.destination ?? this.destination);
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {
        // Non-blocking unlock attempt
      });
    }

    // Reap naturally finished voice state
    if (this.activeVoice && ctx.currentTime >= this.activeVoice.endTime - 0.008) {
      this.activeVoice = null;
    }

    const activePriority = this.activeVoice?.priority ?? 0;
    const pendingPriority = this.pendingVoice?.priority ?? 0;
    const blockingPriority = Math.max(activePriority, pendingPriority);

    // Strictly lower-priority quip arriving during higher-priority bumper/twist/gremlin -> skip cleanly!
    if (blockingPriority > 0 && spec.priority < blockingPriority) {
      return false;
    }

    const token = ++this.arbiterSeq;
    this.pendingVoice = { token, cueId, priority: spec.priority };

    // Smooth 45ms hush of any active line when superseded by equal-or-higher priority
    if (this.activeVoice) {
      this.fadeOutActiveSource(DEFAULT_CROSS_HUSH_SEC);
    }

    let buffer = this.bufferCache.get(cueId) ?? null;
    if (!buffer) {
      buffer = await this.loadCueBuffer(ctx, cueId);
    }

    // Abort if superseded or stopped while awaiting lazy MP3 decode
    if (!buffer || this.pendingVoice?.token !== token || this.voiceVolume <= 0) {
      return false;
    }
    this.pendingVoice = null;

    const now = ctx.currentTime;
    const earliestCleanStart =
      this.activeVoice && now < this.activeVoice.fadeDoneTime
        ? this.activeVoice.fadeDoneTime
        : now;
    const startAt = Math.max(now, earliestCleanStart);
    const endTime = startAt + buffer.duration;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const cueGain = ctx.createGain();
    cueGain.gain.setValueAtTime(0.0001, startAt);
    cueGain.gain.linearRampToValueAtTime(1.0, startAt + 0.008);

    source.connect(cueGain);
    cueGain.connect(this.voiceBusGain ?? ctx.destination);

    const record: ActiveVoicePlayback = {
      token,
      cueId,
      speaker: spec.speaker,
      priority: spec.priority,
      source,
      gainNode: cueGain,
      startTime: startAt,
      endTime,
      fadeDoneTime: endTime,
    };
    this.activeVoice = record;

    source.onended = () => {
      if (this.activeVoice?.token === token) {
        this.activeVoice = null;
      }
      try {
        source.disconnect();
        cueGain.disconnect();
      } catch {
        // Ignore post-playback disconnect
      }
    };

    source.start(startAt);

    const totalDuckSec = Math.max(0.25, endTime - now + 0.08);
    this.onDuckMusic?.(totalDuckSec, this.duckDb);
    this.onCueStart?.(spec, buffer.duration);
    return true;
  }

  /** Plays the matching raspy Hanna-Barbera Studio Gremlin gag line for any of the 8 skits. */
  public playGremlinSkitVoice(
    skitId: GremlinSkitIdV8,
    opts?: PlayVoiceCueOptionsV8,
  ): Promise<boolean> {
    const cueId = GREMLIN_SKIT_TO_VOICE_CUE_V8[skitId];
    return this.playCue(cueId, opts);
  }

  /** Non-repeating cycle across Grant Bellamy's 4 upbeat correct-answer quips (Tier 1). */
  
  private readonly poolDecks = new Map<StudioVoicePoolIdV8, StudioVoiceCueIdV8[]>();
  private recentCueRing: StudioVoiceCueIdV8[] = [];
  private lastPoolPlayedAtMs = 0;

  private loadRecentRingOnce(): void {
    if (this.recentCueRing.length > 0 || typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('ws8_voice_recency_ring_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.recentCueRing = parsed
            .filter((x): x is StudioVoiceCueIdV8 => typeof x === 'string' && x in STUDIO_VOICE_CUE_CATALOG_V8)
            .slice(-30);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private pushRecentCue(cueId: StudioVoiceCueIdV8): void {
    this.recentCueRing = [...this.recentCueRing.filter((c) => c !== cueId), cueId].slice(-30);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('ws8_voice_recency_ring_v1', JSON.stringify(this.recentCueRing));
      } catch {
        // Ignore quota errors
      }
    }
  }

  /**
   * Draws the next non-repeating take from any of the 28 `STUDIO_VOICE_POOLS_V8`
   * using a Fisher-Yates shuffled deck + 30-cue global recency guard!
   */
  public pickNextCueFromPool(poolId: StudioVoicePoolIdV8): StudioVoiceCueIdV8 {
    this.loadRecentRingOnce();
    const pool = STUDIO_VOICE_POOLS_V8[poolId];
    if (!pool || pool.length === 0) return 'VO_HOST_RIGHT_1';
    if (pool.length === 1) return pool[0];

    let deck = this.poolDecks.get(poolId);
    if (!deck || deck.length === 0) {
      deck = [...pool];
      for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = deck[i];
        deck[i] = deck[j];
        deck[j] = t;
      }
      const lastGlobal = this.recentCueRing[this.recentCueRing.length - 1];
      const recentSet = new Set(this.recentCueRing.slice(-Math.min(18, pool.length - 1)));
      const nonRecentIdx = deck.findIndex((c) => !recentSet.has(c) && c !== lastGlobal);
      if (nonRecentIdx > 0) {
        const [picked] = deck.splice(nonRecentIdx, 1);
        deck.unshift(picked);
      } else if (deck[0] === lastGlobal && deck.length > 1) {
        const swap = deck.pop()!;
        deck.unshift(swap);
      }
      this.poolDecks.set(poolId, deck);
    }

    const nextCue = deck.shift()!;
    this.pushRecentCue(nextCue);
    return nextCue;
  }

  /**
   * Plays a varied take from a multi-take pool with optional cadence cooldown
   * so voices feel lively, fresh, and never repetitive!
   */
  public playPoolVoice(
    poolId: StudioVoicePoolIdV8,
    opts?: PlayVoiceCueOptionsV8 & { readonly minCooldownMs?: number },
  ): Promise<boolean> {
    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (opts?.minCooldownMs && nowMs - this.lastPoolPlayedAtMs < opts.minCooldownMs) {
      return Promise.resolve(false);
    }
    const cueId = this.pickNextCueFromPool(poolId);
    this.lastPoolPlayedAtMs = nowMs;
    return this.playCue(cueId, opts);
  }

  /** Non-repeating Fisher-Yates shuffle across all 12 Grant Bellamy correct-answer praises! */
  public playHostRightQuip(opts?: PlayVoiceCueOptionsV8): Promise<boolean> {
    return this.playPoolVoice('POOL_HOST_RIGHT', opts);
  }

  /** Non-repeating cycle across Grant Bellamy's 4 sympathetic wrong-answer quips (Tier 1). */
  public playHostWrongQuip(opts?: PlayVoiceCueOptionsV8): Promise<boolean> {
    return this.playPoolVoice('POOL_HOST_WRONG', opts);
  }

  /** Alternates between Grant Bellamy's Popular-Myth Klaxon callouts (Tier 2). */
  public playMythKlaxonCall(opts?: PlayVoiceCueOptionsV8): Promise<boolean> {
    return this.playPoolVoice('POOL_MYTH_KLAXON', opts);
  }

  /** Alternates between Grant Bellamy's Quick-Draw buzzer callouts (Tier 2). */
  public playQuickDrawCall(opts?: PlayVoiceCueOptionsV8): Promise<boolean> {
    const cueId = QUICK_DRAW_CALLS_V8[this.quickDrawCursor % QUICK_DRAW_CALLS_V8.length];
    this.quickDrawCursor = (this.quickDrawCursor + 1) % QUICK_DRAW_CALLS_V8.length;
    return this.playCue(cueId, opts);
  }

  private fadeOutActiveSource(fadeSec: number): void {
    const active = this.activeVoice;
    const ctx = this.ctx;
    if (!active || !ctx) {
      this.activeVoice = null;
      return;
    }

    const now = ctx.currentTime;
    if (now >= active.endTime - 0.005) {
      this.activeVoice = null;
      return;
    }

    const safeFade = Math.max(0.012, Math.min(0.25, fadeSec));
    const stopAt = Math.min(active.endTime, now + safeFade);
    active.fadeDoneTime = stopAt;

    try {
      const g = active.gainNode.gain;
      const currentVal = Math.max(0.0001, g.value);
      g.cancelScheduledValues(now);
      g.setValueAtTime(currentVal, now);
      g.linearRampToValueAtTime(0.0001, stopAt);
      active.source.stop(stopAt + 0.003);
    } catch {
      // Source may have already stopped
    }
  }

  private loadCueBuffer(
    ctx: AudioContext,
    cueId: StudioVoiceCueIdV8,
  ): Promise<AudioBuffer | null> {
    const cached = this.bufferCache.get(cueId);
    if (cached) return Promise.resolve(cached);

    const existing = this.inflightDecodes.get(cueId);
    if (existing) return existing;

    const spec = STUDIO_VOICE_CUE_CATALOG_V8[cueId];
    if (!spec || typeof fetch !== 'function') {
      return Promise.resolve(null);
    }

    const job = (async (): Promise<AudioBuffer | null> => {
      try {
        const res = await fetch(resolveVoiceAssetUrl(spec.mp3Path));
        if (!res.ok) return null;
        const rawBytes = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(rawBytes);
        const trimmed = trimEncoderFrontDelay(ctx, decoded);
        this.bufferCache.set(cueId, trimmed);
        return trimmed;
      } catch {
        return null;
      } finally {
        this.inflightDecodes.delete(cueId);
      }
    })();

    this.inflightDecodes.set(cueId, job);
    return job;
  }
}
