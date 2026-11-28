#!/usr/bin/env python3
"""
World's Smartest v9 — 1966 Gouache Sprite Atlas Packer (`scripts/pack_v9_atlases.py`)

Dynamically scans `.agents/v9_raw_art/*.png` (ZERO hardcoded filenames, ZERO fallback
placeholder boxes) and packs compressed WebP/JPEG sprite atlases into `public/assets/v9/`
with `atlas_manifest_v9.json` matching `AtlasManifestV9`:
  - `vip_*`          -> `atlas_vip.webp` (4 cols, 256x256 cells, RGB WebP q=80)
  - `prize_*`        -> `atlas_prizes.webp` (8 cols, 256x256 cells, RGB WebP q=80)
  - `zonk_*`         -> `atlas_zonks.webp` (4 cols, 256x256 cells, RGB WebP q=80)
  - `studio_crowd_*` -> `atlas_crowd.webp` (1280x1320 RGBA cutout WebP q=80: 3x 1280x360 waist-up rows + 1278x240 6-slot VIP pairs)
  - `*_backdrop_*`   -> `<targetId>.jpg` (1280x720 progressive JPEG q=80)

Asserts total `public/assets/v9/` footprint <= 1,600,000 bytes (1.60 MB decimal).
"""

from __future__ import annotations

import json
import math
from collections import deque
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image, ImageDraw

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_ART_DIR = REPO_ROOT / ".agents" / "v9_raw_art"
OUT_DIR = REPO_ROOT / "public" / "assets" / "v9"
MANIFEST_PATH = OUT_DIR / "atlas_manifest_v9.json"

MAX_V9_ASSETS_BYTES = 1_600_000
CELL_SIZE = 256
BACKDROP_SIZE = (1280, 720)
CROWD_SHEET_SIZE = (1280, 1320)
CROWD_OUT_HEAD_ROW = 105.0
CROWD_OUT_HEAD_VIP = 72.0
CROWD_CANVAS_HEAD = 157.5
CROWD_FRONT_Y_TOP = 185
CROWD_FRONT_Y_RAIL = 438

PALETTES_1966: dict[str, tuple[float, float, float]] = {
    "peacock_teal":     (182.0, 0.72, 0.94),
    "harvest_gold":     (44.0,  0.84, 1.08),
    "carnaby_cerise":   (336.0, 0.68, 0.96),
    "avocado_olive":    (78.0,  0.62, 0.94),
    "atomic_tangerine": (18.0,  0.78, 1.04),
    "broadcast_cobalt": (216.0, 0.68, 0.94),
    "walnut_tweed":     (28.0,  0.46, 0.88),
    "orchid_mod":       (286.0, 0.50, 0.98),
}


def rgb_to_hsv_deg(rgb_u8: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    rgb = rgb_u8.astype(np.float32) / 255.0
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    maxc = np.maximum(np.maximum(r, g), b)
    minc = np.minimum(np.minimum(r, g), b)
    delta = maxc - minc
    v = maxc
    s = np.where(maxc > 1e-6, delta / np.maximum(maxc, 1e-6), 0.0)
    h = np.zeros_like(maxc)
    nz = delta > 1e-6
    mr = nz & (maxc == r)
    mg = nz & (maxc == g) & (~mr)
    mb = nz & (~mr) & (~mg)
    h[mr] = 60.0 * (((g[mr] - b[mr]) / delta[mr]) % 6.0)
    h[mg] = 60.0 * (((b[mg] - r[mg]) / delta[mg]) + 2.0)
    h[mb] = 60.0 * (((r[mb] - g[mb]) / delta[mb]) + 4.0)
    return h, s, v


def hsv_deg_to_rgb_u8(h: np.ndarray, s: np.ndarray, v: np.ndarray) -> np.ndarray:
    hp = (h % 360.0) / 60.0
    c = v * s
    x = c * (1.0 - np.abs((hp % 2.0) - 1.0))
    m = v - c
    z = np.zeros_like(hp)
    sec = np.floor(hp).astype(np.int32) % 6
    r1 = np.select([sec == 0, sec == 1, sec == 2, sec == 3, sec == 4, sec == 5], [c, x, z, z, x, c], default=z)
    g1 = np.select([sec == 0, sec == 1, sec == 2, sec == 3, sec == 4, sec == 5], [x, c, c, x, z, z], default=z)
    b1 = np.select([sec == 0, sec == 1, sec == 2, sec == 3, sec == 4, sec == 5], [z, z, x, c, c, x], default=z)
    rgb = np.stack([r1 + m, g1 + m, b1 + m], axis=2)
    return np.clip(np.round(rgb * 255.0), 0.0, 255.0).astype(np.uint8)


def extract_plate_rgba(
    arr: np.ndarray,
    bg: np.ndarray,
    thresh: float,
    fringe_thresh: float,
) -> np.ndarray:
    """
    Edge-seeded 4-connected BFS background removal (ZERO global enclosed_cream,
    preserving 100% of teeth, pearl necklaces, white gloves, and collars) +
    1px warm-cream fringe strip + soft alpha feather & spill decontamination.
    """
    h, w, _ = arr.shape
    diff = arr - bg
    dist = np.sqrt(np.sum(diff * diff, axis=2))

    bg_mask = np.zeros((h, w), dtype=bool)
    queue: deque[tuple[int, int]] = deque()

    for x in range(w):
        for y in (0, h - 1):
            if dist[y, x] < thresh and not bg_mask[y, x]:
                bg_mask[y, x] = True
                queue.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if dist[y, x] < thresh and not bg_mask[y, x]:
                bg_mask[y, x] = True
                queue.append((y, x))

    while queue:
        cy, cx = queue.popleft()
        if cy > 0 and not bg_mask[cy - 1, cx] and dist[cy - 1, cx] < thresh:
            bg_mask[cy - 1, cx] = True
            queue.append((cy - 1, cx))
        if cy + 1 < h and not bg_mask[cy + 1, cx] and dist[cy + 1, cx] < thresh:
            bg_mask[cy + 1, cx] = True
            queue.append((cy + 1, cx))
        if cx > 0 and not bg_mask[cy, cx - 1] and dist[cy, cx - 1] < thresh:
            bg_mask[cy, cx - 1] = True
            queue.append((cy, cx - 1))
        if cx + 1 < w and not bg_mask[cy, cx + 1] and dist[cy, cx + 1] < thresh:
            bg_mask[cy, cx + 1] = True
            queue.append((cy, cx + 1))

    # 1px outer warm-cream fringe strip
    bg_up = np.pad(bg_mask[:-1, :], ((1, 0), (0, 0)), constant_values=True)
    bg_dn = np.pad(bg_mask[1:, :], ((0, 1), (0, 0)), constant_values=True)
    bg_lt = np.pad(bg_mask[:, :-1], ((0, 0), (1, 0)), constant_values=True)
    bg_rt = np.pad(bg_mask[:, 1:], ((0, 0), (0, 1)), constant_values=True)
    bg_mask |= (~bg_mask) & (bg_up | bg_dn | bg_lt | bg_rt) & (dist < fringe_thresh)

    alpha = np.where(bg_mask, 0.0, 255.0).astype(np.float32)

    bg_up = np.pad(bg_mask[:-1, :], ((1, 0), (0, 0)), constant_values=True)
    bg_dn = np.pad(bg_mask[1:, :], ((0, 1), (0, 0)), constant_values=True)
    bg_lt = np.pad(bg_mask[:, :-1], ((0, 0), (1, 0)), constant_values=True)
    bg_rt = np.pad(bg_mask[:, 1:], ((0, 0), (0, 1)), constant_values=True)
    edge_fg = (~bg_mask) & (bg_up | bg_dn | bg_lt | bg_rt)

    fringe_factor = np.clip((dist - 12.0) / 32.0, 0.30, 1.0)
    alpha[edge_fg] = np.minimum(alpha[edge_fg], 255.0 * fringe_factor[edge_fg])

    spill = edge_fg & (dist < 44.0)
    out_rgb = arr.copy()
    decontam = np.clip((dist[spill] - 12.0) / 32.0, 0.35, 1.0)[:, None]
    out_rgb[spill] = np.clip(
        out_rgb[spill] - bg[None, :] * (1.0 - decontam) * 0.42, 0.0, 255.0
    )

    return np.dstack([out_rgb, alpha]).astype(np.uint8)


def polygon_mask(h: int, w: int, poly: list[tuple[int, int]]) -> np.ndarray:
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).polygon(poly, fill=1)
    return np.asarray(m, dtype=bool)


