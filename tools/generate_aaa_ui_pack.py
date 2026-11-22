#!/usr/bin/env python3
"""
World's Smartest — AAA Luxury UI Art Pack Generator (Godot 4.7.2)
=================================================================
Generates physically-inspired, bevel-lit, PBR-shaded 2D luxury UI textures
(Hearthstone x Persona 5 x Millionaire PS5 x The Room craftsmanship):

  - 8 Sculpted NinePatch UI Frames & Buttons (512x256 RGBA, 2x supersampled):
      panel_tableau.png, panel_dialogue_cinema.png,
      btn_answer_idle.png, btn_answer_hover.png,
      btn_answer_correct.png, btn_answer_wrong.png,
      btn_gold_primary.png, btn_gold_hover.png
  - Championship Stars, Streak Crest, Corner Filigree & Radial Particle Bloom:
      star_filled.png (192x192), star_empty.png (192x192),
      badge_streak_fire.png (256x256), corner_filigree.png (192x192),
      spark_glow.png (128x128)
  - 12 Illustrated Sovereign Enamel Category Medallions (192x192 RGBA, 3x SS):
      cat_0.png .. cat_11.png
  - Full Visual QA Contact Sheet (1920x1080):
      assets/renders/ui_pack_contact_sheet.png
"""

from __future__ import annotations

import math
import os
from pathlib import Path
from typing import Callable, Tuple

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT_UI = ROOT / "godot" / "assets" / "ui"
OUT_PUBLIC_UI = ROOT / "public" / "assets" / "ui"
OUT_RENDERS = ROOT / "assets" / "renders"

OUT_UI.mkdir(parents=True, exist_ok=True)
OUT_PUBLIC_UI.mkdir(parents=True, exist_ok=True)
OUT_RENDERS.mkdir(parents=True, exist_ok=True)


# ==============================================================================
# MATH, NOISE, PBR METALLIC & GLASS SHADING CORE
# ==============================================================================

def clamp01(x: np.ndarray) -> np.ndarray:
    return np.clip(x, 0.0, 1.0)


def smoothstep(e0: float, e1: float, x: np.ndarray) -> np.ndarray:
    t = clamp01((x - e0) / (e1 - e0 + 1e-12))
    return t * t * (3.0 - 2.0 * t)


def value_noise_2d(h: int, w: int, scale_y: float, scale_x: float, seed: int) -> np.ndarray:
    """Smooth bilinearly-upsampled procedural noise in [0, 1]."""
    rng = np.random.default_rng(seed)
    gh = max(2, int(round(h / scale_y)) + 2)
    gw = max(2, int(round(w / scale_x)) + 2)
    grid = rng.random((gh, gw), dtype=np.float32)
    img = Image.fromarray((grid * 255.0).astype(np.uint8), mode="L")
    up = img.resize((w, h), resample=Image.Resampling.BICUBIC)
    return np.asarray(up, dtype=np.float32) / 255.0


def fbm_2d(h: int, w: int, base_scale: float, octaves: int = 4, seed: int = 101) -> np.ndarray:
    acc = np.zeros((h, w), dtype=np.float32)
    amp = 0.55
    norm = 0.0
    sc = base_scale
    for i in range(octaves):
        acc += amp * value_noise_2d(h, w, sc, sc, seed + i * 37)
        norm += amp
        amp *= 0.52
        sc = max(3.0, sc * 0.5)
    return acc / max(norm, 1e-6)


def brushed_metal_noise(h: int, w: int, horizontal: bool = True, seed: int = 42) -> np.ndarray:
    """Fine anisotropic brushed-metal grain in [-1, 1]."""
    rng = np.random.default_rng(seed)
    raw = rng.standard_normal((h, w)).astype(np.float32)
    if horizontal:
        grain = ndimage.gaussian_filter(raw, sigma=(0.45, 11.0))
        fine = ndimage.gaussian_filter(raw, sigma=(0.35, 3.2))
    else:
        grain = ndimage.gaussian_filter(raw, sigma=(11.0, 0.45))
        fine = ndimage.gaussian_filter(raw, sigma=(3.2, 0.35))
    out = grain * 0.72 + fine * 0.28
    std = float(np.std(out)) + 1e-6
    return np.clip(out / (std * 2.4), -1.0, 1.0)


def obsidian_marble_texture(h: int, w: int, seed: int = 77) -> Tuple[np.ndarray, np.ndarray]:
    """
    Domain-warped luxury dark-obsidian-marble veins + fine mineral micro-grain.
    Returns (vein_mask [0..1], fine_grain [-1..1]).
    """
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    nx = xx / max(w, 1)
    ny = yy / max(h, 1)
    warp1 = fbm_2d(h, w, base_scale=max(w, h) * 0.28, octaves=4, seed=seed)
    warp2 = fbm_2d(h, w, base_scale=max(w, h) * 0.14, octaves=3, seed=seed + 19)
    # Diagonal architectural marble bands
    phase = (nx * 4.2 + ny * 2.6) * math.pi + warp1 * 6.5 + warp2 * 2.4
    veins = 1.0 - np.abs(np.sin(phase))
    veins_sharp = np.power(clamp01(veins), 6.5) * 0.65 + np.power(clamp01(veins), 2.2) * 0.25
    # Fine subtle mineral speckle
    rng = np.random.default_rng(seed + 91)
    grain = ndimage.gaussian_filter(rng.standard_normal((h, w)).astype(np.float32), sigma=0.75)
    grain = np.clip(grain / (float(np.std(grain)) * 2.6 + 1e-6), -1.0, 1.0)
    return clamp01(veins_sharp), grain


def normals_from_height(height: np.ndarray, strength: float = 1.0) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """Compute crisp unit normals (nx, ny, nz) from a 2D heightfield."""
    gy, gx = np.gradient(height.astype(np.float32))
    nx = -gx * strength
    ny = -gy * strength
    nz = np.ones_like(height, dtype=np.float32)
    inv_len = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz + 1e-12)
    return nx * inv_len, ny * inv_len, nz * inv_len


def shade_metal_pbr(
    nx: np.ndarray,
    ny: np.ndarray,
    nz: np.ndarray,
    base_rgb: Tuple[float, float, float],
    spec_rgb: Tuple[float, float, float],
    shadow_rgb: Tuple[float, float, float],
    roughness: float = 0.24,
    metallic: float = 0.92,
    brushed: np.ndarray | None = None,
    ao: np.ndarray | None = None,
) -> np.ndarray:
    """
    Jewelry-studio 3-point + anisotropic environment matcap PBR shader.
    Produces rich, gleaming 24K gold / champagne-brass / bronze metallic surfaces.
    """
    if brushed is not None:
        nx = nx + brushed * 0.045
        ny = ny + brushed * 0.085
        inv = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz + 1e-12)
        nx, ny, nz = nx * inv, ny * inv, nz * inv

    # Primary warm key light (top-left architectural key)
    l1 = np.array([-0.46, -0.68, 0.57], dtype=np.float32)
    l1 /= np.linalg.norm(l1)
    # Secondary cool-warm rim fill (lower-right studio bounce)
    l2 = np.array([0.58, 0.52, 0.63], dtype=np.float32)
    l2 /= np.linalg.norm(l2)
    # Grazing overhead studio strip light (top specular edge highlight!)
    l3 = np.array([0.04, -0.88, 0.47], dtype=np.float32)
    l3 /= np.linalg.norm(l3)

    # View vector (0, 0, 1)
    ndotl1 = clamp01(nx * l1[0] + ny * l1[1] + nz * l1[2])
    ndotl2 = clamp01(nx * l2[0] + ny * l2[1] + nz * l2[2])
    ndotl3 = clamp01(nx * l3[0] + ny * l3[1] + nz * l3[2])

    # Halfway vectors for Blinn-Phong / GGX-like tight + broad specular lobes
    def spec_lobe(light: np.ndarray, shininess: float) -> np.ndarray:
        h = light + np.array([0.0, 0.0, 1.0], dtype=np.float32)
        h /= np.linalg.norm(h)
        ndoth = clamp01(nx * h[0] + ny * h[1] + nz * h[2])
        return np.power(ndoth, shininess)

    s_tight = 16.0 / max(roughness * roughness, 0.015)
    s_broad = 3.5 / max(roughness, 0.08)

    spec1 = spec_lobe(l1, s_tight) * 0.95 + spec_lobe(l1, s_broad) * 0.38
    spec2 = spec_lobe(l2, s_broad * 1.1) * 0.34
    spec3 = spec_lobe(l3, s_tight * 0.85) * 0.70

    # Synthetic jewelry studio reflection band (reflection of view around normal)
    # R = 2*(N.V)*N - V -> Ry = 2*nz*ny, Rx = 2*nz*nx
    rx = 2.0 * nz * nx
    ry = 2.0 * nz * ny
    env_band = (
        0.52
        + 0.34 * np.exp(-np.power((ry + 0.55) * 2.5, 2.0))
        + 0.24 * np.exp(-np.power((rx + ry * 0.7 + 0.32) * 3.1, 2.0))
        - 0.28 * np.exp(-np.power((ry - 0.52) * 2.2, 2.0))
    )
    env_band = clamp01(env_band)

    # Fresnel lift on grazing bevels
    fresnel = np.power(clamp01(1.0 - nz), 2.4) * 0.42

    base = np.array(base_rgb, dtype=np.float32)[None, None, :]
    spec = np.array(spec_rgb, dtype=np.float32)[None, None, :]
    shad = np.array(shadow_rgb, dtype=np.float32)[None, None, :]

    # Rich metallic ramp from antique shadow -> luminous base -> champagne highlight
    lit_factor = clamp01(0.18 + ndotl1 * 0.68 + ndotl2 * 0.24 + ndotl3 * 0.22)
    body = shad * (1.0 - lit_factor[..., None]) + base * lit_factor[..., None]

    # Blend metallic environment reflection
    metal_body = body * (1.0 - metallic * 0.45) + (base * (0.45 + 0.95 * env_band[..., None])) * (metallic * 0.45)

    # Add specular glints & grazing Fresnel
    total_spec = (spec1 * 0.85 + spec3 * 0.55 + spec2 * 0.26 + fresnel)[..., None]
    col = metal_body + spec * total_spec * (0.55 + 0.45 * metallic)

    if brushed is not None:
        col = col * (1.0 + brushed[..., None] * 0.055)

    if ao is not None:
        col = col * (0.35 + 0.65 * ao[..., None])

    return clamp01(col)


def sd_rounded_box(px: np.ndarray, py: np.ndarray, bx: float, by: float, r: float) -> np.ndarray:
    """Exact analytical signed distance to a rounded rectangle centered at (0,0)."""
    qx = np.abs(px) - (bx - r)
    qy = np.abs(py) - (by - r)
    outside = np.sqrt(np.maximum(qx, 0.0) ** 2 + np.maximum(qy, 0.0) ** 2)
    inside = np.minimum(np.maximum(qx, qy), 0.0)
    return outside + inside - r


def sd_chamfer_box(px: np.ndarray, py: np.ndarray, bx: float, by: float, ch: float) -> np.ndarray:
    """Analytical signed distance to an Art-Deco octagonally-chamfered rectangle."""
    ax = np.abs(px)
    ay = np.abs(py)
    dx = ax - bx
    dy = ay - by
    # Diagonal chamfer plane: (ax - (bx - ch)) + (ay - (by - ch)) <= ch  => (ax + ay - (bx + by - ch)) / sqrt(2)
    d_diag = (ax + ay - (bx + by - ch)) * 0.70710678
    # Smooth corner union slightly via exact max
    box_out = np.sqrt(np.maximum(dx, 0.0) ** 2 + np.maximum(dy, 0.0) ** 2) + np.minimum(np.maximum(dx, dy), 0.0)
    return np.maximum(box_out, d_diag)


def sd_segment(px: np.ndarray, py: np.ndarray, ax: float, ay: float, bx: float, by: float) -> np.ndarray:
    """Exact signed distance to a 2D line segment AB."""
    pax = px - ax
    pay = py - ay
    bax = bx - ax
    bay = by - ay
    denom = bax * bax + bay * bay + 1e-12
    h = clamp01((pax * bax + pay * bay) / denom)
    dx = pax - bax * h
    dy = pay - bay * h
    return np.sqrt(dx * dx + dy * dy)


def sd_diamond(px: np.ndarray, py: np.ndarray, rx: float, ry: float) -> np.ndarray:
    """Normalized diamond distance (<= 0 inside)."""
    return (np.abs(px) / max(rx, 1e-5) + np.abs(py) / max(ry, 1e-5) - 1.0) * min(rx, ry) * 0.7071


def alpha_composite(dst_rgba: np.ndarray, src_rgba: np.ndarray) -> np.ndarray:
    """Porter-Duff source-over compositing for float32 RGBA arrays in [0, 1]."""
    sa = src_rgba[..., 3:4]
    da = dst_rgba[..., 3:4]
    out_a = sa + da * (1.0 - sa)
    out_rgb = (src_rgba[..., :3] * sa + dst_rgba[..., :3] * da * (1.0 - sa)) / np.maximum(out_a, 1e-6)
    return np.concatenate([clamp01(out_rgb), clamp01(out_a)], axis=-1)


