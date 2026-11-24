// ============================================================================
// WORLD'S SMARTEST v6.0 — 160 KB EXACT ZERO-REPEAT BITSET LEDGER
// Exact Uint8Array(163_840) = 1,310,720 bits (1 bit per dense QID 0..1,310,719)
//   • O(1) nanosecond hasSeen(qid) & markSeen(qid) across the entire 1.27M+ corpus
//   • Async IndexedDB primary store (`ws_v6_seen_ledger_db`)
//   • Synchronous RLE/Delta-Base64 mirror in localStorage (`ws_v6_seen_rle`)
//   • Bitwise-OR union on hydration so NO seen clue is EVER lost across reloads!
// ============================================================================

export const V6_BITSET_BYTES = 163_840; // Exact 160 KiB
export const V6_BITSET_CAPACITY_BITS = V6_BITSET_BYTES * 8; // 1,310,720 bits
export const V6_IDB_NAME = 'ws_v6_seen_ledger_db';
export const V6_IDB_STORE = 'bitset_store';
export const V6_IDB_RECORD_KEY = 'primary_ledger_v6';
export const V6_LOCALSTORAGE_RLE_KEY = 'ws_v6_seen_rle';

const MAGIC_0 = 0x57; // 'W'
const MAGIC_1 = 0x53; // 'S'
const MAGIC_2 = 0x36; // '6'
const MAGIC_3 = 0x42; // 'B'
const ENCODING_SPARSE_VARINT = 0x01;
const ENCODING_BYTE_RLE = 0x02;

/** Precomputed 256-entry popcount lookup table for ultra-fast byte counting. */
const BYTE_POPCOUNT = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  let x = i;
  let c = 0;
  while (x > 0) {
    c += x & 1;
    x >>>= 1;
  }
  BYTE_POPCOUNT[i] = c;
}

export interface SeenLedgerTelemetryV6 {
  readonly seenCount: number;
  readonly totalPlayable: number;
  readonly capacityBits: number;
  readonly byteLength: number;
  readonly percentExplored: number;
  readonly idbHydrated: boolean;
  readonly lastPersistMs: number;
}

export interface StorageLikeV6 {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function encodeBase64(bytes: Uint8Array): string {
  if (typeof btoa === 'function') {
    const CHUNK = 0x8000;
    let bin = '';
    for (let i = 0; i < bytes.length; i += CHUNK) {
      const slice = bytes.subarray(i, Math.min(i + CHUNK, bytes.length));
      let part = '';
      for (let j = 0; j < slice.length; j++) {
        part += String.fromCharCode(slice[j]);
      }
      bin += part;
    }
    return btoa(bin);
  }
  const g = globalThis as Record<string, unknown>;
  const Buf = g.Buffer as
    | { from(data: Uint8Array): { toString(encoding: string): string } }
    | undefined;
  if (Buf) {
    return Buf.from(bytes).toString('base64');
  }
  return '';
}

function decodeBase64(b64: string): Uint8Array {
  if (!b64) return new Uint8Array(0);
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i) & 0xff;
    }
    return out;
  }
  const g = globalThis as Record<string, unknown>;
  const Buf = g.Buffer as
    | { from(data: string, encoding: string): Uint8Array }
    | undefined;
  if (Buf) {
    const buf = Buf.from(b64, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  return new Uint8Array(0);
}

function getDefaultLocalStorage(): StorageLikeV6 | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage !== null) {
      return localStorage;
    }
  } catch {
    // Restricted iframe / SSR sandbox
  }
  return null;
}

function hasIndexedDb(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null;
  } catch {
    return false;
  }
}

export class SeenQuestionBitsetLedger {
  /** Exact 163,840-byte (1,310,720-bit) bitset covering dense QIDs 0 .. 1,310,719 */
  private readonly bitset: Uint8Array = new Uint8Array(V6_BITSET_BYTES);
  private seenCount = 0;
  private idbHydrated = false;
  private lastPersistMs = 0;
  private idbFlushTimer: ReturnType<typeof setTimeout> | null = null;
  private idbDbPromise: Promise<IDBDatabase | null> | null = null;
  private pendingIdbWrite: Promise<void> = Promise.resolve();