def keep_largest_component(rgba: np.ndarray, min_area: int = 120) -> np.ndarray:
    """Keep ONLY the single largest connected opaque component (eliminates detached slivers)."""
    fg = rgba[:, :, 3] > 20
    h, w = fg.shape
    visited = np.zeros((h, w), dtype=bool)
    keep = np.zeros((h, w), dtype=bool)
    largest_pts: list[tuple[int, int]] = []

    ys, xs = np.where(fg)
    for sy, sx in zip(ys.tolist(), xs.tolist()):
        if visited[sy, sx]:
            continue
        comp: list[tuple[int, int]] = []
        q: deque[tuple[int, int]] = deque([(sy, sx)])
        visited[sy, sx] = True
        while q:
            cy, cx = q.popleft()
            comp.append((cy, cx))
            for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                if 0 <= ny < h and 0 <= nx < w and fg[ny, nx] and not visited[ny, nx]:
                    visited[ny, nx] = True
                    q.append((ny, nx))
        if len(comp) > len(largest_pts):
            largest_pts = comp

    if len(largest_pts) >= min_area or largest_pts:
        for py, px in largest_pts:
            keep[py, px] = True

    out = rgba.copy()
    out[~keep, 3] = 0
    return out


def strip_outer_cream_halo(rgba: np.ndarray, bg: np.ndarray, dist_thresh: float = 40.0) -> np.ndarray:
    """
    Strip thin 1-2px warm-cream/yellowish rim halos along outer background edges
    without eroding dark outlines or white gloves/collars/pearls.
    """
    out = rgba.copy()
    bg_mask = out[:, :, 3] <= 20
    rgb = out[:, :, :3].astype(np.float32)
    dist = np.sqrt(np.sum((rgb - bg[None, None, :]) ** 2, axis=2))
    h_deg, s_val, v_val = rgb_to_hsv_deg(out[:, :, :3])

    for _ in range(2):
        bg_up = np.pad(bg_mask[:-1, :], ((1, 0), (0, 0)), constant_values=True)
        bg_dn = np.pad(bg_mask[1:, :], ((0, 1), (0, 0)), constant_values=True)
        bg_lt = np.pad(bg_mask[:, :-1], ((0, 0), (1, 0)), constant_values=True)
        bg_rt = np.pad(bg_mask[:, 1:], ((0, 0), (0, 1)), constant_values=True)
        edge = (~bg_mask) & (bg_up | bg_dn | bg_lt | bg_rt)
        warm_halo = edge & (
            (dist < dist_thresh)
            | ((h_deg >= 28.0) & (h_deg <= 58.0) & (s_val >= 0.14) & (s_val <= 0.56) & (v_val >= 0.62))
        )
        # Preserve white gloves / collars / pearls (very low saturation & high value)
        is_bright_white = (s_val < 0.14) & (v_val > 0.88)
        strip = warm_halo & (~is_bright_white)
        if not np.any(strip):
            break
        out[strip, 3] = 0
        bg_mask |= strip

    # Soften remaining 1px outer perimeter slightly
    bg_up = np.pad(bg_mask[:-1, :], ((1, 0), (0, 0)), constant_values=True)
    bg_dn = np.pad(bg_mask[1:, :], ((0, 1), (0, 0)), constant_values=True)
    bg_lt = np.pad(bg_mask[:, :-1], ((0, 0), (1, 0)), constant_values=True)
    bg_rt = np.pad(bg_mask[:, 1:], ((0, 0), (0, 1)), constant_values=True)
    edge = (~bg_mask) & (bg_up | bg_dn | bg_lt | bg_rt)
    soft = edge & (dist < 48.0)
    out[soft, 3] = np.minimum(out[soft, 3], 180)
    return out