def to_pil_and_save(rgba: np.ndarray, target_size: Tuple[int, int], out_path: Path) -> Image.Image:
    """Convert float32 RGBA [0..1] to uint8, Lanczos downsample cleanly, and save PNG."""
    if not np.isfinite(rgba).all():
        raise ValueError(f"Non-finite pixel detected while rendering {out_path.name}")
    arr = np.round(clamp01(rgba) * 255.0).astype(np.uint8)
    img = Image.fromarray(arr, mode="RGBA")
    if img.size != target_size:
        # Premultiply alpha before Lanczos resize to prevent dark/color fringing on transparent edges!
        rgb = rgba[..., :3] * rgba[..., 3:4]
        a = rgba[..., 3:4]
        pm = np.concatenate([rgb, a], axis=-1)
        pm_u8 = np.round(clamp01(pm) * 255.0).astype(np.uint8)
        pm_img = Image.fromarray(pm_u8, mode="RGBA").resize(target_size, resample=Image.Resampling.LANCZOS)
        pm_arr = np.asarray(pm_img, dtype=np.float32) / 255.0
        out_a = pm_arr[..., 3:4]
        out_rgb = np.where(out_a > 1e-4, pm_arr[..., :3] / np.maximum(out_a, 1e-4), 0.0)
        final_u8 = np.round(clamp01(np.concatenate([out_rgb, out_a], axis=-1)) * 255.0).astype(np.uint8)
        img = Image.fromarray(final_u8, mode="RGBA")
    img.save(out_path, format="PNG", optimize=True)
    if out_path.parent == OUT_UI:
        img.save(OUT_PUBLIC_UI / out_path.name, format="PNG", optimize=True)
    return img


# ==============================================================================
# PART 1: SCULPTED NINEPATCH PANELS & BUTTONS (512x256, 2x SS = 1024x512)
# ==============================================================================

def build_art_deco_corner_filigree_height(
    px: np.ndarray,
    py: np.ndarray,
    bx: float,
    by: float,
    d_outer: np.ndarray,
    bevel_width: float = 18.0,
    corner_size: float = 34.0,
    arm_len: float = 84.0,
    ornate: bool = True,
) -> np.ndarray:
    """
    Precision-mitered 4-corner Art-Deco filigree bracket heightfield strictly confined
    INSIDE the beveled frame (never poking outside the octagonal chamfer!) and strictly
    within the NinePatch corner margins so stretching NEVER distorts ornaments.
    """
    ax = np.abs(px)
    ay = np.abs(py)
    # Local coords measured inward from the bounding box corner (bx, by)
    cx = bx - ax
    cy = by - ay

    h = np.zeros_like(px, dtype=np.float32)

    # Inner corner offset sits cleanly inside the outer bevel + engraved channel!
    in1 = bevel_width + 11.0
    # Octagonal chamfer intersection along cx=in1 or cy=in1 happens at (in1, ch_off) & (ch_off, in1)
    # Since chamfer line is cx + cy = corner_size + bevel_width * 1.414 + 14.0
    ch_sum = corner_size + in1 * 1.4142
    ch_pt = max(in1 + 8.0, ch_sum - in1)

    # 1. Precision mitered diagonal bridge hugging the octagonal corner chamfer
    d_chamfer_bar = sd_segment(cx, cy, in1, ch_pt, ch_pt, in1)
    h = np.maximum(h, smoothstep(5.4, 1.4, d_chamfer_bar) * 1.0)

    # 2. Horizontal & vertical Art-Deco arms extending inward from the mitered chamfer joints
    d_h1 = sd_segment(cx, cy, ch_pt, in1, ch_pt + arm_len, in1)
    d_v1 = sd_segment(cx, cy, in1, ch_pt, in1, ch_pt + arm_len * 0.80)
    h = np.maximum(h, smoothstep(5.2, 1.4, np.minimum(d_h1, d_v1)) * 0.96)

    # 3. Secondary stepped inner Art-Deco parallel bracket (nested neatly inside the chamfer!)
    in2 = in1 + 11.5
    ch_pt2 = ch_pt + 6.5
    d_ch2 = sd_segment(cx, cy, in2, ch_pt2, ch_pt2, in2)
    d_h2 = sd_segment(cx, cy, ch_pt2, in2, ch_pt + arm_len * 0.62, in2)
    d_v2 = sd_segment(cx, cy, in2, ch_pt2, in2, ch_pt + arm_len * 0.50)
    h = np.maximum(h, smoothstep(3.8, 1.1, np.minimum(d_ch2, np.minimum(d_h2, d_v2))) * 0.84)

    # 4. Sculpted beveled diamond corner stud nestled right at the inner miter elbow
    mid = (in1 + ch_pt) * 0.5 + 8.5
    d_stud = sd_diamond(cx - mid, cy - mid, 11.0, 11.0)
    stud_h = clamp01(1.0 - (d_stud + 7.5) / 7.5)
    h = np.maximum(h, smoothstep(1.8, -0.8, d_stud) * (0.52 + 0.72 * stud_h))

    if ornate:
        # Terminal spear-diamonds at the ends of the horizontal & vertical arms
        d_tip_h = sd_diamond(cx - (ch_pt + arm_len + 6.0), cy - in1, 7.5, 5.2)
        d_tip_v = sd_diamond(cx - in1, cy - (ch_pt + arm_len * 0.80 + 6.0), 5.2, 7.5)
        h = np.maximum(h, smoothstep(1.8, -0.8, np.minimum(d_tip_h, d_tip_v)) * 0.92)

        # Tiny third inner accent pip pointing diagonally inward
        d_pip = sd_diamond(cx - (mid + 16.5), cy - (mid + 16.5), 5.5, 5.5)
        h = np.maximum(h, smoothstep(1.6, -0.8, d_pip) * 0.80)

    # STRICT clip: filigree MUST stay completely inside the outer metallic bevel (zero poking ears!)
    strict_inside = smoothstep(-(bevel_width - 2.0), -(bevel_width + 4.0), d_outer)
    return h * strict_inside


def render_sculpted_panel(
    out_name: str,
    interior_top: Tuple[float, float, float],
    interior_bot: Tuple[float, float, float],
    interior_alpha: float,
    vein_tint: Tuple[float, float, float],
    vein_strength: float,
    metal_base: Tuple[float, float, float],
    metal_spec: Tuple[float, float, float],
    metal_shadow: Tuple[float, float, float],
    inner_glow_rgb: Tuple[float, float, float],
    inner_glow_strength: float,
    outer_glow_rgb: Tuple[float, float, float] | None = None,
    outer_glow_strength: float = 0.0,
    shape: str = "chamfer",
    corner_size: float = 34.0,
    bevel_width: float = 18.0,
    ornate_corners: bool = True,
    corner_arm: float = 84.0,
    top_glass_sheen: float = 0.16,
    seed: int = 100,
    pad_lr: float = 28.0,
    pad_top: float = 24.0,
    pad_bot: float = 36.0,
) -> Image.Image:
    """
    Renders a 1024x512 -> 512x256 PBR-lit sculpted architectural NinePatch UI frame.
    """
    W, H = 1024, 512
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx = W * 0.5
    cy = (pad_top + (H - pad_bot)) * 0.5
    bx = W * 0.5 - pad_lr
    by = (H - pad_top - pad_bot) * 0.5
    px = xx - cx
    py = yy - cy

    if shape == "chamfer":
        d = sd_chamfer_box(px, py, bx, by, corner_size)
        # Slightly soften razor vertices for smooth metallic catching
        d_soft = ndimage.gaussian_filter(d, sigma=1.4)
        d = d * 0.6 + d_soft * 0.4
    else:
        d = sd_rounded_box(px, py, bx, by, corner_size)

    # Outer architectural drop shadow (soft grounded + offset downward)
    d_sh = sd_chamfer_box(px, py - 11.0, bx + 2.0, by + 2.0, corner_size) if shape == "chamfer" else sd_rounded_box(px, py - 11.0, bx + 2.0, by + 2.0, corner_size)
    shadow_a = np.exp(-np.maximum(d_sh, 0.0) ** 1.45 / 26.0) * 0.54
    contact_a = np.exp(-np.maximum(d, 0.0) ** 1.35 / 9.0) * 0.45
    bg_a = clamp01(shadow_a + contact_a * (1.0 - shadow_a))
    canvas = np.zeros((H, W, 4), dtype=np.float32)
    canvas[..., 0] = 0.015
    canvas[..., 1] = 0.020
    canvas[..., 2] = 0.036
    canvas[..., 3] = bg_a

    # Optional subtle luminous outer aura (for hover / emerald correct / crimson wrong)
    if outer_glow_rgb is not None and outer_glow_strength > 0.0:
        glow_a = np.exp(-np.maximum(d, 0.0) / 14.0) * outer_glow_strength * smoothstep(26.0, 0.0, d)
        glow_layer = np.zeros((H, W, 4), dtype=np.float32)
        glow_layer[..., :3] = np.array(outer_glow_rgb, dtype=np.float32)[None, None, :]
        glow_layer[..., 3] = clamp01(glow_a)
        canvas = alpha_composite(canvas, glow_layer)

    # Interior Obsidian / Jeweled Slate Slab
    slab_mask = smoothstep(1.5, -1.5, d)
    veins, mineral = obsidian_marble_texture(H, W, seed=seed)
    brushed_h = brushed_metal_noise(H, W, horizontal=True, seed=seed + 7)

    # Smooth vertical gradient across slab (safe for vertical NinePatch stretch)
    vy = clamp01((py + by) / (2.0 * by))
    itop = np.array(interior_top, dtype=np.float32)[None, None, :]
    ibot = np.array(interior_bot, dtype=np.float32)[None, None, :]
    slab_rgb = itop * (1.0 - vy[..., None]) + ibot * vy[..., None]

    # Veined obsidian marble + delicate satin grain
    vtint = np.array(vein_tint, dtype=np.float32)[None, None, :]
    slab_rgb = slab_rgb + (vtint - slab_rgb) * (veins[..., None] * vein_strength)
    slab_rgb = slab_rgb * (1.0 + mineral[..., None] * 0.032 + brushed_h[..., None] * 0.022)

    # Soft central radial ambient lift + perimeter recessed AO inside the metallic frame
    # Note: keep central lift gentle so NinePatch stretch stays seamless
    inner_edge_ao = smoothstep(-bevel_width - 28.0, -bevel_width + 2.0, d)
    slab_rgb = slab_rgb * (1.0 - inner_edge_ao[..., None] * 0.36)

    # Subtle inner colored glow hugging the bezel perimeter
    if inner_glow_strength > 0.0:
        ig_band = np.exp(-np.maximum(-d - bevel_width * 0.85, 0.0) / 26.0) * smoothstep(-bevel_width * 0.3, -bevel_width * 1.05, d)
        ig_col = np.array(inner_glow_rgb, dtype=np.float32)[None, None, :]
        slab_rgb = slab_rgb + ig_col * (ig_band[..., None] * inner_glow_strength)

    # Top-edge architectural smoked-glass specular highlight (thin gleaming upper arc!)
    top_spec = np.exp(-np.power(vy * 7.8, 2.0)) * smoothstep(-bevel_width * 0.6, -bevel_width * 1.4, d)
    top_edge_line = np.exp(-np.power((vy - 0.035) * 32.0, 2.0)) * smoothstep(-bevel_width * 0.7, -bevel_width * 1.3, d)
    slab_rgb = slab_rgb + np.array([0.92, 0.94, 1.0], dtype=np.float32)[None, None, :] * (
        top_spec[..., None] * top_glass_sheen + top_edge_line[..., None] * (top_glass_sheen * 0.55)
    )

    slab_rgba = np.concatenate([clamp01(slab_rgb), (slab_mask * interior_alpha)[..., None]], axis=-1)
    canvas = alpha_composite(canvas, slab_rgba)

    # ------------------------------------------------------------------
    # MULTI-TIERED SCULPTED METALLIC BEZEL + INNER HAIRLINE + CORNER FILIGREE
    # ------------------------------------------------------------------
    # Distance inward from outer silhouette edge: s = -d (0 at outer edge, positive inward)
    s = -d
    # Tier 1: Main crowned outer metallic molding [0 .. bevel_width]
    bw = bevel_width
    # Smooth arch profile across [0..bw] with crisp outer chamfer & inner step
    t_outer = clamp01(s / bw)
    sin_outer = np.maximum(np.sin(t_outer * math.pi), 0.0)
    main_bevel_h = np.where(
        (s >= 0.0) & (s <= bw),
        np.power(sin_outer, 0.62) * 1.15,
        0.0,
    ).astype(np.float32)

    # Tier 2: Fine inner engraved champagne hairline inlay at [bw + 8 .. bw + 14]
    inlay_c = bw + 11.0
    inlay_w = 3.2
    inlay_h = np.exp(-np.power((s - inlay_c) / inlay_w, 2.0)) * 0.58 * smoothstep(-1.0, 1.0, s)

    # Tier 3: Corner Art-Deco filigree strictly inside corner NinePatch bounds & chamfer
    filigree_h = np.zeros_like(s)
    if corner_arm > 0.0:
        filigree_h = build_art_deco_corner_filigree_height(
            px, py, bx, by,
            d_outer=d,
            bevel_width=bw,
            corner_size=corner_size,
            arm_len=corner_arm,
            ornate=ornate_corners,
        ) * 0.94

    # Combined metal heightfield & mask
    metal_h = np.maximum(main_bevel_h, np.maximum(inlay_h, filigree_h))
    # Subtle micro-smoothing for razor-clean anti-aliased bevel normals
    metal_h_smooth = ndimage.gaussian_filter(metal_h, sigma=0.75)

    metal_mask_outer = smoothstep(1.2, -1.2, d) * smoothstep(bw + 1.8, bw - 1.2, s)
    metal_mask_inlay = smoothstep(0.14, 0.34, inlay_h)
    metal_mask_fil = smoothstep(0.12, 0.32, filigree_h)
    metal_mask = clamp01(np.maximum(metal_mask_outer, np.maximum(metal_mask_inlay, metal_mask_fil)))

    # Crisp micro-AO shadow under raised inner inlay & corner filigree on the obsidian slab
    fil_shadow = ndimage.gaussian_filter(np.maximum(inlay_h, filigree_h), sigma=3.5)
    fil_shadow_shifted = np.roll(fil_shadow, shift=(4, 3), axis=(0, 1))
    sh_layer = np.zeros((H, W, 4), dtype=np.float32)
    sh_layer[..., 3] = clamp01(fil_shadow_shifted * 0.65) * slab_mask * (1.0 - metal_mask * 0.85)
    canvas = alpha_composite(canvas, sh_layer)

    # Compute 3D normals & PBR metallic shade
    nx, ny, nz = normals_from_height(metal_h_smooth, strength=4.2)
    # Recessed dark channel AO right between main bezel and inner hairline
    groove_ao = 1.0 - 0.48 * np.exp(-np.power((s - (bw + 3.5)) / 3.2, 2.0))
    metal_rgb = shade_metal_pbr(
        nx, ny, nz,
        base_rgb=metal_base,
        spec_rgb=metal_spec,
        shadow_rgb=metal_shadow,
        roughness=0.22,
        metallic=0.94,
        brushed=brushed_h,
        ao=groove_ao,
    )

    # Extra bright specular catchlight on the upper horizontal metallic ridge
    top_metal_glint = np.exp(-np.power((py + by - bw * 0.42) / 5.5, 2.0)) * metal_mask_outer
    metal_rgb = clamp01(metal_rgb + np.array(metal_spec, dtype=np.float32)[None, None, :] * top_metal_glint[..., None] * 0.38)

    metal_rgba = np.concatenate([metal_rgb, metal_mask[..., None]], axis=-1)
    canvas = alpha_composite(canvas, metal_rgba)

    return to_pil_and_save(canvas, (512, 256), OUT_UI / out_name)


