// ============================================================================
// WORLD'S SMARTEST: 1966 IN LIVING COLOR (v9.0 Production Release)
// `src/v9/SweepsWeekModalV9.ts`
// 5-Night "Returning Champion" Roguelike Gauntlet:
//   - MON..FRI Escalating Nights (1.0x .. 2.5x)
//   - 3 Sponsor Plaque Slots (Draft 1 of 3 after Nights 1..3)
//   - Intermission Starburst Plinko (SWEEPS_FREE_DROP)
//   - `[ 💰 CASH OUT 100% ]` vs `[ 🔥 RISK STREAK ]` (50% Safe-Deposit / 50% At-Risk)
//   - Return Champion Revenge Match CTA (launches with `isRevengeMatch: true`
//     WITHOUT calling `claimRevengeJackpotV9()` pre-match!)
//   - Zero dark-navy colors, zero procedural canvas or SVG placeholder drawings
// ============================================================================

import {
  type SponsorPlaqueSpecV9,
  type SweepsNightNumberV9,
  type SweepsWeekStateV9,
} from '../v7/contracts_v7';
import {
  applySweepsPlinkoOutcomeV9,
  chooseSweepsCashOutV9,
  chooseSweepsRiskStreakV9,
  draftSweepsSponsorV9,
  loadShowroomLedgerV9,
  loadSweepsStateV9,
  startNewSweepsWeekV9,
  SWEEPS_NIGHT_SPECS_V9,
  SWEEPS_SPONSOR_CATALOG_V9,
} from './ShowroomAndCatalogsV9';
import { openStarburstPlinkoModalV9 } from './StarburstPlinkoUI';

const SWEEPS_INTERMISSION_MARKER_KEY_V9 = 'ws_v9_sweeps_intermission_pending_1';

export interface OpenSweepsWeekModalOptsV9 {
  readonly root?: HTMLElement;
  readonly onLaunchNightMatch: (nightSpec: {
    night: SweepsNightNumberV9;
    isRevengeMatch: boolean;
    state: SweepsWeekStateV9;
  }) => void;
  readonly onPlayTapSfx?: () => void;
  readonly onPegNote?: (noteIdx: number, isDeflector: boolean) => void;
  readonly onPlinkoBucketSfx?: (isJackpot: boolean) => void;
  readonly onClose?: (state: SweepsWeekStateV9) => void;
}

function readIntermissionMarker(): boolean {
  try {
    return window.localStorage.getItem(SWEEPS_INTERMISSION_MARKER_KEY_V9) === '1';
  } catch {
    return false;
  }
}

function writeIntermissionMarker(pending: boolean): void {
  try {
    if (pending) {
      window.localStorage.setItem(SWEEPS_INTERMISSION_MARKER_KEY_V9, '1');
    } else {
      window.localStorage.removeItem(SWEEPS_INTERMISSION_MARKER_KEY_V9);
    }
  } catch {
    // Ignore storage restriction
  }
}

function pickThreeSponsorChoices(draftedIds: readonly string[]): SponsorPlaqueSpecV9[] {
  const drafted = new Set(draftedIds);
  const pool = SWEEPS_SPONSOR_CATALOG_V9.filter((s) => !drafted.has(s.sponsorId));
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
  }
  return copy.slice(0, Math.min(3, copy.length));
}

