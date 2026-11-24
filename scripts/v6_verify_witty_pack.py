#!/usr/bin/env python3
"""
World's Smartest v6.0 — Prime-Time Witty Clue Pack Verifier
Validates `public/data/v6/prime_time_witty_clues_v6.json` (or any batch JSON)
against every contract, editorial anti-AI rule, zero-scroll budget, multi-toy
payload integrity rule, and difficulty calibration law.
"""

from __future__ import annotations

import argparse
import collections
import json
import math
import pathlib
import re
import sys
from typing import Any

DEFAULT_PACK_PATH = pathlib.Path("public/data/v6/prime_time_witty_clues_v6.json")

QID_MIN = 1280000
QID_MAX = 1282999
MAX_PROMPT_CHARS = 135
MAX_CHOICE_CHARS = 52
MAX_ASIDE_WORDS = 14
MAX_HINT_CHARS = 95

VALID_BADGES = {
    "WARMUP",
    "EASY",
    "CONTENDER",
    "SHARP",
    "CHAMPIONSHIP",
    "LEGEND",
}

BANNED_AI_PHRASES = [
    r"\bdelve\b",
    r"\bdelving\b",
    r"\btapestry\b",
    r"\btestament\b",
    r"\bvibrant\b",
    r"\brealm\b",
    r"\bbeacon\b",
    r"\bunveil\b",
    r"\bunveiled\b",
    r"\bembark\b",
    r"\bintricate\b",
    r"\bbustling\b",
    r"\bpivotal\b",
    r"\bparamount\b",
    r"\bwhimsical\b",
    r"\bsymphony of\b",
    r"\bmosaic of\b",
    r"\brich history\b",
    r"\bstands as a\b",
    r"\bnestled in\b",
    r"\brenowned for\b",
    r"\bcaptivated audiences\b",
    r"\bindelible mark\b",
    r"\bever-evolving\b",
    r"\bgroundbreaking\b",
    r"\bgame-changer\b",
    r"\bfascinatingly\b",
    r"\bremarkably\b",
    r"\binterestingly\b",
    r"\bin a world where\b",
    r"\bmore than just\b",
]
BANNED_AI_RE = [re.compile(pat, re.IGNORECASE) for pat in BANNED_AI_PHRASES]

BANNED_OPENER_RE = [
    re.compile(r"^which entity is associated with\b", re.IGNORECASE),
    re.compile(r"^identify the\b", re.IGNORECASE),
    re.compile(r"^select the correct\b", re.IGNORECASE),
    re.compile(r"^which of the following is true regarding\b", re.IGNORECASE),
    re.compile(r"^according to historical records\b", re.IGNORECASE),
    re.compile(r"^in which year did the event\b", re.IGNORECASE),
]

CRYPTEX_RE = re.compile(r"^[A-Z]{4,8}$")

ALLOWED_CLUE_KEYS = {
    "qid",
    "domainId",
    "categoryLabel",
    "subcategoryLabel",
    "difficultyScore",
    "difficultyBadge",
    "fameScore",
    "recommendedToyIds",
    "prompt",
    "choices",
    "correctIndex",
    "wrongWireIndices",
    "numericTarget",
    "numericMin",
    "numericMax",
    "numericUnit",
    "geoTarget",
    "cryptexWord",
    "chronologyItems",
    "binaryPair",
    "corruptedLieWord",
    "progressiveHints",
    "wittyHostAside",
}


