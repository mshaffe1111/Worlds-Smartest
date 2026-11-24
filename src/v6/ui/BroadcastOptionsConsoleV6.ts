// ============================================================================
// WORLD'S SMARTEST v6.0 — 4-Bay Broadcast Options Console
// Rupert Neve 80-Series Faders · Nagra IV-S Precision · Ballistic Amber VUs
// Live 14-Track Symphony Audition Turntable · Flip-Cover Safety Switches
// ============================================================================

import type {
  BroadcastOptionsStateV6,
  CameraMotionModeV6,
  ColorVisionLensV6,
  FoleySfxIdV6,
  ResolutionTierV6,
  ShadowQualityV6,
  SymphonyTrackIdV6,
  TextScalePresetV6,
  ThumbDockHandednessV6,
} from '../contracts_v6';

export const OPTIONS_STORAGE_KEY_V6 = 'ws_v6_broadcast_options_v1';

export const DEFAULT_BROADCAST_OPTIONS_V6: BroadcastOptionsStateV6 = {
  masterVolume: 0.85,
  symphonyVolume: 0.72,
  foleyVolume: 0.88,
  voiceVolume: 0.92,
  ambienceVolume: 0.45,
  autoVoiceDucking: true,
  musicEnabled: true,
  sfxEnabled: true,
  resolutionTier: 'ULTRA_3X',
  shadowQuality: 'ULTRA_2048',
  cameraMotion: 'CINEMATIC',
  showFpsTelemetry: false,
  textScale: 1.0,
  thumbDock: 'CENTER',
  colorVisionLens: 'STANDARD',
  hapticsIntensity: 'CRISP',
  timerPaceMode: 'STANDARD',
};

export interface SymphonyAuditionTrackMetaV6 {
  trackId: SymphonyTrackIdV6;
  index: number;
  title: string;
  stageTag: string;
  tempoBpm: number;
}

export const SYMPHONY_AUDITION_TRACKS_V6: readonly SymphonyAuditionTrackMetaV6[] = [
  { trackId: 'curtain_overture', index: 1, title: 'Curtain Overture', stageTag: 'STAGE 01 · VAUDEVILLE PALACE', tempoBpm: 132 },
  { trackId: 'geneva_horology', index: 2, title: 'Geneva Horology Scherzo', stageTag: 'STAGE 02 · GENEVA CONSERVATORY', tempoBpm: 124 },
  { trackId: 'riviera_caprice', index: 3, title: 'Riviera Salon Caprice', stageTag: 'STAGE 03 · MONTE CARLO SALON', tempoBpm: 118 },
  { trackId: 'explorer_odyssey', index: 4, title: 'Explorer Meridian Odyssey', stageTag: 'STAGE 04 · CARTOGRAPHIC ROTUNDA', tempoBpm: 112 },
  { trackId: 'bunker_espionage', index: 5, title: '1969 Espionage Fugue', stageTag: 'STAGE 05 · ANALOG BUNKER 1969', tempoBpm: 126 },
  { trackId: 'kyoto_nocturne', index: 6, title: 'Kyoto Lacquer Nocturne', stageTag: 'STAGE 06 · KYOTO PAVILION', tempoBpm: 136 },
  { trackId: 'carnival_accelerando', index: 7, title: 'Carnival Pier Accelerando', stageTag: 'STAGE 07 · CARNIVAL CURIOSITIES', tempoBpm: 142 },
  { trackId: 'bathysphere_cathedral', index: 8, title: 'Abyssal Deep Chorale', stageTag: 'STAGE 08 · SUNKEN BATHYSPHERE', tempoBpm: 88 },
  { trackId: 'astral_storm_presto', index: 9, title: 'Astral Storm Presto', stageTag: 'STAGE 09 · ASTRAL OBSERVATORY', tempoBpm: 152 },
  { trackId: 'colosseum_finale', index: 10, title: 'Sovereign Colosseum Finale', stageTag: 'STAGE 10 · SOVEREIGN COLOSSEUM', tempoBpm: 138 },
  { trackId: 'backstage_velvet', index: 11, title: 'Backstage Velvet Rag', stageTag: "FRANKIE'S PROP TRUNK", tempoBpm: 104 },
  { trackId: 'trophy_hall_majesty', index: 12, title: 'Hall of Honors Majesty', stageTag: 'TROPHY & MEDAL VAULT', tempoBpm: 92 },
  { trackId: 'trapdoor_survival_blitz', index: 13, title: 'Trapdoor Survival Blitz', stageTag: '8-SECOND PIT GAMBIT', tempoBpm: 164 },
  { trackId: 'crown_victory_fanfare', index: 14, title: 'Crown Victory Fanfare', stageTag: 'POST-MATCH CEREMONY', tempoBpm: 128 },
];

export interface CorpusTelemetrySnapshotV6 {
  seenCount: number;
  totalCount: number;
  currentCampaignStage?: number; // 1 .. 10
  currentCampaignEpisode?: number; // 1 .. 20
  stageDifficultyProfile?: number[]; // optional 10 values [1.0 .. 10.0]
}

export interface BroadcastOptionsConsoleConfigV6 {
  initialState?: Partial<BroadcastOptionsStateV6>;
  corpusTelemetry?: CorpusTelemetrySnapshotV6;
  activeTrackId?: SymphonyTrackIdV6;
  onChange?: (state: BroadcastOptionsStateV6) => void;
  onAuditionTrack?: (trackId: SymphonyTrackIdV6, playing: boolean) => void;
  onPlayFoley?: (sfxId: FoleySfxIdV6) => void;
  onResetCampaign?: () => void;
  onWipeLifetimeMemory?: () => void;
  onClose: () => void;
}

export function loadBroadcastOptionsV6(): BroadcastOptionsStateV6 {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_BROADCAST_OPTIONS_V6 };
  }
  try {
    const raw = window.localStorage.getItem(OPTIONS_STORAGE_KEY_V6);
    if (!raw) return { ...DEFAULT_BROADCAST_OPTIONS_V6 };
    const parsed = JSON.parse(raw) as Partial<BroadcastOptionsStateV6>;
    return {
      ...DEFAULT_BROADCAST_OPTIONS_V6,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_BROADCAST_OPTIONS_V6 };
  }
}