def render_gold_cta_pill(out_name: str, is_hover: bool = False) -> Image.Image:
    """
    Renders a brushed 24K liquid-gold machined bevel pill CTA (512x256, 2x SS = 1024x512).
    Designed for crisp contrast with dark ink (#11151E) text!
    """
    W, H = 1024, 512
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    pad_lr, pad_top, pad_bot = 24.0, 20.0, 32.0
    cx = W * 0.5
    cy = (pad_top + (H - pad_bot)) * 0.5
    bx = W * 0.5 - pad_lr
    by = (H - pad_top - pad_bot) * 0.5
    px = xx - cx
    py = yy - cy
    radius = 76.0  # 38px radius at 512x256 -> fits 100% inside NinePatch margins (68, 68, 50, 56) with ZERO kinks!

    d = sd_rounded_box(px, py, bx, by, radius)
    d_sh = sd_rounded_box(px, py - 12.0, bx + 1.0, by + 1.0, radius)

    # Deep dark grounding shadow + warm golden underside glow
    canvas = np.zeros((H, W, 4), dtype=np.float32)
    shadow_a = np.exp(-np.maximum(d_sh, 0.0) ** 1.4 / 28.0) * 0.58
    canvas[..., 0] = 0.03
    canvas[..., 1] = 0.025
    canvas[..., 2] = 0.015
    canvas[..., 3] = shadow_a

    # Warm golden outer aura halo (stronger on hover!)
    halo_str = 0.52 if is_hover else 0.24
    halo_a = np.exp(-np.maximum(d, 0.0) / 16.0) * halo_str * smoothstep(28.0, 0.0, d)
    halo = np.zeros((H, W, 4), dtype=np.float32)
    halo[..., :3] = np.array([1.0, 0.84, 0.42], dtype=np.float32)[None, None, :]
    halo[..., 3] = clamp01(halo_a)
    canvas = alpha_composite(canvas, halo)

    # Machined solid gold ingot heightfield:
    # Steep outer bevel [0..22] -> slight convex crown across center -> engraved recessed inner hairline at [26..33]!
    s = -d
    body_mask = smoothstep(1.5, -1.5, d)
    outer_slope = smoothstep(0.0, 24.0, s)
    # Convex vertical curvature (machined cylindrical pill bar catches a rich studio specular band!)
    vy = clamp01((py + by) / (2.0 * by))
    arch = np.power(np.maximum(np.sin(vy * math.pi), 0.0), 0.45) * 0.32
    # Engraved recessed inner border groove at s = 28
    groove = -0.34 * np.exp(-np.power((s - 28.0) / 3.4, 2.0))
    # Tiny inner raised lip just inside the groove at s = 35
    inner_lip = 0.14 * np.exp(-np.power((s - 35.5) / 3.0, 2.0))

    # Corner machined gold diamond clasps on left & right horizontal ends (strictly inside L/R NinePatch margins!)
    d_riv_l = sd_diamond(px + (bx - 52.0), py, 14.0, 14.0)
    d_riv_r = sd_diamond(px - (bx - 52.0), py, 14.0, 14.0)
    d_riv = np.minimum(d_riv_l, d_riv_r)
    rivet_groove = -0.32 * np.exp(-np.power((d_riv - 2.5) / 2.8, 2.0))
    rivets = smoothstep(2.0, -1.5, d_riv) * 0.42 + rivet_groove

    height = (outer_slope * 1.10 + arch + groove + inner_lip + rivets) * body_mask
    height_sm = ndimage.gaussian_filter(height, sigma=0.85)
    nx, ny, nz = normals_from_height(height_sm, strength=3.6)

    brushed = brushed_metal_noise(H, W, horizontal=True, seed=303 if not is_hover else 309)

    # Rich luminous 24K liquid gold palette (bright enough for >= 8:1 WCAG contrast with #11151E text!)
    if is_hover:
        g_top = np.array([1.00, 0.96, 0.80], dtype=np.float32)
        g_mid = np.array([0.97, 0.84, 0.49], dtype=np.float32)
        g_bot = np.array([0.81, 0.60, 0.22], dtype=np.float32)
        spec_c = (1.0, 0.99, 0.92)
        shad_c = (0.56, 0.39, 0.12)
    else:
        g_top = np.array([0.98, 0.91, 0.68], dtype=np.float32)
        g_mid = np.array([0.90, 0.73, 0.36], dtype=np.float32)
        g_bot = np.array([0.70, 0.49, 0.16], dtype=np.float32)
        spec_c = (1.0, 0.96, 0.84)
        shad_c = (0.43, 0.29, 0.08)

    # 3-stop smooth luxury satin gold vertical ramp
    t1 = clamp01(vy * 2.0)[..., None]
    t2 = clamp01((vy - 0.5) * 2.0)[..., None]
    base_grad = np.where(vy[..., None] < 0.5, g_top * (1.0 - t1) + g_mid * t1, g_mid * (1.0 - t2) + g_bot * t2)

    # Shade with PBR specular & bevel lighting
    ao = clamp01(1.0 - 0.40 * np.exp(-np.power((s - 28.0) / 3.8, 2.0)))
    shaded = shade_metal_pbr(
        nx, ny, nz,
        base_rgb=(0.94, 0.78, 0.42) if not is_hover else (0.99, 0.87, 0.55),
        spec_rgb=spec_c,
        shadow_rgb=shad_c,
        roughness=0.20 if is_hover else 0.25,
        metallic=0.88,
        brushed=brushed,
        ao=ao,
    )

    # Blend shaded bevel lighting with our controlled satin center gradient so center never gets dark
    bevel_zone = smoothstep(44.0, 12.0, s)
    center_rgb = base_grad * (0.94 + brushed[..., None] * 0.055) * (0.62 + 0.38 * ao[..., None])
    # Crisp horizontal top-half satin specular sheen band across the pill
    satin_sheen = np.exp(-np.power((vy - 0.20) * 5.2, 2.0)) * (0.28 if is_hover else 0.20)
    center_rgb = clamp01(center_rgb + np.array([1.0, 0.97, 0.86], dtype=np.float32)[None, None, :] * satin_sheen[..., None])

    final_rgb = center_rgb * (1.0 - bevel_zone[..., None] * 0.78) + shaded * (bevel_zone[..., None] * 0.78)
    # Darken engraved inner groove slightly for razor-crisp machined precision
    groove_dark = np.exp(-np.power((s - 28.0) / 2.4, 2.0)) * 0.34
    final_rgb = final_rgb * (1.0 - groove_dark[..., None])
    # Razor-bright top edge specular line
    top_rim = np.exp(-np.power((s - 5.5) / 3.0, 2.0)) * smoothstep(0.55, 0.05, vy) * (0.58 if is_hover else 0.42)
    final_rgb = clamp01(final_rgb + np.array([1.0, 0.99, 0.90], dtype=np.float32)[None, None, :] * top_rim[..., None])

    pill_rgba = np.concatenate([final_rgb, body_mask[..., None]], axis=-1)
    canvas = alpha_composite(canvas, pill_rgba)
    return to_pil_and_save(canvas, (512, 256), OUT_UI / out_name)


# ==============================================================================
# PART 2: 3D FACETED CHAMPIONSHIP STARS, STREAK CREST, FILIGREE & PARTICLE BLOOM
# ==============================================================================

def render_championship_star(out_name: str, filled: bool = True) -> Image.Image:
    """
    True 10-facet jewel-cut 3D championship star (576x576 -> 192x192 RGBA).
    Every arm is mathematically split into 2 crisp planar 3D facets with exact normals!
    """
    S = 576
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    cx, cy = S * 0.5, S * 0.52
    px = (xx - cx) / (S * 0.5)
    py = (yy - cy) / (S * 0.5)

    r_out = 0.82
    r_in = 0.345
    z_peak = 0.42 if filled else -0.34

    # 10 vertices alternating outer tip (k even) and inner valley (k odd), starting at top (-pi/2)
    verts = []
    for k in range(10):
        ang = -math.pi * 0.5 + k * (math.pi / 5.0)
        rad = r_out if k % 2 == 0 else r_in
        verts.append((rad * math.cos(ang), rad * math.sin(ang)))

    # Determine pixel membership in each of the 10 triangular facets: (0,0) -> V[k] -> V[(k+1)%10]
    inside_any = np.zeros((S, S), dtype=bool)
    nx_map = np.zeros((S, S), dtype=np.float32)
    ny_map = np.zeros((S, S), dtype=np.float32)
    nz_map = np.ones((S, S), dtype=np.float32)
    z_map = np.zeros((S, S), dtype=np.float32)
    edge_dist = np.full((S, S), 999.0, dtype=np.float32)

    for k in range(10):
        x1, y1 = verts[k]
        x2, y2 = verts[(k + 1) % 10]
        # 2D barycentric coords for triangle O(0,0), A(x1,y1), B(x2,y2)
        det = x1 * y2 - x2 * y1
        u = (px * y2 - py * x2) / det
        v = (-px * y1 + py * x1) / det
        w = 1.0 - u - v
        mask = (u >= -1e-4) & (v >= -1e-4) & (w >= -1e-4)

        # Exact 3D plane normal for triangle (0,0,z_peak) -> (x1,y1,0) -> (x2,y2,0)
        e1 = np.array([x1, y1, -z_peak], dtype=np.float32)
        e2 = np.array([x2, y2, -z_peak], dtype=np.float32)
        fn = np.cross(e1, e2)
        if fn[2] < 0:
            fn = -fn
        fn /= np.linalg.norm(fn) + 1e-12

        inside_any |= mask
        nx_map = np.where(mask, fn[0], nx_map)
        ny_map = np.where(mask, fn[1], ny_map)
        nz_map = np.where(mask, fn[2], nz_map)
        z_map = np.where(mask, w * z_peak, z_map)

        # Distance to outer edge V[k] -> V[k+1]
        ed = sd_segment(px, py, x1, y1, x2, y2)
        edge_dist = np.minimum(edge_dist, ed)

    # Signed distance to the star outline
    sdf = np.where(inside_any, -edge_dist, edge_dist)
    star_alpha = smoothstep(0.008, -0.006, sdf)

    # Crisp subtle ridge specular softening so central edges gleam like polished gold
    nx_sm = ndimage.gaussian_filter(nx_map, sigma=1.1)
    ny_sm = ndimage.gaussian_filter(ny_map, sigma=1.1)
    nz_sm = ndimage.gaussian_filter(nz_map, sigma=1.1)
    inv_n = 1.0 / np.sqrt(nx_sm ** 2 + ny_sm ** 2 + nz_sm ** 2 + 1e-12)
    nx_sm, ny_sm, nz_sm = nx_sm * inv_n, ny_sm * inv_n, nz_sm * inv_n

    # Outer rim bevel near perimeter
    rim_mask = smoothstep(0.006, -0.004, sdf) * smoothstep(-0.068, -0.045, sdf)

    canvas = np.zeros((S, S, 4), dtype=np.float32)
    # Grounding drop shadow
    sdf_sh = np.roll(sdf, shift=(14, 6), axis=(0, 1))
    sh_a = np.exp(-np.maximum(sdf_sh, 0.0) * 14.0) * 0.56
    canvas[..., :3] = np.array([0.02, 0.02, 0.03], dtype=np.float32)[None, None, :]
    canvas[..., 3] = sh_a

    if filled:
        # Warm golden radiant halo around filled championship star!
        halo_a = np.exp(-np.maximum(sdf, 0.0) * 8.5) * 0.42 * smoothstep(0.24, 0.0, sdf)
        halo = np.zeros((S, S, 4), dtype=np.float32)
        halo[..., :3] = np.array([1.0, 0.84, 0.36], dtype=np.float32)[None, None, :]
        halo[..., 3] = clamp01(halo_a)
        canvas = alpha_composite(canvas, halo)

        brushed = brushed_metal_noise(S, S, horizontal=False, seed=501) * 0.45
        rgb = shade_metal_pbr(
            nx_sm, ny_sm, nz_sm,
            base_rgb=(0.97, 0.79, 0.34),
            spec_rgb=(1.0, 0.98, 0.88),
            shadow_rgb=(0.48, 0.30, 0.07),
            roughness=0.17,
            metallic=0.96,
            brushed=brushed,
        )
        # Bright polished chamfer catchlight along the 10 outer edges & central ridges
        edge_glint = np.exp(-np.power((sdf + 0.020) / 0.014, 2.0)) * 0.32
        center_gleam = np.exp(-np.power((px ** 2 + py ** 2) * 5.0, 1.2)) * 0.25
        rgb = clamp01(rgb + np.array([1.0, 0.96, 0.80], dtype=np.float32)[None, None, :] * (edge_glint + center_gleam)[..., None])
    else:
        # Recessed dark bronze / obsidian trophy socket
        rgb = shade_metal_pbr(
            nx_sm, ny_sm, nz_sm,
            base_rgb=(0.17, 0.19, 0.24),
            spec_rgb=(0.56, 0.47, 0.34),
            shadow_rgb=(0.06, 0.08, 0.12),
            roughness=0.42,
            metallic=0.72,
        )
        # Subtle burnished dark-bronze outer rim bezel so empty stars read cleanly against dark panels!
        rim_col = np.array([0.46, 0.38, 0.25], dtype=np.float32)[None, None, :]
        # Slightly brighter on bottom-right edge (classic recessed socket catchlight!)
        rim_lit = 0.65 + 0.55 * clamp01((px * 0.55 + py * 0.65) + 0.3)
        rgb = rgb * (1.0 - rim_mask[..., None] * 0.72) + (rim_col * rim_lit[..., None]) * (rim_mask[..., None] * 0.72)

    star_rgba = np.concatenate([clamp01(rgb), star_alpha[..., None]], axis=-1)
    canvas = alpha_composite(canvas, star_rgba)
    return to_pil_and_save(canvas, (192, 192), OUT_UI / out_name)