  private readonly lsKey: string;
  private readonly idbName: string;
  private readonly storage: StorageLikeV6 | null;
  private readonly useIndexedDb: boolean;

  // Lightweight session anti-clump cooldown rings (never block draw; purely bias variety)
  private readonly recentDomains: number[] = [];
  private readonly recentTables: string[] = [];
  private readonly recentCategories: string[] = [];

  constructor(options?: {
    localStorageKey?: string;
    indexedDbName?: string;
    storage?: StorageLikeV6 | null;
    useIndexedDb?: boolean;
    autoLoad?: boolean;
  }) {
    this.lsKey = options?.localStorageKey ?? V6_LOCALSTORAGE_RLE_KEY;
    this.idbName = options?.indexedDbName ?? V6_IDB_NAME;
    this.storage =
      options?.storage !== undefined ? options.storage : getDefaultLocalStorage();
    this.useIndexedDb =
      options?.useIndexedDb !== undefined ? options.useIndexedDb : hasIndexedDb();

    if (options?.autoLoad !== false) {
      this.loadFromLocalStorageSync();
    }
  }

  /** Direct read-only view of the underlying exact 163,840-byte Uint8Array. */
  public getRawBytes(): Readonly<Uint8Array> {
    return this.bitset;
  }

  /** Exact memory footprint in bytes (always 163,840 bytes = 160 KiB). */
  public getByteLength(): number {
    return this.bitset.byteLength;
  }

  /** Exact total bit capacity (always 1,310,720). */
  public getCapacityBits(): number {
    return V6_BITSET_CAPACITY_BITS;
  }

  /** Live count of unique seen clues across all sessions & reloads (feeds Options Console). */
  public getSeenCount(): number {
    return this.seenCount;
  }

  /** O(1) nanosecond exact seen lookup for dense QID 0 .. 1,310,719. */
  public hasSeen(qid: number): boolean {
    const id = Math.trunc(qid);
    if (id < 0 || id >= V6_BITSET_CAPACITY_BITS) return false;
    return (this.bitset[id >>> 3] & (1 << (id & 7))) !== 0;
  }

  /**
   * Marks a dense QID as seen in O(1), updates live telemetry count, and persists
   * to the fast RLE/Base64 localStorage mirror + async IndexedDB primary ledger.
   * Returns `true` if newly marked, `false` if already seen or out-of-bounds.
   */
  public markSeen(qid: number, persist = true): boolean {
    const id = Math.trunc(qid);
    if (id < 0 || id >= V6_BITSET_CAPACITY_BITS) return false;
    const byteIdx = id >>> 3;
    const mask = 1 << (id & 7);
    const prev = this.bitset[byteIdx];
    if ((prev & mask) !== 0) {
      return false;
    }
    this.bitset[byteIdx] = prev | mask;
    this.seenCount += 1;
    if (persist) {
      this.saveToLocalStorageSync();
      this.scheduleIndexedDbFlush();
    }
    return true;
  }

  /** Marks a batch of QIDs and performs a single consolidated persistence flush. */
  public markSeenBatch(qids: Iterable<number>, persist = true): number {
    let added = 0;
    for (const rawQid of qids) {
      if (this.markSeen(rawQid, false)) {
        added += 1;
      }
    }
    if (persist && added > 0) {
      this.saveToLocalStorageSync();
      this.scheduleIndexedDbFlush();
    }
    return added;
  }

  /** Clears a single QID bit (rare admin/debug utility). */
  public unmarkSeen(qid: number, persist = true): boolean {
    const id = Math.trunc(qid);
    if (id < 0 || id >= V6_BITSET_CAPACITY_BITS) return false;
    const byteIdx = id >>> 3;
    const mask = 1 << (id & 7);
    const prev = this.bitset[byteIdx];
    if ((prev & mask) === 0) return false;
    this.bitset[byteIdx] = prev & ~mask;
    this.seenCount = Math.max(0, this.seenCount - 1);
    if (persist) {
      this.saveToLocalStorageSync();
      this.scheduleIndexedDbFlush();
    }
    return true;
  }

