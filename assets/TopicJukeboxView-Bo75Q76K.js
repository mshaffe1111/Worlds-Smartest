import{r as I,F as j}from"./forge-SPRYYeFW.js";import{p as z,b as B,c as T,s as N}from"./ui-modals-CDlOh7Hz.js";import"./meta-DtKNs8SG.js";import"./narrative-zOqZ7SbE.js";import"./three-BptGkjiW.js";import"./modes-CnzZ21_W.js";const C="v5-topic-jukebox-styles",y="ws_briefing_format_mode_v4",k="ws_briefing_timer_pace_v4",L="ws_preferred_difficulty_v2",O="ws_career_analytics_v1",A=[5,10,20,50],F=[{id:"ADAPTIVE",shortLabel:"Adaptive"},{id:"MIDDLE_SCHOOL",shortLabel:"Mid School"},{id:"HIGH_SCHOOL",shortLabel:"High School"},{id:"COLLEGE",shortLabel:"College"},{id:"GRADUATE",shortLabel:"Graduate"},{id:"MENSA",shortLabel:"Mensa"}],S={0:{enamelTop:"#249aa8",enamelBottom:"#0d4e5a",wheelShortLabel:"History"},1:{enamelTop:"#296cd4",enamelBottom:"#0e2d6e",wheelShortLabel:"Science"},2:{enamelTop:"#d6a438",enamelBottom:"#6f4c0e",wheelShortLabel:"Geography"},3:{enamelTop:"#c28b42",enamelBottom:"#5e3912",wheelShortLabel:"Arts"},4:{enamelTop:"#3a4a6e",enamelBottom:"#161f38",wheelShortLabel:"Film & Pop"},5:{enamelTop:"#1ea05c",enamelBottom:"#0a4f2c",wheelShortLabel:"Sports"},6:{enamelTop:"#1f9cb5",enamelBottom:"#0a4859",wheelShortLabel:"Tech"},7:{enamelTop:"#2e9e4a",enamelBottom:"#114d20",wheelShortLabel:"Nature"},8:{enamelTop:"#b92c34",enamelBottom:"#5c0e15",wheelShortLabel:"Society"},9:{enamelTop:"#cc6828",enamelBottom:"#64290a",wheelShortLabel:"Food"},10:{enamelTop:"#be352c",enamelBottom:"#5c1210",wheelShortLabel:"Myth & Lit"},11:{enamelTop:"#7643bd",enamelBottom:"#351863",wheelShortLabel:"Logic"}},v=[0,1,2,3,4,5,6,7,8,9,10,11];function f(n){return String(n??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function D(n){try{return typeof localStorage<"u"?localStorage.getItem(n):null}catch{return null}}function m(n,e){try{typeof localStorage<"u"&&localStorage.setItem(n,e)}catch{}}function q(n){const e={},t={};try{if(typeof localStorage<"u"){const i=localStorage.getItem(O);if(i){const d=JSON.parse(i);if(d&&Array.isArray(d.byDomain)&&d.byDomain.forEach((c,l)=>{if(l<0||l>11)return;const o=Math.max(0,Math.floor(Number(c?.right)||0)),h=Math.max(0,Math.floor(Number(c?.wrong)||0)),r=o+h;r>0&&(e[l]={pct:Math.round(o/r*100),total:r})}),d&&Array.isArray(d.events)){const c=new Map;for(const l of d.events){const o=typeof l?.subcatLabel=="string"?l.subcatLabel.trim().toLowerCase():"";if(!o)continue;const h=c.get(o)??{right:0,total:0};h.total+=1,l.correct&&(h.right+=1),c.set(o,h)}for(const[l,o]of c.entries())o.total>0&&(t[l]={pct:Math.round(o.right/o.total*100),total:o.total})}}}}catch{}if(n)for(const[i,d]of Object.entries(n)){const c=Number(i);d&&Number.isInteger(c)&&c>=0&&c<=11&&(e[c]=d)}return{domainStats:e,subcatStats:t}}function E(n){return!n||n.total<=0?0:n.pct>=80&&n.total>=3?3:n.pct>=60?2:1}function G(){return`
    <svg class="v5jb-crown-svg" viewBox="0 0 96 48" aria-hidden="true">
      <defs>
        <linearGradient id="v5jb-crown-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8cc"/>
          <stop offset="45%" stop-color="#f4c24d"/>
          <stop offset="100%" stop-color="#9e6110"/>
        </linearGradient>
      </defs>
      <path d="M 14 40 L 8 15 L 28 27 L 48 6 L 68 27 L 88 15 L 82 40 Z"
            fill="url(#v5jb-crown-g)" stroke="#5b3205" stroke-width="2.4" stroke-linejoin="round"/>
      <rect x="13" y="38" width="70" height="7" rx="3" fill="url(#v5jb-crown-g)" stroke="#5b3205" stroke-width="2"/>
      <circle cx="8" cy="13" r="3.6" fill="#fff5be" stroke="#6d3f07" stroke-width="1.3"/>
      <circle cx="48" cy="5" r="4.2" fill="#fff5be" stroke="#6d3f07" stroke-width="1.3"/>
      <circle cx="88" cy="13" r="3.6" fill="#fff5be" stroke="#6d3f07" stroke-width="1.3"/>
    </svg>
  `}function M(){return`
    <svg class="v5jb-trophy-svg" viewBox="0 0 80 108" aria-hidden="true">
      <defs>
        <linearGradient id="v5jb-tr-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff6c0"/>
          <stop offset="42%" stop-color="#e8b13e"/>
          <stop offset="82%" stop-color="#a26512"/>
          <stop offset="100%" stop-color="#603606"/>
        </linearGradient>
      </defs>
      <!-- Cup handles -->
      <path d="M 20 22 C 6 22, 6 48, 24 50 M 60 22 C 74 22, 74 48, 56 50"
            fill="none" stroke="url(#v5jb-tr-gold)" stroke-width="4.5" stroke-linecap="round"/>
      <!-- Cup bowl -->
      <path d="M 18 14 L 62 14 L 57 44 C 55 56, 48 63, 40 63 C 32 63, 25 56, 23 44 Z"
            fill="url(#v5jb-tr-gold)" stroke="#583005" stroke-width="2.2"/>
      <ellipse cx="40" cy="14" rx="22" ry="4.5" fill="#fff0a6" stroke="#704008" stroke-width="1.5"/>
      <!-- Stem -->
      <path d="M 35 63 L 45 63 L 48 79 L 32 79 Z" fill="url(#v5jb-tr-gold)" stroke="#583005" stroke-width="1.8"/>
      <!-- Mahogany pedestal -->
      <rect x="16" y="79" width="48" height="8" rx="2" fill="url(#v5jb-tr-gold)" stroke="#502b04" stroke-width="1.6"/>
      <rect x="12" y="87" width="56" height="17" rx="2.5" fill="#4f2210" stroke="#9e641c" stroke-width="1.8"/>
      <rect x="24" y="92" width="32" height="7" rx="1.5" fill="#e8b447"/>
    </svg>
  `}function H(){const n=[];for(let e=0;e<10;e++){const t=36+e*32;n.push(`<circle cx="${t}" cy="12" r="3.4" class="v5jb-bulb ${e%2===0?"is-alt":""}"/>`),n.push(`<circle cx="${t}" cy="108" r="3.4" class="v5jb-bulb ${e%2===1?"is-alt":""}"/>`)}for(let e=1;e<=3;e++){const t=14+e*23;n.push(`<circle cx="14" cy="${t}" r="3.4" class="v5jb-bulb ${e%2===0?"is-alt":""}"/>`),n.push(`<circle cx="346" cy="${t}" r="3.4" class="v5jb-bulb ${e%2===1?"is-alt":""}"/>`)}return`
    <svg class="v5jb-marquee-svg" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5jb-mq-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff8c8"/>
          <stop offset="38%" stop-color="#f3be49"/>
          <stop offset="76%" stop-color="#a86a12"/>
          <stop offset="100%" stop-color="#ecc054"/>
        </linearGradient>
        <linearGradient id="v5jb-mq-emerald" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#15855e"/>
          <stop offset="52%" stop-color="#0b5c41"/>
          <stop offset="100%" stop-color="#053223"/>
        </linearGradient>
      </defs>
      <path d="M 28 6 L 332 6 C 332 18, 342 26, 354 26 L 354 94 C 342 94, 332 102, 332 114 L 28 114 C 28 102, 18 94, 6 94 L 6 26 C 18 26, 28 18, 28 6 Z"
            fill="url(#v5jb-mq-gold)" stroke="#5c3305" stroke-width="3"/>
      <path d="M 35 18 L 325 18 C 327 28, 333 34, 342 36 L 342 84 C 333 86, 327 92, 325 102 L 35 102 C 33 92, 27 86, 18 84 L 18 36 C 27 34, 33 28, 35 18 Z"
            fill="url(#v5jb-mq-emerald)" stroke="#623706" stroke-width="2.4"/>
      ${n.join("")}
    </svg>
  `}function w(n,e=11){const t=[];for(let i=1;i<=3;i++){const d=i<=n;t.push(`
      <svg width="${e}" height="${e}" viewBox="0 0 20 20" aria-hidden="true">
        <polygon
          points="10,1.5 12.6,7 18.7,7.6 14,11.6 15.4,17.7 10,14.5 4.6,17.7 6,11.6 1.3,7.6 7.4,7"
          fill="${d?"#ffd764":"rgba(255,224,152,0.16)"}"
          stroke="${d?"#754608":"rgba(220,174,78,0.45)"}"
          stroke-width="1.3"
        />
      </svg>
    `)}return`<span class="v5jb-stars" aria-label="${n} of 3 mastery stars">${t.join("")}</span>`}function P(n){switch(n){case 0:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="14" fill="#d9b25f" stroke="#4d2c05" stroke-width="1.8"/>
          <path d="M 14 15 C 18 14, 21 17, 19 21 C 17 24, 22 28, 17 31 C 13 28, 11 22, 14 15 Z" fill="#2d6e4e"/>
          <path d="M 24 12 C 30 14, 33 19, 31 24 C 28 24, 25 22, 24 18 Z" fill="#2d6e4e"/>
          <ellipse cx="22" cy="22" rx="14" ry="5.5" fill="none" stroke="#623808" stroke-width="1.3" opacity="0.65"/>
          <path d="M 22 8 L 22 36" stroke="#623808" stroke-width="1.3" opacity="0.65"/>
        </svg>
      `;case 1:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <ellipse cx="22" cy="22" rx="15" ry="6.2" fill="none" stroke="#ffe599" stroke-width="2" transform="rotate(30 22 22)"/>
          <ellipse cx="22" cy="22" rx="15" ry="6.2" fill="none" stroke="#ffe599" stroke-width="2" transform="rotate(-30 22 22)"/>
          <ellipse cx="22" cy="22" rx="15" ry="6.2" fill="none" stroke="#ffe599" stroke-width="2" transform="rotate(90 22 22)"/>
          <circle cx="22" cy="22" r="4.2" fill="#fff5cc" stroke="#754709" stroke-width="1.4"/>
        </svg>
      `;case 2:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="22" r="14.5" fill="none" stroke="#fff0b5" stroke-width="2"/>
          <polygon points="22,6 25.5,18.5 38,22 25.5,25.5 22,38 18.5,25.5 6,22 18.5,18.5" fill="#ffe699" stroke="#5c3506" stroke-width="1.5"/>
          <circle cx="22" cy="22" r="3" fill="#5c3506"/>
        </svg>
      `;case 3:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <rect x="11" y="10" width="22" height="5" rx="2.5" fill="#fff0b3" stroke="#5d3606" stroke-width="1.5"/>
          <rect x="15" y="15" width="14" height="17" fill="#f3c558" stroke="#5d3606" stroke-width="1.5"/>
          <line x1="19" y1="16" x2="19" y2="31" stroke="#6c3e08" stroke-width="1.4"/>
          <line x1="25" y1="16" x2="25" y2="31" stroke="#6c3e08" stroke-width="1.4"/>
          <rect x="11" y="32" width="22" height="4.5" rx="1.5" fill="#fff0b3" stroke="#5d3606" stroke-width="1.5"/>
        </svg>
      `;case 4:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <rect x="9" y="18" width="26" height="17" rx="2.2" fill="#f7cf68" stroke="#472805" stroke-width="1.7"/>
          <path d="M 9 18 L 35 12 L 33 7 L 7 13 Z" fill="#fff1b8" stroke="#472805" stroke-width="1.6"/>
          <path d="M 14 11 L 17 16 M 22 9 L 25 14 M 29 8 L 32 12" stroke="#472805" stroke-width="2.2"/>
          <line x1="13" y1="24" x2="31" y2="24" stroke="#5c3406" stroke-width="1.6"/>
          <line x1="13" y1="29" x2="25" y2="29" stroke="#5c3406" stroke-width="1.6"/>
        </svg>
      `;case 5:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="21" r="10.5" fill="#f8d26c" stroke="#5a3205" stroke-width="1.8"/>
          <path d="M 15 14 C 20 18, 20 24, 15 28 M 29 14 C 24 18, 24 24, 29 28" fill="none" stroke="#6c3d07" stroke-width="1.8"/>
          <path d="M 11 26 C 11 33, 16 36, 22 36 C 28 36, 33 33, 33 26" fill="none" stroke="#fff0b0" stroke-width="2.6" stroke-linecap="round"/>
        </svg>
      `;case 6:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M 20 7 L 24 7 L 25 11 A 11 11 0 0 1 29 12.6 L 32.5 10.2 L 35.3 13 L 32.8 16.5 A 11 11 0 0 1 34.4 20.5 L 38 21.5 L 38 25.5 L 34.2 26.5 A 11 11 0 0 1 32.6 30.2 L 35 33.6 L 32.2 36.4 L 28.8 34 A 11 11 0 0 1 25 35.4 L 24 39 L 20 39 L 19 35.4 A 11 11 0 0 1 15.2 34 L 11.8 36.4 L 9 33.6 L 11.4 30.2 A 11 11 0 0 1 9.8 26.5 L 6 25.5 L 6 21.5 L 9.8 20.5 A 11 11 0 0 1 11.4 16.5 L 9 13 L 11.8 10.2 L 15.2 12.6 A 11 11 0 0 1 19 11 Z"
                fill="#ffe596" stroke="#523005" stroke-width="1.6" stroke-linejoin="round"/>
          <circle cx="22" cy="23" r="5.5" fill="#0d4e5e" stroke="#523005" stroke-width="1.5"/>
        </svg>
      `;case 7:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M 11 33 C 11 18, 20 9, 34 9 C 34 23, 25 33, 11 33 Z" fill="#f7d16a" stroke="#4f2d05" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M 11 33 C 18 26, 24 19, 32 11" fill="none" stroke="#5c3506" stroke-width="2" stroke-linecap="round"/>
          <path d="M 18 25 L 18 19 M 23 20 L 29 20" stroke="#5c3506" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
      `;case 8:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <line x1="22" y1="9" x2="22" y2="34" stroke="#ffe599" stroke-width="2.4" stroke-linecap="round"/>
          <line x1="10" y1="15" x2="34" y2="15" stroke="#ffe599" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M 10 15 L 6.5 24 L 13.5 24 Z M 34 15 L 30.5 24 L 37.5 24 Z" fill="#f5c654" stroke="#5d3406" stroke-width="1.3"/>
          <rect x="14" y="33" width="16" height="3.8" rx="1.5" fill="#ffe599" stroke="#5d3406" stroke-width="1.3"/>
        </svg>
      `;case 9:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M 10 27 C 10 17, 34 17, 34 27 Z" fill="#f8d26c" stroke="#5c3406" stroke-width="1.8"/>
          <circle cx="22" cy="14" r="3" fill="#fff2b8" stroke="#5c3406" stroke-width="1.4"/>
          <rect x="7" y="27" width="30" height="4.5" rx="2" fill="#ffe79e" stroke="#5c3406" stroke-width="1.6"/>
        </svg>
      `;case 10:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M 13 24 C 13 13, 31 13, 31 24 L 30 35 L 24 32 L 24 23 L 20 23 L 20 32 L 14 35 Z"
                fill="#f8cf65" stroke="#5a3105" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M 15 14 C 16 7, 28 7, 29 14" fill="none" stroke="#fff1b5" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;case 11:default:return`
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <polygon points="22,7 36,22 22,37 8,22" fill="#f8d26c" stroke="#532d05" stroke-width="1.8" stroke-linejoin="round"/>
          <polyline points="22,7 22,37" stroke="#6c3f07" stroke-width="1.5"/>
          <polyline points="8,22 22,17 36,22" fill="none" stroke="#fff7cc" stroke-width="1.5"/>
        </svg>
      `}}function _(){const n=[];for(let e=0;e<10;e++){const i=(-130+e*28)*Math.PI/180,d=100+Math.cos(i)*63,c=100+Math.sin(i)*63;n.push(`
      <circle cx="${d.toFixed(1)}" cy="${c.toFixed(1)}" r="12.5" fill="url(#v5jb-hole-shadow)" stroke="#f6ce6e" stroke-width="1.6"/>
    `)}return`
    <svg class="v5jb-rotor-svg" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <radialGradient id="v5jb-rotor-brass" cx="42%" cy="34%" r="65%">
          <stop offset="0%" stop-color="#fff7cb"/>
          <stop offset="40%" stop-color="#e5b042"/>
          <stop offset="78%" stop-color="#a66c18"/>
          <stop offset="100%" stop-color="#603608"/>
        </radialGradient>
        <radialGradient id="v5jb-hole-shadow" cx="55%" cy="55%" r="55%">
          <stop offset="0%" stop-color="#45210c"/>
          <stop offset="70%" stop-color="#220e05"/>
          <stop offset="100%" stop-color="#140702"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill="url(#v5jb-rotor-brass)" stroke="#5b3406" stroke-width="3.5"/>
      <circle cx="100" cy="100" r="87" fill="none" stroke="#fff3bb" stroke-width="1.5" opacity="0.68"/>
      ${n.join("")}
      <!-- Classic rotary brass finger stop -->
      <path d="M 152 132 L 194 148 C 197 154, 193 163, 185 162 L 144 146 Z"
            fill="url(#v5jb-rotor-brass)" stroke="#4f2c05" stroke-width="2.2" stroke-linejoin="round"/>
    </svg>
  `}function Y(){return`
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#f5c654" stroke-width="2.2"/>
      <line x1="15.4" y1="15.4" x2="21" y2="21" stroke="#f5c654" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `}function $(n){return n?`
      <svg viewBox="0 0 36 36" width="17" height="17" aria-hidden="true">
        <path d="M 14 7 L 14 14 L 7 14 M 22 7 L 22 14 L 29 14 M 14 29 L 14 22 L 7 22 M 22 29 L 22 22 L 29 22"
              fill="none" stroke="#f8d26c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `:`
      <svg viewBox="0 0 36 36" width="17" height="17" aria-hidden="true">
        <path d="M 7 14 L 7 7 L 14 7 M 22 7 L 29 7 L 29 14 M 7 22 L 7 29 L 14 29 M 22 29 L 29 29 L 29 22"
              fill="none" stroke="#f8d26c" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `}function W(n){if(typeof document>"u")return;const e=!!document.fullscreenElement,t=()=>n?.(!!document.fullscreenElement);try{e&&typeof document.exitFullscreen=="function"?document.exitFullscreen().then(t).catch(t):!e&&typeof document.documentElement.requestFullscreen=="function"?document.documentElement.requestFullscreen().then(t).catch(t):n?.(!e)}catch{n?.(e)}}function R(){if(typeof document>"u"||document.getElementById(C))return;const n=document.createElement("style");n.id=C,n.textContent=`
    .v5jb-root {
      position: relative;
      width: 100%;
      min-height: 100dvh;
      min-height: 100vh;
      background:
        radial-gradient(ellipse 66% 36% at 50% 0%, rgba(255, 206, 110, 0.22) 0%, rgba(44, 16, 10, 0) 70%),
        linear-gradient(180deg, #34130a 0%, #240d07 34%, #1a0a05 100%);
      color: #fff3d6;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      overflow-x: hidden;
      overflow-y: auto;
      pointer-events: auto;
      touch-action: pan-y;
      box-sizing: border-box;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .v5jb-root.is-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 60;
      height: 100dvh;
    }
    .v5jb-root *, .v5jb-root *::before, .v5jb-root *::after {
      box-sizing: border-box;
    }

    .v5jb-cabinet {
      position: relative;
      width: 100%;
      max-width: 1180px;
      margin: 0 auto;
      padding: 5px 10px max(8px, env(safe-area-inset-bottom, 8px));
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Overhead Angled Cabinet Spotlights */
    .v5jb-lamp {
      position: absolute;
      top: -6px;
      width: 68px;
      height: 44px;
      pointer-events: none;
      z-index: 1;
    }
    .v5jb-lamp-left {
      left: 6px;
      background: radial-gradient(ellipse at 26% 18%, #fff8cf 0%, rgba(255, 212, 114, 0.65) 36%, rgba(255, 190, 72, 0) 74%);
    }
    .v5jb-lamp-right {
      right: 6px;
      background: radial-gradient(ellipse at 74% 18%, #fff8cf 0%, rgba(255, 212, 114, 0.65) 36%, rgba(255, 190, 72, 0) 74%);
    }

    /* Top Navigation Brass Back Latch */
    .v5jb-topbar {
      position: relative;
      z-index: 4;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .v5jb-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 36px;
      padding: 5px 13px;
      border-radius: 999px;
      border: 2px solid #d9a039;
      background: linear-gradient(180deg, #432211 0%, #241007 100%);
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.65),
        inset 0 1px 1px rgba(255, 236, 174, 0.45);
      color: #ffe8a8;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 11.5px;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      cursor: pointer;
      transition: transform 140ms ease, filter 140ms ease;
    }
    .v5jb-back-btn:hover, .v5jb-back-btn:focus-visible {
      transform: translateY(-1px);
      filter: brightness(1.12);
      outline: none;
    }
    .v5jb-topbar-right {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .v5jb-fs-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      border: 2px solid #d9a039;
      background: linear-gradient(180deg, #432211 0%, #241007 100%);
      box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.65),
        inset 0 1px 1px rgba(255, 236, 174, 0.45);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: transform 140ms ease, filter 140ms ease;
    }
    .v5jb-fs-btn:hover, .v5jb-fs-btn:focus-visible {
      transform: translateY(-1px);
      filter: brightness(1.12);
      outline: none;
    }
    .v5jb-catalog-tag {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: #e4bd76;
      text-transform: uppercase;
      padding: 4px 9px;
      border-radius: 999px;
      border: 1px solid rgba(220, 166, 62, 0.45);
      background: rgba(34, 13, 6, 0.72);
    }

    /* ---------------- MARQUEE HEADER WITH CROWN & TWIN TROPHIES ---------------- */
    .v5jb-header-arch {
      position: relative;
      z-index: 3;
      width: 100%;
      max-width: 680px;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 1px;
      padding: 10px 8px 5px;
      border-radius: 16px 16px 8px 8px;
      background:
        radial-gradient(ellipse 74% 80% at 50% 42%, rgba(126, 18, 28, 0.78) 0%, rgba(52, 10, 14, 0.92) 72%, rgba(30, 10, 7, 0.96) 100%);
      border: 2.5px solid #c58b2b;
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.75),
        inset 0 0 0 2px rgba(255, 224, 140, 0.22);
    }

    .v5jb-marquee-row {
      width: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 6px;
    }
    .v5jb-trophy-svg {
      width: clamp(34px, 9.4vw, 60px);
      height: auto;
      flex: 0 0 auto;
      filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.72));
    }

    .v5jb-marquee-plaque {
      position: relative;
      width: clamp(194px, 54vw, 316px);
      min-height: 58px;
      padding: 9px 16px 7px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 0 14px rgba(255, 206, 92, 0.42)) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.75));
    }
    .v5jb-crown-svg {
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translateX(-50%);
      width: 44px;
      height: auto;
      z-index: 3;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.75));
    }
    .v5jb-marquee-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .v5jb-bulb {
      fill: #fffbe0;
      stroke: #f5b93a;
      stroke-width: 1;
      animation: v5jb-bulb-glow 2.2s ease-in-out infinite;
    }
    .v5jb-bulb.is-alt {
      animation-delay: 1.1s;
    }
    .v5jb-marquee-title {
      position: relative;
      z-index: 2;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(19px, 5.2vw, 27px);
      line-height: 1.02;
      letter-spacing: 0.05em;
      text-align: center;
      text-transform: uppercase;
      background: linear-gradient(180deg, #fffbe2 0%, #ffd46a 50%, #d28e20 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 2px 2px rgba(4, 24, 16, 0.92));
    }

    .v5jb-ribbon {
      margin-top: 6px;
      padding: 3px 18px;
      border-radius: 4px;
      background: linear-gradient(180deg, #f8d474 0%, #cfa03b 68%, #9b6b19 100%);
      border: 1.5px solid #593305;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.65);
      color: #2f1404;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: 10.5px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      text-align: center;
    }

    /* ---------------- MAIN STAGE BODY (WHEEL + CATALOG/CONSOLE) ---------------- */
    .v5jb-main-layout {
      position: relative;
      z-index: 3;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-top: 5px;
    }

    /* ---------------- 12-DOMAIN ROTARY JUKEBOX WHEEL ---------------- */
    .v5jb-wheel-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    .v5jb-wheel-stage {
      --wheel-size: min(292px, calc(100vw - 24px));
      --orbit-r: calc(var(--wheel-size) * 0.398);
      --med-size: clamp(38px, 10.4vw, 45px);
      position: relative;
      width: var(--wheel-size);
      height: var(--wheel-size);
      border-radius: 50%;
      background:
        radial-gradient(circle at 50% 45%, #5c2b14 0%, #3a180b 58%, #210c05 100%);
      border: 4px solid #d49b34;
      box-shadow:
        0 14px 32px rgba(0, 0, 0, 0.84),
        inset 0 0 0 4px #4d250f,
        inset 0 0 0 6px rgba(255, 224, 140, 0.34);
      touch-action: pan-y;
    }

    /* Inner carved mahogany dial plate */
    .v5jb-wheel-inner-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 56%;
      height: 56%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      background:
        radial-gradient(circle at 46% 36%, #683217 0%, #3d1a0b 62%, #240e05 100%);
      border: 3.5px solid #e6b449;
      box-shadow:
        0 6px 18px rgba(0, 0, 0, 0.76),
        inset 0 0 0 3px #633808,
        inset 0 0 18px rgba(0, 0, 0, 0.65);
    }

    /* Rotating Brass Telephone Rotor */
    .v5jb-rotor-dial {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 78%;
      height: 78%;
      transform: translate(-50%, -50%) rotate(var(--rotor-deg, 0deg));
      transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1);
      cursor: grab;
      touch-action: none;
    }
    .v5jb-rotor-dial.is-dragging {
      transition: none;
      cursor: grabbing;
    }
    .v5jb-rotor-svg {
      width: 100%;
      height: 100%;
      display: block;
      filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.7));
      pointer-events: none;
    }

    /* Glowing Golden Pointer Arrow Orbiting Inner Rim */
    .v5jb-pointer-arm {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      z-index: 12;
      transform: rotate(var(--pointer-deg, 0deg));
      transition: transform 340ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease;
      pointer-events: none;
    }
    .v5jb-pointer-arm.is-all-mix {
      opacity: 0;
    }
    .v5jb-pointer-head {
      position: absolute;
      left: -12px;
      top: calc(var(--wheel-size) * -0.285);
      width: 24px;
      height: 26px;
      filter: drop-shadow(0 0 10px rgba(255, 224, 108, 0.95));
    }

    /* Center Spun-Brass Hub Button ("ALL 12 DOMAINS") */
    .v5jb-center-hub {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 8;
      width: 44%;
      height: 44%;
      border-radius: 50%;
      border: 3px solid #f5c75a;
      background:
        radial-gradient(circle at 38% 32%, #fff6c5 0%, #e4ad3d 48%, #9a6012 100%);
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.78),
        inset 0 0 0 3px #6d4109,
        inset 0 2px 4px rgba(255, 250, 210, 0.65);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4px;
      text-align: center;
      color: #2f1404;
      cursor: pointer;
      transition: transform 150ms ease, box-shadow 180ms ease;
    }
    .v5jb-center-hub:hover, .v5jb-center-hub:focus-visible {
      transform: translate(-50%, -50%) scale(1.05);
      outline: none;
    }
    .v5jb-center-hub.is-active {
      background:
        radial-gradient(circle at 40% 34%, #25a574 0%, #0d6847 58%, #063826 100%);
      color: #fff6d2;
      box-shadow:
        0 0 18px rgba(46, 224, 152, 0.56),
        0 6px 14px rgba(0, 0, 0, 0.78),
        inset 0 0 0 2.5px #f7cf68;
    }
    .v5jb-hub-main {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: 11px;
      line-height: 1.05;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .v5jb-hub-sub {
      margin-top: 2px;
      font-size: 8.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      opacity: 0.88;
    }

    /* 12 Enameled Circular Domain Medallions */
    .v5jb-medallion {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) translate(var(--tx), var(--ty));
      z-index: 5;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: transform 170ms cubic-bezier(0.22, 1, 0.36, 1), filter 160ms ease;
    }
    .v5jb-medallion:hover, .v5jb-medallion:focus-visible {
      z-index: 9;
      transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1.09);
      outline: none;
    }
    .v5jb-medallion.is-selected {
      z-index: 10;
      transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1.13);
    }

    .v5jb-med-disc {
      width: var(--med-size);
      height: var(--med-size);
      border-radius: 50%;
      background: radial-gradient(circle at 35% 30%, var(--enamel-top) 0%, var(--enamel-bottom) 100%);
      border: 3px solid #e4ae42;
      box-shadow:
        0 5px 12px rgba(0, 0, 0, 0.78),
        inset 0 0 0 2px rgba(255, 240, 185, 0.35),
        inset 0 -3px 6px rgba(0, 0, 0, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }
    .v5jb-medallion.is-selected .v5jb-med-disc {
      border-color: #fff3b5;
      box-shadow:
        0 0 18px rgba(255, 218, 102, 0.85),
        0 6px 14px rgba(0, 0, 0, 0.85),
        inset 0 0 0 2px #fff5c8;
    }
    .v5jb-med-disc svg {
      width: 72%;
      height: 72%;
      display: block;
    }

    .v5jb-med-plate {
      margin-top: -5px;
      padding: 1.5px 6px 2px;
      border-radius: 7px;
      border: 1.5px solid #cc9532;
      background: linear-gradient(180deg, #3c1e10 0%, #1d0c05 100%);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.82);
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 52px;
      max-width: 74px;
    }
    .v5jb-medallion.is-selected .v5jb-med-plate {
      border-color: #ffe285;
      background: linear-gradient(180deg, #126d4d 0%, #073827 100%);
    }
    .v5jb-med-name {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 8.5px;
      line-height: 1.08;
      color: #ffeab0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .v5jb-stars {
      display: inline-flex;
      align-items: center;
      gap: 1px;
      line-height: 1;
    }

    /* ---------------- RIGHT / LOWER CATALOG & CONTROL CONSOLE ---------------- */
    .v5jb-console-col {
      width: 100%;
      max-width: 580px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Active Selection Brass Engraving Plate + Expandable 157-Subcategory Drawer */
    .v5jb-strip-drawer {
      width: 100%;
      border-radius: 12px;
      border: 2px solid #c9902d;
      background: linear-gradient(180deg, #3d1c0d 0%, #240e06 100%);
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.68),
        inset 0 1px 0 rgba(255, 232, 168, 0.3);
      padding: 6px 9px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .v5jb-selection-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }
    .v5jb-now-spinning {
      display: flex;
      flex-direction: column;
      min-width: 0;
      flex: 1 1 170px;
    }
    .v5jb-now-kicker {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #e4b14b;
      text-transform: uppercase;
    }
    .v5jb-now-label {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 14px;
      font-weight: 800;
      color: #fff4d2;
      line-height: 1.2;
      word-break: break-word;
    }
    .v5jb-now-meta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
      font-size: 11px;
      font-weight: 600;
      color: #e5c686;
    }
    .v5jb-drawer-actions {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .v5jb-mini-brass-btn {
      min-height: 32px;
      padding: 4px 10px;
      border-radius: 999px;
      border: 1.5px solid #d59d39;
      background: linear-gradient(180deg, #4b2511 0%, #2a1208 100%);
      color: #ffe7a4;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .v5jb-mini-brass-btn:hover, .v5jb-mini-brass-btn:focus-visible {
      border-color: #ffe694;
      filter: brightness(1.12);
      outline: none;
    }

    /* Instant 157-Subcategory Search Slot */
    .v5jb-search-row {
      position: relative;
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 0 10px;
      min-height: 38px;
      border-radius: 10px;
      border: 1.5px solid #b98229;
      background: #1a0a05;
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.72);
    }
    .v5jb-search-input {
      flex: 1 1 auto;
      min-width: 0;
      border: none;
      background: transparent;
      color: #fff5da;
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      outline: none;
      padding: 7px 0;
    }
    .v5jb-search-input::placeholder {
      color: rgba(235, 202, 138, 0.56);
    }
    .v5jb-search-clear {
      border: none;
      background: rgba(217, 160, 57, 0.2);
      color: #ffe69c;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 800;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    /* Expandable Subcategory / Topic Song-Strip Chips */
    .v5jb-subcat-body {
      display: flex;
      flex-direction: column;
      gap: 7px;
      max-height: 164px;
      overflow-y: auto;
      padding-right: 2px;
    }
    .v5jb-subcat-body.is-collapsed {
      display: none;
    }
    .v5jb-strip-section-title {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #d9a752;
      text-transform: uppercase;
    }
    .v5jb-chip-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .v5jb-topic-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-height: 30px;
      padding: 4px 10px;
      border-radius: 8px;
      border: 1.5px solid rgba(212, 155, 53, 0.62);
      background: linear-gradient(180deg, #432010 0%, #261007 100%);
      color: #ffefd0;
      font-size: 11.5px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      transition: transform 120ms ease, border-color 120ms ease, background 120ms ease;
    }
    .v5jb-topic-chip:hover, .v5jb-topic-chip:focus-visible {
      border-color: #ffe285;
      transform: translateY(-1px);
      outline: none;
    }
    .v5jb-topic-chip.is-selected {
      border-color: #ffea9e;
      background: linear-gradient(180deg, #147a55 0%, #094530 100%);
      color: #fffbe8;
      box-shadow: 0 0 10px rgba(38, 206, 142, 0.4);
    }
    .v5jb-chip-acc {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      color: #ffd76c;
    }
    .v5jb-empty-search {
      font-size: 12px;
      color: #d9b678;
      padding: 6px 2px;
    }

    /* ---------------- BRASS RUN-LENGTH & DIFFICULTY DETENTS ---------------- */
    .v5jb-detents-bar {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .v5jb-detent-group {
      border-radius: 11px;
      border: 1.8px solid #bf872a;
      background: linear-gradient(180deg, #391a0d 0%, #210d05 100%);
      padding: 5px 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.56);
    }
    .v5jb-detent-group.is-diff-group {
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
    }
    .v5jb-detent-label {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 9.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #e4b450;
      text-transform: uppercase;
      white-space: nowrap;
    }
    .v5jb-detent-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .v5jb-detent-group.is-diff-group .v5jb-detent-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 4px;
    }
    .v5jb-detent-btn {
      min-height: 28px;
      min-width: 34px;
      padding: 3px 8px;
      border-radius: 7px;
      border: 1.5px solid #a87424;
      background: linear-gradient(180deg, #4b2511 0%, #271107 100%);
      color: #f6dba1;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 110ms ease, border-color 120ms ease;
    }
    .v5jb-detent-btn.is-diff {
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 10.5px;
      padding: 3px 5px;
      text-align: center;
      white-space: nowrap;
    }
    .v5jb-detent-btn:hover, .v5jb-detent-btn:focus-visible {
      border-color: #ffe285;
      outline: none;
    }
    .v5jb-detent-btn.is-selected {
      border-color: #fff1b3;
      background: linear-gradient(180deg, #f3c14d 0%, #b57416 100%);
      color: #2b1203;
      box-shadow: 0 0 10px rgba(246, 199, 88, 0.45);
    }

    /* ---------------- PHYSICAL THROW-SWITCHES & START CUSTOM SHOW LEVER ---------------- */
    .v5jb-switch-deck {
      position: relative;
      width: 100%;
      padding: 10px 8px 6px;
      border-radius: 16px;
      border: 2.5px solid #c98f2d;
      background:
        linear-gradient(180deg, #542712 0%, #38180a 48%, #210c05 100%);
      box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.78),
        inset 0 2px 3px rgba(255, 224, 142, 0.28);
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.32fr) minmax(0, 1fr);
      gap: 7px;
      align-items: end;
    }

    /* Physical Brass Throw-Switch Unit (exact mockup match) */
    .v5jb-throw-unit {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #fff2cf;
    }
    .v5jb-throw-unit:focus-visible {
      outline: 2px solid #ffe48f;
      outline-offset: 2px;
      border-radius: 10px;
    }
    .v5jb-switch-top-plate {
      width: 100%;
      padding: 3px 5px;
      border-radius: 999px;
      border: 1.5px solid #cfa03b;
      background: linear-gradient(180deg, #3c1e10 0%, #1e0d06 100%);
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(9px, 2.5vw, 11px);
      letter-spacing: 0.03em;
      color: #d6b67a;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
    }
    .v5jb-throw-unit.is-up .v5jb-switch-top-plate {
      border-color: #ffe89e;
      color: #fff8d6;
      box-shadow: 0 0 10px rgba(255, 212, 92, 0.42);
    }

    .v5jb-switch-plate {
      position: relative;
      width: 100%;
      min-height: 76px;
      padding: 6px 5px 5px;
      border-radius: 10px;
      border: 2.5px solid #e2ac3e;
      background: linear-gradient(180deg, #137653 0%, #084832 62%, #063122 100%);
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.72),
        inset 0 0 0 2px rgba(255, 232, 165, 0.34);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    /* 4 Corner Brass Rivets */
    .v5jb-rivet {
      position: absolute;
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #fff4bc 0%, #b57516 100%);
      border: 1px solid #4c2905;
    }
    .v5jb-rivet-tl { top: 4px; left: 4px; }
    .v5jb-rivet-tr { top: 4px; right: 4px; }
    .v5jb-rivet-bl { bottom: 4px; left: 4px; }
    .v5jb-rivet-br { bottom: 4px; right: 4px; }

    .v5jb-toggle-well {
      position: relative;
      width: 34px;
      height: 50px;
      border-radius: 10px;
      border: 2px solid #d59e35;
      background: linear-gradient(180deg, #271308 0%, #4d2911 50%, #1d0c05 100%);
      box-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .v5jb-toggle-baton {
      width: 16px;
      height: 30px;
      border-radius: 8px;
      border: 1.8px solid #593205;
      background: linear-gradient(90deg, #8c5510 0%, #fff4bf 38%, #e4ac3b 70%, #6b3d07 100%);
      box-shadow: 0 5px 8px rgba(0, 0, 0, 0.82);
      transform: translateY(-9px);
      transition: transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
    }
    .v5jb-throw-unit.is-down .v5jb-toggle-baton {
      transform: translateY(9px);
    }

    .v5jb-switch-arrow {
      position: absolute;
      top: 34px;
      font-size: 11px;
      color: #ffd868;
      text-shadow: 0 0 8px rgba(255, 212, 92, 0.85);
    }
    .v5jb-switch-arrow-l { left: 6px; }
    .v5jb-switch-arrow-r { right: 6px; }

    .v5jb-switch-bot-label {
      margin-top: 4px;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(9.5px, 2.5vw, 11.5px);
      color: #b7d7c5;
      letter-spacing: 0.02em;
      white-space: nowrap;
      transition: color 140ms ease, text-shadow 140ms ease;
    }
    .v5jb-throw-unit.is-down .v5jb-switch-bot-label {
      color: #fff6c9;
      text-shadow: 0 0 10px rgba(255, 222, 112, 0.72);
    }

    /* Center Chunky Emerald & Brass START CUSTOM SHOW Stage Lever */
    .v5jb-lever-btn {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      background: transparent;
      border: none;
      padding: 0;
      cursor: pointer;
      transition: transform 150ms cubic-bezier(0.22, 1, 0.36, 1), filter 150ms ease;
    }
    .v5jb-lever-btn:hover, .v5jb-lever-btn:focus-visible {
      filter: brightness(1.09);
      outline: none;
    }
    .v5jb-lever-btn:hover .v5jb-lever-handle {
      transform: translateY(2px);
    }
    .v5jb-lever-btn:active .v5jb-lever-handle,
    .v5jb-lever-btn.is-pulling .v5jb-lever-handle {
      transform: translateY(11px) scaleY(0.92);
    }

    .v5jb-lever-handle {
      position: relative;
      z-index: 2;
      width: 84px;
      height: 36px;
      margin-bottom: -6px;
      transition: transform 160ms cubic-bezier(0.22, 1, 0.36, 1);
      filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.78));
    }

    .v5jb-start-plaque {
      position: relative;
      z-index: 3;
      width: 100%;
      min-height: 60px;
      padding: 6px 8px 6px;
      border-radius: 12px;
      border: 3px solid #f5c95c;
      background: linear-gradient(180deg, #16865f 0%, #0b5c41 55%, #063827 100%);
      box-shadow:
        0 0 18px rgba(255, 212, 92, 0.48),
        0 8px 16px rgba(0, 0, 0, 0.85),
        inset 0 0 0 2px rgba(255, 240, 178, 0.45);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .v5jb-start-big {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(19px, 5vw, 24px);
      line-height: 1;
      letter-spacing: 0.05em;
      background: linear-gradient(180deg, #fffbe2 0%, #ffd56b 55%, #d6911e 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      filter: drop-shadow(0 2px 2px rgba(4, 24, 16, 0.92));
    }
    .v5jb-start-sub {
      margin-top: 2px;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: clamp(9.5px, 2.5vw, 11.5px);
      letter-spacing: 0.06em;
      color: #fff2c4;
      text-transform: uppercase;
      white-space: nowrap;
    }

    /* ---------------- DESKTOP PANORAMIC CABINET (>= 920px) ---------------- */
    @media (min-width: 920px) {
      .v5jb-cabinet {
        padding: 10px 22px 14px;
      }
      .v5jb-header-arch {
        max-width: 780px;
        padding: 15px 14px 8px;
      }
      .v5jb-marquee-plaque {
        width: 344px;
        min-height: 76px;
      }
      .v5jb-main-layout {
        margin-top: 12px;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 24px;
      }
      .v5jb-wheel-col {
        width: auto;
        flex: 0 0 auto;
      }
      .v5jb-wheel-stage {
        --wheel-size: 468px;
        --orbit-r: 186px;
        --med-size: 60px;
      }
      .v5jb-med-plate {
        min-width: 66px;
        max-width: 86px;
        padding: 2px 7px 2.5px;
      }
      .v5jb-med-name {
        font-size: 9.5px;
      }
      .v5jb-hub-main {
        font-size: 13px;
      }
      .v5jb-hub-sub {
        font-size: 9.5px;
      }
      .v5jb-console-col {
        flex: 1 1 auto;
        max-width: 576px;
      }
      .v5jb-detent-group.is-diff-group .v5jb-detent-row {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }
      .v5jb-subcat-body {
        max-height: 190px;
      }
      .v5jb-switch-plate {
        min-height: 100px;
      }
      .v5jb-start-plaque {
        min-height: 76px;
      }
    }

    /* Bespoke Phone Landscape Cabinet (e.g. 844x390) — Fits cleanly inside 390px height! */
    @media (max-height: 500px) and (min-width: 600px) {
      .v5jb-cabinet {
        padding: 4px 12px 6px;
      }
      .v5jb-topbar {
        margin-bottom: 2px;
      }
      .v5jb-back-btn {
        min-height: 28px;
        padding: 3px 10px;
        font-size: 10px;
      }
      .v5jb-fs-btn {
        width: 28px;
        height: 28px;
      }
      .v5jb-header-arch {
        display: none;
      }
      .v5jb-main-layout {
        margin-top: 2px;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 14px;
      }
      .v5jb-wheel-col {
        width: auto;
        flex: 0 0 auto;
      }
      .v5jb-wheel-stage {
        --wheel-size: 326px;
        --orbit-r: 130px;
        --med-size: 40px;
      }
      .v5jb-med-plate {
        min-width: 48px;
        max-width: 66px;
        padding: 1px 4px;
      }
      .v5jb-med-name {
        font-size: 7.8px;
      }
      .v5jb-console-col {
        flex: 1 1 auto;
        max-width: 472px;
        gap: 3px;
      }
      .v5jb-strip-drawer {
        padding: 4px 7px;
        gap: 3px;
      }
      .v5jb-now-label { font-size: 12px; }
      .v5jb-now-meta { font-size: 9.5px; margin-top: 0; }
      .v5jb-mini-brass-btn { min-height: 26px; padding: 2px 8px; font-size: 9px; }
      .v5jb-search-row { min-height: 26px; padding: 0 8px; }
      .v5jb-search-input { font-size: 11.5px; padding: 3px 0; }
      .v5jb-subcat-body { max-height: 52px; gap: 3px; }
      .v5jb-topic-chip { min-height: 24px; padding: 2px 7px; font-size: 10px; }
      .v5jb-detents-bar { gap: 3px; }
      .v5jb-detent-group { padding: 3px 6px; }
      .v5jb-detent-group.is-diff-group .v5jb-detent-row {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }
      .v5jb-detent-btn { min-height: 22px; font-size: 9.5px; padding: 1px 4px; }
      .v5jb-detent-btn.is-diff { font-size: 9px; padding: 1px 3px; }
      .v5jb-switch-deck { padding: 5px 6px 4px; gap: 5px; }
      .v5jb-switch-plate { min-height: 56px; padding: 3px 4px 2px; }
      .v5jb-toggle-well { width: 26px; height: 34px; }
      .v5jb-toggle-baton { width: 12px; height: 19px; transform: translateY(-5px); }
      .v5jb-throw-unit.is-down .v5jb-toggle-baton { transform: translateY(5px); }
      .v5jb-switch-bot-label { margin-top: 2px; font-size: 8.5px; }
      .v5jb-lever-handle { width: 68px; height: 24px; margin-bottom: -4px; }
      .v5jb-start-plaque { min-height: 46px; padding: 3px 6px; }
      .v5jb-start-big { font-size: 16px; }
      .v5jb-start-sub { font-size: 8.2px; }
    }

    /* Narrow mobile tuning (<= 375px) */
    @media (max-width: 375px) {
      .v5jb-detents-bar {
        grid-template-columns: 1fr;
      }
      .v5jb-med-name {
        font-size: 8px;
      }
    }

    @keyframes v5jb-bulb-glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.52; }
    }
    @media (prefers-reduced-motion: reduce) {
      .v5jb-bulb { animation: none !important; }
      .v5jb-rotor-dial, .v5jb-pointer-arm { transition: none !important; }
    }
  `,document.head.appendChild(n)}class U{container;rootEl=null;callbacks=null;options={};tree=[];accuracyLookup={domainStats:{},subcatStats:{}};selectedDomainId=null;selectedL1Id=null;selectedL2Id=null;searchQuery="";drawerExpanded=!1;formatMode="VARIETY_MIX";timerPace="STANDARD";difficulty="ADAPTIVE";roundCount=10;rotorAngleDeg=0;isDraggingDial=!1;dragStartPointerAngle=0;dragStartRotorAngle=0;lastSnapStep=-1;boundKeydown=e=>{if(!this.rootEl)return;if(e.key==="Escape"){e.preventDefault(),this.callbacks?.onClose();return}const t=(document.activeElement?.tagName??"").toLowerCase();t==="input"||t==="textarea"||(e.key==="ArrowRight"||e.key==="ArrowDown"?(e.preventDefault(),this.stepWheelSelection(1)):(e.key==="ArrowLeft"||e.key==="ArrowUp")&&(e.preventDefault(),this.stepWheelSelection(-1)))};constructor(e){this.container=e,R()}mount(e,t={}){R(),this.callbacks=e,this.options=t,this.selectedDomainId=t.initialDomainId!==void 0?t.initialDomainId:null,this.selectedL1Id=t.initialL1SubcategoryId??null,this.selectedL2Id=t.initialL2TopicId??null,this.searchQuery=t.initialSearchQuery??"",this.drawerExpanded=this.selectedDomainId!==null||this.searchQuery.trim().length>0;const i=D(y);this.formatMode=t.initialFormatMode??(i==="CLASSIC_4_ONLY"?"CLASSIC_4_ONLY":"VARIETY_MIX");const d=D(k);this.timerPace=t.initialTimerPace??(d==="RELAXED_UNTIMED"?"RELAXED_UNTIMED":"STANDARD");const c=D(L);this.difficulty=t.initialDifficulty??(c?I(c):"ADAPTIVE"),this.roundCount=t.initialCount??10,this.accuracyLookup=q(t.domainAccuracyOverrides),this.rebuildTree(),this.selectedDomainId!==null?this.rotorAngleDeg=this.domainToClockDeg(this.selectedDomainId):this.rotorAngleDeg=0,this.renderFull(),window.addEventListener("keydown",this.boundKeydown),z().then(l=>{!this.rootEl||!l||(this.rebuildTree(),this.updateSubcategoryDrawerDom(),this.updateCatalogCountTag())})}setSelection(e,t=null,i=null){this.selectedDomainId=e,this.selectedL1Id=t,this.selectedL2Id=i,e!==null&&(this.rotorAngleDeg=this.domainToClockDeg(e),this.drawerExpanded=!0),this.updateWheelDom(),this.updateSubcategoryDrawerDom()}getCurrentLaunchSpec(){let e="All 12 Domains · Global Mix",t;if(this.selectedDomainId!==null){const i=this.tree.find(l=>l.domainId===this.selectedDomainId),d=j[this.selectedDomainId];if(e=i?.name??d?.name??"Selected Domain",i&&this.selectedL1Id){const l=i.subcategories.find(o=>o.id===this.selectedL1Id);if(l&&(e=`${i.shortName} › ${l.name}`,this.selectedL2Id)){const o=l.topics.find(h=>h.id===this.selectedL2Id);o&&(e=`${i.shortName} › ${l.name} › ${o.name}`,t=o.keywords)}}}return{domains:this.selectedDomainId!==null?[this.selectedDomainId]:[],l0DomainId:this.selectedDomainId!==null?this.selectedDomainId:void 0,l1SubcategoryId:this.selectedL1Id??void 0,l2TopicId:this.selectedL2Id??void 0,selectionLabel:e,topicKeywords:t,difficulty:this.difficulty,count:this.roundCount,formatMode:this.formatMode,timerPace:this.timerPace}}dispose(){window.removeEventListener("keydown",this.boundKeydown),this.rootEl&&this.rootEl.parentElement===this.container&&this.rootEl.remove(),this.rootEl=null,this.callbacks=null}buildFallbackCounts(){return{tier1HumanTotal:0,shardFactTotal:0,verifiedUniqueTotal:0,codexSynthesisTotal:0,totalPlayableCount:0,qidSpaceCapacity:1048575,seenTotal:0,loadedShardDomains:[],byDomain:j.map(e=>({domainId:e.id,key:e.key,name:e.name,shortName:e.shortName,accentHex:e.accentHex,medallionUrl:e.medallionUrl,tier1HumanCount:0,shardFactCount:0,verifiedCount:0,codexSynthesisCount:0,totalPlayableCount:0,shardLoaded:!1,seenInDomainEst:0}))}}rebuildTree(){let e=this.options.universeCounts??null;const t=this.options.forgeInstance;if(t&&!e)try{e=t.getUniverseCounts?.()??null}catch{e=null}this.tree=B(e??this.buildFallbackCounts(),this.options.forgeInstance)}domainToClockDeg(e){const t=v.indexOf(e);return(t>=0?t:0)*30}clockDegToDomain(e){const t=(e%360+360)%360,i=Math.round(t/30)%12;return v[i]??0}stepWheelSelection(e){if(this.selectedDomainId===null){this.selectDomain(e>0?v[0]:v[11]);return}const i=(v.indexOf(this.selectedDomainId)+e+12)%12;this.selectDomain(v[i])}selectDomain(e){this.selectedDomainId=e,this.selectedL1Id=null,this.selectedL2Id=null,e!==null&&(this.rotorAngleDeg=this.domainToClockDeg(e),this.drawerExpanded=!0),this.callbacks?.onInteractionFeedback?.("dial_tick"),this.updateWheelDom(),this.updateSubcategoryDrawerDom()}getSelectedDomainNode(){return this.selectedDomainId===null?null:this.tree.find(e=>e.domainId===this.selectedDomainId)??null}renderFull(){const t=T(this.tree).l2Count,i=this.options.mode==="modal",d=document.createElement("section");d.className=`v5jb-root${i?" is-modal-overlay":""}`,d.setAttribute("aria-label","Topic Jukebox — 12 Domains and Subcategory Selector");const c=v.map((o,h)=>{const r=S[o],u=j[o],b=(h*30-90)*Math.PI/180,s=Math.cos(b).toFixed(4),a=Math.sin(b).toFixed(4),p=this.accuracyLookup.domainStats[o],g=E(p),x=this.selectedDomainId===o;return`
        <button
          type="button"
          class="v5jb-medallion${x?" is-selected":""}"
          data-v5jb-domain="${o}"
          style="--tx: calc(var(--orbit-r) * ${s}); --ty: calc(var(--orbit-r) * ${a}); --enamel-top: ${r.enamelTop}; --enamel-bottom: ${r.enamelBottom};"
          aria-pressed="${x?"true":"false"}"
          aria-label="${f(u.name)}${p?`, ${p.pct}% accuracy`:""}"
        >
          <span class="v5jb-med-disc">${P(o)}</span>
          <span class="v5jb-med-plate">
            <span class="v5jb-med-name">${f(r.wheelShortLabel)}</span>
            ${w(g,8)}
          </span>
        </button>
      `}).join(""),l=this.selectedDomainId!==null?this.domainToClockDeg(this.selectedDomainId):0;d.innerHTML=`
      <div class="v5jb-cabinet">
        <div class="v5jb-lamp v5jb-lamp-left" aria-hidden="true"></div>
        <div class="v5jb-lamp v5jb-lamp-right" aria-hidden="true"></div>

        <!-- TOP BRASS BACK LATCH & 1-TAP FULLSCREEN -->
        <div class="v5jb-topbar">
          <button
            type="button"
            class="v5jb-back-btn"
            data-v5jb-close
            aria-label="Back to Green Room"
          >
            <svg viewBox="0 0 18 18" width="14" height="14" aria-hidden="true">
              <path d="M 11 3 L 5 9 L 11 15" fill="none" stroke="#ffe8a8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Green Room</span>
          </button>
          <div class="v5jb-topbar-right">
            <span class="v5jb-catalog-tag" data-v5jb-catalog-tag>12 Domains · ${t} Topics</span>
            <button
              type="button"
              class="v5jb-fs-btn"
              data-v5jb-fullscreen
              aria-label="Toggle Fullscreen Jukebox"
              title="Toggle Fullscreen"
            >
              ${$(typeof document<"u"&&!!document.fullscreenElement)}
            </button>
          </div>
        </div>

        <!-- MARQUEE HEADER FLANKED BY GOLDEN TROPHIES -->
        <header class="v5jb-header-arch">
          <div class="v5jb-marquee-row">
            ${M()}
            <div class="v5jb-marquee-plaque">
              ${G()}
              ${H()}
              <h1 class="v5jb-marquee-title" style="margin:0;">TOPIC<br/>JUKEBOX</h1>
            </div>
            ${M()}
          </div>
          <div class="v5jb-ribbon">12 Domains · Trophy Showcase</div>
        </header>

        <!-- MAIN BODY: ROTARY WHEEL + SUBCATEGORY STRIP + THROW-SWITCH CONSOLE -->
        <div class="v5jb-main-layout">
          <!-- INTERACTIVE 12-DOMAIN ROTARY JUKEBOX WHEEL -->
          <div class="v5jb-wheel-col">
            <div class="v5jb-wheel-stage" data-v5jb-wheel-stage>
              ${c}

              <div class="v5jb-wheel-inner-ring">
                <div
                  class="v5jb-rotor-dial"
                  data-v5jb-rotor
                  style="--rotor-deg: ${this.rotorAngleDeg}deg;"
                  title="Drag to spin the brass rotary dial"
                >
                  ${_()}
                </div>

                <button
                  type="button"
                  class="v5jb-center-hub${this.selectedDomainId===null?" is-active":""}"
                  data-v5jb-all-domains
                  aria-pressed="${this.selectedDomainId===null?"true":"false"}"
                  aria-label="Select All 12 Domains Global Mix"
                >
                  <span class="v5jb-hub-main" data-v5jb-hub-main>${this.selectedDomainId===null?"ALL 12":f(S[this.selectedDomainId].wheelShortLabel)}</span>
                  <span class="v5jb-hub-sub" data-v5jb-hub-sub>${this.selectedDomainId===null?"Global Mix":"Tap: All 12"}</span>
                </button>
              </div>

              <!-- Glowing Golden Pointer Arrow -->
              <div
                class="v5jb-pointer-arm${this.selectedDomainId===null?" is-all-mix":""}"
                data-v5jb-pointer
                style="--pointer-deg: ${l}deg;"
                aria-hidden="true"
              >
                <svg class="v5jb-pointer-head" viewBox="0 0 28 30">
                  <defs>
                    <linearGradient id="v5jb-ptr-g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#fffbe0"/>
                      <stop offset="55%" stop-color="#ffd052"/>
                      <stop offset="100%" stop-color="#b87212"/>
                    </linearGradient>
                  </defs>
                  <polygon points="14,1 26,27 14,21 2,27" fill="url(#v5jb-ptr-g)" stroke="#623605" stroke-width="1.8" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- EXPANDABLE BRASS SUBCATEGORY STRIP + DETENTS + THROW-SWITCH DECK -->
          <div class="v5jb-console-col">
            <!-- Brass Subcategory / Topic Strip + Instant Filter -->
            <section class="v5jb-strip-drawer" aria-label="Subcategory and Topic Filter">
              <div class="v5jb-selection-header">
                <div class="v5jb-now-spinning">
                  <span class="v5jb-now-kicker">Now Spinning</span>
                  <span class="v5jb-now-label" data-v5jb-now-label></span>
                  <span class="v5jb-now-meta" data-v5jb-now-meta></span>
                </div>
                <div class="v5jb-drawer-actions">
                  <button
                    type="button"
                    class="v5jb-mini-brass-btn"
                    data-v5jb-reset-all
                    style="display:none;"
                  >All 12</button>
                  <button
                    type="button"
                    class="v5jb-mini-brass-btn"
                    data-v5jb-toggle-drawer
                    aria-expanded="${this.drawerExpanded?"true":"false"}"
                  >${this.drawerExpanded?"Topics ▴":"Subtopics ▾"}</button>
                </div>
              </div>

              <div class="v5jb-search-row">
                ${Y()}
                <input
                  type="search"
                  class="v5jb-search-input"
                  data-v5jb-search
                  value="${f(this.searchQuery)}"
                  placeholder="Filter ${t} topics (e.g. Baseball, Rome, Space)..."
                  aria-label="Filter subcategories and specialist topics"
                  autocomplete="off"
                />
                <button
                  type="button"
                  class="v5jb-search-clear"
                  data-v5jb-search-clear
                  aria-label="Clear topic filter"
                  style="display:${this.searchQuery.trim()?"inline-flex":"none"};"
                >✕</button>
              </div>

              <div class="v5jb-subcat-body${this.drawerExpanded?"":" is-collapsed"}" data-v5jb-subcat-body></div>
            </section>

            <!-- Brass Run-Length Detents (5/10/20/50) & Difficulty Selector -->
            <div class="v5jb-detents-bar">
              <div class="v5jb-detent-group">
                <span class="v5jb-detent-label">Questions</span>
                <div class="v5jb-detent-row" role="group" aria-label="Run Length Questions">
                  ${A.map(o=>`
                      <button
                        type="button"
                        class="v5jb-detent-btn${this.roundCount===o?" is-selected":""}"
                        data-v5jb-count="${o}"
                        aria-pressed="${this.roundCount===o?"true":"false"}"
                      >${o}</button>
                    `).join("")}
                </div>
              </div>

              <div class="v5jb-detent-group is-diff-group">
                <span class="v5jb-detent-label">Difficulty</span>
                <div class="v5jb-detent-row" role="group" aria-label="Difficulty Preset">
                  ${F.map(o=>`
                      <button
                        type="button"
                        class="v5jb-detent-btn is-diff${this.difficulty===o.id?" is-selected":""}"
                        data-v5jb-diff="${o.id}"
                        aria-pressed="${this.difficulty===o.id?"true":"false"}"
                      >${f(o.shortLabel)}</button>
                    `).join("")}
                </div>
              </div>
            </div>

            <!-- PHYSICAL BRASS THROW-SWITCHES & START CUSTOM SHOW STAGE LEVER -->
            <div class="v5jb-switch-deck">
              <!-- LEFT THROW-SWITCH: 7-Format Mix / Classic -->
              <button
                type="button"
                role="switch"
                class="v5jb-throw-unit ${this.formatMode==="VARIETY_MIX"?"is-up":"is-down"}"
                data-v5jb-switch="format"
                aria-checked="${this.formatMode==="VARIETY_MIX"?"true":"false"}"
                aria-label="Format Mode: currently ${this.formatMode==="VARIETY_MIX"?"7-Format Mix":"Classic 4-Choice"}"
              >
                <span class="v5jb-switch-top-plate">7-Format Mix</span>
                <span class="v5jb-switch-plate">
                  <span class="v5jb-rivet v5jb-rivet-tl"></span>
                  <span class="v5jb-rivet v5jb-rivet-tr"></span>
                  <span class="v5jb-rivet v5jb-rivet-bl"></span>
                  <span class="v5jb-rivet v5jb-rivet-br"></span>
                  <span class="v5jb-switch-arrow v5jb-switch-arrow-l" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="10" height="10"><polygon points="10,1 2,6 10,11" fill="#ffd868"/></svg>
                  </span>
                  <span class="v5jb-toggle-well">
                    <span class="v5jb-toggle-baton"></span>
                  </span>
                  <span class="v5jb-switch-bot-label">Classic</span>
                </span>
              </button>

              <!-- CENTER STAGE LEVER: START CUSTOM SHOW -->
              <button
                type="button"
                class="v5jb-lever-btn"
                data-v5jb-start
                aria-label="Start Custom Show"
              >
                <svg class="v5jb-lever-handle" viewBox="0 0 110 56" aria-hidden="true">
                  <defs>
                    <linearGradient id="v5jb-lev-brass" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stop-color="#7c4b0b"/>
                      <stop offset="45%" stop-color="#fff0a6"/>
                      <stop offset="100%" stop-color="#8b5510"/>
                    </linearGradient>
                    <linearGradient id="v5jb-lev-emerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#38d49c"/>
                      <stop offset="50%" stop-color="#0f7c56"/>
                      <stop offset="100%" stop-color="#063e2b"/>
                    </linearGradient>
                  </defs>
                  <!-- Pivot arms -->
                  <rect x="20" y="22" width="12" height="32" rx="4" fill="url(#v5jb-lev-brass)" stroke="#4c2905" stroke-width="2"/>
                  <rect x="78" y="22" width="12" height="32" rx="4" fill="url(#v5jb-lev-brass)" stroke="#4c2905" stroke-width="2"/>
                  <!-- End brass collars -->
                  <rect x="10" y="7" width="16" height="22" rx="6" fill="url(#v5jb-lev-brass)" stroke="#4c2905" stroke-width="2"/>
                  <rect x="84" y="7" width="16" height="22" rx="6" fill="url(#v5jb-lev-brass)" stroke="#4c2905" stroke-width="2"/>
                  <!-- Sculpted emerald cylindrical bar handle -->
                  <rect x="23" y="8" width="64" height="20" rx="8" fill="url(#v5jb-lev-emerald)" stroke="#5b3406" stroke-width="2"/>
                  <rect x="28" y="12" width="54" height="4" rx="2" fill="rgba(220,255,238,0.45)"/>
                </svg>
                <span class="v5jb-start-plaque">
                  <span class="v5jb-start-big">START</span>
                  <span class="v5jb-start-sub">Custom Show</span>
                </span>
              </button>

              <!-- RIGHT THROW-SWITCH: Shot Clock / Relaxed ∞ -->
              <button
                type="button"
                role="switch"
                class="v5jb-throw-unit ${this.timerPace==="STANDARD"?"is-up":"is-down"}"
                data-v5jb-switch="timer"
                aria-checked="${this.timerPace==="STANDARD"?"true":"false"}"
                aria-label="Clock Pace: currently ${this.timerPace==="STANDARD"?"Shot Clock":"Relaxed Untimed"}"
              >
                <span class="v5jb-switch-top-plate">Shot Clock</span>
                <span class="v5jb-switch-plate">
                  <span class="v5jb-rivet v5jb-rivet-tl"></span>
                  <span class="v5jb-rivet v5jb-rivet-tr"></span>
                  <span class="v5jb-rivet v5jb-rivet-bl"></span>
                  <span class="v5jb-rivet v5jb-rivet-br"></span>
                  <span class="v5jb-switch-arrow v5jb-switch-arrow-r" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="10" height="10"><polygon points="2,1 10,6 2,11" fill="#ffd868"/></svg>
                  </span>
                  <span class="v5jb-toggle-well">
                    <span class="v5jb-toggle-baton"></span>
                  </span>
                  <span class="v5jb-switch-bot-label">Relaxed ∞</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `,this.container.replaceChildren(d),this.rootEl=d,this.bindEvents(d),this.updateWheelDom(),this.updateSubcategoryDrawerDom()}bindEvents(e){e.querySelector("[data-v5jb-close]")?.addEventListener("click",()=>{this.callbacks?.onInteractionFeedback?.("tap"),this.callbacks?.onClose()});const t=e.querySelector("[data-v5jb-fullscreen]");t?.addEventListener("click",()=>{this.callbacks?.onInteractionFeedback?.("tap"),W(r=>{t.innerHTML=$(r),t.setAttribute("aria-label",r?"Exit Fullscreen Jukebox":"Toggle Fullscreen Jukebox"),this.callbacks?.onToggleFullscreen?.(r)})}),e.querySelectorAll("[data-v5jb-domain]").forEach(r=>{r.addEventListener("click",()=>{const u=Number(r.dataset.v5jbDomain);if(this.selectedDomainId===u&&!this.selectedL1Id){this.drawerExpanded=!0,this.updateSubcategoryDrawerDom(),this.callbacks?.onInteractionFeedback?.("tap");return}this.selectDomain(u)})}),e.querySelector("[data-v5jb-all-domains]")?.addEventListener("click",()=>{this.selectDomain(null)});const i=e.querySelector("[data-v5jb-rotor]");if(i){const r=b=>{const s=i.getBoundingClientRect(),a=s.left+s.width/2,p=s.top+s.height/2;return Math.atan2(b.clientY-p,b.clientX-a)*180/Math.PI};i.addEventListener("pointerdown",b=>{this.isDraggingDial=!0,this.dragStartPointerAngle=r(b),this.dragStartRotorAngle=this.rotorAngleDeg,this.lastSnapStep=Math.round((this.rotorAngleDeg%360+360)%360/30)%12,i.classList.add("is-dragging");try{i.setPointerCapture(b.pointerId)}catch{}}),i.addEventListener("pointermove",b=>{if(!this.isDraggingDial)return;let a=r(b)-this.dragStartPointerAngle;a>180&&(a-=360),a<-180&&(a+=360);const p=this.dragStartRotorAngle+a;this.rotorAngleDeg=p,i.style.setProperty("--rotor-deg",`${p.toFixed(1)}deg`);const g=this.clockDegToDomain(p),x=v.indexOf(g);x!==this.lastSnapStep&&(this.lastSnapStep=x,this.selectedDomainId=g,this.selectedL1Id=null,this.selectedL2Id=null,this.drawerExpanded=!0,this.callbacks?.onInteractionFeedback?.("dial_tick"),this.updateWheelDom(!1),this.updateSubcategoryDrawerDom())});const u=b=>{if(this.isDraggingDial){this.isDraggingDial=!1,i.classList.remove("is-dragging");try{i.releasePointerCapture(b.pointerId)}catch{}this.selectedDomainId!==null&&(this.rotorAngleDeg=this.domainToClockDeg(this.selectedDomainId)),this.updateWheelDom(!0)}};i.addEventListener("pointerup",u),i.addEventListener("pointercancel",u)}e.querySelector("[data-v5jb-toggle-drawer]")?.addEventListener("click",()=>{this.drawerExpanded=!this.drawerExpanded,this.callbacks?.onInteractionFeedback?.("tap"),this.updateSubcategoryDrawerDom()}),e.querySelector("[data-v5jb-reset-all]")?.addEventListener("click",()=>{this.searchQuery="";const r=e.querySelector("[data-v5jb-search]");r&&(r.value=""),this.selectDomain(null)});const d=e.querySelector("[data-v5jb-search]"),c=e.querySelector("[data-v5jb-search-clear]");d?.addEventListener("input",()=>{this.searchQuery=d.value,this.searchQuery.trim().length>0&&(this.drawerExpanded=!0),c&&(c.style.display=this.searchQuery.trim().length>0?"inline-flex":"none"),this.updateSubcategoryDrawerDom()}),c?.addEventListener("click",()=>{this.searchQuery="",d&&(d.value="",d.focus()),c.style.display="none",this.callbacks?.onInteractionFeedback?.("tap"),this.updateSubcategoryDrawerDom()}),e.querySelectorAll("[data-v5jb-count]").forEach(r=>{r.addEventListener("click",()=>{const u=Number(r.dataset.v5jbCount);A.includes(u)&&(this.roundCount=u,this.callbacks?.onInteractionFeedback?.("tap"),e.querySelectorAll("[data-v5jb-count]").forEach(b=>{const s=Number(b.dataset.v5jbCount)===u;b.classList.toggle("is-selected",s),b.setAttribute("aria-pressed",s?"true":"false")}))})}),e.querySelectorAll("[data-v5jb-diff]").forEach(r=>{r.addEventListener("click",()=>{const u=I(r.dataset.v5jbDiff??"ADAPTIVE");this.difficulty=u,m(L,u),this.callbacks?.onInteractionFeedback?.("tap"),e.querySelectorAll("[data-v5jb-diff]").forEach(b=>{const s=b.dataset.v5jbDiff===u;b.classList.toggle("is-selected",s),b.setAttribute("aria-pressed",s?"true":"false")})})});const l=e.querySelector('[data-v5jb-switch="format"]');l?.addEventListener("click",()=>{this.formatMode=this.formatMode==="VARIETY_MIX"?"CLASSIC_4_ONLY":"VARIETY_MIX",m(y,this.formatMode);const r=this.formatMode==="VARIETY_MIX";l.classList.toggle("is-up",r),l.classList.toggle("is-down",!r),l.setAttribute("aria-checked",r?"true":"false"),l.setAttribute("aria-label",`Format Mode: currently ${r?"7-Format Mix":"Classic 4-Choice"}`),this.callbacks?.onInteractionFeedback?.("switch_flip"),this.callbacks?.onChangeFormatMode?.(this.formatMode)});const o=e.querySelector('[data-v5jb-switch="timer"]');o?.addEventListener("click",()=>{this.timerPace=this.timerPace==="STANDARD"?"RELAXED_UNTIMED":"STANDARD",m(k,this.timerPace);const r=this.timerPace==="STANDARD";o.classList.toggle("is-up",r),o.classList.toggle("is-down",!r),o.setAttribute("aria-checked",r?"true":"false"),o.setAttribute("aria-label",`Clock Pace: currently ${r?"Shot Clock":"Relaxed Untimed"}`),this.callbacks?.onInteractionFeedback?.("switch_flip"),this.callbacks?.onChangeTimerPace?.(this.timerPace)});const h=e.querySelector("[data-v5jb-start]");h?.addEventListener("click",()=>{h.classList.add("is-pulling"),this.callbacks?.onInteractionFeedback?.("lever_pull"),m(y,this.formatMode),m(k,this.timerPace),m(L,this.difficulty);const r=this.getCurrentLaunchSpec();window.setTimeout(()=>{h.classList.remove("is-pulling"),this.callbacks?.onStartCustomShow(r)},130)})}updateCatalogCountTag(){if(!this.rootEl)return;const e=T(this.tree),t=this.rootEl.querySelector("[data-v5jb-catalog-tag]");t&&(t.textContent=`12 Domains · ${e.l2Count} Topics`);const i=this.rootEl.querySelector("[data-v5jb-search]");i&&(i.placeholder=`Filter ${e.l2Count} topics (e.g. Baseball, Rome, Space)...`)}updateWheelDom(e=!0){if(!this.rootEl)return;const t=this.selectedDomainId===null;this.rootEl.querySelectorAll("[data-v5jb-domain]").forEach(o=>{const h=Number(o.dataset.v5jbDomain),r=this.selectedDomainId===h;o.classList.toggle("is-selected",r),o.setAttribute("aria-pressed",r?"true":"false")});const i=this.rootEl.querySelector("[data-v5jb-all-domains]"),d=this.rootEl.querySelector("[data-v5jb-hub-main]"),c=this.rootEl.querySelector("[data-v5jb-hub-sub]");if(i&&(i.classList.toggle("is-active",t),i.setAttribute("aria-pressed",t?"true":"false")),d&&c)if(t)d.textContent="ALL 12",c.textContent="Global Mix";else{const o=S[this.selectedDomainId];d.textContent=o.wheelShortLabel,c.textContent="Tap: All 12"}const l=this.rootEl.querySelector("[data-v5jb-pointer]");if(l&&(l.classList.toggle("is-all-mix",t),t||l.style.setProperty("--pointer-deg",`${this.domainToClockDeg(this.selectedDomainId)}deg`)),e){const o=this.rootEl.querySelector("[data-v5jb-rotor]");o&&o.style.setProperty("--rotor-deg",`${this.rotorAngleDeg}deg`)}}updateSubcategoryDrawerDom(){if(!this.rootEl)return;const e=this.getCurrentLaunchSpec(),t=this.rootEl.querySelector("[data-v5jb-now-label]"),i=this.rootEl.querySelector("[data-v5jb-now-meta]"),d=this.rootEl.querySelector("[data-v5jb-reset-all]"),c=this.rootEl.querySelector("[data-v5jb-toggle-drawer]"),l=this.rootEl.querySelector("[data-v5jb-subcat-body]");if(t&&(t.textContent=e.selectionLabel),i)if(this.selectedDomainId===null){const s=Object.values(this.accuracyLookup.domainStats).filter(a=>!!(a&&a.total>0));if(s.length>0){const a=Math.round(s.reduce((g,x)=>g+x.pct,0)/s.length),p=E({pct:a,total:5});i.innerHTML=`${w(p,12)} <span>${a}% Personal Accuracy</span>`}else i.innerHTML=`${w(0,12)} <span>Fresh Showcase · Ready to Spin</span>`}else{const s=this.accuracyLookup.domainStats[this.selectedDomainId],a=E(s);i.innerHTML=s?`${w(a,12)} <span>${s.pct}% Personal Accuracy</span>`:`${w(0,12)} <span>Uncharted Domain · Spin to Earn Stars</span>`}if(d&&(d.style.display=this.selectedDomainId!==null?"inline-flex":"none"),c&&(c.textContent=this.drawerExpanded?"Topics ▴":"Subtopics ▾",c.setAttribute("aria-expanded",this.drawerExpanded?"true":"false")),!l||(l.classList.toggle("is-collapsed",!this.drawerExpanded),!this.drawerExpanded))return;const o=this.searchQuery.trim();if(o.length>0){const s=N(this.tree,o);if(s.length===0){l.innerHTML=`<div class="v5jb-empty-search">No topics matching "${f(o)}". Try "Baseball", "Rome", "Space", or "Opera".</div>`;return}l.innerHTML=`
        <div class="v5jb-strip-section-title">Instant Filter Matches (${s.length})</div>
        <div class="v5jb-chip-wrap">
          ${s.map(a=>{const p=this.selectedDomainId===a.domainId&&this.selectedL1Id===a.l1Id&&(a.kind==="L2"?this.selectedL2Id===a.l2Id:!this.selectedL2Id),g=(a.l2Name??a.l1Name).trim().toLowerCase(),x=this.accuracyLookup.subcatStats[g];return`
                <button
                  type="button"
                  class="v5jb-topic-chip${p?" is-selected":""}"
                  data-v5jb-hit-domain="${a.domainId}"
                  data-v5jb-hit-l1="${f(a.l1Id)}"
                  data-v5jb-hit-l2="${f(a.l2Id??"")}"
                >
                  <span>${f(a.breadcrumb)}</span>
                  ${x?`<span class="v5jb-chip-acc">${x.pct}%</span>`:""}
                </button>
              `}).join("")}
        </div>
      `,l.querySelectorAll("[data-v5jb-hit-domain]").forEach(a=>{a.addEventListener("click",()=>{const p=Number(a.dataset.v5jbHitDomain),g=a.dataset.v5jbHitL1||null,x=a.dataset.v5jbHitL2||null;this.selectedDomainId=p,this.selectedL1Id=g,this.selectedL2Id=x,this.rotorAngleDeg=this.domainToClockDeg(p),this.callbacks?.onInteractionFeedback?.("dial_tick"),this.updateWheelDom(),this.updateSubcategoryDrawerDom()})});return}const h=this.getSelectedDomainNode();if(!h){const s=[];for(const a of this.tree){const g=a.subcategories[0]?.topics[0];g&&s.push(g)}l.innerHTML=`
        <div class="v5jb-strip-section-title">Quick-Spin Specialist Topics (All 12 Domains)</div>
        <div class="v5jb-chip-wrap">
          ${s.map(a=>{const p=this.accuracyLookup.subcatStats[a.name.trim().toLowerCase()];return`
                <button
                  type="button"
                  class="v5jb-topic-chip"
                  data-v5jb-quick-domain="${a.domainId}"
                  data-v5jb-quick-l1="${f(a.l1Id)}"
                  data-v5jb-quick-l2="${f(a.id)}"
                >
                  <span>${f(a.name)}</span>
                  ${p?`<span class="v5jb-chip-acc">${p.pct}%</span>`:""}
                </button>
              `}).join("")}
        </div>
      `,l.querySelectorAll("[data-v5jb-quick-domain]").forEach(a=>{a.addEventListener("click",()=>{const p=Number(a.dataset.v5jbQuickDomain);this.selectedDomainId=p,this.selectedL1Id=a.dataset.v5jbQuickL1||null,this.selectedL2Id=a.dataset.v5jbQuickL2||null,this.rotorAngleDeg=this.domainToClockDeg(p),this.callbacks?.onInteractionFeedback?.("dial_tick"),this.updateWheelDom(),this.updateSubcategoryDrawerDom()})});return}const r=h.subcategories.find(s=>s.id===this.selectedL1Id)??null,u=`
      <div class="v5jb-strip-section-title">${f(h.name)} · Subcategories</div>
      <div class="v5jb-chip-wrap">
        <button
          type="button"
          class="v5jb-topic-chip${this.selectedL1Id?"":" is-selected"}"
          data-v5jb-l1=""
        >All ${f(h.shortName)}</button>
        ${h.subcategories.map(s=>{const a=this.selectedL1Id===s.id,p=this.accuracyLookup.subcatStats[s.name.trim().toLowerCase()];return`
              <button
                type="button"
                class="v5jb-topic-chip${a?" is-selected":""}"
                data-v5jb-l1="${f(s.id)}"
              >
                <span>${f(s.name)}</span>
                ${p?`<span class="v5jb-chip-acc">${p.pct}%</span>`:""}
              </button>
            `}).join("")}
      </div>
    `,b=r?`
        <div class="v5jb-strip-section-title">${f(r.name)} · Specialist Topics</div>
        <div class="v5jb-chip-wrap">
          <button
            type="button"
            class="v5jb-topic-chip${this.selectedL2Id?"":" is-selected"}"
            data-v5jb-l2=""
          >All ${f(r.name)}</button>
          ${r.topics.map(s=>{const a=this.selectedL2Id===s.id,p=this.accuracyLookup.subcatStats[s.name.trim().toLowerCase()];return`
                <button
                  type="button"
                  class="v5jb-topic-chip${a?" is-selected":""}"
                  data-v5jb-l2="${f(s.id)}"
                >
                  <span>${f(s.name)}</span>
                  ${p?`<span class="v5jb-chip-acc">${p.pct}%</span>`:""}
                </button>
              `}).join("")}
        </div>
      `:"";l.innerHTML=`${u}${b}`,l.querySelectorAll("[data-v5jb-l1]").forEach(s=>{s.addEventListener("click",()=>{const a=s.dataset.v5jbL1||null;this.selectedL1Id=a,this.selectedL2Id=null,this.callbacks?.onInteractionFeedback?.("tap"),this.updateSubcategoryDrawerDom()})}),l.querySelectorAll("[data-v5jb-l2]").forEach(s=>{s.addEventListener("click",()=>{const a=s.dataset.v5jbL2||null;this.selectedL2Id=a,this.callbacks?.onInteractionFeedback?.("tap"),this.updateSubcategoryDrawerDom()})})}}function ee(n,e,t){const i=new U(n);return i.mount(e,t),i}export{U as TopicJukeboxView,ee as mountTopicJukebox};
