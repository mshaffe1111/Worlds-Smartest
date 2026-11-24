import{a as R,R as x,S as m,f as g,V as f}from"./index-oAuefNbv.js";import"./systems-DSvNuDuC.js";const w="v5-voiced-story-theater-styles";function l(i){return String(i??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function L(i){return i==="hype"?f.maxHype:i==="wince"?f.maxWince:f.maxWelcome}function z(i){return i!=="max_sterling"&&i!=="producer_sam"&&i!=="narrator"}function D(i){return i.replace(/_intro$/,"_walkout").replace(/_clap_bold$/,"_reply_bold").replace(/_clap_respect$/,"_reply_respect").replace(/_clap_witty$/,"_reply_witty").replace(/_trap$/,"_trap_taunt").replace(/_screwed$/,"_screwed_react")}function Y(i){if(!i||typeof i!="object")return{};const e=i;return{playVoiceClip:async(t,a)=>{if(typeof e.playV5Voice!="function")return!1;const n=a?a.slice(0,32):void 0,r=D(t);return await e.playV5Voice(r,n)?!0:r!==t?e.playV5Voice(t,n):!1},stopVoice:()=>{typeof e.stopVoice=="function"&&e.stopVoice()},isVoicePlaying:()=>typeof e.isVoicePlaying=="function"?e.isVoicePlaying():!1,playSfx:t=>{if(typeof e.playSfx=="function")try{e.playSfx(t)}catch{e.playSfx("ui_tap")}}}}function H(){return`
    <svg class="v5-venue-brain-svg" viewBox="0 0 36 24" aria-hidden="true">
      <defs>
        <linearGradient id="v5CrestGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff4c4"/>
          <stop offset="50%" stop-color="#e3ad42"/>
          <stop offset="100%" stop-color="#8c5a14"/>
        </linearGradient>
      </defs>
      <path d="M5 17 C2 13, 3 7, 8 6 C9 3, 14 2, 17 5 L17 19 C13 21, 8 20, 5 17 Z" fill="url(#v5CrestGold)" stroke="#4c2c07" stroke-width="1"/>
      <path d="M31 17 C34 13, 33 7, 28 6 C27 3, 22 2, 19 5 L19 19 C23 21, 28 20, 31 17 Z" fill="url(#v5CrestGold)" stroke="#4c2c07" stroke-width="1"/>
      <path d="M10 9 C12 9, 13 11, 12 13 M26 9 C24 9, 23 11, 24 13 M11 15 C13 15, 14 14, 15 16 M25 15 C23 15, 22 14, 21 16" fill="none" stroke="#5b340a" stroke-width="1.2" stroke-linecap="round"/>
    </svg>
  `}function _(){return`
    <svg class="v5-voice-wave-svg" viewBox="0 0 28 22" aria-hidden="true">
      <defs>
        <linearGradient id="v5WaveGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff5cb"/>
          <stop offset="55%" stop-color="#e7b64c"/>
          <stop offset="100%" stop-color="#a86f1c"/>
        </linearGradient>
      </defs>
      <path d="M2 8.2 H6.4 L12.2 3.2 V18.8 L6.4 13.8 H2 Z" fill="url(#v5WaveGold)" stroke="#4c2a08" stroke-width="0.9" stroke-linejoin="round"/>
      <path class="v5-wave-arc v5-wave-arc-1" d="M15.4 7.6 C17.1 9.2, 17.1 12.8, 15.4 14.4" fill="none" stroke="#ffe597" stroke-width="2" stroke-linecap="round"/>
      <path class="v5-wave-arc v5-wave-arc-2" d="M18.6 5.2 C21.5 8.1, 21.5 13.9, 18.6 16.8" fill="none" stroke="#f0be52" stroke-width="2" stroke-linecap="round"/>
      <path class="v5-wave-arc v5-wave-arc-3" d="M21.8 3 C25.8 7.1, 25.8 14.9, 21.8 19" fill="none" stroke="#d4992d" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `}function k(i){return i?`
      <svg class="v5-hud-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 4V9H4M15 4V9H20M9 20V15H4M15 20V15H20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `:`
    <svg class="v5-hud-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9V4H9M20 9V4H15M4 15V20H9M20 15V20H15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `}function M(){return`
    <svg class="v5-hud-icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 6L13 12L5 18V6Z" fill="currentColor"/>
      <path d="M13 6L20 12L13 18V6Z" fill="currentColor"/>
    </svg>
  `}function G(){return`
    <svg class="v5-next-chevron-svg" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M6 4L15 10L6 16V4Z" fill="currentColor"/>
    </svg>
  `}function O(){return`
    <svg class="v5-intercom-svg" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="v5IntercomRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff2bd"/>
          <stop offset="45%" stop-color="#d89d34"/>
          <stop offset="100%" stop-color="#6b420f"/>
        </linearGradient>
        <radialGradient id="v5IntercomCore" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#4e2915"/>
          <stop offset="100%" stop-color="#1e0e06"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="url(#v5IntercomRim)"/>
      <circle cx="60" cy="60" r="47" fill="url(#v5IntercomCore)" stroke="#f6d57a" stroke-width="2"/>
      <path d="M32 62 A28 28 0 0 1 88 62" fill="none" stroke="#f5cb69" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="26" y="57" width="12" height="22" rx="5" fill="url(#v5IntercomRim)" stroke="#4c2c07" stroke-width="1.5"/>
      <rect x="82" y="57" width="12" height="22" rx="5" fill="url(#v5IntercomRim)" stroke="#4c2c07" stroke-width="1.5"/>
      <path d="M84 74 C76 86, 68 88, 60 88" fill="none" stroke="#f5cb69" stroke-width="3" stroke-linecap="round"/>
      <circle cx="58" cy="88" r="5.5" fill="#ffdf84" stroke="#4c2c07" stroke-width="1.5"/>
      <circle cx="60" cy="54" r="6" fill="#2ee09a"/>
      <circle cx="60" cy="54" r="11" fill="none" stroke="#2ee09a" stroke-width="1.6" opacity="0.55"/>
    </svg>
  `}function U(i,e){const t=`v5Gem_${i}_${e}`,a=i==="RUTHLESS_CONFIDENCE"?{top:"#fff9cc",left:"#ffd44c",right:"#d68216",bottom:"#8a4606",core:"#ffe875",stroke:"#fff0ad"}:i==="WARM_RESPECT"?{top:"#c7ffe8",left:"#43e8a0",right:"#139960",bottom:"#065736",core:"#6ff7bb",stroke:"#b6ffe0"}:{top:"#d4fbff",left:"#4ee6ff",right:"#1490b8",bottom:"#084e6b",core:"#7df0ff",stroke:"#c4f8ff"};return`
    <svg class="v5-choice-gem-svg" viewBox="0 0 48 56" aria-hidden="true">
      <defs>
        <linearGradient id="${t}_bezel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff4c4"/>
          <stop offset="45%" stop-color="#dfaa3f"/>
          <stop offset="100%" stop-color="#6c410d"/>
        </linearGradient>
      </defs>
      <polygon points="24,1 46,28 24,55 2,28" fill="url(#${t}_bezel)" stroke="#3e2206" stroke-width="1.5"/>
      <polygon points="24,6 40,28 24,50 8,28" fill="${a.bottom}"/>
      <polygon points="24,6 40,28 24,28" fill="${a.right}"/>
      <polygon points="24,6 8,28 24,28" fill="${a.top}"/>
      <polygon points="24,50 8,28 24,28" fill="${a.left}"/>
      <polygon points="24,14 33,28 24,42 15,28" fill="${a.core}" opacity="0.88"/>
      <polygon points="24,14 15,28 24,24" fill="#ffffff" opacity="0.65"/>
      <polygon points="24,6 40,28 24,50 8,28" fill="none" stroke="${a.stroke}" stroke-width="1.1" opacity="0.75"/>
    </svg>
  `}function C(i){return i==="left"?`
      <svg class="v5-speech-tail-svg is-left-tail" viewBox="0 0 26 32" aria-hidden="true">
        <path d="M26 3 L2 16 L26 29 Z" fill="#e6b653"/>
        <path d="M26 6.5 L7.5 16 L26 25.5 Z" fill="#3a1c11"/>
      </svg>
    `:`
    <svg class="v5-speech-tail-svg" viewBox="0 0 42 26" aria-hidden="true">
      <g ${i==="up-right"?'transform="scale(-1,1) translate(-42,0)"':""}>
        <path d="M4 26 L16 2 L38 26 Z" fill="#e6b653"/>
        <path d="M9 26 L17.5 7.5 L33.5 26 Z" fill="#3a1c11"/>
      </g>
    </svg>
  `}function b(i){switch(i){case"RUTHLESS_CONFIDENCE":return{badge:"+Bold",variantClass:"is-bold-gold",fallbackHint:"Apex TV Interest"};case"WARM_RESPECT":return{badge:"+Respect",variantClass:"is-respect-emerald",fallbackHint:"Unlocks Ally Tip"};case"SHARP_WIT":default:return{badge:"+Witty",variantClass:"is-witty-cyan",fallbackHint:"Crowd Favorite"}}}function N(i){const e=b(i.attitude),t=[];if(i.unlockCharmId&&t.push("Unlocks Podium Charm"),i.sponsorRepDelta){const n=Object.entries(i.sponsorRepDelta).filter(([,r])=>typeof r=="number"&&r!==0).sort((r,s)=>Math.abs(s[1]??0)-Math.abs(r[1]??0));if(n.length>0){const[r,s]=n[0],o=m[r]?.shortName??r;t.push(s>0?`${o} +${s}`:`${o} ${s}`)}}i.rivalAffinityDelta>=15?t.push(`+${i.rivalAffinityDelta} Ally Affinity`):i.rivalAffinityDelta>0&&t.length===0?t.push(`+${i.rivalAffinityDelta} Respect`):i.rivalAffinityDelta<=-15&&t.push(`${i.rivalAffinityDelta} Rival Grudge`),typeof i.bankrollDeltaUsd=="number"&&i.bankrollDeltaUsd!==0&&t.push(i.bankrollDeltaUsd>0?`+${g(i.bankrollDeltaUsd)}`:g(i.bankrollDeltaUsd));const a=t.length>0?t.slice(0,2).join(" · "):e.fallbackHint;return`${e.badge} · ${a}`}function j(i,e){if(i&&"summaryBadges"in i&&Array.isArray(i.summaryBadges))return[...i.summaryBadges];const t=[];if(i&&"newAffinity"in i){const n=i;if(n.challengerId&&e.rivalAffinityDelta!==0){const r=x[n.challengerId]?.displayName.split(" ")[0]??"Rival",s=e.rivalAffinityDelta>0?"+":"";t.push(`${s}${e.rivalAffinityDelta} ${r} (${n.newAffinity??0})`)}n.queuedAllyCallSceneId&&t.push("Green-Room Ally Call Queued"),n.triggeredSabotage&&t.push("Rival Grudge Sabotage Armed");for(const[r,s]of Object.entries(n.sponsorRepChanges))if(s){const o=m[r]?.shortName??r;t.push(`${o} ${s>0?"+":""}${s}`)}if(n.bankrollDeltaUsd!==0&&t.push(n.bankrollDeltaUsd>0?`+${g(n.bankrollDeltaUsd)}`:g(n.bankrollDeltaUsd)),n.unlockedCharms.length>0&&t.push("Lucky Charm Unlocked"),t.length>0)return t}const a=b(e.attitude);if(t.push(a.badge),e.rivalAffinityDelta!==0&&t.push(e.rivalAffinityDelta>0?`+${e.rivalAffinityDelta} Rival Affinity`:`${e.rivalAffinityDelta} Rival Tension`),e.sponsorRepDelta){for(const[n,r]of Object.entries(e.sponsorRepDelta))if(r){const s=m[n]?.shortName??n;t.push(`${s} ${r>0?"+":""}${r}`)}}return t.slice(0,3)}function F(){if(typeof document>"u"||document.getElementById(w))return;const i=document.createElement("style");i.id=w,i.textContent=`
    .v5-story-theater {
      position: fixed;
      inset: 0;
      z-index: 48;
      width: 100%;
      height: 100dvh;
      max-height: 100dvh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: #140b06;
      color: #fff6e6;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      box-sizing: border-box;
    }

    .v5-story-theater *,
    .v5-story-theater *::before,
    .v5-story-theater *::after {
      box-sizing: border-box;
    }

    /* Full-bleed painted stage backdrop + warm golden stage vignette */
    .v5-theater-backdrop-layer {
      position: absolute;
      inset: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .v5-theater-backdrop-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 26%;
      display: block;
      transform: scale(1.02);
      transition: opacity 320ms ease;
    }

    .v5-theater-vignette {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 75% 44% at 50% 8%, rgba(255, 210, 120, 0.28) 0%, rgba(255, 180, 82, 0.06) 44%, transparent 72%),
        linear-gradient(180deg, rgba(16, 8, 4, 0.44) 0%, rgba(16, 8, 4, 0.06) 24%, rgba(18, 9, 5, 0.36) 62%, rgba(12, 6, 3, 0.90) 100%);
    }

    /* Main foreground theatrical stage layout */
    .v5-theater-shell {
      position: relative;
      z-index: 2;
      flex: 1 1 auto;
      min-height: 0;
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      padding: max(6px, env(safe-area-inset-top)) max(12px, env(safe-area-inset-right)) max(10px, env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
      overflow: hidden;
    }

    /* Top HUD rail with Venue Brass Plaque + 1-tap Fullscreen latch */
    .v5-theater-topbar {
      flex: 0 0 auto;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      min-height: 44px;
      z-index: 8;
    }

    .v5-theater-top-left {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 5px;
      justify-content: flex-start;
    }

    .v5-theater-top-right {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 6px;
      justify-content: flex-end;
    }

    /* Sculpted Venue Crest matching OAKRIDGE HALL plaque in mockup */
    .v5-theater-venue-crest {
      position: relative;
      flex: 1 1 0;
      min-width: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    .v5-venue-finial {
      width: 34px;
      height: 18px;
      margin-bottom: -4px;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #4b2a14 0%, #2a1408 100%);
      border: 1.5px solid #e1ae46;
      border-bottom: none;
      border-radius: 14px 14px 0 0;
      box-shadow: 0 -2px 10px rgba(255, 206, 108, 0.25);
    }

    .v5-venue-brain-svg {
      width: 22px;
      height: 14px;
      display: block;
    }

    .v5-venue-plaque {
      padding: 4px 16px;
      background: linear-gradient(180deg, #5c371c 0%, #3a200e 55%, #241106 100%);
      border: 2px solid #dfaa44;
      border-radius: 5px;
      box-shadow:
        inset 0 1px 0 rgba(255, 241, 190, 0.55),
        inset 0 -1px 0 rgba(48, 22, 6, 0.85),
        0 4px 12px rgba(0, 0, 0, 0.6);
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: clamp(11px, 2.8vw, 15px);
      letter-spacing: 0.11em;
      text-transform: uppercase;
      color: #f8e2a9;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    @media (max-width: 410px) {
      .v5-beat-pips {
        display: none;
      }
      .v5-venue-plaque {
        padding: 4px 10px;
        font-size: 10.5px;
      }
    }

    /* Sculpted brushed-brass HUD latches */
    .v5-theater-brass-btn {
      appearance: none;
      border: 1.5px solid #e5b752;
      border-radius: 6px;
      background: linear-gradient(180deg, #4e2b15 0%, #2d1609 55%, #1d0d04 100%);
      color: #fae6b1;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      min-height: 36px;
      min-width: 36px;
      padding: 0 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      box-shadow:
        inset 0 1px 0 rgba(255, 244, 196, 0.45),
        0 3px 10px rgba(0, 0, 0, 0.55);
      transition: transform 110ms ease, filter 130ms ease, border-color 130ms ease;
    }

    .v5-theater-brass-btn:hover {
      filter: brightness(1.14);
      border-color: #fff0b3;
    }

    .v5-theater-brass-btn:active {
      transform: translateY(1px) scale(0.96);
    }

    .v5-theater-brass-btn.is-icon-only {
      padding: 0;
      width: 38px;
      height: 38px;
    }

    .v5-hud-icon-svg {
      width: 17px;
      height: 17px;
      display: block;
    }

    .v5-beat-pips {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .v5-beat-pip {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(240, 200, 118, 0.28);
      border: 1px solid rgba(240, 200, 118, 0.52);
      transition: transform 180ms ease, background 180ms ease;
    }

    .v5-beat-pip.is-done {
      background: #c89132;
    }

    .v5-beat-pip.is-current {
      background: #ffe99c;
      transform: scale(1.28);
      box-shadow: 0 0 8px rgba(255, 224, 132, 0.85);
    }

    /* Main Content Stage: Portrait stacks Actors top / Dialog+Choices bottom */
    .v5-theater-stage {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      position: relative;
      overflow: hidden;
    }

    /* Waist-up transparent-alpha cast cutouts */
    .v5-theater-actors {
      flex: 1 1 auto;
      min-height: 185px;
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 0;
      margin-bottom: -24px;
      z-index: 2;
      pointer-events: none;
      overflow: hidden;
    }

    .v5-actor-slot {
      flex: 0 1 54%;
      height: 100%;
      max-height: 430px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      position: relative;
      transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1), filter 240ms ease, opacity 240ms ease;
      transform-origin: bottom center;
      will-change: transform;
    }

    .v5-actor-slot.is-left {
      margin-right: -4%;
    }

    .v5-actor-slot.is-right {
      margin-left: -4%;
    }

    .v5-actor-slot.is-speaking {
      z-index: 4;
      transform: translateY(-3px) scale(1.035);
      filter: brightness(1.06) drop-shadow(0 0 16px rgba(255, 206, 108, 0.32)) drop-shadow(0 12px 24px rgba(0, 0, 0, 0.72));
    }

    .v5-actor-slot.is-listening {
      z-index: 2;
      transform: translateY(4px) scale(0.965);
      filter: brightness(0.80) saturate(0.90) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.65));
    }

    .v5-actor-slot.is-neutral {
      z-index: 3;
      transform: scale(1);
      filter: brightness(0.96) drop-shadow(0 10px 20px rgba(0, 0, 0, 0.68));
    }

    .v5-actor-img {
      max-height: 100%;
      max-width: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      object-position: bottom center;
      display: block;
      animation: v5ActorBreathe 4.6s ease-in-out infinite;
    }

    .v5-actor-slot.is-right .v5-actor-img {
      animation-delay: -2.1s;
    }

    .v5-intercom-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-bottom: 44px;
    }

    .v5-intercom-svg {
      width: clamp(86px, 22vw, 126px);
      height: clamp(86px, 22vw, 126px);
      display: block;
      filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.65));
    }

    .v5-intercom-caption {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #f8e2a4;
      background: linear-gradient(180deg, #4b2814 0%, #271207 100%);
      border: 1px solid #d9a43b;
      border-radius: 4px;
      padding: 2px 10px;
    }

    @keyframes v5ActorBreathe {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-4px); }
    }

    /* Dialog + Choices Lower Column */
    .v5-theater-dialogue-col {
      flex: 0 0 auto;
      position: relative;
      z-index: 6;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
    }

    /* Live Choice Outcome Toast Ribbon */
    .v5-consequence-strip {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      min-height: 0;
      margin-bottom: 12px;
      animation: v5RibbonPop 240ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .v5-consequence-tag {
      padding: 3px 11px;
      border-radius: 999px;
      background: linear-gradient(180deg, #165e41 0%, #0a3624 100%);
      border: 1.5px solid #e6b956;
      color: #fff4d1;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55);
    }

    .v5-consequence-tag.is-grudge {
      background: linear-gradient(180deg, #7e221b 0%, #4b100b 100%);
      border-color: #f59c4d;
    }

    @keyframes v5RibbonPop {
      from { opacity: 0; transform: translateY(6px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* Sculpted Mahogany-and-Brass Speech Banner matching mockup */
    .v5-speech-wrap {
      position: relative;
      padding-top: 22px;
      cursor: pointer;
    }

    .v5-speech-tail-mount {
      position: absolute;
      top: -16px;
      left: 20%;
      width: 44px;
      height: 30px;
      z-index: 8;
      pointer-events: none;
      transition: left 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease;
    }

    .v5-speech-tail-mount.is-tail-right {
      left: 66%;
    }

    .v5-speech-tail-mount.is-tail-hidden {
      opacity: 0;
    }

    .v5-speech-tail-svg {
      width: 100%;
      height: 100%;
      display: block;
      filter: drop-shadow(0 -2px 5px rgba(0, 0, 0, 0.55));
    }

    .v5-speech-nameplate {
      position: absolute;
      top: 7px;
      left: 14px;
      z-index: 9;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      max-width: calc(100% - 28px);
      padding: 4px 12px 4px 14px;
      background: linear-gradient(180deg, #54321c 0%, #341c0d 55%, #231106 100%);
      border: 2px solid #e7b855;
      border-radius: 18px 8px 18px 8px;
      box-shadow:
        inset 0 1px 0 rgba(255, 245, 200, 0.6),
        0 4px 12px rgba(0, 0, 0, 0.68);
    }

    .v5-speech-speaker-name {
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 800;
      font-size: clamp(11.5px, 3vw, 14px);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #fff2cf;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .v5-speech-cue-tag {
      padding: 1px 7px;
      border-radius: 4px;
      background: #14543b;
      border: 1px solid #d9ab48;
      color: #ffe8a1;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .v5-speech-cue-tag.is-warning {
      background: #7c1f16;
      border-color: #f39d4e;
    }

    .v5-voice-wave-btn {
      appearance: none;
      border: none;
      background: transparent;
      padding: 2px;
      margin: -2px 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 4px;
      transition: transform 120ms ease, filter 120ms ease;
    }

    .v5-voice-wave-btn:hover {
      transform: scale(1.12);
      filter: brightness(1.18);
    }

    .v5-voice-wave-svg {
      width: 22px;
      height: 18px;
      display: block;
    }

    .v5-voice-wave-btn.is-playing .v5-wave-arc-1 {
      animation: v5WavePulse 650ms ease-in-out infinite;
    }
    .v5-voice-wave-btn.is-playing .v5-wave-arc-2 {
      animation: v5WavePulse 650ms ease-in-out 130ms infinite;
    }
    .v5-voice-wave-btn.is-playing .v5-wave-arc-3 {
      animation: v5WavePulse 650ms ease-in-out 260ms infinite;
    }

    @keyframes v5WavePulse {
      0%, 100% { opacity: 0.35; }
      50% { opacity: 1; }
    }

    /* Angled sculpted double-brass + mahogany banner */
    .v5-speech-brass-frame {
      position: relative;
      padding: 3px;
      background: linear-gradient(155deg, #fff1ba 0%, #e1ab43 32%, #9a6419 68%, #f0c96c 100%);
      clip-path: polygon(1.6% 0%, 100% 0%, 98.2% 100%, 0% 100%);
      border-radius: 10px;
      filter: drop-shadow(0 10px 22px rgba(0, 0, 0, 0.72));
    }

    .v5-speech-mahogany-body {
      position: relative;
      padding: 20px 20px 16px 22px;
      clip-path: polygon(1.5% 0%, 100% 0%, 98.3% 100%, 0% 100%);
      border-radius: 8px;
      background:
        repeating-linear-gradient(
          -2deg,
          rgba(255, 200, 140, 0.025) 0px,
          rgba(255, 200, 140, 0.025) 2px,
          transparent 2px,
          transparent 8px
        ),
        linear-gradient(180deg, #4b2416 0%, #37190e 52%, #240f08 100%);
      box-shadow:
        inset 0 2px 0 rgba(255, 224, 152, 0.22),
        inset 0 -3px 8px rgba(0, 0, 0, 0.55);
    }

    .v5-speech-text {
      margin: 0;
      font-size: clamp(16px, 4.3vw, 21px);
      line-height: 1.33;
      font-weight: 500;
      color: #fff6e8;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.75);
      letter-spacing: 0.005em;
      overflow-wrap: break-word;
    }

    .v5-speech-advance-row {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .v5-speech-tap-hint {
      font-size: 11px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: #d9b677;
      opacity: 0.85;
    }

    .v5-speech-next-btn {
      appearance: none;
      border: 2px solid #f4cc6c;
      border-radius: 6px;
      background: linear-gradient(180deg, #177b52 0%, #0c5538 55%, #073924 100%);
      color: #fff7df;
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      min-height: 44px;
      padding: 0 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      cursor: pointer;
      box-shadow:
        inset 0 1px 0 rgba(255, 248, 204, 0.5),
        0 5px 14px rgba(0, 0, 0, 0.55);
      transition: transform 110ms ease, filter 130ms ease;
    }

    .v5-speech-next-btn:hover {
      filter: brightness(1.12);
    }

    .v5-speech-next-btn:active {
      transform: translateY(1px) scale(0.97);
    }

    .v5-next-chevron-svg {
      width: 14px;
      height: 14px;
      display: block;
    }

    /* 3 Jewel-Tipped Beveled Choice Blades matching mockup */
    .v5-choice-deck {
      display: flex;
      flex-direction: column;
      gap: 9px;
      width: 100%;
    }

    .v5-choice-blade {
      appearance: none;
      border: none;
      background: transparent;
      padding: 0;
      margin: 0;
      width: 100%;
      position: relative;
      display: flex;
      align-items: center;
      text-align: left;
      cursor: pointer;
      min-height: 62px;
      transition: transform 130ms cubic-bezier(0.22, 1, 0.36, 1), filter 130ms ease;
      filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.65));
    }

    .v5-choice-blade:hover {
      transform: translateX(3px) scale(1.01);
      filter: brightness(1.10) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.72));
    }

    .v5-choice-blade:active {
      transform: translateY(1px) scale(0.985);
    }

    .v5-choice-blade:focus-visible {
      outline: 2px solid #ffe99c;
      outline-offset: 2px;
    }

    .v5-choice-gem-wrap {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 52px;
      z-index: 4;
      pointer-events: none;
      filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.65));
    }

    .v5-choice-gem-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    .v5-choice-bezel {
      width: calc(100% - 18px);
      margin-left: 18px;
      padding: 2.5px;
      background: linear-gradient(180deg, #fff0b6 0%, #e0ab41 38%, #986318 76%, #f0c76a 100%);
      clip-path: polygon(14px 0%, calc(100% - 16px) 0%, 100% 50%, calc(100% - 16px) 100%, 14px 100%, 0% 50%);
    }

    .v5-choice-core {
      width: 100%;
      min-height: 56px;
      padding: 8px 18px 8px 34px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
      clip-path: polygon(13px 0%, calc(100% - 15px) 0%, 100% 50%, calc(100% - 15px) 100%, 13px 100%, 0% 50%);
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.24),
        inset 0 -3px 6px rgba(0, 0, 0, 0.42);
    }

    /* Exact 3 Jewel Enamel Gradients from mockup_v5_story_scene */
    .v5-choice-blade.is-bold-gold .v5-choice-core {
      background: linear-gradient(180deg, #a67123 0%, #7d4c14 52%, #55300a 100%);
    }

    .v5-choice-blade.is-respect-emerald .v5-choice-core {
      background: linear-gradient(180deg, #1b8155 0%, #0f5f3d 52%, #073d27 100%);
    }

    .v5-choice-blade.is-witty-cyan .v5-choice-core {
      background: linear-gradient(180deg, #19839f 0%, #105f77 52%, #093d4f 100%);
    }

    .v5-choice-label {
      font-size: clamp(13.5px, 3.55vw, 16px);
      font-weight: 700;
      line-height: 1.2;
      color: #fffaf0;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    }

    .v5-choice-subline {
      font-size: clamp(11.5px, 3vw, 13px);
      font-weight: 600;
      line-height: 1.2;
      color: #f9e4ad;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
    }

    .v5-choice-blade.is-respect-emerald .v5-choice-subline {
      color: #c8ffe4;
    }

    .v5-choice-blade.is-witty-cyan .v5-choice-subline {
      color: #c9f7ff;
    }

    /* ========================================================================
       COMPACT PHONE PORTRAIT (360x640) — ZERO CLIPPING
       ======================================================================== */
    @media (orientation: portrait) and (max-height: 700px) {
      .v5-theater-shell {
        padding: 4px 10px 8px 10px;
      }
      .v5-theater-topbar {
        min-height: 36px;
      }
      .v5-venue-finial {
        width: 28px;
        height: 14px;
      }
      .v5-venue-plaque {
        padding: 3px 12px;
        font-size: 11px;
      }
      .v5-theater-actors {
        min-height: 120px;
        margin-bottom: -14px;
      }
      .v5-actor-slot {
        max-height: 220px;
      }
      .v5-theater-dialogue-col {
        gap: 6px;
      }
      .v5-speech-wrap {
        padding-top: 18px;
      }
      .v5-speech-tail-mount {
        top: -13px;
        width: 38px;
        height: 25px;
      }
      .v5-speech-nameplate {
        top: 5px;
        padding: 2px 10px 2px 12px;
      }
      .v5-speech-mahogany-body {
        padding: 15px 14px 11px 16px;
      }
      .v5-speech-text {
        font-size: 14.5px;
        line-height: 1.26;
      }
      .v5-choice-deck {
        gap: 6px;
      }
      .v5-choice-blade {
        min-height: 50px;
      }
      .v5-choice-gem-wrap {
        width: 36px;
        height: 44px;
      }
      .v5-choice-core {
        min-height: 46px;
        padding: 6px 16px 6px 28px;
      }
      .v5-choice-label {
        font-size: 13.5px;
      }
      .v5-choice-subline {
        font-size: 11px;
      }
    }

    /* ========================================================================
       PHONE LANDSCAPE (844x390, 932x430, 640x360)
       2-COLUMN BROADCAST SPLIT-STAGE:
       CHARACTERS ON LEFT <-> SPEECH BANNER & 3 CHOICE BLADES ON RIGHT!
       ZERO SCROLLING! ZERO CLIPPING!
       ======================================================================== */
    @media (orientation: landscape) and (max-height: 520px) {
      .v5-theater-shell {
        max-width: 100%;
        padding: 4px max(12px, env(safe-area-inset-right)) 6px max(12px, env(safe-area-inset-left));
      }

      .v5-theater-topbar {
        min-height: 34px;
        gap: 6px;
      }

      .v5-venue-finial {
        display: none;
      }

      .v5-venue-plaque {
        padding: 3px 14px;
        font-size: 11.5px;
        max-width: 42vw;
      }

      .v5-theater-brass-btn {
        min-height: 32px;
        min-width: 32px;
        font-size: 10px;
        padding: 0 8px;
      }

      .v5-theater-brass-btn.is-icon-only {
        width: 34px;
        height: 34px;
      }

      .v5-theater-stage {
        display: grid;
        grid-template-columns: minmax(230px, 41%) minmax(0, 1fr);
        align-items: stretch;
        gap: 12px;
        padding-top: 2px;
      }

      .v5-theater-actors {
        height: 100%;
        min-height: 0;
        margin-bottom: 0;
        align-items: flex-end;
        justify-content: center;
      }

      .v5-actor-slot {
        flex: 0 1 54%;
        max-height: 100%;
      }

      .v5-actor-slot.is-left {
        margin-right: -7%;
      }

      .v5-actor-slot.is-right {
        margin-left: -7%;
      }

      .v5-theater-dialogue-col {
        height: 100%;
        max-width: none;
        margin: 0;
        justify-content: center;
        gap: 6px;
        min-height: 0;
        overflow: hidden;
      }

      .v5-speech-wrap {
        padding-top: 12px;
        padding-left: 14px;
      }

      .v5-speech-tail-mount {
        top: 50%;
        left: -2px !important;
        width: 22px;
        height: 28px;
        transform: translateY(-40%);
      }

      .v5-speech-nameplate {
        top: 0;
        left: 26px;
        padding: 2px 10px 2px 11px;
      }

      .v5-speech-speaker-name {
        font-size: 11px;
      }

      .v5-speech-mahogany-body {
        padding: 13px 15px 10px 18px;
      }

      .v5-speech-text {
        font-size: clamp(13px, 1.75vw, 15.5px);
        line-height: 1.25;
      }

      .v5-speech-advance-row {
        margin-top: 7px;
      }

      .v5-speech-next-btn {
        min-height: 36px;
        font-size: 11.5px;
        padding: 0 15px;
      }

      .v5-choice-deck {
        gap: 5px;
        padding-left: 8px;
      }

      .v5-choice-blade {
        min-height: 45px;
      }

      .v5-choice-gem-wrap {
        width: 34px;
        height: 40px;
      }

      .v5-choice-bezel {
        width: calc(100% - 14px);
        margin-left: 14px;
        padding: 2px;
      }

      .v5-choice-core {
        min-height: 42px;
        padding: 4px 16px 4px 26px;
        gap: 1px;
      }

      .v5-choice-label {
        font-size: clamp(12.5px, 1.65vw, 14.5px);
        line-height: 1.15;
      }

      .v5-choice-subline {
        font-size: 10.5px;
        line-height: 1.15;
      }

      .v5-consequence-tag {
        padding: 2px 9px;
        font-size: 10.5px;
      }
    }

    /* Ultra-short phone landscape (640x360) extra tightening */
    @media (orientation: landscape) and (max-height: 372px) {
      .v5-speech-text {
        font-size: 12.5px;
        line-height: 1.2;
      }
      .v5-choice-blade {
        min-height: 41px;
      }
      .v5-choice-core {
        min-height: 38px;
      }
      .v5-choice-label {
        font-size: 12px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .v5-actor-img,
      .v5-voice-wave-btn.is-playing .v5-wave-arc {
        animation: none !important;
      }
    }
  `,document.head.appendChild(i)}class Z{hostEl;rootEl=null;currentScene=null;callbacks={};entries=[];entryIndex=0;chosenChoice=null;outcomeBadges=[];isPlayingVoice=!1;voicePollTimer=null;keydownHandler=null;fullscreenChangeHandler=null;resizeHandler=null;constructor(e){this.hostEl=e,F()}showScene(e,t={}){this.stopVoicePlayback(),this.currentScene=e,this.callbacks=t,this.chosenChoice=null,this.outcomeBadges=[];const a=!!(e.choices&&e.choices.length>0),n=e.beats.length>0?e.beats:[];this.entries=n.map((r,s)=>({...r,isChoicePromptBeat:a&&s===n.length-1})),this.entries.length===0&&(this.entries=[{speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:e.title,hostPose:"welcome",isChoicePromptBeat:a}]),this.entryIndex=0,this.mountRoot(),this.renderCurrentState(),this.playCurrentBeatVoice(),this.callbacks.voiceBridge?.playSfx?.("cutscene_whoosh")}isMounted(){return this.rootEl!==null&&this.rootEl.isConnected}unmount(){this.stopVoicePlayback(),this.unbindGlobalListeners(),this.rootEl&&this.rootEl.parentElement&&this.rootEl.parentElement.removeChild(this.rootEl),this.rootEl=null,this.currentScene=null}dispose(){this.unmount()}mountRoot(){if(!this.rootEl){const e=document.createElement("section");e.className="v5-story-theater",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-label",this.currentScene?.title??"Interactive Story Scene"),this.hostEl.appendChild(e),this.rootEl=e,this.bindGlobalListeners()}}bindGlobalListeners(){this.unbindGlobalListeners(),this.keydownHandler=e=>{if(!this.isMounted()||!this.currentScene)return;if(!!(this.entries[this.entryIndex]?.isChoicePromptBeat&&!this.chosenChoice&&this.currentScene.choices?.length)&&this.currentScene.choices){if(e.key==="1"&&this.currentScene.choices[0]){e.preventDefault(),this.handleChoiceSelect(0);return}if(e.key==="2"&&this.currentScene.choices[1]){e.preventDefault(),this.handleChoiceSelect(1);return}if(e.key==="3"&&this.currentScene.choices[2]){e.preventDefault(),this.handleChoiceSelect(2);return}}else e.key==="Enter"||e.key===" "?(e.preventDefault(),this.handleAdvance()):e.key==="Escape"&&this.callbacks.allowSkip!==!1&&(e.preventDefault(),this.handleSkip())},this.fullscreenChangeHandler=()=>{this.updateFullscreenButtonVisual()},this.resizeHandler=()=>{this.isMounted()&&this.updateTailDirectionForViewport()},window.addEventListener("keydown",this.keydownHandler),document.addEventListener("fullscreenchange",this.fullscreenChangeHandler),window.addEventListener("resize",this.resizeHandler)}unbindGlobalListeners(){this.keydownHandler&&(window.removeEventListener("keydown",this.keydownHandler),this.keydownHandler=null),this.fullscreenChangeHandler&&(document.removeEventListener("fullscreenchange",this.fullscreenChangeHandler),this.fullscreenChangeHandler=null),this.resizeHandler&&(window.removeEventListener("resize",this.resizeHandler),this.resizeHandler=null)}isCompactLandscapeViewport(){return typeof window>"u"?!1:window.innerWidth>window.innerHeight&&window.innerHeight<=520}getCurrentBackdropUrl(){const e=this.entries[this.entryIndex];return e?.backdropUrl?e.backdropUrl:this.currentScene?.backdropUrl?this.currentScene.backdropUrl:R[1]}getFeaturedChallengerId(){const e=this.entries[this.entryIndex];return e&&z(e.speaker)?e.speaker:this.currentScene?.featuredChallengerId??null}getCurrentTailDirection(){const e=this.entries[this.entryIndex];return!e||e.speaker==="narrator"?"hidden":this.isCompactLandscapeViewport()?"left":e.speaker==="max_sterling"?"up-right":"up-left"}updateTailDirectionForViewport(){const e=this.rootEl?.querySelector(".v5-speech-tail-mount");if(!e)return;const t=this.getCurrentTailDirection();e.classList.toggle("is-tail-right",t==="up-right"),e.classList.toggle("is-tail-hidden",t==="hidden"),t!=="hidden"&&(e.innerHTML=C(t))}updateFullscreenButtonVisual(){const e=this.rootEl?.querySelector("[data-v5-fullscreen-toggle]");if(!e)return;const t=!!document.fullscreenElement;e.setAttribute("aria-pressed",t?"true":"false"),e.setAttribute("title",t?"Exit Fullscreen":"Enter Fullscreen"),e.innerHTML=k(t)}async handleToggleFullscreen(){if(this.callbacks.voiceBridge?.playSfx?.("ui_tap"),typeof this.callbacks.onToggleFullscreen=="function"){await this.callbacks.onToggleFullscreen(),this.updateFullscreenButtonVisual();return}try{document.fullscreenElement?await document.exitFullscreen():typeof document.documentElement.requestFullscreen=="function"&&await document.documentElement.requestFullscreen()}catch{}this.updateFullscreenButtonVisual()}stopVoicePlayback(){this.voicePollTimer!==null&&(window.clearInterval(this.voicePollTimer),this.voicePollTimer=null),this.isPlayingVoice=!1,this.callbacks.voiceBridge?.stopVoice?.(),this.syncVoiceWaveformVisual()}syncVoiceWaveformVisual(){const e=this.rootEl?.querySelector(".v5-voice-wave-btn");e&&e.classList.toggle("is-playing",this.isPlayingVoice)}async playCurrentBeatVoice(){this.stopVoicePlayback();const e=this.entries[this.entryIndex];if(!(!e?.voiceClipId||!this.callbacks.voiceBridge?.playVoiceClip)){this.isPlayingVoice=!0,this.syncVoiceWaveformVisual();try{if(!await this.callbacks.voiceBridge.playVoiceClip(e.voiceClipId,e.text)){this.isPlayingVoice=!1,this.syncVoiceWaveformVisual();return}if(typeof this.callbacks.voiceBridge.isVoicePlaying=="function")this.voicePollTimer=window.setInterval(()=>{(this.callbacks.voiceBridge?.isVoicePlaying?.()??!1)||(this.isPlayingVoice=!1,this.voicePollTimer!==null&&(window.clearInterval(this.voicePollTimer),this.voicePollTimer=null),this.syncVoiceWaveformVisual())},180);else{const a=Math.max(1800,Math.min(6e3,e.text.length*42));this.voicePollTimer=window.setTimeout(()=>{this.isPlayingVoice=!1,this.voicePollTimer=null,this.syncVoiceWaveformVisual()},a)}}catch{this.isPlayingVoice=!1,this.syncVoiceWaveformVisual()}}}handleChoiceSelect(e){if(!this.currentScene?.choices||this.chosenChoice)return;const t=this.currentScene.choices[e];if(!t)return;this.stopVoicePlayback(),this.callbacks.voiceBridge?.playSfx?.("switch_clack"),this.chosenChoice=t;const a=this.callbacks.onChoiceSelected?.(t,this.currentScene);this.outcomeBadges=j(a,t);const n=this.getFeaturedChallengerId(),r=n?x[n]:null,s=[];if(t.rivalReplyText&&s.push({speaker:n??"max_sterling",speakerName:r?.displayName??"Max Sterling",speakerRole:r?.nicknameTitle,text:t.rivalReplyText,voiceClipId:t.rivalReplyVoiceId,hostPose:t.rivalAffinityDelta>=0?"hype":"wince",backdropUrl:this.getCurrentBackdropUrl()}),t.hostReplyText&&s.push({speaker:"max_sterling",speakerName:"Max Sterling",speakerRole:"Prime-Time Host",text:t.hostReplyText,voiceClipId:t.hostReplyVoiceId,hostPose:"hype",backdropUrl:this.getCurrentBackdropUrl()}),this.currentScene.closingBeats?.length)for(const o of this.currentScene.closingBeats)s.push({...o});if(s.length===0){this.finishScene(!1);return}this.entries=[...this.entries.slice(0,this.entryIndex+1),...s],this.entryIndex+=1,this.renderCurrentState(),this.playCurrentBeatVoice()}handleAdvance(){if(!this.currentScene||!!(this.entries[this.entryIndex]?.isChoicePromptBeat&&!this.chosenChoice&&this.currentScene.choices?.length))return;if(this.callbacks.voiceBridge?.playSfx?.("ui_tap"),this.entryIndex<this.entries.length-1){this.entryIndex+=1,this.renderCurrentState(),this.playCurrentBeatVoice();return}if(!this.chosenChoice&&(!this.currentScene.choices||this.currentScene.choices.length===0)&&!!this.currentScene.closingBeats?.length&&this.entries.length===this.currentScene.beats.length&&this.currentScene.closingBeats){this.entries=[...this.entries,...this.currentScene.closingBeats.map(n=>({...n}))],this.entryIndex+=1,this.renderCurrentState(),this.playCurrentBeatVoice();return}this.finishScene(!1)}handleSkip(){this.currentScene&&(this.callbacks.voiceBridge?.playSfx?.("ui_tap"),this.callbacks.onSkipScene?.(this.currentScene),this.finishScene(!0))}finishScene(e){const t=this.currentScene,a=this.chosenChoice;this.stopVoicePlayback(),this.unmount(),t&&this.callbacks.onSceneComplete?.({sceneId:t.sceneId,sceneKind:t.kind,chosenChoice:a,skipped:e})}renderCurrentState(){if(!this.rootEl||!this.currentScene)return;const e=this.currentScene,t=this.entries[this.entryIndex],a=this.getCurrentBackdropUrl(),n=this.getFeaturedChallengerId(),r=L(t.hostPose),s=this.getCurrentTailDirection(),o=!!(t.isChoicePromptBeat&&!this.chosenChoice&&e.choices&&e.choices.length>0),d=!o&&this.entryIndex>=this.entries.length-1&&(this.chosenChoice!==null||!e.closingBeats?.length||this.entries.length>e.beats.length),h=d?this.callbacks.continueButtonLabel??(e.kind==="STAGE_WALKOUT"||e.kind==="COLD_OPEN"?"STEP ON STAGE":e.kind==="ENDING"?"CLAIM CROWN":"CONTINUE"):"NEXT",S=t.speaker==="narrator"?"is-neutral":t.speaker==="max_sterling"?"is-listening":"is-speaking",E=t.speaker==="narrator"?"is-neutral":t.speaker==="max_sterling"?"is-speaking":"is-listening",B=n?`
        <div class="v5-actor-slot is-left ${S}">
          <img
            class="v5-actor-img"
            src="${l(f.challengers[n])}"
            alt="${l(x[n]?.displayName??"Challenger")}"
            draggable="false"
          />
        </div>
      `:t.speaker==="producer_sam"?`
        <div class="v5-actor-slot is-left is-speaking">
          <div class="v5-intercom-badge">
            ${O()}
            <span class="v5-intercom-caption">PRODUCER SAM · LIVE COMMS</span>
          </div>
        </div>
      `:"",u=t.speakerRole&&/(STAGE|BOARD TWIST|PODIUM|SABOTAGE|GRUDGE|ALLY|SPONSORS|OVERWORLD|LOADOUT|COMBO|CHAIN)/.test(t.speakerRole.toUpperCase())?t.speakerRole:"",V=/GRUDGE|SABOTAGE/.test(u.toUpperCase()),$=this.entries.map((c,p)=>`<span class="v5-beat-pip ${p<this.entryIndex?"is-done":p===this.entryIndex?"is-current":""}" aria-hidden="true"></span>`).join(""),A=this.outcomeBadges.length>0?`
          <div class="v5-consequence-strip" aria-live="polite">
            ${this.outcomeBadges.map(c=>`<span class="v5-consequence-tag ${/grudge|sabotage|tension|-\d+/i.test(c)?"is-grudge":""}">${l(c)}</span>`).join("")}
          </div>
        `:"",P=o&&e.choices?`
          <div class="v5-choice-deck" role="group" aria-label="Dialogue Choices">
            ${e.choices.slice(0,3).map((c,p)=>{const y=b(c.attitude),I=N(c);return`
                  <button
                    type="button"
                    class="v5-choice-blade ${y.variantClass}"
                    data-v5-choice-idx="${p}"
                    data-v5-attitude="${c.attitude}"
                  >
                    <span class="v5-choice-gem-wrap" aria-hidden="true">
                      ${U(c.attitude,p)}
                    </span>
                    <span class="v5-choice-bezel">
                      <span class="v5-choice-core">
                        <span class="v5-choice-label">${l(c.label)}</span>
                        <span class="v5-choice-subline">${l(I)}</span>
                      </span>
                    </span>
                  </button>
                `}).join("")}
          </div>
        `:"",T=o?"":`
        <div class="v5-speech-advance-row">
          <span class="v5-speech-tap-hint">${d?"Ready for curtain up":"Tap banner to continue"}</span>
          <button type="button" class="v5-speech-next-btn" data-v5-story-next>
            <span>${l(h)}</span>
            ${G()}
          </button>
        </div>
      `,v=typeof document<"u"&&!!document.fullscreenElement;this.rootEl.innerHTML=`
      <div class="v5-theater-backdrop-layer" aria-hidden="true">
        <img class="v5-theater-backdrop-img" src="${l(a)}" alt="" draggable="false" />
        <div class="v5-theater-vignette"></div>
      </div>

      <div class="v5-theater-shell">
        <header class="v5-theater-topbar">
          <div class="v5-theater-top-left">
            ${this.callbacks.allowSkip!==!1?`
                  <button type="button" class="v5-theater-brass-btn" data-v5-story-skip aria-label="Skip Scene">
                    ${M()}
                    <span>Skip</span>
                  </button>
                `:""}
            <div class="v5-beat-pips" aria-label="Scene progress ${this.entryIndex+1} of ${this.entries.length}">
              ${$}
            </div>
          </div>

          <div class="v5-theater-venue-crest">
            <div class="v5-venue-finial" aria-hidden="true">
              ${H()}
            </div>
            <div class="v5-venue-plaque">${l(e.locationSubhead||e.title)}</div>
          </div>

          <div class="v5-theater-top-right">
            <button
              type="button"
              class="v5-theater-brass-btn is-icon-only"
              data-v5-fullscreen-toggle
              aria-label="Toggle Fullscreen"
              aria-pressed="${v?"true":"false"}"
              title="${v?"Exit Fullscreen":"Enter Fullscreen"}"
            >
              ${k(v)}
            </button>
          </div>
        </header>

        <div class="v5-theater-stage">
          <div class="v5-theater-actors" aria-hidden="true">
            ${B}
            <div class="v5-actor-slot is-right ${E}">
              <img
                class="v5-actor-img"
                src="${l(r)}"
                alt="Host Max Sterling"
                draggable="false"
              />
            </div>
          </div>

          <div class="v5-theater-dialogue-col">
            ${A}

            <div class="v5-speech-wrap" data-v5-speech-banner>
              <div class="v5-speech-tail-mount ${s==="up-right"?"is-tail-right":""} ${s==="hidden"?"is-tail-hidden":""}">
                ${s!=="hidden"?C(s):""}
              </div>

              <div class="v5-speech-nameplate">
                <span class="v5-speech-speaker-name">${l(t.speakerName)}</span>
                ${u?`<span class="v5-speech-cue-tag ${V?"is-warning":""}">${l(u)}</span>`:""}
                <button
                  type="button"
                  class="v5-voice-wave-btn ${this.isPlayingVoice?"is-playing":""}"
                  data-v5-replay-voice
                  aria-label="Replay spoken dialogue"
                  title="Replay voice line"
                >
                  ${_()}
                </button>
              </div>

              <div class="v5-speech-brass-frame">
                <div class="v5-speech-mahogany-body">
                  <p class="v5-speech-text">${l(t.text)}</p>
                  ${T}
                </div>
              </div>
            </div>

            ${P}
          </div>
        </div>
      </div>
    `,this.bindRenderedDomEvents()}bindRenderedDomEvents(){if(!this.rootEl)return;this.rootEl.querySelector("[data-v5-fullscreen-toggle]")?.addEventListener("click",o=>{o.stopPropagation(),this.handleToggleFullscreen()}),this.rootEl.querySelector("[data-v5-story-skip]")?.addEventListener("click",o=>{o.stopPropagation(),this.handleSkip()}),this.rootEl.querySelector("[data-v5-replay-voice]")?.addEventListener("click",o=>{o.stopPropagation(),this.callbacks.voiceBridge?.playSfx?.("ui_tap"),this.playCurrentBeatVoice()}),this.rootEl.querySelector("[data-v5-story-next]")?.addEventListener("click",o=>{o.stopPropagation(),this.handleAdvance()}),this.rootEl.querySelector("[data-v5-speech-banner]")?.addEventListener("click",()=>{this.handleAdvance()}),this.rootEl.querySelectorAll("[data-v5-choice-idx]").forEach(o=>{o.addEventListener("click",d=>{d.stopPropagation();const h=Number(o.getAttribute("data-v5-choice-idx"));Number.isInteger(h)&&this.handleChoiceSelect(h)})})}}export{Z as VoicedStoryTheaterView,Y as createStoryTheaterVoiceBridge};
