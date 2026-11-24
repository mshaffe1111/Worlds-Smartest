// ============================================================================
// WORLD'S SMARTEST v6.0 — Post-Match Ceremony Scorecard & 3D Honor Reveal
// Zero-Scroll Episode Finale · Animated +Chips x Mult Breakdown
// Live 3D Newly Unlocked Medal/Trophy Spotlight · 1-Tap to Frankie's Prop Trunk
// ============================================================================

import * as THREE from 'three';
import type {
  FoleySfxIdV6,
  HonorAwardDefinitionV6,
  ResolutionTierV6,
  StageWorldIdV6,
} from '../contracts_v6';
import {
  HONOR_AWARDS_CATALOG_V6,
  MATERIAL_TIER_LABELS_V6,
  buildHonor3DGroupV6,
} from './TrophyMedalVault3DV6';

export interface PostMatchScorecardDataV6 {
  won: boolean;
  stageId: StageWorldIdV6;
  stageTitle: string;
  episodeNumber: number;
  boardName: string;
  baseChips: number;
  streakMult: number;
  relicMult: number;
  trapdoorSaves: number;
  trapdoorBonusCash: number;
  finalPayoutCash: number;
  newBankrollCash: number;
  rivalName: string;
  rivalCash: number;
  cluesSolved: number;
  cluesTotal: number;
  maxStreak: number;
  newlyUnlockedHonorIds: string[];
  nextTargetHonorId?: string;
  hostClosingLine?: string;
}

export interface PostMatchCeremonyCallbacksV6 {
  onEnterPropTrunk: () => void;
  onNextOrReplay: () => void;
  onReturnHub: () => void;
  onInspectInVault?: (awardId: string) => void;
  onPlayFoley?: (sfxId: FoleySfxIdV6) => void;
}

export interface PostMatchCeremonyOptionsV6 {
  data: PostMatchScorecardDataV6;
  resolutionTier?: ResolutionTierV6;
  callbacks: PostMatchCeremonyCallbacksV6;
}

const CEREMONY_ICONS = {
  trunk:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="12" rx="1.5"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></svg>',
  next:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  hub:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11l8-7 8 7v9H4v-9z"/></svg>',
  vault:
    '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M12 14v5M8 19h8"/></svg>',
};

