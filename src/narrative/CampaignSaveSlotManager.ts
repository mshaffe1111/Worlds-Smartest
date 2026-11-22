// ============================================================================
// WORLD'S SMARTEST — 5-Slot Campaign Save Manager (`#171`)
// Persists 5 independent Campaign Dossier Slots (`ws_campaign_slot_1..5` +
// `ws_active_campaign_slot`), auto-migrates existing single-slot saves on boot,
// and supports 1-click Switch/New, Export `.ws-save.json`, Import, Reset & Delete!
// ============================================================================

import type {
  CampaignCircuitDirector,
  FailedMissionAttemptInfo,
} from './CampaignCircuitDirector';
import type { InkBlackboard, InkBlackboardSnapshot } from './InkBlackboard';
import {
  PERSONA_DEFINITIONS,
  type HubId,
  type OriginId,
  type PassportStateSnapshot,
  type PassportSystem,
  type PersonaId,
} from './PassportSystem';
import type { PrologueDirector } from './PrologueDirector';
import type { Wave2NarrativeDirector } from './Wave2NarrativeDirector';

export type CampaignSlotId = 1 | 2 | 3 | 4 | 5;

export const ALL_CAMPAIGN_SLOT_IDS: readonly CampaignSlotId[] = [1, 2, 3, 4, 5];

const ACTIVE_SLOT_STORAGE_KEY = 'ws_active_campaign_slot';
const SLOT_KEY_PREFIX = 'ws_campaign_slot_';
const SAVE_ENVELOPE_FORMAT = 'WORLDS_SMARTEST_CAMPAIGN_SAVE';
const SAVE_SCHEMA_VERSION = 1;

const HUB_CITY_LABELS: Record<HubId, { actLabel: string; city: string }> = {
  ch: { actLabel: 'ACT 0', city: 'Geneva' },
  gb: { actLabel: 'ACT I', city: 'London' },
  jp: { actLabel: 'ACT I', city: 'Tokyo' },
  br: { actLabel: 'ACT II', city: 'Rio de Janeiro' },
  eg: { actLabel: 'ACT II', city: 'Cairo' },
  is: { actLabel: 'ACT III', city: 'Reykjavik' },
  sg: { actLabel: 'ACT III', city: 'Singapore' },
  global: { actLabel: 'ACT IV', city: 'Apex Forum' },
};

export interface CampaignSlotMeta {
  slotId: CampaignSlotId;
  isEmpty: boolean;
  isActive: boolean;
  challengerName: string;
  hasCustomName: boolean;
  origin: OriginId | null;
  persona: PersonaId | null;
  personaTitle: string | null;
  currentMissionId: string;
  currentActLabel: string;
  currentCity: string;
  completedMissionsCount: number;
  totalMissionsCount: number;
  completionPct: number;
  completionLabel: string; // e.g. "12 / 96 Missions (13%)"
  estimatedTotalHours: number;
  estimatedRemainingHours: number;
  estimatedRemainingLabel: string; // e.g. "~18.8 hrs remaining"
  failedAttemptsCount: number;
  visasCount: number;
  maxVisas: 8;
  visasLabel: string; // e.g. "3/8"
  relicsCount: number;
  maxRelics: 8;
  relicsLabel: string; // e.g. "2/8"
  accuracyPct: number;
  newCircuitPlusCount: number;
  updatedAtIso: string | null;
}

export interface CampaignSlotPayload {
  passport: PassportStateSnapshot;
  blackboard: InkBlackboardSnapshot;
  failedMissionAttempts: Record<string, FailedMissionAttemptInfo>;
  wave2Runtime?: { recentCalloutIds: string[] };
  prologueRuntime?: Record<string, unknown>;
}

export interface StoredCampaignSlotRecord {
  slotId: CampaignSlotId;
  schemaVersion: number;
  updatedAtIso: string;
  meta: Omit<CampaignSlotMeta, 'isActive'>;
  payload: CampaignSlotPayload;
}

