// ============================================================================
// WORLD'S SMARTEST — ROARING-STYLE 128 KB BITSET ZERO-REPEAT TRACKER
// Implements docs/PITCH_BIBLE.md §6.3:
//   • Exact Uint32Array(32768) (131,072 bytes = 128 KB) covering QIDs 1..1,048,575
//   • Roaring-style Array / RLE-Word container compression + Base64 localStorage
//   • 30-Q microTopicId cooldown ring buffer + 5-Q L2 subcategory ring + L0 guard
// ============================================================================

import type { DomainId } from './types';

export const BITSET_WORD_COUNT = 98_304; // 98,304 * 4 bytes = 393,216 bytes (384 KB exact -> 3,145,728 QID slots!)
export const MAX_QID = 3_145_727; // Covers QIDs 1..3,145,727 (including 1.1M..3.0M+ deep specialist subcat shards!)
export const MICRO_TOPIC_COOLDOWN_WINDOW = 30;
export const L2_SUBCATEGORY_COOLDOWN_WINDOW = 5;
export const DOMAIN_HISTORY_WINDOW = 4;

const BITSET_STORAGE_KEY = 'ws_forge_seen_roaring_v2';
const COOLDOWN_STORAGE_KEY = 'ws_forge_cooldown_rings_v2';

const NUM_CONTAINERS = 48; // 48 * 65,536 = 3,145,728 bits (6-byte container presence bitmap)
const WORDS_PER_CONTAINER = 2_048; // 2,048 * 32 = 65,536 bits
const ARRAY_CONTAINER_MAX_CARDINALITY = 512;

const MODE_ARRAY = 1;
const MODE_RLE_WORDS = 2;

function popcount32(x: number): number {
  let v = x >>> 0;
  v = v - ((v >>> 1) & 0x55555555);
  v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
  return (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof btoa === 'function') {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const sub = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      for (let j = 0; j < sub.length; j++) {
        binary += String.fromCharCode(sub[j]);
      }
    }
    return btoa(binary);
  }
  const maybeBuffer = (globalThis as Record<string, unknown>).Buffer as
    | { from(data: Uint8Array): { toString(enc: string): string } }
    | undefined;
  if (maybeBuffer) {
    return maybeBuffer.from(bytes).toString('base64');
  }
  return '';
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof atob === 'function') {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      out[i] = bin.charCodeAt(i) & 0xff;
    }
    return out;
  }
  const maybeBuffer = (globalThis as Record<string, unknown>).Buffer as
    | { from(data: string, enc: string): Uint8Array }
    | undefined;
  if (maybeBuffer) {
    return new Uint8Array(maybeBuffer.from(b64, 'base64'));
  }
  return new Uint8Array(0);
}

interface CooldownPersistedState {
  microTopics: string[];
  l2Subcategories: string[];
  recentDomains: number[];
}

export class RoaringSeenTracker {
  /** Exact 128 KB bitset: 32,768 uint32 words covering QIDs 0..1,048,575 */
  private readonly words: Uint32Array = new Uint32Array(BITSET_WORD_COUNT);
  private seenTotal = 0;

  private microTopicRing: string[] = [];
  private l2SubcategoryRing: string[] = [];
  private recentDomainsRing: DomainId[] = [];

  private readonly storageKeyBitset: string;
  private readonly storageKeyCooldown: string;

  constructor(
    storageKeyBitset: string = BITSET_STORAGE_KEY,
    storageKeyCooldown: string = COOLDOWN_STORAGE_KEY,
    autoLoad = true,
  ) {
    this.storageKeyBitset = storageKeyBitset;
    this.storageKeyCooldown = storageKeyCooldown;
    if (autoLoad) {
      this.loadFromStorage();
    }
  }

  /** Direct read-only view of the underlying 128 KB Uint32Array(32768) bitset */
  public getRawWords(): Readonly<Uint32Array> {
    return this.words;
  }

  public getByteLength(): number {
    return this.words.byteLength; // Always 131,072 bytes (128 KB)
  }

  public getSeenCount(): number {
    return this.seenTotal;
  }

  /** O(1) (<0.001ms) exact bit test on QID 1..1,048,575 */
  public hasSeen(qid: number): boolean {
    const id = Math.trunc(qid);
    if (id < 1 || id > MAX_QID) return false;
    const wordIdx = id >>> 5;
    const bitMask = 1 << (id & 31);
    return (this.words[wordIdx] & bitMask) !== 0;
  }

