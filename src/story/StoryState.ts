import type {
  BondLevel,
  EndingId,
  FactionId,
  HeroRelicId,
  IntelFlashBookmark,
  OriginId,
  PerkId,
  PersonaId,
  PrismSkinId,
  StoryStateSnapshot,
} from '../types/game';

export type BondNpcId = 'nadia' | 'teo' | 'lindqvist' | 'soren';
export type Act3BranchId = 'WHISTLEBLOWER' | 'INSIDER';
export type BetrayerId = 'nadia' | 'teo' | 'soren';

const STORAGE_KEY = 'ws_story_v1';
const STANDINGS_STORAGE_KEY = 'ws_trials_standings_v1';
const BOND_LADDER: readonly BondLevel[] = ['NEMESIS', 'RIVAL', 'NEUTRAL', 'ALLIED'];
const MAX_ACTIVE_PERKS = 2;
const MAX_BOOKMARKS = 60;

const BASE_FACTION_STANDINGS: Record<FactionId, number> = {
  SOVEREIGN: 4280,
  HORIZON: 4190,
  AGORA: 4230,
};

const VALID_PERKS: ReadonlySet<string> = new Set<PerkId>([
  'DIPLOMATIC_REDACTION',
  'CLEAN_HANDS',
  'HORIZON_LENS',
  'ANALOG_STATIC_MASTER',
  'DIPLOMAT_COMPOSURE',
  'MAVERICK_GAMBIT',
  'COOP_CROSSCHECK',
  'PEOPLES_LENS',
  'COUNCIL_OVERRIDE',
  'BLUFF_ECHO',
]);

const VALID_RELICS: ReadonlySet<string> = new Set<HeroRelicId>([
  'meridian_astrolabe',
  'armillary_orrery',
  'origami_prism',
  'emerald_sphere',
  'cipher_box',
  'cryo_relay',
  'council_seal',
  'master_ledger',
]);

const VALID_SKINS: ReadonlySet<string> = new Set<PrismSkinId>([
  'OBSIDIAN_BRASS',
  'KYOTO_KINTSUGI',
  'DAMASCUS_TITANIUM',
  'EMERALD_SOVEREIGN',
  'BLACK_SALON_CRIMSON',
]);

const VALID_FACTIONS: ReadonlySet<string> = new Set<FactionId>([
  'SOVEREIGN',
  'HORIZON',
  'AGORA',
]);

const VALID_ENDINGS: ReadonlySet<string> = new Set<EndingId>([
  'SOVEREIGN_ARBITER',
  'OPEN_COMMONS',
  'KINGMAKER',
  'ARCHITECT_SUCCESSION',
]);

const VALID_ORIGINS: ReadonlySet<string> = new Set<OriginId>([
  'ACADEMIC',
  'POLYMATH',
  'STRATEGIST',
]);

const VALID_PERSONAS: ReadonlySet<string> = new Set<PersonaId>([
  'MAVERICK',
  'DIPLOMAT',
  'ANALYST',
  'PRODIGY',
]);

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, Math.round(value)));
}

function isBondLevel(value: unknown): value is BondLevel {
  return typeof value === 'string' && (BOND_LADDER as readonly string[]).includes(value);
}

function createDefaultSnapshot(): StoryStateSnapshot {
  return {
    prologueComplete: false,
    origin: null,
    persona: null,
    axisIntegrity: 0,
    publicTrust: 50,
    councilFavor: 50,
    bonds: {
      nadia: 'RIVAL',
      teo: 'NEUTRAL',
      lindqvist: 'NEUTRAL',
      soren: 'RIVAL',
    },
    flags: {},
    unlockedPerks: [],
    activePerks: [],
    unlockedRelics: [],
    unlockedSkins: ['OBSIDIAN_BRASS'],
    activeSkin: 'OBSIDIAN_BRASS',
    completedCampaignNodes: [],
    currentAct: 0,
    firstFlightChoice: null,
    act3Branch: null,
    betrayer: null,
    achievedEndings: [],
    pledgedFaction: null,
    trialsWins: 0,
    salonTrophies: 0,
    blackSalonUnlocked: false,
    bookmarks: [],
    dailyCompletedDate: null,
    dailyBestScore: 0,
    endlessBestFloor: 0,
    endlessBestScore: 0,
    totalQuestionsAnswered: 0,
    totalCorrect: 0,
    bestStreak: 0,
  };
}