  /** Records lightweight domain/table/category recency rings for broadcast variety. */
  public recordServedContext(meta: {
    qid: number;
    domainId?: number;
    tableType?: string;
    categoryLabel?: string;
    persist?: boolean;
  }): boolean {
    const newlyMarked = this.markSeen(meta.qid, meta.persist !== false);
    if (meta.domainId !== undefined && Number.isFinite(meta.domainId)) {
      this.recentDomains.push(Math.trunc(meta.domainId));
      if (this.recentDomains.length > 6) this.recentDomains.shift();
    }
    if (meta.tableType) {
      this.recentTables.push(meta.tableType);
      if (this.recentTables.length > 8) this.recentTables.shift();
    }
    if (meta.categoryLabel) {
      this.recentCategories.push(meta.categoryLabel.toUpperCase());
      if (this.recentCategories.length > 8) this.recentCategories.shift();
    }
    return newlyMarked;
  }

  public isTableRecentlyUsed(tableType: string, windowSize = 3): boolean {
    if (!tableType || this.recentTables.length === 0) return false;
    const start = Math.max(0, this.recentTables.length - windowSize);
    for (let i = start; i < this.recentTables.length; i++) {
      if (this.recentTables[i] === tableType) return true;
    }
    return false;
  }

  public isCategoryRecentlyUsed(categoryLabel: string, windowSize = 3): boolean {
    if (!categoryLabel || this.recentCategories.length === 0) return false;
    const up = categoryLabel.toUpperCase();
    const start = Math.max(0, this.recentCategories.length - windowSize);
    for (let i = start; i < this.recentCategories.length; i++) {
      if (this.recentCategories[i] === up) return true;
    }
    return false;
  }

  public getLastDomainId(): number | null {
    return this.recentDomains.length > 0
      ? this.recentDomains[this.recentDomains.length - 1]
      : null;
  }

  /** Fast exact popcount across an inclusive QID interval [startQid, endQid]. */
  public countSeenInRange(startQid: number, endQid: number): number {
    const lo = Math.max(0, Math.trunc(startQid));
    const hi = Math.min(V6_BITSET_CAPACITY_BITS - 1, Math.trunc(endQid));
    if (hi < lo) return 0;

    const startByte = lo >>> 3;
    const endByte = hi >>> 3;
    if (startByte === endByte) {
      let count = 0;
      const b = this.bitset[startByte];
      for (let bit = lo & 7; bit <= (hi & 7); bit++) {
        if ((b & (1 << bit)) !== 0) count++;
      }
      return count;
    }

    let total = 0;
    const firstB = this.bitset[startByte];
    for (let bit = lo & 7; bit < 8; bit++) {
      if ((firstB & (1 << bit)) !== 0) total++;
    }
    for (let i = startByte + 1; i < endByte; i++) {
      const val = this.bitset[i];
      if (val !== 0) total += BYTE_POPCOUNT[val];
    }
    const lastB = this.bitset[endByte];
    for (let bit = 0; bit <= (hi & 7); bit++) {
      if ((lastB & (1 << bit)) !== 0) total++;
    }
    return total;
  }

  /** Live telemetry snapshot for the Broadcast Options Console & Diagnostics HUD. */
  public getTelemetry(totalPlayable = 1_279_852): SeenLedgerTelemetryV6 {
    const denom = Math.max(1, totalPlayable);
    return {
      seenCount: this.seenCount,
      totalPlayable: denom,
      capacityBits: V6_BITSET_CAPACITY_BITS,
      byteLength: V6_BITSET_BYTES,
      percentExplored: Math.round((this.seenCount / denom) * 10000) / 100,
      idbHydrated: this.idbHydrated,
      lastPersistMs: this.lastPersistMs,
    };
  }

  // --------------------------------------------------------------------------
  // COMPACT RLE + SPARSE-DELTA BASE64 CODEC (FAST localStorage MIRROR)
  // --------------------------------------------------------------------------