export function saveBroadcastOptionsV6(state: BroadcastOptionsStateV6): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(OPTIONS_STORAGE_KEY_V6, JSON.stringify(state));
  } catch {
    // Ignore storage quota / private mode failures
  }
}

/**
 * Applies live CSS data-attributes for Text Scale, One-Handed Thumb Dock, and Colorblind Lens
 * directly onto `#ui-root` (`.v6-ultrahd-root`) for instant zero-scroll reflow.
 */
export function applyBroadcastOptionsToDomV6(
  rootEl: HTMLElement,
  state: BroadcastOptionsStateV6,
): void {
  rootEl.dataset.v6TextScale = String(state.textScale);
  rootEl.dataset.v6Thumb = state.thumbDock;
  rootEl.dataset.v6Vision = state.colorVisionLens;
}

type BayIndexV6 = 1 | 2 | 3 | 4;
type VolumeKeyV6 =
  | 'masterVolume'
  | 'symphonyVolume'
  | 'foleyVolume'
  | 'voiceVolume'
  | 'ambienceVolume';

const CONSOLE_ICONS = {
  back: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  prev: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  next: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  play: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5l12 7-12 7V5z"/></svg>',
  stop: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12"/></svg>',
  shield: '<svg class="v6-svg-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/></svg>',
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export class BroadcastOptionsConsoleV6 {
  private readonly config: BroadcastOptionsConsoleConfigV6;
  private state: BroadcastOptionsStateV6;
  private telemetry: CorpusTelemetrySnapshotV6;
  private activeBay: BayIndexV6 = 1;

  private auditionTrackIndex = 0;
  private auditionPlaying = false;

  private mountParent: HTMLElement | null = null;
  private rootEl: HTMLElement | null = null;

  private bayLatches: Map<BayIndexV6, HTMLButtonElement> = new Map();
  private bayPanels: Map<BayIndexV6, HTMLElement> = new Map();

  // Bay 1 dynamic refs
  private vuNeedleL: HTMLElement | null = null;
  private vuNeedleR: HTMLElement | null = null;
  private platterEl: HTMLElement | null = null;
  private trackTitleEl: HTMLElement | null = null;
  private trackSubEl: HTMLElement | null = null;
  private auditionPlayBtn: HTMLButtonElement | null = null;
  private busToggleRefs: Array<{ key: 'musicEnabled' | 'sfxEnabled' | 'autoVoiceDucking'; btn: HTMLButtonElement; led: HTMLElement }> = [];
  private faderRefs: Map<VolumeKeyV6, { fill: HTMLElement; cap: HTMLElement; val: HTMLElement }> = new Map();

  // Bay 2 dynamic refs
  private fpsReadoutEl: HTMLElement | null = null;
  private dprReadoutEl: HTMLElement | null = null;
  private viewportReadoutEl: HTMLElement | null = null;
  private fpsToggleBtn: HTMLButtonElement | null = null;
  private fpsToggleLed: HTMLElement | null = null;
  private knobUpdaters: Array<() => void> = [];

  // Bay 4 dynamic refs
  private corpusCountsEl: HTMLElement | null = null;
  private corpusPctEl: HTMLElement | null = null;
  private corpusFillEl: HTMLElement | null = null;
  private corpusRemainEl: HTMLElement | null = null;
  private vaultNoticeEl: HTMLElement | null = null;
  private disarmSafetyCallbacks: Array<() => void> = [];

  // Animation loop for ballistic amber VUs & live FPS telemetry
  private rafId: number | null = null;
  private lastTs = 0;
  private vuLevelL = 0;
  private vuLevelR = 0;
  private vuPhase = 0;
  private fpsFrames = 0;
  private fpsWindowStart = 0;
  private measuredFps = 60;

  constructor(config: BroadcastOptionsConsoleConfigV6) {
    this.config = config;
    this.state = {
      ...loadBroadcastOptionsV6(),
      ...(config.initialState ?? {}),
    };
    this.telemetry = config.corpusTelemetry ?? {
      seenCount: 0,
      totalCount: 1_279_399,
      currentCampaignStage: 1,
      currentCampaignEpisode: 1,
    };

    if (config.activeTrackId) {
      const idx = SYMPHONY_AUDITION_TRACKS_V6.findIndex(
        (t) => t.trackId === config.activeTrackId,
      );
      if (idx >= 0) this.auditionTrackIndex = idx;
    }
  }

  public mount(parent: HTMLElement): void {
    this.dispose();
    this.mountParent = parent;
    parent.classList.add('v6-ultrahd-root');
    applyBroadcastOptionsToDomV6(parent, this.state);

    const screen = document.createElement('section');
    screen.className = 'v6-screen v6-console-screen';
    screen.setAttribute('aria-label', 'Broadcast Control Desk Options Console');
    this.rootEl = screen;

    // 1) Top Broadcast Strip
    const topbar = document.createElement('header');
    topbar.className = 'v6-topbar';

    const leftGroup = document.createElement('div');
    leftGroup.className = 'v6-topbar-group';

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'v6-hardware-pill';
    backBtn.innerHTML = `${CONSOLE_ICONS.back}<span>STAGE HUB</span>`;
    backBtn.addEventListener('click', () => {
      if (this.auditionPlaying) {
        this.setAuditionPlaying(false);
      }
      this.playFoley('ui_brass_tap');
      this.config.onClose();
    });

    const titleChip = document.createElement('div');
    titleChip.className = 'v6-spec-chip';
    titleChip.innerHTML = '<strong>NEVE / NAGRA CONTROL DESK</strong>';

    leftGroup.append(backBtn, titleChip);

    const rightGroup = document.createElement('div');
    rightGroup.className = 'v6-topbar-group';
    const liveLamp = document.createElement('div');
    liveLamp.className = 'v6-spec-chip';
    liveLamp.innerHTML = '<span class="v6-led-jewel is-on"></span><span>LIVE PERSIST</span>';
    rightGroup.appendChild(liveLamp);

    topbar.append(leftGroup, rightGroup);

    // 2) Main Machined Anodized Chassis
    const chassis = document.createElement('div');
    chassis.className = 'v6-console-chassis';

    // 4-Bay Hardware Latch Switcher
    const bayTabs = document.createElement('nav');
    bayTabs.className = 'v6-bay-tabs';
    bayTabs.setAttribute('aria-label', 'Console Hardware Bays');

    const bays: Array<{ id: BayIndexV6; html: string }> = [
      { id: 1, html: '01 AUDIO<span class="v6-hide-xs"> DESK</span>' },
      { id: 2, html: '02 3D<span class="v6-hide-xs"> &amp;</span> CAM' },
      { id: 3, html: '03 ERGO<span class="v6-hide-xs">NOMICS</span>' },
      { id: 4, html: '04 <span class="v6-hide-xs">1.27M </span>VAULT' },
    ];
    this.bayLatches.clear();
    for (const bay of bays) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'v6-bay-latch';
      const led = document.createElement('span');
      led.className = 'v6-led-jewel';
      const txt = document.createElement('span');
      txt.innerHTML = bay.html;
      btn.append(led, txt);
      btn.addEventListener('click', () => {
        this.selectBay(bay.id);
      });
      this.bayLatches.set(bay.id, btn);
      bayTabs.appendChild(btn);
    }

    // Build all 4 Bays
    this.bayPanels.clear();
    this.knobUpdaters = [];
    this.faderRefs.clear();
    this.busToggleRefs = [];

    const bay1 = this.buildBay1AudioDesk();
    const bay2 = this.buildBay2GraphicsCamera();
    const bay3 = this.buildBay3Ergonomics();
    const bay4 = this.buildBay4CorpusVault();

    this.bayPanels.set(1, bay1);
    this.bayPanels.set(2, bay2);
    this.bayPanels.set(3, bay3);
    this.bayPanels.set(4, bay4);

    chassis.append(bayTabs, bay1, bay2, bay3, bay4);
    screen.append(topbar, chassis);
    parent.appendChild(screen);

    this.selectBay(this.activeBay, false);
    this.syncAllControls();
    this.syncAuditionDeck();
    this.syncCorpusTelemetry();
    this.startTelemetryLoop();
  }

  public getState(): BroadcastOptionsStateV6 {
    return { ...this.state };
  }

  public updateCorpusTelemetry(snapshot: CorpusTelemetrySnapshotV6): void {
    this.telemetry = snapshot;
    this.syncCorpusTelemetry();
  }

  public selectBay(bay: BayIndexV6, playSound = true): void {
    this.activeBay = bay;
    this.bayLatches.forEach((btn, id) => {
      const active = id === bay;
      btn.classList.toggle('is-active', active);
      const led = btn.querySelector('.v6-led-jewel');
      led?.classList.toggle('is-amber', active);
    });
    this.bayPanels.forEach((panel, id) => {
      panel.classList.toggle('is-active', id === bay);
    });
    if (playSound) {
      this.playFoley('rotary_knob_click');
    }
  }

  public dispose(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.rootEl?.remove();
    this.rootEl = null;
  }

  // --------------------------------------------------------------------------
  // BAY 1 — Rupert Neve Audio Mixing Desk + Live 14-Track Audition Turntable
  // --------------------------------------------------------------------------

  private buildBay1AudioDesk(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'v6-bay-panel';

    const grid = document.createElement('div');
    grid.className = 'v6-module-rack v6-bay1-grid';

    // 1A) Dual Ballistic Amber VU Meter Bridge + Mechanical Bus Toggles
    const vuBridge = document.createElement('div');
    vuBridge.className = 'v6-vu-bridge';

    const vuL = this.createVuMeter('CH L · BUS');
    this.vuNeedleL = vuL.needle;
    const vuR = this.createVuMeter('CH R · BUS');
    this.vuNeedleR = vuR.needle;

    const busToggles = document.createElement('div');
    busToggles.className = 'v6-bus-toggles';
    busToggles.append(
      this.createBusToggle('musicEnabled', 'SYMPHONY'),
      this.createBusToggle('sfxEnabled', 'FOLEY'),
      this.createBusToggle('autoVoiceDucking', 'VOICE DUCK'),
    );

    vuBridge.append(vuL.el, vuR.el, busToggles);

    // 1B) 5 Precision Machined Linear Fader Channels
    const faderBank = document.createElement('div');
    faderBank.className = 'v6-fader-bank';

    const channels: Array<{ key: VolumeKeyV6; label: string }> = [
      { key: 'masterVolume', label: 'MASTER' },
      { key: 'symphonyVolume', label: 'SYMPHONY' },
      { key: 'foleyVolume', label: 'FOLEY' },
      { key: 'voiceVolume', label: 'VOICE' },
      { key: 'ambienceVolume', label: 'ROOM AIR' },
    ];
    for (const ch of channels) {
      faderBank.appendChild(this.createLinearFaderChannel(ch.key, ch.label));
    }

    // 1C) Live 14-Track Symphony Audition Turntable
    const deck = document.createElement('div');
    deck.className = 'v6-turntable-deck';

    this.platterEl = document.createElement('div');
    this.platterEl.className = 'v6-vinyl-platter';

    const readout = document.createElement('div');
    readout.className = 'v6-track-readout';
    this.trackTitleEl = document.createElement('div');
    this.trackTitleEl.className = 'v6-track-title';
    this.trackSubEl = document.createElement('div');
    this.trackSubEl.className = 'v6-track-sub v6-tabular';
    readout.append(this.trackTitleEl, this.trackSubEl);

    const transport = document.createElement('div');
    transport.className = 'v6-transport-btns';

    const prevTrackBtn = document.createElement('button');
    prevTrackBtn.type = 'button';
    prevTrackBtn.className = 'v6-hardware-pill';
    prevTrackBtn.setAttribute('aria-label', 'Previous Symphony Track');
    prevTrackBtn.innerHTML = CONSOLE_ICONS.prev;
    prevTrackBtn.addEventListener('click', () => this.stepAuditionTrack(-1));

    this.auditionPlayBtn = document.createElement('button');
    this.auditionPlayBtn.type = 'button';
    this.auditionPlayBtn.className = 'v6-hardware-pill';
    this.auditionPlayBtn.addEventListener('click', () => {
      this.setAuditionPlaying(!this.auditionPlaying);
    });

    const nextTrackBtn = document.createElement('button');
    nextTrackBtn.type = 'button';
    nextTrackBtn.className = 'v6-hardware-pill';
    nextTrackBtn.setAttribute('aria-label', 'Next Symphony Track');
    nextTrackBtn.innerHTML = CONSOLE_ICONS.next;
    nextTrackBtn.addEventListener('click', () => this.stepAuditionTrack(1));

    transport.append(prevTrackBtn, this.auditionPlayBtn, nextTrackBtn);
    deck.append(this.platterEl, readout, transport);

    grid.append(vuBridge, faderBank, deck);
    panel.appendChild(grid);
    return panel;
  }

  private createVuMeter(channelLabel: string): { el: HTMLElement; needle: HTMLElement } {
    const meter = document.createElement('div');
    meter.className = 'v6-vu-meter';

    const scale = document.createElement('div');
    scale.className = 'v6-vu-scale';
    scale.innerHTML = '<span>-20</span><span>-7</span><span>0</span><span class="is-red">+3</span>';

    const needle = document.createElement('div');
    needle.className = 'v6-vu-needle';

    const pivot = document.createElement('div');
    pivot.className = 'v6-vu-pivot';

    const ch = document.createElement('span');
    ch.className = 'v6-vu-ch';
    ch.textContent = channelLabel;

    meter.append(scale, needle, pivot, ch);
    return { el: meter, needle };
  }

  private createBusToggle(
    key: 'musicEnabled' | 'sfxEnabled' | 'autoVoiceDucking',
    label: string,
  ): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'v6-hardware-pill';
    btn.style.height = '24px';
    btn.style.padding = '0 7px';
    const led = document.createElement('span');
    led.className = 'v6-led-jewel';
    const txt = document.createElement('span');
    txt.textContent = label;
    btn.append(led, txt);

    btn.addEventListener('click', () => {
      this.patchState({ [key]: !this.state[key] } as Partial<BroadcastOptionsStateV6>);
      this.playFoley('rotary_knob_click');
    });

    this.busToggleRefs.push({ key, btn, led });
    return btn;
  }

  private createLinearFaderChannel(key: VolumeKeyV6, label: string): HTMLElement {
    const channel = document.createElement('div');
    channel.className = 'v6-fader-channel';

    const valEl = document.createElement('span');
    valEl.className = 'v6-fader-val v6-tabular';

    const track = document.createElement('div');
    track.className = 'v6-fader-track';
    track.setAttribute('role', 'slider');
    track.setAttribute('tabindex', '0');
    track.setAttribute('aria-label', `${label} Volume Fader`);
    track.setAttribute('aria-valuemin', '0');
    track.setAttribute('aria-valuemax', '100');

    const ticks = document.createElement('div');
    ticks.className = 'v6-fader-ticks';

    const slot = document.createElement('div');
    slot.className = 'v6-fader-slot';
    const fill = document.createElement('div');
    fill.className = 'v6-fader-fill';
    slot.appendChild(fill);

    const cap = document.createElement('div');
    cap.className = 'v6-fader-cap';

    track.append(ticks, slot, cap);

    const nameEl = document.createElement('span');
    nameEl.className = 'v6-fader-name';
    nameEl.textContent = label;

    channel.append(valEl, track, nameEl);

    let lastDetentStep = Math.round(this.state[key] * 20);
    const updateFromClientY = (clientY: number) => {
      const rect = track.getBoundingClientRect();
      if (rect.height <= 4) return;
      const ratio = clamp01(1 - (clientY - rect.top) / rect.height);
      const snapped = Math.round(ratio * 100) / 100;
      const detent = Math.round(snapped * 20);
      if (detent !== lastDetentStep) {
        lastDetentStep = detent;
        this.playFoley('neve_fader_detent');
      }
      this.patchState({ [key]: snapped } as Partial<BroadcastOptionsStateV6>);
    };

    let dragging = false;
    track.addEventListener('pointerdown', (e) => {
      dragging = true;
      track.setPointerCapture(e.pointerId);
      updateFromClientY(e.clientY);
    });
    track.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      updateFromClientY(e.clientY);
    });
    const endDrag = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (track.hasPointerCapture(e.pointerId)) {
        track.releasePointerCapture(e.pointerId);
      }
    };
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    track.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.playFoley('neve_fader_detent');
        this.patchState({
          [key]: clamp01(Math.round((this.state[key] + 0.05) * 100) / 100),
        } as Partial<BroadcastOptionsStateV6>);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.playFoley('neve_fader_detent');
        this.patchState({
          [key]: clamp01(Math.round((this.state[key] - 0.05) * 100) / 100),
        } as Partial<BroadcastOptionsStateV6>);
      }
    });

    this.faderRefs.set(key, { fill, cap, val: valEl });
    return channel;
  }

  private stepAuditionTrack(delta: -1 | 1): void {
    this.auditionTrackIndex =
      (this.auditionTrackIndex + delta + SYMPHONY_AUDITION_TRACKS_V6.length) %
      SYMPHONY_AUDITION_TRACKS_V6.length;
    this.playFoley('brass_gear_detent');
    this.syncAuditionDeck();
    if (this.auditionPlaying) {
      const track = SYMPHONY_AUDITION_TRACKS_V6[this.auditionTrackIndex];
      this.config.onAuditionTrack?.(track.trackId, true);
    }
  }

  private setAuditionPlaying(playing: boolean): void {
    this.auditionPlaying = playing;
    this.playFoley('ui_brass_tap');
    this.syncAuditionDeck();
    const track = SYMPHONY_AUDITION_TRACKS_V6[this.auditionTrackIndex];
    this.config.onAuditionTrack?.(track.trackId, playing);
  }

  private syncAuditionDeck(): void {
    const track = SYMPHONY_AUDITION_TRACKS_V6[this.auditionTrackIndex];
    if (!track) return;
    if (this.trackTitleEl) {
      this.trackTitleEl.textContent = `${pad2(track.index)}/14 · ${track.title.toUpperCase()}`;
    }
    if (this.trackSubEl) {
      this.trackSubEl.textContent = `${track.stageTag} · ${track.tempoBpm} BPM`;
    }
    if (this.platterEl) {
      this.platterEl.classList.toggle('is-spinning', this.auditionPlaying);
    }
    if (this.auditionPlayBtn) {
      this.auditionPlayBtn.classList.toggle('is-active', this.auditionPlaying);
      this.auditionPlayBtn.innerHTML = this.auditionPlaying
        ? `${CONSOLE_ICONS.stop}<span>STOP</span>`
        : `${CONSOLE_ICONS.play}<span>AUDITION</span>`;
    }
  }

  // --------------------------------------------------------------------------
  // BAY 2 — Ultra-HD 3D Graphics, Camera Dolly & Live DPR/FPS Readout
  // --------------------------------------------------------------------------

  private buildBay2GraphicsCamera(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'v6-bay-panel';

    const grid = document.createElement('div');
    grid.className = 'v6-module-rack v6-bay2-grid';

    grid.appendChild(
      this.createDetentedRotaryModule<ResolutionTierV6>(
        'SUPER RETINA DPR RENDER TIER',
        '3X CRISP',
        [
          { value: 'ULTRA_3X', label: '3X RETINA' },
          { value: 'HIGH_2X', label: '2X HIGH' },
          { value: 'BATTERY_1X', label: '1X SAVER' },
        ],
        () => this.state.resolutionTier,
        (val) => this.patchState({ resolutionTier: val }),
      ),
    );

    grid.appendChild(
      this.createDetentedRotaryModule<ShadowQualityV6>(
        'STAGE SHADOW MAP PRECISION',
        'PCF SOFT',
        [
          { value: 'ULTRA_2048', label: '2048² ULTRA' },
          { value: 'SOFT_1024', label: '1024² SOFT' },
          { value: 'OFF', label: 'OFF' },
        ],
        () => this.state.shadowQuality,
        (val) => this.patchState({ shadowQuality: val }),
      ),
    );

    grid.appendChild(
      this.createDetentedRotaryModule<CameraMotionModeV6>(
        'BROADCAST CAMERA DOLLY',
        'CRANE',
        [
          { value: 'CINEMATIC', label: 'CINEMATIC' },
          { value: 'SUBTLE', label: 'SUBTLE' },
          { value: 'REDUCED', label: 'REDUCED' },
        ],
        () => this.state.cameraMotion,
        (val) => this.patchState({ cameraMotion: val }),
      ),
    );

    // Live DPR / FPS / Viewport Hardware Telemetry Window
    const telemetryStrip = document.createElement('div');
    telemetryStrip.className = 'v6-module-strip';

    const lbl = document.createElement('div');
    lbl.className = 'v6-strip-label';
    const lblText = document.createElement('span');
    lblText.textContent = 'LIVE GPU & VIEWPORT TELEMETRY';

    this.fpsToggleBtn = document.createElement('button');
    this.fpsToggleBtn.type = 'button';
    this.fpsToggleBtn.className = 'v6-mini-ctrl-btn';
    this.fpsToggleLed = document.createElement('span');
    this.fpsToggleLed.className = 'v6-led-jewel';
    this.fpsToggleLed.style.marginRight = '5px';
    const fpsTxt = document.createElement('span');
    fpsTxt.textContent = 'HUD OVERLAY';
    this.fpsToggleBtn.style.display = 'inline-flex';
    this.fpsToggleBtn.style.alignItems = 'center';
    this.fpsToggleBtn.append(this.fpsToggleLed, fpsTxt);
    this.fpsToggleBtn.addEventListener('click', () => {
      this.playFoley('rotary_knob_click');
      this.patchState({ showFpsTelemetry: !this.state.showFpsTelemetry });
    });
    lbl.append(lblText, this.fpsToggleBtn);

    const readoutGrid = document.createElement('div');
    readoutGrid.className = 'v6-telemetry-window';

    const fpsCell = this.createNixieCell('60', 'LIVE FPS');
    this.fpsReadoutEl = fpsCell.val;
    const dprCell = this.createNixieCell('3.0x', 'EFF. DPR');
    this.dprReadoutEl = dprCell.val;
    const vpCell = this.createNixieCell('390×660', 'VIEWPORT');
    this.viewportReadoutEl = vpCell.val;
    const glCell = this.createNixieCell('GL2', 'PIPELINE');

    readoutGrid.append(fpsCell.el, dprCell.el, vpCell.el, glCell.el);
    telemetryStrip.append(lbl, readoutGrid);

    grid.appendChild(telemetryStrip);
    panel.appendChild(grid);
    return panel;
  }

  private createNixieCell(initialVal: string, label: string): { el: HTMLElement; val: HTMLElement } {
    const el = document.createElement('div');
    el.className = 'v6-nixie-cell';
    const val = document.createElement('span');
    val.className = 'v6-nixie-val v6-tabular';
    val.textContent = initialVal;
    const lbl = document.createElement('span');
    lbl.className = 'v6-nixie-lbl';
    lbl.textContent = label;
    el.append(val, lbl);
    return { el, val };
  }

  // --------------------------------------------------------------------------
  // BAY 3 — Ergonomics, Text Scale, One-Handed Thumb Dock & Colorblind Lenses
  // --------------------------------------------------------------------------

  private buildBay3Ergonomics(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'v6-bay-panel';

    const grid = document.createElement('div');
    grid.className = 'v6-module-rack v6-bay3-grid';

    grid.appendChild(
      this.createDetentedRotaryModule<TextScalePresetV6>(
        'ZERO-SCROLL TEXT SCALE REFLOW',
        'SUBPIXEL',
        [
          { value: 0.95, label: '95%' },
          { value: 1.0, label: '100%' },
          { value: 1.12, label: '112%' },
        ],
        () => this.state.textScale,
        (val) => this.patchState({ textScale: val }),
      ),
    );

    grid.appendChild(
      this.createDetentedRotaryModule<ThumbDockHandednessV6>(
        'ONE-HANDED THUMB DOCK',
        'REACH',
        [
          { value: 'LEFT_HAND', label: 'LEFT' },
          { value: 'CENTER', label: 'CENTER' },
          { value: 'RIGHT_HAND', label: 'RIGHT' },
        ],
        () => this.state.thumbDock,
        (val) => this.patchState({ thumbDock: val }),
      ),
    );

    // Colorblind Stage Lenses + Live Semantic Palette Swatches
    const visionMod = this.createDetentedRotaryModule<ColorVisionLensV6>(
      'COLORBLIND STAGE LENS',
      'OPTICS',
      [
        { value: 'STANDARD', label: 'STD' },
        { value: 'DEUTERANOPIA', label: 'DEUT' },
        { value: 'PROTANOPIA', label: 'PROT' },
        { value: 'TRITANOPIA', label: 'TRIT' },
      ],
      () => this.state.colorVisionLens,
      (val) => this.patchState({ colorVisionLens: val }),
    );

    const swatches = document.createElement('div');
    swatches.className = 'v6-vision-swatches';
    swatches.innerHTML =
      '<span class="v6-vision-chip"><span class="v6-vision-dot" style="background:var(--v6-signal-good)"></span>HIT</span>' +
      '<span class="v6-vision-chip"><span class="v6-vision-dot" style="background:var(--v6-signal-warn)"></span>WARN</span>' +
      '<span class="v6-vision-chip"><span class="v6-vision-dot" style="background:var(--v6-signal-danger)"></span>TRAP</span>' +
      '<span class="v6-vision-chip"><span class="v6-vision-dot" style="background:var(--v6-signal-info)"></span>CLUE</span>';
    visionMod.appendChild(swatches);
    grid.appendChild(visionMod);

    // Haptics + Timer Pace Combined Module
    const paceStrip = document.createElement('div');
    paceStrip.className = 'v6-module-strip';

    const hapticLbl = document.createElement('div');
    hapticLbl.className = 'v6-strip-label';
    hapticLbl.innerHTML = '<span>HAPTICS & CLOCK PACE</span><span>TACTILE</span>';

    const hapticRail = this.createInlineDetentRail<'OFF' | 'CRISP' | 'HEAVY'>(
      [
        { value: 'OFF', label: 'HAPTICS OFF' },
        { value: 'CRISP', label: 'CRISP' },
        { value: 'HEAVY', label: 'HEAVY' },
      ],
      () => this.state.hapticsIntensity,
      (val) => {
        this.patchState({ hapticsIntensity: val });
        if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
          if (val === 'CRISP') navigator.vibrate(14);
          if (val === 'HEAVY') navigator.vibrate([26, 20, 32]);
        }
      },
    );

    const timerRail = this.createInlineDetentRail<'STANDARD' | 'RELAXED_PLUS_4S'>(
      [
        { value: 'STANDARD', label: 'STANDARD CLOCK' },
        { value: 'RELAXED_PLUS_4S', label: 'RELAXED (+4s)' },
      ],
      () => this.state.timerPaceMode,
      (val) => this.patchState({ timerPaceMode: val }),
    );

    paceStrip.append(hapticLbl, hapticRail, timerRail);
    grid.appendChild(paceStrip);

    panel.appendChild(grid);
    return panel;
  }

  // --------------------------------------------------------------------------
  // BAY 4 — 1.27M Corpus Telemetry, Difficulty Curve & Flip-Cover Vault Wipes
  // --------------------------------------------------------------------------

  private buildBay4CorpusVault(): HTMLElement {
    const panel = document.createElement('div');
    panel.className = 'v6-bay-panel';

    const grid = document.createElement('div');
    grid.className = 'v6-module-rack v6-bay4-grid';

    // 4A) 1.27M Zero-Repeat Bitset Telemetry Gauge
    const gaugeStrip = document.createElement('div');
    gaugeStrip.className = 'v6-module-strip';

    const gLbl = document.createElement('div');
    gLbl.className = 'v6-strip-label';
    this.corpusCountsEl = document.createElement('span');
    this.corpusCountsEl.className = 'v6-tabular';
    this.corpusPctEl = document.createElement('span');
    this.corpusPctEl.className = 'v6-tabular';
    gLbl.append(this.corpusCountsEl, this.corpusPctEl);

    const meter = document.createElement('div');
    meter.className = 'v6-bitset-meter';
    this.corpusFillEl = document.createElement('div');
    this.corpusFillEl.className = 'v6-bitset-fill';
    meter.appendChild(this.corpusFillEl);

    this.corpusRemainEl = document.createElement('div');
    this.corpusRemainEl.className = 'v6-plaque-req v6-tabular';

    gaugeStrip.append(gLbl, meter, this.corpusRemainEl);

    // 4B) Monotonic Difficulty Curve Visualizer (★ 1.0 -> 10.0, pure geometry, zero SVG text)
    const curveStrip = document.createElement('div');
    curveStrip.className = 'v6-module-strip';

    const cLbl = document.createElement('div');
    cLbl.className = 'v6-strip-label';
    cLbl.innerHTML = '<span>CAMPAIGN DIFFICULTY CURVE (★ 1.0 → 10.0)</span><span>10 STAGE WORLDS</span>';

    const curveBox = document.createElement('div');
    curveBox.className = 'v6-curve-box';

    const profile =
      this.telemetry.stageDifficultyProfile && this.telemetry.stageDifficultyProfile.length === 10
        ? this.telemetry.stageDifficultyProfile
        : [1.4, 2.4, 3.4, 4.4, 5.4, 6.4, 7.4, 8.2, 9.0, 9.8];

    const currentStage = this.telemetry.currentCampaignStage ?? 1;
    const bars: string[] = [];
    const points: string[] = [];
    for (let i = 0; i < 10; i++) {
      const val = Math.max(1, Math.min(10, profile[i]));
      const x = 14 + i * 38;
      const barH = (val / 10) * 62;
      const y = 72 - barH;
      const active = i + 1 === currentStage;
      bars.push(
        `<rect x="${x - 10}" y="${y.toFixed(1)}" width="20" height="${barH.toFixed(1)}" rx="2" fill="${
          active ? 'var(--v6-stage-accent)' : 'rgba(255,255,255,0.14)'
        }" />`,
      );
      points.push(`${x},${y.toFixed(1)}`);
    }

    const svgWrap = document.createElement('div');
    svgWrap.className = 'v6-curve-svg-wrap';
    svgWrap.innerHTML =
      `<svg class="v6-curve-svg" viewBox="0 0 380 78" preserveAspectRatio="none" aria-hidden="true">` +
      `<line x1="0" y1="72" x2="380" y2="72" stroke="rgba(255,255,255,0.16)" stroke-width="1"/>` +
      `${bars.join('')}` +
      `<polyline points="${points.join(' ')}" fill="none" stroke="var(--v6-signal-info)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>` +
      `</svg>`;

    const axis = document.createElement('div');
    axis.className = 'v6-curve-axis v6-tabular';
    axis.innerHTML =
      '<span>STG 01 · ★1.0 WARMUP</span><span>STG 05 · ★5.5 SHARP</span><span>STG 10 · ★10.0 LEGEND</span>';

    curveBox.append(svgWrap, axis);
    curveStrip.append(cLbl, curveBox);

    // 4C) Dual Mil-Spec Protective Flip-Cover Safety Switches
    const safetyBay = document.createElement('div');
    safetyBay.className = 'v6-safety-bay';
    this.disarmSafetyCallbacks = [];

    const campaignSafety = this.createFlipCoverSafetySwitch({
      title: 'CAMPAIGN RESET',
      guardLabel: 'LIFT GUARD · RESET CAMPAIGN',
      fireLabel: 'CONFIRM: RESET CURRENT CAMPAIGN',
      onFire: () => {
        this.playFoley('trapdoor_hinge_drop');
        this.config.onResetCampaign?.();
        this.setVaultNotice('CAMPAIGN PROGRESS RESET · 1.27M MEMORY KEPT');
      },
    });
    this.disarmSafetyCallbacks.push(campaignSafety.disarm);

    const memorySafety = this.createFlipCoverSafetySwitch({
      title: 'LIFETIME BITSET WIPE',
      guardLabel: 'LIFT GUARD · WIPE 1.27M LEDGER',
      fireLabel: 'CONFIRM: WIPE LIFETIME CLUE MEMORY',
      onFire: () => {
        this.playFoley('iron_chain_shatter');
        this.telemetry = { ...this.telemetry, seenCount: 0 };
        this.syncCorpusTelemetry();
        this.config.onWipeLifetimeMemory?.();
        this.setVaultNotice('160 KB ZERO-REPEAT CLUE BITSET CLEARED');
      },
    });
    this.disarmSafetyCallbacks.push(memorySafety.disarm);

    safetyBay.append(campaignSafety.housing, memorySafety.housing);

    this.vaultNoticeEl = document.createElement('div');
    this.vaultNoticeEl.className = 'v6-plaque-req v6-tabular';
    this.vaultNoticeEl.textContent = 'SAFETY GUARDS LOCKED · LIFT COVER TO ARM DESTRUCTIVE SWITCH';
    gaugeStrip.appendChild(this.vaultNoticeEl);

    grid.append(gaugeStrip, curveStrip, safetyBay);
    panel.appendChild(grid);
    return panel;
  }

  private createFlipCoverSafetySwitch(opts: {
    title: string;
    guardLabel: string;
    fireLabel: string;
    onFire: () => void;
  }): { housing: HTMLElement; disarm: () => void } {
    const housing = document.createElement('div');
    housing.className = 'v6-safety-housing';

    const header = document.createElement('div');
    header.className = 'v6-strip-label';
    const titleSpan = document.createElement('span');
    titleSpan.textContent = opts.title;

    const relockBtn = document.createElement('button');
    relockBtn.type = 'button';
    relockBtn.className = 'v6-mini-ctrl-btn';
    relockBtn.textContent = 'SAFE';
    relockBtn.style.height = '18px';
    header.append(titleSpan, relockBtn);

    const well = document.createElement('div');
    well.className = 'v6-safety-switch-well';

    const fireBtn = document.createElement('button');
    fireBtn.type = 'button';
    fireBtn.className = 'v6-safety-fire-btn';
    fireBtn.textContent = opts.fireLabel;
    fireBtn.disabled = true;

    const cover = document.createElement('button');
    cover.type = 'button';
    cover.className = 'v6-flip-cover';
    cover.innerHTML = `${CONSOLE_ICONS.shield}<span>${opts.guardLabel}</span>`;

    const setArmed = (armed: boolean) => {
      housing.classList.toggle('is-armed', armed);
      fireBtn.disabled = !armed;
      relockBtn.textContent = armed ? 'CLOSE COVER' : 'SAFE';
    };

    cover.addEventListener('click', () => {
      this.playFoley('velvet_trunk_clasp');
      setArmed(true);
    });

    relockBtn.addEventListener('click', () => {
      this.playFoley('rotary_knob_click');
      setArmed(false);
    });

    fireBtn.addEventListener('click', () => {
      if (fireBtn.disabled) return;
      opts.onFire();
      setArmed(false);
    });

    well.append(fireBtn, cover);
    housing.append(header, well);
    return { housing, disarm: () => setArmed(false) };
  }

  public disarmAllSafetyGuards(): void {
    for (const disarm of this.disarmSafetyCallbacks) {
      disarm();
    }
  }

  private setVaultNotice(msg: string): void {
    if (this.vaultNoticeEl) {
      this.vaultNoticeEl.textContent = msg;
    }
  }

  // --------------------------------------------------------------------------
  // Reusable Detented Marconi Rotary & Rail Builders
  // --------------------------------------------------------------------------

  private createDetentedRotaryModule<T>(
    title: string,
    rightTag: string,
    options: Array<{ value: T; label: string }>,
    getCurrent: () => T,
    onSelect: (val: T) => void,
  ): HTMLElement {
    const strip = document.createElement('div');
    strip.className = 'v6-module-strip';

    const lbl = document.createElement('div');
    lbl.className = 'v6-strip-label';
    lbl.innerHTML = `<span>${title}</span><span>${rightTag}</span>`;

    const group = document.createElement('div');
    group.className = 'v6-detent-group';

    const knob = document.createElement('button');
    knob.type = 'button';
    knob.className = 'v6-marconi-knob';
    knob.setAttribute('aria-label', `Cycle ${title}`);

    const rail = document.createElement('div');
    rail.className = 'v6-detent-rail';

    const btns: HTMLButtonElement[] = [];
    for (const opt of options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'v6-detent-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        this.playFoley('rotary_knob_click');
        onSelect(opt.value);
      });
      btns.push(btn);
      rail.appendChild(btn);
    }

    knob.addEventListener('click', () => {
      const curIdx = options.findIndex((o) => o.value === getCurrent());
      const next = options[(curIdx + 1) % options.length];
      this.playFoley('rotary_knob_click');
      onSelect(next.value);
    });

    this.knobUpdaters.push(() => {
      const cur = getCurrent();
      const idx = Math.max(0, options.findIndex((o) => o.value === cur));
      const span = options.length > 1 ? idx / (options.length - 1) : 0.5;
      const deg = -56 + span * 112;
      knob.style.transform = `rotate(${deg.toFixed(1)}deg)`;
      btns.forEach((b, i) => b.classList.toggle('is-active', i === idx));
    });

    group.append(knob, rail);
    strip.append(lbl, group);
    return strip;
  }

  private createInlineDetentRail<T>(
    options: Array<{ value: T; label: string }>,
    getCurrent: () => T,
    onSelect: (val: T) => void,
  ): HTMLElement {
    const rail = document.createElement('div');
    rail.className = 'v6-detent-rail';
    const btns: HTMLButtonElement[] = [];
    for (const opt of options) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'v6-detent-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        this.playFoley('rotary_knob_click');
        onSelect(opt.value);
      });
      btns.push(btn);
      rail.appendChild(btn);
    }
    this.knobUpdaters.push(() => {
      const cur = getCurrent();
      btns.forEach((b, i) => b.classList.toggle('is-active', options[i].value === cur));
    });
    return rail;
  }

  // --------------------------------------------------------------------------
  // State Persistence, Sync & Ballistic VU / Live FPS Loop
  // --------------------------------------------------------------------------

  private patchState(partial: Partial<BroadcastOptionsStateV6>): void {
    this.state = { ...this.state, ...partial };
    saveBroadcastOptionsV6(this.state);
    if (this.mountParent) {
      applyBroadcastOptionsToDomV6(this.mountParent, this.state);
    }
    this.syncAllControls();
    this.config.onChange?.({ ...this.state });
  }

  private syncAllControls(): void {
    this.faderRefs.forEach((refs, key) => {
      const val = clamp01(this.state[key]);
      const pct = Math.round(val * 100);
      refs.fill.style.height = `${pct}%`;
      refs.cap.style.bottom = `${pct}%`;
      refs.val.textContent = `${pct}%`;
    });

    for (const toggle of this.busToggleRefs) {
      const on = Boolean(this.state[toggle.key]);
      toggle.btn.classList.toggle('is-active', on);
      toggle.led.classList.toggle('is-on', on);
    }

    for (const update of this.knobUpdaters) {
      update();
    }

    if (this.fpsToggleBtn && this.fpsToggleLed) {
      this.fpsToggleBtn.classList.toggle('is-active', this.state.showFpsTelemetry);
      this.fpsToggleLed.classList.toggle('is-on', this.state.showFpsTelemetry);
    }

    this.syncHardwareReadout();
  }

  private syncHardwareReadout(): void {
    if (this.dprReadoutEl) {
      const nativeDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const cap =
        this.state.resolutionTier === 'BATTERY_1X'
          ? 1
          : this.state.resolutionTier === 'HIGH_2X'
            ? 2
            : 3;
      const eff = Math.min(nativeDpr, cap);
      this.dprReadoutEl.textContent = `${eff.toFixed(1)}x`;
    }
    if (this.viewportReadoutEl && typeof window !== 'undefined') {
      this.viewportReadoutEl.textContent = `${window.innerWidth}×${window.innerHeight}`;
    }
    if (this.fpsReadoutEl) {
      this.fpsReadoutEl.textContent = String(this.measuredFps);
    }
  }

  private syncCorpusTelemetry(): void {
    const total = Math.max(1, this.telemetry.totalCount || 1_279_399);
    const seen = Math.max(0, Math.min(total, this.telemetry.seenCount || 0));
    const pct = (seen / total) * 100;

    if (this.corpusCountsEl) {
      this.corpusCountsEl.textContent = `SEEN ${seen.toLocaleString('en-US')} / ${total.toLocaleString('en-US')}`;
    }
    if (this.corpusPctEl) {
      this.corpusPctEl.textContent = `${pct.toFixed(3)}% · 160 KB BITSET`;
    }
    if (this.corpusFillEl) {
      this.corpusFillEl.style.width = `${Math.max(0.5, Math.min(100, pct))}%`;
    }
    if (this.corpusRemainEl) {
      const remain = total - seen;
      this.corpusRemainEl.textContent = `${remain.toLocaleString('en-US')} UNSEEN CLUES READY · ZERO-REPEAT GUARANTEE ACTIVE`;
    }
  }

  private startTelemetryLoop(): void {
    this.lastTs = performance.now();
    this.fpsWindowStart = this.lastTs;
    this.fpsFrames = 0;

    const tick = (now: number) => {
      this.rafId = requestAnimationFrame(tick);
      const dt = Math.min(0.05, Math.max(0.001, (now - this.lastTs) / 1000));
      this.lastTs = now;

      // Live FPS Sampling every 450ms
      this.fpsFrames += 1;
      if (now - this.fpsWindowStart >= 450) {
        this.measuredFps = Math.min(
          144,
          Math.max(1, Math.round((this.fpsFrames * 1000) / (now - this.fpsWindowStart))),
        );
        this.fpsFrames = 0;
        this.fpsWindowStart = now;
        if (this.activeBay === 2) {
          this.syncHardwareReadout();
        }
      }

      // Ballistic ~300ms VU Meter Physics (Bay 1)
      if (this.activeBay === 1 && this.vuNeedleL && this.vuNeedleR) {
        this.vuPhase += dt * (this.auditionPlaying ? 8.2 : 2.8);
        const masterGain = this.state.masterVolume;
        const activeDrive = this.state.musicEnabled
          ? this.state.symphonyVolume * (this.auditionPlaying ? 0.92 : 0.42)
          : 0.04;
        const envL =
          masterGain *
          activeDrive *
          (0.68 + 0.24 * Math.sin(this.vuPhase) + 0.14 * Math.sin(this.vuPhase * 2.37));
        const envR =
          masterGain *
          activeDrive *
          (0.66 + 0.25 * Math.cos(this.vuPhase * 1.13) + 0.13 * Math.sin(this.vuPhase * 1.91));

        // 300ms ballistic integration
        const alpha = 1 - Math.exp(-dt / 0.14);
        this.vuLevelL += (clamp01(envL) - this.vuLevelL) * alpha;
        this.vuLevelR += (clamp01(envR) - this.vuLevelR) * alpha;

        const degL = -44 + this.vuLevelL * 84;
        const degR = -44 + this.vuLevelR * 84;
        this.vuNeedleL.style.transform = `rotate(${degL.toFixed(1)}deg)`;
        this.vuNeedleR.style.transform = `rotate(${degR.toFixed(1)}deg)`;
      }
    };

    this.rafId = requestAnimationFrame(tick);
  }

  private playFoley(sfxId: FoleySfxIdV6): void {
    if (!this.state.sfxEnabled) return;
    this.config.onPlayFoley?.(sfxId);
  }
}
