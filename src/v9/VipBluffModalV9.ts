// ============================================================================
// WORLD'S SMARTEST: 1966 IN LIVING COLOR (v9.0 Production Release)
// `src/v9/VipBluffModalV9.ts`
// 1966 VIP Celebrity Bluff Square Showdown:
//   - Renders packed 1:1 Gouache Portrait via `getAtlasSpriteEntryV9`
//   - 2-word / compact Topic Strength badge & <= 14-word verbal tell quote
//   - 1-Tap `[ 🤝 TRUST 'EM ]` (+1.0x / -0.5x) vs `[ 🚨 CALL BLUFF! ]` (-0.5x / +1.5x)
//   - Zero dark-navy colors, zero procedural canvas or SVG placeholder drawings
// ============================================================================

import {
  type AtlasSpriteEntryV9,
  type VipBluffScenarioV9,
} from '../v7/contracts_v7';
import {
  getAtlasSpriteEntryV9,
  loadAtlasManifestV9,
} from './ShowroomAndCatalogsV9';

export type VipBluffOutcomeKindV9 =
  | 'HONEST_TRUSTED'
  | 'BLUFF_TRUSTED'
  | 'HONEST_CALLED'
  | 'BLUFF_CAUGHT';

export interface VipBluffDecisionResultV9 {
  readonly decision: 'TRUST' | 'CALL_BLUFF';
  readonly wasBluff: boolean;
  readonly deltaCash: number;
  readonly outcomeKind: VipBluffOutcomeKindV9;
  readonly scenario: VipBluffScenarioV9;
}

function createVipPortraitSpriteEl(
  entry: { readonly sprite: AtlasSpriteEntryV9; readonly assetUrl: string } | null,
  vipName: string,
): HTMLElement {
  const frame = document.createElement('div');
  frame.className = 'ws9-vip-portrait-frame';
  frame.setAttribute('role', 'img');
  frame.setAttribute('aria-label', `${vipName} 1966 Celebrity Portrait`);
  frame.style.cssText = [
    'width:120px',
    'height:120px',
    'flex:0 0 120px',
    'border-radius:14px',
    'border:3px solid var(--ws9-brass, #d9a441)',
    'box-shadow:0 6px 14px rgba(92,48,27,0.32), inset 0 0 0 2px var(--ws9-cream-bright, #fffdf7)',
    'background-color:var(--ws9-cream, #faf2df)',
    'overflow:hidden',
    'display:flex',
    'align-items:center',
    'justify-content:center',
  ].join(';');

  if (!entry) {
    frame.style.background = 'linear-gradient(135deg, #fffdf7 0%, #ede0c4 100%)';
    frame.innerHTML = `<span style="padding:8px;text-align:center;font-weight:900;font-size:13px;color:var(--ws9-walnut-deep,#5c301b);">${vipName}</span>`;
    return frame;
  }

  const { sprite, assetUrl } = entry;
  const sizeX = (sprite.sheetW / sprite.w) * 100;
  const sizeY = (sprite.sheetH / sprite.h) * 100;
  const denomX = sprite.sheetW - sprite.w;
  const denomY = sprite.sheetH - sprite.h;
  const posX = denomX > 0 ? (sprite.x / denomX) * 100 : 0;
  const posY = denomY > 0 ? (sprite.y / denomY) * 100 : 0;

  frame.style.backgroundImage = `url("${assetUrl}")`;
  frame.style.backgroundRepeat = 'no-repeat';
  frame.style.backgroundSize = `${sizeX}% ${sizeY}%`;
  frame.style.backgroundPosition = `${posX}% ${posY}%`;
  return frame;
}