export interface CampaignSaveFileEnvelope {
  format: typeof SAVE_ENVELOPE_FORMAT;
  schemaVersion: number;
  exportedAtIso: string;
  sourceSlotId: CampaignSlotId;
  meta: Omit<CampaignSlotMeta, 'isActive'>;
  payload: CampaignSlotPayload;
}

export interface CampaignSaveSlotManagerDeps {
  passport: PassportSystem;
  blackboard: InkBlackboard;
  campaign: CampaignCircuitDirector;
  wave2?: Wave2NarrativeDirector;
  prologue?: PrologueDirector;
}

function isValidSlotId(v: unknown): v is CampaignSlotId {
  return v === 1 || v === 2 || v === 3 || v === 4 || v === 5;
}

function slotStorageKey(slotId: CampaignSlotId): string {
  return `${SLOT_KEY_PREFIX}${slotId}`;
}

function inferHubFromMissionId(missionId: string): HubId {
  const prefix = (missionId || 'ch_1').split('_')[0] as HubId;
  return prefix in HUB_CITY_LABELS ? prefix : 'ch';
}

function slugifyChallengerName(name: string): string {
  const slug = (name || 'challenger')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24);
  return slug || 'challenger';
}

function createEmptySlotMeta(
  slotId: CampaignSlotId,
  isActive: boolean,
  totalMissionsCount = 96,
  estimatedTotalHours = 21.5
): CampaignSlotMeta {
  return {
    slotId,
    isEmpty: true,
    isActive,
    challengerName: 'Empty Dossier',
    hasCustomName: false,
    origin: null,
    persona: null,
    personaTitle: null,
    currentMissionId: 'ch_1',
    currentActLabel: 'ACT 0',
    currentCity: 'Geneva',
    completedMissionsCount: 0,
    totalMissionsCount,
    completionPct: 0,
    completionLabel: `0 / ${totalMissionsCount} Missions (0%)`,
    estimatedTotalHours,
    estimatedRemainingHours: estimatedTotalHours,
    estimatedRemainingLabel: `~${estimatedTotalHours.toFixed(1)} hrs remaining`,
    failedAttemptsCount: 0,
    visasCount: 0,
    maxVisas: 8,
    visasLabel: '0/8',
    relicsCount: 0,
    maxRelics: 8,
    relicsLabel: '0/8',
    accuracyPct: 0,
    newCircuitPlusCount: 0,
    updatedAtIso: null,
  };
}

export class CampaignSaveSlotManager {
  private readonly passport: PassportSystem;
  private readonly blackboard: InkBlackboard;
  private readonly campaign: CampaignCircuitDirector;
  private wave2?: Wave2NarrativeDirector;
  private prologue?: PrologueDirector;

  // In-memory fallback map so Node / headless tests without `--localstorage-file` work identically!
  private readonly memorySlots = new Map<CampaignSlotId, string>();
  private activeSlotId: CampaignSlotId = 1;
  private isSuspendingAutoSave = false;
  private readonly unsubscribers: Array<() => void> = [];
  private readonly listeners = new Set<(slots: CampaignSlotMeta[]) => void>();