def apply_seam_feather_4px(rgba: np.ndarray, seam_mask: np.ndarray) -> np.ndarray:
    """
    Apply a clean 4px inner trim & alpha feather ONLY along interior segmentation
    seam boundaries (where neighbor figures were dropped), stripping any residual
    1-4px fringe slivers while leaving faces, teeth, pearls, and gloves untouched.
    """
    if not np.any(seam_mask):
        return rgba
    out = rgba.copy()
    cur = seam_mask.copy()
    alpha_caps = [0, 0, 96, 196]
    for cap in alpha_caps:
        up = np.pad(cur[:-1, :], ((1, 0), (0, 0)), constant_values=False)
        dn = np.pad(cur[1:, :], ((0, 1), (0, 0)), constant_values=False)
        lt = np.pad(cur[:, :-1], ((0, 0), (1, 0)), constant_values=False)
        rt = np.pad(cur[:, 1:], ((0, 0), (0, 1)), constant_values=False)
        ring = (~cur) & (up | dn | lt | rt) & (out[:, :, 3] > 0)
        if cap == 0:
            out[ring, 3] = 0
        else:
            out[ring, 3] = np.minimum(out[ring, 3], cap)
        cur = cur | ring
    return out


def segment_all_16_spectators(
    front_path: Path, back_path: Path
) -> dict[str, dict[str, Any]]:
    """
    Segments all 16 waist-up spectators (`F1..F8` and `B1..B8`), normalized 1:1
    to `CROWD_CANVAS_HEAD = 157.5px` (1.5x of 105.0px final Rows 1-3 head height)
    with exact `y_chin` landmark tracking, zero railing, and zero neighbor slivers.
    """
    with Image.open(front_path) as im_f:
        arr_f_full = np.asarray(im_f.convert("RGB"), dtype=np.float32)
    border_f = np.concatenate(
        [arr_f_full[0, :], arr_f_full[-1, :], arr_f_full[:, 0], arr_f_full[:, -1]],
        axis=0,
    )
    bg_f = np.median(border_f, axis=0)
    arr_f_crop = arr_f_full[CROWD_FRONT_Y_TOP:CROWD_FRONT_Y_RAIL, :, :]
    rgba_f_crop = extract_plate_rgba(arr_f_crop, bg_f, thresh=19.0, fringe_thresh=27.0)
    rgba_f_crop = strip_outer_cream_halo(rgba_f_crop, bg_f, dist_thresh=42.0)

    # (cid, x0, x1, y_crown, y_chin, y_collar, y_hat) verified from pixel landmarks
    front_specs = [
        ("F1", 124, 247, 224, 304, 326, 242),
        ("F2", 256, 413, 210, 293, 315, 0),
        ("F3", 416, 536, 224, 304, 328, 0),
        ("F4", 540, 703, 220, 301, 324, 0),
        ("F5", 705, 831, 225, 307, 330, 0),
        ("F6", 834, 993, 212, 295, 316, 0),
        ("F7", 996, 1117, 224, 304, 327, 245),
        ("F8", 1120, 1265, 218, 297, 318, 0),
    ]

    cutouts: dict[str, dict[str, Any]] = {}
    for cid, x0, x1, y_crown, y_chin, y_collar, y_hat in front_specs:
        scale = CROWD_CANVAS_HEAD / float(y_chin - y_crown)
        sub_raw = rgba_f_crop[:, x0:x1, :].copy()
        if cid == "F1":
            # Keep crisp white-gloved finger outlines intact while stripping tiny isolated dots
            sub = keep_largest_component(sub_raw, min_area=120)
        else:
            sub = keep_largest_component(sub_raw, min_area=120)
        pil_sub = Image.fromarray(sub, mode="RGBA")
        nw = max(1, int(round(pil_sub.width * scale)))
        nh = max(1, int(round(pil_sub.height * scale)))
        scaled = pil_sub.resize((nw, nh), Image.Resampling.LANCZOS)
        cutouts[cid] = {
            "id": cid,
            "image": scaled,
            "y_chin": (y_chin - CROWD_FRONT_Y_TOP) * scale,
            "y_crown": (y_crown - CROWD_FRONT_Y_TOP) * scale,
            "y_collar": int(round((y_collar - CROWD_FRONT_Y_TOP) * scale)),
            "y_hat": int(round((y_hat - CROWD_FRONT_Y_TOP) * scale)) if y_hat > 0 else 0,
        }

    with Image.open(back_path) as im_b:
        arr_b_full = np.asarray(im_b.convert("RGB"), dtype=np.float32)
    border_b = np.concatenate(
        [arr_b_full[0, :], arr_b_full[-1, :], arr_b_full[:, 0], arr_b_full[:, -1]],
        axis=0,
    )
    bg_b = np.median(border_b, axis=0)
    rgba_b_full = extract_plate_rgba(arr_b_full, bg_b, thresh=14.8, fringe_thresh=22.5)
    bh, bw, _ = rgba_b_full.shape
    hb, sb, vb = rgb_to_hsv_deg(rgba_b_full[:, :, :3])
    dist_b = np.sqrt(np.sum((arr_b_full - bg_b[None, None, :]) ** 2, axis=2))
    yy, xx = np.mgrid[0:bh, 0:bw]

    # Repair tiny BFS leaks inside B7's shaded cream dress stripe (x=1105..1156, y=396..580)
    b7_white_fill = (
        (xx >= 1106)
        & (xx <= 1154)
        & (yy >= 398)
        & (yy <= 580)
        & (rgba_b_full[:, :, 3] < 245)
        & (xx <= np.where(yy < 450, 1148 - (yy - 398) * 0.15, 1140))
    )
    rgba_b_full[b7_white_fill, :3] = np.clip(arr_b_full[b7_white_fill], 0, 255).astype(np.uint8)
    rgba_b_full[b7_white_fill, 3] = 255

    back_polys: dict[str, list[tuple[int, int]]] = {
        "B1": [(30, 0), (204, 0), (204, 385), (234, 408), (234, 448), (211, 482), (205, 520), (201, 768), (30, 768)],
        "B2": [(205, 0), (365, 0), (365, 365), (390, 390), (401, 445), (402, 515), (395, 560), (393, 768), (203, 768), (207, 518), (220, 475), (220, 415), (205, 392)],
        "B3": [(368, 0), (536, 0), (536, 375), (550, 392), (597, 422), (596, 472), (554, 530), (544, 560), (544, 768), (402, 768), (403, 440), (396, 390), (368, 365)],
        "B4": [(555, 0), (680, 0), (680, 355), (705, 385), (717, 450), (720, 620), (718, 768), (555, 768)],
        "B5": [
            (675, 0), (866, 0), (866, 305), (888, 340), (866, 375), (885, 420),
            (896, 478), (892, 535), (868, 565), (866, 768), (732, 768),
            (742, 548), (739, 490), (732, 430), (731, 380), (724, 352), (675, 345),
        ],
        "B6": [(872, 0), (1000, 0), (1000, 375), (1046, 394), (1046, 440), (1012, 458), (1012, 580), (1038, 605), (1038, 768), (872, 768)],
        "B7": [
            (998, 0), (1146, 0), (1146, 348), (1126, 360), (1148, 392),
            (1168, 410), (1186, 390), (1209, 393), (1201, 456), (1178, 522), (1174, 768),
            (1036, 768), (1045, 520), (1032, 480), (1021, 435), (1022, 405), (1038, 372),
            (1036, 345), (998, 320),
        ],
        "B8": [(1140, 0), (1350, 0), (1350, 768), (1174, 768), (1206, 535), (1206, 385), (1146, 385), (1140, 360)],
    }

    # (cid, y_crown, y_chin, y_collar) verified from head_landmarks.png
    back_specs = [
        ("B1", 206, 334, 368),
        ("B2", 174, 297, 335),
        ("B3", 207, 333, 365),
        ("B4", 174, 298, 335),
        ("B5", 210, 341, 372),
        ("B6", 188, 306, 345),
        ("B7", 221, 350, 378),
        ("B8", 201, 330, 360),
    ]

    for cid, y_crown, y_chin, y_collar in back_specs:
        scale = CROWD_CANVAS_HEAD / float(y_chin - y_crown)
        y_waist = min(bh, int(round(y_chin + 260.0 / scale)))
        poly = back_polys[cid]
        pmask = polygon_mask(bh, bw, poly)
        work = rgba_b_full.copy()
        seam_drop = ~pmask
        work[seam_drop, 3] = 0

        if cid == "B1":
            drop = (xx >= 198) & (yy >= 385) & (yy <= 540) & (hb > 30.0) & (hb < 220.0) & (sb > 0.30)
            work[drop, 3] = 0
            seam_drop |= drop
        elif cid == "B2":
            drop = (xx <= 235) & (yy >= 395) & (yy <= 545) & (hb <= 31.0)
            work[drop, 3] = 0
            seam_drop |= drop
            ref_yellow = np.array([218, 162, 42, 255], dtype=np.uint8)
            for ry in range(402, 542):
                sleeve_x = np.where((work[ry, 212:248, 3] > 180) & (hb[ry, 212:248] >= 32.0) & (hb[ry, 212:248] <= 65.0))[0] + 212
                fill_px = work[ry, int(sleeve_x[0])] if sleeve_x.size > 0 else ref_yellow
                if sleeve_x.size > 0:
                    ref_yellow = fill_px
                left_edge = 207 if ry >= 425 else max(207, 224 - (ry - 402))
                for rx in range(left_edge + 2, 236):
                    if work[ry, rx, 3] < 180:
                        mx = min(bw - 1, max(206, 2 * 298 - rx))
                        if work[ry, mx, 3] > 180 and 32.0 <= hb[ry, mx] <= 62.0:
                            work[ry, rx] = work[ry, mx]
                        else:
                            work[ry, rx] = fill_px
                work[ry, left_edge:left_edge + 2] = np.array([42, 28, 16, 255], dtype=np.uint8)
                seam_drop[ry, left_edge:left_edge + 2] = False
        elif cid == "B3":
            drop1 = (xx >= 532) & (yy >= 372) & (yy <= 570) & (vb < 0.56) & (hb > 20.0) & (hb < 60.0)
            drop2 = (xx <= 412) & (yy >= 350) & (hb > 27.0) & (hb < 75.0)
            work[drop1 | drop2, 3] = 0
            seam_drop |= drop1 | drop2
        elif cid == "B4":
            drop1 = ((xx <= 599) & (yy >= 320) & (yy <= 620)) | ((xx <= 609) & (yy >= 380) & (yy <= 465))
            drop2 = (xx >= 716) & (yy >= 355) & (hb > 55.0) & (sb > 0.25)
            work[drop1 | drop2, 3] = 0
            seam_drop |= drop2
            # Mirror clean right herringbone tweed onto left shoulder inside smooth shoulder contour
            ref_tweed = np.array([104, 82, 58, 255], dtype=np.uint8)
            for ry in range(360, min(621, bh)):
                x_min_shoulder = max(558, int(round(596 - min(38.0, (ry - 360) * 0.85))))
                x_max_fill = 610 if 380 <= ry <= 465 else 600
                for rx in range(x_min_shoulder, x_max_fill):
                    mx = 2 * 644 - rx
                    placed = False
                    if 0 <= mx < bw:
                        for tx in (mx, min(bw - 1, mx + 14), min(bw - 1, mx - 14), min(bw - 1, mx + 26)):
                            if work[ry, tx, 3] > 180 and 18.0 <= hb[ry, tx] <= 48.0 and 0.16 <= sb[ry, tx] <= 0.65 and vb[ry, tx] < 0.72:
                                work[ry, rx] = work[ry, tx]
                                ref_tweed = work[ry, tx]
                                placed = True
                                break
                    if not placed:
                        work[ry, rx] = ref_tweed
                    seam_drop[ry, rx] = False
        elif cid == "B5":
            # Kill 100% of B4's tan/brown coat sliver on left edge & enclosed cream pocket on right
            drop_left = (xx <= 748) & (yy >= 360) & (
                ((hb < 54.0) & (sb < 0.48) & ~((xx >= 740) & (yy >= 485) & (hb >= 10.0) & (hb <= 34.0) & (sb >= 0.42)))
                | (xx <= 731)
            )
            drop_pocket = (xx >= 835) & (xx <= 862) & (yy >= 306) & (yy <= 358) & (dist_b < 24.0)
            in_b5_b6 = (xx >= 864) & (yy >= 360) & (yy <= 590)
            is_b5_green = (hb >= 58.0) & (hb <= 108.0) & (sb >= 0.35)
            is_b5_hand = (yy <= 406) & (hb >= 14.0) & (hb <= 36.0) & (sb >= 0.40) & (vb <= 0.68)
            keep_b5 = is_b5_green | is_b5_hand
            drop_all = drop_left | drop_pocket | (in_b5_b6 & (~keep_b5))
            work[drop_all, 3] = 0
            # Feather left seam cleanly, but protect delicate raised fingertips on right (y <= 395)
            seam_drop |= drop_left | ((in_b5_b6 & (~keep_b5)) & (yy > 395))
        elif cid == "B6":
            drop1 = (xx <= 900) & (yy >= 270) & (yy <= 620)
            drop2 = (xx >= 1000) & (yy < 370)
            drop3 = (xx >= 1022) & (yy >= 400) & (yy <= 455) & (
                (vb < 0.32) | ((hb < 22.0) & (sb >= 0.64) & (vb < 0.72))
            )
            work[drop1 | drop2 | drop3, 3] = 0
            seam_drop |= drop2 | (drop3 & (xx >= 1038))
            for ry in range(375, min(610, bh)):
                for rx in range(876, 908):
                    mx = 2 * 942 - rx
                    if 0 <= mx < bw and work[ry, mx, 3] > 180 and work[ry, rx, 3] < 128:
                        work[ry, rx] = work[ry, mx]
                        seam_drop[ry, rx] = False
        elif cid == "B7":
            # Kill 100% of B8's green jacket/stripes on right and B6's plaid/fingers on left
            drop_b8_green = (xx >= 1122) & (yy >= 345) & (hb >= 42.0) & (hb <= 165.0) & (sb >= 0.22)
            drop_b8_lapel = (xx >= 1126) & (yy >= 348) & (yy <= 394) & (vb < 0.56)
            drop_b8_stripes = (xx >= 1152) & (yy >= 458) & (hb >= 25.0) & (sb >= 0.24) & (vb < 0.74)
            drop_b6_left = (xx <= 1046) & (yy >= 360) & (
                (hb > 36.0)
                | (sb < 0.36)
                | ((yy <= 410) & (xx <= 1022))
                | ((yy >= 445) & (xx <= 1034))
            )
            drop_all = drop_b8_green | drop_b8_lapel | drop_b8_stripes | drop_b6_left
            work[drop_all, 3] = 0
            seam_drop |= drop_all
        elif cid == "B8":
            drop1 = (xx <= 1156) & (yy < 375)
            work[drop1, 3] = 0
            seam_drop |= drop1
            for ry in range(385, min(555, bh)):
                for rx in range(1145, 1208):
                    mx = 2 * 1210 - rx
                    if 0 <= mx < bw and work[ry, mx, 3] > 180 and work[ry, rx, 3] < 128:
                        work[ry, rx] = work[ry, mx]
                        seam_drop[ry, rx] = False

        work = apply_seam_feather_4px(work, seam_drop)
        work = strip_outer_cream_halo(work, bg_b, dist_thresh=36.0)

        work_crop = work[:y_waist, :, :]
        nz_x = np.where(np.any(work_crop[:, :, 3] > 20, axis=0))[0]
        x_lo = max(0, int(nz_x[0]) - 2) if nz_x.size else 0
        x_hi = min(bw, int(nz_x[-1]) + 3) if nz_x.size else bw
        sub = keep_largest_component(work_crop[:, x_lo:x_hi, :].copy(), min_area=120)

        pil_sub = Image.fromarray(sub, mode="RGBA")
        nw = max(1, int(round(pil_sub.width * scale)))
        nh = max(1, int(round(pil_sub.height * scale)))
        scaled = pil_sub.resize((nw, nh), Image.Resampling.LANCZOS)
        cutouts[cid] = {
            "id": cid,
            "image": scaled,
            "y_chin": y_chin * scale,
            "y_crown": y_crown * scale,
            "y_collar": int(round(y_collar * scale)),
            "y_hat": 0,
        }

    return cutouts


