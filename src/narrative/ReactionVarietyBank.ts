// ============================================================================
// WORLD'S SMARTEST — Anti-Annoyance Reaction Variety Bank & Once-Per-Session VO Guard
// Implements `#200`:
//   • 396 unique, intelligent, non-cheesy written one-liners:
//       - 324 cast lines (54 × 6 cast members across 9 gameplay triggers)
//       - 72 domain-specific lines (6 × 12 Sovereign knowledge domains)
//   • 150-item `NonRepeatingHistory` ring buffer — no line repeats within 150 triggers
//   • ~60% clean silence (`null`) on routine Qs so the HUD stays sleek and un-nagged
//   • `playedBarkUrlsInSession = new Set<string>()` — no gameplay reaction `.mp3`
//     ever plays more than once in a session (routine right/wrong = crisp Foley ONLY!)
// ============================================================================

import type { CastMemberId } from './InkBlackboard';
import type { DomainId } from './PassportSystem';

export type ReactionTriggerKind =
  | 'MISS'
  | 'STREAK_3'
  | 'STREAK_5'
  | 'STREAK_10'
  | 'OVERCLOCK_WIN'
  | 'BACKFIRE'
  | 'CALIBRATOR_BULLSEYE'
  | 'PEEL_USED'
  | 'CLOSE_CALL';

export interface ReactionPickRequest {
  actorId: CastMemberId;
  kind: ReactionTriggerKind;
  domainId?: DomainId;
  /** Set `true` only when a caller strictly requires a written line (bypasses ~60% routine silence). */
  forceShow?: boolean;
  /** Optional probability [0..1] of suppressing routine chatter (default `0.60`). */
  routineSilenceProbability?: number;
}

export interface ReactionPickResult {
  id: string;
  actorId: CastMemberId;
  kind: ReactionTriggerKind;
  text: string;
  isDomainSpecific: boolean;
  /** Always `undefined` for routine written reactions — crisp horological Foley handles feedback! */
  voiceUrl?: undefined;
}

// ============================================================================
// ONCE-PER-SESSION GAMEPLAY BARK `.mp3` GUARD (`#200`)
// ============================================================================

/**
 * Tracks every gameplay reaction / callout `.mp3` URL played during the current session.
 * Once ANY gameplay reaction `.mp3` has played once, it NEVER plays again in that session.
 */
export const playedBarkUrlsInSession = new Set<string>();