  constructor(
    depsOrPassport: CampaignSaveSlotManagerDeps | PassportSystem,
    blackboard?: InkBlackboard,
    campaign?: CampaignCircuitDirector,
    wave2?: Wave2NarrativeDirector,
    prologue?: PrologueDirector
  ) {
    if ('passport' in depsOrPassport && 'blackboard' in depsOrPassport) {
      this.passport = depsOrPassport.passport;
      this.blackboard = depsOrPassport.blackboard;
      this.campaign = depsOrPassport.campaign;
      this.wave2 = depsOrPassport.wave2;
      this.prologue = depsOrPassport.prologue;
    } else {
      this.passport = depsOrPassport;
      this.blackboard = blackboard!;
      this.campaign = campaign!;
      this.wave2 = wave2;
      this.prologue = prologue;
    }

    this.campaign.attachDirectors({
      prologue: this.prologue,
      wave2: this.wave2,
    });

    this.activeSlotId = this.readPersistedActiveSlotId();
    this.autoMigrateSingleSlotSaveIfNeeded();

    // Auto-persist any live Passport or Blackboard mutation (bookmarks, flight fork, ELO, streaks, perks)
    // into the active slot so cold-boot hydration NEVER wipes recent player progress (#284)!
    const syncActiveSlotOnMutation = (): void => {
      if (this.isSuspendingAutoSave) return;
      if (this.readSlotRecord(this.activeSlotId) !== null || this.hasLiveSingleSlotProgress()) {
        this.saveSlotInternal(this.activeSlotId);
      }
    };
    this.unsubscribers.push(
      this.passport.subscribe(syncActiveSlotOnMutation),
      this.blackboard.subscribe(syncActiveSlotOnMutation)
    );
  }

  public dispose(): void {
    while (this.unsubscribers.length > 0) {
      this.unsubscribers.pop()?.();
    }
  }

  private withAutoSaveSuspended<T>(fn: () => T): T {
    const prev = this.isSuspendingAutoSave;
    this.isSuspendingAutoSave = true;
    try {
      return fn();
    } finally {
      this.isSuspendingAutoSave = prev;
    }
  }

  public attachOptionalDirectors(deps: {
    wave2?: Wave2NarrativeDirector;
    prologue?: PrologueDirector;
  }): void {
    if (deps.wave2) this.wave2 = deps.wave2;
    if (deps.prologue) this.prologue = deps.prologue;
    this.campaign.attachDirectors(deps);
  }

  public subscribe(listener: (slots: CampaignSlotMeta[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    if (this.listeners.size === 0) return;
    const list = this.listSlots();
    for (const ln of this.listeners) {
      ln(list);
    }
  }

  private readRawStorage(key: string): string | null {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // Fall back to memory map
    }
    return null;
  }

  private writeRawStorage(key: string, value: string): void {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage quota issues
    }
  }

