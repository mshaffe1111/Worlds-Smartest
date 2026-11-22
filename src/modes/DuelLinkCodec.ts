// ============================================================================
// WORLD'S SMARTEST — Upgrade #1: One-Tap URL Duel Links (`?duel=WSD2...`)
// Zero-Dependency Binary + Base64URL Codec, CRC16 Integrity, Legacy WSG1
// Fallback, Live Head-to-Head Race Tracker, Persisted Rivals Store, and
// Deterministic Global Contender Cohort Leaderboard Builder
// ============================================================================

import { BUILTIN_TAXONOMY_SEEDS } from '../forge/TaxonomyCatalog';
import { FORGE_DOMAINS, type DomainId, type PeelTier } from '../forge/types';
import type { FactionId } from '../narrative/PassportSystem';
import type {
  KineticGhostEvent,
  KineticGhostPacket,
  KineticQuestionTrace,
} from './CouncilTrialsGhostMode';
import type { ScoredQuestionResult } from './ScoringEngine';

// ----------------------------------------------------------------------------
// Constants & Wire-Format Types
// ----------------------------------------------------------------------------

export const DUEL_WIRE_PREFIX = 'WSD2';
export const LEGACY_GHOST_PREFIX = 'WSG1:';
export const DUEL_RIVALS_STORAGE_KEY = 'ws_duel_rivals_v2';
export const DUEL_DATE_EPOCH_MS = Date.UTC(2025, 0, 1);
export const MERIDIAN_FEED_EPOCH_MS = Date.UTC(2026, 0, 1);
const EPOCH_DAY_MS = 86_400_000;

export const MAX_DUEL_QUESTIONS = 15;
export const MAX_CHALLENGER_NAME_BYTES = 18;
export const MAX_TOPIC_LABEL_CHARS = 28;
export const MAX_RAW_TAXONOMY_ID_BYTES = 48;
export const MAX_LOCK_TIME_100MS = 250; // 0..250 -> 0.0s .. 25.0s

export type DuelMode = 'DAILY' | 'BRIEFING' | 'TRIALS';
export type OverclockTier = 0 | 1 | 2 | 3 | 4;
export type DuelLeader = 'PLAYER' | 'CHALLENGER' | 'TIED';

export const OVERCLOCK_TIER_VALUES: readonly [0, 0.25, 0.5, 0.75, 1.0] = [
  0, 0.25, 0.5, 0.75, 1.0,
];

const MODE_LIST: readonly DuelMode[] = ['DAILY', 'BRIEFING', 'TRIALS'];
const FACTION_LIST: readonly FactionId[] = ['SOVEREIGN', 'HORIZON', 'AGORA'];

export interface DuelQuestionSplit {
  /** Lock time in 100ms ticks (uint8, 0..250 -> 0.0s..25.0s) */
  lockTime100ms: number;
  /** Active Peel tier when answer locked: 1 | 2 | 3 */
  peelTier: PeelTier;
  /** Quantized Overclock tier 0..4 mapping to 0, 0.25, 0.5, 0.75, 1.0 */
  overclockTier: OverclockTier;
  /** True if challenger answered correctly */
  correct: boolean;
  /** Points earned on this question divided by 10 (uint16, 0..65535 -> 0..655,350 pts) */
  pointsDiv10: number;
}

export interface DuelChallengePayload {
  /** Wire format version (2 for binary WSD2, 1 when decoded via legacy WSG1 fallback) */
  version?: 1 | 2;
  mode: DuelMode;
  /** UTF-8 trimmed <= 18 bytes */
  challengerName: string;
  faction: FactionId;
  /** Challenger Elo rating (uint16, 0..65535) */
  elo: number;
  /** uint16 days since 2025-01-01 (used for Daily; 0 when unused) */
  utcDateCode: number;
  /** Optional derived UTC date string ('YYYY-MM-DD') when date is present */
  utcDate?: string;
  /** int8 domain ID: -1 for All / Global Mix, 0..11 for specific L0 domain */
  domainId: number;
  /** Optional L1 subcategory ID (dictionary-indexed when built-in, else compact UTF-8) */
  l1Id?: string;
  /** Optional L2 topic ID (e.g. 'sports_baseball' or 'sub_bb_awards_hof') */
  l2Id?: string;
  /** Optional human topic label <= 28 chars (e.g. 'Baseball', 'Daily #326') */
  topicLabel?: string;
  /** 1..15 exact Question IDs (uint32) played in exact order */
  qids: ReadonlyArray<number>;
  /** Per-question compact Ghost Splits (same length as qids) */
  splits: ReadonlyArray<DuelQuestionSplit>;
  /** Total banked score (uint32) */
  totalScore: number;
}

// ----------------------------------------------------------------------------
// Deterministic Static Taxonomy Dictionary (1-byte indices for built-in IDs)
// ----------------------------------------------------------------------------

const L1_DICT: string[] = [];
const L1_DICT_MAP = new Map<string, number>();
const L2_DICT: string[] = [];
const L2_DICT_MAP = new Map<string, number>();
const TAXONOMY_LABEL_BY_ID = new Map<string, string>();

// Common specialist shard sub-IDs appended after built-in taxonomy seeds
const EXTRA_L2_DICT_IDS: readonly string[] = [
  'baseball',
  'sub_baseball',
  'sub_bb_awards_hof',
  'sub_bb_ballpark',
  'sub_basketball',
  'sub_american_football',
  'sub_soccer',
  'sub_ice_hockey',
];

function initTaxonomyDictionaries(): void {
  const seenL1 = new Set<string>();
  const seenL2 = new Set<string>();

  for (const dom of BUILTIN_TAXONOMY_SEEDS) {
    for (const l1 of dom.l1Subcategories) {
      TAXONOMY_LABEL_BY_ID.set(l1.id, l1.name);
      if (!seenL1.has(l1.id) && L1_DICT.length < 255) {
        seenL1.add(l1.id);
        L1_DICT_MAP.set(l1.id, L1_DICT.length);
        L1_DICT.push(l1.id);
      }
      for (const l2 of l1.l2Topics) {
        TAXONOMY_LABEL_BY_ID.set(l2.id, l2.name);
        if (!seenL2.has(l2.id) && L2_DICT.length < 255) {
          seenL2.add(l2.id);
          L2_DICT_MAP.set(l2.id, L2_DICT.length);
          L2_DICT.push(l2.id);
        }
      }
    }
  }

  for (const extra of EXTRA_L2_DICT_IDS) {
    if (!seenL2.has(extra) && L2_DICT.length < 255) {
      seenL2.add(extra);
      L2_DICT_MAP.set(extra, L2_DICT.length);
      L2_DICT.push(extra);
    }
  }
}

initTaxonomyDictionaries();

// ----------------------------------------------------------------------------
// Pure Base64URL, UTF-8, CRC-16/CCITT-FALSE & Quantization Primitives
// ----------------------------------------------------------------------------

const B64URL_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const B64URL_LOOKUP = new Int16Array(128).fill(-1);
for (let i = 0; i < B64URL_ALPHABET.length; i++) {
  B64URL_LOOKUP[B64URL_ALPHABET.charCodeAt(i)] = i;
}

const utf8Encoder = new TextEncoder();
const utf8DecoderStrict = new TextDecoder('utf-8', { fatal: true });

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

/**
 * Pure zero-dependency Base64URL encoder (RFC 4648 §5, unpadded: zero '=', '+', '/').
 */
export function bytesToBase64Url(bytes: Uint8Array): string {
  const len = bytes.length;
  let out = '';
  let i = 0;
  while (i + 2 < len) {
    const n = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
    out +=
      B64URL_ALPHABET[(n >>> 18) & 0x3f] +
      B64URL_ALPHABET[(n >>> 12) & 0x3f] +
      B64URL_ALPHABET[(n >>> 6) & 0x3f] +
      B64URL_ALPHABET[n & 0x3f];
    i += 3;
  }
  const rem = len - i;
  if (rem === 1) {
    const n = bytes[i];
    out += B64URL_ALPHABET[(n >>> 2) & 0x3f] + B64URL_ALPHABET[(n << 4) & 0x3f];
  } else if (rem === 2) {
    const n = (bytes[i] << 8) | bytes[i + 1];
    out +=
      B64URL_ALPHABET[(n >>> 10) & 0x3f] +
      B64URL_ALPHABET[(n >>> 4) & 0x3f] +
      B64URL_ALPHABET[(n << 2) & 0x3f];
  }
  return out;
}

/**
 * Strict Base64URL decoder — rejects any non-Base64URL char, illegal length,
 * or non-zero unused trailing bits cleanly with `null` (never throws).
 */
export function base64UrlToBytes(str: string): Uint8Array | null {
  const len = str.length;
  if (len === 0) return new Uint8Array(0);
  const rem = len & 3;
  if (rem === 1) return null;

  const fullGroups = len >>> 2;
  const outLen = fullGroups * 3 + (rem === 2 ? 1 : rem === 3 ? 2 : 0);
  const out = new Uint8Array(outLen);

  let inIdx = 0;
  let outIdx = 0;
  for (let g = 0; g < fullGroups; g++) {
    const c0 = str.charCodeAt(inIdx++);
    const c1 = str.charCodeAt(inIdx++);
    const c2 = str.charCodeAt(inIdx++);
    const c3 = str.charCodeAt(inIdx++);
    if (c0 > 127 || c1 > 127 || c2 > 127 || c3 > 127) return null;
    const v0 = B64URL_LOOKUP[c0];
    const v1 = B64URL_LOOKUP[c1];
    const v2 = B64URL_LOOKUP[c2];
    const v3 = B64URL_LOOKUP[c3];
    if ((v0 | v1 | v2 | v3) < 0) return null;
    const n = (v0 << 18) | (v1 << 12) | (v2 << 6) | v3;
    out[outIdx++] = (n >>> 16) & 0xff;
    out[outIdx++] = (n >>> 8) & 0xff;
    out[outIdx++] = n & 0xff;
  }

  if (rem === 2) {
    const c0 = str.charCodeAt(inIdx++);
    const c1 = str.charCodeAt(inIdx++);
    if (c0 > 127 || c1 > 127) return null;
    const v0 = B64URL_LOOKUP[c0];
    const v1 = B64URL_LOOKUP[c1];
    if ((v0 | v1) < 0) return null;
    // Bottom 4 bits of v1 are unused padding bits — must be 0!
    if ((v1 & 0x0f) !== 0) return null;
    out[outIdx++] = ((v0 << 2) | (v1 >>> 4)) & 0xff;
  } else if (rem === 3) {
    const c0 = str.charCodeAt(inIdx++);
    const c1 = str.charCodeAt(inIdx++);
    const c2 = str.charCodeAt(inIdx++);
    if (c0 > 127 || c1 > 127 || c2 > 127) return null;
    const v0 = B64URL_LOOKUP[c0];
    const v1 = B64URL_LOOKUP[c1];
    const v2 = B64URL_LOOKUP[c2];
    if ((v0 | v1 | v2) < 0) return null;
    // Bottom 2 bits of v2 are unused padding bits — must be 0!
    if ((v2 & 0x03) !== 0) return null;
    const n = (v0 << 12) | (v1 << 6) | v2;
    out[outIdx++] = (n >>> 10) & 0xff;
    out[outIdx++] = (n >>> 2) & 0xff;
  }

  return out;
}

/**
 * CRC-16/CCITT-FALSE (poly 0x1021, init 0xFFFF) over prefix + binary payload.
 */