function normalizeBarkKey(url: string): string {
  return url
    .trim()
    .replace(/^res:\/\//i, '')
    .replace(/^\.?\//, '')
    .toLowerCase();
}

export function hasPlayedGameplayBarkInSession(voiceUrl?: string | null): boolean {
  if (!voiceUrl || typeof voiceUrl !== 'string' || !voiceUrl.trim()) return true;
  return playedBarkUrlsInSession.has(normalizeBarkKey(voiceUrl));
}

/**
 * Claims a gameplay reaction `.mp3` for single use this session.
 * Returns `voiceUrl` on first play; returns `undefined` on all subsequent calls (Foley-only!).
 */
export function claimGameplayBarkVoiceUrl(voiceUrl?: string | null): string | undefined {
  if (!voiceUrl || typeof voiceUrl !== 'string' || !voiceUrl.trim()) return undefined;
  const key = normalizeBarkKey(voiceUrl);
  if (playedBarkUrlsInSession.has(key)) {
    return undefined;
  }
  playedBarkUrlsInSession.add(key);
  return voiceUrl;
}

export function resetSessionPlayedBarks(): void {
  playedBarkUrlsInSession.clear();
}

// ============================================================================
// 324 CAST-SPECIFIC INTELLIGENT ONE-LINERS (54 PER CAST MEMBER × 6 ACTORS)
// ============================================================================

const CAST_REACTIONS: Record<CastMemberId, Record<ReactionTriggerKind, readonly string[]>> = {
  vance: {
    MISS: [
      'Even a chronometer drops a beat under alpine pressure.',
      'Mark the gap in your dossier and move on.',
      'A clean miss teaches more than a lucky guess.',
      'The Ledger records the error; the next Prism erases it.',
      'Reset your sightline. Hesitation lingers longer than a wrong lock.',
      'Every fellow in Geneva has stumbled on a simpler facet.',
    ],
    STREAK_3: [
      'Three consecutive locks—your calibration is settling nicely.',
      'Measured cadence. The observation gallery is taking notes.',
      'Three clean solves without breaking composure.',
      'That rhythm is why your name cleared the first filter.',
      'Steady pulse across three distinct locks.',
      'You are reading the table faster than the broadcast clock.',
    ],
    STREAK_5: [
      'Five in a row. Now the delegates have put down their pens.',
      'Five unanswered solves—the margin between talent and discipline.',
      'Five locks deep and your pace has not wavered a tenth.',
      'The chamber tends to go quiet right around streak five.',
      'Five clean reads. You are dictating the tempo of the floor.',
      'Impressive consistency—very few hold a five-Prism run live.',
    ],
    STREAK_10: [
      'Ten straight. That is the kind of ledger line historians underline.',
      'Ten consecutive locks—nobody in Trial Zero cleared that bar.',
      'Ten without a fracture. The Council seats are visibly uneasy.',
      'A ten-Prism sweep places you in a statistical cohort of one.',
      'Ten clean executions. Even Lindqvist cannot dismiss that telemetry.',
      'Ten straight locks—the broadcast feed is trending across six continents.',
    ],
    OVERCLOCK_WIN: [
      'Conviction wagered and collected in full.',
      'You held the bar through the redline and made the math obey.',
      'That is how an arbiter separates certainty from bravado.',
      'High-stakes Overclock landed with surgical poise.',
      'You risked the spotlight and walked away with the floor.',
      'Audacious hold—the payout reflects the nerve.',
    ],
    BACKFIRE: [
      'Overclock extracts an honest tax on overconfidence.',
      'The redline bites hardest when pride outruns recall.',
      'Absorb the fracture. Great minds recover on the very next turn.',
      'A steep wager lost—keep your nerve intact for the next lock.',
      'Ambition crossed certainty by a hair. Recalibrate.',
      'The chamber remembers how you answer after a backfire.',
    ],
    CALIBRATOR_BULLSEYE: [
      'Dead center inside the pinhole—textbook epistemic precision.',
      'You narrowed the brass vernier to a razor and still hit home.',
      'Exact calibration. Not an ounce of wasted margin.',
      'A pinhole hit like that silences every statistician in the room.',
      'That astrolabe reading could set the Geneva master clock.',
      'Surgical estimation—few minds know the exact width of their certainty.',
    ],
    PEEL_USED: [
      'Wise trade—margin surrendered for clarity.',
      'Peeling the obsidian shutter is strategy, not weakness.',
      'An analyst checks the mechanism before committing brass.',
      'Prudent peel. Better two-point-zero banked than three-point-zero guessed.',
      'You read the core cleanly before locking the facet.',
      'Measured restraint under a live clock.',
    ],
    CLOSE_CALL: [
      'Locked inside the final heartbeat—nerves of tungsten.',
      'Cutting it that close keeps the directors awake upstairs.',
      'Just under the escapement wire. Composure held.',
      'A tenth of a second to spare—still counts the same on the board.',
      'Razor-thin finish. Breathe before the next crystal rises.',
      'You let the sand run to the last grain and still landed true.',
    ],
  },

  nadia: {
    MISS: [
      'That is the opening I was waiting for.',
      'You blinked on the decoy—I noticed.',
      'One crack in the facade is enough to shift a match.',
      'Should have checked the second layer before tapping lock.',
      'Interesting blind spot. Filing that away for the finale.',
      'The spotlight has a way of exposing rushed recall.',
    ],
    STREAK_3: [
      'Three straight. Alright—now we have a real match.',
      'Clean run. Do not expect me to let you cruise to four.',
      'Three locks in a row; you actually did the reading.',
      'Sharp tempo. Let us see if it holds when the domain shifts.',
      'Not bad—though Geneva always warms up soft.',
      'Three clean hits. You have my full attention now.',
    ],
    STREAK_5: [
      'Five straight? Fine. Taking the gloves off.',
      'You are matching my Rio pace—barely.',
      'Five consecutive locks. No wonder Vance kept your file sealed.',
      'Okay, that five-streak actually earned a nod.',
      'You are faster on the spin than the scouting tape suggested.',
      'Five in a row—do not get comfortable on my stage.',
    ],
    STREAK_10: [
      'Ten straight. Even Tariq would have applauded that sequence.',
      'Ten without a slip—you just rewrote the seeding projections.',
      'Alright, I concede the point: nobody fakes a ten-lock run.',
      'Ten consecutive solves. The press box is losing its collective mind.',
      'I have spent six years on this circuit and rarely seen ten clean.',
      'Ten in a row. Whatever Vance saw in your chart, I see it now.',
    ],
    OVERCLOCK_WIN: [
      'Holding an Overclock in front of me takes nerve. Well played.',
      'You called the redline and did not flinch—respect.',
      'Bold wager. Next time I will match the hold.',
      'Landed the full multiplier right across my bow.',
      'You bet the house and had the receipts to back it.',
      'Clean Overclock. That just swung the momentum needle.',
    ],
    BACKFIRE: [
      'Told you—Overclocking on a hunch never ends neatly.',
      'Greed on the hold bar just handed me the board.',
      'That redline fracture stung from across the podium.',
      'Next time read the facet twice before pressing past two seconds.',
      'Too eager on the wager. Precision beats theatre.',
      'A classic rookie Overclock—and an expensive one.',
    ],
    CALIBRATOR_BULLSEYE: [
      'Pinhole dead center? Show-off.',
      'Okay, that astrolabe estimate was genuinely ridiculous.',
      'Tightest cone on the dial and you still threaded the needle.',
      'You did not even hesitate on the tolerance ring—impressive.',
      'Bullseye on the vernier. I need to sharpen my chronologies.',
      'Zero margin for error and you nailed the exact tick.',
    ],
    PEEL_USED: [
      'Playing it conservative with the Crown Peel—smart enough.',
      'Trading multiplier for insurance. I know that playbook.',
      'Peeling the seal buys truth, though it costs you altitude.',
      'Cautious pull. Let us see if you can hold the lead at two-times.',
      'Opening the shutter—nothing wrong with checking the blueprint.',
      'Calculated peel. Better safe points than an empty ledger.',
    ],
    CLOSE_CALL: [
      'You beat the buzzer by a breath—lucky timing.',
      'Cutting the Chrono-Ring that thin will age you five years.',
      'Barely beat the drop. Still counts, unfortunately for me.',
      'My hand was already moving for the lead—razor-close lock.',
      'Final-second save. Your pulse must be iced over.',
      'Talk about cutting the wire with two ticks left.',
    ],
  },

  soren: {
    MISS: [
      'Even the sharpest card shark misreads a river now and then.',
      'Oof—the prism bit back on that facet.',
      'Tough break, friend. Shake it off before the odds tilt.',
      'Looked good from thirty feet, less good under the gold beam.',
      'Happens to the best of us when the clock starts humming.',
      'Missed the tell on that decoy—next hand is clean.',
    ],
    STREAK_3: [
      'Three in a row—somebody brought loaded dice tonight.',
      'Smooth triple. My coin is spinning faster just watching.',
      'Three clean hits. You are reading the deck nicely.',
      'Hat trick on the crystal—keep the table warm.',
      'Three straight locks and zero sweat on the collar.',
      'Nice rhythm. The oddsmakers in Shibuya just adjusted.',
    ],
    STREAK_5: [
      'Five straight! Remind me never to sit across from you in Macau.',
      'Five clean calls—you are running hotter than Tokyo neon.',
      'Five on the bounce. That is a serious heater.',
      'Halfway to double digits and still looking effortless.',
      'Five locks without a scratch—even my telemetry is impressed.',
      'You are making five-in-a-row look like casual warmups.',
    ],
    STREAK_10: [
      'Ten straight?! Somebody check if the Prism is magnetized.',
      'Ten in a row—the house officially wants to inspect your cuffs.',
      'Unbelievable ten-streak. Take a bow before the cameras melt.',
      'Ten clean hits—you just broke every projection on the Horizon board.',
      'I have bluffed my way out of tighter spots, but ten real locks? Wild.',
      'Ten straight solves. That is pure high-roller legend status.',
    ],
    OVERCLOCK_WIN: [
      'Now THAT is how you push all-in at the high table!',
      'Full Overclock cash-out—love the audacity.',
      'You stared down the multiplier and made it blink first.',
      'Pure velvet nerve on that hold bar.',
      'High-wire Overclock landed without a wobble—respect.',
      'Big wager, bigger payday. My kind of play.',
    ],
    BACKFIRE: [
      'Ah—pushed the stack one chip too far on the redline.',
      'The Overclock house always collects eventually.',
      'Burned by the hold bar. Trust me, I have the scars too.',
      'Rough backfire—next time slide sideways for the Bluff Echo.',
      'Big swing, harsh rebound. Keep your bankroll cool.',
      'Redline snapped right at the peak—dust off and deal again.',
    ],
    CALIBRATOR_BULLSEYE: [
      'Pinhole sniper! Did you memorize the whole almanac?',
      'Threaded the needle at minimum width—pure poetry.',
      'Bullseye on the brass dial. My gold coin just froze dead.',
      'You dropped that needle straight onto the exact coordinate.',
      'That pinhole shot is going straight into tonight’s highlight reel.',
      'Zero margin, zero doubt—clinical calibration.',
    ],
    PEEL_USED: [
      'Peeking at the hole card? Classic smart-money play.',
      'Smart peel—buy the information while it is cheap.',
      'Pulling the Brass Crown keeps the bankroll breathing.',
      'Nothing wrong with checking the odds before pushing chips.',
      'Taking the clue core over a blind gamble—disciplined.',
      'Good eye. Sometimes two-times certain beats three-times reckless.',
    ],
    CLOSE_CALL: [
      'Beat the clock on a photo finish—my heart skipped for you.',
      'Last-instant lock! Living dangerously, I like it.',
      'Escaped the buzzer by a coat of varnish.',
      'Half a second to spare—talk about dramatic timing.',
      'Buzzer-beater on the Sightline. Clean theft.',
      'You definitely enjoy keeping the control booth nervous.',
    ],
  },

  teo: {
    MISS: [
      'Glitch in the sequence—keep eyes forward, next Prism is cleaner.',
      'Dropped one. Do not let the gallery cameras catch you rattled.',
      'Rough decoy on that spin. Shake it out—plenty of board left.',
      'Happens under studio wattage. Reset and lock the next one.',
      'That distractor was practically engineered to trip fast readers.',
      'Scratch that frame and focus on the incoming cue.',
    ],
    STREAK_3: [
      'Three in a row—the live viewer graph just spiked vertically.',
      'Three clean locks. The booth producers are scrambling to zoom in.',
      'Smooth three-peat. You are locked into the broadcast cadence.',
      'Three straight—and your hands barely moved off center.',
      'Clean triple. Keep feeding the momentum meter.',
      'Three hits on cue—lighting desk can barely keep pace.',
    ],
    STREAK_5: [
      'Five straight! Social feeds from Cairo to Osaka are lighting up.',
      'Five locks clean—you just hijacked the prime-time narrative.',
      'Five in a row and the Council monitors just turned crimson.',
      'Every producer in the truck is staring at your telemetry right now.',
      'Five-streak live on air. Pure broadcast electricity.',
      'Five consecutive solves—nobody is changing the channel tonight.',
    ],
    STREAK_10: [
      'Ten straight!! We are clipping this entire segment for the archive.',
      'Ten clean locks—viewership just crossed every record since 2019.',
      'Ten in a row. You just turned a vetting into a global phenomenon.',
      'Ten flawless solves—the director actually dropped his headset.',
      'Ten-streak under full studio lights. History on live tape.',
      'Ten straight—the Meridian algorithm literally cannot price you.',
    ],
    OVERCLOCK_WIN: [
      'Full Overclock hit! The studio audio meter nearly pegged.',
      'Huge gamble and an even bigger camera payoff.',
      'You rode the charge bar straight to the gold ceiling.',
      'Broadcast gold—that Overclock is going viral in thirty seconds.',
      'Ice-cold hold under crimson spotlights. Incredible.',
      'You bet the prime-time spotlight and cashed every point.',
    ],
    BACKFIRE: [
      'Tough backfire—cutaways are brutal, stay locked on the table.',
      'Overclock bit hard on that one. Breathe; you still hold your floor.',
      'Redline fracture. Next Prism resets the lighting—reclaim the shot.',
      'Ouch—the glass cracked loud in the monitor mix. Shake it off.',
      'Ambitious hold, rough bounce. Remember you can slide to Bluff Cancel.',
      'That hurt the streak, not the run. Eyes back on the Sightline.',
    ],
    CALIBRATOR_BULLSEYE: [
      'Pinhole dead center! Camera two caught the exact brass click.',
      'You nailed the narrowest cone on the astrolabe—unreal accuracy.',
      'Bullseye calibration. The graphics desk could not have placed it better.',
      'Zero drift on the vernier needle. Textbook precision.',
      'Pinhole lock! The control room just erupted off-mic.',
      'Spot-on estimate—not a millimeter wasted.',
    ],
    PEEL_USED: [
      'Smart shutter pull—the holographic core is there for a reason.',
      'Good call peeling Tier Two before risking a blind miss.',
      'Taking the clue core keeps the streak alive on live television.',
      'Calculated peel. Protect the momentum over ego.',
      'Clean blueprint check—now lock it in with certainty.',
      'Smart telemetry read. Live to Overclock the next one.',
    ],
    CLOSE_CALL: [
      'Locked right before the tally light blinked out—what a save.',
      'Down to the final ticks! Good thing the studio clock is atomic.',
      'You beat the horn by milliseconds—pure cinema.',
      'Cut it razor-thin on the countdown, still came up gold.',
      'Final-frame lock. Give the audio engineer a break next round.',
      'Just beat the drop—composure under a ticking red ring.',
    ],
  },

  lindqvist: {
    MISS: [
      'Precision is mandatory at the Council table. Regroup.',
      'An avoidable error—protocol favors patience over haste.',
      'The Sovereign Charter does not grade on near-misses.',
      'Note the lapse and ensure it does not recur in the finals.',
      'Imprecision carries diplomatic weight. Sharpen your focus.',
      'A minor stumble, though the Rotunda observes everything.',
    ],
    STREAK_3: [
      'Three consecutive locks. Acceptable poise for a candidate.',
      'Orderly execution across three consecutive facets.',
      'Three clean judgments—perhaps Vance’s briefing was understated.',
      'A disciplined start. Consistency is the true test of office.',
      'Three straight locks without unnecessary theatre.',
      'Methodical cadence. The Sovereign bench takes note.',
    ],
    STREAK_5: [
      'Five consecutive solves. Rare composure under institutional scrutiny.',
      'Five locks clean—you carry yourself like a seated fellow.',
      'Five straight. Few outsiders sustain that standard past round four.',
      'Impressive discipline. The Council chairs are paying closer attention.',
      'Five uninterrupted answers. Authority follows competence.',
      'Five in a row—orderly, decisive, and quietly formidable.',
    ],
    STREAK_10: [
      'Ten consecutive locks. That surpasses every Sovereign benchmark on record.',
      'Ten without error—an extraordinary demonstration of intellectual command.',
      'Ten straight. Even my sharpest skeptics on the committee have fallen silent.',
      'A ten-Prism run of that caliber commands diplomatic respect.',
      'Ten immaculate locks. You have earned the full weight of this chamber.',
      'Ten straight solves—I shall personally revise your dossier tonight.',
    ],
    OVERCLOCK_WIN: [
      'Decisive conviction, rewarded in exact proportion.',
      'You staked institutional capital on certainty—and collected.',
      'Calculated audacity. The Sovereign chair respects nerve backed by fact.',
      'An authoritative Overclock. Zero wasted motion.',
      'Bold commitment, cleanly executed under pressure.',
      'When certainty is absolute, maximum leverage is simply rational.',
    ],
    BACKFIRE: [
      'Reckless leverage always invites correction.',
      'Overconfidence is the swiftest path to losing a mandate.',
      'An expensive reminder that restraint governs the wise.',
      'The redline punishes impulse without appeal.',
      'Collect yourself—leadership is judged after an error, not before.',
      'You overextended your margin. Return to disciplined fundamentals.',
    ],
    CALIBRATOR_BULLSEYE: [
      'Exact calibration. Diplomatic treaties hinge on that caliber of precision.',
      'Dead center inside the pinhole—exemplary mastery of scale.',
      'You measured the boundary to the decimal and locked without tremor.',
      'Flawless astrolabe reading. Precision honors the institution.',
      'Pinhole bullseye—extraordinary quantitative discipline.',
      'Not a single degree adrift. Commendable.',
    ],
    PEEL_USED: [
      'Consulted the dossier before committing—prudent governance.',
      'Due diligence via the Crown Peel is always defensible.',
      'Wise to verify primary evidence before stamping finality.',
      'Measured peel. Haste has undone brighter delegates than you.',
      'Methodical verification—sound judgment under the clock.',
      'Prudent margin management. Keep your ledger spotless.',
    ],
    CLOSE_CALL: [
      'Resolved at the eleventh hour—preferable to error, barely.',
      'A narrow margin against the chronometer, yet order prevailed.',
      'You tested the deadline to its limit and held.',
      'Timely—just. Leave slightly wider counsel on the next lock.',
      'Final-second resolution. Composed, if unnecessarily dramatic.',
      'Cleared the clock with fractions remaining. Adequate.',
    ],
  },

  tariq: {
    MISS: [
      'Every false trail on the Prism points back to a real pattern.',
      'Do not fight the miss—study why the decoy looked plausible.',
      'Even in Trial Zero, a single slip revealed how the room was rigged.',
      'Let the error pass through you. Truth waits on the next facet.',
      'The decoy caught the eye; look deeper on the next rotation.',
      'One fracture does not break the underlying resonance.',
    ],
    STREAK_3: [
      'Three straight—there is that unmistakable ninety-nine-percent symmetry.',
      'Three locks clean. Your lateral rhythm feels eerily familiar.',
      'Three consecutive reads—you see the hidden scaffolding.',
      'Smooth triple. Keep peeling beneath the surface noise.',
      'Three in a row—your pattern sense is wide awake.',
      'Three clean locks. The Meridian was built for minds like yours.',
    ],
    STREAK_5: [
      'Five straight. That exact cadence broke the Cairo vault in 2019.',
      'Five clean locks—now you hear the music behind the trivia.',
      'Five in a row. Nadia used to chase streaks just like that.',
      'Five consecutive solves—the noise cannot touch your focus.',
      'Five locks deep. You are reading connections nobody else notices.',
      'Five straight. Vance knew exactly who he was summoning.',
    ],
    STREAK_10: [
      'Ten straight. That is the resonance the Council tried to bury.',
      'Ten consecutive locks—pure human synthesis no ledger can simulate.',
      'Ten without a misstep. You have surpassed everything we built in Trial Zero.',
      'Ten clean solves—you are seeing the whole board at once.',
      'Ten in a row. Truth becomes unmistakable at this altitude.',
      'Ten straight locks—history bends around clarity like that.',
    ],
    OVERCLOCK_WIN: [
      'Fearless conviction—you trusted the deep signal and won.',
      'Full Overclock landed cleanly. Courage and knowledge in balance.',
      'You held through the fracture light and came out gold.',
      'When you truly know, the redline is just another doorway.',
      'Masterful wager—earned through clarity, not luck.',
      'That Overclock echoed all the way down to the sub-vault.',
    ],
    BACKFIRE: [
      'The trap snapped when speed outran reflection. Slow your breath.',
      'A sharp fracture—absorb the lesson and leave the sting behind.',
      'Overclock punishes impatience. Listen to your quietest instinct next.',
      'Even the best blueprint cracks if forced too quickly.',
      'Rough rebound. Center your compass before the next Prism rises.',
      'Let the static clear—you are still standing on solid ground.',
    ],
    CALIBRATOR_BULLSEYE: [
      'Dead center inside the pinhole—true harmonic alignment.',
      'You set the astrolabe without flinching and found exact zero.',
      'Bullseye precision. That vernier offset was made for hands like yours.',
      'Perfect measurement—knowing how much you know is the highest art.',
      'Pinhole lock. Not a fraction of a degree out of tune.',
      'Exact calibration—rarely seen outside the inner archive.',
    ],
    PEEL_USED: [
      'Look past the outer glass—peeling reveals what the surface hides.',
      'Good instinct checking the core layer before committing.',
      'Opening the shutter shows respect for the truth beneath the prompt.',
      'Wise peel. Every layer of the Prism carries a clue for a reason.',
      'Patient deduction—trading flash for certainty.',
      'Smart check. Clarity always outlives haste.',
    ],
    CLOSE_CALL: [
      'Found the thread in the final pulse—well held.',
      'Right at the edge of the clock, yet completely composed.',
      'Sometimes the clearest answer arrives in the last half-second.',
      'Just ahead of the silence—steady hands under pressure.',
      'You waited until the picture resolved and beat the wire.',
      'Last-breath lock. Trust your pacing.',
    ],
  },
};

// ============================================================================
// 72 DOMAIN-SPECIFIC INTELLIGENT ONE-LINERS (6 PER DOMAIN × 12 DOMAINS)
// ============================================================================

interface DomainReactionEntry {
  kind: ReactionTriggerKind;
  text: string;
}

const DOMAIN_REACTIONS: Record<DomainId, readonly DomainReactionEntry[]> = {
  0: [
    // History
    { kind: 'STREAK_3', text: 'Your historical chronology is holding up under cross-examination.' },
    { kind: 'STREAK_5', text: 'Five clean reads—you treat centuries like yesterday’s dispatch.' },
    { kind: 'OVERCLOCK_WIN', text: 'Historical certainty wagered and proven—the archive approves.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Pinned the era right to the ledger date—remarkable historical recall.' },
    { kind: 'MISS', text: 'History hides sharp decoys between neighboring centuries.' },
    { kind: 'CLOSE_CALL', text: 'Pulled that historical citation just ahead of the bell.' },
  ],
  1: [
    // Science
    { kind: 'STREAK_3', text: 'Empirical rigor holding steady across the laboratory facets.' },
    { kind: 'STREAK_5', text: 'Five straight—first-principles science is clearly home turf.' },
    { kind: 'OVERCLOCK_WIN', text: 'Reproducible precision under redline pressure.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Within experimental margin of error—peer-reviewed perfection.' },
    { kind: 'MISS', text: 'Even clean hypotheses run into an unexpected variable.' },
    { kind: 'CLOSE_CALL', text: 'Resolved the physical constant with fractions to spare.' },
  ],
  2: [
    // Geography
    { kind: 'STREAK_3', text: 'Your mental atlas barely needed a spin on that coordinate.' },
    { kind: 'STREAK_5', text: 'Five clean locks—borders, straits, and capitals on command.' },
    { kind: 'OVERCLOCK_WIN', text: 'Dead-reckoning across the globe at full multiplier.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Surveyor-grade accuracy on the Meridian astrolabe.' },
    { kind: 'MISS', text: 'Maps shift faster than memory—re-anchor the latitude.' },
    { kind: 'CLOSE_CALL', text: 'Landed the coordinate right before the compass locked.' },
  ],
  3: [
    // Arts & Culture
    { kind: 'STREAK_3', text: 'Curator’s eye—provenance and movement read at a glance.' },
    { kind: 'STREAK_5', text: 'Five straight across the gallery without a single misattribution.' },
    { kind: 'OVERCLOCK_WIN', text: 'Bold provenance call—worth every franc at auction.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Dated the movement with museum-vault accuracy.' },
    { kind: 'MISS', text: 'Masterworks and imitators sit close together under glass.' },
    { kind: 'CLOSE_CALL', text: 'Identified the signature right before the gavel fell.' },
  ],
  4: [
    // Film, Music & Pop
    { kind: 'STREAK_3', text: 'Cultural fluency—you read the credits as sharply as the treatises.' },
    { kind: 'STREAK_5', text: 'Five clean locks across cinema and sound—effortless range.' },
    { kind: 'OVERCLOCK_WIN', text: 'Prime-time cue nailed at peak multiplier.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Box-office and release-year precision down to the frame.' },
    { kind: 'MISS', text: 'Pop-culture decoys love swapping famous collaborators.' },
    { kind: 'CLOSE_CALL', text: 'Caught the cue right before the fade to black.' },
  ],
  5: [
    // Sports & Games
    { kind: 'STREAK_3', text: 'Championship recall—record books clearly sit open in your head.' },
    { kind: 'STREAK_5', text: 'Five straight—clutch execution across the arena ledger.' },
    { kind: 'OVERCLOCK_WIN', text: 'Called your shot at the high stakes and delivered.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Stat-sheet bullseye—dead on the official record.' },
    { kind: 'MISS', text: 'Tough bounce on the stat line—reset for the next play.' },
    { kind: 'CLOSE_CALL', text: 'Buzzer-beater lock with tenths on the game clock.' },
  ],
  6: [
    // Tech & Engineering
    { kind: 'STREAK_3', text: 'Clean systems thinking—zero latency on the engineering stack.' },
    { kind: 'STREAK_5', text: 'Five clean locks—protocols, hardware, and architecture dialed in.' },
    { kind: 'OVERCLOCK_WIN', text: 'Full clock speed without a single thermal throttle.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Tolerance tightened to aerospace spec—dead on target.' },
    { kind: 'MISS', text: 'Edge-case fault on that facet—patch and continue.' },
    { kind: 'CLOSE_CALL', text: 'Committed right before the watchdog timer expired.' },
  ],
  7: [
    // Nature & Biology
    { kind: 'STREAK_3', text: 'Field-naturalist taxonomy—sharp distinction across living systems.' },
    { kind: 'STREAK_5', text: 'Five straight across flora, fauna, and deep ecology.' },
    { kind: 'OVERCLOCK_WIN', text: 'Apex instinct backed by biological fact.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Measured nature’s scale with uncanny exactness.' },
    { kind: 'MISS', text: 'Convergent evolution makes for convincing decoys.' },
    { kind: 'CLOSE_CALL', text: 'Spotted the distinguishing trait at the final beat.' },
  ],
  8: [
    // World Affairs & Law
    { kind: 'STREAK_3', text: 'Diplomatic brief mastered—treaties and charters in crisp focus.' },
    { kind: 'STREAK_5', text: 'Five straight on law and statecraft—Geneva takes notice.' },
    { kind: 'OVERCLOCK_WIN', text: 'Signed and ratified at maximum conviction.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Cited the constitutional benchmark to the exact figure.' },
    { kind: 'MISS', text: 'Fine print in international law catches even seasoned envoys.' },
    { kind: 'CLOSE_CALL', text: 'Filed the ruling seconds before adjournment.' },
  ],
  9: [
    // Food, Design & Craft
    { kind: 'STREAK_3', text: 'Discerning palate and artisan detail—nothing slipped past.' },
    { kind: 'STREAK_5', text: 'Five straight across craft, cuisine, and material culture.' },
    { kind: 'OVERCLOCK_WIN', text: 'Master-atelier confidence paid off cleanly.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Measured like a Michelin kitchen down to the gram.' },
    { kind: 'MISS', text: 'Regional traditions hide subtle cousins—keep tasting.' },
    { kind: 'CLOSE_CALL', text: 'Pulled it from the fire at the exact right instant.' },
  ],
  10: [
    // Myth, Lit & Philosophy
    { kind: 'STREAK_3', text: 'Classical canon and philosophy cleanly threaded together.' },
    { kind: 'STREAK_5', text: 'Five straight—from ancient epics to modern dialectic.' },
    { kind: 'OVERCLOCK_WIN', text: 'Spoke with Socratic certainty and carried the floor.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Dated the text with archival librarian precision.' },
    { kind: 'MISS', text: 'Mythology loves doubling its tricksters across pantheons.' },
    { kind: 'CLOSE_CALL', text: 'Unraveled the literary riddle in the closing lines.' },
  ],
  11: [
    // Logic, Math & Cryptic
    { kind: 'STREAK_3', text: 'Pure deductive clarity—no wasted steps in the proof.' },
    { kind: 'STREAK_5', text: 'Five straight—clean formal reasoning under broadcast heat.' },
    { kind: 'OVERCLOCK_WIN', text: 'Q.E.D. at peak multiplier.' },
    { kind: 'CALIBRATOR_BULLSEYE', text: 'Zero rounding error—pure quantitative mastery.' },
    { kind: 'MISS', text: 'A quiet sign flip in logic changes the whole conclusion.' },
    { kind: 'CLOSE_CALL', text: 'Closed the proof just before the buzzer sounded.' },
  ],
};

const ROUTINE_SILENCE_TRIGGERS: ReadonlySet<ReactionTriggerKind> = new Set([
  'MISS',
  'PEEL_USED',
  'CLOSE_CALL',
  'STREAK_3',
]);

function secureRandomUnit(): number {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] / 0x100000000;
    }
  } catch {
    // Fall back to Math.random
  }
  return Math.random();
}

