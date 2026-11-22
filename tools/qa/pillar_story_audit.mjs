#!/usr/bin/env node
// ============================================================================
// WORLD'S SMARTEST — PILLAR-STORY-DIRECTOR Master Story, Dialogue, Choice,
// Voice, Continuity & State-Machine Audit (`tools/qa/pillar_story_audit.mjs`)
//
// Exhaustively simulates and audits:
//   1. Cold Boot -> Act 0 Summons -> Challenger Name <input> -> Geneva 4-Q Vetting
//      (Origin, Teo Mirror Leak, Manifesto, Calibrator, 4 Personas, Act I Flight Fork)
//   2. 3D Globe London-First & Tokyo-First Routes + Act II Diplomatic Cross-Clearance
//   3. All 8 Hubs / 96 Missions (40 Core Spine + 56 Side Dossiers) + All Choices/Effects
//   4. All 32 Multi-Node Backstage Interrogations (`narrative_wave2.json`) + 8 Hubs
//   5. Dynamic Singapore Betrayal (`sg_3` Nadia / Teo / Soren) & Act III Branches
//   6. `global_5` Finale -> All 4 Championship Endings + 7-City Chronicle + New Circuit+
//   7. Full Copy Hygiene (Zero Raw Templates, Zero Date Commas, Zero VO Speaker Mismatches,
//      Zero Timeline Contradictions, Zero Repetitive Sayings, Zero 404 Narrative Assets)
// ============================================================================

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const readText = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const existsPublic = (relPath) => {
  if (!relPath || typeof relPath !== 'string') return false;
  let clean = relPath.trim();
  if (clean.startsWith('res://')) clean = clean.slice('res://'.length);
  if (clean.startsWith('./')) clean = clean.slice(2);
  if (clean.startsWith('/')) clean = clean.slice(1);
  return fs.existsSync(path.join(ROOT, 'public', clean));
};

const campaign = readJson('public/data/campaign_20hr.json');
const wave2 = readJson('public/data/narrative_wave2.json');
const voWave2 = readJson('public/assets/voice/vo_wave2_manifest.json');

// Build unified 144-clip Voice Manifest Map
const voMap = new Map();
const addVo = (fileOrPath, speaker, text) => {
  if (!fileOrPath) return;
  const fname = fileOrPath.split('/').pop();
  if (!fname) return;
  const prev = voMap.get(fname);
  voMap.set(fname, {
    fname,
    speaker: speaker || prev?.speaker || '',
    text: text || prev?.text || '',
  });
};
const walkVoEntries = (val) => {
  if (!val) return;
  if (Array.isArray(val)) {
    for (const c of val) {
      if (c && typeof c === 'object') addVo(c.path || c.file || (c.id ? `${c.id}.mp3` : ''), c.speaker || c.actor, c.text);
    }
  } else if (typeof val === 'object') {
    for (const v of Object.values(val)) walkVoEntries(v);
  }
};
walkVoEntries(campaign.voice_manifest?.story_clips);
walkVoEntries(campaign.voice_manifest?.gameplay_barks);
walkVoEntries(campaign.voice_manifest?.cutscene_clips);
walkVoEntries(campaign.voice_manifest?.rival_reaction_clips);
walkVoEntries(campaign.voice_manifest?.ending_clips);
walkVoEntries(campaign.voice_manifest?.wave2_clips);
walkVoEntries(voWave2.clips);

const findings = [];
function addFinding(severity, owner, category, location, summary, fix = '') {
  findings.push({ severity, owner, category, location, summary, fix });
}

// ============================================================================
// STRING HYGIENE HELPERS
// ============================================================================
const KNOWN_INTERP_TOKENS = /^\{(challengerName|challenger|player_name|name)\}$/i;
const RAW_TEMPLATE_RE =
  /\{[a-zA-Z0-9_.-]+\}|\[\[[\s\S]*?\]\]|<YOUR NAME>|<CHALLENGER(?: NAME)?>|\bundefined\b|\bNaN\b/g;
