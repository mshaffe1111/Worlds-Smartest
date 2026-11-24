import{g as we,s as Y,a as se}from"./v6-corpus-audio-Dbib9xI6.js";import{B as ke,U as Le,b as Ne,a as Oe,T as oe,g as Me,c as xe}from"./v6-boards-BMx7arYe.js";import{S as Pe,g as re}from"./v6-engine-DEIo4EAA.js";import{a as ne,R as Be,P as De,H as Fe,B as He,s as le,T as Ue,G as Ve,m as Ge,e as qe,b as de,c as $e,d as Ke,g as We,f as ce,F as Ye,h as Qe}from"./v6-ui-fun-DqWRFfUs.js";import{U as ze,T as je,m as Xe}from"./v6-toys-noI4bp23.js";import"./forge-BUEr1wHX.js";import"./three-DIozRJMf.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();const Ze="modulepreload",Je=function(d,e){return new URL(d,e).href},ue={},et=function(e,t,a){let i=Promise.resolve();if(t&&t.length>0){let s=function(h){return Promise.all(h.map(f=>Promise.resolve(f).then(T=>({status:"fulfilled",value:T}),T=>({status:"rejected",reason:T}))))};const l=document.getElementsByTagName("link"),m=document.querySelector("meta[property=csp-nonce]"),g=m?.nonce||m?.getAttribute("nonce");i=s(t.map(h=>{if(h=Je(h,a),h in ue)return;ue[h]=!0;const f=h.endsWith(".css"),T=f?'[rel="stylesheet"]':"";if(!!a)for(let n=l.length-1;n>=0;n--){const o=l[n];if(o.href===h&&(!f||o.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${h}"]${T}`))return;const v=document.createElement("link");if(v.rel=f?"stylesheet":Ze,f||(v.as="script"),v.crossOrigin="",v.href=h,g&&v.setAttribute("nonce",g),document.head.appendChild(v),f)return new Promise((n,o)=>{v.addEventListener("load",n),v.addEventListener("error",()=>o(new Error(`Unable to preload CSS for ${h}`)))})}))}function r(s){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=s,window.dispatchEvent(l),!l.defaultPrevented)throw s}return i.then(s=>{for(const l of s||[])l.status==="rejected"&&r(l.reason);return e().catch(r)})},tt="ws_v6_career_state_v1",ve=1,O=20,be=3,K=3,Te=25,Ee=20,_e=8,B=[{stageId:"STAGE_01_VAUDEVILLE_PALACE",stageNumber:1,title:"Vaudeville Palace",eraSubtitle:"1928 Broadway Mahogany & Edison Brass",difficultyBand:[1,1.9],symphonyTrack:"curtain_overture",episodes:[1,2],signatureBoardFamilies:["CLOCKWORK_ROTARY","TURF_WAR_BRIDGES"],championName:'Barnaby "Two-Takes" Vance',championTitle:"Matinee Crowd Favorite"},{stageId:"STAGE_02_GENEVA_CONSERVATORY",stageNumber:2,title:"Geneva Conservatory",eraSubtitle:"Carrara Marble & Rose-Gold Horology",difficultyBand:[2,2.9],symphonyTrack:"geneva_horology",episodes:[3,4],signatureBoardFamilies:["CLOCKWORK_ROTARY","GRAVITY_PHYSICS"],championName:"Dr. Sabine Vogt",championTitle:"Master of Escapements"},{stageId:"STAGE_03_MONTE_CARLO_SALON",stageNumber:3,title:"Monte Carlo Salon",eraSubtitle:"1962 Riviera Emerald Felt & Crystal",difficultyBand:[3,3.9],symphonyTrack:"riviera_caprice",episodes:[5,6],signatureBoardFamilies:["CASINO_PUSH_LUCK","RULE_BENDER_TWISTS"],championName:"Countess Mireille de Valois",championTitle:"Velvet High-Roller"},{stageId:"STAGE_04_CARTOGRAPHIC_ROTUNDA",stageNumber:4,title:"Cartographic Rotunda",eraSubtitle:"Teak Ship-Deck & Verdigris Astrolabes",difficultyBand:[4,4.9],symphonyTrack:"explorer_odyssey",episodes:[7,8],signatureBoardFamilies:["CARTOGRAPHY_EXPEDITION","TURF_WAR_BRIDGES"],championName:"Capt. Alistair Finch-Harrow",championTitle:"Meridian Strategist"},{stageId:"STAGE_05_ANALOG_BUNKER_1969",stageNumber:5,title:"Analog Bunker 1969",eraSubtitle:"Olive Steel, Nixie Tubes & Radar",difficultyBand:[5,5.9],symphonyTrack:"bunker_espionage",episodes:[9,10],signatureBoardFamilies:["STEALTH_OPTICS_RADAR","MONUMENT_INDUSTRIAL"],championName:'Walter "Redline" Kowalski',championTitle:"Signal Saboteur"},{stageId:"STAGE_06_KYOTO_LACQUER_PAVILION",stageNumber:6,title:"Kyoto Lacquer Pavilion",eraSubtitle:"Urushi Lacquer, Kintsugi Gold & Lanterns",difficultyBand:[6,6.9],symphonyTrack:"kyoto_nocturne",episodes:[11,12],signatureBoardFamilies:["TURF_WAR_BRIDGES","ASTRAL_QUANTUM"],championName:"Kenzo Taniguchi",championTitle:"Kintsugi Grandmaster"},{stageId:"STAGE_07_CARNIVAL_CURIOSITIES",stageNumber:7,title:"Carnival of Curiosities",eraSubtitle:"Midnight Pier, Copper Pinball & Calliope",difficultyBand:[7,7.9],symphonyTrack:"carnival_accelerando",episodes:[13,14],signatureBoardFamilies:["CARNIVAL_ARCADE","GRAVITY_PHYSICS"],championName:'Delilah "Nickel-Slot" Kerr',championTitle:"Midway Trickster"},{stageId:"STAGE_08_SUNKEN_BATHYSPHERE",stageNumber:8,title:"Sunken Bathysphere",eraSubtitle:"Volcanic Basalt, Bronze Portholes & Caustics",difficultyBand:[8,8.5],symphonyTrack:"bathysphere_cathedral",episodes:[15,16],signatureBoardFamilies:["STEALTH_OPTICS_RADAR","ASTRAL_QUANTUM"],championName:"Dr. Henrik Lindholm",championTitle:"Abyssal Tactician"},{stageId:"STAGE_09_ASTRAL_OBSERVATORY",stageNumber:9,title:"Astral Observatory",eraSubtitle:"Copper Telescope Dome & Live Aurora",difficultyBand:[8.5,9.2],symphonyTrack:"astral_storm_presto",episodes:[17,18],signatureBoardFamilies:["ASTRAL_QUANTUM","RULE_BENDER_TWISTS"],championName:"Nadia Okafor-Voss",championTitle:"Quantum Sniper"},{stageId:"STAGE_10_SOVEREIGN_COLOSSEUM",stageNumber:10,title:"Sovereign Colosseum",eraSubtitle:"Nero Marble, Fire Braziers & 24k Altar",difficultyBand:[9,10],symphonyTrack:"colosseum_finale",episodes:[19,20],signatureBoardFamilies:["MONUMENT_INDUSTRIAL","RULE_BENDER_TWISTS"],championName:'Arthur "The Archivist" Pendelton',championTitle:"The $900k Retainer Boss"}],at=B.map(d=>d.stageId);function V(d){return B.find(t=>t.stageId===d)??B[0]}function it(d){const e=Math.max(1,Math.min(10,Math.round(d)));return B[e-1]}function X(d){const e=Math.max(1,Math.min(O,Math.round(d))),t=Math.floor((e-1)/2);return B[t]}function Se(d){return d>=2&&d%2===0}function R(d){const e=Math.max(1,Math.min(O,Math.round(d))),t=X(e),a=Se(e),[i,r]=t.difficultyBand,s=Number(((i+r)*.5).toFixed(2)),l=a?[s,r]:[i,s];return{episodeNumber:e,stageMeta:t,isTitleBout:a,episodeLabel:a?`EP ${String(e).padStart(2,"0")} • ${t.title.toUpperCase()} TITLE BOUT`:`EP ${String(e).padStart(2,"0")} • ${t.title.toUpperCase()} SHOWCASE`,turnCount:a?6:5,difficultyRange:l,basePurseCash:Math.round((450+t.stageNumber*180)*(a?1.6:1)),halftimeTurn:3}}const st=[{awardId:"trophy_01_vaudeville_curtain",kind:"TROPHY",name:"The Gilded Proscenium",engraving:"Stole the 1928 spotlight at Vaudeville Palace.",unlockRequirement:"Win Episode 02 (Vaudeville Palace Title Bout)",materialTier:"CAST_BRONZE",sculptArchetype:"PROSCENIUM_ARCH"},{awardId:"trophy_02_geneva_tourbillon",kind:"TROPHY",name:"The Geneva Tourbillon",engraving:"Out-timed Dr. Sabine Vogt under Swiss glass.",unlockRequirement:"Win Episode 04 (Geneva Conservatory Title Bout)",materialTier:"STERLING_SILVER",sculptArchetype:"TOURBILLON_CAGE"},{awardId:"trophy_03_monte_carlo_whale",kind:"TROPHY",name:"The Riviera High-Roller",engraving:"Broke Countess Mireille de Valois at her own felt.",unlockRequirement:"Win Episode 06 (Monte Carlo Salon Title Bout)",materialTier:"GOLD_24K",sculptArchetype:"CASINO_CROWN_STACK"},{awardId:"trophy_04_sextant_meridian",kind:"TROPHY",name:"Cartographer's Sextant",engraving:"Charted the Rotunda past Capt. Finch-Harrow.",unlockRequirement:"Win Episode 08 (Cartographic Rotunda Title Bout)",materialTier:"CAST_BRONZE",sculptArchetype:"BRASS_SEXTANT"},{awardId:"trophy_05_nixie_clearance",kind:"TROPHY",name:"Bunker Clearance 1969",engraving:"Cracked Walter Kowalski’s vault. 5th Relic Slot unlocked.",unlockRequirement:"Win Episode 10 (Analog Bunker Title Bout)",materialTier:"STERLING_SILVER",sculptArchetype:"NIXIE_OBELISK"},{awardId:"trophy_06_kintsugi_chalice",kind:"TROPHY",name:"The Kintsugi Chalice",engraving:"Turned fracture into gold past Kenzo Taniguchi.",unlockRequirement:"Win Episode 12 (Kyoto Lacquer Title Bout)",materialTier:"GOLD_24K",sculptArchetype:"KINTSUGI_VESSEL"},{awardId:"trophy_07_pier_calliope",kind:"TROPHY",name:"Midnight Pier Automaton",engraving:'Beat Delilah "Nickel-Slot" Kerr at the rigged midway.',unlockRequirement:"Win Episode 14 (Carnival Curiosities Title Bout)",materialTier:"CAST_BRONZE",sculptArchetype:"CALLIOPE_CREST"},{awardId:"trophy_08_abyssal_bell",kind:"TROPHY",name:"The Bathysphere Bell",engraving:"Outlasted Dr. Henrik Lindholm under ten atmospheres.",unlockRequirement:"Win Episode 16 (Sunken Bathysphere Title Bout)",materialTier:"STERLING_SILVER",sculptArchetype:"DIVING_BELL"},{awardId:"trophy_09_aurora_orrery",kind:"TROPHY",name:"The Aurora Armillary",engraving:"Aligned the dome above Nadia Okafor-Voss.",unlockRequirement:"Win Episode 18 (Astral Observatory Title Bout)",materialTier:"GOLD_24K",sculptArchetype:"ARMILLARY_SPHERE"},{awardId:"trophy_10_sovereign_crown",kind:"TROPHY",name:"Sovereign Mind Crown",engraving:"Dethroned Arthur Pendelton and triggered Clause 14-B.",unlockRequirement:"Win Episode 20 (Sovereign Colosseum Finale)",materialTier:"OBSIDIAN_RUBY",sculptArchetype:"SOVEREIGN_CROWN"},{awardId:"trophy_11_grand_collector",kind:"TROPHY",name:"Frankie's Contraband Wrench",engraving:"Filled all five backstage relic pedestals.",unlockRequirement:"Equip 5 Podium Relics simultaneously",materialTier:"GOLD_24K",sculptArchetype:"CONTRABAND_WRENCH"},{awardId:"trophy_12_perfect_broadcast",kind:"TROPHY",name:"Flawless Live Tape",engraving:"Not a single missed clue. Not one trapdoor drop.",unlockRequirement:"Win any Title Bout with 0 misses",materialTier:"OBSIDIAN_RUBY",sculptArchetype:"GOLDEN_MIC_STATUE"},{awardId:"medal_01_first_spotlight",kind:"MEDAL",name:"Opening Night Applause",engraving:"First clue nailed under live stage lamps.",unlockRequirement:"Answer 1 clue correctly",materialTier:"CAST_BRONZE",sculptArchetype:"SPOTLIGHT_RELIEF"},{awardId:"medal_02_uncut_detonator",kind:"MEDAL",name:"The Uncut Detonator",engraving:"Snipped three lies with steady wire-cutters.",unlockRequirement:"Clear a Defusal toy with >= 3.0s left",materialTier:"CLOISONNE_ENAMEL",sculptArchetype:"WIRE_CUTTER_MEDAL"},{awardId:"medal_03_pinpoint_navigator",kind:"MEDAL",name:"Bullseye Cartographer",engraving:"Dropped the ruby pin right on the ridge.",unlockRequirement:"Score >= 90% accuracy on an Atlas Spatial toy",materialTier:"CLOISONNE_ENAMEL",sculptArchetype:"GLOBE_PIN_MEDAL"},{awardId:"medal_04_safe_cracker",kind:"MEDAL",name:"Swiss Tumbler Ace",engraving:"Heard every brass tumbler click home.",unlockRequirement:"Solve a Dial or Cryptex Lock toy cleanly",materialTier:"STERLING_SILVER",sculptArchetype:"CRYPTEX_RING_MEDAL"},{awardId:"medal_05_lightning_paddle",kind:"MEDAL",name:"Spring-Paddle Reflex",engraving:"Faster than the stagehand buzzer.",unlockRequirement:"Clear a Rapid Paddles toy with >= 4.0s left",materialTier:"CLOISONNE_ENAMEL",sculptArchetype:"PADDLE_BOLT_MEDAL"},{awardId:"medal_06_ear_of_gold",kind:"MEDAL",name:"First-Chair Virtuoso",engraving:"Called the answer before the curtain rose.",unlockRequirement:"Solve a Progressive / Audio Reveal toy cleanly",materialTier:"GOLD_24K",sculptArchetype:"LYRE_CREST_MEDAL"},{awardId:"medal_07_balance_master",kind:"MEDAL",name:"Apothecary Equilibrium",engraving:"Balanced history to the brass gram.",unlockRequirement:"Clear a Wager Scale / Chronology toy cleanly",materialTier:"CAST_BRONZE",sculptArchetype:"SCALE_PAN_MEDAL"},{awardId:"medal_08_velvet_bluffer",kind:"MEDAL",name:"Monte Carlo Nerve",engraving:"Called the house bluff without blinking.",unlockRequirement:"Win a Casino Bluff Stakes toy",materialTier:"CLOISONNE_ENAMEL",sculptArchetype:"ROYAL_CHIP_MEDAL"},{awardId:"medal_09_forensic_eye",kind:"MEDAL",name:"Cold-Case Magnifier",engraving:"Spotted the invisible ink under UV.",unlockRequirement:"Solve a Forensic Detective toy cleanly",materialTier:"STERLING_SILVER",sculptArchetype:"LENS_SEAL_MEDAL"},{awardId:"medal_10_kinetic_tamer",kind:"MEDAL",name:"Contraption Whisperer",engraving:"Tamed pistons, prisms, and steam valves.",unlockRequirement:"Solve a Kinetic Contraption toy cleanly",materialTier:"CAST_BRONZE",sculptArchetype:"GEAR_PISTON_MEDAL"},{awardId:"medal_11_lie_buster",kind:"MEDAL",name:"Mind-Game Counterpunch",engraving:"Caught the rigged clue red-handed.",unlockRequirement:"Beat any Mind-Game Twist toy (91-100)",materialTier:"OBSIDIAN_RUBY",sculptArchetype:"SHATTERED_MASK_MEDAL"},{awardId:"medal_12_trapdoor_houdini",kind:"MEDAL",name:"Trapdoor Houdini",engraving:"Dropped into the pit and climbed back smiling.",unlockRequirement:"Survive your first 8s Stage Trapdoor Gambit",materialTier:"CLOISONNE_ENAMEL",sculptArchetype:"TRAPDOOR_KEY_MEDAL"},{awardId:"medal_13_nine_lives",kind:"MEDAL",name:"Pit Veteran",engraving:"Knows every gear down in the cellar.",unlockRequirement:"Survive 5 Trapdoor Gambits in your career",materialTier:"STERLING_SILVER",sculptArchetype:"CELLAR_COG_MEDAL"},{awardId:"medal_14_clutch_escape",kind:"MEDAL",name:"Last-Millisecond Latch",engraving:"Beat the closing latch with under 1.5s left.",unlockRequirement:"Survive a Trapdoor Gambit with < 1.5s remaining",materialTier:"GOLD_24K",sculptArchetype:"STOPWATCH_MEDAL"},{awardId:"medal_15_streak_five",kind:"MEDAL",name:"Standing Ovation x5",engraving:"Five straight answers; the balcony rose.",unlockRequirement:"Hit a 5-clue streak",materialTier:"STERLING_SILVER",sculptArchetype:"LAUREL_V_MEDAL"},{awardId:"medal_16_streak_ten",kind:"MEDAL",name:"Encore Phenomenon x10",engraving:"Ten straight hits; Julian tore up the script.",unlockRequirement:"Hit a 10-clue streak",materialTier:"GOLD_24K",sculptArchetype:"LAUREL_X_MEDAL"},{awardId:"medal_17_chain_breaker",kind:"MEDAL",name:"Iron-Chain Shatterer",engraving:"Snapped Rival chains off a locked vault.",unlockRequirement:"Claim a chain-locked board node",materialTier:"CAST_BRONZE",sculptArchetype:"BROKEN_LINK_MEDAL"},{awardId:"medal_18_twist_survivor",kind:"MEDAL",name:"Live-Broadcast Improviser",engraving:"Held the lead when the stage lights cut.",unlockRequirement:"Win an episode after a Halftime Twist Mutation",materialTier:"CLOISONNE_ENAMEL",sculptArchetype:"SIREN_BOLT_MEDAL"},{awardId:"medal_19_dirty_trickster",kind:"MEDAL",name:"Frankie's Apprentice",engraving:"Played three backstage Foil cards on air.",unlockRequirement:"Play 3 Foil Dirty-Trick Cards",materialTier:"CLOISONNE_ENAMEL",sculptArchetype:"FOIL_ACE_MEDAL"},{awardId:"medal_20_screw_turnabout",kind:"MEDAL",name:"Sweet Revenge Screw",engraving:"Gave the Rival a taste of their own rig.",unlockRequirement:"Trigger SCREW_RIVAL or STEAL_RIVAL_POT",materialTier:"OBSIDIAN_RUBY",sculptArchetype:"SCREW_DOME_MEDAL"},{awardId:"medal_21_bankroll_5k",kind:"MEDAL",name:"Prime-Time Bankroll",engraving:"Stacked $5,000 in broadcast purse chips.",unlockRequirement:"Hold at least $5,000 career bankroll",materialTier:"STERLING_SILVER",sculptArchetype:"BULLION_COIN_MEDAL"},{awardId:"medal_22_bankroll_25k",kind:"MEDAL",name:"Syndication Mogul",engraving:"Could buy the network out from under Sloane.",unlockRequirement:"Hold at least $25,000 career bankroll",materialTier:"GOLD_24K",sculptArchetype:"VAULT_INGOT_MEDAL"},{awardId:"medal_23_world_traveler",kind:"MEDAL",name:"Contraption Connoisseur",engraving:"Mastered ten distinct 3D studio boards.",unlockRequirement:"Play 10 unique boards across your career",materialTier:"STERLING_SILVER",sculptArchetype:"COMPASS_ROSE_MEDAL"},{awardId:"medal_24_century_mind",kind:"MEDAL",name:"Broadcast Centurion",engraving:"One hundred clues answered cleanly on air.",unlockRequirement:"Answer 100 clues correctly lifetime",materialTier:"OBSIDIAN_RUBY",sculptArchetype:"CENTURION_STAR_MEDAL"}];function ot(){if(typeof window>"u")return"ULTRA_3X";const d=typeof window.devicePixelRatio=="number"?window.devicePixelRatio:1,e=typeof navigator<"u"?navigator:void 0,t=typeof e?.hardwareConcurrency=="number"?e.hardwareConcurrency:4,a=e&&"deviceMemory"in e&&typeof e.deviceMemory=="number"?e.deviceMemory:4;return t<=2&&a<=2?"BATTERY_1X":t>=4||d>=2||a>=4?"ULTRA_3X":"HIGH_2X"}function Ae(){const d=ot(),e=typeof window<"u"&&typeof window.matchMedia=="function"&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;return{masterVolume:.85,symphonyVolume:.72,foleyVolume:.9,voiceVolume:.95,ambienceVolume:.5,autoVoiceDucking:!0,musicEnabled:!0,sfxEnabled:!0,resolutionTier:d,shadowQuality:d==="BATTERY_1X"?"SOFT_1024":"ULTRA_2048",cameraMotion:e?"REDUCED":"CINEMATIC",showFpsTelemetry:!1,textScale:1,thumbDock:"CENTER",colorVisionLens:"STANDARD",hapticsIntensity:"CRISP",timerPaceMode:"STANDARD"}}function P(){return{schemaVersion:ve,updatedAtIso:new Date().toISOString(),currentEpisode:1,highestEpisodeUnlocked:1,completedEpisodes:[],unlockedStageWorlds:["STAGE_01_VAUDEVILLE_PALACE"],bankrollCash:450,maxRelicSlots:4,ownedRelicIds:[],equippedRelicIds:[],heldFoilCards:[],unlockedAwardIds:[],pinnedPodiumMedalIds:[],options:Ae(),matchMemory:{episodeNumber:1,lastBoardId:"",lastToyId:"",lastActionTags:[],wonLastMatch:!1,survivedTrapdoorCount:0,maxStreakReached:0,bankrollCash:450,equippedRelicIds:[]},rotationHistory:{recentBoardIds:[],recentBoardFamilies:[],recentToyIds:[],recentToyFamilies:[],recentTrapdoorIds:[]},telemetry:{totalCluesAttempted:0,totalCluesCorrect:0,totalEpisodesPlayed:0,totalEpisodesWon:0,totalTrapdoorsEntered:0,totalTrapdoorsSurvived:0,fastestClutchTrapdoorSec:null,currentStreak:0,bestStreak:0,foilsPlayedCount:0,screwOrStealPlays:0,chainsBrokenCount:0,twistsSurvivedWins:0,peakBankrollCash:450,uniqueBoardIdsPlayed:[],uniqueToyIdsPlayed:[],toyFamiliesCleared:[],defusalFastClear:!1,atlasPinpointClear:!1,rapidPaddleFastClear:!1,flawlessTitleBoutWins:0}}}const rt=["ULTRA_3X","HIGH_2X","BATTERY_1X"],nt=["ULTRA_2048","SOFT_1024","OFF"],lt=["CINEMATIC","SUBTLE","REDUCED"],dt=["STANDARD","DEUTERANOPIA","PROTANOPIA","TRITANOPIA"],ct=["CENTER","LEFT_HAND","RIGHT_HAND"],ut=[.95,1,1.12],ht=new Set(at);function H(d,e){return typeof d!="number"||!Number.isFinite(d)?e:Math.max(0,Math.min(1,d))}function Ie(d){const e=Ae();if(!d||typeof d!="object")return e;const t=d,a=rt.includes(t.resolutionTier)?t.resolutionTier:e.resolutionTier,i=nt.includes(t.shadowQuality)?t.shadowQuality:e.shadowQuality,r=lt.includes(t.cameraMotion)?t.cameraMotion:e.cameraMotion,s=dt.includes(t.colorVisionLens)?t.colorVisionLens:e.colorVisionLens,l=ct.includes(t.thumbDock)?t.thumbDock:e.thumbDock,m=ut.includes(t.textScale)?t.textScale:e.textScale,g=t.hapticsIntensity==="OFF"||t.hapticsIntensity==="CRISP"||t.hapticsIntensity==="HEAVY"?t.hapticsIntensity:e.hapticsIntensity,h=t.timerPaceMode==="STANDARD"||t.timerPaceMode==="RELAXED_PLUS_4S"?t.timerPaceMode:e.timerPaceMode;return{masterVolume:H(t.masterVolume,e.masterVolume),symphonyVolume:H(t.symphonyVolume,e.symphonyVolume),foleyVolume:H(t.foleyVolume,e.foleyVolume),voiceVolume:H(t.voiceVolume,e.voiceVolume),ambienceVolume:H(t.ambienceVolume,e.ambienceVolume),autoVoiceDucking:typeof t.autoVoiceDucking=="boolean"?t.autoVoiceDucking:e.autoVoiceDucking,musicEnabled:typeof t.musicEnabled=="boolean"?t.musicEnabled:e.musicEnabled,sfxEnabled:typeof t.sfxEnabled=="boolean"?t.sfxEnabled:e.sfxEnabled,resolutionTier:a,shadowQuality:i,cameraMotion:r,showFpsTelemetry:typeof t.showFpsTelemetry=="boolean"?t.showFpsTelemetry:e.showFpsTelemetry,textScale:m,thumbDock:l,colorVisionLens:s,hapticsIntensity:g,timerPaceMode:h}}function L(d,e){if(!Array.isArray(d))return[];const t=new Set,a=[];for(const i of d)if(typeof i=="string"&&i.length>0&&!t.has(i)&&(t.add(i),a.push(i),e!==void 0&&a.length>=e))break;return a}function q(d,e,t){if(!e)return d;const a=d.filter(i=>i!==e);return a.push(e),a.length>t?a.slice(a.length-t):a}function pt(d){const e=P();if(!d||typeof d!="object")return e;const t=d,a=typeof t.highestEpisodeUnlocked=="number"&&Number.isFinite(t.highestEpisodeUnlocked)?Math.max(1,Math.min(O,Math.round(t.highestEpisodeUnlocked))):e.highestEpisodeUnlocked,i=typeof t.currentEpisode=="number"&&Number.isFinite(t.currentEpisode)?Math.max(1,Math.min(a,Math.round(t.currentEpisode))):e.currentEpisode,r=Array.isArray(t.completedEpisodes)?Array.from(new Set(t.completedEpisodes.filter(y=>typeof y=="number"&&Number.isFinite(y)).map(y=>Math.round(y)).filter(y=>y>=1&&y<=O))).sort((y,E)=>y-E):[],s=L(t.unlockedStageWorlds).filter(y=>ht.has(y));s.includes("STAGE_01_VAUDEVILLE_PALACE")||s.unshift("STAGE_01_VAUDEVILLE_PALACE");const l=X(a).stageId;s.includes(l)||s.push(l);const m=t.maxRelicSlots===5||r.includes(10)?5:4,g=typeof t.bankrollCash=="number"&&Number.isFinite(t.bankrollCash)?Math.max(0,Math.round(t.bankrollCash)):e.bankrollCash,h=L(t.ownedRelicIds),f=L(t.equippedRelicIds,m);for(const y of f)h.includes(y)||h.push(y);const T=Array.isArray(t.heldFoilCards)?t.heldFoilCards.filter(y=>!!y&&typeof y=="object"&&typeof y.cardId=="string"&&typeof y.name=="string"&&typeof y.effectKind=="string").slice(0,be):[],b=L(t.unlockedAwardIds),v=new Set(b),n=L(t.pinnedPodiumMedalIds,K).filter(y=>v.has(y)),o=t.matchMemory&&typeof t.matchMemory=="object"?t.matchMemory:{},c=t.rotationHistory&&typeof t.rotationHistory=="object"?t.rotationHistory:{},u=t.telemetry&&typeof t.telemetry=="object"?t.telemetry:{},p=(y,E=0)=>typeof y=="number"&&Number.isFinite(y)?Math.max(0,y):E;return{schemaVersion:ve,updatedAtIso:typeof t.updatedAtIso=="string"?t.updatedAtIso:new Date().toISOString(),currentEpisode:i,highestEpisodeUnlocked:a,completedEpisodes:r,unlockedStageWorlds:s,bankrollCash:g,maxRelicSlots:m,ownedRelicIds:h,equippedRelicIds:f,heldFoilCards:T,unlockedAwardIds:b,pinnedPodiumMedalIds:n,options:Ie(t.options),matchMemory:{episodeNumber:typeof o.episodeNumber=="number"&&Number.isFinite(o.episodeNumber)?Math.max(1,Math.min(O,Math.round(o.episodeNumber))):i,lastBoardId:typeof o.lastBoardId=="string"?o.lastBoardId:"",lastToyId:typeof o.lastToyId=="string"?o.lastToyId:"",lastActionTags:L(o.lastActionTags,12),wonLastMatch:typeof o.wonLastMatch=="boolean"?o.wonLastMatch:!1,survivedTrapdoorCount:Math.round(p(o.survivedTrapdoorCount,0)),maxStreakReached:Math.round(p(o.maxStreakReached,0)),bankrollCash:g,equippedRelicIds:[...f]},rotationHistory:{recentBoardIds:L(c.recentBoardIds).slice(-Te),recentBoardFamilies:Array.isArray(c.recentBoardFamilies)?c.recentBoardFamilies.filter(y=>typeof y=="string").slice(-3):[],recentToyIds:L(c.recentToyIds).slice(-Ee),recentToyFamilies:Array.isArray(c.recentToyFamilies)?c.recentToyFamilies.filter(y=>typeof y=="string").slice(-2):[],recentTrapdoorIds:L(c.recentTrapdoorIds).slice(-_e)},telemetry:{totalCluesAttempted:Math.round(p(u.totalCluesAttempted)),totalCluesCorrect:Math.round(p(u.totalCluesCorrect)),totalEpisodesPlayed:Math.round(p(u.totalEpisodesPlayed)),totalEpisodesWon:Math.round(p(u.totalEpisodesWon)),totalTrapdoorsEntered:Math.round(p(u.totalTrapdoorsEntered)),totalTrapdoorsSurvived:Math.round(p(u.totalTrapdoorsSurvived)),fastestClutchTrapdoorSec:typeof u.fastestClutchTrapdoorSec=="number"&&Number.isFinite(u.fastestClutchTrapdoorSec)?u.fastestClutchTrapdoorSec:null,currentStreak:Math.round(p(u.currentStreak)),bestStreak:Math.round(p(u.bestStreak)),foilsPlayedCount:Math.round(p(u.foilsPlayedCount)),screwOrStealPlays:Math.round(p(u.screwOrStealPlays)),chainsBrokenCount:Math.round(p(u.chainsBrokenCount)),twistsSurvivedWins:Math.round(p(u.twistsSurvivedWins)),peakBankrollCash:Math.max(g,Math.round(p(u.peakBankrollCash,g))),uniqueBoardIdsPlayed:L(u.uniqueBoardIdsPlayed),uniqueToyIdsPlayed:L(u.uniqueToyIdsPlayed),toyFamiliesCleared:Array.isArray(u.toyFamiliesCleared)?Array.from(new Set(u.toyFamiliesCleared.filter(y=>typeof y=="string"))):[],defusalFastClear:!!u.defusalFastClear,atlasPinpointClear:!!u.atlasPinpointClear,rapidPaddleFastClear:!!u.rapidPaddleFastClear,flawlessTitleBoutWins:Math.round(p(u.flawlessTitleBoutWins))}}}class Ce{storageKey;storage;state;listeners=new Set;externalAwardsById=new Map;constructor(e,t=tt){this.storageKey=t,e!==void 0?this.storage=e:typeof window<"u"&&typeof window.localStorage<"u"?this.storage=window.localStorage:this.storage=null;for(const a of st)this.externalAwardsById.set(a.awardId,a);this.state=this.loadFromStorage()}getState(){return this.state}getOptions(){return this.state.options}getMatchMemory(){return this.state.matchMemory}subscribe(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}getAwardCatalog(){return Array.from(this.externalAwardsById.values())}registerExternalAwards(e){for(const t of e)this.externalAwardsById.set(t.awardId,t)}loadFromStorage(){if(!this.storage)return P();try{const e=this.storage.getItem(this.storageKey);if(!e)return P();const t=JSON.parse(e);return pt(t)}catch{return P()}}save(){if(this.state.updatedAtIso=new Date().toISOString(),this.state.matchMemory.bankrollCash=this.state.bankrollCash,this.state.matchMemory.equippedRelicIds=[...this.state.equippedRelicIds],this.state.matchMemory.episodeNumber=this.state.currentEpisode,this.storage)try{this.storage.setItem(this.storageKey,JSON.stringify(this.state))}catch{}for(const e of this.listeners)try{e(this.state)}catch{}}isStageUnlocked(e){return this.state.unlockedStageWorlds.includes(e)}setCurrentEpisode(e){const t=Math.max(1,Math.min(this.state.highestEpisodeUnlocked,Math.round(e)));this.state.currentEpisode=t,this.state.matchMemory.episodeNumber=t,this.save()}unlockStageWorld(e){this.state.unlockedStageWorlds.includes(e)||(this.state.unlockedStageWorlds.push(e),this.save())}recordEpisodeOutcome(e){const t=Math.max(1,Math.min(O,Math.round(e.episodeNumber))),a=Se(t);let i=null,r=!1;if(this.state.telemetry.totalEpisodesPlayed+=1,this.state.matchMemory.wonLastMatch=e.won,this.state.matchMemory.episodeNumber=t,e.boardId&&(this.state.matchMemory.lastBoardId=e.boardId),e.actionTags&&e.actionTags.length>0)for(const m of e.actionTags)this.pushActionTag(m,!1);const s=Math.max(0,Math.round(e.cashEarned));if(this.state.bankrollCash+=s,this.state.bankrollCash>this.state.telemetry.peakBankrollCash&&(this.state.telemetry.peakBankrollCash=this.state.bankrollCash),e.won){if(this.state.telemetry.totalEpisodesWon+=1,this.state.completedEpisodes.includes(t)||(this.state.completedEpisodes.push(t),this.state.completedEpisodes.sort((m,g)=>m-g)),e.hadActiveTwist&&(this.state.telemetry.twistsSurvivedWins+=1),a&&e.episodeMisses===0&&(this.state.telemetry.flawlessTitleBoutWins+=1),t<O){const m=t+1;m>this.state.highestEpisodeUnlocked&&(this.state.highestEpisodeUnlocked=m),this.state.currentEpisode=m;const g=X(m).stageId;this.state.unlockedStageWorlds.includes(g)||(this.state.unlockedStageWorlds.push(g),i=g)}t===10&&this.state.maxRelicSlots<5&&(this.state.maxRelicSlots=5,r=!0,this.pushActionTag("unlocked_relic_slot_5",!1)),this.pushActionTag(`won_ep_${String(t).padStart(2,"0")}`,!1)}else this.pushActionTag(`lost_ep_${String(t).padStart(2,"0")}`,!1);const l=this.evaluateAndUnlockAwards({kind:"EPISODE_FINISHED",episodeNumber:t,isTitleBout:a,wonEpisode:e.won,episodeMisses:e.episodeMisses,hadActiveTwist:e.hadActiveTwist});return this.save(),{newlyUnlockedAwards:l,unlockedStage:i,expandedRelicSlots:r}}adjustBankroll(e){return this.state.bankrollCash=Math.max(0,Math.round(this.state.bankrollCash+e)),this.state.bankrollCash>this.state.telemetry.peakBankrollCash&&(this.state.telemetry.peakBankrollCash=this.state.bankrollCash),this.evaluateAndUnlockAwards({kind:"RELIC_UPDATED"}),this.save(),this.state.bankrollCash}expandRelicSlots(e=0){return this.state.maxRelicSlots>=5||e>0&&this.state.bankrollCash<e?!1:(this.state.bankrollCash=Math.max(0,this.state.bankrollCash-e),this.state.maxRelicSlots=5,this.pushActionTag("unlocked_relic_slot_5",!1),this.save(),!0)}purchaseAndEquipRelic(e,t){if(!e||this.state.bankrollCash<t)return{ok:!1,newlyUnlockedAwards:[]};this.state.ownedRelicIds.includes(e)||(this.state.bankrollCash-=Math.max(0,Math.round(t)),this.state.ownedRelicIds.push(e)),!this.state.equippedRelicIds.includes(e)&&this.state.equippedRelicIds.length<this.state.maxRelicSlots&&this.state.equippedRelicIds.push(e),this.pushActionTag(`equipped_${e}`,!1);const a=this.evaluateAndUnlockAwards({kind:"RELIC_UPDATED"});return this.save(),{ok:!0,newlyUnlockedAwards:a}}equipRelic(e){if(!e)return{ok:!1,newlyUnlockedAwards:[]};if(this.state.ownedRelicIds.includes(e)||this.state.ownedRelicIds.push(e),this.state.equippedRelicIds.includes(e))return{ok:!0,newlyUnlockedAwards:[]};if(this.state.equippedRelicIds.length>=this.state.maxRelicSlots)return{ok:!1,newlyUnlockedAwards:[]};this.state.equippedRelicIds.push(e);const t=this.evaluateAndUnlockAwards({kind:"RELIC_UPDATED"});return this.save(),{ok:!0,newlyUnlockedAwards:t}}unequipRelic(e){const t=this.state.equippedRelicIds.indexOf(e);return t===-1?!1:(this.state.equippedRelicIds.splice(t,1),this.save(),!0)}reorderEquippedRelics(e,t){const a=this.state.equippedRelicIds;if(e<0||e>=a.length||t<0||t>=a.length||e===t)return[...a];const[i]=a.splice(e,1);return a.splice(t,0,i),this.pushActionTag("reordered_relic_slots",!1),this.save(),[...a]}setEquippedRelicOrder(e){const t=e.filter(i=>this.state.equippedRelicIds.includes(i)),a=this.state.equippedRelicIds.filter(i=>!t.includes(i));return this.state.equippedRelicIds=[...t,...a].slice(0,this.state.maxRelicSlots),this.save(),[...this.state.equippedRelicIds]}addFoilCard(e,t=0){return this.state.heldFoilCards.length>=be||t>0&&this.state.bankrollCash<t?!1:(this.state.bankrollCash=Math.max(0,this.state.bankrollCash-Math.round(t)),this.state.heldFoilCards.push({...e}),this.pushActionTag(`bought_foil_${e.effectKind.toLowerCase()}`,!1),this.save(),!0)}consumeFoilCard(e){const t=this.state.heldFoilCards.findIndex(r=>r.cardId===e);if(t===-1)return{card:null,newlyUnlockedAwards:[]};const[a]=this.state.heldFoilCards.splice(t,1);this.state.telemetry.foilsPlayedCount+=1,(a.effectKind==="SCREW_RIVAL"||a.effectKind==="STEAL_RIVAL_POT")&&(this.state.telemetry.screwOrStealPlays+=1),this.pushActionTag(`played_foil_${a.effectKind.toLowerCase()}`,!1);const i=this.evaluateAndUnlockAwards({kind:"FOIL_PLAYED",foilEffectKind:a.effectKind});return this.save(),{card:a,newlyUnlockedAwards:i}}pushActionTag(e,t=!0){e&&(this.state.matchMemory.lastActionTags=q(this.state.matchMemory.lastActionTags,e,12),t&&this.save())}recordClueResolution(e){const{toy:t,resolution:a,brokeLockedChain:i}=e;this.state.telemetry.totalCluesAttempted+=1,this.recordToyPlayed(t.toyId,t.family,!1),a.specificActionTag&&this.pushActionTag(a.specificActionTag,!1),a.correct&&(this.state.telemetry.totalCluesCorrect+=1,this.state.telemetry.currentStreak+=1,this.state.telemetry.currentStreak>this.state.telemetry.bestStreak&&(this.state.telemetry.bestStreak=this.state.telemetry.currentStreak),this.state.telemetry.bestStreak>this.state.matchMemory.maxStreakReached&&(this.state.matchMemory.maxStreakReached=this.state.telemetry.bestStreak),this.state.telemetry.toyFamiliesCleared.includes(t.family)||this.state.telemetry.toyFamiliesCleared.push(t.family),t.family==="DEFUSAL_ELIMINATION"&&a.secondsRemaining>=3&&(this.state.telemetry.defusalFastClear=!0),t.family==="ATLAS_RELIEF_SPATIAL"&&a.accuracyRatio>=.9&&(this.state.telemetry.atlasPinpointClear=!0),t.family==="RAPID_PADDLES_REFLEX"&&a.secondsRemaining>=4&&(this.state.telemetry.rapidPaddleFastClear=!0),i&&(this.state.telemetry.chainsBrokenCount+=1,this.pushActionTag("shattered_iron_chains",!1)));const r=this.evaluateAndUnlockAwards({kind:"CLUE_RESOLVED",toyFamily:t.family,toyNumber:t.toyNumber,toyResolution:a,brokeLockedChain:i});return this.save(),r}recordTrapdoorResult(e){this.state.telemetry.totalTrapdoorsEntered+=1,this.recordTrapdoorPlayed(e.trapdoorId,!1),e.survived?(this.state.telemetry.totalTrapdoorsSurvived+=1,this.state.matchMemory.survivedTrapdoorCount+=1,(this.state.telemetry.fastestClutchTrapdoorSec===null||e.secondsRemaining<this.state.telemetry.fastestClutchTrapdoorSec)&&(this.state.telemetry.fastestClutchTrapdoorSec=e.secondsRemaining),this.pushActionTag(e.secondsRemaining<1.5?"trapdoor_clutch":"trapdoor_survived",!1)):(this.state.telemetry.currentStreak=0,this.pushActionTag("trapdoor_fell",!1));const t=this.evaluateAndUnlockAwards({kind:"TRAPDOOR_RESOLVED",trapdoorSurvived:e.survived,trapdoorSecondsRemaining:e.secondsRemaining});return this.save(),t}recordBoardPlayed(e,t,a=!0){e&&(this.state.matchMemory.lastBoardId=e,this.state.rotationHistory.recentBoardIds=q(this.state.rotationHistory.recentBoardIds,e,Te),t&&(this.state.rotationHistory.recentBoardFamilies=[...this.state.rotationHistory.recentBoardFamilies.filter(i=>i!==t),t].slice(-3)),this.state.telemetry.uniqueBoardIdsPlayed.includes(e)||this.state.telemetry.uniqueBoardIdsPlayed.push(e),a&&(this.evaluateAndUnlockAwards({kind:"RELIC_UPDATED"}),this.save()))}recordToyPlayed(e,t,a=!0){e&&(this.state.matchMemory.lastToyId=e,this.state.rotationHistory.recentToyIds=q(this.state.rotationHistory.recentToyIds,e,Ee),t&&(this.state.rotationHistory.recentToyFamilies=[...this.state.rotationHistory.recentToyFamilies,t].slice(-2)),this.state.telemetry.uniqueToyIdsPlayed.includes(e)||this.state.telemetry.uniqueToyIdsPlayed.push(e),a&&this.save())}recordTrapdoorPlayed(e,t=!0){e&&(this.state.rotationHistory.recentTrapdoorIds=q(this.state.rotationHistory.recentTrapdoorIds,e,_e),t&&this.save())}selectNextBoard(e,t,a=Math.random){if(e.length===0)throw new Error("CareerSaveStoreV6.selectNextBoard requires at least 1 candidate board.");if(e.length===1)return e[0];const i=this.state.matchMemory.lastBoardId,r=new Set(this.state.rotationHistory.recentBoardIds),s=this.state.rotationHistory.recentBoardFamilies[this.state.rotationHistory.recentBoardFamilies.length-1],l=f=>{const T=Math.floor(Math.max(0,Math.min(.999999,a()))*f.length);return f[T]};if(t){const f=e.filter(v=>v.signatureStage===t&&v.boardId!==i&&!r.has(v.boardId)&&v.family!==s);if(f.length>0)return l(f);const T=e.filter(v=>v.signatureStage===t&&v.boardId!==i&&!r.has(v.boardId));if(T.length>0)return l(T);const b=e.filter(v=>v.signatureStage===t&&v.boardId!==i);if(b.length>0)return l(b)}const m=e.filter(f=>f.boardId!==i&&!r.has(f.boardId)&&f.family!==s);if(m.length>0)return l(m);const g=e.filter(f=>f.boardId!==i&&!r.has(f.boardId));if(g.length>0)return l(g);const h=e.filter(f=>f.boardId!==i);return l(h.length>0?h:e)}selectNextToy(e,t){if(e.length===0)throw new Error("CareerSaveStoreV6.selectNextToy requires at least 1 candidate toy.");if(e.length===1)return e[0];const a=t?.rng??Math.random,i=this.state.matchMemory.lastToyId,r=new Set(this.state.rotationHistory.recentToyIds),s=this.state.rotationHistory.recentToyFamilies[this.state.rotationHistory.recentToyFamilies.length-1],l=t?.allowedFamilies&&t.allowedFamilies.length>0?e.filter(n=>t.allowedFamilies.includes(n.family)):e,m=l.length>0?l:e,g=n=>{const o=Math.floor(Math.max(0,Math.min(.999999,a()))*n.length);return n[o]},h=n=>t?.preferTwist===void 0?!0:n.isTwistToy===t.preferTwist,f=m.filter(n=>h(n)&&n.toyId!==i&&!r.has(n.toyId)&&n.family!==s);if(f.length>0)return g(f);const T=m.filter(n=>n.toyId!==i&&!r.has(n.toyId)&&n.family!==s);if(T.length>0)return g(T);const b=m.filter(n=>n.toyId!==i&&!r.has(n.toyId));if(b.length>0)return g(b);const v=m.filter(n=>n.toyId!==i);return g(v.length>0?v:m)}selectNextTrapdoorId(e,t=Math.random){if(e.length===0)return"trapdoor_01_rock_bands";const a=new Set(this.state.rotationHistory.recentTrapdoorIds),i=this.state.rotationHistory.recentTrapdoorIds[this.state.rotationHistory.recentTrapdoorIds.length-1],r=e.filter(m=>!a.has(m)&&m!==i),s=r.length>0?r:e.filter(m=>m!==i),l=s.length>0?s:e;return l[Math.floor(Math.max(0,Math.min(.999999,t()))*l.length)]}evaluateAndUnlockAwards(e){const t=this.state.telemetry,a=new Set(this.state.completedEpisodes),i=new Set(t.toyFamiliesCleared),r=[],s=(l,m)=>{if(!m||this.state.unlockedAwardIds.includes(l))return;this.state.unlockedAwardIds.push(l);const g=this.externalAwardsById.get(l);g&&(r.push(g),g.kind==="MEDAL"&&this.state.pinnedPodiumMedalIds.length<K&&this.state.pinnedPodiumMedalIds.push(l))};return s("trophy_01_vaudeville_curtain",a.has(2)),s("trophy_02_geneva_tourbillon",a.has(4)),s("trophy_03_monte_carlo_whale",a.has(6)),s("trophy_04_sextant_meridian",a.has(8)),s("trophy_05_nixie_clearance",a.has(10)),s("trophy_06_kintsugi_chalice",a.has(12)),s("trophy_07_pier_calliope",a.has(14)),s("trophy_08_abyssal_bell",a.has(16)),s("trophy_09_aurora_orrery",a.has(18)),s("trophy_10_sovereign_crown",a.has(20)),s("trophy_11_grand_collector",this.state.equippedRelicIds.length>=5),s("trophy_12_perfect_broadcast",t.flawlessTitleBoutWins>=1),s("medal_01_first_spotlight",t.totalCluesCorrect>=1),s("medal_02_uncut_detonator",t.defusalFastClear),s("medal_03_pinpoint_navigator",t.atlasPinpointClear),s("medal_04_safe_cracker",i.has("DIALS_CRYPTEX_LOCKS")),s("medal_05_lightning_paddle",t.rapidPaddleFastClear),s("medal_06_ear_of_gold",i.has("PROGRESSIVE_AUDIO_REVEAL")),s("medal_07_balance_master",i.has("WAGER_SCALE_CHRONOLOGY")),s("medal_08_velvet_bluffer",i.has("CASINO_BLUFF_STAKES")),s("medal_09_forensic_eye",i.has("FORENSIC_DETECTIVE")),s("medal_10_kinetic_tamer",i.has("KINETIC_CONTRAPTIONS")),s("medal_11_lie_buster",i.has("MIND_GAME_TWISTS")||!!(e?.toyNumber&&e.toyNumber>=91&&e.toyResolution?.correct)),s("medal_12_trapdoor_houdini",t.totalTrapdoorsSurvived>=1),s("medal_13_nine_lives",t.totalTrapdoorsSurvived>=5),s("medal_14_clutch_escape",t.fastestClutchTrapdoorSec!==null&&t.fastestClutchTrapdoorSec<1.5),s("medal_15_streak_five",t.bestStreak>=5),s("medal_16_streak_ten",t.bestStreak>=10),s("medal_17_chain_breaker",t.chainsBrokenCount>=1),s("medal_18_twist_survivor",t.twistsSurvivedWins>=1),s("medal_19_dirty_trickster",t.foilsPlayedCount>=3),s("medal_20_screw_turnabout",t.screwOrStealPlays>=1),s("medal_21_bankroll_5k",t.peakBankrollCash>=5e3),s("medal_22_bankroll_25k",t.peakBankrollCash>=25e3),s("medal_23_world_traveler",t.uniqueBoardIdsPlayed.length>=10),s("medal_24_century_mind",t.totalCluesCorrect>=100),r}setPinnedPodiumMedals(e){const t=new Set(this.state.unlockedAwardIds),a=Array.from(new Set(e.filter(i=>t.has(i)))).slice(0,K);return this.state.pinnedPodiumMedalIds=a,this.save(),[...a]}togglePinnedPodiumMedal(e){if(!this.state.unlockedAwardIds.includes(e))return[...this.state.pinnedPodiumMedalIds];const t=this.state.pinnedPodiumMedalIds.indexOf(e);return t!==-1?this.state.pinnedPodiumMedalIds.splice(t,1):this.state.pinnedPodiumMedalIds.length<K?this.state.pinnedPodiumMedalIds.push(e):(this.state.pinnedPodiumMedalIds.shift(),this.state.pinnedPodiumMedalIds.push(e)),this.save(),[...this.state.pinnedPodiumMedalIds]}updateOptions(e){return this.state.options=Ie({...this.state.options,...e}),this.save(),{...this.state.options}}resetCampaignProgress(){const e=P();this.state={...e,options:{...this.state.options},unlockedAwardIds:[...this.state.unlockedAwardIds],pinnedPodiumMedalIds:[...this.state.pinnedPodiumMedalIds],rotationHistory:{...this.state.rotationHistory},telemetry:{...this.state.telemetry,currentStreak:0}},this.save()}resetAllCareerData(e=!0){const t={...this.state.options};if(this.state=P(),e&&(this.state.options=t),this.storage)try{this.storage.removeItem(this.storageKey)}catch{}this.save()}}const he={STAGE_01_VAUDEVILLE_PALACE:{stageId:"STAGE_01_VAUDEVILLE_PALACE",stageNumber:1,championId:"rival_01_barnaby",displayName:'Barnaby "Two-Takes" Vance',titleTag:"1928 Matinee Showman",signatureArchetypes:["CONCENTRIC_RINGS","HEX_TURF_BRIDGE","CARNIVAL_SHOOTING_GALLERY"],baseAccuracy:.56,weights:{chipGreed:.85,multGreed:.35,graphCutAggression:.25,clusterBuild:.3,ringAlignmentFocus:.4,innerCorePriority:.35,casinoRiskAppetite:.65,trapAwareness:.35},chainLockChance:0,maxChainLocksPerMatch:0,bluffChance:.1,splitVsStealCooperateRate:.72,bluffTellHint:"Tips his straw boater twice before switching picks.",introQuips:["Hit my good side, kid. Sloane promised me two takes.","Broadway lights favor a profile, not a parking-lot rookie."],claimQuips:["Still got it! Somebody tell the balcony to keep clapping.","Clean take, no cue cards. Mostly."],chainLockQuips:["House rules, kid—don’t blame the headliner."],bluffQuips:["Misdirection! Classic third-act Vaudeville!"],missQuips:["Cut! That bulb buzzed right in my eyeline!","Okay, keep rolling—nobody in the mezzanine heard that."]},STAGE_02_GENEVA_CONSERVATORY:{stageId:"STAGE_02_GENEVA_CONSERVATORY",stageNumber:2,championId:"rival_02_sabine",displayName:"Dr. Sabine Vogt",titleTag:"Horological Precisionist",signatureArchetypes:["CONCENTRIC_RINGS","BALANCE_SCALE","PENDULUM_BRIDGE"],baseAccuracy:.62,weights:{chipGreed:.5,multGreed:.72,graphCutAggression:.4,clusterBuild:.5,ringAlignmentFocus:.95,innerCorePriority:.6,casinoRiskAppetite:.2,trapAwareness:.75},chainLockChance:.14,maxChainLocksPerMatch:1,bluffChance:.12,splitVsStealCooperateRate:.65,bluffTellHint:"Taps her pocket chronometer when feinting outer gears.",introQuips:["Your timing drifts by four hundred milliseconds. Let us begin.","Every gear on this stage obeys torque, not luck."],claimQuips:["Aligned to the ruby jewel. Exactly on beat.","Precision beats theatre every single broadcast."],chainLockQuips:["Escapement pinned. Try forcing that gear now."],bluffQuips:["A calibrated feint. You watched the wrong wheel."],missQuips:["Unacceptable drift. Who greased this main spring?","A half-tooth off. Recalibrating immediately."]},STAGE_03_MONTE_CARLO_SALON:{stageId:"STAGE_03_MONTE_CARLO_SALON",stageNumber:3,championId:"rival_03_mireille",displayName:"Countess Mireille de Valois",titleTag:"Riviera High-Roller",signatureArchetypes:["BLACKJACK_21_FELT","SHELL_MONTE_BLUFF","MINESWEEPER_VAULTS"],baseAccuracy:.66,weights:{chipGreed:.78,multGreed:.82,graphCutAggression:.45,clusterBuild:.35,ringAlignmentFocus:.5,innerCorePriority:.55,casinoRiskAppetite:.96,trapAwareness:.62},chainLockChance:.18,maxChainLocksPerMatch:1,bluffChance:.34,splitVsStealCooperateRate:.35,bluffTellHint:"Tilts her champagne coupe whenever her bid is empty.",introQuips:["Darling, Meridian’s chips feel so delightfully cheap tonight.","Push your luck, please. I adore watching amateurs bust at twenty-two."],claimQuips:["Twenty-one on velvet. Pour another glass, Julian.","The house rarely loses when I hold the shoe."],chainLockQuips:["VIP velvet rope—this table is reserved, chéri."],bluffQuips:["You bit on the decoy chip? Oh, how charming."],missQuips:["Tragic shoe. Frankie, check those cards for fingerprints.","A minor setback. The Riviera forgives bold bets."]},STAGE_04_CARTOGRAPHIC_ROTUNDA:{stageId:"STAGE_04_CARTOGRAPHIC_ROTUNDA",stageNumber:4,championId:"rival_04_alistair",displayName:"Capt. Alistair Finch-Harrow",titleTag:"Meridian Bridge-Cutter",signatureArchetypes:["HEX_TURF_BRIDGE","SUBWAY_NETWORK","PENDULUM_BRIDGE"],baseAccuracy:.7,weights:{chipGreed:.45,multGreed:.55,graphCutAggression:.95,clusterBuild:.82,ringAlignmentFocus:.55,innerCorePriority:.65,casinoRiskAppetite:.4,trapAwareness:.72},chainLockChance:.24,maxChainLocksPerMatch:1,bluffChance:.18,splitVsStealCooperateRate:.52,bluffTellHint:"Squints north on the brass sextant before swinging east.",introQuips:["Control the narrows and the whole archipelago surrenders.","Sloane bought me a brass globe; I intend to keep it."],claimQuips:["Channel sealed. Find another crossing, sailor.","Two bridges linked—my supply line holds firm."],chainLockQuips:["Harbor chain raised! Good luck getting past that chokepoint."],bluffQuips:["False bearing! Never trust a rival’s chart."],missQuips:["Magnetic anomaly on this deck! Who moved the compass?","Hit a shoal. Re-plotting course."]},STAGE_05_ANALOG_BUNKER_1969:{stageId:"STAGE_05_ANALOG_BUNKER_1969",stageNumber:5,championId:"rival_05_walter",displayName:'Walter "Redline" Kowalski',titleTag:"1969 Signal Saboteur",signatureArchetypes:["LASER_MIRROR_GRID","SONAR_RADAR_SWEEP","CONVEYOR_FACTORY"],baseAccuracy:.73,weights:{chipGreed:.52,multGreed:.68,graphCutAggression:.86,clusterBuild:.58,ringAlignmentFocus:.68,innerCorePriority:.72,casinoRiskAppetite:.45,trapAwareness:.88},chainLockChance:.42,maxChainLocksPerMatch:2,bluffChance:.28,splitVsStealCooperateRate:.28,bluffTellHint:"Flicks the amber Nixie breaker twice on a fake target.",introQuips:["Signal locked. I’ve got two iron chains with your name stamped.","Nobody clears Floor Five without burning a breaker."],claimQuips:["Relay hijacked. Watch your phosphor screen go dark.","Clean intercept. Meridian pays overtime for results."],chainLockQuips:["Bolt thrown! Try chewing through cold-rolled bunker steel."],bluffQuips:["Ghost blip on your radar—fell for it hook and line."],missQuips:["Static burst! Frankie’s messing with my patch cables again!","Bad telemetry. Re-zeroing the scope."]},STAGE_06_KYOTO_LACQUER_PAVILION:{stageId:"STAGE_06_KYOTO_LACQUER_PAVILION",stageNumber:6,championId:"rival_06_kenzo",displayName:"Kenzo Taniguchi",titleTag:"Kintsugi Web Tactician",signatureArchetypes:["HEX_TURF_BRIDGE","DOMINO_CHAIN","STEPPED_PYRAMID"],baseAccuracy:.76,weights:{chipGreed:.48,multGreed:.76,graphCutAggression:.78,clusterBuild:.96,ringAlignmentFocus:.62,innerCorePriority:.7,casinoRiskAppetite:.3,trapAwareness:.85},chainLockChance:.28,maxChainLocksPerMatch:1,bluffChance:.22,splitVsStealCooperateRate:.58,bluffTellHint:"Folds his fan silently when setting an indirect stone.",introQuips:["You chase bright tiles. I surround the quiet intersections.","One fracture in your cluster, and the lacquer belongs to me."],claimQuips:["Four stones joined. Feel the board tighten.","Patience pays compound interest on Turn Five."],chainLockQuips:["A single golden seam seals that intersection."],bluffQuips:["You guarded the blossom and left the root bare."],missQuips:["A hasty brush stroke. Even masters crack the glaze.","Well defended. I respect steady hands."]},STAGE_07_CARNIVAL_CURIOSITIES:{stageId:"STAGE_07_CARNIVAL_CURIOSITIES",stageNumber:7,championId:"rival_07_delilah",displayName:'Delilah "Nickel-Slot" Kerr',titleTag:"Midnight Pier Hustler",signatureArchetypes:["PINBALL_DROP","FERRIS_WHEEL","CARNIVAL_SHOOTING_GALLERY"],baseAccuracy:.79,weights:{chipGreed:.82,multGreed:.78,graphCutAggression:.65,clusterBuild:.52,ringAlignmentFocus:.65,innerCorePriority:.55,casinoRiskAppetite:.92,trapAwareness:.78},chainLockChance:.3,maxChainLocksPerMatch:2,bluffChance:.35,splitVsStealCooperateRate:.25,bluffTellHint:"Spins a copper token on her knuckles before a switch.",introQuips:["Step right up, mark! Every bumper on this pier tilts my way.","Sloane thinks this stage is condemned—I call it rent-free."],claimQuips:["Ding-ding-ding! Keep the plush bear, I’ll take your multiplier.","Bounced off three brass bumpers straight into my pocket!"],chainLockQuips:["Padlocked the prize booth! Better bring a Foil card."],bluffQuips:["Looked at the Ferris wheel while I picked your pocket!"],missQuips:["Hey! Somebody leveled the tilt sensor on my pinball deck!","Oof—gutter ball. Next token’s mine."]},STAGE_08_SUNKEN_BATHYSPHERE:{stageId:"STAGE_08_SUNKEN_BATHYSPHERE",stageNumber:8,championId:"rival_08_henrik",displayName:"Dr. Henrik Lindholm",titleTag:"Abyssal Pressure Tactician",signatureArchetypes:["SONAR_RADAR_SWEEP","ELEVATOR_SHAFTS","MINESWEEPER_VAULTS"],baseAccuracy:.81,weights:{chipGreed:.58,multGreed:.8,graphCutAggression:.8,clusterBuild:.76,ringAlignmentFocus:.7,innerCorePriority:.98,casinoRiskAppetite:.38,trapAwareness:.92},chainLockChance:.34,maxChainLocksPerMatch:2,bluffChance:.2,splitVsStealCooperateRate:.44,bluffTellHint:"Checks the brass depth gauge twice when feinting shallow.",introQuips:["Outer rings flood first. Smart divers claim the bulkhead core.","At four thousand meters, panic burns oxygen fast."],claimQuips:["Inner hatch secured. Let the tide take the perimeter.","Zero bubbles wasted. Pressure favors discipline."],chainLockQuips:["Bulkhead dogged shut. Go swim for another node."],bluffQuips:["Sonar echo. You chased a shadow in the trench."],missQuips:["Hull groan threw off my readout. Stabilizing.","Minor valve leak. Still well ahead of crush depth."]},STAGE_09_ASTRAL_OBSERVATORY:{stageId:"STAGE_09_ASTRAL_OBSERVATORY",stageNumber:9,championId:"rival_09_nadia",displayName:"Nadia Okafor-Voss",titleTag:"Optical & Quantum Sniper",signatureArchetypes:["ASTRAL_CONSTELLATION","PRISM_SPLITTER","LASER_MIRROR_GRID"],baseAccuracy:.84,weights:{chipGreed:.62,multGreed:.96,graphCutAggression:.84,clusterBuild:.72,ringAlignmentFocus:.92,innerCorePriority:.82,casinoRiskAppetite:.55,trapAwareness:.94},chainLockChance:.35,maxChainLocksPerMatch:2,bluffChance:.26,splitVsStealCooperateRate:.4,bluffTellHint:"Tilts the brass prism lens when masking an entangled flip.",introQuips:["Why claim one star when optical coupling hands me two?","Your multiplier curve is cute. Watch what refraction does."],claimQuips:["Twin-linked flip! That prism practically sang.","Refracted straight through your lead."],chainLockQuips:["Aperture shutter closed on your favorite multiplier."],bluffQuips:["Wave-function collapsed somewhere else. Surprise."],missQuips:["Atmospheric shimmer! Close the north dome louver!","Parallax error—won’t happen twice under this aurora."]},STAGE_10_SOVEREIGN_COLOSSEUM:{stageId:"STAGE_10_SOVEREIGN_COLOSSEUM",stageNumber:10,championId:"rival_10_arthur",displayName:'Arthur "The Archivist" Pendelton',titleTag:"Meridian $900k Retainer Boss",signatureArchetypes:["STEPPED_PYRAMID","SPLIT_OR_STEAL_ARENA","CONCENTRIC_RINGS"],baseAccuracy:.86,weights:{chipGreed:.72,multGreed:.94,graphCutAggression:.94,clusterBuild:.88,ringAlignmentFocus:.88,innerCorePriority:.92,casinoRiskAppetite:.64,trapAwareness:.96},chainLockChance:.38,maxChainLocksPerMatch:2,bluffChance:.3,splitVsStealCooperateRate:.32,bluffTellHint:"Polishes his gold spectacles before locking an Apex bluff.",introQuips:["Thirty-two years on retainer to keep Clause 14-B unpaid. Sit down.","I memorized the vault index before you found the parking garage."],claimQuips:["Meridian’s ten million remains comfortably in escrow.","Textbook apex control. Sloane can breathe again."],chainLockQuips:["Archival seal applied. Earn your way to the summit."],bluffQuips:["Did you honestly think I’d telegraph my final vault?"],missQuips:["Impossible—that citation was revised in ninety-eight!","Hah! Fine. Make me earn my retainer."]}};function mt(d){return he[d]??he.STAGE_01_VAUDEVILLE_PALACE}function pe(d){const e=new Map;for(const r of d)e.set(r.nodeId,r);const t=new Map,a=new Map,i=[];for(const r of d)r.owner==="RIVAL"&&(a.set(r.nodeId,0),i.push(r.nodeId));for(;i.length>0;){const r=i.shift(),s=a.get(r)??0,l=e.get(r);if(l)for(const m of l.neighbors)a.has(m)||(a.set(m,s+1),i.push(m))}for(const r of d){let s=0,l=0;for(const f of r.neighbors){const T=e.get(f);T&&(T.owner==="PLAYER"&&(s+=1),T.owner==="RIVAL"&&(l+=1))}const m=a.get(r.nodeId),g=m===1?1:m===2?.55:.15,h=s>0&&l>0?1:s>=2?.85:l>=2?.7:0;t.set(r.nodeId,{degree:r.neighbors.length,adjacentPlayerCount:s,adjacentRivalCount:l,shortestBridgeBonus:g,encirclementBonus:h})}return t}function gt(d){let e=0;for(const t of d)t.owner==="RIVAL"&&(e+=Math.max(1,Math.min(11,Math.round(t.baseChips/50))));return e}function x(d,e){return d.length===0?"":d[Math.floor(Math.max(0,Math.min(.999999,e()))*d.length)]}class U{stageId;personality;activeIntent=null;chainLocksUsed=0;constructor(e){this.stageId=e,this.personality=mt(e)}getPersonality(){return this.personality}getActiveIntent(){return this.activeIntent}resetMatchCounters(){this.activeIntent=null,this.chainLocksUsed=0}scoreCandidateNodes(e,t=[]){const a=new Set(t),i=e.nodes.filter(n=>n.owner==="NONE"&&!a.has(n.nodeId));if(i.length===0)return[];const r=this.personality,s=r.weights,l=pe(e.nodes),m=new Set(e.alignedNodeIds),g=e.definition.mechanicArchetype,h=e.activeTwist,f=g==="BLACKJACK_21_FELT"?gt(e.nodes):0,T=Math.max(100,...i.map(n=>n.baseChips)),b=Math.max(1,...i.map(n=>n.tierIndex??0)),v=i.map(n=>{const o=l.get(n.nodeId);let c=0;if(c+=n.baseChips/T*32*s.chipGreed,c+=n.multBonus*18*s.multGreed,o&&(c+=o.adjacentPlayerCount*15*s.graphCutAggression,c+=o.adjacentRivalCount*13*s.clusterBuild,c+=o.shortestBridgeBonus*14*s.clusterBuild,c+=o.encirclementBonus*18*((s.graphCutAggression+s.clusterBuild)*.5),c+=Math.min(4,o.degree)*2.5),m.has(n.nodeId)&&(c+=34*s.ringAlignmentFocus),n.ringIndex===0&&(c+=18*s.innerCorePriority),n.tierIndex!==void 0&&b>0&&(c+=n.tierIndex/b*22*s.innerCorePriority),g==="BLACKJACK_21_FELT"){const u=Math.max(1,Math.min(11,Math.round(n.baseChips/50))),p=f+u;p===21?c+=55*(.6+s.casinoRiskAppetite*.6):p>21?c-=48*(1.2-s.casinoRiskAppetite*.5):p>=17&&(c+=18*s.casinoRiskAppetite)}return(n.isMysteryAuction||h==="HOST_BLIND_AUCTION")&&(c+=22*s.casinoRiskAppetite),h==="RISING_FLOOD_STAGE"&&(n.ringIndex===0||(n.tierIndex??0)>=1)&&(c+=24*s.innerCorePriority),(h==="MIRROR_TWIN_LINK"||h==="HIGH_VOLTAGE_CHAIN"||g==="ASTRAL_CONSTELLATION"||g==="PRISM_SPLITTER")&&o&&o.degree>=2&&(c+=20*s.multGreed),n.isDoubleAgentMole&&(c-=42*s.trapAwareness),n.hasTrapFuse&&(c-=22*s.trapAwareness),n.lockedChains>0&&(c-=n.lockedChains*14*(1.1-s.graphCutAggression*.4)),c-=Math.max(0,n.difficultyOffset)*(6-r.stageNumber*.4),{node:n,score:c}});return v.sort((n,o)=>o.score-n.score),v}planNextIntent(e,t={}){const a=t.rng??Math.random,i=this.personality,r=this.scoreCandidateNodes(e,t.frozenNodeIds);if(t.rivalFrozenThisTurn||r.length===0){const S={stageId:this.stageId,championName:i.displayName,actionKind:"FROZEN_SKIP",displayedTargetNodeId:null,actualTargetNodeId:null,chainLockNodeId:null,isBluffing:!1,bluffTellHint:null,intentBadgeText:"LOCKED OUT THIS TURN",barkLine:"Frozen on the buzzer—enjoy your free swing.",projectedBidCash:0};return this.activeIntent=S,S}const s=r[0].node,l=r.length>1?r[1].node:s,g=(t.chainLocksAlreadyUsed??this.chainLocksUsed)<i.maxChainLocksPerMatch&&(t.isTitleBout||i.stageNumber>=4)&&e.turnNumber>=2;let h=null;if(g&&a()<i.chainLockChance){const S=pe(e.nodes),y=r.map(E=>E.node).filter(E=>E.nodeId!==s.nodeId&&E.lockedChains<2).sort((E,A)=>{const w=S.get(E.nodeId)?.adjacentPlayerCount??0;return(S.get(A.nodeId)?.adjacentPlayerCount??0)*20+A.multBonus*10-(w*20+E.multBonus*10)});y.length>0&&(h=y[0].nodeId)}const T=r.length>=2&&(t.isTitleBout||i.stageNumber>=3)&&a()<i.bluffChance;let b="CLAIM_NODE",v=s.nodeId,n=s.nodeId,o=`EYEING ${s.categoryLabel.toUpperCase()}`,c=x(i.introQuips,a);e.activeTwist==="HOST_BLIND_AUCTION"||s.isMysteryAuction?(b="AUCTION_BID",o="BIDDING MYSTERY VAULT"):h?(b="CHAIN_LOCK",o="CHAIN-LOCKING + CLAIM",c=x(i.chainLockQuips,a)):e.definition.mechanicArchetype==="CONCENTRIC_RINGS"&&e.alignedNodeIds.length>0&&!e.alignedNodeIds.includes(s.nodeId)&&i.weights.ringAlignmentFocus>=.7&&a()<.35?(b="RING_DISRUPT",o="SPINNING GEAR RING"):T&&(b="BLUFF_BAIT",v=l.nodeId,n=s.nodeId,o=`EYEING ${l.categoryLabel.toUpperCase()}?`);const u=Math.round(Math.min(Math.max(150,e.rivalTotalCash*(.18+i.weights.casinoRiskAppetite*.22)),Math.max(200,s.baseChips*(1+s.multBonus)))),p={stageId:this.stageId,championName:i.displayName,actionKind:b,displayedTargetNodeId:v,actualTargetNodeId:n,chainLockNodeId:h,isBluffing:T,bluffTellHint:T?i.bluffTellHint:null,intentBadgeText:o,barkLine:c,projectedBidCash:u};return this.activeIntent=p,p}executeTurn(e,t={}){const a=t.rng??Math.random,i=this.personality,r=new Set(t.frozenNodeIds??[]);if(t.rivalFrozenThisTurn){const u=this.planNextIntent(e,{...t,rivalFrozenThisTurn:!1});return{championName:i.displayName,stageId:this.stageId,actionKind:"FROZEN_SKIP",targetNodeId:null,chainLockedNodeId:null,wasBluffRevealed:!1,solvedClue:!1,solveProbabilityUsed:0,cashDelta:0,ringRotatedIndex:null,ringRotationDeltaDeg:0,barkLine:"Frozen out—nice Foil play. Enjoy it while it lasts.",actionTag:"rival_frozen_skip",nextTelegraphedIntent:u}}const s=this.activeIntent??this.planNextIntent(e,t);let l=s.actualTargetNodeId?e.nodes.find(u=>u.nodeId===s.actualTargetNodeId&&u.owner==="NONE"&&!r.has(u.nodeId)):void 0;if(l||(l=this.scoreCandidateNodes(e,t.frozenNodeIds)[0]?.node),!l)return{championName:i.displayName,stageId:this.stageId,actionKind:"FROZEN_SKIP",targetNodeId:null,chainLockedNodeId:null,wasBluffRevealed:!1,solvedClue:!1,solveProbabilityUsed:0,cashDelta:0,ringRotatedIndex:null,ringRotationDeltaDeg:0,barkLine:"No open nodes left—let the scoreboard settle this.",actionTag:"rival_no_moves",nextTelegraphedIntent:null};let m=null,g=0;s.actionKind==="RING_DISRUPT"&&e.definition.mechanicArchetype==="CONCENTRIC_RINGS"&&(m=Math.floor(a()*3),g=a()<.5?60:-60,e.ringRotationsDeg[m]=(e.ringRotationsDeg[m]+g+360)%360);let h=null;if(s.chainLockNodeId&&this.chainLocksUsed<i.maxChainLocksPerMatch){const u=e.nodes.find(p=>p.nodeId===s.chainLockNodeId&&p.owner==="NONE"&&p.lockedChains<2);u&&(u.lockedChains+=1,h=u.nodeId,this.chainLocksUsed+=1)}let f=i.baseAccuracy;t.isTitleBout&&(f+=.03),f-=Math.max(0,l.difficultyOffset)*.04,f-=l.lockedChains*.06,t.playerScrewedRival&&(f-=.26),l.isDoubleAgentMole&&(f-=.14);const T=Math.max(.32,Math.min(.88,Number(f.toFixed(3)))),b=a()<T;let v=0,n="",o="rival_missed_clue";if(b){l.owner="RIVAL",l.lockedChains=0;const u=e.alignedNodeIds.includes(l.nodeId)?1.5:1,p=Math.max(1,1+l.multBonus*.45);v=Math.round(l.baseChips*p*u),e.rivalTotalCash+=v,s.isBluffing?(n=x(i.bluffQuips,a),o="rival_bluff_claim"):h?(n=x(i.chainLockQuips,a),o="rival_chain_lock_claim"):(n=x(i.claimQuips,a),o="rival_node_claimed")}else n=x(i.missQuips,a),o=t.playerScrewedRival?"rival_screwed_miss":"rival_missed_clue";const c=this.planNextIntent(e,{...t,playerScrewedRival:!1,chainLocksAlreadyUsed:this.chainLocksUsed});return{championName:i.displayName,stageId:this.stageId,actionKind:s.actionKind,targetNodeId:l.nodeId,chainLockedNodeId:h,wasBluffRevealed:s.isBluffing&&b,solvedClue:b,solveProbabilityUsed:T,cashDelta:v,ringRotatedIndex:m,ringRotationDeltaDeg:g,barkLine:n,actionTag:o,nextTelegraphedIntent:c}}decideSplitOrSteal(e,t,a=Math.random){let i=this.personality.splitVsStealCooperateRate;return t<e&&(i-=.14),a()<Math.max(.12,Math.min(.85,i))?"SPLIT":"STEAL"}}const ft=new Set(["lobby","board","toy","trapdoor","trunk","trophies","options","ceremony"]),yt=new Set(["NONE","BLACKOUT_SPOTLIGHT","GRAVITY_INVERSION","HOST_BLIND_AUCTION","CHAIN_FUSE_DETONATION","MIRROR_TWIN_LINK","RISING_FLOOD_STAGE","DOUBLE_AGENT_MOLE","SPLIT_OR_STEAL_VAULT","MAGNETIC_REPULSOR","CURSED_MULTIPLIER_DECAY","OVERCLOCK_DOUBLE_SPEED","RIVAL_FOG_JAMMER","GOLDEN_BOUNTY_HUNT","SUDDEN_TRAPDOOR_HAZARD","RICOCHET_LASER_BONUS","HIGH_VOLTAGE_CHAIN"]);function $(d,e,t){if(!d)return null;const a=Number.parseInt(d,10);return Number.isFinite(a)?Math.max(e,Math.min(t,a)):null}function vt(d){const e=new URLSearchParams(d.startsWith("?")?d:`?${d}`),t=e.get("v6view")?.toLowerCase().trim()??null,a=t&&ft.has(t)?t:null,i=e.get("twist")?.toUpperCase().trim()??null,r=i&&yt.has(i)?i:null,s=(e.get("outcome")??e.get("ceremony"))?.toLowerCase().trim()??null,l=s==="win"||s==="loss"?s:null;return{view:a,stageNumber:$(e.get("stage"),1,10),boardNumber:$(e.get("board"),1,100),toyNumber:$(e.get("toy"),1,100),episodeNumber:$(e.get("ep"),1,20),twistId:r,ceremonyOutcome:l}}function Q(){if(typeof document>"u")return!1;const d=document;return!!(d.fullscreenElement||d.webkitFullscreenElement||d.msFullscreenElement)}async function z(){if(typeof document>"u")return!1;const d=document,e=document.documentElement;try{if(Q())return typeof d.exitFullscreen=="function"?await d.exitFullscreen():typeof d.webkitExitFullscreen=="function"?await d.webkitExitFullscreen():typeof d.msExitFullscreen=="function"&&await d.msExitFullscreen(),!1;if(typeof e.requestFullscreen=="function")return await e.requestFullscreen(),!0;if(typeof e.webkitRequestFullscreen=="function")return await e.webkitRequestFullscreen(),!0;if(typeof e.msRequestFullscreen=="function")return await e.msRequestFullscreen(),!0}catch{}return Q()}const bt={STAGE_01_VAUDEVILLE_PALACE:{surfaceCss:"rgba(26, 12, 16, 0.92)",borderCss:"#d4a34a",accentCss:"#f4c76b",badgeBgCss:"#6e1423",badgeTextCss:"#fff6e0",fontHeadingFamily:'"Cinzel", Georgia, serif'},STAGE_02_GENEVA_CONSERVATORY:{surfaceCss:"rgba(22, 26, 34, 0.92)",borderCss:"#d9a18c",accentCss:"#f3c6b3",badgeBgCss:"#2c3d59",badgeTextCss:"#fbf8f3",fontHeadingFamily:'"Cinzel", Georgia, serif'},STAGE_03_MONTE_CARLO_SALON:{surfaceCss:"rgba(9, 28, 22, 0.92)",borderCss:"#d9b45a",accentCss:"#52e0a5",badgeBgCss:"#0f4c3a",badgeTextCss:"#fff8e5",fontHeadingFamily:'"Cinzel", Georgia, serif'},STAGE_04_CARTOGRAPHIC_ROTUNDA:{surfaceCss:"rgba(18, 24, 30, 0.92)",borderCss:"#58b4a0",accentCss:"#e0b363",badgeBgCss:"#1e4246",badgeTextCss:"#f4f0e2",fontHeadingFamily:'"Cinzel", Georgia, serif'},STAGE_05_ANALOG_BUNKER_1969:{surfaceCss:"rgba(20, 24, 18, 0.94)",borderCss:"#f08a24",accentCss:"#ffaa44",badgeBgCss:"#384029",badgeTextCss:"#ffe7c4",fontHeadingFamily:'"JetBrains Mono", monospace'},STAGE_06_KYOTO_LACQUER_PAVILION:{surfaceCss:"rgba(20, 10, 12, 0.93)",borderCss:"#e0b84c",accentCss:"#eb523b",badgeBgCss:"#7d1c19",badgeTextCss:"#fff4dc",fontHeadingFamily:'"Cinzel", Georgia, serif'},STAGE_07_CARNIVAL_CURIOSITIES:{surfaceCss:"rgba(18, 16, 30, 0.93)",borderCss:"#e3874f",accentCss:"#4ed9d2",badgeBgCss:"#5c233a",badgeTextCss:"#fff4e4",fontHeadingFamily:'"Cinzel", Georgia, serif'},STAGE_08_SUNKEN_BATHYSPHERE:{surfaceCss:"rgba(10, 22, 30, 0.94)",borderCss:"#b98952",accentCss:"#46d8df",badgeBgCss:"#12394a",badgeTextCss:"#e5fbff",fontHeadingFamily:'"Cinzel", Georgia, serif'},STAGE_09_ASTRAL_OBSERVATORY:{surfaceCss:"rgba(13, 18, 34, 0.93)",borderCss:"#65e0b8",accentCss:"#a89cff",badgeBgCss:"#1f2b57",badgeTextCss:"#f2f6ff",fontHeadingFamily:'"Cinzel", Georgia, serif'},STAGE_10_SOVEREIGN_COLOSSEUM:{surfaceCss:"rgba(14, 12, 12, 0.95)",borderCss:"#f2c14e",accentCss:"#ff7043",badgeBgCss:"#4a1b12",badgeTextCss:"#fff6da",fontHeadingFamily:'"Cinzel", Georgia, serif'}};function Tt(d){const e=V(d);return{stageId:d,stageNumber:e.stageNumber,title:e.title,eraSubtitle:e.eraSubtitle,difficultyBand:e.difficultyBand,symphonyTrack:e.symphonyTrack,materials:{floorColorHex:1774866,floorRoughness:.45,floorMetalness:.25,trimMetalHex:13935434,trimRoughness:.28,trimMetalness:.88,stoneOrWoodHex:2825495,jewelPrimaryHex:13184062,jewelSecondaryHex:3852720},lighting:{skyTopHex:725540,fogHex:658969,fogDensity:.018,keyLightHex:16770229,keyIntensity:2.2,rimLightHex:7001855,rimIntensity:1.4,ambientHex:2436159,particleKind:"GOLDEN_DUST"},hudTheme:bt[d]}}const me=["CLOCKWORK_ROTARY","TURF_WAR_BRIDGES","GRAVITY_PHYSICS","CASINO_PUSH_LUCK","STEALTH_OPTICS_RADAR","MONUMENT_INDUSTRIAL","CARTOGRAPHY_EXPEDITION","CARNIVAL_ARCADE","ASTRAL_QUANTUM","RULE_BENDER_TWISTS"],Et=["CONCENTRIC_RINGS","HEX_TURF_BRIDGE","PINBALL_DROP","BLACKJACK_21_FELT","LASER_MIRROR_GRID","STEPPED_PYRAMID","SUBWAY_NETWORK","FERRIS_WHEEL","ASTRAL_CONSTELLATION","SPLIT_OR_STEAL_ARENA"],j=["GOLDEN_BOUNTY_HUNT","OVERCLOCK_DOUBLE_SPEED","HOST_BLIND_AUCTION","MIRROR_TWIN_LINK","DOUBLE_AGENT_MOLE","HIGH_VOLTAGE_CHAIN","CHAIN_FUSE_DETONATION","RISING_FLOOD_STAGE","RICOCHET_LASER_BONUS","SPLIT_OR_STEAL_VAULT"],_t=["DEFUSAL_ELIMINATION","ATLAS_RELIEF_SPATIAL","DIALS_CRYPTEX_LOCKS","RAPID_PADDLES_REFLEX","PROGRESSIVE_AUDIO_REVEAL","WAGER_SCALE_CHRONOLOGY","CASINO_BLUFF_STAKES","FORENSIC_DETECTIVE","KINETIC_CONTRAPTIONS","MIND_GAME_TWISTS"],St=["trapdoor_01_rock_bands","trapdoor_02_closing_blades","trapdoor_03_live_green_fuse","trapdoor_04_real_countries","trapdoor_05_lava_piston","trapdoor_06_element_vs_potion","trapdoor_07_counterfeit_shredder","trapdoor_08_oscilloscope_hold","trapdoor_09_boiler_steam_vent","trapdoor_10_mirrored_animals"];function At(){const d=[];for(let e=1;e<=100;e+=1){const t=Math.floor((e-1)/10),a=B[t%10];d.push({boardId:`board_${String(e).padStart(3,"0")}_${me[t].toLowerCase()}`,boardNumber:e,name:`${a.title} Contraption #${String(e).padStart(2,"0")}`,family:me[t],signatureStage:a.stageId,tagline:"Claim aligned vaults before the Stage Champion locks the bridge.",symphonyTrack:a.symphonyTrack,defaultTwist:j[t%10],targetWinCondition:"Outscore the Stage Champion across 5-6 tactical turns.",nodeCount:12,mechanicArchetype:Et[t%10],accentPalette:{primaryHex:13935434,secondaryHex:3852720,gemHex:13184062}})}return d}function It(){const d={DEFUSAL_ELIMINATION:"CUT 3 WRONG WIRES",ATLAS_RELIEF_SPATIAL:"DROP RUBY GLOBE PIN",DIALS_CRYPTEX_LOCKS:"ALIGN BRASS TUMBLERS",RAPID_PADDLES_REFLEX:"SLAM LEFT OR RIGHT",PROGRESSIVE_AUDIO_REVEAL:"CALL IT EARLY",WAGER_SCALE_CHRONOLOGY:"BALANCE THE SCALE",CASINO_BLUFF_STAKES:"SPLIT YOUR CHIPS",FORENSIC_DETECTIVE:"SWEEP UV LIGHT",KINETIC_CONTRAPTIONS:"LOCK THE GAUGE",MIND_GAME_TWISTS:"SPOT THE RIGGED LIE"},e=[];for(let t=1;t<=100;t+=1){const a=Math.floor((t-1)/10),i=_t[a];e.push({toyId:`toy_${String(t).padStart(3,"0")}_${i.toLowerCase()}`,toyNumber:t,name:`${i.replace(/_/g," ")} #${String(t).padStart(2,"0")}`,family:i,actionCallout:d[i],baseSeconds:i==="MIND_GAME_TWISTS"?14:16,isTwistToy:t>=91})}return e}const W=["MOVIES","WORLD ATLAS","INVENTIONS","MUSIC","SCIENCE","HISTORY","SPORTS","FOOD & CRAFT","ARTS","NATURE","TECH","MYTH & LIT"];function Ct(d,e,t){const a=Math.max(8,Math.min(16,d.nodeCount||12)),i=[];for(let r=0;r<a;r+=1){const s=r/a*Math.PI*2,l=r<4?0:r<8?1:2,m=1.1+l*.85,g=(r-1+a)%a,h=(r+1)%a,f=(r+Math.floor(a/2))%a;i.push({nodeId:`node_${String(r+1).padStart(2,"0")}`,index:r,categoryLabel:W[r%W.length],domainId:r%12,baseChips:150+r%4*75+(l===0?100:0),multBonus:l===0?1.5:l===1?1:.5,difficultyOffset:l===0?.6:l===1?.15:-.25,owner:"NONE",lockedChains:r===0||r===5?1:0,hasTrapFuse:r===a-1,isMysteryAuction:r===2,ringIndex:l,tierIndex:2-l,neighbors:[`node_${String(g+1).padStart(2,"0")}`,`node_${String(h+1).padStart(2,"0")}`,`node_${String(f+1).padStart(2,"0")}`],pos3d:[Number((Math.cos(s)*m).toFixed(2)),0,Number((Math.sin(s)*m).toFixed(2))]})}return{definition:d,activeTwist:"NONE",nodes:i,turnNumber:1,maxTurns:t,ringRotationsDeg:[0,120,240],alignedNodeIds:[i[0].nodeId,i[4]?.nodeId??i[1].nodeId],playerScoreChips:0,playerMult:1,playerTotalCash:0,rivalTotalCash:0,rivalName:e,streakCount:0}}function Rt(d){const e=Number(Math.max(1,Math.min(10,d.difficultyTarget)).toFixed(1)),t=e<2?"WARMUP":e<=3.5?"EASY":e<=5.4?"CONTENDER":e<=7.3?"SHARP":e<=9?"CHAMPIONSHIP":"LEGEND";return{qid:128e4+Math.round(e*100)+(d.domainId??0),domainId:d.domainId??1,categoryLabel:W[(d.domainId??1)%W.length],difficultyScore:e,difficultyBadge:t,fameScore:Number(Math.max(.15,1-e*.08).toFixed(2)),prompt:"Which precision brass escapement regulates a classic Swiss mechanical pocket watch?",choices:["Tourbillon Cage","Carburetor Float","Tuning Peg","Bimetallic Relay"],correctIndex:0,wrongWireIndices:[1,2,3],numericTarget:1801,numericMin:1700,numericMax:1950,numericUnit:"yr",geoTarget:{lat:46.2044,lng:6.1432,regionHint:"Western Alps",landmarkLabel:"Geneva"},cryptexWord:"GENEVA",wittyHostAside:"Breguet patented it in 1801 so gravity would stop embarrassing pocket watches."}}const ge="ws-v6-director-shell-css",wt=`
.v6-director-root {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  max-width: 100vw;
  max-height: 100dvh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  color: #fff8ea;
  font-family: "Inter", system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
  pointer-events: none;
  z-index: 20;
}
.v6-director-root * {
  box-sizing: border-box;
}
.v6-top-stage-bar {
  flex: 0 0 auto;
  width: 100%;
  max-width: 100%;
  min-height: clamp(36px, 5.8dvh, 46px);
  padding: 4px clamp(6px, 2vw, 14px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  background: var(--v6-hud-surface, rgba(16, 14, 18, 0.92));
  border-bottom: 1.5px solid var(--v6-hud-border, #d4a34a);
  pointer-events: auto;
  overflow: hidden;
  z-index: 30;
}
.v6-bar-left, .v6-bar-right {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}
.v6-bar-left {
  flex: 1 1 0;
  overflow: hidden;
}
.v6-bar-right {
  flex: 0 0 auto;
}
.v6-stage-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 7px;
  border-radius: 4px;
  background: var(--v6-hud-badge-bg, #5c1922);
  color: var(--v6-hud-badge-text, #fff6e0);
  border: 1px solid var(--v6-hud-border, #d4a34a);
  font-family: var(--v6-hud-heading-font, "Cinzel", Georgia, serif);
  font-size: clamp(9.5px, 2.2vw, 12px);
  font-weight: 700;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  max-width: min(52vw, 280px);
}
.v6-meta-pill {
  font-family: "JetBrains Mono", monospace;
  font-size: clamp(9.5px, 2.1vw, 12px);
  font-weight: 600;
  color: var(--v6-hud-accent, #f4c76b);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 1;
  padding: 2px 6px;
  border: 1px solid rgba(255, 232, 180, 0.25);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.42);
}
@media (max-width: 440px) {
  .v6-meta-pill {
    display: none;
  }
}
.v6-bar-btn {
  appearance: none;
  border: 1px solid var(--v6-hud-border, #d4a34a);
  background: rgba(18, 16, 22, 0.9);
  color: #fff8ea;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: clamp(10px, 2.1vw, 11px);
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}
.v6-bar-btn:active {
  transform: translateY(1px);
}
.v6-screen-viewport {
  position: relative;
  flex: 1 1 0;
  min-height: 0;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  pointer-events: auto;
}
.v6-live-quip-ribbon {
  position: absolute;
  left: 50%;
  top: 6px;
  transform: translateX(-50%);
  max-width: min(94%, 560px);
  padding: 5px 12px;
  border-radius: 4px;
  background: rgba(12, 10, 14, 0.94);
  border: 1.5px solid var(--v6-hud-accent, #f4c76b);
  color: #fff8ea;
  font-size: clamp(11px, 2.4vw, 13px);
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  opacity: 0;
  transition: opacity 180ms ease;
  z-index: 45;
}
.v6-live-quip-ribbon.is-visible {
  opacity: 1;
}
.v6-award-toast {
  position: absolute;
  right: 8px;
  bottom: 8px;
  max-width: min(88%, 340px);
  padding: 7px 11px;
  border-radius: 4px;
  background: rgba(18, 14, 10, 0.96);
  border: 1.5px solid #f2c14e;
  color: #fff6da;
  font-size: 12px;
  pointer-events: none;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 200ms ease, transform 200ms ease;
  z-index: 50;
}
.v6-award-toast.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.v6-fallback-panel {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: clamp(8px, 2dvh, 18px) clamp(10px, 3vw, 22px);
  gap: 8px;
  background: radial-gradient(circle at 50% 20%, rgba(28, 22, 34, 0.72), rgba(7, 8, 14, 0.92));
}
.v6-fallback-title {
  margin: 0;
  font-family: var(--v6-hud-heading-font, "Cinzel", Georgia, serif);
  font-size: clamp(16px, 3.6vw, 24px);
  color: var(--v6-hud-accent, #f4c76b);
  letter-spacing: 0.05em;
}
.v6-fallback-sub {
  margin: 2px 0 0 0;
  font-size: clamp(11px, 2.3vw, 13px);
  color: rgba(255, 246, 224, 0.84);
}
.v6-fallback-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(130px, 44%), 1fr));
  gap: 6px;
  min-height: 0;
  overflow: hidden;
}
.v6-fallback-action {
  appearance: none;
  border: 1.5px solid var(--v6-hud-border, #d4a34a);
  background: var(--v6-hud-surface, rgba(20, 16, 22, 0.92));
  color: #fff8ea;
  border-radius: 6px;
  padding: clamp(7px, 1.4dvh, 12px) 10px;
  font-size: clamp(11px, 2.4vw, 13px);
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}
.v6-fallback-action small {
  display: block;
  margin-top: 2px;
  font-weight: 500;
  font-size: 10px;
  color: var(--v6-hud-accent, #f4c76b);
}
@media (max-height: 460px) {
  .v6-top-stage-bar {
    min-height: 32px;
    padding: 2px 8px;
  }
  .v6-meta-pill.v6-hide-short {
    display: none;
  }
}
`;class kt{uiRoot;deps;career;rng;hudBarEl;stagePillEl;metaPillEl;cashPillEl;backBtnEl;soundBtnEl;fullscreenBtnEl;viewportHostEl;quipRibbonEl;awardToastEl;fallbackBoards;fallbackToys;phase="LOBBY_HUB";playMode="CAMPAIGN";activeStageId="STAGE_01_VAUDEVILLE_PALACE";activeEpisode=R(1);rivalAI=new U("STAGE_01_VAUDEVILLE_PALACE");boardState=null;activeNodeId=null;activeToy=null;activeClue=null;activeTrapdoorId=null;lastCeremony=null;episodeMisses=0;episodeTrapdoorSurvivals=0;episodeMaxStreak=0;halftimeTwistTriggered=!1;doubleMultArmed=!1;screwRivalArmed=!1;rivalFrozenNextTurn=!1;frozenNodeIds=new Set;qaForcedToyNumber=null;activeViewHandle=null;quipTimeoutId=null;toastTimeoutId=null;curtainTimeoutId=null;unsubscribeCareer;onFullscreenChangeBound;disposed=!1;constructor(e,t={}){this.uiRoot=e,this.deps=t,this.career=t.careerStore??new Ce,this.rng=t.rng??Math.random,this.fallbackBoards=At(),this.fallbackToys=It();const a=this.career.getState();this.activeEpisode=R(a.currentEpisode),this.activeStageId=this.activeEpisode.stageMeta.stageId,this.rivalAI=new U(this.activeStageId),this.ensureShellStylesheet(),this.uiRoot.innerHTML="",this.uiRoot.classList.add("v6-ultrahd-root","v6-director-root"),this.uiRoot.dataset.v6Phase=this.phase,this.hudBarEl=document.createElement("header"),this.hudBarEl.className="v6-top-stage-bar",this.hudBarEl.dataset.v6Role="top-stage-bar";const i=document.createElement("div");i.className="v6-bar-left",this.backBtnEl=document.createElement("button"),this.backBtnEl.type="button",this.backBtnEl.className="v6-bar-btn",this.backBtnEl.dataset.v6Action="hub-back",this.backBtnEl.textContent="LOBBY",this.backBtnEl.addEventListener("click",()=>{this.playFoley("ui_brass_tap"),this.enterLobbyHub()}),this.stagePillEl=document.createElement("span"),this.stagePillEl.className="v6-stage-pill",this.stagePillEl.dataset.v6Role="stage-pill",this.metaPillEl=document.createElement("span"),this.metaPillEl.className="v6-meta-pill v6-hide-short",this.metaPillEl.dataset.v6Role="meta-pill",i.append(this.backBtnEl,this.stagePillEl,this.metaPillEl);const r=document.createElement("div");r.className="v6-bar-right",this.cashPillEl=document.createElement("span"),this.cashPillEl.className="v6-meta-pill",this.cashPillEl.dataset.v6Role="cash-pill",this.soundBtnEl=document.createElement("button"),this.soundBtnEl.type="button",this.soundBtnEl.className="v6-bar-btn",this.soundBtnEl.dataset.v6Action="toggle-music",this.soundBtnEl.addEventListener("click",()=>{const s=this.career.getOptions();this.applyOptionsPatch({musicEnabled:!s.musicEnabled}),this.playFoley("ui_brass_tap")}),this.fullscreenBtnEl=document.createElement("button"),this.fullscreenBtnEl.type="button",this.fullscreenBtnEl.className="v6-bar-btn",this.fullscreenBtnEl.dataset.v6Action="fullscreen",this.fullscreenBtnEl.setAttribute("aria-label","Toggle Fullscreen"),this.fullscreenBtnEl.textContent="FULLSCREEN",this.fullscreenBtnEl.addEventListener("click",()=>{this.playFoley("ui_brass_tap"),z().then(()=>this.refreshFullscreenLabel())}),r.append(this.cashPillEl,this.soundBtnEl,this.fullscreenBtnEl),this.hudBarEl.append(i,r),this.viewportHostEl=document.createElement("main"),this.viewportHostEl.className="v6-screen-viewport",this.viewportHostEl.dataset.v6Role="screen-viewport",this.quipRibbonEl=document.createElement("div"),this.quipRibbonEl.className="v6-live-quip-ribbon",this.quipRibbonEl.dataset.v6Role="live-quip",this.awardToastEl=document.createElement("div"),this.awardToastEl.className="v6-award-toast",this.awardToastEl.dataset.v6Role="award-toast",this.uiRoot.append(this.hudBarEl,this.viewportHostEl,this.quipRibbonEl,this.awardToastEl),this.onFullscreenChangeBound=()=>this.refreshFullscreenLabel(),typeof document<"u"&&(document.addEventListener("fullscreenchange",this.onFullscreenChangeBound),document.addEventListener("webkitfullscreenchange",this.onFullscreenChangeBound)),this.syncOptionsToSubsystems(this.career.getOptions()),this.unsubscribeCareer=this.career.subscribe(()=>{this.refreshTopStageBar()}),typeof window<"u"&&(window.__WS_V6_DIRECTOR__={getPhase:()=>this.phase,getActiveStageId:()=>this.activeStageId,getActiveEpisode:()=>this.activeEpisode,getActiveBoard:()=>this.boardState,getActiveToy:()=>this.activeToy,getCareerState:()=>this.career.getState(),jumpToDeepLink:s=>this.applyDeepLink(s),toggleFullscreen:()=>z()}),this.refreshTopStageBar(),this.refreshFullscreenLabel()}async start(e){const t=e!==void 0?e:typeof window<"u"?window.location.search:"",a=vt(t);if(a.view||a.stageNumber||a.boardNumber||a.toyNumber||a.episodeNumber){await this.applyDeepLink(a);return}await this.loadStageAtmosphere(this.activeStageId),await this.enterLobbyHub()}async applyDeepLink(e){if(e.episodeNumber)this.activeEpisode=R(e.episodeNumber),this.activeStageId=this.activeEpisode.stageMeta.stageId;else if(e.stageNumber){const a=it(e.stageNumber);this.activeStageId=a.stageId,this.activeEpisode=R(a.episodes[0])}switch(e.toyNumber&&(this.qaForcedToyNumber=e.toyNumber),this.rivalAI=new U(this.activeStageId),await this.loadStageAtmosphere(this.activeStageId),e.view??(e.toyNumber?"toy":e.boardNumber?"board":"lobby")){case"lobby":await this.enterLobbyHub();break;case"trophies":await this.enterTrophyVault();break;case"options":await this.enterOptionsConsole();break;case"trunk":await this.enterBackstageTrunk();break;case"board":{const a=this.resolveBoardDefinition(e.boardNumber??void 0);this.prepareEpisodeRuntime(a,e.twistId??void 0),await this.enterBoardTurn();break}case"toy":{const a=this.resolveBoardDefinition(e.boardNumber??void 0);this.prepareEpisodeRuntime(a,e.twistId??void 0);const i=this.boardState?.nodes[0];this.activeNodeId=i?.nodeId??"node_01",await this.enterToyEncounter(e.toyNumber??void 0);break}case"trapdoor":{const a=this.resolveBoardDefinition(e.boardNumber??void 0);this.prepareEpisodeRuntime(a,e.twistId??void 0),await this.enterTrapdoorGambit();break}case"ceremony":{const a=e.ceremonyOutcome!=="loss";this.lastCeremony={episode:this.activeEpisode,mode:this.playMode,won:a,playerCash:a?2450:1120,rivalCash:a?1680:1940,rivalName:this.rivalAI.getPersonality().displayName,purseAwarded:a?this.activeEpisode.basePurseCash:Math.round(this.activeEpisode.basePurseCash*.35),maxStreak:a?4:2,episodeMisses:a?0:2,trapdoorsSurvived:a?1:0,newlyUnlockedAwards:[],unlockedStage:null,expandedRelicSlots:!1},await this.enterEpisodeCeremony(this.lastCeremony);break}}}getPhase(){return this.phase}getCareerStore(){return this.career}getActiveStageId(){return this.activeStageId}getStageTheme(e=this.activeStageId){return this.deps.stageEngine?.getStageTheme?.(e)??Tt(e)}async loadStageAtmosphere(e){this.activeStageId=e,this.deps.stageEngine&&await this.deps.stageEngine.loadStageWorld(e);const t=this.getStageTheme(e);this.applyHudThemeTokens(t),this.refreshTopStageBar()}applyHudThemeTokens(e){const t=this.uiRoot.style;t.setProperty("--v6-hud-surface",e.hudTheme.surfaceCss),t.setProperty("--v6-hud-border",e.hudTheme.borderCss),t.setProperty("--v6-hud-accent",e.hudTheme.accentCss),t.setProperty("--v6-hud-badge-bg",e.hudTheme.badgeBgCss),t.setProperty("--v6-hud-badge-text",e.hudTheme.badgeTextCss),t.setProperty("--v6-hud-heading-font",e.hudTheme.fontHeadingFamily),this.uiRoot.dataset.v6Stage=e.stageId}applyOptionsPatch(e){const t=this.career.updateOptions(e);return this.syncOptionsToSubsystems(t),t}syncOptionsToSubsystems(e){this.uiRoot.dataset.v6ColorLens=e.colorVisionLens,this.uiRoot.dataset.v6ThumbDock=e.thumbDock,this.uiRoot.dataset.v6Resolution=e.resolutionTier,this.uiRoot.style.setProperty("--v6-text-scale",String(e.textScale)),this.deps.stageEngine?.applyOptions?.(e),this.deps.cameraDirector?.setMotionMode?.(e.cameraMotion),this.deps.audioEngine?.applyOptions(e),this.soundBtnEl.textContent=e.musicEnabled?"SCORE: ON":"SCORE: OFF"}playSymphony(e){this.career.getOptions().musicEnabled&&this.deps.audioEngine?.playSymphony(e)}playFoley(e){this.career.getOptions().sfxEnabled&&this.deps.audioEngine?.playFoley(e)}playStreakStinger(e){const t=["streak_chord_1","streak_chord_2","streak_chord_3","streak_chord_4","streak_fanfare_5"],a=Math.max(0,Math.min(t.length-1,e-1));this.playFoley(t[a])}setPhase(e){this.disposeActiveView(),this.phase=e,this.uiRoot.dataset.v6Phase=e,this.refreshTopStageBar()}disposeActiveView(){if(this.curtainTimeoutId!==null&&typeof window<"u"&&(window.clearTimeout(this.curtainTimeoutId),this.curtainTimeoutId=null),this.activeViewHandle){try{this.activeViewHandle.dispose()}catch{}this.activeViewHandle=null}this.viewportHostEl.innerHTML=""}refreshTopStageBar(){const e=V(this.activeStageId),t=this.career.getState(),a=typeof window<"u"&&window.innerWidth<540,i=e.title.split(/\s+/).slice(0,2).join(" ").toUpperCase();this.stagePillEl.textContent=a?`S${String(e.stageNumber).padStart(2,"0")} · ${i}`:`STAGE ${String(e.stageNumber).padStart(2,"0")}/10 • ${e.title.toUpperCase()}`;const r=this.activeEpisode?.episodeNumber??t.currentEpisode;if(this.phase==="BOARD_TURN"||this.phase==="TOY_ENCOUNTER"||this.phase==="TWIST_MUTATION"){const s=this.boardState?a?`T${this.boardState.turnNumber}/${this.boardState.maxTurns}`:`TURN ${this.boardState.turnNumber}/${this.boardState.maxTurns}`:`EP ${String(r).padStart(2,"0")}`;this.metaPillEl.textContent=this.playMode==="QUICK_SHOW"?a?s:`QUICK • ${s}`:a?`EP${String(r).padStart(2,"0")} · ${s}`:`EP ${String(r).padStart(2,"0")} • ${s}`}else this.phase==="TRAPDOOR_GAMBIT"?this.metaPillEl.textContent=a?"8S PIT":"TRAPDOOR PIT • 8S SURVIVAL":this.metaPillEl.textContent=a?`EP ${String(r).padStart(2,"0")}/20`:`EP ${String(r).padStart(2,"0")}/20 • ★ ${e.difficultyBand[0].toFixed(1)}-${e.difficultyBand[1].toFixed(1)}`;this.cashPillEl.textContent=`$${t.bankrollCash.toLocaleString()}`,this.backBtnEl.textContent=a?"HUB":"STAGE HUB",this.backBtnEl.style.display=this.phase==="LOBBY_HUB"?"none":"inline-flex",this.soundBtnEl.textContent=t.options.musicEnabled?a?"SND":"SCORE: ON":a?"MUTE":"SCORE: OFF"}refreshFullscreenLabel(){const e=typeof window<"u"&&window.innerWidth<540;this.fullscreenBtnEl.textContent=Q()?e?"EXIT":"EXIT FS":e?"FS":"FULLSCREEN"}showLiveQuip(e,t,a=3400){t&&(this.quipRibbonEl.textContent=`${e}: "${t}"`,this.quipRibbonEl.classList.add("is-visible"),this.deps.audioEngine?.duckForVoice?.(Math.min(2500,a)),this.quipTimeoutId!==null&&typeof window<"u"&&window.clearTimeout(this.quipTimeoutId),typeof window<"u"&&(this.quipTimeoutId=window.setTimeout(()=>{this.quipRibbonEl.classList.remove("is-visible"),this.quipTimeoutId=null},a)))}announceUnlockedAwards(e){if(e.length===0)return;const t=e[0];this.playFoley(t.kind==="TROPHY"?"trophy_pedestal_chime":"medal_enamel_clink"),this.awardToastEl.textContent=`${t.kind==="TROPHY"?"TROPHY":"MEDAL"} UNLOCKED: ${t.name}${e.length>1?` (+${e.length-1} more)`:""}`,this.awardToastEl.classList.add("is-visible"),this.toastTimeoutId!==null&&typeof window<"u"&&window.clearTimeout(this.toastTimeoutId),typeof window<"u"&&(this.toastTimeoutId=window.setTimeout(()=>{this.awardToastEl.classList.remove("is-visible"),this.toastTimeoutId=null},3600))}async enterLobbyHub(){this.setPhase("LOBBY_HUB"),this.deps.stageEngine?.setTrapdoorOpen?.(!1),this.deps.cameraDirector?.transitionTo("LOBBY_PROSCENIUM");const e=this.getStageTheme(this.activeStageId);if(this.playSymphony(e.symphonyTrack),this.deps.lobbyView){const r=this.deps.lobbyView.mount(this.viewportHostEl,{career:this.career.getState(),activeStage:V(this.activeStageId),stageTheme:e,onSelectStagePreview:s=>{this.playFoley("rotary_knob_click"),this.loadStageAtmosphere(s).then(()=>{this.playSymphony(this.getStageTheme(s).symphonyTrack)})},onStartCampaign:s=>{this.playFoley("ui_brass_tap"),this.startCampaignEpisode(s??this.career.getState().currentEpisode)},onStartQuickShow:s=>{this.playFoley("ui_brass_tap"),this.startQuickShow(s)},onStartTrapdoorGauntlet:()=>{this.playFoley("trapdoor_hinge_drop"),this.startTrapdoorGauntlet()},onOpenTrunk:()=>{this.playFoley("velvet_trunk_clasp"),this.enterBackstageTrunk()},onOpenTrophyVault:()=>{this.playFoley("trophy_pedestal_chime"),this.enterTrophyVault()},onOpenOptions:()=>{this.playFoley("neve_fader_detent"),this.enterOptionsConsole()}});this.activeViewHandle=r??null;return}const t=this.career.getState(),a=V(this.activeStageId),i=document.createElement("section");i.className="v6-fallback-panel",i.dataset.v6Screen="lobby",i.innerHTML=`
      <div>
        <h1 class="v6-fallback-title">WORLD'S SMARTEST v6.0</h1>
        <p class="v6-fallback-sub">${a.title} — ${a.eraSubtitle} · Champion: ${a.championName}</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-act="campaign">CAMPAIGN ROAD<small>Episode ${t.currentEpisode} of 20 · ★ ${a.difficultyBand[0].toFixed(1)}-${a.difficultyBand[1].toFixed(1)}</small></button>
        <button type="button" class="v6-fallback-action" data-act="quick">100-BOARD QUICK SHOW<small>Non-repeating Stage Contraption</small></button>
        <button type="button" class="v6-fallback-action" data-act="gauntlet">TRAPDOOR GAUNTLET<small>8-Second Survival Pit Blitz</small></button>
        <button type="button" class="v6-fallback-action" data-act="trunk">FRANKIE'S PROP TRUNK<small>${t.equippedRelicIds.length}/${t.maxRelicSlots} Relics · ${t.heldFoilCards.length}/3 Foils</small></button>
        <button type="button" class="v6-fallback-action" data-act="trophies">HALL OF TROPHIES<small>${t.unlockedAwardIds.length}/36 Honors Unlocked</small></button>
        <button type="button" class="v6-fallback-action" data-act="options">BROADCAST OPTIONS DESK<small>4-Bay Audio, 3x GPU & Accessibility</small></button>
      </div>
    `,i.querySelector('[data-act="campaign"]')?.addEventListener("click",()=>void this.startCampaignEpisode(t.currentEpisode)),i.querySelector('[data-act="quick"]')?.addEventListener("click",()=>void this.startQuickShow(this.activeStageId)),i.querySelector('[data-act="gauntlet"]')?.addEventListener("click",()=>void this.startTrapdoorGauntlet()),i.querySelector('[data-act="trunk"]')?.addEventListener("click",()=>void this.enterBackstageTrunk()),i.querySelector('[data-act="trophies"]')?.addEventListener("click",()=>void this.enterTrophyVault()),i.querySelector('[data-act="options"]')?.addEventListener("click",()=>void this.enterOptionsConsole()),this.viewportHostEl.append(i)}async enterTrophyVault(){this.setPhase("TROPHY_VAULT"),this.deps.cameraDirector?.transitionTo("TROPHY_MEDAL_VAULT"),this.playSymphony("trophy_hall_majesty");const e=this.getStageTheme(this.activeStageId),t=this.career.getAwardCatalog();if(this.deps.trophyVaultView){const r=this.deps.trophyVaultView.mount(this.viewportHostEl,{career:this.career.getState(),awards:t,stageTheme:e,onTogglePinMedal:s=>(this.playFoley("medal_enamel_clink"),this.career.togglePinnedPodiumMedal(s)),onBack:()=>{this.playFoley("ui_brass_tap"),this.enterLobbyHub()}});this.activeViewHandle=r??null;return}const a=this.career.getState(),i=document.createElement("section");i.className="v6-fallback-panel",i.dataset.v6Screen="trophies",i.innerHTML=`
      <div>
        <h2 class="v6-fallback-title">HALL OF TROPHIES & CAST MEDALS</h2>
        <p class="v6-fallback-sub">${a.unlockedAwardIds.length} / ${t.length} Unlocked · Pinned Podium Medals: ${a.pinnedPodiumMedalIds.length}/3</p>
      </div>
      <div class="v6-fallback-grid">
        ${t.slice(0,6).map(r=>{const s=a.unlockedAwardIds.includes(r.awardId);return`<button type="button" class="v6-fallback-action" data-award="${r.awardId}">${r.name}<small>${s?r.engraving:r.unlockRequirement}</small></button>`}).join("")}
      </div>
      <button type="button" class="v6-fallback-action" data-act="back">RETURN TO PROSCENIUM LOBBY</button>
    `,i.querySelector('[data-act="back"]')?.addEventListener("click",()=>void this.enterLobbyHub()),this.viewportHostEl.append(i)}async enterOptionsConsole(){this.setPhase("OPTIONS_CONSOLE"),this.deps.cameraDirector?.transitionTo("OPTIONS_MIXING_BOOTH");const e=this.getStageTheme(this.activeStageId);if(this.deps.optionsConsoleView){const i=this.deps.optionsConsoleView.mount(this.viewportHostEl,{options:this.career.getOptions(),stageTheme:e,seenClueCount:this.deps.questionEngine?.getSeenCount?.()??0,totalCluePool:this.deps.questionEngine?.getTotalPoolSize?.()??1279399,onUpdateOptions:r=>(this.playFoley("neve_fader_detent"),this.applyOptionsPatch(r)),onAuditionSymphony:r=>{this.playFoley("rotary_knob_click"),this.playSymphony(r)},onResetCampaign:()=>{this.playFoley("vault_heavy_unlock"),this.career.resetCampaignProgress(),this.activeEpisode=R(1),this.activeStageId=this.activeEpisode.stageMeta.stageId},onWipeClueMemory:async()=>{this.playFoley("vault_heavy_unlock"),await this.deps.questionEngine?.wipeSeenMemory?.()},onGetVuLevels:this.deps.audioEngine?.getChannelLevels?()=>this.deps.audioEngine.getChannelLevels():void 0,onBack:()=>{this.playFoley("ui_brass_tap"),this.enterLobbyHub()}});this.activeViewHandle=i??null;return}const t=this.career.getOptions(),a=document.createElement("section");a.className="v6-fallback-panel",a.dataset.v6Screen="options",a.innerHTML=`
      <div>
        <h2 class="v6-fallback-title">BROADCAST CONTROL DESK</h2>
        <p class="v6-fallback-sub">Resolution: ${t.resolutionTier} · Shadows: ${t.shadowQuality} · Camera: ${t.cameraMotion}</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-tier="ULTRA_3X">3X SUPER RETINA<small>Crisp Ultra-HD 3D</small></button>
        <button type="button" class="v6-fallback-action" data-tier="HIGH_2X">2X HIGH CLARITY<small>Balanced Mobile GPU</small></button>
        <button type="button" class="v6-fallback-action" data-tier="BATTERY_1X">1X BATTERY SAVER<small>Low-Power Mode</small></button>
        <button type="button" class="v6-fallback-action" data-act="back">RETURN TO LOBBY</button>
      </div>
    `,a.querySelectorAll("[data-tier]").forEach(i=>{i.addEventListener("click",()=>{const r=i.dataset.tier;this.applyOptionsPatch({resolutionTier:r}),this.enterOptionsConsole()})}),a.querySelector('[data-act="back"]')?.addEventListener("click",()=>void this.enterLobbyHub()),this.viewportHostEl.append(a)}async enterBackstageTrunk(){this.setPhase("BACKSTAGE_TRUNK"),this.deps.stageEngine?.setTrapdoorOpen?.(!1),this.deps.cameraDirector?.transitionTo("BACKSTAGE_PROP_TRUNK"),this.playSymphony("backstage_velvet");const e=this.career.getState(),t=R(this.activeEpisode?.episodeNumber??e.currentEpisode);this.activeStageId=t.stageMeta.stageId,this.refreshTopStageBar();const a=this.getStageTheme(t.stageMeta.stageId),i=j[(t.stageMeta.stageNumber-1)%10],r=this.deps.showrunner?.pickBackstageBeat(e.matchMemory)??null;if(this.deps.propTrunk){const m=this.deps.propTrunk.mountTrunk(this.viewportHostEl,{career:e,nextEpisode:t,upcomingTwistPreview:i,backstageBeat:r,stageTheme:a,onBuyEquipRelic:(g,h)=>{const f=this.career.purchaseAndEquipRelic(g,h);return f.ok&&(this.playFoley("relic_pedestal_hum"),this.announceUnlockedAwards(f.newlyUnlockedAwards)),f.ok},onUnequipRelic:g=>{this.playFoley("ui_brass_tap"),this.career.unequipRelic(g)},onReorderRelics:(g,h)=>{this.playFoley("brass_gear_detent"),this.career.reorderEquippedRelics(g,h)},onBuyFoilCard:g=>{const h=this.career.addFoilCard(g,g.costCash);return h&&this.playFoley("foil_card_flick"),h},onExpandRelicSlots:g=>{const h=this.career.expandRelicSlots(g);return h&&this.playFoley("vault_heavy_unlock"),h},onLaunchNextBroadcast:()=>{this.playFoley("velvet_trunk_clasp"),this.startCampaignEpisode(this.career.getState().currentEpisode)},onReturnLobby:()=>{this.playFoley("ui_brass_tap"),this.enterLobbyHub()}});this.activeViewHandle=m??null;return}const s=document.createElement("section");s.className="v6-fallback-panel",s.dataset.v6Screen="trunk";const l=r?`${r.speakerDisplayName}: "${r.lines.join(" ")}"`:`Frankie: "Next stage is ${t.stageMeta.title}. Stack +Chips left, xMult right."`;s.innerHTML=`
      <div>
        <h2 class="v6-fallback-title">FRANKIE'S BACKSTAGE PROP TRUNK</h2>
        <p class="v6-fallback-sub">${l}</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-act="buy-foil">BUY FOIL: SCREW RIVAL ($200)<small>Held Foils: ${e.heldFoilCards.length}/3</small></button>
        <button type="button" class="v6-fallback-action" data-act="launch">STEP ON STAGE: ${t.episodeLabel}<small>Forecast Twist: ${i.replace(/_/g," ")}</small></button>
        <button type="button" class="v6-fallback-action" data-act="lobby">RETURN TO LOBBY</button>
      </div>
    `,s.querySelector('[data-act="buy-foil"]')?.addEventListener("click",()=>{this.career.addFoilCard({cardId:`foil_screw_${Date.now()}`,name:"Rigged Screw Switch",shortEffect:"Sabotage Rival accuracy this turn",costCash:200,effectKind:"SCREW_RIVAL"},200),this.enterBackstageTrunk()}),s.querySelector('[data-act="launch"]')?.addEventListener("click",()=>void this.startCampaignEpisode(t.episodeNumber)),s.querySelector('[data-act="lobby"]')?.addEventListener("click",()=>void this.enterLobbyHub()),this.viewportHostEl.append(s)}async startCampaignEpisode(e){this.playMode="CAMPAIGN",this.qaForcedToyNumber=null,this.activeEpisode=R(e),this.activeStageId=this.activeEpisode.stageMeta.stageId,this.rivalAI=new U(this.activeStageId),await this.loadStageAtmosphere(this.activeStageId);const t=this.resolveBoardDefinition();this.prepareEpisodeRuntime(t),await this.enterStageCurtainIntro()}async startQuickShow(e){this.playMode="QUICK_SHOW",this.qaForcedToyNumber=null;const t=V(e);this.activeStageId=t.stageId,this.activeEpisode=R(t.episodes[0]),this.rivalAI=new U(this.activeStageId),await this.loadStageAtmosphere(this.activeStageId);const a=this.resolveBoardDefinition();this.prepareEpisodeRuntime(a),await this.enterStageCurtainIntro()}async startTrapdoorGauntlet(){this.playMode="TRAPDOOR_GAUNTLET",this.episodeMisses=0,this.episodeTrapdoorSurvivals=0,this.boardState=null,await this.loadStageAtmosphere(this.activeStageId),await this.enterTrapdoorGambit()}resolveBoardDefinition(e){const t=this.deps.boardManager?.getAllBoards()??this.fallbackBoards;if(e!==void 0){const a=this.deps.boardManager?.getBoardByNumber?.(e)??t.find(i=>i.boardNumber===e);if(a)return a}return this.career.selectNextBoard(t,this.activeStageId,this.rng)}prepareEpisodeRuntime(e,t){const a=this.rivalAI.getPersonality().displayName;this.rivalAI.resetMatchCounters(),this.career.recordBoardPlayed(e.boardId,e.family),this.boardState=this.deps.boardManager?.createRuntimeState?this.deps.boardManager.createRuntimeState(e,a,this.activeEpisode.turnCount):Ct(e,a,this.activeEpisode.turnCount),this.episodeMisses=0,this.episodeTrapdoorSurvivals=0,this.episodeMaxStreak=0,this.halftimeTwistTriggered=!1,this.doubleMultArmed=!1,this.screwRivalArmed=!1,this.rivalFrozenNextTurn=!1,this.frozenNodeIds.clear(),t&&t!=="NONE"?(this.boardState.activeTwist=t,this.halftimeTwistTriggered=!0):this.activeEpisode.isTitleBout&&e.defaultTwist!=="NONE"&&(this.boardState.activeTwist=e.defaultTwist),this.rivalAI.planNextIntent(this.boardState,{isTitleBout:this.activeEpisode.isTitleBout,rng:this.rng})}async enterStageCurtainIntro(){this.setPhase("STAGE_CURTAIN_INTRO"),this.deps.stageEngine?.setTrapdoorOpen?.(!1),this.deps.cameraDirector?.transitionTo("BOARD_OVERHEAD_ANGLED");const e=this.getStageTheme(this.activeStageId);this.playSymphony(e.symphonyTrack),this.playFoley("crowd_warm_applause");const t=this.rivalAI.getPersonality(),a=this.boardState?.definition.name??"Studio Contraption",i=document.createElement("section");i.className="v6-fallback-panel",i.dataset.v6Screen="curtain-intro",i.innerHTML=`
      <div>
        <h2 class="v6-fallback-title">${this.activeEpisode.episodeLabel}</h2>
        <p class="v6-fallback-sub">Board: ${a} · Opponent: ${t.displayName} (${t.titleTag})</p>
      </div>
      <div class="v6-fallback-sub">"${t.introQuips[0]}"</div>
      <button type="button" class="v6-fallback-action" data-act="go">TAKE YOUR PODIUM</button>
    `,i.querySelector('[data-act="go"]')?.addEventListener("click",()=>{this.playFoley("ui_brass_tap"),this.enterBoardTurn()}),this.viewportHostEl.append(i)}async enterBoardTurn(){if(!this.boardState){const s=this.resolveBoardDefinition();this.prepareEpisodeRuntime(s)}const e=this.boardState;this.setPhase("BOARD_TURN"),this.deps.stageEngine?.setTrapdoorOpen?.(!1),this.deps.cameraDirector?.transitionTo("BOARD_OVERHEAD_ANGLED");const t=this.getStageTheme(this.activeStageId);this.playSymphony(t.symphonyTrack);const a=this.rivalAI.getActiveIntent()??this.rivalAI.planNextIntent(e,{isTitleBout:this.activeEpisode.isTitleBout,frozenNodeIds:Array.from(this.frozenNodeIds),rng:this.rng});if(this.deps.boardManager){const s=this.deps.boardManager.mountBoard(this.viewportHostEl,e,t,a,this.career.getState().heldFoilCards,{onSelectNode:l=>void this.handlePlayerSelectNode(l),onUseFoilCard:(l,m)=>this.handleUseFoilCard(l,m),onRotateRing:(l,m)=>{this.playFoley("brass_gear_detent"),l>=0&&l<3&&(e.ringRotationsDeg[l]=(e.ringRotationsDeg[l]+m+360)%360)}});this.activeViewHandle=s??null;return}const i=e.nodes.filter(s=>s.owner==="NONE"),r=document.createElement("section");r.className="v6-fallback-panel",r.dataset.v6Screen="board",r.innerHTML=`
      <div>
        <h2 class="v6-fallback-title">${e.definition.name}</h2>
        <p class="v6-fallback-sub">YOU $${e.playerTotalCash} vs ${e.rivalName} $${e.rivalTotalCash} · Rival Intent: ${a.intentBadgeText}</p>
      </div>
      <div class="v6-fallback-grid">
        ${i.slice(0,8).map(s=>`<button type="button" class="v6-fallback-action" data-node="${s.nodeId}">${s.categoryLabel} (+${s.baseChips})<small>x${(1+s.multBonus).toFixed(1)}${s.lockedChains>0?` · CHAINED(${s.lockedChains})`:""}</small></button>`).join("")}
      </div>
    `,r.querySelectorAll("[data-node]").forEach(s=>{s.addEventListener("click",()=>{s.dataset.node&&this.handlePlayerSelectNode(s.dataset.node)})}),this.viewportHostEl.append(r)}async handlePlayerSelectNode(e){if(!this.boardState)return;const t=this.boardState.nodes.find(a=>a.nodeId===e&&a.owner==="NONE");t&&(this.activeNodeId=t.nodeId,this.playFoley("optical_beam_lock"),await this.enterToyEncounter(this.qaForcedToyNumber??void 0))}handleUseFoilCard(e,t){if(!this.boardState)return;const{card:a,newlyUnlockedAwards:i}=this.career.consumeFoilCard(e);if(a){if(this.playFoley(a.effectKind==="SCREW_RIVAL"?"screw_rival_slam":"foil_card_flick"),this.announceUnlockedAwards(i),this.deps.twistDirector?.applyFoilEffect){const r=this.deps.twistDirector.applyFoilEffect(this.boardState,a,t);r.frozeRival&&(this.rivalFrozenNextTurn=!0),r.screwedRival&&(this.screwRivalArmed=!0),r.doubleMult&&(this.doubleMultArmed=!0),this.showLiveQuip("FRANKIE",r.message)}else switch(a.effectKind){case"DOUBLE_MULT":this.doubleMultArmed=!0,this.showLiveQuip("FRANKIE","Double multiplier armed for your next clue!");break;case"SCREW_RIVAL":this.screwRivalArmed=!0,this.showLiveQuip("FRANKIE","Rival buzzer rigged—good luck to them!");break;case"FREEZE_NODE":t?this.frozenNodeIds.add(t):this.rivalFrozenNextTurn=!0,this.showLiveQuip("FRANKIE","Node frozen solid against the Rival!");break;case"SHATTER_CHAINS":for(const r of this.boardState.nodes)r.lockedChains=0;this.playFoley("iron_chain_shatter"),this.showLiveQuip("FRANKIE","Every iron chain on the board just snapped!");break;case"ROTATE_RING_FREE":this.boardState.ringRotationsDeg[0]=(this.boardState.ringRotationsDeg[0]+60)%360,this.playFoley("brass_gear_detent"),this.showLiveQuip("FRANKIE","Outer brass ring spun on the house!");break;case"STEAL_RIVAL_POT":{const r=Math.min(350,Math.round(this.boardState.rivalTotalCash*.25));this.boardState.rivalTotalCash-=r,this.boardState.playerTotalCash+=r,this.showLiveQuip("FRANKIE",`Lifted $${r} right off the Rival podium!`);break}default:this.showLiveQuip("FRANKIE",`${a.name} deployed on live air!`);break}this.phase==="BOARD_TURN"&&this.enterBoardTurn()}}async enterTwistMutation(e){if(!this.boardState)return;this.setPhase("TWIST_MUTATION"),this.halftimeTwistTriggered=!0,this.boardState.activeTwist=e,this.playFoley("twist_siren_chime"),this.deps.stageEngine?.triggerSparkBurst?.("ELECTRIC");const t=this.deps.twistDirector?.applyTwistMutation(this.boardState,e)??`Stage Mutation Active: ${e.replace(/_/g," ")}!`;this.showLiveQuip("SLOANE",`Compliance Twist triggered: ${e.replace(/_/g," ")}!`,3e3);const a=document.createElement("section");a.className="v6-fallback-panel",a.dataset.v6Screen="twist-mutation",a.innerHTML=`
      <div>
        <h2 class="v6-fallback-title">HALFTIME BROADCAST TWIST</h2>
        <p class="v6-fallback-sub">${e.replace(/_/g," ")} — ${t}</p>
      </div>
      <button type="button" class="v6-fallback-action" data-act="continue">PLAY THROUGH THE TWIST</button>
    `,a.querySelector('[data-act="continue"]')?.addEventListener("click",()=>{this.playFoley("ui_brass_tap"),this.enterBoardTurn()}),this.viewportHostEl.append(a)}async enterToyEncounter(e){this.setPhase("TOY_ENCOUNTER"),this.deps.cameraDirector?.transitionTo("TOY_CLOSEUP_STAGE");const t=this.getStageTheme(this.activeStageId),a=this.deps.toyManager?.getAllToys()??this.fallbackToys;let i;if(e!==void 0)i=this.deps.toyManager?.getToyByNumber?.(e)??a.find(b=>b.toyNumber===e)??a[0];else{const b=this.activeEpisode.isTitleBout&&(this.boardState?.turnNumber??1)>=this.activeEpisode.turnCount-1;i=this.career.selectNextToy(a,{preferTwist:b,rng:this.rng})}this.activeToy=i;const r=this.boardState?.nodes.find(b=>b.nodeId===this.activeNodeId),[s,l]=this.activeEpisode.difficultyRange,m=this.boardState?(this.boardState.turnNumber-1)/Math.max(1,this.boardState.maxTurns-1):0,g=Math.max(1,Math.min(10,s+(l-s)*m+(r?.difficultyOffset??0))),h={stageNumber:this.activeEpisode.stageMeta.stageNumber,difficultyTarget:Number(g.toFixed(2)),difficultyBand:this.activeEpisode.stageMeta.difficultyBand,domainId:r?.domainId,toyFamily:i.family,toyId:i.toyId};if(this.activeClue=this.deps.questionEngine?await this.deps.questionEngine.drawCalibratedClue(h):Rt(h),this.deps.toyManager){const b=this.deps.toyManager.mountToy(this.viewportHostEl,i,this.activeClue,{stageTheme:t,options:this.career.getOptions(),heldFoils:this.career.getState().heldFoilCards,onPlayFoil:v=>{const{card:n}=this.career.consumeFoilCard(v);n?.effectKind==="SWAP_CLUE_TOY"&&(this.playFoley("foil_card_flick"),this.enterToyEncounter())},onPlayFoley:v=>this.playFoley(v),onResolve:v=>void this.handleToyResolved(v)});this.activeViewHandle=b??null;return}const f=this.activeClue,T=document.createElement("section");T.className="v6-fallback-panel",T.dataset.v6Screen="toy",T.innerHTML=`
      <div>
        <h2 class="v6-fallback-title">${i.actionCallout} · ${i.name}</h2>
        <p class="v6-fallback-sub">[${f.categoryLabel} · ★ ${f.difficultyScore.toFixed(1)}] ${f.prompt}</p>
      </div>
      <div class="v6-fallback-grid">
        ${f.choices.map((b,v)=>`<button type="button" class="v6-fallback-action" data-choice="${v}">${b}</button>`).join("")}
      </div>
    `,T.querySelectorAll("[data-choice]").forEach(b=>{b.addEventListener("click",()=>{const n=Number(b.dataset.choice)===f.correctIndex;this.handleToyResolved({correct:n,accuracyRatio:n?1:0,secondsRemaining:9.5,chipsEarned:n?r?.baseChips??200:0,multDelta:n?.5:0,specificActionTag:n?"toy_clean_hit":"toy_missed_clue"})})}),this.viewportHostEl.append(T)}async handleToyResolved(e){const t=this.boardState,a=this.activeToy,i=t?.nodes.find(s=>s.nodeId===this.activeNodeId),r=!!(i&&i.lockedChains>0&&e.correct);if(a){const s=this.career.recordClueResolution({toy:a,resolution:e,brokeLockedChain:r});this.announceUnlockedAwards(s)}if(e.correct){if(t){t.streakCount+=1,this.episodeMaxStreak=Math.max(this.episodeMaxStreak,t.streakCount),this.playStreakStinger(t.streakCount);const l=Math.max(100,e.chipsEarned||(i?.baseChips??175)),m=i&&t.alignedNodeIds.includes(i.nodeId)?3:1,g=(1+(i?.multBonus??.5)+e.multDelta+t.streakCount*.25)*m*(this.doubleMultArmed?2:1);this.doubleMultArmed=!1;let h;if(this.deps.propTrunk?.evaluateRelicCascade){const f=this.deps.propTrunk.evaluateRelicCascade({baseChips:l,baseMult:g,equippedRelicIds:this.career.getState().equippedRelicIds,clueDomainId:this.activeClue?.domainId??0,streakCount:t.streakCount,stageId:this.activeStageId});t.playerScoreChips+=f.totalChips,t.playerMult=f.finalMult,h=f.cashEarned}else t.playerScoreChips+=l,t.playerMult=Number(g.toFixed(2)),h=Math.round(l*t.playerMult);t.playerTotalCash+=h,i&&(i.owner="PLAYER",i.lockedChains=0),this.playFoley(r?"iron_chain_shatter":"crystal_hex_claim"),this.deps.stageEngine?.triggerSparkBurst?.("GOLD")}const s=this.deps.showrunner?.pickLiveQuip([e.specificActionTag,"clue_hit"],this.career.getMatchMemory());s?this.showLiveQuip(s.speakerDisplayName,s.lines[0]):this.activeClue?.wittyHostAside&&this.showLiveQuip("JULIAN",this.activeClue.wittyHostAside),await this.advanceAfterPlayerResolution();return}this.episodeMisses+=1,await this.enterTrapdoorGambit()}async enterTrapdoorGambit(){this.setPhase("TRAPDOOR_GAMBIT"),this.playFoley("trapdoor_hinge_drop"),this.deps.stageEngine?.setTrapdoorOpen?.(!0),this.deps.cameraDirector?.transitionTo("TRAPDOOR_PIT_PLUNGE"),this.playSymphony("trapdoor_survival_blitz");const e=this.deps.trapdoorEngine?.getTrapdoorIds?.()??St,t=this.career.selectNextTrapdoorId(e,this.rng);this.activeTrapdoorId=t;const a=this.getStageTheme(this.activeStageId);if(this.deps.trapdoorEngine){const r=this.deps.trapdoorEngine.mountTrapdoor(this.viewportHostEl,{trapdoorId:t,stageTheme:a,options:this.career.getOptions(),onPlayFoley:s=>this.playFoley(s),onComplete:s=>void this.handleTrapdoorCompleted(s)});this.activeViewHandle=r??null;return}const i=document.createElement("section");i.className="v6-fallback-panel",i.dataset.v6Screen="trapdoor",i.innerHTML=`
      <div>
        <h2 class="v6-fallback-title">STAGE TRAPDOOR GAMBIT (8S PIT!)</h2>
        <p class="v6-fallback-sub">Pit Challenge: ${t.replace(/_/g," ").toUpperCase()} — Survive to save your xMult streak!</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-survive="1">CLUTCH SURVIVAL ESCAPE<small>Keep xMult Streak + Salvage Chips</small></button>
        <button type="button" class="v6-fallback-action" data-survive="0">TAKE THE DROP<small>Reset Streak & Climb Back Up</small></button>
      </div>
    `,i.querySelector('[data-survive="1"]')?.addEventListener("click",()=>{this.handleTrapdoorCompleted({trapdoorId:t,survived:!0,secondsRemaining:1.2})}),i.querySelector('[data-survive="0"]')?.addEventListener("click",()=>{this.handleTrapdoorCompleted({trapdoorId:t,survived:!1,secondsRemaining:0})}),this.viewportHostEl.append(i)}async handleTrapdoorCompleted(e){this.deps.stageEngine?.setTrapdoorOpen?.(!1);const t=this.career.recordTrapdoorResult({trapdoorId:e.trapdoorId,survived:e.survived,secondsRemaining:e.secondsRemaining});if(this.announceUnlockedAwards(t),e.survived){if(this.episodeTrapdoorSurvivals+=1,this.playFoley("crowd_studio_roar"),this.boardState){const a=this.boardState.nodes.find(r=>r.nodeId===this.activeNodeId),i=Math.round((a?.baseChips??150)*.4);this.boardState.playerTotalCash+=i}this.showLiveQuip("JULIAN","Climbed right out of the clockwork pit—streak still alive!")}else this.playFoley("crowd_collective_gasp"),this.boardState&&(this.boardState.streakCount=0,this.boardState.rivalTotalCash+=120*this.activeEpisode.stageMeta.stageNumber),this.showLiveQuip("JULIAN","Down goes the streak! Sloane is smiling in the booth.");if(this.playMode==="TRAPDOOR_GAUNTLET"){e.survived?await this.enterTrapdoorGambit():await this.enterLobbyHub();return}await this.advanceAfterPlayerResolution()}async advanceAfterPlayerResolution(){const e=this.boardState;if(!e){await this.enterLobbyHub();return}const t=this.rivalAI.executeTurn(e,{isTitleBout:this.activeEpisode.isTitleBout,playerScrewedRival:this.screwRivalArmed,rivalFrozenThisTurn:this.rivalFrozenNextTurn,frozenNodeIds:Array.from(this.frozenNodeIds),rng:this.rng});this.screwRivalArmed=!1,this.rivalFrozenNextTurn=!1,t.barkLine&&this.showLiveQuip(t.championName,t.barkLine,2600);const a=e.nodes.filter(i=>i.owner==="NONE").length;if(e.turnNumber>=e.maxTurns||a===0){await this.concludeEpisode();return}if(e.turnNumber+=1,!this.halftimeTwistTriggered&&e.turnNumber===this.activeEpisode.halftimeTurn){const i=this.deps.twistDirector?.pickHalftimeTwist(e,this.activeStageId)??(e.definition.defaultTwist!=="NONE"?e.definition.defaultTwist:j[(this.activeEpisode.stageMeta.stageNumber-1)%10]);await this.enterTwistMutation(i);return}await this.enterBoardTurn()}async concludeEpisode(){const e=this.boardState,t=e.playerTotalCash>=e.rivalTotalCash,a=t?this.activeEpisode.basePurseCash+Math.round(e.playerTotalCash*.25):Math.round(this.activeEpisode.basePurseCash*.35),i=this.playMode==="CAMPAIGN"?this.career.recordEpisodeOutcome({episodeNumber:this.activeEpisode.episodeNumber,won:t,cashEarned:a,episodeMisses:this.episodeMisses,hadActiveTwist:e.activeTwist!=="NONE",activeTwistId:e.activeTwist,boardId:e.definition.boardId}):{newlyUnlockedAwards:(this.career.adjustBankroll(a),this.career.evaluateAndUnlockAwards({kind:"EPISODE_FINISHED",wonEpisode:t})),unlockedStage:null,expandedRelicSlots:!1},r={episode:this.activeEpisode,mode:this.playMode,won:t,playerCash:e.playerTotalCash,rivalCash:e.rivalTotalCash,rivalName:e.rivalName,purseAwarded:a,maxStreak:this.episodeMaxStreak,episodeMisses:this.episodeMisses,trapdoorsSurvived:this.episodeTrapdoorSurvivals,newlyUnlockedAwards:i.newlyUnlockedAwards,unlockedStage:i.unlockedStage,expandedRelicSlots:i.expandedRelicSlots};this.lastCeremony=r,this.playMode==="CAMPAIGN"&&t&&(this.activeEpisode=R(this.career.getState().currentEpisode)),this.announceUnlockedAwards(i.newlyUnlockedAwards),await this.enterEpisodeCeremony(r)}async enterEpisodeCeremony(e){this.setPhase("EPISODE_CEREMONY"),this.deps.cameraDirector?.transitionTo("VICTORY_PODIUM_CEREMONY"),this.playSymphony(e.won?"crown_victory_fanfare":"backstage_velvet"),this.playFoley(e.won?"crowd_studio_roar":"crowd_warm_applause");const t=this.getStageTheme(this.activeStageId);if(this.deps.ceremonyView){const i=this.deps.ceremonyView.mount(this.viewportHostEl,{summary:e,stageTheme:t,onGoToTrunk:()=>{this.playFoley("velvet_trunk_clasp"),this.enterBackstageTrunk()},onPlayNextOrRematch:()=>{this.playFoley("ui_brass_tap"),this.startCampaignEpisode(this.career.getState().currentEpisode)},onReturnLobby:()=>{this.playFoley("ui_brass_tap"),this.enterLobbyHub()}});this.activeViewHandle=i??null;return}const a=document.createElement("section");a.className="v6-fallback-panel",a.dataset.v6Screen="ceremony",a.innerHTML=`
      <div>
        <h2 class="v6-fallback-title">${e.won?"BROADCAST VICTORY!":"CURTAIN FALL — REMATCH READY"}</h2>
        <p class="v6-fallback-sub">YOU $${e.playerCash} vs ${e.rivalName} $${e.rivalCash} · Purse +$${e.purseAwarded}</p>
      </div>
      <div class="v6-fallback-grid">
        <button type="button" class="v6-fallback-action" data-act="trunk">VISIT FRANKIE'S PROP TRUNK<small>Spend Warm Cash on Relics & Foils</small></button>
        <button type="button" class="v6-fallback-action" data-act="next">${e.won?"NEXT EPISODE":"REMATCH STAGE"}<small>Fresh Non-Repeating Board & Toys</small></button>
        <button type="button" class="v6-fallback-action" data-act="lobby">RETURN TO LOBBY</button>
      </div>
    `,a.querySelector('[data-act="trunk"]')?.addEventListener("click",()=>void this.enterBackstageTrunk()),a.querySelector('[data-act="next"]')?.addEventListener("click",()=>void this.startCampaignEpisode(this.career.getState().currentEpisode)),a.querySelector('[data-act="lobby"]')?.addEventListener("click",()=>void this.enterLobbyHub()),this.viewportHostEl.append(a)}ensureShellStylesheet(){if(typeof document>"u"||document.getElementById(ge))return;const e=document.createElement("style");e.id=ge,e.textContent=wt,document.head.appendChild(e)}dispose(){this.disposed||(this.disposed=!0,this.disposeActiveView(),this.unsubscribeCareer(),typeof window<"u"&&(this.quipTimeoutId!==null&&window.clearTimeout(this.quipTimeoutId),this.toastTimeoutId!==null&&window.clearTimeout(this.toastTimeoutId),window.__WS_V6_DIRECTOR__&&delete window.__WS_V6_DIRECTOR__),typeof document<"u"&&(document.removeEventListener("fullscreenchange",this.onFullscreenChangeBound),document.removeEventListener("webkitfullscreenchange",this.onFullscreenChangeBound)),this.deps.stageEngine?.dispose?.(),this.deps.audioEngine?.dispose?.())}}const fe="ws-v6-master-integration-css",Lt=`
/* Seamless Phase Coordination Between ShowtimeMasterDirectorV6 & Fullscreen V6 Screens */
#ui-root.v6-director-root[data-v6-phase="LOBBY_HUB"] > .v6-top-stage-bar,
#ui-root.v6-director-root[data-v6-phase="TROPHY_VAULT"] > .v6-top-stage-bar,
#ui-root.v6-director-root[data-v6-phase="OPTIONS_CONSOLE"] > .v6-top-stage-bar,
#ui-root.v6-director-root[data-v6-phase="EPISODE_CEREMONY"] > .v6-top-stage-bar {
  display: none !important;
}

#ui-root.v6-director-root > .v6-top-stage-bar,
#ui-root.v6-director-root .v6-fallback-panel,
#ui-root.v6-director-root .v6tr-root {
  pointer-events: auto;
}

#ui-root.v6-director-root > .v6-viewport-host {
  pointer-events: none;
}

#ui-root.v6-director-root[data-v6-phase="TOY_ENCOUNTER"] > .v6-viewport-host,
#ui-root.v6-director-root[data-v6-phase="TRAPDOOR_GAMBIT"] > .v6-viewport-host,
#ui-root.v6-director-root[data-v6-phase="BACKSTAGE_TRUNK"] > .v6-viewport-host,
#ui-root.v6-director-root[data-v6-phase="TWIST_MUTATION"] > .v6-viewport-host,
#ui-root.v6-director-root[data-v6-phase="STAGE_CURTAIN_INTRO"] > .v6-viewport-host {
  pointer-events: auto;
}

/* Zero-Scroll 3D Board HUD Frame (Transparent 3D Center + Top Rule/Rival Strip + Bottom Thumb Dock) */
.v6-board-hud-shell {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 10px max(8px, env(safe-area-inset-bottom, 6px));
  pointer-events: none;
}

.v6-board-top-deck {
  pointer-events: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 7px 11px;
  border-radius: 12px;
  background: var(--v6-stage-surface, rgba(16, 12, 16, 0.9));
  border: 1.5px solid var(--v6-stage-border, #d8a547);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.62);
}

.v6-board-identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.v6-board-kicker {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--v6-stage-accent, #f5cd75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v6-board-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.v6-board-title {
  margin: 0;
  font-family: var(--v6-font-display, 'Cinzel', Georgia, serif);
  font-size: clamp(13px, 2.1dvh, 18px);
  font-weight: 800;
  color: #fff8eb;
  letter-spacing: 0.03em;
}

.v6-board-rule-pill {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--v6-stage-badge-bg, #3d0f1a);
  color: var(--v6-stage-badge-text, #fff5de);
  border: 1px solid rgba(255, 232, 180, 0.32);
}

.v6-board-duel-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  min-width: 0;
  max-width: 100%;
  flex: 1 1 220px;
}

.v6-board-score-chip {
  font-family: var(--v6-font-mono, monospace);
  font-size: clamp(9.5px, 2.5vw, 11.5px);
  font-weight: 800;
  padding: 3px 6px;
  border-radius: 8px;
  background: rgba(8, 10, 14, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #f8f4ea;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 1 auto;
  min-width: 0;
}

.v6-board-score-chip.is-you {
  border-color: var(--v6-signal-good, #35d495);
  color: #b7ffdf;
}

.v6-board-score-chip.is-rival {
  border-color: var(--v6-signal-danger, #e84c5c);
  color: #ffd0d6;
}

.v6-board-rival-cameo {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  overflow: hidden;
  gap: 0;
}

.v6-board-rival-cameo > * > :nth-child(n+2),
.v6-board-rival-cameo span,
.v6-board-rival-cameo small,
.v6-board-rival-cameo figcaption {
  display: none !important;
}

@media (max-height: 430px) {
  .v6-board-hud-shell {
    padding: 3px 8px 4px;
  }
  .v6-board-top-deck {
    padding: 4px 8px;
    gap: 4px;
    flex-wrap: nowrap;
  }
  .v6-board-title {
    font-size: 13px;
  }
  .v6-board-rule-pill {
    font-size: 9.5px;
    padding: 1px 6px;
  }
  .v6-board-duel-strip {
    flex: 0 1 auto;
  }
  .v6-board-bottom-dock {
    padding: 4px 8px;
    gap: 4px;
  }
  .v6-board-node-btn {
    padding: 3px 5px;
  }
}

.v6-board-stage-window {
  flex: 1 1 0;
  min-height: 0;
  position: relative;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 4px;
}

.v6-board-hover-readout {
  pointer-events: none;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(10, 9, 13, 0.88);
  border: 1px solid var(--v6-stage-border, #d8a547);
  font-size: 11px;
  font-weight: 700;
  color: #fff6e3;
  letter-spacing: 0.03em;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.58);
}

.v6-board-bottom-dock {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 12px;
  background: var(--v6-stage-surface-deep, rgba(10, 8, 12, 0.94));
  border: 1.5px solid var(--v6-stage-border, #d8a547);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.72);
}

.v6-board-node-scroller {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
}

.v6-board-node-btn {
  appearance: none;
  border: 1px solid rgba(243, 202, 114, 0.44);
  border-radius: 9px;
  background: linear-gradient(180deg, rgba(36, 30, 38, 0.95) 0%, rgba(16, 13, 19, 0.98) 100%);
  color: #fff7e8;
  padding: 5px 6px;
  cursor: pointer;
  text-align: left;
  transition: transform 120ms ease, border-color 120ms ease;
  min-width: 0;
}

.v6-board-node-btn:hover,
.v6-board-node-btn.is-aligned {
  border-color: var(--v6-signal-good, #35d495);
  transform: translateY(-1px);
}

.v6-board-node-cat {
  display: block;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v6-board-node-val {
  display: block;
  font-family: var(--v6-font-mono, monospace);
  font-size: 9.5px;
  font-weight: 700;
  color: var(--v6-stage-accent, #f3ca72);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v6-board-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-width: 0;
  width: 100%;
}

.v6-board-tactical-btn {
  appearance: none;
  border: 1.5px solid var(--v6-stage-border, #d8a547);
  border-radius: 9px;
  padding: 5px 7px;
  font-size: clamp(9px, 2.4vw, 10.5px);
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  color: #161006;
  background: var(--v6-grad-brass-rim, linear-gradient(180deg, #f5cd75, #b8842b));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1 1 0;
}

.v6-board-tactical-btn[data-node-id] {
  flex: 0 0 auto;
}

.v6-board-tactical-btn.is-secondary {
  background: rgba(28, 23, 31, 0.95);
  color: #fff3d8;
}

.v6-board-tactical-btn.is-foil {
  background: linear-gradient(135deg, #3b1736 0%, #1d2f47 52%, #4a2d14 100%);
  border-color: #9be8ff;
  color: #f4fbff;
}

@media (max-height: 430px) and (orientation: landscape) {
  .v6-board-hud-shell {
    padding: 4px 8px;
  }
  .v6-board-top-deck {
    padding: 4px 8px;
  }
  .v6-board-identity {
    flex: 1 1 0;
    min-width: 0;
  }
  .v6-board-rule-pill {
    display: none;
  }
  .v6-board-duel-strip {
    flex: 0 0 auto;
  }
  .v6-board-score-chip {
    flex: 0 0 auto;
  }
  .v6-board-bottom-dock {
    flex-direction: row;
    align-items: center;
    padding: 4px 8px;
    gap: 6px;
  }
  .v6-board-node-scroller {
    flex: 1 1 56%;
    min-width: 0;
  }
  .v6-board-controls-row {
    width: auto;
    flex: 0 1 44%;
    min-width: 0;
    justify-content: flex-end;
  }
  .v6-board-tactical-btn {
    flex: 0 1 auto;
  }
}

.v6-trunk-stage-wrap {
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  padding: 6px 10px max(8px, env(safe-area-inset-bottom, 6px));
  display: flex;
  flex-direction: column;
}
`;function Nt(){if(typeof document>"u"||document.getElementById(fe))return;const d=document.createElement("style");d.id=fe,d.textContent=Lt,document.head.appendChild(d)}function Ot(d,e,t){Nt(),e&&(e.style.display="none",e.style.pointerEvents="none"),d.innerHTML="";const a=new Ce,i=a.getState(),r=R(i.currentEpisode);ne(t,i.options);const s=new Pe({container:d,initialStage:r.stageMeta.stageId,initialZone:"LOBBY_PROSCENIUM",resolutionTier:i.options.resolutionTier,shadowQuality:i.options.shadowQuality,cameraMotion:i.options.cameraMotion,syncHudThemeVars:!0});s.start();const l=we(i.options);l.applyOptions(i.options);const m=()=>{l.unlock(),l.prewarmPriorityFoley()};window.addEventListener("pointerdown",m,{once:!0,passive:!0}),window.addEventListener("keydown",m,{once:!0});const g=new ke,h=new Le({catalogABoards:Oe,stateFactoryA:Ne,rendererA:g}),f=s.addFrameListener((n,o)=>{h.updateFrame(n,o)}),T=new ze;T.registerPackA(je,(n,o,c,u)=>Xe(n,o,c,{stageTheme:u.stageTheme,timerBonusSeconds:u.timerBonusSeconds,onPlayFoley:u.onSfx,onResolve:u.onResolve}));const b=new Be;Y.hydrate(),se.init(),b.loadScript();const v=new kt(t,{careerStore:a,stageEngine:{loadStageWorld:n=>{s.setStageWorld(n),l.setStageAmbience(n)},applyOptions:n=>{s.applyBroadcastOptions(n),ne(t,n)},setTrapdoorOpen:n=>{s.setTrapdoorOpen(n)},getStageTheme:n=>re(n),triggerSparkBurst:()=>{s.emitSparks([0,.85,0],48,5.2)}},cameraDirector:{transitionTo:(n,o)=>{s.setCameraZone(n,{immediate:!!o})},setMotionMode:n=>{s.cameraDirector.setMotionMode(n)}},audioEngine:{playSymphony:n=>{l.auditionSymphonyTrack(n)},playFoley:n=>{l.playFoley(n)},applyOptions:n=>{l.applyOptions(n)},duckForVoice:(n=2600)=>{l.setVoiceDucking(!0),window.setTimeout(()=>l.setVoiceDucking(!1),n)},getChannelLevels:()=>{const n=l.getChannelLevels();return{left:n.masterL,right:n.masterR,peak:Math.max(n.masterL,n.masterR)}}},questionEngine:{drawCalibratedClue:async n=>se.drawClue({stageNumber:n.stageNumber,difficultyRange:n.difficultyBand,domainId:n.domainId,toyFamily:n.toyFamily,toyId:n.toyId,markSeen:!0}),getSeenCount:()=>Y.getSeenCount(),getTotalPoolSize:()=>1282554,wipeSeenMemory:async()=>{await Y.reset(!0)}},boardManager:{getAllBoards:()=>h.getAllBoards(),getBoardByNumber:n=>h.getBoardByNumber(n),createRuntimeState:(n,o,c)=>{const{state:u}=h.startBoardMatch({boardIdOrNumber:n.boardNumber,rivalName:o,maxTurns:c});return u},mountBoard:(n,o,c,u,p,S)=>{s.setPresenterPodiumVisible(!1),h.startBoardMatch({boardIdOrNumber:o.definition.boardNumber,rivalName:o.rivalName,overrideTwist:o.activeTwist,maxTurns:o.maxTurns,parent3D:s.boardMount,stageTheme:c});const y=h.getActiveState();y&&(y.nodes=o.nodes,y.turnNumber=o.turnNumber,y.ringRotationsDeg=[...o.ringRotationsDeg],y.playerScoreChips=o.playerScoreChips,y.playerMult=o.playerMult,y.playerTotalCash=o.playerTotalCash,y.rivalTotalCash=o.rivalTotalCash,y.streakCount=o.streakCount,h.syncRendererNow());const E=Me(o.definition.boardId),A=xe(o.definition.boardId),w=E?.ruleBannerShort??A?.customRuleSummary??o.definition.targetWinCondition,C=document.createElement("section");C.className="v6-board-hud-shell",C.dataset.v6Screen="board-3d";const Z=o.activeTwist!=="NONE"?oe[o.activeTwist]?.stageCallout??o.activeTwist.replace(/_/g," "):null,D=o.nodes.filter(_=>_.owner==="NONE").slice(0,4);C.innerHTML=`
          <div class="v6-board-top-deck">
            <div class="v6-board-identity">
              <div class="v6-board-kicker">BOARD ${String(o.definition.boardNumber).padStart(3,"0")}/100 · TURN ${o.turnNumber}/${o.maxTurns}${Z?` · TWIST: ${Z}`:""}</div>
              <div class="v6-board-title-row">
                <h2 class="v6-board-title">${o.definition.name}</h2>
                <span class="v6-board-rule-pill">${w}</span>
              </div>
            </div>
            <div class="v6-board-duel-strip">
              <span class="v6-board-score-chip is-you">YOU $${o.playerTotalCash.toLocaleString("en-US")} · x${o.playerMult.toFixed(1)}</span>
              <div class="v6-board-rival-cameo" id="v6BoardRivalCameo"></div>
              <span class="v6-board-score-chip is-rival">${o.rivalName.split(" ")[0].toUpperCase()} $${o.rivalTotalCash.toLocaleString("en-US")}</span>
            </div>
          </div>

          <div class="v6-board-stage-window">
            <div class="v6-board-hover-readout" id="v6BoardHoverReadout">
              ${u?`RIVAL TARGET: ${u.intentBadgeText} · TAP ANY 3D GEM OR QUICK CLUE`:"TAP ANY 3D CONTRAPTION GEM OR CHOOSE BELOW"}
            </div>
          </div>

          <div class="v6-board-bottom-dock">
            <div class="v6-board-node-scroller">
              ${D.map((_,I)=>`<button type="button" class="v6-board-node-btn ${o.alignedNodeIds.includes(_.nodeId)||I===0?"is-aligned":""}" data-node-id="${_.nodeId}">
                    <span class="v6-board-node-cat">${_.categoryLabel}</span>
                    <span class="v6-board-node-val">+${_.baseChips} CHIPS · x${(1+_.multBonus).toFixed(1)}${_.lockedChains>0?" · LOCKED":""}</span>
                  </button>`).join("")}
            </div>
            <div class="v6-board-controls-row">
              ${o.definition.family==="CLOCKWORK_ROTARY"||o.definition.family==="STEALTH_OPTICS_RADAR"||o.definition.family==="CARNIVAL_ARCADE"||o.definition.family==="ASTRAL_QUANTUM"?'<button type="button" class="v6-board-tactical-btn is-secondary" data-act="rotate-ring">ROTATE 3D RING</button>':""}
              ${p.slice(0,2).map(_=>`<button type="button" class="v6-board-tactical-btn is-foil" data-foil-id="${_.cardId}">${_.name}</button>`).join("")}
              ${D[0]?`<button type="button" class="v6-board-tactical-btn" data-node-id="${D[0].nodeId}">PLAY $${D[0].baseChips} CLUE</button>`:""}
            </div>
          </div>
        `,n.appendChild(C);const J=C.querySelector("#v6BoardRivalCameo"),Re=J?Ke(J,{portraitKey:We(c.stageId),sizePx:34,mood:"smug"}):null,ee=C.querySelector("#v6BoardHoverReadout");C.querySelectorAll("[data-node-id]").forEach(_=>{_.addEventListener("click",()=>{const I=_.dataset.nodeId;I&&S.onSelectNode(I)})}),C.querySelector('[data-act="rotate-ring"]')?.addEventListener("click",()=>{S.onRotateRing?.(0,60),y&&(y.ringRotationsDeg=[...o.ringRotationsDeg],h.syncRendererNow())}),C.querySelectorAll("[data-foil-id]").forEach(_=>{_.addEventListener("click",()=>{const I=_.dataset.foilId;I&&S.onUseFoilCard(I,D[0]?.nodeId)})});const F=s.renderer.domElement,te=_=>{const I=F.getBoundingClientRect(),M=(_.clientX-I.left)/Math.max(1,I.width)*2-1,k=-((_.clientY-I.top)/Math.max(1,I.height)*2-1);return[M,k]},ae=_=>{const[I,M]=te(_),k=h.pickAtNdc(I,M,s.camera);if(h.setHoveredNode(k.nodeId),k.boardPlanePoint&&o.activeTwist==="BLACKOUT_SPOTLIGHT"&&h.moveSpotlight(k.boardPlanePoint[0],k.boardPlanePoint[2]),k.nodeId&&ee){const N=o.nodes.find(G=>G.nodeId===k.nodeId);N&&(ee.textContent=`${N.categoryLabel} · +${N.baseChips} CHIPS · x${(1+N.multBonus).toFixed(1)}${N.owner!=="NONE"?` (${N.owner})`:" — TAP GEM TO PLAY"}`)}},ie=_=>{const[I,M]=te(_),k=h.pickAtNdc(I,M,s.camera);if(k.nodeId){const N=o.nodes.find(G=>G.nodeId===k.nodeId&&G.owner==="NONE");N&&(s.emitSparks(N.pos3d,36,4.4),S.onSelectNode(N.nodeId))}};return F.addEventListener("pointermove",ae,{passive:!0}),F.addEventListener("pointerup",ie),{dispose(){F.removeEventListener("pointermove",ae),F.removeEventListener("pointerup",ie),Re?.destroy(),h.dispose(),s.setPresenterPodiumVisible(null),C.remove()}}}},twistDirector:{pickHalftimeTwist:n=>n.definition.defaultTwist!=="NONE"?n.definition.defaultTwist:"HIGH_VOLTAGE_CHAIN",applyTwistMutation:(n,o)=>{n.activeTwist=o;const c=oe[o];return c?`${c.title} — ${c.rulesSummary}`:`Stage Twist: ${o}`},applyFoilEffect:(n,o,c)=>{const u=h.twistDirector.applyFoilTrickCard(n,o,c);return{applied:u.applied,message:u.summary,frozeRival:o.effectKind==="FREEZE_NODE",screwedRival:o.effectKind==="SCREW_RIVAL",doubleMult:o.effectKind==="DOUBLE_MULT"}}},toyManager:{getAllToys:()=>T.getAllToys(),getToyByNumber:n=>T.getToy(n),mountToy:(n,o,c,u)=>{s.setPresenterPodiumVisible(!1);const p=u.options.timerPaceMode==="RELAXED_PLUS_4S"?4:0,S=T.mountToy(n,{clue:c,toyId:o.toyId,toyNumber:o.toyNumber,stageTheme:u.stageTheme,stageWorldId:u.stageTheme.stageId,timerBonusSeconds:p,onSfx:u.onPlayFoley,onResolve:y=>{y.correct&&s.emitSparks([0,1,0],44,5),u.onResolve(y)}});return{dispose(){S.dispose(),s.setPresenterPodiumVisible(null)}}}},trapdoorEngine:{getTrapdoorIds:()=>de.map(n=>n.pitId),mountTrapdoor:(n,o)=>{s.setPresenterPodiumVisible(!1);const c=de.some(p=>p.pitId===o.trapdoorId)?o.trapdoorId:void 0,u=$e(n,{pitId:c,onSfx:o.onPlayFoley,onComplete:p=>{p.survived&&s.emitSparks([0,-2.5,0],56,5.8),o.onComplete({trapdoorId:p.pitId,survived:p.survived,secondsRemaining:p.secondsRemaining,summaryText:`${p.pitName} (${p.actionTag})`})}});return{dispose(){u.dispose(),s.setPresenterPodiumVisible(null)}}}},propTrunk:{evaluateRelicCascade:n=>{const o=qe({baseChips:n.baseChips,baseMult:n.baseMult,equippedRelicIds:[...n.equippedRelicIds],streakCount:n.streakCount,survivedTrapdoorCount:a.getState().matchMemory.survivedTrapdoorCount,bankrollCash:a.getState().bankrollCash,stageHeat:25});return{totalChips:o.finalChips,finalMult:o.finalMult,cashEarned:o.totalPayout,triggeredRelicIds:o.steps.map(c=>c.relicId)}},mountTrunk:(n,o)=>{s.setPresenterPodiumVisible(!1);const c=document.createElement("div");c.className="v6-trunk-stage-wrap",n.appendChild(c);let u={bankrollCash:o.career.bankrollCash,equippedRelicIds:[...o.career.equippedRelicIds],ownedFoilCardIds:o.career.heldFoilCards.map(E=>E.cardId),maxRelicSlots:o.career.maxRelicSlots,maxFoilSlots:3,streakCount:o.career.matchMemory.maxStreakReached,survivedTrapdoorCount:o.career.matchMemory.survivedTrapdoorCount,stageHeat:o.nextEpisode.stageMeta.stageNumber*10};const p=o.backstageBeat?o.backstageBeat.lines.join(" "):"Grab a rigged relic and order +MULT left of xMULT before Sloane flips the stage breakers.",S=E=>{for(const A of E.equippedRelicIds)if(!u.equippedRelicIds.includes(A)){const w=ce.get(A);w&&o.onBuyEquipRelic(A,w.costCash)}for(const A of u.equippedRelicIds)if(!E.equippedRelicIds.includes(A)){o.onUnequipRelic(A);const w=ce.get(A);w&&a.adjustBankroll(Math.round(w.costCash*.5))}a.setEquippedRelicOrder(E.equippedRelicIds);for(const A of E.ownedFoilCardIds)if(!u.ownedFoilCardIds.includes(A)){const w=Ye.get(A)??Qe.find(C=>C.cardId===A);w&&o.onBuyFoilCard(w)}u={...E,equippedRelicIds:[...E.equippedRelicIds],ownedFoilCardIds:[...E.ownedFoilCardIds]}},y=Ge(c,{state:u,seed:o.nextEpisode.episodeNumber*9973,nextTwistPreview:o.upcomingTwistPreview.replace(/_/g," "),frankieGreeting:p,onSfx:E=>l.playFoley(E),onStateChange:S,onContinueToStage:E=>{S(E),o.onLaunchNextBroadcast()}});return{dispose(){y.dispose(),c.remove(),s.setPresenterPodiumVisible(null)}}}},showrunner:{pickLiveQuip:(n,o)=>{const c=n[0]??"clue_correct",u=R(o.episodeNumber);return b.selectLiveQuip(c,{stageWorldId:u.stageMeta.stageId,episodeNumber:o.episodeNumber})},pickBackstageBeat:n=>{const o=R(n.episodeNumber),c=b.selectBackstageBeat(n,{stageWorldId:o.stageMeta.stageId});return b.markBeatPlayed(c.beatId),c}},lobbyView:{mount:(n,o)=>{s.setPresenterPodiumVisible(!0);const c=new Ve({activeStageId:o.activeStage.stageId,symphonyEnabled:o.career.options.musicEnabled,optionsState:o.career.options,telemetry:{bankrollCash:o.career.bankrollCash,currentEpisode:o.career.currentEpisode,completedEpisodes:o.career.completedEpisodes.length,unlockedStages:o.career.unlockedStageWorlds.length,earnedHonorCount:o.career.unlockedAwardIds.length,pinnedMedalCount:o.career.pinnedPodiumMedalIds.length},callbacks:{onSelectAction:u=>{switch(u){case"CAMPAIGN_ROAD":o.onStartCampaign(o.career.currentEpisode);break;case"QUICK_SHOW_100":o.onStartQuickShow(o.activeStage.stageId);break;case"TRAPDOOR_GAUNTLET":o.onStartTrapdoorGauntlet();break;case"PROP_TRUNK":o.onOpenTrunk();break;case"TROPHY_VAULT":o.onOpenTrophyVault();break;case"OPTIONS_CONSOLE":o.onOpenOptions();break}},onLaunchEpisode:(u,p)=>{o.onStartCampaign(p)},onPreviewStageWorld:u=>{o.onSelectStagePreview(u);const p=re(u);l.auditionSymphonyTrack(p.symphonyTrack)},onToggleSymphony:u=>{const p=a.updateOptions({musicEnabled:u});le(p),l.applyOptions(p)},onToggleFullscreen:()=>{z()},onPlayFoley:u=>l.playFoley(u)}});return c.mount(n),{dispose:()=>c.dispose()}}},trophyVaultView:{mount:(n,o)=>{s.setPresenterPodiumVisible(!1);const c=new Ue({unlockedAwardIds:o.career.unlockedAwardIds,pinnedMedalIds:o.career.pinnedPodiumMedalIds,resolutionTier:o.career.options.resolutionTier,onPinnedMedalsChange:u=>{const p=new Set(a.getState().pinnedPodiumMedalIds),S=new Set(u);for(const y of p)S.has(y)||o.onTogglePinMedal(y);for(const y of S)p.has(y)||o.onTogglePinMedal(y)},onPlayFoley:u=>l.playFoley(u),onClose:()=>o.onBack()});return c.mount(n),{dispose:()=>{c.dispose(),s.setPresenterPodiumVisible(null)}}}},optionsConsoleView:{mount:(n,o)=>{s.setPresenterPodiumVisible(!1);const c=R(a.getState().currentEpisode),u=new He({initialState:o.options,corpusTelemetry:{seenCount:o.seenClueCount,totalCount:o.totalCluePool,currentCampaignStage:c.stageMeta.stageNumber,currentCampaignEpisode:a.getState().currentEpisode},activeTrackId:o.stageTheme.symphonyTrack,onChange:p=>{le(p),o.onUpdateOptions(p)},onAuditionTrack:(p,S)=>{S?o.onAuditionSymphony(p):l.stopSymphony()},onPlayFoley:p=>l.playFoley(p),onResetCampaign:()=>o.onResetCampaign(),onWipeLifetimeMemory:()=>{o.onWipeClueMemory()},onClose:()=>o.onBack()});return u.mount(n),{dispose:()=>{u.dispose(),s.setPresenterPodiumVisible(null)}}}},ceremonyView:{mount:(n,o)=>{s.setPresenterPodiumVisible(!0);const c=o.summary,u=new De({resolutionTier:a.getOptions().resolutionTier,data:{won:c.won,stageId:c.episode.stageMeta.stageId,stageTitle:c.episode.stageMeta.title,episodeNumber:c.episode.episodeNumber,boardName:c.episode.episodeLabel,baseChips:Math.max(200,Math.round(c.playerCash*.5)),streakMult:Math.max(1,1+c.maxStreak*.25),relicMult:Math.max(1,1+a.getState().equippedRelicIds.length*.4),trapdoorSaves:c.trapdoorsSurvived,trapdoorBonusCash:c.trapdoorsSurvived*150,finalPayoutCash:c.purseAwarded,newBankrollCash:a.getState().bankrollCash,rivalName:c.rivalName,rivalCash:c.rivalCash,cluesSolved:Math.max(1,c.episode.turnCount-c.episodeMisses),cluesTotal:c.episode.turnCount,maxStreak:c.maxStreak,newlyUnlockedHonorIds:c.newlyUnlockedAwards.map(p=>p.awardId),nextTargetHonorId:Fe.find(p=>!a.getState().unlockedAwardIds.includes(p.awardId))?.awardId,hostClosingLine:c.won?'Julian Sterling: "Sloane just snapped another pencil in the control booth. Spend that purse wisely."':'Frankie DeLuca: "Shake it off, kid. Step behind the velvet curtain and let us rig the next board."'},callbacks:{onEnterPropTrunk:()=>o.onGoToTrunk(),onNextOrReplay:()=>o.onPlayNextOrRematch(),onReturnHub:()=>o.onReturnLobby(),onPlayFoley:p=>l.playFoley(p)}});return u.mount(n),{dispose:()=>u.dispose()}}}});return v.start(window.location.search),{director:v,stageEngine:s,dispose(){f(),h.dispose(),v.dispose()}}}const Mt=Object.assign({"./pwa/OfflineServiceWorkerClient.ts":()=>et(()=>import("./OfflineServiceWorkerClient-CzUsTQTD.js"),[],import.meta.url)}),ye="ws_sw_upgraded_v6_r1";function xt(){if(typeof window>"u"||!("serviceWorker"in navigator))return;try{if(new URLSearchParams(window.location.search).get("nosw")==="1")return}catch{}const d=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener("controllerchange",()=>{if(d){try{if(sessionStorage.getItem(ye)==="1")return;sessionStorage.setItem(ye,"1")}catch{}window.location.reload()}});const e=()=>{navigator.serviceWorker.register("./sw.js",{scope:"./",updateViaCache:"none"}).then(a=>{a.update().catch(()=>{})}).catch(()=>{});const t=Mt["./pwa/OfflineServiceWorkerClient.ts"];typeof t=="function"&&t().then(a=>a.registerOfflineServiceWorker?.()).catch(()=>{})};document.readyState==="complete"?window.setTimeout(e,0):window.addEventListener("load",()=>{window.setTimeout(e,0)},{once:!0})}function Pt(){const d=document.getElementById("canvas-root"),e=document.getElementById("vfx-canvas"),t=document.getElementById("ui-root");if(!d||!t)throw new Error("Missing #canvas-root or #ui-root mount elements in index.html.");const a=Ot(d,e,t);window.addEventListener("beforeunload",()=>{a.dispose()}),xt()}Pt();