def tailor_wardrobe_hsv(
    cutout: dict[str, Any],
    palette_name: str | None,
) -> Image.Image:
    im: Image.Image = cutout["image"]
    if not palette_name:
        return im.copy()
    target_h, target_s, v_mult = PALETTES_1966[palette_name]
    rgba = np.asarray(im, dtype=np.uint8).copy()
    h_px, w_px, _ = rgba.shape
    y_collar = int(cutout["y_collar"])
    y_hat = int(cutout["y_hat"])

    hsv_h, hsv_s, hsv_v = rgb_to_hsv_deg(rgba[:, :, :3])
    yy, xx = np.mgrid[0:h_px, 0:w_px]

    zone = yy >= y_collar
    if y_hat > 0:
        zone |= (yy <= y_hat) & (hsv_s > 0.16)

    non_white = (hsv_s >= 0.21) & (~((hsv_s < 0.30) & (hsv_v > 0.84)))
    non_dark = hsv_v >= 0.22
    fg = rgba[:, :, 3] > 24

    cid = cutout["id"]
    skin_excl = np.zeros((h_px, w_px), dtype=bool)
    if cid == "F1":
        skin_excl = (yy >= y_collar) & (hsv_h >= 15.5) & (hsv_h <= 34.0)
    elif cid in {"F3", "F5", "F6", "B3"}:
        skin_excl = (hsv_h >= 12.0) & (hsv_h <= 36.0)
    elif cid == "F7":
        skin_excl = (yy >= y_collar) & (hsv_h <= 34.0)
    elif cid in {"F2", "F4", "F8"}:
        hand_box = (
            (np.abs(xx - 0.5 * w_px) < 0.22 * w_px)
            & (yy >= y_collar + 10)
            & (yy <= y_collar + 0.65 * (h_px - y_collar))
            & (hsv_h >= 15.0)
            & (hsv_h <= 31.0)
            & (hsv_s >= 0.42)
        )
        if cid in {"F2", "F8"}:
            hand_box &= hsv_v >= 0.56
        skin_excl = hand_box
    elif cid == "B1":
        skin_excl = (hsv_h >= 14.5) & (hsv_h <= 36.0)
    elif cid == "B2":
        skin_excl = (hsv_h >= 12.0) & (hsv_h <= 29.0)
    elif cid == "B5":
        skin_excl = (hsv_h >= 12.0) & (hsv_h <= 30.0)
    elif cid == "B6":
        skin_excl = (
            (xx >= 0.32 * w_px)
            & (xx <= 0.95 * w_px)
            & (yy >= y_collar + 15)
            & (yy <= y_collar + 0.65 * (h_px - y_collar))
            & (hsv_h >= 15.0)
            & (hsv_h <= 27.0)
            & (hsv_s >= 0.45)
            & (hsv_s <= 0.68)
            & (hsv_v >= 0.72)
        )
    elif cid == "B7":
        skin_excl = (hsv_s < 0.72) | (hsv_v > 0.80)

    mask = fg & zone & non_white & non_dark & (~skin_excl)
    if np.any(mask):
        new_h = np.where(mask, target_h, hsv_h)
        new_s = np.where(mask, np.clip(0.45 * hsv_s + 0.55 * target_s, 0.22, 0.92), hsv_s)
        new_v = np.where(mask, np.clip(hsv_v * v_mult, 0.14, 0.96), hsv_v)
        new_rgb = hsv_deg_to_rgb_u8(new_h, new_s, new_v)
        rgba[mask, :3] = new_rgb[mask]

    return Image.fromarray(rgba, mode="RGBA")