export async function openVipBluffModalV9(opts: {
  root?: HTMLElement;
  scenario: VipBluffScenarioV9;
  tileValue: number;
  onPlayTapSfx?: () => void;
}): Promise<VipBluffDecisionResultV9> {
  await loadAtlasManifestV9();

  const host = opts.root ?? document.body;
  const { scenario } = opts;
  const safeVal = Math.max(100, Math.round(opts.tileValue || scenario.tileValue || 200));
  const trustHonestDelta = safeVal;
  const trustBluffDelta = -Math.round(safeVal * 0.5);
  const callHonestDelta = -Math.round(safeVal * 0.5);
  const callBluffDelta = Math.round(safeVal * 1.5);

  const portraitEntry = getAtlasSpriteEntryV9(scenario.vip.targetId);

  return new Promise<VipBluffDecisionResultV9>((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'ws9-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', `${scenario.vip.name} VIP Celebrity Bluff Square`);

    const card = document.createElement('div');
    card.className = 'ws9-vip-bluff-card';

    const header = document.createElement('header');
    header.className = 'ws9-shell-header';
    header.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:2px;">
        <span style="font-size:11px;font-weight:800;letter-spacing:0.1em;color:var(--ws9-gold,#f2a922);">★ VIP CELEBRITY SQUARE ★</span>
        <h2 style="margin:0;font-size:19px;font-weight:900;letter-spacing:0.03em;">TRUST OR CALL BLUFF?</h2>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
        <span class="ws9-pill-badge">${scenario.category}</span>
        <span class="ws9-pill-badge" style="background:var(--ws9-gold,#f2a922);color:var(--ws9-ink,#141b29);">$${safeVal.toLocaleString()}</span>
      </div>
    `;

    const body = document.createElement('div');
    body.className = 'ws9-shell-body';
    body.style.cssText = 'display:flex;flex-direction:column;gap:14px;';

    // Clue Context Card (always show the question before TRUST / CALL BLUFF)
    if (scenario.clueStem && scenario.clueStem.trim().length > 0) {
      const clueContextCard = document.createElement('div');
      clueContextCard.className = 'ws9-vip-clue-card';
      clueContextCard.style.cssText = [
        'display:flex',
        'flex-direction:column',
        'gap:5px',
        'padding:10px 12px',
        'border-radius:12px',
        'border:2px solid var(--ws9-peacock, #008b94)',
        'background:var(--ws9-cream-bright, #fffdf7)',
      ].join(';');

      const clueMetaRow = document.createElement('div');
      clueMetaRow.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
      const catBadge = document.createElement('span');
      catBadge.className = 'ws9-pill-badge';
      catBadge.style.cssText =
        'background:var(--ws9-peacock,#008b94);color:var(--ws9-cream-bright,#fffdf7);border-color:var(--ws9-walnut-deep,#5c301b);font-size:11px;';
      catBadge.textContent = scenario.category;
      const clueKicker = document.createElement('span');
      clueKicker.style.cssText =
        'font-size:11px;font-weight:800;letter-spacing:0.06em;color:var(--ws9-walnut,#6e3b23);text-transform:uppercase;';
      clueKicker.textContent = 'CLUE ON THE BOARD';
      clueMetaRow.append(catBadge, clueKicker);

      const stemTextEl = document.createElement('div');
      stemTextEl.style.cssText =
        'font-size:14.5px;font-weight:800;line-height:1.35;color:var(--ws9-ink,#141b29);';
      stemTextEl.textContent = scenario.clueStem.trim();

      clueContextCard.append(clueMetaRow, stemTextEl);
      body.appendChild(clueContextCard);
    }

    // Celebrity Profile Row
    const profileRow = document.createElement('div');
    profileRow.style.cssText = [
      'display:flex',
      'flex-wrap:wrap',
      'align-items:center',
      'gap:14px',
      'padding:12px',
      'border-radius:14px',
      'border:2px solid var(--ws9-brass, #d9a441)',
      'background:var(--ws9-cream-bright, #fffdf7)',
    ].join(';');

    const portraitEl = createVipPortraitSpriteEl(portraitEntry, scenario.vip.name);
    profileRow.appendChild(portraitEl);

    const bioCol = document.createElement('div');
    bioCol.style.cssText = 'flex:1 1 220px;display:flex;flex-direction:column;gap:6px;min-width:0;';

    const nameLine = document.createElement('div');
    nameLine.style.cssText = 'display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;';
    nameLine.innerHTML = `
      <span style="font-size:20px;font-weight:900;color:var(--ws9-ink,#141b29);">${scenario.vip.name}</span>
      <span style="font-size:13px;font-weight:700;color:var(--ws9-walnut,#6e3b23);">${scenario.vip.title}</span>
    `;

    const badgeLine = document.createElement('div');
    badgeLine.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
    const strengthPill = document.createElement('span');
    strengthPill.className = 'ws9-pill-badge';
    strengthPill.style.cssText =
      'background:var(--ws9-peacock,#008b94);color:var(--ws9-cream-bright,#fffdf7);border-color:var(--ws9-walnut-deep,#5c301b);font-size:11.5px;';
    strengthPill.textContent = scenario.vip.strengthBadge;
    badgeLine.appendChild(strengthPill);

    const quipBubble = document.createElement('blockquote');
    quipBubble.style.cssText = [
      'margin:4px 0 0 0',
      'padding:10px 12px',
      'border-radius:12px',
      'border-left:4px solid var(--ws9-tangerine, #ff6b35)',
      'background:var(--ws9-cream, #faf2df)',
      'font-size:15px',
      'line-height:1.35',
      'font-weight:800',
      'color:var(--ws9-ink, #141b29)',
    ].join(';');
    quipBubble.textContent = `“${scenario.quip}”`;

    const recLine = document.createElement('div');
    recLine.style.cssText =
      'font-size:12.5px;font-weight:800;color:var(--ws9-walnut-deep,#5c301b);letter-spacing:0.03em;';
    recLine.textContent = `VIP PICK: ${scenario.suggestedChoiceLabel}`;

    bioCol.appendChild(nameLine);
    bioCol.appendChild(badgeLine);
    bioCol.appendChild(quipBubble);
    bioCol.appendChild(recLine);
    profileRow.appendChild(bioCol);
    body.appendChild(profileRow);

    // Reveal Banner (hidden until chosen)
    const outcomeBanner = document.createElement('div');
    outcomeBanner.style.cssText = [
      'display:none',
      'padding:12px 14px',
      'border-radius:12px',
      'border:2px solid var(--ws9-walnut-deep, #5c301b)',
      'text-align:center',
      'font-weight:900',
    ].join(';');
    body.appendChild(outcomeBanner);

    // 1-Tap Action Buttons
    const btnGrid = document.createElement('div');
    btnGrid.style.cssText = [
      'display:grid',
      'grid-template-columns:repeat(auto-fit, minmax(210px, 1fr))',
      'gap:10px',
    ].join(';');

    const trustBtn = document.createElement('button');
    trustBtn.type = 'button';
    trustBtn.className = 'ws9-btn ws9-btn-peacock';
    trustBtn.style.cssText =
      'flex-direction:column;gap:3px;min-height:62px;padding:10px 14px;';
    trustBtn.innerHTML = `
      <span style="font-size:16px;font-weight:900;">🤝 TRUST 'EM</span>
      <span style="font-size:11.5px;font-weight:700;opacity:0.95;text-transform:none;">Honest: +$${trustHonestDelta.toLocaleString()} · Bluff: -$${Math.abs(trustBluffDelta).toLocaleString()}</span>
    `;

    const callBtn = document.createElement('button');
    callBtn.type = 'button';
    callBtn.className = 'ws9-btn ws9-btn-cerise';
    callBtn.style.cssText =
      'flex-direction:column;gap:3px;min-height:62px;padding:10px 14px;';
    callBtn.innerHTML = `
      <span style="font-size:16px;font-weight:900;">🚨 CALL BLUFF!</span>
      <span style="font-size:11.5px;font-weight:700;opacity:0.95;text-transform:none;">Caught: +$${callBluffDelta.toLocaleString()} · Honest: -$${Math.abs(callHonestDelta).toLocaleString()}</span>
    `;

    btnGrid.appendChild(trustBtn);
    btnGrid.appendChild(callBtn);
    body.appendChild(btnGrid);

    card.appendChild(header);
    card.appendChild(body);
    backdrop.appendChild(card);
    host.appendChild(backdrop);

    let settled = false;
    const handlePick = (decision: 'TRUST' | 'CALL_BLUFF'): void => {
      if (settled) return;
      settled = true;
      opts.onPlayTapSfx?.();
      trustBtn.disabled = true;
      callBtn.disabled = true;

      const wasBluff = scenario.isBluffing;
      let outcomeKind: VipBluffOutcomeKindV9;
      let deltaCash: number;

      if (decision === 'TRUST') {
        if (!wasBluff) {
          outcomeKind = 'HONEST_TRUSTED';
          deltaCash = trustHonestDelta;
        } else {
          outcomeKind = 'BLUFF_TRUSTED';
          deltaCash = trustBluffDelta;
        }
      } else {
        if (wasBluff) {
          outcomeKind = 'BLUFF_CAUGHT';
          deltaCash = callBluffDelta;
        } else {
          outcomeKind = 'HONEST_CALLED';
          deltaCash = callHonestDelta;
        }
      }

      const won = deltaCash > 0;
      outcomeBanner.style.display = 'block';
      outcomeBanner.style.background = won
        ? 'var(--ws9-emerald, #15803d)'
        : 'var(--ws9-cerise, #e6397a)';
      outcomeBanner.style.color = 'var(--ws9-cream-bright, #fffdf7)';

      const headline =
        outcomeKind === 'BLUFF_CAUGHT'
          ? `🚨 BLUFF CAUGHT! +$${deltaCash.toLocaleString()}`
          : outcomeKind === 'HONEST_TRUSTED'
            ? `🤝 GENUINE PRO! +$${deltaCash.toLocaleString()}`
            : outcomeKind === 'BLUFF_TRUSTED'
              ? `🎭 HOODWINKED! -$${Math.abs(deltaCash).toLocaleString()}`
              : `😬 FALSE ALARM — HONEST ANSWER! -$${Math.abs(deltaCash).toLocaleString()}`;

      outcomeBanner.innerHTML = `
        <div style="font-size:17px;">${headline}</div>
        <div style="font-size:12px;font-weight:700;margin-top:4px;opacity:0.95;">Tell Clue: ${scenario.vip.tellHint}</div>
      `;

      const finish = (): void => {
        backdrop.remove();
        resolve({
          decision,
          wasBluff,
          deltaCash,
          outcomeKind,
          scenario,
        });
      };

      // Brief 950ms reveal beat (tap anywhere on banner to advance faster)
      const timer = window.setTimeout(finish, 950);
      outcomeBanner.addEventListener(
        'click',
        () => {
          window.clearTimeout(timer);
          finish();
        },
        { once: true },
      );
    };

    trustBtn.addEventListener('click', () => handlePick('TRUST'));
    callBtn.addEventListener('click', () => handlePick('CALL_BLUFF'));
  });
}