def normalize_text(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def expected_badge(score: float) -> str:
    if score < 2.0:
        return "WARMUP"
    if score <= 3.5:
        return "EASY"
    if score <= 5.4:
        return "CONTENDER"
    if score <= 7.3:
        return "SHARP"
    if score <= 9.0:
        return "CHAMPIONSHIP"
    return "LEGEND"


def check_ai_slop(text: str) -> list[str]:
    hits = []
    for regex in BANNED_AI_RE:
        m = regex.search(text)
        if m:
            hits.append(m.group(0))
    return hits


def load_clues(path: pathlib.Path) -> list[dict[str, Any]]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(raw, list):
        return raw
    if isinstance(raw, dict) and isinstance(raw.get("clues"), list):
        return raw["clues"]
    raise ValueError(f"Unsupported JSON root in {path}: expected list or dict with 'clues'")


def verify_pack(
    path: pathlib.Path,
    min_count: int = 2500,
    strict_full_pack: bool = True,
) -> tuple[bool, dict[str, Any]]:
    errors: list[str] = []
    warnings: list[str] = []

    if not path.exists():
        return False, {"errors": [f"File not found: {path}"]}

    clues = load_clues(path)
    total = len(clues)
    if total < min_count:
        errors.append(f"Clue count {total} is below minimum required {min_count}")

    seen_qids: set[int] = set()
    seen_prompts: dict[str, int] = {}
    seen_lies: set[str] = set()
    domain_counts = collections.Counter()
    badge_counts = collections.Counter()
    band_counts = collections.Counter()  # 1..10 stage bands
    int_bin_counts = collections.Counter()  # floor(score), 10 folded into 9..10
    correct_idx_counts = collections.Counter()
    toy_field_counts = collections.Counter()
    prompt_lengths: list[int] = []
    aside_word_counts: list[int] = []
    geo_landmarks: set[str] = set()

    for idx, c in enumerate(clues):
        tag = f"item[{idx}] (qid={c.get('qid')})"

        unknown_keys = set(c.keys()) - ALLOWED_CLUE_KEYS
        if unknown_keys:
            errors.append(f"{tag}: unsupported keys outside CalibratedClueV6: {sorted(unknown_keys)}")

        # 1. QID bounds & uniqueness
        qid = c.get("qid")
        if not isinstance(qid, int) or isinstance(qid, bool):
            errors.append(f"{tag}: qid must be int")
        else:
            if not (QID_MIN <= qid <= QID_MAX):
                errors.append(f"{tag}: qid {qid} outside [{QID_MIN}, {QID_MAX}]")
            if qid in seen_qids:
                errors.append(f"{tag}: duplicate qid {qid}")
            seen_qids.add(qid)

        # 2. Domain & Category
        dom = c.get("domainId")
        if not isinstance(dom, int) or isinstance(dom, bool) or not (0 <= dom <= 11):
            errors.append(f"{tag}: domainId must be int 0..11, got {dom!r}")
        else:
            domain_counts[dom] += 1

        cat = c.get("categoryLabel")
        if not isinstance(cat, str) or not (2 <= len(cat.strip()) <= 32):
            errors.append(f"{tag}: invalid categoryLabel {cat!r}")

        # 3. Difficulty & Fame calibration
        diff = c.get("difficultyScore")
        if not isinstance(diff, (int, float)) or isinstance(diff, bool) or not (1.0 <= float(diff) <= 10.0):
            errors.append(f"{tag}: difficultyScore must be 1.0..10.0, got {diff!r}")
        else:
            dval = float(diff)
            # 10 equal stage bands across [1.0, 10.0]
            stage_band = min(10, max(1, int(math.floor((dval - 1.0) / 0.9)) + 1))
            band_counts[stage_band] += 1
            int_bin = min(9, int(math.floor(dval)))
            int_bin_counts[int_bin] += 1

            badge = c.get("difficultyBadge")
            if badge not in VALID_BADGES:
                errors.append(f"{tag}: invalid difficultyBadge {badge!r}")
            else:
                badge_counts[badge] += 1
                exp = expected_badge(dval)
                if badge != exp:
                    errors.append(f"{tag}: difficultyBadge {badge} mismatches score {dval} (expected {exp})")

        fame = c.get("fameScore")
        if not isinstance(fame, (int, float)) or isinstance(fame, bool) or not (0.0 <= float(fame) <= 1.0):
            errors.append(f"{tag}: fameScore must be 0.0..1.0, got {fame!r}")

        # 4. Prompt length, uniqueness, anti-AI check
        prompt = c.get("prompt")
        if not isinstance(prompt, str) or len(prompt.strip()) < 16:
            errors.append(f"{tag}: prompt too short or invalid: {prompt!r}")
        else:
            p_clean = prompt.strip()
            prompt_lengths.append(len(p_clean))
            if len(p_clean) > MAX_PROMPT_CHARS:
                errors.append(f"{tag}: prompt length {len(p_clean)} > {MAX_PROMPT_CHARS}: {p_clean!r}")
            norm = normalize_text(p_clean)
            if norm in seen_prompts:
                errors.append(f"{tag}: duplicate prompt matches qid {seen_prompts[norm]}: {p_clean!r}")
            else:
                seen_prompts[norm] = qid if isinstance(qid, int) else idx
            slop = check_ai_slop(p_clean)
            if slop:
                errors.append(f"{tag}: AI buzzword in prompt ({slop}): {p_clean!r}")
            for opener_re in BANNED_OPENER_RE:
                if opener_re.search(p_clean):
                    errors.append(f"{tag}: dry database opener in prompt: {p_clean!r}")

        # 5. Choices & correctIndex & wrongWireIndices
        choices = c.get("choices")
        cidx = c.get("correctIndex")
        if not isinstance(choices, list) or len(choices) != 4:
            errors.append(f"{tag}: choices must be list of length 4")
        else:
            norm_choices = []
            for ci, ch in enumerate(choices):
                if not isinstance(ch, str) or not ch.strip():
                    errors.append(f"{tag}: choice[{ci}] empty/invalid")
                else:
                    if len(ch.strip()) > MAX_CHOICE_CHARS:
                        errors.append(f"{tag}: choice[{ci}] too long ({len(ch.strip())} > {MAX_CHOICE_CHARS}): {ch!r}")
                    norm_choices.append(normalize_text(ch))
            if len(set(norm_choices)) != 4:
                errors.append(f"{tag}: duplicate choices in {choices!r}")

        if not isinstance(cidx, int) or isinstance(cidx, bool) or not (0 <= cidx <= 3):
            errors.append(f"{tag}: correctIndex must be 0..3, got {cidx!r}")
        else:
            correct_idx_counts[cidx] += 1

        wires = c.get("wrongWireIndices")
        if wires is not None:
            toy_field_counts["wrongWireIndices"] += 1
            expected_wires = [i for i in range(4) if i != cidx]
            if not isinstance(wires, list) or sorted(wires) != expected_wires or len(wires) != 3:
                errors.append(f"{tag}: wrongWireIndices {wires!r} must be {expected_wires}")
        else:
            errors.append(f"{tag}: missing wrongWireIndices")

        # 6. wittyHostAside
        aside = c.get("wittyHostAside")
        if not isinstance(aside, str) or not aside.strip():
            errors.append(f"{tag}: missing wittyHostAside")
        else:
            toy_field_counts["wittyHostAside"] += 1
            words = aside.strip().split()
            aside_word_counts.append(len(words))
            if len(words) > MAX_ASIDE_WORDS:
                errors.append(f"{tag}: wittyHostAside has {len(words)} words > {MAX_ASIDE_WORDS}: {aside!r}")
            slop = check_ai_slop(aside)
            if slop:
                errors.append(f"{tag}: AI buzzword in wittyHostAside ({slop}): {aside!r}")

        # 7. progressiveHints (optional or populated)
        hints = c.get("progressiveHints")
        if hints is not None:
            toy_field_counts["progressiveHints"] += 1
            if not isinstance(hints, list) or len(hints) != 4:
                errors.append(f"{tag}: progressiveHints must have exactly 4 items")
            else:
                for hi, h in enumerate(hints):
                    if not isinstance(h, str) or not (4 <= len(h.strip()) <= MAX_HINT_CHARS):
                        errors.append(f"{tag}: progressiveHints[{hi}] invalid length: {h!r}")
                    elif check_ai_slop(h):
                        errors.append(f"{tag}: AI buzzword in hint[{hi}]: {h!r}")

        # 8. geoTarget
        geo = c.get("geoTarget")
        if geo is not None:
            toy_field_counts["geoTarget"] += 1
            if not isinstance(geo, dict):
                errors.append(f"{tag}: geoTarget must be dict")
            else:
                lat, lng = geo.get("lat"), geo.get("lng")
                if not isinstance(lat, (int, float)) or not (-90.0 <= float(lat) <= 90.0):
                    errors.append(f"{tag}: invalid geoTarget.lat {lat!r}")
                if not isinstance(lng, (int, float)) or not (-180.0 <= float(lng) <= 180.0):
                    errors.append(f"{tag}: invalid geoTarget.lng {lng!r}")
                lbl = geo.get("landmarkLabel")
                if not isinstance(lbl, str) or not lbl.strip():
                    errors.append(f"{tag}: geoTarget.landmarkLabel required")
                else:
                    geo_landmarks.add(normalize_text(lbl))

        # 9. cryptexWord
        cw = c.get("cryptexWord")
        if cw is not None:
            toy_field_counts["cryptexWord"] += 1
            if not isinstance(cw, str) or not CRYPTEX_RE.match(cw):
                errors.append(f"{tag}: cryptexWord {cw!r} must match ^[A-Z]{{4,8}}$")

        # 10. numericTarget
        if "numericTarget" in c and c["numericTarget"] is not None:
            toy_field_counts["numericTarget"] += 1
            nt = c.get("numericTarget")
            nmin = c.get("numericMin")
            nmax = c.get("numericMax")
            nunit = c.get("numericUnit")
            if not isinstance(nt, (int, float)) or isinstance(nt, bool):
                errors.append(f"{tag}: numericTarget must be numeric")
            if not isinstance(nmin, (int, float)) or not isinstance(nmax, (int, float)):
                errors.append(f"{tag}: numericMin/numericMax required with numericTarget")
            elif not (float(nmin) <= float(nt) <= float(nmax)) or float(nmin) >= float(nmax):
                errors.append(f"{tag}: numericTarget {nt} not inside [{nmin}, {nmax}]")
            if not isinstance(nunit, str) or not nunit.strip():
                errors.append(f"{tag}: numericUnit required with numericTarget")

        # 11. chronologyItems
        chron = c.get("chronologyItems")
        if chron is not None:
            toy_field_counts["chronologyItems"] += 1
            if not isinstance(chron, list) or len(chron) != 4:
                errors.append(f"{tag}: chronologyItems must be list of 4")
            else:
                orders = []
                labels = []
                for item in chron:
                    if not isinstance(item, dict):
                        errors.append(f"{tag}: chronologyItem must be dict")
                        continue
                    lbl = item.get("label")
                    yo = item.get("yearOrOrder")
                    if not isinstance(lbl, str) or not (2 <= len(lbl.strip()) <= 56):
                        errors.append(f"{tag}: invalid chronologyItem label {lbl!r}")
                    else:
                        labels.append(normalize_text(lbl))
                    if not isinstance(yo, (int, float)) or isinstance(yo, bool):
                        errors.append(f"{tag}: invalid chronologyItem yearOrOrder {yo!r}")
                    else:
                        orders.append(float(yo))
                if len(set(orders)) != 4:
                    errors.append(f"{tag}: chronologyItems must have 4 strictly distinct yearOrOrder values: {orders}")
                if len(set(labels)) != 4:
                    errors.append(f"{tag}: duplicate labels in chronologyItems")

        # 12. binaryPair
        bp = c.get("binaryPair")
        if bp is not None:
            toy_field_counts["binaryPair"] += 1
            if not isinstance(bp, dict):
                errors.append(f"{tag}: binaryPair must be dict")
            else:
                oa, ob, items = bp.get("optionA"), bp.get("optionB"), bp.get("items")
                if not isinstance(oa, str) or not oa.strip() or not isinstance(ob, str) or not ob.strip():
                    errors.append(f"{tag}: binaryPair optionA/optionB required")
                if not isinstance(items, list) or len(items) < 4:
                    errors.append(f"{tag}: binaryPair items must have >= 4 entries")
                else:
                    buckets = []
                    texts = set()
                    for it in items:
                        if not isinstance(it, dict):
                            errors.append(f"{tag}: binaryPair item must be dict")
                            continue
                        t, b = it.get("text"), it.get("bucket")
                        if not isinstance(t, str) or not (1 <= len(t.strip()) <= 44):
                            errors.append(f"{tag}: invalid binaryPair item text {t!r}")
                        else:
                            nt_text = normalize_text(t)
                            if nt_text in texts:
                                errors.append(f"{tag}: duplicate binaryPair item {t!r}")
                            texts.add(nt_text)
                        if b not in (0, 1):
                            errors.append(f"{tag}: binaryPair bucket must be 0 or 1, got {b!r}")
                        else:
                            buckets.append(b)
                    if 0 not in buckets or 1 not in buckets:
                        errors.append(f"{tag}: binaryPair must include both bucket 0 and bucket 1 items")

        # 13. corruptedLieWord
        clw = c.get("corruptedLieWord")
        if clw is not None:
            toy_field_counts["corruptedLieWord"] += 1
            if not isinstance(clw, dict):
                errors.append(f"{tag}: corruptedLieWord must be dict")
            else:
                sent = clw.get("sentenceWithLie")
                tok = clw.get("lieToken")
                truth = clw.get("truthCorrection")
                if not isinstance(sent, str) or not (15 <= len(sent.strip()) <= 140):
                    errors.append(f"{tag}: invalid sentenceWithLie {sent!r}")
                if not isinstance(tok, str) or not tok.strip():
                    errors.append(f"{tag}: missing lieToken")
                if not isinstance(truth, str) or not truth.strip():
                    errors.append(f"{tag}: missing truthCorrection")
                if isinstance(sent, str) and isinstance(tok, str) and isinstance(truth, str):
                    if tok.strip().lower() == truth.strip().lower():
                        errors.append(f"{tag}: lieToken equals truthCorrection ({tok!r})")
                    if not re.search(r"(?<!\w)" + re.escape(tok.strip()) + r"(?!\w)", sent, re.IGNORECASE):
                        errors.append(f"{tag}: lieToken {tok!r} not clean word-boundary match in sentenceWithLie {sent!r}")
                    norm_lie = normalize_text(sent)
                    if norm_lie in seen_lies:
                        warnings.append(f"{tag}: duplicate sentenceWithLie: {sent!r}")
                    seen_lies.add(norm_lie)
                    slop = check_ai_slop(sent)
                    if slop:
                        errors.append(f"{tag}: AI buzzword in sentenceWithLie ({slop}): {sent!r}")

    # Answer-in-prompt spoiler leak & same-answer near-duplicate checks
    tok_rows: list[tuple[int, set[str], str, str]] = []
    inv_idx: dict[str, list[int]] = collections.defaultdict(list)
    for idx, c in enumerate(clues):
        p = c.get("prompt", "")
        chs = c.get("choices", [])
        ci = c.get("correctIndex", 0)
        qid_val = c.get("qid", idx)
        if isinstance(p, str) and isinstance(chs, list) and isinstance(ci, int) and 0 <= ci < len(chs):
            ans = chs[ci].strip()
            if len(ans) >= 5 and re.search(r"\b" + re.escape(ans) + r"\b", p, re.IGNORECASE):
                errors.append(f"item[{idx}] (qid={qid_val}): answer {ans!r} leaked verbatim in prompt {p!r}")
            ws = set(re.findall(r"[a-z0-9]{4,}", p.lower()))
            tok_rows.append((qid_val, ws, p, ans.lower()))
            for w in ws:
                inv_idx[w].append(len(tok_rows) - 1)
    for i, (q1, ws1, p1, a1) in enumerate(tok_rows):
        cand: collections.Counter[int] = collections.Counter()
        for w in ws1:
            for j in inv_idx[w]:
                if j > i:
                    cand[j] += 1
        for j, ov in cand.items():
            if ov >= 5:
                q2, ws2, p2, a2 = tok_rows[j]
                jacc = ov / len(ws1 | ws2)
                if jacc >= 0.42 and a1 == a2:
                    errors.append(f"near-duplicate same-answer clues ({q1} vs {q2}, jacc={jacc:.2f}, ans={a1!r})")

    # Full-pack balance checks
    if strict_full_pack:
        if len(domain_counts) < 12:
            errors.append(f"Expected all 12 domains (0..11), found {sorted(domain_counts.keys())}")
        for d in range(12):
            if domain_counts[d] < 120:
                errors.append(f"Domain {d} under-populated: {domain_counts[d]} (< 120)")
        for b in range(1, 11):
            if band_counts[b] < 180:
                errors.append(f"Stage difficulty band {b} under-populated: {band_counts[b]} (< 180)")
        if toy_field_counts["geoTarget"] < 250:
            errors.append(f"geoTarget count {toy_field_counts['geoTarget']} < 250")
        if len(geo_landmarks) < 250:
            errors.append(f"Unique geoTarget landmarks {len(geo_landmarks)} < 250")
        if toy_field_counts["cryptexWord"] < 400:
            errors.append(f"cryptexWord count {toy_field_counts['cryptexWord']} < 400")
        if toy_field_counts["numericTarget"] < 300:
            errors.append(f"numericTarget count {toy_field_counts['numericTarget']} < 300")
        if toy_field_counts["chronologyItems"] < 200:
            errors.append(f"chronologyItems count {toy_field_counts['chronologyItems']} < 200")
        if toy_field_counts["binaryPair"] < 200:
            errors.append(f"binaryPair count {toy_field_counts['binaryPair']} < 200")
        if toy_field_counts["corruptedLieWord"] < 250:
            errors.append(f"corruptedLieWord count {toy_field_counts['corruptedLieWord']} < 250")

    report = {
        "path": str(path),
        "totalClues": total,
        "qidRange": [min(seen_qids), max(seen_qids)] if seen_qids else [],
        "uniquePrompts": len(seen_prompts),
        "maxPromptChars": max(prompt_lengths) if prompt_lengths else 0,
        "avgPromptChars": round(sum(prompt_lengths) / len(prompt_lengths), 1) if prompt_lengths else 0,
        "maxAsideWords": max(aside_word_counts) if aside_word_counts else 0,
        "avgAsideWords": round(sum(aside_word_counts) / len(aside_word_counts), 1) if aside_word_counts else 0,
        "domainHistogram": {str(k): domain_counts[k] for k in sorted(domain_counts)},
        "stageBandHistogram_1_to_10": {str(k): band_counts[k] for k in range(1, 11)},
        "integerDifficultyHistogram": {f"{k}.0-{k}.9" if k < 9 else "9.0-10.0": int_bin_counts[k] for k in range(1, 10)},
        "badgeHistogram": dict(sorted(badge_counts.items())),
        "correctIndexBalance": {str(k): correct_idx_counts[k] for k in range(4)},
        "multiToyCoverage": dict(sorted(toy_field_counts.items())),
        "uniqueGeoLandmarks": len(geo_landmarks),
        "errorCount": len(errors),
        "warningCount": len(warnings),
        "errors": errors[:50],
        "warnings": warnings[:20],
    }
    return len(errors) == 0, report


def main() -> int:
    parser = argparse.ArgumentParser(description="Verify World's Smartest v6.0 Prime-Time Witty Clue Pack")
    parser.add_argument("--input", type=pathlib.Path, default=DEFAULT_PACK_PATH, help="Path to clue JSON")
    parser.add_argument("--min-count", type=int, default=2500, help="Minimum clue count required")
    parser.add_argument("--batch", action="store_true", help="Batch mode (skip 12-domain / 250-geo full-pack minimums)")
    args = parser.parse_args()

    ok, report = verify_pack(args.input, min_count=args.min_count, strict_full_pack=not args.batch)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if not ok:
        print(f"\nFAIL: {report['errorCount']} verification error(s) found.", file=sys.stderr)
        return 1
    print(f"\nPASS: {report['totalClues']} verified prime-time witty clues (0 errors, max prompt {report['maxPromptChars']} chars).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