  /** Marks a QID as seen and optionally persists immediately to localStorage */
  public markSeen(qid: number, persist = true): boolean {
    const id = Math.trunc(qid);
    if (id < 1 || id > MAX_QID) return false;
    const wordIdx = id >>> 5;
    const bitMask = 1 << (id & 31);
    const prev = this.words[wordIdx];
    if ((prev & bitMask) !== 0) {
      return false;
    }
    this.words[wordIdx] = (prev | bitMask) >>> 0;
    this.seenTotal += 1;
    if (persist) {
      this.saveToStorage();
    }
    return true;
  }

  /** Marks a question and updates microTopicId (30-Q), L2 (5-Q), and L0 domain cooldown guards */
  public recordPlayed(params: {
    qid: number;
    microTopicId?: string;
    l2Subcategory?: string;
    l0Domain?: DomainId;
    persist?: boolean;
  }): void {
    this.markSeen(params.qid, false);

    const topic = (params.microTopicId ?? '').trim().toLowerCase();
    if (topic.length > 0) {
      this.microTopicRing = this.microTopicRing.filter((t) => t !== topic);
      this.microTopicRing.push(topic);
      if (this.microTopicRing.length > MICRO_TOPIC_COOLDOWN_WINDOW) {
        this.microTopicRing.splice(0, this.microTopicRing.length - MICRO_TOPIC_COOLDOWN_WINDOW);
      }
    }

    const l2 = (params.l2Subcategory ?? '').trim().toLowerCase();
    if (l2.length > 0) {
      this.l2SubcategoryRing.push(l2);
      if (this.l2SubcategoryRing.length > L2_SUBCATEGORY_COOLDOWN_WINDOW) {
        this.l2SubcategoryRing.splice(0, this.l2SubcategoryRing.length - L2_SUBCATEGORY_COOLDOWN_WINDOW);
      }
    }

    if (params.l0Domain !== undefined) {
      this.recentDomainsRing.push(params.l0Domain);
      if (this.recentDomainsRing.length > DOMAIN_HISTORY_WINDOW) {
        this.recentDomainsRing.splice(0, this.recentDomainsRing.length - DOMAIN_HISTORY_WINDOW);
      }
    }

    if (params.persist !== false) {
      this.saveToStorage();
    }
  }

  /** Fast batch ANDNOT filter returning unseen QIDs from a candidate array */
  public filterUnseen(qids: ReadonlyArray<number>): number[] {
    const out: number[] = [];
    for (let i = 0; i < qids.length; i++) {
      const id = qids[i];
      if (!this.hasSeen(id)) {
        out.push(id);
      }
    }
    return out;
  }

  /** Counts seen QIDs inside an inclusive interval [qidStart, qidEnd] using fast 32-bit popcount */
  public countSeenInRange(qidStart: number, qidEnd: number): number {
    const lo = Math.max(1, Math.trunc(qidStart));
    const hi = Math.min(MAX_QID, Math.trunc(qidEnd));
    if (hi < lo) return 0;

    const startWord = lo >>> 5;
    const endWord = hi >>> 5;
    if (startWord === endWord) {
      let count = 0;
      for (let q = lo; q <= hi; q++) {
        if ((this.words[startWord] & (1 << (q & 31))) !== 0) count++;
      }
      return count;
    }

    let total = 0;
    for (let b = lo & 31; b < 32; b++) {
      if ((this.words[startWord] & (1 << b)) !== 0) total++;
    }
    for (let w = startWord + 1; w < endWord; w++) {
      const val = this.words[w];
      if (val !== 0) total += popcount32(val);
    }
    for (let b = 0; b <= (hi & 31); b++) {
      if ((this.words[endWord] & (1 << b)) !== 0) total++;
    }
    return total;
  }

  /** True if microTopicId appeared within the last 30 played questions */
  public isMicroTopicInCooldown(microTopicId?: string): boolean {
    if (!microTopicId) return false;
    const norm = microTopicId.trim().toLowerCase();
    if (!norm) return false;
    return this.microTopicRing.includes(norm);
  }

  /** True if L2 subcategory appeared within the last 5 played questions */
  public isL2InCooldown(l2Subcategory?: string): boolean {
    if (!l2Subcategory) return false;
    const norm = l2Subcategory.trim().toLowerCase();
    if (!norm) return false;
    return this.l2SubcategoryRing.includes(norm);
  }

  /** Returns the most recently played L0 domain (or null) for anti-repeat guard */
  public getLastDomain(): DomainId | null {
    return this.recentDomainsRing.length > 0
      ? this.recentDomainsRing[this.recentDomainsRing.length - 1]
      : null;
  }

  /** Computes a soft domain repetition penalty (higher penalty for immediate back-to-back repeats) */
  public getDomainRepeatPenalty(domainId: DomainId): number {
    const len = this.recentDomainsRing.length;
    if (len === 0) return 0;
    let penalty = 0;
    if (this.recentDomainsRing[len - 1] === domainId) penalty += 65;
    if (len >= 2 && this.recentDomainsRing[len - 2] === domainId) penalty += 22;
    return penalty;
  }

