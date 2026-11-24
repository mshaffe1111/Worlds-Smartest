let nt=0;function He(t){return nt+=1,`${t}${nt}`}function S(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function bt(t,y,l){const s=t.trim().toLowerCase();return s!==""&&s!=="ce"&&s!=="ad"?!1:y>=500&&l<=2300}function le(t,y,l,s,a=!0){const P=Number.isFinite(t)?t:l,g=bt(y,l,s)&&Number.isInteger(P);let x;g?x=String(Math.round(P)):Number.isInteger(P)?x=P.toLocaleString("en-US"):x=Number(P.toFixed(2)).toLocaleString("en-US");const p=y.trim();return!a||!p?x:p==="%"||p==="°"||p==="°C"||p==="°F"?`${x}${p}`:p==="C"||p==="F"?`${x}°${p}`:`${x} ${p}`}function De(t){const y=t>0?"+":"-",l=Math.abs(t);return l>=1e3&&l%1e3===0?`${y}${l/1e3}k`:`${y}${Number.isInteger(l)?l:Number(l.toFixed(2))}`}function Ae(t,y,l,s){const a=s>0&&Number.isFinite(s)?s:1,P=y+Math.round((t-y)/a)*a,g=Math.max(y,Math.min(l,P));return Number.isInteger(a)?Math.round(g):Number(g.toFixed(2))}function G(t,y,l,s){const a=(s-90)*Math.PI/180;return{x:t+l*Math.cos(a),y:y+l*Math.sin(a)}}function me(t,y,l,s,a){const P=Math.max(.25,a-s),g=G(t,y,l,s),x=G(t,y,l,a),p=P>180?1:0;return`M ${g.x.toFixed(2)} ${g.y.toFixed(2)} A ${l.toFixed(2)} ${l.toFixed(2)} 0 ${p} 1 ${x.x.toFixed(2)} ${x.y.toFixed(2)}`}const st="v5-gadget-styles",ht=`
/* ==========================================================================
   WORLD'S SMARTEST v5.0 — Scoped Tactile Gadget Styles (#v5-gadget-styles)
   ========================================================================== */

.v5g-root,
.v5g-root * {
  box-sizing: border-box;
}

.v5g-root {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #fce9b8;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  user-select: none;
  -webkit-user-select: none;
}

/* Diegetic Brushed-Brass & Parchment Studio Clue Ribbon (hidden until revealed) */
.v5g-hint-slip {
  display: none;
  width: 100%;
  max-width: 560px;
  padding: 7px 14px;
  border-radius: 8px;
  background: linear-gradient(180deg, #322112 0%, #1d1209 100%);
  border: 1.5px solid #d7a347;
  box-shadow:
    inset 0 1px 0 rgba(255, 238, 178, 0.42),
    0 5px 14px rgba(0, 0, 0, 0.55);
  color: #ffefc4;
  font-size: clamp(11.5px, 3vw, 13.5px);
  line-height: 1.32;
  align-items: center;
  gap: 9px;
}

.v5g-hint-slip.is-open {
  display: flex;
  animation: v5gHintGlide 240ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes v5gHintGlide {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.v5g-hint-tag {
  flex: 0 0 auto;
  padding: 2px 7px;
  border-radius: 4px;
  background: linear-gradient(180deg, #f3ca6e 0%, #b77c1f 100%);
  color: #1f1204;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgba(255, 250, 224, 0.7);
}

.v5g-hint-text {
  flex: 1 1 auto;
  min-width: 0;
}

/* ==========================================================================
   1. PINPOINT_DIAL — 270° Brushed-Brass & Sapphire Analog Speedometer Gauge
   ========================================================================== */

.v5g-dial-shell {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.v5g-dial-stage {
  position: relative;
  width: min(100%, 342px);
  aspect-ratio: 420 / 356;
  display: flex;
  align-items: center;
  justify-content: center;
}

.v5g-dial-svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
  touch-action: none;
  cursor: grab;
  filter: drop-shadow(0 12px 22px rgba(2, 6, 18, 0.72));
}

.v5g-dial-svg.is-dragging {
  cursor: grabbing;
}

.v5g-dial-svg.is-locked {
  cursor: default;
}

/* Nixie-Tube Numeric Readout nestled cleanly in the lower dial window */
.v5g-nixie-bezel {
  position: absolute;
  left: 50%;
  top: 72.5%;
  transform: translate(-50%, -50%);
  padding: 4px 7px;
  border-radius: 13px;
  background: linear-gradient(180deg, #f0c96f 0%, #9b6b21 48%, #5b3a0c 100%);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.72),
    inset 0 1px 1px rgba(255, 248, 210, 0.85),
    inset 0 -1px 2px rgba(42, 22, 4, 0.9);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 3;
}

.v5g-nixie-window {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 3px 6px;
  border-radius: 9px;
  background: linear-gradient(180deg, #1b0f08 0%, #0d0704 65%, #231107 100%);
  border: 1.5px solid #43280d;
  box-shadow:
    inset 0 3px 7px rgba(0, 0, 0, 0.92),
    inset 0 -2px 6px rgba(255, 134, 38, 0.16);
}

.v5g-nixie-tube {
  position: relative;
  min-width: 22px;
  height: 31px;
  padding: 0 2px;
  border-radius: 5px;
  background:
    radial-gradient(ellipse at 50% 42%, rgba(255, 132, 32, 0.22) 0%, rgba(28, 12, 4, 0.92) 78%),
    repeating-linear-gradient(
      60deg,
      rgba(255, 194, 120, 0.04) 0px,
      rgba(255, 194, 120, 0.04) 1px,
      transparent 1px,
      transparent 4px
    );
  border: 1px solid rgba(196, 122, 52, 0.34);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.88),
    inset 0 -1px 3px rgba(255, 150, 56, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 22px;
  line-height: 1;
  color: #ffb14a;
  text-shadow:
    0 0 3px #fff1c2,
    0 0 8px #ff8a1f,
    0 0 16px rgba(255, 92, 0, 0.9);
  letter-spacing: 0;
}

.v5g-nixie-tube::after {
  content: '';
  position: absolute;
  inset: 1px 2px auto 2px;
  height: 7px;
  border-radius: 3px;
  background: linear-gradient(180deg, rgba(255, 240, 210, 0.22), rgba(255, 240, 210, 0));
  pointer-events: none;
}

.v5g-nixie-tube.is-compact {
  min-width: 17px;
  height: 27px;
  font-size: 18px;
}

.v5g-nixie-tube.is-punct {
  min-width: 11px;
  font-size: 18px;
  background: transparent;
  border-color: transparent;
  box-shadow: none;
}

.v5g-nixie-unit {
  padding: 1px 7px;
  border-radius: 4px;
  background: linear-gradient(180deg, #2d1b0c 0%, #180d05 100%);
  border: 1px solid rgba(232, 184, 92, 0.55);
  color: #ffe299;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: 9.5px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1.15;
}

/* Knurled Brass Rotary Step Knobs flanking the lower bezel shoulders */
.v5g-knob-btn {
  position: absolute;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background:
    repeating-conic-gradient(
      from 0deg,
      #ffe9a6 0deg 4deg,
      #7c4f13 4deg 8deg,
      #d69b3a 8deg 12deg
    );
  box-shadow:
    0 7px 14px rgba(0, 0, 0, 0.72),
    0 0 0 2px #51320b,
    inset 0 2px 3px rgba(255, 248, 210, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  transition: transform 90ms ease, filter 120ms ease;
  touch-action: manipulation;
}

.v5g-knob-btn::before {
  content: '';
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  background: radial-gradient(circle at 36% 30%, #ffeab0 0%, #c68a2b 55%, #6b4310 100%);
  border: 1.5px solid #fff0bc;
  box-shadow:
    inset 0 2px 4px rgba(255, 248, 215, 0.65),
    inset 0 -3px 5px rgba(56, 32, 5, 0.8);
}

.v5g-knob-btn span {
  position: relative;
  z-index: 1;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 800;
  font-size: 16px;
  color: #2f1b05;
  text-shadow: 0 1px 0 rgba(255, 239, 184, 0.72);
  letter-spacing: -0.02em;
}

.v5g-knob-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.v5g-knob-btn:active:not(:disabled),
.v5g-knob-btn.is-pressed {
  transform: scale(0.93) rotate(-9deg);
}

.v5g-knob-btn.is-plus:active:not(:disabled),
.v5g-knob-btn.is-plus.is-pressed {
  transform: scale(0.93) rotate(9deg);
}

.v5g-knob-btn:disabled {
  opacity: 0.56;
  cursor: default;
  filter: saturate(0.65);
}

.v5g-knob-fine-left {
  left: 4.5%;
  bottom: 5.5%;
}

.v5g-knob-fine-right {
  right: 4.5%;
  bottom: 5.5%;
}

/* Optional coarse -10 / +10 satellite knurled knobs when span > 150 */
.v5g-knob-coarse {
  width: 40px;
  height: 40px;
  z-index: 6;
}

.v5g-knob-coarse::before {
  inset: 4px;
}

.v5g-knob-coarse span {
  font-size: 11.5px;
}

.v5g-knob-coarse-left {
  left: 0%;
  bottom: 24.5%;
}

.v5g-knob-coarse-right {
  right: 0%;
  bottom: 24.5%;
}

/* Dial Reveal Verdict Strip (appears cleanly on reveal) */
.v5g-dial-reveal-strip {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 5px 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, #1b2844 0%, #0d162a 100%);
  border: 1.5px solid #e3b24c;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55);
  font-size: 12.5px;
  font-weight: 700;
  color: #fff2cc;
}

.v5g-dial-reveal-strip.is-visible {
  display: inline-flex;
}

.v5g-dial-reveal-strip.is-bullseye {
  border-color: #ffd54f;
  background: linear-gradient(180deg, #4b340a 0%, #241703 100%);
  color: #ffea9e;
}

.v5g-dial-reveal-strip.is-win {
  border-color: #36f29c;
  background: linear-gradient(180deg, #0c4430 0%, #062419 100%);
  color: #b4ffdc;
}

.v5g-dial-reveal-strip.is-miss {
  border-color: #f06772;
  background: linear-gradient(180deg, #47151d 0%, #24090e 100%);
  color: #ffd2d6;
}

/* Sculpted Gold LOCK DIAL T-Plunger Lever */
.v5g-plunger-mount {
  position: relative;
  width: min(100%, 300px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 2px;
}

.v5g-plunger-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  touch-action: manipulation;
}

.v5g-plunger-btn:focus-visible {
  outline: 2px solid #ffd86b;
  outline-offset: 4px;
  border-radius: 10px;
}

.v5g-plunger-handle {
  position: relative;
  width: 96px;
  height: 17px;
  border-radius: 9px;
  background: linear-gradient(180deg, #fff5c4 0%, #dfa63f 42%, #805212 85%, #bc8428 100%);
  border: 1.5px solid #593608;
  box-shadow:
    0 5px 10px rgba(0, 0, 0, 0.65),
    inset 0 2px 2px rgba(255, 252, 232, 0.9);
  transition: transform 130ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 3;
}

.v5g-plunger-handle::before,
.v5g-plunger-handle::after {
  content: '';
  position: absolute;
  top: 2px;
  bottom: 2px;
  width: 5px;
  border-radius: 3px;
  background: linear-gradient(180deg, #fff2a8 0%, #ff9d1c 50%, #ffcb47 100%);
  box-shadow: 0 0 8px rgba(255, 174, 38, 0.95);
}

.v5g-plunger-handle::before {
  left: 11px;
}

.v5g-plunger-handle::after {
  right: 11px;
}

.v5g-plunger-shaft {
  width: 24px;
  height: 12px;
  margin-top: -2px;
  background: linear-gradient(90deg, #5e3b0d 0%, #f5ce74 36%, #fff1ba 52%, #b0781f 74%, #4f2f08 100%);
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.55);
  transition: transform 130ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 2;
}

.v5g-plunger-housing {
  position: relative;
  min-width: 176px;
  height: 40px;
  margin-top: -2px;
  padding: 5px 18px;
  border-radius: 10px 10px 7px 7px;
  background: linear-gradient(180deg, #f3cc73 0%, #b77e23 45%, #69410d 100%);
  border: 1.5px solid #4d2e07;
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.72),
    inset 0 1px 1px rgba(255, 248, 212, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  z-index: 3;
}

.v5g-plunger-lightbar {
  width: 6px;
  height: 24px;
  border-radius: 3px;
  background: linear-gradient(180deg, #fff5b8 0%, #ffaa24 55%, #e86b08 100%);
  box-shadow:
    0 0 9px rgba(255, 176, 38, 0.95),
    inset 0 1px 1px #ffffff;
}

.v5g-plunger-plate {
  padding: 5px 16px;
  border-radius: 6px;
  background: linear-gradient(180deg, #32210d 0%, #1c1105 60%, #2a1a08 100%);
  border: 1.5px solid #f0c76b;
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.86),
    0 0 10px rgba(255, 186, 62, 0.28);
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 14.5px;
  letter-spacing: 0.08em;
  color: #ffe9a8;
  text-shadow: 0 0 10px rgba(255, 198, 72, 0.55);
  white-space: nowrap;
}

.v5g-plunger-base {
  width: 244px;
  height: 10px;
  margin-top: -3px;
  border-radius: 4px 4px 12px 12px;
  background: linear-gradient(180deg, #d7a041 0%, #805214 60%, #422707 100%);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.72);
  z-index: 1;
}

.v5g-plunger-btn:hover:not(:disabled) .v5g-plunger-plate {
  color: #fff6d2;
  border-color: #ffe591;
  box-shadow:
    inset 0 2px 5px rgba(0, 0, 0, 0.8),
    0 0 16px rgba(255, 206, 86, 0.55);
}

.v5g-plunger-btn:active:not(:disabled) .v5g-plunger-handle,
.v5g-plunger-btn.is-plunged .v5g-plunger-handle {
  transform: translateY(7px);
}

.v5g-plunger-btn:active:not(:disabled) .v5g-plunger-shaft,
.v5g-plunger-btn.is-plunged .v5g-plunger-shaft {
  transform: translateY(5px);
}

.v5g-plunger-btn.is-plunged .v5g-plunger-lightbar {
  background: linear-gradient(180deg, #c6ffe4 0%, #2ef29a 55%, #0c9c59 100%);
  box-shadow: 0 0 11px rgba(46, 242, 154, 0.95);
}

.v5g-plunger-btn:disabled {
  cursor: default;
}

/* ==========================================================================
   2. MATCH_4 — Mahogany & Riveted Brass Stage Switchboard
   ========================================================================== */

.v5g-mahogany-frame {
  position: relative;
  width: 100%;
  border-radius: 12px;
  padding: 5px;
  background: linear-gradient(145deg, #f3cf7b 0%, #9b681d 28%, #5e380c 52%, #d59d3d 78%, #6d4410 100%);
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.76),
    inset 0 1px 1px rgba(255, 249, 218, 0.85);
}

.v5g-mahogany-board {
  position: relative;
  width: 100%;
  border-radius: 8px;
  background:
    radial-gradient(ellipse at 50% 0%, rgba(255, 198, 96, 0.22) 0%, rgba(255, 198, 96, 0) 56%),
    repeating-linear-gradient(
      90deg,
      rgba(96, 36, 17, 0.34) 0px,
      rgba(56, 17, 8, 0.44) 6px,
      rgba(112, 42, 19, 0.22) 13px,
      rgba(44, 12, 5, 0.5) 21px
    ),
    linear-gradient(180deg, #4b1d10 0%, #2f1008 55%, #200904 100%);
  border: 1.5px solid #2a0e06;
  box-shadow:
    inset 0 0 22px rgba(0, 0, 0, 0.72),
    inset 0 1px 0 rgba(255, 214, 140, 0.22);
  overflow: visible;
}

/* 4 Riveted Brass Corner L-Brackets */
.v5g-corner-bracket {
  position: absolute;
  width: 24px;
  height: 24px;
  pointer-events: none;
  z-index: 8;
}

.v5g-corner-tl { top: -2px; left: -2px; }
.v5g-corner-tr { top: -2px; right: -2px; transform: scaleX(-1); }
.v5g-corner-bl { bottom: -2px; left: -2px; transform: scaleY(-1); }
.v5g-corner-br { bottom: -2px; right: -2px; transform: scale(-1); }

/* Switchboard Arena Grid */
.v5g-match-arena {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(112px, 0.92fr) minmax(0, 1.08fr);
  align-items: stretch;
  padding: 14px 12px 16px;
  gap: 0;
  touch-action: none;
}

.v5g-match-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 6;
  overflow: visible;
}

.v5g-match-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  position: relative;
  z-index: 4;
}

.v5g-match-row-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.v5g-match-row-wrap.is-left {
  flex-direction: row;
}

.v5g-match-row-wrap.is-right {
  flex-direction: row-reverse;
}

.v5g-match-plaque {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 58px;
  padding: 8px 13px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #fce8b2;
  touch-action: none;
  transition: transform 110ms ease, filter 130ms ease;
}

.v5g-match-plaque:focus-visible {
  outline: 2px solid #ffe27a;
  outline-offset: 2px;
  border-radius: 6px;
}

.v5g-plaque-svg-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  filter: drop-shadow(0 5px 8px rgba(0, 0, 0, 0.65));
}

.v5g-plaque-label {
  position: relative;
  z-index: 2;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: clamp(11.5px, 2.5vw, 15px);
  line-height: 1.18;
  color: #fce9b8;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
  overflow-wrap: break-word;
  word-break: normal;
  max-width: 100%;
}

.v5g-plaque-correction {
  position: relative;
  z-index: 2;
  margin-top: 3px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(24, 12, 4, 0.88);
  border: 1px solid #f5c65c;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #ffe391;
  line-height: 1.2;
}

.v5g-match-plaque:hover:not(:disabled) {
  filter: brightness(1.1);
}

.v5g-match-plaque.is-active-pick {
  transform: scale(1.03);
  filter: brightness(1.22) drop-shadow(0 0 10px rgba(255, 214, 92, 0.72));
}

.v5g-match-plaque.is-drop-target {
  transform: scale(1.04);
  filter: brightness(1.25) drop-shadow(0 0 12px rgba(64, 240, 255, 0.8));
}

.v5g-match-plaque.is-correct .v5g-plaque-svg-bg {
  filter: drop-shadow(0 0 10px rgba(46, 242, 154, 0.72));
}

.v5g-match-plaque.is-wrong .v5g-plaque-svg-bg {
  filter: drop-shadow(0 0 9px rgba(242, 86, 102, 0.72));
}

.v5g-match-plaque:disabled {
  cursor: default;
}

/* Protruding 3D Brass Plug Socket */
.v5g-socket-btn {
  position: relative;
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  margin: 0 -2px;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: none;
  transition: transform 110ms ease;
}

.v5g-socket-btn svg {
  width: 32px;
  height: 32px;
  display: block;
  overflow: visible;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.7));
}

.v5g-socket-btn.is-active-pick {
  transform: scale(1.14);
}

.v5g-socket-btn.is-drop-target {
  transform: scale(1.18);
}

/* Bottom Knurled Brass LOCK 4 CABLES Drum Switch + Unplug Latch */
.v5g-switchboard-footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: -10px;
  padding: 0 10px 4px;
  z-index: 9;
}

.v5g-drum-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  transition: transform 110ms ease, filter 140ms ease;
}

.v5g-drum-btn:focus-visible {
  outline: 2px solid #ffe080;
  outline-offset: 4px;
  border-radius: 10px;
}

.v5g-drum-wheel {
  width: 18px;
  height: 44px;
  border-radius: 5px;
  background: repeating-linear-gradient(
    180deg,
    #fff1b8 0px,
    #d89d3b 2px,
    #5f3a0b 4px,
    #a56e1d 6px
  );
  border: 1.5px solid #492a06;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.72),
    inset 0 1px 1px rgba(255, 250, 224, 0.8);
}

.v5g-drum-body {
  position: relative;
  min-width: 168px;
  padding: 5px 10px 6px;
  border-radius: 11px;
  background: linear-gradient(180deg, #f8d888 0%, #c68a2b 32%, #6d430d 84%, #a8711e 100%);
  border: 1.5px solid #4d2d06;
  box-shadow:
    0 9px 18px rgba(0, 0, 0, 0.78),
    inset 0 2px 2px rgba(255, 250, 220, 0.85);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.v5g-drum-leds {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.v5g-drum-led {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #231407;
  border: 1px solid #6b4514;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.85);
  transition: background-color 160ms ease, box-shadow 160ms ease;
}

.v5g-drum-led.is-lit {
  border-color: #fff6d1;
}

.v5g-drum-faceplate {
  width: 100%;
  padding: 6px 14px;
  border-radius: 7px;
  background: linear-gradient(180deg, #106950 0%, #094534 55%, #062b21 100%);
  border: 1.5px solid #f0c76b;
  box-shadow:
    inset 0 2px 4px rgba(130, 255, 212, 0.25),
    inset 0 -3px 6px rgba(0, 0, 0, 0.65);
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.06em;
  color: #ffe599;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.85);
  text-align: center;
  line-height: 1.1;
  white-space: nowrap;
}

.v5g-drum-btn:disabled {
  cursor: not-allowed;
  filter: saturate(0.55) brightness(0.84);
}

.v5g-drum-btn:not(:disabled) .v5g-drum-faceplate {
  box-shadow:
    inset 0 2px 6px rgba(120, 255, 206, 0.42),
    0 0 14px rgba(46, 242, 154, 0.42);
  color: #fff4c4;
}

.v5g-drum-btn:hover:not(:disabled) {
  filter: brightness(1.09);
}

.v5g-drum-btn:active:not(:disabled),
.v5g-drum-btn.is-locked {
  transform: translateY(2px) scale(0.98);
}

.v5g-unplug-btn {
  position: relative;
  height: 36px;
  padding: 0 11px;
  border-radius: 7px;
  background: linear-gradient(180deg, #714a1e 0%, #42270c 55%, #2a1706 100%);
  border: 1.5px solid #c9923a;
  box-shadow:
    0 5px 12px rgba(0, 0, 0, 0.65),
    inset 0 1px 0 rgba(255, 232, 166, 0.45);
  color: #f6d98f;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  touch-action: manipulation;
  transition: transform 90ms ease, filter 120ms ease;
}

.v5g-unplug-btn:hover:not(:disabled) {
  filter: brightness(1.16);
}

.v5g-unplug-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.96);
}

.v5g-unplug-btn:disabled {
  opacity: 0.44;
  cursor: default;
}

/* ==========================================================================
   3. SORT_4 — Mahogany & Brass Chronology Slotted Track
   ========================================================================== */

.v5g-sort-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 14px 7px;
  background: linear-gradient(180deg, #5d3a12 0%, #372009 55%, #251405 100%);
  border-bottom: 1.5px solid #c99238;
  border-radius: 7px 7px 0 0;
  box-shadow: inset 0 1px 0 rgba(255, 235, 174, 0.35);
}

.v5g-sort-axis-tag {
  flex: 0 0 auto;
  padding: 2px 8px;
  border-radius: 4px;
  background: linear-gradient(180deg, #f3ca6e 0%, #b57b1e 100%);
  color: #211204;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 10.5px;
  letter-spacing: 0.04em;
  box-shadow: inset 0 1px 0 rgba(255, 250, 224, 0.75);
}

.v5g-sort-axis-title {
  flex: 1 1 auto;
  min-width: 0;
  text-align: center;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: clamp(11px, 2.7vw, 13.5px);
  color: #ffe7a4;
  letter-spacing: 0.04em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.v5g-sort-track-area {
  position: relative;
  padding: 12px 12px 16px;
}

/* Recessed Vertical Machined-Brass Slotted Track Guide behind plaques */
.v5g-sort-rail {
  position: absolute;
  top: 12px;
  bottom: 16px;
  left: 33px;
  width: 14px;
  border-radius: 7px;
  background: linear-gradient(90deg, #1b0b04 0%, #7d5218 22%, #311a08 50%, #a57022 78%, #1a0a04 100%);
  border: 1px solid rgba(242, 198, 102, 0.45);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.88);
  pointer-events: none;
  z-index: 1;
}

.v5g-sort-list {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 9px;
  z-index: 3;
}

.v5g-sort-plaque {
  position: relative;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 56px;
  padding: 6px 8px 6px 7px;
  border-radius: 9px;
  background: linear-gradient(180deg, #115c47 0%, #0a3c2f 55%, #072920 100%);
  border: 2px solid #d59d3d;
  box-shadow:
    0 6px 12px rgba(0, 0, 0, 0.62),
    inset 0 1px 0 rgba(255, 240, 184, 0.52),
    inset 0 0 0 1px rgba(10, 26, 20, 0.72);
  cursor: grab;
  touch-action: none;
  transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
}

.v5g-sort-plaque:hover:not(.is-locked) {
  border-color: #ffe28a;
  filter: brightness(1.07);
}

.v5g-sort-plaque.is-dragging {
  cursor: grabbing;
  z-index: 12;
  transform: scale(1.025);
  border-color: #fff0ad;
  box-shadow:
    0 14px 26px rgba(0, 0, 0, 0.8),
    0 0 16px rgba(255, 212, 92, 0.58),
    inset 0 1px 0 rgba(255, 248, 214, 0.8);
}

.v5g-sort-plaque.is-locked {
  cursor: default;
}

.v5g-sort-plaque.is-correct {
  background: linear-gradient(180deg, #127051 0%, #094a34 100%);
  border-color: #46f5a4;
  box-shadow: 0 0 14px rgba(46, 242, 154, 0.45), 0 6px 12px rgba(0, 0, 0, 0.62);
}

.v5g-sort-plaque.is-wrong {
  background: linear-gradient(180deg, #651c27 0%, #3d0f17 100%);
  border-color: #f4727d;
  box-shadow: 0 0 12px rgba(244, 114, 125, 0.42), 0 6px 12px rgba(0, 0, 0, 0.62);
}

.v5g-sort-rank-badge {
  flex: 0 0 auto;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 28%, #fff1b8 0%, #d49936 56%, #74480e 100%);
  border: 1.5px solid #492a06;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.62),
    inset 0 1px 1px rgba(255, 250, 224, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 800;
  font-size: 13px;
  color: #241304;
}

.v5g-sort-grip {
  flex: 0 0 auto;
  width: 12px;
  height: 28px;
  border-radius: 3px;
  background: repeating-linear-gradient(
    180deg,
    #f2cb72 0px,
    #f2cb72 2px,
    #523209 2px,
    #523209 5px
  );
  opacity: 0.78;
}

.v5g-sort-copy {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.v5g-sort-label {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: clamp(12px, 3vw, 15px);
  line-height: 1.2;
  color: #fce9b8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.82);
  overflow-wrap: break-word;
}

.v5g-sort-reveal-pill {
  display: none;
  align-self: flex-start;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(20, 10, 4, 0.86);
  border: 1px solid #f0c25d;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  color: #ffe394;
}

.v5g-sort-reveal-pill.is-visible {
  display: inline-block;
}

.v5g-sort-latches {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 5px;
}

.v5g-latch-btn {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  border: 1.5px solid #4c2d06;
  background: linear-gradient(180deg, #fae096 0%, #c98f2e 52%, #7d4e11 100%);
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 250, 224, 0.85);
  color: #261404;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  touch-action: manipulation;
  transition: transform 80ms ease, filter 110ms ease;
}

.v5g-latch-btn:hover:not(:disabled) {
  filter: brightness(1.12);
}

.v5g-latch-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.93);
}

.v5g-latch-btn:disabled {
  opacity: 0.36;
  cursor: default;
  filter: saturate(0.5);
}

/* Sculpted Gold LOCK ORDER Stage Lever */
.v5g-lever-footer {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -10px;
  padding-bottom: 4px;
  z-index: 9;
}

.v5g-gold-lever-btn {
  position: relative;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  transition: transform 110ms ease, filter 130ms ease;
}

.v5g-gold-lever-btn:focus-visible {
  outline: 2px solid #ffe48a;
  outline-offset: 4px;
  border-radius: 10px;
}

.v5g-gold-lever-housing {
  position: relative;
  min-width: 210px;
  height: 46px;
  padding: 6px 18px;
  border-radius: 10px;
  background: linear-gradient(180deg, #fff0b4 0%, #dfa43c 38%, #855413 84%, #be8426 100%);
  border: 1.5px solid #4e2e06;
  box-shadow:
    0 9px 18px rgba(0, 0, 0, 0.78),
    inset 0 2px 2px rgba(255, 252, 228, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 11px;
}

.v5g-gold-lever-plate {
  padding: 5px 18px;
  border-radius: 6px;
  background: linear-gradient(180deg, #2e1d0a 0%, #170e04 60%, #271707 100%);
  border: 1.5px solid #f7d176;
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.86),
    0 0 12px rgba(255, 198, 72, 0.35);
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 14.5px;
  letter-spacing: 0.08em;
  color: #ffecac;
  text-shadow: 0 0 10px rgba(255, 198, 72, 0.55);
  white-space: nowrap;
}

.v5g-gold-lever-btn:hover:not(:disabled) {
  filter: brightness(1.08);
}

.v5g-gold-lever-btn:active:not(:disabled),
.v5g-gold-lever-btn.is-locked {
  transform: translateY(2px) scale(0.98);
}

.v5g-gold-lever-btn.is-locked .v5g-plunger-lightbar {
  background: linear-gradient(180deg, #c6ffe4 0%, #2ef29a 55%, #0c9c59 100%);
  box-shadow: 0 0 11px rgba(46, 242, 154, 0.95);
}

.v5g-gold-lever-btn:disabled {
  cursor: default;
}

/* ==========================================================================
   MOBILE PORTRAIT TUNING (390x844 & 360x640 — 100% ABOVE y=844px, 0px H-OVERFLOW!)
   ========================================================================== */

@media (max-width: 480px) {
  .v5g-root {
    gap: 5px;
  }

  .v5g-dial-stage {
    width: min(100%, 296px);
  }

  .v5g-nixie-bezel {
    padding: 3px 5px;
    border-radius: 10px;
  }

  .v5g-nixie-window {
    gap: 2px;
    padding: 2px 5px;
  }

  .v5g-nixie-tube {
    min-width: 18px;
    height: 26px;
    font-size: 18px;
  }

  .v5g-nixie-tube.is-compact {
    min-width: 14px;
    height: 23px;
    font-size: 15px;
  }

  .v5g-knob-btn {
    width: 48px;
    height: 48px;
  }

  .v5g-knob-btn span {
    font-size: 14px;
  }

  .v5g-knob-fine-left {
    left: 3.5%;
    bottom: 5%;
  }

  .v5g-knob-fine-right {
    right: 3.5%;
    bottom: 5%;
  }

  .v5g-knob-coarse {
    width: 36px;
    height: 36px;
  }

  .v5g-knob-coarse span {
    font-size: 10.5px;
  }

  .v5g-knob-coarse-left {
    left: 0%;
    bottom: 23.5%;
  }

  .v5g-knob-coarse-right {
    right: 0%;
    bottom: 23.5%;
  }

  .v5g-plunger-handle {
    width: 82px;
    height: 15px;
  }

  .v5g-plunger-shaft {
    height: 9px;
  }

  .v5g-plunger-housing {
    min-width: 162px;
    height: 36px;
    padding: 4px 14px;
  }

  .v5g-plunger-plate {
    padding: 4px 13px;
    font-size: 13px;
  }

  .v5g-plunger-base {
    width: 210px;
    height: 8px;
  }

  /* Match-4 mobile portrait: generous plaques + crisp center cable channel */
  .v5g-match-arena {
    grid-template-columns: minmax(0, 1.15fr) minmax(72px, 0.72fr) minmax(0, 1.15fr);
    padding: 10px 7px 14px;
  }

  .v5g-match-col {
    gap: 8px;
  }

  .v5g-match-plaque {
    min-height: 52px;
    padding: 6px 8px;
  }

  .v5g-plaque-label {
    font-size: clamp(10.5px, 2.95vw, 13px);
    line-height: 1.15;
  }

  .v5g-socket-btn {
    width: 26px;
    height: 26px;
    margin: 0 -2px;
  }

  .v5g-socket-btn svg {
    width: 26px;
    height: 26px;
  }

  .v5g-drum-wheel {
    width: 14px;
    height: 38px;
  }

  .v5g-drum-body {
    min-width: 148px;
    padding: 4px 8px 5px;
  }

  .v5g-drum-faceplate {
    padding: 5px 10px;
    font-size: 12.5px;
  }

  .v5g-unplug-btn {
    height: 32px;
    padding: 0 8px;
    font-size: 10px;
  }

  /* Sort-4 mobile portrait */
  .v5g-sort-header {
    padding: 6px 9px;
    gap: 5px;
  }

  .v5g-sort-axis-tag {
    padding: 2px 6px;
    font-size: 9.5px;
  }

  .v5g-sort-track-area {
    padding: 9px 8px 13px;
  }

  .v5g-sort-rail {
    left: 26px;
    width: 12px;
  }

  .v5g-sort-list {
    gap: 7px;
  }

  .v5g-sort-plaque {
    min-height: 50px;
    padding: 5px 6px 5px 6px;
    gap: 6px;
  }

  .v5g-sort-rank-badge {
    width: 28px;
    height: 28px;
    font-size: 11.5px;
  }

  .v5g-sort-grip {
    width: 9px;
    height: 24px;
  }

  .v5g-sort-label {
    font-size: clamp(11.5px, 3.2vw, 13.5px);
  }

  .v5g-latch-btn {
    width: 30px;
    height: 30px;
  }

  .v5g-gold-lever-housing {
    min-width: 184px;
    height: 40px;
    padding: 5px 14px;
  }

  .v5g-gold-lever-plate {
    padding: 4px 14px;
    font-size: 13px;
  }
}

@media (max-width: 365px) {
  .v5g-dial-stage {
    width: min(100%, 268px);
  }

  .v5g-match-arena {
    grid-template-columns: minmax(0, 1.18fr) minmax(60px, 0.62fr) minmax(0, 1.18fr);
    padding: 8px 5px 12px;
  }

  .v5g-match-plaque {
    min-height: 48px;
    padding: 5px 6px;
  }
}

/* ==========================================================================
   PHONE LANDSCAPE TUNING (844x390, 932x430, 640x360 — ZERO CLIPPING!)
   Designed to sit crisply inside the right half of a 2-column split-stage!
   ========================================================================== */

@media (max-height: 500px) and (orientation: landscape) {
  .v5g-root {
    gap: 4px;
    max-width: 100%;
  }

  .v5g-hint-slip {
    padding: 4px 10px;
    font-size: 11px;
  }

  /* Pinpoint Dial compact landscape fit (total height ~248px <= 360px!) */
  .v5g-dial-shell {
    gap: 2px;
    max-width: 340px;
  }

  .v5g-dial-stage {
    width: min(100%, 236px);
  }

  .v5g-nixie-bezel {
    padding: 2px 4px;
    border-radius: 8px;
  }

  .v5g-nixie-window {
    gap: 2px;
    padding: 2px 4px;
  }

  .v5g-nixie-tube {
    min-width: 15px;
    height: 22px;
    font-size: 15px;
  }

  .v5g-nixie-tube.is-compact {
    min-width: 12px;
    height: 19px;
    font-size: 13px;
  }

  .v5g-nixie-unit {
    font-size: 8px;
    padding: 0 5px;
  }

  .v5g-knob-btn {
    width: 40px;
    height: 40px;
  }

  .v5g-knob-btn span {
    font-size: 12px;
  }

  .v5g-knob-coarse {
    width: 32px;
    height: 32px;
  }

  .v5g-knob-coarse span {
    font-size: 10px;
  }

  .v5g-plunger-mount {
    padding-top: 0;
  }

  .v5g-plunger-handle {
    width: 72px;
    height: 12px;
  }

  .v5g-plunger-shaft {
    width: 18px;
    height: 7px;
  }

  .v5g-plunger-housing {
    min-width: 146px;
    height: 30px;
    padding: 3px 12px;
    gap: 7px;
  }

  .v5g-plunger-lightbar {
    width: 5px;
    height: 18px;
  }

  .v5g-plunger-plate {
    padding: 3px 11px;
    font-size: 11.5px;
  }

  .v5g-plunger-base {
    width: 180px;
    height: 6px;
  }

  /* Match-4 compact landscape fit (total height ~236px <= 360px!) */
  .v5g-mahogany-frame {
    padding: 4px;
  }

  .v5g-corner-bracket {
    width: 18px;
    height: 18px;
  }

  .v5g-match-arena {
    grid-template-columns: minmax(0, 1.12fr) minmax(68px, 0.72fr) minmax(0, 1.12fr);
    padding: 7px 7px 11px;
  }

  .v5g-match-col {
    gap: 5px;
  }

  .v5g-match-plaque {
    min-height: 40px;
    padding: 4px 8px;
  }

  .v5g-plaque-label {
    font-size: 11px;
    line-height: 1.12;
  }

  .v5g-socket-btn {
    width: 24px;
    height: 24px;
  }

  .v5g-socket-btn svg {
    width: 24px;
    height: 24px;
  }

  .v5g-switchboard-footer {
    margin-top: -8px;
    gap: 7px;
  }

  .v5g-drum-wheel {
    width: 12px;
    height: 32px;
  }

  .v5g-drum-body {
    min-width: 136px;
    padding: 3px 7px 4px;
    gap: 2px;
  }

  .v5g-drum-led {
    width: 6px;
    height: 6px;
  }

  .v5g-drum-faceplate {
    padding: 4px 9px;
    font-size: 11px;
  }

  .v5g-unplug-btn {
    height: 28px;
    padding: 0 8px;
    font-size: 9.5px;
  }

  /* Sort-4 compact landscape fit (total height ~246px <= 360px!) */
  .v5g-sort-header {
    padding: 5px 8px;
  }

  .v5g-sort-axis-tag {
    padding: 1px 6px;
    font-size: 9px;
  }

  .v5g-sort-axis-title {
    font-size: 11px;
  }

  .v5g-sort-track-area {
    padding: 7px 8px 11px;
  }

  .v5g-sort-rail {
    top: 7px;
    bottom: 11px;
    left: 24px;
    width: 10px;
  }

  .v5g-sort-list {
    gap: 5px;
  }

  .v5g-sort-plaque {
    min-height: 40px;
    padding: 4px 6px;
    gap: 6px;
  }

  .v5g-sort-rank-badge {
    width: 25px;
    height: 25px;
    font-size: 10.5px;
  }

  .v5g-sort-grip {
    width: 8px;
    height: 20px;
  }

  .v5g-sort-label {
    font-size: 11.5px;
    line-height: 1.12;
  }

  .v5g-latch-btn {
    width: 27px;
    height: 27px;
  }

  .v5g-lever-footer {
    margin-top: -8px;
  }

  .v5g-gold-lever-housing {
    min-width: 164px;
    height: 34px;
    padding: 4px 12px;
  }

  .v5g-gold-lever-plate {
    padding: 3px 12px;
    font-size: 11.5px;
  }
}
`;function Te(){if(typeof document>"u"||document.getElementById(st))return;const t=document.createElement("style");t.id=st,t.textContent=ht,document.head.appendChild(t)}function se(t,y){return`
    <svg class="v5g-corner-bracket ${t}" viewBox="0 0 28 28" aria-hidden="true">
      <path d="M 1 1 L 26 1 L 26 7 L 11 7 Q 7 7 7 11 L 7 26 L 1 26 Z" fill="url(#${y}-brass-bevel)" stroke="#3f2406" stroke-width="1.2"/>
      <circle cx="5.8" cy="5.8" r="2.2" fill="#ffeaa2" stroke="#4a2b07" stroke-width="0.9"/>
      <circle cx="19.5" cy="4.2" r="1.5" fill="#f5cc6c" stroke="#4a2b07" stroke-width="0.8"/>
      <circle cx="4.2" cy="19.5" r="1.5" fill="#f5cc6c" stroke="#4a2b07" stroke-width="0.8"/>
    </svg>
  `}function lt(t){return`
    <svg class="v5g-plaque-svg-bg" viewBox="0 0 180 68" preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M 16 3 L 76 3 L 90 1 L 104 3 L 164 3 A 12 12 0 0 0 177 16 L 177 52 A 12 12 0 0 0 164 65 L 104 65 L 90 67 L 76 65 L 16 65 A 12 12 0 0 0 3 52 L 3 16 A 12 12 0 0 0 16 3 Z"
        fill="url(#${t}-brass-bevel)"
        stroke="#432606"
        stroke-width="1.6"
      />
      <path
        d="M 18 7 L 162 7 A 10 10 0 0 0 172 17 L 172 51 A 10 10 0 0 0 162 61 L 18 61 A 10 10 0 0 0 8 51 L 8 17 A 10 10 0 0 0 18 7 Z"
        fill="url(#${t}-emerald-enamel)"
        stroke="#f3cc71"
        stroke-width="1.2"
      />
      <path
        d="M 22 10.5 L 158 10.5 A 7 7 0 0 0 168 19 L 168 49 A 7 7 0 0 0 158 57.5 L 22 57.5 A 7 7 0 0 0 12 49 L 12 19 A 7 7 0 0 0 22 10.5 Z"
        fill="none"
        stroke="rgba(255, 229, 150, 0.36)"
        stroke-width="0.9"
      />
      <circle cx="90" cy="4.2" r="1.8" fill="#fff1ba"/>
      <circle cx="90" cy="63.8" r="1.8" fill="#fff1ba"/>
    </svg>
  `}function dt(t,y){return`
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="${y==="left"?14:2}" y="8" width="16" height="16" rx="4" fill="url(#${t}-brass-bevel)" stroke="#3d2205" stroke-width="1.2"/>
      <circle cx="16" cy="16" r="12.5" fill="url(#${t}-socket-flange)" stroke="#3e2306" stroke-width="1.3"/>
      <circle cx="16" cy="16" r="9" fill="url(#${t}-brass-bevel)" stroke="#fff0b8" stroke-opacity="0.65" stroke-width="1"/>
      <circle class="v5g-socket-ring" cx="16" cy="16" r="7.2" fill="none" stroke="rgba(255,220,128,0.35)" stroke-width="2.2"/>
      <circle cx="16" cy="16" r="4.8" fill="#170b04" stroke="#7d5216" stroke-width="1.1"/>
      <circle class="v5g-socket-core" cx="16" cy="16" r="2.1" fill="#462809"/>
    </svg>
  `}function pt(t){return t==="up"?'<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M 8 3.2 L 13.6 11.8 L 2.4 11.8 Z" fill="currentColor"/></svg>':'<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><path d="M 8 12.8 L 13.6 4.2 L 2.4 4.2 Z" fill="currentColor"/></svg>'}function vt(){return'<svg width="13" height="13" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 3v4M12 3v4M4 7h10v2.5a5 5 0 0 1-10 0V7zM9 14.5V17"/></svg>'}function Ye(t,y){return Te(),t.innerHTML=`<div class="v5g-root"><div class="v5g-hint-slip is-open"><span class="v5g-hint-tag">STAGE</span><span class="v5g-hint-text">${S(y)}</span></div></div>`,{revealHint:()=>{},showGadgetReveal:()=>{},lockForTimeout:()=>({format:"PINPOINT_DIAL",elapsedSec:0,timedOut:!0}),getCurrentSubmission:()=>({format:"PINPOINT_DIAL",elapsedSec:0}),dispose:()=>{t.innerHTML=""}}}const J=-135,de=135,Ge=de-J,c=210,u=186;function mt(t,y,l){Te();const s=y.pinpoint;if(!s)return Ye(t,"Pinpoint calibration spec unavailable for this card.");const a=He("v5dial"),P=l.startedAtMs??performance.now(),g=s.minVal,x=Math.max(s.minVal+(s.step||1),s.maxVal),p=s.step>0&&Number.isFinite(s.step)?s.step:1,$=Math.max(p,x-g),E=p,z=$>150&&E*10<$,W=E*10;let d=Ae(g+$*.22,g,x,p);Math.abs(d-s.exactVal)<=Math.max(s.winRadius*1.4,p*2)&&(d=Ae(g+$*.78,g,x,p));let B=!1,Q=!1,K=null,oe=0,_=!1,ee=null,ae=null;const Y=r=>{const h=Math.max(0,Math.min(1,(r-g)/$));return J+h*Ge},j=r=>{const w=(Math.max(J,Math.min(de,r))-J)/Ge;return Ae(g+w*$,g,x,p)},V=[],U=40;for(let r=0;r<=U;r+=1){const h=r/U,w=J+h*Ge,N=r%10===0,M=!N&&r%5===0,H=140,Z=G(c,u,N?127:M?131:134.5,w),D=G(c,u,H,w),be=N?"#ffe7a0":M?"#d7ae5b":"rgba(229, 192, 114, 0.56)",Be=N?2.6:M?1.65:1.05;V.push(`<line x1="${Z.x.toFixed(2)}" y1="${Z.y.toFixed(2)}" x2="${D.x.toFixed(2)}" y2="${D.y.toFixed(2)}" stroke="${be}" stroke-width="${Be}" stroke-linecap="round"/>`)}const b=[0,.25,.5,.75,1],k="paint-order:stroke;stroke:#071328;stroke-width:4.5px;stroke-linejoin:round;",v=b.map((r,h)=>{const w=g+r*$,N=Ae(w,g,x,p),M=le(N,s.unitLabel,g,x,!1),F=M.length>=5?12.8:15;if(h===0)return`<text x="111" y="246" text-anchor="middle" fill="#f7e2a8" style="${k}" font-family="Inter, sans-serif" font-weight="700" font-size="${F}">${S(M)}</text>`;if(h===4)return`<text x="309" y="246" text-anchor="middle" fill="#f7e2a8" style="${k}" font-family="Inter, sans-serif" font-weight="700" font-size="${F}">${S(M)}</text>`;if(h===2)return`<text x="${c}" y="82" text-anchor="middle" fill="#fff0be" style="${k}" font-family="Inter, sans-serif" font-weight="800" font-size="${F+1}">${S(M)}</text>`;const Z=J+r*Ge,D=G(c,u,108,Z),be=h===1?-54:54;return`<text x="${D.x.toFixed(1)}" y="${D.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${be} ${D.x.toFixed(1)} ${D.y.toFixed(1)})" fill="#f7e2a8" style="${k}" font-family="Inter, sans-serif" font-weight="700" font-size="${F}">${S(M)}</text>`}).join(""),A=[14,21,28,35,42,48].map(r=>`<circle cx="${c}" cy="${u}" r="${r}" fill="none" stroke="rgba(255,244,200,0.16)" stroke-width="0.9"/>`).join(""),I=s.unitLabel.trim()?s.unitLabel.trim()==="C"?"°C":s.unitLabel.trim()==="F"?"°F":s.unitLabel.trim():"";t.innerHTML=`
    <div class="v5g-root" data-v5g-format="PINPOINT_DIAL">
      <div class="v5g-hint-slip" data-v5g-hint-slip role="status">
        <span class="v5g-hint-tag">CLUE</span>
        <span class="v5g-hint-text" data-v5g-hint-text></span>
      </div>

      <div class="v5g-dial-shell">
        <div class="v5g-dial-stage" data-v5g-dial-stage>
          <svg
            class="v5g-dial-svg"
            data-v5g-dial-svg
            viewBox="0 0 420 356"
            role="slider"
            tabindex="0"
            aria-label="Pinpoint Brass Analog Speedometer Dial"
            aria-valuemin="${g}"
            aria-valuemax="${x}"
            aria-valuenow="${d}"
          >
            <defs>
              <linearGradient id="${a}-brass-outer" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff4c4"/>
                <stop offset="22%" stop-color="#dfb04b"/>
                <stop offset="48%" stop-color="#7c4f13"/>
                <stop offset="76%" stop-color="#f2cb6d"/>
                <stop offset="100%" stop-color="#5d380a"/>
              </linearGradient>
              <linearGradient id="${a}-brass-inner" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stop-color="#fff0b6"/>
                <stop offset="45%" stop-color="#c3872a"/>
                <stop offset="100%" stop-color="#613b0c"/>
              </linearGradient>
              <linearGradient id="${a}-sapphire-ring" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stop-color="#4e94f7"/>
                <stop offset="35%" stop-color="#1d4ea1"/>
                <stop offset="75%" stop-color="#0e2a62"/>
                <stop offset="100%" stop-color="#091a3f"/>
              </linearGradient>
              <radialGradient id="${a}-dial-face" cx="50%" cy="44%" r="58%">
                <stop offset="0%" stop-color="#17305c"/>
                <stop offset="62%" stop-color="#0b1a36"/>
                <stop offset="100%" stop-color="#060f21"/>
              </radialGradient>
              <radialGradient id="${a}-spun-hub" cx="38%" cy="30%" r="72%">
                <stop offset="0%" stop-color="#f5d584"/>
                <stop offset="34%" stop-color="#b6812d"/>
                <stop offset="68%" stop-color="#784f18"/>
                <stop offset="100%" stop-color="#4a2e0a"/>
              </radialGradient>
              <linearGradient id="${a}-needle-gold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#a86d16"/>
                <stop offset="35%" stop-color="#ffefad"/>
                <stop offset="55%" stop-color="#ffffff"/>
                <stop offset="80%" stop-color="#e3a63b"/>
                <stop offset="100%" stop-color="#7d4c0c"/>
              </linearGradient>
              <filter id="${a}-emerald-glow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="4.5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="${a}-gold-glow" x="-35%" y="-35%" width="170%" height="170%">
                <feGaussianBlur stdDeviation="3.8" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="${a}-needle-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="2" dy="4" stdDeviation="3.2" flood-color="#02060f" flood-opacity="0.78"/>
              </filter>
              <path id="${a}-bullseye-text-arc" d="${me(c,u,75,-42,42)}"/>
            </defs>

            <!-- Outer Brushed-Brass Bezel & Sapphire Enamel Housing -->
            <circle cx="${c}" cy="${u}" r="172" fill="#2d1a05"/>
            <circle cx="${c}" cy="${u}" r="169" fill="url(#${a}-brass-outer)" stroke="#4c2c06" stroke-width="1.6"/>
            <circle cx="${c}" cy="${u}" r="161" fill="url(#${a}-sapphire-ring)" stroke="#fff0bd" stroke-opacity="0.45" stroke-width="1.2"/>
            <circle cx="${c}" cy="${u}" r="147" fill="url(#${a}-brass-inner)" stroke="#3e2306" stroke-width="1.4"/>
            <circle cx="${c}" cy="${u}" r="142" fill="url(#${a}-dial-face)" stroke="#23457e" stroke-opacity="0.55" stroke-width="1.2"/>

            <!-- Subtle Dial Face Glass Ring Highlights -->
            <path d="${me(c,u,154,-72,72)}" fill="none" stroke="rgba(196, 228, 255, 0.35)" stroke-width="2.2" stroke-linecap="round"/>

            <!-- Top 12-O'Clock Beveled Brass & Sapphire WIN ARC Cartouche -->
            <g data-v5g-win-badge>
              <rect x="148" y="18" width="124" height="26" rx="13" fill="url(#${a}-brass-outer)" stroke="#3d2205" stroke-width="1.3"/>
              <rect x="151.5" y="21.2" width="117" height="19.6" rx="9.8" fill="#0b2244" stroke="#f0c86d" stroke-opacity="0.55" stroke-width="1"/>
              <text
                data-v5g-win-badge-text
                x="${c}"
                y="35"
                text-anchor="middle"
                fill="#4effb0"
                font-family="Inter, sans-serif"
                font-weight="800"
                font-size="13.5"
                letter-spacing="0.08em"
                filter="url(#${a}-emerald-glow)"
              >WIN ARC</text>
            </g>

            <!-- Glowing Emerald WIN ARC & Inner Golden 2× BULLSEYE Tolerance Zones -->
            <g data-v5g-tolerance-layer>
              <!-- Soft Backlit Sector Bands -->
              <path data-v5g-win-sector fill="rgba(46, 242, 154, 0.1)" stroke="none"/>
              <path data-v5g-bull-sector fill="rgba(255, 206, 72, 0.14)" stroke="none"/>
              <!-- Outer Emerald WIN ARC Glow + Crisp Filament + Radial Gates -->
              <path data-v5g-win-arc-outer-glow fill="none" stroke="#1cf28f" stroke-opacity="0.34" stroke-width="12" stroke-linecap="round" filter="url(#${a}-emerald-glow)"/>
              <path data-v5g-win-arc-outer fill="none" stroke="#4effb2" stroke-width="3.2" stroke-linecap="round"/>
              <path data-v5g-win-arc-inner fill="none" stroke="#28e88f" stroke-opacity="0.78" stroke-width="2.4" stroke-linecap="round" filter="url(#${a}-emerald-glow)"/>
              <line data-v5g-win-gate-left stroke="#4effb2" stroke-width="2.8" stroke-linecap="round" filter="url(#${a}-emerald-glow)"/>
              <line data-v5g-win-gate-right stroke="#4effb2" stroke-width="2.8" stroke-linecap="round" filter="url(#${a}-emerald-glow)"/>

              <!-- Inner Golden 2× BULLSEYE Arc -->
              <path data-v5g-bull-arc-glow fill="none" stroke="#ffb824" stroke-opacity="0.38" stroke-width="12" stroke-linecap="round" filter="url(#${a}-gold-glow)"/>
              <path data-v5g-bull-arc fill="none" stroke="#ffe175" stroke-width="3.4" stroke-linecap="round"/>
              <line data-v5g-bull-gate-left stroke="#ffe175" stroke-width="2.8" stroke-linecap="round"/>
              <line data-v5g-bull-gate-right stroke="#ffe175" stroke-width="2.8" stroke-linecap="round"/>
              <text
                data-v5g-bull-label
                fill="#ffefa8"
                style="paint-order:stroke;stroke:#071328;stroke-width:3.5px;stroke-linejoin:round;"
                font-family="Inter, sans-serif"
                font-weight="800"
                font-size="11.4"
                letter-spacing="0.06em"
                filter="url(#${a}-gold-glow)"
              >
                <textPath href="#${a}-bullseye-text-arc" startOffset="50%" text-anchor="middle">2× BULLSEYE</textPath>
              </text>
            </g>

            <!-- Radial Tick Marks & Year-Safe Scale Labels -->
            <g pointer-events="none">
              ${V.join("")}
              ${v}
            </g>

            <!-- Central Spun-Brass Hub Medallion -->
            <g pointer-events="none">
              <circle cx="${c}" cy="${u}" r="64" fill="#050b18" fill-opacity="0.82"/>
              <circle cx="${c}" cy="${u}" r="60" fill="url(#${a}-brass-outer)" stroke="#3b2105" stroke-width="1.6"/>
              <circle cx="${c}" cy="${u}" r="53" fill="url(#${a}-spun-hub)" stroke="#ffe89f" stroke-opacity="0.58" stroke-width="1.3"/>
              ${A}
            </g>

            <!-- Reveal Exact Answer Pin Marker (hidden until showGadgetReveal) -->
            <g data-v5g-exact-marker style="display:none" pointer-events="none">
              <line x1="${c}" y1="62" x2="${c}" y2="122" stroke="#3cffaa" stroke-width="3.2" stroke-dasharray="4 3" filter="url(#${a}-emerald-glow)"/>
              <polygon points="${c},47 ${c-9},63 ${c+9},63" fill="#46ffad" stroke="#08301e" stroke-width="1.5" filter="url(#${a}-emerald-glow)"/>
            </g>

            <!-- Sweeping Illuminated Tapered Brass Needle -->
            <g data-v5g-dial-needle transform="rotate(0 ${c} ${u})" filter="url(#${a}-needle-shadow)" pointer-events="none">
              <!-- Needle Blade -->
              <polygon
                points="${c},57 ${c-6.8},${u+14} ${c},${u+24} ${c+6.8},${u+14}"
                fill="url(#${a}-needle-gold)"
                stroke="#4d2e07"
                stroke-width="1.1"
              />
              <!-- Illuminated Amber Spine Filament -->
              <line
                x1="${c}"
                y1="66"
                x2="${c}"
                y2="${u-8}"
                stroke="#fff6c9"
                stroke-width="2.1"
                stroke-linecap="round"
                filter="url(#${a}-gold-glow)"
              />
              <!-- Central Pivot Boss Cap -->
              <circle cx="${c}" cy="${u}" r="14.5" fill="url(#${a}-brass-outer)" stroke="#3e2206" stroke-width="1.4"/>
              <circle cx="${c}" cy="${u}" r="9.2" fill="url(#${a}-spun-hub)" stroke="#fff1ba" stroke-opacity="0.6" stroke-width="1"/>
              <circle cx="${c}" cy="${u}" r="3.2" fill="#ffe79c"/>
            </g>
          </svg>

          <!-- Warm Glowing Nixie-Tube Numeric Readout Window -->
          <div class="v5g-nixie-bezel" aria-live="polite">
            <div class="v5g-nixie-window" data-v5g-nixie-window></div>
            ${I?`<span class="v5g-nixie-unit">${S(I)}</span>`:""}
          </div>

          <!-- Flanking Knurled Brass Rotary Step Buttons (-1 / +1, plus -10 / +10 if span > 150) -->
          ${z?`<button type="button" class="v5g-knob-btn v5g-knob-coarse v5g-knob-coarse-left" data-v5g-step="${-W}" aria-label="Decrease dial by ${W}"><span>${S(De(-W))}</span></button>`:""}
          <button type="button" class="v5g-knob-btn v5g-knob-fine-left" data-v5g-step="${-E}" aria-label="Decrease dial by ${E}">
            <span>${S(De(-E))}</span>
          </button>
          <button type="button" class="v5g-knob-btn v5g-knob-fine-right is-plus" data-v5g-step="${E}" aria-label="Increase dial by ${E}">
            <span>${S(De(E))}</span>
          </button>
          ${z?`<button type="button" class="v5g-knob-btn v5g-knob-coarse v5g-knob-coarse-right is-plus" data-v5g-step="${W}" aria-label="Increase dial by ${W}"><span>${S(De(W))}</span></button>`:""}
        </div>

        <div class="v5g-dial-reveal-strip" data-v5g-dial-reveal-strip></div>

        <!-- Heavy Sculpted Gold LOCK DIAL Plunger Lever -->
        <div class="v5g-plunger-mount">
          <button type="button" class="v5g-plunger-btn" data-v5g-dial-lock>
            <span class="v5g-plunger-handle" aria-hidden="true"></span>
            <span class="v5g-plunger-shaft" aria-hidden="true"></span>
            <span class="v5g-plunger-housing">
              <span class="v5g-plunger-lightbar" aria-hidden="true"></span>
              <span class="v5g-plunger-plate" data-v5g-dial-lock-label>LOCK DIAL</span>
              <span class="v5g-plunger-lightbar" aria-hidden="true"></span>
            </span>
            <span class="v5g-plunger-base" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </div>
  `;const m=t.querySelector("[data-v5g-dial-svg]"),R=t.querySelector("[data-v5g-dial-needle]"),q=t.querySelector("[data-v5g-exact-marker]"),ie=t.querySelector("[data-v5g-win-badge-text]"),Me=t.querySelector("[data-v5g-win-sector]"),pe=t.querySelector("[data-v5g-bull-sector]"),Ie=t.querySelector("[data-v5g-win-arc-outer-glow]"),ce=t.querySelector("[data-v5g-win-arc-outer]"),we=t.querySelector("[data-v5g-win-arc-inner]"),ke=t.querySelector("[data-v5g-win-gate-left]"),ye=t.querySelector("[data-v5g-win-gate-right]"),Ce=t.querySelector("[data-v5g-bull-arc-glow]"),e=t.querySelector("[data-v5g-bull-arc]"),n=t.querySelector("[data-v5g-bull-gate-left]"),o=t.querySelector("[data-v5g-bull-gate-right]"),i=t.querySelector(`#${a}-bullseye-text-arc`),f=t.querySelector("[data-v5g-bull-label]"),L=t.querySelector("[data-v5g-nixie-window]"),T=t.querySelector("[data-v5g-dial-lock]"),C=t.querySelector("[data-v5g-dial-lock-label]"),O=t.querySelector("[data-v5g-dial-reveal-strip]"),te=t.querySelector("[data-v5g-hint-slip]"),ge=t.querySelector("[data-v5g-hint-text]"),X=Array.from(t.querySelectorAll("[data-v5g-step]")),fe=(r,h,w)=>{r.setAttribute("x1",h.x.toFixed(2)),r.setAttribute("y1",h.y.toFixed(2)),r.setAttribute("x2",w.x.toFixed(2)),r.setAttribute("y2",w.y.toFixed(2))},$e=(r,h)=>{const w=Y(r-s.winRadius),N=Y(r+s.winRadius),M=Y(r-s.bullseyeRadius),H=Y(r+s.bullseyeRadius),F=Y(r),Z=h?4:26,D=h?2.5:15,be=Math.max(Z,(N-w)/2),Be=Math.max(D,(H-M)/2),ct=Math.max(J,h?w:F-be),Ke=Math.min(de,h?N:F+be),gt=Math.max(J,h?M:F-Be),Xe=Math.min(de,h?H:F+Be),he=Math.min(ct,Ke-1.5),Se=Math.max(Ke,he+1.5),ve=Math.min(gt,Xe-1.2),Ee=Math.max(Xe,ve+1.2),Ze=(qe,Fe,Oe,Ne)=>{const tt=Math.max(.5,Ne-Oe)>180?1:0,rt=G(c,u,Fe,Oe),at=G(c,u,Fe,Ne),it=G(c,u,qe,Ne),ot=G(c,u,qe,Oe);return`M ${rt.x.toFixed(1)} ${rt.y.toFixed(1)} A ${Fe} ${Fe} 0 ${tt} 1 ${at.x.toFixed(1)} ${at.y.toFixed(1)} L ${it.x.toFixed(1)} ${it.y.toFixed(1)} A ${qe} ${qe} 0 ${tt} 0 ${ot.x.toFixed(1)} ${ot.y.toFixed(1)} Z`},Je=me(c,u,126,he,Se),ft=me(c,u,95,he,Se);Me.setAttribute("d",Ze(95,126,he,Se)),Ie.setAttribute("d",Je),ce.setAttribute("d",Je),we.setAttribute("d",ft),fe(ke,G(c,u,95,he),G(c,u,126,he)),fe(ye,G(c,u,95,Se),G(c,u,126,Se));const Qe=me(c,u,87,ve,Ee);pe.setAttribute("d",Ze(64,87,ve,Ee)),Ce.setAttribute("d",Qe),e.setAttribute("d",Qe),fe(n,G(c,u,67,ve),G(c,u,87,ve)),fe(o,G(c,u,67,Ee),G(c,u,87,Ee));const et=Math.max(-72,Math.min(72,(ve+Ee)/2)),ut=Math.max(-118,et-44),xt=Math.min(118,et+44);i.setAttribute("d",me(c,u,73,ut,xt)),f.style.opacity=h?"1":"0.96"},Le=r=>{const h=le(r,s.unitLabel,g,x,!1),w=Array.from(h),N=w.length>4;L.innerHTML=w.map(M=>`<span class="${`v5g-nixie-tube${N?" is-compact":""}${M===","||M==="."?" is-punct":""}`}">${S(M)}</span>`).join("")},ue=r=>{const h=Y(d);R.setAttribute("transform",`rotate(${h.toFixed(2)} ${c} ${u})`),m.setAttribute("aria-valuenow",String(d)),m.setAttribute("aria-valuetext",le(d,s.unitLabel,g,x,!0)),Le(d),B||$e(d,!1),r&&l.onInteractionFeedback?.("tap")},xe=(r,h)=>{if(B)return;const w=Ae(r,g,x,p);w!==d&&(d=w,ue(h))};ue(!1);const _e=(r,h)=>{const w=m.getBoundingClientRect();if(w.width<=0||w.height<=0)return!1;const N=(r.clientX-w.left)/w.width*420,M=(r.clientY-w.top)/w.height*356,H=N-c,F=M-u,Z=Math.hypot(H,F);if(h&&(Z>176||M>246&&Math.abs(H)<82))return!1;let D=Math.atan2(H,-F)*180/Math.PI;return(D<J||D>de)&&(h?D=D<0?J:de:D=oe<0?J:de),oe=D,xe(j(D),!0),!0},je=r=>{B||r.button===2||(oe=Y(d),_e(r,!0)&&(r.preventDefault(),Q=!0,K=r.pointerId,m.classList.add("is-dragging"),m.setPointerCapture?.(r.pointerId)))},Ve=r=>{!Q||B||r.pointerId!==K||_e(r,!1)},ze=r=>{!Q||r.pointerId!==K||(Q=!1,K=null,m.classList.remove("is-dragging"))};m.addEventListener("pointerdown",je),window.addEventListener("pointermove",Ve),window.addEventListener("pointerup",ze),window.addEventListener("pointercancel",ze);const Ue=r=>{if(B)return;const h=r.shiftKey?10:1;r.key==="ArrowLeft"||r.key==="ArrowDown"?(r.preventDefault(),xe(d-E*h,!0)):r.key==="ArrowRight"||r.key==="ArrowUp"?(r.preventDefault(),xe(d+E*h,!0)):(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),We())};m.addEventListener("keydown",Ue);const ne=()=>{ee!==null&&(window.clearTimeout(ee),ee=null),ae!==null&&(window.clearInterval(ae),ae=null),X.forEach(r=>r.classList.remove("is-pressed"))};X.forEach(r=>{const h=Number(r.dataset.v5gStep||0);r.addEventListener("pointerdown",w=>{B||w.button===2||(w.preventDefault(),ne(),r.classList.add("is-pressed"),xe(d+h,!0),ee=window.setTimeout(()=>{ae=window.setInterval(()=>{if(B){ne();return}xe(d+h,!0)},85)},340))}),r.addEventListener("keydown",w=>{B||(w.key==="Enter"||w.key===" ")&&(w.preventDefault(),xe(d+h,!0))})}),window.addEventListener("pointerup",ne),window.addEventListener("pointercancel",ne);const Pe=(r=!1)=>({format:"PINPOINT_DIAL",timedOut:r||void 0,elapsedSec:Math.max(.1,Number(((performance.now()-P)/1e3).toFixed(2))),usedHint:_||l.getUsedHint?.()||void 0,doubleDownArmed:l.getDoubleDownArmed?.()||void 0,pinpointValue:d}),Re=()=>{B=!0,Q=!1,ne(),m.classList.add("is-locked"),m.classList.remove("is-dragging"),X.forEach(r=>{r.disabled=!0}),T.disabled=!0,T.classList.add("is-plunged"),C.textContent="LOCKED"},We=()=>{B||(Re(),l.onInteractionFeedback?.("lock_in"),l.onSubmit(Pe(!1)))};return T.addEventListener("click",We),{revealHint(r){_=!0,ge.textContent=r,te.classList.add("is-open")},showGadgetReveal(r){Re(),$e(s.exactVal,!0);const h=Y(s.exactVal);q.style.display="block",q.setAttribute("transform",`rotate(${h.toFixed(2)} ${c} ${u})`);const w=Math.abs(d-s.exactVal),N=r.isBullseyeOrSweep||w<=s.bullseyeRadius,M=r.isCorrect||w<=s.winRadius,H=le(s.exactVal,s.unitLabel,g,x,!0),F=le(d,s.unitLabel,g,x,!0),Z=le(w,"",0,$,!1);N?(ie.textContent="2× BULLSEYE!",ie.setAttribute("fill","#ffe77a"),O.className="v5g-dial-reveal-strip is-visible is-bullseye",O.textContent=`BULLSEYE · Exact: ${H} (Your Dial: ${F})`):M?(ie.textContent="WIN ARC HIT!",ie.setAttribute("fill","#52ffb6"),O.className="v5g-dial-reveal-strip is-visible is-win",O.textContent=`IN WIN ARC · Exact: ${H} (Off by ${Z})`):(ie.textContent=`EXACT ${le(s.exactVal,s.unitLabel,g,x,!1)}`,ie.setAttribute("fill","#ff9885"),O.className="v5g-dial-reveal-strip is-visible is-miss",O.textContent=`Exact: ${H} · Your Dial: ${F} (Off by ${Z})`)},lockForTimeout(){return Re(),Pe(!0)},getCurrentSubmission(){return Pe(!1)},dispose(){ne(),m.removeEventListener("pointerdown",je),m.removeEventListener("keydown",Ue),window.removeEventListener("pointermove",Ve),window.removeEventListener("pointerup",ze),window.removeEventListener("pointercancel",ze),window.removeEventListener("pointerup",ne),window.removeEventListener("pointercancel",ne),t.innerHTML=""}}}const re=[{name:"gold",core:"#fff1a6",mid:"#f5be36",dark:"#915c08",glow:"#ffc938"},{name:"emerald",core:"#9bffcf",mid:"#22e68c",dark:"#087240",glow:"#2ef59a"},{name:"cyan",core:"#b3f9ff",mid:"#24d9f7",dark:"#076885",glow:"#36e6ff"},{name:"amber",core:"#ffd194",mid:"#f28722",dark:"#8c3f05",glow:"#ff962e"}],wt={core:"#b8ffdd",mid:"#28ea90",dark:"#076e3e",glow:"#34f79e"},kt={core:"#ffc2c8",mid:"#eb4d5e",dark:"#75131f",glow:"#ff5265"};function yt(t,y,l){Te();const s=y.match4;if(!s)return Ye(t,"Match-4 switchboard wiring spec unavailable for this card.");const a=He("v5m4"),P=l.startedAtMs??performance.now(),g=new Map,x=new Map;let p=null,$=null,E=!1,z=!1,W=!1,d=null;t.innerHTML=`
    <div class="v5g-root" data-v5g-format="MATCH_4">
      <div class="v5g-hint-slip" data-v5g-hint-slip role="status">
        <span class="v5g-hint-tag">CLUE</span>
        <span class="v5g-hint-text" data-v5g-hint-text></span>
      </div>

      <!-- Hidden shared SVG gradients referenced by scalloped plaques, sockets, and corner brackets -->
      <svg width="0" height="0" style="position:absolute;pointer-events:none" aria-hidden="true">
        <defs>
          <linearGradient id="${a}-brass-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff2b8"/>
            <stop offset="28%" stop-color="#d89e3c"/>
            <stop offset="56%" stop-color="#875814"/>
            <stop offset="84%" stop-color="#f2ca6e"/>
            <stop offset="100%" stop-color="#653d0b"/>
          </linearGradient>
          <radialGradient id="${a}-emerald-enamel" cx="50%" cy="28%" r="74%">
            <stop offset="0%" stop-color="#146a52"/>
            <stop offset="60%" stop-color="#0b4636"/>
            <stop offset="100%" stop-color="#06281f"/>
          </radialGradient>
          <radialGradient id="${a}-socket-flange" cx="35%" cy="28%" r="70%">
            <stop offset="0%" stop-color="#fff4c4"/>
            <stop offset="45%" stop-color="#c98e2e"/>
            <stop offset="100%" stop-color="#583409"/>
          </radialGradient>
        </defs>
      </svg>

      <div class="v5g-mahogany-frame">
        ${se("v5g-corner-tl",a)}
        ${se("v5g-corner-tr",a)}
        ${se("v5g-corner-bl",a)}
        ${se("v5g-corner-br",a)}

        <div class="v5g-mahogany-board">
          <div class="v5g-match-arena" data-v5g-match-arena>
            <svg class="v5g-match-svg" data-v5g-match-svg aria-hidden="true"></svg>

            <div class="v5g-match-col" data-v5g-col-left>
              ${s.pairs.map(e=>`
                <div class="v5g-match-row-wrap is-left" data-side="left" data-pair-id="${S(e.pairId)}">
                  <button type="button" class="v5g-match-plaque" data-v5g-plaque data-side="left" data-pair-id="${S(e.pairId)}">
                    ${lt(a)}
                    <span class="v5g-plaque-label">${S(e.leftPrompt)}</span>
                  </button>
                  <button type="button" class="v5g-socket-btn" data-v5g-socket data-side="left" data-pair-id="${S(e.pairId)}" aria-label="Wire socket for ${S(e.leftPrompt)}">
                    ${dt(a,"left")}
                  </button>
                </div>`).join("")}
            </div>

            <div aria-hidden="true"></div>

            <div class="v5g-match-col" data-v5g-col-right>
              ${s.shuffledRight.map(e=>`
                <div class="v5g-match-row-wrap is-right" data-side="right" data-pair-id="${S(e.pairId)}">
                  <button type="button" class="v5g-match-plaque" data-v5g-plaque data-side="right" data-pair-id="${S(e.pairId)}">
                    ${lt(a)}
                    <span class="v5g-plaque-label">${S(e.text)}</span>
                  </button>
                  <button type="button" class="v5g-socket-btn" data-v5g-socket data-side="right" data-pair-id="${S(e.pairId)}" aria-label="Wire socket for ${S(e.text)}">
                    ${dt(a,"right")}
                  </button>
                </div>`).join("")}
            </div>
          </div>
        </div>
      </div>

      <!-- Knurled Brass LOCK 4 CABLES Drum Switch + Subtle Unplug Reset Latch -->
      <div class="v5g-switchboard-footer">
        <button type="button" class="v5g-drum-btn" data-v5g-match-lock disabled>
          <span class="v5g-drum-wheel" aria-hidden="true"></span>
          <span class="v5g-drum-body">
            <span class="v5g-drum-leds" data-v5g-drum-leds aria-hidden="true">
              <span class="v5g-drum-led"></span>
              <span class="v5g-drum-led"></span>
              <span class="v5g-drum-led"></span>
              <span class="v5g-drum-led"></span>
            </span>
            <span class="v5g-drum-faceplate" data-v5g-match-lock-label>LOCK 4 CABLES</span>
          </span>
          <span class="v5g-drum-wheel" aria-hidden="true"></span>
        </button>

        <button type="button" class="v5g-unplug-btn" data-v5g-unplug disabled aria-label="Unplug all cables">
          ${vt()}
          <span>Unplug</span>
        </button>
      </div>
    </div>
  `;const B=t.querySelector("[data-v5g-match-arena]"),Q=t.querySelector("[data-v5g-match-svg]"),K=t.querySelector("[data-v5g-match-lock]"),oe=t.querySelector("[data-v5g-match-lock-label]"),_=t.querySelector("[data-v5g-unplug]"),ee=Array.from(t.querySelectorAll(".v5g-drum-led")),ae=t.querySelector("[data-v5g-hint-slip]"),Y=t.querySelector("[data-v5g-hint-text]"),j=new Map,V=new Map,U=new Map,b=new Map;t.querySelectorAll("[data-v5g-plaque]").forEach(e=>{const n=e.dataset.side,o=e.dataset.pairId||"";n==="left"?j.set(o,e):V.set(o,e)}),t.querySelectorAll("[data-v5g-socket]").forEach(e=>{const n=e.dataset.side,o=e.dataset.pairId||"";n==="left"?U.set(o,e):b.set(o,e)});const k=e=>{for(const[n,o]of g.entries())if(o===e)return n;return null},v=e=>{const n=x.get(e);if(n)return n;const o=new Set(x.values()),i=re.find(f=>!o.has(f))??re[g.size%re.length];return x.set(e,i),i},A=(e,n)=>{const o=k(n);o&&o!==e&&(g.delete(o),x.delete(o)),v(e),g.set(e,n),l.onInteractionFeedback?.("tap")},I=(e,n,o)=>{const i=e==="left"?U.get(n):b.get(n);if(!i)return null;const f=i.getBoundingClientRect();return{x:f.left+f.width/2-o.left,y:f.top+f.height/2-o.top}},m=(e,n,o,i,f,L)=>{const T=Math.abs(o-e),C=Math.max(38,T*.54),O=e<o?e+C:e-C,te=e<o?o-C:o+C,ge=Math.abs(i-n)<16?14:0,X=`M ${e.toFixed(1)} ${n.toFixed(1)} C ${O.toFixed(1)} ${(n+ge).toFixed(1)}, ${te.toFixed(1)} ${(i+ge).toFixed(1)}, ${o.toFixed(1)} ${i.toFixed(1)}`,fe=`M ${e.toFixed(1)} ${(n+4).toFixed(1)} C ${O.toFixed(1)} ${(n+ge+6).toFixed(1)}, ${te.toFixed(1)} ${(i+ge+6).toFixed(1)}, ${o.toFixed(1)} ${(i+4).toFixed(1)}`,$e=(Le,ue)=>`
      <circle cx="${Le.toFixed(1)}" cy="${ue.toFixed(1)}" r="7.5" fill="${f.glow}" fill-opacity="0.32" filter="url(#${a}-cable-glow)"/>
      <circle cx="${Le.toFixed(1)}" cy="${ue.toFixed(1)}" r="5.3" fill="url(#${a}-jack-brass)" stroke="#3d2205" stroke-width="1"/>
      <circle cx="${Le.toFixed(1)}" cy="${ue.toFixed(1)}" r="2.6" fill="${f.core}"/>
    `;return`
      <g opacity="${L?"0.88":"1"}">
        <path d="${fe}" fill="none" stroke="rgba(10, 3, 1, 0.72)" stroke-width="11.5" stroke-linecap="round"/>
        <path d="${X}" fill="none" stroke="${f.glow}" stroke-opacity="0.36" stroke-width="16.5" stroke-linecap="round" filter="url(#${a}-cable-glow)"/>
        <path d="${X}" fill="none" stroke="${f.dark}" stroke-width="9.4" stroke-linecap="round"/>
        <path d="${X}" fill="none" stroke="${f.mid}" stroke-width="7.6" stroke-linecap="round"/>
        <path d="${X}" fill="none" stroke="${f.dark}" stroke-width="6.8" stroke-dasharray="4 3" stroke-linecap="butt" stroke-opacity="0.58"/>
        <path d="${X}" fill="none" stroke="${f.core}" stroke-width="5.0" stroke-dasharray="3.2 3.8" stroke-dashoffset="1.6" stroke-linecap="butt" stroke-opacity="0.62"/>
        <path d="${X}" fill="none" stroke="${f.core}" stroke-width="2.5" stroke-opacity="0.72" stroke-linecap="round"/>
        <path d="${X}" fill="none" stroke="#ffffff" stroke-width="1.15" stroke-opacity="0.52" stroke-linecap="round"/>
        ${$e(e,n)}
        ${L?`<circle cx="${o.toFixed(1)}" cy="${i.toFixed(1)}" r="6" fill="${f.core}" stroke="#3d2205" stroke-width="1.2"/>`:$e(o,i)}
      </g>
    `},R=()=>{const e=B.getBoundingClientRect();if(e.width<=0||e.height<=0)return;Q.setAttribute("viewBox",`0 0 ${e.width.toFixed(1)} ${e.height.toFixed(1)}`);const n=[`<defs>
        <filter id="${a}-cable-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4.2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="${a}-jack-brass" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#fff4c4"/>
          <stop offset="50%" stop-color="#d49935"/>
          <stop offset="100%" stop-color="#613a0a"/>
        </radialGradient>
      </defs>`];if(g.forEach((o,i)=>{const f=I("left",i,e),L=I("right",o,e);if(!f||!L)return;const T=z?i===o?wt:kt:x.get(i)??re[0];n.push(m(f.x,f.y,L.x,L.y,T,!1))}),d&&d.moved){const o=I(d.side,d.pairId,e);if(o){const i=d.side==="left"?x.get(d.pairId)??re[g.size%re.length]:re[g.size%re.length],f=d.currX-e.left,L=d.currY-e.top;n.push(m(o.x,o.y,f,L,i,!0))}}Q.innerHTML=n.join("")},q=()=>{const e=new Map;g.forEach((i,f)=>{e.set(i,x.get(f)??re[0])}),j.forEach((i,f)=>{const L=p==="left"&&$===f,T=d?.moved&&d.side==="right"&&d.hoverTargetId===f;i.classList.toggle("is-active-pick",L),i.classList.toggle("is-drop-target",!!T);const C=U.get(f);if(C){C.classList.toggle("is-active-pick",L),C.classList.toggle("is-drop-target",!!T);const O=C.querySelector(".v5g-socket-ring"),te=x.get(f);O&&O.setAttribute("stroke",L?"#ffe680":te?te.glow:"rgba(255,220,128,0.35)")}}),V.forEach((i,f)=>{const L=p==="right"&&$===f,T=d?.moved&&d.side==="left"&&d.hoverTargetId===f;i.classList.toggle("is-active-pick",L),i.classList.toggle("is-drop-target",!!T);const C=b.get(f);if(C){C.classList.toggle("is-active-pick",L),C.classList.toggle("is-drop-target",!!T);const O=C.querySelector(".v5g-socket-ring"),te=e.get(f);O&&O.setAttribute("stroke",L?"#ffe680":te?te.glow:"rgba(255,220,128,0.35)")}});const n=Array.from(g.keys()).map(i=>x.get(i)??re[0]);ee.forEach((i,f)=>{const L=n[f];L?(i.classList.add("is-lit"),i.style.backgroundColor=L.core,i.style.boxShadow=`0 0 8px ${L.glow}`):(i.classList.remove("is-lit"),i.style.backgroundColor="#231407",i.style.boxShadow="inset 0 1px 2px rgba(0,0,0,0.85)")});const o=g.size;K.disabled=E||o<4,_.disabled=E||o===0,E||(oe.textContent=o===4?"LOCK 4 CABLES":`LOCK 4 CABLES (${o}/4)`),R()},ie=(e,n)=>{if(E)return;if(p===null){if(e==="left"&&g.has(n)){g.delete(n),x.delete(n),l.onInteractionFeedback?.("tap"),q();return}if(e==="right"){const f=k(n);if(f){g.delete(f),x.delete(f),l.onInteractionFeedback?.("tap"),q();return}}p=e,$=n,l.onInteractionFeedback?.("tap"),q();return}if(p===e&&$===n){p=null,$=null,q();return}if(p===e){$=n,l.onInteractionFeedback?.("tap"),q();return}A(e==="left"?n:$,e==="right"?n:$),p=null,$=null,q()},Me=(e,n)=>{const i=document.elementFromPoint(e,n)?.closest(".v5g-match-row-wrap");return i&&i.dataset.side&&i.dataset.pairId?{side:i.dataset.side,pairId:i.dataset.pairId}:null},pe=e=>{const n=e.dataset.side,o=e.dataset.pairId||"";e.addEventListener("pointerdown",i=>{E||i.button===2||(i.preventDefault(),d={side:n,pairId:o,pointerId:i.pointerId,startX:i.clientX,startY:i.clientY,currX:i.clientX,currY:i.clientY,moved:!1,hoverTargetId:null})}),e.addEventListener("keydown",i=>{E||(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),ie(n,o))})};j.forEach(pe),V.forEach(pe),U.forEach(pe),b.forEach(pe);const Ie=e=>{if(!(!d||e.pointerId!==d.pointerId||E)&&(!d.moved&&Math.hypot(e.clientX-d.startX,e.clientY-d.startY)>7&&(d.moved=!0),d.currX=e.clientX,d.currY=e.clientY,d.moved)){const n=Me(e.clientX,e.clientY),o=n&&n.side!==d.side?n.pairId:null;o!==d.hoverTargetId?(d.hoverTargetId=o,q()):R()}},ce=e=>{const n=d;if(!(!n||e.pointerId!==n.pointerId)){if(d=null,n.moved){const o=Me(e.clientX,e.clientY);if(o&&o.side!==n.side){const i=n.side==="left"?n.pairId:o.pairId,f=n.side==="right"?n.pairId:o.pairId;A(i,f),p=null,$=null}q();return}ie(n.side,n.pairId)}};window.addEventListener("pointermove",Ie),window.addEventListener("pointerup",ce),window.addEventListener("pointercancel",ce),_.addEventListener("click",()=>{E||g.size===0||(g.clear(),x.clear(),p=null,$=null,l.onInteractionFeedback?.("tap"),q())});const we=(e=!1)=>{const n={};return g.forEach((o,i)=>{n[i]=o}),{format:"MATCH_4",timedOut:e||void 0,elapsedSec:Math.max(.1,Number(((performance.now()-P)/1e3).toFixed(2))),usedHint:W||l.getUsedHint?.()||void 0,doubleDownArmed:l.getDoubleDownArmed?.()||void 0,match4Links:n}},ke=()=>{E=!0,d=null,p=null,$=null,j.forEach(e=>{e.disabled=!0}),V.forEach(e=>{e.disabled=!0}),U.forEach(e=>{e.disabled=!0}),b.forEach(e=>{e.disabled=!0}),K.disabled=!0,K.classList.add("is-locked"),oe.textContent="CABLES LOCKED",_.disabled=!0};K.addEventListener("click",()=>{E||g.size<4||(ke(),l.onInteractionFeedback?.("lock_in"),l.onSubmit(we(!1)))});let ye=null;typeof ResizeObserver<"u"&&(ye=new ResizeObserver(()=>{R()}),ye.observe(B));const Ce=()=>R();return window.addEventListener("resize",Ce,{passive:!0}),q(),window.requestAnimationFrame(()=>R()),{revealHint(e){W=!0,Y.textContent=e,ae.classList.add("is-open"),window.requestAnimationFrame(()=>R())},showGadgetReveal(e){ke(),z=!0;const n=new Map(s.pairs.map(o=>[o.pairId,o.rightAnswer]));j.forEach((o,i)=>{o.classList.remove("is-active-pick","is-drop-target");const L=g.get(i)===i;if(o.classList.add(L?"is-correct":"is-wrong"),!L&&!o.querySelector(".v5g-plaque-correction")){const T=n.get(i);if(T){const C=document.createElement("span");C.className="v5g-plaque-correction",C.textContent=`→ ${T}`,o.appendChild(C)}}}),V.forEach((o,i)=>{o.classList.remove("is-active-pick","is-drop-target");const f=k(i);o.classList.add(f===i?"is-correct":"is-wrong")}),window.requestAnimationFrame(()=>R())},lockForTimeout(){return ke(),we(!0)},getCurrentSubmission(){return we(!1)},dispose(){ye?.disconnect(),window.removeEventListener("pointermove",Ie),window.removeEventListener("pointerup",ce),window.removeEventListener("pointercancel",ce),window.removeEventListener("resize",Ce),t.innerHTML=""}}}function $t(t,y,l){Te();const s=y.sort4;if(!s)return Ye(t,"Sort-4 chronology rack spec unavailable for this card.");const a=He("v5s4"),P=l.startedAtMs??performance.now(),g=new Map(s.correctOrder.map(b=>[b.itemId,b])),x=new Map(s.correctOrder.map((b,k)=>[b.itemId,k])),p=s.initialOrder.map(b=>b.itemId);let $=!1,E=!1,z=null;const W=s.orderDirectionLabel.replace(/->/g,"→");t.innerHTML=`
    <div class="v5g-root" data-v5g-format="SORT_4">
      <div class="v5g-hint-slip" data-v5g-hint-slip role="status">
        <span class="v5g-hint-tag">CLUE</span>
        <span class="v5g-hint-text" data-v5g-hint-text></span>
      </div>

      <svg width="0" height="0" style="position:absolute;pointer-events:none" aria-hidden="true">
        <defs>
          <linearGradient id="${a}-brass-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff2b8"/>
            <stop offset="30%" stop-color="#d89e3c"/>
            <stop offset="58%" stop-color="#875814"/>
            <stop offset="85%" stop-color="#f2ca6e"/>
            <stop offset="100%" stop-color="#653d0b"/>
          </linearGradient>
        </defs>
      </svg>

      <div class="v5g-mahogany-frame">
        ${se("v5g-corner-tl",a)}
        ${se("v5g-corner-tr",a)}
        ${se("v5g-corner-bl",a)}
        ${se("v5g-corner-br",a)}

        <div class="v5g-mahogany-board">
          <div class="v5g-sort-header">
            <span class="v5g-sort-axis-tag">#1 TOP</span>
            <span class="v5g-sort-axis-title">${S(W)}</span>
            <span class="v5g-sort-axis-tag">#4 BOTTOM</span>
          </div>

          <div class="v5g-sort-track-area">
            <div class="v5g-sort-rail" aria-hidden="true"></div>
            <div class="v5g-sort-list" data-v5g-sort-list></div>
          </div>
        </div>
      </div>

      <!-- Sculpted Gold LOCK ORDER Stage Lever -->
      <div class="v5g-lever-footer">
        <button type="button" class="v5g-gold-lever-btn" data-v5g-sort-lock>
          <span class="v5g-gold-lever-housing">
            <span class="v5g-plunger-lightbar" aria-hidden="true"></span>
            <span class="v5g-gold-lever-plate" data-v5g-sort-lock-label>LOCK ORDER</span>
            <span class="v5g-plunger-lightbar" aria-hidden="true"></span>
          </span>
        </button>
      </div>
    </div>
  `;const d=t.querySelector("[data-v5g-sort-list]"),B=t.querySelector("[data-v5g-sort-lock]"),Q=t.querySelector("[data-v5g-sort-lock-label]"),K=t.querySelector("[data-v5g-hint-slip]"),oe=t.querySelector("[data-v5g-hint-text]"),_=new Map,ee=()=>{p.forEach((b,k)=>{const v=_.get(b);if(!v)return;v.dataset.index=String(k);const A=v.querySelector("[data-v5g-rank]");A&&(A.textContent=`#${k+1}`);const I=v.querySelector('[data-v5g-move="up"]'),m=v.querySelector('[data-v5g-move="down"]');I&&(I.disabled=$||k===0),m&&(m.disabled=$||k===p.length-1),d.appendChild(v)})},ae=(b,k)=>{if($)return;const v=p.indexOf(b),A=v+k;if(v<0||A<0||A>=p.length)return;const I=p[v];p[v]=p[A],p[A]=I,l.onInteractionFeedback?.("tap"),ee()};p.forEach(b=>{const k=g.get(b);if(!k)return;const v=document.createElement("div");v.className="v5g-sort-plaque",v.dataset.itemId=b,v.innerHTML=`
      <span class="v5g-sort-rank-badge" data-v5g-rank>#1</span>
      <span class="v5g-sort-grip" aria-hidden="true"></span>
      <div class="v5g-sort-copy">
        <span class="v5g-sort-label">${S(k.label)}</span>
        <span class="v5g-sort-reveal-pill" data-v5g-reveal-pill></span>
      </div>
      <div class="v5g-sort-latches">
        <button type="button" class="v5g-latch-btn" data-v5g-move="up" aria-label="Move ${S(k.label)} up">
          ${pt("up")}
        </button>
        <button type="button" class="v5g-latch-btn" data-v5g-move="down" aria-label="Move ${S(k.label)} down">
          ${pt("down")}
        </button>
      </div>
    `;const A=v.querySelector('[data-v5g-move="up"]'),I=v.querySelector('[data-v5g-move="down"]');A.addEventListener("click",m=>{m.stopPropagation(),ae(b,-1)}),I.addEventListener("click",m=>{m.stopPropagation(),ae(b,1)}),v.addEventListener("pointerdown",m=>{$||m.button===2||m.target?.closest("button")||(m.preventDefault(),z={itemId:b,pointerId:m.pointerId,el:v,startY:m.clientY},v.classList.add("is-dragging"),v.setPointerCapture?.(m.pointerId))}),_.set(b,v)}),ee();const Y=b=>{if(!z||$||b.pointerId!==z.pointerId)return;const k=p.indexOf(z.itemId);if(!(k<0))for(let v=0;v<p.length;v+=1){if(v===k)continue;const A=_.get(p[v]);if(!A)continue;const I=A.getBoundingClientRect(),m=I.top+I.height/2;if(v<k&&b.clientY<m||v>k&&b.clientY>m){const[R]=p.splice(k,1);p.splice(v,0,R),l.onInteractionFeedback?.("tap"),ee();break}}},j=b=>{!z||b.pointerId!==z.pointerId||(z.el.classList.remove("is-dragging"),z=null)};window.addEventListener("pointermove",Y),window.addEventListener("pointerup",j),window.addEventListener("pointercancel",j);const V=(b=!1)=>({format:"SORT_4",timedOut:b||void 0,elapsedSec:Math.max(.1,Number(((performance.now()-P)/1e3).toFixed(2))),usedHint:E||l.getUsedHint?.()||void 0,doubleDownArmed:l.getDoubleDownArmed?.()||void 0,sort4Ids:[...p]}),U=()=>{$=!0,z&&(z.el.classList.remove("is-dragging"),z=null),_.forEach(b=>{b.classList.add("is-locked"),b.querySelectorAll("button").forEach(k=>{k.disabled=!0})}),B.disabled=!0,B.classList.add("is-locked"),Q.textContent="ORDER LOCKED"};return B.addEventListener("click",()=>{$||(U(),l.onInteractionFeedback?.("lock_in"),l.onSubmit(V(!1)))}),{revealHint(b){E=!0,oe.textContent=b,K.classList.add("is-open")},showGadgetReveal(b){U(),p.forEach((k,v)=>{const A=_.get(k),I=g.get(k),m=x.get(k)??v;if(!A||!I)return;const R=m===v;A.classList.add(R?"is-correct":"is-wrong");const q=A.querySelector("[data-v5g-reveal-pill]");q&&(q.classList.add("is-visible"),q.textContent=R?`${I.formattedValue} · Exact #${m+1}`:`${I.formattedValue} · True #${m+1}`)})},lockForTimeout(){return U(),V(!0)},getCurrentSubmission(){return V(!1)},dispose(){window.removeEventListener("pointermove",Y),window.removeEventListener("pointerup",j),window.removeEventListener("pointercancel",j),t.innerHTML=""}}}function St(t,y,l){switch(y.format){case"PINPOINT_DIAL":return mt(t,y,l);case"MATCH_4":return yt(t,y,l);case"SORT_4":return $t(t,y,l);default:return null}}export{Te as ensureGadgetStylesV5,le as formatPinpointDialValueV5,yt as mountMatch4SwitchboardGadget,mt as mountPinpointDialGadget,$t as mountSort4BrassRackGadget,St as mountTactileGadgetV5};