  /**
   * Serializes the 163,840-byte bitset into a compact Base64 string:
   *  - Sparse mode (`seenCount <= 42,000`): Varint-encoded sorted QID deltas (~2 bytes/clue!).
   *  - Dense mode (`seenCount > 42,000`): Lossless Byte-RLE over zero runs, 0xFF runs & literals.
   */
  public serializeRleBase64(): string {
    if (this.seenCount === 0) {
      return encodeBase64(
        new Uint8Array([MAGIC_0, MAGIC_1, MAGIC_2, MAGIC_3, ENCODING_SPARSE_VARINT, 0, 0, 0, 0]),
      );
    }

    if (this.seenCount <= 42_000) {
      // Sparse delta-varint encoding: [MAGIC(4), MODE=1, count(uint32 LE), ...varint deltas]
      const out: number[] = [
        MAGIC_0,
        MAGIC_1,
        MAGIC_2,
        MAGIC_3,
        ENCODING_SPARSE_VARINT,
        this.seenCount & 0xff,
        (this.seenCount >>> 8) & 0xff,
        (this.seenCount >>> 16) & 0xff,
        (this.seenCount >>> 24) & 0xff,
      ];
      let prevQid = 0;
      for (let i = 0; i < V6_BITSET_BYTES; i++) {
        let b = this.bitset[i];
        if (b === 0) continue;
        const base = i << 3;
        while (b !== 0) {
          // Lowest set bit index (0..7)
          const lsb = b & -b;
          let bit = 0;
          if (lsb === 1) bit = 0;
          else if (lsb === 2) bit = 1;
          else if (lsb === 4) bit = 2;
          else if (lsb === 8) bit = 3;
          else if (lsb === 16) bit = 4;
          else if (lsb === 32) bit = 5;
          else if (lsb === 64) bit = 6;
          else bit = 7;

          const qid = base + bit;
          let delta = qid - prevQid;
          prevQid = qid;
          while (delta >= 0x80) {
            out.push((delta & 0x7f) | 0x80);
            delta >>>= 7;
          }
          out.push(delta);
          b &= b - 1;
        }
      }
      return encodeBase64(Uint8Array.from(out));
    }

    // Dense lossless Byte-RLE:
    //   0x00, lo, hi -> run of (len) zero bytes (1..65535)
    //   0xFF, lo, hi -> run of (len) 0xFF bytes (1..65535)
    //   0x01, lo, hi, ...bytes -> literal span of (len) mixed bytes (1..65535)
    const out: number[] = [MAGIC_0, MAGIC_1, MAGIC_2, MAGIC_3, ENCODING_BYTE_RLE];
    let idx = 0;
    while (idx < V6_BITSET_BYTES) {
      const val = this.bitset[idx];
      if (val === 0x00 || val === 0xff) {
        let run = 1;
        while (
          idx + run < V6_BITSET_BYTES &&
          this.bitset[idx + run] === val &&
          run < 65_535
        ) {
          run++;
        }
        out.push(val, run & 0xff, (run >>> 8) & 0xff);
        idx += run;
      } else {
        const start = idx;
        let lit = 0;
        while (idx < V6_BITSET_BYTES && lit < 65_535) {
          const cur = this.bitset[idx];
          if (
            (cur === 0x00 || cur === 0xff) &&
            idx + 2 < V6_BITSET_BYTES &&
            this.bitset[idx + 1] === cur &&
            this.bitset[idx + 2] === cur
          ) {
            break;
          }
          idx++;
          lit++;
        }
        out.push(0x01, lit & 0xff, (lit >>> 8) & 0xff);
        for (let k = 0; k < lit; k++) {
          out.push(this.bitset[start + k]);
        }
      }
    }
    return encodeBase64(Uint8Array.from(out));
  }

