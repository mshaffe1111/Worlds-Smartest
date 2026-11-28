// ============================================================================
// WORLD'S SMARTEST: 1966 IN LIVING COLOR (v9.0 Production Release)
// `src/v9/StarburstPlinkoUI.ts`
// 5-Lane 120Hz Starburst Plinko Contraption (Mobile-First >= 68px Lanes,
// Thumb-Drag Chrome Chute + 1-Tap Lane Buttons, Twin Brass Center Deflector,
// Sunlit 1966 Walnut/Brass/Cream DOM/CSS Visuals — Zero procedural canvas or SVG).
// ============================================================================

import {
  type PlinkoLaneIndexV9,
  type PlinkoModeV9,
  type PlinkoOutcomeV9,
} from '../v7/contracts_v7';
import {
  loadShowroomLedgerV9,
  PLINKO_BOARD_CONFIG_V9,
  PLINKO_ENTRY_COST_SC,
  playShowroomPlinkoDropV9,
  runPlinkoDropV9,
} from './ShowroomAndCatalogsV9';

export interface StarburstPlinkoOptsV9 {
  readonly root?: HTMLElement;
  readonly mode: PlinkoModeV9;
  readonly onPegNote?: (noteIdx: number, isDeflector: boolean) => void;
  readonly onDropComplete?: (outcome: PlinkoOutcomeV9) => void;
  readonly onPlayTapSfx?: () => void;
  readonly onPlinkoBucketSfx?: (isJackpot: boolean) => void;
  readonly onCashChanged?: () => void;
}

export interface StarburstPlinkoPanelHandleV9 {
  readonly refresh: () => void;
  readonly destroy: () => void;
}

const DEFLECTOR_COORDS_V9: readonly { readonly x: number; readonly y: number }[] =
  PLINKO_BOARD_CONFIG_V9.pegs
    .filter((p) => p.isDeflector)
    .map((p) => ({ x: p.x, y: p.y }));

function isDeflectorCoordinate(x: number, y: number): boolean {
  for (const d of DEFLECTOR_COORDS_V9) {
    if (Math.abs(d.x - x) < 0.6 && Math.abs(d.y - y) < 0.6) {
      return true;
    }
  }
  return false;
}

function clampLaneIndex(val: number): PlinkoLaneIndexV9 {
  const clamped = Math.max(0, Math.min(4, Math.round(val)));
  return clamped as PlinkoLaneIndexV9;
}