  private removeRawStorage(key: string): void {
    try {
      if (typeof localStorage !== 'undefined' && typeof localStorage.removeItem === 'function') {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage errors
    }
  }

  private readSlotRecord(slotId: CampaignSlotId): StoredCampaignSlotRecord | null {
    const raw = this.readRawStorage(slotStorageKey(slotId)) ?? this.memorySlots.get(slotId) ?? null;
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StoredCampaignSlotRecord | null;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.payload ||
        typeof parsed.payload !== 'object'
      ) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private writeSlotRecord(slotId: CampaignSlotId, record: StoredCampaignSlotRecord): void {
    const json = JSON.stringify(record);
    this.memorySlots.set(slotId, json);
    this.writeRawStorage(slotStorageKey(slotId), json);
  }

  private clearSlotRecord(slotId: CampaignSlotId): void {
    this.memorySlots.delete(slotId);
    this.removeRawStorage(slotStorageKey(slotId));
  }

  private readPersistedActiveSlotId(): CampaignSlotId {
    const raw = this.readRawStorage(ACTIVE_SLOT_STORAGE_KEY);
    const num = Number(raw);
    return isValidSlotId(num) ? num : 1;
  }

  private persistActiveSlotId(slotId: CampaignSlotId): void {
    this.activeSlotId = slotId;
    this.writeRawStorage(ACTIVE_SLOT_STORAGE_KEY, String(slotId));
  }

  private hasLiveSingleSlotProgress(): boolean {
    const pp = this.passport.getSnapshot();
    const bb = this.blackboard.getSnapshot();
    const fails = this.campaign.getFailedMissionAttemptsSnapshot();
    return (
      pp.hasCustomName ||
      pp.stampedAtIso !== null ||
      pp.unlockedRelics.length > 0 ||
      bb.prologueComplete ||
      bb.completedMissions.length > 0 ||
      Object.keys(bb.branchFlags).length > 0 ||
      Object.keys(fails).length > 0
    );
  }

  /**
   * Auto-migrates any existing pre-multi-slot Campaign progress into `Slot 1` on first boot (`#171`)!
   */
  private autoMigrateSingleSlotSaveIfNeeded(): void {
    const anyExistingSlot = ALL_CAMPAIGN_SLOT_IDS.some(
      (id) => this.readSlotRecord(id) !== null
    );
    if (!anyExistingSlot && this.hasLiveSingleSlotProgress()) {
      this.persistActiveSlotId(1);
      this.saveSlotInternal(1);
      return;
    }

    // If the active slot already has saved data, ensure live directors reflect it
    const activeRecord = this.readSlotRecord(this.activeSlotId);
    if (activeRecord) {
      this.applyPayloadToRuntime(activeRecord.payload);
    }
  }

  private computeMetaFromPayload(
    slotId: CampaignSlotId,
    payload: CampaignSlotPayload,
    updatedAtIso: string
  ): Omit<CampaignSlotMeta, 'isActive'> {
    const pp = payload.passport;
    const bb = payload.blackboard;
    const fails = payload.failedMissionAttempts ?? {};
    const hubId = inferHubFromMissionId(bb.currentMissionId);
    const hubInfo = HUB_CITY_LABELS[hubId] ?? HUB_CITY_LABELS.ch;

    const visasCount = Math.min(
      8,
      Math.max(
        0,
        pp.visas ? Object.values(pp.visas).filter((v) => Boolean(v?.cleared)).length : 0
      )
    );
    const relicsCount = Math.min(
      8,
      Math.max(
        0,
        Array.isArray(pp.unlockedRelics)
          ? new Set(pp.unlockedRelics.filter((r) => typeof r === 'string')).size
          : 0
      )
    );
    const persona = pp.persona ?? bb.persona ?? null;
    const personaTitle = persona ? PERSONA_DEFINITIONS[persona]?.title ?? null : null;

    const completedMissionsCount = Array.isArray(bb.completedMissions)
      ? new Set(bb.completedMissions.filter((m) => typeof m === 'string')).size
      : 0;
    const overview = this.campaign.getCampaignOverview();
    const totalMissionsCount = Math.max(1, overview.totalMissionsCount || 96);
    const estimatedTotalHours = Math.max(4, overview.estimatedTotalHours || 21.5);
    const completionPct = Math.min(
      100,
      Math.round((completedMissionsCount / totalMissionsCount) * 100)
    );
    const estimatedRemainingHours = Math.max(
      0,
      Number((estimatedTotalHours * (1 - completedMissionsCount / totalMissionsCount)).toFixed(1))
    );

    return {
      slotId,
      isEmpty: false,
      challengerName: pp.challengerName || 'Challenger',
      hasCustomName: Boolean(pp.hasCustomName),
      origin: pp.origin ?? bb.origin ?? null,
      persona,
      personaTitle,
      currentMissionId: bb.currentMissionId || 'ch_1',
      currentActLabel: hubInfo.actLabel,
      currentCity: hubInfo.city,
      completedMissionsCount,
      totalMissionsCount,
      completionPct,
      completionLabel: `${completedMissionsCount} / ${totalMissionsCount} Missions (${completionPct}%)`,
      estimatedTotalHours,
      estimatedRemainingHours,
      estimatedRemainingLabel:
        estimatedRemainingHours <= 0
          ? 'Circuit Complete'
          : `~${estimatedRemainingHours.toFixed(1)} hrs remaining`,
      failedAttemptsCount: Object.keys(fails).length,
      visasCount,
      maxVisas: 8,
      visasLabel: `${visasCount}/8`,
      relicsCount,
      maxRelics: 8,
      relicsLabel: `${relicsCount}/8`,
      accuracyPct: Math.max(0, Math.min(100, Math.round(Number(pp.accuracyPct) || 0))),
      newCircuitPlusCount: Math.max(0, Math.floor(Number(bb.newCircuitPlusCount) || 0)),
      updatedAtIso,
    };
  }

  private captureRuntimePayload(): CampaignSlotPayload {
    return {
      passport: this.passport.getSnapshot(),
      blackboard: this.blackboard.getSnapshot(),
      failedMissionAttempts: this.campaign.getFailedMissionAttemptsSnapshot(),
      wave2Runtime: this.wave2?.getRuntimeStateSnapshot(),
      prologueRuntime: this.prologue?.getInternalStateSnapshot(),
    };
  }

  private applyPayloadToRuntime(payload: CampaignSlotPayload): void {
    this.withAutoSaveSuspended(() => {
      this.passport.hydrateSnapshot(payload.passport);
      this.blackboard.hydrateSnapshot(payload.blackboard);
      this.campaign.hydrateFailedMissionAttempts(payload.failedMissionAttempts);
      this.wave2?.hydrateRuntimeState(payload.wave2Runtime);
      this.prologue?.hydrateInternalState(payload.prologueRuntime ?? null);
    });
  }

  private saveSlotInternal(slotId: CampaignSlotId): CampaignSlotMeta {
    const nowIso = new Date().toISOString();
    const payload = this.captureRuntimePayload();
    const metaNoActive = this.computeMetaFromPayload(slotId, payload, nowIso);
    const record: StoredCampaignSlotRecord = {
      slotId,
      schemaVersion: SAVE_SCHEMA_VERSION,
      updatedAtIso: nowIso,
      meta: metaNoActive,
      payload,
    };
    this.writeSlotRecord(slotId, record);
    this.notifyListeners();
    return {
      ...metaNoActive,
      isActive: slotId === this.activeSlotId,
    };
  }

  public getActiveSlotId(): CampaignSlotId {
    return this.activeSlotId;
  }

  /**
   * Lists all 5 Campaign Save Slots (`1..5`), populated or empty!
   */
  public listSlots(): CampaignSlotMeta[] {
    const overview = this.campaign.getCampaignOverview();
    return ALL_CAMPAIGN_SLOT_IDS.map((slotId) => {
      const rec = this.readSlotRecord(slotId);
      const isActive = slotId === this.activeSlotId;
      if (!rec) {
        return createEmptySlotMeta(
          slotId,
          isActive,
          overview.totalMissionsCount,
          overview.estimatedTotalHours
        );
      }
      const freshMeta = this.computeMetaFromPayload(slotId, rec.payload, rec.updatedAtIso);
      return {
        ...freshMeta,
        isActive,
      };
    });
  }

  /**
   * Auto-saves the currently active Campaign Slot (safe to call after every mission, choice, or stamp!).
   */
  public saveActiveSlot(): void {
    this.saveSlotInternal(this.activeSlotId);
  }

  /**
   * Switches to an existing populated slot, OR starts a fresh Act 0 Campaign in an empty slot!
   */
  public switchOrStartSlot(slotId: CampaignSlotId): {
    isFreshStart: boolean;
    meta: CampaignSlotMeta;
  } {
    const safeSlot: CampaignSlotId = isValidSlotId(slotId) ? slotId : 1;

    // Persist current active slot first if it already had a record or progress
    if (
      safeSlot !== this.activeSlotId &&
      (this.readSlotRecord(this.activeSlotId) !== null || this.hasLiveSingleSlotProgress())
    ) {
      this.saveSlotInternal(this.activeSlotId);
    }

    this.persistActiveSlotId(safeSlot);
    const targetRecord = this.readSlotRecord(safeSlot);
    if (targetRecord) {
      this.applyPayloadToRuntime(targetRecord.payload);
      const meta: CampaignSlotMeta = {
        ...this.computeMetaFromPayload(
          safeSlot,
          targetRecord.payload,
          targetRecord.updatedAtIso
        ),
        isActive: true,
      };
      this.notifyListeners();
      return { isFreshStart: false, meta };
    }

    // Empty slot -> start a fresh unstarted Campaign (resetting Challenger Name too so new player can enter theirs!)
    this.withAutoSaveSuspended(() => {
      this.campaign.restartCampaignFromBeginning({
        keepChallengerName: false,
        prologue: this.prologue,
        wave2: this.wave2,
      });
    });
    this.notifyListeners();
    return {
      isFreshStart: true,
      meta: createEmptySlotMeta(safeSlot, true),
    };
  }

  /**
   * Exports `slotId` as a versioned `.ws-save.json` file download (`worlds-smartest-slot-${slotId}-${slugName}-${date}.ws-save.json`)
   * and returns the serialized JSON string!
   */
  public exportSlotToFile(slotId: CampaignSlotId): string {
    const safeSlot: CampaignSlotId = isValidSlotId(slotId) ? slotId : this.activeSlotId;
    if (safeSlot === this.activeSlotId && this.hasLiveSingleSlotProgress()) {
      this.saveSlotInternal(safeSlot);
    }

    const rec = this.readSlotRecord(safeSlot);
    const nowIso = new Date().toISOString();
    const payload = rec ? rec.payload : this.captureRuntimePayload();
    const meta = this.computeMetaFromPayload(safeSlot, payload, rec?.updatedAtIso ?? nowIso);

    const envelope: CampaignSaveFileEnvelope = {
      format: SAVE_ENVELOPE_FORMAT,
      schemaVersion: SAVE_SCHEMA_VERSION,
      exportedAtIso: nowIso,
      sourceSlotId: safeSlot,
      meta,
      payload,
    };

    const json = JSON.stringify(envelope, null, 2);

    if (typeof document !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined') {
      try {
        const slugName = slugifyChallengerName(meta.challengerName);
        const dateStamp = nowIso.slice(0, 10);
        const filename = `worlds-smartest-slot-${safeSlot}-${slugName}-${dateStamp}.ws-save.json`;
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const href = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body?.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(href), 2500);
      } catch {
        // Non-DOM or restricted sandbox environment — caller still receives `json`
      }
    }

    return json;
  }

