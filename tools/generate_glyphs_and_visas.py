#!/usr/bin/env python3
"""
World's Smartest — Wave-2 AAA Holographic Core Glyphs, Passport Visas & Faction Crests
======================================================================================
Implements PITCH_BIBLE.md §2.1, §2.2, §3.1, §5.2 & §7.1:
  1. public/assets/glyphs/*.png (36 crisp 256x256 luminous gold-and-cyan SDF wireframe
     holographic core glyphs across all 12 domains + public/assets/glyphs/manifest.json)
  2. public/assets/visas/visa_{ch,gb,jp,br,eg,is,sg,global}.png (8 authentic bespoke
     320x320 diplomatic passport ink-stamp emblems)
  3. public/assets/factions/faction_{sovereign,horizon,agora}.png (3 sculpted 384x384
     PBR metallic & enamel World Council Faction crests)
  4. assets/renders/glyphs_visas_factions_sheet.png (1920x1080 visual QA contact sheet)
"""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Callable, Dict, List, Tuple

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
OUT_GLYPHS = ROOT / "public" / "assets" / "glyphs"
OUT_VISAS = ROOT / "public" / "assets" / "visas"
OUT_FACTIONS = ROOT / "public" / "assets" / "factions"
OUT_RENDERS = ROOT / "assets" / "renders"

for d in (OUT_GLYPHS, OUT_VISAS, OUT_FACTIONS, OUT_RENDERS):
    d.mkdir(parents=True, exist_ok=True)


# ==============================================================================
# SHARED MATH, SDF & PBR METALLIC HELPERS
# ==============================================================================

def clamp01(x: np.ndarray) -> np.ndarray:
    return np.clip(x, 0.0, 1.0)


def smoothstep(e0: float, e1: float, x: np.ndarray) -> np.ndarray:
    t = clamp01((x - e0) / (e1 - e0 + 1e-12))
    return t * t * (3.0 - 2.0 * t)


def load_font(kind: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    font_map = {
        "serif": [ROOT / "godot" / "themes" / "fonts" / "Cinzel.ttf", Path("C:/Windows/Fonts/georgia.ttf")],
        "sans": [ROOT / "godot" / "themes" / "fonts" / "PlusJakartaSans.ttf", Path("C:/Windows/Fonts/seguisb.ttf")],
        "mono": [ROOT / "godot" / "themes" / "fonts" / "JetBrainsMono.ttf", Path("C:/Windows/Fonts/consolab.ttf")],
    }
    for p in font_map.get(kind, []) + font_map["sans"]:
        if p.exists():
            try:
                return ImageFont.truetype(str(p), size)
            except Exception:
                pass
    return ImageFont.load_default()


def save_rgba_clean(rgba: np.ndarray, target_size: Tuple[int, int], out_path: Path) -> Image.Image:
    """Premultiplied-alpha Lanczos downsample & PNG export (zero dark edge fringes)."""
    if not np.isfinite(rgba).all():
        raise ValueError(f"Non-finite pixel in {out_path.name}")
    rgba = clamp01(rgba)
    if (rgba.shape[1], rgba.shape[0]) != target_size:
        pm = np.concatenate([rgba[..., :3] * rgba[..., 3:4], rgba[..., 3:4]], axis=-1)
        pm_img = Image.fromarray(np.round(pm * 255.0).astype(np.uint8), mode="RGBA")
        pm_lo = pm_img.resize(target_size, resample=Image.Resampling.LANCZOS)
        arr = np.asarray(pm_lo, dtype=np.float32) / 255.0
        a = arr[..., 3:4]
        rgb = np.where(a > 1e-4, arr[..., :3] / np.maximum(a, 1e-4), 0.0)
        rgba = clamp01(np.concatenate([rgb, a], axis=-1))
    img = Image.fromarray(np.round(rgba * 255.0).astype(np.uint8), mode="RGBA")
    img.save(out_path, format="PNG", optimize=True)
    return img


def alpha_composite(dst: np.ndarray, src: np.ndarray) -> np.ndarray:
    sa = src[..., 3:4]
    da = dst[..., 3:4]
    out_a = sa + da * (1.0 - sa)
    out_rgb = (src[..., :3] * sa + dst[..., :3] * da * (1.0 - sa)) / np.maximum(out_a, 1e-6)
    return np.concatenate([clamp01(out_rgb), clamp01(out_a)], axis=-1)


def normals_from_height(h: np.ndarray, strength: float = 6.0) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    gy, gx = np.gradient(h.astype(np.float32))
    nx = -gx * strength
    ny = -gy * strength
    nz = np.ones_like(h, dtype=np.float32)
    inv = 1.0 / np.sqrt(nx * nx + ny * ny + nz * nz + 1e-12)
    return nx * inv, ny * inv, nz * inv


def shade_metal_pbr(
    nx: np.ndarray, ny: np.ndarray, nz: np.ndarray,
    base_rgb: Tuple[float, float, float],
    spec_rgb: Tuple[float, float, float],
    shadow_rgb: Tuple[float, float, float],
    roughness: float = 0.20,
    metallic: float = 0.94,
) -> np.ndarray:
    l1 = np.array([-0.46, -0.68, 0.57], dtype=np.float32); l1 /= np.linalg.norm(l1)
    l2 = np.array([0.58, 0.52, 0.63], dtype=np.float32); l2 /= np.linalg.norm(l2)
    l3 = np.array([0.04, -0.88, 0.47], dtype=np.float32); l3 /= np.linalg.norm(l3)

    nd1 = clamp01(nx * l1[0] + ny * l1[1] + nz * l1[2])
    nd2 = clamp01(nx * l2[0] + ny * l2[1] + nz * l2[2])
    nd3 = clamp01(nx * l3[0] + ny * l3[1] + nz * l3[2])

    def slobe(light: np.ndarray, shininess: float) -> np.ndarray:
        hv = light + np.array([0.0, 0.0, 1.0], dtype=np.float32)
        hv /= np.linalg.norm(hv)
        return np.power(clamp01(nx * hv[0] + ny * hv[1] + nz * hv[2]), shininess)

    st = 16.0 / max(roughness * roughness, 0.015)
    sb = 3.5 / max(roughness, 0.08)
    sp = slobe(l1, st) * 0.90 + slobe(l1, sb) * 0.36 + slobe(l3, st * 0.85) * 0.65 + slobe(l2, sb) * 0.30

    rx = 2.0 * nz * nx
    ry = 2.0 * nz * ny
    env = clamp01(
        0.52
        + 0.34 * np.exp(-np.power((ry + 0.55) * 2.5, 2.0))
        + 0.24 * np.exp(-np.power((rx + ry * 0.7 + 0.32) * 3.1, 2.0))
        - 0.28 * np.exp(-np.power((ry - 0.52) * 2.2, 2.0))
    )
    fres = np.power(clamp01(1.0 - nz), 2.4) * 0.38

    base = np.array(base_rgb, dtype=np.float32)[None, None, :]
    spec = np.array(spec_rgb, dtype=np.float32)[None, None, :]
    shad = np.array(shadow_rgb, dtype=np.float32)[None, None, :]

    lit = clamp01(0.18 + nd1 * 0.68 + nd2 * 0.24 + nd3 * 0.22)[..., None]
    body = shad * (1.0 - lit) + base * lit
    metal = body * (1.0 - metallic * 0.45) + (base * (0.45 + 0.95 * env[..., None])) * (metallic * 0.45)
    return clamp01(metal + spec * (sp + fres)[..., None] * (0.55 + 0.45 * metallic))


def fbm_noise(h: int, w: int, scale: float, seed: int) -> np.ndarray:
    rng = np.random.default_rng(seed)
    acc = np.zeros((h, w), dtype=np.float32)
    amp, norm, sc = 0.55, 0.0, scale
    for i in range(4):
        gh = max(2, int(round(h / sc)) + 2)
        gw = max(2, int(round(w / sc)) + 2)
        g = rng.random((gh, gw), dtype=np.float32)
        up = Image.fromarray((g * 255.0).astype(np.uint8), mode="L").resize((w, h), Image.Resampling.BICUBIC)
        acc += amp * (np.asarray(up, dtype=np.float32) / 255.0)
        norm += amp
        amp *= 0.5
        sc = max(2.0, sc * 0.5)
    return acc / max(norm, 1e-6)


# ==============================================================================
# VECTOR DRAWING HELPERS FOR CRISP HOLOGRAPHIC WIREFRAMES
# ==============================================================================

def poly_circle(cx: float, cy: float, r: float, n: int = 96) -> List[Tuple[float, float]]:
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n + 1)]


def poly_ellipse_rot(cx: float, cy: float, rx: float, ry: float, deg: float, n: int = 96) -> List[Tuple[float, float]]:
    th = math.radians(deg)
    ct, st = math.cos(th), math.sin(th)
    pts = []
    for i in range(n + 1):
        a = 2.0 * math.pi * i / n
        ex, ey = rx * math.cos(a), ry * math.sin(a)
        pts.append((cx + ex * ct - ey * st, cy + ex * st + ey * ct))
    return pts


def poly_regular(cx: float, cy: float, r: float, sides: int, rot_deg: float = -90.0) -> List[Tuple[float, float]]:
    pts = []
    for i in range(sides + 1):
        a = math.radians(rot_deg + 360.0 * i / sides)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def draw_bezier(dr: ImageDraw.ImageDraw, p0, p1, p2, p3, width: int, fill=255, steps: int = 48) -> None:
    pts = []
    for i in range(steps + 1):
        t = i / steps
        mt = 1.0 - t
        x = mt**3 * p0[0] + 3 * mt**2 * t * p1[0] + 3 * mt * t**2 * p2[0] + t**3 * p3[0]
        y = mt**3 * p0[1] + 3 * mt**2 * t * p1[1] + 3 * mt * t**2 * p2[1] + t**3 * p3[1]
        pts.append((x, y))
    dr.line(pts, fill=fill, width=width, joint="curve")


def draw_node(dr: ImageDraw.ImageDraw, x: float, y: float, r: float, w: int) -> None:
    dr.ellipse([x - r, y - r, x + r, y + r], fill=0, outline=255, width=w)
    ri = r * 0.42
    dr.ellipse([x - ri, y - ri, x + ri, y + ri], fill=255)


# ==============================================================================
# PART 1: 36 SDF HOLOGRAPHIC CORE GLYPHS (3 PER DOMAIN x 12 DOMAINS)
# ==============================================================================