export function computeCrc16Ccitt(
  data: Uint8Array,
  prefixBytes?: Uint8Array
): number {
  let crc = 0xffff;
  const feed = (buf: Uint8Array) => {
    for (let i = 0; i < buf.length; i++) {
      crc ^= buf[i] << 8;
      for (let bit = 0; bit < 8; bit++) {
        crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
      }
    }
  };
  if (prefixBytes) feed(prefixBytes);
  feed(data);
  return crc & 0xffff;
}

const WIRE_PREFIX_BYTES = new Uint8Array([0x57, 0x53, 0x44, 0x32]); // "WSD2"

/**
 * Trims a string cleanly on Unicode codepoint boundaries so its UTF-8 byte
 * encoding NEVER exceeds `maxBytes` (never splits surrogate pairs or multi-byte chars).
 */
export function trimUtf8ToMaxBytes(
  input: string,
  maxBytes: number
): { text: string; bytes: Uint8Array } {
  const cleaned = String(input ?? '').trim();
  if (!cleaned || maxBytes <= 0) {
    return { text: '', bytes: new Uint8Array(0) };
  }
  const full = utf8Encoder.encode(cleaned);
  if (full.length <= maxBytes) {
    return { text: cleaned, bytes: full };
  }
  let acc = '';
  let byteLen = 0;
  for (const cp of cleaned) {
    const cpBytes = utf8Encoder.encode(cp);
    if (byteLen + cpBytes.length > maxBytes) break;
    acc += cp;
    byteLen += cpBytes.length;
  }
  const trimmed = acc.trimEnd();
  return { text: trimmed, bytes: utf8Encoder.encode(trimmed) };
}

function trimChars(input: string, maxChars: number): string {
  const cleaned = String(input ?? '').trim();
  if (!cleaned) return '';
  let out = '';
  let count = 0;
  for (const cp of cleaned) {
    if (count >= maxChars) break;
    out += cp;
    count += 1;
  }
  return out.trimEnd();
}

export function utcDateToCode(utcDate: string): number {
  const clean = String(utcDate ?? '').trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return 0;
  const ms = Date.parse(`${clean}T00:00:00Z`);
  if (!Number.isFinite(ms)) return 0;
  const diff = Math.floor((ms - DUEL_DATE_EPOCH_MS) / EPOCH_DAY_MS);
  return clamp(diff, 0, 65535);
}

export function codeToUtcDate(code: number): string {
  const safeCode = clamp(Math.floor(Number(code) || 0), 0, 65535);
  const d = new Date(DUEL_DATE_EPOCH_MS + safeCode * EPOCH_DAY_MS);
  return d.toISOString().slice(0, 10);
}

export function utcDateToBroadcastNumber(utcDate: string): number {
  const clean = String(utcDate ?? '').trim().slice(0, 10);
  const ms = Date.parse(`${clean}T00:00:00Z`);
  if (!Number.isFinite(ms)) return 1;
  return Math.max(1, Math.floor((ms - MERIDIAN_FEED_EPOCH_MS) / EPOCH_DAY_MS) + 1);
}

export function quantizeOverclockTier(charge: number): OverclockTier {
  if (!Number.isFinite(charge) || charge <= 0.05) return 0;
  return clamp(Math.round(charge * 4), 1, 4) as OverclockTier;
}

export function dequantizeOverclockTier(tier: OverclockTier): number {
  const idx = clamp(Math.round(tier), 0, 4) as OverclockTier;
  return OVERCLOCK_TIER_VALUES[idx];
}

export function msToLockTime100ms(ms: number): number {
  return clamp(Math.round((Number(ms) || 0) / 100), 0, MAX_LOCK_TIME_100MS);
}

export function lockTime100msToMs(ticks: number): number {
  return clamp(Math.round(Number(ticks) || 0), 0, MAX_LOCK_TIME_100MS) * 100;
}

function normalizePeelTier(tier: number | undefined): PeelTier {
  if (tier === 2) return 2;
  if (tier === 3) return 3;
  return 1;
}

function normalizeFaction(faction: string | undefined): FactionId {
  if (faction === 'SOVEREIGN' || faction === 'HORIZON' || faction === 'AGORA') {
    return faction;
  }
  return 'AGORA';
}

function normalizeMode(mode: string | undefined): DuelMode {
  if (mode === 'DAILY' || mode === 'BRIEFING' || mode === 'TRIALS') {
    return mode;
  }
  return 'TRIALS';
}

/**
 * Convenience builder: converts a `ScoredQuestionResult` + elapsed time into a compact `DuelQuestionSplit`.
 */
export function createDuelSplitFromResult(
  result: Pick<ScoredQuestionResult, 'peelTier' | 'overclocked' | 'overclockCharge' | 'correct' | 'pointsEarned'>,
  elapsedMs: number
): DuelQuestionSplit {
  return {
    lockTime100ms: msToLockTime100ms(elapsedMs),
    peelTier: normalizePeelTier(result.peelTier),
    overclockTier: result.overclocked ? quantizeOverclockTier(result.overclockCharge) : 0,
    correct: Boolean(result.correct),
    pointsDiv10: clamp(Math.round(Math.max(0, result.pointsEarned) / 10), 0, 65535),
  };
}

/**
 * Resolves a stable canonical topic key for leaderboard & rival persistence lookups.
 */
export function resolveDuelTopicKey(
  payload: Pick<DuelChallengePayload, 'mode' | 'domainId' | 'l1Id' | 'l2Id' | 'utcDate' | 'utcDateCode'>
): string {
  if (payload.mode === 'DAILY') {
    const dateStr =
      payload.utcDate ||
      (payload.utcDateCode > 0 ? codeToUtcDate(payload.utcDateCode) : '');
    return dateStr ? `daily:${dateStr}` : 'daily:global';
  }
  if (payload.l2Id && payload.l2Id.trim().length > 0) {
    return payload.l2Id.trim().toLowerCase();
  }
  if (payload.l1Id && payload.l1Id.trim().length > 0) {
    return payload.l1Id.trim().toLowerCase();
  }
  if (Number.isInteger(payload.domainId) && payload.domainId >= 0 && payload.domainId <= 11) {
    return `domain:${payload.domainId}`;
  }
  return payload.mode === 'TRIALS' ? 'trials:global' : 'global';
}

// ----------------------------------------------------------------------------
// Binary Byte Writer / Reader with ULEB128 & 20/24/32-bit QID Packing
// ----------------------------------------------------------------------------

class BinaryWriter {
  private readonly bytes: number[] = [];

  writeUint8(v: number): void {
    this.bytes.push(v & 0xff);
  }

  writeInt8(v: number): void {
    this.bytes.push(v & 0xff);
  }

  writeUint16(v: number): void {
    const n = v & 0xffff;
    this.bytes.push((n >>> 8) & 0xff, n & 0xff);
  }

