import{f as $,F as at}from"./forge-SsBIHicS.js";import{P as it,O as ot,a as rt,R as k,S as D,s as nt,v as lt,b as W}from"./narrative-BxjM3ygu.js";import{w as ct,M as dt,S as pt,_ as ht,h as ut,b as mt,g as ft}from"./three-erNPJ4Sz.js";import{R as gt}from"./modes-CN45JVdS.js";const bt="ws_daily_global_feed_v2",ye=["ch","gb","jp","br","eg","is","sg","global"],ne={MAVERICK:{tellCaption:"Vance taps his silver stylus twice beside his right ear before pressing the brass seal.",spokenQuote:"High risk, fearless Overclocks, zero hesitation. Your Meridian Passport is stamped: The Maverick."},DIPLOMAT:{tellCaption:"Vance inclines his head a single measured degree as warm wax meets leather.",spokenQuote:"Measured judgment, strategic alliances, composure under fire. Your Meridian Passport is stamped: The Diplomat."},ANALYST:{tellCaption:"Vance aligns the brass astrolabe crosshairs dead center over your dossier.",spokenQuote:"Methodical clue-peeling, surgical precision, zero wasted motion. Your Meridian Passport is stamped: The Analyst."},PRODIGY:{tellCaption:"Vance’s fingers brush his left brass cufflink—startled by how closely your chart mirrors 2019.",spokenQuote:"Cold instinct at three-point-zero, razor accuracy, unshakable nerve. Your Meridian Passport is stamped: The Prodigy."}};function u(i){return String(i??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function yt(i){return typeof i=="number"&&Number.isFinite(i)?String(Math.round(i)):String(i??"").replace(/\b([12]),(\d{3})\b/g,"$1$2")}function E(i){return String(i??"").replace(/\b(in|from|since|circa|c\.|by|until|around|year|founded|born|died)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\(([12]),(\d{3})([–\-]([12]),?(\d{3}))?\)/g,(e,s,t,a,o,l)=>a&&o&&l?`(${s}${t}–${o}${l})`:`(${s}${t})`).replace(/\b([12]),(\d{3})\s*(CE|BCE|AD|BC)\b/g,"$1$2 $3").replace(/\b([12]),(\d{3})([–\-])([12]),(\d{3})\b/g,"$1$2$3$4$5")}const P={PASSPORT:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="11" r="3.5"/><path d="M8.5 17.5h7"/></svg>',OBSERVATORY:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="8" ry="3.2"/><path d="M12 4v16"/></svg>',ATELIER:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 21 9 12 22 3 9 12 2"/><path d="M3 9h18M12 2v20"/></svg>',ANALYTICS:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19h16"/><path d="M7 16v-5M12 16V7M17 16v-8"/></svg>',HONOURS:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.8 7 21l5-2.6L17 21l-1.5-7.2"/></svg>',FACTIONS:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7ZM17 7l-3 7h6l-3-7Z"/></svg>'},vt=[{id:"PASSPORT",icon:P.PASSPORT,label:"Passport"},{id:"OBSERVATORY",icon:P.OBSERVATORY,label:"3D Observatory"},{id:"ATELIER",icon:P.ATELIER,label:"Prism Atelier"},{id:"ANALYTICS",icon:P.ANALYTICS,label:"Career Stats"},{id:"HONOURS",icon:P.HONOURS,label:"Honours"},{id:"FACTIONS",icon:P.FACTIONS,label:"Council Blocs"}];function B(i,e={}){const{isModal:s=!0,closeBtnId:t="ws-meta-close",canNavigate:a=!0,floatingVariant:o=!1}=e;if(!a&&!s)return"";const l=o?"ws-meta-float-pill":"ws-meta-vault-btn",r=a?vt.map(p=>{const c=p.id===i;return`
          <button
            type="button"
            class="ws-meta-vault-row ${c?"is-current":""}"
            data-suite-nav="${p.id}"
            role="menuitem"
            ${c?'aria-current="page"':""}
          >
            <span class="ws-meta-vault-row-ico">${p.icon}</span>
            <span class="ws-meta-vault-row-lbl">${u(p.label)}</span>
            ${c?'<span class="ws-meta-vault-dot" aria-hidden="true"></span>':""}
          </button>
        `}).join(""):"",d=s?`
      <div class="ws-meta-vault-sep"></div>
      <button type="button" class="ws-meta-vault-row is-exit" id="${u(t)}" role="menuitem">
        <span class="ws-meta-vault-row-ico">✕</span>
        <span class="ws-meta-vault-row-lbl">Exit Vault</span>
      </button>
    `:"";return`
    <div class="ws-meta-vault-wrap" data-vault-wrap>
      <button
        type="button"
        class="${l}"
        data-vault-trigger
        aria-haspopup="menu"
        aria-expanded="false"
      >
        <span>Vault</span>
        <span class="ws-meta-vault-caret" aria-hidden="true">▾</span>
      </button>
      <div class="ws-meta-vault-menu" data-vault-menu role="menu" hidden>
        ${r}
        ${d}
      </div>
    </div>
  `}function q(i,e={}){const s=i.querySelector("[data-vault-wrap]"),t=i.querySelector("[data-vault-trigger]"),a=i.querySelector("[data-vault-menu]");if(!s||!t||!a)return;let o=null;const l=r=>{a.hidden=!r,a.classList.toggle("is-open",r),t.setAttribute("aria-expanded",r?"true":"false"),o&&(document.removeEventListener("pointerdown",o,!0),o=null),r&&(o=d=>{if(!s.isConnected){o&&(document.removeEventListener("pointerdown",o,!0),o=null);return}const p=d.target;p&&s.contains(p)||l(!1)},document.addEventListener("pointerdown",o,!0))};t.addEventListener("click",r=>{r.stopPropagation(),e.onTapFeedback?.(),l(a.hidden)}),a.querySelectorAll("[data-suite-nav]").forEach(r=>{r.addEventListener("click",d=>{d.stopPropagation();const p=r.dataset.suiteNav;if(l(!1),!!p){if(r.classList.contains("is-current")){e.onTapFeedback?.();return}e.onTapFeedback?.(),e.onNavigate?.(p)}})}),e.closeBtnId&&a.querySelector(`#${e.closeBtnId}`)?.addEventListener("click",d=>{d.stopPropagation(),l(!1),e.onClose?.()})}function z(i){if(typeof window>"u")return()=>{};const e=s=>{if(s.key!=="Escape")return;const t=document.activeElement;if(t){const a=t.tagName.toUpperCase();if(a==="INPUT"||a==="TEXTAREA"||t.isContentEditable)return}s.preventDefault(),s.stopPropagation(),i()};return window.addEventListener("keydown",e),()=>{window.removeEventListener("keydown",e)}}function Q(i,e,s){return Number.isFinite(i)?Math.max(e,Math.min(s,i)):e}function ve(){const i={dailyStreak:0,bestScore:0,bestPercentile:0,shareCardsByDate:{}};try{if(typeof localStorage>"u")return i;const e=localStorage.getItem(bt);if(!e)return i;const s=JSON.parse(e);if(!s||typeof s!="object")return i;const t={};if(s.completedRunsByDate&&typeof s.completedRunsByDate=="object")for(const[a,o]of Object.entries(s.completedRunsByDate))o&&typeof o.shareText=="string"&&(t[a]=o.shareText);return{dailyStreak:Math.max(0,Math.floor(Number(s.dailyStreak)||0)),bestScore:Math.max(0,Math.floor(Number(s.bestScore)||0)),bestPercentile:Q(Math.floor(Number(s.bestPercentile)||0),0,99),shareCardsByDate:t}}catch{return i}}function K(){if(typeof document>"u"||document.getElementById("ws-meta-progression-styles"))return;const i=document.createElement("style");i.id="ws-meta-progression-styles",i.textContent=`
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
  `,document.head.appendChild(i)}function xt(i,e,s){const t=e?"#39d49a":"#7b8599",a=e?"#f2cf7e":"#596273",o=e?"rgba(14, 42, 34, 0.72)":"rgba(14, 19, 30, 0.65)",r={ch:{code:"CH · GENEVA",city:"46.20°N 6.14°E",glyph:`<circle cx="60" cy="56" r="15" fill="none" stroke="${a}" stroke-width="2"/><path d="M60 45v22M49 56h22" stroke="${t}" stroke-width="3.2" stroke-linecap="round"/>`},gb:{code:"GB · LONDON",city:"51.51°N 0.13°W",glyph:`<circle cx="60" cy="56" r="15" fill="none" stroke="${a}" stroke-width="1.8"/><ellipse cx="60" cy="56" rx="15" ry="6.5" fill="none" stroke="${t}" stroke-width="1.8" transform="rotate(-26 60 56)"/><ellipse cx="60" cy="56" rx="15" ry="6.5" fill="none" stroke="${t}" stroke-width="1.8" transform="rotate(26 60 56)"/>`},jp:{code:"JP · TOKYO",city:"35.68°N 139.65°E",glyph:`<path d="M43 47h34M46 52h28M51 47v21M69 47v21" stroke="${t}" stroke-width="2.4" stroke-linecap="round"/><circle cx="60" cy="59" r="5" fill="${a}"/>`},br:{code:"BR · RIO",city:"22.91°S 43.17°W",glyph:`<path d="M44 66a16 16 0 0 1 32 0Z" fill="none" stroke="${t}" stroke-width="2"/><path d="M60 44v22M49 57h22" stroke="${a}" stroke-width="1.6"/>`},eg:{code:"EG · CAIRO",city:"30.04°N 31.24°E",glyph:`<polygon points="60,41 76,67 44,67" fill="none" stroke="${a}" stroke-width="2.2"/><circle cx="60" cy="57" r="4.2" fill="${t}"/>`},is:{code:"IS · REYKJAVIK",city:"64.15°N 21.94°W",glyph:`<path d="M45 64l8-18 7 11 7-14 8 21" fill="none" stroke="${t}" stroke-width="2.2" stroke-linejoin="round"/><path d="M46 43q14-6 28 0" fill="none" stroke="${a}" stroke-width="1.8"/>`},sg:{code:"SG · SINGAPORE",city:"1.35°N 103.82°E",glyph:`<rect x="48" y="47" width="6" height="20" stroke="${a}" stroke-width="1.8" fill="none"/><rect x="66" y="47" width="6" height="20" stroke="${a}" stroke-width="1.8" fill="none"/><path d="M44 47q16-5 32 0" fill="none" stroke="${t}" stroke-width="2.4"/>`},global:{code:"APEX CITADEL",city:"INTL WATERS",glyph:`<polygon points="60,40 65,51 77,52 68,60 70,71 60,65 50,71 52,60 43,52 55,51" fill="none" stroke="${a}" stroke-width="2"/><circle cx="60" cy="56" r="3.5" fill="${t}"/>`}}[i],d=e?"VISA STAMPED":"UNSTAMPED",p=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="55" fill="${o}" stroke="${t}" stroke-width="2.5" stroke-dasharray="5 2.5"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="${a}" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="33" fill="none" stroke="${t}" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="60" y="25" text-anchor="middle" fill="${a}" font-family="Cinzel,Georgia,serif" font-size="8.5" font-weight="700" letter-spacing="1.1">${r.code}</text>
    ${r.glyph}
    <text x="60" y="84" text-anchor="middle" fill="${t}" font-family="monospace" font-size="7.2" font-weight="700" letter-spacing="0.8">${d}</text>
    <text x="60" y="99" text-anchor="middle" fill="${a}" font-family="monospace" font-size="6.4">${r.city}</text>
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(p)}`}function wt(i,e){const l=[.25,.5,.75,1].map(m=>{const n=[];for(let h=0;h<12;h++){const f=Math.PI*2*h/12-Math.PI/2;n.push(`${(190+Math.cos(f)*100*m).toFixed(1)},${(154+Math.sin(f)*100*m).toFixed(1)}`)}return`<polygon points="${n.join(" ")}" fill="none" stroke="rgba(216,175,87,${m===1?"0.36":"0.18"})" stroke-width="${m===1?"1.3":"1"}" />`}).join(""),r=[],d=[],p=[],c=[];for(let m=0;m<12;m++){const n=Math.PI*2*m/12-Math.PI/2,h=Math.cos(n),f=Math.sin(n),g=190+h*100,b=154+f*100,y=m===e;r.push(`<line x1="190" y1="154" x2="${g.toFixed(1)}" y2="${b.toFixed(1)}" stroke="${y?"rgba(242,207,126,0.75)":"rgba(216,175,87,0.18)"}" stroke-width="${y?"1.8":"1"}" />`);const v=i[m],x=Q(v?.masteryPct??50,18,100)/100,w=190+h*100*x,S=154+f*100*x;d.push(`${w.toFixed(1)},${S.toFixed(1)}`);const A=D[m]?.accentHex??"#f2cf7e";p.push(`
      <g data-radar-domain="${m}" style="cursor:pointer;">
        <circle cx="${w.toFixed(1)}" cy="${S.toFixed(1)}" r="12" fill="transparent" />
        <circle cx="${w.toFixed(1)}" cy="${S.toFixed(1)}" r="${y?"6.2":"4.0"}" fill="${y?A:"#f2cf7e"}" stroke="#080b11" stroke-width="1.5" />
      </g>
    `);const _=190+h*118,M=154+f*116,Z=h<-.25?"end":h>.25?"start":"middle",be=at[m]?.shortName??D[m]?.shortName??`D${m}`;c.push(`<text data-radar-domain="${m}" x="${_.toFixed(1)}" y="${(M+3).toFixed(1)}" text-anchor="${Z}" fill="${y?"#f2cf7e":"#d8d2c5"}" font-size="${y?"10.5":"9.5"}" font-family="Inter, sans-serif" font-weight="${y?"800":"600"}" style="cursor:pointer;">${u(be)}</text>`)}return`
    <svg viewBox="0 0 380 308" style="width:100%;max-width:360px;height:auto;display:block;margin:0 auto;overflow:visible;">
      <defs>
        <radialGradient id="wsRadarPolyGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#56d4f5" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#f2cf7e" stop-opacity="0.34"/>
        </radialGradient>
      </defs>
      ${l}
      ${r.join("")}
      <polygon points="${d.join(" ")}" fill="url(#wsRadarPolyGrad)" stroke="#f2cf7e" stroke-width="2.2" stroke-linejoin="round" />
      ${c.join("")}
      ${p.join("")}
    </svg>
  `}function St(i){if(i.length===0)return"";const e=[...i].slice(-14),s=440,t=92,a=22,o=14,l=s-a*2,r=t-o*2,d=e.map((n,h)=>{const f=e.length===1?s/2:a+h/(e.length-1)*l,g=Q(n.percentile,1,99),b=o+(1-g/100)*r;return{x:f,y:b,entry:n}}),p=d.map(n=>`${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(" "),c=`${d[0].x.toFixed(1)},${t-o} ${p} ${d[d.length-1].x.toFixed(1)},${t-o}`,m=d.map(n=>`<circle cx="${n.x.toFixed(1)}" cy="${n.y.toFixed(1)}" r="4" fill="#39d49a" stroke="#080b11" stroke-width="1.4" />`).join("");return`
    <svg viewBox="0 0 ${s} ${t}" style="width:100%;height:auto;display:block;">
      <line x1="${a}" y1="${o}" x2="${s-a}" y2="${o}" stroke="rgba(57,212,154,0.25)" stroke-dasharray="3 3" />
      <line x1="${a}" y1="${t/2}" x2="${s-a}" y2="${t/2}" stroke="rgba(216,175,87,0.18)" stroke-dasharray="3 3" />
      <line x1="${a}" y1="${t-o}" x2="${s-a}" y2="${t-o}" stroke="rgba(184,178,166,0.2)" />
      <polygon points="${c}" fill="rgba(57,212,154,0.14)" />
      <polyline points="${p}" fill="none" stroke="#f2cf7e" stroke-width="2.2" />
      ${m}
    </svg>
  `}class kt{deps;modalBackdrop=null;mountedContainer=null;unsubscribePassport=null;detachEscape=null;activeTab="CREDENTIALS";focusedDomainId=0;stampAnimating=!1;nameFeedbackMsg=null;copiedDateToast=null;callbacks={};constructor(e){this.deps=e,K()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.activeTab=e.initialTab??"CREDENTIALS",this.callbacks=e,this.stampAnimating=!!e.playStampCeremonyOnOpen,this.nameFeedbackMsg=null;const s=document.createElement("div");s.className="ws-meta-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","Meridian Diplomatic Passport 2.0"),s.addEventListener("click",t=>{t.target===s&&this.handleClose()}),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=z(()=>this.handleBackOrClose()),this.stampAnimating&&this.playPersonaStampAudio(),this.renderInto(s,!0)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}const e=this.callbacks.onClose;this.close(),e?.()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}playPersonaStampAudio(){this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp");const e=this.deps.passport.getSnapshot().persona;e?this.deps.audio?.playVoice(`vance_persona_${e.toLowerCase()}.mp3`):this.deps.audio?.playVoice("vance_stamp.mp3")}mount(e,s={}){this.unmount(),this.activeTab=s.initialTab??"CREDENTIALS",this.callbacks=s,this.stampAnimating=!!s.playStampCeremonyOnOpen,this.mountedContainer=e,this.renderInto(e,!1)}unmount(){const e=this.mountedContainer!==null;this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.unsubscribePassport&&(this.unsubscribePassport(),this.unsubscribePassport=null),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null),(e||this.modalBackdrop!==null)&&this.deps.audio?.stopVoice()}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}setActiveTab(e){this.activeTab=e,this.rerender()}triggerStampCeremony(){this.activeTab="CREDENTIALS",this.stampAnimating=!0,this.playPersonaStampAudio(),this.callbacks.onPassportStamped?.(),this.rerender()}rerender(){this.modalBackdrop?this.renderInto(this.modalBackdrop,!0):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}collectDomainSkills(e){const s=$.getSkillVector();return $.getSkillSnapshot().totalAnswered>0?s:s.map((a,o)=>{const l=e.domainElo[o]??a.elo,r=Number(((l-1200)/260).toFixed(2)),d=Math.round(Q((l-800)/1400*100,18,100));return{...a,elo:l,theta:r,masteryPct:d}})}renderInto(e,s){const t=this.deps.passport.getSnapshot(),a=this.deps.blackboard?.getSnapshot()??null,o=$.getSkillSnapshot(),l=this.collectDomainSkills(t),r=this.deps.passport.getChallengerName(),d=t.persona?it[t.persona]:null,p=t.origin?ot[t.origin]:null,c=ye.filter(g=>t.visas[g]?.cleared).length,m=Math.round(l.reduce((g,b)=>g+b.elo,0)/Math.max(1,l.length)),n=o.totalAnswered>0?o.globalElo:m,h=o.totalAnswered>0?Math.round(o.totalCorrect/o.totalAnswered*100):0,f=B("PASSPORT",{isModal:s,closeBtnId:"ws-passport2-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell is-passport-leather">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-passport2-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">PASSPORT</h2>
              <div class="ws-meta-eyebrow">${u(r)} · ${u(t.passportNumber)}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${f}
          </div>
        </div>

        <!-- 4 Single-Row Borderless Underline Tabs (Fits 360px/390px cleanly with zero edge clip) -->
        <div class="ws-meta-underline-tabs" role="tablist" aria-label="Passport Sections">
          <button type="button" role="tab" aria-selected="${this.activeTab==="CREDENTIALS"}" class="ws-meta-underline-tab ${this.activeTab==="CREDENTIALS"?"is-active":""}" data-passport-tab="CREDENTIALS">
            Credentials
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab==="VISAS"}" class="ws-meta-underline-tab ${this.activeTab==="VISAS"?"is-active":""}" data-passport-tab="VISAS">
            Visas (${c}/8)
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab==="RADAR"}" class="ws-meta-underline-tab ${this.activeTab==="RADAR"?"is-active":""}" data-passport-tab="RADAR">
            12 Domains
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab==="GLOBAL_FEED"}" class="ws-meta-underline-tab ${this.activeTab==="GLOBAL_FEED"?"is-active":""}" data-passport-tab="GLOBAL_FEED">
            Global
          </button>
        </div>

        <div class="ws-meta-body-scroll">
          ${this.renderActiveTabBody(t,a,l,d,p,n,h,o.totalAnswered,o.totalCorrect,o.bestStreak)}
        </div>
      </div>
    `,this.stampAnimating=!1,this.bindEvents(e)}renderActiveTabBody(e,s,t,a,o,l,r,d,p,c){return this.activeTab==="VISAS"?this.renderVisasTab(e):this.activeTab==="RADAR"?this.renderRadarTab(t):this.activeTab==="GLOBAL_FEED"?this.renderGlobalFeedTab(e):this.renderCredentialsTab(e,s,a,o,l,r,d,p,c)}renderCredentialsTab(e,s,t,a,o,l,r,d,p){const c=this.deps.passport.getChallengerName(),m=t?.accentHex??"#f2cf7e",n=this.stampAnimating?"is-stamping":"",h=s?.axisIntegrity??0,f=s?.publicTrust??50,g=s?.councilFavor??50,b=s?.pledgedFaction??"UNALIGNED",y=(s?.activePerks??[]).map(v=>rt[v]).filter(Boolean);return`
      <!-- Frameless KPI Telemetry Strip (2x2 on mobile < 560px, 4-col on desktop) -->
      <div class="ws-meta-kpi-strip is-four-col">
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Global ELO</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${o}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Solved</span>
          <span class="ws-meta-kpi-val">${d}/${r} <span style="font-size:11px;color:var(--ivory-muted);">(${l}%)</span></span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Streak</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${p}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Trust · Favor</span>
          <span class="ws-meta-kpi-val" style="font-size:14px;"><span style="color:var(--cyan-clue);">${f}%</span> · <span style="color:var(--emerald-win);">${g}%</span></span>
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
                value="${u(c)}"
              />
              <button type="button" class="ws-meta-btn-gold" id="ws-passport2-save-name">
                ✒ Stamp
              </button>
            </div>
            ${this.nameFeedbackMsg?`<div style="font-size:11.5px;color:${this.nameFeedbackMsg.isError?"var(--crimson-alert)":"var(--emerald-win)"};">${u(this.nameFeedbackMsg.text)}</div>`:'<div style="font-size:11.5px;color:var(--ivory-dim);">Appears on broadcast scoreboards, Vance dialogue &amp; Daily Share Cards.</div>'}
          </div>

          <div class="ws-meta-section">
            <div class="ws-meta-row" style="padding-top:0;">
              <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">VETTING ORIGIN</span>
              <span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--cyan-clue);">${u(a?.title??"Independent Outsider")}</span>
            </div>
            <div class="ws-meta-row">
              <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">COUNCIL ALLEGIANCE</span>
              <span style="font-family:var(--font-display);font-size:13px;font-weight:700;color:var(--gold-bright);">${u(b)}</span>
            </div>
            <div class="ws-meta-row" style="border-bottom:none;padding-bottom:0;">
              <span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">INTEGRITY AXIS</span>
              <span style="font-family:var(--font-mono);font-size:12.5px;font-weight:700;color:var(--ivory-primary);">${h>=0?`+${h}`:h}</span>
            </div>
          </div>

          <div class="ws-meta-section" style="border-bottom:none;">
            <div class="ws-meta-section-title">Diplomatic Title Crests (${e.titleCrests.length})</div>
            <div class="ws-meta-hscroll">
              ${e.titleCrests.map(v=>{const x=v===e.activeTitleCrest;return`
                    <button type="button" class="ws-meta-chip ${x?"is-active":""}" data-select-crest="${u(v)}">
                      ${x?"✦ ":""}${u(v)}
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
                ${u(t?.title??"Unstamped Candidate")}
              </div>
            </div>
            <button type="button" class="ws-meta-inline-link" id="ws-passport2-restamp">
              ✒ Re-Stamp
            </button>
          </div>

          <div class="ws-persona-seal-stage" style="--seal-accent:${m};">
            <div class="ws-ink-ring-burst ${n}"></div>
            <div class="ws-persona-seal-disc ${n}">
              <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${m};letter-spacing:0.08em;">
                GENEVA SEAL
              </div>
              <div style="font-family:var(--font-display);font-size:14px;font-weight:800;color:var(--ivory-primary);margin:4px 0 3px;line-height:1.15;">
                ${u((t?.title??"CANDIDATE").toUpperCase())}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);">
                ${u(t?.stampCode??"MRD-00")}
              </div>
              <div style="margin-top:4px;font-family:var(--font-mono);font-size:10px;color:var(--emerald-win);">
                ${e.stampedAtIso?`${u(e.stampedAtIso.slice(0,10))}`:"AWAITING Q1–Q4"}
              </div>
            </div>
            <div style="margin-top:10px;font-size:12.5px;color:var(--ivory-primary);font-style:italic;text-align:center;max-width:380px;line-height:1.42;">
              “${u(E(e.persona&&ne[e.persona]?.spokenQuote||t?.motto||"Complete Julian Vance’s 4-Question Geneva Vetting Assessment to stamp your Cognitive Persona."))}”
            </div>
            ${e.persona&&ne[e.persona]?`<div style="margin-top:4px;font-size:11px;color:var(--cyan-clue);text-align:center;max-width:380px;">
                    ✦ ${u(E(ne[e.persona].tellCaption))}
                  </div>`:""}
          </div>

          <div class="ws-meta-note">
            <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
              SIGNATURE PERK · ${u(t?.startingPerkName??"Clean Calibration")}
            </div>
            <div style="font-size:12px;color:var(--ivory-muted);margin-top:3px;">
              ${u(t?.startingPerkDesc??t?.dossierAssessment??"Your Spin, Peel, and Overclock instincts in Geneva determine your permanent starting signature perk.")}
            </div>
            ${y.length>0?`<div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:8px;font-family:var(--font-mono);font-size:10.5px;color:var(--cyan-clue);">
                    ${y.map(v=>`<span>◆ ${u(v.name)}</span>`).join("")}
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
          ${ye.map(t=>{const a=e.visas[t];if(!a)return"";const o=this.deps.visaStampUrls?.[t]??`./assets/visas/visa_${t}.png`,l=xt(t,a.cleared),r=k[a.relicId],d=a.totalMissions>6?10:12,p=Array.from({length:Math.min(12,a.totalMissions)},(c,m)=>`<img src="./assets/ui/${a.cleared||m<a.missionsCompleted?"star_filled":"star_empty"}.png" alt="" style="width:${d}px;height:${d}px;object-fit:contain;" />`).join("");return`
        <div class="ws-visa-card ${a.cleared?"is-cleared":"is-locked"}">
          <img
            class="ws-visa-stamp-img"
            src="${u(o)}"
            data-fallback-src="${u(l)}"
            alt="${u(a.city)} Diplomatic Visa Stamp"
            style="${a.cleared?"":"filter:grayscale(0.85) opacity(0.6);"}"
          />
          <div style="font-family:var(--font-display);font-size:12.5px;font-weight:800;color:var(--ivory-primary);letter-spacing:0.04em;">
            ${u(a.city.toUpperCase())}
          </div>
          <div style="font-family:var(--font-mono);font-size:10px;color:${a.cleared?"var(--emerald-win)":"#9aa4b7"};font-weight:700;">
            ${u(a.stampSerial)} · ${a.cleared?"CLEARED":`${a.missionsCompleted}/${a.totalMissions}`}
          </div>
          <div style="font-size:10.5px;color:var(--ivory-muted);line-height:1.25;">
            ${u(a.visaTitle)}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:2px;align-items:center;justify-content:center;margin:2px auto;max-width:136px;">
            ${p}
          </div>
          ${this.callbacks.onInspectRelicInObservatory?`
                <button type="button" class="ws-meta-inline-link" data-inspect-relic="${a.relicId}" style="margin-top:auto;font-size:10.5px;justify-content:center;">
                  ${a.relicUnlocked||a.cleared?"◆":"◇"} ${u(r?.name??"Relic")} ›
                </button>
              `:""}
        </div>
      `}).join("")}
        </div>
      </div>
    `}renderRadarTab(e){const s=e[this.focusedDomainId]??e[0],t=D[this.focusedDomainId]??D[0];let a=e[0],o=e[0];for(const r of e)r.elo>a.elo&&(a=r),r.elo<o.elo&&(o=r);const l=s.theta>=0?`+${s.theta.toFixed(2)}`:s.theta.toFixed(2);return`
      <div class="ws-meta-two-col">
        <!-- Left: Interactive SVG 12-Domain Radar -->
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="text-align:center;">
            <div class="ws-meta-section-title">12-Domain IRT Cognitive Radar (θ)</div>
            <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
              Tap any spoke or domain row to inspect telemetry
            </div>
          </div>

          ${wt(e,this.focusedDomainId)}

          <div class="ws-meta-note" style="box-shadow:inset 3px 0 0 ${t.accentHex};display:flex;align-items:center;gap:10px;padding:8px 0 8px 12px;">
            <img src="./${u(t.medallionUrl)}" alt="" style="width:36px;height:36px;object-fit:contain;flex-shrink:0;" />
            <div style="min-width:0;flex:1 1 auto;">
              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;align-items:baseline;">
                <span style="font-family:var(--font-display);font-size:14px;font-weight:800;color:${t.accentHex};">
                  ${u(s.name)}
                </span>
                <span style="font-family:var(--font-mono);font-size:11.5px;font-weight:700;color:var(--gold-bright);">
                  ELO ${s.elo} · θ ${l}
                </span>
              </div>
              <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
                ${u(s.rankTitle)} · Mastery ${s.masteryPct}% · <strong style="color:var(--cyan-clue);">${u(t.factionAffinity)}</strong>
              </div>
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-muted);padding-top:6px;border-top:1px solid rgba(255,255,255,0.07);">
            <span>★ APEX: <strong style="color:var(--emerald-win);">${u(a.shortName)} (${a.elo})</strong></span>
            <span>▲ TARGET: <strong style="color:var(--amber-warn);">${u(o.shortName)} (${o.elo})</strong></span>
          </div>
        </div>

        <!-- Right: Hairline 12-Domain ELO List -->
        <div style="display:flex;flex-direction:column;">
          <div class="ws-meta-section-title" style="margin-bottom:6px;">Domain ELO &amp; Mastery</div>
          ${e.map((r,d)=>{const p=D[d];return`
                <button type="button" class="ws-meta-row is-interactive ${d===this.focusedDomainId?"is-focused":""}" data-focus-domain="${d}" style="width:100%;text-align:left;">
                  <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                    <img src="./${u(p.medallionUrl)}" alt="" style="width:24px;height:24px;object-fit:contain;flex-shrink:0;" />
                    <span style="font-size:12.5px;font-weight:600;color:var(--ivory-primary);">${u(r.shortName)}</span>
                  </span>
                  <span style="font-family:var(--font-mono);font-size:11.5px;font-weight:700;color:${p.accentHex};flex-shrink:0;">
                    ${r.elo} <span style="color:var(--ivory-dim);font-weight:500;">· ${r.masteryPct}%</span>
                  </span>
                </button>
              `}).join("")}
        </div>
      </div>
    `}renderGlobalFeedTab(e){const s=ve(),t=[...e.dailyHistory].sort((r,d)=>d.utcDate.localeCompare(r.utcDate)),a=Math.max(s.bestPercentile,...t.map(r=>r.percentile),0),o=a>0?Math.max(1,100-a):null,l=Math.max(s.bestScore,...t.map(r=>r.score),0);return`
      <div class="ws-meta-kpi-strip">
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Daily Streak</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${s.dailyStreak}d ✦</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Percentile</span>
          <span class="ws-meta-kpi-val" style="color:var(--emerald-win);">${o!==null?`TOP ${o}%`:"UNRANKED"}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Broadcast</span>
          <span class="ws-meta-kpi-val">${Math.round(l).toLocaleString("en-US")} <span style="font-size:10.5px;color:var(--ivory-dim);">PTS</span></span>
        </div>
      </div>

      ${t.length>0?`
            <div class="ws-meta-section">
              <div class="ws-meta-section-title">Percentile Trajectory (Last ${Math.min(14,t.length)} UTC Broadcasts)</div>
              ${St([...e.dailyHistory])}
            </div>

            <div class="ws-meta-section" style="border-bottom:none;">
              <div class="ws-meta-section-title">Broadcast Ledger (00:00 UTC)</div>
              <div>
                ${t.map(r=>{const d=Math.max(1,100-Q(r.percentile,1,99)),p=s.shareCardsByDate[r.utcDate],c=this.copiedDateToast===r.utcDate;return`
                      <div class="ws-meta-row" style="flex-wrap:wrap;">
                        <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
                          <span style="font-family:var(--font-mono);font-size:12.5px;font-weight:700;color:var(--gold-bright);">
                            ${u(r.utcDate)}
                          </span>
                          <span style="font-family:var(--font-mono);font-size:12px;color:var(--ivory-primary);">
                            ${Math.round(r.score).toLocaleString("en-US")} PTS
                          </span>
                          <span style="font-size:11.5px;color:var(--ivory-muted);">
                            ${r.correctCount}/7
                          </span>
                        </div>
                        <div style="display:flex;align-items:center;gap:10px;">
                          <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--emerald-win);">
                            TOP ${d}%
                          </span>
                          ${p?`<button type="button" class="ws-meta-inline-link" data-copy-daily="${u(r.utcDate)}">
                                  ${c?"✓ Copied":"Share"}
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
    `}bindEvents(e){e.querySelectorAll("img[data-fallback-src]").forEach(a=>{a.addEventListener("error",()=>{const o=a.dataset.fallbackSrc;o&&a.src!==o&&(a.src=o)},{once:!0})}),e.querySelector("#ws-passport2-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),q(e,{closeBtnId:"ws-passport2-close",onNavigate:a=>this.callbacks.onNavigateSection?.(a),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-passport-tab]").forEach(a=>{a.addEventListener("click",()=>{const o=a.dataset.passportTab;!o||o===this.activeTab||(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.activeTab=o,this.nameFeedbackMsg=null,this.rerender())})});const s=e.querySelector("#ws-passport-name-input");if(s){const a=l=>l.stopPropagation();s.addEventListener("keyup",a),s.addEventListener("keypress",a),s.addEventListener("input",()=>{const l=nt(s.value);s.value!==l&&(s.value=l)});const o=()=>{const l=lt(s.value);if(!l.valid){this.nameFeedbackMsg={text:l.error??"Enter a valid name (1–22 characters).",isError:!0},this.rerender();return}this.deps.passport.setChallengerName(l.cleaned),this.nameFeedbackMsg={text:`Credentials stamped for ${l.cleaned}.`,isError:!1},this.stampAnimating=!0,this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp"),this.callbacks.onPassportStamped?.(),this.callbacks.onRenameChallenger?.(l.cleaned),this.rerender()};e.querySelector("#ws-passport2-save-name")?.addEventListener("click",o),s.addEventListener("keydown",l=>{l.stopPropagation(),l.key==="Enter"&&(l.preventDefault(),o())})}e.querySelector("#ws-passport2-restamp")?.addEventListener("click",()=>{this.triggerStampCeremony()}),e.querySelectorAll("[data-select-crest]").forEach(a=>{a.addEventListener("click",()=>{const o=a.dataset.selectCrest;o&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.deps.passport.unlockTitleCrest(o,!0),this.rerender())})}),e.querySelectorAll("[data-inspect-relic]").forEach(a=>{a.addEventListener("click",()=>{const o=a.dataset.inspectRelic;o&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onInspectRelicInObservatory?.(o))})});const t=a=>{const o=Number(a);!Number.isFinite(o)||o<0||o>11||(this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.focusedDomainId=o,this.rerender())};e.querySelectorAll("[data-focus-domain]").forEach(a=>{a.addEventListener("click",()=>t(a.dataset.focusDomain))}),e.querySelectorAll("[data-radar-domain]").forEach(a=>{a.addEventListener("click",()=>t(a.getAttribute("data-radar-domain")??void 0))}),e.querySelectorAll("[data-copy-daily]").forEach(a=>{a.addEventListener("click",()=>{const o=a.dataset.copyDaily;if(!o)return;const l=ve().shareCardsByDate[o];l&&(navigator.clipboard?.writeText(l).catch(()=>{}),this.copiedDateToast=o,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})})}}const xe="ws_spaced_repetition_v2",J=3600*1e3,G=24*J,we=0,$e=4*J,H={1:$e,2:1*G,3:3*G,4:7*G,5:21*G},Et={1:"Box 1 · Immediate",2:"Box 2 · 24h",3:"Box 3 · 3 Days",4:"Box 4 · 7 Days",5:"Box 5 · Mastered"},Ne={1:"Now",2:"24h",3:"3d",4:"7d",5:"21d"},Se=600;function X(i){return Number.isFinite(i)?Math.max(0,Math.min(11,Math.floor(i))):0}function Rt(i){return Number.isFinite(i)?Math.max(1,Math.min(5,Math.round(i))):1}function R(i){return String(i??"").trim().replace(/\b(in|from|since|circa|c\.|by|until|around|year|founded|born|died)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\(([12]),(\d{3})([–\-]([12]),?(\d{3}))?\)/g,(e,s,t,a,o,l)=>a&&o&&l?`(${s}${t}–${o}${l})`:`(${s}${t})`).replace(/\b([12]),(\d{3})\s*(CE|BCE|AD|BC)\b/g,"$1$2 $3").replace(/\b([12]),(\d{3})([–\-])([12]),(\d{3})\b/g,"$1$2$3$4$5")}function V(i,e){if(!Array.isArray(i))return[];const s=e.trim().toLowerCase(),t=new Set,a=[];for(const o of i){const l=R(String(o??""));if(!l)continue;const r=l.toLowerCase();if(!(r===s||t.has(r))&&(t.add(r),a.push(l),a.length>=3))break}return a}function I(i){return{...i,distractors:[...i.distractors]}}function At(i,e=Date.now()){const s=i-e;return s<=0?"Due now":s<J?`in ${Math.max(1,Math.ceil(s/6e4))}m`:s<G?`in ${Math.max(1,Math.round(s/J))}h`:`in ${Math.max(1,Math.round(s/G))}d`}const le=[{qid:900001,domainId:0,subcatLabel:"Modern Diplomacy",prompt:'Which 1814–1815 European diplomatic summit was nicknamed "The Dancing Congress"?',correctAnswer:"Congress of Vienna",distractors:["Treaty of Utrecht","Congress of Berlin","Peace of Westphalia"],whyExplanation:"Prince Metternich hosted lavish nightly balls in Vienna while redrawing post-Napoleonic Europe’s borders.",initialBox:1,dueNow:!0},{qid:900002,domainId:1,subcatLabel:"Materials & Elements",prompt:"Which pure metallic element possesses the highest melting point at 3,422 °C?",correctAnswer:"Tungsten",distractors:["Osmium","Rhenium","Tantalum"],whyExplanation:"Tungsten (W, atomic number 74) owes its extreme thermal resilience to dense 5d-orbital metallic bonding.",initialBox:1,dueNow:!0},{qid:900007,domainId:5,subcatLabel:"Baseball",prompt:"Which Cardinals ace posted an astonishing 1.12 ERA in 1968, prompting MLB to lower the pitcher’s mound?",correctAnswer:"Bob Gibson",distractors:["Sandy Koufax","Tom Seaver","Juan Marichal"],whyExplanation:"Gibson threw 13 shutouts and 28 complete games in 1968; MLB lowered the mound from 15 to 10 inches the next winter.",initialBox:1,dueNow:!0},{qid:900003,domainId:2,subcatLabel:"Maritime Straits",prompt:"Which narrow waterway divides the European and Asian halves of Istanbul?",correctAnswer:"Bosphorus Strait",distractors:["Dardanelles","Strait of Hormuz","Kerch Strait"],whyExplanation:"Linking the Black Sea to the Sea of Marmara, the Bosphorus is the world’s narrowest strait used for international shipping.",initialBox:2,dueNow:!1},{qid:900005,domainId:6,subcatLabel:"Computing History",prompt:"Who authored the 1843 Note G algorithm for Charles Babbage’s Analytical Engine?",correctAnswer:"Ada Lovelace",distractors:["Grace Hopper","Alan Turing","Claude Shannon"],whyExplanation:"Lovelace published an algorithm for Bernoulli numbers and foresaw symbolic computing beyond pure arithmetic.",initialBox:2,dueNow:!1},{qid:900006,domainId:11,subcatLabel:"Game Theory",prompt:"In game theory, what state holds when no player gains by unilaterally changing strategy?",correctAnswer:"Nash Equilibrium",distractors:["Pareto Optimality","Bayes’ Theorem","Prisoner’s Dilemma"],whyExplanation:"John Nash proved its existence across finite non-cooperative games in 1950 using Kakutani’s fixed-point theorem.",initialBox:5,dueNow:!1}];class Pe{cards=new Map;listeners=new Set;constructor(e){this.load(),e&&this.syncFromPassportBookmarks(e.getSnapshot().bookmarks)}load(){this.cards.clear();try{if(typeof localStorage>"u")return;const e=localStorage.getItem(xe);if(!e)return;const s=JSON.parse(e);if(!s||!Array.isArray(s.cards))return;for(const t of s.cards){if(!t||typeof t!="object")continue;const a=Math.floor(Number(t.qid));if(!Number.isFinite(a)||a<=0)continue;const o=R(String(t.prompt??"")),l=R(String(t.correctAnswer??""));if(!o||!l)continue;const r=Rt(Number(t.box)||1),d=Number.isFinite(Number(t.createdAtMs))?Number(t.createdAtMs):Date.now(),p=Number.isFinite(Number(t.nextReviewAtMs))?Number(t.nextReviewAtMs):d,c=t.lastReviewedAtMs!==null&&Number.isFinite(Number(t.lastReviewedAtMs))?Number(t.lastReviewedAtMs):null,n=["MISSED","BOOKMARKED","BOTH","SEED"].includes(t.source)?t.source:"MISSED";this.cards.set(a,{qid:a,prompt:o,correctAnswer:l,distractors:V(t.distractors,l),whyExplanation:R(String(t.whyExplanation??"")),domainId:X(Number(t.domainId)),subcatLabel:t.subcatLabel?R(String(t.subcatLabel)):void 0,box:r,source:n,isBookmarked:!!(t.isBookmarked||n==="BOOKMARKED"||n==="BOTH"),isSeed:!!(t.isSeed||n==="SEED"),createdAtMs:d,lastReviewedAtMs:c,nextReviewAtMs:p,totalReviews:Math.max(0,Math.floor(Number(t.totalReviews)||0)),correctReviews:Math.max(0,Math.floor(Number(t.correctReviews)||0)),wrongReviews:Math.max(0,Math.floor(Number(t.wrongReviews)||0)),streakInDeck:Math.max(0,Math.floor(Number(t.streakInDeck)||0))})}}catch{}}enforceCapacity(){if(this.cards.size<=Se)return;const e=Array.from(this.cards.values()).sort((t,a)=>t.isBookmarked!==a.isBookmarked?t.isBookmarked?1:-1:t.box!==a.box?a.box-t.box:t.createdAtMs-a.createdAtMs),s=this.cards.size-Se;for(let t=0;t<s&&t<e.length;t++)this.cards.delete(e[t].qid)}save(){this.enforceCapacity();try{if(typeof localStorage<"u"){const e={schemaVersion:2,updatedAtMs:Date.now(),cards:Array.from(this.cards.values())};localStorage.setItem(xe,JSON.stringify(e))}}catch{}for(const e of this.listeners)e()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}ingestQuestionOutcome(e){const s=Math.floor(Number(e.qid));if(!Number.isFinite(s)||s<=0)return null;const t=R(e.prompt),a=R(e.correctAnswer);if(!t||!a)return null;const o=Number.isFinite(e.nowMs)?Number(e.nowMs):Date.now(),l=X(Number(e.domainId)),r=R(e.whyExplanation),d=V(e.distractors,a),p=e.subcatLabel?R(e.subcatLabel):void 0,c=!!e.wasCorrect,m=!!e.wasBookmarked,n=this.cards.get(s);if(!c){if(!n){const g={qid:s,prompt:t,correctAnswer:a,distractors:d,whyExplanation:r,domainId:l,subcatLabel:p,box:1,source:m?"BOTH":"MISSED",isBookmarked:m,isSeed:!1,createdAtMs:o,lastReviewedAtMs:null,nextReviewAtMs:o+we,totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:0};return this.cards.set(s,g),this.save(),I(g)}const f=n.box===1&&!n.isSeed&&(n.source==="MISSED"||n.source==="BOTH");return n.prompt=t,n.correctAnswer=a,d.length>0&&(n.distractors=d),r&&(n.whyExplanation=r),p&&(n.subcatLabel=p),n.domainId=l,n.box=1,n.isSeed=!1,n.isBookmarked=n.isBookmarked||m,n.source=n.isBookmarked?"BOTH":"MISSED",n.lastReviewedAtMs=o,n.totalReviews+=1,n.wrongReviews+=1,n.streakInDeck=0,n.nextReviewAtMs=o+(f?$e:we),this.save(),I(n)}if(m){if(!n){const f={qid:s,prompt:t,correctAnswer:a,distractors:d,whyExplanation:r,domainId:l,subcatLabel:p,box:2,source:"BOOKMARKED",isBookmarked:!0,isSeed:!1,createdAtMs:o,lastReviewedAtMs:o,nextReviewAtMs:o+H[2],totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:1};return this.cards.set(s,f),this.save(),I(f)}return n.isBookmarked=!0,n.isSeed=!1,n.source=n.source==="MISSED"||n.source==="BOTH"?"BOTH":"BOOKMARKED",d.length>0&&(n.distractors=d),r&&(n.whyExplanation=r),p&&(n.subcatLabel=p),this.save(),I(n)}if(!n)return null;const h=Math.min(5,n.box+1);return n.box=h,n.lastReviewedAtMs=o,n.nextReviewAtMs=o+H[h],n.totalReviews+=1,n.correctReviews+=1,n.streakInDeck+=1,d.length>0&&(n.distractors=d),r&&(n.whyExplanation=r),p&&(n.subcatLabel=p),this.save(),I(n)}upsertBookmarkCard(e,s,t=Date.now()){const a=Math.floor(Number(e.qid));if(!Number.isFinite(a)||a<=0)return null;const o=this.cards.get(a);if(o){o.isBookmarked=!0,o.isSeed=!1,o.source=o.source==="MISSED"||o.source==="BOTH"?"BOTH":"BOOKMARKED";const m=V(s,o.correctAnswer);return m.length>0&&(o.distractors=m),this.save(),I(o)}const l=R(e.prompt),r=R(e.answer);if(!l||!r)return null;const d=Date.parse(e.savedAtIso),p=Number.isFinite(d)?d:t,c={qid:a,prompt:l,correctAnswer:r,distractors:V(s,r),whyExplanation:R(e.whyExplanation),domainId:X(Number(e.domainId)),box:2,source:"BOOKMARKED",isBookmarked:!0,isSeed:!1,createdAtMs:p,lastReviewedAtMs:null,nextReviewAtMs:p+H[2],totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:0};return this.cards.set(a,c),this.save(),I(c)}syncFromPassportBookmarks(e,s=Date.now()){let t=0;const a=new Set;for(const o of e){const l=Math.floor(Number(o?.qid));if(!Number.isFinite(l)||l<=0)continue;a.add(l);const r=this.cards.get(l);if(r)r.isBookmarked||(r.isBookmarked=!0,r.isSeed=!1,r.source=r.source==="MISSED"||r.source==="BOTH"?"BOTH":"BOOKMARKED",t+=1);else{const d=R(o.prompt),p=R(o.answer);if(!d||!p)continue;const c=Date.parse(o.savedAtIso),m=Number.isFinite(c)?c:s;this.cards.set(l,{qid:l,prompt:d,correctAnswer:p,distractors:[],whyExplanation:R(o.whyExplanation),domainId:X(Number(o.domainId)),box:2,source:"BOOKMARKED",isBookmarked:!0,isSeed:!1,createdAtMs:m,lastReviewedAtMs:null,nextReviewAtMs:m+H[2],totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:0}),t+=1}}for(const[o,l]of Array.from(this.cards.entries()))l.isBookmarked&&!a.has(o)&&(l.source==="BOOKMARKED"?this.cards.delete(o):(l.isBookmarked=!1,l.source="MISSED"),t+=1);return t>0&&this.save(),t}recordReviewAttempt(e,s,t=Date.now()){const a=this.cards.get(Math.floor(Number(e)));if(!a)return null;const o=Number.isFinite(t)?t:Date.now(),l=a.box;a.totalReviews+=1,a.lastReviewedAtMs=o;let r;return s?(r=Math.min(5,l+1),a.box=r,a.correctReviews+=1,a.streakInDeck+=1,a.nextReviewAtMs=o+H[r]):(r=1,a.box=1,a.wrongReviews+=1,a.streakInDeck=0,a.nextReviewAtMs=o),this.save(),{card:I(a),previousBox:l,newBox:r,wasCorrect:s,nextIntervalLabel:s?Ne[r]:"Now",promoted:s&&r>l,resetToBox1:!s}}getDueCards(e=Date.now(),s){const t=Number.isFinite(e)?e:Date.now(),a=Array.from(this.cards.values()).filter(o=>o.nextReviewAtMs<=t).sort((o,l)=>o.box!==l.box?o.box-l.box:o.nextReviewAtMs!==l.nextReviewAtMs?o.nextReviewAtMs-l.nextReviewAtMs:o.wrongReviews!==l.wrongReviews?l.wrongReviews-o.wrongReviews:o.createdAtMs-l.createdAtMs).map(I);return typeof s=="number"&&s>=0?a.slice(0,Math.floor(s)):a}getDueCount(e=Date.now()){const s=Number.isFinite(e)?e:Date.now();let t=0;for(const a of this.cards.values())a.nextReviewAtMs<=s&&(t+=1);return t}getAllCards(){return Array.from(this.cards.values()).sort((e,s)=>e.box!==s.box?e.box-s.box:e.nextReviewAtMs!==s.nextReviewAtMs?e.nextReviewAtMs-s.nextReviewAtMs:s.createdAtMs-e.createdAtMs).map(I)}getMasteredCards(){return Array.from(this.cards.values()).filter(e=>e.box===5).sort((e,s)=>(s.lastReviewedAtMs??s.createdAtMs)-(e.lastReviewedAtMs??e.createdAtMs)).map(I)}getCard(e){const s=this.cards.get(Math.floor(Number(e)));return s?I(s):null}removeCard(e){const s=this.cards.delete(Math.floor(Number(e)));return s&&this.save(),s}clearAll(){this.cards.clear(),this.save()}getDeckSummary(e=Date.now()){const s=Number.isFinite(e)?e:Date.now(),t=[0,0,0,0,0];let a=0,o=0,l=0,r=0,d=0;for(const n of this.cards.values())t[n.box-1]+=1,n.nextReviewAtMs<=s&&(a+=1),o+=n.totalReviews,l+=n.correctReviews,(n.source==="MISSED"||n.source==="BOTH")&&(r+=1),n.isBookmarked&&(d+=1);const p=this.cards.size,c=t[4],m=o>0?Math.round(l/o*100):p>0?Math.round((p-t[0])/p*100):0;return{totalCards:p,dueCount:a,masteredCount:c,boxCounts:t,retentionPct:m,missedCount:r,bookmarkedCount:d}}seedDemoCardsIfEmpty(e=Date.now()){if(this.cards.size>0)return!1;const s=Number.isFinite(e)?e:Date.now();for(let t=0;t<le.length;t++){const a=le[t],o=a.dueNow?s-(le.length-t)*1e3:s+H[a.initialBox];this.cards.set(a.qid,{qid:a.qid,prompt:R(a.prompt),correctAnswer:R(a.correctAnswer),distractors:V(a.distractors,a.correctAnswer),whyExplanation:R(a.whyExplanation),domainId:a.domainId,subcatLabel:a.subcatLabel,box:a.initialBox,source:"SEED",isBookmarked:!1,isSeed:!0,createdAtMs:s-(t+1)*6e4,lastReviewedAtMs:a.initialBox>1?s-J:null,nextReviewAtMs:o,totalReviews:a.initialBox===5?4:a.initialBox===2?1:0,correctReviews:a.initialBox===5?4:a.initialBox===2?1:0,wrongReviews:0,streakInDeck:a.initialBox===5?4:a.initialBox===2?1:0})}return this.save(),!0}}let Y=null,ee=null;function ke(){return Y?Promise.resolve(Y):ee||(ee=(async()=>{try{if(typeof fetch!="function")return{};const i=await fetch("./data/narrative_wave2.json");return i.ok?(i.headers.get("content-type")??"").includes("text/html")?{}:(Y=(await i.json()).tier3_relic_provenance??{},Y):{}}catch{return{}}})(),ee)}const F=[{id:"championship_trophy",title:"First Citizen Arbiter Crown Trophy",cityLabel:"Apex Citadel",venueLabel:"World Council Grand Dais",countryCode:"WORLD",domainId:0,metallurgySpec:"24K Recycled Central-Bank Bullion · Suspended Sapphire Star Core",historicalProvenance:"Commissioned under the Geneva Charter of Human Stewardship to crown humanity’s First Citizen Arbiter before two billion live viewers.",conspiracyNote:"Its counter-rotating astrolabe rings physically house the analog optical key required to authorize—or veto—The Ledger’s global crisis protocols.",uvHiddenInscription:'UV MICRO-ETCHING: "NO SINGLE SUPERPOWER SHALL HOLD THE PEN ALONE — GENEVA ART. I"',unlockHowTo:"Showcase Preview Active · Full Arbiter Seal awarded upon completing The Apex Forum."},{id:"meridian_astrolabe",title:k.meridian_astrolabe.name,cityLabel:k.meridian_astrolabe.cityLabel,venueLabel:k.meridian_astrolabe.venueLabel,countryCode:"CH",domainId:1,metallurgySpec:"Vallée de Joux Brushed Brass · Anti-Reflective Sapphire Vernier",historicalProvenance:"Milled by fifth-generation Geneva chronometer makers for Chief Adjudicator Julian Vance’s private Vetting Chamber table.",conspiracyNote:"Vance uses its tolerance cone during Q4 not merely to score estimation accuracy, but to fingerprint risk-calibrated minds matching Trial Zero.",uvHiddenInscription:k.meridian_astrolabe.hiddenInscription,unlockHowTo:"Clear the 4-Question Geneva Vetting Prologue."},{id:"armillary_orrery",title:k.armillary_orrery.name,cityLabel:k.armillary_orrery.cityLabel,venueLabel:k.armillary_orrery.venueLabel,countryCode:"GB",domainId:0,metallurgySpec:"Aged Admiralty Bronze · 18K Sovereign Gold Declination Rings",historicalProvenance:"Modeled after 18th-century Greenwich celestial spheres and mounted beneath the glass rotunda of the Sovereign Bloc’s London headquarters.",conspiracyNote:"When rotated to 23.4° obliquity, a concealed spring latch exposes initials scratched during the erased 2019 pilot tournament.",uvHiddenInscription:k.armillary_orrery.hiddenInscription,unlockHowTo:"Defeat the London Stage 1 Boss Showdown in The Sovereign Rotunda."},{id:"origami_prism",title:k.origami_prism.name,cityLabel:k.origami_prism.cityLabel,venueLabel:k.origami_prism.venueLabel,countryCode:"JP",domainId:6,metallurgySpec:"Smoked Synthetic Quartz · Vapor-Deposited Titanium Hinges",historicalProvenance:"Engineered by Director Kenji Takahashi’s Horizon Collective seventy floors above Tokyo Station to celebrate high-velocity deduction.",conspiracyNote:"Internal waveguides double as a passive laser interferometer—encoding geodesic survey coordinates pointing directly beneath the Giza plateau.",uvHiddenInscription:k.origami_prism.hiddenInscription,unlockHowTo:"Clear the Tokyo Stage 2 Boss Showdown in the Shinkansen Sky Pavilion."},{id:"emerald_sphere",title:k.emerald_sphere.name,cityLabel:k.emerald_sphere.cityLabel,venueLabel:k.emerald_sphere.venueLabel,countryCode:"BR",domainId:7,metallurgySpec:"Beryl-Quartz Acoustic Resonator · Spun Botanical Brass Ribs",historicalProvenance:"Suspended beneath Rio de Janeiro’s Botanical Glass Canopy, resonating at 432 Hz whenever a Challenger locks an unassisted Cold Instinct.",conspiracyNote:"Acoustic engineer Nadia Al-Mansoor recognized the sphere’s Helmholtz chamber immediately—it was tuned using her vanished brother Tariq’s equations.",uvHiddenInscription:k.emerald_sphere.hiddenInscription,unlockHowTo:"Clear the Rio de Janeiro Stage 3 Boss Showdown."},{id:"cipher_box",title:k.cipher_box.name,cityLabel:k.cipher_box.cityLabel,venueLabel:k.cipher_box.venueLabel,countryCode:"EG",domainId:10,metallurgySpec:"Tura Limestone Core · Counter-Rotating Pharaonic Electrum Tumblers",historicalProvenance:"Recovered from the subterranean Meridian Zero vault beneath Cairo’s Solar Acoustic Hall during the staged broadcast blackout.",conspiracyNote:"Contains the unredacted 2019 Trial Zero psychometric ledger—proving your 99.4% cognitive match with erased first champion Tariq Al-Mansoor.",uvHiddenInscription:k.cipher_box.hiddenInscription,unlockHowTo:"Decrypt Cairo’s Stage 4 Meridian Zero Boss Showdown."},{id:"cryo_relay",title:k.cryo_relay.name,cityLabel:k.cryo_relay.cityLabel,venueLabel:k.cryo_relay.venueLabel,countryCode:"IS",domainId:11,metallurgySpec:"Columnar Icelandic Basalt · Superconducting Niobium-Gold Coil",historicalProvenance:"Cooled by sub-glacial meltwater inside Reykjavik’s Geothermal Basalt Caldera to sustain zero-latency global truth verification.",conspiracyNote:"Proves Julian Vance never eliminated Tariq—he faked Tariq’s erasure and spent five years co-engineering The Meridian as a public Trojan Horse trap.",uvHiddenInscription:k.cryo_relay.hiddenInscription,unlockHowTo:"Complete Reykjavik’s Stage 5 Caldera Showdown."},{id:"council_seal",title:k.council_seal.name,cityLabel:k.council_seal.cityLabel,venueLabel:k.council_seal.venueLabel,countryCode:"SG",domainId:8,metallurgySpec:"950 Platinum Charter Disc · Fractured Crimson Corundum Core",historicalProvenance:"The ceremonial Article IX Emergency Seal held above The Ledger’s primary data monoliths on Singapore’s Diplomatic Sky-Bridge.",conspiracyNote:"Split cleanly down its treaty seam during the inner-circle betrayal crisis—exposing the proxy signature behind Rio’s pod sabotage.",uvHiddenInscription:k.council_seal.hiddenInscription,unlockHowTo:"Survive Singapore’s Stage 6 Sky-Bridge Showdown."},{id:"master_ledger",title:k.master_ledger.name,cityLabel:k.master_ledger.cityLabel,venueLabel:k.master_ledger.venueLabel,countryCode:"GLOBAL",domainId:6,metallurgySpec:"Dichroic Diamond-Carbon Lattice · Triple-Gimbal 24K Veto Key",historicalProvenance:"Anchored in International Waters aboard The Apex Forum—the planetary crisis-forecasting and treaty-verification heart of The Ledger.",conspiracyNote:"Unlocked live before two billion witnesses in The Arbiter’s Gambit against Julian Vance himself.",uvHiddenInscription:k.master_ledger.hiddenInscription,unlockHowTo:"Triumph in Stage 7 International Waters — The Apex Forum Finale."}],_t=[{qid:900001,domainId:0,prompt:'Which 1814–1815 European diplomatic summit was nicknamed "The Dancing Congress"?',answer:"Congress of Vienna",whyExplanation:"Prince Metternich hosted lavish nightly balls in Vienna while redrawing post-Napoleonic Europe’s borders.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900002,domainId:1,prompt:"Which element has the highest melting point of all pure metals at 3,422 °C?",answer:"Tungsten",whyExplanation:"Tungsten (W, atomic number 74) owes its extreme thermal resilience to dense 5d-orbital metallic bonding.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900003,domainId:2,prompt:"Which strait separates the European and Asian sides of Istanbul?",answer:"Bosphorus Strait",whyExplanation:"Linking the Black Sea to the Sea of Marmara, the Bosphorus is the world’s narrowest strait used for international navigation.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900004,domainId:3,prompt:"Traditional Japanese art of repairing broken pottery with lacquer dusted in powdered gold?",answer:"Kintsugi",whyExplanation:'Literally "golden joinery," Kintsugi treats breakage and repair as proud chapters of an object’s history rather than flaws to disguise.',savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900005,domainId:6,prompt:"Who authored the 1843 Note G algorithm for Charles Babbage’s Analytical Engine?",answer:"Ada Lovelace",whyExplanation:"Lovelace computed Bernoulli numbers and foresaw that symbolic engines could compose music and art beyond pure arithmetic.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900006,domainId:11,prompt:"In game theory, what state occurs when no player gains by unilaterally changing strategy?",answer:"Nash Equilibrium",whyExplanation:"Proven by John Nash in 1950 via Kakutani’s fixed-point theorem across every finite non-cooperative game.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0}],Ee={0:["Treaty of Utrecht","Peace of Westphalia","Congress of Berlin","Treaty of Tilsit"],1:["Molybdenum","Osmium","Tantalum","Rhenium"],2:["Dardanelles","Strait of Hormuz","Bab-el-Mandeb","Kerch Strait"],3:["Raku Ware","Cloisonné","Chiaroscuro","Shibori"],4:["Palme d’Or","Golden Lion","Cinéma Vérité","Nouvelle Vague"],5:["Fosbury Flop","Elo Rating","Marquis of Queensberry","Tourbillon"],6:["Alan Turing","Grace Hopper","Claude Shannon","John von Neumann"],7:["Cambrian Explosion","Symbiogenesis","Convergent Evolution","Homeostasis"],8:["Geneva Convention","Westphalian Sovereignty","Habeas Corpus","Jus Cogens"],9:["Maillard Reaction","Guilloché","Damascus Steel","Haute Horlogerie"],10:["Allegory of the Cave","Ship of Theseus","Occam’s Razor","Categorical Imperative"],11:["Pareto Optimality","Prisoner’s Dilemma","Gödel Incompleteness","Bayes’ Theorem"]},It=new Set(["verify (true)","debunk (false)","true","false"]);function Re(i,e,s){const t=E(i.correctAnswer).trim(),a=t.toLowerCase();if(a==="verify (true)"||a==="debunk (false)")return{options:["VERIFY (True)","DEBUNK (False)"],correctIdx:a==="verify (true)"?0:1};if(a==="true"||a==="false")return{options:["True","False"],correctIdx:a==="true"?0:1};const o=new Set([a]),l=[],r=(h,f=!1)=>{const g=E(h).trim();if(!g)return;const b=g.toLowerCase();f&&It.has(b)||o.has(b)||(o.add(b),l.push(g))};for(const h of i.distractors)r(h,!0);const d=t.match(/^(\d{3,4})(?:\s+(CE|BCE|AD|BC))?$/i);if(d&&l.length<3){const h=Number(d[1]),f=d[2]?` ${d[2].toUpperCase()}`:"",g=h>=1900?[-11,-5,6,13,-18,19]:h>=1500?[-24,-9,12,27,-38,41]:[-65,-25,30,75,-110,120],b=Math.abs(i.qid)%g.length;for(let y=0;y<g.length&&l.length<3;y++){const v=h+g[(b+y)%g.length];v>0&&v<=2026&&r(`${v}${f}`,!0)}}for(const h of e){if(l.length>=3)break;h.qid!==i.qid&&h.domainId===i.domainId&&r(h.correctAnswer,!0)}for(const h of Ee[i.domainId]??Ee[0]){if(l.length>=3)break;r(h,!0)}for(const h of e){if(l.length>=3)break;h.qid!==i.qid&&r(h.correctAnswer,!0)}const p=l.slice(0,3);for(;p.length<3;)p.push(`Archive Candidate ${p.length+1}`);const c=[t,...p];let m=i.qid*2654435761+i.totalReviews*1013904223>>>0||1;for(let h=c.length-1;h>0;h--){m=Math.imul(m,1664525)+1013904223>>>0;const f=m%(h+1),g=c[h];c[h]=c[f],c[f]=g}const n=c.indexOf(t);return{options:c,correctIdx:Math.max(0,n)}}const Ct={1:"#e05263",2:"#f09d46",3:"#56d4f5",4:"#f2cf7e",5:"#39d49a"};class Tt{deps;srs;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};activeTab="RELICS_3D";selectedArtifactId="championship_trophy";uvBlacklightActive=!1;relicLatchesOpen=!1;activeHotspotId=null;showcaseReqToken=0;searchQuery="";domainFilter="ALL";includeSeedExemplars=!0;srsFilter="DUE";srsBoxFilter=null;srsActiveCard=null;srsActiveOptions=null;srsLastAttemptResult=null;quizCursor=0;quizPickedIdx=null;quizShutterFlipped=!1;quizCorrectCount=0;quizAttemptedCount=0;quizStreak=0;constructor(e){this.deps=e,this.srs=e.srsEngine??new Pe(e.passport),K()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.activeTab=e.initialTab??"RELICS_3D",this.selectedArtifactId=e.initialArtifactId??"championship_trophy",this.uvBlacklightActive=!1,this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter();const s=document.createElement("div");s.setAttribute("role","dialog"),s.setAttribute("aria-label","3D Intel Observatory & Trophy Study"),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=z(()=>this.handleBackOrClose()),ke().then(()=>{this.isOpen()&&this.rerender()}),this.sync3DShowcase(),this.rerender()}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}const e=this.callbacks.onClose;this.close(),e?.()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}mount(e,s={}){this.unmount(),this.callbacks=s,this.activeTab=s.initialTab??"RELICS_3D",this.selectedArtifactId=s.initialArtifactId??"championship_trophy",this.mountedContainer=e,this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter(),ke().then(()=>{this.isOpen()&&this.rerender()}),this.sync3DShowcase(),this.renderInto(e,!1)}resetSrsRunnerTurn(e=!1){this.srsActiveCard=null,this.srsActiveOptions=null,this.srsLastAttemptResult=null,this.quizPickedIdx=null,this.quizShutterFlipped=!1,e&&(this.quizCursor=0,this.srsBoxFilter=null)}syncSrsBookmarksAndDefaultFilter(){this.srs.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks);const e=this.srs.getDeckSummary();e.dueCount>0?this.srsFilter="DUE":e.totalCards>0?this.srsFilter="ALL":this.srsFilter="DUE"}getFilteredSrsCards(){let e;return this.srsFilter==="DUE"?e=this.srs.getDueCards():this.srsFilter==="MASTERED"?e=this.srs.getMasteredCards():e=this.srs.getAllCards(),this.srsBoxFilter!==null?e.filter(s=>s.box===this.srsBoxFilter):[...e]}unmount(){const e=this.mountedContainer!==null;this.showcaseReqToken+=1,this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.syncUiRootVisibility(!1),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null),(e||this.modalBackdrop!==null)&&this.deps.audio?.stopVoice()}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}selectArtifact(e){this.selectedArtifactId=e,this.activeTab="RELICS_3D",this.uvBlacklightActive=!1,this.sync3DShowcase(),this.rerender()}syncUiRootVisibility(e){if(typeof document>"u")return;document.documentElement.classList.toggle("ws-3d-showcase-open",e);const s=document.getElementById("ui-root");s&&(s.style.visibility=e?"hidden":"visible")}async sync3DShowcase(){const e=F.find(t=>t.id===this.selectedArtifactId)??F[0],s=++this.showcaseReqToken;this.callbacks.onInspectRelic?.(e.id),this.deps.stage3d&&(await this.deps.stage3d.showHeroRelic(e.id,e.domainId),!(s!==this.showcaseReqToken||!this.isOpen())&&(this.uvBlacklightActive&&this.deps.stage3d.setLightingMode("TWIST_FRACTURE"),this.actuate3DRelicLatches(this.relicLatchesOpen)))}actuate3DRelicLatches(e){if(this.deps.stage3d){this.deps.stage3d.actuateRelicLatches(e?3:0);return}}isArtifactUnlocked(e){if(e==="championship_trophy")return!0;const s=this.deps.passport.getSnapshot(),t=this.deps.blackboard?.getSnapshot();if(s.unlockedRelics.includes(e)||t?.unlockedRelics.includes(e))return!0;const a=k[e];return!!(a&&s.visas[a.hubId]?.cleared)}getCombinedFlashes(){const s=this.deps.passport.getSnapshot().bookmarks.map(o=>({...o,isSeedExemplar:!1})),t=s.length===0||this.includeSeedExemplars?[...s,..._t.filter(o=>!s.some(l=>l.qid===o.qid))]:s,a=this.searchQuery.trim().toLowerCase();return t.filter(o=>{if(this.domainFilter!=="ALL"&&o.domainId!==this.domainFilter)return!1;if(!a)return!0;const l=W(o.domainId).name.toLowerCase();return o.prompt.toLowerCase().includes(a)||o.answer.toLowerCase().includes(a)||o.whyExplanation.toLowerCase().includes(a)||l.includes(a)})}rerender(){const e=this.activeTab==="RELICS_3D";this.modalBackdrop?(this.modalBackdrop.className=e?"ws-meta-backdrop is-stage-dock":"ws-meta-backdrop",this.syncUiRootVisibility(e),this.renderInto(this.modalBackdrop,!0)):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,s){const t=this.deps.passport.getSnapshot();this.srs.syncFromPassportBookmarks(t.bookmarks);const a=this.srs.getDeckSummary(),o=F.filter(c=>c.id!=="championship_trophy"&&this.isArtifactUnlocked(c.id)).length,l=`
      <div class="ws-meta-underline-tabs" role="tablist" aria-label="Observatory Sections">
        <button type="button" role="tab" aria-selected="${this.activeTab==="RELICS_3D"}" class="ws-meta-underline-tab ${this.activeTab==="RELICS_3D"?"is-active":""}" data-obs-tab="RELICS_3D">
          360° Relics
        </button>
        <button type="button" role="tab" aria-selected="${this.activeTab==="INTEL_FLASHES"}" class="ws-meta-underline-tab ${this.activeTab==="INTEL_FLASHES"?"is-active":""}" data-obs-tab="INTEL_FLASHES">
          Saved Flashes${t.bookmarks.length>0?` (${t.bookmarks.length})`:""}
        </button>
        <button type="button" role="tab" aria-selected="${this.activeTab==="SELF_QUIZ"}" class="ws-meta-underline-tab ${this.activeTab==="SELF_QUIZ"?"is-active":""}" data-obs-tab="SELF_QUIZ">
          Mastery Deck${a.dueCount>0?` (${a.dueCount})`:""}
        </button>
      </div>
    `,r='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>',d='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';if(s&&this.activeTab==="RELICS_3D"){const c=B("OBSERVATORY",{isModal:!0,closeBtnId:"ws-obs-close",canNavigate:!!this.callbacks.onNavigateSection,floatingVariant:!0});e.innerHTML=`
        <!-- Open Unobstructed 54-55dvh Portrait / 50vw Landscape 3D Stage (pointer-events: none pass-through!) -->
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-obs-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${c}
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
                ${r} UV
              </button>
              <button
                type="button"
                class="ws-meta-float-pill ${this.relicLatchesOpen?"is-active-gold":""}"
                id="ws-obs-latch-toggle"
                aria-pressed="${this.relicLatchesOpen}"
              >
                ${d} Latches
              </button>
            </div>
          </div>
        </div>

        <!-- Sleek 45-46dvh Portrait / 50vw Landscape Dark-Obsidian Bottom Sheet -->
        <div class="ws-meta-sheet">
          <div class="ws-meta-drag-handle" aria-hidden="true"></div>
          ${l}
          ${this.renderRelicSelectorStrip()}
          <div class="ws-meta-body-scroll">
            ${this.renderRelics3DStudy(o)}
          </div>
        </div>
      `,this.bindEvents(e);return}const p=B("OBSERVATORY",{isModal:s,closeBtnId:"ws-obs-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-obs-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">OBSERVATORY</h2>
              <div class="ws-meta-eyebrow">${o}/8 Relics · ${a.dueCount} Due · ${t.bookmarks.length} Flashes</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${p}
          </div>
        </div>

        ${l}
        ${this.activeTab==="RELICS_3D"?this.renderRelicSelectorStrip():""}

        <div class="ws-meta-body-scroll">
          ${this.activeTab==="RELICS_3D"?this.renderRelics3DStudy(o,!0):this.activeTab==="INTEL_FLASHES"?this.renderIntelFlashesVault():this.renderSelfQuizMode()}
        </div>
      </div>
    `,this.bindEvents(e)}renderRelicSelectorStrip(){return`
      <div class="ws-meta-hscroll" style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.06);" aria-label="Select 3D Relic">
        ${F.map(e=>{const s=e.id===this.selectedArtifactId,t=this.isArtifactUnlocked(e.id),a=e.id==="championship_trophy"?"Crown":e.cityLabel;return`
            <button
              type="button"
              class="ws-meta-chip ${s?"is-active":""}"
              data-select-artifact="${e.id}"
            >
              <span style="color:${e.id==="championship_trophy"||t?"var(--gold-bright)":"var(--ivory-dim)"};">${e.id==="championship_trophy"?"♛":t?"◆":"◇"}</span>
              <span>${u(a)}</span>
            </button>
          `}).join("")}
      </div>
    `}renderRelics3DStudy(e,s=!1){const t=F.find(c=>c.id===this.selectedArtifactId)??F[0],a=this.isArtifactUnlocked(t.id),o=t.id!=="championship_trophy"?Y?.[t.id]??null:null,l=o?.inspectionHotspots??[],r=l.find(c=>c.id===this.activeHotspotId)??l[0]??null,d=o?.yearCrafted?` (${yt(o.yearCrafted)})`:"",p=E(`${o?.metallurgySpec??t.metallurgySpec}${o?.artisanAttribution?` · ${o.artisanAttribution}${d}`:""}`);return`
      ${s?`
            <div style="display:flex;gap:8px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.07);">
              <button type="button" class="ws-meta-chip ${this.uvBlacklightActive?"is-active":""}" id="ws-obs-uv-scan">✦ UV</button>
              <button type="button" class="ws-meta-chip ${this.relicLatchesOpen?"is-active":""}" id="ws-obs-latch-toggle">⚙ Latches</button>
            </div>
          `:""}

      <!-- Crisp Frameless Provenance Header -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            ${o?.signatureGlyphUrl?`<img src="./${u(o.signatureGlyphUrl)}" alt="" style="width:30px;height:30px;object-fit:contain;flex-shrink:0;" />`:""}
            <div style="min-width:0;">
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);letter-spacing:0.08em;">
                ${u(o?.archiveCode??`${t.countryCode} · ${t.cityLabel.toUpperCase()}`)} · ${e}/8 RECOVERED
              </div>
              <div style="font-family:var(--font-display);font-size:16px;font-weight:800;color:var(--gold-bright);margin-top:2px;line-height:1.2;">
                ${u(o?.name??t.title)}
              </div>
            </div>
          </div>
          <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;letter-spacing:0.05em;color:${a?"var(--emerald-win)":"var(--crimson-alert)"};white-space:nowrap;flex-shrink:0;padding-top:2px;">
            ${a?"✦ RECOVERED":"◇ CLASSIFIED"}
          </span>
        </div>

        <div style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);line-height:1.38;">
          ${u(p)}
        </div>

        <p style="margin:0;font-size:13px;color:var(--ivory-primary);line-height:1.48;">
          ${u(E(o?.provenanceEssay??t.historicalProvenance))}
        </p>

        ${l.length>0?`
              <div style="display:flex;flex-direction:column;gap:8px;padding-top:4px;">
                <div class="ws-meta-hscroll">
                  ${l.map(c=>`
                        <button type="button" class="ws-meta-chip ${r?.id===c.id?"is-active":""}" data-obs-hotspot="${u(c.id)}" data-orbit-deg="${c.orbitDeg[0]}">
                          ◎ ${u(c.label)}
                        </button>
                      `).join("")}
                </div>
                ${r?`<div class="ws-meta-note is-cyan">
                        <strong>${u(r.label)}:</strong> ${u(E(r.note))}
                      </div>`:""}
              </div>
            `:""}
      </div>

      <!-- Conspiracy Provenance, Latches & UV Blacklight Readout (Frameless Hairlines) -->
      <div class="ws-meta-section" style="border-bottom:none;">
        ${a?`
              <div class="ws-meta-note">
                <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;margin-bottom:3px;">
                  CONSPIRACY PROVENANCE
                </div>
                ${u(E(o?.conspiracySignificance??t.conspiracyNote))}
              </div>
              ${this.relicLatchesOpen&&o?.latches&&o.latches.length>0?`
                    <div style="display:flex;flex-direction:column;gap:4px;padding-top:4px;">
                      <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
                        ⚙ UNSEALED MECHANICAL LATCHES
                      </div>
                      ${o.latches.map(c=>`
                            <div class="ws-meta-row" style="justify-content:flex-start;gap:8px;font-size:11.5px;">
                              <img src="./${u(c.glyphUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;flex-shrink:0;" />
                              <span><strong>${u(c.latchName)}:</strong> <code style="color:var(--gold-bright);">“${u(E(c.engraving))}”</code></span>
                            </div>
                          `).join("")}
                    </div>
                  `:""}
              ${this.uvBlacklightActive?`
                    <div class="ws-meta-note is-cyan" style="font-family:var(--font-mono);font-size:11px;">
                      ✦ ${u(E(o?.uvHiddenInscription??t.uvHiddenInscription))}
                    </div>
                  `:'<div style="font-family:var(--font-mono);font-size:10.5px;color:var(--ivory-dim);">Tap <strong>UV</strong> or <strong>Latches</strong> on the 3D stage to inspect concealed engravings.</div>'}
            `:`
              <div class="ws-meta-note is-crimson">
                <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--amber-warn);letter-spacing:0.06em;margin-bottom:2px;">
                  SEALED CONSPIRACY NOTE
                </div>
                ${u(E(t.unlockHowTo))}
              </div>
            `}
      </div>
    `}renderIntelFlashesVault(){const e=this.getCombinedFlashes(),s=this.deps.passport.getSnapshot().bookmarks.length;return`
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
            value="${u(this.searchQuery)}"
          />
          <button type="button" class="ws-meta-btn-gold" id="ws-obs-launch-quiz">
            Mastery Deck ▶
          </button>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;">
          <button type="button" class="ws-meta-chip ${this.includeSeedExemplars?"is-active":""}" id="ws-obs-toggle-seeds">
            ${this.includeSeedExemplars?"✓ Geneva Curated Included":"+ Include Geneva Curated"}
          </button>
          ${s===0?'<span style="font-size:11px;color:#9aa4b7;">Tap <strong>◇ Save Intel</strong> after any question to archive flashes here.</span>':`<span style="font-family:var(--font-mono);font-size:10.5px;color:var(--gold-bright);">${s} Personal Saved</span>`}
        </div>

        <!-- Single-Row Horizontal Scrollable 12-Domain Filter -->
        <div class="ws-meta-hscroll" aria-label="Filter by Domain">
          <button type="button" class="ws-meta-chip ${this.domainFilter==="ALL"?"is-active":""}" data-flash-domain="ALL">
            All Domains
          </button>
          ${D.map(t=>`
              <button type="button" class="ws-meta-chip ${this.domainFilter===t.id?"is-active":""}" data-flash-domain="${t.id}">
                <img src="./${u(t.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;" />
                ${u(t.shortName)}
              </button>
            `).join("")}
        </div>
      </div>

      <!-- Hairline-Divided Intel Flash List (Zero Nested Cards!) -->
      <div class="ws-meta-section" style="border-bottom:none;padding-top:4px;gap:0;">
        ${e.length>0?e.map(t=>{const a=W(t.domainId);return`
                    <div style="padding:13px 0;border-bottom:1px solid rgba(255,255,255,0.07);display:flex;flex-direction:column;gap:6px;">
                      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                        <span style="display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${a.accentHex};">
                          <img src="./${u(a.medallionUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;" />
                          ${u(a.name)}
                          <span style="color:var(--ivory-dim);font-weight:500;">· ${t.isSeedExemplar?"Geneva Archive":"★ Saved"}</span>
                        </span>
                        ${t.isSeedExemplar?"":`<button type="button" class="ws-meta-inline-link" data-remove-bookmark="${t.qid}" style="color:var(--ivory-dim);font-size:10.5px;">Remove</button>`}
                      </div>
                      <div style="font-size:13.5px;font-weight:600;color:var(--ivory-primary);line-height:1.4;">
                        ${u(E(t.prompt))}
                      </div>
                      <div style="font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--emerald-win);">
                        ✓ ${u(E(t.answer))}
                      </div>
                      <div class="ws-meta-note is-cyan" style="font-size:12px;">
                        ${u(E(t.whyExplanation))}
                      </div>
                    </div>
                  `}).join(""):'<div style="padding:28px 0;text-align:center;color:var(--ivory-muted);font-size:13px;">No Intel Flashes match your current filter.</div>'}
      </div>
    `}renderSelfQuizMode(){const e=this.srs.getDeckSummary(),s=this.srs.getAllCards(),t=this.getFilteredSrsCards(),a=Math.max(1,...e.boxCounts),o=[1,2,3,4,5],l=`
      <!-- Frameless 4-KPI Leitner Mastery Strip -->
      <div class="ws-meta-kpi-strip is-four-col" id="ws-srs-kpi-strip">
        <div class="ws-meta-kpi-cell" data-srs-kpi="due">
          <span class="ws-meta-kpi-lbl">Due Now</span>
          <span class="ws-meta-kpi-val" id="ws-srs-due-count" style="color:${e.dueCount>0?"var(--gold-bright)":"var(--emerald-win)"};">${e.dueCount}</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="total">
          <span class="ws-meta-kpi-lbl">Deck Cards</span>
          <span class="ws-meta-kpi-val" id="ws-srs-total-count">${e.totalCards}</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="retention">
          <span class="ws-meta-kpi-lbl">Retention</span>
          <span class="ws-meta-kpi-val" id="ws-srs-retention" style="color:var(--cyan-clue);">${e.retentionPct}%</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="mastered">
          <span class="ws-meta-kpi-lbl">Mastered</span>
          <span class="ws-meta-kpi-val" id="ws-srs-mastered-count" style="color:var(--emerald-win);">${e.masteredCount}</span>
        </div>
      </div>

      <!-- 5-Box Leitner Mastery Bars (Zero Nested Boxes) -->
      <div class="ws-meta-section" style="padding-top:10px;padding-bottom:10px;gap:8px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h3 class="ws-meta-section-title">5-Box Leitner Mastery Deck</h3>
          <span style="font-family:var(--font-mono);font-size:10px;color:#a5afc2;">
            ${this.srsBoxFilter?`Filtered: Box ${this.srsBoxFilter} (tap to clear)`:"Box 1 Immediate → Box 5 Mastered (21d)"}
          </span>
        </div>

        <div class="ws-srs-boxes-grid" id="ws-srs-box-bars" aria-label="Leitner Boxes 1 to 5">
          ${o.map(w=>{const S=e.boxCounts[w-1],A=e.totalCards>0?Math.max(S>0?14:0,Math.round(S/a*100)):0,_=Ct[w],M=this.srsBoxFilter===w;return`
                <button
                  type="button"
                  class="ws-srs-box-bar ${M?"is-active":""}"
                  data-srs-box="${w}"
                  data-srs-box-count="${S}"
                  aria-pressed="${M}"
                >
                  <div class="ws-srs-box-head">
                    <span class="ws-srs-box-name">Box ${w}</span>
                    <span class="ws-srs-box-count" style="color:${_};">${S}</span>
                  </div>
                  <div class="ws-srs-box-track">
                    <div class="ws-srs-box-fill" style="width:${A}%;background:${_};"></div>
                  </div>
                  <span class="ws-srs-box-interval">${u(Ne[w])}</span>
                </button>
              `}).join("")}
        </div>

        <!-- Filter Pills + Optional 3D Stage Review Launch (Zero Right-Edge Clip on 360px!) -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;" role="group" aria-label="Mastery Deck Filter">
          <button type="button" class="ws-meta-chip ${this.srsFilter==="DUE"?"is-active":""}" data-srs-filter="DUE">
            Due (${e.dueCount})
          </button>
          <button type="button" class="ws-meta-chip ${this.srsFilter==="ALL"?"is-active":""}" data-srs-filter="ALL">
            All (${e.totalCards})
          </button>
          <button type="button" class="ws-meta-chip ${this.srsFilter==="MASTERED"?"is-active":""}" data-srs-filter="MASTERED">
            Mastered (${e.masteredCount})
          </button>
          ${this.callbacks.onLaunchLivePrismReview&&t.length>0?`<button type="button" class="ws-meta-chip" id="ws-srs-launch-3d" style="color:var(--cyan-clue);">
                  3D Review ▶
                </button>`:""}
        </div>
      </div>
    `;if(e.totalCards===0)return`
        ${l}
        <div class="ws-meta-section" style="text-align:center;padding:24px 8px;border-bottom:none;gap:12px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--gold-bright);">
            Your Leitner Mastery Deck Is Ready
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
      `;const r=this.quizPickedIdx!==null||this.quizShutterFlipped;let d=r?this.srsActiveCard:null;if(!d&&t.length>0){const w=(this.quizCursor%t.length+t.length)%t.length;d=t[w]}if(!d){const w=this.srsFilter==="DUE"&&this.srsBoxFilter===null,S=w?"All Due Reviews Cleared":this.srsFilter==="MASTERED"?"No Cards in Box 5 Mastered Yet":"No Cards Match This Box Filter",A=w?`All ${e.totalCards} card${e.totalCards===1?"":"s"} in your Leitner deck are scheduled ahead. Review the full deck early or play another match to capture new cards.`:"Promote cards correctly through Boxes 1 → 5 or switch to All Saved & Missed to practice now.";return`
        ${l}
        <div class="ws-meta-section" style="text-align:center;padding:22px 8px;border-bottom:none;gap:12px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:${w?"var(--emerald-win)":"var(--gold-bright)"};">
            ${w?"✦ ":""}${u(S)}
          </div>
          <p style="margin:0 auto;max-width:440px;font-size:12.5px;color:var(--ivory-muted);line-height:1.45;">
            ${u(A)}
          </p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            <button type="button" class="ws-meta-btn-gold" id="ws-obs-reset-quiz-filter">
              Practice All Deck Cards (${e.totalCards}) ▶
            </button>
          </div>
        </div>
      `}let p=this.srsActiveOptions;if(!p||p.qid!==d.qid){const w=Re(d,s);p={qid:d.qid,options:w.options,correctIdx:w.correctIdx},this.srsActiveOptions=p}const{options:c,correctIdx:m}=p,n=W(d.domainId),h=this.srsLastAttemptResult?.newBox??d.box,f=["A","B","C","D"],g=d.source==="BOTH"?"Missed + Saved":d.source==="MISSED"?"Auto-Captured Miss":d.source==="BOOKMARKED"?"Saved Flash":"Geneva Archive",b=At(this.srsLastAttemptResult?.card.nextReviewAtMs??d.nextReviewAtMs),y=t.length>0?`${(this.quizCursor%t.length+t.length)%t.length+1}/${t.length}`:"Done",v=this.srsLastAttemptResult,x=v?v.wasCorrect?`<span class="ws-srs-promotion-badge is-promoted" id="ws-srs-promotion-badge">
            ${v.promoted?`✦ BOX ${v.previousBox} → BOX ${v.newBox} · NEXT IN ${v.nextIntervalLabel.toUpperCase()}`:`✦ BOX 5 MASTERED · NEXT IN ${v.nextIntervalLabel.toUpperCase()}`}
          </span>`:`<span class="ws-srs-promotion-badge is-reset" id="ws-srs-promotion-badge">
            ↺ RESET BOX ${v.previousBox} → BOX 1 · DUE NOW
          </span>`:"";return`
      ${l}
      <div class="ws-meta-section ws-srs-runner" id="ws-srs-runner" data-srs-active-qid="${d.qid}" data-srs-active-box="${h}" style="padding-top:12px;border-bottom:none;gap:12px;">
        <div class="ws-srs-card-header">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <img src="./${u(n.medallionUrl)}" alt="" style="width:22px;height:22px;object-fit:contain;flex-shrink:0;" />
            <div style="min-width:0;">
              <div style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${n.accentHex};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${u(n.name)}${d.subcatLabel?` · ${u(d.subcatLabel)}`:""}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:#a5afc2;">
                ${u(g)} · ${u(b)} · Card ${u(y)}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
            <span class="ws-srs-box-pill is-box-${h}" id="ws-srs-card-box-pill">
              ${u(Et[h])}
            </span>
          </div>
        </div>

        <div style="font-size:clamp(14.5px,1.55vw,17px);font-weight:600;color:var(--ivory-primary);line-height:1.44;">
          ${u(E(d.prompt))}
        </div>

        <!-- 4 Sleek Borderless A-D Review Strips -->
        <div class="ws-srs-options-list">
          ${c.map((w,S)=>{const A=S===m,_=this.quizPickedIdx===S;return`
                <button
                  type="button"
                  class="ws-srs-option-btn ${r?A?"is-correct":_?"is-wrong":"":""}"
                  data-quiz-pick="${S}"
                  data-srs-correct="${A?"true":"false"}"
                  ${r?"disabled":""}
                >
                  <span class="ws-srs-option-key">${f[S]}</span>
                  <span style="white-space:normal;line-height:1.3;">${u(w)}</span>
                </button>
              `}).join("")}
        </div>

        ${r?`
              <div class="ws-meta-note ${v?.wasCorrect?"is-emerald":"is-crimson"}" style="display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
                  <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${v?.wasCorrect?"var(--emerald-win)":"#ff99a5"};">
                    ${v?.wasCorrect?"✦ EXACT RECALL":`✓ ${u(E(d.correctAnswer))}`}
                  </span>
                  ${x}
                </div>
                ${d.whyExplanation?`<div style="font-size:12.5px;color:var(--ivory-primary);line-height:1.42;">
                        ${u(E(d.whyExplanation))}
                      </div>`:""}
              </div>
            `:""}

        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:4px;">
          ${r?`<span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">Session: ${this.quizCorrectCount}/${this.quizAttemptedCount} · Streak ${this.quizStreak}</span>`:'<button type="button" class="ws-meta-btn" id="ws-obs-quiz-flip">Reveal Answer</button>'}
          <button type="button" class="ws-meta-btn-gold" id="ws-obs-quiz-next">
            ${this.srsFilter==="DUE"?"Next Due Card ▶":"Next Card ▶"}
          </button>
        </div>
      </div>
    `}bindEvents(e){e.querySelector("#ws-obs-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),q(e,{closeBtnId:"ws-obs-close",onNavigate:t=>this.callbacks.onNavigateSection?.(t),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-obs-tab]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.obsTab;!a||a===this.activeTab||(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),a!=="RELICS_3D"&&this.deps.audio?.stopVoice(),this.activeTab=a,a==="RELICS_3D"?this.sync3DShowcase():a==="SELF_QUIZ"&&(this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter()),this.rerender())})}),e.querySelectorAll("[data-select-artifact]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.selectArtifact;a&&(this.deps.haptics?.sightlineSnap(),this.deps.audio?.playSfx("sightline_snap"),this.deps.audio?.stopVoice(),this.selectedArtifactId=a,this.uvBlacklightActive=!1,this.relicLatchesOpen=!1,this.activeHotspotId=null,this.sync3DShowcase(),this.rerender())})}),e.querySelectorAll("[data-obs-hotspot]").forEach(t=>{t.addEventListener("click",()=>{this.activeHotspotId=t.dataset.obsHotspot??null;const a=Number(t.dataset.orbitDeg)||0;this.deps.stage3d&&(this.deps.stage3d.prismRig.applyInspectDrag(a*Math.PI/180,.8),this.deps.stage3d.prismRig.releaseInspectDrag()),this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("sightline_snap"),this.rerender()})}),e.querySelector("#ws-obs-latch-toggle")?.addEventListener("click",()=>{this.relicLatchesOpen=!this.relicLatchesOpen,this.actuate3DRelicLatches(this.relicLatchesOpen),this.deps.haptics?.peel(this.relicLatchesOpen?2:1),this.deps.audio?.playSfx("shutter_peel"),this.relicLatchesOpen&&(this.callbacks.onLatchesOpened?.(this.selectedArtifactId),this.isArtifactUnlocked(this.selectedArtifactId)&&this.deps.audio?.playVoice("callout_vance_relic_latch.mp3")),this.rerender()}),e.querySelector("#ws-obs-uv-scan")?.addEventListener("click",()=>{this.uvBlacklightActive=!this.uvBlacklightActive,this.deps.haptics?.peel(2),this.deps.audio?.playSfx("shutter_peel"),this.uvBlacklightActive&&this.callbacks.onUvScan?.(this.selectedArtifactId),this.deps.stage3d&&this.deps.stage3d.setLightingMode(this.uvBlacklightActive?"TWIST_FRACTURE":this.selectedArtifactId==="championship_trophy"?"GOLD_RESONANCE":"BROADCAST"),this.rerender()});const s=e.querySelector("#ws-obs-flash-search");if(s){const t=a=>a.stopPropagation();s.addEventListener("keydown",t),s.addEventListener("keyup",t),s.addEventListener("keypress",t),s.addEventListener("input",()=>{const a=s.selectionStart??s.value.length;this.searchQuery=s.value,this.quizCursor=0,this.rerender();const o=e.querySelector("#ws-obs-flash-search");o&&(o.focus(),o.setSelectionRange(a,a))})}e.querySelector("#ws-obs-toggle-seeds")?.addEventListener("click",()=>{this.includeSeedExemplars=!this.includeSeedExemplars,this.quizCursor=0,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelector("#ws-obs-launch-quiz")?.addEventListener("click",()=>{this.activeTab="SELF_QUIZ",this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter(),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelectorAll("[data-flash-domain]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.flashDomain;this.domainFilter=a==="ALL"?"ALL":Number(a),this.quizCursor=0,this.quizPickedIdx=null,this.quizShutterFlipped=!1,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()})}),e.querySelectorAll("[data-remove-bookmark]").forEach(t=>{t.addEventListener("click",()=>{const a=Number(t.dataset.removeBookmark),o=this.deps.passport.getSnapshot().bookmarks.find(l=>l.qid===a);o&&(this.deps.passport.toggleIntelBookmark(o),this.srs.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-srs-box]").forEach(t=>{t.addEventListener("click",()=>{const a=Number(t.dataset.srsBox);a<1||a>5||(this.srsBoxFilter=this.srsBoxFilter===a?null:a,this.srsBoxFilter!==null&&this.srsFilter==="DUE"&&(this.srsFilter="ALL"),this.resetSrsRunnerTurn(!1),this.quizCursor=0,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-srs-filter]").forEach(t=>{t.addEventListener("click",()=>{const a=t.dataset.srsFilter;a&&(this.srsFilter=a,this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelector("#ws-srs-load-demo")?.addEventListener("click",()=>{this.srs.seedDemoCardsIfEmpty(),this.srsFilter="DUE",this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.deps.haptics?.correctBloom(),this.deps.audio?.playSfx("sightline_snap"),this.rerender()}),e.querySelector("#ws-srs-launch-3d")?.addEventListener("click",()=>{const t=this.getFilteredSrsCards();if(t.length===0||!this.callbacks.onLaunchLivePrismReview)return;const a=this.callbacks.onLaunchLivePrismReview;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.close(),a(t)}),e.querySelector("#ws-obs-reset-quiz-filter")?.addEventListener("click",()=>{this.srsFilter="ALL",this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelectorAll("[data-quiz-pick]").forEach(t=>{t.addEventListener("click",()=>{if(this.quizPickedIdx!==null||this.quizShutterFlipped)return;const a=Number(t.dataset.quizPick),o=this.getFilteredSrsCards();if(o.length===0)return;const l=(this.quizCursor%o.length+o.length)%o.length,r=o[l],d=this.srsActiveOptions&&this.srsActiveOptions.qid===r.qid?this.srsActiveOptions:{qid:r.qid,...Re(r,this.srs.getAllCards())};this.srsActiveOptions=d;const p=a===d.correctIdx;this.srsActiveCard=r,this.quizPickedIdx=a,this.quizAttemptedCount+=1,this.srsLastAttemptResult=this.srs.recordReviewAttempt(r.qid,p),p?(this.quizCorrectCount+=1,this.quizStreak+=1,this.deps.haptics?.correctBloom(),this.deps.audio?.playSfx("gold_resonance")):(this.quizStreak=0,this.deps.haptics?.wrongThud(!1),this.deps.audio?.playSfx("backfire_fracture")),this.rerender()})}),e.querySelector("#ws-obs-quiz-flip")?.addEventListener("click",()=>{if(this.quizPickedIdx!==null||this.quizShutterFlipped)return;const t=this.getFilteredSrsCards();if(t.length===0)return;const a=(this.quizCursor%t.length+t.length)%t.length,o=t[a];this.srsActiveCard=o,this.quizShutterFlipped=!0,this.quizAttemptedCount+=1,this.quizStreak=0,this.srsLastAttemptResult=this.srs.recordReviewAttempt(o.qid,!1),this.deps.haptics?.peel(2),this.deps.audio?.playSfx("shutter_peel"),this.rerender()}),e.querySelector("#ws-obs-quiz-next")?.addEventListener("click",()=>{this.srsFilter==="DUE"&&!!this.srsLastAttemptResult?.wasCorrect?this.quizCursor=0:this.quizCursor+=1,this.resetSrsRunnerTurn(!1),this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.rerender()})}}const He="ws_prism_atelier_equipped_v1",Fe="ws_prism_atelier_honour_unlocks_v1",Mt="ws_daily_global_feed_v2",Lt="ws_archive_descent_v2",Ot="ws_council_trials_v2",Dt=[{id:"SOVEREIGN_OBSIDIAN_24K",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:1,name:"Sovereign Obsidian & 24K Gold",shortBadge:"GENEVA ISSUE",milestoneTitle:"Default Geneva Charter Issue",unlockRequirementSummary:"Issued upon summons to The Vetting Chamber in Geneva.",craftProvenance:"Hand-milled Swiss obsidian-sapphire lenses suspended in brushed 24K Geneva horological gold with champagne Sightline optics.",hubOrigin:"ch",baseDomainId:0,swatchPrimaryCss:"#e5be67",swatchSecondaryCss:"#182238",swatchCrystalCss:"#121724",stage3dSkinId:"SOVEREIGN_OBSIDIAN",primaryMetalHex:15056487,secondaryMetalHex:1581107,metalRoughness:.21,shutterRoughness:.25,crystalColorHex:725020,attenuationHex:1977415,crystalRoughness:.16,iridescence:.22,ior:1.52,emissiveHex:16767108,emissiveIntensity:.05,sightlineBeamHex:16767093},{id:"DAMASCUS_STEEL_AMBER",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:2,name:"Damascus Folded Steel & Amber",shortBadge:"LONDON FORGE",milestoneTitle:"London Milestone · Sovereign Rotunda",unlockRequirementSummary:"London (GB) Visa · 2-Day Daily Streak · OR Initiate Honour.",craftProvenance:"320-layer acid-etched gunmetal Damascus gimbals paired with warm Baltic cognac-amber quartz facets forged beneath Westminster.",hubOrigin:"gb",baseDomainId:9,swatchPrimaryCss:"#b4c2d4",swatchSecondaryCss:"#434f61",swatchCrystalCss:"#5e3310",stage3dSkinId:"DAMASCUS_STEEL",primaryMetalHex:11846356,secondaryMetalHex:3884631,metalRoughness:.24,shutterRoughness:.28,crystalColorHex:1839110,attenuationHex:9062416,crystalRoughness:.17,iridescence:.18,ior:1.55,emissiveHex:16756034,emissiveIntensity:.06,sightlineBeamHex:16757575},{id:"KYOTO_URUSHI_KINTSUGI",legacyBlackboardSkinId:"KYOTO_KINTSUGI",order:3,name:"Kyoto Urushi Lacquer & Kintsugi Gold",shortBadge:"TOKYO ATELIER",milestoneTitle:"Tokyo Milestone · Shinkansen Sky Pavilion",unlockRequirementSummary:"Tokyo (JP) Visa · Archive Depth ≥ 5 · OR 3-Day Daily Streak.",craftProvenance:"Mirror-polished vermilion-ebony urushi lacquer shutters joined with 24K powdered maki-e kintsugi gold seams.",hubOrigin:"jp",baseDomainId:3,swatchPrimaryCss:"#f3cf72",swatchSecondaryCss:"#7a1622",swatchCrystalCss:"#3b0b14",stage3dSkinId:"KYOTO_KINTSUGI",primaryMetalHex:15978354,secondaryMetalHex:8001058,metalRoughness:.18,shutterRoughness:.15,crystalColorHex:2361103,attenuationHex:9378348,crystalRoughness:.14,iridescence:.32,ior:1.56,emissiveHex:16758892,emissiveIntensity:.06,sightlineBeamHex:16763496},{id:"IMPERIAL_EMERALD_BRASS",legacyBlackboardSkinId:"EMERALD_SOVEREIGN",order:4,name:"Imperial Emerald Quartz & Botanical Brass",shortBadge:"RIO CANOPY",milestoneTitle:"Rio Milestone · Botanical Glass Canopy",unlockRequirementSummary:"Rio de Janeiro (BR) Visa · OR Archive Descent Depth ≥ 10.",craftProvenance:"Deep Minas Gerais emerald-tourmaline crystal facets set in satin botanical brass tuned to Nadia Al-Mansoor’s acoustic key.",hubOrigin:"br",baseDomainId:2,swatchPrimaryCss:"#d9bc6a",swatchSecondaryCss:"#146944",swatchCrystalCss:"#0c472f",stage3dSkinId:"IMPERIAL_EMERALD",primaryMetalHex:14269546,secondaryMetalHex:1337668,metalRoughness:.22,shutterRoughness:.22,crystalColorHex:467994,attenuationHex:1606999,crystalRoughness:.16,iridescence:.28,ior:1.58,emissiveHex:5173933,emissiveIntensity:.06,sightlineBeamHex:4647848},{id:"PHARAONIC_LAPIS_ELECTRUM",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:5,name:"Pharaonic Lapis Lazuli & Solar Electrum",shortBadge:"CAIRO VAULT",milestoneTitle:"Cairo Milestone · Meridian Zero Vault",unlockRequirementSummary:"Cairo (EG) Visa · 5-Day Streak · OR Daily Top 25% Broadcast.",craftProvenance:"Celestial Badakhshan lapis lazuli crystal infused with pyrite starlight and pale silver-gold Solar Electrum from Giza’s oculus.",hubOrigin:"eg",baseDomainId:10,swatchPrimaryCss:"#f2e4b8",swatchSecondaryCss:"#1b3f96",swatchCrystalCss:"#122b6e",stage3dSkinId:"PHARAONIC_LAPIS",primaryMetalHex:15918264,secondaryMetalHex:1785750,metalRoughness:.19,shutterRoughness:.23,crystalColorHex:727621,attenuationHex:2380477,crystalRoughness:.16,iridescence:.48,ior:1.57,emissiveHex:8047615,emissiveIntensity:.06,sightlineBeamHex:7262463},{id:"AURORA_DICHROIC_TITANIUM",legacyBlackboardSkinId:"BLACK_SALON_CRIMSON",order:6,name:"Aurora Dichroic Titanium",shortBadge:"REYKJAVIK APEX",milestoneTitle:"Reykjavik / Grandmaster Milestone",unlockRequirementSummary:"Reykjavik (IS) Visa · Depth ≥ 15 · OR Global/Trials Elo ≥ 1550.",craftProvenance:"Heat-anodized Icelandic titanium housing a high-dispersion dichroic prism that refracts borealis cyan, violet, and white-gold.",hubOrigin:"is",baseDomainId:11,swatchPrimaryCss:"#dceeff",swatchSecondaryCss:"#4b3d82",swatchCrystalCss:"#16384c",stage3dSkinId:"AURORA_DICHROIC",primaryMetalHex:14479103,secondaryMetalHex:4075886,metalRoughness:.16,shutterRoughness:.17,crystalColorHex:661286,attenuationHex:1989747,crystalRoughness:.12,iridescence:.96,ior:1.64,emissiveHex:7534568,emissiveIntensity:.07,sightlineBeamHex:7075810},{id:"BLACK_SALON_CRIMSON_OBSIDIAN",legacyBlackboardSkinId:"BLACK_SALON_CRIMSON",order:7,name:"Black Salon Velvet Crimson & Carbon",shortBadge:"BLACK SALON",milestoneTitle:"Hall of Honours · Bluff & Ghost Trial Citation",unlockRequirementSummary:"Catch a Rival Bluff (CALL BLUFF) · OR Win a World Council Ghost Duel.",craftProvenance:"Matte forged-carbon tourbillon rings accented with ruby-garnet corundum facets from Teo Rojas’s underground Camden & Shinjuku tables.",hubOrigin:"gb",baseDomainId:4,swatchPrimaryCss:"#f0546a",swatchSecondaryCss:"#1b1622",swatchCrystalCss:"#240812",stage3dSkinId:"CRIMSON_BLACK_SALON",primaryMetalHex:14264428,secondaryMetalHex:2495003,metalRoughness:.22,shutterRoughness:.2,crystalColorHex:1705486,attenuationHex:8721964,crystalRoughness:.14,iridescence:.36,ior:1.58,emissiveHex:16733294,emissiveIntensity:.06,sightlineBeamHex:16736890},{id:"STERLING_CHRONOMETER_RHODIUM",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:8,name:"Vallée de Joux Rhodium & Sterling",shortBadge:"STERLING ENVOY",milestoneTitle:"Hall of Honours · Envoy Sterling Citation",unlockRequirementSummary:"Reach a 10-Question Streak · OR Earn 5 Tier-2 Sterling Medals.",craftProvenance:"Mirror-rhodium escapement bridges and coined 925 sterling silver shutters framing glacier-clear sapphire chronometer crystal.",hubOrigin:"ch",baseDomainId:1,swatchPrimaryCss:"#e4edf7",swatchSecondaryCss:"#2a3d59",swatchCrystalCss:"#0c1c33",stage3dSkinId:"SINGAPORE_SKYBRIDGE",primaryMetalHex:14871541,secondaryMetalHex:2373202,metalRoughness:.14,shutterRoughness:.18,crystalColorHex:661032,attenuationHex:2381450,crystalRoughness:.12,iridescence:.42,ior:1.56,emissiveHex:9098495,emissiveIntensity:.06,sightlineBeamHex:8047615},{id:"CONSUL_MALACHITE_VERDIGRIS",legacyBlackboardSkinId:"EMERALD_SOVEREIGN",order:9,name:"Consul Imperial Malachite & Bronze",shortBadge:"CONSUL BRONZE",milestoneTitle:"Hall of Honours · Consul 24K Gold Citation",unlockRequirementSummary:"Reach 20-Streak · 100 Lifetime Correct · OR 1,500 Domain ELO.",craftProvenance:"Banded malachite-jade crystal slabs encased in patinated treaty bronze and hand-burnished 22K Roman consul gold.",hubOrigin:"eg",baseDomainId:7,swatchPrimaryCss:"#d4a652",swatchSecondaryCss:"#18473c",swatchCrystalCss:"#08241d",stage3dSkinId:"METEORITE_ROSE_GOLD",primaryMetalHex:13936210,secondaryMetalHex:1590586,metalRoughness:.23,shutterRoughness:.24,crystalColorHex:466713,attenuationHex:1470040,crystalRoughness:.16,iridescence:.3,ior:1.57,emissiveHex:5697732,emissiveIntensity:.06,sightlineBeamHex:5434304},{id:"ARBITER_SMOKED_SAPPHIRE_PLATINUM",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:10,name:"Arbiter Smoked Sapphire & 950 Platinum",shortBadge:"ARBITER SAPPHIRE",milestoneTitle:"Hall of Honours · Very Rare Sapphire Citation",unlockRequirementSummary:"Singapore (SG) Visa · 35-Streak · OR Earn Any Tier-4 Sapphire Trophy.",craftProvenance:"Heavy 950 diplomatic platinum gimbals clasping midnight Ceylon smoked-sapphire facets cut for World Council Arbiters.",hubOrigin:"sg",baseDomainId:8,swatchPrimaryCss:"#dce4f2",swatchSecondaryCss:"#182952",swatchCrystalCss:"#081129",stage3dSkinId:"ARCTIC_CRYO_SAPPHIRE",primaryMetalHex:14476530,secondaryMetalHex:1517133,metalRoughness:.14,shutterRoughness:.17,crystalColorHex:462630,attenuationHex:2049436,crystalRoughness:.12,iridescence:.62,ior:1.61,emissiveHex:7125247,emissiveIntensity:.06,sightlineBeamHex:6468863},{id:"SOLAR_OCULUS_WHITE_GOLD",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:11,name:"Solar Oculus 18K White-Gold & Topaz",shortBadge:"6.0X ROULETTE",milestoneTitle:"Hall of Honours · High-Conviction Overclock Citation",unlockRequirementSummary:"Land 3× 6.0x Max Overclocks in 1 Match · OR 5× Bullseye Calibrations.",craftProvenance:"Satin 18K white-gold clamping jaws paired with imperial golden-topaz crystal engineered to withstand 6.0x Overclock thermal surges.",hubOrigin:"eg",baseDomainId:5,swatchPrimaryCss:"#fff0c2",swatchSecondaryCss:"#5e3c14",swatchCrystalCss:"#241506",stage3dSkinId:"ELECTRUM_MOTHER_OF_PEARL",primaryMetalHex:16246974,secondaryMetalHex:5190160,metalRoughness:.15,shutterRoughness:.2,crystalColorHex:1708037,attenuationHex:9395476,crystalRoughness:.13,iridescence:.44,ior:1.59,emissiveHex:16769149,emissiveIntensity:.06,sightlineBeamHex:16769666},{id:"CELESTIAL_DIAMOND_SOVEREIGN",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:12,name:"Mythic Celestial Diamond & Astral 24K",shortBadge:"MYTHIC 0.1%",milestoneTitle:"Hall of Honours · Mythic Tier-5 Sovereign Crown",unlockRequirementSummary:"Unlock ANY Tier-5 Mythic (0.1%) Trophy in the Hall of Honours!",craftProvenance:"Synthetic flawless Type-IIa diamond lenses with full-spectrum astral dispersion mounted in First Citizen Arbiter 24K bullion.",hubOrigin:"global",baseDomainId:11,swatchPrimaryCss:"#fff6d6",swatchSecondaryCss:"#2c2559",swatchCrystalCss:"#0e162b",stage3dSkinId:"MYTHIC_CELESTIAL_DIAMOND",primaryMetalHex:16376728,secondaryMetalHex:2498639,metalRoughness:.12,shutterRoughness:.14,crystalColorHex:594212,attenuationHex:2971770,crystalRoughness:.1,iridescence:1,ior:1.68,emissiveHex:10418175,emissiveIntensity:.07,sightlineBeamHex:16771481}],Bt=[{id:"SAPPHIRE_BLUEPRINT_CYANOTYPE",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:13,name:"Sapphire Blueprint Cyanotype & Brass",shortBadge:"CYANOTYPE",milestoneTitle:"Hall of Honours v2.0 · Master Blueprint Architect",unlockRequirementSummary:"Solve 10 Visual Blueprint Questions (#75) · Zero Pay-to-Win.",craftProvenance:"Architectural Prussian-blue cyanotype optics encased in drafting-instrument brushed brass tuned for Sapphire Hologram Plates.",hubOrigin:"ch",baseDomainId:3,swatchPrimaryCss:"#64e6ff",swatchSecondaryCss:"#0f2e5e",swatchCrystalCss:"#071a38",stage3dSkinId:"ARCTIC_CRYO_SAPPHIRE",primaryMetalHex:15123315,secondaryMetalHex:1061222,metalRoughness:.17,shutterRoughness:.19,crystalColorHex:399411,attenuationHex:1727656,crystalRoughness:.13,iridescence:.72,ior:1.6,emissiveHex:5690613,emissiveIntensity:.07,sightlineBeamHex:6612735},{id:"DUELIST_BLOODSTONE_PLATINUM",legacyBlackboardSkinId:"BLACK_SALON_CRIMSON",order:14,name:"Duelist Bloodstone & 950 Platinum",shortBadge:"H2H DUELIST",milestoneTitle:"Hall of Honours v2.0 · Ghost Split Breaker",unlockRequirementSummary:"Beat a Challenger Ghost in a 1v1 Head-to-Head Duel (#78).",craftProvenance:"Machined 950 platinum duel jaws clasping deep bloodstone-garnet crystal forged for one-tap Head-to-Head rivals.",hubOrigin:"gb",baseDomainId:5,swatchPrimaryCss:"#e5ecf5",swatchSecondaryCss:"#6e1120",swatchCrystalCss:"#2b0710",stage3dSkinId:"CRIMSON_BLACK_SALON",primaryMetalHex:15068405,secondaryMetalHex:7016994,metalRoughness:.15,shutterRoughness:.19,crystalColorHex:2229774,attenuationHex:9377837,crystalRoughness:.14,iridescence:.46,ior:1.59,emissiveHex:16734835,emissiveIntensity:.06,sightlineBeamHex:16739201},{id:"NEURAL_ENGRAM_AMETHYST_GOLD",legacyBlackboardSkinId:"KYOTO_KINTSUGI",order:15,name:"Neural Engram Amethyst & 24K Gold",shortBadge:"BOX-5 ENGRAM",milestoneTitle:"Hall of Honours v2.0 · Leitner Box-5 Polymath",unlockRequirementSummary:"Promote 5 Cards to Box 5 Mastered in the Leitner Deck (#81).",craftProvenance:"Synaptic Siberian amethyst crystal faceted with 24K Geneva memory-lattice filigree celebrating permanent recall mastery.",hubOrigin:"jp",baseDomainId:10,swatchPrimaryCss:"#f2cf7e",swatchSecondaryCss:"#5b2f8f",swatchCrystalCss:"#1b0e36",stage3dSkinId:"AURORA_DICHROIC",primaryMetalHex:15912830,secondaryMetalHex:5975951,metalRoughness:.16,shutterRoughness:.18,crystalColorHex:1444398,attenuationHex:6960555,crystalRoughness:.12,iridescence:.84,ior:1.63,emissiveHex:13081599,emissiveIntensity:.07,sightlineBeamHex:13805823},{id:"MENSA_QUANTUM_IRIDIUM_GLASS",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:16,name:"Mensa Quantum Iridium & Prismatic Glass",shortBadge:"MENSA 99TH",milestoneTitle:"Hall of Honours v2.0 · Mensa 99th-Percentile Laureate",unlockRequirementSummary:"Score ≥ 80% on a Mensa-Tier Round (#69) · Zero Pay-to-Win.",craftProvenance:"Ultra-dense sintered iridium-platinum gimbals suspending ultraviolet quantum-dispersion crystal reserved for 99th-percentile laureates.",hubOrigin:"global",baseDomainId:11,swatchPrimaryCss:"#e8f1ff",swatchSecondaryCss:"#39227a",swatchCrystalCss:"#091124",stage3dSkinId:"MYTHIC_CELESTIAL_DIAMOND",primaryMetalHex:15266303,secondaryMetalHex:3744378,metalRoughness:.11,shutterRoughness:.13,crystalColorHex:594212,attenuationHex:4927160,crystalRoughness:.09,iridescence:1,ior:1.7,emissiveHex:9368319,emissiveIntensity:.07,sightlineBeamHex:13148927}],T=[...Dt,...Bt];function Ge(){try{if(typeof localStorage>"u")return[];const i=localStorage.getItem(Fe);if(!i)return[];const e=JSON.parse(i);return Array.isArray(e)?e.filter(s=>T.some(t=>t.id===s)):[]}catch{return[]}}function $t(i){const e=Ge();if(e.includes(i))return!1;e.push(i);try{typeof localStorage<"u"&&localStorage.setItem(Fe,JSON.stringify(e))}catch{}return!0}function U(i){return T.find(s=>s.id===i)??T[0]}function j(){try{if(typeof localStorage<"u"){const i=localStorage.getItem(He);if(i&&T.some(e=>e.id===i))return i}}catch{}return"SOVEREIGN_OBSIDIAN_24K"}function Ue(){return U(j())}function qe(i){const e=U(i);try{typeof localStorage<"u"&&localStorage.setItem(He,e.id)}catch{}return e}function Nt(i){let e=0,s=Math.max(0,...i.dailyHistory.map(m=>m.percentile)),t=0,a=1200,o=0,l=0,r=0,d=0,p=0;try{if(typeof localStorage<"u"){const m=localStorage.getItem(Mt);if(m){const y=JSON.parse(m);e=Math.max(0,Math.floor(Number(y?.dailyStreak)||0)),s=Math.max(s,Math.floor(Number(y?.bestPercentile)||0))}const n=localStorage.getItem(Lt);if(n){const y=JSON.parse(n);t=Math.max(0,Math.floor(Number(y?.bestDepthEver)||0),Math.floor(Number(y?.depth)||0)-1)}const h=localStorage.getItem(Ot);if(h){const y=JSON.parse(h);a=Math.max(700,Math.floor(Number(y?.trialsElo)||1200)),o=Math.max(0,Math.floor(Number(y?.wins)||0))}const f=localStorage.getItem("ws_career_analytics_v1");if(f){const y=JSON.parse(f);l=Math.max(0,Math.floor(Number(y?.feats?.visualBlueprintsSolved)||0)),r=Math.max(r,Math.floor(Number(y?.feats?.duelGhostWins)||0)),p=Math.max(0,Math.floor(Number(y?.feats?.difficultyBestAccuracyPct?.MENSA)||0))}const g=localStorage.getItem("ws_duel_rivals_v2");if(g){const y=JSON.parse(g),v=Array.isArray(y?.history)?y.history.filter(w=>w?.winner==="PLAYER").length:0,x=y?.rivalsById&&typeof y.rivalsById=="object"?Object.values(y.rivalsById).reduce((w,S)=>w+Math.max(0,Math.floor(Number(S?.lossesAgainstPlayer)||0)),0):0;r=Math.max(r,v,x)}const b=localStorage.getItem("ws_spaced_repetition_v2");if(b){const y=JSON.parse(b);Array.isArray(y?.cards)&&(d=y.cards.filter(v=>Number(v?.box)===5).length)}}}catch{}const c=$.getSkillSnapshot();return{dailyStreak:e,dailyBestPercentile:s,bestEndlessDepth:t,trialsElo:a,trialsWins:o,globalElo:c.globalElo,bestStreak:c.bestStreak,totalCorrect:c.totalCorrect,visualBlueprintsSolved:l,duelWins:r,srsBox5Mastered:d,mensaBestAccPct:p}}function he(i,e){const s=i.getSnapshot(),t=e?.getSnapshot()??null,a=j(),o=Nt(s),l=new Set(Ge()),r=Math.max(1200,...s.domainElo);return T.map(d=>{const p=d.id===a,c=l.has(d.id);if(d.id==="SOVEREIGN_OBSIDIAN_24K")return{spec:d,unlocked:!0,equipped:p,progressRatio:1,progressLabel:"Geneva Standard Issue"};if(d.id==="DAMASCUS_STEEL_AMBER"){const n=s.visas.gb,h=c||!!n?.cleared||o.dailyStreak>=2||o.bestEndlessDepth>=3||!!t?.unlockedSkins.includes("DAMASCUS_TITANIUM"),f=h?1:Math.max((n?.missionsCompleted??0)/5,o.dailyStreak/2,o.bestEndlessDepth/3);return{spec:d,unlocked:h,equipped:p,progressRatio:Math.min(1,f),progressLabel:h?"Unlocked · London / Citation":`London ${n?.missionsCompleted??0}/5 · Streak ${o.dailyStreak}/2d`}}if(d.id==="KYOTO_URUSHI_KINTSUGI"){const n=s.visas.jp,h=c||!!n?.cleared||o.bestEndlessDepth>=5||o.dailyStreak>=3||!!t?.unlockedSkins.includes("KYOTO_KINTSUGI"),f=h?1:Math.max((n?.missionsCompleted??0)/5,o.bestEndlessDepth/5,o.dailyStreak/3);return{spec:d,unlocked:h,equipped:p,progressRatio:Math.min(1,f),progressLabel:h?"Unlocked · Tokyo / Depth 5":`Tokyo ${n?.missionsCompleted??0}/5 · Depth ${o.bestEndlessDepth}/5`}}if(d.id==="IMPERIAL_EMERALD_BRASS"){const n=s.visas.br,h=c||!!n?.cleared||o.bestEndlessDepth>=10||!!t?.unlockedSkins.includes("EMERALD_SOVEREIGN"),f=h?1:Math.max((n?.missionsCompleted??0)/5,o.bestEndlessDepth/10);return{spec:d,unlocked:h,equipped:p,progressRatio:Math.min(1,f),progressLabel:h?"Unlocked · Rio / Depth 10":`Rio ${n?.missionsCompleted??0}/5 · Depth ${o.bestEndlessDepth}/10`}}if(d.id==="PHARAONIC_LAPIS_ELECTRUM"){const n=s.visas.eg,h=c||!!n?.cleared||o.dailyStreak>=5||o.dailyBestPercentile>=75,f=h?1:Math.max((n?.missionsCompleted??0)/5,o.dailyStreak/5,o.dailyBestPercentile/75);return{spec:d,unlocked:h,equipped:p,progressRatio:Math.min(1,f),progressLabel:h?"Unlocked · Cairo / Top 25%":`Cairo ${n?.missionsCompleted??0}/5 · Best ${o.dailyBestPercentile}/75%ile`}}if(d.id==="AURORA_DICHROIC_TITANIUM"){const n=s.visas.is,h=Math.max(o.globalElo,o.trialsElo),f=c||!!n?.cleared||!!s.visas.global?.cleared||o.bestEndlessDepth>=15||h>=1550,g=f?1:Math.max((n?.missionsCompleted??0)/5,o.bestEndlessDepth/15,Math.max(0,(h-1200)/350));return{spec:d,unlocked:f,equipped:p,progressRatio:Math.min(1,g),progressLabel:f?"Unlocked · Reykjavik / Grandmaster":`Reykjavik ${n?.missionsCompleted??0}/5 · Elo ${h}/1550`}}if(d.id==="BLACK_SALON_CRIMSON_OBSIDIAN"){const n=c||o.trialsWins>=1||!!t?.unlockedSkins.includes("BLACK_SALON_CRIMSON");return{spec:d,unlocked:n,equipped:p,progressRatio:n?1:0,progressLabel:n?"Unlocked · Black Salon Citation":"Win 1 Ghost Duel or Catch a Rival Bluff"}}if(d.id==="STERLING_CHRONOMETER_RHODIUM"){const n=c||o.bestStreak>=10,h=n?1:Math.min(1,o.bestStreak/10);return{spec:d,unlocked:n,equipped:p,progressRatio:h,progressLabel:n?"Unlocked · Envoy Sterling Citation":`Peak Streak ${o.bestStreak} / 10`}}if(d.id==="CONSUL_MALACHITE_VERDIGRIS"){const n=c||o.bestStreak>=20||o.totalCorrect>=100||r>=1500,h=n?1:Math.min(1,Math.max(o.bestStreak/20,o.totalCorrect/100,Math.max(0,(r-1200)/300)));return{spec:d,unlocked:n,equipped:p,progressRatio:h,progressLabel:n?"Unlocked · Consul 24K Citation":`Correct ${o.totalCorrect}/100 · Max ELO ${r}/1500`}}if(d.id==="ARBITER_SMOKED_SAPPHIRE_PLATINUM"){const n=s.visas.sg,h=c||!!n?.cleared||o.bestStreak>=35||s.unlockedRelics.length>=6,f=h?1:Math.min(1,Math.max((n?.missionsCompleted??0)/5,o.bestStreak/35,s.unlockedRelics.length/6));return{spec:d,unlocked:h,equipped:p,progressRatio:f,progressLabel:h?"Unlocked · Arbiter Sapphire Citation":`Relics ${s.unlockedRelics.length}/6 · Streak ${o.bestStreak}/35`}}if(d.id==="SOLAR_OCULUS_WHITE_GOLD"){const n=c||o.bestStreak>=15;return{spec:d,unlocked:n,equipped:p,progressRatio:n?1:Math.min(1,o.bestStreak/15),progressLabel:n?"Unlocked · 6.0x Overclock Citation":"3× 6.0x Max Overclocks in 1 Match · OR 15-Streak"}}if(d.id==="CELESTIAL_DIAMOND_SOVEREIGN"){const n=c||!!(t&&t.achievedEndings.length>=4);return{spec:d,unlocked:n,equipped:p,progressRatio:n?1:Math.min(1,(t?.achievedEndings.length??0)/4),progressLabel:n?"Unlocked · Mythic 0.1% Crown":"Earn ANY Tier-5 Mythic Trophy in Hall of Honours"}}if(d.id==="SAPPHIRE_BLUEPRINT_CYANOTYPE"){const n=c||o.visualBlueprintsSolved>=10;return{spec:d,unlocked:n,equipped:p,progressRatio:n?1:Math.min(1,o.visualBlueprintsSolved/10),progressLabel:n?"Unlocked · Master Blueprint Architect":`Visual Blueprints Solved ${o.visualBlueprintsSolved}/10`}}if(d.id==="DUELIST_BLOODSTONE_PLATINUM"){const n=c||o.duelWins>=1;return{spec:d,unlocked:n,equipped:p,progressRatio:n?1:0,progressLabel:n?"Unlocked · Ghost Split Breaker":"Beat a Challenger Ghost in a 1v1 Duel"}}if(d.id==="NEURAL_ENGRAM_AMETHYST_GOLD"){const n=c||o.srsBox5Mastered>=5;return{spec:d,unlocked:n,equipped:p,progressRatio:n?1:Math.min(1,o.srsBox5Mastered/5),progressLabel:n?"Unlocked · Leitner Box-5 Polymath":`Box-5 Mastered Cards ${o.srsBox5Mastered}/5`}}const m=c||o.mensaBestAccPct>=80;return{spec:d,unlocked:m,equipped:p,progressRatio:m?1:Math.min(1,o.mensaBestAccPct/80),progressLabel:m?"Unlocked · Mensa 99th-Percentile Laureate":`Mensa Best Round ${o.mensaBestAccPct}% / 80%`}})}const Pt=["Facet_Carousel","Carousel_Spider","Facet_","Gimbal_Outer","Gimbal_Equatorial","Brass_Crown","Shutter_","Overclock_Jaw_","Firing_Pin","Prism_Pedestal","Ring_Outer","Ring_Mid","Petal_","Caliper_","Orb_Base","Cryptex_Ring_","Chronometer_Bezel","Chronometer_Needle"];function Ht(i){let e=i,s=!1,t=!1;for(;e;){const a=e.name||"";a.startsWith("Shutter_")||a.startsWith("Petal_")||a==="Gimbal_Equatorial"||a==="Ring_Mid"?(t=!0,s=!0):Pt.some(o=>a.startsWith(o))&&(s=!0),e=e.parent}return s?t?"SHUTTER_SECONDARY":"PRIMARY_METAL":"NONE"}function ae(i,e,s={}){s.updateDomainPalette&&i.setDomain(e.baseDomainId),i.equipPrismSkin({id:e.stage3dSkinId,name:e.name,metalHex:e.primaryMetalHex,secondaryMetalHex:e.secondaryMetalHex,shutterHex:e.secondaryMetalHex,crystalHex:e.crystalColorHex,accentHex:e.sightlineBeamHex,metalRoughness:e.metalRoughness,iridescence:e.iridescence,useDomainAccent:e.id==="SOVEREIGN_OBSIDIAN_24K"}),i.prismRig.root.traverse(a=>{if(a instanceof ct){a.color.setHex(e.emissiveHex);return}if(!(a instanceof dt)||"curveRadius"in a&&"sync"in a)return;if(a.material instanceof pt&&a.material.uniforms?.uColor){a.material.uniforms.uColor.value.setHex(e.sightlineBeamHex);return}if(a.geometry instanceof ht&&a.material instanceof ut){a.material.color.setHex(e.sightlineBeamHex);return}const l=(Array.isArray(a.material)?a.material:[a.material]).map(r=>{if(!r||!r.visible)return r;if(r instanceof mt&&(r.transmission>.25||r.transparent&&r.clearcoat>=.8&&r.opacity<.96))return r.color.setHex(e.crystalColorHex),r.attenuationColor.setHex(e.attenuationHex),r.roughness=e.crystalRoughness,r.iridescence=Math.max(.2,e.iridescence),r.ior=Math.max(1.77,e.ior),r.clearcoat=1,r.clearcoatRoughness=.04,r.emissive.setHex(e.emissiveHex),r.emissiveIntensity=e.emissiveIntensity,r;if(r instanceof ft){const d=Ht(a);if(d==="NONE"||r.metalness<.32&&r.roughness>.45&&d==="PRIMARY_METAL")return r;let p=r;return r.userData&&r.userData.__wsAtelierUnique||(p=r.clone(),p.userData={...r.userData,__wsAtelierUnique:!0}),d==="SHUTTER_SECONDARY"?(p.color.setHex(e.secondaryMetalHex),p.roughness=e.shutterRoughness,p.metalness=Math.max(.68,p.metalness)):(p.color.setHex(e.primaryMetalHex),p.roughness=e.metalRoughness,p.metalness=Math.max(.92,p.metalness)),p.envMapIntensity=Math.min(p.envMapIntensity||.62,.64),p}return r});a.material=Array.isArray(a.material)?l:l[0]})}function ze(i){const e=Ue();return ae(i,e,{updateDomainPalette:!1}),e}class Ft{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};previewFinishId=j();peelPreviewOpen=!1;previewReqToken=0;overclockSurgeTimer=null;constructor(e){this.deps=e,K()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.previewFinishId=j(),this.peelPreviewOpen=!1;const s=document.createElement("div");s.className="ws-meta-backdrop is-stage-dock",s.setAttribute("role","dialog"),s.setAttribute("aria-label","Prism Atelier — 12 Zero Pay-to-Win Finishes"),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=z(()=>this.handleBackOrClose()),this.syncUiRootVisibility(!0),this.syncLive3DPreview(U(this.previewFinishId),!0),this.renderInto(s,!0)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}this.handleClose()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}mount(e,s={}){this.unmount(),this.callbacks=s,this.previewFinishId=j(),this.mountedContainer=e,this.syncLive3DPreview(U(this.previewFinishId),!0),this.renderInto(e,!1)}unmount(){this.previewReqToken+=1,this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.overclockSurgeTimer&&(clearTimeout(this.overclockSurgeTimer),this.overclockSurgeTimer=null),this.syncUiRootVisibility(!1),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.deps.stage3d&&(this.deps.stage3d.setOverclockState(!1,0),ze(this.deps.stage3d)),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}syncUiRootVisibility(e){if(typeof document>"u")return;document.documentElement.classList.toggle("ws-3d-showcase-open",e);const s=document.getElementById("ui-root");s&&(s.style.visibility=e?"hidden":"visible")}async syncLive3DPreview(e,s=!1){const t=this.deps.stage3d;if(!t)return;const a=++this.previewReqToken;if(s){if(t.setLightingMode("BROADCAST"),await t.setMorph("SIGHTLINE_LOCK",{options:["SPIN","PEEL","OVERCLOCK",e.shortBadge],domainId:e.baseDomainId,initialIndex:0,peelTier:this.peelPreviewOpen?2:1}),a!==this.previewReqToken||!this.isOpen())return;t.setCameraShot(this.peelPreviewOpen?"PRISM_PEEL_INSPECT":"PRISM_STANDARD")}else t.setDomain(e.baseDomainId);a!==this.previewReqToken||!this.isOpen()||ae(t,e,{updateDomainPalette:!1})}rerender(){this.modalBackdrop?(this.modalBackdrop.className="ws-meta-backdrop is-stage-dock",this.syncUiRootVisibility(!0),this.renderInto(this.modalBackdrop,!0)):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,s){const t=he(this.deps.passport,this.deps.blackboard),a=t.find(c=>c.spec.id===this.previewFinishId)??t[0],o=a.spec,l=t.filter(c=>c.unlocked).length,r=`
      <div class="ws-meta-hscroll" style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.06);" aria-label="Select Prism Finish">
        ${t.map(c=>`
              <button
                type="button"
                class="ws-meta-chip ${c.spec.id===this.previewFinishId?"is-active":""}"
                data-atelier-select="${c.spec.id}"
              >
                <span style="width:16px;height:16px;border-radius:50%;flex-shrink:0;background:conic-gradient(${c.spec.swatchPrimaryCss} 0deg 140deg, ${c.spec.swatchSecondaryCss} 140deg 260deg, ${c.spec.swatchCrystalCss} 260deg 360deg);box-shadow:0 0 0 1px rgba(255,255,255,0.45);"></span>
                <span>${u(c.spec.shortBadge)}</span>
                ${c.equipped?'<span style="color:var(--emerald-win);font-size:10px;">✓</span>':c.unlocked?"":'<span style="opacity:0.65;font-size:10px;">◇</span>'}
              </button>
            `).join("")}
      </div>
    `,d=`
      <!-- Active Finish Editorial Header & Equip Action -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:11px;min-width:0;">
            <span style="width:34px;height:34px;border-radius:50%;flex-shrink:0;background:conic-gradient(${o.swatchPrimaryCss} 0deg 140deg, ${o.swatchSecondaryCss} 140deg 260deg, ${o.swatchCrystalCss} 260deg 360deg);box-shadow:0 0 0 1.5px var(--gold-bright);"></span>
            <div style="min-width:0;">
              <div style="font-family:var(--font-display);font-size:15.5px;font-weight:800;color:var(--gold-bright);line-height:1.2;">
                ${u(o.name)}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);margin-top:2px;">
                ${u(o.milestoneTitle)}
              </div>
            </div>
          </div>

          ${a.equipped?'<span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--emerald-win);white-space:nowrap;flex-shrink:0;">✓ EQUIPPED</span>':a.unlocked?'<button type="button" class="ws-meta-btn-gold" id="ws-atelier-equip-btn" style="flex-shrink:0;">Equip</button>':'<span style="font-family:var(--font-mono);font-size:10.5px;color:#9aa4b7;white-space:nowrap;flex-shrink:0;">◇ Preview</span>'}
        </div>

        <p style="margin:0;font-size:12.5px;color:var(--ivory-primary);line-height:1.45;">
          ${u(E(o.craftProvenance))}
        </p>

        <div style="display:flex;flex-direction:column;gap:5px;">
          <div style="display:flex;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:10.5px;color:${a.unlocked?"var(--emerald-win)":"var(--ivory-muted)"};">
            <span>${u(a.progressLabel)}</span>
            <span>${Math.round(a.progressRatio*100)}%</span>
          </div>
          <div class="ws-meta-progress-track">
            <div class="ws-meta-progress-fill" style="width:${Math.round(a.progressRatio*100)}%;background:${a.unlocked?"var(--emerald-win)":"var(--gold-bright)"};"></div>
          </div>
        </div>
      </div>

      <!-- Hairline Catalog of All Zero-Pay-to-Win Finishes -->
      <div class="ws-meta-section" style="border-bottom:none;gap:2px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;">
          <span class="ws-meta-section-title">All ${T.length} Finishes (${l}/${T.length})</span>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--emerald-win);">✦ 100% Zero Pay-to-Win</span>
        </div>
        ${t.map(c=>`
              <button
                type="button"
                class="ws-meta-row is-interactive ${c.spec.id===this.previewFinishId?"is-focused":""}"
                data-atelier-select="${c.spec.id}"
                style="width:100%;text-align:left;"
              >
                <span style="display:inline-flex;align-items:center;gap:10px;min-width:0;">
                  <span style="width:20px;height:20px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg, ${c.spec.swatchPrimaryCss} 0%, ${c.spec.swatchSecondaryCss} 55%, ${c.spec.swatchCrystalCss} 100%);box-shadow:0 0 0 1px rgba(255,255,255,0.4);"></span>
                  <span style="min-width:0;display:flex;flex-direction:column;">
                    <span style="font-size:12.5px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${c.spec.order}. ${u(c.spec.name)}</span>
                    <span style="font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">${u(c.spec.unlockRequirementSummary)}</span>
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${c.equipped?"var(--emerald-win)":c.unlocked?"var(--gold-bright)":"var(--ivory-dim)"};flex-shrink:0;">
                  ${c.equipped?"✓ ON":c.unlocked?"◆ READY":`${Math.round(c.progressRatio*100)}%`}
                </span>
              </button>
            `).join("")}
      </div>
    `;if(s){const c=B("ATELIER",{isModal:!0,closeBtnId:"ws-atelier-close",canNavigate:!!this.callbacks.onNavigateSection,floatingVariant:!0});e.innerHTML=`
        <!-- Open Unobstructed 50dvh Portrait / 50vw Landscape 3D Prism Stage -->
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-atelier-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${c}
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
            <span class="ws-meta-eyebrow">${l}/${T.length} Unlocked</span>
          </div>
          ${r}
          <div class="ws-meta-body-scroll">
            ${d}
          </div>
        </div>
      `,this.bindEvents(e);return}const p=B("ATELIER",{isModal:!1,closeBtnId:"ws-atelier-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-atelier-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">PRISM ATELIER</h2>
              <div class="ws-meta-eyebrow">${l}/${T.length} Finishes Unlocked</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${p}
          </div>
        </div>
        ${r}
        <div class="ws-meta-body-scroll">
          ${d}
        </div>
      </div>
    `,this.bindEvents(e)}bindEvents(e){e.querySelector("#ws-atelier-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),q(e,{closeBtnId:"ws-atelier-close",onNavigate:s=>this.callbacks.onNavigateSection?.(s),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-atelier-select]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.atelierSelect;if(!t)return;this.previewFinishId=t;const a=U(t);this.deps.haptics?.sightlineSnap(),this.deps.audio?.playSfx("sightline_snap"),this.syncLive3DPreview(a,!0),this.rerender()})}),e.querySelector("#ws-atelier-equip-btn")?.addEventListener("click",()=>{const t=he(this.deps.passport,this.deps.blackboard).find(o=>o.spec.id===this.previewFinishId);if(!t||!t.unlocked)return;const a=qe(t.spec.id);this.deps.blackboard?.unlockSkin(a.legacyBlackboardSkinId,!0),this.deps.stage3d&&ae(this.deps.stage3d,a,{updateDomainPalette:!1}),this.deps.haptics?.lockThunk(),this.deps.audio?.playSfx("vault_thunk"),this.deps.audio?.playSfx("gold_resonance"),this.callbacks.onEquipSkin?.(a),this.rerender()}),e.querySelector("#ws-atelier-peel-toggle")?.addEventListener("click",()=>{this.peelPreviewOpen=!this.peelPreviewOpen,this.deps.haptics?.peel(this.peelPreviewOpen?2:1),this.deps.audio?.playSfx("shutter_peel"),this.syncLive3DPreview(U(this.previewFinishId),!0),this.rerender()}),e.querySelector("#ws-atelier-overclock-pulse")?.addEventListener("click",()=>{const s=this.deps.stage3d;s&&(this.overclockSurgeTimer&&clearTimeout(this.overclockSurgeTimer),this.deps.haptics?.overclockPulse(.85),this.deps.audio?.playSfx("overclock_charge"),s.setOverclockState(!0,.92),this.overclockSurgeTimer=setTimeout(()=>{this.overclockSurgeTimer=null,this.isOpen()&&(s.setOverclockState(!1,0),this.deps.audio?.playSfx("gold_resonance"))},950))})}}const Gt="ws_council_trials_v2",C={SOVEREIGN:{id:"SOVEREIGN",name:"The Sovereign Bloc",epithet:"The Iron Laurel",chairName:"Chancellor Ingrid Lindqvist",chairTitle:"Sovereign Council Chair · Former Nordic PM",fieldEnvoyLabel:"London Rotunda Seat",portraitCutoutUrl:"./assets/portraits_cutout/lindqvist.png",philosophyPillars:"Order · Heritage · Treaty Protocol",manifestoQuote:"Civilization endures only when truth is weighed inside treaty law, institutional memory, and disciplined stewardship.",affinityDomains:[0,8,3,10],passportCrestReward:"IRON LAUREL LEGATE · SOVEREIGN BLOC",accentHex:"#f2cf7e",secondaryHex:"#6c5326"},HORIZON:{id:"HORIZON",name:"The Horizon Collective",epithet:"The Glass Spire",chairName:"Director Kenji Takahashi",chairTitle:"Horizon Collective Chair · Tokyo Spire",fieldEnvoyLabel:'Envoy: Soren "Echo" Kael',portraitCutoutUrl:"./assets/portraits_cutout/soren.png",philosophyPillars:"Velocity · Optimization · Calculated Risk",manifestoQuote:"Consensus moves at the speed of yesterday’s crisis. Tomorrow belongs to minds fast enough to model reality before the clock blinks.",affinityDomains:[6,1,11],passportCrestReward:"GLASS SPIRE VANGUARD · HORIZON COLLECTIVE",accentHex:"#56d4f5",secondaryHex:"#184b6e"},AGORA:{id:"AGORA",name:"The Agora Coalition",epithet:"The Open Commons",chairName:"Ambassador Amara Okafor",chairTitle:"Agora Coalition Envoy · Civic Assembly",fieldEnvoyLabel:"Envoy: Nadia Al-Mansoor",portraitCutoutUrl:"./assets/portraits_cutout/nadia.png",philosophyPillars:"Transparency · Empathy · Living Culture",manifestoQuote:"Knowledge locked inside an Alpine vault becomes leverage. Shared openly across humanity, it becomes liberation.",affinityDomains:[2,4,7,9,5],passportCrestReward:"OPEN COMMONS ENVOY · AGORA COALITION",accentHex:"#39d49a",secondaryHex:"#15543e"}},Ae=["SOVEREIGN","HORIZON","AGORA"],Ut=[{hub:"ch",city:"Geneva",baseLeader:"SOVEREIGN"},{hub:"gb",city:"London",baseLeader:"SOVEREIGN"},{hub:"jp",city:"Tokyo",baseLeader:"HORIZON"},{hub:"br",city:"Rio",baseLeader:"AGORA"},{hub:"eg",city:"Cairo",baseLeader:"AGORA"},{hub:"is",city:"Reykjavik",baseLeader:"HORIZON"},{hub:"sg",city:"Singapore",baseLeader:"HORIZON"},{hub:"global",city:"Apex Forum",baseLeader:"SOVEREIGN"}];function qt(i,e){return i==="SOVEREIGN"?`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
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
    </svg>`)}`:i==="HORIZON"?`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
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
  </svg>`)}`}function zt(){const i=Math.floor(Date.now()/36e5)%240,e={trialsElo:1200,wins:0,losses:0,salonTrophies:0,factionStandings:{SOVEREIGN:14820+i*3,HORIZON:14690+i*4,AGORA:14760+i*3}};try{if(typeof localStorage>"u")return e;const s=localStorage.getItem(Gt);if(!s)return e;const t=JSON.parse(s);return!t||typeof t!="object"?e:{trialsElo:Math.max(700,Math.round(Number(t.trialsElo)||1200)),wins:Math.max(0,Math.floor(Number(t.wins)||0)),losses:Math.max(0,Math.floor(Number(t.losses)||0)),salonTrophies:Math.max(0,Math.floor(Number(t.salonTrophies)||0)),factionStandings:{SOVEREIGN:Math.max(14e3,Math.floor(Number(t.factionStandings?.SOVEREIGN)||e.factionStandings.SOVEREIGN)),HORIZON:Math.max(14e3,Math.floor(Number(t.factionStandings?.HORIZON)||e.factionStandings.HORIZON)),AGORA:Math.max(14e3,Math.floor(Number(t.factionStandings?.AGORA)||e.factionStandings.AGORA))}}}catch{return e}}class Kt{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};justPledgedToast=null;constructor(e){this.deps=e,K()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.justPledgedToast=null;const s=document.createElement("div");s.className="ws-meta-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","World Council Factions & Seasonal League"),s.addEventListener("click",t=>{t.target===s&&this.handleClose()}),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=z(()=>this.handleBackOrClose()),this.renderInto(s,!0)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}const e=this.callbacks.onClose;this.close(),e?.()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}mount(e,s={}){this.unmount(),this.callbacks=s,this.mountedContainer=e,this.renderInto(e,!1)}unmount(){this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}computePsychometricFit(){const e=$.getSkillVector(),s=this.deps.passport.getSnapshot(),t=this.deps.blackboard.getSnapshot(),a=d=>{let p=0;for(const c of d){const m=e[c]?.elo??s.domainElo[c]??1200;p+=(m-800)/1400*100}return p/Math.max(1,d.length)},o=a(C.SOVEREIGN.affinityDomains)+t.councilFavor*.25,l=a(C.HORIZON.affinityDomains)+Math.max(0,50-t.axisIntegrity*.2)*.25,r=a(C.AGORA.affinityDomains)+(t.publicTrust*.2+Math.max(0,t.axisIntegrity)*.12);return{SOVEREIGN:Math.min(99,Math.max(48,Math.round(52+o*.55))),HORIZON:Math.min(99,Math.max(48,Math.round(52+l*.55))),AGORA:Math.min(99,Math.max(48,Math.round(52+r*.55)))}}buildCupStandings(){const e=this.deps.trialsMode?.getHubOverview(),s=zt(),t=e?.factionStandings??s.factionStandings,a=e?.pledgedFaction??this.deps.blackboard.getSnapshot().pledgedFaction,o=this.computePsychometricFit(),l=Math.max(1,t.SOVEREIGN+t.HORIZON+t.AGORA);return{standings:[...Ae].sort((p,c)=>t[c]-t[p]).map((p,c)=>({faction:C[p],rank:c+1,cupPoints:t[p],sharePct:Number((t[p]/l*100).toFixed(1)),psychometricFitPct:o[p],isPledged:a===p})),trialsElo:e?.trialsElo??s.trialsElo,wins:e?.wins??s.wins,losses:e?.losses??s.losses,salonTrophies:e?.salonTrophies??s.salonTrophies,pledgedFaction:a}}rerender(){this.modalBackdrop?this.renderInto(this.modalBackdrop,!0):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,s){const t=this.deps.passport.getChallengerName(),a=this.deps.passport.getSnapshot(),{standings:o,trialsElo:l,wins:r,salonTrophies:d,pledgedFaction:p}=this.buildCupStandings(),c=r>=12?"HIGH LEGATE":r>=6?"COUNCILOR":r>=2?"ATTACHÉ":"DIPLOMATIC ENVOY",m=B("FACTIONS",{isModal:s,closeBtnId:"ws-factions-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-factions-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">COUNCIL BLOCS</h2>
              <div class="ws-meta-eyebrow">${u(t)} · ${c} · ELO ${l}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${m}
          </div>
        </div>

        <div class="ws-meta-body-scroll">
          ${this.justPledgedToast?`
                <div class="ws-meta-section" style="padding-top:0;">
                  <div class="ws-meta-note" style="box-shadow:inset 3px 0 0 ${C[this.justPledgedToast].accentHex};color:var(--ivory-primary);">
                    ✒ <strong>Allegiance Stamped:</strong> ${u(t)} now represents
                    <strong style="color:${C[this.justPledgedToast].accentHex};">${u(C[this.justPledgedToast].name)}</strong>
                    in World Council Trials.
                  </div>
                </div>
              `:""}

          <!-- Season 1 World Council Cup Standings (Frameless Hairline Section) -->
          <div class="ws-meta-section" style="${this.justPledgedToast?"":"padding-top:0;"}">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">Season 1 Mandate Cup Standings</h3>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-dim);">
                +150 Ghost Win · +250 Black Salon${d>0?` · ${d} Crown`:""}
              </span>
            </div>

            <div style="display:flex;flex-direction:column;gap:9px;">
              ${o.map(n=>`
                    <div style="display:flex;flex-direction:column;gap:4px;">
                      <div style="display:flex;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11.5px;">
                        <span style="color:${n.faction.accentHex};font-weight:700;">
                          #${n.rank} ${u(n.faction.name)}${n.isPledged?" · ★ Pledged":""}
                        </span>
                        <span style="color:var(--ivory-primary);font-weight:700;flex-shrink:0;">
                          ${n.cupPoints.toLocaleString("en-US")} <span style="color:var(--ivory-dim);font-weight:500;">(${n.sharePct}%)</span>
                        </span>
                      </div>
                      <div class="ws-meta-progress-track" style="height:5px;">
                        <div class="ws-meta-progress-fill" style="width:${Math.min(100,Math.max(12,n.sharePct*2.4)).toFixed(1)}%;background:${n.faction.accentHex};"></div>
                      </div>
                    </div>
                  `).join("")}
            </div>

            <!-- Horizontal Scrollable 8-Hub Regional Control Strip -->
            <div class="ws-meta-hscroll" style="padding-top:4px;" aria-label="Regional Hub Control">
              ${Ut.map(n=>{const h=a.visas[n.hub]?.cleared&&p?p:n.baseLeader,f=C[h];return`
                  <span style="flex:0 0 auto;font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);padding:4px 9px;border-radius:999px;background:rgba(255,255,255,0.04);">
                    ${u(n.city)} · <strong style="color:${f.accentHex};">${u(h)}</strong>
                  </span>
                `}).join("")}
            </div>
          </div>

          <!-- 3 World Council Bloc Allegiance Panels (Frameless Top-Hairline Editorial Columns) -->
          <div class="ws-meta-section">
            <h3 class="ws-meta-section-title">Council Blocs &amp; Allegiance</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(265px,1fr));gap:18px 22px;align-items:stretch;">
              ${Ae.map(n=>{const h=C[n],f=o.find(v=>v.faction.id===n),g=this.deps.factionCrestUrls?.[n]??`./assets/factions/faction_${n.toLowerCase()}.png`,b=qt(n),y=p===n;return`
                  <div style="display:flex;flex-direction:column;gap:10px;padding:14px 0 6px;border-top:2px solid ${h.accentHex};${y?`background:linear-gradient(180deg, ${h.accentHex}12 0%, transparent 55%);padding-left:10px;padding-right:10px;`:""}">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img
                        src="${u(g)}"
                        data-fallback-src="${u(b)}"
                        alt="${u(h.name)} Crest"
                        style="width:50px;height:50px;object-fit:contain;flex-shrink:0;"
                      />
                      <div style="min-width:0;flex:1 1 auto;">
                        <div style="font-family:var(--font-mono);font-size:9.5px;font-weight:700;color:${h.accentHex};letter-spacing:0.07em;">
                          “${u(h.epithet.toUpperCase())}” · FIT ${f.psychometricFitPct}%
                        </div>
                        <div style="font-family:var(--font-display);font-size:15px;font-weight:800;color:var(--ivory-primary);margin-top:1px;">
                          ${u(h.name)}
                        </div>
                        <div style="font-size:11px;color:var(--ivory-dim);">
                          ${u(h.philosophyPillars)}
                        </div>
                      </div>
                    </div>

                    <!-- Frameless Chair & Cutout Portrait Strip -->
                    <div style="display:flex;align-items:center;gap:9px;padding:4px 0;">
                      <div style="width:38px;height:38px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 35%, ${h.accentHex}44, #080b11);flex-shrink:0;">
                        <img src="${h.portraitCutoutUrl}" alt="${u(h.chairName)}" style="width:100%;height:100%;object-fit:cover;object-position:top center;" />
                      </div>
                      <div style="min-width:0;">
                        <div style="font-size:12px;font-weight:700;color:var(--ivory-primary);">
                          ${u(h.chairName)}
                        </div>
                        <div style="font-family:var(--font-mono);font-size:9.5px;color:var(--ivory-muted);">
                          ${u(h.chairTitle)} · ${u(h.fieldEnvoyLabel)}
                        </div>
                      </div>
                    </div>

                    <p style="margin:0;font-size:12px;font-style:italic;color:var(--ivory-muted);line-height:1.42;">
                      “${u(E(h.manifestoQuote))}”
                    </p>

                    <!-- Inline Affinity Domain Medallions -->
                    <div style="display:flex;flex-wrap:wrap;gap:6px 10px;">
                      ${h.affinityDomains.map(v=>{const x=D[v];return`
                            <span style="display:inline-flex;align-items:center;gap:4px;font-size:10.5px;color:var(--ivory-muted);">
                              <img src="./${u(x.medallionUrl)}" alt="" style="width:14px;height:14px;object-fit:contain;" />
                              ${u(x.shortName)}
                            </span>
                          `}).join("")}
                    </div>

                    <div style="margin-top:auto;padding-top:6px;">
                      ${y?`<button type="button" class="ws-meta-btn" style="width:100%;color:${h.accentHex};background:rgba(255,255,255,0.04);box-shadow:inset 3px 0 0 ${h.accentHex};opacity:1;" disabled>
                              ✓ Allegiance Pledged
                            </button>`:`<button type="button" class="ws-meta-btn-gold" data-pledge-faction="${n}" style="width:100%;">
                              ✒ Pledge to ${u(n)}
                            </button>`}
                    </div>
                  </div>
                `}).join("")}
            </div>
          </div>

          <!-- Async Kinetic Ghost Contenders & Black Salon Quick-Launch -->
          ${this.callbacks.onLaunchGhostDuel||this.callbacks.onLaunchBlackSalon?this.renderGhostContendersStrip(gt):""}
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
          ${e.slice(0,4).map(s=>{const t=C[s.faction];return`
                <button
                  type="button"
                  class="ws-meta-row is-interactive"
                  data-challenge-ghost="${u(s.id)}"
                  style="width:100%;text-align:left;"
                >
                  <span style="min-width:0;">
                    <span style="display:block;font-size:12.5px;font-weight:700;color:var(--ivory-primary);line-height:1.25;">
                      ${u(s.handle)} <span style="color:var(--ivory-dim);font-weight:500;">(${u(s.countryCode)})</span>
                    </span>
                    <span style="display:block;font-family:var(--font-mono);font-size:10px;color:${t.accentHex};">
                      ${u(s.faction)} · ELO ${s.elo}
                    </span>
                  </span>
                  <span style="color:var(--gold-bright);font-family:var(--font-mono);font-size:11px;font-weight:700;flex-shrink:0;">⚔ Duel ›</span>
                </button>
              `}).join("")}
        </div>
      </div>
    `}bindEvents(e){e.querySelectorAll("img[data-fallback-src]").forEach(s=>{s.addEventListener("error",()=>{const t=s.dataset.fallbackSrc;t&&s.src!==t&&(s.src=t)},{once:!0})}),e.querySelector("#ws-factions-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),q(e,{closeBtnId:"ws-factions-close",onNavigate:s=>this.callbacks.onNavigateSection?.(s),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-pledge-faction]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.pledgeFaction;if(!t||!(t in C))return;this.deps.trialsMode?this.deps.trialsMode.pledgeFaction(t):this.deps.blackboard.setPledgedFaction(t);const a=C[t];this.deps.passport.unlockTitleCrest(a.passportCrestReward,!0),this.justPledgedToast=t,this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp"),this.deps.audio?.playSfx("gold_resonance"),this.callbacks.onPledgeFaction?.(t),this.rerender()})}),e.querySelectorAll("[data-challenge-ghost]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.challengeGhost;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.close(),this.callbacks.onLaunchGhostDuel?.(t)})}),e.querySelector("#ws-factions-black-salon")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.close(),this.callbacks.onLaunchBlackSalon?.()})}}const _e="ws_career_analytics_v1",ce=2e3,de=140,Ie=2500,Ke=["SIGHTLINE_LOCK","CODEX_DUAL_RING","CALIBRATOR_DIAL","GAUNTLET_SHATTER","HERO_ARTIFACT_SYNTHESIS","GLOBE_PIN_DROP"],Ve=["CAMPAIGN","DAILY","BRIEFING","ENDLESS","TRIALS","PROLOGUE"],Vt=["< 3.0s","3–6s","6–10s","10–15s","15s+"];function O(i,e,s){return Number.isFinite(i)?Math.max(e,Math.min(s,i)):e}function pe(i){try{return new Date(i).toISOString().slice(0,10)}catch{return"2026-11-22"}}function Ce(i,e){if(e)return"TRIALS";const s=(i??"CAMPAIGN").toUpperCase();return s==="BLACK_SALON"||s==="GHOST_TRIALS"?"TRIALS":s==="PROLOGUE"||s==="CAMPAIGN"||s==="DAILY"||s==="BRIEFING"||s==="ENDLESS"||s==="TRIALS"?s:"CAMPAIGN"}function Yt(i){if(!i)return null;const e=i.trim().toUpperCase();return e==="MIDDLE_SCHOOL"||e==="MID_SCHOOL"||e==="EASY"?"MIDDLE_SCHOOL":e==="HIGH_SCHOOL"?"HIGH_SCHOOL":e==="COLLEGE"||e==="MEDIUM"?"COLLEGE":e==="GRADUATE"||e==="HARD"?"GRADUATE":e==="MENSA"||e==="GENIUS"?"MENSA":null}function ie(){return{MIDDLE_SCHOOL:0,HIGH_SCHOOL:0,COLLEGE:0,GRADUATE:0,MENSA:0}}function Wt(i){const e=(i??"SIGHTLINE_LOCK").toUpperCase();return e==="SIGHTLINE_LOCK"||e==="CODEX_DUAL_RING"||e==="CALIBRATOR_DIAL"||e==="GAUNTLET_SHATTER"||e==="HERO_ARTIFACT_SYNTHESIS"||e==="GLOBE_PIN_DROP"?e:"SIGHTLINE_LOCK"}function jt(){const i=Array.from({length:12},()=>({right:0,wrong:0,totalResponseMs:0,peakElo:1200,lastElo:1200})),e={SIGHTLINE_LOCK:{right:0,wrong:0},CODEX_DUAL_RING:{right:0,wrong:0},CALIBRATOR_DIAL:{right:0,wrong:0},GAUNTLET_SHATTER:{right:0,wrong:0},HERO_ARTIFACT_SYNTHESIS:{right:0,wrong:0},GLOBE_PIN_DROP:{right:0,wrong:0}},s={1:{right:0,wrong:0},2:{right:0,wrong:0},3:{right:0,wrong:0}},t={};for(const a of Ve)t[a]={right:0,wrong:0,matchesPlayed:0,matchesWon:0,bestScore:0};return{schemaVersion:1,backfilledFromLegacy:!1,totalRight:0,totalWrong:0,totalResponseMs:0,totalPointsEarned:0,currentStreak:0,bestStreak:0,fastUnder3sStreak:0,bestFastUnder3sStreak:0,globalEloLatest:1200,globalEloPeak:1200,uniqueSolvedQids:[],uniqueSolvedCount:0,byDomain:i,byArchetype:e,byPeelTier:s,byMode:t,speedBuckets:[{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0}],overclock:{safeLockWins:0,safeLockMisses:0,overclockWins:0,overclockMisses:0,max6xWins:0,backfires:0,consecutiveMax6xWins:0,bestConsecutiveMax6xWins:0,currentMatchMax6xWins:0,currentMatchPeelsUsed:0},feats:{passportStamped:!1,prologueCleared:!1,act1Cleared:!1,campaignCompleted:!1,rivalBluffsCaught:0,sorenCoinBluffDefeated:!1,bluffEchoCancels:0,uvScansCount:0,scannedRelicIds:[],openedLatchKeys:[],atelierFinishesEquipped:0,backstageInterrogations:0,factionPledged:!1,flawlessBossWins:0,unpeeledBossWins:0,perfectMatchesCount:0,max3x6xInSingleMatch:!1,calibratorBullseyes:0,codexFirstTryLocks:0,ghostTrialWins:0,blackSalonWins:0,dailyBroadcastsCompleted:0,completedDailyDates:[],maxEndlessDepth:0,achievedEndings:[],difficultyRoundsCleared:ie(),difficultyBestAccuracyPct:ie(),globeBullseyes300Km:0,globeNoPeel120Km:0,visualBlueprintsSolved:0,tier1ColdDomains:[],duelChallengesPlayed:0,duelGhostWins:0,srsReviewsCompleted:0,offlinePacksCached:0},dailyBuckets:{},sessions:[],events:[]}}class Qt{state;listeners=new Set;constructor(e){this.state=this.load(),e&&this.syncAndBackfillFromProfile(e)}load(){const e=jt();try{if(typeof localStorage>"u")return e;const s=localStorage.getItem(_e);if(!s)return e;const t=JSON.parse(s);if(!t||typeof t!="object")return e;const a=Array.isArray(t.byDomain)&&t.byDomain.length===12?t.byDomain.map(p=>({right:Math.max(0,Math.floor(Number(p?.right)||0)),wrong:Math.max(0,Math.floor(Number(p?.wrong)||0)),totalResponseMs:Math.max(0,Math.floor(Number(p?.totalResponseMs)||0)),peakElo:O(Math.round(Number(p?.peakElo)||1200),600,2600),lastElo:O(Math.round(Number(p?.lastElo)||1200),600,2600)})):e.byDomain,o={...e.byArchetype};if(t.byArchetype&&typeof t.byArchetype=="object")for(const p of Ke){const c=t.byArchetype[p];c&&(o[p]={right:Math.max(0,Math.floor(Number(c.right)||0)),wrong:Math.max(0,Math.floor(Number(c.wrong)||0))})}const l={...e.byPeelTier};if(t.byPeelTier&&typeof t.byPeelTier=="object")for(const p of["1","2","3"]){const c=t.byPeelTier[p];c&&(l[p]={right:Math.max(0,Math.floor(Number(c.right)||0)),wrong:Math.max(0,Math.floor(Number(c.wrong)||0))})}const r={...e.byMode};if(t.byMode&&typeof t.byMode=="object")for(const p of Ve){const c=t.byMode[p];c&&(r[p]={right:Math.max(0,Math.floor(Number(c.right)||0)),wrong:Math.max(0,Math.floor(Number(c.wrong)||0)),matchesPlayed:Math.max(0,Math.floor(Number(c.matchesPlayed)||0)),matchesWon:Math.max(0,Math.floor(Number(c.matchesWon)||0)),bestScore:Math.max(0,Math.floor(Number(c.bestScore)||0))})}const d=e.speedBuckets.map((p,c)=>{const m=Array.isArray(t.speedBuckets)?t.speedBuckets[c]:null;return{right:Math.max(0,Math.floor(Number(m?.right)||p.right)),wrong:Math.max(0,Math.floor(Number(m?.wrong)||p.wrong))}});return{schemaVersion:1,backfilledFromLegacy:!!t.backfilledFromLegacy,totalRight:Math.max(0,Math.floor(Number(t.totalRight)||0)),totalWrong:Math.max(0,Math.floor(Number(t.totalWrong)||0)),totalResponseMs:Math.max(0,Math.floor(Number(t.totalResponseMs)||0)),totalPointsEarned:Math.max(0,Math.floor(Number(t.totalPointsEarned)||0)),currentStreak:Math.max(0,Math.floor(Number(t.currentStreak)||0)),bestStreak:Math.max(0,Math.floor(Number(t.bestStreak)||0)),fastUnder3sStreak:Math.max(0,Math.floor(Number(t.fastUnder3sStreak)||0)),bestFastUnder3sStreak:Math.max(0,Math.floor(Number(t.bestFastUnder3sStreak)||0)),globalEloLatest:O(Math.round(Number(t.globalEloLatest)||1200),600,2600),globalEloPeak:O(Math.round(Number(t.globalEloPeak)||1200),600,2600),uniqueSolvedQids:Array.isArray(t.uniqueSolvedQids)?t.uniqueSolvedQids.slice(-Ie):[],uniqueSolvedCount:Math.max(0,Math.floor(Number(t.uniqueSolvedCount)||0)),byDomain:a,byArchetype:o,byPeelTier:l,byMode:r,speedBuckets:d,overclock:{...e.overclock,...t.overclock??{}},feats:{...e.feats,...t.feats??{},scannedRelicIds:Array.isArray(t.feats?.scannedRelicIds)?t.feats.scannedRelicIds:[],openedLatchKeys:Array.isArray(t.feats?.openedLatchKeys)?t.feats.openedLatchKeys:[],achievedEndings:Array.isArray(t.feats?.achievedEndings)?t.feats.achievedEndings:[],completedDailyDates:Array.isArray(t.feats?.completedDailyDates)?t.feats.completedDailyDates.filter(p=>typeof p=="string").slice(-365):[],difficultyRoundsCleared:{...ie(),...t.feats?.difficultyRoundsCleared??{}},difficultyBestAccuracyPct:{...ie(),...t.feats?.difficultyBestAccuracyPct??{}},globeBullseyes300Km:Math.max(0,Math.floor(Number(t.feats?.globeBullseyes300Km)||0)),globeNoPeel120Km:Math.max(0,Math.floor(Number(t.feats?.globeNoPeel120Km)||0)),visualBlueprintsSolved:Math.max(0,Math.floor(Number(t.feats?.visualBlueprintsSolved)||0)),tier1ColdDomains:Array.isArray(t.feats?.tier1ColdDomains)?t.feats.tier1ColdDomains.map(p=>Math.floor(Number(p))).filter(p=>Number.isFinite(p)&&p>=0&&p<=11):[],duelChallengesPlayed:Math.max(0,Math.floor(Number(t.feats?.duelChallengesPlayed)||0)),duelGhostWins:Math.max(0,Math.floor(Number(t.feats?.duelGhostWins)||0)),srsReviewsCompleted:Math.max(0,Math.floor(Number(t.feats?.srsReviewsCompleted)||0)),offlinePacksCached:Math.max(0,Math.floor(Number(t.feats?.offlinePacksCached)||0))},dailyBuckets:t.dailyBuckets&&typeof t.dailyBuckets=="object"?t.dailyBuckets:{},sessions:Array.isArray(t.sessions)?t.sessions.slice(-de):[],events:Array.isArray(t.events)?t.events.slice(-ce):[]}}catch{return e}}save(){try{typeof localStorage<"u"&&localStorage.setItem(_e,JSON.stringify(this.state))}catch{}const e=this.getSnapshot();for(const s of this.listeners)s(e)}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}syncAndBackfillFromProfile(e){const s=e.getSnapshot(),t=$.getSkillSnapshot();let a=!1;(s.persona||s.hasCustomName)&&!this.state.feats.passportStamped&&s.persona&&(this.state.feats.passportStamped=!0,a=!0),s.visas.ch?.cleared&&!this.state.feats.prologueCleared&&(this.state.feats.prologueCleared=!0,a=!0),s.visas.gb?.cleared&&s.visas.jp?.cleared&&!this.state.feats.act1Cleared&&(this.state.feats.act1Cleared=!0,a=!0),s.visas.global?.cleared&&!this.state.feats.campaignCompleted&&(this.state.feats.campaignCompleted=!0,a=!0);for(const l of s.dailyHistory)l?.utcDate&&!this.state.feats.completedDailyDates.includes(l.utcDate)&&(this.state.feats.completedDailyDates.push(l.utcDate),a=!0);this.state.feats.completedDailyDates.length>365&&(this.state.feats.completedDailyDates=this.state.feats.completedDailyDates.slice(-365)),s.dailyHistory.length>this.state.feats.dailyBroadcastsCompleted&&(this.state.feats.dailyBroadcastsCompleted=s.dailyHistory.length,a=!0);for(let l=0;l<12;l++){const r=Math.max(s.domainElo[l]??1200,t.domainElo[l]??1200);r!==this.state.byDomain[l].lastElo&&(this.state.byDomain[l].lastElo=r,this.state.byDomain[l].peakElo=Math.max(this.state.byDomain[l].peakElo,r),a=!0)}t.globalElo>0&&t.totalAnswered>0&&(this.state.globalEloLatest=t.globalElo,this.state.globalEloPeak=Math.max(this.state.globalEloPeak,t.globalElo));const o=this.state.totalRight+this.state.totalWrong;if(!this.state.backfilledFromLegacy&&o===0&&t.totalAnswered>0){this.state.backfilledFromLegacy=!0,this.state.totalRight=Math.max(0,t.totalCorrect),this.state.totalWrong=Math.max(0,t.totalAnswered-t.totalCorrect),this.state.bestStreak=Math.max(this.state.bestStreak,t.bestStreak),this.state.currentStreak=t.currentStreak,this.state.uniqueSolvedCount=Math.max(this.state.uniqueSolvedCount,t.totalCorrect);for(let r=0;r<12;r++){const d=t.domainAttempts[r]??0,p=t.domainCorrect[r]??0;this.state.byDomain[r].right=p,this.state.byDomain[r].wrong=Math.max(0,d-p)}const l=pe(Date.now());this.state.dailyBuckets[l]={dateKey:l,right:this.state.totalRight,wrong:this.state.totalWrong,totalResponseMs:t.totalAnswered*5800,maxStreak:t.bestStreak,pointsEarned:this.state.totalRight*2400,max6xWins:0,backfires:0,eloEnd:t.globalElo},a=!0}a&&this.save()}getSnapshot(){return{...this.state,byDomain:this.state.byDomain.map(e=>({...e})),byArchetype:{SIGHTLINE_LOCK:{...this.state.byArchetype.SIGHTLINE_LOCK},CODEX_DUAL_RING:{...this.state.byArchetype.CODEX_DUAL_RING},CALIBRATOR_DIAL:{...this.state.byArchetype.CALIBRATOR_DIAL},GAUNTLET_SHATTER:{...this.state.byArchetype.GAUNTLET_SHATTER},HERO_ARTIFACT_SYNTHESIS:{...this.state.byArchetype.HERO_ARTIFACT_SYNTHESIS},GLOBE_PIN_DROP:{...this.state.byArchetype.GLOBE_PIN_DROP}},byPeelTier:{1:{...this.state.byPeelTier[1]},2:{...this.state.byPeelTier[2]},3:{...this.state.byPeelTier[3]}},byMode:{CAMPAIGN:{...this.state.byMode.CAMPAIGN},DAILY:{...this.state.byMode.DAILY},BRIEFING:{...this.state.byMode.BRIEFING},ENDLESS:{...this.state.byMode.ENDLESS},TRIALS:{...this.state.byMode.TRIALS},PROLOGUE:{...this.state.byMode.PROLOGUE}},speedBuckets:this.state.speedBuckets.map(e=>({...e})),overclock:{...this.state.overclock},feats:{...this.state.feats,scannedRelicIds:[...this.state.feats.scannedRelicIds],openedLatchKeys:[...this.state.feats.openedLatchKeys],achievedEndings:[...this.state.feats.achievedEndings],completedDailyDates:[...this.state.feats.completedDailyDates],difficultyRoundsCleared:{...this.state.feats.difficultyRoundsCleared},difficultyBestAccuracyPct:{...this.state.feats.difficultyBestAccuracyPct},tier1ColdDomains:[...this.state.feats.tier1ColdDomains]},dailyBuckets:{...this.state.dailyBuckets},sessions:[...this.state.sessions],events:[...this.state.events]}}recordQuestionOutcome(e){const s=e.ts??Date.now(),t=pe(s),a=O(Math.floor(Number(e.domainId)||0),0,11),o=Ce(e.mode),l=Wt(e.archetype),r=e.peelTier===2?2:e.peelTier===3?3:1,d=O(Number(e.overclockCharge01)||0,0,1),p=d>=.08,c=d>=.88&&r===1,m=!!e.backfired||!e.correct&&p,n=O(Math.round(Number(e.responseTimeMs)||5200),150,6e4),h=Math.max(0,Math.round(Number(e.pointsDelta)||0)),f=$.getSkillSnapshot(),g=O(Math.round(Number(e.eloAfter)||f.globalElo||this.state.globalEloLatest),600,2600),b={ts:s,dateKey:t,qid:Math.max(0,Math.floor(Number(e.qid)||0)),domainId:a,mode:o,hubId:e.hubId??"ch",archetype:l,correct:!!e.correct,peelTier:r,overclockCharge01:Number(d.toFixed(2)),backfired:m,bluffCalled:!!e.bluffCalled,bullseye:!!e.bullseye,responseTimeMs:n,pointsDelta:h,eloAfter:g,promptSnippet:e.promptSnippet?.slice(0,90),answerLabel:e.answerLabel?.slice(0,44)};this.state.events.push(b),this.state.events.length>ce&&this.state.events.splice(0,this.state.events.length-ce),this.state.totalResponseMs+=n,this.state.totalPointsEarned+=h,this.state.globalEloLatest=g,this.state.globalEloPeak=Math.max(this.state.globalEloPeak,g),r>1&&(this.state.overclock.currentMatchPeelsUsed+=1),e.bluffEchoCancelled&&(this.state.feats.bluffEchoCancels+=1),e.bluffCalled&&(this.state.feats.rivalBluffsCaught+=1);const y=n<3e3?0:n<6e3?1:n<1e4?2:n<15e3?3:4,v=this.state.byDomain[a];v.totalResponseMs+=n;const x=f.domainElo[a]??v.lastElo;v.lastElo=x,v.peakElo=Math.max(v.peakElo,x);const w=String(r);if(b.correct){if(this.state.totalRight+=1,this.state.currentStreak+=1,this.state.bestStreak=Math.max(this.state.bestStreak,this.state.currentStreak),n<3e3?(this.state.fastUnder3sStreak+=1,this.state.bestFastUnder3sStreak=Math.max(this.state.bestFastUnder3sStreak,this.state.fastUnder3sStreak)):this.state.fastUnder3sStreak=0,b.qid>0&&!this.state.uniqueSolvedQids.includes(b.qid)&&(this.state.uniqueSolvedQids.push(b.qid),this.state.uniqueSolvedQids.length>Ie&&this.state.uniqueSolvedQids.shift(),this.state.uniqueSolvedCount+=1),v.right+=1,this.state.byArchetype[l].right+=1,this.state.byPeelTier[w].right+=1,this.state.byMode[o].right+=1,this.state.speedBuckets[y].right+=1,b.bullseye&&l==="CALIBRATOR_DIAL"&&(this.state.feats.calibratorBullseyes+=1),l==="GLOBE_PIN_DROP"){const _=typeof e.globeDistanceKm=="number"&&Number.isFinite(e.globeDistanceKm)?Math.max(0,e.globeDistanceKm):null;(b.bullseye||_!==null&&_<=300)&&(this.state.feats.globeBullseyes300Km+=1),r===1&&_!==null&&_<=120&&(this.state.feats.globeNoPeel120Km+=1)}e.hasVisualPlate&&(this.state.feats.visualBlueprintsSolved+=1),r===1&&!this.state.feats.tier1ColdDomains.includes(a)&&this.state.feats.tier1ColdDomains.push(a),l==="CODEX_DUAL_RING"&&(e.firstTryCodex??r===1)&&(this.state.feats.codexFirstTryLocks+=1),p?(this.state.overclock.overclockWins+=1,c&&(this.state.overclock.max6xWins+=1,this.state.overclock.consecutiveMax6xWins+=1,this.state.overclock.bestConsecutiveMax6xWins=Math.max(this.state.overclock.bestConsecutiveMax6xWins,this.state.overclock.consecutiveMax6xWins),this.state.overclock.currentMatchMax6xWins+=1,this.state.overclock.currentMatchMax6xWins>=3&&(this.state.feats.max3x6xInSingleMatch=!0))):this.state.overclock.safeLockWins+=1}else this.state.totalWrong+=1,this.state.currentStreak=0,this.state.fastUnder3sStreak=0,v.wrong+=1,this.state.byArchetype[l].wrong+=1,this.state.byPeelTier[w].wrong+=1,this.state.byMode[o].wrong+=1,this.state.speedBuckets[y].wrong+=1,p?(this.state.overclock.overclockMisses+=1,this.state.overclock.consecutiveMax6xWins=0):this.state.overclock.safeLockMisses+=1,m&&(this.state.overclock.backfires+=1,this.state.overclock.consecutiveMax6xWins=0);const S=this.state.dailyBuckets[t]??{dateKey:t,right:0,wrong:0,totalResponseMs:0,maxStreak:0,pointsEarned:0,max6xWins:0,backfires:0,eloEnd:g};b.correct?S.right+=1:S.wrong+=1,S.totalResponseMs+=n,S.maxStreak=Math.max(S.maxStreak,this.state.currentStreak),S.pointsEarned+=h,b.correct&&c&&(S.max6xWins+=1),m&&(S.backfires+=1),S.eloEnd=g,this.state.dailyBuckets[t]=S;const A=Object.keys(this.state.dailyBuckets).sort();return A.length>365&&delete this.state.dailyBuckets[A[0]],this.save(),this.getSnapshot()}recordMatchCompleted(e){const s=Date.now(),t=pe(s),a=!!e.isBlackSalon||(e.mode??"").toUpperCase()==="BLACK_SALON",o=Ce(e.mode,a),l=$.getSkillSnapshot(),r=O(Math.round(Number(e.eloAfter)||l.globalElo||this.state.globalEloLatest),600,2600),d=Math.max(0,Math.floor(Number(e.correctCount)||0)),p=Math.max(d,Math.floor(Number(e.totalQuestions)||d)),c=Math.max(0,p-d),m=e.peelsUsed!==void 0?e.peelsUsed:this.state.overclock.currentMatchPeelsUsed,n=e.max6xOverclockWinsInMatch!==void 0?e.max6xOverclockWinsInMatch:this.state.overclock.currentMatchMax6xWins,h=Math.max(0,Math.floor(Number(e.shieldsLost)||0)),f=this.state.byMode[o];if(f.matchesPlayed+=1,e.won&&(f.matchesWon+=1),f.bestScore=Math.max(f.bestScore,Math.round(e.score||0)),p>=5&&d===p&&(this.state.feats.perfectMatchesCount+=1),n>=3&&(this.state.feats.max3x6xInSingleMatch=!0),o==="PROLOGUE"&&e.won&&(this.state.feats.prologueCleared=!0),o==="DAILY"&&!e.isReplay){const b=e.utcDate&&e.utcDate.trim()||t;this.state.feats.completedDailyDates.includes(b)||(this.state.feats.completedDailyDates.push(b),this.state.feats.completedDailyDates.length>365&&this.state.feats.completedDailyDates.shift(),this.state.feats.dailyBroadcastsCompleted=Math.max(this.state.feats.dailyBroadcastsCompleted+1,this.state.feats.completedDailyDates.length))}o==="ENDLESS"&&e.endlessDepthReached&&(this.state.feats.maxEndlessDepth=Math.max(this.state.feats.maxEndlessDepth,Math.floor(e.endlessDepthReached))),o==="TRIALS"&&e.won&&(this.state.feats.ghostTrialWins+=1,a&&(this.state.feats.blackSalonWins+=1)),e.won&&e.isBossShowdown&&(h===0&&(this.state.feats.flawlessBossWins+=1),m===0&&(this.state.feats.unpeeledBossWins+=1)),e.won&&e.defeatedRivalId==="soren"&&e.sorenCoinTellCaughtInMatch&&(this.state.feats.sorenCoinBluffDefeated=!0),e.endingUnlocked&&!this.state.feats.achievedEndings.includes(e.endingUnlocked)&&(this.state.feats.achievedEndings.push(e.endingUnlocked),this.state.feats.campaignCompleted=!0);const g=Yt(e.difficultyPreset??e.difficultyTier);if(g&&p>0){const b=Math.round(d/p*100);this.state.feats.difficultyBestAccuracyPct[g]=Math.max(this.state.feats.difficultyBestAccuracyPct[g]??0,b),(g==="MIDDLE_SCHOOL"||e.won||b>=50)&&(this.state.feats.difficultyRoundsCleared[g]=(this.state.feats.difficultyRoundsCleared[g]??0)+1)}return this.state.sessions.push({ts:s,dateKey:t,mode:o,hubId:e.hubId,won:!!e.won,right:d,wrong:c,score:Math.max(0,Math.round(e.score||0)),eloAfter:r,maxOverclockWinsInMatch:n,peelsUsedInMatch:m,shieldsLostInMatch:h,isBossShowdown:!!e.isBossShowdown,isBlackSalon:a}),this.state.sessions.length>de&&this.state.sessions.splice(0,this.state.sessions.length-de),this.state.overclock.currentMatchMax6xWins=0,this.state.overclock.currentMatchPeelsUsed=0,this.save(),this.getSnapshot()}recordSpecialFeat(e,s){switch(e){case"PASSPORT_STAMPED":this.state.feats.passportStamped=!0;break;case"PROLOGUE_CLEARED":this.state.feats.prologueCleared=!0;break;case"RIVAL_BLUFF_CAUGHT":this.state.feats.rivalBluffsCaught+=1;break;case"SOREN_COIN_BLUFF_DEFEATED":this.state.feats.sorenCoinBluffDefeated=!0;break;case"BLUFF_ECHO_CANCEL":this.state.feats.bluffEchoCancels+=1;break;case"UV_RELIC_SCANNED":this.state.feats.uvScansCount+=1,s?.relicId&&!this.state.feats.scannedRelicIds.includes(s.relicId)&&this.state.feats.scannedRelicIds.push(s.relicId);break;case"RELIC_LATCH_OPENED":{const t=s?.relicId??"meridian_astrolabe",a=s?.latchCount??3;for(let o=0;o<a;o++){const l=`${t}:${o}`;this.state.feats.openedLatchKeys.includes(l)||this.state.feats.openedLatchKeys.push(l)}break}case"ATELIER_SKIN_EQUIPPED":this.state.feats.atelierFinishesEquipped+=1;break;case"BACKSTAGE_INTERROGATION":this.state.feats.backstageInterrogations+=1;break;case"FACTION_PLEDGED":this.state.feats.factionPledged=!0;break;case"ACT1_CLEARED":this.state.feats.act1Cleared=!0;break;case"CAMPAIGN_COMPLETED":this.state.feats.campaignCompleted=!0;break;case"ENDING_UNLOCKED":this.state.feats.campaignCompleted=!0,s?.endingId&&!this.state.feats.achievedEndings.includes(s.endingId)&&this.state.feats.achievedEndings.push(s.endingId);break;case"BLACK_SALON_VICTORY":this.state.feats.blackSalonWins+=1,this.state.feats.ghostTrialWins+=1;break;case"DUEL_CHALLENGE_PLAYED":this.state.feats.duelChallengesPlayed+=1;break;case"DUEL_GHOST_BEATEN":this.state.feats.duelChallengesPlayed+=1,this.state.feats.duelGhostWins+=1;break;case"SRS_REVIEW_COMPLETED":this.state.feats.srsReviewsCompleted+=1;break;case"OFFLINE_PACK_CACHED":this.state.feats.offlinePacksCached+=1;break}return s?.depth&&(this.state.feats.maxEndlessDepth=Math.max(this.state.feats.maxEndlessDepth,Math.floor(s.depth))),this.save(),this.getSnapshot()}}const Te={SIGHTLINE_LOCK:"Sightline Prism",CODEX_DUAL_RING:"Codex Dual-Ring",CALIBRATOR_DIAL:"Calibrator Dial",GAUNTLET_SHATTER:"Gauntlet Shatter",HERO_ARTIFACT_SYNTHESIS:"Boss Relic Synth",GLOBE_PIN_DROP:"Globe Pin-Drop"};function te(i,e){const s=i+e;return s<=0?"—":`${(i/s*100).toFixed(1)}%`}function Jt(i,e){if(e==="LAST_25"){const l=i.events.slice(-25);if(l.length===0&&i.totalRight+i.totalWrong>0){const p=i.totalRight+i.totalWrong;return[{label:"Career",sublabel:`${i.totalRight}R / ${i.totalWrong}W`,right:i.totalRight,wrong:i.totalWrong,rollingAccPct:Math.round(i.totalRight/p*100)}]}let r=0,d=0;return l.map((p,c)=>{d+=1,p.correct&&(r+=1);const m=W(p.domainId);return{label:`Q${c+1}`,sublabel:`${m.shortName} · ${(p.responseTimeMs/1e3).toFixed(1)}s · ${p.correct?`+${p.pointsDelta} PTS`:"MISS"}`,right:p.correct?1:0,wrong:p.correct?0:1,rollingAccPct:Math.round(r/d*100)}})}const s=e==="DAYS_7"?7:e==="DAYS_30"?30:365,t=Object.keys(i.dailyBuckets).sort().slice(-s);let a=0,o=0;return t.map(l=>{const r=i.dailyBuckets[l];a+=r.right,o+=r.right+r.wrong;const d=r.right+r.wrong,p=d>0?Math.round(r.right/d*100):0;return{label:l.slice(5),sublabel:`${l}: ${r.right} Right · ${r.wrong} Wrong (${p}%) · +${r.pointsEarned.toLocaleString("en-US")} PTS`,right:r.right,wrong:r.wrong,rollingAccPct:o>0?Math.round(a/o*100):p}})}function Zt(i,e){if(i.length===0)return`
      <svg viewBox="0 0 560 192" style="width:100%;height:auto;display:block;">
        <rect x="36" y="18" width="488" height="146" rx="8" fill="rgba(12,17,28,0.65)" stroke="rgba(216,175,87,0.2)" stroke-dasharray="4 4"/>
        <text x="${560/2}" y="${192/2-7}" text-anchor="middle" fill="#b8b2a6" font-size="11.5" font-family="Inter,sans-serif">
          <tspan x="${560/2}" dy="0">Answer questions in any mode to populate</tspan>
          <tspan x="${560/2}" dy="17">Right/Wrong bars &amp; Rolling Accuracy</tspan>
        </text>
      </svg>
    `;const c=Math.max(1,...i.map(y=>y.right+y.wrong)),m=488/i.length,n=Math.max(5,Math.min(26,m*.66)),h=[0,.5,1].map(y=>{const v=18+(1-y)*146,x=`${Math.round(y*100)}%`,w=Math.round(y*c);return`
        <line x1="36" y1="${v.toFixed(1)}" x2="524" y2="${v.toFixed(1)}" stroke="rgba(216,175,87,0.15)" stroke-dasharray="3 3"/>
        <text x="31" y="${(v+3).toFixed(1)}" text-anchor="end" fill="#7d8594" font-size="9" font-family="JetBrains Mono,monospace">${w}</text>
        <text x="529" y="${(v+3).toFixed(1)}" text-anchor="start" fill="#f2cf7e" font-size="9" font-family="JetBrains Mono,monospace">${x}</text>
      `}).join(""),f=[],g=[],b=[];return i.forEach((y,v)=>{const x=36+m*(v+.5),w=y.right/c*146,S=y.wrong/c*146,A=164-w,_=A-S,M=e===v;f.push(`
      <g data-g1-idx="${v}" style="cursor:pointer;">
        <rect x="${(x-m*.48).toFixed(1)}" y="18" width="${(m*.96).toFixed(1)}" height="146" fill="${M?"rgba(242,207,126,0.10)":"transparent"}" rx="3"/>
        ${w>0?`<rect x="${(x-n/2).toFixed(1)}" y="${A.toFixed(1)}" width="${n.toFixed(1)}" height="${Math.max(2,w).toFixed(1)}" fill="#39d49a" rx="2"/>`:""}
        ${S>0?`<rect x="${(x-n/2).toFixed(1)}" y="${_.toFixed(1)}" width="${n.toFixed(1)}" height="${Math.max(2,S).toFixed(1)}" fill="#e05263" rx="2"/>`:""}
      </g>
    `);const Z=18+(1-y.rollingAccPct/100)*146;g.push(`${x.toFixed(1)},${Z.toFixed(1)}`),b.push(`<circle data-g1-idx="${v}" cx="${x.toFixed(1)}" cy="${Z.toFixed(1)}" r="${M?"4.8":"3.0"}" fill="#f2cf7e" stroke="#080b11" stroke-width="1.3" style="cursor:pointer;"/>`),(i.length<=12||v===0||v===i.length-1||v%Math.ceil(i.length/8)===0)&&f.push(`<text x="${x.toFixed(1)}" y="184" text-anchor="middle" fill="#b8b2a6" font-size="8.8" font-family="JetBrains Mono,monospace">${u(y.label)}</text>`)}),`
    <svg viewBox="0 0 560 192" style="width:100%;height:auto;display:block;">
      ${h}
      ${f.join("")}
      <polyline points="${g.join(" ")}" fill="none" stroke="#f2cf7e" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
      ${b.join("")}
    </svg>
  `}function Xt(i,e){const l=[.33,.66,1].map(c=>{const m=[];for(let n=0;n<12;n++){const h=Math.PI*2*n/12-Math.PI/2;m.push(`${(155+Math.cos(h)*88*c).toFixed(1)},${(135+Math.sin(h)*88*c).toFixed(1)}`)}return`<polygon points="${m.join(" ")}" fill="none" stroke="rgba(216,175,87,0.2)" stroke-width="1"/>`}).join(""),r=[],d=[],p=[];for(let c=0;c<12;c++){const m=Math.PI*2*c/12-Math.PI/2,n=Math.cos(m),h=Math.sin(m),f=i.byDomain[c],g=f.right+f.wrong,b=Math.max(.2,Math.min(1,(f.lastElo-750)/1350)),y=g>0?Math.max(.18,f.right/g):b,v=g>0?y*.65+b*.35:b,x=155+n*88*v,w=135+h*88*v;r.push(`${x.toFixed(1)},${w.toFixed(1)}`);const S=c===e;d.push(`<line x1="155" y1="135" x2="${(155+n*88).toFixed(1)}" y2="${(135+h*88).toFixed(1)}" stroke="${S?"#f2cf7e":"rgba(216,175,87,0.16)"}" stroke-width="${S?"1.6":"1"}"/>`);const A=155+n*103,_=135+h*102,M=n<-.25?"end":n>.25?"start":"middle";p.push(`<text data-g2-dom="${c}" x="${A.toFixed(1)}" y="${(_+3).toFixed(1)}" text-anchor="${M}" fill="${S?"#f2cf7e":"#cfc9bc"}" font-size="8.8" font-weight="${S?"800":"600"}" style="cursor:pointer;">${u(D[c].shortName)}</text>`)}return`
    <svg viewBox="0 0 310 270" style="width:100%;max-width:295px;height:auto;display:block;margin:0 auto;">
      ${l}
      ${d.join("")}
      <polygon points="${r.join(" ")}" fill="rgba(57,212,154,0.22)" stroke="#39d49a" stroke-width="2"/>
      ${p.join("")}
    </svg>
  `}function es(i){const r=[{label:"Start",elo:1200}];if(i.sessions.length>0)for(const f of i.sessions.slice(-24))r.push({label:f.mode.slice(0,4),elo:f.eloAfter});else if(i.events.length>0){const f=Math.max(1,Math.floor(i.events.length/20));for(let b=0;b<i.events.length;b+=f)r.push({label:`Q${b+1}`,elo:i.events[b].eloAfter});const g=i.events[i.events.length-1];r.push({label:"Now",elo:g.eloAfter})}else r.push({label:"Now",elo:i.globalEloLatest});const d=Math.min(1e3,...r.map(f=>f.elo))-40,p=Math.max(1500,...r.map(f=>f.elo))+40,c=Math.max(100,p-d),m=r.map((f,g)=>{const b=r.length===1?260:40+g/(r.length-1)*440,y=18+(1-(f.elo-d)/c)*120;return{x:b,y,elo:f.elo,label:f.label}}),n=m.map(f=>`${f.x.toFixed(1)},${f.y.toFixed(1)}`).join(" "),h=`${m[0].x.toFixed(1)},138 ${n} ${m[m.length-1].x.toFixed(1)},138`;return`
    <svg viewBox="0 0 520 156" style="width:100%;height:auto;display:block;">
      <line x1="40" y1="18" x2="480" y2="18" stroke="rgba(86,212,245,0.22)" stroke-dasharray="3 3"/>
      <text x="34" y="22" text-anchor="end" fill="#56d4f5" font-size="9" font-family="JetBrains Mono,monospace">${Math.round(p)}</text>
      <line x1="40" y1="138" x2="480" y2="138" stroke="rgba(216,175,87,0.2)"/>
      <text x="34" y="141" text-anchor="end" fill="#7d8594" font-size="9" font-family="JetBrains Mono,monospace">${Math.round(d)}</text>
      <polygon points="${h}" fill="rgba(86,212,245,0.14)"/>
      <polyline points="${n}" fill="none" stroke="#56d4f5" stroke-width="2.3" stroke-linejoin="round"/>
      ${m.map((f,g)=>g===m.length-1||m.length<=12?`<circle cx="${f.x.toFixed(1)}" cy="${f.y.toFixed(1)}" r="${g===m.length-1?"4.5":"3"}" fill="${g===m.length-1?"#f2cf7e":"#56d4f5"}" stroke="#080b11" stroke-width="1.2"/>`:"").join("")}
    </svg>
  `}function ts(i){const d=Math.max(1,...i.speedBuckets.map(n=>n.right+n.wrong)),p=292/5,c=34;return`
    <svg viewBox="0 0 340 158" style="width:100%;height:auto;display:block;">
      <line x1="24" y1="130" x2="316" y2="130" stroke="rgba(216,175,87,0.28)"/>
      ${i.speedBuckets.map((n,h)=>{const f=24+p*(h+.5),g=n.right/d*112,b=n.wrong/d*112,y=130-g,v=y-b,x=n.right+n.wrong;return`
        <g>
          ${g>0?`<rect x="${(f-c/2).toFixed(1)}" y="${y.toFixed(1)}" width="${c}" height="${Math.max(2,g).toFixed(1)}" fill="#39d49a" rx="3"/>`:""}
          ${b>0?`<rect x="${(f-c/2).toFixed(1)}" y="${v.toFixed(1)}" width="${c}" height="${Math.max(2,b).toFixed(1)}" fill="#e05263" rx="3"/>`:""}
          <text x="${f.toFixed(1)}" y="${Math.max(11,(x>0?v:130)-4).toFixed(1)}" text-anchor="middle" fill="#f6f2e9" font-size="9" font-family="JetBrains Mono,monospace">${x}</text>
          <text x="${f.toFixed(1)}" y="149" text-anchor="middle" fill="#b8b2a6" font-size="9.5" font-family="JetBrains Mono,monospace">${u(Vt[h])}</text>
        </g>
      `}).join("")}
    </svg>
  `}class ss{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;unsubscribeStore=null;callbacks={};activeRange="LAST_25";selectedBarIdx=null;focusedDomainIdx=0;constructor(e){this.deps=e,K()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.activeRange=e.initialRange??"LAST_25",this.selectedBarIdx=null,this.deps.store.syncAndBackfillFromProfile(this.deps.passport);const s=document.createElement("div");s.className="ws-meta-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","Career Stats & Historical Right/Wrong Graphs"),s.addEventListener("click",t=>{t.target===s&&this.handleClose()}),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=z(()=>this.handleBackOrClose()),this.unsubscribeStore=this.deps.store.subscribe(()=>{this.isOpen()&&this.rerender()}),this.renderInto(s,!0)}mount(e,s={}){this.unmount(),this.callbacks=s,this.activeRange=s.initialRange??"LAST_25",this.deps.store.syncAndBackfillFromProfile(this.deps.passport),this.mountedContainer=e,this.unsubscribeStore=this.deps.store.subscribe(()=>{this.isOpen()&&this.rerender()}),this.renderInto(e,!1)}unmount(){this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.unsubscribeStore&&(this.unsubscribeStore(),this.unsubscribeStore=null),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}this.handleClose()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}rerender(){this.modalBackdrop?this.renderInto(this.modalBackdrop,!0):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,s){const t=this.deps.store.getSnapshot(),a=this.deps.passport.getChallengerName(),o=t.totalRight+t.totalWrong,l=o>0?t.totalResponseMs/o:0,r=t.overclock.overclockWins+t.overclock.overclockMisses,d=r>0?`${(t.overclock.overclockWins/r*100).toFixed(0)}%`:"—",p=Jt(t,this.activeRange),c=this.selectedBarIdx!==null&&p[this.selectedBarIdx]?p[this.selectedBarIdx]:p[p.length-1]??null,m=B("ANALYTICS",{isModal:s,closeBtnId:"ws-stats-close",canNavigate:!!this.callbacks.onNavigateSection}),n=[...t.events].reverse().slice(0,35);e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-stats-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">CAREER STATS</h2>
              <div class="ws-meta-eyebrow">${u(a)} · Right/Wrong &amp; IRT Telemetry</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${m}
          </div>
        </div>

        <!-- Single-Row Borderless Underline Time-Range Tabs -->
        <div class="ws-meta-underline-tabs" role="tablist" aria-label="Analytics Time Range">
          ${[["LAST_25","Last 25 Q"],["DAYS_7","7 Days"],["DAYS_30","30 Days"],["ALL_TIME","All Time"]].map(([h,f])=>`
                <button type="button" role="tab" aria-selected="${this.activeRange===h}" class="ws-meta-underline-tab ${this.activeRange===h?"is-active":""}" data-range-tab="${h}">
                  ${f}
                </button>
              `).join("")}
        </div>

        <div class="ws-meta-body-scroll">
          <!-- Frameless Hairline KPI Strip (Zero Nested KPI Boxes!) -->
          <div class="ws-meta-kpi-strip">
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Right / Wrong</span>
              <span class="ws-meta-kpi-val">
                <span style="color:var(--emerald-win);">${t.totalRight}R</span>
                <span style="color:var(--ivory-dim);font-weight:500;">·</span>
                <span style="color:var(--crimson-alert);">${t.totalWrong}W</span>
              </span>
            </div>
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Accuracy</span>
              <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${te(t.totalRight,t.totalWrong)}</span>
            </div>
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Streak</span>
              <span class="ws-meta-kpi-val">${t.currentStreak} <span style="font-size:12px;color:var(--gold-bright);">/ ${t.bestStreak} BEST</span></span>
            </div>
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Global ELO</span>
              <span class="ws-meta-kpi-val" style="color:var(--cyan-clue);">${t.globalEloLatest} <span style="font-size:11px;color:var(--ivory-dim);">(${t.globalEloPeak})</span></span>
            </div>
            <div class="ws-meta-kpi-cell">
              <span class="ws-meta-kpi-lbl">Speed · Overclock</span>
              <span class="ws-meta-kpi-val" style="font-size:14.5px;">${o>0?`${(l/1e3).toFixed(1)}s`:"—"} · <span style="color:var(--gold-bright);">${d}</span></span>
            </div>
          </div>

          <!-- Graph 1: Historical Right vs. Wrong Stacked Bars & Rolling Accuracy % -->
          <div class="ws-meta-section">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">1. Right vs. Wrong &amp; Rolling Accuracy</h3>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);">
                <span style="color:var(--emerald-win);">■ Right</span> · <span style="color:var(--crimson-alert);">■ Wrong</span> · <span style="color:var(--gold-bright);">— Accuracy %</span>
              </span>
            </div>

            ${Zt(p,this.selectedBarIdx)}

            ${c?`<div class="ws-meta-note" style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-primary);">
                    <span>[${u(c.label)}] ${u(c.sublabel)}</span>
                    <span style="color:var(--gold-bright);font-weight:700;">Rolling ${c.rollingAccPct}%</span>
                  </div>`:""}
          </div>

          <!-- Graph 2: 12-Domain Mastery Breakdown & Polar Radar -->
          <div class="ws-meta-section">
            <h3 class="ws-meta-section-title">2. 12-Domain Mastery &amp; Polar Radar</h3>
            <div class="ws-meta-two-col" style="align-items:center;">
              <div>
                ${Xt(t,this.focusedDomainIdx)}
              </div>
              <div style="display:flex;flex-direction:column;">
                ${D.map((h,f)=>{const g=t.byDomain[f],b=g.right+g.wrong,y=b>0?g.right/b*100:50,v=f===this.focusedDomainIdx;return`
                    <div data-g2-dom="${f}" class="ws-meta-row is-interactive ${v?"is-focused":""}" style="padding:6px 4px;gap:8px;">
                      <img src="./${u(h.medallionUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;flex-shrink:0;"/>
                      <span style="width:74px;font-size:11.5px;font-weight:600;color:var(--ivory-primary);flex-shrink:0;">${u(h.shortName)}</span>
                      <div style="flex:1 1 auto;height:5px;border-radius:999px;background:rgba(224,82,99,0.38);overflow:hidden;">
                        <div style="width:${b>0?y.toFixed(1):"0"}%;height:100%;background:#39d49a;"></div>
                      </div>
                      <span style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);min-width:112px;text-align:right;flex-shrink:0;">
                        <strong style="color:var(--emerald-win);">${g.right}R</strong>·<strong style="color:var(--crimson-alert);">${g.wrong}W</strong> <span style="color:var(--ivory-dim);">(${te(g.right,g.wrong)})</span> · <strong style="color:${h.accentHex};">${g.lastElo}</strong>
                      </span>
                    </div>
                  `}).join("")}
              </div>
            </div>
          </div>

          <!-- Graph 3: Global IRT ELO & Overclock Conviction Trajectory -->
          <div class="ws-meta-section">
            <h3 class="ws-meta-section-title">3. Global IRT ELO &amp; Conviction Telemetry</h3>
            <div class="ws-meta-two-col" style="align-items:center;">
              <div>
                ${es(t)}
              </div>
              <div style="display:flex;flex-direction:column;">
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;">
                  <span style="color:var(--ivory-muted);">Safe Lock Record</span>
                  <span><strong style="color:var(--emerald-win);">${t.overclock.safeLockWins}W</strong> – <strong style="color:var(--crimson-alert);">${t.overclock.safeLockMisses}L</strong> <span style="color:var(--ivory-dim);">(${te(t.overclock.safeLockWins,t.overclock.safeLockMisses)})</span></span>
                </div>
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;">
                  <span style="color:var(--ivory-muted);">Overclock Wins</span>
                  <span style="color:var(--gold-bright);font-weight:700;">${t.overclock.overclockWins} Wins · ${t.overclock.max6xWins} at 6.0x</span>
                </div>
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;border-bottom:none;">
                  <span style="color:var(--ivory-muted);">Backfires / 6.0x Streak</span>
                  <span><strong style="color:var(--crimson-alert);">${t.overclock.backfires}</strong> · Peak <strong style="color:var(--gold-bright);">${t.overclock.bestConsecutiveMax6xWins}×</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Graph 4: 5-Morph & Peel-Tier Matrix + Response-Time Histogram -->
          <div class="ws-meta-section">
            <div class="ws-meta-two-col">
              <div style="display:flex;flex-direction:column;gap:8px;">
                <h3 class="ws-meta-section-title">4A. 6-Morph &amp; Peel-Tier Matrix</h3>
                <div>
                  ${Ke.map(h=>{const f=t.byArchetype[h];return`
                      <div class="ws-meta-row" style="padding:7px 2px;font-family:var(--font-mono);font-size:11px;">
                        <span style="color:var(--ivory-primary);">${u(Te[h])}</span>
                        <span><strong style="color:var(--emerald-win);">${f.right}R</strong> · <strong style="color:var(--crimson-alert);">${f.wrong}W</strong> <span style="color:var(--ivory-dim);">(${te(f.right,f.wrong)})</span></span>
                      </div>
                    `}).join("")}
                </div>
                <div class="ws-meta-kpi-strip" style="border-bottom:none;padding-bottom:0;padding-top:4px;">
                  ${[["1","3.0x Cold"],["2","2.0x Clue"],["3","1.2x Blue"]].map(([h,f])=>{const g=t.byPeelTier[h];return`
                        <div class="ws-meta-kpi-cell" style="padding:4px 8px;">
                          <span class="ws-meta-kpi-lbl" style="color:var(--gold-bright);">${f}</span>
                          <span class="ws-meta-kpi-val" style="font-size:13px;">${g.right}R / ${g.wrong}W</span>
                        </div>
                      `}).join("")}
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:8px;">
                <h3 class="ws-meta-section-title">4B. Response-Time Histogram</h3>
                ${ts(t)}
              </div>
            </div>
          </div>

          <!-- 5. Chronological Question Ledger Tape -->
          <div class="ws-meta-section" style="border-bottom:none;">
            <h3 class="ws-meta-section-title">5. Question Ledger Tape (Last ${n.length})</h3>
            ${n.length>0?`<div style="display:flex;flex-direction:column;max-height:240px;overflow-y:auto;">
                    ${n.map(h=>{const f=W(h.domainId),b=((h.peelTier===1?3:h.peelTier===2?2:1.2)*(1+h.overclockCharge01)).toFixed(1);return`
                          <div class="ws-meta-row" style="flex-wrap:wrap;padding:7px 4px;font-family:var(--font-mono);font-size:11px;box-shadow:inset 2px 0 0 ${h.correct?"var(--emerald-win)":"var(--crimson-alert)"};padding-left:10px;">
                            <span style="display:inline-flex;align-items:center;gap:7px;">
                              <span style="font-weight:800;color:${h.correct?"var(--emerald-win)":"var(--crimson-alert)"};">
                                ${h.correct?"✓":h.backfired?"✕!":"✕"}
                              </span>
                              <img src="./${u(f.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;"/>
                              <span style="color:var(--ivory-primary);">${u(f.shortName)}</span>
                              <span style="color:var(--ivory-dim);">· ${u(Te[h.archetype])}</span>
                            </span>
                            <span style="color:var(--ivory-muted);">
                              ${(h.responseTimeMs/1e3).toFixed(1)}s · ${b}x · <strong style="color:${h.correct?"var(--gold-bright)":"var(--ivory-dim)"};">+${h.pointsDelta.toLocaleString("en-US")} PTS</strong>
                            </span>
                          </div>
                        `}).join("")}
                  </div>`:'<div style="padding:18px 0;text-align:center;font-size:12.5px;color:var(--ivory-muted);">No individual question events logged in this browser session yet.</div>'}
          </div>
        </div>
      </div>
    `,this.bindEvents(e)}bindEvents(e){e.querySelector("#ws-stats-back")?.addEventListener("click",()=>this.handleBackOrClose()),q(e,{closeBtnId:"ws-stats-close",onNavigate:s=>this.callbacks.onNavigateSection?.(s),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-range-tab]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.rangeTab;!t||t===this.activeRange||(this.activeRange=t,this.selectedBarIdx=null,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-g1-idx]").forEach(s=>{s.addEventListener("click",()=>{const t=Number(s.getAttribute("data-g1-idx"));Number.isFinite(t)&&(this.selectedBarIdx=t,this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.rerender())})}),e.querySelectorAll("[data-g2-dom]").forEach(s=>{s.addEventListener("click",()=>{const t=Number(s.getAttribute("data-g2-dom"));!Number.isFinite(t)||t<0||t>11||(this.focusedDomainIdx=t,this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.rerender())})})}}const Me="ws_hall_of_honours_v1",Ye="ws_equipped_hud_theme_v1",We="ws_unlocked_hud_themes_v1",je={TIER_1_EASY:{label:"Tier 1 · Initiate Bronze",shortLabel:"Initiate Bronze",rarityPct:"Common",colorHex:"#e09b63",bgRgba:"rgba(224, 155, 99, 0.15)"},TIER_2_MEDIUM:{label:"Tier 2 · Envoy Sterling",shortLabel:"Envoy Sterling",rarityPct:"Uncommon",colorHex:"#cfdceb",bgRgba:"rgba(207, 220, 235, 0.15)"},TIER_3_HARD:{label:"Tier 3 · Consul 24K Gold",shortLabel:"Consul 24K Gold",rarityPct:"Rare",colorHex:"#f2cf7e",bgRgba:"rgba(242, 207, 126, 0.16)"},TIER_4_VERY_RARE:{label:"Tier 4 · Arbiter Sapphire",shortLabel:"Arbiter Sapphire",rarityPct:"Very Rare (2.5%)",colorHex:"#56d4f5",bgRgba:"rgba(86, 212, 245, 0.16)"},TIER_5_MYTHIC:{label:"Tier 5 · Mythic Celestial Diamond",shortLabel:"Mythic 0.1%",rarityPct:"Mythic (0.1%)",colorHex:"#c79bff",bgRgba:"rgba(199, 155, 255, 0.18)"}},as=[{id:"bt_01",order:1,title:"MERIDIAN CANDIDATE",unlockRequirement:"Default Geneva Summons Title"},{id:"bt_02",order:2,title:"GENEVA CHARTER INITIATE",unlockRequirement:"Tier 1: First Sightline Lock"},{id:"bt_03",order:3,title:"COLD INSTINCT SPECIALIST",unlockRequirement:"Tier 2: 10 Unpeeled 3.0x Tier-1 Locks"},{id:"bt_04",order:4,title:"CONVICTION HIGH-ROLLER",unlockRequirement:"Tier 2: First 6.0x Max Overclock Win"},{id:"bt_05",order:5,title:"FORENSIC TELL READER",unlockRequirement:"Tier 2: Catch a Rival Bluff (CALL BLUFF)"},{id:"bt_06",order:6,title:"ARCHIVE VAULT DELVER",unlockRequirement:"Tier 2: Reach Archive Descent Depth 15"},{id:"bt_07",order:7,title:"CONSUL OF THE TWELVE",unlockRequirement:"Tier 3: Reach 1,500 ELO in Any Domain"},{id:"bt_08",order:8,title:"BLACK SALON SHARK",unlockRequirement:"Tier 3: Win a 3D Kinetic Ghost Duel"},{id:"bt_09",order:9,title:"RELIC ARCHIVIST SUPREME",unlockRequirement:"Tier 3: Unlock 4 Country Boss Relics"},{id:"bt_10",order:10,title:"FIRST CITIZEN ARBITER",unlockRequirement:"Tier 4: Complete The Meridian Circuit Campaign"},{id:"bt_11",order:11,title:"UNPEELED SOVEREIGN",unlockRequirement:"Tier 5 Mythic: Win a Boss Showdown with 0 Peels"},{id:"bt_12",order:12,title:"POLYMATH SUPREME",unlockRequirement:"Tier 5 Mythic: 1,850+ ELO Across All 12 Domains"}],is=[{id:"bt_13",order:13,title:"VARSITY SCHOLAR",unlockRequirement:"Tier 1 v2.0: Varsity Letterman (High School ≥ 80%)"},{id:"bt_14",order:14,title:"DEAN'S LIST FELLOW",unlockRequirement:"Tier 2 v2.0: Dean’s List Summa Cum Laude (College ≥ 85%)"},{id:"bt_15",order:15,title:"ROYAL CARTOGRAPHER",unlockRequirement:"Tier 3 v2.0: Royal Cartographer (5 Globe Pin-Drop Wins)"},{id:"bt_16",order:16,title:"MENSA GRANDMASTER",unlockRequirement:"Tier 4 v2.0: Mensa 99th-Percentile Laureate (Mensa ≥ 80%)"},{id:"bt_17",order:17,title:"SOVEREIGN OMNISCIENT",unlockRequirement:"Tier 5 Mythic v2.0: Omniscient Mensa Polymath (#84)"}],N=[...as,...is],os=[{id:"GENEVA_CHAMPAGNE_24K",order:1,name:"Geneva 24K Champagne Gold",primaryHex:"#f2cf7e",secondaryHex:"#d8af57",ringGlowRgba:"rgba(242, 207, 126, 0.36)",unlockRequirement:"Default Geneva Issue"},{id:"SOVEREIGN_PLATINUM_IVORY",order:2,name:"Sovereign Platinum & Ivory",primaryHex:"#eae6dc",secondaryHex:"#b8c4d4",ringGlowRgba:"rgba(234, 230, 220, 0.34)",unlockRequirement:"Tier 1: Stamp Diplomatic Passport"},{id:"HORIZON_ELECTRIC_CYAN",order:3,name:"Horizon Telemetry Cyan",primaryHex:"#64e6ff",secondaryHex:"#35a7db",ringGlowRgba:"rgba(100, 230, 255, 0.36)",unlockRequirement:"Tier 1: Pledge World Council Faction"},{id:"AGORA_BOTANICAL_EMERALD",order:4,name:"Agora Emerald Commons",primaryHex:"#52eba8",secondaryHex:"#28b87a",ringGlowRgba:"rgba(82, 235, 168, 0.35)",unlockRequirement:"Tier 2: 25 Lifetime Correct Answers"},{id:"TOKYO_VERMILION_EMBER",order:5,name:"Shinkansen Vermilion & Gold",primaryHex:"#ff9d5c",secondaryHex:"#e05263",ringGlowRgba:"rgba(255, 157, 92, 0.36)",unlockRequirement:"Tier 2: Clear Act I (London & Tokyo)"},{id:"CAIRO_SOLAR_AMBER",order:6,name:"Meridian Zero Solar Amber",primaryHex:"#ffcf56",secondaryHex:"#d98a2b",ringGlowRgba:"rgba(255, 207, 86, 0.38)",unlockRequirement:"Tier 3: Reach Archive Depth 50"},{id:"REYKJAVIK_BOREALIS_VIOLET",order:7,name:"Caldera Borealis Violet-Teal",primaryHex:"#b494ff",secondaryHex:"#5ce1e6",ringGlowRgba:"rgba(180, 148, 255, 0.38)",unlockRequirement:"Tier 4: 1,750+ ELO Across 6 Domains"},{id:"MYTHIC_PRISMATIC_DIAMOND",order:8,name:"Mythic Celestial White-Diamond",primaryHex:"#fff8e7",secondaryHex:"#9ef2ff",ringGlowRgba:"rgba(255, 248, 231, 0.44)",unlockRequirement:"Tier 5 Mythic: Lightning Savant (10× <3s Streak)"}],rs=[{id:"BLUEPRINT_SAPPHIRE_DRAFT",order:9,name:"Sapphire Blueprint Draft",primaryHex:"#5ce1ff",secondaryHex:"#2589c7",ringGlowRgba:"rgba(92, 225, 255, 0.38)",unlockRequirement:"Tier 1 v2.0: Sapphire Lens Analyst (#74)"},{id:"CARTOGRAPHER_MERCATOR_GOLD",order:10,name:"Cartographer Mercator Gold",primaryHex:"#f5cb6e",secondaryHex:"#39d49a",ringGlowRgba:"rgba(245, 203, 110, 0.40)",unlockRequirement:"Tier 2 v2.0: Geodesic Sharpshooter (≤ 300 km Bullseye, #71)"},{id:"MENSA_OBSIDIAN_ULTRAVIOLET",order:11,name:"Mensa Obsidian Ultraviolet",primaryHex:"#d0a8ff",secondaryHex:"#64e6ff",ringGlowRgba:"rgba(208, 168, 255, 0.42)",unlockRequirement:"Tier 3 v2.0: Doctoral Defense (Graduate ≥ 80%, #68)"}],L=[...os,...rs];function Qe(){const i=["GENEVA_CHAMPAGNE_24K"];try{if(typeof localStorage>"u")return i;const e=localStorage.getItem(We);if(!e)return i;const s=JSON.parse(e);if(!Array.isArray(s))return i;for(const t of s)L.some(a=>a.id===t)&&!i.includes(t)&&i.push(t)}catch{}return i}function ns(i){const e=Qe();if(e.includes(i))return!1;e.push(i);try{typeof localStorage<"u"&&localStorage.setItem(We,JSON.stringify(e))}catch{}return!0}function ge(){try{if(typeof localStorage<"u"){const i=localStorage.getItem(Ye),e=L.find(s=>s.id===i);if(e)return e}}catch{}return L[0]}function Je(i){const e=L.find(s=>s.id===i)??L[0];try{if(typeof localStorage<"u"&&localStorage.setItem(Ye,e.id),typeof document<"u"){const s=document.documentElement;s.style.setProperty("--gold-bright",e.primaryHex),s.style.setProperty("--gold-24k",e.secondaryHex),s.style.setProperty("--gold-glow",e.ringGlowRgba),s.style.setProperty("--ws-chrono-accent",e.primaryHex)}}catch{}return e}function ls(i){const s={medal_tier1_bronze:{c1:"#f0b67f",c2:"#8c4f27",rim:"#ffd5ab",ribbon:"#9e2638",glyph:'<polygon points="48,28 53,40 66,41 56,50 59,63 48,56 37,63 40,50 30,41 43,40" fill="#ffd5ab"/>'},medal_tier2_sterling:{c1:"#f2f7fc",c2:"#6e8299",rim:"#ffffff",ribbon:"#1f4478",glyph:'<polygon points="48,26 55,40 70,42 59,52 62,67 48,59 34,67 37,52 26,42 41,40" fill="#ffffff"/>'},medal_tier3_gold:{c1:"#fff0ad",c2:"#b38124",rim:"#fff8d6",ribbon:"#166347",glyph:'<polygon points="48,24 54,39 70,39 57,49 62,65 48,55 34,65 39,49 26,39 42,39" fill="#39d49a"/>'},medal_tier4_sapphire:{c1:"#8ce6ff",c2:"#1a498a",rim:"#dff8ff",ribbon:"#2a2259",glyph:'<polygon points="48,23 60,46 48,69 36,46" fill="#dff8ff"/>'},medal_tier5_mythic:{c1:"#fff8eb",c2:"#7a52cc",rim:"#ffe89e",ribbon:"#401b6b",glyph:'<polygon points="48,22 63,46 48,70 33,46" fill="#fffdf7"/><circle cx="48" cy="46" r="6" fill="#f2cf7e"/>'},trophy_streak_chronometer:{c1:"#ffe799",c2:"#9e6c1c",rim:"#fff6cf",ribbon:"#7d2029",glyph:'<circle cx="48" cy="46" r="14" fill="none" stroke="#fff6cf" stroke-width="3"/><path d="M48,46 L48,36 M48,46 L56,49" stroke="#fff6cf" stroke-width="2.6" stroke-linecap="round"/>'},trophy_overclock_roulette:{c1:"#ffb86b",c2:"#9e2638",rim:"#ffe699",ribbon:"#591624",glyph:'<path d="M51,26 L37,48 L48,48 L45,68 L61,44 L49,44 Z" fill="#fff6cf"/>'},trophy_polymath_globe:{c1:"#9ef5d8",c2:"#1b6b5c",rim:"#ffe89e",ribbon:"#17455e",glyph:'<circle cx="48" cy="46" r="14" fill="none" stroke="#fff6cf" stroke-width="2.2"/><ellipse cx="48" cy="46" rx="7" ry="14" fill="none" stroke="#fff6cf" stroke-width="1.8"/><line x1="34" y1="46" x2="62" y2="46" stroke="#fff6cf" stroke-width="1.8"/>'}}[i],t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="mg_${i}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${s.c1}"/>
        <stop offset="100%" stop-color="${s.c2}"/>
      </linearGradient>
    </defs>
    <polygon points="34,6 62,6 56,30 40,30" fill="${s.ribbon}" stroke="${s.rim}" stroke-width="1.2"/>
    <circle cx="48" cy="48" r="30" fill="url(#mg_${i})" stroke="${s.rim}" stroke-width="2.6"/>
    <circle cx="48" cy="48" r="24" fill="rgba(8,11,18,0.42)" stroke="${s.rim}" stroke-width="1" stroke-dasharray="3 2"/>
    ${s.glyph}
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(t)}`}function cs(i){return Object.values(i.visas).filter(e=>e.cleared).length}function Le(i){const e=new Set([...i.passport.unlockedRelics,...i.blackboard?.unlockedRelics??[]]);for(const s of Object.values(i.passport.visas))(s.cleared||s.relicUnlocked)&&e.add(s.relicId);return e.size}function ds(i){let e=1200;for(let s=0;s<12;s++)e=Math.max(e,i.analytics.byDomain[s]?.peakElo??1200,i.passport.domainElo[s]??1200);return e}function Oe(i,e){let s=0;for(let t=0;t<12;t++)Math.max(i.analytics.byDomain[t]?.peakElo??1200,i.passport.domainElo[t]??1200)>=e&&(s+=1);return s}function ps(i){let e=0;for(let s=0;s<12;s++)(i.analytics.byDomain[s]?.right??0)>=1&&(e+=1);return e}function hs(i){let e=i.feats.duelChallengesPlayed??0,s=i.feats.duelGhostWins??0,t=i.feats.srsReviewsCompleted??0,a=0,o=0,l=i.feats.offlinePacksCached??0;try{if(typeof localStorage<"u"){const r=localStorage.getItem("ws_duel_rivals_v2");if(r){const m=JSON.parse(r),n=Array.isArray(m?.history)?m.history.length:0,h=Array.isArray(m?.history)?m.history.filter(b=>b?.winner==="PLAYER").length:0;let f=0,g=0;if(m?.rivalsById&&typeof m.rivalsById=="object")for(const b of Object.values(m.rivalsById))f+=Math.max(0,Math.floor(Number(b?.totalDuels)||0)),g+=Math.max(0,Math.floor(Number(b?.lossesAgainstPlayer)||0));e=Math.max(e,n,f),s=Math.max(s,h,g)}const d=localStorage.getItem("ws_spaced_repetition_v2");if(d){const m=JSON.parse(d);if(Array.isArray(m?.cards)){let n=0,h=0;for(const f of m.cards)n+=Math.max(0,Math.floor(Number(f?.totalReviews)||0)),Number(f?.box)===5&&(h+=1);t=Math.max(t,n),a=Math.max(a,h)}}const p=localStorage.getItem("ws_question_feedback_v1");if(p){const m=JSON.parse(p);m?.entries&&typeof m.entries=="object"&&(o=Object.keys(m.entries).length)}const c=localStorage.getItem("ws_offline_packs_v2");if(c){const m=JSON.parse(c);Array.isArray(m)?l=Math.max(l,m.length):m&&typeof m=="object"&&Array.isArray(m.packs)&&(l=Math.max(l,m.packs.length))}}}catch{}return{duelTotalPlayed:e,duelPlayerWins:s,srsTotalReviews:t,srsBox5Mastered:a,feedbackRatingsCount:o,offlinePacksCount:l}}const us=[{id:"t1_first_lock",number:1,title:"First Sightline Lock",description:"Solve your first Veritas Prism question in any mode.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.totalRight,reward:{broadcastTitle:"GENEVA CHARTER INITIATE",rewardLabel:"Title: GENEVA CHARTER INITIATE"}},{id:"t1_first_peel",number:2,title:"Horological Curiosity",description:"Peel open the Brass Crown to solve a question using the Clue or Blueprint Core.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.byPeelTier[2].right+i.analytics.byPeelTier[3].right},{id:"t1_first_overclock",number:3,title:"Conviction Spark",description:"Hold-to-Overclock and win your first confidence wager.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.overclock.overclockWins},{id:"t1_passport_stamp",number:4,title:"Credentials Registered",description:"Register your Challenger Name or stamp your Meridian Diplomatic Passport.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.feats.passportStamped||i.passport.hasCustomName||i.passport.persona?1:0,reward:{hudThemeId:"SOVEREIGN_PLATINUM_IVORY",rewardLabel:"HUD Theme: Sovereign Platinum & Ivory"}},{id:"t1_geneva_cleared",number:5,title:"Vetting Chamber Cleared",description:"Complete Julian Vance’s 4-Question Geneva Vetting Prologue.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.feats.prologueCleared||i.passport.visas.ch?.cleared?1:0,reward:{prismFinishId:"DAMASCUS_STEEL_AMBER",rewardLabel:"Prism Finish: Damascus Steel & Amber"}},{id:"t1_first_daily",number:6,title:"World Broadcast Debut",description:"Complete your first synchronized 00:00 UTC Daily Global Feed.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:i=>Math.max(i.analytics.feats.dailyBroadcastsCompleted,i.passport.dailyHistory.length)},{id:"t1_first_briefing",number:7,title:"Briefing Room Calibrated",description:"Solve 5 calibration questions in Nadia’s Briefing Room.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:i=>i.analytics.byMode.BRIEFING.right},{id:"t1_first_endless",number:8,title:"First Extraction Airlock",description:"Reach Depth 5 (First Airlock) or solve 5 Prisms in The Archive Descent.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:i=>Math.max(i.analytics.feats.maxEndlessDepth,i.analytics.byMode.ENDLESS.right)},{id:"t1_first_trials",number:9,title:"Kinetic Ghost Contender",description:"Solve 5 Prisms in World Council Async Ghost Trials.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:i=>i.analytics.byMode.TRIALS.right},{id:"t1_backstage_1",number:10,title:"Behind the Obsidian Glass",description:"Conduct your first Backstage Interrogation conversation.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.feats.backstageInterrogations},{id:"t1_uv_scan_1",number:11,title:"Blacklight Forensics",description:"Scan a Relic under UV light inside the 3D Intel Observatory.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.feats.uvScansCount},{id:"t1_atelier_equip",number:12,title:"Bespoke Horologist",description:"Equip a custom material finish inside the Prism Atelier.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.feats.atelierFinishesEquipped},{id:"t1_faction_pledge",number:13,title:"Council Allegiance",description:"Pledge allegiance to Sovereign, Horizon, or Agora.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.feats.factionPledged||i.blackboard?.pledgedFaction?1:0,reward:{hudThemeId:"HORIZON_ELECTRIC_CYAN",rewardLabel:"HUD Theme: Horizon Telemetry Cyan"}},{id:"t1_bookmark_1",number:14,title:"Archivist of Epiphanies",description:"Bookmark an “Aha!” Intel Flash debrief to your Observatory study.",tier:"TIER_1_EASY",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.passport.bookmarks.length},{id:"t2_streak_5",number:15,title:"Quintuple Resonance",description:"Achieve a 5-question consecutive correct streak.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"medal_tier2_sterling",target:5,measure:i=>i.analytics.bestStreak},{id:"t2_streak_10",number:16,title:"Decade of Precision",description:"Achieve a 10-question consecutive correct streak.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:10,measure:i=>i.analytics.bestStreak,reward:{prismFinishId:"STERLING_CHRONOMETER_RHODIUM",rewardLabel:"Prism Finish: Vallée de Joux Rhodium & Sterling"}},{id:"t2_max6x_1",number:17,title:"Maximum 6.0x Conviction",description:"Lock and win a full-charge 6.0x Tier-1 Cold Instinct Overclock.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:1,measure:i=>i.analytics.overclock.max6xWins,reward:{broadcastTitle:"CONVICTION HIGH-ROLLER",rewardLabel:"Title: CONVICTION HIGH-ROLLER"}},{id:"t2_bluff_echo_1",number:18,title:"Bluff Echo Vent",description:"Safely flick-cancel an active Overclock charge to bait your Rival.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:1,measure:i=>i.analytics.feats.bluffEchoCancels},{id:"t2_call_bluff_1",number:19,title:"Human Tell Reader",description:"Spot a physical character tell and catch a Rival Bluff (CALL BLUFF).",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:1,measure:i=>i.analytics.feats.rivalBluffsCaught,reward:{prismFinishId:"BLACK_SALON_CRIMSON_OBSIDIAN",broadcastTitle:"FORENSIC TELL READER",rewardLabel:"Finish: Black Salon Crimson + Title: FORENSIC TELL READER"}},{id:"t2_perfect_match",number:20,title:"Flawless Five",description:"Complete any 5+ question match with 100% accuracy.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"medal_tier2_sterling",target:1,measure:i=>i.analytics.feats.perfectMatchesCount},{id:"t2_act1_cleared",number:21,title:"Dual-Track Envoy",description:"Earn both London (GB) and Tokyo (JP) Act I Diplomatic Visas.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:2,measure:i=>(i.passport.visas.gb?.cleared?1:0)+(i.passport.visas.jp?.cleared?1:0),reward:{prismFinishId:"KYOTO_URUSHI_KINTSUGI",hudThemeId:"TOKYO_VERMILION_EMBER",rewardLabel:"Finish: Kyoto Kintsugi + Theme: Vermilion Ember"}},{id:"t2_archive_15",number:22,title:"Diplomatic Vaults Delver",description:"Reach Depth 15 in Endless Archive Descent.",tier:"TIER_2_MEDIUM",aspect:"MODES_TRIALS",emblemKey:"medal_tier2_sterling",target:15,measure:i=>i.analytics.feats.maxEndlessDepth,reward:{broadcastTitle:"ARCHIVE VAULT DELVER",rewardLabel:"Title: ARCHIVE VAULT DELVER"}},{id:"t2_calibrator_bullseye",number:23,title:"Pinhole Astrolabe",description:"Hit a 3.5x Pinhole Bullseye on the 3D Calibrator Dial.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:1,measure:i=>i.analytics.feats.calibratorBullseyes},{id:"t2_codex_first_try",number:24,title:"Cryptex Synchronizer",description:"Align and lock a 3D Codex Dual-Ring at unpeeled Tier 1.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:1,measure:i=>i.analytics.feats.codexFirstTryLocks},{id:"t2_gauntlet_10",number:25,title:"Kinetic Plate Shatterer",description:"Shatter 10 Gauntlet Veritas Plates accurately.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:10,measure:i=>i.analytics.byArchetype.GAUNTLET_SHATTER.right},{id:"t2_cold_instinct_10",number:26,title:"Cold Instinct X",description:"Solve 10 questions sealed at 3.0x Tier-1 Cold Instinct.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:10,measure:i=>i.analytics.byPeelTier[1].right,reward:{broadcastTitle:"COLD INSTINCT SPECIALIST",rewardLabel:"Title: COLD INSTINCT SPECIALIST"}},{id:"t2_correct_25",number:27,title:"Quarter-Century Scholar",description:"Reach 25 lifetime correct answers across all modes.",tier:"TIER_2_MEDIUM",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier2_sterling",target:25,measure:i=>i.analytics.totalRight,reward:{hudThemeId:"AGORA_BOTANICAL_EMERALD",rewardLabel:"HUD Theme: Agora Emerald Commons"}},{id:"t2_clues_4",number:28,title:"Red Thread Investigator",description:"Uncover 4 Conspiracy Evidence Clues on the Dossier Board.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:4,measure:i=>i.blackboard?.unlockedEvidenceClues.length??0},{id:"t3_streak_20",number:29,title:"Twentyfold Harmonic",description:"Achieve a 20-question consecutive correct streak.",tier:"TIER_3_HARD",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:20,measure:i=>i.analytics.bestStreak,reward:{prismFinishId:"CONSUL_MALACHITE_VERDIGRIS",rewardLabel:"Prism Finish: Consul Malachite & Bronze"}},{id:"t3_triple_6x_match",number:30,title:"Triple Turbine Surge",description:"Land 3× 6.0x Max Overclocks inside a single match.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:1,measure:i=>i.analytics.feats.max3x6xInSingleMatch?1:0,reward:{prismFinishId:"SOLAR_OCULUS_WHITE_GOLD",rewardLabel:"Prism Finish: Solar Oculus 18K White-Gold"}},{id:"t3_flawless_boss",number:31,title:"Untouched Sovereign",description:"Defeat a 3-Phase Country Boss Showdown with 0 Prism Shields lost.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:1,measure:i=>i.analytics.feats.flawlessBossWins},{id:"t3_correct_100",number:32,title:"Centurion Initiate",description:"Reach 100 lifetime correct answers.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:100,measure:i=>i.analytics.totalRight},{id:"t3_domain_elo_1500",number:33,title:"Consul of Mastery",description:"Climb to 1,500 IRT ELO in any knowledge domain.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:1500,measure:i=>ds(i),reward:{broadcastTitle:"CONSUL OF THE TWELVE",rewardLabel:"Title: CONSUL OF THE TWELVE"}},{id:"t3_relics_4",number:34,title:"Curator of Four Capitals",description:"Recover 4 Tier-3 Country Boss Relics for your Observatory.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:4,measure:i=>Le(i),reward:{broadcastTitle:"RELIC ARCHIVIST SUPREME",rewardLabel:"Title: RELIC ARCHIVIST SUPREME"}},{id:"t3_archive_50",number:35,title:"Subterranean Consul",description:"Survive to Depth 50 in Endless Archive Descent.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:50,measure:i=>i.analytics.feats.maxEndlessDepth,reward:{hudThemeId:"CAIRO_SOLAR_AMBER",rewardLabel:"HUD Theme: Meridian Zero Solar Amber"}},{id:"t3_ghost_win_1",number:36,title:"Phantom Victor",description:"Defeat a Recorded 3D Kinetic Ghost in World Council Trials.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:1,measure:i=>i.analytics.feats.ghostTrialWins,reward:{broadcastTitle:"BLACK SALON SHARK",rewardLabel:"Title: BLACK SALON SHARK"}},{id:"t3_fast_under3s_15",number:37,title:"Reflex Chronometer",description:"Lock 15 correct answers in under 3.0 seconds each.",tier:"TIER_3_HARD",aspect:"STREAK_SPEED",emblemKey:"medal_tier3_gold",target:15,measure:i=>i.analytics.speedBuckets[0].right},{id:"t3_all_12_domains_1",number:38,title:"Renaissance Passport",description:"Solve at least 1 question across all 12 Sovereign Domains.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:12,measure:i=>i.analytics.byDomain.filter(e=>e.right>=1).length,reward:{prismFinishId:"IMPERIAL_EMERALD_BRASS",rewardLabel:"Prism Finish: Imperial Emerald & Brass"}},{id:"t3_daily_5",number:39,title:"Global Feed Correspondent",description:"Complete 5 Daily Global Feed World Broadcasts.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:5,measure:i=>Math.max(i.analytics.feats.dailyBroadcastsCompleted,i.passport.dailyHistory.length)},{id:"t3_hero_synth_3",number:40,title:"Relic Synthesis Adept",description:"Solve 3 chained Hero Artifact Synthesis steps.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier3_gold",target:3,measure:i=>i.analytics.byArchetype.HERO_ARTIFACT_SYNTHESIS.right},{id:"t3_backstage_6",number:41,title:"Grand Inquisitor",description:"Complete 6 Backstage Interrogations across the global circuit.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:6,measure:i=>i.analytics.feats.backstageInterrogations},{id:"t3_visas_5",number:42,title:"Plenipotentiary Envoy",description:"Stamp 5 Country Diplomatic Visas into your Meridian Passport.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:5,measure:i=>cs(i.passport),reward:{prismFinishId:"PHARAONIC_LAPIS_ELECTRUM",rewardLabel:"Prism Finish: Pharaonic Lapis & Electrum"}},{id:"t4_streak_35",number:43,title:"Thirty-Five Unbroken",description:"Achieve a 35-question consecutive correct streak.",tier:"TIER_4_VERY_RARE",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:35,measure:i=>i.analytics.bestStreak,reward:{prismFinishId:"ARBITER_SMOKED_SAPPHIRE_PLATINUM",rewardLabel:"Prism Finish: Arbiter Smoked Sapphire"}},{id:"t4_soren_coin_defeat",number:44,title:"Dead Coin Counterplay",description:"Read Soren Kael’s coin tell & defeat him (or catch 3 Rival Bluffs).",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:3,measure:i=>i.analytics.feats.sorenCoinBluffDefeated?3:i.analytics.feats.rivalBluffsCaught},{id:"t4_campaign_complete",number:45,title:"Champion of The Meridian",description:"Complete The Meridian Circuit Campaign at The Apex Forum.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:1,measure:i=>i.analytics.feats.campaignCompleted||i.passport.visas.global?.cleared||(i.blackboard?.achievedEndings.length??0)>0?1:0,reward:{broadcastTitle:"FIRST CITIZEN ARBITER",rewardLabel:"Title: FIRST CITIZEN ARBITER"}},{id:"t4_all_8_relics_24_latches",number:46,title:"Master of Twenty-Four Latches",description:"Recover all 8 Tier-3 Relics and actuate all 24 mechanical latches.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:24,measure:i=>Le(i)>=8?i.analytics.feats.openedLatchKeys.length:Math.min(23,i.analytics.feats.openedLatchKeys.length)},{id:"t4_correct_500_acc80",number:47,title:"High Arbiter Laureate",description:"Reach 500 lifetime correct answers while maintaining ≥ 80% accuracy.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier4_sapphire",target:500,measure:i=>{const e=i.analytics.totalRight+i.analytics.totalWrong;return(e>0?i.analytics.totalRight/e:0)>=.8?i.analytics.totalRight:Math.min(499,i.analytics.totalRight)}},{id:"t4_six_domains_1750",number:48,title:"Hexagonal Savant",description:"Reach 1,750+ ELO across at least 6 knowledge domains.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:6,measure:i=>Oe(i,1750),reward:{hudThemeId:"REYKJAVIK_BOREALIS_VIOLET",rewardLabel:"HUD Theme: Caldera Borealis Violet-Teal"}},{id:"t4_archive_100",number:49,title:"Abyssal Vault Walker",description:"Reach Depth 100 in Endless Archive Descent.",tier:"TIER_4_VERY_RARE",aspect:"MODES_TRIALS",emblemKey:"medal_tier4_sapphire",target:100,measure:i=>i.analytics.feats.maxEndlessDepth},{id:"t4_black_salon_champ",number:50,title:"Sovereign of the Black Salon",description:"Win a High-Stakes Underground Black Salon Knockout match.",tier:"TIER_4_VERY_RARE",aspect:"MODES_TRIALS",emblemKey:"medal_tier4_sapphire",target:1,measure:i=>i.analytics.feats.blackSalonWins},{id:"t4_overclock_wins_50",number:51,title:"Fiftyfold Overclocker",description:"Win 50 Hold-to-Overclock confidence wagers.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:50,measure:i=>i.analytics.overclock.overclockWins},{id:"t4_cold_instinct_100",number:52,title:"Hundredfold Cold Instinct",description:"Solve 100 Prisms sealed at 3.0x Tier-1 Cold Instinct.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier4_sapphire",target:100,measure:i=>i.analytics.byPeelTier[1].right},{id:"t4_clues_12",number:53,title:"Conspiracy Unmasked",description:"Pin all 12 Classified Clues onto the Conspiracy Dossier Board.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:12,measure:i=>i.blackboard?.unlockedEvidenceClues.length??0,reward:{prismFinishId:"AURORA_DICHROIC_TITANIUM",rewardLabel:"Prism Finish: Aurora Dichroic Titanium"}},{id:"t4_bullseyes_10",number:54,title:"Master Astrolabist",description:"Land 10 Pinhole Bullseyes on the 3D Calibrator Dial.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier4_sapphire",target:10,measure:i=>i.analytics.feats.calibratorBullseyes},{id:"t5_unpeeled_sovereign",number:55,title:"The Unpeeled Sovereign",description:"Win a 3-Phase Country Boss Showdown with 0 Peels — 100% Pure Crown!",tier:"TIER_5_MYTHIC",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier5_mythic",target:1,measure:i=>i.analytics.feats.unpeeledBossWins,reward:{prismFinishId:"CELESTIAL_DIAMOND_SOVEREIGN",broadcastTitle:"UNPEELED SOVEREIGN",rewardLabel:"Mythic Finish: Celestial Diamond + Title: UNPEELED SOVEREIGN"}},{id:"t5_horological_perfection",number:56,title:"Horological Perfection",description:"Achieve 50 consecutive correct answers without a single miss.",tier:"TIER_5_MYTHIC",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:50,measure:i=>i.analytics.bestStreak,reward:{prismFinishId:"CELESTIAL_DIAMOND_SOVEREIGN",rewardLabel:"Mythic Finish: Celestial Diamond & 24K"}},{id:"t5_polymath_supreme",number:57,title:"Polymath Supreme",description:"Reach 1,850+ Genius IRT ELO across ALL 12 Sovereign Domains.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:12,measure:i=>Oe(i,1850),reward:{broadcastTitle:"POLYMATH SUPREME",rewardLabel:"Mythic Title: POLYMATH SUPREME"}},{id:"t5_6x_russian_roulette",number:58,title:"6.0x Russian Roulette",description:"Win 5 consecutive 6.0x Max Overclocks in a row without Backfire.",tier:"TIER_5_MYTHIC",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:5,measure:i=>i.analytics.overclock.bestConsecutiveMax6xWins},{id:"t5_lightning_savant",number:59,title:"Lightning Savant",description:"Lock 10 consecutive correct answers each in under 3.0 seconds.",tier:"TIER_5_MYTHIC",aspect:"STREAK_SPEED",emblemKey:"medal_tier5_mythic",target:10,measure:i=>i.analytics.bestFastUnder3sStreak,reward:{hudThemeId:"MYTHIC_PRISMATIC_DIAMOND",rewardLabel:"Mythic HUD Theme: Celestial White-Diamond"}},{id:"t5_architect_succession",number:60,title:"The Architect's Succession",description:"Uncover all 12 Conspiracy Clues and unlock the Secret 4th Ending.",tier:"TIER_5_MYTHIC",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier5_mythic",target:2,measure:i=>{const e=(i.blackboard?.unlockedEvidenceClues.length??0)>=12?1:0,s=i.blackboard?.achievedEndings.includes("ARCHITECT_SUCCESSION")||i.analytics.feats.achievedEndings.includes("ARCHITECT_SUCCESSION")?1:0;return e+s}},{id:"t5_meridian_leviathan",number:61,title:"Meridian Zero Leviathan",description:"Descend to Depth 200 inside The Ledger’s Meridian Zero Core.",tier:"TIER_5_MYTHIC",aspect:"MODES_TRIALS",emblemKey:"medal_tier5_mythic",target:200,measure:i=>i.analytics.feats.maxEndlessDepth},{id:"t5_fourfold_destiny",number:62,title:"Fourfold Destiny",description:"Unlock all 4 Championship Endings across New Circuit+ replays.",tier:"TIER_5_MYTHIC",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier5_mythic",target:4,measure:i=>new Set([...i.blackboard?.achievedEndings??[],...i.analytics.feats.achievedEndings]).size},{id:"t5_centurion_million",number:63,title:"Centurion of the Million",description:"Solve 1,000 unique verified Question IDs from THE FORGE.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:1e3,measure:i=>i.analytics.uniqueSolvedCount},{id:"t5_grand_completionist",number:64,title:"Grand Sovereign Completionist",description:"Unlock all 63 other Core Trophies & Medals (#1–#63) in the Hall of Honours.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier5_mythic",target:63,measure:()=>0}],ms=[{id:"v2_diff_middle_school",number:65,packId:"v2.0",title:"Honor Roll Foundations",description:"Complete a calibrated Middle School difficulty round.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.feats.difficultyRoundsCleared?.MIDDLE_SCHOOL??0},{id:"v2_diff_high_school",number:66,packId:"v2.0",title:"Varsity Letterman",description:"Achieve 80% or higher accuracy on a High School difficulty round.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:80,measure:i=>i.analytics.feats.difficultyBestAccuracyPct?.HIGH_SCHOOL??0,reward:{broadcastTitle:"VARSITY SCHOLAR",rewardLabel:"Title: VARSITY SCHOLAR"}},{id:"v2_diff_college",number:67,packId:"v2.0",title:"Dean's List Summa Cum Laude",description:"Achieve 85% or higher accuracy on a College difficulty round.",tier:"TIER_2_MEDIUM",aspect:"MODES_TRIALS",emblemKey:"medal_tier2_sterling",target:85,measure:i=>i.analytics.feats.difficultyBestAccuracyPct?.COLLEGE??0,reward:{broadcastTitle:"DEAN'S LIST FELLOW",rewardLabel:"Title: DEAN'S LIST FELLOW"}},{id:"v2_diff_graduate",number:68,packId:"v2.0",title:"Doctoral Defense",description:"Achieve 80% or higher accuracy on a Graduate difficulty round.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:80,measure:i=>i.analytics.feats.difficultyBestAccuracyPct?.GRADUATE??0,reward:{hudThemeId:"MENSA_OBSIDIAN_ULTRAVIOLET",rewardLabel:"HUD Theme: Mensa Obsidian Ultraviolet"}},{id:"v2_diff_mensa",number:69,packId:"v2.0",title:"Mensa 99th-Percentile Laureate",description:"Achieve 80% or higher accuracy on a Mensa Grandmaster round.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier4_sapphire",target:80,measure:i=>i.analytics.feats.difficultyBestAccuracyPct?.MENSA??0,reward:{broadcastTitle:"MENSA GRANDMASTER",prismFinishId:"MENSA_QUANTUM_IRIDIUM_GLASS",rewardLabel:"Title: MENSA GRANDMASTER + Finish: Quantum Iridium"}},{id:"v2_globe_first_pin",number:70,packId:"v2.0",title:"First Meridian Pinpoint",description:"Solve your first interactive 3D Globe Pin-Drop coordinate challenge.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_polymath_globe",target:1,measure:i=>i.analytics.byArchetype.GLOBE_PIN_DROP?.right??0},{id:"v2_globe_bullseye_300",number:71,packId:"v2.0",title:"Geodesic Sharpshooter",description:"Drop a 3D Globe Pin within 300 km of the target for a Bullseye Pinpoint.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_polymath_globe",target:1,measure:i=>i.analytics.feats.globeBullseyes300Km??0,reward:{hudThemeId:"CARTOGRAPHER_MERCATOR_GOLD",rewardLabel:"HUD Theme: Cartographer Mercator Gold"}},{id:"v2_globe_royal_cartographer",number:72,packId:"v2.0",title:"Royal Cartographer",description:"Win 5 interactive 3D Globe Pin-Drop challenges across the world circuit.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:5,measure:i=>i.analytics.byArchetype.GLOBE_PIN_DROP?.right??0,reward:{broadcastTitle:"ROYAL CARTOGRAPHER",rewardLabel:"Title: ROYAL CARTOGRAPHER"}},{id:"v2_globe_zero_lat_surveyor",number:73,packId:"v2.0",title:"Zero-Latitude Grand Surveyor",description:"Land a No-Peel (Tier 1) 3D Globe Pin-Drop Bullseye within 120 km.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier4_sapphire",target:1,measure:i=>i.analytics.feats.globeNoPeel120Km??0},{id:"v2_visual_sapphire_analyst",number:74,packId:"v2.0",title:"Sapphire Lens Analyst",description:"Solve your first Visual Sapphire Blueprint hologram question.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.analytics.feats.visualBlueprintsSolved??0,reward:{hudThemeId:"BLUEPRINT_SAPPHIRE_DRAFT",rewardLabel:"HUD Theme: Sapphire Blueprint Draft"}},{id:"v2_visual_master_architect",number:75,packId:"v2.0",title:"Master Blueprint Architect",description:"Solve 10 Visual Sapphire Blueprint questions across sports, science & monuments.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier3_gold",target:10,measure:i=>i.analytics.feats.visualBlueprintsSolved??0,reward:{prismFinishId:"SAPPHIRE_BLUEPRINT_CYANOTYPE",rewardLabel:"3D Finish: Sapphire Blueprint Cyanotype"}},{id:"v2_jeopardy_lateral_virtuoso",number:76,packId:"v2.0",title:"Two-Step Lateral Virtuoso",description:"Lock 25 unpeeled Tier-1 (3.0x) Cold Instinct answers spanning at least 6 domains.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:25,measure:i=>{const e=i.analytics.byPeelTier[1]?.right??0;return(i.analytics.feats.tier1ColdDomains?.length??0)>=6?e:Math.min(24,e)}},{id:"v2_duel_gauntlet_thrown",number:77,packId:"v2.0",title:"Gauntlet Thrown",description:"Issue or compete in a 1-Tap Head-to-Head Duel Link challenge.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.v2Stores.duelTotalPlayed},{id:"v2_duel_ghost_breaker",number:78,packId:"v2.0",title:"Ghost Split Breaker",description:"Defeat a Challenger Ghost in a Head-to-Head 1v1 Duel.",tier:"TIER_2_MEDIUM",aspect:"MODES_TRIALS",emblemKey:"medal_tier2_sterling",target:1,measure:i=>i.v2Stores.duelPlayerWins,reward:{prismFinishId:"DUELIST_BLOODSTONE_PLATINUM",rewardLabel:"3D Finish: Duelist Bloodstone & Platinum"}},{id:"v2_duel_rival_nemesis",number:79,packId:"v2.0",title:"Undisputed Rival Nemesis",description:"Claim 5 Head-to-Head 1v1 Duel victories against Challengers.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:5,measure:i=>i.v2Stores.duelPlayerWins},{id:"v2_srs_vault_initiate",number:80,packId:"v2.0",title:"Memory Vault Initiate",description:"Complete your first Spaced-Repetition review in the 5-Box Leitner Mastery Deck.",tier:"TIER_1_EASY",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.v2Stores.srsTotalReviews},{id:"v2_srs_box5_polymath",number:81,packId:"v2.0",title:"Leitner Box-5 Polymath",description:"Promote 5 cards to Box 5 Mastered inside the Spaced-Repetition Mastery Deck.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:5,measure:i=>i.v2Stores.srsBox5Mastered,reward:{prismFinishId:"NEURAL_ENGRAM_AMETHYST_GOLD",rewardLabel:"3D Finish: Neural Engram Amethyst & 24K"}},{id:"v2_editorial_arbiter",number:82,packId:"v2.0",title:"Editorial Arbiter",description:"Submit 5 question quality ratings (Upvote or Flag) to curate THE FORGE.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:5,measure:i=>i.v2Stores.feedbackRatingsCount},{id:"v2_jetsetter_offline_vault",number:83,packId:"v2.0",title:"Jet-Setter Offline Vault",description:"Cache an Airplane-Mode Offline Pack inside your Meridian Vault.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:i=>i.v2Stores.offlinePacksCount},{id:"v2_omniscient_mensa_polymath",number:84,packId:"v2.0",title:"Omniscient Mensa Polymath",description:"Win across all 12 Sovereign Domains, score 80%+ in Mensa tier, and master a Leitner Box-5 card.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier5_mythic",target:14,measure:i=>{const e=ps(i),s=(i.analytics.feats.difficultyBestAccuracyPct?.MENSA??0)>=80?1:0,t=i.v2Stores.srsBox5Mastered>=1?1:0;return e+s+t},reward:{broadcastTitle:"SOVEREIGN OMNISCIENT",rewardLabel:"Mythic Title: SOVEREIGN OMNISCIENT"}}],fs=[{packId:"v1.0",label:"Core Meridian Circuit",honours:us},{packId:"v2.0",label:"Commercial v2.0 Expansion",honours:ms}],ue=fs.flatMap(i=>i.honours);function Ze(){return ue.length}function Xe(){return T.length+N.length+L.length}class gs{analyticsStore;passport;blackboard;unlockedTimestamps;constructor(e,s,t){this.analyticsStore=e,this.passport=s,this.blackboard=t,this.unlockedTimestamps=this.load();const a=ge();a.id!=="GENEVA_CHAMPAGNE_24K"&&Je(a.id),this.evaluateAndUnlock(!0)}load(){try{if(typeof localStorage>"u")return{};const e=localStorage.getItem(Me);if(!e)return{};const s=JSON.parse(e);if(s?.unlockedTimestamps&&typeof s.unlockedTimestamps=="object")return{...s.unlockedTimestamps}}catch{}return{}}save(){try{if(typeof localStorage<"u"){const e={unlockedTimestamps:this.unlockedTimestamps};localStorage.setItem(Me,JSON.stringify(e))}}catch{}}applyRewardGrant(e){const s=e.reward;s&&(s.prismFinishId&&$t(s.prismFinishId),s.broadcastTitle&&this.passport.unlockTitleCrest(s.broadcastTitle,!1),s.hudThemeId&&ns(s.hudThemeId))}buildEvaluationContext(){const e=this.analyticsStore.getSnapshot();return{analytics:e,passport:this.passport.getSnapshot(),blackboard:this.blackboard?.getSnapshot()??null,v2Stores:hs(e)}}evaluateAndUnlock(e=!1){const s=this.buildEvaluationContext(),t=[],a=new Date().toISOString();let o=!1,l=0,r=null;for(const d of ue){if(d.id==="t5_grand_completionist"){r=d;continue}const p=Math.max(0,Math.floor(d.measure(s))),c=!!this.unlockedTimestamps[d.id];(c||p>=d.target)&&(d.number>=1&&d.number<=63&&(l+=1),c?this.applyRewardGrant(d):(this.unlockedTimestamps[d.id]=a,this.applyRewardGrant(d),o=!0,e||t.push(this.buildProgressItem(d,d.target))))}if(r){const d=!!this.unlockedTimestamps[r.id];(d||l>=r.target)&&(d||(this.unlockedTimestamps[r.id]=a,this.applyRewardGrant(r),o=!0,e||t.push(this.buildProgressItem(r,r.target))))}return o&&this.save(),t}buildProgressItem(e,s){const t=this.unlockedTimestamps[e.id]??null,a=t!==null,o=a?e.target:Math.min(e.target,Math.max(0,Math.floor(s)));return{def:e,unlocked:a,unlockedAtIso:t,current:o,target:e.target,ratio:e.target>0?Math.min(1,o/e.target):1,emblemPngUrl:`./assets/medals/${e.emblemKey}.png`,emblemFallbackDataUri:ls(e.emblemKey)}}getAllProgress(){const e=this.buildEvaluationContext();let s=0;const t=[];for(const o of ue){if(o.id==="t5_grand_completionist"){t.push(this.buildProgressItem(o,0));continue}const l=this.buildProgressItem(o,o.measure(e));l.unlocked&&o.number>=1&&o.number<=63&&(s+=1),t.push(l)}const a=t.findIndex(o=>o.def.id==="t5_grand_completionist");return a>=0&&(t[a]=this.buildProgressItem(t[a].def,s)),t}}function bs(i){return i==="TROPHIES_64"||i==="TROPHIES"}class ys{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};activeTab="TROPHIES_64";tierFilter="ALL";aspectFilter="ALL";trophy3DDockActive=!1;trophyReqToken=0;constructor(e){this.deps=e,K()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.activeTab=e.initialTab??"TROPHIES_64",this.tierFilter=e.initialTierFilter??"ALL",this.aspectFilter="ALL",this.trophy3DDockActive=!1,this.deps.honoursSystem.evaluateAndUnlock(!0);const s=document.createElement("div");s.className="ws-meta-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label",`Hall of Honours — ${Ze()} Trophies & ${Xe()} Unlockables`),s.addEventListener("click",t=>{t.target===s&&!this.trophy3DDockActive&&this.handleClose()}),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=z(()=>this.handleBackOrClose()),this.renderInto(s,!0)}mount(e,s={}){this.unmount(),this.callbacks=s,this.activeTab=s.initialTab??"TROPHIES_64",this.tierFilter=s.initialTierFilter??"ALL",this.deps.honoursSystem.evaluateAndUnlock(!0),this.mountedContainer=e,this.renderInto(e,!1)}unmount(){this.trophyReqToken+=1,this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.syncUiRootVisibility(!1),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}syncUiRootVisibility(e){if(typeof document>"u")return;document.documentElement.classList.toggle("ws-3d-showcase-open",e);const s=document.getElementById("ui-root");s&&(s.style.visibility=e?"hidden":"visible")}async toggle3DTrophyShowcase(){this.trophy3DDockActive=!this.trophy3DDockActive;const e=++this.trophyReqToken;this.rerender(),this.trophy3DDockActive&&this.deps.stage3d&&(await this.deps.stage3d.showChampionshipTrophy(0),e!==this.trophyReqToken||this.isOpen())}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}this.handleClose()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}rerender(){this.modalBackdrop?(this.modalBackdrop.className=this.trophy3DDockActive?"ws-meta-backdrop is-stage-dock":"ws-meta-backdrop",this.syncUiRootVisibility(this.trophy3DDockActive),this.renderInto(this.modalBackdrop,!0)):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,s){const t=this.deps.honoursSystem.getAllProgress(),a=t.length,o=t.filter(x=>x.unlocked).length,l=he(this.deps.passport,this.deps.blackboard),r=this.deps.passport.getSnapshot(),d=Qe(),p=l.length,c=N.length,m=L.length,n=p+c+m,h=N.filter(x=>x.order===1||r.titleCrests.includes(x.title)).length,f=l.filter(x=>x.unlocked).length+h+d.length,g=bs(this.activeTab),b=`
      <div class="ws-meta-underline-tabs" role="tablist" aria-label="Hall of Honours Sections">
        <button type="button" role="tab" aria-selected="${g}" class="ws-meta-underline-tab ${g?"is-active":""}" data-honours-tab="TROPHIES_64">
          ${a} Trophies (${o}/${a})
        </button>
        <button type="button" role="tab" aria-selected="${!g}" class="ws-meta-underline-tab ${g?"":"is-active"}" data-honours-tab="UNLOCKABLES_32">
          ${n} Rewards (${f}/${n})
        </button>
      </div>
    `,y=g?this.renderTrophiesGrid(t):this.renderUnlockablesStudio(l,r.titleCrests,r.activeTitleCrest,d);if(s&&this.trophy3DDockActive){const x=B("HONOURS",{isModal:!0,closeBtnId:"ws-honours-close",canNavigate:!!this.callbacks.onNavigateSection,floatingVariant:!0});e.innerHTML=`
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-honours-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${x}
          </div>
          <div class="ws-meta-stage-bottom">
            <span class="ws-meta-orbit-whisper">↻ Drag 3D to Orbit</span>
            <div class="ws-meta-stage-actions">
              <button type="button" class="ws-meta-float-pill is-active-gold" id="ws-honours-3d-toggle">
                ⤢ Full Hall
              </button>
            </div>
          </div>
        </div>

        <div class="ws-meta-sheet">
          <div class="ws-meta-drag-handle" aria-hidden="true"></div>
          ${b}
          <div class="ws-meta-body-scroll">
            ${y}
          </div>
        </div>
      `,this.bindEvents(e);return}const v=B("HONOURS",{isModal:s,closeBtnId:"ws-honours-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-honours-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">HONOURS</h2>
              <div class="ws-meta-eyebrow">${o}/${a} Trophies · ${f}/${n} Rewards</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${this.deps.stage3d&&s?'<button type="button" class="ws-meta-vault-btn" id="ws-honours-3d-toggle" aria-label="Toggle 3D Trophy Showcase">◈ 3D</button>':""}
            ${v}
          </div>
        </div>

        ${b}

        <div class="ws-meta-body-scroll">
          ${y}
        </div>
      </div>
    `,this.bindEvents(e)}renderTrophiesGrid(e){const s=e.filter(t=>!(this.tierFilter!=="ALL"&&t.def.tier!==this.tierFilter||this.aspectFilter!=="ALL"&&t.def.aspect!==this.aspectFilter));return`
      <!-- Single-Line Horizontal Scrollable Tier & Aspect Filters (Zero Boxed Filter Cards!) -->
      <div class="ws-meta-section" style="padding-top:0;gap:7px;">
        <div class="ws-meta-hscroll" aria-label="Filter by Rarity Tier">
          ${[["ALL",`All ${e.length}`],["TIER_1_EASY","Bronze"],["TIER_2_MEDIUM","Sterling"],["TIER_3_HARD","24K Gold"],["TIER_4_VERY_RARE","Sapphire"],["TIER_5_MYTHIC","Mythic 0.1%"]].map(([t,a])=>`
                <button type="button" class="ws-meta-chip ${this.tierFilter===t?"is-active":""}" data-tier-filter="${t}">
                  ${a}
                </button>
              `).join("")}
        </div>

        <div class="ws-meta-hscroll" aria-label="Filter by Aspect">
          ${[["ALL","All Aspects"],["PRISM_OVERCLOCK","Prism & Overclock"],["STREAK_SPEED","Streak & Speed"],["CAMPAIGN_LORE","Campaign & Lore"],["MODES_TRIALS","Modes & Trials"],["DOMAINS_POLYMATH","12 Domains"]].map(([t,a])=>`
                <button type="button" class="ws-meta-chip ${this.aspectFilter===t?"is-active":""}" data-aspect-filter="${t}">
                  ${a}
                </button>
              `).join("")}
        </div>
      </div>

      <!-- Hairline-Divided Trophy List / 2-Column Wide Grid (Zero Nested Boxes!) -->
      <div class="ws-meta-section" style="border-bottom:none;padding-top:4px;gap:0;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0 22px;">
          ${s.map(t=>{const a=je[t.def.tier],o=t.unlocked?"✓ EARNED":`${Math.round(t.current)} / ${Math.round(t.target)}`;return`
                <div style="display:flex;gap:11px;align-items:flex-start;padding:12px 4px;border-bottom:1px solid rgba(255,255,255,0.07);${t.unlocked?`box-shadow:inset 3px 0 0 ${a.colorHex};padding-left:10px;background:rgba(255,255,255,0.02);`:""}">
                  <img
                    src="${u(t.emblemPngUrl)}"
                    data-fallback-src="${u(t.emblemFallbackDataUri)}"
                    alt=""
                    style="width:42px;height:42px;object-fit:contain;flex-shrink:0;${t.unlocked?"":"filter:grayscale(0.82) opacity(0.55);"}"
                  />
                  <div style="min-width:0;flex:1 1 auto;display:flex;flex-direction:column;gap:4px;">
                    <div style="display:flex;justify-content:space-between;gap:6px;align-items:baseline;">
                      <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${a.colorHex};letter-spacing:0.06em;">
                        #${t.def.number} · ${u(a.shortLabel.toUpperCase())}
                      </span>
                      <span style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${t.unlocked?"var(--emerald-win)":"var(--ivory-muted)"};flex-shrink:0;">
                        ${o}
                      </span>
                    </div>
                    <div style="font-family:var(--font-display);font-size:13.5px;font-weight:800;color:var(--ivory-primary);line-height:1.22;">
                      ${u(t.def.title)}
                    </div>
                    <div style="font-size:11.5px;color:var(--ivory-muted);line-height:1.35;">
                      ${u(E(t.def.description))}
                    </div>
                    <div class="ws-meta-progress-track" style="margin-top:2px;">
                      <div class="ws-meta-progress-fill" style="width:${Math.round(t.ratio*100)}%;background:${t.unlocked?"var(--emerald-win)":a.colorHex};"></div>
                    </div>
                    ${t.def.reward?`<div style="font-family:var(--font-mono);font-size:10px;color:var(--gold-bright);margin-top:1px;">
                            ✦ ${u(t.def.reward.rewardLabel)}
                          </div>`:""}
                  </div>
                </div>
              `}).join("")}
        </div>
      </div>
    `}renderUnlockablesStudio(e,s,t,a){const o=ge(),l=e.length,r=N.length,d=L.length,p=N.filter(c=>c.order===1||s.includes(c.title)).length;return`
      <!-- 1. PBR 3D Prism Finishes (Dynamic Total) -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h3 class="ws-meta-section-title">1. 3D Prism Finishes (${e.filter(c=>c.unlocked).length}/${l})</h3>
          ${this.callbacks.onNavigateSection?'<button type="button" class="ws-meta-inline-link" data-suite-nav="ATELIER">◈ 3D Atelier ›</button>':""}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 20px;">
          ${e.map(c=>`
                <button
                  type="button"
                  class="ws-meta-row is-interactive ${c.equipped?"is-focused":""}"
                  data-equip-finish="${c.spec.id}"
                  ${c.unlocked?"":"disabled"}
                  style="width:100%;text-align:left;"
                >
                  <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                    <span style="width:18px;height:18px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,${c.spec.swatchPrimaryCss},${c.spec.swatchSecondaryCss});box-shadow:0 0 0 1px rgba(255,255,255,0.45);"></span>
                    <span style="font-size:12px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${u(c.spec.name)}</span>
                  </span>
                  <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${c.equipped?"var(--emerald-win)":c.unlocked?"var(--gold-bright)":"#9aa4b7"};flex-shrink:0;">
                    ${c.equipped?"✓ ON":c.unlocked?"EQUIP":"◇"}
                  </span>
                </button>
              `).join("")}
        </div>
      </div>

      <!-- 2. Diplomatic Broadcast Titles (Dynamic Total) -->
      <div class="ws-meta-section">
        <h3 class="ws-meta-section-title">2. Diplomatic Broadcast Titles (${p}/${r})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 20px;">
          ${N.map(c=>{const m=c.order===1||s.includes(c.title),n=t===c.title;return`
              <button
                type="button"
                class="ws-meta-row is-interactive ${n?"is-focused":""}"
                data-equip-title="${u(c.title)}"
                ${m?"":"disabled"}
                style="width:100%;text-align:left;"
              >
                <span style="min-width:0;display:flex;flex-direction:column;gap:2px;">
                  <span style="font-family:var(--font-display);font-size:11.5px;font-weight:700;color:${n?"var(--gold-bright)":"var(--ivory-primary)"};">
                    ${u(c.title)}
                  </span>
                  <span style="font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">
                    ${u(E(c.unlockRequirement))}
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${n?"var(--emerald-win)":m?"var(--gold-bright)":"#9aa4b7"};flex-shrink:0;">
                  ${n?"✓ ON":m?"EQUIP":"◇"}
                </span>
              </button>
            `}).join("")}
        </div>
      </div>

      <!-- 3. Chrono-Ring & HUD Accent Themes (Dynamic Total) -->
      <div class="ws-meta-section" style="border-bottom:none;">
        <h3 class="ws-meta-section-title">3. Chrono-Ring &amp; HUD Accent Themes (${a.length}/${d})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 20px;">
          ${L.map(c=>{const m=a.includes(c.id),n=o.id===c.id;return`
              <button
                type="button"
                class="ws-meta-row is-interactive ${n?"is-focused":""}"
                data-equip-theme="${c.id}"
                ${m?"":"disabled"}
                style="width:100%;text-align:left;"
              >
                <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                  <span style="width:16px;height:16px;border-radius:50%;background:${c.primaryHex};box-shadow:0 0 0 2px ${c.secondaryHex};flex-shrink:0;"></span>
                  <span style="min-width:0;">
                    <span style="display:block;font-size:12px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${u(c.name)}</span>
                    <span style="display:block;font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">${u(E(c.unlockRequirement))}</span>
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${n?"var(--emerald-win)":m?"var(--gold-bright)":"#9aa4b7"};flex-shrink:0;">
                  ${n?"✓ ON":m?"EQUIP":"◇"}
                </span>
              </button>
            `}).join("")}
        </div>
      </div>
    `}bindEvents(e){e.querySelectorAll("img[data-fallback-src]").forEach(s=>{s.addEventListener("error",()=>{const t=s.dataset.fallbackSrc;t&&s.src!==t&&(s.src=t)},{once:!0})}),e.querySelector("#ws-honours-back")?.addEventListener("click",()=>this.handleBackOrClose()),e.querySelector("#ws-honours-3d-toggle")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.toggle3DTrophyShowcase()}),q(e,{closeBtnId:"ws-honours-close",onNavigate:s=>this.callbacks.onNavigateSection?.(s),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll(".ws-meta-body-scroll [data-suite-nav]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.suiteNav;t&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onNavigateSection?.(t))})}),e.querySelectorAll("[data-honours-tab]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.honoursTab;!t||t===this.activeTab||(this.activeTab=t,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-tier-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.tierFilter;t&&(this.tierFilter=t,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-aspect-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.aspectFilter;t&&(this.aspectFilter=t,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-equip-finish]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.equipFinish;if(!t)return;const a=qe(t);this.deps.blackboard?.unlockSkin(a.legacyBlackboardSkinId,!0),this.deps.stage3d&&ae(this.deps.stage3d,a,{updateDomainPalette:!1}),this.deps.haptics?.lockThunk(),this.deps.audio?.playSfx("vault_thunk"),this.callbacks.onEquipSkin?.(a),this.rerender()})}),e.querySelectorAll("[data-equip-title]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.equipTitle;t&&(this.deps.passport.unlockTitleCrest(t,!0),this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp"),this.callbacks.onEquipBroadcastTitle?.(t),this.rerender())})}),e.querySelectorAll("[data-equip-theme]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.equipTheme;if(!t)return;const a=Je(t);this.deps.haptics?.sightlineSnap(),this.deps.audio?.playSfx("sightline_snap"),this.callbacks.onEquipHudTheme?.(a),this.rerender()})})}}function vs(){if(typeof document>"u"||document.getElementById("ws-honour-toast-styles"))return;const i=document.createElement("style");i.id="ws-honour-toast-styles",i.textContent=`
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
      background: #080c17;
      border: none;
      border-left: 3px solid var(--toast-accent, #f2cf7e);
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
  `,document.head.appendChild(i)}class xs{options;hostEl=null;queue=[];activeTimer=null;showing=!1;constructor(e={}){this.options=e,vs()}enqueue(e){if(!(!e||e.length===0||typeof document>"u")){for(const s of e)this.queue.some(t=>t.def.id===s.def.id)||this.queue.push(s);this.showing||this.presentNext()}}ensureHost(){if(this.hostEl&&document.body.contains(this.hostEl))return this.hostEl;const e=document.createElement("div");return e.className="ws-honour-toast-host",e.setAttribute("aria-live","polite"),document.body.appendChild(e),this.hostEl=e,e}setBodyToastActive(e){typeof document>"u"||!document.body||document.body.classList.toggle("ws-honour-toast-active",e)}presentNext(){const e=this.queue.shift();if(!e){this.showing=!1,this.setBodyToastActive(!1);return}this.showing=!0,this.setBodyToastActive(!0);const s=this.ensureHost(),t=je[e.def.tier];this.options.haptics?.correctBloom(),this.options.audio?.playSfx("gold_resonance");const a=document.createElement("div");a.className="ws-honour-toast-card ws-unlock-toast is-visible",a.style.setProperty("--toast-accent",t.colorHex),a.innerHTML=`
      <img
        src="${u(e.emblemPngUrl)}"
        data-fallback-src="${u(e.emblemFallbackDataUri)}"
        alt=""
        style="width:38px;height:38px;object-fit:contain;flex-shrink:0;"
      />
      <div style="min-width:0;flex:1 1 auto;">
        <div style="font-family:var(--font-mono,monospace);font-size:9px;font-weight:800;letter-spacing:0.08em;color:${t.colorHex};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ✦ CITATION UNLOCKED · ${u(t.shortLabel.toUpperCase())}
        </div>
        <div style="font-family:var(--font-display,Georgia,serif);font-size:13px;font-weight:800;color:var(--ivory-primary,#f6f2e9);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${u(e.def.title)}
        </div>
        ${e.def.reward?`<div style="font-family:var(--font-mono,monospace);font-size:10px;color:var(--emerald-win,#39d49a);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ✦ +${u(e.def.reward.rewardLabel)}
              </div>`:`<div style="font-size:10.5px;color:var(--ivory-muted,#b8b2a6);line-height:1.22;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${u(e.def.description)}
              </div>`}
      </div>
    `;const o=a.querySelector("img[data-fallback-src]");o?.addEventListener("error",()=>{const r=o.dataset.fallbackSrc;r&&o.src!==r&&(o.src=r)},{once:!0});const l=(r=!1)=>{this.activeTimer&&(clearTimeout(this.activeTimer),this.activeTimer=null),a.classList.remove("is-visible"),a.classList.add("is-leaving"),setTimeout(()=>{a.remove(),r&&this.options.onInspectHonour?.(e.def.id),this.presentNext()},220)};a.addEventListener("click",()=>l(!0)),s.appendChild(a),this.activeTimer=setTimeout(()=>l(!1),3600)}dispose(){this.activeTimer&&(clearTimeout(this.activeTimer),this.activeTimer=null),this.queue=[],this.showing=!1,this.setBodyToastActive(!1),this.hostEl&&(this.hostEl.remove(),this.hostEl=null)}}const oe="ws_question_feedback_v1",et=new Set(["UPVOTE","FLAG"]),ws=new Set(["AWKWARD_PHRASING","TOO_OBVIOUS","DISPUTED_FACT","DUPLICATE_FEEL"]),De=2500,Ss=180,ks=64;let me=null,fe=null,se=new Map;const Be=new Set;function tt(){try{if(typeof globalThis<"u"&&"localStorage"in globalThis&&globalThis.localStorage)return globalThis.localStorage}catch{}return null}function Es(){const i=tt();if(i)try{return i.getItem(oe)}catch{return me}return me}function Rs(i){me=i;const e=tt();if(e)try{i===null?e.removeItem(oe):e.setItem(oe,i)}catch{}}function st(i){if(!i||typeof i!="object")return null;const e=i,s=Math.trunc(Number(e.qid));if(!Number.isFinite(s)||s<=0)return null;const t=String(e.vote??"").toUpperCase();if(!et.has(t))return null;const a=t,o=typeof e.reason=="string"?e.reason.toUpperCase():"",l=a==="FLAG"?ws.has(o)?o:"AWKWARD_PHRASING":void 0,r=e.domainId!==void 0&&e.domainId!==null?Math.trunc(Number(e.domainId)):NaN,d=Number.isFinite(r)&&r>=0&&r<=11?r:void 0,p=typeof e.subcatLabel=="string"&&e.subcatLabel.trim().length>0?e.subcatLabel.trim().slice(0,ks):void 0,c=typeof e.promptSnippet=="string"&&e.promptSnippet.trim().length>0?e.promptSnippet.replace(/\s+/g," ").trim().slice(0,Ss):void 0,m=Number(e.updatedAtMs),n=Number.isFinite(m)&&m>0?Math.trunc(m):Date.now(),h=typeof e.updatedAtIso=="string"&&e.updatedAtIso.trim().length>0?e.updatedAtIso.trim():new Date(n).toISOString(),f={qid:s,vote:a,updatedAtMs:n,updatedAtIso:h};return l!==void 0&&(f.reason=l),d!==void 0&&(f.domainId=d),p!==void 0&&(f.subcatLabel=p),c!==void 0&&(f.promptSnippet=c),f}function re(){const i=Es();if(i===fe)return se;const e=new Map;if(i)try{const s=JSON.parse(i),t=s&&typeof s=="object"&&"entries"in s&&s.entries&&typeof s.entries=="object"?s.entries:s;if(t&&typeof t=="object")for(const a of Object.values(t)){const o=st(a);o&&e.set(o.qid,o)}}catch{}return fe=i,se=e,se}function As(i){if(i.size>De){const a=Array.from(i.values()).sort((o,l)=>o.vote!==l.vote?o.vote==="FLAG"?-1:1:l.updatedAtMs-o.updatedAtMs);i.clear();for(let o=0;o<Math.min(a.length,De);o++)i.set(a[o].qid,a[o])}const e={};for(const[a,o]of i.entries())e[String(a)]=o;const s={schemaVersion:oe,updatedAtIso:new Date().toISOString(),entries:e},t=JSON.stringify(s);se=i,fe=t,Rs(t)}function _s(){if(Be.size===0)return;const i=Is();for(const e of Be)try{e(i)}catch{}}function Os(i){const e=Math.trunc(Number(i.qid));if(!Number.isFinite(e)||e<=0||!et.has(i.vote))return;const s=new Map(re()),t=Date.now(),a=s.get(e),o=st({qid:e,vote:i.vote,reason:i.vote==="FLAG"?i.reason??a?.reason??"AWKWARD_PHRASING":void 0,domainId:i.domainId??a?.domainId,subcatLabel:i.subcatLabel??a?.subcatLabel,promptSnippet:i.promptSnippet??a?.promptSnippet,updatedAtMs:t,updatedAtIso:new Date(t).toISOString()});o&&(s.set(e,o),As(s),_s())}function Ds(i){const e=Math.trunc(Number(i));return!Number.isFinite(e)||e<=0?null:re().get(e)?.vote??null}function Bs(){const i=re(),e=new Set;for(const[s,t]of i.entries())t.vote==="FLAG"&&e.add(s);return e}function Is(){const i=re();let e=0,s=0;const t=[];for(const a of i.values())a.vote==="UPVOTE"?e+=1:a.vote==="FLAG"&&(s+=1),t.push({...a});return t.sort((a,o)=>o.updatedAtMs-a.updatedAtMs||a.qid-o.qid),{upvotes:e,flagged:s,entries:t}}class $s{passportBook;observatory;atelier;factions;analyticsStore;analyticsView;honoursSystem;honoursView;toastOverlay;srsEngine;deps;callbacks;navStack=[];currentSection=null;historyGuardArmed=!1;boundPopState;constructor(e,s={}){this.deps=e,this.callbacks=s,this.analyticsStore=new Qt(e.passport),this.srsEngine=new Pe(e.passport),this.honoursSystem=new gs(this.analyticsStore,e.passport,e.blackboard),this.toastOverlay=new xs({audio:e.audio,haptics:e.haptics,onInspectHonour:()=>{this.openHonours("TROPHIES_64")}}),this.passportBook=new kt({passport:e.passport,blackboard:e.blackboard,audio:e.audio,haptics:e.haptics,visaStampUrls:e.visaStampUrls}),this.observatory=new Tt({passport:e.passport,srsEngine:this.srsEngine,stage3d:e.stage3d,blackboard:e.blackboard,audio:e.audio,haptics:e.haptics}),this.srsEngine.subscribe(()=>{this.evaluateHonoursAndToast()}),this.atelier=new Ft({passport:e.passport,stage3d:e.stage3d,blackboard:e.blackboard,audio:e.audio,haptics:e.haptics}),this.factions=new Kt({passport:e.passport,blackboard:e.blackboard,trialsMode:e.trialsMode,audio:e.audio,haptics:e.haptics,factionCrestUrls:e.factionCrestUrls}),this.analyticsView=new ss({store:this.analyticsStore,passport:e.passport,audio:e.audio,haptics:e.haptics}),this.honoursView=new ys({honoursSystem:this.honoursSystem,passport:e.passport,blackboard:e.blackboard,stage3d:e.stage3d,audio:e.audio,haptics:e.haptics}),this.boundPopState=()=>{if(!this.isOpen()){this.historyGuardArmed=!1;return}this.navStack.length>0?(this.armHistoryGuard(!0),this.goBack()):(this.historyGuardArmed=!1,this.closeAll(!0))},typeof window<"u"&&window.addEventListener("popstate",this.boundPopState)}dispose(){this.closeAll(!1),this.toastOverlay.dispose(),typeof window<"u"&&window.removeEventListener("popstate",this.boundPopState)}setCallbacks(e){this.callbacks=e}isOpen(){return this.passportBook.isOpen()||this.observatory.isOpen()||this.atelier.isOpen()||this.factions.isOpen()||this.analyticsView.isOpen()||this.honoursView.isOpen()}canGoBack(){return this.navStack.length>0}goBack(){const e=this.navStack.pop();return e?(this.openSectionInternal(e,!1),!0):(this.closeAll(!0),!1)}armHistoryGuard(e=!1){if(!(typeof window>"u"||!window.history?.pushState)&&(!this.historyGuardArmed||e))try{window.history.pushState({__wsMetaSuite:!0},""),this.historyGuardArmed=!0}catch{}}prepareTransitionTo(e,s){const t=this.isOpen();s&&t&&this.currentSection&&this.currentSection!==e?this.navStack[this.navStack.length-1]!==this.currentSection&&(this.navStack.push(this.currentSection),this.navStack.length>16&&this.navStack.shift()):t||(this.navStack=[],this.historyGuardArmed=!1),this.armHistoryGuard(!1),this.closeViewsOnly(),this.currentSection=e}sync3DShowcaseClass(e){typeof document>"u"||document.documentElement.classList.toggle("ws-3d-showcase-open",e)}resetSuiteNavigationState(e=!1){this.navStack=[],this.currentSection=null,this.historyGuardArmed=!1,this.sync3DShowcaseClass(!1),e&&this.callbacks.onCloseSuite?.()}closeViewsOnly(){this.passportBook.close(),this.observatory.close(),this.atelier.close(),this.factions.close(),this.analyticsView.close(),this.honoursView.close()}closeAll(e=!1){this.closeViewsOnly(),this.resetSuiteNavigationState(e)}openSection(e){this.openSectionInternal(e,!0)}openSectionInternal(e,s){switch(e){case"PASSPORT":this.openPassport("CREDENTIALS",!1,s);break;case"OBSERVATORY":this.openObservatory("RELICS_3D","championship_trophy",s);break;case"ATELIER":this.openAtelier(s);break;case"FACTIONS":this.openFactions(s);break;case"ANALYTICS":this.openAnalytics("ALL_TIME",s);break;case"HONOURS":this.openHonours("TROPHIES_64","ALL",s);break}}openPassport(e="CREDENTIALS",s=!1,t=!0){this.prepareTransitionTo("PASSPORT",t),s&&this.recordSpecialFeat("PASSPORT_STAMPED"),this.passportBook.open({initialTab:e,playStampCeremonyOnOpen:s,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onPassportStamped:()=>{this.recordSpecialFeat("PASSPORT_STAMPED")},onRenameChallenger:a=>{this.recordSpecialFeat("PASSPORT_STAMPED"),this.callbacks.onRenameChallenger?.(a)},onInspectRelicInObservatory:a=>this.openObservatory("RELICS_3D",a,!0),onNavigateSection:a=>this.openSection(a),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openObservatory(e="RELICS_3D",s="championship_trophy",t=!0){this.prepareTransitionTo("OBSERVATORY",t),this.sync3DShowcaseClass(e==="RELICS_3D"),this.observatory.open({initialTab:e,initialArtifactId:s,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onInspectRelic:a=>this.callbacks.onInspectRelic?.(a),onUvScan:a=>{this.recordSpecialFeat("UV_RELIC_SCANNED",{relicId:a})},onLatchesOpened:a=>{a!=="championship_trophy"&&this.recordSpecialFeat("RELIC_LATCH_OPENED",{relicId:a,latchCount:3})},onLaunchLivePrismReview:this.callbacks.onLaunchLivePrismReview?a=>{this.resetSuiteNavigationState(!1),this.callbacks.onLaunchLivePrismReview?.(a)}:void 0,onNavigateSection:a=>this.openSection(a),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openAtelier(e=!0){this.prepareTransitionTo("ATELIER",e),this.sync3DShowcaseClass(!0),this.atelier.open({canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onEquipSkin:s=>{this.recordSpecialFeat("ATELIER_SKIN_EQUIPPED"),this.callbacks.onEquipSkin?.(s)},onNavigateSection:s=>this.openSection(s),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openFactions(e=!0){this.prepareTransitionTo("FACTIONS",e),this.sync3DShowcaseClass(!1),this.factions.open({canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onPledgeFaction:s=>{this.recordSpecialFeat("FACTION_PLEDGED"),this.callbacks.onPledgeFaction?.(s)},onLaunchGhostDuel:s=>{this.resetSuiteNavigationState(!1),this.callbacks.onLaunchGhostDuel?.(s)},onLaunchBlackSalon:()=>{this.resetSuiteNavigationState(!1),this.callbacks.onLaunchBlackSalon?.()},onNavigateSection:s=>this.openSection(s),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openAnalytics(e="ALL_TIME",s=!0){this.prepareTransitionTo("ANALYTICS",s),this.sync3DShowcaseClass(!1),this.analyticsView.open({initialRange:e,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onNavigateSection:t=>this.openSection(t),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openHonours(e="TROPHIES_64",s="ALL",t=!0){this.prepareTransitionTo("HONOURS",t),this.sync3DShowcaseClass(!1),this.honoursView.open({initialTab:e,initialTierFilter:s,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onEquipSkin:a=>{this.recordSpecialFeat("ATELIER_SKIN_EQUIPPED"),this.callbacks.onEquipSkin?.(a)},onEquipBroadcastTitle:a=>{this.callbacks.onEquipBroadcastTitle?.(a)},onEquipHudTheme:a=>{this.callbacks.onEquipHudTheme?.(a)},onNavigateSection:a=>this.openSection(a),onClose:()=>{this.resetSuiteNavigationState(!0)}})}evaluateHonoursAndToast(){const e=this.honoursSystem.evaluateAndUnlock(!1);return e.length>0&&(this.toastOverlay.enqueue(e),this.callbacks.onHonourUnlocked?.(e)),e}evaluateAndToastHonours(){return this.evaluateHonoursAndToast()}getCatalogTotals(){return{honours:Ze(),unlockables:Xe(),finishes:T.length,titles:N.length,themes:L.length}}recordQuestionOutcome(e){return this.analyticsStore.recordQuestionOutcome(e),this.evaluateHonoursAndToast()}recordMatchCompleted(e){return this.analyticsStore.recordMatchCompleted(e),this.evaluateHonoursAndToast()}recordSpecialFeat(e,s){return this.analyticsStore.recordSpecialFeat(e,s),this.evaluateHonoursAndToast()}getAnalyticsSnapshot(){return this.analyticsStore.getSnapshot()}getDueReviewCount(e){return this.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks,e),this.srsEngine.getDueCount(e)}getSrsDeckSummary(e){return this.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks,e),this.srsEngine.getDeckSummary(e)}ingestSpacedRepetitionOutcome(e){return this.srsEngine.ingestQuestionOutcome(e)}syncSpacedRepetitionBookmarks(e){return this.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks,e)}openMasteryReviewDeck(e=!0){this.openObservatory("SELF_QUIZ","championship_trophy",e)}getEquippedHudAccentTheme(){return ge()}applyEquippedFinish(){return this.deps.stage3d?ze(this.deps.stage3d):Ue()}}export{$s as M,Ds as a,Je as e,Bs as g,Os as r};