  /**
   * Decodes an RLE/Sparse Base64 payload into the bitset.
   * When `mergeUnion = true`, performs bitwise OR so existing bits are never overwritten!
   */
  public deserializeRleBase64(b64: string, mergeUnion = false): boolean {
    if (!b64) return false;
    let buf: Uint8Array;
    try {
      buf = decodeBase64(b64);
    } catch {
      return false;
    }
    if (
      buf.length < 5 ||
      buf[0] !== MAGIC_0 ||
      buf[1] !== MAGIC_1 ||
      buf[2] !== MAGIC_2 ||
      buf[3] !== MAGIC_3
    ) {
      return false;
    }

    const mode = buf[4];
    if (!mergeUnion) {
      this.bitset.fill(0);
    }

    if (mode === ENCODING_SPARSE_VARINT) {
      if (buf.length < 9) return false;
      const count =
        (buf[5] | (buf[6] << 8) | (buf[7] << 16) | (buf[8] << 24)) >>> 0;
      let pos = 9;
      let qid = 0;
      for (let i = 0; i < count && pos < buf.length; i++) {
        let delta = 0;
        let shift = 0;
        while (pos < buf.length) {
          const byte = buf[pos++];
          delta |= (byte & 0x7f) << shift;
          if ((byte & 0x80) === 0) break;
          shift += 7;
        }
        qid += delta;
        if (qid >= 0 && qid < V6_BITSET_CAPACITY_BITS) {
          this.bitset[qid >>> 3] |= 1 << (qid & 7);
        }
      }
    } else if (mode === ENCODING_BYTE_RLE) {
      let pos = 5;
      let dst = 0;
      while (pos + 2 < buf.length && dst < V6_BITSET_BYTES) {
        const tag = buf[pos++];
        const len = buf[pos] | (buf[pos + 1] << 8);
        pos += 2;
        if (tag === 0x00) {
          dst += len;
        } else if (tag === 0xff) {
          const end = Math.min(V6_BITSET_BYTES, dst + len);
          for (let k = dst; k < end; k++) {
            this.bitset[k] = 0xff;
          }
          dst = end;
        } else if (tag === 0x01) {
          const end = Math.min(V6_BITSET_BYTES, dst + len);
          for (let k = dst; k < end && pos < buf.length; k++) {
            this.bitset[k] |= buf[pos++];
          }
          dst = end;
        } else {
          break;
        }
      }
    } else {
      return false;
    }

    this.recomputeSeenCount();
    return true;
  }

  /** Merges another Uint8Array(163840) via bitwise OR (lossless union across IndexedDB & localStorage). */
  public mergeRawBytes(other: Uint8Array): void {
    const len = Math.min(V6_BITSET_BYTES, other.length);
    for (let i = 0; i < len; i++) {
      if (other[i] !== 0) {
        this.bitset[i] |= other[i];
      }
    }
    this.recomputeSeenCount();
  }

  private recomputeSeenCount(): void {
    let total = 0;
    for (let i = 0; i < V6_BITSET_BYTES; i++) {
      const b = this.bitset[i];
      if (b !== 0) total += BYTE_POPCOUNT[b];
    }
    this.seenCount = total;
  }

  // --------------------------------------------------------------------------
  // SYNCHRONOUS localStorage MIRROR & ASYNC IndexedDB PRIMARY LEDGER
  // --------------------------------------------------------------------------

  public saveToLocalStorageSync(): void {
    if (!this.storage) return;
    try {
      const encoded = this.serializeRleBase64();
      this.storage.setItem(this.lsKey, encoded);
      this.lastPersistMs = Date.now();
    } catch {
      // Ignore quota exceeded / private-mode storage blocks — IndexedDB still persists!
    }
  }

  public loadFromLocalStorageSync(): boolean {
    if (!this.storage) return false;
    try {
      const raw = this.storage.getItem(this.lsKey);
      if (!raw) return false;
      return this.deserializeRleBase64(raw, true);
    } catch {
      return false;
    }
  }

