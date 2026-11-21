// ============================================================================
// BitsetHistory — 1M-Scale Exact Zero-Repeat Bitset + Topic Cooldown Rings
// Supports QIDs 1..1,048,575 in a compact Uint32Array persisted to localStorage
// ============================================================================

const STORAGE_KEY = 'ws_seen_v1';
const MAX_QID = 1_048_575; // 2^20 - 1 (1,048,576 bits = 32,768 uint32 words)
const WORD_COUNT = (MAX_QID + 1) >>> 5; // 32,768 words = 128 KB RAM
const TOPIC_COOLDOWN_SIZE = 18; // >= 15 Qs micro-topic cooldown
const SUBCAT_COOLDOWN_SIZE = 5; // >= 4 Qs L2 subcategory cooldown

const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const B64_LOOKUP = new Uint8Array(128);
for (let i = 0; i < B64_CHARS.length; i++) {
  B64_LOOKUP[B64_CHARS.charCodeAt(i)] = i;
}

interface PersistedHistoryV1 {
  v: 1;
  b64: string;
  topics: string[];
  subcats: string[];
}

function encodeBase64(bytes: Uint8Array): string {
  let out = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    const triplet = (b0 << 16) | (b1 << 8) | b2;
    out += B64_CHARS[(triplet >>> 18) & 63];
    out += B64_CHARS[(triplet >>> 12) & 63];
    out += i + 1 < len ? B64_CHARS[(triplet >>> 6) & 63] : '=';
    out += i + 2 < len ? B64_CHARS[triplet & 63] : '=';
  }
  return out;
}

function decodeBase64(str: string): Uint8Array {
  const clean = str.replace(/[^A-Za-z0-9+/=]/g, '');
  if (clean.length === 0) return new Uint8Array(0);
  const pad = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  const byteLen = Math.floor((clean.length * 3) / 4) - pad;
  const out = new Uint8Array(Math.max(0, byteLen));
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = B64_LOOKUP[clean.charCodeAt(i) & 127];
    const c1 = B64_LOOKUP[clean.charCodeAt(i + 1) & 127];
    const c2 = clean[i + 2] === '=' ? 0 : B64_LOOKUP[clean.charCodeAt(i + 2) & 127];
    const c3 = clean[i + 3] === '=' ? 0 : B64_LOOKUP[clean.charCodeAt(i + 3) & 127];
    const triplet = (c0 << 18) | (c1 << 12) | (c2 << 6) | c3;
    if (p < out.length) out[p++] = (triplet >>> 16) & 255;
    if (p < out.length) out[p++] = (triplet >>> 8) & 255;
    if (p < out.length) out[p++] = triplet & 255;
  }
  return out;
}

function popcount32(n: number): number {
  let x = n >>> 0;
  x = x - ((x >>> 1) & 0x55555555);
  x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
  return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

export class BitsetHistory {
  private readonly words: Uint32Array = new Uint32Array(WORD_COUNT);
  private highestNonZeroWord = -1;
  private seenCount = 0;
  private topicRing: string[] = [];
  private subcatRing: string[] = [];

  constructor(private readonly storageKey: string = STORAGE_KEY) {
    this.load();
  }

  public hasSeen(qid: number): boolean {
    if (!Number.isInteger(qid) || qid < 0 || qid > MAX_QID) return false;
    const wordIdx = qid >>> 5;
    const bitMask = 1 << (qid & 31);
    return (this.words[wordIdx] & bitMask) !== 0;
  }

  public markSeen(qid: number, microTopicId?: string, l2Subcategory?: string): void {
    let changed = false;

    if (Number.isInteger(qid) && qid >= 0 && qid <= MAX_QID) {
      const wordIdx = qid >>> 5;
      const bitMask = 1 << (qid & 31);
      if ((this.words[wordIdx] & bitMask) === 0) {
        this.words[wordIdx] |= bitMask;
        this.seenCount += 1;
        if (wordIdx > this.highestNonZeroWord) {
          this.highestNonZeroWord = wordIdx;
        }
        changed = true;
      }
    }

    if (microTopicId) {
      this.pushRing(this.topicRing, microTopicId, TOPIC_COOLDOWN_SIZE);
      changed = true;
    }

    if (l2Subcategory) {
      this.pushRing(this.subcatRing, l2Subcategory, SUBCAT_COOLDOWN_SIZE);
      changed = true;
    }

    if (changed) {
      this.save();
    }
  }

  public isTopicOnCooldown(microTopicId: string): boolean {
    return this.topicRing.includes(microTopicId);
  }

  public isSubcategoryOnCooldown(l2Subcategory: string): boolean {
    return this.subcatRing.includes(l2Subcategory);
  }

  public getSeenCount(): number {
    return this.seenCount;
  }

  public getTopicCooldowns(): readonly string[] {
    return this.topicRing;
  }

  public getSubcatCooldowns(): readonly string[] {
    return this.subcatRing;
  }

  public reset(): void {
    this.words.fill(0);
    this.highestNonZeroWord = -1;
    this.seenCount = 0;
    this.topicRing = [];
    this.subcatRing = [];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(this.storageKey);
      }
    } catch {
      // Ignore storage access restrictions
    }
  }

  private pushRing(ring: string[], value: string, maxLen: number): void {
    const existing = ring.indexOf(value);
    if (existing !== -1) {
      ring.splice(existing, 1);
    }
    ring.push(value);
    while (ring.length > maxLen) {
      ring.shift();
    }
  }

  private load(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedHistoryV1>;
      if (parsed.v !== 1 || typeof parsed.b64 !== 'string') return;

      const bytes = decodeBase64(parsed.b64);
      const wordLen = Math.min(WORD_COUNT, Math.floor(bytes.length / 4));
      let count = 0;
      let highest = -1;

      for (let i = 0; i < wordLen; i++) {
        const off = i * 4;
        const word =
          (bytes[off] |
            (bytes[off + 1] << 8) |
            (bytes[off + 2] << 16) |
            (bytes[off + 3] << 24)) >>>
          0;
        this.words[i] = word;
        if (word !== 0) {
          count += popcount32(word);
          highest = i;
        }
      }

      this.seenCount = count;
      this.highestNonZeroWord = highest;
      if (Array.isArray(parsed.topics)) {
        this.topicRing = parsed.topics
          .filter((x): x is string => typeof x === 'string')
          .slice(-TOPIC_COOLDOWN_SIZE);
      }
      if (Array.isArray(parsed.subcats)) {
        this.subcatRing = parsed.subcats
          .filter((x): x is string => typeof x === 'string')
          .slice(-SUBCAT_COOLDOWN_SIZE);
      }
    } catch {
      // Graceful fallback to fresh history on corrupt/unavailable storage
    }
  }

  private save(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      const activeWords = this.highestNonZeroWord + 1;
      const bytes = new Uint8Array(activeWords * 4);
      for (let i = 0; i < activeWords; i++) {
        const word = this.words[i];
        const off = i * 4;
        bytes[off] = word & 255;
        bytes[off + 1] = (word >>> 8) & 255;
        bytes[off + 2] = (word >>> 16) & 255;
        bytes[off + 3] = (word >>> 24) & 255;
      }

      const payload: PersistedHistoryV1 = {
        v: 1,
        b64: encodeBase64(bytes),
        topics: this.topicRing,
        subcats: this.subcatRing,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    } catch {
      // Ignore quota/private-mode storage errors
    }
  }
}
