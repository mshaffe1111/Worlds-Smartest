// ============================================================================
// WORLD'S SMARTEST — 1-Tap Question Quality Rating & Quarantine Store (v2.0)
// Persisted in `localStorage` (`ws_question_feedback_v1`) so players can:
//   • Upvote crisp, memorable trivia questions (`UPVOTE`)
//   • Flag & immediately quarantine awkward, obvious, disputed, or repetitive
//     questions (`FLAG`) so `ForgeEngine` never draws that `qid` again!
//   • Export a structured JSON editorial quality report for corpus curation.
// ============================================================================

export const QUESTION_FEEDBACK_STORAGE_KEY = 'ws_question_feedback_v1';

export type VoteKind = 'UPVOTE' | 'FLAG';

export type FlagReason =
  | 'AWKWARD_PHRASING'
  | 'TOO_OBVIOUS'
  | 'DISPUTED_FACT'
  | 'DUPLICATE_FEEL';

export interface QuestionFeedbackInput {
  qid: number;
  vote: VoteKind;
  reason?: FlagReason;
  domainId?: number;
  subcatLabel?: string;
  promptSnippet?: string;
}

export interface QuestionFeedbackEntry {
  qid: number;
  vote: VoteKind;
  reason?: FlagReason;
  domainId?: number;
  subcatLabel?: string;
  promptSnippet?: string;
  updatedAtMs: number;
  updatedAtIso: string;
}

export interface QuestionFeedbackSummary {
  upvotes: number;
  flagged: number;
  entries: ReadonlyArray<QuestionFeedbackEntry>;
}

interface PersistedFeedbackPayload {
  schemaVersion: 'ws_question_feedback_v1';
  updatedAtIso: string;
  entries: Record<string, QuestionFeedbackEntry>;
}

const VALID_VOTES: ReadonlySet<string> = new Set<VoteKind>(['UPVOTE', 'FLAG']);
const VALID_REASONS: ReadonlySet<string> = new Set<FlagReason>([
  'AWKWARD_PHRASING',
  'TOO_OBVIOUS',
  'DISPUTED_FACT',
  'DUPLICATE_FEEL',
]);

const MAX_STORED_ENTRIES = 2_500;
const MAX_SNIPPET_CHARS = 180;
const MAX_SUBCAT_CHARS = 64;

// Fallback in-memory mirror used when `localStorage` is unavailable or throws.
let memoryRawJson: string | null = null;
let cachedRawJson: string | null = null;
let cachedEntries: Map<number, QuestionFeedbackEntry> = new Map();

const listeners = new Set<(summary: QuestionFeedbackSummary) => void>();

function getStorageSafe(): Storage | null {
  try {
    if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis && globalThis.localStorage) {
      return globalThis.localStorage;
    }
  } catch {
    // Restricted storage context
  }
  return null;
}

function readRawFromStorage(): string | null {
  const storage = getStorageSafe();
  if (storage) {
    try {
      return storage.getItem(QUESTION_FEEDBACK_STORAGE_KEY);
    } catch {
      return memoryRawJson;
    }
  }
  return memoryRawJson;
}

function writeRawToStorage(raw: string | null): void {
  memoryRawJson = raw;
  const storage = getStorageSafe();
  if (!storage) return;
  try {
    if (raw === null) {
      storage.removeItem(QUESTION_FEEDBACK_STORAGE_KEY);
    } else {
      storage.setItem(QUESTION_FEEDBACK_STORAGE_KEY, raw);
    }
  } catch {
    // Ignore QuotaExceededError or private-mode restriction; memory mirror keeps session consistent.
  }
}