export async function openSweepsWeekModalV9(
  opts: OpenSweepsWeekModalOptsV9,
): Promise<void> {
  const host = opts.root ?? document.body;
  let sponsorDraftChoices: SponsorPlaqueSpecV9[] | null = null;
  let statusBannerText = '';
  let statusBannerTone: 'INFO' | 'GOOD' | 'WARN' = 'INFO';

  // If the player won Night 1..4, `pendingPlinkoFreeDrop` or `pendingSponsorDraft` is true;
  // persist an intermission marker so even after Plinko & Sponsor Draft complete,
  // Cash-Out vs. Risk-Streak remains presented until explicitly chosen.
  const initial = loadSweepsStateV9();
  if (initial.activeRun && (initial.pendingPlinkoFreeDrop || initial.pendingSponsorDraft)) {
    writeIntermissionMarker(true);
  } else if (!initial.activeRun) {
    writeIntermissionMarker(false);
  }

  return new Promise<void>((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'ws9-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', '1966 Sweeps Week 5-Night Gauntlet');

    const shell = document.createElement('div');
    shell.className = 'ws9-sweeps-shell';

    const header = document.createElement('header');
    header.className = 'ws9-shell-header';
    header.style.flexWrap = 'wrap';

    const titleWrap = document.createElement('div');
    titleWrap.style.cssText = 'display:flex;flex-direction:column;gap:2px;';
    titleWrap.innerHTML = `
      <span style="font-size:11px;font-weight:800;letter-spacing:0.1em;color:var(--ws9-gold,#f2a922);">PRIME-TIME ROGUELIKE GAUNTLET</span>
      <h2 style="margin:0;font-size:20px;font-weight:900;letter-spacing:0.03em;">👑 SWEEPS WEEK STREAK</h2>
    `;

    const headerRight = document.createElement('div');
    headerRight.style.cssText = 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;';

    const crownBadge = document.createElement('span');
    crownBadge.className = 'ws9-pill-badge';
    crownBadge.style.cssText =
      'background:var(--ws9-gold,#f2a922);color:var(--ws9-ink,#141b29);font-weight:900;';

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'ws9-btn ws9-btn-cream';
    closeBtn.style.minHeight = '44px';
    closeBtn.textContent = 'BACK ✕';

    headerRight.appendChild(crownBadge);
    headerRight.appendChild(closeBtn);
    header.appendChild(titleWrap);
    header.appendChild(headerRight);

    const body = document.createElement('div');
    body.className = 'ws9-shell-body';
    body.style.cssText = 'display:flex;flex-direction:column;gap:14px;';

    shell.appendChild(header);
    shell.appendChild(body);
    backdrop.appendChild(shell);
    host.appendChild(backdrop);

    const closeModal = (): void => {
      window.removeEventListener('keydown', onKeyDown);
      const latest = loadSweepsStateV9();
      backdrop.remove();
      opts.onClose?.(latest);
      resolve();
    };

    const launchMatch = (
      night: SweepsNightNumberV9,
      isRevengeMatch: boolean,
      state: SweepsWeekStateV9,
    ): void => {
      writeIntermissionMarker(false);
      window.removeEventListener('keydown', onKeyDown);
      backdrop.remove();
      opts.onLaunchNightMatch({ night, isRevengeMatch, state });
      resolve();
    };

    const render = (): void => {
      const state = loadSweepsStateV9();
      const showroom = loadShowroomLedgerV9();
      crownBadge.textContent = `👑 CROWNS: ${state.sweepsCrownsWon} · SC: $${showroom.showroomCash.toLocaleString()}`;
      body.innerHTML = '';

      if (statusBannerText) {
        const banner = document.createElement('div');
        banner.style.cssText = [
          'padding:10px 14px',
          'border-radius:12px',
          'border:2px solid var(--ws9-brass, #d9a441)',
          'font-size:13px',
          'font-weight:800',
          'text-align:center',
          statusBannerTone === 'GOOD'
            ? 'background:var(--ws9-emerald,#15803d);color:#fffdf7;'
            : statusBannerTone === 'WARN'
              ? 'background:var(--ws9-cerise,#e6397a);color:#fffdf7;'
              : 'background:var(--ws9-cream-bright,#fffdf7);color:var(--ws9-ink,#141b29);',
        ].join(';');
        banner.textContent = statusBannerText;
        body.appendChild(banner);
      }

      // 1. Vault Meters Row (50% Safe-Deposit, 50% At-Risk, Revenge Jackpot)
      const metersGrid = document.createElement('section');
      metersGrid.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fit, minmax(175px, 1fr));gap:8px;';

      const totalVault = state.safeDepositCash + state.atRiskVaultCash;
      const meterCards = [
        {
          label: '🛡️ SAFE-DEPOSIT (50% LOCKED)',
          val: `$${state.safeDepositCash.toLocaleString()} SC`,
          bg: '#fffdf7',
          border: '#15803d',
          valColor: '#15803d',
        },
        {
          label: '🔥 AT-RISK VAULT (50%)',
          val: `$${state.atRiskVaultCash.toLocaleString()} SC`,
          bg: '#fffdf7',
          border: '#ff6b35',
          valColor: '#ff6b35',
        },
        {
          label: '⚡ REVENGE JACKPOT POOL',
          val: `$${state.revengeJackpotPool.toLocaleString()} SC`,
          bg: '#ede0c4',
          border: '#e6397a',
          valColor: '#e6397a',
        },
      ];
      for (const m of meterCards) {
        const card = document.createElement('div');
        card.style.cssText = [
          'padding:10px 12px',
          'border-radius:12px',
          `border:2px solid ${m.border}`,
          `background:${m.bg}`,
          'display:flex',
          'flex-direction:column',
          'gap:2px',
        ].join(';');
        card.innerHTML = `
          <span style="font-size:10.5px;font-weight:800;color:var(--ws9-walnut-deep,#5c301b);letter-spacing:0.05em;">${m.label}</span>
          <span style="font-size:20px;font-weight:900;color:${m.valColor};">${m.val}</span>
        `;
        metersGrid.appendChild(card);
      }
      body.appendChild(metersGrid);

      // Prominent top-strip Cash Out CTA whenever player holds live vault cash during active run
      if (
        totalVault > 0 &&
        state.activeRun &&
        state.pendingLossRematchNight === null
      ) {
        const quickCashStrip = document.createElement('div');
        quickCashStrip.style.cssText = [
          'display:flex',
          'flex-wrap:wrap',
          'align-items:center',
          'justify-content:space-between',
          'gap:8px',
          'padding:8px 12px',
          'border-radius:12px',
          'border:2px solid var(--ws9-emerald, #15803d)',
          'background:var(--ws9-cream-bright, #fffdf7)',
        ].join(';');
        const quickCopy = document.createElement('span');
        quickCopy.style.cssText =
          'font-size:12.5px;font-weight:800;color:var(--ws9-walnut-deep,#5c301b);';
        quickCopy.textContent = `Bank $${totalVault.toLocaleString()} SC safely into your Showroom now, or keep pushing your Sweeps streak.`;
        const topCashOutBtn = document.createElement('button');
        topCashOutBtn.type = 'button';
        topCashOutBtn.className = 'ws9-btn ws9-btn-emerald';
        topCashOutBtn.style.cssText = 'min-height:44px;padding:6px 14px;font-size:13px;';
        topCashOutBtn.textContent = `💰 CASH OUT SAFE ($${totalVault.toLocaleString()} SC)`;
        topCashOutBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          writeIntermissionMarker(false);
          const out = chooseSweepsCashOutV9();
          statusBannerText = `Cashed Out $${out.showroomCashAwarded.toLocaleString()} SC into your Prize Showroom!`;
          statusBannerTone = 'GOOD';
          render();
        });
        quickCashStrip.append(quickCopy, topCashOutBtn);
        body.appendChild(quickCashStrip);
      }

      // Active Plinko Buffs Strip
      if (state.nextNightBonusMult > 0 || state.freeFiftyFiftyArmed) {
        const buffsRow = document.createElement('div');
        buffsRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
        if (state.nextNightBonusMult > 0) {
          buffsRow.innerHTML += `<span class="ws9-pill-badge" style="background:var(--ws9-cerise,#e6397a);color:#fffdf7;">👑 +${state.nextNightBonusMult.toFixed(2)}× NEXT NIGHT BONUS ARMED</span>`;
        }
        if (state.freeFiftyFiftyArmed) {
          buffsRow.innerHTML += `<span class="ws9-pill-badge" style="background:var(--ws9-peacock,#008b94);color:#fffdf7;">★ FREE 50/50 CUT ARMED</span>`;
        }
        body.appendChild(buffsRow);
      }

      // 2. 5-Night Returning Champion Track (MON..FRI)
      const trackSection = document.createElement('section');
      trackSection.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      trackSection.innerHTML = `<h3 style="margin:0;font-size:14px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">📺 5-NIGHT BROADCAST SCHEDULE (MON – FRI)</h3>`;

      const nightsGrid = document.createElement('div');
      nightsGrid.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fit, minmax(145px, 1fr));gap:8px;';

      const inIntermission =
        state.activeRun &&
        (state.pendingPlinkoFreeDrop || state.pendingSponsorDraft || readIntermissionMarker());

      for (const spec of SWEEPS_NIGHT_SPECS_V9) {
        const isCurrent = state.activeRun && spec.night === state.currentNight;
        const isDone =
          state.activeRun &&
          (spec.night < state.currentNight || (inIntermission && spec.night === state.currentNight));
        const isRevenge = state.pendingLossRematchNight === spec.night;

        const card = document.createElement('div');
        card.style.cssText = [
          'padding:10px',
          'border-radius:12px',
          `border:2.5px solid ${
            isRevenge
              ? 'var(--ws9-cerise, #e6397a)'
              : isCurrent
                ? 'var(--ws9-tangerine, #ff6b35)'
                : isDone
                  ? 'var(--ws9-emerald, #15803d)'
                  : 'var(--ws9-brass, #d9a441)'
          }`,
          isCurrent || isRevenge
            ? 'background:var(--ws9-cream-bright, #fffdf7);box-shadow:0 4px 12px rgba(255,107,53,0.22);'
            : 'background:var(--ws9-cream-warm, #ede0c4);',
          'display:flex',
          'flex-direction:column',
          'gap:4px',
        ].join(';');

        const statusTag = isRevenge
          ? '🔥 REVENGE'
          : isDone
            ? 'CLEARED ✓'
            : isCurrent
              ? 'TONIGHT ▶'
              : `${spec.multiplier}×`;

        card.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
            <span style="font-size:12px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">${spec.dayLabel}</span>
            <span style="font-size:11px;font-weight:900;color:${isRevenge ? '#e6397a' : isDone ? '#15803d' : '#008b94'};">${statusTag}</span>
          </div>
          <div style="font-size:12.5px;font-weight:800;color:var(--ws9-ink,#141b29);">${spec.multiplier}× Stakes · ${Math.round(spec.rivalAccuracy * 100)}% Rival</div>
          <div style="font-size:11px;font-weight:600;color:var(--ws9-walnut,#6e3b23);line-height:1.25;">${spec.boardHint}</div>
        `;
        nightsGrid.appendChild(card);
      }
      trackSection.appendChild(nightsGrid);
      body.appendChild(trackSection);

      // 3. 3 Sponsor Plaque Slots
      const sponsorSection = document.createElement('section');
      sponsorSection.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      sponsorSection.innerHTML = `<h3 style="margin:0;font-size:14px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">📻 1966 SPONSOR PLAQUE SLOTS (${state.draftedSponsors.length}/3)</h3>`;
      const sponsorRow = document.createElement('div');
      sponsorRow.style.cssText =
        'display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:8px;';

      for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
        const sponsorId = state.draftedSponsors[slotIdx];
        const spec = sponsorId
          ? SWEEPS_SPONSOR_CATALOG_V9.find((s) => s.sponsorId === sponsorId)
          : undefined;
        const plaque = document.createElement('div');
        plaque.style.cssText = [
          'padding:10px 12px',
          'border-radius:12px',
          `border:2px solid ${spec ? spec.badgeHex : 'var(--ws9-brass, #d9a441)'}`,
          spec
            ? 'background:var(--ws9-cream-bright, #fffdf7);'
            : 'background:var(--ws9-cream-warm, #ede0c4);opacity:0.82;',
        ].join(';');
        if (spec) {
          plaque.innerHTML = `
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="width:12px;height:12px;border-radius:999px;background:${spec.badgeHex};border:1.5px solid #5c301b;"></span>
              <span style="font-size:13px;font-weight:900;color:var(--ws9-ink,#141b29);">${spec.name}</span>
            </div>
            <div style="font-size:11px;font-weight:700;color:var(--ws9-walnut,#6e3b23);margin-top:2px;">${spec.tagline}</div>
            <div style="font-size:11.5px;font-weight:800;color:var(--ws9-peacock,#008b94);margin-top:4px;">${spec.effectSummary}</div>
          `;
        } else {
          const slotNightCleared =
            state.activeRun &&
            (slotIdx + 1 < state.currentNight ||
              (inIntermission && slotIdx + 1 === state.currentNight));
          plaque.innerHTML = `
            <div style="font-size:12.5px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">SPONSOR SLOT #${slotIdx + 1}</div>
            <div style="font-size:11.5px;font-weight:600;color:var(--ws9-walnut,#6e3b23);margin-top:3px;">${
              slotNightCleared
                ? `Sponsor Slot #${slotIdx + 1} — Bonus slot open`
                : `Draft 1 of 3 plaques after winning Night ${slotIdx + 1}.`
            }</div>
          `;
        }
        sponsorRow.appendChild(plaque);
      }
      sponsorSection.appendChild(sponsorRow);
      body.appendChild(sponsorSection);

      // 4. Contextual Action Panel (Revenge / Intermission Plinko / Sponsor Draft / Cash-Out vs Risk-Streak / Launch)
      const controlBox = document.createElement('section');
      controlBox.style.cssText = [
        'padding:14px',
        'border-radius:14px',
        'border:3px solid var(--ws9-walnut-deep, #5c301b)',
        'background:linear-gradient(180deg, var(--ws9-cream-bright,#fffdf7) 0%, var(--ws9-cream,#faf2df) 100%)',
        'display:flex',
        'flex-direction:column',
        'gap:10px',
      ].join(';');

      if (state.pendingLossRematchNight !== null) {
        const rematchNight = state.pendingLossRematchNight;
        controlBox.innerHTML = `
          <div style="font-size:17px;font-weight:900;color:var(--ws9-cerise,#e6397a);">🔥 RETURN CHAMPION REVENGE MATCH — NIGHT ${rematchNight}</div>
          <div style="font-size:13px;font-weight:700;color:var(--ws9-ink,#141b29);">Win your Night ${rematchNight} Rematch to claim the $${state.revengeJackpotPool.toLocaleString()} SC Revenge Jackpot and reclaim your Sweeps run!</div>
        `;
        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';

        // IMPORTANT: Do NOT call claimRevengeJackpotV9() pre-match; pass isRevengeMatch: true to launch!
        const revengeBtn = document.createElement('button');
        revengeBtn.type = 'button';
        revengeBtn.className = 'ws9-btn ws9-btn-cerise';
        revengeBtn.style.flex = '1 1 240px';
        revengeBtn.textContent = `🔥 PLAY REVENGE MATCH (NIGHT ${rematchNight})`;
        revengeBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          launchMatch(rematchNight, true, state);
        });

        const freshBtn = document.createElement('button');
        freshBtn.type = 'button';
        freshBtn.className = 'ws9-btn ws9-btn-cream';
        freshBtn.style.flex = '1 1 180px';
        freshBtn.textContent = '🔄 START FRESH NIGHT 1';
        freshBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          writeIntermissionMarker(false);
          startNewSweepsWeekV9();
          statusBannerText = 'Started a fresh 5-Night Sweeps Week run at Night 1!';
          statusBannerTone = 'INFO';
          render();
        });

        btnRow.appendChild(revengeBtn);
        btnRow.appendChild(freshBtn);
        controlBox.appendChild(btnRow);
      } else if (!state.activeRun) {
        controlBox.innerHTML = `
          <div style="font-size:16px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">READY FOR PRIME-TIME SWEEPS?</div>
          <div style="font-size:13px;font-weight:700;color:var(--ws9-ink,#141b29);">Survive 5 escalating nights! Half your winnings lock into Safe-Deposit; risk the rest for +$2,500 SC & 3 Plinko Tokens on Friday!</div>
        `;
        const startBtn = document.createElement('button');
        startBtn.type = 'button';
        startBtn.className = 'ws9-btn ws9-btn-tangerine';
        startBtn.textContent = '👑 START & PLAY MON · NIGHT 1 (1.0×)';
        startBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          writeIntermissionMarker(false);
          const fresh = startNewSweepsWeekV9();
          launchMatch(fresh.currentNight, false, fresh);
        });
        controlBox.appendChild(startBtn);
      } else if (state.pendingSponsorDraft) {
        if (!sponsorDraftChoices || sponsorDraftChoices.length === 0) {
          sponsorDraftChoices = pickThreeSponsorChoices(state.draftedSponsors);
        }
        controlBox.innerHTML = `
          <div style="font-size:16px;font-weight:900;color:var(--ws9-peacock,#008b94);">📻 INTERMISSION SPONSOR DRAFT (PICK 1 OF 3)</div>
          <div style="font-size:12.5px;font-weight:700;color:var(--ws9-ink,#141b29);">Lock a 1966 Sponsor Plaque onto your desk for the rest of this Sweeps Week!</div>
        `;
        const pickGrid = document.createElement('div');
        pickGrid.style.cssText =
          'display:grid;grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));gap:8px;';

        for (const sp of sponsorDraftChoices) {
          const pickBtn = document.createElement('button');
          pickBtn.type = 'button';
          pickBtn.className = 'ws9-btn ws9-btn-cream';
          pickBtn.style.cssText =
            'flex-direction:column;align-items:flex-start;text-align:left;padding:12px;gap:4px;text-transform:none;';
          pickBtn.innerHTML = `
            <span style="font-size:14px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">${sp.name}</span>
            <span style="font-size:11.5px;font-weight:700;color:var(--ws9-peacock,#008b94);">${sp.effectSummary}</span>
          `;
          pickBtn.addEventListener('click', () => {
            opts.onPlayTapSfx?.();
            const res = draftSweepsSponsorV9(sp.sponsorId);
            if (res.ok) {
              sponsorDraftChoices = null;
              writeIntermissionMarker(true);
              statusBannerText = `Signed ${sp.name}!`;
              statusBannerTone = 'GOOD';
            }
            render();
          });
          pickGrid.appendChild(pickBtn);
        }
        controlBox.appendChild(pickGrid);
      } else if (state.pendingPlinkoFreeDrop) {
        controlBox.innerHTML = `
          <div style="font-size:16px;font-weight:900;color:var(--ws9-tangerine,#ff6b35);">★ INTERMISSION STARBURST PLINKO BONUS!</div>
          <div style="font-size:12.5px;font-weight:700;color:var(--ws9-ink,#141b29);">Drop your FREE intermission puck to boost your Vault, arm a Free 50/50, or add +0.50× to tomorrow's Stakes!</div>
        `;
        const plinkoBtn = document.createElement('button');
        plinkoBtn.type = 'button';
        plinkoBtn.className = 'ws9-btn ws9-btn-tangerine';
        plinkoBtn.textContent = '★ PLAY INTERMISSION STARBURST PLINKO (FREE)';
        plinkoBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          void openStarburstPlinkoModalV9({
            root: host,
            mode: 'SWEEPS_FREE_DROP',
            onPlayTapSfx: opts.onPlayTapSfx,
            onPegNote: opts.onPegNote,
            onPlinkoBucketSfx: opts.onPlinkoBucketSfx,
            onDropComplete: (outcome) => {
              applySweepsPlinkoOutcomeV9(outcome);
              writeIntermissionMarker(true);
              statusBannerText = `Plinko Bonus Applied: ${outcome.bucketLabel}!`;
              statusBannerTone = 'GOOD';
            },
          }).then(() => {
            render();
          });
        });
        controlBox.appendChild(plinkoBtn);
      } else if (inIntermission && state.currentNight < 5) {
        const nextNight = (state.currentNight + 1) as SweepsNightNumberV9;
        const nextSpec = SWEEPS_NIGHT_SPECS_V9[nextNight - 1];
        controlBox.innerHTML = `
          <div style="font-size:16px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">NIGHT ${state.currentNight} CLEARED — CASH OUT OR RISK THE STREAK?</div>
          <div style="font-size:12.5px;font-weight:700;color:var(--ws9-ink,#141b29);">Safe-Deposit ($${state.safeDepositCash.toLocaleString()} SC) is 50% locked. At-Risk ($${state.atRiskVaultCash.toLocaleString()} SC) rides into ${nextSpec.dayLabel} (${nextSpec.multiplier}×)!</div>
        `;
        const choiceRow = document.createElement('div');
        choiceRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';

        const cashOutBtn = document.createElement('button');
        cashOutBtn.type = 'button';
        cashOutBtn.className = 'ws9-btn ws9-btn-emerald';
        cashOutBtn.style.flex = '1 1 220px';
        cashOutBtn.textContent = `💰 CASH OUT 100% ($${totalVault.toLocaleString()} SC)`;
        cashOutBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          writeIntermissionMarker(false);
          const out = chooseSweepsCashOutV9();
          statusBannerText = `Cashed Out $${out.showroomCashAwarded.toLocaleString()} SC into your Prize Showroom!`;
          statusBannerTone = 'GOOD';
          render();
        });

        const riskBtn = document.createElement('button');
        riskBtn.type = 'button';
        riskBtn.className = 'ws9-btn ws9-btn-tangerine';
        riskBtn.style.flex = '1 1 220px';
        riskBtn.textContent = `🔥 RISK STREAK → ${nextSpec.dayLabel} (${nextSpec.multiplier}×)`;
        riskBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          writeIntermissionMarker(false);
          const advanced = chooseSweepsRiskStreakV9();
          launchMatch(advanced.currentNight, false, advanced);
        });

        choiceRow.appendChild(cashOutBtn);
        choiceRow.appendChild(riskBtn);
        controlBox.appendChild(choiceRow);
      } else {
        const curSpec = SWEEPS_NIGHT_SPECS_V9[state.currentNight - 1];
        controlBox.innerHTML = `
          <div style="font-size:16px;font-weight:900;color:var(--ws9-walnut-deep,#5c301b);">NEXT UP: ${curSpec.dayLabel} (${curSpec.multiplier}× STAKES)</div>
          <div style="font-size:12.5px;font-weight:700;color:var(--ws9-ink,#141b29);">${curSpec.boardHint} · Rival Accuracy ${Math.round(curSpec.rivalAccuracy * 100)}%</div>
        `;
        const playRow = document.createElement('div');
        playRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;';

        const playBtn = document.createElement('button');
        playBtn.type = 'button';
        playBtn.className = 'ws9-btn ws9-btn-peacock';
        playBtn.style.flex = '1 1 240px';
        playBtn.textContent = `▶ PLAY ${curSpec.dayLabel} (${curSpec.multiplier}×)`;
        playBtn.addEventListener('click', () => {
          opts.onPlayTapSfx?.();
          launchMatch(state.currentNight, false, state);
        });

        playRow.appendChild(playBtn);
        if (totalVault > 0) {
          const bailBtn = document.createElement('button');
          bailBtn.type = 'button';
          bailBtn.className = 'ws9-btn ws9-btn-emerald';
          bailBtn.style.flex = '0 1 auto';
          bailBtn.textContent = `💰 CASH OUT ($${totalVault.toLocaleString()} SC)`;
          bailBtn.addEventListener('click', () => {
            opts.onPlayTapSfx?.();
            writeIntermissionMarker(false);
            const out = chooseSweepsCashOutV9();
            statusBannerText = `Cashed Out $${out.showroomCashAwarded.toLocaleString()} SC!`;
            statusBannerTone = 'GOOD';
            render();
          });
          playRow.appendChild(bailBtn);
        }
        controlBox.appendChild(playRow);
      }

      body.appendChild(controlBox);
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

    render();
  });
}