def render_streak_fire_badge(out_name: str = "badge_streak_fire.png") -> Image.Image:
    """
    Sculpted Molten-Gold Streak Crest (512x512 -> 256x256 transparent RGBA).
    Combines a faceted obsidian-and-gold Art-Deco heraldic shield medallion
    crowned by sweeping sculpted 24K molten-gold & blazing amber flames!
    """
    S = 512
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    x = (xx - S * 0.5) / (S * 0.5)
    y = (yy - S * 0.52) / (S * 0.5)

    # 1. Sculpted stylized outer flame crown silhouette (sweeping symmetric + dynamic central tongue)
    # Build via smooth union of analytical teardrop flame lobes!
    def flame_lobe(fx: np.ndarray, fy: np.ndarray, ox: float, oy: float, sx: float, sy: float, curl: float) -> np.ndarray:
        lx = (fx - ox) / sx
        ly = (fy - oy) / sy
        # Curl upper tip sideways gracefully
        tip_t = clamp01(-ly)
        lx = lx - curl * (tip_t ** 1.8)
        # Taper width sharply upward into a flame point
        width = np.maximum(0.08, 1.0 - tip_t * 0.92) * np.sqrt(clamp01(1.0 - np.maximum(ly, 0.0) ** 2))
        # Smooth teardrop SDF approximation
        r_body = np.sqrt((lx / np.maximum(width, 0.08)) ** 2 + (ly * 0.95) ** 2) - 1.0
        # Clip cleanly above tip
        above = np.maximum(-ly - 1.0, 0.0)
        return np.maximum(r_body, above - 0.02)

    d_center = flame_lobe(x, y, 0.0, 0.06, 0.44, 0.86, curl=0.14)
    d_left = flame_lobe(x, y, -0.34, 0.18, 0.29, 0.66, curl=-0.28)
    d_right = flame_lobe(x, y, 0.34, 0.18, 0.29, 0.66, curl=0.28)
    d_inner = flame_lobe(x, y, 0.02, 0.20, 0.27, 0.56, curl=-0.12)

    # Smooth min union for organic sculpted flame silhouette
    def smin(a: np.ndarray, b: np.ndarray, k: float = 0.14) -> np.ndarray:
        h = clamp01(0.5 + 0.5 * (b - a) / k)
        return b * (1.0 - h) + a * h - k * h * (1.0 - h)

    d_flame = smin(d_center, smin(d_left, d_right, 0.12), 0.14)
    # Also weld a sleek diamond-crest shield base at bottom
    d_shield = sd_diamond(x, y - 0.28, 0.52, 0.50)
    d_outer = smin(d_flame, d_shield, 0.10)

    # Normalize approximate distance via EDT for rock-solid bevel lighting
    outer_bin = d_outer < 0.0
    dist_in = ndimage.distance_transform_edt(outer_bin).astype(np.float32) / (S * 0.5)
    dist_out = ndimage.distance_transform_edt(~outer_bin).astype(np.float32) / (S * 0.5)
    sdf = dist_out - dist_in
    outer_alpha = smoothstep(0.008, -0.006, sdf)

    canvas = np.zeros((S, S, 4), dtype=np.float32)

    # Radiant molten-amber outer aura
    aura_a = np.exp(-np.maximum(sdf, 0.0) * 9.0) * 0.52 * smoothstep(0.26, 0.0, sdf)
    aura = np.zeros((S, S, 4), dtype=np.float32)
    aura[..., :3] = np.array([1.0, 0.58, 0.12], dtype=np.float32)[None, None, :]
    aura[..., 3] = clamp01(aura_a)
    canvas = alpha_composite(canvas, aura)

    # Sculpted 3D flame relief heightfield
    flame_h = np.sqrt(clamp01(dist_in / 0.24)) * 0.85
    # Add sculpted central ridge & outer gold bezel crest
    inner_flame_mask = smoothstep(0.02, -0.02, d_inner)
    bevel_h = ndimage.gaussian_filter(flame_h + inner_flame_mask * 0.25, sigma=2.2)
    nx, ny, nz = normals_from_height(bevel_h, strength=11.0)

    # Rich molten-gold -> fiery amber-orange -> luminous white-gold core gradient!
    t_core = clamp01(dist_in / 0.28)
    t_y = clamp01((y + 0.78) / 1.45)  # 0 at tip, 1 at base
    c_tip = np.array([1.00, 0.90, 0.44], dtype=np.float32)[None, None, :]
    c_mid = np.array([0.96, 0.55, 0.12], dtype=np.float32)[None, None, :]
    c_base = np.array([0.74, 0.24, 0.06], dtype=np.float32)[None, None, :]
    flame_grad = np.where(
        t_y[..., None] < 0.55,
        c_tip * (1.0 - clamp01(t_y / 0.55)[..., None]) + c_mid * clamp01(t_y / 0.55)[..., None],
        c_mid * (1.0 - clamp01((t_y - 0.55) / 0.45)[..., None]) + c_base * clamp01((t_y - 0.55) / 0.45)[..., None],
    )

    metal_flame = shade_metal_pbr(
        nx, ny, nz,
        base_rgb=(0.98, 0.72, 0.22),
        spec_rgb=(1.0, 0.97, 0.80),
        shadow_rgb=(0.50, 0.18, 0.05),
        roughness=0.22,
        metallic=0.82,
    )
    rgb = flame_grad * 0.48 + metal_flame * 0.62

    # Molten white-gold incandescent inner flame core!
    core_glow = smoothstep(0.08, -0.18, d_inner) * (0.45 + 0.55 * t_core)
    rgb = rgb * (1.0 - core_glow[..., None] * 0.65) + np.array([1.0, 0.96, 0.74], dtype=np.float32)[None, None, :] * (core_glow[..., None] * 0.95)

    # Crisp 24K gold metallic rim hugging outer edge
    rim = smoothstep(0.055, 0.015, dist_in) * outer_alpha
    rgb = clamp01(rgb * (1.0 - rim[..., None] * 0.35) + np.array([1.0, 0.88, 0.48], dtype=np.float32)[None, None, :] * (rim[..., None] * 0.55))

    # Sculpted dark obsidian + gold heraldic diamond medallion nested at lower heart
    d_gem_outer = sd_diamond(x, y - 0.27, 0.31, 0.31)
    d_gem_obs = sd_diamond(x, y - 0.27, 0.24, 0.24)
    d_gem_inner = sd_diamond(x, y - 0.27, 0.145, 0.145)
    gem_ring_mask = smoothstep(0.010, -0.008, d_gem_outer)
    gem_obs_mask = smoothstep(0.008, -0.008, d_gem_obs)
    gem_core_mask = smoothstep(0.008, -0.008, d_gem_inner)

    gem_h = clamp01(1.0 - np.abs(d_gem_outer + 0.036) / 0.042) * gem_ring_mask
    gnx, gny, gnz = normals_from_height(ndimage.gaussian_filter(gem_h, sigma=1.2), strength=10.5)
    gem_gold = shade_metal_pbr(gnx, gny, gnz, (0.98, 0.80, 0.34), (1.0, 0.99, 0.88), (0.42, 0.25, 0.05), 0.16, 0.96)

    # Deep obsidian-garnet recessed bezel around glowing molten white-gold diamond heart!
    obs_col = np.array([0.14, 0.06, 0.04], dtype=np.float32)[None, None, :] * (0.7 + 0.6 * clamp01(-d_gem_obs * 5.0))[..., None]
    gem_core_col = np.array([1.0, 0.95, 0.72], dtype=np.float32)[None, None, :] * (0.72 + 0.35 * clamp01(1.0 - (x ** 2 + (y - 0.25) ** 2) * 14.0))[..., None]
    flame_rgba = np.concatenate([clamp01(rgb), outer_alpha[..., None]], axis=-1)
    canvas = alpha_composite(canvas, flame_rgba)
    canvas = alpha_composite(canvas, np.concatenate([gem_gold, gem_ring_mask[..., None]], axis=-1))
    canvas = alpha_composite(canvas, np.concatenate([clamp01(obs_col), gem_obs_mask[..., None]], axis=-1))
    canvas = alpha_composite(canvas, np.concatenate([clamp01(gem_core_col), gem_core_mask[..., None]], axis=-1))

    # Rising crisp golden ember sparkles around tips
    sparks = [(-0.46, -0.42, 0.036), (0.44, -0.48, 0.032), (-0.18, -0.82, 0.028), (0.24, -0.76, 0.025)]
    for sx, sy, sr in sparks:
        sd = np.sqrt((x - sx) ** 2 + (y - sy) ** 2)
        sp_a = np.exp(-np.power(sd / sr, 1.8)) * 0.92
        sp_l = np.zeros((S, S, 4), dtype=np.float32)
        sp_l[..., :3] = np.array([1.0, 0.92, 0.58], dtype=np.float32)[None, None, :]
        sp_l[..., 3] = clamp01(sp_a)
        canvas = alpha_composite(canvas, sp_l)

    return to_pil_and_save(canvas, (256, 256), OUT_UI / out_name)


def render_corner_filigree(out_name: str = "corner_filigree.png") -> Image.Image:
    """Standalone ornate 24K gold Art-Deco corner filigree flourish (192x192 RGBA, top-left)."""
    S = 576
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    h = np.zeros((S, S), dtype=np.float32)

    # Outer architectural L-arm tapering gracefully
    m = 56.0
    d1 = sd_segment(xx, yy, m, m, S - 52.0, m)
    d2 = sd_segment(xx, yy, m, m, m, S - 52.0)
    taper_x = 16.0 * (1.0 - clamp01((xx - m) / (S - 90.0)) * 0.65)
    taper_y = 16.0 * (1.0 - clamp01((yy - m) / (S - 90.0)) * 0.65)
    h = np.maximum(h, smoothstep(taper_x + 3.0, taper_x * 0.2, d1))
    h = np.maximum(h, smoothstep(taper_y + 3.0, taper_y * 0.2, d2))

    # Secondary inner stepped L-arm
    m2 = 104.0
    d3 = sd_segment(xx, yy, m2, m2, S - 150.0, m2)
    d4 = sd_segment(xx, yy, m2, m2, m2, S - 150.0)
    h = np.maximum(h, smoothstep(10.0, 2.5, np.minimum(d3, d4)) * 0.85)

    # Diagonal miter spine + Art-Deco sunburst fans
    d_sp = sd_segment(xx, yy, m, m, 186.0, 186.0)
    h = np.maximum(h, smoothstep(11.0, 2.5, d_sp) * 0.90)

    # Sculpted corner faceted diamond jewel
    d_dia = sd_diamond(xx - 80.0, yy - 80.0, 38.0, 38.0)
    h = np.maximum(h, smoothstep(3.0, -2.0, d_dia) * (0.65 + 0.55 * clamp01(-d_dia / 28.0)))

    # Inner chevron diamond
    d_dia2 = sd_diamond(xx - 166.0, yy - 166.0, 22.0, 22.0)
    h = np.maximum(h, smoothstep(3.0, -2.0, d_dia2) * 0.88)

    # Tip spear diamonds
    d_th = sd_diamond(xx - (S - 44.0), yy - m, 22.0, 14.0)
    d_tv = sd_diamond(xx - m, yy - (S - 44.0), 14.0, 22.0)
    h = np.maximum(h, smoothstep(2.5, -1.5, np.minimum(d_th, d_tv)) * 0.92)

    mask = smoothstep(0.10, 0.30, h)
    h_sm = ndimage.gaussian_filter(h, sigma=1.8)
    nx, ny, nz = normals_from_height(h_sm, strength=7.5)
    brushed = brushed_metal_noise(S, S, horizontal=True, seed=611)
    rgb = shade_metal_pbr(nx, ny, nz, (0.95, 0.78, 0.38), (1.0, 0.98, 0.86), (0.42, 0.28, 0.08), 0.19, 0.96, brushed)

    # Drop shadow
    canvas = np.zeros((S, S, 4), dtype=np.float32)
    sh = ndimage.gaussian_filter(np.roll(mask, shift=(10, 8), axis=(0, 1)), sigma=7.0) * 0.55
    canvas[..., 3] = sh
    canvas = alpha_composite(canvas, np.concatenate([rgb, mask[..., None]], axis=-1))
    return to_pil_and_save(canvas, (192, 192), OUT_UI / out_name)