def trim_horizontal_and_top(
    im: Image.Image,
    y_chin: float | None = None,
) -> tuple[Image.Image, float]:
    bbox = im.getbbox()
    if not bbox:
        return im, (y_chin if y_chin is not None else float(im.height))
    cropped = im.crop((bbox[0], bbox[1], bbox[2], im.height))
    new_y_chin = (y_chin - bbox[1]) if y_chin is not None else float(cropped.height)
    return cropped, new_y_chin


def alpha_composite_clipped(
    canvas: Image.Image,
    fg: Image.Image,
    px: int,
    py: int,
) -> None:
    """Safely alpha-composite `fg` at arbitrary `(px, py)` with clean edge cropping."""
    cw, ch = canvas.size
    fw, fh = fg.size
    x0 = max(0, px)
    y0 = max(0, py)
    x1 = min(cw, px + fw)
    y1 = min(ch, py + fh)
    if x1 <= x0 or y1 <= y0:
        return
    sx0 = x0 - px
    sy0 = y0 - py
    sx1 = sx0 + (x1 - x0)
    sy1 = sy0 + (y1 - y0)
    patch = fg.crop((sx0, sy0, sx1, sy1))
    canvas.alpha_composite(patch, (x0, y0))


def render_crowd_figure(
    cutouts: dict[str, dict[str, Any]],
    cid: str,
    mirror: bool = False,
    palette: str | None = None,
    scale_mult: float = 1.0,
    tilt_deg: float = 0.0,
) -> tuple[Image.Image, float]:
    cutout = cutouts[cid]
    im = tailor_wardrobe_hsv(cutout, palette)
    y_chin = float(cutout["y_chin"])
    im, y_chin = trim_horizontal_and_top(im, y_chin)
    if mirror:
        im = im.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    if abs(scale_mult - 1.0) > 1e-4:
        im = im.resize(
            (max(1, int(round(im.width * scale_mult))), max(1, int(round(im.height * scale_mult)))),
            Image.Resampling.LANCZOS,
        )
        y_chin *= scale_mult
    if abs(tilt_deg) > 1e-3:
        ow, oh = im.size
        im = im.rotate(-tilt_deg, resample=Image.Resampling.BICUBIC, expand=True)
        nh = im.height
        dy = y_chin - oh * 0.5
        rad = math.radians(tilt_deg)
        y_chin = nh * 0.5 + dy * math.cos(rad)
    return trim_horizontal_and_top(im, y_chin)