export function mountStarburstPlinkoPanelV9(
  container: HTMLElement,
  opts: StarburstPlinkoOptsV9,
): StarburstPlinkoPanelHandleV9 {
  const cfg = PLINKO_BOARD_CONFIG_V9;
  let selectedLane: PlinkoLaneIndexV9 = 2;
  let isDropping = false;
  let sweepsDropConsumed = false;
  let rafId = 0;
  let destroyed = false;

  container.innerHTML = '';

  const panel = document.createElement('div');
  panel.className = 'ws9-plinko-panel';
  panel.style.cssText = [
    'display:flex',
    'flex-direction:column',
    'gap:10px',
    'width:100%',
    'box-sizing:border-box',
    'color:var(--ws9-ink, #141b29)',
  ].join(';');

  // Top Status & Balance Bar
  const statusRow = document.createElement('div');
  statusRow.className = 'ws9-plinko-status-row';
  statusRow.style.cssText = [
    'display:flex',
    'flex-wrap:wrap',
    'align-items:center',
    'justify-content:space-between',
    'gap:8px',
    'padding:8px 12px',
    'border-radius:12px',
    'border:2px solid var(--ws9-brass, #d9a441)',
    'background:var(--ws9-cream-warm, #ede0c4)',
  ].join(';');
  panel.appendChild(statusRow);

  // Drag-Chute Carriage Rail + 1-Tap Lane Buttons
  const chuteWrap = document.createElement('div');
  chuteWrap.className = 'ws9-plinko-chute-wrap';
  chuteWrap.style.cssText = [
    'display:flex',
    'flex-direction:column',
    'gap:6px',
    'padding:8px 6px',
    'border-radius:12px',
    'border:2px solid var(--ws9-walnut, #6e3b23)',
    'background:linear-gradient(180deg, var(--ws9-cream-bright, #fffdf7) 0%, var(--ws9-cream, #faf2df) 100%)',
  ].join(';');

  // Crisp Header Strip ABOVE the Unmarked Chrome Chute Rail
  const chuteHeader = document.createElement('div');
  chuteHeader.className = 'ws9-plinko-chute-header';
  chuteHeader.style.cssText = [
    'display:flex',
    'align-items:center',
    'justify-content:space-between',
    'gap:8px',
    'padding:0 4px',
  ].join(';');

  const railHint = document.createElement('span');
  railHint.className = 'ws9-plinko-chute-label';
  railHint.textContent = 'SLIDE CHUTE OR TAP LANE ▼';
  railHint.style.cssText = [
    'font-size:11px',
    'font-weight:900',
    'letter-spacing:0.08em',
    'color:var(--ws9-walnut-deep, #5c301b)',
  ].join(';');

  const laneReadout = document.createElement('span');
  laneReadout.className = 'ws9-plinko-lane-readout';
  laneReadout.textContent = 'LANE 3 / 5';
  laneReadout.style.cssText = [
    'font-size:11px',
    'font-weight:900',
    'letter-spacing:0.06em',
    'color:var(--ws9-peacock-deep, #00646b)',
    'white-space:nowrap',
  ].join(';');

  chuteHeader.appendChild(railHint);
  chuteHeader.appendChild(laneReadout);

  const railTrack = document.createElement('div');
  railTrack.className = 'ws9-plinko-rail-track';
  railTrack.setAttribute('role', 'slider');
  railTrack.setAttribute('aria-label', 'Slide chrome puck carriage across lanes 1 to 5');
  railTrack.setAttribute('aria-valuemin', '1');
  railTrack.setAttribute('aria-valuemax', '5');
  railTrack.setAttribute('aria-valuenow', '3');
  railTrack.tabIndex = 0;
  railTrack.style.cssText = [
    'position:relative',
    'height:36px',
    'border-radius:999px',
    'border:2px solid var(--ws9-walnut-deep, #5c301b)',
    'background:linear-gradient(180deg, #eef2f6 0%, #c8d2dd 48%, #9aa7b6 100%)',
    'box-shadow:inset 0 2px 4px rgba(255,253,247,0.9), 0 2px 6px rgba(92,48,27,0.22)',
    'touch-action:none',
    'cursor:grab',
    'user-select:none',
  ].join(';');

  const carriageKnob = document.createElement('div');
  carriageKnob.className = 'ws9-plinko-carriage';
  carriageKnob.textContent = '★';
  carriageKnob.style.cssText = [
    'position:absolute',
    'top:50%',
    'width:44px',
    'height:30px',
    'border-radius:999px',
    'transform:translate(-50%, -50%)',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'font-size:15px',
    'font-weight:900',
    'color:var(--ws9-cream-bright, #fffdf7)',
    'border:2px solid var(--ws9-walnut-deep, #5c301b)',
    'background:linear-gradient(180deg, var(--ws9-tangerine, #ff6b35) 0%, #d84b18 100%)',
    'box-shadow:0 3px 8px rgba(92,48,27,0.45)',
    'transition:left 0.1s ease-out',
    'pointer-events:none',
  ].join(';');
  railTrack.appendChild(carriageKnob);

  const laneBtnGrid = document.createElement('div');
  laneBtnGrid.className = 'ws9-plinko-lanes ws9-plinko-lane-buttons';
  laneBtnGrid.style.cssText = [
    'display:grid',
    'grid-template-columns:repeat(5, minmax(0, 1fr))',
    'gap:4px',
  ].join(';');

  const laneButtons: HTMLButtonElement[] = [];
  for (let i = 0; i < 5; i++) {
    const laneIdx = i as PlinkoLaneIndexV9;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ws9-btn ws9-btn-cream ws9-plinko-lane-btn';
    btn.dataset.lane = String(laneIdx);
    btn.textContent = `▼ ${laneIdx + 1}`;
    btn.setAttribute('aria-label', `Drop puck from lane ${laneIdx + 1}`);
    btn.style.cssText = [
      'min-height:48px',
      'min-width:0',
      'padding:6px 4px',
      'font-size:15px',
      'font-weight:900',
      'border-radius:10px',
    ].join(';');
    btn.addEventListener('click', () => {
      if (isDropping || (opts.mode === 'SWEEPS_FREE_DROP' && sweepsDropConsumed)) return;
      opts.onPlayTapSfx?.();
      setSelectedLane(laneIdx);
      void triggerDrop(laneIdx);
    });
    laneButtons.push(btn);
    laneBtnGrid.appendChild(btn);
  }

  chuteWrap.appendChild(chuteHeader);
  chuteWrap.appendChild(railTrack);
  chuteWrap.appendChild(laneBtnGrid);
  panel.appendChild(chuteWrap);

  // Main Tactile Walnut & Brass Plinko Cabinet (unclipped bottom buckets with >= 12px clean bottom apron)
  const visualBoardH = cfg.height + 40;
  const visualDividerTopY = cfg.dividerTopY + 6;

  const boardCabinet = document.createElement('div');
  boardCabinet.className = 'ws9-plinko-board';
  boardCabinet.style.cssText = [
    'position:relative',
    'width:100%',
    'max-width:390px',
    'height:auto',
    `aspect-ratio:${cfg.width} / ${visualBoardH}`,
    'min-height:368px',
    'margin:0 auto',
    'border-radius:16px',
    'border:5px solid var(--ws9-walnut-deep, #5c301b)',
    'outline:3px solid var(--ws9-brass, #d9a441)',
    'background:linear-gradient(180deg, #fffdf7 0%, #faf2df 55%, #ede0c4 100%)',
    'box-shadow:inset 0 0 24px rgba(217,164,65,0.28), 0 10px 26px rgba(92,48,27,0.34)',
    'overflow:visible',
    'box-sizing:border-box',
  ].join(';');

  // Subtle vertical retro pinstripe lanes
  for (let l = 0; l < 5; l++) {
    const stripe = document.createElement('div');
    stripe.style.cssText = [
      'position:absolute',
      'top:0',
      `bottom:${((visualBoardH - visualDividerTopY) / visualBoardH) * 100}%`,
      `left:${l * 20}%`,
      'width:20%',
      l % 2 === 1 ? 'background:rgba(217,164,65,0.08)' : 'background:transparent',
      l < 4 ? 'border-right:1px dashed rgba(110,59,35,0.14)' : '',
      'pointer-events:none',
    ].join(';');
    boardCabinet.appendChild(stripe);
  }

  // Top lane indicator chevron row inside board
  const laneMarkers: HTMLDivElement[] = [];
  for (let l = 0; l < 5; l++) {
    const leftPct = (cfg.launchLanesX[l] / cfg.width) * 100;
    const marker = document.createElement('div');
    marker.textContent = '▼';
    marker.style.cssText = [
      'position:absolute',
      `left:${leftPct}%`,
      'top:4px',
      'transform:translateX(-50%)',
      'font-size:13px',
      'font-weight:900',
      'color:var(--ws9-peacock, #008b94)',
      'pointer-events:none',
      'transition:transform 0.14s ease, color 0.14s ease',
    ].join(';');
    laneMarkers.push(marker);
    boardCabinet.appendChild(marker);
  }

  // Spun Brass Pegs + Twin Brass Deflector Pyramid
  interface PegNode {
    readonly el: HTMLDivElement;
    readonly x: number;
    readonly y: number;
    readonly isDeflector: boolean;
  }
  const pegNodes: PegNode[] = [];

  for (let i = 0; i < cfg.pegs.length; i++) {
    const peg = cfg.pegs[i];
    const pegEl = document.createElement('div');
    const leftPct = (peg.x / cfg.width) * 100;
    const topPct = (peg.y / visualBoardH) * 100;
    const sizePctW = ((peg.r * 2) / cfg.width) * 100;
    const sizePctH = ((peg.r * 2) / visualBoardH) * 100;

    pegEl.className = peg.isDeflector ? 'ws9-plinko-peg is-deflector' : 'ws9-plinko-peg';
    pegEl.style.cssText = [
      'position:absolute',
      `left:${leftPct}%`,
      `top:${topPct}%`,
      `width:${sizePctW}%`,
      `height:${sizePctH}%`,
      'border-radius:999px',
      'transform:translate(-50%, -50%)',
      peg.isDeflector
        ? 'background:radial-gradient(circle at 30% 28%, #fffdf7 0%, #f2a922 45%, #ff6b35 100%);border:2px solid #5c301b;box-shadow:0 0 10px rgba(242,169,34,0.85), 0 2px 5px rgba(92,48,27,0.5)'
        : 'background:radial-gradient(circle at 32% 30%, #fffdf7 0%, #d9a441 55%, #7c4d14 100%);border:1.5px solid #5c301b;box-shadow:0 2px 4px rgba(92,48,27,0.42)',
      'transition:transform 0.09s ease, box-shadow 0.09s ease',
      'pointer-events:none',
    ].join(';');
    boardCabinet.appendChild(pegEl);
    pegNodes.push({ el: pegEl, x: peg.x, y: peg.y, isDeflector: peg.isDeflector });
  }

  // Twin Deflector Label
  const deflectorTag = document.createElement('div');
  deflectorTag.textContent = '★ DEFLECTOR ★';
  deflectorTag.style.cssText = [
    'position:absolute',
    'left:50%',
    `top:${((368 - 27) / visualBoardH) * 100}%`,
    'transform:translateX(-50%)',
    'font-size:9px',
    'font-weight:900',
    'letter-spacing:0.08em',
    'color:var(--ws9-walnut-deep, #5c301b)',
    'background:rgba(250,242,223,0.9)',
    'padding:1px 6px',
    'border-radius:999px',
    'border:1px solid var(--ws9-brass, #d9a441)',
    'pointer-events:none',
    'white-space:nowrap',
  ].join(';');
  boardCabinet.appendChild(deflectorTag);

  // Brass Bucket Dividers
  for (const divX of cfg.bucketDividersX) {
    const divEl = document.createElement('div');
    divEl.style.cssText = [
      'position:absolute',
      `left:${(divX / cfg.width) * 100}%`,
      `top:${(visualDividerTopY / visualBoardH) * 100}%`,
      'bottom:12px',
      'width:4px',
      'transform:translateX(-50%)',
      'border-radius:4px',
      'background:linear-gradient(180deg, #fffdf7 0%, #d9a441 40%, #6e3b23 100%)',
      'z-index:4',
      'pointer-events:none',
    ].join(';');
    boardCabinet.appendChild(divEl);
  }

  // 5 Buckets along the bottom with clean >= 12px inner bottom apron (bucket.bottom <= board.bottom - 10)
  const bucketRow = document.createElement('div');
  bucketRow.className = 'ws9-plinko-buckets';
  bucketRow.style.cssText = [
    'position:absolute',
    'left:4px',
    'right:4px',
    `top:${(visualDividerTopY / visualBoardH) * 100}%`,
    'bottom:12px',
    'display:grid',
    'grid-template-columns:repeat(5, minmax(0, 1fr))',
    'gap:2px',
    'z-index:2',
  ].join(';');

  const bucketEls: HTMLDivElement[] = [];
  for (let b = 0; b < 5; b++) {
    const bucket = document.createElement('div');
    const isCenter = b === 2;
    const isSweeps = opts.mode === 'SWEEPS_FREE_DROP';
    const label = isSweeps
      ? cfg.sweepsBuckets[b].label
      : isCenter
        ? '★ $1,000 ★'
        : `$${cfg.showroomPayoutsSC[b]}`;

    const bg = isCenter
      ? 'linear-gradient(180deg, #f2a922 0%, #e6397a 100%)'
      : b === 0 || b === 4
        ? 'linear-gradient(180deg, #008b94 0%, #00666d 100%)'
        : 'linear-gradient(180deg, #fffdf7 0%, #ede0c4 100%)';
    const fg = isCenter || b === 0 || b === 4 ? '#fffdf7' : '#141b29';

    bucket.className = isCenter ? 'ws9-plinko-bucket is-jackpot' : 'ws9-plinko-bucket';
    bucket.textContent = label;
    bucket.style.cssText = [
      'min-width:0',
      'min-height:0',
      'height:100%',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'text-align:center',
      'padding:4px 3px',
      'border-radius:8px',
      'font-size:11px',
      'line-height:1.15',
      'font-weight:900',
      'letter-spacing:0.02em',
      `background:${bg}`,
      `color:${fg}`,
      'border:2px solid var(--ws9-brass, #d9a441)',
      'box-sizing:border-box',
      'transition:filter 0.15s ease, transform 0.15s ease',
    ].join(';');
    bucketEls.push(bucket);
    bucketRow.appendChild(bucket);
  }
  boardCabinet.appendChild(bucketRow);

  // Metallic Starburst Puck Disc
  const puckEl = document.createElement('div');
  puckEl.className = 'ws9-plinko-puck';
  puckEl.textContent = '★';
  puckEl.style.cssText = [
    'position:absolute',
    `left:${(cfg.launchLanesX[selectedLane] / cfg.width) * 100}%`,
    `top:${(cfg.launchY / visualBoardH) * 100}%`,
    `width:${((cfg.ballRadius * 2) / cfg.width) * 100}%`,
    `height:${((cfg.ballRadius * 2) / visualBoardH) * 100}%`,
    'transform:translate(-50%, -50%)',
    'border-radius:999px',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'font-size:10px',
    'font-weight:900',
    'color:#5c301b',
    'background:radial-gradient(circle at 32% 28%, #fffdf7 0%, #f2a922 45%, #d9a441 78%, #8f5c14 100%)',
    'border:2px solid #5c301b',
    'box-shadow:0 4px 10px rgba(92,48,27,0.5), inset 0 1px 2px rgba(255,253,247,0.9)',
    'z-index:6',
    'pointer-events:none',
  ].join(';');
  boardCabinet.appendChild(puckEl);

  panel.appendChild(boardCabinet);

  // Primary Action & Outcome Banner
  const actionRow = document.createElement('div');
  actionRow.style.cssText = [
    'display:flex',
    'flex-direction:column',
    'gap:8px',
    'align-items:stretch',
  ].join(';');

  const dropBtn = document.createElement('button');
  dropBtn.type = 'button';
  dropBtn.className = 'ws9-btn ws9-btn-tangerine';
  dropBtn.style.width = '100%';
  dropBtn.addEventListener('click', () => {
    if (isDropping || (opts.mode === 'SWEEPS_FREE_DROP' && sweepsDropConsumed)) return;
    opts.onPlayTapSfx?.();
    void triggerDrop(selectedLane);
  });

  const resultBanner = document.createElement('div');
  resultBanner.className = 'ws9-plinko-result-banner';
  resultBanner.style.cssText = [
    'min-height:42px',
    'padding:8px 12px',
    'border-radius:12px',
    'border:2px solid var(--ws9-brass, #d9a441)',
    'background:var(--ws9-cream-bright, #fffdf7)',
    'display:flex',
    'align-items:center',
    'justify-content:center',
    'text-align:center',
    'font-size:13px',
    'font-weight:800',
    'color:var(--ws9-walnut-deep, #5c301b)',
  ].join(';');
  resultBanner.textContent =
    opts.mode === 'SWEEPS_FREE_DROP'
      ? 'Pick any lane 1–5 to drop your FREE Sweeps Bonus Puck!'
      : 'Slide the chrome chute or tap Lane 1–5 to drop!';

  actionRow.appendChild(dropBtn);
  actionRow.appendChild(resultBanner);
  panel.appendChild(actionRow);

  function setSelectedLane(lane: PlinkoLaneIndexV9): void {
    selectedLane = lane;
    const pct = (cfg.launchLanesX[lane] / cfg.width) * 100;
    carriageKnob.style.left = `${pct}%`;
    railTrack.setAttribute('aria-valuenow', String(lane + 1));
    laneReadout.textContent = `LANE ${lane + 1} / 5`;
    if (!isDropping) {
      puckEl.style.left = `${pct}%`;
      puckEl.style.top = `${(cfg.launchY / visualBoardH) * 100}%`;
    }
    laneButtons.forEach((b, idx) => {
      const active = idx === lane;
      b.className = active
        ? 'ws9-btn ws9-btn-peacock ws9-plinko-lane-btn'
        : 'ws9-btn ws9-btn-cream ws9-plinko-lane-btn';
    });
    laneMarkers.forEach((m, idx) => {
      m.style.color = idx === lane ? '#ff6b35' : '#008b94';
      m.style.transform = idx === lane ? 'translateX(-50%) scale(1.25)' : 'translateX(-50%) scale(1)';
    });
    refreshUiState();
  }

  function refreshUiState(): void {
    if (destroyed) return;
    const ledger = loadShowroomLedgerV9();
    if (opts.mode === 'SWEEPS_FREE_DROP') {
      statusRow.innerHTML = `
        <span class="ws9-pill-badge">★ SWEEPS INTERMISSION DROP</span>
        <span class="ws9-pill-badge" style="background:#008b94;color:#fffdf7;border-color:#5c301b;">FREE BONUS PUCK</span>
      `;
      dropBtn.disabled = isDropping || sweepsDropConsumed;
      dropBtn.textContent = isDropping
        ? 'PUCK IN FLIGHT...'
        : sweepsDropConsumed
          ? 'INTERMISSION BONUS CLAIMED ✓'
          : `★ DROP FREE PUCK · LANE ${selectedLane + 1}`;
      laneButtons.forEach((b) => {
        b.disabled = isDropping || sweepsDropConsumed;
      });
      return;
    }

    const hasToken = ledger.plinkoTokens > 0;
    const canAfford = hasToken || ledger.showroomCash >= PLINKO_ENTRY_COST_SC;
    statusRow.innerHTML = `
      <span class="ws9-pill-badge">CASH: $${ledger.showroomCash.toLocaleString()} SC</span>
      <span class="ws9-pill-badge" style="background:${hasToken ? '#f2a922' : '#ede0c4'};color:#141b29;">🪙 TOKENS: ${ledger.plinkoTokens}</span>
    `;
    dropBtn.disabled = isDropping || !canAfford;
    if (isDropping) {
      dropBtn.textContent = 'PUCK BOUNCING...';
    } else if (hasToken) {
      dropBtn.textContent = `🪙 DROP WITH 1 TOKEN · LANE ${selectedLane + 1}`;
    } else if (canAfford) {
      dropBtn.textContent = `★ DROP FOR $${PLINKO_ENTRY_COST_SC} SC · LANE ${selectedLane + 1}`;
    } else {
      dropBtn.textContent = `NEED 1 TOKEN OR $${PLINKO_ENTRY_COST_SC} SC`;
    }
    laneButtons.forEach((b) => {
      b.disabled = isDropping || !canAfford;
    });
  }

  function flashPegAt(x: number, y: number): boolean {
    let hitDeflector = isDeflectorCoordinate(x, y);
    for (const node of pegNodes) {
      if (Math.abs(node.x - x) < 1 && Math.abs(node.y - y) < 1) {
        hitDeflector = node.isDeflector;
        node.el.style.transform = 'translate(-50%, -50%) scale(1.48)';
        node.el.style.boxShadow = node.isDeflector
          ? '0 0 18px #ff6b35, 0 0 8px #fffdf7'
          : '0 0 14px #f2a922, 0 0 6px #fffdf7';
        window.setTimeout(() => {
          if (destroyed) return;
          node.el.style.transform = 'translate(-50%, -50%) scale(1)';
          node.el.style.boxShadow = node.isDeflector
            ? '0 0 10px rgba(242,169,34,0.85), 0 2px 5px rgba(92,48,27,0.5)'
            : '0 2px 4px rgba(92,48,27,0.42)';
        }, 120);
        break;
      }
    }
    return hitDeflector;
  }

  function highlightBucket(bucketIndex: PlinkoLaneIndexV9): void {
    bucketEls.forEach((el, idx) => {
      if (idx === bucketIndex) {
        el.style.filter = 'brightness(1.22)';
        el.style.boxShadow = 'inset 0 0 16px rgba(255,253,247,0.9), 0 0 14px rgba(242,169,34,0.9)';
        el.style.transform = 'scale(1.04)';
      } else {
        el.style.filter = 'brightness(0.86)';
        el.style.boxShadow = 'none';
        el.style.transform = 'scale(1)';
      }
    });
  }

  function clearBucketHighlights(): void {
    bucketEls.forEach((el) => {
      el.style.filter = '';
      el.style.boxShadow = '';
      el.style.transform = '';
    });
  }

  function triggerDrop(lane: PlinkoLaneIndexV9): Promise<PlinkoOutcomeV9 | null> {
    if (isDropping || destroyed) return Promise.resolve(null);

    let outcome: PlinkoOutcomeV9 | null = null;
    if (opts.mode === 'SWEEPS_FREE_DROP') {
      if (sweepsDropConsumed) return Promise.resolve(null);
      outcome = runPlinkoDropV9(lane, 'SWEEPS_FREE_DROP');
      sweepsDropConsumed = true;
    } else {
      const res = playShowroomPlinkoDropV9(lane, true);
      if (!res.ok || !res.outcome) {
        resultBanner.textContent = res.reason ?? `Need 1 Plinko Token or $${PLINKO_ENTRY_COST_SC} SC!`;
        refreshUiState();
        return Promise.resolve(null);
      }
      outcome = res.outcome;
    }

    isDropping = true;
    clearBucketHighlights();
    resultBanner.textContent = `Dropping from Lane ${lane + 1}...`;
    refreshUiState();

    const traj = outcome.trajectory;
    const pegHits = outcome.pegHits;
    const totalDurationSec = traj.length > 0 ? traj[traj.length - 1].t : 1.0;

    return new Promise<PlinkoOutcomeV9 | null>((resolve) => {
      const startMs = performance.now();
      let trajCursor = 0;
      let hitCursor = 0;

      const stepFrame = (nowMs: number): void => {
        if (destroyed || !outcome) {
          resolve(null);
          return;
        }
        const elapsedSec = (nowMs - startMs) / 1000;

        while (hitCursor < pegHits.length && pegHits[hitCursor].t <= elapsedSec) {
          const hit = pegHits[hitCursor];
          const isDefl = flashPegAt(hit.x, hit.y);
          opts.onPegNote?.(hit.noteIdx, isDefl);
          hitCursor++;
        }

        while (trajCursor + 1 < traj.length && traj[trajCursor + 1].t < elapsedSec) {
          trajCursor++;
        }

        let px = traj[traj.length - 1]?.x ?? cfg.launchLanesX[lane];
        let py = traj[traj.length - 1]?.y ?? cfg.bucketFloorY;
        if (trajCursor + 1 < traj.length) {
          const a = traj[trajCursor];
          const b = traj[trajCursor + 1];
          const span = Math.max(0.0001, b.t - a.t);
          const alpha = Math.max(0, Math.min(1, (elapsedSec - a.t) / span));
          px = a.x + (b.x - a.x) * alpha;
          py = a.y + (b.y - a.y) * alpha;
        }

        puckEl.style.left = `${(px / cfg.width) * 100}%`;
        puckEl.style.top = `${(py / visualBoardH) * 100}%`;

        if (elapsedSec < totalDurationSec) {
          rafId = window.requestAnimationFrame(stepFrame);
          return;
        }

        isDropping = false;
        highlightBucket(outcome.bucketIndex);
        const isJackpot = outcome.bucketIndex === 2;
        opts.onPlinkoBucketSfx?.(isJackpot);
        opts.onCashChanged?.();
        opts.onDropComplete?.(outcome);

        resultBanner.style.background = isJackpot
          ? 'linear-gradient(90deg, #f2a922 0%, #ff6b35 100%)'
          : 'var(--ws9-cream-bright, #fffdf7)';
        resultBanner.style.color = isJackpot ? '#fffdf7' : 'var(--ws9-walnut-deep, #5c301b)';
        resultBanner.textContent =
          opts.mode === 'SWEEPS_FREE_DROP'
            ? `LANDED IN ${outcome.bucketLabel}!`
            : `LANDED IN ${outcome.bucketLabel} (+$${outcome.cashWonSC.toLocaleString()} SC)!`;

        refreshUiState();
        resolve(outcome);
      };

      rafId = window.requestAnimationFrame(stepFrame);
    });
  }

  // Thumb-drag chute pointer handling
  let draggingChute = false;
  const laneFromClientX = (clientX: number): PlinkoLaneIndexV9 => {
    const rect = railTrack.getBoundingClientRect();
    const rel = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(1, rect.width)));
    return clampLaneIndex(rel * 4);
  };

  railTrack.addEventListener('pointerdown', (e) => {
    if (isDropping || (opts.mode === 'SWEEPS_FREE_DROP' && sweepsDropConsumed)) return;
    draggingChute = true;
    railTrack.style.cursor = 'grabbing';
    try {
      railTrack.setPointerCapture(e.pointerId);
    } catch {
      // Ignore synthetic event environments
    }
    setSelectedLane(laneFromClientX(e.clientX));
  });

  railTrack.addEventListener('pointermove', (e) => {
    if (!draggingChute) return;
    setSelectedLane(laneFromClientX(e.clientX));
  });

  const endChuteDrag = (e: PointerEvent, shouldDrop: boolean): void => {
    if (!draggingChute) return;
    draggingChute = false;
    railTrack.style.cursor = 'grab';
    try {
      railTrack.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    const lane = laneFromClientX(e.clientX);
    setSelectedLane(lane);
    if (shouldDrop && !isDropping && !(opts.mode === 'SWEEPS_FREE_DROP' && sweepsDropConsumed)) {
      opts.onPlayTapSfx?.();
      void triggerDrop(lane);
    }
  };

  railTrack.addEventListener('pointerup', (e) => endChuteDrag(e, true));
  railTrack.addEventListener('pointercancel', (e) => endChuteDrag(e, false));

  railTrack.addEventListener('keydown', (e) => {
    if (isDropping) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedLane(clampLaneIndex(selectedLane - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedLane(clampLaneIndex(selectedLane + 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      opts.onPlayTapSfx?.();
      void triggerDrop(selectedLane);
    }
  });

  setSelectedLane(2);
  container.appendChild(panel);

  return {
    refresh: () => refreshUiState(),
    destroy: () => {
      destroyed = true;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      panel.remove();
    },
  };
}

export function openStarburstPlinkoModalV9(
  opts: StarburstPlinkoOptsV9,
): Promise<PlinkoOutcomeV9 | null> {
  const host = opts.root ?? document.body;
  let lastOutcome: PlinkoOutcomeV9 | null = null;

  return new Promise<PlinkoOutcomeV9 | null>((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'ws9-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', '1966 Starburst Plinko');

    const shell = document.createElement('div');
    shell.className = 'ws9-plinko-stage';

    const header = document.createElement('header');
    header.className = 'ws9-shell-header';
    header.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:2px;">
        <span style="font-size:11px;font-weight:800;letter-spacing:0.1em;color:var(--ws9-gold,#f2a922);">1966 IN LIVING COLOR</span>
        <h2 style="margin:0;font-size:19px;font-weight:900;letter-spacing:0.03em;">★ STARBURST PLINKO</h2>
      </div>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ws9-btn ws9-btn-cream';
    closeBtn.style.minHeight = '44px';
    closeBtn.textContent = 'DONE ✕';
    header.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'ws9-shell-body';

    const mountPoint = document.createElement('div');
    body.appendChild(mountPoint);

    shell.appendChild(header);
    shell.appendChild(body);
    backdrop.appendChild(shell);
    host.appendChild(backdrop);

    let panelHandle: StarburstPlinkoPanelHandleV9 | null = null;

    const cleanupAndResolve = (): void => {
      window.removeEventListener('keydown', onKeyDown);
      panelHandle?.destroy();
      backdrop.remove();
      resolve(lastOutcome);
    };

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        opts.onPlayTapSfx?.();
        cleanupAndResolve();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    closeBtn.addEventListener('click', () => {
      opts.onPlayTapSfx?.();
      cleanupAndResolve();
    });

    panelHandle = mountStarburstPlinkoPanelV9(mountPoint, {
      ...opts,
      onDropComplete: (outcome) => {
        lastOutcome = outcome;
        opts.onDropComplete?.(outcome);
        if (opts.mode === 'SWEEPS_FREE_DROP') {
          closeBtn.className = 'ws9-btn ws9-btn-emerald';
          closeBtn.textContent = 'COLLECT & CONTINUE ✓';
        }
      },
    });
  });
}
