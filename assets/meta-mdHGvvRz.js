import{f as Q,F as Jt}from"./forge-Q1D2kFDA.js";import{P as Zt,O as ea,a as ta,R as T,S as U,s as aa,v as sa,g as B}from"./narrative-gxhwxf3f.js";import{P as ia,M as oa,S as ra,R as na,a as la,b as ca,c as da}from"./three-BptGkjiW.js";import{R as pa}from"./modes-CtxWwcbF.js";const ha="ws_daily_global_feed_v2",at=["ch","gb","jp","br","eg","is","sg","global"],He={MAVERICK:{tellCaption:"Vance taps his silver stylus twice beside his right ear before pressing the brass seal.",spokenQuote:"High risk, fearless Overclocks, zero hesitation. Your Meridian Passport is stamped: The Maverick."},DIPLOMAT:{tellCaption:"Vance inclines his head a single measured degree as warm wax meets leather.",spokenQuote:"Measured judgment, strategic alliances, composure under fire. Your Meridian Passport is stamped: The Diplomat."},ANALYST:{tellCaption:"Vance aligns the brass astrolabe crosshairs dead center over your dossier.",spokenQuote:"Methodical clue-peeling, surgical precision, zero wasted motion. Your Meridian Passport is stamped: The Analyst."},PRODIGY:{tellCaption:"Vance’s fingers brush his left brass cufflink—startled by how closely your chart mirrors 2019.",spokenQuote:"Cold instinct at three-point-zero, razor accuracy, unshakable nerve. Your Meridian Passport is stamped: The Prodigy."}};function h(a){return String(a??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}function ua(a){return typeof a=="number"&&Number.isFinite(a)?String(Math.round(a)):String(a??"").replace(/\b([12]),(\d{3})\b/g,"$1$2")}function M(a){return String(a??"").replace(/\b(in|from|since|circa|c\.|by|until|around|year|founded|born|died)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\(([12]),(\d{3})([–\-]([12]),?(\d{3}))?\)/g,(e,s,t,i,o,l)=>i&&o&&l?`(${s}${t}–${o}${l})`:`(${s}${t})`).replace(/\b([12]),(\d{3})\s*(CE|BCE|AD|BC)\b/g,"$1$2 $3").replace(/\b([12]),(\d{3})([–\-])([12]),(\d{3})\b/g,"$1$2$3$4$5")}const Z={PASSPORT:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="11" r="3.5"/><path d="M8.5 17.5h7"/></svg>',OBSERVATORY:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8"/><ellipse cx="12" cy="12" rx="8" ry="3.2"/><path d="M12 4v16"/></svg>',ATELIER:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 21 9 12 22 3 9 12 2"/><path d="M3 9h18M12 2v20"/></svg>',ANALYTICS:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19h16"/><path d="M7 16v-5M12 16V7M17 16v-8"/></svg>',HONOURS:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.8 7 21l5-2.6L17 21l-1.5-7.2"/></svg>',FACTIONS:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v18M5 7h14M7 7l-3 7h6l-3-7ZM17 7l-3 7h6l-3-7Z"/></svg>'},ma=[{id:"PASSPORT",icon:Z.PASSPORT,label:"Passport"},{id:"OBSERVATORY",icon:Z.OBSERVATORY,label:"3D Observatory"},{id:"ATELIER",icon:Z.ATELIER,label:"Prism Atelier"},{id:"ANALYTICS",icon:Z.ANALYTICS,label:"Career Stats"},{id:"HONOURS",icon:Z.HONOURS,label:"Honours"},{id:"FACTIONS",icon:Z.FACTIONS,label:"Council Blocs"}];function j(a,e={}){const{isModal:s=!0,closeBtnId:t="ws-meta-close",canNavigate:i=!0,floatingVariant:o=!1}=e;if(!i&&!s)return"";const l=o?"ws-meta-float-pill":"ws-meta-vault-btn",r=i?ma.map(d=>{const n=d.id===a;return`
          <button
            type="button"
            class="ws-meta-vault-row ${n?"is-current":""}"
            data-suite-nav="${d.id}"
            role="menuitem"
            ${n?'aria-current="page"':""}
          >
            <span class="ws-meta-vault-row-ico">${d.icon}</span>
            <span class="ws-meta-vault-row-lbl">${h(d.label)}</span>
            ${n?'<span class="ws-meta-vault-dot" aria-hidden="true"></span>':""}
          </button>
        `}).join(""):"",p=s?`
      <div class="ws-meta-vault-sep"></div>
      <button type="button" class="ws-meta-vault-row is-exit" id="${h(t)}" role="menuitem">
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
        ${p}
      </div>
    </div>
  `}function re(a,e={}){const s=a.querySelector("[data-vault-wrap]"),t=a.querySelector("[data-vault-trigger]"),i=a.querySelector("[data-vault-menu]");if(!s||!t||!i)return;let o=null;const l=r=>{i.hidden=!r,i.classList.toggle("is-open",r),t.setAttribute("aria-expanded",r?"true":"false"),o&&(document.removeEventListener("pointerdown",o,!0),o=null),r&&(o=p=>{if(!s.isConnected){o&&(document.removeEventListener("pointerdown",o,!0),o=null);return}const d=p.target;d&&s.contains(d)||l(!1)},document.addEventListener("pointerdown",o,!0))};t.addEventListener("click",r=>{r.stopPropagation(),e.onTapFeedback?.(),l(i.hidden)}),i.querySelectorAll("[data-suite-nav]").forEach(r=>{r.addEventListener("click",p=>{p.stopPropagation();const d=r.dataset.suiteNav;if(l(!1),!!d){if(r.classList.contains("is-current")){e.onTapFeedback?.();return}e.onTapFeedback?.(),e.onNavigate?.(d)}})}),e.closeBtnId&&i.querySelector(`#${e.closeBtnId}`)?.addEventListener("click",p=>{p.stopPropagation(),l(!1),e.onClose?.()})}function ne(a){if(typeof window>"u")return()=>{};const e=s=>{if(s.key!=="Escape")return;const t=document.activeElement;if(t){const i=t.tagName.toUpperCase();if(i==="INPUT"||i==="TEXTAREA"||t.isContentEditable)return}s.preventDefault(),s.stopPropagation(),a()};return window.addEventListener("keydown",e),()=>{window.removeEventListener("keydown",e)}}function me(a,e,s){return Number.isFinite(a)?Math.max(e,Math.min(s,a)):e}function st(){const a={dailyStreak:0,bestScore:0,bestPercentile:0,shareCardsByDate:{}};try{if(typeof localStorage>"u")return a;const e=localStorage.getItem(ha);if(!e)return a;const s=JSON.parse(e);if(!s||typeof s!="object")return a;const t={};if(s.completedRunsByDate&&typeof s.completedRunsByDate=="object")for(const[i,o]of Object.entries(s.completedRunsByDate))o&&typeof o.shareText=="string"&&(t[i]=o.shareText);return{dailyStreak:Math.max(0,Math.floor(Number(s.dailyStreak)||0)),bestScore:Math.max(0,Math.floor(Number(s.bestScore)||0)),bestPercentile:me(Math.floor(Number(s.bestPercentile)||0),0,99),shareCardsByDate:t}}catch{return a}}function le(){if(typeof document>"u"||document.getElementById("ws-meta-progression-styles"))return;const a=document.createElement("style");a.id="ws-meta-progression-styles",a.textContent=`
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
  `,document.head.appendChild(a)}function fa(a,e,s){const t=s?.[a];if(t)return t;const i=e?"#39d49a":"#7b8599",o=e?"#f2cf7e":"#596273",l=e?"rgba(14, 42, 34, 0.72)":"rgba(14, 19, 30, 0.65)",p={ch:{code:"CH · GENEVA",city:"46.20°N 6.14°E",glyph:`<circle cx="60" cy="56" r="15" fill="none" stroke="${o}" stroke-width="2"/><path d="M60 45v22M49 56h22" stroke="${i}" stroke-width="3.2" stroke-linecap="round"/>`},gb:{code:"GB · LONDON",city:"51.51°N 0.13°W",glyph:`<circle cx="60" cy="56" r="15" fill="none" stroke="${o}" stroke-width="1.8"/><ellipse cx="60" cy="56" rx="15" ry="6.5" fill="none" stroke="${i}" stroke-width="1.8" transform="rotate(-26 60 56)"/><ellipse cx="60" cy="56" rx="15" ry="6.5" fill="none" stroke="${i}" stroke-width="1.8" transform="rotate(26 60 56)"/>`},jp:{code:"JP · TOKYO",city:"35.68°N 139.65°E",glyph:`<path d="M43 47h34M46 52h28M51 47v21M69 47v21" stroke="${i}" stroke-width="2.4" stroke-linecap="round"/><circle cx="60" cy="59" r="5" fill="${o}"/>`},br:{code:"BR · RIO",city:"22.91°S 43.17°W",glyph:`<path d="M44 66a16 16 0 0 1 32 0Z" fill="none" stroke="${i}" stroke-width="2"/><path d="M60 44v22M49 57h22" stroke="${o}" stroke-width="1.6"/>`},eg:{code:"EG · CAIRO",city:"30.04°N 31.24°E",glyph:`<polygon points="60,41 76,67 44,67" fill="none" stroke="${o}" stroke-width="2.2"/><circle cx="60" cy="57" r="4.2" fill="${i}"/>`},is:{code:"IS · REYKJAVIK",city:"64.15°N 21.94°W",glyph:`<path d="M45 64l8-18 7 11 7-14 8 21" fill="none" stroke="${i}" stroke-width="2.2" stroke-linejoin="round"/><path d="M46 43q14-6 28 0" fill="none" stroke="${o}" stroke-width="1.8"/>`},sg:{code:"SG · SINGAPORE",city:"1.35°N 103.82°E",glyph:`<rect x="48" y="47" width="6" height="20" stroke="${o}" stroke-width="1.8" fill="none"/><rect x="66" y="47" width="6" height="20" stroke="${o}" stroke-width="1.8" fill="none"/><path d="M44 47q16-5 32 0" fill="none" stroke="${i}" stroke-width="2.4"/>`},global:{code:"APEX CITADEL",city:"INTL WATERS",glyph:`<polygon points="60,40 65,51 77,52 68,60 70,71 60,65 50,71 52,60 43,52 55,51" fill="none" stroke="${o}" stroke-width="2"/><circle cx="60" cy="56" r="3.5" fill="${i}"/>`}}[a],d=e?"VISA STAMPED":"UNSTAMPED",n=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <circle cx="60" cy="60" r="55" fill="${l}" stroke="${i}" stroke-width="2.5" stroke-dasharray="5 2.5"/>
    <circle cx="60" cy="60" r="48" fill="none" stroke="${o}" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="33" fill="none" stroke="${i}" stroke-width="1" stroke-dasharray="2 2"/>
    <text x="60" y="25" text-anchor="middle" fill="${o}" font-family="Cinzel,Georgia,serif" font-size="8.5" font-weight="700" letter-spacing="1.1">${p.code}</text>
    ${p.glyph}
    <text x="60" y="84" text-anchor="middle" fill="${i}" font-family="monospace" font-size="7.2" font-weight="700" letter-spacing="0.8">${d}</text>
    <text x="60" y="99" text-anchor="middle" fill="${o}" font-family="monospace" font-size="6.4">${p.city}</text>
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(n)}`}function ga(a,e){const l=[.25,.5,.75,1].map(m=>{const c=[];for(let u=0;u<12;u++){const y=Math.PI*2*u/12-Math.PI/2;c.push(`${(190+Math.cos(y)*100*m).toFixed(1)},${(154+Math.sin(y)*100*m).toFixed(1)}`)}return`<polygon points="${c.join(" ")}" fill="none" stroke="rgba(216,175,87,${m===1?"0.36":"0.18"})" stroke-width="${m===1?"1.3":"1"}" />`}).join(""),r=[],p=[],d=[],n=[];for(let m=0;m<12;m++){const c=Math.PI*2*m/12-Math.PI/2,u=Math.cos(c),y=Math.sin(c),w=190+u*100,g=154+y*100,v=m===e;r.push(`<line x1="190" y1="154" x2="${w.toFixed(1)}" y2="${g.toFixed(1)}" stroke="${v?"rgba(242,207,126,0.75)":"rgba(216,175,87,0.18)"}" stroke-width="${v?"1.8":"1"}" />`);const f=a[m],x=me(f?.masteryPct??50,18,100)/100,b=190+u*100*x,S=154+y*100*x;p.push(`${b.toFixed(1)},${S.toFixed(1)}`);const R=U[m]?.accentHex??"#f2cf7e";d.push(`
      <g data-radar-domain="${m}" style="cursor:pointer;">
        <circle cx="${b.toFixed(1)}" cy="${S.toFixed(1)}" r="12" fill="transparent" />
        <circle cx="${b.toFixed(1)}" cy="${S.toFixed(1)}" r="${v?"6.2":"4.0"}" fill="${v?R:"#f2cf7e"}" stroke="#080b11" stroke-width="1.5" />
      </g>
    `);const C=190+u*118,k=154+y*116,I=u<-.25?"end":u>.25?"start":"middle",L=Jt[m]?.shortName??U[m]?.shortName??`D${m}`;n.push(`<text data-radar-domain="${m}" x="${C.toFixed(1)}" y="${(k+3).toFixed(1)}" text-anchor="${I}" fill="${v?"#f2cf7e":"#d8d2c5"}" font-size="${v?"10.5":"9.5"}" font-family="Inter, sans-serif" font-weight="${v?"800":"600"}" style="cursor:pointer;">${h(L)}</text>`)}return`
    <svg viewBox="0 0 380 308" style="width:100%;max-width:360px;height:auto;display:block;margin:0 auto;overflow:visible;">
      <defs>
        <radialGradient id="wsRadarPolyGrad" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#56d4f5" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#f2cf7e" stop-opacity="0.34"/>
        </radialGradient>
      </defs>
      ${l}
      ${r.join("")}
      <polygon points="${p.join(" ")}" fill="url(#wsRadarPolyGrad)" stroke="#f2cf7e" stroke-width="2.2" stroke-linejoin="round" />
      ${n.join("")}
      ${d.join("")}
    </svg>
  `}function ba(a){if(a.length===0)return"";const e=[...a].slice(-14),s=440,t=92,i=22,o=14,l=s-i*2,r=t-o*2,p=e.map((c,u)=>{const y=e.length===1?s/2:i+u/(e.length-1)*l,w=me(c.percentile,1,99),g=o+(1-w/100)*r;return{x:y,y:g,entry:c}}),d=p.map(c=>`${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" "),n=`${p[0].x.toFixed(1)},${t-o} ${d} ${p[p.length-1].x.toFixed(1)},${t-o}`,m=p.map(c=>`<circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4" fill="#39d49a" stroke="#080b11" stroke-width="1.4" />`).join("");return`
    <svg viewBox="0 0 ${s} ${t}" style="width:100%;height:auto;display:block;">
      <line x1="${i}" y1="${o}" x2="${s-i}" y2="${o}" stroke="rgba(57,212,154,0.25)" stroke-dasharray="3 3" />
      <line x1="${i}" y1="${t/2}" x2="${s-i}" y2="${t/2}" stroke="rgba(216,175,87,0.18)" stroke-dasharray="3 3" />
      <line x1="${i}" y1="${t-o}" x2="${s-i}" y2="${t-o}" stroke="rgba(184,178,166,0.2)" />
      <polygon points="${n}" fill="rgba(57,212,154,0.14)" />
      <polyline points="${d}" fill="none" stroke="#f2cf7e" stroke-width="2.2" />
      ${m}
    </svg>
  `}class ya{deps;modalBackdrop=null;mountedContainer=null;unsubscribePassport=null;detachEscape=null;activeTab="CREDENTIALS";focusedDomainId=0;stampAnimating=!1;nameFeedbackMsg=null;copiedDateToast=null;callbacks={};constructor(e){this.deps=e,le()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.activeTab=e.initialTab??"CREDENTIALS",this.callbacks=e,this.stampAnimating=!!e.playStampCeremonyOnOpen,this.nameFeedbackMsg=null;const s=document.createElement("div");s.className="ws-meta-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","Meridian Diplomatic Passport 2.0"),s.addEventListener("click",t=>{t.target===s&&this.handleClose()}),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=ne(()=>this.handleBackOrClose()),this.stampAnimating&&this.playPersonaStampAudio(),this.renderInto(s,!0)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}const e=this.callbacks.onClose;this.close(),e?.()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}playPersonaStampAudio(){this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp");const e=this.deps.passport.getSnapshot().persona;e?this.deps.audio?.playVoice(`vance_persona_${e.toLowerCase()}.mp3`):this.deps.audio?.playVoice("vance_stamp.mp3")}mount(e,s={}){this.unmount(),this.activeTab=s.initialTab??"CREDENTIALS",this.callbacks=s,this.stampAnimating=!!s.playStampCeremonyOnOpen,this.mountedContainer=e,this.renderInto(e,!1)}unmount(){const e=this.mountedContainer!==null;this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.unsubscribePassport&&(this.unsubscribePassport(),this.unsubscribePassport=null),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null),(e||this.modalBackdrop!==null)&&this.deps.audio?.stopVoice()}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}getActiveTab(){return this.activeTab}setActiveTab(e){this.activeTab=e,this.rerender()}triggerStampCeremony(){this.activeTab="CREDENTIALS",this.stampAnimating=!0,this.playPersonaStampAudio(),this.callbacks.onPassportStamped?.(),this.rerender()}rerender(){this.modalBackdrop?this.renderInto(this.modalBackdrop,!0):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}collectDomainSkills(e){const s=Q.getSkillVector();return Q.getSkillSnapshot().totalAnswered>0?s:s.map((i,o)=>{const l=e.domainElo[o]??i.elo,r=Number(((l-1200)/260).toFixed(2)),p=Math.round(me((l-800)/1400*100,18,100));return{...i,elo:l,theta:r,masteryPct:p}})}renderInto(e,s){const t=this.deps.passport.getSnapshot(),i=this.deps.blackboard?.getSnapshot()??null,o=Q.getSkillSnapshot(),l=this.collectDomainSkills(t),r=this.deps.passport.getChallengerName(),p=t.persona?Zt[t.persona]:null,d=t.origin?ea[t.origin]:null,n=at.filter(w=>t.visas[w]?.cleared).length,m=Math.round(l.reduce((w,g)=>w+g.elo,0)/Math.max(1,l.length)),c=o.totalAnswered>0?o.globalElo:m,u=o.totalAnswered>0?Math.round(o.totalCorrect/o.totalAnswered*100):0,y=j("PASSPORT",{isModal:s,closeBtnId:"ws-passport2-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell is-passport-leather">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-passport2-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">PASSPORT</h2>
              <div class="ws-meta-eyebrow">${h(r)} · ${h(t.passportNumber)}</div>
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
            Visas (${n}/8)
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab==="RADAR"}" class="ws-meta-underline-tab ${this.activeTab==="RADAR"?"is-active":""}" data-passport-tab="RADAR">
            12 Domains
          </button>
          <button type="button" role="tab" aria-selected="${this.activeTab==="GLOBAL_FEED"}" class="ws-meta-underline-tab ${this.activeTab==="GLOBAL_FEED"?"is-active":""}" data-passport-tab="GLOBAL_FEED">
            Global
          </button>
        </div>

        <div class="ws-meta-body-scroll">
          ${this.renderActiveTabBody(t,i,l,p,d,c,u,o.totalAnswered,o.totalCorrect,o.bestStreak)}
        </div>
      </div>
    `,this.stampAnimating=!1,this.bindEvents(e)}renderActiveTabBody(e,s,t,i,o,l,r,p,d,n){return this.activeTab==="VISAS"?this.renderVisasTab(e):this.activeTab==="RADAR"?this.renderRadarTab(t):this.activeTab==="GLOBAL_FEED"?this.renderGlobalFeedTab(e):this.renderCredentialsTab(e,s,i,o,l,r,p,d,n)}renderCredentialsTab(e,s,t,i,o,l,r,p,d){const n=this.deps.passport.getChallengerName(),m=t?.accentHex??"#f2cf7e",c=this.stampAnimating?"is-stamping":"",u=s?.axisIntegrity??0,y=s?.publicTrust??50,w=s?.councilFavor??50,g=s?.pledgedFaction??"UNALIGNED",v=(s?.activePerks??[]).map(f=>ta[f]).filter(Boolean);return`
      <!-- Frameless KPI Telemetry Strip (2x2 on mobile < 560px, 4-col on desktop) -->
      <div class="ws-meta-kpi-strip is-four-col">
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Global ELO</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${o}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Solved</span>
          <span class="ws-meta-kpi-val">${p}/${r} <span style="font-size:11px;color:var(--ivory-muted);">(${l}%)</span></span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Peak Streak</span>
          <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${d}</span>
        </div>
        <div class="ws-meta-kpi-cell">
          <span class="ws-meta-kpi-lbl">Trust · Favor</span>
          <span class="ws-meta-kpi-val" style="font-size:14px;"><span style="color:var(--cyan-clue);">${y}%</span> · <span style="color:var(--emerald-win);">${w}%</span></span>
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
                value="${h(n)}"
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
              ${e.titleCrests.map(f=>{const x=f===e.activeTitleCrest;return`
                    <button type="button" class="ws-meta-chip ${x?"is-active":""}" data-select-crest="${h(f)}">
                      ${x?"✦ ":""}${h(f)}
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
              “${h(M(e.persona&&He[e.persona]?.spokenQuote||t?.motto||"Complete Julian Vance’s 4-Question Geneva Vetting Assessment to stamp your Cognitive Persona."))}”
            </div>
            ${e.persona&&He[e.persona]?`<div style="margin-top:4px;font-size:11px;color:var(--cyan-clue);text-align:center;max-width:380px;">
                    ✦ ${h(M(He[e.persona].tellCaption))}
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
                    ${v.map(f=>`<span>◆ ${h(f.name)}</span>`).join("")}
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
          ${at.map(t=>{const i=e.visas[t];if(!i)return"";const o=this.deps.visaStampUrls?.[t]??`./assets/visas/visa_${t}.png`,l=fa(t,i.cleared),r=T[i.relicId],p=i.totalMissions>6?10:12,d=Array.from({length:Math.min(12,i.totalMissions)},(n,m)=>`<img src="./assets/ui/${i.cleared||m<i.missionsCompleted?"star_filled":"star_empty"}.png" alt="" style="width:${p}px;height:${p}px;object-fit:contain;" />`).join("");return`
        <div class="ws-visa-card ${i.cleared?"is-cleared":"is-locked"}">
          <img
            class="ws-visa-stamp-img"
            src="${h(o)}"
            data-fallback-src="${h(l)}"
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
                  ${i.relicUnlocked||i.cleared?"◆":"◇"} ${h(r?.name??"Relic")} ›
                </button>
              `:""}
        </div>
      `}).join("")}
        </div>
      </div>
    `}renderRadarTab(e){const s=e[this.focusedDomainId]??e[0],t=U[this.focusedDomainId]??U[0];let i=e[0],o=e[0];for(const r of e)r.elo>i.elo&&(i=r),r.elo<o.elo&&(o=r);const l=s.theta>=0?`+${s.theta.toFixed(2)}`:s.theta.toFixed(2);return`
      <div class="ws-meta-two-col">
        <!-- Left: Interactive SVG 12-Domain Radar -->
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="text-align:center;">
            <div class="ws-meta-section-title">12-Domain IRT Cognitive Radar (θ)</div>
            <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
              Tap any spoke or domain row to inspect telemetry
            </div>
          </div>

          ${ga(e,this.focusedDomainId)}

          <div class="ws-meta-note" style="box-shadow:inset 3px 0 0 ${t.accentHex};display:flex;align-items:center;gap:10px;padding:8px 0 8px 12px;">
            <img src="./${h(t.medallionUrl)}" alt="" style="width:36px;height:36px;object-fit:contain;flex-shrink:0;" />
            <div style="min-width:0;flex:1 1 auto;">
              <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px;align-items:baseline;">
                <span style="font-family:var(--font-display);font-size:14px;font-weight:800;color:${t.accentHex};">
                  ${h(s.name)}
                </span>
                <span style="font-family:var(--font-mono);font-size:11.5px;font-weight:700;color:var(--gold-bright);">
                  ELO ${s.elo} · θ ${l}
                </span>
              </div>
              <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
                ${h(s.rankTitle)} · Mastery ${s.masteryPct}% · <strong style="color:var(--cyan-clue);">${h(t.factionAffinity)}</strong>
              </div>
              ${this.callbacks.onOpenDomainAnalytics?`<button type="button" class="ws-meta-inline-link" data-passport-focused-stats="${this.focusedDomainId}" style="margin-top:4px;min-height:44px;padding:0 4px;">
                      ▸ Drill Into ${h(s.shortName)} Career Stats
                    </button>`:""}
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-muted);padding-top:6px;border-top:1px solid rgba(255,255,255,0.07);">
            <span>★ APEX: <strong style="color:var(--emerald-win);">${h(i.shortName)} (${i.elo})</strong></span>
            <span>▲ TARGET: <strong style="color:var(--amber-warn);">${h(o.shortName)} (${o.elo})</strong></span>
          </div>
        </div>

        <!-- Right: Hairline 12-Domain ELO List (Clickable -> Career Stats drilled to exact domain!) -->
        <div style="display:flex;flex-direction:column;">
          <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px;margin-bottom:6px;">
            <div class="ws-meta-section-title">Domain ELO &amp; Mastery</div>
            ${this.callbacks.onOpenDomainAnalytics?'<span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">Tap any domain for Career Stats</span>':""}
          </div>
          ${e.map((r,p)=>{const d=U[p];return`
                <button
                  type="button"
                  class="ws-meta-row is-interactive ws-stats-row-btn ${p===this.focusedDomainId?"is-focused":""}"
                  data-passport-domain-stats="${p}"
                  data-focus-domain="${p}"
                  aria-label="Open Career Stats for ${h(d.name)}"
                >
                  <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                    <img src="./${h(d.medallionUrl)}" alt="" style="width:24px;height:24px;object-fit:contain;flex-shrink:0;" />
                    <span style="font-size:12.5px;font-weight:600;color:var(--ivory-primary);">${h(r.shortName)}</span>
                  </span>
                  <span style="font-family:var(--font-mono);font-size:11.5px;font-weight:700;color:${d.accentHex};flex-shrink:0;display:inline-flex;align-items:center;gap:7px;">
                    <span>${r.elo} <span style="color:#a5afc2;font-weight:500;">· ${r.masteryPct}%</span></span>
                    ${this.callbacks.onOpenDomainAnalytics?'<span style="color:var(--gold-bright);font-size:11px;">Stats ▸</span>':""}
                  </span>
                </button>
              `}).join("")}
        </div>
      </div>
    `}renderGlobalFeedTab(e){const s=st(),t=[...e.dailyHistory].sort((r,p)=>p.utcDate.localeCompare(r.utcDate)),i=Math.max(s.bestPercentile,...t.map(r=>r.percentile),0),o=i>0?Math.max(1,100-i):null,l=Math.max(s.bestScore,...t.map(r=>r.score),0);return`
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
              ${ba([...e.dailyHistory])}
            </div>

            <div class="ws-meta-section" style="border-bottom:none;">
              <div class="ws-meta-section-title">Broadcast Ledger (00:00 UTC)</div>
              <div>
                ${t.map(r=>{const p=Math.max(1,100-me(r.percentile,1,99)),d=s.shareCardsByDate[r.utcDate],n=this.copiedDateToast===r.utcDate;return`
                      <div class="ws-meta-row" style="flex-wrap:wrap;">
                        <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
                          <span style="font-family:var(--font-mono);font-size:12.5px;font-weight:700;color:var(--gold-bright);">
                            ${h(r.utcDate)}
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
                            TOP ${p}%
                          </span>
                          ${d?`<button type="button" class="ws-meta-inline-link" data-copy-daily="${h(r.utcDate)}">
                                  ${n?"✓ Copied":"Share"}
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
    `}bindEvents(e){e.querySelectorAll("img[data-fallback-src]").forEach(o=>{o.addEventListener("error",()=>{const l=o.dataset.fallbackSrc;l&&o.src!==l&&(o.src=l)},{once:!0})}),e.querySelector("#ws-passport2-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),re(e,{closeBtnId:"ws-passport2-close",onNavigate:o=>this.callbacks.onNavigateSection?.(o),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-passport-tab]").forEach(o=>{o.addEventListener("click",()=>{const l=o.dataset.passportTab;!l||l===this.activeTab||(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.activeTab=l,this.nameFeedbackMsg=null,this.rerender())})});const s=e.querySelector("#ws-passport-name-input");if(s){const o=r=>r.stopPropagation();s.addEventListener("keyup",o),s.addEventListener("keypress",o),s.addEventListener("input",()=>{const r=aa(s.value);s.value!==r&&(s.value=r)});const l=()=>{const r=sa(s.value);if(!r.valid){this.nameFeedbackMsg={text:r.error??"Enter a valid name (1–22 characters).",isError:!0},this.rerender();return}this.deps.passport.setChallengerName(r.cleaned),this.nameFeedbackMsg={text:`Credentials stamped for ${r.cleaned}.`,isError:!1},this.stampAnimating=!0,this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp"),this.callbacks.onPassportStamped?.(),this.callbacks.onRenameChallenger?.(r.cleaned),this.rerender()};e.querySelector("#ws-passport2-save-name")?.addEventListener("click",l),s.addEventListener("keydown",r=>{r.stopPropagation(),r.key==="Enter"&&(r.preventDefault(),l())})}e.querySelector("#ws-passport2-restamp")?.addEventListener("click",()=>{this.triggerStampCeremony()}),e.querySelectorAll("[data-select-crest]").forEach(o=>{o.addEventListener("click",()=>{const l=o.dataset.selectCrest;l&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.deps.passport.unlockTitleCrest(l,!0),this.rerender())})}),e.querySelectorAll("[data-inspect-relic]").forEach(o=>{o.addEventListener("click",()=>{const l=o.dataset.inspectRelic;l&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onInspectRelicInObservatory?.(l))})});const t=o=>{const l=Number(o);!Number.isFinite(l)||l<0||l>11||(this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.focusedDomainId=l,this.rerender())},i=o=>{const l=Number(o);!Number.isFinite(l)||l<0||l>11||(this.focusedDomainId=l,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onOpenDomainAnalytics?this.callbacks.onOpenDomainAnalytics(l):this.rerender())};e.querySelectorAll("[data-passport-domain-stats]").forEach(o=>{o.addEventListener("click",()=>i(o.dataset.passportDomainStats))}),e.querySelectorAll("[data-passport-focused-stats]").forEach(o=>{o.addEventListener("click",()=>i(o.dataset.passportFocusedStats))}),e.querySelectorAll("[data-radar-domain]").forEach(o=>{o.addEventListener("click",()=>t(o.getAttribute("data-radar-domain")??void 0))}),e.querySelectorAll("[data-copy-daily]").forEach(o=>{o.addEventListener("click",()=>{const l=o.dataset.copyDaily;if(!l)return;const r=st().shareCardsByDate[l];r&&(navigator.clipboard?.writeText(r).catch(()=>{}),this.copiedDateToast=l,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})})}}const it="ws_spaced_repetition_v2",fe=3600*1e3,se=24*fe,ot=0,kt=4*fe,ee={1:kt,2:1*se,3:3*se,4:7*se,5:21*se},va={1:"Box 1 · Immediate",2:"Box 2 · 24h",3:"Box 3 · 3 Days",4:"Box 4 · 7 Days",5:"Box 5 · Mastered"},Et={1:"Now",2:"24h",3:"3d",4:"7d",5:"21d"},rt=600;function Se(a){return Number.isFinite(a)?Math.max(0,Math.min(11,Math.floor(a))):0}function wa(a){return Number.isFinite(a)?Math.max(1,Math.min(5,Math.round(a))):1}function N(a){return String(a??"").trim().replace(/\b(in|from|since|circa|c\.|by|until|around|year|founded|born|died)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\(([12]),(\d{3})([–\-]([12]),?(\d{3}))?\)/g,(e,s,t,i,o,l)=>i&&o&&l?`(${s}${t}–${o}${l})`:`(${s}${t})`).replace(/\b([12]),(\d{3})\s*(CE|BCE|AD|BC)\b/g,"$1$2 $3").replace(/\b([12]),(\d{3})([–\-])([12]),(\d{3})\b/g,"$1$2$3$4$5")}function ce(a,e){if(!Array.isArray(a))return[];const s=e.trim().toLowerCase(),t=new Set,i=[];for(const o of a){const l=N(String(o??""));if(!l)continue;const r=l.toLowerCase();if(!(r===s||t.has(r))&&(t.add(r),i.push(l),i.length>=3))break}return i}function H(a){return{...a,distractors:[...a.distractors]}}function xa(a,e=Date.now()){const s=a-e;return s<=0?"Due now":s<fe?`in ${Math.max(1,Math.ceil(s/6e4))}m`:s<se?`in ${Math.max(1,Math.round(s/fe))}h`:`in ${Math.max(1,Math.round(s/se))}d`}const Fe=[{qid:900001,domainId:0,subcatLabel:"Modern Diplomacy",prompt:'Which 1814–1815 European diplomatic summit was nicknamed "The Dancing Congress"?',correctAnswer:"Congress of Vienna",distractors:["Treaty of Utrecht","Congress of Berlin","Peace of Westphalia"],whyExplanation:"Prince Metternich hosted lavish nightly balls in Vienna while redrawing post-Napoleonic Europe’s borders.",initialBox:1,dueNow:!0},{qid:900002,domainId:1,subcatLabel:"Materials & Elements",prompt:"Which pure metallic element possesses the highest melting point at 3,422 °C?",correctAnswer:"Tungsten",distractors:["Osmium","Rhenium","Tantalum"],whyExplanation:"Tungsten (W, atomic number 74) owes its extreme thermal resilience to dense 5d-orbital metallic bonding.",initialBox:1,dueNow:!0},{qid:900007,domainId:5,subcatLabel:"Baseball",prompt:"Which Cardinals ace posted an astonishing 1.12 ERA in 1968, prompting MLB to lower the pitcher’s mound?",correctAnswer:"Bob Gibson",distractors:["Sandy Koufax","Tom Seaver","Juan Marichal"],whyExplanation:"Gibson threw 13 shutouts and 28 complete games in 1968; MLB lowered the mound from 15 to 10 inches the next winter.",initialBox:1,dueNow:!0},{qid:900003,domainId:2,subcatLabel:"Maritime Straits",prompt:"Which narrow waterway divides the European and Asian halves of Istanbul?",correctAnswer:"Bosphorus Strait",distractors:["Dardanelles","Strait of Hormuz","Kerch Strait"],whyExplanation:"Linking the Black Sea to the Sea of Marmara, the Bosphorus is the world’s narrowest strait used for international shipping.",initialBox:2,dueNow:!1},{qid:900005,domainId:6,subcatLabel:"Computing History",prompt:"Who authored the 1843 Note G algorithm for Charles Babbage’s Analytical Engine?",correctAnswer:"Ada Lovelace",distractors:["Grace Hopper","Alan Turing","Claude Shannon"],whyExplanation:"Lovelace published an algorithm for Bernoulli numbers and foresaw symbolic computing beyond pure arithmetic.",initialBox:2,dueNow:!1},{qid:900006,domainId:11,subcatLabel:"Game Theory",prompt:"In game theory, what state holds when no player gains by unilaterally changing strategy?",correctAnswer:"Nash Equilibrium",distractors:["Pareto Optimality","Bayes’ Theorem","Prisoner’s Dilemma"],whyExplanation:"John Nash proved its existence across finite non-cooperative games in 1950 using Kakutani’s fixed-point theorem.",initialBox:5,dueNow:!1}];class At{cards=new Map;listeners=new Set;constructor(e){this.load(),e&&this.syncFromPassportBookmarks(e.getSnapshot().bookmarks)}load(){this.cards.clear();try{if(typeof localStorage>"u")return;const e=localStorage.getItem(it);if(!e)return;const s=JSON.parse(e);if(!s||!Array.isArray(s.cards))return;for(const t of s.cards){if(!t||typeof t!="object")continue;const i=Math.floor(Number(t.qid));if(!Number.isFinite(i)||i<=0)continue;const o=N(String(t.prompt??"")),l=N(String(t.correctAnswer??""));if(!o||!l)continue;const r=wa(Number(t.box)||1),p=Number.isFinite(Number(t.createdAtMs))?Number(t.createdAtMs):Date.now(),d=Number.isFinite(Number(t.nextReviewAtMs))?Number(t.nextReviewAtMs):p,n=t.lastReviewedAtMs!==null&&Number.isFinite(Number(t.lastReviewedAtMs))?Number(t.lastReviewedAtMs):null,c=["MISSED","BOOKMARKED","BOTH","SEED"].includes(t.source)?t.source:"MISSED";this.cards.set(i,{qid:i,prompt:o,correctAnswer:l,distractors:ce(t.distractors,l),whyExplanation:N(String(t.whyExplanation??"")),domainId:Se(Number(t.domainId)),subcatLabel:t.subcatLabel?N(String(t.subcatLabel)):void 0,box:r,source:c,isBookmarked:!!(t.isBookmarked||c==="BOOKMARKED"||c==="BOTH"),isSeed:!!(t.isSeed||c==="SEED"),createdAtMs:p,lastReviewedAtMs:n,nextReviewAtMs:d,totalReviews:Math.max(0,Math.floor(Number(t.totalReviews)||0)),correctReviews:Math.max(0,Math.floor(Number(t.correctReviews)||0)),wrongReviews:Math.max(0,Math.floor(Number(t.wrongReviews)||0)),streakInDeck:Math.max(0,Math.floor(Number(t.streakInDeck)||0))})}}catch{}}enforceCapacity(){if(this.cards.size<=rt)return;const e=Array.from(this.cards.values()).sort((t,i)=>t.isBookmarked!==i.isBookmarked?t.isBookmarked?1:-1:t.box!==i.box?i.box-t.box:t.createdAtMs-i.createdAtMs),s=this.cards.size-rt;for(let t=0;t<s&&t<e.length;t++)this.cards.delete(e[t].qid)}save(){this.enforceCapacity();try{if(typeof localStorage<"u"){const e={schemaVersion:2,updatedAtMs:Date.now(),cards:Array.from(this.cards.values())};localStorage.setItem(it,JSON.stringify(e))}}catch{}for(const e of this.listeners)e()}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}ingestQuestionOutcome(e){const s=Math.floor(Number(e.qid));if(!Number.isFinite(s)||s<=0)return null;const t=N(e.prompt),i=N(e.correctAnswer);if(!t||!i)return null;const o=Number.isFinite(e.nowMs)?Number(e.nowMs):Date.now(),l=Se(Number(e.domainId)),r=N(e.whyExplanation),p=ce(e.distractors,i),d=e.subcatLabel?N(e.subcatLabel):void 0,n=!!e.wasCorrect,m=!!e.wasBookmarked,c=this.cards.get(s);if(!n){if(!c){const w={qid:s,prompt:t,correctAnswer:i,distractors:p,whyExplanation:r,domainId:l,subcatLabel:d,box:1,source:m?"BOTH":"MISSED",isBookmarked:m,isSeed:!1,createdAtMs:o,lastReviewedAtMs:null,nextReviewAtMs:o+ot,totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:0};return this.cards.set(s,w),this.save(),H(w)}const y=c.box===1&&!c.isSeed&&(c.source==="MISSED"||c.source==="BOTH");return c.prompt=t,c.correctAnswer=i,p.length>0&&(c.distractors=p),r&&(c.whyExplanation=r),d&&(c.subcatLabel=d),c.domainId=l,c.box=1,c.isSeed=!1,c.isBookmarked=c.isBookmarked||m,c.source=c.isBookmarked?"BOTH":"MISSED",c.lastReviewedAtMs=o,c.totalReviews+=1,c.wrongReviews+=1,c.streakInDeck=0,c.nextReviewAtMs=o+(y?kt:ot),this.save(),H(c)}if(m){if(!c){const y={qid:s,prompt:t,correctAnswer:i,distractors:p,whyExplanation:r,domainId:l,subcatLabel:d,box:2,source:"BOOKMARKED",isBookmarked:!0,isSeed:!1,createdAtMs:o,lastReviewedAtMs:o,nextReviewAtMs:o+ee[2],totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:1};return this.cards.set(s,y),this.save(),H(y)}return c.isBookmarked=!0,c.isSeed=!1,c.source=c.source==="MISSED"||c.source==="BOTH"?"BOTH":"BOOKMARKED",p.length>0&&(c.distractors=p),r&&(c.whyExplanation=r),d&&(c.subcatLabel=d),this.save(),H(c)}if(!c)return null;const u=Math.min(5,c.box+1);return c.box=u,c.lastReviewedAtMs=o,c.nextReviewAtMs=o+ee[u],c.totalReviews+=1,c.correctReviews+=1,c.streakInDeck+=1,p.length>0&&(c.distractors=p),r&&(c.whyExplanation=r),d&&(c.subcatLabel=d),this.save(),H(c)}upsertBookmarkCard(e,s,t=Date.now()){const i=Math.floor(Number(e.qid));if(!Number.isFinite(i)||i<=0)return null;const o=this.cards.get(i);if(o){o.isBookmarked=!0,o.isSeed=!1,o.source=o.source==="MISSED"||o.source==="BOTH"?"BOTH":"BOOKMARKED";const m=ce(s,o.correctAnswer);return m.length>0&&(o.distractors=m),this.save(),H(o)}const l=N(e.prompt),r=N(e.answer);if(!l||!r)return null;const p=Date.parse(e.savedAtIso),d=Number.isFinite(p)?p:t,n={qid:i,prompt:l,correctAnswer:r,distractors:ce(s,r),whyExplanation:N(e.whyExplanation),domainId:Se(Number(e.domainId)),box:2,source:"BOOKMARKED",isBookmarked:!0,isSeed:!1,createdAtMs:d,lastReviewedAtMs:null,nextReviewAtMs:d+ee[2],totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:0};return this.cards.set(i,n),this.save(),H(n)}syncFromPassportBookmarks(e,s=Date.now()){let t=0;const i=new Set;for(const o of e){const l=Math.floor(Number(o?.qid));if(!Number.isFinite(l)||l<=0)continue;i.add(l);const r=this.cards.get(l);if(r)r.isBookmarked||(r.isBookmarked=!0,r.isSeed=!1,r.source=r.source==="MISSED"||r.source==="BOTH"?"BOTH":"BOOKMARKED",t+=1);else{const p=N(o.prompt),d=N(o.answer);if(!p||!d)continue;const n=Date.parse(o.savedAtIso),m=Number.isFinite(n)?n:s;this.cards.set(l,{qid:l,prompt:p,correctAnswer:d,distractors:[],whyExplanation:N(o.whyExplanation),domainId:Se(Number(o.domainId)),box:2,source:"BOOKMARKED",isBookmarked:!0,isSeed:!1,createdAtMs:m,lastReviewedAtMs:null,nextReviewAtMs:m+ee[2],totalReviews:0,correctReviews:0,wrongReviews:0,streakInDeck:0}),t+=1}}for(const[o,l]of Array.from(this.cards.entries()))l.isBookmarked&&!i.has(o)&&(l.source==="BOOKMARKED"?this.cards.delete(o):(l.isBookmarked=!1,l.source="MISSED"),t+=1);return t>0&&this.save(),t}recordReviewAttempt(e,s,t=Date.now()){const i=this.cards.get(Math.floor(Number(e)));if(!i)return null;const o=Number.isFinite(t)?t:Date.now(),l=i.box;i.totalReviews+=1,i.lastReviewedAtMs=o;let r;return s?(r=Math.min(5,l+1),i.box=r,i.correctReviews+=1,i.streakInDeck+=1,i.nextReviewAtMs=o+ee[r]):(r=1,i.box=1,i.wrongReviews+=1,i.streakInDeck=0,i.nextReviewAtMs=o),this.save(),{card:H(i),previousBox:l,newBox:r,wasCorrect:s,nextIntervalLabel:s?Et[r]:"Now",promoted:s&&r>l,resetToBox1:!s}}getDueCards(e=Date.now(),s){const t=Number.isFinite(e)?e:Date.now(),i=Array.from(this.cards.values()).filter(o=>o.nextReviewAtMs<=t).sort((o,l)=>o.box!==l.box?o.box-l.box:o.nextReviewAtMs!==l.nextReviewAtMs?o.nextReviewAtMs-l.nextReviewAtMs:o.wrongReviews!==l.wrongReviews?l.wrongReviews-o.wrongReviews:o.createdAtMs-l.createdAtMs).map(H);return typeof s=="number"&&s>=0?i.slice(0,Math.floor(s)):i}getDueCount(e=Date.now()){const s=Number.isFinite(e)?e:Date.now();let t=0;for(const i of this.cards.values())i.nextReviewAtMs<=s&&(t+=1);return t}getAllCards(){return Array.from(this.cards.values()).sort((e,s)=>e.box!==s.box?e.box-s.box:e.nextReviewAtMs!==s.nextReviewAtMs?e.nextReviewAtMs-s.nextReviewAtMs:s.createdAtMs-e.createdAtMs).map(H)}getMasteredCards(){return Array.from(this.cards.values()).filter(e=>e.box===5).sort((e,s)=>(s.lastReviewedAtMs??s.createdAtMs)-(e.lastReviewedAtMs??e.createdAtMs)).map(H)}getCard(e){const s=this.cards.get(Math.floor(Number(e)));return s?H(s):null}removeCard(e){const s=this.cards.delete(Math.floor(Number(e)));return s&&this.save(),s}clearAll(){this.cards.clear(),this.save()}getDeckSummary(e=Date.now()){const s=Number.isFinite(e)?e:Date.now(),t=[0,0,0,0,0];let i=0,o=0,l=0,r=0,p=0;for(const c of this.cards.values())t[c.box-1]+=1,c.nextReviewAtMs<=s&&(i+=1),o+=c.totalReviews,l+=c.correctReviews,(c.source==="MISSED"||c.source==="BOTH")&&(r+=1),c.isBookmarked&&(p+=1);const d=this.cards.size,n=t[4],m=o>0?Math.round(l/o*100):d>0?Math.round((d-t[0])/d*100):0;return{totalCards:d,dueCount:i,masteredCount:n,boxCounts:t,retentionPct:m,missedCount:r,bookmarkedCount:p}}seedDemoCardsIfEmpty(e=Date.now()){if(this.cards.size>0)return!1;const s=Number.isFinite(e)?e:Date.now();for(let t=0;t<Fe.length;t++){const i=Fe[t],o=i.dueNow?s-(Fe.length-t)*1e3:s+ee[i.initialBox];this.cards.set(i.qid,{qid:i.qid,prompt:N(i.prompt),correctAnswer:N(i.correctAnswer),distractors:ce(i.distractors,i.correctAnswer),whyExplanation:N(i.whyExplanation),domainId:i.domainId,subcatLabel:i.subcatLabel,box:i.initialBox,source:"SEED",isBookmarked:!1,isSeed:!0,createdAtMs:s-(t+1)*6e4,lastReviewedAtMs:i.initialBox>1?s-fe:null,nextReviewAtMs:o,totalReviews:i.initialBox===5?4:i.initialBox===2?1:0,correctReviews:i.initialBox===5?4:i.initialBox===2?1:0,wrongReviews:0,streakInDeck:i.initialBox===5?4:i.initialBox===2?1:0})}return this.save(),!0}}function Ge(a){return a==="MASTERY"||a==="SELF_QUIZ"?"SELF_QUIZ":a==="INTEL_FLASHES"?"INTEL_FLASHES":"RELICS_3D"}function Ue(a){if(a==null)return"ALL";const e=Math.floor(Number(a));return!Number.isFinite(e)||e<0||e>11?"ALL":e}let de=null,ke=null;function nt(){return de?Promise.resolve(de):ke||(ke=(async()=>{try{if(typeof fetch!="function")return{};const a=await fetch("./data/narrative_wave2.json");return a.ok?(a.headers.get("content-type")??"").includes("text/html")?{}:(de=(await a.json()).tier3_relic_provenance??{},de):{}}catch{return{}}})(),ke)}const te=[{id:"championship_trophy",title:"First Citizen Arbiter Crown Trophy",cityLabel:"Apex Citadel",venueLabel:"World Council Grand Dais",countryCode:"WORLD",domainId:0,metallurgySpec:"24K Recycled Central-Bank Bullion · Suspended Sapphire Star Core",historicalProvenance:"Commissioned under the Geneva Charter of Human Stewardship to crown humanity’s First Citizen Arbiter before two billion live viewers.",conspiracyNote:"Its counter-rotating astrolabe rings physically house the analog optical key required to authorize—or veto—The Ledger’s global crisis protocols.",uvHiddenInscription:'UV MICRO-ETCHING: "NO SINGLE SUPERPOWER SHALL HOLD THE PEN ALONE — GENEVA ART. I"',unlockHowTo:"Showcase Preview Active · Full Arbiter Seal awarded upon completing The Apex Forum."},{id:"meridian_astrolabe",title:T.meridian_astrolabe.name,cityLabel:T.meridian_astrolabe.cityLabel,venueLabel:T.meridian_astrolabe.venueLabel,countryCode:"CH",domainId:1,metallurgySpec:"Vallée de Joux Brushed Brass · Anti-Reflective Sapphire Vernier",historicalProvenance:"Milled by fifth-generation Geneva chronometer makers for Chief Adjudicator Julian Vance’s private Vetting Chamber table.",conspiracyNote:"Vance uses its tolerance cone during Q4 not merely to score estimation accuracy, but to fingerprint risk-calibrated minds matching Trial Zero.",uvHiddenInscription:T.meridian_astrolabe.hiddenInscription,unlockHowTo:"Clear the 4-Question Geneva Vetting Prologue."},{id:"armillary_orrery",title:T.armillary_orrery.name,cityLabel:T.armillary_orrery.cityLabel,venueLabel:T.armillary_orrery.venueLabel,countryCode:"GB",domainId:0,metallurgySpec:"Aged Admiralty Bronze · 18K Sovereign Gold Declination Rings",historicalProvenance:"Modeled after 18th-century Greenwich celestial spheres and mounted beneath the glass rotunda of the Sovereign Bloc’s London headquarters.",conspiracyNote:"When rotated to 23.4° obliquity, a concealed spring latch exposes initials scratched during the erased 2019 pilot tournament.",uvHiddenInscription:T.armillary_orrery.hiddenInscription,unlockHowTo:"Defeat the London Stage 1 Boss Showdown in The Sovereign Rotunda."},{id:"origami_prism",title:T.origami_prism.name,cityLabel:T.origami_prism.cityLabel,venueLabel:T.origami_prism.venueLabel,countryCode:"JP",domainId:6,metallurgySpec:"Smoked Synthetic Quartz · Vapor-Deposited Titanium Hinges",historicalProvenance:"Engineered by Director Kenji Takahashi’s Horizon Collective seventy floors above Tokyo Station to celebrate high-velocity deduction.",conspiracyNote:"Internal waveguides double as a passive laser interferometer—encoding geodesic survey coordinates pointing directly beneath the Giza plateau.",uvHiddenInscription:T.origami_prism.hiddenInscription,unlockHowTo:"Clear the Tokyo Stage 2 Boss Showdown in the Shinkansen Sky Pavilion."},{id:"emerald_sphere",title:T.emerald_sphere.name,cityLabel:T.emerald_sphere.cityLabel,venueLabel:T.emerald_sphere.venueLabel,countryCode:"BR",domainId:7,metallurgySpec:"Beryl-Quartz Acoustic Resonator · Spun Botanical Brass Ribs",historicalProvenance:"Suspended beneath Rio de Janeiro’s Botanical Glass Canopy, resonating at 432 Hz whenever a Challenger locks an unassisted Cold Instinct.",conspiracyNote:"Acoustic engineer Nadia Al-Mansoor recognized the sphere’s Helmholtz chamber immediately—it was tuned using her vanished brother Tariq’s equations.",uvHiddenInscription:T.emerald_sphere.hiddenInscription,unlockHowTo:"Clear the Rio de Janeiro Stage 3 Boss Showdown."},{id:"cipher_box",title:T.cipher_box.name,cityLabel:T.cipher_box.cityLabel,venueLabel:T.cipher_box.venueLabel,countryCode:"EG",domainId:10,metallurgySpec:"Tura Limestone Core · Counter-Rotating Pharaonic Electrum Tumblers",historicalProvenance:"Recovered from the subterranean Meridian Zero vault beneath Cairo’s Solar Acoustic Hall during the staged broadcast blackout.",conspiracyNote:"Contains the unredacted 2019 Trial Zero psychometric ledger—proving your 99.4% cognitive match with erased first champion Tariq Al-Mansoor.",uvHiddenInscription:T.cipher_box.hiddenInscription,unlockHowTo:"Decrypt Cairo’s Stage 4 Meridian Zero Boss Showdown."},{id:"cryo_relay",title:T.cryo_relay.name,cityLabel:T.cryo_relay.cityLabel,venueLabel:T.cryo_relay.venueLabel,countryCode:"IS",domainId:11,metallurgySpec:"Columnar Icelandic Basalt · Superconducting Niobium-Gold Coil",historicalProvenance:"Cooled by sub-glacial meltwater inside Reykjavik’s Geothermal Basalt Caldera to sustain zero-latency global truth verification.",conspiracyNote:"Proves Julian Vance never eliminated Tariq—he faked Tariq’s erasure and spent five years co-engineering The Meridian as a public Trojan Horse trap.",uvHiddenInscription:T.cryo_relay.hiddenInscription,unlockHowTo:"Complete Reykjavik’s Stage 5 Caldera Showdown."},{id:"council_seal",title:T.council_seal.name,cityLabel:T.council_seal.cityLabel,venueLabel:T.council_seal.venueLabel,countryCode:"SG",domainId:8,metallurgySpec:"950 Platinum Charter Disc · Fractured Crimson Corundum Core",historicalProvenance:"The ceremonial Article IX Emergency Seal held above The Ledger’s primary data monoliths on Singapore’s Diplomatic Sky-Bridge.",conspiracyNote:"Split cleanly down its treaty seam during the inner-circle betrayal crisis—exposing the proxy signature behind Rio’s pod sabotage.",uvHiddenInscription:T.council_seal.hiddenInscription,unlockHowTo:"Survive Singapore’s Stage 6 Sky-Bridge Showdown."},{id:"master_ledger",title:T.master_ledger.name,cityLabel:T.master_ledger.cityLabel,venueLabel:T.master_ledger.venueLabel,countryCode:"GLOBAL",domainId:6,metallurgySpec:"Dichroic Diamond-Carbon Lattice · Triple-Gimbal 24K Veto Key",historicalProvenance:"Anchored in International Waters aboard The Apex Forum—the planetary crisis-forecasting and treaty-verification heart of The Ledger.",conspiracyNote:"Unlocked live before two billion witnesses in The Arbiter’s Gambit against Julian Vance himself.",uvHiddenInscription:T.master_ledger.hiddenInscription,unlockHowTo:"Triumph in Stage 7 International Waters — The Apex Forum Finale."}],Sa=[{qid:900001,domainId:0,prompt:'Which 1814–1815 European diplomatic summit was nicknamed "The Dancing Congress"?',answer:"Congress of Vienna",whyExplanation:"Prince Metternich hosted lavish nightly balls in Vienna while redrawing post-Napoleonic Europe’s borders.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900002,domainId:1,prompt:"Which element has the highest melting point of all pure metals at 3,422 °C?",answer:"Tungsten",whyExplanation:"Tungsten (W, atomic number 74) owes its extreme thermal resilience to dense 5d-orbital metallic bonding.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900003,domainId:2,prompt:"Which strait separates the European and Asian sides of Istanbul?",answer:"Bosphorus Strait",whyExplanation:"Linking the Black Sea to the Sea of Marmara, the Bosphorus is the world’s narrowest strait used for international navigation.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900004,domainId:3,prompt:"Traditional Japanese art of repairing broken pottery with lacquer dusted in powdered gold?",answer:"Kintsugi",whyExplanation:'Literally "golden joinery," Kintsugi treats breakage and repair as proud chapters of an object’s history rather than flaws to disguise.',savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900005,domainId:6,prompt:"Who authored the 1843 Note G algorithm for Charles Babbage’s Analytical Engine?",answer:"Ada Lovelace",whyExplanation:"Lovelace computed Bernoulli numbers and foresaw that symbolic engines could compose music and art beyond pure arithmetic.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0},{qid:900006,domainId:11,prompt:"In game theory, what state occurs when no player gains by unilaterally changing strategy?",answer:"Nash Equilibrium",whyExplanation:"Proven by John Nash in 1950 via Kakutani’s fixed-point theorem across every finite non-cooperative game.",savedAtIso:"2026-11-01T00:00:00.000Z",isSeedExemplar:!0}],lt={0:["Treaty of Utrecht","Peace of Westphalia","Congress of Berlin","Treaty of Tilsit"],1:["Molybdenum","Osmium","Tantalum","Rhenium"],2:["Dardanelles","Strait of Hormuz","Bab-el-Mandeb","Kerch Strait"],3:["Raku Ware","Cloisonné","Chiaroscuro","Shibori"],4:["Palme d’Or","Golden Lion","Cinéma Vérité","Nouvelle Vague"],5:["Fosbury Flop","Elo Rating","Marquis of Queensberry","Tourbillon"],6:["Alan Turing","Grace Hopper","Claude Shannon","John von Neumann"],7:["Cambrian Explosion","Symbiogenesis","Convergent Evolution","Homeostasis"],8:["Geneva Convention","Westphalian Sovereignty","Habeas Corpus","Jus Cogens"],9:["Maillard Reaction","Guilloché","Damascus Steel","Haute Horlogerie"],10:["Allegory of the Cave","Ship of Theseus","Occam’s Razor","Categorical Imperative"],11:["Pareto Optimality","Prisoner’s Dilemma","Gödel Incompleteness","Bayes’ Theorem"]},ka=new Set(["verify (true)","debunk (false)","true","false"]);function ct(a,e,s){const t=M(a.correctAnswer).trim(),i=t.toLowerCase();if(i==="verify (true)"||i==="debunk (false)")return{options:["VERIFY (True)","DEBUNK (False)"],correctIdx:i==="verify (true)"?0:1};if(i==="true"||i==="false")return{options:["True","False"],correctIdx:i==="true"?0:1};const o=new Set([i]),l=[],r=(u,y=!1)=>{const w=M(u).trim();if(!w)return;const g=w.toLowerCase();y&&ka.has(g)||o.has(g)||(o.add(g),l.push(w))};for(const u of a.distractors)r(u,!0);const p=t.match(/^(\d{3,4})(?:\s+(CE|BCE|AD|BC))?$/i);if(p&&l.length<3){const u=Number(p[1]),y=p[2]?` ${p[2].toUpperCase()}`:"",w=u>=1900?[-11,-5,6,13,-18,19]:u>=1500?[-24,-9,12,27,-38,41]:[-65,-25,30,75,-110,120],g=Math.abs(a.qid)%w.length;for(let v=0;v<w.length&&l.length<3;v++){const f=u+w[(g+v)%w.length];f>0&&f<=2026&&r(`${f}${y}`,!0)}}for(const u of e){if(l.length>=3)break;u.qid!==a.qid&&u.domainId===a.domainId&&r(u.correctAnswer,!0)}for(const u of lt[a.domainId]??lt[0]){if(l.length>=3)break;r(u,!0)}for(const u of e){if(l.length>=3)break;u.qid!==a.qid&&r(u.correctAnswer,!0)}const d=l.slice(0,3);for(;d.length<3;)d.push(`Archive Candidate ${d.length+1}`);const n=[t,...d];let m=a.qid*2654435761+a.totalReviews*1013904223>>>0||1;for(let u=n.length-1;u>0;u--){m=Math.imul(m,1664525)+1013904223>>>0;const y=m%(u+1),w=n[u];n[u]=n[y],n[y]=w}const c=n.indexOf(t);return{options:n,correctIdx:Math.max(0,c)}}const Ea={1:"#e05263",2:"#f09d46",3:"#56d4f5",4:"#f2cf7e",5:"#39d49a"};class Aa{deps;srs;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};activeTab="RELICS_3D";selectedArtifactId="championship_trophy";uvBlacklightActive=!1;relicLatchesOpen=!1;activeHotspotId=null;showcaseReqToken=0;searchQuery="";domainFilter="ALL";srsDomainFilter="ALL";includeSeedExemplars=!0;srsFilter="DUE";srsBoxFilter=null;srsActiveCard=null;srsActiveOptions=null;srsLastAttemptResult=null;quizCursor=0;quizPickedIdx=null;quizShutterFlipped=!1;quizCorrectCount=0;quizAttemptedCount=0;quizStreak=0;constructor(e){this.deps=e,this.srs=e.srsEngine??new At(e.passport),le()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.activeTab=Ge(e.initialTab),this.selectedArtifactId=e.initialArtifactId??"championship_trophy";const s=Ue(e.initialDomainId);this.domainFilter=s,this.srsDomainFilter=s,this.uvBlacklightActive=!1,this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter();const t=document.createElement("div");t.setAttribute("role","dialog"),t.setAttribute("aria-label","3D Intel Observatory & Trophy Study"),document.body.appendChild(t),this.modalBackdrop=t,this.detachEscape=ne(()=>this.handleBackOrClose()),nt().then(()=>{this.isOpen()&&this.rerender()}),this.sync3DShowcase(),this.rerender()}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}const e=this.callbacks.onClose;this.close(),e?.()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}mount(e,s={}){this.unmount(),this.callbacks=s,this.activeTab=Ge(s.initialTab),this.selectedArtifactId=s.initialArtifactId??"championship_trophy";const t=Ue(s.initialDomainId);this.domainFilter=t,this.srsDomainFilter=t,this.mountedContainer=e,this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter(),nt().then(()=>{this.isOpen()&&this.rerender()}),this.sync3DShowcase(),this.renderInto(e,!1)}resetSrsRunnerTurn(e=!1){this.srsActiveCard=null,this.srsActiveOptions=null,this.srsLastAttemptResult=null,this.quizPickedIdx=null,this.quizShutterFlipped=!1,e&&(this.quizCursor=0,this.srsBoxFilter=null)}getScopedSrsSummary(e=Date.now()){if(this.srsDomainFilter==="ALL"){const n=this.srs.getDeckSummary(e);return{totalCards:n.totalCards,dueCount:n.dueCount,masteredCount:n.masteredCount,boxCounts:n.boxCounts,retentionPct:n.retentionPct}}const s=this.srs.getAllCards().filter(n=>n.domainId===this.srsDomainFilter),t=[0,0,0,0,0];let i=0,o=0,l=0;for(const n of s)t[n.box-1]+=1,n.nextReviewAtMs<=e&&(i+=1),o+=n.totalReviews,l+=n.correctReviews;const r=s.length,p=t[4],d=o>0?Math.round(l/o*100):r>0?Math.round((r-t[0])/r*100):0;return{totalCards:r,dueCount:i,masteredCount:p,boxCounts:t,retentionPct:d}}syncSrsBookmarksAndDefaultFilter(){this.srs.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks);const e=this.getScopedSrsSummary();e.dueCount>0?this.srsFilter="DUE":e.totalCards>0?this.srsFilter="ALL":this.srsFilter="DUE"}getFilteredSrsCards(){let e;return this.srsFilter==="DUE"?e=this.srs.getDueCards():this.srsFilter==="MASTERED"?e=this.srs.getMasteredCards():e=this.srs.getAllCards(),this.srsDomainFilter!=="ALL"&&(e=e.filter(s=>s.domainId===this.srsDomainFilter)),this.srsBoxFilter!==null?e.filter(s=>s.box===this.srsBoxFilter):[...e]}unmount(){const e=this.mountedContainer!==null;this.showcaseReqToken+=1,this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.syncUiRootVisibility(!1),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null),(e||this.modalBackdrop!==null)&&this.deps.audio?.stopVoice()}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}selectArtifact(e){this.selectedArtifactId=e,this.activeTab="RELICS_3D",this.uvBlacklightActive=!1,this.sync3DShowcase(),this.rerender()}syncUiRootVisibility(e){if(typeof document>"u")return;document.documentElement.classList.toggle("ws-3d-showcase-open",e);const s=document.getElementById("ui-root");s&&(s.style.visibility=e?"hidden":"visible")}async sync3DShowcase(){const e=te.find(t=>t.id===this.selectedArtifactId)??te[0],s=++this.showcaseReqToken;this.callbacks.onInspectRelic?.(e.id),this.deps.stage3d&&(await this.deps.stage3d.showHeroRelic(e.id,e.domainId),!(s!==this.showcaseReqToken||!this.isOpen())&&(this.uvBlacklightActive&&this.deps.stage3d.setLightingMode("TWIST_FRACTURE"),this.actuate3DRelicLatches(this.relicLatchesOpen)))}actuate3DRelicLatches(e){if(this.deps.stage3d){this.deps.stage3d.actuateRelicLatches(e?3:0);return}}isArtifactUnlocked(e){if(e==="championship_trophy")return!0;const s=this.deps.passport.getSnapshot(),t=this.deps.blackboard?.getSnapshot();if(s.unlockedRelics.includes(e)||t?.unlockedRelics.includes(e))return!0;const i=T[e];return!!(i&&s.visas[i.hubId]?.cleared)}getCombinedFlashes(){const s=this.deps.passport.getSnapshot().bookmarks.map(o=>({...o,isSeedExemplar:!1})),t=s.length===0||this.includeSeedExemplars?[...s,...Sa.filter(o=>!s.some(l=>l.qid===o.qid))]:s,i=this.searchQuery.trim().toLowerCase();return t.filter(o=>{if(this.domainFilter!=="ALL"&&o.domainId!==this.domainFilter)return!1;if(!i)return!0;const l=B(o.domainId).name.toLowerCase();return o.prompt.toLowerCase().includes(i)||o.answer.toLowerCase().includes(i)||o.whyExplanation.toLowerCase().includes(i)||l.includes(i)})}rerender(){const e=this.activeTab==="RELICS_3D";this.modalBackdrop?(this.modalBackdrop.className=e?"ws-meta-backdrop is-stage-dock":"ws-meta-backdrop",this.syncUiRootVisibility(e),this.renderInto(this.modalBackdrop,!0)):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,s){const t=this.deps.passport.getSnapshot();this.srs.syncFromPassportBookmarks(t.bookmarks);const i=this.srs.getDeckSummary(),o=te.filter(n=>n.id!=="championship_trophy"&&this.isArtifactUnlocked(n.id)).length,l=`
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
    `,r='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></svg>',p='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.01a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.01a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';if(s&&this.activeTab==="RELICS_3D"){const n=j("OBSERVATORY",{isModal:!0,closeBtnId:"ws-obs-close",canNavigate:!!this.callbacks.onNavigateSection,floatingVariant:!0});e.innerHTML=`
        <!-- Open Unobstructed 54-55dvh Portrait / 50vw Landscape 3D Stage (pointer-events: none pass-through!) -->
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-obs-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${n}
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
                ${p} Latches
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
      `,this.bindEvents(e);return}const d=j("OBSERVATORY",{isModal:s,closeBtnId:"ws-obs-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-obs-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">OBSERVATORY</h2>
              <div class="ws-meta-eyebrow">${o}/8 Relics · ${i.dueCount} Due · ${t.bookmarks.length} Flashes</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${d}
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
        ${te.map(e=>{const s=e.id===this.selectedArtifactId,t=this.isArtifactUnlocked(e.id),i=e.id==="championship_trophy"?"Crown":e.cityLabel;return`
            <button
              type="button"
              class="ws-meta-chip ${s?"is-active":""}"
              data-select-artifact="${e.id}"
            >
              <span style="color:${e.id==="championship_trophy"||t?"var(--gold-bright)":"var(--ivory-dim)"};">${e.id==="championship_trophy"?"♛":t?"◆":"◇"}</span>
              <span>${h(i)}</span>
            </button>
          `}).join("")}
      </div>
    `}renderRelics3DStudy(e,s=!1){const t=te.find(n=>n.id===this.selectedArtifactId)??te[0],i=this.isArtifactUnlocked(t.id),o=t.id!=="championship_trophy"?de?.[t.id]??null:null,l=o?.inspectionHotspots??[],r=l.find(n=>n.id===this.activeHotspotId)??l[0]??null,p=o?.yearCrafted?` (${ua(o.yearCrafted)})`:"",d=M(`${o?.metallurgySpec??t.metallurgySpec}${o?.artisanAttribution?` · ${o.artisanAttribution}${p}`:""}`);return`
      ${s?`
            <div style="display:flex;gap:8px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.07);">
              <button type="button" class="ws-meta-chip ${this.uvBlacklightActive?"is-active":""}" id="ws-obs-uv-scan">✦ UV</button>
              <button type="button" class="ws-meta-chip ${this.relicLatchesOpen?"is-active":""}" id="ws-obs-latch-toggle">◆ Latches</button>
            </div>
          `:""}

      <!-- Crisp Frameless Provenance Header -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;">
            ${o?.signatureGlyphUrl?`<img src="./${h(o.signatureGlyphUrl)}" alt="" style="width:30px;height:30px;object-fit:contain;flex-shrink:0;" />`:""}
            <div style="min-width:0;">
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);letter-spacing:0.08em;">
                ${h(o?.archiveCode??`${t.countryCode} · ${t.cityLabel.toUpperCase()}`)} · ${e}/8 RECOVERED
              </div>
              <div style="font-family:var(--font-display);font-size:16px;font-weight:800;color:var(--gold-bright);margin-top:2px;line-height:1.2;">
                ${h(o?.name??t.title)}
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
          ${h(M(o?.provenanceEssay??t.historicalProvenance))}
        </p>

        ${l.length>0?`
              <div style="display:flex;flex-direction:column;gap:8px;padding-top:4px;">
                <div class="ws-meta-hscroll">
                  ${l.map(n=>`
                        <button type="button" class="ws-meta-chip ${r?.id===n.id?"is-active":""}" data-obs-hotspot="${h(n.id)}" data-orbit-deg="${n.orbitDeg[0]}">
                          ◎ ${h(n.label)}
                        </button>
                      `).join("")}
                </div>
                ${r?`<div class="ws-meta-note is-cyan">
                        <strong>${h(r.label)}:</strong> ${h(M(r.note))}
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
                ${h(M(o?.conspiracySignificance??t.conspiracyNote))}
              </div>
              ${this.relicLatchesOpen&&o?.latches&&o.latches.length>0?`
                    <div style="display:flex;flex-direction:column;gap:4px;padding-top:4px;">
                      <div style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:var(--gold-bright);letter-spacing:0.06em;">
                        ◆ UNSEALED MECHANICAL LATCHES
                      </div>
                      ${o.latches.map(n=>`
                            <div class="ws-meta-row" style="justify-content:flex-start;gap:8px;font-size:11.5px;">
                              <img src="./${h(n.glyphUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;flex-shrink:0;" />
                              <span><strong>${h(n.latchName)}:</strong> <code style="color:var(--gold-bright);">“${h(M(n.engraving))}”</code></span>
                            </div>
                          `).join("")}
                    </div>
                  `:""}
              ${this.uvBlacklightActive?`
                    <div class="ws-meta-note is-cyan" style="font-family:var(--font-mono);font-size:11px;">
                      ✦ ${h(M(o?.uvHiddenInscription??t.uvHiddenInscription))}
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
          ${s===0?'<span style="font-size:11px;color:#9aa4b7;">Tap <strong>◇ Save Intel</strong> after any question to archive flashes here.</span>':`<span style="font-family:var(--font-mono);font-size:10.5px;color:var(--gold-bright);">${s} Personal Saved</span>`}
        </div>

        <!-- Single-Row Horizontal Scrollable 12-Domain Filter -->
        <div class="ws-meta-hscroll" aria-label="Filter by Domain">
          <button type="button" class="ws-meta-chip ${this.domainFilter==="ALL"?"is-active":""}" data-flash-domain="ALL">
            All Domains
          </button>
          ${U.map(t=>`
              <button type="button" class="ws-meta-chip ${this.domainFilter===t.id?"is-active":""}" data-flash-domain="${t.id}">
                <img src="./${h(t.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;" />
                ${h(t.shortName)}
              </button>
            `).join("")}
        </div>
      </div>

      <!-- Hairline-Divided Intel Flash List (Zero Nested Cards!) -->
      <div class="ws-meta-section" style="border-bottom:none;padding-top:4px;gap:0;">
        ${e.length>0?e.map(t=>{const i=B(t.domainId);return`
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
    `}renderSelfQuizMode(){const e=this.srs.getDeckSummary(),s=this.getScopedSrsSummary(),t=this.srs.getAllCards(),i=this.getFilteredSrsCards(),o=Math.max(1,...s.boxCounts),l=[1,2,3,4,5],r=this.srsDomainFilter!=="ALL"?B(this.srsDomainFilter):null,p=r?`
        <div
          id="ws-srs-domain-banner"
          class="ws-meta-note"
          data-srs-domain-banner="${r.id}"
          style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;box-shadow:inset 3px 0 0 ${r.accentHex};padding:6px 0 6px 12px;"
        >
          <span style="display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-primary);">
            <img src="./${h(r.medallionUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;" />
            <span>Filtered Domain: <strong style="color:${r.accentHex};">${h(r.name)}</strong> (${s.totalCards} cards)</span>
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
        ${U.map(k=>{const I=t.filter(O=>O.domainId===k.id).length;return`
            <button
              type="button"
              class="ws-meta-chip ws-srs-domain-chip ${this.srsDomainFilter===k.id?"is-active":""}"
              data-srs-domain="${k.id}"
            >
              <img src="./${h(k.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;" />
              <span>${h(k.shortName)}${I>0?` (${I})`:""}</span>
            </button>
          `}).join("")}
      </div>
    `,n=`
      ${p}

      <!-- Frameless 4-KPI Leitner Mastery Strip -->
      <div class="ws-meta-kpi-strip is-four-col" id="ws-srs-kpi-strip" data-srs-active-domain="${this.srsDomainFilter}">
        <div class="ws-meta-kpi-cell" data-srs-kpi="due">
          <span class="ws-meta-kpi-lbl">Due Now</span>
          <span class="ws-meta-kpi-val" id="ws-srs-due-count" style="color:${s.dueCount>0?"var(--gold-bright)":"var(--emerald-win)"};">${s.dueCount}</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="total">
          <span class="ws-meta-kpi-lbl">${r?`${h(r.shortName)} Cards`:"Deck Cards"}</span>
          <span class="ws-meta-kpi-val" id="ws-srs-total-count">${s.totalCards}</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="retention">
          <span class="ws-meta-kpi-lbl">Retention</span>
          <span class="ws-meta-kpi-val" id="ws-srs-retention" style="color:var(--cyan-clue);">${s.retentionPct}%</span>
        </div>
        <div class="ws-meta-kpi-cell" data-srs-kpi="mastered">
          <span class="ws-meta-kpi-lbl">Mastered</span>
          <span class="ws-meta-kpi-val" id="ws-srs-mastered-count" style="color:var(--emerald-win);">${s.masteredCount}</span>
        </div>
      </div>

      <!-- 5-Box Leitner Mastery Bars (Zero Nested Boxes) -->
      <div class="ws-meta-section" style="padding-top:10px;padding-bottom:10px;gap:8px;">
        ${d}

        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h3 class="ws-meta-section-title">5-Box Leitner Mastery Deck${r?` · ${h(r.shortName)}`:""}</h3>
          <span style="font-family:var(--font-mono);font-size:10px;color:#a5afc2;">
            ${this.srsBoxFilter?`Filtered: Box ${this.srsBoxFilter} (tap to clear)`:"Box 1 Immediate → Box 5 Mastered (21d)"}
          </span>
        </div>

        <div class="ws-srs-boxes-grid" id="ws-srs-box-bars" aria-label="Leitner Boxes 1 to 5">
          ${l.map(k=>{const I=s.boxCounts[k-1],L=s.totalCards>0?Math.max(I>0?14:0,Math.round(I/o*100)):0,O=Ea[k],$=this.srsBoxFilter===k;return`
                <button
                  type="button"
                  class="ws-srs-box-bar ${$?"is-active":""}"
                  data-srs-box="${k}"
                  data-srs-box-count="${I}"
                  aria-pressed="${$}"
                >
                  <div class="ws-srs-box-head">
                    <span class="ws-srs-box-name">Box ${k}</span>
                    <span class="ws-srs-box-count" style="color:${O};">${I}</span>
                  </div>
                  <div class="ws-srs-box-track">
                    <div class="ws-srs-box-fill" style="width:${L}%;background:${O};"></div>
                  </div>
                  <span class="ws-srs-box-interval">${h(Et[k])}</span>
                </button>
              `}).join("")}
        </div>

        <!-- Filter Pills + Optional 3D Stage Review Launch (Zero Right-Edge Clip on 360px!) -->
        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:6px;" role="group" aria-label="Mastery Deck Filter">
          <button type="button" class="ws-meta-chip ${this.srsFilter==="DUE"?"is-active":""}" data-srs-filter="DUE">
            Due (${s.dueCount})
          </button>
          <button type="button" class="ws-meta-chip ${this.srsFilter==="ALL"?"is-active":""}" data-srs-filter="ALL">
            All (${s.totalCards})
          </button>
          <button type="button" class="ws-meta-chip ${this.srsFilter==="MASTERED"?"is-active":""}" data-srs-filter="MASTERED">
            Mastered (${s.masteredCount})
          </button>
          ${this.callbacks.onLaunchLivePrismReview&&i.length>0?`<button type="button" class="ws-meta-chip" id="ws-srs-launch-3d" style="color:var(--cyan-clue);">
                  3D Review ▸
                </button>`:""}
        </div>
      </div>
    `;if(s.totalCards===0)return r&&e.totalCards>0?`
          ${n}
          <div class="ws-meta-section" style="text-align:center;padding:24px 8px;border-bottom:none;gap:12px;">
            <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:${r.accentHex};">
              No Missed or Saved Cards in ${h(r.name)} Yet
            </div>
            <p style="margin:0 auto;max-width:440px;font-size:12.5px;color:var(--ivory-muted);line-height:1.48;">
              Every missed ${h(r.shortName)} question automatically enters Box 1 here. You currently have <strong>${e.totalCards}</strong> cards across other domains.
            </p>
            <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;padding-top:4px;">
              <button type="button" class="ws-meta-btn-gold" data-srs-domain="ALL">
                Show All Domains (${e.totalCards}) ▸
              </button>
            </div>
          </div>
        `:`
        ${n}
        <div class="ws-meta-section" style="text-align:center;padding:24px 8px;border-bottom:none;gap:12px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:var(--gold-bright);">
            ${r?`No ${h(r.shortName)} Cards Captured Yet`:"Your Leitner Mastery Deck Is Ready"}
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
      `;const m=this.quizPickedIdx!==null||this.quizShutterFlipped;let c=m?this.srsActiveCard:null;if(!c&&i.length>0){const k=(this.quizCursor%i.length+i.length)%i.length;c=i[k]}if(!c){const k=this.srsFilter==="DUE"&&this.srsBoxFilter===null,I=k?"All Due Reviews Cleared":this.srsFilter==="MASTERED"?"No Cards in Box 5 Mastered Yet":"No Cards Match This Box Filter",L=k?`All ${s.totalCards} card${s.totalCards===1?"":"s"} in your Leitner deck are scheduled ahead. Review the full deck early or play another match to capture new cards.`:"Promote cards correctly through Boxes 1 → 5 or switch to All Saved & Missed to practice now.";return`
        ${n}
        <div class="ws-meta-section" style="text-align:center;padding:22px 8px;border-bottom:none;gap:12px;">
          <div style="font-family:var(--font-display);font-size:15px;font-weight:700;color:${k?"var(--emerald-win)":"var(--gold-bright)"};">
            ${k?"✦ ":""}${h(I)}
          </div>
          <p style="margin:0 auto;max-width:440px;font-size:12.5px;color:var(--ivory-muted);line-height:1.45;">
            ${h(L)}
          </p>
          <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
            <button type="button" class="ws-meta-btn-gold" id="ws-obs-reset-quiz-filter">
              Practice All Deck Cards (${s.totalCards}) ▸
            </button>
          </div>
        </div>
      `}let u=this.srsActiveOptions;if(!u||u.qid!==c.qid){const k=ct(c,t);u={qid:c.qid,options:k.options,correctIdx:k.correctIdx},this.srsActiveOptions=u}const{options:y,correctIdx:w}=u,g=B(c.domainId),v=this.srsLastAttemptResult?.newBox??c.box,f=["A","B","C","D"],x=c.source==="BOTH"?"Missed + Saved":c.source==="MISSED"?"Auto-Captured Miss":c.source==="BOOKMARKED"?"Saved Flash":"Geneva Archive",b=xa(this.srsLastAttemptResult?.card.nextReviewAtMs??c.nextReviewAtMs),S=i.length>0?`${(this.quizCursor%i.length+i.length)%i.length+1}/${i.length}`:"Done",R=this.srsLastAttemptResult,C=R?R.wasCorrect?`<span class="ws-srs-promotion-badge is-promoted" id="ws-srs-promotion-badge">
            ${R.promoted?`✦ BOX ${R.previousBox} → BOX ${R.newBox} · NEXT IN ${R.nextIntervalLabel.toUpperCase()}`:`✦ BOX 5 MASTERED · NEXT IN ${R.nextIntervalLabel.toUpperCase()}`}
          </span>`:`<span class="ws-srs-promotion-badge is-reset" id="ws-srs-promotion-badge">
            ↺ RESET BOX ${R.previousBox} → BOX 1 · DUE NOW
          </span>`:"";return`
      ${n}
      <div class="ws-meta-section ws-srs-runner" id="ws-srs-runner" data-srs-active-qid="${c.qid}" data-srs-active-box="${v}" style="padding-top:12px;border-bottom:none;gap:12px;">
        <div class="ws-srs-card-header">
          <div style="display:flex;align-items:center;gap:8px;min-width:0;">
            <img src="./${h(g.medallionUrl)}" alt="" style="width:22px;height:22px;object-fit:contain;flex-shrink:0;" />
            <div style="min-width:0;">
              <div style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${g.accentHex};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                ${h(g.name)}${c.subcatLabel?` · ${h(c.subcatLabel)}`:""}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:#a5afc2;">
                ${h(x)} · ${h(b)} · Card ${h(S)}
              </div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:7px;flex-shrink:0;">
            <span class="ws-srs-box-pill is-box-${v}" id="ws-srs-card-box-pill">
              ${h(va[v])}
            </span>
          </div>
        </div>

        <div style="font-size:clamp(14.5px,1.55vw,17px);font-weight:600;color:var(--ivory-primary);line-height:1.44;">
          ${h(M(c.prompt))}
        </div>

        <!-- 4 Sleek Borderless A-D Review Strips -->
        <div class="ws-srs-options-list">
          ${y.map((k,I)=>{const L=I===w,O=this.quizPickedIdx===I;return`
                <button
                  type="button"
                  class="ws-srs-option-btn ${m?L?"is-correct":O?"is-wrong":"":""}"
                  data-quiz-pick="${I}"
                  data-srs-correct="${L?"true":"false"}"
                  ${m?"disabled":""}
                >
                  <span class="ws-srs-option-key">${f[I]}</span>
                  <span style="white-space:normal;line-height:1.3;">${h(k)}</span>
                </button>
              `}).join("")}
        </div>

        ${m?`
              <div class="ws-meta-note ${R?.wasCorrect?"is-emerald":"is-crimson"}" style="display:flex;flex-direction:column;gap:6px;">
                <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
                  <span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:${R?.wasCorrect?"var(--emerald-win)":"#ff99a5"};">
                    ${R?.wasCorrect?"✦ EXACT RECALL":`✓ ${h(M(c.correctAnswer))}`}
                  </span>
                  ${C}
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
    `}bindEvents(e){e.querySelector("#ws-obs-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),re(e,{closeBtnId:"ws-obs-close",onNavigate:t=>this.callbacks.onNavigateSection?.(t),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-obs-tab]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.obsTab;if(!i)return;const o=Ge(i);o!==this.activeTab&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),o!=="RELICS_3D"&&this.deps.audio?.stopVoice(),this.activeTab=o,o==="RELICS_3D"?this.sync3DShowcase():o==="SELF_QUIZ"&&(this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter()),this.rerender())})}),e.querySelectorAll("[data-select-artifact]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.selectArtifact;i&&(this.deps.haptics?.sightlineSnap(),this.deps.audio?.playSfx("sightline_snap"),this.deps.audio?.stopVoice(),this.selectedArtifactId=i,this.uvBlacklightActive=!1,this.relicLatchesOpen=!1,this.activeHotspotId=null,this.sync3DShowcase(),this.rerender())})}),e.querySelectorAll("[data-obs-hotspot]").forEach(t=>{t.addEventListener("click",()=>{this.activeHotspotId=t.dataset.obsHotspot??null;const i=Number(t.dataset.orbitDeg)||0;this.deps.stage3d&&(this.deps.stage3d.prismRig.applyInspectDrag(i*Math.PI/180,.8),this.deps.stage3d.prismRig.releaseInspectDrag()),this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("sightline_snap"),this.rerender()})}),e.querySelector("#ws-obs-latch-toggle")?.addEventListener("click",()=>{this.relicLatchesOpen=!this.relicLatchesOpen,this.actuate3DRelicLatches(this.relicLatchesOpen),this.deps.haptics?.peel(this.relicLatchesOpen?2:1),this.deps.audio?.playSfx("shutter_peel"),this.relicLatchesOpen&&(this.callbacks.onLatchesOpened?.(this.selectedArtifactId),this.isArtifactUnlocked(this.selectedArtifactId)&&this.deps.audio?.playVoice("callout_vance_relic_latch.mp3")),this.rerender()}),e.querySelector("#ws-obs-uv-scan")?.addEventListener("click",()=>{this.uvBlacklightActive=!this.uvBlacklightActive,this.deps.haptics?.peel(2),this.deps.audio?.playSfx("shutter_peel"),this.uvBlacklightActive&&this.callbacks.onUvScan?.(this.selectedArtifactId),this.deps.stage3d&&this.deps.stage3d.setLightingMode(this.uvBlacklightActive?"TWIST_FRACTURE":this.selectedArtifactId==="championship_trophy"?"GOLD_RESONANCE":"BROADCAST"),this.rerender()});const s=e.querySelector("#ws-obs-flash-search");if(s){const t=i=>i.stopPropagation();s.addEventListener("keydown",t),s.addEventListener("keyup",t),s.addEventListener("keypress",t),s.addEventListener("input",()=>{const i=s.selectionStart??s.value.length;this.searchQuery=s.value,this.quizCursor=0,this.rerender();const o=e.querySelector("#ws-obs-flash-search");o&&(o.focus(),o.setSelectionRange(i,i))})}e.querySelector("#ws-obs-toggle-seeds")?.addEventListener("click",()=>{this.includeSeedExemplars=!this.includeSeedExemplars,this.quizCursor=0,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelector("#ws-obs-launch-quiz")?.addEventListener("click",()=>{this.activeTab="SELF_QUIZ",this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter(),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelectorAll("[data-flash-domain]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.flashDomain;this.domainFilter=i==="ALL"?"ALL":Number(i),this.quizCursor=0,this.quizPickedIdx=null,this.quizShutterFlipped=!1,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()})}),e.querySelectorAll("[data-remove-bookmark]").forEach(t=>{t.addEventListener("click",()=>{const i=Number(t.dataset.removeBookmark),o=this.deps.passport.getSnapshot().bookmarks.find(l=>l.qid===i);o&&(this.deps.passport.toggleIntelBookmark(o),this.srs.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-srs-domain]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.srsDomain;this.srsDomainFilter=i==="ALL"?"ALL":Ue(Number(i)),this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.syncSrsBookmarksAndDefaultFilter(),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()})}),e.querySelectorAll("[data-srs-box]").forEach(t=>{t.addEventListener("click",()=>{const i=Number(t.dataset.srsBox);i<1||i>5||(this.srsBoxFilter=this.srsBoxFilter===i?null:i,this.srsBoxFilter!==null&&this.srsFilter==="DUE"&&(this.srsFilter="ALL"),this.resetSrsRunnerTurn(!1),this.quizCursor=0,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-srs-filter]").forEach(t=>{t.addEventListener("click",()=>{const i=t.dataset.srsFilter;i&&(this.srsFilter=i,this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelector("#ws-srs-load-demo")?.addEventListener("click",()=>{this.srs.seedDemoCardsIfEmpty(),this.srsFilter="DUE",this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.deps.haptics?.correctBloom(),this.deps.audio?.playSfx("sightline_snap"),this.rerender()}),e.querySelector("#ws-srs-launch-3d")?.addEventListener("click",()=>{const t=this.getFilteredSrsCards();if(t.length===0||!this.callbacks.onLaunchLivePrismReview)return;const i=this.callbacks.onLaunchLivePrismReview;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.close(),i(t)}),e.querySelector("#ws-obs-reset-quiz-filter")?.addEventListener("click",()=>{this.srsFilter="ALL",this.srsBoxFilter=null,this.resetSrsRunnerTurn(!0),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelectorAll("[data-quiz-pick]").forEach(t=>{t.addEventListener("click",()=>{if(this.quizPickedIdx!==null||this.quizShutterFlipped)return;const i=Number(t.dataset.quizPick),o=this.getFilteredSrsCards();if(o.length===0)return;const l=(this.quizCursor%o.length+o.length)%o.length,r=o[l],p=this.srsActiveOptions&&this.srsActiveOptions.qid===r.qid?this.srsActiveOptions:{qid:r.qid,...ct(r,this.srs.getAllCards())};this.srsActiveOptions=p;const d=i===p.correctIdx;this.srsActiveCard=r,this.quizPickedIdx=i,this.quizAttemptedCount+=1,this.srsLastAttemptResult=this.srs.recordReviewAttempt(r.qid,d),d?(this.quizCorrectCount+=1,this.quizStreak+=1,this.deps.haptics?.correctBloom(),this.deps.audio?.playSfx("gold_resonance")):(this.quizStreak=0,this.deps.haptics?.wrongThud(!1),this.deps.audio?.playSfx("backfire_fracture")),this.rerender()})}),e.querySelector("#ws-obs-quiz-flip")?.addEventListener("click",()=>{if(this.quizPickedIdx!==null||this.quizShutterFlipped)return;const t=this.getFilteredSrsCards();if(t.length===0)return;const i=(this.quizCursor%t.length+t.length)%t.length,o=t[i];this.srsActiveCard=o,this.quizShutterFlipped=!0,this.quizAttemptedCount+=1,this.quizStreak=0,this.srsLastAttemptResult=this.srs.recordReviewAttempt(o.qid,!1),this.deps.haptics?.peel(2),this.deps.audio?.playSfx("shutter_peel"),this.rerender()}),e.querySelector("#ws-obs-quiz-next")?.addEventListener("click",()=>{this.srsFilter==="DUE"&&!!this.srsLastAttemptResult?.wasCorrect?this.quizCursor=0:this.quizCursor+=1,this.resetSrsRunnerTurn(!1),this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.rerender()})}}const It="ws_prism_atelier_equipped_v1",_t="ws_prism_atelier_honour_unlocks_v1",Ia="ws_daily_global_feed_v2",_a="ws_archive_descent_v2",Ra="ws_council_trials_v2",Ta=[{id:"SOVEREIGN_OBSIDIAN_24K",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:1,name:"Sovereign Obsidian & 24K Gold",shortBadge:"GENEVA ISSUE",milestoneTitle:"Default Geneva Charter Issue",unlockRequirementSummary:"Issued upon summons to The Vetting Chamber in Geneva.",craftProvenance:"Hand-milled Swiss obsidian-sapphire lenses suspended in brushed 24K Geneva horological gold with champagne Sightline optics.",hubOrigin:"ch",baseDomainId:0,swatchPrimaryCss:"#e5be67",swatchSecondaryCss:"#182238",swatchCrystalCss:"#121724",stage3dSkinId:"SOVEREIGN_OBSIDIAN",primaryMetalHex:15056487,secondaryMetalHex:1581107,metalRoughness:.21,shutterRoughness:.25,crystalColorHex:725020,attenuationHex:1977415,crystalRoughness:.16,iridescence:.22,ior:1.52,emissiveHex:16767108,emissiveIntensity:.05,sightlineBeamHex:16767093},{id:"DAMASCUS_STEEL_AMBER",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:2,name:"Damascus Folded Steel & Amber",shortBadge:"LONDON FORGE",milestoneTitle:"London Milestone · Sovereign Rotunda",unlockRequirementSummary:"London (GB) Visa · 2-Day Daily Streak · OR Initiate Honour.",craftProvenance:"320-layer acid-etched gunmetal Damascus gimbals paired with warm Baltic cognac-amber quartz facets forged beneath Westminster.",hubOrigin:"gb",baseDomainId:9,swatchPrimaryCss:"#b4c2d4",swatchSecondaryCss:"#434f61",swatchCrystalCss:"#5e3310",stage3dSkinId:"DAMASCUS_STEEL",primaryMetalHex:11846356,secondaryMetalHex:3884631,metalRoughness:.24,shutterRoughness:.28,crystalColorHex:1839110,attenuationHex:9062416,crystalRoughness:.17,iridescence:.18,ior:1.55,emissiveHex:16756034,emissiveIntensity:.06,sightlineBeamHex:16757575},{id:"KYOTO_URUSHI_KINTSUGI",legacyBlackboardSkinId:"KYOTO_KINTSUGI",order:3,name:"Kyoto Urushi Lacquer & Kintsugi Gold",shortBadge:"TOKYO ATELIER",milestoneTitle:"Tokyo Milestone · Shinkansen Sky Pavilion",unlockRequirementSummary:"Tokyo (JP) Visa · Archive Depth ≥ 5 · OR 3-Day Daily Streak.",craftProvenance:"Mirror-polished vermilion-ebony urushi lacquer shutters joined with 24K powdered maki-e kintsugi gold seams.",hubOrigin:"jp",baseDomainId:3,swatchPrimaryCss:"#f3cf72",swatchSecondaryCss:"#7a1622",swatchCrystalCss:"#3b0b14",stage3dSkinId:"KYOTO_KINTSUGI",primaryMetalHex:15978354,secondaryMetalHex:8001058,metalRoughness:.18,shutterRoughness:.15,crystalColorHex:2361103,attenuationHex:9378348,crystalRoughness:.14,iridescence:.32,ior:1.56,emissiveHex:16758892,emissiveIntensity:.06,sightlineBeamHex:16763496},{id:"IMPERIAL_EMERALD_BRASS",legacyBlackboardSkinId:"EMERALD_SOVEREIGN",order:4,name:"Imperial Emerald Quartz & Botanical Brass",shortBadge:"RIO CANOPY",milestoneTitle:"Rio Milestone · Botanical Glass Canopy",unlockRequirementSummary:"Rio de Janeiro (BR) Visa · OR Archive Descent Depth ≥ 10.",craftProvenance:"Deep Minas Gerais emerald-tourmaline crystal facets set in satin botanical brass tuned to Nadia Al-Mansoor’s acoustic key.",hubOrigin:"br",baseDomainId:2,swatchPrimaryCss:"#d9bc6a",swatchSecondaryCss:"#146944",swatchCrystalCss:"#0c472f",stage3dSkinId:"IMPERIAL_EMERALD",primaryMetalHex:14269546,secondaryMetalHex:1337668,metalRoughness:.22,shutterRoughness:.22,crystalColorHex:467994,attenuationHex:1606999,crystalRoughness:.16,iridescence:.28,ior:1.58,emissiveHex:5173933,emissiveIntensity:.06,sightlineBeamHex:4647848},{id:"PHARAONIC_LAPIS_ELECTRUM",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:5,name:"Pharaonic Lapis Lazuli & Solar Electrum",shortBadge:"CAIRO VAULT",milestoneTitle:"Cairo Milestone · Meridian Zero Vault",unlockRequirementSummary:"Cairo (EG) Visa · 5-Day Streak · OR Daily Top 25% Broadcast.",craftProvenance:"Celestial Badakhshan lapis lazuli crystal infused with pyrite starlight and pale silver-gold Solar Electrum from Giza’s oculus.",hubOrigin:"eg",baseDomainId:10,swatchPrimaryCss:"#f2e4b8",swatchSecondaryCss:"#1b3f96",swatchCrystalCss:"#122b6e",stage3dSkinId:"PHARAONIC_LAPIS",primaryMetalHex:15918264,secondaryMetalHex:1785750,metalRoughness:.19,shutterRoughness:.23,crystalColorHex:727621,attenuationHex:2380477,crystalRoughness:.16,iridescence:.48,ior:1.57,emissiveHex:8047615,emissiveIntensity:.06,sightlineBeamHex:7262463},{id:"AURORA_DICHROIC_TITANIUM",legacyBlackboardSkinId:"BLACK_SALON_CRIMSON",order:6,name:"Aurora Dichroic Titanium",shortBadge:"REYKJAVIK APEX",milestoneTitle:"Reykjavik / Grandmaster Milestone",unlockRequirementSummary:"Reykjavik (IS) Visa · Depth ≥ 15 · OR Global/Trials Elo ≥ 1550.",craftProvenance:"Heat-anodized Icelandic titanium housing a high-dispersion dichroic prism that refracts borealis cyan, violet, and white-gold.",hubOrigin:"is",baseDomainId:11,swatchPrimaryCss:"#dceeff",swatchSecondaryCss:"#4b3d82",swatchCrystalCss:"#16384c",stage3dSkinId:"AURORA_DICHROIC",primaryMetalHex:14479103,secondaryMetalHex:4075886,metalRoughness:.16,shutterRoughness:.17,crystalColorHex:661286,attenuationHex:1989747,crystalRoughness:.12,iridescence:.96,ior:1.64,emissiveHex:7534568,emissiveIntensity:.07,sightlineBeamHex:7075810},{id:"BLACK_SALON_CRIMSON_OBSIDIAN",legacyBlackboardSkinId:"BLACK_SALON_CRIMSON",order:7,name:"Black Salon Velvet Crimson & Carbon",shortBadge:"BLACK SALON",milestoneTitle:"Hall of Honours · Bluff & Ghost Trial Citation",unlockRequirementSummary:"Catch a Rival Bluff (CALL BLUFF) · OR Win a World Council Ghost Duel.",craftProvenance:"Matte forged-carbon tourbillon rings accented with ruby-garnet corundum facets from Teo Rojas’s underground Camden & Shinjuku tables.",hubOrigin:"gb",baseDomainId:4,swatchPrimaryCss:"#f0546a",swatchSecondaryCss:"#1b1622",swatchCrystalCss:"#240812",stage3dSkinId:"CRIMSON_BLACK_SALON",primaryMetalHex:14264428,secondaryMetalHex:2495003,metalRoughness:.22,shutterRoughness:.2,crystalColorHex:1705486,attenuationHex:8721964,crystalRoughness:.14,iridescence:.36,ior:1.58,emissiveHex:16733294,emissiveIntensity:.06,sightlineBeamHex:16736890},{id:"STERLING_CHRONOMETER_RHODIUM",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:8,name:"Vallée de Joux Rhodium & Sterling",shortBadge:"STERLING ENVOY",milestoneTitle:"Hall of Honours · Envoy Sterling Citation",unlockRequirementSummary:"Reach a 10-Question Streak · OR Earn 5 Tier-2 Sterling Medals.",craftProvenance:"Mirror-rhodium escapement bridges and coined 925 sterling silver shutters framing glacier-clear sapphire chronometer crystal.",hubOrigin:"ch",baseDomainId:1,swatchPrimaryCss:"#e4edf7",swatchSecondaryCss:"#2a3d59",swatchCrystalCss:"#0c1c33",stage3dSkinId:"SINGAPORE_SKYBRIDGE",primaryMetalHex:14871541,secondaryMetalHex:2373202,metalRoughness:.14,shutterRoughness:.18,crystalColorHex:661032,attenuationHex:2381450,crystalRoughness:.12,iridescence:.42,ior:1.56,emissiveHex:9098495,emissiveIntensity:.06,sightlineBeamHex:8047615},{id:"CONSUL_MALACHITE_VERDIGRIS",legacyBlackboardSkinId:"EMERALD_SOVEREIGN",order:9,name:"Consul Imperial Malachite & Bronze",shortBadge:"CONSUL BRONZE",milestoneTitle:"Hall of Honours · Consul 24K Gold Citation",unlockRequirementSummary:"Reach 20-Streak · 100 Lifetime Correct · OR 1,500 Domain ELO.",craftProvenance:"Banded malachite-jade crystal slabs encased in patinated treaty bronze and hand-burnished 22K Roman consul gold.",hubOrigin:"eg",baseDomainId:7,swatchPrimaryCss:"#d4a652",swatchSecondaryCss:"#18473c",swatchCrystalCss:"#08241d",stage3dSkinId:"METEORITE_ROSE_GOLD",primaryMetalHex:13936210,secondaryMetalHex:1590586,metalRoughness:.23,shutterRoughness:.24,crystalColorHex:466713,attenuationHex:1470040,crystalRoughness:.16,iridescence:.3,ior:1.57,emissiveHex:5697732,emissiveIntensity:.06,sightlineBeamHex:5434304},{id:"ARBITER_SMOKED_SAPPHIRE_PLATINUM",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:10,name:"Arbiter Smoked Sapphire & 950 Platinum",shortBadge:"ARBITER SAPPHIRE",milestoneTitle:"Hall of Honours · Very Rare Sapphire Citation",unlockRequirementSummary:"Singapore (SG) Visa · 35-Streak · OR Earn Any Tier-4 Sapphire Trophy.",craftProvenance:"Heavy 950 diplomatic platinum gimbals clasping midnight Ceylon smoked-sapphire facets cut for World Council Arbiters.",hubOrigin:"sg",baseDomainId:8,swatchPrimaryCss:"#dce4f2",swatchSecondaryCss:"#182952",swatchCrystalCss:"#081129",stage3dSkinId:"ARCTIC_CRYO_SAPPHIRE",primaryMetalHex:14476530,secondaryMetalHex:1517133,metalRoughness:.14,shutterRoughness:.17,crystalColorHex:462630,attenuationHex:2049436,crystalRoughness:.12,iridescence:.62,ior:1.61,emissiveHex:7125247,emissiveIntensity:.06,sightlineBeamHex:6468863},{id:"SOLAR_OCULUS_WHITE_GOLD",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:11,name:"Solar Oculus 18K White-Gold & Topaz",shortBadge:"6.0X ROULETTE",milestoneTitle:"Hall of Honours · High-Conviction Overclock Citation",unlockRequirementSummary:"Land 3× 6.0x Max Overclocks in 1 Match · OR 5× Bullseye Calibrations.",craftProvenance:"Satin 18K white-gold clamping jaws paired with imperial golden-topaz crystal engineered to withstand 6.0x Overclock thermal surges.",hubOrigin:"eg",baseDomainId:5,swatchPrimaryCss:"#fff0c2",swatchSecondaryCss:"#5e3c14",swatchCrystalCss:"#241506",stage3dSkinId:"ELECTRUM_MOTHER_OF_PEARL",primaryMetalHex:16246974,secondaryMetalHex:5190160,metalRoughness:.15,shutterRoughness:.2,crystalColorHex:1708037,attenuationHex:9395476,crystalRoughness:.13,iridescence:.44,ior:1.59,emissiveHex:16769149,emissiveIntensity:.06,sightlineBeamHex:16769666},{id:"CELESTIAL_DIAMOND_SOVEREIGN",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:12,name:"Mythic Celestial Diamond & Astral 24K",shortBadge:"MYTHIC 0.1%",milestoneTitle:"Hall of Honours · Mythic Tier-5 Sovereign Crown",unlockRequirementSummary:"Unlock ANY Tier-5 Mythic (0.1%) Trophy in the Hall of Honours!",craftProvenance:"Synthetic flawless Type-IIa diamond lenses with full-spectrum astral dispersion mounted in First Citizen Arbiter 24K bullion.",hubOrigin:"global",baseDomainId:11,swatchPrimaryCss:"#fff6d6",swatchSecondaryCss:"#2c2559",swatchCrystalCss:"#0e162b",stage3dSkinId:"MYTHIC_CELESTIAL_DIAMOND",primaryMetalHex:16376728,secondaryMetalHex:2498639,metalRoughness:.12,shutterRoughness:.14,crystalColorHex:594212,attenuationHex:2971770,crystalRoughness:.1,iridescence:1,ior:1.68,emissiveHex:10418175,emissiveIntensity:.07,sightlineBeamHex:16771481}],Ca=[{id:"SAPPHIRE_BLUEPRINT_CYANOTYPE",legacyBlackboardSkinId:"DAMASCUS_TITANIUM",order:13,name:"Sapphire Blueprint Cyanotype & Brass",shortBadge:"CYANOTYPE",milestoneTitle:"Hall of Honours v2.0 · Master Blueprint Architect",unlockRequirementSummary:"Solve 10 Visual Blueprint Questions (#75) · Zero Pay-to-Win.",craftProvenance:"Architectural Prussian-blue cyanotype optics encased in drafting-instrument brushed brass tuned for Sapphire Hologram Plates.",hubOrigin:"ch",baseDomainId:3,swatchPrimaryCss:"#64e6ff",swatchSecondaryCss:"#0f2e5e",swatchCrystalCss:"#071a38",stage3dSkinId:"ARCTIC_CRYO_SAPPHIRE",primaryMetalHex:15123315,secondaryMetalHex:1061222,metalRoughness:.17,shutterRoughness:.19,crystalColorHex:399411,attenuationHex:1727656,crystalRoughness:.13,iridescence:.72,ior:1.6,emissiveHex:5690613,emissiveIntensity:.07,sightlineBeamHex:6612735},{id:"DUELIST_BLOODSTONE_PLATINUM",legacyBlackboardSkinId:"BLACK_SALON_CRIMSON",order:14,name:"Duelist Bloodstone & 950 Platinum",shortBadge:"H2H DUELIST",milestoneTitle:"Hall of Honours v2.0 · Ghost Split Breaker",unlockRequirementSummary:"Beat a Challenger Ghost in a 1v1 Head-to-Head Duel (#78).",craftProvenance:"Machined 950 platinum duel jaws clasping deep bloodstone-garnet crystal forged for one-tap Head-to-Head rivals.",hubOrigin:"gb",baseDomainId:5,swatchPrimaryCss:"#e5ecf5",swatchSecondaryCss:"#6e1120",swatchCrystalCss:"#2b0710",stage3dSkinId:"CRIMSON_BLACK_SALON",primaryMetalHex:15068405,secondaryMetalHex:7016994,metalRoughness:.15,shutterRoughness:.19,crystalColorHex:2229774,attenuationHex:9377837,crystalRoughness:.14,iridescence:.46,ior:1.59,emissiveHex:16734835,emissiveIntensity:.06,sightlineBeamHex:16739201},{id:"NEURAL_ENGRAM_AMETHYST_GOLD",legacyBlackboardSkinId:"KYOTO_KINTSUGI",order:15,name:"Neural Engram Amethyst & 24K Gold",shortBadge:"BOX-5 ENGRAM",milestoneTitle:"Hall of Honours v2.0 · Leitner Box-5 Polymath",unlockRequirementSummary:"Promote 5 Cards to Box 5 Mastered in the Leitner Deck (#81).",craftProvenance:"Synaptic Siberian amethyst crystal faceted with 24K Geneva memory-lattice filigree celebrating permanent recall mastery.",hubOrigin:"jp",baseDomainId:10,swatchPrimaryCss:"#f2cf7e",swatchSecondaryCss:"#5b2f8f",swatchCrystalCss:"#1b0e36",stage3dSkinId:"AURORA_DICHROIC",primaryMetalHex:15912830,secondaryMetalHex:5975951,metalRoughness:.16,shutterRoughness:.18,crystalColorHex:1444398,attenuationHex:6960555,crystalRoughness:.12,iridescence:.84,ior:1.63,emissiveHex:13081599,emissiveIntensity:.07,sightlineBeamHex:13805823},{id:"MENSA_QUANTUM_IRIDIUM_GLASS",legacyBlackboardSkinId:"OBSIDIAN_BRASS",order:16,name:"Mensa Quantum Iridium & Prismatic Glass",shortBadge:"MENSA 99TH",milestoneTitle:"Hall of Honours v2.0 · Mensa 99th-Percentile Laureate",unlockRequirementSummary:"Score ≥ 80% on a Mensa-Tier Round (#69) · Zero Pay-to-Win.",craftProvenance:"Ultra-dense sintered iridium-platinum gimbals suspending ultraviolet quantum-dispersion crystal reserved for 99th-percentile laureates.",hubOrigin:"global",baseDomainId:11,swatchPrimaryCss:"#e8f1ff",swatchSecondaryCss:"#39227a",swatchCrystalCss:"#091124",stage3dSkinId:"MYTHIC_CELESTIAL_DIAMOND",primaryMetalHex:15266303,secondaryMetalHex:3744378,metalRoughness:.11,shutterRoughness:.13,crystalColorHex:594212,attenuationHex:4927160,crystalRoughness:.09,iridescence:1,ior:1.7,emissiveHex:9368319,emissiveIntensity:.07,sightlineBeamHex:13148927}],G=[...Ta,...Ca];function Rt(){try{if(typeof localStorage>"u")return[];const a=localStorage.getItem(_t);if(!a)return[];const e=JSON.parse(a);return Array.isArray(e)?e.filter(s=>G.some(t=>t.id===s)):[]}catch{return[]}}function La(a){const e=Rt();if(e.includes(a))return!1;e.push(a);try{typeof localStorage<"u"&&localStorage.setItem(_t,JSON.stringify(e))}catch{}return!0}function ie(a){return G.find(s=>s.id===a)??G[0]}function he(){try{if(typeof localStorage<"u"){const a=localStorage.getItem(It);if(a&&G.some(e=>e.id===a))return a}}catch{}return"SOVEREIGN_OBSIDIAN_24K"}function Tt(){return ie(he())}function Ct(a){const e=ie(a);try{typeof localStorage<"u"&&localStorage.setItem(It,e.id)}catch{}return e}function Ma(a){let e=0,s=Math.max(0,...a.dailyHistory.map(m=>m.percentile)),t=0,i=1200,o=0,l=0,r=0,p=0,d=0;try{if(typeof localStorage<"u"){const m=localStorage.getItem(Ia);if(m){const v=JSON.parse(m);e=Math.max(0,Math.floor(Number(v?.dailyStreak)||0)),s=Math.max(s,Math.floor(Number(v?.bestPercentile)||0))}const c=localStorage.getItem(_a);if(c){const v=JSON.parse(c);t=Math.max(0,Math.floor(Number(v?.bestDepthEver)||0),Math.floor(Number(v?.depth)||0)-1)}const u=localStorage.getItem(Ra);if(u){const v=JSON.parse(u);i=Math.max(700,Math.floor(Number(v?.trialsElo)||1200)),o=Math.max(0,Math.floor(Number(v?.wins)||0))}const y=localStorage.getItem("ws_career_analytics_v1");if(y){const v=JSON.parse(y);l=Math.max(0,Math.floor(Number(v?.feats?.visualBlueprintsSolved)||0)),r=Math.max(r,Math.floor(Number(v?.feats?.duelGhostWins)||0)),d=Math.max(0,Math.floor(Number(v?.feats?.difficultyBestAccuracyPct?.MENSA)||0))}const w=localStorage.getItem("ws_duel_rivals_v2");if(w){const v=JSON.parse(w),f=Array.isArray(v?.history)?v.history.filter(b=>b?.winner==="PLAYER").length:0,x=v?.rivalsById&&typeof v.rivalsById=="object"?Object.values(v.rivalsById).reduce((b,S)=>b+Math.max(0,Math.floor(Number(S?.lossesAgainstPlayer)||0)),0):0;r=Math.max(r,f,x)}const g=localStorage.getItem("ws_spaced_repetition_v2");if(g){const v=JSON.parse(g);Array.isArray(v?.cards)&&(p=v.cards.filter(f=>Number(f?.box)===5).length)}}}catch{}const n=Q.getSkillSnapshot();return{dailyStreak:e,dailyBestPercentile:s,bestEndlessDepth:t,trialsElo:i,trialsWins:o,globalElo:n.globalElo,bestStreak:n.bestStreak,totalCorrect:n.totalCorrect,visualBlueprintsSolved:l,duelWins:r,srsBox5Mastered:p,mensaBestAccPct:d}}function ze(a,e){const s=a.getSnapshot(),t=e?.getSnapshot()??null,i=he(),o=Ma(s),l=new Set(Rt()),r=Math.max(1200,...s.domainElo);return G.map(p=>{const d=p.id===i,n=l.has(p.id);if(p.id==="SOVEREIGN_OBSIDIAN_24K")return{spec:p,unlocked:!0,equipped:d,progressRatio:1,progressLabel:"Geneva Standard Issue"};if(p.id==="DAMASCUS_STEEL_AMBER"){const c=s.visas.gb,u=n||!!c?.cleared||o.dailyStreak>=2||o.bestEndlessDepth>=3||!!t?.unlockedSkins.includes("DAMASCUS_TITANIUM"),y=u?1:Math.max((c?.missionsCompleted??0)/5,o.dailyStreak/2,o.bestEndlessDepth/3);return{spec:p,unlocked:u,equipped:d,progressRatio:Math.min(1,y),progressLabel:u?"Unlocked · London / Citation":`London ${c?.missionsCompleted??0}/5 · Streak ${o.dailyStreak}/2d`}}if(p.id==="KYOTO_URUSHI_KINTSUGI"){const c=s.visas.jp,u=n||!!c?.cleared||o.bestEndlessDepth>=5||o.dailyStreak>=3||!!t?.unlockedSkins.includes("KYOTO_KINTSUGI"),y=u?1:Math.max((c?.missionsCompleted??0)/5,o.bestEndlessDepth/5,o.dailyStreak/3);return{spec:p,unlocked:u,equipped:d,progressRatio:Math.min(1,y),progressLabel:u?"Unlocked · Tokyo / Depth 5":`Tokyo ${c?.missionsCompleted??0}/5 · Depth ${o.bestEndlessDepth}/5`}}if(p.id==="IMPERIAL_EMERALD_BRASS"){const c=s.visas.br,u=n||!!c?.cleared||o.bestEndlessDepth>=10||!!t?.unlockedSkins.includes("EMERALD_SOVEREIGN"),y=u?1:Math.max((c?.missionsCompleted??0)/5,o.bestEndlessDepth/10);return{spec:p,unlocked:u,equipped:d,progressRatio:Math.min(1,y),progressLabel:u?"Unlocked · Rio / Depth 10":`Rio ${c?.missionsCompleted??0}/5 · Depth ${o.bestEndlessDepth}/10`}}if(p.id==="PHARAONIC_LAPIS_ELECTRUM"){const c=s.visas.eg,u=n||!!c?.cleared||o.dailyStreak>=5||o.dailyBestPercentile>=75,y=u?1:Math.max((c?.missionsCompleted??0)/5,o.dailyStreak/5,o.dailyBestPercentile/75);return{spec:p,unlocked:u,equipped:d,progressRatio:Math.min(1,y),progressLabel:u?"Unlocked · Cairo / Top 25%":`Cairo ${c?.missionsCompleted??0}/5 · Best ${o.dailyBestPercentile}/75%ile`}}if(p.id==="AURORA_DICHROIC_TITANIUM"){const c=s.visas.is,u=Math.max(o.globalElo,o.trialsElo),y=n||!!c?.cleared||!!s.visas.global?.cleared||o.bestEndlessDepth>=15||u>=1550,w=y?1:Math.max((c?.missionsCompleted??0)/5,o.bestEndlessDepth/15,Math.max(0,(u-1200)/350));return{spec:p,unlocked:y,equipped:d,progressRatio:Math.min(1,w),progressLabel:y?"Unlocked · Reykjavik / Grandmaster":`Reykjavik ${c?.missionsCompleted??0}/5 · Elo ${u}/1550`}}if(p.id==="BLACK_SALON_CRIMSON_OBSIDIAN"){const c=n||o.trialsWins>=1||!!t?.unlockedSkins.includes("BLACK_SALON_CRIMSON");return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:0,progressLabel:c?"Unlocked · Black Salon Citation":"Win 1 Ghost Duel or Catch a Rival Bluff"}}if(p.id==="STERLING_CHRONOMETER_RHODIUM"){const c=n||o.bestStreak>=10,u=c?1:Math.min(1,o.bestStreak/10);return{spec:p,unlocked:c,equipped:d,progressRatio:u,progressLabel:c?"Unlocked · Envoy Sterling Citation":`Peak Streak ${o.bestStreak} / 10`}}if(p.id==="CONSUL_MALACHITE_VERDIGRIS"){const c=n||o.bestStreak>=20||o.totalCorrect>=100||r>=1500,u=c?1:Math.min(1,Math.max(o.bestStreak/20,o.totalCorrect/100,Math.max(0,(r-1200)/300)));return{spec:p,unlocked:c,equipped:d,progressRatio:u,progressLabel:c?"Unlocked · Consul 24K Citation":`Correct ${o.totalCorrect}/100 · Max ELO ${r}/1500`}}if(p.id==="ARBITER_SMOKED_SAPPHIRE_PLATINUM"){const c=s.visas.sg,u=n||!!c?.cleared||o.bestStreak>=35||s.unlockedRelics.length>=6,y=u?1:Math.min(1,Math.max((c?.missionsCompleted??0)/5,o.bestStreak/35,s.unlockedRelics.length/6));return{spec:p,unlocked:u,equipped:d,progressRatio:y,progressLabel:u?"Unlocked · Arbiter Sapphire Citation":`Relics ${s.unlockedRelics.length}/6 · Streak ${o.bestStreak}/35`}}if(p.id==="SOLAR_OCULUS_WHITE_GOLD"){const c=n||o.bestStreak>=15;return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:Math.min(1,o.bestStreak/15),progressLabel:c?"Unlocked · 6.0x Overclock Citation":"3× 6.0x Max Overclocks in 1 Match · OR 15-Streak"}}if(p.id==="CELESTIAL_DIAMOND_SOVEREIGN"){const c=n||!!(t&&t.achievedEndings.length>=4);return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:Math.min(1,(t?.achievedEndings.length??0)/4),progressLabel:c?"Unlocked · Mythic 0.1% Crown":"Earn ANY Tier-5 Mythic Trophy in Hall of Honours"}}if(p.id==="SAPPHIRE_BLUEPRINT_CYANOTYPE"){const c=n||o.visualBlueprintsSolved>=10;return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:Math.min(1,o.visualBlueprintsSolved/10),progressLabel:c?"Unlocked · Master Blueprint Architect":`Visual Blueprints Solved ${o.visualBlueprintsSolved}/10`}}if(p.id==="DUELIST_BLOODSTONE_PLATINUM"){const c=n||o.duelWins>=1;return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:0,progressLabel:c?"Unlocked · Ghost Split Breaker":"Beat a Challenger Ghost in a 1v1 Duel"}}if(p.id==="NEURAL_ENGRAM_AMETHYST_GOLD"){const c=n||o.srsBox5Mastered>=5;return{spec:p,unlocked:c,equipped:d,progressRatio:c?1:Math.min(1,o.srsBox5Mastered/5),progressLabel:c?"Unlocked · Leitner Box-5 Polymath":`Box-5 Mastered Cards ${o.srsBox5Mastered}/5`}}const m=n||o.mensaBestAccPct>=80;return{spec:p,unlocked:m,equipped:d,progressRatio:m?1:Math.min(1,o.mensaBestAccPct/80),progressLabel:m?"Unlocked · Mensa 99th-Percentile Laureate":`Mensa Best Round ${o.mensaBestAccPct}% / 80%`}})}const Oa=["Facet_Carousel","Carousel_Spider","Facet_","Gimbal_Outer","Gimbal_Equatorial","Brass_Crown","Shutter_","Overclock_Jaw_","Firing_Pin","Prism_Pedestal","Ring_Outer","Ring_Mid","Petal_","Caliper_","Orb_Base","Cryptex_Ring_","Chronometer_Bezel","Chronometer_Needle"];function Da(a){let e=a,s=!1,t=!1;for(;e;){const i=e.name||"";i.startsWith("Shutter_")||i.startsWith("Petal_")||i==="Gimbal_Equatorial"||i==="Ring_Mid"?(t=!0,s=!0):Oa.some(o=>i.startsWith(o))&&(s=!0),e=e.parent}return s?t?"SHUTTER_SECONDARY":"PRIMARY_METAL":"NONE"}function Re(a,e,s={}){s.updateDomainPalette&&a.setDomain(e.baseDomainId),a.equipPrismSkin({id:e.stage3dSkinId,name:e.name,metalHex:e.primaryMetalHex,secondaryMetalHex:e.secondaryMetalHex,shutterHex:e.secondaryMetalHex,crystalHex:e.crystalColorHex,accentHex:e.sightlineBeamHex,metalRoughness:e.metalRoughness,iridescence:e.iridescence,useDomainAccent:e.id==="SOVEREIGN_OBSIDIAN_24K"}),a.prismRig.root.traverse(i=>{if(i instanceof ia){i.color.setHex(e.emissiveHex);return}if(!(i instanceof oa)||"curveRadius"in i&&"sync"in i)return;if(i.material instanceof ra&&i.material.uniforms?.uColor){i.material.uniforms.uColor.value.setHex(e.sightlineBeamHex);return}if(i.geometry instanceof na&&i.material instanceof la){i.material.color.setHex(e.sightlineBeamHex);return}const l=(Array.isArray(i.material)?i.material:[i.material]).map(r=>{if(!r||!r.visible)return r;if(r instanceof ca&&(r.transmission>.25||r.transparent&&r.clearcoat>=.8&&r.opacity<.96))return r.color.setHex(e.crystalColorHex),r.attenuationColor.setHex(e.attenuationHex),r.roughness=e.crystalRoughness,r.iridescence=Math.max(.2,e.iridescence),r.ior=Math.max(1.77,e.ior),r.clearcoat=1,r.clearcoatRoughness=.04,r.emissive.setHex(e.emissiveHex),r.emissiveIntensity=e.emissiveIntensity,r;if(r instanceof da){const p=Da(i);if(p==="NONE"||r.metalness<.32&&r.roughness>.45&&p==="PRIMARY_METAL")return r;let d=r;return r.userData&&r.userData.__wsAtelierUnique||(d=r.clone(),d.userData={...r.userData,__wsAtelierUnique:!0}),p==="SHUTTER_SECONDARY"?(d.color.setHex(e.secondaryMetalHex),d.roughness=e.shutterRoughness,d.metalness=Math.max(.68,d.metalness)):(d.color.setHex(e.primaryMetalHex),d.roughness=e.metalRoughness,d.metalness=Math.max(.92,d.metalness)),d.envMapIntensity=Math.min(d.envMapIntensity||.62,.64),d}return r});i.material=Array.isArray(i.material)?l:l[0]})}function Lt(a){const e=Tt();return Re(a,e,{updateDomainPalette:!1}),e}class $a{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};previewFinishId=he();peelPreviewOpen=!1;previewReqToken=0;overclockSurgeTimer=null;constructor(e){this.deps=e,le()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.previewFinishId=he(),this.peelPreviewOpen=!1;const s=document.createElement("div");s.className="ws-meta-backdrop is-stage-dock",s.setAttribute("role","dialog"),s.setAttribute("aria-label","Prism Atelier — 12 Zero Pay-to-Win Finishes"),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=ne(()=>this.handleBackOrClose()),this.syncUiRootVisibility(!0),this.syncLive3DPreview(ie(this.previewFinishId),!0),this.renderInto(s,!0)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}this.handleClose()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}mount(e,s={}){this.unmount(),this.callbacks=s,this.previewFinishId=he(),this.mountedContainer=e,this.syncLive3DPreview(ie(this.previewFinishId),!0),this.renderInto(e,!1)}unmount(){this.previewReqToken+=1,this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.overclockSurgeTimer&&(clearTimeout(this.overclockSurgeTimer),this.overclockSurgeTimer=null),this.syncUiRootVisibility(!1),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.deps.stage3d&&(this.deps.stage3d.setOverclockState(!1,0),Lt(this.deps.stage3d)),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}syncUiRootVisibility(e){if(typeof document>"u")return;document.documentElement.classList.toggle("ws-3d-showcase-open",e);const s=document.getElementById("ui-root");s&&(s.style.visibility=e?"hidden":"visible")}async syncLive3DPreview(e,s=!1){const t=this.deps.stage3d;if(!t)return;const i=++this.previewReqToken;if(s){if(t.setLightingMode("BROADCAST"),await t.setMorph("SIGHTLINE_LOCK",{options:["SPIN","PEEL","OVERCLOCK",e.shortBadge],domainId:e.baseDomainId,initialIndex:0,peelTier:this.peelPreviewOpen?2:1}),i!==this.previewReqToken||!this.isOpen())return;t.setCameraShot(this.peelPreviewOpen?"PRISM_PEEL_INSPECT":"PRISM_STANDARD")}else t.setDomain(e.baseDomainId);i!==this.previewReqToken||!this.isOpen()||Re(t,e,{updateDomainPalette:!1})}rerender(){this.modalBackdrop?(this.modalBackdrop.className="ws-meta-backdrop is-stage-dock",this.syncUiRootVisibility(!0),this.renderInto(this.modalBackdrop,!0)):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,s){const t=ze(this.deps.passport,this.deps.blackboard),i=t.find(n=>n.spec.id===this.previewFinishId)??t[0],o=i.spec,l=t.filter(n=>n.unlocked).length,r=`
      <div class="ws-meta-hscroll" style="padding:8px 14px;border-bottom:1px solid rgba(255,255,255,0.06);" aria-label="Select Prism Finish">
        ${t.map(n=>`
              <button
                type="button"
                class="ws-meta-chip ${n.spec.id===this.previewFinishId?"is-active":""}"
                data-atelier-select="${n.spec.id}"
              >
                <span style="width:16px;height:16px;border-radius:50%;flex-shrink:0;background:conic-gradient(${n.spec.swatchPrimaryCss} 0deg 140deg, ${n.spec.swatchSecondaryCss} 140deg 260deg, ${n.spec.swatchCrystalCss} 260deg 360deg);box-shadow:0 0 0 1px rgba(255,255,255,0.45);"></span>
                <span>${h(n.spec.shortBadge)}</span>
                ${n.equipped?'<span style="color:var(--emerald-win);font-size:10px;">✓</span>':n.unlocked?"":'<span style="opacity:0.65;font-size:10px;">◇</span>'}
              </button>
            `).join("")}
      </div>
    `,p=`
      <!-- Active Finish Editorial Header & Equip Action -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <div style="display:flex;align-items:center;gap:11px;min-width:0;">
            <span style="width:34px;height:34px;border-radius:50%;flex-shrink:0;background:conic-gradient(${o.swatchPrimaryCss} 0deg 140deg, ${o.swatchSecondaryCss} 140deg 260deg, ${o.swatchCrystalCss} 260deg 360deg);box-shadow:0 0 0 1.5px var(--gold-bright);"></span>
            <div style="min-width:0;">
              <div style="font-family:var(--font-display);font-size:15.5px;font-weight:800;color:var(--gold-bright);line-height:1.2;">
                ${h(o.name)}
              </div>
              <div style="font-family:var(--font-mono);font-size:10px;color:var(--cyan-clue);margin-top:2px;">
                ${h(o.milestoneTitle)}
              </div>
            </div>
          </div>

          ${i.equipped?'<span style="font-family:var(--font-mono);font-size:11px;font-weight:700;color:var(--emerald-win);white-space:nowrap;flex-shrink:0;">✓ EQUIPPED</span>':i.unlocked?'<button type="button" class="ws-meta-btn-gold" id="ws-atelier-equip-btn" style="flex-shrink:0;">Equip</button>':'<span style="font-family:var(--font-mono);font-size:10.5px;color:#9aa4b7;white-space:nowrap;flex-shrink:0;">◇ Preview</span>'}
        </div>

        <p style="margin:0;font-size:12.5px;color:var(--ivory-primary);line-height:1.45;">
          ${h(M(o.craftProvenance))}
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
          <span class="ws-meta-section-title">All ${G.length} Finishes (${l}/${G.length})</span>
          <span style="font-family:var(--font-mono);font-size:10px;color:var(--emerald-win);">✦ 100% Zero Pay-to-Win</span>
        </div>
        ${t.map(n=>`
              <button
                type="button"
                class="ws-meta-row is-interactive ${n.spec.id===this.previewFinishId?"is-focused":""}"
                data-atelier-select="${n.spec.id}"
                style="width:100%;text-align:left;"
              >
                <span style="display:inline-flex;align-items:center;gap:10px;min-width:0;">
                  <span style="width:20px;height:20px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg, ${n.spec.swatchPrimaryCss} 0%, ${n.spec.swatchSecondaryCss} 55%, ${n.spec.swatchCrystalCss} 100%);box-shadow:0 0 0 1px rgba(255,255,255,0.4);"></span>
                  <span style="min-width:0;display:flex;flex-direction:column;">
                    <span style="font-size:12.5px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${n.spec.order}. ${h(n.spec.name)}</span>
                    <span style="font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">${h(n.spec.unlockRequirementSummary)}</span>
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${n.equipped?"var(--emerald-win)":n.unlocked?"var(--gold-bright)":"var(--ivory-dim)"};flex-shrink:0;">
                  ${n.equipped?"✓ ON":n.unlocked?"◆ READY":`${Math.round(n.progressRatio*100)}%`}
                </span>
              </button>
            `).join("")}
      </div>
    `;if(s){const n=j("ATELIER",{isModal:!0,closeBtnId:"ws-atelier-close",canNavigate:!!this.callbacks.onNavigateSection,floatingVariant:!0});e.innerHTML=`
        <!-- Open Unobstructed 50dvh Portrait / 50vw Landscape 3D Prism Stage -->
        <div class="ws-meta-stage-zone">
          <div class="ws-meta-stage-top">
            <button type="button" class="ws-meta-float-pill" id="ws-atelier-back" data-meta-back="true" aria-label="Back">← Back</button>
            ${n}
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
            <span class="ws-meta-eyebrow">${l}/${G.length} Unlocked</span>
          </div>
          ${r}
          <div class="ws-meta-body-scroll">
            ${p}
          </div>
        </div>
      `,this.bindEvents(e);return}const d=j("ATELIER",{isModal:!1,closeBtnId:"ws-atelier-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-atelier-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">PRISM ATELIER</h2>
              <div class="ws-meta-eyebrow">${l}/${G.length} Finishes Unlocked</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${d}
          </div>
        </div>
        ${r}
        <div class="ws-meta-body-scroll">
          ${p}
        </div>
      </div>
    `,this.bindEvents(e)}bindEvents(e){e.querySelector("#ws-atelier-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),re(e,{closeBtnId:"ws-atelier-close",onNavigate:s=>this.callbacks.onNavigateSection?.(s),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-atelier-select]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.atelierSelect;if(!t)return;this.previewFinishId=t;const i=ie(t);this.deps.haptics?.sightlineSnap(),this.deps.audio?.playSfx("sightline_snap"),this.syncLive3DPreview(i,!0),this.rerender()})}),e.querySelector("#ws-atelier-equip-btn")?.addEventListener("click",()=>{const t=ze(this.deps.passport,this.deps.blackboard).find(o=>o.spec.id===this.previewFinishId);if(!t||!t.unlocked)return;const i=Ct(t.spec.id);this.deps.blackboard?.unlockSkin(i.legacyBlackboardSkinId,!0),this.deps.stage3d&&Re(this.deps.stage3d,i,{updateDomainPalette:!1}),this.deps.haptics?.lockThunk(),this.deps.audio?.playSfx("vault_thunk"),this.deps.audio?.playSfx("gold_resonance"),this.callbacks.onEquipSkin?.(i),this.rerender()}),e.querySelector("#ws-atelier-peel-toggle")?.addEventListener("click",()=>{this.peelPreviewOpen=!this.peelPreviewOpen,this.deps.haptics?.peel(this.peelPreviewOpen?2:1),this.deps.audio?.playSfx("shutter_peel"),this.syncLive3DPreview(ie(this.previewFinishId),!0),this.rerender()}),e.querySelector("#ws-atelier-overclock-pulse")?.addEventListener("click",()=>{const s=this.deps.stage3d;s&&(this.overclockSurgeTimer&&clearTimeout(this.overclockSurgeTimer),this.deps.haptics?.overclockPulse(.85),this.deps.audio?.playSfx("overclock_charge"),s.setOverclockState(!0,.92),this.overclockSurgeTimer=setTimeout(()=>{this.overclockSurgeTimer=null,this.isOpen()&&(s.setOverclockState(!1,0),this.deps.audio?.playSfx("gold_resonance"))},950))})}}const Na="ws_council_trials_v2",F={SOVEREIGN:{id:"SOVEREIGN",name:"The Sovereign Bloc",epithet:"The Iron Laurel",chairName:"Chancellor Ingrid Lindqvist",chairTitle:"Sovereign Council Chair · Former Nordic PM",fieldEnvoyLabel:"London Rotunda Seat",portraitCutoutUrl:"./assets/portraits_cutout/lindqvist.png",philosophyPillars:"Order · Heritage · Treaty Protocol",manifestoQuote:"Civilization endures only when truth is weighed inside treaty law, institutional memory, and disciplined stewardship.",affinityDomains:[0,8,3,10],passportCrestReward:"IRON LAUREL LEGATE · SOVEREIGN BLOC",accentHex:"#f2cf7e",secondaryHex:"#6c5326"},HORIZON:{id:"HORIZON",name:"The Horizon Collective",epithet:"The Glass Spire",chairName:"Director Kenji Takahashi",chairTitle:"Horizon Collective Chair · Tokyo Spire",fieldEnvoyLabel:'Envoy: Soren "Echo" Kael',portraitCutoutUrl:"./assets/portraits_cutout/soren.png",philosophyPillars:"Velocity · Optimization · Calculated Risk",manifestoQuote:"Consensus moves at the speed of yesterday’s crisis. Tomorrow belongs to minds fast enough to model reality before the clock blinks.",affinityDomains:[6,1,11],passportCrestReward:"GLASS SPIRE VANGUARD · HORIZON COLLECTIVE",accentHex:"#56d4f5",secondaryHex:"#184b6e"},AGORA:{id:"AGORA",name:"The Agora Coalition",epithet:"The Open Commons",chairName:"Ambassador Amara Okafor",chairTitle:"Agora Coalition Envoy · Civic Assembly",fieldEnvoyLabel:"Envoy: Nadia Al-Mansoor",portraitCutoutUrl:"./assets/portraits_cutout/nadia.png",philosophyPillars:"Transparency · Empathy · Living Culture",manifestoQuote:"Knowledge locked inside an Alpine vault becomes leverage. Shared openly across humanity, it becomes liberation.",affinityDomains:[2,4,7,9,5],passportCrestReward:"OPEN COMMONS ENVOY · AGORA COALITION",accentHex:"#39d49a",secondaryHex:"#15543e"}},dt=["SOVEREIGN","HORIZON","AGORA"],Pa=[{hub:"ch",city:"Geneva",baseLeader:"SOVEREIGN"},{hub:"gb",city:"London",baseLeader:"SOVEREIGN"},{hub:"jp",city:"Tokyo",baseLeader:"HORIZON"},{hub:"br",city:"Rio",baseLeader:"AGORA"},{hub:"eg",city:"Cairo",baseLeader:"AGORA"},{hub:"is",city:"Reykjavik",baseLeader:"HORIZON"},{hub:"sg",city:"Singapore",baseLeader:"HORIZON"},{hub:"global",city:"Apex Forum",baseLeader:"SOVEREIGN"}];function Ba(a,e){const s=e?.[a];return s||(a==="SOVEREIGN"?`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
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
    </svg>`)}`:a==="HORIZON"?`data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
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
  </svg>`)}`)}function Ha(){const a=Math.floor(Date.now()/36e5)%240,e={trialsElo:1200,wins:0,losses:0,salonTrophies:0,factionStandings:{SOVEREIGN:14820+a*3,HORIZON:14690+a*4,AGORA:14760+a*3}};try{if(typeof localStorage>"u")return e;const s=localStorage.getItem(Na);if(!s)return e;const t=JSON.parse(s);return!t||typeof t!="object"?e:{trialsElo:Math.max(700,Math.round(Number(t.trialsElo)||1200)),wins:Math.max(0,Math.floor(Number(t.wins)||0)),losses:Math.max(0,Math.floor(Number(t.losses)||0)),salonTrophies:Math.max(0,Math.floor(Number(t.salonTrophies)||0)),factionStandings:{SOVEREIGN:Math.max(14e3,Math.floor(Number(t.factionStandings?.SOVEREIGN)||e.factionStandings.SOVEREIGN)),HORIZON:Math.max(14e3,Math.floor(Number(t.factionStandings?.HORIZON)||e.factionStandings.HORIZON)),AGORA:Math.max(14e3,Math.floor(Number(t.factionStandings?.AGORA)||e.factionStandings.AGORA))}}}catch{return e}}class Fa{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};justPledgedToast=null;constructor(e){this.deps=e,le()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.justPledgedToast=null;const s=document.createElement("div");s.className="ws-meta-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","World Council Factions & Seasonal League"),s.addEventListener("click",t=>{t.target===s&&this.handleClose()}),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=ne(()=>this.handleBackOrClose()),this.renderInto(s,!0)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}const e=this.callbacks.onClose;this.close(),e?.()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}mount(e,s={}){this.unmount(),this.callbacks=s,this.mountedContainer=e,this.renderInto(e,!1)}unmount(){this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}computePsychometricFit(){const e=Q.getSkillVector(),s=this.deps.passport.getSnapshot(),t=this.deps.blackboard.getSnapshot(),i=p=>{let d=0;for(const n of p){const m=e[n]?.elo??s.domainElo[n]??1200;d+=(m-800)/1400*100}return d/Math.max(1,p.length)},o=i(F.SOVEREIGN.affinityDomains)+t.councilFavor*.25,l=i(F.HORIZON.affinityDomains)+Math.max(0,50-t.axisIntegrity*.2)*.25,r=i(F.AGORA.affinityDomains)+(t.publicTrust*.2+Math.max(0,t.axisIntegrity)*.12);return{SOVEREIGN:Math.min(99,Math.max(48,Math.round(52+o*.55))),HORIZON:Math.min(99,Math.max(48,Math.round(52+l*.55))),AGORA:Math.min(99,Math.max(48,Math.round(52+r*.55)))}}buildCupStandings(){const e=this.deps.trialsMode?.getHubOverview(),s=Ha(),t=e?.factionStandings??s.factionStandings,i=e?.pledgedFaction??this.deps.blackboard.getSnapshot().pledgedFaction,o=this.computePsychometricFit(),l=Math.max(1,t.SOVEREIGN+t.HORIZON+t.AGORA);return{standings:[...dt].sort((d,n)=>t[n]-t[d]).map((d,n)=>({faction:F[d],rank:n+1,cupPoints:t[d],sharePct:Number((t[d]/l*100).toFixed(1)),psychometricFitPct:o[d],isPledged:i===d})),trialsElo:e?.trialsElo??s.trialsElo,wins:e?.wins??s.wins,losses:e?.losses??s.losses,salonTrophies:e?.salonTrophies??s.salonTrophies,pledgedFaction:i}}rerender(){this.modalBackdrop?this.renderInto(this.modalBackdrop,!0):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,s){const t=this.deps.passport.getChallengerName(),i=this.deps.passport.getSnapshot(),{standings:o,trialsElo:l,wins:r,salonTrophies:p,pledgedFaction:d}=this.buildCupStandings(),n=r>=12?"HIGH LEGATE":r>=6?"COUNCILOR":r>=2?"ATTACHÉ":"DIPLOMATIC ENVOY",m=j("FACTIONS",{isModal:s,closeBtnId:"ws-factions-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-factions-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">COUNCIL BLOCS</h2>
              <div class="ws-meta-eyebrow">${h(t)} · ${n} · ELO ${l}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${m}
          </div>
        </div>

        <div class="ws-meta-body-scroll">
          ${this.justPledgedToast?`
                <div class="ws-meta-section" style="padding-top:0;">
                  <div class="ws-meta-note" style="box-shadow:inset 3px 0 0 ${F[this.justPledgedToast].accentHex};color:var(--ivory-primary);">
                    ✒ <strong>Allegiance Stamped:</strong> ${h(t)} now represents
                    <strong style="color:${F[this.justPledgedToast].accentHex};">${h(F[this.justPledgedToast].name)}</strong>
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
              ${o.map(c=>`
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
              ${Pa.map(c=>{const u=i.visas[c.hub]?.cleared&&d?d:c.baseLeader,y=F[u];return`
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
              ${dt.map(c=>{const u=F[c],y=o.find(f=>f.faction.id===c),w=this.deps.factionCrestUrls?.[c]??`./assets/factions/faction_${c.toLowerCase()}.png`,g=Ba(c),v=d===c;return`
                  <div style="display:flex;flex-direction:column;gap:10px;padding:14px 0 6px;border-top:2px solid ${u.accentHex};${v?`background:linear-gradient(180deg, ${u.accentHex}12 0%, transparent 55%);padding-left:10px;padding-right:10px;`:""}">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img
                        src="${h(w)}"
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
                      ${u.affinityDomains.map(f=>{const x=U[f];return`
                            <span style="display:inline-flex;align-items:center;gap:4px;font-size:10.5px;color:var(--ivory-muted);">
                              <img src="./${h(x.medallionUrl)}" alt="" style="width:14px;height:14px;object-fit:contain;" />
                              ${h(x.shortName)}
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
          ${this.callbacks.onLaunchGhostDuel||this.callbacks.onLaunchBlackSalon?this.renderGhostContendersStrip(pa):""}
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
          ${e.slice(0,4).map(s=>{const t=F[s.faction];return`
                <button
                  type="button"
                  class="ws-meta-row is-interactive"
                  data-challenge-ghost="${h(s.id)}"
                  style="width:100%;text-align:left;"
                >
                  <span style="min-width:0;">
                    <span style="display:block;font-size:12.5px;font-weight:700;color:var(--ivory-primary);line-height:1.25;">
                      ${h(s.handle)} <span style="color:var(--ivory-dim);font-weight:500;">(${h(s.countryCode)})</span>
                    </span>
                    <span style="display:block;font-family:var(--font-mono);font-size:10px;color:${t.accentHex};">
                      ${h(s.faction)} · ELO ${s.elo}
                    </span>
                  </span>
                  <span style="color:var(--gold-bright);font-family:var(--font-mono);font-size:11px;font-weight:700;flex-shrink:0;">⚔ Duel ›</span>
                </button>
              `}).join("")}
        </div>
      </div>
    `}bindEvents(e){e.querySelectorAll("img[data-fallback-src]").forEach(s=>{s.addEventListener("error",()=>{const t=s.dataset.fallbackSrc;t&&s.src!==t&&(s.src=t)},{once:!0})}),e.querySelector("#ws-factions-back")?.addEventListener("click",()=>{this.handleBackOrClose()}),re(e,{closeBtnId:"ws-factions-close",onNavigate:s=>this.callbacks.onNavigateSection?.(s),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-pledge-faction]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.pledgeFaction;if(!t||!(t in F))return;this.deps.trialsMode?this.deps.trialsMode.pledgeFaction(t):this.deps.blackboard.setPledgedFaction(t);const i=F[t];this.deps.passport.unlockTitleCrest(i.passportCrestReward,!0),this.justPledgedToast=t,this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp"),this.deps.audio?.playSfx("gold_resonance"),this.callbacks.onPledgeFaction?.(t),this.rerender()})}),e.querySelectorAll("[data-challenge-ghost]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.challengeGhost;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.close(),this.callbacks.onLaunchGhostDuel?.(t)})}),e.querySelector("#ws-factions-black-salon")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.close(),this.callbacks.onLaunchBlackSalon?.()})}}const Os=["MIDDLE_SCHOOL","HIGH_SCHOOL","COLLEGE","GRADUATE","MENSA"],Ae="ws_career_analytics_v1",qe=2e3,Ke=140,pt=2500,Ne=["MULTIPLE_CHOICE","MATCH_4","SORT_4","MULTI_STRIKE","PINPOINT_DIAL","CLUE_ESCALATOR","VISUAL_SPOTTER"],je=["SIGHTLINE_LOCK","CODEX_DUAL_RING","CALIBRATOR_DIAL","GAUNTLET_SHATTER","HERO_ARTIFACT_SYNTHESIS","GLOBE_PIN_DROP"],Mt=["CAMPAIGN","DAILY","BRIEFING","ENDLESS","TRIALS","PROLOGUE"],Te=["< 3.0s","3–6s","6–10s","10–15s","15s+"];function ht(a="ALL_TIME"){return{range:a,domainId:null,subcatLabel:null,archetype:null,questionFormat:null,peelTier:null,outcome:"ALL",speedBucket:null,bucketKey:null}}function Pe(a){if(!a||typeof a!="string")return null;const e=a.trim().toUpperCase();return e==="MULTIPLE_CHOICE"||e==="MATCH_4"||e==="SORT_4"||e==="MULTI_STRIKE"||e==="PINPOINT_DIAL"||e==="CLUE_ESCALATOR"||e==="VISUAL_SPOTTER"?e:null}function Ce(a){const e=Pe(a.questionFormat);if(e)return e;if(a.clueLadderStep===1||a.clueLadderStep===2||a.clueLadderStep===3)return"CLUE_ESCALATOR";switch(a.archetype){case"CALIBRATOR_DIAL":return"PINPOINT_DIAL";case"GLOBE_PIN_DROP":return"VISUAL_SPOTTER";case"CODEX_DUAL_RING":return"MATCH_4";case"GAUNTLET_SHATTER":return"MULTI_STRIKE";case"HERO_ARTIFACT_SYNTHESIS":return"CLUE_ESCALATOR";case"SIGHTLINE_LOCK":default:return"MULTIPLE_CHOICE"}}function ge(a){const e=Number.isFinite(a)?a:5200;return e<3e3?0:e<6e3?1:e<1e4?2:e<15e3?3:4}function Le(a){return(Number(a.overclockCharge01)||0)>=.08||!!a.backfired}const ut={0:{core:"World Civilizations",dial:"Historical Dates",myth:"History Myths",globe:"Historic Sites"},1:{core:"Physics & Space",dial:"Scientific Milestones",myth:"Science Myths",globe:"Observatories & Labs"},2:{core:"World Capitals",dial:"Geographic Extremes",myth:"Geography Myths",globe:"Atlas Pinpoints"},3:{core:"Fine Arts & Literature",dial:"Cultural Eras",myth:"Art & Lit Myths",globe:"Cultural Landmarks"},4:{core:"Cinema & Music",dial:"Pop Culture Years",myth:"Entertainment Myths",globe:"Film & Music Capitals"},5:{core:"Championship Sports",dial:"Sports Records",myth:"Sports Myths",globe:"Iconic Venues"},6:{core:"Computing & Innovation",dial:"Tech Breakthroughs",myth:"Tech Myths",globe:"Tech Hubs"},7:{core:"Biology & Ecology",dial:"Natural Milestones",myth:"Nature Myths",globe:"Biomes & Habitats"},8:{core:"Global Politics & Law",dial:"Treaty Timelines",myth:"Civic Myths",globe:"Diplomatic Capitals"},9:{core:"Culinary & Craft",dial:"Design Heritage",myth:"Food & Design Myths",globe:"Regional Origins"},10:{core:"Philosophy & Myth",dial:"Classical Antiquity",myth:"Mythology Facts",globe:"Ancient Temples"},11:{core:"Logic & Economics",dial:"Quantitative Estimates",myth:"Logic Paradoxes",globe:"Financial Centers"}};function Ot(a){return a<1120?"MIDDLE_SCHOOL":a<1260?"HIGH_SCHOOL":a<1440?"COLLEGE":a<1650?"GRADUATE":"MENSA"}function Qe(a){if(typeof a!="string")return null;const e=a.trim().replace(/\s+/g," ").slice(0,44);return e.length>0?e:null}function Xe(a,e,s){const t=(s??"").toLowerCase();if(t){if(a===1){if(/\b(planet|star|orbit|galaxy|nasa|moon|mars|apollo|telescope|space)\b/.test(t))return"Astronomy & Space";if(/\b(element|atom|molecule|chemical|periodic|acid|metal|oxygen|carbon)\b/.test(t))return"Chemistry";if(/\b(dna|cell|gene|species|brain|heart|blood|organ|vaccine)\b/.test(t))return"Biology & Medicine";if(/\b(quantum|light|gravity|energy|relativity|particle|electron|cern)\b/.test(t))return"Physics"}else if(a===0){if(/\b(war|battle|treaty|empire|king|queen|dynasty|roman|greek|egypt)\b/.test(t))return"Empires & Conflict";if(/\b(revolution|constitution|president|independence|congress|charter)\b/.test(t))return"Modern History"}else if(a===5){if(/\b(baseball|mlb|home run|pitcher|world series|fenway|wrigley)\b/.test(t))return"Baseball";if(/\b(olympic|marathon|medal|sprint|swim|gymnast)\b/.test(t))return"Olympics";if(/\b(world cup|fifa|soccer|football|goal|striker)\b/.test(t))return"World Football";if(/\b(nba|basketball|tennis|wimbledon|chess|grandmaster)\b/.test(t))return"Court & Board Sports"}}const i=ut[a]??ut[0];return e==="CALIBRATOR_DIAL"?i.dial:e==="GAUNTLET_SHATTER"?i.myth:e==="GLOBE_PIN_DROP"?i.globe:i.core}function Dt(a){const e=Number.isFinite(Number(a.ts))&&Number(a.ts)>0?Math.floor(Number(a.ts)):Date.now(),s=typeof a.dateKey=="string"&&/^\d{4}-\d{2}-\d{2}$/.test(a.dateKey.trim())?a.dateKey.trim():oe(e),t=P(Math.floor(Number(a.domainId)||0),0,11),i=We(a.mode),o=$t(a.archetype),l=a.peelTier===2?2:a.peelTier===3?3:1,r=P(Number(a.overclockCharge01)||0,0,1),p=P(Math.round(Number(a.responseTimeMs)||5200),150,6e4),d=typeof a.speedBucketIdx=="number"&&Number.isInteger(a.speedBucketIdx)&&a.speedBucketIdx>=0&&a.speedBucketIdx<=4?a.speedBucketIdx:ge(p),n=P(Math.round(Number(a.eloAfter)||1200),600,2600),m=typeof a.promptSnippet=="string"?a.promptSnippet.trim().slice(0,96):"",c=typeof a.answerLabel=="string"?a.answerLabel.trim().slice(0,48):"",u=Qe(a.subcatLabel)??Xe(t,o,m),y=Ve(a.difficultyTier)??Ot(n),w=B(t),g=m||(c?`${u}: ${c}`:`${w.shortName} · ${u}`);return{ts:e,dateKey:s,qid:Math.max(0,Math.floor(Number(a.qid)||0)),domainId:t,mode:i,hubId:typeof a.hubId=="string"&&a.hubId.trim()?a.hubId.trim():"ch",archetype:o,questionFormat:Pe(a.questionFormat)??void 0,correct:!!a.correct,peelTier:l,overclockCharge01:Number(r.toFixed(2)),backfired:!!a.backfired,bluffCalled:!!a.bluffCalled,bullseye:!!a.bullseye,responseTimeMs:p,pointsDelta:Math.max(0,Math.round(Number(a.pointsDelta)||0)),eloAfter:n,promptSnippet:g,answerLabel:c||void 0,subcatLabel:u,difficultyTier:y,speedBucketIdx:d,clueLadderStep:a.clueLadderStep===1||a.clueLadderStep===2||a.clueLadderStep===3?a.clueLadderStep:void 0,mindGambitId:typeof a.mindGambitId=="string"&&a.mindGambitId?a.mindGambitId:void 0}}function P(a,e,s){return Number.isFinite(a)?Math.max(e,Math.min(s,a)):e}function oe(a){try{return new Date(a).toISOString().slice(0,10)}catch{return"2026-11-22"}}function We(a,e){if(e)return"TRIALS";const s=(a??"CAMPAIGN").toUpperCase();return s==="BLACK_SALON"||s==="GHOST_TRIALS"?"TRIALS":s==="PROLOGUE"||s==="CAMPAIGN"||s==="DAILY"||s==="BRIEFING"||s==="ENDLESS"||s==="TRIALS"?s:"CAMPAIGN"}function Ve(a){if(!a)return null;const e=a.trim().toUpperCase();return e==="MIDDLE_SCHOOL"||e==="MID_SCHOOL"||e==="EASY"?"MIDDLE_SCHOOL":e==="HIGH_SCHOOL"?"HIGH_SCHOOL":e==="COLLEGE"||e==="MEDIUM"?"COLLEGE":e==="GRADUATE"||e==="HARD"?"GRADUATE":e==="MENSA"||e==="GENIUS"?"MENSA":null}function Me(){return{MIDDLE_SCHOOL:0,HIGH_SCHOOL:0,COLLEGE:0,GRADUATE:0,MENSA:0}}function $t(a){const e=(a??"SIGHTLINE_LOCK").toUpperCase();return e==="SIGHTLINE_LOCK"||e==="CODEX_DUAL_RING"||e==="CALIBRATOR_DIAL"||e==="GAUNTLET_SHATTER"||e==="HERO_ARTIFACT_SYNTHESIS"||e==="GLOBE_PIN_DROP"?e:"SIGHTLINE_LOCK"}function be(){return{MULTIPLE_CHOICE:{right:0,wrong:0},MATCH_4:{right:0,wrong:0},SORT_4:{right:0,wrong:0},MULTI_STRIKE:{right:0,wrong:0},PINPOINT_DIAL:{right:0,wrong:0},CLUE_ESCALATOR:{right:0,wrong:0},VISUAL_SPOTTER:{right:0,wrong:0}}}function ae(){const a=Array.from({length:12},()=>({right:0,wrong:0,totalResponseMs:0,peakElo:1200,lastElo:1200})),e={SIGHTLINE_LOCK:{right:0,wrong:0},CODEX_DUAL_RING:{right:0,wrong:0},CALIBRATOR_DIAL:{right:0,wrong:0},GAUNTLET_SHATTER:{right:0,wrong:0},HERO_ARTIFACT_SYNTHESIS:{right:0,wrong:0},GLOBE_PIN_DROP:{right:0,wrong:0}},s=be(),t={1:{right:0,wrong:0},2:{right:0,wrong:0},3:{right:0,wrong:0}},i={};for(const o of Mt)i[o]={right:0,wrong:0,matchesPlayed:0,matchesWon:0,bestScore:0};return{schemaVersion:1,backfilledFromLegacy:!1,totalRight:0,totalWrong:0,totalResponseMs:0,totalPointsEarned:0,currentStreak:0,bestStreak:0,fastUnder3sStreak:0,bestFastUnder3sStreak:0,globalEloLatest:1200,globalEloPeak:1200,uniqueSolvedQids:[],uniqueSolvedCount:0,byDomain:a,byArchetype:e,byFormat:s,byPeelTier:t,byMode:i,speedBuckets:[{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0}],overclock:{safeLockWins:0,safeLockMisses:0,overclockWins:0,overclockMisses:0,max6xWins:0,backfires:0,consecutiveMax6xWins:0,bestConsecutiveMax6xWins:0,currentMatchMax6xWins:0,currentMatchPeelsUsed:0},feats:{passportStamped:!1,prologueCleared:!1,act1Cleared:!1,campaignCompleted:!1,rivalBluffsCaught:0,sorenCoinBluffDefeated:!1,bluffEchoCancels:0,uvScansCount:0,scannedRelicIds:[],openedLatchKeys:[],atelierFinishesEquipped:0,backstageInterrogations:0,factionPledged:!1,flawlessBossWins:0,unpeeledBossWins:0,perfectMatchesCount:0,max3x6xInSingleMatch:!1,calibratorBullseyes:0,codexFirstTryLocks:0,ghostTrialWins:0,blackSalonWins:0,dailyBroadcastsCompleted:0,completedDailyDates:[],maxEndlessDepth:0,achievedEndings:[],difficultyRoundsCleared:Me(),difficultyBestAccuracyPct:Me(),globeBullseyes300Km:0,globeNoPeel120Km:0,visualBlueprintsSolved:0,tier1ColdDomains:[],duelChallengesPlayed:0,duelGhostWins:0,srsReviewsCompleted:0,offlinePacksCached:0,clueLadderStep1Snipes:0,mindGambitsActivated:0,secondWindSaves:0,finaleCategoryWins:0,match4CleanSweeps:0,sort4PerfectRuns:0,imposterCatches:0,pinpointBullseyes:0,wedgesEarnedTotal:0,full6WedgeCrowns:0,padlocksShattered:0,powerPlayWins:0,powerPlayBigWagerWins:0,challengerTrapSurvivals:0,worldTourTiersCleared:0,worldSmartestChampionWon:!1},dailyBuckets:{},sessions:[],events:[]}}class Ga{state;listeners=new Set;constructor(e){this.state=this.load(),e&&this.syncAndBackfillFromProfile(e)}load(){const e=ae();try{if(typeof localStorage>"u")return e;const s=localStorage.getItem(Ae);if(!s)return e;const t=JSON.parse(s);if(!t||typeof t!="object")return e;const i=Array.isArray(t.byDomain)&&t.byDomain.length===12?t.byDomain.map(n=>({right:Math.max(0,Math.floor(Number(n?.right)||0)),wrong:Math.max(0,Math.floor(Number(n?.wrong)||0)),totalResponseMs:Math.max(0,Math.floor(Number(n?.totalResponseMs)||0)),peakElo:P(Math.round(Number(n?.peakElo)||1200),600,2600),lastElo:P(Math.round(Number(n?.lastElo)||1200),600,2600)})):e.byDomain,o={...e.byArchetype};if(t.byArchetype&&typeof t.byArchetype=="object")for(const n of je){const m=t.byArchetype[n];m&&(o[n]={right:Math.max(0,Math.floor(Number(m.right)||0)),wrong:Math.max(0,Math.floor(Number(m.wrong)||0))})}const l=be();if(t.byFormat&&typeof t.byFormat=="object")for(const n of Ne){const m=t.byFormat[n];m&&(l[n]={right:Math.max(0,Math.floor(Number(m.right)||0)),wrong:Math.max(0,Math.floor(Number(m.wrong)||0))})}const r={...e.byPeelTier};if(t.byPeelTier&&typeof t.byPeelTier=="object")for(const n of["1","2","3"]){const m=t.byPeelTier[n];m&&(r[n]={right:Math.max(0,Math.floor(Number(m.right)||0)),wrong:Math.max(0,Math.floor(Number(m.wrong)||0))})}const p={...e.byMode};if(t.byMode&&typeof t.byMode=="object")for(const n of Mt){const m=t.byMode[n];m&&(p[n]={right:Math.max(0,Math.floor(Number(m.right)||0)),wrong:Math.max(0,Math.floor(Number(m.wrong)||0)),matchesPlayed:Math.max(0,Math.floor(Number(m.matchesPlayed)||0)),matchesWon:Math.max(0,Math.floor(Number(m.matchesWon)||0)),bestScore:Math.max(0,Math.floor(Number(m.bestScore)||0))})}const d=e.speedBuckets.map((n,m)=>{const c=Array.isArray(t.speedBuckets)?t.speedBuckets[m]:null;return{right:Math.max(0,Math.floor(Number(c?.right)||n.right)),wrong:Math.max(0,Math.floor(Number(c?.wrong)||n.wrong))}});return{schemaVersion:1,backfilledFromLegacy:!!t.backfilledFromLegacy,totalRight:Math.max(0,Math.floor(Number(t.totalRight)||0)),totalWrong:Math.max(0,Math.floor(Number(t.totalWrong)||0)),totalResponseMs:Math.max(0,Math.floor(Number(t.totalResponseMs)||0)),totalPointsEarned:Math.max(0,Math.floor(Number(t.totalPointsEarned)||0)),currentStreak:Math.max(0,Math.floor(Number(t.currentStreak)||0)),bestStreak:Math.max(0,Math.floor(Number(t.bestStreak)||0)),fastUnder3sStreak:Math.max(0,Math.floor(Number(t.fastUnder3sStreak)||0)),bestFastUnder3sStreak:Math.max(0,Math.floor(Number(t.bestFastUnder3sStreak)||0)),globalEloLatest:P(Math.round(Number(t.globalEloLatest)||1200),600,2600),globalEloPeak:P(Math.round(Number(t.globalEloPeak)||1200),600,2600),uniqueSolvedQids:Array.isArray(t.uniqueSolvedQids)?t.uniqueSolvedQids.slice(-pt):[],uniqueSolvedCount:Math.max(0,Math.floor(Number(t.uniqueSolvedCount)||0)),byDomain:i,byArchetype:o,byFormat:l,byPeelTier:r,byMode:p,speedBuckets:d,overclock:{...e.overclock,...t.overclock??{}},feats:{...e.feats,...t.feats??{},scannedRelicIds:Array.isArray(t.feats?.scannedRelicIds)?t.feats.scannedRelicIds:[],openedLatchKeys:Array.isArray(t.feats?.openedLatchKeys)?t.feats.openedLatchKeys:[],achievedEndings:Array.isArray(t.feats?.achievedEndings)?t.feats.achievedEndings:[],completedDailyDates:Array.isArray(t.feats?.completedDailyDates)?t.feats.completedDailyDates.filter(n=>typeof n=="string").slice(-365):[],difficultyRoundsCleared:{...Me(),...t.feats?.difficultyRoundsCleared??{}},difficultyBestAccuracyPct:{...Me(),...t.feats?.difficultyBestAccuracyPct??{}},globeBullseyes300Km:Math.max(0,Math.floor(Number(t.feats?.globeBullseyes300Km)||0)),globeNoPeel120Km:Math.max(0,Math.floor(Number(t.feats?.globeNoPeel120Km)||0)),visualBlueprintsSolved:Math.max(0,Math.floor(Number(t.feats?.visualBlueprintsSolved)||0)),tier1ColdDomains:Array.isArray(t.feats?.tier1ColdDomains)?t.feats.tier1ColdDomains.map(n=>Math.floor(Number(n))).filter(n=>Number.isFinite(n)&&n>=0&&n<=11):[],duelChallengesPlayed:Math.max(0,Math.floor(Number(t.feats?.duelChallengesPlayed)||0)),duelGhostWins:Math.max(0,Math.floor(Number(t.feats?.duelGhostWins)||0)),srsReviewsCompleted:Math.max(0,Math.floor(Number(t.feats?.srsReviewsCompleted)||0)),offlinePacksCached:Math.max(0,Math.floor(Number(t.feats?.offlinePacksCached)||0)),clueLadderStep1Snipes:Math.max(0,Math.floor(Number(t.feats?.clueLadderStep1Snipes)||0)),mindGambitsActivated:Math.max(0,Math.floor(Number(t.feats?.mindGambitsActivated)||0)),secondWindSaves:Math.max(0,Math.floor(Number(t.feats?.secondWindSaves)||0)),finaleCategoryWins:Math.max(0,Math.floor(Number(t.feats?.finaleCategoryWins)||0)),match4CleanSweeps:Math.max(0,Math.floor(Number(t.feats?.match4CleanSweeps)||0)),sort4PerfectRuns:Math.max(0,Math.floor(Number(t.feats?.sort4PerfectRuns)||0)),imposterCatches:Math.max(0,Math.floor(Number(t.feats?.imposterCatches)||0)),pinpointBullseyes:Math.max(0,Math.floor(Number(t.feats?.pinpointBullseyes)||0)),wedgesEarnedTotal:Math.max(0,Math.floor(Number(t.feats?.wedgesEarnedTotal)||0)),full6WedgeCrowns:Math.max(0,Math.floor(Number(t.feats?.full6WedgeCrowns)||0)),padlocksShattered:Math.max(0,Math.floor(Number(t.feats?.padlocksShattered)||0)),powerPlayWins:Math.max(0,Math.floor(Number(t.feats?.powerPlayWins)||0)),powerPlayBigWagerWins:Math.max(0,Math.floor(Number(t.feats?.powerPlayBigWagerWins)||0)),challengerTrapSurvivals:Math.max(0,Math.floor(Number(t.feats?.challengerTrapSurvivals)||0)),worldTourTiersCleared:Math.max(0,Math.floor(Number(t.feats?.worldTourTiersCleared)||0)),worldSmartestChampionWon:!!t.feats?.worldSmartestChampionWon},dailyBuckets:t.dailyBuckets&&typeof t.dailyBuckets=="object"?t.dailyBuckets:{},sessions:Array.isArray(t.sessions)?t.sessions.slice(-Ke):[],events:Array.isArray(t.events)?t.events.slice(-qe).map(n=>Dt(n)):[]}}catch{return e}}save(){try{typeof localStorage<"u"&&localStorage.setItem(Ae,JSON.stringify(this.state))}catch{}const e=this.getSnapshot();for(const s of this.listeners)s(e)}subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}syncAndBackfillFromProfile(e){try{if(typeof localStorage<"u"){const l=localStorage.getItem(Ae);if(l){const r=JSON.parse(l);r&&Array.isArray(r.events)&&r.events.length>this.state.events.length&&(this.state=this.load())}}}catch{}const s=e.getSnapshot(),t=Q.getSkillSnapshot();let i=!1;(s.persona||s.hasCustomName)&&!this.state.feats.passportStamped&&s.persona&&(this.state.feats.passportStamped=!0,i=!0),s.visas.ch?.cleared&&!this.state.feats.prologueCleared&&(this.state.feats.prologueCleared=!0,i=!0),s.visas.gb?.cleared&&s.visas.jp?.cleared&&!this.state.feats.act1Cleared&&(this.state.feats.act1Cleared=!0,i=!0),s.visas.global?.cleared&&!this.state.feats.campaignCompleted&&(this.state.feats.campaignCompleted=!0,i=!0);for(const l of s.dailyHistory)l?.utcDate&&!this.state.feats.completedDailyDates.includes(l.utcDate)&&(this.state.feats.completedDailyDates.push(l.utcDate),i=!0);this.state.feats.completedDailyDates.length>365&&(this.state.feats.completedDailyDates=this.state.feats.completedDailyDates.slice(-365)),s.dailyHistory.length>this.state.feats.dailyBroadcastsCompleted&&(this.state.feats.dailyBroadcastsCompleted=s.dailyHistory.length,i=!0);for(let l=0;l<12;l++){const r=Math.max(s.domainElo[l]??1200,t.domainElo[l]??1200);r!==this.state.byDomain[l].lastElo&&(this.state.byDomain[l].lastElo=r,this.state.byDomain[l].peakElo=Math.max(this.state.byDomain[l].peakElo,r),i=!0)}t.globalElo>0&&t.totalAnswered>0&&(this.state.globalEloLatest=t.globalElo,this.state.globalEloPeak=Math.max(this.state.globalEloPeak,t.globalElo));const o=this.state.totalRight+this.state.totalWrong;if(!this.state.backfilledFromLegacy&&o===0&&t.totalAnswered>0){this.state.backfilledFromLegacy=!0,this.state.totalRight=Math.max(0,t.totalCorrect),this.state.totalWrong=Math.max(0,t.totalAnswered-t.totalCorrect),this.state.bestStreak=Math.max(this.state.bestStreak,t.bestStreak),this.state.currentStreak=t.currentStreak,this.state.uniqueSolvedCount=Math.max(this.state.uniqueSolvedCount,t.totalCorrect);for(let r=0;r<12;r++){const p=t.domainAttempts[r]??0,d=t.domainCorrect[r]??0;this.state.byDomain[r].right=d,this.state.byDomain[r].wrong=Math.max(0,p-d)}const l=oe(Date.now());this.state.dailyBuckets[l]={dateKey:l,right:this.state.totalRight,wrong:this.state.totalWrong,totalResponseMs:t.totalAnswered*5800,maxStreak:t.bestStreak,pointsEarned:this.state.totalRight*2400,max6xWins:0,backfires:0,eloEnd:t.globalElo},i=!0}i&&this.save()}getSnapshot(){return{...this.state,byDomain:this.state.byDomain.map(e=>({...e})),byArchetype:{SIGHTLINE_LOCK:{...this.state.byArchetype.SIGHTLINE_LOCK},CODEX_DUAL_RING:{...this.state.byArchetype.CODEX_DUAL_RING},CALIBRATOR_DIAL:{...this.state.byArchetype.CALIBRATOR_DIAL},GAUNTLET_SHATTER:{...this.state.byArchetype.GAUNTLET_SHATTER},HERO_ARTIFACT_SYNTHESIS:{...this.state.byArchetype.HERO_ARTIFACT_SYNTHESIS},GLOBE_PIN_DROP:{...this.state.byArchetype.GLOBE_PIN_DROP}},byFormat:{MULTIPLE_CHOICE:{...this.state.byFormat.MULTIPLE_CHOICE},MATCH_4:{...this.state.byFormat.MATCH_4},SORT_4:{...this.state.byFormat.SORT_4},MULTI_STRIKE:{...this.state.byFormat.MULTI_STRIKE},PINPOINT_DIAL:{...this.state.byFormat.PINPOINT_DIAL},CLUE_ESCALATOR:{...this.state.byFormat.CLUE_ESCALATOR},VISUAL_SPOTTER:{...this.state.byFormat.VISUAL_SPOTTER}},byPeelTier:{1:{...this.state.byPeelTier[1]},2:{...this.state.byPeelTier[2]},3:{...this.state.byPeelTier[3]}},byMode:{CAMPAIGN:{...this.state.byMode.CAMPAIGN},DAILY:{...this.state.byMode.DAILY},BRIEFING:{...this.state.byMode.BRIEFING},ENDLESS:{...this.state.byMode.ENDLESS},TRIALS:{...this.state.byMode.TRIALS},PROLOGUE:{...this.state.byMode.PROLOGUE}},speedBuckets:this.state.speedBuckets.map(e=>({...e})),overclock:{...this.state.overclock},feats:{...this.state.feats,scannedRelicIds:[...this.state.feats.scannedRelicIds],openedLatchKeys:[...this.state.feats.openedLatchKeys],achievedEndings:[...this.state.feats.achievedEndings],completedDailyDates:[...this.state.feats.completedDailyDates],difficultyRoundsCleared:{...this.state.feats.difficultyRoundsCleared},difficultyBestAccuracyPct:{...this.state.feats.difficultyBestAccuracyPct},tier1ColdDomains:[...this.state.feats.tier1ColdDomains]},dailyBuckets:{...this.state.dailyBuckets},sessions:[...this.state.sessions],events:[...this.state.events]}}recordQuestionOutcome(e){const s=e.ts??Date.now(),t=oe(s),i=P(Math.floor(Number(e.domainId)||0),0,11),o=We(e.mode),l=$t(e.archetype),r=Pe(e.questionFormat),p=r??Ce({questionFormat:r??void 0,archetype:l,clueLadderStep:e.clueLadderStep}),d=e.peelTier===2?2:e.peelTier===3?3:1,n=P(Number(e.overclockCharge01)||0,0,1),m=n>=.08,c=n>=.88&&d===1,u=!!e.backfired||!e.correct&&m,y=P(Math.round(Number(e.responseTimeMs)||5200),150,6e4),w=typeof e.speedBucketIdx=="number"&&Number.isInteger(e.speedBucketIdx)&&e.speedBucketIdx>=0&&e.speedBucketIdx<=4?e.speedBucketIdx:ge(y),g=Math.max(0,Math.round(Number(e.pointsDelta)||0)),v=Q.getSkillSnapshot(),f=P(Math.round(Number(e.eloAfter)||v.globalElo||this.state.globalEloLatest),600,2600),x=Ve(e.difficultyTier)??Ot(f),b=e.promptSnippet?.trim().slice(0,96),S=Qe(e.subcatLabel)??Xe(i,l,b),R=B(i),C=b||(e.answerLabel?`${S}: ${e.answerLabel.slice(0,44)}`:`${R.shortName} · ${S}`),k={ts:s,dateKey:t,qid:Math.max(0,Math.floor(Number(e.qid)||0)),domainId:i,mode:o,hubId:e.hubId??"ch",archetype:l,questionFormat:r??void 0,correct:!!e.correct,peelTier:d,overclockCharge01:Number(n.toFixed(2)),backfired:u,bluffCalled:!!e.bluffCalled,bullseye:!!(e.bullseye||e.isBullseyeOrSweep),responseTimeMs:y,pointsDelta:g,eloAfter:f,promptSnippet:C,answerLabel:e.answerLabel?.slice(0,48),subcatLabel:S,difficultyTier:x,speedBucketIdx:w,clueLadderStep:e.clueLadderStep===1||e.clueLadderStep===2||e.clueLadderStep===3?e.clueLadderStep:void 0,mindGambitId:e.mindGambitId?.trim()||void 0};this.state.events.push(k),this.state.events.length>qe&&this.state.events.splice(0,this.state.events.length-qe),this.state.totalResponseMs+=y,this.state.totalPointsEarned+=g,this.state.globalEloLatest=f,this.state.globalEloPeak=Math.max(this.state.globalEloPeak,f),d>1&&(this.state.overclock.currentMatchPeelsUsed+=1),e.bluffEchoCancelled&&(this.state.feats.bluffEchoCancels+=1),e.bluffCalled&&(this.state.feats.rivalBluffsCaught+=1),k.correct&&e.clueLadderStep===1&&(this.state.feats.clueLadderStep1Snipes+=1),e.mindGambitTriggered&&(this.state.feats.mindGambitsActivated+=1),k.correct&&e.finaleCategoryPicked&&(this.state.feats.finaleCategoryWins+=1),typeof e.padlocksBroken=="number"&&e.padlocksBroken>0&&(this.state.feats.padlocksShattered+=Math.floor(e.padlocksBroken)),k.correct&&e.survivedChallengerTrap&&(this.state.feats.challengerTrapSurvivals+=1),k.correct&&typeof e.powerPlayWager=="number"&&e.powerPlayWager>0&&(this.state.feats.powerPlayWins+=1,e.powerPlayWager>=400&&(this.state.feats.powerPlayBigWagerWins+=1));const I=this.state.byDomain[i];I.totalResponseMs+=y;const L=v.domainElo[i]??I.lastElo;I.lastElo=L,I.peakElo=Math.max(I.peakElo,L);const O=String(d);if(k.correct){if(this.state.totalRight+=1,this.state.currentStreak+=1,this.state.bestStreak=Math.max(this.state.bestStreak,this.state.currentStreak),y<3e3?(this.state.fastUnder3sStreak+=1,this.state.bestFastUnder3sStreak=Math.max(this.state.bestFastUnder3sStreak,this.state.fastUnder3sStreak)):this.state.fastUnder3sStreak=0,k.qid>0&&!this.state.uniqueSolvedQids.includes(k.qid)&&(this.state.uniqueSolvedQids.push(k.qid),this.state.uniqueSolvedQids.length>pt&&this.state.uniqueSolvedQids.shift(),this.state.uniqueSolvedCount+=1),I.right+=1,this.state.byArchetype[l].right+=1,this.state.byFormat[p].right+=1,this.state.byPeelTier[O].right+=1,this.state.byMode[o].right+=1,this.state.speedBuckets[w].right+=1,p==="MATCH_4"&&(k.bullseye||e.isBullseyeOrSweep)&&(this.state.feats.match4CleanSweeps+=1),p==="SORT_4"&&(k.bullseye||e.isBullseyeOrSweep)&&(this.state.feats.sort4PerfectRuns+=1),p==="MULTI_STRIKE"&&(this.state.feats.imposterCatches+=1),p==="PINPOINT_DIAL"&&(k.bullseye||e.isBullseyeOrSweep)&&(this.state.feats.pinpointBullseyes+=1),k.bullseye&&l==="CALIBRATOR_DIAL"&&(this.state.feats.calibratorBullseyes+=1),l==="GLOBE_PIN_DROP"){const W=typeof e.globeDistanceKm=="number"&&Number.isFinite(e.globeDistanceKm)?Math.max(0,e.globeDistanceKm):null;(k.bullseye||W!==null&&W<=300)&&(this.state.feats.globeBullseyes300Km+=1),d===1&&W!==null&&W<=120&&(this.state.feats.globeNoPeel120Km+=1)}e.hasVisualPlate&&(this.state.feats.visualBlueprintsSolved+=1),d===1&&!this.state.feats.tier1ColdDomains.includes(i)&&this.state.feats.tier1ColdDomains.push(i),l==="CODEX_DUAL_RING"&&(e.firstTryCodex??d===1)&&(this.state.feats.codexFirstTryLocks+=1),m?(this.state.overclock.overclockWins+=1,c&&(this.state.overclock.max6xWins+=1,this.state.overclock.consecutiveMax6xWins+=1,this.state.overclock.bestConsecutiveMax6xWins=Math.max(this.state.overclock.bestConsecutiveMax6xWins,this.state.overclock.consecutiveMax6xWins),this.state.overclock.currentMatchMax6xWins+=1,this.state.overclock.currentMatchMax6xWins>=3&&(this.state.feats.max3x6xInSingleMatch=!0))):this.state.overclock.safeLockWins+=1}else this.state.totalWrong+=1,this.state.currentStreak=0,this.state.fastUnder3sStreak=0,I.wrong+=1,this.state.byArchetype[l].wrong+=1,this.state.byFormat[p].wrong+=1,this.state.byPeelTier[O].wrong+=1,this.state.byMode[o].wrong+=1,this.state.speedBuckets[w].wrong+=1,m?(this.state.overclock.overclockMisses+=1,this.state.overclock.consecutiveMax6xWins=0):this.state.overclock.safeLockMisses+=1,u&&(this.state.overclock.backfires+=1,this.state.overclock.consecutiveMax6xWins=0);const $=this.state.dailyBuckets[t]??{dateKey:t,right:0,wrong:0,totalResponseMs:0,maxStreak:0,pointsEarned:0,max6xWins:0,backfires:0,eloEnd:f};k.correct?$.right+=1:$.wrong+=1,$.totalResponseMs+=y,$.maxStreak=Math.max($.maxStreak,this.state.currentStreak),$.pointsEarned+=g,k.correct&&c&&($.max6xWins+=1),u&&($.backfires+=1),$.eloEnd=f,this.state.dailyBuckets[t]=$;const X=Object.keys(this.state.dailyBuckets).sort();return X.length>365&&delete this.state.dailyBuckets[X[0]],this.save(),this.getSnapshot()}recordMatchCompleted(e){const s=Date.now(),t=oe(s),i=!!e.isBlackSalon||(e.mode??"").toUpperCase()==="BLACK_SALON",o=We(e.mode,i),l=Q.getSkillSnapshot(),r=P(Math.round(Number(e.eloAfter)||l.globalElo||this.state.globalEloLatest),600,2600),p=Math.max(0,Math.floor(Number(e.correctCount)||0)),d=Math.max(p,Math.floor(Number(e.totalQuestions)||p)),n=Math.max(0,d-p),m=e.peelsUsed!==void 0?e.peelsUsed:this.state.overclock.currentMatchPeelsUsed,c=e.max6xOverclockWinsInMatch!==void 0?e.max6xOverclockWinsInMatch:this.state.overclock.currentMatchMax6xWins,u=Math.max(0,Math.floor(Number(e.shieldsLost)||0)),y=this.state.byMode[o];if(y.matchesPlayed+=1,e.won&&(y.matchesWon+=1),y.bestScore=Math.max(y.bestScore,Math.round(e.score||0)),d>=5&&p===d&&(this.state.feats.perfectMatchesCount+=1),c>=3&&(this.state.feats.max3x6xInSingleMatch=!0),o==="PROLOGUE"&&e.won&&(this.state.feats.prologueCleared=!0),o==="DAILY"&&!e.isReplay){const g=e.utcDate&&e.utcDate.trim()||t;this.state.feats.completedDailyDates.includes(g)||(this.state.feats.completedDailyDates.push(g),this.state.feats.completedDailyDates.length>365&&this.state.feats.completedDailyDates.shift(),this.state.feats.dailyBroadcastsCompleted=Math.max(this.state.feats.dailyBroadcastsCompleted+1,this.state.feats.completedDailyDates.length))}o==="ENDLESS"&&e.endlessDepthReached&&(this.state.feats.maxEndlessDepth=Math.max(this.state.feats.maxEndlessDepth,Math.floor(e.endlessDepthReached))),o==="TRIALS"&&e.won&&(this.state.feats.ghostTrialWins+=1,i&&(this.state.feats.blackSalonWins+=1)),e.won&&e.isBossShowdown&&(u===0&&(this.state.feats.flawlessBossWins+=1),m===0&&(this.state.feats.unpeeledBossWins+=1)),e.won&&e.defeatedRivalId==="soren"&&e.sorenCoinTellCaughtInMatch&&(this.state.feats.sorenCoinBluffDefeated=!0),e.endingUnlocked&&!this.state.feats.achievedEndings.includes(e.endingUnlocked)&&(this.state.feats.achievedEndings.push(e.endingUnlocked),this.state.feats.campaignCompleted=!0);const w=Ve(e.difficultyPreset??e.difficultyTier);if(w&&d>0){const g=Math.round(p/d*100);this.state.feats.difficultyBestAccuracyPct[w]=Math.max(this.state.feats.difficultyBestAccuracyPct[w]??0,g),(w==="MIDDLE_SCHOOL"||e.won||g>=50)&&(this.state.feats.difficultyRoundsCleared[w]=(this.state.feats.difficultyRoundsCleared[w]??0)+1)}return e.mindGambitUsed&&(this.state.feats.mindGambitsActivated+=1),e.secondWindTriggered&&(this.state.feats.secondWindSaves+=1),e.finaleCategoryWon&&(this.state.feats.finaleCategoryWins+=1),typeof e.earnedWedgesCount=="number"&&e.earnedWedgesCount>0&&(this.state.feats.wedgesEarnedTotal+=Math.floor(e.earnedWedgesCount),e.earnedWedgesCount>=6&&(this.state.feats.full6WedgeCrowns+=1)),e.completedSixWedgeCrown&&!(e.earnedWedgesCount&&e.earnedWedgesCount>=6)&&(this.state.feats.full6WedgeCrowns+=1),typeof e.worldTourTierCleared=="number"&&e.worldTourTierCleared>0&&(this.state.feats.worldTourTiersCleared=Math.max(this.state.feats.worldTourTiersCleared,Math.min(8,Math.floor(e.worldTourTierCleared))),e.worldTourTierCleared>=8&&(this.state.feats.worldSmartestChampionWon=!0,this.state.feats.campaignCompleted=!0)),e.wonWorldSmartestFinale&&(this.state.feats.worldSmartestChampionWon=!0,this.state.feats.worldTourTiersCleared=8,this.state.feats.campaignCompleted=!0),this.state.sessions.push({ts:s,dateKey:t,mode:o,hubId:e.hubId,won:!!e.won,right:p,wrong:n,score:Math.max(0,Math.round(e.score||0)),eloAfter:r,maxOverclockWinsInMatch:c,peelsUsedInMatch:m,shieldsLostInMatch:u,isBossShowdown:!!e.isBossShowdown,isBlackSalon:i}),this.state.sessions.length>Ke&&this.state.sessions.splice(0,this.state.sessions.length-Ke),this.state.overclock.currentMatchMax6xWins=0,this.state.overclock.currentMatchPeelsUsed=0,this.save(),this.getSnapshot()}recordSpecialFeat(e,s){switch(e){case"PASSPORT_STAMPED":this.state.feats.passportStamped=!0;break;case"PROLOGUE_CLEARED":this.state.feats.prologueCleared=!0;break;case"RIVAL_BLUFF_CAUGHT":this.state.feats.rivalBluffsCaught+=1;break;case"SOREN_COIN_BLUFF_DEFEATED":this.state.feats.sorenCoinBluffDefeated=!0;break;case"BLUFF_ECHO_CANCEL":this.state.feats.bluffEchoCancels+=1;break;case"UV_RELIC_SCANNED":this.state.feats.uvScansCount+=1,s?.relicId&&!this.state.feats.scannedRelicIds.includes(s.relicId)&&this.state.feats.scannedRelicIds.push(s.relicId);break;case"RELIC_LATCH_OPENED":{const t=s?.relicId??"meridian_astrolabe",i=s?.latchCount??3;for(let o=0;o<i;o++){const l=`${t}:${o}`;this.state.feats.openedLatchKeys.includes(l)||this.state.feats.openedLatchKeys.push(l)}break}case"ATELIER_SKIN_EQUIPPED":this.state.feats.atelierFinishesEquipped+=1;break;case"BACKSTAGE_INTERROGATION":this.state.feats.backstageInterrogations+=1;break;case"FACTION_PLEDGED":this.state.feats.factionPledged=!0;break;case"ACT1_CLEARED":this.state.feats.act1Cleared=!0;break;case"CAMPAIGN_COMPLETED":this.state.feats.campaignCompleted=!0;break;case"ENDING_UNLOCKED":this.state.feats.campaignCompleted=!0,s?.endingId&&!this.state.feats.achievedEndings.includes(s.endingId)&&this.state.feats.achievedEndings.push(s.endingId);break;case"BLACK_SALON_VICTORY":this.state.feats.blackSalonWins+=1,this.state.feats.ghostTrialWins+=1;break;case"DUEL_CHALLENGE_PLAYED":this.state.feats.duelChallengesPlayed+=1;break;case"DUEL_GHOST_BEATEN":this.state.feats.duelChallengesPlayed+=1,this.state.feats.duelGhostWins+=1;break;case"SRS_REVIEW_COMPLETED":this.state.feats.srsReviewsCompleted+=1;break;case"OFFLINE_PACK_CACHED":this.state.feats.offlinePacksCached+=1;break;case"CLUE_LADDER_STEP1_SNIPE":this.state.feats.clueLadderStep1Snipes+=1;break;case"MIND_GAMBIT_USED":this.state.feats.mindGambitsActivated+=1;break;case"SECOND_WIND_SAVED":this.state.feats.secondWindSaves+=1,this.state.feats.mindGambitsActivated+=1;break;case"FINALE_CATEGORY_WIN":this.state.feats.finaleCategoryWins+=1;break;case"MATCH4_CLEAN_SWEEP":this.state.feats.match4CleanSweeps+=1;break;case"SORT4_PERFECT":this.state.feats.sort4PerfectRuns+=1;break;case"IMPOSTER_CAUGHT":this.state.feats.imposterCatches+=1;break;case"PINPOINT_BULLSEYE":this.state.feats.pinpointBullseyes+=1;break;case"WEDGE_EARNED":this.state.feats.wedgesEarnedTotal+=1;break;case"SIX_WEDGE_CROWN":this.state.feats.full6WedgeCrowns+=1,this.state.feats.wedgesEarnedTotal=Math.max(this.state.feats.wedgesEarnedTotal,6);break;case"PADLOCK_SHATTERED":this.state.feats.padlocksShattered+=1;break;case"POWER_PLAY_WIN":this.state.feats.powerPlayWins+=1;break;case"POWER_PLAY_HIGH_ROLLER":this.state.feats.powerPlayWins+=1,this.state.feats.powerPlayBigWagerWins+=1;break;case"CHALLENGER_TRAP_SURVIVED":this.state.feats.challengerTrapSurvivals+=1;break;case"WORLD_TOUR_TIER_CLEARED":s?.depth?this.state.feats.worldTourTiersCleared=Math.max(this.state.feats.worldTourTiersCleared,Math.min(8,Math.floor(s.depth))):this.state.feats.worldTourTiersCleared=Math.min(8,this.state.feats.worldTourTiersCleared+1);break;case"WORLD_SMARTEST_CHAMPION":this.state.feats.worldSmartestChampionWon=!0,this.state.feats.worldTourTiersCleared=8,this.state.feats.campaignCompleted=!0;break}return s?.depth&&e!=="WORLD_TOUR_TIER_CLEARED"&&(this.state.feats.maxEndlessDepth=Math.max(this.state.feats.maxEndlessDepth,Math.floor(s.depth))),this.save(),this.getSnapshot()}reloadFromStorage(){return this.state=this.load(),this.getSnapshot()}getPlayerStatProfileForHost(){return Pt(this.getSnapshot())}}function mt(){return{SIGHTLINE_LOCK:{right:0,wrong:0},CODEX_DUAL_RING:{right:0,wrong:0},CALIBRATOR_DIAL:{right:0,wrong:0},GAUNTLET_SHATTER:{right:0,wrong:0},HERO_ARTIFACT_SYNTHESIS:{right:0,wrong:0},GLOBE_PIN_DROP:{right:0,wrong:0}}}function ft(){return{1:{right:0,wrong:0},2:{right:0,wrong:0},3:{right:0,wrong:0}}}function gt(){return[{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0},{right:0,wrong:0}]}function Ua(a){return Array.from({length:12},(e,s)=>({right:0,wrong:0,totalResponseMs:0,peakElo:a.byDomain[s]?.peakElo??1200,lastElo:a.byDomain[s]?.lastElo??1200}))}function qa(a,e,s){let t=0,i=0,o=0,l=0,r=0,p=0,d=a.length>0?0:s,n=e,m=0,c=0,u=0,y=0,w=0,g=0,v=0,f=0,x=0;for(const I of a){o+=I.responseTimeMs,l+=I.pointsDelta,n=I.eloAfter,d=Math.max(d,I.eloAfter);const L=Le(I),O=I.overclockCharge01>=.88&&I.peelTier===1;L&&(m+=1),I.correct?(t+=1,r+=1,p=Math.max(p,r),L?(c+=1,O&&(g+=1,f+=1,x=Math.max(x,f))):y+=1):(i+=1,r=0,L?(u+=1,f=0):w+=1,I.backfired&&(v+=1,f=0))}const b=t+i,S=b>0?Number((t/b*100).toFixed(1)):null,R=b>0?Math.round(o/b):0,C=c+u,k=C>0?Math.round(c/C*100):null;return{totalRight:t,totalWrong:i,totalAnswered:b,accuracyPct:S,avgResponseMs:R,totalPointsEarned:l,currentStreak:r,bestStreak:p,eloLatest:n,eloPeak:a.length>0?d:s,doubleDownCount:m,doubleDownWins:c,doubleDownMisses:u,doubleDownWinPct:k,safeLockWins:y,safeLockMisses:w,max6xWins:g,backfires:v,bestConsecutiveMax6xWins:x}}function Ka(a,e,s){if(a.length===0)return[];if(e==="LAST_25"){let p=0,d=0;return a.map(({ev:n,eventKey:m},c)=>{d+=1,n.correct&&(p+=1);const u=B(n.domainId);return{bucketKey:m,label:`Q${c+1}`,sublabel:`${u.shortName} · ${(n.responseTimeMs/1e3).toFixed(1)}s · ${n.correct?`+${n.pointsDelta.toLocaleString("en-US")} PTS`:"MISS"}`,right:n.correct?1:0,wrong:n.correct?0:1,rollingAccPct:Math.round(p/d*100),isSelected:s===m}})}const t=new Map;for(const{ev:p}of a){const d=p.dateKey,n=t.get(d)??{right:0,wrong:0,points:0};p.correct?n.right+=1:n.wrong+=1,n.points+=p.pointsDelta,t.set(d,n)}const i=e==="DAYS_7"?7:e==="DAYS_30"?30:365,o=Array.from(t.keys()).sort().slice(-i);let l=0,r=0;return o.map(p=>{const d=t.get(p);l+=d.right,r+=d.right+d.wrong;const n=d.right+d.wrong,m=n>0?Math.round(d.right/n*100):0;return{bucketKey:p,label:p.slice(5),sublabel:`${p}: ${d.right} Right · ${d.wrong} Wrong (${m}%) · +${d.points.toLocaleString("en-US")} PTS`,right:d.right,wrong:d.wrong,rollingAccPct:r>0?Math.round(l/r*100):m,isSelected:s===p}})}function za(a){if(a.length===0)return[];if(a.length===1){const o=a[0];return[{label:"Base",elo:1200},{label:"Q1",elo:o.eloAfter,ts:o.ts,correct:o.correct}]}const s=Math.max(1,Math.floor(a.length/28)),t=[];for(let o=0;o<a.length;o+=s){const l=a[o];t.push({label:`Q${o+1}`,elo:l.eloAfter,ts:l.ts,correct:l.correct})}const i=a[a.length-1];return(t[t.length-1]?.ts!==i.ts||t[t.length-1]?.elo!==i.eloAfter)&&t.push({label:"Now",elo:i.eloAfter,ts:i.ts,correct:i.correct}),t}function Nt(a){const e=be();let s=!1;if(a?.byFormat&&typeof a.byFormat=="object")for(const t of Ne){const i=a.byFormat[t];i&&(i.right>0||i.wrong>0)&&(e[t]={right:Math.max(0,i.right),wrong:Math.max(0,i.wrong)},s=!0)}if(!s&&a?.byArchetype){const t=(i,o)=>{o&&(e[i].right+=Math.max(0,o.right||0),e[i].wrong+=Math.max(0,o.wrong||0))};t("MULTIPLE_CHOICE",a.byArchetype.SIGHTLINE_LOCK),t("MATCH_4",a.byArchetype.CODEX_DUAL_RING),t("PINPOINT_DIAL",a.byArchetype.CALIBRATOR_DIAL),t("MULTI_STRIKE",a.byArchetype.GAUNTLET_SHATTER),t("CLUE_ESCALATOR",a.byArchetype.HERO_ARTIFACT_SYNTHESIS),t("VISUAL_SPOTTER",a.byArchetype.GLOBE_PIN_DROP)}return e}function Wa(a,e={},s=Date.now()){const t={range:e.range??"ALL_TIME",domainId:e.domainId!==void 0&&e.domainId!==null&&Number.isFinite(Number(e.domainId))?P(Math.floor(Number(e.domainId)),0,11):null,subcatLabel:Qe(e.subcatLabel??void 0),archetype:e.archetype&&je.includes(e.archetype)?e.archetype:null,questionFormat:Pe(e.questionFormat),peelTier:e.peelTier===1||e.peelTier===2||e.peelTier===3?e.peelTier:null,outcome:e.outcome==="RIGHT"||e.outcome==="WRONG"||e.outcome==="DOUBLE_DOWN"?e.outcome:"ALL",speedBucket:e.speedBucket!==void 0&&e.speedBucket!==null&&Number.isInteger(e.speedBucket)&&e.speedBucket>=0&&e.speedBucket<=4?e.speedBucket:null,bucketKey:typeof e.bucketKey=="string"&&e.bucketKey.trim().length>0?e.bucketKey.trim():null};t.domainId===null&&(t.subcatLabel=null);const i=(t.domainId!==null?1:0)+(t.subcatLabel!==null?1:0)+(t.archetype!==null?1:0)+(t.questionFormat!==null&&t.questionFormat!==void 0?1:0)+(t.peelTier!==null?1:0)+(t.outcome!=="ALL"?1:0)+(t.speedBucket!==null?1:0)+(t.bucketKey!==null?1:0),o=i>0,l=(a.events??[]).map((E,A)=>{const _=Dt(E);return{ev:_,eventKey:`ev:${_.ts}:${_.qid}:${A}`}});if(l.length===0&&a.totalRight+a.totalWrong>0){const E=a.totalRight+a.totalWrong;if(!o){const A=[],_=t.range==="DAYS_7"?7:t.range==="DAYS_30"?30:365,D=Object.keys(a.dailyBuckets).sort().slice(-_);if(D.length>0&&t.range!=="LAST_25"){let q=0,Be=0;for(const xe of D){const K=a.dailyBuckets[xe];q+=K.right,Be+=K.right+K.wrong;const et=K.right+K.wrong,tt=et>0?Math.round(K.right/et*100):0;A.push({bucketKey:xe,label:xe.slice(5),sublabel:`${xe}: ${K.right} Right · ${K.wrong} Wrong (${tt}%)`,right:K.right,wrong:K.wrong,rollingAccPct:Be>0?Math.round(q/Be*100):tt,isSelected:!1})}}else A.push({bucketKey:"legacy_career",label:"Career",sublabel:`${a.totalRight}R / ${a.totalWrong}W`,right:a.totalRight,wrong:a.totalWrong,rollingAccPct:Math.round(a.totalRight/E*100),isSelected:!1});const V=[{label:"Start",elo:1200}];if(a.sessions.length>0)for(const q of a.sessions.slice(-24))V.push({label:q.mode.slice(0,4),elo:q.eloAfter,ts:q.ts});else V.push({label:"Now",elo:a.globalEloLatest});const Y=a.overclock.overclockWins+a.overclock.overclockMisses;return{filter:t,hasActiveDimensionFilter:!1,activeFilterCount:0,rangeTotalCount:E,filteredEvents:[],kpis:{totalRight:a.totalRight,totalWrong:a.totalWrong,totalAnswered:E,accuracyPct:Number((a.totalRight/E*100).toFixed(1)),avgResponseMs:Math.round(a.totalResponseMs/E),totalPointsEarned:a.totalPointsEarned,currentStreak:a.currentStreak,bestStreak:a.bestStreak,eloLatest:a.globalEloLatest,eloPeak:a.globalEloPeak,doubleDownCount:Y,doubleDownWins:a.overclock.overclockWins,doubleDownMisses:a.overclock.overclockMisses,doubleDownWinPct:Y>0?Math.round(a.overclock.overclockWins/Y*100):null,safeLockWins:a.overclock.safeLockWins,safeLockMisses:a.overclock.safeLockMisses,max6xWins:a.overclock.max6xWins,backfires:a.overclock.backfires,bestConsecutiveMax6xWins:a.overclock.bestConsecutiveMax6xWins},barSeries:A,byDomain:a.byDomain.map(q=>({...q})),subcategories:[],eloSeries:V,byArchetype:{SIGHTLINE_LOCK:{...a.byArchetype.SIGHTLINE_LOCK},CODEX_DUAL_RING:{...a.byArchetype.CODEX_DUAL_RING},CALIBRATOR_DIAL:{...a.byArchetype.CALIBRATOR_DIAL},GAUNTLET_SHATTER:{...a.byArchetype.GAUNTLET_SHATTER},HERO_ARTIFACT_SYNTHESIS:{...a.byArchetype.HERO_ARTIFACT_SYNTHESIS},GLOBE_PIN_DROP:{...a.byArchetype.GLOBE_PIN_DROP}},byFormat:Nt(a),byPeelTier:{1:{...a.byPeelTier[1]},2:{...a.byPeelTier[2]},3:{...a.byPeelTier[3]}},speedBuckets:a.speedBuckets.map(q=>({...q})),outcomeCounts:{all:E,right:a.totalRight,wrong:a.totalWrong,doubleDown:Y},ledgerEvents:[],usingLegacyAggregateFallback:!0}}if(t.domainId!==null&&t.subcatLabel===null&&t.archetype===null&&!t.questionFormat&&t.peelTier===null&&t.outcome==="ALL"&&t.speedBucket===null&&t.bucketKey===null){const A=a.byDomain[t.domainId],_=A.right+A.wrong,D=B(t.domainId);return{filter:t,hasActiveDimensionFilter:!0,activeFilterCount:1,rangeTotalCount:E,filteredEvents:[],kpis:{totalRight:A.right,totalWrong:A.wrong,totalAnswered:_,accuracyPct:_>0?Number((A.right/_*100).toFixed(1)):null,avgResponseMs:_>0?Math.round(A.totalResponseMs/_):0,totalPointsEarned:0,currentStreak:0,bestStreak:0,eloLatest:A.lastElo,eloPeak:A.peakElo,doubleDownCount:0,doubleDownWins:0,doubleDownMisses:0,doubleDownWinPct:null,safeLockWins:0,safeLockMisses:0,max6xWins:0,backfires:0,bestConsecutiveMax6xWins:0},barSeries:_>0?[{bucketKey:`dom_${t.domainId}`,label:D.shortName,sublabel:`${D.name}: ${A.right}R · ${A.wrong}W`,right:A.right,wrong:A.wrong,rollingAccPct:Math.round(A.right/_*100),isSelected:!1}]:[],byDomain:a.byDomain.map(V=>({...V})),subcategories:[],eloSeries:[{label:"Base",elo:1200},{label:D.shortName,elo:A.lastElo}],byArchetype:mt(),byFormat:be(),byPeelTier:ft(),speedBuckets:gt(),outcomeCounts:{all:_,right:A.right,wrong:A.wrong,doubleDown:0},ledgerEvents:[],usingLegacyAggregateFallback:!0}}}let r;if(t.range==="LAST_25")r=l.slice(-25);else if(t.range==="DAYS_7"){const E=oe(s-5184e5);r=l.filter(A=>A.ev.dateKey>=E)}else if(t.range==="DAYS_30"){const E=oe(s-25056e5);r=l.filter(A=>A.ev.dateKey>=E)}else r=l;const p=t.subcatLabel?t.subcatLabel.toLowerCase():null,d=(E,A)=>{const{ev:_,eventKey:D}=E;if(A!=="domain"&&t.domainId!==null&&_.domainId!==t.domainId||A!=="domain"&&A!=="subcat"&&p!==null&&(_.subcatLabel??"").toLowerCase()!==p||A!=="archetype"&&t.archetype!==null&&_.archetype!==t.archetype||A!=="questionFormat"&&t.questionFormat&&Ce(_)!==t.questionFormat||A!=="peelTier"&&t.peelTier!==null&&_.peelTier!==t.peelTier||A!=="outcome"&&t.outcome!=="ALL"&&(t.outcome==="RIGHT"&&!_.correct||t.outcome==="WRONG"&&_.correct||t.outcome==="DOUBLE_DOWN"&&!Le(_))||A!=="speedBucket"&&t.speedBucket!==null&&(_.speedBucketIdx??ge(_.responseTimeMs))!==t.speedBucket)return!1;if(A!=="bucketKey"&&t.bucketKey!==null){if(t.range==="LAST_25"){if(D!==t.bucketKey)return!1}else if(_.dateKey!==t.bucketKey)return!1}return!0},n=r.filter(E=>d(E)),m=n.map(E=>E.ev),c=t.domainId!==null?a.byDomain[t.domainId]?.lastElo??a.globalEloLatest:a.globalEloLatest,u=t.domainId!==null?a.byDomain[t.domainId]?.peakElo??a.globalEloPeak:a.globalEloPeak,y=qa(m,c,u),w=t.bucketKey===null?n:r.filter(E=>d(E,"bucketKey")),g=Ka(w,t.range,t.bucketKey),v=Ua(a),f=t.domainId===null?n:r.filter(E=>d(E,"domain"));for(const{ev:E}of f){const A=v[E.domainId];E.correct?A.right+=1:A.wrong+=1,A.totalResponseMs+=E.responseTimeMs}const x=[];if(t.domainId!==null){const E=t.subcatLabel===null?n:r.filter(_=>d(_,"subcat")),A=new Map;for(const{ev:_}of E){const D=_.subcatLabel??Xe(_.domainId,_.archetype,_.promptSnippet),V=D.toLowerCase(),Y=A.get(V)??{label:D,right:0,wrong:0,totalMs:0};_.correct?Y.right+=1:Y.wrong+=1,Y.totalMs+=_.responseTimeMs,A.set(V,Y)}for(const _ of A.values()){const D=_.right+_.wrong;x.push({subcatLabel:_.label,right:_.right,wrong:_.wrong,total:D,accuracyPct:D>0?Math.round(_.right/D*100):0,avgResponseMs:D>0?Math.round(_.totalMs/D):0})}x.sort((_,D)=>D.total-_.total||_.subcatLabel.localeCompare(D.subcatLabel))}const b=za(m),S=mt(),R=t.archetype===null?n:r.filter(E=>d(E,"archetype"));for(const{ev:E}of R)E.correct?S[E.archetype].right+=1:S[E.archetype].wrong+=1;const C=be(),k=t.questionFormat?r.filter(E=>d(E,"questionFormat")):n;for(const{ev:E}of k){const A=Ce(E);E.correct?C[A].right+=1:C[A].wrong+=1}const I=ft(),L=t.peelTier===null?n:r.filter(E=>d(E,"peelTier"));for(const{ev:E}of L){const A=String(E.peelTier);E.correct?I[A].right+=1:I[A].wrong+=1}const O=gt(),$=t.speedBucket===null?n:r.filter(E=>d(E,"speedBucket"));for(const{ev:E}of $){const A=E.speedBucketIdx??ge(E.responseTimeMs);E.correct?O[A].right+=1:O[A].wrong+=1}const X=t.outcome==="ALL"?n:r.filter(E=>d(E,"outcome"));let W=0,we=0,Ze=0;for(const{ev:E}of X)E.correct?W+=1:we+=1,Le(E)&&(Ze+=1);return{filter:t,hasActiveDimensionFilter:o,activeFilterCount:i,rangeTotalCount:r.length,filteredEvents:m,kpis:y,barSeries:g,byDomain:v,subcategories:x,eloSeries:b,byArchetype:S,byFormat:C,byPeelTier:I,speedBuckets:O,outcomeCounts:{all:X.length,right:W,wrong:we,doubleDown:Ze},ledgerEvents:[...m].reverse(),usingLegacyAggregateFallback:!1}}function Va(){try{if(typeof localStorage>"u")return ae();const a=localStorage.getItem(Ae);if(!a)return ae();const e=JSON.parse(a);if(!e||typeof e!="object")return ae();const s=ae(),t=Array.isArray(e.byDomain)&&e.byDomain.length===12?e.byDomain.map(i=>({right:Math.max(0,Math.floor(Number(i?.right)||0)),wrong:Math.max(0,Math.floor(Number(i?.wrong)||0)),totalResponseMs:Math.max(0,Math.floor(Number(i?.totalResponseMs)||0)),peakElo:P(Math.round(Number(i?.peakElo)||1200),600,2600),lastElo:P(Math.round(Number(i?.lastElo)||1200),600,2600)})):s.byDomain;return{...s,totalRight:Math.max(0,Math.floor(Number(e.totalRight)||0)),totalWrong:Math.max(0,Math.floor(Number(e.totalWrong)||0)),bestStreak:Math.max(0,Math.floor(Number(e.bestStreak)||0)),byDomain:t,byFormat:Nt(e)}}catch{return ae()}}function Pt(a){const e=a??Va(),s=Array.isArray(e.byDomain)?e.byDomain:[];let t=0,i=0;const o=[];for(let b=0;b<12;b++){const S=s[b],R=Math.max(0,Math.floor(Number(S?.right)||0)),C=Math.max(0,Math.floor(Number(S?.wrong)||0)),k=R+C;if(t+=R,i+=C,k>0){const I=b,L=B(I),O=R/k;o.push({domainId:I,name:L.name,right:R,wrong:C,attempts:k,accRatio:O,accPct:Math.round(O*100),lastElo:Math.round(Number(S?.lastElo)||1200)})}}const l=Math.max(0,Math.floor(Number(e.totalRight)||0)),r=Math.max(0,Math.floor(Number(e.totalWrong)||0)),p=l+r>0?l:t,d=l+r>0?r:i,n=p+d,m=n>0?Math.round(p/n*100):0,c=Math.max(0,Math.floor(Number(e.bestStreak)||0));if(o.length===0)return{totalAnswered:n,overallAccuracyPct:m,bestStreak:c,strongestDomainId:null,strongestDomainName:null,strongestAccuracyPct:0,weakestDomainId:null,weakestDomainName:null,weakestAccuracyPct:0,mostPlayedDomainId:null,mostPlayedDomainName:null};const u=[...o].sort((b,S)=>S.attempts-b.attempts||S.right-b.right||b.domainId-S.domainId)[0];if(o.length===1){const b=o[0],S=b.accPct>=50;return{totalAnswered:n,overallAccuracyPct:m,bestStreak:c,strongestDomainId:S?b.domainId:null,strongestDomainName:S?b.name:null,strongestAccuracyPct:S?b.accPct:0,weakestDomainId:S?null:b.domainId,weakestDomainName:S?null:b.name,weakestAccuracyPct:S?0:b.accPct,mostPlayedDomainId:u.domainId,mostPlayedDomainName:u.name}}const y=o.filter(b=>b.attempts>=2),g=[...y.length>0?y:o].sort((b,S)=>S.accRatio-b.accRatio||S.attempts-b.attempts||S.lastElo-b.lastElo||b.domainId-S.domainId)[0],v=y.filter(b=>b.domainId!==g.domainId),x=[...v.length>0?v:o.filter(b=>b.domainId!==g.domainId)].sort((b,S)=>b.accRatio-S.accRatio||S.wrong-b.wrong||S.attempts-b.attempts||b.lastElo-S.lastElo||b.domainId-S.domainId)[0];return{totalAnswered:n,overallAccuracyPct:m,bestStreak:c,strongestDomainId:g.domainId,strongestDomainName:g.name,strongestAccuracyPct:g.accPct,weakestDomainId:x.domainId,weakestDomainName:x.name,weakestAccuracyPct:x.accPct,mostPlayedDomainId:u.domainId,mostPlayedDomainName:u.name}}const Ie={SIGHTLINE_LOCK:"Classic 4-Choice",CODEX_DUAL_RING:"Dual-Ring Match",CALIBRATOR_DIAL:"Calibrator Dial",GAUNTLET_SHATTER:"Rapid Shatter",HERO_ARTIFACT_SYNTHESIS:"Finale Chain",GLOBE_PIN_DROP:"Globe Pin-Drop"},_e={MULTIPLE_CHOICE:"4-Choice",MATCH_4:"Match-4",SORT_4:"Sort-4",MULTI_STRIKE:"Multi-Strike",PINPOINT_DIAL:"Pinpoint",CLUE_ESCALATOR:"3-Clue",VISUAL_SPOTTER:"Visual"},pe={1:"No Hint (3x)",2:"Hint (2x)",3:"50/50 (1x)"},Ya={1:"No Hint",2:"Hint",3:"50/50"},Bt={ALL:"All Answers",RIGHT:"Right Only",WRONG:"Wrong Only",DOUBLE_DOWN:"2x Double Down"};function Ee(a,e){const s=a+e;return s<=0?"—":`${(a/s*100).toFixed(1)}%`}function bt(a){if(a==null)return null;const e=Math.floor(Number(a));return!Number.isFinite(e)||e<0||e>11?null:e}function ja(a){return a.domainId!==null?"DOMAINS_POLYMATH":a.speedBucket!==null?"STREAK_SPEED":a.archetype!==null||a.questionFormat||a.peelTier!==null||a.outcome==="DOUBLE_DOWN"?"PRISM_OVERCLOCK":"ALL"}function yt(a){const e=[];return a.domainId!==null&&e.push(B(a.domainId).name),a.subcatLabel&&e.push(a.subcatLabel),a.questionFormat&&e.push(_e[a.questionFormat]),a.archetype&&e.push(Ie[a.archetype]),a.peelTier!==null&&e.push(pe[String(a.peelTier)]),a.outcome!=="ALL"&&e.push(Bt[a.outcome]),a.speedBucket!==null&&e.push(Te[a.speedBucket]),e.length>0?e.join(" · "):null}function Qa(a,e){if(a.length===0)return`
      <svg viewBox="0 0 560 192" style="width:100%;height:auto;display:block;">
        <rect x="36" y="18" width="488" height="146" rx="8" fill="rgba(12,17,28,0.65)" stroke="rgba(216,175,87,0.2)" stroke-dasharray="4 4"/>
        <text x="${560/2}" y="${192/2-7}" text-anchor="middle" fill="#b8b2a6" font-size="11.5" font-family="Inter,sans-serif">
          <tspan x="${560/2}" dy="0">No questions match this active filter slice</tspan>
          <tspan x="${560/2}" dy="17">Adjust filters or reset to inspect all history</tspan>
        </text>
      </svg>
    `;const n=Math.max(1,...a.map(v=>v.right+v.wrong)),m=488/a.length,c=Math.max(6,Math.min(28,m*.66)),u=[0,.5,1].map(v=>{const f=18+(1-v)*146,x=`${Math.round(v*100)}%`,b=Math.round(v*n);return`
        <line x1="36" y1="${f.toFixed(1)}" x2="524" y2="${f.toFixed(1)}" stroke="rgba(216,175,87,0.15)" stroke-dasharray="3 3"/>
        <text x="31" y="${(f+3).toFixed(1)}" text-anchor="end" fill="#a5afc2" font-size="9.5" font-family="JetBrains Mono,monospace">${b}</text>
        <text x="529" y="${(f+3).toFixed(1)}" text-anchor="start" fill="#f2cf7e" font-size="9.5" font-family="JetBrains Mono,monospace">${x}</text>
      `}).join(""),y=[],w=[],g=[];return a.forEach((v,f)=>{const x=36+m*(f+.5),b=v.right/n*146,S=v.wrong/n*146,R=164-b,C=R-S,k=v.isSelected||e===v.bucketKey,I=e!==null&&!k;y.push(`
      <g
        data-g1-idx="${f}"
        data-g1-bucket="${h(v.bucketKey)}"
        data-g1-right="${v.right}"
        data-g1-wrong="${v.wrong}"
        role="button"
        tabindex="0"
        aria-label="${h(`${v.label}: ${v.right} right, ${v.wrong} wrong`)}"
        style="cursor:pointer;opacity:${I?"0.32":"1"};"
      >
        <rect x="${(x-m*.48).toFixed(1)}" y="18" width="${(m*.96).toFixed(1)}" height="164" fill="${k?"rgba(242,207,126,0.15)":"transparent"}" rx="3"/>
        ${b>0?`<rect x="${(x-c/2).toFixed(1)}" y="${R.toFixed(1)}" width="${c.toFixed(1)}" height="${Math.max(2,b).toFixed(1)}" fill="#39d49a" rx="2"/>`:""}
        ${S>0?`<rect x="${(x-c/2).toFixed(1)}" y="${C.toFixed(1)}" width="${c.toFixed(1)}" height="${Math.max(2,S).toFixed(1)}" fill="#e05263" rx="2"/>`:""}
        ${k?`<line x1="${x.toFixed(1)}" y1="18" x2="${x.toFixed(1)}" y2="164" stroke="#f2cf7e" stroke-width="1.2" stroke-dasharray="2 2"/>`:""}
      </g>
    `);const L=18+(1-v.rollingAccPct/100)*146;w.push(`${x.toFixed(1)},${L.toFixed(1)}`),g.push(`<circle data-g1-idx="${f}" data-g1-bucket="${h(v.bucketKey)}" cx="${x.toFixed(1)}" cy="${L.toFixed(1)}" r="${k?"5.2":"3.2"}" fill="#f2cf7e" stroke="#080b11" stroke-width="1.3" style="cursor:pointer;opacity:${I?"0.4":"1"};"/>`),(a.length<=12||f===0||f===a.length-1||f%Math.ceil(a.length/8)===0)&&y.push(`<text data-g1-idx="${f}" data-g1-bucket="${h(v.bucketKey)}" x="${x.toFixed(1)}" y="184" text-anchor="middle" fill="${k?"#f2cf7e":"#b8b2a6"}" font-size="9" font-weight="${k?"800":"500"}" font-family="JetBrains Mono,monospace" style="cursor:pointer;">${h(v.label)}</text>`)}),`
    <svg viewBox="0 0 560 192" style="width:100%;height:auto;display:block;">
      ${u}
      ${y.join("")}
      <polyline points="${w.join(" ")}" fill="none" stroke="#f2cf7e" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" pointer-events="none"/>
      ${g.join("")}
    </svg>
  `}function Xa(a,e){const l=[.33,.66,1].map(w=>{const g=[];for(let v=0;v<12;v++){const f=Math.PI*2*v/12-Math.PI/2;g.push(`${(155+Math.cos(f)*86*w).toFixed(1)},${(135+Math.sin(f)*86*w).toFixed(1)}`)}return`<polygon points="${g.join(" ")}" fill="none" stroke="rgba(216,175,87,0.2)" stroke-width="1"/>`}).join(""),r=[],p=[],d=[],n=[],m=Math.max(1,...a.byDomain.map(w=>w.right+w.wrong)),c=a.filter.outcome==="WRONG";for(let w=0;w<12;w++){const g=Math.PI*2*w/12-Math.PI/2,v=Math.cos(g),f=Math.sin(g),x=a.byDomain[w],b=x.right+x.wrong;let S;if(c)S=b>0?Math.max(.22,b/m):.1;else if(b>0){const W=Math.max(.18,x.right/b),we=Math.max(.2,Math.min(1,(x.lastElo-750)/1350));S=W*.72+we*.28}else S=a.hasActiveDimensionFilter?.12:Math.max(.18,Math.min(.85,(x.lastElo-750)/1350));const R=155+v*86*S,C=135+f*86*S;r.push(`${R.toFixed(1)},${C.toFixed(1)}`);const k=e===w,I=155+v*86,L=135+f*86;p.push(`
      <g data-g2-dom="${w}" data-radar-spoke="${w}" role="button" tabindex="0" aria-label="Filter by ${h(U[w].name)}" style="cursor:pointer;">
        <line x1="155" y1="135" x2="${I.toFixed(1)}" y2="${L.toFixed(1)}" stroke="transparent" stroke-width="14"/>
        <line x1="155" y1="135" x2="${I.toFixed(1)}" y2="${L.toFixed(1)}" stroke="${k?"#f2cf7e":"rgba(216,175,87,0.18)"}" stroke-width="${k?"2.2":"1"}"/>
      </g>
    `),d.push(`
      <g data-g2-dom="${w}" style="cursor:pointer;">
        <circle cx="${R.toFixed(1)}" cy="${C.toFixed(1)}" r="12" fill="transparent"/>
        <circle cx="${R.toFixed(1)}" cy="${C.toFixed(1)}" r="${k?"5.4":b>0?"3.3":"2.1"}" fill="${k?"#f2cf7e":c?"#ff7c8c":"#39d49a"}" stroke="#080b11" stroke-width="1.3"/>
      </g>
    `);const O=155+v*101,$=135+f*100,X=v<-.25?"end":v>.25?"start":"middle";n.push(`<text data-g2-dom="${w}" x="${O.toFixed(1)}" y="${($+3).toFixed(1)}" text-anchor="${X}" fill="${k?"#f2cf7e":b>0?"#ebe5d8":"#8f99ad"}" font-size="${k?"9.6":"8.8"}" font-weight="${k?"800":"600"}" style="cursor:pointer;">${h(U[w].shortName)}</text>`)}const u=c?"#e05263":"#39d49a",y=c?"rgba(224,82,99,0.22)":"rgba(57,212,154,0.22)";return`
    <svg viewBox="0 0 310 270" style="width:100%;max-width:295px;height:auto;display:block;margin:0 auto;">
      ${l}
      ${p.join("")}
      <polygon points="${r.join(" ")}" fill="${y}" stroke="${u}" stroke-width="2" pointer-events="none"/>
      ${d.join("")}
      ${n.join("")}
    </svg>
  `}function Ja(a){if(a.length===0)return`
      <svg viewBox="0 0 520 156" style="width:100%;height:auto;display:block;">
        <rect x="42" y="18" width="436" height="120" rx="8" fill="rgba(12,17,28,0.65)" stroke="rgba(86,212,245,0.2)" stroke-dasharray="4 4"/>
        <text x="${520/2}" y="${156/2+4}" text-anchor="middle" fill="#b8b2a6" font-size="11" font-family="Inter,sans-serif">
          No ELO trajectory points in this active slice
        </text>
      </svg>
    `;const r=Math.min(1e3,...a.map(u=>u.elo))-40,p=Math.max(1500,...a.map(u=>u.elo))+40,d=Math.max(100,p-r),n=a.map((u,y)=>{const w=a.length===1?260:42+y/(a.length-1)*436,g=18+(1-(u.elo-r)/d)*120;return{x:w,y:g,elo:u.elo,label:u.label}}),m=n.map(u=>`${u.x.toFixed(1)},${u.y.toFixed(1)}`).join(" "),c=`${n[0].x.toFixed(1)},138 ${m} ${n[n.length-1].x.toFixed(1)},138`;return`
    <svg viewBox="0 0 520 156" style="width:100%;height:auto;display:block;">
      <line x1="42" y1="18" x2="478" y2="18" stroke="rgba(86,212,245,0.22)" stroke-dasharray="3 3"/>
      <text x="36" y="22" text-anchor="end" fill="#56d4f5" font-size="9.5" font-family="JetBrains Mono,monospace">${Math.round(p)}</text>
      <line x1="42" y1="138" x2="478" y2="138" stroke="rgba(216,175,87,0.2)"/>
      <text x="36" y="141" text-anchor="end" fill="#a5afc2" font-size="9.5" font-family="JetBrains Mono,monospace">${Math.round(r)}</text>
      <polygon points="${c}" fill="rgba(86,212,245,0.14)"/>
      <polyline points="${m}" fill="none" stroke="#56d4f5" stroke-width="2.3" stroke-linejoin="round"/>
      ${n.map((u,y)=>y===n.length-1||n.length<=16?`<circle cx="${u.x.toFixed(1)}" cy="${u.y.toFixed(1)}" r="${y===n.length-1?"4.5":"3"}" fill="${y===n.length-1?"#f2cf7e":"#56d4f5"}" stroke="#080b11" stroke-width="1.2"/>`:"").join("")}
    </svg>
  `}function Za(a,e){const d=Math.max(1,...a.speedBuckets.map(u=>u.right+u.wrong)),n=304/5,m=36;return`
    <svg viewBox="0 0 340 166" style="width:100%;height:auto;display:block;">
      <line x1="18" y1="136" x2="322" y2="136" stroke="rgba(216,175,87,0.28)"/>
      ${a.speedBuckets.map((u,y)=>{const w=18+n*(y+.5),g=u.right/d*116,v=u.wrong/d*116,f=136-g,x=f-v,b=u.right+u.wrong,S=e===y,R=e!==null&&!S;return`
        <g
          data-speed-bucket="${y}"
          data-speed-right="${u.right}"
          data-speed-wrong="${u.wrong}"
          data-speed-total="${b}"
          role="button"
          tabindex="0"
          aria-pressed="${S}"
          aria-label="Speed bucket ${h(Te[y])}: ${u.right} right, ${u.wrong} wrong"
          style="cursor:pointer;opacity:${R?"0.35":"1"};"
        >
          <rect
            x="${(w-n*.45).toFixed(1)}"
            y="8"
            width="${(n*.9).toFixed(1)}"
            height="150"
            rx="6"
            fill="${S?"rgba(242,207,126,0.14)":"transparent"}"
          />
          ${g>0?`<rect x="${(w-m/2).toFixed(1)}" y="${f.toFixed(1)}" width="${m}" height="${Math.max(2,g).toFixed(1)}" fill="#39d49a" rx="3"/>`:""}
          ${v>0?`<rect x="${(w-m/2).toFixed(1)}" y="${x.toFixed(1)}" width="${m}" height="${Math.max(2,v).toFixed(1)}" fill="#e05263" rx="3"/>`:""}
          ${S?`<line x1="${(w-m/2).toFixed(1)}" y1="138" x2="${(w+m/2).toFixed(1)}" y2="138" stroke="#f2cf7e" stroke-width="2.4"/>`:""}
          <text x="${w.toFixed(1)}" y="${Math.max(12,(b>0?x:136)-5).toFixed(1)}" text-anchor="middle" fill="${S?"#f2cf7e":"#f6f2e9"}" font-size="9.5" font-weight="700" font-family="JetBrains Mono,monospace">${b}</text>
          <text x="${w.toFixed(1)}" y="157" text-anchor="middle" fill="${S?"#f2cf7e":"#c8c2b6"}" font-size="9.5" font-weight="${S?"800":"500"}" font-family="JetBrains Mono,monospace">${h(Te[y])}</text>
        </g>
      `}).join("")}
    </svg>
  `}class es{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;unsubscribeStore=null;callbacks={};filter=ht("ALL_TIME");constructor(e){this.deps=e,le()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}getFilterState(){return{...this.filter}}setFilter(e){const s=e.domainId!==void 0?bt(e.domainId):this.filter.domainId,t=s!==this.filter.domainId,i=e.range??this.filter.range,o=i!==this.filter.range;this.filter={range:i,domainId:s,subcatLabel:s===null?null:e.subcatLabel!==void 0?e.subcatLabel:t?null:this.filter.subcatLabel,archetype:e.archetype!==void 0?e.archetype:this.filter.archetype,questionFormat:e.questionFormat!==void 0?e.questionFormat:this.filter.questionFormat??null,peelTier:e.peelTier!==void 0?e.peelTier:this.filter.peelTier,outcome:e.outcome??this.filter.outcome,speedBucket:e.speedBucket!==void 0?e.speedBucket:this.filter.speedBucket,bucketKey:e.bucketKey!==void 0?e.bucketKey:o?null:this.filter.bucketKey},this.isOpen()&&this.rerender()}resetFilters(){this.filter=ht(this.filter.range),this.isOpen()&&this.rerender()}applyInitialOptions(e){const s=bt(e.initialDomainId);this.filter={range:e.initialRange??"ALL_TIME",domainId:s,subcatLabel:s!==null&&e.initialSubcatLabel?.trim()||null,archetype:e.initialArchetype??null,questionFormat:e.initialQuestionFormat??null,peelTier:e.initialPeelTier??null,outcome:e.initialOutcome??"ALL",speedBucket:e.initialSpeedBucket??null,bucketKey:null}}open(e={}){this.close(),this.callbacks=e,this.applyInitialOptions(e),this.deps.store.syncAndBackfillFromProfile(this.deps.passport);const s=document.createElement("div");s.className="ws-meta-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label","Career Stats — Strengths, Weak Spots & Domain Radar"),s.addEventListener("click",t=>{t.target===s&&this.handleClose()}),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=ne(()=>this.handleBackOrClose()),this.unsubscribeStore=this.deps.store.subscribe(()=>{this.isOpen()&&this.rerender()}),this.renderInto(s,!0)}mount(e,s={}){this.unmount(),this.callbacks=s,this.applyInitialOptions(s),this.deps.store.syncAndBackfillFromProfile(this.deps.passport),this.mountedContainer=e,this.unsubscribeStore=this.deps.store.subscribe(()=>{this.isOpen()&&this.rerender()}),this.renderInto(e,!1)}unmount(){this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.unsubscribeStore&&(this.unsubscribeStore(),this.unsubscribeStore=null),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}this.handleClose()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}rerender(){const e=(this.modalBackdrop??this.mountedContainer)?.querySelector(".ws-meta-body-scroll")?.scrollTop??0;this.modalBackdrop?this.renderInto(this.modalBackdrop,!0):this.mountedContainer&&this.renderInto(this.mountedContainer,!1);const s=(this.modalBackdrop??this.mountedContainer)?.querySelector(".ws-meta-body-scroll");s&&e>0&&(s.scrollTop=e)}computeMissedCardsBadgeCount(e){let s=0;if(this.deps.srsEngine){this.deps.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks);const i=this.deps.srsEngine.getAllCards();s=this.filter.domainId!==null?i.filter(o=>o.domainId===this.filter.domainId).length:i.length}const t=e.kpis.totalWrong;return s>0?s:t}renderActiveFilterBar(e){const s=[];if(this.filter.domainId!==null&&s.push({key:"domain",label:B(this.filter.domainId).name}),this.filter.subcatLabel&&s.push({key:"subcat",label:this.filter.subcatLabel}),this.filter.outcome!=="ALL"&&s.push({key:"outcome",label:Bt[this.filter.outcome]}),this.filter.archetype&&s.push({key:"archetype",label:Ie[this.filter.archetype]}),this.filter.questionFormat&&s.push({key:"format",label:_e[this.filter.questionFormat]}),this.filter.peelTier!==null&&s.push({key:"peel",label:pe[String(this.filter.peelTier)]}),this.filter.speedBucket!==null&&s.push({key:"speed",label:`Speed ${Te[this.filter.speedBucket]}`}),this.filter.bucketKey!==null){const l=e.barSeries.find(r=>r.bucketKey===this.filter.bucketKey);s.push({key:"bucket",label:l?`${this.filter.range==="LAST_25"?l.label:l.bucketKey}`:this.filter.bucketKey})}const t=this.computeMissedCardsBadgeCount(e),i=this.filter.domainId!==null?B(this.filter.domainId):null,o=i?`Practice ${i.shortName} Slice`:"Practice This Slice";return`
      <div
        id="ws-stats-filter-bar"
        class="ws-stats-filter-bar ${e.hasActiveDimensionFilter?"is-filtered":""}"
        data-active-filter-count="${e.activeFilterCount}"
        data-active-domain="${this.filter.domainId??""}"
      >
        <div class="ws-stats-filter-chips-row">
          ${s.length>0?`
                <span class="ws-stats-slice-summary">
                  ✦ Slice: <strong>${e.kpis.totalAnswered}</strong> of ${e.rangeTotalCount} Q
                </span>
                ${s.map(l=>`
                      <button
                        type="button"
                        class="ws-stats-filter-chip"
                        data-remove-filter="${l.key}"
                        aria-label="Remove ${h(l.label)} filter"
                      >
                        <span>${h(l.label)}</span>
                        <span aria-hidden="true" style="color:var(--ivory-primary);font-weight:800;">✕</span>
                      </button>
                    `).join("")}
                <button
                  type="button"
                  class="ws-stats-reset-btn"
                  id="ws-stats-reset-filters"
                  data-reset-filters="true"
                >
                  ↺ Reset All
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
            aria-label="${h(o)}"
          >
            ▸ Practice This Slice
          </button>
          <button
            type="button"
            class="ws-meta-btn ws-stats-action-btn"
            id="ws-stats-open-srs"
            style="color:#8ee5ff;"
          >
            ✦ Review Missed Cards (${t})
          </button>
          <button
            type="button"
            class="ws-meta-btn ws-stats-action-btn"
            id="ws-stats-open-honours"
            style="color:var(--gold-bright);"
          >
            ◆ Related Trophies
          </button>
        </div>
      </div>
    `}renderSubcategoryBreakdown(e){if(this.filter.domainId===null)return"";const s=B(this.filter.domainId);return`
      <div id="ws-stats-subcat-panel" class="ws-stats-subcat-panel" data-subcat-domain="${this.filter.domainId}">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;">
          <span class="ws-meta-section-title" style="color:${s.accentHex};">
            ◆ Subcategory Breakdown · ${h(s.name)}
          </span>
          ${this.filter.subcatLabel?'<button type="button" class="ws-meta-inline-link" data-remove-filter="subcat" style="min-height:44px;padding:0 6px;">✕ Clear Subcategory</button>':'<span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">Tap a topic to drill deeper</span>'}
        </div>
        ${e.subcategories.length>0?`<div style="display:flex;flex-direction:column;">
                ${e.subcategories.map(t=>{const i=this.filter.subcatLabel!==null&&this.filter.subcatLabel.toLowerCase()===t.subcatLabel.toLowerCase(),o=this.filter.subcatLabel!==null&&!i;return`
                      <button
                        type="button"
                        data-subcat-filter="${h(t.subcatLabel)}"
                        data-subcat-right="${t.right}"
                        data-subcat-wrong="${t.wrong}"
                        aria-pressed="${i}"
                        class="ws-meta-row is-interactive ws-stats-row-btn ${i?"is-focused":""} ${o?"is-dimmed":""}"
                      >
                        <span style="min-width:0;flex:0 1 138px;font-size:12px;font-weight:600;color:var(--ivory-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                          ${h(M(t.subcatLabel))}
                        </span>
                        <div style="flex:1 1 60px;min-width:36px;height:5px;border-radius:999px;background:rgba(224,82,99,0.38);overflow:hidden;">
                          <div style="width:${t.accuracyPct}%;height:100%;background:#39d49a;"></div>
                        </div>
                        <span style="font-family:var(--font-mono);font-size:11px;color:#c8c2b6;white-space:nowrap;flex-shrink:0;">
                          <strong style="color:#67ebb8;">${t.right}R</strong>·<strong style="color:#ff8a98;">${t.wrong}W</strong>
                          <span style="color:#a5afc2;">(${t.accuracyPct}%)</span>
                        </span>
                      </button>
                    `}).join("")}
              </div>`:`<div style="padding:10px 0;font-size:12px;color:#a5afc2;">No questions recorded in ${h(s.name)} for this filter slice yet.</div>`}
      </div>
    `}renderInto(e,s){const t=this.deps.store.getSnapshot(),i=Wa(t,this.filter),o=this.deps.passport.getChallengerName(),{kpis:l}=i,r=(this.filter.bucketKey!==null?i.barSeries.find(f=>f.bucketKey===this.filter.bucketKey):null)??i.barSeries[i.barSeries.length-1]??null,p=j("ANALYTICS",{isModal:s,closeBtnId:"ws-stats-close",canNavigate:!!this.callbacks.onNavigateSection}),d=i.ledgerEvents.slice(0,50),n=l.doubleDownWinPct!==null?`${l.doubleDownWinPct}%`:"—",m=this.filter.domainId!==null,c=this.filter.archetype!==null,u=!!this.filter.questionFormat,y=this.filter.peelTier!==null,w=yt(this.filter),g=Pt(t),v=g.strongestDomainId!==null||g.weakestDomainId!==null?`<div id="ws-stats-strength-weak-strip" class="ws-meta-hscroll" style="padding:2px 0 4px;" aria-label="Strengths and Weak Spots">
            ${g.strongestDomainId!==null&&g.strongestDomainName?`<button type="button" class="ws-meta-chip" data-quick-dom="${g.strongestDomainId}" style="color:#67ebb8;">
                    ✦ Strongest: ${h(g.strongestDomainName)} (${g.strongestAccuracyPct}%)
                  </button>`:""}
            ${g.weakestDomainId!==null&&g.weakestDomainName?`<button type="button" class="ws-meta-chip" data-quick-dom="${g.weakestDomainId}" style="color:#ff9aa6;">
                    ◆ Weak Spot: ${h(g.weakestDomainName)} (${g.weakestAccuracyPct}%)
                  </button>`:""}
          </div>`:"";e.innerHTML=`
      <div class="ws-meta-shell" data-stats-filtered="${i.hasActiveDimensionFilter?"true":"false"}">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-stats-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">CAREER STATS</h2>
              <div class="ws-meta-eyebrow">${h(o)} · ${h(w??"Strengths, Weak Spots & Domain Radar")}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${p}
          </div>
        </div>

        <!-- Single-Row Borderless Underline Time-Range Tabs -->
        <div class="ws-meta-underline-tabs" role="tablist" aria-label="Analytics Time Range">
          ${[["LAST_25","Last 25 Q"],["DAYS_7","7 Days"],["DAYS_30","30 Days"],["ALL_TIME","All Time"]].map(([f,x])=>`
                <button type="button" role="tab" aria-selected="${this.filter.range===f}" class="ws-meta-underline-tab ${this.filter.range===f?"is-active":""}" data-range-tab="${f}">
                  ${x}
                </button>
              `).join("")}
        </div>

        <div class="ws-meta-body-scroll">
          <!-- Clickable Outcome KPI Filter Pills -->
          <div class="ws-meta-hscroll ws-stats-outcome-strip" role="group" aria-label="Filter by Outcome">
            ${[["ALL",`All (${i.outcomeCounts.all})`],["RIGHT",`Right Only (${i.outcomeCounts.right})`],["WRONG",`Wrong Only (${i.outcomeCounts.wrong})`],["DOUBLE_DOWN",`2x Double Down (${i.outcomeCounts.doubleDown})`]].map(([f,x])=>{const b=this.filter.outcome===f;return`
                  <button
                    type="button"
                    class="ws-meta-chip ws-stats-outcome-pill ${b?"is-active":""}"
                    data-outcome-filter="${f}"
                    aria-pressed="${b}"
                  >
                    ${x}
                  </button>
                `}).join("")}
          </div>

          <!-- Frameless Hairline KPI Strip (100% Live Recomputed from Filtered Slice!) -->
          <div class="ws-meta-kpi-strip" id="ws-stats-kpi-strip" data-kpi-total="${l.totalAnswered}" data-kpi-right="${l.totalRight}" data-kpi-wrong="${l.totalWrong}">
            <div class="ws-meta-kpi-cell" data-stats-kpi="rw">
              <span class="ws-meta-kpi-lbl">Right / Wrong</span>
              <span class="ws-meta-kpi-val">
                <span data-stats-right="${l.totalRight}" style="color:#67ebb8;">${l.totalRight}R</span>
                <span style="color:#a5afc2;font-weight:500;">·</span>
                <span data-stats-wrong="${l.totalWrong}" style="color:#ff8a98;">${l.totalWrong}W</span>
              </span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="accuracy">
              <span class="ws-meta-kpi-lbl">Accuracy</span>
              <span class="ws-meta-kpi-val" style="color:var(--gold-bright);">${l.accuracyPct!==null?`${l.accuracyPct.toFixed(1)}%`:"—"}</span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="streak">
              <span class="ws-meta-kpi-lbl">Streak</span>
              <span class="ws-meta-kpi-val">${l.currentStreak} <span style="font-size:11.5px;color:var(--gold-bright);">/ ${l.bestStreak} BEST</span></span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="elo">
              <span class="ws-meta-kpi-lbl">${this.filter.domainId!==null?"Slice ELO":"Global ELO"}</span>
              <span class="ws-meta-kpi-val" style="color:var(--cyan-clue);">${l.eloLatest} <span style="font-size:11px;color:#a5afc2;">(${l.eloPeak})</span></span>
            </div>
            <div class="ws-meta-kpi-cell" data-stats-kpi="speed">
              <span class="ws-meta-kpi-lbl">Speed · 2x Win</span>
              <span class="ws-meta-kpi-val" style="font-size:14.5px;">${l.totalAnswered>0?`${(l.avgResponseMs/1e3).toFixed(1)}s`:"—"} · <span style="color:var(--gold-bright);">${n}</span></span>
            </div>
          </div>

          <!-- Active Drill-Down Breadcrumb & 3 Linked Action Buttons -->
          ${this.renderActiveFilterBar(i)}

          <!-- Graph 1: Historical Right vs. Wrong Stacked Bars & Rolling Accuracy % -->
          <div class="ws-meta-section" id="ws-stats-section-1">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">1. Right vs. Wrong &amp; Rolling Accuracy</h3>
              <span style="font-family:var(--font-mono);font-size:10.5px;color:#c8c2b6;">
                <span style="color:#67ebb8;">■ Right</span> · <span style="color:#ff8a98;">■ Wrong</span> · <span style="color:var(--gold-bright);">— Accuracy %</span>
              </span>
            </div>

            ${Qa(i.barSeries,this.filter.bucketKey)}

            ${r?`<div class="ws-meta-note" style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11px;color:var(--ivory-primary);">
                    <span>[${h(r.label)}] ${h(r.sublabel)}</span>
                    <span style="color:var(--gold-bright);font-weight:700;">Rolling ${r.rollingAccPct}%${this.filter.bucketKey?" · Filtered (tap bar to clear)":" · Tap any bar to filter"}</span>
                  </div>`:""}
          </div>

          <!-- Graph 2: 12-Domain Mastery Breakdown, Polar Radar & Subcategory Drill-Down -->
          <div class="ws-meta-section" id="ws-stats-section-2">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">2. 12-Domain Mastery &amp; Polar Radar</h3>
              <span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">
                ${m?"Tap active domain again to show all 12":"Tap any spoke or domain row to drill down"}
              </span>
            </div>
            ${v}

            <div class="ws-meta-two-col" style="align-items:center;">
              <div>
                ${Xa(i,this.filter.domainId)}
              </div>
              <div style="display:flex;flex-direction:column;">
                ${U.map((f,x)=>{const b=i.byDomain[x],S=b.right+b.wrong,R=S>0?b.right/S*100:0,C=x===this.filter.domainId,k=m&&!C;return`
                    <button
                      type="button"
                      data-g2-dom="${x}"
                      data-g2-right="${b.right}"
                      data-g2-wrong="${b.wrong}"
                      aria-pressed="${C}"
                      class="ws-meta-row is-interactive ws-stats-row-btn ${C?"is-focused":""} ${k?"is-dimmed":""}"
                    >
                      <span style="display:inline-flex;align-items:center;gap:7px;min-width:0;flex:0 1 104px;">
                        <img src="./${h(f.medallionUrl)}" alt="" style="width:18px;height:18px;object-fit:contain;flex-shrink:0;"/>
                        <span style="font-size:12px;font-weight:${C?"700":"600"};color:${C?"var(--gold-bright)":"var(--ivory-primary)"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${h(f.shortName)}</span>
                      </span>
                      <div style="flex:1 1 44px;min-width:28px;height:5px;border-radius:999px;background:${S>0?"rgba(224,82,99,0.42)":"rgba(255,255,255,0.08)"};overflow:hidden;">
                        <div style="width:${R.toFixed(1)}%;height:100%;background:#39d49a;"></div>
                      </div>
                      <span style="font-family:var(--font-mono);font-size:10.5px;color:#c8c2b6;white-space:nowrap;flex-shrink:0;">
                        <strong style="color:#67ebb8;">${b.right}R</strong>·<strong style="color:#ff8a98;">${b.wrong}W</strong> <span style="color:#a5afc2;">(${Ee(b.right,b.wrong)})</span> · <strong style="color:${f.accentHex};">${b.lastElo}</strong>
                      </span>
                    </button>
                  `}).join("")}
              </div>
            </div>

            ${this.renderSubcategoryBreakdown(i)}
          </div>

          <!-- Graph 3: Filtered Rating Trajectory & Double-Down Record -->
          <div class="ws-meta-section" id="ws-stats-section-3">
            <h3 class="ws-meta-section-title">3. Skill Rating &amp; Double-Down Record${this.filter.domainId!==null?` · ${h(B(this.filter.domainId).shortName)}`:""}</h3>
            <div class="ws-meta-two-col" style="align-items:center;">
              <div>
                ${Ja(i.eloSeries)}
              </div>
              <div style="display:flex;flex-direction:column;">
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;">
                  <span style="color:#c8c2b6;">Standard Lock Record</span>
                  <span><strong style="color:#67ebb8;">${l.safeLockWins}W</strong> – <strong style="color:#ff8a98;">${l.safeLockMisses}L</strong> <span style="color:#a5afc2;">(${Ee(l.safeLockWins,l.safeLockMisses)})</span></span>
                </div>
                <button
                  type="button"
                  class="ws-meta-row is-interactive ws-stats-row-btn ${this.filter.outcome==="DOUBLE_DOWN"?"is-focused":""}"
                  data-outcome-filter="DOUBLE_DOWN"
                  style="font-family:var(--font-mono);font-size:11.5px;"
                >
                  <span style="color:#c8c2b6;">2x Double-Down Wins</span>
                  <span style="color:var(--gold-bright);font-weight:700;">${l.doubleDownWins}W – ${l.doubleDownMisses}L (${n})</span>
                </button>
                <div class="ws-meta-row" style="font-family:var(--font-mono);font-size:11.5px;border-bottom:none;">
                  <span style="color:#c8c2b6;">Backfires / Max Streak</span>
                  <span><strong style="color:#ff8a98;">${l.backfires}</strong> · Peak <strong style="color:var(--gold-bright);">${l.bestConsecutiveMax6xWins}×</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Graph 4: Format Mastery Strip + Mode Matrix & Speed Histogram -->
          <div class="ws-meta-section" id="ws-stats-section-4">
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;">
              <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
                <h3 class="ws-meta-section-title">Format Mastery Strip (7 Game-Show Formats)</h3>
                <span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">
                  ${u?"Tap active format to clear":"Tap any format to cross-filter"}
                </span>
              </div>
              <div id="ws-stats-format-strip" class="ws-meta-hscroll" role="group" aria-label="Filter by Question Format">
                ${Ne.map(f=>{const x=i.byFormat[f],b=this.filter.questionFormat===f,S=u&&!b,R=Ee(x.right,x.wrong);return`
                    <button
                      type="button"
                      class="ws-meta-chip ${b?"is-active":""}"
                      data-format-filter="${f}"
                      data-format-right="${x.right}"
                      data-format-wrong="${x.wrong}"
                      aria-pressed="${b}"
                      style="${S?"opacity:0.45;":""}display:inline-flex;align-items:center;gap:6px;"
                    >
                      <span>${h(_e[f])}</span>
                      <span style="font-family:var(--font-mono);font-size:10.5px;color:${b?"var(--gold-bright)":"#c8c2b6"};">
                        ${x.right}R·${x.wrong}W${R!=="—"?` (${R})`:""}
                      </span>
                    </button>
                  `}).join("")}
              </div>
            </div>

            <div class="ws-meta-two-col">
              <div style="display:flex;flex-direction:column;gap:8px;">
                <h3 class="ws-meta-section-title">4A. Mode &amp; Lifeline Matrix</h3>
                <div>
                  ${je.map(f=>{const x=i.byArchetype[f],b=this.filter.archetype===f,S=c&&!b;return`
                      <button
                        type="button"
                        data-arch-filter="${f}"
                        data-arch-right="${x.right}"
                        data-arch-wrong="${x.wrong}"
                        aria-pressed="${b}"
                        class="ws-meta-row is-interactive ws-stats-row-btn ${b?"is-focused":""} ${S?"is-dimmed":""}"
                        style="font-family:var(--font-mono);font-size:11px;"
                      >
                        <span style="color:${b?"var(--gold-bright)":"var(--ivory-primary)"};font-weight:${b?"700":"500"};">${h(Ie[f])}</span>
                        <span><strong style="color:#67ebb8;">${x.right}R</strong> · <strong style="color:#ff8a98;">${x.wrong}W</strong> <span style="color:#a5afc2;">(${Ee(x.right,x.wrong)})</span></span>
                      </button>
                    `}).join("")}
                </div>
                <div class="ws-stats-peel-grid" role="group" aria-label="Filter by Hint Tier">
                  ${[[1,"1",pe[1]],[2,"2",pe[2]],[3,"3",pe[3]]].map(([f,x,b])=>{const S=i.byPeelTier[x],R=this.filter.peelTier===f;return`
                        <button
                          type="button"
                          class="ws-stats-peel-btn ${R?"is-active":""} ${y&&!R?"is-dimmed":""}"
                          data-peel-filter="${f}"
                          data-peel-right="${S.right}"
                          data-peel-wrong="${S.wrong}"
                          aria-pressed="${R}"
                        >
                          <span class="ws-meta-kpi-lbl" style="color:${R?"var(--gold-bright)":"#e6d095"};">${b}</span>
                          <span class="ws-meta-kpi-val" style="font-size:13px;">
                            <span style="color:#67ebb8;">${S.right}R</span> / <span style="color:#ff8a98;">${S.wrong}W</span>
                          </span>
                        </button>
                      `}).join("")}
                </div>
              </div>

              <div style="display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px;">
                  <h3 class="ws-meta-section-title">4B. Response-Time Histogram</h3>
                  <span style="font-family:var(--font-mono);font-size:10.5px;color:#a5afc2;">
                    ${this.filter.speedBucket!==null?"Tap active bar to clear":"Tap any bar to filter"}
                  </span>
                </div>
                ${Za(i,this.filter.speedBucket)}
              </div>
            </div>
          </div>

          <!-- 5. Chronological Question Ledger Tape (Strictly Filtered!) -->
          <div class="ws-meta-section" id="ws-stats-section-5" style="border-bottom:none;">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">
                5. Question Ledger Tape (${d.length}${i.filteredEvents.length>d.length?` of ${i.filteredEvents.length}`:""})
              </h3>
              ${i.hasActiveDimensionFilter?'<span style="font-family:var(--font-mono);font-size:10.5px;color:var(--gold-bright);">Filtered Slice Only</span>':""}
            </div>
            ${d.length>0?`<div id="ws-stats-ledger" style="display:flex;flex-direction:column;max-height:280px;overflow-y:auto;">
                    ${d.map(f=>{const x=B(f.domainId),b=f.peelTier===1?3:f.peelTier===2?2:1,S=Le(f),R=(b*(S?2:1)).toFixed(1),C=f.speedBucketIdx??ge(f.responseTimeMs),k=Ce(f),I=f.questionFormat?_e[k]:Ie[f.archetype],L=f.promptSnippet?M(f.promptSnippet):"",O=f.subcatLabel?M(f.subcatLabel):"";return`
                          <div
                            class="ws-meta-row"
                            data-ledger-domain="${f.domainId}"
                            data-ledger-correct="${f.correct?"true":"false"}"
                            data-ledger-arch="${f.archetype}"
                            data-ledger-format="${k}"
                            data-ledger-peel="${f.peelTier}"
                            data-ledger-speed="${C}"
                            data-ledger-date="${h(f.dateKey)}"
                            style="flex-direction:column;align-items:stretch;gap:4px;padding:9px 4px 9px 10px;font-family:var(--font-mono);font-size:11px;box-shadow:inset 2px 0 0 ${f.correct?"var(--emerald-win)":"var(--crimson-alert)"};"
                          >
                            <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;">
                              <span style="display:inline-flex;align-items:center;gap:6px;min-width:0;flex-wrap:wrap;">
                                <span style="font-weight:800;color:${f.correct?"#67ebb8":"#ff8a98"};">
                                  ${f.correct?"✓":f.backfired?"✕!":"✕"}
                                </span>
                                <img src="./${h(x.medallionUrl)}" alt="" style="width:16px;height:16px;object-fit:contain;flex-shrink:0;"/>
                                <span style="color:var(--ivory-primary);font-weight:600;">${h(x.shortName)}</span>
                                ${O?`<span style="color:${x.accentHex};">· ${h(O)}</span>`:""}
                                <span style="color:#a5afc2;">· ${h(I)} · ${Ya[f.peelTier]}${S?" · 2x":""}</span>
                              </span>
                              <span style="color:#c8c2b6;white-space:nowrap;">
                                ${(f.responseTimeMs/1e3).toFixed(1)}s · ${R}x · <strong style="color:${f.correct?"var(--gold-bright)":"#a5afc2"};">+${f.pointsDelta.toLocaleString("en-US")} PTS</strong>
                              </span>
                            </div>
                            ${L?`<div style="font-family:var(--font-sans);font-size:11.5px;color:#c8c2b6;line-height:1.35;white-space:normal;">
                                    ${h(L)}${f.answerLabel?` — <strong style="color:var(--ivory-primary);">${h(M(f.answerLabel))}</strong>`:""}
                                  </div>`:""}
                          </div>
                        `}).join("")}
                  </div>`:`<div id="ws-stats-ledger-empty" style="padding:18px 0;text-align:center;font-size:12.5px;color:#c8c2b6;display:flex;flex-direction:column;align-items:center;gap:10px;">
                    <span>${i.hasActiveDimensionFilter?"No recorded questions match every active filter in this slice.":"No individual question events logged in this browser session yet."}</span>
                    ${i.hasActiveDimensionFilter?'<button type="button" class="ws-stats-reset-btn" data-reset-filters="true">↺ Reset All Filters</button>':""}
                  </div>`}
          </div>
        </div>
      </div>
    `,this.bindEvents(e)}bindEvents(e){e.querySelector("#ws-stats-back")?.addEventListener("click",()=>this.handleBackOrClose()),re(e,{closeBtnId:"ws-stats-close",onNavigate:s=>this.callbacks.onNavigateSection?.(s),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll("[data-range-tab]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.rangeTab;!t||t===this.filter.range||(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.setFilter({range:t,bucketKey:null}))})}),e.querySelectorAll("[data-outcome-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.outcomeFilter;if(!t)return;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const i=t!=="ALL"&&this.filter.outcome===t?"ALL":t;this.setFilter({outcome:i})})}),e.querySelectorAll("[data-remove-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.removeFilter;this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),t==="domain"?this.setFilter({domainId:null,subcatLabel:null}):t==="subcat"?this.setFilter({subcatLabel:null}):t==="outcome"?this.setFilter({outcome:"ALL"}):t==="archetype"?this.setFilter({archetype:null}):t==="format"?this.setFilter({questionFormat:null}):t==="peel"?this.setFilter({peelTier:null}):t==="speed"?this.setFilter({speedBucket:null}):t==="bucket"&&this.setFilter({bucketKey:null})})}),e.querySelectorAll("[data-reset-filters]").forEach(s=>{s.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.resetFilters()})}),e.querySelector("#ws-stats-practice-slice")?.addEventListener("click",()=>{this.deps.haptics?.lockThunk(),this.deps.audio?.playSfx("vault_thunk"),this.callbacks.onPracticeSlice?.({domainId:this.filter.domainId,subcatLabel:this.filter.subcatLabel,outcome:this.filter.outcome,archetype:this.filter.archetype,questionFormat:this.filter.questionFormat??null,peelTier:this.filter.peelTier,speedBucket:this.filter.speedBucket})}),e.querySelector("#ws-stats-open-srs")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onOpenMissedCards?this.callbacks.onOpenMissedCards(this.filter.domainId):this.callbacks.onNavigateSection?.("OBSERVATORY")}),e.querySelector("#ws-stats-open-honours")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onOpenRelatedHonours?this.callbacks.onOpenRelatedHonours({aspect:ja(this.filter),contextLabel:yt(this.filter),domainId:this.filter.domainId,archetype:this.filter.archetype,peelTier:this.filter.peelTier,outcome:this.filter.outcome,speedBucket:this.filter.speedBucket}):this.callbacks.onNavigateSection?.("HONOURS")}),e.querySelectorAll("[data-g1-bucket]").forEach(s=>{s.addEventListener("click",()=>{const t=s.getAttribute("data-g1-bucket");t&&(this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({bucketKey:this.filter.bucketKey===t?null:t}))})}),e.querySelectorAll("[data-g2-dom]").forEach(s=>{s.addEventListener("click",()=>{const t=Number(s.getAttribute("data-g2-dom"));if(!Number.isFinite(t)||t<0||t>11)return;const i=t;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({domainId:this.filter.domainId===i?null:i,subcatLabel:null})})}),e.querySelectorAll("[data-subcat-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.subcatFilter?.trim();if(!t)return;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick");const i=this.filter.subcatLabel!==null&&this.filter.subcatLabel.toLowerCase()===t.toLowerCase();this.setFilter({subcatLabel:i?null:t})})}),e.querySelectorAll("[data-quick-dom]").forEach(s=>{s.addEventListener("click",()=>{const t=Number(s.dataset.quickDom);if(!Number.isFinite(t)||t<0||t>11)return;const i=t;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({domainId:this.filter.domainId===i?null:i,subcatLabel:null})})}),e.querySelectorAll("[data-format-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.formatFilter;t&&(this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({questionFormat:this.filter.questionFormat===t?null:t}))})}),e.querySelectorAll("[data-arch-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.archFilter;t&&(this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({archetype:this.filter.archetype===t?null:t}))})}),e.querySelectorAll("[data-peel-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=Number(s.dataset.peelFilter);if(t!==1&&t!==2&&t!==3)return;const i=t;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({peelTier:this.filter.peelTier===i?null:i})})}),e.querySelectorAll("[data-speed-bucket]").forEach(s=>{s.addEventListener("click",()=>{const t=Number(s.getAttribute("data-speed-bucket"));if(!Number.isInteger(t)||t<0||t>4)return;const i=t;this.deps.haptics?.spinTick(),this.deps.audio?.playSfx("spin_tick"),this.setFilter({speedBucket:this.filter.speedBucket===i?null:i})})})}}const vt="ws_hall_of_honours_v1",Ht="ws_equipped_hud_theme_v1",Ft="ws_unlocked_hud_themes_v1",Gt={TIER_1_EASY:{label:"Tier 1 · Initiate Bronze",shortLabel:"Initiate Bronze",rarityPct:"Common",colorHex:"#e09b63",bgRgba:"rgba(224, 155, 99, 0.15)"},TIER_2_MEDIUM:{label:"Tier 2 · Envoy Sterling",shortLabel:"Envoy Sterling",rarityPct:"Uncommon",colorHex:"#cfdceb",bgRgba:"rgba(207, 220, 235, 0.15)"},TIER_3_HARD:{label:"Tier 3 · Consul 24K Gold",shortLabel:"Consul 24K Gold",rarityPct:"Rare",colorHex:"#f2cf7e",bgRgba:"rgba(242, 207, 126, 0.16)"},TIER_4_VERY_RARE:{label:"Tier 4 · Arbiter Sapphire",shortLabel:"Arbiter Sapphire",rarityPct:"Very Rare (2.5%)",colorHex:"#56d4f5",bgRgba:"rgba(86, 212, 245, 0.16)"},TIER_5_MYTHIC:{label:"Tier 5 · Mythic Celestial Diamond",shortLabel:"Mythic 0.1%",rarityPct:"Mythic (0.1%)",colorHex:"#c79bff",bgRgba:"rgba(199, 155, 255, 0.18)"}},ts=[{id:"bt_01",order:1,title:"MERIDIAN CANDIDATE",unlockRequirement:"Default Opening Broadcast Title"},{id:"bt_02",order:2,title:"GENEVA CHARTER INITIATE",unlockRequirement:"Tier 1: Lock your first correct answer"},{id:"bt_03",order:3,title:"COLD INSTINCT SPECIALIST",unlockRequirement:"Tier 2: Answer 10 questions cleanly with zero lifelines"},{id:"bt_04",order:4,title:"CONVICTION HIGH-ROLLER",unlockRequirement:"Tier 2: Win a full-stakes 2× Double Down wager"},{id:"bt_05",order:5,title:"FORENSIC TELL READER",unlockRequirement:"Tier 2: Catch a live rival bluff on stage"},{id:"bt_06",order:6,title:"ARCHIVE VAULT DELVER",unlockRequirement:"Tier 2: Survive to Round 15 in Endless Mode"},{id:"bt_07",order:7,title:"CONSUL OF THE TWELVE",unlockRequirement:"Tier 3: Reach 1500 Skill Rating in any domain"},{id:"bt_08",order:8,title:"BLACK SALON SHARK",unlockRequirement:"Tier 3: Win a Head-to-Head Rival Trial"},{id:"bt_09",order:9,title:"RELIC ARCHIVIST SUPREME",unlockRequirement:"Tier 3: Collect 4 Regional Championship trophies"},{id:"bt_10",order:10,title:"FIRST CITIZEN ARBITER",unlockRequirement:"Tier 4: Complete the World Tour Campaign"},{id:"bt_11",order:11,title:"UNPEELED SOVEREIGN",unlockRequirement:"Tier 5 Mythic: Win a Boss Showdown with zero lifelines"},{id:"bt_12",order:12,title:"POLYMATH SUPREME",unlockRequirement:"Tier 5 Mythic: Reach 1850+ Skill Rating across all 12 domains"}],as=[{id:"bt_13",order:13,title:"VARSITY SCHOLAR",unlockRequirement:"Tier 1: Score 80%+ on a High School round"},{id:"bt_14",order:14,title:"DEAN'S LIST FELLOW",unlockRequirement:"Tier 2: Score 85%+ on a College round"},{id:"bt_15",order:15,title:"ROYAL CARTOGRAPHER",unlockRequirement:"Tier 3: Win 5 World Map Pin-Drop challenges"},{id:"bt_16",order:16,title:"MENSA GRANDMASTER",unlockRequirement:"Tier 4: Score 80%+ on a Mensa round"},{id:"bt_17",order:17,title:"SOVEREIGN OMNISCIENT",unlockRequirement:"Tier 5 Mythic: Complete Omniscient Mensa Polymath (#84)"}],ss=[{id:"bt_18",order:18,title:"POWER PLAY HIGH ROLLER",unlockRequirement:"Tier 3: Win 3 Power Play wagers on the show board (#95)"},{id:"bt_19",order:19,title:"WORLD'S SMARTEST CHAMPION",unlockRequirement:"Tier 5 Mythic: Win the Tier 8 1.4 Billion Global Finale (#99)"}],J=[...ts,...as,...ss],is=[{id:"GENEVA_CHAMPAGNE_24K",order:1,name:"Studio 24K Champagne Gold",primaryHex:"#f2cf7e",secondaryHex:"#d8af57",ringGlowRgba:"rgba(242, 207, 126, 0.36)",unlockRequirement:"Default Broadcast Stage Theme"},{id:"SOVEREIGN_PLATINUM_IVORY",order:2,name:"Sovereign Platinum & Ivory",primaryHex:"#eae6dc",secondaryHex:"#b8c4d4",ringGlowRgba:"rgba(234, 230, 220, 0.34)",unlockRequirement:"Tier 1: Set your Contestant Name or Passport"},{id:"HORIZON_ELECTRIC_CYAN",order:3,name:"Horizon Studio Cyan",primaryHex:"#64e6ff",secondaryHex:"#35a7db",ringGlowRgba:"rgba(100, 230, 255, 0.36)",unlockRequirement:"Tier 1: Pledge a League House"},{id:"AGORA_BOTANICAL_EMERALD",order:4,name:"Emerald Winner Spotlight",primaryHex:"#52eba8",secondaryHex:"#28b87a",ringGlowRgba:"rgba(82, 235, 168, 0.35)",unlockRequirement:"Tier 2: Reach 25 lifetime correct answers"},{id:"TOKYO_VERMILION_EMBER",order:5,name:"Tokyo Prime-Time Vermilion",primaryHex:"#ff9d5c",secondaryHex:"#e05263",ringGlowRgba:"rgba(255, 157, 92, 0.36)",unlockRequirement:"Tier 2: Clear both London & Tokyo Tour Stops"},{id:"CAIRO_SOLAR_AMBER",order:6,name:"Cairo Pavilion Solar Amber",primaryHex:"#ffcf56",secondaryHex:"#d98a2b",ringGlowRgba:"rgba(255, 207, 86, 0.38)",unlockRequirement:"Tier 3: Reach Round 50 in Endless Mode"},{id:"REYKJAVIK_BOREALIS_VIOLET",order:7,name:"Borealis Stage Violet-Teal",primaryHex:"#b494ff",secondaryHex:"#5ce1e6",ringGlowRgba:"rgba(180, 148, 255, 0.38)",unlockRequirement:"Tier 4: Reach 1750+ Skill Rating across 6 domains"},{id:"MYTHIC_PRISMATIC_DIAMOND",order:8,name:"Mythic Celestial Diamond",primaryHex:"#fff8e7",secondaryHex:"#9ef2ff",ringGlowRgba:"rgba(255, 248, 231, 0.44)",unlockRequirement:"Tier 5 Mythic: Lightning Buzzer Savant (10 straight under 3s)"}],os=[{id:"BLUEPRINT_SAPPHIRE_DRAFT",order:9,name:"Sapphire Visual Stage",primaryHex:"#5ce1ff",secondaryHex:"#2589c7",ringGlowRgba:"rgba(92, 225, 255, 0.38)",unlockRequirement:"Tier 1: Solve your first Visual Spotter diagram (#74)"},{id:"CARTOGRAPHER_MERCATOR_GOLD",order:10,name:"World Atlas Mercator Gold",primaryHex:"#f5cb6e",secondaryHex:"#39d49a",ringGlowRgba:"rgba(245, 203, 110, 0.40)",unlockRequirement:"Tier 2: Map Bullseye within 300 km (#71)"},{id:"MENSA_OBSIDIAN_ULTRAVIOLET",order:11,name:"Mensa Obsidian Ultraviolet",primaryHex:"#d0a8ff",secondaryHex:"#64e6ff",ringGlowRgba:"rgba(208, 168, 255, 0.42)",unlockRequirement:"Tier 3: Score 80%+ on a Graduate round (#68)"}],rs=[{id:"STUDIO_SPOTLIGHT_GOLD",order:12,name:"Prime-Time Spotlight Gold",primaryHex:"#ffd866",secondaryHex:"#f59f2a",ringGlowRgba:"rgba(255, 216, 102, 0.44)",unlockRequirement:"Tier 2: Land 3 Pinpoint Dial Bullseyes (#93)"},{id:"SIX_WEDGE_PRISM_CROWN",order:13,name:"Six-Wedge Championship Crown",primaryHex:"#67f0b8",secondaryHex:"#f5c451",ringGlowRgba:"rgba(103, 240, 184, 0.44)",unlockRequirement:"Tier 4: Collect all 6 Trivial Wedges on one board (#97)"}],z=[...is,...os,...rs];function Ut(){const a=["GENEVA_CHAMPAGNE_24K"];try{if(typeof localStorage>"u")return a;const e=localStorage.getItem(Ft);if(!e)return a;const s=JSON.parse(e);if(!Array.isArray(s))return a;for(const t of s)z.some(i=>i.id===t)&&!a.includes(t)&&a.push(t)}catch{}return a}function ns(a){const e=Ut();if(e.includes(a))return!1;e.push(a);try{typeof localStorage<"u"&&localStorage.setItem(Ft,JSON.stringify(e))}catch{}return!0}function Je(){try{if(typeof localStorage<"u"){const a=localStorage.getItem(Ht),e=z.find(s=>s.id===a);if(e)return e}}catch{}return z[0]}function qt(a){const e=z.find(s=>s.id===a)??z[0];try{if(typeof localStorage<"u"&&localStorage.setItem(Ht,e.id),typeof document<"u"){const s=document.documentElement;s.style.setProperty("--gold-bright",e.primaryHex),s.style.setProperty("--gold-24k",e.secondaryHex),s.style.setProperty("--gold-glow",e.ringGlowRgba),s.style.setProperty("--ws-chrono-accent",e.primaryHex)}}catch{}return e}function ls(a){const s={medal_tier1_bronze:{c1:"#f0b67f",c2:"#8c4f27",rim:"#ffd5ab",ribbon:"#9e2638",glyph:'<polygon points="48,28 53,40 66,41 56,50 59,63 48,56 37,63 40,50 30,41 43,40" fill="#ffd5ab"/>'},medal_tier2_sterling:{c1:"#f2f7fc",c2:"#6e8299",rim:"#ffffff",ribbon:"#1f4478",glyph:'<polygon points="48,26 55,40 70,42 59,52 62,67 48,59 34,67 37,52 26,42 41,40" fill="#ffffff"/>'},medal_tier3_gold:{c1:"#fff0ad",c2:"#b38124",rim:"#fff8d6",ribbon:"#166347",glyph:'<polygon points="48,24 54,39 70,39 57,49 62,65 48,55 34,65 39,49 26,39 42,39" fill="#39d49a"/>'},medal_tier4_sapphire:{c1:"#8ce6ff",c2:"#1a498a",rim:"#dff8ff",ribbon:"#2a2259",glyph:'<polygon points="48,23 60,46 48,69 36,46" fill="#dff8ff"/>'},medal_tier5_mythic:{c1:"#fff8eb",c2:"#7a52cc",rim:"#ffe89e",ribbon:"#401b6b",glyph:'<polygon points="48,22 63,46 48,70 33,46" fill="#fffdf7"/><circle cx="48" cy="46" r="6" fill="#f2cf7e"/>'},trophy_streak_chronometer:{c1:"#ffe799",c2:"#9e6c1c",rim:"#fff6cf",ribbon:"#7d2029",glyph:'<circle cx="48" cy="46" r="14" fill="none" stroke="#fff6cf" stroke-width="3"/><path d="M48,46 L48,36 M48,46 L56,49" stroke="#fff6cf" stroke-width="2.6" stroke-linecap="round"/>'},trophy_overclock_roulette:{c1:"#ffb86b",c2:"#9e2638",rim:"#ffe699",ribbon:"#591624",glyph:'<path d="M51,26 L37,48 L48,48 L45,68 L61,44 L49,44 Z" fill="#fff6cf"/>'},trophy_polymath_globe:{c1:"#9ef5d8",c2:"#1b6b5c",rim:"#ffe89e",ribbon:"#17455e",glyph:'<circle cx="48" cy="46" r="14" fill="none" stroke="#fff6cf" stroke-width="2.2"/><ellipse cx="48" cy="46" rx="7" ry="14" fill="none" stroke="#fff6cf" stroke-width="1.8"/><line x1="34" y1="46" x2="62" y2="46" stroke="#fff6cf" stroke-width="1.8"/>'}}[a],t=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="mg_${a}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${s.c1}"/>
        <stop offset="100%" stop-color="${s.c2}"/>
      </linearGradient>
    </defs>
    <polygon points="34,6 62,6 56,30 40,30" fill="${s.ribbon}" stroke="${s.rim}" stroke-width="1.2"/>
    <circle cx="48" cy="48" r="30" fill="url(#mg_${a})" stroke="${s.rim}" stroke-width="2.6"/>
    <circle cx="48" cy="48" r="24" fill="rgba(8,11,18,0.42)" stroke="${s.rim}" stroke-width="1" stroke-dasharray="3 2"/>
    ${s.glyph}
  </svg>`;return`data:image/svg+xml;utf8,${encodeURIComponent(t)}`}function cs(a){return Object.values(a.visas).filter(e=>e.cleared).length}function wt(a){const e=new Set([...a.passport.unlockedRelics,...a.blackboard?.unlockedRelics??[]]);for(const s of Object.values(a.passport.visas))(s.cleared||s.relicUnlocked)&&e.add(s.relicId);return e.size}function ds(a){let e=1200;for(let s=0;s<12;s++)e=Math.max(e,a.analytics.byDomain[s]?.peakElo??1200,a.passport.domainElo[s]??1200);return e}function xt(a,e){let s=0;for(let t=0;t<12;t++)Math.max(a.analytics.byDomain[t]?.peakElo??1200,a.passport.domainElo[t]??1200)>=e&&(s+=1);return s}function ps(a){let e=0;for(let s=0;s<12;s++)(a.analytics.byDomain[s]?.right??0)>=1&&(e+=1);return e}function hs(a){let e=a.feats.duelChallengesPlayed??0,s=a.feats.duelGhostWins??0,t=a.feats.srsReviewsCompleted??0,i=0,o=0,l=a.feats.offlinePacksCached??0,r=a.feats.clueLadderStep1Snipes??0,p=a.feats.mindGambitsActivated??0,d=a.feats.secondWindSaves??0,n=a.feats.finaleCategoryWins??0;try{if(typeof localStorage<"u"){const m=localStorage.getItem("ws_duel_rivals_v2");if(m){const g=JSON.parse(m),v=Array.isArray(g?.history)?g.history.length:0,f=Array.isArray(g?.history)?g.history.filter(S=>S?.winner==="PLAYER").length:0;let x=0,b=0;if(g?.rivalsById&&typeof g.rivalsById=="object")for(const S of Object.values(g.rivalsById))x+=Math.max(0,Math.floor(Number(S?.totalDuels)||0)),b+=Math.max(0,Math.floor(Number(S?.lossesAgainstPlayer)||0));e=Math.max(e,v,x),s=Math.max(s,f,b)}const c=localStorage.getItem("ws_spaced_repetition_v2");if(c){const g=JSON.parse(c);if(Array.isArray(g?.cards)){let v=0,f=0;for(const x of g.cards)v+=Math.max(0,Math.floor(Number(x?.totalReviews)||0)),Number(x?.box)===5&&(f+=1);t=Math.max(t,v),i=Math.max(i,f)}}const u=localStorage.getItem("ws_question_feedback_v1");if(u){const g=JSON.parse(u);g?.entries&&typeof g.entries=="object"&&(o=Object.keys(g.entries).length)}const y=localStorage.getItem("ws_offline_packs_v2");if(y){const g=JSON.parse(y);Array.isArray(g)?l=Math.max(l,g.length):g&&typeof g=="object"&&Array.isArray(g.packs)&&(l=Math.max(l,g.packs.length))}const w=localStorage.getItem("ws_mind_gambits_v3");if(w){const g=JSON.parse(w);g&&typeof g=="object"&&(p=Math.max(p,Math.floor(Number(g.gambitsUsedCount??g.totalActivations??g.activations??g.usedCount)||0)),d=Math.max(d,Math.floor(Number(g.secondWindSaves)||0)),r=Math.max(r,Math.floor(Number(g.firstClueSnipes??g.clueSnipes)||0)),n=Math.max(n,Math.floor(Number(g.finaleWins)||0)))}}}catch{}return{duelTotalPlayed:e,duelPlayerWins:s,srsTotalReviews:t,srsBox5Mastered:i,feedbackRatingsCount:o,offlinePacksCount:l,clueLadderStep1Snipes:r,mindGambitsActivated:p,secondWindSaves:d,finaleCategoryWins:n}}const us=[{id:"t1_first_lock",number:1,title:"First Answer Locked",description:"Lock your first correct answer in any game mode.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.totalRight,reward:{broadcastTitle:"GENEVA CHARTER INITIATE",rewardLabel:"Title: GENEVA CHARTER INITIATE"}},{id:"t1_first_peel",number:2,title:"Lifeline Tactician",description:"Use a Clue or 50/50 lifeline to crack a tough question.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.byPeelTier[2].right+a.analytics.byPeelTier[3].right},{id:"t1_first_overclock",number:3,title:"Double Down Debut",description:"Win your first 2× Double Down wager.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.overclock.overclockWins},{id:"t1_passport_stamp",number:4,title:"Contestant Badge Signed",description:"Set your Contestant Name or stamp your World Tour Passport.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.feats.passportStamped||a.passport.hasCustomName||a.passport.persona?1:0,reward:{hudThemeId:"SOVEREIGN_PLATINUM_IVORY",rewardLabel:"HUD Theme: Sovereign Platinum & Ivory"}},{id:"t1_geneva_cleared",number:5,title:"Opening Audition Cleared",description:"Complete the 4-question opening tryout round.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.feats.prologueCleared||a.passport.visas.ch?.cleared?1:0,reward:{prismFinishId:"DAMASCUS_STEEL_AMBER",rewardLabel:"Stage Finish: Damascus Steel & Amber"}},{id:"t1_first_daily",number:6,title:"Daily Show Debut",description:"Complete your first synchronized 00:00 UTC Daily Global Challenge.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:a=>Math.max(a.analytics.feats.dailyBroadcastsCompleted,a.passport.dailyHistory.length)},{id:"t1_first_briefing",number:7,title:"Topic Picker Warmup",description:"Clear 5 questions in Single Topic practice mode.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:a=>a.analytics.byMode.BRIEFING.right},{id:"t1_first_endless",number:8,title:"First Survival Checkpoint",description:"Reach Round 5 or clear 5 questions in Endless Mode.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:a=>Math.max(a.analytics.feats.maxEndlessDepth,a.analytics.byMode.ENDLESS.right)},{id:"t1_first_trials",number:9,title:"Rival Arena Contender",description:"Clear 5 questions in Head-to-Head Rival Trials.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:a=>a.analytics.byMode.TRIALS.right},{id:"t1_backstage_1",number:10,title:"Green Room Scout",description:"Complete your first Backstage rival interview.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.feats.backstageInterrogations},{id:"t1_uv_scan_1",number:11,title:"Trophy Case Inspector",description:"Inspect a trophy under UV light inside the 3D Gallery.",tier:"TIER_1_EASY",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.feats.uvScansCount},{id:"t1_atelier_equip",number:12,title:"Stage Stylist",description:"Equip a custom metallic finish in the Trophy Atelier.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.feats.atelierFinishesEquipped},{id:"t1_faction_pledge",number:13,title:"League House Pledge",description:"Choose your banner house: Sovereign, Horizon, or Agora.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.feats.factionPledged||a.blackboard?.pledgedFaction?1:0,reward:{hudThemeId:"HORIZON_ELECTRIC_CYAN",rewardLabel:"HUD Theme: Horizon Studio Cyan"}},{id:"t1_bookmark_1",number:14,title:"Aha! Moment Collector",description:"Bookmark a favorite fact debrief to your personal study deck.",tier:"TIER_1_EASY",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.passport.bookmarks.length},{id:"t2_streak_5",number:15,title:"Five in a Row",description:"Answer 5 questions correctly in a row.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"medal_tier2_sterling",target:5,measure:a=>a.analytics.bestStreak},{id:"t2_streak_10",number:16,title:"Ten-Question Hot Streak",description:"Answer 10 questions correctly in a row.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:10,measure:a=>a.analytics.bestStreak,reward:{prismFinishId:"STERLING_CHRONOMETER_RHODIUM",rewardLabel:"Stage Finish: Rhodium & Sterling"}},{id:"t2_max6x_1",number:17,title:"Full-Stakes High Roller",description:"Win a full-conviction 2× Double Down wager with zero lifelines used.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:1,measure:a=>a.analytics.overclock.max6xWins,reward:{broadcastTitle:"CONVICTION HIGH-ROLLER",rewardLabel:"Title: CONVICTION HIGH-ROLLER"}},{id:"t2_bluff_echo_1",number:18,title:"Cool-Headed Fakeout",description:"Cancel a live Double Down wager before locking in to bait a rival.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:1,measure:a=>a.analytics.feats.bluffEchoCancels},{id:"t2_call_bluff_1",number:19,title:"Bluff Buster",description:"Spot a rival tell and catch a live stage bluff.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:1,measure:a=>a.analytics.feats.rivalBluffsCaught,reward:{prismFinishId:"BLACK_SALON_CRIMSON_OBSIDIAN",broadcastTitle:"FORENSIC TELL READER",rewardLabel:"Stage Finish: Crimson Obsidian + Title: FORENSIC TELL READER"}},{id:"t2_perfect_match",number:20,title:"Clean Sweep Five",description:"Finish any 5+ question round with 100% accuracy.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"medal_tier2_sterling",target:1,measure:a=>a.analytics.feats.perfectMatchesCount},{id:"t2_act1_cleared",number:21,title:"International Qualifier",description:"Clear both London and Tokyo international tour stops.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:2,measure:a=>(a.passport.visas.gb?.cleared?1:0)+(a.passport.visas.jp?.cleared?1:0),reward:{prismFinishId:"KYOTO_URUSHI_KINTSUGI",hudThemeId:"TOKYO_VERMILION_EMBER",rewardLabel:"Stage Finish: Kyoto Kintsugi + Theme: Tokyo Vermilion"}},{id:"t2_archive_15",number:22,title:"Endless Runner XV",description:"Survive to Round 15 in Endless Mode.",tier:"TIER_2_MEDIUM",aspect:"MODES_TRIALS",emblemKey:"medal_tier2_sterling",target:15,measure:a=>a.analytics.feats.maxEndlessDepth,reward:{broadcastTitle:"ARCHIVE VAULT DELVER",rewardLabel:"Title: ARCHIVE VAULT DELVER"}},{id:"t2_calibrator_bullseye",number:23,title:"Dead-Center Dial",description:"Hit an exact bullseye on an Estimation or Pinpoint Dial.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:1,measure:a=>Math.max(a.analytics.feats.calibratorBullseyes,a.analytics.feats.pinpointBullseyes??0)},{id:"t2_codex_first_try",number:24,title:"First-Try Pairing",description:"Lock a clean first-try match pair with zero lifelines used.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:1,measure:a=>Math.max(a.analytics.feats.codexFirstTryLocks,a.analytics.feats.match4CleanSweeps??0)},{id:"t2_gauntlet_10",number:25,title:"Rapid-Fire Finisher",description:"Clear 10 Rapid-Fire or Multi-Strike questions accurately.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:10,measure:a=>Math.max(a.analytics.byArchetype.GAUNTLET_SHATTER.right,a.analytics.byFormat?.MULTI_STRIKE?.right??0)},{id:"t2_cold_instinct_10",number:26,title:"Pure Knowledge X",description:"Clear 10 questions cleanly with zero lifelines used.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:10,measure:a=>a.analytics.byPeelTier[1].right,reward:{broadcastTitle:"COLD INSTINCT SPECIALIST",rewardLabel:"Title: COLD INSTINCT SPECIALIST"}},{id:"t2_correct_25",number:27,title:"Quarter-Century Quizzer",description:"Reach 25 lifetime correct answers across all modes.",tier:"TIER_2_MEDIUM",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier2_sterling",target:25,measure:a=>a.analytics.totalRight,reward:{hudThemeId:"AGORA_BOTANICAL_EMERALD",rewardLabel:"HUD Theme: Emerald Winner Spotlight"}},{id:"t2_clues_4",number:28,title:"Case File Sleuth",description:"Uncover 4 secret backstage clues on the Evidence Board.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:4,measure:a=>a.blackboard?.unlockedEvidenceClues.length??0},{id:"t3_streak_20",number:29,title:"Twenty-Question Heater",description:"Answer 20 questions correctly in a row.",tier:"TIER_3_HARD",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:20,measure:a=>a.analytics.bestStreak,reward:{prismFinishId:"CONSUL_MALACHITE_VERDIGRIS",rewardLabel:"Stage Finish: Malachite & Bronze"}},{id:"t3_triple_6x_match",number:30,title:"Triple Double-Down Surge",description:"Win 3 full-stakes Double Down wagers inside a single match.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:1,measure:a=>a.analytics.feats.max3x6xInSingleMatch?1:0,reward:{prismFinishId:"SOLAR_OCULUS_WHITE_GOLD",rewardLabel:"Stage Finish: Solar White-Gold"}},{id:"t3_flawless_boss",number:31,title:"Untouched Champion",description:"Win a Boss Showdown without losing a single shield.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:1,measure:a=>a.analytics.feats.flawlessBossWins},{id:"t3_correct_100",number:32,title:"Century Club",description:"Reach 100 lifetime correct answers.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:100,measure:a=>a.analytics.totalRight},{id:"t3_domain_elo_1500",number:33,title:"Domain Specialist",description:"Reach 1500 Skill Rating in any trivia domain.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:1500,measure:a=>ds(a),reward:{broadcastTitle:"CONSUL OF THE TWELVE",rewardLabel:"Title: CONSUL OF THE TWELVE"}},{id:"t3_relics_4",number:34,title:"Four-City Trophy Holder",description:"Collect 4 Regional Championship trophies for your Gallery.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:4,measure:a=>wt(a),reward:{broadcastTitle:"RELIC ARCHIVIST SUPREME",rewardLabel:"Title: RELIC ARCHIVIST SUPREME"}},{id:"t3_archive_50",number:35,title:"Endless Marathon L",description:"Survive to Round 50 in Endless Mode.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:50,measure:a=>a.analytics.feats.maxEndlessDepth,reward:{hudThemeId:"CAIRO_SOLAR_AMBER",rewardLabel:"HUD Theme: Cairo Pavilion Solar Amber"}},{id:"t3_ghost_win_1",number:36,title:"Duel Victor",description:"Defeat a recorded Challenger in Head-to-Head Rival Trials.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:1,measure:a=>a.analytics.feats.ghostTrialWins,reward:{broadcastTitle:"BLACK SALON SHARK",rewardLabel:"Title: BLACK SALON SHARK"}},{id:"t3_fast_under3s_15",number:37,title:"Lightning Buzzer",description:"Lock 15 correct answers in under 3.0 seconds each.",tier:"TIER_3_HARD",aspect:"STREAK_SPEED",emblemKey:"medal_tier3_gold",target:15,measure:a=>a.analytics.speedBuckets[0].right},{id:"t3_all_12_domains_1",number:38,title:"All-Twelve Polymath",description:"Answer at least 1 question correctly in all 12 trivia domains.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:12,measure:a=>a.analytics.byDomain.filter(e=>e.right>=1).length,reward:{prismFinishId:"IMPERIAL_EMERALD_BRASS",rewardLabel:"Stage Finish: Imperial Emerald & Brass"}},{id:"t3_daily_5",number:39,title:"Daily Show Regular",description:"Complete 5 Daily Global Challenges.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:5,measure:a=>Math.max(a.analytics.feats.dailyBroadcastsCompleted,a.passport.dailyHistory.length)},{id:"t3_hero_synth_3",number:40,title:"Finale Chain Master",description:"Clear 3 multi-step Championship Finale chain clues.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier3_gold",target:3,measure:a=>a.analytics.byArchetype.HERO_ARTIFACT_SYNTHESIS.right},{id:"t3_backstage_6",number:41,title:"Studio Insider",description:"Complete 6 Backstage rival interviews across the World Tour.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:6,measure:a=>a.analytics.feats.backstageInterrogations},{id:"t3_visas_5",number:42,title:"World Tour Globetrotter",description:"Earn 5 International Tour Stamps in your Passport.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:5,measure:a=>Math.max(cs(a.passport),a.analytics.feats.worldTourTiersCleared??0),reward:{prismFinishId:"PHARAONIC_LAPIS_ELECTRUM",rewardLabel:"Stage Finish: Pharaonic Lapis & Electrum"}},{id:"t4_streak_35",number:43,title:"Thirty-Five Unbroken",description:"Answer 35 questions correctly in a row.",tier:"TIER_4_VERY_RARE",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:35,measure:a=>a.analytics.bestStreak,reward:{prismFinishId:"ARBITER_SMOKED_SAPPHIRE_PLATINUM",rewardLabel:"Stage Finish: Smoked Sapphire & Platinum"}},{id:"t4_soren_coin_defeat",number:44,title:"Master Bluff Hunter",description:"Read Soren Kael’s coin tell and beat him, or catch 3 live rival bluffs.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:3,measure:a=>a.analytics.feats.sorenCoinBluffDefeated?3:a.analytics.feats.rivalBluffsCaught},{id:"t4_campaign_complete",number:45,title:"World Tour Finisher",description:"Complete the World Tour Campaign Finale.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:1,measure:a=>a.analytics.feats.campaignCompleted||a.analytics.feats.worldSmartestChampionWon||a.passport.visas.global?.cleared||(a.blackboard?.achievedEndings.length??0)>0?1:0,reward:{broadcastTitle:"FIRST CITIZEN ARBITER",rewardLabel:"Title: FIRST CITIZEN ARBITER"}},{id:"t4_all_8_relics_24_latches",number:46,title:"Grand Vault Curator",description:"Collect all 8 Championship trophies and unlock all 24 display latches.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:24,measure:a=>wt(a)>=8?a.analytics.feats.openedLatchKeys.length:Math.min(23,a.analytics.feats.openedLatchKeys.length)},{id:"t4_correct_500_acc80",number:47,title:"High Accuracy Laureate",description:"Reach 500 lifetime correct answers while holding 80%+ accuracy.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier4_sapphire",target:500,measure:a=>{const e=a.analytics.totalRight+a.analytics.totalWrong;return(e>0?a.analytics.totalRight/e:0)>=.8?a.analytics.totalRight:Math.min(499,a.analytics.totalRight)}},{id:"t4_six_domains_1750",number:48,title:"Six-Domain Ace",description:"Reach 1750+ Skill Rating across at least 6 trivia domains.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:6,measure:a=>xt(a,1750),reward:{hudThemeId:"REYKJAVIK_BOREALIS_VIOLET",rewardLabel:"HUD Theme: Borealis Stage Violet-Teal"}},{id:"t4_archive_100",number:49,title:"Centurion of Endless",description:"Survive to Round 100 in Endless Mode.",tier:"TIER_4_VERY_RARE",aspect:"MODES_TRIALS",emblemKey:"medal_tier4_sapphire",target:100,measure:a=>a.analytics.feats.maxEndlessDepth},{id:"t4_black_salon_champ",number:50,title:"High-Stakes Knockout Champion",description:"Win an underground High-Stakes Knockout match.",tier:"TIER_4_VERY_RARE",aspect:"MODES_TRIALS",emblemKey:"medal_tier4_sapphire",target:1,measure:a=>a.analytics.feats.blackSalonWins},{id:"t4_overclock_wins_50",number:51,title:"Fiftyfold High Roller",description:"Win 50 2× Double Down wagers.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:50,measure:a=>a.analytics.overclock.overclockWins},{id:"t4_cold_instinct_100",number:52,title:"Hundredfold Pure Instinct",description:"Clear 100 questions cleanly with zero lifelines used.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier4_sapphire",target:100,measure:a=>a.analytics.byPeelTier[1].right},{id:"t4_clues_12",number:53,title:"Mystery Unmasked",description:"Collect all 12 Backstage Clues on the Evidence Board.",tier:"TIER_4_VERY_RARE",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier4_sapphire",target:12,measure:a=>a.blackboard?.unlockedEvidenceClues.length??0,reward:{prismFinishId:"AURORA_DICHROIC_TITANIUM",rewardLabel:"Stage Finish: Aurora Dichroic Titanium"}},{id:"t4_bullseyes_10",number:54,title:"Master Pinpoint Ace",description:"Land 10 exact bullseyes on Estimation or Pinpoint Dials.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier4_sapphire",target:10,measure:a=>Math.max(a.analytics.feats.calibratorBullseyes,a.analytics.feats.pinpointBullseyes??0)},{id:"t5_unpeeled_sovereign",number:55,title:"No-Lifeline Sovereign",description:"Win a Boss Showdown with zero lifelines used — 100% pure knowledge!",tier:"TIER_5_MYTHIC",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier5_mythic",target:1,measure:a=>a.analytics.feats.unpeeledBossWins,reward:{prismFinishId:"CELESTIAL_DIAMOND_SOVEREIGN",broadcastTitle:"UNPEELED SOVEREIGN",rewardLabel:"Mythic Finish: Celestial Diamond + Title: UNPEELED SOVEREIGN"}},{id:"t5_horological_perfection",number:56,title:"Fiftyfold Perfection",description:"Answer 50 consecutive questions without a single miss.",tier:"TIER_5_MYTHIC",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:50,measure:a=>a.analytics.bestStreak,reward:{prismFinishId:"CELESTIAL_DIAMOND_SOVEREIGN",rewardLabel:"Mythic Finish: Celestial Diamond & 24K"}},{id:"t5_polymath_supreme",number:57,title:"Polymath Supreme",description:"Reach 1850+ Genius Skill Rating across ALL 12 trivia domains.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:12,measure:a=>xt(a,1850),reward:{broadcastTitle:"POLYMATH SUPREME",rewardLabel:"Mythic Title: POLYMATH SUPREME"}},{id:"t5_6x_russian_roulette",number:58,title:"Five-Straight All-In",description:"Win 5 consecutive full-stakes Double Down wagers without a miss.",tier:"TIER_5_MYTHIC",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:5,measure:a=>a.analytics.overclock.bestConsecutiveMax6xWins},{id:"t5_lightning_savant",number:59,title:"Lightning Buzzer Savant",description:"Lock 10 consecutive correct answers each in under 3.0 seconds.",tier:"TIER_5_MYTHIC",aspect:"STREAK_SPEED",emblemKey:"medal_tier5_mythic",target:10,measure:a=>a.analytics.bestFastUnder3sStreak,reward:{hudThemeId:"MYTHIC_PRISMATIC_DIAMOND",rewardLabel:"Mythic HUD Theme: Celestial Diamond"}},{id:"t5_architect_succession",number:60,title:"Secret Finale Unlocked",description:"Uncover all 12 Backstage Clues and unlock the Secret 4th Ending.",tier:"TIER_5_MYTHIC",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier5_mythic",target:2,measure:a=>{const e=(a.blackboard?.unlockedEvidenceClues.length??0)>=12?1:0,s=a.blackboard?.achievedEndings.includes("ARCHITECT_SUCCESSION")||a.analytics.feats.achievedEndings.includes("ARCHITECT_SUCCESSION")?1:0;return e+s}},{id:"t5_meridian_leviathan",number:61,title:"Endless Legend CC",description:"Survive all the way to Round 200 in Endless Mode.",tier:"TIER_5_MYTHIC",aspect:"MODES_TRIALS",emblemKey:"medal_tier5_mythic",target:200,measure:a=>a.analytics.feats.maxEndlessDepth},{id:"t5_fourfold_destiny",number:62,title:"Fourfold Ending Master",description:"Unlock all 4 World Tour endings across replays.",tier:"TIER_5_MYTHIC",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier5_mythic",target:4,measure:a=>new Set([...a.blackboard?.achievedEndings??[],...a.analytics.feats.achievedEndings]).size},{id:"t5_centurion_million",number:63,title:"One Thousand Unique Facts",description:"Answer 1,000 unique verified trivia questions correctly.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:1e3,measure:a=>a.analytics.uniqueSolvedCount},{id:"t5_grand_completionist",number:64,title:"Core Hall Completionist",description:"Unlock all 63 Core Trophies & Medals (#1–#63) in the Hall of Honours.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier5_mythic",target:63,measure:()=>0}],ms=[{id:"v2_diff_middle_school",number:65,packId:"v2.0",title:"Honor Roll Foundations",description:"Complete a calibrated Middle School difficulty round.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.analytics.feats.difficultyRoundsCleared?.MIDDLE_SCHOOL??0},{id:"v2_diff_high_school",number:66,packId:"v2.0",title:"Varsity Letterman",description:"Achieve 80% or higher accuracy on a High School difficulty round.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:80,measure:a=>a.analytics.feats.difficultyBestAccuracyPct?.HIGH_SCHOOL??0,reward:{broadcastTitle:"VARSITY SCHOLAR",rewardLabel:"Title: VARSITY SCHOLAR"}},{id:"v2_diff_college",number:67,packId:"v2.0",title:"Dean's List Summa Cum Laude",description:"Achieve 85% or higher accuracy on a College difficulty round.",tier:"TIER_2_MEDIUM",aspect:"MODES_TRIALS",emblemKey:"medal_tier2_sterling",target:85,measure:a=>a.analytics.feats.difficultyBestAccuracyPct?.COLLEGE??0,reward:{broadcastTitle:"DEAN'S LIST FELLOW",rewardLabel:"Title: DEAN'S LIST FELLOW"}},{id:"v2_diff_graduate",number:68,packId:"v2.0",title:"Doctoral Defense",description:"Achieve 80% or higher accuracy on a Graduate difficulty round.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:80,measure:a=>a.analytics.feats.difficultyBestAccuracyPct?.GRADUATE??0,reward:{hudThemeId:"MENSA_OBSIDIAN_ULTRAVIOLET",rewardLabel:"HUD Theme: Mensa Obsidian Ultraviolet"}},{id:"v2_diff_mensa",number:69,packId:"v2.0",title:"Mensa 99th-Percentile Laureate",description:"Achieve 80% or higher accuracy on a Mensa Grandmaster round.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier4_sapphire",target:80,measure:a=>a.analytics.feats.difficultyBestAccuracyPct?.MENSA??0,reward:{broadcastTitle:"MENSA GRANDMASTER",prismFinishId:"MENSA_QUANTUM_IRIDIUM_GLASS",rewardLabel:"Title: MENSA GRANDMASTER + Finish: Quantum Iridium"}},{id:"v2_globe_first_pin",number:70,packId:"v2.0",title:"First Map Pinpoint",description:"Win your first World Map Pin-Drop geography challenge.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_polymath_globe",target:1,measure:a=>a.analytics.byArchetype.GLOBE_PIN_DROP?.right??0},{id:"v2_globe_bullseye_300",number:71,packId:"v2.0",title:"Map Bullseye Sharpshooter",description:"Drop a Map Pin within 300 km of the target for a Bullseye Pinpoint.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_polymath_globe",target:1,measure:a=>a.analytics.feats.globeBullseyes300Km??0,reward:{hudThemeId:"CARTOGRAPHER_MERCATOR_GOLD",rewardLabel:"HUD Theme: World Atlas Mercator Gold"}},{id:"v2_globe_royal_cartographer",number:72,packId:"v2.0",title:"Royal Cartographer",description:"Win 5 World Map Pin-Drop challenges across the world tour.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:5,measure:a=>a.analytics.byArchetype.GLOBE_PIN_DROP?.right??0,reward:{broadcastTitle:"ROYAL CARTOGRAPHER",rewardLabel:"Title: ROYAL CARTOGRAPHER"}},{id:"v2_globe_zero_lat_surveyor",number:73,packId:"v2.0",title:"No-Lifeline Grand Surveyor",description:"Land a zero-lifeline World Map Pin-Drop Bullseye within 120 km.",tier:"TIER_4_VERY_RARE",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier4_sapphire",target:1,measure:a=>a.analytics.feats.globeNoPeel120Km??0},{id:"v2_visual_sapphire_analyst",number:74,packId:"v2.0",title:"Visual Spotter Debut",description:"Solve your first illustrated Visual Spotter diagram question.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:a=>Math.max(a.analytics.feats.visualBlueprintsSolved??0,a.analytics.byFormat?.VISUAL_SPOTTER?.right??0),reward:{hudThemeId:"BLUEPRINT_SAPPHIRE_DRAFT",rewardLabel:"HUD Theme: Sapphire Visual Stage"}},{id:"v2_visual_master_architect",number:75,packId:"v2.0",title:"Master Visual Analyst",description:"Solve 10 Visual Spotter questions across science, sports & landmarks.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier3_gold",target:10,measure:a=>Math.max(a.analytics.feats.visualBlueprintsSolved??0,a.analytics.byFormat?.VISUAL_SPOTTER?.right??0),reward:{prismFinishId:"SAPPHIRE_BLUEPRINT_CYANOTYPE",rewardLabel:"3D Finish: Sapphire Blueprint Cyanotype"}},{id:"v2_jeopardy_lateral_virtuoso",number:76,packId:"v2.0",title:"Six-Domain Cold Streak",description:"Clear 25 questions with zero lifelines spanning at least 6 domains.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:25,measure:a=>{const e=a.analytics.byPeelTier[1]?.right??0;return(a.analytics.feats.tier1ColdDomains?.length??0)>=6?e:Math.min(24,e)}},{id:"v2_duel_gauntlet_thrown",number:77,packId:"v2.0",title:"Gauntlet Thrown",description:"Issue or compete in a 1-Tap Head-to-Head Duel Link challenge.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.v2Stores.duelTotalPlayed},{id:"v2_duel_ghost_breaker",number:78,packId:"v2.0",title:"Duel Split Breaker",description:"Defeat a Challenger Ghost in a Head-to-Head 1v1 Duel.",tier:"TIER_2_MEDIUM",aspect:"MODES_TRIALS",emblemKey:"medal_tier2_sterling",target:1,measure:a=>a.v2Stores.duelPlayerWins,reward:{prismFinishId:"DUELIST_BLOODSTONE_PLATINUM",rewardLabel:"3D Finish: Duelist Bloodstone & Platinum"}},{id:"v2_duel_rival_nemesis",number:79,packId:"v2.0",title:"Undisputed Rival Nemesis",description:"Claim 5 Head-to-Head 1v1 Duel victories against Challengers.",tier:"TIER_3_HARD",aspect:"MODES_TRIALS",emblemKey:"medal_tier3_gold",target:5,measure:a=>a.v2Stores.duelPlayerWins},{id:"v2_srs_vault_initiate",number:80,packId:"v2.0",title:"Study Deck Initiate",description:"Complete your first review in the 5-Box Spaced-Repetition Study Deck.",tier:"TIER_1_EASY",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.v2Stores.srsTotalReviews},{id:"v2_srs_box5_polymath",number:81,packId:"v2.0",title:"Box-5 Mastery Polymath",description:"Promote 5 missed cards to Box 5 Mastered in your Study Deck.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:5,measure:a=>a.v2Stores.srsBox5Mastered,reward:{prismFinishId:"NEURAL_ENGRAM_AMETHYST_GOLD",rewardLabel:"3D Finish: Neural Engram Amethyst & 24K"}},{id:"v2_editorial_arbiter",number:82,packId:"v2.0",title:"Editorial Arbiter",description:"Submit 5 question quality ratings (Upvote or Flag) to help curate trivia.",tier:"TIER_2_MEDIUM",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier2_sterling",target:5,measure:a=>a.v2Stores.feedbackRatingsCount},{id:"v2_jetsetter_offline_vault",number:83,packId:"v2.0",title:"Offline Travel Pack",description:"Save an Offline Pack so you can play anywhere without Wi-Fi.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.v2Stores.offlinePacksCount},{id:"v2_omniscient_mensa_polymath",number:84,packId:"v2.0",title:"Omniscient Mensa Polymath",description:"Win across all 12 trivia domains, score 80%+ in Mensa tier, and master a Box-5 review card.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier5_mythic",target:14,measure:a=>{const e=ps(a),s=(a.analytics.feats.difficultyBestAccuracyPct?.MENSA??0)>=80?1:0,t=a.v2Stores.srsBox5Mastered>=1?1:0;return e+s+t},reward:{broadcastTitle:"SOVEREIGN OMNISCIENT",rewardLabel:"Mythic Title: SOVEREIGN OMNISCIENT"}}],fs=[{id:"v3_clue_ladder_first_snipe",number:85,packId:"v3.0",title:"First-Clue Sharpshooter",description:"Solve a 3-Clue Escalator question on Clue 1 (3× payout) without extra clues.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:a=>a.v2Stores.clueLadderStep1Snipes},{id:"v3_clue_ladder_apex_sniper",number:86,packId:"v3.0",title:"Apex Clue Sniper",description:"Land 5 Clue-1 solves on 3-Clue Escalator questions in any game mode.",tier:"TIER_3_HARD",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:5,measure:a=>a.v2Stores.clueLadderStep1Snipes},{id:"v3_mind_gambit_tactician",number:87,packId:"v3.0",title:"Power-Up Tactician",description:"Activate a Tactical Mind Gambit (Second Wind, Swap, or Surge) in a live match.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:1,measure:a=>Math.max(a.v2Stores.mindGambitsActivated,a.v2Stores.secondWindSaves)},{id:"v3_mind_gambit_grandmaster",number:88,packId:"v3.0",title:"Grandmaster of Gambits",description:"Activate 5 Tactical Gambits or win 3 Finale Category Picker showdowns.",tier:"TIER_3_HARD",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier3_gold",target:5,measure:a=>Math.max(a.v2Stores.mindGambitsActivated,Math.min(5,a.v2Stores.finaleCategoryWins*2))}],gs=[{id:"v4_match4_clean_sweep",number:89,packId:"v4.0",title:"Match-4 Clean Sweep",description:"Pair all 4 clues without a single mismatch in a Match-4 round.",tier:"TIER_1_EASY",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier1_bronze",target:1,measure:a=>Math.max(a.analytics.feats.match4CleanSweeps??0,a.analytics.byFormat?.MATCH_4?.right??0)},{id:"v4_match4_virtuoso",number:90,packId:"v4.0",title:"Grand Match-4 Virtuoso",description:"Pull off 5 spotless Match-4 Clean Sweeps across any mode.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier3_gold",target:5,measure:a=>a.analytics.feats.match4CleanSweeps??0},{id:"v4_sort4_timeline_master",number:91,packId:"v4.0",title:"Timeline Sort-4 Master",description:"Place all 4 cards in exact chronological or ranked order on 3 Sort-4 rounds.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:3,measure:a=>Math.max(a.analytics.feats.sort4PerfectRuns??0,a.analytics.byFormat?.SORT_4?.right??0)},{id:"v4_imposter_detective",number:92,packId:"v4.0",title:"Imposter Detective",description:"Expose the hidden imposter or sweep every true clue across 3 Multi-Strike rounds.",tier:"TIER_2_MEDIUM",aspect:"PRISM_OVERCLOCK",emblemKey:"medal_tier2_sterling",target:3,measure:a=>Math.max(a.analytics.feats.imposterCatches??0,a.analytics.byFormat?.MULTI_STRIKE?.right??0)},{id:"v4_pinpoint_bullseye",number:93,packId:"v4.0",title:"Pinpoint Bullseye",description:"Hit 3 exact 2× bullseyes on the Pinpoint Dial.",tier:"TIER_2_MEDIUM",aspect:"STREAK_SPEED",emblemKey:"trophy_streak_chronometer",target:3,measure:a=>Math.max(a.analytics.feats.pinpointBullseyes??0,a.analytics.feats.calibratorBullseyes??0),reward:{hudThemeId:"STUDIO_SPOTLIGHT_GOLD",rewardLabel:"Stage Theme: Prime-Time Spotlight Gold"}},{id:"v4_padlock_breaker",number:94,packId:"v4.0",title:"Padlock Breaker",description:"Shatter 5 locked vault tiles by solving adjacent clues on the show board.",tier:"TIER_1_EASY",aspect:"MODES_TRIALS",emblemKey:"medal_tier1_bronze",target:5,measure:a=>a.analytics.feats.padlocksShattered??0},{id:"v4_power_play_high_roller",number:95,packId:"v4.0",title:"Power Play High Roller",description:"Win 3 high-stakes Power Play wagers on the game-show board.",tier:"TIER_3_HARD",aspect:"PRISM_OVERCLOCK",emblemKey:"trophy_overclock_roulette",target:3,measure:a=>Math.max(a.analytics.feats.powerPlayBigWagerWins??0,a.analytics.feats.powerPlayWins??0),reward:{broadcastTitle:"POWER PLAY HIGH ROLLER",rewardLabel:"Title: POWER PLAY HIGH ROLLER"}},{id:"v4_challenger_trap_survivor",number:96,packId:"v4.0",title:"Trap Breaker",description:"Survive and win 3 Challenger weak-spot forced turns or frozen-column ambushes.",tier:"TIER_3_HARD",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier3_gold",target:3,measure:a=>a.analytics.feats.challengerTrapSurvivals??0},{id:"v4_six_wedge_crown",number:97,packId:"v4.0",title:"Six-Wedge Trivial Crown",description:"Collect all 6 colored category wedges on a single championship show board.",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"trophy_polymath_globe",target:1,measure:a=>a.analytics.feats.full6WedgeCrowns??0,reward:{hudThemeId:"SIX_WEDGE_PRISM_CROWN",rewardLabel:"Crown Theme: Six-Wedge Championship Crown"}},{id:"v4_seven_format_showstopper",number:98,packId:"v4.0",title:"Seven-Format Showstopper",description:"Win at least one question in all 7 formats (4-Choice, Match-4, Sort-4, Multi-Strike, Pinpoint, 3-Clue, Visual).",tier:"TIER_4_VERY_RARE",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier4_sapphire",target:7,measure:a=>Ne.filter(e=>(a.analytics.byFormat?.[e]?.right??0)>=1).length},{id:"v4_worlds_smartest_champion",number:99,packId:"v4.0",title:"1.4 Billion World's Smartest Champion",description:"Win the Tier 8 Global Finale in front of 1.4 billion viewers to claim the $10,000,000 crown.",tier:"TIER_5_MYTHIC",aspect:"CAMPAIGN_LORE",emblemKey:"medal_tier5_mythic",target:1,measure:a=>a.analytics.feats.worldSmartestChampionWon||(a.analytics.feats.worldTourTiersCleared??0)>=8||a.analytics.feats.campaignCompleted||a.passport.visas.global?.cleared?1:0,reward:{broadcastTitle:"WORLD'S SMARTEST CHAMPION",rewardLabel:"Mythic Title: WORLD'S SMARTEST CHAMPION"}},{id:"v4_centennial_hall_legend",number:100,packId:"v4.0",title:"Centennial Hall Legend",description:"Unlock 75 total Trophies & Medals across the 100-Trophy Hall of Honours.",tier:"TIER_5_MYTHIC",aspect:"DOMAINS_POLYMATH",emblemKey:"medal_tier5_mythic",target:75,measure:()=>0}],bs=[{packId:"v1.0",label:"Core Show Floor Honours",honours:us},{packId:"v2.0",label:"Difficulty Ladder, Atlas & Duels Expansion",honours:ms},{packId:"v3.0",label:"Clue Escalator & Tactical Gambits Expansion",honours:fs},{packId:"v4.0",label:"World's Smartest v4.0 7-Format & Gimmick Board Expansion",honours:gs}],Oe=bs.flatMap(a=>a.honours),Ds=Oe;function Kt(){return Oe.length}function zt(){return G.length+J.length+z.length}class ys{analyticsStore;passport;blackboard;unlockedTimestamps;constructor(e,s,t){this.analyticsStore=e,this.passport=s,this.blackboard=t,this.unlockedTimestamps=this.load();const i=Je();i.id!=="GENEVA_CHAMPAGNE_24K"&&qt(i.id),this.evaluateAndUnlock(!0)}load(){try{if(typeof localStorage>"u")return{};const e=localStorage.getItem(vt);if(!e)return{};const s=JSON.parse(e);if(s?.unlockedTimestamps&&typeof s.unlockedTimestamps=="object")return{...s.unlockedTimestamps}}catch{}return{}}save(){try{if(typeof localStorage<"u"){const e={unlockedTimestamps:this.unlockedTimestamps};localStorage.setItem(vt,JSON.stringify(e))}}catch{}}applyRewardGrant(e){const s=e.reward;s&&(s.prismFinishId&&La(s.prismFinishId),s.broadcastTitle&&this.passport.unlockTitleCrest(s.broadcastTitle,!1),s.hudThemeId&&ns(s.hudThemeId))}buildEvaluationContext(){const e=this.analyticsStore.getSnapshot();return{analytics:e,passport:this.passport.getSnapshot(),blackboard:this.blackboard?.getSnapshot()??null,v2Stores:hs(e)}}evaluateAndUnlock(e=!1){const s=this.buildEvaluationContext(),t=[],i=new Date().toISOString();let o=!1,l=0,r=0,p=null,d=null;for(const n of Oe){if(n.id==="t5_grand_completionist"){p=n;continue}if(n.id==="v4_centennial_hall_legend"){d=n;continue}const m=Math.max(0,Math.floor(n.measure(s))),c=!!this.unlockedTimestamps[n.id];(c||m>=n.target)&&(n.number>=1&&n.number<=63&&(l+=1),r+=1,c?this.applyRewardGrant(n):(this.unlockedTimestamps[n.id]=i,this.applyRewardGrant(n),o=!0,e||t.push(this.buildProgressItem(n,n.target))))}if(p){const n=!!this.unlockedTimestamps[p.id];(n||l>=p.target)&&(r+=1,n||(this.unlockedTimestamps[p.id]=i,this.applyRewardGrant(p),o=!0,e||t.push(this.buildProgressItem(p,p.target))))}if(d){const n=!!this.unlockedTimestamps[d.id];(n||r>=d.target)&&(n||(this.unlockedTimestamps[d.id]=i,this.applyRewardGrant(d),o=!0,e||t.push(this.buildProgressItem(d,d.target))))}return o&&this.save(),t}buildProgressItem(e,s){const t=this.unlockedTimestamps[e.id]??null,i=t!==null,o=i?e.target:Math.min(e.target,Math.max(0,Math.floor(s)));return{def:e,unlocked:i,unlockedAtIso:t,current:o,target:e.target,ratio:e.target>0?Math.min(1,o/e.target):1,emblemPngUrl:`./assets/medals/${e.emblemKey}.png`,emblemFallbackDataUri:ls(e.emblemKey)}}getAllProgress(){const e=this.buildEvaluationContext();let s=0,t=0;const i=[];for(const r of Oe){if(r.id==="t5_grand_completionist"||r.id==="v4_centennial_hall_legend"){i.push(this.buildProgressItem(r,0));continue}const p=this.buildProgressItem(r,r.measure(e));p.unlocked&&(t+=1,r.number>=1&&r.number<=63&&(s+=1)),i.push(p)}const o=i.findIndex(r=>r.def.id==="t5_grand_completionist");if(o>=0){const r=this.buildProgressItem(i[o].def,s);i[o]=r,r.unlocked&&(t+=1)}const l=i.findIndex(r=>r.def.id==="v4_centennial_hall_legend");return l>=0&&(i[l]=this.buildProgressItem(i[l].def,t)),i}}function vs(a){return a==="TROPHIES_64"||a==="TROPHIES"}class ws{deps;modalBackdrop=null;mountedContainer=null;detachEscape=null;callbacks={};activeTab="TROPHIES_64";tierFilter="ALL";aspectFilter="ALL";contextLabel=null;trophy3DDockActive=!1;trophyReqToken=0;constructor(e){this.deps=e,le()}isOpen(){return this.modalBackdrop!==null||this.mountedContainer!==null}open(e={}){this.close(),this.callbacks=e,this.activeTab=e.initialTab??"TROPHIES_64",this.tierFilter=e.initialTierFilter??"ALL",this.aspectFilter=e.initialAspectFilter??"ALL",this.contextLabel=e.initialContextLabel?.trim()||null,this.trophy3DDockActive=!1,this.deps.honoursSystem.evaluateAndUnlock(!0);const s=document.createElement("div");s.className="ws-meta-backdrop",s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label",`Hall of Honours — ${Kt()} Trophies & ${zt()} Unlockables`),s.addEventListener("click",t=>{t.target===s&&!this.trophy3DDockActive&&this.handleClose()}),document.body.appendChild(s),this.modalBackdrop=s,this.detachEscape=ne(()=>this.handleBackOrClose()),this.renderInto(s,!0)}mount(e,s={}){this.unmount(),this.callbacks=s,this.activeTab=s.initialTab??"TROPHIES_64",this.tierFilter=s.initialTierFilter??"ALL",this.aspectFilter=s.initialAspectFilter??"ALL",this.contextLabel=s.initialContextLabel?.trim()||null,this.deps.honoursSystem.evaluateAndUnlock(!0),this.mountedContainer=e,this.renderInto(e,!1)}unmount(){this.trophyReqToken+=1,this.detachEscape&&(this.detachEscape(),this.detachEscape=null),this.syncUiRootVisibility(!1),this.mountedContainer&&(this.mountedContainer.innerHTML="",this.mountedContainer=null)}close(){this.unmount(),this.modalBackdrop&&(this.modalBackdrop.remove(),this.modalBackdrop=null)}syncUiRootVisibility(e){if(typeof document>"u")return;document.documentElement.classList.toggle("ws-3d-showcase-open",e);const s=document.getElementById("ui-root");s&&(s.style.visibility=e?"hidden":"visible")}async toggle3DTrophyShowcase(){this.trophy3DDockActive=!this.trophy3DDockActive;const e=++this.trophyReqToken;this.rerender(),this.trophy3DDockActive&&this.deps.stage3d&&(await this.deps.stage3d.showChampionshipTrophy(0),e!==this.trophyReqToken||this.isOpen())}handleBackOrClose(){if(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.canGoBack&&this.callbacks.onBack){this.callbacks.onBack();return}this.handleClose()}handleClose(){this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap");const e=this.callbacks.onClose;this.close(),e?.()}rerender(){this.modalBackdrop?(this.modalBackdrop.className=this.trophy3DDockActive?"ws-meta-backdrop is-stage-dock":"ws-meta-backdrop",this.syncUiRootVisibility(this.trophy3DDockActive),this.renderInto(this.modalBackdrop,!0)):this.mountedContainer&&this.renderInto(this.mountedContainer,!1)}renderInto(e,s){const t=this.deps.honoursSystem.getAllProgress(),i=t.length,o=t.filter(x=>x.unlocked).length,l=ze(this.deps.passport,this.deps.blackboard),r=this.deps.passport.getSnapshot(),p=Ut(),d=l.length,n=J.length,m=z.length,c=d+n+m,u=J.filter(x=>x.order===1||r.titleCrests.includes(x.title)).length,y=l.filter(x=>x.unlocked).length+u+p.length,w=vs(this.activeTab),g=`
      <div class="ws-meta-underline-tabs" role="tablist" aria-label="Hall of Honours Sections">
        <button type="button" role="tab" aria-selected="${w}" class="ws-meta-underline-tab ${w?"is-active":""}" data-honours-tab="TROPHIES_64">
          ${i} Trophies (${o}/${i})
        </button>
        <button type="button" role="tab" aria-selected="${!w}" class="ws-meta-underline-tab ${w?"":"is-active"}" data-honours-tab="UNLOCKABLES_32">
          ${c} Rewards (${y}/${c})
        </button>
      </div>
    `,v=w?this.renderTrophiesGrid(t):this.renderUnlockablesStudio(l,r.titleCrests,r.activeTitleCrest,p);if(s&&this.trophy3DDockActive){const x=j("HONOURS",{isModal:!0,closeBtnId:"ws-honours-close",canNavigate:!!this.callbacks.onNavigateSection,floatingVariant:!0});e.innerHTML=`
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
          ${g}
          <div class="ws-meta-body-scroll">
            ${v}
          </div>
        </div>
      `,this.bindEvents(e);return}const f=j("HONOURS",{isModal:s,closeBtnId:"ws-honours-close",canNavigate:!!this.callbacks.onNavigateSection});e.innerHTML=`
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-honours-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">HONOURS</h2>
              <div class="ws-meta-eyebrow">${o}/${i} Trophies · ${y}/${c} Rewards</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${this.deps.stage3d&&s?'<button type="button" class="ws-meta-vault-btn" id="ws-honours-3d-toggle" aria-label="Toggle 3D Trophy Showcase">◈ 3D</button>':""}
            ${f}
          </div>
        </div>

        ${g}

        <div class="ws-meta-body-scroll">
          ${v}
        </div>
      </div>
    `,this.bindEvents(e)}renderTrophiesGrid(e){const s=e.filter(i=>!(this.tierFilter!=="ALL"&&i.def.tier!==this.tierFilter||this.aspectFilter!=="ALL"&&i.def.aspect!==this.aspectFilter)),t=this.tierFilter!=="ALL"||this.aspectFilter!=="ALL";return`
      <!-- Single-Line Horizontal Scrollable Tier & Aspect Filters (Zero Boxed Filter Cards!) -->
      <div class="ws-meta-section" style="padding-top:0;gap:7px;" data-honours-active-aspect="${this.aspectFilter}" data-honours-active-tier="${this.tierFilter}">
        ${t||this.contextLabel?`<div id="ws-honours-context-bar" class="ws-meta-note" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;padding:6px 0 6px 12px;">
                <span style="font-family:var(--font-mono);font-size:11px;color:var(--ivory-primary);">
                  ◆ ${this.contextLabel?`Related to ${h(this.contextLabel)} · `:""}Showing <strong>${s.length}</strong> of ${e.length} Trophies
                </span>
                <button type="button" class="ws-meta-inline-link" id="ws-honours-clear-filters" style="min-height:44px;padding:0 8px;">
                  ✕ Show All ${e.length}
                </button>
              </div>`:""}
        <div class="ws-meta-hscroll" aria-label="Filter by Rarity Tier">
          ${[["ALL",`All ${e.length}`],["TIER_1_EASY","Bronze"],["TIER_2_MEDIUM","Sterling"],["TIER_3_HARD","24K Gold"],["TIER_4_VERY_RARE","Sapphire"],["TIER_5_MYTHIC","Mythic 0.1%"]].map(([i,o])=>`
                <button type="button" class="ws-meta-chip ${this.tierFilter===i?"is-active":""}" data-tier-filter="${i}">
                  ${o}
                </button>
              `).join("")}
        </div>

        <div class="ws-meta-hscroll" aria-label="Filter by Aspect">
          ${[["ALL","All Aspects"],["PRISM_OVERCLOCK","Formats & Wagers"],["STREAK_SPEED","Streak & Speed"],["CAMPAIGN_LORE","World Tour & Rivals"],["MODES_TRIALS","Modes & Boards"],["DOMAINS_POLYMATH","12 Domains"]].map(([i,o])=>`
                <button type="button" class="ws-meta-chip ${this.aspectFilter===i?"is-active":""}" data-aspect-filter="${i}">
                  ${o}
                </button>
              `).join("")}
        </div>
      </div>

      <!-- Hairline-Divided Trophy List / 2-Column Wide Grid (Zero Nested Boxes!) -->
      <div class="ws-meta-section" style="border-bottom:none;padding-top:4px;gap:0;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:0 22px;">
          ${s.map(i=>{const o=Gt[i.def.tier],l=i.unlocked?"✓ EARNED":`${Math.round(i.current)} / ${Math.round(i.target)}`;return`
                <div data-trophy-id="${h(i.def.id)}" style="display:flex;gap:11px;align-items:flex-start;padding:12px 4px;border-bottom:1px solid rgba(255,255,255,0.07);${i.unlocked?`box-shadow:inset 3px 0 0 ${o.colorHex};padding-left:10px;background:rgba(255,255,255,0.02);`:""}">
                  <img
                    src="${h(i.emblemPngUrl)}"
                    data-fallback-src="${h(i.emblemFallbackDataUri)}"
                    alt=""
                    style="width:42px;height:42px;object-fit:contain;flex-shrink:0;${i.unlocked?"":"filter:grayscale(0.82) opacity(0.55);"}"
                  />
                  <div style="min-width:0;flex:1 1 auto;display:flex;flex-direction:column;gap:4px;">
                    <div style="display:flex;justify-content:space-between;gap:6px;align-items:baseline;">
                      <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${o.colorHex};letter-spacing:0.06em;">
                        #${i.def.number} · ${h(o.shortLabel.toUpperCase())}
                      </span>
                      <span style="font-family:var(--font-mono);font-size:10.5px;font-weight:700;color:${i.unlocked?"var(--emerald-win)":"var(--ivory-muted)"};flex-shrink:0;">
                        ${l}
                      </span>
                    </div>
                    <div style="font-family:var(--font-display);font-size:13.5px;font-weight:800;color:var(--ivory-primary);line-height:1.22;">
                      ${h(i.def.title)}
                    </div>
                    <div style="font-size:11.5px;color:var(--ivory-muted);line-height:1.35;">
                      ${h(M(i.def.description))}
                    </div>
                    <div class="ws-meta-progress-track" style="margin-top:2px;">
                      <div class="ws-meta-progress-fill" style="width:${Math.round(i.ratio*100)}%;background:${i.unlocked?"var(--emerald-win)":o.colorHex};"></div>
                    </div>
                    ${i.def.reward?`<div style="font-family:var(--font-mono);font-size:10px;color:var(--gold-bright);margin-top:1px;">
                            ✦ ${h(i.def.reward.rewardLabel)}
                          </div>`:""}
                  </div>
                </div>
              `}).join("")}
        </div>
      </div>
    `}renderUnlockablesStudio(e,s,t,i){const o=Je(),l=e.length,r=J.length,p=z.length,d=J.filter(n=>n.order===1||s.includes(n.title)).length;return`
      <!-- 1. Stage & 3D Trophy Finishes (Dynamic Total) -->
      <div class="ws-meta-section" style="padding-top:0;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
          <h3 class="ws-meta-section-title">1. Stage &amp; 3D Trophy Finishes (${e.filter(n=>n.unlocked).length}/${l})</h3>
          ${this.callbacks.onNavigateSection?'<button type="button" class="ws-meta-inline-link" data-suite-nav="ATELIER">◈ 3D Atelier ›</button>':""}
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 20px;">
          ${e.map(n=>`
                <button
                  type="button"
                  class="ws-meta-row is-interactive ${n.equipped?"is-focused":""}"
                  data-equip-finish="${n.spec.id}"
                  ${n.unlocked?"":"disabled"}
                  style="width:100%;text-align:left;"
                >
                  <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                    <span style="width:18px;height:18px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,${n.spec.swatchPrimaryCss},${n.spec.swatchSecondaryCss});box-shadow:0 0 0 1px rgba(255,255,255,0.45);"></span>
                    <span style="font-size:12px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${h(n.spec.name)}</span>
                  </span>
                  <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${n.equipped?"var(--emerald-win)":n.unlocked?"var(--gold-bright)":"#9aa4b7"};flex-shrink:0;">
                    ${n.equipped?"✓ ON":n.unlocked?"EQUIP":"◇"}
                  </span>
                </button>
              `).join("")}
        </div>
      </div>

      <!-- 2. Broadcast Show Titles (Dynamic Total) -->
      <div class="ws-meta-section">
        <h3 class="ws-meta-section-title">2. Broadcast Show Titles (${d}/${r})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 20px;">
          ${J.map(n=>{const m=n.order===1||s.includes(n.title),c=t===n.title;return`
              <button
                type="button"
                class="ws-meta-row is-interactive ${c?"is-focused":""}"
                data-equip-title="${h(n.title)}"
                ${m?"":"disabled"}
                style="width:100%;text-align:left;"
              >
                <span style="min-width:0;display:flex;flex-direction:column;gap:2px;">
                  <span style="font-family:var(--font-display);font-size:11.5px;font-weight:700;color:${c?"var(--gold-bright)":"var(--ivory-primary)"};">
                    ${h(n.title)}
                  </span>
                  <span style="font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">
                    ${h(M(n.unlockRequirement))}
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${c?"var(--emerald-win)":m?"var(--gold-bright)":"#9aa4b7"};flex-shrink:0;">
                  ${c?"✓ ON":m?"EQUIP":"◇"}
                </span>
              </button>
            `}).join("")}
        </div>
      </div>

      <!-- 3. Stage & Crown HUD Themes (Dynamic Total) -->
      <div class="ws-meta-section" style="border-bottom:none;">
        <h3 class="ws-meta-section-title">3. Stage &amp; Crown HUD Themes (${i.length}/${p})</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:0 20px;">
          ${z.map(n=>{const m=i.includes(n.id),c=o.id===n.id;return`
              <button
                type="button"
                class="ws-meta-row is-interactive ${c?"is-focused":""}"
                data-equip-theme="${n.id}"
                ${m?"":"disabled"}
                style="width:100%;text-align:left;"
              >
                <span style="display:inline-flex;align-items:center;gap:9px;min-width:0;">
                  <span style="width:16px;height:16px;border-radius:50%;background:${n.primaryHex};box-shadow:0 0 0 2px ${n.secondaryHex};flex-shrink:0;"></span>
                  <span style="min-width:0;">
                    <span style="display:block;font-size:12px;font-weight:600;color:var(--ivory-primary);line-height:1.25;">${h(n.name)}</span>
                    <span style="display:block;font-family:var(--font-mono);font-size:10px;color:#9aa4b7;">${h(M(n.unlockRequirement))}</span>
                  </span>
                </span>
                <span style="font-family:var(--font-mono);font-size:10px;font-weight:700;color:${c?"var(--emerald-win)":m?"var(--gold-bright)":"#9aa4b7"};flex-shrink:0;">
                  ${c?"✓ ON":m?"EQUIP":"◇"}
                </span>
              </button>
            `}).join("")}
        </div>
      </div>
    `}bindEvents(e){e.querySelectorAll("img[data-fallback-src]").forEach(s=>{s.addEventListener("error",()=>{const t=s.dataset.fallbackSrc;t&&s.src!==t&&(s.src=t)},{once:!0})}),e.querySelector("#ws-honours-back")?.addEventListener("click",()=>this.handleBackOrClose()),e.querySelector("#ws-honours-3d-toggle")?.addEventListener("click",()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.toggle3DTrophyShowcase()}),re(e,{closeBtnId:"ws-honours-close",onNavigate:s=>this.callbacks.onNavigateSection?.(s),onClose:()=>this.handleClose(),onTapFeedback:()=>{this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap")}}),e.querySelectorAll(".ws-meta-body-scroll [data-suite-nav]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.suiteNav;t&&(this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.callbacks.onNavigateSection?.(t))})}),e.querySelectorAll("[data-honours-tab]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.honoursTab;!t||t===this.activeTab||(this.activeTab=t,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-tier-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.tierFilter;t&&(this.tierFilter=t,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelector("#ws-honours-clear-filters")?.addEventListener("click",()=>{this.tierFilter="ALL",this.aspectFilter="ALL",this.contextLabel=null,this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender()}),e.querySelectorAll("[data-aspect-filter]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.aspectFilter;t&&(this.aspectFilter=t,t==="ALL"&&(this.contextLabel=null),this.deps.haptics?.uiTap(),this.deps.audio?.playSfx("ui_tap"),this.rerender())})}),e.querySelectorAll("[data-equip-finish]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.equipFinish;if(!t)return;const i=Ct(t);this.deps.blackboard?.unlockSkin(i.legacyBlackboardSkinId,!0),this.deps.stage3d&&Re(this.deps.stage3d,i,{updateDomainPalette:!1}),this.deps.haptics?.lockThunk(),this.deps.audio?.playSfx("vault_thunk"),this.callbacks.onEquipSkin?.(i),this.rerender()})}),e.querySelectorAll("[data-equip-title]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.equipTitle;t&&(this.deps.passport.unlockTitleCrest(t,!0),this.deps.haptics?.passportStamp(),this.deps.audio?.playSfx("passport_stamp"),this.callbacks.onEquipBroadcastTitle?.(t),this.rerender())})}),e.querySelectorAll("[data-equip-theme]").forEach(s=>{s.addEventListener("click",()=>{const t=s.dataset.equipTheme;if(!t)return;const i=qt(t);this.deps.haptics?.sightlineSnap(),this.deps.audio?.playSfx("sightline_snap"),this.callbacks.onEquipHudTheme?.(i),this.rerender()})})}}function xs(){if(typeof document>"u"||document.getElementById("ws-honour-toast-styles"))return;const a=document.createElement("style");a.id="ws-honour-toast-styles",a.textContent=`
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
  `,document.head.appendChild(a)}class Ss{options;hostEl=null;queue=[];activeTimer=null;showing=!1;constructor(e={}){this.options=e,xs()}enqueue(e){if(!(!e||e.length===0||typeof document>"u")){for(const s of e)this.queue.some(t=>t.def.id===s.def.id)||this.queue.push(s);this.showing||this.presentNext()}}ensureHost(){if(this.hostEl&&document.body.contains(this.hostEl))return this.hostEl;const e=document.createElement("div");return e.className="ws-honour-toast-host",e.setAttribute("aria-live","polite"),document.body.appendChild(e),this.hostEl=e,e}setBodyToastActive(e){typeof document>"u"||!document.body||document.body.classList.toggle("ws-honour-toast-active",e)}presentNext(){const e=this.queue.shift();if(!e){this.showing=!1,this.setBodyToastActive(!1);return}this.showing=!0,this.setBodyToastActive(!0);const s=this.ensureHost(),t=Gt[e.def.tier];this.options.haptics?.correctBloom(),this.options.audio?.playSfx("gold_resonance");const i=document.createElement("div");i.className="ws-honour-toast-card ws-unlock-toast is-visible",i.style.setProperty("--toast-accent",t.colorHex),i.innerHTML=`
      <img
        src="${h(e.emblemPngUrl)}"
        data-fallback-src="${h(e.emblemFallbackDataUri)}"
        alt=""
        style="width:38px;height:38px;object-fit:contain;flex-shrink:0;"
      />
      <div style="min-width:0;flex:1 1 auto;">
        <div style="font-family:var(--font-mono,monospace);font-size:9px;font-weight:800;letter-spacing:0.08em;color:${t.colorHex};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ✦ CITATION UNLOCKED · ${h(t.shortLabel.toUpperCase())}
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
    `;const o=i.querySelector("img[data-fallback-src]");o?.addEventListener("error",()=>{const r=o.dataset.fallbackSrc;r&&o.src!==r&&(o.src=r)},{once:!0});const l=(r=!1)=>{this.activeTimer&&(clearTimeout(this.activeTimer),this.activeTimer=null),i.classList.remove("is-visible"),i.classList.add("is-leaving"),setTimeout(()=>{i.remove(),r&&this.options.onInspectHonour?.(e.def.id),this.presentNext()},220)};i.addEventListener("click",()=>l(!0)),s.appendChild(i),this.activeTimer=setTimeout(()=>l(!1),3600)}dispose(){this.activeTimer&&(clearTimeout(this.activeTimer),this.activeTimer=null),this.queue=[],this.showing=!1,this.setBodyToastActive(!1),this.hostEl&&(this.hostEl.remove(),this.hostEl=null)}}const ye="ws_question_feedback_v1",Wt=new Set(["UPVOTE","FLAG"]),ks=new Set(["AWKWARD_PHRASING","TOO_OBVIOUS","DISPUTED_FACT","DUPLICATE_FEEL"]),St=2500,Es=180,As=64;let Ye=null,De=null,ue=new Map;const $e=new Set;function Vt(){try{if(typeof globalThis<"u"&&"localStorage"in globalThis&&globalThis.localStorage)return globalThis.localStorage}catch{}return null}function Is(){const a=Vt();if(a)try{return a.getItem(ye)}catch{return Ye}return Ye}function Yt(a){Ye=a;const e=Vt();if(e)try{a===null?e.removeItem(ye):e.setItem(ye,a)}catch{}}function jt(a){if(!a||typeof a!="object")return null;const e=a,s=Math.trunc(Number(e.qid));if(!Number.isFinite(s)||s<=0)return null;const t=String(e.vote??"").toUpperCase();if(!Wt.has(t))return null;const i=t,o=typeof e.reason=="string"?e.reason.toUpperCase():"",l=i==="FLAG"?ks.has(o)?o:"AWKWARD_PHRASING":void 0,r=e.domainId!==void 0&&e.domainId!==null?Math.trunc(Number(e.domainId)):NaN,p=Number.isFinite(r)&&r>=0&&r<=11?r:void 0,d=typeof e.subcatLabel=="string"&&e.subcatLabel.trim().length>0?e.subcatLabel.trim().slice(0,As):void 0,n=typeof e.promptSnippet=="string"&&e.promptSnippet.trim().length>0?e.promptSnippet.replace(/\s+/g," ").trim().slice(0,Es):void 0,m=Number(e.updatedAtMs),c=Number.isFinite(m)&&m>0?Math.trunc(m):Date.now(),u=typeof e.updatedAtIso=="string"&&e.updatedAtIso.trim().length>0?e.updatedAtIso.trim():new Date(c).toISOString(),y={qid:s,vote:i,updatedAtMs:c,updatedAtIso:u};return l!==void 0&&(y.reason=l),p!==void 0&&(y.domainId=p),d!==void 0&&(y.subcatLabel=d),n!==void 0&&(y.promptSnippet=n),y}function ve(){const a=Is();if(a===De)return ue;const e=new Map;if(a)try{const s=JSON.parse(a),t=s&&typeof s=="object"&&"entries"in s&&s.entries&&typeof s.entries=="object"?s.entries:s;if(t&&typeof t=="object")for(const i of Object.values(t)){const o=jt(i);o&&e.set(o.qid,o)}}catch{}return De=a,ue=e,ue}function _s(a){if(a.size>St){const i=Array.from(a.values()).sort((o,l)=>o.vote!==l.vote?o.vote==="FLAG"?-1:1:l.updatedAtMs-o.updatedAtMs);a.clear();for(let o=0;o<Math.min(i.length,St);o++)a.set(i[o].qid,i[o])}const e={};for(const[i,o]of a.entries())e[String(i)]=o;const s={schemaVersion:ye,updatedAtIso:new Date().toISOString(),entries:e},t=JSON.stringify(s);ue=a,De=t,Yt(t)}function Qt(){if($e.size===0)return;const a=Xt();for(const e of $e)try{e(a)}catch{}}function $s(a){const e=Math.trunc(Number(a.qid));if(!Number.isFinite(e)||e<=0||!Wt.has(a.vote))return;const s=new Map(ve()),t=Date.now(),i=s.get(e),o=jt({qid:e,vote:a.vote,reason:a.vote==="FLAG"?a.reason??i?.reason??"AWKWARD_PHRASING":void 0,domainId:a.domainId??i?.domainId,subcatLabel:a.subcatLabel??i?.subcatLabel,promptSnippet:a.promptSnippet??i?.promptSnippet,updatedAtMs:t,updatedAtIso:new Date(t).toISOString()});o&&(s.set(e,o),_s(s),Qt())}function Rs(a){const e=Math.trunc(Number(a));return!Number.isFinite(e)||e<=0?null:ve().get(e)?.vote??null}function Ns(a){const e=Math.trunc(Number(a));if(!Number.isFinite(e)||e<=0)return null;const s=ve().get(e);return s?{...s}:null}function Ps(a){return Rs(a)==="FLAG"}function Bs(){const a=ve(),e=new Set;for(const[s,t]of a.entries())t.vote==="FLAG"&&e.add(s);return e}function Xt(){const a=ve();let e=0,s=0;const t=[];for(const i of a.values())i.vote==="UPVOTE"?e+=1:i.vote==="FLAG"&&(s+=1),t.push({...i});return t.sort((i,o)=>o.updatedAtMs-i.updatedAtMs||i.qid-o.qid),{upvotes:e,flagged:s,entries:t}}function Hs(){const a=Xt(),e=a.entries.filter(t=>t.vote==="FLAG").map(t=>t.qid).sort((t,i)=>t-i),s={AWKWARD_PHRASING:0,TOO_OBVIOUS:0,DISPUTED_FACT:0,DUPLICATE_FEEL:0};for(const t of a.entries)t.vote==="FLAG"&&t.reason&&t.reason in s&&(s[t.reason]+=1);return JSON.stringify({schemaVersion:ye,exportedAtIso:new Date().toISOString(),totals:{totalRated:a.entries.length,upvotes:a.upvotes,flagged:a.flagged},flagReasons:s,quarantinedQids:e,entries:a.entries},null,2)}function Fs(){ue=new Map,De=null,Yt(null),Qt()}function Gs(a){return $e.add(a),()=>{$e.delete(a)}}class Us{passportBook;observatory;atelier;factions;analyticsStore;analyticsView;honoursSystem;honoursView;toastOverlay;srsEngine;deps;callbacks;navStack=[];currentSection=null;historyGuardArmed=!1;boundPopState;constructor(e,s={}){this.deps=e,this.callbacks=s,this.analyticsStore=new Ga(e.passport),this.srsEngine=new At(e.passport),this.honoursSystem=new ys(this.analyticsStore,e.passport,e.blackboard),this.toastOverlay=new Ss({audio:e.audio,haptics:e.haptics,onInspectHonour:()=>{this.openHonours("TROPHIES_64")}}),this.passportBook=new ya({passport:e.passport,blackboard:e.blackboard,audio:e.audio,haptics:e.haptics,visaStampUrls:e.visaStampUrls}),this.observatory=new Aa({passport:e.passport,srsEngine:this.srsEngine,stage3d:e.stage3d,blackboard:e.blackboard,audio:e.audio,haptics:e.haptics}),this.srsEngine.subscribe(()=>{this.evaluateHonoursAndToast()}),this.atelier=new $a({passport:e.passport,stage3d:e.stage3d,blackboard:e.blackboard,audio:e.audio,haptics:e.haptics}),this.factions=new Fa({passport:e.passport,blackboard:e.blackboard,trialsMode:e.trialsMode,audio:e.audio,haptics:e.haptics,factionCrestUrls:e.factionCrestUrls}),this.analyticsView=new es({store:this.analyticsStore,passport:e.passport,srsEngine:this.srsEngine,audio:e.audio,haptics:e.haptics}),this.honoursView=new ws({honoursSystem:this.honoursSystem,passport:e.passport,blackboard:e.blackboard,stage3d:e.stage3d,audio:e.audio,haptics:e.haptics}),this.boundPopState=()=>{if(!this.isOpen()){this.historyGuardArmed=!1;return}this.navStack.length>0?(this.armHistoryGuard(!0),this.goBack()):(this.historyGuardArmed=!1,this.closeAll(!0))},typeof window<"u"&&window.addEventListener("popstate",this.boundPopState)}dispose(){this.closeAll(!1),this.toastOverlay.dispose(),typeof window<"u"&&window.removeEventListener("popstate",this.boundPopState)}setCallbacks(e){this.callbacks=e}isOpen(){return this.passportBook.isOpen()||this.observatory.isOpen()||this.atelier.isOpen()||this.factions.isOpen()||this.analyticsView.isOpen()||this.honoursView.isOpen()}canGoBack(){return this.navStack.length>0}goBack(){const e=this.navStack.pop();if(!e)return this.closeAll(!0),!1;if(e.section==="PASSPORT")return this.openPassport(e.passportTab??"CREDENTIALS",!1,!1),!0;if(e.section==="ANALYTICS"&&e.analyticsFilter){const s=e.analyticsFilter;return this.openAnalytics(s.range,!1,{initialDomainId:s.domainId,initialSubcatLabel:s.subcatLabel,initialArchetype:s.archetype,initialQuestionFormat:s.questionFormat??null,initialPeelTier:s.peelTier,initialOutcome:s.outcome,initialSpeedBucket:s.speedBucket}),!0}return this.openSectionInternal(e.section,!1),!0}armHistoryGuard(e=!1){if(!(typeof window>"u"||!window.history?.pushState)&&(!this.historyGuardArmed||e))try{window.history.pushState({__wsMetaSuite:!0},""),this.historyGuardArmed=!0}catch{}}prepareTransitionTo(e,s){const t=this.isOpen();if(s&&t&&this.currentSection&&this.currentSection!==e){const i=this.navStack[this.navStack.length-1];if(!i||i.section!==this.currentSection){const o={section:this.currentSection};this.currentSection==="PASSPORT"?o.passportTab=this.passportBook.getActiveTab():this.currentSection==="ANALYTICS"&&(o.analyticsFilter=this.analyticsView.getFilterState()),this.navStack.push(o),this.navStack.length>16&&this.navStack.shift()}}else t||(this.navStack=[],this.historyGuardArmed=!1);this.armHistoryGuard(!1),this.closeViewsOnly(),this.currentSection=e}sync3DShowcaseClass(e){typeof document>"u"||document.documentElement.classList.toggle("ws-3d-showcase-open",e)}resetSuiteNavigationState(e=!1){this.navStack=[],this.currentSection=null,this.historyGuardArmed=!1,this.sync3DShowcaseClass(!1),e&&this.callbacks.onCloseSuite?.()}closeViewsOnly(){this.passportBook.close(),this.observatory.close(),this.atelier.close(),this.factions.close(),this.analyticsView.close(),this.honoursView.close()}closeAll(e=!1){this.closeViewsOnly(),this.resetSuiteNavigationState(e)}openSection(e){this.openSectionInternal(e,!0)}openSectionInternal(e,s){switch(e){case"PASSPORT":this.openPassport("CREDENTIALS",!1,s);break;case"OBSERVATORY":this.openObservatory("RELICS_3D","championship_trophy",s);break;case"ATELIER":this.openAtelier(s);break;case"FACTIONS":this.openFactions(s);break;case"ANALYTICS":this.openAnalytics("ALL_TIME",s);break;case"HONOURS":this.openHonours("TROPHIES_64","ALL",s);break}}openPassport(e="CREDENTIALS",s=!1,t=!0){this.prepareTransitionTo("PASSPORT",t),s&&this.recordSpecialFeat("PASSPORT_STAMPED"),this.passportBook.open({initialTab:e,playStampCeremonyOnOpen:s,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onPassportStamped:()=>{this.recordSpecialFeat("PASSPORT_STAMPED")},onRenameChallenger:i=>{this.recordSpecialFeat("PASSPORT_STAMPED"),this.callbacks.onRenameChallenger?.(i)},onInspectRelicInObservatory:i=>this.openObservatory("RELICS_3D",i,!0),onOpenDomainAnalytics:i=>this.openAnalytics("ALL_TIME",!0,{initialDomainId:i}),onNavigateSection:i=>this.openSection(i),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openObservatory(e="RELICS_3D",s="championship_trophy",t=!0,i){this.prepareTransitionTo("OBSERVATORY",t),this.sync3DShowcaseClass(e==="RELICS_3D"),this.observatory.open({initialTab:e,initialArtifactId:s,initialDomainId:i,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onInspectRelic:o=>this.callbacks.onInspectRelic?.(o),onUvScan:o=>{this.recordSpecialFeat("UV_RELIC_SCANNED",{relicId:o})},onLatchesOpened:o=>{o!=="championship_trophy"&&this.recordSpecialFeat("RELIC_LATCH_OPENED",{relicId:o,latchCount:3})},onLaunchLivePrismReview:this.callbacks.onLaunchLivePrismReview?o=>{this.resetSuiteNavigationState(!1),this.callbacks.onLaunchLivePrismReview?.(o)}:void 0,onNavigateSection:o=>this.openSection(o),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openAtelier(e=!0){this.prepareTransitionTo("ATELIER",e),this.sync3DShowcaseClass(!0),this.atelier.open({canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onEquipSkin:s=>{this.recordSpecialFeat("ATELIER_SKIN_EQUIPPED"),this.callbacks.onEquipSkin?.(s)},onNavigateSection:s=>this.openSection(s),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openFactions(e=!0){this.prepareTransitionTo("FACTIONS",e),this.sync3DShowcaseClass(!1),this.factions.open({canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onPledgeFaction:s=>{this.recordSpecialFeat("FACTION_PLEDGED"),this.callbacks.onPledgeFaction?.(s)},onLaunchGhostDuel:s=>{this.resetSuiteNavigationState(!1),this.callbacks.onLaunchGhostDuel?.(s)},onLaunchBlackSalon:()=>{this.resetSuiteNavigationState(!1),this.callbacks.onLaunchBlackSalon?.()},onNavigateSection:s=>this.openSection(s),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openAnalytics(e="ALL_TIME",s=!0,t){this.prepareTransitionTo("ANALYTICS",s),this.sync3DShowcaseClass(!1),this.analyticsView.open({initialRange:e,...t,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onPracticeSlice:i=>{this.closeViewsOnly(),this.resetSuiteNavigationState(!1),this.callbacks.onPracticeSlice?.(i)},onOpenMissedCards:i=>{this.openObservatory("SELF_QUIZ","championship_trophy",!0,i)},onOpenRelatedHonours:i=>{this.openHonours("TROPHIES_64","ALL",!0,i.aspect,i.contextLabel)},onNavigateSection:i=>this.openSection(i),onClose:()=>{this.resetSuiteNavigationState(!0)}})}openHonours(e="TROPHIES_64",s="ALL",t=!0,i="ALL",o){this.prepareTransitionTo("HONOURS",t),this.sync3DShowcaseClass(!1),this.honoursView.open({initialTab:e,initialTierFilter:s,initialAspectFilter:i,initialContextLabel:o,canGoBack:this.canGoBack(),onBack:()=>{this.goBack()},onEquipSkin:l=>{this.recordSpecialFeat("ATELIER_SKIN_EQUIPPED"),this.callbacks.onEquipSkin?.(l)},onEquipBroadcastTitle:l=>{this.callbacks.onEquipBroadcastTitle?.(l)},onEquipHudTheme:l=>{this.callbacks.onEquipHudTheme?.(l)},onNavigateSection:l=>this.openSection(l),onClose:()=>{this.resetSuiteNavigationState(!0)}})}evaluateHonoursAndToast(){const e=this.honoursSystem.evaluateAndUnlock(!1);return e.length>0&&(this.toastOverlay.enqueue(e),this.callbacks.onHonourUnlocked?.(e)),e}evaluateAndToastHonours(){return this.evaluateHonoursAndToast()}getCatalogTotals(){return{honours:Kt(),unlockables:zt(),finishes:G.length,titles:J.length,themes:z.length}}recordQuestionOutcome(e){return this.analyticsStore.recordQuestionOutcome(e),this.evaluateHonoursAndToast()}recordMatchCompleted(e){return this.analyticsStore.recordMatchCompleted(e),this.evaluateHonoursAndToast()}recordSpecialFeat(e,s){return this.analyticsStore.recordSpecialFeat(e,s),this.evaluateHonoursAndToast()}getAnalyticsSnapshot(){return this.analyticsStore.getSnapshot()}getPlayerStatProfileForHost(){return this.analyticsStore.getPlayerStatProfileForHost()}getDueReviewCount(e){return this.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks,e),this.srsEngine.getDueCount(e)}getSrsDeckSummary(e){return this.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks,e),this.srsEngine.getDeckSummary(e)}ingestSpacedRepetitionOutcome(e){return this.srsEngine.ingestQuestionOutcome(e)}syncSpacedRepetitionBookmarks(e){return this.srsEngine.syncFromPassportBookmarks(this.deps.passport.getSnapshot().bookmarks,e)}openMasteryReviewDeck(e=!0,s){this.openObservatory("SELF_QUIZ","championship_trophy",e,s)}getEquippedHudAccentTheme(){return Je()}applyEquippedFinish(){return this.deps.stage3d?Lt(this.deps.stage3d):Tt()}}export{je as ALL_ANALYTICS_ARCHETYPES,Os as ALL_ANALYTICS_DIFFICULTY_TIERS,Mt as ALL_ANALYTICS_MODES,Ne as ALL_V4_QUESTION_FORMATS,ot as BOX_1_FIRST_MISS_MS,kt as BOX_1_REPEAT_MISS_MS,J as BROADCAST_TITLES_CATALOG,ts as BROADCAST_TITLES_V1_CORE,as as BROADCAST_TITLES_V2_EXPANSION,ss as BROADCAST_TITLES_V4_EXPANSION,es as CareerAnalyticsDashboardView,Ga as CareerAnalyticsStore,ya as DiplomaticPassportBook,Fa as FactionLeagueView,Oe as HALL_OF_HONOURS_CATALOG,Ds as HONOURS_CATALOG,bs as HONOURS_EXPANSION_PACKS,us as HONOURS_V1_CORE,ms as HONOURS_V2_EXPANSION,fs as HONOURS_V3_EXPANSION,gs as HONOURS_V4_EXPANSION,z as HUD_ACCENT_THEMES,is as HUD_ACCENT_THEMES_V1_CORE,os as HUD_ACCENT_THEMES_V2_EXPANSION,rs as HUD_ACCENT_THEMES_V4_EXPANSION,ys as HallOfHonoursSystem,ws as HallOfHonoursView,Ss as HonourToastOverlay,Aa as IntelObservatoryView,ee as LEITNER_BOX_INTERVAL_MS,va as LEITNER_BOX_LABELS,Et as LEITNER_BOX_SHORT_INTERVALS,Us as MetaProgressionSuite,te as OBSERVATORY_ARTIFACT_DOSSIERS,G as PRISM_ATELIER_FINISHES,Ta as PRISM_ATELIER_FINISHES_V1_CORE,Ca as PRISM_ATELIER_FINISHES_V2_EXPANSION,$a as PrismAtelierView,ye as QUESTION_FEEDBACK_STORAGE_KEY,Gt as RARITY_TIER_META,Te as SPEED_BUCKET_LABELS,it as SRS_STORAGE_KEY,At as SpacedRepetitionEngine,F as WORLD_COUNCIL_FACTIONS,Lt as applyEquippedPrismFinishToStage3D,Re as applyPrismFinishToStage3D,ne as attachMetaEscapeHandler,re as bindVaultJumperEvents,Pt as buildPlayerStatProfileForHost,Fs as clearFeedback,Wa as computeFilteredAnalyticsView,ge as computeSpeedBucketIdx,ht as createDefaultAnalyticsFilter,le as ensureMetaStylesInjected,qt as equipHudAccentTheme,h as escapeMetaHtml,ze as evaluatePrismFinishUnlocks,Hs as exportFeedbackReportJson,ua as formatMetaYear,xa as formatTimeUntilReview,Je as getEquippedHudTheme,he as getEquippedPrismFinishId,Ba as getFactionCrestDataUri,Xt as getFeedbackSummary,ls as getMedalFallbackDataUri,ie as getPrismFinishSpec,Bs as getQuarantinedQidSet,Ns as getQuestionFeedbackEntry,Rs as getQuestionVote,Kt as getTotalHonoursCount,zt as getTotalUnlockablesCount,Ut as getUnlockedHudThemeIds,fa as getVisaStampDataUri,La as grantAtelierFinishUnlock,ns as grantHudThemeUnlock,Ce as inferQuestionFormatFromEvent,Le as isDoubleDownEvent,Ps as isQuestionQuarantined,Tt as loadEquippedPrismFinish,Dt as normalizeAnalyticsEvent,Pe as normalizeQuestionFormatV4,$s as recordQuestionFeedback,j as renderVaultJumperHtml,M as sanitizeMetaCopy,Ct as saveEquippedPrismFinishId,Gs as subscribeQuestionFeedback};