def composite_crowd_row(
    cutouts: dict[str, dict[str, Any]],
    specs: list[tuple[str, bool, str | None, float, float]],
    out_size: tuple[int, int] = (1280, 360),
    canvas_size: tuple[int, int] = (1920, 540),
    pitch: int = 240,
    target_head_out: float = CROWD_OUT_HEAD_ROW,
    target_y_chin_out: float = 196.0,
) -> Image.Image:
    cw, ch = canvas_size
    _, out_h = out_size
    row_scale = (target_head_out * (float(ch) / float(out_h))) / CROWD_CANVAS_HEAD
    target_y_chin_canvas = target_y_chin_out * (float(ch) / float(out_h))

    canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    wide_ids = {"F2", "F4", "F6", "F8", "B4", "B8"}

    rendered: list[tuple[int, str, Image.Image, float]] = []
    for idx, (cid, mirror, palette, sc, tilt) in enumerate(specs):
        fig, y_chin = render_crowd_figure(cutouts, cid, mirror, palette, sc * row_scale, tilt)
        rendered.append((idx, cid, fig, y_chin))

    # Paste wider-shouldered figures first so narrower neighbors layer cleanly in front
    ordered = sorted(rendered, key=lambda item: (0 if item[1] in wide_ids else 1, item[0]))
    for idx, cid, fig, y_chin in ordered:
        cx = idx * pitch + pitch // 2
        px = int(round(cx - fig.width * 0.5))
        py = int(round(target_y_chin_canvas - y_chin))
        alpha_composite_clipped(canvas, fig, px, py)

    return canvas.resize(out_size, Image.Resampling.LANCZOS)