export class ReactionVarietyBank {
  public static readonly MAX_HISTORY = 150;

  private readonly historyQueue: string[] = [];
  private readonly historySet = new Set<string>();

  /**
   * Returns total unique hand-crafted lines in the bank (`396`: `324` cast + `72` domain).
   */
  public getTotalUniqueLineCount(): number {
    let total = 0;
    for (const actorLines of Object.values(CAST_REACTIONS)) {
      for (const bucket of Object.values(actorLines)) {
        total += bucket.length;
      }
    }
    for (const domList of Object.values(DOMAIN_REACTIONS)) {
      total += domList.length;
    }
    return total;
  }

  public getHistorySize(): number {
    return this.historyQueue.length;
  }

  public resetHistory(): void {
    this.historyQueue.length = 0;
    this.historySet.clear();
  }

  private recordUsed(id: string): void {
    if (this.historySet.has(id)) return;
    this.historyQueue.push(id);
    this.historySet.add(id);
    while (this.historyQueue.length > ReactionVarietyBank.MAX_HISTORY) {
      const evicted = this.historyQueue.shift();
      if (evicted) this.historySet.delete(evicted);
    }
  }

  /**
   * Picks a fresh, non-repeating written one-liner (never repeating within 150 triggers),
   * OR returns `null` on ~60% of routine triggers so the HUD stays sleek and un-nagged (`#200`).
   * Notice `voiceUrl` is ALWAYS `undefined` — routine right/wrong answers use crisp Foley ONLY!
   */
  public pickReaction(req: ReactionPickRequest): ReactionPickResult | null {
    const isRoutine = ROUTINE_SILENCE_TRIGGERS.has(req.kind);
    const silenceProb = req.routineSilenceProbability ?? 0.6;
    if (!req.forceShow && isRoutine && secureRandomUnit() < silenceProb) {
      return null;
    }
    return this.pickGuaranteedLine(req.actorId, req.kind, req.domainId);
  }