  writeUint24(v: number): void {
    const n = v >>> 0;
    this.bytes.push((n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
  }

  writeUint32(v: number): void {
    const n = v >>> 0;
    this.bytes.push((n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff);
  }

  writeVarUint32(v: number): void {
    let n = v >>> 0;
    while (n >= 0x80) {
      this.bytes.push((n & 0x7f) | 0x80);
      n >>>= 7;
    }
    this.bytes.push(n & 0x7f);
  }

  writeBytes(arr: Uint8Array): void {
    for (let i = 0; i < arr.length; i++) {
      this.bytes.push(arr[i]);
    }
  }

  writePacked20Bit(values: readonly number[]): void {
    let bitBuf = 0;
    let bitCount = 0;
    for (let i = 0; i < values.length; i++) {
      const val = values[i] & 0xfffff;
      // Push 20 bits MSB-first in two safe chunks (12 + 8) to stay well within 32-bit SMI
      bitBuf = (bitBuf << 12) | ((val >>> 8) & 0xfff);
      bitCount += 12;
      while (bitCount >= 8) {
        bitCount -= 8;
        this.bytes.push((bitBuf >>> bitCount) & 0xff);
        bitBuf &= (1 << bitCount) - 1;
      }
      bitBuf = (bitBuf << 8) | (val & 0xff);
      bitCount += 8;
      while (bitCount >= 8) {
        bitCount -= 8;
        this.bytes.push((bitBuf >>> bitCount) & 0xff);
        bitBuf &= (1 << bitCount) - 1;
      }
    }
    if (bitCount > 0) {
      this.bytes.push((bitBuf << (8 - bitCount)) & 0xff);
    }
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.bytes);
  }
}

class BinaryReader {
  public offset = 0;
  private readonly view: Uint8Array;
  private readonly end: number;

  constructor(buf: Uint8Array, end = buf.length) {
    this.view = buf;
    this.end = end;
  }

  get remaining(): number {
    return this.end - this.offset;
  }

  readUint8(): number | null {
    if (this.offset + 1 > this.end) return null;
    return this.view[this.offset++];
  }

  readInt8(): number | null {
    const u = this.readUint8();
    if (u === null) return null;
    return u >= 128 ? u - 256 : u;
  }

  readUint16(): number | null {
    if (this.offset + 2 > this.end) return null;
    const hi = this.view[this.offset++];
    const lo = this.view[this.offset++];
    return (hi << 8) | lo;
  }

  readUint24(): number | null {
    if (this.offset + 3 > this.end) return null;
    const b0 = this.view[this.offset++];
    const b1 = this.view[this.offset++];
    const b2 = this.view[this.offset++];
    return ((b0 << 16) | (b1 << 8) | b2) >>> 0;
  }

  readUint32(): number | null {
    if (this.offset + 4 > this.end) return null;
    const b0 = this.view[this.offset++];
    const b1 = this.view[this.offset++];
    const b2 = this.view[this.offset++];
    const b3 = this.view[this.offset++];
    return (((b0 << 24) >>> 0) + ((b1 << 16) | (b2 << 8) | b3)) >>> 0;
  }

  readVarUint32(): number | null {
    let result = 0;
    let shift = 0;
    for (let i = 0; i < 5; i++) {
      const b = this.readUint8();
      if (b === null) return null;
      if (i === 4 && (b & 0xf0) !== 0) return null; // overflow > uint32
      result += (b & 0x7f) * Math.pow(2, shift);
      if ((b & 0x80) === 0) {
        return result >>> 0;
      }
      shift += 7;
    }
    return null;
  }

  readUtf8(byteLen: number): string | null {
    if (byteLen < 0 || this.offset + byteLen > this.end) return null;
    const slice = this.view.subarray(this.offset, this.offset + byteLen);
    this.offset += byteLen;
    try {
      return utf8DecoderStrict.decode(slice);
    } catch {
      return null;
    }
  }

  readPacked20Bit(count: number): number[] | null {
    const totalBits = count * 20;
    const byteLen = Math.ceil(totalBits / 8);
    if (this.offset + byteLen > this.end) return null;
    const slice = this.view.subarray(this.offset, this.offset + byteLen);
    this.offset += byteLen;

    const out: number[] = [];
    let bitPos = 0;
    for (let i = 0; i < count; i++) {
      let val = 0;
      for (let b = 0; b < 20; b++) {
        const byteIdx = bitPos >>> 3;
        const bitIdx = 7 - (bitPos & 7);
        val = (val << 1) | ((slice[byteIdx] >>> bitIdx) & 1);
        bitPos += 1;
      }
      out.push(val >>> 0);
    }
    // Verify any trailing padding bits are strictly 0 (corruption resistance)
    while (bitPos < byteLen * 8) {
      const byteIdx = bitPos >>> 3;
      const bitIdx = 7 - (bitPos & 7);
      if (((slice[byteIdx] >>> bitIdx) & 1) !== 0) return null;
      bitPos += 1;
    }
    return out;
  }
}

// ----------------------------------------------------------------------------
// Core Codec: Encode, Decode (WSD2 + Legacy WSG1 Fallback), URL Builders
// ----------------------------------------------------------------------------

/**
 * Encodes a `DuelChallengePayload` into an ultra-compact URL-safe Base64URL token
 * prefixed with `WSD2` and protected by a CRC-16/CCITT checksum (zero '=', '+', '/').
 * A typical 10-question Daily or Baseball duel encodes to ~125–165 chars!
 */
export function encodeDuelChallenge(payload: DuelChallengePayload): string {
  const mode = normalizeMode(payload.mode);
  const modeCode = MODE_LIST.indexOf(mode);
  const faction = normalizeFaction(payload.faction);
  const factionCode = FACTION_LIST.indexOf(faction);

  const rawQids = Array.isArray(payload.qids) ? payload.qids : [];
  const qCount = Math.min(MAX_DUEL_QUESTIONS, rawQids.length);
  if (qCount < 1) {
    throw new RangeError('encodeDuelChallenge requires between 1 and 15 question IDs.');
  }

  const cleanQids: number[] = [];
  let maxQid = 0;
  for (let i = 0; i < qCount; i++) {
    const q = (Math.floor(Number(rawQids[i]) || 0) >>> 0);
    cleanQids.push(q);
    if (q > maxQid) maxQid = q;
  }

  // Adaptive lossless QID width: 20-bit (covers 1..1,048,575!) -> 24-bit -> 32-bit uint32
  const qidPackMode: 0 | 1 | 2 = maxQid <= 0xfffff ? 0 : maxQid <= 0xffffff ? 1 : 2;

  const rawName = (payload.challengerName ?? '').trim() || 'Challenger';
  const { bytes: nameBytes } = trimUtf8ToMaxBytes(rawName, MAX_CHALLENGER_NAME_BYTES);

  const elo = clamp(Math.round(Number(payload.elo) || 1200), 0, 65535);
  const domainId = clamp(Math.trunc(Number(payload.domainId ?? -1)), -1, 11);

  // Resolve utcDateCode cleanly
  let resolvedDateCode = clamp(Math.floor(Number(payload.utcDateCode) || 0), 0, 65535);
  const hasExplicitDateStr =
    typeof payload.utcDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(payload.utcDate.trim());
  if (resolvedDateCode === 0 && hasExplicitDateStr) {
    resolvedDateCode = utcDateToCode(payload.utcDate!);
  }
  const hasDate = mode === 'DAILY' || resolvedDateCode > 0 || hasExplicitDateStr;

  const l1Clean = (payload.l1Id ?? '').trim();
  const l2Clean = (payload.l2Id ?? '').trim();
  const topicClean = trimChars(payload.topicLabel ?? '', MAX_TOPIC_LABEL_CHARS);

  const hasL1 = l1Clean.length > 0;
  const hasL2 = l2Clean.length > 0;
  const hasTopicLabel = topicClean.length > 0;

  const l1DictIdx = hasL1 ? L1_DICT_MAP.get(l1Clean) : undefined;
  const l2DictIdx = hasL2 ? L2_DICT_MAP.get(l2Clean) : undefined;
  const l1IsDict = l1DictIdx !== undefined;
  const l2IsDict = l2DictIdx !== undefined;

  const writer = new BinaryWriter();

  // Byte 0: flags1 = mode(2b) | faction(2b) | qCount(4b)
  const flags1 = (modeCode & 0x03) | ((factionCode & 0x03) << 2) | ((qCount & 0x0f) << 4);
  writer.writeUint8(flags1);

  // Byte 1: flags2
  const flags2 =
    (hasDate ? 0x01 : 0) |
    (hasL1 ? 0x02 : 0) |
    (hasL2 ? 0x04 : 0) |
    (hasTopicLabel ? 0x08 : 0) |
    (l1IsDict ? 0x10 : 0) |
    (l2IsDict ? 0x20 : 0) |
    ((qidPackMode & 0x03) << 6);
  writer.writeUint8(flags2);

  // Challenger name (len + UTF-8 <= 18 bytes)
  writer.writeUint8(nameBytes.length);
  writer.writeBytes(nameBytes);

  // Elo (uint16) + domainId (int8)
  writer.writeUint16(elo);
  writer.writeInt8(domainId);

  // Optional utcDateCode (uint16)
  if (hasDate) {
    writer.writeUint16(resolvedDateCode);
  }

  // Optional l1Id (1-byte dict index OR length-prefixed UTF-8)
  if (hasL1) {
    if (l1IsDict) {
      writer.writeUint8(l1DictIdx!);
    } else {
      const { bytes } = trimUtf8ToMaxBytes(l1Clean, MAX_RAW_TAXONOMY_ID_BYTES);
      writer.writeUint8(bytes.length);
      writer.writeBytes(bytes);
    }
  }

  // Optional l2Id (1-byte dict index OR length-prefixed UTF-8)
  if (hasL2) {
    if (l2IsDict) {
      writer.writeUint8(l2DictIdx!);
    } else {
      const { bytes } = trimUtf8ToMaxBytes(l2Clean, MAX_RAW_TAXONOMY_ID_BYTES);
      writer.writeUint8(bytes.length);
      writer.writeBytes(bytes);
    }
  }

  // Optional topicLabel (<= 28 chars, UTF-8)
  if (hasTopicLabel) {
    const { bytes } = trimUtf8ToMaxBytes(topicClean, 112);
    writer.writeUint8(bytes.length);
    writer.writeBytes(bytes);
  }

  // Total score (ULEB128 uint32)
  const totalScore = Math.max(0, Math.round(Number(payload.totalScore) || 0)) >>> 0;
  writer.writeVarUint32(totalScore);

  // Question IDs
  if (qidPackMode === 0) {
    writer.writePacked20Bit(cleanQids);
  } else if (qidPackMode === 1) {
    for (const qid of cleanQids) writer.writeUint24(qid);
  } else {
    for (const qid of cleanQids) writer.writeUint32(qid);
  }

  // Per-question Ghost Splits
  const rawSplits = Array.isArray(payload.splits) ? payload.splits : [];
  for (let i = 0; i < qCount; i++) {
    const s = rawSplits[i];
    const lockTime100ms = clamp(Math.round(Number(s?.lockTime100ms ?? 0)), 0, MAX_LOCK_TIME_100MS);
    const peelTier = normalizePeelTier(s?.peelTier);
    const overclockTier = clamp(Math.round(Number(s?.overclockTier ?? 0)), 0, 4) as OverclockTier;
    const correct = Boolean(s?.correct);
    const pointsDiv10 = clamp(Math.round(Number(s?.pointsDiv10 ?? 0)), 0, 65535);
    const ptsMode: 0 | 1 | 2 = pointsDiv10 === 0 ? 0 : pointsDiv10 <= 255 ? 1 : 2;

    writer.writeUint8(lockTime100ms);
    const metaByte =
      (correct ? 0x01 : 0) |
      (((peelTier - 1) & 0x03) << 1) |
      ((overclockTier & 0x07) << 3) |
      ((ptsMode & 0x03) << 6);
    writer.writeUint8(metaByte);
    if (ptsMode === 1) {
      writer.writeUint8(pointsDiv10);
    } else if (ptsMode === 2) {
      writer.writeUint16(pointsDiv10);
    }
  }

  // Append CRC-16/CCITT-FALSE over ["WSD2", ...payloadBytes]
  const payloadBytes = writer.toUint8Array();
  const crc = computeCrc16Ccitt(payloadBytes, WIRE_PREFIX_BYTES);
  const full = new Uint8Array(payloadBytes.length + 2);
  full.set(payloadBytes, 0);
  full[payloadBytes.length] = (crc >>> 8) & 0xff;
  full[payloadBytes.length + 1] = crc & 0xff;

  return `${DUEL_WIRE_PREFIX}${bytesToBase64Url(full)}`;
}

/**
 * Extracts a raw `duel` parameter from a full URL, query string, or hash fragment.
 */
function extractRawDuelTokenFromString(rawInput: string): string {
  const trimmed = rawInput.trim();
  if (!trimmed) return '';

  // Already a direct token?
  if (trimmed.startsWith(DUEL_WIRE_PREFIX) || trimmed.startsWith(LEGACY_GHOST_PREFIX)) {
    return trimmed;
  }

  // Try parsing as a full URL first
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      const fromQuery = u.searchParams.get('duel');
      if (fromQuery) return fromQuery.trim();
      const fromHash = extractParamFromFragment(u.hash, 'duel');
      if (fromHash) return fromHash.trim();
      return '';
    } catch {
      // Fall through to query/hash regex parsing
    }
  }

  // Query or hash fragment string (e.g. '?duel=...', '#duel=...', 'foo=1&duel=...')
  const fromFrag = extractParamFromFragment(trimmed, 'duel');
  return fromFrag ? fromFrag.trim() : trimmed;
}

function extractParamFromFragment(fragment: string, paramName: string): string | null {
  if (!fragment) return null;
  let cleaned = fragment.trim();
  if (cleaned.startsWith('#')) cleaned = cleaned.slice(1);
  // Support hash routes like '#/play?duel=WSD2...'
  const qIdx = cleaned.indexOf('?');
  if (qIdx >= 0) {
    const afterQ = cleaned.slice(qIdx + 1);
    const params = new URLSearchParams(afterQ);
    const hit = params.get(paramName);
    if (hit !== null) return hit;
  }
  const directParams = new URLSearchParams(cleaned);
  return directParams.get(paramName);
}

/**
 * Decodes legacy `WSG1:` JSON/Base64 KineticGhostPackets into a `DuelChallengePayload` fallback.
 */
function decodeLegacyWsg1Fallback(code: string): DuelChallengePayload | null {
  try {
    const trimmed = code.trim();
    if (!trimmed.startsWith(LEGACY_GHOST_PREFIX)) return null;
    const rawBody = trimmed.slice(LEGACY_GHOST_PREFIX.length);
    if (!rawBody) return null;

    let json = rawBody;
    if (!rawBody.startsWith('{')) {
      // Decode standard Base64 or Base64URL safely without relying on Node Buffer
      const normalized = rawBody.replace(/-/g, '+').replace(/_/g, '/');
      const padLen = (4 - (normalized.length % 4)) % 4;
      const padded = normalized + '='.repeat(padLen);
      let binBytes: Uint8Array;
      if (typeof atob === 'function') {
        const binStr = atob(padded);
        binBytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          binBytes[i] = binStr.charCodeAt(i) & 0xff;
        }
      } else {
        const b64url = rawBody.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        const decoded = base64UrlToBytes(b64url);
        if (!decoded) return null;
        binBytes = decoded;
      }
      json = utf8DecoderStrict.decode(binBytes);
    }

    const parsed = JSON.parse(json) as Partial<KineticGhostPacket> | null;
    if (
      !parsed ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.traces) ||
      parsed.traces.length === 0
    ) {
      return null;
    }

    const traces = parsed.traces.slice(0, MAX_DUEL_QUESTIONS);
    const qids: number[] = [];
    const splits: DuelQuestionSplit[] = [];

    for (const tr of traces) {
      if (!tr || typeof tr.qid !== 'number' || !Number.isFinite(tr.qid)) return null;
      const events = Array.isArray(tr.events) ? tr.events : [];
      const lockEv = events.find((e) => e && e.type === 'LOCK');
      qids.push((Math.floor(tr.qid) >>> 0));
      splits.push({
        lockTime100ms: msToLockTime100ms(lockEv?.tMs ?? 6000),
        peelTier: normalizePeelTier(lockEv?.peelTier),
        overclockTier: quantizeOverclockTier(lockEv?.overclockCharge ?? 0),
        correct: Boolean(lockEv?.correct),
        pointsDiv10: clamp(Math.round(Math.max(0, Number(lockEv?.pointsEarned) || 0) / 10), 0, 65535),
      });
    }

    const { text: cleanName } = trimUtf8ToMaxBytes(
      typeof parsed.challengerName === 'string' && parsed.challengerName.trim()
        ? parsed.challengerName
        : 'Ghost Rival',
      MAX_CHALLENGER_NAME_BYTES
    );

    const computedSum = splits.reduce((acc, s) => acc + s.pointsDiv10 * 10, 0);
    const totalScore =
      typeof parsed.totalScore === 'number' && Number.isFinite(parsed.totalScore)
        ? Math.max(0, Math.round(parsed.totalScore)) >>> 0
        : computedSum;

    return {
      version: 1,
      mode: 'TRIALS',
      challengerName: cleanName || 'Ghost Rival',
      faction: normalizeFaction(parsed.faction),
      elo: clamp(Math.round(Number(parsed.elo) || 1200), 0, 65535),
      utcDateCode: 0,
      domainId: -1,
      topicLabel: 'Ghost Trial',
      qids,
      splits,
      totalScore,
    };
  } catch {
    return null;
  }
}

