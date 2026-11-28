// ============================================================================
// WORLD'S SMARTEST: 1966 IN LIVING COLOR (v9.0 Production Release)
// `src/v9/ShowroomModalV9.ts`
// 3-Tab 1966 Prize Catalog Showroom, Curtain Gamble, Winner's Den & Studio Style:
//   - Tab 1: PRIZES & CURTAIN (3-Bay Velvet Curtain Gamble + Featured + Chapter 1..10)
//   - Tab 2: DEN & TROPHIES (16:9 Palm Springs Lounge + Pinned Slots + Zonks + Trophies)
//   - Tab 3: STUDIO STYLE (Interactive Mini-Podium & Trilon Preview + 12 Fair Cosmetics)
//   - Sticky Top Bar: SHOWROOM CASH, Free Tickets, [ ★ PLINKO (N) ]
//   - Zero procedural canvas, Zero SVG placeholders, Zero dark-navy surfaces!
// ============================================================================

import {
  CAREER_MEDAL_SPECS_V7,
  type AtlasSpriteEntryV9,
  type CampaignSaveStateV7,
  type CosmeticItemV9,
  type CosmeticSlotV9,
  type CrowdMoodV9,
  type CurtainGambleResultV9,
  type DenRoomSlotV9,
  type PrizeItemV9,
  type ReactiveSignIdV9,
  type ShowroomStateV9,
  type ZonkItemV9,
} from '../v7/contracts_v7';
import { TROPHY_CATALOG_V7 } from '../v7/campaign/CastAndRelicsCatalogV7';
import {
  getTrophyCatalogSummaryV7,
  getTrophyDisplayMetaV7,
} from '../v7/engine/LitTrophyVaultV7';
import {
  COSMETIC_CATALOG_V9,
  CURTAIN_ENTRY_COST_SC,
  MAX_DEN_PINS_V9,
  getActivePrizesV9,
  getActiveZonksV9,
  getAtlasSpriteEntryV9,
  getCurrentDenTierV9,
  getFeaturedShowcaseItemsV9,
  loadAtlasManifestV9,
  loadShowroomLedgerV9,
  playCurtainGambleV9,
  buyGrandPrizeV9,
  buyOrEquipCosmeticV9,
  togglePinnedDenItemV9,
} from './ShowroomAndCatalogsV9';
import { openStarburstPlinkoModalV9 } from './StarburstPlinkoUI';

export type ShowroomTabIdV9 = 'PRIZES' | 'DEN' | 'STYLE';

export interface ShowroomTrophyEntryV9 {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly unlocked: boolean;
}

export interface OpenShowroomModalOptsV9 {
  readonly root?: HTMLElement;
  readonly initialTab?: 'PRIZES' | 'DEN' | 'STYLE' | 'PLINKO';
  readonly currentEpisode?: number;
  readonly onCosmeticEquipped?: (cosmetic: CosmeticItemV9, ledger: ShowroomStateV9) => void;
  readonly onPreviewBuzzerChime?: (chimeId: string) => void;
  readonly onPlayTapSfx?: () => void;
  readonly onPlayCurtainResultSfx?: (outcome: 'ZONK' | 'MID' | 'GRAND') => void;
  readonly onTriggerSignAndCrowd?: (sign: ReactiveSignIdV9, mood: CrowdMoodV9) => void;
  readonly onPegNote?: (noteIdx: number, isDeflector: boolean) => void;
  readonly onPlinkoBucketSfx?: (isJackpot: boolean) => void;
  readonly onOpenTrophyVault?: () => void;
  readonly trophyEntries?: readonly ShowroomTrophyEntryV9[];
  readonly onClose?: (ledger: ShowroomStateV9) => void;
}

function applyAtlasBackgroundStyle(
  el: HTMLElement,
  entry: { readonly sprite: AtlasSpriteEntryV9; readonly assetUrl: string },
  sizeMode: 'CONTAIN_SPRITE' | 'COVER_BACKDROP' = 'CONTAIN_SPRITE',
): void {
  const { sprite, assetUrl } = entry;
  const sizeX = (sprite.sheetW / sprite.w) * 100;
  const sizeY = (sprite.sheetH / sprite.h) * 100;
  const denomX = sprite.sheetW - sprite.w;
  const denomY = sprite.sheetH - sprite.h;
  const posX = denomX > 0 ? (sprite.x / denomX) * 100 : 0;
  const posY = denomY > 0 ? (sprite.y / denomY) * 100 : 0;

  el.style.backgroundImage = `url("${assetUrl}")`;
  el.style.backgroundRepeat = 'no-repeat';
  if (sizeMode === 'COVER_BACKDROP' && sprite.sheetW === sprite.w && sprite.sheetH === sprite.h) {
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center center';
  } else {
    el.style.backgroundSize = `${sizeX}% ${sizeY}%`;
    el.style.backgroundPosition = `${posX}% ${posY}%`;
  }
}

function createAtlasSpriteTileEl(
  targetId: string | null,
  label: string,
  sizePx = 92,
  dimmed = false,
): HTMLElement {
  const box = document.createElement('div');
  box.className = 'ws9-atlas-sprite-tile';
  box.setAttribute('role', 'img');
  box.setAttribute('aria-label', label);
  box.style.cssText = [
    `width:${sizePx}px`,
    `height:${sizePx}px`,
    `flex:0 0 ${sizePx}px`,
    'border-radius:12px',
    'border:2px solid var(--ws9-brass, #d9a441)',
    'background-color:var(--ws9-cream, #faf2df)',
    'box-shadow:inset 0 0 0 2px rgba(255,253,247,0.75), 0 3px 8px rgba(92,48,27,0.2)',
    'overflow:hidden',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    dimmed ? 'filter:grayscale(0.75) opacity(0.62)' : '',
  ].join(';');

  const entry = targetId ? getAtlasSpriteEntryV9(targetId) : null;
  if (entry) {
    applyAtlasBackgroundStyle(box, entry, 'CONTAIN_SPRITE');
  } else {
    box.style.background = 'linear-gradient(135deg, #fffdf7 0%, #ede0c4 100%)';
    box.innerHTML = `<span style="padding:6px;text-align:center;font-size:11px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);line-height:1.2;">${label}</span>`;
  }
  return box;
}