def render_spark_glow(out_name: str = "spark_glow.png") -> Image.Image:
    """
    Ultra-smooth analytical radial star-bloom particle sprite (128x128 RGBA).
    100% smooth radial falloff -> ZERO square particle artifacts ever!
    """
    S = 128
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    x = (xx - (S - 1) * 0.5) / (S * 0.5)
    y = (yy - (S - 1) * 0.5) / (S * 0.5)
    r = np.sqrt(x * x + y * y)

    core = np.exp(-r * r * 14.0)
    halo = np.exp(-r * r * 3.8) * 0.58
    # Delicate 4-point optical sparkle flare strictly inside circle
    flare_h = np.exp(-np.abs(y) * 16.0) * np.exp(-np.abs(x) * 3.4) * 0.42
    flare_v = np.exp(-np.abs(x) * 16.0) * np.exp(-np.abs(y) * 3.4) * 0.42
    edge_kill = smoothstep(0.96, 0.62, r)

    intensity = clamp01((core + halo + (flare_h + flare_v) * 0.65) * edge_kill)
    rgba = np.zeros((S, S, 4), dtype=np.float32)
    rgba[..., 0] = 1.0
    rgba[..., 1] = 1.0
    rgba[..., 2] = 1.0
    rgba[..., 3] = intensity
    return to_pil_and_save(rgba, (128, 128), OUT_UI / out_name)


# ==============================================================================
# PART 3: 12 ILLUSTRATED SOVEREIGN ENAMEL CATEGORY MEDALLIONS (cat_0..cat_11)
# ==============================================================================

def _draw_emblem_mask(size: int, draw_fn: Callable[[ImageDraw.ImageDraw, int], None]) -> np.ndarray:
    """Rasterizes a crisp high-res anti-aliased heraldic emblem mask at 2x icon SS (1152->576)."""
    hi = size * 2
    img = Image.new("L", (hi, hi), 0)
    dr = ImageDraw.Draw(img)
    draw_fn(dr, hi)
    lo = img.resize((size, size), resample=Image.Resampling.LANCZOS)
    return np.asarray(lo, dtype=np.float32) / 255.0


def _emblem_0_history_crown(dr: ImageDraw.ImageDraw, s: int) -> None:
    """0: World History — Sovereign 5-Spire Crown over Engraved Scroll Band."""
    c = s * 0.5
    cy = c - 0.015 * s
    # Crown body polygon with 3 tall majestic spires
    pts = [
        (c - 0.235 * s, cy + 0.125 * s),
        (c - 0.270 * s, cy - 0.115 * s),
        (c - 0.140 * s, cy + 0.010 * s),
        (c, cy - 0.200 * s),
        (c + 0.140 * s, cy + 0.010 * s),
        (c + 0.270 * s, cy - 0.115 * s),
        (c + 0.235 * s, cy + 0.125 * s),
    ]
    dr.polygon(pts, fill=255)
    # Pearls / sovereign orbs crowning the 3 spire tips
    for ox, oy, r in [
        (c - 0.270 * s, cy - 0.145 * s, 0.040 * s),
        (c, cy - 0.232 * s, 0.048 * s),
        (c + 0.270 * s, cy - 0.145 * s, 0.040 * s),
    ]:
        dr.ellipse([ox - r, oy - r, ox + r, oy + r], fill=255)
    # Cut out subtle royal jewels inside crown band for intricate silhouette depth
    for jx, r in [(c - 0.125 * s, 0.025 * s), (c, 0.030 * s), (c + 0.125 * s, 0.025 * s)]:
        jy = cy + 0.062 * s
        dr.polygon([(jx, jy - r), (jx + r * 0.85, jy), (jx, jy + r), (jx - r * 0.85, jy)], fill=0)
    # Sculpted curved sovereign base band + parchment scroll bar underneath
    dr.rounded_rectangle([c - 0.242 * s, cy + 0.158 * s, c + 0.242 * s, cy + 0.222 * s], radius=int(0.026 * s), fill=255)
    # Scroll end-rolls
    for sx in (c - 0.264 * s, c + 0.264 * s):
        dr.ellipse([sx - 0.034 * s, cy + 0.152 * s, sx + 0.034 * s, cy + 0.228 * s], fill=255)


def _emblem_1_science_atom(dr: ImageDraw.ImageDraw, s: int) -> None:
    """1: Science & Space — Sculpted 3D Orbital Atom with Nucleus & Orbiting Electrons."""
    c = s * 0.5
    # Draw 3 tilted elliptical orbital rings via dense polyline for razor-sharp uniform thickness
    rx, ry = 0.305 * s, 0.118 * s
    stroke = max(4, int(0.034 * s))
    for deg in (0.0, 60.0, 120.0):
        th = math.radians(deg)
        ct, st = math.cos(th), math.sin(th)
        pts = []
        for i in range(97):
            a = 2.0 * math.pi * i / 96.0
            ex = rx * math.cos(a)
            ey = ry * math.sin(a)
            pts.append((c + ex * ct - ey * st, c + ex * st + ey * ct))
        dr.line(pts, fill=255, width=stroke, joint="curve")
    # Glowing central nucleus sphere
    rn = 0.088 * s
    dr.ellipse([c - rn, c - rn, c + rn, c + rn], fill=255)
    # 3 orbiting electrons placed gracefully on outer arcs
    for deg, phase in [(0.0, 0.15), (60.0, 2.35), (120.0, 4.45)]:
        th = math.radians(deg)
        ex, ey = rx * math.cos(phase), ry * math.sin(phase)
        ox = c + ex * math.cos(th) - ey * math.sin(th)
        oy = c + ex * math.sin(th) + ey * math.cos(th)
        re = 0.044 * s
        dr.ellipse([ox - re, oy - re, ox + re, oy + re], fill=255)


def _emblem_2_geography_compass(dr: ImageDraw.ImageDraw, s: int) -> None:
    """2: Geography & Wonders — 8-Point Cartographer's Compass Rose & Degree Ring."""
    c = s * 0.5
    # Outer brass compass ring
    r_ring = 0.265 * s
    w_ring = int(0.026 * s)
    dr.ellipse([c - r_ring, c - r_ring, c + r_ring, c + r_ring], outline=255, width=w_ring)
    # 4 intercardinal (NE/SE/SW/NW) needle points
    for k in range(4):
        a = math.radians(45 + k * 90)
        al = a - 0.36
        ar = a + 0.36
        r_tip = 0.225 * s
        r_mid = 0.085 * s
        dr.polygon([
            (c, c),
            (c + r_mid * math.cos(al), c + r_mid * math.sin(al)),
            (c + r_tip * math.cos(a), c + r_tip * math.sin(a)),
            (c + r_mid * math.cos(ar), c + r_mid * math.sin(ar)),
        ], fill=255)
    # 4 majestic cardinal (N/E/S/W) sovereign compass points
    for k in range(4):
        a = math.radians(-90 + k * 90)
        al = a - 0.32
        ar = a + 0.32
        r_tip = (0.335 if k == 0 else 0.305) * s
        r_mid = 0.088 * s
        dr.polygon([
            (c, c),
            (c + r_mid * math.cos(al), c + r_mid * math.sin(al)),
            (c + r_tip * math.cos(a), c + r_tip * math.sin(a)),
            (c + r_mid * math.cos(ar), c + r_mid * math.sin(ar)),
        ], fill=255)
    # Crisp jewel eyelet cutout in center
    ri = 0.044 * s
    dr.ellipse([c - ri, c - ri, c + ri, c + ri], fill=0)
    rd = 0.022 * s
    dr.ellipse([c - rd, c - rd, c + rd, c + rd], fill=255)


def _emblem_3_arts_column(dr: ImageDraw.ImageDraw, s: int) -> None:
    """3: Arts & Architecture — Classical Fluted Ionic Architectural Column."""
    c = s * 0.5
    # Abacus top crown slab
    dr.rounded_rectangle([c - 0.275 * s, c - 0.275 * s, c + 0.275 * s, c - 0.205 * s], radius=int(0.018 * s), fill=255)
    # Twin sculpted spiral volutes
    for side in (-1, 1):
        vx = c + side * 0.215 * s
        vy = c - 0.145 * s
        vr = 0.082 * s
        dr.ellipse([vx - vr, vy - vr, vx + vr, vy + vr], fill=255)
        ir = 0.036 * s
        dr.ellipse([vx - ir, vy - ir, vx + ir, vy + ir], fill=0)
        dr.ellipse([vx - 0.016 * s, vy - 0.016 * s, vx + 0.016 * s, vy + 0.016 * s], fill=255)
    # Capital neck collar connecting volutes
    dr.rectangle([c - 0.19 * s, c - 0.21 * s, c + 0.19 * s, c - 0.095 * s], fill=255)
    # Fluted column shaft (slightly tapered entasis!)
    dr.polygon([
        (c - 0.145 * s, c - 0.09 * s),
        (c + 0.145 * s, c - 0.09 * s),
        (c + 0.165 * s, c + 0.20 * s),
        (c - 0.165 * s, c + 0.20 * s),
    ], fill=255)
    # 3 crisp vertical classical flutes carved into shaft
    for fx in (-0.075, 0.0, 0.075):
        fw = 0.024 * s
        dr.rounded_rectangle(
            [c + fx * s - fw, c - 0.055 * s, c + fx * s + fw, c + 0.165 * s],
            radius=int(fw), fill=0,
        )
    # Stepped classical plinth base
    dr.rounded_rectangle([c - 0.22 * s, c + 0.195 * s, c + 0.22 * s, c + 0.245 * s], radius=int(0.016 * s), fill=255)
    dr.rounded_rectangle([c - 0.265 * s, c + 0.240 * s, c + 0.265 * s, c + 0.295 * s], radius=int(0.016 * s), fill=255)


def _emblem_4_pop_lyre(dr: ImageDraw.ImageDraw, s: int) -> None:
    """4: Film, Music & Pop — Sculpted Classical Apollo Lyre with Spotlight Star."""
    c = s * 0.5
    cy = c + 0.015 * s
    # Graceful curved lyre horns (tight, regal proportions inside medallion)
    def draw_cubic(p0, p1, p2, p3, width):
        pts = []
        for i in range(49):
            t = i / 48.0
            mt = 1.0 - t
            px = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
            py = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
            pts.append((px, py))
        dr.line(pts, fill=255, width=width, joint="curve")

    w_horn = int(0.042 * s)
    for side in (-1, 1):
        draw_cubic(
            (c + side * 0.105 * s, cy + 0.17 * s),
            (c + side * 0.295 * s, cy + 0.07 * s),
            (c + side * 0.255 * s, cy - 0.19 * s),
            (c + side * 0.135 * s, cy - 0.21 * s),
            w_horn,
        )
        # Scroll finial ball at horn tip
        tx, ty = c + side * 0.135 * s, cy - 0.205 * s
        r = 0.034 * s
        dr.ellipse([tx - r, ty - r, tx + r, ty + r], fill=255)

    # Top crossbar yoke sitting cleanly between horn tips
    dr.rounded_rectangle([c - 0.175 * s, cy - 0.195 * s, c + 0.175 * s, cy - 0.148 * s], radius=int(0.018 * s), fill=255)
    # Sculpted curved soundbox base & pedestal
    dr.pieslice([c - 0.185 * s, cy + 0.03 * s, c + 0.185 * s, cy + 0.235 * s], start=0, end=180, fill=255)
    dr.rounded_rectangle([c - 0.185 * s, cy + 0.120 * s, c + 0.185 * s, cy + 0.192 * s], radius=int(0.026 * s), fill=255)
    dr.rounded_rectangle([c - 0.135 * s, cy + 0.218 * s, c + 0.135 * s, cy + 0.264 * s], radius=int(0.018 * s), fill=255)
    # 4 taut golden harp strings
    for sx in (-0.075, -0.025, 0.025, 0.075):
        dr.line([(c + sx * s, cy - 0.155 * s), (c + sx * s, cy + 0.135 * s)], fill=255, width=max(3, int(0.017 * s)))
    # Crisp 4-point cinema spotlight star crowning the yoke center
    st_y = cy - 0.242 * s
    dr.polygon([
        (c, st_y - 0.052 * s), (c + 0.016 * s, st_y - 0.016 * s),
        (c + 0.052 * s, st_y), (c + 0.016 * s, st_y + 0.016 * s),
        (c, st_y + 0.052 * s), (c - 0.016 * s, st_y + 0.016 * s),
        (c - 0.052 * s, st_y), (c - 0.016 * s, st_y - 0.016 * s),
    ], fill=255)


def _emblem_5_sports_trophy(dr: ImageDraw.ImageDraw, s: int) -> None:
    """5: Sports & Games — Sculpted Championship Goblet Trophy Cup with Twin Handles."""
    c = s * 0.5
    # Twin curved victory handles
    hw = int(0.036 * s)
    dr.arc([c - 0.305 * s, c - 0.215 * s, c - 0.06 * s, c + 0.035 * s], start=85, end=275, fill=255, width=hw)
    dr.arc([c + 0.06 * s, c - 0.215 * s, c + 0.305 * s, c + 0.035 * s], start=-95, end=95, fill=255, width=hw)
    # Upper goblet rim lip
    dr.rounded_rectangle([c - 0.215 * s, c - 0.265 * s, c + 0.215 * s, c - 0.210 * s], radius=int(0.024 * s), fill=255)
    # Tapered championship cup bowl
    dr.pieslice([c - 0.195 * s, c - 0.34 * s, c + 0.195 * s, c + 0.095 * s], start=0, end=180, fill=255)
    dr.rectangle([c - 0.195 * s, c - 0.22 * s, c + 0.195 * s, c - 0.11 * s], fill=255)
    # Engraved tiny champion star cutout inside cup chest
    star_pts = []
    for k in range(10):
        ang = -math.pi * 0.5 + k * math.pi / 5.0
        rad = (0.062 if k % 2 == 0 else 0.026) * s
        star_pts.append((c + rad * math.cos(ang), c - 0.105 * s + rad * math.sin(ang)))
    dr.polygon(star_pts, fill=0)
    # Sculpted stem & collared knop
    dr.rectangle([c - 0.042 * s, c + 0.065 * s, c + 0.042 * s, c + 0.21 * s], fill=255)
    dr.ellipse([c - 0.072 * s, c + 0.095 * s, c + 0.072 * s, c + 0.165 * s], fill=255)
    # Stepped championship pedestal
    dr.rounded_rectangle([c - 0.145 * s, c + 0.195 * s, c + 0.145 * s, c + 0.245 * s], radius=int(0.018 * s), fill=255)
    dr.rounded_rectangle([c - 0.205 * s, c + 0.242 * s, c + 0.205 * s, c + 0.300 * s], radius=int(0.020 * s), fill=255)