  public getRecentMicroTopics(): ReadonlyArray<string> {
    return this.microTopicRing;
  }

  public getRecentDomains(): ReadonlyArray<DomainId> {
    return this.recentDomainsRing;
  }

  /** Compresses the 3.14M-QID bitset using Roaring-style 16-bit Array/RLE containers into Base64 */
  public serializeCompressedBase64(): string {
    const bytes: number[] = [];
    // Header: 'W', 'S', 'R', '4' + 6-byte (48-bit) non-empty container mask
    bytes.push(0x57, 0x53, 0x52, 0x34);

    const maskBytes = new Uint8Array(6);
    const containerPayloads: number[][] = [];

    for (let c = 0; c < NUM_CONTAINERS; c++) {
      const baseWord = c * WORDS_PER_CONTAINER;
      let card = 0;
      for (let i = 0; i < WORDS_PER_CONTAINER; i++) {
        const w = this.words[baseWord + i];
        if (w !== 0) card += popcount32(w);
      }
      if (card === 0) {
        continue;
      }
      maskBytes[c >>> 3] |= 1 << (c & 7);

      if (card <= ARRAY_CONTAINER_MAX_CARDINALITY) {
        // Sparse Array Container: [MODE_ARRAY, cardLo, cardHi, ...uint16 offsets]
        const payload: number[] = [MODE_ARRAY, card & 0xff, (card >>> 8) & 0xff];
        for (let i = 0; i < WORDS_PER_CONTAINER; i++) {
          let w = this.words[baseWord + i];
          if (w === 0) continue;
          const bitBase = i << 5;
          while (w !== 0) {
            const tz = Math.clz32(w & -w) ^ 31;
            const low16 = (bitBase + tz) & 0xffff;
            payload.push(low16 & 0xff, (low16 >>> 8) & 0xff);
            w &= w - 1;
          }
        }
        containerPayloads.push(payload);
      } else {
        // Word-RLE Container: encodes runs of 0x00000000, runs of 0xFFFFFFFF, and literal word spans
        const payload: number[] = [MODE_RLE_WORDS];
        let idx = 0;
        while (idx < WORDS_PER_CONTAINER) {
          const w = this.words[baseWord + idx];
          if (w === 0 || w === 0xffffffff) {
            const target = w;
            let run = 1;
            while (
              idx + run < WORDS_PER_CONTAINER &&
              this.words[baseWord + idx + run] === target &&
              run < 256
            ) {
              run++;
            }
            payload.push(target === 0 ? 0x00 : 0x01, run - 1);
            idx += run;
          } else {
            const litStart = idx;
            let litCount = 0;
            while (
              idx < WORDS_PER_CONTAINER &&
              this.words[baseWord + idx] !== 0 &&
              this.words[baseWord + idx] !== 0xffffffff &&
              litCount < 256
            ) {
              idx++;
              litCount++;
            }
            payload.push(0x02, litCount - 1);
            for (let k = 0; k < litCount; k++) {
              const lw = this.words[baseWord + litStart + k];
              payload.push(lw & 0xff, (lw >>> 8) & 0xff, (lw >>> 16) & 0xff, (lw >>> 24) & 0xff);
            }
          }
        }
        containerPayloads.push(payload);
      }
    }

    for (let m = 0; m < 6; m++) {
      bytes.push(maskBytes[m]);
    }
    for (const p of containerPayloads) {
      for (let i = 0; i < p.length; i++) {
        bytes.push(p[i]);
      }
    }
    return bytesToBase64(Uint8Array.from(bytes));
  }