/**
 * Decodes a `WSD2...` token, full `?duel=`/`#duel=` URL, or legacy `WSG1:` Ghost Code
 * into a validated `DuelChallengePayload`. Never throws — any corruption returns `null`.
 */
export function decodeDuelChallenge(tokenOrUrl: string): DuelChallengePayload | null {
  try {
    if (typeof tokenOrUrl !== 'string') return null;
    const token = extractRawDuelTokenFromString(tokenOrUrl);
    if (!token) return null;

    if (token.startsWith(LEGACY_GHOST_PREFIX)) {
      return decodeLegacyWsg1Fallback(token);
    }

    if (!token.startsWith(DUEL_WIRE_PREFIX)) return null;
    const b64Body = token.slice(DUEL_WIRE_PREFIX.length);
    if (!b64Body) return null;

    const full = base64UrlToBytes(b64Body);
    if (!full || full.length < 9) return null;

    const payloadEnd = full.length - 2;
    const payloadBytes = full.subarray(0, payloadEnd);
    const storedCrc = (full[payloadEnd] << 8) | full[payloadEnd + 1];
    const computedCrc = computeCrc16Ccitt(payloadBytes, WIRE_PREFIX_BYTES);
    if (storedCrc !== computedCrc) return null;

    const reader = new BinaryReader(full, payloadEnd);

    const flags1 = reader.readUint8();
    const flags2 = reader.readUint8();
    if (flags1 === null || flags2 === null) return null;

    const modeCode = flags1 & 0x03;
    const factionCode = (flags1 >>> 2) & 0x03;
    const qCount = (flags1 >>> 4) & 0x0f;
    if (modeCode >= MODE_LIST.length || factionCode >= FACTION_LIST.length) return null;
    if (qCount < 1 || qCount > MAX_DUEL_QUESTIONS) return null;

    const hasDate = (flags2 & 0x01) !== 0;
    const hasL1 = (flags2 & 0x02) !== 0;
    const hasL2 = (flags2 & 0x04) !== 0;
    const hasTopicLabel = (flags2 & 0x08) !== 0;
    const l1IsDict = (flags2 & 0x10) !== 0;
    const l2IsDict = (flags2 & 0x20) !== 0;
    const qidPackMode = (flags2 >>> 6) & 0x03;
    if (qidPackMode > 2) return null;

    // Challenger name
    const nameLen = reader.readUint8();
    if (nameLen === null || nameLen > MAX_CHALLENGER_NAME_BYTES) return null;
    const challengerName = reader.readUtf8(nameLen);
    if (challengerName === null) return null;

    // Elo + Domain ID
    const elo = reader.readUint16();
    const domainId = reader.readInt8();
    if (elo === null || domainId === null || domainId < -1 || domainId > 11) return null;

    // Optional utcDateCode
    let utcDateCode = 0;
    let utcDate: string | undefined;
    if (hasDate) {
      const code = reader.readUint16();
      if (code === null) return null;
      utcDateCode = code;
      utcDate = codeToUtcDate(code);
    }

    // Optional l1Id
    let l1Id: string | undefined;
    if (hasL1) {
      if (l1IsDict) {
        const idx = reader.readUint8();
        if (idx === null || idx >= L1_DICT.length) return null;
        l1Id = L1_DICT[idx];
      } else {
        const len = reader.readUint8();
        if (len === null || len === 0 || len > MAX_RAW_TAXONOMY_ID_BYTES) return null;
        const s = reader.readUtf8(len);
        if (s === null) return null;
        l1Id = s;
      }
    }

    // Optional l2Id
    let l2Id: string | undefined;
    if (hasL2) {
      if (l2IsDict) {
        const idx = reader.readUint8();
        if (idx === null || idx >= L2_DICT.length) return null;
        l2Id = L2_DICT[idx];
      } else {
        const len = reader.readUint8();
        if (len === null || len === 0 || len > MAX_RAW_TAXONOMY_ID_BYTES) return null;
        const s = reader.readUtf8(len);
        if (s === null) return null;
        l2Id = s;
      }
    }

    // Optional topicLabel
    let topicLabel: string | undefined;
    if (hasTopicLabel) {
      const len = reader.readUint8();
      if (len === null || len === 0 || len > 112) return null;
      const s = reader.readUtf8(len);
      if (s === null) return null;
      topicLabel = s;
    }

    // Total score (ULEB128 uint32)
    const totalScore = reader.readVarUint32();
    if (totalScore === null) return null;

    // Question IDs
    let qids: number[];
    if (qidPackMode === 0) {
      const unpacked = reader.readPacked20Bit(qCount);
      if (!unpacked) return null;
      qids = unpacked;
    } else if (qidPackMode === 1) {
      qids = [];
      for (let i = 0; i < qCount; i++) {
        const q = reader.readUint24();
        if (q === null) return null;
        qids.push(q);
      }
    } else {
      qids = [];
      for (let i = 0; i < qCount; i++) {
        const q = reader.readUint32();
        if (q === null) return null;
        qids.push(q);
      }
    }

    // Splits
    const splits: DuelQuestionSplit[] = [];
    for (let i = 0; i < qCount; i++) {
      const lockTime100ms = reader.readUint8();
      const metaByte = reader.readUint8();
      if (lockTime100ms === null || metaByte === null || lockTime100ms > MAX_LOCK_TIME_100MS) {
        return null;
      }
      const correct = (metaByte & 0x01) !== 0;
      const peelRaw = (metaByte >>> 1) & 0x03;
      const overclockTier = (metaByte >>> 3) & 0x07;
      const ptsMode = (metaByte >>> 6) & 0x03;
      if (peelRaw > 2 || overclockTier > 4 || ptsMode > 2) return null;

      let pointsDiv10 = 0;
      if (ptsMode === 1) {
        const p8 = reader.readUint8();
        if (p8 === null) return null;
        pointsDiv10 = p8;
      } else if (ptsMode === 2) {
        const p16 = reader.readUint16();
        if (p16 === null) return null;
        pointsDiv10 = p16;
      }

      splits.push({
        lockTime100ms,
        peelTier: (peelRaw + 1) as PeelTier,
        overclockTier: overclockTier as OverclockTier,
        correct,
        pointsDiv10,
      });
    }

    // Strict EOF — reject trailing corrupted bytes
    if (reader.remaining !== 0) return null;

    const result: DuelChallengePayload = {
      version: 2,
      mode: MODE_LIST[modeCode],
      challengerName: challengerName || 'Challenger',
      faction: FACTION_LIST[factionCode],
      elo,
      utcDateCode,
      domainId,
      qids,
      splits,
      totalScore,
    };
    if (utcDate !== undefined) result.utcDate = utcDate;
    if (l1Id !== undefined) result.l1Id = l1Id;
    if (l2Id !== undefined) result.l2Id = l2Id;
    if (topicLabel !== undefined) result.topicLabel = topicLabel;

    return result;
  } catch {
    return null;
  }
}

/**
 * Builds a clean one-tap shareable URL (`https://.../?duel=WSD2...`) with zero URL-unsafe chars.
 */
