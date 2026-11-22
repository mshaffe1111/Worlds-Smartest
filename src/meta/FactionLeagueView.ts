// ============================================================================
// WORLD'S SMARTEST — World Council Factions & Seasonal League (`PITCH_BIBLE.md` §2.1 & §4)
// Interactive Allegiance Chamber & Async Faction Cup Standings:
//  • Pledge Allegiance to:
//      1. The Sovereign Bloc ("The Iron Laurel" — Chancellor Ingrid Lindqvist)
//      2. The Horizon Collective ("The Glass Spire" — Director Kenji Takahashi)
//      3. The Agora Coalition ("The Open Commons" — Ambassador Amara Okafor)
//  • Heraldic Faction Crests (`faction_*.png` crisp zero-404 vector crests + optional PNG override)
//  • Domain Affinities (with Enamel Medallions `cat_0..11.png`) & Psychometric Fit %
//  • Live/Async Season 1 Faction Cup Standings, 8-Hub Regional Control & Ghost Contenders!
// ============================================================================

import { forgeEngine } from '../forge';
import {
  RANKED_GHOST_CONTENDERS,
  type CouncilTrialsGhostMode,
  type GhostContenderCard,
} from '../modes';
import {
  SOVEREIGN_DOMAINS,
  type DomainId,
  type FactionId,
  type HubId,
  type InkBlackboard,
  type PassportSystem,
} from '../narrative';
import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';
import {
  attachMetaEscapeHandler,
  bindVaultJumperEvents,
  ensureMetaStylesInjected,
  escapeMetaHtml,
  renderVaultJumperHtml,
  sanitizeMetaCopy,
  type MetaSuiteSectionId,
} from './DiplomaticPassportBook';

export interface WorldCouncilFactionSpec {
  id: FactionId;
  name: string;
  epithet: string;
  chairName: string;
  chairTitle: string;
  fieldEnvoyLabel: string;
  portraitCutoutUrl: string;
  philosophyPillars: string;
  manifestoQuote: string;
  affinityDomains: readonly DomainId[];
  passportCrestReward: string;
  accentHex: string;
  secondaryHex: string;
}

export interface FactionCupStandingEntry {
  faction: WorldCouncilFactionSpec;
  rank: 1 | 2 | 3;
  cupPoints: number;
  sharePct: number;
  psychometricFitPct: number;
  isPledged: boolean;
}

export interface FactionLeagueDependencies {
  passport: PassportSystem;
  blackboard: InkBlackboard;
  trialsMode?: CouncilTrialsGhostMode;
  audio?: StudioAudioEngine;
  haptics?: HapticsEngine;
  /** Optional external PNG overrides for `faction_sovereign`, `faction_horizon`, `faction_agora` */
  factionCrestUrls?: Partial<Record<FactionId, string>>;
}

export interface FactionLeagueCallbacks {
  onPledgeFaction?: (faction: FactionId) => void;
  onLaunchGhostDuel?: (contenderId?: string) => void;
  onLaunchBlackSalon?: () => void;
  onNavigateSection?: (section: MetaSuiteSectionId) => void;
  onBack?: () => void;
  canGoBack?: boolean;
  onClose?: () => void;
}

const TRIALS_STORAGE_KEY = 'ws_council_trials_v2';

