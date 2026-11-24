import{a as U,V as w,W as A}from"./index-oAuefNbv.js";import"./systems-DSvNuDuC.js";const T="v5-spotlight-lozenge-styles",W=["A","B","C","D"],y=44,k=38.5,h=2*Math.PI*y,f=2*Math.PI*k;function l(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function p(o){return Math.round(o).toLocaleString("en-US")}function R(o,e,t){const s=o.trim().replace(/\s+/g," ");if(t)return{leftWing:s.toUpperCase(),rightWing:`${t.toUpperCase()} · ${e}`};const i=s.split(" ").filter(Boolean);if(i.length>=3){const a=Math.ceil(i.length*.6),r=i.slice(0,a).join(" ").toUpperCase(),n=i.slice(a).join(" ").toUpperCase();return{leftWing:r,rightWing:`${n} · ${e}`}}return{leftWing:s.toUpperCase()||"SPOTLIGHT ROUND",rightWing:e}}function te(o,e){return o.classList.add("v5sl-custom-gadget-slot"),e?(o.innerHTML="",e instanceof HTMLElement?(o.appendChild(e),null):e(o)??null):null}function N(o,e){const t=(h*.52).toFixed(2),s=(f*.44).toFixed(2);return`
    <svg class="v5sl-chrono-svg" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="v5slBrassOuter" x1="12%" y1="4%" x2="88%" y2="96%">
          <stop offset="0%" stop-color="#fff4c4"/>
          <stop offset="22%" stop-color="#dfb252"/>
          <stop offset="50%" stop-color="#7c5517"/>
          <stop offset="76%" stop-color="#e7be62"/>
          <stop offset="100%" stop-color="#603e0d"/>
        </linearGradient>
        <linearGradient id="v5slBrassInner" x1="85%" y1="10%" x2="15%" y2="92%">
          <stop offset="0%" stop-color="#6a4612"/>
          <stop offset="35%" stop-color="#f8dc8c"/>
          <stop offset="68%" stop-color="#a57624"/>
          <stop offset="100%" stop-color="#fff0b5"/>
        </linearGradient>
        <radialGradient id="v5slDialFace" cx="50%" cy="38%" r="64%">
          <stop offset="0%" stop-color="#143269"/>
          <stop offset="62%" stop-color="#09193c"/>
          <stop offset="100%" stop-color="#030a1b"/>
        </radialGradient>
        <linearGradient id="v5slArcAmber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff0a6"/>
          <stop offset="48%" stop-color="#f7b93e"/>
          <stop offset="100%" stop-color="#ea8415"/>
        </linearGradient>
        <linearGradient id="v5slArcCyan" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#33a8ff"/>
          <stop offset="55%" stop-color="#5ae4ff"/>
          <stop offset="100%" stop-color="#b8f7ff"/>
        </linearGradient>
      </defs>

      <!-- Sculpted Multi-Ring Brushed Brass Housing -->
      <circle cx="60" cy="60" r="57" fill="url(#v5slBrassOuter)" stroke="#382307" stroke-width="1.4"/>
      <circle cx="60" cy="60" r="52.5" fill="#18120a" stroke="url(#v5slBrassInner)" stroke-width="2.2"/>
      <circle cx="60" cy="60" r="49" fill="url(#v5slDialFace)"/>

      <!-- Recessed Precision Track Grooves -->
      <circle cx="60" cy="60" r="${y}" fill="none" stroke="rgba(255, 221, 138, 0.14)" stroke-width="4.2"/>
      <circle cx="60" cy="60" r="${k}" fill="none" stroke="rgba(88, 210, 255, 0.14)" stroke-width="3.4"/>

      <!-- Glowing Warm Amber Outer Progress Ring (surgical stroke-dashoffset) -->
      <circle
        class="v5sl-chrono-arc-amber"
        data-v5sl-arc-amber
        cx="60"
        cy="60"
        r="${y}"
        fill="none"
        stroke="url(#v5slArcAmber)"
        stroke-width="4.5"
        stroke-linecap="round"
        stroke-dasharray="${h.toFixed(2)}"
        stroke-dashoffset="${(h-Number(t)).toFixed(2)}"
        transform="rotate(-90 60 60)"
      />

      <!-- Glowing Neon Cyan Inner Complement Ring (surgical stroke-dashoffset) -->
      <circle
        class="v5sl-chrono-arc-cyan"
        data-v5sl-arc-cyan
        cx="60"
        cy="60"
        r="${k}"
        fill="none"
        stroke="url(#v5slArcCyan)"
        stroke-width="3.6"
        stroke-linecap="round"
        stroke-dasharray="${f.toFixed(2)}"
        stroke-dashoffset="${(f-Number(s)).toFixed(2)}"
        transform="rotate(95 60 60)"
      />

      <!-- Inner Delicate Gold Hairline Rim -->
      <circle cx="60" cy="60" r="33.2" fill="none" stroke="rgba(244, 207, 114, 0.34)" stroke-width="1"/>
    </svg>
    <div class="v5sl-chrono-center">
      <span class="v5sl-chrono-readout" data-v5sl-clock-readout>${l(o)}</span>
      <span class="v5sl-chrono-sub" data-v5sl-clock-sub>${l(e)}</span>
    </div>
  `}function _(o){return`
    <span class="v5sl-diamond-badge" aria-hidden="true">
      <svg class="v5sl-diamond-svg" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="v5slDiaRim_${o}" x1="12%" y1="6%" x2="88%" y2="94%">
            <stop offset="0%" stop-color="#fff5c8"/>
            <stop offset="35%" stop-color="#dfb14e"/>
            <stop offset="70%" stop-color="#8b5e17"/>
            <stop offset="100%" stop-color="#f2cd72"/>
          </linearGradient>
          <linearGradient id="v5slDiaFace_${o}" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stop-color="#fce59a"/>
            <stop offset="48%" stop-color="#d8a33a"/>
            <stop offset="100%" stop-color="#9e6d1c"/>
          </linearGradient>
        </defs>
        <!-- Outer Beveled Brass Diamond -->
        <polygon class="v5sl-dia-outer" points="32,2 62,32 32,62 2,32" fill="url(#v5slDiaRim_${o})" stroke="#382206" stroke-width="1.5" stroke-linejoin="round"/>
        <!-- Dark Recessed Trim Channel -->
        <polygon class="v5sl-dia-channel" points="32,7 57,32 32,57 7,32" fill="#1b1207"/>
        <!-- Inner Radiant Gold Face -->
        <polygon class="v5sl-dia-face" points="32,10.5 53.5,32 32,53.5 10.5,32" fill="url(#v5slDiaFace_${o})" stroke="#fff3c4" stroke-width="0.9"/>
      </svg>
      <span class="v5sl-diamond-letter">${o}</span>
    </span>
  `}function F(o){return`
    <svg class="v5sl-hex-svg" viewBox="0 0 400 62" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="v5slHexBrass_${o}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff2ba"/>
          <stop offset="28%" stop-color="#d8a53d"/>
          <stop offset="56%" stop-color="#7c5416"/>
          <stop offset="82%" stop-color="#ecc668"/>
          <stop offset="100%" stop-color="#9a6c1d"/>
        </linearGradient>
        <linearGradient id="v5slHexFill_${o}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#133378"/>
          <stop offset="46%" stop-color="#091d4c"/>
          <stop offset="100%" stop-color="#040d27"/>
        </linearGradient>
      </defs>
      <!-- Outer Brushed Brass Pointed Hexagon -->
      <polygon
        class="v5sl-hex-outer"
        points="20,2 380,2 398,31 380,60 20,60 2,31"
        fill="url(#v5slHexBrass_${o})"
      />
      <!-- Dark Recessed Inner Groove -->
      <polygon
        class="v5sl-hex-groove"
        points="21.5,4.8 378.5,4.8 394.5,31 378.5,57.2 21.5,57.2 5.5,31"
        fill="#0b1224"
      />
      <!-- Deep Sapphire Enameled Body + Inner Gold Hairline -->
      <polygon
        class="v5sl-hex-body"
        points="23,6.8 377,6.8 391.8,31 377,55.2 23,55.2 8.2,31"
        fill="url(#v5slHexFill_${o})"
        stroke="rgba(255, 224, 134, 0.55)"
        stroke-width="1.15"
      />
      <!-- Subtle Top Specular Sheen -->
      <line x1="28" y1="8.2" x2="372" y2="8.2" stroke="rgba(255, 248, 220, 0.34)" stroke-width="1"/>
    </svg>
  `}function q(o=20){return`
    <svg width="${o}" height="${o}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M9 18h6M10 21h4"/>
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.2 1.1 2.2h5c0-1 .4-1.7 1.1-2.2A6 6 0 0 0 12 3z" fill="currentColor" fill-opacity="0.18"/>
      <line x1="12" y1="7.5" x2="12" y2="11.5" stroke-width="1.6"/>
      <line x1="9.8" y1="9.6" x2="14.2" y2="9.6" stroke-width="1.6"/>
    </svg>
  `}function I(o){return`
    <svg class="v5sl-wax-seal-svg" viewBox="0 0 56 56" aria-hidden="true">
      <defs>
        <radialGradient id="v5slWaxGrad" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#e04352"/>
          <stop offset="55%" stop-color="#9e1928"/>
          <stop offset="100%" stop-color="#590914"/>
        </radialGradient>
      </defs>
      <path d="M28 3 C34 2, 41 5, 45 10 C50 14, 53 21, 52 28 C53 35, 49 42, 44 46 C39 51, 33 53, 27 52 C20 53, 13 50, 9 44 C4 39, 3 32, 4 26 C3 19, 7 12, 12 8 C17 4, 22 2, 28 3 Z" fill="url(#v5slWaxGrad)" stroke="#3a050c" stroke-width="1.6"/>
      <circle cx="28" cy="28" r="17.5" fill="none" stroke="rgba(255, 212, 148, 0.58)" stroke-width="1.4" stroke-dasharray="2.5 2"/>
      <text x="28" y="33" text-anchor="middle" fill="#ffe6b0" font-family="Cinzel, Georgia, serif" font-weight="800" font-size="14">${l(o)}</text>
    </svg>
  `}function j(){return`
    <svg class="v5sl-bulb-svg" viewBox="0 0 28 28" aria-hidden="true">
      <circle class="v5sl-bulb-ring" cx="14" cy="14" r="12.2" fill="#23190b" stroke="#c89a3b" stroke-width="1.6"/>
      <circle class="v5sl-bulb-glass" cx="14" cy="14" r="9" fill="#0d1b36"/>
      <ellipse cx="11.4" cy="10.8" rx="3" ry="1.8" transform="rotate(-28 11.4 10.8)" fill="rgba(255,255,255,0.28)"/>
      <polyline class="v5sl-bulb-check" points="9.5,14.2 12.8,17.4 19,10.8" fill="none" stroke="#1d1103" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
      <g class="v5sl-bulb-cross" stroke="#fff0f2" stroke-width="2.4" stroke-linecap="round">
        <line x1="10" y1="10" x2="18" y2="18"/>
        <line x1="18" y1="10" x2="10" y2="18"/>
      </g>
    </svg>
  `}function V(){return`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="6,4 20,12 6,20"/>
    </svg>
  `}function K(o=15){return`
    <svg width="${o}" height="${o}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 18h18l-1.5-10-4.5 4-3-6-3 6-4.5-4L3 18z" fill="currentColor" fill-opacity="0.28"/>
      <path d="M3 20.5h18"/>
    </svg>
  `}function Y(){return`
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3a7 7 0 0 0-7 7v4a3 3 0 0 0 3 3h1v-6H7"/>
      <path d="M12 3a7 7 0 0 1 7 7v4a3 3 0 0 1-3 3h-1v-6h2"/>
      <path d="M16 17v1a3 3 0 0 1-3 3h-2"/>
    </svg>
  `}function B(o=!1){return o?`
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="4 14 10 14 10 20"/>
        <polyline points="20 10 14 10 14 4"/>
        <line x1="14" y1="10" x2="21" y2="3"/>
        <line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
    `:`
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9"/>
      <polyline points="9 21 3 21 3 15"/>
      <line x1="21" y1="3" x2="14" y2="10"/>
      <line x1="3" y1="21" x2="10" y2="14"/>
    </svg>
  `}function X(){return`
    <svg class="v5sl-stage-podium-svg" viewBox="0 0 150 110" aria-hidden="true">
      <defs>
        <linearGradient id="v5slPodBrass" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f7da88"/>
          <stop offset="45%" stop-color="#c69130"/>
          <stop offset="100%" stop-color="#694511"/>
        </linearGradient>
        <linearGradient id="v5slPodBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2c1d13"/>
          <stop offset="55%" stop-color="#17121b"/>
          <stop offset="100%" stop-color="#0b0d18"/>
        </linearGradient>
      </defs>
      <!-- Angled Broadcast Podium Desk Top -->
      <polygon points="8,14 116,6 144,24 28,32" fill="url(#v5slPodBrass)" stroke="#3b2408" stroke-width="1.5"/>
      <polygon points="14,17 113,10 135,23 30,29" fill="#1b141a"/>
      <!-- Podium Pedestal -->
      <polygon points="30,32 130,25 120,108 42,108" fill="url(#v5slPodBody)" stroke="url(#v5slPodBrass)" stroke-width="1.6"/>
      <line x1="56" y1="30" x2="62" y2="108" stroke="rgba(244, 206, 114, 0.42)" stroke-width="2"/>
      <line x1="102" y1="27" x2="96" y2="108" stroke="rgba(244, 206, 114, 0.28)" stroke-width="1.5"/>
    </svg>
  `}function Z(){return`
    <svg class="v5sl-solo-silhouette" viewBox="0 0 120 170" aria-hidden="true">
      <defs>
        <linearGradient id="v5slSilRim" x1="0%" y1="0%" x2="100%" y2="85%">
          <stop offset="0%" stop-color="#75b6ff" stop-opacity="0.58"/>
          <stop offset="50%" stop-color="#192e57" stop-opacity="0.72"/>
          <stop offset="100%" stop-color="#081229" stop-opacity="0.88"/>
        </linearGradient>
      </defs>
      <circle cx="60" cy="40" r="22" fill="url(#v5slSilRim)" stroke="rgba(166, 212, 255, 0.42)" stroke-width="1.4"/>
      <path d="M22,168 L26,96 C27,76 42,66 60,66 C78,66 93,76 94,96 L98,168 Z" fill="url(#v5slSilRim)" stroke="rgba(244, 208, 118, 0.28)" stroke-width="1.2"/>
    </svg>
  `}function J(o,e){const t=Math.max(-85,Math.min(85,o)),i=(Math.max(-180,Math.min(180,e))+180)/360*600,a=(90-t)/180*300;return`
    <svg class="v5sl-map-svg" viewBox="0 0 600 300" role="img" aria-label="Broadcast world map showing target location beacon">
      <defs>
        <radialGradient id="v5slMapSea" cx="50%" cy="44%" r="68%">
          <stop offset="0%" stop-color="#163b72"/>
          <stop offset="65%" stop-color="#0a2044"/>
          <stop offset="100%" stop-color="#040e24"/>
        </radialGradient>
        <linearGradient id="v5slLandFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2c678d"/>
          <stop offset="100%" stop-color="#1a4166"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="600" height="300" fill="url(#v5slMapSea)"/>
      <!-- Brass Navigation Graticule -->
      <g stroke="rgba(148, 198, 255, 0.16)" stroke-width="0.9">
        <line x1="0" y1="75" x2="600" y2="75"/>
        <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(247, 202, 92, 0.34)" stroke-dasharray="5 4"/>
        <line x1="0" y1="225" x2="600" y2="225"/>
        <line x1="100" y1="0" x2="100" y2="300"/>
        <line x1="200" y1="0" x2="200" y2="300"/>
        <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(247, 202, 92, 0.3)" stroke-dasharray="5 4"/>
        <line x1="400" y1="0" x2="400" y2="300"/>
        <line x1="500" y1="0" x2="500" y2="300"/>
      </g>
      <!-- Continents -->
      <g fill="url(#v5slLandFill)" stroke="#72b7ee" stroke-width="1.2" stroke-linejoin="round">
        <path d="M52 54 L94 42 L152 46 L184 70 L176 92 L156 105 L146 128 L134 134 L126 122 L106 112 L88 94 L66 78 Z"/>
        <path d="M210 24 L244 22 L252 44 L228 56 L210 42 Z"/>
        <path d="M168 144 L196 150 L224 176 L214 206 L194 246 L180 260 L174 236 L166 196 L158 164 Z"/>
        <path d="M276 54 L318 46 L354 54 L360 76 L338 88 L308 86 L284 94 L274 78 Z"/>
        <path d="M274 108 L314 102 L352 114 L374 146 L362 184 L344 226 L320 232 L304 196 L296 164 L268 144 Z"/>
        <path d="M356 48 L434 40 L512 52 L538 72 L514 96 L494 118 L466 144 L436 148 L412 126 L388 134 L362 110 L352 84 Z"/>
        <path d="M524 84 L536 92 L528 106 L518 98 Z"/>
        <path d="M474 156 L504 162 L512 172 L476 168 Z"/>
        <path d="M478 192 L524 186 L544 210 L534 236 L492 234 L474 214 Z"/>
        <path d="M560 228 L572 242 L564 252 L554 238 Z"/>
      </g>
      <!-- Illuminated Crosshair -->
      <line x1="${i.toFixed(1)}" y1="0" x2="${i.toFixed(1)}" y2="300" stroke="rgba(255, 224, 130, 0.45)" stroke-width="1.1" stroke-dasharray="4 4"/>
      <line x1="0" y1="${a.toFixed(1)}" x2="600" y2="${a.toFixed(1)}" stroke="rgba(255, 224, 130, 0.45)" stroke-width="1.1" stroke-dasharray="4 4"/>
      <!-- Pulsing Target Beacon -->
      <circle class="v5sl-map-pulse" cx="${i.toFixed(1)}" cy="${a.toFixed(1)}" r="15" fill="none" stroke="#ffe082" stroke-width="2.2"/>
      <circle cx="${i.toFixed(1)}" cy="${a.toFixed(1)}" r="10.5" fill="rgba(255, 210, 88, 0.26)" stroke="#ffe599" stroke-width="1.8"/>
      <circle cx="${i.toFixed(1)}" cy="${a.toFixed(1)}" r="4.8" fill="#ff4c63" stroke="#ffffff" stroke-width="1.8"/>
    </svg>
  `}function O(){if(typeof document>"u"||document.getElementById(T))return;const o=document.createElement("style");o.id=T,o.textContent=`
/* ============================================================================
   WORLD'S SMARTEST v5.0 — SpotlightLozengeRendererV5 Scoped Styles
   ============================================================================ */

.v5sl-stage {
  position: relative;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow-x: clip;
  overflow-y: visible;
  color: #fff8e6;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: radial-gradient(ellipse 90% 60% at 50% 18%, #0e285f 0%, #061332 54%, #030816 100%);
  isolation: isolate;
  box-sizing: border-box;
}

.v5sl-stage *,
.v5sl-stage *::before,
.v5sl-stage *::after {
  box-sizing: border-box;
}

/* --- LAYER 0: PAINTED VENUE STAGE & VOLUMETRIC SPOTLIGHTS --- */

.v5sl-backdrop-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.v5sl-venue-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 34%;
  opacity: 0.44;
  filter: saturate(1.08) contrast(1.06) brightness(0.86);
}

.v5sl-spotlight-cones {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 52% 48% at 50% 8%, rgba(124, 198, 255, 0.34) 0%, rgba(42, 108, 224, 0.16) 44%, transparent 74%),
    conic-gradient(from 164deg at 50% -4%, transparent 0deg, rgba(160, 214, 255, 0.22) 10deg, rgba(255, 226, 150, 0.08) 18deg, rgba(160, 214, 255, 0.20) 26deg, transparent 36deg),
    linear-gradient(180deg, rgba(3, 9, 24, 0.52) 0%, rgba(4, 12, 32, 0.18) 38%, rgba(3, 10, 28, 0.64) 76%, rgba(2, 6, 16, 0.90) 100%);
}

/* Curved Golden Stage Truss Ribs (matching mockup_v5_question_classic background architecture) */
.v5sl-stage-arches {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 46% 78% at 50% 54%, transparent 56%, rgba(218, 166, 68, 0.19) 59%, rgba(218, 166, 68, 0.05) 64%, transparent 70%),
    radial-gradient(ellipse 84% 26% at 50% 78%, rgba(25, 84, 186, 0.26) 0%, rgba(232, 180, 74, 0.12) 48%, transparent 72%);
}

/* --- LAYER 1: SUBTLE WAIST-UP STAGE ACTORS (MAX LEFT, CHALLENGER RIGHT) --- */

.v5sl-actors-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  overflow: hidden;
}

.v5sl-actor-host {
  position: absolute;
  left: -8px;
  bottom: 86px;
  width: clamp(92px, 24vw, 148px);
  height: auto;
  max-height: 36%;
  object-fit: contain;
  object-position: bottom center;
  opacity: 0.72;
  filter: drop-shadow(0 0 18px rgba(88, 168, 255, 0.3)) brightness(0.92);
  mask-image: linear-gradient(180deg, #000 0%, #000 72%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 72%, transparent 100%);
  transition: opacity 0.28s ease, transform 0.35s ease;
}

.v5sl-actor-challenger-wrap {
  position: absolute;
  right: -8px;
  bottom: 84px;
  width: clamp(94px, 25vw, 152px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  opacity: 0.72;
}

.v5sl-actor-challenger-img,
.v5sl-solo-silhouette {
  width: 82%;
  height: auto;
  max-height: 220px;
  object-fit: contain;
  filter: drop-shadow(0 0 18px rgba(102, 174, 255, 0.28)) brightness(0.9);
  margin-bottom: -24px;
  mask-image: linear-gradient(180deg, #000 0%, #000 78%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 78%, transparent 100%);
}

.v5sl-stage-podium-svg {
  width: 96%;
  height: auto;
  display: block;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
}

@media (min-width: 820px) {
  .v5sl-actor-host {
    left: clamp(8px, 2.2vw, 42px);
    bottom: 204px;
    width: clamp(150px, 15vw, 208px);
    max-height: 48%;
    opacity: 0.88;
  }
  .v5sl-actor-challenger-wrap {
    right: clamp(8px, 2.2vw, 42px);
    bottom: 132px;
    width: clamp(156px, 15.6vw, 218px);
    opacity: 0.88;
  }
}

/* 1-Tap Tactile Brass Fullscreen Toggle (Top-Right Stage Corner) */
.v5sl-fullscreen-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 9;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1.5px solid #e6ba58;
  background: linear-gradient(180deg, #271a09 0%, #140c03 100%);
  color: #fce296;
  clip-path: polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.75);
  transition: transform 0.14s ease, border-color 0.18s ease, color 0.18s ease;
}

.v5sl-fullscreen-btn:hover {
  transform: scale(1.06);
  border-color: #fff2ba;
  color: #ffffff;
}

/* --- LAYER 2: TOP SCULPTED BRASS CHRONOMETER & WINGED CATEGORY RIBBON --- */

.v5sl-top-ribbon {
  position: relative;
  z-index: 6;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0 4px;
  flex-shrink: 0;
}

/* Glowing Edge-to-Edge Brass Horizon Wire Behind Wings */
.v5sl-top-wire {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, rgba(255, 224, 130, 0.55) 0%, #fff4c6 20%, #f5ba42 50%, #fff4c6 80%, rgba(255, 224, 130, 0.55) 100%);
  box-shadow: 0 0 10px rgba(255, 204, 84, 0.85), 0 0 22px rgba(242, 166, 36, 0.45);
  pointer-events: none;
  z-index: 0;
}

.v5sl-ribbon-inner {
  position: relative;
  z-index: 1;
  width: min(calc(100% - 16px), 840px);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.v5sl-wing {
  position: relative;
  min-width: 0;
  min-height: 36px;
  display: flex;
  align-items: center;
  padding: 6px 14px;
  background: linear-gradient(180deg, #fae297 0%, #d8a642 46%, #ae7a1e 85%, #d6a543 100%);
  color: #1f1304;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(10.5px, 2.5vw, 13.5px);
  letter-spacing: 0.055em;
  text-transform: uppercase;
  line-height: 1.12;
  text-shadow: 0 1px 0 rgba(255, 246, 208, 0.55);
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.65));
}

.v5sl-wing::after {
  content: '';
  position: absolute;
  inset: 2.5px;
  border: 1.2px solid rgba(255, 248, 214, 0.65);
  pointer-events: none;
}

.v5sl-wing-left {
  justify-content: flex-end;
  text-align: right;
  padding-left: 20px;
  padding-right: 16px;
  margin-right: -12px;
  clip-path: polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%);
}

.v5sl-wing-left::after {
  clip-path: polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%);
}

.v5sl-wing-right {
  justify-content: flex-start;
  text-align: left;
  padding-left: 16px;
  padding-right: 20px;
  margin-left: -12px;
  clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%);
}

.v5sl-wing-right::after {
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%);
}

.v5sl-wing-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Center Multi-Ring Brushed-Brass Chronometer */
.v5sl-chronometer {
  position: relative;
  z-index: 3;
  width: 94px;
  height: 94px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 8px 18px rgba(0, 0, 0, 0.8));
}

@media (min-width: 820px) {
  .v5sl-chronometer {
    width: 108px;
    height: 108px;
  }
  .v5sl-wing {
    min-height: 40px;
    padding-top: 7px;
    padding-bottom: 7px;
  }
}

.v5sl-chrono-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.v5sl-chrono-arc-amber {
  transition: stroke-dashoffset 0.14s linear;
  filter: drop-shadow(0 0 4px rgba(255, 198, 72, 0.85));
}

.v5sl-chrono-arc-cyan {
  transition: stroke-dashoffset 0.14s linear;
  filter: drop-shadow(0 0 5px rgba(72, 214, 255, 0.9));
}

.v5sl-chrono-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.v5sl-chrono-readout {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(24px, 5vw, 31px);
  line-height: 1;
  letter-spacing: -0.03em;
  color: #fff6dc;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 224, 138, 0.35);
}

.v5sl-chrono-sub {
  margin-top: 2px;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8ad8ff;
  line-height: 1;
}

.v5sl-chrono-sub:empty {
  display: none;
}

/* Chronometer Dynamic States (mutated via dataset.phase only!) */
.v5sl-chronometer[data-phase="READ_IN"] .v5sl-chrono-arc-amber,
.v5sl-chronometer[data-phase="READ_IN"] .v5sl-chrono-arc-cyan {
  animation: v5slReadShimmer 1.3s ease-in-out infinite;
}
.v5sl-chronometer[data-phase="READ_IN"] .v5sl-chrono-sub {
  color: #ffe28c;
}

.v5sl-chronometer[data-phase="RELAXED"] .v5sl-chrono-readout {
  font-size: clamp(30px, 6vw, 38px);
  color: #9ceeff;
}
.v5sl-chronometer[data-phase="RELAXED"] .v5sl-chrono-sub {
  color: #9ceeff;
}

.v5sl-chronometer[data-phase="LOCKED"] .v5sl-chrono-arc-amber,
.v5sl-chronometer[data-phase="LOCKED"] .v5sl-chrono-arc-cyan {
  stroke: #ffa629;
}
.v5sl-chronometer[data-phase="LOCKED"] .v5sl-chrono-sub {
  color: #ffbd59;
}

.v5sl-chronometer[data-phase="URGENT"] {
  animation: v5slUrgentBeat 0.65s ease-in-out infinite;
}
.v5sl-chronometer[data-phase="URGENT"] .v5sl-chrono-arc-amber,
.v5sl-chronometer[data-phase="URGENT"] .v5sl-chrono-arc-cyan {
  stroke: #ff425b;
  filter: drop-shadow(0 0 7px rgba(255, 66, 91, 0.95));
}
.v5sl-chronometer[data-phase="URGENT"] .v5sl-chrono-readout,
.v5sl-chronometer[data-phase="URGENT"] .v5sl-chrono-sub {
  color: #ff7e8e;
}

@keyframes v5slReadShimmer {
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
}

@keyframes v5slUrgentBeat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.045); }
}

/* --- LAYER 3: MAIN SPOTLIGHT STAGE BODY (PROMPT + FORMAT BODY) --- */

.v5sl-stage-main {
  position: relative;
  z-index: 4;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 2px 0 8px;
  gap: clamp(8px, 1.5vh, 14px);
}

/* FRAMELESS SPOTLIGHT PROMPT TYPOGRAPHY (ZERO BOXES OR BORDERS!) */
.v5sl-prompt-zone {
  width: min(calc(100% - 28px), 780px);
  text-align: center;
  padding: clamp(4px, 1.2vh, 12px) clamp(8px, 2vw, 20px) 2px;
  background: transparent;
  border: none;
  box-shadow: none;
}

.v5sl-prompt-heading {
  margin: 0 auto;
  max-width: 24ch;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 800;
  font-size: clamp(22px, 3.6vw, 34px);
  line-height: 1.18;
  letter-spacing: -0.018em;
  color: #fff6dc;
  text-wrap: balance;
  text-shadow:
    0 3px 18px rgba(2, 6, 18, 0.96),
    0 1px 4px rgba(0, 0, 0, 0.92),
    0 0 28px rgba(105, 174, 255, 0.24);
}

@media (min-width: 820px) {
  .v5sl-prompt-heading {
    max-width: 30ch;
  }
}

.v5sl-format-subcue {
  margin: 6px auto 0;
  font-size: clamp(11.5px, 1.8vw, 13.5px);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #f6d57f;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.95);
}

/* Optional Diegetic Coach Whisper Ribbon (Story Cold-Open Teaching Cue) */
.v5sl-coach-whisper {
  margin: 8px auto 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: min(100%, 560px);
  padding: 5px 16px;
  background: linear-gradient(90deg, rgba(44, 21, 12, 0.92) 0%, rgba(64, 33, 16, 0.96) 50%, rgba(44, 21, 12, 0.92) 100%);
  border-top: 1.5px solid #e6ba58;
  border-bottom: 1.5px solid #9c6e1f;
  clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%);
  color: #ffefc4;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.25;
  text-align: left;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.72));
}

.v5sl-coach-whisper[hidden] {
  display: none;
}

.v5sl-coach-whisper-icon {
  color: #f8cf6c;
  flex-shrink: 0;
  display: inline-flex;
}

/* Diegetic Producer Clue Slip (Unfurls on CLUE coin tap) */
.v5sl-clue-slip {
  display: none;
  margin: 8px auto 0;
  max-width: min(100%, 600px);
  padding: 7px 14px;
  background: linear-gradient(180deg, #271a0e 0%, #191008 100%);
  border: 1.5px solid #dfae4b;
  clip-path: polygon(9px 0, calc(100% - 9px) 0, 100% 9px, 100% calc(100% - 9px), calc(100% - 9px) 100%, 9px 100%, 0 calc(100% - 9px), 0 9px);
  color: #fff3cf;
  font-size: clamp(12.5px, 2vw, 14.5px);
  font-weight: 600;
  line-height: 1.28;
  text-align: left;
  align-items: center;
  justify-content: center;
  gap: 8px;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.75));
}

.v5sl-clue-slip.is-open {
  display: inline-flex;
  animation: v5slSlipIn 0.25s ease-out;
}

.v5sl-clue-slip-tag {
  color: #ffd772;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}

@keyframes v5slSlipIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* --- FORMAT MOUNT BODY CONTAINER --- */

.v5sl-format-body {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.v5sl-custom-gadget-slot {
  width: min(calc(100% - 20px), 820px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ============================================================================
   FORMAT 1: POINTED HEXAGONAL BRASS-AND-SAPPHIRE LIGHT-BEAM LOZENGES
   ============================================================================ */

.v5sl-lozenge-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 11px;
  overflow-x: clip;
}

@media (max-width: 819px) {
  .v5sl-lozenge-stack.is-pairable .v5sl-lozenge-row > .v5sl-light-wire {
    display: none;
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn::before {
    content: '';
    position: absolute;
    left: -50vw;
    right: -50vw;
    top: 50%;
    height: 3px;
    transform: translateY(-50%);
    z-index: -1;
    pointer-events: none;
    background: linear-gradient(90deg, #ffdd7e 0%, #fff8dc 25%, #f5b93d 50%, #fff8dc 75%, #ffdd7e 100%);
    box-shadow: 0 0 10px rgba(255, 200, 74, 0.9), 0 0 22px rgba(242, 160, 28, 0.52);
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn.is-locked::before {
    background: linear-gradient(90deg, #ff9918 0%, #fff0a8 50%, #ff9918 100%);
    box-shadow: 0 0 14px rgba(255, 156, 24, 0.98);
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn.is-correct::before {
    background: linear-gradient(90deg, #2be89a 0%, #d4ffea 50%, #2be89a 100%);
    box-shadow: 0 0 16px rgba(46, 232, 154, 0.98);
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn.is-wrong::before {
    background: linear-gradient(90deg, #ff4b64 0%, #ffc2cb 50%, #ff4b64 100%);
    box-shadow: 0 0 12px rgba(255, 75, 100, 0.92);
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-hex-btn.is-eliminated::before {
    opacity: 0.2;
  }
}

.v5sl-lozenge-row {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
}

/* Edge-to-Edge Horizontal Stage Light Wire */
.v5sl-light-wire {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 3px;
  transform: translateY(-50%);
  background: linear-gradient(90deg, #ffdd7e 0%, #fff8dc 25%, #f5b93d 50%, #fff8dc 75%, #ffdd7e 100%);
  box-shadow: 0 0 10px rgba(255, 200, 74, 0.9), 0 0 24px rgba(242, 160, 28, 0.52);
  pointer-events: none;
  z-index: 0;
  transition: background 0.2s ease, box-shadow 0.2s ease, opacity 0.25s ease;
}

.v5sl-lozenge-pair-wrap {
  position: relative;
  z-index: 1;
  width: min(100%, 440px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 11px;
}

/* On widescreen desktop (820px+), pair A+B and C+D onto two sweeping WWTBAM stage wire rows */
@media (min-width: 820px) {
  .v5sl-lozenge-stack.is-pairable {
    gap: 16px;
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-lozenge-pair-wrap {
    width: min(calc(100% - 40px), 860px);
    grid-template-columns: 1fr 1fr;
    gap: 28px;
  }
}

.v5sl-hex-btn {
  position: relative;
  width: 100%;
  min-height: 58px;
  padding: 10px 26px 10px 66px;
  margin: 0;
  border: none;
  background: transparent;
  color: #fffaf0;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(16px, 2.5vw, 21px);
  line-height: 1.22;
  text-align: left;
  display: flex;
  align-items: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.14s ease, filter 0.18s ease, opacity 0.24s ease;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.72));
}

.v5sl-hex-btn:hover:not(:disabled),
.v5sl-hex-btn:focus-visible:not(:disabled) {
  transform: scale(1.018);
  filter: drop-shadow(0 0 16px rgba(255, 212, 102, 0.72)) drop-shadow(0 8px 18px rgba(0, 0, 0, 0.76));
  outline: none;
}

.v5sl-hex-btn:active:not(:disabled) {
  transform: scale(0.985);
}

.v5sl-hex-svg {
  position: absolute;
  inset: 0 0 0 18px;
  width: calc(100% - 18px);
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.v5sl-diamond-badge {
  position: absolute;
  left: 0;
  top: 50%;
  width: 58px;
  height: 58px;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.78));
}

.v5sl-diamond-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.v5sl-diamond-letter {
  position: absolute;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 900;
  font-size: 23px;
  line-height: 1;
  color: #1f1305;
  text-shadow: 0 1px 0 rgba(255, 245, 200, 0.7);
}

.v5sl-hex-text {
  position: relative;
  z-index: 2;
  color: #fffaf0;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.88);
  word-break: break-word;
}

/* --- LOZENGE STATE CHOREOGRAPHY (WWTBAM ORANGE LOCK -> EMERALD REVEAL) --- */

.v5sl-hex-btn.is-locked {
  transform: scale(1.024);
  filter: drop-shadow(0 0 22px rgba(255, 162, 24, 0.92));
  animation: v5slOrangeLockPulse 0.42s ease-in-out infinite;
}
.v5sl-hex-btn.is-locked .v5sl-hex-body {
  fill: #cc6d09;
  stroke: #ffe699;
  stroke-width: 1.8;
}
.v5sl-hex-btn.is-locked .v5sl-dia-face {
  fill: #ffbe42;
}
.v5sl-hex-btn.is-locked .v5sl-hex-text {
  color: #ffffff;
}

.v5sl-hex-btn.is-correct {
  transform: scale(1.022);
  filter: drop-shadow(0 0 24px rgba(46, 232, 154, 0.92));
}
.v5sl-hex-btn.is-correct .v5sl-hex-body {
  fill: #0d7a4f;
  stroke: #8affcc;
  stroke-width: 2;
}
.v5sl-hex-btn.is-correct .v5sl-dia-face {
  fill: #45e8a3;
}
.v5sl-hex-btn.is-correct .v5sl-hex-text {
  color: #ffffff;
}

.v5sl-hex-btn.is-wrong {
  animation: v5slWrongShake 0.36s ease;
  filter: drop-shadow(0 0 18px rgba(255, 68, 96, 0.82));
}
.v5sl-hex-btn.is-wrong .v5sl-hex-body {
  fill: #8c172b;
  stroke: #ff94a4;
  stroke-width: 1.8;
}
.v5sl-hex-btn.is-wrong .v5sl-dia-face {
  fill: #ff7086;
}

.v5sl-hex-btn.is-eliminated {
  opacity: 0.25;
  pointer-events: none;
  filter: grayscale(0.55);
}
.v5sl-hex-btn.is-eliminated .v5sl-hex-text {
  text-decoration: line-through;
}

.v5sl-hex-btn.is-dim-after {
  opacity: 0.56;
}

/* Wire reactions per row state */
.v5sl-lozenge-row.has-locked .v5sl-light-wire {
  background: linear-gradient(90deg, #ff9918 0%, #fff0a8 50%, #ff9918 100%);
  box-shadow: 0 0 14px rgba(255, 156, 24, 0.98), 0 0 28px rgba(255, 128, 0, 0.72);
}
.v5sl-lozenge-row.has-correct .v5sl-light-wire {
  background: linear-gradient(90deg, #2be89a 0%, #d4ffea 50%, #2be89a 100%);
  box-shadow: 0 0 16px rgba(46, 232, 154, 0.98), 0 0 30px rgba(24, 200, 126, 0.72);
}
.v5sl-lozenge-row.has-wrong .v5sl-light-wire {
  background: linear-gradient(90deg, #ff4b64 0%, #ffc2cb 50%, #ff4b64 100%);
  box-shadow: 0 0 12px rgba(255, 75, 100, 0.92);
}
.v5sl-lozenge-row.all-eliminated .v5sl-light-wire {
  opacity: 0.22;
}

@keyframes v5slOrangeLockPulse {
  0%, 100% { filter: drop-shadow(0 0 16px rgba(255, 158, 22, 0.85)); }
  50% { filter: drop-shadow(0 0 28px rgba(255, 210, 92, 1)); }
}

@keyframes v5slWrongShake {
  0%, 100% { transform: translateX(0); }
  22% { transform: translateX(-6px); }
  48% { transform: translateX(5px); }
  74% { transform: translateX(-3px); }
}

/* ============================================================================
   FORMAT 2: CLUE_ESCALATOR (3 WAX-SEALED BRASS ENVELOPES + BREAK NEXT SEAL)
   ============================================================================ */

.v5sl-escalator-wrap {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.v5sl-envelopes-bar {
  width: min(calc(100% - 24px), 840px);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

@media (max-width: 640px) {
  .v5sl-envelopes-bar {
    grid-template-columns: 1fr;
    gap: 6px;
  }
}

.v5sl-envelope {
  position: relative;
  min-height: 62px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 2px solid #cfa042;
  background: linear-gradient(165deg, #3c171c 0%, #240c10 60%, #19070a 100%);
  clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px);
  box-shadow: inset 0 1px 0 rgba(255, 232, 166, 0.34), 0 6px 14px rgba(0, 0, 0, 0.65);
  transition: transform 0.16s ease, border-color 0.2s ease, background 0.25s ease;
}

.v5sl-envelope.is-open {
  background: linear-gradient(170deg, #fdf3d8 0%, #efe0b4 100%);
  border-color: #e4b856;
  color: #1f1407;
}

.v5sl-envelope.is-sealed {
  cursor: pointer;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 12px;
}

.v5sl-envelope.is-sealed:hover:not([aria-disabled="true"]) {
  transform: translateY(-2px);
  border-color: #ffe28e;
}

.v5sl-env-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-bottom: 3px;
}

.v5sl-env-kicker {
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #7c4d12;
}

.v5sl-env-mult {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 11px;
  font-weight: 800;
  padding: 1px 7px;
  background: linear-gradient(180deg, #3a2308 0%, #1e1103 100%);
  color: #ffe28c;
  border: 1px solid #d4a13c;
}

.v5sl-env-text {
  font-size: clamp(12.5px, 1.8vw, 14px);
  font-weight: 700;
  line-height: 1.28;
  color: #1c1205;
}

.v5sl-env-sealed-label {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.v5sl-env-sealed-title {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #fce29a;
}

.v5sl-env-sealed-sub {
  font-size: 10.5px;
  font-weight: 600;
  color: #d9b59e;
}

.v5sl-wax-seal-svg {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.72));
}

/* Tactile Brass Letter-Opener Button */
.v5sl-seal-opener-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 7px 22px;
  border: 2px solid #ffe49c;
  background: linear-gradient(180deg, #f3cd6e 0%, #c6902c 52%, #8e5f14 100%);
  color: #1c1003;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 12.5px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  clip-path: polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%);
  cursor: pointer;
  filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.7));
  transition: transform 0.14s ease, filter 0.18s ease, opacity 0.2s ease;
}

.v5sl-seal-opener-btn:hover:not(:disabled) {
  transform: scale(1.03);
  filter: drop-shadow(0 0 14px rgba(255, 212, 98, 0.85));
}

.v5sl-seal-opener-btn:disabled {
  opacity: 0.42;
  cursor: default;
  filter: grayscale(0.45);
}

/* ============================================================================
   FORMAT 3: MULTI_STRIKE (6 ILLUMINATED BRASS TARGET PLAQUES + LOCK PLUNGER)
   ============================================================================ */

.v5sl-strike-wrap {
  width: min(calc(100% - 24px), 840px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.v5sl-strike-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 9px;
}

@media (min-width: 720px) {
  .v5sl-strike-grid.is-six {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

.v5sl-strike-plaque {
  position: relative;
  min-height: 58px;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid #c59537;
  background: linear-gradient(175deg, #132e68 0%, #091a42 58%, #040d24 100%);
  clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
  color: #fff8e8;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(13.5px, 2.2vw, 17px);
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  box-shadow: inset 0 1px 0 rgba(255, 232, 168, 0.3), 0 5px 12px rgba(0, 0, 0, 0.7);
  transition: transform 0.14s ease, border-color 0.18s ease, background 0.2s ease, filter 0.18s ease;
}

.v5sl-strike-plaque:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: #ffe396;
}

.v5sl-bulb-svg {
  width: 26px;
  height: 26px;
  flex-shrink: 0;
}

.v5sl-bulb-check,
.v5sl-bulb-cross {
  opacity: 0;
  transition: opacity 0.16s ease;
}

.v5sl-strike-plaque.is-selected {
  border-color: #ffe58f;
  background: linear-gradient(175deg, #3c2a0b 0%, #261805 65%, #160e03 100%);
  filter: drop-shadow(0 0 12px rgba(255, 196, 62, 0.6));
}
.v5sl-strike-plaque.is-selected .v5sl-bulb-glass {
  fill: #ffbe3b;
}
.v5sl-strike-plaque.is-selected .v5sl-bulb-check {
  opacity: 1;
}

.v5sl-strike-plaque.is-hit {
  border-color: #6df7bd;
  background: linear-gradient(175deg, #106342 0%, #093b27 100%);
  filter: drop-shadow(0 0 14px rgba(46, 232, 154, 0.72));
}
.v5sl-strike-plaque.is-hit .v5sl-bulb-glass {
  fill: #4bf5ae;
}
.v5sl-strike-plaque.is-hit .v5sl-bulb-check {
  opacity: 1;
}

.v5sl-strike-plaque.is-missed-target {
  border-color: #f6c959;
  background: linear-gradient(175deg, #2e240c 0%, #1c1406 100%);
}
.v5sl-strike-plaque.is-missed-target .v5sl-bulb-glass {
  fill: #e8b038;
}
.v5sl-strike-plaque.is-missed-target .v5sl-bulb-check {
  opacity: 1;
}

.v5sl-strike-plaque.is-wrong-pick {
  border-color: #ff7e92;
  background: linear-gradient(175deg, #6e1525 0%, #3d0a14 100%);
}
.v5sl-strike-plaque.is-wrong-pick .v5sl-bulb-glass {
  fill: #ff4762;
}
.v5sl-strike-plaque.is-wrong-pick .v5sl-bulb-cross {
  opacity: 1;
}

.v5sl-strike-footer {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-top: 2px;
}

.v5sl-strike-counter {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #fce296;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.9);
}

/* Sculpted Gold Plunger Lever */
.v5sl-gold-plunger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  padding: 9px 26px;
  border: 2px solid #fff2ba;
  background: linear-gradient(180deg, #fbe296 0%, #d8a238 48%, #9b6914 96%);
  color: #1f1203;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: clamp(13.5px, 2.2vw, 16px);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 14px 100%, 0 50%);
  cursor: pointer;
  filter: drop-shadow(0 5px 12px rgba(0, 0, 0, 0.78));
  transition: transform 0.14s ease, filter 0.18s ease, opacity 0.2s ease;
}

.v5sl-gold-plunger:hover:not(:disabled) {
  transform: scale(1.035);
  filter: drop-shadow(0 0 18px rgba(255, 214, 102, 0.92));
}

.v5sl-gold-plunger:active:not(:disabled) {
  transform: scale(0.97);
}

.v5sl-gold-plunger:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  filter: grayscale(0.45);
}

/* ============================================================================
   FORMAT 4: VISUAL_SPOTTER (ORNATE RIVETED BRASS STAGE MONITOR + 4 LOZENGES)
   ============================================================================ */

.v5sl-visual-layout {
  width: min(calc(100% - 20px), 960px);
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  align-items: center;
}

@media (min-width: 820px) {
  .v5sl-visual-layout {
    grid-template-columns: minmax(300px, 1.05fr) minmax(320px, 1fr);
    gap: 20px;
  }
}

.v5sl-brass-monitor {
  position: relative;
  margin: 0;
  padding: 10px;
  background: linear-gradient(145deg, #e7bf62 0%, #9b6c1c 35%, #5c3b0c 68%, #d6a43e 100%);
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
  box-shadow: inset 0 2px 1px rgba(255, 246, 204, 0.6), 0 10px 24px rgba(0, 0, 0, 0.8);
}

.v5sl-monitor-rivet {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff4c6, #8f6015 70%, #3a2305 100%);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.85);
  z-index: 3;
}
.v5sl-monitor-rivet.r-tl { top: 6px; left: 10px; }
.v5sl-monitor-rivet.r-tr { top: 6px; right: 10px; }
.v5sl-monitor-rivet.r-bl { bottom: 6px; left: 10px; }
.v5sl-monitor-rivet.r-br { bottom: 6px; right: 10px; }

.v5sl-monitor-screen {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  max-height: 175px;
  overflow: hidden;
  border: 2px solid #2b1a07;
  background: radial-gradient(ellipse at center, #0d2042 0%, #050d1e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 18px rgba(0, 0, 0, 0.75);
}

@media (min-width: 820px) {
  .v5sl-monitor-screen {
    max-height: 260px;
  }
}

.v5sl-brass-monitor.is-map .v5sl-monitor-screen {
  background: #06132b;
}

.v5sl-monitor-screen img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 2px;
}

.v5sl-map-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.v5sl-map-pulse {
  transform-box: fill-box;
  transform-origin: center;
  animation: v5slMapBeacon 1.6s ease-out infinite;
}

@keyframes v5slMapBeacon {
  0% { opacity: 0.95; transform: scale(0.75); }
  100% { opacity: 0; transform: scale(1.8); }
}

.v5sl-monitor-plate {
  margin-top: 6px;
  padding: 3px 10px;
  background: linear-gradient(180deg, #271808 0%, #160c03 100%);
  border: 1px solid rgba(255, 224, 134, 0.5);
  color: #fce29a;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: center;
}

.v5sl-visual-choices {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.v5sl-visual-choices .v5sl-lozenge-row {
  padding: 0;
}

.v5sl-visual-choices .v5sl-lozenge-pair-wrap {
  width: 100%;
}

.v5sl-visual-choices .v5sl-hex-btn {
  min-height: 50px;
  padding-top: 7px;
  padding-bottom: 7px;
  font-size: clamp(15px, 2.2vw, 18.5px);
}

.v5sl-visual-choices .v5sl-diamond-badge {
  width: 50px;
  height: 50px;
}

.v5sl-visual-choices .v5sl-diamond-letter {
  font-size: 20px;
}

/* ============================================================================
   BOTTOM CURVED BRUSHED-BRASS PODIUM LEDGE (50/50 & CLUE COINS + 2x SWITCH)
   ============================================================================ */

.v5sl-bottom-bay {
  position: relative;
  z-index: 6;
  width: 100%;
  flex-shrink: 0;
  margin-top: auto;
}

.v5sl-podium-ledge {
  position: relative;
  width: 100%;
  padding: 14px 12px max(12px, env(safe-area-inset-bottom, 12px));
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse 100% 145% at 50% 12%, #f1cf7a 0%, #c89639 28%, #825917 72%, #3a2407 100%);
  border-top: 2.5px solid #fff2be;
  border-radius: 50% 50% 0 0 / 22px 22px 0 0;
  box-shadow: 0 -10px 28px rgba(0, 0, 0, 0.72), inset 0 3px 6px rgba(255, 248, 212, 0.52);
  transition: opacity 0.2s ease;
}

.v5sl-stage.is-revealed .v5sl-podium-ledge {
  display: none;
}

.v5sl-podium-controls {
  width: min(100%, 560px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(10px, 3vw, 22px);
}

/* Embossed Circular Brushed-Brass Coins (50/50 & CLUE) */
.v5sl-brass-coin {
  position: relative;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  border: 2.5px solid #fff0b4;
  padding: 0;
  background: radial-gradient(circle at 32% 26%, #fff5c8 0%, #e4b653 38%, #ad7b21 82%, #6e4a0d 100%);
  color: #241505;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow:
    0 5px 0 #5b3b09,
    0 8px 14px rgba(0, 0, 0, 0.75),
    inset 0 0 0 3px rgba(105, 68, 13, 0.42),
    inset 0 2px 3px rgba(255, 250, 224, 0.85);
  transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.18s ease, opacity 0.2s ease;
}

@media (min-width: 820px) {
  .v5sl-brass-coin {
    width: 72px;
    height: 72px;
  }
}

.v5sl-brass-coin:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.08) drop-shadow(0 0 12px rgba(255, 226, 128, 0.65));
}

.v5sl-brass-coin:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow:
    0 2px 0 #5b3b09,
    0 4px 8px rgba(0, 0, 0, 0.75),
    inset 0 0 0 3px rgba(105, 68, 13, 0.5);
}

.v5sl-brass-coin:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  filter: grayscale(0.45) contrast(0.9);
  box-shadow: 0 2px 0 #3f2806, 0 4px 8px rgba(0, 0, 0, 0.55);
}

.v5sl-coin-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 900;
  font-size: 14px;
  line-height: 1;
  letter-spacing: -0.02em;
  color: #241505;
  text-shadow: 0 1px 0 rgba(255, 245, 200, 0.68);
}

.v5sl-coin-icon {
  display: inline-flex;
  color: #2a1806;
  margin-top: 1px;
}

.v5sl-coin-count {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 21px;
  height: 21px;
  padding: 0 5px;
  border-radius: 999px;
  background: linear-gradient(180deg, #1b2f60 0%, #09132b 100%);
  border: 1.6px solid #ffe49c;
  color: #fff6d8;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.78);
}

/* Physical Brushed-Steel & Amber 2x DOUBLE DOWN Sliding Throw-Switch */
.v5sl-double-switch {
  position: relative;
  height: 54px;
  padding: 5px 14px 5px 7px;
  border-radius: 999px;
  border: 2.5px solid #d5dce6;
  background: linear-gradient(180deg, #272e3a 0%, #12161e 55%, #1d222c 100%);
  box-shadow:
    0 5px 0 #3d311f,
    0 8px 16px rgba(0, 0, 0, 0.78),
    inset 0 2px 5px rgba(0, 0, 0, 0.85),
    0 0 0 2px rgba(72, 52, 22, 0.65);
  display: inline-flex;
  align-items: center;
  gap: 11px;
  cursor: pointer;
  color: #fff4d2;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.v5sl-double-switch:hover:not(:disabled) {
  border-color: #ffe69e;
}

.v5sl-double-switch:disabled {
  opacity: 0.44;
  cursor: not-allowed;
}

.v5sl-switch-track {
  position: relative;
  width: 72px;
  height: 38px;
  border-radius: 999px;
  background: linear-gradient(180deg, #0b0e14 0%, #1c222e 100%);
  border: 1.5px solid #6c7788;
  box-shadow: inset 0 3px 7px rgba(0, 0, 0, 0.92);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 10px;
  gap: 5px;
  flex-shrink: 0;
}

.v5sl-switch-led {
  width: 6px;
  height: 15px;
  border-radius: 3px;
  background: #4e310a;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.8);
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.v5sl-switch-knob {
  position: absolute;
  left: 3px;
  top: 50%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transform: translateY(-50%);
  background: radial-gradient(circle at 32% 28%, #ffffff 0%, #cfd7e3 42%, #7d8796 82%, #4a525e 100%);
  border: 1.5px solid #eef3fa;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.85), inset 0 1px 2px #ffffff;
  transition: transform 0.22s cubic-bezier(0.22, 1.25, 0.36, 1), box-shadow 0.2s ease;
}

.v5sl-switch-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  line-height: 1.08;
}

.v5sl-switch-title {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(11.5px, 2.7vw, 13.5px);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #fff6dc;
}

.v5sl-switch-stakes {
  margin-top: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9.5px;
  font-weight: 700;
  color: #f3c868;
}

/* Armed State: Chrome Plunger Slides Right & Amber LEDs Ignite! */
.v5sl-double-switch[aria-pressed="true"] {
  border-color: #ffcf5c;
  box-shadow:
    0 5px 0 #5b3b09,
    0 0 22px rgba(255, 174, 34, 0.8),
    inset 0 0 12px rgba(255, 166, 26, 0.28);
}

.v5sl-double-switch[aria-pressed="true"] .v5sl-switch-track {
  justify-content: flex-start;
  border-color: #f6b640;
}

.v5sl-double-switch[aria-pressed="true"] .v5sl-switch-knob {
  transform: translate(34px, -50%);
  box-shadow: 0 0 10px rgba(255, 212, 102, 0.9), 0 3px 6px rgba(0, 0, 0, 0.85);
}

.v5sl-double-switch[aria-pressed="true"] .v5sl-switch-led {
  background: linear-gradient(180deg, #fff1a6 0%, #ffa01a 100%);
  box-shadow: 0 0 8px #ffb229, 0 0 14px rgba(255, 148, 0, 0.85);
}

/* Ambient glowing LED idle pilot even before armed (matches mockup's warm dual amber bars!) */
.v5sl-double-switch[aria-pressed="false"] .v5sl-switch-led {
  background: linear-gradient(180deg, #ffd470 0%, #d97a12 100%);
  box-shadow: 0 0 6px rgba(255, 166, 38, 0.72);
  opacity: 0.82;
}

/* ============================================================================
   THEATRICAL MAHOGANY & BRASS STAGE REVEAL BANNER (100% UNCLIPPED!)
   ============================================================================ */

.v5sl-reveal-dock {
  display: none;
  width: 100%;
  padding: 0 10px max(10px, env(safe-area-inset-bottom, 10px));
}

.v5sl-reveal-dock.is-visible {
  display: flex;
  justify-content: center;
  animation: v5slBannerRise 0.3s cubic-bezier(0.2, 0.9, 0.25, 1);
}

@keyframes v5slBannerRise {
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
}

.v5sl-reveal-banner {
  position: relative;
  width: min(100%, 880px);
  padding: 11px 14px;
  background: linear-gradient(175deg, #3f1a13 0%, #260f0b 58%, #170806 100%);
  border: 2.5px solid #d9a843;
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
  box-shadow: inset 0 2px 0 rgba(255, 232, 164, 0.42), 0 -6px 26px rgba(0, 0, 0, 0.85);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.v5sl-reveal-dock.is-win .v5sl-reveal-banner {
  border-color: #4be8a4;
  box-shadow: inset 0 2px 0 rgba(162, 255, 214, 0.48), 0 -4px 26px rgba(22, 168, 108, 0.38);
}

.v5sl-reveal-dock.is-miss .v5sl-reveal-banner {
  border-color: #e66a78;
}

.v5sl-reveal-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.v5sl-reveal-verdict-row {
  display: flex;
  align-items: center;
  gap: 9px;
  flex-wrap: wrap;
}

.v5sl-verdict-stamp {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: clamp(13px, 2.6vw, 16px);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 11px;
  clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%);
}

.v5sl-reveal-dock.is-win .v5sl-verdict-stamp {
  background: linear-gradient(180deg, #32d991 0%, #12784d 100%);
  color: #041d12;
}

.v5sl-reveal-dock.is-miss .v5sl-verdict-stamp {
  background: linear-gradient(180deg, #f05a6f 0%, #8f182a 100%);
  color: #fff4f6;
}

.v5sl-delta-readout {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: clamp(15px, 3vw, 20px);
  color: #ffe38f;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
}

.v5sl-reveal-dock.is-win .v5sl-delta-readout {
  color: #70ffbf;
}

.v5sl-reveal-dock.is-miss .v5sl-delta-readout {
  color: #ff9ba8;
}

.v5sl-wedge-award {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border: 1.5px solid #ffe082;
  background: rgba(20, 12, 5, 0.85);
  color: #ffe7a3;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.v5sl-reveal-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
}

.v5sl-max-medallion {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 2.5px solid #e6ba58;
  background: radial-gradient(circle at 50% 30%, #1c396e 0%, #09152e 100%);
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.78);
}

.v5sl-max-medallion img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

.v5sl-reveal-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.v5sl-host-quip {
  margin: 0;
  font-size: clamp(13px, 2vw, 15px);
  font-weight: 700;
  line-height: 1.28;
  color: #fff5db;
}

.v5sl-host-name {
  color: #f6cd6d;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.08em;
  margin-right: 6px;
}

.v5sl-did-you-know {
  margin: 0;
  padding-top: 4px;
  border-top: 1px solid rgba(242, 198, 98, 0.25);
  font-size: clamp(12px, 1.8vw, 13.5px);
  line-height: 1.3;
  color: #e8dcc4;
}

.v5sl-dyk-kicker {
  color: #7ee9ff;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 10.5px;
  letter-spacing: 0.08em;
  margin-right: 6px;
}

.v5sl-answer-note {
  font-size: 12px;
  font-weight: 600;
  color: #f3d598;
}

/* Compact mobile refinement to keep 100% above 844px fold */
@media (max-width: 460px) {
  .v5sl-fullscreen-btn {
    top: 5px;
    right: 6px;
    width: 28px;
    height: 28px;
  }
  .v5sl-top-ribbon {
    padding: 12px 0 2px;
  }
  .v5sl-chronometer {
    width: 86px;
    height: 86px;
  }
  .v5sl-wing {
    min-height: 32px;
    font-size: 10px;
    padding: 5px 12px;
  }
  .v5sl-wing-left {
    padding-left: 16px;
    padding-right: 13px;
  }
  .v5sl-wing-right {
    padding-left: 13px;
    padding-right: 16px;
  }
  .v5sl-prompt-heading {
    font-size: clamp(21px, 5.4vw, 26px);
  }
  .v5sl-lozenge-stack {
    gap: 8px;
  }
  .v5sl-hex-btn {
    min-height: 52px;
    padding: 8px 20px 8px 58px;
    font-size: 16.5px;
  }
  .v5sl-diamond-badge {
    width: 52px;
    height: 52px;
  }
  .v5sl-diamond-letter {
    font-size: 21px;
  }
  .v5sl-podium-ledge {
    padding: 11px 8px max(10px, env(safe-area-inset-bottom, 10px));
  }
  .v5sl-brass-coin {
    width: 60px;
    height: 60px;
  }
  .v5sl-coin-title {
    font-size: 13px;
  }
  .v5sl-double-switch {
    height: 48px;
    padding: 4px 10px 4px 6px;
    gap: 8px;
  }
  .v5sl-switch-track {
    width: 62px;
    height: 34px;
  }
  .v5sl-switch-knob {
    width: 26px;
    height: 26px;
  }
  .v5sl-double-switch[aria-pressed="true"] .v5sl-switch-knob {
    transform: translate(28px, -50%);
  }
  .v5sl-strike-plaque {
    min-height: 50px;
    padding: 7px 9px;
    font-size: 13px;
    gap: 7px;
  }
  .v5sl-bulb-svg {
    width: 22px;
    height: 22px;
  }
  .v5sl-gold-plunger {
    min-height: 40px;
    padding: 7px 18px;
    font-size: 13px;
  }
  .v5sl-reveal-banner {
    padding: 9px 11px;
    gap: 6px;
  }
  .v5sl-reveal-top {
    flex-wrap: nowrap;
    gap: 6px;
  }
  .v5sl-verdict-stamp {
    font-size: 11px;
    padding: 3px 8px;
  }
  .v5sl-delta-readout {
    font-size: 14px;
  }
  .v5sl-reveal-banner .v5sl-gold-plunger {
    min-height: 34px;
    padding: 5px 14px;
    font-size: 11.5px;
    flex-shrink: 0;
  }
  .v5sl-max-medallion {
    width: 46px;
    height: 46px;
  }
}

/* Dedicated Phone Landscape Layout (844x390 and short wide viewports) */
@media (max-height: 460px) and (min-width: 560px) {
  .v5sl-top-ribbon {
    padding: 3px 0 0;
  }
  .v5sl-ribbon-inner {
    width: min(calc(100% - 82px), 740px);
  }
  .v5sl-chronometer {
    width: 62px;
    height: 62px;
  }
  .v5sl-chrono-readout {
    font-size: 20px;
  }
  .v5sl-chrono-sub {
    font-size: 7px;
  }
  .v5sl-wing {
    min-height: 26px;
    font-size: 10px;
    padding: 3px 12px;
  }
  .v5sl-actor-host {
    left: 2px;
    bottom: 102px;
    width: 82px;
    max-height: 52%;
    opacity: 0.68;
  }
  .v5sl-actor-challenger-wrap {
    right: 2px;
    bottom: 66px;
    width: 88px;
    opacity: 0.68;
  }
  .v5sl-stage-main {
    padding: 0 0 3px;
    gap: 5px;
  }
  .v5sl-prompt-zone {
    width: min(calc(100% - 140px), 680px);
    padding: 2px 8px 0;
  }
  .v5sl-prompt-heading {
    max-width: 44ch;
    font-size: clamp(16px, 2.3vw, 21px);
    line-height: 1.15;
  }
  .v5sl-format-subcue {
    margin-top: 2px;
    font-size: 10px;
  }
  .v5sl-coach-whisper,
  .v5sl-clue-slip {
    margin-top: 3px;
    padding: 3px 12px;
    font-size: 11px;
  }
  .v5sl-lozenge-stack.is-pairable {
    gap: 7px;
  }
  .v5sl-lozenge-stack.is-pairable .v5sl-lozenge-pair-wrap {
    width: min(calc(100% - 160px), 680px);
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  .v5sl-hex-btn {
    min-height: 40px;
    padding: 5px 16px 5px 46px;
    font-size: 14.5px;
  }
  .v5sl-diamond-badge {
    width: 40px;
    height: 40px;
  }
  .v5sl-diamond-letter {
    font-size: 17px;
  }
  .v5sl-strike-wrap {
    width: min(calc(100% - 150px), 680px);
    gap: 6px;
  }
  .v5sl-strike-grid.is-six {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  .v5sl-strike-plaque {
    min-height: 38px;
    padding: 5px 8px;
    font-size: 12.5px;
  }
  .v5sl-bulb-svg {
    width: 20px;
    height: 20px;
  }
  .v5sl-gold-plunger {
    min-height: 32px;
    padding: 4px 16px;
    font-size: 11.5px;
  }
  .v5sl-visual-layout {
    width: min(calc(100% - 140px), 700px);
    grid-template-columns: minmax(220px, 0.95fr) minmax(260px, 1fr);
    gap: 12px;
  }
  .v5sl-monitor-screen {
    max-height: 128px;
  }
  .v5sl-visual-choices {
    gap: 4px;
  }
  .v5sl-visual-choices .v5sl-hex-btn {
    min-height: 34px;
    font-size: 13.5px;
  }
  .v5sl-visual-choices .v5sl-diamond-badge {
    width: 34px;
    height: 34px;
  }
  .v5sl-podium-ledge {
    padding: 6px 10px 6px;
    border-radius: 50% 50% 0 0 / 12px 12px 0 0;
  }
  .v5sl-brass-coin {
    width: 46px;
    height: 46px;
  }
  .v5sl-coin-title {
    font-size: 10.5px;
  }
  .v5sl-coin-count {
    top: -6px;
    right: -6px;
    min-width: 17px;
    height: 17px;
    font-size: 9.5px;
  }
  .v5sl-double-switch {
    height: 40px;
    padding: 3px 10px 3px 5px;
    gap: 8px;
  }
  .v5sl-switch-track {
    width: 54px;
    height: 28px;
  }
  .v5sl-switch-knob {
    width: 22px;
    height: 22px;
  }
  .v5sl-double-switch[aria-pressed="true"] .v5sl-switch-knob {
    transform: translate(24px, -50%);
  }
  .v5sl-switch-title {
    font-size: 10px;
  }
  .v5sl-switch-stakes {
    font-size: 8.5px;
  }
  .v5sl-reveal-dock {
    padding: 0 10px 5px;
  }
  .v5sl-reveal-banner {
    padding: 6px 12px;
    gap: 4px;
  }
  .v5sl-max-medallion {
    width: 36px;
    height: 36px;
  }
  .v5sl-host-quip,
  .v5sl-did-you-know {
    font-size: 11.5px;
    line-height: 1.22;
  }
}

@media (prefers-reduced-motion: reduce) {
  .v5sl-chronometer,
  .v5sl-chrono-arc-amber,
  .v5sl-chrono-arc-cyan,
  .v5sl-hex-btn,
  .v5sl-map-pulse,
  .v5sl-reveal-dock {
    animation: none !important;
    transition: none !important;
  }
}
`,document.head.appendChild(o)}class se{mountEl;ctx=null;callbacks=null;mountedAtMs=0;submitted=!1;revealed=!1;used5050=!1;usedHint=!1;doubleDownArmed=!1;stageEl=null;chronoWrapEl=null;chronoReadoutEl=null;chronoSubEl=null;chronoAmberArcEl=null;chronoCyanArcEl=null;rightWingTextEl=null;hostActorImgEl=null;coachWhisperEl=null;coachWhisperTextEl=null;clueSlipEl=null;clueSlipTextEl=null;revealDockEl=null;customGadgetSlotEl=null;coin5050El=null;coinClueEl=null;doubleSwitchEl=null;choiceButtons=[];chosenChoiceIndex=null;lockPulseTimer=null;escalatorRevealedCount=1;escalatorEnvelopes=[];escalatorOpenerBtn=null;multiSelectedIds=new Set;multiButtons=new Map;multiCounterEl=null;multiLockBtn=null;activeGadgetHandle=null;cleanupFns=[];constructor(e){this.mountEl=e,O()}mountQuestion(e,t){O(),this.teardownActiveState(),this.ctx=e,this.callbacks=t,this.mountedAtMs=performance.now(),this.submitted=!1,this.revealed=!1,this.used5050=!1,this.usedHint=!1,this.doubleDownArmed=!1;const{card:s}=e,i=e.tierNumber??4,a=e.venueBackdropUrl||U[i],r=e.hostPose??"welcome",n=this.getHostCutoutUrl(r),c=e.challengerId?w.challengers[e.challengerId]:null,d=this.getEffectivePointBase(),x=s.format==="CLUE_ESCALATOR"?`${p(d*3)} PTS (3×)`:`${p(d)} PTS`,g=this.getPrimaryStakeTag(e),v=s.wittyHeader?.trim()||s.categoryLabel||"Spotlight Round",{leftWing:m,rightWing:E}=R(v,x,g),b=e.timerMode==="RELAXED_UNTIMED"?"RELAXED":s.readInGraceSec>0?"READ_IN":"ACTIVE",M=b==="RELAXED"?"∞":`${Math.ceil(s.recommendedSec)}s`,P=b==="RELAXED"?"UNTIMED":b==="READ_IN"?"READ":"",L=this.getFormatSubCue(s),D=s.format==="MULTIPLE_CHOICE"||s.format==="CLUE_ESCALATOR"||s.format==="VISUAL_SPOTTER",z=!!(e.activeWagerPoints&&e.activeWagerPoints>0),$=e.allow5050Override??D,G=e.allowHintOverride??s.format!=="CLUE_ESCALATOR",H=e.allowDoubleDownOverride??(s.format!=="CLUE_ESCALATOR"&&!z),S=d*2,C=Math.round(d*.5);this.mountEl.innerHTML=`
      <div class="v5sl-stage" data-v5sl-stage data-format="${l(s.format)}">
        <!-- Layer 0: Painted Venue Vista & Volumetric Overhead Spotlights -->
        <div class="v5sl-backdrop-layer" aria-hidden="true">
          <img class="v5sl-venue-img" src="${l(a)}" alt="" />
          <div class="v5sl-spotlight-cones"></div>
          <div class="v5sl-stage-arches"></div>
        </div>

        <!-- Layer 1: Waist-Up Broadcast Stage Actors (Max Sterling & Challenger) -->
        <div class="v5sl-actors-layer" aria-hidden="true">
          <img
            class="v5sl-actor-host"
            data-v5sl-host-img
            src="${l(n)}"
            alt=""
          />
          <div class="v5sl-actor-challenger-wrap">
            ${c?`<img class="v5sl-actor-challenger-img" src="${l(c)}" alt="" />`:Z()}
            ${X()}
          </div>
        </div>

        <!-- Layer 2: Top Sculpted Brass Chronometer & Winged Category Ribbon -->
        <button
          type="button"
          class="v5sl-fullscreen-btn"
          data-v5sl-fullscreen-btn
          aria-label="Toggle Fullscreen"
          title="Fullscreen"
        >
          ${B(!1)}
        </button>
        <header class="v5sl-top-ribbon">
          <div class="v5sl-top-wire" aria-hidden="true"></div>
          <div class="v5sl-ribbon-inner">
            <div class="v5sl-wing v5sl-wing-left">
              <span class="v5sl-wing-text" data-v5sl-left-wing>${l(m)}</span>
            </div>
            <div
              class="v5sl-chronometer"
              data-v5sl-chrono
              data-phase="${b}"
              role="timer"
              aria-live="off"
              aria-label="Question Shot Clock"
            >
              ${N(M,P)}
            </div>
            <div class="v5sl-wing v5sl-wing-right">
              <span class="v5sl-wing-text" data-v5sl-right-wing>${l(E)}</span>
            </div>
          </div>
        </header>

        <!-- Layer 3: Frameless Spotlight Prompt + Interactive Format Body -->
        <main class="v5sl-stage-main">
          <section class="v5sl-prompt-zone" aria-label="Question Prompt">
            <h2 class="v5sl-prompt-heading" data-v5sl-prompt>${l(s.prompt)}</h2>
            ${L?`<div class="v5sl-format-subcue" data-v5sl-subcue>${l(L)}</div>`:""}
            <div class="v5sl-coach-whisper" data-v5sl-coach-whisper ${e.coachWhisper?"":"hidden"} role="note">
              <span class="v5sl-coach-whisper-icon">${Y()}</span>
              <span data-v5sl-coach-text>${l(e.coachWhisper??"")}</span>
            </div>
            <div class="v5sl-clue-slip" data-v5sl-clue-slip role="status">
              <span class="v5sl-clue-slip-tag">Studio Clue</span>
              <span data-v5sl-clue-text>${l(s.helpfulHint)}</span>
            </div>
          </section>

          <div class="v5sl-format-body" data-v5sl-format-body></div>
        </main>

        <!-- Layer 4: Bottom Curved Brushed-Brass Podium Ledge & Reveal Curtain -->
        <footer class="v5sl-bottom-bay">
          <div class="v5sl-podium-ledge" data-v5sl-podium-ledge>
            <div class="v5sl-podium-controls">
              <button
                type="button"
                class="v5sl-brass-coin"
                data-v5sl-coin-5050
                aria-label="50/50 Lifeline (${e.lifelines5050Left} remaining)"
                ${!$||e.lifelines5050Left<=0?"disabled":""}
              >
                <span class="v5sl-coin-title">50/50</span>
                <span class="v5sl-coin-count" data-v5sl-count-5050>${e.lifelines5050Left}</span>
              </button>

              <button
                type="button"
                class="v5sl-brass-coin"
                data-v5sl-coin-clue
                aria-label="Clue Lifeline (${e.lifelinesHintLeft} remaining)"
                ${!G||e.lifelinesHintLeft<=0?"disabled":""}
              >
                <span class="v5sl-coin-title">CLUE</span>
                <span class="v5sl-coin-icon">${q(18)}</span>
                <span class="v5sl-coin-count" data-v5sl-count-clue>${e.lifelinesHintLeft}</span>
              </button>

              <button
                type="button"
                class="v5sl-double-switch"
                data-v5sl-double-switch
                aria-pressed="false"
                aria-label="2x Double Down (+${p(S)} on hit, -${p(C)} on miss)"
                ${H?"":"disabled"}
              >
                <span class="v5sl-switch-track" aria-hidden="true">
                  <span class="v5sl-switch-knob"></span>
                  <span class="v5sl-switch-led"></span>
                  <span class="v5sl-switch-led"></span>
                </span>
                <span class="v5sl-switch-copy">
                  <span class="v5sl-switch-title">2× DOUBLE<br/>DOWN</span>
                  <span class="v5sl-switch-stakes">+${p(S)} / -${p(C)}</span>
                </span>
              </button>
            </div>
          </div>

          <section class="v5sl-reveal-dock" data-v5sl-reveal-dock aria-live="polite"></section>
        </footer>
      </div>
    `,this.stageEl=this.mountEl.querySelector("[data-v5sl-stage]"),this.chronoWrapEl=this.mountEl.querySelector("[data-v5sl-chrono]"),this.chronoReadoutEl=this.mountEl.querySelector("[data-v5sl-clock-readout]"),this.chronoSubEl=this.mountEl.querySelector("[data-v5sl-clock-sub]"),this.chronoAmberArcEl=this.mountEl.querySelector("[data-v5sl-arc-amber]"),this.chronoCyanArcEl=this.mountEl.querySelector("[data-v5sl-arc-cyan]"),this.rightWingTextEl=this.mountEl.querySelector("[data-v5sl-right-wing]"),this.hostActorImgEl=this.mountEl.querySelector("[data-v5sl-host-img]"),this.coachWhisperEl=this.mountEl.querySelector("[data-v5sl-coach-whisper]"),this.coachWhisperTextEl=this.mountEl.querySelector("[data-v5sl-coach-text]"),this.clueSlipEl=this.mountEl.querySelector("[data-v5sl-clue-slip]"),this.clueSlipTextEl=this.mountEl.querySelector("[data-v5sl-clue-text]"),this.revealDockEl=this.mountEl.querySelector("[data-v5sl-reveal-dock]"),this.coin5050El=this.mountEl.querySelector("[data-v5sl-coin-5050]"),this.coinClueEl=this.mountEl.querySelector("[data-v5sl-coin-clue]"),this.doubleSwitchEl=this.mountEl.querySelector("[data-v5sl-double-switch]"),this.bindFullscreenButton(),this.bindPodiumControls();const u=this.mountEl.querySelector("[data-v5sl-format-body]");switch(s.format){case"MULTIPLE_CHOICE":this.mountMultipleChoiceBody(u);break;case"CLUE_ESCALATOR":this.mountClueEscalatorBody(u);break;case"MULTI_STRIKE":this.mountMultiStrikeBody(u);break;case"VISUAL_SPOTTER":this.mountVisualSpotterBody(u);break;case"PINPOINT_DIAL":case"MATCH_4":case"SORT_4":this.prepareCustomGadgetSlot(u,e.customGadgetMounter);break}this.attachKeyboardShortcuts()}getCustomGadgetSlot(){return this.customGadgetSlotEl}mountCustomGadgetBody(e){if(!this.customGadgetSlotEl){const s=this.mountEl.querySelector("[data-v5sl-format-body]");if(!s)return null;this.prepareCustomGadgetSlot(s)}const t=this.customGadgetSlotEl;if(!t)return null;if(!e)return t;if(this.activeGadgetHandle?.dispose?.(),this.activeGadgetHandle=null,t.innerHTML="",e instanceof HTMLElement)return t.appendChild(e),t;if(this.ctx){const s={card:this.ctx.card,tilePointValue:this.getEffectivePointBase(),submit:a=>this.submitExternalAnswer(a),emitFeedback:a=>this.callbacks?.onInteractionFeedback?.(a),isSubmitted:()=>this.submitted},i=e(t,s);i&&(this.activeGadgetHandle=i)}return t}attachGadgetHandle(e){this.activeGadgetHandle?.dispose?.(),this.activeGadgetHandle=e}submitExternalAnswer(e){this.submitted||(this.submitted=!0,this.disablePodiumControls(),this.chronoWrapEl&&(this.chronoWrapEl.dataset.phase="LOCKED"),this.chronoSubEl&&(this.chronoSubEl.textContent="LOCKED"),this.callbacks?.onInteractionFeedback?.("lock_in"),this.emitSubmission(e))}setCoachWhisper(e){!this.coachWhisperEl||!this.coachWhisperTextEl||(e&&e.trim()?(this.coachWhisperTextEl.textContent=e.trim(),this.coachWhisperEl.hidden=!1):this.coachWhisperEl.hidden=!0)}updateClock(e){if(!this.chronoWrapEl||!this.chronoReadoutEl||!this.chronoSubEl||!this.chronoAmberArcEl||!this.chronoCyanArcEl)return;if(e.phase==="RELAXED"){this.chronoWrapEl.dataset.phase="RELAXED",this.chronoReadoutEl.textContent="∞",this.chronoSubEl.textContent="UNTIMED",this.chronoAmberArcEl.style.strokeDashoffset=(h*.45).toFixed(2),this.chronoCyanArcEl.style.strokeDashoffset=(f*.52).toFixed(2);return}if(e.phase==="READ_IN"){this.chronoWrapEl.dataset.phase="READ_IN",this.chronoReadoutEl.textContent=`${Math.ceil(Math.max(0,e.totalSec))}s`,this.chronoSubEl.textContent="READ",this.chronoAmberArcEl.style.strokeDashoffset=(h*.48).toFixed(2),this.chronoCyanArcEl.style.strokeDashoffset=(f*.56).toFixed(2);return}if(e.phase==="LOCKED"){this.chronoWrapEl.dataset.phase="LOCKED",this.chronoSubEl.textContent="LOCKED";return}if(e.phase==="TIMEOUT"){this.chronoWrapEl.dataset.phase="URGENT",this.chronoReadoutEl.textContent="0s",this.chronoSubEl.textContent="TIME UP",this.chronoAmberArcEl.style.strokeDashoffset=h.toFixed(2),this.chronoCyanArcEl.style.strokeDashoffset=f.toFixed(2);return}const t=Math.max(0,e.remainingSec),s=Math.max(1,e.totalSec),i=Math.max(0,Math.min(1,t/s)),a=t<=6,r=i*(h*.62),n=i*(f*.52);this.chronoWrapEl.dataset.phase=a?"URGENT":"ACTIVE",this.chronoReadoutEl.textContent=t<5?`${t.toFixed(1)}s`:`${Math.ceil(t)}s`,this.chronoSubEl.textContent=a?"HURRY!":"",this.chronoAmberArcEl.style.strokeDashoffset=(h-r).toFixed(2),this.chronoCyanArcEl.style.strokeDashoffset=(f-n).toFixed(2)}getDoubleDownArmed(){return this.doubleDownArmed}apply5050Elimination(e){if(!this.ctx||this.submitted||this.used5050||this.choiceButtons.length<4)return;const t=this.get4ChoiceCorrectIndex(this.ctx.card);if(t===null)return;let s;if(e&&e.length>0)s=e.filter(i=>i!==t).slice(0,2);else{const i=[0,1,2,3].filter(r=>r!==t),a=Math.abs(this.ctx.card.qid)%i.length;s=[i[a],i[(a+1)%i.length]]}this.used5050=!0;for(const i of s){const a=this.choiceButtons[i];a&&(a.disabled=!0,a.classList.add("is-eliminated"),a.setAttribute("aria-disabled","true"))}if(this.syncRowWireStates(),this.coin5050El){this.coin5050El.disabled=!0;const i=this.coin5050El.querySelector("[data-v5sl-count-5050]");i&&(i.textContent=String(Math.max(0,this.ctx.lifelines5050Left-1)))}}revealHint(e){if(!this.ctx)return;const t=e||this.ctx.card.helpfulHint;if(this.usedHint=!0,this.clueSlipEl&&this.clueSlipTextEl&&(this.clueSlipTextEl.textContent=t,this.clueSlipEl.classList.add("is-open")),this.activeGadgetHandle?.revealHint?.(t),this.coinClueEl){this.coinClueEl.disabled=!0;const s=this.coinClueEl.querySelector("[data-v5sl-count-clue]");s&&(s.textContent=String(Math.max(0,this.ctx.lifelinesHintLeft-1)))}}showReveal(e){if(!this.ctx||!this.revealDockEl)return;this.submitted=!0,this.revealed=!0,this.disablePodiumControls(),this.stageEl?.classList.add("is-revealed");const{card:t}=this.ctx,{evaluation:s}=e,i=e.hostPoseOverride??(s.isCorrect?"hype":"wince"),a=this.getHostCutoutUrl(i);switch(this.hostActorImgEl&&(this.hostActorImgEl.src=a),t.format){case"MULTIPLE_CHOICE":case"CLUE_ESCALATOR":case"VISUAL_SPOTTER":this.reveal4ChoiceOutcome(t);break;case"MULTI_STRIKE":this.revealMultiStrikeOutcome(t);break;case"PINPOINT_DIAL":case"MATCH_4":case"SORT_4":this.activeGadgetHandle?.showGadgetReveal?.(s);break}const r=s.netPointsDelta>0?"+":"",n=s.netPointsDelta===0?"0 PTS":`${r}${p(s.netPointsDelta)} PTS`,c=s.isBullseyeOrSweep?"BULLSEYE SWEEP!":s.isCorrect?"NAILED IT!":"MISSED THE MARK",d=e.hostSpeakerName||"Max Sterling",x=e.funFactWhy||t.funFactWhy,g=e.nextButtonLabel||"CONTINUE",v=e.wedgeAwarded?`<span class="v5sl-wedge-award" style="border-color:${A[e.wedgeAwarded].accentHex}">
           ${K(14)}
           <span>${l(A[e.wedgeAwarded].shortLabel)} WEDGE</span>
         </span>`:"",m=!s.isCorrect||s.detailBreakdown?`<div class="v5sl-answer-note"><strong>Answer:</strong> ${l(s.correctSummaryLabel)}${s.detailBreakdown?` · ${l(s.detailBreakdown)}`:""}</div>`:"";this.revealDockEl.className=`v5sl-reveal-dock is-visible ${s.isCorrect?"is-win":"is-miss"}`,this.revealDockEl.innerHTML=`
      <div class="v5sl-reveal-banner">
        <div class="v5sl-reveal-top">
          <div class="v5sl-reveal-verdict-row">
            <span class="v5sl-verdict-stamp">${c}</span>
            <span class="v5sl-delta-readout" data-v5sl-delta>${n}</span>
          </div>
          <button type="button" class="v5sl-gold-plunger" data-v5sl-next-btn>
            <span>${l(g)}</span>
            ${V()}
          </button>
        </div>

        <div class="v5sl-reveal-grid">
          <div class="v5sl-max-medallion">
            <img src="${l(a)}" alt="${l(d)}" />
          </div>
          <div class="v5sl-reveal-copy">
            <p class="v5sl-host-quip">
              <span class="v5sl-host-name">${l(d)}</span>
              &ldquo;${l(e.hostQuip)}&rdquo;
            </p>
            ${m||v?`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">${v}${m}</div>`:""}
            <p class="v5sl-did-you-know">
              <span class="v5sl-dyk-kicker">Did You Know?</span>
              <span>${l(x)}</span>
            </p>
          </div>
        </div>
      </div>
    `,this.revealDockEl.querySelector("[data-v5sl-next-btn]")?.addEventListener("click",()=>{this.callbacks?.onNext?.()})}dispose(){this.teardownActiveState(),this.mountEl.innerHTML=""}mountMultipleChoiceBody(e){const t=this.ctx?.card.choices??["","","",""];e.innerHTML=this.renderHexLozengeGroupHtml(t,{pairOnDesktop:!0}),this.bind4ChoiceButtons(e,"MULTIPLE_CHOICE")}mountClueEscalatorBody(e){const t=this.ctx?.card.escalator;if(!t){this.mountMultipleChoiceBody(e);return}this.escalatorRevealedCount=1;const s=this.getEffectivePointBase();e.innerHTML=`
      <div class="v5sl-escalator-wrap">
        <div class="v5sl-envelopes-bar" data-v5sl-envelopes-bar>
          <article class="v5sl-envelope is-open" data-clue-slot="1">
            <div class="v5sl-env-head">
              <span class="v5sl-env-kicker">Clue 1 · Opening</span>
              <span class="v5sl-env-mult">3×</span>
            </div>
            <div class="v5sl-env-text">${l(t.clues[0])}</div>
          </article>

          <article class="v5sl-envelope is-sealed" data-clue-slot="2" role="button" tabindex="0" aria-label="Break Seal for Clue 2 (2x payout)">
            <div class="v5sl-env-sealed-label">
              <span class="v5sl-env-sealed-title">CLUE 2 · SEALED</span>
              <span class="v5sl-env-sealed-sub">Tap to unseal · 2× Payout</span>
            </div>
            ${I("2×")}
          </article>

          <article class="v5sl-envelope is-sealed" data-clue-slot="3" role="button" tabindex="0" aria-label="Break Seal for Clue 3 (1x payout)">
            <div class="v5sl-env-sealed-label">
              <span class="v5sl-env-sealed-title">CLUE 3 · SEALED</span>
              <span class="v5sl-env-sealed-sub">Tap to unseal · 1× Payout</span>
            </div>
            ${I("1×")}
          </article>
        </div>

        <button type="button" class="v5sl-seal-opener-btn" data-v5sl-break-seal>
          <span>BREAK NEXT SEAL (CLUE 2 · 2×)</span>
        </button>

        ${this.renderHexLozengeGroupHtml(t.choices,{pairOnDesktop:!0})}
      </div>
    `,this.escalatorEnvelopes=Array.from(e.querySelectorAll("[data-clue-slot]")),this.escalatorOpenerBtn=e.querySelector("[data-v5sl-break-seal]");const i=r=>{if(this.submitted)return;r>this.escalatorRevealedCount&&(this.escalatorRevealedCount=r);for(let c=2;c<=this.escalatorRevealedCount;c++){const d=this.escalatorEnvelopes[c-1];if(!d||d.classList.contains("is-open"))continue;d.classList.remove("is-sealed"),d.classList.add("is-open"),d.removeAttribute("role"),d.removeAttribute("tabindex");const x=c===2?"2×":"1×",g=c===2?"Clue 2 · Sharper":"Clue 3 · Clear";d.innerHTML=`
          <div class="v5sl-env-head">
            <span class="v5sl-env-kicker">${g}</span>
            <span class="v5sl-env-mult">${x}</span>
          </div>
          <div class="v5sl-env-text">${l(t.clues[c-1])}</div>
        `}const n=this.escalatorRevealedCount===1?3:this.escalatorRevealedCount===2?2:1;if(this.rightWingTextEl&&this.ctx){const c=this.getPrimaryStakeTag(this.ctx),d=this.ctx.card.wittyHeader?.trim()||this.ctx.card.categoryLabel||"Spotlight Round",{rightWing:x}=R(d,`${p(s*n)} PTS (${n}×)`,c);this.rightWingTextEl.textContent=x}this.escalatorOpenerBtn&&(this.escalatorRevealedCount===2?this.escalatorOpenerBtn.innerHTML="<span>BREAK NEXT SEAL (CLUE 3 · 1×)</span>":this.escalatorRevealedCount>=3&&(this.escalatorOpenerBtn.innerHTML="<span>ALL 3 SEALS UNSEALED</span>",this.escalatorOpenerBtn.disabled=!0)),this.callbacks?.onInteractionFeedback?.("tap"),this.callbacks?.onEscalatorDealClue?.(r)};this.escalatorOpenerBtn?.addEventListener("click",()=>{this.submitted||(this.escalatorRevealedCount===1?i(2):this.escalatorRevealedCount===2&&i(3))});const a=r=>{const n=this.escalatorEnvelopes[r-1];n&&(n.addEventListener("click",()=>{n.classList.contains("is-sealed")&&i(r)}),n.addEventListener("keydown",c=>{(c.key==="Enter"||c.key===" ")&&n.classList.contains("is-sealed")&&(c.preventDefault(),i(r))}))};a(2),a(3),this.bind4ChoiceButtons(e,"CLUE_ESCALATOR")}mountMultiStrikeBody(e){const t=this.ctx?.card.multiStrike;if(!t){this.mountMultipleChoiceBody(e);return}this.multiSelectedIds.clear(),this.multiButtons.clear();const s=t.options.length>=5;e.innerHTML=`
      <div class="v5sl-strike-wrap">
        <div class="v5sl-strike-grid ${s?"is-six":""}" data-v5sl-strike-grid>
          ${t.options.map(i=>`
            <button
              type="button"
              class="v5sl-strike-plaque"
              data-option-id="${l(i.optionId)}"
              aria-pressed="false"
            >
              ${j()}
              <span>${l(i.label)}</span>
            </button>`).join("")}
        </div>

        <div class="v5sl-strike-footer">
          <span class="v5sl-strike-counter" data-v5sl-strike-counter>
            0 / ${t.targetCount} LIT
          </span>
          <button type="button" class="v5sl-gold-plunger" data-v5sl-strike-lock disabled>
            <span>LOCK PICKS</span>
          </button>
        </div>
      </div>
    `,this.multiCounterEl=e.querySelector("[data-v5sl-strike-counter]"),this.multiLockBtn=e.querySelector("[data-v5sl-strike-lock]"),e.querySelectorAll(".v5sl-strike-plaque").forEach(i=>{const a=i.dataset.optionId||"";this.multiButtons.set(a,i),i.addEventListener("click",()=>{this.submitted||(this.multiSelectedIds.has(a)?this.multiSelectedIds.delete(a):(t.strikeMode==="SPOT_THE_IMPOSTER"&&t.targetCount===1&&this.multiSelectedIds.clear(),this.multiSelectedIds.add(a)),this.callbacks?.onInteractionFeedback?.("tap"),this.syncMultiStrikeVisuals(t.targetCount))})}),this.multiLockBtn?.addEventListener("click",()=>{this.submitted||this.multiSelectedIds.size===0||(this.submitted=!0,this.disablePodiumControls(),this.multiLockBtn&&(this.multiLockBtn.disabled=!0),this.chronoWrapEl&&(this.chronoWrapEl.dataset.phase="LOCKED"),this.chronoSubEl&&(this.chronoSubEl.textContent="LOCKED"),this.callbacks?.onInteractionFeedback?.("lock_in"),this.emitSubmission({format:"MULTI_STRIKE",multiStrikeIds:Array.from(this.multiSelectedIds)}))})}syncMultiStrikeVisuals(e){this.multiButtons.forEach((t,s)=>{const i=this.multiSelectedIds.has(s);t.classList.toggle("is-selected",i),t.setAttribute("aria-pressed",String(i))}),this.multiCounterEl&&(this.multiCounterEl.textContent=`${this.multiSelectedIds.size} / ${e} LIT`),this.multiLockBtn&&(this.multiLockBtn.disabled=this.submitted||this.multiSelectedIds.size===0)}revealMultiStrikeOutcome(e){const t=e.multiStrike;t&&(t.options.forEach(s=>{const i=this.multiButtons.get(s.optionId);if(!i)return;i.disabled=!0;const a=this.multiSelectedIds.has(s.optionId);i.classList.remove("is-selected"),s.isTarget&&a?i.classList.add("is-hit"):s.isTarget&&!a?i.classList.add("is-missed-target"):!s.isTarget&&a&&i.classList.add("is-wrong-pick")}),this.multiLockBtn&&(this.multiLockBtn.disabled=!0))}mountVisualSpotterBody(e){const t=this.ctx?.card.visualSpotter;if(!t){this.mountMultipleChoiceBody(e);return}const s=t.visualKind==="WORLD_REGION_MAP",i=s?J(t.targetLat??0,t.targetLon??0):`<img src="${l(t.imageUrl||"./assets/visuals/arch_eiffel_tower.svg")}" alt="${l(t.caption||"Visual stage diagram")}" data-v5sl-visual-img />`,a=t.caption||(s?`STAGE BEACON · ${Math.abs(t.targetLat??0).toFixed(1)}°${(t.targetLat??0)>=0?"N":"S"}, ${Math.abs(t.targetLon??0).toFixed(1)}°${(t.targetLon??0)>=0?"E":"W"}`:"STUDIO VISUAL MONITOR");e.innerHTML=`
      <div class="v5sl-visual-layout">
        <figure class="v5sl-brass-monitor ${s?"is-map":""}">
          <span class="v5sl-monitor-rivet r-tl" aria-hidden="true"></span>
          <span class="v5sl-monitor-rivet r-tr" aria-hidden="true"></span>
          <span class="v5sl-monitor-rivet r-bl" aria-hidden="true"></span>
          <span class="v5sl-monitor-rivet r-br" aria-hidden="true"></span>
          <div class="v5sl-monitor-screen">${i}</div>
          <figcaption class="v5sl-monitor-plate">${l(a)}</figcaption>
        </figure>

        <div class="v5sl-visual-choices">
          ${this.renderHexLozengeGroupHtml(t.choices,{pairOnDesktop:!1})}
        </div>
      </div>
    `;const r=e.querySelector("[data-v5sl-visual-img]");r?.addEventListener("error",()=>{const n=r.parentElement;n&&(n.innerHTML=`<div style="color:#2b1b08;text-align:center;padding:16px;font-weight:800;font-size:14px;">${l(a)}</div>`)}),this.bind4ChoiceButtons(e,"VISUAL_SPOTTER")}prepareCustomGadgetSlot(e,t){e.innerHTML='<div class="v5sl-custom-gadget-slot" data-v5sl-gadget-slot></div>',this.customGadgetSlotEl=e.querySelector("[data-v5sl-gadget-slot]"),t&&this.mountCustomGadgetBody(t)}renderHexLozengeGroupHtml(e,t){const s=String(this.ctx?.card.qid??0).replace(/[^a-zA-Z0-9]/g,""),i=(a,r)=>{const n=W[r]??"A",c=`${s}_${r}`;return`
        <button type="button" class="v5sl-hex-btn" data-choice-index="${r}">
          ${F(c)}
          ${_(n)}
          <span class="v5sl-hex-text">${l(a)}</span>
        </button>
      `};return t.pairOnDesktop?`
        <div class="v5sl-lozenge-stack is-pairable" data-v5sl-choices-grid>
          <div class="v5sl-lozenge-row" data-v5sl-row="0">
            <div class="v5sl-light-wire" aria-hidden="true"></div>
            <div class="v5sl-lozenge-pair-wrap">
              ${i(e[0],0)}
              ${i(e[1],1)}
            </div>
          </div>
          <div class="v5sl-lozenge-row" data-v5sl-row="1">
            <div class="v5sl-light-wire" aria-hidden="true"></div>
            <div class="v5sl-lozenge-pair-wrap">
              ${i(e[2],2)}
              ${i(e[3],3)}
            </div>
          </div>
        </div>
      `:`
      <div class="v5sl-lozenge-stack" data-v5sl-choices-grid>
        ${e.map((a,r)=>`
          <div class="v5sl-lozenge-row" data-v5sl-row="${r}">
            <div class="v5sl-light-wire" aria-hidden="true"></div>
            <div class="v5sl-lozenge-pair-wrap">
              ${i(a,r)}
            </div>
          </div>`).join("")}
      </div>
    `}bind4ChoiceButtons(e,t){this.choiceButtons=Array.from(e.querySelectorAll("[data-choice-index]")),this.chosenChoiceIndex=null,this.choiceButtons.forEach(s=>{s.addEventListener("click",()=>{if(this.submitted||s.disabled)return;const i=Number(s.dataset.choiceIndex);this.commit4Choice(i,t)})})}commit4Choice(e,t){if(this.submitted)return;this.submitted=!0,this.chosenChoiceIndex=e,this.disablePodiumControls(),this.escalatorOpenerBtn&&(this.escalatorOpenerBtn.disabled=!0),this.chronoWrapEl&&(this.chronoWrapEl.dataset.phase="LOCKED"),this.chronoSubEl&&(this.chronoSubEl.textContent="LOCKED"),this.choiceButtons.forEach((a,r)=>{a.disabled=!0,r===e&&a.classList.add("is-locked")}),this.syncRowWireStates(),this.callbacks?.onInteractionFeedback?.("lock_in");const s=this.ctx?.lockInSuspenseMs??380,i=()=>{this.emitSubmission({format:t,chosenIndex:e,escalatorCluesRevealed:t==="CLUE_ESCALATOR"?this.escalatorRevealedCount:void 0})};s<=0?i():this.lockPulseTimer=window.setTimeout(()=>{this.lockPulseTimer=null,i()},s)}reveal4ChoiceOutcome(e){const t=this.get4ChoiceCorrectIndex(e);this.choiceButtons.forEach((s,i)=>{s.disabled=!0,s.classList.remove("is-locked"),i===t?s.classList.add("is-correct"):i===this.chosenChoiceIndex?s.classList.add("is-wrong"):s.classList.add("is-dim-after")}),this.syncRowWireStates()}syncRowWireStates(){this.mountEl.querySelectorAll(".v5sl-lozenge-row").forEach(t=>{const s=Array.from(t.querySelectorAll(".v5sl-hex-btn"));t.classList.toggle("has-locked",s.some(i=>i.classList.contains("is-locked"))),t.classList.toggle("has-correct",s.some(i=>i.classList.contains("is-correct"))),t.classList.toggle("has-wrong",!s.some(i=>i.classList.contains("is-correct"))&&s.some(i=>i.classList.contains("is-wrong"))),t.classList.toggle("all-eliminated",s.length>0&&s.every(i=>i.classList.contains("is-eliminated")))})}get4ChoiceCorrectIndex(e){return e.format==="MULTIPLE_CHOICE"?e.correctIndex??0:e.format==="CLUE_ESCALATOR"?e.escalator?.correctIndex??0:e.format==="VISUAL_SPOTTER"?e.visualSpotter?.correctIndex??0:null}bindFullscreenButton(){const e=this.mountEl.querySelector("[data-v5sl-fullscreen-btn]");if(!e||typeof document>"u")return;const t=()=>{const i=!!document.fullscreenElement;e.innerHTML=B(i),e.setAttribute("aria-pressed",String(i))};t(),e.addEventListener("click",()=>{this.callbacks?.onInteractionFeedback?.("tap");try{document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.()}catch{}});const s=()=>t();document.addEventListener("fullscreenchange",s),this.cleanupFns.push(()=>document.removeEventListener("fullscreenchange",s))}bindPodiumControls(){this.coin5050El?.addEventListener("click",()=>{this.submitted||this.used5050||this.coin5050El?.disabled||(this.apply5050Elimination(),this.callbacks?.onInteractionFeedback?.("tap"),this.callbacks?.onUse5050?.())}),this.coinClueEl?.addEventListener("click",()=>{this.submitted||this.usedHint||this.coinClueEl?.disabled||(this.revealHint(),this.callbacks?.onInteractionFeedback?.("tap"),this.callbacks?.onUseHint?.())}),this.doubleSwitchEl?.addEventListener("click",()=>{this.submitted||!this.doubleSwitchEl||this.doubleSwitchEl.disabled||(this.doubleDownArmed=!this.doubleDownArmed,this.doubleSwitchEl.setAttribute("aria-pressed",String(this.doubleDownArmed)),this.callbacks?.onInteractionFeedback?.("tap"),this.callbacks?.onDoubleDownToggle?.(this.doubleDownArmed))})}disablePodiumControls(){this.coin5050El&&(this.coin5050El.disabled=!0),this.coinClueEl&&(this.coinClueEl.disabled=!0),this.doubleSwitchEl&&(this.doubleSwitchEl.disabled=!0)}emitSubmission(e){const t=Math.max(.1,Number(((performance.now()-this.mountedAtMs)/1e3).toFixed(2))),s={...e,elapsedSec:t,used5050:this.used5050,usedHint:this.usedHint,doubleDownArmed:this.doubleDownArmed};this.callbacks?.onSubmit(s)}attachKeyboardShortcuts(){const e=t=>{if(!this.ctx)return;const s=t.target;if(!(s&&(s.tagName==="INPUT"||s.tagName==="TEXTAREA"))){if(this.revealed&&(t.key==="Enter"||t.key===" ")){t.preventDefault(),this.callbacks?.onNext?.();return}if(!this.submitted&&(this.ctx.card.format==="MULTIPLE_CHOICE"||this.ctx.card.format==="CLUE_ESCALATOR"||this.ctx.card.format==="VISUAL_SPOTTER")){const a={1:0,2:1,3:2,4:3,a:0,b:1,c:2,d:3}[t.key.toLowerCase()];a!==void 0&&this.choiceButtons[a]&&!this.choiceButtons[a].disabled&&(t.preventDefault(),this.commit4Choice(a,this.ctx.card.format))}}};window.addEventListener("keydown",e),this.cleanupFns.push(()=>window.removeEventListener("keydown",e))}getEffectivePointBase(){if(!this.ctx)return 200;if(this.ctx.activeWagerPoints&&this.ctx.activeWagerPoints>0)return this.ctx.activeWagerPoints;const e=this.ctx.doublePotMultiplier&&this.ctx.doublePotMultiplier>1?this.ctx.doublePotMultiplier:1;return this.ctx.tilePointValue*e}getPrimaryStakeTag(e){return e.activeWagerPoints&&e.activeWagerPoints>0?"POWER PLAY":e.isCrownWedgeTile?"CROWN WEDGE":e.isRivalBountyTile?"RIVAL BOUNTY":e.isLightningBlitz?"LIGHTNING BLITZ":e.doublePotMultiplier&&e.doublePotMultiplier>1?`${e.doublePotMultiplier}× WHEEL POT`:null}getFormatSubCue(e){return e.format==="CLUE_ESCALATOR"?"ANSWER EARLY FOR 3× POINTS · BREAK SEALS FOR SHARPER CLUES":e.format==="MULTI_STRIKE"&&e.multiStrike?e.multiStrike.strikeMode==="SPOT_THE_IMPOSTER"?"SPOT THE SINGLE IMPOSTER & LOCK YOUR PICK":`ILLUMINATE ALL ${e.multiStrike.targetCount} TRUE TARGETS & LOCK PICKS`:e.format==="VISUAL_SPOTTER"&&e.visualSpotter?e.visualSpotter.visualKind==="WORLD_REGION_MAP"?"LOCATE THE GLOWING STAGE BEACON ON THE WORLD MONITOR":"INSPECT THE STAGE MONITOR PLATE & LOCK YOUR ANSWER":e.format==="MATCH_4"&&e.match4?e.match4.instruction:e.format==="SORT_4"&&e.sort4?e.sort4.orderDirectionLabel:null}getHostCutoutUrl(e){return e==="hype"?w.maxHype:e==="wince"?w.maxWince:w.maxWelcome}teardownActiveState(){this.lockPulseTimer!==null&&(window.clearTimeout(this.lockPulseTimer),this.lockPulseTimer=null),this.activeGadgetHandle?.dispose?.(),this.activeGadgetHandle=null;for(const e of this.cleanupFns)e();this.cleanupFns=[],this.choiceButtons=[],this.escalatorEnvelopes=[],this.multiButtons.clear(),this.multiSelectedIds.clear(),this.customGadgetSlotEl=null}}export{se as SpotlightLozengeRendererV5,te as mountCustomGadgetBody};