def _emblem_6_tech_circuit(dr: ImageDraw.ImageDraw, s: int) -> None:
    """6: Tech & Computing — Hexagonal Quantum Microchip Prism & Circuit Traces."""
    c = s * 0.5
    # Outer beveled hexagon core
    r_hex = 0.175 * s
    hex_pts = [(c + r_hex * math.cos(math.radians(30 + k * 60)), c + r_hex * math.sin(math.radians(30 + k * 60))) for k in range(6)]
    dr.polygon(hex_pts, fill=255)
    # Inner dark recess hexagon
    r_in = 0.105 * s
    in_pts = [(c + r_in * math.cos(math.radians(30 + k * 60)), c + r_in * math.sin(math.radians(30 + k * 60))) for k in range(6)]
    dr.polygon(in_pts, fill=0)
    # Bright central prism diamond die
    r_d = 0.056 * s
    dr.polygon([(c, c - r_d), (c + r_d, c), (c, c + r_d), (c - r_d, c)], fill=255)
    # 6 radial golden circuit traces + circular terminal nodes
    tw = max(4, int(0.026 * s))
    for k in range(6):
        ang = math.radians(k * 60)
        ca, sa = math.cos(ang), math.sin(ang)
        x0, y0 = c + 0.155 * s * ca, c + 0.155 * s * sa
        x1, y1 = c + 0.285 * s * ca, c + 0.285 * s * sa
        dr.line([(x0, y0), (x1, y1)], fill=255, width=tw)
        rn = 0.036 * s
        dr.ellipse([x1 - rn, y1 - rn, x1 + rn, y1 + rn], fill=255)
        ri = 0.015 * s
        dr.ellipse([x1 - ri, y1 - ri, x1 + ri, y1 + ri], fill=0)
    # Secondary bent side traces for unmistakable microchip silhouette
    for side in (-1, 1):
        for vdir in (-1, 1):
            ax = c + side * 0.135 * s
            ay = c + vdir * 0.145 * s
            bx = c + side * 0.205 * s
            by = c + vdir * 0.235 * s
            dr.line([(ax, ay), (bx, by)], fill=255, width=max(3, int(0.020 * s)))
            rn = 0.024 * s
            dr.ellipse([bx - rn, by - rn, bx + rn, by + rn], fill=255)


def _emblem_7_nature_leaf(dr: ImageDraw.ImageDraw, s: int) -> None:
    """7: Nature & Biology — Sculpted Sweeping Botanical Leaf with Etched Veins & Sprout."""
    c = s * 0.5
    # Main sweeping leaf contour (lower-left stem -> upper-right pointed tip)
    pts_top = []
    pts_bot = []
    for i in range(41):
        t = i / 40.0
        # Axis from (-0.23, +0.23) to (+0.27, -0.27)
        ax = -0.22 + 0.49 * t
        ay = 0.22 - 0.49 * t
        # Botanical teardrop width profile
        w = 0.215 * math.sin(math.pi * (t ** 0.72)) * (1.0 - 0.12 * t)
        # Normal perpendicular to (+1, -1) is (+0.707, +0.707)
        pts_top.append((c + (ax - w * 0.707) * s, c + (ay - w * 0.707) * s))
        pts_bot.append((c + (ax + w * 0.707) * s, c + (ay + w * 0.707) * s))
    dr.polygon(pts_top + list(reversed(pts_bot)), fill=255)

    # Graceful curved petiole stem extending to lower-left
    stem_pts = []
    for i in range(17):
        t = i / 16.0
        sx = -0.21 - 0.085 * t
        sy = 0.21 + 0.095 * t + 0.025 * math.sin(t * math.pi)
        stem_pts.append((c + sx * s, c + sy * s))
    dr.line(stem_pts, fill=255, width=max(4, int(0.032 * s)), joint="curve")

    # Carved midrib & 3 pairs of symmetric angled botanical veins (cutout contrast!)
    vw = max(3, int(0.018 * s))
    dr.line([(c - 0.18 * s, c + 0.18 * s), (c + 0.19 * s, c - 0.19 * s)], fill=0, width=vw)
    for frac, length in [(0.28, 0.11), (0.50, 0.125), (0.72, 0.085)]:
        mx = c + (-0.18 + 0.37 * frac) * s
        my = c + (0.18 - 0.37 * frac) * s
        # Upper-left vein & lower-right vein angling forward toward tip
        dr.line([(mx, my), (mx + length * 0.18 * s, my - length * 0.98 * s)], fill=0, width=max(2, int(0.015 * s)))
        dr.line([(mx, my), (mx + length * 0.98 * s, my - length * 0.18 * s)], fill=0, width=max(2, int(0.015 * s)))

    # Delicate tiny secondary bud leaf on lower-left stem
    bud = [
        (c - 0.21 * s, c + 0.16 * s),
        (c - 0.29 * s, c + 0.06 * s),
        (c - 0.27 * s, c - 0.02 * s),
        (c - 0.19 * s, c + 0.05 * s),
    ]
    dr.polygon(bud, fill=255)


def _emblem_8_society_scales(dr: ImageDraw.ImageDraw, s: int) -> None:
    """8: World Affairs & Law — Classical Balanced Scales of Justice."""
    c = s * 0.5
    # Central pillar & finial spire
    dr.rounded_rectangle([c - 0.026 * s, c - 0.23 * s, c + 0.026 * s, c + 0.24 * s], radius=int(0.014 * s), fill=255)
    dr.ellipse([c - 0.042 * s, c - 0.285 * s, c + 0.042 * s, c - 0.200 * s], fill=255)
    # Stepped courthouse base
    dr.rounded_rectangle([c - 0.14 * s, c + 0.215 * s, c + 0.14 * s, c + 0.255 * s], radius=int(0.015 * s), fill=255)
    dr.rounded_rectangle([c - 0.20 * s, c + 0.250 * s, c + 0.20 * s, c + 0.298 * s], radius=int(0.016 * s), fill=255)
    # Gracefully arched balance beam
    beam_pts = [
        (c - 0.265 * s, c - 0.135 * s),
        (c - 0.13 * s, c - 0.165 * s),
        (c, c - 0.195 * s),
        (c + 0.13 * s, c - 0.165 * s),
        (c + 0.265 * s, c - 0.135 * s),
    ]
    dr.line(beam_pts, fill=255, width=max(4, int(0.032 * s)), joint="curve")
    # Twin weighing pans with suspension chains
    cw = max(3, int(0.016 * s))
    for side in (-1, 1):
        px = c + side * 0.245 * s
        py_top = c - 0.135 * s
        py_pan = c + 0.065 * s
        r_pan = 0.105 * s
        dr.line([(px, py_top), (px - r_pan * 0.85, py_pan)], fill=255, width=cw)
        dr.line([(px, py_top), (px + r_pan * 0.85, py_pan)], fill=255, width=cw)
        dr.line([(px, py_top), (px, py_pan)], fill=255, width=max(2, int(0.012 * s)))
        # Sculpted bowl pan
        dr.pieslice([px - r_pan, py_pan - r_pan * 0.85, px + r_pan, py_pan + r_pan * 0.85], start=0, end=180, fill=255)
        dr.rounded_rectangle([px - r_pan * 1.04, py_pan - 0.016 * s, px + r_pan * 1.04, py_pan + 0.018 * s], radius=int(0.01 * s), fill=255)


def _emblem_9_craft_gears(dr: ImageDraw.ImageDraw, s: int) -> None:
    """9: Food, Craft & Design — Interlocking Precision Horological Brass Gears."""
    def draw_gear(cx: float, cy: float, r_out: float, r_root: float, r_hole: float, teeth: int, phase: float, spokes: int = 0) -> None:
        pts = []
        step = 2.0 * math.pi / teeth
        for i in range(teeth):
            a0 = phase + i * step
            pts.append((cx + r_root * math.cos(a0), cy + r_root * math.sin(a0)))
            pts.append((cx + r_out * math.cos(a0 + step * 0.16), cy + r_out * math.sin(a0 + step * 0.16)))
            pts.append((cx + r_out * math.cos(a0 + step * 0.44), cy + r_out * math.sin(a0 + step * 0.44)))
            pts.append((cx + r_root * math.cos(a0 + step * 0.60), cy + r_root * math.sin(a0 + step * 0.60)))
        dr.polygon(pts, fill=255)
        if spokes > 0:
            # Cut horological sector windows between spokes
            r_win_out = r_root * 0.72
            r_win_in = r_hole * 1.55
            for k in range(spokes):
                sa = phase + k * (2.0 * math.pi / spokes) + 0.24
                ea = phase + (k + 1) * (2.0 * math.pi / spokes) - 0.24
                wpts = []
                for j in range(9):
                    a = sa + (ea - sa) * j / 8.0
                    wpts.append((cx + r_win_out * math.cos(a), cy + r_win_out * math.sin(a)))
                for j in range(8, -1, -1):
                    a = sa + (ea - sa) * j / 8.0
                    wpts.append((cx + r_win_in * math.cos(a), cy + r_win_in * math.sin(a)))
                dr.polygon(wpts, fill=0)
        dr.ellipse([cx - r_hole, cy - r_hole, cx + r_hole, cy + r_hole], fill=0)
        rc = r_hole * 0.46
        dr.ellipse([cx - rc, cy - rc, cx + rc, cy + rc], fill=255)

    c = s * 0.5
    # Master horological wheel (lower-left) + interlocking precision pinion (upper-right)
    draw_gear(c - 0.085 * s, c + 0.075 * s, 0.225 * s, 0.178 * s, 0.056 * s, teeth=10, phase=0.15, spokes=5)
    draw_gear(c + 0.165 * s, c - 0.140 * s, 0.148 * s, 0.108 * s, 0.044 * s, teeth=7, phase=0.42, spokes=0)


def _emblem_10_myth_book_quill(dr: ImageDraw.ImageDraw, s: int) -> None:
    """10: Myth & Literature — Open Gilded Grimoire Book & Sculpted Feather Quill."""
    c = s * 0.5
    cy = c - 0.025 * s
    # Open arched book pages (left & right curved halves)
    left_page = [
        (c - 0.014 * s, cy + 0.04 * s),
        (c - 0.095 * s, cy + 0.005 * s),
        (c - 0.255 * s, cy + 0.025 * s),
        (c - 0.275 * s, cy + 0.215 * s),
        (c - 0.095 * s, cy + 0.188 * s),
        (c - 0.014 * s, cy + 0.235 * s),
    ]
    right_page = [(2.0 * c - x, y) for (x, y) in left_page]
    dr.polygon(left_page, fill=255)
    dr.polygon(right_page, fill=255)
    # Book cover underside ledger rim
    dr.line([(c - 0.285 * s, cy + 0.248 * s), (c - 0.095 * s, cy + 0.220 * s), (c, cy + 0.268 * s),
             (c + 0.095 * s, cy + 0.220 * s), (c + 0.285 * s, cy + 0.248 * s)],
            fill=255, width=max(4, int(0.024 * s)), joint="curve")
    # Subtle engraved text lines on left page
    for ly in (0.075, 0.122, 0.168):
        dr.line([(c - 0.220 * s, cy + ly * s), (c - 0.068 * s, cy + (ly - 0.01) * s)], fill=0, width=max(2, int(0.013 * s)))

    # Sculpted sweeping feather quill rising dynamically from the book spine to upper-right!
    q_top, q_bot = [], []
    for i in range(37):
        t = i / 36.0
        qx = 0.01 + 0.215 * t + 0.036 * math.sin(t * math.pi)
        qy = 0.015 - 0.275 * t
        if t < 0.18:
            w_l, w_r = 0.011, 0.011
        else:
            ft = (t - 0.18) / 0.82
            w_l = 0.068 * math.sin(math.pi * (ft ** 0.75))
            w_r = 0.086 * math.sin(math.pi * (ft ** 0.85))
        q_top.append((c + (qx - w_l * 0.8) * s, cy + (qy - w_l * 0.6) * s))
        q_bot.append((c + (qx + w_r * 0.8) * s, cy + (qy + w_r * 0.6) * s))
    dr.polygon(q_top + list(reversed(q_bot)), fill=255)
    # Feather rachis spine cutout & stylish barb notches
    dr.line([(c + 0.01 * s, cy + 0.015 * s), (c + 0.195 * s, cy - 0.225 * s)], fill=0, width=max(2, int(0.013 * s)))
    dr.polygon([(c + 0.10 * s, cy - 0.15 * s), (c + 0.065 * s, cy - 0.195 * s), (c + 0.128 * s, cy - 0.178 * s)], fill=0)
    dr.polygon([(c + 0.165 * s, cy - 0.06 * s), (c + 0.220 * s, cy - 0.042 * s), (c + 0.192 * s, cy - 0.098 * s)], fill=0)


