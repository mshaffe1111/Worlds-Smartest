import{F as me,n as te,p as ue,b as ge}from"./forge-DiY9MhRY.js";function ie(r,s="neutral"){const i=(r||"vance").toLowerCase(),n=(s||"neutral").toLowerCase();return i==="vance"&&(n==="intense"||n==="shocked"||n==="tense")?"./assets/portraits_cutout/vance_intense.png":i==="nadia"&&(n==="shocked"||n==="rattled")?"./assets/portraits_cutout/nadia_shocked.png":i==="soren"&&n==="smirk"?"./assets/portraits_cutout/soren_smirk.png":i==="teo"&&(n==="intense"||n==="shocked"||n==="tense")?"./assets/portraits_cutout/teo_intense.png":`./assets/portraits_cutout/${new Set(["vance","nadia","soren","teo","lindqvist","tariq"]).has(i)?i:"vance"}.png`}const ae="ws-sleek-dossier-sheet-css";function M(r){return String(r??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function T(r){const s=String(r??"");return s.includes(",")?s.replace(/\b(in|circa|c\.|from|until|since|year|dated|trial|season|series|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\b([12]),(\d{3})(\s*(?:CE|BCE|AD|BC))\b/gi,"$1$2$3").replace(/\(([b.\s]*)([12]),(\d{3})\)/gi,"($1$2$3)").replace(/\b([12]),(\d{3})s\b/g,"$1$2s").replace(/\b([12]),(\d{3})\s*([–—-])\s*([12]),(\d{3})\b/g,"$1$2$3$4$5").replace(/(?<![\d,.])([12]),(\d{3})(?![\d,])(?!\s*(?:qs?|questions?|pts?|points?|km|mi|m|ft)\b)/gi,"$1$2"):s}function Z(r){return String(r).padStart(2,"0")}function fe(){if(typeof document>"u"||document.getElementById(ae))return;const r=document.createElement("style");r.id=ae,r.textContent=`
    .ws-velvet-backdrop.ws-dossier-modal {
      position: fixed;
      inset: 0;
      z-index: 65;
      background: rgba(3, 5, 10, 0.88);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 0;
      pointer-events: auto;
    }

    .ws-velvet-sheet.ws-dossier-sheet {
      position: relative;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      background:
        radial-gradient(ellipse 90% 34% at 50% 0%, rgba(224, 82, 99, 0.08) 0%, rgba(216, 175, 87, 0.04) 40%, rgba(7, 10, 18, 0) 75%),
        #070a12;
      border: none !important;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
    }

    .ws-velvet-sheet.ws-dossier-sheet::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 4%, rgba(232, 197, 116, 0.42) 50%, transparent 96%);
      pointer-events: none;
      z-index: 10;
    }

    @media (min-width: 768px) and (min-height: 560px) {
      .ws-velvet-backdrop.ws-dossier-modal {
        align-items: center;
        padding: 20px;
      }
      .ws-velvet-sheet.ws-dossier-sheet {
        max-width: 960px;
        height: min(90dvh, 860px);
        max-height: min(90dvh, 860px);
        border-radius: 18px;
        box-shadow:
          0 32px 84px rgba(0, 0, 0, 0.84),
          0 0 0 1px rgba(242, 207, 126, 0.14);
      }
    }

    .ws-dossier-sheet .ws-sheet-header {
      position: sticky;
      top: 0;
      z-index: 8;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: minmax(76px, auto) minmax(0, 1fr) minmax(44px, auto);
      align-items: center;
      gap: 6px;
      min-height: calc(48px + env(safe-area-inset-top, 0px));
      padding: env(safe-area-inset-top, 0px) 8px 0 8px;
      background: rgba(7, 10, 18, 0.96);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .ws-dossier-sheet .ws-sheet-nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 5px;
      min-height: 44px;
      min-width: 44px;
      padding: 0 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--gold-bright, #f2cf7e);
      font-size: 13.5px;
      font-weight: 600;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-dossier-sheet .ws-sheet-nav-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffebb8;
    }

    .ws-dossier-sheet .ws-sheet-title {
      margin: 0;
      text-align: center;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: clamp(13px, 1.5vw, 16px);
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-dossier-sheet .ws-sheet-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(246, 242, 233, 0.66);
      font-size: 17px;
      line-height: 1;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-dossier-sheet .ws-sheet-icon-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-dossier-meta-bar {
      flex-shrink: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 4px 12px;
      padding: 0 16px;
      background: rgba(7, 10, 18, 0.94);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .ws-dossier-meta-copy {
      padding: 8px 0;
      font-size: 12px;
      color: rgba(246, 242, 233, 0.58);
      font-variant-numeric: tabular-nums;
    }

    .ws-dossier-meta-copy strong {
      color: var(--ivory-primary, #f6f2e9);
      font-weight: 600;
    }

    .ws-dossier-meta-copy .is-gold {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-meta-copy .is-cyan {
      color: var(--cyan-clue, #56d4f5);
    }

    .ws-dossier-tabs {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .ws-dossier-tab {
      min-height: 44px;
      min-width: 44px;
      padding: 0 12px;
      border: none;
      background: transparent;
      color: rgba(246, 242, 233, 0.66);
      font-size: 12.5px;
      font-weight: 600;
      letter-spacing: 0.03em;
      white-space: nowrap;
      transition: color 0.14s ease;
    }

    .ws-dossier-tab:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-dossier-tab.is-active {
      color: var(--gold-bright, #f2cf7e);
      box-shadow: inset 0 -2px 0 var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-suspects-rail {
      flex-shrink: 0;
      display: flex;
      align-items: stretch;
      gap: 2px;
      overflow-x: auto;
      overflow-y: hidden;
      padding: 6px 12px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(9, 13, 22, 0.85);
      scrollbar-width: none;
    }

    .ws-dossier-suspects-rail::-webkit-scrollbar {
      display: none;
    }

    @media (min-width: 820px) {
      .ws-dossier-suspects-rail {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 4px;
      }
    }

    .ws-dossier-suspect-btn {
      flex: 0 0 auto;
      min-width: 140px;
      min-height: 48px;
      padding: 6px 9px;
      border: none;
      border-radius: 10px;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 9px;
      text-align: left;
      transition: background 0.14s ease;
    }

    @media (min-width: 820px) {
      .ws-dossier-suspect-btn {
        min-width: 0;
      }
    }

    .ws-dossier-suspect-btn:hover {
      background: rgba(255, 255, 255, 0.045);
    }

    .ws-dossier-suspect-btn.is-active {
      background: rgba(242, 207, 126, 0.12);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      object-fit: cover;
      object-position: top center;
      flex-shrink: 0;
      border: none;
      background: rgba(216, 175, 87, 0.12);
      box-shadow: 0 0 0 1.5px rgba(242, 207, 126, 0.34);
    }

    .ws-dossier-suspect-btn.is-active .ws-dossier-avatar {
      box-shadow: 0 0 0 2px var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-suspect-copy {
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws-dossier-suspect-name {
      font-size: 12px;
      font-weight: 700;
      line-height: 1.2;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-dossier-suspect-btn.is-active .ws-dossier-suspect-name {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-suspect-role {
      font-size: 10.5px;
      line-height: 1.25;
      color: rgba(246, 242, 233, 0.64);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-top: 1px;
    }

    .ws-dossier-filter-banner {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 6px 16px;
      background: rgba(242, 207, 126, 0.06);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      font-size: 12px;
      color: rgba(246, 242, 233, 0.78);
    }

    .ws-dossier-clear-filter {
      min-height: 44px;
      min-width: 44px;
      padding: 0 12px;
      border: none;
      border-radius: 7px;
      background: rgba(255, 255, 255, 0.08);
      color: var(--gold-bright, #f2cf7e);
      font-size: 11.5px;
      font-weight: 600;
      white-space: nowrap;
    }

    .ws-dossier-workspace {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: none;
    }

    .ws-dossier-main-pane {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      border: none;
    }

    .ws-dossier-sheet .ws-sheet-list {
      display: flex;
      flex-direction: column;
      border: none;
    }

    @media (min-width: 720px) {
      .ws-dossier-sheet .ws-sheet-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ws-dossier-sheet .ws-sheet-row:nth-child(even) {
        box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
      .ws-dossier-sheet .ws-sheet-row.is-selected:nth-child(even) {
        box-shadow:
          inset 3px 0 0 var(--gold-bright, #f2cf7e),
          inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
    }

    .ws-dossier-sheet .ws-sheet-row {
      width: 100%;
      min-height: 58px;
      padding: 11px 16px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 0;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 12px;
      text-align: left;
      transition: background 0.14s ease;
    }

    .ws-dossier-sheet .ws-sheet-row:hover {
      background: rgba(255, 255, 255, 0.036);
    }

    .ws-dossier-sheet .ws-sheet-row.is-selected {
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.11) 0%, rgba(242, 207, 126, 0.02) 100%);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-sheet .ws-sheet-row.is-locked .ws-dossier-row-title {
      color: rgba(246, 242, 233, 0.68);
    }

    .ws-dossier-clue-num {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 12px;
      font-weight: 700;
      color: var(--gold-bright, #f2cf7e);
      font-variant-numeric: tabular-nums;
      width: 24px;
      flex-shrink: 0;
    }

    .ws-dossier-sheet .ws-sheet-row.is-locked .ws-dossier-clue-num {
      color: rgba(246, 242, 233, 0.62);
    }

    .ws-dossier-row-copy {
      min-width: 0;
      flex: 1 1 auto;
    }

    .ws-dossier-row-title {
      font-size: 14px;
      font-weight: 600;
      line-height: 1.25;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-dossier-sheet .ws-sheet-row.is-selected .ws-dossier-row-title {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-dossier-row-sub {
      margin-top: 2px;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      color: rgba(246, 242, 233, 0.64);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-dossier-row-status {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: rgba(246, 242, 233, 0.62);
    }

    .ws-dossier-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--gold-bright, #f2cf7e);
      box-shadow: 0 0 8px rgba(242, 207, 126, 0.65);
    }

    /* Frameless Interactive Conspiracy Thread Web */
    .ws-dossier-web-scroll {
      width: 100%;
      height: 100%;
      min-height: 320px;
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      background: radial-gradient(circle at 50% 48%, rgba(28, 35, 54, 0.52) 0%, rgba(7, 10, 18, 0.98) 78%);
      border: none;
    }

    .ws-dossier-web-canvas {
      position: relative;
      width: 100%;
      min-width: 660px;
      height: 100%;
      min-height: 330px;
      border: none;
    }

    .ws-dossier-web-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .ws-dossier-node {
      position: absolute;
      transform: translate(-50%, -50%);
      min-height: 44px;
      min-width: 96px;
      max-width: 164px;
      padding: 6px 10px;
      border: none !important;
      border-radius: 10px;
      background: rgba(11, 16, 28, 0.94);
      box-shadow:
        0 8px 20px rgba(0, 0, 0, 0.65),
        0 0 0 1px rgba(242, 207, 126, 0.28);
      color: var(--ivory-primary, #f6f2e9);
      font-size: 11px;
      font-weight: 600;
      line-height: 1.22;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 7px;
      transition: transform 0.14s ease, box-shadow 0.14s ease, opacity 0.14s ease;
    }

    .ws-dossier-node:hover {
      transform: translate(-50%, -50%) scale(1.04);
      box-shadow:
        0 10px 24px rgba(0, 0, 0, 0.72),
        0 0 0 1.5px rgba(242, 207, 126, 0.72);
      z-index: 4;
    }

    .ws-dossier-node.is-selected {
      transform: translate(-50%, -50%) scale(1.06);
      background: rgba(34, 27, 14, 0.96);
      box-shadow:
        0 10px 26px rgba(0, 0, 0, 0.75),
        0 0 0 1.5px var(--gold-bright, #f2cf7e),
        0 0 18px rgba(242, 207, 126, 0.25);
      color: var(--gold-bright, #f2cf7e);
      z-index: 6;
    }

    .ws-dossier-node.is-locked {
      background: rgba(10, 14, 23, 0.90);
      box-shadow:
        0 6px 14px rgba(0, 0, 0, 0.52),
        0 0 0 1px rgba(255, 255, 255, 0.14);
      color: rgba(246, 242, 233, 0.64);
    }

    .ws-dossier-node.is-dimmed {
      opacity: 0.34;
    }

    .ws-dossier-node-num {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      font-weight: 800;
      color: var(--gold-bright, #f2cf7e);
      flex-shrink: 0;
    }

    .ws-dossier-node.is-locked .ws-dossier-node-num {
      color: rgba(246, 242, 233, 0.62);
    }

    .ws-dossier-node-label {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Frameless Clue Inspector */
    .ws-dossier-inspector {
      flex-shrink: 0;
      max-height: 35dvh;
      overflow-y: auto;
      padding: 12px 16px max(12px, env(safe-area-inset-bottom, 0px));
      background: rgba(8, 11, 20, 0.98);
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.09);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
      display: flex;
      flex-direction: column;
      gap: 7px;
    }

    .ws-dossier-inspector-top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 6px 12px;
    }

    .ws-dossier-inspector-kicker {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      font-weight: 700;
      letter-spacing: 0.07em;
      color: var(--cyan-clue, #56d4f5);
      text-transform: uppercase;
    }

    .ws-dossier-inspector-suspect {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      color: rgba(246, 242, 233, 0.72);
    }

    .ws-dossier-inspector-suspect img {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      object-fit: cover;
      object-position: top center;
      border: none;
    }

    .ws-dossier-inspector-title {
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 15px;
      font-weight: 700;
      color: var(--gold-bright, #f2cf7e);
      line-height: 1.25;
    }

    .ws-dossier-inspector-summary {
      margin: 0;
      font-size: 13px;
      line-height: 1.45;
      color: rgba(246, 242, 233, 0.88);
    }

    .ws-dossier-links-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
    }

    .ws-dossier-links-label {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      letter-spacing: 0.06em;
      color: rgba(246, 242, 233, 0.62);
      text-transform: uppercase;
    }

    .ws-dossier-link-chip {
      min-height: 44px;
      min-width: 44px;
      padding: 0 12px;
      border: none !important;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--ivory-primary, #f6f2e9);
      font-size: 11.5px;
      font-weight: 600;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-dossier-link-chip:hover {
      background: rgba(242, 207, 126, 0.16);
      color: var(--gold-bright, #f2cf7e);
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-dossier-sheet .ws-sheet-header {
        min-height: 44px;
      }
      .ws-dossier-suspects-rail {
        display: none;
      }
      .ws-dossier-workspace {
        display: grid;
        grid-template-columns: 1.25fr 1fr;
      }
      .ws-dossier-inspector {
        max-height: none;
        height: 100%;
        border-top: none;
        box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.08);
      }
    }
  `,document.head.appendChild(r)}class be{audio;haptics;modalEl=null;boundKeyDown=null;constructor(s,i){this.audio=s,this.haptics=i}isOpen(){return this.modalEl!==null}open(s,i){this.close(),fe();const n=new Map;for(const g of s.suspects)n.set(g.id,g);const h=[{id:"vance",name:"Julian Vance",role:"Chief Adjudicator",status_hint:"Handpicked your 99.4% anomaly file—architect or secret ally?"},{id:"nadia",name:"Nadia Al-Mansoor",role:"Acoustic Prodigy",status_hint:"Searching the Meridian vaults for her vanished brother, Tariq."},{id:"soren",name:"Soren 'Echo' Kael",role:"Horizon Wildcard",status_hint:"Sub-vocal telemetry earpiece caught in Tokyo."},{id:"teo",name:"Mateo 'Teo' Rojas",role:"Rogue Producer",status_hint:"Runs the pirate Black Salon feed behind Studio Control."},{id:"lindqvist",name:"Chancellor Lindqvist",role:"Sovereign Chair",status_hint:"Guards the sealed Trial 00 — 2019 diplomatic drawers."},{id:"tariq",name:"Tariq Al-Mansoor",role:"2019 Trial Zero Winner",status_hint:"Erased after uncovering faction weaponization of The Ledger."}];for(const g of h)n.has(g.id)||n.set(g.id,g);const o=Array.from(n.values()),v=new Map(s.clues.map(g=>[g.id,g]));let a=s.clues.find(g=>g.unlocked)??s.clues[0]??null,c=null,d=typeof window<"u"&&window.innerWidth>=720?"WEB":"LIST";const L=s.clues.filter(g=>g.unlocked).length,t=new Map;for(const g of s.clues){t.has(g.id)||t.set(g.id,new Set);for(const _ of g.red_thread_to??[])v.has(_)&&(t.get(g.id).add(_),t.has(_)||t.set(_,new Set),t.get(_).add(g.id))}const p=()=>{const g=[],_=new Set;for(const $ of s.clues){const[x,I]=$.board_pos??[.2,.3],S=Math.round(Math.max(.11,Math.min(.89,x))*1e3),P=Math.round(Math.max(.14,Math.min(.86,I))*420);for(const j of $.red_thread_to??[]){const D=v.get(j);if(!D)continue;const y=$.id<D.id?`${$.id}::${D.id}`:`${D.id}::${$.id}`;if(_.has(y))continue;_.add(y);const[q,e]=D.board_pos??[.7,.6],f=Math.round(Math.max(.11,Math.min(.89,q))*1e3),u=Math.round(Math.max(.14,Math.min(.86,e))*420),b=Math.round((S+f)*.5),E=Math.round((P+u)*.5+24),z=a&&(a.id===$.id||a.id===D.id),N=$.unlocked&&D.unlocked,R=N?"#f2cf7e":z?"rgba(242, 207, 126, 0.82)":"rgba(224, 82, 99, 0.52)",W=z?2.8:N?2.2:1.5,Q=N?"":'stroke-dasharray="6 5"';g.push(`<path d="M ${S} ${P} Q ${b} ${E} ${f} ${u}" fill="none" stroke="${R}" stroke-width="${W}" ${Q} />`)}}return g.join(`
`)},m=document.createElement("div");m.className="ws-modal-backdrop ws-dossier-modal ws-velvet-backdrop",m.setAttribute("role","dialog"),m.setAttribute("aria-modal","true"),m.setAttribute("aria-label","Meridian Zero Conspiracy Evidence Board");const C=()=>{const g=m.querySelector(".ws-dossier-main-pane")?.scrollTop??0,_=c?n.get(c)??null:null,$=c?s.clues.filter(e=>e.suspect_id===c):s.clues,x=a?n.get(a.suspect_id)??null:null,S=(a?Array.from(t.get(a.id)??[]):[]).map(e=>v.get(e)).filter(e=>!!e),P=d==="LIST"?`
            <div class="ws-sheet-list">
              ${$.map(e=>{const f=a?.id===e.id,u=n.get(e.suspect_id),b=e.unlocked?T(e.title):`Classified · ${T(e.city_label)} Archive`,E=`${T(e.city_label)} · ${T(e.category)} · ${T(u?.name??e.suspect_id)}`;return`
                    <button
                      type="button"
                      class="ws-sheet-row ${e.unlocked?"":"is-locked"} ${f?"is-selected":""}"
                      data-clue-id="${M(e.id)}"
                    >
                      <span class="ws-dossier-clue-num">${Z(e.number)}</span>
                      <div class="ws-dossier-row-copy">
                        <div class="ws-dossier-row-title">${M(b)}</div>
                        <div class="ws-dossier-row-sub">${M(E)}</div>
                      </div>
                      <div class="ws-dossier-row-status">
                        ${e.unlocked?'<span class="ws-dossier-dot" aria-label="Decrypted"></span>':'<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-label="Locked" style="flex-shrink:0;"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'}
                        <span aria-hidden="true" style="font-size:17px;">›</span>
                      </div>
                    </button>
                  `}).join("")}
            </div>
          `:`
            <div class="ws-dossier-web-scroll">
              <div class="ws-dossier-web-canvas">
                <svg class="ws-dossier-web-svg" viewBox="0 0 1000 420" preserveAspectRatio="none">
                  ${p()}
                </svg>
                ${s.clues.map(e=>{const[f,u]=e.board_pos??[.5,.5],b=Math.max(.11,Math.min(.89,f)),E=Math.max(.14,Math.min(.86,u)),z=a?.id===e.id,N=c!==null&&e.suspect_id!==c,R=e.unlocked?T(e.title):`${T(e.city_label)} (Locked)`;return`
                      <button
                        type="button"
                        class="ws-dossier-node ${e.unlocked?"":"is-locked"} ${z?"is-selected":""} ${N?"is-dimmed":""}"
                        data-clue-id="${M(e.id)}"
                        style="left:${(b*100).toFixed(1)}%;top:${(E*100).toFixed(1)}%;"
                      >
                        <span class="ws-dossier-node-num">${Z(e.number)}</span>
                        <span class="ws-dossier-node-label">${M(R)}</span>
                      </button>
                    `}).join("")}
              </div>
            </div>
          `,j=T(s.boardTitle||"").trim(),D=j.length>0&&j.length<=20?j:"CONSPIRACY DOSSIER";m.innerHTML=`
        <div class="ws-velvet-sheet ws-dossier-sheet">
          <header class="ws-sheet-header">
            <button type="button" class="ws-sheet-nav-btn" id="ws-dossier-close">
              ← Back
            </button>
            <h2 class="ws-sheet-title">${M(D)}</h2>
            <button type="button" class="ws-sheet-icon-btn" id="ws-dossier-close-x" aria-label="Close">
              ✕
            </button>
          </header>

          <div class="ws-dossier-meta-bar">
            <div class="ws-dossier-meta-copy">
              <strong>${M(T(s.challengerName))}</strong> ·
              <strong class="is-gold">${L}/${s.clues.length}</strong> Decrypted
              ${s.act3Branch?` · <strong class="is-cyan">${M(T(s.act3Branch))}</strong>`:""}
            </div>
            <div class="ws-dossier-tabs" role="tablist" aria-label="Dossier view">
              <button
                type="button"
                role="tab"
                aria-selected="${d==="LIST"}"
                class="ws-dossier-tab ${d==="LIST"?"is-active":""}"
                data-dossier-view="LIST"
              >
                ${s.clues.length} Clues
              </button>
              <button
                type="button"
                role="tab"
                aria-selected="${d==="WEB"}"
                class="ws-dossier-tab ${d==="WEB"?"is-active":""}"
                data-dossier-view="WEB"
              >
                Thread Web
              </button>
            </div>
          </div>

          <div class="ws-dossier-suspects-rail" aria-label="Suspect dossiers">
            ${o.map(e=>`
                  <button
                    type="button"
                    class="ws-dossier-suspect-btn ${c===e.id?"is-active":""}"
                    data-suspect-filter="${M(e.id)}"
                  >
                    <img
                      class="ws-dossier-avatar"
                      src="${ie(e.id)}"
                      alt="${M(T(e.name))}"
                    />
                    <div class="ws-dossier-suspect-copy">
                      <div class="ws-dossier-suspect-name">${M(T(e.name))}</div>
                      <div class="ws-dossier-suspect-role">${M(T(e.bondLabel||e.role))}</div>
                    </div>
                  </button>
                `).join("")}
          </div>

          ${_?`
                <div class="ws-dossier-filter-banner">
                  <span>
                    <strong style="color:var(--gold-bright);">${M(T(_.name))}:</strong>
                    ${M(T(_.status_hint))}
                  </span>
                  <button type="button" data-ws-allow-compact="1" class="ws-dossier-clear-filter" id="ws-dossier-clear-filter">
                    Show All ${s.clues.length}
                  </button>
                </div>
              `:""}

          <div class="ws-dossier-workspace">
            <div class="ws-dossier-main-pane">
              ${P}
            </div>

            ${a?`
                  <section class="ws-dossier-inspector" aria-label="Selected clue details">
                    <div class="ws-dossier-inspector-top">
                      <span class="ws-dossier-inspector-kicker">
                        Clue #${Z(a.number)} · ${M(T(a.city_label))} · ${M(T(a.category))}
                      </span>
                      <span class="ws-dossier-inspector-suspect">
                        <img src="${ie(a.suspect_id)}" alt="" />
                        <span>${M(T(x?.name??a.suspect_id))}</span>
                      </span>
                    </div>
                    <div class="ws-dossier-inspector-title">
                      ${M(a.unlocked?T(a.title):"Classified Meridian Archive Entry")}
                    </div>
                    <p class="ws-dossier-inspector-summary">
                      ${M(a.unlocked?T(a.summary):`Complete mission ${a.unlock_mission.toUpperCase()} in ${T(a.city_label)} to decrypt this physical evidence and illuminate its conspiracy links.`)}
                    </p>
                    ${S.length>0?`
                          <div class="ws-dossier-links-row">
                            <span class="ws-dossier-links-label">Threads:</span>
                            ${S.map(e=>`
                              <button
                                type="button"
                                data-ws-allow-compact="1"
                                class="ws-dossier-link-chip"
                                data-jump-clue="${M(e.id)}"
                              >
                                → #${Z(e.number)} ${M(e.unlocked?T(e.title):T(e.city_label))}
                              </button>
                            `).join("")}
                          </div>
                        `:""}
                  </section>
                `:""}
          </div>
        </div>
      `;const y=m.querySelector(".ws-dossier-main-pane");y&&g>0&&(y.scrollTop=g);const q=()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),this.close(),i?.()};m.querySelector("#ws-dossier-close")?.addEventListener("click",q),m.querySelector("#ws-dossier-close-x")?.addEventListener("click",q),m.querySelectorAll("[data-dossier-view]").forEach(e=>{e.addEventListener("click",()=>{const f=e.dataset.dossierView;f!==d&&(this.haptics.uiTap(),this.audio.playSfx("ui_tap"),d=f,C())})}),m.querySelectorAll("[data-suspect-filter]").forEach(e=>{e.addEventListener("click",()=>{const f=e.dataset.suspectFilter||null;if(this.haptics.uiTap(),this.audio.playSfx("ui_tap"),c=c===f?null:f,c){const u=s.clues.find(b=>b.suspect_id===c);u&&(a=u)}C()})}),m.querySelector("#ws-dossier-clear-filter")?.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),c=null,C()}),m.querySelectorAll("[data-clue-id]").forEach(e=>{e.addEventListener("click",()=>{const f=e.dataset.clueId,u=s.clues.find(b=>b.id===f);u&&(this.haptics.uiTap(),this.audio.playSfx("ui_tap"),a=u,C())})}),m.querySelectorAll("[data-jump-clue]").forEach(e=>{e.addEventListener("click",()=>{const f=e.dataset.jumpClue,u=s.clues.find(b=>b.id===f);u&&(this.haptics.uiTap(),this.audio.playSfx("ui_tap"),a=u,c&&u.suspect_id!==c&&(c=null),C())})})};C(),m.addEventListener("click",g=>{g.target===m&&(this.close(),i?.())}),this.boundKeyDown=g=>{const _=document.activeElement?.tagName.toUpperCase();_==="INPUT"||_==="TEXTAREA"||g.key==="Escape"&&(g.preventDefault(),this.close(),i?.())},window.addEventListener("keydown",this.boundKeyDown),document.body.appendChild(m),this.modalEl=m}close(){this.boundKeyDown&&(window.removeEventListener("keydown",this.boundKeyDown),this.boundKeyDown=null),this.modalEl&&(this.modalEl.remove(),this.modalEl=null)}}const Me=Object.freeze(Object.defineProperty({__proto__:null,EvidenceDossierModal:be},Symbol.toStringTag,{value:"Module"})),we={0:[{id:"hist_military",name:"Military & Conflict History",share:.3,topics:[{id:"hist_ww2",name:"World War II",share:.34,kw:["world war ii","wwii","1939","1945","normandy","axis","allied"]},{id:"hist_ancient_rome",name:"Ancient Rome & Classical Warfare",share:.24,kw:["roman","caesar","legion","augustus","empire"]},{id:"hist_cold_war",name:"Cold War & Space Race Geopolitics",share:.22,kw:["cold war","soviet","berlin","nato","warsaw"]},{id:"hist_napoleonic_ww1",name:"Napoleonic Era & World War I",share:.2,kw:["napoleon","waterloo","1914","1918","trench"]}]},{id:"hist_empires",name:"Ancient Civilizations & Empires",share:.26,topics:[{id:"hist_mesopotamia_egypt",name:"Ancient Egypt & Mesopotamia",share:.36,kw:["pharaoh","nile","babylon","sumer","dynasty"]},{id:"hist_asian_dynasties",name:"Imperial China, Japan & Silk Road",share:.34,kw:["dynasty","tang","ming","shogun","silk road"]},{id:"hist_precolumbian",name:"Maya, Inca, Aztec & African Kingdoms",share:.3,kw:["maya","inca","aztec","mali","songhai"]}]},{id:"hist_modern",name:"Revolutions, Treaties & Modern Era",share:.24,topics:[{id:"hist_american_french",name:"American & French Revolutions",share:.36,kw:["revolution","1776","1789","constitution"]},{id:"hist_industrial",name:"Industrial Age & Decolonization",share:.32,kw:["industrial","independence","victorian"]},{id:"hist_treaties_leaders",name:"World Leaders, Summits & Treaties",share:.32,kw:["treaty","prime minister","president","chancellor"]}]},{id:"hist_medieval",name:"Medieval & Renaissance Worlds",share:.2,topics:[{id:"hist_byzantine_islamic",name:"Byzantium & Islamic Golden Age",share:.35,kw:["byzantine","constantinople","caliphate","baghdad"]},{id:"hist_feudal_europe",name:"Medieval Monarchs & Magna Carta",share:.33,kw:["medieval","king","crusade","magna carta"]},{id:"hist_exploration",name:"Age of Sail & Global Exploration",share:.32,kw:["expedition","voyage","navigator","circumnavigation"]}]}],1:[{id:"sci_space",name:"Astronomy & Space",share:.28,topics:[{id:"sci_exoplanets_spaceflight",name:"Exoplanets, Missions & Spaceflight",share:.38,kw:["apollo","nasa","orbit","spacecraft","exoplanet","mars"]},{id:"sci_solar_system",name:"Planets, Moons & Solar System",share:.32,kw:["jupiter","saturn","moon","asteroid","planet"]},{id:"sci_cosmology",name:"Stars, Galaxies & Cosmology",share:.3,kw:["galaxy","supernova","black hole","nebula","quasar"]}]},{id:"sci_physics",name:"Physics & Quantum Mechanics",share:.26,topics:[{id:"sci_classical_physics",name:"Mechanics, Optics & Electromagnetism",share:.36,kw:["velocity","force","wavelength","magnetic","newton"]},{id:"sci_quantum_relativity",name:"Quantum Physics, Particles & Relativity",share:.34,kw:["quantum","boson","relativity","photon","quark"]},{id:"sci_thermodynamics_units",name:"SI Units, Constants & Thermodynamics",share:.3,kw:["kelvin","joule","entropy","watt","pascal"]}]},{id:"sci_chemistry",name:"Chemistry & Materials",share:.24,topics:[{id:"sci_periodic_elements",name:"Periodic Table & Chemical Elements",share:.42,kw:["atomic number","element","symbol","isotope","noble gas"]},{id:"sci_compounds_reactions",name:"Compounds, Acids & Organic Chemistry",share:.32,kw:["molecule","acid","polymer","catalyst","bond"]},{id:"sci_nobel_chem",name:"Nobel Discoveries & Laboratory Milestones",share:.26,kw:["nobel","synthesis","radioactivity"]}]},{id:"sci_human_bio",name:"Human Biology, Genetics & Medicine",share:.22,topics:[{id:"sci_anatomy",name:"Human Anatomy, Brain & Organ Systems",share:.38,kw:["artery","neuron","bone","organ","cortex","hormone"]},{id:"sci_genetics_cell",name:"DNA, Cell Biology & Biochemistry",share:.32,kw:["dna","rna","chromosome","mitochondria","enzyme"]},{id:"sci_medicine",name:"Vaccines, Pharmacology & Medical Pioneers",share:.3,kw:["vaccine","antibiotic","syndrome","clinical"]}]}],2:[{id:"geo_cities_nations",name:"World Capitals, Cities & Nations",share:.34,topics:[{id:"geo_capitals",name:"National Capitals & Sovereign States",share:.38,kw:["capital","republic","kingdom","currency"]},{id:"geo_megacities",name:"Global Megacities, Ports & Urban Hubs",share:.34,kw:["metropolitan","port","population","city"]},{id:"geo_borders_flags",name:"Borders, Enclaves, Time Zones & Flags",share:.28,kw:["border","landlocked","flag","strait","island"]}]},{id:"geo_physical",name:"Mountains, Rivers & Physical Earth",share:.28,topics:[{id:"geo_mountains_volcanoes",name:"Mountain Ranges, Peaks & Volcanoes",share:.36,kw:["summit","elevation","peak","volcano","himalaya","andes"]},{id:"geo_rivers_lakes",name:"Great Rivers, Lakes, Seas & Straits",share:.36,kw:["river","tributary","lake","basin","delta"]},{id:"geo_deserts_tectonics",name:"Deserts, Glaciers & Tectonic Plates",share:.28,kw:["desert","glacier","trench","archipelago"]}]},{id:"geo_landmarks_aviation",name:"Landmarks, UNESCO & Aviation Hubs",share:.2,topics:[{id:"geo_unesco",name:"UNESCO World Heritage & Wonders",share:.44,kw:["unesco","heritage","temple","monument"]},{id:"geo_airports_transit",name:"International Airports, Canals & Bridges",share:.3,kw:["iata","airport","canal","bridge","rail"]},{id:"geo_regions_provinces",name:"States, Provinces & Subnational Regions",share:.26,kw:["province","prefecture","canton","state"]}]},{id:"geo_cartography",name:"Latitudes, Oceans & Polar Exploration",share:.18,topics:[{id:"geo_oceans_currents",name:"Oceans, Currents & Maritime Geography",share:.52,kw:["ocean","current","pacific","atlantic","reef"]},{id:"geo_polar_equator",name:"Equatorial, Arctic & Antarctic Geography",share:.48,kw:["arctic","antarctic","equator","tropic","latitude"]}]}],3:[{id:"art_painting_sculpture",name:"Fine Art, Painting & Sculpture",share:.32,topics:[{id:"art_renaissance_baroque",name:"Renaissance, Baroque & Old Masters",share:.36,kw:["rembrandt","caravaggio","leonardo","fresco","canvas"]},{id:"art_modern_impressionism",name:"Impressionism, Surrealism & Modern Art",share:.36,kw:["monet","picasso","dali","museum","gallery"]},{id:"art_sculpture_museums",name:"World Museums & Iconic Sculptures",share:.28,kw:["louvre","prado","marble","bronze","sculpture"]}]},{id:"art_architecture",name:"Architecture & Urban Design",share:.26,topics:[{id:"art_sacred_classical",name:"Cathedrals, Mosques, Palaces & Classical",share:.4,kw:["cathedral","dome","gothic","arch","palace"]},{id:"art_modernist_skyscrapers",name:"Modernist Architects & Supertall Towers",share:.35,kw:["architect","bauhaus","pritzker","skyscraper","tower"]},{id:"art_industrial_design",name:"Industrial, Graphic & Horological Design",share:.25,kw:["typography","chronograph","design","movement"]}]},{id:"art_classical_stage",name:"Classical Music, Opera & Ballet",share:.24,topics:[{id:"art_symphonies",name:"Symphonies, Concertos & Composers",share:.44,kw:["symphony","concerto","beethoven","mozart","bach"]},{id:"art_opera_ballet",name:"Grand Opera, Librettos & Ballet",share:.32,kw:["opera","puccini","verdi","soprano","ballet"]},{id:"art_instruments",name:"Musical Theory & World Instruments",share:.24,kw:["key","octave","violin","percussion"]}]},{id:"art_photography_fashion",name:"Photography, Couture & Decorative Arts",share:.18,topics:[{id:"art_photography",name:"Iconic Photography & Visual Media",share:.5,kw:["photograph","camera","exhibition"]},{id:"art_fashion_ceramics",name:"Haute Couture, Textiles & Ceramics",share:.5,kw:["atelier","porcelain","couture","tapestry"]}]}],4:[{id:"pop_cinema",name:"Cinema & World Film",share:.32,topics:[{id:"pop_directors_oscars",name:"Directors, Best Picture & Oscars",share:.38,kw:["directed","academy award","oscar","palme","film"]},{id:"pop_actors_roles",name:"Screen Legends, Performances & Roles",share:.34,kw:["starred","actor","actress","protagonist"]},{id:"pop_world_scifi_animation",name:"World Cinema, Sci-Fi & Animation",share:.28,kw:["animated","studio","trilogy","screenplay"]}]},{id:"pop_music",name:"Popular Music, Albums & Songcraft",share:.3,topics:[{id:"pop_rock_albums",name:"Classic Rock, Indie & Landmark Albums",share:.36,kw:["album","band","guitarist","released"]},{id:"pop_hits_hiphop_rnb",name:"Pop, Hip-Hop, R&B & Global Charts",share:.36,kw:["grammy","single","billboard","vocalist"]},{id:"pop_jazz_blues_electronic",name:"Jazz, Blues, Soul & Electronic Music",share:.28,kw:["jazz","saxophone","synthesizer","motown"]}]},{id:"pop_television",name:"Prestige Television & Streaming",share:.22,topics:[{id:"pop_drama_series",name:"Acclaimed Drama, Thriller & Sci-Fi Series",share:.54,kw:["series","emmy","season","showrunner"]},{id:"pop_comedy_animation_tv",name:"Sitcoms, Late Night & Animated TV",share:.46,kw:["sitcom","episode","creator","network"]}]},{id:"pop_theatre_comics",name:"Broadway, Graphic Novels & Cultural Icons",share:.16,topics:[{id:"pop_broadway",name:"Broadway Musicals & Tony Winners",share:.5,kw:["musical","broadway","tony"]},{id:"pop_comics_manga",name:"Comics, Manga & Graphic Storytelling",share:.5,kw:["manga","comic","creator","serialized"]}]}],5:[{id:"sports",name:"Sports",share:.74,topics:[{id:"sports_baseball",name:"Baseball",share:.14,kw:["baseball","mlb","world series","pitcher","home run","inning","ballpark","yankees","dodgers","red sox"]},{id:"sports_basketball",name:"Basketball",share:.13,kw:["basketball","nba","wnba","ncaa","rebound","three-point","finals"]},{id:"sports_american_football",name:"American Football",share:.13,kw:["nfl","super bowl","quarterback","touchdown","heisman","gridiron"]},{id:"sports_soccer",name:"Soccer / World Football",share:.16,kw:["fifa","world cup","premier league","champions league","striker","club","football"]},{id:"sports_ice_hockey",name:"Ice Hockey",share:.09,kw:["nhl","stanley cup","hockey","goalie","puck"]},{id:"sports_tennis",name:"Tennis",share:.08,kw:["wimbledon","grand slam","roland garros","us open","australian open","tennis"]},{id:"sports_golf",name:"Golf",share:.06,kw:["masters","pga","open championship","ryder cup","golf"]},{id:"sports_combat",name:"Boxing & Combat Sports",share:.06,kw:["heavyweight","boxing","knockout","ufc","judo","fencing"]},{id:"sports_olympics",name:"Track, Swimming & Olympics",share:.07,kw:["olympic","gold medal","marathon","decathlon","freestyle","world record"]},{id:"sports_motorsport",name:"Motorsport & Formula 1",share:.04,kw:["formula 1","grand prix","le mans","indy","constructor"]},{id:"sports_cricket_rugby",name:"Cricket & Rugby",share:.04,kw:["cricket","test match","wicket","ashes","rugby"]}]},{id:"games_esports",name:"Games & Esports",share:.26,topics:[{id:"games_chess_board",name:"Chess & Strategy Board Games",share:.36,kw:["chess","grandmaster","opening","checkmate","go","backgammon"]},{id:"games_video_consoles",name:"Video Games, Studios & Consoles",share:.42,kw:["console","nintendo","playstation","arcade","rpg","esports","developer"]},{id:"games_cards_tabletop",name:"Card, Puzzle & Tabletop Games",share:.22,kw:["bridge","poker","tarot","crossword","rubik","tabletop"]}]}],6:[{id:"tech_computing",name:"Computer Science, AI & Software",share:.34,topics:[{id:"tech_algorithms_os",name:"Algorithms, Languages & Operating Systems",share:.38,kw:["algorithm","unix","compiler","programming","kernel"]},{id:"tech_ai_crypto",name:"AI, Cryptography & Cybersecurity",share:.34,kw:["cipher","encryption","neural","turing","public-key"]},{id:"tech_internet_web",name:"Internet Protocols, Networking & Web",share:.28,kw:["tcp","http","rfc","packet","domain","browser"]}]},{id:"tech_hardware_chips",name:"Semiconductors, Electronics & Hardware",share:.24,topics:[{id:"tech_semiconductors",name:"Transistors, Microprocessors & Lithography",share:.54,kw:["transistor","silicon","microprocessor","nm","integrated circuit"]},{id:"tech_robotics_sensors",name:"Robotics, Lasers & Photonics",share:.46,kw:["laser","actuator","lidar","fiber optic","sensor"]}]},{id:"tech_aerospace_civil",name:"Aerospace, Energy & Civil Engineering",share:.24,topics:[{id:"tech_aviation_rockets",name:"Supersonic Aviation & Rocket Propulsion",share:.4,kw:["jet","turbine","propulsion","mach","airframe"]},{id:"tech_energy_grids",name:"Nuclear, Solar, Batteries & Megaprojects",share:.34,kw:["reactor","grid","lithium","hydroelectric","dam"]},{id:"tech_inventions",name:"Patents, Inventors & Industrial Breakthroughs",share:.26,kw:["patented","invented","telegraph","engine"]}]},{id:"tech_telecom",name:"Telecommunications & Standards",share:.18,topics:[{id:"tech_radio_satellites",name:"Radio, Satellites & GPS Constellations",share:.55,kw:["satellite","frequency","gps","orbital","radar"]},{id:"tech_storage_media",name:"Data Storage, Audio & Display Tech",share:.45,kw:["oled","magnetic","codec","bit"]}]}],7:[{id:"nat_zoology",name:"Zoology & Animal Kingdom",share:.34,topics:[{id:"nat_mammals_birds",name:"Mammals, Birds & Migration",share:.4,kw:["mammal","raptor","marsupial","primate","species"]},{id:"nat_marine_life",name:"Marine Biology, Cetaceans & Coral Reefs",share:.32,kw:["whale","shark","cephalopod","deep-sea","reef"]},{id:"nat_insects_herps",name:"Reptiles, Amphibians & Entomology",share:.28,kw:["venom","beetle","amphibian","reptile","metamorphosis"]}]},{id:"nat_botany_fungi",name:"Botany, Forestry & Mycology",share:.24,topics:[{id:"nat_trees_crops",name:"Trees, Flowering Plants & Ethnobotany",share:.56,kw:["conifer","botanical","orchids","pollen","canopy"]},{id:"nat_fungi_microbes",name:"Fungi, Lichens & Extremophiles",share:.44,kw:["mycelium","fungus","spore","lichen"]}]},{id:"nat_earth_climate",name:"Geology, Paleontology & Meteorology",share:.26,topics:[{id:"nat_minerals_gems",name:"Minerals, Gemstones & Rock Cycle",share:.36,kw:["mohs","mineral","igneous","quartz","corundum"]},{id:"nat_paleontology",name:"Dinosaurs, Fossils & Mass Extinctions",share:.34,kw:["cretaceous","jurassic","cambrian","fossil","theropod"]},{id:"nat_weather_atmosphere",name:"Atmosphere, Cyclones & Climate Systems",share:.3,kw:["stratosphere","monsoon","jet stream","barometric"]}]},{id:"nat_ecology",name:"Biomes, Conservation & National Parks",share:.16,topics:[{id:"nat_biomes_parks",name:"Rainforests, Tundra & Biosphere Reserves",share:.55,kw:["biome","savanna","national park","endemic"]},{id:"nat_evolution",name:"Evolutionary Biology & Naturalists",share:.45,kw:["darwin","adaptation","symbiosis","taxonomy"]}]}],8:[{id:"aff_geopolitics",name:"Diplomacy, International Law & Treaties",share:.3,topics:[{id:"aff_un_orgs",name:"UN, Courts, Alliances & Global Institutions",share:.4,kw:["united nations","hague","security council","geneva","charter"]},{id:"aff_constitutions",name:"Parliaments, Electoral Systems & Law",share:.34,kw:["bicameral","supreme court","constitution","referendum"]},{id:"aff_diplomatic_history",name:"Accords, Embassies & Intelligence",share:.26,kw:["accord","protocol","diplomatic","sanctions"]}]},{id:"aff_economics",name:"Macroeconomics, Central Banks & Trade",share:.3,topics:[{id:"aff_currencies_banks",name:"Currencies, Central Banks & Monetary Policy",share:.38,kw:["central bank","currency","inflation","reserve","bond"]},{id:"aff_economic_theory",name:"Economic Thinkers, Nobelists & Game Theory",share:.32,kw:["keynes","pareto","nash","elasticity","gdp"]},{id:"aff_global_trade",name:"Commodities, Shipping Lanes & Markets",share:.3,kw:["exchange","tariff","export","maritime","index"]}]},{id:"aff_philosophy_civic",name:"Political Philosophy, Ethics & Sociology",share:.22,topics:[{id:"aff_political_thought",name:"Social Contract, Jurisprudence & Ethics",share:.55,kw:["rousseau","locke","utilitarian","ethics","sovereignty"]},{id:"aff_demographics",name:"Global Demographics, Languages & Scripts",share:.45,kw:["official language","alphabet","script","census"]}]},{id:"aff_organizations",name:"World Prizes, Summits & Civic Milestones",share:.18,topics:[{id:"aff_nobel_peace",name:"Nobel Peace Laureates & Human Rights",share:.55,kw:["nobel peace","humanitarian","laureate"]},{id:"aff_global_indices",name:"Development, Energy Transition & Cities",share:.45,kw:["summit","convention","commission"]}]}],9:[{id:"food_world_cuisines",name:"Global Cuisines & National Dishes",share:.34,topics:[{id:"food_asian_cuisines",name:"East, South & Southeast Asian Gastronomy",share:.36,kw:["ramen","fermented","curry","wok","umami","sushi"]},{id:"food_med_european",name:"Mediterranean, French & European Classics",share:.36,kw:["sauce","pasta","bordeaux","pastry","braise"]},{id:"food_americas_levant",name:"Americas, Levantine & African Culinary Arts",share:.28,kw:["chili","masa","tagine","mezze","cacao"]}]},{id:"food_ingredients_science",name:"Spices, Pantry, Cheese & Food Science",share:.28,topics:[{id:"food_spices_herbs",name:"Botanical Spices, Chili Peppers & Herbs",share:.38,kw:["saffron","cardamom","scoville","bark","spice"]},{id:"food_cheese_fermentation",name:"Artisanal Cheeses, Bread & Fermentation",share:.34,kw:["pdo","milk","sourdough","cheese","aging"]},{id:"food_culinary_technique",name:"Knife Cuts, Mother Sauces & Maillard Chemistry",share:.28,kw:["emulsion","roux","julienne","maillard","confit"]}]},{id:"food_beverages",name:"Coffee, Tea, Viticulture & Spirits",share:.22,topics:[{id:"food_coffee_tea",name:"Specialty Coffee, Tea Estates & Cacao",share:.48,kw:["arabica","oolong","matcha","espresso","roast"]},{id:"food_wine_spirits",name:"Wine Regions, Varietals & Distillation",share:.52,kw:["vineyard","appellation","grape","cask","botanical"]}]},{id:"food_craft_traditions",name:"Master Crafts, Watchmaking & Heritage Trades",share:.16,topics:[{id:"food_horology_metals",name:"Haute Horlogerie, Metallurgy & Luthiery",share:.52,kw:["tourbillon","escapement","damascus","stradivarius"]},{id:"food_textiles_glass",name:"Weaving, Murano Glass & Ceramic Kilns",share:.48,kw:["loom","glaze","kiln","lacquer","indigo"]}]}],10:[{id:"myth_pantheons",name:"Classical & World Mythology",share:.34,topics:[{id:"myth_greek_roman",name:"Greek & Roman Mythology & Epics",share:.38,kw:["olympus","odyssey","iliad","apollo","athena","titan"]},{id:"myth_norse_celtic",name:"Norse, Celtic & Slavic Folklore",share:.32,kw:["odin","asgard","edda","valkyrie","runes"]},{id:"myth_egypt_asia_americas",name:"Egyptian, Vedic, East Asian & Mesoamerican Myth",share:.3,kw:["osiris","anubis","mahabharata","kami","quetzalcoatl"]}]},{id:"myth_world_lit",name:"World Novels, Playwrights & Laureates",share:.34,topics:[{id:"myth_classic_novels",name:"19th & 20th Century Masterpiece Novels",share:.4,kw:["novel","author","protagonist","published","tolstoy","austen"]},{id:"myth_shakespeare_drama",name:"Shakespeare, Tragedies & World Theatre",share:.3,kw:["shakespeare","tragedy","play","soliloquy","act"]},{id:"myth_nobel_modern_lit",name:"Nobel Literature, Postmodern & Speculative Fiction",share:.3,kw:["nobel prize in literature","borges","marquez","dystopian"]}]},{id:"myth_poetry_philosophy",name:"Poetry, Epics & Philosophical Texts",share:.18,topics:[{id:"myth_poets_forms",name:"Epic Poems, Sonnets & Laureate Poets",share:.52,kw:["sonnet","dante","homer","stanza","poet"]},{id:"myth_philosophy_classics",name:"Ancient & Modern Philosophical Treatises",share:.48,kw:["plato","aristotle","kant","nietzsche","stoic"]}]},{id:"myth_linguistics",name:"Etymology, Literary Devices & Archetypes",share:.14,topics:[{id:"myth_etymology_rhetoric",name:"Rhetorical Figures, Idioms & Etymology",share:.55,kw:["metaphor","oxymoron","latin","root","etymology"]},{id:"myth_mystery_detective",name:"Detective Fiction, Noir & Literary Sleuths",share:.45,kw:["detective","holmes","poirot","mystery"]}]}],11:[{id:"math_number_algebra",name:"Number Theory, Algebra & Mental Math",share:.32,topics:[{id:"math_number_theory",name:"Primes, Modular Arithmetic & Sequences",share:.38,kw:["prime","fibonacci","modulo","divisor","integer"]},{id:"math_mental_estimation",name:"Rapid Mental Estimation & Ratios",share:.34,kw:["ratio","percentage","factorial","power","root"]},{id:"math_algebra_calculus",name:"Functions, Series, Calculus & Linear Algebra",share:.28,kw:["derivative","integral","matrix","polynomial","limit"]}]},{id:"math_geometry_combinatorics",name:"Geometry, Probability & Combinatorics",share:.28,topics:[{id:"math_geometry_topology",name:"Euclidean Geometry, Polyhedra & Topology",share:.5,kw:["triangle","polyhedron","angle","hypotenuse","euler"]},{id:"math_probability_stats",name:"Probability, Bayes & Combinatorics",share:.5,kw:["probability","permutation","dice","expected value","bayes"]}]},{id:"math_logic_ciphers",name:"Formal Logic, Ciphers & Lateral Puzzles",share:.24,topics:[{id:"math_deductive_paradoxes",name:"Syllogisms, Knights & Knaves & Paradoxes",share:.52,kw:["paradox","truth","syllogism","implies","contrapositive"]},{id:"math_classical_ciphers",name:"Classical Ciphers, Codes & Pattern Sequences",share:.48,kw:["cipher","vigenere","caesar","sequence","pattern"]}]},{id:"math_game_history",name:"Game Theory & Great Mathematicians",share:.16,topics:[{id:"math_mathematicians",name:"Fields Medalists, Conjectures & Theorems",share:.54,kw:["theorem","conjecture","gauss","riemann","ramanu"]},{id:"math_game_strategy",name:"Combinatorial Games, Nim & Optimal Strategy",share:.46,kw:["equilibrium","strategy","zero-sum","payoff"]}]}]};let K=null,Y=null;function ve(r="./data/shards/taxonomy_tree.json"){return K!==null?Promise.resolve(K):Y||(typeof fetch!="function"?Promise.resolve(null):(Y=fetch(r).then(s=>s.ok?s.json():null).then(s=>(s&&typeof s=="object"&&(K=s),K)).catch(()=>null).finally(()=>{Y=null}),Y))}function V(r,s,i){for(const n of s){const h=Number(r[n]);if(Number.isFinite(h)&&h>=0)return Math.round(h)}return i}function X(r,s,i){for(const n of s){const h=r[n];if(typeof h=="string"&&h.trim().length>0)return h.trim()}return i}function ee(r,s){for(const i of s){const n=r[i];if(Array.isArray(n)&&n.length>0)return n.filter(h=>!!(h&&typeof h=="object"))}return null}function A(r){const s=String(r??"");return s.includes(",")?s.replace(/\b(in|circa|c\.|from|until|since|year|dated|trial|season|series|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\b([12]),(\d{3})(\s*(?:CE|BCE|AD|BC))\b/gi,"$1$2$3").replace(/\(([b.\s]*)([12]),(\d{3})\)/gi,"($1$2$3)").replace(/\b([12]),(\d{3})s\b/g,"$1$2s").replace(/\b([12]),(\d{3})\s*([–—-])\s*([12]),(\d{3})\b/g,"$1$2$3$4$5").replace(/(\d{1,2}[/-]\d{1,2}[/-])([12]),(\d{3})\b/g,"$1$2$3").replace(/(?<![\d,.])([12]),(\d{3})(?![\d,])(?!\s*(?:\+?\s*(?:qs?|questions?|pts?|points?|hits?|rbis?|km|mi|m|ft|kg|lbs?|verified|playable|topics?|missions?)\b))/gi,"$1$2"):s}function se(r){let s=0,i=0,n=0;for(const h of r){n+=h.verifiedCount,s+=h.subcategories.length;for(const o of h.subcategories)i+=o.topics.length}return{l0Count:r.length,l1Count:s,l2Count:i,totalVerified:n}}function ne(r,s){const i=s;let n=null;try{n=i?.getTaxonomyTree?.()??K}catch{n=K}let h=null;return Array.isArray(n)&&n.length>0?h=n:n&&typeof n=="object"&&(h=ee(n,["domains","l0Domains","nodes","tree","children"])),me.map(o=>{const v=r.byDomain.find(m=>m.domainId===o.id),a=Math.max(12e3,v?.totalPlayableCount??v?.verifiedCount??78e3),c=Math.max(0,v?a-(v.seenInDomainEst??0):a),d=h?.find(m=>Number(m.domainId??m.l0Domain??m.id)===o.id),L=d?ee(d,["l1Subcategories","subcategories","l1Categories","categories","children","l1"]):null;if(d&&L&&L.length>0){const m=V(d,["totalPlayableCount","verifiedCount","questionCount","totalCount","count"],a),C=L.map((x,I)=>{const S=X(x,["id","l1SubcategoryId","l1Id","key","slug"],`d${o.id}_l1_${I}`),P=A(X(x,["name","label","title"],`Category ${I+1}`)),j=ee(x,["topics","l2Topics","leaves","subtopics","children","l2"])??[],D=Math.max(2500,Math.round(m/Math.max(1,L.length))),y=V(x,["totalPlayableCount","verifiedCount","questionCount","totalCount","count"],D),q=j.map((b,E)=>{const z=X(b,["id","l2TopicId","l2Id","topicId","key","slug"],`${S}_t${E}`),N=A(X(b,["name","label","title"],`Topic ${E+1}`)),R=Math.max(1200,Math.round(y/Math.max(1,j.length))),W=V(b,["totalPlayableCount","verifiedCount","questionCount","totalCount","count"],R),Q=V(b,["unseenCount","unseen"],W),U=b.keywords,J=Array.isArray(U)?U.filter(B=>typeof B=="string"):void 0;return{id:z,name:N,domainId:o.id,domainName:o.name,l1Id:S,l1Name:P,verifiedCount:W,unseenCount:Q,keywords:J}}),e=q.reduce((b,E)=>b+E.verifiedCount,0),f=Math.max(y,e),u=V(x,["unseenCount","unseen"],f);return{id:S,name:P,domainId:o.id,domainName:o.name,verifiedCount:f,unseenCount:u,topics:q}}),g=C.reduce((x,I)=>x+I.verifiedCount,0),_=Math.max(m,g),$=V(d,["unseenCount","unseen"],_);return{domainId:o.id,name:o.name,shortName:o.shortName,medallionUrl:`./assets/ui/cat_${o.id}.png`,accentHex:o.accentHex,verifiedCount:_,unseenCount:$,subcategories:C}}const p=(we[o.id]??[]).map(m=>{const C=Math.max(3200,Math.round(a*m.share)),g=Math.max(0,Math.round(c*m.share)),_=m.topics.map($=>{const x=Math.max(2500,Math.round(C*$.share)),I=Math.max(0,Math.round(g*$.share));return{id:$.id,name:$.name,domainId:o.id,domainName:o.name,l1Id:m.id,l1Name:m.name,verifiedCount:x,unseenCount:I,keywords:$.kw}});return{id:m.id,name:m.name,domainId:o.id,domainName:o.name,verifiedCount:C,unseenCount:g,topics:_}});return{domainId:o.id,name:o.name,shortName:o.shortName,medallionUrl:`./assets/ui/cat_${o.id}.png`,accentHex:o.accentHex,verifiedCount:a,unseenCount:c,subcategories:p}})}function xe(r,s){const i=s.trim().toLowerCase();if(!i)return[];const n=[],h=new Set;for(const o of r){const v=o.name.toLowerCase().includes(i)||o.shortName.toLowerCase().includes(i);for(const a of o.subcategories){if(a.name.toLowerCase().includes(i)){const d=`L1::${o.domainId}::${a.id}`;h.has(d)||(h.add(d),n.push({kind:"L1",domainId:o.domainId,domainName:o.name,medallionUrl:o.medallionUrl,l1Id:a.id,l1Name:a.name,breadcrumb:`${o.shortName} › ${a.name}`,verifiedCount:a.verifiedCount}))}for(const d of a.topics){const L=d.keywords?.some(t=>t.toLowerCase().includes(i))??!1;if(d.name.toLowerCase().includes(i)||L||v&&n.length<24){const t=`L2::${o.domainId}::${a.id}::${d.id}`;h.has(t)||(h.add(t),n.push({kind:"L2",domainId:o.domainId,domainName:o.name,medallionUrl:o.medallionUrl,l1Id:a.id,l1Name:a.name,l2Id:d.id,l2Name:d.name,breadcrumb:`${o.shortName} › ${a.name} › ${d.name}`,verifiedCount:d.verifiedCount,keywords:d.keywords}))}}}}return n.sort((o,v)=>{const a=(o.l2Name??o.l1Name).toLowerCase(),c=(v.l2Name??v.l1Name).toLowerCase(),d=a===i?0:a.startsWith(i)?1:a.includes(i)?2:3,L=c===i?0:c.startsWith(i)?1:c.includes(i)?2:3;return d!==L?d-L:o.kind!==v.kind?o.kind==="L2"?-1:1:v.verifiedCount-o.verifiedCount}),n.slice(0,36)}const oe="ws-sleek-briefing-sheet-css",le="ws_preferred_difficulty_v2";function ye(){try{if(typeof localStorage>"u")return"ADAPTIVE";const r=localStorage.getItem(le);return r?te(r):"ADAPTIVE"}catch{return"ADAPTIVE"}}function ke(r){try{typeof localStorage<"u"&&localStorage.setItem(le,r)}catch{}}function k(r){return String(r??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function G(r){return Math.max(0,Math.round(r)).toLocaleString("en-US")}function _e(){if(typeof document>"u"||document.getElementById(oe))return;const r=document.createElement("style");r.id=oe,r.textContent=`
    .ws-velvet-backdrop.ws-briefing-modal {
      position: fixed;
      inset: 0;
      z-index: 65;
      background: rgba(3, 5, 10, 0.88);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 0;
      pointer-events: auto;
    }

    .ws-velvet-sheet.ws-briefing-sheet {
      position: relative;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      background:
        radial-gradient(ellipse 90% 34% at 50% 0%, rgba(216, 175, 87, 0.085) 0%, rgba(7, 10, 18, 0) 70%),
        #070a12;
      border: none !important;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
    }

    .ws-velvet-sheet.ws-briefing-sheet::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 4%, rgba(232, 197, 116, 0.42) 50%, transparent 96%);
      pointer-events: none;
      z-index: 10;
    }

    @media (min-width: 768px) and (min-height: 560px) {
      .ws-velvet-backdrop.ws-briefing-modal {
        align-items: center;
        padding: 20px;
      }
      .ws-velvet-sheet.ws-briefing-sheet {
        max-width: 840px;
        height: min(88dvh, 840px);
        max-height: min(88dvh, 840px);
        border-radius: 18px;
        box-shadow:
          0 32px 84px rgba(0, 0, 0, 0.84),
          0 0 0 1px rgba(242, 207, 126, 0.14);
      }
    }

    .ws-briefing-sheet .ws-sheet-header {
      position: sticky;
      top: 0;
      z-index: 8;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: minmax(76px, auto) minmax(0, 1fr) minmax(44px, auto);
      align-items: center;
      gap: 6px;
      min-height: calc(48px + env(safe-area-inset-top, 0px));
      padding: env(safe-area-inset-top, 0px) 8px 0 8px;
      background: rgba(7, 10, 18, 0.96);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .ws-briefing-sheet .ws-sheet-nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 5px;
      min-height: 44px;
      min-width: 44px;
      padding: 0 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--gold-bright, #f2cf7e);
      font-size: 13.5px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-nav-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffebb8;
    }

    .ws-briefing-sheet .ws-sheet-title {
      margin: 0;
      text-align: center;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: clamp(13.5px, 1.5vw, 16px);
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-sheet .ws-sheet-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(246, 242, 233, 0.66);
      font-size: 17px;
      line-height: 1;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-icon-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-subhead {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      padding: 2px 16px 6px;
      background: rgba(7, 10, 18, 0.94);
      border: none;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 2px;
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: none;
      white-space: nowrap;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs::-webkit-scrollbar {
      display: none;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs .ws-briefing-crumb {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      min-height: 36px;
      min-width: auto;
      padding: 4px 5px;
      border: none;
      border-radius: 0;
      background: transparent !important;
      color: rgba(246, 242, 233, 0.68);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
      font-size: 12.5px;
      font-weight: 500;
      letter-spacing: 0.01em;
      transition: color 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs .ws-briefing-crumb:hover {
      background: transparent !important;
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-sheet .ws-sheet-breadcrumbs .ws-briefing-crumb.is-current {
      background: transparent !important;
      color: var(--gold-bright, #f2cf7e);
      font-weight: 600;
    }

    .ws-briefing-crumb-sep {
      color: rgba(246, 242, 233, 0.56);
      font-size: 13px;
      padding: 0 2px;
      user-select: none;
      flex-shrink: 0;
    }

    .ws-briefing-search-wrap {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .ws-briefing-search-icon {
      position: absolute;
      left: 2px;
      width: 15px;
      height: 15px;
      color: rgba(246, 242, 233, 0.62);
      pointer-events: none;
    }

    .ws-briefing-sheet .ws-sheet-search {
      width: 100%;
      max-width: none;
      min-height: 44px;
      padding: 8px 44px 8px 26px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 0;
      background: transparent;
      color: var(--ivory-primary, #f6f2e9);
      font-size: 14.5px;
      font-weight: 400;
      outline: none;
      box-shadow: none;
      transition: border-color 0.16s ease;
    }

    .ws-briefing-sheet .ws-sheet-search::placeholder {
      color: rgba(246, 242, 233, 0.60);
    }

    .ws-briefing-sheet .ws-sheet-search:focus {
      border-bottom-color: rgba(242, 207, 126, 0.78);
    }

    .ws-briefing-sheet .ws-sheet-search::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }

    .ws-briefing-search-clear {
      position: absolute;
      right: -4px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: none;
      background: transparent;
      color: rgba(246, 242, 233, 0.68);
      font-size: 14px;
    }

    .ws-briefing-search-clear:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      border: none;
    }

    .ws-briefing-section-label {
      padding: 10px 16px 6px;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(246, 242, 233, 0.62);
      font-variant-numeric: tabular-nums;
    }

    .ws-briefing-sheet .ws-sheet-list {
      display: flex;
      flex-direction: column;
      width: 100%;
      border: none;
    }

    @media (min-width: 720px) {
      .ws-briefing-sheet .ws-sheet-list {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .ws-briefing-sheet .ws-sheet-row:nth-child(even) {
        box-shadow: inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
      .ws-briefing-sheet .ws-sheet-row.is-selected:nth-child(even) {
        box-shadow:
          inset 3px 0 0 var(--gold-bright, #f2cf7e),
          inset 1px 0 0 rgba(255, 255, 255, 0.05);
      }
    }

    .ws-briefing-sheet .ws-sheet-row {
      width: 100%;
      min-height: 58px;
      padding: 11px 16px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 0;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 13px;
      text-align: left;
      transition: background 0.14s ease;
    }

    .ws-briefing-sheet .ws-sheet-row:hover {
      background: rgba(255, 255, 255, 0.036);
    }

    .ws-briefing-sheet .ws-sheet-row:active {
      background: rgba(242, 207, 126, 0.07);
    }

    .ws-briefing-sheet .ws-sheet-row.is-selected {
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.11) 0%, rgba(242, 207, 126, 0.025) 100%);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-row-icon {
      width: 34px;
      height: 34px;
      object-fit: contain;
      flex-shrink: 0;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.55));
    }

    .ws-briefing-row-all-glyph {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: rgba(242, 207, 126, 0.12);
      color: var(--gold-bright, #f2cf7e);
      font-size: 14px;
    }

    .ws-briefing-row-copy {
      min-width: 0;
      flex: 1 1 auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ws-briefing-row-title {
      font-size: 14.5px;
      font-weight: 600;
      line-height: 1.25;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-sheet .ws-sheet-row.is-selected .ws-briefing-row-title {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-row-sub {
      font-size: 11.5px;
      line-height: 1.25;
      color: rgba(246, 242, 233, 0.64);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-row-meta {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 7px;
      margin-left: 6px;
    }

    .ws-briefing-row-count {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11.5px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: rgba(242, 207, 126, 0.88);
      white-space: nowrap;
    }

    .ws-briefing-row-chevron {
      font-size: 18px;
      line-height: 1;
      color: rgba(246, 242, 233, 0.60);
      width: 14px;
      text-align: center;
    }

    .ws-briefing-row-check {
      font-size: 14px;
      font-weight: 800;
      line-height: 1;
      color: var(--gold-bright, #f2cf7e);
      width: 16px;
      text-align: center;
    }

    .ws-briefing-empty {
      padding: 36px 20px;
      text-align: center;
      color: rgba(246, 242, 233, 0.58);
      font-size: 13.5px;
      line-height: 1.5;
    }

    .ws-briefing-empty-chips {
      margin-top: 14px;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
    }

    .ws-briefing-suggest-btn {
      min-height: 44px;
      padding: 0 14px;
      border: none;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--gold-bright, #f2cf7e);
      font-size: 12.5px;
      font-weight: 600;
    }

    .ws-briefing-suggest-btn:hover {
      background: rgba(242, 207, 126, 0.16);
    }

    .ws-briefing-sheet .ws-sheet-footer {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
      gap: 8px;
      padding: 10px 16px max(12px, env(safe-area-inset-bottom, 0px));
      background: rgba(6, 9, 16, 0.98);
      border: none;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: none;
    }

    .ws-briefing-footer-top {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }

    .ws-briefing-target-line {
      min-width: 0;
      flex: 0 0 auto;
      width: 100%;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 8px;
      font-size: 12px;
      color: rgba(246, 242, 233, 0.62);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-target-name {
      color: var(--ivory-primary, #f6f2e9);
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-target-qs {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      color: var(--gold-bright, #f2cf7e);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }

    .ws-briefing-diff-strip {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 2px;
      width: 100%;
      background: rgba(255, 255, 255, 0.045);
      border-radius: 9px;
      padding: 2px;
      border: none;
      overflow: hidden;
    }

    .ws-briefing-diff-btn {
      flex: 1 0 auto;
      min-height: 36px;
      min-width: 0;
      padding: 0 5px;
      border: none;
      border-radius: 7px;
      background: transparent;
      color: rgba(246, 242, 233, 0.72);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
      font-size: 10.5px;
      font-weight: 600;
      letter-spacing: 0.01em;
      white-space: nowrap;
      text-align: center;
      transition: background 0.14s ease, color 0.14s ease;
    }

    @media (max-width: 399px) {
      .ws-briefing-sheet .ws-sheet-footer {
        padding-left: 10px;
        padding-right: 10px;
      }
      .ws-briefing-diff-btn {
        font-size: 10px;
        padding: 0 3.5px;
        letter-spacing: 0;
      }
    }

    .ws-briefing-diff-btn.is-active {
      background: rgba(242, 207, 126, 0.2);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-diff-indicator {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
      line-height: 1.25;
      color: rgba(246, 242, 233, 0.76);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-briefing-diff-indicator strong {
      color: var(--gold-bright, #f2cf7e);
      font-weight: 700;
    }

    .ws-briefing-footer-main {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      width: 100%;
      gap: 8px;
    }

    .ws-briefing-sheet .ws-segmented-group {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 3px;
      padding: 3px;
      border-radius: 11px;
      background: rgba(255, 255, 255, 0.055);
      border: none;
      flex: 0 0 auto;
      width: 100%;
    }

    .ws-briefing-sheet .ws-segmented-btn {
      min-height: 44px;
      min-width: 44px;
      padding: 0 8px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(246, 242, 233, 0.64);
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 12px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-briefing-sheet .ws-segmented-btn:hover {
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-briefing-sheet .ws-segmented-btn.is-active {
      background: rgba(242, 207, 126, 0.2);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-briefing-launch-cta {
      flex: 0 0 auto;
      width: 100%;
      min-height: 48px;
      padding: 0 20px;
      border: none !important;
      border-radius: 12px;
      background: linear-gradient(180deg, #fae29c 0%, #d8ab4e 56%, #b5842c 100%);
      color: #0e121a;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      white-space: nowrap;
      box-shadow: 0 8px 24px rgba(216, 175, 87, 0.28);
      transition: filter 0.14s ease, transform 0.12s ease;
    }

    @media (min-width: 640px) {
      .ws-briefing-footer-top {
        flex-direction: column;
        align-items: stretch;
        gap: 6px;
      }
      .ws-briefing-target-line {
        flex: 0 0 auto;
        width: 100%;
        justify-content: space-between;
      }
      .ws-briefing-diff-strip {
        display: flex;
        width: 100%;
        gap: 3px;
      }
      .ws-briefing-diff-btn {
        min-width: 56px;
        padding: 0 10px;
        font-size: 11px;
      }
      .ws-briefing-footer-main {
        flex-direction: row;
        align-items: center;
        gap: 10px;
      }
      .ws-briefing-sheet .ws-segmented-group {
        flex: 1 1 260px;
        width: auto;
      }
      .ws-briefing-launch-cta {
        flex: 1.15 1 220px;
        width: auto;
      }
    }

    .ws-briefing-launch-cta:hover {
      filter: brightness(1.06);
    }

    .ws-briefing-launch-cta:active {
      transform: scale(0.99);
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-briefing-sheet .ws-sheet-header {
        min-height: 44px;
      }
      .ws-briefing-subhead {
        flex-direction: row;
        align-items: center;
        gap: 14px;
        padding: 0 16px 4px;
      }
      .ws-briefing-sheet .ws-sheet-breadcrumbs {
        flex: 0 1 auto;
        max-width: 52%;
      }
      .ws-briefing-search-wrap {
        flex: 1 1 220px;
      }
      .ws-briefing-sheet .ws-sheet-search {
        min-height: 40px;
        padding: 4px 36px 4px 24px;
        font-size: 13px;
      }
      .ws-briefing-sheet .ws-sheet-row {
        min-height: 48px;
        padding: 7px 14px;
      }
      .ws-briefing-sheet .ws-sheet-footer {
        padding: 6px 14px max(6px, env(safe-area-inset-bottom, 0px));
        gap: 5px;
      }
      .ws-briefing-footer-top {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .ws-briefing-target-line {
        flex: 0 1 200px;
        width: auto;
        min-width: 0;
        justify-content: flex-start;
      }
      .ws-briefing-diff-strip {
        flex: 1 1 auto;
        width: auto;
        max-width: 540px;
      }
      .ws-briefing-diff-btn {
        min-height: 32px;
        padding: 0 8px;
        font-size: 10.5px;
      }
      .ws-briefing-diff-indicator {
        display: none;
      }
      .ws-briefing-footer-main {
        flex-direction: row;
        align-items: center;
        gap: 8px;
      }
      .ws-briefing-sheet .ws-segmented-group {
        flex: 1 1 220px;
        width: auto;
      }
      .ws-briefing-launch-cta {
        flex: 1.15 1 200px;
        width: auto;
        min-height: 44px;
      }
    }
  `,document.head.appendChild(r)}class Se{audio;haptics;modalEl=null;boundKeyDown=null;constructor(s,i){this.audio=s,this.haptics=i}isOpen(){return this.modalEl!==null}open(s,i,n,h){this.close(),_e();let o=ne(s,h?.forgeInstance),v=h?.initialL0DomainId??null,a=h?.initialL1SubcategoryId??null,c=h?.initialL2TopicId??null,d=h?.initialSearchQuery??"",L=ye(),t=10;const p=document.createElement("div");p.className="ws-modal-backdrop ws-briefing-modal ws-velvet-backdrop",p.setAttribute("role","dialog"),p.setAttribute("aria-modal","true"),p.setAttribute("aria-label","The Briefing Room 3-Level Category & Subcategory Picker");const m=()=>{const e=v!==null?o.find(E=>E.domainId===v)??null:null,f=e&&a?e.subcategories.find(E=>E.id===a)??null:null,u=f&&c?f.topics.find(E=>E.id===c)??null:null;if(e&&f&&u){const z=e.shortName.trim().toLowerCase()===f.name.trim().toLowerCase()?`${e.name} › ${u.name}`:`${e.shortName} › ${f.name} › ${u.name}`;return{domains:[e.domainId],l0DomainId:e.domainId,l1SubcategoryId:f.id,l2TopicId:u.id,selectionLabel:z,topicKeywords:u.keywords,difficulty:L,count:t,poolCount:u.verifiedCount}}if(e&&f){const E=e.shortName.trim().toLowerCase()===f.name.trim().toLowerCase();return{domains:[e.domainId],l0DomainId:e.domainId,l1SubcategoryId:f.id,selectionLabel:E?`${e.name} › ${f.name}`:`${e.shortName} › ${f.name}`,difficulty:L,count:t,poolCount:f.verifiedCount}}if(e)return{domains:[e.domainId],l0DomainId:e.domainId,selectionLabel:e.name,difficulty:L,count:t,poolCount:e.verifiedCount};const b=Math.max(1000129,s.totalPlayableCount,se(o).totalVerified);return{domains:[],selectionLabel:"Global Mix (All 12 Domains)",difficulty:L,count:t,poolCount:b}},C=()=>{if(d.trim().length>0){d="";const e=p.querySelector("#ws-briefing-search");e&&(e.value=""),y();return}if(c!==null){c=null,y();return}if(a!==null){a=null,y();return}if(v!==null){v=null,y();return}this.close(),n?.()},g=se(o);p.innerHTML=`
      <div class="ws-velvet-sheet ws-briefing-sheet">
        <header class="ws-sheet-header">
          <button type="button" class="ws-sheet-nav-btn" id="ws-cat-back-btn">
            ← Back
          </button>
          <h2 class="ws-sheet-title" id="ws-briefing-title">Briefing Room</h2>
          <button type="button" class="ws-sheet-icon-btn" id="ws-cat-close-btn" aria-label="Close">
            ✕
          </button>
        </header>

        <div class="ws-briefing-subhead">
          <nav class="ws-sheet-breadcrumbs" id="ws-briefing-breadcrumbs" aria-label="Category trail"></nav>
          <div class="ws-briefing-search-wrap">
            <svg class="ws-briefing-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="1.8" />
              <path d="M13.6 13.6L17.5 17.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
            <input
              type="search"
              id="ws-briefing-search"
              class="ws-sheet-search"
              autocomplete="off"
              spellcheck="false"
              placeholder="Search ${g.l2Count} topics, e.g. Baseball..."
              value="${k(d)}"
            />
            <button
              type="button"
              class="ws-briefing-search-clear"
              id="ws-briefing-search-clear"
              aria-label="Clear search"
              style="display:${d?"inline-flex":"none"};"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="ws-briefing-scroll" id="ws-briefing-results"></div>

        <footer class="ws-sheet-footer" id="ws-briefing-footer"></footer>
      </div>
    `;const _=p.querySelector("#ws-briefing-title"),$=p.querySelector("#ws-briefing-breadcrumbs"),x=p.querySelector("#ws-briefing-results"),I=p.querySelector("#ws-briefing-footer"),S=p.querySelector("#ws-briefing-search"),P=p.querySelector("#ws-briefing-search-clear"),j=p.querySelector("#ws-cat-back-btn"),D=p.querySelector("#ws-cat-close-btn"),y=()=>{const e=se(o),f=Math.max(1000129,s.totalPlayableCount,e.totalVerified);S.placeholder=`Search ${e.l2Count} topics, e.g. Baseball...`,P.style.display=d.length>0?"inline-flex":"none";const u=v!==null?o.find(l=>l.domainId===v)??null:null,b=u&&a?u.subcategories.find(l=>l.id===a)??null:null,E=b&&c?b.topics.find(l=>l.id===c)??null:null,z=d.trim();z.length>0?_.textContent="Search Topics":b?_.textContent=A(b.name):u?_.textContent=A(u.name):_.textContent="Briefing Room";const N=[];if(N.push(`
        <button
          type="button"
          id="ws-cat-global-mix"
          data-ws-allow-compact="1"
          class="ws-briefing-crumb ${!u&&!z?"is-current":""}"
          data-crumb="ROOT"
        >All Domains</button>
      `),u&&(N.push('<span class="ws-briefing-crumb-sep" aria-hidden="true">›</span>'),N.push(`
          <button
            type="button"
            data-ws-allow-compact="1"
            class="ws-briefing-crumb ${!b&&!z?"is-current":""}"
            data-crumb="L0"
          >${k(A(u.name))}</button>
        `)),u&&b&&(N.push('<span class="ws-briefing-crumb-sep" aria-hidden="true">›</span>'),N.push(`
          <button
            type="button"
            data-ws-allow-compact="1"
            class="ws-briefing-crumb ${!E&&!z?"is-current":""}"
            data-crumb="L1"
          >${k(A(b.name))}</button>
        `)),u&&b&&E&&(N.push('<span class="ws-briefing-crumb-sep" aria-hidden="true">›</span>'),N.push(`
          <span class="ws-briefing-crumb is-current">${k(A(E.name))}</span>
        `)),$.innerHTML=N.join(""),$.querySelector('[data-crumb="ROOT"]')?.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),v=null,a=null,c=null,d="",S.value="",y()}),$.querySelector('[data-crumb="L0"]')?.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),a=null,c=null,d="",S.value="",y()}),$.querySelector('[data-crumb="L1"]')?.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),c=null,d="",S.value="",y()}),z.length>0){const l=xe(o,z);l.length===0?(x.innerHTML=`
            <div class="ws-briefing-empty">
              No specialist topics matched “<strong style="color:var(--ivory-primary);">${k(z)}</strong>”.
              <div class="ws-briefing-empty-chips">
                ${["Baseball","World War II","Exoplanets","Chess","Oscars"].map(w=>`
                  <button type="button" class="ws-briefing-suggest-btn" data-suggest-q="${k(w)}">
                    ${k(w)}
                  </button>
                `).join("")}
              </div>
            </div>
          `,x.querySelectorAll("[data-suggest-q]").forEach(w=>{w.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),d=w.dataset.suggestQ||"",S.value=d,y()})})):(x.innerHTML=`
            <div class="ws-briefing-section-label">
              ${l.length} Matching ${l.length===1?"Topic":"Topics"}
            </div>
            <div class="ws-sheet-list">
              ${l.map(w=>{const O=v===w.domainId&&a===w.l1Id&&(w.kind==="L2"?c===w.l2Id:c===null),pe=A(w.l2Name??w.l1Name),he=A(w.breadcrumb);return`
                    <button
                      type="button"
                      class="ws-sheet-row ${O?"is-selected":""}"
                      data-hit-dom="${w.domainId}"
                      data-hit-l1="${k(w.l1Id)}"
                      data-hit-l2="${k(w.l2Id??"")}"
                    >
                      <img class="ws-briefing-row-icon" src="${k(w.medallionUrl)}" alt="" />
                      <div class="ws-briefing-row-copy">
                        <div class="ws-briefing-row-title">${k(pe)}</div>
                        <div class="ws-briefing-row-sub">${k(he)}</div>
                      </div>
                      <div class="ws-briefing-row-meta">
                        <span class="ws-briefing-row-count">${G(w.verifiedCount)} Qs</span>
                        <span class="ws-briefing-row-chevron" aria-hidden="true">›</span>
                      </div>
                    </button>
                  `}).join("")}
            </div>
          `,x.querySelectorAll("[data-hit-dom]").forEach(w=>{w.addEventListener("click",()=>{this.haptics.sightlineSnap(),this.audio.playSfx("sightline_snap"),v=Number(w.dataset.hitDom),a=w.dataset.hitL1||null,c=w.dataset.hitL2||null,d="",S.value="",y()})}))}else u?b?(x.innerHTML=`
          <div class="ws-briefing-section-label">
            ${k(A(b.name))} · ${b.topics.length} Specialist Topics
          </div>
          <div class="ws-sheet-list">
            <button
              type="button"
              class="ws-sheet-row ${c===null?"is-selected":""}"
              id="ws-all-l1-topics"
            >
              <span class="ws-briefing-row-all-glyph" aria-hidden="true">✦</span>
              <div class="ws-briefing-row-copy">
                <div class="ws-briefing-row-title">All ${k(A(b.name))}</div>
                <div class="ws-briefing-row-sub">Full category mix across ${b.topics.length} topics</div>
              </div>
              <div class="ws-briefing-row-meta">
                <span class="ws-briefing-row-count">${G(b.verifiedCount)} Qs</span>
                <span class="ws-briefing-row-check" aria-hidden="true">${c===null?"✓":""}</span>
              </div>
            </button>
            ${b.topics.map(l=>{const w=c===l.id,O=l.keywords?.length?l.keywords.slice(0,4).map(A).join(" · "):`${A(u.shortName)} › ${A(b.name)}`;return`
                  <button
                    type="button"
                    class="ws-sheet-row ${w?"is-selected":""}"
                    data-pick-l2="${k(l.id)}"
                  >
                    <img class="ws-briefing-row-icon" src="${k(u.medallionUrl)}" alt="" />
                    <div class="ws-briefing-row-copy">
                      <div class="ws-briefing-row-title">${k(A(l.name))}</div>
                      <div class="ws-briefing-row-sub">${k(O)}</div>
                    </div>
                    <div class="ws-briefing-row-meta">
                      <span class="ws-briefing-row-count">${G(l.verifiedCount)} Qs</span>
                      <span class="ws-briefing-row-check" aria-hidden="true">${w?"✓":""}</span>
                    </div>
                  </button>
                `}).join("")}
          </div>
        `,x.querySelector("#ws-all-l1-topics")?.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),c=null,y()}),x.querySelectorAll("[data-pick-l2]").forEach(l=>{l.addEventListener("click",()=>{this.haptics.sightlineSnap(),this.audio.playSfx("sightline_snap");const w=l.dataset.pickL2||null;c=c===w?null:w,y()})})):(x.innerHTML=`
          <div class="ws-briefing-section-label">
            ${k(A(u.name))} · ${u.subcategories.length} Categories · ${G(u.verifiedCount)} Qs
          </div>
          <div class="ws-sheet-list">
            ${u.subcategories.map(l=>{const w=l.topics.slice(0,4).map(O=>A(O.name)).join(" · ");return`
                  <button type="button" class="ws-sheet-row" data-pick-l1="${k(l.id)}">
                    <img class="ws-briefing-row-icon" src="${k(u.medallionUrl)}" alt="" />
                    <div class="ws-briefing-row-copy">
                      <div class="ws-briefing-row-title">${k(A(l.name))}</div>
                      <div class="ws-briefing-row-sub">${k(w)}</div>
                    </div>
                    <div class="ws-briefing-row-meta">
                      <span class="ws-briefing-row-count">${G(l.verifiedCount)} Qs</span>
                      <span class="ws-briefing-row-chevron" aria-hidden="true">›</span>
                    </div>
                  </button>
                `}).join("")}
          </div>
        `,x.querySelectorAll("[data-pick-l1]").forEach(l=>{l.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),a=l.dataset.pickL1||null,c=null,x.scrollTop=0,y()})})):(x.innerHTML=`
          <div class="ws-briefing-section-label">
            ${e.l0Count} Domains · ${e.l2Count} Topics · ${G(f)} Playable Qs
          </div>
          <div class="ws-sheet-list">
            ${o.map(l=>{const w=l.subcategories.slice(0,3).map(O=>A(O.name)).join(" · ");return`
                  <button type="button" class="ws-sheet-row" data-pick-l0="${l.domainId}">
                    <img class="ws-briefing-row-icon" src="${k(l.medallionUrl)}" alt="" />
                    <div class="ws-briefing-row-copy">
                      <div class="ws-briefing-row-title">${k(A(l.name))}</div>
                      <div class="ws-briefing-row-sub">${k(w)}</div>
                    </div>
                    <div class="ws-briefing-row-meta">
                      <span class="ws-briefing-row-count">${G(l.verifiedCount)} Qs</span>
                      <span class="ws-briefing-row-chevron" aria-hidden="true">›</span>
                    </div>
                  </button>
                `}).join("")}
          </div>
        `,x.querySelectorAll("[data-pick-l0]").forEach(l=>{l.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),v=Number(l.dataset.pickL0),a=null,c=null,x.scrollTop=0,y()})}));const R=m(),W=[{val:5,label:"5"},{val:10,label:"10"},{val:20,label:"20"},{val:50,label:"50 Qs"}],Q=[{val:"ADAPTIVE",label:"Auto"},{val:"MIDDLE_SCHOOL",label:"Mid School"},{val:"HIGH_SCHOOL",label:"High School"},{val:"COLLEGE",label:"College"},{val:"GRADUATE",label:"Graduate"},{val:"MENSA",label:"Mensa"}],U=te(L),J=ue(U),B=J?ge(J):null,ce=B?B.scoreMultiplier.toFixed(Math.abs(B.scoreMultiplier*10-Math.round(B.scoreMultiplier*10))<1e-6?1:2):"",de=B?`<span><strong>${k(B.label)}</strong> · ${k(B.subtitle)} (${ce}x)</span><span>${B.timerSec}s</span>`:"<span><strong>Auto Adaptive</strong> · Scales Live to Your Meridian Elo</span><span>18s</span>";I.innerHTML=`
        <div class="ws-briefing-footer-top">
          <div class="ws-briefing-target-line">
            <span class="ws-briefing-target-name">${k(A(R.selectionLabel))}</span>
            <span class="ws-briefing-target-qs">${G(R.poolCount)} Qs</span>
          </div>
          <div class="ws-briefing-diff-strip" role="group" aria-label="Academic difficulty tier">
            ${Q.map(l=>`
              <button
                type="button"
                data-ws-allow-compact="1"
                class="ws-briefing-diff-btn ${U===l.val?"is-active":""}"
                data-diff="${l.val}"
                aria-pressed="${U===l.val?"true":"false"}"
              >${l.label}</button>
            `).join("")}
          </div>
          <div class="ws-briefing-diff-indicator" id="ws-briefing-diff-indicator">
            ${de}
          </div>
        </div>

        <div class="ws-briefing-footer-main">
          <div class="ws-segmented-group" role="group" aria-label="Round length">
            ${W.map(l=>`
              <button
                type="button"
                class="ws-segmented-btn ${t===l.val?"is-active":""}"
                data-len="${l.val}"
              >${l.label}</button>
            `).join("")}
          </div>

          <button type="button" class="ws-briefing-launch-cta" id="ws-cat-launch">
            START BRIEFING ▶
          </button>
        </div>
      `,I.querySelectorAll("[data-diff]").forEach(l=>{l.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),L=te(l.dataset.diff),ke(L),y()})}),I.querySelectorAll("[data-len]").forEach(l=>{l.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),t=Number(l.dataset.len),y()})}),I.querySelector("#ws-cat-launch")?.addEventListener("click",()=>{this.haptics.sightlineSnap(),this.audio.playSfx("sightline_snap");const{poolCount:l,...w}=m();this.close(),i(w)})};S.addEventListener("input",()=>{d=S.value,y()}),P.addEventListener("click",()=>{this.haptics.uiTap(),d="",S.value="",S.focus(),y()}),S.addEventListener("keydown",e=>{e.stopPropagation(),e.key==="Escape"&&(e.preventDefault(),S.value?(S.value="",d="",y()):(this.close(),n?.()))}),j.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),C()}),D.addEventListener("click",()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),this.close(),n?.()}),y(),typeof h?.forgeInstance?.getTaxonomyTree=="function"||ve().then(e=>{e&&this.modalEl===p&&(o=ne(s,h?.forgeInstance),y())}),p.addEventListener("click",e=>{e.target===p&&(this.close(),n?.())}),this.boundKeyDown=e=>{const f=document.activeElement?.tagName.toUpperCase();f==="INPUT"||f==="TEXTAREA"||e.key==="Escape"&&(e.preventDefault(),C())},window.addEventListener("keydown",this.boundKeyDown),document.body.appendChild(p),this.modalEl=p}close(){this.boundKeyDown&&(window.removeEventListener("keydown",this.boundKeyDown),this.boundKeyDown=null),this.modalEl&&(this.modalEl.remove(),this.modalEl=null)}}const Ae=Object.freeze(Object.defineProperty({__proto__:null,BriefingCategoriesModal:Se},Symbol.toStringTag,{value:"Module"})),re="ws-sleek-saves-sheet-css",$e=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];function F(r){return String(r??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function H(r){const s=String(r??"");return s.includes(",")?s.replace(/\b(in|circa|c\.|from|until|since|year|dated|trial|season|series|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+([12]),(\d{3})\b/gi,"$1 $2$3").replace(/\b([12]),(\d{3})(\s*(?:CE|BCE|AD|BC))\b/gi,"$1$2$3").replace(/\(([b.\s]*)([12]),(\d{3})\)/gi,"($1$2$3)").replace(/(\d{1,2}[/-]\d{1,2}[/-])([12]),(\d{3})\b/g,"$1$2$3").replace(/(?<![\d,.])([12]),(\d{3})(?![\d,])(?!\s*(?:qs?|questions?|pts?|points?|missions?|hrs?|hours?)\b)/gi,"$1$2"):s}function Ce(r){const s=H(r).trim();if(!s||s.toUpperCase()==="EMPTY")return"Unassigned";if(/\d{4}/.test(s)&&(/[/:T-]/.test(s)||/[A-Za-z]{3}/.test(s))){const n=new Date(s);if(!Number.isNaN(n.getTime())){const h=$e[n.getMonth()]??"Jan",o=n.getDate(),v=String(n.getFullYear()),a=String(n.getHours()).padStart(2,"0"),c=String(n.getMinutes()).padStart(2,"0");return`${h} ${o} ${v} · ${a}:${c}`}}return s}function Ee(){if(typeof document>"u"||document.getElementById(re))return;const r=document.createElement("style");r.id=re,r.textContent=`
    .ws-velvet-backdrop.ws-save-modal {
      position: fixed;
      inset: 0;
      z-index: 65;
      background: rgba(3, 5, 10, 0.88);
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      display: flex;
      align-items: stretch;
      justify-content: center;
      padding: 0;
      pointer-events: auto;
    }

    .ws-velvet-sheet.ws-saves-sheet {
      position: relative;
      width: 100%;
      height: 100vh;
      height: 100dvh;
      max-height: 100dvh;
      background:
        radial-gradient(ellipse 90% 34% at 50% 0%, rgba(216, 175, 87, 0.08) 0%, rgba(7, 10, 18, 0) 70%),
        #070a12;
      border: none !important;
      border-radius: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      color: var(--ivory-primary, #f6f2e9);
      font-family: var(--font-sans, 'Inter', -apple-system, BlinkMacSystemFont, sans-serif);
    }

    .ws-velvet-sheet.ws-saves-sheet::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent 4%, rgba(232, 197, 116, 0.42) 50%, transparent 96%);
      pointer-events: none;
      z-index: 10;
    }

    @media (min-width: 768px) and (min-height: 560px) {
      .ws-velvet-backdrop.ws-save-modal {
        align-items: center;
        padding: 20px;
      }
      .ws-velvet-sheet.ws-saves-sheet {
        max-width: 780px;
        height: min(88dvh, 840px);
        max-height: min(88dvh, 840px);
        border-radius: 18px;
        box-shadow:
          0 32px 84px rgba(0, 0, 0, 0.84),
          0 0 0 1px rgba(242, 207, 126, 0.14);
      }
    }

    .ws-saves-sheet .ws-sheet-header {
      position: sticky;
      top: 0;
      z-index: 8;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: minmax(76px, auto) minmax(0, 1fr) minmax(44px, auto);
      align-items: center;
      gap: 6px;
      min-height: calc(48px + env(safe-area-inset-top, 0px));
      padding: env(safe-area-inset-top, 0px) 8px 0 8px;
      background: rgba(7, 10, 18, 0.96);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }

    .ws-saves-sheet .ws-sheet-nav-btn {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      gap: 5px;
      min-height: 44px;
      min-width: 44px;
      padding: 0 10px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--gold-bright, #f2cf7e);
      font-size: 13.5px;
      font-weight: 600;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-saves-sheet .ws-sheet-nav-btn:hover {
      background: rgba(255, 255, 255, 0.06);
      color: #ffebb8;
    }

    .ws-saves-sheet .ws-sheet-title {
      margin: 0;
      text-align: center;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: clamp(13.5px, 1.5vw, 16px);
      font-weight: 700;
      letter-spacing: 0.09em;
      text-transform: uppercase;
      color: var(--ivory-primary, #f6f2e9);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ws-saves-sheet .ws-sheet-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      min-height: 44px;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: rgba(246, 242, 233, 0.66);
      font-size: 17px;
      line-height: 1;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-saves-sheet .ws-sheet-icon-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      color: var(--ivory-primary, #f6f2e9);
    }

    .ws-saves-subhead {
      flex-shrink: 0;
      padding: 9px 16px;
      font-size: 12px;
      line-height: 1.35;
      color: rgba(246, 242, 233, 0.68);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: rgba(7, 10, 18, 0.92);
    }

    .ws-saves-subhead code {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      color: rgba(242, 207, 126, 0.85);
    }

    .ws-saves-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      padding-bottom: max(16px, env(safe-area-inset-bottom, 0px));
      border: none;
    }

    .ws-saves-banner {
      padding: 11px 16px;
      font-size: 12.5px;
      font-weight: 500;
      line-height: 1.35;
      border: none;
      background: rgba(57, 212, 154, 0.1);
      color: #9ff5d1;
      box-shadow: inset 3px 0 0 var(--emerald-win, #39d49a);
    }

    .ws-saves-banner.is-error {
      background: rgba(224, 82, 99, 0.13);
      color: #ffb4be;
      box-shadow: inset 3px 0 0 var(--crimson-alert, #e05263);
    }

    .ws-save-slot-row {
      padding: 15px 16px;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      background: transparent;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: background 0.14s ease;
    }

    .ws-save-slot-row.is-active {
      background: linear-gradient(90deg, rgba(242, 207, 126, 0.095) 0%, rgba(242, 207, 126, 0.015) 100%);
      box-shadow: inset 3px 0 0 var(--gold-bright, #f2cf7e);
    }

    .ws-save-slot-top {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px 12px;
    }

    .ws-save-slot-identity {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    .ws-save-slot-num {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      padding: 2px 7px;
      border-radius: 5px;
      border: none;
      background: rgba(255, 255, 255, 0.07);
      color: rgba(246, 242, 233, 0.72);
      font-variant-numeric: tabular-nums;
    }

    .ws-save-slot-row.is-active .ws-save-slot-num {
      background: rgba(242, 207, 126, 0.22);
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-save-slot-name {
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 15.5px;
      font-weight: 700;
      color: var(--ivory-primary, #f6f2e9);
      letter-spacing: 0.02em;
    }

    .ws-save-slot-row.is-empty .ws-save-slot-name {
      font-family: var(--font-sans, 'Inter', sans-serif);
      font-weight: 500;
      color: rgba(246, 242, 233, 0.68);
    }

    .ws-save-slot-persona {
      font-size: 12px;
      color: var(--cyan-clue, #56d4f5);
      font-weight: 500;
    }

    .ws-save-slot-time {
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11px;
      color: rgba(246, 242, 233, 0.66);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    .ws-save-progress-track {
      width: 100%;
      height: 2px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.08);
      overflow: hidden;
    }

    .ws-save-progress-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #b5842c 0%, #f2cf7e 100%);
    }

    .ws-save-slot-stats {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 12px;
      font-family: var(--font-mono, ui-monospace, monospace);
      font-size: 11.5px;
      line-height: 1.4;
      color: rgba(246, 242, 233, 0.68);
      font-variant-numeric: tabular-nums;
    }

    .ws-save-slot-stats strong {
      color: var(--ivory-primary, #f6f2e9);
      font-weight: 600;
    }

    .ws-save-slot-stats .is-gold {
      color: var(--gold-bright, #f2cf7e);
    }

    .ws-save-slot-stats .is-emerald {
      color: var(--emerald-win, #39d49a);
    }

    .ws-save-slot-stats .is-cyan {
      color: var(--cyan-clue, #56d4f5);
    }

    .ws-save-slot-stats .is-alert {
      color: #ff8e9b;
      font-weight: 700;
    }

    .ws-save-empty-note {
      font-size: 12.5px;
      line-height: 1.4;
      color: rgba(246, 242, 233, 0.66);
    }

    .ws-save-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
      margin-top: 2px;
    }

    .ws-save-cta-primary {
      min-height: 44px;
      min-width: 116px;
      padding: 0 16px;
      border: none !important;
      border-radius: 10px;
      background: linear-gradient(180deg, #fae29c 0%, #d8ab4e 56%, #b5842c 100%);
      color: #0e121a;
      font-family: var(--font-display, 'Cinzel', Georgia, serif);
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: filter 0.14s ease, transform 0.12s ease;
    }

    .ws-save-cta-primary:hover {
      filter: brightness(1.06);
    }

    .ws-save-cta-primary:active {
      transform: scale(0.99);
    }

    .ws-save-action-btn {
      min-height: 44px;
      min-width: 44px;
      padding: 0 13px;
      border: none !important;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      color: var(--ivory-primary, #f6f2e9);
      font-size: 12.5px;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      white-space: nowrap;
      transition: background 0.14s ease, color 0.14s ease;
    }

    .ws-save-action-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.11);
    }

    .ws-save-action-btn:disabled {
      opacity: 0.34;
      cursor: not-allowed;
    }

    .ws-save-action-btn.is-warn {
      background: rgba(240, 157, 70, 0.1);
      color: var(--amber-warn, #f09d46);
    }

    .ws-save-action-btn.is-warn:hover {
      background: rgba(240, 157, 70, 0.18);
    }

    .ws-save-action-btn.is-danger {
      background: rgba(224, 82, 99, 0.11);
      color: #ff8e9b;
    }

    .ws-save-action-btn.is-danger:hover {
      background: rgba(224, 82, 99, 0.2);
    }

    .ws-save-confirm-strip {
      margin-top: 2px;
      padding: 10px 12px;
      border: none;
      border-radius: 8px;
      background: rgba(224, 82, 99, 0.13);
      box-shadow: inset 3px 0 0 var(--crimson-alert, #e05263);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 12px;
    }

    .ws-save-confirm-msg {
      font-size: 12.5px;
      font-weight: 600;
      color: #ffb4be;
      line-height: 1.35;
    }

    .ws-save-confirm-btns {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .ws-save-confirm-exec {
      min-height: 44px;
      padding: 0 14px;
      border: none !important;
      border-radius: 9px;
      background: linear-gradient(180deg, #ef6676 0%, #c23345 100%);
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    @media (max-height: 520px) and (orientation: landscape) {
      .ws-saves-sheet .ws-sheet-header {
        min-height: 44px;
      }
      .ws-saves-subhead {
        display: none;
      }
      .ws-save-slot-row {
        padding: 10px 14px;
        gap: 7px;
      }
    }
  `,document.head.appendChild(r)}class Te{audio;haptics;modalEl=null;boundKeyDown=null;statusBanner=null;pendingConfirm=null;constructor(s,i){this.audio=s,this.haptics=i}isOpen(){return this.modalEl!==null}open(s){this.close(),Ee(),this.statusBanner=null,this.pendingConfirm=null;const i=document.createElement("div");i.className="ws-modal-backdrop ws-save-modal ws-velvet-backdrop",i.setAttribute("role","dialog"),i.setAttribute("aria-modal","true"),i.setAttribute("aria-label","Campaign Save Slots Dossier");const n=()=>{const h=i.querySelector(".ws-saves-scroll")?.scrollTop??0,v=s.getSlots().map(t=>{const p=t.totalMissions??96,m=typeof t.completionPct=="number"?Math.max(0,Math.min(100,t.completionPct)):Math.round(t.missionsCompleted/Math.max(1,p)*100),C=H(t.challengerName),g=H(t.personaLabel),_=H(t.currentActOrCity),$=H(t.completionLabel??`${t.missionsCompleted}/${p} Missions`),x=t.estimatedRemainingLabel?H(t.estimatedRemainingLabel):"",I=Ce(t.updatedAtLabel),S=this.pendingConfirm&&this.pendingConfirm.slotId===t.slotId?`
                <div class="ws-save-confirm-strip">
                  <span class="ws-save-confirm-msg">
                    ${this.pendingConfirm.kind==="DELETE"?`Permanently delete Slot ${t.slotId} campaign dossier?`:`Reset Slot ${t.slotId} back to Act 0 Geneva Start?`}
                  </span>
                  <div class="ws-save-confirm-btns">
                    <button type="button" class="ws-save-action-btn" data-cancel-confirm="${t.slotId}">
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="ws-save-confirm-exec"
                      data-exec-confirm="${t.slotId}"
                      data-confirm-kind="${this.pendingConfirm.kind}"
                    >
                      Confirm ${this.pendingConfirm.kind==="DELETE"?"Delete":"Reset"}
                    </button>
                  </div>
                </div>
              `:"";return`
            <section class="ws-save-slot-row ${t.isActive?"is-active":""} ${t.isEmpty?"is-empty":""}">
              <div class="ws-save-slot-top">
                <div class="ws-save-slot-identity">
                  <span class="ws-save-slot-num">
                    SLOT 0${t.slotId}${t.isActive?" · ACTIVE":""}
                  </span>
                  <span class="ws-save-slot-name">
                    ${t.isEmpty?"Empty Dossier":F(C)}
                  </span>
                  ${t.isEmpty?"":`<span class="ws-save-slot-persona">· ${F(g)}</span>`}
                </div>
                <span class="ws-save-slot-time">${F(I)}</span>
              </div>

              ${t.isEmpty?'<div class="ws-save-empty-note">Unassigned slot — launch a fresh Act 0 Geneva Vetting campaign or import a saved <code>.ws-save.json</code> file.</div>':`
                    <div class="ws-save-progress-track" aria-hidden="true">
                      <div class="ws-save-progress-fill" style="width:${m}%;"></div>
                    </div>
                    <div class="ws-save-slot-stats">
                      <span><strong class="is-gold">${F(_)}</strong></span>
                      <span>Visas <strong class="is-emerald">${t.visasCleared}/8</strong></span>
                      <span>Relics <strong class="is-cyan">${t.relicsUnlocked}/8</strong></span>
                      <span><strong>${F($)}</strong></span>
                      ${x?`<span><strong class="is-gold">${F(x)}</strong></span>`:""}
                      <span>Acc <strong>${t.accuracyPct}%</strong></span>
                      ${(t.failedAttemptsCount??0)>0?`<span class="is-alert">⚠ ${t.failedAttemptsCount} Retryable</span>`:""}
                    </div>
                  `}

              <div class="ws-save-actions">
                <button type="button" class="ws-save-cta-primary" data-slot-load="${t.slotId}">
                  ${t.isEmpty?"▶ Start New":t.isActive?"▶ Continue":"▶ Load Slot"}
                </button>
                <button type="button" class="ws-save-action-btn" data-slot-export="${t.slotId}" ${t.isEmpty?"disabled":""}>
                  ⬇ Export
                </button>
                <button type="button" class="ws-save-action-btn" data-slot-import="${t.slotId}">
                  ⬆ Import
                </button>
                ${t.isEmpty?"":`
                      <button type="button" class="ws-save-action-btn is-warn" data-slot-reset="${t.slotId}">
                        ↺ Reset
                      </button>
                      <button type="button" class="ws-save-action-btn is-danger" data-slot-delete="${t.slotId}">
                        ✕ Delete
                      </button>
                    `}
              </div>

              ${S}
            </section>
          `}).join("");i.innerHTML=`
        <div class="ws-velvet-sheet ws-saves-sheet">
          <header class="ws-sheet-header">
            <button type="button" class="ws-sheet-nav-btn" id="ws-saves-close">
              ← Back
            </button>
            <h2 class="ws-sheet-title">Campaign Saves</h2>
            <button type="button" class="ws-sheet-icon-btn" id="ws-saves-close-x" aria-label="Close">
              ✕
            </button>
          </header>

          <div class="ws-saves-subhead">
            Maintain up to 5 independent dossiers — switch anytime or exchange portable <code>.ws-save.json</code> backups.
          </div>

          <input type="file" id="ws-saves-file-input" hidden accept=".json,.ws-save.json,application/json" style="display:none;" />

          <div class="ws-saves-scroll">
            ${this.statusBanner?`
                  <div class="ws-saves-banner ${this.statusBanner.isError?"is-error":""}">
                    ${F(H(this.statusBanner.text))}
                  </div>
                `:""}
            ${v}
          </div>
        </div>
      `;const a=i.querySelector(".ws-saves-scroll");a&&h>0&&(a.scrollTop=h);const c=i.querySelector("#ws-saves-file-input");let d=1;c?.addEventListener("change",()=>{const t=c.files?.[0];if(!t)return;const p=new FileReader;p.onload=()=>{const m=typeof p.result=="string"?p.result:"",C=s.onImportSlotJson(d,m);this.statusBanner={text:C.message||(C.ok?`✓ Imported save file into Slot ${d} successfully.`:"Invalid campaign save JSON file."),isError:!C.ok},C.ok?(this.haptics.passportStamp(),this.audio.playSfx("passport_stamp")):this.haptics.wrongThud(!1),n()},p.readAsText(t),c.value=""});const L=()=>{this.haptics.uiTap(),this.audio.playSfx("ui_tap"),this.close(),s.onClose?.()};i.querySelector("#ws-saves-close")?.addEventListener("click",L),i.querySelector("#ws-saves-close-x")?.addEventListener("click",L),i.querySelectorAll("[data-slot-load]").forEach(t=>{t.addEventListener("click",()=>{const p=Number(t.dataset.slotLoad);this.haptics.sightlineSnap(),this.audio.playSfx("sightline_snap"),this.close(),s.onSwitchOrStartSlot(p)})}),i.querySelectorAll("[data-slot-export]").forEach(t=>{t.addEventListener("click",()=>{const p=Number(t.dataset.slotExport);this.haptics.uiTap(),this.audio.playSfx("ui_tap"),s.onExportSlot(p),this.statusBanner={text:`⬇ Exported Slot ${p} backup (.ws-save.json).`,isError:!1},n()})}),i.querySelectorAll("[data-slot-import]").forEach(t=>{t.addEventListener("click",()=>{d=Number(t.dataset.slotImport),this.haptics.uiTap(),this.audio.playSfx("ui_tap"),c?.click()})}),i.querySelectorAll("[data-slot-reset]").forEach(t=>{t.addEventListener("click",()=>{const p=Number(t.dataset.slotReset);this.haptics.uiTap(),this.audio.playSfx("ui_tap"),this.pendingConfirm={slotId:p,kind:"RESET"},n()})}),i.querySelectorAll("[data-slot-delete]").forEach(t=>{t.addEventListener("click",()=>{const p=Number(t.dataset.slotDelete);this.haptics.uiTap(),this.audio.playSfx("ui_tap"),this.pendingConfirm={slotId:p,kind:"DELETE"},n()})}),i.querySelectorAll("[data-cancel-confirm]").forEach(t=>{t.addEventListener("click",()=>{this.haptics.uiTap(),this.pendingConfirm=null,n()})}),i.querySelectorAll("[data-exec-confirm]").forEach(t=>{t.addEventListener("click",()=>{const p=Number(t.dataset.execConfirm),m=t.dataset.confirmKind;this.pendingConfirm=null,this.haptics.shatterPlate(),this.audio.playSfx("glass_shatter"),m==="DELETE"?(s.onDeleteSlot(p),this.statusBanner={text:`🗑 Deleted Slot ${p}.`,isError:!1}):(s.onResetSlotToStart(p),this.statusBanner={text:`↺ Reset Slot ${p} to Act 0 Geneva Start.`,isError:!1}),n()})})};n(),i.addEventListener("click",h=>{h.target===i&&(this.close(),s.onClose?.())}),this.boundKeyDown=h=>{const o=document.activeElement?.tagName.toUpperCase();o==="INPUT"||o==="TEXTAREA"||h.key==="Escape"&&(h.preventDefault(),this.close(),s.onClose?.())},window.addEventListener("keydown",this.boundKeyDown),document.body.appendChild(i),this.modalEl=i}close(){this.boundKeyDown&&(window.removeEventListener("keydown",this.boundKeyDown),this.boundKeyDown=null),this.modalEl&&(this.modalEl.remove(),this.modalEl=null)}}const Ie=Object.freeze(Object.defineProperty({__proto__:null,CampaignSaveSlotsModal:Te},Symbol.toStringTag,{value:"Module"}));export{Ae as B,Ie as C,Me as E,ie as r};
