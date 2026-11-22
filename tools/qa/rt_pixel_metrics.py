#!/usr/bin/env python3
"""
RT-E2E-SYSTEMS-AUDITOR — Exact Image Telemetry (Bloom Whiteout, Touch-Drag Orbit Diff, 3D Hero Framing)
Reads full-window PNG screenshots via PIL + numpy and outputs JSON metrics to stdout.
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image


def load_rgb(path: str) -> np.ndarray:
    img = Image.open(path).convert("RGB")
    return np.asarray(img, dtype=np.uint8)


def crop_norm(arr: np.ndarray, rect):
    h, w, _ = arr.shape
    x0 = max(0, min(w - 1, int(round(rect[0] * w))))
    y0 = max(0, min(h - 1, int(round(rect[1] * h))))
    x1 = max(x0 + 1, min(w, int(round(rect[2] * w))))
    y1 = max(y0 + 1, min(h, int(round(rect[3] * h))))
    return arr[y0:y1, x0:x1]


def measure_bloom(arr: np.ndarray, crop=None):
    sub = crop_norm(arr, crop) if crop else arr
    total = sub.shape[0] * sub.shape[1]
    whiteout = np.all(sub >= 250, axis=-1)
    bright245 = np.all(sub >= 245, axis=-1)
    pct250 = (float(np.sum(whiteout)) / max(1, total)) * 100.0
    pct245 = (float(np.sum(bright245)) / max(1, total)) * 100.0
    return {
        "pixels": int(total),
        "whiteout250Count": int(np.sum(whiteout)),
        "whiteout250Pct": round(pct250, 4),
        "bright245Pct": round(pct245, 4),
    }


def measure_gold_hero(arr: np.ndarray, crop=None):
    """Detects warm gold/brass 3D Prism/Crown/Relic pixels inside the open 3D region."""
    sub = crop_norm(arr, crop) if crop else arr
    r = sub[:, :, 0].astype(np.int16)
    g = sub[:, :, 1].astype(np.int16)
    b = sub[:, :, 2].astype(np.int16)
    gold_mask = (r >= 125) & (g >= 95) & ((r - b) >= 24) & ((g - b) >= 12)
    ys, xs = np.where(gold_mask)
    h, w, _ = sub.shape
    if len(ys) < 20:
        return {
            "goldPixelCount": int(len(ys)),
            "detected": False,
        }
    # Use 2nd..98th percentile to ignore single-pixel noise sparkles
    y_min = float(np.percentile(ys, 2)) / h
    y_max = float(np.percentile(ys, 98)) / h
    x_min = float(np.percentile(xs, 2)) / w
    x_max = float(np.percentile(xs, 98)) / w
    # Check if dense gold pixels touch the very bottom edge (last 4px of crop) -> clipping risk!
    bottom_band = gold_mask[max(0, h - 4):h, :]
    bottom_edge_gold_px = int(np.sum(bottom_band))
    return {
        "detected": True,
        "goldPixelCount": int(len(ys)),
        "relYMin": round(y_min, 3),
        "relYMax": round(y_max, 3),
        "relXMin": round(x_min, 3),
        "relXMax": round(x_max, 3),
        "bottomEdgeGoldPx": bottom_edge_gold_px,
    }


def measure_diff(path_a: str, path_b: str, crop=None):
    a = load_rgb(path_a).astype(np.int16)
    b = load_rgb(path_b).astype(np.int16)
    if a.shape != b.shape:
        return {"error": f"Shape mismatch: {a.shape} vs {b.shape}"}
    if crop:
        a = crop_norm(a, crop)
        b = crop_norm(b, crop)
    diff = np.abs(a - b)
    mad = float(np.mean(diff))
    changed = np.max(diff, axis=-1) >= 10
    changed_pct = (float(np.sum(changed)) / max(1, changed.size)) * 100.0
    return {
        "mad": round(mad, 3),
        "changedPct": round(changed_pct, 3),
    }


def main():
    cmd = sys.argv[1]
    if cmd == "analyze":
        img_path = sys.argv[2]
        crop = json.loads(sys.argv[3]) if len(sys.argv) > 3 else None
        arr = load_rgb(img_path)
        res = {
            "shape": [int(arr.shape[1]), int(arr.shape[0])],
            "fullBloom": measure_bloom(arr, None),
            "stageBloom": measure_bloom(arr, crop) if crop else None,
            "stageGoldHero": measure_gold_hero(arr, crop) if crop else measure_gold_hero(arr, None),
        }
        print(json.dumps(res))
    elif cmd == "diff":
        p1, p2 = sys.argv[2], sys.argv[3]
        crop = json.loads(sys.argv[4]) if len(sys.argv) > 4 else None
        print(json.dumps(measure_diff(p1, p2, crop)))
    else:
        raise SystemExit(f"Unknown cmd: {cmd}")


if __name__ == "__main__":
    main()
