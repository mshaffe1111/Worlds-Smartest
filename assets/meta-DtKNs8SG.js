import{f as J,F as ts}from"./forge-SPRYYeFW.js";import{P as ss,O as as,a as is,R as C,S as q,s as rs,v as os,g as H}from"./narrative-zOqZ7SbE.js";import{P as ns,M as ls,S as cs,R as ds,a as ps,b as hs,c as us}from"./three-BptGkjiW.js";import{R as ms}from"./modes-CnzZ21_W.js";const fs="ws_daily_global_feed_v2",rt=["ch","gb","jp","br","eg","is","sg","global"],Ue={MAVERICK:{tellCaption:"Vance taps his silver stylus twice beside his right ear before pressing the brass seal.",spokenQuote:"High risk, fearless Overclocks, zero hesitation. Your Meridian Passport is stamped: The Maverick."},DIPLOMAT:{tellCaption:"Vance inclines his head a single measured degree as warm wax meets leather.",spokenQuote:"Measured judgment, strategic alliances, composure under fire. Your Meridian Passport is stamped: The Diplomat."},ANALYST:{tellCaption:"Vance aligns the brass astrolabe crosshairs dead center over your dossier.",spokenQuote:"Methodical clue-peeling, surgical precision, zero wasted motion. Your Meridian Passport is stamped: The Analyst."},PRODIGY:{tellCaption:"Vance’s fingers brush his left brass cufflink—startled by how closely your chart mirrors 2019.",spokenQuote:"Cold instinct at three-point-zero, razor accuracy, unshakable nerve. Your Meridian Passport is stamped: The Prodigy."}};function h(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function gs(s){return typeof s=="number"&&Number.isFinite(s)?String(Math.round(s)):String(s??"").replace(/\b([12]),(\d{3})\b/g,"$1$2")}function M(s){return String(s??"").replace(/\b(in|from|since|circa|c\.|by|until|around|year|founded|born|died)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\(([12]),(\d{3})([–\-]([12]),?(\d{3}))?\)/g,(e,a,t,i,r,n)=>i&&r&&n?`(${a}${t}–${r}${n})`:`(${a}${t})`).replace(/\b([12]),(\d{3})\s*(CE|BCE|AD|BC)\b/g,"$1$2 $3").replace(/\b([12]),(\d{3})([–\-])([12]),(\d{3})\b/g,"$1$2$3$4$5")}const te={PASSPORT:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="11" r="3.5"/><path d="M8.5 17.5h7"/></svg>',OBSERVATORY:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="8" ry="3.2"/><path d="M12 4v16"/></svg>',ATELIER:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 21 9 12 22 3 9 12 2"/><path d="M3 9h18M12 2v20"/></svg>',ANALYTICS:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19h16"/><path d="M7 16v-5M12 16V7M17 16v-8"/></svg>',HONOURS:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.8 7 21l5-2.6L17 21l-1.5-7.2"/></svg>',FACTIONS:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7ZM17 7l-3 7h6l-3-7Z"/></svg>'},bs=[{id:"PASSPORT",icon:te.PASSPORT,label:"Passport"},{id:"OBSERVATORY",icon:te.OBSERVATORY,label:"3D Observatory"},{id:"ATELIER",icon:te.ATELIER,label:"Prism Atelier"},{id:"ANALYTICS",icon:te.ANALYTICS,label:"Career Stats"},{id:"HONOURS",icon:te.HONOURS,label:"Honours"},{id:"FACTIONS",icon:te.FACTIONS,label:"Council Blocs"}];function X(s,e={}){const{isModal:a=!0,closeBtnId:t="ws-meta-close",canNavigate:i=!0,floatingVariant:r=!1}=e;if(!i&&!a)return"";const n=r?"ws-meta-float-pill":"ws-meta-vault-btn",o=i?bs.map(d=>{const l=d.id===s;return`
          <button
            type="button"
            class="ws-meta-vault-row ${l?"is-current":""}"
            data-suite-nav="${d.id}"
            role="menuitem"
            ${l?'aria-current="page"':""}
          >
            <span class="ws-meta-vault-row-ico">${d.icon}</span>
            <span class="ws-meta-vault-row-lbl">${h(d.label)}</span>
            ${l?'<span class="ws-meta-vault-dot" aria-hidden="true"></span>':""}
          </button>
        `}).join(""):"",p=a?`
      <div class="ws-meta-vault-sep"></div>
      <button type="button" class="ws-meta-vault-row is-exit" id="${h(t)}" role="menuitem">
        <span class="ws-meta-vault-row-ico">✕</span>
        <span class="ws-meta-vault-row-lbl">Exit Vault</span>
      </button>
    `:"";return`
    <div class="ws-meta-vault-wrap" data-vault-wrap>
      <button
        type="button"
        class="${n}"
        data-vault-trigger
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span>Vault</span>
        <span class="ws-meta-vault-caret" aria-hidden="true">▾</span>
      </button>
      <div class="ws-meta-vault-menu" data-vault-menu role="menu" hidden>
        ${o}
        ${p}
      </div>
    </div>
  `}function le(s,e={}){const a=s.querySelector("[data-vault-wrap]"),t=s.querySelector("[data-vault-trigger]"),i=s.querySelector("[data-vault-menu]");if(!a||!t||!i)return;let r=null;const n=o=>{i.hidden=!o,i.classList.toggle("is-open",o),t.setAttribute("aria-expanded",o?"true":"false"),r&&(document.removeEventListener("pointerdown",r,!0),r=null),o&&(r=p=>{if(!a.isConnected){r&&(document.removeEventListener("pointerdown",r,!0),r=null);return}const d=p.target;d&&a.contains(d)||n(!1)},document.addEventListener("pointerdown",r,!0))};t.addEventListener("click",o=>{o.stopPropagation(),e.onTapFeedback?.(),n(i.hidden)}),i.querySelectorAll("[data-suite-nav]").forEach(o=>{o.addEventListener("click",p=>{p.stopPropagation();const d=o.dataset.suiteNav;if(n(!1),!!d){if(o.classList.contains("is-current")){e.onTapFeedback?.();return}e.onTapFeedback?.(),e.onNavigate?.(d)}})}),e.closeBtnId&&i.querySelector(`#${e.closeBtnId}`)?.addEventListener("click",p=>{p.stopPropagation(),n(!1),e.onClose?.()})}function ce(s){if(typeof window>"u")return()=>{};const e=a=>{if(a.key!=="Escape")return;const t=document.activeElement;if(t){const i=t.tagName.toUpperCase();if(i==="INPUT"||i==="TEXTAREA"||t.isContentEditable)return}a.preventDefault(),a.stopPropagation(),s()};return window.addEventListener("keydown",e),()=>{window.removeEventListener("keydown",e)}}function be(s,e,a){return Number.isFinite(s)?Math.max(e,Math.min(a,s)):e}function ot(){const s={dailyStreak:0,bestScore:0,bestPercentile:0,shareCardsByDate:{}};try{if(typeof localStorage>"u")return s;const e=localStorage.getItem(fs);if(!e)return s;const a=JSON.parse(e);if(!a||typeof a!="object")return s;const t={};if(a.completedRunsByDate&&typeof a.completedRunsByDate=="object")for(const[i,r]of Object.entries(a.completedRunsByDate))r&&typeof r.shareText=="string"&&(t[i]=r.shareText);return{dailyStreak:Math.max(0,Math.floor(Number(a.dailyStreak)||0)),bestScore:Math.max(0,Math.floor(Number(a.bestScore)||0)),bestPercentile:be(Math.floor(Number(a.bestPercentile)||0),0,99),shareCardsByDate:t}}catch{return s}}function de(){if(typeof document>"u"||document.getElementById("ws-meta-progression-styles"))return;const s=document.createElement("style");s.id="ws-meta-progression-styles",s.textContent=`
    /* Zero backdrop-filter blur per #137 P1(c) so 60fps WebGL2 canvas never stalls GPU compositing! */
    .ws-meta-backdrop {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      height: 100dvh;
      z-index: 65;
      background: rgba(5, 8, 15, 0.92);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      padding: 0;
      display: flex;
      align-items: stretch;
      justify-content: center;
      pointer-events: auto;
      box-sizing: border-box;
      max-width: 100vw;
      overflow: hidden;
      font-variant-numeric: tabular-nums;
    }

    @media (min-width: 768px) and (min-height: 521px) {
      .ws-meta-backdrop:not(.is-stage-dock) {
        padding: 20px;
        align-items: center;
      }
    }

    /* =====================================================================
       OPEN 3D STAGE SPLIT MODE (Portrait: Top 54–55dvh 3D / Bottom 45–46dvh Sheet;
       Landscape: Left 50vw 3D / Right 50vw Sheet) — 100% Pointer Pass-Through!
       ===================================================================== */
    .ws-meta-backdrop.is-stage-dock {
      background: transparent;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: stretch;
      pointer-events: none;
    }

    .ws-meta-stage-zone {
      position: relative;
      flex: 0 0 54vh;
      flex: 0 0 54dvh;
      height: 54vh;
      height: 54dvh;
      width: 100%;
      pointer-events: none;
      box-sizing: border-box;
      z-index: 4;
    }

    .ws-meta-stage-top {
      position: absolute;
      top: max(10px, env(safe-area-inset-top, 10px));
      left: max(12px, env(safe-area-inset-left, 12px));
      right: max(12px, env(safe-area-inset-right, 12px));
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      pointer-events: none;
      z-index: 25;
    }

    .ws-meta-stage-bottom {
      position: absolute;
      bottom: 8px;
      left: max(12px, env(safe-area-inset-left, 12px));
      right: max(12px, env(safe-area-inset-right, 12px));
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      pointer-events: none;
      z-index: 15;
    }

    .ws-meta-stage-actions {
      display: flex;
      align-items: center;
      gap: 7px;
      pointer-events: auto;
    }

    .ws-meta-orbit-whisper {
      pointer-events: none;
      font-family: var(--font-mono, monospace);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: rgba(246, 242, 233, 0.86);
      background: rgba(8, 12, 22, 0.74);
      padding: 4px 10px;
      border-radius: 999px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.42), inset 0 0 0 1px rgba(255, 255, 255, 0.12);
      white-space: nowrap;
    }

    .ws-meta-float-pill {
      pointer-events: auto;
      min-height: 36px;
      min-width: 36px;
      padding: 0 12px;
      border-radius: 999px;
      background: rgba(8, 12, 22, 0.74);
      border: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(255, 255, 255, 0.14);
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease, box-shadow 0.14s ease, transform 0.12s ease;
    }

    .ws-meta-float-pill:hover {
      background: rgba(16, 22, 36, 0.9);
      color: var(--gold-bright, #f2cf7e);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(232, 197, 116, 0.42);
    }

    .ws-meta-float-pill.is-active-gold {
      background: rgba(56, 44, 18, 0.9);
      color: var(--gold-bright, #f2cf7e);
      box-shadow: 0 4px 18px rgba(242, 207, 126, 0.24), inset 0 0 0 1px rgba(242, 207, 126, 0.65);
    }

    .ws-meta-float-pill.is-active-cyan {
      background: rgba(12, 38, 54, 0.9);
      color: var(--cyan-clue, #56d4f5);
      box-shadow: 0 4px 18px rgba(86, 212, 245, 0.26), inset 0 0 0 1px rgba(86, 212, 245, 0.65);
    }

    /* Bottom 46dvh Dark-Obsidian Sheet (Standard Portrait >= 741px) */
    .ws-meta-backdrop.is-stage-dock .ws-meta-sheet {
      pointer-events: auto;
      position: relative;
      flex: 0 0 46vh;
      flex: 0 0 46dvh;
      height: 46vh;
      height: 46dvh;
      max-height: 46vh;
      max-height: 46dvh;
      width: 100%;
      background: linear-gradient(180deg, rgba(10, 14, 24, 0.96) 0%, rgba(6, 9, 16, 0.99) 100%);
      border: none;
      border-top: 1px solid rgba(232, 197, 116, 0.28);
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -16px 40px rgba(0, 0, 0, 0.65);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-sizing: border-box;
      color: var(--ivory-primary, #f6f2e9);
      z-index: 6;
    }

    /* Compact Portrait Phones (360×640, 375×667): 55dvh Open 3D / 45dvh Sheet (#252 P0) */
    @media (orientation: portrait) and (max-height: 740px) {
      .ws-meta-stage-zone {
        flex: 0 0 55vh;
        flex: 0 0 55dvh;
        height: 55vh;
        height: 55dvh;
      }
      .ws-meta-backdrop.is-stage-dock .ws-meta-sheet {
        flex: 0 0 45vh;
        flex: 0 0 45dvh;
        height: 45vh;
        height: 45dvh;
        max-height: 45vh;
        max-height: 45dvh;
      }
      .ws-meta-stage-bottom {
        bottom: 6px;
      }
    }

    .ws-meta-drag-handle {
      width: 36px;
      height: 4px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.22);
      margin: 8px auto 3px;
      flex-shrink: 0;
    }

    /* Landscape / Desktop 3D Split: Left >=50vw Open 3D · Right <=50vw Obsidian Sheet */
    @media (orientation: landscape) and (min-width: 600px) {
      .ws-meta-backdrop.is-stage-dock {
        flex-direction: row;
        justify-content: flex-end;
        align-items: stretch;
      }
      .ws-meta-stage-zone {
        flex: 1 1 50vw;
        min-width: 50vw;
        height: 100vh;
        height: 100dvh;
      }
      .ws-meta-backdrop.is-stage-dock .ws-meta-sheet {
        flex: 0 0 min(50vw, 500px);
        width: min(50vw, 500px);
        height: 100vh;
        height: 100dvh;
        max-height: 100vh;
        max-height: 100dvh;
        border-top: none;
        border-left: 1px solid rgba(232, 197, 116, 0.28);
        border-radius: 20px 0 0 20px;
        box-shadow: -16px 0 40px rgba(0, 0, 0, 0.65);
        padding-top: max(6px, env(safe-area-inset-top, 6px));
      }
      .ws-meta-drag-handle {
        display: none;
      }
    }

    /* =====================================================================
       FULL-SCREEN FRAMELESS OBSIDIAN SHEET (Stats, Honours, Passport, Factions)
       ===================================================================== */
    .ws-meta-shell {
      position: relative;
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      overflow: hidden;
      border-radius: 0;
      background: linear-gradient(180deg, rgba(11, 15, 25, 0.98) 0%, rgba(6, 9, 16, 0.99) 100%);
      border: none;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      color: var(--ivory-primary, #f6f2e9);
      font-variant-numeric: tabular-nums;
    }

    @media (min-width: 768px) and (min-height: 521px) {
      .ws-meta-backdrop:not(.is-stage-dock) .ws-meta-shell {
        max-width: 980px;
        height: auto;
        max-height: calc(100dvh - 40px);
        border-radius: 20px;
        border-top: 1px solid rgba(232, 197, 116, 0.28);
        box-shadow: 0 24px 64px rgba(0, 0, 0, 0.82);
      }
    }

    /* Diplomatic Leather Tonal Variant (Frameless, zero triple inset borders) */
    .ws-meta-shell.is-passport-leather {
      background:
        radial-gradient(circle at 84% 0%, rgba(232, 197, 116, 0.08) 0%, transparent 48%),
        linear-gradient(168deg, #101626 0%, #090d18 55%, #110f1a 100%);
    }

    /* Sticky Single-Row 48px Sheet Header */
    .ws-meta-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 48px;
      padding:
        max(8px, env(safe-area-inset-top, 8px))
        max(14px, env(safe-area-inset-right, 14px))
        8px
        max(12px, env(safe-area-inset-left, 12px));
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(9, 13, 22, 0.98);
      flex-shrink: 0;
      position: sticky;
      top: 0;
      z-index: 22;
      box-sizing: border-box;
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-meta-topbar {
        min-height: 42px;
        padding: 4px 12px;
      }
    }

    .ws-meta-topbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws-meta-topbar-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    .ws-meta-back-btn {
      min-height: 38px;
      padding: 0 8px 0 4px;
      border-radius: 8px;
      background: transparent;
      border: none;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 13px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: color 0.14s ease, background 0.14s ease;
    }

    .ws-meta-back-btn:hover {
      color: var(--gold-bright, #f2cf7e);
      background: rgba(255, 255, 255, 0.05);
    }

    .ws-meta-topbar-titles {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .ws-meta-title {
      font-family: var(--font-display, Georgia, serif);
      font-size: clamp(14px, 1.7vw, 17px);
      font-weight: 800;
      letter-spacing: 0.06em;
      color: var(--gold-bright, #f2cf7e);
      margin: 0;
      line-height: 1.15;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-meta-eyebrow {
      font-family: var(--font-mono, monospace);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: var(--ivory-dim, #7d8594);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Vault ▾ Compact Dropdown Quick-Jumper */
    .ws-meta-vault-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      pointer-events: auto;
      z-index: 30;
    }

    .ws-meta-vault-btn {
      min-height: 36px;
      padding: 0 12px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.055);
      border: none;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-meta-vault-btn:hover {
      background: rgba(232, 197, 116, 0.14);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-meta-vault-caret {
      font-size: 10px;
      opacity: 0.78;
    }

    .ws-meta-vault-menu {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      min-width: 196px;
      padding: 5px;
      border-radius: 14px;
      background: #0c111e;
      border: none;
      box-shadow: 0 18px 44px rgba(0, 0, 0, 0.85), inset 0 0 0 1px rgba(232, 197, 116, 0.22);
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 60;
      pointer-events: auto;
    }

    .ws-meta-vault-menu[hidden] {
      display: none !important;
    }

    .ws-meta-vault-row {
      width: 100%;
      min-height: 40px;
      padding: 0 11px;
      border-radius: 9px;
      background: transparent;
      border: none;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 13px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 9px;
      text-align: left;
      cursor: pointer;
      transition: background 0.12s ease, color 0.12s ease;
    }

    .ws-meta-vault-row:hover {
      background: rgba(255, 255, 255, 0.06);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-meta-vault-row.is-current {
      color: var(--gold-bright, #f2cf7e);
      background: rgba(232, 197, 116, 0.09);
      font-weight: 700;
    }

    .ws-meta-vault-row.is-exit {
      color: var(--ivory-muted, #b8b2a6);
    }

    .ws-meta-vault-row.is-exit:hover {
      color: var(--crimson-alert, #e05263);
      background: rgba(224, 82, 99, 0.1);
    }

    .ws-meta-vault-row-ico {
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--gold-bright, #f2cf7e);
      flex-shrink: 0;
    }

    .ws-meta-vault-row-lbl {
      flex: 1 1 auto;
    }

    .ws-meta-vault-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--gold-bright, #f2cf7e);
      flex-shrink: 0;
    }

    .ws-meta-vault-sep {
      height: 1px;
      background: rgba(255, 255, 255, 0.07);
      margin: 4px 8px;
    }

    /* Clean Borderless Underline Tabs (Single Horizontal Row, Zero Wrapping Boxes) */
    .ws-meta-underline-tabs {
      display: flex;
      align-items: stretch;
      gap: 4px;
      padding: 0 max(14px, env(safe-area-inset-right, 14px)) 0 max(14px, env(safe-area-inset-left, 14px));
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      overflow-x: auto;
      overflow-y: hidden;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
      flex-shrink: 0;
    }

    .ws-meta-underline-tabs::-webkit-scrollbar {
      display: none;
    }

    .ws-meta-underline-tab {
      flex: 1 0 auto;
      min-height: 40px;
      padding: 8px 10px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      color: var(--ivory-muted, #b8b2a6);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      white-space: nowrap;
      cursor: pointer;
      transition: color 0.14s ease, border-color 0.14s ease;
    }

    .ws-meta-underline-tab:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-meta-underline-tab.is-active {
      color: var(--gold-bright, #f2cf7e);
      border-bottom-color: var(--gold-bright, #f2cf7e);
    }

    /* Horizontal Scrollable Strip (Relics, Finishes, Domain/Tier Filters) */
    .ws-meta-hscroll {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 6px;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 2px 0;
      flex-shrink: 0;
    }

    .ws-meta-hscroll::-webkit-scrollbar {
      display: none;
    }

    .ws-meta-chip {
      flex: 0 0 auto;
      min-height: 34px;
      padding: 0 11px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.045);
      border: none;
      color: var(--ivory-muted, #b8b2a6);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      white-space: nowrap;
      cursor: pointer;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-meta-chip:hover {
      background: rgba(255, 255, 255, 0.09);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-meta-chip.is-active {
      background: rgba(232, 197, 116, 0.16);
      color: var(--gold-bright, #f2cf7e);
      box-shadow: inset 0 -2px 0 var(--gold-bright, #f2cf7e);
    }

    /* Scrollable Frameless Body */
    .ws-meta-body-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding:
        12px
        max(16px, env(safe-area-inset-right, 16px))
        max(20px, env(safe-area-inset-bottom, 20px))
        max(16px, env(safe-area-inset-left, 16px));
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      z-index: 2;
      box-sizing: border-box;
    }

    /* Frameless Editorial Section (Hairline Divider Only — Zero Nested Boxes!) */
    .ws-meta-section {
      padding: 14px 0;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
      box-sizing: border-box;
    }

    .ws-meta-section:first-child {
      padding-top: 2px;
    }

    .ws-meta-section:last-child {
      border-bottom: none;
      padding-bottom: 4px;
    }

    .ws-meta-section-title {
      font-family: var(--font-mono, monospace);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--gold-bright, #f2cf7e);
      margin: 0;
    }

    @media (max-width: 460px) {
      .ws-meta-underline-tabs {
        padding: 0 8px;
        gap: 2px;
      }
      .ws-meta-underline-tab {
        padding: 8px 6px;
        font-size: 12px;
      }
    }

    /* Frameless KPI Metric Strip (Hairline Vertical Separators) */
    .ws-meta-kpi-strip {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
      gap: 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      padding-bottom: 12px;
    }

    .ws-meta-kpi-strip.is-four-col {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: 560px) {
      .ws-meta-kpi-strip.is-four-col {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ws-meta-kpi-strip.is-four-col .ws-meta-kpi-cell:nth-child(odd) {
        border-left: none;
        padding-left: 0;
      }
      .ws-meta-kpi-strip.is-four-col .ws-meta-kpi-cell:nth-child(n + 3) {
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 10px;
        margin-top: 4px;
      }
    }

    .ws-meta-kpi-cell {
      padding: 6px 10px;
      border-left: 1px solid rgba(255, 255, 255, 0.07);
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .ws-meta-kpi-cell:first-child {
      border-left: none;
      padding-left: 0;
    }

    .ws-meta-kpi-lbl {
      font-family: var(--font-mono, monospace);
      font-size: 10px;
      font-weight: 600;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      color: #9aa4b7;
    }

    .ws-meta-kpi-val {
      font-family: var(--font-mono, monospace);
      font-size: 16px;
      font-weight: 800;
      color: var(--ivory-primary, #f6f2e9);
      font-variant-numeric: tabular-nums;
      line-height: 1.2;
    }

    /* Frameless Hairline List Row */
    .ws-meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 9px 4px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      background: transparent;
      min-width: 0;
      transition: background 0.12s ease;
    }

    .ws-meta-row:last-child {
      border-bottom: none;
    }

    .ws-meta-row.is-interactive {
      cursor: pointer;
    }

    .ws-meta-row.is-interactive:hover {
      background: rgba(255, 255, 255, 0.035);
    }

    .ws-meta-row.is-focused {
      background: rgba(232, 197, 116, 0.07);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
      padding-left: 10px;
    }

    /* Left-Bar Editorial Callout (Zero 4-Sided Box) */
    .ws-meta-note {
      padding: 6px 0 6px 12px;
      border: none;
      box-shadow: inset 2px 0 0 var(--gold-bright, #f2cf7e);
      font-size: 12px;
      color: var(--ivory-muted, #b8b2a6);
      line-height: 1.45;
    }

    .ws-meta-note.is-cyan {
      box-shadow: inset 2px 0 0 var(--cyan-clue, #56d4f5);
      color: #dff6ff;
    }

    .ws-meta-note.is-emerald {
      box-shadow: inset 2px 0 0 var(--emerald-win, #39d49a);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-meta-note.is-crimson {
      box-shadow: inset 2px 0 0 var(--crimson-alert, #e05263);
    }

    /* Sleek Underline Input */
    .ws-meta-input {
      width: 100%;
      min-height: 42px;
      padding: 8px 2px;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 0;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease;
    }

    .ws-meta-input::placeholder {
      color: var(--ivory-dim, #7d8594);
    }

    .ws-meta-input:focus {
      border-bottom-color: var(--gold-bright, #f2cf7e);
    }

    /* Sleek Borderless Buttons & Gold Primary CTA */
    .ws-meta-btn {
      min-height: 40px;
      min-width: 40px;
      padding: 8px 14px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.055);
      border: none;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.02em;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease, transform 0.12s ease;
    }

    .ws-meta-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.11);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-meta-btn.is-active {
      background: rgba(232, 197, 116, 0.16);
      color: var(--gold-bright, #f2cf7e);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-meta-btn-gold {
      min-height: 42px;
      min-width: 44px;
      padding: 8px 18px;
      border-radius: 999px;
      background: linear-gradient(180deg, #fae29c 0%, #d8ab4e 55%, #b5842c 100%);
      border: none;
      color: #10141e;
      font-family: var(--font-display, Georgia, serif);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      cursor: pointer;
      white-space: nowrap;
      box-shadow: 0 6px 20px rgba(216, 175, 87, 0.28);
      transition: transform 0.14s ease, filter 0.15s ease;
    }

    .ws-meta-btn-gold:hover:not(:disabled) {
      filter: brightness(1.07);
      transform: translateY(-1px);
    }

    .ws-meta-inline-link {
      background: transparent;
      border: none;
      padding: 6px 4px;
      color: var(--gold-bright, #f2cf7e);
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .ws-meta-inline-link:hover {
      text-decoration: underline;
    }

    /* Flush Hairline 8-Country Visa Grid (Zero Bordered Cards!) */
    .ws-visa-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1px;
      background: rgba(255, 255, 255, 0.07);
      width: 100%;
    }

    @media (max-width: 759px) {
      .ws-visa-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    .ws-visa-card {
      position: relative;
      min-width: 0;
      padding: 14px 10px;
      background: #0a0f1a;
      border: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 5px;
      transition: background 0.15s ease;
    }

    .ws-visa-card.is-cleared {
      background: radial-gradient(circle at 50% 24%, rgba(57, 212, 154, 0.09), #0a0f1a 74%);
    }

    .ws-visa-card.is-locked {
      opacity: 0.78;
    }

    .ws-visa-stamp-img {
      width: clamp(62px, 7vw, 80px);
      height: clamp(62px, 7vw, 80px);
      object-fit: contain;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
      transition: transform 0.22s ease;
    }

    .ws-visa-card.is-cleared .ws-visa-stamp-img {
      transform: rotate(-5deg);
    }

    /* Animated Persona Diplomatic Ink-Stamp Ceremony (Frameless Radial Halo) */
    .ws-persona-seal-stage {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16px 8px;
      background: radial-gradient(circle at 50% 42%, rgba(242, 207, 126, 0.11) 0%, transparent 66%);
      border: none;
      overflow: hidden;
    }

    .ws-persona-seal-disc {
      position: relative;
      width: 146px;
      height: 146px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 12px;
      border: 2.5px double var(--seal-accent, #f2cf7e);
      background: radial-gradient(circle, rgba(20, 26, 42, 0.96) 0%, rgba(8, 11, 20, 0.98) 100%);
      box-shadow: 0 0 28px rgba(242, 207, 126, 0.2);
      transform: rotate(-4deg);
    }

    .ws-persona-seal-disc.is-stamping {
      animation: wsPassportStampSlam 0.68s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .ws-ink-ring-burst {
      position: absolute;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 2px solid var(--seal-accent, #f2cf7e);
      opacity: 0;
      pointer-events: none;
    }

    .ws-ink-ring-burst.is-stamping {
      animation: wsInkShockwave 0.72s ease-out forwards;
    }

    @keyframes wsPassportStampSlam {
      0% {
        opacity: 0.15;
        transform: scale(2.15) rotate(8deg);
        filter: brightness(1.8);
      }
      42% {
        opacity: 1;
        transform: scale(0.91) rotate(-6deg);
        filter: brightness(1.35);
      }
      68% {
        transform: scale(1.04) rotate(-3.5deg);
      }
      100% {
        opacity: 1;
        transform: scale(1) rotate(-4deg);
        filter: brightness(1);
      }
    }

    @keyframes wsInkShockwave {
      0% {
        opacity: 0.92;
        transform: scale(0.82);
      }
      100% {
        opacity: 0;
        transform: scale(1.68);
      }
    }

    /* Frameless 2-Column Editorial Split on Wide Screens */
    .ws-meta-two-col {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 18px 24px;
      align-items: start;
    }

    /* Subtle Hairline Progress Track */
    .ws-meta-progress-track {
      width: 100%;
      height: 3px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.09);
      overflow: hidden;
    }

    .ws-meta-progress-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.25s ease;
    }

    /* =====================================================================
       5-BOX LEITNER SPACED-REPETITION MASTERY DECK (Frameless Editorial)
       ===================================================================== */
    .ws-srs-boxes-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 6px;
      width: 100%;
      padding: 6px 0 4px;
    }

    .ws-srs-box-bar {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 8px 7px;
      border-radius: 9px;
      background: rgba(255, 255, 255, 0.042);
      border: none;
      text-align: left;
      min-width: 0;
      cursor: pointer;
      transition: background 0.14s ease, transform 0.12s ease;
    }

    .ws-srs-box-bar:hover {
      background: rgba(255, 255, 255, 0.085);
    }

    .ws-srs-box-bar.is-active {
      background: rgba(242, 207, 126, 0.13);
      box-shadow: inset 0 -2px 0 var(--gold-bright, #f2cf7e);
    }

    .ws-srs-box-head {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 4px;
      min-width: 0;
    }

    .ws-srs-box-name {
      font-family: var(--font-mono, monospace);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
    }

    .ws-srs-box-count {
      font-family: var(--font-mono, monospace);
      font-size: 12px;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .ws-srs-box-track {
      width: 100%;
      height: 5px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.09);
      overflow: hidden;
    }

    .ws-srs-box-fill {
      height: 100%;
      border-radius: 999px;
      transition: width 0.28s cubic-bezier(0.22, 1, 0.36, 1);
    }

    .ws-srs-box-interval {
      font-family: var(--font-mono, monospace);
      font-size: 10px;
      font-weight: 600;
      color: #a5afc2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-srs-card-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding-bottom: 9px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .ws-srs-box-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 9px;
      border-radius: 999px;
      background: rgba(242, 207, 126, 0.14);
      font-family: var(--font-mono, monospace);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--gold-bright, #f2cf7e);
      white-space: nowrap;
    }

    .ws-srs-box-pill.is-box-1 {
      background: rgba(224, 82, 99, 0.18);
      color: #ff99a5;
    }

    .ws-srs-box-pill.is-box-2 {
      background: rgba(240, 157, 70, 0.18);
      color: #ffc27a;
    }

    .ws-srs-box-pill.is-box-3 {
      background: rgba(86, 212, 245, 0.16);
      color: #8ee5ff;
    }

    .ws-srs-box-pill.is-box-4 {
      background: rgba(242, 207, 126, 0.16);
      color: #f6db96;
    }

    .ws-srs-box-pill.is-box-5 {
      background: rgba(57, 212, 154, 0.18);
      color: #67ebb8;
    }

    .ws-srs-options-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .ws-srs-option-btn {
      width: 100%;
      min-height: 46px;
      padding: 10px 13px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.045);
      border: none;
      box-shadow: inset 3px 0 0 rgba(232, 197, 116, 0.18);
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 13.5px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 10px;
      text-align: left;
      cursor: pointer;
      transition: background 0.14s ease, box-shadow 0.14s ease;
    }

    .ws-srs-option-btn:hover:not(:disabled) {
      background: rgba(242, 207, 126, 0.11);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-srs-option-btn:disabled {
      cursor: default;
      opacity: 0.72;
    }

    .ws-srs-option-btn.is-correct,
    .ws-srs-option-btn.is-correct:disabled {
      opacity: 1;
      background: rgba(57, 212, 154, 0.16);
      box-shadow: inset 3.5px 0 0 var(--emerald-win, #39d49a);
      color: #ecfff7;
    }

    .ws-srs-option-btn.is-wrong,
    .ws-srs-option-btn.is-wrong:disabled {
      opacity: 1;
      background: rgba(224, 82, 99, 0.18);
      box-shadow: inset 3.5px 0 0 var(--crimson-alert, #e05263);
      color: #ffe8eb;
    }

    .ws-srs-option-key {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: rgba(242, 207, 126, 0.16);
      color: var(--gold-bright, #f2cf7e);
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .ws-srs-option-btn.is-correct .ws-srs-option-key {
      background: var(--emerald-win, #39d49a);
      color: #071b14;
    }

    .ws-srs-option-btn.is-wrong .ws-srs-option-key {
      background: #b52a3b;
      color: #ffffff;
    }

    .ws-srs-promotion-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 3px 10px;
      border-radius: 999px;
      font-family: var(--font-mono, monospace);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .ws-srs-promotion-badge.is-promoted {
      background: rgba(57, 212, 154, 0.18);
      color: #67ebb8;
    }

    .ws-srs-promotion-badge.is-reset {
      background: rgba(224, 82, 99, 0.2);
      color: #ff99a5;
    }

    @media (max-width: 440px) {
      .ws-srs-boxes-grid {
        gap: 4px;
      }
      .ws-srs-box-bar {
        padding: 6px 5px;
      }
      .ws-srs-box-name {
        font-size: 10px;
      }
      .ws-srs-box-interval {
        font-size: 10px;
      }
    }

    /* =====================================================================
       v3.0 LINKED CAREER ANALYTICS CROSS-FILTERING & DRILL-DOWN CONTROLS
       (Zero 4-sided nested boxes, >= 44px touch targets, 0px overflow)
       ===================================================================== */
    .ws-stats-outcome-strip {
      padding: 2px 0 10px;
      gap: 6px;
    }

    .ws-stats-outcome-pill {
      min-height: 44px;
      padding: 0 13px;
    }

    .ws-stats-filter-bar {
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      min-width: 0;
    }

    .ws-stats-filter-bar.is-filtered {
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
      padding-left: 12px;
      background: rgba(242, 207, 126, 0.045);
    }

    .ws-stats-filter-chips-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
      min-width: 0;
    }

    .ws-stats-slice-summary {
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      color: #c8c2b6;
      line-height: 1.38;
    }

    .ws-stats-filter-chip {
      min-height: 44px;
      padding: 0 13px;
      border-radius: 999px;
      border: none;
      background: rgba(232, 197, 116, 0.18);
      box-shadow: inset 0 -2px 0 var(--gold-bright, #f2cf7e);
      color: var(--gold-bright, #f2cf7e);
      font-family: var(--font-sans, Inter, sans-serif);
      font-size: 12px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.14s ease;
    }

    .ws-stats-filter-chip:hover {
      background: rgba(232, 197, 116, 0.28);
    }

    .ws-stats-reset-btn {
      min-height: 44px;
      padding: 0 13px;
      border-radius: 999px;
      border: none;
      background: rgba(224, 82, 99, 0.2);
      color: #ff99a5;
      font-family: var(--font-mono, monospace);
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.14s ease;
    }

    .ws-stats-reset-btn:hover {
      background: rgba(224, 82, 99, 0.32);
    }

    .ws-stats-linked-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }

    .ws-stats-action-cta {
      min-height: 44px;
      padding: 8px 16px;
    }

    .ws-stats-action-btn {
      min-height: 44px;
      padding: 8px 13px;
    }

    .ws-stats-row-btn {
      width: 100%;
      min-height: 44px;
      text-align: left;
      padding: 8px 6px;
      gap: 8px;
      border: none;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, Inter, sans-serif);
    }

    .ws-stats-row-btn.is-dimmed {
      opacity: 0.48;
    }

    .ws-stats-row-btn.is-dimmed:hover {
      opacity: 0.88;
    }

    .ws-stats-subcat-panel {
      margin-top: 10px;
      padding: 10px 0 2px 12px;
      box-shadow: inset 3px 0 0 rgba(86, 212, 245, 0.55);
    }

    .ws-stats-peel-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px;
      padding-top: 6px;
    }

    .ws-stats-peel-btn {
      min-height: 44px;
      padding: 8px 7px;
      border-radius: 10px;
      border: none;
      background: rgba(255, 255, 255, 0.048);
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
      gap: 3px;
      cursor: pointer;
      text-align: left;
      min-width: 0;
      transition: background 0.14s ease, opacity 0.14s ease;
    }

    .ws-stats-peel-btn:hover {
      background: rgba(255, 255, 255, 0.095);
    }

    .ws-stats-peel-btn.is-active {
      background: rgba(232, 197, 116, 0.16);
      box-shadow: inset 0 -2px 0 var(--gold-bright, #f2cf7e);
    }

    .ws-stats-peel-btn.is-dimmed {
      opacity: 0.48;
    }

    .ws-srs-domain-chip {
      min-height: 44px;
      padding: 0 12px;
    }

    @media (max-width: 400px) {
      .ws-stats-peel-grid {
        gap: 4px;
      }
      .ws-stats-peel-btn {
        padding: 7px 5px;
      }
      .ws-stats-action-cta,
      .ws-stats-action-btn {
        font-size: 11.5px;
        padding: 8px 12px;
      }
    }
  `,document.head.appendChild(s)}function ys(s,e,a){const t=a?.[s];if(t)return t;const i=e?"#39d49a":"#7b8599",r=e?"#f2cf7e":"#596273",n=e?"rgba(14, 42, 34, 0.72)":"rgba(14, 19, 30, 0.65)",p={ch:{code:"CH · GENEVA",city:"46.20°N 6.14°E",glyph:`<circle cx="60" cy="56" r="15" fill="none" stroke="${r}" stroke-width="2"/><path d="M60 45v22M49 56h22" stroke="${i}" stroke-width="3.2" stroke-linecap="round"/>`},gb:{code:"GB · LONDON",city:"51.51°N 0.13°W",glyph:`<circle cx="60" cy="56" r="15" fill="none" stroke="${r}" stroke-width="1.8"/><ellipse cx="60" cy="56" rx="15" ry="6.5" fill="none" stroke="${i}" stroke-width="1.8" transform="rotate(-26 60 56)"/><ellipse cx="60" cy="56" rx="15" ry="6.5" fill="none" stroke="${i}" stroke-width="1.8" transform="rotate(26 60 56)"/>`},jp:{code:"JP · TOKYO",city:"35.68°N 139.65°E",glyph:`<path d="M43 47h34M46 52h28M51 47v21M69 47v21" stroke="${i}" stroke-width="2.4" stroke-linecap="round"/><circle cx="60" cy="59" r="5" fill="${r}"/>`},br:{code:"BR · RIO",city:"22.91°S 43.17°W",glyph:`<path d="M44 66a16 16 0 0 1 32 0Z" fill="none" stroke="${i}" stroke-width="2"/><path d="M60 44v22M49 57h22" stroke="${r}" stroke-width="1.6"/>`},eg:{code:"EG · CAIRO",city:"30.04°N 31.24°E",glyph:`<polygon points="60,41 76,67 44,67" fill="none" stroke="${r}" stroke-width="2.2"/><circle cx="60" cy="57" r="4.2" fill="${i}"/>`},is:{code:"IS · REYKJAVIK",city:"64.15°N 21.94°W",glyph:`<path d="M45 64l8-18 7 11 7-14 8 21" fill="none" stroke="${i}" stroke-width="2.2" stroke-linejoin="round"/><path d="M46 43q14-6 28 0" fill="none" stroke="${r}" stroke-width="1.8"/>`},sg:{code:"SG · SINGAPORE",city:"1.35°N 103.82°E",glyph:`<rect x="48" y="47" width="6" height="20" stroke="${r}" stroke-width="1.8" fill="none"/><rect x="66" y="47" width="6" height="20" stroke="${r}" stroke-width="1.8" fill="none"/><path d="M44 47q16-5 32 0" fill="none" stroke="${i}" stroke-width="2.4"/>`},global:{code:"APEX CITADEL",city:"INTL WATERS",glyph:`<polygon points="60,40 65,51 77,52 68,60 70,71 60,65 50,71 52,60 43,52 55,51" fill="none" stroke="${r}" stroke-width="2"/><circle cx="60" cy="56" r="3.5" fill="${i}"/>`}}[s],d=e?"VISA STAMPED":"UNSTAMPED",l=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="55" fill="${n}" stroke="${i}" stroke-width="2.5" stroke-dasharray="5 2.5"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="${r}" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="33" fill="none" stroke="${i}" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="60" y="25" text-anchor="middle" fill="${r}" font-family="Cinzel,Georgia,serif" font-size="8.5" font-weight="700" letter-spacing="1.1">${p.code}</text>
    ${p.glyph}
    <text x="60" y="84" text-anchor="middle" fill="${i}" font-family="monospace" font-size="7.2" font-weight="700" letter-spacing="0.8">${d}</text>
    <text x="60" y="99" text-anchor="middle" fill="${r}" font-family="monospace" font-size="6.4">${p.city}</text>
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(l)}`}function vs(s,e){const n=[.25,.5,.75,1].map(m=>{const c=[];for(let u=0;u<12;u++){const y=Math.PI*2*u/12-Math.PI/2;c.push(`${(190+Math.cos(y)*100*m).toFixed(1)},${(154+Math.sin(y)*100*m).toFixed(1)}`)}return`<polygon points="${c.join(" ")}" fill="none" stroke="rgba(216,175,87,${m===1?"0.36":"0.18"})" stroke-width="${m===1?"1.3":"1"}" />`}).join(""),o=[],p=[],d=[],l=[];for(let m=0;m<12;m++){const c=Math.PI*2*m/12-Math.PI/2,u=Math.cos(c),y=Math.sin(c),x=190+u*100,g=154+y*100,v=m===e;o.push(`<line x1="190" y1="154" x2="${x.toFixed(1)}" y2="${g.toFixed(1)}" stroke="${v?"rgba(242,207,126,0.75)":"rgba(216,175,87,0.18)"}" stroke-width="${v?"1.8":"1"}" />`);const k=s[m],f=be(k?.masteryPct??50,18,100)/100,b=190+u*100*f,w=154+y*100*f;p.push(`${b.toFixed(1)},${w.toFixed(1)}`);const I=q[m]?.accentHex??"#f2cf7e";d.push(`
      <g data-radar-domain="${m}" style="cursor:pointer;">
        <circle cx="${b.toFixed(1)}" cy="${w.toFixed(1)}" r="12" fill="transparent" />
        <circle cx="${b.toFixed(1)}" cy="${w.toFixed(1)}" r="${v?"6.2":"4.0"}" fill="${v?I:"#f2cf7e"}" stroke="#080b11" stroke-width="1.5" />
      </g>
    `);const T=190+u*118,S=154+y*116,_=u<-.25?"end":u>.25?"start":"middle",L=ts[m]?.shortName??q[m]?.shortName??`D${m}`;l.push(`<text data-radar-domain="${m}" x="${T.toFixed(1)}" y="${(S+3).toFixed(1)}" text-anchor="${_}" fill="${v?"#f2cf7e":"#d8d2c5"}" font-size="${v?"10.5":"9.5"}" font-family="Inter, sans-serif" font-weight="${v?"800":"600"}" style="cursor:pointer;">${h(L)}</text>`)}return`
    <svg viewBox="0 0 380 308" style="width:100%;max-width:360px;height:auto;display:block;margin:0 auto;overflow:visible;">
      <defs>
        <radialGradient id="wsRadarPolyGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#56d4f5" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#f2cf7e" stop-opacity="0.34"/>
        </radialGradient>
      </defs>
      ${n}
      ${o.join("")}
      <polygon points="${p.join(" ")}" fill="url(#wsRadarPolyGrad)" stroke="#f2cf7e" stroke-width="2.2" stroke-linejoin="round" />
      ${l.join("")}
      ${d.join("")}
    </svg>
  `}function ws(s){if(s.length===0)return"";const e=[...s].slice(-14),a=440,t=92,i=22,r=14,n=a-i*2,o=t-r*2,p=e.map((c,u)=>{const y=e.length===1?a/2:i+u/(e.length-1)*n,x=be(c.percentile,1,99),g=r+(1-x/100)*o;return{x:y,y:g,entry:c}}),d=p.map(c=>`${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" "),l=`${p[0].x.toFixed(1)},${t-r} ${d} ${p[p.length-1].x.toFixed(1)},${t-r}`,m=p.map(c=>`<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4" fill="#39d49a" stroke="#080b11" stroke-width="1.4" />`).join("");return`
    <svg viewBox="0 0 ${a} ${t}" style="width:100%;height:auto;display:block;">
      <line x1="${i}" y1="${r}" x2="${a-i}" y2="${r}" stroke="rgba(57,212,154,0.25)" stroke-dasharray="3 3" />
      <line x1="${i}" y1="${t/2}" x2="${a-i}" y2="${t/2}" stroke="rgba(216,175,87,0.18)" stroke-dasharray="3 3" />
      <line x1="${i}" y1="${t-r}" x2="${a-i}" y2="${t-r}" stroke="rgba(184,178,166,0.2)" />
      <polygon points="${l}" fill="rgba(57,212,154,0.14)" />
      <polyline points="${d}" fill="none" stroke="#f2cf7e" stroke-width="2.2" />
      ${m}
    </svg>
  `}class xs{deps;modalBackdrop=null;mountedContainer=null;unsubscribePassport=null;detachEscape=null;activeTab="CREDENTIALS";focusedDomainId=0;stampAnimating=!1;nameFeedbackMsg=null;copiedDateToast=null;callbacks={};constructor(e){this.deps=e,de()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.activeTab=e.initialTab??"CREDENTIALS",this.callbacks=e,this.stampAnimating=!!e.playStampCeremonyOnOpen,this.nameFeedbackMsg=null;const a=document.createElement("div");a.className="ws-meta-backdrop",a.setAttribute("role","dialog"),a.setAttribute("aria-modal","true"),a.setAttribute("aria-label","Meridian Diplomatic Passport 2.0"),a.addEventListener("click",t=>{t.target===a&&this.handleClose()}),document.body.appendChild(a),this.modalBackdrop=a,this.detachEscape=ce(()=>this.handleBackOrClose()),this.stampAnimating&&this.playPersonaStampAudio(),this.renderInto(a,!0)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}const e=this.callbacks.onClose;this.close(),e?.()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}playPersonaStampAudio(){this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp");const e=this.deps.passport.getSnapshot().persona;e?this.deps.audio?.playVoice(`vance_persona_${e.toLowerCase()}.mp3`):this.deps.audio?.playVoice("vance_stamp.mp3")}mount(e,a={}){this.unmount(),this.activeTab=a.initialTab??"CREDENTIALS",this.callbacks=a,this.stampAnimating=!!a.playStampCeremonyOnOpen,this.mountedContainer=e,this.renderInto(e,!1)}unmount(){const e=this.mountedContainer!==null;this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.unsubscribePassport&&(this.unsubscribePassport(),this.unsubscribePassport=null),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null),(e||this.modalBackdrop!==null)&&this.deps.audio?.stopVoice()}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}getActiveTab(){return this.activeTab}setActiveTab(e){this.activeTab=e,this.rerender()}triggerStampCeremony(){this.activeTab="CREDENTIALS",this.stampAnimating=!0,this.playPersonaStampAudio(),this.callbacks.onPassportStamped?.(),this.rerender()}rerender(){this.modalBackdrop?this.renderInto(this.modalBackdrop,!0):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}collectDomainSkills(e){const a=J.getSkillVector();return J.getSkillSnapshot().totalAnswered>0?a:a.map((i,r)=>{const n=e.domainElo[r]??i.elo,o=Number(((n-1200)/260).toFixed(2)),p=Math.round(be((n-800)/1400*100,18,100));return{...i,elo:n,theta:o,masteryPct:p}})}renderInto(e,a){const t=this.deps.passport.getSnapshot(),i=this.deps.blackboard?.getSnapshot()??null,r=J.getSkillSnapshot(),n=this.collectDomainSkills(t),o=this.deps.passport.getChallengerName(),p=t.persona?ss[t.persona]:null,d=t.origin?as[t.origin]:null,l=rt.filter(x=>t.visas[x]?.cleared).length,m=Math.round(n.reduce((x,g)=>x+g.elo,0)/Math.max(1,n.length)),c=r.totalAnswered>0?r.globalElo:m,u=r.totalAnswered>0?Math.round(r.totalCorrect/r.totalAnswered*100):0,y=X("PASSPORT",{isModal:a,closeBtnId:"ws-passport2-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell is-passport-leather">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-passport2-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">PASSPORT</h2>
              <div class="ws-meta-eyebrow">${h(o)} · ${h(t.passportNumber)}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${y}
          </div>
        </div>

        <!-- 4 Single-Row Borderless Underline Tabs (Fits 360px/390px cleanly with zero edge clip) -->
        <div class="ws-meta-underline-tabs" role="tablist" aria-label="Passport Sections">
          <button type="button" role="tab" aria-selected="${this.activeTab==="CREDENTIALS"}" class="ws-meta-underline-tab ${this.activeTab==="CREDENTIALS"?"is-active":""}" data-passport-tab="CREDENTIALS">
            Credentials
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab==="VISAS"}" class="ws-meta-underline-tab ${this.activeTab==="VISAS"?"is-active":""}" data-passport-tab="VISAS">
            Visas (${l}/8)
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab==="RADAR"}" class="ws-meta-underline-tab ${this.activeTab==="RADAR"?"is-active":""}" data-passport-tab="RADAR">
            12 Domains
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab==="GLOBAL_FEED"}" class="ws-meta-underline-tab ${this.activeTab==="GLOBAL_FEED"?"is-active":""}" data-passport-tab="GLOBAL_FEED">
            Global
          </button>
        </div>

        <div class="ws-meta-body-scroll">
          ${this.renderActiveTabBody(t,i,n,p,d,c,u,r.totalAnswered,r.totalCorrect,r.bestStreak)}
        </div>
      </div>
    `,this.stampAnimating=!1,this.bindEvents(e)}renderActiveTabBody(e,a,t,i,r,n,o,p,d,l){return this.activeTab==="VISAS"?this.renderVisasTab(e):this.activeTab==="RADAR"?this.renderRadarTab(t):this.activeTab==="GLOBAL_FEED"?this.renderGlobalFeedTab(e):this.renderCredentialsTab(e,a,i,r,n,o,p,d,l)}renderCredentialsTab(e,a,t,i,r,n,o,p,d){const l=this.deps.passport.getChallengerName(),m=t?.accentHex??"#f2cf7e",c=this.stampAnimating?"is-stamping":"",u=a?.axisIntegrity??0,y=a?.publicTrust??50,x=a?.councilFavor??50,g=a?.pledgedFaction??"UNALIGNED",v=(a?.activePerks??[]).map(k=>is[k]).filter(Boolean);return`
      <!-- Frameless KPI Telemetry Strip (2x2 on mobile < 560px, 4-col on desktop) -->
      <div class="ws-meta-kpi-strip is-four-col">
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Global ELO</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${r}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Solved</span>
          <span class="ws-meta-kpi-val">${p}/${o} <span style="font-size:11px;color:var(--ivory-muted);">(${n}%)</span></span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Streak</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${d}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Trust · Favor</span>
          <span class="ws-meta-kpi-val" style="font-size:14px;"><span style="color:var(--cyan-clue);">${y}%</span> · <span style="color:var(--emerald-win);">${x}%</span></span>
        </div>
      </div>

      <div class="ws-meta-two-col" style="padding-top:14px;">
        <!-- Left Spread: Challenger Identity & Diplomatic Crests -->
        <div style="display:flex;flex-direction:column;gap:0;">
          <div class="ws-meta-section" style="padding-top:0;">
            <label for="ws-passport-name-input" class="ws-meta-section-title">
              Registered Challenger Name
            </label>
            <div style="display:flex;gap:10px;align-items:center;">
              <input
                id="ws-passport-name-input"
                class="ws-meta-input ws-name-input"
                style="flex:1 1 auto;"
                type="text"
                maxlength="22"
                autocomplete="off"
                spellcheck="false"
                placeholder="Enter your name, Challenger..."
                value="${h(l)}"
              />
              <button type="button" class="ws-meta-btn-gold" id="ws-passport2-save-name">
                ✦ Stamp
              </button>
            </div>
            ${this.nameFeedbackMsg?`<div style="font-size:11.5px;color:${this.nameFeedbackMsg.isError?"var(--crimson-alert)":"var(--emerald-win)"};">${h(this.nameFeedbackMsg.text)}</div>`:'<div style="font-size:11.5px;color:var(--ivory-dim);">Appears on broadcast scoreboards, Vance dialogue &amp; Daily Share Cards.</div>'}
          </div>

          <div class="ws-meta-section">
            <div class="ws-meta-row" style="padding-top:0;">
              <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">VETTING ORIGIN</span>
              <span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--cyan-clue);">${h(i?.title??"Independent Outsider")}</span>
            </div>
            <div class="ws-meta-row">
              <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">COUNCIL ALLEGIANCE</span>
              <span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--gold-bright);">${h(g)}</span>
            </div>
            <div class="ws-meta-row" style="border-bottom:none;padding-bottom:0;">
              <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">INTEGRITY AXIS</span>
              <span style="font-family:var(--font-mono);font-size:12.5px;font-weight:700;color:var(--ivory-primary);">${u>=0?`+${u}`:u}</span>
            </div>
          </div>

          <div class="ws-meta-section" style="border-bottom:none;">
            <div class="ws-meta-section-title">Diplomatic Title Crests (${e.titleCrests.length})</div>
            <div class="ws-meta-hscroll">
              ${e.titleCrests.map(k=>{const f=k===e.activeTitleCrest;return`
                    <button type="button" class="ws-meta-chip ${f?"is-active":""}" data-select-crest="${h(k)}">
                      ${f?"✦ ":""}${h(k)}
                    </button>
                  `}).join("")}
            </div>
          </div>
        </div>

        <!-- Right Spread: Cognitive Persona Seal Ceremony & Signature Perk -->
        <div style="display:flex;flex-direction:column;gap:12px;--seal-accent:${m};">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div>
              <div class="ws-meta-section-title" style="color:var(--ivory-dim);">Psychometric Vetting Seal</div>
              <div style="font-family:var(--font-display);font-size:17px;font-weight:800;color:${m};margin-top:2px;">
                ${h(t?.title??"Unstamped Candidate")}
              </div>
            </div>
            <button type="button" class="ws-meta-inline-link" id="ws-passport2-restamp">
              ✦ Re-Stamp
            </button>
          </div>

          <div class="ws-persona-seal-stage" style="--seal-accent:${m};">
            <div class="ws-ink-ring-burst ${c}"></div>
            <div class="ws-persona-seal-disc ${c}">
              <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${m};letter-spacing:0.08em;">
                GENEVA SEAL
              </div>
              <div style="font-family:var(--font-display);font-size:14px;font-weight:800;color:var(--ivory-primary);margin:4px 0 3px;line-height:1.15;">
                ${h((t?.title??"CANDIDATE").toUpperCase())}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);">
                ${h(t?.stampCode??"MRD-00")}
              </div>
              <div style="margin-top:4px;font-family:var(--font-mono);font-size:10px;color:var(--emerald-win);">
                ${e.stampedAtIso?`${h(e.stampedAtIso.slice(0,10))}`:"AWAITING Q1–Q4"}
              </div>
            </div>
            <div style="margin-top:10px;font-size:12.5px;color:var(--ivory-primary);font-style:italic;text-align:center;max-width:380px;line-height:1.42;">
              “${h(M(e.persona&&Ue[e.persona]?.spokenQuote||t?.motto||"Complete Julian Vance’s 4-Question Geneva Vetting Assessment to stamp your Cognitive Persona."))}”
            </div>
            ${e.persona&&Ue[e.persona]?`<div style="margin-top:4px;font-size:11px;color:var(--cyan-clue);text-align:center;max-width:380px;">
                    ✦ ${h(M(Ue[e.persona].tellCaption))}
                  </div>`:""}
          </div>

          <div class="ws-meta-note">
            <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
              SIGNATURE PERK · ${h(t?.startingPerkName??"Clean Calibration")}
            </div>
            <div style="font-size:12px;color:var(--ivory-muted);margin-top:3px;">
              ${h(t?.startingPerkDesc??t?.dossierAssessment??"Your Spin, Peel, and Overclock instincts in Geneva determine your permanent starting signature perk.")}
            </div>
            ${v.length>0?`<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:8px;font-family:var(--font-mono);font-size:10.5px;color:var(--cyan-clue);">
                    ${v.map(k=>`<span>◆ ${h(k.name)}</span>`).join("")}
                  </div>`:""}
          </div>
        </div>
      </div>
    `}renderVisasTab(e){return`
      <div class="ws-meta-section" style="border-bottom:none;">
        <div>
          <div class="ws-meta-section-title">Eight Sovereign Hub Visas</div>
          <div style="font-size:12px;color:var(--ivory-muted);margin-top:3px;">
            Clear each World Venue to stamp your Diplomatic Visa &amp; recover its 3D Tier-3 Boss Relic.
          </div>
        </div>
        <div class="ws-visa-grid">
          ${rt.map(t=>{const i=e.visas[t];if(!i)return"";const r=this.deps.visaStampUrls?.[t]??`./assets/visas/visa_${t}.png`,n=ys(t,i.cleared),o=C[i.relicId],p=i.totalMissions>6?10:12,d=Array.from({length:Math.min(12,i.totalMissions)},(l,m)=>`<img src="./assets/ui/${i.cleared||m<i.missionsCompleted?"star_filled":"star_empty"}.png" alt="" style="width:${p}px;height:${p}px;object-fit:contain;" />`).join("");return`
        <div class="ws-visa-card ${i.cleared?"is-cleared":"is-locked"}">
          <img
            class="ws-visa-stamp-img"
            src="${h(r)}"
            data-fallback-src="${h(n)}"
            alt="${h(i.city)} Diplomatic Visa Stamp"
            style="${i.cleared?"":"filter:grayscale(0.85) opacity(0.6);"}"
          />
          <div style="font-family:var(--font-display);font-size:12.5px;font-weight:800;color:var(--ivory-primary);letter-spacing:0.04em;">
            ${h(i.city.toUpperCase())}
          </div>
          <div style="font-family:var(--font-mono);font-size:10px;color:${i.cleared?"var(--emerald-win)":"#9aa4b7"};font-weight:700;">
            ${h(i.stampSerial)} · ${i.cleared?"CLEARED":`${i.missionsCompleted}/${i.totalMissions}`}
          </div>
          <div style="font-size:10.5px;color:var(--ivory-muted);line-height:1.25;">
            ${h(i.visaTitle)}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:2px;align-items:center;justify-content:center;margin:2px auto;max-width:136px;">
            ${d}
          </div>
          ${this.callbacks.onInspectRelicInObservatory?`
                <button type="button" class="ws-meta-inline-link" data-inspect-relic="${i.relicId}" style="margin-top:auto;font-size:10.5px;justify-content:center;">
                  ${i.relicUnlocked||i.cleared?"◆":"◇"} ${h(o?.name??"Relic")} ›
                </button>
              `:""}
        </div>
      `}).join("")}
        </div>
      </div>
    `}renderRadarTab(e){const a=e[this.focusedDomainId]??e[0],t=q[this.focusedDomainId]??q[0];let i=e[0],r=e[0];for(const o of e)o.elo>i.elo&&(i=o),o.elo<r.elo&&(r=o);const n=a.theta>=0?`+${a.theta.toFixed(2)}`:a.theta.toFixed(2);return`
      <div class="ws-meta-two-col">
        <!-- Left: Interactive SVG 12-Domain Radar -->
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="text-align:center;">
            <div class="ws-meta-section-title">12-Domain IRT Cognitive Radar (θ)</div>
            <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
              Tap any spoke or domain row to inspect telemetry
            </div>
          </div>

          ${vs(e,this.focusedDomainId)}

          <div class="ws-meta-note" style="box-shadow:inset 3px 0 0 ${t.accentHex};display:flex;align-items:center;gap:10px;padding:8px 0 8px 12px;">
            <img src="./${h(t.medallionUrl)}" alt="" style="width:36px;height:36px;object-fit:contain;flex-shrink:0;" />
            <div style="min-width:0;flex:1 1 auto;">
              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;align-items:baseline;">
                <span style="font-family:var(--font-display);font-size:14px;font-weight:800;color:${t.accentHex};">
                  ${h(a.name)}
                </span>
                <span style="font-family:var(--font-mono);font-size:11.5px;font-weight:700;color:var(--gold-bright);">
                  ELO ${a.elo} · θ ${n}
                </span>
              </div>
              <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
                ${h(a.rankTitle)} · Mastery ${a.masteryPct}% · <strong style="color:var(--cyan-clue);">${h(t.factionAffinity)}</strong>
              </div>
              ${this.callbacks.onOpenDomainAnalytics?`<button type="button" class="ws-meta-inline-link" data-passport-focused-stats="${this.focusedDomainId}" style="margin-top:4px;min-height:44px;padding:0 4px;">
                      ▸ Drill Into ${h(a.shortName)} Career Stats
                    </button>`:""}
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-muted);padding-top:6px;border-top:1px solid rgba(255,255,255,0.07);">
            <span>★ APEX: <strong style="color:var(--emerald-win);">${h(i.shortName)} (${i.elo})</strong></span>
            <span>▲ TARGET: <strong style="color:var(--amber-warn);">${h(r.shortName)} (${r.elo})</strong></span>
          </div>
        </div>

        <!-- Right: Hairline 12-Domain ELO List (Clickable -> Career Stats drilled to exact domain!) -->
        <div style="display:flex;flex-direction:column;">
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:6px;">
            <div class="ws-meta-section-title">Domain ELO &amp; Mastery</div>
            ${this.callbacks.onOpenDomainAnalytics?'<span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">Tap any domain for Career Stats</span>':""}
          </div>
          ${e.map((o,p)=>{const d=q[p];return`
                <button
                  type="button"
                  class="ws-meta-row is-interactive ws-stats-row-btn ${p===this.focusedDomainId?"is-focused":""}"
                  data-passport-domain-stats="${p}"
                  data-focus-domain="${p}"
                  aria-label="Open Career Stats for ${h(d.name)}"
                >
                  <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                    <img src="./${h(d.medallionUrl)}" alt="" style="width:24px;height:24px;object-fit:contain;flex-shrink:0;" />
                    <span style="font-size:12.5px;font-weight:600;color:var(--ivory-primary);">${h(o.shortName)}</span>
                  </span>
                  <span style="font-family:var(--font-mono);font-size:11.5px;font-weight:700;color:${d.accentHex};flex-shrink:0;display:inline-flex;align-items:center;gap:7px;">
                    <span>${o.elo} <span style="color:#a5afc2;font-weight:500;">· ${o.masteryPct}%</span></span>
                    ${this.callbacks.onOpenDomainAnalytics?'<span style="color:var(--gold-bright);font-size:11px;">Stats ▸</span>':""}
                  </span>
                </button>
              `}).join("")}
        </div>
      </div>
    `}renderGlobalFeedTab(e){const a=ot(),t=[...e.dailyHistory].sort((o,p)=>p.utcDate.localeCompare(o.utcDate)),i=Math.max(a.bestPercentile,...t.map(o=>o.percentile),0),r=i>0?Math.max(1,100-i):null,n=Math.max(a.bestScore,...t.map(o=>o.score),0);return`
      <div class="ws-meta-kpi-strip">
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Daily Streak</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${a.dailyStreak}d ✦</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Percentile</span>
          <span class="ws-meta-kpi-val" style="color:var(--emerald-win);">${r!==null?`TOP ${r}%`:"UNRANKED"}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Broadcast</span>
          <span class="ws-meta-kpi-val">${Math.round(n).toLocaleString("en-US")} <span style="font-size:10.5px;color:var(--ivory-dim);">PTS</span></span>
        </div>
      </div>

      ${t.length>0?`
            <div class="ws-meta-section">
              <div class="ws-meta-section-title">Percentile Trajectory (Last ${Math.min(14,t.length)} UTC Broadcasts)</div>
              ${ws([...e.dailyHistory])}
            </div>

            <div class="ws-meta-section" style="border-bottom:none;">
              <div class="ws-meta-section-title">Broadcast Ledger (00:00 UTC)</div>
              <div>
                ${t.map(o=>{const p=Math.max(1,100-be(o.percentile,1,99)),d=a.shareCardsByDate[o.utcDate],l=this.copiedDateToast===o.utcDate;return`
                      <div class="ws-meta-row" style="flex-wrap:wrap;">
                        <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
                          <span style="font-family:var(--font-mono);font-size:12.5px;font-weight:700;color:var(--gold-bright);">
                            ${h(o.utcDate)}
                          </span>
                          <span style="font-family:var(--font-mono);font-size:12px;color:var(--ivory-primary);">
                            ${Math.round(o.score).toLocaleString("en-US")} PTS
                          </span>
                          <span style="font-size:11.5px;color:var(--ivory-muted);">
                            ${o.correctCount}/7
                          </span>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;">
                          <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--emerald-win);">
                            TOP ${p}%
                          </span>
                          ${d?`<button type="button" class="ws-meta-inline-link" data-copy-daily="${h(o.utcDate)}">
                                  ${l?"✓ Copied":"Share"}
                                </button>`:""}
                        </div>
                      </div>
                    `}).join("")}
              </div>
            </div>
          `:`
            <div class="ws-meta-section" style="text-align:center;padding:32px 12px;border-bottom:none;">
              <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--gold-bright);margin-bottom:6px;">
                No Global Feed Broadcasts Yet
              </div>
              <div style="font-size:12.5px;color:var(--ivory-muted);max-width:420px;margin:0 auto;line-height:1.45;">
                Complete today’s synchronized 00:00 UTC World Broadcast in <strong>The Global Feed</strong> to record your Global Percentile and Share Card.
              </div>
            </div>
          `}
    `}bindEvents(e){e.querySelectorAll("img[data-fallback-src]").forEach(r=>{r.addEventListener("error",()=>{const n=r.dataset.fallbackSrc;n&&r.src!==n&&(r.src=n)},{once:!0})}),e.querySelector("#ws-passport2-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),le(e,{closeBtnId:"ws-passport2-close",onNavigate:r=>this.callbacks.onNavigateSection?.(r),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-passport-tab]").forEach(r=>{r.addEventListener("click",()=>{const n=r.dataset.passportTab;!n||n===this.activeTab||(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.activeTab=n,this.nameFeedbackMsg=null,this.rerender())})});const a=e.querySelector("#ws-passport-name-input");if(a){const r=o=>o.stopPropagation();a.addEventListener("keyup",r),a.addEventListener("keypress",r),a.addEventListener("input",()=>{const o=rs(a.value);a.value!==o&&(a.value=o)});const n=()=>{const o=os(a.value);if(!o.valid){this.nameFeedbackMsg={text:o.error??"Enter a valid name (1–22 characters).",isError:!0},this.rerender();return}this.deps.passport.setChallengerName(o.cleaned),this.nameFeedbackMsg={text:`Credentials stamped for ${o.cleaned}.`,isError:!1},this.stampAnimating=!0,this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp"),this.callbacks.onPassportStamped?.(),this.callbacks.onRenameChallenger?.(o.cleaned),this.rerender()};e.querySelector("#ws-passport2-save-name")?.addEventListener("click",n),a.addEventListener("keydown",o=>{o.stopPropagation(),o.key==="Enter"&&(o.preventDefault(),n())})}e.querySelector("#ws-passport2-restamp")?.addEventListener("click",()=>{this.triggerStampCeremony()}),e.querySelectorAll("[data-select-crest]").forEach(r=>{r.addEventListener("click",()=>{const n=r.dataset.selectCrest;n&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.deps.passport.unlockTitleCrest(n,!0),this.rerender())})}),e.querySelectorAll("[data-inspect-relic]").forEach(r=>{r.addEventListener("click",()=>{const n=r.dataset.inspectRelic;n&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onInspectRelicInObservatory?.(n))})});const t=r=>{const n=Number(r);!Number.isFinite(n)||n<0||n>11||(this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.focusedDomainId=n,this.rerender())},i=r=>{const n=Number(r);!Number.isFinite(n)||n<0||n>11||(this.focusedDomainId=n,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onOpenDomainAnalytics?this.callbacks.onOpenDomainAnalytics(n):this.rerender())};e.querySelectorAll("[data-passport-domain-stats]").forEach(r=>{r.addEventListener("click",()=>i(r.dataset.passportDomainStats))}),e.querySelectorAll("[data-passport-focused-stats]").forEach(r=>{r.addEventListener("click",()=>i(r.dataset.passportFocusedStats))}),e.querySelectorAll("[data-radar-domain]").forEach(r=>{r.addEventListener("click",()=>t(r.getAttribute("data-radar-domain")??void 0))}),e.querySelectorAll("[data-copy-daily]").forEach(r=>{r.addEventListener("click",()=>{const n=r.dataset.copyDaily;if(!n)return;const o=ot().shareCardsByDate[n];o&&(navigator.clipboard?.writeText(o).catch(()=>{}),this.copiedDateToast=n,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})})}}const nt="ws_spaced_repetition_v2",ye=3600*1e3,re=24*ye,lt=0,_t=4*ye,se={1:_t,2:1*re,3:3*re,4:7*re,5:21*re},Ss={1:"Box 1 · Immediate",2:"Box 2 · 24h",3:"Box 3 · 3 Days",4:"Box 4 · 7 Days",5:"Box 5 · Mastered"},It={1:"Now",2:"24h",3:"3d",4:"7d",5:"21d"},ct=600;function Ae(s){return Number.isFinite(s)?Math.max(0,Math.min(11,Math.floor(s))):0}function ks(s){return Number.isFinite(s)?Math.max(1,Math.min(5,Math.round(s))):1}function B(s){return String(s??"").trim().replace(/\b(in|from|since|circa|c\.|by|until|around|year|founded|born|died)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\(([12]),(\d{3})([–\-]([12]),?(\d{3}))?\)/g,(e,a,t,i,r,n)=>i&&r&&n?`(${a}${t}–${r}${n})`:`(${a}${t})`).replace(/\b([12]),(\d{3})\s*(CE|BCE|AD|BC)\b/g,"$1$2 $3").replace(/\b([12]),(\d{3})([–\-])([12]),(\d{3})\b/g,"$1$2$3$4$5")}function pe(s,e){if(!Array.isArray(s))return[];const a=e.trim().toLowerCase(),t=new Set,i=[];for(const r of s){const n=B(String(r??""));if(!n)continue;const o=n.toLowerCase();if(!(o===a||t.has(o))&&(t.add(o),i.push(n),i.length>=3))break}return i}function F(s){return{...s,distractors:[...s.distractors]}}function Es(s,e=Date.now()){const a=s-e;return a<=0?"Due now":a<ye?`in ${Math.max(1,Math.ceil(a/6e4))}m`:a<re?`in ${Math.max(1,Math.round(a/ye))}h`:`in ${Math.max(1,Math.round(a/re))}d`}const qe=[{qid:900001,domainId:0,subcatLabel:"Modern Diplomacy",prompt:'Which 1814–1815 European diplomatic summit was nicknamed "The Dancing Congress"?',correctAnswer:"Congress of Vienna",distractors:["Treaty of Utrecht","Congress of Berlin","Peace of Westphalia"],whyExplanation:"Prince Metternich hosted lavish nightly balls in Vienna while redrawing post-Napoleonic Europe’s borders.",initialBox:1,dueNow:!0},{qid:900002,domainId:1,subcatLabel:"Materials & Elements",prompt:"Which pure metallic element possesses the highest melting point at 3,422 °C?",correctAnswer:"Tungsten",distractors:["Osmium","Rhenium","Tantalum"],whyExplanation:"Tungsten (W, atomic number 74) owes its extreme thermal resilience to dense 5d-orbital metallic bonding.",initialBox:1,dueNow:!0},{qid:900007,domainId:5,subcatLabel:"Baseball",prompt:"Which Cardinals ace posted an astonishing 1.12 ERA in 1968, prompting MLB to lower the pitcher’s mound?",correctAnswer:"Bob Gibson",distractors:["Sandy Koufax","Tom Seaver","Juan Marichal"],whyExplanation:"Gibson threw 13 shutouts and 28 complete games in 1968; MLB lowered the mound from 15 to 10 inches the next winter.",initialBox:1,dueNow:!0},{qid:900003,domainId:2,subcatLabel:"Maritime Straits",prompt:"Which narrow waterway divides the European and Asian halves of Istanbul?",correctAnswer:"Bosphorus Strait",distractors:["Dardanelles","Strait of Hormuz","Kerch Strait"],whyExplanation:"Linking the Black Sea to the Sea of Marmara, the Bosphorus is the world’s narrowest strait used for international shipping.",initialBox:2,dueNow:!1},{qid:900005,domainId:6,subcatLabel:"Computing History",prompt:"Who authored the 1843 Note G algorithm for Charles Babbage’s Analytical Engine?",correctAnswer:"Ada Lovelace",distractors:["Grace Hopper","Alan Turing","Claude Shannon"],whyExplanation:"Lovelace published an algorithm for Bernoulli numbers and foresaw symbolic computing beyond pure arithmetic.",initialBox:2,dueNow:!1},{qid:900006,domainId:11,subcatLabel:"Game Theory",prompt:"In game theory, what state holds when no player gains by unilaterally changing strategy?",correctAnswer:"Nash Equilibrium",distractors:["Pareto Optimality","Bayes’ Theorem","Prisoner’s Dilemma"],whyExplanation:"John Nash proved its existence across finite non-cooperative games in 1950 using Kakutani’s fixed-point theorem.",initialBox:5,dueNow:!1}];class Rt{cards=new Map;listeners=new Set;constructor(e){this.load(),e&&this.syncFromPassportBookmarks(e.getSnapshot().bookmarks)}load(){this.cards.clear();try{if(typeof localStorage>"u")return;const e=localStorage.getItem(nt);if(!e)return;const a=JSON.parse(e);if(!a||!Array.isArray(a.cards))return;for(const t of a.cards){if(!t||typeof t!="object")continue;const i=Math.floor(Number(t.qid));if(!Number.isFinite(i)||i<=0)continue;const r=B(String(t.prompt??"")),n=B(String(t.correctAnswer??""));if(!r||!n)continue;const o=ks(Number(t.box)||1),p=Number.isFinite(Number(t.createdAtMs))?Number(t.createdAtMs):Date.now(),d=Number.isFinite(Number(t.nextReviewAtMs))?Number(t.nextReviewAtMs):p,l=t.lastReviewedAtMs!==null&&Number.isFinite(Number(t.lastReviewedAtMs))?Number(t.lastReviewedAtMs):null,c=["MISSED","BOOKMARKED","BOTH","SEED"].includes(t.source)?t.source:"MISSED";this.cards.set(i,{qid:i,prompt:r,correctAnswer:n,distractors:pe(t.distractors,n),whyExplanation:B(String(t.whyExplanation??"")),domainId:Ae(Number(t.domainId)),subcatLabel:t.subcatLabel?B(String(t.subcatLabel)):void 0,box:o,source:c,isBookmarked:!!(t.isBookmarked||c==="BOOKMARKED"||c==="BOTH"),isSeed:!!(t.isSeed||c==="SEED"),createdAtMs:p,lastReviewedAtMs:l,nextReviewAtMs:d,totalReviews:Math.max(0,Math.floor(Number(t.totalReviews)||0)),correctReviews:Math.max(0,Math.floor(Number(t.correctReviews)||0)),wrongReviews:Math.max(0,Math.floor(Number(t.wrongReviews)||0)),streakInDeck:Math.max(0,Math.floor(Number(t.streakInDeck)||0))})}}catch{}}enforceCapacity(){if(this.cards.size<=ct)return;const e=Array.from(this.cards.values()).sort((t,i)=>t.isBookmarked!==i.isBookmarked?t.isBookmarked?1:-1:t.box!==i.box?i.box-t.box:t.createdAtMs-i.createdAtMs),a=this.cards.size-ct;for(let t=0;t<a&&t<e.length;t++)this.cards.delete(e[t].qid)}save(){this.enforceCapacity();try{if(typeof localStorage<"u"){const e={schemaVersion:2,updatedAtMs:Date.now(),cards:Array.from(this.cards.values())};localStorage.setItem(nt,JSON.stringify(e))}}catch{}for(const e of this.listeners)e()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}ingestQuestionOutcome(e){const a=Math.floor(Number(e.qid));if(!Number.isFinite(a)||a<=0)return null;const t=B(e.prompt),i=B(e.correctAnswer);if(!t||!i)return null;const r=Number.isFinite(e.nowMs)?Number(e.nowMs):Date.now(),n=Ae(Number(e.domainId)),o=B(e.whyExplanation),p=pe(e.distractors,i),d=e.subcatLabel?B(e.subcatLabel):void 0,l=!!e.wasCorrect,m=!!e.wasBookmarked,c=this.cards.get(a);if(!l){if(!c){const x={qid:a,prompt:t,correctAnswer:i,distractors:p,whyExplanation:o,domainId:n,subcatLabel:d,box:1,source:m?"BOTH":"MISSED",isBookmarked:m,isSeed:!1,createdAtMs:r,lastReviewedAtMs:null,nextReviewAtMs:r+lt,totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:0};return this.cards.set(a,x),this.save(),F(x)}const y=c.box===1&&!c.isSeed&&(c.source==="MISSED"||c.source==="BOTH");return c.prompt=t,c.correctAnswer=i,p.length>0&&(c.distractors=p),o&&(c.whyExplanation=o),d&&(c.subcatLabel=d),c.domainId=n,c.box=1,c.isSeed=!1,c.isBookmarked=c.isBookmarked||m,c.source=c.isBookmarked?"BOTH":"MISSED",c.lastReviewedAtMs=r,c.totalReviews+=1,c.wrongReviews+=1,c.streakInDeck=0,c.nextReviewAtMs=r+(y?_t:lt),this.save(),F(c)}if(m){if(!c){const y={qid:a,prompt:t,correctAnswer:i,distractors:p,whyExplanation:o,domainId:n,subcatLabel:d,box:2,source:"BOOKMARKED",isBookmarked:!0,isSeed:!1,createdAtMs:r,lastReviewedAtMs:r,nextReviewAtMs:r+se[2],totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:1};return this.cards.set(a,y),this.save(),F(y)}return c.isBookmarked=!0,c.isSeed=!1,c.source=c.source==="MISSED"||c.source==="BOTH"?"BOTH":"BOOKMARKED",p.length>0&&(c.distractors=p),o&&(c.whyExplanation=o),d&&(c.subcatLabel=d),this.save(),F(c)}if(!c)return null;const u=Math.min(5,c.box+1);return c.box=u,c.lastReviewedAtMs=r,c.nextReviewAtMs=r+se[u],c.totalReviews+=1,c.correctReviews+=1,c.streakInDeck+=1,p.length>0&&(c.distractors=p),o&&(c.whyExplanation=o),d&&(c.subcatLabel=d),this.save(),F(c)}upsertBookmarkCard(e,a,t=Date.now()){const i=Math.floor(Number(e.qid));if(!Number.isFinite(i)||i<=0)return null;const r=this.cards.get(i);if(r){r.isBookmarked=!0,r.isSeed=!1,r.source=r.source==="MISSED"||r.source==="BOTH"?"BOTH":"BOOKMARKED";const m=pe(a,r.correctAnswer);return m.length>0&&(r.distractors=m),this.save(),F(r)}const n=B(e.prompt),o=B(e.answer);if(!n||!o)return null;const p=Date.parse(e.savedAtIso),d=Number.isFinite(p)?p:t,l={qid:i,prompt:n,correctAnswer:o,distractors:pe(a,o),whyExplanation:B(e.whyExplanation),domainId:Ae(Number(e.domainId)),box:2,source:"BOOKMARKED",isBookmarked:!0,isSeed:!1,createdAtMs:d,lastReviewedAtMs:null,nextReviewAtMs:d+se[2],totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:0};return this.cards.set(i,l),this.save(),F(l)}syncFromPassportBookmarks(e,a=Date.now()){let t=0;const i=new Set;for(const r of e){const n=Math.floor(Number(r?.qid));if(!Number.isFinite(n)||n<=0)continue;i.add(n);const o=this.cards.get(n);if(o)o.isBookmarked||(o.isBookmarked=!0,o.isSeed=!1,o.source=o.source==="MISSED"||o.source==="BOTH"?"BOTH":"BOOKMARKED",t+=1);else{const p=B(r.prompt),d=B(r.answer);if(!p||!d)continue;const l=Date.parse(r.savedAtIso),m=Number.isFinite(l)?l:a;this.cards.set(n,{qid:n,prompt:p,correctAnswer:d,distractors:[],whyExplanation:B(r.whyExplanation),domainId:Ae(Number(r.domainId)),box:2,source:"BOOKMARKED",isBookmarked:!0,isSeed:!1,createdAtMs:m,lastReviewedAtMs:null,nextReviewAtMs:m+se[2],totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:0}),t+=1}}for(const[r,n]of Array.from(this.cards.entries()))n.isBookmarked&&!i.has(r)&&(n.source==="BOOKMARKED"?this.cards.delete(r):(n.isBookmarked=!1,n.source="MISSED"),t+=1);return t>0&&this.save(),t}recordReviewAttempt(e,a,t=Date.now()){const i=this.cards.get(Math.floor(Number(e)));if(!i)return null;const r=Number.isFinite(t)?t:Date.now(),n=i.box;i.totalReviews+=1,i.lastReviewedAtMs=r;let o;return a?(o=Math.min(5,n+1),i.box=o,i.correctReviews+=1,i.streakInDeck+=1,i.nextReviewAtMs=r+se[o]):(o=1,i.box=1,i.wrongReviews+=1,i.streakInDeck=0,i.nextReviewAtMs=r),this.save(),{card:F(i),previousBox:n,newBox:o,wasCorrect:a,nextIntervalLabel:a?It[o]:"Now",promoted:a&&o>n,resetToBox1:!a}}getDueCards(e=Date.now(),a){const t=Number.isFinite(e)?e:Date.now(),i=Array.from(this.cards.values()).filter(r=>r.nextReviewAtMs<=t).sort((r,n)=>r.box!==n.box?r.box-n.box:r.nextReviewAtMs!==n.nextReviewAtMs?r.nextReviewAtMs-n.nextReviewAtMs:r.wrongReviews!==n.wrongReviews?n.wrongReviews-r.wrongReviews:r.createdAtMs-n.createdAtMs).map(F);return typeof a=="number"&&a>=0?i.slice(0,Math.floor(a)):i}getDueCount(e=Date.now()){const a=Number.isFinite(e)?e:Date.now();let t=0;for(const i of this.cards.values())i.nextReviewAtMs<=a&&(t+=1);return t}getAllCards(){return Array.from(this.cards.values()).sort((e,a)=>e.box!==a.box?e.box-a.box:e.nextReviewAtMs!==a.nextReviewAtMs?e.nextReviewAtMs-a.nextReviewAtMs:a.createdAtMs-e.createdAtMs).map(F)}getMasteredCards(){return Array.from(this.cards.values()).filter(e=>e.box===5).sort((e,a)=>(a.lastReviewedAtMs??a.createdAtMs)-(e.lastReviewedAtMs??e.createdAtMs)).map(F)}getCard(e){const a=this.cards.get(Math.floor(Number(e)));return a?F(a):null}removeCard(e){const a=this.cards.delete(Math.floor(Number(e)));return a&&this.save(),a}clearAll(){this.cards.clear(),this.save()}getDeckSummary(e=Date.now()){const a=Number.isFinite(e)?e:Date.now(),t=[0,0,0,0,0];let i=0,r=0,n=0,o=0,p=0;for(const c of this.cards.values())t[c.box-1]+=1,c.nextReviewAtMs<=a&&(i+=1),r+=c.totalReviews,n+=c.correctReviews,(c.source==="MISSED"||c.source==="BOTH")&&(o+=1),c.isBookmarked&&(p+=1);const d=this.cards.size,l=t[4],m=r>0?Math.round(n/r*100):d>0?Math.round((d-t[0])/d*100):0;return{totalCards:d,dueCount:i,masteredCount:l,boxCounts:t,retentionPct:m,missedCount:o,bookmarkedCount:p}}seedDemoCardsIfEmpty(e=Date.now()){if(this.cards.size>0)return!1;const a=Number.isFinite(e)?e:Date.now();for(let t=0;t<qe.length;t++){const i=qe[t],r=i.dueNow?a-(qe.length-t)*1e3:a+se[i.initialBox];this.cards.set(i.qid,{qid:i.qid,prompt:B(i.prompt),correctAnswer:B(i.correctAnswer),distractors:pe(i.distractors,i.correctAnswer),whyExplanation:B(i.whyExplanation),domainId:i.domainId,subcatLabel:i.subcatLabel,box:i.initialBox,source:"SEED",isBookmarked:!1,isSeed:!0,createdAtMs:a-(t+1)*6e4,lastReviewedAtMs:i.initialBox>1?a-ye:null,nextReviewAtMs:r,totalReviews:i.initialBox===5?4:i.initialBox===2?1:0,correctReviews:i.initialBox===5?4:i.initialBox===2?1:0,wrongReviews:0,streakInDeck:i.initialBox===5?4:i.initialBox===2?1:0})}return this.save(),!0}}function Ke(s){return s==="MASTERY"||s==="SELF_QUIZ"?"SELF_QUIZ":s==="INTEL_FLASHES"?"INTEL_FLASHES":"RELICS_3D"}function ze(s){if(s==null)return"ALL";const e=Math.floor(Number(s));return!Number.isFinite(e)||e<0||e>11?"ALL":e}let ue=null,_e=null;function dt(){return ue?Promise.resolve(ue):_e||(_e=(async()=>{try{if(typeof fetch!="function")return{};const s=await fetch("./data/narrative_wave2.json");return s.ok?(s.headers.get("content-type")??"").includes("text/html")?{}:(ue=(await s.json()).tier3_relic_provenance??{},ue):{}}catch{return{}}})(),_e)}const ae=[{id:"championship_trophy",title:"First Citizen Arbiter Crown Trophy",cityLabel:"Apex Citadel",venueLabel:"World Council Grand Dais",countryCode:"WORLD",domainId:0,metallurgySpec:"24K Recycled Central-Bank Bullion · Suspended Sapphire Star Core",historicalProvenance:"Commissioned under the Geneva Charter of Human Stewardship to crown humanity’s First Citizen Arbiter before two billion live viewers.",conspiracyNote:"Its counter-rotating astrolabe rings physically house the analog optical key required to authorize—or veto—The Ledger’s global crisis protocols.",uvHiddenInscription:'UV MICRO-ETCHING: "NO SINGLE SUPERPOWER SHALL HOLD THE PEN ALONE — GENEVA ART. I"',unlockHowTo:"Showcase Preview Active · Full Arbiter Seal awarded upon completing The Apex Forum."},{id:"meridian_astrolabe",title:C.meridian_astrolabe.name,cityLabel:C.meridian_astrolabe.cityLabel,venueLabel:C.meridian_astrolabe.venueLabel,countryCode:"CH",domainId:1,metallurgySpec:"Vallée de Joux Brushed Brass · Anti-Reflective Sapphire Vernier",historicalProvenance:"Milled by fifth-generation Geneva chronometer makers for Chief Adjudicator Julian Vance’s private Vetting Chamber table.",conspiracyNote:"Vance uses its tolerance cone during Q4 not merely to score estimation accuracy, but to fingerprint risk-calibrated minds matching Trial Zero.",uvHiddenInscription:C.meridian_astrolabe.hiddenInscription,unlockHowTo:"Clear the 4-Question Geneva Vetting Prologue."},{id:"armillary_orrery",title:C.armillary_orrery.name,cityLabel:C.armillary_orrery.cityLabel,venueLabel:C.armillary_orrery.venueLabel,countryCode:"GB",domainId:0,metallurgySpec:"Aged Admiralty Bronze · 18K Sovereign Gold Declination Rings",historicalProvenance:"Modeled after 18th-century Greenwich celestial spheres and mounted beneath the glass rotunda of the Sovereign Bloc’s London headquarters.",conspiracyNote:"When rotated to 23.4° obliquity, a concealed spring latch exposes initials scratched during the erased 2019 pilot tournament.",uvHiddenInscription:C.armillary_orrery.hiddenInscription,unlockHowTo:"Defeat the London Stage 1 Boss Showdown in The Sovereign Rotunda."},{id:"origami_prism",title:C.origami_prism.name,cityLabel:C.origami_prism.cityLabel,venueLabel:C.origami_prism.venueLabel,countryCode:"JP",domainId:6,metallurgySpec:"Smoked Synthetic Quartz · Vapor-Deposited Titanium Hinges",historicalProvenance:"Engineered by Director Kenji Takahashi’s Horizon Collective seventy floors above Tokyo Station to celebrate high-velocity deduction.",conspiracyNote:"Internal waveguides double as a passive laser interferometer—encoding geodesic survey coordinates pointing directly beneath the Giza plateau.",uvHiddenInscription:C.origami_prism.hiddenInscription,unlockHowTo:"Clear the Tokyo Stage 2 Boss Showdown in the Shinkansen Sky Pavilion."},{id:"emerald_sphere",title:C.emerald_sphere.name,cityLabel:C.emerald_sphere.cityLabel,venueLabel:C.emerald_sphere.venueLabel,countryCode:"BR",domainId:7,metallurgySpec:"Beryl-Quartz Acoustic Resonator · Spun Botanical Brass Ribs",historicalProvenance:"Suspended beneath Rio de Janeiro’s Botanical Glass Canopy, resonating at 432 Hz whenever a Challenger locks an unassisted Cold Instinct.",conspiracyNote:"Acoustic engineer Nadia Al-Mansoor recognized the sphere’s Helmholtz chamber immediately—it was tuned using her vanished brother Tariq’s equations.",uvHiddenInscription:C.emerald_sphere.hiddenInscription,unlockHowTo:"Clear the Rio de Janeiro Stage 3 Boss Showdown."},{id:"cipher_box",title:C.cipher_box.name,cityLabel:C.cipher_box.cityLabel,venueLabel:C.cipher_box.venueLabel,countryCode:"EG",domainId:10,metallurgySpec:"Tura Limestone Core · Counter-Rotating Pharaonic Electrum Tumblers",historicalProvenance:"Recovered from the subterranean Meridian Zero vault beneath Cairo’s Solar Acoustic Hall during the staged broadcast blackout.",conspiracyNote:"Contains the unredacted 2019 Trial Zero psychometric ledger—proving your 99.4% cognitive match with erased first champion Tariq Al-Mansoor.",uvHiddenInscription:C.cipher_box.hiddenInscription,unlockHowTo:"Decrypt Cairo’s Stage 4 Meridian Zero Boss Showdown."},{id:"cryo_relay",title:C.cryo_relay.name,cityLabel:C.cryo_relay.cityLabel,venueLabel:C.cryo_relay.venueLabel,countryCode:"IS",domainId:11,metallurgySpec:"Columnar Icelandic Basalt · Superconducting Niobium-Gold Coil",historicalProvenance:"Cooled by sub-glacial meltwater inside Reykjavik’s Geothermal Basalt Caldera to sustain zero-latency global truth verification.",conspiracyNote:"Proves Julian Vance never eliminated Tariq—he faked Tariq’s erasure and spent five years co-engineering The Meridian as a public Trojan Horse trap.",uvHiddenInscription:C.cryo_relay.hiddenInscription,unlockHowTo:"Complete Reykjavik’s Stage 5 Caldera Showdown."},{id:"council_seal",title:C.council_seal.name,cityLabel:C.council_seal.cityLabel,venueLabel:C.council_seal.venueLabel,countryCode:"SG",domainId:8,metallurgySpec:"950 Platinum Charter Disc · Fractured Crimson Corundum Core",historicalProvenance:"The ceremonial Article IX Emergency Seal held above The Ledger’s primary data monoliths on Singapore’s Diplomatic Sky-Bridge.",conspiracyNote:"Split cleanly down its treaty seam during the inner-circle betrayal crisis—exposing the proxy signature behind Rio’s pod sabotage.",uvHiddenInscription:C.council_seal.hiddenInscription,unlockHowTo:"Survive Singapore’s Stage 6 Sky-Bridge Showdown."},{id:"master_ledger",title:C.master_ledger.name,cityLabel:C.master_ledger.cityLabel,venueLabel:C.master_ledger.venueLabel,countryCode:"GLOBAL",domainId:6,metallurgySpec:"Dichroic Diamond-Carbon Lattice · Triple-Gimbal 24K Veto Key",historicalProvenance:"Anchored in International Waters aboard The Apex Forum—the planetary crisis-forecasting and treaty-verification heart of The Ledger.",conspiracyNote:"Unlocked live before two billion witnesses in The Arbiter’s Gambit against Julian Vance himself.",uvHiddenInscription:C.master_ledger.hiddenInscription,unlockHowTo:"Triumph in Stage 7 International Waters — The Apex Forum Finale."}],As=[{qid:900001,domainId:0,prompt:'Which 1814–1815 European diplomatic summit was nicknamed "The Dancing Congress"?',answer:"Congress of Vienna",whyExplanation:"Prince Metternich hosted lavish nightly balls in Vienna while redrawing post-Napoleonic Europe’s borders.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900002,domainId:1,prompt:"Which element has the highest melting point of all pure metals at 3,422 °C?",answer:"Tungsten",whyExplanation:"Tungsten (W, atomic number 74) owes its extreme thermal resilience to dense 5d-orbital metallic bonding.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900003,domainId:2,prompt:"Which strait separates the European and Asian sides of Istanbul?",answer:"Bosphorus Strait",whyExplanation:"Linking the Black Sea to the Sea of Marmara, the Bosphorus is the world’s narrowest strait used for international navigation.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900004,domainId:3,prompt:"Traditional Japanese art of repairing broken pottery with lacquer dusted in powdered gold?",answer:"Kintsugi",whyExplanation:'Literally "golden joinery," Kintsugi treats breakage and repair as proud chapters of an object’s history rather than flaws to disguise.',savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900005,domainId:6,prompt:"Who authored the 1843 Note G algorithm for Charles Babbage’s Analytical Engine?",answer:"Ada Lovelace",whyExplanation:"Lovelace computed Bernoulli numbers and foresaw that symbolic engines could compose music and art beyond pure arithmetic.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900006,domainId:11,prompt:"In game theory, what state occurs when no player gains by unilaterally changing strategy?",answer:"Nash Equilibrium",whyExplanation:"Proven by John Nash in 1950 via Kakutani’s fixed-point theorem across every finite non-cooperative game.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0}],pt={0:["Treaty of Utrecht","Peace of Westphalia","Congress of Berlin","Treaty of Tilsit"],1:["Molybdenum","Osmium","Tantalum","Rhenium"],2:["Dardanelles","Strait of Hormuz","Bab-el-Mandeb","Kerch Strait"],3:["Raku Ware","Cloisonné","Chiaroscuro","Shibori"],4:["Palme d’Or","Golden Lion","Cinéma Vérité","Nouvelle Vague"],5:["Fosbury Flop","Elo Rating","Marquis of Queensberry","Tourbillon"],6:["Alan Turing","Grace Hopper","Claude Shannon","John von Neumann"],7:["Cambrian Explosion","Symbiogenesis","Convergent Evolution","Homeostasis"],8:["Geneva Convention","Westphalian Sovereignty","Habeas Corpus","Jus Cogens"],9:["Maillard Reaction","Guilloché","Damascus Steel","Haute Horlogerie"],10:["Allegory of the Cave","Ship of Theseus","Occam’s Razor","Categorical Imperative"],11:["Pareto Optimality","Prisoner’s Dilemma","Gödel Incompleteness","Bayes’ Theorem"]},_s=new Set(["verify (true)","debunk (false)","true","false"]);function ht(s,e,a){const t=M(s.correctAnswer).trim(),i=t.toLowerCase();if(i==="verify (true)"||i==="debunk (false)")return{options:["VERIFY (True)","DEBUNK (False)"],correctIdx:i==="verify (true)"?0:1};if(i==="true"||i==="false")return{options:["True","False"],correctIdx:i==="true"?0:1};const r=new Set([i]),n=[],o=(u,y=!1)=>{const x=M(u).trim();if(!x)return;const g=x.toLowerCase();y&&_s.has(g)||r.has(g)||(r.add(g),n.push(x))};for(const u of s.distractors)o(u,!0);const p=t.match(/^(\d{3,4})(?:\s+(CE|BCE|AD|BC))?$/i);if(p&&n.length<3){const u=Number(p[1]),y=p[2]?` ${p[2].toUpperCase()}`:"",x=u>=1900?[-11,-5,6,13,-18,19]:u>=1500?[-24,-9,12,27,-38,41]:[-65,-25,30,75,-110,120],g=Math.abs(s.qid)%x.length;for(let v=0;v<x.length&&n.length<3;v++){const k=u+x[(g+v)%x.length];k>0&&k<=2026&&o(`${k}${y}`,!0)}}for(const u of e){if(n.length>=3)break;u.qid!==s.qid&&u.domainId===s.domainId&&o(u.correctAnswer,!0)}for(const u of pt[s.domainId]??pt[0]){if(n.length>=3)break;o(u,!0)}for(const u of e){if(n.length>=3)break;u.qid!==s.qid&&o(u.correctAnswer,!0)}const d=n.slice(0,3);for(;d.length<3;)d.push(`Archive Candidate ${d.length+1}`);const l=[t,...d];let m=s.qid*2654435761+s.totalReviews*1013904223>>>0||1;for(let u=l.length-1;u>0;u--){m=Math.imul(m,1664525)+1013904223>>>0;const y=m%(u+1),x=l[u];l[u]=l[y],l[y]=x}const c=l.indexOf(t);return{options:l,correctIdx:Math.max(0,c)}}const Is={1:"#e05263",2:"#f09d46",3:"#56d4f5",4:"#f2cf7e",5:"#39d49a"};class Rs{deps;srs;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};activeTab="RELICS_3D";selectedArtifactId="championship_trophy";uvBlacklightActive=!1;relicLatchesOpen=!1;activeHotspotId=null;showcaseReqToken=0;searchQuery="";domainFilter="ALL";srsDomainFilter="ALL";includeSeedExemplars=!0;srsFilter="DUE";srsBoxFilter=null;srsActiveCard=null;srsActiveOptions=null;srsLastAttemptResult=null;quizCursor=0;quizPickedIdx=null;quizShutterFlipped=!1;quizCorrectCount=0;quizAttemptedCount=0;quizStreak=0;constructor(e){this.deps=e,this.srs=e.srsEngine??new Rt(e.passport),de()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.activeTab=Ke(e.initialTab),this.selectedArtifactId=e.initialArtifactId??"championship_trophy";const a=ze(e.initialDomainId);this.domainFilter=a,this.srsDomainFilter=a,this.uvBlacklightActive=!1,this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter();const t=document.createElement("div");t.setAttribute("role","dialog"),t.setAttribute("aria-label","3D Intel Observatory & Trophy Study"),document.body.appendChild(t),this.modalBackdrop=t,this.detachEscape=ce(()=>this.handleBackOrClose()),dt().then(()=>{this.isOpen()&&this.rerender()}),this.sync3DShowcase(),this.rerender()}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}const e=this.callbacks.onClose;this.close(),e?.()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}mount(e,a={}){this.unmount(),this.callbacks=a,this.activeTab=Ke(a.initialTab),this.selectedArtifactId=a.initialArtifactId??"championship_trophy";const t=ze(a.initialDomainId);this.domainFilter=t,this.srsDomainFilter=t,this.mountedContainer=e,this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter(),dt().then(()=>{this.isOpen()&&this.rerender()}),this.sync3DShowcase(),this.renderInto(e,!1)}resetSrsRunnerTurn(e=!1){this.srsActiveCard=null,this.srsActiveOptions=null,this.srsLastAttemptResult=null,this.quizPickedIdx=null,this.quizShutterFlipped=!1,e&&(this.quizCursor=0,this.srsBoxFilter=null)}getScopedSrsSummary(e=Date.now()){if(this.srsDomainFilter==="ALL"){const l=this.srs.getDeckSummary(e);return{totalCards:l.totalCards,dueCount:l.dueCount,masteredCount:l.masteredCount,boxCounts:l.boxCounts,retentionPct:l.retentionPct}}const a=this.srs.getAllCards().filter(l=>l.domainId===this.srsDomainFilter),t=[0,0,0,0,0];let i=0,r=0,n=0;for(const l of a)t[l.box-1]+=1,l.nextReviewAtMs<=e&&(i+=1),r+=l.totalReviews,n+=l.correctReviews;const o=a.length,p=t[4],d=r>0?Math.round(n/r*100):o>0?Math.round((o-t[0])/o*100):0;return{totalCards:o,dueCount:i,masteredCount:p,boxCounts:t,retentionPct:d}}syncSrsBookmarksAndDefaultFilter(){this.srs.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks);const e=this.getScopedSrsSummary();e.dueCount>0?this.srsFilter="DUE":e.totalCards>0?this.srsFilter="ALL":this.srsFilter="DUE"}getFilteredSrsCards(){let e;return this.srsFilter==="DUE"?e=this.srs.getDueCards():this.srsFilter==="MASTERED"?e=this.srs.getMasteredCards():e=this.srs.getAllCards(),this.srsDomainFilter!=="ALL"&&(e=e.filter(a=>a.domainId===this.srsDomainFilter)),this.srsBoxFilter!==null?e.filter(a=>a.box===this.srsBoxFilter):[...e]}unmount(){const e=this.mountedContainer!==null;this.showcaseReqToken+=1,this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.syncUiRootVisibility(!1),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null),(e||this.modalBackdrop!==null)&&this.deps.audio?.stopVoice()}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}selectArtifact(e){this.selectedArtifactId=e,this.activeTab="RELICS_3D",this.uvBlacklightActive=!1,this.sync3DShowcase(),this.rerender()}syncUiRootVisibility(e){if(typeof document>"u")return;document.documentElement.classList.toggle("ws-3d-showcase-open",e);const a=document.getElementById("ui-root");a&&(a.style.visibility=e?"hidden":"visible")}async sync3DShowcase(){const e=ae.find(t=>t.id===this.selectedArtifactId)??ae[0],a=++this.showcaseReqToken;this.callbacks.onInspectRelic?.(e.id),this.deps.stage3d&&(await this.deps.stage3d.showHeroRelic(e.id,e.domainId),!(a!==this.showcaseReqToken||!this.isOpen())&&(this.uvBlacklightActive&&this.deps.stage3d.setLightingMode("TWIST_FRACTURE"),this.actuate3DRelicLatches(this.relicLatchesOpen)))}actuate3DRelicLatches(e){if(this.deps.stage3d){this.deps.stage3d.actuateRelicLatches(e?3:0);return}}isArtifactUnlocked(e){if(e==="championship_trophy")return!0;const a=this.deps.passport.getSnapshot(),t=this.deps.blackboard?.getSnapshot();if(a.unlockedRelics.includes(e)||t?.unlockedRelics.includes(e))return!0;const i=C[e];return!!(i&&a.visas[i.hubId]?.cleared)}getCombinedFlashes(){const a=this.deps.passport.getSnapshot().bookmarks.map(r=>({...r,isSeedExemplar:!1})),t=a.length===0||this.includeSeedExemplars?[...a,...As.filter(r=>!a.some(n=>n.qid===r.qid))]:a,i=this.searchQuery.trim().toLowerCase();return t.filter(r=>{if(this.domainFilter!=="ALL"&&r.domainId!==this.domainFilter)return!1;if(!i)return!0;const n=H(r.domainId).name.toLowerCase();return r.prompt.toLowerCase().includes(i)||r.answer.toLowerCase().includes(i)||r.whyExplanation.toLowerCase().includes(i)||n.includes(i)})}rerender(){const e=this.activeTab==="RELICS_3D";this.modalBackdrop?(this.modalBackdrop.className=e?"ws-meta-backdrop is-stage-dock":"ws-meta-backdrop",this.syncUiRootVisibility(e),this.renderInto(this.modalBackdrop,!0)):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,a){const t=this.deps.passport.getSnapshot();this.srs.syncFromPassportBookmarks(t.bookmarks);const i=this.srs.getDeckSummary(),r=ae.filter(l=>l.id!=="championship_trophy"&&this.isArtifactUnlocked(l.id)).length,n=`
      <div class="ws-meta-underline-tabs" role="tablist" aria-label="Observatory Sections">
        <button type="button" role="tab" aria-selected="${this.activeTab==="RELICS_3D"}" class="ws-meta-underline-tab ${this.activeTab==="RELICS_3D"?"is-active":""}" data-obs-tab="RELICS_3D">
          360° Relics
        </button>
        <button type="button" role="tab" aria-selected="${this.activeTab==="INTEL_FLASHES"}" class="ws-meta-underline-tab ${this.activeTab==="INTEL_FLASHES"?"is-active":""}" data-obs-tab="INTEL_FLASHES">
          Saved Flashes${t.bookmarks.length>0?` (${t.bookmarks.length})`:""}
        </button>
        <button type="button" role="tab" aria-selected="${this.activeTab==="SELF_QUIZ"}" class="ws-meta-underline-tab ${this.activeTab==="SELF_QUIZ"?"is-active":""}" data-obs-tab="SELF_QUIZ">
          Mastery Deck${i.dueCount>0?` (${i.dueCount})`:""}
        </button>
      </div>
    `,o='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>',p='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';if(a&&this.activeTab==="RELICS_3D"){const l=X("OBSERVATORY",{isModal:!0,closeBtnId:"ws-obs-close",canNavigate:!!this.callbacks.onNavigateSection,floatingVariant:!0});e.innerHTML=`
        <!-- Open Unobstructed 54-55dvh Portrait / 50vw Landscape 3D Stage (pointer-events: none pass-through!) -->
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-obs-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${l}
          </div>
          <div class="ws-meta-stage-bottom">
            <span class="ws-meta-orbit-whisper">↻ Drag 3D to Orbit</span>
            <div class="ws-meta-stage-actions">
              <button
                type="button"
                class="ws-meta-float-pill ${this.uvBlacklightActive?"is-active-cyan":""}"
                id="ws-obs-uv-scan"
                aria-pressed="${this.uvBlacklightActive}"
              >
                ${o} UV
              </button>
              <button
                type="button"
                class="ws-meta-float-pill ${this.relicLatchesOpen?"is-active-gold":""}"
                id="ws-obs-latch-toggle"
                aria-pressed="${this.relicLatchesOpen}"
              >
                ${p} Latches
              </button>
            </div>
          </div>
        </div>

        <!-- Sleek 45-46dvh Portrait / 50vw Landscape Dark-Obsidian Bottom Sheet -->
        <div class="ws-meta-sheet">
          <div class="ws-meta-drag-handle" aria-hidden="true"></div>
          ${n}
          ${this.renderRelicSelectorStrip()}
          <div class="ws-meta-body-scroll">
            ${this.renderRelics3DStudy(r)}
          </div>
        </div>
      `,this.bindEvents(e);return}const d=X("OBSERVATORY",{isModal:a,closeBtnId:"ws-obs-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-obs-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">OBSERVATORY</h2>
              <div class="ws-meta-eyebrow">${r}/8 Relics · ${i.dueCount} Due · ${t.bookmarks.length} Flashes</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${d}
          </div>
        </div>

        ${n}
        ${this.activeTab==="RELICS_3D"?this.renderRelicSelectorStrip():""}

        <div class="ws-meta-body-scroll">
          ${this.activeTab==="RELICS_3D"?this.renderRelics3DStudy(r,!0):this.activeTab==="INTEL_FLASHES"?this.renderIntelFlashesVault():this.renderSelfQuizMode()}
        </div>
      </div>
    `,this.bindEvents(e)}renderRelicSelectorStrip(){return`
      <div class="ws-meta-hscroll" style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.06);" aria-label="Select 3D Relic">
        ${ae.map(e=>{const a=e.id===this.selectedArtifactId,t=this.isArtifactUnlocked(e.id),i=e.id==="championship_trophy"?"Crown":e.cityLabel;return`
            <button
              type="button"
              class="ws-meta-chip ${a?"is-active":""}"
              data-select-artifact="${e.id}"
            >
              <span style="color:${e.id==="championship_trophy"||t?"var(--gold-bright)":"var(--ivory-dim)"};">${e.id==="championship_trophy"?"♛":t?"◆":"◇"}</span>
              <span>${h(i)}</span>
            </button>
          `}).join("")}
      </div>
    `}renderRelics3DStudy(e,a=!1){const t=ae.find(l=>l.id===this.selectedArtifactId)??ae[0],i=this.isArtifactUnlocked(t.id),r=t.id!=="championship_trophy"?ue?.[t.id]??null:null,n=r?.inspectionHotspots??[],o=n.find(l=>l.id===this.activeHotspotId)??n[0]??null,p=r?.yearCrafted?` (${gs(r.yearCrafted)})`:"",d=M(`${r?.metallurgySpec??t.metallurgySpec}${r?.artisanAttribution?` · ${r.artisanAttribution}${p}`:""}`);return`
      ${a?`
            <div style="display:flex;gap:8px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.07);">
              <button type="button" class="ws-meta-chip ${this.uvBlacklightActive?"is-active":""}" id="ws-obs-uv-scan">✦ UV</button>
              <button type="button" class="ws-meta-chip ${this.relicLatchesOpen?"is-active":""}" id="ws-obs-latch-toggle">◆ Latches</button>
            </div>
          `:""}

      <!-- Crisp Frameless Provenance Header -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            ${r?.signatureGlyphUrl?`<img src="./${h(r.signatureGlyphUrl)}" alt="" style="width:30px;height:30px;object-fit:contain;flex-shrink:0;" />`:""}
            <div style="min-width:0;">
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);letter-spacing:0.08em;">
                ${h(r?.archiveCode??`${t.countryCode} · ${t.cityLabel.toUpperCase()}`)} · ${e}/8 RECOVERED
              </div>
              <div style="font-family:var(--font-display);font-size:16px;font-weight:800;color:var(--gold-bright);margin-top:2px;line-height:1.2;">
                ${h(r?.name??t.title)}
              </div>
            </div>
          </div>
          <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.05em;color:${i?"var(--emerald-win)":"var(--crimson-alert)"};white-space:nowrap;flex-shrink:0;padding-top:2px;">
            ${i?"✦ RECOVERED":"◇ CLASSIFIED"}
          </span>
        </div>

        <div style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);line-height:1.38;">
          ${h(d)}
        </div>

        <p style="margin:0;font-size:13px;color:var(--ivory-primary);line-height:1.48;">
          ${h(M(r?.provenanceEssay??t.historicalProvenance))}
        </p>

        ${n.length>0?`
              <div style="display:flex;flex-direction:column;gap:8px;padding-top:4px;">
                <div class="ws-meta-hscroll">
                  ${n.map(l=>`
                        <button type="button" class="ws-meta-chip ${o?.id===l.id?"is-active":""}" data-obs-hotspot="${h(l.id)}" data-orbit-deg="${l.orbitDeg[0]}">
                          ◎ ${h(l.label)}
                        </button>
                      `).join("")}
                </div>
                ${o?`<div class="ws-meta-note is-cyan">
                        <strong>${h(o.label)}:</strong> ${h(M(o.note))}
                      </div>`:""}
              </div>
            `:""}
      </div>

      <!-- Conspiracy Provenance, Latches & UV Blacklight Readout (Frameless Hairlines) -->
      <div class="ws-meta-section" style="border-bottom:none;">
        ${i?`
              <div class="ws-meta-note">
                <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;margin-bottom:3px;">
                  CONSPIRACY PROVENANCE
                </div>
                ${h(M(r?.conspiracySignificance??t.conspiracyNote))}
              </div>
              ${this.relicLatchesOpen&&r?.latches&&r.latches.length>0?`
                    <div style="display:flex;flex-direction:column;gap:4px;padding-top:4px;">
                      <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
                        ◆ UNSEALED MECHANICAL LATCHES
                      </div>
                      ${r.latches.map(l=>`
                            <div class="ws-meta-row" style="justify-content:flex-start;gap:8px;font-size:11.5px;">
                              <img src="./${h(l.glyphUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;flex-shrink:0;" />
                              <span><strong>${h(l.latchName)}:</strong> <code style="color:var(--gold-bright);">“${h(M(l.engraving))}”</code></span>
                            </div>
                          `).join("")}
                    </div>
                  `:""}
              ${this.uvBlacklightActive?`
                    <div class="ws-meta-note is-cyan" style="font-family:var(--font-mono);font-size:11px;">
                      ✦ ${h(M(r?.uvHiddenInscription??t.uvHiddenInscription))}
                    </div>
                  `:'<div style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">Tap <strong>UV</strong> or <strong>Latches</strong> on the 3D stage to inspect concealed engravings.</div>'}
            `:`
              <div class="ws-meta-note is-crimson">
                <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--amber-warn);letter-spacing:0.06em;margin-bottom:2px;">
                  SEALED CONSPIRACY NOTE
                </div>
                ${h(M(t.unlockHowTo))}
              </div>
            `}
      </div>
    `}renderIntelFlashesVault(){const e=this.getCombinedFlashes(),a=this.deps.passport.getSnapshot().bookmarks.length;return`
      <!-- Search, Curated Toggle & Launch Quiz -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;gap:10px;align-items:center;">
          <input
            id="ws-obs-flash-search"
            class="ws-meta-input ws-name-input"
            style="flex:1 1 auto;"
            type="search"
            autocomplete="off"
            spellcheck="false"
            placeholder="Search bookmarked flashes, answers, or debriefs..."
            value="${h(this.searchQuery)}"
          />
          <button type="button" class="ws-meta-btn-gold" id="ws-obs-launch-quiz">
            Mastery Deck ▸
          </button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <button type="button" class="ws-meta-chip ${this.includeSeedExemplars?"is-active":""}" id="ws-obs-toggle-seeds">
            ${this.includeSeedExemplars?"✓ Geneva Curated Included":"+ Include Geneva Curated"}
          </button>
          ${a===0?'<span style="font-size:11px;color:#9aa4b7;">Tap <strong>◇ Save Intel</strong> after any question to archive flashes here.</span>':`<span style="font-family:var(--font-mono);font-size:10.5px;color:var(--gold-bright);">${a} Personal Saved</span>`}
        </div>

        <!-- Single-Row Horizontal Scrollable 12-Domain Filter -->
        <div class="ws-meta-hscroll" aria-label="Filter by Domain">
          <button type="button" class="ws-meta-chip ${this.domainFilter==="ALL"?"is-active":""}" data-flash-domain="ALL">
            All Domains
          </button>
          ${q.map(t=>`
              <button type="button" class="ws-meta-chip ${this.domainFilter===t.id?"is-active":""}" data-flash-domain="${t.id}">
                <img src="./${h(t.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;" />
                ${h(t.shortName)}
              </button>
            `).join("")}
        </div>
      </div>

      <!-- Hairline-Divided Intel Flash List (Zero Nested Cards!) -->
      <div class="ws-meta-section" style="border-bottom:none;padding-top:4px;gap:0;">
        ${e.length>0?e.map(t=>{const i=H(t.domainId);return`
                    <div style="padding:13px 0;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;flex-direction:column;gap:6px;">
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                        <span style="display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${i.accentHex};">
                          <img src="./${h(i.medallionUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;" />
                          ${h(i.name)}
                          <span style="color:var(--ivory-dim);font-weight:500;">· ${t.isSeedExemplar?"Geneva Archive":"★ Saved"}</span>
                        </span>
                        ${t.isSeedExemplar?"":`<button type="button" class="ws-meta-inline-link" data-remove-bookmark="${t.qid}" style="color:var(--ivory-dim);font-size:10.5px;">Remove</button>`}
                      </div>
                      <div style="font-size:13.5px;font-weight:600;color:var(--ivory-primary);line-height:1.4;">
                        ${h(M(t.prompt))}
                      </div>
                      <div style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--emerald-win);">
                        ✓ ${h(M(t.answer))}
                      </div>
                      <div class="ws-meta-note is-cyan" style="font-size:12px;">
                        ${h(M(t.whyExplanation))}
                      </div>
                    </div>
                  `}).join(""):'<div style="padding:28px 0;text-align:center;color:var(--ivory-muted);font-size:13px;">No Intel Flashes match your current filter.</div>'}
      </div>
    `}renderSelfQuizMode(){const e=this.srs.getDeckSummary(),a=this.getScopedSrsSummary(),t=this.srs.getAllCards(),i=this.getFilteredSrsCards(),r=Math.max(1,...a.boxCounts),n=[1,2,3,4,5],o=this.srsDomainFilter!=="ALL"?H(this.srsDomainFilter):null,p=o?`
        <div
          id="ws-srs-domain-banner"
          class="ws-meta-note"
          data-srs-domain-banner="${o.id}"
          style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;box-shadow:inset 3px 0 0 ${o.accentHex};padding:6px 0 6px 12px;"
        >
          <span style="display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-primary);">
            <img src="./${h(o.medallionUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;" />
            <span>Filtered Domain: <strong style="color:${o.accentHex};">${h(o.name)}</strong> (${a.totalCards} cards)</span>
          </span>
          <button type="button" class="ws-meta-inline-link" data-srs-domain="ALL" style="min-height:44px;padding:0 8px;">
            ✕ All Domains (${e.totalCards})
          </button>
        </div>
      `:"",d=`
      <div class="ws-meta-hscroll" aria-label="Filter Mastery Deck by Domain" style="padding:2px 0 6px;">
        <button
          type="button"
          class="ws-meta-chip ws-srs-domain-chip ${this.srsDomainFilter==="ALL"?"is-active":""}"
          data-srs-domain="ALL"
        >
          All Domains (${e.totalCards})
        </button>
        ${q.map(S=>{const _=t.filter(O=>O.domainId===S.id).length;return`
            <button
              type="button"
              class="ws-meta-chip ws-srs-domain-chip ${this.srsDomainFilter===S.id?"is-active":""}"
              data-srs-domain="${S.id}"
            >
              <img src="./${h(S.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;" />
              <span>${h(S.shortName)}${_>0?` (${_})`:""}</span>
            </button>
          `}).join("")}
      </div>
    `,l=`
      ${p}

      <!-- Frameless 4-KPI Leitner Mastery Strip -->
      <div class="ws-meta-kpi-strip is-four-col" id="ws-srs-kpi-strip" data-srs-active-domain="${this.srsDomainFilter}">
        <div class="ws-meta-kpi-cell" data-srs-kpi="due">
          <span class="ws-meta-kpi-lbl">Due Now</span>
          <span class="ws-meta-kpi-val" id="ws-srs-due-count" style="color:${a.dueCount>0?"var(--gold-bright)":"var(--emerald-win)"};">${a.dueCount}</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="total">
          <span class="ws-meta-kpi-lbl">${o?`${h(o.shortName)} Cards`:"Deck Cards"}</span>
          <span class="ws-meta-kpi-val" id="ws-srs-total-count">${a.totalCards}</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="retention">
          <span class="ws-meta-kpi-lbl">Retention</span>
          <span class="ws-meta-kpi-val" id="ws-srs-retention" style="color:var(--cyan-clue);">${a.retentionPct}%</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="mastered">
          <span class="ws-meta-kpi-lbl">Mastered</span>
          <span class="ws-meta-kpi-val" id="ws-srs-mastered-count" style="color:var(--emerald-win);">${a.masteredCount}</span>
        </div>
      </div>

      <!-- 5-Box Leitner Mastery Bars (Zero Nested Boxes) -->
      <div class="ws-meta-section" style="padding-top:10px;padding-bottom:10px;gap:8px;">
        ${d}

        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h3 class="ws-meta-section-title">5-Box Leitner Mastery Deck${o?` · ${h(o.shortName)}`:""}</h3>
          <span style="font-family:var(--font-mono);font-size:10px;color:#a5afc2;">
            ${this.srsBoxFilter?`Filtered: Box ${this.srsBoxFilter} (tap to clear)`:"Box 1 Immediate → Box 5 Mastered (21d)"}
          </span>
        </div>

        <div class="ws-srs-boxes-grid" id="ws-srs-box-bars" aria-label="Leitner Boxes 1 to 5">
          ${n.map(S=>{const _=a.boxCounts[S-1],L=a.totalCards>0?Math.max(_>0?14:0,Math.round(_/r*100)):0,O=Is[S],D=this.srsBoxFilter===S;return`
                <button
                  type="button"
                  class="ws-srs-box-bar ${D?"is-active":""}"
                  data-srs-box="${S}"
                  data-srs-box-count="${_}"
                  aria-pressed="${D}"
                >
                  <div class="ws-srs-box-head">
                    <span class="ws-srs-box-name">Box ${S}</span>
                    <span class="ws-srs-box-count" style="color:${O};">${_}</span>
                  </div>
                  <div class="ws-srs-box-track">
                    <div class="ws-srs-box-fill" style="width:${L}%;background:${O};"></div>
                  </div>
                  <span class="ws-srs-box-interval">${h(It[S])}</span>
                </button>
              `}).join("")}
        </div>

        <!-- Filter Pills + Optional 3D Stage Review Launch (Zero Right-Edge Clip on 360px!) -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;" role="group" aria-label="Mastery Deck Filter">
          <button type="button" class="ws-meta-chip ${this.srsFilter==="DUE"?"is-active":""}" data-srs-filter="DUE">
            Due (${a.dueCount})
          </button>
          <button type="button" class="ws-meta-chip ${this.srsFilter==="ALL"?"is-active":""}" data-srs-filter="ALL">
            All (${a.totalCards})
          </button>
          <button type="button" class="ws-meta-chip ${this.srsFilter==="MASTERED"?"is-active":""}" data-srs-filter="MASTERED">
            Mastered (${a.masteredCount})
          </button>
          ${this.callbacks.onLaunchLivePrismReview&&i.length>0?`<button type="button" class="ws-meta-chip" id="ws-srs-launch-3d" style="color:var(--cyan-clue);">
                  3D Review ▸
                </button>`:""}
        </div>
      </div>
    `;if(a.totalCards===0)return o&&e.totalCards>0?`
          ${l}
          <div class="ws-meta-section" style="text-align:center;padding:24px 8px;border-bottom:none;gap:12px;">
            <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:${o.accentHex};">
              No Missed or Saved Cards in ${h(o.name)} Yet
            </div>
            <p style="margin:0 auto;max-width:440px;font-size:12.5px;color:var(--ivory-muted);line-height:1.48;">
              Every missed ${h(o.shortName)} question automatically enters Box 1 here. You currently have <strong>${e.totalCards}</strong> cards across other domains.
            </p>
            <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;padding-top:4px;">
              <button type="button" class="ws-meta-btn-gold" data-srs-domain="ALL">
                Show All Domains (${e.totalCards}) ▸
              </button>
            </div>
          </div>
        `:`
        ${l}
        <div class="ws-meta-section" style="text-align:center;padding:24px 8px;border-bottom:none;gap:12px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--gold-bright);">
            ${o?`No ${h(o.shortName)} Cards Captured Yet`:"Your Leitner Mastery Deck Is Ready"}
          </div>
          <p style="margin:0 auto;max-width:440px;font-size:12.5px;color:var(--ivory-muted);line-height:1.48;">
            Every missed question automatically enters <strong>Box 1 (Immediate Review)</strong>, and every Saved Intel Flash enters <strong>Box 2 (24h)</strong>. Promote cards across 5 spaced intervals to lock facts into permanent memory.
          </p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;padding-top:4px;">
            <button type="button" class="ws-meta-btn-gold" id="ws-srs-load-demo">
              Load Geneva Starter Deck (6 Cards)
            </button>
          </div>
        </div>
      `;const m=this.quizPickedIdx!==null||this.quizShutterFlipped;let c=m?this.srsActiveCard:null;if(!c&&i.length>0){const S=(this.quizCursor%i.length+i.length)%i.length;c=i[S]}if(!c){const S=this.srsFilter==="DUE"&&this.srsBoxFilter===null,_=S?"All Due Reviews Cleared":this.srsFilter==="MASTERED"?"No Cards in Box 5 Mastered Yet":"No Cards Match This Box Filter",L=S?`All ${a.totalCards} card${a.totalCards===1?"":"s"} in your Leitner deck are scheduled ahead. Review the full deck early or play another match to capture new cards.`:"Promote cards correctly through Boxes 1 → 5 or switch to All Saved & Missed to practice now.";return`
        ${l}
        <div class="ws-meta-section" style="text-align:center;padding:22px 8px;border-bottom:none;gap:12px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:${S?"var(--emerald-win)":"var(--gold-bright)"};">
            ${S?"✦ ":""}${h(_)}
          </div>
          <p style="margin:0 auto;max-width:440px;font-size:12.5px;color:var(--ivory-muted);line-height:1.45;">
            ${h(L)}
          </p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            <button type="button" class="ws-meta-btn-gold" id="ws-obs-reset-quiz-filter">
              Practice All Deck Cards (${a.totalCards}) ▸
            </button>
          </div>
        </div>
      `}let u=this.srsActiveOptions;if(!u||u.qid!==c.qid){const S=ht(c,t);u={qid:c.qid,options:S.options,correctIdx:S.correctIdx},this.srsActiveOptions=u}const{options:y,correctIdx:x}=u,g=H(c.domainId),v=this.srsLastAttemptResult?.newBox??c.box,k=["A","B","C","D"],f=c.source==="BOTH"?"Missed + Saved":c.source==="MISSED"?"Auto-Captured Miss":c.source==="BOOKMARKED"?"Saved Flash":"Geneva Archive",b=Es(this.srsLastAttemptResult?.card.nextReviewAtMs??c.nextReviewAtMs),w=i.length>0?`${(this.quizCursor%i.length+i.length)%i.length+1}/${i.length}`:"Done",I=this.srsLastAttemptResult,T=I?I.wasCorrect?`<span class="ws-srs-promotion-badge is-promoted" id="ws-srs-promotion-badge">
            ${I.promoted?`✦ BOX ${I.previousBox} → BOX ${I.newBox} · NEXT IN ${I.nextIntervalLabel.toUpperCase()}`:`✦ BOX 5 MASTERED · NEXT IN ${I.nextIntervalLabel.toUpperCase()}`}
          </span>`:`<span class="ws-srs-promotion-badge is-reset" id="ws-srs-promotion-badge">
            ↺ RESET BOX ${I.previousBox} → BOX 1 · DUE NOW
          </span>`:"";return`
      ${l}
      <div class="ws-meta-section ws-srs-runner" id="ws-srs-runner" data-srs-active-qid="${c.qid}" data-srs-active-box="${v}" style="padding-top:12px;border-bottom:none;gap:12px;">
        <div class="ws-srs-card-header">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <img src="./${h(g.medallionUrl)}" alt="" style="width:22px;height:22px;object-fit:contain;flex-shrink:0;" />
            <div style="min-width:0;">
              <div style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${g.accentHex};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${h(g.name)}${c.subcatLabel?` · ${h(c.subcatLabel)}`:""}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:#a5afc2;">
                ${h(f)} · ${h(b)} · Card ${h(w)}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
            <span class="ws-srs-box-pill is-box-${v}" id="ws-srs-card-box-pill">
              ${h(Ss[v])}
            </span>
          </div>
        </div>

        <div style="font-size:clamp(14.5px,1.55vw,17px);font-weight:600;color:var(--ivory-primary);line-height:1.44;">
          ${h(M(c.prompt))}
        </div>

        <!-- 4 Sleek Borderless A-D Review Strips -->
        <div class="ws-srs-options-list">
          ${y.map((S,_)=>{const L=_===x,O=this.quizPickedIdx===_;return`
                <button
                  type="button"
                  class="ws-srs-option-btn ${m?L?"is-correct":O?"is-wrong":"":""}"
                  data-quiz-pick="${_}"
                  data-srs-correct="${L?"true":"false"}"
                  ${m?"disabled":""}
                >
                  <span class="ws-srs-option-key">${k[_]}</span>
                  <span style="white-space:normal;line-height:1.3;">${h(S)}</span>
                </button>
              `}).join("")}
        </div>

        ${m?`
              <div class="ws-meta-note ${I?.wasCorrect?"is-emerald":"is-crimson"}" style="display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
                  <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${I?.wasCorrect?"var(--emerald-win)":"#ff99a5"};">
                    ${I?.wasCorrect?"✦ EXACT RECALL":`✓ ${h(M(c.correctAnswer))}`}
                  </span>
                  ${T}
                </div>
                ${c.whyExplanation?`<div style="font-size:12.5px;color:var(--ivory-primary);line-height:1.42;">
                        ${h(M(c.whyExplanation))}
                      </div>`:""}
              </div>
            `:""}

        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:4px;">
          ${m?`<span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">Session: ${this.quizCorrectCount}/${this.quizAttemptedCount} · Streak ${this.quizStreak}</span>`:'<button type="button" class="ws-meta-btn" id="ws-obs-quiz-flip">Reveal Answer</button>'}
          <button type="button" class="ws-meta-btn-gold" id="ws-obs-quiz-next">
            ${this.srsFilter==="DUE"?"Next Due Card ▸":"Next Card ▸"}
          </button>
        </div>
      </div>
    `}bindEvents(e){e.querySelector("#ws-obs-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),le(e,{closeBtnId:"ws-obs-close",onNavigate:t=>this.callbacks.onNavigateSection?.(t),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-obs-tab]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.obsTab;if(!i)return;const r=Ke(i);r!==this.activeTab&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),r!=="RELICS_3D"&&this.deps.audio?.stopVoice(),this.activeTab=r,r==="RELICS_3D"?this.sync3DShowcase():r==="SELF_QUIZ"&&(this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter()),this.rerender())})}),e.querySelectorAll("[data-select-artifact]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.selectArtifact;i&&(this.deps.haptics?.sightlineSnap(),this.deps.audio?.playSfx("sightline_snap"),this.deps.audio?.stopVoice(),this.selectedArtifactId=i,this.uvBlacklightActive=!1,this.relicLatchesOpen=!1,this.activeHotspotId=null,this.sync3DShowcase(),this.rerender())})}),e.querySelectorAll("[data-obs-hotspot]").forEach(t=>{t.addEventListener("click",()=>{this.activeHotspotId=t.dataset.obsHotspot??null;const i=Number(t.dataset.orbitDeg)||0;this.deps.stage3d&&(this.deps.stage3d.prismRig.applyInspectDrag(i*Math.PI/180,.8),this.deps.stage3d.prismRig.releaseInspectDrag()),this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("sightline_snap"),this.rerender()})}),e.querySelector("#ws-obs-latch-toggle")?.addEventListener("click",()=>{this.relicLatchesOpen=!this.relicLatchesOpen,this.actuate3DRelicLatches(this.relicLatchesOpen),this.deps.haptics?.peel(this.relicLatchesOpen?2:1),this.deps.audio?.playSfx("shutter_peel"),this.relicLatchesOpen&&(this.callbacks.onLatchesOpened?.(this.selectedArtifactId),this.isArtifactUnlocked(this.selectedArtifactId)&&this.deps.audio?.playVoice("callout_vance_relic_latch.mp3")),this.rerender()}),e.querySelector("#ws-obs-uv-scan")?.addEventListener("click",()=>{this.uvBlacklightActive=!this.uvBlacklightActive,this.deps.haptics?.peel(2),this.deps.audio?.playSfx("shutter_peel"),this.uvBlacklightActive&&this.callbacks.onUvScan?.(this.selectedArtifactId),this.deps.stage3d&&this.deps.stage3d.setLightingMode(this.uvBlacklightActive?"TWIST_FRACTURE":this.selectedArtifactId==="championship_trophy"?"GOLD_RESONANCE":"BROADCAST"),this.rerender()});const a=e.querySelector("#ws-obs-flash-search");if(a){const t=i=>i.stopPropagation();a.addEventListener("keydown",t),a.addEventListener("keyup",t),a.addEventListener("keypress",t),a.addEventListener("input",()=>{const i=a.selectionStart??a.value.length;this.searchQuery=a.value,this.quizCursor=0,this.rerender();const r=e.querySelector("#ws-obs-flash-search");r&&(r.focus(),r.setSelectionRange(i,i))})}e.querySelector("#ws-obs-toggle-seeds")?.addEventListener("click",()=>{this.includeSeedExemplars=!this.includeSeedExemplars,this.quizCursor=0,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelector("#ws-obs-launch-quiz")?.addEventListener("click",()=>{this.activeTab="SELF_QUIZ",this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter(),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelectorAll("[data-flash-domain]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.flashDomain;this.domainFilter=i==="ALL"?"ALL":Number(i),this.quizCursor=0,this.quizPickedIdx=null,this.quizShutterFlipped=!1,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()})}),e.querySelectorAll("[data-remove-bookmark]").forEach(t=>{t.addEventListener("click",()=>{const i=Number(t.dataset.removeBookmark),r=this.deps.passport.getSnapshot().bookmarks.find(n=>n.qid===i);r&&(this.deps.passport.toggleIntelBookmark(r),this.srs.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-srs-domain]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.srsDomain;this.srsDomainFilter=i==="ALL"?"ALL":ze(Number(i)),this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter(),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()})}),e.querySelectorAll("[data-srs-box]").forEach(t=>{t.addEventListener("click",()=>{const i=Number(t.dataset.srsBox);i<1||i>5||(this.srsBoxFilter=this.srsBoxFilter===i?null:i,this.srsBoxFilter!==null&&this.srsFilter==="DUE"&&(this.srsFilter="ALL"),this.resetSrsRunnerTurn(!1),this.quizCursor=0,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-srs-filter]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.srsFilter;i&&(this.srsFilter=i,this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelector("#ws-srs-load-demo")?.addEventListener("click",()=>{this.srs.seedDemoCardsIfEmpty(),this.srsFilter="DUE",this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.deps.haptics?.correctBloom(),this.deps.audio?.playSfx("sightline_snap"),this.rerender()}),e.querySelector("#ws-srs-launch-3d")?.addEventListener("click",()=>{const t=this.getFilteredSrsCards();if(t.length===0||!this.callbacks.onLaunchLivePrismReview)return;const i=this.callbacks.onLaunchLivePrismReview;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.close(),i(t)}),e.querySelector("#ws-obs-reset-quiz-filter")?.addEventListener("click",()=>{this.srsFilter="ALL",this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelectorAll("[data-quiz-pick]").forEach(t=>{t.addEventListener("click",()=>{if(this.quizPickedIdx!==null||this.quizShutterFlipped)return;const i=Number(t.dataset.quizPick),r=this.getFilteredSrsCards();if(r.length===0)return;const n=(this.quizCursor%r.length+r.length)%r.length,o=r[n],p=this.srsActiveOptions&&this.srsActiveOptions.qid===o.qid?this.srsActiveOptions:{qid:o.qid,...ht(o,this.srs.getAllCards())};this.srsActiveOptions=p;const d=i===p.correctIdx;this.srsActiveCard=o,this.quizPickedIdx=i,this.quizAttemptedCount+=1,this.srsLastAttemptResult=this.srs.recordReviewAttempt(o.qid,d),d?(this.quizCorrectCount+=1,this.quizStreak+=1,this.deps.haptics?.correctBloom(),this.deps.audio?.playSfx("gold_resonance")):(this.quizStreak=0,this.deps.haptics?.wrongThud(!1),this.deps.audio?.playSfx("backfire_fracture")),this.rerender()})}),e.querySelector("#ws-obs-quiz-flip")?.addEventListener("click",()=>{if(this.quizPickedIdx!==null||this.quizShutterFlipped)return;const t=this.getFilteredSrsCards();if(t.length===0)return;const i=(this.quizCursor%t.length+t.length)%t.length,r=t[i];this.srsActiveCard=r,this.quizShutterFlipped=!0,this.quizAttemptedCount+=1,this.quizStreak=0,this.srsLastAttemptResult=this.srs.recordReviewAttempt(r.qid,!1),this.deps.haptics?.peel(2),this.deps.audio?.playSfx("shutter_peel"),this.rerender()}),e.querySelector("#ws-obs-quiz-next")?.addEventListener("click",()=>{this.srsFilter==="DUE"&&!!this.srsLastAttemptResult?.wasCorrect?this.quizCursor=0:this.quizCursor+=1,this.resetSrsRunnerTurn(!1),this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.rerender()})}}const Tt="ws_prism_atelier_equipped_v1",Ct="ws_prism_atelier_honour_unlocks_v1",Ts="ws_daily_global_feed_v2",Cs="ws_archive_descent_v2",Ls="ws_council_trials_v2",Ms=[{id:"SOVEREIGN_OBSIDIAN_24K",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:1,name:"Sovereign Obsidian & 24K Gold",shortBadge:"GENEVA ISSUE",milestoneTitle:"Default Geneva Charter Issue",unlockRequirementSummary:"Issued upon summons to The Vetting Chamber in Geneva.",craftProvenance:"Hand-milled Swiss obsidian-sapphire lenses suspended in brushed 24K Geneva horological gold with champagne Sightline optics.",hubOrigin:"ch",baseDomainId:0,swatchPrimaryCss:"#e5be67",swatchSecondaryCss:"#182238",swatchCrystalCss:"#121724",stage3dSkinId:"SOVEREIGN_OBSIDIAN",primaryMetalHex:15056487,secondaryMetalHex:1581107,metalRoughness:.21,shutterRoughness:.25,crystalColorHex:725020,attenuationHex:1977415,crystalRoughness:.16,iridescence:.22,ior:1.52,emissiveHex:16767108,emissiveIntensity:.05,sightlineBeamHex:16767093},{id:"DAMASCUS_STEEL_AMBER",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:2,name:"Damascus Folded Steel & Amber",shortBadge:"LONDON FORGE",milestoneTitle:"London Milestone · Sovereign Rotunda",unlockRequirementSummary:"London (GB) Visa · 2-Day Daily Streak · OR Initiate Honour.",craftProvenance:"320-layer acid-etched gunmetal Damascus gimbals paired with warm Baltic cognac-amber quartz facets forged beneath Westminster.",hubOrigin:"gb",baseDomainId:9,swatchPrimaryCss:"#b4c2d4",swatchSecondaryCss:"#434f61",swatchCrystalCss:"#5e3310",stage3dSkinId:"DAMASCUS_STEEL",primaryMetalHex:11846356,secondaryMetalHex:3884631,metalRoughness:.24,shutterRoughness:.28,crystalColorHex:1839110,attenuationHex:9062416,crystalRoughness:.17,iridescence:.18,ior:1.55,emissiveHex:16756034,emissiveIntensity:.06,sightlineBeamHex:16757575},{id:"KYOTO_URUSHI_KINTSUGI",legacyBlackboardSkinId:"KYOTO_KINTSUGI",order:3,name:"Kyoto Urushi Lacquer & Kintsugi Gold",shortBadge:"TOKYO ATELIER",milestoneTitle:"Tokyo Milestone · Shinkansen Sky Pavilion",unlockRequirementSummary:"Tokyo (JP) Visa · Archive Depth ≥ 5 · OR 3-Day Daily Streak.",craftProvenance:"Mirror-polished vermilion-ebony urushi lacquer shutters joined with 24K powdered maki-e kintsugi gold seams.",hubOrigin:"jp",baseDomainId:3,swatchPrimaryCss:"#f3cf72",swatchSecondaryCss:"#7a1622",swatchCrystalCss:"#3b0b14",stage3dSkinId:"KYOTO_KINTSUGI",primaryMetalHex:15978354,secondaryMetalHex:8001058,metalRoughness:.18,shutterRoughness:.15,crystalColorHex:2361103,attenuationHex:9378348,crystalRoughness:.14,iridescence:.32,ior:1.56,emissiveHex:16758892,emissiveIntensity:.06,sightlineBeamHex:16763496},{id:"IMPERIAL_EMERALD_BRASS",legacyBlackboardSkinId:"EMERALD_SOVEREIGN",order:4,name:"Imperial Emerald Quartz & Botanical Brass",shortBadge:"RIO CANOPY",milestoneTitle:"Rio Milestone · Botanical Glass Canopy",unlockRequirementSummary:"Rio de Janeiro (BR) Visa · OR Archive Descent Depth ≥ 10.",craftProvenance:"Deep Minas Gerais emerald-tourmaline crystal facets set in satin botanical brass tuned to Nadia Al-Mansoor’s acoustic key.",hubOrigin:"br",baseDomainId:2,swatchPrimaryCss:"#d9bc6a",swatchSecondaryCss:"#146944",swatchCrystalCss:"#0c472f",stage3dSkinId:"IMPERIAL_EMERALD",primaryMetalHex:14269546,secondaryMetalHex:1337668,metalRoughness:.22,shutterRoughness:.22,crystalColorHex:467994,attenuationHex:1606999,crystalRoughness:.16,iridescence:.28,ior:1.58,emissiveHex:5173933,emissiveIntensity:.06,sightlineBeamHex:4647848},{id:"PHARAONIC_LAPIS_ELECTRUM",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:5,name:"Pharaonic Lapis Lazuli & Solar Electrum",shortBadge:"CAIRO VAULT",milestoneTitle:"Cairo Milestone · Meridian Zero Vault",unlockRequirementSummary:"Cairo (EG) Visa · 5-Day Streak · OR Daily Top 25% Broadcast.",craftProvenance:"Celestial Badakhshan lapis lazuli crystal infused with pyrite starlight and pale silver-gold Solar Electrum from Giza’s oculus.",hubOrigin:"eg",baseDomainId:10,swatchPrimaryCss:"#f2e4b8",swatchSecondaryCss:"#1b3f96",swatchCrystalCss:"#122b6e",stage3dSkinId:"PHARAONIC_LAPIS",primaryMetalHex:15918264,secondaryMetalHex:1785750,metalRoughness:.19,shutterRoughness:.23,crystalColorHex:727621,attenuationHex:2380477,crystalRoughness:.16,iridescence:.48,ior:1.57,emissiveHex:8047615,emissiveIntensity:.06,sightlineBeamHex:7262463},{id:"AURORA_DICHROIC_TITANIUM",legacyBlackboardSkinId:"BLACK_SALON_CRIMSON",order:6,name:"Aurora Dichroic Titanium",shortBadge:"REYKJAVIK APEX",milestoneTitle:"Reykjavik / Grandmaster Milestone",unlockRequirementSummary:"Reykjavik (IS) Visa · Depth ≥ 15 · OR Global/Trials Elo ≥ 1550.",craftProvenance:"Heat-anodized Icelandic titanium housing a high-dispersion dichroic prism that refracts borealis cyan, violet, and white-gold.",hubOrigin:"is",baseDomainId:11,swatchPrimaryCss:"#dceeff",swatchSecondaryCss:"#4b3d82",swatchCrystalCss:"#16384c",stage3dSkinId:"AURORA_DICHROIC",primaryMetalHex:14479103,secondaryMetalHex:4075886,metalRoughness:.16,shutterRoughness:.17,crystalColorHex:661286,attenuationHex:1989747,crystalRoughness:.12,iridescence:.96,ior:1.64,emissiveHex:7534568,emissiveIntensity:.07,sightlineBeamHex:7075810},{id:"BLACK_SALON_CRIMSON_OBSIDIAN",legacyBlackboardSkinId:"BLACK_SALON_CRIMSON",order:7,name:"Black Salon Velvet Crimson & Carbon",shortBadge:"BLACK SALON",milestoneTitle:"Hall of Honours · Bluff & Ghost Trial Citation",unlockRequirementSummary:"Catch a Rival Bluff (CALL BLUFF) · OR Win a World Council Ghost Duel.",craftProvenance:"Matte forged-carbon tourbillon rings accented with ruby-garnet corundum facets from Teo Rojas’s underground Camden & Shinjuku tables.",hubOrigin:"gb",baseDomainId:4,swatchPrimaryCss:"#f0546a",swatchSecondaryCss:"#1b1622",swatchCrystalCss:"#240812",stage3dSkinId:"CRIMSON_BLACK_SALON",primaryMetalHex:14264428,secondaryMetalHex:2495003,metalRoughness:.22,shutterRoughness:.2,crystalColorHex:1705486,attenuationHex:8721964,crystalRoughness:.14,iridescence:.36,ior:1.58,emissiveHex:16733294,emissiveIntensity:.06,sightlineBeamHex:16736890},{id:"STERLING_CHRONOMETER_RHODIUM",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:8,name:"Vallée de Joux Rhodium & Sterling",shortBadge:"STERLING ENVOY",milestoneTitle:"Hall of Honours · Envoy Sterling Citation",unlockRequirementSummary:"Reach a 10-Question Streak · OR Earn 5 Tier-2 Sterling Medals.",craftProvenance:"Mirror-rhodium escapement bridges and coined 925 sterling silver shutters framing glacier-clear sapphire chronometer crystal.",hubOrigin:"ch",baseDomainId:1,swatchPrimaryCss:"#e4edf7",swatchSecondaryCss:"#2a3d59",swatchCrystalCss:"#0c1c33",stage3dSkinId:"SINGAPORE_SKYBRIDGE",primaryMetalHex:14871541,secondaryMetalHex:2373202,metalRoughness:.14,shutterRoughness:.18,crystalColorHex:661032,attenuationHex:2381450,crystalRoughness:.12,iridescence:.42,ior:1.56,emissiveHex:9098495,emissiveIntensity:.06,sightlineBeamHex:8047615},{id:"CONSUL_MALACHITE_VERDIGRIS",legacyBlackboardSkinId:"EMERALD_SOVEREIGN",order:9,name:"Consul Imperial Malachite & Bronze",shortBadge:"CONSUL BRONZE",milestoneTitle:"Hall of Honours · Consul 24K Gold Citation",unlockRequirementSummary:"Reach 20-Streak · 100 Lifetime Correct · OR 1,500 Domain ELO.",craftProvenance:"Banded malachite-jade crystal slabs encased in patinated treaty bronze and hand-burnished 22K Roman consul gold.",hubOrigin:"eg",baseDomainId:7,swatchPrimaryCss:"#d4a652",swatchSecondaryCss:"#18473c",swatchCrystalCss:"#08241d",stage3dSkinId:"METEORITE_ROSE_GOLD",primaryMetalHex:13936210,secondaryMetalHex:1590586,metalRoughness:.23,shutterRoughness:.24,crystalColorHex:466713,attenuationHex:1470040,crystalRoughness:.16,iridescence:.3,ior:1.57,emissiveHex:5697732,emissiveIntensity:.06,sightlineBeamHex:5434304},{id:"ARBITER_SMOKED_SAPPHIRE_PLATINUM",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:10,name:"Arbiter Smoked Sapphire & 950 Platinum",shortBadge:"ARBITER SAPPHIRE",milestoneTitle:"Hall of Honours · Very Rare Sapphire Citation",unlockRequirementSummary:"Singapore (SG) Visa · 35-Streak · OR Earn Any Tier-4 Sapphire Trophy.",craftProvenance:"Heavy 950 diplomatic platinum gimbals clasping midnight Ceylon smoked-sapphire facets cut for World Council Arbiters.",hubOrigin:"sg",baseDomainId:8,swatchPrimaryCss:"#dce4f2",swatchSecondaryCss:"#182952",swatchCrystalCss:"#081129",stage3dSkinId:"ARCTIC_CRYO_SAPPHIRE",primaryMetalHex:14476530,secondaryMetalHex:1517133,metalRoughness:.14,shutterRoughness:.17,crystalColorHex:462630,attenuationHex:2049436,crystalRoughness:.12,iridescence:.62,ior:1.61,emissiveHex:7125247,emissiveIntensity:.06,sightlineBeamHex:6468863},{id:"SOLAR_OCULUS_WHITE_GOLD",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:11,name:"Solar Oculus 18K White-Gold & Topaz",shortBadge:"6.0X ROULETTE",milestoneTitle:"Hall of Honours · High-Conviction Overclock Citation",unlockRequirementSummary:"Land 3× 6.0x Max Overclocks in 1 Match · OR 5× Bullseye Calibrations.",craftProvenance:"Satin 18K white-gold clamping jaws paired with imperial golden-topaz crystal engineered to withstand 6.0x Overclock thermal surges.",hubOrigin:"eg",baseDomainId:5,swatchPrimaryCss:"#fff0c2",swatchSecondaryCss:"#5e3c14",swatchCrystalCss:"#241506",stage3dSkinId:"ELECTRUM_MOTHER_OF_PEARL",primaryMetalHex:16246974,secondaryMetalHex:5190160,metalRoughness:.15,shutterRoughness:.2,crystalColorHex:1708037,attenuationHex:9395476,crystalRoughness:.13,iridescence:.44,ior:1.59,emissiveHex:16769149,emissiveIntensity:.06,sightlineBeamHex:16769666},{id:"CELESTIAL_DIAMOND_SOVEREIGN",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:12,name:"Mythic Celestial Diamond & Astral 24K",shortBadge:"MYTHIC 0.1%",milestoneTitle:"Hall of Honours · Mythic Tier-5 Sovereign Crown",unlockRequirementSummary:"Unlock ANY Tier-5 Mythic (0.1%) Trophy in the Hall of Honours!",craftProvenance:"Synthetic flawless Type-IIa diamond lenses with full-spectrum astral dispersion mounted in First Citizen Arbiter 24K bullion.",hubOrigin:"global",baseDomainId:11,swatchPrimaryCss:"#fff6d6",swatchSecondaryCss:"#2c2559",swatchCrystalCss:"#0e162b",stage3dSkinId:"MYTHIC_CELESTIAL_DIAMOND",primaryMetalHex:16376728,secondaryMetalHex:2498639,metalRoughness:.12,shutterRoughness:.14,crystalColorHex:594212,attenuationHex:2971770,crystalRoughness:.1,iridescence:1,ior:1.68,emissiveHex:10418175,emissiveIntensity:.07,sightlineBeamHex:16771481}],Os=[{id:"SAPPHIRE_BLUEPRINT_CYANOTYPE",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:13,name:"Sapphire Blueprint Cyanotype & Brass",shortBadge:"CYANOTYPE",milestoneTitle:"Hall of Honours v2.0 · Master Blueprint Architect",unlockRequirementSummary:"Solve 10 Visual Blueprint Questions (#75) · Zero Pay-to-Win.",craftProvenance:"Architectural Prussian-blue cyanotype optics encased in drafting-instrument brushed brass tuned for Sapphire Hologram Plates.",hubOrigin:"ch",baseDomainId:3,swatchPrimaryCss:"#64e6ff",swatchSecondaryCss:"#0f2e5e",swatchCrystalCss:"#071a38",stage3dSkinId:"ARCTIC_CRYO_SAPPHIRE",primaryMetalHex:15123315,secondaryMetalHex:1061222,metalRoughness:.17,shutterRoughness:.19,crystalColorHex:399411,attenuationHex:1727656,crystalRoughness:.13,iridescence:.72,ior:1.6,emissiveHex:5690613,emissiveIntensity:.07,sightlineBeamHex:6612735},{id:"DUELIST_BLOODSTONE_PLATINUM",legacyBlackboardSkinId:"BLACK_SALON_CRIMSON",order:14,name:"Duelist Bloodstone & 950 Platinum",shortBadge:"H2H DUELIST",milestoneTitle:"Hall of Honours v2.0 · Ghost Split Breaker",unlockRequirementSummary:"Beat a Challenger Ghost in a 1v1 Head-to-Head Duel (#78).",craftProvenance:"Machined 950 platinum duel jaws clasping deep bloodstone-garnet crystal forged for one-tap Head-to-Head rivals.",hubOrigin:"gb",baseDomainId:5,swatchPrimaryCss:"#e5ecf5",swatchSecondaryCss:"#6e1120",swatchCrystalCss:"#2b0710",stage3dSkinId:"CRIMSON_BLACK_SALON",primaryMetalHex:15068405,secondaryMetalHex:7016994,metalRoughness:.15,shutterRoughness:.19,crystalColorHex:2229774,attenuationHex:9377837,crystalRoughness:.14,iridescence:.46,ior:1.59,emissiveHex:16734835,emissiveIntensity:.06,sightlineBeamHex:16739201},{id:"NEURAL_ENGRAM_AMETHYST_GOLD",legacyBlackboardSkinId:"KYOTO_KINTSUGI",order:15,name:"Neural Engram Amethyst & 24K Gold",shortBadge:"BOX-5 ENGRAM",milestoneTitle:"Hall of Honours v2.0 · Leitner Box-5 Polymath",unlockRequirementSummary:"Promote 5 Cards to Box 5 Mastered in the Leitner Deck (#81).",craftProvenance:"Synaptic Siberian amethyst crystal faceted with 24K Geneva memory-lattice filigree celebrating permanent recall mastery.",hubOrigin:"jp",baseDomainId:10,swatchPrimaryCss:"#f2cf7e",swatchSecondaryCss:"#5b2f8f",swatchCrystalCss:"#1b0e36",stage3dSkinId:"AURORA_DICHROIC",primaryMetalHex:15912830,secondaryMetalHex:5975951,metalRoughness:.16,shutterRoughness:.18,crystalColorHex:1444398,attenuationHex:6960555,crystalRoughness:.12,iridescence:.84,ior:1.63,emissiveHex:13081599,emissiveIntensity:.07,sightlineBeamHex:13805823},{id:"MENSA_QUANTUM_IRIDIUM_GLASS",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:16,name:"Mensa Quantum Iridium & Prismatic Glass",shortBadge:"MENSA 99TH",milestoneTitle:"Hall of Honours v2.0 · Mensa 99th-Percentile Laureate",unlockRequirementSummary:"Score ≥ 80% on a Mensa-Tier Round (#69) · Zero Pay-to-Win.",craftProvenance:"Ultra-dense sintered iridium-platinum gimbals suspending ultraviolet quantum-dispersion crystal reserved for 99th-percentile laureates.",hubOrigin:"global",baseDomainId:11,swatchPrimaryCss:"#e8f1ff",swatchSecondaryCss:"#39227a",swatchCrystalCss:"#091124",stage3dSkinId:"MYTHIC_CELESTIAL_DIAMOND",primaryMetalHex:15266303,secondaryMetalHex:3744378,metalRoughness:.11,shutterRoughness:.13,crystalColorHex:594212,attenuationHex:4927160,crystalRoughness:.09,iridescence:1,ior:1.7,emissiveHex:9368319,emissiveIntensity:.07,sightlineBeamHex:13148927}],U=[...Ms,...Os];function Lt(){try{if(typeof localStorage>"u")return[];const s=localStorage.getItem(Ct);if(!s)return[];const e=JSON.parse(s);return Array.isArray(e)?e.filter(a=>U.some(t=>t.id===a)):[]}catch{return[]}}function Ds(s){const e=Lt();if(e.includes(s))return!1;e.push(s);try{typeof localStorage<"u"&&localStorage.setItem(Ct,JSON.stringify(e))}catch{}return!0}function oe(s){return U.find(a=>a.id===s)??U[0]}function fe(){try{if(typeof localStorage<"u"){const s=localStorage.getItem(Tt);if(s&&U.some(e=>e.id===s))return s}}catch{}return"SOVEREIGN_OBSIDIAN_24K"}function Mt(){return oe(fe())}function Ot(s){const e=oe(s);try{typeof localStorage<"u"&&localStorage.setItem(Tt,e.id)}catch{}return e}function $s(s){let e=0,a=Math.max(0,...s.dailyHistory.map(m=>m.percentile)),t=0,i=1200,r=0,n=0,o=0,p=0,d=0;try{if(typeof localStorage<"u"){const m=localStorage.getItem(Ts);if(m){const v=JSON.parse(m);e=Math.max(0,Math.floor(Number(v?.dailyStreak)||0)),a=Math.max(a,Math.floor(Number(v?.bestPercentile)||0))}const c=localStorage.getItem(Cs);if(c){const v=JSON.parse(c);t=Math.max(0,Math.floor(Number(v?.bestDepthEver)||0),Math.floor(Number(v?.depth)||0)-1)}const u=localStorage.getItem(Ls);if(u){const v=JSON.parse(u);i=Math.max(700,Math.floor(Number(v?.trialsElo)||1200)),r=Math.max(0,Math.floor(Number(v?.wins)||0))}const y=localStorage.getItem("ws_career_analytics_v1");if(y){const v=JSON.parse(y);n=Math.max(0,Math.floor(Number(v?.feats?.visualBlueprintsSolved)||0)),o=Math.max(o,Math.floor(Number(v?.feats?.duelGhostWins)||0)),d=Math.max(0,Math.floor(Number(v?.feats?.difficultyBestAccuracyPct?.MENSA)||0))}const x=localStorage.getItem("ws_duel_rivals_v2");if(x){const v=JSON.parse(x),k=Array.isArray(v?.history)?v.history.filter(b=>b?.winner==="PLAYER").length:0,f=v?.rivalsById&&typeof v.rivalsById=="object"?Object.values(v.rivalsById).reduce((b,w)=>b+Math.max(0,Math.floor(Number(w?.lossesAgainstPlayer)||0)),0):0;o=Math.max(o,k,f)}const g=localStorage.getItem("ws_spaced_repetition_v2");if(g){const v=JSON.parse(g);Array.isArray(v?.cards)&&(p=v.cards.filter(k=>Number(k?.box)===5).length)}}}catch{}const l=J.getSkillSnapshot();return{dailyStreak:e,dailyBestPercentile:a,bestEndlessDepth:t,trialsElo:i,trialsWins:r,globalElo:l.globalElo,bestStreak:l.bestStreak,totalCorrect:l.totalCorrect,visualBlueprintsSolved:n,duelWins:o,srsBox5Mastered:p,mensaBestAccPct:d}}function Ye(s,e){const a=s.getSnapshot(),t=e?.getSnapshot()??null,i=fe(),r=$s(a),n=new Set(Lt()),o=Math.max(1200,...a.domainElo);return U.map(p=>{const d=p.id===i,l=n.has(p.id);if(p.id==="SOVEREIGN_OBSIDIAN_24K")return{spec:p,unlocked:!0,equipped:d,progressRatio:1,progressLabel:"Geneva Standard Issue"};if(p.id==="DAMASCUS_STEEL_AMBER"){const c=a.visas.gb,u=l||!!c?.cleared||r.dailyStreak>=2||r.bestEndlessDepth>=3||!!t?.unlockedSkins.includes("DAMASCUS_TITANIUM"),y=u?1:Math.max((c?.missionsCompleted??0)/5,r.dailyStreak/2,r.bestEndlessDepth/3);return{spec:p,unlocked:u,equipped:d,progressRatio:Math.min(1,y),progressLabel:u?"Unlocked · London / Citation":`London ${c?.missionsCompleted??0}/5 · Streak ${r.dailyStreak}/2d`}}if(p.id==="KYOTO_URUSHI_KINTSUGI"){const c=a.visas.jp,u=l||!!c?.cleared||r.bestEndlessDepth>=5||r.dailyStreak>=3||!!t?.unlockedSkins.includes("KYOTO_KINTSUGI"),y=u?1:Math.max((c?.missionsCompleted??0)/5,r.bestEndlessDepth/5,r.dailyStreak/3);return{spec:p,unlocked:u,equipped:d,progressRatio:Math.min(1,y),progressLabel:u?"Unlocked · Tokyo / Depth 5":`Tokyo ${c?.missionsCompleted??0}/5 · Depth ${r.bestEndlessDepth}/5`}}if(p.id==="IMPERIAL_EMERALD_BRASS"){const c=a.visas.br,u=l||!!c?.cleared||r.bestEndlessDepth>=10||!!t?.unlockedSkins.includes("EMERALD_SOVEREIGN"),y=u?1:Math.max((c?.missionsCompleted??0)/5,r.bestEndlessDepth/10);return{spec:p,unlocked:u,equipped:d,progressRatio:Math.min(1,y),progressLabel:u?"Unlocked · Rio / Depth 10":`Rio ${c?.missionsCompleted??0}/5 · Depth ${r.bestEndlessDepth}/10`}}if(p.id==="PHARAONIC_LAPIS_ELECTRUM"){const c=a.visas.eg,u=l||!!c?.cleared||r.dailyStreak>=5||r.dailyBestPercentile>=75,y=u?1:Math.max((c?.missionsCompleted??0)/5,r.dailyStreak/5,r.dailyBestPercentile/75);return{spec:p,unlocked:u,equipped:d,progressRatio:Math.min(1,y),progressLabel:u?"Unlocked · Cairo / Top 25%":`Cairo ${c?.missionsCompleted??0}/5 · Best ${r.dailyBestPercentile}/75%ile`}}if(p.id==="AURORA_DICHROIC_TITANIUM"){const c=a.visas.is,u=Math.max(r.globalElo,r.trialsElo),y=l||!!c?.cleared||!!a.visas.global?.cleared||r.bestEndlessDepth>=15||u>=1550,x=y?1:Math.max((c?.missionsCompleted??0)/5,r.bestEndlessDepth/15,Math.max(0,(u-1200)/350));return{spec:p,unlocked:y,equipped:d,progressRatio:Math.min(1,x),progressLabel:y?"Unlocked · Reykjavik / Grandmaster":`Reykjavik ${c?.missionsCompleted??0}/5 · Elo ${u}/1550`}}if(p.id==="BLACK_SALON_CRIMSON_OBSIDIAN"){const c=l||r.trialsWins>=1||!!t?.unlockedSkins.includes("BLACK_SALON_CRIMSON");return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:0,progressLabel:c?"Unlocked · Black Salon Citation":"Win 1 Ghost Duel or Catch a Rival Bluff"}}if(p.id==="STERLING_CHRONOMETER_RHODIUM"){const c=l||r.bestStreak>=10,u=c?1:Math.min(1,r.bestStreak/10);return{spec:p,unlocked:c,equipped:d,progressRatio:u,progressLabel:c?"Unlocked · Envoy Sterling Citation":`Peak Streak ${r.bestStreak} / 10`}}if(p.id==="CONSUL_MALACHITE_VERDIGRIS"){const c=l||r.bestStreak>=20||r.totalCorrect>=100||o>=1500,u=c?1:Math.min(1,Math.max(r.bestStreak/20,r.totalCorrect/100,Math.max(0,(o-1200)/300)));return{spec:p,unlocked:c,equipped:d,progressRatio:u,progressLabel:c?"Unlocked · Consul 24K Citation":`Correct ${r.totalCorrect}/100 · Max ELO ${o}/1500`}}if(p.id==="ARBITER_SMOKED_SAPPHIRE_PLATINUM"){const c=a.visas.sg,u=l||!!c?.cleared||r.bestStreak>=35||a.unlockedRelics.length>=6,y=u?1:Math.min(1,Math.max((c?.missionsCompleted??0)/5,r.bestStreak/35,a.unlockedRelics.length/6));return{spec:p,unlocked:u,equipped:d,progressRatio:y,progressLabel:u?"Unlocked · Arbiter Sapphire Citation":`Relics ${a.unlockedRelics.length}/6 · Streak ${r.bestStreak}/35`}}if(p.id==="SOLAR_OCULUS_WHITE_GOLD"){const c=l||r.bestStreak>=15;return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:Math.min(1,r.bestStreak/15),progressLabel:c?"Unlocked · 6.0x Overclock Citation":"3× 6.0x Max Overclocks in 1 Match · OR 15-Streak"}}if(p.id==="CELESTIAL_DIAMOND_SOVEREIGN"){const c=l||!!(t&&t.achievedEndings.length>=4);return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:Math.min(1,(t?.achievedEndings.length??0)/4),progressLabel:c?"Unlocked · Mythic 0.1% Crown":"Earn ANY Tier-5 Mythic Trophy in Hall of Honours"}}if(p.id==="SAPPHIRE_BLUEPRINT_CYANOTYPE"){const c=l||r.visualBlueprintsSolved>=10;return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:Math.min(1,r.visualBlueprintsSolved/10),progressLabel:c?"Unlocked · Master Blueprint Architect":`Visual Blueprints Solved ${r.visualBlueprintsSolved}/10`}}if(p.id==="DUELIST_BLOODSTONE_PLATINUM"){const c=l||r.duelWins>=1;return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:0,progressLabel:c?"Unlocked · Ghost Split Breaker":"Beat a Challenger Ghost in a 1v1 Duel"}}if(p.id==="NEURAL_ENGRAM_AMETHYST_GOLD"){const c=l||r.srsBox5Mastered>=5;return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:Math.min(1,r.srsBox5Mastered/5),progressLabel:c?"Unlocked · Leitner Box-5 Polymath":`Box-5 Mastered Cards ${r.srsBox5Mastered}/5`}}const m=l||r.mensaBestAccPct>=80;return{spec:p,unlocked:m,equipped:d,progressRatio:m?1:Math.min(1,r.mensaBestAccPct/80),progressLabel:m?"Unlocked · Mensa 99th-Percentile Laureate":`Mensa Best Round ${r.mensaBestAccPct}% / 80%`}})}const Ns=["Facet_Carousel","Carousel_Spider","Facet_","Gimbal_Outer","Gimbal_Equatorial","Brass_Crown","Shutter_","Overclock_Jaw_","Firing_Pin","Prism_Pedestal","Ring_Outer","Ring_Mid","Petal_","Caliper_","Orb_Base","Cryptex_Ring_","Chronometer_Bezel","Chronometer_Needle"];function Bs(s){let e=s,a=!1,t=!1;for(;e;){const i=e.name||"";i.startsWith("Shutter_")||i.startsWith("Petal_")||i==="Gimbal_Equatorial"||i==="Ring_Mid"?(t=!0,a=!0):Ns.some(r=>i.startsWith(r))&&(a=!0),e=e.parent}return a?t?"SHUTTER_SECONDARY":"PRIMARY_METAL":"NONE"}function Le(s,e,a={}){a.updateDomainPalette&&s.setDomain(e.baseDomainId),s.equipPrismSkin({id:e.stage3dSkinId,name:e.name,metalHex:e.primaryMetalHex,secondaryMetalHex:e.secondaryMetalHex,shutterHex:e.secondaryMetalHex,crystalHex:e.crystalColorHex,accentHex:e.sightlineBeamHex,metalRoughness:e.metalRoughness,iridescence:e.iridescence,useDomainAccent:e.id==="SOVEREIGN_OBSIDIAN_24K"}),s.prismRig.root.traverse(i=>{if(i instanceof ns){i.color.setHex(e.emissiveHex);return}if(!(i instanceof ls)||"curveRadius"in i&&"sync"in i)return;if(i.material instanceof cs&&i.material.uniforms?.uColor){i.material.uniforms.uColor.value.setHex(e.sightlineBeamHex);return}if(i.geometry instanceof ds&&i.material instanceof ps){i.material.color.setHex(e.sightlineBeamHex);return}const n=(Array.isArray(i.material)?i.material:[i.material]).map(o=>{if(!o||!o.visible)return o;if(o instanceof hs&&(o.transmission>.25||o.transparent&&o.clearcoat>=.8&&o.opacity<.96))return o.color.setHex(e.crystalColorHex),o.attenuationColor.setHex(e.attenuationHex),o.roughness=e.crystalRoughness,o.iridescence=Math.max(.2,e.iridescence),o.ior=Math.max(1.77,e.ior),o.clearcoat=1,o.clearcoatRoughness=.04,o.emissive.setHex(e.emissiveHex),o.emissiveIntensity=e.emissiveIntensity,o;if(o instanceof us){const p=Bs(i);if(p==="NONE"||o.metalness<.32&&o.roughness>.45&&p==="PRIMARY_METAL")return o;let d=o;return o.userData&&o.userData.__wsAtelierUnique||(d=o.clone(),d.userData={...o.userData,__wsAtelierUnique:!0}),p==="SHUTTER_SECONDARY"?(d.color.setHex(e.secondaryMetalHex),d.roughness=e.shutterRoughness,d.metalness=Math.max(.68,d.metalness)):(d.color.setHex(e.primaryMetalHex),d.roughness=e.metalRoughness,d.metalness=Math.max(.92,d.metalness)),d.envMapIntensity=Math.min(d.envMapIntensity||.62,.64),d}return o});i.material=Array.isArray(i.material)?n:n[0]})}function Dt(s){const e=Mt();return Le(s,e,{updateDomainPalette:!1}),e}class Ps{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};previewFinishId=fe();peelPreviewOpen=!1;previewReqToken=0;overclockSurgeTimer=null;constructor(e){this.deps=e,de()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.previewFinishId=fe(),this.peelPreviewOpen=!1;const a=document.createElement("div");a.className="ws-meta-backdrop is-stage-dock",a.setAttribute("role","dialog"),a.setAttribute("aria-label","Prism Atelier — 12 Zero Pay-to-Win Finishes"),document.body.appendChild(a),this.modalBackdrop=a,this.detachEscape=ce(()=>this.handleBackOrClose()),this.syncUiRootVisibility(!0),this.syncLive3DPreview(oe(this.previewFinishId),!0),this.renderInto(a,!0)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}this.handleClose()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}mount(e,a={}){this.unmount(),this.callbacks=a,this.previewFinishId=fe(),this.mountedContainer=e,this.syncLive3DPreview(oe(this.previewFinishId),!0),this.renderInto(e,!1)}unmount(){this.previewReqToken+=1,this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.overclockSurgeTimer&&(clearTimeout(this.overclockSurgeTimer),this.overclockSurgeTimer=null),this.syncUiRootVisibility(!1),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.deps.stage3d&&(this.deps.stage3d.setOverclockState(!1,0),Dt(this.deps.stage3d)),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}syncUiRootVisibility(e){if(typeof document>"u")return;document.documentElement.classList.toggle("ws-3d-showcase-open",e);const a=document.getElementById("ui-root");a&&(a.style.visibility=e?"hidden":"visible")}async syncLive3DPreview(e,a=!1){const t=this.deps.stage3d;if(!t)return;const i=++this.previewReqToken;if(a){if(t.setLightingMode("BROADCAST"),await t.setMorph("SIGHTLINE_LOCK",{options:["SPIN","PEEL","OVERCLOCK",e.shortBadge],domainId:e.baseDomainId,initialIndex:0,peelTier:this.peelPreviewOpen?2:1}),i!==this.previewReqToken||!this.isOpen())return;t.setCameraShot(this.peelPreviewOpen?"PRISM_PEEL_INSPECT":"PRISM_STANDARD")}else t.setDomain(e.baseDomainId);i!==this.previewReqToken||!this.isOpen()||Le(t,e,{updateDomainPalette:!1})}rerender(){this.modalBackdrop?(this.modalBackdrop.className="ws-meta-backdrop is-stage-dock",this.syncUiRootVisibility(!0),this.renderInto(this.modalBackdrop,!0)):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,a){const t=Ye(this.deps.passport,this.deps.blackboard),i=t.find(l=>l.spec.id===this.previewFinishId)??t[0],r=i.spec,n=t.filter(l=>l.unlocked).length,o=`
      <div class="ws-meta-hscroll" style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.06);" aria-label="Select Prism Finish">
        ${t.map(l=>`
              <button
                type="button"
                class="ws-meta-chip ${l.spec.id===this.previewFinishId?"is-active":""}"
                data-atelier-select="${l.spec.id}"
              >
                <span style="width:16px;height:16px;border-radius:50%;flex-shrink:0;background:conic-gradient(${l.spec.swatchPrimaryCss} 0deg 140deg, ${l.spec.swatchSecondaryCss} 140deg 260deg, ${l.spec.swatchCrystalCss} 260deg 360deg);box-shadow:0 0 0 1px rgba(255,255,255,0.45);"></span>
                <span>${h(l.spec.shortBadge)}</span>
                ${l.equipped?'<span style="color:var(--emerald-win);font-size:10px;">✓</span>':l.unlocked?"":'<span style="opacity:0.65;font-size:10px;">◇</span>'}
              </button>
            `).join("")}
      </div>
    `,p=`
      <!-- Active Finish Editorial Header & Equip Action -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:11px;min-width:0;">
            <span style="width:34px;height:34px;border-radius:50%;flex-shrink:0;background:conic-gradient(${r.swatchPrimaryCss} 0deg 140deg, ${r.swatchSecondaryCss} 140deg 260deg, ${r.swatchCrystalCss} 260deg 360deg);box-shadow:0 0 0 1.5px var(--gold-bright);"></span>
            <div style="min-width:0;">
              <div style="font-family:var(--font-display);font-size:15.5px;font-weight:800;color:var(--gold-bright);line-height:1.2;">
                ${h(r.name)}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);margin-top:2px;">
                ${h(r.milestoneTitle)}
              </div>
            </div>
          </div>

          ${i.equipped?'<span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--emerald-win);white-space:nowrap;flex-shrink:0;">✓ EQUIPPED</span>':i.unlocked?'<button type="button" class="ws-meta-btn-gold" id="ws-atelier-equip-btn" style="flex-shrink:0;">Equip</button>':'<span style="font-family:var(--font-mono);font-size:10.5px;color:#9aa4b7;white-space:nowrap;flex-shrink:0;">◇ Preview</span>'}
        </div>

        <p style="margin:0;font-size:12.5px;color:var(--ivory-primary);line-height:1.45;">
          ${h(M(r.craftProvenance))}
        </p>

        <div style="display:flex;flex-direction:column;gap:5px;">
          <div style="display:flex;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:10.5px;color:${i.unlocked?"var(--emerald-win)":"var(--ivory-muted)"};">
            <span>${h(i.progressLabel)}</span>
            <span>${Math.round(i.progressRatio*100)}%</span>
          </div>
          <div class="ws-meta-progress-track">
            <div class="ws-meta-progress-fill" style="width:${Math.round(i.progressRatio*100)}%;background:${i.unlocked?"var(--emerald-win)":"var(--gold-bright)"};"></div>
          </div>
        </div>
      </div>

      <!-- Hairline Catalog of All Zero-Pay-to-Win Finishes -->
      <div class="ws-meta-section" style="border-bottom:none;gap:2px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
          <span class="ws-meta-section-title">All ${U.length} Finishes (${n}/${U.length})</span>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--emerald-win);">✦ 100% Zero Pay-to-Win</span>
        </div>
        ${t.map(l=>`
              <button
                type="button"
                class="ws-meta-row is-interactive ${l.spec.id===this.previewFinishId?"is-focused":""}"
                data-atelier-select="${l.spec.id}"
                style="width:100%;text-align:left;"
              >
                <span style="display:inline-flex;align-items:center;gap:10px;min-width:0;">
                  <span style="width:20px;height:20px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg, ${l.spec.swatchPrimaryCss} 0%, ${l.spec.swatchSecondaryCss} 55%, ${l.spec.swatchCrystalCss} 100%);box-shadow:0 0 0 1px rgba(255,255,255,0.4);"></span>
                  <span style="min-width:0;display:flex;flex-direction:column;">
                    <span style="font-size:12.5px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${l.spec.order}. ${h(l.spec.name)}</span>
                    <span style="font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">${h(l.spec.unlockRequirementSummary)}</span>
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${l.equipped?"var(--emerald-win)":l.unlocked?"var(--gold-bright)":"var(--ivory-dim)"};flex-shrink:0;">
                  ${l.equipped?"✓ ON":l.unlocked?"◆ READY":`${Math.round(l.progressRatio*100)}%`}
                </span>
              </button>
            `).join("")}
      </div>
    `;if(a){const l=X("ATELIER",{isModal:!0,closeBtnId:"ws-atelier-close",canNavigate:!!this.callbacks.onNavigateSection,floatingVariant:!0});e.innerHTML=`
        <!-- Open Unobstructed 50dvh Portrait / 50vw Landscape 3D Prism Stage -->
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-atelier-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${l}
          </div>
          <div class="ws-meta-stage-bottom">
            <span class="ws-meta-orbit-whisper">↻ Drag 3D to Orbit</span>
            ${this.deps.stage3d?`
                  <div class="ws-meta-stage-actions">
                    <button
                      type="button"
                      class="ws-meta-float-pill ${this.peelPreviewOpen?"is-active-gold":""}"
                      id="ws-atelier-peel-toggle"
                      aria-pressed="${this.peelPreviewOpen}"
                    >
                      ✦ ${this.peelPreviewOpen?"Seal":"Peel"}
                    </button>
                    <button
                      type="button"
                      class="ws-meta-float-pill"
                      id="ws-atelier-overclock-pulse"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                      Surge
                    </button>
                  </div>
                `:""}
          </div>
        </div>

        <!-- Sleek 45-46dvh Portrait / 50vw Landscape Dark-Obsidian Bottom Sheet -->
        <div class="ws-meta-sheet">
          <div class="ws-meta-drag-handle" aria-hidden="true"></div>
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:4px 16px 6px;border-bottom:1px solid rgba(255,255,255,0.07);flex-shrink:0;">
            <h2 class="ws-meta-title" style="flex-shrink:0;">PRISM ATELIER</h2>
            <span class="ws-meta-eyebrow">${n}/${U.length} Unlocked</span>
          </div>
          ${o}
          <div class="ws-meta-body-scroll">
            ${p}
          </div>
        </div>
      `,this.bindEvents(e);return}const d=X("ATELIER",{isModal:!1,closeBtnId:"ws-atelier-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-atelier-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">PRISM ATELIER</h2>
              <div class="ws-meta-eyebrow">${n}/${U.length} Finishes Unlocked</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${d}
          </div>
        </div>
        ${o}
        <div class="ws-meta-body-scroll">
          ${p}
        </div>
      </div>
    `,this.bindEvents(e)}bindEvents(e){e.querySelector("#ws-atelier-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),le(e,{closeBtnId:"ws-atelier-close",onNavigate:a=>this.callbacks.onNavigateSection?.(a),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-atelier-select]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.atelierSelect;if(!t)return;this.previewFinishId=t;const i=oe(t);this.deps.haptics?.sightlineSnap(),this.deps.audio?.playSfx("sightline_snap"),this.syncLive3DPreview(i,!0),this.rerender()})}),e.querySelector("#ws-atelier-equip-btn")?.addEventListener("click",()=>{const t=Ye(this.deps.passport,this.deps.blackboard).find(r=>r.spec.id===this.previewFinishId);if(!t||!t.unlocked)return;const i=Ot(t.spec.id);this.deps.blackboard?.unlockSkin(i.legacyBlackboardSkinId,!0),this.deps.stage3d&&Le(this.deps.stage3d,i,{updateDomainPalette:!1}),this.deps.haptics?.lockThunk(),this.deps.audio?.playSfx("vault_thunk"),this.deps.audio?.playSfx("gold_resonance"),this.callbacks.onEquipSkin?.(i),this.rerender()}),e.querySelector("#ws-atelier-peel-toggle")?.addEventListener("click",()=>{this.peelPreviewOpen=!this.peelPreviewOpen,this.deps.haptics?.peel(this.peelPreviewOpen?2:1),this.deps.audio?.playSfx("shutter_peel"),this.syncLive3DPreview(oe(this.previewFinishId),!0),this.rerender()}),e.querySelector("#ws-atelier-overclock-pulse")?.addEventListener("click",()=>{const a=this.deps.stage3d;a&&(this.overclockSurgeTimer&&clearTimeout(this.overclockSurgeTimer),this.deps.haptics?.overclockPulse(.85),this.deps.audio?.playSfx("overclock_charge"),a.setOverclockState(!0,.92),this.overclockSurgeTimer=setTimeout(()=>{this.overclockSurgeTimer=null,this.isOpen()&&(a.setOverclockState(!1,0),this.deps.audio?.playSfx("gold_resonance"))},950))})}}const Hs="ws_council_trials_v2",G={SOVEREIGN:{id:"SOVEREIGN",name:"The Sovereign Bloc",epithet:"The Iron Laurel",chairName:"Chancellor Ingrid Lindqvist",chairTitle:"Sovereign Council Chair · Former Nordic PM",fieldEnvoyLabel:"London Rotunda Seat",portraitCutoutUrl:"./assets/portraits_cutout/lindqvist.png",philosophyPillars:"Order · Heritage · Treaty Protocol",manifestoQuote:"Civilization endures only when truth is weighed inside treaty law, institutional memory, and disciplined stewardship.",affinityDomains:[0,8,3,10],passportCrestReward:"IRON LAUREL LEGATE · SOVEREIGN BLOC",accentHex:"#f2cf7e",secondaryHex:"#6c5326"},HORIZON:{id:"HORIZON",name:"The Horizon Collective",epithet:"The Glass Spire",chairName:"Director Kenji Takahashi",chairTitle:"Horizon Collective Chair · Tokyo Spire",fieldEnvoyLabel:'Envoy: Soren "Echo" Kael',portraitCutoutUrl:"./assets/portraits_cutout/soren.png",philosophyPillars:"Velocity · Optimization · Calculated Risk",manifestoQuote:"Consensus moves at the speed of yesterday’s crisis. Tomorrow belongs to minds fast enough to model reality before the clock blinks.",affinityDomains:[6,1,11],passportCrestReward:"GLASS SPIRE VANGUARD · HORIZON COLLECTIVE",accentHex:"#56d4f5",secondaryHex:"#184b6e"},AGORA:{id:"AGORA",name:"The Agora Coalition",epithet:"The Open Commons",chairName:"Ambassador Amara Okafor",chairTitle:"Agora Coalition Envoy · Civic Assembly",fieldEnvoyLabel:"Envoy: Nadia Al-Mansoor",portraitCutoutUrl:"./assets/portraits_cutout/nadia.png",philosophyPillars:"Transparency · Empathy · Living Culture",manifestoQuote:"Knowledge locked inside an Alpine vault becomes leverage. Shared openly across humanity, it becomes liberation.",affinityDomains:[2,4,7,9,5],passportCrestReward:"OPEN COMMONS ENVOY · AGORA COALITION",accentHex:"#39d49a",secondaryHex:"#15543e"}},ut=["SOVEREIGN","HORIZON","AGORA"],Fs=[{hub:"ch",city:"Geneva",baseLeader:"SOVEREIGN"},{hub:"gb",city:"London",baseLeader:"SOVEREIGN"},{hub:"jp",city:"Tokyo",baseLeader:"HORIZON"},{hub:"br",city:"Rio",baseLeader:"AGORA"},{hub:"eg",city:"Cairo",baseLeader:"AGORA"},{hub:"is",city:"Reykjavik",baseLeader:"HORIZON"},{hub:"sg",city:"Singapore",baseLeader:"HORIZON"},{hub:"global",city:"Apex Forum",baseLeader:"SOVEREIGN"}];function Gs(s,e){const a=e?.[s];return a||(s==="SOVEREIGN"?`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="sovG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff0bc"/>
          <stop offset="55%" stop-color="#d8af57"/>
          <stop offset="100%" stop-color="#8a6520"/>
        </linearGradient>
      </defs>
      <polygon points="64,8 112,28 102,88 64,120 26,88 16,28" fill="#101522" stroke="url(#sovG)" stroke-width="3.5"/>
      <polygon points="64,16 103,33 95,83 64,111 33,83 25,33" fill="none" stroke="rgba(242,207,126,0.45)" stroke-width="1.2"/>
      <path d="M40,82 C30,66 34,44 50,34 M88,82 C98,66 94,44 78,34" fill="none" stroke="url(#sovG)" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M64,32 L64,88 M44,50 L84,50" stroke="url(#sovG)" stroke-width="2.8" stroke-linecap="round"/>
      <polygon points="44,50 37,65 51,65" fill="none" stroke="#fff0bc" stroke-width="1.8"/>
      <polygon points="84,50 77,65 91,65" fill="none" stroke="#fff0bc" stroke-width="1.8"/>
      <circle cx="64" cy="32" r="4.5" fill="#fff0bc"/>
    </svg>`)}`:s==="HORIZON"?`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="hrzG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#a8f5ff"/>
          <stop offset="55%" stop-color="#48b8f0"/>
          <stop offset="100%" stop-color="#1b5685"/>
        </linearGradient>
      </defs>
      <polygon points="64,6 116,64 64,122 12,64" fill="#0b1526" stroke="url(#hrzG)" stroke-width="3.5"/>
      <ellipse cx="64" cy="68" rx="38" ry="14" fill="none" stroke="#56d4f5" stroke-width="1.8" transform="rotate(-18 64 68)"/>
      <ellipse cx="64" cy="68" rx="38" ry="14" fill="none" stroke="#f2cf7e" stroke-width="1.5" transform="rotate(18 64 68)"/>
      <polygon points="64,20 80,86 64,98 48,86" fill="url(#hrzG)" opacity="0.88"/>
      <line x1="64" y1="20" x2="64" y2="98" stroke="#ffffff" stroke-width="2"/>
    </svg>`)}`:`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
    <defs>
      <linearGradient id="agrG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8cf7c8"/>
        <stop offset="55%" stop-color="#39d49a"/>
        <stop offset="100%" stop-color="#16694c"/>
      </linearGradient>
    </defs>
    <circle cx="64" cy="64" r="54" fill="#0b1c19" stroke="url(#agrG)" stroke-width="3.5"/>
    <circle cx="64" cy="64" r="46" fill="none" stroke="rgba(242,207,126,0.5)" stroke-width="1.2" stroke-dasharray="4 3"/>
    <circle cx="64" cy="62" r="24" fill="none" stroke="url(#agrG)" stroke-width="2.2"/>
    <ellipse cx="64" cy="62" rx="11" ry="24" fill="none" stroke="url(#agrG)" stroke-width="1.6"/>
    <line x1="40" y1="62" x2="88" y2="62" stroke="#f2cf7e" stroke-width="1.8"/>
    <path d="M34,86 Q64,104 94,86" fill="none" stroke="#f2cf7e" stroke-width="2.8" stroke-linecap="round"/>
  </svg>`)}`)}function Us(){const s=Math.floor(Date.now()/36e5)%240,e={trialsElo:1200,wins:0,losses:0,salonTrophies:0,factionStandings:{SOVEREIGN:14820+s*3,HORIZON:14690+s*4,AGORA:14760+s*3}};try{if(typeof localStorage>"u")return e;const a=localStorage.getItem(Hs);if(!a)return e;const t=JSON.parse(a);return!t||typeof t!="object"?e:{trialsElo:Math.max(700,Math.round(Number(t.trialsElo)||1200)),wins:Math.max(0,Math.floor(Number(t.wins)||0)),losses:Math.max(0,Math.floor(Number(t.losses)||0)),salonTrophies:Math.max(0,Math.floor(Number(t.salonTrophies)||0)),factionStandings:{SOVEREIGN:Math.max(14e3,Math.floor(Number(t.factionStandings?.SOVEREIGN)||e.factionStandings.SOVEREIGN)),HORIZON:Math.max(14e3,Math.floor(Number(t.factionStandings?.HORIZON)||e.factionStandings.HORIZON)),AGORA:Math.max(14e3,Math.floor(Number(t.factionStandings?.AGORA)||e.factionStandings.AGORA))}}}catch{return e}}class qs{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};justPledgedToast=null;constructor(e){this.deps=e,de()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.justPledgedToast=null;const a=document.createElement("div");a.className="ws-meta-backdrop",a.setAttribute("role","dialog"),a.setAttribute("aria-modal","true"),a.setAttribute("aria-label","World Council Factions & Seasonal League"),a.addEventListener("click",t=>{t.target===a&&this.handleClose()}),document.body.appendChild(a),this.modalBackdrop=a,this.detachEscape=ce(()=>this.handleBackOrClose()),this.renderInto(a,!0)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}const e=this.callbacks.onClose;this.close(),e?.()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}mount(e,a={}){this.unmount(),this.callbacks=a,this.mountedContainer=e,this.renderInto(e,!1)}unmount(){this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}computePsychometricFit(){const e=J.getSkillVector(),a=this.deps.passport.getSnapshot(),t=this.deps.blackboard.getSnapshot(),i=p=>{let d=0;for(const l of p){const m=e[l]?.elo??a.domainElo[l]??1200;d+=(m-800)/1400*100}return d/Math.max(1,p.length)},r=i(G.SOVEREIGN.affinityDomains)+t.councilFavor*.25,n=i(G.HORIZON.affinityDomains)+Math.max(0,50-t.axisIntegrity*.2)*.25,o=i(G.AGORA.affinityDomains)+(t.publicTrust*.2+Math.max(0,t.axisIntegrity)*.12);return{SOVEREIGN:Math.min(99,Math.max(48,Math.round(52+r*.55))),HORIZON:Math.min(99,Math.max(48,Math.round(52+n*.55))),AGORA:Math.min(99,Math.max(48,Math.round(52+o*.55)))}}buildCupStandings(){const e=this.deps.trialsMode?.getHubOverview(),a=Us(),t=e?.factionStandings??a.factionStandings,i=e?.pledgedFaction??this.deps.blackboard.getSnapshot().pledgedFaction,r=this.computePsychometricFit(),n=Math.max(1,t.SOVEREIGN+t.HORIZON+t.AGORA);return{standings:[...ut].sort((d,l)=>t[l]-t[d]).map((d,l)=>({faction:G[d],rank:l+1,cupPoints:t[d],sharePct:Number((t[d]/n*100).toFixed(1)),psychometricFitPct:r[d],isPledged:i===d})),trialsElo:e?.trialsElo??a.trialsElo,wins:e?.wins??a.wins,losses:e?.losses??a.losses,salonTrophies:e?.salonTrophies??a.salonTrophies,pledgedFaction:i}}rerender(){this.modalBackdrop?this.renderInto(this.modalBackdrop,!0):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,a){const t=this.deps.passport.getChallengerName(),i=this.deps.passport.getSnapshot(),{standings:r,trialsElo:n,wins:o,salonTrophies:p,pledgedFaction:d}=this.buildCupStandings(),l=o>=12?"HIGH LEGATE":o>=6?"COUNCILOR":o>=2?"ATTACHÉ":"DIPLOMATIC ENVOY",m=X("FACTIONS",{isModal:a,closeBtnId:"ws-factions-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-factions-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">COUNCIL BLOCS</h2>
              <div class="ws-meta-eyebrow">${h(t)} · ${l} · ELO ${n}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${m}
          </div>
        </div>

        <div class="ws-meta-body-scroll">
          ${this.justPledgedToast?`
                <div class="ws-meta-section" style="padding-top:0;">
                  <div class="ws-meta-note" style="box-shadow:inset 3px 0 0 ${G[this.justPledgedToast].accentHex};color:var(--ivory-primary);">
                    ✒ <strong>Allegiance Stamped:</strong> ${h(t)} now represents
                    <strong style="color:${G[this.justPledgedToast].accentHex};">${h(G[this.justPledgedToast].name)}</strong>
                    in World Council Trials.
                  </div>
                </div>
              `:""}

          <!-- Season 1 World Council Cup Standings (Frameless Hairline Section) -->
          <div class="ws-meta-section" style="${this.justPledgedToast?"":"padding-top:0;"}">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">Season 1 Mandate Cup Standings</h3>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-dim);">
                +150 Ghost Win · +250 Black Salon${p>0?` · ${p} Crown`:""}
              </span>
            </div>

            <div style="display:flex;flex-direction:column;gap:9px;">
              ${r.map(c=>`
                    <div style="display:flex;flex-direction:column;gap:4px;">
                      <div style="display:flex;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11.5px;">
                        <span style="color:${c.faction.accentHex};font-weight:700;">
                          #${c.rank} ${h(c.faction.name)}${c.isPledged?" · ★ Pledged":""}
                        </span>
                        <span style="color:var(--ivory-primary);font-weight:700;flex-shrink:0;">
                          ${c.cupPoints.toLocaleString("en-US")} <span style="color:var(--ivory-dim);font-weight:500;">(${c.sharePct}%)</span>
                        </span>
                      </div>
                      <div class="ws-meta-progress-track" style="height:5px;">
                        <div class="ws-meta-progress-fill" style="width:${Math.min(100,Math.max(12,c.sharePct*2.4)).toFixed(1)}%;background:${c.faction.accentHex};"></div>
                      </div>
                    </div>
                  `).join("")}
            </div>

            <!-- Horizontal Scrollable 8-Hub Regional Control Strip -->
            <div class="ws-meta-hscroll" style="padding-top:4px;" aria-label="Regional Hub Control">
              ${Fs.map(c=>{const u=i.visas[c.hub]?.cleared&&d?d:c.baseLeader,y=G[u];return`
                  <span style="flex:0 0 auto;font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);padding:4px 9px;border-radius:999px;background:rgba(255,255,255,0.04);">
                    ${h(c.city)} · <strong style="color:${y.accentHex};">${h(u)}</strong>
                  </span>
                `}).join("")}
            </div>
          </div>

          <!-- 3 World Council Bloc Allegiance Panels (Frameless Top-Hairline Editorial Columns) -->
          <div class="ws-meta-section">
            <h3 class="ws-meta-section-title">Council Blocs &amp; Allegiance</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(265px,1fr));gap:18px 22px;align-items:stretch;">
              ${ut.map(c=>{const u=G[c],y=r.find(k=>k.faction.id===c),x=this.deps.factionCrestUrls?.[c]??`./assets/factions/faction_${c.toLowerCase()}.png`,g=Gs(c),v=d===c;return`
                  <div style="display:flex;flex-direction:column;gap:10px;padding:14px 0 6px;border-top:2px solid ${u.accentHex};${v?`background:linear-gradient(180deg, ${u.accentHex}12 0%, transparent 55%);padding-left:10px;padding-right:10px;`:""}">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img
                        src="${h(x)}"
                        data-fallback-src="${h(g)}"
                        alt="${h(u.name)} Crest"
                        style="width:50px;height:50px;object-fit:contain;flex-shrink:0;"
                      />
                      <div style="min-width:0;flex:1 1 auto;">
                        <div style="font-family:var(--font-mono);font-size:9.5px;font-weight:700;color:${u.accentHex};letter-spacing:0.07em;">
                          “${h(u.epithet.toUpperCase())}” · FIT ${y.psychometricFitPct}%
                        </div>
                        <div style="font-family:var(--font-display);font-size:15px;font-weight:800;color:var(--ivory-primary);margin-top:1px;">
                          ${h(u.name)}
                        </div>
                        <div style="font-size:11px;color:var(--ivory-dim);">
                          ${h(u.philosophyPillars)}
                        </div>
                      </div>
                    </div>

                    <!-- Frameless Chair & Cutout Portrait Strip -->
                    <div style="display:flex;align-items:center;gap:9px;padding:4px 0;">
                      <div style="width:38px;height:38px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 35%, ${u.accentHex}44, #080b11);flex-shrink:0;">
                        <img src="${u.portraitCutoutUrl}" alt="${h(u.chairName)}" style="width:100%;height:100%;object-fit:cover;object-position:top center;" />
                      </div>
                      <div style="min-width:0;">
                        <div style="font-size:12px;font-weight:700;color:var(--ivory-primary);">
                          ${h(u.chairName)}
                        </div>
                        <div style="font-family:var(--font-mono);font-size:9.5px;color:var(--ivory-muted);">
                          ${h(u.chairTitle)} · ${h(u.fieldEnvoyLabel)}
                        </div>
                      </div>
                    </div>

                    <p style="margin:0;font-size:12px;font-style:italic;color:var(--ivory-muted);line-height:1.42;">
                      “${h(M(u.manifestoQuote))}”
                    </p>

                    <!-- Inline Affinity Domain Medallions -->
                    <div style="display:flex;flex-wrap:wrap;gap:6px 10px;">
                      ${u.affinityDomains.map(k=>{const f=q[k];return`
                            <span style="display:inline-flex;align-items:center;gap:4px;font-size:10.5px;color:var(--ivory-muted);">
                              <img src="./${h(f.medallionUrl)}" alt="" style="width:14px;height:14px;object-fit:contain;" />
                              ${h(f.shortName)}
                            </span>
                          `}).join("")}
                    </div>

                    <div style="margin-top:auto;padding-top:6px;">
                      ${v?`<button type="button" class="ws-meta-btn" style="width:100%;color:${u.accentHex};background:rgba(255,255,255,0.04);box-shadow:inset 3px 0 0 ${u.accentHex};opacity:1;" disabled>
                              ✓ Allegiance Pledged
                            </button>`:`<button type="button" class="ws-meta-btn-gold" data-pledge-faction="${c}" style="width:100%;">
                              ✒ Pledge to ${h(c)}
                            </button>`}
                    </div>
                  </div>
                `}).join("")}
            </div>
          </div>

          <!-- Async Kinetic Ghost Contenders & Black Salon Quick-Launch -->
          ${this.callbacks.onLaunchGhostDuel||this.callbacks.onLaunchBlackSalon?this.renderGhostContendersStrip(ms):""}
        </div>
      </div>
    `,this.bindEvents(e)}renderGhostContendersStrip(e){return`
      <div class="ws-meta-section" style="border-bottom:none;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <h3 class="ws-meta-section-title">Ranked 3D Kinetic Ghost Contenders</h3>
            <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
              Race recorded 3D Ghosts to earn +150 Cup Points for your pledged bloc.
            </div>
          </div>
          ${this.callbacks.onLaunchBlackSalon?'<button type="button" class="ws-meta-inline-link" id="ws-factions-black-salon">◈ Black Salon 16-Player ›</button>':""}
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:0 20px;">
          ${e.slice(0,4).map(a=>{const t=G[a.faction];return`
                <button
                  type="button"
                  class="ws-meta-row is-interactive"
                  data-challenge-ghost="${h(a.id)}"
                  style="width:100%;text-align:left;"
                >
                  <span style="min-width:0;">
                    <span style="display:block;font-size:12.5px;font-weight:700;color:var(--ivory-primary);line-height:1.25;">
                      ${h(a.handle)} <span style="color:var(--ivory-dim);font-weight:500;">(${h(a.countryCode)})</span>
                    </span>
                    <span style="display:block;font-family:var(--font-mono);font-size:10px;color:${t.accentHex};">
                      ${h(a.faction)} · ELO ${a.elo}
                    </span>
                  </span>
                  <span style="color:var(--gold-bright);font-family:var(--font-mono);font-size:11px;font-weight:700;flex-shrink:0;">⚔ Duel ›</span>
                </button>
              `}).join("")}
        </div>
      </div>
    `}bindEvents(e){e.querySelectorAll("img[data-fallback-src]").forEach(a=>{a.addEventListener("error",()=>{const t=a.dataset.fallbackSrc;t&&a.src!==t&&(a.src=t)},{once:!0})}),e.querySelector("#ws-factions-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),le(e,{closeBtnId:"ws-factions-close",onNavigate:a=>this.callbacks.onNavigateSection?.(a),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-pledge-faction]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.pledgeFaction;if(!t||!(t in G))return;this.deps.trialsMode?this.deps.trialsMode.pledgeFaction(t):this.deps.blackboard.setPledgedFaction(t);const i=G[t];this.deps.passport.unlockTitleCrest(i.passportCrestReward,!0),this.justPledgedToast=t,this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp"),this.deps.audio?.playSfx("gold_resonance"),this.callbacks.onPledgeFaction?.(t),this.rerender()})}),e.querySelectorAll("[data-challenge-ghost]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.challengeGhost;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.close(),this.callbacks.onLaunchGhostDuel?.(t)})}),e.querySelector("#ws-factions-black-salon")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.close(),this.callbacks.onLaunchBlackSalon?.()})}}const Pa=["MIDDLE_SCHOOL","HIGH_SCHOOL","COLLEGE","GRADUATE","MENSA"],Re="ws_career_analytics_v1",We=2e3,Ve=140,mt=2500,He=["MULTIPLE_CHOICE","MATCH_4","SORT_4","MULTI_STRIKE","PINPOINT_DIAL","CLUE_ESCALATOR","VISUAL_SPOTTER"],Je=["SIGHTLINE_LOCK","CODEX_DUAL_RING","CALIBRATOR_DIAL","GAUNTLET_SHATTER","HERO_ARTIFACT_SYNTHESIS","GLOBE_PIN_DROP"],$t=["CAMPAIGN","DAILY","BRIEFING","ENDLESS","TRIALS","PROLOGUE"],Me=["< 3.0s","3–6s","6–10s","10–15s","15s+"];function ft(s="ALL_TIME"){return{range:s,domainId:null,subcatLabel:null,archetype:null,questionFormat:null,peelTier:null,outcome:"ALL",speedBucket:null,bucketKey:null}}function Fe(s){if(!s||typeof s!="string")return null;const e=s.trim().toUpperCase();return e==="MULTIPLE_CHOICE"||e==="MATCH_4"||e==="SORT_4"||e==="MULTI_STRIKE"||e==="PINPOINT_DIAL"||e==="CLUE_ESCALATOR"||e==="VISUAL_SPOTTER"?e:null}function Oe(s){const e=Fe(s.questionFormat);if(e)return e;if(s.clueLadderStep===1||s.clueLadderStep===2||s.clueLadderStep===3)return"CLUE_ESCALATOR";switch(s.archetype){case"CALIBRATOR_DIAL":return"PINPOINT_DIAL";case"GLOBE_PIN_DROP":return"VISUAL_SPOTTER";case"CODEX_DUAL_RING":return"MATCH_4";case"GAUNTLET_SHATTER":return"MULTI_STRIKE";case"HERO_ARTIFACT_SYNTHESIS":return"CLUE_ESCALATOR";case"SIGHTLINE_LOCK":default:return"MULTIPLE_CHOICE"}}function ve(s){const e=Number.isFinite(s)?s:5200;return e<3e3?0:e<6e3?1:e<1e4?2:e<15e3?3:4}function De(s){return(Number(s.overclockCharge01)||0)>=.08||!!s.backfired}const gt={0:{core:"World Civilizations",dial:"Historical Dates",myth:"History Myths",globe:"Historic Sites"},1:{core:"Physics & Space",dial:"Scientific Milestones",myth:"Science Myths",globe:"Observatories & Labs"},2:{core:"World Capitals",dial:"Geographic Extremes",myth:"Geography Myths",globe:"Atlas Pinpoints"},3:{core:"Fine Arts & Literature",dial:"Cultural Eras",myth:"Art & Lit Myths",globe:"Cultural Landmarks"},4:{core:"Cinema & Music",dial:"Pop Culture Years",myth:"Entertainment Myths",globe:"Film & Music Capitals"},5:{core:"Championship Sports",dial:"Sports Records",myth:"Sports Myths",globe:"Iconic Venues"},6:{core:"Computing & Innovation",dial:"Tech Breakthroughs",myth:"Tech Myths",globe:"Tech Hubs"},7:{core:"Biology & Ecology",dial:"Natural Milestones",myth:"Nature Myths",globe:"Biomes & Habitats"},8:{core:"Global Politics & Law",dial:"Treaty Timelines",myth:"Civic Myths",globe:"Diplomatic Capitals"},9:{core:"Culinary & Craft",dial:"Design Heritage",myth:"Food & Design Myths",globe:"Regional Origins"},10:{core:"Philosophy & Myth",dial:"Classical Antiquity",myth:"Mythology Facts",globe:"Ancient Temples"},11:{core:"Logic & Economics",dial:"Quantitative Estimates",myth:"Logic Paradoxes",globe:"Financial Centers"}};function Nt(s){return s<1120?"MIDDLE_SCHOOL":s<1260?"HIGH_SCHOOL":s<1440?"COLLEGE":s<1650?"GRADUATE":"MENSA"}function Ze(s){if(typeof s!="string")return null;const e=s.trim().replace(/\s+/g," ").slice(0,44);return e.length>0?e:null}function et(s,e,a){const t=(a??"").toLowerCase();if(t){if(s===1){if(/\b(planet|star|orbit|galaxy|nasa|moon|mars|apollo|telescope|space)\b/.test(t))return"Astronomy & Space";if(/\b(element|atom|molecule|chemical|periodic|acid|metal|oxygen|carbon)\b/.test(t))return"Chemistry";if(/\b(dna|cell|gene|species|brain|heart|blood|organ|vaccine)\b/.test(t))return"Biology & Medicine";if(/\b(quantum|light|gravity|energy|relativity|particle|electron|cern)\b/.test(t))return"Physics"}else if(s===0){if(/\b(war|battle|treaty|empire|king|queen|dynasty|roman|greek|egypt)\b/.test(t))return"Empires & Conflict";if(/\b(revolution|constitution|president|independence|congress|charter)\b/.test(t))return"Modern History"}else if(s===5){if(/\b(baseball|mlb|home run|pitcher|world series|fenway|wrigley)\b/.test(t))return"Baseball";if(/\b(olympic|marathon|medal|sprint|swim|gymnast)\b/.test(t))return"Olympics";if(/\b(world cup|fifa|soccer|football|goal|striker)\b/.test(t))return"World Football";if(/\b(nba|basketball|tennis|wimbledon|chess|grandmaster)\b/.test(t))return"Court & Board Sports"}}const i=gt[s]??gt[0];return e==="CALIBRATOR_DIAL"?i.dial:e==="GAUNTLET_SHATTER"?i.myth:e==="GLOBE_PIN_DROP"?i.globe:i.core}function Bt(s){const e=Number.isFinite(Number(s.ts))&&Number(s.ts)>0?Math.floor(Number(s.ts)):Date.now(),a=typeof s.dateKey=="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s.dateKey.trim())?s.dateKey.trim():ne(e),t=P(Math.floor(Number(s.domainId)||0),0,11),i=je(s.mode),r=Pt(s.archetype),n=s.peelTier===2?2:s.peelTier===3?3:1,o=P(Number(s.overclockCharge01)||0,0,1),p=P(Math.round(Number(s.responseTimeMs)||5200),150,6e4),d=typeof s.speedBucketIdx=="number"&&Number.isInteger(s.speedBucketIdx)&&s.speedBucketIdx>=0&&s.speedBucketIdx<=4?s.speedBucketIdx:ve(p),l=P(Math.round(Number(s.eloAfter)||1200),600,2600),m=typeof s.promptSnippet=="string"?s.promptSnippet.trim().slice(0,96):"",c=typeof s.answerLabel=="string"?s.answerLabel.trim().slice(0,48):"",u=Ze(s.subcatLabel)??et(t,r,m),y=Qe(s.difficultyTier)??Nt(l),x=H(t),g=m||(c?`${u}: ${c}`:`${x.shortName} · ${u}`);return{ts:e,dateKey:a,qid:Math.max(0,Math.floor(Number(s.qid)||0)),domainId:t,mode:i,hubId:typeof s.hubId=="string"&&s.hubId.trim()?s.hubId.trim():"ch",archetype:r,questionFormat:Fe(s.questionFormat)??void 0,correct:!!s.correct,peelTier:n,overclockCharge01:Number(o.toFixed(2)),backfired:!!s.backfired,bluffCalled:!!s.bluffCalled,bullseye:!!s.bullseye,responseTimeMs:p,pointsDelta:Math.max(0,Math.round(Number(s.pointsDelta)||0)),eloAfter:l,promptSnippet:g,answerLabel:c||void 0,subcatLabel:u,difficultyTier:y,speedBucketIdx:d,clueLadderStep:s.clueLadderStep===1||s.clueLadderStep===2||s.clueLadderStep===3?s.clueLadderStep:void 0,mindGambitId:typeof s.mindGambitId=="string"&&s.mindGambitId?s.mindGambitId:void 0}}function P(s,e,a){return Number.isFinite(s)?Math.max(e,Math.min(a,s)):e}function ne(s){try{return new Date(s).toISOString().slice(0,10)}catch{return"2026-11-22"}}function je(s,e){if(e)return"TRIALS";const a=(s??"CAMPAIGN").toUpperCase();return a==="BLACK_SALON"||a==="GHOST_TRIALS"?"TRIALS":a==="PROLOGUE"||a==="CAMPAIGN"||a==="DAILY"||a==="BRIEFING"||a==="ENDLESS"||a==="TRIALS"?a:"CAMPAIGN"}function Qe(s){if(!s)return null;const e=s.trim().toUpperCase();return e==="MIDDLE_SCHOOL"||e==="MID_SCHOOL"||e==="EASY"?"MIDDLE_SCHOOL":e==="HIGH_SCHOOL"?"HIGH_SCHOOL":e==="COLLEGE"||e==="MEDIUM"?"COLLEGE":e==="GRADUATE"||e==="HARD"?"GRADUATE":e==="MENSA"||e==="GENIUS"?"MENSA":null}function $e(){return{MIDDLE_SCHOOL:0,HIGH_SCHOOL:0,COLLEGE:0,GRADUATE:0,MENSA:0}}function Pt(s){const e=(s??"SIGHTLINE_LOCK").toUpperCase();return e==="SIGHTLINE_LOCK"||e==="CODEX_DUAL_RING"||e==="CALIBRATOR_DIAL"||e==="GAUNTLET_SHATTER"||e==="HERO_ARTIFACT_SYNTHESIS"||e==="GLOBE_PIN_DROP"?e:"SIGHTLINE_LOCK"}function we(){return{MULTIPLE_CHOICE:{right:0,wrong:0},MATCH_4:{right:0,wrong:0},SORT_4:{right:0,wrong:0},MULTI_STRIKE:{right:0,wrong:0},PINPOINT_DIAL:{right:0,wrong:0},CLUE_ESCALATOR:{right:0,wrong:0},VISUAL_SPOTTER:{right:0,wrong:0}}}function ie(){const s=Array.from({length:12},()=>({right:0,wrong:0,totalResponseMs:0,peakElo:1200,lastElo:1200})),e={SIGHTLINE_LOCK:{right:0,wrong:0},CODEX_DUAL_RING:{right:0,wrong:0},CALIBRATOR_DIAL:{right:0,wrong:0},GAUNTLET_SHATTER:{right:0,wrong:0},HERO_ARTIFACT_SYNTHESIS:{right:0,wrong:0},GLOBE_PIN_DROP:{right:0,wrong:0}},a=we(),t={1:{right:0,wrong:0},2:{right:0,wrong:0},3:{right:0,wrong:0}},i={};for(const r of $t)i[r]={right:0,wrong:0,matchesPlayed:0,matchesWon:0,bestScore:0};return{schemaVersion:1,backfilledFromLegacy:!1,totalRight:0,totalWrong:0,totalResponseMs:0,totalPointsEarned:0,currentStreak:0,bestStreak:0,fastUnder3sStreak:0,bestFastUnder3sStreak:0,globalEloLatest:1200,globalEloPeak:1200,uniqueSolvedQids:[],uniqueSolvedCount:0,byDomain:s,byArchetype:e,byFormat:a,byPeelTier:t,byMode:i,speedBuckets:[{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0}],overclock:{safeLockWins:0,safeLockMisses:0,overclockWins:0,overclockMisses:0,max6xWins:0,backfires:0,consecutiveMax6xWins:0,bestConsecutiveMax6xWins:0,currentMatchMax6xWins:0,currentMatchPeelsUsed:0},feats:{passportStamped:!1,prologueCleared:!1,act1Cleared:!1,campaignCompleted:!1,rivalBluffsCaught:0,sorenCoinBluffDefeated:!1,bluffEchoCancels:0,uvScansCount:0,scannedRelicIds:[],openedLatchKeys:[],atelierFinishesEquipped:0,backstageInterrogations:0,factionPledged:!1,flawlessBossWins:0,unpeeledBossWins:0,perfectMatchesCount:0,max3x6xInSingleMatch:!1,calibratorBullseyes:0,codexFirstTryLocks:0,ghostTrialWins:0,blackSalonWins:0,dailyBroadcastsCompleted:0,completedDailyDates:[],maxEndlessDepth:0,achievedEndings:[],difficultyRoundsCleared:$e(),difficultyBestAccuracyPct:$e(),globeBullseyes300Km:0,globeNoPeel120Km:0,visualBlueprintsSolved:0,tier1ColdDomains:[],duelChallengesPlayed:0,duelGhostWins:0,srsReviewsCompleted:0,offlinePacksCached:0,clueLadderStep1Snipes:0,mindGambitsActivated:0,secondWindSaves:0,finaleCategoryWins:0,match4CleanSweeps:0,sort4PerfectRuns:0,imposterCatches:0,pinpointBullseyes:0,wedgesEarnedTotal:0,full6WedgeCrowns:0,padlocksShattered:0,powerPlayWins:0,powerPlayBigWagerWins:0,challengerTrapSurvivals:0,worldTourTiersCleared:0,worldSmartestChampionWon:!1},dailyBuckets:{},sessions:[],events:[]}}class Ks{state;listeners=new Set;constructor(e){this.state=this.load(),e&&this.syncAndBackfillFromProfile(e)}load(){const e=ie();try{if(typeof localStorage>"u")return e;const a=localStorage.getItem(Re);if(!a)return e;const t=JSON.parse(a);if(!t||typeof t!="object")return e;const i=Array.isArray(t.byDomain)&&t.byDomain.length===12?t.byDomain.map(l=>({right:Math.max(0,Math.floor(Number(l?.right)||0)),wrong:Math.max(0,Math.floor(Number(l?.wrong)||0)),totalResponseMs:Math.max(0,Math.floor(Number(l?.totalResponseMs)||0)),peakElo:P(Math.round(Number(l?.peakElo)||1200),600,2600),lastElo:P(Math.round(Number(l?.lastElo)||1200),600,2600)})):e.byDomain,r={...e.byArchetype};if(t.byArchetype&&typeof t.byArchetype=="object")for(const l of Je){const m=t.byArchetype[l];m&&(r[l]={right:Math.max(0,Math.floor(Number(m.right)||0)),wrong:Math.max(0,Math.floor(Number(m.wrong)||0))})}const n=we();if(t.byFormat&&typeof t.byFormat=="object")for(const l of He){const m=t.byFormat[l];m&&(n[l]={right:Math.max(0,Math.floor(Number(m.right)||0)),wrong:Math.max(0,Math.floor(Number(m.wrong)||0))})}const o={...e.byPeelTier};if(t.byPeelTier&&typeof t.byPeelTier=="object")for(const l of["1","2","3"]){const m=t.byPeelTier[l];m&&(o[l]={right:Math.max(0,Math.floor(Number(m.right)||0)),wrong:Math.max(0,Math.floor(Number(m.wrong)||0))})}const p={...e.byMode};if(t.byMode&&typeof t.byMode=="object")for(const l of $t){const m=t.byMode[l];m&&(p[l]={right:Math.max(0,Math.floor(Number(m.right)||0)),wrong:Math.max(0,Math.floor(Number(m.wrong)||0)),matchesPlayed:Math.max(0,Math.floor(Number(m.matchesPlayed)||0)),matchesWon:Math.max(0,Math.floor(Number(m.matchesWon)||0)),bestScore:Math.max(0,Math.floor(Number(m.bestScore)||0))})}const d=e.speedBuckets.map((l,m)=>{const c=Array.isArray(t.speedBuckets)?t.speedBuckets[m]:null;return{right:Math.max(0,Math.floor(Number(c?.right)||l.right)),wrong:Math.max(0,Math.floor(Number(c?.wrong)||l.wrong))}});return{schemaVersion:1,backfilledFromLegacy:!!t.backfilledFromLegacy,totalRight:Math.max(0,Math.floor(Number(t.totalRight)||0)),totalWrong:Math.max(0,Math.floor(Number(t.totalWrong)||0)),totalResponseMs:Math.max(0,Math.floor(Number(t.totalResponseMs)||0)),totalPointsEarned:Math.max(0,Math.floor(Number(t.totalPointsEarned)||0)),currentStreak:Math.max(0,Math.floor(Number(t.currentStreak)||0)),bestStreak:Math.max(0,Math.floor(Number(t.bestStreak)||0)),fastUnder3sStreak:Math.max(0,Math.floor(Number(t.fastUnder3sStreak)||0)),bestFastUnder3sStreak:Math.max(0,Math.floor(Number(t.bestFastUnder3sStreak)||0)),globalEloLatest:P(Math.round(Number(t.globalEloLatest)||1200),600,2600),globalEloPeak:P(Math.round(Number(t.globalEloPeak)||1200),600,2600),uniqueSolvedQids:Array.isArray(t.uniqueSolvedQids)?t.uniqueSolvedQids.slice(-mt):[],uniqueSolvedCount:Math.max(0,Math.floor(Number(t.uniqueSolvedCount)||0)),byDomain:i,byArchetype:r,byFormat:n,byPeelTier:o,byMode:p,speedBuckets:d,overclock:{...e.overclock,...t.overclock??{}},feats:{...e.feats,...t.feats??{},scannedRelicIds:Array.isArray(t.feats?.scannedRelicIds)?t.feats.scannedRelicIds:[],openedLatchKeys:Array.isArray(t.feats?.openedLatchKeys)?t.feats.openedLatchKeys:[],achievedEndings:Array.isArray(t.feats?.achievedEndings)?t.feats.achievedEndings:[],completedDailyDates:Array.isArray(t.feats?.completedDailyDates)?t.feats.completedDailyDates.filter(l=>typeof l=="string").slice(-365):[],difficultyRoundsCleared:{...$e(),...t.feats?.difficultyRoundsCleared??{}},difficultyBestAccuracyPct:{...$e(),...t.feats?.difficultyBestAccuracyPct??{}},globeBullseyes300Km:Math.max(0,Math.floor(Number(t.feats?.globeBullseyes300Km)||0)),globeNoPeel120Km:Math.max(0,Math.floor(Number(t.feats?.globeNoPeel120Km)||0)),visualBlueprintsSolved:Math.max(0,Math.floor(Number(t.feats?.visualBlueprintsSolved)||0)),tier1ColdDomains:Array.isArray(t.feats?.tier1ColdDomains)?t.feats.tier1ColdDomains.map(l=>Math.floor(Number(l))).filter(l=>Number.isFinite(l)&&l>=0&&l<=11):[],duelChallengesPlayed:Math.max(0,Math.floor(Number(t.feats?.duelChallengesPlayed)||0)),duelGhostWins:Math.max(0,Math.floor(Number(t.feats?.duelGhostWins)||0)),srsReviewsCompleted:Math.max(0,Math.floor(Number(t.feats?.srsReviewsCompleted)||0)),offlinePacksCached:Math.max(0,Math.floor(Number(t.feats?.offlinePacksCached)||0)),clueLadderStep1Snipes:Math.max(0,Math.floor(Number(t.feats?.clueLadderStep1Snipes)||0)),mindGambitsActivated:Math.max(0,Math.floor(Number(t.feats?.mindGambitsActivated)||0)),secondWindSaves:Math.max(0,Math.floor(Number(t.feats?.secondWindSaves)||0)),finaleCategoryWins:Math.max(0,Math.floor(Number(t.feats?.finaleCategoryWins)||0)),match4CleanSweeps:Math.max(0,Math.floor(Number(t.feats?.match4CleanSweeps)||0)),sort4PerfectRuns:Math.max(0,Math.floor(Number(t.feats?.sort4PerfectRuns)||0)),imposterCatches:Math.max(0,Math.floor(Number(t.feats?.imposterCatches)||0)),pinpointBullseyes:Math.max(0,Math.floor(Number(t.feats?.pinpointBullseyes)||0)),wedgesEarnedTotal:Math.max(0,Math.floor(Number(t.feats?.wedgesEarnedTotal)||0)),full6WedgeCrowns:Math.max(0,Math.floor(Number(t.feats?.full6WedgeCrowns)||0)),padlocksShattered:Math.max(0,Math.floor(Number(t.feats?.padlocksShattered)||0)),powerPlayWins:Math.max(0,Math.floor(Number(t.feats?.powerPlayWins)||0)),powerPlayBigWagerWins:Math.max(0,Math.floor(Number(t.feats?.powerPlayBigWagerWins)||0)),challengerTrapSurvivals:Math.max(0,Math.floor(Number(t.feats?.challengerTrapSurvivals)||0)),worldTourTiersCleared:Math.max(0,Math.floor(Number(t.feats?.worldTourTiersCleared)||0)),worldSmartestChampionWon:!!t.feats?.worldSmartestChampionWon},dailyBuckets:t.dailyBuckets&&typeof t.dailyBuckets=="object"?t.dailyBuckets:{},sessions:Array.isArray(t.sessions)?t.sessions.slice(-Ve):[],events:Array.isArray(t.events)?t.events.slice(-We).map(l=>Bt(l)):[]}}catch{return e}}save(){try{typeof localStorage<"u"&&localStorage.setItem(Re,JSON.stringify(this.state))}catch{}const e=this.getSnapshot();for(const a of this.listeners)a(e)}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}syncAndBackfillFromProfile(e){try{if(typeof localStorage<"u"){const n=localStorage.getItem(Re);if(n){const o=JSON.parse(n);o&&Array.isArray(o.events)&&o.events.length>this.state.events.length&&(this.state=this.load())}}}catch{}const a=e.getSnapshot(),t=J.getSkillSnapshot();let i=!1;(a.persona||a.hasCustomName)&&!this.state.feats.passportStamped&&a.persona&&(this.state.feats.passportStamped=!0,i=!0),a.visas.ch?.cleared&&!this.state.feats.prologueCleared&&(this.state.feats.prologueCleared=!0,i=!0),a.visas.gb?.cleared&&a.visas.jp?.cleared&&!this.state.feats.act1Cleared&&(this.state.feats.act1Cleared=!0,i=!0),a.visas.global?.cleared&&!this.state.feats.campaignCompleted&&(this.state.feats.campaignCompleted=!0,i=!0);for(const n of a.dailyHistory)n?.utcDate&&!this.state.feats.completedDailyDates.includes(n.utcDate)&&(this.state.feats.completedDailyDates.push(n.utcDate),i=!0);this.state.feats.completedDailyDates.length>365&&(this.state.feats.completedDailyDates=this.state.feats.completedDailyDates.slice(-365)),a.dailyHistory.length>this.state.feats.dailyBroadcastsCompleted&&(this.state.feats.dailyBroadcastsCompleted=a.dailyHistory.length,i=!0);for(let n=0;n<12;n++){const o=Math.max(a.domainElo[n]??1200,t.domainElo[n]??1200);o!==this.state.byDomain[n].lastElo&&(this.state.byDomain[n].lastElo=o,this.state.byDomain[n].peakElo=Math.max(this.state.byDomain[n].peakElo,o),i=!0)}t.globalElo>0&&t.totalAnswered>0&&(this.state.globalEloLatest=t.globalElo,this.state.globalEloPeak=Math.max(this.state.globalEloPeak,t.globalElo));const r=this.state.totalRight+this.state.totalWrong;if(!this.state.backfilledFromLegacy&&r===0&&t.totalAnswered>0){this.state.backfilledFromLegacy=!0,this.state.totalRight=Math.max(0,t.totalCorrect),this.state.totalWrong=Math.max(0,t.totalAnswered-t.totalCorrect),this.state.bestStreak=Math.max(this.state.bestStreak,t.bestStreak),this.state.currentStreak=t.currentStreak,this.state.uniqueSolvedCount=Math.max(this.state.uniqueSolvedCount,t.totalCorrect);for(let o=0;o<12;o++){const p=t.domainAttempts[o]??0,d=t.domainCorrect[o]??0;this.state.byDomain[o].right=d,this.state.byDomain[o].wrong=Math.max(0,p-d)}const n=ne(Date.now());this.state.dailyBuckets[n]={dateKey:n,right:this.state.totalRight,wrong:this.state.totalWrong,totalResponseMs:t.totalAnswered*5800,maxStreak:t.bestStreak,pointsEarned:this.state.totalRight*2400,max6xWins:0,backfires:0,eloEnd:t.globalElo},i=!0}i&&this.save()}getSnapshot(){return{...this.state,byDomain:this.state.byDomain.map(e=>({...e})),byArchetype:{SIGHTLINE_LOCK:{...this.state.byArchetype.SIGHTLINE_LOCK},CODEX_DUAL_RING:{...this.state.byArchetype.CODEX_DUAL_RING},CALIBRATOR_DIAL:{...this.state.byArchetype.CALIBRATOR_DIAL},GAUNTLET_SHATTER:{...this.state.byArchetype.GAUNTLET_SHATTER},HERO_ARTIFACT_SYNTHESIS:{...this.state.byArchetype.HERO_ARTIFACT_SYNTHESIS},GLOBE_PIN_DROP:{...this.state.byArchetype.GLOBE_PIN_DROP}},byFormat:{MULTIPLE_CHOICE:{...this.state.byFormat.MULTIPLE_CHOICE},MATCH_4:{...this.state.byFormat.MATCH_4},SORT_4:{...this.state.byFormat.SORT_4},MULTI_STRIKE:{...this.state.byFormat.MULTI_STRIKE},PINPOINT_DIAL:{...this.state.byFormat.PINPOINT_DIAL},CLUE_ESCALATOR:{...this.state.byFormat.CLUE_ESCALATOR},VISUAL_SPOTTER:{...this.state.byFormat.VISUAL_SPOTTER}},byPeelTier:{1:{...this.state.byPeelTier[1]},2:{...this.state.byPeelTier[2]},3:{...this.state.byPeelTier[3]}},byMode:{CAMPAIGN:{...this.state.byMode.CAMPAIGN},DAILY:{...this.state.byMode.DAILY},BRIEFING:{...this.state.byMode.BRIEFING},ENDLESS:{...this.state.byMode.ENDLESS},TRIALS:{...this.state.byMode.TRIALS},PROLOGUE:{...this.state.byMode.PROLOGUE}},speedBuckets:this.state.speedBuckets.map(e=>({...e})),overclock:{...this.state.overclock},feats:{...this.state.feats,scannedRelicIds:[...this.state.feats.scannedRelicIds],openedLatchKeys:[...this.state.feats.openedLatchKeys],achievedEndings:[...this.state.feats.achievedEndings],completedDailyDates:[...this.state.feats.completedDailyDates],difficultyRoundsCleared:{...this.state.feats.difficultyRoundsCleared},difficultyBestAccuracyPct:{...this.state.feats.difficultyBestAccuracyPct},tier1ColdDomains:[...this.state.feats.tier1ColdDomains]},dailyBuckets:{...this.state.dailyBuckets},sessions:[...this.state.sessions],events:[...this.state.events]}}recordQuestionOutcome(e){const a=e.ts??Date.now(),t=ne(a),i=P(Math.floor(Number(e.domainId)||0),0,11),r=je(e.mode),n=Pt(e.archetype),o=Fe(e.questionFormat),p=o??Oe({questionFormat:o??void 0,archetype:n,clueLadderStep:e.clueLadderStep}),d=e.peelTier===2?2:e.peelTier===3?3:1,l=P(Number(e.overclockCharge01)||0,0,1),m=l>=.08,c=l>=.88&&d===1,u=!!e.backfired||!e.correct&&m,y=P(Math.round(Number(e.responseTimeMs)||5200),150,6e4),x=typeof e.speedBucketIdx=="number"&&Number.isInteger(e.speedBucketIdx)&&e.speedBucketIdx>=0&&e.speedBucketIdx<=4?e.speedBucketIdx:ve(y),g=Math.max(0,Math.round(Number(e.pointsDelta)||0)),v=J.getSkillSnapshot(),k=P(Math.round(Number(e.eloAfter)||v.globalElo||this.state.globalEloLatest),600,2600),f=Qe(e.difficultyTier)??Nt(k),b=e.promptSnippet?.trim().slice(0,96),w=Ze(e.subcatLabel)??et(i,n,b),I=H(i),T=b||(e.answerLabel?`${w}: ${e.answerLabel.slice(0,44)}`:`${I.shortName} · ${w}`),S={ts:a,dateKey:t,qid:Math.max(0,Math.floor(Number(e.qid)||0)),domainId:i,mode:r,hubId:e.hubId??"ch",archetype:n,questionFormat:o??void 0,correct:!!e.correct,peelTier:d,overclockCharge01:Number(l.toFixed(2)),backfired:u,bluffCalled:!!e.bluffCalled,bullseye:!!(e.bullseye||e.isBullseyeOrSweep),responseTimeMs:y,pointsDelta:g,eloAfter:k,promptSnippet:T,answerLabel:e.answerLabel?.slice(0,48),subcatLabel:w,difficultyTier:f,speedBucketIdx:x,clueLadderStep:e.clueLadderStep===1||e.clueLadderStep===2||e.clueLadderStep===3?e.clueLadderStep:void 0,mindGambitId:e.mindGambitId?.trim()||void 0};this.state.events.push(S),this.state.events.length>We&&this.state.events.splice(0,this.state.events.length-We),this.state.totalResponseMs+=y,this.state.totalPointsEarned+=g,this.state.globalEloLatest=k,this.state.globalEloPeak=Math.max(this.state.globalEloPeak,k),d>1&&(this.state.overclock.currentMatchPeelsUsed+=1),e.bluffEchoCancelled&&(this.state.feats.bluffEchoCancels+=1),e.bluffCalled&&(this.state.feats.rivalBluffsCaught+=1),S.correct&&e.clueLadderStep===1&&(this.state.feats.clueLadderStep1Snipes+=1),e.mindGambitTriggered&&(this.state.feats.mindGambitsActivated+=1),S.correct&&e.finaleCategoryPicked&&(this.state.feats.finaleCategoryWins+=1),typeof e.padlocksBroken=="number"&&e.padlocksBroken>0&&(this.state.feats.padlocksShattered+=Math.floor(e.padlocksBroken)),S.correct&&e.survivedChallengerTrap&&(this.state.feats.challengerTrapSurvivals+=1),S.correct&&typeof e.powerPlayWager=="number"&&e.powerPlayWager>0&&(this.state.feats.powerPlayWins+=1,e.powerPlayWager>=400&&(this.state.feats.powerPlayBigWagerWins+=1));const _=this.state.byDomain[i];_.totalResponseMs+=y;const L=v.domainElo[i]??_.lastElo;_.lastElo=L,_.peakElo=Math.max(_.peakElo,L);const O=String(d);if(S.correct){if(this.state.totalRight+=1,this.state.currentStreak+=1,this.state.bestStreak=Math.max(this.state.bestStreak,this.state.currentStreak),y<3e3?(this.state.fastUnder3sStreak+=1,this.state.bestFastUnder3sStreak=Math.max(this.state.bestFastUnder3sStreak,this.state.fastUnder3sStreak)):this.state.fastUnder3sStreak=0,S.qid>0&&!this.state.uniqueSolvedQids.includes(S.qid)&&(this.state.uniqueSolvedQids.push(S.qid),this.state.uniqueSolvedQids.length>mt&&this.state.uniqueSolvedQids.shift(),this.state.uniqueSolvedCount+=1),_.right+=1,this.state.byArchetype[n].right+=1,this.state.byFormat[p].right+=1,this.state.byPeelTier[O].right+=1,this.state.byMode[r].right+=1,this.state.speedBuckets[x].right+=1,p==="MATCH_4"&&(S.bullseye||e.isBullseyeOrSweep)&&(this.state.feats.match4CleanSweeps+=1),p==="SORT_4"&&(S.bullseye||e.isBullseyeOrSweep)&&(this.state.feats.sort4PerfectRuns+=1),p==="MULTI_STRIKE"&&(this.state.feats.imposterCatches+=1),p==="PINPOINT_DIAL"&&(S.bullseye||e.isBullseyeOrSweep)&&(this.state.feats.pinpointBullseyes+=1),S.bullseye&&n==="CALIBRATOR_DIAL"&&(this.state.feats.calibratorBullseyes+=1),n==="GLOBE_PIN_DROP"){const Y=typeof e.globeDistanceKm=="number"&&Number.isFinite(e.globeDistanceKm)?Math.max(0,e.globeDistanceKm):null;(S.bullseye||Y!==null&&Y<=300)&&(this.state.feats.globeBullseyes300Km+=1),d===1&&Y!==null&&Y<=120&&(this.state.feats.globeNoPeel120Km+=1)}e.hasVisualPlate&&(this.state.feats.visualBlueprintsSolved+=1),d===1&&!this.state.feats.tier1ColdDomains.includes(i)&&this.state.feats.tier1ColdDomains.push(i),n==="CODEX_DUAL_RING"&&(e.firstTryCodex??d===1)&&(this.state.feats.codexFirstTryLocks+=1),m?(this.state.overclock.overclockWins+=1,c&&(this.state.overclock.max6xWins+=1,this.state.overclock.consecutiveMax6xWins+=1,this.state.overclock.bestConsecutiveMax6xWins=Math.max(this.state.overclock.bestConsecutiveMax6xWins,this.state.overclock.consecutiveMax6xWins),this.state.overclock.currentMatchMax6xWins+=1,this.state.overclock.currentMatchMax6xWins>=3&&(this.state.feats.max3x6xInSingleMatch=!0))):this.state.overclock.safeLockWins+=1}else this.state.totalWrong+=1,this.state.currentStreak=0,this.state.fastUnder3sStreak=0,_.wrong+=1,this.state.byArchetype[n].wrong+=1,this.state.byFormat[p].wrong+=1,this.state.byPeelTier[O].wrong+=1,this.state.byMode[r].wrong+=1,this.state.speedBuckets[x].wrong+=1,m?(this.state.overclock.overclockMisses+=1,this.state.overclock.consecutiveMax6xWins=0):this.state.overclock.safeLockMisses+=1,u&&(this.state.overclock.backfires+=1,this.state.overclock.consecutiveMax6xWins=0);const D=this.state.dailyBuckets[t]??{dateKey:t,right:0,wrong:0,totalResponseMs:0,maxStreak:0,pointsEarned:0,max6xWins:0,backfires:0,eloEnd:k};S.correct?D.right+=1:D.wrong+=1,D.totalResponseMs+=y,D.maxStreak=Math.max(D.maxStreak,this.state.currentStreak),D.pointsEarned+=g,S.correct&&c&&(D.max6xWins+=1),u&&(D.backfires+=1),D.eloEnd=k,this.state.dailyBuckets[t]=D;const Z=Object.keys(this.state.dailyBuckets).sort();return Z.length>365&&delete this.state.dailyBuckets[Z[0]],this.save(),this.getSnapshot()}recordMatchCompleted(e){const a=Date.now(),t=ne(a),i=!!e.isBlackSalon||(e.mode??"").toUpperCase()==="BLACK_SALON",r=je(e.mode,i),n=J.getSkillSnapshot(),o=P(Math.round(Number(e.eloAfter)||n.globalElo||this.state.globalEloLatest),600,2600),p=Math.max(0,Math.floor(Number(e.correctCount)||0)),d=Math.max(p,Math.floor(Number(e.totalQuestions)||p)),l=Math.max(0,d-p),m=e.peelsUsed!==void 0?e.peelsUsed:this.state.overclock.currentMatchPeelsUsed,c=e.max6xOverclockWinsInMatch!==void 0?e.max6xOverclockWinsInMatch:this.state.overclock.currentMatchMax6xWins,u=Math.max(0,Math.floor(Number(e.shieldsLost)||0)),y=this.state.byMode[r];if(y.matchesPlayed+=1,e.won&&(y.matchesWon+=1),y.bestScore=Math.max(y.bestScore,Math.round(e.score||0)),d>=5&&p===d&&(this.state.feats.perfectMatchesCount+=1),c>=3&&(this.state.feats.max3x6xInSingleMatch=!0),r==="PROLOGUE"&&e.won&&(this.state.feats.prologueCleared=!0),r==="DAILY"&&!e.isReplay){const g=e.utcDate&&e.utcDate.trim()||t;this.state.feats.completedDailyDates.includes(g)||(this.state.feats.completedDailyDates.push(g),this.state.feats.completedDailyDates.length>365&&this.state.feats.completedDailyDates.shift(),this.state.feats.dailyBroadcastsCompleted=Math.max(this.state.feats.dailyBroadcastsCompleted+1,this.state.feats.completedDailyDates.length))}r==="ENDLESS"&&e.endlessDepthReached&&(this.state.feats.maxEndlessDepth=Math.max(this.state.feats.maxEndlessDepth,Math.floor(e.endlessDepthReached))),r==="TRIALS"&&e.won&&(this.state.feats.ghostTrialWins+=1,i&&(this.state.feats.blackSalonWins+=1)),e.won&&e.isBossShowdown&&(u===0&&(this.state.feats.flawlessBossWins+=1),m===0&&(this.state.feats.unpeeledBossWins+=1)),e.won&&e.defeatedRivalId==="soren"&&e.sorenCoinTellCaughtInMatch&&(this.state.feats.sorenCoinBluffDefeated=!0),e.endingUnlocked&&!this.state.feats.achievedEndings.includes(e.endingUnlocked)&&(this.state.feats.achievedEndings.push(e.endingUnlocked),this.state.feats.campaignCompleted=!0);const x=Qe(e.difficultyPreset??e.difficultyTier);if(x&&d>0){const g=Math.round(p/d*100);this.state.feats.difficultyBestAccuracyPct[x]=Math.max(this.state.feats.difficultyBestAccuracyPct[x]??0,g),(x==="MIDDLE_SCHOOL"||e.won||g>=50)&&(this.state.feats.difficultyRoundsCleared[x]=(this.state.feats.difficultyRoundsCleared[x]??0)+1)}return e.mindGambitUsed&&(this.state.feats.mindGambitsActivated+=1),e.secondWindTriggered&&(this.state.feats.secondWindSaves+=1),e.finaleCategoryWon&&(this.state.feats.finaleCategoryWins+=1),typeof e.earnedWedgesCount=="number"&&e.earnedWedgesCount>0&&(this.state.feats.wedgesEarnedTotal+=Math.floor(e.earnedWedgesCount),e.earnedWedgesCount>=6&&(this.state.feats.full6WedgeCrowns+=1)),e.completedSixWedgeCrown&&!(e.earnedWedgesCount&&e.earnedWedgesCount>=6)&&(this.state.feats.full6WedgeCrowns+=1),typeof e.worldTourTierCleared=="number"&&e.worldTourTierCleared>0&&(this.state.feats.worldTourTiersCleared=Math.max(this.state.feats.worldTourTiersCleared,Math.min(8,Math.floor(e.worldTourTierCleared))),e.worldTourTierCleared>=8&&(this.state.feats.worldSmartestChampionWon=!0,this.state.feats.campaignCompleted=!0)),e.wonWorldSmartestFinale&&(this.state.feats.worldSmartestChampionWon=!0,this.state.feats.worldTourTiersCleared=8,this.state.feats.campaignCompleted=!0),this.state.sessions.push({ts:a,dateKey:t,mode:r,hubId:e.hubId,won:!!e.won,right:p,wrong:l,score:Math.max(0,Math.round(e.score||0)),eloAfter:o,maxOverclockWinsInMatch:c,peelsUsedInMatch:m,shieldsLostInMatch:u,isBossShowdown:!!e.isBossShowdown,isBlackSalon:i}),this.state.sessions.length>Ve&&this.state.sessions.splice(0,this.state.sessions.length-Ve),this.state.overclock.currentMatchMax6xWins=0,this.state.overclock.currentMatchPeelsUsed=0,this.save(),this.getSnapshot()}recordSpecialFeat(e,a){switch(e){case"PASSPORT_STAMPED":this.state.feats.passportStamped=!0;break;case"PROLOGUE_CLEARED":this.state.feats.prologueCleared=!0;break;case"RIVAL_BLUFF_CAUGHT":this.state.feats.rivalBluffsCaught+=1;break;case"SOREN_COIN_BLUFF_DEFEATED":this.state.feats.sorenCoinBluffDefeated=!0;break;case"BLUFF_ECHO_CANCEL":this.state.feats.bluffEchoCancels+=1;break;case"UV_RELIC_SCANNED":this.state.feats.uvScansCount+=1,a?.relicId&&!this.state.feats.scannedRelicIds.includes(a.relicId)&&this.state.feats.scannedRelicIds.push(a.relicId);break;case"RELIC_LATCH_OPENED":{const t=a?.relicId??"meridian_astrolabe",i=a?.latchCount??3;for(let r=0;r<i;r++){const n=`${t}:${r}`;this.state.feats.openedLatchKeys.includes(n)||this.state.feats.openedLatchKeys.push(n)}break}case"ATELIER_SKIN_EQUIPPED":this.state.feats.atelierFinishesEquipped+=1;break;case"BACKSTAGE_INTERROGATION":this.state.feats.backstageInterrogations+=1;break;case"FACTION_PLEDGED":this.state.feats.factionPledged=!0;break;case"ACT1_CLEARED":this.state.feats.act1Cleared=!0;break;case"CAMPAIGN_COMPLETED":this.state.feats.campaignCompleted=!0;break;case"ENDING_UNLOCKED":this.state.feats.campaignCompleted=!0,a?.endingId&&!this.state.feats.achievedEndings.includes(a.endingId)&&this.state.feats.achievedEndings.push(a.endingId);break;case"BLACK_SALON_VICTORY":this.state.feats.blackSalonWins+=1,this.state.feats.ghostTrialWins+=1;break;case"DUEL_CHALLENGE_PLAYED":this.state.feats.duelChallengesPlayed+=1;break;case"DUEL_GHOST_BEATEN":this.state.feats.duelChallengesPlayed+=1,this.state.feats.duelGhostWins+=1;break;case"SRS_REVIEW_COMPLETED":this.state.feats.srsReviewsCompleted+=1;break;case"OFFLINE_PACK_CACHED":this.state.feats.offlinePacksCached+=1;break;case"CLUE_LADDER_STEP1_SNIPE":this.state.feats.clueLadderStep1Snipes+=1;break;case"MIND_GAMBIT_USED":this.state.feats.mindGambitsActivated+=1;break;case"SECOND_WIND_SAVED":this.state.feats.secondWindSaves+=1,this.state.feats.mindGambitsActivated+=1;break;case"FINALE_CATEGORY_WIN":this.state.feats.finaleCategoryWins+=1;break;case"MATCH4_CLEAN_SWEEP":this.state.feats.match4CleanSweeps+=1;break;case"SORT4_PERFECT":this.state.feats.sort4PerfectRuns+=1;break;case"IMPOSTER_CAUGHT":this.state.feats.imposterCatches+=1;break;case"PINPOINT_BULLSEYE":this.state.feats.pinpointBullseyes+=1;break;case"WEDGE_EARNED":this.state.feats.wedgesEarnedTotal+=1;break;case"SIX_WEDGE_CROWN":this.state.feats.full6WedgeCrowns+=1,this.state.feats.wedgesEarnedTotal=Math.max(this.state.feats.wedgesEarnedTotal,6);break;case"PADLOCK_SHATTERED":this.state.feats.padlocksShattered+=1;break;case"POWER_PLAY_WIN":this.state.feats.powerPlayWins+=1;break;case"POWER_PLAY_HIGH_ROLLER":this.state.feats.powerPlayWins+=1,this.state.feats.powerPlayBigWagerWins+=1;break;case"CHALLENGER_TRAP_SURVIVED":this.state.feats.challengerTrapSurvivals+=1;break;case"WORLD_TOUR_TIER_CLEARED":a?.depth?this.state.feats.worldTourTiersCleared=Math.max(this.state.feats.worldTourTiersCleared,Math.min(8,Math.floor(a.depth))):this.state.feats.worldTourTiersCleared=Math.min(8,this.state.feats.worldTourTiersCleared+1);break;case"WORLD_SMARTEST_CHAMPION":this.state.feats.worldSmartestChampionWon=!0,this.state.feats.worldTourTiersCleared=8,this.state.feats.campaignCompleted=!0;break}return a?.depth&&e!=="WORLD_TOUR_TIER_CLEARED"&&(this.state.feats.maxEndlessDepth=Math.max(this.state.feats.maxEndlessDepth,Math.floor(a.depth))),this.save(),this.getSnapshot()}reloadFromStorage(){return this.state=this.load(),this.getSnapshot()}getPlayerStatProfileForHost(){return Ft(this.getSnapshot())}}function bt(){return{SIGHTLINE_LOCK:{right:0,wrong:0},CODEX_DUAL_RING:{right:0,wrong:0},CALIBRATOR_DIAL:{right:0,wrong:0},GAUNTLET_SHATTER:{right:0,wrong:0},HERO_ARTIFACT_SYNTHESIS:{right:0,wrong:0},GLOBE_PIN_DROP:{right:0,wrong:0}}}function yt(){return{1:{right:0,wrong:0},2:{right:0,wrong:0},3:{right:0,wrong:0}}}function vt(){return[{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0}]}function zs(s){return Array.from({length:12},(e,a)=>({right:0,wrong:0,totalResponseMs:0,peakElo:s.byDomain[a]?.peakElo??1200,lastElo:s.byDomain[a]?.lastElo??1200}))}function Ws(s,e,a){let t=0,i=0,r=0,n=0,o=0,p=0,d=s.length>0?0:a,l=e,m=0,c=0,u=0,y=0,x=0,g=0,v=0,k=0,f=0;for(const _ of s){r+=_.responseTimeMs,n+=_.pointsDelta,l=_.eloAfter,d=Math.max(d,_.eloAfter);const L=De(_),O=_.overclockCharge01>=.88&&_.peelTier===1;L&&(m+=1),_.correct?(t+=1,o+=1,p=Math.max(p,o),L?(c+=1,O&&(g+=1,k+=1,f=Math.max(f,k))):y+=1):(i+=1,o=0,L?(u+=1,k=0):x+=1,_.backfired&&(v+=1,k=0))}const b=t+i,w=b>0?Number((t/b*100).toFixed(1)):null,I=b>0?Math.round(r/b):0,T=c+u,S=T>0?Math.round(c/T*100):null;return{totalRight:t,totalWrong:i,totalAnswered:b,accuracyPct:w,avgResponseMs:I,totalPointsEarned:n,currentStreak:o,bestStreak:p,eloLatest:l,eloPeak:s.length>0?d:a,doubleDownCount:m,doubleDownWins:c,doubleDownMisses:u,doubleDownWinPct:S,safeLockWins:y,safeLockMisses:x,max6xWins:g,backfires:v,bestConsecutiveMax6xWins:f}}function Vs(s,e,a){if(s.length===0)return[];if(e==="LAST_25"){let p=0,d=0;return s.map(({ev:l,eventKey:m},c)=>{d+=1,l.correct&&(p+=1);const u=H(l.domainId);return{bucketKey:m,label:`Q${c+1}`,sublabel:`${u.shortName} · ${(l.responseTimeMs/1e3).toFixed(1)}s · ${l.correct?`+${l.pointsDelta.toLocaleString("en-US")} PTS`:"MISS"}`,right:l.correct?1:0,wrong:l.correct?0:1,rollingAccPct:Math.round(p/d*100),isSelected:a===m}})}const t=new Map;for(const{ev:p}of s){const d=p.dateKey,l=t.get(d)??{right:0,wrong:0,points:0};p.correct?l.right+=1:l.wrong+=1,l.points+=p.pointsDelta,t.set(d,l)}const i=e==="DAYS_7"?7:e==="DAYS_30"?30:365,r=Array.from(t.keys()).sort().slice(-i);let n=0,o=0;return r.map(p=>{const d=t.get(p);n+=d.right,o+=d.right+d.wrong;const l=d.right+d.wrong,m=l>0?Math.round(d.right/l*100):0;return{bucketKey:p,label:p.slice(5),sublabel:`${p}: ${d.right} Right · ${d.wrong} Wrong (${m}%) · +${d.points.toLocaleString("en-US")} PTS`,right:d.right,wrong:d.wrong,rollingAccPct:o>0?Math.round(n/o*100):m,isSelected:a===p}})}function Ys(s){if(s.length===0)return[];if(s.length===1){const r=s[0];return[{label:"Base",elo:1200},{label:"Q1",elo:r.eloAfter,ts:r.ts,correct:r.correct}]}const a=Math.max(1,Math.floor(s.length/28)),t=[];for(let r=0;r<s.length;r+=a){const n=s[r];t.push({label:`Q${r+1}`,elo:n.eloAfter,ts:n.ts,correct:n.correct})}const i=s[s.length-1];return(t[t.length-1]?.ts!==i.ts||t[t.length-1]?.elo!==i.eloAfter)&&t.push({label:"Now",elo:i.eloAfter,ts:i.ts,correct:i.correct}),t}function Ht(s){const e=we();let a=!1;if(s?.byFormat&&typeof s.byFormat=="object")for(const t of He){const i=s.byFormat[t];i&&(i.right>0||i.wrong>0)&&(e[t]={right:Math.max(0,i.right),wrong:Math.max(0,i.wrong)},a=!0)}if(!a&&s?.byArchetype){const t=(i,r)=>{r&&(e[i].right+=Math.max(0,r.right||0),e[i].wrong+=Math.max(0,r.wrong||0))};t("MULTIPLE_CHOICE",s.byArchetype.SIGHTLINE_LOCK),t("MATCH_4",s.byArchetype.CODEX_DUAL_RING),t("PINPOINT_DIAL",s.byArchetype.CALIBRATOR_DIAL),t("MULTI_STRIKE",s.byArchetype.GAUNTLET_SHATTER),t("CLUE_ESCALATOR",s.byArchetype.HERO_ARTIFACT_SYNTHESIS),t("VISUAL_SPOTTER",s.byArchetype.GLOBE_PIN_DROP)}return e}function js(s,e={},a=Date.now()){const t={range:e.range??"ALL_TIME",domainId:e.domainId!==void 0&&e.domainId!==null&&Number.isFinite(Number(e.domainId))?P(Math.floor(Number(e.domainId)),0,11):null,subcatLabel:Ze(e.subcatLabel??void 0),archetype:e.archetype&&Je.includes(e.archetype)?e.archetype:null,questionFormat:Fe(e.questionFormat),peelTier:e.peelTier===1||e.peelTier===2||e.peelTier===3?e.peelTier:null,outcome:e.outcome==="RIGHT"||e.outcome==="WRONG"||e.outcome==="DOUBLE_DOWN"?e.outcome:"ALL",speedBucket:e.speedBucket!==void 0&&e.speedBucket!==null&&Number.isInteger(e.speedBucket)&&e.speedBucket>=0&&e.speedBucket<=4?e.speedBucket:null,bucketKey:typeof e.bucketKey=="string"&&e.bucketKey.trim().length>0?e.bucketKey.trim():null};t.domainId===null&&(t.subcatLabel=null);const i=(t.domainId!==null?1:0)+(t.subcatLabel!==null?1:0)+(t.archetype!==null?1:0)+(t.questionFormat!==null&&t.questionFormat!==void 0?1:0)+(t.peelTier!==null?1:0)+(t.outcome!=="ALL"?1:0)+(t.speedBucket!==null?1:0)+(t.bucketKey!==null?1:0),r=i>0,n=(s.events??[]).map((E,A)=>{const R=Bt(E);return{ev:R,eventKey:`ev:${R.ts}:${R.qid}:${A}`}});if(n.length===0&&s.totalRight+s.totalWrong>0){const E=s.totalRight+s.totalWrong;if(!r){const A=[],R=t.range==="DAYS_7"?7:t.range==="DAYS_30"?30:365,$=Object.keys(s.dailyBuckets).sort().slice(-R);if($.length>0&&t.range!=="LAST_25"){let K=0,Ge=0;for(const Ee of $){const z=s.dailyBuckets[Ee];K+=z.right,Ge+=z.right+z.wrong;const at=z.right+z.wrong,it=at>0?Math.round(z.right/at*100):0;A.push({bucketKey:Ee,label:Ee.slice(5),sublabel:`${Ee}: ${z.right} Right · ${z.wrong} Wrong (${it}%)`,right:z.right,wrong:z.wrong,rollingAccPct:Ge>0?Math.round(K/Ge*100):it,isSelected:!1})}}else A.push({bucketKey:"legacy_career",label:"Career",sublabel:`${s.totalRight}R / ${s.totalWrong}W`,right:s.totalRight,wrong:s.totalWrong,rollingAccPct:Math.round(s.totalRight/E*100),isSelected:!1});const j=[{label:"Start",elo:1200}];if(s.sessions.length>0)for(const K of s.sessions.slice(-24))j.push({label:K.mode.slice(0,4),elo:K.eloAfter,ts:K.ts});else j.push({label:"Now",elo:s.globalEloLatest});const Q=s.overclock.overclockWins+s.overclock.overclockMisses;return{filter:t,hasActiveDimensionFilter:!1,activeFilterCount:0,rangeTotalCount:E,filteredEvents:[],kpis:{totalRight:s.totalRight,totalWrong:s.totalWrong,totalAnswered:E,accuracyPct:Number((s.totalRight/E*100).toFixed(1)),avgResponseMs:Math.round(s.totalResponseMs/E),totalPointsEarned:s.totalPointsEarned,currentStreak:s.currentStreak,bestStreak:s.bestStreak,eloLatest:s.globalEloLatest,eloPeak:s.globalEloPeak,doubleDownCount:Q,doubleDownWins:s.overclock.overclockWins,doubleDownMisses:s.overclock.overclockMisses,doubleDownWinPct:Q>0?Math.round(s.overclock.overclockWins/Q*100):null,safeLockWins:s.overclock.safeLockWins,safeLockMisses:s.overclock.safeLockMisses,max6xWins:s.overclock.max6xWins,backfires:s.overclock.backfires,bestConsecutiveMax6xWins:s.overclock.bestConsecutiveMax6xWins},barSeries:A,byDomain:s.byDomain.map(K=>({...K})),subcategories:[],eloSeries:j,byArchetype:{SIGHTLINE_LOCK:{...s.byArchetype.SIGHTLINE_LOCK},CODEX_DUAL_RING:{...s.byArchetype.CODEX_DUAL_RING},CALIBRATOR_DIAL:{...s.byArchetype.CALIBRATOR_DIAL},GAUNTLET_SHATTER:{...s.byArchetype.GAUNTLET_SHATTER},HERO_ARTIFACT_SYNTHESIS:{...s.byArchetype.HERO_ARTIFACT_SYNTHESIS},GLOBE_PIN_DROP:{...s.byArchetype.GLOBE_PIN_DROP}},byFormat:Ht(s),byPeelTier:{1:{...s.byPeelTier[1]},2:{...s.byPeelTier[2]},3:{...s.byPeelTier[3]}},speedBuckets:s.speedBuckets.map(K=>({...K})),outcomeCounts:{all:E,right:s.totalRight,wrong:s.totalWrong,doubleDown:Q},ledgerEvents:[],usingLegacyAggregateFallback:!0}}if(t.domainId!==null&&t.subcatLabel===null&&t.archetype===null&&!t.questionFormat&&t.peelTier===null&&t.outcome==="ALL"&&t.speedBucket===null&&t.bucketKey===null){const A=s.byDomain[t.domainId],R=A.right+A.wrong,$=H(t.domainId);return{filter:t,hasActiveDimensionFilter:!0,activeFilterCount:1,rangeTotalCount:E,filteredEvents:[],kpis:{totalRight:A.right,totalWrong:A.wrong,totalAnswered:R,accuracyPct:R>0?Number((A.right/R*100).toFixed(1)):null,avgResponseMs:R>0?Math.round(A.totalResponseMs/R):0,totalPointsEarned:0,currentStreak:0,bestStreak:0,eloLatest:A.lastElo,eloPeak:A.peakElo,doubleDownCount:0,doubleDownWins:0,doubleDownMisses:0,doubleDownWinPct:null,safeLockWins:0,safeLockMisses:0,max6xWins:0,backfires:0,bestConsecutiveMax6xWins:0},barSeries:R>0?[{bucketKey:`dom_${t.domainId}`,label:$.shortName,sublabel:`${$.name}: ${A.right}R · ${A.wrong}W`,right:A.right,wrong:A.wrong,rollingAccPct:Math.round(A.right/R*100),isSelected:!1}]:[],byDomain:s.byDomain.map(j=>({...j})),subcategories:[],eloSeries:[{label:"Base",elo:1200},{label:$.shortName,elo:A.lastElo}],byArchetype:bt(),byFormat:we(),byPeelTier:yt(),speedBuckets:vt(),outcomeCounts:{all:R,right:A.right,wrong:A.wrong,doubleDown:0},ledgerEvents:[],usingLegacyAggregateFallback:!0}}}let o;if(t.range==="LAST_25")o=n.slice(-25);else if(t.range==="DAYS_7"){const E=ne(a-5184e5);o=n.filter(A=>A.ev.dateKey>=E)}else if(t.range==="DAYS_30"){const E=ne(a-25056e5);o=n.filter(A=>A.ev.dateKey>=E)}else o=n;const p=t.subcatLabel?t.subcatLabel.toLowerCase():null,d=(E,A)=>{const{ev:R,eventKey:$}=E;if(A!=="domain"&&t.domainId!==null&&R.domainId!==t.domainId||A!=="domain"&&A!=="subcat"&&p!==null&&(R.subcatLabel??"").toLowerCase()!==p||A!=="archetype"&&t.archetype!==null&&R.archetype!==t.archetype||A!=="questionFormat"&&t.questionFormat&&Oe(R)!==t.questionFormat||A!=="peelTier"&&t.peelTier!==null&&R.peelTier!==t.peelTier||A!=="outcome"&&t.outcome!=="ALL"&&(t.outcome==="RIGHT"&&!R.correct||t.outcome==="WRONG"&&R.correct||t.outcome==="DOUBLE_DOWN"&&!De(R))||A!=="speedBucket"&&t.speedBucket!==null&&(R.speedBucketIdx??ve(R.responseTimeMs))!==t.speedBucket)return!1;if(A!=="bucketKey"&&t.bucketKey!==null){if(t.range==="LAST_25"){if($!==t.bucketKey)return!1}else if(R.dateKey!==t.bucketKey)return!1}return!0},l=o.filter(E=>d(E)),m=l.map(E=>E.ev),c=t.domainId!==null?s.byDomain[t.domainId]?.lastElo??s.globalEloLatest:s.globalEloLatest,u=t.domainId!==null?s.byDomain[t.domainId]?.peakElo??s.globalEloPeak:s.globalEloPeak,y=Ws(m,c,u),x=t.bucketKey===null?l:o.filter(E=>d(E,"bucketKey")),g=Vs(x,t.range,t.bucketKey),v=zs(s),k=t.domainId===null?l:o.filter(E=>d(E,"domain"));for(const{ev:E}of k){const A=v[E.domainId];E.correct?A.right+=1:A.wrong+=1,A.totalResponseMs+=E.responseTimeMs}const f=[];if(t.domainId!==null){const E=t.subcatLabel===null?l:o.filter(R=>d(R,"subcat")),A=new Map;for(const{ev:R}of E){const $=R.subcatLabel??et(R.domainId,R.archetype,R.promptSnippet),j=$.toLowerCase(),Q=A.get(j)??{label:$,right:0,wrong:0,totalMs:0};R.correct?Q.right+=1:Q.wrong+=1,Q.totalMs+=R.responseTimeMs,A.set(j,Q)}for(const R of A.values()){const $=R.right+R.wrong;f.push({subcatLabel:R.label,right:R.right,wrong:R.wrong,total:$,accuracyPct:$>0?Math.round(R.right/$*100):0,avgResponseMs:$>0?Math.round(R.totalMs/$):0})}f.sort((R,$)=>$.total-R.total||R.subcatLabel.localeCompare($.subcatLabel))}const b=Ys(m),w=bt(),I=t.archetype===null?l:o.filter(E=>d(E,"archetype"));for(const{ev:E}of I)E.correct?w[E.archetype].right+=1:w[E.archetype].wrong+=1;const T=we(),S=t.questionFormat?o.filter(E=>d(E,"questionFormat")):l;for(const{ev:E}of S){const A=Oe(E);E.correct?T[A].right+=1:T[A].wrong+=1}const _=yt(),L=t.peelTier===null?l:o.filter(E=>d(E,"peelTier"));for(const{ev:E}of L){const A=String(E.peelTier);E.correct?_[A].right+=1:_[A].wrong+=1}const O=vt(),D=t.speedBucket===null?l:o.filter(E=>d(E,"speedBucket"));for(const{ev:E}of D){const A=E.speedBucketIdx??ve(E.responseTimeMs);E.correct?O[A].right+=1:O[A].wrong+=1}const Z=t.outcome==="ALL"?l:o.filter(E=>d(E,"outcome"));let Y=0,ke=0,st=0;for(const{ev:E}of Z)E.correct?Y+=1:ke+=1,De(E)&&(st+=1);return{filter:t,hasActiveDimensionFilter:r,activeFilterCount:i,rangeTotalCount:o.length,filteredEvents:m,kpis:y,barSeries:g,byDomain:v,subcategories:f,eloSeries:b,byArchetype:w,byFormat:T,byPeelTier:_,speedBuckets:O,outcomeCounts:{all:Z.length,right:Y,wrong:ke,doubleDown:st},ledgerEvents:[...m].reverse(),usingLegacyAggregateFallback:!1}}function Qs(){try{if(typeof localStorage>"u")return ie();const s=localStorage.getItem(Re);if(!s)return ie();const e=JSON.parse(s);if(!e||typeof e!="object")return ie();const a=ie(),t=Array.isArray(e.byDomain)&&e.byDomain.length===12?e.byDomain.map(i=>({right:Math.max(0,Math.floor(Number(i?.right)||0)),wrong:Math.max(0,Math.floor(Number(i?.wrong)||0)),totalResponseMs:Math.max(0,Math.floor(Number(i?.totalResponseMs)||0)),peakElo:P(Math.round(Number(i?.peakElo)||1200),600,2600),lastElo:P(Math.round(Number(i?.lastElo)||1200),600,2600)})):a.byDomain;return{...a,totalRight:Math.max(0,Math.floor(Number(e.totalRight)||0)),totalWrong:Math.max(0,Math.floor(Number(e.totalWrong)||0)),bestStreak:Math.max(0,Math.floor(Number(e.bestStreak)||0)),byDomain:t,byFormat:Ht(e)}}catch{return ie()}}function Ft(s){const e=s??Qs(),a=Array.isArray(e.byDomain)?e.byDomain:[];let t=0,i=0;const r=[];for(let b=0;b<12;b++){const w=a[b],I=Math.max(0,Math.floor(Number(w?.right)||0)),T=Math.max(0,Math.floor(Number(w?.wrong)||0)),S=I+T;if(t+=I,i+=T,S>0){const _=b,L=H(_),O=I/S;r.push({domainId:_,name:L.name,right:I,wrong:T,attempts:S,accRatio:O,accPct:Math.round(O*100),lastElo:Math.round(Number(w?.lastElo)||1200)})}}const n=Math.max(0,Math.floor(Number(e.totalRight)||0)),o=Math.max(0,Math.floor(Number(e.totalWrong)||0)),p=n+o>0?n:t,d=n+o>0?o:i,l=p+d,m=l>0?Math.round(p/l*100):0,c=Math.max(0,Math.floor(Number(e.bestStreak)||0));if(r.length===0)return{totalAnswered:l,overallAccuracyPct:m,bestStreak:c,strongestDomainId:null,strongestDomainName:null,strongestAccuracyPct:0,weakestDomainId:null,weakestDomainName:null,weakestAccuracyPct:0,mostPlayedDomainId:null,mostPlayedDomainName:null};const u=[...r].sort((b,w)=>w.attempts-b.attempts||w.right-b.right||b.domainId-w.domainId)[0];if(r.length===1){const b=r[0],w=b.accPct>=50;return{totalAnswered:l,overallAccuracyPct:m,bestStreak:c,strongestDomainId:w?b.domainId:null,strongestDomainName:w?b.name:null,strongestAccuracyPct:w?b.accPct:0,weakestDomainId:w?null:b.domainId,weakestDomainName:w?null:b.name,weakestAccuracyPct:w?0:b.accPct,mostPlayedDomainId:u.domainId,mostPlayedDomainName:u.name}}const y=r.filter(b=>b.attempts>=2),g=[...y.length>0?y:r].sort((b,w)=>w.accRatio-b.accRatio||w.attempts-b.attempts||w.lastElo-b.lastElo||b.domainId-w.domainId)[0],v=y.filter(b=>b.domainId!==g.domainId),f=[...v.length>0?v:r.filter(b=>b.domainId!==g.domainId)].sort((b,w)=>b.accRatio-w.accRatio||w.wrong-b.wrong||w.attempts-b.attempts||b.lastElo-w.lastElo||b.domainId-w.domainId)[0];return{totalAnswered:l,overallAccuracyPct:m,bestStreak:c,strongestDomainId:g.domainId,strongestDomainName:g.name,strongestAccuracyPct:g.accPct,weakestDomainId:f.domainId,weakestDomainName:f.name,weakestAccuracyPct:f.accPct,mostPlayedDomainId:u.domainId,mostPlayedDomainName:u.name}}const Te={SIGHTLINE_LOCK:"Classic 4-Choice",CODEX_DUAL_RING:"Dual-Ring Match",CALIBRATOR_DIAL:"Calibrator Dial",GAUNTLET_SHATTER:"Rapid Shatter",HERO_ARTIFACT_SYNTHESIS:"Finale Chain",GLOBE_PIN_DROP:"Globe Pin-Drop"},Ce={MULTIPLE_CHOICE:"4-Choice",MATCH_4:"Match-4",SORT_4:"Sort-4",MULTI_STRIKE:"Multi-Strike",PINPOINT_DIAL:"Pinpoint",CLUE_ESCALATOR:"3-Clue",VISUAL_SPOTTER:"Visual"},me={1:"No Hint (3x)",2:"Hint (2x)",3:"50/50 (1x)"},Xs={1:"No Hint",2:"Hint",3:"50/50"},Gt={ALL:"All Answers",RIGHT:"Right Only",WRONG:"Wrong Only",DOUBLE_DOWN:"2x Double Down"};function Ie(s,e){const a=s+e;return a<=0?"—":`${(s/a*100).toFixed(1)}%`}function wt(s){if(s==null)return null;const e=Math.floor(Number(s));return!Number.isFinite(e)||e<0||e>11?null:e}function Js(s){return s.domainId!==null?"DOMAINS_POLYMATH":s.speedBucket!==null?"STREAK_SPEED":s.archetype!==null||s.questionFormat||s.peelTier!==null||s.outcome==="DOUBLE_DOWN"?"PRISM_OVERCLOCK":"ALL"}function xt(s){const e=[];return s.domainId!==null&&e.push(H(s.domainId).name),s.subcatLabel&&e.push(s.subcatLabel),s.questionFormat&&e.push(Ce[s.questionFormat]),s.archetype&&e.push(Te[s.archetype]),s.peelTier!==null&&e.push(me[String(s.peelTier)]),s.outcome!=="ALL"&&e.push(Gt[s.outcome]),s.speedBucket!==null&&e.push(Me[s.speedBucket]),e.length>0?e.join(" · "):null}const W={back:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',close:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',fullscreen:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',radar:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12 18.4 5.6"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>',play:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="6 4 20 12 6 20 6 4"/></svg>',cards:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="14" height="14" rx="2"/><path d="M7 6V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-2"/></svg>',trophy:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 4h12v6a6 6 0 0 1-12 0V4Z"/><path d="M12 16v4"/><path d="M8 20h8"/></svg>',reset:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>'};function Zs(s){if(!(typeof document>"u"))try{document.fullscreenElement?(document.exitFullscreen?.().catch(()=>{}),s.setAttribute("aria-pressed","false"),s.classList.remove("is-active-emerald")):(document.documentElement.requestFullscreen?.().catch(()=>{}),s.setAttribute("aria-pressed","true"),s.classList.add("is-active-emerald"))}catch{}}function ea(s,e){if(s.length===0)return`
      <div class="ws-brass-chart-plate">
        <svg viewBox="0 0 560 192" style="width:100%;height:auto;display:block;">
          <rect x="36" y="18" width="488" height="146" rx="8" fill="rgba(26,11,5,0.72)" stroke="rgba(226,178,76,0.34)" stroke-dasharray="4 4"/>
          <text x="${560/2}" y="${192/2-7}" text-anchor="middle" fill="#e6cfa0" font-size="11.5" font-family="Inter,sans-serif">
            <tspan x="${560/2}" dy="0">No questions match this active filter slice</tspan>
            <tspan x="${560/2}" dy="17">Adjust filters or reset to inspect all history</tspan>
          </text>
        </svg>
      </div>
    `;const l=Math.max(1,...s.map(v=>v.right+v.wrong)),m=488/s.length,c=Math.max(6,Math.min(28,m*.66)),u=[0,.5,1].map(v=>{const k=18+(1-v)*146,f=`${Math.round(v*100)}%`,b=Math.round(v*l);return`
        <line x1="36" y1="${k.toFixed(1)}" x2="524" y2="${k.toFixed(1)}" stroke="rgba(226,178,76,0.22)" stroke-dasharray="3 3"/>
        <text x="31" y="${(k+3).toFixed(1)}" text-anchor="end" fill="#c8ae84" font-size="9.5" font-family="JetBrains Mono,monospace">${b}</text>
        <text x="529" y="${(k+3).toFixed(1)}" text-anchor="start" fill="#f4ce72" font-size="9.5" font-family="JetBrains Mono,monospace">${f}</text>
      `}).join(""),y=[],x=[],g=[];return s.forEach((v,k)=>{const f=36+m*(k+.5),b=v.right/l*146,w=v.wrong/l*146,I=164-b,T=I-w,S=v.isSelected||e===v.bucketKey,_=e!==null&&!S;y.push(`
      <g
        data-g1-idx="${k}"
        data-g1-bucket="${h(v.bucketKey)}"
        data-g1-right="${v.right}"
        data-g1-wrong="${v.wrong}"
        role="button"
        tabindex="0"
        aria-label="${h(`${v.label}: ${v.right} right, ${v.wrong} wrong`)}"
        style="cursor:pointer;opacity:${_?"0.34":"1"};"
      >
        <rect x="${(f-m*.48).toFixed(1)}" y="18" width="${(m*.96).toFixed(1)}" height="164" fill="${S?"rgba(244,206,114,0.18)":"transparent"}" rx="3"/>
        ${b>0?`<rect x="${(f-c/2).toFixed(1)}" y="${I.toFixed(1)}" width="${c.toFixed(1)}" height="${Math.max(2,b).toFixed(1)}" fill="#38d396" rx="2"/>`:""}
        ${w>0?`<rect x="${(f-c/2).toFixed(1)}" y="${T.toFixed(1)}" width="${c.toFixed(1)}" height="${Math.max(2,w).toFixed(1)}" fill="#e05868" rx="2"/>`:""}
        ${S?`<line x1="${f.toFixed(1)}" y1="18" x2="${f.toFixed(1)}" y2="164" stroke="#fff0b8" stroke-width="1.3" stroke-dasharray="2 2"/>`:""}
      </g>
    `);const L=18+(1-v.rollingAccPct/100)*146;x.push(`${f.toFixed(1)},${L.toFixed(1)}`),g.push(`<circle data-g1-idx="${k}" data-g1-bucket="${h(v.bucketKey)}" cx="${f.toFixed(1)}" cy="${L.toFixed(1)}" r="${S?"5.4":"3.4"}" fill="#fff0b8" stroke="#231007" stroke-width="1.4" style="cursor:pointer;opacity:${_?"0.4":"1"};"/>`),(s.length<=12||k===0||k===s.length-1||k%Math.ceil(s.length/8)===0)&&y.push(`<text data-g1-idx="${k}" data-g1-bucket="${h(v.bucketKey)}" x="${f.toFixed(1)}" y="184" text-anchor="middle" fill="${S?"#fff0b8":"#c8ae84"}" font-size="9" font-weight="${S?"800":"600"}" font-family="JetBrains Mono,monospace" style="cursor:pointer;">${h(v.label)}</text>`)}),`
    <div class="ws-brass-chart-plate">
      <svg viewBox="0 0 560 192" style="width:100%;height:auto;display:block;">
        ${u}
        ${y.join("")}
        <polyline points="${x.join(" ")}" fill="none" stroke="#f4ce72" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>
        ${g.join("")}
      </svg>
    </div>
  `}function ta(s,e){const n=[.33,.66,1].map((x,g)=>{const v=[];for(let k=0;k<12;k++){const f=Math.PI*2*k/12-Math.PI/2;v.push(`${(175+Math.cos(f)*88*x).toFixed(1)},${(146+Math.sin(f)*88*x).toFixed(1)}`)}return`<polygon points="${v.join(" ")}" fill="none" stroke="${g===2?"rgba(244,206,114,0.48)":"rgba(226,178,76,0.24)"}" stroke-width="${g===2?"1.3":"1"}"/>`}).join(""),o=[],p=[],d=[],l=[],m=Math.max(1,...s.byDomain.map(x=>x.right+x.wrong)),c=s.filter.outcome==="WRONG";for(let x=0;x<12;x++){const g=Math.PI*2*x/12-Math.PI/2,v=Math.cos(g),k=Math.sin(g),f=s.byDomain[x],b=f.right+f.wrong;let w;if(c)w=b>0?Math.max(.22,b/m):.1;else if(b>0){const Y=Math.max(.18,f.right/b),ke=Math.max(.2,Math.min(1,(f.lastElo-750)/1350));w=Y*.72+ke*.28}else w=s.hasActiveDimensionFilter?.12:Math.max(.18,Math.min(.85,(f.lastElo-750)/1350));const I=175+v*88*w,T=146+k*88*w;o.push(`${I.toFixed(1)},${T.toFixed(1)}`);const S=e===x,_=175+v*88,L=146+k*88;p.push(`
      <g data-g2-dom="${x}" data-radar-spoke="${x}" role="button" tabindex="0" aria-label="Filter by ${h(q[x].name)}" style="cursor:pointer;">
        <line x1="175" y1="146" x2="${_.toFixed(1)}" y2="${L.toFixed(1)}" stroke="transparent" stroke-width="14"/>
        <line x1="175" y1="146" x2="${_.toFixed(1)}" y2="${L.toFixed(1)}" stroke="${S?"#fff0b8":"rgba(226,178,76,0.24)"}" stroke-width="${S?"2.2":"1"}"/>
      </g>
    `),d.push(`
      <g data-g2-dom="${x}" style="cursor:pointer;">
        <circle cx="${I.toFixed(1)}" cy="${T.toFixed(1)}" r="12" fill="transparent"/>
        <circle cx="${I.toFixed(1)}" cy="${T.toFixed(1)}" r="${S?"5.5":b>0?"3.5":"2.3"}" fill="${S?"#fff0b8":c?"#ff8e9c":"#57e6ab"}" stroke="#1f0d06" stroke-width="1.4"/>
      </g>
    `);const O=175+v*106,D=146+k*104,Z=v<-.25?"end":v>.25?"start":"middle";l.push(`<text data-g2-dom="${x}" x="${O.toFixed(1)}" y="${(D+3).toFixed(1)}" text-anchor="${Z}" fill="${S?"#fff0b8":b>0?"#fdf5e4":"#b89c72"}" font-size="${S?"9.8":"8.9"}" font-weight="${S?"800":"600"}" style="cursor:pointer;">${h(q[x].shortName)}</text>`)}const u=c?"#f06978":"#57e6ab",y=c?"rgba(217,70,87,0.28)":"rgba(56,211,150,0.26)";return`
    <div class="ws-brass-chart-plate ws-brass-radar-plate">
      <svg viewBox="0 0 350 292" style="width:100%;max-width:340px;height:auto;display:block;margin:0 auto;">
        <defs>
          <radialGradient id="ws5-radar-baize" cx="50%" cy="46%" r="55%">
            <stop offset="0%" stop-color="#136c4f" stop-opacity="0.58"/>
            <stop offset="72%" stop-color="#0a3b2b" stop-opacity="0.52"/>
            <stop offset="100%" stop-color="#1e0d05" stop-opacity="0.88"/>
          </radialGradient>
        </defs>
        <circle cx="175" cy="146" r="94" fill="url(#ws5-radar-baize)" stroke="#c99235" stroke-width="2"/>
        <circle cx="175" cy="146" r="90" fill="none" stroke="rgba(255,240,184,0.3)" stroke-width="0.9"/>
        ${n}
        ${p.join("")}
        <polygon points="${o.join(" ")}" fill="${y}" stroke="${u}" stroke-width="2.2" pointer-events="none"/>
        <circle cx="175" cy="146" r="3.2" fill="#f4ce72" stroke="#231007" stroke-width="1.2" pointer-events="none"/>
        ${d.join("")}
        ${l.join("")}
      </svg>
    </div>
  `}function sa(s){if(s.length===0)return`
      <div class="ws-brass-chart-plate">
        <svg viewBox="0 0 520 156" style="width:100%;height:auto;display:block;">
          <rect x="42" y="18" width="436" height="120" rx="8" fill="rgba(26,11,5,0.72)" stroke="rgba(226,178,76,0.34)" stroke-dasharray="4 4"/>
          <text x="${520/2}" y="${156/2+4}" text-anchor="middle" fill="#e6cfa0" font-size="11" font-family="Inter,sans-serif">
            No ELO trajectory points in this active slice
          </text>
        </svg>
      </div>
    `;const o=Math.min(1e3,...s.map(u=>u.elo))-40,p=Math.max(1500,...s.map(u=>u.elo))+40,d=Math.max(100,p-o),l=s.map((u,y)=>{const x=s.length===1?260:42+y/(s.length-1)*436,g=18+(1-(u.elo-o)/d)*120;return{x,y:g,elo:u.elo,label:u.label}}),m=l.map(u=>`${u.x.toFixed(1)},${u.y.toFixed(1)}`).join(" "),c=`${l[0].x.toFixed(1)},138 ${m} ${l[l.length-1].x.toFixed(1)},138`;return`
    <div class="ws-brass-chart-plate">
      <svg viewBox="0 0 520 156" style="width:100%;height:auto;display:block;">
        <line x1="42" y1="18" x2="478" y2="18" stroke="rgba(244,206,114,0.26)" stroke-dasharray="3 3"/>
        <text x="36" y="22" text-anchor="end" fill="#f4ce72" font-size="9.5" font-family="JetBrains Mono,monospace">${Math.round(p)}</text>
        <line x1="42" y1="138" x2="478" y2="138" stroke="rgba(226,178,76,0.3)"/>
        <text x="36" y="141" text-anchor="end" fill="#c8ae84" font-size="9.5" font-family="JetBrains Mono,monospace">${Math.round(o)}</text>
        <polygon points="${c}" fill="rgba(244,206,114,0.16)"/>
        <polyline points="${m}" fill="none" stroke="#f4ce72" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
        ${l.map((u,y)=>y===l.length-1||l.length<=16?`<circle cx="${u.x.toFixed(1)}" cy="${u.y.toFixed(1)}" r="${y===l.length-1?"4.8":"3.1"}" fill="${y===l.length-1?"#57e6ab":"#fff0b8"}" stroke="#231007" stroke-width="1.3"/>`:"").join("")}
      </svg>
    </div>
  `}function aa(s,e){const d=Math.max(1,...s.speedBuckets.map(u=>u.right+u.wrong)),l=304/5,m=36;return`
    <div class="ws-brass-chart-plate">
      <svg viewBox="0 0 340 166" style="width:100%;height:auto;display:block;">
        <line x1="18" y1="136" x2="322" y2="136" stroke="rgba(226,178,76,0.36)"/>
        ${s.speedBuckets.map((u,y)=>{const x=18+l*(y+.5),g=u.right/d*116,v=u.wrong/d*116,k=136-g,f=k-v,b=u.right+u.wrong,w=e===y,I=e!==null&&!w;return`
        <g
          data-speed-bucket="${y}"
          data-speed-right="${u.right}"
          data-speed-wrong="${u.wrong}"
          data-speed-total="${b}"
          role="button"
          tabindex="0"
          aria-pressed="${w}"
          aria-label="Speed bucket ${h(Me[y])}: ${u.right} right, ${u.wrong} wrong"
          style="cursor:pointer;opacity:${I?"0.36":"1"};"
        >
          <rect
            x="${(x-l*.45).toFixed(1)}"
            y="8"
            width="${(l*.9).toFixed(1)}"
            height="150"
            rx="6"
            fill="${w?"rgba(244,206,114,0.18)":"transparent"}"
          />
          ${g>0?`<rect x="${(x-m/2).toFixed(1)}" y="${k.toFixed(1)}" width="${m}" height="${Math.max(2,g).toFixed(1)}" fill="#38d396" rx="3"/>`:""}
          ${v>0?`<rect x="${(x-m/2).toFixed(1)}" y="${f.toFixed(1)}" width="${m}" height="${Math.max(2,v).toFixed(1)}" fill="#e05868" rx="3"/>`:""}
          ${w?`<line x1="${(x-m/2).toFixed(1)}" y1="138" x2="${(x+m/2).toFixed(1)}" y2="138" stroke="#fff0b8" stroke-width="2.4"/>`:""}
          <text x="${x.toFixed(1)}" y="${Math.max(12,(b>0?f:136)-5).toFixed(1)}" text-anchor="middle" fill="${w?"#fff0b8":"#fdf5e4"}" font-size="9.5" font-weight="700" font-family="JetBrains Mono,monospace">${b}</text>
          <text x="${x.toFixed(1)}" y="157" text-anchor="middle" fill="${w?"#fff0b8":"#c8ae84"}" font-size="9.5" font-weight="${w?"800":"600"}" font-family="JetBrains Mono,monospace">${h(Me[y])}</text>
        </g>
      `}).join("")}
      </svg>
    </div>
  `}class ia{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;unsubscribeStore=null;callbacks={};filter=ft("ALL_TIME");constructor(e){this.deps=e,de()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}getFilterState(){return{...this.filter}}setFilter(e){const a=e.domainId!==void 0?wt(e.domainId):this.filter.domainId,t=a!==this.filter.domainId,i=e.range??this.filter.range,r=i!==this.filter.range;this.filter={range:i,domainId:a,subcatLabel:a===null?null:e.subcatLabel!==void 0?e.subcatLabel:t?null:this.filter.subcatLabel,archetype:e.archetype!==void 0?e.archetype:this.filter.archetype,questionFormat:e.questionFormat!==void 0?e.questionFormat:this.filter.questionFormat??null,peelTier:e.peelTier!==void 0?e.peelTier:this.filter.peelTier,outcome:e.outcome??this.filter.outcome,speedBucket:e.speedBucket!==void 0?e.speedBucket:this.filter.speedBucket,bucketKey:e.bucketKey!==void 0?e.bucketKey:r?null:this.filter.bucketKey},this.isOpen()&&this.rerender()}resetFilters(){this.filter=ft(this.filter.range),this.isOpen()&&this.rerender()}applyInitialOptions(e){const a=wt(e.initialDomainId);this.filter={range:e.initialRange??"ALL_TIME",domainId:a,subcatLabel:a!==null&&e.initialSubcatLabel?.trim()||null,archetype:e.initialArchetype??null,questionFormat:e.initialQuestionFormat??null,peelTier:e.initialPeelTier??null,outcome:e.initialOutcome??"ALL",speedBucket:e.initialSpeedBucket??null,bucketKey:null}}open(e={}){this.close(),this.callbacks=e,this.applyInitialOptions(e),this.deps.store.syncAndBackfillFromProfile(this.deps.passport);const a=document.createElement("div");a.className="ws-meta-backdrop ws-brass-backdrop",a.setAttribute("role","dialog"),a.setAttribute("aria-modal","true"),a.setAttribute("aria-label","Career Stats — Strengths, Weak Spots & Domain Radar"),a.addEventListener("click",t=>{t.target===a&&this.handleClose()}),document.body.appendChild(a),this.modalBackdrop=a,this.detachEscape=ce(()=>this.handleBackOrClose()),this.unsubscribeStore=this.deps.store.subscribe(()=>{this.isOpen()&&this.rerender()}),this.renderInto(a,!0)}mount(e,a={}){this.unmount(),this.callbacks=a,this.applyInitialOptions(a),this.deps.store.syncAndBackfillFromProfile(this.deps.passport),this.mountedContainer=e,this.unsubscribeStore=this.deps.store.subscribe(()=>{this.isOpen()&&this.rerender()}),this.renderInto(e,!1)}unmount(){this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.unsubscribeStore&&(this.unsubscribeStore(),this.unsubscribeStore=null),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}this.handleClose()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}rerender(){const e=(this.modalBackdrop??this.mountedContainer)?.querySelector(".ws-meta-body-scroll")?.scrollTop??0;this.modalBackdrop?this.renderInto(this.modalBackdrop,!0):this.mountedContainer&&this.renderInto(this.mountedContainer,!1);const a=(this.modalBackdrop??this.mountedContainer)?.querySelector(".ws-meta-body-scroll");a&&e>0&&(a.scrollTop=e)}computeMissedCardsBadgeCount(e){let a=0;if(this.deps.srsEngine){this.deps.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks);const i=this.deps.srsEngine.getAllCards();a=this.filter.domainId!==null?i.filter(r=>r.domainId===this.filter.domainId).length:i.length}const t=e.kpis.totalWrong;return a>0?a:t}renderActiveFilterBar(e){const a=[];if(this.filter.domainId!==null&&a.push({key:"domain",label:H(this.filter.domainId).name}),this.filter.subcatLabel&&a.push({key:"subcat",label:this.filter.subcatLabel}),this.filter.outcome!=="ALL"&&a.push({key:"outcome",label:Gt[this.filter.outcome]}),this.filter.archetype&&a.push({key:"archetype",label:Te[this.filter.archetype]}),this.filter.questionFormat&&a.push({key:"format",label:Ce[this.filter.questionFormat]}),this.filter.peelTier!==null&&a.push({key:"peel",label:me[String(this.filter.peelTier)]}),this.filter.speedBucket!==null&&a.push({key:"speed",label:`Speed ${Me[this.filter.speedBucket]}`}),this.filter.bucketKey!==null){const n=e.barSeries.find(o=>o.bucketKey===this.filter.bucketKey);a.push({key:"bucket",label:n?`${this.filter.range==="LAST_25"?n.label:n.bucketKey}`:this.filter.bucketKey})}const t=this.computeMissedCardsBadgeCount(e),i=this.filter.domainId!==null?H(this.filter.domainId):null,r=i?`Practice ${i.shortName} Slice`:"Practice This Slice";return`
      <div
        id="ws-stats-filter-bar"
        class="ws-stats-filter-bar ${e.hasActiveDimensionFilter?"is-filtered":""}"
        data-active-filter-count="${e.activeFilterCount}"
        data-active-domain="${this.filter.domainId??""}"
      >
        <div class="ws-stats-filter-chips-row">
          ${a.length>0?`
                <span class="ws-stats-slice-summary">
                  ✦ Slice: <strong>${e.kpis.totalAnswered}</strong> of ${e.rangeTotalCount} Q
                </span>
                ${a.map(n=>`
                      <button
                        type="button"
                        class="ws-stats-filter-chip"
                        data-remove-filter="${n.key}"
                        aria-label="Remove ${h(n.label)} filter"
                      >
                        <span>${h(n.label)}</span>
                        <span class="ws-brass-ico" aria-hidden="true" style="color:var(--ws5-brass-highlight);">${W.close}</span>
                      </button>
                    `).join("")}
                <button
                  type="button"
                  class="ws-stats-reset-btn"
                  id="ws-stats-reset-filters"
                  data-reset-filters="true"
                >
                  <span class="ws-brass-ico" aria-hidden="true">${W.reset}</span>
                  <span>Reset All</span>
                </button>
              `:`
                <span class="ws-stats-slice-summary">
                  Showing all <strong>${e.kpis.totalAnswered}</strong> questions · Tap any domain, spoke, pill, or bar to cross-filter
                </span>
              `}
        </div>

        <div class="ws-stats-linked-actions">
          <button
            type="button"
            class="ws-meta-btn-gold ws-stats-action-cta"
            id="ws-stats-practice-slice"
            aria-label="${h(r)}"
          >
            <span class="ws-brass-ico" aria-hidden="true">${W.play}</span>
            <span>Practice This Slice</span>
          </button>
          <button
            type="button"
            class="ws-meta-btn ws-stats-action-btn"
            id="ws-stats-open-srs"
            style="color:var(--ws5-turquoise-ink);"
          >
            <span class="ws-brass-ico" aria-hidden="true">${W.cards}</span>
            <span>Review Missed Cards (${t})</span>
          </button>
          <button
            type="button"
            class="ws-meta-btn ws-stats-action-btn"
            id="ws-stats-open-honours"
            style="color:var(--ws5-brass-bright);"
          >
            <span class="ws-brass-ico" aria-hidden="true">${W.trophy}</span>
            <span>Related Trophies</span>
          </button>
        </div>
      </div>
    `}renderSubcategoryBreakdown(e){if(this.filter.domainId===null)return"";const a=H(this.filter.domainId);return`
      <div id="ws-stats-subcat-panel" class="ws-stats-subcat-panel" data-subcat-domain="${this.filter.domainId}">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
          <span class="ws-meta-section-title" style="color:${a.accentHex};">
            Subcategory Breakdown · ${h(a.name)}
          </span>
          ${this.filter.subcatLabel?'<button type="button" class="ws-meta-inline-link" data-remove-filter="subcat">Clear Subcategory</button>':'<span style="font-family:var(--ws5-font-mono);font-size:10.5px;color:var(--ws5-parchment-muted);">Tap a topic to drill deeper</span>'}
        </div>
        ${e.subcategories.length>0?`<div style="display:flex;flex-direction:column;">
                ${e.subcategories.map(t=>{const i=this.filter.subcatLabel!==null&&this.filter.subcatLabel.toLowerCase()===t.subcatLabel.toLowerCase(),r=this.filter.subcatLabel!==null&&!i;return`
                      <button
                        type="button"
                        data-subcat-filter="${h(t.subcatLabel)}"
                        data-subcat-right="${t.right}"
                        data-subcat-wrong="${t.wrong}"
                        aria-pressed="${i}"
                        class="ws-meta-row is-interactive ws-stats-row-btn ${i?"is-focused":""} ${r?"is-dimmed":""}"
                      >
                        <span style="min-width:0;flex:0 1 138px;font-size:12px;font-weight:600;color:var(--ws5-parchment-bright);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                          ${h(M(t.subcatLabel))}
                        </span>
                        <div style="flex:1 1 60px;min-width:36px;height:6px;border-radius:999px;background:rgba(217,70,87,0.42);border:1px solid rgba(226,178,76,0.22);overflow:hidden;">
                          <div style="width:${t.accuracyPct}%;height:100%;background:#38d396;"></div>
                        </div>
                        <span style="font-family:var(--ws5-font-mono);font-size:11px;color:var(--ws5-parchment-ink);white-space:nowrap;flex-shrink:0;">
                          <strong style="color:var(--ws5-emerald-ink);">${t.right}R</strong>·<strong style="color:var(--ws5-crimson-ink);">${t.wrong}W</strong>
                          <span style="color:var(--ws5-parchment-muted);">(${t.accuracyPct}%)</span>
                        </span>
                      </button>
                    `}).join("")}
              </div>`:`<div style="padding:10px 0;font-size:12px;color:var(--ws5-parchment-muted);">No questions recorded in ${h(a.name)} for this filter slice yet.</div>`}
      </div>
    `}renderInto(e,a){const t=this.deps.store.getSnapshot(),i=js(t,this.filter),r=this.deps.passport.getChallengerName(),{kpis:n}=i,o=(this.filter.bucketKey!==null?i.barSeries.find(f=>f.bucketKey===this.filter.bucketKey):null)??i.barSeries[i.barSeries.length-1]??null,p=X("ANALYTICS",{isModal:a,closeBtnId:"ws-stats-close",canNavigate:!!this.callbacks.onNavigateSection}),d=i.ledgerEvents.slice(0,50),l=n.doubleDownWinPct!==null?`${n.doubleDownWinPct}%`:"—",m=this.filter.domainId!==null,c=this.filter.archetype!==null,u=!!this.filter.questionFormat,y=this.filter.peelTier!==null,x=xt(this.filter),g=Ft(t),v=typeof document<"u"&&!!document.fullscreenElement,k=g.strongestDomainId!==null||g.weakestDomainId!==null?`<div id="ws-stats-strength-weak-strip" class="ws-meta-hscroll" style="padding:2px 0 4px;" aria-label="Strengths and Weak Spots">
            ${g.strongestDomainId!==null&&g.strongestDomainName?`<button type="button" class="ws-meta-chip" data-quick-dom="${g.strongestDomainId}" style="color:var(--ws5-emerald-ink);">
                    Strongest: ${h(g.strongestDomainName)} (${g.strongestAccuracyPct}%)
                  </button>`:""}
            ${g.weakestDomainId!==null&&g.weakestDomainName?`<button type="button" class="ws-meta-chip" data-quick-dom="${g.weakestDomainId}" style="color:var(--ws5-crimson-ink);">
                    Weak Spot: ${h(g.weakestDomainName)} (${g.weakestAccuracyPct}%)
                  </button>`:""}
          </div>`:"";e.innerHTML=`
      <div class="ws-meta-shell ws-brass-ledger" data-stats-filtered="${i.hasActiveDimensionFilter?"true":"false"}">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-stats-back" data-meta-back="true" aria-label="Back">
              <span class="ws-brass-ico" aria-hidden="true">${W.back}</span>
              <span class="ws-brass-back-lbl">Back</span>
            </button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">
                <span class="ws-brass-ico ws-brass-title-ico" aria-hidden="true">${W.radar}</span>
                <span>CAREER STATS</span>
              </h2>
              <div class="ws-meta-eyebrow">${h(r)} · ${h(x??"Strengths, Weak Spots & Domain Radar")}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            <button
              type="button"
              class="ws-brass-clasp-btn is-icon-only ${v?"is-active-emerald":""}"
              data-v5-fullscreen-toggle="true"
              aria-pressed="${v}"
              aria-label="Toggle Fullscreen"
              title="Toggle Fullscreen"
            >
              <span class="ws-brass-ico" aria-hidden="true">${W.fullscreen}</span>
            </button>
            ${p}
            ${a?`<button type="button" class="ws-brass-clasp-btn is-icon-only is-close-clasp" data-brass-close="true" aria-label="Close Career Stats" title="Close">
                    <span class="ws-brass-ico" aria-hidden="true">${W.close}</span>
                  </button>`:""}
          </div>
        </div>

        <!-- Brass & Emerald Index Time-Range Tabs (>= 44px) -->
        <div class="ws-meta-underline-tabs" role="tablist" aria-label="Analytics Time Range">
          ${[["LAST_25","Last 25 Q"],["DAYS_7","7 Days"],["DAYS_30","30 Days"],["ALL_TIME","All Time"]].map(([f,b])=>`
                <button type="button" role="tab" aria-selected="${this.filter.range===f}" class="ws-meta-underline-tab ${this.filter.range===f?"is-active":""}" data-range-tab="${f}">
                  ${b}
                </button>
              `).join("")}
        </div>

        <div class="ws-meta-body-scroll">
          <!-- Clickable Outcome Brass Filter Clasps -->
          <div class="ws-meta-hscroll ws-stats-outcome-strip" role="group" aria-label="Filter by Outcome">
            ${[["ALL",`All (${i.outcomeCounts.all})`],["RIGHT",`Right Only (${i.outcomeCounts.right})`],["WRONG",`Wrong Only (${i.outcomeCounts.wrong})`],["DOUBLE_DOWN",`2x Double Down (${i.outcomeCounts.doubleDown})`]].map(([f,b])=>{const w=this.filter.outcome===f;return`
                  <button
                    type="button"
                    class="ws-meta-chip ws-stats-outcome-pill ${w?"is-active":""}"
                    data-outcome-filter="${f}"
                    aria-pressed="${w}"
                  >
                    ${b}
                  </button>
                `}).join("")}
          </div>

          <!-- Vaudeville Contestant Ledger Tally Strip (100% Live Recomputed from Filtered Slice!) -->
          <div class="ws-meta-kpi-strip" id="ws-stats-kpi-strip" data-kpi-total="${n.totalAnswered}" data-kpi-right="${n.totalRight}" data-kpi-wrong="${n.totalWrong}">
            <div class="ws-meta-kpi-cell" data-stats-kpi="rw">
              <span class="ws-meta-kpi-lbl">Right / Wrong</span>
              <span class="ws-meta-kpi-val">
                <span data-stats-right="${n.totalRight}" style="color:var(--ws5-emerald-ink);">${n.totalRight}R</span>
                <span style="color:var(--ws5-parchment-muted);font-weight:500;">·</span>
                <span data-stats-wrong="${n.totalWrong}" style="color:var(--ws5-crimson-ink);">${n.totalWrong}W</span>
              </span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="accuracy">
              <span class="ws-meta-kpi-lbl">Accuracy</span>
              <span class="ws-meta-kpi-val" style="color:var(--ws5-brass-bright);">${n.accuracyPct!==null?`${n.accuracyPct.toFixed(1)}%`:"—"}</span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="streak">
              <span class="ws-meta-kpi-lbl">Streak</span>
              <span class="ws-meta-kpi-val">${n.currentStreak} <span style="font-size:11px;color:var(--ws5-brass-bright);">/ ${n.bestStreak} BEST</span></span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="elo">
              <span class="ws-meta-kpi-lbl">${this.filter.domainId!==null?"Slice ELO":"Global ELO"}</span>
              <span class="ws-meta-kpi-val" style="color:var(--ws5-turquoise-ink);">${n.eloLatest} <span style="font-size:11px;color:var(--ws5-parchment-muted);">(${n.eloPeak})</span></span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="speed">
              <span class="ws-meta-kpi-lbl">Speed · 2x Win</span>
              <span class="ws-meta-kpi-val" style="font-size:14px;">${n.totalAnswered>0?`${(n.avgResponseMs/1e3).toFixed(1)}s`:"—"} · <span style="color:var(--ws5-brass-bright);">${l}</span></span>
            </div>
          </div>

          <!-- Active Drill-Down Breadcrumb & 3 Linked Action Buttons -->
          ${this.renderActiveFilterBar(i)}

          <!-- Graph 1: Historical Right vs. Wrong Stacked Bars & Rolling Accuracy % -->
          <div class="ws-meta-section" id="ws-stats-section-1">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">1. Right vs. Wrong &amp; Rolling Accuracy</h3>
              <span style="font-family:var(--ws5-font-mono);font-size:10.5px;color:var(--ws5-parchment-ink);">
                <span style="color:var(--ws5-emerald-ink);">Right</span> · <span style="color:var(--ws5-crimson-ink);">Wrong</span> · <span style="color:var(--ws5-brass-bright);">Accuracy %</span>
              </span>
            </div>

            ${ea(i.barSeries,this.filter.bucketKey)}

            ${o?`<div class="ws-meta-note" style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-family:var(--ws5-font-mono);font-size:11px;color:var(--ws5-parchment-bright);">
                    <span>[${h(o.label)}] ${h(o.sublabel)}</span>
                    <span style="color:var(--ws5-brass-bright);font-weight:700;">Rolling ${o.rollingAccPct}%${this.filter.bucketKey?" · Filtered (tap bar to clear)":" · Tap any bar to filter"}</span>
                  </div>`:""}
          </div>

          <!-- Graph 2: 12-Domain Mastery Breakdown, Compass Brass Radar & Subcategory Drill-Down -->
          <div class="ws-meta-section" id="ws-stats-section-2">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">2. 12-Domain Mastery &amp; Polar Radar</h3>
              <span style="font-family:var(--ws5-font-mono);font-size:10.5px;color:var(--ws5-parchment-muted);">
                ${m?"Tap active domain again to show all 12":"Tap any spoke or domain row to drill down"}
              </span>
            </div>
            ${k}

            <div class="ws-meta-two-col">
              <div>
                ${ta(i,this.filter.domainId)}
              </div>
              <div style="display:flex;flex-direction:column;">
                ${q.map((f,b)=>{const w=i.byDomain[b],I=w.right+w.wrong,T=I>0?w.right/I*100:0,S=b===this.filter.domainId,_=m&&!S;return`
                    <button
                      type="button"
                      data-g2-dom="${b}"
                      data-g2-right="${w.right}"
                      data-g2-wrong="${w.wrong}"
                      aria-pressed="${S}"
                      class="ws-meta-row is-interactive ws-stats-row-btn ${S?"is-focused":""} ${_?"is-dimmed":""}"
                    >
                      <span style="display:inline-flex;align-items:center;gap:7px;min-width:0;flex:0 1 112px;">
                        <span class="ws-brass-mini-medallion">
                          <img src="./${h(f.medallionUrl)}" alt=""/>
                        </span>
                        <span style="font-size:12px;font-weight:${S?"800":"600"};color:${S?"var(--ws5-brass-highlight)":"var(--ws5-parchment-bright)"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${h(f.shortName)}</span>
                      </span>
                      <div style="flex:1 1 40px;min-width:24px;height:6px;border-radius:999px;background:${I>0?"rgba(217,70,87,0.42)":"rgba(20,9,4,0.72)"};border:1px solid rgba(226,178,76,0.2);overflow:hidden;">
                        <div style="width:${T.toFixed(1)}%;height:100%;background:#38d396;"></div>
                      </div>
                      <span style="font-family:var(--ws5-font-mono);font-size:10.5px;color:var(--ws5-parchment-ink);white-space:nowrap;flex-shrink:0;">
                        <strong style="color:var(--ws5-emerald-ink);">${w.right}R</strong>·<strong style="color:var(--ws5-crimson-ink);">${w.wrong}W</strong> <span style="color:var(--ws5-parchment-muted);">(${Ie(w.right,w.wrong)})</span> · <strong style="color:${f.accentHex};">${w.lastElo}</strong>
                      </span>
                    </button>
                  `}).join("")}
              </div>
            </div>

            ${this.renderSubcategoryBreakdown(i)}
          </div>

          <!-- Graph 3: Filtered Rating Trajectory & Double-Down Record -->
          <div class="ws-meta-section" id="ws-stats-section-3">
            <h3 class="ws-meta-section-title">3. Skill Rating &amp; Double-Down Record${this.filter.domainId!==null?` · ${h(H(this.filter.domainId).shortName)}`:""}</h3>
            <div class="ws-meta-two-col" style="align-items:center;">
              <div>
                ${sa(i.eloSeries)}
              </div>
              <div style="display:flex;flex-direction:column;">
                <div class="ws-meta-row" style="font-family:var(--ws5-font-mono);font-size:11.5px;">
                  <span style="color:var(--ws5-parchment-ink);">Standard Lock Record</span>
                  <span><strong style="color:var(--ws5-emerald-ink);">${n.safeLockWins}W</strong> – <strong style="color:var(--ws5-crimson-ink);">${n.safeLockMisses}L</strong> <span style="color:var(--ws5-parchment-muted);">(${Ie(n.safeLockWins,n.safeLockMisses)})</span></span>
                </div>
                <button
                  type="button"
                  class="ws-meta-row is-interactive ws-stats-row-btn ${this.filter.outcome==="DOUBLE_DOWN"?"is-focused":""}"
                  data-outcome-filter="DOUBLE_DOWN"
                  style="font-family:var(--ws5-font-mono);font-size:11.5px;"
                >
                  <span style="color:var(--ws5-parchment-ink);">2x Double-Down Wins</span>
                  <span style="color:var(--ws5-brass-bright);font-weight:700;">${n.doubleDownWins}W – ${n.doubleDownMisses}L (${l})</span>
                </button>
                <div class="ws-meta-row" style="font-family:var(--ws5-font-mono);font-size:11.5px;border-bottom:none;">
                  <span style="color:var(--ws5-parchment-ink);">Backfires / Max Streak</span>
                  <span><strong style="color:var(--ws5-crimson-ink);">${n.backfires}</strong> · Peak <strong style="color:var(--ws5-brass-bright);">${n.bestConsecutiveMax6xWins}×</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Graph 4: Format Mastery Strip + Mode Matrix & Speed Histogram -->
          <div class="ws-meta-section" id="ws-stats-section-4">
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:6px;">
              <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
                <h3 class="ws-meta-section-title">Format Mastery Strip (7 Game-Show Formats)</h3>
                <span style="font-family:var(--ws5-font-mono);font-size:10.5px;color:var(--ws5-parchment-muted);">
                  ${u?"Tap active format to clear":"Tap any format to cross-filter"}
                </span>
              </div>
              <div id="ws-stats-format-strip" class="ws-meta-hscroll" role="group" aria-label="Filter by Question Format">
                ${He.map(f=>{const b=i.byFormat[f],w=this.filter.questionFormat===f,I=u&&!w,T=Ie(b.right,b.wrong);return`
                    <button
                      type="button"
                      class="ws-meta-chip ${w?"is-active":""}"
                      data-format-filter="${f}"
                      data-format-right="${b.right}"
                      data-format-wrong="${b.wrong}"
                      aria-pressed="${w}"
                      style="${I?"opacity:0.45;":""}display:inline-flex;align-items:center;gap:6px;"
                    >
                      <span>${h(Ce[f])}</span>
                      <span style="font-family:var(--ws5-font-mono);font-size:10.5px;color:${w?"var(--ws5-brass-highlight)":"var(--ws5-parchment-muted)"};">
                        ${b.right}R·${b.wrong}W${T!=="—"?` (${T})`:""}
                      </span>
                    </button>
                  `}).join("")}
              </div>
            </div>

            <div class="ws-meta-two-col">
              <div style="display:flex;flex-direction:column;gap:8px;">
                <h3 class="ws-meta-section-title">4A. Mode &amp; Lifeline Matrix</h3>
                <div>
                  ${Je.map(f=>{const b=i.byArchetype[f],w=this.filter.archetype===f,I=c&&!w;return`
                      <button
                        type="button"
                        data-arch-filter="${f}"
                        data-arch-right="${b.right}"
                        data-arch-wrong="${b.wrong}"
                        aria-pressed="${w}"
                        class="ws-meta-row is-interactive ws-stats-row-btn ${w?"is-focused":""} ${I?"is-dimmed":""}"
                        style="font-family:var(--ws5-font-mono);font-size:11px;"
                      >
                        <span style="color:${w?"var(--ws5-brass-highlight)":"var(--ws5-parchment-bright)"};font-weight:${w?"700":"600"};">${h(Te[f])}</span>
                        <span><strong style="color:var(--ws5-emerald-ink);">${b.right}R</strong> · <strong style="color:var(--ws5-crimson-ink);">${b.wrong}W</strong> <span style="color:var(--ws5-parchment-muted);">(${Ie(b.right,b.wrong)})</span></span>
                      </button>
                    `}).join("")}
                </div>
                <div class="ws-stats-peel-grid" role="group" aria-label="Filter by Hint Tier">
                  ${[[1,"1",me[1]],[2,"2",me[2]],[3,"3",me[3]]].map(([f,b,w])=>{const I=i.byPeelTier[b],T=this.filter.peelTier===f;return`
                        <button
                          type="button"
                          class="ws-stats-peel-btn ${T?"is-active":""} ${y&&!T?"is-dimmed":""}"
                          data-peel-filter="${f}"
                          data-peel-right="${I.right}"
                          data-peel-wrong="${I.wrong}"
                          aria-pressed="${T}"
                        >
                          <span class="ws-meta-kpi-lbl" style="color:${T?"var(--ws5-brass-highlight)":"var(--ws5-brass-bright)"};">${w}</span>
                          <span class="ws-meta-kpi-val" style="font-size:13px;">
                            <span style="color:var(--ws5-emerald-ink);">${I.right}R</span> / <span style="color:var(--ws5-crimson-ink);">${I.wrong}W</span>
                          </span>
                        </button>
                      `}).join("")}
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px;">
                  <h3 class="ws-meta-section-title">4B. Response-Time Histogram</h3>
                  <span style="font-family:var(--ws5-font-mono);font-size:10.5px;color:var(--ws5-parchment-muted);">
                    ${this.filter.speedBucket!==null?"Tap active bar to clear":"Tap any bar to filter"}
                  </span>
                </div>
                ${aa(i,this.filter.speedBucket)}
              </div>
            </div>
          </div>

          <!-- 5. Chronological Question Ledger Tape (Strictly Filtered!) -->
          <div class="ws-meta-section" id="ws-stats-section-5">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">
                5. Question Ledger Tape (${d.length}${i.filteredEvents.length>d.length?` of ${i.filteredEvents.length}`:""})
              </h3>
              ${i.hasActiveDimensionFilter?'<span style="font-family:var(--ws5-font-mono);font-size:10.5px;color:var(--ws5-brass-bright);">Filtered Slice Only</span>':""}
            </div>
            ${d.length>0?`<div id="ws-stats-ledger" style="display:flex;flex-direction:column;max-height:280px;overflow-y:auto;">
                    ${d.map(f=>{const b=H(f.domainId),w=f.peelTier===1?3:f.peelTier===2?2:1,I=De(f),T=(w*(I?2:1)).toFixed(1),S=f.speedBucketIdx??ve(f.responseTimeMs),_=Oe(f),L=f.questionFormat?Ce[_]:Te[f.archetype],O=f.promptSnippet?M(f.promptSnippet):"",D=f.subcatLabel?M(f.subcatLabel):"";return`
                          <div
                            class="ws-meta-row"
                            data-ledger-domain="${f.domainId}"
                            data-ledger-correct="${f.correct?"true":"false"}"
                            data-ledger-arch="${f.archetype}"
                            data-ledger-format="${_}"
                            data-ledger-peel="${f.peelTier}"
                            data-ledger-speed="${S}"
                            data-ledger-date="${h(f.dateKey)}"
                            style="flex-direction:column;align-items:stretch;gap:4px;padding:9px 6px 9px 12px;font-family:var(--ws5-font-mono);font-size:11px;box-shadow:inset 3px 0 0 ${f.correct?"var(--ws5-emerald-ink)":"var(--ws5-crimson-bright)"};"
                          >
                            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
                              <span style="display:inline-flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap;">
                                <span style="font-weight:800;color:${f.correct?"var(--ws5-emerald-ink)":"var(--ws5-crimson-ink)"};">
                                  ${f.correct?"WIN":f.backfired?"MISS!":"MISS"}
                                </span>
                                <span class="ws-brass-mini-medallion" style="width:20px;height:20px;">
                                  <img src="./${h(b.medallionUrl)}" alt="" style="width:14px;height:14px;"/>
                                </span>
                                <span style="color:var(--ws5-parchment-bright);font-weight:700;">${h(b.shortName)}</span>
                                ${D?`<span style="color:${b.accentHex};">· ${h(D)}</span>`:""}
                                <span style="color:var(--ws5-parchment-muted);">· ${h(L)} · ${Xs[f.peelTier]}${I?" · 2x":""}</span>
                              </span>
                              <span style="color:var(--ws5-parchment-ink);white-space:nowrap;">
                                ${(f.responseTimeMs/1e3).toFixed(1)}s · ${T}x · <strong style="color:${f.correct?"var(--ws5-brass-bright)":"var(--ws5-parchment-muted)"};">+${f.pointsDelta.toLocaleString("en-US")} PTS</strong>
                              </span>
                            </div>
                            ${O?`<div style="font-family:var(--ws5-font-sans);font-size:11.5px;color:var(--ws5-parchment-ink);line-height:1.38;white-space:normal;">
                                    ${h(O)}${f.answerLabel?` — <strong style="color:var(--ws5-parchment-bright);">${h(M(f.answerLabel))}</strong>`:""}
                                  </div>`:""}
                          </div>
                        `}).join("")}
                  </div>`:`<div id="ws-stats-ledger-empty" style="padding:18px 0;text-align:center;font-size:12.5px;color:var(--ws5-parchment-muted);display:flex;flex-direction:column;align-items:center;gap:10px;">
                    <span>${i.hasActiveDimensionFilter?"No recorded questions match every active filter in this slice.":"No individual question events logged in this browser session yet."}</span>
                    ${i.hasActiveDimensionFilter?`<button type="button" class="ws-stats-reset-btn" data-reset-filters="true"><span class="ws-brass-ico" aria-hidden="true">${W.reset}</span><span>Reset All Filters</span></button>`:""}
                  </div>`}
          </div>
        </div>
      </div>
    `,this.bindEvents(e)}bindEvents(e){e.querySelector("#ws-stats-back")?.addEventListener("click",()=>this.handleBackOrClose()),e.querySelector('[data-brass-close="true"]')?.addEventListener("click",()=>this.handleClose()),e.querySelectorAll("[data-v5-fullscreen-toggle]").forEach(a=>{a.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),Zs(a)})}),le(e,{closeBtnId:"ws-stats-close",onNavigate:a=>this.callbacks.onNavigateSection?.(a),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-range-tab]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.rangeTab;!t||t===this.filter.range||(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.setFilter({range:t,bucketKey:null}))})}),e.querySelectorAll("[data-outcome-filter]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.outcomeFilter;if(!t)return;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const i=t!=="ALL"&&this.filter.outcome===t?"ALL":t;this.setFilter({outcome:i})})}),e.querySelectorAll("[data-remove-filter]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.removeFilter;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),t==="domain"?this.setFilter({domainId:null,subcatLabel:null}):t==="subcat"?this.setFilter({subcatLabel:null}):t==="outcome"?this.setFilter({outcome:"ALL"}):t==="archetype"?this.setFilter({archetype:null}):t==="format"?this.setFilter({questionFormat:null}):t==="peel"?this.setFilter({peelTier:null}):t==="speed"?this.setFilter({speedBucket:null}):t==="bucket"&&this.setFilter({bucketKey:null})})}),e.querySelectorAll("[data-reset-filters]").forEach(a=>{a.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.resetFilters()})}),e.querySelector("#ws-stats-practice-slice")?.addEventListener("click",()=>{this.deps.haptics?.lockThunk(),this.deps.audio?.playSfx("vault_thunk"),this.callbacks.onPracticeSlice?.({domainId:this.filter.domainId,subcatLabel:this.filter.subcatLabel,outcome:this.filter.outcome,archetype:this.filter.archetype,questionFormat:this.filter.questionFormat??null,peelTier:this.filter.peelTier,speedBucket:this.filter.speedBucket})}),e.querySelector("#ws-stats-open-srs")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onOpenMissedCards?this.callbacks.onOpenMissedCards(this.filter.domainId):this.callbacks.onNavigateSection?.("OBSERVATORY")}),e.querySelector("#ws-stats-open-honours")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onOpenRelatedHonours?this.callbacks.onOpenRelatedHonours({aspect:Js(this.filter),contextLabel:xt(this.filter),domainId:this.filter.domainId,archetype:this.filter.archetype,peelTier:this.filter.peelTier,outcome:this.filter.outcome,speedBucket:this.filter.speedBucket}):this.callbacks.onNavigateSection?.("HONOURS")}),e.querySelectorAll("[data-g1-bucket]").forEach(a=>{a.addEventListener("click",()=>{const t=a.getAttribute("data-g1-bucket");t&&(this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({bucketKey:this.filter.bucketKey===t?null:t}))})}),e.querySelectorAll("[data-g2-dom]").forEach(a=>{a.addEventListener("click",()=>{const t=Number(a.getAttribute("data-g2-dom"));if(!Number.isFinite(t)||t<0||t>11)return;const i=t;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({domainId:this.filter.domainId===i?null:i,subcatLabel:null})})}),e.querySelectorAll("[data-subcat-filter]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.subcatFilter?.trim();if(!t)return;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick");const i=this.filter.subcatLabel!==null&&this.filter.subcatLabel.toLowerCase()===t.toLowerCase();this.setFilter({subcatLabel:i?null:t})})}),e.querySelectorAll("[data-quick-dom]").forEach(a=>{a.addEventListener("click",()=>{const t=Number(a.dataset.quickDom);if(!Number.isFinite(t)||t<0||t>11)return;const i=t;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({domainId:this.filter.domainId===i?null:i,subcatLabel:null})})}),e.querySelectorAll("[data-format-filter]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.formatFilter;t&&(this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({questionFormat:this.filter.questionFormat===t?null:t}))})}),e.querySelectorAll("[data-arch-filter]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.archFilter;t&&(this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({archetype:this.filter.archetype===t?null:t}))})}),e.querySelectorAll("[data-peel-filter]").forEach(a=>{a.addEventListener("click",()=>{const t=Number(a.dataset.peelFilter);if(t!==1&&t!==2&&t!==3)return;const i=t;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({peelTier:this.filter.peelTier===i?null:i})})}),e.querySelectorAll("[data-speed-bucket]").forEach(a=>{a.addEventListener("click",()=>{const t=Number(a.getAttribute("data-speed-bucket"));if(!Number.isInteger(t)||t<0||t>4)return;const i=t;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({speedBucket:this.filter.speedBucket===i?null:i})})})}}const St="ws_hall_of_honours_v1",Ut="ws_equipped_hud_theme_v1",qt="ws_unlocked_hud_themes_v1",Kt={TIER_1_EASY:{label:"Tier 1 · Initiate Bronze",shortLabel:"Initiate Bronze",rarityPct:"Common",colorHex:"#e09b63",bgRgba:"rgba(224, 155, 99, 0.15)"},TIER_2_MEDIUM:{label:"Tier 2 · Envoy Sterling",shortLabel:"Envoy Sterling",rarityPct:"Uncommon",colorHex:"#cfdceb",bgRgba:"rgba(207, 220, 235, 0.15)"},TIER_3_HARD:{label:"Tier 3 · Consul 24K Gold",shortLabel:"Consul 24K Gold",rarityPct:"Rare",colorHex:"#f2cf7e",bgRgba:"rgba(242, 207, 126, 0.16)"},TIER_4_VERY_RARE:{label:"Tier 4 · Arbiter Sapphire",shortLabel:"Arbiter Sapphire",rarityPct:"Very Rare (2.5%)",colorHex:"#56d4f5",bgRgba:"rgba(86, 212, 245, 0.16)"},TIER_5_MYTHIC:{label:"Tier 5 · Mythic Celestial Diamond",shortLabel:"Mythic 0.1%",rarityPct:"Mythic (0.1%)",colorHex:"#c79bff",bgRgba:"rgba(199, 155, 255, 0.18)"}},ra=[{id:"bt_01",order:1,title:"MERIDIAN CANDIDATE",unlockRequirement:"Default Opening Broadcast Title"},{id:"bt_02",order:2,title:"GENEVA CHARTER INITIATE",unlockRequirement:"Tier 1: Lock your first correct answer"},{id:"bt_03",order:3,title:"COLD INSTINCT SPECIALIST",unlockRequirement:"Tier 2: Answer 10 questions cleanly with zero lifelines"},{id:"bt_04",order:4,title:"CONVICTION HIGH-ROLLER",unlockRequirement:"Tier 2: Win a full-stakes 2× Double Down wager"},{id:"bt_05",order:5,title:"FORENSIC TELL READER",unlockRequirement:"Tier 2: Catch a live rival bluff on stage"},{id:"bt_06",order:6,title:"ARCHIVE VAULT DELVER",unlockRequirement:"Tier 2: Survive to Round 15 in Endless Mode"},{id:"bt_07",order:7,title:"CONSUL OF THE TWELVE",unlockRequirement:"Tier 3: Reach 1500 Skill Rating in any domain"},{id:"bt_08",order:8,title:"BLACK SALON SHARK",unlockRequirement:"Tier 3: Win a Head-to-Head Rival Trial"},{id:"bt_09",order:9,title:"RELIC ARCHIVIST SUPREME",unlockRequirement:"Tier 3: Collect 4 Regional Championship trophies"},{id:"bt_10",order:10,title:"FIRST CITIZEN ARBITER",unlockRequirement:"Tier 4: Complete the World Tour Campaign"},{id:"bt_11",order:11,title:"UNPEELED SOVEREIGN",unlockRequirement:"Tier 5 Mythic: Win a Boss Showdown with zero lifelines"},{id:"bt_12",order:12,title:"POLYMATH SUPREME",unlockRequirement:"Tier 5 Mythic: Reach 1850+ Skill Rating across all 12 domains"}],oa=[{id:"bt_13",order:13,title:"VARSITY SCHOLAR",unlockRequirement:"Tier 1: Score 80%+ on a High School round"},{id:"bt_14",order:14,title:"DEAN'S LIST FELLOW",unlockRequirement:"Tier 2: Score 85%+ on a College round"},{id:"bt_15",order:15,title:"ROYAL CARTOGRAPHER",unlockRequirement:"Tier 3: Win 5 World Map Pin-Drop challenges"},{id:"bt_16",order:16,title:"MENSA GRANDMASTER",unlockRequirement:"Tier 4: Score 80%+ on a Mensa round"},{id:"bt_17",order:17,title:"SOVEREIGN OMNISCIENT",unlockRequirement:"Tier 5 Mythic: Complete Omniscient Mensa Polymath (#84)"}],na=[{id:"bt_18",order:18,title:"POWER PLAY HIGH ROLLER",unlockRequirement:"Tier 3: Win 3 Power Play wagers on the show board (#95)"},{id:"bt_19",order:19,title:"WORLD'S SMARTEST CHAMPION",unlockRequirement:"Tier 5 Mythic: Win the Tier 8 1.4 Billion Global Finale (#99)"}],ee=[...ra,...oa,...na],la=[{id:"GENEVA_CHAMPAGNE_24K",order:1,name:"Studio 24K Champagne Gold",primaryHex:"#f2cf7e",secondaryHex:"#d8af57",ringGlowRgba:"rgba(242, 207, 126, 0.36)",unlockRequirement:"Default Broadcast Stage Theme"},{id:"SOVEREIGN_PLATINUM_IVORY",order:2,name:"Sovereign Platinum & Ivory",primaryHex:"#eae6dc",secondaryHex:"#b8c4d4",ringGlowRgba:"rgba(234, 230, 220, 0.34)",unlockRequirement:"Tier 1: Set your Contestant Name or Passport"},{id:"HORIZON_ELECTRIC_CYAN",order:3,name:"Horizon Studio Cyan",primaryHex:"#64e6ff",secondaryHex:"#35a7db",ringGlowRgba:"rgba(100, 230, 255, 0.36)",unlockRequirement:"Tier 1: Pledge a League House"},{id:"AGORA_BOTANICAL_EMERALD",order:4,name:"Emerald Winner Spotlight",primaryHex:"#52eba8",secondaryHex:"#28b87a",ringGlowRgba:"rgba(82, 235, 168, 0.35)",unlockRequirement:"Tier 2: Reach 25 lifetime correct answers"},{id:"TOKYO_VERMILION_EMBER",order:5,name:"Tokyo Prime-Time Vermilion",primaryHex:"#ff9d5c",secondaryHex:"#e05263",ringGlowRgba:"rgba(255, 157, 92, 0.36)",unlockRequirement:"Tier 2: Clear both London & Tokyo Tour Stops"},{id:"CAIRO_SOLAR_AMBER",order:6,name:"Cairo Pavilion Solar Amber",primaryHex:"#ffcf56",secondaryHex:"#d98a2b",ringGlowRgba:"rgba(255, 207, 86, 0.38)",unlockRequirement:"Tier 3: Reach Round 50 in Endless Mode"},{id:"REYKJAVIK_BOREALIS_VIOLET",order:7,name:"Borealis Stage Violet-Teal",primaryHex:"#b494ff",secondaryHex:"#5ce1e6",ringGlowRgba:"rgba(180, 148, 255, 0.38)",unlockRequirement:"Tier 4: Reach 1750+ Skill Rating across 6 domains"},{id:"MYTHIC_PRISMATIC_DIAMOND",order:8,name:"Mythic Celestial Diamond",primaryHex:"#fff8e7",secondaryHex:"#9ef2ff",ringGlowRgba:"rgba(255, 248, 231, 0.44)",unlockRequirement:"Tier 5 Mythic: Lightning Buzzer Savant (10 straight under 3s)"}],ca=[{id:"BLUEPRINT_SAPPHIRE_DRAFT",order:9,name:"Sapphire Visual Stage",primaryHex:"#5ce1ff",secondaryHex:"#2589c7",ringGlowRgba:"rgba(92, 225, 255, 0.38)",unlockRequirement:"Tier 1: Solve your first Visual Spotter diagram (#74)"},{id:"CARTOGRAPHER_MERCATOR_GOLD",order:10,name:"World Atlas Mercator Gold",primaryHex:"#f5cb6e",secondaryHex:"#39d49a",ringGlowRgba:"rgba(245, 203, 110, 0.40)",unlockRequirement:"Tier 2: Map Bullseye within 300 km (#71)"},{id:"MENSA_OBSIDIAN_ULTRAVIOLET",order:11,name:"Mensa Obsidian Ultraviolet",primaryHex:"#d0a8ff",secondaryHex:"#64e6ff",ringGlowRgba:"rgba(208, 168, 255, 0.42)",unlockRequirement:"Tier 3: Score 80%+ on a Graduate round (#68)"}],da=[{id:"STUDIO_SPOTLIGHT_GOLD",order:12,name:"Prime-Time Spotlight Gold",primaryHex:"#ffd866",secondaryHex:"#f59f2a",ringGlowRgba:"rgba(255, 216, 102, 0.44)",unlockRequirement:"Tier 2: Land 3 Pinpoint Dial Bullseyes (#93)"},{id:"SIX_WEDGE_PRISM_CROWN",order:13,name:"Six-Wedge Championship Crown",primaryHex:"#67f0b8",secondaryHex:"#f5c451",ringGlowRgba:"rgba(103, 240, 184, 0.44)",unlockRequirement:"Tier 4: Collect all 6 Trivial Wedges on one board (#97)"}],V=[...la,...ca,...da];function zt(){const s=["GENEVA_CHAMPAGNE_24K"];try{if(typeof localStorage>"u")return s;const e=localStorage.getItem(qt);if(!e)return s;const a=JSON.parse(e);if(!Array.isArray(a))return s;for(const t of a)V.some(i=>i.id===t)&&!s.includes(t)&&s.push(t)}catch{}return s}function pa(s){const e=zt();if(e.includes(s))return!1;e.push(s);try{typeof localStorage<"u"&&localStorage.setItem(qt,JSON.stringify(e))}catch{}return!0}function tt(){try{if(typeof localStorage<"u"){const s=localStorage.getItem(Ut),e=V.find(a=>a.id===s);if(e)return e}}catch{}return V[0]}function Wt(s){const e=V.find(a=>a.id===s)??V[0];try{if(typeof localStorage<"u"&&localStorage.setItem(Ut,e.id),typeof document<"u"){const a=document.documentElement;a.style.setProperty("--gold-bright",e.primaryHex),a.style.setProperty("--gold-24k",e.secondaryHex),a.style.setProperty("--gold-glow",e.ringGlowRgba),a.style.setProperty("--ws-chrono-accent",e.primaryHex)}}catch{}return e}function ha(s){const a={medal_tier1_bronze:{c1:"#f0b67f",c2:"#8c4f27",rim:"#ffd5ab",ribbon:"#9e2638",glyph:'<polygon points="48,28 53,40 66,41 56,50 59,63 48,56 37,63 40,50 30,41 43,40" fill="#ffd5ab"/>'},medal_tier2_sterling:{c1:"#f2f7fc",c2:"#6e8299",rim:"#ffffff",ribbon:"#1f4478",glyph:'<polygon points="48,26 55,40 70,42 59,52 62,67 48,59 34,67 37,52 26,42 41,40" fill="#ffffff"/>'},medal_tier3_gold:{c1:"#fff0ad",c2:"#b38124",rim:"#fff8d6",ribbon:"#166347",glyph:'<polygon points="48,24 54,39 70,39 57,49 62,65 48,55 34,65 39,49 26,39 42,39" fill="#39d49a"/>'},medal_tier4_sapphire:{c1:"#8ce6ff",c2:"#1a498a",rim:"#dff8ff",ribbon:"#2a2259",glyph:'<polygon points="48,23 60,46 48,69 36,46" fill="#dff8ff"/>'},medal_tier5_mythic:{c1:"#fff8eb",c2:"#7a52cc",rim:"#ffe89e",ribbon:"#401b6b",glyph:'<polygon points="48,22 63,46 48,70 33,46" fill="#fffdf7"/><circle cx="48" cy="46" r="6" fill="#f2cf7e"/>'},trophy_streak_chronometer:{c1:"#ffe799",c2:"#9e6c1c",rim:"#fff6cf",ribbon:"#7d2029",glyph:'<circle cx="48" cy="46" r="14" fill="none" stroke="#fff6cf" stroke-width="3"/><path d="M48,46 L48,36 M48,46 L56,49" stroke="#fff6cf" stroke-width="2.6" stroke-linecap="round"/>'},trophy_overclock_roulette:{c1:"#ffb86b",c2:"#9e2638",rim:"#ffe699",ribbon:"#591624",glyph:'<path d="M51,26 L37,48 L48,48 L45,68 L61,44 L49,44 Z" fill="#fff6cf"/>'},trophy_polymath_globe:{c1:"#9ef5d8",c2:"#1b6b5c",rim:"#ffe89e",ribbon:"#17455e",glyph:'<circle cx="48" cy="46" r="14" fill="none" stroke="#fff6cf" stroke-width="2.2"/><ellipse cx="48" cy="46" rx="7" ry="14" fill="none" stroke="#fff6cf" stroke-width="1.8"/><line x1="34" y1="46" x2="62" y2="46" stroke="#fff6cf" stroke-width="1.8"/>'}}[s],t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="mg_${s}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${a.c1}"/>
        <stop offset="100%" stop-color="${a.c2}"/>
      </linearGradient>
    </defs>
    <polygon points="34,6 62,6 56,30 40,30" fill="${a.ribbon}" stroke="${a.rim}" stroke-width="1.2"/>
    <circle cx="48" cy="48" r="30" fill="url(#mg_${s})" stroke="${a.rim}" stroke-width="2.6"/>
    <circle cx="48" cy="48" r="24" fill="rgba(8,11,18,0.42)" stroke="${a.rim}" stroke-width="1" stroke-dasharray="3 2"/>
    ${a.glyph}
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(t)}`}function ua(s){return Object.values(s.visas).filter(e=>e.cleared).length}function kt(s){const e=new Set([...s.passport.unlockedRelics,...s.blackboard?.unlockedRelics??[]]);for(const a of Object.values(s.passport.visas))(a.cleared||a.relicUnlocked)&&e.add(a.relicId);return e.size}function ma(s){let e=1200;for(let a=0;a<12;a++)e=Math.max(e,s.analytics.byDomain[a]?.peakElo??1200,s.passport.domainElo[a]??1200);return e}function Et(s,e){let a=0;for(let t=0;t<12;t++)Math.max(s.analytics.byDomain[t]?.peakElo??1200,s.passport.domainElo[t]??1200)>=e&&(a+=1);return a}function fa(s){let e=0;for(let a=0;a<12;a++)(s.analytics.byDomain[a]?.right??0)>=1&&(e+=1);return e}function ga(s){let e=s.feats.duelChallengesPlayed??0,a=s.feats.duelGhostWins??0,t=s.feats.srsReviewsCompleted??0,i=0,r=0,n=s.feats.offlinePacksCached??0,o=s.feats.clueLadderStep1Snipes??0,p=s.feats.mindGambitsActivated??0,d=s.feats.secondWindSaves??0,l=s.feats.finaleCategoryWins??0;try{if(typeof localStorage<"u"){const m=localStorage.getItem("ws_duel_rivals_v2");if(m){const g=JSON.parse(m),v=Array.isArray(g?.history)?g.history.length:0,k=Array.isArray(g?.history)?g.history.filter(w=>w?.winner==="PLAYER").length:0;let f=0,b=0;if(g?.rivalsById&&typeof g.rivalsById=="object")for(const w of Object.values(g.rivalsById))f+=Math.max(0,Math.floor(Number(w?.totalDuels)||0)),b+=Math.max(0,Math.floor(Number(w?.lossesAgainstPlayer)||0));e=Math.max(e,v,f),a=Math.max(a,k,b)}const c=localStorage.getItem("ws_spaced_repetition_v2");if(c){const g=JSON.parse(c);if(Array.isArray(g?.cards)){let v=0,k=0;for(const f of g.cards)v+=Math.max(0,Math.floor(Number(f?.totalReviews)||0)),Number(f?.box)===5&&(k+=1);t=Math.max(t,v),i=Math.max(i,k)}}const u=localStorage.getItem("ws_question_feedback_v1");if(u){const g=JSON.parse(u);g?.entries&&typeof g.entries=="object"&&(r=Object.keys(g.entries).length)}const y=localStorage.getItem("ws_offline_packs_v2");if(y){const g=JSON.parse(y);Array.isArray(g)?n=Math.max(n,g.length):g&&typeof g=="object"&&Array.isArray(g.packs)&&(n=Math.max(n,g.packs.length))}const x=localStorage.getItem("ws_mind_gambits_v3");if(x){const g=JSON.parse(x);g&&typeof g=="object"&&(p=Math.max(p,Math.floor(Number(g.gambitsUsedCount??g.totalActivations??g.activations??g.usedCount)||0)),d=Math.max(d,Math.floor(Number(g.secondWindSaves)||0)),o=Math.max(o,Math.floor(Number(g.firstClueSnipes??g.clueSnipes)||0)),l=Math.max(l,Math.floor(Number(g.finaleWins)||0)))}}}catch{}return{duelTotalPlayed:e,duelPlayerWins:a,srsTotalReviews:t,srsBox5Mastered:i,feedbackRatingsCount:r,offlinePacksCount:n,clueLadderStep1Snipes:o,mindGambitsActivated:p,secondWindSaves:d,finaleCategoryWins:l}}const ba=[{id:"t1_first_lock",number:1,title:"First Answer Locked",description:"Lock your first correct answer in any game mode.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.totalRight,reward:{broadcastTitle:"GENEVA CHARTER INITIATE",rewardLabel:"Title: GENEVA CHARTER INITIATE"}},{id:"t1_first_peel",number:2,title:"Lifeline Tactician",description:"Use a Clue or 50/50 lifeline to crack a tough question.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.byPeelTier[2].right+s.analytics.byPeelTier[3].right},{id:"t1_first_overclock",number:3,title:"Double Down Debut",description:"Win your first 2× Double Down wager.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.overclock.overclockWins},{id:"t1_passport_stamp",number:4,title:"Contestant Badge Signed",description:"Set your Contestant Name or stamp your World Tour Passport.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.feats.passportStamped||s.passport.hasCustomName||s.passport.persona?1:0,reward:{hudThemeId:"SOVEREIGN_PLATINUM_IVORY",rewardLabel:"HUD Theme: Sovereign Platinum & Ivory"}},{id:"t1_geneva_cleared",number:5,title:"Opening Audition Cleared",description:"Complete the 4-question opening tryout round.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.feats.prologueCleared||s.passport.visas.ch?.cleared?1:0,reward:{prismFinishId:"DAMASCUS_STEEL_AMBER",rewardLabel:"Stage Finish: Damascus Steel & Amber"}},{id:"t1_first_daily",number:6,title:"Daily Show Debut",description:"Complete your first synchronized 00:00 UTC Daily Global Challenge.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:s=>Math.max(s.analytics.feats.dailyBroadcastsCompleted,s.passport.dailyHistory.length)},{id:"t1_first_briefing",number:7,title:"Topic Picker Warmup",description:"Clear 5 questions in Single Topic practice mode.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:s=>s.analytics.byMode.BRIEFING.right},{id:"t1_first_endless",number:8,title:"First Survival Checkpoint",description:"Reach Round 5 or clear 5 questions in Endless Mode.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:s=>Math.max(s.analytics.feats.maxEndlessDepth,s.analytics.byMode.ENDLESS.right)},{id:"t1_first_trials",number:9,title:"Rival Arena Contender",description:"Clear 5 questions in Head-to-Head Rival Trials.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:s=>s.analytics.byMode.TRIALS.right},{id:"t1_backstage_1",number:10,title:"Green Room Scout",description:"Complete your first Backstage rival interview.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.feats.backstageInterrogations},{id:"t1_uv_scan_1",number:11,title:"Trophy Case Inspector",description:"Inspect a trophy under UV light inside the 3D Gallery.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.feats.uvScansCount},{id:"t1_atelier_equip",number:12,title:"Stage Stylist",description:"Equip a custom metallic finish in the Trophy Atelier.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.feats.atelierFinishesEquipped},{id:"t1_faction_pledge",number:13,title:"League House Pledge",description:"Choose your banner house: Sovereign, Horizon, or Agora.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.feats.factionPledged||s.blackboard?.pledgedFaction?1:0,reward:{hudThemeId:"HORIZON_ELECTRIC_CYAN",rewardLabel:"HUD Theme: Horizon Studio Cyan"}},{id:"t1_bookmark_1",number:14,title:"Aha! Moment Collector",description:"Bookmark a favorite fact debrief to your personal study deck.",tier:"TIER_1_EASY",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.passport.bookmarks.length},{id:"t2_streak_5",number:15,title:"Five in a Row",description:"Answer 5 questions correctly in a row.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"medal_tier2_sterling",target:5,measure:s=>s.analytics.bestStreak},{id:"t2_streak_10",number:16,title:"Ten-Question Hot Streak",description:"Answer 10 questions correctly in a row.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:10,measure:s=>s.analytics.bestStreak,reward:{prismFinishId:"STERLING_CHRONOMETER_RHODIUM",rewardLabel:"Stage Finish: Rhodium & Sterling"}},{id:"t2_max6x_1",number:17,title:"Full-Stakes High Roller",description:"Win a full-conviction 2× Double Down wager with zero lifelines used.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:1,measure:s=>s.analytics.overclock.max6xWins,reward:{broadcastTitle:"CONVICTION HIGH-ROLLER",rewardLabel:"Title: CONVICTION HIGH-ROLLER"}},{id:"t2_bluff_echo_1",number:18,title:"Cool-Headed Fakeout",description:"Cancel a live Double Down wager before locking in to bait a rival.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:1,measure:s=>s.analytics.feats.bluffEchoCancels},{id:"t2_call_bluff_1",number:19,title:"Bluff Buster",description:"Spot a rival tell and catch a live stage bluff.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:1,measure:s=>s.analytics.feats.rivalBluffsCaught,reward:{prismFinishId:"BLACK_SALON_CRIMSON_OBSIDIAN",broadcastTitle:"FORENSIC TELL READER",rewardLabel:"Stage Finish: Crimson Obsidian + Title: FORENSIC TELL READER"}},{id:"t2_perfect_match",number:20,title:"Clean Sweep Five",description:"Finish any 5+ question round with 100% accuracy.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"medal_tier2_sterling",target:1,measure:s=>s.analytics.feats.perfectMatchesCount},{id:"t2_act1_cleared",number:21,title:"International Qualifier",description:"Clear both London and Tokyo international tour stops.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:2,measure:s=>(s.passport.visas.gb?.cleared?1:0)+(s.passport.visas.jp?.cleared?1:0),reward:{prismFinishId:"KYOTO_URUSHI_KINTSUGI",hudThemeId:"TOKYO_VERMILION_EMBER",rewardLabel:"Stage Finish: Kyoto Kintsugi + Theme: Tokyo Vermilion"}},{id:"t2_archive_15",number:22,title:"Endless Runner XV",description:"Survive to Round 15 in Endless Mode.",tier:"TIER_2_MEDIUM",aspect:"MODES_TRIALS",emblemKey:"medal_tier2_sterling",target:15,measure:s=>s.analytics.feats.maxEndlessDepth,reward:{broadcastTitle:"ARCHIVE VAULT DELVER",rewardLabel:"Title: ARCHIVE VAULT DELVER"}},{id:"t2_calibrator_bullseye",number:23,title:"Dead-Center Dial",description:"Hit an exact bullseye on an Estimation or Pinpoint Dial.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:1,measure:s=>Math.max(s.analytics.feats.calibratorBullseyes,s.analytics.feats.pinpointBullseyes??0)},{id:"t2_codex_first_try",number:24,title:"First-Try Pairing",description:"Lock a clean first-try match pair with zero lifelines used.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:1,measure:s=>Math.max(s.analytics.feats.codexFirstTryLocks,s.analytics.feats.match4CleanSweeps??0)},{id:"t2_gauntlet_10",number:25,title:"Rapid-Fire Finisher",description:"Clear 10 Rapid-Fire or Multi-Strike questions accurately.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:10,measure:s=>Math.max(s.analytics.byArchetype.GAUNTLET_SHATTER.right,s.analytics.byFormat?.MULTI_STRIKE?.right??0)},{id:"t2_cold_instinct_10",number:26,title:"Pure Knowledge X",description:"Clear 10 questions cleanly with zero lifelines used.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:10,measure:s=>s.analytics.byPeelTier[1].right,reward:{broadcastTitle:"COLD INSTINCT SPECIALIST",rewardLabel:"Title: COLD INSTINCT SPECIALIST"}},{id:"t2_correct_25",number:27,title:"Quarter-Century Quizzer",description:"Reach 25 lifetime correct answers across all modes.",tier:"TIER_2_MEDIUM",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier2_sterling",target:25,measure:s=>s.analytics.totalRight,reward:{hudThemeId:"AGORA_BOTANICAL_EMERALD",rewardLabel:"HUD Theme: Emerald Winner Spotlight"}},{id:"t2_clues_4",number:28,title:"Case File Sleuth",description:"Uncover 4 secret backstage clues on the Evidence Board.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:4,measure:s=>s.blackboard?.unlockedEvidenceClues.length??0},{id:"t3_streak_20",number:29,title:"Twenty-Question Heater",description:"Answer 20 questions correctly in a row.",tier:"TIER_3_HARD",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:20,measure:s=>s.analytics.bestStreak,reward:{prismFinishId:"CONSUL_MALACHITE_VERDIGRIS",rewardLabel:"Stage Finish: Malachite & Bronze"}},{id:"t3_triple_6x_match",number:30,title:"Triple Double-Down Surge",description:"Win 3 full-stakes Double Down wagers inside a single match.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:1,measure:s=>s.analytics.feats.max3x6xInSingleMatch?1:0,reward:{prismFinishId:"SOLAR_OCULUS_WHITE_GOLD",rewardLabel:"Stage Finish: Solar White-Gold"}},{id:"t3_flawless_boss",number:31,title:"Untouched Champion",description:"Win a Boss Showdown without losing a single shield.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:1,measure:s=>s.analytics.feats.flawlessBossWins},{id:"t3_correct_100",number:32,title:"Century Club",description:"Reach 100 lifetime correct answers.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:100,measure:s=>s.analytics.totalRight},{id:"t3_domain_elo_1500",number:33,title:"Domain Specialist",description:"Reach 1500 Skill Rating in any trivia domain.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:1500,measure:s=>ma(s),reward:{broadcastTitle:"CONSUL OF THE TWELVE",rewardLabel:"Title: CONSUL OF THE TWELVE"}},{id:"t3_relics_4",number:34,title:"Four-City Trophy Holder",description:"Collect 4 Regional Championship trophies for your Gallery.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:4,measure:s=>kt(s),reward:{broadcastTitle:"RELIC ARCHIVIST SUPREME",rewardLabel:"Title: RELIC ARCHIVIST SUPREME"}},{id:"t3_archive_50",number:35,title:"Endless Marathon L",description:"Survive to Round 50 in Endless Mode.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:50,measure:s=>s.analytics.feats.maxEndlessDepth,reward:{hudThemeId:"CAIRO_SOLAR_AMBER",rewardLabel:"HUD Theme: Cairo Pavilion Solar Amber"}},{id:"t3_ghost_win_1",number:36,title:"Duel Victor",description:"Defeat a recorded Challenger in Head-to-Head Rival Trials.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:1,measure:s=>s.analytics.feats.ghostTrialWins,reward:{broadcastTitle:"BLACK SALON SHARK",rewardLabel:"Title: BLACK SALON SHARK"}},{id:"t3_fast_under3s_15",number:37,title:"Lightning Buzzer",description:"Lock 15 correct answers in under 3.0 seconds each.",tier:"TIER_3_HARD",aspect:"STREAK_SPEED",emblemKey:"medal_tier3_gold",target:15,measure:s=>s.analytics.speedBuckets[0].right},{id:"t3_all_12_domains_1",number:38,title:"All-Twelve Polymath",description:"Answer at least 1 question correctly in all 12 trivia domains.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:12,measure:s=>s.analytics.byDomain.filter(e=>e.right>=1).length,reward:{prismFinishId:"IMPERIAL_EMERALD_BRASS",rewardLabel:"Stage Finish: Imperial Emerald & Brass"}},{id:"t3_daily_5",number:39,title:"Daily Show Regular",description:"Complete 5 Daily Global Challenges.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:5,measure:s=>Math.max(s.analytics.feats.dailyBroadcastsCompleted,s.passport.dailyHistory.length)},{id:"t3_hero_synth_3",number:40,title:"Finale Chain Master",description:"Clear 3 multi-step Championship Finale chain clues.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier3_gold",target:3,measure:s=>s.analytics.byArchetype.HERO_ARTIFACT_SYNTHESIS.right},{id:"t3_backstage_6",number:41,title:"Studio Insider",description:"Complete 6 Backstage rival interviews across the World Tour.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:6,measure:s=>s.analytics.feats.backstageInterrogations},{id:"t3_visas_5",number:42,title:"World Tour Globetrotter",description:"Earn 5 International Tour Stamps in your Passport.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:5,measure:s=>Math.max(ua(s.passport),s.analytics.feats.worldTourTiersCleared??0),reward:{prismFinishId:"PHARAONIC_LAPIS_ELECTRUM",rewardLabel:"Stage Finish: Pharaonic Lapis & Electrum"}},{id:"t4_streak_35",number:43,title:"Thirty-Five Unbroken",description:"Answer 35 questions correctly in a row.",tier:"TIER_4_VERY_RARE",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:35,measure:s=>s.analytics.bestStreak,reward:{prismFinishId:"ARBITER_SMOKED_SAPPHIRE_PLATINUM",rewardLabel:"Stage Finish: Smoked Sapphire & Platinum"}},{id:"t4_soren_coin_defeat",number:44,title:"Master Bluff Hunter",description:"Read Soren Kael’s coin tell and beat him, or catch 3 live rival bluffs.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:3,measure:s=>s.analytics.feats.sorenCoinBluffDefeated?3:s.analytics.feats.rivalBluffsCaught},{id:"t4_campaign_complete",number:45,title:"World Tour Finisher",description:"Complete the World Tour Campaign Finale.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:1,measure:s=>s.analytics.feats.campaignCompleted||s.analytics.feats.worldSmartestChampionWon||s.passport.visas.global?.cleared||(s.blackboard?.achievedEndings.length??0)>0?1:0,reward:{broadcastTitle:"FIRST CITIZEN ARBITER",rewardLabel:"Title: FIRST CITIZEN ARBITER"}},{id:"t4_all_8_relics_24_latches",number:46,title:"Grand Vault Curator",description:"Collect all 8 Championship trophies and unlock all 24 display latches.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:24,measure:s=>kt(s)>=8?s.analytics.feats.openedLatchKeys.length:Math.min(23,s.analytics.feats.openedLatchKeys.length)},{id:"t4_correct_500_acc80",number:47,title:"High Accuracy Laureate",description:"Reach 500 lifetime correct answers while holding 80%+ accuracy.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier4_sapphire",target:500,measure:s=>{const e=s.analytics.totalRight+s.analytics.totalWrong;return(e>0?s.analytics.totalRight/e:0)>=.8?s.analytics.totalRight:Math.min(499,s.analytics.totalRight)}},{id:"t4_six_domains_1750",number:48,title:"Six-Domain Ace",description:"Reach 1750+ Skill Rating across at least 6 trivia domains.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:6,measure:s=>Et(s,1750),reward:{hudThemeId:"REYKJAVIK_BOREALIS_VIOLET",rewardLabel:"HUD Theme: Borealis Stage Violet-Teal"}},{id:"t4_archive_100",number:49,title:"Centurion of Endless",description:"Survive to Round 100 in Endless Mode.",tier:"TIER_4_VERY_RARE",aspect:"MODES_TRIALS",emblemKey:"medal_tier4_sapphire",target:100,measure:s=>s.analytics.feats.maxEndlessDepth},{id:"t4_black_salon_champ",number:50,title:"High-Stakes Knockout Champion",description:"Win an underground High-Stakes Knockout match.",tier:"TIER_4_VERY_RARE",aspect:"MODES_TRIALS",emblemKey:"medal_tier4_sapphire",target:1,measure:s=>s.analytics.feats.blackSalonWins},{id:"t4_overclock_wins_50",number:51,title:"Fiftyfold High Roller",description:"Win 50 2× Double Down wagers.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:50,measure:s=>s.analytics.overclock.overclockWins},{id:"t4_cold_instinct_100",number:52,title:"Hundredfold Pure Instinct",description:"Clear 100 questions cleanly with zero lifelines used.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier4_sapphire",target:100,measure:s=>s.analytics.byPeelTier[1].right},{id:"t4_clues_12",number:53,title:"Mystery Unmasked",description:"Collect all 12 Backstage Clues on the Evidence Board.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:12,measure:s=>s.blackboard?.unlockedEvidenceClues.length??0,reward:{prismFinishId:"AURORA_DICHROIC_TITANIUM",rewardLabel:"Stage Finish: Aurora Dichroic Titanium"}},{id:"t4_bullseyes_10",number:54,title:"Master Pinpoint Ace",description:"Land 10 exact bullseyes on Estimation or Pinpoint Dials.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier4_sapphire",target:10,measure:s=>Math.max(s.analytics.feats.calibratorBullseyes,s.analytics.feats.pinpointBullseyes??0)},{id:"t5_unpeeled_sovereign",number:55,title:"No-Lifeline Sovereign",description:"Win a Boss Showdown with zero lifelines used — 100% pure knowledge!",tier:"TIER_5_MYTHIC",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier5_mythic",target:1,measure:s=>s.analytics.feats.unpeeledBossWins,reward:{prismFinishId:"CELESTIAL_DIAMOND_SOVEREIGN",broadcastTitle:"UNPEELED SOVEREIGN",rewardLabel:"Mythic Finish: Celestial Diamond + Title: UNPEELED SOVEREIGN"}},{id:"t5_horological_perfection",number:56,title:"Fiftyfold Perfection",description:"Answer 50 consecutive questions without a single miss.",tier:"TIER_5_MYTHIC",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:50,measure:s=>s.analytics.bestStreak,reward:{prismFinishId:"CELESTIAL_DIAMOND_SOVEREIGN",rewardLabel:"Mythic Finish: Celestial Diamond & 24K"}},{id:"t5_polymath_supreme",number:57,title:"Polymath Supreme",description:"Reach 1850+ Genius Skill Rating across ALL 12 trivia domains.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:12,measure:s=>Et(s,1850),reward:{broadcastTitle:"POLYMATH SUPREME",rewardLabel:"Mythic Title: POLYMATH SUPREME"}},{id:"t5_6x_russian_roulette",number:58,title:"Five-Straight All-In",description:"Win 5 consecutive full-stakes Double Down wagers without a miss.",tier:"TIER_5_MYTHIC",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:5,measure:s=>s.analytics.overclock.bestConsecutiveMax6xWins},{id:"t5_lightning_savant",number:59,title:"Lightning Buzzer Savant",description:"Lock 10 consecutive correct answers each in under 3.0 seconds.",tier:"TIER_5_MYTHIC",aspect:"STREAK_SPEED",emblemKey:"medal_tier5_mythic",target:10,measure:s=>s.analytics.bestFastUnder3sStreak,reward:{hudThemeId:"MYTHIC_PRISMATIC_DIAMOND",rewardLabel:"Mythic HUD Theme: Celestial Diamond"}},{id:"t5_architect_succession",number:60,title:"Secret Finale Unlocked",description:"Uncover all 12 Backstage Clues and unlock the Secret 4th Ending.",tier:"TIER_5_MYTHIC",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier5_mythic",target:2,measure:s=>{const e=(s.blackboard?.unlockedEvidenceClues.length??0)>=12?1:0,a=s.blackboard?.achievedEndings.includes("ARCHITECT_SUCCESSION")||s.analytics.feats.achievedEndings.includes("ARCHITECT_SUCCESSION")?1:0;return e+a}},{id:"t5_meridian_leviathan",number:61,title:"Endless Legend CC",description:"Survive all the way to Round 200 in Endless Mode.",tier:"TIER_5_MYTHIC",aspect:"MODES_TRIALS",emblemKey:"medal_tier5_mythic",target:200,measure:s=>s.analytics.feats.maxEndlessDepth},{id:"t5_fourfold_destiny",number:62,title:"Fourfold Ending Master",description:"Unlock all 4 World Tour endings across replays.",tier:"TIER_5_MYTHIC",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier5_mythic",target:4,measure:s=>new Set([...s.blackboard?.achievedEndings??[],...s.analytics.feats.achievedEndings]).size},{id:"t5_centurion_million",number:63,title:"One Thousand Unique Facts",description:"Answer 1,000 unique verified trivia questions correctly.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:1e3,measure:s=>s.analytics.uniqueSolvedCount},{id:"t5_grand_completionist",number:64,title:"Core Hall Completionist",description:"Unlock all 63 Core Trophies & Medals (#1–#63) in the Hall of Honours.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier5_mythic",target:63,measure:()=>0}],ya=[{id:"v2_diff_middle_school",number:65,packId:"v2.0",title:"Honor Roll Foundations",description:"Complete a calibrated Middle School difficulty round.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.analytics.feats.difficultyRoundsCleared?.MIDDLE_SCHOOL??0},{id:"v2_diff_high_school",number:66,packId:"v2.0",title:"Varsity Letterman",description:"Achieve 80% or higher accuracy on a High School difficulty round.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:80,measure:s=>s.analytics.feats.difficultyBestAccuracyPct?.HIGH_SCHOOL??0,reward:{broadcastTitle:"VARSITY SCHOLAR",rewardLabel:"Title: VARSITY SCHOLAR"}},{id:"v2_diff_college",number:67,packId:"v2.0",title:"Dean's List Summa Cum Laude",description:"Achieve 85% or higher accuracy on a College difficulty round.",tier:"TIER_2_MEDIUM",aspect:"MODES_TRIALS",emblemKey:"medal_tier2_sterling",target:85,measure:s=>s.analytics.feats.difficultyBestAccuracyPct?.COLLEGE??0,reward:{broadcastTitle:"DEAN'S LIST FELLOW",rewardLabel:"Title: DEAN'S LIST FELLOW"}},{id:"v2_diff_graduate",number:68,packId:"v2.0",title:"Doctoral Defense",description:"Achieve 80% or higher accuracy on a Graduate difficulty round.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:80,measure:s=>s.analytics.feats.difficultyBestAccuracyPct?.GRADUATE??0,reward:{hudThemeId:"MENSA_OBSIDIAN_ULTRAVIOLET",rewardLabel:"HUD Theme: Mensa Obsidian Ultraviolet"}},{id:"v2_diff_mensa",number:69,packId:"v2.0",title:"Mensa 99th-Percentile Laureate",description:"Achieve 80% or higher accuracy on a Mensa Grandmaster round.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier4_sapphire",target:80,measure:s=>s.analytics.feats.difficultyBestAccuracyPct?.MENSA??0,reward:{broadcastTitle:"MENSA GRANDMASTER",prismFinishId:"MENSA_QUANTUM_IRIDIUM_GLASS",rewardLabel:"Title: MENSA GRANDMASTER + Finish: Quantum Iridium"}},{id:"v2_globe_first_pin",number:70,packId:"v2.0",title:"First Map Pinpoint",description:"Win your first World Map Pin-Drop geography challenge.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_polymath_globe",target:1,measure:s=>s.analytics.byArchetype.GLOBE_PIN_DROP?.right??0},{id:"v2_globe_bullseye_300",number:71,packId:"v2.0",title:"Map Bullseye Sharpshooter",description:"Drop a Map Pin within 300 km of the target for a Bullseye Pinpoint.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_polymath_globe",target:1,measure:s=>s.analytics.feats.globeBullseyes300Km??0,reward:{hudThemeId:"CARTOGRAPHER_MERCATOR_GOLD",rewardLabel:"HUD Theme: World Atlas Mercator Gold"}},{id:"v2_globe_royal_cartographer",number:72,packId:"v2.0",title:"Royal Cartographer",description:"Win 5 World Map Pin-Drop challenges across the world tour.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:5,measure:s=>s.analytics.byArchetype.GLOBE_PIN_DROP?.right??0,reward:{broadcastTitle:"ROYAL CARTOGRAPHER",rewardLabel:"Title: ROYAL CARTOGRAPHER"}},{id:"v2_globe_zero_lat_surveyor",number:73,packId:"v2.0",title:"No-Lifeline Grand Surveyor",description:"Land a zero-lifeline World Map Pin-Drop Bullseye within 120 km.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier4_sapphire",target:1,measure:s=>s.analytics.feats.globeNoPeel120Km??0},{id:"v2_visual_sapphire_analyst",number:74,packId:"v2.0",title:"Visual Spotter Debut",description:"Solve your first illustrated Visual Spotter diagram question.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:s=>Math.max(s.analytics.feats.visualBlueprintsSolved??0,s.analytics.byFormat?.VISUAL_SPOTTER?.right??0),reward:{hudThemeId:"BLUEPRINT_SAPPHIRE_DRAFT",rewardLabel:"HUD Theme: Sapphire Visual Stage"}},{id:"v2_visual_master_architect",number:75,packId:"v2.0",title:"Master Visual Analyst",description:"Solve 10 Visual Spotter questions across science, sports & landmarks.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier3_gold",target:10,measure:s=>Math.max(s.analytics.feats.visualBlueprintsSolved??0,s.analytics.byFormat?.VISUAL_SPOTTER?.right??0),reward:{prismFinishId:"SAPPHIRE_BLUEPRINT_CYANOTYPE",rewardLabel:"3D Finish: Sapphire Blueprint Cyanotype"}},{id:"v2_jeopardy_lateral_virtuoso",number:76,packId:"v2.0",title:"Six-Domain Cold Streak",description:"Clear 25 questions with zero lifelines spanning at least 6 domains.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:25,measure:s=>{const e=s.analytics.byPeelTier[1]?.right??0;return(s.analytics.feats.tier1ColdDomains?.length??0)>=6?e:Math.min(24,e)}},{id:"v2_duel_gauntlet_thrown",number:77,packId:"v2.0",title:"Gauntlet Thrown",description:"Issue or compete in a 1-Tap Head-to-Head Duel Link challenge.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.v2Stores.duelTotalPlayed},{id:"v2_duel_ghost_breaker",number:78,packId:"v2.0",title:"Duel Split Breaker",description:"Defeat a Challenger Ghost in a Head-to-Head 1v1 Duel.",tier:"TIER_2_MEDIUM",aspect:"MODES_TRIALS",emblemKey:"medal_tier2_sterling",target:1,measure:s=>s.v2Stores.duelPlayerWins,reward:{prismFinishId:"DUELIST_BLOODSTONE_PLATINUM",rewardLabel:"3D Finish: Duelist Bloodstone & Platinum"}},{id:"v2_duel_rival_nemesis",number:79,packId:"v2.0",title:"Undisputed Rival Nemesis",description:"Claim 5 Head-to-Head 1v1 Duel victories against Challengers.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:5,measure:s=>s.v2Stores.duelPlayerWins},{id:"v2_srs_vault_initiate",number:80,packId:"v2.0",title:"Study Deck Initiate",description:"Complete your first review in the 5-Box Spaced-Repetition Study Deck.",tier:"TIER_1_EASY",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.v2Stores.srsTotalReviews},{id:"v2_srs_box5_polymath",number:81,packId:"v2.0",title:"Box-5 Mastery Polymath",description:"Promote 5 missed cards to Box 5 Mastered in your Study Deck.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:5,measure:s=>s.v2Stores.srsBox5Mastered,reward:{prismFinishId:"NEURAL_ENGRAM_AMETHYST_GOLD",rewardLabel:"3D Finish: Neural Engram Amethyst & 24K"}},{id:"v2_editorial_arbiter",number:82,packId:"v2.0",title:"Editorial Arbiter",description:"Submit 5 question quality ratings (Upvote or Flag) to help curate trivia.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:5,measure:s=>s.v2Stores.feedbackRatingsCount},{id:"v2_jetsetter_offline_vault",number:83,packId:"v2.0",title:"Offline Travel Pack",description:"Save an Offline Pack so you can play anywhere without Wi-Fi.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.v2Stores.offlinePacksCount},{id:"v2_omniscient_mensa_polymath",number:84,packId:"v2.0",title:"Omniscient Mensa Polymath",description:"Win across all 12 trivia domains, score 80%+ in Mensa tier, and master a Box-5 review card.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier5_mythic",target:14,measure:s=>{const e=fa(s),a=(s.analytics.feats.difficultyBestAccuracyPct?.MENSA??0)>=80?1:0,t=s.v2Stores.srsBox5Mastered>=1?1:0;return e+a+t},reward:{broadcastTitle:"SOVEREIGN OMNISCIENT",rewardLabel:"Mythic Title: SOVEREIGN OMNISCIENT"}}],va=[{id:"v3_clue_ladder_first_snipe",number:85,packId:"v3.0",title:"First-Clue Sharpshooter",description:"Solve a 3-Clue Escalator question on Clue 1 (3× payout) without extra clues.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:s=>s.v2Stores.clueLadderStep1Snipes},{id:"v3_clue_ladder_apex_sniper",number:86,packId:"v3.0",title:"Apex Clue Sniper",description:"Land 5 Clue-1 solves on 3-Clue Escalator questions in any game mode.",tier:"TIER_3_HARD",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:5,measure:s=>s.v2Stores.clueLadderStep1Snipes},{id:"v3_mind_gambit_tactician",number:87,packId:"v3.0",title:"Power-Up Tactician",description:"Activate a Tactical Mind Gambit (Second Wind, Swap, or Surge) in a live match.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:s=>Math.max(s.v2Stores.mindGambitsActivated,s.v2Stores.secondWindSaves)},{id:"v3_mind_gambit_grandmaster",number:88,packId:"v3.0",title:"Grandmaster of Gambits",description:"Activate 5 Tactical Gambits or win 3 Finale Category Picker showdowns.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:5,measure:s=>Math.max(s.v2Stores.mindGambitsActivated,Math.min(5,s.v2Stores.finaleCategoryWins*2))}],wa=[{id:"v4_match4_clean_sweep",number:89,packId:"v4.0",title:"Match-4 Clean Sweep",description:"Pair all 4 clues without a single mismatch in a Match-4 round.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:s=>Math.max(s.analytics.feats.match4CleanSweeps??0,s.analytics.byFormat?.MATCH_4?.right??0)},{id:"v4_match4_virtuoso",number:90,packId:"v4.0",title:"Grand Match-4 Virtuoso",description:"Pull off 5 spotless Match-4 Clean Sweeps across any mode.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier3_gold",target:5,measure:s=>s.analytics.feats.match4CleanSweeps??0},{id:"v4_sort4_timeline_master",number:91,packId:"v4.0",title:"Timeline Sort-4 Master",description:"Place all 4 cards in exact chronological or ranked order on 3 Sort-4 rounds.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:3,measure:s=>Math.max(s.analytics.feats.sort4PerfectRuns??0,s.analytics.byFormat?.SORT_4?.right??0)},{id:"v4_imposter_detective",number:92,packId:"v4.0",title:"Imposter Detective",description:"Expose the hidden imposter or sweep every true clue across 3 Multi-Strike rounds.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:3,measure:s=>Math.max(s.analytics.feats.imposterCatches??0,s.analytics.byFormat?.MULTI_STRIKE?.right??0)},{id:"v4_pinpoint_bullseye",number:93,packId:"v4.0",title:"Pinpoint Bullseye",description:"Hit 3 exact 2× bullseyes on the Pinpoint Dial.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:3,measure:s=>Math.max(s.analytics.feats.pinpointBullseyes??0,s.analytics.feats.calibratorBullseyes??0),reward:{hudThemeId:"STUDIO_SPOTLIGHT_GOLD",rewardLabel:"Stage Theme: Prime-Time Spotlight Gold"}},{id:"v4_padlock_breaker",number:94,packId:"v4.0",title:"Padlock Breaker",description:"Shatter 5 locked vault tiles by solving adjacent clues on the show board.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:s=>s.analytics.feats.padlocksShattered??0},{id:"v4_power_play_high_roller",number:95,packId:"v4.0",title:"Power Play High Roller",description:"Win 3 high-stakes Power Play wagers on the game-show board.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:3,measure:s=>Math.max(s.analytics.feats.powerPlayBigWagerWins??0,s.analytics.feats.powerPlayWins??0),reward:{broadcastTitle:"POWER PLAY HIGH ROLLER",rewardLabel:"Title: POWER PLAY HIGH ROLLER"}},{id:"v4_challenger_trap_survivor",number:96,packId:"v4.0",title:"Trap Breaker",description:"Survive and win 3 Challenger weak-spot forced turns or frozen-column ambushes.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:3,measure:s=>s.analytics.feats.challengerTrapSurvivals??0},{id:"v4_six_wedge_crown",number:97,packId:"v4.0",title:"Six-Wedge Trivial Crown",description:"Collect all 6 colored category wedges on a single championship show board.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:1,measure:s=>s.analytics.feats.full6WedgeCrowns??0,reward:{hudThemeId:"SIX_WEDGE_PRISM_CROWN",rewardLabel:"Crown Theme: Six-Wedge Championship Crown"}},{id:"v4_seven_format_showstopper",number:98,packId:"v4.0",title:"Seven-Format Showstopper",description:"Win at least one question in all 7 formats (4-Choice, Match-4, Sort-4, Multi-Strike, Pinpoint, 3-Clue, Visual).",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier4_sapphire",target:7,measure:s=>He.filter(e=>(s.analytics.byFormat?.[e]?.right??0)>=1).length},{id:"v4_worlds_smartest_champion",number:99,packId:"v4.0",title:"1.4 Billion World's Smartest Champion",description:"Win the Tier 8 Global Finale in front of 1.4 billion viewers to claim the $10,000,000 crown.",tier:"TIER_5_MYTHIC",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier5_mythic",target:1,measure:s=>s.analytics.feats.worldSmartestChampionWon||(s.analytics.feats.worldTourTiersCleared??0)>=8||s.analytics.feats.campaignCompleted||s.passport.visas.global?.cleared?1:0,reward:{broadcastTitle:"WORLD'S SMARTEST CHAMPION",rewardLabel:"Mythic Title: WORLD'S SMARTEST CHAMPION"}},{id:"v4_centennial_hall_legend",number:100,packId:"v4.0",title:"Centennial Hall Legend",description:"Unlock 75 total Trophies & Medals across the 100-Trophy Hall of Honours.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier5_mythic",target:75,measure:()=>0}],xa=[{packId:"v1.0",label:"Core Show Floor Honours",honours:ba},{packId:"v2.0",label:"Difficulty Ladder, Atlas & Duels Expansion",honours:ya},{packId:"v3.0",label:"Clue Escalator & Tactical Gambits Expansion",honours:va},{packId:"v4.0",label:"World's Smartest v4.0 7-Format & Gimmick Board Expansion",honours:wa}],Ne=xa.flatMap(s=>s.honours),Ha=Ne;function Vt(){return Ne.length}function Yt(){return U.length+ee.length+V.length}class Sa{analyticsStore;passport;blackboard;unlockedTimestamps;constructor(e,a,t){this.analyticsStore=e,this.passport=a,this.blackboard=t,this.unlockedTimestamps=this.load();const i=tt();i.id!=="GENEVA_CHAMPAGNE_24K"&&Wt(i.id),this.evaluateAndUnlock(!0)}load(){try{if(typeof localStorage>"u")return{};const e=localStorage.getItem(St);if(!e)return{};const a=JSON.parse(e);if(a?.unlockedTimestamps&&typeof a.unlockedTimestamps=="object")return{...a.unlockedTimestamps}}catch{}return{}}save(){try{if(typeof localStorage<"u"){const e={unlockedTimestamps:this.unlockedTimestamps};localStorage.setItem(St,JSON.stringify(e))}}catch{}}applyRewardGrant(e){const a=e.reward;a&&(a.prismFinishId&&Ds(a.prismFinishId),a.broadcastTitle&&this.passport.unlockTitleCrest(a.broadcastTitle,!1),a.hudThemeId&&pa(a.hudThemeId))}buildEvaluationContext(){const e=this.analyticsStore.getSnapshot();return{analytics:e,passport:this.passport.getSnapshot(),blackboard:this.blackboard?.getSnapshot()??null,v2Stores:ga(e)}}evaluateAndUnlock(e=!1){const a=this.buildEvaluationContext(),t=[],i=new Date().toISOString();let r=!1,n=0,o=0,p=null,d=null;for(const l of Ne){if(l.id==="t5_grand_completionist"){p=l;continue}if(l.id==="v4_centennial_hall_legend"){d=l;continue}const m=Math.max(0,Math.floor(l.measure(a))),c=!!this.unlockedTimestamps[l.id];(c||m>=l.target)&&(l.number>=1&&l.number<=63&&(n+=1),o+=1,c?this.applyRewardGrant(l):(this.unlockedTimestamps[l.id]=i,this.applyRewardGrant(l),r=!0,e||t.push(this.buildProgressItem(l,l.target))))}if(p){const l=!!this.unlockedTimestamps[p.id];(l||n>=p.target)&&(o+=1,l||(this.unlockedTimestamps[p.id]=i,this.applyRewardGrant(p),r=!0,e||t.push(this.buildProgressItem(p,p.target))))}if(d){const l=!!this.unlockedTimestamps[d.id];(l||o>=d.target)&&(l||(this.unlockedTimestamps[d.id]=i,this.applyRewardGrant(d),r=!0,e||t.push(this.buildProgressItem(d,d.target))))}return r&&this.save(),t}buildProgressItem(e,a){const t=this.unlockedTimestamps[e.id]??null,i=t!==null,r=i?e.target:Math.min(e.target,Math.max(0,Math.floor(a)));return{def:e,unlocked:i,unlockedAtIso:t,current:r,target:e.target,ratio:e.target>0?Math.min(1,r/e.target):1,emblemPngUrl:`./assets/medals/${e.emblemKey}.png`,emblemFallbackDataUri:ha(e.emblemKey)}}getAllProgress(){const e=this.buildEvaluationContext();let a=0,t=0;const i=[];for(const o of Ne){if(o.id==="t5_grand_completionist"||o.id==="v4_centennial_hall_legend"){i.push(this.buildProgressItem(o,0));continue}const p=this.buildProgressItem(o,o.measure(e));p.unlocked&&(t+=1,o.number>=1&&o.number<=63&&(a+=1)),i.push(p)}const r=i.findIndex(o=>o.def.id==="t5_grand_completionist");if(r>=0){const o=this.buildProgressItem(i[r].def,a);i[r]=o,o.unlocked&&(t+=1)}const n=i.findIndex(o=>o.def.id==="v4_centennial_hall_legend");return n>=0&&(i[n]=this.buildProgressItem(i[n].def,t)),i}}function ka(s){return s==="TROPHIES_64"||s==="TROPHIES"}const N={back:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>',close:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',fullscreen:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>',trophy:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 4h12v6a6 6 0 0 1-12 0V4Z"/><path d="M12 16v4"/><path d="M8 20h8"/></svg>',reward:'<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.1 8.4 22 9.3 17 14.1 18.2 21 12 17.7 5.8 21 7 14.1 2 9.3 8.9 8.4 12 2"/></svg>',cube3d:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2"/><path d="m3 7 9 5 9-5"/><path d="M12 12v10"/></svg>',orbit:'<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',check:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>',lock:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>'},he={TIER_1_EASY:"#d49254",TIER_2_MEDIUM:"#dce3ee",TIER_3_HARD:"#f4ce72",TIER_4_VERY_RARE:"#69b8ff",TIER_5_MYTHIC:"#d896ff"};function Ea(s){if(!(typeof document>"u"))try{document.fullscreenElement?(document.exitFullscreen?.().catch(()=>{}),s.setAttribute("aria-pressed","false"),s.classList.remove("is-active-emerald")):(document.documentElement.requestFullscreen?.().catch(()=>{}),s.setAttribute("aria-pressed","true"),s.classList.add("is-active-emerald"))}catch{}}class Aa{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};activeTab="TROPHIES_64";tierFilter="ALL";aspectFilter="ALL";contextLabel=null;trophy3DDockActive=!1;trophyReqToken=0;constructor(e){this.deps=e,de()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.activeTab=e.initialTab??"TROPHIES_64",this.tierFilter=e.initialTierFilter??"ALL",this.aspectFilter=e.initialAspectFilter??"ALL",this.contextLabel=e.initialContextLabel?.trim()||null,this.trophy3DDockActive=!1,this.deps.honoursSystem.evaluateAndUnlock(!0);const a=document.createElement("div");a.className="ws-meta-backdrop ws-brass-backdrop",a.setAttribute("role","dialog"),a.setAttribute("aria-modal","true"),a.setAttribute("aria-label",`Hall of Honours — ${Vt()} Trophies & ${Yt()} Unlockables`),a.addEventListener("click",t=>{t.target===a&&!this.trophy3DDockActive&&this.handleClose()}),document.body.appendChild(a),this.modalBackdrop=a,this.detachEscape=ce(()=>this.handleBackOrClose()),this.renderInto(a,!0)}mount(e,a={}){this.unmount(),this.callbacks=a,this.activeTab=a.initialTab??"TROPHIES_64",this.tierFilter=a.initialTierFilter??"ALL",this.aspectFilter=a.initialAspectFilter??"ALL",this.contextLabel=a.initialContextLabel?.trim()||null,this.deps.honoursSystem.evaluateAndUnlock(!0),this.mountedContainer=e,this.renderInto(e,!1)}unmount(){this.trophyReqToken+=1,this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.syncUiRootVisibility(!1),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}syncUiRootVisibility(e){if(typeof document>"u")return;document.documentElement.classList.toggle("ws-3d-showcase-open",e);const a=document.getElementById("ui-root");a&&(a.style.visibility=e?"hidden":"visible")}async toggle3DTrophyShowcase(){this.trophy3DDockActive=!this.trophy3DDockActive;const e=++this.trophyReqToken;this.rerender(),this.trophy3DDockActive&&this.deps.stage3d&&(await this.deps.stage3d.showChampionshipTrophy(0),e!==this.trophyReqToken||this.isOpen())}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}this.handleClose()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}rerender(){this.modalBackdrop?(this.modalBackdrop.className=this.trophy3DDockActive?"ws-meta-backdrop ws-brass-backdrop is-stage-dock":"ws-meta-backdrop ws-brass-backdrop",this.syncUiRootVisibility(this.trophy3DDockActive),this.renderInto(this.modalBackdrop,!0)):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,a){const t=this.deps.honoursSystem.getAllProgress(),i=t.length,r=t.filter(b=>b.unlocked).length,n=Ye(this.deps.passport,this.deps.blackboard),o=this.deps.passport.getSnapshot(),p=zt(),d=n.length,l=ee.length,m=V.length,c=d+l+m,u=ee.filter(b=>b.order===1||o.titleCrests.includes(b.title)).length,y=n.filter(b=>b.unlocked).length+u+p.length,x=ka(this.activeTab),g=typeof document<"u"&&!!document.fullscreenElement,v=`
      <div class="ws-meta-underline-tabs" role="tablist" aria-label="Hall of Honours Sections">
        <button type="button" role="tab" aria-selected="${x}" class="ws-meta-underline-tab ${x?"is-active":""}" data-honours-tab="TROPHIES_64">
          <span class="ws-brass-ico" aria-hidden="true">${N.trophy}</span>
          <span>${i} Trophies (${r}/${i})</span>
        </button>
        <button type="button" role="tab" aria-selected="${!x}" class="ws-meta-underline-tab ${x?"":"is-active"}" data-honours-tab="UNLOCKABLES_32">
          <span class="ws-brass-ico" aria-hidden="true">${N.reward}</span>
          <span>${c} Rewards (${y}/${c})</span>
        </button>
      </div>
    `,k=x?this.renderTrophiesGrid(t):this.renderUnlockablesStudio(n,o.titleCrests,o.activeTitleCrest,p);if(a&&this.trophy3DDockActive){const b=X("HONOURS",{isModal:!0,closeBtnId:"ws-honours-close",canNavigate:!!this.callbacks.onNavigateSection,floatingVariant:!0});e.innerHTML=`
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-honours-back" data-meta-back="true" aria-label="Back">
              <span class="ws-brass-ico" aria-hidden="true">${N.back}</span>
              <span>Back</span>
            </button>
            <div class="ws-meta-stage-actions">
              <button
                type="button"
                class="ws-meta-float-pill ${g?"is-active-gold":""}"
                data-v5-fullscreen-toggle="true"
                aria-pressed="${g}"
                aria-label="Toggle Fullscreen"
              >
                <span class="ws-brass-ico" aria-hidden="true">${N.fullscreen}</span>
              </button>
              ${b}
              <button type="button" class="ws-meta-float-pill" data-brass-close="true" aria-label="Close">
                <span class="ws-brass-ico" aria-hidden="true">${N.close}</span>
              </button>
            </div>
          </div>
          <div class="ws-meta-stage-bottom">
            <span class="ws-meta-orbit-whisper">
              <span class="ws-brass-ico" aria-hidden="true" style="margin-right:4px;vertical-align:-2px;">${N.orbit}</span>Drag 3D to Orbit
            </span>
            <div class="ws-meta-stage-actions">
              <button type="button" class="ws-meta-float-pill is-active-gold" id="ws-honours-3d-toggle">
                Full Hall
              </button>
            </div>
          </div>
        </div>

        <div class="ws-meta-sheet ws-brass-ledger">
          <div class="ws-meta-drag-handle" aria-hidden="true"></div>
          ${v}
          <div class="ws-meta-body-scroll">
            ${k}
          </div>
        </div>
      `,this.bindEvents(e);return}const f=X("HONOURS",{isModal:a,closeBtnId:"ws-honours-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell ws-brass-ledger">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-honours-back" data-meta-back="true" aria-label="Back">
              <span class="ws-brass-ico" aria-hidden="true">${N.back}</span>
              <span class="ws-brass-back-lbl">Back</span>
            </button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">
                <span class="ws-brass-ico ws-brass-title-ico" aria-hidden="true">${N.trophy}</span>
                <span>HALL OF HONOURS</span>
              </h2>
              <div class="ws-meta-eyebrow">${r}/${i} Trophies · ${y}/${c} Rewards</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${this.deps.stage3d&&a?`<button type="button" class="ws-brass-clasp-btn" id="ws-honours-3d-toggle" aria-label="Toggle 3D Trophy Showcase">
                    <span class="ws-brass-ico" aria-hidden="true">${N.cube3d}</span>
                    <span>3D</span>
                  </button>`:""}
            <button
              type="button"
              class="ws-brass-clasp-btn is-icon-only ${g?"is-active-emerald":""}"
              data-v5-fullscreen-toggle="true"
              aria-pressed="${g}"
              aria-label="Toggle Fullscreen"
              title="Toggle Fullscreen"
            >
              <span class="ws-brass-ico" aria-hidden="true">${N.fullscreen}</span>
            </button>
            ${f}
            ${a?`<button type="button" class="ws-brass-clasp-btn is-icon-only is-close-clasp" data-brass-close="true" aria-label="Close Hall of Honours" title="Close">
                    <span class="ws-brass-ico" aria-hidden="true">${N.close}</span>
                  </button>`:""}
          </div>
        </div>

        ${v}

        <div class="ws-meta-body-scroll">
          ${k}
        </div>
      </div>
    `,this.bindEvents(e)}renderTrophiesGrid(e){const a=e.filter(i=>!(this.tierFilter!=="ALL"&&i.def.tier!==this.tierFilter||this.aspectFilter!=="ALL"&&i.def.aspect!==this.aspectFilter)),t=this.tierFilter!=="ALL"||this.aspectFilter!=="ALL";return`
      <!-- Carved Mahogany & Brass Filter Ribbons (44px+ Tactile Clasps) -->
      <div class="ws-meta-section" style="gap:8px;" data-honours-active-aspect="${this.aspectFilter}" data-honours-active-tier="${this.tierFilter}">
        ${t||this.contextLabel?`<div id="ws-honours-context-bar" class="ws-meta-note" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
                <span style="font-family:var(--ws5-font-mono);font-size:11px;color:var(--ws5-parchment-bright);">
                  ${this.contextLabel?`Related to ${h(this.contextLabel)} · `:""}Showing <strong>${a.length}</strong> of ${e.length} Trophies
                </span>
                <button type="button" class="ws-meta-inline-link" id="ws-honours-clear-filters">
                  <span class="ws-brass-ico" aria-hidden="true">${N.close}</span>
                  <span>Show All ${e.length}</span>
                </button>
              </div>`:""}
        <div class="ws-meta-hscroll" aria-label="Filter by Rarity Tier">
          ${[["ALL",`All ${e.length}`,null],["TIER_1_EASY","Bronze",he.TIER_1_EASY],["TIER_2_MEDIUM","Sterling",he.TIER_2_MEDIUM],["TIER_3_HARD","24K Gold",he.TIER_3_HARD],["TIER_4_VERY_RARE","Sapphire",he.TIER_4_VERY_RARE],["TIER_5_MYTHIC","Mythic 0.1%",he.TIER_5_MYTHIC]].map(([i,r,n])=>`
                <button type="button" class="ws-meta-chip ${this.tierFilter===i?"is-active":""}" data-tier-filter="${i}">
                  ${n?`<span class="ws-brass-tier-dot" style="background:${n};" aria-hidden="true"></span>`:""}
                  <span>${r}</span>
                </button>
              `).join("")}
        </div>

        <div class="ws-meta-hscroll" aria-label="Filter by Aspect">
          ${[["ALL","All Aspects"],["PRISM_OVERCLOCK","Formats & Wagers"],["STREAK_SPEED","Streak & Speed"],["CAMPAIGN_LORE","World Tour & Rivals"],["MODES_TRIALS","Modes & Boards"],["DOMAINS_POLYMATH","12 Domains"]].map(([i,r])=>`
                <button type="button" class="ws-meta-chip ${this.aspectFilter===i?"is-active":""}" data-aspect-filter="${i}">
                  ${r}
                </button>
              `).join("")}
        </div>
      </div>

      <!-- Velvet-Lined Mahogany & Brushed Brass Trophy Medallion Cabinet -->
      <div class="ws-meta-section" style="padding:12px;">
        <div class="ws-brass-trophy-grid">
          ${a.map(i=>{const r=Kt[i.def.tier],n=i.unlocked?"EARNED":`${Math.round(i.current)} / ${Math.round(i.target)}`;return`
                <article
                  class="ws-brass-trophy-card ${i.unlocked?"is-earned":""}"
                  data-trophy-id="${h(i.def.id)}"
                  style="--trophy-tier-hex:${r.colorHex};"
                >
                  <div class="ws-brass-medallion-well">
                    <img
                      src="${h(i.emblemPngUrl)}"
                      data-fallback-src="${h(i.emblemFallbackDataUri)}"
                      alt=""
                    />
                  </div>
                  <div class="ws-brass-trophy-body">
                    <div class="ws-brass-trophy-meta">
                      <span class="ws-brass-trophy-code" style="color:${r.colorHex};">
                        #${i.def.number} · ${h(r.shortLabel.toUpperCase())}
                      </span>
                      <span class="ws-brass-trophy-status ${i.unlocked?"is-earned":""}">
                        ${i.unlocked?`<span class="ws-brass-ico" aria-hidden="true" style="margin-right:3px;vertical-align:-1px;">${N.check}</span>`:""}${n}
                      </span>
                    </div>
                    <div class="ws-brass-trophy-title">
                      ${h(i.def.title)}
                    </div>
                    <div class="ws-brass-trophy-desc">
                      ${h(M(i.def.description))}
                    </div>
                    <div class="ws-meta-progress-track" style="margin-top:3px;">
                      <div class="ws-meta-progress-fill" style="width:${Math.round(i.ratio*100)}%;background:${i.unlocked?"linear-gradient(90deg, #168260 0%, #57e6ab 100%)":r.colorHex};"></div>
                    </div>
                    ${i.def.reward?`<div class="ws-brass-trophy-reward">
                            <span class="ws-brass-ico" aria-hidden="true">${N.reward}</span>
                            <span>${h(i.def.reward.rewardLabel)}</span>
                          </div>`:""}
                  </div>
                </article>
              `}).join("")}
        </div>
      </div>
    `}renderUnlockablesStudio(e,a,t,i){const r=tt(),n=e.length,o=ee.length,p=V.length,d=ee.filter(l=>l.order===1||a.includes(l.title)).length;return`
      <!-- 1. Stage & 3D Trophy Finishes (16 Finishes) -->
      <div class="ws-meta-section">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <h3 class="ws-meta-section-title">1. Stage &amp; 3D Trophy Finishes (${e.filter(l=>l.unlocked).length}/${n})</h3>
          ${this.callbacks.onNavigateSection?`<button type="button" class="ws-meta-inline-link" data-suite-nav="ATELIER">
                  <span class="ws-brass-ico" aria-hidden="true">${N.cube3d}</span>
                  <span>3D Atelier</span>
                </button>`:""}
        </div>
        <div class="ws-brass-rewards-grid">
          ${e.map(l=>`
                <button
                  type="button"
                  class="ws-brass-reward-plaque ${l.equipped?"is-focused":""}"
                  data-equip-finish="${l.spec.id}"
                  ${l.unlocked?"":"disabled"}
                >
                  <span style="display:inline-flex;align-items:center;gap:10px;min-width:0;">
                    <span style="width:24px;height:24px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,${l.spec.swatchPrimaryCss},${l.spec.swatchSecondaryCss});border:2px solid #d49c3b;box-shadow:inset 0 1px 0 rgba(255,240,184,0.45);"></span>
                    <span style="font-size:12.5px;font-weight:700;color:var(--ws5-parchment-bright);line-height:1.25;">${h(l.spec.name)}</span>
                  </span>
                  <span class="ws-brass-equip-badge ${l.equipped?"is-equipped":l.unlocked?"":"is-locked"}">
                    ${l.equipped?"EQUIPPED":l.unlocked?"EQUIP":`<span class="ws-brass-ico" aria-hidden="true">${N.lock}</span>`}
                  </span>
                </button>
              `).join("")}
        </div>
      </div>

      <!-- 2. Broadcast Show Titles (19 Titles) -->
      <div class="ws-meta-section">
        <h3 class="ws-meta-section-title">2. Broadcast Show Titles (${d}/${o})</h3>
        <div class="ws-brass-rewards-grid">
          ${ee.map(l=>{const m=l.order===1||a.includes(l.title),c=t===l.title;return`
              <button
                type="button"
                class="ws-brass-reward-plaque ${c?"is-focused":""}"
                data-equip-title="${h(l.title)}"
                ${m?"":"disabled"}
              >
                <span style="min-width:0;display:flex;flex-direction:column;gap:2px;">
                  <span style="font-family:var(--ws5-font-display);font-size:12px;font-weight:800;color:${c?"var(--ws5-brass-highlight)":"var(--ws5-parchment-bright)"};">
                    ${h(l.title)}
                  </span>
                  <span style="font-family:var(--ws5-font-mono);font-size:10px;color:var(--ws5-parchment-muted);">
                    ${h(M(l.unlockRequirement))}
                  </span>
                </span>
                <span class="ws-brass-equip-badge ${c?"is-equipped":m?"":"is-locked"}">
                  ${c?"EQUIPPED":m?"EQUIP":`<span class="ws-brass-ico" aria-hidden="true">${N.lock}</span>`}
                </span>
              </button>
            `}).join("")}
        </div>
      </div>

      <!-- 3. Stage & Crown HUD Themes (13 Themes) -->
      <div class="ws-meta-section">
        <h3 class="ws-meta-section-title">3. Stage &amp; Crown HUD Themes (${i.length}/${p})</h3>
        <div class="ws-brass-rewards-grid">
          ${V.map(l=>{const m=i.includes(l.id),c=r.id===l.id;return`
              <button
                type="button"
                class="ws-brass-reward-plaque ${c?"is-focused":""}"
                data-equip-theme="${l.id}"
                ${m?"":"disabled"}
              >
                <span style="display:inline-flex;align-items:center;gap:10px;min-width:0;">
                  <span style="width:22px;height:22px;border-radius:50%;background:${l.primaryHex};border:2px solid #d49c3b;box-shadow:0 0 0 2px ${l.secondaryHex};flex-shrink:0;"></span>
                  <span style="min-width:0;">
                    <span style="display:block;font-size:12.5px;font-weight:700;color:var(--ws5-parchment-bright);line-height:1.25;">${h(l.name)}</span>
                    <span style="display:block;font-family:var(--ws5-font-mono);font-size:10px;color:var(--ws5-parchment-muted);">${h(M(l.unlockRequirement))}</span>
                  </span>
                </span>
                <span class="ws-brass-equip-badge ${c?"is-equipped":m?"":"is-locked"}">
                  ${c?"EQUIPPED":m?"EQUIP":`<span class="ws-brass-ico" aria-hidden="true">${N.lock}</span>`}
                </span>
              </button>
            `}).join("")}
        </div>
      </div>
    `}bindEvents(e){e.querySelectorAll("img[data-fallback-src]").forEach(a=>{a.addEventListener("error",()=>{const t=a.dataset.fallbackSrc;t&&a.src!==t&&(a.src=t)},{once:!0})}),e.querySelector("#ws-honours-back")?.addEventListener("click",()=>this.handleBackOrClose()),e.querySelector('[data-brass-close="true"]')?.addEventListener("click",()=>this.handleClose()),e.querySelectorAll("[data-v5-fullscreen-toggle]").forEach(a=>{a.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),Ea(a)})}),e.querySelector("#ws-honours-3d-toggle")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.toggle3DTrophyShowcase()}),le(e,{closeBtnId:"ws-honours-close",onNavigate:a=>this.callbacks.onNavigateSection?.(a),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll(".ws-meta-body-scroll [data-suite-nav]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.suiteNav;t&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onNavigateSection?.(t))})}),e.querySelectorAll("[data-honours-tab]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.honoursTab;!t||t===this.activeTab||(this.activeTab=t,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-tier-filter]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.tierFilter;t&&(this.tierFilter=t,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelector("#ws-honours-clear-filters")?.addEventListener("click",()=>{this.tierFilter="ALL",this.aspectFilter="ALL",this.contextLabel=null,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelectorAll("[data-aspect-filter]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.aspectFilter;t&&(this.aspectFilter=t,t==="ALL"&&(this.contextLabel=null),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-equip-finish]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.equipFinish;if(!t)return;const i=Ot(t);this.deps.blackboard?.unlockSkin(i.legacyBlackboardSkinId,!0),this.deps.stage3d&&Le(this.deps.stage3d,i,{updateDomainPalette:!1}),this.deps.haptics?.lockThunk(),this.deps.audio?.playSfx("vault_thunk"),this.callbacks.onEquipSkin?.(i),this.rerender()})}),e.querySelectorAll("[data-equip-title]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.equipTitle;t&&(this.deps.passport.unlockTitleCrest(t,!0),this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp"),this.callbacks.onEquipBroadcastTitle?.(t),this.rerender())})}),e.querySelectorAll("[data-equip-theme]").forEach(a=>{a.addEventListener("click",()=>{const t=a.dataset.equipTheme;if(!t)return;const i=Wt(t);this.deps.haptics?.sightlineSnap(),this.deps.audio?.playSfx("sightline_snap"),this.callbacks.onEquipHudTheme?.(i),this.rerender()})})}}function _a(){if(typeof document>"u"||document.getElementById("ws-honour-toast-styles"))return;const s=document.createElement("style");s.id="ws-honour-toast-styles",s.textContent=`
    .ws-honour-toast-host {
      position: fixed;
      top: calc(env(safe-area-inset-top, 0px) + 74px);
      right: max(12px, env(safe-area-inset-right, 12px));
      left: max(12px, env(safe-area-inset-left, 12px));
      transform: none;
      z-index: 95;
      width: auto;
      max-width: 366px;
      margin-left: auto;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      box-sizing: border-box;
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-honour-toast-host {
        top: calc(env(safe-area-inset-top, 0px) + 46px);
        left: auto;
        right: max(12px, env(safe-area-inset-right, 12px));
        transform: none;
        width: min(280px, calc(100vw - 24px));
        max-width: 280px;
      }
      .ws-honour-toast-card {
        min-height: 44px;
        padding: 6px 10px;
        gap: 8px;
      }
    }

    /* Hide rival/actor tell strip cleanly while an Honour citation toast occupies the upper slot (zero text bleed!) */
    body.ws-honour-toast-active .ws-actor-tell-cluster,
    body.ws-honour-toast-active .ws-rival-strip,
    body:has(.ws-honour-toast-card.is-visible) .ws-actor-tell-cluster,
    body:has(.ws-honour-toast-card.is-visible) .ws-rival-strip {
      opacity: 0 !important;
      pointer-events: none !important;
      transition: opacity 0.12s ease !important;
    }

    .ws-honour-toast-card {
      pointer-events: auto;
      width: 100%;
      box-sizing: border-box;
      min-height: 52px;
      padding: 8px 12px;
      border-radius: 12px;
      background: linear-gradient(165deg, #351d0e 0%, #1d0e06 100%);
      border: 1.5px solid #dfaa44;
      border-left: 4px solid var(--toast-accent, #f2cf7e);
      box-shadow:
        0 14px 34px rgba(0, 0, 0, 0.86),
        inset 0 0 0 1px rgba(232, 197, 116, 0.22);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      opacity: 1;
      animation: wsHonourToastIn 0.24s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .ws-honour-toast-card.is-leaving {
      animation: wsHonourToastOut 0.22s ease-in forwards;
    }

    @keyframes wsHonourToastIn {
      from {
        opacity: 1;
        transform: translateY(-10px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes wsHonourToastOut {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
      }
    }
  `,document.head.appendChild(s)}class Ia{options;hostEl=null;queue=[];activeTimer=null;showing=!1;constructor(e={}){this.options=e,_a()}enqueue(e){if(!(!e||e.length===0||typeof document>"u")){for(const a of e)this.queue.some(t=>t.def.id===a.def.id)||this.queue.push(a);this.showing||this.presentNext()}}ensureHost(){if(this.hostEl&&document.body.contains(this.hostEl))return this.hostEl;const e=document.createElement("div");return e.className="ws-honour-toast-host",e.setAttribute("aria-live","polite"),document.body.appendChild(e),this.hostEl=e,e}setBodyToastActive(e){typeof document>"u"||!document.body||document.body.classList.toggle("ws-honour-toast-active",e)}presentNext(){const e=this.queue.shift();if(!e){this.showing=!1,this.setBodyToastActive(!1);return}this.showing=!0,this.setBodyToastActive(!0);const a=this.ensureHost(),t=Kt[e.def.tier];this.options.haptics?.correctBloom(),this.options.audio?.playSfx("gold_resonance");const i=document.createElement("div");i.className="ws-honour-toast-card ws-unlock-toast is-visible",i.style.setProperty("--toast-accent",t.colorHex),i.innerHTML=`
      <img
        src="${h(e.emblemPngUrl)}"
        data-fallback-src="${h(e.emblemFallbackDataUri)}"
        alt=""
        style="width:38px;height:38px;object-fit:contain;flex-shrink:0;"
      />
      <div style="min-width:0;flex:1 1 auto;">
        <div style="font-family:var(--font-mono,monospace);font-size:9px;font-weight:800;letter-spacing:0.08em;color:${t.colorHex};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          TROPHY UNLOCKED · STAGE HONOURS
        </div>
        <div style="font-family:var(--font-display,Georgia,serif);font-size:13px;font-weight:800;color:var(--ivory-primary,#f6f2e9);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${h(e.def.title)}
        </div>
        ${e.def.reward?`<div style="font-family:var(--font-mono,monospace);font-size:10px;color:var(--emerald-win,#39d49a);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ✦ +${h(e.def.reward.rewardLabel)}
              </div>`:`<div style="font-size:10.5px;color:var(--ivory-muted,#b8b2a6);line-height:1.22;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${h(e.def.description)}
              </div>`}
      </div>
    `;const r=i.querySelector("img[data-fallback-src]");r?.addEventListener("error",()=>{const o=r.dataset.fallbackSrc;o&&r.src!==o&&(r.src=o)},{once:!0});const n=(o=!1)=>{this.activeTimer&&(clearTimeout(this.activeTimer),this.activeTimer=null),i.classList.remove("is-visible"),i.classList.add("is-leaving"),setTimeout(()=>{i.remove(),o&&this.options.onInspectHonour?.(e.def.id),this.presentNext()},220)};i.addEventListener("click",()=>n(!0)),a.appendChild(i),this.activeTimer=setTimeout(()=>n(!1),3600)}dispose(){this.activeTimer&&(clearTimeout(this.activeTimer),this.activeTimer=null),this.queue=[],this.showing=!1,this.setBodyToastActive(!1),this.hostEl&&(this.hostEl.remove(),this.hostEl=null)}}const xe="ws_question_feedback_v1",jt=new Set(["UPVOTE","FLAG"]),Ra=new Set(["AWKWARD_PHRASING","TOO_OBVIOUS","DISPUTED_FACT","DUPLICATE_FEEL"]),At=2500,Ta=180,Ca=64;let Xe=null,Be=null,ge=new Map;const Pe=new Set;function Qt(){try{if(typeof globalThis<"u"&&"localStorage"in globalThis&&globalThis.localStorage)return globalThis.localStorage}catch{}return null}function La(){const s=Qt();if(s)try{return s.getItem(xe)}catch{return Xe}return Xe}function Xt(s){Xe=s;const e=Qt();if(e)try{s===null?e.removeItem(xe):e.setItem(xe,s)}catch{}}function Jt(s){if(!s||typeof s!="object")return null;const e=s,a=Math.trunc(Number(e.qid));if(!Number.isFinite(a)||a<=0)return null;const t=String(e.vote??"").toUpperCase();if(!jt.has(t))return null;const i=t,r=typeof e.reason=="string"?e.reason.toUpperCase():"",n=i==="FLAG"?Ra.has(r)?r:"AWKWARD_PHRASING":void 0,o=e.domainId!==void 0&&e.domainId!==null?Math.trunc(Number(e.domainId)):NaN,p=Number.isFinite(o)&&o>=0&&o<=11?o:void 0,d=typeof e.subcatLabel=="string"&&e.subcatLabel.trim().length>0?e.subcatLabel.trim().slice(0,Ca):void 0,l=typeof e.promptSnippet=="string"&&e.promptSnippet.trim().length>0?e.promptSnippet.replace(/\s+/g," ").trim().slice(0,Ta):void 0,m=Number(e.updatedAtMs),c=Number.isFinite(m)&&m>0?Math.trunc(m):Date.now(),u=typeof e.updatedAtIso=="string"&&e.updatedAtIso.trim().length>0?e.updatedAtIso.trim():new Date(c).toISOString(),y={qid:a,vote:i,updatedAtMs:c,updatedAtIso:u};return n!==void 0&&(y.reason=n),p!==void 0&&(y.domainId=p),d!==void 0&&(y.subcatLabel=d),l!==void 0&&(y.promptSnippet=l),y}function Se(){const s=La();if(s===Be)return ge;const e=new Map;if(s)try{const a=JSON.parse(s),t=a&&typeof a=="object"&&"entries"in a&&a.entries&&typeof a.entries=="object"?a.entries:a;if(t&&typeof t=="object")for(const i of Object.values(t)){const r=Jt(i);r&&e.set(r.qid,r)}}catch{}return Be=s,ge=e,ge}function Ma(s){if(s.size>At){const i=Array.from(s.values()).sort((r,n)=>r.vote!==n.vote?r.vote==="FLAG"?-1:1:n.updatedAtMs-r.updatedAtMs);s.clear();for(let r=0;r<Math.min(i.length,At);r++)s.set(i[r].qid,i[r])}const e={};for(const[i,r]of s.entries())e[String(i)]=r;const a={schemaVersion:xe,updatedAtIso:new Date().toISOString(),entries:e},t=JSON.stringify(a);ge=s,Be=t,Xt(t)}function Zt(){if(Pe.size===0)return;const s=es();for(const e of Pe)try{e(s)}catch{}}function Fa(s){const e=Math.trunc(Number(s.qid));if(!Number.isFinite(e)||e<=0||!jt.has(s.vote))return;const a=new Map(Se()),t=Date.now(),i=a.get(e),r=Jt({qid:e,vote:s.vote,reason:s.vote==="FLAG"?s.reason??i?.reason??"AWKWARD_PHRASING":void 0,domainId:s.domainId??i?.domainId,subcatLabel:s.subcatLabel??i?.subcatLabel,promptSnippet:s.promptSnippet??i?.promptSnippet,updatedAtMs:t,updatedAtIso:new Date(t).toISOString()});r&&(a.set(e,r),Ma(a),Zt())}function Oa(s){const e=Math.trunc(Number(s));return!Number.isFinite(e)||e<=0?null:Se().get(e)?.vote??null}function Ga(s){const e=Math.trunc(Number(s));if(!Number.isFinite(e)||e<=0)return null;const a=Se().get(e);return a?{...a}:null}function Ua(s){return Oa(s)==="FLAG"}function qa(){const s=Se(),e=new Set;for(const[a,t]of s.entries())t.vote==="FLAG"&&e.add(a);return e}function es(){const s=Se();let e=0,a=0;const t=[];for(const i of s.values())i.vote==="UPVOTE"?e+=1:i.vote==="FLAG"&&(a+=1),t.push({...i});return t.sort((i,r)=>r.updatedAtMs-i.updatedAtMs||i.qid-r.qid),{upvotes:e,flagged:a,entries:t}}function Ka(){const s=es(),e=s.entries.filter(t=>t.vote==="FLAG").map(t=>t.qid).sort((t,i)=>t-i),a={AWKWARD_PHRASING:0,TOO_OBVIOUS:0,DISPUTED_FACT:0,DUPLICATE_FEEL:0};for(const t of s.entries)t.vote==="FLAG"&&t.reason&&t.reason in a&&(a[t.reason]+=1);return JSON.stringify({schemaVersion:xe,exportedAtIso:new Date().toISOString(),totals:{totalRated:s.entries.length,upvotes:s.upvotes,flagged:s.flagged},flagReasons:a,quarantinedQids:e,entries:s.entries},null,2)}function za(){ge=new Map,Be=null,Xt(null),Zt()}function Wa(s){return Pe.add(s),()=>{Pe.delete(s)}}class Va{passportBook;observatory;atelier;factions;analyticsStore;analyticsView;honoursSystem;honoursView;toastOverlay;srsEngine;deps;callbacks;navStack=[];currentSection=null;historyGuardArmed=!1;boundPopState;constructor(e,a={}){this.deps=e,this.callbacks=a,this.analyticsStore=new Ks(e.passport),this.srsEngine=new Rt(e.passport),this.honoursSystem=new Sa(this.analyticsStore,e.passport,e.blackboard),this.toastOverlay=new Ia({audio:e.audio,haptics:e.haptics,onInspectHonour:()=>{this.openHonours("TROPHIES_64")}}),this.passportBook=new xs({passport:e.passport,blackboard:e.blackboard,audio:e.audio,haptics:e.haptics,visaStampUrls:e.visaStampUrls}),this.observatory=new Rs({passport:e.passport,srsEngine:this.srsEngine,stage3d:e.stage3d,blackboard:e.blackboard,audio:e.audio,haptics:e.haptics}),this.srsEngine.subscribe(()=>{this.evaluateHonoursAndToast()}),this.atelier=new Ps({passport:e.passport,stage3d:e.stage3d,blackboard:e.blackboard,audio:e.audio,haptics:e.haptics}),this.factions=new qs({passport:e.passport,blackboard:e.blackboard,trialsMode:e.trialsMode,audio:e.audio,haptics:e.haptics,factionCrestUrls:e.factionCrestUrls}),this.analyticsView=new ia({store:this.analyticsStore,passport:e.passport,srsEngine:this.srsEngine,audio:e.audio,haptics:e.haptics}),this.honoursView=new Aa({honoursSystem:this.honoursSystem,passport:e.passport,blackboard:e.blackboard,stage3d:e.stage3d,audio:e.audio,haptics:e.haptics}),this.boundPopState=()=>{if(!this.isOpen()){this.historyGuardArmed=!1;return}this.navStack.length>0?(this.armHistoryGuard(!0),this.goBack()):(this.historyGuardArmed=!1,this.closeAll(!0))},typeof window<"u"&&window.addEventListener("popstate",this.boundPopState)}dispose(){this.closeAll(!1),this.toastOverlay.dispose(),typeof window<"u"&&window.removeEventListener("popstate",this.boundPopState)}setCallbacks(e){this.callbacks=e}isOpen(){return this.passportBook.isOpen()||this.observatory.isOpen()||this.atelier.isOpen()||this.factions.isOpen()||this.analyticsView.isOpen()||this.honoursView.isOpen()}canGoBack(){return this.navStack.length>0}goBack(){const e=this.navStack.pop();if(!e)return this.closeAll(!0),!1;if(e.section==="PASSPORT")return this.openPassport(e.passportTab??"CREDENTIALS",!1,!1),!0;if(e.section==="ANALYTICS"&&e.analyticsFilter){const a=e.analyticsFilter;return this.openAnalytics(a.range,!1,{initialDomainId:a.domainId,initialSubcatLabel:a.subcatLabel,initialArchetype:a.archetype,initialQuestionFormat:a.questionFormat??null,initialPeelTier:a.peelTier,initialOutcome:a.outcome,initialSpeedBucket:a.speedBucket}),!0}return this.openSectionInternal(e.section,!1),!0}armHistoryGuard(e=!1){if(!(typeof window>"u"||!window.history?.pushState)&&(!this.historyGuardArmed||e))try{window.history.pushState({__wsMetaSuite:!0},""),this.historyGuardArmed=!0}catch{}}prepareTransitionTo(e,a){const t=this.isOpen();if(a&&t&&this.currentSection&&this.currentSection!==e){const i=this.navStack[this.navStack.length-1];if(!i||i.section!==this.currentSection){const r={section:this.currentSection};this.currentSection==="PASSPORT"?r.passportTab=this.passportBook.getActiveTab():this.currentSection==="ANALYTICS"&&(r.analyticsFilter=this.analyticsView.getFilterState()),this.navStack.push(r),this.navStack.length>16&&this.navStack.shift()}}else t||(this.navStack=[],this.historyGuardArmed=!1);this.armHistoryGuard(!1),this.closeViewsOnly(),this.currentSection=e}sync3DShowcaseClass(e){typeof document>"u"||document.documentElement.classList.toggle("ws-3d-showcase-open",e)}resetSuiteNavigationState(e=!1){this.navStack=[],this.currentSection=null,this.historyGuardArmed=!1,this.sync3DShowcaseClass(!1),e&&this.callbacks.onCloseSuite?.()}closeViewsOnly(){this.passportBook.close(),this.observatory.close(),this.atelier.close(),this.factions.close(),this.analyticsView.close(),this.honoursView.close()}closeAll(e=!1){this.closeViewsOnly(),this.resetSuiteNavigationState(e)}openSection(e){this.openSectionInternal(e,!0)}openSectionInternal(e,a){switch(e){case"PASSPORT":this.openPassport("CREDENTIALS",!1,a);break;case"OBSERVATORY":this.openObservatory("RELICS_3D","championship_trophy",a);break;case"ATELIER":this.openAtelier(a);break;case"FACTIONS":this.openFactions(a);break;case"ANALYTICS":this.openAnalytics("ALL_TIME",a);break;case"HONOURS":this.openHonours("TROPHIES_64","ALL",a);break}}openPassport(e="CREDENTIALS",a=!1,t=!0){this.prepareTransitionTo("PASSPORT",t),a&&this.recordSpecialFeat("PASSPORT_STAMPED"),this.passportBook.open({initialTab:e,playStampCeremonyOnOpen:a,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onPassportStamped:()=>{this.recordSpecialFeat("PASSPORT_STAMPED")},onRenameChallenger:i=>{this.recordSpecialFeat("PASSPORT_STAMPED"),this.callbacks.onRenameChallenger?.(i)},onInspectRelicInObservatory:i=>this.openObservatory("RELICS_3D",i,!0),onOpenDomainAnalytics:i=>this.openAnalytics("ALL_TIME",!0,{initialDomainId:i}),onNavigateSection:i=>this.openSection(i),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openObservatory(e="RELICS_3D",a="championship_trophy",t=!0,i){this.prepareTransitionTo("OBSERVATORY",t),this.sync3DShowcaseClass(e==="RELICS_3D"),this.observatory.open({initialTab:e,initialArtifactId:a,initialDomainId:i,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onInspectRelic:r=>this.callbacks.onInspectRelic?.(r),onUvScan:r=>{this.recordSpecialFeat("UV_RELIC_SCANNED",{relicId:r})},onLatchesOpened:r=>{r!=="championship_trophy"&&this.recordSpecialFeat("RELIC_LATCH_OPENED",{relicId:r,latchCount:3})},onLaunchLivePrismReview:this.callbacks.onLaunchLivePrismReview?r=>{this.resetSuiteNavigationState(!1),this.callbacks.onLaunchLivePrismReview?.(r)}:void 0,onNavigateSection:r=>this.openSection(r),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openAtelier(e=!0){this.prepareTransitionTo("ATELIER",e),this.sync3DShowcaseClass(!0),this.atelier.open({canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onEquipSkin:a=>{this.recordSpecialFeat("ATELIER_SKIN_EQUIPPED"),this.callbacks.onEquipSkin?.(a)},onNavigateSection:a=>this.openSection(a),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openFactions(e=!0){this.prepareTransitionTo("FACTIONS",e),this.sync3DShowcaseClass(!1),this.factions.open({canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onPledgeFaction:a=>{this.recordSpecialFeat("FACTION_PLEDGED"),this.callbacks.onPledgeFaction?.(a)},onLaunchGhostDuel:a=>{this.resetSuiteNavigationState(!1),this.callbacks.onLaunchGhostDuel?.(a)},onLaunchBlackSalon:()=>{this.resetSuiteNavigationState(!1),this.callbacks.onLaunchBlackSalon?.()},onNavigateSection:a=>this.openSection(a),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openAnalytics(e="ALL_TIME",a=!0,t){this.prepareTransitionTo("ANALYTICS",a),this.sync3DShowcaseClass(!1),this.analyticsView.open({initialRange:e,...t,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onPracticeSlice:i=>{this.closeViewsOnly(),this.resetSuiteNavigationState(!1),this.callbacks.onPracticeSlice?.(i)},onOpenMissedCards:i=>{this.openObservatory("SELF_QUIZ","championship_trophy",!0,i)},onOpenRelatedHonours:i=>{this.openHonours("TROPHIES_64","ALL",!0,i.aspect,i.contextLabel)},onNavigateSection:i=>this.openSection(i),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openHonours(e="TROPHIES_64",a="ALL",t=!0,i="ALL",r){this.prepareTransitionTo("HONOURS",t),this.sync3DShowcaseClass(!1),this.honoursView.open({initialTab:e,initialTierFilter:a,initialAspectFilter:i,initialContextLabel:r,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onEquipSkin:n=>{this.recordSpecialFeat("ATELIER_SKIN_EQUIPPED"),this.callbacks.onEquipSkin?.(n)},onEquipBroadcastTitle:n=>{this.callbacks.onEquipBroadcastTitle?.(n)},onEquipHudTheme:n=>{this.callbacks.onEquipHudTheme?.(n)},onNavigateSection:n=>this.openSection(n),onClose:()=>{this.resetSuiteNavigationState(!0)}})}evaluateHonoursAndToast(){const e=this.honoursSystem.evaluateAndUnlock(!1);return e.length>0&&(this.toastOverlay.enqueue(e),this.callbacks.onHonourUnlocked?.(e)),e}evaluateAndToastHonours(){return this.evaluateHonoursAndToast()}getCatalogTotals(){return{honours:Vt(),unlockables:Yt(),finishes:U.length,titles:ee.length,themes:V.length}}recordQuestionOutcome(e){return this.analyticsStore.recordQuestionOutcome(e),this.evaluateHonoursAndToast()}recordMatchCompleted(e){return this.analyticsStore.recordMatchCompleted(e),this.evaluateHonoursAndToast()}recordSpecialFeat(e,a){return this.analyticsStore.recordSpecialFeat(e,a),this.evaluateHonoursAndToast()}getAnalyticsSnapshot(){return this.analyticsStore.getSnapshot()}getPlayerStatProfileForHost(){return this.analyticsStore.getPlayerStatProfileForHost()}getDueReviewCount(e){return this.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks,e),this.srsEngine.getDueCount(e)}getSrsDeckSummary(e){return this.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks,e),this.srsEngine.getDeckSummary(e)}ingestSpacedRepetitionOutcome(e){return this.srsEngine.ingestQuestionOutcome(e)}syncSpacedRepetitionBookmarks(e){return this.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks,e)}openMasteryReviewDeck(e=!0,a){this.openObservatory("SELF_QUIZ","championship_trophy",e,a)}getEquippedHudAccentTheme(){return tt()}applyEquippedFinish(){return this.deps.stage3d?Dt(this.deps.stage3d):Mt()}}export{Je as ALL_ANALYTICS_ARCHETYPES,Pa as ALL_ANALYTICS_DIFFICULTY_TIERS,$t as ALL_ANALYTICS_MODES,He as ALL_V4_QUESTION_FORMATS,lt as BOX_1_FIRST_MISS_MS,_t as BOX_1_REPEAT_MISS_MS,ee as BROADCAST_TITLES_CATALOG,ra as BROADCAST_TITLES_V1_CORE,oa as BROADCAST_TITLES_V2_EXPANSION,na as BROADCAST_TITLES_V4_EXPANSION,ia as CareerAnalyticsDashboardView,Ks as CareerAnalyticsStore,xs as DiplomaticPassportBook,qs as FactionLeagueView,Ne as HALL_OF_HONOURS_CATALOG,Ha as HONOURS_CATALOG,xa as HONOURS_EXPANSION_PACKS,ba as HONOURS_V1_CORE,ya as HONOURS_V2_EXPANSION,va as HONOURS_V3_EXPANSION,wa as HONOURS_V4_EXPANSION,V as HUD_ACCENT_THEMES,la as HUD_ACCENT_THEMES_V1_CORE,ca as HUD_ACCENT_THEMES_V2_EXPANSION,da as HUD_ACCENT_THEMES_V4_EXPANSION,Sa as HallOfHonoursSystem,Aa as HallOfHonoursView,Ia as HonourToastOverlay,Rs as IntelObservatoryView,se as LEITNER_BOX_INTERVAL_MS,Ss as LEITNER_BOX_LABELS,It as LEITNER_BOX_SHORT_INTERVALS,Va as MetaProgressionSuite,ae as OBSERVATORY_ARTIFACT_DOSSIERS,U as PRISM_ATELIER_FINISHES,Ms as PRISM_ATELIER_FINISHES_V1_CORE,Os as PRISM_ATELIER_FINISHES_V2_EXPANSION,Ps as PrismAtelierView,xe as QUESTION_FEEDBACK_STORAGE_KEY,Kt as RARITY_TIER_META,Me as SPEED_BUCKET_LABELS,nt as SRS_STORAGE_KEY,Rt as SpacedRepetitionEngine,G as WORLD_COUNCIL_FACTIONS,Dt as applyEquippedPrismFinishToStage3D,Le as applyPrismFinishToStage3D,ce as attachMetaEscapeHandler,le as bindVaultJumperEvents,Ft as buildPlayerStatProfileForHost,za as clearFeedback,js as computeFilteredAnalyticsView,ve as computeSpeedBucketIdx,ft as createDefaultAnalyticsFilter,de as ensureMetaStylesInjected,Wt as equipHudAccentTheme,h as escapeMetaHtml,Ye as evaluatePrismFinishUnlocks,Ka as exportFeedbackReportJson,gs as formatMetaYear,Es as formatTimeUntilReview,tt as getEquippedHudTheme,fe as getEquippedPrismFinishId,Gs as getFactionCrestDataUri,es as getFeedbackSummary,ha as getMedalFallbackDataUri,oe as getPrismFinishSpec,qa as getQuarantinedQidSet,Ga as getQuestionFeedbackEntry,Oa as getQuestionVote,Vt as getTotalHonoursCount,Yt as getTotalUnlockablesCount,zt as getUnlockedHudThemeIds,ys as getVisaStampDataUri,Ds as grantAtelierFinishUnlock,pa as grantHudThemeUnlock,Oe as inferQuestionFormatFromEvent,De as isDoubleDownEvent,Ua as isQuestionQuarantined,Mt as loadEquippedPrismFinish,Bt as normalizeAnalyticsEvent,Fe as normalizeQuestionFormatV4,Fa as recordQuestionFeedback,X as renderVaultJumperHtml,M as sanitizeMetaCopy,Ot as saveEquippedPrismFinishId,Wa as subscribeQuestionFeedback};