def _emblem_11_logic_infinity(dr: ImageDraw.ImageDraw, s: int) -> None:
    """11: Logic & Math — Sculpted 3D Möbius Infinity Ribbon & Geometric Diamond Axis."""
    c = s * 0.5
    # Crisp Bernoulli lemniscate (infinity symbol) rendered as thick sculpted metallic ribbon
    a = 0.305 * s
    w_rib = int(0.058 * s)
    pts = []
    for i in range(181):
        t = 2.0 * math.pi * i / 180.0
        denom = 1.0 + math.sin(t) ** 2
        lx = a * math.cos(t) / denom
        ly = a * math.sin(t) * math.cos(t) / denom * 1.28
        pts.append((c + lx, c + ly))
    dr.line(pts, fill=255, width=w_rib, joint="curve")

    # Over/under crossing cutout gap so the infinity loop looks genuinely 3D-intertwined!
    dr.line([(c - 0.055 * s, c + 0.055 * s), (c + 0.055 * s, c - 0.055 * s)], fill=0, width=int(0.088 * s))
    dr.line([(c - 0.075 * s, c - 0.075 * s), (c + 0.075 * s, c + 0.075 * s)], fill=255, width=w_rib)

    # Top & bottom sculpted geometric diamond logic-axis markers
    for sy in (-0.235, 0.235):
        dy = c + sy * s
        dr.polygon([
            (c, dy - 0.052 * s), (c + 0.042 * s, dy),
            (c, dy + 0.052 * s), (c - 0.042 * s, dy),
        ], fill=255)


CATEGORY_SPECS = [
    # (id, name, enamel_center_rgb, enamel_edge_rgb, draw_fn)
    (0, "World History",       (0.46, 0.28, 0.09), (0.14, 0.08, 0.03), _emblem_0_history_crown),
    (1, "Science & Space",     (0.08, 0.34, 0.56), (0.03, 0.10, 0.22), _emblem_1_science_atom),
    (2, "Geography & Wonders", (0.07, 0.42, 0.34), (0.02, 0.13, 0.12), _emblem_2_geography_compass),
    (3, "Arts & Architecture", (0.44, 0.15, 0.24), (0.15, 0.04, 0.09), _emblem_3_arts_column),
    (4, "Film, Music & Pop",   (0.50, 0.12, 0.34), (0.17, 0.04, 0.13), _emblem_4_pop_lyre),
    (5, "Sports & Games",      (0.54, 0.22, 0.08), (0.18, 0.06, 0.03), _emblem_5_sports_trophy),
    (6, "Tech & Computing",    (0.06, 0.40, 0.48), (0.02, 0.12, 0.18), _emblem_6_tech_circuit),
    (7, "Nature & Biology",    (0.11, 0.44, 0.20), (0.03, 0.14, 0.07), _emblem_7_nature_leaf),
    (8, "World Affairs & Law", (0.18, 0.25, 0.44), (0.06, 0.09, 0.18), _emblem_8_society_scales),
    (9, "Food, Craft & Design",(0.48, 0.23, 0.13), (0.17, 0.07, 0.04), _emblem_9_craft_gears),
    (10, "Myth & Literature",  (0.28, 0.16, 0.54), (0.09, 0.05, 0.21), _emblem_10_myth_book_quill),
    (11, "Logic & Math",       (0.16, 0.21, 0.30), (0.05, 0.07, 0.12), _emblem_11_logic_infinity),
]


def render_category_medallion(
    cat_id: int,
    enamel_center: Tuple[float, float, float],
    enamel_edge: Tuple[float, float, float],
    draw_fn: Callable[[ImageDraw.ImageDraw, int], None],
) -> Image.Image:
    """
    Renders a 576x576 -> 192x192 museum-grade Horological Enamel & 24K Gold Category Medallion.
    """
    S = 576
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    x = (xx - S * 0.5) / (S * 0.5)
    y = (yy - S * 0.5) / (S * 0.5)
    r = np.sqrt(x * x + y * y)
    ang = np.arctan2(y, x)

    # Outer silhouette radius = 0.90 (leaving room for soft grounding shadow!)
    r_outer = 0.89
    r_bevel_in = 0.755
    r_dial = 0.745

    canvas = np.zeros((S, S, 4), dtype=np.float32)

    # Soft downward drop shadow
    r_sh = np.sqrt(x * x + (y - 0.042) ** 2)
    sh_a = np.exp(-np.maximum(r_sh - r_outer, 0.0) * 16.0) * 0.58 * smoothstep(1.02, r_outer - 0.02, r_sh)
    canvas[..., :3] = np.array([0.015, 0.020, 0.032], dtype=np.float32)[None, None, :]
    canvas[..., 3] = sh_a

    # 1. Grand-Feu Enamel Dial with Breguet Radial Sunburst Guilloché
    dial_mask = smoothstep(r_dial + 0.012, r_dial - 0.008, r)
    ec = np.array(enamel_center, dtype=np.float32)[None, None, :]
    ee = np.array(enamel_edge, dtype=np.float32)[None, None, :]
    # Slightly off-center upper-left jewel highlight glow inside the enamel
    r_lit = np.sqrt((x + 0.16) ** 2 + (y + 0.20) ** 2) / 0.98
    rad_t = clamp01(r_lit ** 1.15)
    enamel_rgb = ec * (1.0 - rad_t[..., None]) + ee * rad_t[..., None]

    # Subtle 36-ray guilloché radial engine-turning + fine concentric watch-dial rings
    guilloche = (np.sin(ang * 36.0) * 0.5 + 0.5) * (np.sin(r * 110.0) * 0.5 + 0.5)
    sunburst = (np.cos(ang * 2.0 + 0.75) * 0.5 + 0.5) * 0.16
    enamel_rgb = enamel_rgb * (0.90 + guilloche[..., None] * 0.14 + sunburst[..., None])

    # Recessed inner bezel AO darkening along enamel rim
    rim_ao = smoothstep(r_dial - 0.13, r_dial, r)
    enamel_rgb = enamel_rgb * (1.0 - rim_ao[..., None] * 0.52)

    # Fine engraved gold chapter ring ticks inside the enamel perimeter
    tick_ring = np.exp(-np.power((r - 0.695) / 0.012, 2.0)) * np.power(clamp01(np.cos(ang * 12.0)), 14.0)
    enamel_rgb = clamp01(enamel_rgb + np.array([0.96, 0.82, 0.48], dtype=np.float32)[None, None, :] * (tick_ring[..., None] * 0.45))

    canvas = alpha_composite(canvas, np.concatenate([enamel_rgb, dial_mask[..., None]], axis=-1))

    # 2. Sculpted 24K Gold Circular Medallion Bezel Frame (double-beveled with cardinal notches!)
    bevel_mask = smoothstep(r_outer + 0.008, r_outer - 0.006, r) * smoothstep(r_bevel_in - 0.006, r_bevel_in + 0.006, r)
    t_b = clamp01((r - r_bevel_in) / (r_outer - r_bevel_in))
    # Crowned double-step horological bezel profile
    bevel_h = np.power(np.maximum(np.sin(t_b * math.pi), 0.0), 0.55) * 1.0
    # Fine recessed mid-channel ring on bezel
    bevel_h -= 0.18 * np.exp(-np.power((t_b - 0.30) / 0.075, 2.0))
    # 4 tiny cardinal decorative gold lugs at N/E/S/W on the bezel
    cardinal = np.power(clamp01(np.cos(ang * 2.0) ** 2), 18.0) * np.exp(-np.power((t_b - 0.55) / 0.25, 2.0))
    bevel_h = (bevel_h + cardinal * 0.22) * bevel_mask
    bevel_h_sm = ndimage.gaussian_filter(bevel_h, sigma=1.1)

    bnx, bny, bnz = normals_from_height(bevel_h_sm, strength=10.5)
    # Circular lathe-brushed metal sheen
    circ_brush = np.sin(r * 260.0 + cat_id * 1.7) * 0.35 + brushed_metal_noise(S, S, horizontal=True, seed=700 + cat_id) * 0.45
    bezel_rgb = shade_metal_pbr(
        bnx, bny, bnz,
        base_rgb=(0.95, 0.77, 0.36),
        spec_rgb=(1.00, 0.98, 0.86),
        shadow_rgb=(0.40, 0.25, 0.06),
        roughness=0.19,
        metallic=0.96,
        brushed=circ_brush,
    )
    canvas = alpha_composite(canvas, np.concatenate([bezel_rgb, bevel_mask[..., None]], axis=-1))

    # 3. Raised 3D-Beveled 24K Champagne-Gold Heraldic Emblem!
    emblem_mask = _draw_emblem_mask(S, draw_fn)
    # Crisp dark drop shadow cast onto the jewel enamel underneath
    emb_sh = ndimage.gaussian_filter(np.roll(emblem_mask, shift=(10, 8), axis=(0, 1)), sigma=5.5) * 0.68
    sh_layer = np.zeros((S, S, 4), dtype=np.float32)
    sh_layer[..., 3] = clamp01(emb_sh) * dial_mask
    canvas = alpha_composite(canvas, sh_layer)

    # Smooth EDT heightfield for crisp cast-gold 3D beveled metallic relief
    emb_bin = emblem_mask > 0.42
    dist_in = ndimage.distance_transform_edt(emb_bin).astype(np.float32)
    emb_h = np.minimum(dist_in, 18.0) / 18.0
    emb_h = np.sqrt(clamp01(emb_h)) * emblem_mask
    emb_h_sm = ndimage.gaussian_filter(emb_h, sigma=1.15)
    enx, eny, enz = normals_from_height(emb_h_sm, strength=7.4)

    emb_rgb = shade_metal_pbr(
        enx, eny, enz,
        base_rgb=(0.98, 0.82, 0.40),
        spec_rgb=(1.00, 0.99, 0.90),
        shadow_rgb=(0.44, 0.26, 0.06),
        roughness=0.16,
        metallic=0.96,
    )
    # Extra crisp two-tone origami facet contrast on Compass Rose (cat_2) cardinal/intercardinal arms!
    if cat_id == 2:
        # Alternating light/shaded half-facets across every 45-degree compass spoke
        facet_sign = np.sin(ang * 8.0)
        in_rose = smoothstep(0.56, 0.46, r) * smoothstep(0.06, 0.11, r)
        emb_rgb = clamp01(emb_rgb * (1.0 + facet_sign[..., None] * 0.22 * in_rose[..., None]))
    canvas = alpha_composite(canvas, np.concatenate([emb_rgb, emblem_mask[..., None]], axis=-1))

    # 4. Watch-Crystal Curved Glass Dome Specular Crescent across upper-left dial!
    # Keep subtle so emblem clarity stays 100% razor-sharp
    dome_arc = smoothstep(0.68, 0.35, np.sqrt((x + 0.24) ** 2 + (y + 0.46) ** 2)) * smoothstep(0.08, -0.35, y) * dial_mask
    glass_layer = np.zeros((S, S, 4), dtype=np.float32)
    glass_layer[..., :3] = np.array([1.0, 0.98, 0.94], dtype=np.float32)[None, None, :]
    glass_layer[..., 3] = clamp01(dome_arc * 0.15)
    canvas = alpha_composite(canvas, glass_layer)

    return to_pil_and_save(canvas, (192, 192), OUT_UI / f"cat_{cat_id}.png")


# ==============================================================================
# PART 4: 1920x1080 VISUAL QA CONTACT SHEET
# ==============================================================================