export const WORLD_COUNCIL_FACTIONS: Record<FactionId, WorldCouncilFactionSpec> = {
  SOVEREIGN: {
    id: 'SOVEREIGN',
    name: 'The Sovereign Bloc',
    epithet: 'The Iron Laurel',
    chairName: 'Chancellor Ingrid Lindqvist',
    chairTitle: 'Sovereign Council Chair · Former Nordic PM',
    fieldEnvoyLabel: 'London Rotunda Seat',
    portraitCutoutUrl: './assets/portraits_cutout/lindqvist.png',
    philosophyPillars: 'Order · Heritage · Treaty Protocol',
    manifestoQuote:
      'Civilization endures only when truth is weighed inside treaty law, institutional memory, and disciplined stewardship.',
    affinityDomains: [0, 8, 3, 10], // History, Society & Law, Arts & Culture, Myth & Philosophy
    passportCrestReward: 'IRON LAUREL LEGATE · SOVEREIGN BLOC',
    accentHex: '#f2cf7e',
    secondaryHex: '#6c5326',
  },
  HORIZON: {
    id: 'HORIZON',
    name: 'The Horizon Collective',
    epithet: 'The Glass Spire',
    chairName: 'Director Kenji Takahashi',
    chairTitle: 'Horizon Collective Chair · Tokyo Spire',
    fieldEnvoyLabel: 'Envoy: Soren "Echo" Kael',
    portraitCutoutUrl: './assets/portraits_cutout/soren.png',
    philosophyPillars: 'Velocity · Optimization · Calculated Risk',
    manifestoQuote:
      'Consensus moves at the speed of yesterday’s crisis. Tomorrow belongs to minds fast enough to model reality before the clock blinks.',
    affinityDomains: [6, 1, 11], // Tech & Eng, Science, Logic & Cryptic
    passportCrestReward: 'GLASS SPIRE VANGUARD · HORIZON COLLECTIVE',
    accentHex: '#56d4f5',
    secondaryHex: '#184b6e',
  },
  AGORA: {
    id: 'AGORA',
    name: 'The Agora Coalition',
    epithet: 'The Open Commons',
    chairName: 'Ambassador Amara Okafor',
    chairTitle: 'Agora Coalition Envoy · Civic Assembly',
    fieldEnvoyLabel: 'Envoy: Nadia Al-Mansoor',
    portraitCutoutUrl: './assets/portraits_cutout/nadia.png',
    philosophyPillars: 'Transparency · Empathy · Living Culture',
    manifestoQuote:
      'Knowledge locked inside an Alpine vault becomes leverage. Shared openly across humanity, it becomes liberation.',
    affinityDomains: [2, 4, 7, 9, 5], // Geography, Pop & Media, Nature, Food & Craft, Sports
    passportCrestReward: 'OPEN COMMONS ENVOY · AGORA COALITION',
    accentHex: '#39d49a',
    secondaryHex: '#15543e',
  },
};

const FACTION_ORDER: readonly FactionId[] = ['SOVEREIGN', 'HORIZON', 'AGORA'];

const REGIONAL_HUBS: ReadonlyArray<{ hub: HubId; city: string; baseLeader: FactionId }> = [
  { hub: 'ch', city: 'Geneva', baseLeader: 'SOVEREIGN' },
  { hub: 'gb', city: 'London', baseLeader: 'SOVEREIGN' },
  { hub: 'jp', city: 'Tokyo', baseLeader: 'HORIZON' },
  { hub: 'br', city: 'Rio', baseLeader: 'AGORA' },
  { hub: 'eg', city: 'Cairo', baseLeader: 'AGORA' },
  { hub: 'is', city: 'Reykjavik', baseLeader: 'HORIZON' },
  { hub: 'sg', city: 'Singapore', baseLeader: 'HORIZON' },
  { hub: 'global', city: 'Apex Forum', baseLeader: 'SOVEREIGN' },
];

/**
 * Generates crisp metallic heraldic SVG data-URI crests for `faction_sovereign`,
 * `faction_horizon`, and `faction_agora` (zero network 404s; honors optional PNG overrides).
 */