  /**
   * Restores the 3.14M bitset from a Roaring-style Base64 payload, auto-migrating
   * legacy WSR2 (16-container / 1.04M), WSR3 (32-container / 2.09M), and WSR4 (48-container / 3.14M)!
   */
  public deserializeCompressedBase64(b64: string): boolean {
    if (!b64) return false;
    let buf: Uint8Array;
    try {
      buf = base64ToBytes(b64);
    } catch {
      return false;
    }
    if (buf.length < 6 || buf[0] !== 0x57 || buf[1] !== 0x53 || buf[2] !== 0x52) {
      return false;
    }
    const ver = buf[3];
    const isV2 = ver === 0x32 && buf.length >= 6;
    const isV3 = ver === 0x33 && buf.length >= 8;
    const isV4 = ver === 0x34 && buf.length >= 10;
    if (!isV2 && !isV3 && !isV4) {
      return false;
    }

    this.words.fill(0);
    const maskBytes = new Uint8Array(6);
    let pos = 6;
    let maxContainers = 16;
    if (isV4) {
      for (let m = 0; m < 6; m++) maskBytes[m] = buf[4 + m];
      pos = 10;
      maxContainers = NUM_CONTAINERS;
    } else if (isV3) {
      for (let m = 0; m < 4; m++) maskBytes[m] = buf[4 + m];
      pos = 8;
      maxContainers = 32;
    } else {
      maskBytes[0] = buf[4];
      maskBytes[1] = buf[5];
      pos = 6;
      maxContainers = 16;
    }

    for (let c = 0; c < maxContainers; c++) {
      if ((maskBytes[c >>> 3] & (1 << (c & 7))) === 0) continue;
      if (pos >= buf.length) break;
      const mode = buf[pos++];
      const baseWord = c * WORDS_PER_CONTAINER;

      if (mode === MODE_ARRAY) {
        if (pos + 2 > buf.length) break;
        const card = buf[pos] | (buf[pos + 1] << 8);
        pos += 2;
        for (let k = 0; k < card && pos + 1 < buf.length; k++) {
          const low16 = buf[pos] | (buf[pos + 1] << 8);
          pos += 2;
          const wIdx = baseWord + (low16 >>> 5);
          this.words[wIdx] = (this.words[wIdx] | (1 << (low16 & 31))) >>> 0;
        }
      } else if (mode === MODE_RLE_WORDS) {
        let wordOffset = 0;
        while (wordOffset < WORDS_PER_CONTAINER && pos + 1 < buf.length) {
          const tag = buf[pos++];
          const len = buf[pos++] + 1;
          if (tag === 0x00) {
            wordOffset += len;
          } else if (tag === 0x01) {
            const end = Math.min(WORDS_PER_CONTAINER, wordOffset + len);
            for (let w = wordOffset; w < end; w++) {
              this.words[baseWord + w] = 0xffffffff;
            }
            wordOffset = end;
          } else if (tag === 0x02) {
            for (let k = 0; k < len && wordOffset < WORDS_PER_CONTAINER && pos + 3 < buf.length; k++) {
              const lw =
                (buf[pos] |
                  (buf[pos + 1] << 8) |
                  (buf[pos + 2] << 16) |
                  (buf[pos + 3] << 24)) >>>
                0;
              pos += 4;
              this.words[baseWord + wordOffset] = lw;
              wordOffset++;
            }
          } else {
            break;
          }
        }
      }
    }

    // Ensure reserved QID 0 is clear and recount exact popcount
    this.words[0] = (this.words[0] & ~1) >>> 0;
    let total = 0;
    for (let i = 0; i < BITSET_WORD_COUNT; i++) {
      const w = this.words[i];
      if (w !== 0) total += popcount32(w);
    }
    this.seenTotal = total;
    return true;
  }

  public saveToStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(this.storageKeyBitset, this.serializeCompressedBase64());
      const rings: CooldownPersistedState = {
        microTopics: this.microTopicRing,
        l2Subcategories: this.l2SubcategoryRing,
        recentDomains: this.recentDomainsRing,
      };
      localStorage.setItem(this.storageKeyCooldown, JSON.stringify(rings));
    } catch {
      // Ignore storage quota or SSR/sandbox restrictions
    }
  }

  public loadFromStorage(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const rawBits = localStorage.getItem(this.storageKeyBitset);
      if (rawBits) {
        this.deserializeCompressedBase64(rawBits);
      }
      const rawRings = localStorage.getItem(this.storageKeyCooldown);
      if (rawRings) {
        const parsed = JSON.parse(rawRings) as Partial<CooldownPersistedState>;
        if (Array.isArray(parsed.microTopics)) {
          this.microTopicRing = parsed.microTopics
            .map((s) => String(s).toLowerCase())
            .slice(-MICRO_TOPIC_COOLDOWN_WINDOW);
        }
        if (Array.isArray(parsed.l2Subcategories)) {
          this.l2SubcategoryRing = parsed.l2Subcategories
            .map((s) => String(s).toLowerCase())
            .slice(-L2_SUBCATEGORY_COOLDOWN_WINDOW);
        }
        if (Array.isArray(parsed.recentDomains)) {
          this.recentDomainsRing = parsed.recentDomains
            .map((n) => Math.max(0, Math.min(11, Math.trunc(Number(n)))) as DomainId)
            .slice(-DOMAIN_HISTORY_WINDOW);
        }
      }
    } catch {
      // Ignore corrupt storage entries
    }
  }

  public reset(persist = true): void {
    this.words.fill(0);
    this.seenTotal = 0;
    this.microTopicRing = [];
    this.l2SubcategoryRing = [];
    this.recentDomainsRing = [];
    if (persist) {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(this.storageKeyBitset);
          localStorage.removeItem(this.storageKeyCooldown);
        }
      } catch {
        // Ignore
      }
    }
  }
}