function normalizeEntry(raw: unknown): QuestionFeedbackEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const obj = raw as Record<string, unknown>;
  const qid = Math.trunc(Number(obj.qid));
  if (!Number.isFinite(qid) || qid <= 0) return null;

  const voteRaw = String(obj.vote ?? '').toUpperCase();
  if (!VALID_VOTES.has(voteRaw)) return null;
  const vote = voteRaw as VoteKind;

  const reasonRaw = typeof obj.reason === 'string' ? obj.reason.toUpperCase() : '';
  const reason: FlagReason | undefined =
    vote === 'FLAG'
      ? (VALID_REASONS.has(reasonRaw) ? (reasonRaw as FlagReason) : 'AWKWARD_PHRASING')
      : undefined;

  const domNum = obj.domainId !== undefined && obj.domainId !== null ? Math.trunc(Number(obj.domainId)) : NaN;
  const domainId = Number.isFinite(domNum) && domNum >= 0 && domNum <= 11 ? domNum : undefined;

  const subcatLabel =
    typeof obj.subcatLabel === 'string' && obj.subcatLabel.trim().length > 0
      ? obj.subcatLabel.trim().slice(0, MAX_SUBCAT_CHARS)
      : undefined;

  const promptSnippet =
    typeof obj.promptSnippet === 'string' && obj.promptSnippet.trim().length > 0
      ? obj.promptSnippet.replace(/\s+/g, ' ').trim().slice(0, MAX_SNIPPET_CHARS)
      : undefined;

  const tsNum = Number(obj.updatedAtMs);
  const updatedAtMs = Number.isFinite(tsNum) && tsNum > 0 ? Math.trunc(tsNum) : Date.now();
  const updatedAtIso =
    typeof obj.updatedAtIso === 'string' && obj.updatedAtIso.trim().length > 0
      ? obj.updatedAtIso.trim()
      : new Date(updatedAtMs).toISOString();

  const clean: QuestionFeedbackEntry = {
    qid,
    vote,
    updatedAtMs,
    updatedAtIso,
  };
  if (reason !== undefined) clean.reason = reason;
  if (domainId !== undefined) clean.domainId = domainId;
  if (subcatLabel !== undefined) clean.subcatLabel = subcatLabel;
  if (promptSnippet !== undefined) clean.promptSnippet = promptSnippet;
  return clean;
}

function hydrateEntries(): Map<number, QuestionFeedbackEntry> {
  const raw = readRawFromStorage();
  if (raw === cachedRawJson) {
    return cachedEntries;
  }

  const next = new Map<number, QuestionFeedbackEntry>();
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<PersistedFeedbackPayload> | Record<string, unknown>;
      const bucket =
        parsed && typeof parsed === 'object' && 'entries' in parsed && parsed.entries && typeof parsed.entries === 'object'
          ? (parsed.entries as Record<string, unknown>)
          : (parsed as Record<string, unknown>);
      if (bucket && typeof bucket === 'object') {
        for (const val of Object.values(bucket)) {
          const clean = normalizeEntry(val);
          if (clean) {
            next.set(clean.qid, clean);
          }
        }
      }
    } catch {
      // Corrupt payload resets cleanly without throwing.
    }
  }

  cachedRawJson = raw;
  cachedEntries = next;
  return cachedEntries;
}

function persistEntries(map: Map<number, QuestionFeedbackEntry>): void {
  // Trim oldest UPVOTE entries first if storage cap is ever exceeded, preserving FLAG quarantines.
  if (map.size > MAX_STORED_ENTRIES) {
    const sorted = Array.from(map.values()).sort((a, b) => {
      if (a.vote !== b.vote) return a.vote === 'FLAG' ? -1 : 1;
      return b.updatedAtMs - a.updatedAtMs;
    });
    map.clear();
    for (let i = 0; i < Math.min(sorted.length, MAX_STORED_ENTRIES); i++) {
      map.set(sorted[i].qid, sorted[i]);
    }
  }

  const recordObj: Record<string, QuestionFeedbackEntry> = {};
  for (const [qid, entry] of map.entries()) {
    recordObj[String(qid)] = entry;
  }

  const payload: PersistedFeedbackPayload = {
    schemaVersion: QUESTION_FEEDBACK_STORAGE_KEY,
    updatedAtIso: new Date().toISOString(),
    entries: recordObj,
  };

  const serialized = JSON.stringify(payload);
  cachedEntries = map;
  cachedRawJson = serialized;
  writeRawToStorage(serialized);
}

function notifyListeners(): void {
  if (listeners.size === 0) return;
  const summary = getFeedbackSummary();
  for (const cb of listeners) {
    try {
      cb(summary);
    } catch {
      // Isolate listener errors
    }
  }
}

/**
 * Records a 1-tap quality vote (`'UPVOTE'` or `'FLAG'`) for a question `qid`.
 * Any `'FLAG'` immediately quarantines the `qid` so it is excluded from future draws.
 */