def pack_grid_sheet(
    paths: list[Path],
    cols: int,
    cell_size: int,
    out_file: Path,
    category: str,
    atlas_group: str,
) -> dict[str, dict[str, Any]]:
    if not paths:
        return {}
    rows = math.ceil(len(paths) / cols)
    sheet_w = cols * cell_size
    sheet_h = rows * cell_size
    sheet = Image.new("RGB", (sheet_w, sheet_h), (250, 242, 223))

    entries: dict[str, dict[str, Any]] = {}
    for idx, src_path in enumerate(paths):
        target_id = src_path.stem
        col = idx % cols
        row = idx // cols
        x = col * cell_size
        y = row * cell_size

        with Image.open(src_path) as raw_im:
            im = raw_im.convert("RGB").resize(
                (cell_size, cell_size), Image.Resampling.LANCZOS
            )
            sheet.paste(im, (x, y))

        entries[target_id] = {
            "targetId": target_id,
            "file": out_file.name,
            "x": x,
            "y": y,
            "w": cell_size,
            "h": cell_size,
            "sheetW": sheet_w,
            "sheetH": sheet_h,
            "category": category,
            "atlasGroup": atlas_group,
        }

    sheet.save(out_file, format="WEBP", quality=80, method=6)
    return entries


def pack_crowd_sheet(
    paths: list[Path],
    out_file: Path,
) -> dict[str, dict[str, Any]]:
    if not paths:
        return {}
    front_path = next((p for p in paths if "front" in p.stem), None)
    back_path = next((p for p in paths if "back" in p.stem), None)
    if front_path is None or back_path is None:
        raise RuntimeError(f"Expected both studio_crowd_front and studio_crowd_back, got {paths}")

    cutouts = segment_all_16_spectators(front_path, back_path)
    sheet_w, sheet_h = CROWD_SHEET_SIZE
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))

    row1 = composite_crowd_row(
        cutouts,
        [(cid, False, None, 1.0, 0.0) for cid in ["F1", "B3", "F4", "B6", "F2", "F7", "B1", "F8"]],
    )
    row2 = composite_crowd_row(
        cutouts,
        [(cid, False, None, 1.0, 0.0) for cid in ["B2", "F3", "B4", "F5", "B5", "F6", "B7", "B8"]],
    )
    row3 = composite_crowd_row(
        cutouts,
        [
            ("B5", True, "harvest_gold", 1.01, 1.2),
            ("F6", True, "broadcast_cobalt", 0.99, -1.0),
            ("B1", True, "peacock_teal", 1.00, 1.0),
            ("F2", True, "walnut_tweed", 1.01, -0.8),
            ("B7", True, "carnaby_cerise", 0.99, 1.5),
            ("F4", True, "avocado_olive", 1.01, -0.8),
            ("B3", True, "orchid_mod", 0.99, 1.2),
            ("F5", True, "peacock_teal", 1.01, -1.2),
        ],
    )

    # All 12 VIP seats use 12 DIFFERENT spectators from the 15-person non-B8 pool
    vip_slot_specs: list[list[tuple[str, bool, str | None, float, float]]] = [
        [("F1", False, "peacock_teal", 1.0, 0.0), ("B4", True, "broadcast_cobalt", 1.0, 0.0)],
        [("F3", False, "harvest_gold", 1.0, 0.0), ("B2", True, "carnaby_cerise", 1.0, 0.0)],
        [("F7", False, "carnaby_cerise", 1.0, 0.0), ("B6", True, "avocado_olive", 1.0, 0.0)],
        [("F5", False, "broadcast_cobalt", 1.0, 0.0), ("B1", False, "harvest_gold", 1.0, 0.0)],
        [("F8", True, "walnut_tweed", 1.0, 0.0), ("B5", True, "peacock_teal", 1.0, 0.0)],
        [("F2", False, "atomic_tangerine", 1.0, 0.0), ("B7", True, "orchid_mod", 1.0, 0.0)],
    ]
    vip_ids = [cid for slot in vip_slot_specs for (cid, *_rest) in slot]
    if len(vip_ids) != 12 or len(set(vip_ids)) != 12 or "B8" in vip_ids:
        raise RuntimeError(f"VIP pairs must have 12 unique non-B8 spectators, got {vip_ids}")

    sheet.paste(row1, (0, 0), row1)
    sheet.paste(row2, (0, 360), row2)
    sheet.paste(row3, (0, 720), row3)

    for slot_idx, pair_spec in enumerate(vip_slot_specs):
        slot_im = composite_crowd_row(
            cutouts,
            pair_spec,
            out_size=(213, 240),
            canvas_size=(426, 480),
            pitch=213,
            target_head_out=CROWD_OUT_HEAD_VIP,
            target_y_chin_out=126.0,
        )
        sheet.paste(slot_im, (slot_idx * 213, 1080), slot_im)

    sheet.save(out_file, format="WEBP", quality=80, method=6)

    def make_entry(target_id: str, x: int, y: int, w: int, h: int) -> dict[str, Any]:
        return {
            "targetId": target_id,
            "file": out_file.name,
            "x": x,
            "y": y,
            "w": w,
            "h": h,
            "sheetW": sheet_w,
            "sheetH": sheet_h,
            "category": "studio_crowd",
            "atlasGroup": "atlas_crowd",
        }

    return {
        "crowd_row_1": make_entry("crowd_row_1", 0, 0, 1280, 360),
        "studio_crowd_front": make_entry("studio_crowd_front", 0, 0, 1280, 360),
        "crowd_row_2": make_entry("crowd_row_2", 0, 360, 1280, 360),
        "studio_crowd_back": make_entry("studio_crowd_back", 0, 360, 1280, 360),
        "crowd_row_3": make_entry("crowd_row_3", 0, 720, 1280, 360),
        "crowd_vip_pairs": make_entry("crowd_vip_pairs", 0, 1080, 1278, 240),
    }