  /**
   * Validates and imports a `.ws-save.json` file into `slotId` (hydrating live runtime immediately if `slotId === activeSlotId`)!
   */
  public importSlotFromFileJson(
    slotId: CampaignSlotId,
    rawJson: string
  ): { ok: boolean; error?: string; meta?: CampaignSlotMeta } {
    const safeSlot: CampaignSlotId = isValidSlotId(slotId) ? slotId : this.activeSlotId;
    if (typeof rawJson !== 'string' || rawJson.trim().length === 0) {
      return { ok: false, error: 'Save file is empty.' };
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawJson) as Record<string, unknown>;
    } catch {
      return { ok: false, error: 'Invalid JSON format — select a valid .ws-save.json file.' };
    }

    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, error: 'Unrecognized save file structure.' };
    }

    // Accept either versioned `WORLDS_SMARTEST_CAMPAIGN_SAVE` envelope or direct `{ passport, blackboard }` payload
    let candidatePayload: Partial<CampaignSlotPayload> | null = null;
    if (
      parsed.format === SAVE_ENVELOPE_FORMAT &&
      parsed.payload &&
      typeof parsed.payload === 'object'
    ) {
      candidatePayload = parsed.payload as Partial<CampaignSlotPayload>;
    } else if (parsed.passport && parsed.blackboard) {
      candidatePayload = parsed as Partial<CampaignSlotPayload>;
    } else {
      return {
        ok: false,
        error: 'File is not a valid World’s Smartest Campaign Save (.ws-save.json).',
      };
    }

    if (
      !candidatePayload.passport ||
      typeof candidatePayload.passport !== 'object' ||
      !candidatePayload.blackboard ||
      typeof candidatePayload.blackboard !== 'object'
    ) {
      return {
        ok: false,
        error: 'Save file is missing Meridian Passport or Campaign Blackboard data.',
      };
    }

    const nowIso = new Date().toISOString();
    const normalizedPayload: CampaignSlotPayload = {
      passport: candidatePayload.passport as PassportStateSnapshot,
      blackboard: candidatePayload.blackboard as InkBlackboardSnapshot,
      failedMissionAttempts:
        candidatePayload.failedMissionAttempts &&
        typeof candidatePayload.failedMissionAttempts === 'object'
          ? (candidatePayload.failedMissionAttempts as Record<string, FailedMissionAttemptInfo>)
          : {},
      wave2Runtime: candidatePayload.wave2Runtime,
      prologueRuntime: candidatePayload.prologueRuntime,
    };

    // If importing into the active slot, hydrate first so sanitized snapshots get persisted cleanly
    if (safeSlot === this.activeSlotId) {
      this.applyPayloadToRuntime(normalizedPayload);
      const savedMeta = this.saveSlotInternal(safeSlot);
      return { ok: true, meta: savedMeta };
    }

    // #182 §2: Round-trip inactive slot imports through runtime hydration so crafted `.ws-save.json`
    // files are 100% sanitized (clean Challenger Name, deduplicated completedMissions, valid 0..8 Visas/Relics)!
    const activeBackup = this.captureRuntimePayload();
    this.applyPayloadToRuntime(normalizedPayload);
    const savedMeta = this.saveSlotInternal(safeSlot);
    this.applyPayloadToRuntime(activeBackup);
    this.notifyListeners();

    return {
      ok: true,
      meta: {
        ...savedMeta,
        isActive: false,
      },
    };
  }

  /**
   * Deletes `slotId` cleanly (`#171`); if the active slot was deleted, resets live runtime to fresh unstarted state!
   */
  public deleteSlot(slotId: CampaignSlotId): void {
    const safeSlot: CampaignSlotId = isValidSlotId(slotId) ? slotId : this.activeSlotId;
    this.clearSlotRecord(safeSlot);

    if (safeSlot === this.activeSlotId) {
      this.withAutoSaveSuspended(() => {
        this.campaign.restartCampaignFromBeginning({
          keepChallengerName: false,
          prologue: this.prologue,
          wave2: this.wave2,
        });
      });
    }
    this.notifyListeners();
  }

  /**
   * Resets `slotId` back to **Act 0 Geneva Start** while keeping Challenger Name & lifetime stats (`#171`)!
   */
  public resetSlotToCampaignStart(slotId: CampaignSlotId): void {
    const safeSlot: CampaignSlotId = isValidSlotId(slotId) ? slotId : this.activeSlotId;

    if (safeSlot === this.activeSlotId) {
      this.withAutoSaveSuspended(() => {
        this.campaign.restartCampaignFromBeginning({
          keepChallengerName: true,
          prologue: this.prologue,
          wave2: this.wave2,
        });
      });
      this.saveSlotInternal(safeSlot);
      return;
    }

    const existing = this.readSlotRecord(safeSlot);
    if (!existing) {
      this.notifyListeners();
      return;
    }

    // Snapshot current active runtime, reset inside runtime using target slot's passport, save target, then restore active!
    this.withAutoSaveSuspended(() => {
      const activeBackup = this.captureRuntimePayload();
      this.applyPayloadToRuntime(existing.payload);
      this.campaign.restartCampaignFromBeginning({
        keepChallengerName: true,
        prologue: this.prologue,
        wave2: this.wave2,
      });
      this.saveSlotInternal(safeSlot);
      this.applyPayloadToRuntime(activeBackup);
    });
    this.notifyListeners();
  }
}