export function recordQuestionFeedback(entry: QuestionFeedbackInput): void {
  const qid = Math.trunc(Number(entry.qid));
  if (!Number.isFinite(qid) || qid <= 0) return;
  if (!VALID_VOTES.has(entry.vote)) return;

  const map = new Map(hydrateEntries());
  const nowMs = Date.now();
  const prev = map.get(qid);

  const normalized = normalizeEntry({
    qid,
    vote: entry.vote,
    reason: entry.vote === 'FLAG' ? (entry.reason ?? prev?.reason ?? 'AWKWARD_PHRASING') : undefined,
    domainId: entry.domainId ?? prev?.domainId,
    subcatLabel: entry.subcatLabel ?? prev?.subcatLabel,
    promptSnippet: entry.promptSnippet ?? prev?.promptSnippet,
    updatedAtMs: nowMs,
    updatedAtIso: new Date(nowMs).toISOString(),
  });

  if (!normalized) return;
  map.set(qid, normalized);
  persistEntries(map);
  notifyListeners();
}

/** Returns the recorded vote (`'UPVOTE' | 'FLAG'`) for `qid`, or `null` if unrated. */
export function getQuestionVote(qid: number): VoteKind | null {
  const cleanQid = Math.trunc(Number(qid));
  if (!Number.isFinite(cleanQid) || cleanQid <= 0) return null;
  return hydrateEntries().get(cleanQid)?.vote ?? null;
}

/** Returns the full stored feedback record for `qid`, or `null` if unrated. */
export function getQuestionFeedbackEntry(qid: number): QuestionFeedbackEntry | null {
  const cleanQid = Math.trunc(Number(qid));
  if (!Number.isFinite(cleanQid) || cleanQid <= 0) return null;
  const hit = hydrateEntries().get(cleanQid);
  return hit ? { ...hit } : null;
}

/** True when `qid` has been flagged and must be excluded from future question draws. */
export function isQuestionQuarantined(qid: number): boolean {
  return getQuestionVote(qid) === 'FLAG';
}

/** Returns a read-only Set of every currently flagged/quarantined `qid`. */
export function getQuarantinedQidSet(): ReadonlySet<number> {
  const map = hydrateEntries();
  const out = new Set<number>();
  for (const [qid, entry] of map.entries()) {
    if (entry.vote === 'FLAG') {
      out.add(qid);
    }
  }
  return out;
}

/** Aggregates upvotes, flagged quarantines, and newest-first feedback entries. */
export function getFeedbackSummary(): QuestionFeedbackSummary {
  const map = hydrateEntries();
  let upvotes = 0;
  let flagged = 0;
  const entries: QuestionFeedbackEntry[] = [];
  for (const entry of map.values()) {
    if (entry.vote === 'UPVOTE') upvotes += 1;
    else if (entry.vote === 'FLAG') flagged += 1;
    entries.push({ ...entry });
  }
  entries.sort((a, b) => b.updatedAtMs - a.updatedAtMs || a.qid - b.qid);
  return { upvotes, flagged, entries };
}

/** Exports a deterministic JSON editorial quality report of all player ratings & flags. */
export function exportFeedbackReportJson(): string {
  const summary = getFeedbackSummary();
  const quarantinedQids = summary.entries
    .filter((e) => e.vote === 'FLAG')
    .map((e) => e.qid)
    .sort((a, b) => a - b);

  const flagReasons: Record<FlagReason, number> = {
    AWKWARD_PHRASING: 0,
    TOO_OBVIOUS: 0,
    DISPUTED_FACT: 0,
    DUPLICATE_FEEL: 0,
  };
  for (const e of summary.entries) {
    if (e.vote === 'FLAG' && e.reason && e.reason in flagReasons) {
      flagReasons[e.reason] += 1;
    }
  }

  return JSON.stringify(
    {
      schemaVersion: QUESTION_FEEDBACK_STORAGE_KEY,
      exportedAtIso: new Date().toISOString(),
      totals: {
        totalRated: summary.entries.length,
        upvotes: summary.upvotes,
        flagged: summary.flagged,
      },
      flagReasons,
      quarantinedQids,
      entries: summary.entries,
    },
    null,
    2,
  );
}

/** Clears all stored question votes & quarantines from memory and `localStorage`. */
export function clearFeedback(): void {
  cachedEntries = new Map();
  cachedRawJson = null;
  writeRawToStorage(null);
  notifyListeners();
}

/** Subscribes to feedback changes (e.g. HUD badge or Observatory panel). Returns unsubscribe fn. */
export function subscribeQuestionFeedback(
  listener: (summary: QuestionFeedbackSummary) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