  private openIndexedDb(): Promise<IDBDatabase | null> {
    if (!this.useIndexedDb) return Promise.resolve(null);
    if (this.idbDbPromise) return this.idbDbPromise;

    this.idbDbPromise = new Promise<IDBDatabase | null>((resolve) => {
      try {
        const req = indexedDB.open(this.idbName, 1);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(V6_IDB_STORE)) {
            db.createObjectStore(V6_IDB_STORE);
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
    return this.idbDbPromise;
  }

  /**
   * Asynchronously hydrates from `IndexedDB` (`ws_v6_seen_ledger_db`) and bitwise-ORs
   * with any synchronous `localStorage` mirror bits so ZERO seen history is ever lost.
   */
  public async hydrate(): Promise<number> {
    this.loadFromLocalStorageSync();
    const db = await this.openIndexedDb();
    if (!db) {
      this.idbHydrated = true;
      return this.seenCount;
    }

    await new Promise<void>((resolve) => {
      try {
        const tx = db.transaction(V6_IDB_STORE, 'readonly');
        const store = tx.objectStore(V6_IDB_STORE);
        const getReq = store.get(V6_IDB_RECORD_KEY);
        getReq.onsuccess = () => {
          const rec = getReq.result as
            | { bytes?: Uint8Array | ArrayBuffer }
            | Uint8Array
            | undefined;
          if (rec instanceof Uint8Array) {
            this.mergeRawBytes(rec);
          } else if (rec && rec.bytes instanceof Uint8Array) {
            this.mergeRawBytes(rec.bytes);
          } else if (rec && rec.bytes instanceof ArrayBuffer) {
            this.mergeRawBytes(new Uint8Array(rec.bytes));
          }
          resolve();
        };
        getReq.onerror = () => resolve();
      } catch {
        resolve();
      }
    });

    this.idbHydrated = true;
    // Sync merged truth back into localStorage mirror
    this.saveToLocalStorageSync();
    return this.seenCount;
  }

  private scheduleIndexedDbFlush(): void {
    if (!this.useIndexedDb) return;
    if (this.idbFlushTimer !== null) return;
    this.idbFlushTimer = setTimeout(() => {
      this.idbFlushTimer = null;
      void this.flushToIndexedDb();
    }, 60);
  }

  /** Forces immediate persistence to both localStorage mirror and IndexedDB primary store. */
  public async flush(): Promise<void> {
    if (this.idbFlushTimer !== null) {
      clearTimeout(this.idbFlushTimer);
      this.idbFlushTimer = null;
    }
    this.saveToLocalStorageSync();
    await this.flushToIndexedDb();
  }

  private flushToIndexedDb(): Promise<void> {
    if (!this.useIndexedDb) return Promise.resolve();
    const snapshot = new Uint8Array(this.bitset); // immutable copy for async tx
    const countSnap = this.seenCount;

    this.pendingIdbWrite = this.pendingIdbWrite.then(async () => {
      const db = await this.openIndexedDb();
      if (!db) return;
      await new Promise<void>((resolve) => {
        try {
          const tx = db.transaction(V6_IDB_STORE, 'readwrite');
          const store = tx.objectStore(V6_IDB_STORE);
          store.put(
            {
              version: 1,
              updatedAt: Date.now(),
              seenCount: countSnap,
              bytes: snapshot,
            },
            V6_IDB_RECORD_KEY,
          );
          tx.oncomplete = () => {
            this.lastPersistMs = Date.now();
            resolve();
          };
          tx.onerror = () => resolve();
          tx.onabort = () => resolve();
        } catch {
          resolve();
        }
      });
    });
    return this.pendingIdbWrite;
  }

  /** Completely resets the 160 KB ledger (for Broadcast Options Console "Reset Seen History"). */
  public async reset(persist = true): Promise<void> {
    if (this.idbFlushTimer !== null) {
      clearTimeout(this.idbFlushTimer);
      this.idbFlushTimer = null;
    }
    this.bitset.fill(0);
    this.seenCount = 0;
    this.recentDomains.length = 0;
    this.recentTables.length = 0;
    this.recentCategories.length = 0;

    if (persist) {
      try {
        this.storage?.removeItem(this.lsKey);
      } catch {
        // ignore
      }
      if (this.useIndexedDb) {
        const db = await this.openIndexedDb();
        if (db) {
          await new Promise<void>((resolve) => {
            try {
              const tx = db.transaction(V6_IDB_STORE, 'readwrite');
              tx.objectStore(V6_IDB_STORE).delete(V6_IDB_RECORD_KEY);
              tx.oncomplete = () => resolve();
              tx.onerror = () => resolve();
            } catch {
              resolve();
            }
          });
        }
      }
    }
  }
}

export const sharedSeenLedgerV6 = new SeenQuestionBitsetLedger();