def pack_backdrops(
    paths: list[Path],
    size: tuple[int, int],
    out_dir: Path,
) -> dict[str, dict[str, Any]]:
    bw, bh = size
    entries: dict[str, dict[str, Any]] = {}
    for src_path in paths:
        target_id = src_path.stem
        out_name = f"{target_id}.jpg"
        out_file = out_dir / out_name
        category = "den_backdrop" if "den_" in target_id else "curtain_backdrop"

        with Image.open(src_path) as raw_im:
            im = raw_im.convert("RGB").resize((bw, bh), Image.Resampling.LANCZOS)
            im.save(
                out_file,
                format="JPEG",
                quality=80,
                optimize=True,
                progressive=True,
            )

        entries[target_id] = {
            "targetId": target_id,
            "file": out_name,
            "x": 0,
            "y": 0,
            "w": bw,
            "h": bh,
            "sheetW": bw,
            "sheetH": bh,
            "category": category,
            "atlasGroup": "scene_backdrops",
        }
    return entries


def main() -> None:
    if not RAW_ART_DIR.exists():
        raise FileNotFoundError(f"Missing raw art directory: {RAW_ART_DIR}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Remove stale packed artifacts in OUT_DIR before regenerating
    for stale in OUT_DIR.iterdir():
        if stale.is_file() and stale.suffix.lower() in {".webp", ".jpg", ".jpeg", ".png", ".json"}:
            stale.unlink()

    all_pngs = sorted(RAW_ART_DIR.glob("*.png"), key=lambda p: p.name)
    if not all_pngs:
        raise RuntimeError(f"No PNG files found in {RAW_ART_DIR}")

    vip_paths: list[Path] = []
    prize_paths: list[Path] = []
    zonk_paths: list[Path] = []
    crowd_paths: list[Path] = []
    backdrop_paths: list[Path] = []
    unknown_paths: list[Path] = []

    for p in all_pngs:
        stem = p.stem
        if stem.startswith("vip_"):
            vip_paths.append(p)
        elif stem.startswith("prize_"):
            prize_paths.append(p)
        elif stem.startswith("zonk_"):
            zonk_paths.append(p)
        elif stem.startswith("studio_crowd_"):
            crowd_paths.append(p)
        elif "_backdrop_" in stem:
            backdrop_paths.append(p)
        else:
            unknown_paths.append(p)

    if unknown_paths:
        raise ValueError(
            f"Unrecognized PNG filename prefixes in {RAW_ART_DIR}: {[p.name for p in unknown_paths]}"
        )

    # Order studio_crowd_front first (row 0), studio_crowd_back second (row 1)
    crowd_paths.sort(key=lambda p: (0 if "front" in p.stem else 1, p.stem))

    sprites: dict[str, dict[str, Any]] = {}
    sprites.update(
        pack_grid_sheet(
            vip_paths,
            cols=4,
            cell_size=CELL_SIZE,
            out_file=OUT_DIR / "atlas_vip.webp",
            category="vip_celeb",
            atlas_group="atlas_vip",
        )
    )
    sprites.update(
        pack_grid_sheet(
            prize_paths,
            cols=8,
            cell_size=CELL_SIZE,
            out_file=OUT_DIR / "atlas_prizes.webp",
            category="prize",
            atlas_group="atlas_prizes",
        )
    )
    sprites.update(
        pack_grid_sheet(
            zonk_paths,
            cols=4,
            cell_size=CELL_SIZE,
            out_file=OUT_DIR / "atlas_zonks.webp",
            category="zonk",
            atlas_group="atlas_zonks",
        )
    )
    sprites.update(
        pack_crowd_sheet(
            crowd_paths,
            out_file=OUT_DIR / "atlas_crowd.webp",
        )
    )
    sprites.update(pack_backdrops(backdrop_paths, size=BACKDROP_SIZE, out_dir=OUT_DIR))

    sorted_sprites = {k: sprites[k] for k in sorted(sprites.keys())}
    manifest = {
        "version": "WS_V9_ATLAS_1",
        "generatedFromCount": len(all_pngs),
        "sprites": sorted_sprites,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    files_summary: list[tuple[str, int]] = []
    total_bytes = 0
    for f in sorted(OUT_DIR.iterdir()):
        if f.is_file():
            sz = f.stat().st_size
            total_bytes += sz
            files_summary.append((f.name, sz))

    print(
        f"Packed {len(all_pngs)} raw PNGs -> {len(sorted_sprites)} manifest sprites "
        f"(VIP={len(vip_paths)}, Prize={len(prize_paths)}, Zonk={len(zonk_paths)}, "
        f"Crowd={len(crowd_paths)}, Backdrop={len(backdrop_paths)})"
    )
    for fname, sz in files_summary:
        print(f"  {fname}: {sz:,} B")
    print(f"Total public/assets/v9/: {total_bytes:,} B ({total_bytes / 1_000_000:.4f} MB decimal)")

    if total_bytes > MAX_V9_ASSETS_BYTES:
        raise RuntimeError(
            f"public/assets/v9/ exceeded budget: {total_bytes:,} B > {MAX_V9_ASSETS_BYTES:,} B"
        )


if __name__ == "__main__":
    main()
