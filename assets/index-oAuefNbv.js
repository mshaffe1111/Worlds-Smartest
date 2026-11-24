const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./QuestionGeneratorV4-Bq6C4-NY.js","./forge-SPRYYeFW.js","./systems-DSvNuDuC.js","./TourTrunkPinboardView-D8qbw2u1.js","./TopicJukeboxView-Bo75Q76K.js","./ui-modals-CDlOh7Hz.js","./meta-DtKNs8SG.js","./narrative-zOqZ7SbE.js","./three-BptGkjiW.js","./modes-CnzZ21_W.js","./meta-BgWnOjM4.css","./VoicedStoryTheaterView-CrTMEA9q.js","./LivingStageBoardView-DI4Z1qwv.js","./StageBoardRulesV5-Bd6tQPFP.js","./ChallengerAI-BhKzdgZh.js","./ScoringV4-BqNmoRGp.js","./SpotlightLozengeRendererV5-ClixiOlU.js"])))=>i.map(i=>d[i]);
import{S as Je,H as et}from"./systems-DSvNuDuC.js";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const s of i)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function t(i){const s={};return i.integrity&&(s.integrity=i.integrity),i.referrerPolicy&&(s.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?s.credentials="include":i.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function o(i){if(i.ep)return;i.ep=!0;const s=t(i);fetch(i.href,s)}})();const tt="modulepreload",ot=function(l,e){return new URL(l,e).href},Te={},R=function(e,t,o){let i=Promise.resolve();if(t&&t.length>0){let a=function(d){return Promise.all(d.map(h=>Promise.resolve(h).then(p=>({status:"fulfilled",value:p}),p=>({status:"rejected",reason:p}))))};const r=document.getElementsByTagName("link"),n=document.querySelector("meta[property=csp-nonce]"),c=n?.nonce||n?.getAttribute("nonce");i=a(t.map(d=>{if(d=ot(d,o),d in Te)return;Te[d]=!0;const h=d.endsWith(".css"),p=h?'[rel="stylesheet"]':"";if(!!o)for(let b=r.length-1;b>=0;b--){const v=r[b];if(v.href===d&&(!h||v.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${d}"]${p}`))return;const m=document.createElement("link");if(m.rel=h?"stylesheet":tt,h||(m.as="script"),m.crossOrigin="",m.href=d,c&&m.setAttribute("nonce",c),document.head.appendChild(m),h)return new Promise((b,v)=>{m.addEventListener("load",b),m.addEventListener("error",()=>v(new Error(`Unable to preload CSS for ${d}`)))})}))}function s(a){const r=new Event("vite:preloadError",{cancelable:!0});if(r.payload=a,window.dispatchEvent(r),!r.defaultPrevented)throw a}return i.then(a=>{for(const r of a||[])r.status==="rejected"&&s(r.reason);return e().catch(s)})},fo={GOLD_HISTORY:{id:"GOLD_HISTORY",shortLabel:"History",fullLabel:"History & World Affairs",accentHex:"#f5c451",surfaceHex:"#3a2b10",domainIds:[0,8]},SAPPHIRE_GEO:{id:"SAPPHIRE_GEO",shortLabel:"Geography",fullLabel:"Geography & Wonders",accentHex:"#46a8ff",surfaceHex:"#0f2947",domainIds:[2]},EMERALD_SCIENCE:{id:"EMERALD_SCIENCE",shortLabel:"Science",fullLabel:"Science, Tech & Nature",accentHex:"#34d993",surfaceHex:"#0e3327",domainIds:[1,6,7]},MAGENTA_POP:{id:"MAGENTA_POP",shortLabel:"Entertainment",fullLabel:"Film, Music & Pop Culture",accentHex:"#f26498",surfaceHex:"#3b1528",domainIds:[4]},ORANGE_SPORTS:{id:"ORANGE_SPORTS",shortLabel:"Sports & Logic",fullLabel:"Sports, Games & Logic",accentHex:"#ff9347",surfaceHex:"#3d2010",domainIds:[5,11]},VIOLET_ARTS:{id:"VIOLET_ARTS",shortLabel:"Arts & Culture",fullLabel:"Arts, Literature & Culinary",accentHex:"#b47cff",surfaceHex:"#281845",domainIds:[3,9,10]}};function it(l){switch(l){case 0:case 8:return"GOLD_HISTORY";case 2:return"SAPPHIRE_GEO";case 1:case 6:case 7:return"EMERALD_SCIENCE";case 4:return"MAGENTA_POP";case 5:case 11:return"ORANGE_SPORTS";case 3:case 9:case 10:default:return"VIOLET_ARTS"}}const Ve={maxWelcome:"./assets/v5/cast/max_welcome.webp",maxHype:"./assets/v5/cast/max_hype.webp",maxWince:"./assets/v5/cast/max_wince.webp",challengers:{frankie_russo:"./assets/v5/cast/frankie.webp",denise_park:"./assets/v5/cast/denise.webp",trevor_blake:"./assets/v5/cast/trevor.webp",priya_nair:"./assets/v5/cast/priya.webp",alistair_finch:"./assets/v5/cast/alistair.webp",kenji_takahashi:"./assets/v5/cast/kenji.webp",nadia_al_mansoor:"./assets/v5/cast/nadia.webp",viktor_volkov:"./assets/v5/cast/viktor.webp"}},N={1:"./assets/v5/venues/tier1_oakridge.webp",2:"./assets/v5/venues/tier2_lyric.webp",3:"./assets/v5/venues/tier3_channel7.webp",4:"./assets/v5/venues/tier4_primetime.webp",5:"./assets/v5/venues/tier5_london.webp",6:"./assets/v5/venues/tier6_tokyo.webp",7:"./assets/v5/venues/tier7_cairo.webp",8:"./assets/v5/venues/tier8_finale.webp"},oe={LOCAL_PUB:"./assets/v5/greenroom/greenroom_local.webp",TV_DRESSING_ROOM:"./assets/v5/greenroom/greenroom_tv.webp",GLOBAL_VIP_SUITE:"./assets/v5/greenroom/greenroom_global.webp"},mo="./assets/v5/greenroom/tour_corkboard_bg.webp",Y={openCall:"./assets/v5/story/story_open_call.webp",scoutBreakthrough:"./assets/v5/story/story_scout_breakthrough.webp",worldCoronation:"./assets/v5/story/story_world_coronation.webp"},rt=[1,2,3,4,5],at="ws_v5_campaign_slot_",ce="ws_v5_active_campaign_slot",st="./data/v5_story_acts_1_2.json",nt="./data/v5_story_acts_3_5.json",te=["frankie_russo","denise_park","trevor_blake","priya_nair","alistair_finch","kenji_takahashi","nadia_al_mansoor","viktor_volkov"],Ce=["INDEPENDENT","APEX_NETWORK","VELVET_SOCIETY"],lt=["frankies_coaster","denises_red_pen","trevors_hot_mic","priyas_adrenaline","alistairs_pocketwatch","kenjis_cyber_link","nadias_astrolabe","grassroots_megaphone","syndicate_golden_dice","velvet_wax_seal","underdog_chip","screw_shield"],Ie=["PEOPLES_CHAMPION","NETWORK_SOVEREIGN","VELVET_GRANDMASTER","CINDERELLA_REDEMPTION"],_e=25,dt=60,ne=-25,ct=-60,U=3,xe=60,le={INDEPENDENT:{id:"INDEPENDENT",name:"Oakridge Grassroots",shortName:"Independent",tagline:"Zero corporate strings, roaring hometown support, and pass-the-hat rescue funds.",purseMultiplier:1,dareBonusMultiplier:1,audienceMultiplier:1.15,signatureCharmId:"grassroots_megaphone",charmUnlockRep:25,accentHex:"#2ee09a"},APEX_NETWORK:{id:"APEX_NETWORK",name:"Apex Network Syndicate",shortName:"Apex Network",tagline:"Prime-time ratings machine: +25% stage purses and lucrative Showman Dares.",purseMultiplier:1.25,dareBonusMultiplier:1.3,audienceMultiplier:1.1,signatureCharmId:"syndicate_golden_dice",charmUnlockRep:25,accentHex:"#f5be49"},VELVET_SOCIETY:{id:"VELVET_SOCIETY",name:"The Velvet Society",shortName:"Velvet Society",tagline:"Wax-sealed midnight salons, forbidden board twists, and rare Podium Lucky Charms.",purseMultiplier:1.15,dareBonusMultiplier:1.15,audienceMultiplier:1,signatureCharmId:"velvet_wax_seal",charmUnlockRep:25,accentHex:"#c480ff"}},q={frankie_russo:{challengerId:"frankie_russo",shortKey:"frankie",displayName:'Frankie "Last Call" Russo',nicknameTitle:"Unbeaten Oakridge Tavern Champ",tierNumber:1,signatureCharmId:"frankies_coaster",allyCallSceneId:"scene_ally_call_frankie",weakDomainLabel:"Classical Arts & Architecture",allyCoachingTip:"Keep my lucky cork coaster on your podium—when the cameras make you blink on a 2x Double Down, your first miss costs zero.",grudgeSabotageKind:"DOUBLE_BOUNTY_WEAK_DOMAIN",grudgeSabotageTaunt:"You talked loud in my bar, kid. I tipped the bookies off—there is a Double Bounty sitting right on your shakiest column tonight."},denise_park:{challengerId:"denise_park",shortKey:"denise",displayName:"Denise Park",nicknameTitle:"Retired AP History Legend",tierNumber:2,signatureCharmId:"denises_red_pen",allyCallSceneId:"scene_ally_call_denise",weakDomainLabel:"Modern Pop & Gaming",allyCoachingTip:"Take my red grading pen. It crosses out one lazy decoy on History and Literature clues before the clock even sweats.",grudgeSabotageKind:"EARLY_SCREW_AMBUSH",grudgeSabotageTaunt:"Sloppy footnotes deserve pop quizzes. Expect a surprise SCREW buzzer on your opening turn tonight."},trevor_blake:{challengerId:"trevor_blake",shortKey:"trevor",displayName:"Trevor Blake",nicknameTitle:"Daytime TV 19-Game Streak Star",tierNumber:3,signatureCharmId:"trevors_hot_mic",allyCallSceneId:"scene_ally_call_trevor",weakDomainLabel:"Earth Science & Deep Nature",allyCoachingTip:"Clip my hot-mic lapel charm onto your desk—once your streak hits three, the studio crowd hands you +75 pure heat.",grudgeSabotageKind:"SPONSOR_SMEAR",grudgeSabotageTaunt:"I dropped a little whisper in the Apex ratings booth. Let us see how you handle a Double Bounty spotlight under prime-time glare."},priya_nair:{challengerId:"priya_nair",shortKey:"priya",displayName:"Dr. Priya Nair",nicknameTitle:"ER Trauma Surgeon & Speed-Logic Phenom",tierNumber:4,signatureCharmId:"priyas_adrenaline",allyCallSceneId:"scene_ally_call_priya",weakDomainLabel:"Sports & Trivia Folklore",allyCoachingTip:"Pulse steady, eyes on the arc. My adrenaline vial turns any clutch lock under five seconds into a +120 surge.",grudgeSabotageKind:"EARLY_SCREW_AMBUSH",grudgeSabotageTaunt:"Triage lesson: never insult the surgeon who reads your charts. Watch your weakest column closely."},alistair_finch:{challengerId:"alistair_finch",shortKey:"alistair",displayName:"Lord Alistair Finch",nicknameTitle:"Oxford Quiz Society Fellow",tierNumber:5,signatureCharmId:"alistairs_pocketwatch",allyCallSceneId:"scene_ally_call_alistair",weakDomainLabel:"Street Pop Culture",allyCoachingTip:"Borrow my brass pocketwatch before Cairo and the Finale—eight extra seconds on every shot clock turns panic into poetry.",grudgeSabotageKind:"DOUBLE_BOUNTY_WEAK_DOMAIN",grudgeSabotageTaunt:"Bad form travels faster than Concordes. I have personally sponsored a Double Bounty against your weakest chair."},kenji_takahashi:{challengerId:"kenji_takahashi",shortKey:"kenji",displayName:"Kenji Takahashi",nicknameTitle:"Shibuya Speed-Circuit Prodigy",tierNumber:6,signatureCharmId:"kenjis_cyber_link",allyCallSceneId:"scene_ally_call_kenji",weakDomainLabel:"Ancient Mythology",allyCoachingTip:"Plug in my Shibuya cyber-link charm. Lock clean inside six seconds and it injects a +150 Speed Surge straight onto your score.",grudgeSabotageKind:"EARLY_SCREW_AMBUSH",grudgeSabotageTaunt:"You chose arrogance over precision. I mapped your slowest response latency and handed it to your next opponent."},nadia_al_mansoor:{challengerId:"nadia_al_mansoor",shortKey:"nadia",displayName:"Nadia Al-Mansoor",nicknameTitle:"Cairo Polymath & Velvet Laureate",tierNumber:7,signatureCharmId:"nadias_astrolabe",allyCallSceneId:"scene_ally_call_nadia",weakDomainLabel:"Late-Night Pop Trivia",allyCoachingTip:"Viktor Volkov guards the crown wedges like a fortress. Carry my brass astrolabe—every Wedge tile you claim pays +150 extra.",grudgeSabotageKind:"DOUBLE_BOUNTY_WEAK_DOMAIN",grudgeSabotageTaunt:"A scholar who burns bridges enters the Finale blind. Expect my Velvet patrons to double the stakes on your blind spot."},viktor_volkov:{challengerId:"viktor_volkov",shortKey:"viktor",displayName:"Grandmaster Viktor Volkov",nicknameTitle:"Undefeated World Champion",tierNumber:8,signatureCharmId:"screw_shield",allyCallSceneId:"scene_ally_call_viktor",weakDomainLabel:"Pop Improv",allyCoachingTip:"You played the board with discipline rather than noise. Keep this brass Screw Shield—even a champion respects an equal.",grudgeSabotageKind:"EARLY_SCREW_AMBUSH",grudgeSabotageTaunt:"One point four billion viewers are watching your hands shake. Tonight I will dismantle your favorite column first."}},Fe=[{mechanicId:"read_in_2s",title:"2-Second Untimed Read-In",phase:"COLD_OPEN",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"welcome",diegeticLine:"Deep breath, rookie—the brass shot clock stays frozen for two full seconds while you read every clue. Read first, strike smart.",shortCueBanner:"STAGE RULE · 2S UNTIMED READ-IN",voiceClipId:"vo_max_read_in_tip_1"},{mechanicId:"double_down_2x",title:"2x Double Down Throw-Switch",phase:"COLD_OPEN",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"hype",diegeticLine:"See that heavy brass 2x Double Down throw-switch on your podium? Flip it before locking in when you smell blood—double points on a hit, half-back on a slip.",shortCueBanner:"PODIUM SWITCH · 2X DOUBLE DOWN",voiceClipId:"vo_max_double_down_1"},{mechanicId:"clue_coins",title:"Brass Clue & 50/50 Coins",phase:"COLD_OPEN",speaker:"producer_sam",speakerName:"Producer Sam",speakerRole:"Backstage Showrunner",hostPose:"welcome",diegeticLine:"I slipped two stamped brass tokens onto your ledge: 50/50 shears off two decoys, and Clue whispers a lateral nudge without burning your streak.",shortCueBanner:"PODIUM TOKENS · 50/50 & CLUE COINS",voiceClipId:"vo_sam_1"},{mechanicId:"gadget_dial_cables",title:"Analog Speedometer Dial & Match-4 Neon Cables",phase:"COLD_OPEN",triggerFormat:"MATCH_4",speaker:"frankie_russo",speakerName:'Frankie "Last Call" Russo',speakerRole:"Unbeaten Oakridge Champ",hostPose:"hype",diegeticLine:"We do not just mash four buttons here, kid. Some clues drop a live brass speedometer dial or a braided neon switchboard—spin clean, plug tight, pull the lock lever.",shortCueBanner:"STAGE GADGETS · DIAL & NEON CABLES",voiceClipId:"vo_cold_3"},{mechanicId:"six_wedge_medallion",title:"6-Wedge Jewel Championship Medallion",phase:"ACT_1",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"hype",diegeticLine:"Look up at that six-jewel Championship Medallion. Claim Crown tiles across six subjects to light every gem—each glowing wedge powers up your podium rating.",shortCueBanner:"BOARD GOAL · 6-WEDGE MEDALLION",voiceClipId:"vo_max_wedge_earned_1"},{mechanicId:"row_col_sweep_jackpots",title:"Row & Column Stage Sweep Jackpots",phase:"ACT_1",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"hype",diegeticLine:"Clear every tile across any full row or down any full column and the studio sirens blow—an instant +300 Stage Sweep Jackpot plus a bonus Jewel Wedge.",shortCueBanner:"COMBO PAYOUT · ROW/COL SWEEP (+300)",voiceClipId:"vo_max_stage_sweep_1"},{mechanicId:"chain_locks_3d",title:"3D Iron Chain & Brass Padlock Reactions",phase:"ACT_1",speaker:"denise_park",speakerName:"Denise Park",speakerRole:"Retired AP History Legend",hostPose:"welcome",diegeticLine:"Those heavy iron chains are not decoration. Nail an adjacent open tile and the lightning arc shatters the brass padlock right off the big-money vault beside it.",shortCueBanner:"CHAIN REACTION · SHATTER PADLOCKS",voiceClipId:"vo_max_chain_shatter_1"},{mechanicId:"screw_rival_buzzer",title:"Red SCREW RIVAL! Arcade Buzzer",phase:"ACT_1",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"hype",diegeticLine:"Spot a brutal tile in your opponent’s weakest subject? Slam that glossy red SCREW RIVAL dome on your desk—force them into the spotlight and steal the entire pot if they choke!",shortCueBanner:"SABOTAGE · RED SCREW RIVAL BUZZER",voiceClipId:"vo_max_screw_slammed_1"},{mechanicId:"tour_trunk_yarn_branches",title:"Contender Tour Trunk & Red/Gold Yarn Branches",phase:"ACT_1",speaker:"producer_sam",speakerName:"Producer Sam",speakerRole:"Backstage Showrunner",hostPose:"welcome",diegeticLine:"Everything lives inside your leather Tour Trunk. Gold yarn tracks the prime-time main bracket; crimson yarn leads down the late-night Redemption circuit if you ever take a knockdown.",shortCueBanner:"OVERWORLD · TOUR TRUNK YARN ROUTES",voiceClipId:"vo_sam_2"},{mechanicId:"sponsor_dares",title:"3 Competing Sponsors & On-Air Showman Dares",phase:"ACT_1",speaker:"producer_sam",speakerName:"Producer Sam",speakerRole:"Backstage Showrunner",hostPose:"welcome",diegeticLine:"Three backers are watching your clip reel: Oakridge Grassroots, Apex Network, and the Velvet Society. Hit their on-air Showman Dares for bonus bankroll and exclusive backstage doors.",shortCueBanner:"SPONSORS · SHOWMAN DARES & CONTRACTS",voiceClipId:"vo_sam_3"},{mechanicId:"podium_lucky_charms",title:"Equipable Podium Lucky Charms",phase:"ACT_1",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"welcome",diegeticLine:"Win over rivals backstage or conquer secret salons to earn Podium Lucky Charms. Seat up to three physical trinkets in your brass desk cups before walking on air.",shortCueBanner:"LOADOUT · 3 PODIUM LUCKY CHARMS",voiceClipId:"vo_sam_4"},{mechanicId:"topology_showcase_starter",title:"Classic Showcase Board",phase:"BOARD_TWIST",triggerTwist:"showcase_starter",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"welcome",diegeticLine:"Tonight is a Classic Showcase layout—every column mixes live formats from cables to dials, with a Spinning Wheel and Crown Wedge waiting right in the heart of the board.",shortCueBanner:"BOARD TWIST 1/14 · SHOWCASE STARTER",voiceClipId:"vo_max_board_welcome_1"},{mechanicId:"topology_chain_padlocks",title:"3D Chain-Reaction Padlocks",phase:"BOARD_TWIST",triggerTwist:"chain_padlocks",speaker:"denise_park",speakerName:"Denise Park",speakerRole:"Retired AP History Legend",hostPose:"welcome",diegeticLine:"Padlock Neighbors is live: the top vaults are wrapped in crossed iron chains. Carve smart paths through adjacent tiles to crack them open before I do.",shortCueBanner:"BOARD TWIST 2/14 · 3D CHAIN PADLOCKS",voiceClipId:"vo_max_chain_shatter_2"},{mechanicId:"topology_spiral_labyrinth",title:"Spiral Labyrinth Core",phase:"BOARD_TWIST",triggerTwist:"spiral_labyrinth",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"hype",diegeticLine:"Welcome to the Spiral Labyrinth! Outer ring tiles unlock the inner coil, spiraling all the way to a blazing 1,000-point Core tile dead center.",shortCueBanner:"BOARD TWIST 3/14 · SPIRAL LABYRINTH CORE",voiceClipId:"vo_max_board_welcome_2"},{mechanicId:"topology_pyramid_ascent",title:"Pyramid Ascent",phase:"BOARD_TWIST",triggerTwist:"pyramid_ascent",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"hype",diegeticLine:"Pyramid Ascent rules: start at the broad base row and climb upward—each cleared foundation unlocks the steeper summit vaults directly overhead.",shortCueBanner:"BOARD TWIST 4/14 · PYRAMID ASCENT",voiceClipId:"vo_max_board_welcome_3"},{mechanicId:"topology_fog_spotlight",title:"Fog-of-War Spotlight",phase:"BOARD_TWIST",triggerTwist:"fog_spotlight",speaker:"alistair_finch",speakerName:"Lord Alistair Finch",speakerRole:"Oxford Quiz Fellow",hostPose:"welcome",diegeticLine:"The theater lamps are dimmed to Fog-of-War Spotlight. Only lit perimeter tiles reveal their secrets—every answer swings the searchlight deeper into the dark.",shortCueBanner:"BOARD TWIST 5/14 · FOG-OF-WAR SPOTLIGHT",voiceClipId:"vo_alistair_walkout"},{mechanicId:"topology_time_bomb_hot_potato",title:"Time-Bomb Hot Potato",phase:"BOARD_TWIST",triggerTwist:"time_bomb_hot_potato",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"hype",diegeticLine:"Hear that sizzling fuse? Time-Bomb Hot Potato is ticking on the board—defuse the lit Blitz tile for bonus loot before the fuse jumps or blows!",shortCueBanner:"BOARD TWIST 6/14 · TIME-BOMB HOT POTATO",voiceClipId:"vo_max_buzzer_beater_1"},{mechanicId:"topology_tug_of_war_turf",title:"Tug-of-War Territory Turf",phase:"BOARD_TWIST",triggerTwist:"tug_of_war_turf",speaker:"trevor_blake",speakerName:"Trevor Blake",speakerRole:"Daytime TV Streak Champ",hostPose:"hype",diegeticLine:"Tug-of-War Turf tonight—every tile you win paints that square in your house color. Hold the majority of the stage at the final buzzer for a massive +500 Turf Bonus.",shortCueBanner:"BOARD TWIST 7/14 · TUG-OF-WAR TURF (+500)",voiceClipId:"vo_trevor_walkout"},{mechanicId:"topology_velvet_x_crossroads",title:"Velvet X-Crossroads",phase:"BOARD_TWIST",triggerTwist:"velvet_x_crossroads",speaker:"nadia_al_mansoor",speakerName:"Nadia Al-Mansoor",speakerRole:"Velvet Society Laureate",hostPose:"welcome",diegeticLine:"Velvet X-Crossroads: two gilded diagonal tracks cross the stage at 2x payout. Control the intersection and you control the night.",shortCueBanner:"BOARD TWIST 8/14 · VELVET X-CROSSROADS",voiceClipId:"vo_nadia_walkout"},{mechanicId:"topology_spotlight_roulette",title:"Spotlight Roulette Sweep",phase:"BOARD_TWIST",triggerTwist:"spotlight_roulette",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"hype",diegeticLine:"Spotlight Roulette is rolling! A roaming studio beam selects boosted jackpot squares each turn—catch the spotlight tile to supercharge your score.",shortCueBanner:"BOARD TWIST 9/14 · SPOTLIGHT ROULETTE",voiceClipId:"vo_max_power_play_1"},{mechanicId:"topology_power_play_minefield",title:"High-Roller Power-Play Minefield",phase:"BOARD_TWIST",triggerTwist:"power_play_minefield",speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",hostPose:"hype",diegeticLine:"Four concealed Power-Play Wager vaults are buried across this board. Trip one, dial your brass wager, and swing the entire leaderboard in a single heartbeat.",shortCueBanner:"BOARD TWIST 10/14 · POWER-PLAY MINEFIELD",voiceClipId:"vo_max_power_play_2"},{mechanicId:"topology_ice_fire_columns",title:"Ice & Fire Column Sabotage",phase:"BOARD_TWIST",triggerTwist:"ice_fire_columns",speaker:"kenji_takahashi",speakerName:"Kenji Takahashi",speakerRole:"Shibuya Speed-Logic Prodigy",hostPose:"welcome",diegeticLine:"Ice and Fire Columns are armed: frosted squares lock down an entire lane until you solve a glowing Flame tile to thaw the column for a crisp +200 burst.",shortCueBanner:"BOARD TWIST 11/14 · ICE & FIRE COLUMNS",voiceClipId:"vo_kenji_walkout"},{mechanicId:"topology_gold_fever_contagion",title:"Gold Fever Multiplier Contagion",phase:"BOARD_TWIST",triggerTwist:"gold_fever_contagion",speaker:"priya_nair",speakerName:"Dr. Priya Nair",speakerRole:"ER Surgeon & Blitz Strategist",hostPose:"hype",diegeticLine:"Multiplier Contagion: string consecutive hits together and golden 2x fever spreads into adjacent squares—keep the streak alive and watch the whole grid ignite.",shortCueBanner:"BOARD TWIST 12/14 · MULTIPLIER CONTAGION",voiceClipId:"vo_priya_walkout"},{mechanicId:"topology_oxford_pick_ban",title:"Oxford Pick & Ban Category Draft",phase:"BOARD_TWIST",triggerTwist:"oxford_pick_ban",speaker:"alistair_finch",speakerName:"Lord Alistair Finch",speakerRole:"Oxford Quiz Fellow",hostPose:"welcome",diegeticLine:"Before first buzz we play the Oxford Pick & Ban Draft: strike your rival’s pet subject off the marquee and lock in a favorite lane of your own.",shortCueBanner:"BOARD TWIST 13/14 · OXFORD PICK & BAN",voiceClipId:"vo_alistair_trap_taunt"},{mechanicId:"topology_championship_gauntlet",title:"6-Column Championship Gauntlet",phase:"BOARD_TWIST",triggerTwist:"championship_gauntlet",speaker:"viktor_volkov",speakerName:"Grandmaster Viktor Volkov",speakerRole:"Defending World Champion",hostPose:"hype",diegeticLine:"Six columns, chained apex vaults, roving spotlights, and one point four billion eyes. Everything you learned across five acts collides in the Championship Gauntlet.",shortCueBanner:"BOARD TWIST 14/14 · 6-COL GAUNTLET",voiceClipId:"vo_viktor_walkout"}],he=new Map(Fe.map(l=>[l.mechanicId,l])),$e={showcase_starter:"topology_showcase_starter",chain_padlocks:"topology_chain_padlocks",spiral_labyrinth:"topology_spiral_labyrinth",pyramid_ascent:"topology_pyramid_ascent",fog_spotlight:"topology_fog_spotlight",time_bomb_hot_potato:"topology_time_bomb_hot_potato",tug_of_war_turf:"topology_tug_of_war_turf",velvet_x_crossroads:"topology_velvet_x_crossroads",spotlight_roulette:"topology_spotlight_roulette",power_play_minefield:"topology_power_play_minefield",ice_fire_columns:"topology_ice_fire_columns",gold_fever_contagion:"topology_gold_fever_contagion",oxford_pick_ban:"topology_oxford_pick_ban",championship_gauntlet:"topology_championship_gauntlet"},de={PEOPLES_CHAMPION:"ending_peoples_champion",NETWORK_SOVEREIGN:"ending_network_sovereign",VELVET_GRANDMASTER:"ending_velvet_grandmaster",CINDERELLA_REDEMPTION:"ending_cinderella_redemption"},ze={PEOPLES_CHAMPION:{title:"The People's Champion",subtitle:"Independent Heart · Backed by Friends, Allies & 1.4 Billion Cheering Viewers"},NETWORK_SOVEREIGN:{title:"The Network Sovereign",subtitle:"Prime-Time Empire · Apex Syndicate Crown & Record-Shattering Showmanship"},VELVET_GRANDMASTER:{title:"The Velvet Grandmaster",subtitle:"Wax-Sealed Laureate · Master of Forbidden Boards & Underground Salons"},CINDERELLA_REDEMPTION:{title:"The Cinderella Redemption Crown",subtitle:"From 2 AM Diner Wildcards to the $10,000,000 World Stage — Unbreakable"}};function ht(l){return l===1||l===2||l===3||l===4||l===5}function ue(l){return`${at}${l}`}function Q(l){const e=Number(l);return Number.isFinite(e)?Math.max(-100,Math.min(100,Math.round(e))):0}function pe(l){const e=Q(l);return e>=dt?"SWORN_ALLY":e>=_e?"ALLY":e<=ct?"BITTER_NEMESIS":e<=ne?"GRUDGE":"RIVAL"}function Ye(l){const e=Math.round(Number(l)||0);return`${e<0?"-":""}$${Math.abs(e).toLocaleString("en-US")}`}function Ae(l){const e=Math.max(0,Math.round(Number(l)||0));if(e>=1e9){const t=e/1e9;return`${t>=10?t.toFixed(0):Number(t.toFixed(2))}B`}if(e>=1e6){const t=e/1e6;return`${t>=100?Math.round(t):Number(t.toFixed(1))}M`}if(e>=1e4){const t=e/1e3;return`${t>=100?Math.round(t):Number(t.toFixed(1))}K`}return e.toLocaleString("en-US")}function Me(l){return $e[l]??"topology_showcase_starter"}function ee(l){if(l.boardTwistId&&l.boardTwistId in $e)return l.boardTwistId;const e=`${l.showTitle} ${l.hookBlurb}`.toLowerCase();return/oxford|pick\s*&?\s*ban|category draft/.test(e)?"oxford_pick_ban":/ice\s*&?\s*fire|thaw|frozen column|flame tile/.test(e)?"ice_fire_columns":/contagion|gold fever|multiplier spread/.test(e)?"gold_fever_contagion":/minefield|power[- ]?play/.test(e)?"power_play_minefield":/time[- ]?bomb|hot potato|sizzling fuse|blitz/.test(e)?"time_bomb_hot_potato":/tug[- ]?of[- ]?war|territory|turf/.test(e)?"tug_of_war_turf":/pyramid|summit|ascent/.test(e)?"pyramid_ascent":/spiral|labyrinth|core/.test(e)?"spiral_labyrinth":/x[- ]?crossroads|diagonal/.test(e)?"velvet_x_crossroads":/gauntlet|6[- ]?column|championship/.test(e)||l.topology==="FINALE_GAUNTLET"?"championship_gauntlet":l.topology==="FOG_EXPLORER"?"fog_spotlight":l.topology==="SPOTLIGHT_ROULETTE"?"spotlight_roulette":l.topology==="CROSSROADS_HYBRID"?"velvet_x_crossroads":l.topology==="PADLOCK_NEIGHBORS"?"chain_padlocks":"showcase_starter"}function ge(l){return typeof l=="string"&&te.includes(l)}function ut(l){return typeof l=="string"&&Ce.includes(l)}function fe(l){return typeof l=="string"&&lt.includes(l)}function pt(l){return typeof l=="string"&&Ie.includes(l)}function Ee(){return{frankie_russo:0,denise_park:0,trevor_blake:0,priya_nair:0,alistair_finch:0,kenji_takahashi:0,nadia_al_mansoor:0,viktor_volkov:0}}function Re(){return{INDEPENDENT:10,APEX_NETWORK:0,VELVET_SOCIETY:0}}function G(l){const e=new Set,t=[];for(const o of l)typeof o=="string"&&o.length>0&&!e.has(o)&&(e.add(o),t.push(o));return t}function re(l){return l?Array.isArray(l)?l.filter(e=>!!(e&&typeof e.sceneId=="string")):typeof l=="object"?Object.values(l).filter(e=>!!(e&&typeof e.sceneId=="string")):[]:[]}function gt(){return[{nodeId:"act1_m1",actNumber:1,tierNumber:1,lane:"MAIN_STAGE",ephemeraStyle:"POLAROID_SNAPSHOT",pinX:16,pinY:46,tiltDeg:-3,cityStamp:"BROOKLYN, NY",venueName:"Oakridge Community Hall",showTitle:"The Oakridge Open Call",hookBlurb:"Forty-two folding chairs, one buzzing mic, and unbeaten bartender Frankie Russo testing your nerves on Classic Showcase.",challengerId:"frankie_russo",boardCols:4,boardRows:3,maxTurns:8,topology:"OPEN_TRYOUT",boardTwistId:"showcase_starter",entryFeeUsd:0,purseUsd:1e3,baseAudience:42,soloTargetScore:900,featuredFormats:["MULTIPLE_CHOICE","MATCH_4","PINPOINT_DIAL","CLUE_ESCALATOR"],optionalDare:{dareId:"dare_act1_m1_double",sponsor:"APEX_NETWORK",description:"Flip the 2x Double Down throw-switch and land a clean hit live.",conditionKind:"WIN_DOUBLE_DOWN",bonusPurseUsd:400,bonusViewers:65},rewardCharmId:"frankies_coaster",initialUnlocked:!0,onWinUnlockIds:["act1_m2","act1_s1"],onLossUnlockIds:["act1_r1"],secretUnlockIds:["act1_v1"],preMatchSceneId:"scene_act1_m1_walkout",postWinSceneId:"scene_act1_m1_win",postLossSceneId:"scene_act1_m1_loss"},{nodeId:"act1_r1",actNumber:1,tierNumber:1,lane:"REDEMPTION_GRIT",ephemeraStyle:"TORN_PUB_FLYER",pinX:28,pinY:74,tiltDeg:5,cityStamp:"BROOKLYN · 2 AM",venueName:"Silver Spoon All-Night Diner",showTitle:"2 AM Diner Redemption Play-In",hookBlurb:"Knocked off Oakridge stage? Claw right back onto the tour with a sizzling Time-Bomb Hot Potato late-night hustle.",challengerId:"frankie_russo",boardCols:4,boardRows:3,maxTurns:8,topology:"OPEN_TRYOUT",boardTwistId:"time_bomb_hot_potato",entryFeeUsd:0,purseUsd:650,baseAudience:95,soloTargetScore:850,featuredFormats:["MULTIPLE_CHOICE","SORT_4","PINPOINT_DIAL","MULTI_STRIKE"],rewardCharmId:"underdog_chip",onWinUnlockIds:["act1_m2"],onLossUnlockIds:["act1_m2"],preMatchSceneId:"scene_act1_r1_redemption"},{nodeId:"act1_s1",actNumber:1,tierNumber:2,lane:"SPONSOR_SHOWCASE",ephemeraStyle:"CALL_SHEET_CLIP",pinX:46,pinY:22,tiltDeg:-4,cityStamp:"DOWNTOWN STUDIO",venueName:"Downtown Lyric Theater",showTitle:"Apex Ratings Showcase: Pyramid Ascent",hookBlurb:"Apex producers want fireworks—climb the Pyramid Ascent board and claim a Showman Dare bonus purse.",challengerId:"denise_park",boardCols:4,boardRows:3,maxTurns:9,topology:"PADLOCK_NEIGHBORS",boardTwistId:"pyramid_ascent",entryFeeUsd:250,purseUsd:3500,baseAudience:2800,soloTargetScore:1300,featuredFormats:["MULTIPLE_CHOICE","MATCH_4","SORT_4","CLUE_ESCALATOR"],optionalDare:{dareId:"dare_act1_s1_sweep",sponsor:"APEX_NETWORK",description:"Sweep a full row or column for a +300 Stage Jackpot.",conditionKind:"CLEAR_FULL_LINE",bonusPurseUsd:1200,bonusViewers:1400},onWinUnlockIds:["act2_m1"],onLossUnlockIds:["act1_m2"]},{nodeId:"act1_v1",actNumber:1,tierNumber:2,lane:"VELVET_SALON",ephemeraStyle:"VELVET_WAX_INVITE",pinX:54,pinY:78,tiltDeg:3,cityStamp:"MIDNIGHT SALON",venueName:"The Velvet Parlor",showTitle:"Wax-Sealed Salon: Spiral Core",hookBlurb:"A crimson wax envelope slid under your hotel door—crack the Spiral Labyrinth to reach the 1,000-point core.",challengerId:"denise_park",boardCols:4,boardRows:4,maxTurns:10,topology:"PADLOCK_NEIGHBORS",boardTwistId:"spiral_labyrinth",entryFeeUsd:300,purseUsd:5e3,baseAudience:600,soloTargetScore:1500,featuredFormats:["CLUE_ESCALATOR","SORT_4","PINPOINT_DIAL","VISUAL_SPOTTER"],rewardCharmId:"velvet_wax_seal",onWinUnlockIds:["act2_m1"],onLossUnlockIds:["act1_m2"]},{nodeId:"act1_m2",actNumber:1,tierNumber:2,lane:"MAIN_STAGE",ephemeraStyle:"POLAROID_SNAPSHOT",pinX:74,pinY:48,tiltDeg:2,cityStamp:"CIVIC DISTRICT",venueName:"Downtown Lyric Theater",showTitle:"City Championship: 3D Chain Locks",hookBlurb:"Retired AP History legend Denise Park locks the high vaults in iron chains—shatter padlocks and deploy SCREW RIVAL!",challengerId:"denise_park",boardCols:4,boardRows:4,maxTurns:10,topology:"PADLOCK_NEIGHBORS",boardTwistId:"chain_padlocks",entryFeeUsd:200,purseUsd:5e3,baseAudience:5200,soloTargetScore:1450,featuredFormats:["MULTIPLE_CHOICE","SORT_4","MATCH_4","PINPOINT_DIAL"],rewardCharmId:"denises_red_pen",onWinUnlockIds:["act2_m1"],onLossUnlockIds:["act1_r1","act2_m1"]},{nodeId:"act2_m1",actNumber:2,tierNumber:3,lane:"MAIN_STAGE",ephemeraStyle:"POLAROID_SNAPSHOT",pinX:35,pinY:44,tiltDeg:-2,cityStamp:"CHANNEL 7 LIVE",venueName:"Channel 7 Studio B",showTitle:"Daytime Ratings War: Tug-of-War Turf",hookBlurb:"Nineteen-game streak star Trevor Blake owns daytime TV. Paint the majority of the board to steal the +500 Turf Bonus.",challengerId:"trevor_blake",boardCols:5,boardRows:3,maxTurns:10,topology:"SPOTLIGHT_ROULETTE",boardTwistId:"tug_of_war_turf",entryFeeUsd:500,purseUsd:25e3,baseAudience:185e3,soloTargetScore:2100,featuredFormats:["MULTIPLE_CHOICE","MULTI_STRIKE","MATCH_4","PINPOINT_DIAL"],rewardCharmId:"trevors_hot_mic",onWinUnlockIds:["act3_m1"],onLossUnlockIds:["act3_r1"]},{nodeId:"act3_m1",actNumber:3,tierNumber:5,lane:"MAIN_STAGE",ephemeraStyle:"BOARDING_PASS",pinX:30,pinY:42,tiltDeg:-3,cityStamp:"LONDON, UK",venueName:"London Royal Rotunda",showTitle:"The Oxford Pick & Ban Classic",hookBlurb:"Lord Alistair Finch welcomes you across the Atlantic with Fog-of-War spotlights and the Oxford Pick & Ban Draft.",challengerId:"alistair_finch",boardCols:5,boardRows:4,maxTurns:12,topology:"FOG_EXPLORER",boardTwistId:"oxford_pick_ban",entryFeeUsd:1500,purseUsd:12e4,baseAudience:42e6,soloTargetScore:3100,featuredFormats:["CLUE_ESCALATOR","SORT_4","VISUAL_SPOTTER","MULTIPLE_CHOICE"],rewardCharmId:"alistairs_pocketwatch",onWinUnlockIds:["act4_m1"],onLossUnlockIds:["act3_r1"]},{nodeId:"act3_r1",actNumber:3,tierNumber:6,lane:"REDEMPTION_GRIT",ephemeraStyle:"TORN_PUB_FLYER",pinX:62,pinY:70,tiltDeg:4,cityStamp:"TOKYO · SHIBUYA",venueName:"Shibuya Rain-Lit Sky-Dome",showTitle:"International Wildcard: Ice & Fire",hookBlurb:"One last international lifeline in Tokyo against Kenji Takahashi—thaw frozen lanes with Flame squares to survive.",challengerId:"kenji_takahashi",boardCols:5,boardRows:4,maxTurns:12,topology:"CROSSROADS_HYBRID",boardTwistId:"ice_fire_columns",entryFeeUsd:0,purseUsd:95e3,baseAudience:68e6,soloTargetScore:3200,featuredFormats:["MATCH_4","PINPOINT_DIAL","MULTI_STRIKE","MULTIPLE_CHOICE"],rewardCharmId:"kenjis_cyber_link",onWinUnlockIds:["act4_m1"],onLossUnlockIds:["act4_m1"]},{nodeId:"act4_m1",actNumber:4,tierNumber:7,lane:"MAIN_STAGE",ephemeraStyle:"POLAROID_SNAPSHOT",pinX:52,pinY:46,tiltDeg:-2,cityStamp:"GIZA, EGYPT",venueName:"Great Starlight Pavilion at Giza",showTitle:"Global Semifinal: Velvet X-Crossroads",hookBlurb:"Under the pyramids against Nadia Al-Mansoor: master 2x diagonal tracks and Multiplier Contagion to earn your ticket to the Finale.",challengerId:"nadia_al_mansoor",boardCols:5,boardRows:4,maxTurns:12,topology:"CROSSROADS_HYBRID",boardTwistId:"velvet_x_crossroads",entryFeeUsd:2500,purseUsd:5e5,baseAudience:38e7,soloTargetScore:4200,featuredFormats:["CLUE_ESCALATOR","MATCH_4","SORT_4","PINPOINT_DIAL","VISUAL_SPOTTER"],rewardCharmId:"nadias_astrolabe",onWinUnlockIds:["act5_finale"],onLossUnlockIds:["act5_finale"]},{nodeId:"act5_finale",actNumber:5,tierNumber:8,lane:"MAIN_STAGE",ephemeraStyle:"POLAROID_SNAPSHOT",pinX:50,pinY:44,tiltDeg:0,cityStamp:"WORLDWIDE LIVE SIMULCAST",venueName:"Global Championship Colosseum",showTitle:"The $10,000,000 World's Smartest Finale",hookBlurb:"1.4 billion viewers watching live. Six-Column Championship Gauntlet against undefeated Grandmaster Viktor Volkov.",challengerId:"viktor_volkov",boardCols:6,boardRows:4,maxTurns:16,topology:"FINALE_GAUNTLET",boardTwistId:"championship_gauntlet",entryFeeUsd:0,purseUsd:1e7,baseAudience:14e8,soloTargetScore:5800,featuredFormats:["MULTIPLE_CHOICE","MATCH_4","SORT_4","MULTI_STRIKE","PINPOINT_DIAL","CLUE_ESCALATOR","VISUAL_SPOTTER"],onWinUnlockIds:[],onLossUnlockIds:[],preMatchSceneId:"scene_act5_finale_walkout"}]}function Ke(){return{sceneId:"scene_cold_open",kind:"COLD_OPEN",title:"The Open Call",locationSubhead:"OAKRIDGE HALL",backdropUrl:N[1],featuredChallengerId:"frankie_russo",beats:[{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"Every broadcast network on Earth pooled ten million dollars for one open search—and it starts tonight on forty-two folding chairs in Oakridge.",voiceClipId:"vo_cold_1",hostPose:"welcome",backdropUrl:Y.openCall},{speaker:"producer_sam",speakerName:"Producer Sam",speakerRole:"Backstage Showrunner",text:"Quick briefing before the red tally light fires: you get a two-second untimed Read-In on every clue, brass 50/50 and Clue coins on your ledge, and a 2x Double Down throw-switch when you feel brave.",voiceClipId:"vo_cold_2",hostPose:"welcome",backdropUrl:N[1]},{speaker:"frankie_russo",speakerName:'Frankie "Last Call" Russo',speakerRole:"Unbeaten Oakridge Champ",text:"Six years undefeated behind this bar, kid. Put your $250 on the wood or head home.",voiceClipId:"vo_cold_3",hostPose:"hype",backdropUrl:N[1]}],choices:[{attitude:"RUTHLESS_CONFIDENCE",label:"Keep the tab open—this won't take long.",playerSpokenText:"Keep the tab open—this won't take long.",rivalReplyText:"Ooh, spicy! Apex TV scouts love a loudmouth—let us see if your trivia matches your swagger.",rivalReplyVoiceId:"vo_frankie_reply_bold",hostReplyText:"Now that is prime-time television! Step to the podium and light up the board!",hostReplyVoiceId:"vo_cold_4",rivalAffinityDelta:-10,sponsorRepDelta:{APEX_NETWORK:15}},{attitude:"WARM_RESPECT",label:"May the sharpest memory win, Frankie.",playerSpokenText:"May the sharpest memory win, Frankie.",rivalReplyText:"Class act. Tell you what—hold your nerve on the 2x switch and I might slip you my lucky bar coaster later.",rivalReplyVoiceId:"vo_frankie_reply_respect",hostReplyText:"Sportsmanship in Brooklyn—miracles really do happen on live mic!",hostReplyVoiceId:"vo_cold_5",rivalAffinityDelta:25,sponsorRepDelta:{INDEPENDENT:12}},{attitude:"SHARP_WIT",label:"Do I still get free pretzels if I sweep?",playerSpokenText:"Do I still get free pretzels if I sweep?",rivalReplyText:"Ha! Sweep a full row on my board and the pretzels—and the applause—are on the house.",rivalReplyVoiceId:"vo_frankie_reply_witty",hostReplyText:"The crowd is already chanting! Wire up the cables, spin the dial, and let us play!",hostReplyVoiceId:"vo_cold_6",rivalAffinityDelta:12,sponsorRepDelta:{INDEPENDENT:8,VELVET_SOCIETY:6}}]}}function ft(l){const e=q[l];return{sceneId:e.allyCallSceneId,kind:"GREEN_ROOM_CALL",title:`Green-Room Call: ${e.displayName}`,locationSubhead:"BACKSTAGE GREEN ROOM",backdropUrl:oe.TV_DRESSING_ROOM,featuredChallengerId:l,beats:[{speaker:"producer_sam",speakerName:"Producer Sam",speakerRole:"Backstage Showrunner",text:`Line one is blinking—${e.displayName} is calling your dressing room ahead of tonight's broadcast.`,voiceClipId:"vo_sam_5",hostPose:"welcome"},{speaker:l,speakerName:e.displayName,speakerRole:e.nicknameTitle,text:e.allyCoachingTip,voiceClipId:`vo_${e.shortKey}_ally_call`,hostPose:"hype"}],closingBeats:[{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"Rivals turned into your backstage brain trust—equip that signature Podium Lucky Charm inside your Tour Trunk before curtain up.",voiceClipId:"vo_max_board_welcome_2",hostPose:"hype"}]}}function je(l){const e=ze[l],t=de[l],o={PEOPLES_CHAMPION:[{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"One point four billion voices roaring in unison! No corporate handlers, no compromises—just pure curiosity and the friends you won along the road.",voiceClipId:"vo_max_ending_crown_1",hostPose:"hype",backdropUrl:Y.worldCoronation},{speaker:"viktor_volkov",speakerName:"Grandmaster Viktor Volkov",speakerRole:"Former World Champion",text:"You brought a whole community to a solitary throne. The crown belongs to you—well played.",voiceClipId:"vo_viktor_defeat",hostPose:"welcome",backdropUrl:N[8]}],NETWORK_SOVEREIGN:[{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"Ratings shattered on every continent! Every Showman Dare cashed, every camera locked on you—behold the undisputed Network Sovereign!",voiceClipId:"vo_max_ending_crown_2",hostPose:"hype",backdropUrl:Y.worldCoronation},{speaker:"producer_sam",speakerName:"Producer Sam",speakerRole:"Executive Showrunner",text:"Apex just offered you your own prime-time syndicate franchise—and ten million dollars is only the signing bonus.",voiceClipId:"vo_sam_6",hostPose:"hype",backdropUrl:N[8]}],VELVET_GRANDMASTER:[{speaker:"nadia_al_mansoor",speakerName:"Nadia Al-Mansoor",speakerRole:"Velvet Society Laureate",text:"From midnight wax-sealed salons to the brightest arena on Earth—the Velvet Society bows to its newest Grandmaster.",voiceClipId:"vo_nadia_ally_call",hostPose:"hype",backdropUrl:Y.worldCoronation},{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"Every forbidden board cracked, every vault unlocked—tonight belongs to the Velvet Grandmaster!",voiceClipId:"vo_max_ending_crown_1",hostPose:"hype",backdropUrl:N[8]}],CINDERELLA_REDEMPTION:[{speaker:"frankie_russo",speakerName:'Frankie "Last Call" Russo',speakerRole:"Oakridge Ally",text:"They wrote you off in a two-A.M. diner wildcard, kid—and you just lifted the ten-million-dollar crown in front of the entire planet!",voiceClipId:"vo_frankie_ally_call",hostPose:"hype",backdropUrl:Y.worldCoronation},{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"Knocked down, never counted out! History will never forget the greatest Cinderella Redemption comeback ever broadcast!",voiceClipId:"vo_max_ending_crown_2",hostPose:"hype",backdropUrl:N[8]}]};return{sceneId:t,kind:"ENDING",title:e.title,locationSubhead:"WORLDWIDE CORONATION",backdropUrl:Y.worldCoronation,featuredChallengerId:l==="VELVET_GRANDMASTER"?"nadia_al_mansoor":l==="CINDERELLA_REDEMPTION"?"frankie_russo":"viktor_volkov",beats:o[l]}}function mt(){const l=new Map,e=Ke();l.set(e.sceneId,e);for(const t of te){const o=ft(t);l.set(o.sceneId,o)}for(const t of Ie){const o=je(t);l.set(o.sceneId,o)}return l.set("scene_act1_m1_walkout",{sceneId:"scene_act1_m1_walkout",kind:"STAGE_WALKOUT",title:"Oakridge Opening Bell",locationSubhead:"OAKRIDGE HALL",backdropUrl:N[1],featuredChallengerId:"frankie_russo",beats:[{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"Lights up in Oakridge! Forty-two neighbors are leaning forward—beat Frankie on the Classic Showcase board to punch your ticket downtown.",voiceClipId:"vo_max_board_welcome_1",hostPose:"hype"}]}),l.set("scene_act1_m1_win",{sceneId:"scene_act1_m1_win",kind:"ACT_CLIMAX",title:"Upset at Oakridge",locationSubhead:"OAKRIDGE HALL",backdropUrl:Y.scoutBreakthrough,featuredChallengerId:"frankie_russo",beats:[{speaker:"frankie_russo",speakerName:'Frankie "Last Call" Russo',speakerRole:"Oakridge Tavern Legend",text:"Six years unbeaten, snapped on my own floorboards. That broadcast scout in the back row just dropped her coffee—go show downtown what Oakridge built.",voiceClipId:"vo_frankie_defeat",hostPose:"hype"}]}),l.set("scene_act1_m1_loss",{sceneId:"scene_act1_m1_loss",kind:"REDEMPTION_BEAT",title:"Last Call Detour",locationSubhead:"OAKRIDGE BACK ALLEY",backdropUrl:oe.LOCAL_PUB,featuredChallengerId:"frankie_russo",beats:[{speaker:"frankie_russo",speakerName:'Frankie "Last Call" Russo',speakerRole:"Oakridge Tavern Legend",text:"Not your night yet—but the tour does not end on one stumble. There is a 2 AM Redemption Wildcard down at the Silver Spoon Diner if you have the grit.",voiceClipId:"vo_frankie_win",hostPose:"wince"},{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"Your Tour Trunk just pinned a crimson Redemption flyer—or you can burn your one-time Contract Mulligan for an immediate rematch right here.",voiceClipId:"vo_max_redemption_1",hostPose:"welcome"}]}),l.set("scene_act1_r1_redemption",{sceneId:"scene_act1_r1_redemption",kind:"REDEMPTION_BEAT",title:"Neon Coffee & Wildcard Grit",locationSubhead:"SILVER SPOON DINER · 2 AM",backdropUrl:oe.LOCAL_PUB,featuredChallengerId:"frankie_russo",beats:[{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"Welcome to the Late-Night Redemption Circuit—no studio makeup, just hot coffee, a ticking Time-Bomb board, and a back door straight back to prime time.",voiceClipId:"vo_max_redemption_2",hostPose:"hype"}]}),l.set("scene_act5_finale_walkout",{sceneId:"scene_act5_finale_walkout",kind:"STAGE_WALKOUT",title:"One Point Four Billion Watching",locationSubhead:"GLOBAL CHAMPIONSHIP FINALE",backdropUrl:N[8],featuredChallengerId:"viktor_volkov",beats:[{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:"From forty-two folding chairs in Brooklyn to one point four billion viewers live worldwide. Ten million dollars—and the title of World’s Smartest—on the line!",voiceClipId:"vo_max_ending_crown_1",hostPose:"hype"},{speaker:"viktor_volkov",speakerName:"Grandmaster Viktor Volkov",speakerRole:"Defending World Champion",text:"Many challengers climb this staircase. None have survived the six-column Championship Gauntlet. Let us begin.",voiceClipId:"vo_viktor_walkout",hostPose:"hype"}]}),l}class bt{nodesMap=new Map;orderedNodes=[];scenesMap=new Map;fallbackScenesMap;memorySlots=new Map;listeners=new Set;activeSlotId=1;packsLoaded=!1;constructor(){this.fallbackScenesMap=mt(),this.hydrateFromPayloads({nodes:gt(),scenes:Array.from(this.fallbackScenesMap.values())},null),this.packsLoaded=!1,this.activeSlotId=this.readPersistedActiveSlotId()??1}async loadStoryPacks(e){if(this.packsLoaded&&!e?.forceReload)return{loadedNodes:this.orderedNodes.length,loadedScenes:this.scenesMap.size,usedFallback:!1};const t=e?.acts12Url??st,o=e?.acts35Url??nt;if(typeof fetch!="function")return{loadedNodes:this.orderedNodes.length,loadedScenes:this.scenesMap.size,usedFallback:!0};const i=async c=>{try{const d=await fetch(c);return d.ok?await d.json():null}catch{return null}},[s,a]=await Promise.all([i(t),i(o)]);if(!s&&!a)return{loadedNodes:this.orderedNodes.length,loadedScenes:this.scenesMap.size,usedFallback:!0};const r=this.hydrateFromPayloads(s,a);this.packsLoaded=!0;const n=this.getState();return this.writeSlot(n),{...r,usedFallback:!1}}hydrateFromPayloads(e,t){const o=[];if(Array.isArray(e?.nodes)&&o.push(...e.nodes),Array.isArray(t?.nodes)&&o.push(...t.nodes),o.length>0){this.nodesMap.clear();for(const s of o)!s||typeof s.nodeId!="string"||!s.nodeId.trim()||this.nodesMap.set(s.nodeId,s);this.orderedNodes=Array.from(this.nodesMap.values()).sort((s,a)=>s.actNumber!==a.actNumber?s.actNumber-a.actNumber:s.tierNumber!==a.tierNumber?s.tierNumber-a.tierNumber:0)}this.scenesMap.clear();for(const[s,a]of this.fallbackScenesMap.entries())this.scenesMap.set(s,a);const i=[...re(e?.scenes),...re(e?.endings),...re(t?.scenes),...re(t?.endings)];for(const s of i)this.scenesMap.set(s.sceneId,s);return o.length>0&&(this.packsLoaded=!0),{loadedNodes:this.orderedNodes.length,loadedScenes:this.scenesMap.size}}validateCampaignGraph(){const e=this.getInitialNodeIds(),t=[];for(const d of this.orderedNodes){for(const h of d.onWinUnlockIds??[])this.nodesMap.has(h)||t.push({fromNodeId:d.nodeId,targetNodeId:h,edge:"win"});for(const h of d.onLossUnlockIds??[])this.nodesMap.has(h)||t.push({fromNodeId:d.nodeId,targetNodeId:h,edge:"loss"});for(const h of d.secretUnlockIds??[])this.nodesMap.has(h)||t.push({fromNodeId:d.nodeId,targetNodeId:h,edge:"secret"})}const o=new Set(e),i=[...e];for(;i.length>0;){const d=i.shift(),h=this.nodesMap.get(d);if(!h)continue;const p=[...h.onWinUnlockIds??[],...h.onLossUnlockIds??[],...h.secretUnlockIds??[]];for(const f of p)this.nodesMap.has(f)&&!o.has(f)&&(o.add(f),i.push(f))}const s=this.orderedNodes.filter(d=>!o.has(d.nodeId)).map(d=>d.nodeId),a=Array.from(new Set(this.orderedNodes.map(d=>d.actNumber))).sort((d,h)=>d-h),r=Array.from(new Set(this.orderedNodes.map(d=>d.lane))),n=Array.from(new Set(this.orderedNodes.map(d=>ee(d)))),c=Ie.map(d=>de[d]).filter(d=>!this.scenesMap.has(d));return{totalNodes:this.orderedNodes.length,totalScenes:this.scenesMap.size,actsCovered:a,initialNodeIds:e,deadEndLinks:t,orphanNodeIds:s,reachableNodeCount:o.size,missingEndingSceneIds:c,lanesPresent:r,twistsCovered:n}}readRaw(e){try{if(typeof localStorage<"u"&&typeof localStorage.getItem=="function")return localStorage.getItem(e)}catch{}return null}writeRaw(e,t){try{typeof localStorage<"u"&&typeof localStorage.setItem=="function"&&localStorage.setItem(e,t)}catch{}}removeRaw(e){try{typeof localStorage<"u"&&typeof localStorage.removeItem=="function"&&localStorage.removeItem(e)}catch{}}readPersistedActiveSlotId(){const e=this.readRaw(ce),t=Number(e);return ht(t)?t:null}getInitialNodeIds(){const e=this.orderedNodes.filter(t=>t.initialUnlocked).map(t=>t.nodeId);return e.length>0?e:this.nodesMap.has("act1_m1")?["act1_m1"]:this.orderedNodes.length>0?[this.orderedNodes[0].nodeId]:["act1_m1"]}createFreshState(e,t="Challenger"){const o=this.getInitialNodeIds(),i=o[0]??"act1_m1",s=t.trim().slice(0,32)||"Challenger";return{version:"5.0",slotId:e,contestantName:s,coldOpenCompleted:!1,currentAct:1,currentNodeId:i,unlockedNodeIds:[...o],wonNodeIds:[],lostNodeIds:[],nodeStars:{},nodeHighScores:{},bankrollUsd:500,careerEarningsUsd:0,liveWorldAudience:42,activeSponsor:"INDEPENDENT",sponsorRep:Re(),rivalAffinity:Ee(),unlockedCharms:[],equippedCharms:[],seenSceneIds:[],inboxCallsQueue:[],pressClippings:[],totalMatchesPlayed:0,totalMatchesWon:0,comebackWinsFromRedemption:0,unlockedEndings:[],mechanicsIntroduced:[],contractMulligansRemaining:1,mulliganUsedOnNodeIds:[],activeGrudgeSabotages:[],completedDareIds:[],failedDareIds:[],storyChoiceHistory:[],rivalAllyCallsUnlocked:[],rivalGrudgesTriggered:[],updatedAtIso:new Date().toISOString()}}sanitizeState(e,t){const o=this.createFreshState(e);if(!t||typeof t!="object")return o;const i=t,s=this.getInitialNodeIds(),a=new Set(s);if(Array.isArray(i.unlockedNodeIds))for(const k of i.unlockedNodeIds)typeof k=="string"&&k.trim()&&a.add(k);const r=Array.isArray(i.wonNodeIds)?G(i.wonNodeIds):[],n=Array.isArray(i.lostNodeIds)?G(i.lostNodeIds):[];for(const k of[...r,...n])a.add(k);const c={};if(i.nodeStars&&typeof i.nodeStars=="object")for(const[k,_]of Object.entries(i.nodeStars)){const E=Math.max(0,Math.min(3,Math.trunc(Number(_)||0)));c[k]=E}const d={};if(i.nodeHighScores&&typeof i.nodeHighScores=="object")for(const[k,_]of Object.entries(i.nodeHighScores))d[k]=Math.max(0,Math.round(Number(_)||0));const h=Re();if(i.sponsorRep&&typeof i.sponsorRep=="object")for(const k of Ce){const _=Number(i.sponsorRep[k]);Number.isFinite(_)&&(h[k]=Math.max(-100,Math.min(200,Math.round(_))))}const p=Ee();if(i.rivalAffinity&&typeof i.rivalAffinity=="object")for(const k of te){const _=Number(i.rivalAffinity[k]);Number.isFinite(_)&&(p[k]=Q(_))}const f=Array.isArray(i.unlockedCharms)?Array.from(new Set(i.unlockedCharms.filter(fe))):[],m=Array.isArray(i.equippedCharms)?Array.from(new Set(i.equippedCharms.filter(k=>fe(k)&&f.includes(k)))).slice(0,U):[],b=Array.isArray(i.unlockedEndings)?Array.from(new Set(i.unlockedEndings.filter(pt))):[],v=Number(i.currentAct),S=v===1||v===2||v===3||v===4||v===5?v:1,C=typeof i.currentNodeId=="string"&&i.currentNodeId.trim()?i.currentNodeId:o.currentNodeId,w=Array.isArray(i.pressClippings)?i.pressClippings.filter(k=>!!(k&&typeof k.headline=="string"&&typeof k.nodeId=="string")).slice(0,xe):[],g=Array.isArray(i.activeGrudgeSabotages)?i.activeGrudgeSabotages.filter(k=>!!(k&&typeof k.sabotageId=="string"&&ge(k.rivalId))):[],A=Array.isArray(i.storyChoiceHistory)?i.storyChoiceHistory.filter(k=>!!(k&&typeof k.sceneId=="string"&&typeof k.attitude=="string")):[];return{version:"5.0",slotId:e,contestantName:typeof i.contestantName=="string"&&i.contestantName.trim()?i.contestantName.trim().slice(0,32):"Challenger",coldOpenCompleted:!!i.coldOpenCompleted,currentAct:S,currentNodeId:C,unlockedNodeIds:Array.from(a),wonNodeIds:r,lostNodeIds:n,nodeStars:c,nodeHighScores:d,bankrollUsd:Math.max(0,Math.round(Number(i.bankrollUsd??o.bankrollUsd)||0)),careerEarningsUsd:Math.max(0,Math.round(Number(i.careerEarningsUsd)||0)),liveWorldAudience:Math.max(42,Math.round(Number(i.liveWorldAudience)||42)),activeSponsor:ut(i.activeSponsor)?i.activeSponsor:"INDEPENDENT",sponsorRep:h,rivalAffinity:p,unlockedCharms:f,equippedCharms:m,seenSceneIds:Array.isArray(i.seenSceneIds)?G(i.seenSceneIds):[],inboxCallsQueue:Array.isArray(i.inboxCallsQueue)?G(i.inboxCallsQueue):[],pressClippings:w,totalMatchesPlayed:Math.max(0,Math.trunc(Number(i.totalMatchesPlayed)||0)),totalMatchesWon:Math.max(0,Math.trunc(Number(i.totalMatchesWon)||0)),comebackWinsFromRedemption:Math.max(0,Math.trunc(Number(i.comebackWinsFromRedemption)||0)),unlockedEndings:b,mechanicsIntroduced:Array.isArray(i.mechanicsIntroduced)?G(i.mechanicsIntroduced):[],contractMulligansRemaining:typeof i.contractMulligansRemaining=="number"&&Number.isFinite(i.contractMulligansRemaining)?Math.max(0,Math.trunc(i.contractMulligansRemaining)):1,mulliganUsedOnNodeIds:Array.isArray(i.mulliganUsedOnNodeIds)?G(i.mulliganUsedOnNodeIds):[],activeGrudgeSabotages:g,completedDareIds:Array.isArray(i.completedDareIds)?G(i.completedDareIds):[],failedDareIds:Array.isArray(i.failedDareIds)?G(i.failedDareIds):[],storyChoiceHistory:A,rivalAllyCallsUnlocked:Array.isArray(i.rivalAllyCallsUnlocked)?Array.from(new Set(i.rivalAllyCallsUnlocked.filter(ge))):[],rivalGrudgesTriggered:Array.isArray(i.rivalGrudgesTriggered)?Array.from(new Set(i.rivalGrudgesTriggered.filter(ge))):[],updatedAtIso:typeof i.updatedAtIso=="string"?i.updatedAtIso:o.updatedAtIso}}readSlot(e){const t=this.readRaw(ue(e))??this.memorySlots.get(e)??null;if(!t)return null;try{return this.sanitizeState(e,JSON.parse(t))}catch{return null}}writeSlot(e){e.updatedAtIso=new Date().toISOString();const t=JSON.stringify(e);this.memorySlots.set(e.slotId,t),this.writeRaw(ue(e.slotId),t)}notify(e){const t=this.cloneState(e);for(const o of this.listeners)o(t)}cloneState(e){return JSON.parse(JSON.stringify(e))}subscribe(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}getActiveSlotId(){const e=this.readPersistedActiveSlotId();return e&&(this.activeSlotId=e),this.activeSlotId}setActiveSlotId(e){this.activeSlotId=e,this.writeRaw(ce,String(e));const t=this.readSlot(e)??this.createFreshState(e);return this.writeSlot(t),this.notify(t),this.cloneState(t)}getState(e=this.getActiveSlotId()){const t=this.readSlot(e);if(t)return this.cloneState(t);const o=this.createFreshState(e);return this.writeSlot(o),this.cloneState(o)}mutateActiveState(e){const t=this.getActiveSlotId(),o=this.readSlot(t)??this.createFreshState(t);return e(o),this.writeSlot(o),this.notify(o),this.cloneState(o)}startNewCampaignInSlot(e,t="Challenger"){this.activeSlotId=e,this.writeRaw(ce,String(e));const o=this.createFreshState(e,t);return this.writeSlot(o),this.notify(o),this.cloneState(o)}resetSlot(e){const t=this.readSlot(e),o=this.createFreshState(e,t?.contestantName??"Challenger");return this.writeSlot(o),e===this.getActiveSlotId()&&this.notify(o),this.cloneState(o)}deleteSlot(e){if(this.memorySlots.delete(e),this.removeRaw(ue(e)),e===this.getActiveSlotId()){const t=this.createFreshState(e);this.writeSlot(t),this.notify(t)}}exportSlotJson(e=this.getActiveSlotId()){const t=this.readSlot(e)??this.createFreshState(e);return JSON.stringify(t,null,2)}importSlotJson(e,t){try{const o=JSON.parse(t);if(!o||typeof o!="object")return{ok:!1,message:"Save JSON must be a valid campaign object."};const i=this.sanitizeState(e,o);return this.writeSlot(i),e===this.getActiveSlotId()&&this.notify(i),{ok:!0,message:`Imported Contestant Dossier into Slot ${e}.`,state:this.cloneState(i)}}catch{return{ok:!1,message:"Invalid JSON syntax in imported dossier."}}}listSlotSummaries(){const e=this.getActiveSlotId(),t=Math.max(1,this.orderedNodes.length),o=t*3;return rt.map(i=>{const s=this.readSlot(i);if(!s)return{slotId:i,isEmpty:!0,isActive:i===e,contestantName:"Empty Slot",coldOpenCompleted:!1,currentAct:1,currentNodeId:this.getInitialNodeIds()[0]??"act1_m1",currentVenueName:"Oakridge Community Hall",wonNodesCount:0,lostNodesCount:0,totalNodesCount:t,totalStars:0,maxStars:o,bankrollUsd:500,careerEarningsUsd:0,liveWorldAudience:42,activeSponsor:"INDEPENDENT",unlockedCharmsCount:0,unlockedEndingsCount:0,comebackWinsFromRedemption:0,updatedAtIso:null};const a=this.nodesMap.get(s.currentNodeId),r=Object.values(s.nodeStars).reduce((n,c)=>n+c,0);return{slotId:i,isEmpty:!1,isActive:i===e,contestantName:s.contestantName,coldOpenCompleted:s.coldOpenCompleted,currentAct:s.currentAct,currentNodeId:s.currentNodeId,currentVenueName:a?.venueName??"Oakridge Community Hall",wonNodesCount:s.wonNodeIds.length,lostNodesCount:s.lostNodeIds.length,totalNodesCount:t,totalStars:r,maxStars:o,bankrollUsd:s.bankrollUsd,careerEarningsUsd:s.careerEarningsUsd,liveWorldAudience:s.liveWorldAudience,activeSponsor:s.activeSponsor,unlockedCharmsCount:s.unlockedCharms.length,unlockedEndingsCount:s.unlockedEndings.length,comebackWinsFromRedemption:s.comebackWinsFromRedemption,updatedAtIso:s.updatedAtIso}})}getAllNodes(){return this.orderedNodes}getNodesByAct(e){return this.orderedNodes.filter(t=>t.actNumber===e)}getNodesByLane(e){return this.orderedNodes.filter(t=>t.lane===e)}getNode(e){return this.nodesMap.get(e)??null}getUnlockedNodes(e=this.getState()){const t=new Set(e.unlockedNodeIds);return this.orderedNodes.filter(o=>t.has(o.nodeId))}getRecommendedNextNode(e=this.getState()){const t=new Set(e.wonNodeIds),o=this.getUnlockedNodes(e),i=this.nodesMap.get(e.currentNodeId);if(i&&e.unlockedNodeIds.includes(i.nodeId)&&!t.has(i.nodeId))return i;const s=o.filter(a=>!t.has(a.nodeId));if(s.length>0){const a=s.find(n=>n.lane==="REDEMPTION_GRIT");return s.find(n=>n.lane==="MAIN_STAGE")??a??s[0]}return i??o[o.length-1]??this.orderedNodes[0]??null}getScene(e){return this.scenesMap.get(e)??this.fallbackScenesMap.get(e)??null}getColdOpenScene(){return this.getScene("scene_cold_open")??Ke()}completeColdOpen(e){return this.mutateActiveState(t=>{t.coldOpenCompleted=!0,e&&e.trim()&&(t.contestantName=e.trim().slice(0,32));for(const o of["read_in_2s","double_down_2x","clue_coins","gadget_dial_cables"])t.mechanicsIntroduced.includes(o)||t.mechanicsIntroduced.push(o);t.seenSceneIds.includes("scene_cold_open")||t.seenSceneIds.push("scene_cold_open")})}setContestantName(e){const t=e.trim().slice(0,32)||"Challenger";return this.mutateActiveState(o=>{o.contestantName=t})}selectCurrentNode(e){const t=this.nodesMap.get(e);return!t||!this.getState().unlockedNodeIds.includes(e)?!1:(this.mutateActiveState(i=>{i.currentNodeId=e,t.actNumber>i.currentAct&&(i.currentAct=t.actNumber)}),!0)}markSceneSeen(e){return this.mutateActiveState(t=>{t.seenSceneIds.includes(e)||t.seenSceneIds.push(e),t.inboxCallsQueue=t.inboxCallsQueue.filter(o=>o!==e)})}isMechanicIntroduced(e){return this.getState().mechanicsIntroduced.includes(e)}markMechanicIntroduced(e){return!e||this.isMechanicIntroduced(e)?!1:(this.mutateActiveState(t=>{t.mechanicsIntroduced.includes(e)||t.mechanicsIntroduced.push(e)}),!0)}markMechanicsIntroduced(e){const t=[];return this.mutateActiveState(o=>{for(const i of e)i&&!o.mechanicsIntroduced.includes(i)&&(o.mechanicsIntroduced.push(i),t.push(i))}),t}getMechanicBeat(e){return he.get(e)??null}getColdOpenOnboardingBeats(){return Fe.filter(e=>e.phase==="COLD_OPEN")}getUnintroducedMechanicsForNode(e){const t=typeof e=="string"?this.nodesMap.get(e):e;if(!t)return[];const o=this.getState(),i=new Set(o.mechanicsIntroduced),s=[],a=n=>{!i.has(n)&&!s.includes(n)&&he.has(n)&&s.push(n)};if(Array.isArray(t.mechanicsToIntroduce))for(const n of t.mechanicsToIntroduce)a(n);(!o.coldOpenCompleted||t.actNumber===1)&&(a("read_in_2s"),a("double_down_2x"),a("clue_coins"),(t.featuredFormats.includes("MATCH_4")||t.featuredFormats.includes("PINPOINT_DIAL"))&&a("gadget_dial_cables")),t.actNumber>=1&&(a("six_wedge_medallion"),a("row_col_sweep_jackpots")),(t.topology==="PADLOCK_NEIGHBORS"||ee(t)==="chain_padlocks")&&a("chain_locks_3d"),t.challengerId!==null&&(o.totalMatchesPlayed>=1||t.tierNumber>=2)&&a("screw_rival_buzzer"),(o.unlockedNodeIds.length>=2||t.lane==="REDEMPTION_GRIT")&&a("tour_trunk_yarn_branches"),(t.optionalDare||t.lane==="SPONSOR_SHOWCASE")&&a("sponsor_dares"),(t.rewardCharmId||o.unlockedCharms.length>0)&&a("podium_lucky_charms");const r=ee(t);return a(Me(r)),s.map(n=>he.get(n)).filter(n=>!!n)}buildAugmentedPreMatchScene(e){const t=this.nodesMap.get(e);if(!t)return null;const o=t.preMatchSceneId?this.getScene(t.preMatchSceneId):null,i=this.getUnintroducedMechanicsForNode(t),s=Me(ee(t)),a=[...i.filter(d=>d.mechanicId===s),...i.filter(d=>d.mechanicId!==s)].slice(0,2),r=this.peekPendingGrudgeSabotageForNode(t),n=[];for(const d of a)n.push({speaker:d.speaker,speakerName:d.speakerName,speakerRole:d.shortCueBanner,text:d.diegeticLine,voiceClipId:d.voiceClipId,hostPose:d.hostPose??"hype",backdropUrl:N[t.tierNumber]});r&&n.push({speaker:r.rivalId,speakerName:r.rivalName,speakerRole:"GRUDGE SABOTAGE WARNING",text:r.tauntLine,voiceClipId:r.voiceClipId,hostPose:"wince",backdropUrl:N[t.tierNumber]});const c=a.map(d=>d.mechanicId);if(c.length>0&&this.markMechanicsIntroduced(c),!o&&n.length===0)return null;if(o){const d=[...o.beats];if(o.choices&&o.choices.length>0&&d.length>0){const h=d.pop();d.push(...n,h)}else d.push(...n);return{scene:{...o,beats:d},newlyIntroducedMechanics:c,activeSabotage:r}}return{scene:{sceneId:`scene_auto_walkout_${t.nodeId}`,kind:t.lane==="REDEMPTION_GRIT"?"REDEMPTION_BEAT":"STAGE_WALKOUT",title:t.showTitle,locationSubhead:t.venueName.toUpperCase(),backdropUrl:N[t.tierNumber],featuredChallengerId:t.challengerId??void 0,beats:n},newlyIntroducedMechanics:c,activeSabotage:r}}getRivalAffinity(e){return this.getState().rivalAffinity[e]??0}getRivalStanding(e){return pe(this.getRivalAffinity(e))}getAlliedRivals(e=this.getState()){return te.filter(t=>(e.rivalAffinity[t]??0)>=_e)}getGrudgeRivals(e=this.getState()){return te.filter(t=>(e.rivalAffinity[t]??0)<=ne)}findAllyCallSceneIdForChallenger(e){for(const t of this.scenesMap.values())if(t.kind==="GREEN_ROOM_CALL"&&t.featuredChallengerId===e)return t.sceneId;return q[e].allyCallSceneId}evaluateRivalThresholdsInPlace(e,t){const o=Q(e.rivalAffinity[t]??0);e.rivalAffinity[t]=o;const i=q[t];let s=null,a=null,r=null;if(o>=_e){if(!e.rivalAllyCallsUnlocked.includes(t)){e.rivalAllyCallsUnlocked.push(t);const n=this.findAllyCallSceneIdForChallenger(t);!e.seenSceneIds.includes(n)&&!e.inboxCallsQueue.includes(n)&&(e.inboxCallsQueue.push(n),s=n)}e.unlockedCharms.includes(i.signatureCharmId)||(e.unlockedCharms.push(i.signatureCharmId),e.equippedCharms.length<U&&e.equippedCharms.push(i.signatureCharmId),a=i.signatureCharmId)}if(o<=ne&&!e.rivalGrudgesTriggered.includes(t)){e.rivalGrudgesTriggered.push(t);const n={sabotageId:`grudge_${t}_act${e.currentAct}`,rivalId:t,rivalName:i.displayName,kind:i.grudgeSabotageKind,targetDomainLabel:i.weakDomainLabel,tauntLine:i.grudgeSabotageTaunt,voiceClipId:`vo_${i.shortKey}_screw_taunt`,createdAtAct:e.currentAct,triggered:!1};e.activeGrudgeSabotages.push(n),r=n}return{queuedAllyCallSceneId:s,unlockedCharmId:a,triggeredSabotage:r}}adjustRivalAffinity(e,t){let o=0,i=null,s=null,a=null;return this.mutateActiveState(r=>{r.rivalAffinity[e]=Q((r.rivalAffinity[e]??0)+t),o=r.rivalAffinity[e];const n=this.evaluateRivalThresholdsInPlace(r,e);i=n.queuedAllyCallSceneId,s=n.unlockedCharmId,a=n.triggeredSabotage}),{newAffinity:o,standing:pe(o),queuedAllyCallSceneId:i,unlockedCharmId:s,triggeredSabotage:a}}getPendingInboxCallIds(){return this.getState().inboxCallsQueue}getPendingInboxCallScenes(){return this.getState().inboxCallsQueue.map(e=>this.getScene(e)).filter(e=>!!e)}peekNextInboxCallScene(){const e=this.getState().inboxCallsQueue;for(const t of e){const o=this.getScene(t);if(o)return o}return null}getPendingGrudgeSabotages(){return this.getState().activeGrudgeSabotages.filter(e=>!e.triggered)}peekPendingGrudgeSabotageForNode(e){const t=this.getPendingGrudgeSabotages();return t.length===0?null:t.find(o=>o.rivalId===e.challengerId)??t.find(o=>o.createdAtAct<=e.actNumber)??t[0]}consumeNextGrudgeSabotage(e){const t=this.nodesMap.get(e);let o=null;return this.mutateActiveState(i=>{const s=i.activeGrudgeSabotages.findIndex(a=>!a.triggered&&(!t||a.rivalId===t.challengerId||a.createdAtAct<=t.actNumber));if(s>=0){const r={...i.activeGrudgeSabotages[s],triggered:!0};i.activeGrudgeSabotages[s]=r,o=r}}),o}applyStoryChoice(e,t,o){const i=this.getScene(e),s=o??i?.featuredChallengerId??null;let a=null,r=null;const n=[];let c=null,d=null;const h={},p=Math.round(Number(t.bankrollDeltaUsd)||0),f=this.mutateActiveState(m=>{if(m.storyChoiceHistory.push({sceneId:e,attitude:t.attitude,label:t.label,challengerId:s,affinityDelta:t.rivalAffinityDelta,timestampIso:new Date().toISOString()}),s){const b=Q((m.rivalAffinity[s]??0)+t.rivalAffinityDelta);m.rivalAffinity[s]=b,a=b,r=pe(b);const v=this.evaluateRivalThresholdsInPlace(m,s);c=v.queuedAllyCallSceneId,v.unlockedCharmId&&n.push(v.unlockedCharmId),d=v.triggeredSabotage}if(t.sponsorRepDelta)for(const b of Ce){const v=Number(t.sponsorRepDelta[b]??0);if(v!==0){m.sponsorRep[b]=Math.max(-100,Math.min(200,(m.sponsorRep[b]??0)+Math.round(v))),h[b]=Math.round(v);const S=this.checkSponsorCharmUnlockInPlace(m,b);S&&n.push(S)}}p!==0&&(m.bankrollUsd=Math.max(0,m.bankrollUsd+p),p>0&&(m.careerEarningsUsd+=p)),t.unlockCharmId&&!m.unlockedCharms.includes(t.unlockCharmId)&&(m.unlockedCharms.push(t.unlockCharmId),m.equippedCharms.length<U&&m.equippedCharms.push(t.unlockCharmId),n.push(t.unlockCharmId)),m.seenSceneIds.includes(e)||m.seenSceneIds.push(e),m.inboxCallsQueue=m.inboxCallsQueue.filter(b=>b!==e)});return{sceneId:e,choice:t,challengerId:s,newAffinity:a,rivalStanding:r,bankrollDeltaUsd:p,sponsorRepChanges:h,unlockedCharms:Array.from(new Set(n)),queuedAllyCallSceneId:c,triggeredSabotage:d,state:f}}checkSponsorCharmUnlockInPlace(e,t){const o=le[t];return(e.sponsorRep[t]??0)>=o.charmUnlockRep&&!e.unlockedCharms.includes(o.signatureCharmId)?(e.unlockedCharms.push(o.signatureCharmId),e.equippedCharms.length<U&&e.equippedCharms.push(o.signatureCharmId),o.signatureCharmId):null}selectActiveSponsor(e){return this.mutateActiveState(t=>{t.activeSponsor=e,t.sponsorRep[e]=Math.min(200,(t.sponsorRep[e]??0)+5),this.checkSponsorCharmUnlockInPlace(t,e)})}adjustSponsorRep(e,t){let o=0,i=null;const s=[];return this.mutateActiveState(a=>{if(a.sponsorRep[e]=Math.max(-100,Math.min(200,(a.sponsorRep[e]??0)+Math.round(t))),o=a.sponsorRep[e],i=this.checkSponsorCharmUnlockInPlace(a,e),e==="VELVET_SOCIETY"&&o>=15)for(const r of a.wonNodeIds){const n=this.nodesMap.get(r);for(const c of n?.secretUnlockIds??[])this.nodesMap.has(c)&&!a.unlockedNodeIds.includes(c)&&(a.unlockedNodeIds.push(c),s.push(c))}}),{newRep:o,unlockedCharmId:i,unlockedSecretNodes:s}}adjustBankroll(e){const t=Math.round(Number(e)||0);return this.mutateActiveState(i=>{i.bankrollUsd=Math.max(0,i.bankrollUsd+t),t>0&&(i.careerEarningsUsd+=t)}).bankrollUsd}canAffordNodeEntry(e){const t=this.nodesMap.get(e),o=Math.max(0,t?.entryFeeUsd??0),i=this.getState().bankrollUsd;return{canAfford:i>=o,entryFeeUsd:o,needsBailout:i<o&&o>0}}payEntryFeeOrBailout(e){const t=this.nodesMap.get(e),o=Math.max(0,t?.entryFeeUsd??0);let i=0,s=!1;const a=this.mutateActiveState(r=>{o!==0&&(r.bankrollUsd>=o?(r.bankrollUsd-=o,i=o):(i=r.bankrollUsd,r.bankrollUsd=0,s=!0,r.sponsorRep.INDEPENDENT=Math.min(200,(r.sponsorRep.INDEPENDENT??0)+4)))});return{paidUsd:i,usedGrassrootsBailout:s,newBankrollUsd:a.bankrollUsd}}unlockCharm(e,t=!0){if(!fe(e))return!1;let o=!1;return this.mutateActiveState(i=>{i.unlockedCharms.includes(e)||(i.unlockedCharms.push(e),o=!0,t&&i.equippedCharms.length<U&&i.equippedCharms.push(e))}),o}equipCharm(e){let t=!1;return this.mutateActiveState(o=>{if(o.unlockedCharms.includes(e)){if(o.equippedCharms.includes(e)){t=!0;return}o.equippedCharms.length>=U&&o.equippedCharms.shift(),o.equippedCharms.push(e),t=!0}}),t}unequipCharm(e){let t=!1;return this.mutateActiveState(o=>{const i=o.equippedCharms.length;o.equippedCharms=o.equippedCharms.filter(s=>s!==e),t=o.equippedCharms.length<i}),t}setEquippedCharms(e){return this.mutateActiveState(o=>{const i=new Set(o.unlockedCharms);o.equippedCharms=Array.from(new Set(e.filter(s=>i.has(s)))).slice(0,U)}).equippedCharms}computeNodeStars(e,t){if(!t.won)return 0;const o=Math.max(0,Math.min(100,Number(t.accuracyPct??72))),i=Math.max(0,Math.trunc(Number(t.wedgesEarned??0))),s=Math.max(0,Math.trunc(Number(t.sweepsOrBullseyes??0))),a=e.challengerId&&typeof t.rivalScore=="number"&&t.rivalScore>0?t.rivalScore:e.soloTargetScore,r=a>0?t.playerScore/a:1;return o>=85||i>=3&&o>=75||s>=2&&o>=75||r>=1.4?3:o>=70||i>=2||s>=1||r>=1.18?2:1}buildPressClipping(e,t,o,i,s){const a=e.challengerId?q[e.challengerId].displayName:"the House Board",r=e.lane==="VELVET_SALON"?"The Velvet Ledger":e.lane==="REDEMPTION_GRIT"?"Late-Night Wildcard Wire":e.tierNumber>=5?"Global Broadcast Desk":e.tierNumber>=3?"Prime-Time Ratings Insider":"Oakridge Daily Bulletin";if(t){const n=e.lane==="REDEMPTION_GRIT"?`${i} Roars Back From Redemption Circuit at ${e.venueName}!`:o===3?`STUNNING SWEEP: ${i} Dominates ${a} Live!`:`${i} Outduels ${a} on ${e.showTitle}`,c=s?`Cashed the on-air Showman Dare in front of ${Ae(e.baseAudience)} viewers.`:`Punched a golden ticket forward from ${e.cityStamp}.`;return{outlet:r,headline:n,subline:c,nodeId:e.nodeId,won:!0}}return{outlet:r,headline:`HEARTBREAK AT ${e.venueName.toUpperCase()}: ${a} Holds Off ${i}`,subline:"Not out of the tournament—the Late-Night Redemption Circuit opens a dramatic back door!",nodeId:e.nodeId,won:!1}}recordMatchOutcome(e){const t=this.nodesMap.get(e.nodeId);if(!t)throw new Error(`Unknown campaign nodeId: ${e.nodeId}`);const o=this.computeNodeStars(t,e),i=[],s=[],a=[],r=[];let n=null,c=!1,d=0,h=0,p=0,f=0,m=!1;const b={value:null},v=this.mutateActiveState(g=>{g.totalMatchesPlayed+=1,g.unlockedNodeIds.includes(t.nodeId)||g.unlockedNodeIds.push(t.nodeId);const A=g.nodeHighScores[t.nodeId]??0;e.playerScore>A&&(g.nodeHighScores[t.nodeId]=Math.round(e.playerScore));const k=le[g.activeSponsor],_=t.optionalDare,E=!!(e.won&&_&&e.dareCompleted);if(_&&e.dareCompleted&&!g.completedDareIds.includes(_.dareId)?g.completedDareIds.push(_.dareId):_&&e.dareCompleted===!1&&!g.failedDareIds.includes(_.dareId)&&g.failedDareIds.push(_.dareId),e.won){g.totalMatchesWon+=1,c=!g.wonNodeIds.includes(t.nodeId),c&&g.wonNodeIds.push(t.nodeId);const M=g.nodeStars[t.nodeId]??0;o>M&&(g.nodeStars[t.nodeId]=o),t.lane==="REDEMPTION_GRIT"&&(g.comebackWinsFromRedemption+=1,g.unlockedCharms.includes("underdog_chip")||(g.unlockedCharms.push("underdog_chip"),g.equippedCharms.length<U&&g.equippedCharms.push("underdog_chip"),a.push("underdog_chip")));const P=c?t.purseUsd:Math.round(t.purseUsd*.25),D=Math.round(P*k.purseMultiplier);if(E&&_){h=Math.round(_.bonusPurseUsd*k.dareBonusMultiplier),p=_.bonusViewers,g.sponsorRep[_.sponsor]=Math.min(200,(g.sponsorRep[_.sponsor]??0)+14);const x=this.checkSponsorCharmUnlockInPlace(g,_.sponsor);x&&a.push(x)}const ie=e.entryFeeAlreadyPaid?0:Math.min(g.bankrollUsd,t.entryFeeUsd);d=D+h-ie,g.bankrollUsd=Math.max(0,g.bankrollUsd+d),g.careerEarningsUsd+=D+h;const Ze=o===3?.22:o===2?.14:.08;if(f=Math.max(20,Math.round(t.baseAudience*Ze*k.audienceMultiplier))+p,g.liveWorldAudience=Math.max(g.liveWorldAudience+f,Math.round(t.baseAudience*1.05)),t.lane==="VELVET_SALON"){g.sponsorRep.VELVET_SOCIETY=Math.min(200,(g.sponsorRep.VELVET_SOCIETY??0)+15);const x=this.checkSponsorCharmUnlockInPlace(g,"VELVET_SOCIETY");x&&a.push(x)}else if(t.lane==="SPONSOR_SHOWCASE"){g.sponsorRep.APEX_NETWORK=Math.min(200,(g.sponsorRep.APEX_NETWORK??0)+12);const x=this.checkSponsorCharmUnlockInPlace(g,"APEX_NETWORK");x&&a.push(x)}else if(t.lane==="REDEMPTION_GRIT"){g.sponsorRep.INDEPENDENT=Math.min(200,(g.sponsorRep.INDEPENDENT??0)+14);const x=this.checkSponsorCharmUnlockInPlace(g,"INDEPENDENT");x&&a.push(x)}else{g.sponsorRep[g.activeSponsor]=Math.min(200,(g.sponsorRep[g.activeSponsor]??0)+6);const x=this.checkSponsorCharmUnlockInPlace(g,g.activeSponsor);x&&a.push(x)}t.rewardCharmId&&!g.unlockedCharms.includes(t.rewardCharmId)&&(g.unlockedCharms.push(t.rewardCharmId),g.equippedCharms.length<U&&g.equippedCharms.push(t.rewardCharmId),a.push(t.rewardCharmId));for(const x of t.onWinUnlockIds??[]){g.unlockedNodeIds.includes(x)||(g.unlockedNodeIds.push(x),i.push(x));const F=this.nodesMap.get(x);F&&F.actNumber>g.currentAct&&(g.currentAct=F.actNumber)}if(o===3||(e.accuracyPct??0)>=85||(g.sponsorRep.VELVET_SOCIETY??0)>=15||!!(e.screwsLanded&&e.screwsLanded>0))for(const x of t.secretUnlockIds??[])g.unlockedNodeIds.includes(x)||(g.unlockedNodeIds.push(x),s.push(x),i.push(x));if(t.onWinUnlockIds.length>0&&(g.currentNodeId=t.onWinUnlockIds[0]),t.challengerId){const x=g.rivalAffinity[t.challengerId]??0,F=x<=ne?-5:6;g.rivalAffinity[t.challengerId]=Q(x+F);const B=this.evaluateRivalThresholdsInPlace(g,t.challengerId);B.queuedAllyCallSceneId&&r.push(B.queuedAllyCallSceneId),B.unlockedCharmId&&a.push(B.unlockedCharmId),B.triggeredSabotage&&(n=B.triggeredSabotage)}if(g.currentAct>=3){const x=this.getAlliedRivals(g);for(const F of x){const B=this.findAllyCallSceneIdForChallenger(F);!g.seenSceneIds.includes(B)&&!g.inboxCallsQueue.includes(B)&&(g.inboxCallsQueue.push(B),r.push(B))}g.currentAct===5&&x.length>=2&&this.scenesMap.has("scene_call_finale_all_allies")&&!g.seenSceneIds.includes("scene_call_finale_all_allies")&&!g.inboxCallsQueue.includes("scene_call_finale_all_allies")&&(g.inboxCallsQueue.unshift("scene_call_finale_all_allies"),r.push("scene_call_finale_all_allies"))}}else{g.lostNodeIds.includes(t.nodeId)||g.lostNodeIds.push(t.nodeId),f=Math.max(8,Math.round(t.baseAudience*.04)),g.liveWorldAudience+=f;const M=e.entryFeeAlreadyPaid?0:Math.min(g.bankrollUsd,t.entryFeeUsd);d=-M,g.bankrollUsd=Math.max(0,g.bankrollUsd-M);for(const P of t.onLossUnlockIds??[]){g.unlockedNodeIds.includes(P)||(g.unlockedNodeIds.push(P),i.push(P));const D=this.nodesMap.get(P);D?.lane==="REDEMPTION_GRIT"&&(m=!0),D&&D.actNumber>g.currentAct&&(g.currentAct=D.actNumber)}if(t.onLossUnlockIds.length>0){const P=t.onLossUnlockIds.find(D=>this.nodesMap.get(D)?.lane==="REDEMPTION_GRIT")??t.onLossUnlockIds[0];g.currentNodeId=P,m=m||this.nodesMap.get(P)?.lane==="REDEMPTION_GRIT"}g.lostNodeIds.length>=2&&!g.unlockedCharms.includes("screw_shield")&&(g.unlockedCharms.push("screw_shield"),g.equippedCharms.length<U&&g.equippedCharms.push("screw_shield"),a.push("screw_shield"))}const O=e.customHeadline?{...e.customHeadline,nodeId:t.nodeId,won:e.won}:this.buildPressClipping(t,e.won,o,g.contestantName,E);if(g.pressClippings=[O,...g.pressClippings].slice(0,xe),(t.nodeId==="act5_finale"||t.actNumber===5&&(t.onWinUnlockIds?.length??0)===0)&&e.won){const M=this.resolveCanonicalEndingFromState(g);g.unlockedEndings.includes(M.endingId)?b.value={...M,isNewlyUnlocked:!1}:(g.unlockedEndings.push(M.endingId),b.value={...M,isNewlyUnlocked:!0})}}),S=!e.won&&v.contractMulligansRemaining>0&&!v.mulliganUsedOnNodeIds.includes(t.nodeId),C=b.value,w=e.won?C?.sceneId??t.postWinSceneId??null:t.postLossSceneId??null;return{node:t,won:e.won,starsEarned:o,isFirstWinOnNode:c,newlyUnlockedNodeIds:G(i),secretUnlockedNodeIds:G(s),unlockedRedemptionBranch:m,canOfferContractMulligan:S,bankrollDeltaUsd:d,dareBonusUsd:h,dareBonusViewers:p,audienceDelta:f,unlockedCharms:Array.from(new Set(a)),queuedInboxCallSceneIds:G(r),triggeredGrudgeSabotage:n,postMatchSceneId:w,endingResolution:C,state:v}}canUseContractMulligan(e){const t=this.getState();return t.contractMulligansRemaining>0&&t.lostNodeIds.includes(e)&&!t.mulliganUsedOnNodeIds.includes(e)}invokeContractMulligan(e){const t=this.nodesMap.get(e),o=this.getState();if(!t||o.contractMulligansRemaining<=0||o.mulliganUsedOnNodeIds.includes(e))return{ok:!1,nodeId:e,refundedEntryFeeUsd:0,remainingMulligans:o.contractMulligansRemaining,hostLine:"No Contract Mulligans left on your rider—time to earn it the gritty way on the Redemption Circuit!",state:o};const i=Math.max(0,t.entryFeeUsd),s=this.mutateActiveState(a=>{a.contractMulligansRemaining=Math.max(0,a.contractMulligansRemaining-1),a.mulliganUsedOnNodeIds.push(e),a.currentNodeId=e,i>0&&(a.bankrollUsd+=i)});return{ok:!0,nodeId:e,refundedEntryFeeUsd:i,remainingMulligans:s.contractMulligansRemaining,hostLine:"Producer Sam invoked your one-time Contract Mulligan clause! Cameras are rolling again—step right back onto that stage and rewrite the headline.",state:s}}getEndingScene(e){const t=de[e];return this.getScene(t)??je(e)}resolveCanonicalEndingFromState(e){const t=e.wonNodeIds.map(b=>this.nodesMap.get(b)).filter(b=>!!b),o=t.filter(b=>b.lane==="VELVET_SALON").length,i=t.filter(b=>b.lane==="SPONSOR_SHOWCASE").length,s=this.getAlliedRivals(e),a=this.getGrudgeRivals(e),r=e.sponsorRep.INDEPENDENT??0,n=e.sponsorRep.APEX_NETWORK??0,c=e.sponsorRep.VELVET_SOCIETY??0;let d="PEOPLES_CHAMPION";e.comebackWinsFromRedemption>=2||e.lostNodeIds.length>=2&&e.comebackWinsFromRedemption>=1?d="CINDERELLA_REDEMPTION":e.activeSponsor==="VELVET_SOCIETY"&&c>=20||c>=35&&c>=n&&c>=r&&o>=1?d="VELVET_GRANDMASTER":e.activeSponsor==="APEX_NETWORK"&&n>=20||n>=35&&n>c&&n>=r&&(e.completedDareIds.length>=1||i>=1||e.careerEarningsUsd>=25e4)?d="NETWORK_SOVEREIGN":d="PEOPLES_CHAMPION";const h=ze[d],p=de[d],f=this.getEndingScene(d),m=[`Peak Global Broadcast Audience: ${Ae(e.liveWorldAudience)} live viewers.`,`Career Stage Winnings: ${Ye(e.careerEarningsUsd)} · Active Backer: ${le[e.activeSponsor].name}.`];if(s.length>0){const b=s.map(v=>q[v].displayName).join(", ");m.push(`Green-Room Brain Trust Allies (${s.length}): ${b}.`)}if(a.length>0){const b=a.map(v=>q[v].displayName).join(", ");m.push(`Unsettled Stage Grudges (${a.length}): ${b}.`)}return e.comebackWinsFromRedemption>0&&m.push(`Redemption Circuit Comebacks: ${e.comebackWinsFromRedemption} upset victory${e.comebackWinsFromRedemption===1?"":" victories"} off the late-night bracket.`),{endingId:d,sceneId:p,title:h.title,subtitle:h.subtitle,scene:f,epilogueCallouts:m,isNewlyUnlocked:!e.unlockedEndings.includes(d)}}resolveCanonicalEnding(e){return this.resolveCanonicalEndingFromState(e??this.getState())}}const Le="v5-greenroom-styles";function L(l){return String(l??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function qe(l){switch(l){case 1:return"Act I";case 2:return"Act II";case 3:return"Act III";case 4:return"Act IV";case 5:return"Act V"}}function Qe(l){return l<=1?"LOCAL_PUB":l<=3?"TV_DRESSING_ROOM":"GLOBAL_VIP_SUITE"}function St(l,e){const t=!l.coldOpenCompleted&&l.totalMatchesPlayed===0,o=e?.era??Qe(l.currentAct),i=Object.values(l.nodeStars).reduce((a,r)=>a+r,0),s=e?.inboxCount??l.inboxCallsQueue.length;return{era:o,isFreshSave:t,currentAct:l.currentAct,contestantName:l.contestantName,inboxCount:s,tourProgressLabel:e?.tourProgressLabel??(t?"Open Tour Map":`${qe(l.currentAct)} · ${i} Stars`),endlessBestStreak:e?.endlessBestStreak??0,audioEnabled:e?.audioEnabled??!0,trophiesTotalCount:e?.trophiesTotalCount??100,...e}}function vt(l){return l.hostCallout&&l.hostCallout.trim().length>0?l.hostCallout.trim():l.isFreshSave?"Folding chairs are squeaking out front. Grab the mic for your live open-call audition.":l.era==="GLOBAL_VIP_SUITE"?"Forty-two satellite uplinks are blinking green. Ready to step under the stadium lights?":l.era==="TV_DRESSING_ROOM"?"Stagehand just chalked your mark on Floor Two. Coffee down, collar straight — you are up.":"Frankie already put twenty bucks on table four. Step back out before the beer gets warm."}function yt(l){if(l.stepOnStageSubtitle&&l.stepOnStageSubtitle.trim().length>0)return l.stepOnStageSubtitle.trim();if(l.isFreshSave)return"Start Playable Story Audition";const e=qe(l.currentAct??1);return l.currentVenueName?`${e} · ${l.currentVenueName}`:l.currentShowTitle?`${e} · ${l.currentShowTitle}`:`${e} · Live Broadcast Stage`}function kt(l){return l.dailyCompletedToday?"CLEARED":l.dailyBroadcastLabel&&l.dailyBroadcastLabel.trim().length>0?l.dailyBroadcastLabel.trim().replace(/^broadcast\s+/i,""):typeof l.dailyBroadcastNumber=="number"&&Number.isFinite(l.dailyBroadcastNumber)?`#${Math.max(1,Math.round(l.dailyBroadcastNumber))}`:"TICKET"}function wt(){return`
    <svg class="v5gr-curtain-svg" viewBox="0 0 180 540" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-velvet-l" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#380408"/>
          <stop offset="22%" stop-color="#7c0c16"/>
          <stop offset="44%" stop-color="#a81b25"/>
          <stop offset="64%" stop-color="#5d070f"/>
          <stop offset="86%" stop-color="#981620"/>
          <stop offset="100%" stop-color="#400409"/>
        </linearGradient>
        <linearGradient id="v5gr-gold-cord" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff0a8"/>
          <stop offset="50%" stop-color="#d49b35"/>
          <stop offset="100%" stop-color="#7b4e0c"/>
        </linearGradient>
      </defs>
      <path d="M 0 0 L 172 0 C 138 118, 102 228, 66 322 C 92 385, 86 462, 92 540 L 0 540 Z" fill="url(#v5gr-velvet-l)"/>
      <path d="M 28 0 C 20 115, 22 225, 42 326 C 28 402, 24 468, 28 540" fill="none" stroke="rgba(255,140,145,0.22)" stroke-width="5"/>
      <path d="M 76 0 C 66 115, 58 228, 54 322 C 58 405, 56 472, 62 540" fill="none" stroke="rgba(18,0,2,0.52)" stroke-width="9"/>
      <path d="M 122 0 C 102 108, 82 214, 62 322" fill="none" stroke="rgba(255,130,130,0.18)" stroke-width="6"/>
      <path d="M 164 0 C 132 115, 98 226, 65 322" fill="none" stroke="#d9a13b" stroke-width="2.5" opacity="0.62"/>
      <!-- Gold velvet tieback sash -->
      <path d="M 0 308 Q 38 334, 72 320 L 70 336 Q 36 350, 0 326 Z" fill="url(#v5gr-gold-cord)" stroke="#5c3606" stroke-width="1.4"/>
      <circle cx="71" cy="328" r="7" fill="url(#v5gr-gold-cord)" stroke="#5c3606" stroke-width="1.3"/>
    </svg>
  `}function Ct(){return`
    <svg class="v5gr-curtain-svg" viewBox="0 0 180 540" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-velvet-r" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stop-color="#380408"/>
          <stop offset="22%" stop-color="#7c0c16"/>
          <stop offset="44%" stop-color="#a81b25"/>
          <stop offset="64%" stop-color="#5d070f"/>
          <stop offset="86%" stop-color="#981620"/>
          <stop offset="100%" stop-color="#400409"/>
        </linearGradient>
        <linearGradient id="v5gr-gold-cord-r" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff0a8"/>
          <stop offset="50%" stop-color="#d49b35"/>
          <stop offset="100%" stop-color="#7b4e0c"/>
        </linearGradient>
      </defs>
      <path d="M 180 0 L 8 0 C 42 118, 78 228, 114 322 C 88 385, 94 462, 88 540 L 180 540 Z" fill="url(#v5gr-velvet-r)"/>
      <path d="M 152 0 C 160 115, 158 225, 138 326 C 152 402, 156 468, 152 540" fill="none" stroke="rgba(255,140,145,0.22)" stroke-width="5"/>
      <path d="M 104 0 C 114 115, 122 228, 126 322 C 122 405, 124 472, 118 540" fill="none" stroke="rgba(18,0,2,0.52)" stroke-width="9"/>
      <path d="M 58 0 C 78 108, 98 214, 118 322" fill="none" stroke="rgba(255,130,130,0.18)" stroke-width="6"/>
      <path d="M 16 0 C 48 115, 82 226, 115 322" fill="none" stroke="#d9a13b" stroke-width="2.5" opacity="0.62"/>
      <!-- Gold velvet tieback sash -->
      <path d="M 180 308 Q 142 334, 108 320 L 110 336 Q 144 350, 180 326 Z" fill="url(#v5gr-gold-cord-r)" stroke="#5c3606" stroke-width="1.4"/>
      <circle cx="109" cy="328" r="7" fill="url(#v5gr-gold-cord-r)" stroke="#5c3606" stroke-width="1.3"/>
    </svg>
  `}function _t(){return`
    <svg class="v5gr-crest-svg" viewBox="0 0 220 156" role="img" aria-label="World's Smartest Golden Laurel Brain Crest">
      <defs>
        <radialGradient id="v5gr-crest-aura" cx="50%" cy="44%" r="50%">
          <stop offset="0%" stop-color="#ffe799" stop-opacity="0.58"/>
          <stop offset="55%" stop-color="#d89226" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#d89226" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="v5gr-gold-metal" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stop-color="#fff7c8"/>
          <stop offset="28%" stop-color="#f5c654"/>
          <stop offset="64%" stop-color="#b87618"/>
          <stop offset="88%" stop-color="#eab646"/>
          <stop offset="100%" stop-color="#7c4909"/>
        </linearGradient>
        <linearGradient id="v5gr-brain-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff6c2"/>
          <stop offset="38%" stop-color="#f2be47"/>
          <stop offset="76%" stop-color="#b26f13"/>
          <stop offset="100%" stop-color="#734206"/>
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="68" rx="92" ry="64" fill="url(#v5gr-crest-aura)"/>
      <!-- Left Laurel Wreath -->
      <g fill="url(#v5gr-gold-metal)" stroke="#6d3e07" stroke-width="1.2">
        <path d="M 103 122 C 62 114, 34 84, 38 40 C 42 26, 48 16, 56 10" fill="none" stroke="url(#v5gr-gold-metal)" stroke-width="4" stroke-linecap="round"/>
        <path d="M 46 28 C 36 18, 38 7, 50 10 C 56 19, 54 27, 46 28 Z"/>
        <path d="M 38 47 C 24 38, 22 25, 36 27 C 44 34, 44 43, 38 47 Z"/>
        <path d="M 36 68 C 20 62, 16 49, 31 48 C 40 53, 42 63, 36 68 Z"/>
        <path d="M 42 88 C 25 87, 20 74, 34 70 C 44 74, 47 83, 42 88 Z"/>
        <path d="M 55 106 C 39 109, 32 98, 45 90 C 56 92, 60 100, 55 106 Z"/>
        <path d="M 75 118 C 60 124, 52 115, 64 105 C 75 106, 80 112, 75 118 Z"/>
        <!-- Inner leaves -->
        <path d="M 50 38 C 60 28, 66 36, 56 48 Z"/>
        <path d="M 46 58 C 58 51, 63 60, 51 70 Z"/>
        <path d="M 51 80 C 64 75, 67 85, 55 93 Z"/>
        <path d="M 65 98 C 78 96, 79 106, 68 111 Z"/>
      </g>
      <!-- Right Laurel Wreath (mirrored) -->
      <g transform="translate(220, 0) scale(-1, 1)" fill="url(#v5gr-gold-metal)" stroke="#6d3e07" stroke-width="1.2">
        <path d="M 103 122 C 62 114, 34 84, 38 40 C 42 26, 48 16, 56 10" fill="none" stroke="url(#v5gr-gold-metal)" stroke-width="4" stroke-linecap="round"/>
        <path d="M 46 28 C 36 18, 38 7, 50 10 C 56 19, 54 27, 46 28 Z"/>
        <path d="M 38 47 C 24 38, 22 25, 36 27 C 44 34, 44 43, 38 47 Z"/>
        <path d="M 36 68 C 20 62, 16 49, 31 48 C 40 53, 42 63, 36 68 Z"/>
        <path d="M 42 88 C 25 87, 20 74, 34 70 C 44 74, 47 83, 42 88 Z"/>
        <path d="M 55 106 C 39 109, 32 98, 45 90 C 56 92, 60 100, 55 106 Z"/>
        <path d="M 75 118 C 60 124, 52 115, 64 105 C 75 106, 80 112, 75 118 Z"/>
        <path d="M 50 38 C 60 28, 66 36, 56 48 Z"/>
        <path d="M 46 58 C 58 51, 63 60, 51 70 Z"/>
        <path d="M 51 80 C 64 75, 67 85, 55 93 Z"/>
        <path d="M 65 98 C 78 96, 79 106, 68 111 Z"/>
      </g>
      <!-- Sculpted Golden Trophy Pedestal Base -->
      <path d="M 96 116 L 124 116 L 119 132 L 101 132 Z" fill="url(#v5gr-gold-metal)" stroke="#623805" stroke-width="1.3"/>
      <ellipse cx="110" cy="136" rx="28" ry="8" fill="url(#v5gr-gold-metal)" stroke="#5c3305" stroke-width="1.5"/>
      <ellipse cx="110" cy="142" rx="34" ry="8" fill="url(#v5gr-gold-metal)" stroke="#4c2804" stroke-width="1.6"/>
      <!-- Sculpted Golden Brain Emblem (Dual Hemispheres + Cortical Folds) -->
      <g transform="translate(110, 62)">
        <!-- Left Hemisphere -->
        <path d="M -2 -36 C -16 -38, -32 -30, -37 -16 C -43 -4, -40 12, -29 20 C -22 25, -10 25, -2 21 Z"
              fill="url(#v5gr-brain-grad)" stroke="#5b3204" stroke-width="2.2" stroke-linejoin="round"/>
        <!-- Right Hemisphere -->
        <path d="M 2 -36 C 16 -38, 32 -30, 37 -16 C 43 -4, 40 12, 29 20 C 22 25, 10 25, 2 21 Z"
              fill="url(#v5gr-brain-grad)" stroke="#5b3204" stroke-width="2.2" stroke-linejoin="round"/>
        <!-- Cerebellum / Brainstem Accent -->
        <path d="M -14 23 C -9 31, 9 31, 14 23 C 8 34, 4 39, 0 41 C -4 39, -8 34, -14 23 Z"
              fill="url(#v5gr-gold-metal)" stroke="#5b3204" stroke-width="1.8"/>
        <!-- Central Longitudinal Fissure -->
        <line x1="0" y1="-35" x2="0" y2="23" stroke="#5a3104" stroke-width="2.6" stroke-linecap="round"/>
        <!-- Left Hemisphere Cortical Gyri -->
        <path d="M -28 -20 C -20 -26, -9 -22, -7 -13 C -6 -6, -15 -2, -22 -7" fill="none" stroke="#6a3b06" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M -33 -3 C -24 2, -14 1, -8 -4" fill="none" stroke="#6a3b06" stroke-width="2.1" stroke-linecap="round"/>
        <path d="M -28 11 C -19 16, -9 14, -5 6" fill="none" stroke="#6a3b06" stroke-width="2.1" stroke-linecap="round"/>
        <!-- Right Hemisphere Cortical Gyri -->
        <path d="M 28 -20 C 20 -26, 9 -22, 7 -13 C 6 -6, 15 -2, 22 -7" fill="none" stroke="#6a3b06" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M 33 -3 C 24 2, 14 1, 8 -4" fill="none" stroke="#6a3b06" stroke-width="2.1" stroke-linecap="round"/>
        <path d="M 28 11 C 19 16, 9 14, 5 6" fill="none" stroke="#6a3b06" stroke-width="2.1" stroke-linecap="round"/>
        <!-- Metallic Rim Specular Glints -->
        <path d="M -24 -27 C -16 -32, -8 -32, -4 -29" fill="none" stroke="#fffbe0" stroke-width="2" stroke-linecap="round" opacity="0.86"/>
        <path d="M 24 -27 C 16 -32, 8 -32, 4 -29" fill="none" stroke="#fffbe0" stroke-width="1.9" stroke-linecap="round" opacity="0.78"/>
      </g>
    </svg>
  `}function It(){return`
    <svg class="v5gr-title-svg" viewBox="0 0 640 162" role="img" aria-label="World's Smartest">
      <defs>
        <linearGradient id="v5gr-title-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8d4"/>
          <stop offset="28%" stop-color="#ffd56b"/>
          <stop offset="56%" stop-color="#e39d28"/>
          <stop offset="85%" stop-color="#f7c956"/>
          <stop offset="100%" stop-color="#a2610c"/>
        </linearGradient>
        <filter id="v5gr-title-glow" x="-12%" y="-20%" width="124%" height="145%">
          <feDropShadow dx="0" dy="5" stdDeviation="3.5" flood-color="#1c0902" flood-opacity="0.92"/>
          <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#ffbe44" flood-opacity="0.52"/>
        </filter>
      </defs>
      <!-- Line 1: WORLD'S -->
      <g filter="url(#v5gr-title-glow)">
        <text x="320" y="68" text-anchor="middle" class="v5gr-svg-title-shadow" font-size="68" letter-spacing="4">WORLD'S</text>
        <text x="320" y="64" text-anchor="middle" class="v5gr-svg-title-bevel" font-size="68" letter-spacing="4">WORLD'S</text>
        <text x="320" y="64" text-anchor="middle" class="v5gr-svg-title-face" font-size="68" letter-spacing="4" fill="url(#v5gr-title-gold)">WORLD'S</text>
        <text x="320" y="64" text-anchor="middle" class="v5gr-svg-title-bulbs-halo" font-size="68" letter-spacing="4">WORLD'S</text>
        <text x="320" y="64" text-anchor="middle" class="v5gr-svg-title-bulbs" font-size="68" letter-spacing="4">WORLD'S</text>
      </g>
      <!-- Line 2: SMARTEST -->
      <g filter="url(#v5gr-title-glow)">
        <text x="320" y="144" text-anchor="middle" class="v5gr-svg-title-shadow" font-size="74" letter-spacing="3.5">SMARTEST</text>
        <text x="320" y="140" text-anchor="middle" class="v5gr-svg-title-bevel" font-size="74" letter-spacing="3.5">SMARTEST</text>
        <text x="320" y="140" text-anchor="middle" class="v5gr-svg-title-face" font-size="74" letter-spacing="3.5" fill="url(#v5gr-title-gold)">SMARTEST</text>
        <text x="320" y="140" text-anchor="middle" class="v5gr-svg-title-bulbs-halo" font-size="74" letter-spacing="3.5">SMARTEST</text>
        <text x="320" y="140" text-anchor="middle" class="v5gr-svg-title-bulbs v5gr-svg-title-bulbs-alt" font-size="74" letter-spacing="3.5">SMARTEST</text>
      </g>
    </svg>
  `}function Tt(){return`
    <svg class="v5gr-phone-svg" viewBox="0 0 88 76" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-brass-p" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff4bf"/>
          <stop offset="40%" stop-color="#e4ac3d"/>
          <stop offset="80%" stop-color="#9e6514"/>
          <stop offset="100%" stop-color="#5d3607"/>
        </linearGradient>
      </defs>
      <!-- Acoustic ring waves -->
      <path class="v5gr-ring-wave" d="M 14 14 Q 6 24, 14 34" fill="none" stroke="#ffd86b" stroke-width="2.6" stroke-linecap="round"/>
      <path class="v5gr-ring-wave" d="M 74 14 Q 82 24, 74 34" fill="none" stroke="#ffd86b" stroke-width="2.6" stroke-linecap="round"/>
      <!-- Cradle base -->
      <path d="M 22 66 L 66 66 L 60 40 L 28 40 Z" fill="url(#v5gr-brass-p)" stroke="#4c2905" stroke-width="2"/>
      <rect x="18" y="64" width="52" height="7" rx="3" fill="url(#v5gr-brass-p)" stroke="#4c2905" stroke-width="1.8"/>
      <!-- Rotary dial -->
      <circle cx="44" cy="52" r="10.5" fill="#2c1709" stroke="#f6c758" stroke-width="2"/>
      <circle cx="44" cy="52" r="4.2" fill="#e8b648"/>
      <circle cx="38" cy="48" r="1.4" fill="#fff0b3"/>
      <circle cx="44" cy="45" r="1.4" fill="#fff0b3"/>
      <circle cx="50" cy="48" r="1.4" fill="#fff0b3"/>
      <circle cx="51" cy="54" r="1.4" fill="#fff0b3"/>
      <!-- Cradle forks -->
      <path d="M 33 40 L 31 28 M 55 40 L 57 28" stroke="#f0be4d" stroke-width="3.2" stroke-linecap="round"/>
      <!-- Rattling Handset -->
      <g class="v5gr-phone-handset">
        <path d="M 18 22 C 26 11, 62 11, 70 22 C 74 26, 70 33, 63 31 L 58 26 C 50 22, 38 22, 30 26 L 25 31 C 18 33, 14 26, 18 22 Z"
              fill="url(#v5gr-brass-p)" stroke="#4b2905" stroke-width="2"/>
      </g>
    </svg>
  `}function xt(){return`
    <svg class="v5gr-prop-svg v5gr-trunk-svg" viewBox="0 0 210 142" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-leather" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#c67638"/>
          <stop offset="48%" stop-color="#8d491d"/>
          <stop offset="100%" stop-color="#51240a"/>
        </linearGradient>
        <linearGradient id="v5gr-leather-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a85c27"/>
          <stop offset="100%" stop-color="#4e230b"/>
        </linearGradient>
        <linearGradient id="v5gr-trunk-brass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff0a6"/>
          <stop offset="50%" stop-color="#d89d30"/>
          <stop offset="100%" stop-color="#7d4d0c"/>
        </linearGradient>
        <linearGradient id="v5gr-polaroid-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f7c873"/>
          <stop offset="55%" stop-color="#9e5a38"/>
          <stop offset="100%" stop-color="#22192b"/>
        </linearGradient>
        <linearGradient id="v5gr-polaroid-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#75b6d9"/>
          <stop offset="60%" stop-color="#30577c"/>
          <stop offset="100%" stop-color="#132133"/>
        </linearGradient>
      </defs>
      <!-- Desk contact shadow -->
      <ellipse cx="106" cy="129" rx="84" ry="11" fill="rgba(8,3,1,0.68)"/>
      <!-- Hinged Open Lid (Back) -->
      <path d="M 28 24 L 140 12 L 152 68 L 40 82 Z" fill="url(#v5gr-leather-lid)" stroke="#3e1b07" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M 35 28 L 134 18 L 144 64 L 45 76 Z" fill="#3a190a" stroke="#6f3615" stroke-width="1.4"/>
      <!-- Lid brass clasps -->
      <rect x="44" y="13" width="16" height="9" rx="2" transform="rotate(-6 52 17)" fill="url(#v5gr-trunk-brass)" stroke="#4c2906" stroke-width="1.2"/>
      <rect x="115" y="6" width="16" height="9" rx="2" transform="rotate(-6 123 10)" fill="url(#v5gr-trunk-brass)" stroke="#4c2906" stroke-width="1.2"/>
      <!-- Trunk interior cavity -->
      <polygon points="34,76 144,62 182,82 74,100" fill="#2c1308" stroke="#5c2b10" stroke-width="1.8"/>
      <!-- 3 Angled Peeking Miniature Polaroids -->
      <g class="v5gr-trunk-polaroids">
        <!-- Left Polaroid -->
        <g transform="translate(76, 70) rotate(-18)">
          <rect x="-20" y="-26" width="38" height="44" rx="2" fill="#f7efdd" stroke="#c8b99c" stroke-width="1.2"/>
          <rect x="-16" y="-22" width="30" height="28" fill="url(#v5gr-polaroid-blue)"/>
          <path d="M -16 6 L -6 -7 L 3 1 L 10 -10 L 14 6 Z" fill="#172230"/>
        </g>
        <!-- Right Polaroid -->
        <g transform="translate(132, 69) rotate(13)">
          <rect x="-20" y="-26" width="38" height="44" rx="2" fill="#f5ead4" stroke="#c8b99c" stroke-width="1.2"/>
          <rect x="-16" y="-22" width="30" height="28" fill="url(#v5gr-polaroid-sky)"/>
          <path d="M -16 6 L -8 -12 L 4 -3 L 14 -14 L 14 6 Z" fill="#261714"/>
        </g>
        <!-- Center Hero Polaroid -->
        <g transform="translate(105, 74) rotate(-3)">
          <rect x="-22" y="-28" width="42" height="48" rx="2.5" fill="#fffaf0" stroke="#d5c6a8" stroke-width="1.4"/>
          <rect x="-17" y="-23" width="32" height="30" fill="url(#v5gr-polaroid-sky)"/>
          <circle cx="6" cy="-14" r="5" fill="#fff0b3" opacity="0.88"/>
          <path d="M -17 7 L -7 -9 L 2 -2 L 10 -12 L 15 7 Z" fill="#1e1518"/>
        </g>
      </g>
      <!-- Trunk Lower Front & Side Body -->
      <polygon points="34,76 74,100 74,132 34,106" fill="#6b3413" stroke="#361606" stroke-width="2.2" stroke-linejoin="round"/>
      <polygon points="74,100 182,82 182,114 74,132" fill="url(#v5gr-leather)" stroke="#361606" stroke-width="2.2" stroke-linejoin="round"/>
      <!-- Stitched leather rim highlight -->
      <line x1="77" y1="103" x2="179" y2="86" stroke="#e49b5b" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.55"/>
      <!-- Brass Corner Guards & Rivets -->
      <path d="M 74 100 L 89 97 L 89 108 L 74 111 Z" fill="url(#v5gr-trunk-brass)" stroke="#4c2a06" stroke-width="1.3"/>
      <path d="M 74 121 L 89 118 L 89 129 L 74 132 Z" fill="url(#v5gr-trunk-brass)" stroke="#4c2a06" stroke-width="1.3"/>
      <path d="M 167 84 L 182 82 L 182 93 L 167 96 Z" fill="url(#v5gr-trunk-brass)" stroke="#4c2a06" stroke-width="1.3"/>
      <path d="M 167 105 L 182 103 L 182 114 L 167 117 Z" fill="url(#v5gr-trunk-brass)" stroke="#4c2a06" stroke-width="1.3"/>
      <!-- Brass Locks -->
      <rect x="97" y="96" width="11" height="12" rx="2" transform="skewY(-9)" fill="url(#v5gr-trunk-brass)" stroke="#4a2905" stroke-width="1.2"/>
      <rect x="149" y="88" width="11" height="12" rx="2" transform="skewY(-9)" fill="url(#v5gr-trunk-brass)" stroke="#4a2905" stroke-width="1.2"/>
      <!-- Leather Carry Handle -->
      <path d="M 114 110 C 114 124, 146 119, 146 105" fill="none" stroke="#471d08" stroke-width="8" stroke-linecap="round"/>
      <path d="M 114 110 C 114 124, 146 119, 146 105" fill="none" stroke="#ba6c31" stroke-width="4.4" stroke-linecap="round"/>
      <circle cx="114" cy="109" r="3.4" fill="url(#v5gr-trunk-brass)" stroke="#4b2905" stroke-width="1"/>
      <circle cx="146" cy="104" r="3.4" fill="url(#v5gr-trunk-brass)" stroke="#4b2905" stroke-width="1"/>
    </svg>
  `}function At(){const l=[];for(let e=0;e<12;e++){const t=e*30*Math.PI/180,o=105+Math.cos(t)*53,i=68+Math.sin(t)*23,s=105+Math.cos(t)*66,a=68+Math.sin(t)*29;l.push(`<line x1="${o.toFixed(1)}" y1="${i.toFixed(1)}" x2="${s.toFixed(1)}" y2="${a.toFixed(1)}" stroke="#4a2a05" stroke-width="2.4" stroke-linecap="round"/>`)}return`
    <svg class="v5gr-prop-svg v5gr-dial-svg" viewBox="0 0 210 132" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-dial-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#5e3708"/>
          <stop offset="26%" stop-color="#e5b146"/>
          <stop offset="50%" stop-color="#fff0a6"/>
          <stop offset="76%" stop-color="#ba7e1f"/>
          <stop offset="100%" stop-color="#4c2a06"/>
        </linearGradient>
        <radialGradient id="v5gr-dial-face" cx="46%" cy="38%" r="60%">
          <stop offset="0%" stop-color="#fff6c7"/>
          <stop offset="46%" stop-color="#e4ad3d"/>
          <stop offset="85%" stop-color="#a66c17"/>
          <stop offset="100%" stop-color="#6b4009"/>
        </radialGradient>
        <radialGradient id="v5gr-dial-cap" cx="44%" cy="34%" r="64%">
          <stop offset="0%" stop-color="#fff9d8"/>
          <stop offset="42%" stop-color="#f0be4c"/>
          <stop offset="100%" stop-color="#965e12"/>
        </radialGradient>
      </defs>
      <!-- Contact shadow -->
      <ellipse cx="105" cy="108" rx="88" ry="18" fill="rgba(8,3,1,0.72)"/>
      <!-- Base flange rim -->
      <ellipse cx="105" cy="94" rx="82" ry="30" fill="url(#v5gr-dial-side)" stroke="#482705" stroke-width="2.2"/>
      <ellipse cx="105" cy="87" rx="80" ry="29" fill="url(#v5gr-dial-face)" stroke="#623808" stroke-width="1.6"/>
      <!-- Knurled cylinder skirt -->
      <path d="M 33 70 L 33 84 A 72 28 0 0 0 177 84 L 177 70 Z" fill="url(#v5gr-dial-side)" stroke="#4d2b05" stroke-width="1.8"/>
      <!-- Knurling teeth notches along skirt -->
      <path d="M 42 78 L 42 90 M 54 83 L 54 95 M 68 87 L 68 99 M 82 90 L 82 102 M 96 91 L 96 104 M 112 91 L 112 104 M 126 90 L 126 102 M 140 87 L 140 99 M 154 83 L 154 95 M 166 78 L 166 90"
            stroke="#593306" stroke-width="2" opacity="0.72"/>
      <!-- Main Rotary Top Plate -->
      <g class="v5gr-dial-rotor">
        <ellipse cx="105" cy="68" rx="72" ry="31" fill="url(#v5gr-dial-face)" stroke="#fff0a6" stroke-width="1.8"/>
        <ellipse cx="105" cy="68" rx="51" ry="21" fill="none" stroke="#6c3f09" stroke-width="2"/>
        ${l.join("")}
        <!-- Raised Machined Center Cap -->
        <path d="M 67 52 L 67 66 A 38 16 0 0 0 143 66 L 143 52 Z" fill="url(#v5gr-dial-side)" stroke="#4d2b05" stroke-width="1.6"/>
        <ellipse cx="105" cy="52" rx="38" ry="16" fill="url(#v5gr-dial-cap)" stroke="#fff4bc" stroke-width="1.5"/>
        <ellipse cx="105" cy="52" rx="28" ry="11" fill="none" stroke="#996114" stroke-width="1.2" opacity="0.6"/>
        <!-- Indicator dimple -->
        <circle cx="105" cy="86" r="3.4" fill="#18a572" stroke="#fff2b5" stroke-width="1.2"/>
      </g>
    </svg>
  `}function Mt(l,e){const t=L(l);return`
    <svg class="v5gr-prop-svg v5gr-daily-svg" viewBox="0 0 190 162" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-red-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#d82b27"/>
          <stop offset="48%" stop-color="#9e1416"/>
          <stop offset="100%" stop-color="#530608"/>
        </linearGradient>
        <linearGradient id="v5gr-red-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff9955"/>
          <stop offset="50%" stop-color="#e33622"/>
          <stop offset="100%" stop-color="#9e1214"/>
        </linearGradient>
        <linearGradient id="v5gr-cream-lit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8dd"/>
          <stop offset="65%" stop-color="#f6d893"/>
          <stop offset="100%" stop-color="#d8a24a"/>
        </linearGradient>
        <linearGradient id="v5gr-disp-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff0a6"/>
          <stop offset="52%" stop-color="#dc9e31"/>
          <stop offset="100%" stop-color="#764509"/>
        </linearGradient>
        <linearGradient id="v5gr-ticket-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff2b0"/>
          <stop offset="100%" stop-color="#d69527"/>
        </linearGradient>
      </defs>
      <!-- Wooden corbel shelf -->
      <polygon points="22,126 118,144 156,120 60,104" fill="#6d3516" stroke="#311406" stroke-width="2"/>
      <polygon points="22,126 118,144 118,156 22,138" fill="#47200c" stroke="#260f04" stroke-width="1.8"/>
      <!-- Dispenser Housing Side (glowing red vintage lamp window) -->
      <path d="M 32 34 C 32 22, 46 15, 62 18 L 106 28 C 118 31, 124 41, 124 54 L 124 128 L 78 136 L 32 114 Z"
            fill="url(#v5gr-red-body)" stroke="#3e0708" stroke-width="2.4" stroke-linejoin="round"/>
      <!-- Side backlit sconce panel -->
      <path d="M 41 44 C 41 38, 49 35, 58 38 L 69 42 L 69 112 L 41 99 Z" fill="url(#v5gr-red-glow)" stroke="url(#v5gr-disp-gold)" stroke-width="2.6"/>
      <!-- Front Faceplate -->
      <path d="M 78 46 C 78 36, 92 28, 108 28 L 136 24 C 145 24, 150 32, 150 42 L 150 116 L 78 136 Z"
            fill="url(#v5gr-red-body)" stroke="url(#v5gr-disp-gold)" stroke-width="2.6" stroke-linejoin="round"/>
      <!-- Illuminated DAILY SHOW Glass Sign -->
      <polygon points="88,48 142,37 142,87 88,99" fill="url(#v5gr-cream-lit)" stroke="url(#v5gr-disp-gold)" stroke-width="3"/>
      <g transform="matrix(1, -0.21, 0, 1, 115, 66)">
        <text x="0" y="-4" text-anchor="middle" fill="#6a1b08" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="14" letter-spacing="0.6">DAILY</text>
        <text x="0" y="13" text-anchor="middle" fill="#6a1b08" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="14" letter-spacing="0.6">SHOW</text>
      </g>
      <!-- Brass Ticket Dispenser Slot -->
      <polygon points="94,108 140,97 140,106 94,117" fill="#1e0a04" stroke="url(#v5gr-disp-gold)" stroke-width="2"/>
      <!-- Protruding Perforated Golden Ticket -->
      <g class="v5gr-daily-ticket">
        <path d="M 103 111 L 133 103 L 166 135 L 158 140 L 160 144 L 151 146 L 149 151 L 139 150 L 136 155 L 103 111 Z"
              fill="${e?"#167d57":"url(#v5gr-ticket-gold)"}" stroke="#693e07" stroke-width="1.8" stroke-linejoin="round"/>
        <text x="135" y="132" text-anchor="middle" transform="rotate(42 135 132)"
              fill="${e?"#fff6cf":"#422004"}" font-family="JetBrains Mono, monospace" font-weight="800" font-size="11.5" letter-spacing="0.8">${t}</text>
      </g>
    </svg>
  `}function Et(){return`
    <svg class="v5gr-prop-svg v5gr-endless-svg" viewBox="0 0 180 166" aria-hidden="true">
      <defs>
        <radialGradient id="v5gr-emerald-disc" cx="44%" cy="38%" r="60%">
          <stop offset="0%" stop-color="#29b87e"/>
          <stop offset="56%" stop-color="#0d6c49"/>
          <stop offset="100%" stop-color="#053222"/>
        </radialGradient>
        <linearGradient id="v5gr-flame-outer" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stop-color="#d85b0c"/>
          <stop offset="48%" stop-color="#ffab2e"/>
          <stop offset="86%" stop-color="#fff29b"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
        <linearGradient id="v5gr-flame-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8c8"/>
          <stop offset="45%" stop-color="#f3bd48"/>
          <stop offset="100%" stop-color="#9e5d10"/>
        </linearGradient>
        <radialGradient id="v5gr-flame-halo" cx="50%" cy="46%" r="48%">
          <stop offset="0%" stop-color="#ffae34" stop-opacity="0.58"/>
          <stop offset="65%" stop-color="#ff6b14" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#ff6b14" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="90" cy="82" r="78" fill="url(#v5gr-flame-halo)"/>
      <!-- Rising Animated Outer Flame Crown -->
      <g class="v5gr-flame-crown">
        <path d="M 48 64 C 42 40, 56 28, 66 39 C 68 18, 86 4, 92 2 C 98 18, 112 20, 114 38 C 126 27, 138 42, 132 64 Z"
              fill="url(#v5gr-flame-outer)" opacity="0.92"/>
      </g>
      <!-- Sculpted Ornate Brass Laurel Ring -->
      <circle cx="90" cy="96" r="56" fill="url(#v5gr-flame-gold)" stroke="#5b3206" stroke-width="2.6"/>
      <circle cx="90" cy="96" r="48" fill="#5e3406" stroke="#ffeba0" stroke-width="1.6"/>
      <!-- Glowing Emerald Enamel Core -->
      <circle cx="90" cy="96" r="44" fill="url(#v5gr-emerald-disc)" stroke="#f6c758" stroke-width="2.2"/>
      <!-- Center Sculpted Golden Flame Emblem -->
      <path d="M 90 54 C 102 70, 119 79, 118 100 C 117 118, 105 130, 90 130 C 74 130, 62 117, 63 99 C 64 85, 73 79, 77 71 C 78 78, 81 82, 84 82 C 81 71, 84 61, 90 54 Z"
            fill="url(#v5gr-flame-gold)" stroke="#5f3406" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M 91 80 C 98 90, 104 97, 102 109 C 101 118, 95 123, 90 123 C 83 123, 78 117, 79 108 C 80 101, 86 96, 87 89 C 89 92, 91 93, 91 80 Z"
            fill="#fff4b8" opacity="0.82"/>
    </svg>
  `}function Rt(){return`
    <svg class="v5gr-ticket-frame-svg" viewBox="0 0 420 144" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5gr-tk-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8cc"/>
          <stop offset="30%" stop-color="#f7ca59"/>
          <stop offset="68%" stop-color="#b87616"/>
          <stop offset="100%" stop-color="#f2c04b"/>
        </linearGradient>
        <linearGradient id="v5gr-tk-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#15845d"/>
          <stop offset="48%" stop-color="#0b5e42"/>
          <stop offset="100%" stop-color="#063928"/>
        </linearGradient>
      </defs>
      <!-- Outer beveled gold notched theater ticket silhouette -->
      <path d="M 26 8 L 394 8 C 394 21, 403 30, 412 30 L 412 52 C 401 52, 394 60, 394 72 C 394 84, 401 92, 412 92 L 412 114 C 403 114, 394 123, 394 136 L 26 136 C 26 123, 17 114, 8 114 L 8 92 C 19 92, 26 84, 26 72 C 26 60, 19 52, 8 52 L 8 30 C 17 30, 26 21, 26 8 Z"
            fill="url(#v5gr-tk-gold)" stroke="#5b3405" stroke-width="3"/>
      <!-- Inner emerald enamel face -->
      <path d="M 34 16 L 386 16 C 388 28, 395 35, 404 37 L 404 46 C 391 49, 384 59, 384 72 C 384 85, 391 95, 404 98 L 404 107 C 395 109, 388 116, 386 128 L 34 128 C 32 116, 25 109, 16 107 L 16 98 C 29 95, 36 85, 36 72 C 36 59, 29 49, 16 46 L 16 37 C 25 35, 32 28, 34 16 Z"
            fill="url(#v5gr-tk-emerald)" stroke="#512c04" stroke-width="2.2"/>
      <!-- Inner fine gold pinstripe -->
      <path d="M 41 23 L 379 23 C 382 33, 388 39, 396 42 L 396 44 C 382 49, 376 60, 376 72 C 376 84, 382 95, 396 100 L 396 102 C 388 105, 382 111, 379 121 L 41 121 C 38 111, 32 105, 24 102 L 24 100 C 38 95, 44 84, 44 72 C 44 60, 38 49, 24 44 L 24 42 C 32 39, 38 33, 41 23 Z"
            fill="none" stroke="#f7ce68" stroke-width="1.6" opacity="0.72"/>
    </svg>
  `}function Lt(){return`
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="18" fill="none" stroke="#f6c758" stroke-width="2.4"/>
      <circle cx="24" cy="24" r="11" fill="none" stroke="#f6c758" stroke-width="1.8" opacity="0.75"/>
      <circle cx="24" cy="24" r="4.5" fill="#ffe699"/>
      <line x1="24" y1="24" x2="36" y2="12" stroke="#fff4c4" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M 24 6 A 18 18 0 0 1 39 14 L 24 24 Z" fill="#f6c758" opacity="0.28"/>
    </svg>
  `}function Nt(){return`
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M 14 10 L 34 10 L 32 23 C 31 29, 28 32, 24 32 C 20 32, 17 29, 16 23 Z" fill="#f6c758" stroke="#623805" stroke-width="1.6"/>
      <path d="M 14 13 L 9 13 C 9 20, 12 24, 16 24 M 34 13 L 39 13 C 39 20, 36 24, 32 24" fill="none" stroke="#f6c758" stroke-width="2.4" stroke-linecap="round"/>
      <rect x="21" y="32" width="6" height="6" fill="#e2a634"/>
      <rect x="15" y="37" width="18" height="4.5" rx="2" fill="#f8d26c" stroke="#623805" stroke-width="1.4"/>
      <polygon points="24,14 25.7,18.2 30.2,18.4 26.7,21.1 27.9,25.5 24,23 20.1,25.5 21.3,21.1 17.8,18.4 22.3,18.2" fill="#5e3406"/>
    </svg>
  `}function Pt(){return`
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path d="M 8 13 C 8 11, 10 9, 12 9 L 19 9 L 22 13 L 34 13 C 36 13, 37 15, 37 17 L 37 32 C 37 34, 35 35, 33 35 L 11 35 C 9 35, 8 34, 8 32 Z"
            fill="#f5c654" stroke="#5b3205" stroke-width="1.8" stroke-linejoin="round"/>
      <circle cx="22" cy="24" r="4.5" fill="#5b3205"/>
      <circle cx="22" cy="24" r="2" fill="#fff0b3"/>
    </svg>
  `}function Ne(l){return`
    <svg viewBox="0 0 44 44" aria-hidden="true">
      <path d="M 10 17 L 17 17 L 26 10 L 26 34 L 17 27 L 10 27 Z" fill="#f5c654" stroke="#5b3205" stroke-width="1.7" stroke-linejoin="round"/>
      ${l?`<path d="M 30 16 C 33 19, 33 25, 30 28" fill="none" stroke="#fff0b3" stroke-width="2.4" stroke-linecap="round"/>
             <path d="M 34 12 C 39 17, 39 27, 34 32" fill="none" stroke="#f5c654" stroke-width="2.2" stroke-linecap="round"/>`:`<line x1="29" y1="15" x2="38" y2="29" stroke="#f46a5a" stroke-width="2.8" stroke-linecap="round"/>
             <line x1="38" y1="15" x2="29" y2="29" stroke="#f46a5a" stroke-width="2.8" stroke-linecap="round"/>`}
    </svg>
  `}function Pe(l){return l?`
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M 14 7 L 14 14 L 7 14 M 22 7 L 22 14 L 29 14 M 14 29 L 14 22 L 7 22 M 22 29 L 22 22 L 29 22"
              fill="none" stroke="#f8d26c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `:`
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M 7 14 L 7 7 L 14 7 M 22 7 L 29 7 L 29 14 M 7 22 L 7 29 L 14 29 M 22 29 L 29 29 L 29 22"
              fill="none" stroke="#f8d26c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `}function Ot(l){if(typeof document>"u")return;const e=!!document.fullscreenElement,t=()=>l?.(!!document.fullscreenElement);try{e&&typeof document.exitFullscreen=="function"?document.exitFullscreen().then(t).catch(t):!e&&typeof document.documentElement.requestFullscreen=="function"?document.documentElement.requestFullscreen().then(t).catch(t):l?.(!e)}catch{l?.(e)}}function Oe(){if(typeof document>"u"||document.getElementById(Le))return;const l=document.createElement("style");l.id=Le,l.textContent=`
    .v5gr-root {
      position: relative;
      width: 100%;
      min-height: 100dvh;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #140906;
      color: #fff5dd;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      overflow-x: hidden;
      overflow-y: auto;
      pointer-events: auto;
      touch-action: pan-y;
      box-sizing: border-box;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .v5gr-root *, .v5gr-root *::before, .v5gr-root *::after {
      box-sizing: border-box;
    }

    /* ---------------- UPPER THEATRICAL STAGE VISTA ---------------- */
    .v5gr-vista {
      position: relative;
      flex: 0 0 auto;
      width: 100%;
      min-height: 332px;
      height: clamp(326px, 43dvh, 390px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      overflow: hidden;
      background: #1a0b07;
    }

    .v5gr-backdrop-img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 42%;
      filter: brightness(0.64) saturate(1.12) contrast(1.06);
      transform: scale(1.02);
      pointer-events: none;
    }

    .v5gr-vista-vignette {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 68% 72% at 50% 42%, rgba(255, 206, 112, 0.16) 0%, rgba(36, 12, 7, 0.44) 62%, rgba(16, 4, 4, 0.88) 100%),
        linear-gradient(180deg, rgba(16, 5, 4, 0.56) 0%, rgba(16, 5, 4, 0.08) 46%, rgba(22, 9, 4, 0.86) 100%);
      pointer-events: none;
    }

    .v5gr-spotlight-cone {
      position: absolute;
      top: -12%;
      left: 50%;
      transform: translateX(-50%);
      width: min(88vw, 540px);
      height: 118%;
      background: conic-gradient(
        from 180deg at 50% 0%,
        rgba(255, 224, 138, 0) 144deg,
        rgba(255, 224, 138, 0.24) 168deg,
        rgba(255, 240, 186, 0.34) 180deg,
        rgba(255, 224, 138, 0.24) 192deg,
        rgba(255, 224, 138, 0) 216deg
      );
      pointer-events: none;
      mix-blend-mode: screen;
    }

    .v5gr-stage-horizon-glow {
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: min(90vw, 560px);
      height: 54px;
      background: radial-gradient(ellipse 50% 80% at 50% 95%, rgba(255, 208, 116, 0.62) 0%, rgba(212, 126, 36, 0.16) 62%, rgba(0, 0, 0, 0) 100%);
      pointer-events: none;
    }

    /* Parted Crimson Velvet Curtains */
    .v5gr-curtain {
      position: absolute;
      top: 0;
      bottom: 0;
      width: clamp(78px, 24vw, 240px);
      z-index: 4;
      pointer-events: none;
    }
    .v5gr-curtain-left { left: 0; }
    .v5gr-curtain-right { right: 0; }
    .v5gr-curtain-svg {
      width: 100%;
      height: 100%;
      display: block;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
    }

    /* Top Corner Sculpted Brass Utility Medallions */
    .v5gr-top-corners {
      position: absolute;
      top: 10px;
      left: 10px;
      right: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 9;
      pointer-events: none;
    }

    .v5gr-corner-pill {
      pointer-events: auto;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 12px 4px 5px;
      border-radius: 999px;
      border: 2px solid #d49c37;
      background: linear-gradient(180deg, #3c1f10 0%, #231008 100%);
      box-shadow:
        0 3px 10px rgba(0, 0, 0, 0.68),
        inset 0 1px 1px rgba(255, 238, 178, 0.55);
      color: #fce3a1;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      min-height: 36px;
      transition: transform 140ms ease, filter 140ms ease, border-color 140ms ease;
    }
    .v5gr-corner-pill-right {
      flex-direction: row-reverse;
      padding: 4px 5px 4px 12px;
    }
    .v5gr-corner-pill:hover, .v5gr-corner-pill:focus-visible {
      transform: translateY(-1px);
      border-color: #ffe38f;
      filter: brightness(1.1);
      outline: none;
    }
    .v5gr-corner-pill:active {
      transform: translateY(1px) scale(0.98);
    }
    .v5gr-corner-coin {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, #6a3d14 0%, #271307 100%);
      border: 2px solid #f0be4d;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      box-shadow: inset 0 1px 2px rgba(255, 240, 184, 0.4);
    }
    .v5gr-corner-coin svg {
      width: 19px;
      height: 19px;
      display: block;
    }
    .v5gr-audio-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2fe09a;
      box-shadow: 0 0 7px rgba(47, 224, 154, 0.85);
    }
    .v5gr-corner-pill.is-muted .v5gr-audio-dot {
      background: #e5584a;
      box-shadow: 0 0 6px rgba(229, 88, 74, 0.6);
    }

    /* Center Crest + Marquee Hero Stack */
    .v5gr-marquee-center {
      position: relative;
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 40px;
      padding: 0 18px;
      max-width: 680px;
      width: 100%;
      pointer-events: none;
    }

    .v5gr-crest-svg {
      width: clamp(80px, 22vw, 118px);
      height: auto;
      display: block;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
      margin-bottom: -4px;
    }

    .v5gr-title-svg {
      width: clamp(238px, 72vw, 412px);
      height: auto;
      display: block;
      overflow: visible;
    }
    .v5gr-svg-title-shadow,
    .v5gr-svg-title-bevel,
    .v5gr-svg-title-face,
    .v5gr-svg-title-bulbs-halo,
    .v5gr-svg-title-bulbs {
      font-family: 'Cinzel', 'Georgia', serif;
      font-weight: 800;
    }
    .v5gr-svg-title-shadow {
      fill: #270e03;
      stroke: #270e03;
      stroke-width: 11;
      stroke-linejoin: round;
    }
    .v5gr-svg-title-bevel {
      fill: none;
      stroke: #7a4609;
      stroke-width: 9;
      stroke-linejoin: round;
    }
    .v5gr-svg-title-face {
      stroke: #fff2b2;
      stroke-width: 1.5;
      stroke-linejoin: round;
    }
    .v5gr-svg-title-bulbs-halo {
      fill: none;
      stroke: rgba(255, 214, 108, 0.75);
      stroke-width: 5.2;
      stroke-dasharray: 0.2 13.5;
      stroke-linecap: round;
    }
    .v5gr-svg-title-bulbs {
      fill: none;
      stroke: #fffef4;
      stroke-width: 2.6;
      stroke-dasharray: 0.2 13.5;
      stroke-linecap: round;
      animation: v5gr-marquee-twinkle 2.4s ease-in-out infinite;
    }
    .v5gr-svg-title-bulbs-alt {
      animation-delay: 1.2s;
    }

    /* Host Max Sterling standing by right crimson curtain */
    .v5gr-host-wrap {
      position: absolute;
      right: clamp(2px, 3vw, 74px);
      bottom: -8px;
      z-index: 6;
      width: clamp(134px, 35vw, 224px);
      pointer-events: none;
      display: flex;
      align-items: flex-end;
      justify-content: flex-end;
    }
    .v5gr-host-img {
      width: 100%;
      height: auto;
      display: block;
      filter: drop-shadow(-4px 6px 14px rgba(0, 0, 0, 0.8));
      animation: v5gr-host-breathe 4.6s ease-in-out infinite;
      transform-origin: bottom center;
    }

    /* Stacked Callout Column (Prevents Brass Phone + Speech Bubble overlap on mobile!) */
    .v5gr-stage-callouts {
      position: absolute;
      left: 10px;
      right: clamp(128px, 34vw, 236px);
      bottom: 12px;
      z-index: 8;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 7px;
      pointer-events: none;
    }

    /* Subtle Warm Theatrical Speech Callout near Max */
    .v5gr-host-callout {
      position: relative;
      width: 100%;
      max-width: 300px;
      padding: 7px 11px 7px 12px;
      background: linear-gradient(180deg, #3c2112 0%, #241209 100%);
      border: 1.5px solid #d59d3a;
      border-radius: 12px 12px 2px 12px;
      box-shadow:
        0 6px 16px rgba(0, 0, 0, 0.72),
        inset 0 1px 0 rgba(255, 238, 178, 0.36);
      color: #ffefd0;
      font-size: 11.5px;
      line-height: 1.3;
      font-weight: 500;
      pointer-events: none;
    }
    .v5gr-host-callout::after {
      content: '';
      position: absolute;
      right: -7px;
      bottom: 10px;
      width: 11px;
      height: 11px;
      background: #28140a;
      border-right: 1.5px solid #d59d3a;
      border-bottom: 1.5px solid #d59d3a;
      transform: rotate(-45deg);
    }
    .v5gr-host-speaker {
      display: block;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.09em;
      color: #f6c758;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    /* Ringing Green-Room Brass Phone Notification Badge (inboxCount > 0) */
    .v5gr-inbox-phone-btn {
      pointer-events: auto;
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 4px 11px 4px 6px;
      border: 2px solid #f4c24f;
      border-radius: 13px;
      background: linear-gradient(180deg, #4b1d12 0%, #280d07 100%);
      box-shadow:
        0 6px 18px rgba(0, 0, 0, 0.78),
        0 0 16px rgba(255, 198, 72, 0.4),
        inset 0 1px 1px rgba(255, 240, 178, 0.5);
      color: #fff3d1;
      cursor: pointer;
      max-width: 100%;
      text-align: left;
      transition: transform 140ms ease, filter 140ms ease;
    }
    .v5gr-inbox-phone-btn:hover, .v5gr-inbox-phone-btn:focus-visible {
      transform: translateY(-2px) scale(1.02);
      filter: brightness(1.1);
      outline: none;
    }
    .v5gr-phone-svg {
      width: 40px;
      height: 34px;
      flex: 0 0 auto;
    }
    .v5gr-phone-handset {
      transform-origin: 44px 20px;
      animation: v5gr-phone-rattle 1.5s ease-in-out infinite;
    }
    .v5gr-ring-wave {
      animation: v5gr-ring-pulse 1.5s ease-in-out infinite;
    }
    .v5gr-inbox-copy {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .v5gr-inbox-kicker {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #ffcf63;
      text-transform: uppercase;
    }
    .v5gr-inbox-text {
      font-size: 11.5px;
      font-weight: 600;
      color: #fff6e0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .v5gr-inbox-count {
      position: absolute;
      top: -7px;
      right: -7px;
      min-width: 21px;
      height: 21px;
      padding: 0 5px;
      border-radius: 999px;
      background: linear-gradient(180deg, #ea3d32 0%, #9b1212 100%);
      border: 2px solid #ffe49c;
      color: #fffef5;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
    }

    /* ---------------- LOWER MAHOGANY & BRASS BACKSTAGE DESK ---------------- */
    .v5gr-desk {
      position: relative;
      z-index: 7;
      flex: 1 1 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background:
        repeating-linear-gradient(
          180deg,
          rgba(255, 198, 130, 0.022) 0px,
          rgba(255, 198, 130, 0.022) 2px,
          rgba(0, 0, 0, 0.032) 2px,
          rgba(0, 0, 0, 0.032) 7px
        ),
        radial-gradient(ellipse 68% 28% at 50% 6%, rgba(255, 198, 118, 0.16) 0%, rgba(0, 0, 0, 0) 75%),
        linear-gradient(
          180deg,
          #663016 0%,
          #7b3b1c 14%,
          #4f220e 29%,
          #2a1107 32%,
          #3e1b0d 35%,
          #2e1309 72%,
          #1c0a04 100%
        );
      border-top: 3px solid #d9a03b;
      box-shadow:
        0 -10px 26px rgba(0, 0, 0, 0.78),
        inset 0 2px 6px rgba(255, 224, 152, 0.34);
    }

    /* Horizontal chamfered brass molding dividing tabletop & front wainscoting */
    .v5gr-desk-lip {
      position: absolute;
      top: 126px;
      left: 0;
      right: 0;
      height: 11px;
      background: linear-gradient(180deg, #fae094 0%, #c88b26 42%, #6d4109 80%, #2a1206 100%);
      box-shadow: 0 5px 14px rgba(0, 0, 0, 0.75);
      pointer-events: none;
      z-index: 1;
    }

    /* Wainscoting ornate brass panel border accents */
    .v5gr-wainscot-ornament {
      position: absolute;
      top: 156px;
      bottom: 66px;
      left: 50%;
      transform: translateX(-50%);
      width: min(92vw, 940px);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      pointer-events: none;
      z-index: 0;
      opacity: 0.42;
    }
    .v5gr-wainscot-panel {
      border: 2px solid #b57b24;
      border-radius: 6px;
      box-shadow:
        inset 0 0 0 4px rgba(32, 12, 5, 0.7),
        inset 0 0 0 5px rgba(235, 185, 86, 0.45);
    }

    /* Desk Interactive Layout Container */
    .v5gr-desk-grid {
      position: relative;
      z-index: 3;
      width: 100%;
      max-width: 1120px;
      margin: 0 auto;
      padding: 6px 10px 6px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-template-areas:
        "trunk dial"
        "stage stage"
        "daily endless";
      align-items: end;
      justify-items: center;
      row-gap: 4px;
      column-gap: 8px;
    }

    /* Base Tactile Desk Prop Button */
    .v5gr-prop-btn {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      background: transparent;
      border: none;
      padding: 2px 4px;
      color: #fff4d8;
      cursor: pointer;
      transition: transform 150ms cubic-bezier(0.22, 1, 0.36, 1), filter 150ms ease;
      -webkit-appearance: none;
      appearance: none;
    }
    .v5gr-prop-btn:hover, .v5gr-prop-btn:focus-visible {
      transform: translateY(-3px) scale(1.03);
      filter: brightness(1.09);
      outline: none;
    }
    .v5gr-prop-btn:active {
      transform: translateY(1px) scale(0.97);
    }

    .v5gr-prop-svg {
      display: block;
      height: auto;
      filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.65));
      transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .v5gr-prop-trunk:hover .v5gr-trunk-polaroids {
      transform: translateY(-4px);
    }
    .v5gr-trunk-polaroids {
      transition: transform 220ms ease;
    }
    .v5gr-prop-dial:hover .v5gr-dial-rotor {
      transform: rotate(22deg);
    }
    .v5gr-dial-rotor {
      transform-origin: 105px 68px;
      transition: transform 340ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .v5gr-prop-daily:hover .v5gr-daily-ticket {
      transform: translate(3px, 4px);
    }
    .v5gr-daily-ticket {
      transition: transform 200ms ease;
    }
    .v5gr-flame-crown {
      transform-origin: 90px 64px;
      animation: v5gr-flame-flicker 2.1s ease-in-out infinite;
    }

    /* Sculpted Mahogany & Brass Nameplates (Zero SaaS boxes!) */
    .v5gr-nameplate {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 14px;
      margin-top: -6px;
      border-radius: 999px;
      border: 2px solid #e4ae42;
      background: linear-gradient(180deg, #3c2010 0%, #1f0e06 100%);
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.72),
        inset 0 1px 1px rgba(255, 240, 182, 0.45);
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(11px, 3vw, 13.5px);
      letter-spacing: 0.06em;
      color: #ffe8a8;
      text-transform: uppercase;
      white-space: nowrap;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
    }
    .v5gr-subplate {
      margin-top: -2px;
      padding: 2px 10px;
      border-radius: 0 0 10px 10px;
      border: 1.5px solid #b88128;
      border-top: none;
      background: linear-gradient(180deg, #271309 0%, #170a04 100%);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.03em;
      color: #f3d28c;
      white-space: nowrap;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.6);
    }

    .v5gr-top-right-group {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }

    .v5gr-fs-btn {
      pointer-events: auto;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 2px solid #d49c37;
      background: linear-gradient(180deg, #3c1f10 0%, #231008 100%);
      box-shadow:
        0 3px 10px rgba(0, 0, 0, 0.68),
        inset 0 1px 1px rgba(255, 238, 178, 0.55);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: transform 140ms ease, filter 140ms ease, border-color 140ms ease;
    }
    .v5gr-fs-btn:hover, .v5gr-fs-btn:focus-visible {
      transform: translateY(-1px);
      border-color: #ffe38f;
      filter: brightness(1.12);
      outline: none;
    }
    .v5gr-fs-btn svg {
      width: 19px;
      height: 19px;
      display: block;
    }

    /* Grid placement on Mobile Portrait (matches mockup_v5_main_menu 1:1 with subtle tactile asymmetry!) */
    .v5gr-prop-trunk {
      grid-area: trunk;
      margin-top: -24px;
      transform: rotate(-1.4deg);
    }
    .v5gr-trunk-svg { width: clamp(134px, 37vw, 178px); }

    .v5gr-prop-dial {
      grid-area: dial;
      margin-top: -12px;
      transform: rotate(1.1deg);
    }
    .v5gr-dial-svg { width: clamp(128px, 35vw, 170px); }

    /* Centerpiece Hero: STEP ON STAGE Emerald & Gold Beveled Marquee Ticket */
    .v5gr-step-ticket {
      grid-area: stage;
      position: relative;
      width: min(86vw, 344px);
      min-height: 102px;
      margin: -4px 0 4px;
      padding: 18px 30px 15px;
      border: none;
      background: transparent;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      filter: drop-shadow(0 0 18px rgba(255, 206, 86, 0.44)) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.82));
      transition: transform 150ms cubic-bezier(0.22, 1, 0.36, 1), filter 160ms ease;
    }
    .v5gr-step-ticket:hover, .v5gr-step-ticket:focus-visible {
      transform: translateY(-3px) scale(1.025);
      filter: drop-shadow(0 0 26px rgba(255, 222, 118, 0.68)) drop-shadow(0 12px 20px rgba(0, 0, 0, 0.85));
      outline: none;
    }
    .v5gr-step-ticket:active {
      transform: translateY(2px) scale(0.985);
    }
    .v5gr-ticket-frame-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .v5gr-step-title {
      position: relative;
      z-index: 2;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(22px, 6.2vw, 29px);
      line-height: 1.04;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: linear-gradient(180deg, #fffbe2 0%, #ffd56c 48%, #d99524 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 2px 2px rgba(4, 24, 16, 0.95));
      text-align: center;
    }
    .v5gr-step-sub {
      position: relative;
      z-index: 2;
      margin-top: 4px;
      padding: 2px 10px;
      border-radius: 999px;
      background: rgba(5, 36, 24, 0.72);
      border: 1px solid rgba(247, 206, 104, 0.56);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: #fff2c6;
      max-width: 92%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Lower-left Daily Show & Lower-right Endless Streak */
    .v5gr-prop-daily {
      grid-area: daily;
    }
    .v5gr-daily-svg { width: clamp(128px, 35vw, 164px); }

    .v5gr-prop-endless {
      grid-area: endless;
    }
    .v5gr-endless-svg { width: clamp(122px, 34vw, 156px); }

    /* ---------------- BOTTOM SCULPTED BRASS CORNER MEDALLIONS ---------------- */
    .v5gr-bottom-rail {
      position: relative;
      z-index: 4;
      width: 100%;
      max-width: 1180px;
      margin: auto auto 0;
      padding: 6px 10px max(10px, env(safe-area-inset-bottom, 10px));
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .v5gr-medallion-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      color: #ffe9ad;
      transition: transform 140ms ease, filter 140ms ease;
    }
    .v5gr-medallion-btn:hover, .v5gr-medallion-btn:focus-visible {
      transform: translateY(-2px) scale(1.03);
      filter: brightness(1.1);
      outline: none;
    }
    .v5gr-medallion-btn:active {
      transform: translateY(1px) scale(0.98);
    }

    .v5gr-medallion-disc {
      position: relative;
      z-index: 2;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background:
        radial-gradient(circle at 36% 30%, #4d2e12 0%, #1c0d06 72%, #120703 100%);
      border: 3.5px solid #ecc054;
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.82),
        inset 0 0 0 3px #6b410a,
        inset 0 2px 4px rgba(255, 240, 184, 0.45);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
    }
    .v5gr-medallion-disc svg {
      width: 34px;
      height: 34px;
      display: block;
    }

    .v5gr-medallion-ribbon {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 40px;
      padding: 5px 14px 5px 22px;
      margin-left: -16px;
      border-radius: 0 999px 999px 0;
      border: 2px solid #dca43b;
      border-left: none;
      background: linear-gradient(180deg, #3c1f10 0%, #1d0c05 100%);
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.72),
        inset 0 1px 1px rgba(255, 236, 174, 0.4);
      text-align: left;
    }
    .v5gr-medallion-btn-right .v5gr-medallion-ribbon {
      margin-left: 0;
      margin-right: -16px;
      padding: 5px 22px 5px 14px;
      border-radius: 999px 0 0 999px;
      border: 2px solid #dca43b;
      border-right: none;
      text-align: right;
    }
    .v5gr-medallion-label {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: 11.5px;
      line-height: 1.12;
      letter-spacing: 0.05em;
      color: #ffeaad;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .v5gr-medallion-meta {
      font-size: 10px;
      font-weight: 600;
      color: #dfb975;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    /* ---------------- DESKTOP PANORAMIC STAGE LAYOUT (>= 820px) ---------------- */
    @media (min-width: 820px) {
      .v5gr-vista {
        min-height: 300px;
        height: clamp(296px, 41dvh, 360px);
      }
      .v5gr-marquee-center {
        margin-top: 12px;
      }
      .v5gr-crest-svg {
        width: 112px;
      }
      .v5gr-title-svg {
        width: 398px;
      }
      .v5gr-host-wrap {
        right: clamp(72px, 11vw, 190px);
        width: 214px;
      }
      .v5gr-stage-callouts {
        left: clamp(68px, 9vw, 170px);
        right: clamp(276px, 28vw, 410px);
        bottom: 22px;
        flex-direction: row;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
      }
      .v5gr-host-callout {
        max-width: 280px;
        margin-left: auto;
        font-size: 12.5px;
      }
      .v5gr-inbox-phone-btn {
        max-width: 274px;
      }
      .v5gr-desk-lip {
        top: 156px;
      }
      .v5gr-desk-grid {
        padding: 8px 28px 4px;
        grid-template-columns: 1fr 1.28fr 1fr;
        grid-template-areas:
          "trunk stage dial"
          "daily stage endless";
        align-items: center;
        row-gap: 8px;
        column-gap: 18px;
      }
      .v5gr-prop-trunk { margin-top: -28px; }
      .v5gr-trunk-svg { width: 174px; }
      .v5gr-prop-dial { margin-top: -16px; }
      .v5gr-dial-svg { width: 168px; }
      .v5gr-daily-svg { width: 156px; }
      .v5gr-endless-svg { width: 146px; }

      .v5gr-step-ticket {
        width: 374px;
        min-height: 128px;
        margin: 0;
        padding: 22px 36px 18px;
      }
      .v5gr-step-title {
        font-size: 31px;
      }
      .v5gr-step-sub {
        font-size: 12px;
        margin-top: 6px;
      }
      .v5gr-medallion-disc {
        width: 64px;
        height: 64px;
      }
      .v5gr-medallion-label {
        font-size: 13px;
      }
      .v5gr-corner-pill {
        font-size: 12px;
        padding: 5px 15px 5px 6px;
      }
      .v5gr-corner-pill-right {
        padding: 5px 6px 5px 15px;
      }
    }

    /* Bespoke Phone Landscape Stage Split (e.g. 844x390) — 100% fits above 390px fold! */
    @media (max-height: 500px) and (min-width: 600px) {
      .v5gr-root {
        flex-direction: row;
        height: 100dvh;
        min-height: 100dvh;
        overflow: hidden;
      }
      .v5gr-vista {
        flex: 0 0 40%;
        width: 40%;
        height: 100%;
        min-height: 0;
        border-right: 3px solid #d9a03b;
      }
      .v5gr-curtain {
        width: 58px;
      }
      .v5gr-top-corners {
        top: 6px;
        left: 6px;
        right: 6px;
      }
      .v5gr-corner-pill {
        min-height: 30px;
        font-size: 9.5px;
        padding: 2px 9px 2px 3px;
        gap: 5px;
      }
      .v5gr-corner-pill-right {
        padding: 2px 3px 2px 9px;
      }
      .v5gr-corner-coin {
        width: 22px;
        height: 22px;
      }
      .v5gr-corner-coin svg {
        width: 14px;
        height: 14px;
      }
      .v5gr-fs-btn {
        width: 30px;
        height: 30px;
      }
      .v5gr-marquee-center {
        margin-top: 34px;
        padding: 0 10px;
      }
      .v5gr-crest-svg { width: 64px; }
      .v5gr-title-svg { width: 218px; }
      .v5gr-host-wrap {
        right: 4px;
        width: 122px;
        bottom: -6px;
      }
      .v5gr-stage-callouts {
        left: 8px;
        right: 118px;
        bottom: 8px;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
      }
      .v5gr-inbox-phone-btn {
        padding: 3px 8px 3px 4px;
        gap: 5px;
      }
      .v5gr-phone-svg { width: 28px; height: 24px; }
      .v5gr-inbox-kicker { font-size: 8px; }
      .v5gr-inbox-text { font-size: 10px; }
      .v5gr-host-callout {
        padding: 5px 8px;
        font-size: 10px;
        max-width: 100%;
        margin-left: 0;
      }
      .v5gr-desk {
        flex: 1 1 60%;
        width: 60%;
        min-width: 0;
        height: 100%;
        border-top: none;
        overflow-y: auto;
        overflow-x: hidden;
        justify-content: space-between;
      }
      .v5gr-desk-lip { display: none; }
      .v5gr-wainscot-ornament { display: none; }
      .v5gr-desk-grid {
        margin: auto 0;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
        padding: 5px 8px 2px;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.22fr) minmax(0, 1fr);
        grid-template-areas:
          "trunk stage dial"
          "daily stage endless";
        align-items: center;
        justify-items: center;
        row-gap: 4px;
        column-gap: 4px;
      }
      .v5gr-prop-btn {
        min-width: 0;
        max-width: 100%;
        box-sizing: border-box;
      }
      .v5gr-prop-trunk, .v5gr-prop-dial { margin-top: 0; }
      .v5gr-trunk-svg { width: min(92px, 100%); }
      .v5gr-dial-svg { width: min(86px, 100%); }
      .v5gr-daily-svg { width: min(86px, 100%); }
      .v5gr-endless-svg { width: min(80px, 100%); }
      .v5gr-nameplate {
        font-size: 9px;
        padding: 2px 7px;
        margin-top: -4px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
      }
      .v5gr-subplate {
        font-size: 8px;
        padding: 1px 5px;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        box-sizing: border-box;
      }
      .v5gr-step-ticket {
        width: 100%;
        min-width: 0;
        max-width: 100%;
        min-height: 90px;
        padding: 10px 8px 8px;
        box-sizing: border-box;
      }
      .v5gr-step-title { font-size: clamp(16px, 2.3vw, 20px); }
      .v5gr-step-sub { font-size: 8.4px; padding: 1px 6px; max-width: 96%; }
      .v5gr-bottom-rail {
        padding: 4px 10px 6px;
        width: 100%;
        max-width: 100%;
        box-sizing: border-box;
      }
      .v5gr-medallion-disc { width: 40px; height: 40px; border-width: 2.5px; }
      .v5gr-medallion-disc svg { width: 22px; height: 22px; }
      .v5gr-medallion-ribbon { min-height: 30px; padding: 3px 9px 3px 16px; }
      .v5gr-medallion-btn-right .v5gr-medallion-ribbon { padding: 3px 16px 3px 9px; }
      .v5gr-medallion-label { font-size: 9.5px; }
      .v5gr-medallion-meta { font-size: 8px; }
    }

    @media (max-height: 500px) and (max-width: 740px) {
      .v5gr-vista { flex: 0 0 38%; width: 38%; }
      .v5gr-desk { flex: 1 1 62%; width: 62%; }
      .v5gr-title-svg { width: 176px; }
      .v5gr-trunk-svg, .v5gr-dial-svg, .v5gr-daily-svg, .v5gr-endless-svg { width: 68px; }
      .v5gr-nameplate { font-size: 8px; padding: 2px 5px; }
      .v5gr-subplate { font-size: 7.5px; padding: 1px 4px; }
      .v5gr-step-ticket { min-height: 78px; padding: 8px 6px; }
      .v5gr-step-title { font-size: 15px; }
    }

    /* Ultra-narrow Mobile (360x640) */
    @media (max-width: 374px) {
      .v5gr-vista {
        min-height: 292px;
        height: 300px;
      }
      .v5gr-corner-pill {
        font-size: 10px;
        padding: 3px 9px 3px 4px;
      }
      .v5gr-corner-pill-right {
        padding: 3px 4px 3px 9px;
      }
      .v5gr-medallion-disc {
        width: 50px;
        height: 50px;
      }
      .v5gr-medallion-label {
        font-size: 10.5px;
      }
    }

    /* Keyframes */
    @keyframes v5gr-marquee-twinkle {
      0%, 100% { opacity: 0.98; }
      50% { opacity: 0.62; }
    }
    @keyframes v5gr-host-breathe {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-3px); }
    }
    @keyframes v5gr-phone-rattle {
      0%, 66%, 100% { transform: rotate(0deg); }
      70% { transform: rotate(-6deg); }
      76% { transform: rotate(6deg); }
      82% { transform: rotate(-5deg); }
      88% { transform: rotate(4deg); }
      94% { transform: rotate(-2deg); }
    }
    @keyframes v5gr-ring-pulse {
      0%, 64%, 100% { opacity: 0.25; }
      78% { opacity: 1; }
    }
    @keyframes v5gr-flame-flicker {
      0%, 100% { transform: scaleY(1) scaleX(1); }
      45% { transform: scaleY(1.06) scaleX(0.97); }
      75% { transform: scaleY(0.97) scaleX(1.03); }
    }
    @media (prefers-reduced-motion: reduce) {
      .v5gr-svg-title-bulbs,
      .v5gr-host-img,
      .v5gr-phone-handset,
      .v5gr-ring-wave,
      .v5gr-flame-crown {
        animation: none !important;
      }
    }
  `,document.head.appendChild(l)}class Dt{container;rootEl=null;currentModel=null;currentCallbacks=null;constructor(e){this.container=e,Oe()}render(e,t){Oe(),this.currentModel=e,this.currentCallbacks=t;const o=oe[e.era]??oe.LOCAL_PUB,i=yt(e),s=vt(e),a=kt(e),r=e.endlessBestStreak>0?`Best Streak: ${e.endlessBestStreak}`:"3 Strikes · Infinite",n=e.trophiesTotalCount??100,c=typeof e.trophiesUnlockedCount=="number"?`${e.trophiesUnlockedCount} / ${n} Earned`:"Hall of Fame",d=e.activeSaveSlotLabel?`Dossier · ${e.activeSaveSlotLabel}`:"Dossier Saves",h=e.inboxHeadline?.trim()||(e.inboxCallerName?`${e.inboxCallerName} is calling backstage!`:"Backstage line is ringing!"),p=document.createElement("section");p.className="v5gr-root",p.setAttribute("aria-label","World's Smartest Backstage Green Room"),p.dataset.greenroomEra=e.era,p.innerHTML=`
      <!-- UPPER THEATRICAL STAGE VISTA -->
      <header class="v5gr-vista">
        <img
          class="v5gr-backdrop-img"
          src="${L(o)}"
          alt=""
          aria-hidden="true"
        />
        <div class="v5gr-vista-vignette" aria-hidden="true"></div>
        <div class="v5gr-spotlight-cone" aria-hidden="true"></div>
        <div class="v5gr-stage-horizon-glow" aria-hidden="true"></div>

        <!-- Parted Crimson Velvet Stage Curtains -->
        <div class="v5gr-curtain v5gr-curtain-left" aria-hidden="true">
          ${wt()}
        </div>
        <div class="v5gr-curtain v5gr-curtain-right" aria-hidden="true">
          ${Ct()}
        </div>

        <!-- Top Corner Sculpted Brass Medallions: DOSSIER SAVES, AUDIO ON/OFF & 1-TAP FULLSCREEN -->
        <div class="v5gr-top-corners">
          <button
            type="button"
            class="v5gr-corner-pill"
            data-v5gr-action="saves"
            aria-label="Open Dossier Saves"
          >
            <span class="v5gr-corner-coin">${Pt()}</span>
            <span>${L(d)}</span>
          </button>

          <div class="v5gr-top-right-group">
            <button
              type="button"
              class="v5gr-corner-pill v5gr-corner-pill-right ${e.audioEnabled?"":"is-muted"}"
              data-v5gr-action="audio"
              aria-pressed="${e.audioEnabled?"true":"false"}"
              aria-label="${e.audioEnabled?"Mute Studio Audio":"Unmute Studio Audio"}"
            >
              <span class="v5gr-corner-coin" data-v5gr-audio-icon>${Ne(e.audioEnabled)}</span>
              <span class="v5gr-audio-dot" aria-hidden="true"></span>
              <span data-v5gr-audio-label>${e.audioEnabled?"Audio On":"Audio Off"}</span>
            </button>

            <button
              type="button"
              class="v5gr-fs-btn"
              data-v5gr-action="fullscreen"
              aria-label="Toggle Fullscreen Stage"
              title="Toggle Fullscreen"
            >
              ${Pe(typeof document<"u"&&!!document.fullscreenElement)}
            </button>
          </div>
        </div>

        <!-- Golden Laurel-Brain Crest & Incandescent Marquee Title -->
        <div class="v5gr-marquee-center">
          ${_t()}
          ${It()}
        </div>

        <!-- Ringing Green-Room Brass Phone + Max Sterling Speech Callout (Zero-Overlap Flex Stack) -->
        <div class="v5gr-stage-callouts">
          ${e.inboxCount>0?`
                <button
                  type="button"
                  class="v5gr-inbox-phone-btn"
                  data-v5gr-action="inbox"
                  aria-label="${L(h)} (${e.inboxCount} backstage call${e.inboxCount===1?"":"s"})"
                >
                  ${Tt()}
                  <span class="v5gr-inbox-copy">
                    <span class="v5gr-inbox-kicker">Backstage Line</span>
                    <span class="v5gr-inbox-text">${L(h)}</span>
                  </span>
                  <span class="v5gr-inbox-count" aria-hidden="true">${e.inboxCount}</span>
                </button>
              `:""}

          <div class="v5gr-host-callout" role="status" aria-live="polite">
            <span class="v5gr-host-speaker">Max Sterling</span>
            <span>${L(s)}</span>
          </div>
        </div>

        <!-- Transparent-Alpha Host Max Sterling Standing by Right Curtain -->
        <div class="v5gr-host-wrap">
          <img
            class="v5gr-host-img"
            src="${L(Ve.maxWelcome)}"
            alt="Host Max Sterling welcoming you backstage"
          />
        </div>
      </header>

      <!-- LOWER TACTILE MAHOGANY & BRASS BACKSTAGE DESK -->
      <main class="v5gr-desk">
        <div class="v5gr-desk-lip" aria-hidden="true"></div>
        <div class="v5gr-wainscot-ornament" aria-hidden="true">
          <div class="v5gr-wainscot-panel"></div>
          <div class="v5gr-wainscot-panel"></div>
        </div>

        <div class="v5gr-desk-grid">
          <!-- LEFT DESK PROP: OPEN COGNAC-LEATHER TOUR TRUNK -->
          <button
            type="button"
            class="v5gr-prop-btn v5gr-prop-trunk"
            data-v5gr-action="trunk"
            aria-label="Open Tour Trunk World Tour Pinboard"
          >
            ${xt()}
            <span class="v5gr-nameplate">Tour Trunk</span>
            ${e.tourProgressLabel?`<span class="v5gr-subplate">${L(e.tourProgressLabel)}</span>`:""}
          </button>

          <!-- CENTERPIECE HERO: STEP ON STAGE MARQUEE TICKET -->
          <button
            type="button"
            class="v5gr-step-ticket"
            data-v5gr-action="stage"
            aria-label="Step On Stage — ${L(i)}"
          >
            ${Rt()}
            <span class="v5gr-step-title">STEP ON<br/>STAGE</span>
            <span class="v5gr-step-sub">${L(i)}</span>
          </button>

          <!-- RIGHT DESK PROP: KNURLED BRASS ROTARY TOPIC DIAL -->
          <button
            type="button"
            class="v5gr-prop-btn v5gr-prop-dial"
            data-v5gr-action="jukebox"
            aria-label="Open Topic Jukebox Dial — 12 Categories and 157 Subcategories"
          >
            ${At()}
            <span class="v5gr-nameplate">Topic Dial</span>
            <span class="v5gr-subplate">12 Categories</span>
          </button>

          <!-- LOWER-LEFT PROP: GLOWING RED VINTAGE DAILY SHOW TICKET DISPENSER -->
          <button
            type="button"
            class="v5gr-prop-btn v5gr-prop-daily"
            data-v5gr-action="daily"
            aria-label="Start Daily Show Broadcast ${L(a)}"
          >
            ${Mt(a,!!e.dailyCompletedToday)}
            <span class="v5gr-nameplate">Daily Show</span>
            <span class="v5gr-subplate">${e.dailyCompletedToday?"Today Cleared":`Broadcast ${L(a)}`}</span>
          </button>

          <!-- LOWER-RIGHT PROP: FLAMING EMERALD-AND-GOLD ENDLESS STREAK MEDALLION -->
          <button
            type="button"
            class="v5gr-prop-btn v5gr-prop-endless"
            data-v5gr-action="endless"
            aria-label="Start Endless Streak — ${L(r)}"
          >
            ${Et()}
            <span class="v5gr-nameplate">Endless Streak</span>
            <span class="v5gr-subplate">${L(r)}</span>
          </button>
        </div>

        <!-- BOTTOM CORNER SCULPTED BRASS MEDALLIONS: STATS RADAR & 100 TROPHIES -->
        <footer class="v5gr-bottom-rail">
          <button
            type="button"
            class="v5gr-medallion-btn"
            data-v5gr-action="stats"
            aria-label="Open Career Stats Radar"
          >
            <span class="v5gr-medallion-disc">${Lt()}</span>
            <span class="v5gr-medallion-ribbon">
              <span class="v5gr-medallion-label">Stats<br/>Radar</span>
              <span class="v5gr-medallion-meta">Domain Profile</span>
            </span>
          </button>

          <button
            type="button"
            class="v5gr-medallion-btn v5gr-medallion-btn-right"
            data-v5gr-action="trophies"
            aria-label="Open 100 Trophies Hall of Fame"
          >
            <span class="v5gr-medallion-ribbon">
              <span class="v5gr-medallion-label">${n}<br/>Trophies</span>
              <span class="v5gr-medallion-meta">${L(c)}</span>
            </span>
            <span class="v5gr-medallion-disc">${Nt()}</span>
          </button>
        </footer>
      </main>
    `,this.bindInteractions(p,t),this.container.replaceChildren(p),this.rootEl=p}updateAudioState(e){if(this.currentModel&&(this.currentModel={...this.currentModel,audioEnabled:e}),!this.rootEl)return;const t=this.rootEl.querySelector('[data-v5gr-action="audio"]');if(!t)return;t.classList.toggle("is-muted",!e),t.setAttribute("aria-pressed",e?"true":"false"),t.setAttribute("aria-label",e?"Mute Studio Audio":"Unmute Studio Audio");const o=t.querySelector("[data-v5gr-audio-icon]");o&&(o.innerHTML=Ne(e));const i=t.querySelector("[data-v5gr-audio-label]");i&&(i.textContent=e?"Audio On":"Audio Off")}updateInboxBadge(e,t){!this.currentModel||!this.currentCallbacks||this.render({...this.currentModel,inboxCount:e,inboxHeadline:t??this.currentModel.inboxHeadline},this.currentCallbacks)}dispose(){this.rootEl&&this.rootEl.parentElement===this.container&&this.rootEl.remove(),this.rootEl=null,this.currentCallbacks=null}bindInteractions(e,t){e.querySelectorAll("[data-v5gr-action]").forEach(i=>{i.addEventListener("pointerenter",()=>{t.onInteractionFeedback?.("hover")}),i.addEventListener("click",()=>{const s=i.dataset.v5grAction;switch(t.onInteractionFeedback?.(s==="inbox"?"ring":"tap"),s){case"stage":t.onStepOnStage();break;case"trunk":t.onOpenTourTrunk();break;case"jukebox":t.onOpenTopicJukebox();break;case"daily":t.onStartDaily();break;case"endless":t.onStartEndless();break;case"stats":t.onOpenStatsRadar();break;case"trophies":t.onOpenTrophies();break;case"saves":t.onOpenSaves();break;case"audio":t.onToggleAudio();break;case"fullscreen":Ot(a=>{i.innerHTML=Pe(a),i.setAttribute("aria-label",a?"Exit Fullscreen Stage":"Toggle Fullscreen Stage"),t.onToggleFullscreen?.(a)});break;case"inbox":t.onOpenInboxCall?t.onOpenInboxCall():t.onStepOnStage();break}})})}}const $={1:{primary:{r:255,g:204,b:112},secondary:{r:238,g:146,b:68},mote:{r:255,g:224,b:152},beamCount:2,baseMotes:18,sweepRate:.22},2:{primary:{r:248,g:199,b:94},secondary:{r:232,g:102,b:142},mote:{r:255,g:222,b:158},beamCount:3,baseMotes:22,sweepRate:.27},3:{primary:{r:86,g:186,b:255},secondary:{r:245,g:200,b:96},mote:{r:226,g:238,b:255},beamCount:3,baseMotes:24,sweepRate:.32},4:{primary:{r:255,g:212,b:102},secondary:{r:92,g:164,b:255},mote:{r:255,g:232,b:170},beamCount:4,baseMotes:28,sweepRate:.36},5:{primary:{r:250,g:216,b:124},secondary:{r:64,g:222,b:164},mote:{r:255,g:236,b:182},beamCount:4,baseMotes:30,sweepRate:.38},6:{primary:{r:78,g:222,b:255},secondary:{r:244,g:112,b:182},mote:{r:232,g:246,b:255},beamCount:5,baseMotes:34,sweepRate:.44},7:{primary:{r:255,g:192,b:82},secondary:{r:82,g:146,b:255},mote:{r:255,g:224,b:154},beamCount:5,baseMotes:36,sweepRate:.46},8:{primary:{r:255,g:224,b:122},secondary:{r:94,g:178,b:255},mote:{r:255,g:244,b:198},beamCount:6,baseMotes:42,sweepRate:.54}},z={calm:{beamAlpha:.052,moteScale:.72,moteAlpha:.38,speedMult:.55,beamLength:.46},board:{beamAlpha:.078,moteScale:1,moteAlpha:.5,speedMult:.9,beamLength:.56},hotseat:{beamAlpha:.098,moteScale:1.15,moteAlpha:.58,speedMult:1.25,beamLength:.64},jackpot:{beamAlpha:.135,moteScale:1.4,moteAlpha:.74,speedMult:1.7,beamLength:.74}},De={GOLD_HISTORY:{core:"#fffbe0",mid:"#f6c44c",deep:"#9e6508",prism:"#ffe38c",spriteKey:"gold"},SAPPHIRE_GEO:{core:"#e3f6ff",mid:"#46a8ff",deep:"#0c4899",prism:"#93d5ff",spriteKey:"sapphire"},EMERALD_SCIENCE:{core:"#e0fff0",mid:"#34d993",deep:"#0a6d45",prism:"#82f5c5",spriteKey:"emerald"},MAGENTA_POP:{core:"#ffe6f0",mid:"#f26498",deep:"#8e1244",prism:"#ffa3c6",spriteKey:"magenta"},ORANGE_SPORTS:{core:"#fff1db",mid:"#ff9347",deep:"#a63c08",prism:"#ffc48a",spriteKey:"orange"},VIOLET_ARTS:{core:"#f3e6ff",mid:"#b47cff",deep:"#531f9e",prism:"#d7b5ff",spriteKey:"violet"}},me=[{base:"#f7c443",light:"#fff6c4",dark:"#a66d0c",weight:.27},{base:"#ffd95e",light:"#fffbe0",dark:"#bd8317",weight:.17},{base:"#1fd689",light:"#9effd3",dark:"#0b7045",weight:.25},{base:"#3399ff",light:"#b3deff",dark:"#0f4aa3",weight:.25},{base:"#ffe7b3",light:"#ffffff",dark:"#c79e54",weight:.04},{base:"#f0527d",light:"#ffc2d4",dark:"#8c173d",weight:.02}],Be=[{base:"#f7c548",light:"#fff8d1",dark:"#9e6508"},{base:"#ffda6b",light:"#ffffff",dark:"#b87d14"},{base:"#f0a629",light:"#ffeba8",dark:"#8a4c05"},{base:"#ffe999",light:"#ffffff",dark:"#b38524"}],Bt=340,Gt=96,Ut=260,Ht=24,Wt=20,Vt=24,Ft=12,$t=6,zt=6,Yt=3,be='"Cinzel", Georgia, "Times New Roman", serif',Kt='"Inter", system-ui, -apple-system, sans-serif';function y(l,e,t){return l<e?e:l>t?t:l}function I(l,e,t){return l+(e-l)*t}function u(l,e){return l+Math.random()*(e-l)}function K(l){const e=1-y(l,0,1);return 1-e*e*e}function V(l){const e=y(l,0,1);return e<.5?4*e*e*e:1-Math.pow(-2*e+2,3)/2}function Ge(l,e=1.70158){const t=y(l,0,1)-1;return 1+(e+1)*t*t*t+e*t*t}function W(l,e){return Number.isFinite(l)?l:e}function jt(l,e){return`rgba(${Math.round(l.r)}, ${Math.round(l.g)}, ${Math.round(l.b)}, ${y(e,0,1).toFixed(4)})`}function ae(l,e,t,o,i,s){const a=t-l,r=o-e,n=Math.hypot(a,r)||1,c=-r/n,d=a/n,h=[];for(let p=0;p<=i;p++){const f=p/i;let m=l+a*f,b=e+r*f;if(p>0&&p<i){const v=Math.sin(f*Math.PI),S=u(-s,s)*v;m+=c*S,b+=d*S}h.push({x:m,y:b})}return h}function Se(){let l=Math.random();for(let e=0;e<me.length;e++){const t=me[e];if(l-=t.weight,l<=0)return t}return me[0]}function qt(l,e,t,o=64){if(typeof document>"u")return null;const i=document.createElement("canvas");i.width=o,i.height=o;const s=i.getContext("2d");if(!s)return null;const a=o*.5,r=s.createRadialGradient(a,a,0,a,a,a);return r.addColorStop(0,l),r.addColorStop(.28,e),r.addColorStop(.65,t),r.addColorStop(1,"rgba(0, 0, 0, 0)"),s.fillStyle=r,s.fillRect(0,0,o,o),i}function Qt(l,e,t=128,o=256){if(typeof document>"u")return null;const i=document.createElement("canvas");i.width=t,i.height=o;const s=i.getContext("2d");if(!s)return null;const a=s.createImageData(t,o),r=a.data,n=t*.5,c=1/n,d=1/Math.max(1,o-1);for(let h=0;h<o;h++){const p=h*d,m=1/I(.11,.96,Math.pow(p,.88)),b=p<.05?p/.05:1,v=Math.pow(1-p,1.5),S=b*v,C=h*t*4;for(let w=0;w<t;w++){const g=(w+.5-n)*c,A=Math.abs(g)*m;if(A>=1)continue;const k=1-A*A,_=k*k*k,E=S*_;if(E<=.001)continue;const O=Math.max(0,1-A*1.65),T=O*O,M=C+w*4;r[M]=Math.round(I(l.r,e.r,T)),r[M+1]=Math.round(I(l.g,e.g,T)),r[M+2]=Math.round(I(l.b,e.b,T)),r[M+3]=y(Math.round(E*255),0,255)}}return s.putImageData(a,0,0),i}function Xt(l,e,t){const o=e*.5,i=t*.5,s=Math.min(o,i);l.beginPath(),l.moveTo(-o+s,-i),l.lineTo(o-s,-i),l.arc(o-s,0,s,-Math.PI*.5,Math.PI*.5),l.lineTo(-o+s,i),l.arc(-o+s,0,s,Math.PI*.5,Math.PI*1.5),l.closePath()}function H(l,e,t,o){const i=Math.min(o,e*.45,t*.48);l.beginPath(),l.moveTo(-e+i,-t),l.lineTo(e-i,-t),l.lineTo(e,-t+i),l.lineTo(e,t-i),l.lineTo(e-i,t),l.lineTo(-e+i,t),l.lineTo(-e,t-i),l.lineTo(-e,-t+i),l.closePath()}function X(l,e,t,o,i){l.beginPath();for(let s=0;s<8;s++){const a=s*Math.PI/4,r=s%2===0?o:i,n=e+Math.cos(a)*r,c=t+Math.sin(a)*r;s===0?l.moveTo(n,c):l.lineTo(n,c)}l.closePath()}class Zt{canvas=null;ctx=null;mounted=!1;width=1280;height=800;dpr=1;rafId=null;lastFrameMs=0;clockSec=0;pageHidden=!1;reducedMotion=!1;reducedMotionQuery=null;tier=1;intensity="board";curPrimary={...$[1].primary};curSecondary={...$[1].secondary};curMote={...$[1].mote};curBeamAlpha=z.board.beamAlpha;curMoteAlpha=z.board.moteAlpha;curSpeedMult=z.board.speedMult;curBeamLength=z.board.beamLength;motes=[];beams=[];arcs=[];debris=[];sparks=[];shockwaves=[];flares=[];screwSpotlights=[];stamps=[];comets=[];jackpots=[];confetti=[];emitters=[];sprites={};beamSprites=new Map;handleResizeBound;handleVisibilityBound;handleMotionChangeBound;tickBound;constructor(){this.handleResizeBound=()=>this.syncViewportSize(),this.handleVisibilityBound=()=>this.onVisibilityChange(),this.handleMotionChangeBound=e=>{this.reducedMotion=e.matches,this.rebalanceAmbientEntities(),this.ensureLoopRunning()},this.tickBound=e=>this.tick(e)}mount(e){if(this.mounted&&this.canvas!==e&&this.dispose(),this.canvas=e,this.enforceOverlayStyles(e),this.ctx=e.getContext("2d",{alpha:!0,desynchronized:!0})??e.getContext("2d"),!this.ctx){this.mounted=!1;return}this.mounted||(this.bindSystemListeners(),this.buildGlowSpriteBank()),this.mounted=!0,this.pageHidden=typeof document<"u"?document.visibilityState==="hidden":!1,this.syncViewportSize(),this.snapMoodToTarget(),this.rebalanceAmbientEntities(),this.lastFrameMs=typeof performance<"u"?performance.now():0,this.ensureLoopRunning()}dispose(){this.rafId!==null&&typeof cancelAnimationFrame=="function"&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.unbindSystemListeners(),this.ctx&&this.canvas&&(this.ctx.setTransform(1,0,0,1,0,0),this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)),this.arcs=[],this.debris=[],this.sparks=[],this.shockwaves=[],this.flares=[],this.screwSpotlights=[],this.stamps=[],this.comets=[],this.jackpots=[],this.confetti=[],this.emitters=[],this.motes=[],this.beams=[],this.sprites={},this.beamSprites.clear(),this.ctx=null,this.canvas=null,this.mounted=!1}getDiagnostics(){return this.refreshReducedMotion(),{mounted:this.mounted,reducedMotion:this.reducedMotion,tier:this.tier,intensity:this.intensity,width:this.width,height:this.height,dpr:this.dpr,activeParticles:this.sparks.length+this.debris.length+this.confetti.length,activeEffects:this.arcs.length+this.shockwaves.length+this.flares.length+this.screwSpotlights.length+this.stamps.length+this.comets.length+this.jackpots.length+this.emitters.length}}setStageMood(e,t){this.refreshReducedMotion();const o=y(Math.round(e),1,8);this.tier=o,this.intensity=t,this.mounted&&(this.rebalanceAmbientEntities(),this.ensureLoopRunning())}fireChainShatter(e,t,o){if(!this.mounted)return;this.refreshReducedMotion();const i=W(e,this.width*.5),s=W(t,this.height*.5),a=o.length>0?o.map(d=>({xPx:W(d.xPx,i),yPx:W(d.yPx,s)})):[{xPx:i,yPx:s}];this.pushFlare({x:i,y:s,age:0,life:.34,maxRadius:this.reducedMotion?56:92,spriteKey:"whiteHot",intensity:.95}),this.pushShockwave({x:i,y:s,delay:0,age:0,life:.36,startR:8,endR:this.reducedMotion?44:68,lineWidth:2.6,color:"rgba(255, 224, 128, 0.9)",style:"flash"});const r=this.reducedMotion?6:16;for(let d=0;d<r;d++){const h=u(0,Math.PI*2),p=this.reducedMotion?u(45,95):u(95,290);this.pushSpark({x:i+u(-6,6),y:s+u(-6,6),prevX:i,prevY:s,vx:Math.cos(h)*p,vy:Math.sin(h)*p-u(40,120),gravity:560,drag:.96,size:u(1.4,2.8),age:0,life:u(.28,.54),mode:"hot_metal",colorHex:"#ffbe3d",coreHex:"#fffef2",twinklePhase:0})}const n=a.length,c=this.reducedMotion?.015:Math.min(.048,.16/Math.max(1,n));for(let d=0;d<n;d++){const h=a[d],p=Math.hypot(h.xPx-i,h.yPx-s);if(p<10){this.triggerChainImpactBurst(h.xPx,h.yPx,n);continue}const m=y(Math.round(p/22),7,18),b=this.reducedMotion?6:y(p*.085,10,26),v=this.reducedMotion?.045:y(.055+p*14e-5,.058,.105);this.pushArc({originX:i,originY:s,targetX:h.xPx,targetY:h.yPx,delay:d*c,elapsed:0,travelDur:v,duration:this.reducedMotion?.28:.42,impactFired:!1,reseedTimer:0,mainBolt:ae(i,s,h.xPx,h.yPx,m,b),branchBolt:ae(i,s,h.xPx,h.yPx,Math.max(5,Math.round(m*.7)),b*1.45)})}this.ensureLoopRunning()}fireScrewSlam(e,t,o){if(!this.mounted)return;this.refreshReducedMotion();const i=y(W(e,this.width*.5),16,Math.max(16,this.width-16)),s=y(W(t,this.height*.5),16,Math.max(16,this.height-16)),a=o?"#ff2c42":"#e61938",r=o?"#ffc247":"#ff7b2e";this.pushScrewSpotlight({targetX:i,targetY:s,byPlayer:o,age:0,life:this.reducedMotion?.85:1.25,primaryHex:a,accentHex:r}),this.pushFlare({x:i,y:s,age:0,life:.42,maxRadius:this.reducedMotion?74:138,spriteKey:"crimson",intensity:1}),this.pushFlare({x:i,y:s,age:0,life:.26,maxRadius:this.reducedMotion?48:84,spriteKey:"amber",intensity:.95}),this.pushShockwave({x:i,y:s,delay:0,age:0,life:.46,startR:12,endR:this.reducedMotion?86:148,lineWidth:4,color:"rgba(255, 210, 96, 0.95)",innerColor:"rgba(255, 250, 224, 0.95)",style:"brass_notched"}),this.pushShockwave({x:i,y:s,delay:.065,age:0,life:.56,startR:16,endR:this.reducedMotion?104:178,lineWidth:3.4,color:o?"rgba(255, 56, 76, 0.9)":"rgba(235, 32, 62, 0.92)",style:"crimson"}),this.reducedMotion||this.pushShockwave({x:i,y:s,delay:.14,age:0,life:.54,startR:14,endR:126,lineWidth:2.2,color:"rgba(255, 192, 74, 0.85)",style:"flash"});const n=this.reducedMotion?10:34;for(let f=0;f<n;f++){const m=u(0,Math.PI*2),b=this.reducedMotion?u(70,150):u(130,420),v=f%3===0;this.pushSpark({x:i+u(-8,8),y:s+u(-8,8),prevX:i,prevY:s,vx:Math.cos(m)*b,vy:Math.sin(m)*b-u(40,130),gravity:540,drag:.955,size:u(1.8,3.6),age:0,life:u(.36,.72),mode:"crimson_amber",colorHex:v?a:r,coreHex:"#fff4d4",twinklePhase:u(0,Math.PI*2)})}const c=Math.min(126,this.width*.34),d=Math.min(76,this.height*.18),h=y(i,c,Math.max(c,this.width-c)),p=y(s-8,d,Math.max(d,this.height-d));this.pushStamp({x:h,y:p,title:"SCREWED!",subtitle:o?"RIVAL LOCKED IN":"RIVAL AMBUSH",byPlayer:o,age:0,life:this.reducedMotion?1.15:1.45,tiltRad:o?-.11:.1}),this.ensureLoopRunning()}fireWedgeCrystal(e,t,o){if(!this.mounted)return;this.refreshReducedMotion();const i=W(e,this.width*.5),s=W(t,this.height*.65),a=De[o]??De.GOLD_HISTORY,r=this.resolveWedgeTargetPoint(),n=(i+r.x)*.5,c=(s+r.y)*.5,d=i<r.x?-1:1,h=y(Math.abs(s-r.y)*.34,48,165),p=y(n+d*h,32,Math.max(32,this.width-32)),f=Math.max(36,c-y(Math.abs(s-r.y)*.18,28,96));this.pushFlare({x:i,y:s,age:0,life:.36,maxRadius:this.reducedMotion?48:82,spriteKey:a.spriteKey,intensity:.95}),this.pushShockwave({x:i,y:s,delay:0,age:0,life:.38,startR:6,endR:this.reducedMotion?42:66,lineWidth:2.5,color:a.prism,style:"jewel"}),this.reducedMotion?this.triggerWedgeArrivalBurst(r.x,r.y,a,!0):this.pushComet({startX:i,startY:s,ctrlX:p,ctrlY:f,destX:r.x,destY:r.y,wedge:o,palette:a,age:0,duration:.78,spin:u(0,Math.PI*2),sparkAccum:0,trail:[{x:i,y:s}],arrived:!1}),this.ensureLoopRunning()}fireLineJackpotSweep(e){if(!this.mounted)return;this.refreshReducedMotion();const t=(e||"").trim();let o="STAGE LINE JACKPOT!",i="+300 PTS";if(t.length>0)if(/jackpot/i.test(t)){const n=t.match(/^(.*?jackpot!?)\s*(.*)$/i);n&&n[2].trim().length>0?(o=n[1].trim().toUpperCase(),i=n[2].trim().toUpperCase()):(o=t.toUpperCase(),i="")}else i=t.toUpperCase();this.pushJackpot({headline:o,pointsText:i,age:0,duration:this.reducedMotion?1.8:2.55});const s=y(this.height*.28,96,260);this.pushFlare({x:this.width*.5,y:s,age:0,life:.65,maxRadius:Math.min(this.width*.45,260),spriteKey:"gold",intensity:.85});const a=this.reducedMotion?18:76;for(let n=0;n<a;n++){const c=Be[n%Be.length],d=u(this.width*.05,this.width*.95),h=u(-140,-10);this.pushConfetti({x:d,y:h,vx:u(-52,52),vy:u(70,210),width:u(7,13),height:u(14,26),angle:u(0,Math.PI*2),vAngle:u(-5.5,5.5),tilt:u(0,Math.PI*2),vTilt:u(5,11),swayPhase:u(0,Math.PI*2),swayFreq:u(2.4,4.8),swayAmp:u(26,68),terminalVy:u(125,225),age:0,life:u(2.2,3.6),baseHex:c.base,lightHex:c.light,darkHex:c.dark,shape:n%3===0?"diamond":"ribbon"})}const r=this.reducedMotion?8:26;for(let n=0;n<r;n++){const c=this.width*.5+u(-Math.min(220,this.width*.38),Math.min(220,this.width*.38)),d=s+u(-36,36);this.pushSpark({x:c,y:d,prevX:c,prevY:d,vx:u(-85,85),vy:u(-110,45),gravity:130,drag:.96,size:u(2.4,5.2),age:0,life:u(.55,1.15),mode:"gold_glint",colorHex:"#ffd863",coreHex:"#ffffff",twinklePhase:u(0,Math.PI*2)})}this.ensureLoopRunning()}fireConfettiOvation(e=3600){if(!this.mounted)return;this.refreshReducedMotion();const o=y(W(e,3600),800,12e3)/1e3;if(this.reducedMotion){for(let r=0;r<26;r++){const n=Se();this.pushConfetti({x:u(this.width*.06,this.width*.94),y:u(-20,this.height*.25),vx:u(-12,12),vy:u(36,68),width:u(7,11),height:u(10,16),angle:u(0,Math.PI*2),vAngle:u(-.8,.8),tilt:u(0,Math.PI*2),vTilt:u(1.2,2.5),swayPhase:u(0,Math.PI*2),swayFreq:u(.9,1.6),swayAmp:u(6,16),terminalVy:u(42,74),age:0,life:Math.min(2.6,o),baseHex:n.base,lightHex:n.light,darkHex:n.dark,shape:r%3===0?"diamond":"foil_rect"})}this.ensureLoopRunning();return}const i=46;for(let a=0;a<2;a++){const r=a===0,n=r?this.width*.06:this.width*.94,c=this.height*.96;for(let d=0;d<i;d++){const h=Se(),p=r?u(-Math.PI*.44,-Math.PI*.2):u(-Math.PI*.8,-Math.PI*.56),f=u(420,Math.min(920,this.height*1.15));this.pushConfetti({x:n+u(-12,12),y:c+u(-12,12),vx:Math.cos(p)*f,vy:Math.sin(p)*f,width:u(7,13),height:u(11,22),angle:u(0,Math.PI*2),vAngle:u(-7.5,7.5),tilt:u(0,Math.PI*2),vTilt:u(5.5,12.5),swayPhase:u(0,Math.PI*2),swayFreq:u(2.2,4.8),swayAmp:u(28,76),terminalVy:u(115,215),age:0,life:u(2.8,4.6),baseHex:h.base,lightHex:h.light,darkHex:h.dark,shape:d%4===0?"diamond":d%2===0?"ribbon":"foil_rect"})}}const s=this.width<520?34:52;this.emitters.push({remainingSec:Math.max(.4,o-.55),spawnAccum:0,ratePerSec:s}),this.emitters.length>4&&this.emitters.splice(0,this.emitters.length-4),this.ensureLoopRunning()}enforceOverlayStyles(e){e.style.position="fixed",e.style.inset="0",e.style.width="100%",e.style.height="100%",e.style.zIndex="65",e.style.pointerEvents="none",e.style.display="block",e.style.background="transparent",e.style.touchAction="none",e.style.userSelect="none",e.setAttribute("aria-hidden","true")}bindSystemListeners(){typeof window<"u"&&(window.addEventListener("resize",this.handleResizeBound,{passive:!0}),window.visualViewport?.addEventListener("resize",this.handleResizeBound,{passive:!0}),typeof window.matchMedia=="function"&&(this.reducedMotionQuery=window.matchMedia("(prefers-reduced-motion: reduce)"),this.reducedMotion=this.reducedMotionQuery.matches,typeof this.reducedMotionQuery.addEventListener=="function"&&this.reducedMotionQuery.addEventListener("change",this.handleMotionChangeBound))),typeof document<"u"&&document.addEventListener("visibilitychange",this.handleVisibilityBound)}unbindSystemListeners(){typeof window<"u"&&(window.removeEventListener("resize",this.handleResizeBound),window.visualViewport?.removeEventListener("resize",this.handleResizeBound)),this.reducedMotionQuery&&typeof this.reducedMotionQuery.removeEventListener=="function"&&this.reducedMotionQuery.removeEventListener("change",this.handleMotionChangeBound),this.reducedMotionQuery=null,typeof document<"u"&&document.removeEventListener("visibilitychange",this.handleVisibilityBound)}onVisibilityChange(){typeof document>"u"||(this.pageHidden=document.visibilityState==="hidden",!this.pageHidden&&this.mounted&&(this.lastFrameMs=typeof performance<"u"?performance.now():0,this.ensureLoopRunning()))}refreshReducedMotion(){if(typeof window>"u"||typeof window.matchMedia!="function")return;const e=this.reducedMotionQuery?this.reducedMotionQuery.matches:window.matchMedia("(prefers-reduced-motion: reduce)").matches;e!==this.reducedMotion&&(this.reducedMotion=e,this.mounted&&this.rebalanceAmbientEntities())}getVolumetricBeamSprite(e,t,o){const i=this.beamSprites.get(e);if(i)return i;const s=Qt(t,o,128,256);return s&&this.beamSprites.set(e,s),s}syncViewportSize(){if(!this.canvas||typeof window>"u")return;const e=Math.max(1,Math.round(window.innerWidth||this.canvas.clientWidth||1280)),t=Math.max(1,Math.round(window.innerHeight||this.canvas.clientHeight||800)),o=Math.min(window.devicePixelRatio||1,2);this.width=e,this.height=t,this.dpr=o;const i=Math.max(1,Math.round(e*o)),s=Math.max(1,Math.round(t*o));(this.canvas.width!==i||this.canvas.height!==s)&&(this.canvas.width=i,this.canvas.height=s),this.ctx&&this.ctx.setTransform(o,0,0,o,0,0);for(let a=0;a<this.motes.length;a++){const r=this.motes[a];r.x>e+20&&(r.x=u(0,e)),r.y>t+20&&(r.y=u(0,t))}}buildGlowSpriteBank(){const e=[["whiteHot","rgba(255,255,250,1)","rgba(255,236,176,0.7)","rgba(255,190,72,0.18)"],["gold","rgba(255,246,204,0.95)","rgba(247,197,72,0.6)","rgba(218,142,24,0.14)"],["amber","rgba(255,232,175,0.95)","rgba(255,156,42,0.62)","rgba(210,82,16,0.15)"],["crimson","rgba(255,214,218,0.92)","rgba(255,46,74,0.62)","rgba(180,14,40,0.14)"],["emerald","rgba(222,255,240,0.95)","rgba(52,217,147,0.62)","rgba(12,135,84,0.14)"],["sapphire","rgba(224,244,255,0.95)","rgba(70,168,255,0.62)","rgba(18,86,196,0.14)"],["magenta","rgba(255,224,238,0.95)","rgba(242,100,152,0.62)","rgba(156,22,78,0.14)"],["orange","rgba(255,238,214,0.95)","rgba(255,147,71,0.62)","rgba(184,64,12,0.14)"],["violet","rgba(242,226,255,0.95)","rgba(180,124,255,0.62)","rgba(96,38,186,0.14)"],["dustMote","rgba(255,248,216,0.95)","rgba(255,222,138,0.42)","rgba(245,196,81,0.08)"]];for(let t=0;t<e.length;t++){const[o,i,s,a]=e[t],r=qt(i,s,a,64);r&&(this.sprites[o]=r)}}snapMoodToTarget(){const e=$[this.tier],t=z[this.intensity];this.curPrimary={...e.primary},this.curSecondary={...e.secondary},this.curMote={...e.mote},this.curBeamAlpha=t.beamAlpha,this.curMoteAlpha=t.moteAlpha,this.curSpeedMult=t.speedMult,this.curBeamLength=t.beamLength}rebalanceAmbientEntities(){const e=$[this.tier],t=z[this.intensity],o=this.reducedMotion?Math.min(2,e.beamCount):e.beamCount,i=[];for(let r=0;r<o;r++){const n=o===1?.5:r/(o-1),c=I(.08,.92,n),d=(.5-c)*.56;i.push({anchorNormX:c,baseAngle:Math.PI*.5+d,swayAmp:this.reducedMotion?0:u(.09,.17),swaySpeed:e.sweepRate*u(.72,1.28),phase:r*1.47+u(0,.7),widthScale:u(.85,1.18),isSecondary:r%2===1})}this.beams=i;const s=this.width<560?.72:1,a=this.reducedMotion?6:y(Math.round(e.baseMotes*t.moteScale*s),12,56);for(;this.motes.length<a;)this.motes.push(this.createDustMote(!0));this.motes.length>a&&(this.motes.length=a)}createDustMote(e){const t=this.height*.86;return{x:u(0,this.width),y:e?u(0,t):u(t*.72,this.height+12),vx:u(-10,10),vy:u(-18,-5),radius:u(1.2,3.1),alpha:u(.24,.78),twinklePhase:u(0,Math.PI*2),twinkleSpeed:u(1.1,2.8),warmth:Math.random()<.7?1:0}}resolveWedgeTargetPoint(){const e={x:this.width*.5,y:y(this.height*.22,74,195)};if(typeof document>"u")return e;try{const t=document.querySelector("[data-vfx-wedge-target], .v5-wedge-medallion, .v5-stage-medallion, .ws4-crown-ring");if(t){const o=t.getBoundingClientRect();if(o.width>12&&o.height>12&&o.top>=-10&&o.top<this.height*.55)return{x:y(o.left+o.width*.5,24,Math.max(24,this.width-24)),y:y(o.top+o.height*.5,24,Math.max(24,this.height*.55))}}}catch{}return e}pushArc(e){this.arcs.length>=Ht&&this.arcs.shift(),this.arcs.push(e)}pushDebris(e){this.debris.length>=Gt&&this.debris.shift(),this.debris.push(e)}pushSpark(e){this.sparks.length>=Bt&&this.sparks.shift(),this.sparks.push(e)}pushShockwave(e){this.shockwaves.length>=Wt&&this.shockwaves.shift(),this.shockwaves.push(e)}pushFlare(e){this.flares.length>=Vt&&this.flares.shift(),this.flares.push(e)}pushScrewSpotlight(e){this.screwSpotlights.length>=zt&&this.screwSpotlights.shift(),this.screwSpotlights.push(e)}pushStamp(e){this.stamps.length>=$t&&this.stamps.shift(),this.stamps.push(e)}pushComet(e){this.comets.length>=Ft&&this.comets.shift(),this.comets.push(e)}pushJackpot(e){this.jackpots.length>=Yt&&this.jackpots.shift(),this.jackpots.push(e)}pushConfetti(e){this.confetti.length>=Ut&&this.confetti.shift(),this.confetti.push(e)}triggerChainImpactBurst(e,t,o){const i=o>3?.65:o>1?.85:1;if(this.pushFlare({x:e,y:t,age:0,life:.36,maxRadius:this.reducedMotion?52:96,spriteKey:"whiteHot",intensity:1}),this.pushFlare({x:e,y:t,age:0,life:.48,maxRadius:this.reducedMotion?64:118,spriteKey:"amber",intensity:.82}),this.pushShockwave({x:e,y:t,delay:0,age:0,life:.38,startR:8,endR:this.reducedMotion?52:84,lineWidth:3,color:"rgba(255, 214, 92, 0.95)",innerColor:"rgba(255, 252, 232, 0.92)",style:"flash"}),this.reducedMotion){for(let n=0;n<8;n++){const c=n/8*Math.PI*2+u(-.15,.15);this.pushSpark({x:e,y:t,prevX:e,prevY:t,vx:Math.cos(c)*u(45,95),vy:Math.sin(c)*u(45,95),gravity:80,drag:.92,size:u(2,3),age:0,life:.38,mode:"hot_metal",colorHex:"#ffd257",coreHex:"#fffbe6",twinklePhase:0})}return}const s=Math.random()<.5?-1:1;this.pushDebris({kind:"shackle",x:e+u(-6,6),y:t-10,vx:s*u(80,190),vy:u(-390,-250),angle:u(-.4,.4),vAngle:s*u(9,16),tumble:u(0,Math.PI),vTumble:u(5,10),scale:u(.95,1.15),age:0,life:u(.95,1.28),isHotFracture:!0}),this.pushDebris({kind:"padlock_left",x:e-6,y:t+2,vx:u(-230,-110),vy:u(-300,-160),angle:u(-.3,.2),vAngle:u(-13,-6.5),tumble:u(0,Math.PI*.4),vTumble:u(4,8),scale:u(.92,1.12),age:0,life:u(.92,1.24),isHotFracture:!0}),this.pushDebris({kind:"padlock_right",x:e+6,y:t+2,vx:u(110,230),vy:u(-300,-160),angle:u(-.2,.3),vAngle:u(6.5,13),tumble:u(0,Math.PI*.4),vTumble:u(4,8),scale:u(.92,1.12),age:0,life:u(.92,1.24),isHotFracture:!0});const a=Math.max(6,Math.round(10*i));for(let n=0;n<a;n++){const c=n%4*Math.PI/2+Math.PI*.25+u(-.42,.42),d=u(155,390);this.pushDebris({kind:"chain_link",x:e+Math.cos(c)*u(6,22),y:t+Math.sin(c)*u(6,22),vx:Math.cos(c)*d,vy:Math.sin(c)*d-u(120,250),angle:c,vAngle:u(-15,15),tumble:u(0,Math.PI*2),vTumble:u(6,14),scale:u(.82,1.18),age:0,life:u(.84,1.24),isHotFracture:n<4})}const r=Math.max(18,Math.round(36*i));for(let n=0;n<r;n++){const c=u(0,Math.PI*2),d=u(110,470);this.pushSpark({x:e+u(-10,10),y:t+u(-10,10),prevX:e,prevY:t,vx:Math.cos(c)*d,vy:Math.sin(c)*d-u(70,210),gravity:u(620,860),drag:u(.955,.98),size:u(1.4,3.1),age:0,life:u(.32,.78),mode:"hot_metal",colorHex:"#ffaa2b",coreHex:"#fffef2",twinklePhase:u(0,Math.PI*2)})}}triggerWedgeArrivalBurst(e,t,o,i){this.pushFlare({x:e,y:t,age:0,life:.56,maxRadius:i?72:126,spriteKey:o.spriteKey,intensity:1}),this.pushFlare({x:e,y:t,age:0,life:.34,maxRadius:i?42:76,spriteKey:"whiteHot",intensity:.95}),this.pushShockwave({x:e,y:t,delay:0,age:0,life:.48,startR:10,endR:i?64:112,lineWidth:3.2,color:o.prism,innerColor:o.core,style:"jewel"}),this.pushShockwave({x:e,y:t,delay:.08,age:0,life:.52,startR:12,endR:i?52:88,lineWidth:2.2,color:"rgba(255, 224, 118, 0.88)",style:"flash"});const s=i?10:30;for(let a=0;a<s;a++){const r=a/s*Math.PI*2+u(-.2,.2),n=i?u(40,110):u(95,310);this.pushSpark({x:e,y:t,prevX:e,prevY:t,vx:Math.cos(r)*n,vy:Math.sin(r)*n-(i?15:40),gravity:i?80:210,drag:.95,size:u(2.4,5.4),age:0,life:u(.45,.92),mode:"prism_star",colorHex:a%3===0?"#ffe58f":o.prism,coreHex:o.core,twinklePhase:u(0,Math.PI*2)})}}hasActiveDynamicEffects(){return this.arcs.length>0||this.debris.length>0||this.sparks.length>0||this.shockwaves.length>0||this.flares.length>0||this.screwSpotlights.length>0||this.stamps.length>0||this.comets.length>0||this.jackpots.length>0||this.confetti.length>0||this.emitters.length>0}ensureLoopRunning(){!this.mounted||this.pageHidden||this.rafId===null&&typeof requestAnimationFrame=="function"&&(this.lastFrameMs=typeof performance<"u"?performance.now():0,this.rafId=requestAnimationFrame(this.tickBound))}tick(e){if(this.rafId=null,!this.mounted||!this.ctx||!this.canvas||this.pageHidden)return;const t=this.lastFrameMs>0?(e-this.lastFrameMs)/1e3:1/60;this.lastFrameMs=e;const o=y(t,.001,.05);this.clockSec+=o,this.update(o),this.render(this.ctx),!(this.reducedMotion&&!this.hasActiveDynamicEffects())&&(this.rafId=requestAnimationFrame(this.tickBound))}update(e){const t=$[this.tier],o=z[this.intensity],i=1-Math.exp(-e*3.4);if(this.curPrimary={r:I(this.curPrimary.r,t.primary.r,i),g:I(this.curPrimary.g,t.primary.g,i),b:I(this.curPrimary.b,t.primary.b,i)},this.curSecondary={r:I(this.curSecondary.r,t.secondary.r,i),g:I(this.curSecondary.g,t.secondary.g,i),b:I(this.curSecondary.b,t.secondary.b,i)},this.curMote={r:I(this.curMote.r,t.mote.r,i),g:I(this.curMote.g,t.mote.g,i),b:I(this.curMote.b,t.mote.b,i)},this.curBeamAlpha=I(this.curBeamAlpha,o.beamAlpha,i),this.curMoteAlpha=I(this.curMoteAlpha,o.moteAlpha,i),this.curSpeedMult=I(this.curSpeedMult,o.speedMult,i),this.curBeamLength=I(this.curBeamLength,o.beamLength,i),!this.reducedMotion){const a=.55+this.curSpeedMult*.45;for(let r=0;r<this.motes.length;r++){const n=this.motes[r];n.twinklePhase+=e*n.twinkleSpeed*a,n.x+=(n.vx+Math.sin(this.clockSec*.6+n.twinklePhase)*6)*e*a,n.y+=n.vy*e*a,n.y<-14?(n.y=this.height*.88+u(0,30),n.x=u(0,this.width)):n.x<-16?n.x=this.width+12:n.x>this.width+16&&(n.x=-12)}}for(let a=this.arcs.length-1;a>=0;a--){const r=this.arcs[a];if(r.delay>0){r.delay-=e;continue}if(r.elapsed+=e,!r.impactFired&&r.elapsed>=r.travelDur&&(r.impactFired=!0,this.triggerChainImpactBurst(r.targetX,r.targetY,Math.max(1,this.arcs.length))),!this.reducedMotion&&(r.reseedTimer+=e,r.reseedTimer>=.045)){r.reseedTimer=0;const n=Math.hypot(r.targetX-r.originX,r.targetY-r.originY),c=y(Math.round(n/22),7,18),d=y(n*.085,10,26);r.mainBolt=ae(r.originX,r.originY,r.targetX,r.targetY,c,d),r.branchBolt=ae(r.originX,r.originY,r.targetX,r.targetY,Math.max(5,Math.round(c*.7)),d*1.45)}r.elapsed>=r.duration&&this.arcs.splice(a,1)}const s=980;for(let a=this.debris.length-1;a>=0;a--){const r=this.debris[a];if(r.age+=e,r.age>=r.life||r.y>this.height+90){this.debris.splice(a,1);continue}const n=Math.pow(.985,e*60);r.vx*=n,r.vy=r.vy*n+s*e,r.x+=r.vx*e,r.y+=r.vy*e,r.angle+=r.vAngle*e,r.tumble+=r.vTumble*e}for(let a=this.sparks.length-1;a>=0;a--){const r=this.sparks[a];if(r.age+=e,r.age>=r.life){this.sparks.splice(a,1);continue}r.prevX=r.x,r.prevY=r.y;const n=Math.pow(r.drag,e*60);r.vx*=n,r.vy=r.vy*n+r.gravity*e,r.x+=r.vx*e,r.y+=r.vy*e,r.twinklePhase+=e*14}for(let a=this.shockwaves.length-1;a>=0;a--){const r=this.shockwaves[a];if(r.delay>0){r.delay-=e;continue}r.age+=e,r.age>=r.life&&this.shockwaves.splice(a,1)}for(let a=this.flares.length-1;a>=0;a--){const r=this.flares[a];r.age+=e,r.age>=r.life&&this.flares.splice(a,1)}for(let a=this.screwSpotlights.length-1;a>=0;a--){const r=this.screwSpotlights[a];r.age+=e,r.age>=r.life&&this.screwSpotlights.splice(a,1)}for(let a=this.stamps.length-1;a>=0;a--){const r=this.stamps[a];r.age+=e,r.age>=r.life&&this.stamps.splice(a,1)}for(let a=this.comets.length-1;a>=0;a--){const r=this.comets[a];r.age+=e,r.spin+=e*9.5;const n=V(r.age/r.duration),c=1-n,d=c*c*r.startX+2*c*n*r.ctrlX+n*n*r.destX,h=c*c*r.startY+2*c*n*r.ctrlY+n*n*r.destY;for(r.trail.push({x:d,y:h}),r.trail.length>26&&r.trail.shift(),r.sparkAccum+=e*62;r.sparkAccum>=1;)r.sparkAccum-=1,this.pushSpark({x:d+u(-7,7),y:h+u(-7,7),prevX:d,prevY:h,vx:u(-48,48),vy:u(-36,52),gravity:115,drag:.94,size:u(2,4.6),age:0,life:u(.32,.65),mode:"prism_star",colorHex:Math.random()<.35?"#fff1b5":r.palette.prism,coreHex:r.palette.core,twinklePhase:u(0,Math.PI*2)});r.age>=r.duration&&(r.arrived||(r.arrived=!0,this.triggerWedgeArrivalBurst(r.destX,r.destY,r.palette,!1)),this.comets.splice(a,1))}for(let a=this.jackpots.length-1;a>=0;a--){const r=this.jackpots[a];r.age+=e,r.age>=r.duration&&this.jackpots.splice(a,1)}for(let a=this.emitters.length-1;a>=0;a--){const r=this.emitters[a];for(r.remainingSec-=e,r.spawnAccum+=r.ratePerSec*e;r.spawnAccum>=1;){r.spawnAccum-=1;const n=Se();this.pushConfetti({x:u(this.width*.03,this.width*.97),y:u(-26,-6),vx:u(-44,44),vy:u(50,155),width:u(7,13),height:u(11,21),angle:u(0,Math.PI*2),vAngle:u(-6,6),tilt:u(0,Math.PI*2),vTilt:u(4.5,11.5),swayPhase:u(0,Math.PI*2),swayFreq:u(2,4.6),swayAmp:u(24,68),terminalVy:u(110,210),age:0,life:u(3.1,4.8),baseHex:n.base,lightHex:n.light,darkHex:n.dark,shape:Math.random()<.25?"diamond":Math.random()<.55?"ribbon":"foil_rect"})}r.remainingSec<=0&&this.emitters.splice(a,1)}for(let a=this.confetti.length-1;a>=0;a--){const r=this.confetti[a];if(r.age+=e,r.age>=r.life||r.y>this.height+50){this.confetti.splice(a,1);continue}r.swayPhase+=r.swayFreq*e;const n=Math.pow(.965,e*60);r.vx*=n,r.vy<r.terminalVy?r.vy=Math.min(r.terminalVy,r.vy+640*e):r.vy=I(r.vy,r.terminalVy,1-Math.exp(-e*2.5));const c=Math.sin(r.swayPhase)*r.swayAmp;r.x+=(r.vx+c)*e,r.y+=r.vy*e,r.angle+=r.vAngle*e,r.tilt+=r.vTilt*e}}render(e){e.setTransform(this.dpr,0,0,this.dpr,0,0),e.clearRect(0,0,this.width,this.height),this.renderAmbientSpotlights(e),this.renderDustMotes(e),this.jackpots.length>0&&this.renderJackpotSearchlights(e),this.screwSpotlights.length>0&&this.renderScrewSpotlights(e),this.flares.length>0&&this.renderFlares(e),this.shockwaves.length>0&&this.renderShockwaves(e),this.arcs.length>0&&this.renderChainArcs(e),this.comets.length>0&&this.renderWedgeComets(e),this.debris.length>0&&this.renderMetallicDebris(e),this.confetti.length>0&&this.renderFoilConfetti(e),this.sparks.length>0&&this.renderSparks(e),this.stamps.length>0&&this.renderKineticStamps(e),this.jackpots.length>0&&this.renderJackpotMarquees(e)}renderAmbientSpotlights(e){if(this.beams.length===0||this.curBeamAlpha<=.002)return;const t=$[this.tier],o=this.getVolumetricBeamSprite(`tier_${this.tier}_pri`,t.primary,{r:Math.min(255,t.primary.r+36),g:Math.min(255,t.primary.g+36),b:Math.min(255,t.primary.b+36)}),i=this.getVolumetricBeamSprite(`tier_${this.tier}_sec`,t.secondary,{r:Math.min(255,t.secondary.r+36),g:Math.min(255,t.secondary.g+36),b:Math.min(255,t.secondary.b+36)});e.save(),e.globalCompositeOperation="lighter";const s=this.height*this.curBeamLength,a=y(this.width*.34,130,380);for(let r=0;r<this.beams.length;r++){const n=this.beams[r],c=n.anchorNormX*this.width,d=-24,h=this.reducedMotion?0:Math.sin(this.clockSec*n.swaySpeed*this.curSpeedMult+n.phase)*n.swayAmp,p=n.baseAngle+h,f=y(this.curBeamAlpha*(n.isSecondary?1.55:1.85),0,.32),m=n.isSecondary?i:o;if(m){const b=a*n.widthScale;e.save(),e.translate(c,d),e.rotate(p-Math.PI*.5),e.globalAlpha=f,e.drawImage(m,-b*.5,0,b,s),e.restore()}}e.restore()}renderDustMotes(e){if(this.motes.length===0)return;const t=this.sprites.dustMote;e.save(),e.globalCompositeOperation="lighter";for(let o=0;o<this.motes.length;o++){const i=this.motes[o],s=this.reducedMotion?.8:.45+.55*Math.sin(i.twinklePhase),a=y(1-(i.y-this.height*.65)/(this.height*.35),.15,1),r=i.alpha*s*this.curMoteAlpha*a;if(!(r<=.015))if(t&&i.warmth>.5){const n=i.radius*3.4;e.globalAlpha=y(r,0,1),e.drawImage(t,i.x-n,i.y-n,n*2,n*2)}else e.globalAlpha=1,e.fillStyle=jt(this.curMote,r),e.beginPath(),e.arc(i.x,i.y,i.radius,0,Math.PI*2),e.fill()}e.restore()}renderJackpotSearchlights(e){const t=this.getVolumetricBeamSprite("jackpot_gold_beam",{r:255,g:204,b:74},{r:255,g:250,b:214});if(t){e.save(),e.globalCompositeOperation="lighter";for(let o=0;o<this.jackpots.length;o++){const i=this.jackpots[o],s=y(i.age/i.duration,0,1),a=s<.12?K(s/.12):s>.78?1-V((s-.78)/.22):1,r=Math.hypot(this.width,this.height)*1.18,n=y(this.width*.36,150,390),c=this.reducedMotion?0:Math.sin(i.age*3.4),d=[{x:this.width*.08,y:this.height+28,angle:-Math.PI*.33+c*.28},{x:this.width*.92,y:this.height+28,angle:-Math.PI*.67-c*.28}];for(let h=0;h<d.length;h++){const p=d[h];e.save(),e.translate(p.x,p.y),e.rotate(p.angle-Math.PI*.5),e.globalAlpha=y(.42*a,0,.55),e.drawImage(t,-n*.5,0,n,r),e.restore()}}e.restore()}}renderScrewSpotlights(e){const t=this.getVolumetricBeamSprite("screw_crimson_beam",{r:255,g:46,b:68},{r:255,g:196,b:92});e.save(),e.globalCompositeOperation="lighter";for(let o=0;o<this.screwSpotlights.length;o++){const i=this.screwSpotlights[o],s=y(i.age/i.life,0,1),a=K(Math.min(1,i.age/.11)),r=s<.52?1:1-V((s-.52)/.48),n=I(i.targetX,this.width*.5,.22),c=-32,d=i.targetX-n,h=i.targetY-c,p=Math.hypot(d,h)||1,f=Math.atan2(h,d),m=p*(.2+.98*a),b=y(this.width*.32,118,220)*(.85+.15*a);if(t&&(e.save(),e.translate(n,c),e.rotate(f-Math.PI*.5),e.globalAlpha=y(.62*r,0,.72),e.drawImage(t,-b*.5,0,b,m),e.restore()),a>.6){const v=r*((a-.6)/.4),S=b*.48,C=S*.56;e.save(),e.translate(i.targetX,i.targetY),e.scale(1,C/S);const w=e.createRadialGradient(0,0,0,0,0,S);w.addColorStop(0,`rgba(255, 224, 134, ${(.44*v).toFixed(4)})`),w.addColorStop(.5,`rgba(255, 48, 68, ${(.28*v).toFixed(4)})`),w.addColorStop(1,"rgba(255, 48, 68, 0)"),e.fillStyle=w,e.beginPath(),e.arc(0,0,S,0,Math.PI*2),e.fill(),e.restore()}}e.restore()}renderFlares(e){e.save(),e.globalCompositeOperation="lighter";for(let t=0;t<this.flares.length;t++){const o=this.flares[t],i=y(o.age/o.life,0,1),s=K(Math.min(1,i*3.2)),a=1-V(i),r=o.maxRadius*(.25+.75*s),n=this.sprites[o.spriteKey]??this.sprites.gold;n?(e.globalAlpha=y(a*o.intensity,0,1),e.drawImage(n,o.x-r,o.y-r,r*2,r*2)):(e.globalAlpha=y(a*o.intensity*.65,0,1),e.fillStyle="#ffe28a",e.beginPath(),e.arc(o.x,o.y,r*.5,0,Math.PI*2),e.fill())}e.restore()}renderShockwaves(e){e.save();for(let t=0;t<this.shockwaves.length;t++){const o=this.shockwaves[t];if(o.delay>0)continue;const i=y(o.age/o.life,0,1),s=K(i),a=I(o.startR,o.endR,s),r=1-i*i,n=Math.max(.8,o.lineWidth*(1-i*.65));if(e.globalCompositeOperation=o.style==="brass_notched"?"source-over":"lighter",e.globalAlpha=y(r,0,1),o.style==="brass_notched"){e.strokeStyle=o.color,e.lineWidth=n+1.2,e.beginPath(),e.arc(o.x,o.y,a,0,Math.PI*2),e.stroke(),e.strokeStyle=o.innerColor??"#fff5d1",e.lineWidth=Math.max(1,n*.45),e.beginPath(),e.arc(o.x,o.y,Math.max(2,a-4),0,Math.PI*2),e.stroke();const c=12,d=i*.45;e.strokeStyle="#ffd970",e.lineWidth=Math.max(1.1,n*.55),e.beginPath();for(let h=0;h<c;h++){const p=h/c*Math.PI*2+d,f=Math.max(2,a-7),m=a+5;e.moveTo(o.x+Math.cos(p)*f,o.y+Math.sin(p)*f),e.lineTo(o.x+Math.cos(p)*m,o.y+Math.sin(p)*m)}e.stroke()}else e.strokeStyle=o.color,e.lineWidth=n,e.beginPath(),e.arc(o.x,o.y,a,0,Math.PI*2),e.stroke(),o.innerColor&&(e.strokeStyle=o.innerColor,e.lineWidth=Math.max(.8,n*.42),e.beginPath(),e.arc(o.x,o.y,a,0,Math.PI*2),e.stroke())}e.restore()}renderChainArcs(e){e.save(),e.globalCompositeOperation="lighter",e.lineCap="round",e.lineJoin="round";for(let t=0;t<this.arcs.length;t++){const o=this.arcs[t];if(o.delay>0)continue;const i=y(o.elapsed/o.travelDur,0,1),s=y(o.elapsed/o.duration,0,1),a=s<.45?1:1-V((s-.45)/.55);if(!(a<=.01)&&(!this.reducedMotion&&o.branchBolt.length>1&&(this.strokePolylineSlice(e,o.branchBolt,i),e.strokeStyle=`rgba(255, 190, 62, ${(.36*a).toFixed(4)})`,e.lineWidth=4.2,e.stroke(),e.strokeStyle=`rgba(255, 245, 206, ${(.62*a).toFixed(4)})`,e.lineWidth=1.25,e.stroke()),o.mainBolt.length>1&&(this.strokePolylineSlice(e,o.mainBolt,i),e.strokeStyle=`rgba(255, 166, 36, ${(.38*a).toFixed(4)})`,e.lineWidth=11.5,e.stroke(),e.strokeStyle=`rgba(255, 224, 114, ${(.84*a).toFixed(4)})`,e.lineWidth=4.4,e.stroke(),e.strokeStyle=`rgba(255, 254, 244, ${(1*a).toFixed(4)})`,e.lineWidth=1.75,e.stroke()),i<1&&o.mainBolt.length>1)){const r=Math.min(o.mainBolt.length-1,Math.floor(i*(o.mainBolt.length-1))),n=o.mainBolt[r],c=this.sprites.whiteHot;c&&(e.globalAlpha=a,e.drawImage(c,n.x-24,n.y-24,48,48),e.globalAlpha=1)}}e.restore()}strokePolylineSlice(e,t,o){const i=(t.length-1)*y(o,0,1),s=Math.floor(i),a=i-s;e.beginPath(),e.moveTo(t[0].x,t[0].y);for(let r=1;r<=s&&r<t.length;r++)e.lineTo(t[r].x,t[r].y);if(a>.001&&s+1<t.length){const r=t[s],n=t[s+1];e.lineTo(I(r.x,n.x,a),I(r.y,n.y,a))}}renderMetallicDebris(e){e.save(),e.globalCompositeOperation="source-over";for(let t=0;t<this.debris.length;t++){const o=this.debris[t],i=y(o.age/o.life,0,1),s=i<.72?1:1-(i-.72)/.28;if(s<=.01)continue;const a=Math.max(.28,Math.abs(Math.cos(o.tumble))),r=o.isHotFracture?y(1-o.age/.36,0,1):0;e.save(),e.globalAlpha=s,e.translate(o.x,o.y),e.rotate(o.angle),e.scale(o.scale,o.scale*a),o.kind==="chain_link"?this.drawChainLink2D(e,r):o.kind==="shackle"?this.drawBrokenShackle2D(e,r):this.drawPadlockHalf2D(e,o.kind==="padlock_left",r),e.restore()}e.restore()}drawChainLink2D(e,t){Xt(e,20,11),e.strokeStyle="#181e29",e.lineWidth=5.4,e.stroke();const o=e.createLinearGradient(-10,-6,10,6);o.addColorStop(0,"#495468"),o.addColorStop(.32,"#c8d3e4"),o.addColorStop(.55,"#6d7a90"),o.addColorStop(.82,"#e2d0a8"),o.addColorStop(1,"#394252"),e.strokeStyle=o,e.lineWidth=3.4,e.stroke(),e.beginPath(),e.moveTo(-5.5,-5.2),e.lineTo(5.5,-5.2),e.strokeStyle="rgba(255, 250, 232, 0.85)",e.lineWidth=1.1,e.stroke(),t>.02&&(e.fillStyle=`rgba(255, 196, 68, ${t.toFixed(3)})`,e.beginPath(),e.arc(9.5,0,2.8,0,Math.PI*2),e.fill())}drawBrokenShackle2D(e,t){e.lineCap="round",e.beginPath(),e.moveTo(-8,10),e.lineTo(-8,-1),e.arc(0,-1,8,Math.PI,0,!1),e.lineTo(8,5),e.strokeStyle="#1d1c22",e.lineWidth=6.2,e.stroke();const o=e.createLinearGradient(-9,-9,9,10);o.addColorStop(0,"#6a7486"),o.addColorStop(.38,"#f0f4fa"),o.addColorStop(.7,"#9ca6b8"),o.addColorStop(1,"#d9b56c"),e.strokeStyle=o,e.lineWidth=3.8,e.stroke(),e.beginPath(),e.arc(0,-1,7.6,Math.PI*1.12,Math.PI*1.88,!1),e.strokeStyle="rgba(255, 252, 240, 0.9)",e.lineWidth=1.1,e.stroke(),t>.02&&(e.fillStyle=`rgba(255, 184, 58, ${t.toFixed(3)})`,e.beginPath(),e.arc(8,5.5,3,0,Math.PI*2),e.fill())}drawPadlockHalf2D(e,t,o){const i=t?-1:1;e.beginPath(),e.moveTo(0,-10),e.lineTo(i*10,-10),e.lineTo(i*12,-7),e.lineTo(i*12,8),e.lineTo(i*9,11),e.lineTo(0,11),e.lineTo(i*2.4,5),e.lineTo(i*-.8,1),e.lineTo(i*2.2,-3),e.lineTo(i*-.5,-6.5),e.closePath();const s=e.createLinearGradient(i*12,-10,0,11);s.addColorStop(0,"#fff2b0"),s.addColorStop(.32,"#f2c146"),s.addColorStop(.72,"#b97b16"),s.addColorStop(1,"#754608"),e.fillStyle=s,e.fill(),e.strokeStyle="#3d2204",e.lineWidth=1.6,e.stroke(),e.strokeStyle="rgba(255, 248, 204, 0.72)",e.lineWidth=1,e.beginPath(),e.moveTo(i*9.5,-8.2),e.lineTo(i*9.5,7.2),e.stroke(),e.fillStyle="#241406",e.beginPath(),e.arc(i*.4,-1.5,2.2,0,Math.PI*2),e.fill(),o>.02&&(e.strokeStyle=`rgba(255, 226, 118, ${(o*.9).toFixed(3)})`,e.lineWidth=1.8,e.beginPath(),e.moveTo(0,-10),e.lineTo(i*2.2,-3),e.lineTo(i*2.4,5),e.lineTo(0,11),e.stroke())}renderWedgeComets(e){e.save();for(let t=0;t<this.comets.length;t++){const o=this.comets[t],i=o.trail;if(i.length<2)continue;e.globalCompositeOperation="lighter",e.lineCap="round";for(let n=1;n<i.length;n++){const c=n/(i.length-1),d=i[n-1],h=i[n];e.strokeStyle=o.palette.mid,e.globalAlpha=c*c*.55,e.lineWidth=3+c*14,e.beginPath(),e.moveTo(d.x,d.y),e.lineTo(h.x,h.y),e.stroke(),e.strokeStyle=o.palette.core,e.globalAlpha=c*c*.92,e.lineWidth=1.2+c*5.2,e.beginPath(),e.moveTo(d.x,d.y),e.lineTo(h.x,h.y),e.stroke()}const s=i[i.length-1],a=this.sprites[o.palette.spriteKey]??this.sprites.gold;a&&(e.globalAlpha=.95,e.drawImage(a,s.x-42,s.y-42,84,84)),e.globalCompositeOperation="source-over",e.globalAlpha=1,e.save(),e.translate(s.x,s.y),e.rotate(o.spin);const r=13.5;e.beginPath(),e.moveTo(0,-r*1.25),e.lineTo(r*.92,0),e.lineTo(0,r*1.25),e.lineTo(-r*.92,0),e.closePath(),e.fillStyle=o.palette.deep,e.fill(),e.beginPath(),e.moveTo(0,-r*1.25),e.lineTo(0,0),e.lineTo(-r*.92,0),e.closePath(),e.fillStyle=o.palette.core,e.fill(),e.beginPath(),e.moveTo(0,-r*1.25),e.lineTo(r*.92,0),e.lineTo(0,0),e.closePath(),e.fillStyle=o.palette.prism,e.fill(),e.beginPath(),e.moveTo(-r*.92,0),e.lineTo(0,0),e.lineTo(0,r*1.25),e.closePath(),e.fillStyle=o.palette.mid,e.fill(),e.beginPath(),e.moveTo(0,-r*1.25),e.lineTo(r*.92,0),e.lineTo(0,r*1.25),e.lineTo(-r*.92,0),e.closePath(),e.strokeStyle="#fff9df",e.lineWidth=1.6,e.stroke(),e.globalCompositeOperation="lighter",X(e,-2,-3,14,2.2),e.fillStyle="rgba(255, 255, 255, 0.95)",e.fill(),e.restore()}e.restore()}renderFoilConfetti(e){e.save(),e.globalCompositeOperation="source-over";for(let t=0;t<this.confetti.length;t++){const o=this.confetti[t],i=y(o.age/o.life,0,1),s=i<.78?1:1-(i-.78)/.22;if(s<=.01)continue;const a=Math.cos(o.tilt),r=Math.max(.18,Math.abs(a)),n=Math.abs(a)>.94,c=n?o.lightHex:a>=0?o.baseHex:o.darkHex;if(e.save(),e.globalAlpha=s,e.translate(o.x,o.y),e.rotate(o.angle),e.scale(1,r),e.fillStyle=c,o.shape==="diamond"){const d=o.width*.62,h=o.height*.55;e.beginPath(),e.moveTo(0,-h),e.lineTo(d,0),e.lineTo(0,h),e.lineTo(-d,0),e.closePath(),e.fill()}else if(o.shape==="ribbon"){const d=o.width*.45,h=o.height*.52;e.beginPath(),e.moveTo(-d,-h),e.quadraticCurveTo(d*.7,0,-d*.6,h),e.lineTo(d,h),e.quadraticCurveTo(d*1.4,0,d*.7,-h),e.closePath(),e.fill()}else e.fillRect(-o.width*.5,-o.height*.5,o.width,o.height);n&&(e.strokeStyle="rgba(255, 255, 255, 0.78)",e.lineWidth=.8,e.stroke()),e.restore()}e.restore()}renderSparks(e){e.save(),e.globalCompositeOperation="lighter",e.lineCap="round";for(let t=0;t<this.sparks.length;t++){const o=this.sparks[t],i=y(o.age/o.life,0,1),s=1-i*i;if(s<=.015)continue;if(o.mode==="prism_star"||o.mode==="gold_glint"){const p=.6+.4*Math.sin(o.twinklePhase),f=o.size*(1.2-i*.55)*(.85+.35*p);e.globalAlpha=y(s*p,0,1),X(e,o.x,o.y,f*1.85,f*.36),e.fillStyle=o.colorHex,e.fill(),X(e,o.x,o.y,f*.95,f*.22),e.fillStyle=o.coreHex,e.fill();continue}const a=o.x-o.prevX,r=o.y-o.prevY,n=o.mode==="hot_metal"?3.8:2.8,c=o.x-a*n,d=o.y-r*n;let h=o.colorHex;o.mode==="hot_metal"&&(h=i<.24?"#fff6cc":i<.58?"#ffc93c":i<.82?"#ff6d1c":"#cf2e0a"),e.globalAlpha=y(s,0,1),e.strokeStyle=h,e.lineWidth=o.size*(1.35-i*.55),e.beginPath(),e.moveTo(c,d),e.lineTo(o.x,o.y),e.stroke(),i<.6&&(e.strokeStyle=o.coreHex,e.lineWidth=Math.max(.9,o.size*.52),e.beginPath(),e.moveTo(I(c,o.x,.5),I(d,o.y,.5)),e.lineTo(o.x,o.y),e.stroke())}e.restore()}renderKineticStamps(e){e.save();for(let t=0;t<this.stamps.length;t++){const o=this.stamps[t],i=y(o.age/o.life,0,1);let s=1,a=1,r=0;if(this.reducedMotion)s=i<.15?I(.9,1,K(i/.15)):1,a=i>.78?1-(i-.78)/.22:1;else if(o.age<.14){const S=o.age/.14;s=I(2.25,1,Ge(S,1.35)),a=y(S*2.2,0,1)}else if(i>.74){const S=(i-.74)/.26;s=I(1,1.14,V(S)),a=1-S}else{const S=y((o.age-.14)/.26,0,1);r=Math.sin(S*Math.PI*5)*.08*(1-S)}if(a<=.01)continue;const n=this.width<460,c=n?92:114,d=n?34:41;if(e.save(),e.globalAlpha=y(a,0,1),e.translate(o.x,o.y),e.rotate(o.tiltRad+r),e.scale(s,s),o.age<.55){const S=y(1-o.age/.55,0,1)*.65;e.save(),e.globalCompositeOperation="lighter",e.fillStyle=o.byPlayer?`rgba(255, 194, 72, ${S.toFixed(3)})`:`rgba(255, 62, 82, ${S.toFixed(3)})`;const C=12;e.beginPath();for(let w=0;w<C*2;w++){const g=w/(C*2)*Math.PI*2,A=w%2===0?c*1.28:c*.92,k=w%2===0?d*1.55:d*1.02,_=Math.cos(g)*A,E=Math.sin(g)*k;w===0?e.moveTo(_,E):e.lineTo(_,E)}e.closePath(),e.fill(),e.restore()}e.save(),e.translate(0,5),H(e,c+4,d+4,14),e.fillStyle="rgba(10, 4, 8, 0.72)",e.fill(),e.restore();const h=e.createLinearGradient(-c,-d,c,d);h.addColorStop(0,"#fff2b0"),h.addColorStop(.28,"#f0ba40"),h.addColorStop(.55,"#965d0d"),h.addColorStop(.8,"#ffdc75"),h.addColorStop(1,"#7a4708"),H(e,c+3,d+3,13),e.fillStyle=h,e.fill();const p=e.createLinearGradient(0,-d,0,d);p.addColorStop(0,o.byPlayer?"#cc1836":"#a80f2b"),p.addColorStop(.5,o.byPlayer?"#8c0c22":"#6e081b"),p.addColorStop(1,"#470411"),H(e,c-2.5,d-2.5,11),e.fillStyle=p,e.fill(),H(e,c-6,d-6,9),e.strokeStyle="rgba(255, 224, 128, 0.75)",e.lineWidth=1.25,e.stroke();const f=[[-c+14,-d+11],[c-14,-d+11],[-c+14,d-11],[c-14,d-11]];for(let S=0;S<f.length;S++){const[C,w]=f[S];e.fillStyle="#ffdf7e",e.beginPath(),e.arc(C,w,2.3,0,Math.PI*2),e.fill()}const m=n?24:30;e.font=`800 ${m}px ${be}`,e.textAlign="center",e.textBaseline="middle",e.fillStyle="rgba(26, 4, 8, 0.9)",e.fillText(o.title,0,-2.5);const b=e.createLinearGradient(0,-m*.55,0,m*.55);b.addColorStop(0,"#fffce8"),b.addColorStop(.45,"#ffd866"),b.addColorStop(1,"#e89522"),e.fillStyle=b,e.fillText(o.title,0,-5),e.font=`700 ${n?9.5:10.5}px ${Kt}`,e.fillStyle="#ffe5a8",e.fillText(o.subtitle,0,d-(n?11:13));const v=(o.age-.18)/.42;if(v>0&&v<1){e.save(),H(e,c-2.5,d-2.5,11),e.clip();const S=I(-c*1.4,c*1.4,v),C=e.createLinearGradient(S-28,-d,S+28,d);C.addColorStop(0,"rgba(255,255,255,0)"),C.addColorStop(.5,"rgba(255,250,220,0.48)"),C.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=C,e.fillRect(-c,-d,c*2,d*2),e.restore()}e.restore()}e.restore()}renderJackpotMarquees(e){e.save();for(let t=0;t<this.jackpots.length;t++){const o=this.jackpots[t],i=y(o.age/o.duration,0,1);let s=1,a=1,r=0;if(this.reducedMotion)a=i<.12?i/.12:i>.8?1-(i-.8)/.2:1;else if(o.age<.26){const T=o.age/.26;s=I(.58,1,Ge(T,1.5)),a=y(T*1.8,0,1),r=I(-24,0,K(T))}else if(i>.78){const T=(i-.78)/.22;s=I(1,1.06,V(T)),a=1-T,r=I(0,-18,V(T))}if(a<=.01)continue;const n=this.width<520,c=y(this.width-44,268,n?342:540),d=o.pointsText?n?82:96:n?60:72,h=c*.5,p=d*.5,f=this.width*.5,m=y(this.height*.28,86,240)+r;e.save(),e.globalAlpha=y(a,0,1),e.translate(f,m),e.scale(s,s),e.save(),e.translate(0,7),H(e,h+5,p+5,18),e.fillStyle="rgba(4, 10, 22, 0.74)",e.fill(),e.restore();const b=e.createLinearGradient(-h,-p,h,p);b.addColorStop(0,"#fff5bd"),b.addColorStop(.22,"#f5c245"),b.addColorStop(.5,"#9e660f"),b.addColorStop(.78,"#ffe07a"),b.addColorStop(1,"#824d09");const v=n?10:18;for(const T of[-1,1])e.beginPath(),e.moveTo(T*(h-2),-p*.42),e.lineTo(T*(h+v),0),e.lineTo(T*(h-2),p*.42),e.closePath(),e.fillStyle=b,e.fill(),e.strokeStyle="#3b2104",e.lineWidth=1.2,e.stroke();H(e,h+4,p+4,17),e.fillStyle=b,e.fill();const S=e.createLinearGradient(0,-p,0,p);S.addColorStop(0,"#0f3d30"),S.addColorStop(.5,"#07241e"),S.addColorStop(1,"#041413"),H(e,h-4,p-4,14),e.fillStyle=S,e.fill(),H(e,h-9,p-9,11),e.strokeStyle="rgba(255, 222, 118, 0.72)",e.lineWidth=1.4,e.stroke();const C=n?10:14,w=Math.floor(o.age*10);for(let T=0;T<C;T++){const M=I(-h+22,h-22,T/(C-1));for(let P=0;P<2;P++){const D=P===0?-p+1.5:p-1.5,ie=this.reducedMotion||(T+P+w)%2===0;e.fillStyle=ie?"#fff8d4":"#9c6e1c",e.beginPath(),e.arc(M,D,ie?2.6:1.9,0,Math.PI*2),e.fill()}}const g=o.pointsText.length>0,A=n?18:26;e.font=`800 ${A}px ${be}`,e.textAlign="center",e.textBaseline="middle";const k=g?n?-13:-16:0,_=c-44;e.fillStyle="rgba(3, 12, 10, 0.92)",e.fillText(o.headline,0,k+2.5,_);const E=e.createLinearGradient(0,k-A*.5,0,k+A*.5);if(E.addColorStop(0,"#fffce6"),E.addColorStop(.42,"#ffd966"),E.addColorStop(.85,"#e89e24"),E.addColorStop(1,"#fff0ad"),e.fillStyle=E,e.fillText(o.headline,0,k,_),g){const T=n?20:25;e.font=`800 ${T}px ${be}`;const M=n?15:18;e.fillStyle="rgba(3, 12, 10, 0.9)",e.fillText(o.pointsText,0,M+2,_),e.fillStyle="#fff5c7",e.fillText(o.pointsText,0,M,_)}const O=o.age*1.15%1.4;if(!this.reducedMotion&&O<.75){e.save(),H(e,h-4,p-4,14),e.clip();const T=I(-h*1.3,h*1.3,O/.75),M=e.createLinearGradient(T-44,-p,T+44,p);M.addColorStop(0,"rgba(255,255,255,0)"),M.addColorStop(.5,"rgba(255,248,206,0.34)"),M.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=M,e.fillRect(-h,-p,c,d),e.restore()}if(!this.reducedMotion){e.globalCompositeOperation="lighter";const T=.65+.35*Math.sin(o.age*11);e.fillStyle=`rgba(255, 250, 214, ${(.9*T).toFixed(3)})`,X(e,-h+14,-p+14,13*T,2.2),e.fill(),X(e,h-14,p-14,11*(1.3-T*.4),2),e.fill()}e.restore()}e.restore()}}const ve="ws_briefing_format_mode_v4",ye="ws_briefing_timer_pace_v4",ke="ws_v4_endless_best_streak",Ue="ws_v4_daily_done_",He="v5-linear-curtain-styles",Jt={frankie_russo:{name:"Frankie Russo",title:"Unbeaten Oakridge Pub-Quiz Bartender",hometown:"Oakridge, Brooklyn",accentHex:"#f59e0b",strongDomains:[4,5,9],weakDomains:[3,10],baseAccuracy:.46,signatureGimmick:"CLAIM_TILE",introLines:["Twenty bucks on table four says you blink under the stage lights!","Keep your tab open, kid — this board is mine."]},denise_park:{name:"Denise Park",title:"Retired AP History Legend",hometown:"Evanston, Illinois",accentHex:"#a78bfa",strongDomains:[0,8,10],weakDomains:[4,6],baseAccuracy:.54,signatureGimmick:"FORCE_WEAK_TILE",introLines:["Pencils up, posture straight. Sloppy citations lose matches.","Let us see if your homework holds up on air."]},trevor_blake:{name:"Trevor Blake",title:"19-Day Regional TV Streak Star",hometown:"Orlando, Florida",accentHex:"#38bdf8",strongDomains:[4,5,2],weakDomains:[1,11],baseAccuracy:.6,signatureGimmick:"PLANT_BOUNTY",introLines:["Make sure Camera Two catches my good side when I sweep your column!","Nineteen straight broadcasts — you are episode twenty."]},priya_nair:{name:"Dr. Priya Nair",title:"ER Trauma Physician & Crossword Champ",hometown:"Boston, Massachusetts",accentHex:"#10b981",strongDomains:[1,7,11],weakDomains:[5,4],baseAccuracy:.65,signatureGimmick:"FREEZE_FAVORITE_COLUMN",introLines:["A 25-second shot clock feels like a vacation after a night shift in trauma.","Stay calm — panic costs more points than ignorance."]},alistair_finch:{name:"Lord Alistair Finch",title:"Oxford Classics Fellow",hometown:"Oxford, England",accentHex:"#e11d48",strongDomains:[0,3,10],weakDomains:[4,5],baseAccuracy:.7,signatureGimmick:"FORCE_WEAK_TILE",introLines:["How charmingly ambitious. Shall we test your classical foundations?","Mind the draft bans — Oxford rules reward foresight."]},kenji_takahashi:{name:"Kenji Takahashi",title:"Shogi & Quiz-Bowl Speed Prodigy",hometown:"Shibuya, Tokyo",accentHex:"#f43f5e",strongDomains:[1,6,11],weakDomains:[9,10],baseAccuracy:.74,signatureGimmick:"PLANT_BOUNTY",introLines:["Three moves ahead on the grid. Your clock is already behind mine.","Speed without precision is noise — bring both."]},nadia_al_mansoor:{name:"Nadia Al-Mansoor",title:"World Memory Champion & Polyglot",hometown:"Cairo, Egypt",accentHex:"#f5c451",strongDomains:[2,3,8],weakDomains:[5,6],baseAccuracy:.78,signatureGimmick:"FREEZE_FAVORITE_COLUMN",introLines:["Every tile on this stage already has a room inside my memory palace.","Show me a mind worthy of the semifinal."]},viktor_volkov:{name:"Viktor Volkov",title:"Reigning Global Grandmaster",hometown:"Geneva, Switzerland",accentHex:"#fbbf24",strongDomains:[0,1,8,11],weakDomains:[4,9],baseAccuracy:.82,signatureGimmick:"FORCE_WEAK_TILE",introLines:["One point four billion viewers. Zero margin for hesitation.","You climbed all the way to the summit — now prove you belong here."]}},eo={1:"TIER1_COMMUNITY_HALL",2:"TIER2_CIVIC_THEATER",3:"TIER3_REGIONAL_TV",4:"TIER4_NATIONAL_ARENA",5:"TIER5_LONDON_ROTUNDA",6:"TIER6_TOKYO_SKYDOME",7:"TIER7_CAIRO_PAVILION",8:"TIER8_GLOBAL_FINALE"};function se(l){return String(l??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Z(l){try{return typeof localStorage<"u"?localStorage.getItem(l):null}catch{return null}}function j(l,e){try{typeof localStorage<"u"&&localStorage.setItem(l,e)}catch{}}function we(){const l=new Date,e=l.getUTCFullYear(),t=String(l.getUTCMonth()+1).padStart(2,"0"),o=String(l.getUTCDate()).padStart(2,"0");return`${e}-${t}-${o}`}function to(l){let e=2166136261;for(let t=0;t<l.length;t+=1)e^=l.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0||20260501}function J(){const l=Date.UTC(2025,0,1),e=Date.now();return Math.max(1,Math.floor((e-l)/864e5)+1)}function oo(l){let e=2166136261;for(let t=0;t<l.length;t+=1)e^=l.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0||1337}function We(l){let e=l>>>0;return()=>{e=e+1831565813>>>0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function io(l,e){switch(l){case"MIDDLE_SCHOOL":return"MIDDLE_SCHOOL";case"HIGH_SCHOOL":return"HIGH_SCHOOL";case"COLLEGE":return"COLLEGE";case"GRADUATE":return"GRADUATE";case"MENSA":return"MENSA";case"ADAPTIVE":default:return e>=10?"MENSA":e>=6?"GRADUATE":e>=3?"COLLEGE":"HIGH_SCHOOL"}}function Xe(l){return l<=2?"MIDDLE_SCHOOL":l<=4?"HIGH_SCHOOL":l<=5?"COLLEGE":l<=7?"GRADUATE":"MENSA"}function ro(l,e){const t={OPEN_TRYOUT:"OPEN_CLASSIC",PADLOCK_NEIGHBORS:"PADLOCK_NEIGHBORS",FOG_EXPLORER:"FOG_CROSSROADS",SPOTLIGHT_ROULETTE:"SPOTLIGHT_ROULETTE",CROSSROADS_HYBRID:"CHALLENGER_GAUNTLET",FINALE_GAUNTLET:"GRAND_FINALE_VAULT"};return{episodeId:l.nodeId,tierNumber:l.tierNumber,episodeInTier:(l.actNumber-1)%4+1,title:l.showTitle,subtitle:`${l.cityStamp} · ${l.venueName}`,venueName:l.venueName,themeId:eo[l.tierNumber],baseAudienceWatching:l.baseAudience,prizePurseUsd:l.purseUsd,difficultyTier:Xe(l.tierNumber),topology:t[l.topology]??"OPEN_CLASSIC",boardCols:l.boardCols,boardRows:l.boardRows,maxTurns:l.maxTurns,allowedFormats:[...l.featuredFormats],hasCategoryDraft:e==="oxford_pick_ban",challengerId:l.challengerId,soloTargetScore:l.soloTargetScore??1e3,rulesHookSummary:`${e.replace(/_/g," ").toUpperCase()} · Live Broadcast`}}function ao(l){if(!l)return null;const e=Jt[l];return e?{id:l,name:e.name,title:e.title,hometown:e.hometown,avatarPortraitUrl:Ve.challengers[l],accentHex:e.accentHex,strongDomains:e.strongDomains,weakDomains:e.weakDomains,baseAccuracy:e.baseAccuracy,signatureGimmick:e.signatureGimmick,introLines:e.introLines,onForceCategoryLines:[e.introLines[0]],onFreezeColumnLines:["Let us put your favorite column on ice for a moment!"],onPlayerBigPlayLines:["Clean shot. Do not expect the next tile to be that friendly."],onPlayerMissLines:["The spotlight burns hot when you hesitate!"],winMatchLine:"Another broadcast locked up. Check the Late-Night circuit if you want a rematch.",loseMatchLine:"Sharp play under the lights — you earned that curtain call."}:null}function so(){if(typeof document>"u"||document.getElementById(He))return;const l=document.createElement("style");l.id=He,l.textContent=`
    .v5-curtain-shell {
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: clamp(10px, 2.2vmin, 22px);
      box-sizing: border-box;
      overflow-y: auto;
      background-size: cover;
      background-position: center;
      color: #fff8e7;
      font-family: 'Inter', system-ui, sans-serif;
    }
    .v5-curtain-shell::before {
      content: '';
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at 50% 24%, rgba(16, 36, 62, 0.48), rgba(6, 10, 18, 0.88) 78%);
      pointer-events: none;
      z-index: 0;
    }
    .v5-curtain-plaque {
      position: relative;
      z-index: 1;
      width: min(94vw, 620px);
      background: linear-gradient(165deg, #3b2112 0%, #241209 52%, #170b05 100%);
      border: 3px solid #d4a548;
      border-radius: 22px;
      box-shadow:
        0 20px 48px rgba(0, 0, 0, 0.78),
        inset 0 2px 0 rgba(255, 236, 179, 0.45),
        inset 0 0 0 3px rgba(92, 54, 20, 0.85);
      padding: clamp(14px, 2.8vmin, 26px);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: clamp(10px, 1.8vmin, 16px);
    }
    .v5-curtain-ribbon {
      align-self: center;
      background: linear-gradient(180deg, #16794b 0%, #0b462a 100%);
      border: 2px solid #f2c96b;
      border-radius: 999px;
      padding: 5px 18px;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(11px, 1.7vmin, 13px);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #fff6d6;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    }
    .v5-curtain-title {
      margin: 0;
      text-align: center;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(20px, 4.2vmin, 30px);
      line-height: 1.15;
      color: #ffe7a3;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.75);
    }
    .v5-curtain-sub {
      margin: 0;
      text-align: center;
      font-size: clamp(12.5px, 2vmin, 15px);
      line-height: 1.4;
      color: #f3e4c6;
    }
    .v5-curtain-dials {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .v5-curtain-dial {
      background: radial-gradient(circle at 50% 25%, #163226 0%, #091812 100%);
      border: 2px solid #c9993e;
      border-radius: 14px;
      padding: 8px 6px;
      text-align: center;
      box-shadow: inset 0 1px 0 rgba(255, 232, 168, 0.28);
    }
    .v5-curtain-dial-val {
      display: block;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      font-size: clamp(16px, 3.2vmin, 22px);
      color: #ffdf85;
    }
    .v5-curtain-dial-lbl {
      display: block;
      margin-top: 2px;
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #c8dfc8;
    }
    .v5-curtain-pips {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 6px;
    }
    .v5-curtain-pip {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid #e7be63;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
    }
    .v5-curtain-pip.is-hit {
      background: linear-gradient(180deg, #22c55e, #15803d);
      color: #fff;
    }
    .v5-curtain-pip.is-miss {
      background: linear-gradient(180deg, #dc2626, #7f1d1d);
      color: #fff;
    }
    .v5-curtain-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
      margin-top: 4px;
    }
    .v5-curtain-btn {
      min-height: 46px;
      padding: 10px 18px;
      border-radius: 999px;
      border: 2px solid #f0c565;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(12px, 1.9vmin, 14px);
      letter-spacing: 0.06em;
      cursor: pointer;
      color: #fff9e8;
      background: linear-gradient(180deg, #4b2b16 0%, #2a1509 100%);
      box-shadow: 0 5px 14px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 232, 175, 0.35);
    }
    .v5-curtain-btn.is-primary {
      background: linear-gradient(180deg, #1ca362 0%, #0d5c35 100%);
      border-color: #ffe28a;
    }
    @media (max-height: 460px) and (orientation: landscape) {
      .v5-curtain-plaque {
        width: min(94vw, 760px);
        padding: 10px 18px;
        gap: 8px;
      }
      .v5-curtain-title {
        font-size: clamp(17px, 4.4vh, 22px);
      }
    }
  `,document.head.appendChild(l)}class no{canvasRoot;vfxCanvasEl;uiRoot;audio;haptics;campaign;vfx;greenRoomView;pinboardView=null;jukeboxView=null;storyTheaterView=null;boardStageView=null;spotlightRenderer=null;savesModalInstance=null;qGenPromise=null;boardStagePromise=null;boardRulesPromise=null;spotlightPromise=null;gadgetsPromise=null;pinboardPromise=null;jukeboxPromise=null;storyTheaterPromise=null;scoringV4Promise=null;challengerAiPromise=null;wittyHostPromise=null;metaSuitePromise=null;storyPacksPromise=null;formatMode;timerMode;activeTourAct=1;currentScreen="GREEN_ROOM";boardSession=null;linearSession=null;usedQidsThisSession=new Set;clockIntervalId=null;lastTickedWholeSec=null;prewarmTimerId=null;boundGlobalClick=null;disposed=!1;constructor(e,t,o){this.canvasRoot=e,this.vfxCanvasEl=t,this.uiRoot=o,this.canvasRoot.style.display="none",this.uiRoot.classList.add("v5-show-root"),this.vfxCanvasEl.style.position="fixed",this.vfxCanvasEl.style.inset="0",this.vfxCanvasEl.style.pointerEvents="none",this.vfxCanvasEl.style.zIndex="65",this.audio=new Je,this.haptics=new et,this.campaign=new bt,this.vfx=new Zt,this.vfx.mount(this.vfxCanvasEl),this.greenRoomView=new Dt(this.uiRoot);const i=Z(ve);this.formatMode=i==="CLASSIC_4_ONLY"?"CLASSIC_4_ONLY":"VARIETY_MIX";const s=Z(ye);this.timerMode=s==="RELAXED_UNTIMED"?"RELAXED_UNTIMED":"STANDARD",this.boundGlobalClick=a=>{a.target?.closest?.("[data-v5-fullscreen-toggle]")&&(a.preventDefault(),this.audio.playSfx("ui_tap"),this.toggleFullscreen())},window.addEventListener("click",this.boundGlobalClick,{passive:!1}),window.__wsShowtimeV5=this,this.showGreenRoomHub(),this.storyPacksPromise=this.campaign.loadStoryPacks().then(()=>{!this.disposed&&this.currentScreen==="GREEN_ROOM"&&this.showGreenRoomHub()}).catch(()=>{}),this.prewarmTimerId=window.setTimeout(()=>{this.prewarmTimerId=null,!this.disposed&&(this.ensurePinboardModule(),this.ensureBoardModules(),this.ensureQuestionModules(),this.ensureStoryTheaterModule(),this.ensureJukeboxModule(),this.ensureMetaSuite())},60)}dispose(){this.disposed||(this.disposed=!0,this.stopQuestionClock(),this.prewarmTimerId!==null&&(window.clearTimeout(this.prewarmTimerId),this.prewarmTimerId=null),this.boundGlobalClick&&(window.removeEventListener("click",this.boundGlobalClick),this.boundGlobalClick=null),this.teardownActiveViews(),this.greenRoomView.dispose(),this.pinboardView?.dispose(),this.jukeboxView?.dispose(),this.storyTheaterView?.dispose(),this.boardStageView?.dispose(),this.spotlightRenderer?.dispose(),this.vfx.dispose(),this.audio.dispose())}ensureStoryReady(){return this.storyPacksPromise||(this.storyPacksPromise=this.campaign.loadStoryPacks().then(()=>{})),this.storyPacksPromise}ensureQuestionGen(){return this.qGenPromise||(this.qGenPromise=R(()=>import("./QuestionGeneratorV4-Bq6C4-NY.js"),__vite__mapDeps([0,1,2]),import.meta.url)),this.qGenPromise}ensurePinboardModule(){return this.pinboardPromise||(this.pinboardPromise=R(()=>import("./TourTrunkPinboardView-D8qbw2u1.js"),__vite__mapDeps([3,2]),import.meta.url)),this.pinboardPromise}ensureJukeboxModule(){return this.jukeboxPromise||(this.jukeboxPromise=R(()=>import("./TopicJukeboxView-Bo75Q76K.js"),__vite__mapDeps([4,1,5,6,7,8,9,10]),import.meta.url)),this.jukeboxPromise}ensureStoryTheaterModule(){return this.storyTheaterPromise||(this.storyTheaterPromise=R(()=>import("./VoicedStoryTheaterView-CrTMEA9q.js"),__vite__mapDeps([11,2]),import.meta.url)),this.storyTheaterPromise}ensureBoardModules(){return this.boardStagePromise||(this.boardStagePromise=R(()=>import("./LivingStageBoardView-DI4Z1qwv.js"),__vite__mapDeps([12,2]),import.meta.url)),this.boardRulesPromise||(this.boardRulesPromise=R(()=>import("./StageBoardRulesV5-Bd6tQPFP.js"),__vite__mapDeps([13,14,15,2]),import.meta.url)),this.scoringV4Promise||(this.scoringV4Promise=R(()=>import("./ScoringV4-BqNmoRGp.js"),[],import.meta.url)),this.challengerAiPromise||(this.challengerAiPromise=R(()=>import("./ChallengerAI-BhKzdgZh.js").then(e=>e.C),__vite__mapDeps([14,15]),import.meta.url)),this.wittyHostPromise||(this.wittyHostPromise=R(()=>import("./WittyHostBank-cB0RdU6f.js"),[],import.meta.url)),Promise.all([this.boardStagePromise,this.boardRulesPromise,this.scoringV4Promise,this.challengerAiPromise,this.wittyHostPromise])}ensureQuestionModules(){return this.spotlightPromise||(this.spotlightPromise=R(()=>import("./SpotlightLozengeRendererV5-ClixiOlU.js"),__vite__mapDeps([16,2]),import.meta.url)),this.gadgetsPromise||(this.gadgetsPromise=R(()=>import("./TactileGadgetRenderersV5-N-pukD_h.js"),[],import.meta.url)),this.wittyHostPromise||(this.wittyHostPromise=R(()=>import("./WittyHostBank-cB0RdU6f.js"),[],import.meta.url)),Promise.all([this.spotlightPromise,this.gadgetsPromise,this.ensureQuestionGen(),this.wittyHostPromise])}async ensureMetaSuite(){return this.metaSuitePromise||(this.metaSuitePromise=(async()=>{const[{MetaProgressionSuite:e},{PassportSystem:t},{InkBlackboard:o}]=await Promise.all([R(()=>import("./meta-DtKNs8SG.js"),__vite__mapDeps([6,1,7,8,9,10]),import.meta.url),R(()=>import("./narrative-zOqZ7SbE.js").then(a=>a.c),__vite__mapDeps([7,1]),import.meta.url),R(()=>import("./narrative-zOqZ7SbE.js").then(a=>a.I),__vite__mapDeps([7,1]),import.meta.url)]),i=new t,s=new o;return new e({passport:i,blackboard:s,audio:this.audio,haptics:this.haptics},{onRenameChallenger:a=>{this.campaign.setContestantName(a),this.currentScreen==="GREEN_ROOM"&&this.showGreenRoomHub()},onEquipBroadcastTitle:()=>{this.currentScreen==="GREEN_ROOM"&&this.showGreenRoomHub()},onPracticeSlice:a=>{const r=typeof a.domainId=="number"&&a.domainId>=0&&a.domainId<=11?a.domainId:null;this.openTopicJukebox({initialDomainId:r,initialSearchQuery:a.subcatLabel??""})},onLaunchLivePrismReview:a=>{this.startSrsReviewDeck(a)},onCloseSuite:()=>{this.currentScreen==="GREEN_ROOM"&&this.showGreenRoomHub()}})})()),this.metaSuitePromise}playStreakSfx(e){const o=`streak_${Math.max(1,Math.min(5,e))}`;this.audio.playSfx(o)}isFullscreenActive(){if(typeof document>"u")return!1;const e=document;return!!(document.fullscreenElement||e.webkitFullscreenElement)}async toggleFullscreen(){if(typeof document>"u")return!1;const e=document,t=document.documentElement;try{if(document.fullscreenElement||e.webkitFullscreenElement)return typeof document.exitFullscreen=="function"?await document.exitFullscreen():typeof e.webkitExitFullscreen=="function"&&await e.webkitExitFullscreen(),!1;if(typeof t.requestFullscreen=="function")return await t.requestFullscreen(),!0;if(typeof t.webkitRequestFullscreen=="function")return await t.webkitRequestFullscreen(),!0}catch{}return this.isFullscreenActive()}isMasterAudioOn(){return this.audio.isSfxEnabled()||this.audio.isMusicEnabled()}toggleMasterAudio(){const e=!this.isMasterAudioOn();return this.audio.setSfxEnabled(e),this.audio.setVoiceEnabled(e),this.audio.setMusicEnabled(e),e&&this.audio.playSfx("ui_tap"),e}teardownActiveViews(){this.stopQuestionClock(),this.audio.stopVoice(),this.spotlightRenderer?.dispose(),this.spotlightRenderer=null,this.boardStageView?.closeModal(),this.pinboardView?.unmount(),this.storyTheaterView?.unmount(),this.jukeboxView?.dispose(),this.jukeboxView=null}showGreenRoomHub(){this.teardownActiveViews(),this.boardSession=null,this.linearSession=null,this.currentScreen="GREEN_ROOM";const e=this.campaign.getState(),t=e.currentAct<=1?1:e.currentAct<=3?4:8;this.vfx.setStageMood(t,"calm"),this.audio.setMusicCue("greenroom");const o=this.campaign.getRecommendedNextNode(e),i=this.campaign.peekNextInboxCallScene(),s=we(),a=Z(`${Ue}${s}`)==="1",r=Math.max(0,Number(Z(ke)||0)),n=!e.coldOpenCompleted&&e.totalMatchesPlayed===0?"Live Open-Call Audition · Oakridge Hall":o?`${o.showTitle} · ${o.venueName}`:"Continue Championship Tour",c=St(e,{era:Qe(e.currentAct),stepOnStageSubtitle:n,currentVenueName:o?.venueName??"Oakridge Community Hall",currentShowTitle:o?.showTitle??"Oakridge Pub Open Call",inboxCount:e.inboxCallsQueue.length,inboxHeadline:i?.title,inboxCallerName:i?.beats[0]?.speakerName,dailyBroadcastNumber:J(),dailyBroadcastLabel:`Broadcast #${J()}`,dailyCompletedToday:a,endlessBestStreak:r,audioEnabled:this.isMasterAudioOn(),activeSaveSlotLabel:`Slot ${this.campaign.getActiveSlotId()}`});this.greenRoomView.render(c,{onStepOnStage:()=>{this.audio.playBoardCue("switch_clack"),this.haptics.uiTap(),this.handleStepOnStageFromGreenRoom()},onOpenTourTrunk:()=>{this.audio.playBoardCue("polaroid_pin"),this.haptics.uiTap(),this.showTourTrunkPinboard()},onOpenTopicJukebox:()=>{this.audio.playBoardCue("switch_clack"),this.haptics.uiTap(),this.openTopicJukebox()},onStartDaily:()=>{this.audio.playBoardCue("switch_clack"),this.haptics.uiTap(),this.startDailyBroadcast()},onStartEndless:()=>{this.audio.playBoardCue("switch_clack"),this.haptics.uiTap(),this.startEndlessStreak()},onOpenStatsRadar:()=>{this.audio.playSfx("ui_tap"),this.openCareerStats()},onOpenTrophies:()=>{this.audio.playSfx("ui_tap"),this.openHallOfTrophies()},onOpenSaves:()=>{this.audio.playSfx("ui_tap"),this.openSavesSheet()},onToggleAudio:()=>{const d=this.toggleMasterAudio();this.greenRoomView.updateAudioState(d)},onToggleFullscreen:()=>{this.toggleFullscreen()},onOpenInboxCall:()=>{this.audio.playBoardCue("switch_clack"),this.openNextBackstagePhoneCall()},onInteractionFeedback:d=>{(d==="tap"||d==="ring")&&this.audio.playSfx("ui_tap")}})}async handleStepOnStageFromGreenRoom(){await this.ensureStoryReady();const e=this.campaign.getState();if(!e.coldOpenCompleted&&e.totalMatchesPlayed===0){const o=this.campaign.getColdOpenScene();await this.playInteractiveStoryScene(o,{continueButtonLabel:"STEP TO AUDITION MIC",onFinished:()=>{this.startColdOpenAuditionWarmup()}});return}const t=this.campaign.getRecommendedNextNode(e)??this.campaign.getAllNodes()[0]??null;t?await this.launchCampaignNode(t.nodeId,!1):await this.showTourTrunkPinboard()}async openNextBackstagePhoneCall(){await this.ensureStoryReady();const e=this.campaign.peekNextInboxCallScene();if(!e){this.showGreenRoomHub();return}await this.playInteractiveStoryScene(e,{continueButtonLabel:"HANG UP & RETURN",onFinished:()=>{this.campaign.markSceneSeen(e.sceneId),this.showGreenRoomHub()}})}async playInteractiveStoryScene(e,t){const{VoicedStoryTheaterView:o,createStoryTheaterVoiceBridge:i}=await this.ensureStoryTheaterModule();this.teardownActiveViews(),this.currentScreen="STORY_THEATER",this.storyTheaterView||(this.storyTheaterView=new o(this.uiRoot)),e.kind==="REDEMPTION_BEAT"?this.audio.playStageSymphony(2,"REDEMPTION_GRIT"):e.kind==="ENDING"?(this.audio.playStageSymphony(8,"MAIN_STAGE"),this.vfx.fireConfettiOvation(4200)):e.kind==="GREEN_ROOM_CALL"||e.kind==="COLD_OPEN"?this.audio.setMusicCue("greenroom"):e.kind==="ACT_CLIMAX"&&this.audio.playStageSymphony(6,"MAIN_STAGE");const s=i(this.audio);let a=!1;const r=()=>{a||(a=!0,this.campaign.markSceneSeen(e.sceneId),t.onFinished())};this.storyTheaterView.showScene(e,{voiceBridge:s,continueButtonLabel:t.continueButtonLabel??"STEP ONTO STAGE",allowSkip:!0,onToggleFullscreen:()=>{this.toggleFullscreen()},onChoiceSelected:n=>(this.haptics.uiTap(),this.campaign.applyStoryChoice(e.sceneId,n,e.featuredChallengerId)),onSceneComplete:()=>{r()},onSkipScene:()=>{r()}})}async startColdOpenAuditionWarmup(){const[,,e]=await this.ensureQuestionModules(),t=await e.drawQuestionCardV4({format:"MULTIPLE_CHOICE",difficultyTier:"MIDDLE_SCHOOL",excludeQids:this.usedQidsThisSession});this.usedQidsThisSession.add(t.qid);const o=await e.drawQuestionCardV4({format:"PINPOINT_DIAL",difficultyTier:"MIDDLE_SCHOOL",excludeQids:this.usedQidsThisSession});this.usedQidsThisSession.add(o.qid);const i=await e.drawQuestionCardV4({format:"MATCH_4",difficultyTier:"MIDDLE_SCHOOL",excludeQids:this.usedQidsThisSession});this.usedQidsThisSession.add(i.qid),this.campaign.markMechanicsIntroduced(["read_in_grace_clock","lifeline_brass_coins","double_down_switch","format_pinpoint_dial","format_match4_switchboard"]),this.audio.playRandomHostCategoryVoice("read_in_tip"),this.audio.playStageSymphony(1,"MAIN_STAGE"),this.linearSession={mode:"AUDITION_WARMUP",title:"Live Open-Call Mic Check",venueLabel:"Oakridge Community Hall · Audition",tierNumber:1,totalQuestions:3,questionIndex:0,score:0,currentStreak:0,bestStreak:0,correctCount:0,answeredCount:0,livesRemaining:99,lifelines5050Left:2,lifelinesHintLeft:2,earnedWedges:[],formatMode:"VARIETY_MIX",timerPace:this.timerMode,domainId:null,subcategoryId:null,difficultyPreset:"ADAPTIVE",prebuiltDeck:[t,o,i],srsDeck:null,answerResults:[],coachWhispers:["MAX STERLING: Notice the 2-second amber Read-In grace before the Shot Clock ticks — and those 50/50 & CLUE brass coins on your desk!","MAX STERLING: Drag the 270° brass dial needle into the green Win Zone — or flip the 2× DOUBLE DOWN switch if you know the exact bullseye!","PRODUCER SAM: Snap all 4 braided neon patch cables across the mahogany switchboard, then pull LOCK 4 CABLES!"]},await this.presentNextLinearQuestion()}async showTourTrunkPinboard(e){await this.ensureStoryReady();const[t,o]=await Promise.all([this.ensurePinboardModule(),this.boardRulesPromise??(this.boardRulesPromise=R(()=>import("./StageBoardRulesV5-Bd6tQPFP.js"),__vite__mapDeps([13,14,15,2]),import.meta.url))]);this.teardownActiveViews(),this.boardSession=null,this.linearSession=null,this.currentScreen="TOUR_PINBOARD",this.vfx.setStageMood(1,"calm"),this.audio.setMusicCue("title");const i=this.campaign.getState(),s=this.campaign.getRecommendedNextNode(i);this.activeTourAct=e??s?.actNumber??i.currentAct,this.pinboardView||(this.pinboardView=new t.TourTrunkPinboardView);const a=r=>{const n=this.campaign.getState();this.pinboardView?.render({saveState:n,nodes:this.campaign.getAllNodes(),charmsCatalog:o.PODIUM_CHARMS_LIST_V5,activeAct:this.activeTourAct,selectedNodeId:s?.nodeId??n.currentNodeId})};this.pinboardView.mount(this.uiRoot,{onLaunchNode:(r,n)=>{this.audio.playBoardCue("polaroid_pin"),this.haptics.lockThunk(),this.launchCampaignNode(r.nodeId,!!n?.acceptDare)},onEquipCharms:r=>{this.audio.playBoardCue("switch_clack"),this.campaign.setEquippedCharms(r),a()},onSelectAct:r=>{this.audio.playBoardCue("polaroid_pin"),this.activeTourAct=r},onSelectSponsor:r=>{this.audio.playBoardCue("switch_clack"),this.campaign.selectActiveSponsor(r),a()},onBackToGreenRoom:()=>{this.audio.playSfx("ui_tap"),this.showGreenRoomHub()},onPlayUiSfx:r=>{r==="pin"?this.audio.playBoardCue("polaroid_pin"):r==="charm"||r==="launch"?this.audio.playBoardCue("switch_clack"):this.audio.playSfx("ui_tap")}}),a()}async launchCampaignNode(e,t=!1){await this.ensureStoryReady();const o=this.campaign.getNode(e)??this.campaign.getRecommendedNextNode();if(!o){this.showGreenRoomHub();return}const s=this.campaign.payEntryFeeOrBailout(o.nodeId).paidUsd>=0;this.campaign.selectCurrentNode(o.nodeId);const a=this.campaign.buildAugmentedPreMatchScene(o.nodeId);if(a){await this.playInteractiveStoryScene(a.scene,{continueButtonLabel:"LIGHTS UP · TO THE BOARD!",onFinished:()=>{this.initializeAndMountStageBoard(o,t,s)}});return}await this.initializeAndMountStageBoard(o,t,s)}async initializeAndMountStageBoard(e,t,o){const[i,s,,a]=await this.ensureBoardModules();this.teardownActiveViews(),this.currentScreen="STAGE_BOARD",this.audio.playStageSymphony(e.tierNumber,e.lane),this.vfx.setStageMood(e.tierNumber,e.tierNumber>=7?"hotseat":"board"),this.boardStageView||(this.boardStageView=new i.LivingStageBoardView(this.uiRoot));const r=this.campaign.getState(),n=s.resolveBoardTwistIdV5(e.boardTwistId??ee(e),e.topology),c=ro(e,n),d=ao(e.challengerId),h=oo(`${e.nodeId}_${r.totalMatchesPlayed}_${Date.now()}`),p=We(h);if(n==="oxford_pick_ban"&&d){let f=s.buildOxfordPickBanDraftV5({targetColumns:e.boardCols,poolSize:Math.max(8,e.boardCols+4),rng:p});const m=()=>{let S=0;for(;!f.isComplete&&f.nextActor==="RIVAL"&&S<12;)f=a.applyRivalDraftPick(f,d,null,p),S+=1},b=S=>{this.boardStageView?.closeModal(),this.finishStageBoardSetup(e,c,d,n,t,o,p,s,S)},v=()=>{if(!this.boardStageView)return;m();const S=f.pool.map(w=>({colId:w.entryId,wedgeId:w.wedgeId,domainId:w.domainId,wittyTitle:w.wittyTitle,topicSubtitle:w.topicSubtitle,state:w.status==="PICKED_PLAYER"?"PLAYER_PICK":w.status==="PICKED_RIVAL"?"RIVAL_PICK":w.status==="BANNED_PLAYER"?"PLAYER_BAN":w.status==="BANNED_RIVAL"?"RIVAL_BAN":"AVAILABLE"})),C=f.isComplete?"Oxford Pick & Ban Locked!":f.nextAction==="BAN"?`Oxford Ban: Veto 1 Rival Subject (${f.playerBansRemaining} left)`:`Oxford Pick: Claim Column (${f.playerPicksRemaining} left)`;this.boardStageView.openCategoryDraftModal({challenger:d,phaseTitle:C,instruction:"Pick favored columns (+75 PTS bonus) and veto your rival’s signature domains before the board lights up.",pool:S,canConfirm:f.isComplete},{onSelectDraftItem:w=>{f.isComplete||(this.audio.playBoardCue("switch_clack"),f=a.applyPlayerDraftPick(f,w),v())},onConfirmDraft:()=>{this.audio.playBoardCue("power_play");const w=s.finalizeDraftToBoardColumns(f,p);b(w)}})};this.finishStageBoardSetup(e,c,d,n,t,o,p,s),v();return}this.finishStageBoardSetup(e,c,d,n,t,o,p,s)}finishStageBoardSetup(e,t,o,i,s,a,r,n,c){const d=this.campaign.getState();let h=n.generateStageBoardV5(e,{boardTwistId:i,equippedCharms:d.equippedCharms,draftedColumns:c,rng:r});const p=this.campaign.consumeNextGrudgeSabotage(e.nodeId);let f=o?o.introLines[0]??null:null,m=null;if(p){f=p.tauntLine,m=`GRUDGE AMBUSH · ${p.rivalName.toUpperCase()}`;const S=h.tiles.find(C=>C.status==="OPEN");S&&p.kind==="EARLY_SCREW_AMBUSH"&&(h={...h,forcedTileId:S.tileId,forcedReasonBanner:`${p.rivalName} called in a Grudge Ambush on "${h.columns[S.colIndex]?.wittyTitle??"Opening Tile"}"!`})}const b=n.getBoardTopologySpecV5(i),v={kind:i==="chain_padlocks"?"CHAINS":h.playerScrewTokensLeft>0&&d.totalMatchesPlayed<=2?"SCREW":"GENERAL",badgeLabel:b.shortPill,text:b.ruleHook};this.boardSession={node:e,episode:t,challenger:o,board:h,acceptDare:s,dareCompleted:!1,entryFeePaid:a,activeSabotage:p,rng:r,currentStreak:0,bestStreak:0,questionsAnswered:0,questionsCorrect:0,hostLine:b.hostIntroCue,hostPose:"welcome",rivalReactionLine:f,rivalActionBadge:m,newlyUnlockedTileIds:[],triggeredCharmIds:[],lastChallengerAction:null,pendingWheelEffect:"NONE",usedDoubleDownCount:0,usedLifelinesCount:0,sweepsOrBullseyesCount:0,buzzerBeatersCount:0,powerPlaysWonCount:0,trailedAtAnyPoint:!1,onboardingTip:v},this.audio.playRandomHostCategoryVoice("board_welcome"),this.renderCurrentStageBoard()}renderCurrentStageBoard(){const e=this.boardSession;if(!e||!this.boardStageView)return;this.currentScreen="STAGE_BOARD";const t=this.campaign.getState();this.boardRulesPromise?.then(i=>{if(!this.boardSession||this.boardSession!==e||!this.boardStageView)return;const s=e.board.charms.equippedCharms.map(r=>i.getPodiumCharmSpecV5(r)),a=e.pendingWheelEffect==="DOUBLE_POT"?"2× DOUBLE POT ARMED":e.pendingWheelEffect==="HOT_SEAT_ALL_IN"?"ALL-IN 2× ARMED":null;this.boardStageView.render({episode:e.episode,board:e.board,challenger:e.challenger,hostLine:e.hostLine,hostPose:e.hostPose,onboardingTip:e.onboardingTip,rivalReactionLine:e.rivalReactionLine,rivalActionBadge:e.rivalActionBadge,currentStreak:e.currentStreak,audioEnabled:this.isMasterAudioOn(),screwsRemaining:e.board.playerScrewTokensLeft,equippedCharms:s,triggeredCharmIds:e.triggeredCharmIds,activeDare:e.node.optionalDare??null,dareCompleted:e.dareCompleted,newlyUnlockedTileIds:e.newlyUnlockedTileIds,lastChallengerAction:e.lastChallengerAction,activeWheelBoostLabel:a,playerDisplayName:t.contestantName,boardTwistId:e.board.boardTwistId,boardTwistLabel:e.board.boardTwistLabel,tileMetaById:e.board.tileMetaById,tugOfWarTurf:e.board.tugOfWarTurf},{onSelectTile:r=>{this.handleSelectBoardTile(r)},onScrewTile:r=>{this.handleScrewRivalOnTile(r)},onScrewModeChange:r=>{this.audio.playBoardCue("switch_clack"),this.haptics.uiTap(),r&&this.boardStageView?.setHostSpeech("SCREW RIVAL ARMED! Tap any open tile in your opponent’s weak subject to force them onto the hot seat!","hype")},onCharmInspect:r=>{this.audio.playSfx("ui_tap"),this.boardStageView?.setHostSpeech(`${r.name}: ${r.effectSummary}`,"welcome")},onBackToMap:()=>{this.audio.playSfx("ui_tap"),this.showTourTrunkPinboard(e.node.actNumber)},onToggleAudio:()=>{this.toggleMasterAudio(),this.renderCurrentStageBoard()},onOpenHowToPlay:()=>{this.audio.playSfx("ui_tap"),this.boardStageView?.openHowToPlayModal()}}),e.triggeredCharmIds=[],e.newlyUnlockedTileIds=[]})}async handleScrewRivalOnTile(e){const t=this.boardSession;if(!t||!this.boardStageView)return;const[,o]=await this.ensureBoardModules(),i=this.boardStageView.getTileCenterViewportCoords(e),s=o.executePlayerScrewOnTile(t.board,e,{challenger:t.challenger??t.board.challengerId,rng:t.rng});if(!s.executed){this.audio.playBoardCue("wrong_answer"),this.boardStageView.setHostSpeech(s.errorReason??"Choose an open tile to Screw Rival!","wince");return}if(this.audio.playBoardCue("screw_slam"),this.haptics.shatterPlate(),this.audio.playRandomHostCategoryVoice("screw_slammed"),i&&this.vfx.fireScrewSlam(i.x,i.y,!0),s.shatteredNeighborTileIds.length>0&&i){this.audio.playBoardCue("padlock_break");const a=s.shatteredNeighborTileIds.map(r=>this.boardStageView?.getTileCenterViewportCoords(r)).filter(r=>!!r).map(r=>({xPx:r.x,yPx:r.y}));for(const r of s.shatteredNeighborTileIds)this.boardStageView.triggerTileShatter(r);a.length>0&&this.vfx.fireChainShatter(i.x,i.y,a)}if(s.lineSweepJackpots.length>0&&(this.audio.playBoardCue("jackpot_sweep"),this.vfx.fireLineJackpotSweep(`+${s.lineSweepJackpots.length*300} STAGE SWEEP!`)),t.board=s.board,t.hostLine=s.hostLine,t.hostPose=s.outcome==="CHOKED"?"hype":"wince",t.rivalReactionLine=s.challengerLine,t.rivalActionBadge=s.outcome==="CHOKED"?`SCREW LANDED! +${s.playerScoreDelta} PTS`:`SCREW BACKFIRED! RIVAL +${s.rivalScoreDelta}`,t.newlyUnlockedTileIds=s.shatteredNeighborTileIds,t.onboardingTip=null,this.evaluateLiveShowmanDare(t),t.board.isBoardComplete){this.renderCurrentStageBoard(),window.setTimeout(()=>{this.presentBoardCurtainCall()},950);return}this.renderCurrentStageBoard()}async handleSelectBoardTile(e){const t=this.boardSession;if(!t||!this.boardStageView)return;const o=t.board.forcedTileId&&t.board.forcedTileId!==e?t.board.forcedTileId:e,i=t.board.tiles.find(n=>n.tileId===o);if(!i||i.status!=="OPEN"){this.audio.playSfx("ui_tap");return}const s=t.board.columns[i.colIndex];if(s&&s.frozenTurnsRemaining>0){this.audio.playBoardCue("wrong_answer"),this.boardStageView.setHostSpeech(`That "${s.wittyTitle}" column is frozen for ${s.frozenTurnsRemaining} more turn!`,"wince");return}this.audio.playBoardCue("tile_flip"),this.haptics.uiTap(),t.onboardingTip=null;const[,a,r]=await this.ensureBoardModules();if(t.board.boardTwistId==="spotlight_roulette"&&!t.board.forcedTileId&&await this.boardStageView.animateSpotlightRoulette(i.tileId,650),i.twist==="WHEEL_CURVEBALL"){const n=a.spinCurveballWheelV5(t.board,t.rng);this.boardStageView.openStageWheelModal({outcome:n.outcome,outcomeHeadline:n.sliceMeta.label,outcomeDescription:n.banner,hostPrompt:"Give the brass Stage Wheel a spin before your clue!"},{onSpinStart:()=>this.audio.playBoardCue("wheel_tick"),onTick:()=>this.audio.playBoardCue("wheel_tick"),onSpinComplete:()=>{this.boardStageView?.closeModal(),t.board=n.board,t.pendingWheelEffect=n.nextTileEffect,n.unlockedTileIds.length>0&&this.audio.playBoardCue("padlock_break"),n.awardedWedge&&this.audio.playBoardCue("wedge_earned"),this.launchBoardTileQuestion(i,s??null,null)}});return}if(i.twist==="POWER_PLAY"){this.audio.playBoardCue("power_play"),this.audio.playRandomHostCategoryVoice("power_play");const n=r.getPowerPlayWagerBounds(t.board.playerScore),c=s??{colIndex:i.colIndex,domainId:i.domainId,wedgeId:i.wedgeId,wittyTitle:"Power Play Spotlight",topicSubtitle:"Stage Wager",frozenTurnsRemaining:0,pickedBy:"SHOW"};this.boardStageView.openPowerPlayDialModal({column:c,tile:i,playerScore:t.board.playerScore,minWager:n.minWager,maxWager:n.maxWager,hostLine:"Turn the brass dial to lock your Power-Play stake!"},{onWagerChange:()=>this.audio.playBoardCue("wheel_tick"),onLockWager:d=>{this.audio.playBoardCue("lock_in"),this.boardStageView?.closeModal(),this.launchBoardTileQuestion(i,c,d)}});return}await this.launchBoardTileQuestion(i,s??null,null)}async launchBoardTileQuestion(e,t,o){const i=this.boardSession;if(!i)return;const[[s,a,r,n],[,c]]=await Promise.all([this.ensureQuestionModules(),this.ensureBoardModules()]),d=await r.drawQuestionCardV4({format:e.format,domainId:e.domainId,wedgeId:e.wedgeId,difficultyTier:Xe(i.node.tierNumber),isLightningBlitz:e.twist==="LIGHTNING_BLITZ",excludeQids:this.usedQidsThisSession});this.usedQidsThisSession.add(d.qid);const h=t?{...d,wittyHeader:t.wittyTitle}:d,p=c.getPreQuestionCharmModifiers(i.board,{domainId:e.domainId,format:h.format,choices:h.choices??h.escalator?.choices??h.visualSpotter?.choices,correctIndex:h.correctIndex??h.escalator?.correctIndex??h.visualSpotter?.correctIndex,rng:i.rng});this.stopQuestionClock(),this.spotlightRenderer?.dispose(),this.spotlightRenderer=new s.SpotlightLozengeRendererV5(this.uiRoot),this.currentScreen="SPOTLIGHT_QUESTION";const f=i.pendingWheelEffect==="DOUBLE_POT"||i.pendingWheelEffect==="HOT_SEAT_ALL_IN"?2:1,m=i.board.tileMetaById[e.tileId]?.displayPointsOverride??e.pointValue;let b=!1;const v=this.spotlightRenderer;v.mountQuestion({card:h,tilePointValue:m,timerMode:this.timerMode,lifelines5050Left:i.board.lifelines5050Left,lifelinesHintLeft:i.board.lifelinesHintLeft,currentStreak:i.currentStreak,activeWagerPoints:o??void 0,doublePotMultiplier:f>1?f:void 0,isLightningBlitz:e.twist==="LIGHTNING_BLITZ",isCrownWedgeTile:e.twist==="CROWN_WEDGE",isRivalBountyTile:e.twist==="RIVAL_BOUNTY",venueLabel:`${i.node.venueName} · ${i.board.boardTwistLabel}`,questionCounterLabel:`TURN ${i.board.turnNumber+1}/${i.board.maxTurns}`,tierNumber:i.node.tierNumber,venueBackdropUrl:N[i.node.tierNumber],challengerId:i.node.challengerId,challengerName:i.challenger?.name,hostPose:o?"hype":"welcome",coachWhisper:p.activeCharms.length>0?p.activeCharms.map(S=>S.description).join(" · "):null,customGadgetMounter:(S,C)=>a.mountTactileGadgetV5(S,C.card,{onInteractionFeedback:g=>C.emitFeedback(g),onSubmit:g=>C.submit(g),getDoubleDownArmed:()=>v.getDoubleDownArmed()})??void 0},{onInteractionFeedback:S=>{S==="lock_in"?this.audio.playBoardCue("lock_in"):S==="dial"?this.audio.playBoardCue("wheel_tick"):S==="pair"||S==="reorder"?this.audio.playBoardCue("switch_clack"):this.audio.playSfx("ui_tap")},onUse5050:()=>{const S=c.consumeBoardLifelineV5(i.board,"5050");S.consumed&&(i.board=S.board,i.usedLifelinesCount+=1,this.audio.playBoardCue("switch_clack"),v.apply5050Elimination())},onUseHint:()=>{const S=c.consumeBoardLifelineV5(i.board,"HINT");S.consumed&&(i.board=S.board,i.usedLifelinesCount+=1,this.audio.playBoardCue("switch_clack"),v.revealHint(h.helpfulHint))},onDoubleDownToggle:S=>{this.audio.playBoardCue("switch_clack"),S&&this.audio.playRandomHostCategoryVoice("double_down")},onSubmit:async S=>{if(b)return;b=!0;const C=this.getRemainingClockSecSnapshot(h,p.shotClockBonusSec);this.stopQuestionClock();const w=r.evaluateSubmissionV4(h,S,m),g=i.board.forcedTileId===e.tileId,A=c.resolveTileResultV5(i.board,e.tileId,w,{currentStreak:i.currentStreak,doubleDownArmed:!!(S.doubleDownArmed&&o===null),powerPlayWager:o,wheelEffect:i.pendingWheelEffect,elapsedSec:S.elapsedSec,secondsRemaining:C,timedOut:S.timedOut,rng:i.rng});i.pendingWheelEffect="NONE",i.board=A.board,i.questionsAnswered+=1,S.doubleDownArmed&&(i.usedDoubleDownCount+=1),(S.used5050||S.usedHint)&&(i.usedLifelinesCount+=1);const k=A.charmResult.evaluated;k.isCorrect?(i.questionsCorrect+=1,i.currentStreak=A.newStreak,i.bestStreak=Math.max(i.bestStreak,i.currentStreak),k.isBullseyeOrSweep&&(i.sweepsOrBullseyesCount+=1),C>0&&C<=2.5&&(i.buzzerBeatersCount+=1),o&&o>0&&(i.powerPlaysWonCount+=1),this.playStreakSfx(i.currentStreak),this.audio.playAudienceReaction(i.node.tierNumber,i.currentStreak>=3||k.isBullseyeOrSweep?"roar":"applause"),this.haptics.correctBloom(),i.currentStreak===3?this.audio.playRandomHostCategoryVoice("streak_3"):i.currentStreak===4?this.audio.playRandomHostCategoryVoice("streak_4"):i.currentStreak>=5?this.audio.playRandomHostCategoryVoice("streak_5"):C>0&&C<=2.2&&this.audio.playRandomHostCategoryVoice("buzzer_beater")):(i.currentStreak=0,this.audio.playBoardCue("wrong_answer"),(S.doubleDownArmed||o&&o>0)&&this.audio.playAudienceReaction(i.node.tierNumber,"gasp"),this.haptics.wrongThud(!!S.doubleDownArmed),this.audio.playRandomHostCategoryVoice("tough_miss")),i.newlyUnlockedTileIds=A.unlockedTileIds,i.triggeredCharmIds=A.charmResult.triggeredCharms.map(O=>O.charmId);const _=n.pickBestTurnQuip(null,{won:k.isCorrect,format:h.format,twist:o?"POWER_PLAY":e.twist,elapsedSec:S.elapsedSec,secondsRemaining:this.timerMode==="STANDARD"?C:void 0,doubleDownArmed:S.doubleDownArmed,isBullseyeOrSweep:k.isBullseyeOrSweep,wasForcedSpotlight:g,escalatorCluesRevealed:S.escalatorCluesRevealed,earnedWedge:!!A.awardedWedge,currentStreak:i.currentStreak,domainId:h.domainId,domainName:h.categoryLabel,rivalName:i.challenger?.name,rng:i.rng}).text;i.hostLine=_,i.hostPose=k.isCorrect?"hype":"wince",this.evaluateLiveShowmanDare(i),this.recordAnalyticsAndFeats({card:h,evaluated:k,submission:S,modeLabel:"WORLD_TOUR_V5",hubId:i.node.nodeId,powerPlayWager:o??void 0,padlocksBroken:A.unlockedTileIds.length,survivedChallengerTrap:!!(g&&k.isCorrect),awardedWedge:A.awardedWedge,totalBoardWedgesNow:i.board.earnedWedges.length});const E=A.charmResult.triggeredCharms.length>0?A.charmResult.triggeredCharms.map(O=>`${O.name} (${O.effectTag})`).join(" · "):A.lineSweepJackpots.length>0?`STAGE SWEEP JACKPOT +${A.lineSweepJackpotPoints} PTS!`:void 0;v.showReveal({evaluation:{...k,netPointsDelta:A.totalPlayerScoreDelta},hostQuip:_,hostSpeakerName:"Max Sterling",funFactWhy:h.funFactWhy,wedgeAwarded:A.awardedWedge,charmingTagLabel:E,hostPoseOverride:k.isCorrect?"hype":"wince",nextButtonLabel:i.board.isBoardComplete?"FINAL SCOREBOARD":"BACK TO STAGE BOARD"})},onNext:()=>{this.audio.playSfx("ui_tap"),this.advanceAfterBoardQuestion()}}),p.autoEliminatedChoiceIndex!==null&&v.apply5050Elimination([p.autoEliminatedChoiceIndex]),this.startQuestionClock(v,h.recommendedSec+p.shotClockBonusSec,async()=>{b||v.submitExternalAnswer({format:h.format,timedOut:!0,doubleDownArmed:v.getDoubleDownArmed()})})}async advanceAfterBoardQuestion(){const e=this.boardSession;if(!e){this.showGreenRoomHub();return}if(this.spotlightRenderer?.dispose(),this.spotlightRenderer=null,e.board.isBoardComplete){await this.presentBoardCurtainCall();return}if(e.challenger&&e.board.hasActiveRival){const[,t]=await this.ensureBoardModules();let o=null;try{o=(await this.ensureMetaSuite()).getPlayerStatProfileForHost()}catch{o=null}const i=t.runChallengerTurnV5(e.board,e.challenger,o,e.rng);if(e.board=i.board,e.lastChallengerAction=i.action,e.rivalReactionLine=i.action.banterLine,e.board.playerScore<e.board.rivalScore&&(e.trailedAtAnyPoint=!0),i.rivalScrewResult?.triggered?(this.audio.playBoardCue("rival_trap"),e.rivalActionBadge=i.rivalScrewResult.blockedByScrewShield?"SCREW SHIELD BLOCKED RIVAL!":"RIVAL SCREW DEPLOYED!",i.rivalScrewResult.blockedByScrewShield&&e.triggeredCharmIds.push("screw_shield")):i.blockedFreezeByScrewShield?(e.rivalActionBadge="SCREW SHIELD BLOCKED FREEZE!",e.triggeredCharmIds.push("screw_shield")):i.action.rivalPointsDelta>0?e.rivalActionBadge=`${e.challenger.name.toUpperCase()} +${i.action.rivalPointsDelta} PTS`:e.rivalActionBadge=`${e.challenger.name.toUpperCase()} MISSED!`,e.board.isBoardComplete){await this.presentBoardCurtainCall();return}}if(this.renderCurrentStageBoard(),e.newlyUnlockedTileIds.length>0&&this.boardStageView){const t=e.newlyUnlockedTileIds.map(o=>this.boardStageView?.getTileCenterViewportCoords(o)).filter(o=>!!o);t.length>0&&(this.audio.playBoardCue("padlock_break"),this.vfx.fireChainShatter(t[0].x,t[0].y,t.map(o=>({xPx:o.x,yPx:o.y}))))}}evaluateLiveShowmanDare(e){const t=e.node.optionalDare;if(!t||e.dareCompleted)return;const o=t.conditionKind,i=e.board;(o==="USE_SCREW_SUCCESSFULLY"&&i.playerSuccessfulScrews>=1||o==="WIN_DOUBLE_DOWN"&&e.usedDoubleDownCount>=1&&e.questionsCorrect>=1||o==="REACH_STREAK_4"&&e.bestStreak>=4||o==="EARN_3_WEDGES"&&i.earnedWedges.length>=3||o==="CLEAR_FULL_LINE"&&i.totalLineSweepJackpotPoints>0||o==="WIN_POWER_PLAY"&&e.powerPlaysWonCount>=1)&&(e.dareCompleted=!0)}async presentBoardCurtainCall(){const e=this.boardSession;if(!e||!this.boardStageView)return;const[,,t,,o]=await this.ensureBoardModules(),s=t.evaluateBoardOutcome(e.board).playerWon;e.node.optionalDare&&!e.dareCompleted&&s&&e.node.optionalDare.conditionKind==="NO_LIFELINES_USED"&&e.usedLifelinesCount===0&&(e.dareCompleted=!0);const a=e.questionsAnswered>0?Math.round(e.questionsCorrect/e.questionsAnswered*100):0,r=this.campaign.recordMatchOutcome({nodeId:e.node.nodeId,won:s,playerScore:e.board.playerScore,rivalScore:e.board.rivalScore,accuracyPct:a,wedgesEarned:e.board.earnedWedges.length,sweepsOrBullseyes:e.sweepsOrBullseyesCount+e.board.paidOutRowIndices.length+e.board.paidOutColIndices.length,dareCompleted:e.dareCompleted,screwsLanded:e.board.playerSuccessfulScrews,usedDoubleDown:e.usedDoubleDownCount>0,entryFeeAlreadyPaid:e.entryFeePaid});s?(this.vfx.setStageMood(e.node.tierNumber,"jackpot"),this.vfx.fireConfettiOvation(3800),this.playStreakSfx(5),this.audio.playAudienceReaction(e.node.tierNumber,"roar"),this.audio.playRandomHostCategoryVoice(r.endingResolution?"ending_crown":"match_win")):(this.audio.playAudienceReaction(e.node.tierNumber,"applause"),this.audio.playRandomHostCategoryVoice("redemption"));const n=o.generatePostMatchHeadlines({episodeId:e.episode.episodeId,contestantName:r.state.contestantName,won:s,playerScore:e.board.playerScore,rivalScore:e.board.hasActiveRival?e.board.rivalScore:void 0,starsEarned:r.starsEarned,wedgesEarned:e.board.earnedWedges.length,buzzerBeatersCount:e.buzzerBeatersCount,instantSnipesCount:0,match4SweepsCount:e.sweepsOrBullseyesCount,sort4PerfectsCount:0,pinpointBullseyesCount:0,clue1SnipesCount:0,powerPlaysWon:e.powerPlaysWonCount,doubleDownsWon:e.usedDoubleDownCount,doubleDownsBlown:0,weakDomainUpsets:e.board.playerSuccessfulScrews,weakDomainName:null,wasComebackWin:!!(s&&e.trailedAtAnyPoint),bestStreakInMatch:e.bestStreak,rng:e.rng}),c=o.pickMatchWrapQuip(s,e.rng).text,d=this.campaign.getRecommendedNextNode(r.state),h=async f=>{if(r.endingResolution){await this.playInteractiveStoryScene(r.endingResolution.scene,{continueButtonLabel:"RETURN TO TOUR TRUNK",onFinished:()=>{this.showTourTrunkPinboard(5)}});return}f==="NEXT"&&d?await this.launchCampaignNode(d.nodeId,!1):f==="HOME"?this.showGreenRoomHub():await this.showTourTrunkPinboard(d?.actNumber??e.node.actNumber)},p=async f=>{if(r.postMatchSceneId){const m=this.campaign.getScene(r.postMatchSceneId);if(m){await this.playInteractiveStoryScene(m,{continueButtonLabel:r.endingResolution?"WORLD CORONATION":"CONTINUE TOUR",onFinished:()=>{h(f)}});return}}await h(f)};this.boardStageView.renderPostMatchCurtainCall({episode:e.episode,didWin:s,starsEarned:r.starsEarned,playerScore:e.board.playerScore,rivalScore:e.board.rivalScore,soloTargetScore:e.board.soloTargetScore,hasActiveRival:e.board.hasActiveRival,challenger:e.challenger,earnedWedges:e.board.earnedWedges,accuracyPct:a,bestStreak:e.bestStreak,audienceDelta:r.audienceDelta,totalAudienceNow:r.state.liveWorldAudience,prizeEarnedUsd:Math.max(0,r.bankrollDeltaUsd),headlines:n.map(f=>`[${f.outlet}] ${f.headline} — ${f.subline}`),hostClosingQuip:c,rivalClosingLine:e.challenger?s?e.challenger.loseMatchLine:e.challenger.winMatchLine:void 0,hasNextEpisode:!!d,dareCompleted:e.dareCompleted,dareDescription:e.node.optionalDare?.description,dareBonusUsd:r.dareBonusUsd,newspaperMasthead:`${e.node.cityStamp} BROADCAST CHRONICLE`,nextStageLabel:d?`NEXT: ${d.showTitle}`:"TOUR TRUNK MAP",redemptionNote:s?r.unlockedCharms.length>0?`NEW PODIUM CHARM UNLOCKED: ${r.unlockedCharms.join(", ")}`:void 0:"FAIL-FORWARD CIRCUIT OPEN: Your crimson Late-Night Redemption route is live in the Tour Trunk!"},{onNextEpisode:d?()=>{this.audio.playBoardCue("switch_clack"),p("NEXT")}:void 0,onRematch:()=>{this.audio.playBoardCue("switch_clack"),!s&&r.canOfferContractMulligan&&this.campaign.invokeContractMulligan(e.node.nodeId),this.launchCampaignNode(e.node.nodeId,e.acceptDare)},onOpenWorldTourMap:()=>{this.audio.playBoardCue("polaroid_pin"),p("MAP")},onBackHome:()=>{this.audio.playSfx("ui_tap"),p("HOME")}})}async openTopicJukebox(e){const t=await this.ensureJukeboxModule();this.teardownActiveViews(),this.currentScreen="TOPIC_JUKEBOX",this.audio.setMusicCue("greenroom"),this.jukeboxView=new t.TopicJukeboxView(this.uiRoot),this.jukeboxView.mount({onStartCustomShow:o=>{this.audio.playBoardCue("switch_clack"),this.haptics.lockThunk(),this.formatMode=o.formatMode,this.timerMode=o.timerPace,j(ve,o.formatMode),j(ye,o.timerPace),this.startCustomTopicShow(o)},onClose:()=>{this.audio.playSfx("ui_tap"),this.showGreenRoomHub()},onChangeFormatMode:o=>{this.formatMode=o,j(ve,o)},onChangeTimerPace:o=>{this.timerMode=o,j(ye,o)},onToggleFullscreen:()=>{this.toggleFullscreen()},onInteractionFeedback:o=>{o==="dial_tick"?this.audio.playBoardCue("wheel_tick"):o==="switch_flip"||o==="lever_pull"?this.audio.playBoardCue("switch_clack"):this.audio.playSfx("ui_tap")}},{mode:"page",initialDomainId:e?.initialDomainId??null,initialSearchQuery:e?.initialSearchQuery??"",initialFormatMode:this.formatMode,initialTimerPace:this.timerMode})}async startCustomTopicShow(e){this.audio.playStageSymphony(3,"MAIN_STAGE");const t=e.l0DomainId??e.domains[0]??null;this.linearSession={mode:"CUSTOM_SHOW",title:e.selectionLabel||"Custom Topic Show",venueLabel:`Topic Jukebox · ${e.selectionLabel||"All 12 Domains"}`,tierNumber:3,totalQuestions:e.count,questionIndex:0,score:0,currentStreak:0,bestStreak:0,correctCount:0,answeredCount:0,livesRemaining:99,lifelines5050Left:2,lifelinesHintLeft:2,earnedWedges:[],formatMode:e.formatMode,timerPace:e.timerPace,domainId:t,subcategoryId:e.l2TopicId??e.l1SubcategoryId??null,difficultyPreset:e.difficulty,prebuiltDeck:null,srsDeck:null,answerResults:[]},await this.presentNextLinearQuestion()}async startDailyBroadcast(){const[,,e]=await this.ensureQuestionModules(),t=we(),o=to(t),i=await e.drawQuestionDeckV4(10,{seed:o,difficultyTier:"COLLEGE"});this.audio.playStageSymphony(4,"MAIN_STAGE"),this.linearSession={mode:"DAILY",title:`Daily Show #${J()}`,venueLabel:`Global Daily Broadcast · ${t}`,tierNumber:4,totalQuestions:i.length,questionIndex:0,score:0,currentStreak:0,bestStreak:0,correctCount:0,answeredCount:0,livesRemaining:99,lifelines5050Left:2,lifelinesHintLeft:2,earnedWedges:[],formatMode:"VARIETY_MIX",timerPace:this.timerMode,domainId:null,subcategoryId:null,difficultyPreset:"COLLEGE",prebuiltDeck:i,srsDeck:null,answerResults:[]},await this.presentNextLinearQuestion()}async startEndlessStreak(){this.audio.playStageSymphony(6,"MAIN_STAGE"),this.linearSession={mode:"ENDLESS",title:"Endless Streak Survival",venueLabel:"High-Voltage Survival Stage · 3 Strikes",tierNumber:6,totalQuestions:Number.POSITIVE_INFINITY,questionIndex:0,score:0,currentStreak:0,bestStreak:0,correctCount:0,answeredCount:0,livesRemaining:3,lifelines5050Left:3,lifelinesHintLeft:3,earnedWedges:[],formatMode:this.formatMode,timerPace:this.timerMode,domainId:null,subcategoryId:null,difficultyPreset:"ADAPTIVE",prebuiltDeck:null,srsDeck:null,answerResults:[]},await this.presentNextLinearQuestion()}async startSrsReviewDeck(e){!e||e.length===0||(this.audio.playStageSymphony(5,"VELVET_SALON"),this.linearSession={mode:"SRS_REVIEW",title:"Mastery Recall Salon",venueLabel:"Spaced-Repetition Recall Stage",tierNumber:5,totalQuestions:e.length,questionIndex:0,score:0,currentStreak:0,bestStreak:0,correctCount:0,answeredCount:0,livesRemaining:99,lifelines5050Left:2,lifelinesHintLeft:2,earnedWedges:[],formatMode:"CLASSIC_4_ONLY",timerPace:"RELAXED_UNTIMED",domainId:null,subcategoryId:null,difficultyPreset:"ADAPTIVE",prebuiltDeck:null,srsDeck:[...e],answerResults:[]},await this.presentNextLinearQuestion())}async presentNextLinearQuestion(){const e=this.linearSession;if(!e){this.showGreenRoomHub();return}if(e.questionIndex>=e.totalQuestions||e.mode==="ENDLESS"&&e.livesRemaining<=0){this.renderLinearCurtainSummary(e);return}const[t,o,i,s]=await this.ensureQuestionModules();let a;if(e.prebuiltDeck&&e.prebuiltDeck[e.questionIndex])a=e.prebuiltDeck[e.questionIndex];else if(e.srsDeck&&e.srsDeck[e.questionIndex]){const p=e.srsDeck[e.questionIndex],f=Math.max(0,Math.min(11,p.domainId||0)),m=[p.correctAnswer,...p.distractors??[]].slice(0,4);for(;m.length<4;)m.push(`Option ${m.length+1}`);const b=We(p.qid+e.questionIndex*31);for(let C=m.length-1;C>0;C-=1){const w=Math.floor(b()*(C+1));[m[C],m[w]]=[m[w],m[C]]}const v=[m[0],m[1],m[2],m[3]],S=Math.max(0,v.indexOf(p.correctAnswer));a={qid:p.qid,format:"MULTIPLE_CHOICE",domainId:f,wedgeId:it(f),categoryLabel:p.subcatLabel||"Mastery Recall",wittyHeader:"Mastery Recall Check",difficultyTier:"COLLEGE",recommendedSec:30,readInGraceSec:2,prompt:p.prompt,helpfulHint:p.whyExplanation||"Recall your earlier studio miss!",funFactWhy:p.whyExplanation||`Verified answer: ${p.correctAnswer}.`,choices:v,correctIndex:S}}else a=await i.drawQuestionCardV4({format:e.formatMode==="CLASSIC_4_ONLY"?"MULTIPLE_CHOICE":void 0,domainId:e.domainId??void 0,subcategoryId:e.subcategoryId??void 0,difficultyTier:io(e.difficultyPreset,e.currentStreak),excludeQids:this.usedQidsThisSession,preferDynamicShards:e.mode==="ENDLESS"&&e.questionIndex>=8}),this.usedQidsThisSession.add(a.qid);this.teardownActiveViews(),this.currentScreen="SPOTLIGHT_QUESTION",this.spotlightRenderer=new t.SpotlightLozengeRendererV5(this.uiRoot);const r=this.spotlightRenderer,n=e.mode==="ENDLESS"?`STREAK ${e.currentStreak} · ${e.livesRemaining} LIVES`:`CLUE ${e.questionIndex+1} OF ${e.totalQuestions}`,c=e.coachWhispers?.[e.questionIndex]??null;let d=!1;const h=200+Math.min(400,e.currentStreak*50);r.mountQuestion({card:a,tilePointValue:h,timerMode:e.timerPace,lifelines5050Left:e.lifelines5050Left,lifelinesHintLeft:e.lifelinesHintLeft,currentStreak:e.currentStreak,venueLabel:e.venueLabel,questionCounterLabel:n,tierNumber:e.tierNumber,venueBackdropUrl:N[e.tierNumber],hostPose:"welcome",coachWhisper:c,customGadgetMounter:(p,f)=>o.mountTactileGadgetV5(p,f.card,{onInteractionFeedback:b=>f.emitFeedback(b),onSubmit:b=>f.submit(b),getDoubleDownArmed:()=>r.getDoubleDownArmed()})??void 0},{onInteractionFeedback:p=>{p==="lock_in"?this.audio.playBoardCue("lock_in"):p==="dial"?this.audio.playBoardCue("wheel_tick"):p==="pair"||p==="reorder"?this.audio.playBoardCue("switch_clack"):this.audio.playSfx("ui_tap")},onUse5050:()=>{e.lifelines5050Left<=0||(e.lifelines5050Left-=1,this.audio.playBoardCue("switch_clack"),r.apply5050Elimination())},onUseHint:()=>{e.lifelinesHintLeft<=0||(e.lifelinesHintLeft-=1,this.audio.playBoardCue("switch_clack"),r.revealHint(a.helpfulHint))},onDoubleDownToggle:p=>{this.audio.playBoardCue("switch_clack"),p&&this.audio.playRandomHostCategoryVoice("double_down")},onSubmit:async p=>{if(d)return;d=!0,this.stopQuestionClock();const f=i.evaluateSubmissionV4(a,p,h);if(e.answeredCount+=1,e.answerResults.push(f.isCorrect),e.score=Math.max(0,e.score+f.netPointsDelta),f.isCorrect){if(e.correctCount+=1,e.currentStreak+=1,e.bestStreak=Math.max(e.bestStreak,e.currentStreak),e.mode==="ENDLESS"){const v=Math.max(0,Number(Z(ke)||0));e.bestStreak>v&&j(ke,String(e.bestStreak))}this.playStreakSfx(e.currentStreak),this.audio.playAudienceReaction(e.tierNumber,e.currentStreak>=3?"roar":"applause"),this.haptics.correctBloom()}else e.currentStreak=0,e.mode==="ENDLESS"&&(e.livesRemaining-=1),this.audio.playBoardCue("wrong_answer"),this.haptics.wrongThud(!!p.doubleDownArmed);this.recordAnalyticsAndFeats({card:a,evaluated:f,submission:p,modeLabel:e.mode});const m=s.pickBestTurnQuip(null,{won:f.isCorrect,format:a.format,twist:"NONE",elapsedSec:p.elapsedSec,doubleDownArmed:p.doubleDownArmed,isBullseyeOrSweep:f.isBullseyeOrSweep,wasForcedSpotlight:!1,escalatorCluesRevealed:p.escalatorCluesRevealed,earnedWedge:!1,currentStreak:e.currentStreak,domainId:a.domainId,domainName:a.categoryLabel}).text,b=e.questionIndex+1>=e.totalQuestions||e.mode==="ENDLESS"&&e.livesRemaining<=0;r.showReveal({evaluation:f,hostQuip:m,hostSpeakerName:"Max Sterling",funFactWhy:a.funFactWhy,hostPoseOverride:f.isCorrect?"hype":"wince",nextButtonLabel:b?"CURTAIN CALL SUMMARY":"NEXT SPOTLIGHT CLUE"})},onNext:()=>{this.audio.playSfx("ui_tap"),e.questionIndex+=1,this.presentNextLinearQuestion()}}),this.startQuestionClock(r,a.recommendedSec,async()=>{d||r.submitExternalAnswer({format:a.format,timedOut:!0,doubleDownArmed:r.getDoubleDownArmed()})})}renderLinearCurtainSummary(e){this.teardownActiveViews(),this.currentScreen="CURTAIN_SUMMARY",so(),e.mode==="AUDITION_WARMUP"?this.campaign.completeColdOpen():e.mode==="DAILY"&&j(`${Ue}${we()}`,"1"),e.correctCount>=Math.max(1,Math.ceil(e.answeredCount*.6))&&(this.vfx.fireConfettiOvation(3200),this.audio.playAudienceReaction(e.tierNumber,"roar"));const t=e.answeredCount>0?Math.round(e.correctCount/e.answeredCount*100):0,o=e.answerResults.slice(0,20).map((r,n)=>`<span class="v5-curtain-pip ${r?"is-hit":"is-miss"}" title="Clue ${n+1}">${r?"OK":"X"}</span>`).join(""),i=e.mode==="AUDITION_WARMUP"?"Max Sterling & Producer Sam stamped your Oakridge stage pass — Act I of the World Championship Tour is now live!":e.mode==="DAILY"?`Broadcast #${J()} complete — share your clean studio scorecard or step back into the Green Room.`:e.mode==="ENDLESS"?`High-voltage survival run locked at a ${e.bestStreak}-clue streak!`:`Completed ${e.answeredCount} spotlight clues at ${t}% accuracy.`,s=e.mode==="AUDITION_WARMUP"?"ENTER ACT I STAGE BOARD":e.mode==="DAILY"?"COPY DAILY SCORECARD":"PLAY AGAIN";this.uiRoot.innerHTML=`
      <section class="v5-curtain-shell" style="background-image:url('${N[e.tierNumber]}')">
        <div class="v5-curtain-plaque" role="region" aria-label="Broadcast Curtain Call">
          <div class="v5-curtain-ribbon">${se(e.venueLabel)}</div>
          <h1 class="v5-curtain-title">${se(e.title)}</h1>
          <p class="v5-curtain-sub">${se(i)}</p>
          <div class="v5-curtain-dials">
            <div class="v5-curtain-dial">
              <span class="v5-curtain-dial-val">${e.score.toLocaleString("en-US")}</span>
              <span class="v5-curtain-dial-lbl">Stage Points</span>
            </div>
            <div class="v5-curtain-dial">
              <span class="v5-curtain-dial-val">${t}%</span>
              <span class="v5-curtain-dial-lbl">Accuracy (${e.correctCount}/${e.answeredCount})</span>
            </div>
            <div class="v5-curtain-dial">
              <span class="v5-curtain-dial-val">${e.bestStreak}</span>
              <span class="v5-curtain-dial-lbl">Best Streak</span>
            </div>
          </div>
          ${o?`<div class="v5-curtain-pips">${o}</div>`:""}
          <div class="v5-curtain-actions">
            <button type="button" class="v5-curtain-btn is-primary" data-curtain-act="primary">${se(s)}</button>
            ${e.mode==="CUSTOM_SHOW"?'<button type="button" class="v5-curtain-btn" data-curtain-act="jukebox">TOPIC JUKEBOX</button>':'<button type="button" class="v5-curtain-btn" data-curtain-act="trunk">OPEN TOUR TRUNK</button>'}
            <button type="button" class="v5-curtain-btn" data-curtain-act="home">GREEN ROOM</button>
          </div>
        </div>
      </section>
    `;const a=this.uiRoot.querySelector('[data-curtain-act="primary"]');a?.addEventListener("click",()=>{if(this.audio.playBoardCue("switch_clack"),e.mode==="AUDITION_WARMUP"){const r=this.campaign.getRecommendedNextNode()??this.campaign.getAllNodes()[0];r?this.launchCampaignNode(r.nodeId,!1):this.showTourTrunkPinboard(1)}else if(e.mode==="DAILY"){const r=e.answerResults.map(c=>c?"[OK]":"[--]").join(""),n=`WORLD'S SMARTEST Daily #${J()} · ${e.score} PTS (${e.correctCount}/${e.answeredCount}) ${r}`;navigator.clipboard?.writeText?.(n).catch(()=>{}),a&&(a.textContent="SCORECARD COPIED!")}else e.mode==="ENDLESS"?this.startEndlessStreak():this.openTopicJukebox({initialDomainId:e.domainId})}),this.uiRoot.querySelector('[data-curtain-act="jukebox"]')?.addEventListener("click",()=>{this.audio.playSfx("ui_tap"),this.openTopicJukebox({initialDomainId:e.domainId})}),this.uiRoot.querySelector('[data-curtain-act="trunk"]')?.addEventListener("click",()=>{this.audio.playBoardCue("polaroid_pin"),this.showTourTrunkPinboard()}),this.uiRoot.querySelector('[data-curtain-act="home"]')?.addEventListener("click",()=>{this.audio.playSfx("ui_tap"),this.showGreenRoomHub()})}activeClockStartedMs=0;activeClockTotalSec=30;activeClockReadInSec=2;getRemainingClockSecSnapshot(e,t=0){if(this.timerMode==="RELAXED_UNTIMED")return e.recommendedSec+t;const o=Math.max(0,(performance.now()-this.activeClockStartedMs)/1e3);return o<=this.activeClockReadInSec?this.activeClockTotalSec:Math.max(0,this.activeClockTotalSec-(o-this.activeClockReadInSec))}startQuestionClock(e,t,o){this.stopQuestionClock();const i=Math.max(10,t);if(this.activeClockTotalSec=i,this.activeClockReadInSec=2,this.activeClockStartedMs=performance.now(),(this.linearSession?.timerPace??this.timerMode)==="RELAXED_UNTIMED"){e.updateClock({phase:"RELAXED",remainingSec:i,totalSec:i});return}e.updateClock({phase:"READ_IN",remainingSec:i,totalSec:i,readInRemainingSec:this.activeClockReadInSec}),this.clockIntervalId=window.setInterval(()=>{if(this.disposed){this.stopQuestionClock();return}const a=(performance.now()-this.activeClockStartedMs)/1e3;if(a<this.activeClockReadInSec){e.updateClock({phase:"READ_IN",remainingSec:i,totalSec:i,readInRemainingSec:Math.max(0,this.activeClockReadInSec-a)});return}const r=a-this.activeClockReadInSec,n=Math.max(0,i-r),c=Math.ceil(n);if(c<=6&&c!==this.lastTickedWholeSec&&(this.lastTickedWholeSec=c,this.audio.playCountdownTick(n)),n<=0){this.stopQuestionClock(),this.audio.playCountdownTick(0),e.updateClock({phase:"TIMEOUT",remainingSec:0,totalSec:i}),o();return}e.updateClock({phase:"ACTIVE",remainingSec:n,totalSec:i})},90)}stopQuestionClock(){this.clockIntervalId!==null&&(window.clearInterval(this.clockIntervalId),this.clockIntervalId=null),this.lastTickedWholeSec=null}async recordAnalyticsAndFeats(e){try{const t=await this.ensureMetaSuite(),{card:o,evaluated:i,submission:s}=e,a=s.elapsedSec<4?0:s.elapsedSec<8?1:s.elapsedSec<14?2:s.elapsedSec<22?3:4;t.recordQuestionOutcome({qid:o.qid,domainId:o.domainId,mode:e.modeLabel,hubId:e.hubId,questionFormat:o.format,difficultyTier:o.difficultyTier,subcatLabel:o.categoryLabel,speedBucketIdx:a,correct:i.isCorrect,peelTier:s.used5050?3:s.usedHint?2:1,overclockCharge01:s.doubleDownArmed?1:0,backfired:!!(s.doubleDownArmed&&!i.isCorrect),bullseye:!!(o.format==="PINPOINT_DIAL"&&i.isBullseyeOrSweep),isBullseyeOrSweep:i.isBullseyeOrSweep,powerPlayWager:e.powerPlayWager,padlocksBroken:e.padlocksBroken,survivedChallengerTrap:e.survivedChallengerTrap,responseTimeMs:Math.round(s.elapsedSec*1e3),pointsDelta:i.netPointsDelta,promptSnippet:o.prompt.slice(0,120),answerLabel:i.correctSummaryLabel});const r=o.choices??o.escalator?.choices??o.visualSpotter?.choices,n=o.correctIndex??o.escalator?.correctIndex??o.visualSpotter?.correctIndex;if(r&&typeof n=="number"){const d=r[n],h=r.filter((p,f)=>f!==n);t.ingestSpacedRepetitionOutcome({qid:o.qid,domainId:o.domainId,subcatLabel:o.categoryLabel,prompt:o.prompt,correctAnswer:d,distractors:h,whyExplanation:o.funFactWhy,wasCorrect:i.isCorrect})}const c=[];i.isCorrect&&(o.format==="MATCH_4"&&i.isBullseyeOrSweep&&c.push("MATCH4_CLEAN_SWEEP"),o.format==="SORT_4"&&i.isBullseyeOrSweep&&c.push("SORT4_PERFECT"),o.format==="MULTI_STRIKE"&&o.multiStrike?.strikeMode==="SPOT_THE_IMPOSTER"&&c.push("IMPOSTER_CAUGHT"),o.format==="PINPOINT_DIAL"&&i.isBullseyeOrSweep&&c.push("PINPOINT_BULLSEYE"),e.powerPlayWager&&e.powerPlayWager>0&&(c.push("POWER_PLAY_WIN"),e.powerPlayWager>=400&&c.push("POWER_PLAY_HIGH_ROLLER")),e.survivedChallengerTrap&&c.push("CHALLENGER_TRAP_SURVIVED")),(e.padlocksBroken??0)>0&&c.push("PADLOCK_SHATTERED"),e.awardedWedge&&c.push("WEDGE_EARNED"),(e.totalBoardWedgesNow??0)>=6&&c.push("SIX_WEDGE_CROWN");for(const d of c)t.recordSpecialFeat(d)}catch{}}async openCareerStats(){(await this.ensureMetaSuite()).openAnalytics("ALL_TIME")}async openHallOfTrophies(){(await this.ensureMetaSuite()).openHonours("TROPHIES_64")}async openSavesSheet(){await this.ensureStoryReady();const[{CampaignSaveSlotsModal:e},t]=await Promise.all([R(()=>import("./ui-modals-CDlOh7Hz.js").then(i=>i.C),__vite__mapDeps([5,1,6,7,8,9,10]),import.meta.url),this.ensureMetaSuite()]);this.savesModalInstance||(this.savesModalInstance=new e(this.audio,this.haptics));const o=()=>{const i=this.campaign.listSlotSummaries(),s=Math.round(t.getPlayerStatProfileForHost().overallAccuracyPct);return i.map(a=>{const r=le[a.activeSponsor]?.name??"Independent";return{slotId:a.slotId,isEmpty:a.isEmpty,isActive:a.isActive,challengerName:a.contestantName,personaLabel:`${r} · ${Ye(a.bankrollUsd)}`,currentActOrCity:`Act ${a.currentAct} · ${a.currentVenueName}`,visasCleared:a.currentAct,relicsUnlocked:a.unlockedCharmsCount,missionsCompleted:a.wonNodesCount,totalMissions:a.totalNodesCount,completionPct:Math.min(100,Math.round(a.wonNodesCount/Math.max(1,a.totalNodesCount)*100)),completionLabel:`${a.wonNodesCount}/${a.totalNodesCount} Stages · ${a.totalStars} Stars`,failedAttemptsCount:a.lostNodesCount,accuracyPct:s,updatedAtLabel:a.updatedAtIso??"Empty"}})};this.savesModalInstance.open({getSlots:o,onSwitchOrStartSlot:i=>{this.campaign.setActiveSlotId(i),this.savesModalInstance?.close(),this.showGreenRoomHub()},onExportSlot:i=>{const s=this.campaign.exportSlotJson(i),a=new Blob([s],{type:"application/json"}),r=URL.createObjectURL(a),n=document.createElement("a");n.href=r,n.download=`worlds_smartest_v5_slot_${i}.json`,n.click(),URL.revokeObjectURL(r)},onImportSlotJson:(i,s)=>this.campaign.importSlotJson(i,s),onResetSlotToStart:i=>{this.campaign.resetSlot(i)},onDeleteSlot:i=>{this.campaign.deleteSlot(i)},onClose:()=>{this.showGreenRoomHub()}})}}const lo=Object.assign({"./pwa/OfflineServiceWorkerClient.ts":()=>R(()=>import("./OfflineServiceWorkerClient-CDDwZGdJ.js"),[],import.meta.url)});function co(){if(typeof window>"u")return;try{if(new URLSearchParams(window.location.search).get("nosw")==="1")return}catch{}const l=()=>{const e=lo["./pwa/OfflineServiceWorkerClient.ts"];if(typeof e=="function"){e().then(t=>t.registerOfflineServiceWorker?.()).catch(()=>{});return}"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{})};document.readyState==="complete"?window.setTimeout(l,0):window.addEventListener("load",()=>{window.setTimeout(l,0)},{once:!0})}function ho(){const l=document.getElementById("canvas-root"),e=document.getElementById("vfx-canvas"),t=document.getElementById("ui-root");if(!l||!e||!t)throw new Error("Missing #canvas-root, #vfx-canvas, or #ui-root mount elements in index.html.");const o=new no(l,e,t);window.addEventListener("beforeunload",()=>{o.dispose()}),co()}ho();export{q as R,le as S,Ve as V,fo as W,N as a,mo as b,it as d,Ye as f};