function cloneSnapshot(src: StoryStateSnapshot): StoryStateSnapshot {
  return {
    ...src,
    bonds: { ...src.bonds },
    flags: { ...src.flags },
    unlockedPerks: [...src.unlockedPerks],
    activePerks: [...src.activePerks],
    unlockedRelics: [...src.unlockedRelics],
    unlockedSkins: [...(src.unlockedSkins ?? ['OBSIDIAN_BRASS'])],
    activeSkin: src.activeSkin ?? 'OBSIDIAN_BRASS',
    completedCampaignNodes: [...src.completedCampaignNodes],
    achievedEndings: [...(src.achievedEndings ?? [])],
    bookmarks: src.bookmarks.map((b) => ({ ...b })),
  };
}

export class StoryState {
  private data: StoryStateSnapshot;
  private factionStandings: Record<FactionId, number>;

  constructor() {
    this.data = this.load();
    this.factionStandings = this.loadStandings();
  }

  private load(): StoryStateSnapshot {
    const defaults = createDefaultSnapshot();
    try {
      if (typeof localStorage === 'undefined') {
        return defaults;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<StoryStateSnapshot> | null;
      if (!parsed || typeof parsed !== 'object') return defaults;

      const unlockedPerks = Array.isArray(parsed.unlockedPerks)
        ? Array.from(
            new Set(
              parsed.unlockedPerks.filter(
                (p): p is PerkId => typeof p === 'string' && VALID_PERKS.has(p)
              )
            )
          )
        : [];

      const activePerks = Array.isArray(parsed.activePerks)
        ? Array.from(
            new Set(
              parsed.activePerks.filter(
                (p): p is PerkId =>
                  typeof p === 'string' && VALID_PERKS.has(p) && unlockedPerks.includes(p as PerkId)
              )
            )
          ).slice(0, MAX_ACTIVE_PERKS)
        : [];

      const unlockedRelics = Array.isArray(parsed.unlockedRelics)
        ? Array.from(
            new Set(
              parsed.unlockedRelics.filter(
                (r): r is HeroRelicId => typeof r === 'string' && VALID_RELICS.has(r)
              )
            )
          )
        : [];

      const parsedSkins = Array.isArray(parsed.unlockedSkins)
        ? parsed.unlockedSkins.filter(
            (s): s is PrismSkinId => typeof s === 'string' && VALID_SKINS.has(s)
          )
        : [];
      const unlockedSkins: PrismSkinId[] = Array.from(
        new Set<PrismSkinId>(['OBSIDIAN_BRASS', ...parsedSkins])
      );

      const activeSkin: PrismSkinId =
        typeof parsed.activeSkin === 'string' &&
        VALID_SKINS.has(parsed.activeSkin) &&
        unlockedSkins.includes(parsed.activeSkin as PrismSkinId)
          ? (parsed.activeSkin as PrismSkinId)
          : 'OBSIDIAN_BRASS';

      const completedCampaignNodes = Array.isArray(parsed.completedCampaignNodes)
        ? Array.from(
            new Set(parsed.completedCampaignNodes.filter((n): n is string => typeof n === 'string'))
          )
        : [];

      const achievedEndings = Array.isArray(parsed.achievedEndings)
        ? Array.from(
            new Set(
              parsed.achievedEndings.filter(
                (e): e is EndingId => typeof e === 'string' && VALID_ENDINGS.has(e)
              )
            )
          )
        : [];

      const rawBonds = parsed.bonds && typeof parsed.bonds === 'object' ? parsed.bonds : undefined;
      const bonds: StoryStateSnapshot['bonds'] = {
        nadia: isBondLevel(rawBonds?.nadia) ? rawBonds.nadia : defaults.bonds.nadia,
        teo: isBondLevel(rawBonds?.teo) ? rawBonds.teo : defaults.bonds.teo,
        lindqvist: isBondLevel(rawBonds?.lindqvist) ? rawBonds.lindqvist : defaults.bonds.lindqvist,
        soren: isBondLevel(rawBonds?.soren) ? rawBonds.soren : defaults.bonds.soren,
      };

      const flags: Record<string, boolean | string> = {};
      if (parsed.flags && typeof parsed.flags === 'object') {
        for (const [k, v] of Object.entries(parsed.flags)) {
          if (typeof v === 'boolean' || typeof v === 'string') {
            flags[k] = v;
          }
        }
      }

      const bookmarks: IntelFlashBookmark[] = Array.isArray(parsed.bookmarks)
        ? parsed.bookmarks
            .filter(
              (b): b is IntelFlashBookmark =>
                Boolean(b) &&
                typeof b.qid === 'number' &&
                typeof b.prompt === 'string' &&
                typeof b.answer === 'string' &&
                typeof b.why === 'string'
            )
            .slice(0, MAX_BOOKMARKS)
        : [];

      const rawAct = Number(parsed.currentAct);
      const currentAct: 0 | 1 | 2 | 3 | 4 =
        rawAct === 4
          ? 4
          : rawAct === 3
            ? 3
            : rawAct === 2
              ? 2
              : rawAct === 1
                ? 1
                : 0;

      const firstFlightChoice: 'GB' | 'JP' | null =
        parsed.firstFlightChoice === 'GB' || parsed.firstFlightChoice === 'JP'
          ? parsed.firstFlightChoice
          : null;

      const act3Branch: Act3BranchId | null =
        parsed.act3Branch === 'WHISTLEBLOWER' || parsed.act3Branch === 'INSIDER'
          ? parsed.act3Branch
          : null;

      const betrayer: BetrayerId | null =
        parsed.betrayer === 'nadia' || parsed.betrayer === 'teo' || parsed.betrayer === 'soren'
          ? parsed.betrayer
          : null;

      const pledgedFaction: FactionId | null =
        typeof parsed.pledgedFaction === 'string' && VALID_FACTIONS.has(parsed.pledgedFaction)
          ? (parsed.pledgedFaction as FactionId)
          : null;

      return {
        prologueComplete: Boolean(parsed.prologueComplete),
        origin:
          typeof parsed.origin === 'string' && VALID_ORIGINS.has(parsed.origin)
            ? (parsed.origin as OriginId)
            : null,
        persona:
          typeof parsed.persona === 'string' && VALID_PERSONAS.has(parsed.persona)
            ? (parsed.persona as PersonaId)
            : null,
        axisIntegrity: clamp(parsed.axisIntegrity ?? 0, -100, 100),
        publicTrust: clamp(parsed.publicTrust ?? 50, 0, 100),
        councilFavor: clamp(parsed.councilFavor ?? 50, 0, 100),
        bonds,
        flags,
        unlockedPerks,
        activePerks,
        unlockedRelics,
        unlockedSkins,
        activeSkin,
        completedCampaignNodes,
        currentAct,
        firstFlightChoice,
        act3Branch,
        betrayer,
        achievedEndings,
        pledgedFaction,
        trialsWins: Math.max(0, Math.floor(Number(parsed.trialsWins) || 0)),
        salonTrophies: Math.max(0, Math.floor(Number(parsed.salonTrophies) || 0)),
        blackSalonUnlocked: Boolean(parsed.blackSalonUnlocked),
        bookmarks,
        dailyCompletedDate:
          typeof parsed.dailyCompletedDate === 'string' ? parsed.dailyCompletedDate : null,
        dailyBestScore: Math.max(0, Math.floor(Number(parsed.dailyBestScore) || 0)),
        endlessBestFloor: Math.max(0, Math.floor(Number(parsed.endlessBestFloor) || 0)),
        endlessBestScore: Math.max(0, Math.floor(Number(parsed.endlessBestScore) || 0)),
        totalQuestionsAnswered: Math.max(0, Math.floor(Number(parsed.totalQuestionsAnswered) || 0)),
        totalCorrect: Math.max(0, Math.floor(Number(parsed.totalCorrect) || 0)),
        bestStreak: Math.max(0, Math.floor(Number(parsed.bestStreak) || 0)),
      };
    } catch {
      return defaults;
    }
  }

  private loadStandings(): Record<FactionId, number> {
    const defaults: Record<FactionId, number> = { ...BASE_FACTION_STANDINGS };
    try {
      if (typeof localStorage === 'undefined') return defaults;
      const raw = localStorage.getItem(STANDINGS_STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw) as Partial<Record<FactionId, number>> | null;
      if (!parsed || typeof parsed !== 'object') return defaults;
      return {
        SOVEREIGN: Math.max(BASE_FACTION_STANDINGS.SOVEREIGN, Math.floor(Number(parsed.SOVEREIGN) || BASE_FACTION_STANDINGS.SOVEREIGN)),
        HORIZON: Math.max(BASE_FACTION_STANDINGS.HORIZON, Math.floor(Number(parsed.HORIZON) || BASE_FACTION_STANDINGS.HORIZON)),
        AGORA: Math.max(BASE_FACTION_STANDINGS.AGORA, Math.floor(Number(parsed.AGORA) || BASE_FACTION_STANDINGS.AGORA)),
      };
    } catch {
      return defaults;
    }
  }

  private saveStandings(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STANDINGS_STORAGE_KEY, JSON.stringify(this.factionStandings));
      }
    } catch {
      // Safe fallback when storage is unavailable
    }
  }

  public save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch {
      // Safe fallback when storage is unavailable or quota-limited
    }
  }

  public getSnapshot(): StoryStateSnapshot {
    return cloneSnapshot(this.data);
  }

  public reset(): void {
    this.data = createDefaultSnapshot();
    this.factionStandings = { ...BASE_FACTION_STANDINGS };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STANDINGS_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }

  public adjustIntegrity(delta: number): void {
    this.data.axisIntegrity = clamp(this.data.axisIntegrity + delta, -100, 100);
    this.save();
  }

  public adjustPublicTrust(delta: number): void {
    this.data.publicTrust = clamp(this.data.publicTrust + delta, 0, 100);
    this.save();
  }

  public adjustCouncilFavor(delta: number): void {
    this.data.councilFavor = clamp(this.data.councilFavor + delta, 0, 100);
    this.save();
  }

  public setBond(npc: BondNpcId, level: BondLevel): void {
    this.data.bonds[npc] = level;
    this.save();
  }

  public shiftBond(npc: BondNpcId, deltaSteps: number): BondLevel {
    const current = this.data.bonds[npc];
    const currentIdx = BOND_LADDER.indexOf(current);
    const nextIdx = clamp(
      (currentIdx === -1 ? 2 : currentIdx) + deltaSteps,
      0,
      BOND_LADDER.length - 1
    );
    const nextLevel = BOND_LADDER[nextIdx];
    this.data.bonds[npc] = nextLevel;
    this.save();
    return nextLevel;
  }

  public setFlag(key: string, value: boolean | string): void {
    this.data.flags[key] = value;
    this.save();
  }

  public getFlag(key: string): boolean | string | undefined {
    return this.data.flags[key];
  }

  public setOrigin(origin: OriginId): void {
    this.data.origin = origin;
    this.save();
  }

  public setPersona(persona: PersonaId): void {
    this.data.persona = persona;
    this.save();
  }

  public completePrologue(persona: PersonaId): void {
    this.data.prologueComplete = true;
    this.data.persona = persona;
    if (!this.data.completedCampaignNodes.includes('ch_prologue')) {
      this.data.completedCampaignNodes.push('ch_prologue');
    }
    if (this.data.currentAct < 1) {
      this.data.currentAct = 1;
    }
    this.save();
  }

  public setFirstFlightChoice(country: 'GB' | 'JP'): void {
    if (this.data.firstFlightChoice === null) {
      this.data.firstFlightChoice = country;
      this.save();
    }
  }

  public setAct3Branch(branch: Act3BranchId): void {
    this.data.act3Branch = branch;
    this.save();
  }

  public setBetrayer(betrayer: BetrayerId): void {
    this.data.betrayer = betrayer;
    this.save();
  }

  public recordEnding(ending: EndingId): boolean {
    const endings = this.data.achievedEndings ?? [];
    let newlyAchieved = false;
    if (!endings.includes(ending)) {
      endings.push(ending);
      newlyAchieved = true;
    }
    this.data.achievedEndings = endings;
    this.data.currentAct = 4;
    this.save();
    return newlyAchieved;
  }

  public unlockBlackSalon(): boolean {
    if (this.data.blackSalonUnlocked) return false;
    this.data.blackSalonUnlocked = true;
    this.save();
    return true;
  }

  public unlockPerk(perkId: PerkId, autoEquip = false): boolean {
    let newlyUnlocked = false;
    if (!this.data.unlockedPerks.includes(perkId)) {
      this.data.unlockedPerks.push(perkId);
      newlyUnlocked = true;
    }
    if (autoEquip && !this.data.activePerks.includes(perkId)) {
      if (this.data.activePerks.length < MAX_ACTIVE_PERKS) {
        this.data.activePerks.push(perkId);
      } else {
        // Rotate oldest equipped perk out so newly earned story perks take immediate effect
        this.data.activePerks = [this.data.activePerks[1], perkId];
      }
    }
    this.save();
    return newlyUnlocked;
  }

  public togglePerk(perkId: PerkId): {
    changed: boolean;
    equipped: boolean;
    reason?: string;
  } {
    if (!this.data.unlockedPerks.includes(perkId)) {
      return { changed: false, equipped: false, reason: 'Perk not yet unlocked.' };
    }
    const existingIdx = this.data.activePerks.indexOf(perkId);
    if (existingIdx !== -1) {
      this.data.activePerks.splice(existingIdx, 1);
      this.save();
      return { changed: true, equipped: false };
    }
    if (this.data.activePerks.length >= MAX_ACTIVE_PERKS) {
      return {
        changed: false,
        equipped: false,
        reason: `Max ${MAX_ACTIVE_PERKS} Perks active — unequip one first.`,
      };
    }
    this.data.activePerks.push(perkId);
    this.save();
    return { changed: true, equipped: true };
  }

  public hasActivePerk(perkId: PerkId): boolean {
    return this.data.activePerks.includes(perkId);
  }

  public unlockRelic(relicId: HeroRelicId): boolean {
    if (this.data.unlockedRelics.includes(relicId)) return false;
    this.data.unlockedRelics.push(relicId);
    this.save();
    return true;
  }

  public unlockSkin(skinId: PrismSkinId, autoSelect = false): boolean {
    const skins = this.data.unlockedSkins ?? ['OBSIDIAN_BRASS'];
    let newlyUnlocked = false;
    if (!skins.includes(skinId)) {
      skins.push(skinId);
      newlyUnlocked = true;
    }
    this.data.unlockedSkins = skins;
    if (autoSelect) {
      this.data.activeSkin = skinId;
    }
    this.save();
    return newlyUnlocked;
  }

  public setActiveSkin(skinId: PrismSkinId): boolean {
    const skins = this.data.unlockedSkins ?? ['OBSIDIAN_BRASS'];
    if (!skins.includes(skinId)) return false;
    this.data.activeSkin = skinId;
    this.save();
    return true;
  }

  public isSkinUnlocked(skinId: PrismSkinId): boolean {
    return (this.data.unlockedSkins ?? ['OBSIDIAN_BRASS']).includes(skinId);
  }

  public setPledgedFaction(faction: FactionId): void {
    this.data.pledgedFaction = faction;
    this.save();
  }

  public getFactionStandings(): Record<FactionId, number> {
    return { ...this.factionStandings };
  }

  public addFactionPoints(faction: FactionId, points: number): Record<FactionId, number> {
    const delta = Math.max(0, Math.round(points));
    this.factionStandings[faction] = (this.factionStandings[faction] ?? 0) + delta;
    this.saveStandings();
    return { ...this.factionStandings };
  }

  public recordTrialsWin(factionPoints = 150): void {
    this.data.trialsWins = (this.data.trialsWins ?? 0) + 1;
    if (this.data.pledgedFaction && factionPoints > 0) {
      this.addFactionPoints(this.data.pledgedFaction, factionPoints);
    }
    this.save();
  }

  public recordSalonTrophy(): void {
    this.data.salonTrophies = (this.data.salonTrophies ?? 0) + 1;
    this.save();
  }

  public completeCampaignNode(nodeId: string): boolean {
    let newlyCompleted = false;
    if (!this.data.completedCampaignNodes.includes(nodeId)) {
      this.data.completedCampaignNodes.push(nodeId);
      newlyCompleted = true;
    }

    const done = this.data.completedCampaignNodes;
    let computedAct: 0 | 1 | 2 | 3 | 4 = this.data.currentAct;
    if (this.data.prologueComplete && computedAct < 1) {
      computedAct = 1;
    }
    if (done.includes('gb_london') && done.includes('jp_tokyo') && computedAct < 2) {
      computedAct = 2;
    }
    if (done.includes('br_rio') && done.includes('eg_cairo') && computedAct < 3) {
      computedAct = 3;
    }
    if ((done.includes('sg_singapore') || done.includes('global_apex')) && computedAct < 4) {
      computedAct = 4;
    }
    this.data.currentAct = computedAct;
    this.save();
    return newlyCompleted;
  }

  public isNodeCompleted(nodeId: string): boolean {
    return this.data.completedCampaignNodes.includes(nodeId);
  }

  public toggleBookmark(entry: IntelFlashBookmark): boolean {
    const idx = this.data.bookmarks.findIndex((b) => b.qid === entry.qid);
    if (idx !== -1) {
      this.data.bookmarks.splice(idx, 1);
      this.save();
      return false;
    }
    this.data.bookmarks.push(entry);
    if (this.data.bookmarks.length > MAX_BOOKMARKS) {
      this.data.bookmarks.splice(0, this.data.bookmarks.length - MAX_BOOKMARKS);
    }
    this.save();
    return true;
  }

  public isBookmarked(qid: number): boolean {
    return this.data.bookmarks.some((b) => b.qid === qid);
  }

  public recordDailyResult(dateStr: string, score: number): void {
    this.data.dailyCompletedDate = dateStr;
    if (score > this.data.dailyBestScore) {
      this.data.dailyBestScore = Math.floor(score);
    }
    this.save();
  }

  public recordEndlessResult(floor: number, score: number): void {
    if (floor > this.data.endlessBestFloor) {
      this.data.endlessBestFloor = Math.floor(floor);
    }
    if (score > this.data.endlessBestScore) {
      this.data.endlessBestScore = Math.floor(score);
    }
    this.save();
  }

  public recordAnswerStats(correct: boolean, streakAfter: number): void {
    this.data.totalQuestionsAnswered += 1;
    if (correct) {
      this.data.totalCorrect += 1;
    }
    if (streakAfter > this.data.bestStreak) {
      this.data.bestStreak = streakAfter;
    }
    this.save();
  }
}