export function buildShareableDuelUrl(
  payload: DuelChallengePayload,
  baseHref?: string
): string {
  const token = encodeDuelChallenge(payload);
  const rawBase =
    (typeof baseHref === 'string' && baseHref.trim()) ||
    (typeof window !== 'undefined' && window.location?.href) ||
    'https://worldssmartest.app/';

  try {
    const url = new URL(rawBase);
    url.searchParams.set('duel', token);
    // Clear stale #duel=... fragment if present so query & hash never conflict
    if (url.hash && /(^|[#?&])duel=/.test(url.hash)) {
      url.hash = '';
    }
    return url.toString();
  } catch {
    // Graceful support for relative baseHref (e.g. './index.html' or '/')
    const [withoutHash] = rawBase.split('#');
    const [pathPart, queryPart] = withoutHash.split('?');
    const params = new URLSearchParams(queryPart ?? '');
    params.set('duel', token);
    return `${pathPart || '/'}?${params.toString()}`;
  }
}

/**
 * Extracts and decodes a `?duel=...` or `#duel=...` challenge directly from
 * `window.location` (or explicitly provided `search` / `hash` strings). Never throws.
 */
export function extractDuelParamFromLocation(
  search?: string,
  hash?: string
): DuelChallengePayload | null {
  try {
    const explicitMode = search !== undefined || hash !== undefined;
    const effSearch = explicitMode
      ? search ?? ''
      : typeof window !== 'undefined' && window.location
        ? window.location.search ?? ''
        : '';
    const effHash = explicitMode
      ? hash ?? ''
      : typeof window !== 'undefined' && window.location
        ? window.location.hash ?? ''
        : '';

    if (effSearch) {
      const fromSearch = extractParamFromFragment(effSearch, 'duel');
      if (fromSearch) {
        const decoded = decodeDuelChallenge(fromSearch);
        if (decoded) return decoded;
      }
    }
    if (effHash) {
      const fromHash = extractParamFromFragment(effHash, 'duel');
      if (fromHash) {
        const decoded = decodeDuelChallenge(fromHash);
        if (decoded) return decoded;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// Seamless Bridge: DuelChallengePayload <-> KineticGhostPacket (3D Replay)
// ----------------------------------------------------------------------------

/**
 * Converts a compact `DuelChallengePayload` into a 3D `KineticGhostPacket` so
 * `CouncilTrialsGhostMode` can replay ANY `?duel=WSD2...` friend link live in 3D!
 */
export function duelChallengeToKineticGhostPacket(
  payload: DuelChallengePayload
): KineticGhostPacket {
  const seedBase = fnv1a32(
    `${payload.challengerName}|${payload.mode}|${payload.totalScore}|${payload.qids.join(',')}`
  );
  const traces: KineticQuestionTrace[] = payload.qids.map((qid, idx) => {
    const split = payload.splits[idx];
    const lockMs = Math.max(400, lockTime100msToMs(split?.lockTime100ms ?? 60));
    const peelTier = normalizePeelTier(split?.peelTier);
    const overclockCharge = dequantizeOverclockTier(split?.overclockTier ?? 0);
    const correct = Boolean(split?.correct);
    const pointsEarned = (split?.pointsDiv10 ?? 0) * 10;

    const events: KineticGhostEvent[] = [];
    const rng = createMulberry32((seedBase ^ Math.imul(qid + 1, 0x9e3779b1) ^ idx) >>> 0);

    // 2 deterministic kinetic prism spins leading toward lock
    events.push({
      tMs: Math.max(150, Math.round(lockMs * 0.25)),
      type: 'SPIN',
      facetIndex: Math.floor(rng() * 4),
    });
    events.push({
      tMs: Math.max(280, Math.round(lockMs * 0.52)),
      type: 'SPIN',
      facetIndex: Math.floor(rng() * 4),
    });

    if (peelTier >= 2) {
      events.push({
        tMs: Math.max(220, Math.round(lockMs * 0.42)),
        type: 'PEEL',
        peelTier: 2,
      });
    }
    if (peelTier === 3) {
      events.push({
        tMs: Math.max(340, Math.round(lockMs * 0.64)),
        type: 'PEEL',
        peelTier: 3,
      });
    }
    if (overclockCharge > 0) {
      const chargeMs = Math.round(overclockCharge * 950);
      events.push({
        tMs: Math.max(200, lockMs - chargeMs),
        type: 'OVERCLOCK_START',
      });
    }

    events.push({
      tMs: lockMs,
      type: 'LOCK',
      facetIndex: Math.floor(rng() * 4),
      peelTier,
      overclockCharge,
      correct,
      pointsEarned,
    });
    events.sort((a, b) => a.tMs - b.tMs);
    return { qid, events };
  });

  const actorByFaction: Record<FactionId, 'vance' | 'soren' | 'nadia'> = {
    SOVEREIGN: 'vance',
    HORIZON: 'soren',
    AGORA: 'nadia',
  };

  return {
    version: 1,
    challengerName: payload.challengerName,
    faction: payload.faction,
    countryCode: 'CH',
    elo: payload.elo,
    portraitActorId: actorByFaction[payload.faction],
    seed: seedBase,
    totalScore: payload.totalScore,
    traces,
  };
}

/**
 * Converts a `KineticGhostPacket` into a compact `DuelChallengePayload` ready for `?duel=WSD2...`.
 */
export function kineticGhostPacketToDuelChallenge(
  packet: KineticGhostPacket,
  opts?: {
    mode?: DuelMode;
    domainId?: number;
    l1Id?: string;
    l2Id?: string;
    topicLabel?: string;
    utcDate?: string;
  }
): DuelChallengePayload {
  const traces = packet.traces.slice(0, MAX_DUEL_QUESTIONS);
  const qids: number[] = [];
  const splits: DuelQuestionSplit[] = [];

  for (const tr of traces) {
    const lockEv = tr.events.find((e) => e.type === 'LOCK');
    qids.push(tr.qid >>> 0);
    splits.push({
      lockTime100ms: msToLockTime100ms(lockEv?.tMs ?? 6000),
      peelTier: normalizePeelTier(lockEv?.peelTier),
      overclockTier: quantizeOverclockTier(lockEv?.overclockCharge ?? 0),
      correct: Boolean(lockEv?.correct),
      pointsDiv10: clamp(Math.round((lockEv?.pointsEarned ?? 0) / 10), 0, 65535),
    });
  }

  const utcDateCode = opts?.utcDate ? utcDateToCode(opts.utcDate) : 0;
  return {
    version: 2,
    mode: opts?.mode ?? 'TRIALS',
    challengerName: trimUtf8ToMaxBytes(packet.challengerName, MAX_CHALLENGER_NAME_BYTES).text || 'Challenger',
    faction: normalizeFaction(packet.faction),
    elo: clamp(Math.round(packet.elo || 1200), 0, 65535),
    utcDateCode,
    utcDate: opts?.utcDate,
    domainId: clamp(Math.trunc(opts?.domainId ?? -1), -1, 11),
    l1Id: opts?.l1Id,
    l2Id: opts?.l2Id,
    topicLabel: opts?.topicLabel ? trimChars(opts.topicLabel, MAX_TOPIC_LABEL_CHARS) : 'Ghost Duel',
    qids,
    splits,
    totalScore: Math.max(0, Math.round(packet.totalScore || 0)) >>> 0,
  };
}

// ----------------------------------------------------------------------------
// Live Head-to-Head Split Tracker (`DuelRaceTracker`)
// ----------------------------------------------------------------------------

export interface DuelSplitComparison {
  qIndex: number;
  qid: number;
  challengerSplitPts: number;
  challengerCumulativePts: number;
  challengerLockMs: number;
  challengerPeelTier: PeelTier;
  challengerOverclockTier: OverclockTier;
  challengerCorrect: boolean;
  playerSplitPts: number;
  playerCumulativePts: number;
  playerElapsedMs: number;
  deltaSplitPts: number;
  deltaCumulativePts: number;
  deltaLockMs: number;
  leader: DuelLeader;
}

export interface DuelFinalSummaryInput {
  playerName?: string;
  playerFaction?: FactionId;
  playerElo?: number;
  playerTotalScore?: number;
  playerCorrectCount?: number;
  playerSplits?: ReadonlyArray<DuelQuestionSplit>;
  baseHref?: string;
}

export interface DuelHeadToHeadSummary {
  mode: DuelMode;
  topicKey: string;
  topicLabel: string;
  utcDate?: string;
  challengerName: string;
  challengerFaction: FactionId;
  challengerElo: number;
  challengerScore: number;
  challengerCorrectCount: number;
  playerName: string;
  playerFaction: FactionId;
  playerElo: number;
  playerScore: number;
  playerCorrectCount: number;
  totalQuestions: number;
  deltaScore: number;
  winner: DuelLeader;
  playerWon: boolean;
  tied: boolean;
  splitsWonByPlayer: number;
  splitsWonByChallenger: number;
  splitsTied: number;
  fastestPlayerLockMs: number | null;
  fastestChallengerLockMs: number | null;
  splitBreakdown: DuelSplitComparison[];
  rematchPayload: DuelChallengePayload;
  rematchToken: string;
  rematchUrl: string;
  headline: string;
  shareCaption: string;
}

export class DuelRaceTracker {
  private readonly challenge: DuelChallengePayload;
  private readonly defaultPlayerName: string;
  private readonly challengerCumulativeByIndex: number[];
  private readonly recordedComparisons = new Map<number, DuelSplitComparison>();
  private readonly recordedPlayerSplits = new Map<number, DuelQuestionSplit>();

  constructor(challenge: DuelChallengePayload, playerName = 'You') {
    this.challenge = challenge;
    this.defaultPlayerName = playerName.trim() || 'You';

    // Precompute challenger cumulative score trajectory
    this.challengerCumulativeByIndex = [];
    let running = 0;
    for (let i = 0; i < challenge.qids.length; i++) {
      running += (challenge.splits[i]?.pointsDiv10 ?? 0) * 10;
      this.challengerCumulativeByIndex.push(running);
    }
    // Snap final cumulative to exact payload.totalScore if within quantization tolerance
    const lastIdx = this.challengerCumulativeByIndex.length - 1;
    if (
      lastIdx >= 0 &&
      Math.abs(challenge.totalScore - running) <= challenge.qids.length * 10
    ) {
      this.challengerCumulativeByIndex[lastIdx] = challenge.totalScore;
    }
  }

  public getChallenge(): DuelChallengePayload {
    return this.challenge;
  }

  public getTotalQuestions(): number {
    return this.challenge.qids.length;
  }

  public getChallengerTotalScore(): number {
    return this.challenge.totalScore;
  }

  public getChallengerSplit(qIndex: number): DuelQuestionSplit | null {
    return this.challenge.splits[qIndex] ?? null;
  }

  public getChallengerCumulativeAt(qIndex: number): number {
    if (this.challengerCumulativeByIndex.length === 0) return 0;
    const clampedIdx = clamp(Math.floor(qIndex), 0, this.challengerCumulativeByIndex.length - 1);
    return this.challengerCumulativeByIndex[clampedIdx];
  }

  /**
   * Computes a live head-to-head split comparison at question `qIndex`.
   */
  public getSplitComparison(
    qIndex: number,
    playerPts: number,
    playerCumulativePts: number,
    playerElapsedMs = 0
  ): DuelSplitComparison {
    const safeIdx = clamp(Math.floor(qIndex), 0, Math.max(0, this.challenge.qids.length - 1));
    const split = this.challenge.splits[safeIdx];
    const qid = this.challenge.qids[safeIdx] ?? 0;

    const challengerSplitPts = (split?.pointsDiv10 ?? 0) * 10;
    const challengerCumulativePts = this.challengerCumulativeByIndex[safeIdx] ?? 0;
    const challengerLockMs = lockTime100msToMs(split?.lockTime100ms ?? 0);

    const cleanPlayerPts = Math.max(0, Math.round(Number(playerPts) || 0));
    const cleanPlayerCum = Math.max(0, Math.round(Number(playerCumulativePts) || 0));
    const cleanPlayerMs = Math.max(0, Math.round(Number(playerElapsedMs) || 0));

    const deltaSplitPts = cleanPlayerPts - challengerSplitPts;
    const deltaCumulativePts = cleanPlayerCum - challengerCumulativePts;
    const deltaLockMs = cleanPlayerMs - challengerLockMs;

    const leader: DuelLeader =
      deltaCumulativePts > 0
        ? 'PLAYER'
        : deltaCumulativePts < 0
          ? 'CHALLENGER'
          : 'TIED';

    return {
      qIndex: safeIdx,
      qid,
      challengerSplitPts,
      challengerCumulativePts,
      challengerLockMs,
      challengerPeelTier: normalizePeelTier(split?.peelTier),
      challengerOverclockTier: (split?.overclockTier ?? 0) as OverclockTier,
      challengerCorrect: Boolean(split?.correct),
      playerSplitPts: cleanPlayerPts,
      playerCumulativePts: cleanPlayerCum,
      playerElapsedMs: cleanPlayerMs,
      deltaSplitPts,
      deltaCumulativePts,
      deltaLockMs,
      leader,
    };
  }

  /**
   * Records the player's completed split for `qIndex` and returns the live comparison.
   */
  public recordPlayerSplit(
    qIndex: number,
    playerPts: number,
    playerCumulativePts: number,
    playerElapsedMs: number,
    meta?: { correct?: boolean; peelTier?: PeelTier; overclockCharge?: number }
  ): DuelSplitComparison {
    const comp = this.getSplitComparison(qIndex, playerPts, playerCumulativePts, playerElapsedMs);
    this.recordedComparisons.set(comp.qIndex, comp);
    this.recordedPlayerSplits.set(comp.qIndex, {
      lockTime100ms: msToLockTime100ms(playerElapsedMs),
      peelTier: normalizePeelTier(meta?.peelTier),
      overclockTier: quantizeOverclockTier(meta?.overclockCharge ?? 0),
      correct: meta?.correct !== undefined ? Boolean(meta.correct) : comp.playerSplitPts > 0,
      pointsDiv10: clamp(Math.round(comp.playerSplitPts / 10), 0, 65535),
    });
    return comp;
  }

  /**
   * Builds the complete end-of-match head-to-head summary + one-tap Rematch URL!
   */
  public buildFinalHeadToHeadSummary(
    input: DuelFinalSummaryInput = {}
  ): DuelHeadToHeadSummary {
    const totalQuestions = this.challenge.qids.length;
    const playerName = (input.playerName ?? this.defaultPlayerName).trim() || 'You';
    const playerFaction = normalizeFaction(input.playerFaction);
    const playerElo = clamp(Math.round(Number(input.playerElo) || 1200), 0, 65535);

    const playerSplits: DuelQuestionSplit[] = [];
    const splitBreakdown: DuelSplitComparison[] = [];

    let runningPlayer = 0;
    for (let i = 0; i < totalQuestions; i++) {
      const provided = input.playerSplits?.[i];
      const recordedSplit = this.recordedPlayerSplits.get(i);
      const recordedComp = this.recordedComparisons.get(i);

      if (provided) {
        const pts = provided.pointsDiv10 * 10;
        runningPlayer += pts;
        playerSplits.push(provided);
        splitBreakdown.push(
          this.getSplitComparison(
            i,
            pts,
            runningPlayer,
            lockTime100msToMs(provided.lockTime100ms)
          )
        );
      } else if (recordedComp && recordedSplit) {
        runningPlayer = recordedComp.playerCumulativePts;
        playerSplits.push(recordedSplit);
        splitBreakdown.push(recordedComp);
      } else {
        const zeroSplit: DuelQuestionSplit = {
          lockTime100ms: 0,
          peelTier: 1,
          overclockTier: 0,
          correct: false,
          pointsDiv10: 0,
        };
        playerSplits.push(zeroSplit);
        splitBreakdown.push(this.getSplitComparison(i, 0, runningPlayer, 0));
      }
    }

    const playerScore =
      input.playerTotalScore !== undefined
        ? Math.max(0, Math.round(input.playerTotalScore))
        : runningPlayer;
    const challengerScore = this.challenge.totalScore;
    const deltaScore = playerScore - challengerScore;
    const winner: DuelLeader =
      deltaScore > 0 ? 'PLAYER' : deltaScore < 0 ? 'CHALLENGER' : 'TIED';

    const playerCorrectCount =
      input.playerCorrectCount !== undefined
        ? clamp(Math.round(input.playerCorrectCount), 0, totalQuestions)
        : playerSplits.filter((s) => s.correct).length;
    const challengerCorrectCount = this.challenge.splits.filter((s) => s.correct).length;

    let splitsWonByPlayer = 0;
    let splitsWonByChallenger = 0;
    let splitsTied = 0;
    let fastestPlayerLockMs: number | null = null;
    let fastestChallengerLockMs: number | null = null;

    for (const row of splitBreakdown) {
      if (row.deltaSplitPts > 0) splitsWonByPlayer += 1;
      else if (row.deltaSplitPts < 0) splitsWonByChallenger += 1;
      else splitsTied += 1;

      if (row.playerSplitPts > 0 && row.playerElapsedMs > 0) {
        fastestPlayerLockMs =
          fastestPlayerLockMs === null
            ? row.playerElapsedMs
            : Math.min(fastestPlayerLockMs, row.playerElapsedMs);
      }
      if (row.challengerCorrect && row.challengerLockMs > 0) {
        fastestChallengerLockMs =
          fastestChallengerLockMs === null
            ? row.challengerLockMs
            : Math.min(fastestChallengerLockMs, row.challengerLockMs);
      }
    }

    const topicKey = resolveDuelTopicKey(this.challenge);
    const topicLabel =
      this.challenge.topicLabel ||
      formatTopicKeyLabel(topicKey, this.challenge.domainId, this.challenge.utcDate);

    // Build instant counter-challenge payload using the exact same QIDs with player's splits
    const rematchPayload: DuelChallengePayload = {
      version: 2,
      mode: this.challenge.mode,
      challengerName: trimUtf8ToMaxBytes(playerName, MAX_CHALLENGER_NAME_BYTES).text || 'Challenger',
      faction: playerFaction,
      elo: playerElo,
      utcDateCode: this.challenge.utcDateCode,
      utcDate: this.challenge.utcDate,
      domainId: this.challenge.domainId,
      l1Id: this.challenge.l1Id,
      l2Id: this.challenge.l2Id,
      topicLabel: trimChars(topicLabel, MAX_TOPIC_LABEL_CHARS),
      qids: [...this.challenge.qids],
      splits: playerSplits,
      totalScore: playerScore,
    };
    const rematchToken = encodeDuelChallenge(rematchPayload);
    const rematchUrl = buildShareableDuelUrl(rematchPayload, input.baseHref);

    const playerFmt = playerScore.toLocaleString('en-US');
    const rivalFmt = challengerScore.toLocaleString('en-US');
    const marginFmt = Math.abs(deltaScore).toLocaleString('en-US');

    const headline =
      winner === 'PLAYER'
        ? `VICTORY OVER ${this.challenge.challengerName.toUpperCase()} (+${marginFmt} PTS)`
        : winner === 'CHALLENGER'
          ? `${this.challenge.challengerName.toUpperCase()} HELD THE LINE (-${marginFmt} PTS)`
          : `DEAD HEAT WITH ${this.challenge.challengerName.toUpperCase()} (${playerFmt} PTS)`;

    const shareCaption = `${playerName} ${playerFmt} PTS vs ${this.challenge.challengerName} ${rivalFmt} PTS · ${topicLabel} (${totalQuestions}Q Duel)`;

    return {
      mode: this.challenge.mode,
      topicKey,
      topicLabel,
      utcDate: this.challenge.utcDate,
      challengerName: this.challenge.challengerName,
      challengerFaction: this.challenge.faction,
      challengerElo: this.challenge.elo,
      challengerScore,
      challengerCorrectCount,
      playerName,
      playerFaction,
      playerElo,
      playerScore,
      playerCorrectCount,
      totalQuestions,
      deltaScore,
      winner,
      playerWon: winner === 'PLAYER',
      tied: winner === 'TIED',
      splitsWonByPlayer,
      splitsWonByChallenger,
      splitsTied,
      fastestPlayerLockMs,
      fastestChallengerLockMs,
      splitBreakdown,
      rematchPayload,
      rematchToken,
      rematchUrl,
      headline,
      shareCaption,
    };
  }
}

// ----------------------------------------------------------------------------
// Persisted Friend Duels & Rematch History Store (`ws_duel_rivals_v2`)
// ----------------------------------------------------------------------------

export interface DuelFriendRecord {
  id: string;
  name: string;
  faction: FactionId;
  elo: number;
  winsAgainstPlayer: number;
  lossesAgainstPlayer: number;
  tiesWithPlayer: number;
  totalDuels: number;
  lastPlayedIso: string;
  bestScoreOverall: number;
  dailyScoresByDate: Record<string, number>;
  topicScoresByKey: Record<string, number>;
  lastChallengeToken?: string;
}

export interface DuelHistoryEntry {
  id: string;
  timestampIso: string;
  mode: DuelMode;
  topicKey: string;
  topicLabel: string;
  utcDate?: string;
  challengerName: string;
  challengerFaction: FactionId;
  challengerElo: number;
  challengerScore: number;
  playerName: string;
  playerScore: number;
  winner: DuelLeader;
  totalQuestions: number;
  challengeToken: string;
  rematchToken?: string;
}

export interface DuelLeaderboardFriend {
  name: string;
  score: number;
  faction?: FactionId;
  elo?: number;
  countryCode?: string;
  challengeToken?: string;
  h2hRecordLabel?: string;
}

interface PersistedRivalsState {
  version: 2;
  rivalsById: Record<string, DuelFriendRecord>;
  history: DuelHistoryEntry[];
}

export type MinimalStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const MAX_DUEL_HISTORY_ENTRIES = 50;

function makeRivalId(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

export class DuelRivalsStore {
  private readonly storageKey: string;
  private readonly explicitStorage: MinimalStorage | null | undefined;
  private state: PersistedRivalsState;

  constructor(
    storage?: MinimalStorage | null,
    storageKey = DUEL_RIVALS_STORAGE_KEY
  ) {
    this.storageKey = storageKey;
    this.explicitStorage = storage;
    this.state = this.load();
  }

  private getActiveStorage(): MinimalStorage | null {
    if (this.explicitStorage !== undefined) return this.explicitStorage;
    try {
      if (typeof globalThis !== 'undefined' && 'localStorage' in globalThis) {
        const ls = (globalThis as { localStorage?: MinimalStorage }).localStorage;
        if (ls && typeof ls.getItem === 'function' && typeof ls.setItem === 'function') {
          return ls;
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  private load(): PersistedRivalsState {
    const empty: PersistedRivalsState = { version: 2, rivalsById: {}, history: [] };
    try {
      const store = this.getActiveStorage();
      if (!store) return empty;
      const raw = store.getItem(this.storageKey);
      if (!raw) return empty;
      const parsed = JSON.parse(raw) as Partial<PersistedRivalsState> | null;
      if (!parsed || typeof parsed !== 'object') return empty;
      return {
        version: 2,
        rivalsById:
          parsed.rivalsById && typeof parsed.rivalsById === 'object'
            ? parsed.rivalsById
            : {},
        history: Array.isArray(parsed.history) ? parsed.history.slice(0, MAX_DUEL_HISTORY_ENTRIES) : [],
      };
    } catch {
      return empty;
    }
  }

  private save(): void {
    try {
      const store = this.getActiveStorage();
      if (store) {
        store.setItem(this.storageKey, JSON.stringify(this.state));
      }
    } catch {
      // Ignore storage quota / private-mode errors
    }
  }

  public reload(): void {
    if (this.getActiveStorage()) {
      this.state = this.load();
    }
  }

  /**
   * Records an incoming `?duel=` friend challenge so their score appears on
   * Daily/Subcategory leaderboards immediately even before rematch finishes.
   */
  public recordIncomingChallenger(
    payload: DuelChallengePayload,
    challengeToken?: string,
    nowIso = new Date().toISOString()
  ): DuelFriendRecord {
    const cleanName = payload.challengerName.trim() || 'Challenger';
    const id = makeRivalId(cleanName);
    const existing = this.state.rivalsById[id];
    const topicKey = resolveDuelTopicKey(payload);
    const utcDate =
      payload.utcDate ||
      (payload.mode === 'DAILY' && payload.utcDateCode >= 0
        ? codeToUtcDate(payload.utcDateCode)
        : undefined);

    const record: DuelFriendRecord = existing
      ? {
          ...existing,
          name: cleanName,
          faction: normalizeFaction(payload.faction),
          elo: clamp(Math.round(payload.elo || existing.elo), 0, 65535),
          lastPlayedIso: nowIso,
          bestScoreOverall: Math.max(existing.bestScoreOverall, payload.totalScore),
          dailyScoresByDate: { ...existing.dailyScoresByDate },
          topicScoresByKey: { ...existing.topicScoresByKey },
          lastChallengeToken: challengeToken ?? existing.lastChallengeToken,
        }
      : {
          id,
          name: cleanName,
          faction: normalizeFaction(payload.faction),
          elo: clamp(Math.round(payload.elo || 1200), 0, 65535),
          winsAgainstPlayer: 0,
          lossesAgainstPlayer: 0,
          tiesWithPlayer: 0,
          totalDuels: 0,
          lastPlayedIso: nowIso,
          bestScoreOverall: payload.totalScore,
          dailyScoresByDate: {},
          topicScoresByKey: {},
          lastChallengeToken: challengeToken,
        };

    if (utcDate && payload.mode === 'DAILY') {
      record.dailyScoresByDate[utcDate] = Math.max(
        record.dailyScoresByDate[utcDate] ?? 0,
        payload.totalScore
      );
    }
    record.topicScoresByKey[topicKey] = Math.max(
      record.topicScoresByKey[topicKey] ?? 0,
      payload.totalScore
    );

    this.state.rivalsById[id] = record;
    this.save();
    return record;
  }

  /**
   * Persists a completed head-to-head duel result and updates W-L-T rival stats + rematch history.
   */
  public recordCompletedDuel(
    summary: DuelHeadToHeadSummary,
    originalChallengeToken?: string,
    nowIso = new Date().toISOString()
  ): DuelHistoryEntry {
    const cleanName = summary.challengerName.trim() || 'Challenger';
    const id = makeRivalId(cleanName);
    const existing = this.state.rivalsById[id];

    const record: DuelFriendRecord = existing
      ? {
          ...existing,
          name: cleanName,
          faction: summary.challengerFaction,
          elo: summary.challengerElo,
          lastPlayedIso: nowIso,
          bestScoreOverall: Math.max(existing.bestScoreOverall, summary.challengerScore),
          dailyScoresByDate: { ...existing.dailyScoresByDate },
          topicScoresByKey: { ...existing.topicScoresByKey },
          lastChallengeToken: originalChallengeToken ?? existing.lastChallengeToken,
        }
      : {
          id,
          name: cleanName,
          faction: summary.challengerFaction,
          elo: summary.challengerElo,
          winsAgainstPlayer: 0,
          lossesAgainstPlayer: 0,
          tiesWithPlayer: 0,
          totalDuels: 0,
          lastPlayedIso: nowIso,
          bestScoreOverall: summary.challengerScore,
          dailyScoresByDate: {},
          topicScoresByKey: {},
          lastChallengeToken: originalChallengeToken,
        };

    record.totalDuels += 1;
    if (summary.winner === 'PLAYER') {
      record.lossesAgainstPlayer += 1;
    } else if (summary.winner === 'CHALLENGER') {
      record.winsAgainstPlayer += 1;
    } else {
      record.tiesWithPlayer += 1;
    }

    if (summary.mode === 'DAILY' && summary.utcDate) {
      record.dailyScoresByDate[summary.utcDate] = Math.max(
        record.dailyScoresByDate[summary.utcDate] ?? 0,
        summary.challengerScore
      );
    }
    record.topicScoresByKey[summary.topicKey] = Math.max(
      record.topicScoresByKey[summary.topicKey] ?? 0,
      summary.challengerScore
    );

    this.state.rivalsById[id] = record;

    const entry: DuelHistoryEntry = {
      id: `duel_${Date.now().toString(36)}_${this.state.history.length + 1}`,
      timestampIso: nowIso,
      mode: summary.mode,
      topicKey: summary.topicKey,
      topicLabel: summary.topicLabel,
      utcDate: summary.utcDate,
      challengerName: cleanName,
      challengerFaction: summary.challengerFaction,
      challengerElo: summary.challengerElo,
      challengerScore: summary.challengerScore,
      playerName: summary.playerName,
      playerScore: summary.playerScore,
      winner: summary.winner,
      totalQuestions: summary.totalQuestions,
      challengeToken: originalChallengeToken ?? summary.rematchToken,
      rematchToken: summary.rematchToken,
    };

    this.state.history.unshift(entry);
    if (this.state.history.length > MAX_DUEL_HISTORY_ENTRIES) {
      this.state.history.length = MAX_DUEL_HISTORY_ENTRIES;
    }

    this.save();
    return entry;
  }

  public getRivals(): DuelFriendRecord[] {
    return Object.values(this.state.rivalsById).sort((a, b) =>
      b.lastPlayedIso.localeCompare(a.lastPlayedIso)
    );
  }

  public getRivalByName(name: string): DuelFriendRecord | null {
    return this.state.rivalsById[makeRivalId(name)] ?? null;
  }

  public getHistory(limit = 20): DuelHistoryEntry[] {
    return this.state.history.slice(0, Math.max(0, limit));
  }

  public getFriendsForDaily(utcDate: string): DuelLeaderboardFriend[] {
    const cleanDate = utcDate.trim().slice(0, 10);
    const out: DuelLeaderboardFriend[] = [];
    for (const r of Object.values(this.state.rivalsById)) {
      const score = r.dailyScoresByDate[cleanDate];
      if (typeof score === 'number' && score > 0) {
        out.push({
          name: r.name,
          score,
          faction: r.faction,
          elo: r.elo,
          challengeToken: r.lastChallengeToken,
          h2hRecordLabel:
            r.totalDuels > 0
              ? `${r.lossesAgainstPlayer}W-${r.winsAgainstPlayer}L${r.tiesWithPlayer ? `-${r.tiesWithPlayer}T` : ''}`
              : 'DUEL RIVAL',
        });
      }
    }
    return out;
  }

  public getFriendsForTopic(topicKey: string): DuelLeaderboardFriend[] {
    const normKey = topicKey.trim().toLowerCase();
    const altKeys: string[] = [normKey];
    if (normKey.startsWith('sports_')) {
      altKeys.push(normKey.slice('sports_'.length));
    } else if (normKey && !normKey.includes(':')) {
      altKeys.push(`sports_${normKey}`);
    }
    const out: DuelLeaderboardFriend[] = [];
    for (const r of Object.values(this.state.rivalsById)) {
      let direct: number | undefined;
      for (const k of altKeys) {
        const val = r.topicScoresByKey[k];
        if (typeof val === 'number' && val > 0) {
          direct = direct !== undefined ? Math.max(direct, val) : val;
        }
      }
      const fallback = normKey === 'global' || normKey === 'trials:global' ? r.bestScoreOverall : undefined;
      const score = direct ?? fallback;
      if (typeof score === 'number' && score > 0) {
        out.push({
          name: r.name,
          score,
          faction: r.faction,
          elo: r.elo,
          challengeToken: r.lastChallengeToken,
          h2hRecordLabel:
            r.totalDuels > 0
              ? `${r.lossesAgainstPlayer}W-${r.winsAgainstPlayer}L${r.tiesWithPlayer ? `-${r.tiesWithPlayer}T` : ''}`
              : 'DUEL RIVAL',
        });
      }
    }
    return out;
  }

  public getRecordSummary(): {
    totalDuels: number;
    wins: number;
    losses: number;
    ties: number;
    uniqueRivals: number;
  } {
    let wins = 0;
    let losses = 0;
    let ties = 0;
    const rivals = Object.values(this.state.rivalsById);
    for (const r of rivals) {
      wins += r.lossesAgainstPlayer;
      losses += r.winsAgainstPlayer;
      ties += r.tiesWithPlayer;
    }
    return {
      totalDuels: wins + losses + ties,
      wins,
      losses,
      ties,
      uniqueRivals: rivals.length,
    };
  }

  public clear(): void {
    this.state = { version: 2, rivalsById: {}, history: [] };
    try {
      this.getActiveStorage()?.removeItem(this.storageKey);
    } catch {
      // Ignore storage errors
    }
  }
}

export const duelRivalsStore = new DuelRivalsStore();

// ----------------------------------------------------------------------------
// Deterministic Global Contender Cohort Leaderboard Builder (Median ~19,500)
// ----------------------------------------------------------------------------

export interface LeaderboardContenderEntry {
  rank: number;
  id: string;
  handle: string;
  countryCode: string;
  faction: FactionId;
  elo: number;
  score: number;
  scoreFormatted: string;
  percentile: number;
  kind: 'PLAYER' | 'FRIEND' | 'COHORT';
  isPlayer: boolean;
  isFriend: boolean;
  tag: string;
  challengeToken?: string;
}

export interface LeaderboardCohortSnapshot {
  scope: 'DAILY' | 'SUBCATEGORY';
  scopeKey: string;
  title: string;
  utcDate: string;
  cohortSize: number;
  totalEntries: number;
  medianScore: number;
  playerRank: number;
  playerPercentile: number;
  topPercentBanner: string;
  friendCount: number;
  entries: LeaderboardContenderEntry[];
  top20: LeaderboardContenderEntry[];
  playerEntry: LeaderboardContenderEntry;
}

interface InternationalContenderSeed {
  handle: string;
  countryCode: string;
  city: string;
  faction: FactionId;
}

const INTERNATIONAL_CONTENDER_POOL: readonly InternationalContenderSeed[] = [
  { handle: 'A. Lindemann', countryCode: 'CH', city: 'Geneva', faction: 'SOVEREIGN' },
  { handle: 'Kaito_Zero', countryCode: 'JP', city: 'Osaka', faction: 'HORIZON' },
  { handle: 'Layla.M', countryCode: 'EG', city: 'Cairo', faction: 'AGORA' },
  { handle: 'Dr_Pemberton', countryCode: 'GB', city: 'Oxford', faction: 'SOVEREIGN' },
  { handle: 'Signal_Rojas', countryCode: 'AR', city: 'Buenos Aires', faction: 'AGORA' },
  { handle: 'Katla_994', countryCode: 'IS', city: 'Reykjavik', faction: 'HORIZON' },
  { handle: 'MinJi_Seoul', countryCode: 'KR', city: 'Seoul', faction: 'HORIZON' },
  { handle: 'Priya_Nair', countryCode: 'IN', city: 'Bengaluru', faction: 'AGORA' },
  { handle: 'T. Moreau', countryCode: 'FR', city: 'Lyon', faction: 'SOVEREIGN' },
  { handle: 'N. VanDerBerg', countryCode: 'NL', city: 'Utrecht', faction: 'SOVEREIGN' },
  { handle: 'Camila_SP', countryCode: 'BR', city: 'Sao Paulo', faction: 'AGORA' },
  { handle: 'O. Adeyemi', countryCode: 'NG', city: 'Lagos', faction: 'AGORA' },
  { handle: 'S. Lindholm', countryCode: 'SE', city: 'Uppsala', faction: 'SOVEREIGN' },
  { handle: 'R. Chen_SG', countryCode: 'SG', city: 'Singapore', faction: 'HORIZON' },
  { handle: 'Elena_Vega', countryCode: 'ES', city: 'Madrid', faction: 'AGORA' },
  { handle: 'M. Kowalski', countryCode: 'PL', city: 'Krakow', faction: 'SOVEREIGN' },
  { handle: 'Liam_Melb', countryCode: 'AU', city: 'Melbourne', faction: 'AGORA' },
  { handle: 'D. Rossi', countryCode: 'IT', city: 'Bologna', faction: 'SOVEREIGN' },
  { handle: 'H. Richter', countryCode: 'DE', city: 'Munich', faction: 'HORIZON' },
  { handle: 'Clara_MTL', countryCode: 'CA', city: 'Montreal', faction: 'AGORA' },
  { handle: 'J. Castellanos', countryCode: 'MX', city: 'Mexico City', faction: 'AGORA' },
  { handle: 'Noor_Amman', countryCode: 'JO', city: 'Amman', faction: 'SOVEREIGN' },
  { handle: 'F. Al-Harbi', countryCode: 'AE', city: 'Dubai', faction: 'HORIZON' },
  { handle: 'Sora_Kyoto', countryCode: 'JP', city: 'Kyoto', faction: 'HORIZON' },
  { handle: 'E. OConnor', countryCode: 'IE', city: 'Dublin', faction: 'AGORA' },
  { handle: 'K. Virtanen', countryCode: 'FI', city: 'Helsinki', faction: 'HORIZON' },
  { handle: 'M. Solberg', countryCode: 'NO', city: 'Oslo', faction: 'SOVEREIGN' },
  { handle: 'T. Nkosi', countryCode: 'ZA', city: 'Cape Town', faction: 'AGORA' },
  { handle: 'V. Petrov', countryCode: 'BG', city: 'Sofia', faction: 'SOVEREIGN' },
  { handle: 'R. Silva_LX', countryCode: 'PT', city: 'Lisbon', faction: 'AGORA' },
  { handle: 'A. Takahashi', countryCode: 'JP', city: 'Tokyo', faction: 'HORIZON' },
  { handle: 'B. Mercer', countryCode: 'US', city: 'Boston', faction: 'HORIZON' },
  { handle: 'S. Patel_LDN', countryCode: 'GB', city: 'London', faction: 'HORIZON' },
  { handle: 'G. Bianchi', countryCode: 'IT', city: 'Milan', faction: 'SOVEREIGN' },
  { handle: 'C. Delgado', countryCode: 'CL', city: 'Santiago', faction: 'AGORA' },
  { handle: 'Y. BenDavid', countryCode: 'IL', city: 'Tel Aviv', faction: 'HORIZON' },
  { handle: 'M. Karanja', countryCode: 'KE', city: 'Nairobi', faction: 'AGORA' },
  { handle: 'A. Novak', countryCode: 'CZ', city: 'Prague', faction: 'SOVEREIGN' },
  { handle: 'Z. Wang_HK', countryCode: 'HK', city: 'Hong Kong', faction: 'HORIZON' },
  { handle: 'H. Fraser', countryCode: 'NZ', city: 'Wellington', faction: 'AGORA' },
  { handle: 'L. DeVries', countryCode: 'BE', city: 'Ghent', faction: 'SOVEREIGN' },
  { handle: 'I. Morales', countryCode: 'CO', city: 'Bogota', faction: 'AGORA' },
  { handle: 'K. Bauer', countryCode: 'AT', city: 'Vienna', faction: 'SOVEREIGN' },
  { handle: 'P. Nguyen', countryCode: 'VN', city: 'Hanoi', faction: 'HORIZON' },
];

export function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function createMulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeCohortPercentile(totalScore: number): number {
  if (!Number.isFinite(totalScore) || totalScore <= 0) return 1;
  const logistic = 100 / (1 + Math.exp(-(totalScore - 19500) / 7200));
  return Math.round(clamp(logistic, 1, 99));
}

/**
 * Formats a topic key (e.g. `'sports_baseball'`, `'domain:5'`, `'sub_bb_awards_hof'`)
 * into a clean human-readable leaderboard label with zero 4-digit year commas.
 */
export function formatTopicKeyLabel(
  topicKey: string,
  domainId?: number,
  utcDate?: string
): string {
  const clean = (topicKey ?? '').trim();
  if (!clean || clean === 'global' || clean === 'trials:global') {
    return 'Global Polymath Circuit';
  }
  if (clean.startsWith('daily:')) {
    const datePart = clean.slice(6) || utcDate || '';
    const num = datePart ? utcDateToBroadcastNumber(datePart) : 1;
    return datePart ? `Global Feed #${num} (${datePart})` : `Global Feed #${num}`;
  }
  const dictHit = TAXONOMY_LABEL_BY_ID.get(clean) ?? TAXONOMY_LABEL_BY_ID.get(clean.toLowerCase());
  if (dictHit) return dictHit;

  if (clean.startsWith('domain:')) {
    const idx = Number(clean.slice(7));
    if (Number.isInteger(idx) && idx >= 0 && idx < FORGE_DOMAINS.length) {
      return FORGE_DOMAINS[idx].name;
    }
  }
  if (typeof domainId === 'number' && domainId >= 0 && domainId < FORGE_DOMAINS.length) {
    const dom = FORGE_DOMAINS[domainId];
    if (clean.toLowerCase() === dom.key.toLowerCase()) return dom.name;
  }

  // Prettify snake_case specialist keys (e.g. 'sub_bb_awards_hof' -> 'Baseball Awards HOF')
  const stripped = clean
    .replace(/^sub_bb_/i, 'baseball_')
    .replace(/^sub_/i, '');
  return stripped
    .split(/[_\-:/]+/)
    .filter(Boolean)
    .map((word) => {
      if (word.toLowerCase() === 'hof') return 'HOF';
      if (word.toLowerCase() === 'mlb') return 'MLB';
      if (word.toLowerCase() === 'nba') return 'NBA';
      if (word.toLowerCase() === 'nfl') return 'NFL';
      if (word.toLowerCase() === 'ww2') return 'WW2';
      if (word.toLowerCase() === 'ww1') return 'WW1';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Generates a deterministic UTC-seeded international top-20 contender board
 * calibrated strictly around `median = 19,500` (zero 4-digit year commas!),
 * merged with all persisted `?duel=` friends and the player's own live rank.
 */
export function buildGlobalCohortLeaderboard(params: {
  scope: 'DAILY' | 'SUBCATEGORY';
  scopeKey: string;
  title: string;
  utcDate: string;
  playerName: string;
  playerScore: number;
  playerFaction: FactionId;
  playerElo?: number;
  duelFriends?: ReadonlyArray<DuelLeaderboardFriend>;
  persistedFriends?: ReadonlyArray<DuelLeaderboardFriend>;
}): LeaderboardCohortSnapshot {
  const COHORT_SIZE = 20;
  const cleanUtcDate =
    /^\d{4}-\d{2}-\d{2}$/.test((params.utcDate ?? '').trim())
      ? params.utcDate.trim()
      : new Date().toISOString().slice(0, 10);
  const cleanPlayerName = (params.playerName ?? '').trim() || 'Challenger';
  const cleanPlayerScore = Math.max(0, Math.round(Number(params.playerScore) || 0));
  const cleanPlayerFaction = normalizeFaction(params.playerFaction);
  const cleanPlayerElo = clamp(Math.round(Number(params.playerElo) || 1250), 700, 2600);

  // Merge persisted ?duel= friends + explicit duelFriends (deduped by lowercase name, keeping highest score)
  const friendMap = new Map<string, DuelLeaderboardFriend>();
  const ingestFriend = (f: DuelLeaderboardFriend) => {
    const fName = (f?.name ?? '').trim();
    if (!fName) return;
    const key = fName.toLowerCase();
    if (key === cleanPlayerName.toLowerCase()) return; // Player has their own dedicated row
    const cleanScore = Math.max(0, Math.round(Number(f.score) || 0));
    const prev = friendMap.get(key);
    if (!prev || cleanScore > prev.score) {
      friendMap.set(key, {
        name: fName,
        score: cleanScore,
        faction: normalizeFaction(f.faction),
        elo: clamp(Math.round(Number(f.elo) || 1320), 700, 2600),
        countryCode: f.countryCode || 'CH',
        challengeToken: f.challengeToken ?? prev?.challengeToken,
        h2hRecordLabel: f.h2hRecordLabel ?? prev?.h2hRecordLabel ?? 'DUEL RIVAL',
      });
    }
  };
  for (const pf of params.persistedFriends ?? []) ingestFriend(pf);
  for (const ef of params.duelFriends ?? []) ingestFriend(ef);

  const reservedNames = new Set<string>([
    cleanPlayerName.toLowerCase(),
    ...friendMap.keys(),
  ]);

  // Deterministic UTC-seeded Fisher-Yates selection of 20 unique international contenders
  const seed = fnv1a32(
    `WS_COHORT_V2:${params.scope}:${params.scopeKey.toLowerCase()}:${cleanUtcDate}`
  );
  const rng = createMulberry32(seed);

  const shuffledPool = [...INTERNATIONAL_CONTENDER_POOL];
  for (let i = shuffledPool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = shuffledPool[i];
    shuffledPool[i] = shuffledPool[j];
    shuffledPool[j] = tmp;
  }

  const pickedContenders: InternationalContenderSeed[] = [];
  for (const c of shuffledPool) {
    if (pickedContenders.length >= COHORT_SIZE) break;
    if (!reservedNames.has(c.handle.toLowerCase())) {
      pickedContenders.push(c);
    }
  }

  // Generate 20 stratified realistic scores calibrated strictly around median = 19,500
  // Quantiles (i + 0.5) / 20 mapped through inverse logistic centered at 19,500
  const cohortScores: number[] = [];
  for (let i = 0; i < COHORT_SIZE; i++) {
    const p = (i + 0.5) / COHORT_SIZE;
    const logit = Math.log(p / (1 - p));
    // Scale 3750 spans ~8,600 (rank 20) to ~33,200 (rank 1) with ranks 10-11 bracketing 19,500!
    const jitter = Math.round((rng() - 0.5) * 680);
    const raw = 19500 + logit * 3750 + jitter;
    const clamped = Math.round(clamp(raw, 8200, 34800) / 10) * 10;
    cohortScores.push(clamped);
  }
  cohortScores.sort((a, b) => b - a);

  // Compute exact cohort median (average of 10th & 11th scores)
  const cohortMedian = Math.round((cohortScores[9] + cohortScores[10]) / 2);

  const unsortedEntries: Omit<LeaderboardContenderEntry, 'rank'>[] = [];

  for (let i = 0; i < pickedContenders.length; i++) {
    const c = pickedContenders[i];
    const score = cohortScores[i];
    // Correlate realistic ELO (1080..2020) with cohort score
    const elo = clamp(
      Math.round(1120 + ((score - 8200) / 26000) * 860 + (rng() - 0.5) * 70),
      1020,
      2120
    );
    unsortedEntries.push({
      id: `cohort_${params.scope.toLowerCase()}_${i}_${c.countryCode.toLowerCase()}`,
      handle: c.handle,
      countryCode: c.countryCode,
      faction: c.faction,
      elo,
      score,
      scoreFormatted: score.toLocaleString('en-US'),
      percentile: computeCohortPercentile(score),
      kind: 'COHORT',
      isPlayer: false,
      isFriend: false,
      tag: `${c.city} · ${c.countryCode}`,
    });
  }

  for (const friend of friendMap.values()) {
    unsortedEntries.push({
      id: `friend_${makeRivalId(friend.name)}`,
      handle: friend.name,
      countryCode: friend.countryCode || 'CH',
      faction: normalizeFaction(friend.faction),
      elo: friend.elo ?? 1320,
      score: friend.score,
      scoreFormatted: friend.score.toLocaleString('en-US'),
      percentile: computeCohortPercentile(friend.score),
      kind: 'FRIEND',
      isPlayer: false,
      isFriend: true,
      tag: friend.h2hRecordLabel ? `DUEL RIVAL · ${friend.h2hRecordLabel}` : 'DUEL RIVAL',
      challengeToken: friend.challengeToken,
    });
  }

  const playerPercentile = computeCohortPercentile(cleanPlayerScore);
  unsortedEntries.push({
    id: 'player_live',
    handle: cleanPlayerName,
    countryCode: 'CH',
    faction: cleanPlayerFaction,
    elo: cleanPlayerElo,
    score: cleanPlayerScore,
    scoreFormatted: cleanPlayerScore.toLocaleString('en-US'),
    percentile: playerPercentile,
    kind: 'PLAYER',
    isPlayer: true,
    isFriend: false,
    tag: 'YOU · LIVE RANK',
  });

  // Deterministic descending score sort; ties favor PLAYER -> FRIEND -> higher ELO -> handle
  const kindOrder: Record<LeaderboardContenderEntry['kind'], number> = {
    PLAYER: 0,
    FRIEND: 1,
    COHORT: 2,
  };
  unsortedEntries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (kindOrder[a.kind] !== kindOrder[b.kind]) return kindOrder[a.kind] - kindOrder[b.kind];
    if (b.elo !== a.elo) return b.elo - a.elo;
    return a.handle.localeCompare(b.handle);
  });

  const entries: LeaderboardContenderEntry[] = unsortedEntries.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));

  const playerEntry = entries.find((e) => e.isPlayer)!;
  const topPct = Math.max(1, 100 - playerPercentile);

  return {
    scope: params.scope,
    scopeKey: params.scopeKey,
    title: params.title,
    utcDate: cleanUtcDate,
    cohortSize: pickedContenders.length,
    totalEntries: entries.length,
    medianScore: cohortMedian,
    playerRank: playerEntry.rank,
    playerPercentile,
    topPercentBanner: `Top ${topPct}%`,
    friendCount: friendMap.size,
    entries,
    top20: entries.slice(0, 20),
    playerEntry,
  };
}