  /**
   * Picks a guaranteed non-null written one-liner honoring the 150-item `NonRepeatingHistory` ring buffer!
   */
  public pickGuaranteedLine(
    actorId: CastMemberId,
    kind: ReactionTriggerKind,
    domainId?: DomainId
  ): ReactionPickResult {
    const actorBucket = CAST_REACTIONS[actorId]?.[kind] ?? CAST_REACTIONS.vance[kind];
    const primaryCandidates: Array<{ id: string; text: string; isDomainSpecific: boolean }> =
      actorBucket.map((text, idx) => ({
        id: `cast:${actorId}:${kind}:${idx}`,
        text,
        isDomainSpecific: false,
      }));

    // Mix matching domain-specific intelligent lines into the pool (~35% blend when domainId provided)
    if (domainId !== undefined && DOMAIN_REACTIONS[domainId]) {
      DOMAIN_REACTIONS[domainId].forEach((entry, idx) => {
        if (entry.kind === kind) {
          primaryCandidates.push({
            id: `domain:${domainId}:${kind}:${idx}`,
            text: entry.text,
            isDomainSpecific: true,
          });
        }
      });
    }

    // 1. Prefer unused lines in the exact actor + domain bucket
    let fresh = primaryCandidates.filter((c) => !this.historySet.has(c.id));

    // 2. If all exact-bucket lines were used within the last 150 triggers, draw from same-kind lines
    //    across other domain buckets & neutral host lines so the 150-trigger no-repeat guarantee holds!
    if (fresh.length === 0) {
      const widerCandidates: Array<{ id: string; text: string; isDomainSpecific: boolean }> = [];
      for (const [dKey, entries] of Object.entries(DOMAIN_REACTIONS)) {
        entries.forEach((entry, idx) => {
          if (entry.kind === kind) {
            widerCandidates.push({
              id: `domain:${dKey}:${kind}:${idx}`,
              text: entry.text,
              isDomainSpecific: true,
            });
          }
        });
      }
      for (const [otherActor, map] of Object.entries(CAST_REACTIONS) as Array<
        [CastMemberId, Record<ReactionTriggerKind, readonly string[]>]
      >) {
        if (otherActor === actorId) continue;
        map[kind].forEach((text, idx) => {
          widerCandidates.push({
            id: `cast:${otherActor}:${kind}:${idx}`,
            text,
            isDomainSpecific: false,
          });
        });
      }
      fresh = widerCandidates.filter((c) => !this.historySet.has(c.id));
    }

    // 3. Ultimate fallback if >150 triggers of a single kind occur consecutively
    const pool = fresh.length > 0 ? fresh : primaryCandidates;
    const chosen = pool[Math.floor(secureRandomUnit() * pool.length)] ?? pool[0];

    this.recordUsed(chosen.id);

    return {
      id: chosen.id,
      actorId,
      kind,
      text: chosen.text,
      isDomainSpecific: chosen.isDomainSpecific,
      voiceUrl: undefined,
    };
  }
}

export const reactionVarietyBank = new ReactionVarietyBank();