function readCampaignSaveSnapshot(): CampaignSaveStateV7 | null {
  try {
    const raw = window.localStorage.getItem('ws_v7_campaign_save_1');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CampaignSaveStateV7;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

interface DenAnchorSpotV9 {
  readonly xPct: number;
  readonly yPct: number;
  readonly zone: string;
}

const DEN_ANCHOR_SLOTS_V9: Readonly<Record<string, readonly DenAnchorSpotV9[]>> = {
  CREDENZA: [
    { xPct: 12, yPct: 74, zone: 'CREDENZA' },
    { xPct: 30, yPct: 74, zone: 'CREDENZA' },
    { xPct: 12, yPct: 46, zone: 'WALNUT SHELF' },
    { xPct: 30, yPct: 46, zone: 'WALNUT SHELF' },
  ],
  MANTEL: [
    { xPct: 70, yPct: 46, zone: 'MANTEL' },
    { xPct: 88, yPct: 46, zone: 'MANTEL' },
    { xPct: 70, yPct: 18, zone: 'UPPER MANTEL' },
    { xPct: 88, yPct: 76, zone: 'HEARTH' },
  ],
  ALCOVE: [
    { xPct: 12, yPct: 18, zone: 'SHELF 2' },
    { xPct: 30, yPct: 18, zone: 'SHELF 3' },
    { xPct: 50, yPct: 76, zone: 'CONVERSATION PIT' },
    { xPct: 70, yPct: 76, zone: 'LOUNGE' },
  ],
  PEDESTAL: [
    { xPct: 70, yPct: 76, zone: 'COFFEE TABLE' },
    { xPct: 88, yPct: 76, zone: 'COFFEE TABLE' },
    { xPct: 50, yPct: 76, zone: 'LOUNGE' },
  ],
  LOUNGE: [
    { xPct: 70, yPct: 76, zone: 'COFFEE TABLE' },
    { xPct: 88, yPct: 76, zone: 'COFFEE TABLE' },
    { xPct: 50, yPct: 76, zone: 'LOUNGE' },
    { xPct: 50, yPct: 46, zone: 'LOUNGE' },
  ],
  GARAGE: [
    { xPct: 50, yPct: 46, zone: 'TERRACE WINDOW' },
    { xPct: 70, yPct: 46, zone: 'TERRACE WINDOW' },
    { xPct: 88, yPct: 46, zone: 'PATIO VIEW' },
  ],
  GARAGE_TERRACE: [
    { xPct: 50, yPct: 46, zone: 'TERRACE WINDOW' },
    { xPct: 70, yPct: 46, zone: 'TERRACE WINDOW' },
    { xPct: 88, yPct: 46, zone: 'PATIO VIEW' },
    { xPct: 50, yPct: 18, zone: 'TERRACE UPPER' },
  ],
  TRAVEL_WALL: [
    { xPct: 50, yPct: 18, zone: 'TOP WALL' },
    { xPct: 70, yPct: 18, zone: 'GLASS WALL' },
    { xPct: 88, yPct: 18, zone: 'PATIO TOP' },
    { xPct: 30, yPct: 18, zone: 'TOP SHELF' },
  ],
};

const DEN_FALLBACK_ANCHORS_V9: readonly DenAnchorSpotV9[] = [
  ...DEN_ANCHOR_SLOTS_V9.CREDENZA,
  ...DEN_ANCHOR_SLOTS_V9.MANTEL,
  ...DEN_ANCHOR_SLOTS_V9.ALCOVE,
  ...DEN_ANCHOR_SLOTS_V9.PEDESTAL,
  ...DEN_ANCHOR_SLOTS_V9.GARAGE_TERRACE,
  ...DEN_ANCHOR_SLOTS_V9.TRAVEL_WALL,
];

function isDenAnchorColliding(
  candidate: DenAnchorSpotV9,
  placedSpots: readonly DenAnchorSpotV9[],
): boolean {
  return placedSpots.some(
    (p) => Math.abs(p.xPct - candidate.xPct) < 17.5 && Math.abs(p.yPct - candidate.yPct) < 27.5,
  );
}

function resolveDenAnchorSpot(
  roomSlot: string,
  placedSpots: DenAnchorSpotV9[],
): DenAnchorSpotV9 {
  const preferred = DEN_ANCHOR_SLOTS_V9[roomSlot] ?? [];
  for (const spot of preferred) {
    if (!isDenAnchorColliding(spot, placedSpots)) {
      placedSpots.push(spot);
      return spot;
    }
  }
  for (const spot of DEN_FALLBACK_ANCHORS_V9) {
    if (!isDenAnchorColliding(spot, placedSpots)) {
      placedSpots.push(spot);
      return spot;
    }
  }
  const idx = placedSpots.length;
  const fallback: DenAnchorSpotV9 = {
    xPct: 12 + ((idx * 19) % 76),
    yPct: 18 + ((Math.floor(idx / 5) * 28) % 58),
    zone: roomSlot || 'LOUNGE',
  };
  placedSpots.push(fallback);
  return fallback;
}

function findItemById(targetId: string): {
  kind: 'PRIZE' | 'ZONK';
  name: string;
  copy: string;
  roomSlot: DenRoomSlotV9;
} | null {
  const prize = getActivePrizesV9().find((p) => p.targetId === targetId);
  if (prize) {
    return {
      kind: 'PRIZE',
      name: prize.name,
      copy: prize.copy,
      roomSlot: prize.roomSlot,
    };
  }
  const zonk = getActiveZonksV9().find((z) => z.targetId === targetId);
  if (zonk) {
    return {
      kind: 'ZONK',
      name: zonk.name,
      copy: zonk.copy,
      roomSlot: zonk.roomSlot ?? 'CREDENZA',
    };
  }
  return null;
}

export async function openShowroomModalV9(
  opts: OpenShowroomModalOptsV9 = {},
): Promise<ShowroomStateV9> {
  await loadAtlasManifestV9();

  const host = opts.root ?? document.body;
  let activeTab: ShowroomTabIdV9 =
    opts.initialTab === 'DEN' || opts.initialTab === 'STYLE' ? opts.initialTab : 'PRIZES';
  let denFilterSlot: 'ALL' | DenRoomSlotV9 = 'ALL';
  let curtainRevealState: CurtainGambleResultV9 | null = null;
  let curtainRevealing = false;
  let toastMessage = '';
  let toastTone: 'INFO' | 'GOOD' | 'WARN' = 'INFO';
  let featuredShelfCache: PrizeItemV9[] | null = null;

  return new Promise<ShowroomStateV9>((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'ws9-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', '1966 Prize Catalog Showroom');

    const shell = document.createElement('div');
    shell.className = 'ws9-showroom-shell';

    // Sticky Header
    const header = document.createElement('header');
    header.className = 'ws9-shell-header';
    header.style.flexWrap = 'wrap';

    const titleWrap = document.createElement('div');
    titleWrap.style.cssText = 'display:flex;flex-direction:column;gap:2px;';
    titleWrap.innerHTML = `
      <span style="font-size:11px;font-weight:800;letter-spacing:0.1em;color:var(--ws9-gold,#f2a922);">1966 NETWORK SHOWCASE</span>
      <h2 style="margin:0;font-size:20px;font-weight:900;letter-spacing:0.03em;">🎁 PRIZE SHOWROOM</h2>
    `;

    const headerActions = document.createElement('div');
    headerActions.style.cssText =
      'display:flex;flex-wrap:wrap;align-items:center;gap:8px;justify-content:flex-end;';

    const cashBadge = document.createElement('span');
    cashBadge.className = 'ws9-pill-badge';
    cashBadge.style.cssText =
      'background:var(--ws9-gold,#f2a922);color:var(--ws9-ink,#141b29);font-size:13px;font-weight:900;';

    const ticketBadge = document.createElement('span');
    ticketBadge.className = 'ws9-pill-badge';
    ticketBadge.style.cssText =
      'background:var(--ws9-cream-bright,#fffdf7);color:var(--ws9-walnut-deep,#5c301b);font-size:12px;';

    const plinkoLaunchBtn = document.createElement('button');
    plinkoLaunchBtn.type = 'button';
    plinkoLaunchBtn.className = 'ws9-btn ws9-btn-tangerine';
    plinkoLaunchBtn.style.cssText = 'min-height:44px;padding:6px 12px;font-size:13px;';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ws9-btn ws9-btn-cream';
    closeBtn.style.cssText = 'min-height:44px;padding:6px 12px;font-size:13px;';
    closeBtn.textContent = 'DONE ✕';

    headerActions.appendChild(cashBadge);
    headerActions.appendChild(ticketBadge);
    headerActions.appendChild(plinkoLaunchBtn);
    headerActions.appendChild(closeBtn);
    header.appendChild(titleWrap);
    header.appendChild(headerActions);

    // Strict 3-Tab Navigation Bar
    const tabBar = document.createElement('nav');
    tabBar.className = 'ws9-showroom-tabs';
    tabBar.setAttribute('role', 'tablist');
    tabBar.style.cssText = [
      'display:grid',
      'grid-template-columns:repeat(3, minmax(0, 1fr))',
      'gap:6px',
      'padding:8px 12px',
      'background:var(--ws9-cream-warm, #ede0c4)',
      'border-bottom:2px solid var(--ws9-brass, #d9a441)',
    ].join(';');

    const tabDefs: readonly { readonly id: ShowroomTabIdV9; readonly label: string }[] = [
      { id: 'PRIZES', label: '🎁 PRIZES & CURTAIN' },
      { id: 'DEN', label: '🛋️ DEN & TROPHIES' },
      { id: 'STYLE', label: '🎙️ STUDIO STYLE' },
    ];
    const tabBtns = new Map<ShowroomTabIdV9, HTMLButtonElement>();
    for (const def of tabDefs) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'tab';
      btn.textContent = def.label;
      btn.style.cssText = 'min-height:48px;padding:6px 8px;font-size:12.5px;line-height:1.15;';
      btn.addEventListener('click', () => {
        opts.onPlayTapSfx?.();
        activeTab = def.id;
        renderAll();
      });
      tabBtns.set(def.id, btn);
      tabBar.appendChild(btn);
    }

    // Toast Bar
    const toastBanner = document.createElement('div');
    toastBanner.style.cssText = [
      'display:none',
      'padding:8px 14px',
      'font-size:13px',
      'font-weight:800',
      'text-align:center',
      'border-bottom:2px solid var(--ws9-brass, #d9a441)',
    ].join(';');

    // Scrollable Body (display: block via .ws9-showroom-body prevents flex-crushing of hero stages)
    const body = document.createElement('div');
    body.className = 'ws9-shell-body ws9-showroom-body';

    shell.appendChild(header);
    shell.appendChild(tabBar);
    shell.appendChild(toastBanner);
    shell.appendChild(body);
    backdrop.appendChild(shell);
    host.appendChild(backdrop);

    const setToast = (msg: string, tone: 'INFO' | 'GOOD' | 'WARN' = 'INFO'): void => {
      toastMessage = msg;
      toastTone = tone;
    };

    const updateHeaderAndTabs = (ledger: ShowroomStateV9): void => {
      cashBadge.textContent = `SHOWROOM CASH: $${ledger.showroomCash.toLocaleString()} SC`;
      ticketBadge.textContent = `🎟️ TICKETS: ${ledger.freeCurtainTickets}`;
      ticketBadge.style.background =
        ledger.freeCurtainTickets > 0
          ? 'var(--ws9-emerald, #15803d)'
          : 'var(--ws9-cream-bright, #fffdf7)';
      ticketBadge.style.color =
        ledger.freeCurtainTickets > 0
          ? 'var(--ws9-cream-bright, #fffdf7)'
          : 'var(--ws9-walnut-deep, #5c301b)';
      plinkoLaunchBtn.textContent = `★ PLINKO (${ledger.plinkoTokens})`;

      for (const [id, btn] of tabBtns.entries()) {
        const isCurrent = id === activeTab;
        btn.className = isCurrent ? 'ws9-btn ws9-btn-peacock' : 'ws9-btn ws9-btn-cream';
        btn.setAttribute('aria-selected', String(isCurrent));
      }

      if (toastMessage) {
        toastBanner.style.display = 'block';
        toastBanner.textContent = toastMessage;
        toastBanner.style.background =
          toastTone === 'GOOD'
            ? 'var(--ws9-emerald, #15803d)'
            : toastTone === 'WARN'
              ? 'var(--ws9-cerise, #e6397a)'
              : 'var(--ws9-cream-bright, #fffdf7)';
        toastBanner.style.color =
          toastTone === 'INFO' ? 'var(--ws9-ink, #141b29)' : 'var(--ws9-cream-bright, #fffdf7)';
      } else {
        toastBanner.style.display = 'none';
      }
    };

    const launchPlinkoOverlay = async (): Promise<void> => {
      await openStarburstPlinkoModalV9({
        root: host,
        mode: 'SHOWROOM_TOKEN_OR_CASH',
        onPlayTapSfx: opts.onPlayTapSfx,
        onPegNote: opts.onPegNote,
        onPlinkoBucketSfx: opts.onPlinkoBucketSfx,
        onCashChanged: () => renderAll(),
      });
      renderAll();
    };

    plinkoLaunchBtn.addEventListener('click', () => {
      opts.onPlayTapSfx?.();
      void launchPlinkoOverlay();
    });

    const renderPrizesAndCurtainTab = (ledger: ShowroomStateV9): void => {
      const activePrizes = getActivePrizesV9();
      const ownedSet = new Set(ledger.ownedPrizeIds);

      // 1. 3-Bay Velvet Curtain Gamble Stage
      const curtainSection = document.createElement('section');
      curtainSection.className = 'ws9-curtain-section';
      curtainSection.style.cssText = [
        'position:relative',
        'flex-shrink:0',
        'min-height:230px',
        'border-radius:16px',
        'border:3px solid var(--ws9-brass, #d9a441)',
        'overflow:hidden',
        'padding:14px',
        'background-color:var(--ws9-walnut-deep, #5c301b)',
        'box-shadow:0 8px 20px rgba(92,48,27,0.28)',
        'display:flex',
        'flex-direction:column',
        'justify-content:space-between',
      ].join(';');

      const curtainBackdropLayer = document.createElement('div');
      curtainBackdropLayer.className = 'ws9-curtain-backdrop';
      curtainBackdropLayer.style.cssText = [
        'position:absolute',
        'inset:0',
        'opacity:0.65',
        'pointer-events:none',
      ].join(';');
      const curtainBg = getAtlasSpriteEntryV9('curtain_backdrop_stage');
      if (curtainBg) {
        applyAtlasBackgroundStyle(curtainBackdropLayer, curtainBg, 'COVER_BACKDROP');
      }
      curtainSection.appendChild(curtainBackdropLayer);

      const curtainInner = document.createElement('div');
      curtainInner.style.cssText =
        'position:relative;z-index:1;flex:1 1 auto;display:flex;flex-direction:column;justify-content:space-between;gap:12px;';

      const pityReady = ledger.consecutiveZonks >= 2;
      const costLabel =
        ledger.freeCurtainTickets > 0
          ? 'FREE CURTAIN TICKET!'
          : `$${CURTAIN_ENTRY_COST_SC} SC PER PULL`;

      const curtainTop = document.createElement('div');
      curtainTop.style.cssText =
        'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;background:rgba(250,242,223,0.95);padding:10px 12px;border-radius:12px;border:2px solid var(--ws9-brass,#d9a441);';
      curtainTop.innerHTML = `
        <div>
          <div style="font-size:16px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">🎭 3-BAY VELVET CURTAIN GAMBLE</div>
          <div style="font-size:12px;font-weight:700;color:var(--ws9-ink,#141b29);">Win Grand Prizes, +1 Plinko Token, or Collectible Zonks (+$150 Laugh Rebate)!</div>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;">
          <span class="ws9-pill-badge" style="background:${ledger.freeCurtainTickets > 0 ? '#15803d' : '#f2a922'};color:${ledger.freeCurtainTickets > 0 ? '#fffdf7' : '#141b29'};">${costLabel}</span>
          <span class="ws9-pill-badge" style="background:${pityReady ? '#15803d' : '#ede0c4'};color:${pityReady ? '#fffdf7' : '#5c301b'};">${pityReady ? '🛡️ PITY SHIELD ACTIVE (0% ZONK!)' : `🛡️ PITY SHIELD: ${ledger.consecutiveZonks}/2`}</span>
        </div>
      `;
      curtainInner.appendChild(curtainTop);

      const baysGrid = document.createElement('div');
      baysGrid.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fit, minmax(150px, 1fr));gap:10px;';

      const bayStyles = [
        { bg: 'linear-gradient(180deg, #008b94 0%, #005b62 100%)', label: 'CURTAIN #1' },
        { bg: 'linear-gradient(180deg, #f2a922 0%, #c47d0c 100%)', label: 'CURTAIN #2' },
        { bg: 'linear-gradient(180deg, #e6397a 0%, #ad1e53 100%)', label: 'CURTAIN #3' },
      ];

      if (curtainRevealState && curtainRevealState.ok && !curtainRevealing) {
        // Revealed all 3 doors
        for (const door of curtainRevealState.allBays) {
          const isChosen = door.bayNumber === curtainRevealState.chosenBay;
          const card = document.createElement('div');
          card.style.cssText = [
            'display:flex',
            'flex-direction:column',
            'align-items:center',
            'text-align:center',
            'gap:6px',
            'padding:10px',
            'border-radius:12px',
            `border:3px solid ${isChosen ? '#f2a922' : '#d9a441'}`,
            'background:var(--ws9-cream-bright, #fffdf7)',
            isChosen ? 'box-shadow:0 0 0 3px #ff6b35, 0 8px 18px rgba(92,48,27,0.35)' : 'opacity:0.78',
          ].join(';');

          const tag = document.createElement('span');
          tag.className = 'ws9-pill-badge';
          tag.textContent = isChosen ? `★ PICKED BAY #${door.bayNumber}` : `BAY #${door.bayNumber}`;
          if (isChosen) {
            tag.style.background = door.kind === 'ZONK' ? '#e6397a' : '#15803d';
            tag.style.color = '#fffdf7';
          }
          card.appendChild(tag);
          card.appendChild(createAtlasSpriteTileEl(door.targetId, door.title, 88, !isChosen));

          const title = document.createElement('div');
          title.style.cssText = 'font-size:13px;font-weight:900;color:var(--ws9-ink,#141b29);';
          title.textContent = door.title;

          const sub = document.createElement('div');
          sub.style.cssText = 'font-size:11.5px;font-weight:600;color:var(--ws9-walnut,#6e3b23);line-height:1.3;';
          sub.textContent = door.subtitle;

          card.appendChild(title);
          card.appendChild(sub);
          baysGrid.appendChild(card);
        }

        curtainInner.appendChild(baysGrid);

        const resetRow = document.createElement('div');
        resetRow.style.cssText = 'display:flex;justify-content:center;';
        const againBtn = document.createElement('button');
        againBtn.type = 'button';
        againBtn.className = 'ws9-btn ws9-btn-gold';
        againBtn.textContent =
          ledger.freeCurtainTickets > 0
            ? '🎟️ PULL ANOTHER CURTAIN (FREE TICKET)'
            : `🎭 PULL ANOTHER CURTAIN ($${CURTAIN_ENTRY_COST_SC} SC)`;
        againBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          curtainRevealState = null;
          renderAll();
        });
        resetRow.appendChild(againBtn);
        curtainInner.appendChild(resetRow);
      } else {
        for (let idx = 0; idx < 3; idx++) {
          const bayNum = (idx + 1) as 1 | 2 | 3;
          const styleSpec = bayStyles[idx];
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.disabled = curtainRevealing;
          btn.className = 'ws9-curtain-bay-btn';
          btn.dataset.bay = String(bayNum);
          btn.dataset.revealing = curtainRevealing ? 'true' : 'false';
          btn.innerHTML = `
            <span class="ws9-curtain-num">${bayNum}</span>
            <span class="ws9-curtain-bay-lbl">${curtainRevealing ? 'OPENING...' : styleSpec.label}</span>
          `;

          btn.addEventListener('click', () => {
            if (curtainRevealing) return;
            opts.onPlayTapSfx?.();
            const res = playCurtainGambleV9(bayNum);
            if (!res.ok || !res.chosenOutcome) {
              setToast(
                res.reason ?? `Need $${CURTAIN_ENTRY_COST_SC} SC or 1 Free Curtain Ticket.`,
                'WARN',
              );
              renderAll();
              return;
            }
            curtainRevealing = true;
            curtainRevealState = res;
            featuredShelfCache = null;
            renderAll();

            window.setTimeout(() => {
              curtainRevealing = false;
              const chosen = res.chosenOutcome!;
              if (chosen.kind === 'ZONK') {
                setToast(`🎭 ZONK! ${chosen.title} (+$${chosen.cashAwardedSC} SC Laugh Rebate!)`, 'WARN');
                opts.onPlayCurtainResultSfx?.('ZONK');
                opts.onTriggerSignAndCrowd?.('LAUGH', 'LAUGH');
              } else if (chosen.kind === 'GRAND_SHOWCASE') {
                setToast(
                  `🌟 GRAND SHOWCASE! Won ${chosen.title}${chosen.plinkoTokenAwarded ? ' + 1 Plinko Token!' : '!'}`,
                  'GOOD',
                );
                opts.onPlayCurtainResultSfx?.('GRAND');
                opts.onTriggerSignAndCrowd?.('JACKPOT', 'OVATION');
              } else {
                setToast(`🎁 SHOWCASE WIN! ${chosen.title}!`, 'GOOD');
                opts.onPlayCurtainResultSfx?.('MID');
                opts.onTriggerSignAndCrowd?.('APPLAUSE', 'APPLAUSE');
              }
              renderAll();
            }, 450);
          });

          baysGrid.appendChild(btn);
        }
        curtainInner.appendChild(baysGrid);
      }

      curtainSection.appendChild(curtainInner);
      body.appendChild(curtainSection);

      // 2. Featured Showcase Shelf
      if (!featuredShelfCache) {
        featuredShelfCache = getFeaturedShowcaseItemsV9({
          chapterOrEpisode: opts.currentEpisode ?? 90,
          count: 4,
          recordAsOffered: false,
          ledger,
        });
      }
      if (featuredShelfCache.length > 0) {
        const featSection = document.createElement('section');
        featSection.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
        featSection.innerHTML = `<h3 style="margin:0;font-size:15px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);letter-spacing:0.04em;">✨ FEATURED SHOWCASE SHELF (UNOWNED FIRST)</h3>`;
        const featGrid = document.createElement('div');
        featGrid.style.cssText =
          'display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:10px;';
        for (const prize of featuredShelfCache) {
          featGrid.appendChild(buildPrizeCatalogCard(prize, ownedSet.has(prize.targetId), ledger.showroomCash));
        }
        featSection.appendChild(featGrid);
        body.appendChild(featSection);
      }

      // 3. Vault Catalog Grouped by chapterUnlock 1..10
      const chapters = new Map<number, PrizeItemV9[]>();
      for (const p of activePrizes) {
        const list = chapters.get(p.chapterUnlock) ?? [];
        list.push(p);
        chapters.set(p.chapterUnlock, list);
      }
      const sortedChapters = [...chapters.keys()].sort((a, b) => a - b);

      for (const ch of sortedChapters) {
        const items = chapters.get(ch) ?? [];
        const epStart = (ch - 1) * 9 + 1;
        const epEnd = ch * 9;
        const chSec = document.createElement('section');
        chSec.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
        chSec.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid var(--ws9-cream-warm,#ede0c4);padding-bottom:4px;">
            <h3 style="margin:0;font-size:14px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">CHAPTER ${ch} SHOWCASE · EPISODES ${epStart}–${epEnd}</h3>
            <span class="ws9-pill-badge">${items.filter((i) => ownedSet.has(i.targetId)).length}/${items.length} OWNED</span>
          </div>
        `;
        const grid = document.createElement('div');
        grid.style.cssText =
          'display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:10px;';
        for (const prize of items) {
          grid.appendChild(buildPrizeCatalogCard(prize, ownedSet.has(prize.targetId), ledger.showroomCash));
        }
        chSec.appendChild(grid);
        body.appendChild(chSec);
      }
    };

    const buildPrizeCatalogCard = (
      prize: PrizeItemV9,
      owned: boolean,
      cashSC: number,
    ): HTMLElement => {
      const card = document.createElement('article');
      card.style.cssText = [
        'display:flex',
        'flex-direction:column',
        'justify-content:space-between',
        'gap:8px',
        'padding:10px',
        'border-radius:14px',
        `border:2px solid ${owned ? 'var(--ws9-emerald, #15803d)' : 'var(--ws9-brass, #d9a441)'}`,
        'background:var(--ws9-cream-bright, #fffdf7)',
      ].join(';');

      const topRow = document.createElement('div');
      topRow.style.cssText = 'display:flex;gap:10px;align-items:flex-start;';
      topRow.appendChild(createAtlasSpriteTileEl(prize.targetId, prize.name, 78, false));

      const meta = document.createElement('div');
      meta.style.cssText = 'flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:3px;';
      meta.innerHTML = `
        <span style="font-size:10.5px;font-weight:800;color:var(--ws9-peacock,#008b94);">TIER ${prize.tier} · CH ${prize.chapterUnlock}</span>
        <div style="font-size:13.5px;font-weight:900;color:var(--ws9-ink,#141b29);line-height:1.2;">${prize.name}</div>
        <div style="font-size:11.5px;font-weight:600;color:var(--ws9-walnut,#6e3b23);line-height:1.3;">${prize.copy}</div>
      `;
      topRow.appendChild(meta);
      card.appendChild(topRow);

      const actionBtn = document.createElement('button');
      actionBtn.type = 'button';
      if (owned) {
        actionBtn.className = 'ws9-btn ws9-btn-emerald';
        actionBtn.disabled = true;
        actionBtn.textContent = 'OWNED ✓';
      } else {
        const canAfford = cashSC >= prize.priceSC;
        actionBtn.className = canAfford ? 'ws9-btn ws9-btn-gold' : 'ws9-btn ws9-btn-cream';
        actionBtn.disabled = !canAfford;
        actionBtn.textContent = canAfford
          ? `BUY · $${prize.priceSC.toLocaleString()} SC`
          : `NEED $${prize.priceSC.toLocaleString()} SC`;
        actionBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          const res = buyGrandPrizeV9(prize.targetId);
          if (res.ok) {
            setToast(`🎉 Claimed ${prize.name} for your Winner's Den!`, 'GOOD');
            featuredShelfCache = null;
            opts.onTriggerSignAndCrowd?.('APPLAUSE', 'APPLAUSE');
          } else {
            setToast(res.reason ?? 'Could not purchase prize.', 'WARN');
          }
          renderAll();
        });
      }
      card.appendChild(actionBtn);
      return card;
    };

    const renderDenAndTrophiesTab = (ledger: ShowroomStateV9): void => {
      const activePrizes = getActivePrizesV9();
      const activeZonks = getActiveZonksV9();
      const denTier = getCurrentDenTierV9(ledger);
      const ownedPrizeSet = new Set(ledger.ownedPrizeIds);
      const ownedZonkSet = new Set(ledger.ownedZonkIds);
      const pinnedSet = new Set(ledger.pinnedDenIds);

      // 1. Palm Springs Lounge Hero + Den Tier
      const loungeCard = document.createElement('section');
      loungeCard.className = 'ws9-den-lounge-card';
      loungeCard.style.cssText = [
        'flex-shrink:0',
        'border-radius:16px',
        'border:3px solid var(--ws9-brass, #d9a441)',
        'overflow:hidden',
        'background:var(--ws9-cream-bright, #fffdf7)',
      ].join(';');

      const tierBar = document.createElement('div');
      tierBar.style.cssText = [
        'display:flex',
        'flex-wrap:wrap',
        'align-items:center',
        'justify-content:space-between',
        'gap:8px',
        'padding:10px 14px',
        'background:var(--ws9-cream-warm, #ede0c4)',
        'border-bottom:2px solid var(--ws9-brass, #d9a441)',
      ].join(';');
      tierBar.innerHTML = `
        <div>
          <div style="font-size:16px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">🛋️ ${denTier.title.toUpperCase()}</div>
          <div style="font-size:12px;font-weight:700;color:var(--ws9-ink,#141b29);">${denTier.subtitle}</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <span class="ws9-pill-badge">PRIZES: ${ledger.ownedPrizeIds.length}/${activePrizes.length}</span>
          <span class="ws9-pill-badge">ZONKS: ${ledger.ownedZonkIds.length}/${activeZonks.length}</span>
        </div>
      `;
      loungeCard.appendChild(tierBar);

      const loungeStage = document.createElement('div');
      loungeStage.className = 'ws9-den-lounge-stage';
      loungeStage.style.cssText = [
        'position:relative',
        'flex-shrink:0',
        'width:100%',
        'max-width:780px',
        'margin:0 auto',
        'aspect-ratio:16 / 9',
        'min-height:220px',
        'background-color:var(--ws9-cream, #faf2df)',
        'overflow:hidden',
        'box-sizing:border-box',
      ].join(';');
      const denBg = getAtlasSpriteEntryV9('den_backdrop_lounge');
      if (denBg) {
        applyAtlasBackgroundStyle(loungeStage, denBg, 'COVER_BACKDROP');
      }

      const filteredPinned = ledger.pinnedDenIds.filter((id) => {
        if (denFilterSlot === 'ALL') return true;
        const info = findItemById(id);
        return info?.roomSlot === denFilterSlot;
      });

      const placedDenSpots: DenAnchorSpotV9[] = [];
      for (const id of filteredPinned) {
        const info = findItemById(id);
        if (!info) continue;
        const anchor = resolveDenAnchorSpot(info.roomSlot, placedDenSpots);
        const entry = getAtlasSpriteEntryV9(id);

        const plaque = document.createElement('button');
        plaque.type = 'button';
        plaque.className = 'ws9-den-pinned-plaque';
        plaque.dataset.targetId = id;
        plaque.dataset.anchorZone = anchor.zone;
        plaque.dataset.kind = info.kind;
        plaque.title = `${info.name} (${anchor.zone}) — Tap to unpin`;
        plaque.setAttribute('aria-label', `Unpin ${info.name} from ${anchor.zone}`);
        plaque.style.cssText = [
          'position:absolute',
          `left:${anchor.xPct}%`,
          `top:${anchor.yPct}%`,
          'transform:translate(-50%, -50%)',
          'z-index:3',
          'display:flex',
          'flex-direction:column',
          'align-items:center',
          'gap:2px',
          'padding:3px',
          'border-radius:10px',
          `border:2px solid ${info.kind === 'ZONK' ? 'var(--ws9-cerise, #e6397a)' : 'var(--ws9-brass, #d9a441)'}`,
          'background:rgba(255, 253, 247, 0.94)',
          'box-shadow:0 4px 12px rgba(67, 33, 17, 0.42), inset 0 1px 0 #ffffff',
          'cursor:pointer',
          'transition:transform 0.14s ease, box-shadow 0.14s ease',
        ].join(';');

        const spriteCutout = document.createElement('div');
        spriteCutout.className = 'ws9-den-pinned-sprite';
        spriteCutout.style.cssText = [
          'width:clamp(42px, 6.8vw, 62px)',
          'height:clamp(42px, 6.8vw, 62px)',
          'border-radius:7px',
          'background-color:var(--ws9-cream, #faf2df)',
          'overflow:hidden',
        ].join(';');
        if (entry) {
          applyAtlasBackgroundStyle(spriteCutout, entry, 'CONTAIN_SPRITE');
        } else {
          spriteCutout.textContent = info.name.slice(0, 10);
          spriteCutout.style.fontSize = '9px';
          spriteCutout.style.fontWeight = '900';
          spriteCutout.style.display = 'flex';
          spriteCutout.style.alignItems = 'center';
          spriteCutout.style.justifyContent = 'center';
        }

        const plaqueName = document.createElement('span');
        plaqueName.className = 'ws9-den-pinned-label';
        plaqueName.textContent = info.name.split(/\s+/).slice(-2).join(' ');
        plaqueName.style.cssText = [
          'max-width:86px',
          'font-size:9px',
          'line-height:1.1',
          'font-weight:900',
          'color:var(--ws9-walnut-dark, #432111)',
          'text-align:center',
          'white-space:normal',
        ].join(';');

        const unpinDot = document.createElement('span');
        unpinDot.className = 'ws9-den-unpin-chip';
        unpinDot.setAttribute('aria-hidden', 'true');
        unpinDot.textContent = '✕';

        plaque.appendChild(spriteCutout);
        plaque.appendChild(plaqueName);
        plaque.appendChild(unpinDot);
        plaque.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          togglePinnedDenItemV9(id);
          renderAll();
        });
        loungeStage.appendChild(plaque);
      }

      if (filteredPinned.length === 0) {
        const emptySpotBadge = document.createElement('div');
        emptySpotBadge.className = 'ws9-den-empty-badge';
        emptySpotBadge.style.cssText = [
          'position:absolute',
          'left:14px',
          'bottom:12px',
          'right:14px',
          'z-index:2',
          'background:rgba(250, 242, 223, 0.92)',
          'border:2px solid var(--ws9-brass, #d9a441)',
          'border-radius:10px',
          'padding:7px 10px',
          'font-size:11.5px',
          'font-weight:800',
          'color:var(--ws9-walnut-deep, #5c301b)',
          'text-align:center',
        ].join(';');
        emptySpotBadge.textContent =
          ledger.ownedPrizeIds.length + ledger.ownedZonkIds.length === 0
            ? 'Win or buy Prizes & Zonks to display them on your Palm Springs shelves, mantel & table!'
            : 'No pinned items in this zone yet — tap PIN TO DEN on any owned item below!';
        loungeStage.appendChild(emptySpotBadge);
      }

      loungeCard.appendChild(loungeStage);

      // Compact Pinned Showcase Filter & Status Bar cleanly BELOW the 16:9 Lounge Viewport
      const pinnedControlBar = document.createElement('div');
      pinnedControlBar.className = 'ws9-den-pinned-bar';
      pinnedControlBar.style.cssText = [
        'background:var(--ws9-cream-warm, #ede0c4)',
        'border-top:2px solid var(--ws9-brass, #d9a441)',
        'padding:8px 12px',
        'display:flex',
        'flex-wrap:wrap',
        'align-items:center',
        'justify-content:space-between',
        'gap:6px',
      ].join(';');
      pinnedControlBar.innerHTML = `<span style="font-size:11.5px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">📌 PINNED ON DISPLAY (${ledger.pinnedDenIds.length}/${MAX_DEN_PINS_V9} · TAP PLAQUE TO UNPIN)</span>`;

      const filterPills = document.createElement('div');
      filterPills.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';
      const slotTabs: readonly { readonly id: 'ALL' | DenRoomSlotV9; readonly label: string }[] = [
        { id: 'ALL', label: 'ALL' },
        { id: 'CREDENZA', label: 'CREDENZA' },
        { id: 'ALCOVE', label: 'ALCOVE' },
        { id: 'GARAGE_TERRACE', label: 'TERRACE' },
        { id: 'TRAVEL_WALL', label: 'TRAVEL' },
      ];
      for (const st of slotTabs) {
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = denFilterSlot === st.id ? 'ws9-btn ws9-btn-peacock' : 'ws9-btn ws9-btn-cream';
        pill.style.cssText = 'min-height:34px;min-width:44px;padding:3px 9px;font-size:10.5px;';
        pill.textContent = st.label;
        pill.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          denFilterSlot = st.id;
          renderAll();
        });
        filterPills.appendChild(pill);
      }
      pinnedControlBar.appendChild(filterPills);
      loungeCard.appendChild(pinnedControlBar);
      body.appendChild(loungeCard);

      // 2. Owned & Catalog Vault Ledger (Prizes)
      const ownedPrizesSec = document.createElement('section');
      ownedPrizesSec.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      ownedPrizesSec.innerHTML = `<h3 style="margin:0;font-size:14px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">🏆 GRAND PRIZE VAULT LEDGER (${ledger.ownedPrizeIds.length}/${activePrizes.length})</h3>`;
      const prizeLedgerGrid = document.createElement('div');
      prizeLedgerGrid.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fill, minmax(210px, 1fr));gap:8px;';

      const sortedPrizes = [...activePrizes].sort(
        (a, b) => Number(ownedPrizeSet.has(b.targetId)) - Number(ownedPrizeSet.has(a.targetId)),
      );
      for (const p of sortedPrizes) {
        const owned = ownedPrizeSet.has(p.targetId);
        const pinned = pinnedSet.has(p.targetId);
        const itemEl = document.createElement('div');
        itemEl.style.cssText = [
          'display:flex',
          'align-items:center',
          'gap:8px',
          'padding:8px',
          'border-radius:12px',
          `border:2px solid ${owned ? 'var(--ws9-brass,#d9a441)' : 'var(--ws9-cream-warm,#ede0c4)'}`,
          'background:var(--ws9-cream-bright, #fffdf7)',
        ].join(';');
        itemEl.appendChild(createAtlasSpriteTileEl(p.targetId, p.name, 58, !owned));

        const infoCol = document.createElement('div');
        infoCol.style.cssText = 'flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:4px;';
        infoCol.innerHTML = `
          <div style="font-size:12.5px;font-weight:900;color:var(--ws9-ink,#141b29);line-height:1.2;">${p.name}</div>
          <div style="font-size:11px;font-weight:700;color:var(--ws9-walnut,#6e3b23);">${owned ? `${p.roomSlot.replace('_', ' ')}` : `Unowned · $${p.priceSC.toLocaleString()} SC`}</div>
        `;
        if (owned) {
          const pinBtn = document.createElement('button');
          pinBtn.type = 'button';
          pinBtn.className = pinned ? 'ws9-btn ws9-btn-peacock' : 'ws9-btn ws9-btn-cream';
          pinBtn.style.cssText = 'min-height:34px;padding:4px 8px;font-size:11px;';
          pinBtn.textContent = pinned ? '📌 PINNED ✓' : '📌 PIN TO DEN';
          pinBtn.addEventListener('click', () => {
            opts.onPlayTapSfx?.();
            togglePinnedDenItemV9(p.targetId);
            renderAll();
          });
          infoCol.appendChild(pinBtn);
        }
        itemEl.appendChild(infoCol);
        prizeLedgerGrid.appendChild(itemEl);
      }
      ownedPrizesSec.appendChild(prizeLedgerGrid);
      body.appendChild(ownedPrizesSec);

      // 3. Curtain Casualties (Active Zonks)
      const zonkSec = document.createElement('section');
      zonkSec.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      zonkSec.innerHTML = `<h3 style="margin:0;font-size:14px;font-weight:900;color:var(--ws9-cerise,#e6397a);">😜 CURTAIN CASUALTIES — 1966 ZONK MUSEUM (${ledger.ownedZonkIds.length}/${activeZonks.length})</h3>`;
      const zonkGrid = document.createElement('div');
      zonkGrid.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:8px;';

      for (const z of activeZonks as readonly ZonkItemV9[]) {
        const owned = ownedZonkSet.has(z.targetId);
        const pinned = pinnedSet.has(z.targetId);
        const zCard = document.createElement('div');
        zCard.style.cssText = [
          'display:flex',
          'align-items:center',
          'gap:8px',
          'padding:8px',
          'border-radius:12px',
          `border:2px solid ${owned ? 'var(--ws9-cerise,#e6397a)' : 'var(--ws9-cream-warm,#ede0c4)'}`,
          'background:var(--ws9-cream-bright, #fffdf7)',
        ].join(';');
        zCard.appendChild(createAtlasSpriteTileEl(z.targetId, z.name, 62, !owned));

        const zCol = document.createElement('div');
        zCol.style.cssText = 'flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:4px;';
        zCol.innerHTML = `
          <div style="font-size:12.5px;font-weight:900;color:var(--ws9-ink,#141b29);line-height:1.2;">${z.name}</div>
          <div style="font-size:11px;font-weight:600;color:var(--ws9-walnut,#6e3b23);line-height:1.25;">${owned ? z.copy : 'Mystery Curtain Zonk — Find behind Curtain Gamble!'}</div>
        `;
        if (owned) {
          const pinBtn = document.createElement('button');
          pinBtn.type = 'button';
          pinBtn.className = pinned ? 'ws9-btn ws9-btn-cerise' : 'ws9-btn ws9-btn-cream';
          pinBtn.style.cssText = 'min-height:34px;padding:4px 8px;font-size:11px;';
          pinBtn.textContent = pinned ? '📌 PINNED ✓' : '📌 PIN ZONK';
          pinBtn.addEventListener('click', () => {
            opts.onPlayTapSfx?.();
            togglePinnedDenItemV9(z.targetId);
            renderAll();
          });
          zCol.appendChild(pinBtn);
        }
        zCard.appendChild(zCol);
        zonkGrid.appendChild(zCard);
      }
      zonkSec.appendChild(zonkGrid);
      body.appendChild(zonkSec);

      // 4. Campaign Trophies (36 Cards + 3D Trophy Vault CTA) & Career Medals Summary
      const campaignSave = readCampaignSaveSnapshot();
      const unlockedTrophies = new Set(campaignSave?.unlockedTrophyIds ?? []);
      const trophyEntries =
        opts.trophyEntries && opts.trophyEntries.length > 0
          ? opts.trophyEntries.map((entry) => {
              const spec = TROPHY_CATALOG_V7.find((t) => t.trophyId === entry.id);
              const meta = spec ? getTrophyDisplayMetaV7(spec.trophyId) : null;
              return {
                id: entry.id,
                title: entry.title,
                description: entry.description,
                unlocked: entry.unlocked,
                season: spec?.season ?? 1,
                tierBadge: meta?.tierBadge ?? 'GOLD TROPHY',
                accentHex: meta?.accentHex ?? '#F2A922',
              };
            })
          : TROPHY_CATALOG_V7.map((spec) => {
              const meta = getTrophyDisplayMetaV7(spec.trophyId);
              const unlocked = unlockedTrophies.has(spec.trophyId);
              return {
                id: spec.trophyId,
                title: spec.name,
                description: unlocked
                  ? `${spec.engraving} · ${spec.unlockRuleText}`
                  : spec.unlockRuleText || meta.grindHint,
                unlocked,
                season: spec.season,
                tierBadge: meta.tierBadge,
                accentHex: meta.accentHex,
              };
            });

      const resolvedUnlockedSet = new Set(
        trophyEntries.filter((t) => t.unlocked).map((t) => t.id),
      );
      const trophySummary = getTrophyCatalogSummaryV7(resolvedUnlockedSet);
      const medalCounts = campaignSave?.careerMedalCounts ?? {};

      const trophySec = document.createElement('section');
      trophySec.className = 'ws9-trophy-wing-section';
      trophySec.style.cssText = [
        'padding:12px',
        'border-radius:14px',
        'border:2px solid var(--ws9-brass, #d9a441)',
        'background:var(--ws9-cream-warm, #ede0c4)',
        'display:flex',
        'flex-direction:column',
        'gap:10px',
      ].join(';');

      const trophyHeaderRow = document.createElement('div');
      trophyHeaderRow.style.cssText =
        'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;';
      trophyHeaderRow.innerHTML = `
        <div>
          <div style="font-size:15px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">🏛️ SOVEREIGN TROPHY WING &amp; CAREER MEDALS</div>
          <div style="font-size:12px;font-weight:700;color:var(--ws9-ink,#141b29);">Broadcast Rank: ${trophySummary.rankTitle} · ${trophySummary.earnedPoints}/${trophySummary.totalPoints} Vault Pts · ${resolvedUnlockedSet.size}/${trophyEntries.length} Unlocked</div>
        </div>
      `;

      const open3dVaultBtn = document.createElement('button');
      open3dVaultBtn.type = 'button';
      open3dVaultBtn.className = 'ws9-btn ws9-btn-peacock ws9-trophy-vault-cta';
      open3dVaultBtn.dataset.action = 'open-3d-trophy-vault';
      open3dVaultBtn.textContent = `🏆 OPEN 3D TROPHY VAULT (${resolvedUnlockedSet.size}/${trophyEntries.length})`;
      open3dVaultBtn.addEventListener('click', () => {
        opts.onPlayTapSfx?.();
        closeModal();
        opts.onOpenTrophyVault?.();
      });
      trophyHeaderRow.appendChild(open3dVaultBtn);
      trophySec.appendChild(trophyHeaderRow);

      const medalStrip = document.createElement('div');
      medalStrip.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fill, minmax(190px, 1fr));gap:6px;';
      for (const spec of Object.values(CAREER_MEDAL_SPECS_V7)) {
        const count = medalCounts[spec.id] ?? 0;
        const mCard = document.createElement('div');
        mCard.style.cssText = [
          'padding:8px',
          'border-radius:10px',
          `border:1.5px solid ${count > 0 ? 'var(--ws9-gold,#f2a922)' : 'rgba(110,59,35,0.22)'}`,
          'background:var(--ws9-cream-bright, #fffdf7)',
          count > 0 ? '' : 'opacity:0.78',
        ].join(';');
        mCard.innerHTML = `
          <div style="font-size:12.5px;font-weight:900;color:var(--ws9-ink,#141b29);">${spec.icon} ${spec.name} ${count > 0 ? `×${count}` : ''}</div>
          <div style="font-size:11px;font-weight:600;color:var(--ws9-walnut,#6e3b23);margin-top:2px;">${spec.summary}</div>
        `;
        medalStrip.appendChild(mCard);
      }
      trophySec.appendChild(medalStrip);

      const trophySubhead = document.createElement('div');
      trophySubhead.style.cssText =
        'font-size:12.5px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);letter-spacing:0.04em;margin-top:4px;';
      trophySubhead.textContent = `ALL ${trophyEntries.length} STUDIO TROPHIES (${resolvedUnlockedSet.size}/${trophyEntries.length} EARNED)`;
      trophySec.appendChild(trophySubhead);

      const trophyCardsGrid = document.createElement('div');
      trophyCardsGrid.className = 'ws9-trophy-cards-grid';
      trophyCardsGrid.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fill, minmax(220px, 1fr));gap:8px;';

      for (const t of trophyEntries) {
        const tierKey =
          t.tierBadge === 'PLATINUM CROWN'
            ? 'platinum'
            : t.tierBadge === 'GOLD TROPHY'
              ? 'gold'
              : t.tierBadge === 'SILVER MEDAL'
                ? 'silver'
                : 'bronze';
        const tCard = document.createElement('article');
        tCard.className = 'ws9-den-trophy-card';
        tCard.dataset.trophyId = t.id;
        tCard.dataset.unlocked = String(t.unlocked);
        tCard.style.cssText = [
          'display:flex',
          'align-items:flex-start',
          'gap:8px',
          'padding:9px',
          'border-radius:12px',
          `border:2px solid ${t.unlocked ? t.accentHex : 'rgba(110,59,35,0.28)'}`,
          'background:var(--ws9-cream-bright, #fffdf7)',
          t.unlocked ? 'box-shadow:0 3px 10px rgba(92,48,27,0.16);' : 'opacity:0.86;',
        ].join(';');

        tCard.innerHTML = `
          <div class="ws9-trophy-medallion" data-unlocked="${t.unlocked}" data-tier="${tierKey}" aria-hidden="true">
            <span class="ws9-trophy-medallion-glyph">${t.unlocked ? '🏆' : '🔒'}</span>
            <span class="ws9-trophy-medallion-tag">S${t.season}</span>
          </div>
          <div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:3px;">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:4px;">
              <span style="font-size:10px;font-weight:900;padding:1px 6px;border-radius:999px;background:${t.unlocked ? '#15803d' : '#ede0c4'};color:${t.unlocked ? '#fffdf7' : '#5c301b'};border:1px solid ${t.unlocked ? '#15803d' : '#d9a441'};">${t.unlocked ? '✓ UNLOCKED' : 'LOCKED'}</span>
              <span style="font-size:10px;font-weight:800;color:var(--ws9-peacock-deep,#00646b);">${t.tierBadge}</span>
            </div>
            <div style="font-size:13px;font-weight:900;color:var(--ws9-ink,#141b29);line-height:1.2;">${t.title}</div>
            <div style="font-size:11.5px;font-weight:600;color:var(--ws9-walnut,#6e3b23);line-height:1.3;">${t.description}</div>
          </div>
        `;
        trophyCardsGrid.appendChild(tCard);
      }

      trophySec.appendChild(trophyCardsGrid);
      body.appendChild(trophySec);
    };

    const renderStudioStyleTab = (ledger: ShowroomStateV9): void => {
      const equippedTrim = COSMETIC_CATALOG_V9.find(
        (c) => c.cosmeticId === ledger.equipped.PODIUM_TRIM,
      );
      const equippedBuzzer = COSMETIC_CATALOG_V9.find(
        (c) => c.cosmeticId === ledger.equipped.BUZZER_CHIME,
      );
      const equippedTrilon = COSMETIC_CATALOG_V9.find(
        (c) => c.cosmeticId === ledger.equipped.TRILON_STYLE,
      );

      // 1. Live Interactive Mini-Podium & Trilon Preview
      const previewCard = document.createElement('section');
      previewCard.style.cssText = [
        'padding:14px',
        'border-radius:16px',
        `border:4px solid ${equippedTrim?.accentHex ?? '#6e3b23'}`,
        'background:linear-gradient(180deg, var(--ws9-cream-bright,#fffdf7) 0%, var(--ws9-cream-warm,#ede0c4) 100%)',
        'display:flex',
        'flex-direction:column',
        'gap:10px',
      ].join(';');

      const previewTop = document.createElement('div');
      previewTop.style.cssText =
        'display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;';
      previewTop.innerHTML = `
        <div>
          <div style="font-size:16px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">🎙️ LIVE CONTESTANT PODIUM & TRILON PREVIEW</div>
          <div style="font-size:12px;font-weight:700;color:var(--ws9-emerald,#15803d);">100% Fair Studio Cosmetics · Zero Stat Boosts · Zero Extra Seconds</div>
        </div>
      `;

      const testBuzzerBtn = document.createElement('button');
      testBuzzerBtn.type = 'button';
      testBuzzerBtn.className = 'ws9-btn ws9-btn-peacock';
      testBuzzerBtn.textContent = `🔔 TEST ${equippedBuzzer?.name.toUpperCase() ?? 'BUZZER'}`;
      testBuzzerBtn.addEventListener('click', () => {
        opts.onPreviewBuzzerChime?.(ledger.equipped.BUZZER_CHIME);
      });
      previewTop.appendChild(testBuzzerBtn);
      previewCard.appendChild(previewTop);

      const miniStage = document.createElement('div');
      miniStage.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;align-items:stretch;';

      const trilonPreview = document.createElement('div');
      const isCobaltTrilon = equippedTrilon?.cosmeticId === 'trilon_cobalt_glass';
      const isGoldTrilon = equippedTrilon?.cosmeticId === 'trilon_atomic_gold';
      const isCeriseTrilon = equippedTrilon?.cosmeticId === 'trilon_cerise_checker';
      trilonPreview.style.cssText = [
        'padding:14px',
        'border-radius:12px',
        `border:3px solid ${equippedTrilon?.accentHex ?? '#d9a441'}`,
        isCobaltTrilon
          ? 'background:linear-gradient(180deg,#1746a2 0%,#10337a 100%);color:#fffdf7;'
          : isGoldTrilon
            ? 'background:linear-gradient(180deg,#f2a922 0%,#d98e14 100%);color:#141b29;'
            : isCeriseTrilon
              ? 'background:repeating-linear-gradient(45deg,#fffdf7,#fffdf7 12px,#fde8f0 12px,#fde8f0 24px);color:#141b29;'
              : 'background:linear-gradient(180deg,#fffdf7 0%,#faf2df 100%);color:#141b29;',
        'display:flex',
        'flex-direction:column',
        'align-items:center',
        'justify-content:center',
        'gap:4px',
        'text-align:center',
      ].join(';');
      trilonPreview.innerHTML = `
        <span style="font-size:10.5px;font-weight:800;letter-spacing:0.08em;opacity:0.9;">SAMPLE TRILON TILE</span>
        <span style="font-size:24px;font-weight:900;">$500</span>
        <span style="font-size:11.5px;font-weight:800;">${equippedTrilon?.name ?? ''}</span>
      `;

      const podiumPreview = document.createElement('div');
      podiumPreview.style.cssText = [
        'padding:14px',
        'border-radius:12px',
        `border:4px solid ${equippedTrim?.accentHex ?? '#6e3b23'}`,
        'background:linear-gradient(180deg, var(--ws9-walnut,#6e3b23) 0%, var(--ws9-walnut-deep,#5c301b) 100%)',
        'color:var(--ws9-cream-bright, #fffdf7)',
        'display:flex',
        'flex-direction:column',
        'align-items:center',
        'justify-content:center',
        'gap:4px',
        'text-align:center',
      ].join(';');
      podiumPreview.innerHTML = `
        <span style="font-size:10.5px;font-weight:800;letter-spacing:0.08em;color:var(--ws9-gold,#f2a922);">CONTESTANT LECTERN</span>
        <span style="font-size:18px;font-weight:900;">${equippedTrim?.name ?? ''}</span>
        <span style="font-size:11.5px;font-weight:700;">Chime: ${equippedBuzzer?.name ?? ''}</span>
      `;

      miniStage.appendChild(trilonPreview);
      miniStage.appendChild(podiumPreview);
      previewCard.appendChild(miniStage);
      body.appendChild(previewCard);

      // 2. Three Cosmetic Slot Groups (4 Podium Trims, 4 Buzzer Chimes, 4 Trilon Styles)
      const slotSections: readonly {
        readonly slot: CosmeticSlotV9;
        readonly title: string;
      }[] = [
        { slot: 'PODIUM_TRIM', title: '🪵 CONTESTANT PODIUM TRIMS (4)' },
        { slot: 'BUZZER_CHIME', title: '🔔 STUDIO BUZZER CHIMES (4)' },
        { slot: 'TRILON_STYLE', title: '🎛️ TRILON TILE STYLES (4)' },
      ];

      const ownedCosmetics = new Set(ledger.ownedCosmeticIds);
      for (const sec of slotSections) {
        const groupEl = document.createElement('section');
        groupEl.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
        groupEl.innerHTML = `<h3 style="margin:0;font-size:14px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">${sec.title}</h3>`;

        const grid = document.createElement('div');
        grid.style.cssText =
          'display:grid;grid-template-columns:repeat(auto-fill, minmax(210px, 1fr));gap:10px;';

        const items = COSMETIC_CATALOG_V9.filter((c) => c.slot === sec.slot);
        for (const item of items) {
          const isOwned = ownedCosmetics.has(item.cosmeticId);
          const isEquipped = ledger.equipped[sec.slot] === item.cosmeticId;
          const canAfford = ledger.showroomCash >= item.priceSC;

          const card = document.createElement('div');
          card.style.cssText = [
            'display:flex',
            'flex-direction:column',
            'justify-content:space-between',
            'gap:8px',
            'padding:10px',
            'border-radius:12px',
            `border:2.5px solid ${isEquipped ? 'var(--ws9-peacock,#008b94)' : 'var(--ws9-brass,#d9a441)'}`,
            'background:var(--ws9-cream-bright, #fffdf7)',
          ].join(';');

          card.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="width:20px;height:20px;border-radius:999px;background:${item.accentHex};border:2px solid var(--ws9-walnut-deep,#5c301b);flex:0 0 20px;"></span>
              <div style="font-size:13.5px;font-weight:900;color:var(--ws9-ink,#141b29);">${item.name}</div>
            </div>
            <div style="font-size:11.5px;font-weight:600;color:var(--ws9-walnut,#6e3b23);line-height:1.3;">${item.subtitle}</div>
          `;

          const btnRow = document.createElement('div');
          btnRow.style.cssText = 'display:flex;gap:6px;';

          if (sec.slot === 'BUZZER_CHIME') {
            const previewBtn = document.createElement('button');
            previewBtn.type = 'button';
            previewBtn.className = 'ws9-btn ws9-btn-cream';
            previewBtn.style.cssText = 'min-height:48px;padding:6px 10px;font-size:12px;';
            previewBtn.textContent = '🔊';
            previewBtn.setAttribute('aria-label', `Preview ${item.name}`);
            previewBtn.addEventListener('click', () => {
              opts.onPreviewBuzzerChime?.(item.cosmeticId);
            });
            btnRow.appendChild(previewBtn);
          }

          const actionBtn = document.createElement('button');
          actionBtn.type = 'button';
          actionBtn.style.flex = '1 1 auto';
          if (isEquipped) {
            actionBtn.className = 'ws9-btn ws9-btn-peacock';
            actionBtn.disabled = true;
            actionBtn.textContent = 'EQUIPPED ✓';
          } else if (isOwned) {
            actionBtn.className = 'ws9-btn ws9-btn-gold';
            actionBtn.textContent = 'EQUIP';
          } else {
            actionBtn.className = canAfford ? 'ws9-btn ws9-btn-tangerine' : 'ws9-btn ws9-btn-cream';
            actionBtn.disabled = !canAfford;
            actionBtn.textContent = canAfford
              ? `BUY & EQUIP · $${item.priceSC.toLocaleString()} SC`
              : `NEED $${item.priceSC.toLocaleString()} SC`;
          }

          actionBtn.addEventListener('click', () => {
            opts.onPlayTapSfx?.();
            const res = buyOrEquipCosmeticV9(item.cosmeticId);
            if (res.ok && res.item) {
              opts.onCosmeticEquipped?.(res.item, res.ledger);
              if (res.item.slot === 'BUZZER_CHIME') {
                opts.onPreviewBuzzerChime?.(res.item.cosmeticId);
              }
              setToast(`✨ Equipped ${res.item.name}!`, 'GOOD');
            } else {
              setToast(res.reason ?? 'Cannot equip cosmetic.', 'WARN');
            }
            renderAll();
          });

          btnRow.appendChild(actionBtn);
          card.appendChild(btnRow);
          grid.appendChild(card);
        }

        groupEl.appendChild(grid);
        body.appendChild(groupEl);
      }
    };

    const renderAll = (): void => {
      const ledger = loadShowroomLedgerV9();
      updateHeaderAndTabs(ledger);
      body.innerHTML = '';
      body.scrollTop = 0;

      if (activeTab === 'PRIZES') {
        renderPrizesAndCurtainTab(ledger);
      } else if (activeTab === 'DEN') {
        renderDenAndTrophiesTab(ledger);
      } else {
        renderStudioStyleTab(ledger);
      }
    };

    const closeModal = (): void => {
      window.removeEventListener('keydown', onKeyDown);
      const finalLedger = loadShowroomLedgerV9();
      backdrop.remove();
      opts.onClose?.(finalLedger);
      resolve(finalLedger);
    };

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        opts.onPlayTapSfx?.();
        closeModal();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    closeBtn.addEventListener('click', () => {
      opts.onPlayTapSfx?.();
      closeModal();
    });

    renderAll();

    if (opts.initialTab === 'PLINKO') {
      void launchPlinkoOverlay();
    }
  });
}