export function getFactionCrestDataUri(
  faction: FactionId,
  overrides?: Partial<Record<FactionId, string>>,
): string {
  const custom = overrides?.[faction];
  if (custom) return custom;

  if (faction === 'SOVEREIGN') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
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
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  if (faction === 'HORIZON') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
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
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
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
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface StoredTrialsState {
  trialsElo: number;
  wins: number;
  losses: number;
  salonTrophies: number;
  factionStandings: Record<FactionId, number>;
}

function readTrialsStorage(): StoredTrialsState {
  const dayPulse = Math.floor(Date.now() / 3_600_000) % 240;
  const fallback: StoredTrialsState = {
    trialsElo: 1200,
    wins: 0,
    losses: 0,
    salonTrophies: 0,
    factionStandings: {
      SOVEREIGN: 14820 + dayPulse * 3,
      HORIZON: 14690 + dayPulse * 4,
      AGORA: 14760 + dayPulse * 3,
    },
  };
  try {
    if (typeof localStorage === 'undefined') return fallback;
    const raw = localStorage.getItem(TRIALS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<StoredTrialsState> | null;
    if (!parsed || typeof parsed !== 'object') return fallback;
    return {
      trialsElo: Math.max(700, Math.round(Number(parsed.trialsElo) || 1200)),
      wins: Math.max(0, Math.floor(Number(parsed.wins) || 0)),
      losses: Math.max(0, Math.floor(Number(parsed.losses) || 0)),
      salonTrophies: Math.max(0, Math.floor(Number(parsed.salonTrophies) || 0)),
      factionStandings: {
        SOVEREIGN: Math.max(
          14000,
          Math.floor(Number(parsed.factionStandings?.SOVEREIGN) || fallback.factionStandings.SOVEREIGN),
        ),
        HORIZON: Math.max(
          14000,
          Math.floor(Number(parsed.factionStandings?.HORIZON) || fallback.factionStandings.HORIZON),
        ),
        AGORA: Math.max(
          14000,
          Math.floor(Number(parsed.factionStandings?.AGORA) || fallback.factionStandings.AGORA),
        ),
      },
    };
  } catch {
    return fallback;
  }
}

export class FactionLeagueView {
  private readonly deps: FactionLeagueDependencies;
  private modalBackdrop: HTMLElement | null = null;
  private mountedContainer: HTMLElement | null = null;
  private detachEscape: (() => void) | null = null;
  private callbacks: FactionLeagueCallbacks = {};
  private justPledgedToast: FactionId | null = null;

  constructor(deps: FactionLeagueDependencies) {
    this.deps = deps;
    ensureMetaStylesInjected();
  }

  public isOpen(): boolean {
    return this.modalBackdrop !== null || this.mountedContainer !== null;
  }

  public open(callbacks: FactionLeagueCallbacks = {}): void {
    this.close();
    this.callbacks = callbacks;
    this.justPledgedToast = null;

    const backdrop = document.createElement('div');
    backdrop.className = 'ws-meta-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'World Council Factions & Seasonal League');
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) {
        this.handleClose();
      }
    });

    document.body.appendChild(backdrop);
    this.modalBackdrop = backdrop;
    this.detachEscape = attachMetaEscapeHandler(() => this.handleBackOrClose());
    this.renderInto(backdrop, true);
  }

  private handleBackOrClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    if (this.callbacks.canGoBack && this.callbacks.onBack) {
      this.callbacks.onBack();
      return;
    }
    const onClose = this.callbacks.onClose;
    this.close();
    onClose?.();
  }

  private handleClose(): void {
    this.deps.haptics?.uiTap();
    this.deps.audio?.playSfx('ui_tap');
    const onClose = this.callbacks.onClose;
    this.close();
    onClose?.();
  }

  public mount(container: HTMLElement, callbacks: FactionLeagueCallbacks = {}): void {
    this.unmount();
    this.callbacks = callbacks;
    this.mountedContainer = container;
    this.renderInto(container, false);
  }

  public unmount(): void {
    if (this.detachEscape) {
      this.detachEscape();
      this.detachEscape = null;
    }
    if (this.mountedContainer) {
      this.mountedContainer.innerHTML = '';
      this.mountedContainer = null;
    }
  }

  public close(): void {
    this.unmount();
    if (this.modalBackdrop) {
      this.modalBackdrop.remove();
      this.modalBackdrop = null;
    }
  }

  private computePsychometricFit(): Record<FactionId, number> {
    const skillVec = forgeEngine.getSkillVector();
    const pSnap = this.deps.passport.getSnapshot();
    const bSnap = this.deps.blackboard.getSnapshot();

    const calcAvgMastery = (domains: readonly DomainId[]): number => {
      let sum = 0;
      for (const d of domains) {
        const elo = skillVec[d]?.elo ?? pSnap.domainElo[d] ?? 1200;
        sum += ((elo - 800) / 1400) * 100;
      }
      return sum / Math.max(1, domains.length);
    };

    const sovRaw = calcAvgMastery(WORLD_COUNCIL_FACTIONS.SOVEREIGN.affinityDomains) + bSnap.councilFavor * 0.25;
    const hrzRaw =
      calcAvgMastery(WORLD_COUNCIL_FACTIONS.HORIZON.affinityDomains) +
      Math.max(0, 50 - bSnap.axisIntegrity * 0.2) * 0.25;
    const agrRaw =
      calcAvgMastery(WORLD_COUNCIL_FACTIONS.AGORA.affinityDomains) +
      (bSnap.publicTrust * 0.2 + Math.max(0, bSnap.axisIntegrity) * 0.12);

    return {
      SOVEREIGN: Math.min(99, Math.max(48, Math.round(52 + sovRaw * 0.55))),
      HORIZON: Math.min(99, Math.max(48, Math.round(52 + hrzRaw * 0.55))),
      AGORA: Math.min(99, Math.max(48, Math.round(52 + agrRaw * 0.55))),
    };
  }

  public buildCupStandings(): {
    standings: FactionCupStandingEntry[];
    trialsElo: number;
    wins: number;
    losses: number;
    salonTrophies: number;
    pledgedFaction: FactionId | null;
  } {
    const hubOverview = this.deps.trialsMode?.getHubOverview();
    const stored = readTrialsStorage();

    const rawPoints = hubOverview?.factionStandings ?? stored.factionStandings;
    const pledgedFaction =
      hubOverview?.pledgedFaction ?? this.deps.blackboard.getSnapshot().pledgedFaction;
    const fits = this.computePsychometricFit();

    const totalPts = Math.max(
      1,
      rawPoints.SOVEREIGN + rawPoints.HORIZON + rawPoints.AGORA,
    );

    const sortedIds = [...FACTION_ORDER].sort((a, b) => rawPoints[b] - rawPoints[a]);
    const standings: FactionCupStandingEntry[] = sortedIds.map((fid, idx) => ({
      faction: WORLD_COUNCIL_FACTIONS[fid],
      rank: (idx + 1) as 1 | 2 | 3,
      cupPoints: rawPoints[fid],
      sharePct: Number(((rawPoints[fid] / totalPts) * 100).toFixed(1)),
      psychometricFitPct: fits[fid],
      isPledged: pledgedFaction === fid,
    }));

    return {
      standings,
      trialsElo: hubOverview?.trialsElo ?? stored.trialsElo,
      wins: hubOverview?.wins ?? stored.wins,
      losses: hubOverview?.losses ?? stored.losses,
      salonTrophies: hubOverview?.salonTrophies ?? stored.salonTrophies,
      pledgedFaction,
    };
  }

  private rerender(): void {
    if (this.modalBackdrop) {
      this.renderInto(this.modalBackdrop, true);
    } else if (this.mountedContainer) {
      this.renderInto(this.mountedContainer, false);
    }
  }

  private renderInto(host: HTMLElement, isModal: boolean): void {
    const challengerName = this.deps.passport.getChallengerName();
    const pSnap = this.deps.passport.getSnapshot();
    const { standings, trialsElo, wins, salonTrophies, pledgedFaction } =
      this.buildCupStandings();

    const personalRankLabel =
      wins >= 12
        ? 'HIGH LEGATE'
        : wins >= 6
          ? 'COUNCILOR'
          : wins >= 2
            ? 'ATTACHÉ'
            : 'DIPLOMATIC ENVOY';

    const vaultJumperHtml = renderVaultJumperHtml('FACTIONS', {
      isModal,
      closeBtnId: 'ws-factions-close',
      canNavigate: Boolean(this.callbacks.onNavigateSection),
    });

    host.innerHTML = `
      <div class="ws-meta-shell">
        <div class="ws-meta-topbar">
          <div class="ws-meta-topbar-left">
            <button type="button" class="ws-meta-back-btn" id="ws-factions-back" data-meta-back="true" aria-label="Back">← Back</button>
            <div class="ws-meta-topbar-titles">
              <h2 class="ws-meta-title">COUNCIL BLOCS</h2>
              <div class="ws-meta-eyebrow">${escapeMetaHtml(challengerName)} · ${personalRankLabel} · ELO ${trialsElo}</div>
            </div>
          </div>
          <div class="ws-meta-topbar-right">
            ${vaultJumperHtml}
          </div>
        </div>

        <div class="ws-meta-body-scroll">
          ${
            this.justPledgedToast
              ? `
                <div class="ws-meta-section" style="padding-top:0;">
                  <div class="ws-meta-note" style="box-shadow:inset 3px 0 0 ${WORLD_COUNCIL_FACTIONS[this.justPledgedToast].accentHex};color:var(--ivory-primary);">
                    ✒ <strong>Allegiance Stamped:</strong> ${escapeMetaHtml(challengerName)} now represents
                    <strong style="color:${WORLD_COUNCIL_FACTIONS[this.justPledgedToast].accentHex};">${escapeMetaHtml(WORLD_COUNCIL_FACTIONS[this.justPledgedToast].name)}</strong>
                    in World Council Trials.
                  </div>
                </div>
              `
              : ''
          }

          <!-- Season 1 World Council Cup Standings (Frameless Hairline Section) -->
          <div class="ws-meta-section" style="${this.justPledgedToast ? '' : 'padding-top:0;'}">
            <div style="display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px;">
              <h3 class="ws-meta-section-title">Season 1 Mandate Cup Standings</h3>
              <span style="font-family:var(--font-mono);font-size:10px;color:var(--ivory-dim);">
                +150 Ghost Win · +250 Black Salon${salonTrophies > 0 ? ` · ${salonTrophies} Crown` : ''}
              </span>
            </div>

            <div style="display:flex;flex-direction:column;gap:9px;">
              ${standings
                .map(
                  (st) => `
                    <div style="display:flex;flex-direction:column;gap:4px;">
                      <div style="display:flex;justify-content:space-between;gap:8px;font-family:var(--font-mono);font-size:11.5px;">
                        <span style="color:${st.faction.accentHex};font-weight:700;">
                          #${st.rank} ${escapeMetaHtml(st.faction.name)}${st.isPledged ? ' · ★ Pledged' : ''}
                        </span>
                        <span style="color:var(--ivory-primary);font-weight:700;flex-shrink:0;">
                          ${st.cupPoints.toLocaleString('en-US')} <span style="color:var(--ivory-dim);font-weight:500;">(${st.sharePct}%)</span>
                        </span>
                      </div>
                      <div class="ws-meta-progress-track" style="height:5px;">
                        <div class="ws-meta-progress-fill" style="width:${Math.min(100, Math.max(12, st.sharePct * 2.4)).toFixed(1)}%;background:${st.faction.accentHex};"></div>
                      </div>
                    </div>
                  `,
                )
                .join('')}
            </div>

            <!-- Horizontal Scrollable 8-Hub Regional Control Strip -->
            <div class="ws-meta-hscroll" style="padding-top:4px;" aria-label="Regional Hub Control">
              ${REGIONAL_HUBS.map((rh) => {
                const controller =
                  pSnap.visas[rh.hub]?.cleared && pledgedFaction ? pledgedFaction : rh.baseLeader;
                const fSpec = WORLD_COUNCIL_FACTIONS[controller];
                return `
                  <span style="flex:0 0 auto;font-family:var(--font-mono);font-size:10px;color:var(--ivory-muted);padding:4px 9px;border-radius:999px;background:rgba(255,255,255,0.04);">
                    ${escapeMetaHtml(rh.city)} · <strong style="color:${fSpec.accentHex};">${escapeMetaHtml(controller)}</strong>
                  </span>
                `;
              }).join('')}
            </div>
          </div>

          <!-- 3 World Council Bloc Allegiance Panels (Frameless Top-Hairline Editorial Columns) -->
          <div class="ws-meta-section">
            <h3 class="ws-meta-section-title">Council Blocs &amp; Allegiance</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(265px,1fr));gap:18px 22px;align-items:stretch;">
              ${FACTION_ORDER.map((fid) => {
                const spec = WORLD_COUNCIL_FACTIONS[fid];
                const st = standings.find((s) => s.faction.id === fid)!;
                const primaryCrestUrl =
                  this.deps.factionCrestUrls?.[fid] ??
                  `./assets/factions/faction_${fid.toLowerCase()}.png`;
                const fallbackCrestUri = getFactionCrestDataUri(fid);
                const isPledged = pledgedFaction === fid;

                return `
                  <div style="display:flex;flex-direction:column;gap:10px;padding:14px 0 6px;border-top:2px solid ${spec.accentHex};${isPledged ? `background:linear-gradient(180deg, ${spec.accentHex}12 0%, transparent 55%);padding-left:10px;padding-right:10px;` : ''}">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <img
                        src="${escapeMetaHtml(primaryCrestUrl)}"
                        data-fallback-src="${escapeMetaHtml(fallbackCrestUri)}"
                        alt="${escapeMetaHtml(spec.name)} Crest"
                        style="width:50px;height:50px;object-fit:contain;flex-shrink:0;"
                      />
                      <div style="min-width:0;flex:1 1 auto;">
                        <div style="font-family:var(--font-mono);font-size:9.5px;font-weight:700;color:${spec.accentHex};letter-spacing:0.07em;">
                          “${escapeMetaHtml(spec.epithet.toUpperCase())}” · FIT ${st.psychometricFitPct}%
                        </div>
                        <div style="font-family:var(--font-display);font-size:15px;font-weight:800;color:var(--ivory-primary);margin-top:1px;">
                          ${escapeMetaHtml(spec.name)}
                        </div>
                        <div style="font-size:11px;color:var(--ivory-dim);">
                          ${escapeMetaHtml(spec.philosophyPillars)}
                        </div>
                      </div>
                    </div>

                    <!-- Frameless Chair & Cutout Portrait Strip -->
                    <div style="display:flex;align-items:center;gap:9px;padding:4px 0;">
                      <div style="width:38px;height:38px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 35%, ${spec.accentHex}44, #080b11);flex-shrink:0;">
                        <img src="${spec.portraitCutoutUrl}" alt="${escapeMetaHtml(spec.chairName)}" style="width:100%;height:100%;object-fit:cover;object-position:top center;" />
                      </div>
                      <div style="min-width:0;">
                        <div style="font-size:12px;font-weight:700;color:var(--ivory-primary);">
                          ${escapeMetaHtml(spec.chairName)}
                        </div>
                        <div style="font-family:var(--font-mono);font-size:9.5px;color:var(--ivory-muted);">
                          ${escapeMetaHtml(spec.chairTitle)} · ${escapeMetaHtml(spec.fieldEnvoyLabel)}
                        </div>
                      </div>
                    </div>

                    <p style="margin:0;font-size:12px;font-style:italic;color:var(--ivory-muted);line-height:1.42;">
                      “${escapeMetaHtml(sanitizeMetaCopy(spec.manifestoQuote))}”
                    </p>

                    <!-- Inline Affinity Domain Medallions -->
                    <div style="display:flex;flex-wrap:wrap;gap:6px 10px;">
                      ${spec.affinityDomains
                        .map((did) => {
                          const dMeta = SOVEREIGN_DOMAINS[did];
                          return `
                            <span style="display:inline-flex;align-items:center;gap:4px;font-size:10.5px;color:var(--ivory-muted);">
                              <img src="./${escapeMetaHtml(dMeta.medallionUrl)}" alt="" style="width:14px;height:14px;object-fit:contain;" />
                              ${escapeMetaHtml(dMeta.shortName)}
                            </span>
                          `;
                        })
                        .join('')}
                    </div>

                    <div style="margin-top:auto;padding-top:6px;">
                      ${
                        isPledged
                          ? `<button type="button" class="ws-meta-btn" style="width:100%;color:${spec.accentHex};background:rgba(255,255,255,0.04);box-shadow:inset 3px 0 0 ${spec.accentHex};opacity:1;" disabled>
                              ✓ Allegiance Pledged
                            </button>`
                          : `<button type="button" class="ws-meta-btn-gold" data-pledge-faction="${fid}" style="width:100%;">
                              ✒ Pledge to ${escapeMetaHtml(fid)}
                            </button>`
                      }
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Async Kinetic Ghost Contenders & Black Salon Quick-Launch -->
          ${
            this.callbacks.onLaunchGhostDuel || this.callbacks.onLaunchBlackSalon
              ? this.renderGhostContendersStrip(RANKED_GHOST_CONTENDERS)
              : ''
          }
        </div>
      </div>
    `;

    this.bindEvents(host);
  }

  private renderGhostContendersStrip(contenders: readonly GhostContenderCard[]): string {
    return `
      <div class="ws-meta-section" style="border-bottom:none;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px;">
          <div>
            <h3 class="ws-meta-section-title">Ranked 3D Kinetic Ghost Contenders</h3>
            <div style="font-size:11.5px;color:var(--ivory-muted);margin-top:2px;">
              Race recorded 3D Ghosts to earn +150 Cup Points for your pledged bloc.
            </div>
          </div>
          ${
            this.callbacks.onLaunchBlackSalon
              ? `<button type="button" class="ws-meta-inline-link" id="ws-factions-black-salon">◈ Black Salon 16-Player ›</button>`
              : ''
          }
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:0 20px;">
          ${contenders
            .slice(0, 4)
            .map((c) => {
              const fSpec = WORLD_COUNCIL_FACTIONS[c.faction];
              return `
                <button
                  type="button"
                  class="ws-meta-row is-interactive"
                  data-challenge-ghost="${escapeMetaHtml(c.id)}"
                  style="width:100%;text-align:left;"
                >
                  <span style="min-width:0;">
                    <span style="display:block;font-size:12.5px;font-weight:700;color:var(--ivory-primary);line-height:1.25;">
                      ${escapeMetaHtml(c.handle)} <span style="color:var(--ivory-dim);font-weight:500;">(${escapeMetaHtml(c.countryCode)})</span>
                    </span>
                    <span style="display:block;font-family:var(--font-mono);font-size:10px;color:${fSpec.accentHex};">
                      ${escapeMetaHtml(c.faction)} · ELO ${c.elo}
                    </span>
                  </span>
                  <span style="color:var(--gold-bright);font-family:var(--font-mono);font-size:11px;font-weight:700;flex-shrink:0;">⚔ Duel ›</span>
                </button>
              `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  private bindEvents(host: HTMLElement): void {
    host.querySelectorAll<HTMLImageElement>('img[data-fallback-src]').forEach((img) => {
      img.addEventListener(
        'error',
        () => {
          const fb = img.dataset.fallbackSrc;
          if (fb && img.src !== fb) {
            img.src = fb;
          }
        },
        { once: true },
      );
    });

    host.querySelector('#ws-factions-back')?.addEventListener('click', () => {
      this.handleBackOrClose();
    });

    bindVaultJumperEvents(host, {
      closeBtnId: 'ws-factions-close',
      onNavigate: (target) => this.callbacks.onNavigateSection?.(target),
      onClose: () => this.handleClose(),
      onTapFeedback: () => {
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
      },
    });

    host.querySelectorAll<HTMLButtonElement>('[data-pledge-faction]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const faction = btn.dataset.pledgeFaction as FactionId | undefined;
        if (!faction || !(faction in WORLD_COUNCIL_FACTIONS)) return;

        if (this.deps.trialsMode) {
          this.deps.trialsMode.pledgeFaction(faction);
        } else {
          this.deps.blackboard.setPledgedFaction(faction);
        }

        const spec = WORLD_COUNCIL_FACTIONS[faction];
        this.deps.passport.unlockTitleCrest(spec.passportCrestReward, true);
        this.justPledgedToast = faction;

        this.deps.haptics?.passportStamp();
        this.deps.audio?.playSfx('passport_stamp');
        this.deps.audio?.playSfx('gold_resonance');

        this.callbacks.onPledgeFaction?.(faction);
        this.rerender();
      });
    });

    host.querySelectorAll<HTMLButtonElement>('[data-challenge-ghost]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const contenderId = btn.dataset.challengeGhost;
        this.deps.haptics?.uiTap();
        this.deps.audio?.playSfx('ui_tap');
        this.close();
        this.callbacks.onLaunchGhostDuel?.(contenderId);
      });
    });

    host.querySelector('#ws-factions-black-salon')?.addEventListener('click', () => {
      this.deps.haptics?.uiTap();
      this.deps.audio?.playSfx('ui_tap');
      this.close();
      this.callbacks.onLaunchBlackSalon?.();
    });
  }
}