def _g_double_eagle(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Central heraldic shield
    sh = [(c - 0.12*s, c - 0.06*s), (c + 0.12*s, c - 0.06*s), (c + 0.10*s, c + 0.12*s), (c, c + 0.22*s), (c - 0.10*s, c + 0.12*s), (c - 0.12*s, c - 0.06*s)]
    df.polygon(sh[:-1], fill=180)
    dw.line(sh, fill=255, width=w, joint="curve")
    # Sweeping symmetrical spread eagle wings (3 tiered primary feathers each side)
    for side in (-1, 1):
        for k, (wy, wx, drop) in enumerate([( -0.14, 0.34, 0.02), (-0.03, 0.32, 0.09), (0.07, 0.26, 0.16)]):
            draw_bezier(dw, (c + side*0.11*s, c + (-0.04 + k*0.05)*s),
                        (c + side*0.22*s, c + (wy - 0.05)*s),
                        (c + side*wx*s, c + wy*s),
                        (c + side*(wx - 0.04)*s, c + drop*s), w)
        # Dual outward-facing crowned eagle necks & beaks
        draw_bezier(dw, (c + side*0.05*s, c - 0.06*s), (c + side*0.06*s, c - 0.19*s),
                    (c + side*0.14*s, c - 0.22*s), (c + side*0.18*s, c - 0.16*s), w)
        dw.ellipse([c + side*0.11*s - 0.035*s, c - 0.22*s, c + side*0.11*s + 0.035*s, c - 0.15*s], outline=255, width=w)
    # Imperial crown floating above both heads
    cr = [(c - 0.10*s, c - 0.25*s), (c - 0.12*s, c - 0.33*s), (c - 0.05*s, c - 0.29*s),
          (c, c - 0.36*s), (c + 0.05*s, c - 0.29*s), (c + 0.12*s, c - 0.33*s), (c + 0.10*s, c - 0.25*s), (c - 0.10*s, c - 0.25*s)]
    df.polygon(cr[:-1], fill=160)
    dw.line(cr, fill=255, width=w, joint="curve")
    # Tail fan below shield
    for tx in (-0.08, 0.0, 0.08):
        dw.line([(c + tx*0.5*s, c + 0.20*s), (c + tx*1.3*s, c + 0.33*s)], fill=255, width=w)


def _g_astrolabe(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    cy = c + 0.03 * s
    dw.line(poly_circle(c, cy, 0.30*s), fill=255, width=w)
    dw.line(poly_circle(c, cy, 0.25*s), fill=255, width=max(2, w - 2))
    # Off-center ecliptic rete ring & horizon arcs
    df.ellipse([c - 0.17*s, cy - 0.23*s, c + 0.17*s, cy + 0.11*s], fill=95)
    dw.line(poly_circle(c, cy - 0.06*s, 0.17*s), fill=255, width=w)
    dw.arc([c - 0.25*s, cy - 0.10*s, c + 0.25*s, cy + 0.36*s], 200, 340, fill=255, width=max(2, w - 2))
    dw.line([(c - 0.30*s, cy), (c + 0.30*s, cy)], fill=255, width=max(2, w - 2))
    dw.line([(c, cy - 0.30*s), (c, cy + 0.30*s)], fill=255, width=max(2, w - 2))
    # Diagonal alidade sighting rule
    dw.line([(c - 0.24*s, cy + 0.20*s), (c + 0.24*s, cy - 0.20*s)], fill=255, width=w + 1)
    draw_node(dw, c, cy, 0.04*s, w)
    # Top throne & suspension ring
    dw.polygon([(c - 0.07*s, cy - 0.30*s), (c, cy - 0.36*s), (c + 0.07*s, cy - 0.30*s)], outline=255, width=w)
    dw.line(poly_circle(c, cy - 0.39*s, 0.038*s, 48), fill=255, width=w)


def _g_wax_seal_scroll(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Unfurled parchment scroll body
    rect = [c - 0.21*s, c - 0.27*s, c + 0.21*s, c + 0.19*s]
    df.rounded_rectangle(rect, radius=int(0.03*s), fill=100)
    dw.rounded_rectangle(rect, radius=int(0.03*s), outline=255, width=w)
    # Top & bottom cylindrical scroll rollers
    for ry in (c - 0.27*s, c + 0.19*s):
        dw.rounded_rectangle([c - 0.27*s, ry - 0.036*s, c + 0.27*s, ry + 0.036*s], radius=int(0.03*s), fill=0, outline=255, width=w)
    # Inscribed charter lines
    for ly in (-0.16, -0.09, -0.02):
        dw.line([(c - 0.13*s, c + ly*s), (c + 0.13*s, c + ly*s)], fill=255, width=max(2, w - 2))
    # Hanging ribbon & scalloped sovereign signet seal at bottom right
    sx, sy = c + 0.08*s, c + 0.22*s
    dw.line([(sx - 0.03*s, sy + 0.06*s), (sx - 0.07*s, sy + 0.16*s)], fill=255, width=w)
    dw.line([(sx + 0.03*s, sy + 0.06*s), (sx + 0.07*s, sy + 0.16*s)], fill=255, width=w)
    df.ellipse([sx - 0.09*s, sy - 0.09*s, sx + 0.09*s, sy + 0.09*s], fill=200)
    dw.line(poly_circle(sx, sy, 0.09*s, 64), fill=255, width=w)
    dw.line(poly_regular(sx, sy, 0.055*s, 6, 0), fill=255, width=max(2, w - 2))


def _g_atom_orbital(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    for deg in (0.0, 60.0, 120.0):
        pts = poly_ellipse_rot(c, c, 0.33*s, 0.125*s, deg)
        dw.line(pts, fill=255, width=w, joint="curve")
    df.ellipse([c - 0.075*s, c - 0.075*s, c + 0.075*s, c + 0.075*s], fill=220)
    draw_node(dw, c, c, 0.075*s, w)
    for deg, ph in [(0.0, 0.3), (60.0, 2.4), (120.0, 4.5)]:
        th = math.radians(deg)
        ex, ey = 0.33*s*math.cos(ph), 0.125*s*math.sin(ph)
        ox = c + ex*math.cos(th) - ey*math.sin(th)
        oy = c + ex*math.sin(th) + ey*math.cos(th)
        draw_node(dw, ox, oy, 0.032*s, max(2, w - 1))


def _g_prism_refraction(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    tri = [(c, c - 0.25*s), (c + 0.24*s, c + 0.20*s), (c - 0.24*s, c + 0.20*s), (c, c - 0.25*s)]
    df.polygon(tri[:-1], fill=140)
    dw.line(tri, fill=255, width=w + 1, joint="curve")
    # Inner crystal bevel triangle
    tri_in = [(c, c - 0.14*s), (c + 0.14*s, c + 0.14*s), (c - 0.14*s, c + 0.14*s), (c, c - 0.14*s)]
    dw.line(tri_in, fill=255, width=max(2, w - 2), joint="curve")
    # Incoming coherent beam from left
    dw.line([(c - 0.37*s, c + 0.06*s), (c - 0.11*s, c - 0.04*s)], fill=255, width=w + 1)
    # Internal refraction bridge
    dw.line([(c - 0.11*s, c - 0.04*s), (c + 0.11*s, c - 0.03*s)], fill=255, width=w)
    # 4 dispersed spectral fan rays exiting right
    for dy in (-0.16, -0.06, 0.04, 0.14):
        dw.line([(c + 0.11*s, c - 0.03*s), (c + 0.37*s, c + dy*s)], fill=255, width=max(2, w - 1))


def _g_ringed_planet(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    df.ellipse([c - 0.17*s, c - 0.17*s, c + 0.17*s, c + 0.17*s], fill=150)
    dw.line(poly_circle(c, c, 0.17*s), fill=255, width=w)
    # Latitude bands on planet
    dw.arc([c - 0.16*s, c - 0.08*s, c + 0.16*s, c + 0.05*s], 15, 165, fill=255, width=max(2, w - 2))
    # Tilted concentric Saturn rings
    for rx, ry, ww in [(0.36, 0.11, w), (0.30, 0.088, max(2, w - 2))]:
        dw.line(poly_ellipse_rot(c, c, rx*s, ry*s, -24.0), fill=255, width=ww)
    # 2 tiny moons
    draw_node(dw, c - 0.26*s, c - 0.22*s, 0.028*s, max(2, w - 1))
    draw_node(dw, c + 0.28*s, c + 0.19*s, 0.022*s, max(2, w - 1))


def _g_compass_rose(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    dw.line(poly_circle(c, c, 0.28*s), fill=255, width=max(2, w - 2))
    for k in range(8):
        a = math.radians(-90 + k * 45)
        r_tip = (0.36 if k % 2 == 0 else 0.23) * s
        r_mid = 0.075 * s
        p_tip = (c + r_tip*math.cos(a), c + r_tip*math.sin(a))
        p_l = (c + r_mid*math.cos(a - 0.38), c + r_mid*math.sin(a - 0.38))
        p_r = (c + r_mid*math.cos(a + 0.38), c + r_mid*math.sin(a + 0.38))
        if k % 2 == 0:
            df.polygon([(c, c), p_l, p_tip], fill=200)
        dw.line([p_l, p_tip, p_r], fill=255, width=w, joint="curve")
        dw.line([(c, c), p_tip], fill=255, width=max(2, w - 2))
    draw_node(dw, c, c, 0.045*s, w)


def _g_globe_grid(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    r = 0.29 * s
    df.ellipse([c - r, c - r, c + r, c + r], fill=100)
    dw.line(poly_circle(c, c, r), fill=255, width=w + 1)
    # Meridians & parallels
    for rx in (0.10, 0.20):
        dw.line(poly_ellipse_rot(c, c, rx*s, r, 0.0), fill=255, width=max(2, w - 2))
    dw.line([(c, c - r), (c, c + r)], fill=255, width=max(2, w - 2))
    dw.line([(c - r, c), (c + r, c)], fill=255, width=w)
    for dy, chord in [(-0.14, 0.25), (0.14, 0.25)]:
        dw.line([(c - chord*s, c + dy*s), (c + chord*s, c + dy*s)], fill=255, width=max(2, w - 2))
    # Tilted orbital meridian ring around globe
    dw.line(poly_ellipse_rot(c, c, 0.35*s, 0.12*s, -22.0), fill=255, width=w)


def _g_volcano(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Broad unmistakable volcanic mountain peak w/ sunken caldera rim
    cone = [
        (c - 0.35*s, c + 0.28*s),
        (c - 0.19*s, c + 0.08*s),
        (c - 0.10*s, c - 0.04*s),
        (c - 0.03*s, c - 0.01*s),
        (c + 0.03*s, c - 0.01*s),
        (c + 0.10*s, c - 0.04*s),
        (c + 0.20*s, c + 0.09*s),
        (c + 0.35*s, c + 0.28*s),
        (c - 0.35*s, c + 0.28*s),
    ]
    df.polygon(cone[:-1], fill=145)
    dw.line(cone, fill=255, width=w + 1, joint="curve")
    # Lava fissures flowing down mountain flanks
    dw.line([(c - 0.03*s, c - 0.01*s), (c - 0.08*s, c + 0.14*s), (c - 0.04*s, c + 0.28*s)], fill=255, width=max(2, w - 1))
    dw.line([(c + 0.03*s, c - 0.01*s), (c + 0.09*s, c + 0.16*s)], fill=255, width=max(2, w - 2))
    # Ballistic eruption arcs shooting outward + billowing pyroclastic cloud dome above crater!
    draw_bezier(dw, (c - 0.02*s, c - 0.03*s), (c - 0.06*s, c - 0.22*s), (c - 0.20*s, c - 0.25*s), (c - 0.26*s, c - 0.16*s), w)
    draw_bezier(dw, (c + 0.02*s, c - 0.03*s), (c + 0.06*s, c - 0.23*s), (c + 0.20*s, c - 0.26*s), (c + 0.26*s, c - 0.17*s), w)
    dw.line([(c, c - 0.03*s), (c, c - 0.24*s)], fill=255, width=w)
    # Billowing volcanic cloud puffs at top
    dw.arc([c - 0.13*s, c - 0.36*s, c + 0.13*s, c - 0.18*s], 170, 10, fill=255, width=w + 1)
    dw.arc([c - 0.24*s, c - 0.31*s, c - 0.04*s, c - 0.15*s], 130, 320, fill=255, width=w)
    dw.arc([c + 0.04*s, c - 0.31*s, c + 0.24*s, c - 0.15*s], 220, 50, fill=255, width=w)


def _g_ionic_column(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    dw.rounded_rectangle([c - 0.26*s, c - 0.29*s, c + 0.26*s, c - 0.23*s], radius=int(0.015*s), outline=255, width=w)
    for side in (-1, 1):
        vx, vy = c + side*0.20*s, c - 0.16*s
        df.ellipse([vx - 0.075*s, vy - 0.075*s, vx + 0.075*s, vy + 0.075*s], fill=140)
        dw.line(poly_circle(vx, vy, 0.075*s, 64), fill=255, width=w)
        dw.line(poly_circle(vx, vy, 0.035*s, 48), fill=255, width=max(2, w - 2))
    shaft = [(c - 0.14*s, c - 0.10*s), (c + 0.14*s, c - 0.10*s), (c + 0.16*s, c + 0.22*s), (c - 0.16*s, c + 0.22*s), (c - 0.14*s, c - 0.10*s)]
    df.polygon(shaft[:-1], fill=115)
    dw.line(shaft, fill=255, width=w)
    for fx in (-0.075, 0.0, 0.075):
        dw.line([(c + fx*s, c - 0.07*s), (c + fx*1.08*s, c + 0.19*s)], fill=255, width=max(2, w - 2))
    dw.rounded_rectangle([c - 0.23*s, c + 0.22*s, c + 0.23*s, c + 0.29*s], radius=int(0.015*s), outline=255, width=w)


def _g_gothic_rose(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    r = 0.31 * s
    df.ellipse([c - r, c - r, c + r, c + r], fill=95)
    dw.line(poly_circle(c, c, r), fill=255, width=w + 1)
    dw.line(poly_circle(c, c, 0.25*s), fill=255, width=max(2, w - 2))
    # 12 radial cathedral rose petals
    for k in range(12):
        a = math.radians(k * 30.0)
        dw.line([(c + 0.08*s*math.cos(a), c + 0.08*s*math.sin(a)),
                 (c + 0.25*s*math.cos(a), c + 0.25*s*math.sin(a))], fill=255, width=max(2, w - 2))
        px, py = c + 0.20*s*math.cos(a + math.radians(15)), c + 0.20*s*math.sin(a + math.radians(15))
        dw.line(poly_circle(px, py, 0.036*s, 36), fill=255, width=max(2, w - 2))
    dw.line(poly_circle(c, c, 0.08*s, 48), fill=255, width=w)
    draw_node(dw, c, c, 0.032*s, max(2, w - 1))


def _g_painters_palette(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Kidney-curved artist palette + crossed brushes
    pts = []
    for i in range(97):
        a = 2 * math.pi * i / 96.0
        rad = 0.28 * s * (1.0 - 0.22 * math.exp(-((a - 0.6) ** 2) / 0.18))
        pts.append((c - 0.02*s + rad * math.cos(a), c + 0.02*s + rad * 0.86 * math.sin(a)))
    df.polygon(pts[:-1], fill=125)
    dw.line(pts, fill=255, width=w + 1, joint="curve")
    # Thumb hole & 4 paint pigment wells
    dw.line(poly_circle(c + 0.12*s, c + 0.09*s, 0.045*s, 40), fill=255, width=w)
    for deg in (145, 195, 245, 295):
        a = math.radians(deg)
        draw_node(dw, c - 0.02*s + 0.17*s*math.cos(a), c + 0.02*s + 0.15*s*math.sin(a), 0.028*s, max(2, w - 1))
    # Diagonal master paintbrush crossing palette
    dw.line([(c - 0.24*s, c + 0.28*s), (c + 0.24*s, c - 0.24*s)], fill=255, width=w + 1)
    dw.polygon([(c + 0.22*s, c - 0.22*s), (c + 0.30*s, c - 0.31*s), (c + 0.27*s, c - 0.20*s)], fill=255)


def _g_apollo_lyre(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    for side in (-1, 1):
        draw_bezier(dw, (c + side*0.11*s, c + 0.18*s), (c + side*0.32*s, c + 0.06*s),
                    (c + side*0.27*s, c - 0.21*s), (c + side*0.14*s, c - 0.23*s), w + 1)
        draw_node(dw, c + side*0.14*s, c - 0.23*s, 0.028*s, max(2, w - 1))
    dw.line([(c - 0.19*s, c - 0.19*s), (c + 0.19*s, c - 0.19*s)], fill=255, width=w)
    sb = [(c - 0.18*s, c + 0.14*s), (c + 0.18*s, c + 0.14*s), (c + 0.13*s, c + 0.27*s), (c - 0.13*s, c + 0.27*s), (c - 0.18*s, c + 0.14*s)]
    df.polygon(sb[:-1], fill=150)
    dw.line(sb, fill=255, width=w)
    for sx in (-0.075, -0.025, 0.025, 0.075):
        dw.line([(c + sx*s, c - 0.19*s), (c + sx*s, c + 0.14*s)], fill=255, width=max(2, w - 2))


def _g_cinema_reel(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    r = 0.29 * s
    df.ellipse([c - r, c - r, c + r, c + r], fill=110)
    dw.line(poly_circle(c, c, r), fill=255, width=w + 1)
    dw.line(poly_circle(c, c, 0.24*s), fill=255, width=max(2, w - 2))
    for k in range(5):
        a = math.radians(-90 + k * 72)
        dw.line(poly_circle(c + 0.14*s*math.cos(a), c + 0.14*s*math.sin(a), 0.052*s, 48), fill=255, width=w)
    draw_node(dw, c, c, 0.042*s, w)
    # Trailing film strip tail with sprocket ticks
    draw_bezier(dw, (c + 0.20*s, c + 0.21*s), (c + 0.28*s, c + 0.28*s), (c + 0.34*s, c + 0.22*s), (c + 0.37*s, c + 0.30*s), w)


def _g_vinyl_waveform(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    for r in (0.29, 0.23, 0.17, 0.11):
        dw.line(poly_circle(c, c, r*s), fill=255, width=w if r > 0.25 else max(2, w - 2))
    draw_node(dw, c, c, 0.045*s, w)
    # Superimposed harmonic soundwave bars across horizontal equator
    bars = [0.06, 0.13, 0.22, 0.11, 0.28, 0.16, 0.32, 0.16, 0.28, 0.11, 0.22, 0.13, 0.06]
    for i, bh in enumerate(bars):
        bx = c + (i - 6) * 0.048 * s
        dw.line([(bx, c - bh*s), (bx, c + bh*s)], fill=255, width=max(2, w - 1))


def _g_olympic_torch(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Tapered fluted torch handle
    handle = [(c - 0.11*s, c + 0.02*s), (c + 0.11*s, c + 0.02*s), (c + 0.04*s, c + 0.34*s), (c - 0.04*s, c + 0.34*s), (c - 0.11*s, c + 0.02*s)]
    df.polygon(handle[:-1], fill=140)
    dw.line(handle, fill=255, width=w)
    dw.rounded_rectangle([c - 0.16*s, c - 0.04*s, c + 0.16*s, c + 0.02*s], radius=int(0.02*s), outline=255, width=w)
    # Sculpted holographic flame tongues rising above bowl
    flame = [(c - 0.11*s, c - 0.04*s), (c - 0.15*s, c - 0.18*s), (c - 0.04*s, c - 0.34*s),
             (c + 0.05*s, c - 0.22*s), (c + 0.13*s, c - 0.27*s), (c + 0.12*s, c - 0.04*s)]
    df.polygon(flame, fill=190)
    dw.line(flame + [flame[0]], fill=255, width=w + 1, joint="curve")
    draw_bezier(dw, (c - 0.02*s, c - 0.05*s), (c - 0.06*s, c - 0.16*s), (c + 0.04*s, c - 0.20*s), (c - 0.02*s, c - 0.28*s), max(2, w - 1))


def _g_victory_laurel(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Left & right curved laurel branches + 5 leaf pairs each
    for side in (-1, 1):
        dw.arc([c - 0.28*s, c - 0.26*s, c + 0.28*s, c + 0.30*s],
               start=100 if side < 0 else -70, end=250 if side < 0 else 80, fill=255, width=w)
        for k in range(5):
            ang = math.radians((235 - k * 30) if side < 0 else (-55 + k * 30))
            lx, ly = c + 0.28*s*math.cos(ang), c + 0.02*s + 0.28*s*math.sin(ang)
            tang = ang + (-0.55 if side < 0 else 0.55)
            tx, ty = lx + 0.085*s*math.cos(tang), ly + 0.085*s*math.sin(tang)
            dw.line([(lx, ly), (tx, ty)], fill=255, width=w)
    # Central 5-point champion star
    st = []
    for k in range(11):
        a = math.radians(-90 + k * 36)
        r = (0.14 if k % 2 == 0 else 0.06) * s
        st.append((c + r*math.cos(a), c - 0.01*s + r*math.sin(a)))
    df.polygon(st[:-1], fill=185)
    dw.line(st, fill=255, width=w, joint="curve")


def _g_chronograph_dial(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    cy = c + 0.04 * s
    df.ellipse([c - 0.27*s, cy - 0.27*s, c + 0.27*s, cy + 0.27*s], fill=105)
    dw.line(poly_circle(c, cy, 0.27*s), fill=255, width=w + 1)
    for k in range(12):
        a = math.radians(k * 30)
        r0 = (0.21 if k % 3 == 0 else 0.23) * s
        dw.line([(c + r0*math.cos(a), cy + r0*math.sin(a)), (c + 0.26*s*math.cos(a), cy + 0.26*s*math.sin(a))], fill=255, width=max(2, w - 1))
    # Tachymeter sub-dials & hands
    dw.line(poly_circle(c - 0.09*s, cy, 0.055*s, 36), fill=255, width=max(2, w - 2))
    dw.line([(c, cy), (c + 0.15*s, cy - 0.14*s)], fill=255, width=w)
    dw.line([(c, cy), (c - 0.04*s, cy - 0.20*s)], fill=255, width=max(2, w - 1))
    draw_node(dw, c, cy, 0.03*s, w)
    # Crown & twin chronograph pushers
    dw.rectangle([c - 0.04*s, cy - 0.34*s, c + 0.04*s, cy - 0.27*s], outline=255, width=w)
    for side in (-1, 1):
        dw.line([(c + side*0.18*s, cy - 0.21*s), (c + side*0.24*s, cy - 0.28*s)], fill=255, width=w + 1)


def _g_cipher_key(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Ornate hexagonal bow at top
    bow = poly_regular(c, c - 0.17*s, 0.15*s, 6, 30)
    df.polygon(bow[:-1], fill=140)
    dw.line(bow, fill=255, width=w + 1, joint="curve")
    dw.line(poly_regular(c, c - 0.17*s, 0.08*s, 6, 30), fill=255, width=max(2, w - 2))
    draw_node(dw, c, c - 0.17*s, 0.03*s, max(2, w - 1))
    # Key shaft & digital bit teeth
    dw.line([(c, c - 0.02*s), (c, c + 0.33*s)], fill=255, width=w + 2)
    for ty, tl in [(0.14, 0.13), (0.21, 0.08), (0.28, 0.15)]:
        dw.line([(c, c + ty*s), (c + tl*s, c + ty*s)], fill=255, width=w + 1)
        draw_node(dw, c + tl*s, c + ty*s, 0.022*s, max(2, w - 2))


def _g_quantum_chip(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    hx = poly_regular(c, c, 0.17*s, 6, 30)
    df.polygon(hx[:-1], fill=150)
    dw.line(hx, fill=255, width=w + 1, joint="curve")
    dw.line(poly_regular(c, c, 0.09*s, 4, 45), fill=255, width=w)
    for k in range(6):
        a = math.radians(k * 60)
        x0, y0 = c + 0.17*s*math.cos(a), c + 0.17*s*math.sin(a)
        x1, y1 = c + 0.30*s*math.cos(a), c + 0.30*s*math.sin(a)
        dw.line([(x0, y0), (x1, y1)], fill=255, width=w)
        draw_node(dw, x1, y1, 0.032*s, max(2, w - 1))
    for k in range(6):
        a = math.radians(30 + k * 60)
        x0, y0 = c + 0.15*s*math.cos(a), c + 0.15*s*math.sin(a)
        x1, y1 = c + 0.24*s*math.cos(a), c + 0.24*s*math.sin(a)
        dw.line([(x0, y0), (x1, y1)], fill=255, width=max(2, w - 2))


def _g_neural_network(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    layers = [
        [(c - 0.26*s, c - 0.18*s), (c - 0.26*s, c), (c - 0.26*s, c + 0.18*s)],
        [(c, c - 0.25*s), (c, c - 0.08*s), (c, c + 0.08*s), (c, c + 0.25*s)],
        [(c + 0.26*s, c - 0.12*s), (c + 0.26*s, c + 0.12*s)],
    ]
    for li in range(2):
        for p0 in layers[li]:
            for p1 in layers[li + 1]:
                dw.line([p0, p1], fill=255, width=max(2, w - 2))
    for lyr in layers:
        for px, py in lyr:
            df.ellipse([px - 0.038*s, py - 0.038*s, px + 0.038*s, py + 0.038*s], fill=210)
            draw_node(dw, px, py, 0.038*s, w)


def _g_dna_helix(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    pts1, pts2 = [], []
    for i in range(65):
        t = i / 64.0
        yy = c - 0.32*s + 0.64*s * t
        ph = t * 2.1 * math.pi
        x1 = c + 0.18*s * math.sin(ph)
        x2 = c - 0.18*s * math.sin(ph)
        pts1.append((x1, yy))
        pts2.append((x2, yy))
        if i % 8 == 4:
            dw.line([(x1, yy), (x2, yy)], fill=255, width=max(2, w - 2))
            draw_node(dw, x1, yy, 0.022*s, max(2, w - 2))
            draw_node(dw, x2, yy, 0.022*s, max(2, w - 2))
    dw.line(pts1, fill=255, width=w + 1, joint="curve")
    dw.line(pts2, fill=255, width=w + 1, joint="curve")


def _g_botanical_frond(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    top, bot = [], []
    for i in range(41):
        t = i / 40.0
        ax, ay = -0.22 + 0.48*t, 0.22 - 0.48*t
        wd = 0.20 * math.sin(math.pi * (t ** 0.75))
        top.append((c + (ax - wd*0.707)*s, c + (ay - wd*0.707)*s))
        bot.append((c + (ax + wd*0.707)*s, c + (ay + wd*0.707)*s))
    poly = top + list(reversed(bot)) + [top[0]]
    df.polygon(poly[:-1], fill=135)
    dw.line(poly, fill=255, width=w + 1, joint="curve")
    dw.line([(c - 0.27*s, c + 0.27*s), (c + 0.25*s, c - 0.25*s)], fill=255, width=w)
    for f, ln in [(0.28, 0.11), (0.50, 0.13), (0.72, 0.09)]:
        mx, my = c + (-0.22 + 0.48*f)*s, c + (0.22 - 0.48*f)*s
        dw.line([(mx, my), (mx + ln*0.18*s, my - ln*0.98*s)], fill=255, width=max(2, w - 2))
        dw.line([(mx, my), (mx + ln*0.98*s, my - ln*0.18*s)], fill=255, width=max(2, w - 2))


def _g_nautilus_shell(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Centered large logarithmic chambered Nautilus shell filling ~64% of reticle!
    raw_pts = []
    for i in range(145):
        a = 3.5 * math.pi * i / 144.0
        r = 0.016 * s * math.exp(0.285 * a)
        raw_pts.append((r * math.cos(a), r * math.sin(a)))
    xs = [p[0] for p in raw_pts]
    ys = [p[1] for p in raw_pts]
    ox = c - 0.5 * (min(xs) + max(xs))
    oy = c - 0.5 * (min(ys) + max(ys))
    pts = [(ox + px, oy + py) for px, py in raw_pts]
    df.polygon([(ox, oy)] + pts[-56:], fill=135)
    dw.line(pts, fill=255, width=w + 1, joint="curve")
    # Close aperture lip back to umbilicus
    dw.line([pts[-1], (ox, oy)], fill=255, width=w)
    draw_node(dw, ox, oy, 0.026*s, max(2, w - 1))
    # Internal curved chamber septa
    for i in range(44, 142, 9):
        a = 3.5 * math.pi * i / 144.0
        r_out = 0.016 * s * math.exp(0.285 * a)
        r_in = 0.016 * s * math.exp(0.285 * max(0.0, a - 2.0 * math.pi))
        p_in = (ox + r_in*math.cos(a), oy + r_in*math.sin(a))
        p_mid = (ox + 0.5*(r_in + r_out)*math.cos(a - 0.16), oy + 0.5*(r_in + r_out)*math.sin(a - 0.16))
        p_out = (ox + r_out*math.cos(a), oy + r_out*math.sin(a))
        dw.line([p_in, p_mid, p_out], fill=255, width=max(2, w - 2), joint="curve")


def _g_scales_treaty(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    dw.line([(c, c - 0.28*s), (c, c + 0.26*s)], fill=255, width=w + 1)
    draw_node(dw, c, c - 0.29*s, 0.035*s, w)
    dw.line([(c - 0.16*s, c + 0.26*s), (c + 0.16*s, c + 0.26*s)], fill=255, width=w + 1)
    dw.line([(c - 0.26*s, c - 0.15*s), (c, c - 0.20*s), (c + 0.26*s, c - 0.15*s)], fill=255, width=w, joint="curve")
    for side in (-1, 1):
        px = c + side * 0.25 * s
        dw.line([(px, c - 0.15*s), (px - 0.09*s, c + 0.06*s)], fill=255, width=max(2, w - 2))
        dw.line([(px, c - 0.15*s), (px + 0.09*s, c + 0.06*s)], fill=255, width=max(2, w - 2))
        df.pieslice([px - 0.10*s, c - 0.01*s, px + 0.10*s, c + 0.13*s], 0, 180, fill=165)
        dw.arc([px - 0.10*s, c - 0.01*s, px + 0.10*s, c + 0.13*s], 0, 180, fill=255, width=w)
        dw.line([(px - 0.10*s, c + 0.06*s), (px + 0.10*s, c + 0.06*s)], fill=255, width=w)


def _g_gavel_charter(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Rotated ceremonial gavel head (-45 deg) + handle + sounding block
    th = math.radians(-40)
    ct, st = math.cos(th), math.sin(th)
    hx, hy = c - 0.06*s, c - 0.10*s
    pts = []
    for lx, ly in [(-0.14, -0.07), (0.14, -0.07), (0.14, 0.07), (-0.14, 0.07), (-0.14, -0.07)]:
        pts.append((hx + (lx*ct - ly*st)*s, hy + (lx*st + ly*ct)*s))
    df.polygon(pts[:-1], fill=160)
    dw.line(pts, fill=255, width=w + 1, joint="curve")
    # Handle extending to lower-right
    dw.line([(hx, hy), (c + 0.24*s, c + 0.16*s)], fill=255, width=w + 1)
    # Sounding block at lower-left
    dw.rounded_rectangle([c - 0.29*s, c + 0.20*s, c + 0.03*s, c + 0.27*s], radius=int(0.02*s), outline=255, width=w)


def _g_diplomatic_olive(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Meridian mini-globe encircled by twin crossed olive branches
    dw.line(poly_circle(c, c - 0.03*s, 0.15*s), fill=255, width=w)
    dw.line(poly_ellipse_rot(c, c - 0.03*s, 0.07*s, 0.15*s, 0.0), fill=255, width=max(2, w - 2))
    dw.line([(c - 0.15*s, c - 0.03*s), (c + 0.15*s, c - 0.03*s)], fill=255, width=max(2, w - 2))
    for side in (-1, 1):
        draw_bezier(dw, (c - side*0.08*s, c + 0.28*s), (c + side*0.28*s, c + 0.18*s),
                    (c + side*0.34*s, c - 0.14*s), (c + side*0.14*s, c - 0.27*s), w)
        for k in range(4):
            a = math.radians((215 - k*28) if side < 0 else (-35 + k*28))
            lx, ly = c + 0.26*s*math.cos(a), c - 0.01*s + 0.26*s*math.sin(a)
            dw.ellipse([lx - 0.03*s, ly - 0.018*s, lx + 0.03*s, ly + 0.018*s], outline=255, width=max(2, w - 2))


def _g_horology_gears(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    def gear(cx: float, cy: float, ro: float, ri: float, teeth: int, ph: float) -> None:
        pts = []
        st = 2 * math.pi / teeth
        for i in range(teeth):
            a = ph + i * st
            pts.extend([
                (cx + ri*math.cos(a), cy + ri*math.sin(a)),
                (cx + ro*math.cos(a + st*0.18), cy + ro*math.sin(a + st*0.18)),
                (cx + ro*math.cos(a + st*0.42), cy + ro*math.sin(a + st*0.42)),
                (cx + ri*math.cos(a + st*0.60), cy + ri*math.sin(a + st*0.60)),
            ])
        pts.append(pts[0])
        df.polygon(pts[:-1], fill=130)
        dw.line(pts, fill=255, width=w, joint="curve")
        draw_node(dw, cx, cy, ri * 0.38, max(2, w - 1))

    c = s * 0.5
    gear(c - 0.09*s, c + 0.08*s, 0.22*s, 0.17*s, 10, 0.1)
    gear(c + 0.16*s, c - 0.14*s, 0.14*s, 0.105*s, 7, 0.4)


def _g_artisan_amphora(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    body = [
        (c - 0.09*s, c - 0.27*s), (c + 0.09*s, c - 0.27*s),
        (c + 0.06*s, c - 0.16*s), (c + 0.19*s, c - 0.04*s),
        (c + 0.14*s, c + 0.16*s), (c + 0.05*s, c + 0.26*s),
        (c + 0.11*s, c + 0.31*s), (c - 0.11*s, c + 0.31*s),
        (c - 0.05*s, c + 0.26*s), (c - 0.14*s, c + 0.16*s),
        (c - 0.19*s, c - 0.04*s), (c - 0.06*s, c - 0.16*s),
        (c - 0.09*s, c - 0.27*s),
    ]
    df.polygon(body[:-1], fill=140)
    dw.line(body, fill=255, width=w + 1, joint="curve")
    # Twin amphora handles + Greek key waist band
    for side in (-1, 1):
        draw_bezier(dw, (c + side*0.07*s, c - 0.21*s), (c + side*0.26*s, c - 0.22*s),
                    (c + side*0.27*s, c - 0.06*s), (c + side*0.18*s, c - 0.03*s), w)
    dw.line([(c - 0.18*s, c + 0.02*s), (c + 0.18*s, c + 0.02*s)], fill=255, width=max(2, w - 2))
    dw.line([(c - 0.16*s, c + 0.08*s), (c + 0.16*s, c + 0.08*s)], fill=255, width=max(2, w - 2))


def _g_alembic_flask(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    cx = c - 0.05 * s
    df.ellipse([cx - 0.19*s, c - 0.04*s, cx + 0.19*s, c + 0.30*s], fill=135)
    dw.line(poly_circle(cx, c + 0.13*s, 0.18*s), fill=255, width=w + 1)
    # Neck & curved swan distillation tube
    dw.rectangle([cx - 0.05*s, c - 0.20*s, cx + 0.05*s, c - 0.04*s], fill=0, outline=255, width=w)
    draw_bezier(dw, (cx, c - 0.20*s), (cx, c - 0.33*s), (c + 0.24*s, c - 0.28*s), (c + 0.26*s, c + 0.08*s), w + 1)
    draw_node(dw, c + 0.26*s, c + 0.16*s, 0.03*s, max(2, w - 1))
    # Liquid meniscus inside flask
    dw.line([(cx - 0.16*s, c + 0.15*s), (cx + 0.16*s, c + 0.15*s)], fill=255, width=max(2, w - 1))


def _g_grimoire_quill(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    lp = [(c, c + 0.04*s), (c - 0.12*s, c), (c - 0.28*s, c + 0.03*s), (c - 0.29*s, c + 0.24*s), (c - 0.12*s, c + 0.21*s), (c, c + 0.26*s)]
    rp = [(2*c - x, y) for x, y in lp]
    df.polygon(lp, fill=140); df.polygon(rp, fill=140)
    dw.line(lp + [lp[0]], fill=255, width=w, joint="curve")
    dw.line(rp + [rp[0]], fill=255, width=w, joint="curve")
    # Sweeping holographic feather quill
    dw.line([(c, c + 0.04*s), (c + 0.23*s, c - 0.28*s)], fill=255, width=w + 1)
    q = [(c + 0.05*s, c - 0.03*s), (c + 0.07*s, c - 0.20*s), (c + 0.23*s, c - 0.28*s), (c + 0.22*s, c - 0.10*s), (c + 0.05*s, c - 0.03*s)]
    df.polygon(q[:-1], fill=175)
    dw.line(q, fill=255, width=w, joint="curve")


def _g_trident_crown(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    dw.line([(c, c - 0.32*s), (c, c + 0.34*s)], fill=255, width=w + 1)
    # Central spearhead
    sp = [(c, c - 0.36*s), (c + 0.05*s, c - 0.24*s), (c, c - 0.27*s), (c - 0.05*s, c - 0.24*s), (c, c - 0.36*s)]
    df.polygon(sp[:-1], fill=200); dw.line(sp, fill=255, width=w)
    # Twin curved outer tines
    for side in (-1, 1):
        draw_bezier(dw, (c, c - 0.04*s), (c + side*0.22*s, c - 0.04*s),
                    (c + side*0.21*s, c - 0.18*s), (c + side*0.18*s, c - 0.29*s), w + 1)
        tp = [(c + side*0.18*s, c - 0.33*s), (c + side*0.23*s, c - 0.23*s), (c + side*0.14*s, c - 0.24*s), (c + side*0.18*s, c - 0.33*s)]
        dw.line(tp, fill=255, width=w)
    draw_node(dw, c, c - 0.04*s, 0.038*s, w)


def _g_ouroboros_sun(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # 12-ray celestial sunburst + inner crescent eclipse
    for k in range(12):
        a = math.radians(k * 30)
        r_tip = (0.33 if k % 2 == 0 else 0.25) * s
        dw.line([(c + 0.16*s*math.cos(a), c + 0.16*s*math.sin(a)),
                 (c + r_tip*math.cos(a), c + r_tip*math.sin(a))], fill=255, width=w)
    df.ellipse([c - 0.16*s, c - 0.16*s, c + 0.16*s, c + 0.16*s], fill=150)
    dw.line(poly_circle(c, c, 0.16*s, 64), fill=255, width=w + 1)
    dw.arc([c - 0.08*s, c - 0.14*s, c + 0.20*s, c + 0.14*s], 110, 250, fill=255, width=w)


def _g_fibonacci_spiral(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    # Golden rectangle frame (aspect 1.618: 0.56w x 0.346h)
    gw, gh = 0.56 * s, 0.346 * s
    x0, y0 = c - gw * 0.5, c - gh * 0.5
    df.rectangle([x0, y0, x0 + gw, y0 + gh], fill=105)
    dw.rectangle([x0, y0, x0 + gw, y0 + gh], outline=255, width=w + 1)
    # Subdivision lines: square 0.346 on left -> 0.214 on right -> top square 0.214 -> bottom 0.132
    s1 = gh
    dw.line([(x0 + s1, y0), (x0 + s1, y0 + gh)], fill=255, width=max(2, w - 1))
    s2 = gw - s1
    dw.line([(x0 + s1, y0 + s2), (x0 + gw, y0 + s2)], fill=255, width=max(2, w - 1))
    s3 = gh - s2
    dw.line([(x0 + gw - s3, y0 + s2), (x0 + gw - s3, y0 + gh)], fill=255, width=max(2, w - 2))
    # Quarter-circle golden spiral arcs through squares!
    dw.arc([x0, y0, x0 + 2*s1, y0 + 2*s1], 180, 270, fill=255, width=w + 1)
    dw.arc([x0 + s1 - s2, y0, x0 + s1 + s2, y0 + 2*s2], 270, 360, fill=255, width=w + 1)
    dw.arc([x0 + gw - 2*s3, y0 + gh - 2*s3, x0 + gw, y0 + gh], 0, 90, fill=255, width=w + 1)
    s4 = s2 - s3
    dw.arc([x0 + s1, y0 + gh - 2*s4, x0 + s1 + 2*s4, y0 + gh], 90, 180, fill=255, width=w)


def _g_chess_knight(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    knight = [
        (c - 0.16*s, c + 0.24*s),
        (c - 0.13*s, c + 0.06*s),
        (c - 0.19*s, c - 0.05*s),
        (c - 0.08*s, c - 0.16*s),
        (c - 0.18*s, c - 0.14*s),  # muzzle lower
        (c - 0.22*s, c - 0.20*s),  # nose tip
        (c - 0.09*s, c - 0.28*s),  # forehead
        (c - 0.04*s, c - 0.35*s),  # ear tip
        (c + 0.03*s, c - 0.28*s),
        (c + 0.16*s, c - 0.16*s),  # arched mane
        (c + 0.18*s, c + 0.04*s),
        (c + 0.14*s, c + 0.24*s),
        (c - 0.16*s, c + 0.24*s),
    ]
    df.polygon(knight[:-1], fill=150)
    dw.line(knight, fill=255, width=w + 1, joint="curve")
    draw_node(dw, c - 0.08*s, c - 0.23*s, 0.022*s, max(2, w - 2))
    dw.rounded_rectangle([c - 0.21*s, c + 0.24*s, c + 0.19*s, c + 0.31*s], radius=int(0.02*s), outline=255, width=w)


def _g_mobius_infinity(dw: ImageDraw.ImageDraw, df: ImageDraw.ImageDraw, s: int, w: int) -> None:
    c = s * 0.5
    pts_outer, pts_inner = [], []
    a_rad = 0.33 * s
    for i in range(181):
        t = 2 * math.pi * i / 180.0
        dn = 1.0 + math.sin(t) ** 2
        lx = a_rad * math.cos(t) / dn
        ly = a_rad * math.sin(t) * math.cos(t) / dn * 1.30
        pts_outer.append((c + lx, c + ly))
        pts_inner.append((c + lx * 0.68, c + ly * 0.68))
    dw.line(pts_outer, fill=255, width=w + 1, joint="curve")
    dw.line(pts_inner, fill=255, width=max(2, w - 2), joint="curve")
    # Geometric polyhedral diamond frame accents above & below
    for sy in (-0.23, 0.23):
        dw.line(poly_regular(c, c + sy*s, 0.048*s, 4, 0), fill=255, width=w)


GLYPH_MANIFEST_SPECS = [
    # Domain 0: World History
    ("double_eagle",     0, "HISTORY",   "Imperial Double Eagle",   (1.00, 0.80, 0.36), _g_double_eagle),
    ("astrolabe",        0, "HISTORY",   "Planispheric Astrolabe",  (1.00, 0.80, 0.36), _g_astrolabe),
    ("wax_seal_scroll",  0, "HISTORY",   "Sovereign Charter Scroll",(1.00, 0.80, 0.36), _g_wax_seal_scroll),
    # Domain 1: Science & Space
    ("atom_orbital",     1, "SCIENCE",   "Quantum Atom Orbital",    (0.32, 0.84, 1.00), _g_atom_orbital),
    ("prism_refraction", 1, "SCIENCE",   "Optical Dispersion Prism",(0.32, 0.84, 1.00), _g_prism_refraction),
    ("ringed_planet",    1, "SCIENCE",   "Celestial Ringed Giant",  (0.32, 0.84, 1.00), _g_ringed_planet),
    # Domain 2: Geography & Wonders
    ("compass_rose",     2, "GEOGRAPHY", "Nautical Compass Rose",   (0.28, 0.94, 0.72), _g_compass_rose),
    ("globe_grid",       2, "GEOGRAPHY", "Geodesic Meridian Globe", (0.28, 0.94, 0.72), _g_globe_grid),
    ("volcano",          2, "GEOGRAPHY", "Tectonic Caldera Plume",  (0.28, 0.94, 0.72), _g_volcano),
    # Domain 3: Arts & Architecture
    ("ionic_column",     3, "ARTS",      "Classical Ionic Capital", (0.98, 0.78, 0.56), _g_ionic_column),
    ("gothic_rose",      3, "ARTS",      "Cathedral Rose Tracery",  (0.98, 0.78, 0.56), _g_gothic_rose),
    ("painters_palette", 3, "ARTS",      "Master Atelier Palette",  (0.98, 0.78, 0.56), _g_painters_palette),
    # Domain 4: Film, Music & Pop
    ("apollo_lyre",      4, "POP",       "Harmonic Apollo Lyre",    (1.00, 0.46, 0.78), _g_apollo_lyre),
    ("cinema_reel",      4, "POP",       "35mm Cinema Reel",        (1.00, 0.46, 0.78), _g_cinema_reel),
    ("vinyl_waveform",   4, "POP",       "Acoustic Vinyl Spectrum", (1.00, 0.46, 0.78), _g_vinyl_waveform),
    # Domain 5: Sports & Games
    ("olympic_torch",    5, "SPORTS",    "Stadium Victory Torch",   (1.00, 0.62, 0.28), _g_olympic_torch),
    ("victory_laurel",   5, "SPORTS",    "Championship Laurel",     (1.00, 0.62, 0.28), _g_victory_laurel),
    ("chronograph_dial", 5, "SPORTS",    "Split-Second Chronograph",(1.00, 0.62, 0.28), _g_chronograph_dial),
    # Domain 6: Tech & Computing
    ("cipher_key",       6, "TECH",      "Cryptographic Cipher Key",(0.30, 0.96, 0.98), _g_cipher_key),
    ("quantum_chip",     6, "TECH",      "Quantum Logic Wafer",     (0.30, 0.96, 0.98), _g_quantum_chip),
    ("neural_network",   6, "TECH",      "Synaptic Tensor Mesh",    (0.30, 0.96, 0.98), _g_neural_network),
    # Domain 7: Nature & Biology
    ("dna_helix",        7, "NATURE",    "Double-Helix Genome",     (0.40, 0.94, 0.52), _g_dna_helix),
    ("botanical_frond",  7, "NATURE",    "Botanical Canopy Leaf",   (0.40, 0.94, 0.52), _g_botanical_frond),
    ("nautilus_shell",   7, "NATURE",    "Logarithmic Nautilus",    (0.40, 0.94, 0.52), _g_nautilus_shell),
    # Domain 8: World Affairs & Law
    ("scales_treaty",    8, "SOCIETY",   "Treaty Scales of Justice",(0.86, 0.82, 0.68), _g_scales_treaty),
    ("gavel_charter",    8, "SOCIETY",   "High Tribunal Gavel",     (0.86, 0.82, 0.68), _g_gavel_charter),
    ("diplomatic_olive", 8, "SOCIETY",   "World Council Olive Crest",(0.86, 0.82, 0.68), _g_diplomatic_olive),
    # Domain 9: Food, Craft & Design
    ("horology_gears",   9, "FOOD",      "Escapement Gear Train",   (0.98, 0.64, 0.38), _g_horology_gears),
    ("artisan_amphora",  9, "FOOD",      "Classical Vessel Amphora",(0.98, 0.64, 0.38), _g_artisan_amphora),
    ("alembic_flask",    9, "FOOD",      "Alchemical Alembic Still",(0.98, 0.64, 0.38), _g_alembic_flask),
    # Domain 10: Myth & Literature
    ("grimoire_quill",   10, "MYTH",     "Illuminated Codex & Quill",(0.68, 0.54, 1.00), _g_grimoire_quill),
    ("trident_crown",    10, "MYTH",     "Mythic Sovereign Trident",(0.68, 0.54, 1.00), _g_trident_crown),
    ("ouroboros_sun",    10, "MYTH",     "Celestial Solar Eclipse", (0.68, 0.54, 1.00), _g_ouroboros_sun),
    # Domain 11: Logic & Math
    ("fibonacci_spiral", 11, "LOGIC",    "Golden Ratio Spiral",     (0.98, 0.90, 0.60), _g_fibonacci_spiral),
    ("chess_knight",     11, "LOGIC",    "Grandmaster Knight",      (0.98, 0.90, 0.60), _g_chess_knight),
    ("mobius_infinity",  11, "LOGIC",    "Möbius Infinity Lattice", (0.98, 0.90, 0.60), _g_mobius_infinity),
]


def render_hologram_glyph(
    glyph_id: str,
    domain_tint: Tuple[float, float, float],
    draw_fn: Callable[[ImageDraw.ImageDraw, ImageDraw.ImageDraw, int, int], None],
) -> Image.Image:
    """
    Renders a 768x768 -> 256x256 luminous Gold-and-Cyan SDF Holographic Core Glyph.
    """
    S = 768
    wire_im = Image.new("L", (S, S), 0)
    fill_im = Image.new("L", (S, S), 0)
    dw = ImageDraw.Draw(wire_im)
    df = ImageDraw.Draw(fill_im)
    draw_fn(dw, df, S, 11)

    wire = np.asarray(wire_im, dtype=np.float32) / 255.0
    fill = np.asarray(fill_im, dtype=np.float32) / 255.0

    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    x = (xx - S * 0.5) / (S * 0.5)
    y = (yy - S * 0.5) / (S * 0.5)
    r = np.sqrt(x * x + y * y)
    ang = np.arctan2(y, x)

    # Exact Euclidean distance (in supersampled pixels) from wireframe strokes
    dist = ndimage.distance_transform_edt(wire < 0.35).astype(np.float32)

    # Holographic precision reticle ring around r = 0.83
    reticle_ring = np.exp(-np.power((r - 0.83) / 0.006, 2.0)) * (0.45 + 0.55 * np.power(np.cos(ang * 4.0) ** 2, 0.6))
    cardinal_ticks = np.exp(-np.power((r - 0.83) / 0.025, 2.0)) * np.power(clamp01(np.cos(ang * 2.0) ** 2), 28.0)
    inner_dash = np.exp(-np.power((r - 0.76) / 0.004, 2.0)) * step_mask(np.cos(ang * 24.0), 0.25) * 0.38
    reticle = clamp01(reticle_ring * 0.55 + cardinal_ticks * 0.85 + inner_dash)

    # Subtle holographic scanline modulation + fine interior hex/grid interference
    scanline = 0.86 + 0.14 * np.sin(yy * 0.52)
    grid_holo = (0.5 + 0.5 * np.sin(xx * 0.28) * np.sin(yy * 0.28))

    # True jewel-saturated Gold Filament + Electric-Cyan SDF Corona (zero additive white clip!):
    core_w = clamp01(wire * 0.96 + np.exp(-dist * 0.50) * 0.38)
    gold_w = clamp01(np.exp(-dist / 6.5) * 0.95)
    cyan_w = clamp01(np.exp(-dist / 22.0) * 0.78 + np.exp(-dist / 48.0) * 0.30)

    c_filament = np.array([1.00, 0.92, 0.58], dtype=np.float32)[None, None, :]
    c_gold = np.array([1.00, 0.73, 0.18], dtype=np.float32)[None, None, :]
    c_cyan = np.array([0.14, 0.88, 1.00], dtype=np.float32)[None, None, :]
    c_dom = np.array(domain_tint, dtype=np.float32)[None, None, :]
    c_outer = c_cyan * 0.76 + c_dom * 0.24

    fill_glow = fill * (0.18 + 0.14 * grid_holo) * scanline

    # Smooth spectral transition: outer electric cyan -> mid 24K gold -> warm champagne filament!
    rgb = c_outer * clamp01(cyan_w + fill_glow * 1.15 + reticle * 0.45)[..., None]
    rgb = rgb * (1.0 - gold_w[..., None] * 0.78) + c_gold * (gold_w[..., None] * 0.95)
    rgb = rgb * (1.0 - core_w[..., None] * 0.75) + c_filament * (core_w[..., None] * 0.98)
    rgb = clamp01(rgb + (c_gold * 0.65 + c_cyan * 0.35) * (reticle * 0.58)[..., None]) * scanline[..., None]

    # Add 4 tiny floating holographic data-vertex sparkles inside reticle
    for sx, sy, sr in [(-0.56, -0.48, 0.020), (0.58, -0.44, 0.018), (-0.54, 0.50, 0.017), (0.52, 0.54, 0.021)]:
        sd = np.sqrt((x - sx) ** 2 + (y - sy) ** 2)
        sp = np.exp(-np.power(sd / sr, 1.7)) * 0.82
        rgb += c_filament * sp[..., None]

    edge_fade = smoothstep(0.98, 0.86, r)
    alpha = clamp01((core_w + gold_w * 0.86 + cyan_w * 0.74 + fill_glow * 0.85 + reticle * 0.72) * edge_fade)
    rgba = np.concatenate([clamp01(rgb), alpha[..., None]], axis=-1)
    return save_rgba_clean(rgba, (256, 256), OUT_GLYPHS / f"{glyph_id}.png")


def step_mask(arr: np.ndarray, thresh: float) -> np.ndarray:
    return (arr > thresh).astype(np.float32)


# ==============================================================================
# PART 2: 8 BESPOKE DIPLOMATIC PASSPORT VISA INK-STAMPS (320x320 RGBA)
# ==============================================================================

def _draw_visa_emblem(dr: ImageDraw.ImageDraw, code: str, s: int, w: int) -> None:
    """Draws unmistakable national/venue emblem at center of each diplomatic stamp."""
    c = s * 0.5
    if code == "ch":
        # Bold Swiss Cross + Alpine Mont-Blanc peak silhouette
        arm, th = 0.095*s, 0.036*s
        dr.rectangle([c - arm, c - 0.05*s - th, c + arm, c - 0.05*s + th], fill=255)
        dr.rectangle([c - th, c - 0.05*s - arm, c + th, c - 0.05*s + arm], fill=255)
        dr.line([(c - 0.22*s, c + 0.14*s), (c - 0.09*s, c + 0.04*s), (c, c + 0.10*s),
                 (c + 0.10*s, c + 0.02*s), (c + 0.22*s, c + 0.14*s)], fill=255, width=w, joint="curve")
    elif code == "gb":
        # Sovereign Rotunda Dome & Armillary Rings
        dr.pieslice([c - 0.15*s, c - 0.08*s, c + 0.15*s, c + 0.18*s], 180, 360, outline=255, width=w)
        dr.line([(c - 0.18*s, c + 0.05*s), (c + 0.18*s, c + 0.05*s)], fill=255, width=w)
        for sx in (-0.12, -0.04, 0.04, 0.12):
            dr.line([(c + sx*s, c + 0.05*s), (c + sx*s, c + 0.15*s)], fill=255, width=max(2, w - 1))
        dr.line([(c - 0.20*s, c + 0.15*s), (c + 0.20*s, c + 0.15*s)], fill=255, width=w)
        dr.line([(c, c - 0.15*s), (c, c - 0.08*s)], fill=255, width=w)
    elif code == "jp":
        # Iconic Torii Gate in front of Mt. Fuji silhouette
        dr.line([(c - 0.21*s, c + 0.12*s), (c - 0.05*s, c - 0.06*s), (c + 0.05*s, c - 0.06*s), (c + 0.21*s, c + 0.12*s)], fill=255, width=max(2, w - 1))
        dr.line([(c - 0.17*s, c - 0.09*s), (c, c - 0.11*s), (c + 0.17*s, c - 0.09*s)], fill=255, width=w + 2, joint="curve")
        dr.line([(c - 0.14*s, c - 0.03*s), (c + 0.14*s, c - 0.03*s)], fill=255, width=w)
        dr.line([(c - 0.09*s, c - 0.09*s), (c - 0.09*s, c + 0.14*s)], fill=255, width=w + 1)
        dr.line([(c + 0.09*s, c - 0.09*s), (c + 0.09*s, c + 0.14*s)], fill=255, width=w + 1)
    elif code == "br":
        # Botanical Glass Canopy Arch & Southern Cross Starry Sphere
        dr.line(poly_circle(c, c + 0.01*s, 0.12*s, 64), fill=255, width=w)
        dr.arc([c - 0.14*s, c - 0.03*s, c + 0.14*s, c + 0.11*s], 195, 345, fill=255, width=w)
        for sx, sy in [(0, -0.05), (-0.04, 0.00), (0.04, -0.01), (0, 0.06)]:
            dr.ellipse([c + sx*s - 6, c + sy*s - 6, c + sx*s + 6, c + sy*s + 6], fill=255)
    elif code == "eg":
        # Twin Giza Pyramids & Winged Solar Disc
        dr.polygon([(c - 0.19*s, c + 0.13*s), (c - 0.03*s, c - 0.06*s), (c + 0.13*s, c + 0.13*s)], outline=255, width=w)
        dr.polygon([(c + 0.01*s, c + 0.13*s), (c + 0.12*s, c + 0.00*s), (c + 0.22*s, c + 0.13*s)], outline=255, width=max(2, w - 1))
        dr.ellipse([c - 0.035*s, c - 0.15*s, c + 0.035*s, c - 0.08*s], fill=255)
        dr.line([(c - 0.17*s, c - 0.115*s), (c + 0.17*s, c - 0.115*s)], fill=255, width=max(2, w - 1))
    elif code == "is":
        # Hexagonal Basalt Columns & Aurora Wave
        for bx, bh in [(-0.12, 0.05), (-0.06, -0.01), (0.0, -0.06), (0.06, -0.02), (0.12, 0.04)]:
            dr.rectangle([c + (bx - 0.024)*s, c + bh*s, c + (bx + 0.024)*s, c + 0.14*s], outline=255, width=max(2, w - 1))
        draw_bezier(dr, (c - 0.17*s, c - 0.09*s), (c - 0.06*s, c - 0.17*s), (c + 0.06*s, c - 0.04*s), (c + 0.17*s, c - 0.13*s), w)
    elif code == "sg":
        # Три Sky-Bridge Towers Connected by Elevated Diplomatic Sky-Deck
        for tx in (-0.11, 0.0, 0.11):
            dr.rectangle([c + (tx - 0.026)*s, c - 0.06*s, c + (tx + 0.026)*s, c + 0.14*s], outline=255, width=w)
        dr.pieslice([c - 0.17*s, c - 0.12*s, c + 0.17*s, c - 0.02*s], 180, 360, fill=255)
    else:
        # Global Apex Forum: Crowned Meridian Astrolabe & Star
        dr.line(poly_circle(c, c + 0.01*s, 0.12*s, 64), fill=255, width=w)
        dr.line(poly_ellipse_rot(c, c + 0.01*s, 0.17*s, 0.06*s, -25), fill=255, width=w)
        dr.line(poly_ellipse_rot(c, c + 0.01*s, 0.17*s, 0.06*s, 25), fill=255, width=w)
        dr.polygon([(c - 0.07*s, c - 0.11*s), (c - 0.09*s, c - 0.17*s), (c, c - 0.14*s),
                    (c + 0.09*s, c - 0.17*s), (c + 0.07*s, c - 0.11*s)], fill=255)


VISA_SPECS = [
    ("ch",     "GENEVA · CH",       "VETTING CLEARED", "GVA · ACT 0",  "rounded_sq", (0.94, 0.28, 0.35), (1.00, 0.56, 0.60)),
    ("gb",     "LONDON · UK",       "SOVEREIGN VISA",  "LHR · ACT I",  "octagon",    (0.32, 0.62, 1.00), (0.64, 0.84, 1.00)),
    ("jp",     "TOKYO · JAPAN",     "SKY PAVILION",    "HND · ACT I",  "circle",     (1.00, 0.36, 0.24), (1.00, 0.66, 0.52)),
    ("br",     "RIO DE JANEIRO",    "CANOPY ENTRY",    "GIG · ACT II", "lozenge",    (0.20, 0.86, 0.54), (0.56, 0.98, 0.76)),
    ("eg",     "CAIRO · GIZA",      "SOLAR ARCHIVE",   "CAI · ACT III","arch",       (0.95, 0.66, 0.22), (1.00, 0.86, 0.48)),
    ("is",     "REYKJAVIK · IS",    "CALDERA PASS",    "KEF · ACT III","hexagon",    (0.24, 0.86, 0.96), (0.64, 0.96, 1.00)),
    ("sg",     "SINGAPORE · SG",    "SKY-BRIDGE CORE", "SIN · ACT IV", "shield",     (0.74, 0.42, 0.98), (0.88, 0.68, 1.00)),
    ("global", "THE APEX FORUM",    "ARBITER SEAL",    "INTL · FINALE","scallop",    (0.96, 0.78, 0.30), (1.00, 0.95, 0.68)),
]


def render_visa_stamp(
    code: str, top_txt: str, mid_txt: str, bot_txt: str,
    shape: str, ink_main: Tuple[float, float, float], ink_hi: Tuple[float, float, float],
    seed: int,
) -> Image.Image:
    """Renders an authentic bespoke 320x320 diplomatic passport ink-stamp emblem."""
    S = 768
    mask_im = Image.new("L", (S, S), 0)
    dr = ImageDraw.Draw(mask_im)
    c = S * 0.5
    w_outer = 14
    w_inner = 6

    # 1. Distinct Diplomatic Stamp Outer + Inner Geometric Frame (guaranteed wide text safe-zones!)
    if shape == "rounded_sq":
        dr.rounded_rectangle([88, 88, S - 88, S - 88], radius=78, outline=255, width=w_outer)
        dr.rounded_rectangle([114, 114, S - 114, S - 114], radius=60, outline=255, width=w_inner)
        top_y, mid_y, bot_y, div_w, f_scale = c - 0.255*S, c + 0.225*S, c + 0.288*S, 210, 1.0
    elif shape == "octagon":
        dr.line(poly_regular(c, c, 0.435*S, 8, 22.5), fill=255, width=w_outer, joint="curve")
        dr.line(poly_regular(c, c, 0.398*S, 8, 22.5), fill=255, width=w_inner, joint="curve")
        top_y, mid_y, bot_y, div_w, f_scale = c - 0.245*S, c + 0.220*S, c + 0.282*S, 195, 0.96
    elif shape == "circle":
        dr.line(poly_circle(c, c, 0.425*S, 120), fill=255, width=w_outer)
        dr.line(poly_circle(c, c, 0.388*S, 120), fill=255, width=w_inner)
        top_y, mid_y, bot_y, div_w, f_scale = c - 0.235*S, c + 0.215*S, c + 0.275*S, 195, 0.94
    elif shape == "lozenge":
        #Truncated chamfered diplomatic diamond plaque so top & bottom banners fit with generous margin!
        pts_o = [(245, 86), (S - 245, 86), (S - 64, c), (S - 245, S - 86), (245, S - 86), (64, c), (245, 86)]
        pts_i = [(258, 112), (S - 258, 112), (S - 98, c), (S - 258, S - 112), (258, S - 112), (98, c), (258, 112)]
        dr.line(pts_o, fill=255, width=w_outer, joint="curve")
        dr.line(pts_i, fill=255, width=w_inner, joint="curve")
        top_y, mid_y, bot_y, div_w, f_scale = c - 0.235*S, c + 0.205*S, c + 0.268*S, 175, 0.84
    elif shape == "arch":
        dr.rounded_rectangle([102, 74, S - 102, S - 74], radius=150, outline=255, width=w_outer)
        dr.rounded_rectangle([128, 100, S - 128, S - 100], radius=128, outline=255, width=w_inner)
        top_y, mid_y, bot_y, div_w, f_scale = c - 0.245*S, c + 0.222*S, c + 0.285*S, 190, 0.95
    elif shape == "hexagon":
        # Flat-top & flat-bottom diplomatic hexagon (rot_deg=0 -> vertices at left/right, wide flat top/bottom!)
        dr.line(poly_regular(c, c, 0.435*S, 6, 0), fill=255, width=w_outer, joint="curve")
        dr.line(poly_regular(c, c, 0.398*S, 6, 0), fill=255, width=w_inner, joint="curve")
        top_y, mid_y, bot_y, div_w, f_scale = c - 0.232*S, c + 0.208*S, c + 0.268*S, 175, 0.92
    elif shape == "shield":
        # Deep vertical-walled diplomatic shield (shoulder at y=604/586) + raised bot_y so text sits 100% in vertical rectangular zone!
        sh_o = [(96, 84), (S - 96, 84), (S - 96, 604), (c, S - 52), (96, 604), (96, 84)]
        sh_i = [(122, 110), (S - 122, 110), (S - 122, 586), (c, S - 84), (122, 586), (122, 110)]
        dr.line(sh_o, fill=255, width=w_outer, joint="curve")
        dr.line(sh_i, fill=255, width=w_inner, joint="curve")
        top_y, mid_y, bot_y, div_w, f_scale = c - 0.255*S, c + 0.186*S, c + 0.232*S, 195, 0.80
    else:  # scallop (Global 24K Arbiter Seal)
        pts = []
        for i in range(241):
            a = 2 * math.pi * i / 240.0
            rad = (0.422 + 0.020 * math.cos(a * 16.0)) * S
            pts.append((c + rad * math.cos(a), c + rad * math.sin(a)))
        dr.line(pts, fill=255, width=w_outer, joint="curve")
        dr.line(poly_circle(c, c, 0.376*S, 120), fill=255, width=w_inner)
        top_y, mid_y, bot_y, div_w, f_scale = c - 0.228*S, c + 0.208*S, c + 0.268*S, 185, 0.88

    # 2. Horizontal stamp banner dividers safely inside frame
    dr.line([(int(c - div_w), int(c - 0.165*S)), (int(c + div_w), int(c - 0.165*S))], fill=255, width=5)
    dr.line([(int(c - div_w), int(c + 0.162*S)), (int(c + div_w), int(c + 0.162*S))], fill=255, width=5)

    # 3. National / Venue Centerpiece Emblem
    _draw_visa_emblem(dr, code, S, 11)

    # 4. Crisp Diplomatic Stamp Typography (100% unclipped inside inner borders!)
    f_top = load_font("serif", int(round(40 * f_scale)))
    f_mid = load_font("mono", int(round(27 * f_scale)))
    f_bot = load_font("mono", int(round(28 * f_scale)))

    def draw_centered(txt: str, yy: float, fnt) -> None:
        bb = dr.textbbox((0, 0), txt, font=fnt)
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        dr.text((c - tw * 0.5, yy - th * 0.5), txt, fill=255, font=fnt)

    draw_centered(top_txt, top_y, f_top)
    draw_centered(mid_txt, mid_y, f_mid)
    draw_centered(bot_txt, bot_y, f_bot)

    # Small security stars flanking center emblem
    for side in (-1, 1):
        sx = c + side * 0.265 * S
        dr.polygon([(sx, c - 14), (sx + 5, c - 4), (sx + 14, c), (sx + 5, c + 4),
                    (sx, c + 14), (sx - 5, c + 4), (sx - 14, c), (sx - 5, c - 4)], fill=255)

    raw_mask = np.asarray(mask_im, dtype=np.float32) / 255.0

    # Authentic diplomatic letterpress ink grain (subtle organic fiber transfer, never obscuring text!)
    grain = fbm_noise(S, S, scale=18.0, seed=seed)
    fine = fbm_noise(S, S, scale=5.0, seed=seed + 31)
    ink_tex = clamp01(0.78 + 0.28 * grain * 0.7 + 0.16 * (fine - 0.5))
    stamp_alpha = clamp01(raw_mask * ink_tex)

    # Subtle translucent interior security tint so the stamp body reads cohesively on any page
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    rad = np.sqrt(((xx - c) / (S * 0.5)) ** 2 + ((yy - c) / (S * 0.5)) ** 2)
    guilloche_bg = (0.5 + 0.5 * np.sin(rad * 95.0)) * smoothstep(0.76, 0.55, rad) * 0.08

    c_main = np.array(ink_main, dtype=np.float32)[None, None, :]
    c_hi = np.array(ink_hi, dtype=np.float32)[None, None, :]
    # Slight metallic/ink sheen variation from top-left to bottom-right
    sheen_t = clamp01(1.0 - ((xx + yy) / (2.0 * S)))[..., None]
    ink_rgb = c_main * (1.0 - sheen_t * 0.55) + c_hi * (sheen_t * 0.55)

    # Subtle dark grounding edge shadow so bright ink pops on BOTH dark obsidian & light vellum pages!
    sh = ndimage.gaussian_filter(np.roll(stamp_alpha, shift=(5, 4), axis=(0, 1)), sigma=3.5) * 0.55
    canvas = np.zeros((S, S, 4), dtype=np.float32)
    canvas[..., :3] = np.array([0.02, 0.03, 0.05], dtype=np.float32)[None, None, :]
    canvas[..., 3] = sh

    tint_layer = np.concatenate([np.broadcast_to(c_main, (S, S, 3)), guilloche_bg[..., None]], axis=-1)
    canvas = alpha_composite(canvas, tint_layer)
    ink_layer = np.concatenate([clamp01(ink_rgb), stamp_alpha[..., None]], axis=-1)
    canvas = alpha_composite(canvas, ink_layer)

    return save_rgba_clean(canvas, (320, 320), OUT_VISAS / f"visa_{code}.png")


# ==============================================================================
# PART 3: 3 WORLD COUNCIL FACTION CRESTS (384x384 PBR METALLIC & ENAMEL)
# ==============================================================================

def render_faction_crest(faction_id: str) -> Image.Image:
    """
    Renders a 960x960 -> 384x384 sculpted 3D PBR metallic & guilloché enamel World Council Faction Crest:
      - sovereign: The Sovereign Bloc ("The Iron Laurel") — Platinum-Iron, Indigo Enamel & 24K Gold Laurel/Pillar
      - horizon:   The Horizon Collective ("The Glass Spire") — Brushed Titanium, Smoked Sapphire & Cyan-Gold Spire
      - agora:     The Agora Coalition ("The Open Commons") — Rose-Bronze, Emerald-Teal Enamel & 24K Gold Colonnade/Globe
    """
    S = 960
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32)
    x = (xx - S * 0.5) / (S * 0.5)
    y = (yy - S * 0.5) / (S * 0.5)
    r = np.sqrt(x * x + y * y)
    ang = np.arctan2(y, x)
    c = S * 0.5

    outer_im = Image.new("L", (S, S), 0)
    inner_im = Image.new("L", (S, S), 0)
    emblem_im = Image.new("L", (S, S), 0)
    accent_im = Image.new("L", (S, S), 0)

    do = ImageDraw.Draw(outer_im)
    di = ImageDraw.Draw(inner_im)
    de = ImageDraw.Draw(emblem_im)
    da = ImageDraw.Draw(accent_im)

    if faction_id == "sovereign":
        # Heavy Octagonal Heater Shield ("The Iron Laurel")
        sh_o = [(170, 100), (S - 170, 100), (S - 110, 210), (S - 125, 555), (c, S - 82), (125, 555), (110, 210)]
        sh_i = [(216, 146), (S - 216, 146), (S - 162, 232), (S - 174, 535), (c, S - 142), (174, 535), (162, 232)]
        do.polygon(sh_o, fill=255)
        di.polygon(sh_i, fill=255)

        # Iron Laurel Wreath + Faceted Sovereign Gladius Sword & Crown
        # Vertical sovereign sword blade, diamond pommel & crossguard
        de.polygon([(c, 240), (c + 24, 305), (c + 18, 635), (c, 678), (c - 18, 635), (c - 24, 305)], fill=255)
        de.rounded_rectangle([c - 86, 292, c + 86, 324], radius=12, fill=255)
        de.polygon([(c, 224), (c + 24, 252), (c, 280), (c - 24, 252)], fill=255)
        # Sovereign Crown floating majestically above hilt
        de.polygon([(c - 72, 222), (c - 86, 166), (c - 36, 196), (c, 146),
                    (c + 36, 196), (c + 86, 166), (c + 72, 222)], fill=255)
        # Classical upward-sweeping Iron Laurel Wreath (outer + inner paired leaves curving along the arc!)
        for side in (-1, 1):
            #PIL arc angles: 0=right(+X), 90=down(+Y), 180=left(-X), 270=up(-Y)
            da.arc([c - 210, 240, c + 210, 660], start=108 if side < 0 else -68, end=248 if side < 0 else 72, fill=255, width=18)
            for k in range(6):
                # Sweep upward from bottom (near 90 deg) toward top (near 270 deg)
                deg_pt = (116 + k * 23) if side < 0 else (64 - k * 23)
                la = math.radians(deg_pt)
                lx, ly = c + 210 * math.cos(la), 450 + 210 * math.sin(la)
                # Tangent pointing UPWARD along the laurel branch!
                up_tan = la + (math.pi * 0.5 if side < 0 else -math.pi * 0.5)
                for spread in (-0.36, 0.32):
                    ta = up_tan + spread
                    pts = [
                        (lx, ly),
                        (lx + 34*math.cos(ta - 0.24), ly + 34*math.sin(ta - 0.24)),
                        (lx + 72*math.cos(ta), ly + 72*math.sin(ta)),
                        (lx + 34*math.cos(ta + 0.24), ly + 34*math.sin(ta + 0.24)),
                    ]
                    de.polygon(pts, fill=255)
        # Crossed laurel ribbon tie at bottom
        da.line([(c - 48, 682), (c + 48, 646)], fill=255, width=16)
        da.line([(c + 48, 682), (c - 48, 646)], fill=255, width=16)

        enamel_c, enamel_e = (0.11, 0.17, 0.34), (0.03, 0.05, 0.12)
        bezel_metal = ((0.76, 0.80, 0.86), (1.00, 1.00, 1.00), (0.24, 0.27, 0.34))  # Brushed Platinum-Iron
        emblem_metal = ((0.96, 0.78, 0.36), (1.00, 0.98, 0.88), (0.42, 0.26, 0.06)) # 24K Sovereign Gold

    elif faction_id == "horizon":
        # Sleek Futuristic Faceted Chevron-Diamond Crest ("The Glass Spire")
        sh_o = [(c, 68), (S - 108, 300), (S - 150, 650), (c, S - 68), (150, 650), (108, 300)]
        sh_i = [(c, 126), (S - 158, 322), (S - 194, 624), (c, S - 126), (194, 624), (158, 322)]
        do.polygon(sh_o, fill=255)
        di.polygon(sh_i, fill=255)

        # Soaring Faceted Glass Spire Monolith + Velocity Orbital Ring
        de.polygon([(c, 170), (c + 78, 635), (c, 695), (c - 78, 635)], fill=255)
        # Carve central luminous cyan velocity channel along spire spine
        de.polygon([(c, 225), (c + 16, 610), (c, 645), (c - 16, 610)], fill=0)
        da.polygon([(c, 215), (c + 14, 610), (c, 648), (c - 14, 610)], fill=255)
        # Flanking aerodynamic velocity wings
        for side in (-1, 1):
            de.polygon([(c + side*92, 415), (c + side*215, 515), (c + side*185, 565), (c + side*86, 485)], fill=255)
        # Tilted orbital ring around spire
        da.line(poly_ellipse_rot(c, 455, 245, 78, -18), fill=255, width=22, joint="curve")

        enamel_c, enamel_e = (0.05, 0.26, 0.42), (0.02, 0.08, 0.16)
        bezel_metal = ((0.68, 0.76, 0.84), (0.94, 0.99, 1.00), (0.18, 0.24, 0.32))  # Dark Titanium
        emblem_metal = ((0.98, 0.84, 0.46), (1.00, 0.99, 0.90), (0.44, 0.30, 0.08)) # Champagne Gold + Cyan Accent

    else:  # agora ("The Open Commons")
        # Circular Amphitheater Medallion w/ 8 Cardinal Scallop Lugs
        pts_o = []
        for i in range(241):
            a = 2 * math.pi * i / 240.0
            rad = (0.425 + 0.018 * math.cos(a * 8.0)) * S
            pts_o.append((c + rad * math.cos(a), c + rad * math.sin(a)))
        do.polygon(pts_o, fill=255)
        di.ellipse([142, 142, S - 142, S - 142], fill=255)

        # Open Classical Agora Colonnade Arch + Radiant Intertwined Commons Globe
        de.arc([c - 220, 215, c + 220, 655], 180, 360, fill=255, width=32)
        for col_x in (-175, -95, 95, 175):
            de.rounded_rectangle([c + col_x - 16, 425, c + col_x + 16, 635], radius=6, fill=255)
        de.rounded_rectangle([c - 225, 632, c + 225, 672], radius=12, fill=255)
        de.rounded_rectangle([c - 185, 674, c + 185, 706], radius=10, fill=255)
        # Radiant Commons Globe & Sunburst in heart of the Agora arch
        de.line(poly_circle(c, 455, 86, 72), fill=255, width=20)
        de.line(poly_ellipse_rot(c, 455, 42, 86, 0), fill=255, width=14)
        de.line([(c - 86, 455), (c + 86, 455)], fill=255, width=14)
        for k in range(7):
            ra = math.radians(-165 + k * 25)
            da.line([(c + 106*math.cos(ra), 455 + 106*math.sin(ra)),
                     (c + 152*math.cos(ra), 455 + 152*math.sin(ra))], fill=255, width=16)

        enamel_c, enamel_e = (0.07, 0.42, 0.34), (0.02, 0.13, 0.11)
        bezel_metal = ((0.90, 0.64, 0.40), (1.00, 0.92, 0.80), (0.40, 0.20, 0.10))  # Warm Rose-Bronze
        emblem_metal = ((0.98, 0.83, 0.40), (1.00, 0.99, 0.90), (0.46, 0.28, 0.07)) # 24K Sunlit Gold

    m_outer = ndimage.gaussian_filter(np.asarray(outer_im, dtype=np.float32) / 255.0, sigma=1.0)
    m_inner = ndimage.gaussian_filter(np.asarray(inner_im, dtype=np.float32) / 255.0, sigma=1.0)
    m_bezel = clamp01(m_outer - m_inner)
    m_emb = ndimage.gaussian_filter(np.asarray(emblem_im, dtype=np.float32) / 255.0, sigma=0.9)
    m_acc = ndimage.gaussian_filter(np.asarray(accent_im, dtype=np.float32) / 255.0, sigma=0.9)

    canvas = np.zeros((S, S, 4), dtype=np.float32)

    # Drop shadow
    sh = ndimage.gaussian_filter(np.roll(m_outer, shift=(16, 8), axis=(0, 1)), sigma=12.0) * 0.58
    canvas[..., :3] = np.array([0.015, 0.02, 0.035], dtype=np.float32)[None, None, :]
    canvas[..., 3] = sh

    # 1. Guilloché Grand-Feu Enamel Interior
    ec = np.array(enamel_c, dtype=np.float32)[None, None, :]
    ee = np.array(enamel_e, dtype=np.float32)[None, None, :]
    rt = clamp01(np.sqrt((x + 0.15) ** 2 + (y + 0.18) ** 2))[..., None]
    enamel_rgb = ec * (1.0 - rt) + ee * rt
    guilloche = (0.5 + 0.5 * np.sin(ang * 40.0)) * (0.5 + 0.5 * np.sin(r * 130.0))
    enamel_rgb = enamel_rgb * (0.88 + 0.20 * guilloche[..., None])
    # Inner bezel AO
    dist_in_edge = ndimage.distance_transform_edt(m_inner > 0.5).astype(np.float32)
    enamel_rgb *= (0.52 + 0.48 * clamp01(dist_in_edge / 42.0))[..., None]
    canvas = alpha_composite(canvas, np.concatenate([clamp01(enamel_rgb), m_inner[..., None]], axis=-1))

    # 2. Sculpted PBR Outer Shield Bezel
    b_dist = ndimage.distance_transform_edt(m_bezel > 0.35).astype(np.float32)
    b_h = ndimage.gaussian_filter(np.sqrt(clamp01(b_dist / 26.0)) * m_bezel, sigma=1.8)
    bnx, bny, bnz = normals_from_height(b_h, strength=9.5)
    bezel_rgb = shade_metal_pbr(bnx, bny, bnz, *bezel_metal, roughness=0.20, metallic=0.95)
    canvas = alpha_composite(canvas, np.concatenate([bezel_rgb, clamp01(m_bezel * 1.05)[..., None]], axis=-1))

    # 3. Emblem Drop Shadow on Enamel
    comb_emb = clamp01(np.maximum(m_emb, m_acc))
    emb_sh = ndimage.gaussian_filter(np.roll(comb_emb, shift=(10, 8), axis=(0, 1)), sigma=6.5) * 0.65 * m_inner
    sh_l = np.zeros((S, S, 4), dtype=np.float32)
    sh_l[..., 3] = emb_sh
    canvas = alpha_composite(canvas, sh_l)

    # 4. Accent Layer (Luminous Cyan for Horizon, Antique Silver-Gold for Sovereign/Agora)
    if np.max(m_acc) > 0.05:
        a_dist = ndimage.distance_transform_edt(m_acc > 0.4).astype(np.float32)
        a_h = ndimage.gaussian_filter(np.sqrt(clamp01(a_dist / 16.0)) * m_acc, sigma=1.2)
        anx, any_, anz = normals_from_height(a_h, strength=8.0)
        if faction_id == "horizon":
            acc_rgb = shade_metal_pbr(anx, any_, anz, (0.28, 0.90, 1.00), (0.92, 1.00, 1.00), (0.06, 0.34, 0.52), 0.15, 0.85)
        else:
            acc_rgb = shade_metal_pbr(anx, any_, anz, (0.88, 0.72, 0.38), (1.00, 0.96, 0.84), (0.36, 0.22, 0.06), 0.20, 0.94)
        canvas = alpha_composite(canvas, np.concatenate([acc_rgb, m_acc[..., None]], axis=-1))

    # 5. Primary 3D Cast-Gold Centerpiece Emblem
    e_dist = ndimage.distance_transform_edt(m_emb > 0.4).astype(np.float32)
    e_h = ndimage.gaussian_filter(np.sqrt(clamp01(e_dist / 20.0)) * m_emb, sigma=1.4)
    enx, eny, enz = normals_from_height(e_h, strength=8.5)
    emb_rgb = shade_metal_pbr(enx, eny, enz, *emblem_metal, roughness=0.16, metallic=0.96)
    canvas = alpha_composite(canvas, np.concatenate([emb_rgb, m_emb[..., None]], axis=-1))

    return save_rgba_clean(canvas, (384, 384), OUT_FACTIONS / f"faction_{faction_id}.png")


# ==============================================================================
# PART 4: 1920x1080 VISUAL QA CONTACT SHEET
# ==============================================================================

def build_contact_sheet(
    glyph_imgs: Dict[str, Image.Image],
    visa_imgs: Dict[str, Image.Image],
    faction_imgs: Dict[str, Image.Image],
) -> Path:
    W, H = 1920, 1080
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    rad = np.sqrt(((xx / W - 0.5) * 1.8) ** 2 + ((yy / H - 0.5) * 2.0) ** 2)
    bg = np.zeros((H, W, 3), dtype=np.float32)
    bg[..., 0] = 0.042 + 0.028 * np.exp(-rad * rad * 1.3)
    bg[..., 1] = 0.056 + 0.036 * np.exp(-rad * rad * 1.3)
    bg[..., 2] = 0.092 + 0.048 * np.exp(-rad * rad * 1.3)
    grid = ((xx.astype(np.int32) % 36 == 0) | (yy.astype(np.int32) % 36 == 0)).astype(np.float32) * 0.018
    bg += grid[..., None]

    sheet = Image.fromarray(np.round(clamp01(bg) * 255.0).astype(np.uint8), mode="RGB").convert("RGBA")
    dr = ImageDraw.Draw(sheet)

    f_h1 = load_font("sans", 26)
    f_sec = load_font("sans", 17)
    f_lbl = load_font("sans", 11)

    dr.text((32, 16), "WORLD'S SMARTEST — WAVE-2: 36 SDF HOLOGRAPHIC GLYPHS · 8 PASSPORT VISAS · 3 FACTION CRESTS", fill=(242, 210, 139, 255), font=f_h1)
    dr.line([(32, 52), (W - 32, 52)], fill=(212, 168, 83, 130), width=2)

    # Left/Top Block: 36 SDF Holographic Core Glyphs (12 cols x 3 rows = 36!)
    dr.text((32, 62), "36 LUMINOUS GOLD & CYAN SDF HOLOGRAPHIC CORE GLYPHS (256x256 RGBA — 3 PER DOMAIN x 12 DOMAINS)", fill=(108, 224, 245, 235), font=f_sec)
    for idx, (gid, dom_id, dom_key, title, _, _) in enumerate(GLYPH_MANIFEST_SPECS):
        col = idx % 12
        row = idx // 12
        gx = 32 + col * 155
        gy = 92 + row * 172
        im = glyph_imgs[gid].resize((132, 132), Image.Resampling.LANCZOS)
        sheet.alpha_composite(im, (gx + 8, gy))
        dr.text((gx + 4, gy + 134), f"{gid}", fill=(235, 240, 248, 240), font=f_lbl)
        dr.text((gx + 4, gy + 148), f"[{dom_id}:{dom_key[:4]}]", fill=(170, 188, 212, 200), font=f_lbl)

    # Bottom-Left: 8 Diplomatic Passport Visa Ink-Stamps (4 x 2 grid or 8 across? 4x2 at 184px or 8 across at 156px!)
    dr.line([(32, 616), (W - 32, 616)], fill=(212, 168, 83, 90), width=1)
    dr.text((32, 626), "8 BESPOKE DIPLOMATIC PASSPORT VISA INK-STAMPS (320x320 RGBA)", fill=(242, 210, 139, 235), font=f_sec)
    for idx, (vcode, vtop, _, _, _, _, _) in enumerate(VISA_SPECS):
        col = idx % 4
        row = idx // 4
        vx = 36 + col * 290
        vy = 656 + row * 204
        im = visa_imgs[vcode].resize((176, 176), Image.Resampling.LANCZOS)
        sheet.alpha_composite(im, (vx, vy))
        dr.text((vx + 180, vy + 68), f"visa_{vcode}.png", fill=(242, 210, 139, 245), font=f_lbl)
        dr.text((vx + 180, vy + 86), vtop, fill=(195, 204, 220, 220), font=f_lbl)

    # Bottom-Right: 3 World Council Faction Crests (384x384 RGBA)
    dr.text((1224, 626), "3 WORLD COUNCIL FACTION CRESTS (384x384 PBR)", fill=(242, 210, 139, 235), font=f_sec)
    faction_labels = [
        ("sovereign", "The Sovereign Bloc", "Iron Laurel · Lindqvist"),
        ("horizon",   "Horizon Collective", "Glass Spire · Takahashi"),
        ("agora",     "Agora Coalition",    "Open Commons · Okafor"),
    ]
    for idx, (fid, fname, fsub) in enumerate(faction_labels):
        fx = 1220 + idx * 228
        fy = 676
        im = faction_imgs[fid].resize((206, 206), Image.Resampling.LANCZOS)
        sheet.alpha_composite(im, (fx, fy))
        dr.text((fx + 14, fy + 214), f"faction_{fid}.png", fill=(242, 210, 139, 245), font=f_lbl)
        dr.text((fx + 14, fy + 230), fname, fill=(235, 240, 248, 230), font=f_lbl)
        dr.text((fx + 14, fy + 246), fsub, fill=(175, 190, 215, 210), font=f_lbl)

    out_path = OUT_RENDERS / "glyphs_visas_factions_sheet.png"
    sheet.convert("RGB").save(out_path, format="PNG", optimize=True)
    return out_path


# ==============================================================================
# MAIN ENTRYPOINT
# ==============================================================================

def main() -> None:
    print("[Wave-2 Art] Rendering 36 SDF Holographic Core Glyphs...")
    glyph_imgs: Dict[str, Image.Image] = {}
    manifest_items: List[Dict[str, object]] = []
    by_domain: Dict[str, List[str]] = {str(d): [] for d in range(12)}

    for gid, dom_id, dom_key, title, tint, fn in GLYPH_MANIFEST_SPECS:
        glyph_imgs[gid] = render_hologram_glyph(gid, tint, fn)
        rel_url = f"/assets/glyphs/{gid}.png"
        manifest_items.append({
            "glyphId": gid,
            "l0Domain": dom_id,
            "domainKey": dom_key,
            "title": title,
            "file": f"{gid}.png",
            "url": rel_url,
            "size": [256, 256],
        })
        by_domain[str(dom_id)].append(gid)
        print(f"  + glyphs/{gid}.png (Domain {dom_id}: {dom_key})")

    manifest = {
        "schema": "WS_GLYPH_MANIFEST_V1",
        "count": len(manifest_items),
        "defaultByDomain": {k: v[0] for k, v in by_domain.items()},
        "byDomain": by_domain,
        "glyphs": manifest_items,
    }
    manifest_path = OUT_GLYPHS / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"  + glyphs/manifest.json ({len(manifest_items)} glyphs indexed)")

    print("[Wave-2 Art] Rendering 8 Diplomatic Passport Visa Ink-Stamps...")
    visa_imgs: Dict[str, Image.Image] = {}
    for idx, (vcode, vtop, vmid, vbot, vshape, c1, c2) in enumerate(VISA_SPECS):
        visa_imgs[vcode] = render_visa_stamp(vcode, vtop, vmid, vbot, vshape, c1, c2, seed=800 + idx * 17)
        print(f"  + visas/visa_{vcode}.png")

    print("[Wave-2 Art] Rendering 3 World Council Faction Crests...")
    faction_imgs: Dict[str, Image.Image] = {}
    for fid in ("sovereign", "horizon", "agora"):
        faction_imgs[fid] = render_faction_crest(fid)
        print(f"  + factions/faction_{fid}.png")

    sheet_path = build_contact_sheet(glyph_imgs, visa_imgs, faction_imgs)
    g_bytes = sum((OUT_GLYPHS / f"{g[0]}.png").stat().st_size for g in GLYPH_MANIFEST_SPECS)
    v_bytes = sum((OUT_VISAS / f"visa_{v[0]}.png").stat().st_size for v in VISA_SPECS)
    f_bytes = sum((OUT_FACTIONS / f"faction_{f}.png").stat().st_size for f in ("sovereign", "horizon", "agora"))
    print(
        f"[Wave-2 Art] DONE! 36 Glyphs ({g_bytes/1024:.1f} KiB) + 8 Visas ({v_bytes/1024:.1f} KiB) "
        f"+ 3 Faction Crests ({f_bytes/1024:.1f} KiB) = {(g_bytes+v_bytes+f_bytes)/1024:.1f} KiB total."
    )
    print(f"[Wave-2 Art] Contact Sheet: {sheet_path}")


if __name__ == "__main__":
    main()
