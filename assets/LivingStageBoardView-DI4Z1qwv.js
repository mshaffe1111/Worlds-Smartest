import{W as J,V as O,a as ee}from"./index-oAuefNbv.js";import"./systems-DSvNuDuC.js";const te="v5-board-stage-styles",ce=["EMERALD_SCIENCE","MAGENTA_POP","GOLD_HISTORY","VIOLET_ARTS","SAPPHIRE_GEO","ORANGE_SPORTS"],le={EMERALD_SCIENCE:{id:"EMERALD_SCIENCE",jewelName:"Emerald",litHi:"#96ffca",litMid:"#18d474",litDeep:"#09733c",glowHex:"#34f295"},MAGENTA_POP:{id:"MAGENTA_POP",jewelName:"Ruby",litHi:"#ffa3be",litMid:"#eb285c",litDeep:"#8c0c30",glowHex:"#ff4f82"},SAPPHIRE_GEO:{id:"SAPPHIRE_GEO",jewelName:"Sapphire",litHi:"#9be0ff",litMid:"#2489ff",litDeep:"#0c479e",glowHex:"#4cb0ff"},GOLD_HISTORY:{id:"GOLD_HISTORY",jewelName:"Amber",litHi:"#fff3ad",litMid:"#f7b928",litDeep:"#a66808",glowHex:"#ffd452"},VIOLET_ARTS:{id:"VIOLET_ARTS",jewelName:"Violet",litHi:"#e3c7ff",litMid:"#9f52f7",litDeep:"#561b9e",glowHex:"#be7dff"},ORANGE_SPORTS:{id:"ORANGE_SPORTS",jewelName:"Cyan",litHi:"#aef9ff",litMid:"#17cfe6",litDeep:"#087285",glowHex:"#3beeff"}},V={0:{crestTop:"#8f1d2c",crestBottom:"#520c18",crestBorder:"#f0c766",tileHi:"#fdf9f0",tileMid:"#e8e2d8",tileLow:"#cfc5b4",inkHex:"#4f141e",iconAccent:"#992232"},1:{crestTop:"#5b2886",crestBottom:"#311252",crestBorder:"#f0c766",tileHi:"#f4e6ff",tileMid:"#dfc2fa",tileLow:"#c297eb",inkHex:"#3c1561",iconAccent:"#6928a3"},2:{crestTop:"#9c5a18",crestBottom:"#5e3109",crestBorder:"#f7d57d",tileHi:"#fff3cf",tileMid:"#f2d99d",tileLow:"#dcb86c",inkHex:"#4f2a08",iconAccent:"#8a4c11"},3:{crestTop:"#7a1f47",crestBottom:"#420d26",crestBorder:"#f0c766",tileHi:"#fcecf4",tileMid:"#edd0df",tileLow:"#d7a9c1",inkHex:"#471029",iconAccent:"#8a2352"},4:{crestTop:"#166a6d",crestBottom:"#0b3c41",crestBorder:"#f0c766",tileHi:"#e3fafa",tileMid:"#bce8e9",tileLow:"#93cfd2",inkHex:"#0d4045",iconAccent:"#14666b"},5:{crestTop:"#166a45",crestBottom:"#0b3c27",crestBorder:"#f0c766",tileHi:"#e5faef",tileMid:"#c1ebd6",tileLow:"#96d4b6",inkHex:"#0d3d26",iconAccent:"#146e46"},6:{crestTop:"#194d8f",crestBottom:"#0c2a54",crestBorder:"#f0c766",tileHi:"#e8f3ff",tileMid:"#c5dffa",tileLow:"#9bc4f0",inkHex:"#0f2f5c",iconAccent:"#1b58a6"},7:{crestTop:"#246b38",crestBottom:"#113d1e",crestBorder:"#f0c766",tileHi:"#eafae8",tileMid:"#cae8c6",tileLow:"#a3d19d",inkHex:"#154222",iconAccent:"#237039"},8:{crestTop:"#263a75",crestBottom:"#121e42",crestBorder:"#f0c766",tileHi:"#eef1fc",tileMid:"#d3daf2",tileLow:"#b1bde3",inkHex:"#18254d",iconAccent:"#2a4185"},9:{crestTop:"#9c3e1c",crestBottom:"#591e0b",crestBorder:"#f0c766",tileHi:"#fff0e6",tileMid:"#f7d6bf",tileLow:"#e5b393",inkHex:"#4f1c0b",iconAccent:"#9e3b19"},10:{crestTop:"#85182d",crestBottom:"#4a0b19",crestBorder:"#f5cf73",tileHi:"#f7f8fc",tileMid:"#e1e4ee",tileLow:"#c4cadb",inkHex:"#4a111d",iconAccent:"#8c1d30"},11:{crestTop:"#3c2d85",crestBottom:"#1e154a",crestBorder:"#f0c766",tileHi:"#eeeafd",tileMid:"#d4cbf7",tileLow:"#b4a5eb",inkHex:"#251a57",iconAccent:"#4834a6"}},ie=[{outcome:"DOUBLE_POT",shortLabel:"2X NEXT TILE",topFill:"#ffe385",botFill:"#d99a1e",inkHex:"#241403"},{outcome:"FREE_WEDGE_SHARD",shortLabel:"FREE WEDGE",topFill:"#ca94ff",botFill:"#7a34cf",inkHex:"#ffffff"},{outcome:"STEAL_RIVAL_POINTS",shortLabel:"STEAL +250",topFill:"#ff7da4",botFill:"#c72053",inkHex:"#ffffff"},{outcome:"RECHARGE_LIFELINES",shortLabel:"REFILL LIFE",topFill:"#6ef2b8",botFill:"#11915a",inkHex:"#042416"},{outcome:"SHATTER_ALL_LOCKS",shortLabel:"CRACK LOCKS",topFill:"#7ac7ff",botFill:"#1a68c7",inkHex:"#ffffff"},{outcome:"HOT_SEAT_ALL_IN",shortLabel:"ALL-IN 2X",topFill:"#ffb36b",botFill:"#cf5a10",inkHex:"#260d02"}];function r(o){return String(o).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function U(o){if(o>=1e9){const e=o/1e9;return`${e>=10?e.toFixed(0):e.toFixed(1)}B`}if(o>=1e6){const e=o/1e6;return`${e>=10?e.toFixed(0):e.toFixed(1)}M`}if(o>=1e3){const e=o/1e3;return`${e>=10?e.toFixed(0):e.toFixed(1)}K`}return Math.max(0,Math.round(o)).toLocaleString("en-US")}function Y(o){if(o>=1e6){const e=o/1e6;return`$${Number.isInteger(e)?e.toFixed(0):e.toFixed(1)}M`}return`$${Math.max(0,Math.round(o)).toLocaleString("en-US")}`}function ae(o){return Math.max(1,Math.min(8,Math.round(o)))}function Z(o="welcome"){return o==="hype"?O.maxHype:o==="wince"?O.maxWince:O.maxWelcome}function K(o){if(!o)return null;const e=o.id;if(e in O.challengers)return O.challengers[e];const i=o.id.toLowerCase();return i.includes("frankie")?O.challengers.frankie_russo:i.includes("denise")?O.challengers.denise_park:i.includes("trevor")?O.challengers.trevor_blake:i.includes("priya")?O.challengers.priya_nair:i.includes("alistair")?O.challengers.alistair_finch:i.includes("kenji")?O.challengers.kenji_takahashi:i.includes("nadia")?O.challengers.nadia_al_mansoor:i.includes("viktor")||i.includes("julian")?O.challengers.viktor_volkov:o.avatarPortraitUrl||null}function X(o){return(o.name.trim().split(/\s+/)[0]||o.name).toUpperCase()}function de(o){switch(o){case"MULTIPLE_CHOICE":return"Showdown Question";case"MATCH_4":return"Cable Match-4";case"SORT_4":return"Chronology Sort-4";case"MULTI_STRIKE":return"Multi-Strike Grid";case"PINPOINT_DIAL":return"Pinpoint Dial";case"CLUE_ESCALATOR":return"3-Clue Escalator";case"VISUAL_SPOTTER":return"Visual Spotter"}}const re={showcase_starter:"SHOWCASE STAGE",chain_padlocks:"CHAIN-REACTION VAULTS",spiral_labyrinth:"SPIRAL LABYRINTH · 1,000 PT CORE",pyramid_ascent:"PYRAMID ASCENT · SUMMIT CROWN",fog_spotlight:"FOG-OF-WAR SPOTLIGHT",time_bomb_hot_potato:"TIME-BOMB HOT POTATO",tug_of_war_turf:"TERRITORY TURF · +500 MAJORITY",velvet_x_crossroads:"VELVET X-CROSSROADS · 2× DIAGONALS",spotlight_roulette:"SPOTLIGHT ROULETTE SWEEP",power_play_minefield:"POWER-PLAY MINEFIELD",ice_fire_columns:"ICE & FIRE COLUMNS · THAW +200",gold_fever_contagion:"GOLD FEVER CONTAGION · 2× SPREAD",oxford_pick_ban:"OXFORD PICK & BAN DRAFT",championship_gauntlet:"6-COLUMN CHAMPIONSHIP GAUNTLET"},oe={showcase_starter:"SHOWCASE",chain_padlocks:"CHAIN VAULTS",spiral_labyrinth:"LABYRINTH",pyramid_ascent:"PYRAMID",fog_spotlight:"STAGE FOG",time_bomb_hot_potato:"HOT POTATO",tug_of_war_turf:"TURF WAR",velvet_x_crossroads:"X-ROADS 2×",spotlight_roulette:"SPOTLIGHT",power_play_minefield:"MINEFIELD",ice_fire_columns:"ICE & FIRE",gold_fever_contagion:"GOLD FEVER",oxford_pick_ban:"OXFORD DRAFT",championship_gauntlet:"GAUNTLET"};function pe(o){return!o||o==="showcase_starter"?null:o in oe?oe[o]:o.replace(/_/g," ").toUpperCase().slice(0,14)}function fe(o,e){return e&&e.trim()?e.trim():o?o in re?re[o]:o.replace(/_/g," ").toUpperCase():null}function v(o,e=16){const i=`${e}`,a=`<svg width="${i}" height="${i}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`;switch(o){case"back":return`${a}<polyline points="15 18 9 12 15 6"/></svg>`;case"eye":return`${a}<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.35"/></svg>`;case"sound_on":return`${a}<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.28"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.8 5.5a9.2 9.2 0 0 1 0 13"/></svg>`;case"sound_off":return`${a}<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fill-opacity="0.2"/><line x1="22" y1="9" x2="16" y2="15"/><line x1="16" y1="9" x2="22" y2="15"/></svg>`;case"help":return`${a}<circle cx="12" cy="12" r="9"/><path d="M9.4 9.2a2.7 2.7 0 0 1 5.2 1c0 1.8-2.6 2.3-2.6 3.8"/><circle cx="12" cy="17.2" r="0.9" fill="currentColor"/></svg>`;case"flame":return`${a}<path d="M12 2c.7 3.6-2.4 5.4-2.4 8.4 0 1.5 1.1 2.5 2.4 2.5 1.9 0 3.2-1.8 2.8-4.1 2.4 1.6 4.2 4.3 4.2 7.2a7 7 0 1 1-14 0c0-3.6 2.7-7.1 7-14z" fill="currentColor" fill-opacity="0.36"/></svg>`;case"wheel":return`${a}<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><path d="M12 3v6.8M12 14.2V21M4.2 7.5l5.9 3.4M13.9 13.1l5.9 3.4M19.8 7.5l-5.9 3.4M10.1 13.1l-5.9 3.4"/></svg>`;case"check":return`${a}<polyline points="20 6 9 17 4 12" stroke-width="2.8"/></svg>`;case"cross":return`${a}<line x1="18" y1="6" x2="6" y2="18" stroke-width="2.5"/><line x1="6" y1="6" x2="18" y2="18" stroke-width="2.5"/></svg>`;case"shield":return`${a}<path d="M12 3l8 3.5V12c0 4.8-3.4 8.2-8 9.5C7.4 20.2 4 16.8 4 12V6.5L12 3z" fill="currentColor" fill-opacity="0.28"/></svg>`;case"star":return`${a}<polygon points="12 2.4 15 8.7 22 9.6 16.9 14.5 18.2 21.4 12 18 5.8 21.4 7.1 14.5 2 9.6 9 8.7 12 2.4" fill="currentColor"/></svg>`;case"star_dim":return`${a}<polygon points="12 2.4 15 8.7 22 9.6 16.9 14.5 18.2 21.4 12 18 5.8 21.4 7.1 14.5 2 9.6 9 8.7 12 2.4" fill="currentColor" fill-opacity="0.14"/></svg>`;case"share":return`${a}<circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><line x1="8.4" y1="13.3" x2="15.6" y2="17.7"/><line x1="15.6" y1="6.3" x2="8.4" y2="10.7"/></svg>`;case"play":return`${a}<polygon points="6 4 20 12 6 20 6 4" fill="currentColor"/></svg>`;case"mic":return`${a}<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" fill-opacity="0.3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8.5 21h7"/></svg>`;case"frost":return`${a}<path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1M10 4l2 2 2-2M10 20l2-2 2 2M4 10l2 2-2 2M20 10l-2 2 2 2"/></svg>`;case"fog":return`${a}<path d="M4 15h16M3 19h14M6 11a4 4 0 0 1 7.6-1.7A3.5 3.5 0 0 1 18.5 12H6a2.5 2.5 0 0 1 0-1z" fill="currentColor" fill-opacity="0.26"/></svg>`;case"spark":return`${a}<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="currentColor" fill-opacity="0.35"/></svg>`;case"fullscreen_enter":return`${a}<polyline points="4 9 4 4 9 4"/><polyline points="15 4 20 4 20 9"/><polyline points="20 15 20 20 15 20"/><polyline points="9 20 4 20 4 15"/></svg>`;case"fullscreen_exit":return`${a}<polyline points="9 4 9 9 4 9"/><polyline points="20 9 15 9 15 4"/><polyline points="15 20 15 15 20 15"/><polyline points="4 15 9 15 9 20"/></svg>`}}function se(o,e,i=104){const a=new Set(o),t=60,n=60,s=45,c=29,d=11,l=[`<linearGradient id="v5m-brass-${e}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff5c0"/>
      <stop offset="28%" stop-color="#e4b34a"/>
      <stop offset="56%" stop-color="#875914"/>
      <stop offset="82%" stop-color="#f7d577"/>
      <stop offset="100%" stop-color="#69430c"/>
    </linearGradient>`,`<radialGradient id="v5m-empty-${e}" cx="45%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#443728"/>
      <stop offset="62%" stop-color="#221b13"/>
      <stop offset="100%" stop-color="#120d08"/>
    </radialGradient>`,`<radialGradient id="v5m-ring-${e}" cx="50%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#2858b0"/>
      <stop offset="100%" stop-color="#0b1d45"/>
    </radialGradient>`],y=ce.map((k,f)=>{const p=le[k],g=J[k],M=a.has(k),u=-150+f*60+3.2,$=-150+(f+1)*60-3.2,B=(u+$)/2,L=u*Math.PI/180,C=$*Math.PI/180,A=B*Math.PI/180,m=t+s*Math.cos(L),w=n+s*Math.sin(L),T=t+s*Math.cos(C),x=n+s*Math.sin(C),E=t+s*Math.cos(A),S=n+s*Math.sin(A),R=t+d*Math.cos(L),P=n+d*Math.sin(L),z=t+d*Math.cos(C),b=n+d*Math.sin(C),h=t+c*Math.cos(L+.1),I=n+c*Math.sin(L+.1),_=t+c*Math.cos(C-.1),D=n+c*Math.sin(C-.1),F=t+(d+9)*Math.cos(A),N=n+(d+9)*Math.sin(A),G=`M ${m.toFixed(1)} ${w.toFixed(1)} A ${s} ${s} 0 0 1 ${T.toFixed(1)} ${x.toFixed(1)} L ${z.toFixed(1)} ${b.toFixed(1)} A ${d} ${d} 0 0 0 ${R.toFixed(1)} ${P.toFixed(1)} Z`;if(!M)return`
        <g class="v5b-jewel-slice is-unlit">
          <path d="${G}" fill="url(#v5m-empty-${e})" stroke="#7c5a27" stroke-width="1.35"/>
          <path d="M ${h.toFixed(1)} ${I.toFixed(1)} L ${_.toFixed(1)} ${D.toFixed(1)} L ${F.toFixed(1)} ${N.toFixed(1)} Z" fill="rgba(255,224,150,0.06)"/>
          <title>${r(g.shortLabel)} — ${p.jewelName} Wedge (Unearned)</title>
        </g>
      `;const q=`v5m-gem-${e}-${f}`;l.push(`
      <radialGradient id="${q}" cx="45%" cy="35%" r="68%">
        <stop offset="0%" stop-color="${p.litHi}"/>
        <stop offset="46%" stop-color="${p.litMid}"/>
        <stop offset="100%" stop-color="${p.litDeep}"/>
      </radialGradient>
    `);const W=`M ${m.toFixed(1)} ${w.toFixed(1)} A ${s} ${s} 0 0 1 ${E.toFixed(1)} ${S.toFixed(1)} L ${F.toFixed(1)} ${N.toFixed(1)} L ${h.toFixed(1)} ${I.toFixed(1)} Z`,j=`M ${h.toFixed(1)} ${I.toFixed(1)} L ${_.toFixed(1)} ${D.toFixed(1)} L ${F.toFixed(1)} ${N.toFixed(1)} Z`;return`
      <g class="v5b-jewel-slice is-lit">
        <path d="${G}" fill="url(#${q})" stroke="#fff3c4" stroke-width="1.45"/>
        <path d="${W}" fill="rgba(255,255,255,0.28)"/>
        <path d="${j}" fill="${p.litHi}" fill-opacity="0.46"/>
        <title>${r(g.shortLabel)} — ${p.jewelName} Wedge (Earned!)</title>
      </g>
    `}).join("");return`
    <svg class="v5b-medallion-svg" width="${i}" height="${i}" viewBox="0 0 120 120" role="img" aria-label="${a.size} of 6 Championship Jewel Wedges earned">
      <defs>${l.join("")}</defs>
      <circle cx="60" cy="60" r="57.5" fill="url(#v5m-brass-${e})" stroke="#54340a" stroke-width="1.5"/>
      <circle cx="60" cy="60" r="53" fill="url(#v5m-ring-${e})" stroke="#f9df8e" stroke-width="1.2"/>
      <circle cx="60" cy="60" r="48.2" fill="url(#v5m-brass-${e})" stroke="#4c2e08" stroke-width="1.2"/>
      <circle cx="60" cy="60" r="45.6" fill="#18120c"/>
      ${y}
      <circle cx="60" cy="60" r="10.2" fill="url(#v5m-brass-${e})" stroke="#5a380c" stroke-width="1.4"/>
      <circle cx="60" cy="60" r="4.6" fill="#fff3c2" stroke="#99681a" stroke-width="1"/>
    </svg>
  `}function be(o,e){return`
    <svg class="v5b-challenger-podium-svg" viewBox="0 0 180 126" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5p-wood-top" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#5d2d16"/>
          <stop offset="35%" stop-color="#9e562d"/>
          <stop offset="68%" stop-color="#7c3e1d"/>
          <stop offset="100%" stop-color="#471e0d"/>
        </linearGradient>
        <linearGradient id="v5p-wood-body" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#3c1a0c"/>
          <stop offset="28%" stop-color="#7e4020"/>
          <stop offset="52%" stop-color="#9c542b"/>
          <stop offset="78%" stop-color="#6b3418"/>
          <stop offset="100%" stop-color="#2e1308"/>
        </linearGradient>
        <linearGradient id="v5p-brass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff0b5"/>
          <stop offset="40%" stop-color="#d6a03b"/>
          <stop offset="75%" stop-color="#7c5013"/>
          <stop offset="100%" stop-color="#f2cb6c"/>
        </linearGradient>
      </defs>
      <!-- Podium Crown Ledge -->
      <path d="M12 12 L168 12 L162 24 L18 24 Z" fill="url(#v5p-wood-top)" stroke="url(#v5p-brass)" stroke-width="2.5"/>
      <rect x="20" y="24" width="140" height="8" rx="2" fill="#46200f" stroke="#d9a845" stroke-width="1.2"/>
      <!-- Carved Tapered Body -->
      <path d="M30 32 L150 32 L138 124 L42 124 Z" fill="url(#v5p-wood-body)" stroke="#3d1b0c" stroke-width="2"/>
      <!-- Recessed Fluted Brass Panel -->
      <path d="M46 40 L134 40 L126 118 L54 118 Z" fill="#4a2210" stroke="url(#v5p-brass)" stroke-width="2"/>
      <!-- Central Vertical Brass Strip -->
      <rect x="85" y="42" width="10" height="74" rx="2" fill="url(#v5p-brass)" opacity="0.88"/>
      <!-- Crest Emblem -->
      <polygon points="90,54 106,68 90,82 74,68" fill="${o?e:"#28529e"}" stroke="#ffe699" stroke-width="2"/>
      <circle cx="90" cy="68" r="5" fill="#fff1ba"/>
      <!-- Top Specular Highlight -->
      <line x1="22" y1="15" x2="158" y2="15" stroke="rgba(255,244,204,0.6)" stroke-width="1.5"/>
    </svg>
  `}function Q(o,e,i=34){const a=`${i}`,t=`<svg class="v5b-tile-emblem-svg" width="${a}" height="${a}" viewBox="0 0 48 48" fill="none" aria-hidden="true">`;switch(o){case 0:return`${t}
        <path d="M8 31L11 16L18.5 22L24 12L29.5 22L37 16L40 31H8Z" fill="${e}" fill-opacity="0.88" stroke="${e}" stroke-width="2" stroke-linejoin="round"/>
        <rect x="9" y="34" width="30" height="5" rx="2.5" fill="${e}"/>
        <circle cx="24" cy="10" r="2.6" fill="${e}"/>
        <circle cx="11" cy="14" r="2" fill="${e}"/>
        <circle cx="37" cy="14" r="2" fill="${e}"/>
        <circle cx="24" cy="25" r="2.4" fill="#fff7dc"/>
      </svg>`;case 1:return`${t}
        <ellipse cx="24" cy="25" rx="21" ry="7.2" transform="rotate(-22 24 25)" stroke="${e}" stroke-width="3.2"/>
        <circle cx="24" cy="24" r="11.2" fill="${e}"/>
        <path d="M15 21.5C18.5 18.5 26 17.5 32 19.5" stroke="#f7eaff" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
        <path d="M6.2 31.6C12.5 31.5 27.5 26 41.8 18.4" stroke="${e}" stroke-width="3.4" stroke-linecap="round"/>
        <circle cx="38" cy="10" r="2" fill="${e}"/>
        <circle cx="10" cy="12" r="1.5" fill="${e}"/>
      </svg>`;case 2:return`${t}
        <circle cx="24" cy="24" r="17" stroke="${e}" stroke-width="2.8" fill="${e}" fill-opacity="0.1"/>
        <circle cx="24" cy="24" r="12.5" stroke="${e}" stroke-width="1.3" stroke-dasharray="2.5 2.5"/>
        <polygon points="24,8 28,21 24,24 20,21" fill="${e}"/>
        <polygon points="24,40 28,27 24,24 20,27" fill="${e}" fill-opacity="0.45"/>
        <polygon points="40,24 27,28 24,24 27,20" fill="${e}" fill-opacity="0.65"/>
        <polygon points="8,24 21,28 24,24 21,20" fill="${e}" fill-opacity="0.65"/>
        <circle cx="24" cy="24" r="3" fill="#fff4d2" stroke="${e}" stroke-width="1.8"/>
      </svg>`;case 3:return`${t}
        <path d="M24 8C14.5 8 7 15 7 24C7 32.5 13.8 39 22 39C25 39 26.8 37 26.8 34.8C26.8 33.4 26.1 32.4 26.1 31.3C26.1 29.7 27.5 28.6 29.5 28.6H33.5C38.2 28.6 41 25.5 41 21.5C41 13.6 33.4 8 24 8Z" fill="${e}" fill-opacity="0.88"/>
        <circle cx="16.5" cy="19" r="2.7" fill="#fff3f8"/>
        <circle cx="24.5" cy="15.5" r="2.7" fill="#fff3f8"/>
        <circle cx="32" cy="19.5" r="2.7" fill="#fff3f8"/>
        <circle cx="16" cy="27.5" r="2.7" fill="#fff3f8"/>
      </svg>`;case 4:return`${t}
        <rect x="6" y="12" width="36" height="24" rx="4" fill="${e}"/>
        <rect x="10" y="15.5" width="28" height="11" rx="2" fill="#e8fcfc" fill-opacity="0.92"/>
        <circle cx="17.5" cy="21" r="3.4" stroke="${e}" stroke-width="2.2" fill="none"/>
        <circle cx="30.5" cy="21" r="3.4" stroke="${e}" stroke-width="2.2" fill="none"/>
        <line x1="21" y1="21" x2="27" y2="21" stroke="${e}" stroke-width="2"/>
        <path d="M13 36L16 30H32L35 36" fill="#bce6e7" stroke="${e}" stroke-width="1.4"/>
        <circle cx="19" cy="33" r="1.4" fill="${e}"/>
        <circle cx="29" cy="33" r="1.4" fill="${e}"/>
      </svg>`;case 5:return`${t}
        <path d="M14 10H34V20C34 25.8 29.5 30 24 30C18.5 30 14 25.8 14 20V10Z" fill="${e}"/>
        <path d="M14 13H8.5C8.5 19 10.5 22.5 14 23M34 13H39.5C39.5 19 37.5 22.5 34 23" stroke="${e}" stroke-width="2.8" stroke-linecap="round"/>
        <rect x="21" y="29" width="6" height="7" fill="${e}"/>
        <rect x="14" y="35.5" width="20" height="4.5" rx="2" fill="${e}"/>
        <polygon points="24,14 25.5,17.6 29.4,18 26.4,20.5 27.3,24.3 24,22.2 20.7,24.3 21.6,20.5 18.6,18 22.5,17.6" fill="#e9fcf3"/>
      </svg>`;case 6:return`${t}
        <rect x="13" y="13" width="22" height="22" rx="4" fill="${e}"/>
        <rect x="18" y="18" width="12" height="12" rx="2" fill="#e6f3ff"/>
        <path d="M18 7V13M24 7V13M30 7V13M18 35V41M24 35V41M30 35V41M7 18H13M7 24H13M7 30H13M35 18H41M35 24H41M35 30H41" stroke="${e}" stroke-width="2.8" stroke-linecap="round"/>
        <circle cx="24" cy="24" r="2.8" fill="${e}"/>
      </svg>`;case 7:return`${t}
        <path d="M38 10C22 10 11 19 10 37C27 36 38 26 38 10Z" fill="${e}"/>
        <path d="M10 38C16 30 24 22 34 14" stroke="#ebfceb" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M19 28L27 26M23 23L22 16" stroke="#ebfceb" stroke-width="2" stroke-linecap="round"/>
      </svg>`;case 8:return`${t}
        <line x1="24" y1="8" x2="24" y2="38" stroke="${e}" stroke-width="3" stroke-linecap="round"/>
        <line x1="11" y1="15" x2="37" y2="15" stroke="${e}" stroke-width="3" stroke-linecap="round"/>
        <path d="M11 15L6.5 27H15.5L11 15Z" fill="${e}" fill-opacity="0.22" stroke="${e}" stroke-width="2"/>
        <path d="M37 15L32.5 27H41.5L37 15Z" fill="${e}" fill-opacity="0.22" stroke="${e}" stroke-width="2"/>
        <rect x="15" y="36.5" width="18" height="4" rx="2" fill="${e}"/>
        <circle cx="24" cy="11" r="2.8" fill="${e}"/>
      </svg>`;case 9:return`${t}
        <circle cx="24" cy="12" r="3" fill="${e}"/>
        <path d="M9 32C9 22.5 15.7 15 24 15C32.3 15 39 22.5 39 32H9Z" fill="${e}"/>
        <path d="M16 26C16.8 21.5 19.8 18.8 23.5 18.2" stroke="#fff0e6" stroke-width="2.2" stroke-linecap="round"/>
        <rect x="6" y="33.5" width="36" height="4.5" rx="2.2" fill="${e}"/>
      </svg>`;case 10:return`${t}
        <path d="M7 13C12 10 19 10 24 13V25C24 31.5 19.5 36.5 15.5 38C11.5 36.5 7 31.5 7 25V13Z" fill="${e}"/>
        <path d="M24 16C28.5 13.5 35.5 13.5 41 16V27C41 33 36.8 37.5 32.5 39C28.2 37.5 24 33 24 27V16Z" fill="${e}" fill-opacity="0.82" stroke="#fff7f7" stroke-width="1.3"/>
        <path d="M11 20.5C12.2 19 13.8 19 14.8 20.5M17.2 20.5C18.2 19 19.8 19 21 20.5" stroke="#fff7f7" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M11.5 27.5C13.5 30.5 17.8 30.5 19.8 27.5" stroke="#fff7f7" stroke-width="2" stroke-linecap="round"/>
        <path d="M28 23.5L30.8 24.5M37 23.5L34.2 24.5" stroke="#fff7f7" stroke-width="1.9" stroke-linecap="round"/>
        <path d="M28.5 32.5C30.5 30 34.5 30 36.5 32.5" stroke="#fff7f7" stroke-width="2" stroke-linecap="round"/>
      </svg>`;case 11:default:return`${t}
        <polygon points="24,7 41,35 7,35" fill="${e}" fill-opacity="0.88" stroke="${e}" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="24,14 34,31 14,31" fill="#f1edff" fill-opacity="0.9"/>
        <line x1="24" y1="7" x2="24" y2="35" stroke="${e}" stroke-width="2"/>
        <circle cx="24" cy="24" r="3" fill="${e}"/>
      </svg>`}}function ge(o,e,i=34){const a=`${i}`,t=`<svg class="v5b-tile-emblem-svg" width="${a}" height="${a}" viewBox="0 0 48 48" fill="none" aria-hidden="true">`;switch(o){case"MATCH_4":return`${t}
        <path d="M12 16C20 16 20 32 36 32" stroke="${e}" stroke-width="3.6" stroke-linecap="round"/>
        <path d="M12 32C22 32 24 16 36 16" stroke="${e}" stroke-width="3.6" stroke-linecap="round" stroke-opacity="0.55"/>
        <rect x="5" y="12" width="9" height="8" rx="2" fill="${e}"/>
        <rect x="5" y="28" width="9" height="8" rx="2" fill="${e}"/>
        <rect x="34" y="12" width="9" height="8" rx="2" fill="${e}"/>
        <rect x="34" y="28" width="9" height="8" rx="2" fill="${e}"/>
        <circle cx="9.5" cy="16" r="1.6" fill="#fff7dc"/>
        <circle cx="38.5" cy="32" r="1.6" fill="#fff7dc"/>
      </svg>`;case"SORT_4":return`${t}
        <rect x="11" y="7" width="26" height="4.5" rx="2" fill="${e}"/>
        <rect x="11" y="36.5" width="26" height="4.5" rx="2" fill="${e}"/>
        <path d="M14 11.5H34C34 18.5 27.5 22 26 24C27.5 26 34 29.5 34 36.5H14C14 29.5 20.5 26 22 24C20.5 22 14 18.5 14 11.5Z" fill="${e}" fill-opacity="0.22" stroke="${e}" stroke-width="2.6" stroke-linejoin="round"/>
        <polygon points="18,15 30,15 24,21.5" fill="${e}"/>
        <polygon points="17.5,35 30.5,35 24,29" fill="${e}"/>
      </svg>`;case"PINPOINT_DIAL":return`${t}
        <path d="M8 33A16 16 0 1 1 40 33" stroke="${e}" stroke-width="3.8" stroke-linecap="round"/>
        <path d="M13 31A11.5 11.5 0 0 1 35 31" stroke="${e}" stroke-width="1.6" stroke-dasharray="3 3"/>
        <line x1="24" y1="32" x2="34.5" y2="18.5" stroke="${e}" stroke-width="3.2" stroke-linecap="round"/>
        <circle cx="24" cy="32" r="4.2" fill="${e}"/>
        <circle cx="24" cy="32" r="1.6" fill="#fff7dc"/>
      </svg>`;case"MULTI_STRIKE":return`${t}
        <rect x="8" y="8" width="14" height="14" rx="3.2" fill="${e}"/>
        <polyline points="11.5,15.5 14.2,18.2 19,12.5" stroke="#fff7dc" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="26" y="8" width="14" height="14" rx="3.2" fill="${e}" fill-opacity="0.22" stroke="${e}" stroke-width="2.2"/>
        <rect x="8" y="26" width="14" height="14" rx="3.2" fill="${e}" fill-opacity="0.22" stroke="${e}" stroke-width="2.2"/>
        <rect x="26" y="26" width="14" height="14" rx="3.2" fill="${e}"/>
        <polyline points="29.5,33.5 32.2,36.2 37,30.5" stroke="#fff7dc" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;case"CLUE_ESCALATOR":return`${t}
        <rect x="8" y="28" width="8.5" height="12" rx="2.5" fill="${e}" fill-opacity="0.5"/>
        <rect x="19.8" y="20" width="8.5" height="20" rx="2.5" fill="${e}" fill-opacity="0.75"/>
        <rect x="31.5" y="11" width="8.5" height="29" rx="2.5" fill="${e}"/>
        <polygon points="35.8,4 37.3,7.3 41,7.8 38.3,10.2 39,13.6 35.8,11.9 32.6,13.6 33.3,10.2 30.6,7.8 34.3,7.3" fill="${e}"/>
      </svg>`;case"VISUAL_SPOTTER":return`${t}
        <path d="M8 16V10H15M33 10H40V16M8 32V38H15M33 38H40V32" stroke="${e}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="24" cy="24" r="9.5" fill="${e}" fill-opacity="0.2" stroke="${e}" stroke-width="2.8"/>
        <circle cx="24" cy="24" r="4" fill="${e}"/>
      </svg>`;case"MULTIPLE_CHOICE":default:return Q(0,e,i)}}function he(o){const e=[-28,-16,-4,8,20,32],i=e.map(t=>`<rect x="${50+t-7}" y="${39+t*.72-4}" width="14" height="8" rx="4" transform="rotate(35 ${50+t} ${39+t*.72})" fill="url(#v5ch-iron-${o})" stroke="#171b22" stroke-width="1.5"/>
         <ellipse cx="${50+t}" cy="${39+t*.72}" rx="3.4" ry="1.4" transform="rotate(35 ${50+t} ${39+t*.72})" fill="#1c2029"/>`).join(""),a=e.map(t=>`<rect x="${50+t-7}" y="${39-t*.72-4}" width="14" height="8" rx="4" transform="rotate(-35 ${50+t} ${39-t*.72})" fill="url(#v5ch-iron-${o})" stroke="#171b22" stroke-width="1.5"/>
         <ellipse cx="${50+t}" cy="${39-t*.72}" rx="3.4" ry="1.4" transform="rotate(-35 ${50+t} ${39-t*.72})" fill="#1c2029"/>`).join("");return`
    <svg class="v5b-chains-overlay" viewBox="0 0 100 80" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5ch-iron-${o}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#c9d2df"/>
          <stop offset="35%" stop-color="#6e7785"/>
          <stop offset="72%" stop-color="#353b47"/>
          <stop offset="100%" stop-color="#8b95a6"/>
        </linearGradient>
        <linearGradient id="v5ch-lock-${o}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff4b8"/>
          <stop offset="32%" stop-color="#e3b144"/>
          <stop offset="70%" stop-color="#966316"/>
          <stop offset="100%" stop-color="#f2cd6d"/>
        </linearGradient>
      </defs>
      <!-- Shadow under crossed chains -->
      <line x1="6" y1="8" x2="94" y2="70" stroke="rgba(0,0,0,0.55)" stroke-width="11" stroke-linecap="round"/>
      <line x1="94" y1="8" x2="6" y2="70" stroke="rgba(0,0,0,0.55)" stroke-width="11" stroke-linecap="round"/>
      <g class="v5b-chain-strand-a">${i}</g>
      <g class="v5b-chain-strand-b">${a}</g>
      <!-- Central 3D Gold Brass Padlock (lifted slightly so point value gleams cleanly below) -->
      <g class="v5b-padlock-body" transform="translate(0, -6)">
        <path d="M41 29V21.5C41 16 45 12 50 12C55 12 59 16 59 21.5V29" fill="none" stroke="url(#v5ch-iron-${o})" stroke-width="5" stroke-linecap="round"/>
        <path d="M41 29V21.5C41 16 45 12 50 12C55 12 59 16 59 21.5V29" fill="none" stroke="#181c24" stroke-width="1.2"/>
        <rect x="35.5" y="27" width="29" height="22" rx="4.5" fill="url(#v5ch-lock-${o})" stroke="#4c2e09" stroke-width="1.8"/>
        <line x1="39" y1="30.5" x2="61" y2="30.5" stroke="#fff7cf" stroke-width="1.4" opacity="0.8"/>
        <circle cx="50" cy="36.5" r="3.1" fill="#2b1905"/>
        <polygon points="48.4,38 51.6,38 52.5,44.5 47.5,44.5" fill="#2b1905"/>
      </g>
    </svg>
  `}function H(o,e){switch(o){case"WHEEL":return`
        <svg class="v5b-twist-svg is-wheel-spin" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="19.5" fill="#5e3204" stroke="#fff2b0" stroke-width="2.4"/>
          <path d="M24 24L24 5.5A18.5 18.5 0 0 1 40 14.8Z" fill="#ffd866"/>
          <path d="M24 24L40 14.8A18.5 18.5 0 0 1 40 33.2Z" fill="#d97b16"/>
          <path d="M24 24L40 33.2A18.5 18.5 0 0 1 24 42.5Z" fill="#fff099"/>
          <path d="M24 24L24 42.5A18.5 18.5 0 0 1 8 33.2Z" fill="#b8610a"/>
          <path d="M24 24L8 33.2A18.5 18.5 0 0 1 8 14.8Z" fill="#f5b72b"/>
          <path d="M24 24L8 14.8A18.5 18.5 0 0 1 24 5.5Z" fill="#994b06"/>
          <circle cx="24" cy="24" r="18.5" stroke="#5e3204" stroke-width="1.4"/>
          <circle cx="24" cy="24" r="5" fill="#fff6cc" stroke="#663705" stroke-width="2"/>
          <polygon points="24,1.5 27.5,8.5 20.5,8.5" fill="#fff7d1" stroke="#5e3204" stroke-width="1.2"/>
        </svg>
      `;case"TIME_BOMB":return`
        <svg class="v5b-twist-svg" viewBox="0 0 54 46" fill="none" aria-hidden="true">
          <!-- Fuse -->
          <path d="M29 14C32 9 37 8 41 11" stroke="#804a17" stroke-width="3" stroke-linecap="round"/>
          <!-- Flickering Spark Burst -->
          <g class="v5b-fuse-spark">
            <polygon points="42,3 44,9 50,8 45.5,12.5 49,17 43,15 41,20 39.5,14.5 34,15.5 38.5,11 35,6.5 40.5,8.5" fill="#ff9d1c"/>
            <circle cx="42" cy="11.5" r="3.4" fill="#fff6b8"/>
          </g>
          <!-- Bomb Collar & Body -->
          <rect x="21" y="11.5" width="9" height="5" rx="1.6" fill="#6b441f" stroke="#261408" stroke-width="1.5"/>
          <circle cx="24" cy="28" r="14" fill="#2d1d18" stroke="#69422b" stroke-width="2"/>
          <path d="M16 23C16.8 19.5 19.6 17.5 23 17" stroke="#ffb36b" stroke-width="2.6" stroke-linecap="round" opacity="0.85"/>
          <circle cx="19" cy="22" r="2.2" fill="#fff0cc" opacity="0.7"/>
        </svg>
      `;case"RIVAL_BOUNTY":return`
        <svg class="v5b-twist-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="16" stroke="#ffcf54" stroke-width="3"/>
          <circle cx="24" cy="24" r="9.5" stroke="#ff7a2e" stroke-width="2.4"/>
          <line x1="24" y1="3" x2="24" y2="14" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>
          <line x1="24" y1="34" x2="24" y2="45" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>
          <line x1="3" y1="24" x2="14" y2="24" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>
          <line x1="34" y1="24" x2="45" y2="24" stroke="#fff3c4" stroke-width="3" stroke-linecap="round"/>
          <circle cx="24" cy="24" r="3.4" fill="#fff5b8"/>
        </svg>
      `;case"POWER_PLAY":return`
        <svg class="v5b-twist-svg" viewBox="0 0 52 44" fill="none" aria-hidden="true">
          <polygon points="18,6 31,22 18,38 5,22" fill="#ffe17d" stroke="#5e3906" stroke-width="2"/>
          <polygon points="18,12 25.5,22 18,32 10.5,22" fill="#fff9db" fill-opacity="0.7"/>
          <polygon points="34,6 47,22 34,38 21,22" fill="#f5b324" stroke="#5e3906" stroke-width="2"/>
          <polygon points="34,12 41.5,22 34,32 26.5,22" fill="#fff5c0" fill-opacity="0.8"/>
          <circle cx="26" cy="22" r="3.5" fill="#ffffff"/>
        </svg>
      `;case"CROWN_WEDGE":{const i=le[e];return`
        <svg class="v5b-twist-svg" viewBox="0 0 50 44" fill="none" aria-hidden="true">
          <path d="M7 33L11 13L19.5 21L25 8L30.5 21L39 13L43 33H7Z" fill="${i.litMid}" stroke="#fff4c4" stroke-width="2.2" stroke-linejoin="round"/>
          <polygon points="25,11 29,21 25,29 21,21" fill="${i.litHi}" fill-opacity="0.85"/>
          <rect x="8" y="34" width="34" height="5" rx="2.4" fill="#f5c654" stroke="#5c3807" stroke-width="1.4"/>
          <circle cx="25" cy="7" r="2.6" fill="#fff6cc"/>
        </svg>
      `}case"FLAME_THAW":return`
        <svg class="v5b-twist-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M25 5C27 14 19 18 19 25C19 28.5 21.5 31 24.5 31C28.8 31 31.5 27.2 30.8 22.4C35.8 26 39 31.5 39 37C39 42 32.5 44 24 44C15.5 44 9 39.2 9 31.5C9 21.5 16.2 13.5 25 5Z" fill="#ff741c" stroke="#fff0a6" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M24 22C25.2 26.5 20.5 29 20.5 33.5C20.5 36.5 22.8 39 25.5 39C28.8 39 31.5 36.2 31.5 32.5C31.5 28.5 28.5 24.8 24 22Z" fill="#fff29e"/>
        </svg>
      `;case"SPIRAL_CORE":return`
        <svg class="v5b-twist-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="18" stroke="#ffe485" stroke-width="2.6" stroke-dasharray="6 3"/>
          <polygon points="24,8 37,24 24,40 11,24" fill="#1cd987" stroke="#fff4bf" stroke-width="2.2"/>
          <polygon points="24,14 31,24 24,34 17,24" fill="#9dffcf"/>
          <circle cx="24" cy="24" r="3.5" fill="#ffffff"/>
        </svg>
      `;case"PYRAMID_APEX":return`
        <svg class="v5b-twist-svg" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <polygon points="24,6 43,39 5,39" fill="#f5be36" stroke="#fff4c4" stroke-width="2.2" stroke-linejoin="round"/>
          <polygon points="24,6 32,39 24,39" fill="#c78312" fill-opacity="0.45"/>
          <line x1="12" y1="28" x2="36" y2="28" stroke="#6b4006" stroke-width="1.8"/>
          <circle cx="24" cy="18" r="3.4" fill="#fff7d1" stroke="#6b4006" stroke-width="1.4"/>
        </svg>
      `}}function ve(o,e){const i='<svg class="v5b-charm-prop-svg" viewBox="0 0 64 64" fill="none" aria-hidden="true">';switch(o){case"watch":return`${i}
        <circle cx="32" cy="11" r="5" stroke="#f5d072" stroke-width="3.2"/>
        <rect x="28.5" y="14" width="7" height="5" rx="1.6" fill="#d9a43b"/>
        <circle cx="32" cy="36" r="20" fill="#c7922e" stroke="#fff0b3" stroke-width="2.5"/>
        <circle cx="32" cy="36" r="15.5" fill="#fcf5e3" stroke="#7d5214" stroke-width="2"/>
        <path d="M32 23V25.5M32 46.5V49M19 36H21.5M42.5 36H45" stroke="#472d12" stroke-width="2" stroke-linecap="round"/>
        <line x1="32" y1="36" x2="25" y2="29" stroke="#24160a" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="32" y1="36" x2="41" y2="33" stroke="#8c1c28" stroke-width="2" stroke-linecap="round"/>
        <circle cx="32" cy="36" r="2.4" fill="#c7922e"/>
      </svg>`;case"fountain_pen":return`${i}
        <g transform="rotate(36 32 32)">
          <rect x="26" y="10" width="12" height="31" rx="5" fill="#a81628" stroke="#f7d577" stroke-width="2"/>
          <rect x="26" y="23" width="12" height="4.5" fill="#f5cd69"/>
          <line x1="30" y1="13" x2="30" y2="37" stroke="#ff7a8b" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
          <polygon points="27,41 37,41 32,57" fill="#f5cd69" stroke="#5e3a09" stroke-width="1.5"/>
          <line x1="32" y1="44" x2="32" y2="54" stroke="#4a2c05" stroke-width="1.6"/>
          <circle cx="32" cy="46" r="1.6" fill="#4a2c05"/>
        </g>
      </svg>`;case"chip":return`${i}
        <circle cx="32" cy="33" r="21" fill="#c9932c" stroke="#fff0b0" stroke-width="2.6"/>
        <circle cx="32" cy="33" r="16.5" fill="#e6b74c" stroke="#855813" stroke-width="1.8"/>
        <circle cx="27" cy="28" r="5.5" fill="#9c6a15"/>
        <circle cx="37" cy="28" r="5.5" fill="#9c6a15"/>
        <circle cx="27" cy="37" r="5.5" fill="#9c6a15"/>
        <circle cx="37" cy="37" r="5.5" fill="#9c6a15"/>
        <circle cx="27.5" cy="28.5" r="4" fill="#fae08c"/>
        <circle cx="36.5" cy="28.5" r="4" fill="#fae08c"/>
        <circle cx="27.5" cy="36.5" r="4" fill="#fae08c"/>
        <circle cx="36.5" cy="36.5" r="4" fill="#fae08c"/>
        <path d="M32 39C32 44 30 47 26.5 48" stroke="#7d500d" stroke-width="2.6" stroke-linecap="round"/>
      </svg>`;case"coaster":return`${i}
        <circle cx="32" cy="32" r="21" fill="#8f5023" stroke="#f7d57c" stroke-width="2.6" stroke-dasharray="6 3"/>
        <circle cx="32" cy="32" r="15.5" fill="#f7ebd2" stroke="#6b3413" stroke-width="2"/>
        <path d="M25 25H39V34C39 38 36 41 32 41C28 41 25 38 25 34V25Z" fill="#d99021" stroke="#4f260b" stroke-width="1.8"/>
        <path d="M24 25C24 22 27 21 29 22.5C31 20.5 34.5 21 36 22.5C38 21.5 40 23 40 25H24Z" fill="#ffffff"/>
      </svg>`;case"mic":return`${i}
        <rect x="23" y="10" width="18" height="26" rx="9" fill="#d9a63b" stroke="#fff3be" stroke-width="2.4"/>
        <line x1="25" y1="18" x2="39" y2="18" stroke="#4f3107" stroke-width="2"/>
        <line x1="25" y1="23" x2="39" y2="23" stroke="#4f3107" stroke-width="2"/>
        <line x1="25" y1="28" x2="39" y2="28" stroke="#4f3107" stroke-width="2"/>
        <path d="M17 29C17 37.5 23.7 44 32 44C40.3 44 47 37.5 47 29" stroke="#f2ca6b" stroke-width="3.2" stroke-linecap="round"/>
        <line x1="32" y1="44" x2="32" y2="54" stroke="#f2ca6b" stroke-width="3.6"/>
        <rect x="21" y="52" width="22" height="4.5" rx="2.2" fill="#e3b144"/>
      </svg>`;case"pulse":return`${i}
        <circle cx="32" cy="32" r="20" fill="#5e1023" stroke="#ff9db6" stroke-width="2.6"/>
        <polyline points="14,33 22,33 26,21 31,43 36,27 40,33 50,33" stroke="#fff0b8" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;case"circuit":return`${i}
        <polygon points="32,10 51,21 51,43 32,54 13,43 13,21" fill="#103661" stroke="#6ee2ff" stroke-width="2.6"/>
        <circle cx="32" cy="32" r="7" fill="#32d9ff" stroke="#ffffff" stroke-width="2"/>
        <path d="M32 14V25M32 39V50M17 23L26 28.5M38 35.5L47 41M47 23L38 28.5M26 35.5L17 41" stroke="#f5d376" stroke-width="2.2"/>
      </svg>`;case"astrolabe":return`${i}
        <circle cx="32" cy="32" r="20" stroke="#f7d577" stroke-width="3.2" fill="#1c2f59"/>
        <circle cx="32" cy="32" r="13" stroke="#e0ad42" stroke-width="2" stroke-dasharray="4 3"/>
        <ellipse cx="32" cy="32" rx="19" ry="7.5" transform="rotate(-28 32 32)" stroke="#fff0b8" stroke-width="2"/>
        <circle cx="32" cy="32" r="4.5" fill="#ffd454"/>
      </svg>`;case"megaphone":return`${i}
        <path d="M16 28L45 14V46L16 36V28Z" fill="#e3ad3b" stroke="#fff3c4" stroke-width="2.2" stroke-linejoin="round"/>
        <rect x="11" y="27" width="7" height="10" rx="2" fill="#8f202c" stroke="#f5cd69" stroke-width="1.6"/>
        <path d="M19 37L23 50H29L25 38" fill="#5e2a14" stroke="#f5cd69" stroke-width="1.6"/>
        <line x1="48" y1="22" x2="54" y2="19" stroke="#fff2b5" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="48" y1="30" x2="55" y2="30" stroke="#fff2b5" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="48" y1="38" x2="54" y2="41" stroke="#fff2b5" stroke-width="2.5" stroke-linecap="round"/>
      </svg>`;case"dice":return`${i}
        <rect x="12" y="21" width="24" height="24" rx="5" transform="rotate(-12 24 33)" fill="#f2c452" stroke="#66400a" stroke-width="2"/>
        <rect x="28" y="17" width="24" height="24" rx="5" transform="rotate(14 40 29)" fill="#ffe38a" stroke="#66400a" stroke-width="2"/>
        <circle cx="21" cy="30" r="2.2" fill="#472a05"/>
        <circle cx="27" cy="36" r="2.2" fill="#472a05"/>
        <circle cx="36" cy="24" r="2.2" fill="#472a05"/>
        <circle cx="44" cy="27" r="2.2" fill="#472a05"/>
        <circle cx="39" cy="33" r="2.2" fill="#472a05"/>
      </svg>`;case"seal":return`${i}
        <circle cx="32" cy="32" r="21" fill="#a8132c" stroke="#ff94a8" stroke-width="2.2"/>
        <circle cx="32" cy="32" r="15" fill="#7d0b1f" stroke="#f7d374" stroke-width="2.2"/>
        <path d="M23 36L25.5 24L30 29L32 22L34 29L38.5 24L41 36H23Z" fill="#ffe18c"/>
      </svg>`;case"shield":default:return`${i}
        <path d="M32 9L50 17V32C50 43.5 42.5 51.5 32 55C21.5 51.5 14 43.5 14 32V17L32 9Z" fill="${e||"#2759a8"}" stroke="#ffe699" stroke-width="3"/>
        <path d="M32 15L44 20.5V31.5C44 39.5 39 45.5 32 48.2V15Z" fill="rgba(255,255,255,0.2)"/>
        <polygon points="32,23 34.4,28.5 40,29 35.8,33 37,38.5 32,35.6 27,38.5 28.2,33 24,29 29.6,28.5" fill="#fff2b5"/>
      </svg>`}}const ne=`
/* === WORLD'S SMARTEST v5.0 — LIVING STAGE BOARD VIEW === */
.v5b-root {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  max-width: 100%;
  overflow-x: clip;
  overflow-y: auto;
  pointer-events: auto;
  touch-action: pan-y;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #fff9eb;
  background: #061026;
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
.v5b-root *, .v5b-root *::before, .v5b-root *::after {
  box-sizing: border-box;
}
.v5b-root [hidden] {
  display: none !important;
}

/* Full-bleed painted theatrical venue backdrop */
.v5b-stage-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: #061026;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}
.v5b-stage-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 46% 42% at 18% 0%, rgba(255, 206, 118, 0.34) 0%, rgba(255, 206, 118, 0) 72%),
    radial-gradient(ellipse 46% 42% at 82% 0%, rgba(105, 198, 255, 0.34) 0%, rgba(105, 198, 255, 0) 72%),
    radial-gradient(ellipse 38% 36% at 50% 24%, rgba(255, 214, 102, 0.24) 0%, rgba(255, 214, 102, 0) 72%),
    linear-gradient(180deg, rgba(6, 14, 34, 0.22) 0%, rgba(7, 17, 42, 0.56) 44%, rgba(5, 13, 32, 0.92) 78%, #050c1f 100%);
}
.v5b-stage-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(112deg, rgba(255, 214, 128, 0.14) 0%, transparent 28%),
    linear-gradient(248deg, rgba(96, 186, 255, 0.16) 0%, transparent 28%);
}

/* Main stacked stage layout */
.v5b-stage-canvas {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: min(100%, 1180px);
  min-height: 100dvh;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 8px 0;
  overflow-x: hidden;
}
.v5b-landscape-left-col,
.v5b-landscape-right-col {
  display: contents;
}
.v5b-top-rail { order: 1; }
.v5b-stage-vista { order: 2; }
.v5b-score-plaques-row { order: 3; }
.v5b-speech-strip { order: 4; }
.v5b-alert-slot { order: 5; }
.v5b-board-stage-wrap { order: 6; }
.v5b-podium-ledge-wrap { order: 7; }

/* Top Floating Brass Broadcast Controls */
.v5b-top-rail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 4px 2px;
  position: relative;
  z-index: 18;
}
.v5b-rail-group {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.v5b-brass-pill-btn, .v5b-brass-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 32px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1.5px solid #d9ab4c;
  background: linear-gradient(180deg, #1b3161 0%, #0b1836 100%);
  color: #fff6dc;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 240, 190, 0.4);
  white-space: nowrap;
}
.v5b-brass-pill-btn {
  cursor: pointer;
  transition: transform 0.14s ease, filter 0.14s ease;
}
.v5b-brass-pill-btn:hover {
  filter: brightness(1.14);
  transform: translateY(-1px);
}
.v5b-brass-pill-btn:active {
  transform: translateY(1px);
}
.v5b-brass-icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
}
.v5b-brass-badge.is-gold {
  background: linear-gradient(180deg, #ffe799 0%, #c98f24 100%);
  color: #241403;
  border-color: #fff3c4;
}
.v5b-venue-chip {
  display: none;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  color: #ffe399;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.85);
}

/* ============================================================================
   UPPER THEATRICAL STAGE VISTA (HOST LEFT + MEDALLION CENTER + RIVAL RIGHT)
   ============================================================================ */
.v5b-stage-vista {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: end;
  width: 100%;
  min-height: 152px;
  margin-top: -8px;
  padding-bottom: 2px;
  z-index: 10;
}

/* Stage Left: Host Max Sterling */
.v5b-host-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  min-width: 0;
  z-index: 6;
}
.v5b-actor-wrap {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  pointer-events: none;
}
.v5b-host-cutout {
  height: 150px;
  width: auto;
  max-width: 132px;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.72));
  transform-origin: bottom center;
  animation: v5b-actor-breathe 4.2s ease-in-out infinite;
  margin-bottom: -14px;
  margin-left: -4px;
}

/* Stage Right: Challenger behind Mahogany & Brass Podium */
.v5b-rival-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end;
  min-width: 0;
  z-index: 6;
}
.v5b-rival-stage-stack {
  position: relative;
  width: 128px;
  height: 148px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  pointer-events: none;
  margin-bottom: -14px;
  margin-right: -2px;
}
.v5b-rival-cutout {
  position: absolute;
  bottom: 38px;
  left: 50%;
  transform: translateX(-50%);
  height: 108px;
  width: auto;
  max-width: 106px;
  object-fit: contain;
  object-position: bottom center;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
  z-index: 1;
  animation: v5b-actor-breathe 4.6s ease-in-out infinite reverse;
}
.v5b-challenger-podium-svg {
  position: relative;
  z-index: 2;
  width: 114px;
  height: auto;
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.78));
}
.v5b-solo-podium-spotlight {
  position: absolute;
  bottom: 58px;
  left: 50%;
  transform: translateX(-50%);
  width: 74px;
  height: 74px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 224, 130, 0.36) 0%, rgba(255, 224, 130, 0) 70%);
  z-index: 1;
}

/* Center: Glowing 6-Wedge Jewel Championship Medallion + Turn Ribbon */
.v5b-center-medallion-zone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  z-index: 16;
  margin: 0 -10px;
  padding-bottom: 10px;
}
.v5b-medallion-halo {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.v5b-medallion-halo::before {
  content: '';
  position: absolute;
  inset: -14px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 214, 102, 0.62) 0%, rgba(255, 190, 66, 0.22) 48%, rgba(255, 190, 66, 0) 74%);
  animation: v5b-medallion-pulse 3.2s ease-in-out infinite;
  pointer-events: none;
}
.v5b-medallion-svg {
  position: relative;
  z-index: 2;
  display: block;
  width: 84px;
  height: 84px;
  filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.78));
}
.v5b-turn-ribbon {
  position: relative;
  z-index: 4;
  margin-top: -6px;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1.5px solid #f2c968;
  background: linear-gradient(180deg, #1b2f5c 0%, #0b1633 100%);
  color: #ffe7a3;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.78);
  white-space: nowrap;
}

/* Diamond-Tipped Brass-and-Sapphire Score Plaques Row */
.v5b-score-plaques-row {
  position: relative;
  z-index: 14;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  max-width: 780px;
  margin: -6px auto 4px;
  padding: 0 2px;
}
.v5b-score-plaque-wrap {
  position: relative;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.78));
}
.v5b-score-plaque-rim {
  padding: 2.5px;
  background: linear-gradient(180deg, #fff2b8 0%, #d9a43d 34%, #7c5012 66%, #f0c969 100%);
  clip-path: polygon(12px 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0% 50%);
}
.v5b-score-plaque-face {
  position: relative;
  padding: 4px 12px;
  background: linear-gradient(180deg, #1d356b 0%, #0c1b3e 100%);
  clip-path: polygon(11px 0%, calc(100% - 11px) 0%, 100% 50%, calc(100% - 11px) 100%, 11px 100%, 0% 50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 36px;
}
.v5b-score-plaque-main {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: #fff6dc;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
  white-space: nowrap;
}
.v5b-score-plaque-pts {
  color: #ffe182;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13.5px;
  font-weight: 800;
}
.v5b-score-plaque-sub {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 1px;
  font-size: 10px;
  font-weight: 700;
  color: #b7cbed;
  letter-spacing: 0.04em;
}
.v5b-streak-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #ffd666;
  font-weight: 800;
}
.v5b-solo-bar-track {
  width: 82%;
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  margin-top: 3px;
  overflow: hidden;
}
.v5b-solo-bar-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f5b932, #fff1a8);
}

/* Sculpted Angled Speech Bubbles (Host + Rival + Onboarding Callout) */
.v5b-speech-strip {
  position: relative;
  z-index: 15;
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  justify-content: center;
  gap: 5px;
  width: 100%;
  max-width: 820px;
  margin: 0 auto 3px;
  padding: 0 2px;
}
.v5b-speech-bubble {
  position: relative;
  flex: 1 1 220px;
  padding: 4px 10px 4px 11px;
  border-radius: 10px 12px 10px 4px;
  border: 1.8px solid #d9a843;
  background: linear-gradient(180deg, #fffdf5 0%, #f3e4c3 100%);
  color: #1f160d;
  font-size: 11px;
  line-height: 1.24;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.52), inset 0 1px 0 #ffffff;
  transform: rotate(-0.4deg);
}
.v5b-speech-bubble::before {
  content: '';
  position: absolute;
  top: -8px;
  left: 22px;
  width: 12px;
  height: 10px;
  background: #fffdf5;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  border-bottom: none;
}
.v5b-speech-bubble.is-rival {
  border-color: #d64560;
  background: linear-gradient(180deg, #fff5f7 0%, #f7d7de 100%);
  color: #2b0c14;
  border-radius: 14px 12px 4px 12px;
  transform: rotate(0.5deg);
}
.v5b-speech-bubble.is-rival::before {
  left: auto;
  right: 22px;
  background: #fff5f7;
}
.v5b-speech-speaker {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #7d4a08;
  margin-right: 5px;
}
.v5b-speech-bubble.is-rival .v5b-speech-speaker {
  color: #9e1530;
}
.v5b-onboarding-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 3px;
  padding: 2px 7px;
  border-radius: 6px;
  background: #1b2f5e;
  color: #ffe28a;
  font-size: 10.5px;
  font-weight: 700;
}

/* Screw Armed / Forced Stage Banner */
.v5b-alert-ribbon {
  position: relative;
  z-index: 16;
  width: 100%;
  max-width: 780px;
  margin: 0 auto 6px;
  padding: 6px 12px;
  border-radius: 10px;
  border: 2px solid #ff946b;
  background: linear-gradient(90deg, #5e0c14 0%, #9c1622 50%, #5e0c14 100%);
  color: #fff5dc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  box-shadow: 0 4px 18px rgba(224, 38, 52, 0.55);
  animation: v5b-alert-pulse 1.3s ease-in-out infinite;
}
.v5b-alert-ribbon.is-forced {
  border-color: #ffe07d;
  background: linear-gradient(90deg, #1b2d5c 0%, #2f4b8f 50%, #1b2d5c 100%);
  box-shadow: 0 4px 18px rgba(245, 196, 81, 0.42);
}
.v5b-alert-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #ffe89e;
}
.v5b-alert-sub {
  font-size: 11px;
  color: #ffe8e8;
  opacity: 0.94;
}

/* ============================================================================
   TILTED 2.5D OCTAGONAL CRYSTAL-AND-BRASS STAGE BOARD
   ============================================================================ */
.v5b-board-stage-wrap {
  position: relative;
  z-index: 8;
  width: 100%;
  max-width: 820px;
  margin: 0 auto;
  perspective: 1200px;
  padding: 14px 2px 6px;
}
.v5b-board-tray {
  position: relative;
  width: 100%;
  border-radius: 18px;
  padding: 5px;
  background: linear-gradient(155deg, #fff1b8 0%, #d49f3a 22%, #6e4810 48%, #e8c062 76%, #7d5214 100%);
  box-shadow:
    0 18px 36px rgba(2, 6, 20, 0.85),
    0 0 0 1px rgba(255, 240, 185, 0.45),
    inset 0 2px 1px rgba(255, 250, 224, 0.72);
  transform: rotateX(4deg);
  transform-origin: center 35%;
}
.v5b-board-enamel {
  position: relative;
  border-radius: 14px;
  padding: 34px 7px 9px;
  background:
    radial-gradient(ellipse 90% 45% at 50% 8%, rgba(72, 136, 245, 0.42) 0%, rgba(16, 44, 102, 0) 70%),
    linear-gradient(180deg, #173a7d 0%, #0d2559 55%, #08183d 100%);
  box-shadow:
    inset 0 4px 14px rgba(0, 0, 0, 0.7),
    inset 0 0 0 1.5px rgba(242, 202, 107, 0.38);
}

/* Ornate Scalloped Brass-and-Enamel Category Crests */
.v5b-crests-grid {
  position: absolute;
  top: -16px;
  left: 7px;
  right: 7px;
  display: grid;
  grid-template-columns: repeat(var(--v5b-cols, 4), minmax(0, 1fr));
  gap: 5px;
  z-index: 12;
  pointer-events: none;
}
.v5b-col-crest {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 4px 6px;
  border-radius: 10px 10px 14px 14px;
  border: 2px solid var(--v5b-crest-border, #f0c766);
  background: linear-gradient(180deg, var(--v5b-crest-top) 0%, var(--v5b-crest-bot) 100%);
  box-shadow:
    0 5px 12px rgba(0, 0, 0, 0.68),
    inset 0 1px 0 rgba(255, 244, 200, 0.55),
    inset 0 -2px 4px rgba(0, 0, 0, 0.45);
  text-align: center;
}
.v5b-col-crest::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: var(--v5b-crest-bot);
  border-right: 2px solid var(--v5b-crest-border, #f0c766);
  border-bottom: 2px solid var(--v5b-crest-border, #f0c766);
}
.v5b-crest-medallion {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid #fff0b3;
  background: linear-gradient(180deg, #f5cd6b 0%, #996414 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.65);
}
.v5b-crest-medallion svg {
  width: 14px;
  height: 14px;
}
.v5b-crest-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(9.5px, 2.6vw, 13px);
  font-weight: 800;
  line-height: 1.1;
  color: #fff6de;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
  word-break: normal;
  overflow-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.v5b-col-crest.is-frozen {
  border-color: #9beeff;
  background: linear-gradient(180deg, #1b5c80 0%, #0d324d 100%);
}
.v5b-crest-flag {
  position: absolute;
  bottom: -9px;
  z-index: 3;
  padding: 1px 5px;
  border-radius: 999px;
  background: #0d2b45;
  border: 1px solid #8be8ff;
  color: #ccf6ff;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

/* 4..6 Column Tile Grid */
.v5b-tiles-grid {
  display: grid;
  grid-template-columns: repeat(var(--v5b-cols, 4), minmax(0, 1fr));
  gap: 6px 5px;
  position: relative;
  z-index: 4;
}

/* Beveled Octagonal Tile */
.v5b-tile-btn {
  position: relative;
  appearance: none;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  width: 100%;
  aspect-ratio: 1.34 / 1;
  min-height: 58px;
  cursor: pointer;
  filter: drop-shadow(0 5px 7px rgba(0, 0, 0, 0.72));
  transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), filter 0.16s ease;
  -webkit-tap-highlight-color: transparent;
}
.v5b-tile-btn:not(:disabled):hover {
  transform: translateY(-3px) scale(1.03);
  filter: drop-shadow(0 9px 14px rgba(255, 206, 92, 0.45));
  z-index: 8;
}
.v5b-tile-btn:not(:disabled):active {
  transform: translateY(1px) scale(0.98);
}
.v5b-tile-btn:focus-visible {
  outline: 2px solid #ffe48f;
  outline-offset: 2px;
}
.v5b-tile-btn:disabled {
  cursor: default;
}

.v5b-tile-rim {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 3.5px;
  clip-path: polygon(16% 0%, 84% 0%, 100% 21%, 100% 79%, 84% 100%, 16% 100%, 0% 79%, 0% 21%);
  background: linear-gradient(148deg, #fff5c4 0%, #e3b249 24%, #825514 54%, #f4d072 80%, #6b430d 100%);
}
.v5b-tile-face {
  position: relative;
  width: 100%;
  height: 100%;
  clip-path: polygon(15.5% 0%, 84.5% 0%, 100% 20.5%, 100% 79.5%, 84.5% 100%, 15.5% 100%, 0% 79.5%, 0% 20.5%);
  background: radial-gradient(ellipse 88% 72% at 50% 24%, var(--v5b-tile-hi) 0%, var(--v5b-tile-mid) 56%, var(--v5b-tile-low) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  padding: 3px 4px;
  overflow: hidden;
}
.v5b-tile-face::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 36%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.58) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}
.v5b-tile-emblem-svg {
  position: relative;
  z-index: 2;
  width: clamp(24px, 6.8vw, 34px);
  height: clamp(24px, 6.8vw, 34px);
  flex-shrink: 0;
}
.v5b-tile-points {
  position: relative;
  z-index: 2;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(14px, 3.8vw, 20px);
  font-weight: 800;
  line-height: 1;
  color: var(--v5b-tile-ink, #2d1c0c);
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
}

/* Higher-Value 400 / 800 Gold Burnished Tiles */
.v5b-tile-btn.is-tier-gold .v5b-tile-face {
  background: radial-gradient(ellipse 90% 76% at 50% 22%, #fff3bd 0%, #e9bf62 56%, #bf8b2e 100%);
}
.v5b-tile-btn.is-tier-gold .v5b-tile-points {
  color: #3d2204;
}

/* Special Twist: Radiant Spinning Wheel Tile */
.v5b-tile-btn.is-twist-wheel {
  filter: drop-shadow(0 0 12px rgba(255, 208, 66, 0.8));
}
.v5b-tile-btn.is-twist-wheel .v5b-tile-rim {
  background: linear-gradient(145deg, #ffffff 0%, #ffe680 30%, #d48911 65%, #fff0a6 100%);
}
.v5b-tile-btn.is-twist-wheel .v5b-tile-face {
  background: radial-gradient(circle at 50% 34%, #fff8c4 0%, #ffcb3b 48%, #d47b08 100%);
}
.v5b-tile-btn.is-twist-wheel .v5b-tile-points {
  color: #421f02;
}
.v5b-twist-svg {
  position: relative;
  z-index: 2;
  width: clamp(26px, 7.2vw, 36px);
  height: clamp(26px, 7.2vw, 36px);
  flex-shrink: 0;
}
.v5b-twist-svg.is-wheel-spin {
  animation: v5b-wheel-idle 14s linear infinite;
}

/* Special Twist: Time-Bomb Blitz Tile */
.v5b-tile-btn.is-twist-blitz {
  filter: drop-shadow(0 0 10px rgba(255, 168, 56, 0.65));
}
.v5b-tile-btn.is-twist-blitz .v5b-tile-face {
  background: radial-gradient(ellipse 88% 76% at 50% 24%, #fff7e0 0%, #f5d39b 58%, #cf9a65 100%);
}
.v5b-twist-label {
  position: relative;
  z-index: 2;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(7.6px, 2.05vw, 10.5px);
  font-weight: 800;
  line-height: 1.05;
  text-align: center;
  letter-spacing: 0.03em;
  color: #3b1704;
  text-transform: uppercase;
}
.v5b-mini-pts-tag {
  position: absolute;
  top: 2px;
  right: 12%;
  z-index: 4;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  font-weight: 800;
  color: #fff5d6;
  background: rgba(34, 15, 4, 0.72);
  padding: 0px 4px;
  border-radius: 4px;
}

/* Special Twist: Fiery Rival Bounty Tile */
.v5b-tile-btn.is-twist-bounty {
  filter: drop-shadow(0 0 14px rgba(255, 98, 20, 0.92));
  animation: v5b-bounty-flicker 1.8s ease-in-out infinite;
}
.v5b-tile-btn.is-twist-bounty .v5b-tile-rim {
  background: linear-gradient(145deg, #fff2a1 0%, #ff821c 35%, #b51f05 68%, #ffbe47 100%);
}
.v5b-tile-btn.is-twist-bounty .v5b-tile-face {
  background: radial-gradient(circle at 50% 35%, #9e2908 0%, #4d0d04 65%, #260502 100%);
}
.v5b-tile-btn.is-twist-bounty .v5b-twist-label {
  color: #ffe28a;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}

/* Special Twist: Power Play Double-Diamond Tile */
.v5b-tile-btn.is-twist-power {
  filter: drop-shadow(0 0 12px rgba(255, 204, 72, 0.78));
}
.v5b-tile-btn.is-twist-power .v5b-tile-face {
  background: radial-gradient(circle at 50% 30%, #2a5dc4 0%, #102a69 65%, #071538 100%);
}
.v5b-tile-btn.is-twist-power .v5b-twist-label {
  color: #ffe382;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
}

/* Special Twist: Crown Wedge Jewel Tile */
.v5b-tile-btn.is-twist-wedge {
  filter: drop-shadow(0 0 11px rgba(247, 206, 94, 0.72));
}
.v5b-tile-btn.is-twist-wedge .v5b-tile-face {
  background: radial-gradient(circle at 50% 25%, #29467f 0%, #102045 68%, #09132b 100%);
}
.v5b-tile-btn.is-twist-wedge .v5b-tile-points {
  color: #ffe899;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.85);
}
.v5b-tile-btn.is-twist-wedge .v5b-twist-label {
  color: #fff3c7;
  font-size: clamp(7px, 1.8vw, 9px);
}

/* 14+ Board Topology Special Modifiers (Gold Fever, Flame Thaw, X-Crossroads, Spiral Core, Pyramid Apex, Hot Potato, Turf Bar) */
.v5b-tile-btn.is-gold-fever {
  filter: drop-shadow(0 0 13px rgba(255, 215, 64, 0.94));
}
.v5b-tile-btn.is-gold-fever .v5b-tile-rim {
  background: linear-gradient(145deg, #ffffff 0%, #ffe97d 32%, #d9910e 66%, #fff5b3 100%);
}
.v5b-tile-btn.is-gold-fever .v5b-tile-face {
  background: radial-gradient(circle at 50% 25%, #fff9c9 0%, #f5c33b 58%, #bd7a08 100%);
}
.v5b-tile-btn.is-flame-thaw {
  filter: drop-shadow(0 0 13px rgba(255, 114, 28, 0.9));
}
.v5b-tile-btn.is-flame-thaw .v5b-tile-face {
  background: radial-gradient(circle at 50% 35%, #b33809 0%, #5e1504 68%, #2e0702 100%);
}
.v5b-tile-btn.is-flame-thaw .v5b-twist-label {
  color: #ffe399;
}
.v5b-tile-btn.is-crossroads-diag .v5b-tile-rim {
  background: linear-gradient(145deg, #ffd1e0 0%, #d43f6a 38%, #f5c654 74%, #7a1431 100%);
}
.v5b-tile-btn.is-spiral-core {
  filter: drop-shadow(0 0 16px rgba(46, 232, 152, 0.92));
}
.v5b-tile-btn.is-spiral-core .v5b-tile-face {
  background: radial-gradient(circle at 50% 30%, #177851 0%, #093d29 66%, #041f14 100%);
}
.v5b-tile-btn.is-spiral-core .v5b-tile-points {
  color: #fff2a6;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.9);
}
.v5b-tile-btn.is-pyramid-apex {
  filter: drop-shadow(0 0 15px rgba(255, 208, 72, 0.95));
}
.v5b-tile-btn.is-pyramid-apex .v5b-tile-face {
  background: radial-gradient(circle at 50% 28%, #ffe899 0%, #d48d1a 58%, #704104 100%);
}
.v5b-tile-btn.is-pyramid-apex .v5b-tile-points {
  color: #2b1402;
}
.v5b-modifier-pip {
  position: absolute;
  top: 2px;
  left: 12%;
  z-index: 5;
  padding: 0 4px;
  border-radius: 4px;
  background: #8f1629;
  border: 1px solid #ffe285;
  color: #fff5d1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 8.5px;
  font-weight: 800;
  line-height: 1.25;
}
.v5b-modifier-pip.is-gold {
  background: #472804;
  color: #ffe380;
}
.v5b-turf-bar {
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1.5px solid #e6be63;
  background: linear-gradient(180deg, #162a57 0%, #0a1633 100%);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 800;
  color: #ffe7a1;
}
.v5b-turf-track {
  flex: 1;
  height: 7px;
  border-radius: 999px;
  background: #5c1324;
  overflow: hidden;
  border: 1px solid rgba(255, 232, 165, 0.45);
}
.v5b-turf-fill {
  height: 100%;
  background: linear-gradient(90deg, #21c97b, #80ffbe);
}
.v5b-draft-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  width: 100%;
}
.v5b-draft-plaque {
  appearance: none;
  text-align: left;
  padding: 9px 11px;
  border-radius: 10px;
  border: 2px solid #d9ab4c;
  background: linear-gradient(180deg, #1b3266 0%, #0d1d42 100%);
  color: #fff7e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
}
.v5b-draft-plaque.is-picked {
  border-color: #5ef0a7;
  background: linear-gradient(180deg, #114730 0%, #082418 100%);
}
.v5b-draft-plaque.is-banned {
  border-color: #d94c64;
  background: linear-gradient(180deg, #471420 0%, #24080f 100%);
  opacity: 0.65;
  text-decoration: line-through;
}
.v5b-draft-plaque:disabled {
  cursor: default;
}

/* Locked Tile (Heavy Crossed Iron Chains & Central Gold Brass Padlock) */
.v5b-tile-btn.is-padlocked .v5b-tile-rim {
  background: linear-gradient(148deg, #cfb176 0%, #7d5b2d 34%, #3d2a12 68%, #9c743c 100%);
}
.v5b-tile-btn.is-padlocked .v5b-tile-face {
  background: radial-gradient(circle at 50% 35%, #755838 0%, #45321e 62%, #261a0f 100%);
  justify-content: flex-end;
  padding-bottom: 5px;
}
.v5b-tile-btn.is-padlocked .v5b-tile-points {
  color: #ffe39e;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.92);
  font-size: clamp(13px, 3.6vw, 18px);
}
.v5b-chains-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
}

/* Shattering Chain Animation (.is-shattering) */
.v5b-tile-btn.is-shattering {
  animation: v5b-tile-shatter-shake 0.72s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 0 18px rgba(255, 214, 92, 0.98));
  z-index: 12;
}
.v5b-tile-btn.is-shattering::after {
  content: '';
  position: absolute;
  inset: -6px;
  background: radial-gradient(circle, rgba(255, 244, 179, 0.92) 0%, rgba(255, 178, 46, 0.45) 45%, rgba(255, 178, 46, 0) 74%);
  pointer-events: none;
  animation: v5b-shatter-flash 0.72s ease-out forwards;
}
.v5b-tile-btn.is-shattering .v5b-chain-strand-a {
  transform-origin: center;
  animation: v5b-chain-fly-left 0.68s ease-out forwards;
}
.v5b-tile-btn.is-shattering .v5b-chain-strand-b {
  transform-origin: center;
  animation: v5b-chain-fly-right 0.68s ease-out forwards;
}
.v5b-tile-btn.is-shattering .v5b-padlock-body {
  transform-origin: center;
  animation: v5b-padlock-pop 0.65s ease-out forwards;
}

/* Fogged, Frozen, and Cleared States */
.v5b-tile-btn.is-fogged .v5b-tile-face {
  background: radial-gradient(circle at 50% 35%, #463a75 0%, #231b45 70%, #140f2b 100%);
  color: #dfd6ff;
}
.v5b-tile-btn.is-frozen .v5b-tile-rim {
  background: linear-gradient(145deg, #e0fbff 0%, #52c6f2 45%, #16659c 100%);
}
.v5b-tile-btn.is-frozen .v5b-tile-face {
  background: radial-gradient(circle at 50% 30%, #7adfff 0%, #216e9e 68%, #0f3a5c 100%);
  color: #e8fcff;
}
.v5b-tile-btn.is-cleared-win .v5b-tile-rim {
  background: linear-gradient(145deg, #86e3b3 0%, #267850 60%, #123d28 100%);
  opacity: 0.78;
}
.v5b-tile-btn.is-cleared-win .v5b-tile-face {
  background: radial-gradient(circle, #134a31 0%, #092418 100%);
  color: #7df2b8;
}
.v5b-tile-btn.is-cleared-miss .v5b-tile-rim {
  background: linear-gradient(145deg, #6b7285 0%, #343b4a 100%);
  opacity: 0.56;
}
.v5b-tile-btn.is-cleared-miss .v5b-tile-face {
  background: #141b2b;
  color: #8b95ab;
}
.v5b-tile-btn.is-rival-claimed .v5b-tile-rim {
  background: linear-gradient(145deg, #ff8599 0%, #8f1d32 65%, #470a16 100%);
  opacity: 0.84;
}
.v5b-tile-btn.is-rival-claimed .v5b-tile-face {
  background: radial-gradient(circle, #5e1222 0%, #2b070f 100%);
  color: #ffb8c4;
}
.v5b-cleared-label {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

/* Forced Tile & Spotlight Sweep */
.v5b-tile-btn.is-forced {
  filter: drop-shadow(0 0 16px rgba(255, 224, 102, 0.98));
  transform: scale(1.04);
  z-index: 10;
  animation: v5b-forced-bounce 1.2s ease-in-out infinite;
}
.v5b-tile-btn.is-dimmed {
  opacity: 0.42;
  filter: grayscale(0.35);
}
.v5b-tile-btn.is-spotlight-sweep {
  filter: drop-shadow(0 0 18px #fff2a6) brightness(1.22);
  transform: scale(1.06);
  z-index: 11;
}

/* SCREW RIVAL Target Mode */
.v5b-tile-btn.is-screw-target {
  cursor: crosshair;
  filter: drop-shadow(0 0 14px rgba(255, 58, 74, 0.92));
  animation: v5b-screw-target-pulse 0.95s ease-in-out infinite;
}
.v5b-tile-btn.is-screw-target .v5b-tile-rim {
  background: linear-gradient(145deg, #ff99a1 0%, #e62232 45%, #8a0815 100%);
}
.v5b-screw-reticle {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(168, 12, 24, 0.28);
  pointer-events: none;
}

/* ============================================================================
   BOTTOM CURVED MAHOGANY & BRASS CONTESTANT PODIUM LEDGE
   ============================================================================ */
.v5b-podium-ledge-wrap {
  position: relative;
  z-index: 14;
  width: 100%;
  max-width: 860px;
  margin: 2px auto 0;
  padding-top: 4px;
}
.v5b-podium-ledge {
  position: relative;
  border-radius: 24px 24px 0 0;
  padding: 4px 4px 0;
  background: linear-gradient(180deg, #fff0b3 0%, #d49f3a 35%, #754b10 80%, #523209 100%);
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.68);
}
.v5b-podium-wood {
  position: relative;
  border-radius: 20px 20px 0 0;
  padding: 8px 12px max(8px, env(safe-area-inset-bottom));
  background:
    radial-gradient(ellipse 60% 70% at 24% 15%, rgba(214, 126, 62, 0.34) 0%, rgba(110, 48, 22, 0) 68%),
    repeating-linear-gradient(92deg, rgba(255, 196, 130, 0.04) 0px, rgba(255, 196, 130, 0.04) 2px, transparent 2px, transparent 9px),
    linear-gradient(180deg, #7a3c1d 0%, #52230f 55%, #341407 100%);
  box-shadow: inset 0 4px 10px rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

/* Chunky Glossy 3D Red Dome SCREW RIVAL! Buzzer */
.v5b-screw-station {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.v5b-screw-collar {
  position: relative;
  padding: 5px 8px 7px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f7d983 0%, #b58024 45%, #5c3a0b 100%);
  box-shadow:
    0 6px 14px rgba(0, 0, 0, 0.72),
    inset 0 2px 1px rgba(255, 249, 214, 0.85);
}
.v5b-screw-btn {
  position: relative;
  appearance: none;
  border: 2px solid #ff9191;
  border-radius: 999px;
  min-width: 106px;
  min-height: 48px;
  padding: 6px 13px;
  background: radial-gradient(ellipse 75% 58% at 38% 26%, #ff8585 0%, #e02026 38%, #990a10 80%, #610408 100%);
  color: #fff7e6;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  text-shadow: 0 2px 4px rgba(64, 0, 4, 0.9);
  box-shadow:
    0 6px 0 #590408,
    0 10px 16px rgba(0, 0, 0, 0.65),
    inset 0 4px 8px rgba(255, 224, 224, 0.42);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease, filter 0.14s ease;
}
.v5b-screw-btn::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 16%;
  right: 16%;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.56) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}
.v5b-screw-btn:not(:disabled):hover {
  filter: brightness(1.1);
}
.v5b-screw-btn:not(:disabled):active {
  transform: translateY(4px);
  box-shadow: 0 2px 0 #590408, 0 4px 8px rgba(0, 0, 0, 0.6);
}
.v5b-screw-btn.is-armed {
  border-color: #ffe885;
  box-shadow:
    0 0 20px rgba(255, 58, 68, 0.95),
    0 4px 0 #590408,
    inset 0 4px 10px rgba(255, 240, 200, 0.55);
  animation: v5b-buzzer-armed 0.9s ease-in-out infinite;
}
.v5b-screw-btn:disabled {
  background: radial-gradient(ellipse 75% 58% at 38% 26%, #7d6864 0%, #4d3b38 52%, #2b1f1d 100%);
  border-color: #786258;
  color: #bdaea8;
  box-shadow: 0 4px 0 #1f1513, 0 6px 10px rgba(0, 0, 0, 0.5);
  cursor: not-allowed;
}
.v5b-screw-count-pip {
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 24px;
  height: 24px;
  padding: 0 5px;
  border-radius: 999px;
  border: 1.5px solid #fff3c2;
  background: linear-gradient(180deg, #ffe285 0%, #c98614 100%);
  color: #291302;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.65);
}

/* Optional Sponsor Dare Brass Tag */
.v5b-dare-tag {
  display: none;
  align-items: center;
  gap: 7px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1.5px solid #e6be63;
  background: linear-gradient(180deg, #2d1e0d 0%, #1a1006 100%);
  color: #ffe8a6;
  font-size: 11px;
  line-height: 1.2;
  max-width: 220px;
  box-shadow: inset 0 1px 0 rgba(255, 240, 190, 0.35), 0 3px 8px rgba(0, 0, 0, 0.55);
}
.v5b-dare-tag.is-completed {
  border-color: #5ee8a4;
  background: linear-gradient(180deg, #0d3b26 0%, #072115 100%);
  color: #a6ffd2;
}
.v5b-dare-kicker {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: #ffd36b;
  text-transform: uppercase;
}

/* 3 Recessed Circular Brass Cups for Podium Lucky Charms */
.v5b-charm-cups-row {
  display: flex;
  align-items: center;
  gap: 9px;
  position: relative;
}
.v5b-charm-cup-btn {
  position: relative;
  appearance: none;
  border: none;
  padding: 4px;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: linear-gradient(160deg, #fff1b8 0%, #cc9633 38%, #633e0d 78%, #d9a743 100%);
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.72),
    inset 0 2px 2px rgba(255, 250, 224, 0.75);
  cursor: pointer;
  transition: transform 0.14s ease, filter 0.14s ease;
}
.v5b-charm-cup-btn:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
}
.v5b-charm-cup-well {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 62%, #4a3113 0%, #241608 68%, #120a03 100%);
  box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.88), inset 0 -1px 2px rgba(255, 224, 138, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.v5b-charm-prop-svg {
  width: 50px;
  height: 50px;
  margin-top: -6px;
  filter: drop-shadow(0 5px 6px rgba(0, 0, 0, 0.8));
  transition: transform 0.18s ease;
}
.v5b-charm-cup-btn:hover .v5b-charm-prop-svg {
  transform: translateY(-3px) scale(1.06);
}
.v5b-charm-cup-empty {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(235, 200, 126, 0.42);
  text-transform: uppercase;
}
.v5b-charm-cup-btn.is-triggered {
  box-shadow:
    0 0 22px rgba(255, 214, 79, 0.95),
    0 0 40px rgba(255, 196, 56, 0.65);
  animation: v5b-charm-trigger 1.1s ease-out;
}

/* Tactile Brass Tooltip Popover for Lucky Charms */
.v5b-charm-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  right: 0;
  width: min(280px, calc(100vw - 24px));
  padding: 10px 12px;
  border-radius: 12px;
  border: 2px solid #f0c969;
  background: linear-gradient(180deg, #1b2f5e 0%, #0b1633 100%);
  color: #fff6e0;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.85);
  z-index: 40;
  text-align: left;
}
.v5b-charm-tooltip-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 13.5px;
  font-weight: 800;
  color: #ffe28a;
  margin-bottom: 2px;
}
.v5b-charm-tooltip-tag {
  font-size: 11px;
  font-style: italic;
  color: #bfd4f7;
  margin-bottom: 5px;
}
.v5b-charm-tooltip-effect {
  font-size: 12px;
  font-weight: 700;
  color: #88f7c0;
  line-height: 1.3;
}
.v5b-charm-tooltip-origin {
  font-size: 10.5px;
  color: #d6c198;
  margin-top: 4px;
}

/* ============================================================================
   NON-BOXY PHYSICAL BROADCAST MODALS (WHEEL, WAGER DIAL, CURTAIN CALL)
   Solid radial theater scrims + sculpted brass/print UI (zero glass-blur filters).
   ============================================================================ */
.v5b-modal-layer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  overflow-y: auto;
  background: radial-gradient(circle at 50% 42%, rgba(16, 30, 68, 0.90) 0%, rgba(4, 8, 20, 0.96) 100%);
}
.v5b-modal-layer:empty {
  display: none;
}

/* Shared Tactile Brass Stage Buttons */
.v5b-cta-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 20px;
  border-radius: 999px;
  border: 2px solid #fff0b3;
  background: linear-gradient(180deg, #ffe58f 0%, #e0a326 52%, #ad700d 100%);
  color: #261403;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 13.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  box-shadow: 0 5px 0 #5e3804, 0 10px 20px rgba(0, 0, 0, 0.65);
  cursor: pointer;
  transition: transform 0.12s ease, filter 0.12s ease;
}
.v5b-cta-btn:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}
.v5b-cta-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #5e3804;
}
.v5b-cta-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.v5b-cta-btn.is-emerald {
  border-color: #a8ffd6;
  background: linear-gradient(180deg, #5ef0a7 0%, #19a864 55%, #0c6b3d 100%);
  color: #032112;
  box-shadow: 0 5px 0 #074225, 0 10px 20px rgba(0, 0, 0, 0.65);
}
.v5b-cta-btn.is-secondary {
  border-color: #d4a648;
  background: linear-gradient(180deg, #1d356b 0%, #0d1c3d 100%);
  color: #fff4d9;
  box-shadow: 0 4px 0 #060f24, 0 8px 16px rgba(0, 0, 0, 0.55);
}

/* --- A. PHYSICAL BRASS STAGE WHEEL MODAL --- */
.v5b-wheel-console {
  position: relative;
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}
.v5b-marquee-ribbon {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 5px 18px;
  background: linear-gradient(180deg, #8c1a2e 0%, #520c1a 100%);
  border: 2px solid #f5cf73;
  clip-path: polygon(10px 0%, calc(100% - 10px) 0%, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0% 50%);
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.09em;
  color: #ffe699;
}
.v5b-modal-headline {
  margin: 0;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(20px, 5vw, 27px);
  font-weight: 800;
  color: #fff4d2;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.85);
}
.v5b-wheel-housing {
  position: relative;
  width: min(306px, 78vw);
  height: min(306px, 78vw);
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
  cursor: grab;
}
.v5b-wheel-housing:active {
  cursor: grabbing;
}
.v5b-wheel-clapper {
  position: absolute;
  top: -14px;
  left: 50%;
  transform: translateX(-50%);
  width: 38px;
  height: 44px;
  z-index: 8;
  transform-origin: 50% 18%;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.75));
  transition: transform 0.07s ease-out;
}
.v5b-wheel-clapper.is-tick {
  transform: translateX(-50%) rotate(-24deg);
}
.v5b-wheel-rotor {
  width: 100%;
  height: 100%;
  will-change: transform;
  filter: drop-shadow(0 16px 28px rgba(0, 0, 0, 0.8));
}
.v5b-wheel-hint {
  font-size: 12px;
  color: #d6e4ff;
  font-weight: 600;
}
.v5b-wheel-outcome-plaque {
  width: 100%;
  padding: 12px 18px;
  background: linear-gradient(180deg, #fff8e3 0%, #edd9ab 100%);
  border: 2.5px solid #d49e35;
  border-radius: 14px;
  color: #241607;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.72);
}
.v5b-wheel-outcome-plaque h3 {
  margin: 0 0 4px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 18px;
  color: #7d4506;
}
.v5b-wheel-outcome-plaque p {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
}

/* --- B. BRASS POWER-PLAY WAGER DIAL MODAL --- */
.v5b-dial-console {
  position: relative;
  width: 100%;
  max-width: 470px;
  padding: 5px;
  border-radius: 26px;
  background: linear-gradient(155deg, #fff1b8 0%, #d49f3a 28%, #6d4710 62%, #e8c062 100%);
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.85);
}
.v5b-dial-inner {
  border-radius: 22px;
  padding: 18px 18px 20px;
  background:
    radial-gradient(ellipse 90% 55% at 50% 10%, rgba(44, 96, 196, 0.42) 0%, transparent 72%),
    linear-gradient(180deg, #162b5c 0%, #091533 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 11px;
  text-align: center;
}
.v5b-dial-gauge-wrap {
  position: relative;
  width: min(290px, 82vw);
  touch-action: none;
  user-select: none;
  cursor: pointer;
}
.v5b-dial-readout-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: -12px;
}
.v5b-knurled-step-btn {
  appearance: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid #ffe89e;
  background: linear-gradient(180deg, #e8bc58 0%, #8f5c14 100%);
  color: #211203;
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
}
.v5b-knurled-step-btn:active {
  transform: translateY(2px);
}
.v5b-dial-digital-plate {
  min-width: 158px;
  padding: 7px 14px;
  border-radius: 10px;
  border: 2px solid #d9a843;
  background: #071024;
  color: #ffe285;
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 800;
  box-shadow: inset 0 3px 10px rgba(0, 0, 0, 0.85);
}
.v5b-chip-row {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
.v5b-stake-chip {
  appearance: none;
  min-width: 60px;
  height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  border: 2px dashed #f5d073;
  background: linear-gradient(180deg, #274485 0%, #11224a 100%);
  color: #fff3cf;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.55);
}
.v5b-stake-chip.is-allin {
  background: linear-gradient(180deg, #b82531 0%, #6b0d17 100%);
  border-style: solid;
  border-color: #ffe38f;
  color: #fff6d9;
}
.v5b-wager-stakes-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
}
.v5b-stake-plaque {
  padding: 8px 10px;
  border-radius: 10px;
  border: 1.5px solid #48d994;
  background: linear-gradient(180deg, #0d3b27 0%, #072116 100%);
  color: #9cffcf;
}
.v5b-stake-plaque.is-risk {
  border-color: #f06578;
  background: linear-gradient(180deg, #4a121d 0%, #26070d 100%);
  color: #ffb8c3;
}
.v5b-stake-plaque-lbl {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  opacity: 0.9;
}
.v5b-stake-plaque-val {
  font-family: 'JetBrains Mono', monospace;
  font-size: 19px;
  font-weight: 800;
}

/* --- C. POST-MATCH BROADSHEET NEWSPAPER & CALL-SHEET CURTAIN CALL --- */
.v5b-curtain-spread {
  position: relative;
  z-index: 5;
  width: 100%;
  max-width: 960px;
  margin: 12px auto 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
  padding: 0 6px;
}
.v5b-broadsheet-paper {
  position: relative;
  padding: 16px 18px 18px;
  border-radius: 4px;
  background:
    repeating-linear-gradient(180deg, rgba(112, 82, 38, 0.03) 0px, rgba(112, 82, 38, 0.03) 1px, transparent 1px, transparent 22px),
    linear-gradient(180deg, #faf1dc 0%, #ede0c2 100%);
  color: #1f170f;
  border: 2px solid #c9a66b;
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.72), inset 0 0 0 4px #faf1dc, inset 0 0 0 5px rgba(84, 58, 24, 0.25);
  transform: rotate(-0.45deg);
}
.v5b-paper-masthead {
  border-top: 3px double #2b1f14;
  border-bottom: 3px double #2b1f14;
  padding: 5px 0;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.v5b-paper-name {
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(14px, 3.6vw, 20px);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #1a120b;
}
.v5b-paper-edition {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10.5px;
  font-weight: 700;
  color: #634928;
  text-transform: uppercase;
}
.v5b-paper-headline {
  margin: 0 0 8px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: clamp(19px, 4.8vw, 28px);
  font-weight: 800;
  line-height: 1.15;
  color: #1c120a;
}
.v5b-verdict-stamp {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 2.5px solid #0e7040;
  border-radius: 6px;
  color: #0b5932;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transform: rotate(-2deg);
  margin-bottom: 8px;
}
.v5b-verdict-stamp.is-loss {
  border-color: #9e1b2d;
  color: #8c1425;
}
.v5b-paper-quotes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(64, 42, 18, 0.28);
}
.v5b-paper-quote-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.v5b-paper-bust {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid #b5842e;
  background: radial-gradient(circle, #1f3970, #0c1836);
  overflow: hidden;
  flex-shrink: 0;
}
.v5b-paper-bust img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}
.v5b-wire-list {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(64, 42, 18, 0.35);
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: #362617;
}

/* Studio Production Call-Sheet Clipboard */
.v5b-callsheet-card {
  position: relative;
  padding: 20px 16px 16px;
  border-radius: 12px;
  background: linear-gradient(180deg, #fffdf7 0%, #f2e8d3 100%);
  color: #1f170f;
  border: 2.5px solid #c99838;
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.72);
  transform: rotate(0.4deg);
}
.v5b-callsheet-clip {
  position: absolute;
  top: -11px;
  left: 50%;
  transform: translateX(-50%);
  width: 84px;
  height: 20px;
  border-radius: 8px;
  border: 2px solid #6b450f;
  background: linear-gradient(180deg, #fff0b8 0%, #c9922c 100%);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.45);
}
.v5b-callsheet-tally {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 10px 0;
}
.v5b-tally-box {
  padding: 10px;
  border-radius: 8px;
  border: 1.5px solid #cbb183;
  background: #fffaf0;
  text-align: center;
}
.v5b-tally-box.is-win {
  border-color: #c9922c;
  background: linear-gradient(180deg, #fff7d6 0%, #f7e4a8 100%);
}
.v5b-tally-label {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6b4e29;
}
.v5b-tally-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 800;
  color: #1a120a;
}
.v5b-callsheet-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin: 10px 0;
}
.v5b-cs-stat {
  padding: 8px 6px;
  border-radius: 8px;
  background: #14254d;
  border: 1.5px solid #d9ab4c;
  color: #fff5da;
  text-align: center;
}
.v5b-cs-stat-k {
  font-size: 9.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #bcd0f5;
}
.v5b-cs-stat-v {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  font-weight: 800;
  color: #ffe38a;
  margin-top: 2px;
}
.v5b-curtain-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}

/* ============================================================================
   KEYFRAME ANIMATIONS (RESPECTING REDUCED MOTION)
   ============================================================================ */
@keyframes v5b-actor-breathe {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}
@keyframes v5b-medallion-pulse {
  0%, 100% { opacity: 0.84; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.07); }
}
@keyframes v5b-wheel-idle {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes v5b-bounty-flicker {
  0%, 100% { filter: drop-shadow(0 0 11px rgba(255, 96, 18, 0.85)); }
  50% { filter: drop-shadow(0 0 18px rgba(255, 162, 46, 1)); }
}
@keyframes v5b-forced-bounce {
  0%, 100% { transform: scale(1.04); }
  50% { transform: scale(1.08); }
}
@keyframes v5b-screw-target-pulse {
  0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 48, 66, 0.85)); }
  50% { filter: drop-shadow(0 0 19px rgba(255, 92, 102, 1)); }
}
@keyframes v5b-buzzer-armed {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}
@keyframes v5b-alert-pulse {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.12); }
}
@keyframes v5b-charm-trigger {
  0% { transform: scale(1); }
  30% { transform: scale(1.16); }
  100% { transform: scale(1); }
}
@keyframes v5b-tile-shatter-shake {
  0% { transform: translate(0, 0) scale(1); }
  15% { transform: translate(-4px, -2px) rotate(-2.5deg) scale(1.06); }
  30% { transform: translate(4px, 2px) rotate(2.5deg) scale(1.08); }
  45% { transform: translate(-3px, 1px) rotate(-1.5deg) scale(1.06); }
  70% { transform: scale(1.04); }
  100% { transform: translate(0, 0) scale(1); }
}
@keyframes v5b-shatter-flash {
  0% { opacity: 0.95; transform: scale(0.7); }
  45% { opacity: 0.85; transform: scale(1.18); }
  100% { opacity: 0; transform: scale(1.42); }
}
@keyframes v5b-chain-fly-left {
  0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate(-28px, -18px) rotate(-24deg); }
}
@keyframes v5b-chain-fly-right {
  0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  100% { opacity: 0; transform: translate(28px, -18px) rotate(24deg); }
}
@keyframes v5b-padlock-pop {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  35% { opacity: 1; transform: translateY(-10px) scale(1.18); }
  100% { opacity: 0; transform: translateY(24px) scale(0.65); }
}

/* ============================================================================
   RESPONSIVE BREAKPOINTS: DESKTOP (>= 768px) & LANDSCAPE PHONE (844x390)
   ============================================================================ */
@media (min-width: 768px) and (min-height: 501px) {
  .v5b-stage-canvas {
    padding: 0 22px 0;
  }
  .v5b-venue-chip {
    display: inline-block;
  }
  .v5b-stage-vista {
    min-height: 162px;
    margin-top: -14px;
    padding: 0 20px 2px;
  }
  .v5b-host-cutout {
    height: 170px;
    max-width: 158px;
    margin-bottom: -22px;
    margin-left: 24px;
  }
  .v5b-rival-stage-stack {
    width: 156px;
    height: 168px;
    margin-bottom: -22px;
    margin-right: 24px;
  }
  .v5b-rival-cutout {
    bottom: 46px;
    height: 122px;
    max-width: 120px;
  }
  .v5b-challenger-podium-svg {
    width: 136px;
  }
  .v5b-center-medallion-zone {
    padding-bottom: 4px;
  }
  .v5b-medallion-svg {
    width: 104px;
    height: 104px;
  }
  .v5b-turn-ribbon {
    font-size: 10.5px;
    padding: 2px 12px;
  }
  .v5b-score-plaques-row {
    max-width: 820px;
    gap: 134px;
    margin: -52px auto 8px;
  }
  .v5b-score-plaque-face {
    padding: 5px 14px;
    min-height: 40px;
  }
  .v5b-score-plaque-main {
    font-size: 14px;
  }
  .v5b-score-plaque-pts {
    font-size: 15px;
  }
  .v5b-speech-strip {
    max-width: 820px;
    margin-bottom: 4px;
  }
  .v5b-speech-bubble {
    font-size: 12px;
    padding: 5px 12px;
  }
  /* True 2.5D perspective tilt on desktop fitting 100% above 800px fold! */
  .v5b-board-stage-wrap {
    perspective: 1050px;
    max-width: 790px;
    padding: 12px 6px 4px;
  }
  .v5b-board-tray {
    transform: rotateX(9deg);
    padding: 6px;
  }
  .v5b-board-enamel {
    padding: 34px 12px 10px;
  }
  .v5b-crests-grid {
    top: -17px;
    left: 12px;
    right: 12px;
    gap: 9px;
  }
  .v5b-col-crest {
    min-height: 44px;
    padding: 10px 6px 5px;
  }
  .v5b-crest-medallion {
    width: 24px;
    height: 24px;
    top: -12px;
  }
  .v5b-crest-medallion svg {
    width: 14px;
    height: 14px;
  }
  .v5b-tiles-grid {
    gap: 7px 9px;
  }
  .v5b-tile-btn {
    aspect-ratio: auto;
    height: clamp(60px, 8.8vh, 74px);
    min-height: 60px;
  }
  .v5b-tile-rim {
    padding: 3.5px;
  }
  .v5b-tile-emblem-svg, .v5b-twist-svg {
    width: 28px;
    height: 28px;
  }
  .v5b-tile-points {
    font-size: 18px;
  }
  .v5b-podium-ledge-wrap {
    margin-top: 2px;
    padding-top: 2px;
  }
  .v5b-podium-wood {
    padding: 8px 20px 8px;
  }
  .v5b-screw-btn {
    min-width: 134px;
    min-height: 48px;
    font-size: 13px;
  }
  .v5b-dare-tag {
    display: flex;
  }
  .v5b-charm-cup-btn {
    width: 60px;
    height: 60px;
  }
  .v5b-charm-prop-svg {
    width: 48px;
    height: 48px;
  }
  .v5b-curtain-spread {
    grid-template-columns: 1.12fr 0.88fr;
    align-items: start;
    gap: 18px;
  }
}

/* ============================================================================
   PHONE LANDSCAPE 2-COLUMN SIDE-BY-SIDE BROADCAST SPLIT-STAGE (844x390, 932x430, 640x360)
   Left Column: Stage Vista + Score Plaques + Speech + Mahogany Podium (Screw + 3 Charms)
   Right Column: Full Tilted 2.5D Octagonal Stage Board — ZERO clipped buttons!
   ============================================================================ */
@media (max-height: 500px) and (orientation: landscape) {
  .v5b-root {
    height: 100dvh;
    overflow: hidden;
  }
  .v5b-stage-canvas {
    display: grid;
    grid-template-columns: minmax(248px, 39%) minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr);
    column-gap: 10px;
    row-gap: 2px;
    height: 100dvh;
    min-height: 0;
    max-height: 100dvh;
    max-width: 100%;
    padding: 3px 10px 4px;
    overflow: hidden;
  }
  .v5b-top-rail {
    grid-column: 1 / -1;
    grid-row: 1;
    padding: 2px 2px 0;
    order: unset;
  }
  .v5b-brass-pill-btn, .v5b-brass-badge {
    min-height: 26px;
    padding: 2px 8px;
    font-size: 11px;
  }
  .v5b-brass-icon-btn {
    width: 26px;
    height: 26px;
  }
  .v5b-venue-chip {
    display: inline-block;
    font-size: 10.5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 240px;
  }
  .v5b-landscape-left-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    grid-column: 1;
    grid-row: 2;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    gap: 2px;
  }
  .v5b-landscape-right-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    grid-column: 2;
    grid-row: 2;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    gap: 3px;
  }
  .v5b-stage-vista,
  .v5b-score-plaques-row,
  .v5b-speech-strip,
  .v5b-alert-slot,
  .v5b-board-stage-wrap,
  .v5b-podium-ledge-wrap {
    order: unset;
  }
  .v5b-stage-vista {
    min-height: 98px;
    margin-top: 0;
    padding: 0;
  }
  .v5b-host-cutout {
    height: 96px;
    max-width: 82px;
    margin-bottom: -10px;
    margin-left: 0;
  }
  .v5b-rival-stage-stack {
    width: 86px;
    height: 96px;
    margin-bottom: -10px;
    margin-right: 0;
  }
  .v5b-rival-cutout {
    bottom: 24px;
    height: 70px;
    max-width: 72px;
  }
  .v5b-challenger-podium-svg {
    width: 76px;
  }
  .v5b-medallion-svg {
    width: 68px;
    height: 68px;
  }
  .v5b-turn-ribbon {
    font-size: 9px;
    padding: 1px 8px;
    margin-top: -5px;
  }
  .v5b-score-plaques-row {
    max-width: 100%;
    gap: 5px;
    margin: -6px 0 0;
    padding: 0;
  }
  .v5b-score-plaque-face {
    min-height: 30px;
    padding: 3px 8px;
  }
  .v5b-score-plaque-main {
    font-size: 10px;
  }
  .v5b-score-plaque-pts {
    font-size: 11px;
  }
  .v5b-score-plaque-sub {
    font-size: 8.5px;
    gap: 5px;
  }
  .v5b-speech-strip {
    margin: 0;
    padding: 0;
    max-width: 100%;
  }
  .v5b-speech-bubble {
    padding: 4px 8px;
    font-size: 10px;
    line-height: 1.22;
    flex-basis: 100%;
    max-height: 54px;
    overflow: hidden;
  }
  .v5b-speech-bubble.is-rival {
    display: none;
  }
  .v5b-onboarding-tag {
    display: none;
  }
  .v5b-podium-ledge-wrap {
    margin: 0;
    padding-top: 0;
    max-width: 100%;
  }
  .v5b-podium-ledge {
    border-radius: 16px;
    padding: 3px;
  }
  .v5b-podium-wood {
    border-radius: 13px;
    padding: 5px 8px;
    gap: 6px;
  }
  .v5b-screw-collar {
    padding: 4px 5px 5px;
  }
  .v5b-screw-btn {
    min-height: 38px;
    min-width: 78px;
    padding: 4px 8px;
    font-size: 9.5px;
    box-shadow: 0 3px 0 #590408, 0 5px 8px rgba(0, 0, 0, 0.6);
  }
  .v5b-screw-count-pip {
    width: 19px;
    height: 19px;
    min-width: 19px;
    font-size: 9.5px;
  }
  .v5b-dare-tag {
    display: none !important;
  }
  .v5b-charm-cups-row {
    gap: 5px;
  }
  .v5b-charm-cup-btn {
    width: 42px;
    height: 42px;
    padding: 3px;
  }
  .v5b-charm-prop-svg {
    width: 34px;
    height: 34px;
    margin-top: -3px;
  }
  .v5b-charm-cup-empty {
    font-size: 6.5px;
  }
  .v5b-alert-ribbon {
    margin: 0;
    padding: 3px 9px;
  }
  .v5b-alert-title {
    font-size: 10.5px;
  }
  .v5b-alert-sub {
    display: none;
  }
  .v5b-board-stage-wrap {
    max-width: 100%;
    padding: 12px 2px 2px;
    perspective: 1100px;
  }
  .v5b-board-tray {
    transform: rotateX(4deg);
    padding: 4px;
    border-radius: 14px;
  }
  .v5b-board-enamel {
    padding: 24px 6px 6px;
    border-radius: 11px;
  }
  .v5b-crests-grid {
    top: -13px;
    left: 6px;
    right: 6px;
    gap: 4px;
  }
  .v5b-col-crest {
    min-height: 32px;
    padding: 7px 3px 3px;
  }
  .v5b-crest-medallion {
    width: 18px;
    height: 18px;
    top: -9px;
  }
  .v5b-crest-medallion svg {
    width: 11px;
    height: 11px;
  }
  .v5b-crest-title {
    font-size: 9.5px;
    -webkit-line-clamp: 1;
  }
  .v5b-tiles-grid {
    gap: 4px 5px;
  }
  .v5b-tile-btn {
    aspect-ratio: auto;
    height: clamp(50px, 16.5vh, 66px);
    min-height: 48px;
  }
  .v5b-tile-rim {
    padding: 2.5px;
  }
  .v5b-tile-emblem-svg, .v5b-twist-svg {
    width: 21px;
    height: 21px;
  }
  .v5b-tile-points {
    font-size: 13.5px;
  }
  .v5b-twist-label {
    font-size: 7.5px;
  }
}

/* Compact 360x640 small portrait phone support */
@media (max-width: 375px) and (orientation: portrait) {
  .v5b-stage-vista {
    min-height: 148px;
  }
  .v5b-host-cutout {
    height: 142px;
    max-width: 122px;
  }
  .v5b-rival-stage-stack {
    width: 118px;
    height: 140px;
  }
  .v5b-rival-cutout {
    bottom: 36px;
    height: 102px;
  }
  .v5b-challenger-podium-svg {
    width: 108px;
  }
  .v5b-medallion-svg {
    width: 80px;
    height: 80px;
  }
  .v5b-tile-btn {
    min-height: 54px;
  }
  .v5b-screw-btn {
    min-width: 96px;
    min-height: 48px;
    font-size: 11px;
  }
  .v5b-charm-cup-btn {
    width: 54px;
    height: 54px;
  }
  .v5b-charm-prop-svg {
    width: 44px;
    height: 44px;
  }
}

/* Very narrow mobile portrait (360px) or 5-6 column late-tier boards */
.v5b-board-tray.is-dense-cols .v5b-crest-title {
  font-size: clamp(8.2px, 2vw, 11.5px);
}
.v5b-board-tray.is-dense-cols .v5b-tile-btn {
  min-height: 54px;
}
.v5b-board-tray.is-dense-cols .v5b-tile-emblem-svg,
.v5b-board-tray.is-dense-cols .v5b-twist-svg {
  width: clamp(19px, 5vw, 28px);
  height: clamp(19px, 5vw, 28px);
}
.v5b-board-tray.is-dense-cols .v5b-tile-points {
  font-size: clamp(11.5px, 3vw, 17px);
}

@media (prefers-reduced-motion: reduce) {
  .v5b-host-cutout,
  .v5b-rival-cutout,
  .v5b-medallion-halo::before,
  .v5b-twist-svg.is-wheel-spin,
  .v5b-tile-btn.is-twist-bounty,
  .v5b-tile-btn.is-forced,
  .v5b-tile-btn.is-screw-target,
  .v5b-screw-btn.is-armed,
  .v5b-alert-ribbon {
    animation: none !important;
  }
}
`;class me{rootEl;stageHostEl;modalLayerEl;activeModel=null;activeCallbacks=null;screwArmed=!1;inspectedCharmId=null;timerIds=[];rafIds=[];modalCleanups=[];keydownHandler=null;fullscreenHandler=null;renderCounter=0;constructor(e){this.rootEl=e,this.injectScopedStyles(),this.rootEl.innerHTML="",this.rootEl.classList.add("v5b-root"),this.stageHostEl=document.createElement("div"),this.stageHostEl.setAttribute("data-v5b-stage","true"),this.rootEl.appendChild(this.stageHostEl),this.modalLayerEl=document.createElement("div"),this.modalLayerEl.className="v5b-modal-layer",this.modalLayerEl.setAttribute("data-v5b-modal-layer","true"),this.rootEl.appendChild(this.modalLayerEl),this.keydownHandler=i=>{i.key==="Escape"&&(this.screwArmed?this.setScrewArmed(!1):this.inspectedCharmId&&(this.inspectedCharmId=null,this.renderCharmTooltip()))},window.addEventListener("keydown",this.keydownHandler),this.fullscreenHandler=()=>this.syncFullscreenButtonState(),document.addEventListener("fullscreenchange",this.fullscreenHandler)}injectScopedStyles(){if(typeof document>"u")return;let e=document.getElementById(te);e||(e=document.createElement("style"),e.id=te,document.head.appendChild(e)),e.textContent!==ne&&(e.textContent=ne)}clearAsyncHooks(){for(const e of this.timerIds)window.clearTimeout(e);this.timerIds=[];for(const e of this.rafIds)window.cancelAnimationFrame(e);this.rafIds=[]}runModalCleanups(){for(const e of this.modalCleanups)try{e()}catch{}this.modalCleanups=[]}getTileCenterViewportCoords(e){const i=typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(e):e.replace(/"/g,'\\"'),a=this.stageHostEl.querySelector(`[data-tile-id="${i}"]`);if(!a)return null;const t=a.getBoundingClientRect();return t.width<=0||t.height<=0?null:{x:t.left+t.width/2,y:t.top+t.height/2}}getMedallionCenterViewportCoords(){const e=this.stageHostEl.querySelector("[data-v5b-medallion]");if(!e)return null;const i=e.getBoundingClientRect();return i.width<=0||i.height<=0?null:{x:i.left+i.width/2,y:i.top+i.height/2}}getScrewButtonViewportCoords(){const e=this.stageHostEl.querySelector("[data-v5b-screw-btn]");if(!e)return null;const i=e.getBoundingClientRect();return i.width<=0||i.height<=0?null:{x:i.left+i.width/2,y:i.top+i.height/2}}triggerTileShatter(e){const i=typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(e):e.replace(/"/g,'\\"'),a=this.stageHostEl.querySelector(`[data-tile-id="${i}"]`);if(!a)return;a.classList.remove("is-shattering"),a.offsetWidth,a.classList.add("is-shattering");const t=window.setTimeout(()=>a.classList.remove("is-shattering"),780);this.timerIds.push(t)}pulseCharm(e){const i=this.stageHostEl.querySelector(`[data-charm-id="${e}"]`);if(!i)return;i.classList.remove("is-triggered"),i.offsetWidth,i.classList.add("is-triggered");const a=window.setTimeout(()=>i.classList.remove("is-triggered"),1200);this.timerIds.push(a)}isScrewArmed(){return this.screwArmed}setScrewArmed(e){const i=this.canUseScrewNow(),a=e&&i;this.screwArmed!==a&&(this.screwArmed=a,this.syncScrewTargetDom(),this.activeCallbacks?.onScrewModeChange?.(this.screwArmed))}setHostSpeech(e,i,a){if(i){const s=this.stageHostEl.querySelector("[data-v5b-host-img]");s&&(s.src=Z(i))}const t=this.stageHostEl.querySelector("[data-v5b-host-line]");t&&(t.textContent=e);const n=this.stageHostEl.querySelector("[data-v5b-onboarding-slot]");n&&(n.innerHTML=a?`<div class="v5b-onboarding-tag">${v("spark",12)} <strong>${r(a.badgeLabel)}:</strong> ${r(a.text)}</div>`:"")}setRivalReaction(e,i){const a=this.stageHostEl.querySelector("[data-v5b-rival-bubble-slot]");if(!a)return;if(!e||!this.activeModel?.challenger){a.innerHTML="";return}const t=i?`${X(this.activeModel.challenger)} · ${i}`:this.activeModel.challenger.name;a.innerHTML=`
      <div class="v5b-speech-bubble is-rival" role="status">
        <span class="v5b-speech-speaker">${v("flame",11)} ${r(t)}</span>
        <span>${r(e)}</span>
      </div>
    `}closeModal(){this.runModalCleanups(),this.modalLayerEl.innerHTML=""}dispose(){this.clearAsyncHooks(),this.runModalCleanups(),this.keydownHandler&&(window.removeEventListener("keydown",this.keydownHandler),this.keydownHandler=null),this.fullscreenHandler&&(document.removeEventListener("fullscreenchange",this.fullscreenHandler),this.fullscreenHandler=null),this.stageHostEl.innerHTML="",this.modalLayerEl.innerHTML="",this.rootEl.classList.remove("v5b-root")}isFullscreenActive(){return typeof document<"u"&&!!document.fullscreenElement}syncFullscreenButtonState(){const e=this.stageHostEl.querySelector("[data-v5-fullscreen-toggle]");if(!e)return;const i=this.isFullscreenActive();e.setAttribute("aria-pressed",String(i)),e.setAttribute("aria-label",i?"Exit Fullscreen":"Enter Fullscreen"),e.title=i?"Exit Fullscreen":"Fullscreen Stage",e.innerHTML=v(i?"fullscreen_exit":"fullscreen_enter",15)}toggleFullscreen(){typeof document>"u"||(document.fullscreenElement?document.exitFullscreen?.().catch(()=>{}):document.documentElement.requestFullscreen?.().catch(()=>{}))}ensureAttached(){this.injectScopedStyles(),(!this.stageHostEl.isConnected||!this.modalLayerEl.isConnected)&&(this.rootEl.innerHTML="",this.rootEl.classList.add("v5b-root"),this.rootEl.appendChild(this.stageHostEl),this.rootEl.appendChild(this.modalLayerEl))}render(e,i){this.ensureAttached(),this.clearAsyncHooks(),this.activeModel=e,this.activeCallbacks=i,this.screwArmed=!1,this.inspectedCharmId=null,this.renderCounter+=1;const a=`b${this.renderCounter}`,{board:t,episode:n,challenger:s}=e,c=ae(n.tierNumber),d=ee[c],l=Z(e.hostPose??"welcome"),y=K(s),k=t.columns.length,f=t.tiles.reduce((b,h)=>Math.max(b,h.rowIndex),0),p=new Map;for(const b of t.tiles)p.set(`${b.rowIndex}:${b.colIndex}`,b);const g=new Set(e.newlyUnlockedTileIds??[]),M=new Set(e.triggeredCharmIds??[]),u=e.screwsRemaining!==void 0?Math.max(0,e.screwsRemaining):t.hasActiveRival?1:0,$=t.hasActiveRival&&u>0&&t.forcedTileId===null,B=(e.playerDisplayName||"YOU").toUpperCase(),L=Math.min(100,Math.round(t.playerScore/Math.max(1,t.soloTargetScore)*100)),C=e.rivalReactionLine??e.lastChallengerAction?.banterLine??null,A=e.rivalActionBadge??(e.lastChallengerAction?this.formatChallengerBadge(e.lastChallengerAction):null),m=t.columns.map(b=>{const h=V[b.domainId]??V[0],I=b.frozenTurnsRemaining>0;return`
          <div
            class="v5b-col-crest ${I?"is-frozen":""}"
            style="--v5b-crest-top:${h.crestTop};--v5b-crest-bot:${h.crestBottom};--v5b-crest-border:${h.crestBorder}"
            data-col-index="${b.colIndex}"
            title="${r(b.wittyTitle)} (${r(b.topicSubtitle)})"
          >
            <span class="v5b-crest-medallion">${Q(b.domainId,"#3b2104",15)}</span>
            <span class="v5b-crest-title">${r(b.wittyTitle)}</span>
            ${I?`<span class="v5b-crest-flag">${v("frost",9)} FROZEN</span>`:b.pickedBy==="RIVAL"?'<span class="v5b-crest-flag" style="background:#5c1122;border-color:#ff94a8;color:#ffd6de;">RIVAL</span>':""}
          </div>
        `}).join(""),w=fe(e.boardTwistId,e.boardTwistLabel),T=pe(e.boardTwistId),x=this.isFullscreenActive(),E=[];for(let b=0;b<=f;b++)for(let h=0;h<k;h++){const I=p.get(`${b}:${h}`);if(!I){E.push("<div></div>");continue}const _=t.columns[h];E.push(this.renderOctagonalTileHtml(I,_,t.forcedTileId,g.has(I.tileId),`${a}_${b}_${h}`,e.tileMetaById?.[I.tileId]))}const S=(e.equippedCharms??[]).slice(0,3),R=[0,1,2].map(b=>{const h=S[b];return h?`
          <button
            type="button"
            class="v5b-charm-cup-btn ${M.has(h.charmId)?"is-triggered":""}"
            data-charm-id="${r(h.charmId)}"
            aria-label="${r(h.name)} — ${r(h.effectSummary)}"
            title="${r(h.name)}: ${r(h.effectSummary)}"
          >
            <span class="v5b-charm-cup-well">
              ${ve(h.svgEmblemKind,h.accentHex)}
            </span>
          </button>
        `:`
            <button type="button" class="v5b-charm-cup-btn" disabled aria-label="Empty podium charm cup ${b+1}" title="Unlock Podium Lucky Charms on your World Tour!">
              <span class="v5b-charm-cup-well">
                <span class="v5b-charm-cup-empty">SLOT ${b+1}</span>
              </span>
            </button>
          `}).join(""),P=e.activeDare?`
        <div class="v5b-dare-tag ${e.dareCompleted?"is-completed":""}" title="${r(e.activeDare.description)}">
          <div>
            <div class="v5b-dare-kicker">${e.dareCompleted?"DARE COMPLETE!":"SPONSOR DARE"} · +${Y(e.activeDare.bonusPurseUsd)}</div>
            <div>${r(e.activeDare.description)}</div>
          </div>
        </div>
      `:"",z=e.tugOfWarTurf?(()=>{const b=Math.max(0,e.tugOfWarTurf.playerTiles),h=Math.max(0,e.tugOfWarTurf.rivalTiles),I=Math.max(1,b+h),_=Math.round(b/I*100);return`
            <div class="v5b-turf-bar" aria-label="Territory Turf You ${b} vs Rival ${h}">
              <span>YOU ${b}</span>
              <div class="v5b-turf-track"><div class="v5b-turf-fill" style="width:${_}%"></div></div>
              <span>RIVAL ${h}${e.tugOfWarTurf.bonusPts?` · +${e.tugOfWarTurf.bonusPts}`:""}</span>
            </div>
          `})():"";this.stageHostEl.innerHTML=`
      <div class="v5b-stage-bg" style="background-image:url('${r(d)}')" aria-hidden="true"></div>

      <div class="v5b-stage-canvas">
        <!-- Top Floating Broadcast Controls -->
        <header class="v5b-top-rail">
          <div class="v5b-rail-group">
            <button type="button" class="v5b-brass-pill-btn" data-v5b-action="back">
              ${v("back",14)} <span>Tour</span>
            </button>
            <span class="v5b-venue-chip">${r(n.venueName)} &middot; ${r(w||n.title)}</span>
          </div>

          <div class="v5b-rail-group">
            ${e.activeWheelBoostLabel?`<span class="v5b-brass-badge is-gold">${v("wheel",13)} ${r(e.activeWheelBoostLabel)}</span>`:T?`<span class="v5b-brass-badge is-gold">${v("spark",12)} ${r(T)}</span>`:""}
            <span class="v5b-brass-badge" title="Live World Audience Watching">
              ${v("eye",13)} ${U(n.baseAudienceWatching)}
            </span>
            <button type="button" class="v5b-brass-pill-btn v5b-brass-icon-btn" data-v5b-action="audio" aria-label="${e.audioEnabled?"Mute Audio":"Unmute Audio"}" title="${e.audioEnabled?"Audio ON":"Audio OFF"}">
              ${v(e.audioEnabled?"sound_on":"sound_off",15)}
            </button>
            <button type="button" class="v5b-brass-pill-btn v5b-brass-icon-btn" data-v5b-action="howto" aria-label="Show Rules" title="How To Play">
              ${v("help",15)}
            </button>
            <button
              type="button"
              class="v5b-brass-pill-btn v5b-brass-icon-btn"
              data-v5-fullscreen-toggle
              aria-pressed="${x}"
              aria-label="${x?"Exit Fullscreen":"Enter Fullscreen"}"
              title="${x?"Exit Fullscreen":"Fullscreen Stage"}"
            >
              ${v(x?"fullscreen_exit":"fullscreen_enter",15)}
            </button>
          </div>
        </header>

        <!-- Landscape Left Column (display: contents on Portrait & Desktop!) -->
        <div class="v5b-landscape-left-col">
          <!-- Live Theatrical Stage Upper Vista -->
          <section class="v5b-stage-vista" aria-label="Broadcast Stage">
            <!-- Stage Left: Host Max Sterling -->
            <div class="v5b-host-zone">
              <div class="v5b-actor-wrap">
                <img
                  class="v5b-host-cutout"
                  data-v5b-host-img
                  src="${r(l)}"
                  alt="Host Max Sterling"
                  decoding="async"
                />
              </div>
            </div>

            <!-- Stage Center: Glowing 6-Wedge Jewel Championship Medallion -->
            <div class="v5b-center-medallion-zone">
              <div class="v5b-medallion-halo" data-v5b-medallion>
                ${se(t.earnedWedges,a,108)}
              </div>
              <span class="v5b-turn-ribbon">TURN ${Math.min(t.turnNumber+1,t.maxTurns)} / ${t.maxTurns}</span>
            </div>

            <!-- Stage Right: Challenger behind Carved Mahogany & Brass Podium -->
            <div class="v5b-rival-zone">
              <div class="v5b-rival-stage-stack">
                ${t.hasActiveRival&&s&&y?`<img
                         class="v5b-rival-cutout"
                         src="${r(y)}"
                         alt="${r(s.name)}"
                         decoding="async"
                       />`:'<div class="v5b-solo-podium-spotlight" aria-hidden="true"></div>'}
                ${be(!!(t.hasActiveRival&&s),s?.accentHex??"#2c5bb5")}
              </div>
            </div>
          </section>

          <!-- Sculpted Diamond-Tipped Brass & Sapphire Score Plaques -->
          <section class="v5b-score-plaques-row" aria-label="Scoreboard">
            <div class="v5b-score-plaque-wrap">
              <div class="v5b-score-plaque-rim">
                <div class="v5b-score-plaque-face">
                  <div class="v5b-score-plaque-main">
                    <span>${r(B)} &middot;</span>
                    <span class="v5b-score-plaque-pts">${t.playerScore.toLocaleString("en-US")}</span>
                    <span>PTS</span>
                  </div>
                  <div class="v5b-score-plaque-sub">
                    <span>50/50: ${t.lifelines5050Left}</span>
                    <span>CLUE: ${t.lifelinesHintLeft}</span>
                    ${e.currentStreak>=2?`<span class="v5b-streak-chip">${v("flame",11)} ${e.currentStreak}x</span>`:""}
                  </div>
                </div>
              </div>
            </div>

            <div class="v5b-score-plaque-wrap">
              <div class="v5b-score-plaque-rim">
                <div class="v5b-score-plaque-face">
                  ${t.hasActiveRival&&s?`
                        <div class="v5b-score-plaque-main">
                          <span>${r(X(s))} &middot;</span>
                          <span class="v5b-score-plaque-pts" style="color:#ffb8c6;">${t.rivalScore.toLocaleString("en-US")}</span>
                          <span>PTS</span>
                        </div>
                        <div class="v5b-score-plaque-sub">
                          <span>WEDGES: ${t.rivalWedges.length}/6</span>
                        </div>
                      `:`
                        <div class="v5b-score-plaque-main">
                          <span>HOUSE TARGET &middot;</span>
                          <span class="v5b-score-plaque-pts">${t.soloTargetScore.toLocaleString("en-US")}</span>
                          <span>PTS</span>
                        </div>
                        <div class="v5b-solo-bar-track" aria-label="${L}% of qualifying target">
                          <div class="v5b-solo-bar-fill" style="width:${L}%"></div>
                        </div>
                      `}
                </div>
              </div>
            </div>
          </section>

          <!-- Sculpted Angled Speech Bubbles (Max Sterling + Optional Onboarding + Rival Reaction) -->
          <section class="v5b-speech-strip" aria-live="polite">
            <div class="v5b-speech-bubble">
              <span class="v5b-speech-speaker">${v("mic",11)} Max Sterling</span>
              <span data-v5b-host-line>${r(e.hostLine)}</span>
              <div data-v5b-onboarding-slot>
                ${e.onboardingTip?`<div class="v5b-onboarding-tag">${v("spark",11)} <strong>${r(e.onboardingTip.badgeLabel)}:</strong> ${r(e.onboardingTip.text)}</div>`:""}
              </div>
            </div>
            <div data-v5b-rival-bubble-slot style="display:contents;">
              ${t.hasActiveRival&&s&&C?`<div class="v5b-speech-bubble is-rival">
                       <span class="v5b-speech-speaker">${v("flame",11)} ${r(A?`${X(s)} · ${A}`:s.name)}</span>
                       <span>${r(C)}</span>
                     </div>`:""}
            </div>
          </section>

          <!-- Bottom Carved Mahogany & Brass Contestant Podium Ledge -->
          <footer class="v5b-podium-ledge-wrap" aria-label="Contestant Podium Controls">
            <div class="v5b-podium-ledge">
              <div class="v5b-podium-wood">
                <!-- Left: Glossy 3D Red Dome SCREW RIVAL! Buzzer -->
                <div class="v5b-screw-station">
                  <div class="v5b-screw-collar">
                    <button
                      type="button"
                      class="v5b-screw-btn"
                      data-v5b-screw-btn
                      ${$?"":"disabled"}
                      title="${$?"Force an open tile onto your Rival! If they choke, you steal 100% of its points!":t.hasActiveRival?"No Screw tokens left this match":"Screw Rival unlocks in head-to-head Rival matches"}"
                    >
                      <span data-v5b-screw-label>${t.hasActiveRival?"SCREW<br/>RIVAL!":"SOLO<br/>STAGE"}</span>
                    </button>
                    ${t.hasActiveRival?`<span class="v5b-screw-count-pip" aria-label="${u} Screws remaining">&times;${u}</span>`:""}
                  </div>
                </div>

                <!-- Center: Optional Active Sponsor Dare Brass Tag -->
                ${P}

                <!-- Right: 3 Recessed Circular Brass Charm Cups -->
                <div class="v5b-charm-cups-row" data-v5b-charm-row>
                  ${R}
                  <div data-v5b-charm-tooltip-slot></div>
                </div>
              </div>
            </div>
          </footer>
        </div>

        <!-- Landscape Right Column (display: contents on Portrait & Desktop!) -->
        <div class="v5b-landscape-right-col">
          <!-- Dynamic Alert Ribbon (Screw Armed OR Forced Stage Pick) -->
          <div class="v5b-alert-slot" data-v5b-alert-slot>
            ${t.forcedTileId?`<div class="v5b-alert-ribbon is-forced" role="alert">
                     <div>
                       <div class="v5b-alert-title">FORCED STAGE PICK — NO BACKING OUT!</div>
                       <div class="v5b-alert-sub">${r(t.forcedReasonBanner||"The studio spotlight locked your tile! Tap the glowing octagon.")}</div>
                     </div>
                   </div>`:""}
          </div>

          <!-- Tilted 2.5D Octagonal Crystal-and-Brass Stage Board -->
          <main class="v5b-board-stage-wrap" aria-label="Game Show Stage Board">
            <div class="v5b-board-tray ${k>=5?"is-dense-cols":""}" style="--v5b-cols:${k}">
              <div class="v5b-board-enamel">
                <div class="v5b-crests-grid">
                  ${m}
                </div>
                <div class="v5b-tiles-grid" data-v5b-tiles-grid>
                  ${E.join("")}
                </div>
                ${z}
              </div>
            </div>
          </main>
        </div>
      </div>
    `,this.bindStageEvents()}renderOctagonalTileHtml(e,i,a,t,n,s){const c=V[e.domainId]??V[0],d=i?.wittyTitle??"Category",l=s?.displayPointsOverride??e.pointValue,y=a===e.tileId,k=a!==null&&!y,f=`--v5b-tile-hi:${c.tileHi};--v5b-tile-mid:${c.tileMid};--v5b-tile-low:${c.tileLow};--v5b-tile-ink:${c.inkHex}`;if(e.status==="CLEARED_WIN")return`
        <button type="button" class="v5b-tile-btn is-cleared-win" style="${f}" data-tile-id="${r(e.tileId)}" disabled aria-label="${r(d)} ${e.pointValue} points won">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${v("check",22)}
            <span class="v5b-cleared-label">WON</span>
          </div></div>
        </button>
      `;if(e.status==="CLEARED_MISS")return`
        <button type="button" class="v5b-tile-btn is-cleared-miss" style="${f}" data-tile-id="${r(e.tileId)}" disabled aria-label="${r(d)} ${e.pointValue} points played">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${v("cross",18)}
            <span class="v5b-cleared-label">PLAYED</span>
          </div></div>
        </button>
      `;if(e.status==="CLAIMED_BY_RIVAL")return`
        <button type="button" class="v5b-tile-btn is-rival-claimed" style="${f}" data-tile-id="${r(e.tileId)}" disabled aria-label="${r(d)} claimed by Rival">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${v("shield",18)}
            <span class="v5b-cleared-label">RIVAL</span>
          </div></div>
        </button>
      `;if(e.status==="PADLOCKED")return`
        <button type="button" class="v5b-tile-btn is-padlocked" style="${f}" data-tile-id="${r(e.tileId)}" disabled title="Solve an adjacent tile to shatter the iron chains!" aria-label="Locked ${r(d)} ${l} points">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${he(n)}
            <span class="v5b-tile-points">${l}</span>
          </div></div>
        </button>
      `;if(e.status==="FOGGED")return`
        <button type="button" class="v5b-tile-btn is-fogged" style="${f}" data-tile-id="${r(e.tileId)}" disabled title="Solve an adjacent tile to lift the stage fog!" aria-label="Fogged mystery tile">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${v("fog",24)}
            <span class="v5b-cleared-label">MYSTERY</span>
          </div></div>
        </button>
      `;if(e.status==="FROZEN_BY_RIVAL")return`
        <button type="button" class="v5b-tile-btn is-frozen" style="${f}" data-tile-id="${r(e.tileId)}" disabled title="Frozen by Rival for 1 turn" aria-label="Frozen ${e.pointValue} points">
          <div class="v5b-tile-rim"><div class="v5b-tile-face">
            ${v("frost",22)}
            <span class="v5b-tile-points" style="color:#e6fbff;text-shadow:0 2px 4px rgba(0,0,0,0.75);">${e.pointValue}</span>
          </div></div>
        </button>
      `;const p=[];t&&p.push("is-shattering"),y&&p.push("is-forced"),k&&p.push("is-dimmed"),s?.isGoldFever&&p.push("is-gold-fever"),s?.isCrossroadsDiagonal&&p.push("is-crossroads-diag");let g="";const M=de(e.format);let u=`${d}, ${l} points, ${M}`;const $=s?.hotPotatoTurnsLeft!==void 0?`<span class="v5b-modifier-pip">${s.hotPotatoTurnsLeft}T</span>`:s?.isGoldFever?'<span class="v5b-modifier-pip is-gold">2&times;</span>':s?.isCrossroadsDiagonal?'<span class="v5b-modifier-pip">2&times;X</span>':"",B=e.twist==="WHEEL_CURVEBALL"&&e.twistRevealedToPlayer,L=e.twist==="LIGHTNING_BLITZ",C=e.twist==="RIVAL_BOUNTY",A=e.twist==="POWER_PLAY"&&e.twistRevealedToPlayer,m=e.twist==="CROWN_WEDGE";if(s?.isSpiralCore)p.push("is-spiral-core"),u=`${d}, ${l} points, Spiral Labyrinth Core Vault`,g=`
        ${$}
        ${H("SPIRAL_CORE",e.wedgeId)}
        <span class="v5b-tile-points">${l.toLocaleString("en-US")}</span>
      `;else if(s?.isPyramidApex)p.push("is-pyramid-apex"),u=`${d}, ${l} points, Pyramid Ascent Summit Crown`,g=`
        ${$}
        ${H("PYRAMID_APEX",e.wedgeId)}
        <span class="v5b-tile-points">${l}</span>
      `;else if(s?.isFlameThaw)p.push("is-flame-thaw"),u=`${d}, ${l} points, Flame Thaw Tile (+200 Thaw Bonus)`,g=`
        <span class="v5b-mini-pts-tag">${l}</span>
        ${H("FLAME_THAW",e.wedgeId)}
        <span class="v5b-twist-label">FLAME THAW</span>
      `;else if(B)p.push("is-twist-wheel"),u=`${d}, ${l} points, Spinning Stage Wheel Twist`,g=`
        ${$}
        ${H("WHEEL",e.wedgeId)}
        <span class="v5b-tile-points">${l}</span>
      `;else if(L)p.push("is-twist-blitz"),u=`${d}, ${l} points, Time-Bomb Blitz`,g=`
        ${$}
        <span class="v5b-mini-pts-tag">${l}</span>
        ${H("TIME_BOMB",e.wedgeId)}
        <span class="v5b-twist-label">TIME-BOMB<br/>BLITZ</span>
      `;else if(C)p.push("is-twist-bounty"),u=`${d}, ${l} points, Rival Bounty Crosshair`,g=`
        ${$}
        <span class="v5b-mini-pts-tag">${l}</span>
        ${H("RIVAL_BOUNTY",e.wedgeId)}
        <span class="v5b-twist-label">RIVAL BOUNTY</span>
      `;else if(A)p.push("is-twist-power"),u=`${d}, ${l} points, Power Play Wager`,g=`
        ${$}
        ${H("POWER_PLAY",e.wedgeId)}
        <span class="v5b-twist-label">POWER PLAY</span>
      `;else if(m)p.push("is-twist-wedge"),u=`${d}, ${l} points, Crown Wedge Jewel Tile`,g=`
        ${$}
        ${H("CROWN_WEDGE",e.wedgeId)}
        <span class="v5b-tile-points">${l}</span>
      `;else{l>=400&&p.push("is-tier-gold");const w=e.format==="MULTIPLE_CHOICE"?Q(e.domainId,l>=400?"#4d2b06":c.iconAccent,32):ge(e.format,l>=400?"#4d2b06":c.iconAccent,32);g=`
        ${$}
        ${w}
        <span class="v5b-tile-points">${l}</span>
      `}return`
      <button
        type="button"
        class="v5b-tile-btn ${p.join(" ")}"
        style="${f}"
        data-tile-id="${r(e.tileId)}"
        data-tile-open="true"
        title="${r(u)}"
        aria-label="${r(u)}"
        ${k?"disabled":""}
      >
        <div class="v5b-tile-rim">
          <div class="v5b-tile-face">
            ${g}
          </div>
        </div>
      </button>
    `}bindStageEvents(){const e=this.activeCallbacks;e&&(this.stageHostEl.querySelector('[data-v5b-action="back"]')?.addEventListener("click",()=>e.onBackToMap()),this.stageHostEl.querySelector('[data-v5b-action="audio"]')?.addEventListener("click",()=>e.onToggleAudio()),this.stageHostEl.querySelector('[data-v5b-action="howto"]')?.addEventListener("click",()=>{e.onOpenHowToPlay?e.onOpenHowToPlay():this.openHowToPlayModal()}),this.stageHostEl.querySelector("[data-v5-fullscreen-toggle]")?.addEventListener("click",()=>this.toggleFullscreen()),this.stageHostEl.querySelector("[data-v5b-screw-btn]")?.addEventListener("click",()=>{this.canUseScrewNow()&&this.setScrewArmed(!this.screwArmed)}),this.stageHostEl.querySelectorAll("[data-tile-id]").forEach(i=>{i.addEventListener("click",()=>{if(i.disabled)return;const a=i.dataset.tileId;if(a){if(this.screwArmed&&i.dataset.tileOpen==="true"){this.setScrewArmed(!1),e.onScrewTile?e.onScrewTile(a):e.onSelectTile(a);return}e.onSelectTile(a)}})}),this.stageHostEl.querySelectorAll("[data-charm-id]").forEach(i=>{const a=i.dataset.charmId;i.addEventListener("click",t=>{t.stopPropagation(),this.inspectedCharmId=this.inspectedCharmId===a?null:a,this.renderCharmTooltip();const n=this.activeModel?.equippedCharms?.find(s=>s.charmId===a);n&&e.onCharmInspect?.(n)})}))}canUseScrewNow(){if(!this.activeModel)return!1;const{board:e}=this.activeModel,i=this.activeModel.screwsRemaining!==void 0?this.activeModel.screwsRemaining:e.hasActiveRival?1:0;return e.hasActiveRival&&i>0&&e.forcedTileId===null}syncScrewTargetDom(){const e=this.stageHostEl.querySelector("[data-v5b-screw-btn]"),i=this.stageHostEl.querySelector("[data-v5b-screw-label]"),a=this.stageHostEl.querySelector("[data-v5b-alert-slot]");e&&e.classList.toggle("is-armed",this.screwArmed),i&&(i.innerHTML=this.screwArmed?"CANCEL<br/>SCREW":"SCREW<br/>RIVAL!"),a&&(this.screwArmed?(a.innerHTML=`
          <div class="v5b-alert-ribbon" role="alert">
            <div>
              <div class="v5b-alert-title">SELECT A TILE TO FORCE ONTO RIVAL!</div>
              <div class="v5b-alert-sub">If they choke, you STEAL 100% of the points &amp; shatter chains! If they nail it, they bank it!</div>
            </div>
            <button type="button" class="v5b-brass-pill-btn" data-v5b-cancel-screw>Cancel</button>
          </div>
        `,a.querySelector("[data-v5b-cancel-screw]")?.addEventListener("click",()=>this.setScrewArmed(!1))):this.activeModel?.board.forcedTileId?a.innerHTML=`
          <div class="v5b-alert-ribbon is-forced" role="alert">
            <div>
              <div class="v5b-alert-title">FORCED STAGE PICK — NO BACKING OUT!</div>
              <div class="v5b-alert-sub">${r(this.activeModel.board.forcedReasonBanner||"Tap the glowing tile to answer!")}</div>
            </div>
          </div>
        `:a.innerHTML=""),this.stageHostEl.querySelectorAll('[data-tile-open="true"]').forEach(t=>{if(t.disabled)return;t.classList.toggle("is-screw-target",this.screwArmed);const n=t.querySelector(".v5b-tile-face");if(!n)return;const s=n.querySelector(".v5b-screw-reticle");if(this.screwArmed&&!s){const c=document.createElement("span");c.className="v5b-screw-reticle",c.setAttribute("aria-hidden","true"),c.innerHTML='<svg width="100%" height="100%" viewBox="0 0 100 80" preserveAspectRatio="none" fill="none"><path d="M18 6H8V18M82 6H92V18M18 74H8V62M82 74H92V62" stroke="#ffe485" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="84" cy="16" r="5" fill="#e62232" stroke="#ffe485" stroke-width="2"/></svg>',n.appendChild(c)}else!this.screwArmed&&s&&s.remove()})}renderCharmTooltip(){const e=this.stageHostEl.querySelector("[data-v5b-charm-tooltip-slot]");if(!e)return;if(!this.inspectedCharmId||!this.activeModel?.equippedCharms){e.innerHTML="";return}const i=this.activeModel.equippedCharms.find(a=>a.charmId===this.inspectedCharmId);if(!i){e.innerHTML="";return}e.innerHTML=`
      <div class="v5b-charm-tooltip" role="tooltip">
        <div class="v5b-charm-tooltip-title">${r(i.name)}</div>
        <div class="v5b-charm-tooltip-tag">${r(i.tagline)}</div>
        <div class="v5b-charm-tooltip-effect">${r(i.effectSummary)}</div>
        <div class="v5b-charm-tooltip-origin">Earned from: ${r(i.originSource)}</div>
      </div>
    `}formatChallengerBadge(e){switch(e.moveKind){case"FORCE_WEAK_TILE":return"FORCED PICK";case"FREEZE_FAVORITE_COLUMN":return"FROZE COLUMN";case"PLANT_BOUNTY":return"BOUNTY PLANTED";case"CLAIM_TILE":return e.rivalSucceeded?`+${e.rivalPointsDelta} PTS`:"MISSED!"}}animateSpotlightRoulette(e,i=1500){const a=Array.from(this.stageHostEl.querySelectorAll('[data-tile-open="true"]:not(:disabled)')),t=typeof CSS<"u"&&typeof CSS.escape=="function"?CSS.escape(e):e.replace(/"/g,'\\"'),n=this.stageHostEl.querySelector(`[data-tile-id="${t}"]`);return!n||a.length===0?Promise.resolve():new Promise(s=>{const d=Math.max(70,Math.floor(i/11));let l=null;for(let y=0;y<11;y++){const k=window.setTimeout(()=>{l&&l.classList.remove("is-spotlight-sweep");const f=y===10?n:a[y%a.length];f.classList.add("is-spotlight-sweep"),l=f,y===10&&(f.classList.add("is-forced"),s())},y*d);this.timerIds.push(k)}})}openStageWheelModal(e,i){this.closeModal();const a=Math.max(0,ie.findIndex(x=>x.outcome===e.outcome)),t=this.buildPhysicalBrassWheelSvg();this.modalLayerEl.innerHTML=`
      <div class="v5b-wheel-console" role="dialog" aria-modal="true" aria-label="Physical Brass Stage Wheel">
        <span class="v5b-marquee-ribbon">${v("wheel",14)} CURVEBALL STAGE WHEEL</span>
        <h2 class="v5b-modal-headline">${r(e.hostPrompt||"GIVE THE BRASS WHEEL A SPIN!")}</h2>

        <div class="v5b-wheel-housing" data-v5b-wheel-housing>
          <svg class="v5b-wheel-clapper" data-v5b-wheel-clapper viewBox="0 0 38 44" aria-hidden="true">
            <defs>
              <linearGradient id="v5w-clap-g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff5c0"/>
                <stop offset="50%" stop-color="#e3ad3b"/>
                <stop offset="100%" stop-color="#87550e"/>
              </linearGradient>
            </defs>
            <polygon points="19,42 5,11 33,11" fill="url(#v5w-clap-g)" stroke="#3d2204" stroke-width="2.4" stroke-linejoin="round"/>
            <circle cx="19" cy="11" r="7.5" fill="#fff0b5" stroke="#5c3608" stroke-width="2.2"/>
            <circle cx="19" cy="11" r="2.8" fill="#6b3e08"/>
          </svg>
          <div class="v5b-wheel-rotor" data-v5b-wheel-rotor style="transform:rotate(0deg);">
            ${t}
          </div>
        </div>

        <div class="v5b-wheel-hint" data-v5b-wheel-hint>Drag &amp; flick the brass rim, or tap SPIN below!</div>

        <div class="v5b-wheel-outcome-plaque" data-v5b-wheel-result hidden>
          <h3>${r(e.outcomeHeadline)}</h3>
          <p>${r(e.outcomeDescription)}</p>
        </div>

        <button type="button" class="v5b-cta-btn" data-v5b-wheel-spin>
          ${v("wheel",17)} <span>SPIN THE BRASS WHEEL</span>
        </button>

        <button type="button" class="v5b-cta-btn is-emerald" data-v5b-wheel-claim hidden>
          <span>CLAIM &amp; CONTINUE</span> ${v("play",15)}
        </button>
      </div>
    `;const n=this.modalLayerEl.querySelector("[data-v5b-wheel-housing]"),s=this.modalLayerEl.querySelector("[data-v5b-wheel-rotor]"),c=this.modalLayerEl.querySelector("[data-v5b-wheel-clapper]"),d=this.modalLayerEl.querySelector("[data-v5b-wheel-spin]"),l=this.modalLayerEl.querySelector("[data-v5b-wheel-claim]"),y=this.modalLayerEl.querySelector("[data-v5b-wheel-hint]"),k=this.modalLayerEl.querySelector("[data-v5b-wheel-result]");let f=0,p=!1,g=!1,M=!1,u=0,$=0,B=0;const L=()=>{c.classList.add("is-tick"),i.onTick?.();const x=window.setTimeout(()=>c.classList.remove("is-tick"),85);this.timerIds.push(x)},C=(x=5)=>{if(p||g)return;p=!0,d.disabled=!0,d.textContent="SPINNING...",y.textContent="Watch the golden clapper...",i.onSpinStart?.();const E=(360-(a*60+30))%360,S=f,R=Math.max(4,Math.min(8,x)),P=(S%360+360)%360,z=(E-P+360)%360,b=R*360+z,h=S+b,I=3400,_=performance.now(),D=N=>{const G=Math.min(1,(N-_)/I),q=1-Math.pow(1-G,4.2);f=S+b*q,s.style.transform=`rotate(${f.toFixed(2)}deg)`;const W=Math.floor(f/60);if(W!==B&&(B=W,L()),G<1){const j=window.requestAnimationFrame(D);this.rafIds.push(j)}else f=h,s.style.transform=`rotate(${h.toFixed(2)}deg)`,p=!1,g=!0,d.hidden=!0,y.hidden=!0,k.hidden=!1,l.hidden=!1},F=window.requestAnimationFrame(D);this.rafIds.push(F)},A=x=>{const E=n.getBoundingClientRect(),S=E.left+E.width/2,R=E.top+E.height/2;return Math.atan2(x.clientY-R,x.clientX-S)*180/Math.PI},m=x=>{p||g||(M=!0,$=0,u=A(x),n.setPointerCapture?.(x.pointerId))},w=x=>{if(!M||p||g)return;const E=A(x);let S=E-u;S>180&&(S-=360),S<-180&&(S+=360),u=E,$=S,f+=S,s.style.transform=`rotate(${f.toFixed(2)}deg)`;const R=Math.floor(f/60);R!==B&&(B=R,L())},T=()=>{if(!M)return;M=!1;const x=Math.abs($)>6?6:5;C(x)};n.addEventListener("pointerdown",m),n.addEventListener("pointermove",w),n.addEventListener("pointerup",T),n.addEventListener("pointercancel",T),this.modalCleanups.push(()=>{n.removeEventListener("pointerdown",m),n.removeEventListener("pointermove",w),n.removeEventListener("pointerup",T),n.removeEventListener("pointercancel",T)}),d.addEventListener("click",()=>C(5)),l.addEventListener("click",()=>{this.closeModal(),i.onSpinComplete(e.outcome)})}buildPhysicalBrassWheelSvg(){const t=[`<linearGradient id="v5w-bezel" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff4bd"/>
        <stop offset="28%" stop-color="#dfaa3f"/>
        <stop offset="58%" stop-color="#7c5012"/>
        <stop offset="85%" stop-color="#f7d577"/>
        <stop offset="100%" stop-color="#613b0a"/>
      </linearGradient>`],n=ie.map((c,d)=>{const l=-90+d*60,y=l+60,k=l+30,f=l*Math.PI/180,p=y*Math.PI/180,g=k*Math.PI/180,M=160+136*Math.cos(f),u=160+136*Math.sin(f),$=160+136*Math.cos(p),B=160+136*Math.sin(p),L=160+136*.62*Math.cos(g),C=160+136*.62*Math.sin(g),A=k+90,m=k>15&&k<165?A+180:A;return t.push(`
        <linearGradient id="v5w-sl-${d}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c.topFill}"/>
          <stop offset="100%" stop-color="${c.botFill}"/>
        </linearGradient>
      `),`
        <path d="${`M 160 160 L ${M.toFixed(1)} ${u.toFixed(1)} A 136 136 0 0 1 ${$.toFixed(1)} ${B.toFixed(1)} Z`}" fill="url(#v5w-sl-${d})" stroke="#4d3108" stroke-width="2.6"/>
        <text
          x="${L.toFixed(1)}"
          y="${C.toFixed(1)}"
          fill="${c.inkHex}"
          font-family="Cinzel, Georgia, serif"
          font-size="11.5"
          font-weight="800"
          text-anchor="middle"
          dominant-baseline="middle"
          transform="rotate(${m}, ${L.toFixed(1)}, ${C.toFixed(1)})"
        >${r(c.shortLabel)}</text>
      `}).join(""),s=Array.from({length:18},(c,d)=>{const l=d*20*Math.PI/180,y=160+148*Math.cos(l),k=160+148*Math.sin(l),f=d%3===0;return`<circle cx="${y.toFixed(1)}" cy="${k.toFixed(1)}" r="${f?4.4:2.8}" fill="${f?"#fff8d4":"#ffe082"}" stroke="#6b420b" stroke-width="1"/>`}).join("");return`
      <svg viewBox="0 0 320 320" width="100%" height="100%" role="img" aria-label="6-Slice Physical Brass Stage Wheel">
        <defs>${t.join("")}</defs>
        <circle cx="160" cy="160" r="158" fill="url(#v5w-bezel)" stroke="#4d2e07" stroke-width="2"/>
        <circle cx="160" cy="160" r="141" fill="#101f42" stroke="#ffe79e" stroke-width="2"/>
        ${n}
        ${s}
        <circle cx="160" cy="160" r="30" fill="url(#v5w-bezel)" stroke="#4f3007" stroke-width="2.4"/>
        <circle cx="160" cy="160" r="17" fill="#12244d" stroke="#fff0b5" stroke-width="2"/>
        <polygon points="160,148 163.5,156.5 172,157.5 165.5,163 167.5,171.5 160,167 152.5,171.5 154.5,163 148,157.5 156.5,156.5" fill="#ffe285"/>
      </svg>
    `}openPowerPlayDialModal(e,i){this.closeModal();const a=J[e.column.wedgeId],t=Math.max(50,Math.round(e.minWager)),n=Math.max(t,Math.round(e.maxWager)),s=n-t>=500?50:25;let c=Math.min(n,Math.max(t,Math.round((t+n)/2/s)*s));const d=Array.from({length:19},(m,w)=>{const x=(180+w*10)*Math.PI/180,E=w%3===0?96:102,S=112,R=140+E*Math.cos(x),P=136+E*Math.sin(x),z=140+S*Math.cos(x),b=136+S*Math.sin(x);return`<line x1="${R.toFixed(1)}" y1="${P.toFixed(1)}" x2="${z.toFixed(1)}" y2="${b.toFixed(1)}" stroke="${w%3===0?"#ffe599":"rgba(255,232,165,0.45)"}" stroke-width="${w%3===0?2.4:1.3}" stroke-linecap="round"/>`}).join("");this.modalLayerEl.innerHTML=`
      <div class="v5b-dial-console" role="dialog" aria-modal="true" aria-label="Power Play Brass Wager Dial">
        <div class="v5b-dial-inner">
          <span class="v5b-marquee-ribbon">${v("star",13)} POWER PLAY &middot; DAILY DOUBLE</span>
          <h2 class="v5b-modal-headline">SET THE BRASS WAGER DIAL</h2>
          <div style="font-size:13px;color:#d6e4ff;line-height:1.35;">
            Category: <strong style="color:${a.accentHex}">${r(e.column.wittyTitle)}</strong> (${r(e.column.topicSubtitle)})
            ${e.hostLine?`<div style="font-style:italic;color:#ffe6a3;margin-top:3px;">"${r(e.hostLine)}"</div>`:""}
          </div>

          <div class="v5b-dial-gauge-wrap" data-v5b-dial-gauge title="Drag along the brass gauge to set your stake">
            <svg viewBox="0 0 280 154" width="100%" height="auto" role="img" aria-label="Brass Power Play Wager Gauge">
              <defs>
                <linearGradient id="v5d-arc-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#34d993"/>
                  <stop offset="52%" stop-color="#f7c844"/>
                  <stop offset="100%" stop-color="#f24455"/>
                </linearGradient>
                <linearGradient id="v5d-brass" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fff4bf"/>
                  <stop offset="48%" stop-color="#d49e35"/>
                  <stop offset="100%" stop-color="#784e10"/>
                </linearGradient>
              </defs>
              <!-- Outer brass housing arc -->
              <path d="M 20 136 A 120 120 0 0 1 260 136" fill="none" stroke="url(#v5d-brass)" stroke-width="14" stroke-linecap="round"/>
              <path d="M 28 136 A 112 112 0 0 1 252 136" fill="#08132b" stroke="#5c3b0c" stroke-width="2"/>
              <!-- Background & active risk meter track -->
              <path d="M 46 136 A 94 94 0 0 1 234 136" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="10" stroke-linecap="round"/>
              <path data-v5b-dial-arc d="M 46 136 A 94 94 0 0 1 234 136" fill="none" stroke="url(#v5d-arc-grad)" stroke-width="10" stroke-linecap="round" stroke-dasharray="295.3" stroke-dashoffset="147.6"/>
              ${d}
              <!-- Rotating Brass Needle -->
              <g data-v5b-dial-needle transform="rotate(0 140 136)">
                <polygon points="140,34 145,136 135,136" fill="url(#v5d-brass)" stroke="#3d2204" stroke-width="1.5"/>
                <circle cx="140" cy="136" r="13" fill="url(#v5d-brass)" stroke="#4f2f06" stroke-width="2"/>
                <circle cx="140" cy="136" r="5" fill="#fff4c4"/>
              </g>
              <text x="36" y="151" fill="#bcd0f2" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700" text-anchor="middle">${t.toLocaleString("en-US")}</text>
              <text x="244" y="151" fill="#ffe182" font-family="JetBrains Mono, monospace" font-size="10.5" font-weight="700" text-anchor="middle">${n.toLocaleString("en-US")}</text>
            </svg>
          </div>

          <div class="v5b-dial-readout-row">
            <button type="button" class="v5b-knurled-step-btn" data-v5b-step="-1" aria-label="Decrease wager">&minus;</button>
            <div class="v5b-dial-digital-plate" data-v5b-wager-val>${c.toLocaleString("en-US")} PTS</div>
            <button type="button" class="v5b-knurled-step-btn" data-v5b-step="1" aria-label="Increase wager">+</button>
          </div>

          <div class="v5b-chip-row">
            <button type="button" class="v5b-stake-chip" data-v5b-pct="0.25">25%</button>
            <button type="button" class="v5b-stake-chip" data-v5b-pct="0.5">50%</button>
            <button type="button" class="v5b-stake-chip" data-v5b-pct="0.75">75%</button>
            <button type="button" class="v5b-stake-chip is-allin" data-v5b-pct="1">ALL-IN</button>
          </div>

          <div class="v5b-wager-stakes-split">
            <div class="v5b-stake-plaque">
              <div class="v5b-stake-plaque-lbl">If Right</div>
              <div class="v5b-stake-plaque-val" data-v5b-win-val>+${c.toLocaleString("en-US")}</div>
            </div>
            <div class="v5b-stake-plaque is-risk">
              <div class="v5b-stake-plaque-lbl">If Wrong</div>
              <div class="v5b-stake-plaque-val" data-v5b-miss-val>-${c.toLocaleString("en-US")}</div>
            </div>
          </div>

          <button type="button" class="v5b-cta-btn" style="width:100%;" data-v5b-lock-wager>
            <span>LOCK WAGER &amp; SEE CLUE</span> ${v("play",15)}
          </button>
        </div>
      </div>
    `;const l=this.modalLayerEl.querySelector("[data-v5b-dial-gauge]"),y=this.modalLayerEl.querySelector("[data-v5b-dial-arc]"),k=this.modalLayerEl.querySelector("[data-v5b-dial-needle]"),f=this.modalLayerEl.querySelector("[data-v5b-wager-val]"),p=this.modalLayerEl.querySelector("[data-v5b-win-val]"),g=this.modalLayerEl.querySelector("[data-v5b-miss-val]"),M=295.3,u=m=>{c=Math.max(t,Math.min(n,Math.round(m)));const w=n>t?(c-t)/(n-t):1,T=-90+w*180;k.setAttribute("transform",`rotate(${T.toFixed(1)} 140 136)`),y.setAttribute("stroke-dashoffset",(M*(1-w)).toFixed(1)),f.textContent=`${c.toLocaleString("en-US")} PTS`,p.textContent=`+${c.toLocaleString("en-US")}`,g.textContent=`-${c.toLocaleString("en-US")}`,i.onWagerChange?.(c)};u(c);let $=!1;const B=m=>{const w=l.getBoundingClientRect(),T=w.left+w.width/2,x=w.top+w.height*(136/154),E=m.clientX-T,S=m.clientY-x;let R=Math.atan2(S,E)*180/Math.PI;R>0&&(R=E<0?-180:0);const P=Math.max(0,Math.min(1,(R+180)/180)),z=t+(n-t)*P;u(Math.round(z/s)*s)},L=m=>{$=!0,l.setPointerCapture?.(m.pointerId),B(m)},C=m=>{$&&B(m)},A=()=>{$=!1};l.addEventListener("pointerdown",L),l.addEventListener("pointermove",C),l.addEventListener("pointerup",A),l.addEventListener("pointercancel",A),this.modalCleanups.push(()=>{l.removeEventListener("pointerdown",L),l.removeEventListener("pointermove",C),l.removeEventListener("pointerup",A),l.removeEventListener("pointercancel",A)}),this.modalLayerEl.querySelectorAll("[data-v5b-step]").forEach(m=>{m.addEventListener("click",()=>{const w=Number(m.dataset.v5bStep||0);u(c+w*s)})}),this.modalLayerEl.querySelectorAll("[data-v5b-pct]").forEach(m=>{m.addEventListener("click",()=>{const w=Number(m.dataset.v5bPct||.5),T=w>=1?n:t+(n-t)*w;u(Math.round(T/s)*s)})}),this.modalLayerEl.querySelector("[data-v5b-lock-wager]")?.addEventListener("click",()=>{this.closeModal(),i.onLockWager(c)})}renderPostMatchCurtainCall(e,i){this.ensureAttached(),this.clearAsyncHooks(),this.closeModal(),this.renderCounter+=1;const a=`cc${this.renderCounter}`,t=ae(e.episode.tierNumber),n=ee[t],s=Z(e.didWin?"hype":"wince"),c=K(e.challenger),d=e.headlines[0]||(e.didWin?`SENSATION AT ${e.episode.venueName.toUpperCase()}!`:`DRAMATIC SHOWDOWN ROCKS ${e.episode.venueName.toUpperCase()}!`),l=e.headlines.slice(1),y=[1,2,3].map(g=>`<span style="color:${g<=e.starsEarned?"#c98810":"rgba(64,42,18,0.22)"}">${v(g<=e.starsEarned?"star":"star_dim",20)}</span>`).join(""),k=[`WORLD'S SMARTEST — ${e.episode.venueName} (${e.episode.title})`,`${e.didWin?"STAGE VICTORY":"CURTAIN CALL"} | Score: ${e.playerScore.toLocaleString("en-US")} PTS${e.hasActiveRival&&e.challenger?` vs ${e.challenger.name} (${e.rivalScore.toLocaleString("en-US")})`:` (Target ${e.soloTargetScore.toLocaleString("en-US")})`}`,`Accuracy: ${e.accuracyPct}% | Best Streak: ${e.bestStreak} | Jewels: ${e.earnedWedges.length}/6`,`World Audience: ${U(e.totalAudienceNow)}`].join(`
`);this.stageHostEl.innerHTML=`
      <div class="v5b-stage-bg" style="background-image:url('${r(n)}')" aria-hidden="true"></div>
      <div class="v5b-stage-canvas" style="justify-content:center;padding-top:12px;padding-bottom:18px;">
        <div class="v5b-curtain-spread">
          <!-- Left: Broadsheet Newspaper Front Page -->
          <article class="v5b-broadsheet-paper" aria-label="Post-Match Newspaper Edition">
            <div class="v5b-paper-masthead">
              <span class="v5b-paper-name">${r(e.newspaperMasthead||"THE WORLD BROADCAST CHRONICLE")}</span>
              <span class="v5b-paper-edition">FINAL EDITION &middot; TIER ${t}</span>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
              <span class="v5b-verdict-stamp ${e.didWin?"":"is-loss"}">
                ${v(e.didWin?"check":"shield",13)}
                <span>${e.didWin?"STAGE VICTORY":"CURTAIN CALL · REDEMPTION OPEN"}</span>
              </span>
              <div aria-label="${e.starsEarned} of 3 stars">${y}</div>
            </div>

            <h2 class="v5b-paper-headline">${r(d)}</h2>
            <div style="font-size:12.5px;color:#523c22;font-weight:600;">
              ${r(e.episode.venueName)} &mdash; ${r(e.episode.title)}
            </div>

            ${e.dareCompleted&&e.dareDescription?`<div style="margin-top:8px;padding:6px 10px;border:1.5px solid #0e7040;background:#e6faef;color:#0a4d2c;border-radius:6px;font-size:12px;font-weight:700;">
                     SPONSOR DARE CLEARED! ${r(e.dareDescription)}${e.dareBonusUsd?` (+${Y(e.dareBonusUsd)})`:""}
                   </div>`:""}

            ${!e.didWin&&e.redemptionNote?`<div style="margin-top:8px;padding:6px 10px;border:1.5px dashed #8f3c12;background:#fff3e0;color:#5e2508;border-radius:6px;font-size:12px;font-weight:700;">
                     ${r(e.redemptionNote)}
                   </div>`:""}

            <div class="v5b-paper-quotes">
              <div class="v5b-paper-quote-row">
                <div class="v5b-paper-bust"><img src="${r(s)}" alt="Max Sterling" /></div>
                <div style="font-size:12.5px;line-height:1.35;">
                  <strong style="font-family:Cinzel,Georgia,serif;color:#734206;">MAX STERLING:</strong>
                  "${r(e.hostClosingQuip)}"
                </div>
              </div>
              ${e.challenger&&e.rivalClosingLine?`<div class="v5b-paper-quote-row">
                       <div class="v5b-paper-bust">${c?`<img src="${r(c)}" alt="${r(e.challenger.name)}" />`:""}</div>
                       <div style="font-size:12.5px;line-height:1.35;">
                         <strong style="font-family:Cinzel,Georgia,serif;color:#8c162b;">${r(e.challenger.name.toUpperCase())}:</strong>
                         "${r(e.rivalClosingLine)}"
                       </div>
                     </div>`:""}
            </div>

            ${l.length>0?`<div class="v5b-wire-list">
                     <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.1em;color:#735634;font-weight:800;">WIRE BULLETINS</div>
                     ${l.map(g=>`<div>&bull; ${r(g)}</div>`).join("")}
                   </div>`:""}
          </article>

          <!-- Right: Pinned Studio Production Call-Sheet -->
          <aside class="v5b-callsheet-card" aria-label="Studio Production Call Sheet">
            <div class="v5b-callsheet-clip" aria-hidden="true"></div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
              <div>
                <div style="font-family:JetBrains Mono,monospace;font-size:10px;font-weight:800;letter-spacing:0.1em;color:#755326;">STUDIO CALL-SHEET // OFFICIAL TALLY</div>
                <div style="font-family:Cinzel,Georgia,serif;font-size:16px;font-weight:800;color:#1f150a;">CURTAIN CALL LEDGER</div>
              </div>
              ${se(e.earnedWedges,a,56)}
            </div>

            <div class="v5b-callsheet-tally">
              <div class="v5b-tally-box ${e.didWin?"is-win":""}">
                <div class="v5b-tally-label">Your Final</div>
                <div class="v5b-tally-num">${e.playerScore.toLocaleString("en-US")}</div>
                <div style="font-size:11px;color:#5c4426;font-weight:700;">${e.accuracyPct}% Acc &middot; ${e.bestStreak} Streak</div>
              </div>
              <div class="v5b-tally-box ${e.didWin?"":"is-win"}">
                <div class="v5b-tally-label">${e.hasActiveRival&&e.challenger?r(e.challenger.name):"House Target"}</div>
                <div class="v5b-tally-num" style="color:${e.hasActiveRival?"#8c1428":"#1f150a"};">
                  ${(e.hasActiveRival?e.rivalScore:e.soloTargetScore).toLocaleString("en-US")}
                </div>
                <div style="font-size:11px;color:#5c4426;font-weight:700;">${e.earnedWedges.length}/6 Jewel Wedges</div>
              </div>
            </div>

            <div class="v5b-callsheet-stats">
              <div class="v5b-cs-stat">
                <div class="v5b-cs-stat-k">Audience</div>
                <div class="v5b-cs-stat-v">${U(e.totalAudienceNow)}</div>
                ${e.audienceDelta>0?`<div style="font-size:10px;color:#7ef2b6;font-weight:700;">+${U(e.audienceDelta)}</div>`:""}
              </div>
              <div class="v5b-cs-stat">
                <div class="v5b-cs-stat-k">Purse Won</div>
                <div class="v5b-cs-stat-v">${e.prizeEarnedUsd>0?`+${Y(e.prizeEarnedUsd)}`:"$0"}</div>
              </div>
              <div class="v5b-cs-stat">
                <div class="v5b-cs-stat-k">Jewels</div>
                <div class="v5b-cs-stat-v">${e.earnedWedges.length} / 6</div>
              </div>
            </div>

            <div style="margin-top:8px;">
              <button type="button" class="v5b-brass-pill-btn" style="width:100%;justify-content:center;" data-v5b-share-card>
                ${v("share",14)} <span data-v5b-share-label>Copy Broadcast Share Ticket</span>
              </button>
            </div>

            <div class="v5b-curtain-actions">
              <button type="button" class="v5b-cta-btn is-secondary" style="min-height:38px;padding:7px 14px;font-size:11.5px;" data-v5b-cc="home">Green Room</button>
              <button type="button" class="v5b-cta-btn is-secondary" style="min-height:38px;padding:7px 14px;font-size:11.5px;" data-v5b-cc="map">Tour Trunk</button>
              <button type="button" class="v5b-cta-btn is-secondary" style="min-height:38px;padding:7px 14px;font-size:11.5px;" data-v5b-cc="rematch">Rematch</button>
              ${e.didWin&&e.hasNextEpisode&&i.onNextEpisode?`<button type="button" class="v5b-cta-btn" style="flex:1 1 150px;" data-v5b-cc="next">
                       <span>${r(e.nextStageLabel||"NEXT STAGE")}</span> ${v("play",14)}
                     </button>`:""}
            </div>
          </aside>
        </div>
      </div>
    `;const f=this.stageHostEl.querySelector("[data-v5b-share-card]"),p=this.stageHostEl.querySelector("[data-v5b-share-label]");f?.addEventListener("click",()=>{const g=()=>{p&&(p.textContent="Ticket Copied to Clipboard!");const M=window.setTimeout(()=>{p&&(p.textContent="Copy Broadcast Share Ticket")},2e3);this.timerIds.push(M)};navigator.clipboard&&typeof navigator.clipboard.writeText=="function"?navigator.clipboard.writeText(k).then(g).catch(g):g()}),this.stageHostEl.querySelector('[data-v5b-cc="home"]')?.addEventListener("click",()=>i.onBackHome()),this.stageHostEl.querySelector('[data-v5b-cc="map"]')?.addEventListener("click",()=>i.onOpenWorldTourMap()),this.stageHostEl.querySelector('[data-v5b-cc="rematch"]')?.addEventListener("click",()=>i.onRematch()),this.stageHostEl.querySelector('[data-v5b-cc="next"]')?.addEventListener("click",()=>i.onNextEpisode?.())}openCategoryDraftModal(e,i){this.closeModal();const a=K(e.challenger);this.modalLayerEl.innerHTML=`
      <div class="v5b-dial-console" style="max-width:620px;" role="dialog" aria-modal="true" aria-label="Oxford Pick and Ban Category Draft">
        <div class="v5b-dial-inner" style="text-align:left;align-items:stretch;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <div>
              <span class="v5b-marquee-ribbon">${v("star",13)} OXFORD STAGE DRAFT</span>
              <h2 class="v5b-modal-headline" style="font-size:20px;margin-top:6px;">${r(e.phaseTitle)}</h2>
            </div>
            ${a?`<div class="v5b-paper-bust" style="width:54px;height:54px;"><img src="${r(a)}" alt="${r(e.challenger.name)}" /></div>`:""}
          </div>
          <div style="font-size:13px;color:#d6e4ff;line-height:1.35;">${r(e.instruction)}</div>

          <div class="v5b-draft-grid">
            ${e.pool.map(t=>{const n=J[t.wedgeId],s=t.state==="PLAYER_PICK"||t.state==="RIVAL_PICK"?"is-picked":t.state==="PLAYER_BAN"||t.state==="RIVAL_BAN"?"is-banned":"",c=t.state==="PLAYER_PICK"?"YOUR PICK":t.state==="RIVAL_PICK"?"RIVAL PICK":t.state==="PLAYER_BAN"?"BANNED":t.state==="RIVAL_BAN"?"RIVAL BAN":"OPEN";return`
                  <button
                    type="button"
                    class="v5b-draft-plaque ${s}"
                    data-v5b-draft-id="${r(t.colId)}"
                    ${t.state!=="AVAILABLE"?"disabled":""}
                  >
                    <div style="min-width:0;">
                      <div style="font-family:Cinzel,Georgia,serif;font-size:13px;font-weight:800;">${r(t.wittyTitle)}</div>
                      <div style="font-size:11px;font-weight:700;color:${n.accentHex};">${r(t.topicSubtitle)}</div>
                    </div>
                    <span class="v5b-brass-badge" style="min-height:22px;padding:2px 7px;font-size:9.5px;">${c}</span>
                  </button>
                `}).join("")}
          </div>

          <button type="button" class="v5b-cta-btn" data-v5b-draft-confirm ${e.canConfirm?"":"disabled"}>
            <span>LOCK STAGE BOARD</span> ${v("play",15)}
          </button>
        </div>
      </div>
    `,this.modalLayerEl.querySelectorAll("[data-v5b-draft-id]").forEach(t=>{t.addEventListener("click",()=>{const n=t.dataset.v5bDraftId;n&&i.onSelectDraftItem(n)})}),this.modalLayerEl.querySelector("[data-v5b-draft-confirm]")?.addEventListener("click",()=>{this.closeModal(),i.onConfirmDraft()})}openHowToPlayModal(e){this.closeModal(),this.modalLayerEl.innerHTML=`
      <div class="v5b-dial-console" style="max-width:540px;" role="dialog" aria-modal="true" aria-label="Stage Board Rules">
        <div class="v5b-dial-inner" style="text-align:left;align-items:stretch;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span class="v5b-marquee-ribbon">${v("help",13)} BROADCAST RULES</span>
            <button type="button" class="v5b-brass-pill-btn" data-v5b-close-howto>Close</button>
          </div>
          <h2 class="v5b-modal-headline" style="font-size:21px;">MASTER THE LIVING STAGE</h2>
          <div style="display:grid;gap:8px;font-size:13px;line-height:1.4;color:#e6efff;">
            <div><strong style="color:#ffe285;">1. Shatter Iron Chains:</strong> Clear any open octagon adjacent to a chained vault tile to blast its padlock open and unlock 400 &amp; 800-point jackpots.</div>
            <div><strong style="color:#ffe285;">2. Light the 6-Wedge Jewel Medallion:</strong> Win Crown Wedge tiles or sweep an entire row/column (+300 PTS) to illuminate emerald, ruby, sapphire, amber, violet &amp; cyan jewels.</div>
            <div><strong style="color:#ffe285;">3. Hit SCREW RIVAL!:</strong> Smash the red dome buzzer to force any open tile onto your Challenger! If they choke, you steal 100% of its points — if they nail it, they bank it!</div>
            <div><strong style="color:#ffe285;">4. Podium Lucky Charms:</strong> Tap any of your 3 brass podium cups to inspect passive perks earned from rivals, salons, and sponsor dares.</div>
          </div>
          <button type="button" class="v5b-cta-btn" style="margin-top:6px;" data-v5b-close-howto-cta>BACK TO THE STAGE</button>
        </div>
      </div>
    `;const i=()=>{this.closeModal(),e?.()};this.modalLayerEl.querySelector("[data-v5b-close-howto]")?.addEventListener("click",i),this.modalLayerEl.querySelector("[data-v5b-close-howto-cta]")?.addEventListener("click",i)}}export{me as LivingStageBoardView};