const YEAR_COMMA_RE =
  /(?:(?<![\d,$+])([12]),(\d{3})(?='?s\b|\s*(?:CE|BCE|AD|BC)\b|\s*[–—-]\s*[12],?\d{3}\b)|([(\[])([12]),(\d{3})([)\]])|\b(in|of|from|since|circa|c\.|until|by|year|years|around|during|before|after|between|to|through|founded|established|born|died|vanished|missing|dated|trial|act|season|summer|winter|spring|autumn|fall|january|february|march|april|may|june|july|august|september|october|november|december)\s+([12]),(\d{3})(?!\d|\s*(?:pts|points|million|billion|thousand|dollars|usd|eur|chf|km|mi|ft|kg|lbs|people|minds|screens|witnesses|fans|viewers)\b))/gi;
const DOUBLE_PUNCT_RE = /(?<!\.)\.\.(?!\.)|\.\?|\?\?|,\.| ,| \?| !/g;
const DOUBLE_WORD_RE = /\b(the|a|an|in|of|to|for|is|was|your|my|his|her)\s+\1\b/gi;

function scanTextField(text, loc, owner, { isInterpolated = true, checkRawTokens = true } = {}) {
  if (typeof text !== 'string' || !text.trim()) return;

  if (checkRawTokens) {
    const matches = text.match(RAW_TEMPLATE_RE) || [];
    for (const m of matches) {
      if (m.startsWith('[[') || m === 'undefined' || m === 'NaN') {
        addFinding('P0', owner, 'RAW_PLACEHOLDER', loc, `Raw marker "${m}" in text: ${text.slice(0, 120)}`);
      } else if (!isInterpolated) {
        addFinding('P0', owner, 'UNINTERPOLATED_TOKEN', loc, `Token "${m}" in non-interpolated field: ${text.slice(0, 120)}`);
      } else if (!KNOWN_INTERP_TOKENS.test(m) && !/^<YOUR NAME>$|^<CHALLENGER NAME>$/i.test(m)) {
        addFinding('P0', owner, 'UNKNOWN_TOKEN', loc, `Unsupported template token "${m}": ${text.slice(0, 120)}`);
      }
    }
  }
  const yrM = text.match(YEAR_COMMA_RE);
  if (yrM) addFinding('P0', owner, 'DATE_COMMA', loc, `Year with comma (${yrM.join(', ')}): ${text.slice(0, 140)}`);

  const dpM = text.match(DOUBLE_PUNCT_RE);
  if (dpM) addFinding('P2', owner, 'PUNCTUATION', loc, `Awkward punctuation ${JSON.stringify(dpM)}: ${text.slice(0, 120)}`);

  const dwM = text.match(DOUBLE_WORD_RE);
  if (dwM) addFinding('P2', owner, 'TYPO', loc, `Repeated word ${JSON.stringify(dwM)}: ${text.slice(0, 120)}`);
}

// ============================================================================
// 1. STATIC & RUNTIME CODE INVARIANT CHECKS (TS NARRATIVE / CINEMA / UI LAYER)
// ============================================================================
const endingSrc = readText('src/cinema/EndingSequenceDirector.ts');
const controllerSrc = readText('src/ui/SovereignMasterController.ts');
const hudSrc = readText('src/ui/SovereignHUD.ts');
const campaignDirSrc = readText('src/narrative/CampaignCircuitDirector.ts');
const wave2DirSrc = readText('src/narrative/Wave2NarrativeDirector.ts');
const prologueDirSrc = readText('src/narrative/PrologueDirector.ts');
const blackboardSrc = readText('src/narrative/InkBlackboard.ts');
const passportSrc = readText('src/narrative/PassportSystem.ts');
const dossierSrc = readText('src/narrative/EvidenceDossier.ts');
const saveSlotSrc = readText('src/narrative/CampaignSaveSlotManager.ts');
const motionCinemaSrc = readText('src/cinema/MotionCinemaDirector.ts');

// CHECK 1A: EndingSequenceDirector reads `prologue_leak` (written by PrologueDirector & campaign_20hr.json)
if (!endingSrc.includes('branchFlags.prologue_leak')) {
  addFinding(
    'P0',
    '@cinema-actor-sleek-lead',
    'BROKEN_CHRONICLE_FLAG',
    'src/cinema/EndingSequenceDirector.ts:350',
    'buildPersonalizedJourneyChronicle() reads `branchFlags.mirror_leak ?? branchFlags.prologue_mirror`, NEVER reading `branchFlags.prologue_leak` (which PrologueDirector.ts:529/538/548 & campaign_20hr.json:ch_2 actually write)! Finale chronicle always falsely says "Ignored the leaked reflection".',
    'Read `snap.branchFlags.prologue_leak ?? snap.branchFlags.mirror_leak ?? snap.branchFlags.prologue_mirror ?? \'CLEAN\'`.'
  );
}

// CHECK 1B: New Circuit+ double-increment between EndingSequenceDirector & SovereignMasterController
const endingCallsNcpDirect = /options\.blackboard\.startNewCircuitPlus\s*\(/.test(endingSrc);
const ctrlCallsNcpInCb = /onStartNewCircuitPlus:[\s\S]{0,160}this\.campaign\.startNewCircuitPlus/.test(controllerSrc);
if (endingCallsNcpDirect && ctrlCallsNcpInCb) {
  addFinding(
    'P0',
    '@cinema-actor-sleek-lead / @mobile-hud-architect',
    'NEW_CIRCUIT_PLUS_DOUBLE_CALL',
    'src/cinema/EndingSequenceDirector.ts:1350-1357 & src/ui/SovereignMasterController.ts:1874-1879',
    'Clicking LAUNCH NEW CIRCUIT+ calls `blackboard.startNewCircuitPlus(chosen)` inside EndingSequenceDirector AND calls `onStartNewCircuitPlus`, which calls `campaign.startNewCircuitPlus()` -> `blackboard.startNewCircuitPlus()` a SECOND time! Jumps `newCircuitPlusCount` 0->2 (+0.90 IRT instead of +0.45) and skips Cycle #1.',
    'In EndingSequenceDirector.ts:1350, only call `options.blackboard.startNewCircuitPlus(chosen)` inside the `else` branch when `!ncpCb` (or let `onStartNewCircuitPlus` own the transition).'
  );
}

// CHECK 1C: Geneva Q2 Mirror Leak EXPLOIT_LEAK breaks its own 3.0x multiplier promise & hides leakedHintText
if (/const initialPeel:\s*PeelTier\s*=\s*snap\.leakedHintRevealed\s*\?\s*2\s*:\s*1/.test(controllerSrc)) {
  addFinding(
    'P0',
    '@mobile-hud-architect',
    'BROKEN_CHOICE_PROMISE',
    'src/ui/SovereignMasterController.ts:1231-1251',
    'Prologue Q2 Mirror Leak choice EXPLOIT_LEAK promises "Read Teo\'s reflected tablet clue ... while keeping your 3.0x multiplier" and sets `qCard.leakedHintText`, but SovereignMasterController sets `initialPeel = 2` (dropping multiplier to 2.0x and skewing Persona toward Analyst!) and NEVER displays `qCard.leakedHintText`.',
    'Keep `initialPeel = 1` (3.0x preserved!) and pass `qCard.leakedHintText` into `coachHint` / `tellLine` when `snap.leakedHintRevealed` is true.'
  );
}

// CHECK 1D: Mission choice `responseLine` dropped on the floor in SovereignMasterController
const handlesChoiceResponseLine = /res\.responseLine/.test(controllerSrc);
if (!handlesChoiceResponseLine) {
  addFinding(
    'P1',
    '@mobile-hud-architect',
    'SKIPPED_STORY_BEAT',
    'src/ui/SovereignMasterController.ts:1849-1889',
    'All 96 campaign missions author bespoke `response_line` choice aftermath reactions (interpolated by CampaignCircuitDirector.selectMissionChoice), yet SovereignMasterController.handleDialogueChoice() ignores `res.responseLine` completely and jumps straight into combat.',
    'When `res.responseLine` is truthy (and not an ending), display a crisp 1-beat aftermath dialogue step (with optional choice reaction VO clip) before invoking `done?.()`.'
  );
}

// CHECK 1E: Terminal Backstage choices with no nextNodeId & empty responseText render blank "" card!
const handlesEmptyBackstageResp = /!res\.responseText\s*\.trim\(\)/.test(controllerSrc) || /!res\.responseText/.test(controllerSrc);
if (!handlesEmptyBackstageResp) {
  addFinding(
    'P0',
    '@mobile-hud-architect',
    'BLANK_DIALOGUE_DEAD_END',
    'src/ui/SovereignMasterController.ts:1804-1819',
    '35 terminal choices across the 32 multi-node Backstage Interrogations have `nextNodeId: null` and no `responseText`. Clicking them falls into the `else` branch and renders an empty quotation `“”` screen!',
    'If `!res.nextNode && !res.responseText?.trim()`, either pop cleanly back to the Hub (with a crisp confirmation or last-node debrief) or populate a meaningful closing beat.'
  );
}

// CHECK 1F: Backstage Interrogations MUST call slot-sorted `getUnlockedBackstageConversationsForHub(hubId)`
// (narrative_wave2.json lists jp_2, is_2, sg_2, global_3 at index 0 — filtering with `idx === 0` still leaks Act III/IV spoilers!)
const controllerUsesUnlockedHelper = /this\.wave2Narrative\.getUnlockedBackstageConversationsForHub\s*\(/.test(controllerSrc);
const wave2HasUnlockedHelper = /getUnlockedBackstageConversationsForHub\s*\(/.test(wave2DirSrc);
if (!controllerUsesUnlockedHelper || !wave2HasUnlockedHelper) {
  addFinding(
    'P0',
    '@mobile-hud-architect',
    'BACKSTAGE_SPOILER_LEAK',
    'src/ui/SovereignMasterController.ts:1566-1575',
    'SovereignMasterController manually filters `getAllBackstageConversationsForHub(hubId)` with `idx === 0`, which STILL leaks late-hub spoilers (`jp_2`, `is_2`, `sg_2`, `global_3`) on Mission 1 because `narrative_wave2.json` puts those at array index 0 instead of `*_1`!',
    'Replace lines 1566-1574 with `const convs = this.wave2Narrative.getUnlockedBackstageConversationsForHub(hubId); if (convs.length === 0) return;` (slot-sorted helper already landed in Wave2NarrativeDirector.ts:1441!).'
  );
}

// CHECK 1G: Backstage Interrogations ignore all 20 authored `passiveDomainCheck` insights!
const rendersBackstagePassiveInsight = /renderBackstageNode[\s\S]{0,1400}passiveDomainCheck/.test(controllerSrc);
if (!rendersBackstagePassiveInsight) {
  addFinding(
    'P1',
    '@mobile-hud-architect',
    'MISSING_PASSIVE_SKILL_CHECKS',
    'src/ui/SovereignMasterController.ts:1540-1580',
    '20 Backstage dialogue nodes in `narrative_wave2.json` have authored `passiveDomainCheck` insights (parsed by Wave2NarrativeDirector.ts:1172), but `renderBackstageNode()` never evaluates or passes `passiveInsightText` to `SovereignHUD.renderStoryDialogue()`.',
    'Evaluate `node.passiveDomainCheck` against `passport` domain theta/Elo (mirroring CampaignCircuitDirector.ts:1386) and pass `passiveInsightText`.'
  );
}

// CHECK 1H: Wave2NarrativeDirector ignores `unlockPerk` and `vaultClue` in backstage choice effects!
const wave2HandlesPerk = /unlockPerk/.test(wave2DirSrc);
const wave2HandlesVaultClue = /vaultClue/.test(wave2DirSrc);
if (!wave2HandlesPerk || !wave2HandlesVaultClue) {
  addFinding(
    'P0',
    'narrative (src/narrative/Wave2NarrativeDirector.ts)',
    'UNHANDLED_BACKSTAGE_EFFECTS',
    'src/narrative/Wave2NarrativeDirector.ts:1089-1147 & 1447-1470',
    `Wave2NarrativeDirector ignores ${[!wave2HandlesPerk && 'effects.unlockPerk (8 choices!)', !wave2HandlesVaultClue && 'effects.vaultClue (2 Secret Ending vault clues!)'].filter(Boolean).join(' & ')} from narrative_wave2.json!`,
    'Parse `unlockPerk` & `vaultClue` in `normalizeBackstageConversation()` and call `this.blackboard.unlockPerk(...)` & `this.blackboard.unlockVaultClue(...)` in `selectBackstageOption()`.'
  );
}

// CHECK 1I: Singapore Betrayal `sg_3` swaps speakerId/speakerName without swapping speakerRole, text, tellHint, or voiceUrl!
const sg3SwapsFullBeat = /raw\.id === 'sg_3'[\s\S]{0,600}singapore_betrayal_/.test(campaignDirSrc);
if (!sg3SwapsFullBeat) {
  addFinding(
    'P0',
    'narrative (src/narrative/CampaignCircuitDirector.ts)',
    'OUT_OF_CHARACTER_BETRAYAL',
    'src/narrative/CampaignCircuitDirector.ts:1404-1416',
    'On `sg_3`, when dynamic betrayer is `soren` or `teo` (i.e. whenever the player saved Nadia in Rio!), CampaignCircuitDirector swaps speakerId/speakerName to Soren/Teo while STILL keeping Nadia\'s role ("Acoustic Engineer & Rival"), Nadia\'s dialogue ("You left me to burn in Rio. Lindqvist offered Tariq full amnesty..."), AND Nadia\'s female voice clip (`nadia_rio_intro.mp3`)!',
    'Substitute `speakerRole`, `text`, `tellHint`, and `voiceUrl` cleanly for `nadia` (`singapore_betrayal_nadia.mp3`), `teo` (`singapore_betrayal_teo.mp3`), and `soren` (`singapore_betrayal_soren.mp3`) — all 3 mastered MP3s already exist in `public/assets/voice/`!'
  );
}

// CHECK 1J: Premature Prologue Honours feats + silent invalid Challenger name rejection
if (/handleCompleteRegistration[\s\S]{0,300}PASSPORT_STAMPED/.test(controllerSrc)) {
  addFinding(
    'P1',
    '@mobile-hud-architect',
    'PREMATURE_STORY_BEAT',
    'src/ui/SovereignMasterController.ts:1157-1163',
    '`handleCompleteRegistration` ignores `validation.valid` (silently looping if user types invalid punctuation like "!!!") AND fires `PASSPORT_STAMPED` trophy BEFORE Q1–Q4 instead of at `PASSPORT_STAMP_PAYOFF`!',
    'Check `if (!validation.valid)` and show validation error in Registration UI; fire `PASSPORT_STAMPED` & `PROLOGUE_CLEARED` inside `PASSPORT_STAMP_PAYOFF` (after Q4).'
  );
}
if (/rawChoiceId\.startsWith\('MANIFESTO:'\)[\s\S]{0,250}PROLOGUE_CLEARED/.test(controllerSrc)) {
  addFinding(
    'P1',
    '@mobile-hud-architect',
    'PREMATURE_STORY_BEAT',
    'src/ui/SovereignMasterController.ts:1833-1843',
    '`PROLOGUE_CLEARED` feat unlocks when choosing Manifesto (before Q3 Overclock & Q4 Calibrator!).',
    'Move `recordSpecialFeat(\'PROLOGUE_CLEARED\')` & `PASSPORT_STAMPED` to `PASSPORT_STAMP_PAYOFF` phase after Q4 completes.'
  );
}

// CHECK 1K: SovereignHUD Origin tags mismatch PassportSystem.ORIGIN_DEFINITIONS
if (hudSrc.includes("tag: 'History · Arts · Classical Science'")) {
  addFinding(
    'P2',
    '@mobile-hud-architect',
    'CONTINUITY',
    'src/ui/SovereignHUD.ts:811-830 vs src/narrative/PassportSystem.ts:219-253',
    'SovereignHUD hardcodes different Origin descriptions/domain affinity tags (e.g., Academic says "History · Arts · Classical Science" instead of actual `affinityDomains: [0, 1, 8, 10]` History · Science · Law · Myth).',
    'Sync SovereignHUD Origin cards with `ORIGIN_DEFINITIONS` in PassportSystem.ts.'
  );
}

// CHECK 1L: CampaignSaveSlotManager Act Labels drift from campaign_20hr.json & PITCH_BIBLE.md
if (saveSlotSrc.includes("eg: { actLabel: 'ACT III', city: 'Cairo' }")) {
  addFinding(
    'P2',
    'narrative (src/narrative/CampaignSaveSlotManager.ts)',
    'CONTINUITY',
    'src/narrative/CampaignSaveSlotManager.ts:38-41',
    'HUB_CITY_LABELS labels Cairo as `ACT III` and Singapore as `ACT IV`, contradicting PITCH_BIBLE.md §2.3 & campaign_20hr.json (`eg: ACT II`, `is: ACT III`, `sg: ACT III`, `global: ACT IV`).',
    'Align HUB_CITY_LABELS to `eg: ACT II`, `is: ACT III`, `sg: ACT III`, `global: ACT IV`.'
  );
}

// CHECK 1M: `is_1` (Reykjavik) and `jp_3_post` (Tokyo) branch-contradictory static beats
const is1b1 = campaign.missions.find((m) => m.id === 'is_1')?.dialogue_beats?.[0];
if (is1b1 && /pirate viewers/i.test(is1b1.text) && !/raw\.id === 'is_1'/.test(campaignDirSrc)) {
  addFinding(
    'P1',
    'narrative (src/narrative/CampaignCircuitDirector.ts)',
    'BRANCH_CONTRADICTION',
    'src/narrative/CampaignCircuitDirector.ts:getMissionView & public/data/campaign_20hr.json:is_1',
    'On `is_1` (Reykjavik Arrival), `is_1_b1` ALWAYS has Teo shout "Forty million pirate viewers just tuned in! Time to crash their private summit!" EVEN IF the player chose the INSIDER GAMBIT branch in Cairo (entering the closed Council Conclave privately)!',
    'In CampaignCircuitDirector.getMissionView(), when `raw.id === \'is_1\'` and `snap.act3Branch === \'INSIDER\'`, adapt `is_1_b1` to an Insider Conclave entry line (e.g., Vance/Lindqvist welcoming the covert delegate behind closed doors).'
  );
}
const jp3post = campaign.missions.find((m) => m.id === 'jp_3')?.post_match_beats?.[0];
if (jp3post && /live signal jam/i.test(jp3post.text) && !/raw\.id === 'jp_3'/.test(campaignDirSrc)) {
  addFinding(
    'P1',
    'narrative (src/narrative/CampaignCircuitDirector.ts)',
    'BRANCH_CONTRADICTION',
    'src/narrative/CampaignCircuitDirector.ts:getMissionView & public/data/campaign_20hr.json:jp_3',
    'On `jp_3` post-match, Vance ALWAYS says "A live signal jam at seventy stories. Tokyo has never been sharper." EVEN IF the player chose BLACKMAIL SOREN instead of firing the signal jammer!',
    'In CampaignCircuitDirector.getMissionView(), branch `jp_3_post` when `snap.branchFlags.tokyo_earpiece === \'BLACKMAILED\'` so Vance comments on the silent telemetry pact instead of a jammer.'
  );
}

// CHECK 1N: Act 0 Cutscene #3 subtitle vs actual recorded audio (`cutscene_act0_3.mp3`)
if (prologueDirSrc.includes('vanished five years ago')) {
  addFinding(
    'P1',
    '@forge-number-hygiene',
    'VO_SUBTITLE_MISMATCH',
    'src/narrative/PrologueDirector.ts:156',
    'Act 0 cutscene line `cutscene_act0_3` subtitle says "The last genius who sat in that chair vanished five years ago.", contradicting the actual recorded MP3 `cutscene_act0_3.mp3` ("Don\'t trust the cameras, rookie. The last person who won this chair vanished in 2019.") AND the 2026 timeline!',
    'Align `PrologueDirector.ts:156` subtitle to match `cutscene_act0_3.mp3` ("Don\'t trust the cameras, rookie. The last person who won this chair vanished in 2019.").'
  );
}

// CHECK 1O: Back-to-back duplicate line between `br_1_post` and `br_2_b1`
const br1Post = campaign.missions.find((m) => m.id === 'br_1')?.post_match_beats?.[0];
const br2B1 = campaign.missions.find((m) => m.id === 'br_2')?.dialogue_beats?.[0];
if (br1Post && br2B1 && br1Post.text === br2B1.text) {
  addFinding(
    'P2',
    '@corpus-dates-editor',
    'REPETITIVE_DIALOGUE',
    'public/data/campaign_20hr.json:br_1_post & br_2_b1',
    `Consecutive story beats \`br_1_post\` and \`br_2_b1\` repeat the exact same Nadia line & VO clip ("${br1Post.text}").`,
    'Differentiate `br_2_b1` (e.g., use bespoke `rio_nadia_sabotage_1.mp3` or `rio_nadia_sabotage_2.mp3` and fresh escalation text!).'
  );
}

// CHECK 1P: `is_3_b3` Reykjavik reunion playing Rio pod-tampering VO clip!
const is3B3 = campaign.missions.find((m) => m.id === 'is_3')?.dialogue_beats?.[2];
if (is3B3 && /nadia_rio_intro\.mp3/.test(is3B3.voice_clip || '')) {
  addFinding(
    'P1',
    '@corpus-dates-editor',
    'WRONG_SCENE_VO',
    'public/data/campaign_20hr.json:is_3.pre.is_3_b3',
    'Emotional Reykjavik brother-reunion beat (`is_3_b3`: "Five years, Tariq...") plays `nadia_rio_intro.mp3` ("Ten thousand spectators in Rio—and someone just tampered with my pod!")!',
    'Clear mismatched `nadia_rio_intro.mp3` (or swap to an appropriate Reykjavik/Nadia clip) and update "Five years" -> "Seven years".'
  );
}

// ============================================================================
// 2. FULL `campaign_20hr.json` AUDIT (96 MISSIONS, ALL 144 VO CLIPS, ENDINGS)
// ============================================================================
const validPerks = new Set([
  'DIPLOMATIC_REDACTION', 'CLEAN_HANDS', 'HORIZON_LENS', 'ANALOG_STATIC_MASTER',
  'DIPLOMAT_COMPOSURE', 'MAVERICK_GAMBIT', 'COOP_CROSSCHECK', 'PEOPLES_LENS',
  'COUNCIL_OVERRIDE', 'BLUFF_ECHO',
]);
const validRelics = new Set([
  'meridian_astrolabe', 'armillary_orrery', 'origami_prism', 'emerald_sphere',
  'cipher_box', 'cryo_relay', 'council_seal', 'master_ledger',
]);
const validCast = new Set(['vance', 'nadia', 'soren', 'teo', 'lindqvist', 'tariq']);
const handledEffectKeys = new Set([
  'integrity', 'public_trust', 'council_favor',
  'bond_nadia', 'bond_teo', 'bond_lindqvist', 'bond_soren', 'bond_tariq', 'bond_vance',
  'unlock_perk', 'unlock_relic', 'unlock_skin',
  'vault_clue', 'evidence_clue', 'black_salon_unlocked', 'ending_id', 'branch_flag',
]);
const handledConditionKeys = new Set([
  'min_integrity', 'max_integrity', 'min_public_trust', 'max_public_trust',
  'min_council_favor', 'max_council_favor', 'min_vault_clues',
  'flag_equals', 'min_any_bond', 'any', 'all',
]);

const missionById = new Map();
for (const m of campaign.missions || []) missionById.set(m.id, m);
const evidenceClueIds = new Set((campaign.evidence_board?.clues || []).map((c) => c.id));

let voSpeakerMismatchCount = 0;
let missingAssetCount = 0;

for (const cs of campaign.act_cutscenes || []) {
  if (!existsPublic(cs.image)) {
    missingAssetCount++;
    addFinding('P0', '@corpus-dates-editor', 'MISSING_ASSET', `campaign_20hr.json:act_cutscenes.${cs.id}`, `Missing image ${cs.image}`);
  }
  for (const ln of cs.lines || []) {
    scanTextField(ln.text, `campaign_20hr.json:act_cutscenes.${cs.id}.${ln.id}`, '@corpus-dates-editor', { isInterpolated: true });
    if (ln.voice_clip && !existsPublic(ln.voice_clip)) {
      missingAssetCount++;
      addFinding('P0', '@corpus-dates-editor', 'MISSING_ASSET', `campaign_20hr.json:act_cutscenes.${cs.id}.${ln.id}`, `Missing VO ${ln.voice_clip}`);
    }
  }
}

for (const m of campaign.missions || []) {
  const mLoc = `campaign_20hr.json:mission.${m.id}`;
  scanTextField(m.title, `${mLoc}.title`, '@corpus-dates-editor', { isInterpolated: false });
  scanTextField(m.subtitle, `${mLoc}.subtitle`, '@corpus-dates-editor', { isInterpolated: false });
  scanTextField(m.mutator_brief, `${mLoc}.mutator_brief`, '@corpus-dates-editor', { isInterpolated: false });
  scanTextField(m.cliffhanger_hook, `${mLoc}.cliffhanger_hook`, '@corpus-dates-editor', { isInterpolated: true });

  for (const kind of ['dialogue_beats', 'post_match_beats']) {
    for (const b of m[kind] || []) {
      const bLoc = `${mLoc}.${kind === 'dialogue_beats' ? 'pre' : 'post'}.${b.id}`;
      scanTextField(b.text, bLoc, '@corpus-dates-editor', { isInterpolated: true });
      if (b.tell_hint) scanTextField(b.tell_hint, `${bLoc}.tell_hint`, '@corpus-dates-editor', { isInterpolated: true });
      if (b.voice_clip) {
        if (!existsPublic(b.voice_clip)) {
          missingAssetCount++;
          addFinding('P0', '@corpus-dates-editor', 'MISSING_ASSET', bLoc, `Missing VO ${b.voice_clip}`);
        } else {
          const fn = b.voice_clip.split('/').pop();
          const voInfo = voMap.get(fn);
          if (voInfo && voInfo.speaker && voInfo.speaker !== b.speaker) {
            voSpeakerMismatchCount++;
            addFinding(
              'P1',
              'narrative / @corpus-dates-editor',
              'VO_SPEAKER_MISMATCH',
              bLoc,
              `Speaker "${b.speaker}" plays "${fn}" voiced by "${voInfo.speaker}"!`,
              `Replace with a ${b.speaker}-voiced clip or omit mismatched clip.`
            );
          }
        }
      }
    }
  }

  for (const ch of m.choices || []) {
    const cLoc = `${mLoc}.choice.${ch.id}`;
    scanTextField(ch.label, `${cLoc}.label`, '@corpus-dates-editor', { isInterpolated: true });
    scanTextField(ch.subtext, `${cLoc}.subtext`, '@corpus-dates-editor', { isInterpolated: true });
    scanTextField(ch.impact_badge, `${cLoc}.impact_badge`, '@corpus-dates-editor', { isInterpolated: false });
    if (ch.response_line) scanTextField(ch.response_line, `${cLoc}.response_line`, '@corpus-dates-editor', { isInterpolated: true });
    if (ch.effects) {
      for (const ek of Object.keys(ch.effects)) {
        if (!handledEffectKeys.has(ek)) {
          addFinding('P0', '@corpus-dates-editor', 'UNHANDLED_EFFECT', cLoc, `Unhandled effect key "${ek}"`);
        }
      }
      if (ch.effects.unlock_perk && !validPerks.has(ch.effects.unlock_perk)) {
        addFinding('P0', '@corpus-dates-editor', 'INVALID_PERK', cLoc, `Invalid perk "${ch.effects.unlock_perk}"`);
      }
      if (ch.effects.unlock_relic && !validRelics.has(ch.effects.unlock_relic)) {
        addFinding('P0', '@corpus-dates-editor', 'INVALID_RELIC', cLoc, `Invalid relic "${ch.effects.unlock_relic}"`);
      }
    }
    const checkCond = (cond) => {
      if (!cond) return;
      for (const k of Object.keys(cond)) {
        if (!handledConditionKeys.has(k)) addFinding('P0', '@corpus-dates-editor', 'UNHANDLED_CONDITION', cLoc, `Unhandled condition key "${k}"`);
      }
      (cond.any || []).forEach(checkCond);
      (cond.all || []).forEach(checkCond);
    };
    checkCond(ch.requires);
  }
}

// ============================================================================
// 3. AUDIT `narrative_wave2.json` (32 BACKSTAGE TREES, 8 HUBS, 40 LORE LOGS)
// ============================================================================
let backstageTerminalBlankCount = 0;
let backstageOrphanCount = 0;
const wave2BackstageCheck = (conv, prefix) => {
  const cLoc = `narrative_wave2.json:${prefix}.${conv.id || conv.hubId}`;
  const nodesList = Array.isArray(conv.nodes)
    ? conv.nodes
    : Object.entries(conv.nodes || {}).map(([k, v]) => ({ ...v, id: v.id || k }));
  const nodeMap = new Map(nodesList.map((n) => [n.id, n]));
  const entryId = conv.entryNodeId || nodesList[0]?.id;

  const visited = new Set();
  const q = entryId && nodeMap.has(entryId) ? [entryId] : [];
  while (q.length) {
    const id = q.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    const n = nodeMap.get(id);
    if (!n) continue;
    if (n.nextNodeId && n.nextNodeId !== 'END' && nodeMap.has(n.nextNodeId)) q.push(n.nextNodeId);
    const opts = Array.isArray(n.options) ? n.options : Array.isArray(n.choices) ? n.choices : [];
    for (const o of opts) {
      if (o.nextNodeId && o.nextNodeId !== 'END' && nodeMap.has(o.nextNodeId)) q.push(o.nextNodeId);
    }
  }

  for (const n of nodesList) {
    const nLoc = `${cLoc}.${n.id}`;
    if (!visited.has(n.id)) {
      backstageOrphanCount++;
      addFinding('P1', 'narrative (narrative_wave2.json)', 'ORPHAN_NODE', nLoc, `Unreachable backstage node "${n.id}" from entry "${entryId}"`);
    }
    const spk = n.speakerId || n.speaker;
    if (!validCast.has(spk)) addFinding('P0', 'narrative', 'INVALID_SPEAKER', nLoc, `Unknown speaker "${spk}"`);
    scanTextField(n.text, `${nLoc}.text`, 'narrative', { isInterpolated: true });
    if (n.voiceUrl) {
      if (!existsPublic(n.voiceUrl)) {
        missingAssetCount++;
        addFinding('P0', 'narrative', 'MISSING_ASSET', nLoc, `Missing VO ${n.voiceUrl}`);
      } else {
        const fn = n.voiceUrl.split('/').pop();
        const info = voMap.get(fn);
        if (info && info.speaker && info.speaker !== spk) {
          voSpeakerMismatchCount++;
          addFinding('P1', 'narrative', 'VO_SPEAKER_MISMATCH', nLoc, `Node speaker="${spk}" plays "${fn}" voiced by "${info.speaker}"!`);
        }
      }
    }
    const opts = Array.isArray(n.options) ? n.options : Array.isArray(n.choices) ? n.choices : [];
    for (const o of opts) {
      if (!o.nextNodeId && !o.responseText) {
        backstageTerminalBlankCount++;
      }
    }
  }
};

for (const [hk, conv] of Object.entries(wave2.backstage_hubs || {})) wave2BackstageCheck(conv, `backstage_hubs.${hk}`);
for (const conv of wave2.backstage_conversations || []) wave2BackstageCheck(conv, 'backstage_conversations');

// Check PRODIGY persona startingPerkId consistency
const prodigyW2 = (wave2.persona_ceremonies || []).find((p) => p.personaId === 'PRODIGY');
if (prodigyW2 && prodigyW2.startingPerkId !== 'CLEAN_HANDS') {
  addFinding(
    'P1',
    'narrative (narrative_wave2.json)',
    'CONTINUITY',
    'public/data/narrative_wave2.json:57',
    `PRODIGY persona startingPerkId is "${prodigyW2.startingPerkId}" while PassportSystem.ts:315 grants "CLEAN_HANDS".`,
    'Update narrative_wave2.json:57 startingPerkId to "CLEAN_HANDS".'
  );
}

// ============================================================================
// 4. TIMELINE & CONTINUITY CHECK (2019 -> 2026 = "seven years", NOT "five years")
// ============================================================================
const fiveYearLocs = [];
const NON_2019_FIVE_YEAR_WHITELIST = /±5 years|beat the house clean|Good luck beating that in five years|five-year constitutional cycle/i;
const checkFiveYearsInText = (text, loc) => {
  if (
    typeof text === 'string' &&
    /\bfive[- ]years?\b|\b5[- ]years?\b/i.test(text) &&
    !NON_2019_FIVE_YEAR_WHITELIST.test(text)
  ) {
    fiveYearLocs.push(`${loc}: "${text.trim().slice(0, 95)}"`);
  }
};
const walkJson = (obj, prefix) => {
  if (typeof obj === 'string') checkFiveYearsInText(obj, prefix);
  else if (Array.isArray(obj)) obj.forEach((v, i) => walkJson(v, `${prefix}[${i}]`));
  else if (obj && typeof obj === 'object') Object.entries(obj).forEach(([k, v]) => walkJson(v, `${prefix}.${k}`));
};
// Skip voice_manifest (immutable audio transcripts of recorded MP3s) for editable text check
const campEditable = { ...campaign, voice_manifest: undefined };
walkJson(campEditable, 'campaign_20hr.json');
walkJson(wave2, 'narrative_wave2.json');
for (const [rel, txt] of [
  ['src/narrative/PrologueDirector.ts', prologueDirSrc],
  ['src/narrative/EvidenceDossier.ts', dossierSrc],
  ['src/narrative/PassportSystem.ts', passportSrc],
  ['src/narrative/Wave2NarrativeDirector.ts', wave2DirSrc],
  ['src/cinema/MotionCinemaDirector.ts', motionCinemaSrc],
]) {
  txt.split(/\r?\n/).forEach((line, idx) => {
    if (!/^\s*\/\//.test(line) && !/^\s*\*/.test(line)) checkFiveYearsInText(line, `${rel}:${idx + 1}`);
  });
}
if (fiveYearLocs.length > 0) {
  addFinding(
    'P1',
    'narrative / @corpus-dates-editor',
    'TIMELINE_CONFLICT',
    `Across ${fiveYearLocs.length} lines in TS & JSON`,
    `Trial Zero (2019) timeline conflict: ${fiveYearLocs.length} text lines say "five years" while voiced audio (cairo_nadia_tariq_1, reykjavik_tariq_reveal_1, apex_vance_pass_torch) says "seven years / seven winters" (2019->2026)!`,
    `Align text-only "five years" references to "seven years" (or "since 2019") matching the 2026 setting & voiced audio. First 5: ${fiveYearLocs.slice(0, 5).join(' | ')}`
  );
}

// ============================================================================
// 5. FULL INTERACTIVE PATH SIMULATOR (PROLOGUE -> ALL 4 ENDINGS & ALL 3 BETRAYERS)
// ============================================================================
function createSimState() {
  return {
    axisIntegrity: 0,
    publicTrust: 50,
    councilFavor: 50,
    bondScores: { vance: 1, nadia: 0, soren: 0, teo: 0, lindqvist: 0, tariq: 0 },
    branchFlags: {},
    vaultClues: [],
    unlockedEvidenceClues: [],
    completedMissions: [],
    firstFlight: null,
    act3Branch: null,
  };
}
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
function applySimEffects(st, eff) {
  if (!eff) return;
  if (eff.integrity) st.axisIntegrity = clamp(st.axisIntegrity + eff.integrity, -100, 100);
  if (eff.public_trust) st.publicTrust = clamp(st.publicTrust + eff.public_trust, 0, 100);
  if (eff.council_favor) st.councilFavor = clamp(st.councilFavor + eff.council_favor, 0, 100);
  for (const npc of ['nadia', 'teo', 'lindqvist', 'soren', 'tariq', 'vance']) {
    if (eff[`bond_${npc}`]) st.bondScores[npc] = clamp(st.bondScores[npc] + eff[`bond_${npc}`], -5, 8);
  }
  if (eff.branch_flag) {
    for (const [k, v] of Object.entries(eff.branch_flag)) {
      st.branchFlags[k] = v;
      if (k === 'first_flight') st.firstFlight = v;
      if (k === 'act3_branch') st.act3Branch = v;
    }
  }
  if (eff.vault_clue && !st.vaultClues.includes(eff.vault_clue)) st.vaultClues.push(eff.vault_clue);
  if (eff.evidence_clue && !st.unlockedEvidenceClues.includes(eff.evidence_clue)) st.unlockedEvidenceClues.push(eff.evidence_clue);
}
function evalSimCond(st, cond) {
  if (!cond) return true;
  if (Array.isArray(cond.all) && cond.all.length && !cond.all.every((c) => evalSimCond(st, c))) return false;
  if (Array.isArray(cond.any) && cond.any.length && !cond.any.some((c) => evalSimCond(st, c))) return false;
  if (cond.min_integrity !== undefined && st.axisIntegrity < cond.min_integrity) return false;
  if (cond.max_integrity !== undefined && st.axisIntegrity > cond.max_integrity) return false;
  if (cond.min_public_trust !== undefined && st.publicTrust < cond.min_public_trust) return false;
  if (cond.max_public_trust !== undefined && st.publicTrust > cond.max_public_trust) return false;
  if (cond.min_council_favor !== undefined && st.councilFavor < cond.min_council_favor) return false;
  if (cond.max_council_favor !== undefined && st.councilFavor > cond.max_council_favor) return false;
  if (cond.min_vault_clues !== undefined && st.vaultClues.length < cond.min_vault_clues) return false;
  if (cond.flag_equals) {
    for (const [k, exp] of Object.entries(cond.flag_equals)) {
      const act = st.branchFlags[k] ?? (k === 'act3_branch' ? st.act3Branch : k === 'first_flight' ? st.firstFlight : undefined);
      if (act !== exp) return false;
    }
  }
  if (cond.min_any_bond) {
    if (!cond.min_any_bond.npcs.some((npc) => (st.bondScores[npc] ?? 0) >= cond.min_any_bond.threshold)) return false;
  }
  return true;
}

const SIM_RUNS = [
  {
    name: 'HEROIC_SECRET_ARCHITECT (London->Tokyo)',
    firstFlight: 'GB',
    strategy: 'HIGH_INTEGRITY',
    prologue: [
      { integrity: 10, public_trust: 4, council_favor: -4, bond_nadia: 1, branch_flag: { origin: 'ACADEMIC' } },
      { integrity: 20, public_trust: 8, bond_vance: 1, bond_teo: 1, branch_flag: { prologue_leak: 'CLEAN' } },
      { public_trust: 15, integrity: 10, bond_nadia: 1, bond_teo: 1, branch_flag: { manifesto: 'PUBLIC' } },
      { council_favor: 8, integrity: 2, branch_flag: { first_flight: 'GB' } },
    ],
    overrides: { gb_4: 'gb_4_claim_vault_clue_1', eg_5: 'eg_5_extract_clue_2', is_3: 'is_3_accept_trojan_pact' },
  },
  {
    name: 'SOVEREIGN_ARBITER (Tokyo->London)',
    firstFlight: 'JP',
    strategy: 'HIGH_COUNCIL',
    prologue: [
      { integrity: -2, public_trust: 2, council_favor: 8, bond_soren: 1, branch_flag: { origin: 'STRATEGIST' } },
      { integrity: 15, council_favor: 18, bond_lindqvist: 1, branch_flag: { prologue_leak: 'FLAGGED' } },
      { council_favor: 15, integrity: 5, bond_lindqvist: 1, branch_flag: { manifesto: 'COUNCIL' } },
      { public_trust: 8, integrity: 2, branch_flag: { first_flight: 'JP' } },
    ],
    overrides: { br_2: 'br_2_save_nadia', eg_4: 'eg_4_insider', is_3: 'is_3_accept_trojan_pact' },
  },
  {
    name: 'RUTHLESS_KINGMAKER_NADIA_BETRAYER (London->Tokyo)',
    firstFlight: 'GB',
    strategy: 'LOW_INTEGRITY',
    prologue: [
      { integrity: -2, public_trust: 2, council_favor: 8, bond_soren: 1, branch_flag: { origin: 'STRATEGIST' } },
      { integrity: -18, council_favor: -4, branch_flag: { prologue_leak: 'EXPLOITED' } },
      { integrity: -10, public_trust: 5, bond_soren: 1, branch_flag: { manifesto: 'SELF' } },
      { council_favor: 8, integrity: 2, branch_flag: { first_flight: 'GB' } },
    ],
    overrides: { br_2: 'br_2_claim_seed', eg_4: 'eg_4_insider', is_3: 'is_3_go_solo' },
  },
  {
    name: 'MACHIAVELLIAN_TEO_BETRAYER (Tokyo->London)',
    firstFlight: 'JP',
    strategy: 'LOW_INTEGRITY',
    prologue: [
      { integrity: -2, public_trust: 2, council_favor: 8, bond_soren: 1, branch_flag: { origin: 'STRATEGIST' } },
      { integrity: -18, council_favor: -4, branch_flag: { prologue_leak: 'EXPLOITED' } },
      { integrity: -10, public_trust: 5, bond_soren: 1, branch_flag: { manifesto: 'SELF' } },
      { public_trust: 8, integrity: 2, branch_flag: { first_flight: 'JP' } },
    ],
    overrides: { br_2: 'br_2_save_nadia', eg_4: 'eg_4_insider', is_3: 'is_3_go_solo' },
  },
];

const reachedEndings = new Set();
const reachedBetrayers = new Set();
console.log('=== STORY SIMULATION MATRIX ===');
for (const run of SIM_RUNS) {
  const st = createSimState();
  // Prologue unlocks clue_01 & clue_02
  st.unlockedEvidenceClues.push('clue_01_summons', 'clue_02_watch_scratch');
  for (const pe of run.prologue) applySimEffects(st, pe);
  const route = run.firstFlight === 'GB' ? ['gb', 'jp', 'br', 'eg', 'is', 'sg', 'global'] : ['jp', 'gb', 'br', 'eg', 'is', 'sg', 'global'];

  for (const hub of route) {
    for (let slot = 1; slot <= 5; slot++) {
      const mid = `${hub}_${slot}`;
      const m = missionById.get(mid);
      if (!m) continue;
      if (mid !== 'global_5' && m.choices?.length) {
        let chosen = run.overrides[mid] ? m.choices.find((c) => c.id === run.overrides[mid]) : null;
        if (!chosen) {
          const avail = m.choices.filter((c) => evalSimCond(st, c.requires));
          if (run.strategy === 'LOW_INTEGRITY') {
            chosen = [...avail].sort((a, b) => (a.effects?.integrity ?? 0) - (b.effects?.integrity ?? 0))[0];
          } else if (run.strategy === 'HIGH_COUNCIL') {
            chosen = [...avail].sort((a, b) => (b.effects?.council_favor ?? 0) - (a.effects?.council_favor ?? 0))[0];
          } else {
            chosen = [...avail].sort((a, b) => (b.effects?.integrity ?? 0) - (a.effects?.integrity ?? 0))[0];
          }
        }
        applySimEffects(st, chosen.effects);
      }
      if (m.unlocks_evidence_clue && !st.unlockedEvidenceClues.includes(m.unlocks_evidence_clue)) {
        st.unlockedEvidenceClues.push(m.unlocks_evidence_clue);
      }
      st.completedMissions.push(mid);
    }
  }

  let betrayer = 'soren';
  if (st.branchFlags.rio_sabotage === 'CLAIMED_SEED' || st.bondScores.nadia <= -2) betrayer = 'nadia';
  else if (st.axisIntegrity <= -15 || st.bondScores.teo <= -2) betrayer = 'teo';
  reachedBetrayers.add(betrayer);

  const endAvail = (campaign.endings || []).filter((e) => evalSimCond(st, e.requirements)).map((e) => e.id);
  endAvail.forEach((id) => reachedEndings.add(id));

  console.log(
    `  ${run.name}: Int=${st.axisIntegrity} Trust=${st.publicTrust} Favor=${st.councilFavor} Clues=${st.unlockedEvidenceClues.length}/12 Vault=${st.vaultClues.length}/3 Betrayer=${betrayer} Endings=[${endAvail.join(', ')}]`
  );
}

for (const eId of ['SOVEREIGN_ARBITER', 'OPEN_COMMONS', 'KINGMAKER', 'ARCHITECT_SUCCESSION']) {
  if (!reachedEndings.has(eId)) addFinding('P0', 'narrative', 'UNREACHABLE_ENDING', 'campaign_20hr.json', `Ending ${eId} unreachable!`);
}
for (const bId of ['nadia', 'teo', 'soren']) {
  if (!reachedBetrayers.has(bId)) addFinding('P1', 'narrative', 'UNREACHABLE_BETRAYER', 'InkBlackboard.ts', `Betrayer ${bId} unreachable!`);
}

// ============================================================================
// 6. LIVE COMPILED TYPESCRIPT RUNTIME BEHAVIORAL VERIFICATION (9 SUITE CHECKS)
// ============================================================================
let liveTsAssertionsPassed = 0;
try {
  const bundle = await esbuild.build({
    stdin: {
      contents: `
        import { InkBlackboard } from './src/narrative/InkBlackboard.ts';
        import { PassportSystem } from './src/narrative/PassportSystem.ts';
        import { EvidenceDossier } from './src/narrative/EvidenceDossier.ts';
        import { PrologueDirector } from './src/narrative/PrologueDirector.ts';
        import { CampaignCircuitDirector } from './src/narrative/CampaignCircuitDirector.ts';
        import { Wave2NarrativeDirector } from './src/narrative/Wave2NarrativeDirector.ts';
        import { buildPersonalizedJourneyChronicle } from './src/cinema/EndingSequenceDirector.ts';
        export {
          InkBlackboard,
          PassportSystem,
          EvidenceDossier,
          PrologueDirector,
          CampaignCircuitDirector,
          Wave2NarrativeDirector,
          buildPersonalizedJourneyChronicle,
        };
      `,
      resolveDir: ROOT,
      loader: 'ts',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
  });
  const mod = await import(
    'data:text/javascript;base64,' + Buffer.from(bundle.outputFiles[0].text).toString('base64')
  );

  const origFetch = globalThis.fetch;
  globalThis.fetch = async (u) => ({
    ok: true,
    json: async () => (String(u).includes('wave2') ? wave2 : campaign),
  });
  try {
    const bb = new mod.InkBlackboard();
    const pp = new mod.PassportSystem();
    const dossier = new mod.EvidenceDossier(bb, pp);
    const pro = new mod.PrologueDirector(pp, bb);
    const camp = new mod.CampaignCircuitDirector(bb, pp, dossier);
    const w2 = new mod.Wave2NarrativeDirector(pp, bb);
    await camp.loadCampaignData('./data/campaign_20hr.json');
    await w2.loadWave2Data('./data/narrative_wave2.json');

    // (1) Act 0 cutscene #3 subtitle verbatim matches cutout_act0_3.mp3
    const s0 = pro.startFromBeginning();
    assert.equal(
      s0.cutsceneSlides[2].subtitle,
      "Don't trust the cameras, rookie. The last person who won this chair vanished in 2019."
    );
    liveTsAssertionsPassed++;

    // (2) Challenger Name validation rejects "!!!" and accepts "Elena Voss"
    pro.advanceFromCutscene();
    assert.equal(pro.submitIdentityAndOrigin('!!!', 'ACADEMIC').validation.valid, false);
    assert.equal(pro.submitIdentityAndOrigin('Elena Voss', 'ACADEMIC').validation.valid, true);
    assert.equal(pp.getChallengerName(), 'Elena Voss');
    liveTsAssertionsPassed++;

    // (3) Geneva Q1 -> Q2 EXPLOIT_LEAK reveals leakedHintText & writes branchFlags.prologue_leak = EXPLOITED
    pro.recordQuestionCompleted({ questionIndex: 1, correct: true, spinUsed: true, peelTierUsed: 1, overclocked: false });
    const leakSnap = pro.chooseMirrorLeakAction('EXPLOIT_LEAK');
    assert.equal(leakSnap.leakedHintRevealed, true);
    assert.ok(leakSnap.activeQuestion.leakedHintText.includes('Ptolemaic'));
    assert.equal(bb.getSnapshot().branchFlags.prologue_leak, 'EXPLOITED');
    liveTsAssertionsPassed++;

    // (4) EndingSequenceDirector 7-City Chronicle reads branchFlags.prologue_leak accurately
    const chron = mod.buildPersonalizedJourneyChronicle(bb.getSnapshot(), 'Elena Voss');
    assert.ok(chron[0].outcomeSummary.includes('Exploited the one-way mirror glimpse'));
    liveTsAssertionsPassed++;

    // (5) Backstage unlockAfterMission spoiler filter blocks late-hub spoilers on Mission 1 across all 8 hubs
    for (const h of ['ch', 'gb', 'jp', 'br', 'eg', 'is', 'sg', 'global']) {
      const unlocked = w2.getUnlockedBackstageConversationsForHub(h);
      assert.equal(unlocked.length, 1, `Hub ${h} leaked locked backstage convs before Mission 1`);
      if (h !== 'eg') {
        assert.ok(
          unlocked[0].unlockAfterMission.endsWith('_1'),
          `Hub ${h} returned spoiler ${unlocked[0].id} (${unlocked[0].unlockAfterMission})`
        );
      }
    }
    liveTsAssertionsPassed++;

    // (6) Backstage choices actually apply ALL 8 unlockPerk & BOTH vaultClue effects onto InkBlackboard
    let testedPerks = 0;
    let testedVaultClues = 0;
    for (const c of wave2.backstage_conversations || []) {
      const nodesEntries = Array.isArray(c.nodes)
        ? c.nodes.map((n) => [n.id, n])
        : Object.entries(c.nodes || {});
      for (const [nid, n] of nodesEntries) {
        for (const o of n.choices || n.options || []) {
          if (o.effects?.unlockPerk) {
            const res = w2.selectBackstageOption(c.hubId, nid, o.id, c.id);
            assert.ok(res, `selectBackstageOption returned null for ${c.id}.${nid}.${o.id}`);
            assert.equal(res.unlockedPerk, o.effects.unlockPerk);
            assert.ok(bb.getSnapshot().unlockedPerks.includes(o.effects.unlockPerk));
            testedPerks++;
          }
          if (o.effects?.vaultClue) {
            const res = w2.selectBackstageOption(c.hubId, nid, o.id, c.id);
            assert.ok(res, `selectBackstageOption returned null for ${c.id}.${nid}.${o.id}`);
            assert.equal(res.unlockedVaultClue, o.effects.vaultClue);
            assert.ok(bb.getSnapshot().vaultClues.includes(o.effects.vaultClue));
            testedVaultClues++;
          }
        }
      }
    }
    assert.ok(testedPerks >= 8, `Expected >=8 backstage unlockPerk checks, ran ${testedPerks}`);
    assert.ok(testedVaultClues >= 2, `Expected >=2 backstage vaultClue checks, ran ${testedVaultClues}`);
    liveTsAssertionsPassed++;

    // (7) Dynamic sg_3 Betrayal swaps speaker, role, text, tellHint & mastered VO for Nadia / Teo / Soren
    bb.setFlag('rio_sabotage', 'CLAIMED_SEED');
    const sgNadia = camp.getMissionView('sg_3').preMatchBeats.find((b) => b.id === 'sg_3_b1');
    assert.equal(sgNadia.speakerId, 'nadia');
    assert.ok(sgNadia.voiceUrl.includes('singapore_betrayal_nadia.mp3'));
    bb.setFlag('rio_sabotage', 'SAVED_NADIA');
    bb.adjustAxes({ integrity: -100 });
    const sgTeo = camp.getMissionView('sg_3').preMatchBeats.find((b) => b.id === 'sg_3_b1');
    assert.equal(sgTeo.speakerId, 'teo');
    assert.equal(sgTeo.speakerRole, 'Rogue Broadcast Producer');
    assert.ok(sgTeo.voiceUrl.includes('singapore_betrayal_teo.mp3'));
    assert.ok(sgTeo.text.includes('threatened my family'));
    bb.adjustAxes({ integrity: 150 });
    const sgSoren = camp.getMissionView('sg_3').preMatchBeats.find((b) => b.id === 'sg_3_b1');
    assert.equal(sgSoren.speakerId, 'soren');
    assert.equal(sgSoren.speakerRole, 'Card Shark & Rival');
    assert.ok(sgSoren.voiceUrl.includes('singapore_betrayal_soren.mp3'));
    assert.ok(sgSoren.text.includes('cleared my syndicate slate'));
    liveTsAssertionsPassed++;

    // (8) Branch-adaptive dialogue on is_1 (INSIDER) & jp_3_post (BLACKMAILED)
    bb.setFlag('act3_branch', 'INSIDER');
    const is1 = camp.getMissionView('is_1').preMatchBeats[0];
    assert.equal(is1.speakerId, 'vance');
    assert.ok(!/pirate viewers/i.test(is1.text));
    bb.setFlag('tokyo_earpiece', 'BLACKMAILED');
    const jp3p = camp.getMissionView('jp_3').postMatchBeats[0];
    assert.ok(jp3p.text.includes('silent telemetry pact'));
    liveTsAssertionsPassed++;

    // (9) Single-increment New Circuit+
    assert.equal(bb.getSnapshot().newCircuitPlusCount, 0);
    camp.startNewCircuitPlus(['SHORT_FUSE']);
    assert.equal(bb.getSnapshot().newCircuitPlusCount, 1);
    liveTsAssertionsPassed++;
  } finally {
    globalThis.fetch = origFetch;
  }
} catch (err) {
  addFinding('P0', 'narrative', 'LIVE_TS_RUNTIME_FAIL', 'tools/qa/pillar_story_audit.mjs', String(err));
}

// ============================================================================
// FINAL REPORT
// ============================================================================
const bySev = { P0: 0, P1: 0, P2: 0 };
for (const f of findings) bySev[f.severity] = (bySev[f.severity] || 0) + 1;

console.log('\n====================================================================');
console.log(`PILLAR-STORY-AUDIT SUMMARY`);
console.log(`  VO Clips Indexed: ${voMap.size} | Missing Assets: ${missingAssetCount} | VO Speaker Mismatches: ${voSpeakerMismatchCount}`);
console.log(`  Backstage Terminal Blank Choices: ${backstageTerminalBlankCount} | Backstage Orphan Nodes: ${backstageOrphanCount}`);
console.log(`  Endings Reached: ${reachedEndings.size}/4 | Singapore Betrayers Reached: ${reachedBetrayers.size}/3 | Live TS Runtime Checks: ${liveTsAssertionsPassed}/9`);
console.log(`  TOTAL FINDINGS: ${findings.length} (P0=${bySev.P0}, P1=${bySev.P1}, P2=${bySev.P2})`);
console.log('====================================================================');

for (const sev of ['P0', 'P1', 'P2']) {
  const list = findings.filter((f) => f.severity === sev);
  if (!list.length) continue;
  console.log(`\n--- ${sev} (${list.length}) ---`);
  for (const f of list) {
    console.log(`[${f.severity}][${f.category}][${f.owner}] ${f.location}`);
    console.log(`   Issue: ${f.summary}`);
    if (f.fix) console.log(`   Fix:   ${f.fix}`);
  }
}

process.exit(bySev.P0 + bySev.P1 > 0 ? 1 : 0);