def load_label_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        ROOT / "godot" / "themes" / "fonts" / "PlusJakartaSans.ttf",
        ROOT / "godot" / "themes" / "fonts" / "Cinzel.ttf",
        Path("C:/Windows/Fonts/seguisb.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ]
    for p in candidates:
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except Exception:
                pass
    return ImageFont.load_default()


def build_contact_sheet(images: dict[str, Image.Image]) -> Path:
    """Composites ALL 25 sculpted UI assets onto a rich dark architectural 1920x1080 QA showcase sheet."""
    W, H = 1920, 1080
    # Subtle dark obsidian studio backdrop with faint warm vignette so transparency & drop shadows inspect clearly
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    nx = (xx / W - 0.5) * 2.0
    ny = (yy / H - 0.5) * 2.0
    rad = np.sqrt(nx * nx * 0.85 + ny * ny)
    bg = np.zeros((H, W, 3), dtype=np.float32)
    bg[..., 0] = 0.055 + 0.035 * np.exp(-rad * rad * 1.4)
    bg[..., 1] = 0.072 + 0.042 * np.exp(-rad * rad * 1.4)
    bg[..., 2] = 0.112 + 0.052 * np.exp(-rad * rad * 1.4)
    # Subtle faint studio blueprint grid to visually verify alpha translucency!
    grid = ((xx.astype(np.int32) % 40 == 0) | (yy.astype(np.int32) % 40 == 0)).astype(np.float32) * 0.022
    bg += grid[..., None]
    sheet = Image.fromarray(np.round(clamp01(bg) * 255.0).astype(np.uint8), mode="RGB").convert("RGBA")
    dr = ImageDraw.Draw(sheet)

    f_title = load_label_font(30)
    f_sec = load_label_font(18)
    f_lbl = load_label_font(14)

    dr.text((36, 20), "WORLD'S SMARTEST — AAA SCULPTED UI ART PACK CONTACT SHEET (25 ASSETS)", fill=(242, 210, 139, 255), font=f_title)
    dr.line([(36, 62), (W - 36, 62)], fill=(212, 168, 83, 130), width=2)

    def stretch_ninepatch(im: Image.Image, tw: int, th: int, ml: int, mr: int, mt: int, mb: int) -> Image.Image:
        """Exact 9-slice stretch matching Godot StyleBoxTexture so contact sheet verifies true corner fidelity!"""
        sw, sh = im.size
        # Proportionally clamp margins if target is tighter than margins
        sx = min(1.0, tw / max(ml + mr, 1))
        sy = min(1.0, th / max(mt + mb, 1))
        dl, dr_m = int(round(ml * sx)), int(round(mr * sx))
        dt, db = int(round(mt * sy)), int(round(mb * sy))
        dmw = max(0, tw - dl - dr_m)
        dmh = max(0, th - dt - db)

        out = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
        xs = [(0, ml, 0, dl), (ml, sw - mr, dl, dmw), (sw - mr, sw, dl + dmw, dr_m)]
        ys = [(0, mt, 0, dt), (mt, sh - mb, dt, dmh), (sh - mb, sh, dt + dmh, db)]
        for sx0, sx1, dx0, dw in xs:
            for sy0, sy1, dy0, dh in ys:
                if dw <= 0 or dh <= 0 or sx1 <= sx0 or sy1 <= sy0:
                    continue
                patch = im.crop((sx0, sy0, sx1, sy1)).resize((dw, dh), resample=Image.Resampling.LANCZOS)
                out.paste(patch, (dx0, dy0))
        return out

    def paste_item(key: str, x: int, y: int, tw: int, th: int, caption: str, sample_text: str = "", text_col=(245, 241, 230, 255), ninepatch: Tuple[int, int, int, int] | None = None):
        im = images[key]
        if ninepatch is not None:
            im = stretch_ninepatch(im, tw, th, *ninepatch)
        elif im.size != (tw, th):
            im = im.resize((tw, th), resample=Image.Resampling.LANCZOS)
        sheet.alpha_composite(im, (x, y))
        if sample_text:
            tb = dr.textbbox((0, 0), sample_text, font=f_sec)
            tx = x + (tw - (tb[2] - tb[0])) // 2
            ty = y + (th - (tb[3] - tb[1])) // 2 - 4
            dr.text((tx, ty), sample_text, fill=text_col, font=f_sec)
        dr.text((x + 6, y + th + 4), caption, fill=(195, 204, 220, 235), font=f_lbl)

    # Row 1: Hero Panels (panel_tableau & panel_dialogue_cinema) + Gold Primary CTAs (rendered via true NinePatch!)
    dr.text((36, 74), "SCULPTED NINEPATCH PANELS & 24K LIQUID-GOLD CTAs (512x256, TRUE 9-SLICE PREVIEW)", fill=(212, 168, 83, 220), font=f_sec)
    paste_item("panel_tableau.png", 36, 102, 430, 215, "panel_tableau.png (Main Broadcast Card)", "UNIFIED BROADCAST TABLEAU", ninepatch=(84, 84, 76, 80))
    paste_item("panel_dialogue_cinema.png", 494, 102, 430, 215, "panel_dialogue_cinema.png (Cinema Dossier)", "JULIAN VANCE · GENEVA", ninepatch=(72, 72, 64, 68))
    paste_item("btn_gold_primary.png", 956, 108, 444, 108, "btn_gold_primary.png (24K Liquid Gold CTA)", "START ROUND >", (17, 21, 30, 255), ninepatch=(68, 68, 50, 56))
    paste_item("btn_gold_hover.png", 956, 228, 444, 108, "btn_gold_hover.png (Gold Hover Sheen)", "LOCK ESTIMATE", (17, 21, 30, 255), ninepatch=(68, 68, 50, 56))

    # Right column top: Stars, Streak Fire Crest, Corner Filigree & Spark Glow
    dr.text((1436, 74), "TROPHY STARS, STREAK & VFX", fill=(212, 168, 83, 220), font=f_sec)
    paste_item("star_filled.png", 1436, 104, 118, 118, "star_filled")
    paste_item("star_empty.png", 1568, 104, 118, 118, "star_empty")
    paste_item("badge_streak_fire.png", 1704, 96, 152, 152, "badge_streak_fire")
    paste_item("corner_filigree.png", 1446, 252, 110, 110, "corner_filigree")
    paste_item("spark_glow.png", 1584, 256, 100, 100, "spark_glow")

    # Row 2: 4 Answer Plaques (Idle, Hover, Correct Emerald-Gold, Wrong Crimson-Bronze)
    dr.text((36, 362), "BEVELED METALLIC ANSWER PLAQUES (512x256 NINEPATCH)", fill=(212, 168, 83, 220), font=f_sec)
    paste_item("btn_answer_idle.png", 36, 392, 430, 122, "btn_answer_idle.png", "A.  Constantinople", ninepatch=(64, 64, 52, 56))
    paste_item("btn_answer_hover.png", 494, 392, 430, 122, "btn_answer_hover.png (Hover / Focus)", "B.  Alexandria", (242, 210, 139, 255), ninepatch=(64, 64, 52, 56))
    paste_item("btn_answer_correct.png", 952, 392, 430, 122, "btn_answer_correct.png (Emerald-Gold)", "C.  Hagia Sophia  [LOCKED]", (234, 255, 246, 255), ninepatch=(64, 64, 52, 56))
    paste_item("btn_answer_wrong.png", 1410, 392, 430, 122, "btn_answer_wrong.png (Crimson-Bronze)", "D.  Babylon", (255, 224, 229, 255), ninepatch=(64, 64, 52, 56))

    # Row 3 & 4: All 12 Illustrated Sovereign Enamel Category Medallions (6 x 2 grid at 168x168!)
    dr.text((36, 560), "12 ILLUSTRATED SOVEREIGN ENAMEL CATEGORY MEDALLIONS (192x192 RGBA)", fill=(212, 168, 83, 220), font=f_sec)
    for idx, (cid, cname, _, _, _) in enumerate(CATEGORY_SPECS):
        col = idx % 6
        row = idx // 6
        x = 64 + col * 304
        y = 596 + row * 234
        paste_item(f"cat_{cid}.png", x, y, 178, 178, f"cat_{cid}: {cname}")

    out_path = OUT_RENDERS / "ui_pack_contact_sheet.png"
    sheet.convert("RGB").save(out_path, format="PNG", optimize=True)
    return out_path


# ==============================================================================
# MAIN BUILD PIPELINE
# ==============================================================================

def main() -> None:
    print("[AAA UI Pack] Rendering sculpted 2D PBR luxury textures...")
    imgs: dict[str, Image.Image] = {}

    # 1. Main Broadcast Tableau Panel (Obsidian-Marble + Champagne-Brass Art-Deco Filigree)
    imgs["panel_tableau.png"] = render_sculpted_panel(
        out_name="panel_tableau.png",
        interior_top=(0.068, 0.095, 0.155),
        interior_bot=(0.036, 0.052, 0.092),
        interior_alpha=0.92,
        vein_tint=(0.24, 0.28, 0.38),
        vein_strength=0.22,
        metal_base=(0.88, 0.70, 0.34),
        metal_spec=(1.00, 0.96, 0.82),
        metal_shadow=(0.35, 0.23, 0.07),
        inner_glow_rgb=(0.95, 0.80, 0.44),
        inner_glow_strength=0.14,
        outer_glow_rgb=(0.88, 0.70, 0.34),
        outer_glow_strength=0.10,
        shape="chamfer",
        corner_size=34.0,
        bevel_width=18.0,
        ornate_corners=True,
        corner_arm=84.0,
        top_glass_sheen=0.16,
        seed=101,
    )
    print("  + panel_tableau.png")

    # 2. Cinema Dialogue / Classified Dossier Frame
    imgs["panel_dialogue_cinema.png"] = render_sculpted_panel(
        out_name="panel_dialogue_cinema.png",
        interior_top=(0.055, 0.075, 0.122),
        interior_bot=(0.028, 0.040, 0.072),
        interior_alpha=0.90,
        vein_tint=(0.22, 0.24, 0.32),
        vein_strength=0.14,
        metal_base=(0.84, 0.67, 0.34),
        metal_spec=(0.99, 0.94, 0.78),
        metal_shadow=(0.30, 0.20, 0.07),
        inner_glow_rgb=(0.92, 0.78, 0.46),
        inner_glow_strength=0.10,
        outer_glow_rgb=None,
        outer_glow_strength=0.0,
        shape="chamfer",
        corner_size=26.0,
        bevel_width=13.0,
        ornate_corners=False,
        corner_arm=64.0,
        top_glass_sheen=0.13,
        seed=117,
    )
    print("  + panel_dialogue_cinema.png")

    # 3. Answer Plaques (Idle, Hover, Correct Emerald-Gold, Wrong Crimson-Bronze)
    imgs["btn_answer_idle.png"] = render_sculpted_panel(
        out_name="btn_answer_idle.png",
        interior_top=(0.088, 0.122, 0.198),
        interior_bot=(0.045, 0.064, 0.112),
        interior_alpha=0.94,
        vein_tint=(0.24, 0.30, 0.44),
        vein_strength=0.16,
        metal_base=(0.78, 0.62, 0.33),
        metal_spec=(0.98, 0.92, 0.76),
        metal_shadow=(0.28, 0.19, 0.07),
        inner_glow_rgb=(0.82, 0.70, 0.44),
        inner_glow_strength=0.10,
        shape="chamfer",
        corner_size=26.0,
        bevel_width=14.0,
        ornate_corners=False,
        corner_arm=46.0,
        top_glass_sheen=0.16,
        seed=201,
        pad_lr=22.0,
        pad_top=18.0,
        pad_bot=28.0,
    )
    print("  + btn_answer_idle.png")

    imgs["btn_answer_hover.png"] = render_sculpted_panel(
        out_name="btn_answer_hover.png",
        interior_top=(0.235, 0.180, 0.088),
        interior_bot=(0.118, 0.088, 0.044),
        interior_alpha=0.96,
        vein_tint=(0.48, 0.36, 0.16),
        vein_strength=0.20,
        metal_base=(0.98, 0.81, 0.40),
        metal_spec=(1.00, 0.99, 0.88),
        metal_shadow=(0.46, 0.30, 0.08),
        inner_glow_rgb=(1.00, 0.84, 0.42),
        inner_glow_strength=0.30,
        outer_glow_rgb=(0.98, 0.80, 0.36),
        outer_glow_strength=0.36,
        shape="chamfer",
        corner_size=26.0,
        bevel_width=15.0,
        ornate_corners=False,
        corner_arm=48.0,
        top_glass_sheen=0.22,
        seed=207,
        pad_lr=22.0,
        pad_top=18.0,
        pad_bot=28.0,
    )
    print("  + btn_answer_hover.png")

    imgs["btn_answer_correct.png"] = render_sculpted_panel(
        out_name="btn_answer_correct.png",
        interior_top=(0.068, 0.385, 0.258),
        interior_bot=(0.032, 0.205, 0.138),
        interior_alpha=0.97,
        vein_tint=(0.24, 0.78, 0.54),
        vein_strength=0.22,
        metal_base=(0.86, 0.80, 0.40),
        metal_spec=(0.94, 1.00, 0.86),
        metal_shadow=(0.20, 0.36, 0.18),
        inner_glow_rgb=(0.30, 0.96, 0.66),
        inner_glow_strength=0.36,
        outer_glow_rgb=(0.24, 0.92, 0.60),
        outer_glow_strength=0.44,
        shape="chamfer",
        corner_size=26.0,
        bevel_width=15.0,
        ornate_corners=False,
        corner_arm=48.0,
        top_glass_sheen=0.24,
        seed=213,
        pad_lr=22.0,
        pad_top=18.0,
        pad_bot=28.0,
    )
    print("  + btn_answer_correct.png")

    imgs["btn_answer_wrong.png"] = render_sculpted_panel(
        out_name="btn_answer_wrong.png",
        interior_top=(0.395, 0.088, 0.125),
        interior_bot=(0.215, 0.042, 0.068),
        interior_alpha=0.97,
        vein_tint=(0.76, 0.24, 0.30),
        vein_strength=0.20,
        metal_base=(0.82, 0.40, 0.36),
        metal_spec=(1.00, 0.80, 0.78),
        metal_shadow=(0.36, 0.10, 0.12),
        inner_glow_rgb=(1.00, 0.34, 0.44),
        inner_glow_strength=0.32,
        outer_glow_rgb=(0.98, 0.26, 0.38),
        outer_glow_strength=0.38,
        shape="chamfer",
        corner_size=26.0,
        bevel_width=15.0,
        ornate_corners=False,
        corner_arm=48.0,
        top_glass_sheen=0.18,
        seed=219,
        pad_lr=22.0,
        pad_top=18.0,
        pad_bot=28.0,
    )
    print("  + btn_answer_wrong.png")

    # 4. Brushed 24K Liquid-Gold Primary & Hover CTA Pills
    imgs["btn_gold_primary.png"] = render_gold_cta_pill("btn_gold_primary.png", is_hover=False)
    print("  + btn_gold_primary.png")
    imgs["btn_gold_hover.png"] = render_gold_cta_pill("btn_gold_hover.png", is_hover=True)
    print("  + btn_gold_hover.png")

    # 5. Championship Stars, Streak Crest, Corner Filigree & Smooth Radial Spark Glow
    imgs["star_filled.png"] = render_championship_star("star_filled.png", filled=True)
    print("  + star_filled.png")
    imgs["star_empty.png"] = render_championship_star("star_empty.png", filled=False)
    print("  + star_empty.png")
    imgs["badge_streak_fire.png"] = render_streak_fire_badge("badge_streak_fire.png")
    print("  + badge_streak_fire.png")
    imgs["corner_filigree.png"] = render_corner_filigree("corner_filigree.png")
    print("  + corner_filigree.png")
    imgs["spark_glow.png"] = render_spark_glow("spark_glow.png")
    print("  + spark_glow.png")

    # 6. 12 Illustrated Sovereign Enamel Category Medallions
    for cid, cname, ec, ee, draw_fn in CATEGORY_SPECS:
        imgs[f"cat_{cid}.png"] = render_category_medallion(cid, ec, ee, draw_fn)
        print(f"  + cat_{cid}.png ({cname})")

    # 7. Visual QA Contact Sheet (1920x1080)
    sheet_path = build_contact_sheet(imgs)
    total_bytes = sum((OUT_UI / k).stat().st_size for k in imgs)
    print(f"[AAA UI Pack] DONE! {len(imgs)} PNGs ({total_bytes / 1024.0:.1f} KiB total) + Contact Sheet: {sheet_path}")


if __name__ == "__main__":
    main()