function fmtMoney(n: number): string {
  return '$' + Math.max(0, Math.round(n)).toLocaleString('en-US');
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export class PostMatchCeremonyV6 {
  private readonly data: PostMatchScorecardDataV6;
  private readonly callbacks: PostMatchCeremonyCallbacksV6;
  private readonly resolutionTier: ResolutionTierV6;
  private readonly spotlightAwards: HonorAwardDefinitionV6[];
  private readonly hasNewUnlock: boolean;

  private spotlightIndex = 0;
  private rootEl: HTMLElement | null = null;
  private canvasWrapEl: HTMLElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;

  // Animated tally refs
  private chipsNumEl: HTMLElement | null = null;
  private multNumEl: HTMLElement | null = null;
  private totalPayoutEl: HTMLElement | null = null;
  private honorTitleEl: HTMLElement | null = null;
  private honorEngravingEl: HTMLElement | null = null;
  private honorTierEl: HTMLElement | null = null;
  private cycleBtnEl: HTMLButtonElement | null = null;

  // Mini 3D spotlight turntable
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private spinGroup: THREE.Group | null = null;
  private activeMesh: THREE.Group | null = null;
  private glintLight: THREE.PointLight | null = null;
  private rafId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private animStartTs = 0;

  constructor(options: PostMatchCeremonyOptionsV6) {
    this.data = options.data;
    this.callbacks = options.callbacks;
    this.resolutionTier = options.resolutionTier ?? 'ULTRA_3X';

    const unlockedAwards = options.data.newlyUnlockedHonorIds
      .map((id) => HONOR_AWARDS_CATALOG_V6.find((a) => a.awardId === id))
      .filter((a): a is HonorAwardDefinitionV6 => Boolean(a));

    if (unlockedAwards.length > 0) {
      this.hasNewUnlock = true;
      this.spotlightAwards = unlockedAwards;
    } else {
      this.hasNewUnlock = false;
      const target =
        HONOR_AWARDS_CATALOG_V6.find((a) => a.awardId === options.data.nextTargetHonorId) ??
        HONOR_AWARDS_CATALOG_V6[0];
      this.spotlightAwards = [target];
    }
  }

  public mount(parent: HTMLElement): void {
    this.dispose();
    parent.classList.add('v6-ultrahd-root');

    const screen = document.createElement('section');
    screen.className = 'v6-screen v6-ceremony-screen';
    screen.setAttribute('aria-label', 'Episode Post-Match Ceremony Scorecard');
    this.rootEl = screen;

    const shell = document.createElement('div');
    shell.className = 'v6-ceremony-shell';

    // 1) Compact Finale Banner
    const banner = document.createElement('header');
    banner.className = 'v6-ceremony-banner';

    const kicker = document.createElement('div');
    kicker.className = 'v6-hub-eyebrow v6-tabular';
    kicker.textContent = `EPISODE ${pad2(this.data.episodeNumber)} · ${this.data.stageTitle.toUpperCase()} · ${this.data.boardName.toUpperCase()}`;

    const verdict = document.createElement('h1');
    verdict.className = 'v6-ceremony-verdict';
    verdict.textContent = this.data.won ? 'STAGE VICTORY CONFIRMED' : 'CURTAIN CALL · NEXT SHOT';

    banner.append(kicker, verdict);

    if (this.data.hostClosingLine) {
      const aside = document.createElement('div');
      aside.className = 'v6-plaque-req';
      aside.textContent = `"${this.data.hostClosingLine}"`;
      banner.appendChild(aside);
    }

    // 2) Main Two-Column / Adaptive Scorecard + 3D Honor Spotlight
    const main = document.createElement('div');
    main.className = 'v6-ceremony-main';

    // 2A) Crunchy +Chips x Mult Breakdown Ledger
    const ledger = document.createElement('div');
    ledger.className = 'v6-score-ledger';

    const totalMult = Math.max(1, Number((this.data.streakMult + this.data.relicMult).toFixed(2)));

    const eq = document.createElement('div');
    eq.className = 'v6-ledger-equation';

    const chipsBox = document.createElement('div');
    chipsBox.className = 'v6-eq-box v6-eq-box--chips';
    this.chipsNumEl = document.createElement('span');
    this.chipsNumEl.className = 'v6-eq-num v6-tabular';
    this.chipsNumEl.textContent = '+0';
    const chipsLbl = document.createElement('span');
    chipsLbl.className = 'v6-eq-lbl';
    chipsLbl.textContent = 'BASE CHIPS';
    chipsBox.append(this.chipsNumEl, chipsLbl);

    const timesEl = document.createElement('span');
    timesEl.className = 'v6-eq-times';
    timesEl.textContent = '×';

    const multBox = document.createElement('div');
    multBox.className = 'v6-eq-box v6-eq-box--mult';
    this.multNumEl = document.createElement('span');
    this.multNumEl.className = 'v6-eq-num v6-tabular';
    this.multNumEl.textContent = 'x1.00';
    const multLbl = document.createElement('span');
    multLbl.className = 'v6-eq-lbl';
    multLbl.textContent = 'TOTAL MULT';
    multBox.append(this.multNumEl, multLbl);

    eq.append(chipsBox, timesEl, multBox);

    const rows = document.createElement('div');
    rows.className = 'v6-ledger-rows';

    const accuracyPct =
      this.data.cluesTotal > 0
        ? Math.round((this.data.cluesSolved / this.data.cluesTotal) * 100)
        : 0;

    rows.append(
      this.createLedgerRow(
        'CLUE ACCURACY & PEAK STREAK',
        `${this.data.cluesSolved}/${this.data.cluesTotal} (${accuracyPct}%) · ${this.data.maxStreak}×`,
      ),
      this.createLedgerRow(
        'STREAK + RELIC MULTIPLIERS',
        `+${this.data.streakMult.toFixed(1)}× STREAK  ·  +${this.data.relicMult.toFixed(1)}× RELICS`,
      ),
      this.createLedgerRow(
        `TRAPDOOR SAVES (${this.data.trapdoorSaves})`,
        `+${fmtMoney(this.data.trapdoorBonusCash)}`,
      ),
      this.createLedgerRow(
        `RIVAL PURSE (${this.data.rivalName.toUpperCase()})`,
        fmtMoney(this.data.rivalCash),
      ),
    );

    const totalRow = document.createElement('div');
    totalRow.className = 'v6-ledger-total';

    const totalMeta = document.createElement('div');
    totalMeta.className = 'v6-plate-copy';
    const totTitle = document.createElement('span');
    totTitle.className = 'v6-plate-title';
    totTitle.textContent = 'STAGE PAYOUT';
    const bankSub = document.createElement('span');
    bankSub.className = 'v6-plate-sub v6-tabular';
    bankSub.textContent = `CAREER BANKROLL: ${fmtMoney(this.data.newBankrollCash)}`;
    totalMeta.append(totTitle, bankSub);

    this.totalPayoutEl = document.createElement('span');
    this.totalPayoutEl.className = 'v6-ledger-total-val v6-tabular';
    this.totalPayoutEl.textContent = '$0';

    totalRow.append(totalMeta, this.totalPayoutEl);
    ledger.append(eq, rows, totalRow);

    // 2B) Newly Unlocked 3D Medal/Trophy Spotlight Reveal
    const spotlight = document.createElement('div');
    spotlight.className = 'v6-ceremony-spotlight';

    const spotHeader = document.createElement('div');
    spotHeader.className = 'v6-strip-label';
    const spotLbl = document.createElement('span');
    spotLbl.textContent = this.hasNewUnlock
      ? `NEW 3D HONOR UNLOCKED (${this.spotlightAwards.length})`
      : 'NEXT VAULT TARGET PROOF';

    this.honorTierEl = document.createElement('span');
    spotHeader.append(spotLbl, this.honorTierEl);

    this.canvasWrapEl = document.createElement('div');
    this.canvasWrapEl.className = 'v6-spotlight-canvas-wrap';
    this.canvasEl = document.createElement('canvas');
    this.canvasEl.className = 'v6-turntable-canvas';
    this.canvasWrapEl.appendChild(this.canvasEl);

    const spotFooter = document.createElement('div');
    spotFooter.className = 'v6-plaque-info';

    const spotTitleRow = document.createElement('div');
    spotTitleRow.className = 'v6-plaque-title-row';
    spotTitleRow.style.justifyContent = 'space-between';

    this.honorTitleEl = document.createElement('h2');
    this.honorTitleEl.className = 'v6-plaque-name';

    const spotBtnRow = document.createElement('div');
    spotBtnRow.style.display = 'inline-flex';
    spotBtnRow.style.gap = '4px';

    if (this.spotlightAwards.length > 1) {
      this.cycleBtnEl = document.createElement('button');
      this.cycleBtnEl.type = 'button';
      this.cycleBtnEl.className = 'v6-mini-ctrl-btn';
      this.cycleBtnEl.textContent = 'NEXT HONOR';
      this.cycleBtnEl.addEventListener('click', () => {
        this.spotlightIndex = (this.spotlightIndex + 1) % this.spotlightAwards.length;
        this.playFoley('medal_enamel_clink');
        this.rebuildSpotlightModel();
        this.syncSpotlightCopy();
      });
      spotBtnRow.appendChild(this.cycleBtnEl);
    }

    if (this.callbacks.onInspectInVault) {
      const inspectBtn = document.createElement('button');
      inspectBtn.type = 'button';
      inspectBtn.className = 'v6-mini-ctrl-btn is-active';
      inspectBtn.innerHTML = `${CEREMONY_ICONS.vault} <span>360° VAULT</span>`;
      inspectBtn.addEventListener('click', () => {
        this.playFoley('ui_brass_tap');
        const active = this.spotlightAwards[this.spotlightIndex];
        this.callbacks.onInspectInVault?.(active.awardId);
      });
      spotBtnRow.appendChild(inspectBtn);
    }

    spotTitleRow.append(this.honorTitleEl, spotBtnRow);

    this.honorEngravingEl = document.createElement('p');
    this.honorEngravingEl.className = 'v6-plaque-engraving';

    spotFooter.append(spotTitleRow, this.honorEngravingEl);
    spotlight.append(spotHeader, this.canvasWrapEl, spotFooter);

    main.append(ledger, spotlight);

    // 3) 1-Tap Bottom Action Deck (Hero: Frankie's Prop Trunk!)
    const actions = document.createElement('div');
    actions.className = 'v6-ceremony-actions';

    const trunkBtn = document.createElement('button');
    trunkBtn.type = 'button';
    trunkBtn.className = 'v6-brass-plate v6-brass-plate--hero';
    trunkBtn.innerHTML =
      `<span class="v6-plate-icon">${CEREMONY_ICONS.trunk}</span>` +
      `<span class="v6-plate-copy"><span class="v6-plate-title">FRANKIE'S PROP TRUNK</span><span class="v6-plate-sub">SPEND ${fmtMoney(this.data.newBankrollCash)} ON RELICS & FOILS</span></span>` +
      `<span class="v6-plate-tag">1-TAP</span>`;
    trunkBtn.addEventListener('click', () => {
      this.playFoley('velvet_trunk_clasp');
      this.callbacks.onEnterPropTrunk();
    });

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'v6-brass-plate';
    nextBtn.innerHTML =
      `<span class="v6-plate-icon">${CEREMONY_ICONS.next}</span>` +
      `<span class="v6-plate-copy"><span class="v6-plate-title">${this.data.won ? 'NEXT EPISODE' : 'REPLAY STAGE'}</span><span class="v6-plate-sub">${this.data.won ? 'ADVANCE WORLD TOUR' : 'REMATCH IMMEDIATELY'}</span></span>`;
    nextBtn.addEventListener('click', () => {
      this.playFoley('vault_heavy_unlock');
      this.callbacks.onNextOrReplay();
    });

    const hubBtn = document.createElement('button');
    hubBtn.type = 'button';
    hubBtn.className = 'v6-brass-plate';
    hubBtn.innerHTML =
      `<span class="v6-plate-icon">${CEREMONY_ICONS.hub}</span>` +
      `<span class="v6-plate-copy"><span class="v6-plate-title">STAGE HUB</span><span class="v6-plate-sub">MAIN LOBBY</span></span>`;
    hubBtn.addEventListener('click', () => {
      this.playFoley('ui_brass_tap');
      this.callbacks.onReturnHub();
    });

    actions.append(trunkBtn, nextBtn, hubBtn);

    shell.append(banner, main, actions);
    screen.appendChild(shell);
    parent.appendChild(screen);

    this.syncSpotlightCopy();
    this.initMiniTurntable(totalMult);
    this.playFoley(this.hasNewUnlock ? 'trophy_pedestal_chime' : 'crowd_warm_applause');
  }

  public dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.disposeActiveMesh();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    this.spinGroup = null;
    this.rootEl?.remove();
    this.rootEl = null;
  }

  // --------------------------------------------------------------------------
  // Internal Builders & 3D Spotlight Animation
  // --------------------------------------------------------------------------

  private createLedgerRow(label: string, value: string): HTMLElement {
    const row = document.createElement('div');
    row.className = 'v6-ledger-row';
    const l = document.createElement('span');
    l.textContent = label;
    const v = document.createElement('strong');
    v.className = 'v6-tabular';
    v.textContent = value;
    row.append(l, v);
    return row;
  }

  private syncSpotlightCopy(): void {
    const award = this.spotlightAwards[this.spotlightIndex];
    if (!award) return;
    if (this.honorTierEl) {
      this.honorTierEl.textContent = MATERIAL_TIER_LABELS_V6[award.materialTier];
    }
    if (this.honorTitleEl) {
      this.honorTitleEl.textContent = award.name;
    }
    if (this.honorEngravingEl) {
      this.honorEngravingEl.textContent = this.hasNewUnlock
        ? `"${award.engraving}"`
        : `TARGET: ${award.unlockRequirement}`;
    }
    if (this.cycleBtnEl) {
      this.cycleBtnEl.textContent = `${this.spotlightIndex + 1}/${this.spotlightAwards.length} NEXT`;
    }
  }

  private initMiniTurntable(totalMult: number): void {
    if (this.canvasEl && this.canvasWrapEl) {
      try {
        const dprCap =
          this.resolutionTier === 'BATTERY_1X'
            ? 1
            : this.resolutionTier === 'HIGH_2X'
              ? 2
              : 3;
        const renderer = new THREE.WebGLRenderer({
          canvas: this.canvasEl,
          antialias: true,
          alpha: true,
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.28;
        this.renderer = renderer;

        const scene = new THREE.Scene();
        this.scene = scene;

        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 30);
        camera.position.set(0, 0.3, 4.25);
        camera.lookAt(0, 0, 0);
        this.camera = camera;

        scene.add(new THREE.HemisphereLight(0xfff0cc, 0x181c2e, 1.0));
        const key = new THREE.SpotLight(0xffe6a8, 22, 18, Math.PI / 4, 0.4, 1.2);
        key.position.set(2.5, 4.0, 3.4);
        scene.add(key);

        const rim = new THREE.PointLight(0x52c4ff, 10, 14, 1.4);
        rim.position.set(-2.8, 1.8, -2.2);
        scene.add(rim);

        this.glintLight = new THREE.PointLight(0xfff7dc, 8, 12, 1.4);
        this.glintLight.position.set(1.8, 1.5, 2.4);
        scene.add(this.glintLight);

        this.spinGroup = new THREE.Group();
        scene.add(this.spinGroup);

        this.rebuildSpotlightModel();
        this.handleResize();

        if (typeof ResizeObserver !== 'undefined') {
          this.resizeObserver = new ResizeObserver(() => this.handleResize());
          this.resizeObserver.observe(this.canvasWrapEl);
        }
      } catch {
        this.renderer = null;
      }
    }

    this.animStartTs = performance.now();
    const tick = (now: number) => {
      this.rafId = requestAnimationFrame(tick);
      const elapsedSec = (now - this.animStartTs) / 1000;

      // Crunchy 850ms ease-out count-up for +Chips x Mult -> Payout
      const t = Math.min(1, elapsedSec / 0.85);
      const eased = 1 - Math.pow(1 - t, 3);

      if (this.chipsNumEl) {
        this.chipsNumEl.textContent = `+${Math.round(this.data.baseChips * eased).toLocaleString('en-US')}`;
      }
      if (this.multNumEl) {
        const curMult = 1 + (totalMult - 1) * eased;
        this.multNumEl.textContent = `×${curMult.toFixed(2)}`;
      }
      if (this.totalPayoutEl) {
        this.totalPayoutEl.textContent = fmtMoney(this.data.finalPayoutCash * eased);
      }

      if (this.spinGroup) {
        this.spinGroup.rotation.y = elapsedSec * 0.82;
        this.spinGroup.position.y = Math.sin(elapsedSec * 1.9) * 0.05;
      }
      if (this.glintLight) {
        this.glintLight.position.x = Math.cos(elapsedSec * 1.3) * 2.4;
      }
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    this.rafId = requestAnimationFrame(tick);
  }

  private rebuildSpotlightModel(): void {
    if (!this.spinGroup) return;
    this.disposeActiveMesh();
    const award = this.spotlightAwards[this.spotlightIndex];
    if (!award) return;
    const mesh = buildHonor3DGroupV6(award, this.hasNewUnlock);
    mesh.position.y = award.kind === 'MEDAL' ? -0.1 : 0.05;
    this.spinGroup.add(mesh);
    this.activeMesh = mesh;
  }

  private disposeActiveMesh(): void {
    if (!this.activeMesh || !this.spinGroup) return;
    this.spinGroup.remove(this.activeMesh);
    this.activeMesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
    this.activeMesh = null;
  }

  private handleResize(): void {
    if (!this.canvasWrapEl || !this.renderer || !this.camera) return;
    const w = Math.max(100, Math.floor(this.canvasWrapEl.clientWidth));
    const h = Math.max(80, Math.floor(this.canvasWrapEl.clientHeight));
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private playFoley(sfxId: FoleySfxIdV6): void {
    this.callbacks.onPlayFoley?.(sfxId);
  }
}
