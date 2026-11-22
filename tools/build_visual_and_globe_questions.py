#!/usr/bin/env python3
"""
WORLD'S SMARTEST — VISUAL SAPPHIRE BLUEPRINT & 3D GLOBE PIN-DROP PACK BUILDER
Deterministic generator + exhaustive verifier for:
  1. public/assets/visuals/*.svg (64 luxury horological gold/cyan-on-obsidian SVG plates)
  2. public/data/visual_globe_packs.json (340 verified questions in QID 980001..980340:
     170 visual SIGHTLINE_LOCK blueprints + 170 3D GLOBE_PIN_DROP spatial challenges)

Usage:
  python tools/build_visual_and_globe_questions.py
  python tools/build_visual_and_globe_questions.py --verify
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Sequence, Set, Tuple

ROOT = Path(__file__).resolve().parents[1]
VISUALS_DIR = ROOT / "public" / "assets" / "visuals"
OUTPUT_JSON = ROOT / "public" / "data" / "visual_globe_packs.json"

# ============================================================================
# DETERMINISTIC FNV-1a PRNG & GEODESIC MATH
# ============================================================================

def fnv1a_32(text: str) -> int:
    h = 0x811C9DC5
    for b in text.encode("utf-8"):
        h ^= b
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def seeded_shuffle(items: Sequence[Any], seed_str: str) -> List[Any]:
    out = list(items)
    state = fnv1a_32(seed_str) or 0x9E3779B9
    for i in range(len(out) - 1, 0, -1):
        state = (state * 1664525 + 1013904223) & 0xFFFFFFFF
        j = state % (i + 1)
        out[i], out[j] = out[j], out[i]
    return out


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0088
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlam = math.radians(lon2 - lon1)
    a = (
        math.sin(dphi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(dlam / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return r * c


def xml_esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


# ============================================================================
# LUXURY MERIDIAN HOROLOGICAL SAPPHIRE BLUEPRINT SVG SHELL (480x300)
# ============================================================================

def svg_shell(
    body: str,
    plate_code: str,
    category_stamp: str,
    extra_defs: str = "",
    show_grid: bool = True,
) -> str:
    grid_layer = ""
    if show_grid:
        grid_layer = (
            '  <rect x="14" y="14" width="452" height="272" fill="url(#bpGrid)" opacity="0.65"/>\n'
        )
    # Subtle horological top/bottom graduation ticks
    ticks: List[str] = []
    for x in range(40, 441, 20):
        h = 5 if (x - 40) % 80 == 0 else 2.5
        ticks.append(
            f'    <line x1="{x}" y1="14" x2="{x}" y2="{14 + h:.1f}" stroke="#e5c16c" stroke-opacity="0.32" stroke-width="0.7"/>'
        )
        ticks.append(
            f'    <line x1="{x}" y1="286" x2="{x}" y2="{286 - h:.1f}" stroke="#e5c16c" stroke-opacity="0.32" stroke-width="0.7"/>'
        )
    tick_svg = "\n".join(ticks)

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" width="480" height="300">
  <defs>
    <radialGradient id="bgObsidian" cx="50%" cy="46%" r="64%">
      <stop offset="0%" stop-color="#0e1a33"/>
      <stop offset="58%" stop-color="#091021"/>
      <stop offset="100%" stop-color="#070b16"/>
    </radialGradient>
    <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f7e4ad"/>
      <stop offset="50%" stop-color="#e5c16c"/>
      <stop offset="100%" stop-color="#b68a35"/>
    </linearGradient>
    <linearGradient id="cyanStroke" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7ce2ff"/>
      <stop offset="50%" stop-color="#4cc9f0"/>
      <stop offset="100%" stop-color="#2894c8"/>
    </linearGradient>
    <radialGradient id="turfGrad" cx="50%" cy="82%" r="72%">
      <stop offset="0%" stop-color="#112b31" stop-opacity="0.92"/>
      <stop offset="65%" stop-color="#0b1d27" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#07121d" stop-opacity="0.82"/>
    </radialGradient>
    <pattern id="bpGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#182b4d" stroke-width="0.6"/>
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#233d6b" stroke-width="0.9"/>
    </pattern>
    <filter id="glowCyan" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="2.2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="glowGold" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="1.8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
{extra_defs}
  </defs>
  <rect x="0" y="0" width="480" height="300" fill="url(#bgObsidian)"/>
{grid_layer}
  <!-- Outer Horological Blueprint Frame -->
  <rect x="8" y="8" width="464" height="284" rx="6" fill="none" stroke="url(#goldStroke)" stroke-width="1.3" stroke-opacity="0.78"/>
  <rect x="14" y="14" width="452" height="272" rx="3" fill="none" stroke="#4cc9f0" stroke-width="0.65" stroke-opacity="0.34"/>
  <g>
{tick_svg}
  </g>
  <!-- Corner Registration Reticles -->
  <path d="M 14 28 L 14 14 L 28 14 M 452 14 L 466 14 L 466 28 M 14 272 L 14 286 L 28 286 M 452 286 L 466 286 L 466 272" fill="none" stroke="#e5c16c" stroke-width="1.8"/>
  <!-- Main Blueprint Geometry -->
{body}
  <!-- Plate Catalog Footer Stamps (Zero Spoiler) -->
  <g font-family="'Consolas','Courier New',monospace" font-size="8.5" letter-spacing="1.2">
    <text x="24" y="278" fill="#e5c16c" fill-opacity="0.82">PLATE · {xml_esc(plate_code)}</text>
    <text x="456" y="278" fill="#4cc9f0" fill-opacity="0.78" text-anchor="end">{xml_esc(category_stamp)}</text>
  </g>
</svg>
'''


# ============================================================================
# GROUP A: 20 ICONIC MLB BALLPARK OUTFIELD DIMENSION & WALL BLUEPRINTS
# ============================================================================

def _bp_pt(cx: float, cy: float, angle_deg: float, dist_ft: float, scale: float) -> Tuple[float, float]:
    """Convert ballpark polar (angle 0=CF straight up, -45=LF, +45=RF) to SVG (x, y)."""
    rad = math.radians(angle_deg)
    x = cx + math.sin(rad) * dist_ft * scale
    y = cy - math.cos(rad) * dist_ft * scale
    return (x, y)


def render_ballpark_svg(spec: Dict[str, Any]) -> str:
    cx = float(spec.get("cx", 240.0))
    cy = float(spec.get("cy", 256.0))
    scale = float(spec.get("scale", 0.435))
    wall_pts_raw: List[Tuple[float, float]] = spec["wall_pts"]
    pts = [_bp_pt(cx, cy, ang, d, scale) for (ang, d) in wall_pts_raw]

    # Playing field closed polygon (home plate -> LF corner -> outfield wall -> RF corner -> home)
    poly_coords = [f"{cx:.1f},{cy:.1f}"] + [f"{x:.1f},{y:.1f}" for (x, y) in pts]
    field_poly = " ".join(poly_coords)
    wall_path = "M " + " L ".join(f"{x:.1f},{y:.1f}" for (x, y) in pts)

    # Highlighted iconic cyan wall segment (index slice on pts)
    hl_range = spec.get("highlight_slice")
    hl_svg = ""
    if hl_range is not None:
        i0, i1 = hl_range
        seg = pts[i0 : i1 + 1]
        if len(seg) >= 2:
            d_hl = "M " + " L ".join(f"{x:.1f},{y:.1f}" for (x, y) in seg)
            hl_svg = f'    <path d="{d_hl}" fill="none" stroke="#4cc9f0" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#glowCyan)"/>'

    # Concentric outfield distance arcs (150', 225', 300', 375') clipped neatly by turf clipPath
    clip_id = f"clip_{spec['slug']}"
    arc_lines: List[str] = []
    for rad_ft in (150, 225, 300, 375):
        r = rad_ft * scale
        p_l = _bp_pt(cx, cy, -45, rad_ft, scale)
        p_r = _bp_pt(cx, cy, 45, rad_ft, scale)
        arc_lines.append(
            f'      <path d="M {p_l[0]:.1f},{p_l[1]:.1f} A {r:.1f},{r:.1f} 0 0,1 {p_r[0]:.1f},{p_r[1]:.1f}" fill="none" stroke="#4cc9f0" stroke-opacity="0.18" stroke-width="0.7" stroke-dasharray="3 4"/>'
        )
    arcs_svg = "\n".join(arc_lines)

    # Infield geometry (scaled faithfully: 90 ft bases, 95 ft grass radius from mound, 60.5 ft mound)
    base_d = 90.0 * scale
    mound_y = cy - 60.5 * scale
    b1 = _bp_pt(cx, cy, 45, 90.0, scale)
    b3 = _bp_pt(cx, cy, -45, 90.0, scale)
    b2 = (cx, cy - math.sqrt(2.0) * base_d)
    infield_r = 95.0 * scale
    ig_l = _bp_pt(cx, cy, -45, 132.0, scale)
    ig_r = _bp_pt(cx, cy, 45, 132.0, scale)

    # Foul poles
    lf_pole = pts[0]
    rf_pole = pts[-1]

    # Dimension callouts
    dim_labels: List[str] = []
    for ang, d_ft, custom_txt, ox, oy in spec["dims"]:
        wx, wy = _bp_pt(cx, cy, ang, d_ft, scale)
        tx, ty = _bp_pt(cx, cy, ang, d_ft + 26.0, scale)
        tx += ox
        ty += oy
        anchor = "middle"
        if ang <= -28:
            anchor = "end"
        elif ang >= 28:
            anchor = "start"
        lbl = custom_txt if custom_txt else f"{int(d_ft)}'"
        is_cyan = any(ch in lbl for ch in ("*", "!"))
        clean_lbl = lbl.replace("*", "").replace("!", "")
        col = "#4cc9f0" if is_cyan else "#f4e6be"
        dim_labels.append(
            f'    <line x1="{wx:.1f}" y1="{wy:.1f}" x2="{tx:.1f}" y2="{ty - 3:.1f}" stroke="{col}" stroke-opacity="0.55" stroke-width="0.8"/>\n'
            f'    <circle cx="{wx:.1f}" cy="{wy:.1f}" r="2.2" fill="{col}"/>\n'
            f'    <text x="{tx:.1f}" y="{ty:.1f}" fill="{col}" font-family="\'Consolas\',monospace" font-size="10.5" font-weight="bold" text-anchor="{anchor}">{xml_esc(clean_lbl)}</text>'
        )
    dims_svg = "\n".join(dim_labels)

    # Architectural telemetry badge (top-left & top-right — strictly numeric/architectural, zero spoilers!)
    badge_left = spec.get("badge_left", "")
    badge_right = spec.get("badge_right", "")
    badges_svg = ""
    if badge_left:
        badges_svg += (
            f'    <rect x="24" y="24" width="{len(badge_left) * 6.4 + 16:.1f}" height="20" rx="3" fill="#0b1830" stroke="#4cc9f0" stroke-width="0.9" stroke-opacity="0.85"/>\n'
            f'    <text x="32" y="37" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold">{xml_esc(badge_left)}</text>\n'
        )
    if badge_right:
        bw = len(badge_right) * 6.4 + 16
        bx = 456 - bw
        badges_svg += (
            f'    <rect x="{bx:.1f}" y="24" width="{bw:.1f}" height="20" rx="3" fill="#0b1830" stroke="#e5c16c" stroke-width="0.9" stroke-opacity="0.82"/>\n'
            f'    <text x="{bx + 8:.1f}" y="37" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold">{xml_esc(badge_right)}</text>\n'
        )

    # Custom signature architectural blueprint extras (warehouse, bay waves, dome, arch, fountains, bridge, pool)
    extra_fn: Optional[Callable[[float, float, float, List[Tuple[float, float]]], str]] = spec.get("extra_fn")
    extra_svg = extra_fn(cx, cy, scale, pts) if extra_fn else ""

    # Keyhole dirt path optional (Comerica Park)
    keyhole_svg = ""
    if spec.get("keyhole_path"):
        keyhole_svg = (
            f'    <line x1="{cx:.1f}" y1="{cy - 4:.1f}" x2="{cx:.1f}" y2="{mound_y:.1f}" stroke="#4cc9f0" stroke-width="4.2" stroke-opacity="0.82" filter="url(#glowCyan)"/>\n'
            f'    <circle cx="{cx:.1f}" cy="{mound_y:.1f}" r="6.2" fill="#0b1830" stroke="#4cc9f0" stroke-width="1.6"/>'
        )

    extra_defs = (
        f'    <clipPath id="{clip_id}">\n'
        f'      <polygon points="{field_poly}"/>\n'
        f'    </clipPath>'
    )

    body = f'''  <g>
    <!-- Architectural Context & Signature Landmarks -->
{extra_svg}
    <!-- Outfield Turf Silhouette -->
    <polygon points="{field_poly}" fill="url(#turfGrad)"/>
    <g clip-path="url(#{clip_id})">
{arcs_svg}
    </g>
    <!-- Warning Track Inner Echo -->
    <path d="{wall_path}" fill="none" stroke="#e5c16c" stroke-opacity="0.22" stroke-width="6.5" stroke-linejoin="round"/>
    <!-- Outfield Wall Geometry -->
    <path d="{wall_path}" fill="none" stroke="url(#goldStroke)" stroke-width="2.2" stroke-linejoin="round" filter="url(#glowGold)"/>
{hl_svg}
    <!-- Foul Lines -->
    <line x1="{cx:.1f}" y1="{cy:.1f}" x2="{lf_pole[0]:.1f}" y2="{lf_pole[1]:.1f}" stroke="#e5c16c" stroke-width="1.2" stroke-opacity="0.82"/>
    <line x1="{cx:.1f}" y1="{cy:.1f}" x2="{rf_pole[0]:.1f}" y2="{rf_pole[1]:.1f}" stroke="#e5c16c" stroke-width="1.2" stroke-opacity="0.82"/>
    <!-- Infield Arc & 90-ft Diamond -->
    <path d="M {ig_l[0]:.1f},{ig_l[1]:.1f} A {infield_r:.1f},{infield_r:.1f} 0 0,1 {ig_r[0]:.1f},{ig_r[1]:.1f}" fill="none" stroke="#e5c16c" stroke-opacity="0.55" stroke-width="1.1"/>
    <polygon points="{cx:.1f},{cy:.1f} {b1[0]:.1f},{b1[1]:.1f} {b2[0]:.1f},{b2[1]:.1f} {b3[0]:.1f},{b3[1]:.1f}" fill="#172438" fill-opacity="0.65" stroke="#e5c16c" stroke-width="1.15"/>
{keyhole_svg}
    <!-- Pitcher Mound & 4 Bases -->
    <circle cx="{cx:.1f}" cy="{mound_y:.1f}" r="3.4" fill="#e5c16c" fill-opacity="0.28" stroke="#e5c16c" stroke-width="1.0"/>
    <rect x="{b1[0]-2.2:.1f}" y="{b1[1]-2.2:.1f}" width="4.4" height="4.4" fill="#f7e4ad" transform="rotate(45 {b1[0]:.1f} {b1[1]:.1f})"/>
    <rect x="{b2[0]-2.2:.1f}" y="{b2[1]-2.2:.1f}" width="4.4" height="4.4" fill="#f7e4ad" transform="rotate(45 {b2[0]:.1f} {b2[1]:.1f})"/>
    <rect x="{b3[0]-2.2:.1f}" y="{b3[1]-2.2:.1f}" width="4.4" height="4.4" fill="#f7e4ad" transform="rotate(45 {b3[0]:.1f} {b3[1]:.1f})"/>
    <circle cx="{cx:.1f}" cy="{cy:.1f}" r="3.2" fill="#f7e4ad"/>
    <!-- Foul Pole Beacons -->
    <circle cx="{lf_pole[0]:.1f}" cy="{lf_pole[1]:.1f}" r="3.4" fill="#e5c16c" stroke="#070b16" stroke-width="1"/>
    <circle cx="{rf_pole[0]:.1f}" cy="{rf_pole[1]:.1f}" r="3.4" fill="#e5c16c" stroke="#070b16" stroke-width="1"/>
    <!-- Scaled Distance Readouts -->
{dims_svg}
    <!-- Telemetry Callout Badges -->
{badges_svg}
  </g>'''

    return svg_shell(
        body=body,
        plate_code=spec["plate_code"],
        category_stamp="DIAMOND SURVEY · FT",
        extra_defs=extra_defs,
    )


# --- Bespoke Ballpark Architectural Context Helpers (Zero Spoiler Text!) ---

def _extra_fenway(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Vertical 37 ft wall elevation inset diagram on left edge
    return (
        '    <g transform="translate(26, 155)">\n'
        '      <rect x="0" y="0" width="54" height="68" rx="2" fill="#091529" stroke="#4cc9f0" stroke-opacity="0.55" stroke-width="0.9"/>\n'
        '      <line x1="8" y1="54" x2="46" y2="54" stroke="#e5c16c" stroke-width="1"/>\n'
        '      <rect x="20" y="16" width="12" height="38" fill="#4cc9f0" fill-opacity="0.28" stroke="#4cc9f0" stroke-width="1.6"/>\n'
        '      <line x1="12" y1="16" x2="12" y2="54" stroke="#e5c16c" stroke-dasharray="2 2" stroke-width="0.8"/>\n'
        '      <text x="27" y="11" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">LF ELEV</text>\n'
        '      <text x="27" y="64" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.5" font-weight="bold" text-anchor="middle">H: 37 FT</text>\n'
        '    </g>'
    )


def _extra_wrigley(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Centerfield manual scoreboard silhouette + brick/foliage crosshatch arc behind wall
    cf_x, cf_y = _bp_pt(cx, cy, 0, 400, sc)
    return (
        f'    <g>\n'
        f'      <rect x="{cf_x - 36:.1f}" y="{cf_y - 26:.1f}" width="72" height="18" rx="1.5" fill="#0d1d35" stroke="#4cc9f0" stroke-width="1.3"/>\n'
        f'      <line x1="{cf_x - 30:.1f}" y1="{cf_y - 17:.1f}" x2="{cf_x + 30:.1f}" y2="{cf_y - 17:.1f}" stroke="#e5c16c" stroke-dasharray="4 3" stroke-width="0.9"/>\n'
        f'      <circle cx="{cf_x:.1f}" cy="{cf_y - 31:.1f}" r="4.5" fill="#091529" stroke="#e5c16c" stroke-width="1.1"/>\n'
        f'      <text x="372" y="218" fill="#4cc9f0" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">BRICK + VINE</text>\n'
        f'      <rect x="342" y="224" width="60" height="22" fill="none" stroke="#4cc9f0" stroke-opacity="0.55" stroke-width="0.9"/>\n'
        f'      <path d="M 342 231 L 402 231 M 342 239 L 402 239 M 357 224 L 357 231 M 387 224 L 387 231 M 372 231 L 372 239 M 357 239 L 357 246 M 387 239 L 387 246" stroke="#e5c16c" stroke-opacity="0.55" stroke-width="0.8"/>\n'
        f'    </g>'
    )


def _extra_yankee_frieze(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Iconic arched copper roof frieze motif framing upper edge
    arches = " ".join(f"Q {x + 9},48 {x + 18},58" for x in range(132, 330, 18))
    return (
        f'    <path d="M 132 58 {arches}" fill="none" stroke="#e5c16c" stroke-opacity="0.48" stroke-width="1.2"/>\n'
        f'    <line x1="132" y1="47" x2="348" y2="47" stroke="#e5c16c" stroke-opacity="0.38" stroke-width="0.9"/>'
    )


def _extra_oracle(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Bay water cove contour right behind RF wall!
    return (
        '    <g stroke="#4cc9f0" fill="none">\n'
        '      <path d="M 342 86 Q 368 118 378 158 Q 388 202 365 246" stroke-width="1.5" stroke-opacity="0.85" filter="url(#glowCyan)"/>\n'
        '      <path d="M 366 96 Q 382 103 398 96 Q 414 89 430 96" stroke-width="1.1" stroke-opacity="0.62"/>\n'
        '      <path d="M 380 124 Q 396 131 412 124 Q 428 117 444 124" stroke-width="1.1" stroke-opacity="0.55"/>\n'
        '      <path d="M 388 152 Q 404 159 420 152 Q 436 145 452 152" stroke-width="1.1" stroke-opacity="0.52"/>\n'
        '      <path d="M 384 180 Q 400 187 416 180 Q 432 173 448 180" stroke-width="1.1" stroke-opacity="0.48"/>\n'
        '      <path d="M 374 208 Q 390 215 406 208 Q 422 201 438 208" stroke-width="1.1" stroke-opacity="0.42"/>\n'
        '      <text x="415" y="170" fill="#7ce2ff" stroke="none" font-family="\'Consolas\',monospace" font-size="8.5" font-weight="bold" text-anchor="middle">TIDAL COVE</text>\n'
        '    </g>'
    )


def _extra_dodger(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Twin symmetrical folded-plate zigzag mid-century pavilion roofs behind LF and RF
    return (
        '    <g stroke="#4cc9f0" fill="#0d1e36" fill-opacity="0.72" stroke-width="1.3">\n'
        '      <polygon points="96,126 112,110 126,118 140,98 156,105 168,85 182,92 170,114 114,142"/>\n'
        '      <polygon points="384,126 368,110 354,118 340,98 324,105 312,85 298,92 310,114 366,142"/>\n'
        '      <line x1="240" y1="62" x2="240" y2="258" stroke="#e5c16c" stroke-opacity="0.28" stroke-dasharray="4 4" stroke-width="0.9"/>\n'
        '      <text x="82" y="96" fill="#7ce2ff" stroke="none" font-family="\'Consolas\',monospace" font-size="7.8" text-anchor="middle">ZIGZAG</text>\n'
        '      <text x="82" y="106" fill="#7ce2ff" stroke="none" font-family="\'Consolas\',monospace" font-size="7.8" text-anchor="middle">PAVILION</text>\n'
        '    </g>'
    )


def _extra_camden(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # 1,016-foot long historic brick warehouse running parallel along RF promenade
    win_lines = "\n".join(
        f'      <line x1="378" y1="{y}" x2="406" y2="{y}" stroke="#e5c16c" stroke-opacity="0.45" stroke-width="0.7"/>'
        for y in range(74, 240, 12)
    )
    return (
        '    <g>\n'
        '      <rect x="376" y="64" width="32" height="184" rx="1.5" fill="#162138" stroke="#4cc9f0" stroke-width="1.6" filter="url(#glowCyan)"/>\n'
        f'{win_lines}\n'
        '      <text x="424" y="156" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.2" font-weight="bold" transform="rotate(90 424 156)" text-anchor="middle">WAREHOUSE · 1,016 FT</text>\n'
        '    </g>'
    )


def _extra_polo_grounds(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Iconic U-shaped bathtub outer grandstand enclosure + CF clubhouse stairs inset
    return (
        '    <g fill="none">\n'
        '      <path d="M 148 256 L 136 160 L 144 82 Q 240 50 336 82 L 344 160 L 332 256" stroke="#4cc9f0" stroke-opacity="0.45" stroke-width="1.3" stroke-dasharray="5 3"/>\n'
        '      <rect x="224" y="62" width="32" height="14" fill="#0d1c34" stroke="#4cc9f0" stroke-width="1.2"/>\n'
        '      <text x="240" y="54" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.8" text-anchor="middle">CF CLUBHOUSE STAIRS</text>\n'
        '    </g>'
    )


def _extra_astrodome(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Full circular 642 ft geodesic steel lamella dome roof lattice!
    dcx, dcy = 240.0, 162.0
    spokes: List[str] = []
    for k in range(12):
        ang = math.radians(k * 30)
        x2 = dcx + math.cos(ang) * 112
        y2 = dcy + math.sin(ang) * 112
        spokes.append(
            f'      <line x1="{dcx:.1f}" y1="{dcy:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#4cc9f0" stroke-opacity="0.24" stroke-width="0.8"/>'
        )
    spokes_svg = "\n".join(spokes)
    return (
        f'    <g fill="none">\n'
        f'      <circle cx="{dcx}" cy="{dcy}" r="112" stroke="#4cc9f0" stroke-width="1.8" stroke-opacity="0.85" filter="url(#glowCyan)"/>\n'
        f'      <circle cx="{dcx}" cy="{dcy}" r="88" stroke="#4cc9f0" stroke-width="0.9" stroke-opacity="0.42" stroke-dasharray="4 3"/>\n'
        f'      <circle cx="{dcx}" cy="{dcy}" r="60" stroke="#4cc9f0" stroke-width="0.8" stroke-opacity="0.32" stroke-dasharray="3 3"/>\n'
        f'      <circle cx="{dcx}" cy="{dcy}" r="28" stroke="#e5c16c" stroke-width="0.9" stroke-opacity="0.48"/>\n'
        f'{spokes_svg}\n'
        f'    </g>'
    )


def _extra_tiger(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # 10-foot upper-deck RF overhang protruding inside the RF wall + CF flagpole dot
    p_rf = _bp_pt(cx, cy, 45, 315, sc)
    p_rc = _bp_pt(cx, cy, 24, 358, sc)
    p_cf = _bp_pt(cx, cy, 0, 434, sc)
    return (
        f'    <g>\n'
        f'      <line x1="{p_rf[0]:.1f}" y1="{p_rf[1]:.1f}" x2="{p_rc[0]:.1f}" y2="{p_rc[1]:.1f}" stroke="#4cc9f0" stroke-width="2.6" stroke-dasharray="5 3" filter="url(#glowCyan)"/>\n'
        f'      <circle cx="{p_cf[0]:.1f}" cy="{p_cf[1]:.1f}" r="3.8" fill="none" stroke="#4cc9f0" stroke-width="1.3"/>\n'
        f'      <text x="386" y="198" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">10 FT UPPER</text>\n'
        f'      <text x="386" y="208" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">RF OVERHANG</text>\n'
        f'    </g>'
    )


def _extra_kauffman(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Sweeping 322 ft curved water fountain cascade arcs + crown-shaped CF scoreboard
    return (
        '    <g fill="none">\n'
        '      <path d="M 106 112 Q 168 62 240 58 Q 312 62 374 112" stroke="#4cc9f0" stroke-width="2.4" stroke-opacity="0.88" filter="url(#glowCyan)"/>\n'
        '      <path d="M 118 116 Q 174 72 240 68 Q 306 72 362 116" stroke="#4cc9f0" stroke-width="1.2" stroke-dasharray="4 3" stroke-opacity="0.72"/>\n'
        '      <polygon points="222,58 226,42 234,50 240,38 246,50 254,42 258,58" fill="#10203a" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '      <text x="394" y="90" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">322 FT</text>\n'
        '      <text x="394" y="100" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">FOUNTAINS</text>\n'
        '    </g>'
    )


def _extra_coors(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # 5,280 ft altitude contour ring + pine-tree rock garden batter's eye beyond CF
    return (
        '    <g>\n'
        '      <path d="M 96 150 A 188 188 0 0 1 384 150" fill="none" stroke="#a78bfa" stroke-width="2.0" stroke-dasharray="6 3" stroke-opacity="0.85"/>\n'
        '      <text x="416" y="114" fill="#c4b5fd" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">ROW 20</text>\n'
        '      <text x="416" y="124" fill="#c4b5fd" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">5,280 FT</text>\n'
        '      <polygon points="226,72 232,56 238,72" fill="#17383a" stroke="#4cc9f0" stroke-width="1"/>\n'
        '      <polygon points="242,72 248,54 254,72" fill="#17383a" stroke="#4cc9f0" stroke-width="1"/>\n'
        '    </g>'
    )


def _extra_ebbets(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # 38 ft angled RF wall cross-section (19' concrete + 19' wire screen)
    return (
        '    <g transform="translate(384, 152)">\n'
        '      <rect x="0" y="0" width="66" height="72" rx="2" fill="#091529" stroke="#4cc9f0" stroke-opacity="0.58" stroke-width="0.9"/>\n'
        '      <text x="33" y="12" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.8" text-anchor="middle">RF WALL</text>\n'
        '      <rect x="24" y="38" width="16" height="22" fill="#e5c16c" fill-opacity="0.3" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '      <rect x="24" y="17" width="16" height="21" fill="none" stroke="#4cc9f0" stroke-dasharray="2 2" stroke-width="1.3"/>\n'
        '      <text x="33" y="69" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="7.8" font-weight="bold" text-anchor="middle">19\'+19\'=38\'</text>\n'
        '    </g>'
    )


def _extra_pnc(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Iconic twin-tower suspension bridge spanning river directly beyond CF/RF (clear of top badge!)
    return (
        '    <g stroke="#4cc9f0" fill="none">\n'
        '      <line x1="258" y1="80" x2="444" y2="80" stroke-width="1.6"/>\n'
        '      <line x1="302" y1="54" x2="302" y2="80" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '      <line x1="398" y1="54" x2="398" y2="80" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '      <path d="M 264 80 Q 286 70 302 54 Q 350 86 398 54 Q 414 70 438 80" stroke-width="1.4" filter="url(#glowCyan)"/>\n'
        '      <line x1="326" y1="66" x2="326" y2="80" stroke-opacity="0.6" stroke-width="0.7"/>\n'
        '      <line x1="350" y1="70" x2="350" y2="80" stroke-opacity="0.6" stroke-width="0.7"/>\n'
        '      <line x1="374" y1="66" x2="374" y2="80" stroke-opacity="0.6" stroke-width="0.7"/>\n'
        '      <path d="M 268 90 Q 300 95 332 90 Q 364 85 396 90 Q 424 95 446 90" stroke-opacity="0.52" stroke-width="0.9"/>\n'
        '    </g>'
    )


def _extra_petco(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # 1909 4-story historic brick building whose corner IS the LF foul pole!
    lf_x, lf_y = pts[0]
    return (
        f'    <g>\n'
        f'      <rect x="{lf_x - 56:.1f}" y="{lf_y - 34:.1f}" width="56" height="40" fill="#19233a" stroke="#4cc9f0" stroke-width="1.7" filter="url(#glowCyan)"/>\n'
        f'      <line x1="{lf_x - 50:.1f}" y1="{lf_y - 24:.1f}" x2="{lf_x - 6:.1f}" y2="{lf_y - 24:.1f}" stroke="#e5c16c" stroke-dasharray="4 3" stroke-width="0.9"/>\n'
        f'      <line x1="{lf_x - 50:.1f}" y1="{lf_y - 12:.1f}" x2="{lf_x - 6:.1f}" y2="{lf_y - 12:.1f}" stroke="#e5c16c" stroke-dasharray="4 3" stroke-width="0.9"/>\n'
        f'      <text x="{lf_x - 28:.1f}" y="{lf_y + 18:.1f}" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.6" text-anchor="middle">1909 BRICK BLDG</text>\n'
        f'      <text x="{lf_x - 28:.1f}" y="{lf_y + 28:.1f}" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="7.6" text-anchor="middle">= LF FOUL POLE</text>\n'
        f'    </g>'
    )


def _extra_busch(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Iconic 630 ft parabolic inverted-catenary steel arch rising beyond CF/RCF!
    return (
        '    <g fill="none">\n'
        '      <path d="M 278 96 Q 318 22 358 96" stroke="#4cc9f0" stroke-width="3.2" filter="url(#glowCyan)"/>\n'
        '      <path d="M 284 96 Q 318 32 352 96" stroke="#e5c16c" stroke-width="1.0" stroke-opacity="0.8"/>\n'
        '      <text x="394" y="64" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.2" font-weight="bold" text-anchor="middle">CATENARY</text>\n'
        '      <text x="394" y="74" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">H: 630 FT</text>\n'
        '    </g>'
    )


def _extra_rogers(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # 4-panel telescoping retractable dome arcs + adjacent 553 m broadcast tower spire
    return (
        '    <g fill="none">\n'
        '      <circle cx="240" cy="166" r="102" stroke="#4cc9f0" stroke-opacity="0.6" stroke-width="1.4"/>\n'
        '      <path d="M 152 122 Q 240 94 328 122" stroke="#4cc9f0" stroke-width="1.5" stroke-dasharray="5 3"/>\n'
        '      <path d="M 144 154 Q 240 128 336 154" stroke="#4cc9f0" stroke-width="1.5" stroke-dasharray="5 3"/>\n'
        '      <g transform="translate(416, 44)">\n'
        '        <line x1="0" y1="0" x2="0" y2="196" stroke="#e5c16c" stroke-width="2.0" filter="url(#glowGold)"/>\n'
        '        <ellipse cx="0" cy="54" rx="11" ry="4.5" fill="#10223d" stroke="#4cc9f0" stroke-width="1.4"/>\n'
        '        <polygon points="-5,196 0,58 5,196" fill="#e5c16c" fill-opacity="0.2" stroke="#e5c16c" stroke-width="0.9"/>\n'
        '        <text x="0" y="212" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">553 M SPIRE</text>\n'
        '      </g>\n'
        '    </g>'
    )


def _extra_citi(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Signature outfield pedestrian bridge span behind RCF + circular rotunda
    return (
        '    <g fill="none">\n'
        '      <path d="M 274 78 Q 320 56 368 88" stroke="#4cc9f0" stroke-width="2.4" filter="url(#glowCyan)"/>\n'
        '      <line x1="274" y1="84" x2="368" y2="94" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '      <circle cx="240" cy="64" r="7" fill="#12233d" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '      <text x="396" y="106" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.8" text-anchor="middle">OUTFIELD</text>\n'
        '      <text x="396" y="116" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.8" text-anchor="middle">BRIDGE</text>\n'
        '    </g>'
    )


def _extra_chase(cx: float, cy: float, sc: float, pts: List[Tuple[float, float]]) -> str:
    # Unmistakable rectangular swimming pool deck directly beyond RCF + roof truss tracks
    return (
        '    <g>\n'
        '      <rect x="334" y="84" width="44" height="22" rx="3" fill="#0d3a54" stroke="#4cc9f0" stroke-width="1.8" filter="url(#glowCyan)"/>\n'
        '      <path d="M 340 92 Q 348 89 356 92 Q 364 95 372 92 M 340 99 Q 348 96 356 99 Q 364 102 372 99" fill="none" stroke="#9ef0ff" stroke-width="0.9"/>\n'
        '      <line x1="90" y1="54" x2="390" y2="54" stroke="#e5c16c" stroke-opacity="0.35" stroke-dasharray="6 4" stroke-width="1.1"/>\n'
        '      <line x1="90" y1="258" x2="390" y2="258" stroke="#e5c16c" stroke-opacity="0.35" stroke-dasharray="6 4" stroke-width="1.1"/>\n'
        '      <text x="412" y="94" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.8" text-anchor="middle">RCF POOL</text>\n'
        '      <text x="412" y="104" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.8" text-anchor="middle">DECK</text>\n'
        '    </g>'
    )


BALLPARK_SPECS: List[Dict[str, Any]] = [
    {
        "slug": "bp_fenway",
        "plate_code": "BB-01",
        "scale": 0.43,
        "badge_left": "LF WALL: 37 FT",
        "badge_right": "OPENED 1912",
        "wall_pts": [(-45, 310), (-30, 345), (-20, 379), (-4, 390), (8, 420), (16, 380), (30, 355), (45, 302)],
        "highlight_slice": (0, 2),
        "dims": [(-45, 310, "310'*", -4, 4), (-20, 379, "379'", 0, -2), (8, 420, "420'*", 8, -2), (24, 380, "380'", 10, 0), (45, 302, "302'*", 4, 4)],
        "extra_fn": _extra_fenway,
    },
    {
        "slug": "bp_wrigley",
        "plate_code": "BB-02",
        "scale": 0.43,
        "badge_left": "CORNER WELLS: 368'",
        "badge_right": "OPENED 1914",
        "wall_pts": [(-45, 355), (-35, 368), (-24, 382), (-10, 396), (0, 400), (10, 396), (24, 382), (35, 368), (45, 353)],
        "highlight_slice": (0, 8),
        "dims": [(-45, 355, "355'", -2, 6), (-35, 368, "368'*", -8, -4), (0, 400, "400'", 0, -28), (35, 368, "368'*", 8, -4), (45, 353, "353'", 2, 6)],
        "extra_fn": _extra_wrigley,
    },
    {
        "slug": "bp_yankee_classic",
        "plate_code": "BB-03",
        "scale": 0.39,
        "badge_left": "LCF VALLEY: 457'",
        "badge_right": "OPENED 1923",
        "wall_pts": [(-45, 301), (-30, 402), (-16, 457), (0, 461), (18, 407), (34, 344), (45, 295)],
        "highlight_slice": (1, 3),
        "dims": [(-45, 301, "301'", -4, 4), (-16, 457, "457'*", -8, 2), (0, 461, "461'", 12, -2), (22, 407, "407'", 8, 2), (45, 295, "295'*", 4, 4)],
        "extra_fn": _extra_yankee_frieze,
    },
    {
        "slug": "bp_yankee_modern",
        "plate_code": "BB-04",
        "scale": 0.43,
        "badge_left": "RF PORCH: 314'",
        "badge_right": "OPENED 2009",
        "wall_pts": [(-45, 318), (-24, 399), (-8, 406), (0, 408), (12, 398), (24, 385), (45, 314)],
        "highlight_slice": (5, 6),
        "dims": [(-45, 318, "318'", -4, 4), (-24, 399, "399'", -4, -2), (0, 408, "408'", 0, -4), (24, 385, "385'", 6, -2), (45, 314, "314'*", 4, 4)],
        "extra_fn": _extra_yankee_frieze,
    },
    {
        "slug": "bp_oracle",
        "plate_code": "BB-05",
        "scale": 0.42,
        "badge_left": "RF BRICK WALL: 24 FT",
        "badge_right": "OPENED 2000",
        "wall_pts": [(-45, 339), (-26, 364), (-8, 388), (0, 391), (16, 415), (30, 365), (45, 309)],
        "highlight_slice": (4, 6),
        "dims": [(-45, 339, "339'", -4, 4), (-26, 364, "364'", -4, -2), (0, 391, "391'", -4, -4), (16, 415, "415'*", 4, -4), (45, 309, "309'*", 4, 4)],
        "extra_fn": _extra_oracle,
    },
    {
        "slug": "bp_dodger",
        "plate_code": "BB-06",
        "scale": 0.43,
        "badge_left": "SYMMETRICAL PLAN",
        "badge_right": "OPENED 1962",
        "wall_pts": [(-45, 330), (-30, 360), (-20, 375), (-10, 390), (0, 395), (10, 390), (20, 375), (30, 360), (45, 330)],
        "highlight_slice": None,
        "dims": [(-45, 330, "330'", -4, 4), (-20, 375, "375'", -8, -4), (0, 395, "395'", 0, -4), (20, 375, "375'", 8, -4), (45, 330, "330'", 4, 4)],
        "extra_fn": _extra_dodger,
    },
    {
        "slug": "bp_camden",
        "plate_code": "BB-07",
        "scale": 0.425,
        "badge_left": "RF WALL: 25 FT",
        "badge_right": "OPENED 1992",
        "wall_pts": [(-45, 333), (-34, 384), (-20, 384), (-6, 396), (0, 400), (16, 373), (32, 344), (45, 318)],
        "highlight_slice": (6, 7),
        "dims": [(-45, 333, "333'", -4, 4), (-28, 384, "384'", -6, -2), (0, 400, "400'", 0, -4), (16, 373, "373'", 4, -4), (45, 318, "318'*", 2, 10)],
        "extra_fn": _extra_camden,
    },
    {
        "slug": "bp_polo_grounds",
        "plate_code": "BB-08",
        "scale": 0.375,
        "badge_left": "BATHTUB OVAL PLAN",
        "badge_right": "REBUILT 1911",
        "wall_pts": [(-45, 279), (-29, 365), (-18, 450), (-6, 476), (0, 483), (6, 476), (18, 449), (29, 355), (45, 258)],
        "highlight_slice": (3, 5),
        "dims": [(-45, 279, "279'*", -4, 4), (-18, 450, "450'", -10, 0), (0, 483, "483'*", 0, 26), (18, 449, "449'", 10, 0), (45, 258, "258'*", 4, 4)],
        "extra_fn": _extra_polo_grounds,
    },
    {
        "slug": "bp_astrodome",
        "plate_code": "BB-09",
        "scale": 0.415,
        "badge_left": "SPAN: 642' · CROWN: 208'",
        "badge_right": "OPENED 1965",
        "wall_pts": [(-45, 340), (-26, 378), (-12, 398), (0, 406), (12, 398), (26, 378), (45, 340)],
        "highlight_slice": None,
        "dims": [(-45, 340, "340'", -6, 6), (-26, 378, "378'", -6, -2), (0, 406, "406'", 0, -4), (26, 378, "378'", 6, -2), (45, 340, "340'", 6, 6)],
        "extra_fn": _extra_astrodome,
    },
    {
        "slug": "bp_tiger_stadium",
        "plate_code": "BB-10",
        "scale": 0.41,
        "badge_left": "CF FLAGPOLE IN PLAY",
        "badge_right": "OPENED 1912",
        "wall_pts": [(-45, 340), (-26, 365), (-12, 414), (0, 440), (12, 405), (26, 370), (45, 325)],
        "highlight_slice": (2, 4),
        "dims": [(-45, 340, "340'", -4, 4), (-26, 365, "365'", -6, -2), (0, 440, "440'*", 0, -4), (26, 370, "370'", 6, -2), (45, 325, "325'", 4, 4)],
        "extra_fn": _extra_tiger,
    },
    {
        "slug": "bp_kauffman",
        "plate_code": "BB-11",
        "scale": 0.42,
        "badge_left": "WATER SPECTACULAR",
        "badge_right": "OPENED 1973",
        "wall_pts": [(-45, 330), (-24, 387), (-10, 404), (0, 410), (10, 404), (24, 387), (45, 330)],
        "highlight_slice": None,
        "dims": [(-45, 330, "330'", -4, 4), (-24, 387, "387'", -8, -4), (0, 410, "410'", 0, 28), (24, 387, "387'", 8, -4), (45, 330, "330'", 4, 4)],
        "extra_fn": _extra_kauffman,
    },
    {
        "slug": "bp_coors",
        "plate_code": "BB-12",
        "scale": 0.415,
        "badge_left": "ELEV: 5,200 FT",
        "badge_right": "OPENED 1995",
        "wall_pts": [(-45, 347), (-25, 390), (-10, 408), (0, 415), (14, 394), (26, 375), (45, 350)],
        "highlight_slice": (1, 4),
        "dims": [(-45, 347, "347'", -4, 4), (-25, 390, "390'", -6, -2), (0, 415, "415'", -16, -2), (26, 375, "375'", 6, -2), (45, 350, "350'", 4, 4)],
        "extra_fn": _extra_coors,
    },
    {
        "slug": "bp_ebbets",
        "plate_code": "BB-13",
        "scale": 0.43,
        "badge_left": "RF ANGLED WALL: 38 FT",
        "badge_right": "OPENED 1913",
        "wall_pts": [(-45, 348), (-24, 384), (0, 393), (18, 352), (32, 318), (45, 297)],
        "highlight_slice": (3, 5),
        "dims": [(-45, 348, "348'", -4, 4), (-24, 384, "384'", -6, -2), (0, 393, "393'", 0, -4), (18, 352, "352'", 6, -2), (45, 297, "297'*", 4, 4)],
        "extra_fn": _extra_ebbets,
    },
    {
        "slug": "bp_pnc_park",
        "plate_code": "BB-14",
        "scale": 0.42,
        "badge_left": "RF WALL: 21 FT",
        "badge_right": "OPENED 2001",
        "wall_pts": [(-45, 325), (-24, 389), (-12, 410), (0, 399), (18, 375), (34, 344), (45, 320)],
        "highlight_slice": (4, 6),
        "dims": [(-45, 325, "325'", -4, 4), (-12, 410, "410'*", -8, -4), (0, 399, "399'", 10, -2), (20, 375, "375'", 8, 2), (45, 320, "320'*", 4, 4)],
        "extra_fn": _extra_pnc,
    },
    {
        "slug": "bp_petco_park",
        "plate_code": "BB-15",
        "scale": 0.43,
        "badge_left": "HISTORIC LF CORNER",
        "badge_right": "OPENED 2004",
        "wall_pts": [(-45, 336), (-26, 386), (-8, 394), (0, 396), (18, 382), (32, 352), (45, 322)],
        "highlight_slice": (0, 1),
        "dims": [(-45, 336, "336'*", -12, -26), (-26, 386, "386'", -6, -2), (0, 396, "396'", 0, -4), (18, 382, "382'", 6, -2), (45, 322, "322'", 4, 4)],
        "extra_fn": _extra_petco,
    },
    {
        "slug": "bp_busch_stadium",
        "plate_code": "BB-16",
        "scale": 0.425,
        "badge_left": "SKYLINE ARCH AXIS",
        "badge_right": "OPENED 2006",
        "wall_pts": [(-45, 336), (-24, 375), (-8, 395), (0, 400), (12, 392), (24, 375), (45, 335)],
        "highlight_slice": None,
        "dims": [(-45, 336, "336'", -4, 4), (-24, 375, "375'", -6, -2), (0, 400, "400'", -4, -4), (24, 375, "375'", 6, 4), (45, 335, "335'", 4, 4)],
        "extra_fn": _extra_busch,
    },
    {
        "slug": "bp_comerica_park",
        "plate_code": "BB-17",
        "scale": 0.42,
        "badge_left": "INFIELD DIRT STRIP",
        "badge_right": "OPENED 2000",
        "wall_pts": [(-45, 345), (-25, 370), (-10, 402), (0, 412), (12, 396), (26, 365), (45, 330)],
        "highlight_slice": (2, 4),
        "dims": [(-45, 345, "345'", -4, 4), (-25, 370, "370'", -6, -2), (0, 412, "412'*", 0, -4), (26, 365, "365'", 6, -2), (45, 330, "330'", 4, 4)],
        "keyhole_path": True,
    },
    {
        "slug": "bp_rogers_centre",
        "plate_code": "BB-18",
        "scale": 0.415,
        "badge_left": "RETRACTABLE 4-PANEL DOME",
        "badge_right": "OPENED 1989",
        "wall_pts": [(-45, 328), (-24, 368), (-10, 394), (0, 400), (10, 392), (24, 359), (45, 328)],
        "highlight_slice": None,
        "dims": [(-45, 328, "328'", -4, 4), (-24, 368, "368'", -6, -2), (0, 400, "400'", 0, -4), (24, 359, "359'", 6, -2), (45, 328, "328'", 4, 4)],
        "extra_fn": _extra_rogers,
    },
    {
        "slug": "bp_citi_field",
        "plate_code": "BB-19",
        "scale": 0.42,
        "badge_left": "RCF WALKWAY BRIDGE",
        "badge_right": "OPENED 2009",
        "wall_pts": [(-45, 335), (-26, 358), (-10, 398), (0, 408), (16, 390), (26, 375), (45, 330)],
        "highlight_slice": (4, 6),
        "dims": [(-45, 335, "335'", -4, 4), (-26, 358, "358'", -6, -2), (0, 408, "408'", -22, 4), (26, 375, "375'", 6, 4), (45, 330, "330'", 4, 4)],
        "extra_fn": _extra_citi,
    },
    {
        "slug": "bp_chase_field",
        "plate_code": "BB-20",
        "scale": 0.42,
        "badge_left": "CF WALL: 25 FT",
        "badge_right": "OPENED 1998",
        "wall_pts": [(-45, 330), (-24, 376), (-8, 404), (0, 407), (10, 400), (24, 376), (45, 335)],
        "highlight_slice": (2, 4),
        "dims": [(-45, 330, "330'", -4, 4), (-24, 376, "376'", -6, -2), (0, 407, "407'*", 0, -4), (24, 376, "376'", 6, -2), (45, 335, "335'", 4, 4)],
        "extra_fn": _extra_chase,
    },
]


# ============================================================================
# GROUP B: 44 BESPOKE MULTI-DOMAIN VISUAL BLUEPRINT RENDERERS
# ============================================================================

def _svg_arch_parthenon() -> str:
    # Octastyle 8x17 Doric peripteral colonnade plan (left) + Pediment Elevation 4:9 (right)
    cols: List[str] = []
    # Floorplan: 8 columns across (x=46..172), 17 columns along (y=46..244)
    xs = [48 + i * 18 for i in range(8)]
    ys = [46 + j * 12.2 for j in range(17)]
    for i, x in enumerate(xs):
        for j, y in enumerate(ys):
            if i in (0, 7) or j in (0, 16):
                cols.append(f'    <circle cx="{x:.1f}" cy="{y:.1f}" r="3.4" fill="#10213b" stroke="#e5c16c" stroke-width="1.15"/>')
    # Inner cella (naos + opisthodomos)
    cella = (
        '    <rect x="66" y="70" width="90" height="148" fill="#0c192f" stroke="#4cc9f0" stroke-width="1.4"/>\n'
        '    <line x1="66" y1="168" x2="156" y2="168" stroke="#4cc9f0" stroke-width="1.2"/>\n'
        '    <rect x="86" y="88" width="50" height="62" fill="none" stroke="#e5c16c" stroke-dasharray="3 2" stroke-width="0.9"/>\n'
    )
    # Right elevation: 8 fluted Doric columns + entablature + triangular pediment
    elev_cols: List[str] = []
    for k in range(8):
        cx = 236 + k * 27.5
        elev_cols.append(
            f'    <rect x="{cx - 5:.1f}" y="142" width="10" height="82" fill="#102039" stroke="#e5c16c" stroke-width="1.2"/>\n'
            f'    <rect x="{cx - 7.5:.1f}" y="137" width="15" height="5" fill="#e5c16c" fill-opacity="0.35" stroke="#e5c16c" stroke-width="0.9"/>'
        )
    body = (
        '  <g>\n'
        '    <rect x="38" y="36" width="146" height="218" fill="none" stroke="#e5c16c" stroke-opacity="0.5" stroke-width="1.1"/>\n'
        + cella
        + "\n".join(cols) + "\n"
        '    <!-- East Facade Octastyle Elevation -->\n'
        '    <polygon points="222,124 332,80 442,124" fill="#0d1c34" stroke="#4cc9f0" stroke-width="1.9" filter="url(#glowCyan)"/>\n'
        '    <polygon points="236,120 332,87 428,120" fill="none" stroke="#e5c16c" stroke-width="0.9"/>\n'
        '    <rect x="226" y="124" width="212" height="13" fill="#0f213d" stroke="#e5c16c" stroke-width="1.2"/>\n'
        + "\n".join(elev_cols) + "\n"
        '    <rect x="222" y="224" width="220" height="8" fill="#102038" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '    <rect x="216" y="232" width="232" height="8" fill="#0d1a30" stroke="#e5c16c" stroke-width="1.1"/>\n'
        '    <rect x="210" y="240" width="244" height="8" fill="#0a1426" stroke="#e5c16c" stroke-width="1.0"/>\n'
        '    <text x="111" y="264" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.5" text-anchor="middle">8 × 17 PERIPTERAL PLAN</text>\n'
        '    <text x="332" y="68" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">RATIO 4 : 9 · 447–432 BCE</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-01", "CLASSICAL ELEVATION")


def _svg_arch_taj_mahal() -> str:
    # Central onion dome flanked by 4 slender symmetrical corner minarets + reflecting pool axis
    minarets = [(72, 232, 92), (124, 232, 114), (356, 232, 114), (408, 232, 92)]
    m_svg: List[str] = []
    for mx, my_bot, my_top in minarets:
        m_svg.append(
            f'    <polygon points="{mx-5},{my_bot} {mx-3},{my_top} {mx+3},{my_top} {mx+5},{my_bot}" fill="#10203a" stroke="#e5c16c" stroke-width="1.2"/>\n'
            f'    <line x1="{mx-6}" y1="{my_top+24}" x2="{mx+6}" y2="{my_top+24}" stroke="#4cc9f0" stroke-width="1.1"/>\n'
            f'    <line x1="{mx-6}" y1="{my_top+56}" x2="{mx+6}" y2="{my_top+56}" stroke="#4cc9f0" stroke-width="1.1"/>\n'
            f'    <path d="M {mx-4},{my_top} Q {mx},{my_top-12} {mx+4},{my_top}" fill="#122745" stroke="#e5c16c" stroke-width="1.1"/>\n'
            f'    <line x1="{mx}" y1="{my_top-12}" x2="{mx}" y2="{my_top-20}" stroke="#e5c16c" stroke-width="1"/>'
        )
    body = (
        '  <g>\n'
        '    <!-- Symmetry Axis -->\n'
        '    <line x1="240" y1="28" x2="240" y2="262" stroke="#4cc9f0" stroke-opacity="0.3" stroke-dasharray="4 4" stroke-width="0.9"/>\n'
        '    <!-- Marble Plinth -->\n'
        '    <rect x="60" y="232" width="360" height="12" fill="#0d1d34" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <!-- Four Corner Minarets -->\n'
        + "\n".join(m_svg) + "\n"
        '    <!-- Main Mausoleum Facade & Pishtaq Iwan -->\n'
        '    <rect x="150" y="144" width="180" height="88" fill="#0f213d" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <rect x="206" y="132" width="68" height="100" fill="#0c1b33" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <path d="M 218 232 L 218 178 Q 240 144 262 178 L 262 232 Z" fill="#070e1d" stroke="#4cc9f0" stroke-width="1.5"/>\n'
        '    <!-- Side Stacked Pointed Arches -->\n'
        '    <path d="M 164 232 L 164 202 Q 178 188 192 202 L 192 232" fill="none" stroke="#e5c16c" stroke-width="1.1"/>\n'
        '    <path d="M 164 182 L 164 162 Q 178 150 192 162 L 192 182" fill="none" stroke="#e5c16c" stroke-width="1.0"/>\n'
        '    <path d="M 288 232 L 288 202 Q 302 188 316 202 L 316 232" fill="none" stroke="#e5c16c" stroke-width="1.1"/>\n'
        '    <path d="M 288 182 L 288 162 Q 302 150 316 162 L 316 182" fill="none" stroke="#e5c16c" stroke-width="1.0"/>\n'
        '    <!-- Bulbous Onion Dome + Twin Chhatris -->\n'
        '    <path d="M 198 132 C 194 94 218 68 240 50 C 262 68 286 94 282 132 Z" fill="#112746" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <line x1="240" y1="50" x2="240" y2="33" stroke="#e5c16c" stroke-width="1.6"/>\n'
        '    <path d="M 164 144 Q 178 122 192 144" fill="#10203a" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '    <path d="M 288 144 Q 302 122 316 144" fill="#10203a" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '    <!-- Reflecting Pool Mirror Lines -->\n'
        '    <polygon points="222,244 258,244 274,264 206,264" fill="#0b2840" stroke="#4cc9f0" stroke-width="1.0" stroke-opacity="0.78"/>\n'
        '    <text x="86" y="42" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold">H: 73 M · 4 MINARETS</text>\n'
        '    <text x="394" y="42" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.8" text-anchor="middle">1632–1653 CE</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-02", "SYMMETRIC ELEVATION")


def _svg_arch_sydney_opera() -> str:
    # Interlocking ribbed spherical-section precast concrete sail shells over podium + water
    body = (
        '  <g>\n'
        '    <!-- Harbor Waterline -->\n'
        '    <path d="M 26 244 Q 80 238 134 244 Q 188 250 242 244 Q 296 238 350 244 Q 404 250 454 244" fill="none" stroke="#4cc9f0" stroke-opacity="0.55" stroke-width="1.2"/>\n'
        '    <!-- Concrete Monumental Podium -->\n'
        '    <polygon points="38,236 62,212 418,212 442,236" fill="#0d1c34" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <line x1="56" y1="224" x2="424" y2="224" stroke="#e5c16c" stroke-opacity="0.4" stroke-width="0.9"/>\n'
        '    <!-- Left Cluster: Large Concert Hall Sails -->\n'
        '    <path d="M 78 212 C 88 158 122 108 176 74 C 156 126 154 172 162 212 Z" fill="#102644" stroke="#4cc9f0" stroke-width="2.1" filter="url(#glowCyan)"/>\n'
        '    <path d="M 146 212 C 156 140 190 88 254 56 C 232 114 228 168 238 212 Z" fill="#112b4d" stroke="#4cc9f0" stroke-width="2.3" filter="url(#glowCyan)"/>\n'
        '    <path d="M 226 212 C 234 156 260 112 308 86 C 288 134 282 176 286 212 Z" fill="#0e223e" stroke="#e5c16c" stroke-width="1.6"/>\n'
        '    <!-- Right Cluster: Secondary & Restaurant Sails -->\n'
        '    <path d="M 284 212 C 296 164 324 128 368 104 C 350 148 346 180 350 212 Z" fill="#102644" stroke="#4cc9f0" stroke-width="1.9"/>\n'
        '    <path d="M 352 212 C 362 176 382 148 416 132 C 402 166 398 188 400 212 Z" fill="#0d1f38" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <!-- Spherical Rib Geometry Construction Arc -->\n'
        '    <path d="M 122 72 A 145 145 0 0 1 356 88" fill="none" stroke="#e5c16c" stroke-opacity="0.38" stroke-dasharray="4 3" stroke-width="1.0"/>\n'
        '    <text x="240" y="38" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">SPHERICAL PRECAST SHELL VAULTS · R = 75.2 M</text>\n'
        '    <text x="240" y="262" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.5" text-anchor="middle">OPENED 1973 · HARBOR PENINSULA</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-03", "EXPRESSIONIST SHELL")


def _svg_arch_colosseum() -> str:
    # Concentric elliptical amphitheater plan (left) + 4-tier arched facade elevation (right)
    spokes: List[str] = []
    for k in range(24):
        ang = math.radians(k * 15)
        x1 = 136 + math.cos(ang) * 46
        y1 = 152 + math.sin(ang) * 34
        x2 = 136 + math.cos(ang) * 96
        y2 = 152 + math.sin(ang) * 76
        spokes.append(
            f'    <line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#e5c16c" stroke-opacity="0.45" stroke-width="0.9"/>'
        )
    # Right elevation: 4 stacked tiers of travertine arcades
    arches: List[str] = []
    for row_i, y_bot in enumerate((222, 184, 146)):
        for col_i in range(6):
            ax = 264 + col_i * 30
            arches.append(
                f'    <path d="M {ax} {y_bot} L {ax} {y_bot-20} A 9 9 0 0 1 {ax+18} {y_bot-20} L {ax+18} {y_bot}" fill="#070e1d" stroke="#e5c16c" stroke-width="1.1"/>'
            )
    # 4th attic story rectangular bays
    for col_i in range(6):
        ax = 264 + col_i * 30
        arches.append(
            f'    <rect x="{ax+4}" y="84" width="10" height="14" fill="#070e1d" stroke="#4cc9f0" stroke-width="1.0"/>'
        )
    body = (
        '  <g>\n'
        '    <!-- Elliptical Floorplan 189m x 156m -->\n'
        '    <ellipse cx="136" cy="152" rx="96" ry="76" fill="#0c1a31" stroke="#4cc9f0" stroke-width="2.0" filter="url(#glowCyan)"/>\n'
        '    <ellipse cx="136" cy="152" rx="76" ry="59" fill="none" stroke="#e5c16c" stroke-width="1.1"/>\n'
        '    <ellipse cx="136" cy="152" rx="58" ry="44" fill="none" stroke="#e5c16c" stroke-opacity="0.7" stroke-width="0.9"/>\n'
        + "\n".join(spokes) + "\n"
        '    <ellipse cx="136" cy="152" rx="46" ry="34" fill="#070f1f" stroke="#4cc9f0" stroke-width="1.5"/>\n'
        '    <line x1="94" y1="152" x2="178" y2="152" stroke="#4cc9f0" stroke-opacity="0.5" stroke-dasharray="3 2"/>\n'
        '    <line x1="136" y1="120" x2="136" y2="184" stroke="#4cc9f0" stroke-opacity="0.5" stroke-dasharray="3 2"/>\n'
        '    <!-- 4-Tier Facade Cutaway Elevation -->\n'
        '    <rect x="256" y="72" width="188" height="150" fill="#0f203b" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <line x1="254" y1="108" x2="446" y2="108" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <line x1="254" y1="146" x2="446" y2="146" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <line x1="254" y1="184" x2="446" y2="184" stroke="#e5c16c" stroke-width="1.4"/>\n'
        + "\n".join(arches) + "\n"
        '    <text x="136" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold" text-anchor="middle">ELLIPSE 189 M × 156 M</text>\n'
        '    <text x="350" y="54" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.8" text-anchor="middle">4-TIER ARCADE · H: 48.5 M</text>\n'
        '    <text x="240" y="254" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">INAUGURATED 80 CE · 80 ENTRANCE ARCHES</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-04", "AMPHITHEATRE PLAN")


def _svg_arch_eiffel_tower() -> str:
    # Exponentially curved wrought-iron lattice tower with 3 observation decks
    body = (
        '  <g>\n'
        '    <!-- Height Datum Hairlines -->\n'
        '    <line x1="88" y1="252" x2="392" y2="252" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <line x1="120" y1="210" x2="386" y2="210" stroke="#4cc9f0" stroke-opacity="0.4" stroke-dasharray="3 3"/>\n'
        '    <line x1="140" y1="168" x2="386" y2="168" stroke="#4cc9f0" stroke-opacity="0.4" stroke-dasharray="3 3"/>\n'
        '    <line x1="168" y1="68" x2="386" y2="68" stroke="#4cc9f0" stroke-opacity="0.4" stroke-dasharray="3 3"/>\n'
        '    <!-- Outer Exponential Silhouette Curves -->\n'
        '    <path d="M 156 252 C 190 212 222 152 233 48 L 247 48 C 258 152 290 212 324 252" fill="#0f213b" fill-opacity="0.6" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <!-- Inner Base Arch & Inter-leg Void -->\n'
        '    <path d="M 192 252 Q 240 202 288 252" fill="#070c18" stroke="#e5c16c" stroke-width="1.6"/>\n'
        '    <polygon points="212,210 268,210 256,168 224,168" fill="#081020" stroke="#e5c16c" stroke-width="1.1"/>\n'
        '    <!-- Cross Lattice Trusses -->\n'
        '    <path d="M 176 238 L 208 210 M 304 238 L 272 210 M 224 168 L 250 132 M 256 168 L 230 132 M 230 132 L 248 98 M 250 132 L 232 98 M 232 98 L 246 68 M 248 98 L 234 68" stroke="#e5c16c" stroke-opacity="0.65" stroke-width="0.9"/>\n'
        '    <!-- 3 Observation Deck Platforms -->\n'
        '    <rect x="188" y="206" width="104" height="7" fill="#13294a" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <rect x="206" y="164" width="68" height="6" fill="#13294a" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <rect x="228" y="64" width="24" height="6" fill="#13294a" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <!-- Spire & Broadcast Antenna -->\n'
        '    <line x1="240" y1="48" x2="240" y2="26" stroke="#4cc9f0" stroke-width="1.8" filter="url(#glowCyan)"/>\n'
        '    <!-- Elevation Readouts -->\n'
        '    <text x="394" y="213" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.5">DECK 1 · 57 M</text>\n'
        '    <text x="394" y="171" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.5">DECK 2 · 115 M</text>\n'
        '    <text x="394" y="71" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.5">DECK 3 · 276 M</text>\n'
        '    <text x="96" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold">WROUGHT IRON</text>\n'
        '    <text x="96" y="66" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4">18,038 PIECES</text>\n'
        '    <text x="96" y="78" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4">BUILT 1887–1889</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-05", "LATTICE ELEVATION")


def _svg_arch_sagrada_familia() -> str:
    # Parabolic spindle towers (4+4+4+4+1+1 = 18 spires) culminating in 172.5m central hyperboloid
    towers = [
        (114, 240, 126, 12, "#e5c16c"),
        (134, 240, 114, 12, "#e5c16c"),
        (154, 240, 114, 12, "#e5c16c"),
        (174, 240, 126, 12, "#e5c16c"),
        (206, 240, 84, 16, "#4cc9f0"),
        (240, 240, 36, 24, "#4cc9f0"),
        (274, 240, 84, 16, "#4cc9f0"),
        (306, 240, 126, 12, "#e5c16c"),
        (326, 240, 114, 12, "#e5c16c"),
        (346, 240, 114, 12, "#e5c16c"),
        (366, 240, 126, 12, "#e5c16c"),
    ]
    t_svg: List[str] = []
    for tx, yb, yt, w, col in towers:
        hw = w / 2.0
        t_svg.append(
            f'    <path d="M {tx-hw:.1f} {yb} Q {tx-hw*0.85:.1f} {(yb+yt)/2:.1f} {tx} {yt} Q {tx+hw*0.85:.1f} {(yb+yt)/2:.1f} {tx+hw:.1f} {yb} Z" fill="#0f213d" fill-opacity="0.82" stroke="{col}" stroke-width="1.35"/>\n'
            f'    <circle cx="{tx}" cy="{yt-4}" r="2.6" fill="{col}"/>'
        )
    body = (
        '  <g>\n'
        '    <!-- Catenary Inverted Arch Reference Curve -->\n'
        '    <path d="M 88 240 Q 240 20 392 240" fill="none" stroke="#4cc9f0" stroke-opacity="0.28" stroke-dasharray="5 3" stroke-width="1.1"/>\n'
        '    <line x1="78" y1="240" x2="402" y2="240" stroke="#e5c16c" stroke-width="1.5"/>\n'
        + "\n".join(t_svg) + "\n"
        '    <!-- Central Star/Cross Finial & Hyperboloid Ribbing -->\n'
        '    <line x1="240" y1="22" x2="240" y2="36" stroke="#7ce2ff" stroke-width="1.8" filter="url(#glowCyan)"/>\n'
        '    <line x1="234" y1="28" x2="246" y2="28" stroke="#7ce2ff" stroke-width="1.8" filter="url(#glowCyan)"/>\n'
        '    <text x="74" y="48" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold">18 SPINDLE SPIRES</text>\n'
        '    <text x="74" y="60" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4">BEGUN 1882</text>\n'
        '    <text x="406" y="48" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="end">APEX: 172.5 M</text>\n'
        '    <text x="406" y="60" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="end">CATENARY VAULTING</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-06", "HYPERBOLOID ELEVATION")


def _svg_arch_great_pyramid() -> str:
    # Exact 51.8-degree slope cross-section with Descending, Grand Gallery, King/Queen/Subterranean chambers + star shafts!
    body = (
        '  <g>\n'
        '    <!-- Ground Horizon -->\n'
        '    <line x1="36" y1="232" x2="444" y2="232" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <!-- Outer Pyramid Triangle (51.8 deg slope, base 310px, height 196px -> ~51.7 deg) -->\n'
        '    <polygon points="85,232 240,36 395,232" fill="#0d1b32" stroke="#e5c16c" stroke-width="2.1" filter="url(#glowGold)"/>\n'
        '    <!-- Masonry Course Hairlines -->\n'
        '    <line x1="116" y1="193" x2="364" y2="193" stroke="#e5c16c" stroke-opacity="0.16" stroke-width="0.7"/>\n'
        '    <line x1="147" y1="154" x2="333" y2="154" stroke="#e5c16c" stroke-opacity="0.16" stroke-width="0.7"/>\n'
        '    <line x1="178" y1="115" x2="302" y2="115" stroke="#e5c16c" stroke-opacity="0.16" stroke-width="0.7"/>\n'
        '    <!-- Internal Passages & Chambers (Glowing Sapphire Cyan) -->\n'
        '    <g stroke="#4cc9f0" fill="none" filter="url(#glowCyan)">\n'
        '      <!-- Entrance & Descending Passage to Subterranean Chamber -->\n'
        '      <polyline points="116,192 224,254 252,254" stroke-width="2.0"/>\n'
        '      <rect x="252" y="246" width="24" height="14" fill="#091a30" stroke-width="1.6"/>\n'
        '      <!-- Ascending Passage + Horizontal Passage to Queen Chamber -->\n'
        '      <polyline points="154,214 206,184 246,184" stroke-width="2.0"/>\n'
        '      <rect x="246" y="176" width="18" height="13" fill="#091a30" stroke-width="1.6"/>\n'
        '      <!-- Corbelled Grand Gallery rising to King Chamber -->\n'
        '      <polyline points="206,184 252,150 264,150" stroke-width="3.6"/>\n'
        '      <!-- Upper Burial Chamber with Relieving Beams -->\n'
        '      <rect x="264" y="138" width="26" height="16" fill="#091a30" stroke-width="1.8"/>\n'
        '      <line x1="264" y1="133" x2="290" y2="133" stroke-width="1.0"/>\n'
        '      <line x1="264" y1="129" x2="290" y2="129" stroke-width="1.0"/>\n'
        '      <!-- Dual Astronomical Air Shafts -->\n'
        '      <line x1="266" y1="142" x2="176" y2="116" stroke-width="1.0" stroke-dasharray="3 2"/>\n'
        '      <line x1="288" y1="142" x2="334" y2="114" stroke-width="1.0" stroke-dasharray="3 2"/>\n'
        '    </g>\n'
        '    <!-- Slope Angle Arc -->\n'
        '    <path d="M 118 232 A 33 33 0 0 0 105 206" fill="none" stroke="#f4e6be" stroke-width="1.2"/>\n'
        '    <text x="122" y="224" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.5" font-weight="bold">51.8°</text>\n'
        '    <text x="64" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold">H: 146.6 M</text>\n'
        '    <text x="64" y="66" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4">BASE: 230.4 M</text>\n'
        '    <text x="416" y="54" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.5" text-anchor="end">3 CHAMBERS</text>\n'
        '    <text x="416" y="66" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="end">c. 2560 BCE</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-07", "SECTIONAL CUTAWAY")


def _svg_arch_hagia_sophia() -> str:
    # Pendentive central dome (31.8m) on square base flanked by two huge longitudinal semi-domes + 4 minarets
    body = (
        '  <g>\n'
        '    <!-- Left: Pendentive Floorplan (Dome over Square + 2 Semi-Domes) -->\n'
        '    <rect x="44" y="76" width="166" height="148" fill="#0c192f" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <!-- Central Square & Inscribed Pendentive Dome -->\n'
        '    <rect x="85" y="108" width="84" height="84" fill="#10223e" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <circle cx="127" cy="150" r="42" fill="#0d233d" stroke="#4cc9f0" stroke-width="2.1" filter="url(#glowCyan)"/>\n'
        '    <circle cx="127" cy="150" r="32" fill="none" stroke="#4cc9f0" stroke-dasharray="3 3" stroke-width="0.9"/>\n'
        '    <!-- East & West Longitudinal Semi-Domes -->\n'
        '    <path d="M 85 108 A 42 42 0 0 0 85 192" fill="#0e1e36" stroke="#4cc9f0" stroke-width="1.6"/>\n'
        '    <path d="M 169 108 A 42 42 0 0 1 169 192" fill="#0e1e36" stroke="#4cc9f0" stroke-width="1.6"/>\n'
        '    <!-- 4 Corner Piers -->\n'
        '    <rect x="81" y="104" width="9" height="9" fill="#e5c16c"/>\n'
        '    <rect x="164" y="104" width="9" height="9" fill="#e5c16c"/>\n'
        '    <rect x="81" y="187" width="9" height="9" fill="#e5c16c"/>\n'
        '    <rect x="164" y="187" width="9" height="9" fill="#e5c16c"/>\n'
        '    <!-- Right: Longitudinal Dome Cascade + 4 Pencil Minarets -->\n'
        '    <line x1="242" y1="224" x2="452" y2="224" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <rect x="274" y="168" width="146" height="56" fill="#0e1f38" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <path d="M 274 168 Q 302 128 320 132" fill="#102542" stroke="#4cc9f0" stroke-width="1.5"/>\n'
        '    <path d="M 420 168 Q 392 128 374 132" fill="#102542" stroke="#4cc9f0" stroke-width="1.5"/>\n'
        '    <path d="M 312 136 A 36 32 0 0 1 382 136 Z" fill="#122c4d" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <!-- Pencil Minarets -->\n'
        '    <polygon points="256,224 259,88 263,88 266,224" fill="#10203a" stroke="#e5c16c" stroke-width="1.1"/>\n'
        '    <polygon points="259,88 261,70 263,88" fill="#e5c16c"/>\n'
        '    <polygon points="428,224 431,88 435,88 438,224" fill="#10203a" stroke="#e5c16c" stroke-width="1.1"/>\n'
        '    <polygon points="431,88 433,70 435,88" fill="#e5c16c"/>\n'
        '    <text x="127" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="middle">PENDENTIVE DOME · Ø 31.8 M</text>\n'
        '    <text x="347" y="54" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="middle">COMPLETED 537 CE · H: 55.6 M</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-08", "PENDENTIVE BASILICA")


def _svg_arch_pantheon_rome() -> str:
    # Exact cross-section showing a 43.3 m perfect inscribed sphere inside the rotunda + 8.7 m open oculus light beam!
    body = (
        '  <g>\n'
        '    <!-- Rotunda Floor -->\n'
        '    <line x1="72" y1="244" x2="408" y2="244" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <!-- Massive Concrete Drum Walls -->\n'
        '    <rect x="128" y="144" width="22" height="100" fill="#13233d" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <rect x="330" y="144" width="22" height="100" fill="#13233d" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <!-- Hemispherical Coffered Unreinforced Concrete Dome with Open Oculus -->\n'
        '    <path d="M 128 144 A 112 104 0 0 1 218 42 L 222 58 A 92 86 0 0 0 150 144 Z" fill="#10203a" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <path d="M 352 144 A 112 104 0 0 0 262 42 L 258 58 A 92 86 0 0 1 330 144 Z" fill="#10203a" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <!-- Open Oculus Light Shaft Beam -->\n'
        '    <polygon points="222,42 258,42 308,244 268,244" fill="#4cc9f0" fill-opacity="0.11"/>\n'
        '    <line x1="222" y1="42" x2="258" y2="42" stroke="#7ce2ff" stroke-width="2.5" filter="url(#glowCyan)"/>\n'
        '    <!-- Exact Inscribed Perfect Sphere (Diameter = Height = 43.3 m) -->\n'
        '    <circle cx="240" cy="151" r="93" fill="none" stroke="#4cc9f0" stroke-width="2.0" stroke-dasharray="6 3" filter="url(#glowCyan)"/>\n'
        '    <line x1="147" y1="151" x2="333" y2="151" stroke="#4cc9f0" stroke-opacity="0.55" stroke-width="0.9"/>\n'
        '    <line x1="240" y1="58" x2="240" y2="244" stroke="#4cc9f0" stroke-opacity="0.55" stroke-width="0.9"/>\n'
        '    <!-- Telemetry Callouts -->\n'
        '    <text x="240" y="34" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold" text-anchor="middle">OPEN OCULUS · Ø 8.7 M</text>\n'
        '    <text x="240" y="146" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold" text-anchor="middle">Ø 43.3 M PERFECT SPHERE</text>\n'
        '    <text x="74" y="64" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4">UNREINFORCED</text>\n'
        '    <text x="74" y="76" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4">CONCRETE DOME</text>\n'
        '    <text x="412" y="64" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="end">REBUILT c. 125 CE</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-09", "SPHERICAL ROTUNDA")


def _svg_arch_angkor_wat() -> str:
    # Left: Concentric moated rectangular gallery plan with 5-tower quincunx. Right: 5 lotus-bud spire elevation!
    body = (
        '  <g>\n'
        '    <!-- Left: Concentric Moated Temple Enclosure Plan -->\n'
        '    <rect x="34" y="54" width="186" height="186" fill="#0a2036" stroke="#4cc9f0" stroke-width="1.8" filter="url(#glowCyan)"/>\n'
        '    <rect x="50" y="70" width="154" height="154" fill="#091529" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <rect x="70" y="90" width="114" height="114" fill="#0d1c34" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '    <rect x="92" y="112" width="70" height="70" fill="#122645" stroke="#4cc9f0" stroke-width="1.3"/>\n'
        '    <!-- West Causeway across Moat -->\n'
        '    <line x1="26" y1="147" x2="92" y2="147" stroke="#e5c16c" stroke-width="3.0"/>\n'
        '    <!-- Quincunx 5-Tower Nodes -->\n'
        '    <circle cx="127" cy="147" r="6.5" fill="#4cc9f0" filter="url(#glowCyan)"/>\n'
        '    <circle cx="102" cy="122" r="4.5" fill="#e5c16c"/>\n'
        '    <circle cx="152" cy="122" r="4.5" fill="#e5c16c"/>\n'
        '    <circle cx="102" cy="172" r="4.5" fill="#e5c16c"/>\n'
        '    <circle cx="152" cy="172" r="4.5" fill="#e5c16c"/>\n'
        '    <!-- Right: Lotus-Bud Quincunx Elevation -->\n'
        '    <line x1="242" y1="226" x2="452" y2="226" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <rect x="256" y="198" width="182" height="28" fill="#0e1f38" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '    <rect x="278" y="172" width="138" height="26" fill="#112440" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '    <!-- 5 Stepped Lotus Prang Towers -->\n'
        '    <path d="M 272 198 Q 278 138 286 126 Q 294 138 300 198 Z" fill="#122947" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <path d="M 304 172 Q 312 114 320 100 Q 328 114 336 172 Z" fill="#132c4d" stroke="#4cc9f0" stroke-width="1.5"/>\n'
        '    <path d="M 328 172 Q 338 92 347 68 Q 356 92 366 172 Z" fill="#153257" stroke="#4cc9f0" stroke-width="2.1" filter="url(#glowCyan)"/>\n'
        '    <path d="M 358 172 Q 366 114 374 100 Q 382 114 390 172 Z" fill="#132c4d" stroke="#4cc9f0" stroke-width="1.5"/>\n'
        '    <path d="M 394 198 Q 400 138 408 126 Q 416 138 422 198 Z" fill="#122947" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <text x="127" y="44" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="middle">162.6 HA MOATED PLAN</text>\n'
        '    <text x="347" y="44" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="middle">5-TOWER QUINCUNX · H: 65 M</text>\n'
        '  </g>'
    )
    return svg_shell(body, "AR-10", "SACRED QUINCUNX")


# --- 6 Accurate Star-Magnitude Constellation Plates (Zero Star/Constellation Names!) ---

def _render_constellation_svg(
    plate_code: str,
    stars: List[Tuple[str, float, float, float, str]],  # (id, x, y, vmag, color)
    edges: List[Tuple[str, str]],
    extra_svg: str = "",
    badge: str = "",
) -> str:
    star_map = {s[0]: (s[1], s[2], s[3], s[4]) for s in stars}
    # Subtle celestial declination / right ascension reticle arcs
    bg_stars_svg: List[str] = []
    seed = fnv1a_32(plate_code)
    for k in range(34):
        seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
        bx = 32 + (seed % 416)
        seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF
        by = 32 + (seed % 226)
        r = 0.7 + ((seed >> 16) % 10) * 0.08
        bg_stars_svg.append(f'    <circle cx="{bx}" cy="{by}" r="{r:.2f}" fill="#93c5fd" fill-opacity="0.32"/>')

    edge_svg: List[str] = []
    for a, b in edges:
        x1, y1, _, _ = star_map[a]
        x2, y2, _, _ = star_map[b]
        edge_svg.append(
            f'    <line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#4cc9f0" stroke-opacity="0.72" stroke-width="1.35"/>'
        )

    node_svg: List[str] = []
    for sid, x, y, mag, col in stars:
        # Apparent magnitude -> visual radius (mag 0 -> r=6.2, mag 4 -> r=2.4)
        rad = max(2.2, 6.2 - mag * 0.95)
        if mag <= 1.2:
            sp = rad * 2.5
            node_svg.append(
                f'    <line x1="{x-sp:.1f}" y1="{y:.1f}" x2="{x+sp:.1f}" y2="{y:.1f}" stroke="{col}" stroke-opacity="0.6" stroke-width="0.9"/>\n'
                f'    <line x1="{x:.1f}" y1="{y-sp:.1f}" x2="{x:.1f}" y2="{y+sp:.1f}" stroke="{col}" stroke-opacity="0.6" stroke-width="0.9"/>'
            )
        node_svg.append(
            f'    <circle cx="{x:.1f}" cy="{y:.1f}" r="{rad + 3.0:.1f}" fill="{col}" fill-opacity="0.18"/>\n'
            f'    <circle cx="{x:.1f}" cy="{y:.1f}" r="{rad:.1f}" fill="{col}" stroke="#ffffff" stroke-width="0.7" filter="url(#glowCyan)"/>'
        )

    legend = (
        '    <g transform="translate(24, 24)">\n'
        '      <rect x="0" y="0" width="128" height="22" rx="3" fill="#091529" stroke="#e5c16c" stroke-opacity="0.55" stroke-width="0.8"/>\n'
        '      <text x="8" y="14" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8">MAG:</text>\n'
        '      <circle cx="44" cy="11" r="4.4" fill="#7ce2ff"/><text x="52" y="14" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.5">0</text>\n'
        '      <circle cx="72" cy="11" r="3.4" fill="#7ce2ff"/><text x="79" y="14" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.5">1</text>\n'
        '      <circle cx="96" cy="11" r="2.5" fill="#7ce2ff"/><text x="103" y="14" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="7.5">2+</text>\n'
        '    </g>'
    )
    badge_svg = ""
    if badge:
        badge_svg = f'    <text x="454" y="38" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="end">{xml_esc(badge)}</text>'

    body = (
        '  <g>\n'
        '    <circle cx="240" cy="150" r="118" fill="none" stroke="#4cc9f0" stroke-opacity="0.16" stroke-dasharray="4 4"/>\n'
        + "\n".join(bg_stars_svg) + "\n"
        + extra_svg + "\n"
        + "\n".join(edge_svg) + "\n"
        + "\n".join(node_svg) + "\n"
        + legend + "\n"
        + badge_svg + "\n"
        '  </g>'
    )
    return svg_shell(body, plate_code, "CELESTIAL CHART · V-MAG")


def _svg_star_orion() -> str:
    # Accurate relative sky projection (alpha red-amber shoulder top-left, beta blue-white foot bottom-right, exact 3-star belt + sword nebula)
    stars = [
        ("alpha", 174, 78, 0.45, "#f59e0b"),   # red-gold supergiant shoulder
        ("gamma", 294, 92, 1.64, "#9ef0ff"),   # west shoulder
        ("lambda", 238, 56, 3.39, "#e5c16c"),  # head
        ("zeta", 218, 152, 1.74, "#7ce2ff"),   # belt left
        ("eps", 240, 146, 1.69, "#7ce2ff"),    # belt center
        ("delta", 262, 140, 2.25, "#7ce2ff"),  # belt right
        ("kappa", 192, 224, 2.07, "#9ef0ff"),  # east knee
        ("beta", 306, 214, 0.18, "#7ce2ff"),   # bright blue-white foot
        ("sword", 236, 182, 2.75, "#f7e4ad"),  # nebula cluster
    ]
    edges = [
        ("lambda", "alpha"), ("lambda", "gamma"),
        ("alpha", "zeta"), ("gamma", "delta"),
        ("zeta", "eps"), ("eps", "delta"),
        ("zeta", "kappa"), ("delta", "beta"),
        ("eps", "sword"),
    ]
    extra = (
        '    <ellipse cx="236" cy="182" rx="14" ry="9" fill="#4cc9f0" fill-opacity="0.22" filter="url(#glowCyan)"/>\n'
        '    <text x="150" y="70" fill="#f59e0b" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="end">α · M2 SUPERGIANT</text>\n'
        '    <text x="320" y="220" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.2">β · B8 SUPERGIANT</text>'
    )
    return _render_constellation_svg("ST-01", stars, edges, extra, "EQUATORIAL · DEC 0°")


def _svg_star_cassiopeia() -> str:
    # Unmistakable W-shaped 5-star circumpolar asterism
    stars = [
        ("beta", 92, 114, 2.28, "#f7e4ad"),
        ("alpha", 158, 198, 2.24, "#f59e0b"),
        ("gamma", 236, 134, 2.15, "#7ce2ff"),
        ("delta", 316, 192, 2.66, "#9ef0ff"),
        ("eps", 386, 108, 3.35, "#7ce2ff"),
    ]
    edges = [("beta", "alpha"), ("alpha", "gamma"), ("gamma", "delta"), ("delta", "eps")]
    extra = '    <text x="240" y="246" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">5-STAR CIRCUMPOLAR W-ASTERISM</text>'
    return _render_constellation_svg("ST-02", stars, edges, extra, "NORTHERN SKY · DEC +60°")


def _svg_star_ursa_major() -> str:
    # 7-star ladle asterism with dashed 5x pointer ray toward North Celestial Pole star!
    stars = [
        ("alkaid", 76, 152, 1.85, "#7ce2ff"),
        ("mizar", 132, 128, 2.23, "#9ef0ff"),
        ("alioth", 184, 136, 1.76, "#9ef0ff"),
        ("megrez", 232, 156, 3.32, "#e5c16c"),
        ("phecda", 244, 208, 2.41, "#9ef0ff"),
        ("merak", 322, 214, 2.34, "#9ef0ff"),
        ("dubhe", 334, 154, 1.81, "#f59e0b"),
        ("ncp", 384, 54, 1.97, "#f7e4ad"),
    ]
    edges = [
        ("alkaid", "mizar"), ("mizar", "alioth"), ("alioth", "megrez"),
        ("megrez", "phecda"), ("phecda", "merak"), ("merak", "dubhe"), ("dubhe", "megrez"),
    ]
    extra = (
        '    <line x1="322" y1="214" x2="384" y2="54" stroke="#e5c16c" stroke-width="1.3" stroke-dasharray="5 3"/>\n'
        '    <text x="396" y="58" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.2">POLE STAR (5×)</text>\n'
        '    <circle cx="138" cy="122" r="1.4" fill="#f4e6be"/>'
    )
    return _render_constellation_svg("ST-03", stars, edges, extra, "NORTHERN CIRCUMPOLAR")


def _svg_star_crux() -> str:
    # Compact kite cross (4 main + 5th offset star) with dashed southern pole pointer
    stars = [
        ("gamma", 240, 68, 1.59, "#f59e0b"),   # top red giant
        ("alpha", 240, 214, 0.77, "#7ce2ff"),  # bottom brightest star
        ("beta", 168, 134, 1.25, "#7ce2ff"),   # left bright star
        ("delta", 302, 122, 2.79, "#9ef0ff"),  # right star
        ("eps", 268, 162, 3.59, "#e5c16c"),    # fifth offset star
    ]
    edges = [("gamma", "alpha"), ("beta", "delta")]
    extra = (
        '    <line x1="240" y1="214" x2="240" y2="262" stroke="#e5c16c" stroke-width="1.2" stroke-dasharray="4 3"/>\n'
        '    <polygon points="240,265 236,257 244,257" fill="#e5c16c"/>\n'
        '    <text x="252" y="256" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8">4.5× TO SOUTH POLE</text>'
    )
    return _render_constellation_svg("ST-04", stars, edges, extra, "SMALLEST OF 88 · DEC -60°")


def _svg_star_scorpius() -> str:
    # Sweeping J-shaped fishhook curve with amber supergiant heart + twin stinger stars
    stars = [
        ("graffias", 358, 72, 2.56, "#9ef0ff"),
        ("dschubba", 346, 102, 2.29, "#9ef0ff"),
        ("pi", 340, 134, 2.89, "#9ef0ff"),
        ("antares", 292, 128, 1.06, "#f59e0b"),  # glowing amber-red supergiant heart
        ("tau", 272, 152, 2.82, "#7ce2ff"),
        ("eps", 254, 184, 2.29, "#f7e4ad"),
        ("zeta", 232, 224, 3.62, "#9ef0ff"),
        ("eta", 192, 240, 3.33, "#9ef0ff"),
        ("theta", 148, 232, 1.86, "#f7e4ad"),
        ("kappa", 122, 204, 2.39, "#7ce2ff"),
        ("shaula", 136, 174, 1.62, "#7ce2ff"),   # stinger pair
        ("lesath", 150, 178, 2.70, "#9ef0ff"),
    ]
    edges = [
        ("graffias", "dschubba"), ("dschubba", "pi"), ("dschubba", "antares"),
        ("antares", "tau"), ("tau", "eps"), ("eps", "zeta"), ("zeta", "eta"),
        ("eta", "theta"), ("theta", "kappa"), ("kappa", "shaula"), ("shaula", "lesath"),
    ]
    extra = (
        '    <text x="292" y="110" fill="#f59e0b" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">α · M1 RED SUPERGIANT</text>\n'
        '    <text x="116" y="162" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">TWIN STINGER</text>'
    )
    return _render_constellation_svg("ST-05", stars, edges, extra, "ZODIACAL · DEC -30°")


def _svg_star_cygnus() -> str:
    # Soaring cross-wing asterism straddling the Milky Way band
    stars = [
        ("deneb", 162, 66, 1.25, "#7ce2ff"),     # tail supergiant
        ("sadr", 232, 134, 2.23, "#f7e4ad"),     # center chest
        ("albireo", 336, 226, 3.05, "#f59e0b"),  # beak optical double
        ("gienah", 142, 186, 2.48, "#f7e4ad"),   # left wing
        ("delta", 322, 86, 2.86, "#9ef0ff"),     # right wing
        ("zeta", 92, 218, 3.21, "#e5c16c"),      # left wingtip
        ("iota", 364, 58, 3.76, "#9ef0ff"),      # right wingtip
    ]
    edges = [
        ("deneb", "sadr"), ("sadr", "albireo"),
        ("zeta", "gienah"), ("gienah", "sadr"), ("sadr", "delta"), ("delta", "iota"),
    ]
    extra = (
        '    <path d="M 104 42 L 386 260" stroke="#4cc9f0" stroke-opacity="0.12" stroke-width="44"/>\n'
        '    <text x="176" y="62" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="start">α · A2 SUPERGIANT</text>\n'
        '    <text x="348" y="244" fill="#f59e0b" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">β · GOLD-BLUE DOUBLE</text>'
    )
    return _render_constellation_svg("ST-06", stars, edges, extra, "GALACTIC PLANE · +42°")


# --- 8 Molecular, Biochemistry & Atomic Orbital Blueprints ---

def _svg_mol_water() -> str:
    # Bent 104.5° molecule with 2 tetrahedral lone pairs and dipole arrow (zero name spoiler)
    body = (
        '  <g>\n'
        '    <!-- Lone Pair Orbitals on Central Atom -->\n'
        '    <ellipse cx="206" cy="96" rx="22" ry="11" transform="rotate(-48 206 96)" fill="#4cc9f0" fill-opacity="0.14" stroke="#4cc9f0" stroke-dasharray="3 2" stroke-width="1.1"/>\n'
        '    <ellipse cx="274" cy="96" rx="22" ry="11" transform="rotate(48 274 96)" fill="#4cc9f0" fill-opacity="0.14" stroke="#4cc9f0" stroke-dasharray="3 2" stroke-width="1.1"/>\n'
        '    <circle cx="201" cy="89" r="2.6" fill="#7ce2ff"/><circle cx="211" cy="98" r="2.6" fill="#7ce2ff"/>\n'
        '    <circle cx="279" cy="89" r="2.6" fill="#7ce2ff"/><circle cx="269" cy="98" r="2.6" fill="#7ce2ff"/>\n'
        '    <!-- Covalent Bonds (95.8 pm, 104.5 deg angle) -->\n'
        '    <line x1="240" y1="138" x2="156" y2="206" stroke="url(#goldStroke)" stroke-width="4.2"/>\n'
        '    <line x1="240" y1="138" x2="324" y2="206" stroke="url(#goldStroke)" stroke-width="4.2"/>\n'
        '    <!-- Bond Angle Arc (104.5 deg) -->\n'
        '    <path d="M 206 165 A 44 44 0 0 0 274 165" fill="none" stroke="#4cc9f0" stroke-width="1.8" filter="url(#glowCyan)"/>\n'
        '    <text x="240" y="198" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11.5" font-weight="bold" text-anchor="middle">104.5°</text>\n'
        '    <!-- Atom Spheres (Element Symbols Only) -->\n'
        '    <circle cx="240" cy="138" r="24" fill="#102542" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <text x="240" y="144" fill="#f7e4ad" font-family="\'Georgia\',serif" font-size="18" font-weight="bold" text-anchor="middle">O</text>\n'
        '    <circle cx="156" cy="206" r="17" fill="#102138" stroke="#e5c16c" stroke-width="2.0"/>\n'
        '    <text x="156" y="211" fill="#f4e6be" font-family="\'Georgia\',serif" font-size="14" font-weight="bold" text-anchor="middle">H</text>\n'
        '    <circle cx="324" cy="206" r="17" fill="#102138" stroke="#e5c16c" stroke-width="2.0"/>\n'
        '    <text x="324" y="211" fill="#f4e6be" font-family="\'Georgia\',serif" font-size="14" font-weight="bold" text-anchor="middle">H</text>\n'
        '    <!-- Partial Dipole Annotations -->\n'
        '    <text x="240" y="54" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="10" text-anchor="middle">δ− · sp³ HYBRIDIZED</text>\n'
        '    <text x="126" y="238" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.5">δ+</text>\n'
        '    <text x="344" y="238" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.5">δ+</text>\n'
        '    <text x="380" y="156" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6">d = 95.8 pm</text>\n'
        '    <text x="380" y="170" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6">μ = 1.85 D</text>\n'
        '  </g>'
    )
    return svg_shell(body, "CH-01", "MOLECULAR GEOMETRY")


def _svg_mol_benzene() -> str:
    # Planar regular hexagonal C6H6 aromatic ring with delocalized conjugated pi-ring
    cx, cy, r_c, r_h = 240.0, 148.0, 62.0, 102.0
    c_pts = [(cx + r_c * math.cos(math.radians(k * 60 - 90)), cy + r_c * math.sin(math.radians(k * 60 - 90))) for k in range(6)]
    h_pts = [(cx + r_h * math.cos(math.radians(k * 60 - 90)), cy + r_h * math.sin(math.radians(k * 60 - 90))) for k in range(6)]
    hex_poly = " ".join(f"{x:.1f},{y:.1f}" for x, y in c_pts)
    radials = "\n".join(
        f'    <line x1="{c_pts[k][0]:.1f}" y1="{c_pts[k][1]:.1f}" x2="{h_pts[k][0]:.1f}" y2="{h_pts[k][1]:.1f}" stroke="#e5c16c" stroke-width="1.8"/>\n'
        f'    <circle cx="{h_pts[k][0]:.1f}" cy="{h_pts[k][1]:.1f}" r="11" fill="#0d1d34" stroke="#e5c16c" stroke-width="1.3"/>\n'
        f'    <text x="{h_pts[k][0]:.1f}" y="{h_pts[k][1]+4:.1f}" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="10.5" font-weight="bold" text-anchor="middle">H</text>'
        for k in range(6)
    )
    nodes = "\n".join(
        f'    <circle cx="{x:.1f}" cy="{y:.1f}" r="12" fill="#102542" stroke="#4cc9f0" stroke-width="1.5"/>\n'
        f'    <text x="{x:.1f}" y="{y+4:.1f}" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold" text-anchor="middle">C</text>'
        for x, y in c_pts
    )
    body = (
        '  <g>\n'
        + radials + "\n"
        f'    <polygon points="{hex_poly}" fill="#0c1c34" stroke="url(#goldStroke)" stroke-width="3.0"/>\n'
        f'    <circle cx="{cx}" cy="{cy}" r="39" fill="none" stroke="#4cc9f0" stroke-width="2.4" stroke-dasharray="7 4" filter="url(#glowCyan)"/>\n'
        + nodes + "\n"
        '    <text x="48" y="64" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold">BOND: 139 pm</text>\n'
        '    <text x="48" y="78" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6">ALL ANGLES: 120°</text>\n'
        '    <text x="434" y="64" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.8" text-anchor="end">6 DELOCALIZED π e⁻</text>\n'
        '    <text x="434" y="78" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="end">PLANAR RING · 1865</text>\n'
        '  </g>'
    )
    return svg_shell(body, "CH-02", "AROMATIC HYDROCARBON")


def _svg_mol_dna_helix() -> str:
    # Right-handed antiparallel helical twin ribbons with H-bond base-pair rungs, 3.4nm pitch & 2.0nm diameter!
    s1_pts: List[str] = []
    s2_pts: List[str] = []
    rungs: List[str] = []
    for i in range(65):
        t = i / 64.0
        x = 56.0 + t * 368.0
        ang = t * math.pi * 4.0
        y1 = 148.0 + math.sin(ang) * 44.0
        y2 = 148.0 + math.sin(ang + math.pi) * 44.0
        s1_pts.append(f"{x:.1f},{y1:.1f}")
        s2_pts.append(f"{x:.1f},{y2:.1f}")
        if i % 4 == 2 and abs(y1 - y2) > 14:
            dash = "3 2" if (i // 4) % 2 == 0 else "2 1.5"
            col = "#4cc9f0" if (i // 4) % 2 == 0 else "#e5c16c"
            rungs.append(
                f'    <line x1="{x:.1f}" y1="{y1:.1f}" x2="{x:.1f}" y2="{y2:.1f}" stroke="{col}" stroke-width="1.7" stroke-dasharray="{dash}"/>'
            )
    body = (
        '  <g>\n'
        + "\n".join(rungs) + "\n"
        f'    <polyline points="{" ".join(s1_pts)}" fill="none" stroke="url(#goldStroke)" stroke-width="3.6" stroke-linecap="round" filter="url(#glowGold)"/>\n'
        f'    <polyline points="{" ".join(s2_pts)}" fill="none" stroke="#4cc9f0" stroke-width="3.6" stroke-linecap="round" filter="url(#glowCyan)"/>\n'
        '    <!-- Antiparallel 5\' -> 3\' Direction Markers -->\n'
        '    <text x="42" y="144" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold">5\'</text>\n'
        '    <text x="430" y="144" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold">3\'</text>\n'
        '    <text x="42" y="164" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold">3\'</text>\n'
        '    <text x="430" y="164" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold">5\'</text>\n'
        '    <!-- Pitch & Diameter Dimension Brackets -->\n'
        '    <path d="M 102 74 L 102 64 L 286 64 L 286 74" fill="none" stroke="#e5c16c" stroke-width="1.1"/>\n'
        '    <text x="194" y="56" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold" text-anchor="middle">1 FULL TURN · 3.4 nm (10.5 BP)</text>\n'
        '    <path d="M 134 222 L 246 222" stroke="#4cc9f0" stroke-width="1.1"/>\n'
        '    <text x="190" y="236" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.5" text-anchor="middle">MAJOR GROOVE · Ø 2.0 nm</text>\n'
        '    <text x="366" y="236" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.5" text-anchor="middle">2 &amp; 3 H-BONDS</text>\n'
        '  </g>'
    )
    return svg_shell(body, "CH-03", "NUCLEIC BIOPOLYMER")


def _svg_mol_caffeine() -> str:
    # Fused 6-5 xanthine ring with 3 methyl branches & 2 carbonyl =O groups (C8H10N4O2)
    body = (
        '  <g stroke-linecap="round" stroke-linejoin="round">\n'
        '    <!-- 6-Membered Ring (N1, C2, N3, C4, C5, C6) -->\n'
        '    <polygon points="154,116 206,86 258,116 258,176 206,206 154,176" fill="#0d1e36" stroke="url(#goldStroke)" stroke-width="2.4"/>\n'
        '    <!-- Fused 5-Membered Imidazole Ring (C5, C4, N9, C8, N7) -->\n'
        '    <polygon points="258,116 316,98 352,146 316,194 258,176" fill="#0e223d" stroke="url(#goldStroke)" stroke-width="2.4"/>\n'
        '    <!-- Internal Double Bonds -->\n'
        '    <line x1="251" y1="122" x2="251" y2="170" stroke="#4cc9f0" stroke-width="2.0"/>\n'
        '    <line x1="342" y1="146" x2="314" y2="184" stroke="#4cc9f0" stroke-width="2.0"/>\n'
        '    <!-- 2 Carbonyl =O Groups (at C2 and C6) -->\n'
        '    <line x1="152" y1="172" x2="112" y2="195" stroke="#4cc9f0" stroke-width="2.2"/><line x1="157" y1="180" x2="117" y2="203" stroke="#4cc9f0" stroke-width="2.2"/>\n'
        '    <line x1="202" y1="86" x2="202" y2="48" stroke="#4cc9f0" stroke-width="2.2"/><line x1="210" y1="86" x2="210" y2="48" stroke="#4cc9f0" stroke-width="2.2"/>\n'
        '    <!-- 3 Methyl (-CH3) Branches (at N1, N3, N7) -->\n'
        '    <line x1="154" y1="116" x2="114" y2="93" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <line x1="206" y1="206" x2="206" y2="244" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <line x1="316" y1="98" x2="336" y2="60" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <!-- Heteroatom Badges -->\n'
        '    <circle cx="154" cy="116" r="11" fill="#102542" stroke="#4cc9f0" stroke-width="1.4"/><text x="154" y="120" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold" text-anchor="middle">N</text>\n'
        '    <circle cx="206" cy="206" r="11" fill="#102542" stroke="#4cc9f0" stroke-width="1.4"/><text x="206" y="210" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold" text-anchor="middle">N</text>\n'
        '    <circle cx="316" cy="98" r="11" fill="#102542" stroke="#4cc9f0" stroke-width="1.4"/><text x="316" y="102" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold" text-anchor="middle">N</text>\n'
        '    <circle cx="316" cy="194" r="11" fill="#102542" stroke="#4cc9f0" stroke-width="1.4"/><text x="316" y="198" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold" text-anchor="middle">N</text>\n'
        '    <text x="206" y="42" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="12" font-weight="bold" text-anchor="middle">O</text>\n'
        '    <text x="104" y="206" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="12" font-weight="bold" text-anchor="middle">O</text>\n'
        '    <text x="94" y="92" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="10.5" font-weight="bold" text-anchor="middle">CH₃</text>\n'
        '    <text x="206" y="257" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="10.5" font-weight="bold" text-anchor="middle">CH₃</text>\n'
        '    <text x="348" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="10.5" font-weight="bold" text-anchor="middle">CH₃</text>\n'
        '    <text x="414" y="238" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold" text-anchor="middle">C₈H₁₀N₄O₂</text>\n'
        '    <text x="414" y="252" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">METHYLXANTHINE</text>\n'
        '  </g>'
    )
    return svg_shell(body, "CH-04", "ALKALOID SKELETON")


def _svg_mol_atp() -> str:
    # Triphosphate chain (alpha, beta, gamma high-energy bonds) -> 5-carbon ribose -> bicyclic purine base
    body = (
        '  <g>\n'
        '    <!-- Three Linked Phosphate Groups (Highlighted in Luminous Cyan) -->\n'
        '    <g stroke="#4cc9f0" filter="url(#glowCyan)">\n'
        '      <circle cx="72" cy="148" r="18" fill="#0d2542" stroke-width="2.0"/>\n'
        '      <circle cx="136" cy="148" r="18" fill="#0d2542" stroke-width="2.0"/>\n'
        '      <circle cx="200" cy="148" r="18" fill="#0d2542" stroke-width="2.0"/>\n'
        '      <path d="M 90 148 Q 98 138 104 148 Q 110 158 118 148" fill="none" stroke-width="2.4"/>\n'
        '      <path d="M 154 148 Q 162 138 168 148 Q 174 158 182 148" fill="none" stroke-width="2.4"/>\n'
        '    </g>\n'
        '    <text x="72" y="153" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="12" font-weight="bold" text-anchor="middle">Pγ</text>\n'
        '    <text x="136" y="153" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="12" font-weight="bold" text-anchor="middle">Pβ</text>\n'
        '    <text x="200" y="153" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="12" font-weight="bold" text-anchor="middle">Pα</text>\n'
        '    <!-- Link to 5-Carbon Pentose Ring -->\n'
        '    <line x1="218" y1="148" x2="254" y2="176" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <polygon points="254,176 286,154 318,176 306,214 266,214" fill="#10203a" stroke="url(#goldStroke)" stroke-width="2.2"/>\n'
        '    <text x="286" y="160" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold" text-anchor="middle">O</text>\n'
        '    <text x="286" y="232" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">5-C SUGAR RING</text>\n'
        '    <!-- Link to Purine Nitrogenous Base -->\n'
        '    <line x1="318" y1="176" x2="344" y2="146" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <polygon points="344,146 376,136 394,162 376,188 344,178" fill="#0f213d" stroke="#e5c16c" stroke-width="1.9"/>\n'
        '    <polygon points="376,136 406,118 436,136 436,170 406,188 376,170" fill="#0f213d" stroke="#e5c16c" stroke-width="1.9"/>\n'
        '    <text x="406" y="106" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="9" text-anchor="middle">NH₂</text>\n'
        '    <line x1="406" y1="110" x2="406" y2="118" stroke="#7ce2ff" stroke-width="1.5"/>\n'
        '    <!-- High-Energy Phosphoanhydride Bracket -->\n'
        '    <path d="M 56 108 L 56 98 L 216 98 L 216 108" fill="none" stroke="#4cc9f0" stroke-width="1.2"/>\n'
        '    <text x="136" y="90" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold" text-anchor="middle">3 PHOSPHATES · ΔG° = -30.5 kJ/mol</text>\n'
        '  </g>'
    )
    return svg_shell(body, "CH-05", "CELLULAR ENERGETICS")


def _svg_mol_aspirin() -> str:
    # Ortho-substituted benzene ring with -COOH and -OCOCH3 ester branch (C9H8O4)
    body = (
        '  <g stroke-linecap="round">\n'
        '    <!-- Aromatic 6-Ring -->\n'
        '    <polygon points="154,116 206,86 258,116 258,176 206,206 154,176" fill="#0d1e36" stroke="url(#goldStroke)" stroke-width="2.5"/>\n'
        '    <circle cx="206" cy="146" r="32" fill="none" stroke="#4cc9f0" stroke-dasharray="5 3" stroke-width="1.9"/>\n'
        '    <!-- Ortho Carboxylic Acid (-COOH) at C1 (258,116) -->\n'
        '    <line x1="258" y1="116" x2="306" y2="88" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <line x1="303" y1="88" x2="303" y2="48" stroke="#4cc9f0" stroke-width="2.0"/><line x1="309" y1="88" x2="309" y2="48" stroke="#4cc9f0" stroke-width="2.0"/>\n'
        '    <line x1="306" y1="88" x2="348" y2="112" stroke="#4cc9f0" stroke-width="2.2"/>\n'
        '    <text x="306" y="42" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11.5" font-weight="bold" text-anchor="middle">O</text>\n'
        '    <text x="364" y="118" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold">OH</text>\n'
        '    <!-- Ortho Ester Group (-O-CO-CH3) at C2 (258,176) -->\n'
        '    <line x1="258" y1="176" x2="306" y2="202" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <circle cx="306" cy="202" r="11" fill="#102542" stroke="#4cc9f0" stroke-width="1.4"/>\n'
        '    <text x="306" y="206" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold" text-anchor="middle">O</text>\n'
        '    <line x1="317" y1="196" x2="354" y2="174" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <line x1="351" y1="174" x2="351" y2="138" stroke="#4cc9f0" stroke-width="2.0"/><line x1="357" y1="174" x2="357" y2="138" stroke="#4cc9f0" stroke-width="2.0"/>\n'
        '    <text x="354" y="132" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold" text-anchor="middle">O</text>\n'
        '    <line x1="354" y1="174" x2="394" y2="198" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <text x="412" y="204" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="10.5" font-weight="bold">CH₃</text>\n'
        '    <text x="86" y="64" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold">C₉H₈O₄</text>\n'
        '    <text x="86" y="78" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.2">SYNTHESIZED 1897</text>\n'
        '    <text x="86" y="90" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.2">WILLOW BARK DERIV.</text>\n'
        '  </g>'
    )
    return svg_shell(body, "CH-06", "PHARMACEUTICAL ESTER")


def _svg_mol_d_orbital() -> str:
    # 3d_{z^2} Atomic Orbital: vertical hourglass double-lobe (+) encircled by equatorial toroidal donut ring (-)
    body = (
        '  <g>\n'
        '    <!-- Cartesian Axes -->\n'
        '    <line x1="240" y1="30" x2="240" y2="266" stroke="#e5c16c" stroke-opacity="0.6" stroke-width="1.1"/>\n'
        '    <line x1="92" y1="150" x2="388" y2="150" stroke="#e5c16c" stroke-opacity="0.45" stroke-width="1.0"/>\n'
        '    <line x1="154" y1="210" x2="326" y2="90" stroke="#e5c16c" stroke-opacity="0.35" stroke-dasharray="3 3" stroke-width="0.9"/>\n'
        '    <text x="248" y="42" fill="#f4e6be" font-family="\'Georgia\',serif" font-style="italic" font-size="12">z</text>\n'
        '    <text x="394" y="154" fill="#f4e6be" font-family="\'Georgia\',serif" font-style="italic" font-size="12">y</text>\n'
        '    <text x="144" y="218" fill="#f4e6be" font-family="\'Georgia\',serif" font-style="italic" font-size="12">x</text>\n'
        '    <!-- Conical Nodal Surfaces (theta = 54.7 deg) -->\n'
        '    <line x1="176" y1="88" x2="304" y2="212" stroke="#4cc9f0" stroke-opacity="0.32" stroke-dasharray="4 3"/>\n'
        '    <line x1="304" y1="88" x2="176" y2="212" stroke="#4cc9f0" stroke-opacity="0.32" stroke-dasharray="4 3"/>\n'
        '    <!-- Equatorial Toroidal Ring (Negative Phase) -->\n'
        '    <ellipse cx="240" cy="150" rx="88" ry="26" fill="#e5c16c" fill-opacity="0.16" stroke="url(#goldStroke)" stroke-width="2.2" filter="url(#glowGold)"/>\n'
        '    <ellipse cx="240" cy="150" rx="42" ry="11" fill="#091021" stroke="#e5c16c" stroke-opacity="0.6" stroke-width="1.2"/>\n'
        '    <!-- Upper & Lower Axial Lobes (Positive Phase) -->\n'
        '    <path d="M 240 150 C 212 114 208 66 240 52 C 272 66 268 114 240 150 Z" fill="#4cc9f0" fill-opacity="0.26" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <path d="M 240 150 C 212 186 208 234 240 248 C 272 234 268 186 240 150 Z" fill="#4cc9f0" fill-opacity="0.26" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <text x="240" y="96" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="14" font-weight="bold" text-anchor="middle">+</text>\n'
        '    <text x="240" y="214" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="14" font-weight="bold" text-anchor="middle">+</text>\n'
        '    <text x="304" y="155" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="14" font-weight="bold" text-anchor="middle">−</text>\n'
        '    <text x="54" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold">ℓ = 2 · m = 0</text>\n'
        '    <text x="54" y="68" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4">2 CONICAL NODES</text>\n'
        '    <text x="434" y="54" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="end">θ = 54.7°</text>\n'
        '  </g>'
    )
    return svg_shell(body, "CH-07", "QUANTUM WAVEFUNCTION")


def _svg_mol_glucose() -> str:
    # Alpha-D-Pyranose 6-ring (C6H12O6) Haworth projection with 1 ring oxygen & C6 -CH2OH flag
    body = (
        '  <g stroke-linecap="round">\n'
        '    <!-- Haworth 6-Membered Ring (5 C + 1 Ring O) -->\n'
        '    <polygon points="146,154 188,118 292,118 334,154 292,190 188,190" fill="#0d1e36" stroke="url(#goldStroke)" stroke-width="2.4"/>\n'
        '    <!-- Front Bold Perspective Edge -->\n'
        '    <line x1="188" y1="190" x2="292" y2="190" stroke="#4cc9f0" stroke-width="4.2" filter="url(#glowCyan)"/>\n'
        '    <!-- Ring Oxygen at Top-Right Vertex -->\n'
        '    <circle cx="292" cy="118" r="12" fill="#102542" stroke="#4cc9f0" stroke-width="1.6"/>\n'
        '    <text x="292" y="122" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11.5" font-weight="bold" text-anchor="middle">O</text>\n'
        '    <!-- C6 -CH2OH Flag Up from C5 (188,118) -->\n'
        '    <line x1="188" y1="118" x2="188" y2="74" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <text x="188" y="64" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="10.5" font-weight="bold" text-anchor="middle">CH₂OH</text>\n'
        '    <!-- Hydroxyl Substituents (-OH) -->\n'
        '    <line x1="334" y1="154" x2="334" y2="206" stroke="#4cc9f0" stroke-width="1.8"/><text x="334" y="220" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="10" text-anchor="middle">OH</text>\n'
        '    <line x1="292" y1="190" x2="292" y2="234" stroke="#4cc9f0" stroke-width="1.8"/><text x="292" y="248" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="10" text-anchor="middle">OH</text>\n'
        '    <line x1="188" y1="190" x2="188" y2="146" stroke="#4cc9f0" stroke-width="1.8"/><text x="188" y="140" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="10" text-anchor="middle">OH</text>\n'
        '    <line x1="146" y1="154" x2="146" y2="206" stroke="#4cc9f0" stroke-width="1.8"/><text x="146" y="220" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="10" text-anchor="middle">OH</text>\n'
        '    <text x="64" y="64" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold">C₆H₁₂O₆</text>\n'
        '    <text x="64" y="78" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4">ALDOHEXOSE RING</text>\n'
        '    <text x="416" y="64" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="end">M: 180.16 g/mol</text>\n'
        '  </g>'
    )
    return svg_shell(body, "CH-08", "HAWORTH PROJECTION")


# --- 6 World Flag & Heraldry Geometric Ratio Blueprints (Monochrome Gold/Cyan, Zero Country Names!) ---

def _svg_flag_nepal() -> str:
    # World's only non-quadrilateral national flag: exact double-pennant compass construction + crescent moon + 12-rayed sun!
    sun_rays: List[str] = []
    scx, scy = 186.0, 206.0
    for k in range(24):
        ang = math.radians(k * 15)
        r = 18.0 if k % 2 == 0 else 10.5
        sun_rays.append(f"{scx + r * math.cos(ang):.1f},{scy + r * math.sin(ang):.1f}")
    body = (
        '  <g>\n'
        '    <!-- Geometric Construction Arcs -->\n'
        '    <rect x="138" y="42" width="168" height="206" fill="none" stroke="#e5c16c" stroke-opacity="0.28" stroke-dasharray="4 3"/>\n'
        '    <line x1="138" y1="42" x2="306" y2="248" stroke="#4cc9f0" stroke-opacity="0.25" stroke-dasharray="3 3"/>\n'
        '    <!-- Outer Double-Pennant Border -->\n'
        '    <polygon points="138,42 306,154 202,154 306,248 138,248" fill="#10213b" stroke="url(#goldStroke)" stroke-width="4.2" stroke-linejoin="miter" filter="url(#glowGold)"/>\n'
        '    <!-- Inner Pennant Field -->\n'
        '    <polygon points="146,56 286,147 186,147 288,240 146,240" fill="#0a162b" stroke="#4cc9f0" stroke-width="1.3"/>\n'
        '    <!-- Upper Pennant: Crescent Moon cradling 8-Point Star -->\n'
        '    <path d="M 168 118 A 18 18 0 1 0 204 118 A 14 14 0 1 1 168 118 Z" fill="#e5c16c" filter="url(#glowGold)"/>\n'
        '    <circle cx="186" cy="116" r="5.2" fill="#4cc9f0"/>\n'
        '    <!-- Lower Pennant: 12-Rayed Radiant Sun -->\n'
        f'    <polygon points="{" ".join(sun_rays)}" fill="#4cc9f0" fill-opacity="0.32" stroke="#4cc9f0" stroke-width="1.4" filter="url(#glowCyan)"/>\n'
        '    <!-- Construction Ratio Readouts -->\n'
        '    <text x="342" y="84" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold">DOUBLE PENNANT</text>\n'
        '    <text x="342" y="98" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4">NON-QUADRILATERAL</text>\n'
        '    <text x="342" y="112" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4">RATIO 1 : 1.219</text>\n'
        '    <text x="342" y="126" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.2">CODIFIED 1962</text>\n'
        '  </g>'
    )
    return svg_shell(body, "FL-01", "VEXILLOLOGY GEOMETRY")


def _svg_flag_switzerland() -> str:
    # Exact 1:1 square proportion with equilateral Greek cross whose arm length exceeds arm width by exact 7:6 ratio
    body = (
        '  <g>\n'
        '    <!-- 1:1 Square Frame -->\n'
        '    <rect x="148" y="54" width="184" height="184" fill="#0f213c" stroke="url(#goldStroke)" stroke-width="2.4" filter="url(#glowGold)"/>\n'
        '    <!-- Construction Grid (32 x 32 statutory units) -->\n'
        '    <line x1="240" y1="42" x2="240" y2="250" stroke="#4cc9f0" stroke-opacity="0.32" stroke-dasharray="4 3"/>\n'
        '    <line x1="136" y1="146" x2="344" y2="146" stroke="#4cc9f0" stroke-opacity="0.32" stroke-dasharray="4 3"/>\n'
        '    <!-- Equilateral Cross (20/32 total span, 6/32 arm width -> 7:6 arm length-to-width) -->\n'
        '    <polygon points="223,88 257,88 257,129 298,129 298,163 257,163 257,204 223,204 223,163 182,163 182,129 223,129" fill="#4cc9f0" fill-opacity="0.22" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <!-- Dimension Brackets -->\n'
        '    <path d="M 148 44 L 148 38 L 332 38 L 332 44" fill="none" stroke="#e5c16c" stroke-width="1.0"/>\n'
        '    <text x="240" y="33" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">EXACT 1 : 1 SQUARE (32 × 32 UNITS)</text>\n'
        '    <text x="48" y="142" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold">ARM RATIO</text>\n'
        '    <text x="48" y="156" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6">LENGTH 7 : 6 WIDTH</text>\n'
        '    <text x="358" y="142" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6">ONLY 2 SQUARE</text>\n'
        '    <text x="358" y="156" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6">SOVEREIGN FLAGS</text>\n'
        '  </g>'
    )
    return svg_shell(body, "FL-02", "STATUTORY 1:1 RATIO")


def _svg_flag_uk_union() -> str:
    # 1:2 Blueprint of asymmetric counterchanged diagonal saltires overlaid by fimbriated upright cross (1801)
    body = (
        '  <g>\n'
        '    <clipPath id="clipUnion"><rect x="74" y="64" width="332" height="166"/></clipPath>\n'
        '    <rect x="74" y="64" width="332" height="166" fill="#0b1a33" stroke="url(#goldStroke)" stroke-width="2.0"/>\n'
        '    <g clip-path="url(#clipUnion)">\n'
        '      <!-- Broad Diagonal Saltire (St Andrew) -->\n'
        '      <line x1="74" y1="64" x2="406" y2="230" stroke="#e5c16c" stroke-opacity="0.38" stroke-width="28"/>\n'
        '      <line x1="406" y1="64" x2="74" y2="230" stroke="#e5c16c" stroke-opacity="0.38" stroke-width="28"/>\n'
        '      <!-- Counterchanged Pinwheeling Narrow Saltire (Offset asymmetrically!) -->\n'
        '      <line x1="74" y1="69" x2="240" y2="152" stroke="#4cc9f0" stroke-width="8" filter="url(#glowCyan)"/>\n'
        '      <line x1="240" y1="142" x2="406" y2="225" stroke="#4cc9f0" stroke-width="8" filter="url(#glowCyan)"/>\n'
        '      <line x1="406" y1="69" x2="240" y2="152" stroke="#4cc9f0" stroke-width="8" filter="url(#glowCyan)"/>\n'
        '      <line x1="240" y1="142" x2="74" y2="225" stroke="#4cc9f0" stroke-width="8" filter="url(#glowCyan)"/>\n'
        '      <!-- Fimbriated Central Upright Cross -->\n'
        '      <rect x="215" y="64" width="50" height="166" fill="#0a162b" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '      <rect x="74" y="122" width="332" height="50" fill="#0a162b" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '      <rect x="224" y="64" width="32" height="166" fill="#e5c16c" fill-opacity="0.28" stroke="#e5c16c" stroke-width="1.6"/>\n'
        '      <rect x="74" y="131" width="332" height="32" fill="#e5c16c" fill-opacity="0.28" stroke="#e5c16c" stroke-width="1.6"/>\n'
        '    </g>\n'
        '    <rect x="74" y="64" width="332" height="166" fill="none" stroke="url(#goldStroke)" stroke-width="2.0"/>\n'
        '    <text x="240" y="48" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold" text-anchor="middle">RATIO 1 : 2 · COUNTERCHANGED ASYMMETRIC SALTIRES</text>\n'
        '    <text x="240" y="250" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.5" text-anchor="middle">SUPERIMPOSITION OF 3 HERALDIC CROSSES · 1801</text>\n'
        '  </g>'
    )
    return svg_shell(body, "FL-03", "HERALDIC SUPERPOSITION")


def _svg_flag_south_korea() -> str:
    # 2:3 Blueprint: central swirling S-curve circle + 4 I Ching trigrams at the 4 corners!
    def _trigram(cx: float, cy: float, angle: float, bars: Tuple[bool, bool, bool]) -> str:
        # True = solid bar, False = broken bar
        parts = [f'    <g transform="translate({cx:.1f},{cy:.1f}) rotate({angle})">']
        for idx, solid in enumerate(bars):
            y = -12 + idx * 12
            if solid:
                parts.append(f'      <rect x="-20" y="{y-3.5:.1f}" width="40" height="7" fill="#e5c16c" fill-opacity="0.85"/>')
            else:
                parts.append(f'      <rect x="-20" y="{y-3.5:.1f}" width="17.5" height="7" fill="#e5c16c" fill-opacity="0.85"/>')
                parts.append(f'      <rect x="2.5" y="{y-3.5:.1f}" width="17.5" height="7" fill="#e5c16c" fill-opacity="0.85"/>')
        parts.append('    </g>')
        return "\n".join(parts)

    t_tl = _trigram(148, 102, -33.7, (True, True, True))       # Heaven (Geon)
    t_tr = _trigram(332, 102, 33.7, (False, True, False))      # Water (Gam)
    t_bl = _trigram(148, 198, 33.7, (True, False, True))       # Fire (Ri)
    t_br = _trigram(332, 198, -33.7, (False, False, False))    # Earth (Gon)
    body = (
        '  <g>\n'
        '    <rect x="96" y="54" width="288" height="192" fill="#0b1830" stroke="url(#goldStroke)" stroke-width="2.0"/>\n'
        '    <!-- Diagonal Construction Axes -->\n'
        '    <line x1="96" y1="54" x2="384" y2="246" stroke="#4cc9f0" stroke-opacity="0.22" stroke-dasharray="4 3"/>\n'
        '    <line x1="384" y1="54" x2="96" y2="246" stroke="#4cc9f0" stroke-opacity="0.22" stroke-dasharray="4 3"/>\n'
        '    <!-- Central S-Curve Swirling Circle -->\n'
        '    <circle cx="240" cy="150" r="46" fill="#0f2544" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <path d="M 202 124 A 46 46 0 0 1 278 176 A 23 23 0 0 1 240 150 A 23 23 0 0 0 202 124 Z" fill="#e5c16c" fill-opacity="0.26" stroke="#e5c16c" stroke-width="1.6"/>\n'
        + t_tl + "\n" + t_tr + "\n" + t_bl + "\n" + t_br + "\n"
        '    <text x="240" y="42" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold" text-anchor="middle">RATIO 2 : 3 · 4 TRIGRAMS + CENTRAL DUALITY DISC</text>\n'
        '  </g>'
    )
    return svg_shell(body, "FL-04", "TRIGRAM COSMOLOGY")


def _svg_flag_nordic_cross() -> str:
    # Off-center hoist-shifted Nordic Cross statutory proportions 12:4:21 horizontal, 12:4:12 vertical (oldest continuous state flag!)
    body = (
        '  <g>\n'
        '    <rect x="78" y="64" width="324" height="176" fill="#0e1f3a" stroke="url(#goldStroke)" stroke-width="2.0"/>\n'
        '    <!-- Off-center Hoist-Shifted Cross (12 : 4 : 21) -->\n'
        '    <rect x="183" y="64" width="35" height="176" fill="#4cc9f0" fill-opacity="0.26" stroke="#4cc9f0" stroke-width="2.0" filter="url(#glowCyan)"/>\n'
        '    <rect x="78" y="134" width="324" height="35" fill="#4cc9f0" fill-opacity="0.26" stroke="#4cc9f0" stroke-width="2.0" filter="url(#glowCyan)"/>\n'
        '    <!-- Dimension Callouts -->\n'
        '    <path d="M 78 52 L 183 52 M 183 52 L 218 52 M 218 52 L 402 52" stroke="#e5c16c" stroke-width="1.0"/>\n'
        '    <line x1="78" y1="47" x2="78" y2="57" stroke="#e5c16c"/><line x1="183" y1="47" x2="183" y2="57" stroke="#e5c16c"/>\n'
        '    <line x1="218" y1="47" x2="218" y2="57" stroke="#e5c16c"/><line x1="402" y1="47" x2="402" y2="57" stroke="#e5c16c"/>\n'
        '    <text x="130" y="45" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">12</text>\n'
        '    <text x="200" y="45" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">4</text>\n'
        '    <text x="310" y="45" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">21</text>\n'
        '    <text x="240" y="256" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="middle">HOIST-SHIFTED CROSS · RATIO 28 : 37 · ATTESTED 1370s</text>\n'
        '  </g>'
    )
    return svg_shell(body, "FL-05", "HOIST-SHIFTED CROSS")


def _svg_flag_seychelles() -> str:
    # 1:2 flag divided into 5 oblique rays fanning from the bottom-left hoist corner at exact 1/3 divisions!
    body = (
        '  <g>\n'
        '    <rect x="74" y="64" width="332" height="166" fill="#0b1830" stroke="url(#goldStroke)" stroke-width="2.0"/>\n'
        '    <!-- 5 Radiating Oblique Bands from Bottom-Left Hoist (74,230) -->\n'
        '    <polygon points="74,230 74,64 184.7,64" fill="#10294a" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <polygon points="74,230 184.7,64 295.3,64" fill="#182b44" stroke="#4cc9f0" stroke-width="1.4"/>\n'
        '    <polygon points="74,230 295.3,64 406,64 406,119.3" fill="#0f223d" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <polygon points="74,230 406,119.3 406,174.7" fill="#162d4c" stroke="#4cc9f0" stroke-width="1.4"/>\n'
        '    <polygon points="74,230 406,174.7 406,230" fill="#0c1b30" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <!-- Exact 1/3 Edge Subdivision Ticks -->\n'
        '    <circle cx="184.7" cy="64" r="3.2" fill="#4cc9f0" filter="url(#glowCyan)"/>\n'
        '    <circle cx="295.3" cy="64" r="3.2" fill="#4cc9f0" filter="url(#glowCyan)"/>\n'
        '    <circle cx="406" cy="119.3" r="3.2" fill="#4cc9f0" filter="url(#glowCyan)"/>\n'
        '    <circle cx="406" cy="174.7" r="3.2" fill="#4cc9f0" filter="url(#glowCyan)"/>\n'
        '    <text x="129" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">1/3</text>\n'
        '    <text x="240" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">1/3</text>\n'
        '    <text x="351" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">1/3</text>\n'
        '    <text x="424" y="94" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8">1/3</text>\n'
        '    <text x="424" y="150" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8">1/3</text>\n'
        '    <text x="424" y="206" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8">1/3</text>\n'
        '    <text x="240" y="252" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="middle">5 OBLIQUE RADIATING BANDS · ADOPTED 1996</text>\n'
        '  </g>'
    )
    return svg_shell(body, "FL-06", "RADIAL SUBDIVISION")


# --- 5 Historical Battle & Maritime Strait/Canal Tactical Blueprints ---

def _svg_map_cannae() -> str:
    # 216 BCE Double-Envelopment Tactical Blueprint: dense central column sucked into convex->concave pocket while flanks & cavalry close 360°!
    body = (
        '  <g>\n'
        '    <!-- River Boundary to West -->\n'
        '    <path d="M 52 38 Q 68 118 48 188 Q 38 232 58 262" fill="none" stroke="#4cc9f0" stroke-opacity="0.45" stroke-width="8"/>\n'
        '    <text x="72" y="252" fill="#4cc9f0" font-family="\'Consolas\',monospace" font-size="7.8">RIVER FLANK</text>\n'
        '    <!-- Trapped Dense Rectangular Infantry Mass (Center) -->\n'
        '    <rect x="186" y="106" width="108" height="72" rx="3" fill="#2c1622" stroke="#f59e0b" stroke-width="2.0"/>\n'
        '    <line x1="186" y1="130" x2="294" y2="130" stroke="#f59e0b" stroke-opacity="0.45" stroke-dasharray="4 3"/>\n'
        '    <line x1="186" y1="154" x2="294" y2="154" stroke="#f59e0b" stroke-opacity="0.45" stroke-dasharray="4 3"/>\n'
        '    <text x="240" y="146" fill="#fde68a" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">86,000 COLUMN</text>\n'
        '    <!-- Yielding Bowed Center Line (Dashed Initial Convex -> Solid Concave Pocket) -->\n'
        '    <path d="M 152 178 Q 240 156 328 178" fill="none" stroke="#4cc9f0" stroke-opacity="0.4" stroke-dasharray="4 3" stroke-width="1.6"/>\n'
        '    <path d="M 148 122 L 148 192 Q 240 228 332 192 L 332 122" fill="none" stroke="#4cc9f0" stroke-width="3.6" filter="url(#glowCyan)"/>\n'
        '    <!-- Heavy Flanking Infantry Inward Wheel Arrows -->\n'
        '    <path d="M 148 144 L 176 144" stroke="#7ce2ff" stroke-width="2.4"/><polygon points="180,144 171,139 171,149" fill="#7ce2ff"/>\n'
        '    <path d="M 332 144 L 304 144" stroke="#7ce2ff" stroke-width="2.4"/><polygon points="300,144 309,139 309,149" fill="#7ce2ff"/>\n'
        '    <!-- Sweeping Rear Cavalry Encirclement Arc -->\n'
        '    <path d="M 108 196 C 96 86 158 56 240 62 C 322 56 384 86 372 196" fill="none" stroke="#e5c16c" stroke-width="2.4" stroke-dasharray="7 3" filter="url(#glowGold)"/>\n'
        '    <polygon points="240,94 234,82 246,82" fill="#e5c16c"/>\n'
        '    <line x1="240" y1="62" x2="240" y2="86" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <text x="240" y="44" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">DOUBLE ENVELOPMENT · 216 BCE</text>\n'
        '    <text x="240" y="246" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">CONVEX → CONCAVE POCKET + REAR CAVALRY PINCER</text>\n'
        '  </g>'
    )
    return svg_shell(body, "MP-01", "TACTICAL ENCIRCLEMENT")


def _svg_map_panama_canal() -> str:
    # Isthmus longitudinal lock elevation profile: NW Sea Level -> 3-step Locks -> +26m Artificial Lake -> Cut -> 2+1 Locks -> SE Sea Level!
    body = (
        '  <g>\n'
        '    <!-- Sea Level Datum -->\n'
        '    <line x1="34" y1="224" x2="446" y2="224" stroke="#4cc9f0" stroke-opacity="0.45" stroke-dasharray="4 3" stroke-width="1.0"/>\n'
        '    <!-- Continental Divide Landmass Profile -->\n'
        '    <polygon points="34,224 94,224 102,158 264,158 296,86 344,158 378,224 446,224 446,256 34,256" fill="#0d1d34" stroke="#e5c16c" stroke-width="1.3"/>\n'
        '    <!-- Stepped Water Profile (+26 m Elevated Artificial Lake!) -->\n'
        '    <polyline points="34,224 92,224 92,202 108,202 108,180 124,180 124,154 328,154 328,176 346,176 346,202 368,202 368,224 446,224" fill="none" stroke="#4cc9f0" stroke-width="3.4" filter="url(#glowCyan)"/>\n'
        '    <!-- Highlighted Cut Excavation Valley -->\n'
        '    <polygon points="264,154 296,86 328,154" fill="#070e1d" stroke="#e5c16c" stroke-dasharray="3 2" stroke-width="1.1"/>\n'
        '    <!-- Direction Compass Note (NW Ocean -> SE Ocean!) -->\n'
        '    <text x="64" y="212" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="middle">NW SEA (0 M)</text>\n'
        '    <text x="412" y="212" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="middle">SE SEA (0 M)</text>\n'
        '    <text x="206" y="142" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">ELEVATED LAKE · +26 M</text>\n'
        '    <text x="296" y="76" fill="#e5c16c" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">DIVIDE CUT</text>\n'
        '    <text x="108" y="120" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">3-STEP LOCKS</text>\n'
        '    <line x1="108" y1="126" x2="108" y2="174" stroke="#7ce2ff" stroke-dasharray="2 2"/>\n'
        '    <text x="240" y="42" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">82 KM ISTHMUS LOCK PROFILE · OPENED 1914</text>\n'
        '    <text x="240" y="246" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.3" text-anchor="middle">TRANSIT HEADING: NORTHWEST → SOUTHEAST</text>\n'
        '  </g>'
    )
    return svg_shell(body, "MP-02", "HYDRAULIC ELEVATION")


def _svg_map_thermopylae() -> str:
    # Coastal mountain chokepoint (480 BCE): steep mountain contour massif south, sea north, razor-thin coastal pass + dashed bypass trail
    body = (
        '  <g>\n'
        '    <!-- Sea Basin (North) -->\n'
        '    <path d="M 32 42 L 448 42 L 448 118 Q 340 128 240 132 Q 140 128 32 114 Z" fill="#0b243c" stroke="#4cc9f0" stroke-width="1.5"/>\n'
        '    <path d="M 54 74 Q 90 68 126 74 Q 162 80 198 74 M 274 74 Q 310 68 346 74 Q 382 80 418 74" fill="none" stroke="#4cc9f0" stroke-opacity="0.45" stroke-width="1.0"/>\n'
        '    <text x="240" y="64" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="middle">COASTAL GULF (NORTH)</text>\n'
        '    <!-- Steep Mountain Ridge Contours (South) -->\n'
        '    <path d="M 32 184 Q 140 154 240 150 Q 340 156 448 188" fill="none" stroke="#e5c16c" stroke-width="2.0"/>\n'
        '    <path d="M 48 210 Q 150 176 240 172 Q 330 178 432 212" fill="none" stroke="#e5c16c" stroke-opacity="0.6" stroke-width="1.2"/>\n'
        '    <path d="M 76 236 Q 168 198 240 194 Q 312 200 404 238" fill="none" stroke="#e5c16c" stroke-opacity="0.38" stroke-width="1.0"/>\n'
        '    <!-- Narrow Coastal Chokepoint Wall (15m wide!) -->\n'
        '    <line x1="240" y1="132" x2="240" y2="150" stroke="#f59e0b" stroke-width="5.0" filter="url(#glowGold)"/>\n'
        '    <!-- Advancing Column from West -->\n'
        '    <line x1="88" y1="141" x2="222" y2="141" stroke="#4cc9f0" stroke-width="2.6" filter="url(#glowCyan)"/>\n'
        '    <polygon points="228,141 217,135 217,147" fill="#4cc9f0"/>\n'
        '    <!-- Secret Mountain Goat-Path Flanking Trail -->\n'
        '    <path d="M 96 154 Q 154 242 246 236 Q 332 232 364 152" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="5 3"/>\n'
        '    <polygon points="366,146 359,156 370,157" fill="#f59e0b"/>\n'
        '    <text x="240" y="252" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">HIGHLAND FLANKING TRAIL · 480 BCE</text>\n'
        '    <text x="240" y="114" fill="#fde68a" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="middle">DEFILE WIDTH ≈ 15 M</text>\n'
        '  </g>'
    )
    return svg_shell(body, "MP-03", "CHOKEPOINT TOPOGRAPHY")


def _svg_map_bosporus_strait() -> str:
    # Sinuous 31 km S-shaped intercontinental waterway separating two landmasses with 700 m narrowest chokepoint
    body = (
        '  <g>\n'
        '    <!-- Western Landmass -->\n'
        '    <path d="M 32 42 L 228 42 C 216 90 258 122 214 156 C 176 186 226 218 206 258 L 32 258 Z" fill="#0d1d34" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <!-- Eastern Landmass -->\n'
        '    <path d="M 272 42 L 448 42 L 448 258 L 246 258 C 266 218 214 186 250 156 C 292 122 254 90 272 42 Z" fill="#0d1d34" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <!-- Luminous Strait Channel Centerline -->\n'
        '    <path d="M 250 42 C 236 90 275 122 232 156 C 195 186 246 218 226 258" fill="none" stroke="#4cc9f0" stroke-width="4.2" stroke-opacity="0.7" filter="url(#glowCyan)"/>\n'
        '    <!-- Narrowest Chokepoint Measurement Bar (700 m) -->\n'
        '    <line x1="214" y1="156" x2="250" y2="156" stroke="#f7e4ad" stroke-width="2.0"/>\n'
        '    <circle cx="214" cy="156" r="2.8" fill="#f7e4ad"/><circle cx="250" cy="156" r="2.8" fill="#f7e4ad"/>\n'
        '    <text x="116" y="146" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold" text-anchor="middle">CONTINENT A</text>\n'
        '    <text x="116" y="160" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">(WEST BANK)</text>\n'
        '    <text x="364" y="146" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold" text-anchor="middle">CONTINENT B</text>\n'
        '    <text x="364" y="160" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8" text-anchor="middle">(EAST BANK)</text>\n'
        '    <text x="250" y="34" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">NORTHERN SEA</text>\n'
        '    <text x="342" y="196" fill="#fde68a" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="middle">MIN WIDTH: 700 M</text>\n'
        '    <text x="342" y="210" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">LENGTH: 31 KM</text>\n'
        '  </g>'
    )
    return svg_shell(body, "MP-04", "MARITIME CHOKEPOINT")


def _svg_map_suez_canal() -> str:
    # 193 km lock-free sea-level N->S artificial trench linking northern sea via central bitter lake to southern gulf
    body = (
        '  <g>\n'
        '    <!-- Northern & Southern Sea Basins -->\n'
        '    <rect x="44" y="38" width="392" height="34" fill="#0a243d" stroke="#4cc9f0" stroke-width="1.2"/>\n'
        '    <rect x="44" y="224" width="392" height="34" fill="#0a243d" stroke="#4cc9f0" stroke-width="1.2"/>\n'
        '    <!-- Arid Isthmus Landmass -->\n'
        '    <rect x="44" y="72" width="392" height="152" fill="#0d1c33" stroke="#e5c16c" stroke-opacity="0.65" stroke-width="1.2"/>\n'
        '    <!-- Straight Lock-Free Sea-Level Cut + Central Bitter Lake Expansion -->\n'
        '    <path d="M 240 72 L 240 132 C 218 142 216 174 240 186 L 240 224" fill="none" stroke="#4cc9f0" stroke-width="4.4" filter="url(#glowCyan)"/>\n'
        '    <ellipse cx="240" cy="159" rx="22" ry="26" fill="#0d3150" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '    <!-- Telemetry -->\n'
        '    <text x="240" y="59" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="middle">NORTHERN SEA (0 M)</text>\n'
        '    <text x="240" y="245" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" font-weight="bold" text-anchor="middle">SOUTHERN GULF (0 M)</text>\n'
        '    <text x="128" y="136" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">0 LOCKS · SEA LEVEL</text>\n'
        '    <text x="128" y="150" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">LENGTH: 193.3 KM</text>\n'
        '    <text x="352" y="136" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">OPENED 1869</text>\n'
        '    <text x="352" y="150" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">CENTRAL SALT LAKE</text>\n'
        '  </g>'
    )
    return svg_shell(body, "MP-05", "SEA-LEVEL CORRIDOR")


# --- 5 Classical Geometry, Topology & Digital Logic Blueprints ---

def _svg_geo_pythagoras() -> str:
    # Exact 3-4-5 right triangle with 3x3 (9), 4x4 (16), and 5x5 (25) subdivided unit-grid squares!
    u = 18.0
    ax, ay = 198.0, 178.0   # right angle vertex
    bx, by = ax + 4 * u, ay  # (270, 178) horizontal leg = 4
    cx, cy = ax, ay - 3 * u  # (198, 124) vertical leg = 3
    lines: List[str] = []
    # 3x3 square to left of vertical leg
    for k in range(4):
        lines.append(f'    <line x1="{ax - k*u:.1f}" y1="{cy:.1f}" x2="{ax - k*u:.1f}" y2="{ay:.1f}" stroke="#e5c16c" stroke-opacity="0.55" stroke-width="0.9"/>')
        lines.append(f'    <line x1="{ax - 3*u:.1f}" y1="{cy + k*u:.1f}" x2="{ax:.1f}" y2="{cy + k*u:.1f}" stroke="#e5c16c" stroke-opacity="0.55" stroke-width="0.9"/>')
    # 4x4 square below horizontal leg
    for k in range(5):
        lines.append(f'    <line x1="{ax + k*u:.1f}" y1="{ay:.1f}" x2="{ax + k*u:.1f}" y2="{ay + 4*u:.1f}" stroke="#e5c16c" stroke-opacity="0.55" stroke-width="0.9"/>')
        lines.append(f'    <line x1="{ax:.1f}" y1="{ay + k*u:.1f}" x2="{bx:.1f}" y2="{ay + k*u:.1f}" stroke="#e5c16c" stroke-opacity="0.55" stroke-width="0.9"/>')
    # 5x5 square built outward on hypotenuse (cx,cy)->(bx,by): vec=(72, 54), outward normal=(54, -72)
    hx1, hy1 = cx, cy
    hx2, hy2 = bx, by
    nx, ny = 54.0, -72.0
    hx3, hy3 = hx2 + nx, hy2 + ny
    hx4, hy4 = hx1 + nx, hy1 + ny
    for k in range(6):
        f = k / 5.0
        p1x, p1y = hx1 + f * (hx2 - hx1), hy1 + f * (hy2 - hy1)
        p2x, p2y = hx4 + f * (hx3 - hx4), hy4 + f * (hy3 - hy4)
        lines.append(f'    <line x1="{p1x:.1f}" y1="{p1y:.1f}" x2="{p2x:.1f}" y2="{p2y:.1f}" stroke="#4cc9f0" stroke-opacity="0.65" stroke-width="0.9"/>')
        q1x, q1y = hx1 + f * nx, hy1 + f * ny
        q2x, q2y = hx2 + f * nx, hy2 + f * ny
        lines.append(f'    <line x1="{q1x:.1f}" y1="{q1y:.1f}" x2="{q2x:.1f}" y2="{q2y:.1f}" stroke="#4cc9f0" stroke-opacity="0.65" stroke-width="0.9"/>')

    body = (
        '  <g>\n'
        f'    <rect x="{ax - 3*u:.1f}" y="{cy:.1f}" width="{3*u:.1f}" height="{3*u:.1f}" fill="#14233b" stroke="#e5c16c" stroke-width="1.6"/>\n'
        f'    <rect x="{ax:.1f}" y="{ay:.1f}" width="{4*u:.1f}" height="{4*u:.1f}" fill="#14233b" stroke="#e5c16c" stroke-width="1.6"/>\n'
        f'    <polygon points="{hx1:.1f},{hy1:.1f} {hx2:.1f},{hy2:.1f} {hx3:.1f},{hy3:.1f} {hx4:.1f},{hy4:.1f}" fill="#0d2944" stroke="#4cc9f0" stroke-width="2.0" filter="url(#glowCyan)"/>\n'
        + "\n".join(lines) + "\n"
        f'    <!-- Central Right Triangle -->\n'
        f'    <polygon points="{ax:.1f},{ay:.1f} {bx:.1f},{by:.1f} {cx:.1f},{cy:.1f}" fill="#070e1d" stroke="#f7e4ad" stroke-width="2.2"/>\n'
        f'    <rect x="{ax:.1f}" y="{ay-10:.1f}" width="10" height="10" fill="none" stroke="#f7e4ad" stroke-width="1.2"/>\n'
        '    <text x="171" y="155" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold" text-anchor="middle">a² = 9</text>\n'
        '    <text x="234" y="218" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold" text-anchor="middle">b² = 16</text>\n'
        '    <text x="262" y="114" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11.5" font-weight="bold" text-anchor="middle">c² = 25</text>\n'
        '    <text x="78" y="60" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold">a² + b² = c²</text>\n'
        '    <text x="78" y="74" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4">9 + 16 = 25</text>\n'
        '  </g>'
    )
    return svg_shell(body, "GM-01", "EUCLIDEAN PROOF")


def _svg_geo_golden_spiral() -> str:
    # Nested golden rectangle tiled by Fibonacci squares (1, 1, 2, 3, 5, 8, 13) + sweeping cyan quarter-circle spiral!
    # Scaled by s = 10.5 px per unit inside 21 x 13 golden rectangle (width 220.5, height 136.5) -> scaled by s=15.0: 315 x 195!
    s = 15.0
    x0, y0 = 82.0, 52.0
    # Tiling inside 21x13 rectangle:
    # Sq 13: (0,0,13,13)
    # Sq 8:  (13,0,8,8)
    # Sq 5:  (16,8,5,5)
    # Sq 3:  (13,10,3,3)
    # Sq 2:  (13,8,2,2)
    # Sq 1a: (15,8,1,1)
    # Sq 1b: (15,9,1,1)
    sqs = [
        (0, 0, 13, "13"), (13, 0, 8, "8"), (16, 8, 5, "5"),
        (13, 10, 3, "3"), (13, 8, 2, "2"), (15, 8, 1, ""), (15, 9, 1, ""),
    ]
    rect_svg: List[str] = []
    for gx, gy, sz, lbl in sqs:
        rx, ry, rw = x0 + gx * s, y0 + gy * s, sz * s
        rect_svg.append(f'    <rect x="{rx:.1f}" y="{ry:.1f}" width="{rw:.1f}" height="{rw:.1f}" fill="#0d1e36" fill-opacity="0.72" stroke="#e5c16c" stroke-width="1.35"/>')
        if lbl:
            rect_svg.append(f'    <text x="{rx + rw/2:.1f}" y="{ry + rw/2 + 4:.1f}" fill="#f4e6be" fill-opacity="0.75" font-family="\'Consolas\',monospace" font-size="{max(9, sz+4)}" font-weight="bold" text-anchor="middle">{lbl}</text>')

    # Continuous quarter-circle spiral from Sq 13 bottom-left -> top-right -> Sq 8 -> Sq 5 -> Sq 3 -> Sq 2 -> Sq 1
    def pt(gx: float, gy: float) -> Tuple[float, float]:
        return (x0 + gx * s, y0 + gy * s)

    p0 = pt(0, 13)
    p1 = pt(13, 0)
    p2 = pt(21, 8)
    p3 = pt(16, 13)
    p4 = pt(13, 10)
    p5 = pt(15, 8)
    p6 = pt(16, 9)
    p7 = pt(15, 10)
    spiral_d = (
        f"M {p0[0]:.1f},{p0[1]:.1f} "
        f"A {13*s:.1f},{13*s:.1f} 0 0,1 {p1[0]:.1f},{p1[1]:.1f} "
        f"A {8*s:.1f},{8*s:.1f} 0 0,1 {p2[0]:.1f},{p2[1]:.1f} "
        f"A {5*s:.1f},{5*s:.1f} 0 0,1 {p3[0]:.1f},{p3[1]:.1f} "
        f"A {3*s:.1f},{3*s:.1f} 0 0,1 {p4[0]:.1f},{p4[1]:.1f} "
        f"A {2*s:.1f},{2*s:.1f} 0 0,1 {p5[0]:.1f},{p5[1]:.1f} "
        f"A {1*s:.1f},{1*s:.1f} 0 0,1 {p6[0]:.1f},{p6[1]:.1f} "
        f"A {1*s:.1f},{1*s:.1f} 0 0,1 {p7[0]:.1f},{p7[1]:.1f}"
    )
    body = (
        '  <g>\n'
        + "\n".join(rect_svg) + "\n"
        f'    <path d="{spiral_d}" fill="none" stroke="#4cc9f0" stroke-width="3.0" filter="url(#glowCyan)"/>\n'
        '    <text x="240" y="38" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">1, 1, 2, 3, 5, 8, 13 · RATIO ≈ 1.618034</text>\n'
        '  </g>'
    )
    return svg_shell(body, "GM-02", "LOGARITHMIC RATIO")


def _svg_geo_konigsberg() -> str:
    # Left: River branching around 2 central islands linked by exact 7 bridges! Right: Abstract 4-vertex multigraph (deg 3,3,3,5)
    body = (
        '  <g>\n'
        '    <!-- Left: City River & 2 Islands -->\n'
        '    <rect x="30" y="48" width="222" height="202" rx="4" fill="#092138" stroke="#4cc9f0" stroke-opacity="0.55" stroke-width="1.2"/>\n'
        '    <!-- North Bank & South Bank -->\n'
        '    <path d="M 30 48 L 252 48 L 252 94 Q 140 102 30 92 Z" fill="#0f2039" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '    <path d="M 30 250 L 252 250 L 252 204 Q 140 196 30 206 Z" fill="#0f2039" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '    <!-- Central Island A (West) & Peninsula/Island B (East) -->\n'
        '    <ellipse cx="106" cy="149" rx="44" ry="26" fill="#132847" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <path d="M 182 149 C 182 124 218 118 252 122 L 252 176 C 218 180 182 174 182 149 Z" fill="#132847" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <!-- Exact 7 Glowing Bridges -->\n'
        '    <g stroke="#4cc9f0" stroke-width="4.0" filter="url(#glowCyan)">\n'
        '      <line x1="86" y1="90" x2="86" y2="128"/><line x1="126" y1="90" x2="126" y2="128"/>\n'
        '      <line x1="86" y1="170" x2="86" y2="208"/><line x1="126" y1="170" x2="126" y2="208"/>\n'
        '      <line x1="150" y1="149" x2="184" y2="149"/>\n'
        '      <line x1="212" y1="92" x2="212" y2="124"/><line x1="212" y1="174" x2="212" y2="206"/>\n'
        '    </g>\n'
        '    <!-- Right: Abstract 4-Vertex Odd-Degree Multigraph -->\n'
        '    <g transform="translate(274, 0)">\n'
        '      <path d="M 90 74 Q 58 110 74 149" fill="none" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '      <path d="M 90 74 Q 108 110 74 149" fill="none" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '      <path d="M 90 224 Q 58 188 74 149" fill="none" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '      <path d="M 90 224 Q 108 188 74 149" fill="none" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '      <line x1="74" y1="149" x2="150" y2="149" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '      <line x1="90" y1="74" x2="150" y2="149" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '      <line x1="90" y1="224" x2="150" y2="149" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '      <circle cx="90" cy="74" r="14" fill="#102542" stroke="#e5c16c" stroke-width="1.8"/><text x="90" y="78" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="10" font-weight="bold" text-anchor="middle">d=3</text>\n'
        '      <circle cx="90" cy="224" r="14" fill="#102542" stroke="#e5c16c" stroke-width="1.8"/><text x="90" y="228" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="10" font-weight="bold" text-anchor="middle">d=3</text>\n'
        '      <circle cx="74" cy="149" r="14" fill="#102542" stroke="#4cc9f0" stroke-width="2.0"/><text x="74" y="153" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="10" font-weight="bold" text-anchor="middle">d=5</text>\n'
        '      <circle cx="150" cy="149" r="14" fill="#102542" stroke="#e5c16c" stroke-width="1.8"/><text x="150" y="153" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="10" font-weight="bold" text-anchor="middle">d=3</text>\n'
        '    </g>\n'
        '    <text x="141" y="38" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold" text-anchor="middle">7 BRIDGES · 4 LANDMASSES</text>\n'
        '    <text x="372" y="38" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="middle">4 ODD VERTICES · 1736</text>\n'
        '  </g>'
    )
    return svg_shell(body, "GM-03", "GRAPH TOPOLOGY")


def _svg_geo_mobius_strip() -> str:
    # Parametric 3D projection of a half-twisted single-sided ribbon with continuous dotted centerline!
    cx, cy = 240.0, 152.0
    R, half_w = 102.0, 26.0
    upper_edge: List[Tuple[float, float]] = []
    lower_edge: List[Tuple[float, float]] = []
    mid_curve: List[Tuple[float, float]] = []
    rungs: List[str] = []

    def proj(u: float, v: float) -> Tuple[float, float]:
        # Classic Mobius parametric embedding rotated for clear 3/4 view
        x3 = (R + v * math.cos(u / 2.0)) * math.cos(u)
        y3 = (R + v * math.cos(u / 2.0)) * math.sin(u)
        z3 = v * math.sin(u / 2.0)
        # Tilt around X axis by 56 degrees
        tilt = math.radians(56)
        yp = y3 * math.cos(tilt) - z3 * math.sin(tilt)
        return (cx + x3 * 1.12, cy + yp * 1.15)

    steps = 72
    for i in range(steps + 1):
        u = 2.0 * math.pi * i / steps
        p_up = proj(u, half_w)
        p_lo = proj(u, -half_w)
        p_md = proj(u, 0.0)
        upper_edge.append(p_up)
        lower_edge.append(p_lo)
        mid_curve.append(p_md)
        if i % 3 == 0:
            rungs.append(
                f'    <line x1="{p_up[0]:.1f}" y1="{p_up[1]:.1f}" x2="{p_lo[0]:.1f}" y2="{p_lo[1]:.1f}" stroke="#e5c16c" stroke-opacity="0.38" stroke-width="0.9"/>'
            )

    edge_pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in upper_edge)
    edge2_pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in lower_edge)
    mid_pts = " ".join(f"{x:.1f},{y:.1f}" for x, y in mid_curve)
    body = (
        '  <g>\n'
        + "\n".join(rungs) + "\n"
        f'    <polyline points="{edge_pts}" fill="none" stroke="url(#goldStroke)" stroke-width="2.6" filter="url(#glowGold)"/>\n'
        f'    <polyline points="{edge2_pts}" fill="none" stroke="url(#goldStroke)" stroke-width="2.6" filter="url(#glowGold)"/>\n'
        f'    <polyline points="{mid_pts}" fill="none" stroke="#4cc9f0" stroke-width="2.2" stroke-dasharray="5 3" filter="url(#glowCyan)"/>\n'
        '    <text x="240" y="42" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">NON-ORIENTABLE SURFACE · 180° HALF-TWIST</text>\n'
        '    <text x="240" y="252" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="middle">1 CONTINUOUS SIDE · 1 BOUNDARY EDGE · χ = 0</text>\n'
        '  </g>'
    )
    return svg_shell(body, "GM-04", "SURFACE TOPOLOGY")


def _svg_geo_logic_gates() -> str:
    # Digital Logic Half-Adder Circuit (XOR gate -> SUM, AND gate -> CARRY) + binary truth table
    body = (
        '  <g>\n'
        '    <!-- Input Rails A and B -->\n'
        '    <text x="48" y="96" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="13" font-weight="bold">A</text>\n'
        '    <text x="48" y="138" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="13" font-weight="bold">B</text>\n'
        '    <line x1="66" y1="92" x2="178" y2="92" stroke="#e5c16c" stroke-width="2.0"/>\n'
        '    <line x1="66" y1="134" x2="178" y2="134" stroke="#e5c16c" stroke-width="2.0"/>\n'
        '    <!-- Branch Drops to Lower Gate -->\n'
        '    <circle cx="104" cy="92" r="3.4" fill="#4cc9f0"/>\n'
        '    <polyline points="104,92 104,186 178,186" fill="none" stroke="#e5c16c" stroke-width="2.0"/>\n'
        '    <circle cx="132" cy="134" r="3.4" fill="#4cc9f0"/>\n'
        '    <polyline points="132,134 132,216 178,216" fill="none" stroke="#e5c16c" stroke-width="2.0"/>\n'
        '    <!-- Upper IEEE XOR Gate Symbol (Curved Double Back + Pointed Nose) -->\n'
        '    <path d="M 168 78 Q 182 113 168 148" fill="none" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <path d="M 176 78 Q 190 113 176 148 L 204 148 Q 238 144 254 113 Q 238 82 204 78 Z" fill="#102542" stroke="#4cc9f0" stroke-width="2.2" filter="url(#glowCyan)"/>\n'
        '    <line x1="254" y1="113" x2="310" y2="113" stroke="#4cc9f0" stroke-width="2.2"/>\n'
        '    <text x="318" y="117" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold">S</text>\n'
        '    <!-- Lower IEEE AND Gate Symbol (Flat Back + Semicircular Nose) -->\n'
        '    <path d="M 178 172 L 214 172 A 29 29 0 0 1 214 230 L 178 230 Z" fill="#10203a" stroke="url(#goldStroke)" stroke-width="2.2"/>\n'
        '    <line x1="243" y1="201" x2="310" y2="201" stroke="#e5c16c" stroke-width="2.2"/>\n'
        '    <text x="318" y="205" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="11" font-weight="bold">C</text>\n'
        '    <!-- Truth Table Box on Right -->\n'
        '    <g transform="translate(348, 72)" font-family="\'Consolas\',monospace" font-size="9.5">\n'
        '      <rect x="0" y="0" width="98" height="148" rx="3" fill="#091529" stroke="#e5c16c" stroke-opacity="0.6" stroke-width="1.1"/>\n'
        '      <text x="49" y="20" fill="#f4e6be" font-weight="bold" text-anchor="middle">A  B | C  S</text>\n'
        '      <line x1="8" y1="28" x2="90" y2="28" stroke="#4cc9f0" stroke-opacity="0.6"/>\n'
        '      <text x="49" y="50" fill="#7ce2ff" text-anchor="middle">0  0 | 0  0</text>\n'
        '      <text x="49" y="76" fill="#7ce2ff" text-anchor="middle">0  1 | 0  1</text>\n'
        '      <text x="49" y="102" fill="#7ce2ff" text-anchor="middle">1  0 | 0  1</text>\n'
        '      <text x="49" y="128" fill="#f7e4ad" font-weight="bold" text-anchor="middle">1  1 | 1  0</text>\n'
        '    </g>\n'
        '    <text x="240" y="42" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">2-INPUT BINARY COMBINATIONAL SCHEMATIC</text>\n'
        '  </g>'
    )
    return svg_shell(body, "GM-05", "BOOLEAN GATE LOGIC")


# --- 4 Music, Computing & Horological Craft Schematics ---

def _svg_music_treble_chords() -> str:
    # 5-line musical stave, golden G-clef curling around line 2, ledger-line C4 + E4 + G4 triad + interval brackets!
    staff_ys = [104, 122, 140, 158, 176]  # F5, D5, B4, G4 (line 2), E4 (line 1)
    staff_svg = "\n".join(
        f'    <line x1="56" y1="{y}" x2="424" y2="{y}" stroke="#e5c16c" stroke-opacity="0.68" stroke-width="1.2"/>'
        for y in staff_ys
    )
    body = (
        '  <g>\n'
        + staff_svg + "\n"
        '    <!-- Bar Lines -->\n'
        '    <line x1="56" y1="104" x2="56" y2="176" stroke="#e5c16c" stroke-width="2.0"/>\n'
        '    <line x1="418" y1="104" x2="418" y2="176" stroke="#e5c16c" stroke-width="1.2"/>\n'
        '    <line x1="424" y1="104" x2="424" y2="176" stroke="#e5c16c" stroke-width="3.0"/>\n'
        '    <!-- Stylized Golden G-Clef Spiraling Around Line 2 (y=158) -->\n'
        '    <path d="M 104 202 C 118 202 122 184 114 166 L 106 76 C 105 64 118 60 120 74 C 122 92 92 124 92 152 C 92 174 114 182 126 168 C 136 156 128 138 112 140 C 102 142 99 156 108 162" fill="none" stroke="url(#goldStroke)" stroke-width="3.2" stroke-linecap="round" filter="url(#glowGold)"/>\n'
        '    <circle cx="111" cy="158" r="3.5" fill="#4cc9f0"/>\n'
        '    <!-- Ledger Line for Lower Root Note (y=194) + Stacked Triad (194, 176, 158) -->\n'
        '    <line x1="176" y1="194" x2="212" y2="194" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <!-- Arpeggiated Notes (Root, 3rd, 5th) -->\n'
        '    <ellipse cx="194" cy="194" rx="10" ry="7.2" transform="rotate(-18 194 194)" fill="#4cc9f0" filter="url(#glowCyan)"/>\n'
        '    <line x1="203" y1="192" x2="203" y2="132" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '    <ellipse cx="250" cy="176" rx="10" ry="7.2" transform="rotate(-18 250 176)" fill="#4cc9f0" filter="url(#glowCyan)"/>\n'
        '    <line x1="259" y1="174" x2="259" y2="114" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '    <ellipse cx="306" cy="158" rx="10" ry="7.2" transform="rotate(-18 306 158)" fill="#4cc9f0" filter="url(#glowCyan)"/>\n'
        '    <line x1="315" y1="156" x2="315" y2="96" stroke="#4cc9f0" stroke-width="1.8"/>\n'
        '    <!-- Stacked Block Chord at Right -->\n'
        '    <line x1="354" y1="194" x2="390" y2="194" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <ellipse cx="372" cy="194" rx="10" ry="7" transform="rotate(-18 372 194)" fill="#e5c16c"/>\n'
        '    <ellipse cx="372" cy="176" rx="10" ry="7" transform="rotate(-18 372 176)" fill="#e5c16c"/>\n'
        '    <ellipse cx="372" cy="158" rx="10" ry="7" transform="rotate(-18 372 158)" fill="#e5c16c"/>\n'
        '    <line x1="381" y1="192" x2="381" y2="108" stroke="#e5c16c" stroke-width="1.8"/>\n'
        '    <!-- Semitone Interval Brackets (4 + 3 = 7 semitones!) -->\n'
        '    <text x="222" y="226" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="middle">+4 SEMITONES</text>\n'
        '    <text x="284" y="226" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.6" text-anchor="middle">+3 SEMITONES</text>\n'
        '    <text x="240" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">ROOT-POSITION TRIAD · 0 SHARPS / 0 FLATS</text>\n'
        '    <text x="240" y="248" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">SPIRAL ANCHOR: LINE 2 (392.0 HZ)</text>\n'
        '  </g>'
    )
    return svg_shell(body, "MU-01", "HARMONIC NOTATION")


def _svg_music_circle_fifths() -> str:
    # 12-sector horological wheel showing exact sharp/flat key signature progression clockwise (+7 semitones)
    cx, cy = 240.0, 150.0
    sigs = ["0", "1♯", "2♯", "3♯", "4♯", "5♯", "6♯/6♭", "5♭", "4♭", "3♭", "2♭", "1♭"]
    nodes: List[str] = []
    for k, sig in enumerate(sigs):
        ang = math.radians(k * 30 - 90)
        x_out = cx + math.cos(ang) * 94
        y_out = cy + math.sin(ang) * 94
        x_in = cx + math.cos(ang) * 56
        y_in = cy + math.sin(ang) * 56
        nodes.append(f'    <line x1="{x_in:.1f}" y1="{y_in:.1f}" x2="{x_out:.1f}" y2="{y_out:.1f}" stroke="#e5c16c" stroke-opacity="0.35" stroke-width="0.9"/>')
        col = "#4cc9f0" if k in (0, 6) else "#e5c16c"
        nodes.append(f'    <circle cx="{x_out:.1f}" cy="{y_out:.1f}" r="14" fill="#0d203a" stroke="{col}" stroke-width="1.4"/>')
        nodes.append(f'    <text x="{x_out:.1f}" y="{y_out + 3.5:.1f}" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.5" font-weight="bold" text-anchor="middle">{xml_esc(sig)}</text>')
    body = (
        '  <g>\n'
        f'    <circle cx="{cx}" cy="{cy}" r="94" fill="none" stroke="#4cc9f0" stroke-width="1.8" filter="url(#glowCyan)"/>\n'
        f'    <circle cx="{cx}" cy="{cy}" r="56" fill="#091529" stroke="#e5c16c" stroke-opacity="0.65" stroke-width="1.2"/>\n'
        + "\n".join(nodes) + "\n"
        f'    <text x="{cx}" y="{cy - 4}" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold" text-anchor="middle">12 PITCHES</text>\n'
        f'    <text x="{cx}" y="{cy + 11}" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">↻ +7 SEMITONES</text>\n'
        '    <text x="64" y="54" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4">↺ +♭ FLATS</text>\n'
        '    <text x="416" y="54" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="end">↻ +♯ SHARPS</text>\n'
        '  </g>'
    )
    return svg_shell(body, "MU-02", "CHROMATIC WHEEL")


def _svg_tech_von_neumann() -> str:
    # Stored-Program Computer Architecture block diagram: CPU (Control Unit + ALU) <-> Single Shared Bus <-> Unified Memory + I/O
    body = (
        '  <g>\n'
        '    <!-- Central Processing Unit Enclosure -->\n'
        '    <rect x="44" y="64" width="166" height="172" rx="5" fill="#0d1e36" stroke="url(#goldStroke)" stroke-width="2.0"/>\n'
        '    <text x="127" y="84" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.2" font-weight="bold" text-anchor="middle">CENTRAL PROCESSOR</text>\n'
        '    <rect x="60" y="96" width="134" height="52" rx="3" fill="#102847" stroke="#4cc9f0" stroke-width="1.5"/>\n'
        '    <text x="127" y="126" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold" text-anchor="middle">CONTROL UNIT</text>\n'
        '    <rect x="60" y="166" width="134" height="52" rx="3" fill="#102847" stroke="#e5c16c" stroke-width="1.5"/>\n'
        '    <text x="127" y="196" fill="#f7e4ad" font-family="\'Consolas\',monospace" font-size="9.5" font-weight="bold" text-anchor="middle">ARITHMETIC LOGIC</text>\n'
        '    <!-- Single Shared Bottleneck Bus (Highlighted in Cyan!) -->\n'
        '    <rect x="210" y="138" width="82" height="24" fill="#0c2c4a" stroke="#4cc9f0" stroke-width="2.0" filter="url(#glowCyan)"/>\n'
        '    <text x="251" y="153" fill="#9ef0ff" font-family="\'Consolas\',monospace" font-size="8.0" font-weight="bold" text-anchor="middle">SHARED BUS</text>\n'
        '    <!-- Unified Memory Block (Instructions + Data Together!) -->\n'
        '    <rect x="292" y="64" width="144" height="114" rx="5" fill="#0e223e" stroke="#4cc9f0" stroke-width="2.0" filter="url(#glowCyan)"/>\n'
        '    <text x="364" y="88" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="9.2" font-weight="bold" text-anchor="middle">UNIFIED MEMORY</text>\n'
        '    <rect x="306" y="100" width="116" height="28" rx="2" fill="#081529" stroke="#e5c16c" stroke-width="1.1"/>\n'
        '    <text x="364" y="118" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">PROGRAM CODE</text>\n'
        '    <rect x="306" y="136" width="116" height="28" rx="2" fill="#081529" stroke="#4cc9f0" stroke-width="1.1"/>\n'
        '    <text x="364" y="154" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.4" text-anchor="middle">WORKING DATA</text>\n'
        '    <!-- I/O Unit -->\n'
        '    <rect x="292" y="196" width="144" height="40" rx="4" fill="#0d1d34" stroke="#e5c16c" stroke-width="1.4"/>\n'
        '    <text x="364" y="220" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9.0" font-weight="bold" text-anchor="middle">INPUT / OUTPUT</text>\n'
        '    <line x1="251" y1="162" x2="251" y2="216" stroke="#e5c16c" stroke-width="1.6"/>\n'
        '    <line x1="251" y1="216" x2="292" y2="216" stroke="#e5c16c" stroke-width="1.6"/>\n'
        '    <text x="240" y="42" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.8" font-weight="bold" text-anchor="middle">STORED-PROGRAM MODEL · 1945 REPORT</text>\n'
        '  </g>'
    )
    return svg_shell(body, "TC-01", "COMPUTING ARCHITECTURE")


def _svg_craft_watch_escapement() -> str:
    # Mechanical Horology Blueprint: 15-tooth club escape wheel + jeweled anchor fork + oscillating balance wheel & hairspring spiral!
    # Left wheel (escape wheel): center (146, 152), 15 angled club teeth
    ecx, ecy = 146.0, 152.0
    teeth_pts: List[str] = []
    for k in range(15):
        a1 = math.radians(k * 24)
        a2 = math.radians(k * 24 + 8)
        a3 = math.radians(k * 24 + 13)
        a4 = math.radians(k * 24 + 18)
        teeth_pts.append(f"{ecx + 38 * math.cos(a1):.1f},{ecy + 38 * math.sin(a1):.1f}")
        teeth_pts.append(f"{ecx + 58 * math.cos(a2):.1f},{ecy + 58 * math.sin(a2):.1f}")
        teeth_pts.append(f"{ecx + 60 * math.cos(a3):.1f},{ecy + 60 * math.sin(a3):.1f}")
        teeth_pts.append(f"{ecx + 38 * math.cos(a4):.1f},{ecy + 38 * math.sin(a4):.1f}")
    # Hairspring Archimedean spiral centered on balance wheel (344, 152)
    bcx, bcy = 344.0, 152.0
    spiral_pts: List[str] = []
    for i in range(90):
        t = i / 12.0
        r = 6.0 + t * 5.2
        ang = t * math.pi * 2.0
        spiral_pts.append(f"{bcx + r * math.cos(ang):.1f},{bcy + r * math.sin(ang):.1f}")
    body = (
        '  <g>\n'
        f'    <!-- 15-Tooth Escape Wheel -->\n'
        f'    <polygon points="{" ".join(teeth_pts)}" fill="#10213b" stroke="url(#goldStroke)" stroke-width="1.6" filter="url(#glowGold)"/>\n'
        f'    <circle cx="{ecx}" cy="{ecy}" r="24" fill="#091326" stroke="#e5c16c" stroke-width="1.2"/>\n'
        f'    <circle cx="{ecx}" cy="{ecy}" r="5.5" fill="#4cc9f0"/>\n'
        '    <!-- Jeweled Anchor Pallet Fork (Glowing Cyan) -->\n'
        '    <path d="M 192 106 L 222 114 L 246 152 L 222 190 L 192 198 L 198 184 L 220 176 L 236 152 L 220 128 L 198 120 Z" fill="#102a4a" stroke="#4cc9f0" stroke-width="1.8" filter="url(#glowCyan)"/>\n'
        '    <line x1="246" y1="152" x2="294" y2="152" stroke="#4cc9f0" stroke-width="3.2" filter="url(#glowCyan)"/>\n'
        '    <circle cx="246" cy="152" r="4.5" fill="#e5c16c"/>\n'
        '    <!-- Oscillating Balance Wheel & Spiral Hairspring -->\n'
        f'    <circle cx="{bcx}" cy="{bcy}" r="64" fill="none" stroke="url(#goldStroke)" stroke-width="4.2"/>\n'
        f'    <circle cx="{bcx}" cy="{bcy}" r="56" fill="none" stroke="#e5c16c" stroke-opacity="0.45" stroke-width="1.0"/>\n'
        f'    <line x1="{bcx-56}" y1="{bcy}" x2="{bcx+56}" y2="{bcy}" stroke="#e5c16c" stroke-opacity="0.55" stroke-width="2.2"/>\n'
        f'    <polyline points="{" ".join(spiral_pts)}" fill="none" stroke="#4cc9f0" stroke-width="1.4" filter="url(#glowCyan)"/>\n'
        f'    <circle cx="{bcx}" cy="{bcy}" r="5" fill="#e5c16c"/>\n'
        '    <text x="240" y="42" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="9" font-weight="bold" text-anchor="middle">15-TOOTH WHEEL · RUBY PALLET FORK · 28,800 VPH</text>\n'
        '    <text x="146" y="240" fill="#7ce2ff" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">IMPULSE GEAR</text>\n'
        '    <text x="344" y="240" fill="#f4e6be" font-family="\'Consolas\',monospace" font-size="8.2" text-anchor="middle">ISOCHRONOUS OSCILLATOR</text>\n'
        '  </g>'
    )
    return svg_shell(body, "HR-01", "HOROLOGICAL CALIBRE")


MULTI_DOMAIN_SVG_RENDERERS: Dict[str, Callable[[], str]] = {
    # 10 Architectural Elevations & Floorplans
    "arch_parthenon": _svg_arch_parthenon,
    "arch_taj_mahal": _svg_arch_taj_mahal,
    "arch_sydney_opera": _svg_arch_sydney_opera,
    "arch_colosseum": _svg_arch_colosseum,
    "arch_eiffel_tower": _svg_arch_eiffel_tower,
    "arch_sagrada_familia": _svg_arch_sagrada_familia,
    "arch_great_pyramid": _svg_arch_great_pyramid,
    "arch_hagia_sophia": _svg_arch_hagia_sophia,
    "arch_pantheon_rome": _svg_arch_pantheon_rome,
    "arch_angkor_wat": _svg_arch_angkor_wat,
    # 6 Star Constellations
    "star_orion": _svg_star_orion,
    "star_cassiopeia": _svg_star_cassiopeia,
    "star_ursa_major": _svg_star_ursa_major,
    "star_crux": _svg_star_crux,
    "star_scorpius": _svg_star_scorpius,
    "star_cygnus": _svg_star_cygnus,
    # 8 Molecular & Quantum Orbitals
    "mol_water": _svg_mol_water,
    "mol_benzene": _svg_mol_benzene,
    "mol_dna_helix": _svg_mol_dna_helix,
    "mol_caffeine": _svg_mol_caffeine,
    "mol_atp": _svg_mol_atp,
    "mol_aspirin": _svg_mol_aspirin,
    "mol_d_orbital": _svg_mol_d_orbital,
    "mol_glucose": _svg_mol_glucose,
    # 6 World Flag Geometric Blueprints
    "flag_nepal": _svg_flag_nepal,
    "flag_switzerland": _svg_flag_switzerland,
    "flag_uk_union": _svg_flag_uk_union,
    "flag_south_korea": _svg_flag_south_korea,
    "flag_nordic_cross": _svg_flag_nordic_cross,
    "flag_seychelles": _svg_flag_seychelles,
    # 5 Historical Battle & Maritime Maps
    "map_cannae": _svg_map_cannae,
    "map_panama_canal": _svg_map_panama_canal,
    "map_thermopylae": _svg_map_thermopylae,
    "map_bosporus_strait": _svg_map_bosporus_strait,
    "map_suez_canal": _svg_map_suez_canal,
    # 5 Classical Math, Topology & Boolean Logic
    "geo_pythagoras": _svg_geo_pythagoras,
    "geo_golden_spiral": _svg_geo_golden_spiral,
    "geo_konigsberg": _svg_geo_konigsberg,
    "geo_mobius_strip": _svg_geo_mobius_strip,
    "geo_logic_gates": _svg_geo_logic_gates,
    # 4 Music, Computing & Horology
    "music_treble_chords": _svg_music_treble_chords,
    "music_circle_fifths": _svg_music_circle_fifths,
    "tech_von_neumann": _svg_tech_von_neumann,
    "craft_watch_escapement": _svg_craft_watch_escapement,
}


# ============================================================================
# VISUAL SAPPHIRE BLUEPRINT SIGHTLINE_LOCK QUESTIONS (170 TOTAL)
# 60 MLB Ballpark Blueprints + 110 Multi-Domain Blueprints
# ============================================================================

def _vis_q(
    slug: str,
    caption: str,
    l0: int,
    l1_id: str,
    l2_id: str,
    l1_cat: str,
    l2_sub: str,
    micro: str,
    prompt: str,
    ans: str,
    dists: Tuple[str, str, str],
    clues: Tuple[str, str],
    why: str,
    irt_b: float,
    glyph: str,
    regions: Optional[List[str]] = None,
    tone: str = "PRESTIGE",
) -> Dict[str, Any]:
    return {
        "l0Domain": l0,
        "l1Id": l1_id,
        "l2Id": l2_id,
        "l1Category": l1_cat,
        "l2Subcategory": l2_sub,
        "microTopicId": micro,
        "regions": regions or ["GLOBAL"],
        "narrativeTags": ["ARCHIVE_CORE", "LATERAL_DEDUCTION"],
        "tone": tone,
        "irtB": round(irt_b, 2),
        "irtA": 1.25,
        "freshness": "EVERGREEN",
        "archetype": "SIGHTLINE_LOCK",
        "prompt": prompt,
        "answerCorrect": ans,
        "distractors": [
            {"text": dists[0], "plausibility": 0.86},
            {"text": dists[1], "plausibility": 0.82},
            {"text": dists[2], "plausibility": 0.78},
        ],
        "clues": [clues[0], clues[1]],
        "glyphHint": glyph,
        "whyExplanation": why,
        "visualPlate": {
            "imageUrl": f"./assets/visuals/{slug}.svg",
            "caption": caption,
            "aspect": "WIDE",
        },
    }


def build_baseball_visual_questions() -> List[Dict[str, Any]]:
    bb = lambda slug, cap, micro, pr, ans, d, cl, why, irt: _vis_q(
        slug, cap, 5, "sports", "sports_baseball", "Sports", "Baseball",
        micro, pr, ans, d, cl, why, irt, "star", ["US", "GLOBAL"], "PRESTIGE",
    )
    return [
        # 1. Fenway Park (3 Qs)
        bb("bp_fenway", "Scaled Outfield Geometry · Plate BB-01", "vis_bb_fenway_park",
           "Study this asymmetric diamond blueprint featuring a 310-foot left-field line guarded by a 37-foot wall, a 420-foot deep triangle, and a 302-foot right-field pole. Which historic MLB ballpark is mapped?",
           "Fenway Park", ("Wrigley Field", "Oriole Park at Camden Yards", "Oracle Park"),
           ("It is Major League Baseball's oldest active venue, opened in April 1912.", "Located near Kenmore Square in New England's largest city."),
           "Opened on April 20, 1912 in Boston, Fenway Park's quirky street-grid lot created its iconic 310 ft left wall, 420 ft center triangle, and 302 ft right foul pole.", -1.1),
        bb("bp_fenway", "Scaled Outfield Geometry · Plate BB-01", "vis_bb_fenway_team",
           "Which American League franchise has played home games inside the asymmetrical diamond charted in this 1912 blueprint for more than a century?",
           "Boston Red Sox", ("Chicago Cubs", "Detroit Tigers", "New York Yankees"),
           ("This club ended an 86-year World Series drought in 2004.", "Ted Williams, Carl Yastrzemski, and David Ortiz all launched homers over these fences."),
           "The Boston Red Sox have hosted home games at Fenway Park continuously since 1912, making it the longest-tenured stadium in MLB.", -0.9),
        bb("bp_fenway", "Scaled Outfield Geometry · Plate BB-01", "vis_bb_fenway_wall",
           "What famous nickname is given to the 37-foot-tall left-field wall highlighted in cyan on this ballpark blueprint?",
           "The Green Monster", ("The Ivy Wall", "The Crawford Boxes", "The Western Metal Facade"),
           ("Constructed of tin-clad wood and later hard plastic over steel, it houses a hand-operated scoreboard.", "It was painted its signature emerald shade in 1947 after years of advertisements."),
           "Standing 37 feet 2 inches tall just 310 feet from home plate, Fenway Park's left-field barrier is universally known as The Green Monster.", -1.0),

        # 2. Wrigley Field (3 Qs)
        bb("bp_wrigley", "Scaled Outfield Geometry · Plate BB-02", "vis_bb_wrigley_park",
           "Examine this 1914 blueprint showcasing deep 355-foot and 353-foot foul lines, symmetrical 368-foot power wells, a brick perimeter, and a manual center-field scoreboard. Which iconic ballpark is this?",
           "Wrigley Field", ("Fenway Park", "Dodger Stadium", "Busch Stadium"),
           ("Built originally for the Federal League's Whales, it hosted its first night MLB game only in 1988.", "Its outer outfield brick wall is covered in lush Boston ivy planted in 1937."),
           "Opened in 1914 on Chicago's North Side, Wrigley Field is celebrated for its 355-400-353 dimensions, 368-foot corner wells, hand-turned scoreboard, and ivy-clad brick walls.", -1.0),
        bb("bp_wrigley", "Scaled Outfield Geometry · Plate BB-02", "vis_bb_wrigley_team",
           "Which National League charter franchise has called this 1914 brick-and-vine North Side ballpark home since 1916?",
           "Chicago Cubs", ("St. Louis Cardinals", "Cincinnati Reds", "Pittsburgh Pirates"),
           ("This franchise broke a 108-year championship drought in Game 7 of the 2016 World Series.", "Hall of Famer Ernie Banks famously said 'Let's play two' on this grass."),
           "The Chicago Cubs moved into Weeghman Park (later renamed Wrigley Field) in 1916 and have played there ever since.", -0.95),
        bb("bp_wrigley", "Scaled Outfield Geometry · Plate BB-02", "vis_bb_wrigley_lights",
           "The 1914 ballpark mapped here was the very last Major League stadium to install permanent stadium floodlights. In what year did it finally play its first official night game?",
           "1988", ("1972", "1964", "1994"),
           ("Its inaugural scheduled night game against Philadelphia on August 8 was rained out in the fourth inning.", "The first completed night contest happened the very next evening against the Mets in the late 1980s."),
           "Wrigley Field remained daytime-only for 74 seasons until August 1988, when permanent lights finally illuminated MLB's penultimate classic jewel box.", 0.35),

        # 3. Original Yankee Stadium 1923 (3 Qs)
        bb("bp_yankee_classic", "Scaled Outfield Geometry · Plate BB-03", "vis_bb_yankee23_park",
           "Inspect this 1923 blueprint featuring a cavernous 457-foot left-center alley, a 461-foot center wall, an iconic rooftop frieze, and a tempting 295-foot right-field foul line. Which historic venue is shown?",
           "Original Yankee Stadium", ("Polo Grounds", "Ebbets Field", "Tiger Stadium"),
           ("Dubbed 'The House That Ruth Built', it stood in the Bronx from 1923 until 2008.", "Its vast left-center expanse was dreaded by right-handed power hitters as 'Death Valley'."),
           "Opening in 1923, original Yankee Stadium paired a short 295-foot right-field line tailored for Babe Ruth with a colossal 457-foot left-center 'Death Valley'.", -0.55),
        bb("bp_yankee_classic", "Scaled Outfield Geometry · Plate BB-03", "vis_bb_yankee23_slugger",
           "Which left-handed slugger inspired the famously short 295-foot right-field fence in this 1923 blueprint, hitting a three-run homer on Opening Day to christen the venue?",
           "Babe Ruth", ("Lou Gehrig", "Mickey Mantle", "Joe DiMaggio"),
           ("He was sold from Boston to New York prior to the 1920 season and wore number 3.", "His towering blasts prompted reporters to call the stadium 'The House' he built."),
           "Babe Ruth christened Yankee Stadium on April 18, 1923 with a three-run home run into the right-field bleachers, launching an era of Bronx dominance.", -1.05),
        bb("bp_yankee_classic", "Scaled Outfield Geometry · Plate BB-03", "vis_bb_yankee23_valley",
           "What ominous nickname did hitters give to the vast 457-foot left-center-field expanse highlighted in cyan on this 1923 ballpark blueprint?",
           "Death Valley", ("Triples Alley", "The Bermuda Triangle", "No Man's Land"),
           ("Right-handed legend Joe DiMaggio lost dozens of potential home runs to this deep cavern.", "It shares its name with the lowest, hottest desert basin in North America."),
           "Prior to the 1974–1975 renovation, Yankee Stadium's cavernous 457-foot left-center alley was universally feared as 'Death Valley'.", 0.25),

        # 4. Modern Yankee Stadium 2009 (3 Qs)
        bb("bp_yankee_modern", "Scaled Outfield Geometry · Plate BB-04", "vis_bb_yankee09_park",
           "Built in 2009 directly across East 161st Street from its predecessor, this blueprint preserves a 314-foot right-field porch, 408-foot center field, and signature scalloped roof frieze. Name the venue.",
           "Yankee Stadium", ("Citi Field", "Citizens Bank Park", "Target Field"),
           ("Its inaugural 2009 season ended with the franchise's 27th World Series championship.", "Its limestone exterior echoes the 1923 Bronx cathedral it replaced."),
           "Opened in 2009 in the Bronx, the current Yankee Stadium replicates the classic 318-399-408-385-314 post-1976 dimensions and trademark short right-field porch.", -0.85),
        bb("bp_yankee_modern", "Scaled Outfield Geometry · Plate BB-04", "vis_bb_yankee09_monument",
           "Just beyond the 408-foot center-field wall in this 2009 Bronx blueprint lies an open-air museum honoring club legends' retired numbers and plaques. What is it called?",
           "Monument Park", ("Cooperstown Gallery", "Legends Walk", "Heritage Plaza"),
           ("Until 1973, its earliest stone slabs actually stood in fair territory inside center field.", "Bronx icons from Ruth and Gehrig to Derek Jeter are memorialized here."),
           "Monument Park sits directly behind the center-field fence at Yankee Stadium, housing bronze plaques and granite monuments to franchise immortals.", -0.35),
        bb("bp_yankee_modern", "Scaled Outfield Geometry · Plate BB-04", "vis_bb_yankee09_porch",
           "Which batting handedness gains the greatest home-run advantage from the cyan-highlighted 314-foot short porch on this 2009 blueprint?",
           "Left-handed pull hitters", ("Right-handed pull hitters", "Switch-hitting bunt specialists", "Dead-center opposite-field hitters"),
           ("Pulling a fly ball down the right-field foul line clears the fence at just 314 feet.", "Sluggers like Juan Soto and Reggie Jackson have historically feasted on this corner."),
           "Because the right-field wall sits only 314 feet from home plate, left-handed pull hitters routinely turn modest fly balls into short-porch home runs.", -0.6),

        # 5. Oracle Park (3 Qs)
        bb("bp_oracle", "Scaled Outfield Geometry · Plate BB-05", "vis_bb_oracle_park",
           "Inspect this 2000 blueprint displaying a deep 415-foot right-center alley, a 24-foot brick right-field wall only 309 feet from home, and open tidal water immediately beyond the fence. Name the ballpark.",
           "Oracle Park", ("Petco Park", "PNC Park", "Oriole Park at Camden Yards"),
           ("Kayakers gather in the water beyond right field hoping to retrieve 'Splash Hit' home runs.", "Originally opened as Pacific Bell Park on the China Basin waterfront."),
           "Opened in 2000 along San Francisco Bay, Oracle Park pairs a 24-foot brick right-field wall (309 ft) with a deep 415 ft Triples Alley and McCovey Cove right behind it.", -0.75),
        bb("bp_oracle", "Scaled Outfield Geometry · Plate BB-05", "vis_bb_oracle_cove",
           "Which Hall of Fame first baseman lends his name to the bay inlet shown beyond the 309-foot right-field wall where 'Splash Hit' homers land?",
           "Willie McCovey", ("Willie Mays", "Barry Bonds", "Orlando Cepeda"),
           ("Nicknamed 'Stretch', he hit 521 career MLB home runs and won the 1969 NL MVP.", "A statue of this left-handed Giants slugger stands across the waterway from the stadium."),
           "The inlet of San Francisco Bay behind Oracle Park's right-field wall is famously dubbed McCovey Cove in honor of Giants legend Willie McCovey.", -0.15),
        bb("bp_oracle", "Scaled Outfield Geometry · Plate BB-05", "vis_bb_oracle_wall24",
           "The cyan-highlighted right-field brick wall in this blueprint stands exactly 24 feet tall to honor the uniform number of which legendary center fielder?",
           "Willie Mays", ("Jackie Robinson", "Ken Griffey Jr.", "Joe DiMaggio"),
           ("Known as the 'Say Hey Kid', he made 'The Catch' in the 1954 World Series.", "His jersey number 24 was retired league-wide in MLB ceremonies and graces the ballpark's street address."),
           "Oracle Park's 24-foot-high right-field wall — and its 24 Willie Mays Plaza address — both pay tribute to Hall of Famer Willie Mays's iconic number 24.", 0.15),

        # 6. Dodger Stadium (3 Qs)
        bb("bp_dodger", "Scaled Outfield Geometry · Plate BB-06", "vis_bb_dodger_park",
           "Examine this impeccably symmetrical 1962 blueprint (330-375-395-375-330) flanked by twin mid-century zigzag folded-plate pavilion canopies. Which storied West Coast ballpark is plotted?",
           "Dodger Stadium", ("Angel Stadium", "Kauffman Stadium", "Petco Park"),
           ("Carved into Chavez Ravine overlooking downtown Los Angeles, it is MLB's third-oldest active venue.", "Sandy Koufax, Clayton Kershaw, and Shohei Ohtani have all starred on this mound."),
           "Opened in 1962 in Chavez Ravine, Dodger Stadium is famed for its pure bilateral symmetry (330-375-395-375-330) and iconic corrugated zigzag outfield pavilion roofs.", -0.85),
        bb("bp_dodger", "Scaled Outfield Geometry · Plate BB-06", "vis_bb_dodger_ravine",
           "Into which celebrated Los Angeles hillside canyon was the symmetrical 1962 ballpark mapped here terraced and excavated?",
           "Chavez Ravine", ("Laurel Canyon", "Runyon Canyon", "Topanga Canyon"),
           ("Its terraced hillside design allows fans to enter directly onto their own seating deck level from parking lots.", "Located just north of downtown Los Angeles near Elysian Park."),
           "Architect Emil Praeger terraced Dodger Stadium directly into the hillside slopes of Chavez Ravine, creating unmatched sightlines toward the San Gabriel Mountains.", -0.25),
        bb("bp_dodger", "Scaled Outfield Geometry · Plate BB-06", "vis_bb_dodger_pitcher",
           "On September 9, 1965, which Hall of Fame left-hander threw a 14-strikeout perfect game inside the symmetrical 1962 ballpark mapped here?",
           "Sandy Koufax", ("Don Drysdale", "Fernando Valenzuela", "Clayton Kershaw"),
           ("He won three unanimous Cy Young Awards in four seasons before retiring at age 30.", "He outdueled Chicago's Bob Hendley in a 1-0 masterpiece featuring only one total hit."),
           "Sandy Koufax retired all 27 Cubs batters at Dodger Stadium on September 9, 1965, striking out 14 in one of the greatest pitching performances ever recorded.", -0.2),

        # 7. Oriole Park at Camden Yards (3 Qs)
        bb("bp_camden", "Scaled Outfield Geometry · Plate BB-07", "vis_bb_camden_park",
           "Inspect this landmark 1992 retro-classic blueprint featuring a 318-foot right-field fence, a 25-foot scoreboard wall, and a 1,016-foot brick warehouse running parallel behind right field. Name the ballpark.",
           "Oriole Park at Camden Yards", ("PNC Park", "Petco Park", "Busch Stadium"),
           ("Its 1992 debut sparked an entire nationwide generation of intimate brick downtown ballparks.", "Cal Ripken Jr. broke Lou Gehrig's consecutive-games streak here in 1995."),
           "Opened in 1992 in downtown Baltimore, Oriole Park at Camden Yards pioneered the retro-classic ballpark movement by framing right field with the 1,016-foot B&O Warehouse.", -0.8),
        bb("bp_camden", "Scaled Outfield Geometry · Plate BB-07", "vis_bb_camden_street",
           "What is the name of the bustling pedestrian promenade running directly between the right-field seats and the 1,016-foot brick warehouse shown on this blueprint?",
           "Eutaw Street", ("Lansdowne Street", "Yawkey Way", "Waveland Avenue"),
           ("Bronze baseball plaques embedded in its sidewalk mark every home run ever hit onto it.", "Ken Griffey Jr. is still the only hitter to strike the brick warehouse wall on the fly during the 1993 Home Run Derby."),
           "Eutaw Street separates Camden Yards' right-field flag court from the B&O Warehouse, with bronze plaques commemorating every Eutaw Street home run.", 0.2),
        bb("bp_camden", "Scaled Outfield Geometry · Plate BB-07", "vis_bb_camden_streak",
           "On September 6, 1995, inside the ballpark charted in this blueprint, which Iron Man surpassed Lou Gehrig by playing in his 2,131st consecutive MLB game?",
           "Cal Ripken Jr.", ("Brooks Robinson", "Eddie Murray", "Frank Robinson"),
           ("He homered during the historic game and took a 22-minute standing ovation lap around the field.", "His final consecutive-games streak reached 2,632 before he sat out in 1998."),
           "Cal Ripken Jr. played his 2,131st straight game at Camden Yards on September 6, 1995, while giant numbered banners unfurled along the B&O Warehouse facade.", -0.7),

        # 8. Polo Grounds (3 Qs)
        bb("bp_polo_grounds", "Scaled Outfield Geometry · Plate BB-08", "vis_bb_polo_park",
           "Marvel at this unmistakable 'bathtub' horseshoe blueprint with absurdly short 279-foot and 258-foot foul lines plunging straight back to a colossal 483-foot dead center field. Which legendary defunct venue is this?",
           "Polo Grounds", ("Ebbets Field", "Shibe Park", "Forbes Field"),
           ("Located beneath Coogan's Bluff in Upper Manhattan, it hosted MLB games until 1963.", "Its outfield geometry made routine 265-foot pop-ups homers down the line while swallowing 460-foot blasts to center."),
           "Rebuilt in 1911 in Manhattan, the Polo Grounds' oblong horseshoe dimensions (279 ft LF, 483 ft CF, 258 ft RF) produced some of the most famous plays in baseball lore.", -0.5),
        bb("bp_polo_grounds", "Scaled Outfield Geometry · Plate BB-08", "vis_bb_polo_catch",
           "During Game 1 of the 1954 World Series, who sprinted into the cavernous 460-foot center-field pocket of this blueprint to make an iconic over-the-shoulder grab known simply as 'The Catch'?",
           "Willie Mays", ("Duke Snider", "Mickey Mantle", "Roberto Clemente"),
           ("He robbed Cleveland's Vic Wertz with his back to home plate before wheeling and firing back to the infield.", "He starred for the New York Giants before moving west with the franchise in 1958."),
           "Only the Polo Grounds' colossal 483-foot center field allowed Vic Wertz's 425-foot drive to stay in play for Willie Mays's immortal over-the-shoulder catch in 1954.", -0.65),
        bb("bp_polo_grounds", "Scaled Outfield Geometry · Plate BB-08", "vis_bb_polo_shot",
           "In October 1951, Bobby Thomson's 'Shot Heard 'Round the World' cleared the short 315-foot lower left-field porch mapped here to win the NL pennant for which franchise?",
           "New York Giants", ("Brooklyn Dodgers", "New York Mets", "New York Yankees"),
           ("Broadcaster Russ Hodges's ecstatic call ('The Giants win the pennant!') echoed across America.", "They defeated their cross-river Brooklyn rivals in a three-game playoff tiebreaker."),
           "Bobby Thomson's walk-off three-run homer off Ralph Branca at the Polo Grounds on October 3, 1951 clinched the National League pennant for the New York Giants.", -0.3),

        # 9. Astrodome (3 Qs)
        bb("bp_astrodome", "Scaled Outfield Geometry · Plate BB-09", "vis_bb_astrodome_park",
           "Study this 1965 circular blueprint enclosed beneath a 642-foot clear-span steel lamella geodesic dome rising 208 feet above the grass. Which revolutionary 'Eighth Wonder of the World' stadium is drawn?",
           "Astrodome", ("Tropicana Field", "Metrodome", "Kingdome"),
           ("Opened in Houston in April 1965, it became the world's first multi-purpose air-conditioned domed sports stadium.", "Glare from its translucent roof panels forced the invention of synthetic playing turf in 1966."),
           "Opening in 1965 in Houston, the Astrodome pioneered indoor major-league baseball under a 642-foot clear-span geodesic truss roof.", -0.7),
        bb("bp_astrodome", "Scaled Outfield Geometry · Plate BB-09", "vis_bb_astrodome_turf",
           "When painted skylight panels killed the natural grass inside the 1965 domed venue charted here, what pioneering synthetic playing surface debuted on its floor in 1966?",
           "AstroTurf", ("FieldTurf", "OmniTurf", "PolyGrass"),
           ("Originally patented by Monsanto as 'ChemGrass', it was rebranded after its famous stadium showcase.", "Its short nylon carpet dramatically sped up ground balls across baseball for decades."),
           "After translucent roof panels were painted to stop blinding outfielders, natural grass died in 1965, leading Monsanto to install 'AstroTurf' for the 1966 season.", -0.55),
        bb("bp_astrodome", "Scaled Outfield Geometry · Plate BB-09", "vis_bb_astrodome_homer",
           "During an April 9, 1965 exhibition opener attended by President Lyndon B. Johnson, which Yankees legend hit the very first indoor home run inside this domed ballpark?",
           "Mickey Mantle", ("Joe Morgan", "Willie Mays", "Hank Aaron"),
           ("The switch-hitting Hall of Famer wore number 7 and hit 536 regular-season MLB home runs.", "He launched the historic drive off Turk Farrell in the sixth inning."),
           "Mickey Mantle crushed a solo home run on April 9, 1965 in the Astrodome's inaugural exhibition game, proving indoor baseball could launch tape-measure blasts.", 0.45),

        # 10. Tiger Stadium (3 Qs)
        bb("bp_tiger_stadium", "Scaled Outfield Geometry · Plate BB-10", "vis_bb_tiger_park",
           "Examine this classic 1912 blueprint featuring a daunting 440-foot dead center field with a flagpole in fair territory and a 10-foot upper right-field deck overhanging the playing grass. Name the venue.",
           "Tiger Stadium", ("Comiskey Park", "Shibe Park", "Crosley Field"),
           ("Originally opened as Navin Field on the exact same day as Fenway Park (April 20, 1912).", "It anchored the historic corner of Michigan and Trumbull Avenues until 1999."),
           "Standing at Michigan and Trumbull in Detroit from 1912 to 1999, Tiger Stadium was unmistakable for its 440-foot center-field flagpole in play and overhanging upper right-field deck.", -0.2),
        bb("bp_tiger_stadium", "Scaled Outfield Geometry · Plate BB-10", "vis_bb_tiger_corner",
           "At the legendary intersection of which two streets did the 1912 ballpark mapped here host Detroit baseball for 88 seasons?",
           "Michigan and Trumbull", ("Clark and Addison", "Lansdowne and Yawkey", "Broad and Pattison"),
           ("Its address became poetic shorthand for Motor City baseball nostalgia.", "One street bears the name of the Great Lakes state itself."),
           "Tiger Stadium — earlier known as Navin Field and Briggs Stadium — stood at the hallowed corner of Michigan and Trumbull in Detroit's Corktown neighborhood.", 0.3),
        bb("bp_tiger_stadium", "Scaled Outfield Geometry · Plate BB-10", "vis_bb_tiger_roof",
           "Because of the overhanging upper deck highlighted in cyan on this blueprint, hitting a fair ball completely over the right-field roof became a legendary feat. Which slugger blasted the first one in 1956?",
           "Mickey Mantle", ("Al Kaline", "Reggie Jackson", "Harmon Killebrew"),
           ("Only 37 roof shots were ever cleared in the stadium's entire 88-year history.", "Ted Williams also cleared it, while Reggie Jackson famously struck the light tower during the 1971 All-Star Game."),
           "Mickey Mantle cleared Tiger Stadium's towering right-field roof on May 22, 1956 (and again in 1958 and 1960), cementing one of baseball's rarest power milestones.", 0.65),

        # 11. Kauffman Stadium (3 Qs)
        bb("bp_kauffman", "Scaled Outfield Geometry · Plate BB-11", "vis_bb_kauffman_park",
           "Inspect this symmetrical 1973 blueprint (330-387-410-387-330) framed by a 322-foot sweeping water fountain complex and a crown-shaped center-field scoreboard. Which MLB ballpark is this?",
           "Kauffman Stadium", ("Dodger Stadium", "Coors Field", "Busch Stadium"),
           ("Originally opened as Royals Stadium, it is the only baseball-only park built during the 1970s concrete multi-use era.", "Its fountains remain the largest privately funded water complex in the world."),
           "Opened in 1973 in Kansas City, Kauffman Stadium pairs crisp symmetrical dimensions with its signature 322-foot Water Spectacular fountains and towering crown scoreboard.", -0.7),
        bb("bp_kauffman", "Scaled Outfield Geometry · Plate BB-11", "vis_bb_kauffman_team",
           "Which American League Central club celebrates home runs with choreographed bursts from the 322-foot water fountains mapped in this 1973 blueprint?",
           "Kansas City Royals", ("Minnesota Twins", "St. Louis Cardinals", "Colorado Rockies"),
           ("Hall of Fame third baseman George Brett spent his entire 21-year career playing on this diamond.", "They captured World Series titles in 1985 and 2015."),
           "The Kansas City Royals have played at Kauffman Stadium since 1973, naming the venue in 1993 for founding owner Ewing Kauffman.", -0.8),
        bb("bp_kauffman", "Scaled Outfield Geometry · Plate BB-11", "vis_bb_kauffman_player",
           "Which Hall of Fame third baseman won batting titles in three different decades (1976, 1980, 1990) while calling the 1973 ballpark mapped here home?",
           "George Brett", ("Mike Schmidt", "Wade Boggs", "Paul Molitor"),
           ("He flirted with a .400 batting average in 1980, finishing at .390 and winning AL MVP.", "His fiery 1983 'Pine Tar Game' outburst remains one of baseball's most replayed moments."),
           "George Brett collected 3,154 career hits exclusively for the Kansas City Royals at Kauffman Stadium, becoming the first player to win batting crowns in three decades.", -0.35),

        # 12. Coors Field (3 Qs)
        bb("bp_coors", "Scaled Outfield Geometry · Plate BB-12", "vis_bb_coors_park",
           "Study this vast 1995 outfield blueprint (347-390-415-375-350) marked at 5,200 feet elevation with a 20th upper-deck row tracing exact mile-high altitude and a rocky evergreen batter's eye. Name the ballpark.",
           "Coors Field", ("Chase Field", "Kauffman Stadium", "T-Mobile Park"),
           ("Its thin mountain air reduces aerodynamic drag, making baseballs carry roughly 9% farther than at sea level.", "Opened in Denver's LoDo historic brick district in April 1995."),
           "Situated 5,200 feet above sea level in Denver, Coors Field uses expansive outfield alleys (415 ft CF) to counter thin-air ball flight and marks exact 5,280 ft elevation with purple upper-deck seats.", -0.85),
        bb("bp_coors", "Scaled Outfield Geometry · Plate BB-12", "vis_bb_coors_humidor",
           "To tame runaway offense caused by dry, mile-high air at the 1995 ballpark charted here, what climate-controlled storage device was introduced for all game baseballs in 2002?",
           "Humidor", ("Barometer vault", "Cryo-chiller", "Nitrogen kiln"),
           ("Keeping baseballs at 70°F and 50% relative humidity prevents their leather and yarn from drying out and hardening.", "Major League Baseball later mandated the same device across all 30 MLB parks in 2022."),
           "Installed at Coors Field in 2002, the baseball humidor keeps balls at controlled humidity so they stay slightly heavier and less elastic in Denver's arid altitude.", -0.35),
        bb("bp_coors", "Scaled Outfield Geometry · Plate BB-12", "vis_bb_coors_purple",
           "Why is the entire 20th row of the upper deck highlighted on this 1995 blueprint painted purple instead of the stadium's signature dark forest green?",
           "It marks exactly 5,280 feet above sea level", ("It honors the 20th anniversary of the franchise", "It indicates the boundary of fair foul-ball seating", "It reserves seats exclusively for Hall of Fame visitors"),
           ("The field itself sits roughly 80 feet below the one-mile benchmark.", "Denver's famous nickname ties directly to the exact number of feet in a statute mile."),
           "While Coors Field's playing field sits at 5,200 feet elevation, the 20th row of the upper deck lies at exactly 5,280 feet — one statute mile above sea level — and is painted Rockies purple.", -0.4),

        # 13. Ebbets Field (3 Qs)
        bb("bp_ebbets", "Scaled Outfield Geometry · Plate BB-13", "vis_bb_ebbets_park",
           "Inspect this classic 1913 blueprint with a tight 297-foot right-field corner guarded by an angled 38-foot wall (19 feet of concrete topped by a 19-foot screen). Which legendary defunct ballpark is this?",
           "Ebbets Field", ("Polo Grounds", "Fenway Park", "Forbes Field"),
           ("Demolished in 1960, it stood in Crown Heights and featured an ornate Italian marble rotunda entrance.", "An iconic Abe Stark clothier sign at the base of the right-field scoreboard read 'Hit Sign, Win Suit'."),
           "Home of the Brooklyn Dodgers from 1913 to 1957, Ebbets Field's cramped city block produced a famously short 297-foot right-field corner shielded by a 38-foot concrete-and-screen wall.", -0.4),
        bb("bp_ebbets", "Scaled Outfield Geometry · Plate BB-13", "vis_bb_ebbets_jackie",
           "On April 15, 1947, who stepped onto the grass of the 1913 Brooklyn ballpark mapped here to break Major League Baseball's modern color barrier?",
           "Jackie Robinson", ("Larry Doby", "Satchel Paige", "Roy Campanella"),
           ("His uniform number 42 is retired across every Major League Baseball franchise.", "He won the inaugural MLB Rookie of the Year Award in 1947 and NL MVP in 1949."),
           "Jackie Robinson made his historic MLB debut at first base at Ebbets Field on April 15, 1947, forever transforming American sports and civil rights.", -1.15),
        bb("bp_ebbets", "Scaled Outfield Geometry · Plate BB-13", "vis_bb_ebbets_team",
           "Before relocating to California after the 1957 season, which beloved National League club won its lone Brooklyn World Series title (1955) while calling this 1913 ballpark home?",
           "Brooklyn Dodgers", ("New York Giants", "Philadelphia Athletics", "Boston Braves"),
           ("Nicknamed 'Dem Bums', their eternal rallying cry was 'Wait 'til next year!'", "Duke Snider, Pee Wee Reese, and Gil Hodges anchored their famed 'Boys of Summer'."),
           "The Brooklyn Dodgers played at Ebbets Field from 1913 through 1957, finally vanquishing the Yankees in the 1955 World Series before moving to Los Angeles.", -0.9),

        # 14. PNC Park (3 Qs)
        bb("bp_pnc_park", "Scaled Outfield Geometry · Plate BB-14", "vis_bb_pnc_park",
           "Examine this 2001 blueprint featuring a deep 410-foot left-center notch, a 21-foot right-field wall at 320 feet, and a dramatic twin-tower suspension bridge spanning a river beyond the outfield. Name the ballpark.",
           "PNC Park", ("Great American Ball Park", "Oracle Park", "Oriole Park at Camden Yards"),
           ("Consistently voted among MLB's most scenic venues, its golden bridge closes to cars for pedestrians on game days.", "It sits on the North Shore of the Allegheny River."),
           "Opened in 2001 on Pittsburgh's North Shore, PNC Park frames the Roberto Clemente Bridge and downtown skyline behind its 21-foot right-field wall and 410-foot left-center notch.", -0.6),
        bb("bp_pnc_park", "Scaled Outfield Geometry · Plate BB-14", "vis_bb_pnc_clemente",
           "Both the 21-foot right-field wall highlighted in cyan and the suspension bridge spanning behind this 2001 blueprint honor which Hall of Fame right fielder?",
           "Roberto Clemente", ("Willie Stargell", "Honus Wagner", "Bill Mazeroski"),
           ("Born in Carolina, Puerto Rico, he recorded exactly 3,000 career MLB hits and won 12 Gold Gloves.", "He perished tragically on New Year's Eve 1972 while flying humanitarian aid to Nicaragua."),
           "PNC Park's right-field wall stands exactly 21 feet tall in tribute to Pirates icon Roberto Clemente, whose number 21 is also immortalized on the adjacent suspension bridge.", -0.55),
        bb("bp_pnc_park", "Scaled Outfield Geometry · Plate BB-14", "vis_bb_pnc_river",
           "Balls hit completely out of this 2001 ballpark over the right-field concourse splash into which of Pittsburgh's three rivers?",
           "Allegheny River", ("Monongahela River", "Ohio River", "Susquehanna River"),
           ("It flows from the northeast to meet the Monongahela at Point State Park just west of the stadium.", "Josh Bell and Darryl Strawberry are among the few sluggers to reach its waters on the fly."),
           "PNC Park sits along the north bank of the Allegheny River, just 440+ feet beyond home plate past the right-field riverwalk.", 0.1),

        # 15. Petco Park (3 Qs)
        bb("bp_petco_park", "Scaled Outfield Geometry · Plate BB-15", "vis_bb_petco_park",
           "Study this 2004 blueprint featuring a unique architectural signature: the corner of a 1909 four-story brick industrial building literally serves as the 336-foot left-field foul pole. Name the ballpark.",
           "Petco Park", ("Oriole Park at Camden Yards", "Oracle Park", "Target Field"),
           ("Located in the Gaslamp Quarter of Southern California's second-largest city, it replaced Jack Murphy/Qualcomm Stadium.", "A sandstone facade and 'Park at the Park' grassy hill lie beyond center field."),
           "Opened in 2004 in downtown San Diego, Petco Park preserved the 1909 Western Metal Supply Co. brick building and integrated its southeast corner directly as the left-field foul pole.", -0.6),
        bb("bp_petco_park", "Scaled Outfield Geometry · Plate BB-15", "vis_bb_petco_building",
           "What historic 1909 four-story brick landmark forms the left-field foul pole and seating decks highlighted in cyan on this 2004 blueprint?",
           "Western Metal Supply Co. Building", ("B&O Warehouse", "Union Station Depot", "Pabst Malt House"),
           ("Constructed of red brick and cast iron, it now houses the team store, suites, and a rooftop deck.", "If a fly ball hits the painted yellow angle-iron on its brick corner, it is ruled a home run."),
           "Rather than demolish the 1909 Western Metal Supply Co. Building, San Diego architects wove it directly into Petco Park's left-field corner.", 0.25),
        bb("bp_petco_park", "Scaled Outfield Geometry · Plate BB-15", "vis_bb_petco_team",
           "Which National League West franchise plays home games at this 2004 downtown ballpark, honoring Hall of Famer Tony Gwynn with a statue outside?",
           "San Diego Padres", ("San Francisco Giants", "Arizona Diamondbacks", "Los Angeles Dodgers"),
           ("The club wears distinctive brown-and-gold pinstripe uniforms.", "Its street address is 19 Tony Gwynn Drive."),
           "The San Diego Padres moved into Petco Park in 2004, honoring franchise legend Tony Gwynn (.338 lifetime average) across the stadium grounds.", -0.8),

        # 16. Busch Stadium (3 Qs)
        bb("bp_busch_stadium", "Scaled Outfield Geometry · Plate BB-16", "vis_bb_busch_park",
           "Inspect this 2006 retro-brick blueprint (336-400-335) distinguished by an iconic 630-foot inverted-catenary stainless-steel arch soaring directly beyond center-right field. Name the ballpark.",
           "Busch Stadium", ("Kauffman Stadium", "Great American Ball Park", "Wrigley Field"),
           ("In its inaugural 2006 season, the home team immediately captured the World Series trophy.", "It is the third venue in the city to bear the same brewing family's name."),
           "Opened in 2006 in downtown St. Louis, Busch Stadium aligns home plate and center field directly toward Eero Saarinen's 630-foot Gateway Arch.", -0.8),
        bb("bp_busch_stadium", "Scaled Outfield Geometry · Plate BB-16", "vis_bb_busch_arch",
           "Designed by Eero Saarinen and completed in 1965, what 630-foot-tall stainless-steel monument rises directly behind the outfield in this blueprint?",
           "Gateway Arch", ("Space Needle", "Washington Monument", "Eiffel Tower"),
           ("It is the tallest human-made monument in the Western Hemisphere.", "Its weighted catenary curve commemorates America's westward expansion along the Mississippi River."),
           "Eero Saarinen's 630-foot Gateway Arch frames the iconic skyline view from nearly every seat inside St. Louis's Busch Stadium.", -1.0),
        bb("bp_busch_stadium", "Scaled Outfield Geometry · Plate BB-16", "vis_bb_busch_team",
           "Which storied National League franchise — owner of 11 World Series titles, the most in NL history — calls this 2006 ballpark home?",
           "St. Louis Cardinals", ("Chicago Cubs", "Cincinnati Reds", "Pittsburgh Pirates"),
           ("Stan Musial, Bob Gibson, Ozzie Smith, and Albert Pujols are among its iconic greats.", "Its 2011 championship featured David Freese's unforgettable Game 6 heroics on this field."),
           "The St. Louis Cardinals have played at the current Busch Stadium since 2006, adding World Series championships in 2006 and 2011.", -0.85),

        # 17. Comerica Park (3 Qs)
        bb("bp_comerica_park", "Scaled Outfield Geometry · Plate BB-17", "vis_bb_comerica_park",
           "Examine this 2000 ballpark blueprint notable for its deep 412-foot center field and its throwback 'keyhole' dirt path linking home plate directly to the pitcher's mound. Which MLB park is this?",
           "Comerica Park", ("Chase Field", "Target Field", "Progressive Field"),
           ("Built downtown to replace a beloved 1912 venue, it features giant feline statues guarding the main entrance and a Ferris wheel inside the concourse.", "Only one other active MLB ballpark (in Phoenix) shares the keyhole dirt strip."),
           "Opened in downtown Detroit in 2000, Comerica Park honors early 20th-century diamonds with its rare keyhole dirt strip from home plate to the mound and deep outfield alleys.", -0.35),
        bb("bp_comerica_park", "Scaled Outfield Geometry · Plate BB-17", "vis_bb_comerica_team",
           "Which original 1901 American League franchise moved into this downtown ballpark in 2000, celebrating legends like Ty Cobb, Al Kaline, and Miguel Cabrera?",
           "Detroit Tigers", ("Cleveland Guardians", "Chicago White Sox", "Minnesota Twins"),
           ("Miguel Cabrera captured MLB's first batting Triple Crown in 45 years while playing here in 2012.", "Justin Verlander won both AL Cy Young and AL MVP on this mound in 2011."),
           "The Detroit Tigers debuted at Comerica Park in 2000 after 88 seasons at Tiger Stadium, watching Miguel Cabrera win the 2012 Triple Crown on its diamond.", -0.65),
        bb("bp_comerica_park", "Scaled Outfield Geometry · Plate BB-17", "vis_bb_comerica_keyhole",
           "The cyan-highlighted dirt corridor connecting home plate to the pitcher's mound on this blueprint revives a vintage 19th-century field feature known by what name?",
           "The Keyhole", ("The Bullseye Lane", "The Catcher's Trench", "The Chalk Spine"),
           ("It gets its name from its outline when paired with the circular pitcher's mound at the top.", "Originally worn into the grass by pitchers pacing back and forth, it is now found at only two MLB parks."),
           "Known as 'The Keyhole', the dirt strip between home plate and the pitcher's mound is a nostalgic tribute to classic early baseball grounds, maintained at Comerica Park and Chase Field.", 0.2),

        # 18. Rogers Centre (3 Qs)
        bb("bp_rogers_centre", "Scaled Outfield Geometry · Plate BB-18", "vis_bb_rogers_park",
           "Inspect this 1989 blueprint of the world's first stadium with a fully motorized 4-panel telescoping retractable dome roof, standing beside a 553-meter freestanding broadcast spire. Name the ballpark.",
           "Rogers Centre", ("Astrodome", "T-Mobile Park", "LoanDepot Park"),
           ("Originally opened as SkyDome in June 1989, it even features an integrated hotel overlooking center field.", "It is Major League Baseball's only active ballpark located outside the United States."),
           "Opened in 1989 in downtown Toronto as SkyDome (renamed Rogers Centre in 2005), it pioneered the motorized retractable dome roof right beside the 553-meter CN Tower.", -0.7),
        bb("bp_rogers_centre", "Scaled Outfield Geometry · Plate BB-18", "vis_bb_rogers_tower",
           "What iconic 553-meter freestanding communications and observation spire towers directly beside this 1989 retractable-roof ballpark?",
           "CN Tower", ("Space Needle", "Tokyo Skytree", "Stratosphere Tower"),
           ("Completed in 1976, it held the record as the world's tallest freestanding structure for 32 years.", "Its two-letter prefix derives from Canadian National Railway."),
           "Rising 553.3 meters beside Rogers Centre on Toronto's waterfront, the CN Tower creates one of baseball's most unmistakable backdrops whenever the roof opens.", -0.9),
        bb("bp_rogers_centre", "Scaled Outfield Geometry · Plate BB-18", "vis_bb_rogers_carter",
           "In Game 6 of the 1993 World Series inside this domed venue, who hit a dramatic walk-off three-run homer ('Touch 'em all!') to seal back-to-back titles for the home club?",
           "Joe Carter", ("Jose Bautista", "Roberto Alomar", "Paul Molitor"),
           ("It was only the second walk-off home run ever to win a World Series, joining Bill Mazeroski in 1960.", "He launched the ninth-inning drive off Philadelphia's Mitch Williams."),
           "Joe Carter's walk-off three-run home run in Game 6 of the 1993 World Series at Toronto's SkyDome (now Rogers Centre) delivered the Blue Jays' second consecutive championship.", -0.35),

        # 19. Citi Field (3 Qs)
        bb("bp_citi_field", "Scaled Outfield Geometry · Plate BB-19", "vis_bb_citi_park",
           "Examine this 2009 blueprint (335-408-330) featuring a dramatic pedestrian bridge behind right-center field and an arched masonry rotunda paying homage to Brooklyn's lost ballpark. Name the venue.",
           "Citi Field", ("Yankee Stadium", "Citizens Bank Park", "Nationals Park"),
           ("Located in Flushing Meadows-Corona Park, it replaced Shea Stadium in April 2009.", "A giant red apple rises from a top hat beyond center field after every home-team homer."),
           "Opened in Queens in 2009, Citi Field blends modern outfield amenities like the Shea Bridge with classic Ebbets Field brick arches and the Jackie Robinson Rotunda.", -0.55),
        bb("bp_citi_field", "Scaled Outfield Geometry · Plate BB-19", "vis_bb_citi_team",
           "Which National League East franchise raises a giant Home Run Apple beyond center field at this 2009 Queens ballpark?",
           "New York Mets", ("Philadelphia Phillies", "Washington Nationals", "Atlanta Braves"),
           ("Founded as a 1962 expansion club, they shocked baseball as the 'Miracle' champions of 1969.", "Tom Seaver, Mike Piazza, and David Wright are cornerstones of franchise history."),
           "The New York Mets moved from Shea Stadium into adjacent Citi Field in 2009, bringing along their beloved Home Run Apple tradition.", -0.8),
        bb("bp_citi_field", "Scaled Outfield Geometry · Plate BB-19", "vis_bb_citi_rotunda",
           "The grand arched brick entry rotunda of this 2009 Queens ballpark honors which trailblazing Hall of Famer with a giant 8-foot sculpture of his retired number 42?",
           "Jackie Robinson", ("Tom Seaver", "Willie Mays", "Gil Hodges"),
           ("Though he played for Brooklyn rather than the home franchise, the stadium's exterior explicitly echoes Ebbets Field.", "He broke baseball's color barrier in 1947."),
           "Citi Field's main entrance is the Jackie Robinson Rotunda, inspired by Ebbets Field and anchored by an 8-foot cobalt-blue number 42 honoring Robinson's legacy.", -0.25),

        # 20. Chase Field (3 Qs)
        bb("bp_chase_field", "Scaled Outfield Geometry · Plate BB-20", "vis_bb_chase_park",
           "Inspect this 1998 retractable-roof blueprint (330-407-335) notable for a 25-foot center-field wall and a one-of-a-kind swimming pool suite tucked right beyond right-center field. Name the ballpark.",
           "Chase Field", ("LoanDepot Park", "Globe Life Field", "T-Mobile Park"),
           ("Originally opened as Bank One Ballpark ('The BOB') in the Sonoran Desert.", "It was the first MLB stadium built with both a retractable roof and natural grass (before switching to synthetic turf in 2019)."),
           "Opened in downtown Phoenix in 1998, Chase Field is famous worldwide for its air-conditioned retractable roof, keyhole infield dirt path, and right-center swimming pool pavilion.", -0.65),
        bb("bp_chase_field", "Scaled Outfield Geometry · Plate BB-20", "vis_bb_chase_team",
           "Which 1998 expansion franchise won the 2001 World Series in just its fourth season while calling this desert retractable-roof ballpark home?",
           "Arizona Diamondbacks", ("Colorado Rockies", "Tampa Bay Rays", "Miami Marlins"),
           ("Randy Johnson and Curt Schilling shared World Series MVP honors on this mound.", "Luis Gonzalez delivered a dramatic Game 7 walk-off bloop single off Mariano Rivera here."),
           "The Arizona Diamondbacks inaugurated Chase Field in 1998 and stunned the three-time defending champion Yankees in Game 7 of the 2001 World Series on its diamond.", -0.75),
        bb("bp_chase_field", "Scaled Outfield Geometry · Plate BB-20", "vis_bb_chase_city",
           "In which sun-drenched Southwestern U.S. state capital does this air-conditioned 1998 ballpark shield summer baseball fans from 110°F heat?",
           "Phoenix, Arizona", ("Las Vegas, Nevada", "Albuquerque, New Mexico", "Tucson, Arizona"),
           ("Its metropolitan area is nicknamed the 'Valley of the Sun'.", "Closing its retractable roof can drop interior temperatures by more than 30 degrees before first pitch."),
           "Chase Field stands in downtown Phoenix, Arizona, where a massive air-conditioning plant and retractable roof make summer baseball comfortable in the desert.", -0.85),
    ]


def build_multidomain_visual_questions() -> List[Dict[str, Any]]:
    q = _vis_q
    return [
        # --- 10 ARCHITECTURAL BLUEPRINTS (28 Qs) ---
        # 1. Parthenon (3 Qs)
        q("arch_parthenon", "Octastyle Floorplan & East Elevation · Plate AR-01",
          3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "vis_ar_parthenon_id",
          "Inspect this 447–432 BCE blueprint showing an octastyle 8-by-17 colonnade floorplan and a classic 4:9 pediment facade. Which ancient marble masterpiece is depicted?",
          "The Parthenon", ("Temple of Artemis", "Erechtheion", "Temple of Olympian Zeus"),
          ("It crowns the rocky Acropolis overlooking Athens, Greece.", "Designed by architects Ictinus and Callicrates under sculptor Phidias."),
          "Built between 447 and 432 BCE atop the Athenian Acropolis, the Parthenon's 8×17 peripteral colonnade and 4:9 proportional ratios define Classical Greek architecture.", -1.1, "column", ["GR", "GLOBAL"]),
        q("arch_parthenon", "Octastyle Floorplan & East Elevation · Plate AR-01",
          10, "myth_pantheons_folklore", "myth_greek_roman", "Classical Mythology, Deities & Legends", "Greek & Roman Mythology",
          "vis_ar_parthenon_deity",
          "The inner sanctuary chamber (naos) mapped in this 5th-century BCE Acropolis blueprint once housed a 12-meter gold-and-ivory statue of which patron goddess?",
          "Athena", ("Hera", "Artemis", "Aphrodite"),
          ("She is the Greek goddess of wisdom, strategic warfare, and craft.", "Athens itself derives its name from this Olympian deity."),
          "The Parthenon ('House of the Maiden') was dedicated to Athena Parthenos, whose chryselephantine cult statue sculpted by Phidias anchored the inner cella.", -1.0, "column", ["GR", "GLOBAL"]),
        q("arch_parthenon", "Octastyle Floorplan & East Elevation · Plate AR-01",
          3, "arts_architecture", "arts_architectural_styles", "World Architecture & Monuments", "Architectural Styles & Movements",
          "vis_ar_parthenon_order",
          "Notice the sturdy, baseless fluted shafts topped by plain flared cushion capitals in this elevation blueprint. Which of the three classical Greek architectural orders is illustrated?",
          "Doric order", ("Ionic order", "Corinthian order", "Tuscan order"),
          ("It is the oldest and most austere of the three classical Greek column orders.", "Unlike the Ionic order's twin scrolls or Corinthian acanthus leaves, its capital is a simple rounded echinus."),
          "The Parthenon represents the pinnacle of the Doric order, characterized by fluted columns rising directly from the stylobate without molded bases and simple cushion capitals.", -0.35, "column", ["GR", "GLOBAL"]),

        # 2. Taj Mahal (3 Qs)
        q("arch_taj_mahal", "Axial Elevation & Minaret Plan · Plate AR-02",
          3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "vis_ar_taj_id",
          "Study this perfectly symmetrical 1632–1653 elevation featuring a 73-meter bulbous marble dome, a tall pointed iwan arch, four corner minarets, and a reflecting pool. Name this monument.",
          "Taj Mahal", ("Humayun's Tomb", "Jama Masjid", "Badshahi Mosque"),
          ("It stands on the south bank of the Yamuna River in Agra, India.", "Its four outer minarets lean imperceptibly outward so an earthquake would topple them away from the main tomb."),
          "Constructed from 1632 to 1653 in Agra, the ivory-white marble Taj Mahal is universally acclaimed as the jewel of Mughal architecture.", -1.25, "column", ["IN", "GLOBAL"]),
        q("arch_taj_mahal", "Axial Elevation & Minaret Plan · Plate AR-02",
          0, "hist_empires", "hist_asian_islamic_empires", "Empires, Dynasties & Realms", "Imperial Asia & Islamic Caliphates",
          "vis_ar_taj_emperor",
          "Which Mughal emperor commissioned the 1632–1653 white marble mausoleum mapped in this blueprint as an eternal tribute to his beloved wife Mumtaz Mahal?",
          "Shah Jahan", ("Akbar the Great", "Aurangzeb", "Babur"),
          ("He was the fifth Mughal emperor, ruling from 1628 until 1658.", "In his final years, he was placed under house arrest in Agra Fort with a distant view of this very dome."),
          "Mughal Emperor Shah Jahan commissioned the Taj Mahal in 1632 following the death of his wife Mumtaz Mahal, employing over 20,000 artisans.", -0.8, "crown", ["IN", "GLOBAL"]),
        q("arch_taj_mahal", "Axial Elevation & Minaret Plan · Plate AR-02",
          2, "geo_world_cities", "geo_cities_asia_pacific", "World Cities & Urban Centers", "Cities of Asia & Oceania",
          "vis_ar_taj_city",
          "Along the southern bank of the Yamuna River in which Indian city does the 73-meter domed marble mausoleum from this blueprint stand?",
          "Agra", ("Jaipur", "Hyderabad", "Lucknow"),
          ("Located in Uttar Pradesh roughly 200 kilometers southeast of New Delhi.", "It served as the imperial capital of the Mughal Empire during the 16th and 17th centuries."),
          "The Taj Mahal stands in Agra, Uttar Pradesh, India, along the gentle bend of the Yamuna River.", -1.0, "globe", ["IN", "GLOBAL"]),

        # 3. Sydney Opera House (3 Qs)
        q("arch_sydney_opera", "Ribbed Precast Shell Elevation · Plate AR-03",
          3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "vis_ar_sydney_id",
          "Inspect this 1973 harbor elevation built from interlocking spherical precast concrete sail vaults (radius 75.2 meters) resting on a monumental podium. Which 20th-century icon is shown?",
          "Sydney Opera House", ("Guggenheim Museum Bilbao", "Walt Disney Concert Hall", "Lotus Temple"),
          ("It sits on Bennelong Point jutting into one of the Southern Hemisphere's grandest natural harbors.", "Over one million glossy and matte Swedish ceramic tiles sheath its curved shells."),
          "Inaugurated in 1973 on Bennelong Point, the Sydney Opera House's interlocking spherical concrete shells are among the most recognizable silhouettes in modern architecture.", -1.2, "column", ["AU", "GLOBAL"]),
        q("arch_sydney_opera", "Ribbed Precast Shell Elevation · Plate AR-03",
          3, "arts_creators_movements", "arts_architects_designers", "Visual Artists & Master Architects", "Master Architects & Builders",
          "vis_ar_sydney_arch",
          "Which Danish architect conceived the revolutionary 'spherical solution' (carving every shell from one 75.2-meter sphere) for the 1973 performing-arts landmark mapped here?",
          "Jørn Utzon", ("Frank Gehry", "Eero Saarinen", "Oscar Niemeyer"),
          ("He won the 1957 international design competition while still largely unknown outside Scandinavia.", "He received the Pritzker Architecture Prize in 2003, though he never returned to see the finished building in person."),
          "Danish architect Jørn Utzon solved the structural puzzle of the Sydney Opera House's billowing shells by deriving every precast concrete rib from a single 75.2-meter sphere.", 0.35, "column", ["AU", "DK", "GLOBAL"]),
        q("arch_sydney_opera", "Ribbed Precast Shell Elevation · Plate AR-03",
          3, "arts_architecture", "arts_architectural_styles", "World Architecture & Monuments", "Architectural Styles & Movements",
          "vis_ar_sydney_geo",
          "What single geometric solid was mathematically sliced into matching curved triangles so that all roof vaults on this 1973 harbor blueprint could be mass-prefabricated?",
          "Sphere", ("Paraboloid", "Hyperboloid", "Torus"),
          ("Look closely at the dashed R = 75.2 m construction arc sweeping over the shells.", "Every roof panel shares identical constant curvature in all directions."),
          "By slicing every roof sail from the surface of a single 75.2-meter-radius sphere, engineers could reuse standardized curved formwork for all 2,194 precast concrete ribs.", 0.1, "prism", ["AU", "GLOBAL"]),

        # 4. Colosseum (3 Qs)
        q("arch_colosseum", "Elliptical Floorplan & Arcade Cutaway · Plate AR-04",
          3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "vis_ar_colosseum_id",
          "Study this 80 CE elliptical plan (189 by 156 meters) with 80 radial entrance arches and a 4-tier travertine arcade rising 48.5 meters. Which ancient arena is mapped?",
          "The Colosseum", ("Circus Maximus", "Arena of Nîmes", "Verona Arena"),
          ("Originally known as the Flavian Amphitheatre, it seated roughly 50,000 spectators.", "Its subterranean hypogeum used timber elevators and trapdoors to lift wild beasts onto the sand floor."),
          "Inaugurated in 80 CE in Rome, the Colosseum remains the largest ancient amphitheatre ever built, spanning 189 by 156 meters across four architectural tiers.", -1.25, "column", ["IT", "GLOBAL"]),
        q("arch_colosseum", "Elliptical Floorplan & Arcade Cutaway · Plate AR-04",
          0, "hist_empires", "hist_classical_antiquity", "Empires, Dynasties & Realms", "Ancient Rome, Greece & Egypt",
          "vis_ar_colosseum_dynasty",
          "Which Roman imperial dynasty (Vespasian, Titus, and Domitian) commissioned and inaugurated the 80 CE amphitheatre mapped in this blueprint?",
          "Flavian dynasty", ("Julio-Claudian dynasty", "Antonine dynasty", "Severan dynasty"),
          ("Construction began under Vespasian in 72 CE atop Nero's drained palace lake.", "In Latin, the arena was officially titled Amphitheatrum Flavium."),
          "Emperor Vespasian started construction in 72 CE and his son Titus dedicated the Flavian Amphitheatre (Colosseum) in 80 CE with 100 days of inaugural games.", 0.05, "crown", ["IT", "GLOBAL"]),
        q("arch_colosseum", "Elliptical Floorplan & Arcade Cutaway · Plate AR-04",
          3, "arts_architecture", "arts_architectural_styles", "World Architecture & Monuments", "Architectural Styles & Movements",
          "vis_ar_colosseum_orders",
          "From ground level up to the third floor of the 4-tier facade shown on the right, the engaged columns ascend in classic Roman sequence: Tuscan, Ionic, and which ornate top order?",
          "Corinthian", ("Doric", "Composite", "Aeolic"),
          ("Recognized by its carved double tiers of stylized acanthus leaves.", "It is the most slender and decorative of the classical Greek-derived orders."),
          "The Colosseum's exterior arcades codified the Renaissance rule of superimposed classical orders: robust Tuscan on level 1, Ionic on level 2, and ornate Corinthian on level 3.", 0.2, "column", ["IT", "GLOBAL"]),

        # 5. Eiffel Tower (3 Qs)
        q("arch_eiffel_tower", "Exponential Lattice Elevation · Plate AR-05",
          3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "vis_ar_eiffel_id",
          "Examine this 1887–1889 wrought-iron lattice blueprint assembled from 18,038 pieces with observation platforms at 57 m, 115 m, and 276 m. Which landmark tower is profiled?",
          "Eiffel Tower", ("Tokyo Tower", "Blackpool Tower", "CN Tower"),
          ("Built as the grand entrance arch for the 1889 Exposition Universelle.", "It held the title of world's tallest human-made structure for 41 years until 1930."),
          "Erected for the 1889 Paris World's Fair, the Eiffel Tower curves exponentially to resist wind shear across 18,038 puddle-iron pieces riveted together.", -1.3, "column", ["FR", "GLOBAL"]),
        q("arch_eiffel_tower", "Exponential Lattice Elevation · Plate AR-05",
          0, "hist_treaties_eras", "hist_revolutions_reforms", "Treaties, Archaeology & Turning Points", "Social Revolutions & Modern Era",
          "vis_ar_eiffel_centennial",
          "The 1889 Paris World's Fair for which this wrought-iron lattice landmark was erected specifically celebrated the 100th anniversary of what historic upheaval?",
          "The French Revolution", ("The Battle of Waterloo", "The Congress of Vienna", "The Paris Commune"),
          ("Think 100 years prior to 1889 — specifically July 14, 1789.", "The storming of the Bastille marked its iconic opening flashpoint."),
          "The 1889 Exposition Universelle — and its centerpiece Eiffel Tower — marked the centennial of the 1789 French Revolution.", -0.75, "crown", ["FR", "GLOBAL"]),
        q("arch_eiffel_tower", "Exponential Lattice Elevation · Plate AR-05",
          1, "sci_physics", "sci_mechanics_optics", "Physics & Quantum Mechanics", "Nobel Laureates & Scientific Prizes",
          "vis_ar_eiffel_physics",
          "Why does the structural profile mapped in this 1889 blueprint taper inward along an exact exponential curve rather than rising as a straight-sided pyramid?",
          "To counter wind bending moment with minimal iron", ("To mirror the natural slope of Mount Blanc", "To amplify radio waves from the summit", "To conceal elevator shafts inside the legs"),
          ("Engineers Maurice Koechlin and Émile Nouguier matched the legs' curvature directly to lateral wind force torque.", "Because open iron lattice lets gusts pass through, bending stress vanishes along that curve."),
          "The Eiffel Tower's signature exponential flare matches the mathematical moment curve of wind shear, ensuring zero bending stress in the diagonal bracing.", 0.35, "prism", ["FR", "GLOBAL"]),

        # 6. Sagrada Familia (3 Qs)
        q("arch_sagrada_familia", "Hyperboloid Spire Elevation · Plate AR-06",
          3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "vis_ar_sagrada_id",
          "Study this monumental elevation begun in 1882, featuring 18 planned parabolic spindle spires rising toward a 172.5-meter central tower built with inverted catenary vaults. Name this basilica.",
          "La Sagrada Família", ("Notre-Dame de Paris", "Milan Cathedral", "St. Basil's Cathedral"),
          ("Still under construction more than 140 years after its cornerstone was laid in Catalonia.", "Its interior columns branch upward like a stone forest canopy."),
          "Begun in 1882 in Barcelona, Antoni Gaudí's Basílica de la Sagrada Família uses hanging-chain catenary curves and hyperboloid geometry to reach 172.5 meters.", -1.0, "column", ["ES", "GLOBAL"]),
        q("arch_sagrada_familia", "Hyperboloid Spire Elevation · Plate AR-06",
          3, "arts_creators_movements", "arts_architects_designers", "Visual Artists & Master Architects", "Master Architects & Builders",
          "vis_ar_sagrada_gaudi",
          "Which visionary Catalan Modernisme architect took over this basilica in 1883 and modeled its gravity-defying vaults using upside-down hanging weighted strings?",
          "Antoni Gaudí", ("Santiago Calatrava", "Le Corbusier", "Filippo Brunelleschi"),
          ("He also designed Casa Batlló, Casa Milà, and Park Güell in the same city.", "He devoted the last 15 years of his life exclusively to this temple before dying in a 1926 tram accident."),
          "Antoni Gaudí pioneered physical hanging-chain catenary models to engineer the self-supporting parabolic arches and vaults of La Sagrada Família.", -0.95, "column", ["ES", "GLOBAL"]),
        q("arch_sagrada_familia", "Hyperboloid Spire Elevation · Plate AR-06",
          3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "vis_ar_sagrada_height",
          "Why did the architect cap the central spire of this 1882 blueprint at 172.5 meters — exactly 4.5 meters shorter than nearby Montjuïc hill?",
          "Human work should not surpass nature's height", ("Local 19th-century aviation regulations", "Limestone load-bearing limits of the crypt", "A municipal tax on buildings above 175 meters"),
          ("The devout designer viewed Montjuïc as the direct creation of God.", "His famous maxim declared that a human creation must never exceed the work of the Creator."),
          "Antoni Gaudí deliberately capped the Tower of Jesus Christ at 172.5 meters so it would remain just below Barcelona's 177-meter Montjuïc hill, respecting God's natural creation.", 0.45, "column", ["ES", "GLOBAL"]),

        # 7. Great Pyramid of Giza (3 Qs)
        q("arch_great_pyramid", "Internal Sectional Cutaway · Plate AR-07",
          0, "hist_treaties_eras", "hist_archaeology_ruins", "Treaties, Archaeology & Turning Points", "Archaeological Sites & Ancient Ruins",
          "vis_ar_giza_id",
          "Examine this c. 2560 BCE sectional cutaway (51.8° slope, original height 146.6 m) revealing a Descending Passage, corbelled Grand Gallery, three internal chambers, and dual air shafts. Name this structure.",
          "Great Pyramid of Giza", ("Step Pyramid of Djoser", "Bent Pyramid of Dahshur", "Pyramid of the Sun"),
          ("It is the oldest of the Seven Wonders of the Ancient World — and the only one still largely intact.", "Built from roughly 2.3 million limestone and granite blocks on the Nile's west bank."),
          "Completed c. 2560 BCE, the Great Pyramid of Giza rises at 51.8° from a 230.4-meter square base and uniquely conceals its corbelled Grand Gallery and elevated burial chamber deep inside the superstructure.", -1.25, "column", ["EG", "GLOBAL"]),
        q("arch_great_pyramid", "Internal Sectional Cutaway · Plate AR-07",
          0, "hist_empires", "hist_classical_antiquity", "Empires, Dynasties & Realms", "Ancient Rome, Greece & Egypt",
          "vis_ar_giza_pharaoh",
          "For which Fourth Dynasty Old Kingdom pharaoh — known to the ancient Greeks as Cheops — was the 146.6-meter monument cut open in this blueprint erected?",
          "Khufu", ("Khafre", "Tutankhamun", "Ramesses II"),
          ("His royal vizier Hemiunu is widely credited with supervising the 20-year engineering feat.", "His son Khafre built the slightly smaller adjacent monument guarded by the Great Sphinx."),
          "Pharaoh Khufu (reigned c. 2589–2566 BCE) commissioned the Great Pyramid of Giza as his eternal tomb; his red granite sarcophagus still rests in the upper chamber.", -0.85, "crown", ["EG", "GLOBAL"]),
        q("arch_great_pyramid", "Internal Sectional Cutaway · Plate AR-07",
          3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "vis_ar_giza_beams",
          "Look directly above the highest rectangular chamber in this cutaway blueprint: what engineering function do those stacked granite tiers serve?",
          "Relieving vertical stone weight off the flat ceiling", ("Ventilating incense smoke during royal funerals", "Storing hidden gold offerings from tomb robbers", "Amplifying acoustic chants along the Grand Gallery"),
          ("Without them, tens of thousands of tons of masonry overhead would snap the flat burial-chamber roof.", "Five stacked compartments topped by pitched limestone rafters divert downward pressure into the side walls."),
          "Above the King's Chamber, five stacked granite relieving chambers capped by gabled limestone beams channel the colossal overhead masonry weight safely past the flat ceiling.", 0.35, "column", ["EG", "GLOBAL"]),

        # 8. Hagia Sophia (3 Qs)
        q("arch_hagia_sophia", "Pendentive Floorplan & Elevation · Plate AR-08",
          3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "vis_ar_hagia_id",
          "Study this 537 CE blueprint showing a revolutionary 31.8-meter circular dome suspended on pendentives over a square bay, flanked by two giant semi-domes and four corner minarets. Name this monument.",
          "Hagia Sophia", ("Blue Mosque", "St. Peter's Basilica", "Dome of the Rock"),
          ("Completed in just five years under Byzantine Emperor Justinian I, it held the world's largest interior dome for nearly a millennium.", "Its name translates from Greek as 'Holy Wisdom'."),
          "Completed in 537 CE in Constantinople (modern Istanbul) by mathematicians Anthemius of Tralles and Isidore of Miletus, Hagia Sophia perfected the spherical pendentive dome.", -0.9, "column", ["TR", "GLOBAL"]),
        q("arch_hagia_sophia", "Pendentive Floorplan & Elevation · Plate AR-08",
          0, "hist_empires", "hist_classical_antiquity", "Empires, Dynasties & Realms", "Ancient Rome, Greece & Egypt",
          "vis_ar_hagia_justinian",
          "Which Byzantine emperor commissioned this 537 CE architectural marvel — reportedly exclaiming 'Solomon, I have outdone thee!' upon entering?",
          "Justinian I", ("Constantine the Great", "Theodosius I", "Heraclius"),
          ("He also oversaw the sweeping codification of Roman civil law (Corpus Juris Civilis).", "He rebuilt the cathedral after the previous church burned during the 532 CE Nika riots."),
          "Emperor Justinian I commissioned Hagia Sophia immediately after the 532 CE Nika riots, dedicating the soaring domed basilica in December 537 CE.", -0.45, "crown", ["TR", "GLOBAL"]),

        # 9. Pantheon Rome (2 Qs)
        q("arch_pantheon_rome", "Rotunda Cross-Section · Plate AR-09",
          3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "vis_ar_pantheon_id",
          "Inspect this c. 125 CE cutaway showing an unreinforced concrete dome whose 43.3-meter interior diameter equals its height — inscribing a perfect sphere lit by an open 8.7-meter oculus. Name this temple.",
          "The Pantheon", ("Hagia Sophia", "St. Paul's Cathedral", "Florence Cathedral"),
          ("Nearly 1,900 years later, its dome remains the world's largest unreinforced solid concrete dome.", "Its front portico still bears Marcus Agrippa's original inscription, though Emperor Hadrian rebuilt the rotunda."),
          "Rebuilt under Emperor Hadrian c. 125 CE in Rome, the Pantheon uses progressively lighter volcanic pumice concrete toward its 8.7 m open oculus to enclose a perfect 43.3 m sphere.", -0.95, "column", ["IT", "GLOBAL"]),
        q("arch_pantheon_rome", "Rotunda Cross-Section · Plate AR-09",
          3, "arts_architecture", "arts_architectural_styles", "World Architecture & Monuments", "Architectural Styles & Movements",
          "vis_ar_pantheon_oculus",
          "Because the 8.7-meter circular oculus at the apex of this blueprint has no glass covering, what happens when rain falls into the ancient rotunda?",
          "A subtly convex marble floor drains water through 22 hidden holes", ("Roman priests seal it with a bronze umbrella canopy", "Rising warm air evaporates rain before it hits the ground", "A central reflecting basin collects rainwater in the middle"),
          ("Notice the floor looks flat at first glance, yet it slopes gently outward from the center.", "Ingenious Roman plumbing beneath the polychrome marble pavement still functions today."),
          "The Pantheon's open oculus serves as both structural compression ring and sole light source; rain falling inside runs smoothly down the subtly crowned marble floor into 22 discreet drain holes.", 0.3, "column", ["IT", "GLOBAL"]),

        # 10. Angkor Wat (2 Qs)
        q("arch_angkor_wat", "Moated Enclosure & Quincunx · Plate AR-10",
          3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "vis_ar_angkor_id",
          "Examine this 162.6-hectare concentric moated plan crowned by a 5-tower lotus-bud quincunx symbolizing mythical Mount Meru. Which Southeast Asian temple complex is shown?",
          "Angkor Wat", ("Borobudur", "Bagan Temples", "Prambanan"),
          ("Its unmistakable five-tower silhouette appears prominently on Cambodia's national flag.", "Built by Khmer King Suryavarman II in the early 12th century as a temple to Vishnu."),
          "Constructed in the early 12th century by the Khmer Empire in Cambodia, Angkor Wat is the world's largest religious monument, enclosed by a vast rectangular moat and crowned by five lotus towers.", -1.05, "column", ["KH", "GLOBAL"]),
        q("arch_angkor_wat", "Moated Enclosure & Quincunx · Plate AR-10",
          0, "hist_empires", "hist_asian_islamic_empires", "Empires, Dynasties & Realms", "Imperial Asia & Islamic Caliphates",
          "vis_ar_angkor_empire",
          "Which medieval Southeast Asian civilization engineered this 162.6-hectare hydraulic temple city and its vast surrounding network of baray reservoirs?",
          "Khmer Empire", ("Srivijaya Empire", "Majapahit Empire", "Chola Empire"),
          ("Centered near modern Siem Reap, its kings ruled much of mainland Southeast Asia from 802 to 1431 CE.", "Its capital region was the largest pre-industrial urban complex on Earth."),
          "The Khmer Empire built Angkor Wat in the 12th century under Suryavarman II, mastering monsoon hydraulic engineering across a sprawling jungle metropolis.", -0.6, "crown", ["KH", "GLOBAL"]),

        # --- 6 CONSTELLATION PLATES (16 Qs) ---
        # 11. Orion (3 Qs)
        q("star_orion", "Equatorial Celestial Chart · Plate ST-01",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_orion_id",
          "Inspect this equatorial star chart anchored by an amber shoulder supergiant, a luminous blue-white foot star, three collinear belt stars, and a glowing sword nebula. Which constellation is plotted?",
          "Orion", ("Cassiopeia", "Perseus", "Pegasus"),
          ("Visible from nearly every inhabited point on Earth because it straddles the celestial equator.", "Named after a mighty hunter in Greek mythology."),
          "Straddling the celestial equator, Orion is instantly recognizable by its three collinear Belt stars (Alnitak, Alnilam, Mintaka), Betelgeuse, Rigel, and the Orion Nebula (M42).", -1.25, "star"),
        q("star_orion", "Equatorial Celestial Chart · Plate ST-01",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_orion_alpha",
          "What is the name of the massive red supergiant marked 'α · M2 SUPERGIANT' at the upper-left shoulder of this celestial blueprint?",
          "Betelgeuse", ("Rigel", "Aldebaran", "Sirius"),
          ("It is roughly 700 times wider than our Sun and made headlines during its dramatic 'Great Dimming' in 2019–2020.", "Its Arabic-derived name loosely translates to 'hand of the giant'."),
          "Betelgeuse (Alpha Orionis) is a pulsating red supergiant marking Orion's eastern shoulder, destined to explode as a spectacular core-collapse supernova within the next ~100,000 years.", -0.85, "star"),
        q("star_orion", "Equatorial Celestial Chart · Plate ST-01",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_orion_beta",
          "Despite carrying the Greek letter Beta ('β · B8 SUPERGIANT'), which blazing blue-white star at the lower-right corner is actually the brightest star in this constellation?",
          "Rigel", ("Bellatrix", "Saiph", "Procyon"),
          ("Shining more than 100,000 times brighter than the Sun, it ranks as the seventh-brightest star in Earth's night sky.", "Its name comes from the Arabic phrase for 'the left foot of the giant'."),
          "Rigel (Beta Orionis) at apparent magnitude +0.18 typically outshines Alpha star Betelgeuse, lighting up the southwest foot of Orion.", -0.35, "star"),

        # 12. Cassiopeia (2 Qs)
        q("star_cassiopeia", "Northern Circumpolar Chart · Plate ST-02",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_cassiopeia_id",
          "Identify the prominent northern circumpolar constellation traced by this unmistakable five-star W-shaped asterism near declination +60°.",
          "Cassiopeia", ("Cepheus", "Draco", "Andromeda"),
          ("It sits directly across the North Celestial Pole from the Big Dipper.", "In Greek myth, it depicts a vain Ethiopian queen seated upon her celestial throne."),
          "Cassiopeia's five bright stars (Schedar, Caph, Gamma Cas, Ruchbah, and Segin) trace a crisp W (or M, depending on season) circling Polaris year-round in northern skies.", -1.0, "star"),
        q("star_cassiopeia", "Northern Circumpolar Chart · Plate ST-02",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_cassiopeia_sn",
          "In November 1572, which Danish astronomer observed a dazzling 'new star' (now known as a Type Ia supernova) blazing inside the W-shaped constellation mapped here?",
          "Tycho Brahe", ("Johannes Kepler", "Galileo Galilei", "Nicolaus Copernicus"),
          ("His discovery shattered Aristotle's ancient dogma that the starry heavens were eternally unchanging.", "He later built the famed Uraniborg observatory on the island of Hven."),
          "Tycho Brahe's 1572 book De Nova Stella documented SN 1572 in Cassiopeia, proving the fixed stellar sphere could undergo violent change.", 0.35, "star"),

        # 13. Ursa Major (3 Qs)
        q("star_ursa_major", "Northern Circumpolar Chart · Plate ST-03",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_ursa_id",
          "Look at this seven-star ladle asterism whose two front bowl stars project a 5× dashed sightline straight to the North Celestial Pole. Of which large constellation is it the signature centerpiece?",
          "Ursa Major", ("Ursa Minor", "Boötes", "Lyra"),
          ("It is the third-largest of all 88 officially recognized modern constellations.", "Its Latin name translates to 'Great Bear'."),
          "The seven bright stars of the Big Dipper (or Plough) form the most recognizable asterism inside Ursa Major, the Great Bear.", -1.05, "star"),
        q("star_ursa_major", "Northern Circumpolar Chart · Plate ST-03",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_ursa_polaris",
          "Follow the dashed golden pointer ray extending five times the bowl's width on this star blueprint. Which famous navigational star sits at the tip of that arrow?",
          "Polaris", ("Vega", "Capella", "Arcturus"),
          ("Lying within one degree of Earth's northern rotational axis, it sits at the tip of the Little Dipper's handle.", "Mariners have measured its altitude above the horizon for centuries to determine northern latitude."),
          "Extending a straight line from Merak through Dubhe roughly five times their angular separation leads straight to Polaris, the North Star.", -1.15, "compass"),
        q("star_ursa_major", "Northern Circumpolar Chart · Plate ST-03",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_ursa_mizar",
          "Look closely at the second star from the left tip of the ladle handle on this chart: notice the tiny companion dot beside it. What classic naked-eye visual binary pair is that?",
          "Mizar and Alcor", ("Castor and Pollux", "Albireo A and B", "Alpha and Beta Centauri"),
          ("Nicknamed the 'Horse and Rider', keen eyes can split the two stars without binoculars.", "Telescopes reveal the pair is actually a complex sextuple star system."),
          "At the bend of the Big Dipper's handle, Mizar and its fainter companion Alcor form astronomy's most celebrated naked-eye double star.", 0.4, "star"),

        # 14. Crux (3 Qs)
        q("star_crux", "Southern Celestial Chart · Plate ST-04",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_crux_id",
          "Identify the smallest of all 88 official constellations, charted here at declination -60° as a compact four-star kite plus a fifth offset star guiding mariners south.",
          "Crux", ("Centaurus", "Carina", "Triangulum Australe"),
          ("Popularly called the Southern Cross, it shines on the flags of Australia, New Zealand, Brazil, Samoa, and Papua New Guinea.", "Because no bright star sits at the South Celestial Pole, extending its long axis 4.5× locates due south."),
          "Occupying just 68 square degrees of sky, Crux (the Southern Cross) is the smallest yet most iconic southern navigational constellation.", -0.85, "star"),
        q("star_crux", "Southern Celestial Chart · Plate ST-04",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_crux_coalsack",
          "Right beside the brightest bottom star (Acrux) of this southern constellation sits a famous dark molecular cloud silhouetted against the Milky Way. What is this dark nebula called?",
          "Coalsack Nebula", ("Horsehead Nebula", "Crab Nebula", "Ring Nebula"),
          ("Aboriginal Australian astronomy famously sees it as the head of the 'Emu in the Sky'.", "Its pitch-black patch was nicknamed after a soot-filled fuel bag by European mariners."),
          "Bordering Acrux and Mimosa in Crux, the Coalsack Nebula is the most prominent dark absorption nebula visible to the naked eye in Earth's sky.", 0.55, "star"),

        # 15. Scorpius (3 Qs)
        q("star_scorpius", "Zodiacal Celestial Chart · Plate ST-05",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_scorpius_id",
          "Examine this sweeping J-shaped zodiacal fishhook anchored by a blazing M1 red supergiant heart and ending in a bright twin stinger. Which constellation is drawn?",
          "Scorpius", ("Sagittarius", "Leo", "Aquarius"),
          ("In Greek mythology, this arachnid was placed opposite Orion in the sky so the two enemies are never above the horizon together.", "Polynesian navigators famously called this star hook 'Maui's Fishhook'."),
          "Scorpius traces one of the sky's most vivid figures — a curved tail and twin stinger (Shaula and Lesath) trailing behind its glowing red heart, Antares.", -1.0, "star"),
        q("star_scorpius", "Zodiacal Celestial Chart · Plate ST-05",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_scorpius_antares",
          "What is the name of the crimson M1 red supergiant marked 'α' in this chart — whose Greek name literally means 'Rival of Mars' because the red planet periodically passes nearby?",
          "Antares", ("Betelgeuse", "Aldebaran", "Arcturus"),
          ("Shining roughly 75,000 times brighter than our Sun, it lies about 550 light-years away.", "Combine the Greek prefix 'anti-' with the Greek god of war 'Ares'."),
          "Antares ('Anti-Ares', Rival of Mars) is the brilliant reddish heart of Scorpius, easily confused with Mars whenever the planet glides along the ecliptic nearby.", -0.5, "star"),

        # 16. Cygnus (2 Qs)
        q("star_cygnus", "Galactic Plane Star Chart · Plate ST-06",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_cygnus_id",
          "Study this soaring cross-shaped asterism flying straight down the plane of the Milky Way, anchored by an ultra-luminous A2 tail supergiant and a gold-and-blue double beak star. Name the constellation.",
          "Cygnus", ("Aquila", "Lyra", "Draco"),
          ("Often called the Northern Cross, its Latin name means 'The Swan'.", "Its brightest tail star forms one vertex of the famous Summer Triangle alongside Vega and Altair."),
          "Cygnus (the Swan) glides directly along the summer Milky Way, anchored by luminous supergiant Deneb and the stunning amber-sapphire double star Albireo.", -0.65, "star"),
        q("star_cygnus", "Galactic Plane Star Chart · Plate ST-06",
          1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "vis_st_cygnus_deneb",
          "What is the name of the ultra-luminous A2 supergiant marked 'α' at the upper-left tail of this constellation — one of the most intrinsically luminous first-magnitude stars known?",
          "Deneb", ("Altair", "Vega", "Fomalhaut"),
          ("Even at roughly 2,600 light-years away, it still shines as one of the 20 brightest stars in Earth's sky.", "Its name comes from the Arabic word 'dhanab', meaning 'tail'."),
          "Deneb (Alpha Cygni) radiates roughly 200,000 times the Sun's luminosity, anchoring both the tail of Cygnus and a corner of the Summer Triangle.", -0.2, "star"),

        # --- 8 MOLECULAR, BIOCHEMICAL & ORBITAL PLATES (22 Qs) ---
        # 17. Water H2O (3 Qs)
        q("mol_water", "Triatomic Molecular Geometry · Plate CH-01",
          1, "sci_chemistry", "sci_compounds_molecules", "Chemistry & Elements", "Chemical Compounds & Molar Mass",
          "vis_ch_water_id",
          "Examine this polar triatomic blueprint with two sp³ lone electron pairs compressing the covalent bond angle to exactly 104.5° (bond length 95.8 pm). Which ubiquitous molecule is diagrammed?",
          "Water", ("Carbon dioxide", "Hydrogen sulfide", "Ammonia"),
          ("Its bent geometry creates a permanent electric dipole of 1.85 Debye.", "Hydrogen bonding between these molecules makes its solid ice phase less dense than its liquid phase."),
          "Water (H₂O) adopts a bent 104.5° geometry because two non-bonding lone pairs on oxygen repel the two O–H bonding pairs more strongly than the ideal 109.5° tetrahedral angle.", -1.25, "atom"),
        q("mol_water", "Triatomic Molecular Geometry · Plate CH-01",
          1, "sci_chemistry", "sci_compounds_molecules", "Chemistry & Elements", "Chemical Compounds & Molar Mass",
          "vis_ch_water_vsepr",
          "Under VSEPR theory, why is the bond angle in this sp³ molecule compressed from the ideal 109.5° tetrahedral angle down to 104.5°?",
          "Two lone pairs repel bonding electrons more strongly", ("Hydrogen nuclei attract each other covalently", "Oxygen forms a double pi-bond with both hydrogens", "Nuclear gravity pulls the side atoms downward"),
          ("Notice the two dashed cyan orbital lobes sitting atop the central O atom.", "Non-bonding electron clouds spread wider around the central nucleus than shared bond pairs."),
          "In VSEPR theory, lone-pair–lone-pair and lone-pair–bonding-pair repulsions exceed bonding-pair repulsions, squeezing H₂O's H–O–H angle from 109.5° to 104.5°.", 0.15, "atom"),
        q("mol_water", "Triatomic Molecular Geometry · Plate CH-01",
          1, "sci_chemistry", "sci_compounds_molecules", "Chemistry & Elements", "Chemical Compounds & Molar Mass",
          "vis_ch_water_shape",
          "What geometric term describes the molecular shape (considering atom positions only, not lone pairs) of the 104.5° molecule in this blueprint?",
          "Bent (angular)", ("Linear", "Trigonal planar", "Tetrahedral"),
          ("By contrast, CO₂ has no lone pairs on its central carbon and stays straight at 180°.", "Because the two O–H bond dipoles do not cancel out, the molecule is strongly polar."),
          "While its electron-pair geometry is tetrahedral, water's actual molecular shape is bent (angular), giving it its life-enabling polarity.", -0.6, "atom"),

        # 18. Benzene (3 Qs)
        q("mol_benzene", "Planar Conjugated Ring · Plate CH-02",
          1, "sci_chemistry", "sci_compounds_molecules", "Chemistry & Elements", "Chemical Compounds & Molar Mass",
          "vis_ch_benzene_id",
          "Inspect this planar hexagonal C₆H₆ blueprint where all six carbon-carbon bonds measure an identical 139 pm thanks to six delocalized pi-electrons orbiting the ring. Name this foundational organic compound.",
          "Benzene", ("Cyclohexane", "Naphthalene", "Toluene"),
          ("Michael Faraday first isolated it from compressed illuminating gas in 1825.", "It is the archetype of all aromatic hydrocarbons in organic chemistry."),
          "Benzene (C₆H₆) consists of a perfectly flat six-carbon ring stabilized by six delocalized pi-electrons, giving every carbon-carbon bond an intermediate length of 139 pm.", -0.95, "atom"),
        q("mol_benzene", "Planar Conjugated Ring · Plate CH-02",
          1, "sci_chemistry", "sci_nobel_chemists", "Chemistry & Elements", "Famous Chemists & Biochemists",
          "vis_ch_benzene_kekule",
          "Which German organic chemist famously proposed the cyclic ring structure of this C₆H₆ molecule in 1865 after daydreaming of a snake seizing its own tail (the Ouroboros)?",
          "August Kekulé", ("Dmitri Mendeleev", "Linus Pauling", "Friedrich Wöhler"),
          ("Before his 1865 breakthrough, chemists struggled to explain why C₆H₆ behaved far more stably than open-chain alkenes.", "He recounted the fireside reverie in an 1890 address in Berlin."),
          "In 1865, August Kekulé proposed that benzene's six carbons link into a closed hexagonal ring — a vision he later attributed to a daydream of a tail-biting serpent.", 0.25, "atom"),
        q("mol_benzene", "Planar Conjugated Ring · Plate CH-02",
          1, "sci_chemistry", "sci_compounds_molecules", "Chemistry & Elements", "Chemical Compounds & Molar Mass",
          "vis_ch_benzene_huckel",
          "This ring's extraordinary stability obeys Hückel's rule of aromaticity — requiring a planar conjugated ring containing how many delocalized pi-electrons (for integer n)?",
          "4n + 2", ("2n + 1", "4n", "n² + 2"),
          ("Setting n = 1 yields exactly 6 delocalized pi-electrons, matching the cyan inner ring on this plate.", "Rings with 4n pi-electrons (like cyclobutadiene with 4) are instead unstable and antiaromatic."),
          "Erich Hückel showed in 1931 that planar monocyclic conjugated rings with 4n + 2 pi-electrons (2, 6, 10, 14...) enjoy dramatic quantum resonance stabilization.", 0.7, "atom"),

        # 19. DNA Double Helix (3 Qs)
        q("mol_dna_helix", "Antiparallel Biopolymer · Plate CH-03",
          7, "nat_conservation_breeds", "nat_all_kingdoms_taxonomy", "Botany, Trees, Flora & Fungi", "Cross-Kingdom Classification & Taxonomy",
          "vis_ch_dna_id",
          "Examine this right-handed antiparallel helical blueprint (5'→3' paired with 3'←5'), measuring 2.0 nm wide with a 3.4 nm full turn every 10.5 base pairs. What biological macromolecule is charted?",
          "DNA double helix", ("Alpha-keratin coiled coil", "Transfer RNA cloverleaf", "Cellulose microfibril"),
          ("Its rungs pair purines with pyrimidines via either two or three hydrogen bonds.", "Its B-form architecture was elucidated in April 1953 in Cambridge."),
          "The B-form DNA double helix consists of two antiparallel sugar-phosphate backbones winding around a 2.0 nm core with 3.4 nm per helical turn and complementary base-pair rungs.", -1.25, "dna"),
        q("mol_dna_helix", "Antiparallel Biopolymer · Plate CH-03",
          1, "sci_life_medical", "sci_biomedical_pioneers", "Medicine, Genetics & Earth Science", "Medicine & Physiology Pioneers",
          "vis_ch_dna_franklin",
          "Whose landmark 1952 X-ray diffraction 'Photo 51' revealed the exact 3.4 nm helical repeat and X-shaped cross pattern that proved the helical blueprint shown here?",
          "Rosalind Franklin", ("Barbara McClintock", "Dorothy Hodgkin", "Jennifer Doudna"),
          ("She captured the crisp B-form diffraction pattern alongside PhD student Raymond Gosling at King's College London.", "Her measurements directly confirmed that the phosphate backbone runs along the outside of the helix."),
          "Rosalind Franklin's X-ray crystallography — especially Photo 51 — provided critical experimental proof of DNA's helical geometry, diameter, and 3.4 nm pitch.", -0.65, "dna"),
        q("mol_dna_helix", "Antiparallel Biopolymer · Plate CH-03",
          1, "sci_life_medical", "sci_biology_zoology_botany", "Medicine, Genetics & Earth Science", "Biologists, Botanists & Zoologists",
          "vis_ch_dna_bonds",
          "Look at the dashed cyan and gold base-pair rungs spanning this antiparallel helix: which complementary base pair is linked by THREE hydrogen bonds rather than two?",
          "Guanine and Cytosine", ("Adenine and Thymine", "Adenine and Uracil", "Thymine and Cytosine"),
          ("Because of that extra third hydrogen bond, genomes richer in this pair melt at higher temperatures.", "Its two bases are commonly abbreviated G and C."),
          "In canonical Watson-Crick pairing, Guanine and Cytosine form three hydrogen bonds (G≡C), whereas Adenine and Thymine form only two (A=T).", -0.1, "dna"),

        # 20. Caffeine (3 Qs)
        q("mol_caffeine", "Bicyclic Alkaloid Skeleton · Plate CH-04",
          9, "food_beverages_fermentation", "food_wines_spirits_drinks", "Wines, Spirits, Cocktails & Beverages", "World Wines, Cocktails, Teas & Spirits",
          "vis_ch_caffeine_id",
          "Identify the world's most widely consumed psychoactive alkaloid (C₈H₁₀N₄O₂), mapped here as a fused bicyclic methylxanthine carrying three methyl (CH₃) groups and two carbonyl oxygens.",
          "Caffeine", ("Nicotine", "Theobromine", "Capsaicin"),
          ("Naturally produced by coffee beans, tea leaves, cacao pods, and yerba mate as an insect deterrent.", "Chocolate's primary cousin alkaloid, theobromine, lacks just one of these three methyl branches."),
          "Caffeine (1,3,7-trimethylxanthine, C₈H₁₀N₄O₂) is a central-nervous-system stimulant shared by coffee, tea, kola nuts, and guarana.", -0.85, "atom"),
        q("mol_caffeine", "Bicyclic Alkaloid Skeleton · Plate CH-04",
          1, "sci_life_medical", "sci_biomedical_pioneers", "Medicine, Genetics & Earth Science", "Medicine & Physiology Pioneers",
          "vis_ch_caffeine_receptor",
          "The fused purine-like ring geometry in this C₈H₁₀N₄O₂ blueprint promotes alertness primarily by competitively blocking which drowsiness-signaling brain receptors?",
          "Adenosine receptors", ("Serotonin receptors", "GABA receptors", "Histamine H1 receptors"),
          ("Throughout the day, a sleep-pressure nucleoside steadily accumulates in the brain and binds these sites.", "Because this alkaloid mimics the nucleoside's bicyclic purine ring, it plugs the keyhole without triggering sleepiness."),
          "Caffeine's bicyclic purine core closely resembles adenosine, letting it antagonize brain adenosine receptors and temporarily stave off drowsiness.", 0.15, "dna"),

        # 21. ATP (3 Qs)
        q("mol_atp", "Triphosphate Bio-Carrier · Plate CH-05",
          7, "nat_conservation_breeds", "nat_all_kingdoms_taxonomy", "Botany, Trees, Flora & Fungi", "Cross-Kingdom Classification & Taxonomy",
          "vis_ch_atp_id",
          "Examine this biochemical schematic linking a nitrogenous purine base and 5-carbon sugar ring to a chain of three high-energy phosphate groups (ΔG° = -30.5 kJ/mol). Name this universal cellular energy currency.",
          "ATP", ("NADH", "DNA", "Insulin"),
          ("Hydrolyzing its terminal gamma-phosphate bond converts it to ADP and drives muscle contraction and ion pumps.", "Your body recycles roughly its own body weight in this molecule every single day."),
          "Adenosine triphosphate (ATP) stores readily transferable chemical energy across its three linked phosphate groups, powering nearly all cellular work across life on Earth.", -1.05, "dna"),
        q("mol_atp", "Triphosphate Bio-Carrier · Plate CH-05",
          7, "nat_conservation_breeds", "nat_all_kingdoms_taxonomy", "Botany, Trees, Flora & Fungi", "Cross-Kingdom Classification & Taxonomy",
          "vis_ch_atp_mito",
          "Inside eukaryotic cells, which double-membraned organelle houses the rotary synthase turbines that manufacture the vast majority of this triphosphate energy molecule?",
          "Mitochondria", ("Ribosomes", "Golgi apparatus", "Lysosomes"),
          ("Often nicknamed the 'powerhouse of the cell', it even retains its own circular bacterial-like genome.", "A proton gradient across its folded inner cristae spins an actual nanoscale molecular motor."),
          "Mitochondria generate most eukaryotic ATP via oxidative phosphorylation, driving proton flow through rotary ATP synthase turbines embedded in the inner membrane.", -1.1, "dna"),
        q("mol_atp", "Triphosphate Bio-Carrier · Plate CH-05",
          1, "sci_chemistry", "sci_compounds_molecules", "Chemistry & Elements", "Chemical Compounds & Molar Mass",
          "vis_ch_atp_ribose",
          "What five-carbon monosaccharide forms the central pentagonal bridge ('5-C SUGAR RING') connecting the nitrogenous base to the three phosphates in this blueprint?",
          "Ribose", ("Deoxyribose", "Fructose", "Galactose"),
          ("Unlike DNA's sugar, this pentose retains a hydroxyl (–OH) group on its 2' carbon.", "It also lends the first letter 'R' to RNA."),
          "ATP uses ribose (specifically D-ribose) as its central 5-carbon furanose bridge linking adenine to the alpha-beta-gamma triphosphate tail.", 0.15, "atom"),

        # 22. Aspirin (2 Qs)
        q("mol_aspirin", "Ortho-Substituted Ester · Plate CH-06",
          1, "sci_chemistry", "sci_compounds_molecules", "Chemistry & Elements", "Chemical Compounds & Molar Mass",
          "vis_ch_aspirin_id",
          "Inspect this 1897 pharmaceutical blueprint (C₉H₈O₄) derived from willow-bark chemistry: an aromatic ring carrying adjacent carboxylic acid and acetyl ester groups. Which iconic medicine is shown?",
          "Aspirin", ("Ibuprofen", "Penicillin", "Acetaminophen"),
          ("Chemically named acetylsalicylic acid, it was synthesized in stable pure form by Felix Hoffmann at Bayer.", "Beyond pain and fever relief, low daily doses are widely used to inhibit blood-clot platelet aggregation."),
          "Synthesized in 1897 by adding an acetyl group to willow-bark salicylic acid, aspirin (C₉H₈O₄) became one of modern medicine's foundational anti-inflammatory drugs.", -0.7, "atom"),
        q("mol_aspirin", "Ortho-Substituted Ester · Plate CH-06",
          7, "nat_botany_fungi", "nat_plants_trees", "Botany, Trees, Flora & Fungi", "Trees, Flowers & Wild Plants",
          "vis_ch_aspirin_cox",
          "How does this 1897 C₉H₈O₄ compound reduce pain, fever, and inflammation inside human tissues — a discovery that won the 1982 Nobel Prize in Physiology or Medicine?",
          "It irreversibly inhibits cyclooxygenase (COX) enzymes", ("It ruptures bacterial cell walls during division", "It floods brain synapses with synthetic endorphins", "It dissolves uric acid crystals inside joints"),
          ("Blocking COX halts the synthesis of pain-sensitizing lipid messengers called prostaglandins.", "British pharmacologist John Vane shared the 1982 Nobel Prize for solving this exact mechanism."),
          "Aspirin transfers its acetyl group directly onto cyclooxygenase (COX-1 and COX-2) enzymes, shutting down inflammatory prostaglandin and thromboxane production.", 0.55, "dna"),

        # 23. Atomic 3d_{z^2} Orbital (2 Qs)
        q("mol_d_orbital", "Quantum Electron Density · Plate CH-07",
          1, "sci_physics", "sci_physicists", "Physics & Quantum Mechanics", "Physicists & Astronomers",
          "vis_ch_dorbital_id",
          "Study this quantum wavefunction blueprint (ℓ = 2, m = 0) showing two opposite axial lobes encircled by an equatorial toroidal donut ring with conical nodes at 54.7°. Which specific atomic subshell state is plotted?",
          "3dz²", ("2pz", "1s", "4fxyz"),
          ("Its azimuthal quantum number ℓ = 2 uniquely defines the d-subshell of transition metals.", "Among the five d-subshell shapes, four look like four-leaf clovers while this single m = 0 member sports a donut ring."),
          "With quantum numbers ℓ = 2 and m = 0, the iconic dumbbell-plus-torus geometry belongs exclusively to the 3dz² atomic orbital.", 0.45, "atom"),
        q("mol_d_orbital", "Quantum Electron Density · Plate CH-07",
          1, "sci_chemistry", "sci_periodic_elements", "Chemistry & Elements", "Periodic Table of Elements",
          "vis_ch_dorbital_max",
          "In any atomic energy shell where the ℓ = 2 subshell illustrated here exists (starting at n = 3), how many total degenerate orbitals share this subshell?",
          "Five", ("Three", "One", "Seven"),
          ("Magnetic quantum number m spans integer values from -ℓ to +ℓ (-2, -1, 0, +1, +2).", "Holding two spin-paired electrons each, this explains why the periodic table's d-block spans 10 columns."),
          "For ℓ = 2, m takes five values (-2, -1, 0, +1, +2), creating five distinct d-orbitals capable of holding up to 10 transition-metal electrons.", 0.25, "atom"),

        # 24. Glucose Haworth Ring (2 Qs)
        q("mol_glucose", "Hexose Haworth Ring · Plate CH-08",
          1, "sci_chemistry", "sci_compounds_molecules", "Chemistry & Elements", "Chemical Compounds & Molar Mass",
          "vis_ch_glucose_id",
          "Examine this six-membered Haworth aldohexose ring (C₆H₁₂O₆, molar mass 180.16 g/mol) containing five carbons, one ring oxygen, and a CH₂OH flag. Which primary blood sugar is depicted?",
          "Glucose", ("Sucrose", "Ribose", "Lactose"),
          ("Plants synthesize it directly from CO₂ and sunlight during photosynthesis.", "Polymers of this single monomer build starch, glycogen, and plant cellulose."),
          "D-Glucose (C₆H₁₂O₆) cyclizes in water into a six-membered pyranose ring, serving as the primary metabolic fuel for brains and cells across biology.", -0.85, "atom"),
        q("mol_glucose", "Hexose Haworth Ring · Plate CH-08",
          7, "nat_botany_fungi", "nat_plants_trees", "Botany, Trees, Flora & Fungi", "Trees, Flowers & Wild Plants",
          "vis_ch_glucose_poly",
          "When plants link thousands of these C₆H₁₂O₆ rings end-to-end via rigid beta-1,4 glycosidic bonds that humans cannot digest, which structural biopolymer do they create?",
          "Cellulose", ("Glycogen", "Chitin", "Collagen"),
          ("It is the most abundant organic polymer on Earth, forming crisp plant cell walls and cotton fibers.", "Termites and cows rely on symbiotic gut microbes to break down its tough beta bonds."),
          "Linking glucose monomers through beta-1,4 bonds creates straight, hydrogen-bonded sheets of cellulose — the tough structural fiber of wood, paper, and cotton.", 0.05, "dna"),

        # --- 6 WORLD FLAG GEOMETRIC RATIO BLUEPRINTS (16 Qs) ---
        # 25. Flag of Nepal (3 Qs)
        q("flag_nepal", "Statutory Construction Plate · Plate FL-01",
          2, "geo_world_cities", "geo_cities_asia_pacific", "World Cities & Urban Centers", "Cities of Asia & Oceania",
          "vis_fl_nepal_id",
          "Inspect this 1962 statutory vexillology blueprint depicting the world's ONLY non-quadrilateral national flag: twin stacked triangular pennants bearing a crescent moon and 12-rayed sun. Which nation does it represent?",
          "Nepal", ("Bhutan", "Sri Lanka", "Switzerland"),
          ("This landlocked Himalayan nation contains eight of Earth's ten tallest mountain peaks.", "Its 1962 constitution even includes a 24-step geometric compass-and-straightedge algorithm to draw the flag."),
          "Nepal's double-pennant flag is the sole non-rectangular sovereign national flag on Earth, mathematically specified in its constitution with a crescent moon and 12-rayed sun.", -1.15, "globe", ["NP", "GLOBAL"]),
        q("flag_nepal", "Statutory Construction Plate · Plate FL-01",
          8, "soc_nations_geopolitics", "soc_capitals_currencies", "Sovereign Nations, Capitals & Currencies", "World Capitals, Continents & Currencies",
          "vis_fl_nepal_capital",
          "What is the capital city of the Himalayan republic represented by this unique double-pennant geometric blueprint?",
          "Kathmandu", ("Thimphu", "Lhasa", "Pokhara"),
          ("Nestled in a high mountain valley roughly 1,400 meters above sea level.", "It serves as the primary staging gateway for Mount Everest expeditions."),
          "Kathmandu is the capital and largest city of Nepal, home to the unique double-pennant national flag codified in 1962.", -0.9, "globe", ["NP", "GLOBAL"]),
        q("flag_nepal", "Statutory Construction Plate · Plate FL-01",
          11, "logic_geometry_spatial", "logic_geometry_algebra", "Geometry, Polygons & 3D Solids", "Polygons, Triangles & 3D Surface/Volume",
          "vis_fl_nepal_math",
          "Look at the unusual statutory aspect ratio printed on this double-pennant blueprint (1 : 1.219...). What mathematical property makes this ratio unique among all national flags?",
          "It is an irrational number", ("It equals pi divided by two", "It is a prime integer ratio", "It changes every leap year"),
          ("Its exact value involves the square root of 2 from intersecting 45° diagonals and inner border offsets.", "No finite fraction of two integers can express its exact statutory width-to-height ratio."),
          "Because the 1962 constitutional construction intersects a 3:4 triangle with constant-width borders, Nepal's exact flag aspect ratio (~1.21901033...) is provably irrational!", 0.85, "prism", ["NP", "GLOBAL"]),

        # 26. Flag of Switzerland (3 Qs)
        q("flag_switzerland", "Statutory 1:1 Construction · Plate FL-02",
          8, "soc_nations_geopolitics", "soc_capitals_currencies", "Sovereign Nations, Capitals & Currencies", "World Capitals, Continents & Currencies",
          "vis_fl_swiss_id",
          "Study this exact 1:1 square flag blueprint featuring a centered equilateral cross whose arm length exceeds arm width by a statutory 7:6 ratio. Which European confederation flies this banner?",
          "Switzerland", ("Austria", "Denmark", "Georgia"),
          ("Only one other sovereign state on Earth — Vatican City — uses an official 1:1 square national flag.", "Inverting its colors in 1863 created the global emblem of the International Red Cross."),
          "Switzerland's national flag is one of just two square sovereign flags in the world, legally defined with a centered white cross whose arms maintain an exact 7:6 length-to-width ratio.", -1.2, "scales", ["CH", "GLOBAL"]),
        q("flag_switzerland", "Statutory 1:1 Construction · Plate FL-02",
          8, "soc_nations_geopolitics", "soc_capitals_currencies", "Sovereign Nations, Capitals & Currencies", "World Capitals, Continents & Currencies",
          "vis_fl_swiss_vatican",
          "Aside from the Alpine confederation mapped in this 1:1 square blueprint, which tiny European microstate is the ONLY other sovereign nation with an official square national flag?",
          "Vatican City", ("Monaco", "San Marino", "Liechtenstein"),
          ("Completely landlocked inside the city of Rome, it is the world's smallest independent state by both area and population.", "Its square yellow-and-white banner bears the crossed keys of Saint Peter."),
          "Switzerland and Vatican City are the only two sovereign nations on Earth whose official national flags follow a strict 1:1 square aspect ratio.", -0.5, "scales", ["VA", "CH", "GLOBAL"]),

        # 27. Union Jack (3 Qs)
        q("flag_uk_union", "Heraldic Superposition · Plate FL-03",
          8, "soc_nations_geopolitics", "soc_capitals_currencies", "Sovereign Nations, Capitals & Currencies", "World Capitals, Continents & Currencies",
          "vis_fl_uk_id",
          "Inspect this 1801 1:2 heraldic blueprint layering a centered upright cross over a broad saltire and an offset, pinwheeling narrow saltire. Which sovereign kingdom's flag is drawn?",
          "United Kingdom", ("Norway", "Australia", "Iceland"),
          ("Its offset cyan diagonal stripes mean the flag actually has a right-side-up and an upside-down orientation.", "It unites the patron-saint crosses of England, Scotland, and Ireland."),
          "Adopted upon the 1801 Acts of Union, the United Kingdom's Union Flag counterchanges St. Patrick's diagonal saltire against St. Andrew's so neither heraldic cross eclipses the other.", -1.15, "crown", ["GB", "GLOBAL"]),
        q("flag_uk_union", "Heraldic Superposition · Plate FL-03",
          0, "hist_empires", "hist_european_crowns", "Empires, Dynasties & Realms", "European Kingdoms & Empires",
          "vis_fl_uk_wales",
          "Notice the three patron-saint crosses combined in this 1801 blueprint (St. George, St. Andrew, and St. Patrick). Which constituent country of that kingdom is NOT represented in the heraldry?",
          "Wales", ("Scotland", "Northern Ireland", "England"),
          ("Because it had already been legally annexed into the Kingdom of England centuries earlier under Henry VIII's 1535–1542 statutory union acts.", "Its own distinctive national banner features a fierce red dragon on green and white."),
          "Because Wales was already united with England when the first Union Flag formed in 1606, its iconic red dragon (Y Ddraig Goch) was never integrated into the Union Jack.", -0.55, "crown", ["GB", "GLOBAL"]),
        q("flag_uk_union", "Heraldic Superposition · Plate FL-03",
          8, "soc_regional_politics", "soc_us_uk_politics", "Regional Politics & Global Institutions", "U.S., British & Commonwealth Politics",
          "vis_fl_uk_upside",
          "Look closely at the cyan narrow diagonal bars on the left (hoist) side of this 1801 blueprint: how do you confirm the flag is flown RIGHT-SIDE UP?",
          "The broader white diagonal band sits ABOVE the red pinwheel bar near the hoist", ("Both diagonal bars are perfectly centered and symmetric", "The upright cross sits slightly closer to the flagpole", "The top-right corner features a gold crown outline"),
          ("Because St. Patrick's red saltire is offset counter-clockwise, flipping the flag upside down reverses which half of the hoist diagonal is thicker.", "Flying it inverted has historically served as a subtle distress signal at sea."),
          "Because St. Patrick's saltire is pinwheeled asymmetrically, the Union Flag is right-side up only when the broader white diagonal of St. Andrew sits on top next to the hoist pole.", 0.55, "scales", ["GB", "GLOBAL"]),

        # 28. South Korea Taegeukgi (3 Qs)
        q("flag_south_korea", "Cosmological Ratio Plate · Plate FL-04",
          8, "soc_nations_geopolitics", "soc_capitals_currencies", "Sovereign Nations, Capitals & Currencies", "World Capitals, Continents & Currencies",
          "vis_fl_skorea_id",
          "Study this 2:3 vexillology blueprint pairing a central swirling S-curve duality disc with four broken-and-solid trigrams set along the diagonals. Which East Asian republic flies this flag?",
          "South Korea", ("Japan", "Taiwan", "Mongolia"),
          ("Its flag is natively called the Taegeukgi.", "Its four corner bar groups represent Heaven, Water, Fire, and Earth."),
          "South Korea's Taegeukgi pairs a red-and-blue central yin-yang taegeuk with four black trigrams drawn from the I Ching representing cosmic harmony and balance.", -1.15, "globe", ["KR", "GLOBAL"]),
        q("flag_south_korea", "Cosmological Ratio Plate · Plate FL-04",
          10, "myth_world_literature", "myth_classic_modern_works", "World Literature, Novels & Classics", "Classic & Modern Novels, Plays & Epics",
          "vis_fl_skorea_iching",
          "From which ancient East Asian divination and philosophical classic ('Book of Changes') are the four three-bar corner trigrams on this blueprint drawn?",
          "I Ching", ("Tao Te Ching", "Analects", "Art of War"),
          ("Its eight possible three-line combinations (bagua) inspired Gottfried Leibniz's 1703 paper on binary arithmetic!", "Each solid bar signifies yang and each broken bar signifies yin."),
          "The four corner trigrams on South Korea's flag (Geon, Gam, Ri, and Gon) come directly from the eight bagua trigrams of the classical I Ching.", 0.15, "scroll", ["KR", "GLOBAL"]),

        # 29. Nordic Cross / Denmark (3 Qs)
        q("flag_nordic_cross", "Hoist-Shifted Cross Plate · Plate FL-05",
          0, "hist_empires", "hist_european_crowns", "Empires, Dynasties & Realms", "European Kingdoms & Empires",
          "vis_fl_denmark_id",
          "Inspect this 28:37 hoist-shifted cross blueprint (12:4:21 horizontal ratio), attested since the 1370s and recognized by Guinness World Records as the oldest continuously used state flag. Which nation owns it?",
          "Denmark", ("Sweden", "Norway", "Finland"),
          ("Known natively as the Dannebrog, legend says it drifted down from heaven during a 1219 battle in Estonia.", "Its off-center cross template later inspired the national flags of all four neighboring Nordic states."),
          "Denmark's Dannebrog (attested in the 14th-century Gelre Armorial) is the world's oldest continuously used sovereign national flag and established the iconic Nordic Cross design.", -0.5, "crown", ["DK", "GLOBAL"]),
        q("flag_nordic_cross", "Hoist-Shifted Cross Plate · Plate FL-05",
          8, "soc_nations_geopolitics", "soc_capitals_currencies", "Sovereign Nations, Capitals & Currencies", "World Capitals, Continents & Currencies",
          "vis_fl_denmark_region",
          "Why is the vertical bar of this classic 12:4:21 Nordic banner deliberately shifted left toward the flagpole hoist rather than centered?",
          "Optical balance makes the emblem appear centered while streaming in wind", ("To save expensive dye along the fly edge", "To leave room for a monarch's seal on the right", "Because medieval masts hung flags vertically"),
          ("Wind ripples and foreshortening visually shorten the trailing fly end of a banner.", "Every sovereign Scandinavian nation plus Iceland and Finland adopts this optical-balance geometry."),
          "Shifting the vertical cross bar toward the hoist compensates for optical foreshortening and fluttering at the fly end, giving Nordic Cross flags commanding legibility at sea.", 0.25, "compass", ["DK", "GLOBAL"]),

        # 30. Seychelles (2 Qs)
        q("flag_seychelles", "Radial Subdivision Plate · Plate FL-06",
          2, "geo_physical_relief", "geo_islands_archipelagos", "Mountains, Volcanoes & Islands", "World Islands & Archipelagos",
          "vis_fl_seychelles_id",
          "Examine this bold 1996 1:2 flag blueprint divided into five oblique bands radiating from the bottom-left corner at exact 1/3 edge intervals. Which Indian Ocean archipelago flies this design?",
          "Seychelles", ("Mauritius", "Maldives", "Comoros"),
          ("Its five vibrant rays fan out in blue, yellow, red, white, and green.", "This 115-island African republic has its capital at Victoria on Mahé."),
          "Adopted in 1996, the flag of Seychelles radiates five dynamic color wedges (blue, yellow, red, white, green) from the lower hoist corner in exact 1/3 divisions.", -0.25, "globe", ["SC", "GLOBAL"]),
        q("flag_seychelles", "Radial Subdivision Plate · Plate FL-06",
          7, "nat_vertebrates", "nat_reptiles_amphibians", "Mammals, Birds & Reptiles", "Reptiles & Amphibians",
          "vis_fl_seychelles_tortoise",
          "The Indian Ocean archipelago represented by this 5-ray blueprint is home to Aldabra Atoll — sanctuary of one of Earth's largest populations of which giant reptile?",
          "Giant tortoise", ("Komodo dragon", "Marine iguana", "Saltwater crocodile"),
          ("Individuals of this herbivorous Aldabra species regularly live past 150 years of age.", "Their sole remaining close rivals in size inhabit the Galápagos Islands half a world away."),
          "Aldabra Atoll in Seychelles protects over 100,000 Aldabra giant tortoises — the largest wild population of giant tortoises on the planet.", -0.1, "dna", ["SC", "GLOBAL"]),

        # --- 5 HISTORICAL BATTLE & MARITIME MAPS (14 Qs) ---
        # 31. Battle of Cannae (3 Qs)
        q("map_cannae", "Tactical Encirclement Plate · Plate MP-01",
          0, "hist_military", "hist_ancient_medieval_battles", "Military History & Conflicts", "Ancient & Medieval Warfare",
          "vis_mp_cannae_id",
          "Study this famous 216 BCE battlefield schematic: an outnumbered curved infantry center gives ground from convex to concave while heavy flanks and sweeping cavalry close a 360° pincer on 86,000 troops. Name this battle.",
          "Battle of Cannae", ("Battle of Zama", "Battle of Marathon", "Battle of Gaugamela"),
          ("Fought in southeastern Italy during the Second Punic War, it remains military history's textbook double envelopment.", "Over 50,000 Roman soldiers perished in a single afternoon."),
          "At the Battle of Cannae (August 2, 216 BCE), Hannibal's thinner center bowed deliberately backward, drawing Rome's dense legions into a lethal 360° double envelopment.", -0.75, "crown", ["IT", "GLOBAL"]),
        q("map_cannae", "Tactical Encirclement Plate · Plate MP-01",
          0, "hist_leaders_figures", "hist_explorers_commanders", "Historical Figures & Rulers", "Explorers, Navigators & Commanders",
          "vis_mp_cannae_hannibal",
          "Which Carthaginian general — who had marched war elephants across the Alps two years earlier — orchestrated the 216 BCE double-envelopment masterpiece shown here?",
          "Hannibal Barca", ("Scipio Africanus", "Alexander the Great", "Pyrrhus of Epirus"),
          ("He commanded roughly 50,000 Carthaginian, Iberian, Gaulish, and Numidian troops against Rome's largest army ever fielded.", "Generals from Napoleon to Norman Schwarzkopf studied his pincer maneuver."),
          "Carthaginian strategist Hannibal Barca personally positioned himself in the yielding convex center at Cannae to ensure the trap bent cleanly without breaking.", -1.05, "crown", ["TN", "IT", "GLOBAL"]),
        q("map_cannae", "Tactical Encirclement Plate · Plate MP-01",
          0, "hist_military", "hist_ancient_medieval_battles", "Military History & Conflicts", "Ancient & Medieval Warfare",
          "vis_mp_cannae_war",
          "The 216 BCE tactical annihilation charted on this blueprint occurred during which protracted conflict between the Roman Republic and Carthage?",
          "Second Punic War", ("Peloponnesian War", "First Punic War", "Gallic Wars"),
          ("Spanning 218 to 201 BCE, it ended only after Scipio Africanus invaded North Africa.", "Its Latin name derives from 'Poeni', the Roman word for the Phoenician-descended Carthaginians."),
          "The Battle of Cannae was the catastrophic turning point of the Second Punic War (218–201 BCE), nearly bringing the Roman Republic to collapse.", -0.5, "crown", ["IT", "GLOBAL"]),

        # 32. Panama Canal (3 Qs)
        q("map_panama_canal", "Isthmus Lock Elevation · Plate MP-02",
          2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "vis_mp_panama_id",
          "Examine this 1914 82-kilometer maritime elevation lifting ships via 3-step locks up to a +26-meter artificial lake across a continental divide on a surprising northwest-to-southeast transit. Name this waterway.",
          "Panama Canal", ("Suez Canal", "Kiel Canal", "Corinth Canal"),
          ("Because the Central American isthmus twists in an S-curve, ships sailing from the Atlantic to the Pacific actually travel southeast!", "Gravity-fed freshwater from Gatun Lake fills each lock chamber without pumps."),
          "Opened in August 1914, the 82 km Panama Canal lifts vessels 26 meters above sea level via the Gatun Locks across Gatun Lake and Culebra Cut on a NW-to-SE heading.", -1.2, "compass", ["PA", "GLOBAL"]),
        q("map_panama_canal", "Isthmus Lock Elevation · Plate MP-02",
          2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "vis_mp_panama_lake",
          "What colossal artificial freshwater reservoir (+26 m elevation on this profile) was created by damming the Chagres River to supply water to the locks?",
          "Gatun Lake", ("Lake Nicaragua", "Lake Maracaibo", "Great Bitter Lake"),
          ("When flooded in 1913, it was briefly the largest human-made lake on Earth.", "Severe droughts here directly limit daily vessel draft and transit slots."),
          "Created by the Gatun Dam across the Chagres River, Gatun Lake sits 26 meters above sea level and supplies ~200 million liters of gravity-fed freshwater for every transit.", 0.15, "globe", ["PA", "GLOBAL"]),
        q("map_panama_canal", "Isthmus Lock Elevation · Plate MP-02",
          1, "sci_life_medical", "sci_biomedical_pioneers", "Medicine, Genetics & Earth Science", "Medicine & Physiology Pioneers",
          "vis_mp_panama_disease",
          "After Ferdinand de Lesseps's French effort collapsed in the 1880s, U.S. chief sanitary officer William Gorgas made the 1914 waterway mapped here possible by eradicating mosquitoes carrying malaria and what other deadly virus?",
          "Yellow fever", ("Cholera", "Typhus", "Smallpox"),
          ("Cuban physician Carlos Finlay and U.S. Army researcher Walter Reed proved Aedes aegypti mosquitoes transmitted it.", "Draining puddles and oiling standing water cut mortality dramatically across the Isthmus."),
          "Confirming that Aedes aegypti mosquitoes spread yellow fever allowed William Gorgas's sanitation campaign to eliminate the epidemic that had doomed the earlier French canal project.", -0.35, "dna", ["PA", "GLOBAL"]),

        # 33. Thermopylae (3 Qs)
        q("map_thermopylae", "Chokepoint Topography · Plate MP-03",
          0, "hist_military", "hist_ancient_medieval_battles", "Military History & Conflicts", "Ancient & Medieval Warfare",
          "vis_mp_thermopylae_id",
          "Inspect this 480 BCE coastal topography showing a 15-meter mountain-and-sea chokepoint finally turned by a secret dashed highland flanking trail. Which legendary last stand happened here?",
          "Battle of Thermopylae", ("Battle of Salamis", "Battle of Plataea", "Battle of Actium"),
          ("Its Greek name literally translates to 'Hot Gates', named for natural sulfurous geothermal springs nearby.", "A local traitor named Ephialtes revealed the Anopaea mountain path to the invading force."),
          "In 480 BCE, Greek forces led by Spartan King Leonidas held the narrow 15-meter coastal pass of Thermopylae for three days against Persia until outflanked via the Anopaea mountain trail.", -1.1, "crown", ["GR", "GLOBAL"]),
        q("map_thermopylae", "Chokepoint Topography · Plate MP-03",
          0, "hist_leaders_figures", "hist_monarchs_rulers", "Historical Figures & Rulers", "Monarchs, Emperors & Sovereign Rulers",
          "vis_mp_thermopylae_king",
          "Which Spartan king commanded the Greek vanguard — including his famous 300 royal bodyguards alongside Thespians and Thebans — inside the 15-meter coastal pass shown here?",
          "Leonidas I", ("Pericles", "Themistocles", "Miltiades"),
          ("His famous laconic reply to Xerxes's demand to surrender weapons was 'Molon labe!' ('Come and take them!').", "He fell on the third day after dismissing most allied contingents to preserve Greece's army."),
          "Spartan King Leonidas I led the allied Greek stand at Thermopylae in 480 BCE, buying crucial time for Athens and the Hellenic navy to regroup at Salamis.", -1.15, "crown", ["GR", "GLOBAL"]),

        # 34. Bosporus Strait (3 Qs)
        q("map_bosporus_strait", "Intercontinental Strait · Plate MP-04",
          2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "vis_mp_bosporus_id",
          "Study this sinuous 31-kilometer maritime waterway narrowing to just 700 meters wide as it physically divides Europe (west bank) from Asia (east bank). Name this strategic strait.",
          "Bosporus", ("Strait of Gibraltar", "Strait of Malacca", "Strait of Hormuz"),
          ("It links the Black Sea to the north with the Sea of Marmara to the south.", "Its name derives from Greek for 'ox-ford', linked to the myth of Io swimming across."),
          "Carving 31 km straight through Istanbul and narrowing to 700 meters, the Bosporus separates Europe from Asia and serves as the sole maritime outlet for the Black Sea.", -0.7, "globe", ["TR", "GLOBAL"]),
        q("map_bosporus_strait", "Intercontinental Strait · Plate MP-04",
          2, "geo_world_cities", "geo_cities_europe_americas", "World Cities & Urban Centers", "Cities of Europe & Latin America",
          "vis_mp_bosporus_city",
          "Which transcontinental metropolis of over 15 million people straddles both the western and eastern banks of the 31-kilometer strait charted here?",
          "Istanbul", ("Athens", "Cairo", "Baku"),
          ("Historically known as Byzantium and later Constantinople before adopting its modern name.", "Three colossal suspension bridges and the undersea Marmaray rail tunnel knit its European and Asian halves together."),
          "Istanbul is the world's most populous transcontinental city, spanning both the European and Asian shores of the Bosporus Strait.", -1.1, "globe", ["TR", "GLOBAL"]),
        q("map_bosporus_strait", "Intercontinental Strait · Plate MP-04",
          8, "soc_governance_law", "soc_constitutions_courts", "World Leaders, Parties & Constitutional Law", "Constitutions, Statutes & Landmark Cases",
          "vis_mp_bosporus_montreux",
          "Which 1936 international treaty signed in Switzerland grants Turkey control over the strait mapped here and regulates naval warship passage into the Black Sea?",
          "Montreux Convention", ("Treaty of Lausanne", "Treaty of Versailles", "Geneva Accord"),
          ("It guarantees free peacetime passage for civilian merchant vessels while strictly capping non-Black-Sea warship tonnage.", "Named after the lakeside Swiss resort town on Lake Geneva where diplomats signed it."),
          "Signed in 1936, the Montreux Convention Regarding the Regime of the Straits governs civilian and naval transit through the Bosporus and Dardanelles to this day.", 0.65, "scales", ["TR", "CH", "GLOBAL"]),

        # 35. Suez Canal (3 Qs)
        q("map_suez_canal", "Sea-Level Maritime Trench · Plate MP-05",
          2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "vis_mp_suez_id",
          "Examine this 1869 193.3-kilometer artificial waterway cutting straight across an arid isthmus at zero sea level with ZERO locks, widening midway through a central salt lake. Name this canal.",
          "Suez Canal", ("Panama Canal", "Erie Canal", "Grand Canal"),
          ("It slashes roughly 7,000 kilometers off the voyage between Europe and Asia by bypassing Africa's Cape of Good Hope.", "In March 2021, the container ship Ever Given famously wedged sideways across its banks for six days."),
          "Opened in 1869 in Egypt, the 193.3 km Suez Canal links the Mediterranean and Red Seas directly at sea level via Great Bitter Lake without a single lock.", -1.2, "compass", ["EG", "GLOBAL"]),
        q("map_suez_canal", "Sea-Level Maritime Trench · Plate MP-05",
          0, "hist_treaties_eras", "hist_revolutions_reforms", "Treaties, Archaeology & Turning Points", "Social Revolutions & Modern Era",
          "vis_mp_suez_nasser",
          "Which Egyptian president sparked an international 1956 crisis by nationalizing the sea-level waterway mapped in this blueprint?",
          "Gamal Abdel Nasser", ("Anwar Sadat", "Hosni Mubarak", "King Farouk"),
          ("He announced the nationalization during a fiery July 1956 speech in Alexandria to help fund the Aswan High Dam.", "The resulting diplomatic standoff accelerated the decline of British and French colonial power."),
          "President Gamal Abdel Nasser nationalized the Suez Canal Company in July 1956, triggering the Suez Crisis and reshaping Cold War Middle Eastern geopolitics.", -0.15, "crown", ["EG", "GLOBAL"]),

        # --- 5 CLASSICAL MATH, TOPOLOGY & LOGIC PLATES (14 Qs) ---
        # 36. Pythagorean Proof (3 Qs)
        q("geo_pythagoras", "Euclidean Area Dissection · Plate GM-01",
          11, "logic_geometry_spatial", "logic_geometry_algebra", "Geometry, Polygons & 3D Solids", "Polygons, Triangles & 3D Surface/Volume",
          "vis_gm_pythag_id",
          "Inspect this visual 3-4-5 unit-square dissection proving visually that the areas on the two perpendicular legs (9 + 16) equal the area built on the slanted hypotenuse (25). Name this fundamental theorem.",
          "Pythagorean theorem", ("Thales's theorem", "Law of cosines", "Euclid's parallel postulate"),
          ("Stated algebraically as a² + b² = c² for every right triangle in Euclidean geometry.", "Over 370 distinct geometric and algebraic proofs have been published, including one by U.S. President James A. Garfield."),
          "The Pythagorean theorem proves that for any Euclidean right triangle, the square on the hypotenuse equals the sum of the squares on the other two sides (here 3² + 4² = 5²).", -1.3, "prism"),
        q("geo_pythagoras", "Euclidean Area Dissection · Plate GM-01",
          11, "logic_geometry_spatial", "logic_geometry_algebra", "Geometry, Polygons & 3D Solids", "Polygons, Triangles & 3D Surface/Volume",
          "vis_gm_pythag_triple",
          "The 3-4-5 integer side lengths in this blueprint form the smallest primitive Pythagorean triple. Which of these is the NEXT smallest primitive Pythagorean triple (greatest common divisor 1)?",
          "5, 12, 13", ("6, 8, 10", "4, 5, 6", "7, 14, 15"),
          ("Check 5² + 12² = 25 + 144 = 169.", "Remember 6-8-10 is just 3-4-5 doubled, so it is NOT primitive."),
          "Since 5² + 12² = 169 = 13² and gcd(5, 12, 13) = 1, (5, 12, 13) is the next primitive Pythagorean triple after (3, 4, 5).", -0.3, "prism"),
        q("geo_pythagoras", "Euclidean Area Dissection · Plate GM-01",
          11, "logic_puzzles_cryptography", "logic_mathematicians", "Ciphers, Number Bases & Mathematicians", "Great Mathematicians, Logicians & Cryptographers",
          "vis_gm_pythag_plimpton",
          "More than a millennium before ancient Greece, scribes in which ancient civilization etched a clay tablet (Plimpton 322, c. 1800 BCE) listing fifteen precise integer triples satisfying this exact relationship?",
          "Babylonia", ("Minoan Crete", "Shang China", "Olmec Mesoamerica"),
          ("They calculated in base-60 sexagesimal arithmetic — the same system behind our 60-minute hour and 360° circle.", "The famous cuneiform tablet now resides at Columbia University."),
          "Old Babylonian mathematicians compiled Plimpton 322 around 1800 BCE using base-60 fractions, demonstrating sophisticated mastery of Pythagorean triples over 1,000 years before Pythagoras.", 0.35, "scroll"),

        # 37. Golden Ratio Spiral (3 Qs)
        q("geo_golden_spiral", "Nested Square Tiling · Plate GM-02",
          11, "logic_sequences_patterns", "logic_fibonacci_quadratic_seq", "Sequences, Patterns & Recurrences", "Fibonacci, Quadratic & Doubling Sequences",
          "vis_gm_golden_seq",
          "Look at the nested square side lengths tiling this expanding rectangle: 1, 1, 2, 3, 5, 8, 13 — where each term is the sum of the two before it. Name this famous sequence.",
          "Fibonacci sequence", ("Lucas sequence", "Catalan numbers", "Pascal's triangle"),
          ("Popularized in Europe by Leonardo of Pisa in his 1202 treatise Liber Abaci using a rabbit-breeding puzzle.", "Its consecutive term ratios converge smoothly toward 1.6180339..."),
          "Each square in this tiling matches a term of the Fibonacci sequence (1, 1, 2, 3, 5, 8, 13, 21...), whose successive ratios converge toward the Golden Ratio φ.", -1.15, "prism"),
        q("geo_golden_spiral", "Nested Square Tiling · Plate GM-02",
          11, "logic_pure_applied_math", "logic_exponents_series", "Number Theory, Primes & Modular Math", "Exponents, Roots & Finite Series",
          "vis_gm_golden_phi",
          "What exact algebraic expression equals the limiting aspect ratio (~1.618034) of the expanding spiral blueprint shown here, commonly denoted by the Greek letter φ (phi)?",
          "(1 + √5) / 2", ("(1 + √3) / 2", "π / 2", "e / √2"),
          ("It is the unique positive root of the quadratic equation x² - x - 1 = 0.", "Remarkably, squaring φ simply adds 1 (φ² = φ + 1), while taking 1/φ simply subtracts 1."),
          "Solving φ = 1 + 1/φ yields φ² - φ - 1 = 0, whose positive root is the Golden Ratio φ = (1 + √5) / 2 ≈ 1.618034.", 0.1, "prism"),
        q("geo_golden_spiral", "Nested Square Tiling · Plate GM-02",
          11, "logic_sequences_patterns", "logic_fibonacci_quadratic_seq", "Sequences, Patterns & Recurrences", "Fibonacci, Quadratic & Doubling Sequences",
          "vis_gm_golden_next",
          "If you attach two more squares clockwise to continue the exact 1, 1, 2, 3, 5, 8, 13 blueprint shown here, what will be the side length of the SECOND new square (after 21)?",
          "34", ("29", "32", "42"),
          ("First compute 8 + 13 = 21.", "Then add the two largest squares: 13 + 21."),
          "Continuing the Fibonacci tiling adds 8 + 13 = 21, followed immediately by 13 + 21 = 34.", -0.7, "prism"),

        # 38. Seven Bridges of Königsberg (3 Qs)
        q("geo_konigsberg", "Multigraph Topology · Plate GM-03",
          11, "logic_puzzles_cryptography", "logic_mathematicians", "Ciphers, Number Bases & Mathematicians", "Great Mathematicians, Logicians & Cryptographers",
          "vis_gm_konig_euler",
          "Examine this 1736 river-and-islands blueprint (7 bridges connecting 4 landmasses, abstracted into a 4-vertex graph of odd degrees 3, 3, 3, 5). Which Swiss mathematician solved it and founded graph theory?",
          "Leonhard Euler", ("Carl Friedrich Gauss", "Pierre de Fermat", "Blaise Pascal"),
          ("Born in Basel, he also gave mathematics the symbols e, i, f(x), and Σ.", "He proved no walk can cross all seven bridges exactly once because more than two vertices have odd degree."),
          "In 1736, Leonhard Euler abstracted the Seven Bridges of Königsberg into vertices and edges — inventing graph theory and topology in one stroke.", -0.75, "prism", ["CH", "RU", "GLOBAL"]),
        q("geo_konigsberg", "Multigraph Topology · Plate GM-03",
          11, "logic_combinatorics_prob", "logic_perms_combs_sets", "Combinatorics, Set Theory & Probability", "Permutations, Combinations, Handshakes & Sets",
          "vis_gm_konig_rule",
          "Look at the vertex degrees (3, 3, 3, 5) on the right side of this 1736 multigraph blueprint. What is the MAXIMUM number of odd-degree vertices a connected graph can have and still permit a walk crossing every edge once?",
          "Two", ("One", "Three", "Four"),
          ("Every intermediate vertex you enter must also be exited, consuming edges in pairs (even degree).", "Only the start and finish vertices may have an odd number of bridges attached."),
          "An Eulerian trail traversing every edge exactly once exists if and only if the connected graph has either 0 (closed circuit) or 2 (open trail) vertices of odd degree — never 4!", 0.2, "prism"),
        q("geo_konigsberg", "Multigraph Topology · Plate GM-03",
          2, "geo_world_cities", "geo_cities_europe_americas", "World Cities & Urban Centers", "Cities of Europe & Latin America",
          "vis_gm_konig_city",
          "The historic Prussian city on the Pregel River whose seven bridges inspired this 1736 mathematical breakthrough is today which Baltic Russian exclave city?",
          "Kaliningrad", ("Gdańsk", "Riga", "Tallinn"),
          ("Wedged between Poland and Lithuania along the Baltic Sea, it was renamed in 1946 after World War II.", "Philosopher Immanuel Kant also spent his entire life in this city."),
          "Historic Königsberg — setting of Euler's Seven Bridges problem and home of Immanuel Kant — became the Russian Baltic exclave of Kaliningrad after 1945.", 0.3, "globe", ["RU", "GLOBAL"]),

        # 39. Möbius Strip (3 Qs)
        q("geo_mobius_strip", "Non-Orientable Surface · Plate GM-04",
          11, "logic_geometry_spatial", "logic_geometry_algebra", "Geometry, Polygons & 3D Solids", "Polygons, Triangles & 3D Surface/Volume",
          "vis_gm_mobius_id",
          "Inspect this 3D topological surface created by giving a paper ribbon a single 180° half-twist before joining its ends, yielding just ONE continuous side and ONE boundary edge. What is it called?",
          "Möbius strip", ("Klein bottle", "Torus knot", "Trefoil ribbon"),
          ("Independently discovered in 1858 by German mathematicians August Ferdinand Möbius and Johann Benedict Listing.", "M.C. Escher immortalized it in his 1963 woodcut showing red ants marching endlessly across both apparent faces."),
          "A Möbius strip is the simplest non-orientable two-dimensional manifold: tracing its dashed centerline returns to the starting point after covering both apparent surfaces.", -1.1, "prism"),
        q("geo_mobius_strip", "Non-Orientable Surface · Plate GM-04",
          11, "logic_geometry_spatial", "logic_geometry_algebra", "Geometry, Polygons & 3D Solids", "Polygons, Triangles & 3D Surface/Volume",
          "vis_gm_mobius_cut",
          "If you take scissors and cut completely around the dashed cyan centerline of the half-twisted band mapped in this blueprint, what surprising result do you get?",
          "One single loop twice as long with two full twists", ("Two separate identical half-twisted loops", "Two linked untwisted circular rings", "Three disconnected short strips"),
          ("Because the original band has only one continuous boundary edge, cutting down the center cannot split it into two pieces!", "The resulting longer band is now two-sided (orientable) with four half-twists."),
          "Cutting a Möbius strip straight down its centerline produces one continuous two-sided loop twice the original length with two full 360° twists.", 0.15, "prism"),

        # 40. Half-Adder Digital Logic Gate (2 Qs)
        q("geo_logic_gates", "Combinational Schematic · Plate GM-05",
          6, "tech_computing_software", "tech_software_os", "Computing, Software & Protocols", "Operating Systems, Languages & Browsers",
          "vis_tc_halfadder_id",
          "Inspect this two-input digital logic schematic and truth table (1 + 1 → C=1, S=0) pairing an upper XOR gate with a lower AND gate. What foundational CPU building block is wired here?",
          "Half adder", ("Multiplexer", "SR flip-flop", "Ring counter"),
          ("It computes the binary sum (S) and carry-out (C) of two single bits, but has no carry-in input.", "Chaining two of these plus an OR gate produces a 'full' version used inside every ALU."),
          "A binary half adder pairs an XOR gate (Sum bit) and an AND gate (Carry bit) to perform single-bit addition inside digital arithmetic logic units.", 0.1, "gear"),
        q("geo_logic_gates", "Combinational Schematic · Plate GM-05",
          6, "tech_computing_software", "tech_software_os", "Computing, Software & Protocols", "Operating Systems, Languages & Browsers",
          "vis_tc_halfadder_xor",
          "Look at the top curved-back logic gate producing output S (high ONLY when A and B differ: 01→1, 10→1, 11→0). Which Boolean logic gate is drawn there?",
          "XOR gate", ("NAND gate", "NOR gate", "AND gate"),
          ("Its three-letter name stands for 'Exclusive OR'.", "Notice the distinctive twin curved input arc on the left side of its IEEE schematic symbol."),
          "An XOR (Exclusive-OR) gate outputs 1 whenever its two inputs differ and 0 when they match — exact modulo-2 binary addition for the Sum bit.", -0.35, "gear"),

        # --- 4 MUSIC, COMPUTING & HOROLOGY PLATES (10 Qs) ---
        # 41. Treble Clef & C Major Triad (3 Qs)
        q("music_treble_chords", "Harmonic Staff Blueprint · Plate MU-01",
          4, "pop_music_recording", "pop_songs", "Music, Albums, Songs & Bands", "Iconic Hit Songs & Singles",
          "vis_mu_treble_chord",
          "Read this 5-line treble-clef blueprint (0 sharps, 0 flats): a root note on the first lower ledger line stacked with +4 semitones and +3 semitones above it. Which fundamental musical triad is notated?",
          "C major triad", ("G major triad", "A minor triad", "F major triad"),
          ("Its three notes are Middle C (C4), E4 (first line), and G4 (second line).", "Played exclusively on white piano keys, its intervals form a major third plus a minor third."),
          "With middle C on the ledger line below the treble staff followed by E on line 1 and G on line 2, this plate notates the foundational C major triad (C–E–G).", -0.65, "wave"),
        q("music_treble_chords", "Harmonic Staff Blueprint · Plate MU-01",
          3, "arts_classical_stage", "arts_classical_composers", "Classical Music, Opera & Stage", "Classical Symphonies & Concertos",
          "vis_mu_treble_clef",
          "Look closely at the golden clef spiraling around the second staff line from the bottom (392.0 Hz). Because it evolved from an ornate Gothic letter fixing that pitch, what is its alternate name?",
          "G clef", ("F clef", "C clef", "D clef"),
          ("Standard treble notation places the pitch G4 directly inside the spiral curl on line 2.", "By contrast, the bass clef curls around line 4 and is called the F clef."),
          "The treble clef is formally a G clef — a stylized medieval letter G whose central spiral encircles the second staff line to mark G above middle C (392 Hz).", -0.5, "wave"),
        q("music_treble_chords", "Harmonic Staff Blueprint · Plate MU-01",
          4, "pop_music_recording", "pop_songs", "Music, Albums, Songs & Bands", "Iconic Hit Songs & Singles",
          "vis_mu_treble_p5",
          "Summing the two brackets at the bottom of this staff blueprint (+4 semitones plus +3 semitones = 7 semitones) spans which consonant acoustic interval between root and top note (frequency ratio 3:2)?",
          "Perfect fifth", ("Perfect fourth", "Major sixth", "Minor seventh"),
          ("It is the opening two-note leap of John Williams's Star Wars main theme and 'Twinkle, Twinkle, Little Star'.", "Pythagoras famously praised its pure 3:2 vibrating string ratio."),
          "Seven semitones from C to G form a Perfect Fifth — the most acoustically stable non-octave harmony, vibrating at a clean 3:2 frequency ratio.", -0.1, "wave"),

        # 42. Circle of Fifths (2 Qs)
        q("music_circle_fifths", "Chromatic Wheel · Plate MU-02",
          3, "arts_classical_stage", "arts_classical_composers", "Classical Music, Opera & Stage", "Classical Symphonies & Concertos",
          "vis_mu_fifths_id",
          "Examine this 12-pitch horological wheel stepping clockwise by +7 semitones while adding one sharp per spoke (0, 1♯, 2♯, 3♯... to 6♯/6♭). What fundamental music-theory diagram is plotted?",
          "Circle of Fifths", ("Pythagorean Comma", "Overtone Lattice", "Diatonic Matrix"),
          ("Moving clockwise climbs by perfect fifths (C→G→D→A→E...); moving counter-clockwise climbs by perfect fourths adding flats.", "Johann David Heinichen published its modern circular form in 1728."),
          "The Circle of Fifths organizes all 12 chromatic keys by perfect-fifth steps (+7 semitones clockwise), mapping key signatures, relative minors, and harmonic closeness.", -0.85, "wave"),
        q("music_circle_fifths", "Chromatic Wheel · Plate MU-02",
          3, "arts_classical_stage", "arts_classical_composers", "Classical Music, Opera & Stage", "Classical Symphonies & Concertos",
          "vis_mu_fifths_key",
          "Starting at 12 o'clock (key of C, 0 sharps) and stepping THREE spokes clockwise on this +7-semitone harmonic wheel lands on which sharp-side diatonic scale (F♯, C♯, G♯)?",
          "A major", ("D major", "E major", "G major"),
          ("Step 1 clockwise is G (1♯); step 2 clockwise is D (2♯).", "Step 3 climbs another perfect fifth above D."),
          "Stepping three perfect fifths clockwise from C (C → G → D → A) reaches A major, whose key signature holds three sharps: F♯, C♯, and G♯.", 0.25, "wave"),

        # 43. Von Neumann Computer Architecture (3 Qs)
        q("tech_von_neumann", "Stored-Program Block Diagram · Plate TC-01",
          6, "tech_computing_software", "tech_software_os", "Computing, Software & Protocols", "Operating Systems, Languages & Browsers",
          "vis_tc_vonn_id",
          "Study this 1945 computer blueprint uniting a Control Unit and ALU across a single shared bus to one unified memory storing BOTH program code and working data. After which polymath is this architecture named?",
          "John von Neumann", ("Alan Turing", "Claude Shannon", "Grace Hopper"),
          ("He synthesized the design in his landmark June 1945 'First Draft of a Report on the EDVAC'.", "Unlike the Harvard architecture's separate instruction/data pathways, its single shared pathway creates a famous throughput 'bottleneck'."),
          "John von Neumann's 1945 EDVAC report codified the stored-program computer architecture — holding instructions and data in unified memory behind a single shared bus.", -0.55, "gear"),
        q("tech_von_neumann", "Stored-Program Block Diagram · Plate TC-01",
          6, "tech_computing_software", "tech_software_os", "Computing, Software & Protocols", "Operating Systems, Languages & Browsers",
          "vis_tc_vonn_harvard",
          "What competing computer architecture eliminates the cyan 'SHARED BUS' bottleneck shown here by giving program instructions and working data two physically separate memories and buses?",
          "Harvard architecture", ("RISC-V pipeline", "Boolean bus", "Babbage engine"),
          ("Named after the 1944 Mark I relay computer built at an Ivy League university in Massachusetts.", "Modern CPUs blend both designs by using separate L1 instruction and L1 data caches inside the chip."),
          "Harvard architecture separates instruction and data memory onto independent buses so a processor can fetch the next instruction and read/write data simultaneously.", 0.35, "gear"),

        # 44. Swiss Lever Watch Escapement (2 Qs)
        q("craft_watch_escapement", "Horological Calibre Plate · Plate HR-01",
          9, "food_heritage_brands", "food_luxury_brands", "Heritage Houses, Horology & Luxury Brands", "Horology, Fashion Houses & Heritage Brands",
          "vis_hr_escape_id",
          "Inspect this 28,800 vph horological blueprint showing a 15-tooth impulse wheel engaging a jeweled anchor pallet fork that meters energy to an oscillating balance wheel and spiral hairspring. Name this mechanism.",
          "Swiss lever escapement", ("Tourbillon cage", "Chronograph column wheel", "Perpetual moonphase cam"),
          ("Its rhythmic locking and unlocking produces the unmistakable mechanical 'tick-tock' heard inside fine wristwatches.", "Invented in early form by Thomas Mudge in 1755 and refined across Geneva and Vallée de Joux."),
          "The Swiss lever escapement links a watch's mainspring gear train to its balance wheel via a ruby-jeweled pallet fork, converting continuous torque into precise isochronous ticks.", -0.15, "gear", ["CH", "GLOBAL"]),
        q("craft_watch_escapement", "Horological Calibre Plate · Plate HR-01",
          9, "food_heritage_brands", "food_luxury_brands", "Heritage Houses, Horology & Luxury Brands", "Horology, Fashion Houses & Heritage Brands",
          "vis_hr_escape_ruby",
          "Why do watchmakers mount synthetic rubies on the locking tips of the cyan pallet fork and pivot bearings in this horological blueprint?",
          "Ultra-low friction and extreme wear resistance against steel", ("Magnetic shielding against compass interference", "Thermal expansion matching brass gear teeth", "Optical refraction to illuminate the dial at night"),
          ("Rubies are corundum (Al₂O₃), rating 9 on the Mohs hardness scale — second only to diamond.", "Using jewel bearings lets a balance pivot oscillate over 250 million times a year with minimal wear."),
          "Synthetic corundum (ruby) pallet stones and pivot jewels drastically cut friction and wear against hardened steel escape teeth over decades of continuous mechanical oscillation.", 0.05, "gear", ["CH", "GLOBAL"]),
    ]


# ============================================================================
# 3D GLOBE PIN-DROP QUESTIONS (170 TOTAL: 40 BASEBALL + 130 MULTI-DOMAIN)
# ============================================================================

# Verified WGS84 decoy anchor pools (guaranteed real world & baseball cities!)
BASEBALL_DECOY_POOL: List[Tuple[str, float, float]] = [
    ("Boston, USA", 42.3467, -71.0972),
    ("Chicago, USA", 41.9484, -87.6553),
    ("New York, USA", 40.8296, -73.9262),
    ("Los Angeles, USA", 34.0739, -118.2400),
    ("San Francisco, USA", 37.7786, -122.3893),
    ("Seattle, USA", 47.5914, -122.3325),
    ("Denver, USA", 39.7559, -104.9942),
    ("Houston, USA", 29.7573, -95.3555),
    ("Miami, USA", 25.7781, -80.2196),
    ("Phoenix, USA", 33.4455, -112.0667),
    ("San Diego, USA", 32.7076, -117.1570),
    ("Toronto, Canada", 43.6414, -79.3894),
    ("Tokyo, Japan", 35.7056, 139.7519),
    ("Osaka, Japan", 34.7212, 135.3616),
    ("Seoul, South Korea", 37.4982, 126.8671),
    ("Santo Domingo, Dom. Rep.", 18.4872, -69.9272),
    ("San Juan, Puerto Rico", 18.4167, -66.0731),
    ("Havana, Cuba", 23.1167, -82.3822),
    ("Mexico City, Mexico", 19.4036, -99.0846),
    ("London, UK", 51.5387, -0.0166),
    ("Caracas, Venezuela", 10.4806, -66.9036),
    ("Taipei, Taiwan", 25.0422, 121.5600),
    ("Sydney, Australia", -33.8474, 151.0634),
]

GLOBAL_DECOY_POOL: List[Tuple[str, float, float]] = [
    ("Geneva, Switzerland", 46.2044, 6.1432),
    ("London, UK", 51.5074, -0.1278),
    ("Paris, France", 48.8566, 2.3522),
    ("Rome, Italy", 41.9028, 12.4964),
    ("Athens, Greece", 37.9838, 23.7275),
    ("Istanbul, Turkey", 41.0082, 28.9784),
    ("Cairo, Egypt", 30.0444, 31.2357),
    ("Nairobi, Kenya", -1.2921, 36.8219),
    ("Cape Town, South Africa", -33.9249, 18.4241),
    ("Marrakech, Morocco", 31.6295, -7.9811),
    ("Addis Ababa, Ethiopia", 9.0054, 38.7636),
    ("Dubai, UAE", 25.2048, 55.2708),
    ("Mumbai, India", 19.0760, 72.8777),
    ("New Delhi, India", 28.6139, 77.2090),
    ("Bangkok, Thailand", 13.7563, 100.5018),
    ("Singapore", 1.3521, 103.8198),
    ("Jakarta, Indonesia", -6.2088, 106.8456),
    ("Beijing, China", 39.9042, 116.4074),
    ("Tokyo, Japan", 35.6762, 139.6503),
    ("Seoul, South Korea", 37.5665, 126.9780),
    ("Sydney, Australia", -33.8688, 151.2093),
    ("Auckland, New Zealand", -36.8485, 174.7633),
    ("Reykjavik, Iceland", 64.1466, -21.9426),
    ("Stockholm, Sweden", 59.3293, 18.0686),
    ("Madrid, Spain", 40.4168, -3.7038),
    ("Lisbon, Portugal", 38.7223, -9.1393),
    ("New York, USA", 40.7128, -74.0060),
    ("San Francisco, USA", 37.7749, -122.4194),
    ("Chicago, USA", 41.8781, -87.6298),
    ("Miami, USA", 25.7617, -80.1918),
    ("Honolulu, USA", 21.3069, -157.8583),
    ("Mexico City, Mexico", 19.4326, -99.1332),
    ("Panama City, Panama", 8.9824, -79.5199),
    ("Lima, Peru", -12.0464, -77.0428),
    ("Rio de Janeiro, Brazil", -22.9068, -43.1729),
    ("Buenos Aires, Argentina", -34.6037, -58.3816),
    ("Santiago, Chile", -33.4489, -70.6693),
    ("Bogotá, Colombia", 4.7110, -74.0721),
    ("Almaty, Kazakhstan", 43.2220, 76.8512),
    ("Irkutsk, Russia", 52.2869, 104.3050),
    ("Toronto, Canada", 43.6532, -79.3832),
    ("Anchorage, USA", 61.2181, -149.9003),
]


def _pick_globe_decoys(
    target_label: str,
    target_lat: float,
    target_lon: float,
    graze_km: float,
    pool_kind: str,
    seed_key: str,
) -> List[Dict[str, Any]]:
    pool = BASEBALL_DECOY_POOL if pool_kind == "baseball" else GLOBAL_DECOY_POOL
    min_dist = graze_km + 280.0
    t_low = target_label.lower()
    t_city = t_low.split(",")[0].strip()

    shuffled = seeded_shuffle(pool, f"DECOY_POOL:{seed_key}")
    chosen: List[Tuple[str, float, float]] = []
    for cand in shuffled:
        lbl, clat, clon = cand
        c_city = lbl.lower().split(",")[0].strip()
        if c_city == t_city or lbl.lower() == t_low:
            continue
        if haversine_km(target_lat, target_lon, clat, clon) < min_dist:
            continue
        if any(haversine_km(clat, clon, p[1], p[2]) < 1200.0 for p in chosen):
            continue
        chosen.append(cand)
        if len(chosen) == 3:
            break

    # Fallback across global pool if a narrow pool ever had <3 matches
    if len(chosen) < 3:
        for cand in seeded_shuffle(GLOBAL_DECOY_POOL, f"DECOY_FALLBACK:{seed_key}"):
            lbl, clat, clon = cand
            c_city = lbl.lower().split(",")[0].strip()
            if c_city == t_city or any(p[0] == lbl for p in chosen):
                continue
            if haversine_km(target_lat, target_lon, clat, clon) < min_dist:
                continue
            if any(haversine_km(clat, clon, p[1], p[2]) < 1000.0 for p in chosen):
                continue
            chosen.append(cand)
            if len(chosen) == 3:
                break

    return [{"label": lbl, "lat": round(clat, 4), "lon": round(clon, 4)} for (lbl, clat, clon) in chosen]


def _globe_q(
    l0: int,
    l1_id: str,
    l2_id: str,
    l1_cat: str,
    l2_sub: str,
    micro: str,
    prompt: str,
    anchor_label: str,
    target_label: str,
    lat: float,
    lon: float,
    region_hint: str,
    why: str,
    irt_b: float,
    pool_kind: str = "global",
    bullseye_km: int = 300,
    gold_km: int = 1000,
    graze_km: int = 2200,
    regions: Optional[List[str]] = None,
    glyph: str = "globe",
) -> Dict[str, Any]:
    lat_hemi = "N" if lat >= 0 else "S"
    lon_hemi = "E" if lon >= 0 else "W"
    coord_hint = f"Approx. {abs(round(lat))}°{lat_hemi}, {abs(round(lon))}°{lon_hemi} · {region_hint}"
    decoys = _pick_globe_decoys(anchor_label, lat, lon, graze_km, pool_kind, micro)
    target_anchor = {"label": anchor_label, "lat": round(lat, 4), "lon": round(lon, 4)}
    quick_anchors = seeded_shuffle([target_anchor] + decoys, f"ANCHOR_ORDER:{micro}")

    return {
        "l0Domain": l0,
        "l1Id": l1_id,
        "l2Id": l2_id,
        "l1Category": l1_cat,
        "l2Subcategory": l2_sub,
        "microTopicId": micro,
        "regions": regions or ["GLOBAL"],
        "narrativeTags": ["ARCHIVE_CORE", "AGORA_CIVIC"],
        "tone": "PRESTIGE",
        "irtB": round(irt_b, 2),
        "irtA": 1.25,
        "freshness": "EVERGREEN",
        "archetype": "GLOBE_PIN_DROP",
        "prompt": prompt,
        "answerCorrect": anchor_label,
        "distractors": [
            {"text": decoys[0]["label"], "plausibility": 0.84},
            {"text": decoys[1]["label"], "plausibility": 0.80},
            {"text": decoys[2]["label"], "plausibility": 0.76},
        ],
        "clues": [region_hint, coord_hint],
        "glyphHint": glyph,
        "whyExplanation": why,
        "globePin": {
            "targetLat": round(lat, 4),
            "targetLon": round(lon, 4),
            "targetLabel": target_label,
            "bullseyeKm": bullseye_km,
            "goldKm": gold_km,
            "grazeKm": graze_km,
            "regionHint": region_hint,
            "coordHint": coord_hint,
            "quickAnchors": quick_anchors,
        },
    }


def build_baseball_globe_questions() -> List[Dict[str, Any]]:
    bg = lambda micro, pr, albl, tlbl, lat, lon, reg_h, why, irt, regs=None: _globe_q(
        5, "sports", "sports_baseball", "Sports", "Baseball",
        micro, pr, albl, tlbl, lat, lon, reg_h, why, irt,
        pool_kind="baseball", bullseye_km=280, gold_km=950, graze_km=2100,
        regions=regs or ["US", "GLOBAL"], glyph="globe",
    )
    return [
        bg("globe_bb_fenway", "Drop your pin on the Atlantic seaport home of Fenway Park, MLB's oldest active stadium (opened 1912) and home of the 37-foot Green Monster.",
           "Boston, USA", "Fenway Park · Boston, USA", 42.3467, -71.0972,
           "New England Atlantic seaboard, northeastern United States",
           "Fenway Park opened on April 20, 1912 near Kenmore Square in Boston, Massachusetts (42.35°N, 71.10°W).", -1.0),
        bg("globe_bb_wrigley", "Pin the Great Lakes metropolis hosting Wrigley Field, the 1914 ivy-walled jewel box of baseball's North Side.",
           "Chicago, USA", "Wrigley Field · Chicago, USA", 41.9484, -87.6553,
           "Southwestern shore of Lake Michigan, American Midwest",
           "Wrigley Field has anchored Chicago's Lakeview neighborhood since 1914 (41.95°N, 87.66°W).", -1.0),
        bg("globe_bb_yankee", "Locate the metropolis whose Bronx borough hosts Yankee Stadium, cathedral of 27 World Series titles and Monument Park.",
           "New York, USA", "Yankee Stadium · Bronx, USA", 40.8296, -73.9262,
           "Mid-Atlantic mouth of the Hudson River, northeastern U.S.",
           "Yankee Stadium sits along East 161st Street in the Bronx, New York City (40.83°N, 73.93°W).", -1.1),
        bg("globe_bb_dodger", "Drop your pin on the Southern California city where Dodger Stadium sits terraced into scenic Chavez Ravine.",
           "Los Angeles, USA", "Dodger Stadium · Los Angeles, USA", 34.0739, -118.2400,
           "Pacific coastal basin of Southern California",
           "Opened in 1962 in Chavez Ravine, Dodger Stadium overlooks downtown Los Angeles (34.07°N, 118.24°W).", -1.05),
        bg("globe_bb_oracle", "Pin the Pacific bayfront city where Oracle Park overlooks McCovey Cove and kayakers chase 'Splash Hit' home runs.",
           "San Francisco, USA", "Oracle Park · San Francisco, USA", 37.7786, -122.3893,
           "Northern California peninsula bordering a famous tidal bay",
           "Oracle Park opened in 2000 along San Francisco's China Basin waterfront (37.78°N, 122.39°W).", -0.9),
        bg("globe_bb_cooperstown", "Pin the upstate village on Otsego Lake that houses the National Baseball Hall of Fame and Museum (dedicated 1939).",
           "Cooperstown, USA", "Baseball Hall of Fame · Cooperstown, USA", 42.7000, -74.9233,
           "Central upstate highlands of the Empire State, northeastern U.S.",
           "Dedicated on June 12, 1939, the National Baseball Hall of Fame stands on Main Street in Cooperstown, New York (42.70°N, 74.92°W).", -0.65),
        bg("globe_bb_camden", "Locate the Chesapeake harbor city whose Oriole Park at Camden Yards launched the 1992 retro-classic ballpark renaissance beside its brick B&O Warehouse.",
           "Baltimore, USA", "Camden Yards · Baltimore, USA", 39.2838, -76.6217,
           "Upper Chesapeake Bay harbor, Mid-Atlantic U.S.",
           "Oriole Park at Camden Yards sits blocks from Baltimore's Inner Harbor in Maryland (39.28°N, 76.62°W).", -0.7),
        bg("globe_bb_coors", "Pin the mile-high Rocky Mountain capital where thin air at Coors Field forced Major League Baseball to introduce a humidor in 2002.",
           "Denver, USA", "Coors Field · Denver, USA", 39.7559, -104.9942,
           "Front Range high plains of the Rocky Mountains",
           "Standing 5,200 feet above sea level in downtown Denver, Coors Field is MLB's highest-altitude ballpark (39.76°N, 104.99°W).", -0.85),
        bg("globe_bb_kauffman", "Drop your pin on the Missouri River crossroads home to Kauffman Stadium's 322-foot sweeping outfield water fountains.",
           "Kansas City, USA", "Kauffman Stadium · Kansas City, USA", 39.0517, -94.4803,
           "Heartland plains on the Missouri-Kansas border",
           "Kauffman Stadium shares the Truman Sports Complex in Kansas City, Missouri (39.05°N, 94.48°W).", -0.55),
        bg("globe_bb_busch", "Pin the Mississippi River city where Busch Stadium frames the 630-foot Gateway Arch directly beyond center field.",
           "St. Louis, USA", "Busch Stadium · St. Louis, USA", 38.6226, -90.1928,
           "Confluence of the Mississippi and Missouri Rivers, U.S. Midwest",
           "Busch Stadium anchors downtown St. Louis, Missouri right beside the Gateway Arch (38.62°N, 90.19°W).", -0.75),
        bg("globe_bb_pnc", "Locate the three-rivers steel city where PNC Park overlooks the bright-yellow Roberto Clemente suspension bridge.",
           "Pittsburgh, USA", "PNC Park · Pittsburgh, USA", 40.4469, -80.0057,
           "Appalachian plateau where Allegheny and Monongahela meet",
           "PNC Park sits on Pittsburgh's North Shore across the Allegheny River from downtown (40.45°N, 80.01°W).", -0.65),
        bg("globe_bb_tmobile", "Pin the Pacific Northwest seaport hosting T-Mobile Park, where Ichiro Suzuki starred beneath a sliding umbrella-style retractable roof.",
           "Seattle, USA", "T-Mobile Park · Seattle, USA", 47.5914, -122.3325,
           "Puget Sound deep-water port, Pacific Northwest U.S.",
           "T-Mobile Park (opened 1999 as Safeco Field) stands in Seattle's SoDo district overlooking Puget Sound (47.59°N, 122.33°W).", -0.85),
        bg("globe_bb_rogers", "Drop your pin on the Lake Ontario metropolis hosting Rogers Centre — MLB's sole active ballpark outside the United States.",
           "Toronto, Canada", "Rogers Centre · Toronto, Canada", 43.6414, -79.3894,
           "Northwestern shore of Lake Ontario, southern Ontario",
           "Rogers Centre (formerly SkyDome) sits beneath the CN Tower in downtown Toronto, Canada (43.64°N, 79.39°W).", -0.95, ["CA", "GLOBAL"]),
        bg("globe_bb_petco", "Locate the sunny Pacific border city where Petco Park incorporates the 1909 Western Metal Supply brick building directly as its left-field foul pole.",
           "San Diego, USA", "Petco Park · San Diego, USA", 32.7076, -117.1570,
           "Far southwestern Pacific coast of California near Baja",
           "Petco Park opened in 2004 in downtown San Diego's East Village near the Gaslamp Quarter (32.71°N, 117.16°W).", -0.7),
        bg("globe_bb_chase", "Pin the Sonoran Desert capital where Chase Field pairs an air-conditioned retractable roof with a swimming pool deck beyond right-center field.",
           "Phoenix, USA", "Chase Field · Phoenix, USA", 33.4455, -112.0667,
           "Sonoran Desert Salt River Valley, U.S. Southwest",
           "Chase Field opened in 1998 in downtown Phoenix, Arizona (33.45°N, 112.07°W).", -0.7),
        bg("globe_bb_houston", "Drop your pin on the Gulf Coast space-flight metropolis whose 1965 Astrodome pioneered indoor major-league baseball and whose downtown ballpark features a vintage train track above left field.",
           "Houston, USA", "Daikin Park · Houston, USA", 29.7573, -95.3555,
           "Upper Texas Gulf Coast plain, south-central U.S.",
           "Houston hosted baseball's first domed stadium (Astrodome, 1965) and its downtown Union Station ballpark (29.76°N, 95.36°W).", -0.8),
        bg("globe_bb_arlington", "Locate the North Texas metroplex city where Globe Life Field hosted both the neutral-site 2020 World Series and the Rangers' 2023 title run.",
           "Arlington, USA", "Globe Life Field · Arlington, USA", 32.7473, -97.0847,
           "North-central Texas metroplex between Dallas and Fort Worth",
           "Globe Life Field opened in 2020 in Arlington, Texas, midway between Dallas and Fort Worth (32.75°N, 97.08°W).", -0.3),
        bg("globe_bb_atlanta", "Pin the Peach State capital metro where Hank Aaron hit career home run 715 in 1974 and the Braves won the 1995 and 2021 World Series.",
           "Atlanta, USA", "Truist Park · Atlanta Metro, USA", 33.8907, -84.4677,
           "Piedmont foothills of the southeastern United States",
           "Atlanta hosted Hank Aaron's historic 715th home run and remains home to the Braves at Truist Park (33.89°N, 84.47°W).", -0.75),
        bg("globe_bb_miami", "Drop your pin on the subtropical Atlantic gateway city where LoanDepot Park hosted Shohei Ohtani's iconic 2023 World Baseball Classic championship strikeout.",
           "Miami, USA", "LoanDepot Park · Miami, USA", 25.7781, -80.2196,
           "Southeastern tip of the Florida peninsula on Biscayne Bay",
           "Standing on the former Orange Bowl site in Little Havana, Miami's LoanDepot Park staged the dramatic 2023 WBC final (25.78°N, 80.22°W).", -0.8),
        bg("globe_bb_philly", "Locate the birthplace of the U.S. Constitution where Citizens Bank Park rings a giant illuminated Liberty Bell after every Phillies home run.",
           "Philadelphia, USA", "Citizens Bank Park · Philadelphia, USA", 39.9061, -75.1665,
           "Delaware River valley, Mid-Atlantic northeastern U.S.",
           "Citizens Bank Park opened in 2004 in South Philadelphia's sports complex (39.91°N, 75.17°W).", -0.75),
        bg("globe_bb_detroit", "Pin the Motor City on the Great Lakes corridor where Ty Cobb, Al Kaline, and Miguel Cabrera starred at Tiger Stadium and Comerica Park.",
           "Detroit, USA", "Comerica Park · Detroit, USA", 42.3390, -83.0485,
           "Strait connecting Lake St. Clair and Lake Erie, upper Midwest",
           "Comerica Park anchors downtown Detroit across the river from Windsor, Ontario (42.34°N, 83.05°W).", -0.7),
        bg("globe_bb_minneapolis", "Drop your pin on the Twin Cities Mississippi headwaters metropolis where Target Field brought outdoor baseball back to Minnesota in 2010.",
           "Minneapolis, USA", "Target Field · Minneapolis, USA", 44.9817, -93.2776,
           "Upper Mississippi River valley, northern U.S. Midwest",
           "Target Field sits in Minneapolis's North Loop, constructed of native Kasota limestone (44.98°N, 93.28°W).", -0.55),
        bg("globe_bb_cleveland", "Locate the Lake Erie port city where Progressive Field hosted the dramatic 1995, 1997, and 2016 World Series runs.",
           "Cleveland, USA", "Progressive Field · Cleveland, USA", 41.4962, -81.6852,
           "Southern shore of Lake Erie at the Cuyahoga River mouth",
           "Progressive Field (formerly Jacobs Field) anchors downtown Cleveland, Ohio (41.50°N, 81.69°W).", -0.5),
        bg("globe_bb_cincinnati", "Pin the Ohio River city where the 1869 Red Stockings became baseball's first openly all-professional team and Great American Ball Park stands today.",
           "Cincinnati, USA", "Great American Ball Park · Cincinnati, USA", 39.0979, -84.5082,
           "Ohio River bend on the Ohio-Kentucky border",
           "Great American Ball Park sits directly on the Ohio Riverfront in Cincinnati, birthplace of pro baseball in 1869 (39.10°N, 84.51°W).", -0.4),
        bg("globe_bb_milwaukee", "Drop your pin on the Lake Michigan brewing capital where American Family Field sports a fan-shaped retractable roof and Bernie Brewer's home-run slide.",
           "Milwaukee, USA", "American Family Field · Milwaukee, USA", 43.0280, -87.9712,
           "Western shore of Lake Michigan, upper Midwest U.S.",
           "American Family Field (opened 2001 as Miller Park) features North America's sole fan-shaped convertible roof in Milwaukee (43.03°N, 87.97°W).", -0.45),
        bg("globe_bb_dc", "Locate the U.S. national capital whose Nationals Park hosted the franchise's 2019 World Series title run along the Anacostia River.",
           "Washington, D.C., USA", "Nationals Park · Washington, D.C.", 38.8730, -77.0074,
           "Potomac and Anacostia confluence, Mid-Atlantic U.S.",
           "Nationals Park opened in 2008 in Washington, D.C.'s Navy Yard neighborhood as MLB's first LEED Silver green ballpark (38.87°N, 77.01°W).", -0.85),
        bg("globe_bb_citi", "Pin the Atlantic metropolis whose Flushing Meadows ballpark — Citi Field — raises a giant Home Run Apple after every home-team homer.",
           "Queens, New York, USA", "Citi Field · Queens, USA", 40.7571, -73.8458,
           "Flushing Meadows on western Long Island, Mid-Atlantic U.S.",
           "Citi Field sits in Flushing Meadows-Corona Park in Queens, New York City (40.76°N, 73.85°W).", -0.8),
        bg("globe_bb_anaheim", "Drop your pin on the Orange County city where Angel Stadium's towering 'Big A' marquee watched Mike Trout and Shohei Ohtani star side by side.",
           "Anaheim, USA", "Angel Stadium · Anaheim, USA", 33.8003, -117.8827,
           "Orange County basin south of Los Angeles, Southern California",
           "Opened in 1966, Angel Stadium of Anaheim is MLB's fourth-oldest active ballpark (33.80°N, 117.88°W).", -0.5),
        bg("globe_bb_nlbm", "Locate the historic jazz-and-barbecue heartland city whose 18th & Vine district houses the Negro Leagues Baseball Museum (founded 1990).",
           "Kansas City, USA", "Negro Leagues Museum · Kansas City, USA", 39.0962, -94.5628,
           "Western edge of Missouri along the Missouri River",
           "Founded in 1990 near the Paseo YMCA where Rube Foster organized the Negro National League in 1920, the museum anchors Kansas City's 18th & Vine district.", -0.15),
        bg("globe_bb_williamsport", "Pin the Appalachian Susquehanna Valley town that has hosted the Little League World Series since 1947 at Howard J. Lamade Stadium.",
           "Williamsport, USA", "Little League World Series · Williamsport, USA", 41.2292, -77.0005,
           "North-central Susquehanna River valley, Mid-Atlantic U.S.",
           "Carl Stotz founded Little League Baseball in Williamsport, Pennsylvania in 1939, and South Williamsport hosts the Little League World Series every August.", -0.1),
        bg("globe_bb_dyersville", "Drop your pin on the Midwestern cornfield town where Kevin Costner's 1989 film Field of Dreams was shot — and where MLB staged its dramatic 2021 walk-off game.",
           "Dyersville, USA", "Field of Dreams · Dyersville, USA", 42.4981, -91.0558,
           "Eastern tallgrass prairie near the upper Mississippi River",
           "Located outside Dyersville, Iowa (42.50°N, 91.06°W), the Field of Dreams ballpark hosted MLB's inaugural cornfield showcase between the White Sox and Yankees in 2021.", 0.1),
        bg("globe_bb_rickwood", "Locate the Deep South steel city home to Rickwood Field (opened 1910), America's oldest surviving pro ballpark and historic home of the Black Barons where Willie Mays debuted.",
           "Birmingham, USA", "Rickwood Field · Birmingham, USA", 33.5022, -86.8554,
           "Southern Appalachian foothills of the Deep South",
           "Opened in August 1910 in Birmingham, Alabama, Rickwood Field hosted MLB's 2024 Negro Leagues tribute game honoring Willie Mays and the Birmingham Black Barons.", 0.25),
        bg("globe_bb_louisville", "Pin the Ohio River city where Hillerich & Bradsby has turned iconic white-ash and maple 'Slugger' baseball bats since 1884 beneath a 120-foot steel bat leaning outside.",
           "Louisville, USA", "Slugger Factory · Louisville, USA", 38.2570, -85.7640,
           "Falls of the Ohio River, upper South / lower Midwest U.S.",
           "Since 1884, Hillerich & Bradsby has crafted official Louisville Slugger bats in downtown Louisville, Kentucky (38.26°N, 85.76°W).", -0.4),
        bg("globe_bb_tokyo_dome", "Drop your pin on the East Asian megacity whose iconic air-supported 'Big Egg' dome hosts the Yomiuri Giants and MLB Opening Series.",
           "Tokyo, Japan", "Tokyo Dome · Tokyo, Japan", 35.7056, 139.7519,
           "Kanto Plain along Honshu's Pacific coast, East Asia",
           "Opened in 1988 in Bunkyo Ward, Tokyo Dome is Japan's premier indoor baseball cathedral (35.71°N, 139.75°E).", -1.0, ["JP", "GLOBAL"]),
        bg("globe_bb_koshien", "Pin the Kansai metropolitan bay near Osaka where 1924 Hanshin Koshien Stadium stages a beloved annual high-school summer baseball pilgrimage.",
           "Nishinomiya, Japan", "Koshien Stadium · Kansai, Japan", 34.7212, 135.3616,
           "Osaka Bay coast of western Honshu, East Asia",
           "Opened in 1924 in Nishinomiya between Osaka and Kobe, Hanshin Koshien Stadium is Japan's revered cathedral of pro and high school baseball (34.72°N, 135.36°E).", 0.35, ["JP", "GLOBAL"]),
        bg("globe_bb_santo_domingo", "Locate the Caribbean capital where Estadio Quisqueya Juan Marichal fuels winter-league baseball in the nation producing the most international MLB All-Stars.",
           "Santo Domingo, Dom. Rep.", "Estadio Quisqueya · Santo Domingo", 18.4872, -69.9272,
           "Southern coast of Hispaniola in the Greater Antilles, Caribbean",
           "Shared by rivals Tigres del Licey and Leones del Escogido, Estadio Quisqueya anchors baseball passion in Santo Domingo, Dominican Republic (18.49°N, 69.93°W).", -0.25, ["DO", "GLOBAL"]),
        bg("globe_bb_san_juan", "Drop your pin on the Caribbean capital whose Estadio Hiram Bithorn hosted Montreal Expos home games and multiple World Baseball Classic rounds.",
           "San Juan, Puerto Rico", "Estadio Hiram Bithorn · San Juan", 18.4167, -66.0731,
           "Eastern Greater Antilles island between Atlantic and Caribbean",
           "Named for the first Puerto Rican MLB player, Estadio Hiram Bithorn opened in 1962 in San Juan, Puerto Rico (18.42°N, 66.07°W).", -0.2, ["PR", "GLOBAL"]),
        bg("globe_bb_havana", "Pin the historic Caribbean harbor capital where 55,000-seat Estadio Latinoamericano hosted the Baltimore Orioles in 1999 and Tampa Bay Rays in 2016.",
           "Havana, Cuba", "Estadio Latinoamericano · Havana, Cuba", 23.1167, -82.3822,
           "Northwestern coast of the largest Caribbean island",
           "Opened in 1946 in Havana's Cerro neighborhood, Estadio Latinoamericano is the historic temple of Cuban baseball (23.12°N, 82.38°W).", -0.35, ["CU", "GLOBAL"]),
        bg("globe_bb_seoul", "Locate the East Asian capital where Gocheok Sky Dome staged Major League Baseball's inaugural 2024 regular-season opening series between the Dodgers and Padres.",
           "Seoul, South Korea", "Gocheok Sky Dome · Seoul, South Korea", 37.4982, 126.8671,
           "Han River basin on the western peninsula, East Asia",
           "South Korea's only domed ballpark, Gocheok Sky Dome in Seoul hosted the 2024 MLB Seoul Series (37.50°N, 126.87°E).", -0.65, ["KR", "GLOBAL"]),
        bg("globe_bb_mexicocity", "Drop your pin on the 7,350-foot-high volcanic valley capital where Estadio Alfredo Harp Helú hosts MLB's highest-altitude regular-season games.",
           "Mexico City, Mexico", "Estadio Alfredo Harp Helú · Mexico City", 19.4036, -99.0846,
           "High central volcanic plateau of Mesoamerica",
           "Sitting 2,240 meters (7,350 ft) above sea level in Mexico City, Estadio Alfredo Harp Helú makes Coors Field feel low-altitude (19.40°N, 99.08°W).", -0.6, ["MX", "GLOBAL"]),
    ]


def build_multidomain_globe_questions() -> List[Dict[str, Any]]:
    g = _globe_q
    return [
        # --- DOMAIN 0: WORLD HISTORY (16 Qs) ---
        g(0, "hist_military", "hist_napoleonic_early_modern", "Military History & Conflicts", "Napoleonic & Revolutionary Wars",
          "globe_hist_waterloo", "Drop your pin on the 1815 European battlefield just south of Brussels where Wellington and Blücher ended Napoleon's Hundred Days forever.",
          "Waterloo, Belgium", "Battle of Waterloo · Belgium", 50.6800, 4.4120,
          "Low Countries plain in Western Europe",
          "Fought on June 18, 1815 in present-day Belgium (50.68°N, 4.41°E), the Battle of Waterloo sealed Napoleon Bonaparte's final defeat.", -0.8, regions=["BE", "GLOBAL"], glyph="crown"),
        g(0, "hist_treaties_eras", "hist_archaeology_ruins", "Treaties, Archaeology & Turning Points", "Archaeological Sites & Ancient Ruins",
          "globe_hist_pompeii", "Pin the Bay of Naples archaeological site buried beneath meters of volcanic ash when Mount Vesuvius erupted in 79 CE.",
          "Pompeii, Italy", "Pompeii · Campania, Italy", 40.7509, 14.4869,
          "Tyrrhenian coast of southern Italian peninsula",
          "Mount Vesuvius entombed Roman Pompeii in 79 CE along southern Italy's Campania coast (40.75°N, 14.49°E).", -1.0, regions=["IT", "GLOBAL"], glyph="column"),
        g(0, "hist_treaties_eras", "hist_archaeology_ruins", "Treaties, Archaeology & Turning Points", "Archaeological Sites & Ancient Ruins",
          "globe_hist_machu_picchu", "Locate the high-altitude 15th-century Inca citadel of Machu Picchu, perched at 2,430 meters above the Urubamba River valley.",
          "Cusco Andes, Peru", "Machu Picchu · Cusco, Peru", -13.1631, -72.5450,
          "Central Andean Cordillera of western South America",
          "Built around 1450 under Inca Emperor Pachacuti, Machu Picchu crowns a steep Andean ridge northwest of Cusco, Peru (13.16°S, 72.55°W).", -1.1, regions=["PE", "GLOBAL"], glyph="column"),
        g(0, "hist_empires", "hist_classical_antiquity", "Empires, Dynasties & Realms", "Ancient Rome, Greece & Egypt",
          "globe_hist_giza", "Pin the desert necropolis on the western bank of the Nile where the Great Pyramid of Khufu and the Great Sphinx have stood for 4,500 years.",
          "Giza Plateau, Egypt", "Great Pyramids · Giza, Egypt", 29.9792, 31.1342,
          "Lower Nile Delta apex, northeastern Africa",
          "The Giza Necropolis sits just southwest of Cairo along the Nile's west bank (29.98°N, 31.13°E).", -1.25, regions=["EG", "GLOBAL"], glyph="column"),
        g(0, "hist_treaties_eras", "hist_archaeology_ruins", "Treaties, Archaeology & Turning Points", "Archaeological Sites & Ancient Ruins",
          "globe_hist_petra", "Drop your pin on the rose-red sandstone canyon city of Petra, caravan capital of the ancient Nabataean Kingdom.",
          "Ma'an, Jordan", "Petra · Rose City, Jordan", 30.3285, 35.4444,
          "Rift valley desert between the Dead Sea and Gulf of Aqaba, Levant",
          "Carved into rose-red cliffs around 300 BCE, Petra lies in southern Jordan (30.33°N, 35.44°E).", -0.75, regions=["JO", "GLOBAL"], glyph="column"),
        g(0, "hist_empires", "hist_asian_islamic_empires", "Empires, Dynasties & Realms", "Imperial Asia & Islamic Caliphates",
          "globe_hist_terracotta", "Locate the historic Silk Road eastern terminus where over 8,000 life-sized Terracotta Warriors guard the tomb of First Emperor Qin Shi Huang.",
          "Xi'an, China", "Terracotta Army · Xi'an, China", 34.3841, 109.2785,
          "Wei River basin in Shaanxi, north-central East Asia",
          "Discovered by farmers in 1974 outside Xi'an (ancient Chang'an), the Terracotta Army dates to c. 210 BCE (34.38°N, 109.28°E).", -0.75, regions=["CN", "GLOBAL"], glyph="crown"),
        g(0, "hist_empires", "hist_asian_islamic_empires", "Empires, Dynasties & Realms", "Imperial Asia & Islamic Caliphates",
          "globe_hist_angkor", "Pin the medieval Khmer temple capital of Angkor Wat, the world's largest religious monument surrounded by a vast rectangular moat.",
          "Siem Reap, Cambodia", "Angkor Wat · Siem Reap, Cambodia", 13.4125, 103.8670,
          "Mekong-Tonlé Sap lowlands of mainland Southeast Asia",
          "Built by King Suryavarman II in the 12th century, Angkor Wat lies near Siem Reap in northwestern Cambodia (13.41°N, 103.87°E).", -0.8, regions=["KH", "GLOBAL"], glyph="column"),
        g(0, "hist_military", "hist_ww2", "Military History & Conflicts", "World War II",
          "globe_hist_normandy", "Drop your pin on the English Channel beaches (Omaha, Utah, Gold, Juno, Sword) where Allied forces launched Operation Overlord on June 6, 1944.",
          "Normandy, France", "D-Day Beaches · Normandy, France", 49.3697, -0.8711,
          "Northern Atlantic Channel coastline of Western Europe",
          "On June 6, 1944, over 150,000 Allied troops stormed the five landing beaches along northern France's Normandy coast (49.37°N, 0.87°W).", -1.0, regions=["FR", "GLOBAL"], glyph="crown"),
        g(0, "hist_military", "hist_american_civil_war", "Military History & Conflicts", "American Civil War & Frontier",
          "globe_hist_gettysburg", "Locate the July 1863 Civil War turning-point battlefield where Abraham Lincoln later delivered his immortal 272-word address.",
          "Gettysburg, USA", "Gettysburg · Pennsylvania, USA", 39.8109, -77.2367,
          "Piedmont rolling hills near the Mason-Dixon line, eastern U.S.",
          "Fought July 1–3, 1863 in Adams County, southern Pennsylvania, Gettysburg marked the high-water mark of the Confederacy (39.81°N, 77.24°W).", -0.85, regions=["US", "GLOBAL"], glyph="crown"),
        g(0, "hist_empires", "hist_asian_islamic_empires", "Empires, Dynasties & Realms", "Imperial Asia & Islamic Caliphates",
          "globe_hist_timbuktu", "Pin the legendary Saharan crossroads on the Niger River bend where Sankore University preserved hundreds of thousands of medieval manuscripts under Mansa Musa.",
          "Timbuktu, Mali", "Timbuktu · Niger Bend, Mali", 16.7666, -3.0026,
          "Southern edge of the Sahara Desert, West Africa",
          "Situated near the northern arc of the Niger River in Mali (16.77°N, 3.00°W), Timbuktu flourished as West Africa's intellectual capital.", -0.3, regions=["ML", "GLOBAL"], glyph="scroll"),
        g(0, "hist_treaties_eras", "hist_archaeology_ruins", "Treaties, Archaeology & Turning Points", "Archaeological Sites & Ancient Ruins",
          "globe_hist_chichen_itza", "Drop your pin on the stepped Maya pyramid of El Castillo (Chichen Itza), where equinox sunlight casts a descending feathered serpent shadow.",
          "Yucatán, Mexico", "Chichen Itza · Yucatán, Mexico", 20.6843, -88.5678,
          "Limestone peninsula separating the Gulf of Mexico and Caribbean",
          "Chichen Itza dominated the northern Yucatán Peninsula from c. 600 to 1200 CE (20.68°N, 88.57°W).", -0.85, regions=["MX", "GLOBAL"], glyph="column"),
        g(0, "hist_military", "hist_ww2", "Military History & Conflicts", "World War II",
          "globe_hist_hiroshima", "Locate the Seto Inland Sea port city where the Genbaku Peace Memorial Dome stands as a solemn UNESCO reminder of August 6, 1945.",
          "Hiroshima, Japan", "Peace Memorial · Hiroshima, Japan", 34.3955, 132.4536,
          "Western Honshu coast along the Seto Inland Sea, East Asia",
          "Located in western Honshu, Japan (34.40°N, 132.45°E), Hiroshima's Peace Memorial Park commemorates the first atomic bombing in history.", -0.9, regions=["JP", "GLOBAL"], glyph="crown"),
        g(0, "hist_treaties_eras", "hist_archaeology_ruins", "Treaties, Archaeology & Turning Points", "Archaeological Sites & Ancient Ruins",
          "globe_hist_great_zimbabwe", "Pin the monumental 11th–15th century mortarless granite stone enclosures whose medieval trading kingdom gave a modern southern African republic its name.",
          "Masvingo, Zimbabwe", "Great Zimbabwe Ruins · Zimbabwe", -20.2674, 30.9338,
          "Highveld plateau between the Zambezi and Limpopo rivers, Southern Africa",
          "Built between the 11th and 15th centuries near modern Masvingo (20.27°S, 30.93°E), Great Zimbabwe was a thriving gold-trading kingdom.", 0.35, regions=["ZW", "GLOBAL"], glyph="column"),
        g(0, "hist_treaties_eras", "hist_diplomatic_treaties", "Treaties, Archaeology & Turning Points", "Peace Treaties & Diplomatic Summits",
          "globe_hist_runnymede", "Drop your pin on the Thames water-meadow just west of London where King John sealed the Magna Carta in June 1215.",
          "Runnymede, UK", "Runnymede · Surrey, England", 51.4447, -0.5639,
          "Thames Valley west of the British capital, southeastern England",
          "On June 15, 1215 at Runnymede in Surrey (51.44°N, 0.56°W), King John affixed the royal seal to Magna Carta, establishing rule of law.", -0.4, regions=["GB", "GLOBAL"], glyph="scroll"),
        g(0, "hist_empires", "hist_classical_antiquity", "Empires, Dynasties & Realms", "Ancient Rome, Greece & Egypt",
          "globe_hist_carthage", "Locate the ancient Phoenician maritime superpower of Carthage — Rome's bitter Punic rival overlooking the central Mediterranean.",
          "Tunis Bay, Tunisia", "Ancient Carthage · Tunisia", 36.8528, 10.3233,
          "Northernmost Maghreb coastline facing Sicily across the Mediterranean",
          "Founded by Phoenicians around 814 BCE beside modern Tunis (36.85°N, 10.32°E), Carthage controlled western Mediterranean trade until 146 BCE.", -0.35, regions=["TN", "GLOBAL"], glyph="crown"),
        g(0, "hist_empires", "hist_asian_islamic_empires", "Empires, Dynasties & Realms", "Imperial Asia & Islamic Caliphates",
          "globe_hist_persepolis", "Pin the ceremonial limestone terrace capital of Persepolis, erected by Darius the Great and Xerxes I as the jewel of the Achaemenid Persian Empire.",
          "Fars Province, Iran", "Persepolis · Fars, Iran", 29.9352, 52.8914,
          "Zagros mountain plateau northeast of Shiraz, Western Asia",
          "Begun around 518 BCE near modern Shiraz in Fars Province, Iran (29.94°N, 52.89°E), Persepolis stood until Alexander the Great burned it in 330 BCE.", 0.15, regions=["IR", "GLOBAL"], glyph="column"),

        # --- DOMAIN 1: SCIENCE & SPACE (14 Qs) ---
        g(1, "sci_physics", "sci_physicists", "Physics & Quantum Mechanics", "Physicists & Astronomers",
          "globe_sci_cern", "Pin the Franco-Swiss border laboratory where the 27-kilometer Large Hadron Collider confirmed the Higgs boson in 2012 and Tim Berners-Lee invented the Web.",
          "Geneva, Switzerland", "CERN LHC · Geneva, Switzerland", 46.2330, 6.0557,
          "Western Lake Léman basin beside the Jura Mountains, Central Europe",
          "CERN straddles the Franco-Swiss border at Meyrin just outside Geneva (46.23°N, 6.06°E).", -0.95, regions=["CH", "GLOBAL"], glyph="atom"),
        g(1, "sci_astronomy_space", "sci_space_missions", "Astronomy, Cosmology & Spaceflight", "Space Missions, Probes & Rockets",
          "globe_sci_ksc", "Drop your pin on Launch Complex 39A on Merritt Island — departure pad for Apollo 11, the Space Shuttle fleet, and Falcon Heavy.",
          "Cape Canaveral, USA", "Kennedy Space Center · Florida, USA", 28.6084, -80.6043,
          "Central Atlantic Space Coast of the Florida peninsula",
          "NASA's Kennedy Space Center launches crewed spacecraft eastward over the Atlantic from Merritt Island, Florida (28.61°N, 80.60°W).", -1.0, regions=["US", "GLOBAL"], glyph="rocket"),
        g(1, "sci_astronomy_space", "sci_space_missions", "Astronomy, Cosmology & Spaceflight", "Space Missions, Probes & Rockets",
          "globe_sci_baikonur", "Locate the Central Asian steppe spaceport from which both Sputnik 1 (1957) and Yuri Gagarin's Vostok 1 (1961) roared into orbit.",
          "Baikonur, Kazakhstan", "Baikonur Cosmodrome · Kazakhstan", 45.9646, 63.3052,
          "Arid steppe east of the Aral Sea, Central Asia",
          "Baikonur Cosmodrome on the Kazakh steppe (45.96°N, 63.31°E) remains the world's oldest and busiest orbital launch facility.", -0.35, regions=["KZ", "GLOBAL"], glyph="rocket"),
        g(1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "globe_sci_alma", "Pin the bone-dry 5,000-meter Chajnantor Plateau where ALMA's 66 radio telescopes imaged the very first supermassive black hole shadow.",
          "Atacama Desert, Chile", "ALMA Observatory · Atacama, Chile", -23.0234, -67.7538,
          "High arid Andean plateau in northern Chile, South America",
          "At 5,058 meters elevation in Chile's hyper-arid Atacama Desert (23.02°S, 67.75°W), ALMA gazes past atmospheric water vapor.", -0.2, regions=["CL", "GLOBAL"], glyph="star"),
        g(1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "globe_sci_maunakea", "Drop your pin on the 4,207-meter dormant Pacific shield volcano whose clear summit hosts the twin Keck, Subaru, and Gemini optical telescopes.",
          "Big Island, Hawaii, USA", "Mauna Kea Observatories · Hawaii", 19.8207, -155.4681,
          "Central North Pacific volcanic archipelago",
          "Mauna Kea on Hawaii's Big Island rises above 40% of Earth's atmosphere, making it one of astronomy's premier observing peaks (19.82°N, 155.47°W).", -0.6, regions=["US", "GLOBAL"], glyph="star"),
        g(1, "sci_astronomy_space", "sci_space_missions", "Astronomy, Cosmology & Spaceflight", "Space Missions, Probes & Rockets",
          "globe_sci_kourou", "Locate Europe's equatorial South American spaceport near 5°N latitude — the launch site of Ariane rockets and the James Webb Space Telescope (2021).",
          "Kourou, French Guiana", "Guiana Space Centre · Kourou", 5.2360, -52.7686,
          "Northeastern Atlantic coast of South America near the Equator",
          "Lying just 5.2° north of the Equator in French Guiana (5.24°N, 52.77°W), Kourou grants Ariane launchers maximum rotational velocity boost.", 0.1, regions=["GF", "FR", "GLOBAL"], glyph="rocket"),
        g(1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "globe_sci_greenwich", "Pin the historic hilltop Royal Observatory where the 0° Prime Meridian line divides Earth's Eastern and Western Hemispheres.",
          "Greenwich, London, UK", "Royal Observatory · 0° Meridian", 51.4769, -0.0005,
          "Thames riverside park in southeastern Britain",
          "Founded in 1675 by King Charles II, the Royal Observatory at Greenwich (51.48°N, 0.00°E) defines Universal Time and 0° longitude.", -1.0, regions=["GB", "GLOBAL"], glyph="compass"),
        g(1, "sci_physics", "sci_mechanics_optics", "Physics & Quantum Mechanics", "Nobel Laureates & Scientific Prizes",
          "globe_sci_iter", "Locate the southern Provence research site where 35 nations are assembling ITER, the world's largest experimental tokamak nuclear fusion reactor.",
          "Cadarache, France", "ITER Fusion Reactor · Provence, France", 43.7069, 5.7768,
          "Durance River valley in Provence, southeastern France",
          "Under construction at Saint-Paul-lès-Durance (Cadarache) in southern France (43.71°N, 5.78°E), ITER aims to demonstrate 500 MW fusion power.", 0.45, regions=["FR", "GLOBAL"], glyph="atom"),
        g(1, "sci_physics", "sci_physicists", "Physics & Quantum Mechanics", "Physicists & Astronomers",
          "globe_sci_ligo", "Drop your pin on the Columbia Basin shrub-steppe housing the northwestern LIGO 4-kilometer laser interferometer that first detected gravitational waves in 2015.",
          "Hanford, Washington, USA", "LIGO Hanford · Washington, USA", 46.4551, -119.4077,
          "Arid Columbia Basin of the U.S. Pacific Northwest",
          "Paired with Livingston, Louisiana, LIGO Hanford in eastern Washington (46.46°N, 119.41°W) measured ripples from colliding black holes in 2015.", 0.4, regions=["US", "GLOBAL"], glyph="wave"),
        g(1, "sci_life_medical", "sci_earth_atmosphere", "Medicine, Genetics & Earth Science", "Earth Science & Geology",
          "globe_sci_chicxulub", "Pin the buried 180-kilometer Chicxulub asteroid impact crater linked to the 66-million-year-old K-Pg extinction of non-avian dinosaurs.",
          "Yucatán Coast, Mexico", "Chicxulub Crater · Yucatán, Mexico", 21.4000, -89.5167,
          "Northwestern tip of the limestone Gulf of Mexico peninsula",
          "Centered near the port of Chicxulub on Mexico's Yucatán coast (21.40°N, 89.52°W), the 10-km impactor triggered global mass extinction.", -0.25, regions=["MX", "GLOBAL"], glyph="globe"),
        g(1, "sci_physics", "sci_physicists", "Physics & Quantum Mechanics", "Physicists & Astronomers",
          "globe_sci_kamiokande", "Locate the East Asian alpine zinc mine holding Super-Kamiokande — a 50,000-ton ultra-pure water tank lined with photomultipliers hunting cosmic neutrinos.",
          "Hida, Gifu, Japan", "Super-Kamiokande · Gifu, Japan", 36.4267, 137.3104,
          "Central alpine range of Honshu, East Asia",
          "Buried 1,000 meters beneath Mount Ikeno in Hida, Gifu (36.43°N, 137.31°E), Super-Kamiokande proved neutrinos have mass (2015 Nobel Prize).", 0.65, regions=["JP", "GLOBAL"], glyph="atom"),
        g(1, "sci_astronomy_space", "sci_stars_galaxies", "Astronomy, Cosmology & Spaceflight", "Stars, Nebulae & Constellations",
          "globe_sci_fast", "Drop your pin on the karst mountain basin cradling FAST ('Tianyan'), Earth's largest filled-aperture 500-meter single-dish radio telescope.",
          "Guizhou, China", "FAST 500m Dish · Guizhou, China", 25.6529, 106.8567,
          "Karst limestone mountains of southwestern China",
          "Completed in 2016 in Pingtang County, Guizhou (25.65°N, 106.86°E), FAST's 500-meter dish has discovered over 900 pulsars.", 0.35, regions=["CN", "GLOBAL"], glyph="star"),
        g(1, "sci_life_medical", "sci_biomedical_pioneers", "Medicine, Genetics & Earth Science", "Medicine & Physiology Pioneers",
          "globe_sci_cavendish", "Pin the storied British university town whose Cavendish Laboratory saw the discovery of the electron, neutron, and DNA's double helix (30 Nobel laureates).",
          "Cambridge, UK", "Cavendish Laboratory · Cambridge, UK", 52.2088, 0.0919,
          "East Anglia river plain north of London, England",
          "Founded in 1874 at the University of Cambridge (52.21°N, 0.09°E), the Cavendish Laboratory birthed modern particle physics and molecular biology.", -0.5, regions=["GB", "GLOBAL"], glyph="dna"),
        g(1, "sci_astronomy_space", "sci_space_missions", "Astronomy, Cosmology & Spaceflight", "Space Missions, Probes & Rockets",
          "globe_sci_sriharikota", "Locate the Bay of Bengal barrier island housing ISRO's Satish Dhawan Space Centre — launchpad for the historic 2023 Chandrayaan-3 lunar south-pole landing.",
          "Sriharikota, India", "Satish Dhawan Space Centre · India", 13.7199, 80.2304,
          "Coromandel Coast north of Chennai on the Bay of Bengal",
          "Positioned on the barrier island of Sriharikota in Andhra Pradesh (13.72°N, 80.23°E), ISRO's spaceport launched Chandrayaan-3 and Mars Orbiter.", 0.2, regions=["IN", "GLOBAL"], glyph="rocket"),

        # --- DOMAIN 2: GEOGRAPHY & NATURAL WONDERS (22 Qs) ---
        g(2, "geo_physical_relief", "geo_high_summits", "Mountains, Volcanoes & Islands", "World Mountains & Summit Elevations",
          "globe_geo_everest", "Pin Earth's highest summit above sea level — Mount Everest (Chomolungma / Sagarmatha), towering 8,848.86 meters along the Himalayan crest.",
          "Khumbu Himalayas, Nepal", "Mount Everest · Nepal / Tibet", 27.9881, 86.9250,
          "Central Himalayan range bordering South Asia and the Tibetan Plateau",
          "Mount Everest straddles the Nepal-Tibet border in the Mahalangur Himal sub-range (27.99°N, 86.93°E).", -1.25),
        g(2, "geo_physical_relief", "geo_high_summits", "Mountains, Volcanoes & Islands", "World Mountains & Summit Elevations",
          "globe_geo_kilimanjaro", "Locate Africa's tallest mountain (5,895 m) — the snow-capped dormant stratovolcano of Mount Kilimanjaro rising above equatorial savannas.",
          "Arusha Highlands, Tanzania", "Mount Kilimanjaro · Tanzania", -3.0674, 37.3556,
          "East African Rift highlands just south of the Kenyan border",
          "Rising freely above the East African plains in northeastern Tanzania (3.07°S, 37.36°E), Kilimanjaro is Earth's tallest freestanding mountain.", -1.05),
        g(2, "geo_physical_relief", "geo_volcanoes", "Mountains, Volcanoes & Islands", "Volcanoes & Tectonic Peaks",
          "globe_geo_fuji", "Drop your pin on the symmetrical 3,776-meter sacred stratovolcano immortalized in Hokusai's Thirty-Six Views woodblock prints.",
          "Mount Fuji, Japan", "Mount Fuji · Honshu, Japan", 35.3606, 138.7274,
          "Central Honshu roughly 100 km southwest of Tokyo Bay",
          "Mount Fuji straddles Yamanashi and Shizuoka Prefectures on Honshu (35.36°N, 138.73°E) and last erupted in 1707.", -1.2, regions=["JP", "GLOBAL"]),
        g(2, "geo_physical_relief", "geo_high_summits", "Mountains, Volcanoes & Islands", "World Mountains & Summit Elevations",
          "globe_geo_matterhorn", "Pin the dramatic 4,478-meter pyramidal Alpine horn immortalized on Toblerone boxes along the Swiss-Italian frontier.",
          "Zermatt Alps, Switzerland", "Matterhorn · Valais, Switzerland", 45.9763, 7.6586,
          "Pennine Alps along the southern Swiss border",
          "Sculpted by four converging glaciers, the Matterhorn guards the border between Valais, Switzerland and Aosta, Italy (45.98°N, 7.66°E).", -0.9, regions=["CH", "IT", "GLOBAL"]),
        g(2, "geo_hydrology", "geo_national_parks", "Rivers, Lakes & National Parks", "National Parks & Biosphere Reserves",
          "globe_geo_grand_canyon", "Locate the 446-kilometer-long, mile-deep chasm carved through two billion years of colored Colorado Plateau rock strata.",
          "Grand Canyon, USA", "Grand Canyon · Arizona, USA", 36.1069, -112.1129,
          "Arid Colorado Plateau of the American Southwest",
          "Carved by the Colorado River across northern Arizona (36.11°N, 112.11°W), the Grand Canyon plunges over 1,800 meters deep.", -1.1, regions=["US", "GLOBAL"]),
        g(2, "geo_hydrology", "geo_major_rivers", "Rivers, Lakes & National Parks", "Major World Rivers & Lengths",
          "globe_geo_victoria_falls", "Drop your pin on Mosi-oa-Tunya ('The Smoke That Thunders') — the 1.7-kilometer-wide curtain of water plunging along the Zambezi River.",
          "Victoria Falls, Zambia", "Victoria Falls · Zambezi Border", -17.9243, 25.8572,
          "Middle Zambezi border between Zambia and Zimbabwe, Southern Africa",
          "Forming the world's largest continuous sheet of falling water, Victoria Falls thunders across the Zambia-Zimbabwe border (17.92°S, 25.86°E).", -0.85),
        g(2, "geo_hydrology", "geo_major_rivers", "Rivers, Lakes & National Parks", "Major World Rivers & Lengths",
          "globe_geo_iguazu", "Pin the subtropical rainforest amphitheater where 275 separate cascades — led by the Devil's Throat — make up the world's largest waterfall system.",
          "Iguazu Falls, Arg./Brazil", "Iguazu Falls · Triple Frontier", -25.6953, -54.4367,
          "Paraná basin triple border of Argentina, Brazil, and Paraguay",
          "Spanning 2.7 km in a horseshoe gorge on the Argentina-Brazil frontier (25.70°S, 54.44°W), Iguazu Falls inspired Eleanor Roosevelt's exclamation 'Poor Niagara!'", -0.65, regions=["BR", "AR", "GLOBAL"]),
        g(2, "geo_hydrology", "geo_major_rivers", "Rivers, Lakes & National Parks", "Major World Rivers & Lengths",
          "globe_geo_angel_falls", "Locate the 979-meter-tall table-mountain plunge of Salto Ángel (Angel Falls), Earth's highest uninterrupted waterfall dropping off Auyán-tepui.",
          "Canaima, Venezuela", "Angel Falls · Gran Sabana, Venezuela", 5.9701, -62.5362,
          "Guiana Shield tepui highlands of northern South America",
          "Plunging 979 meters from the flat-topped Auyán-tepui in Canaima National Park, Venezuela (5.97°N, 62.54°W), Angel Falls turns to mist before reaching the jungle floor.", -0.55),
        g(2, "geo_physical_relief", "geo_high_summits", "Mountains, Volcanoes & Islands", "World Mountains & Summit Elevations",
          "globe_geo_uluru", "Drop your pin on the sacred 348-meter sandstone monolith of Uluru rising from the arid Outback heart of the southern continent.",
          "Red Centre, Australia", "Uluru · Northern Territory, Australia", -25.3444, 131.0369,
          "Arid central desert interior of the Australian continent",
          "Sacred to the Anangu people, Uluru stands near the geographical heart of Australia in the Northern Territory (25.34°S, 131.04°E).", -1.0, regions=["AU", "GLOBAL"]),
        g(2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "globe_geo_baikal", "Pin Earth's deepest freshwater lake (1,642 m) — a 25-million-year-old crescent rift basin holding over 20% of the planet's unfrozen surface freshwater.",
          "Lake Baikal, Russia", "Lake Baikal · Siberia, Russia", 53.5587, 108.1650,
          "Southern Siberian rift zone north of Mongolia",
          "Lake Baikal in southern Siberia (53.56°N, 108.17°E) is the world's oldest, deepest, and most voluminous freshwater lake, home to endemic freshwater nerpa seals.", -0.6),
        g(2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "globe_geo_dead_sea", "Locate the hypersaline Levantine lake sitting 430 meters BELOW sea level — the lowest land-based elevation on Earth's surface.",
          "Jordan Rift Valley", "Dead Sea · Jordan / Israel", 31.5590, 35.4732,
          "Syrian-African Rift trench in the Levant, Middle East",
          "At roughly 430 m below sea level (31.56°N, 35.47°E), the Dead Sea's 34% salinity allows swimmers to float effortlessly on its surface.", -0.85),
        g(2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "globe_geo_panama", "Drop your pin on the narrow 82-kilometer interoceanic canal lock corridor uniting the Atlantic and Pacific Oceans across Central America.",
          "Isthmus of Panama", "Panama Canal · Central America", 9.0800, -79.6800,
          "Narrow southern land bridge connecting North and South America",
          "Opened in 1914 across the Isthmus of Panama (9.08°N, 79.68°W), the canal handles roughly 5% of global maritime trade.", -1.1),
        g(2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "globe_geo_suez", "Pin the 193-kilometer lock-free shipping trench cutting across the Sinai frontier to link the Mediterranean Sea directly to the Red Sea.",
          "Suez Isthmus, Egypt", "Suez Canal · Egypt", 30.5852, 32.2654,
          "Land bridge connecting northeastern Africa to the Sinai Peninsula",
          "Opened in 1869, Egypt's Suez Canal (30.59°N, 32.27°E) carries roughly 12% of world seaborne commerce.", -1.05, regions=["EG", "GLOBAL"]),
        g(2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "globe_geo_gibraltar", "Locate the narrow 14-kilometer maritime chokepoint guarded by the ancient Pillars of Hercules where the Atlantic rushes into the Mediterranean.",
          "Strait of Gibraltar", "Strait of Gibraltar · Spain / Morocco", 35.9667, -5.6000,
          "Narrow marine gateway between southern Iberia and northwestern Africa",
          "Just 14.3 km wide at its narrowest point (35.97°N, 5.60°W), the Strait of Gibraltar separates Europe from Africa.", -0.9),
        g(2, "geo_physical_relief", "geo_islands_archipelagos", "Mountains, Volcanoes & Islands", "World Islands & Archipelagos",
          "globe_geo_good_hope", "Drop your pin on the rocky southwestern African headland rounded by Bartolomeu Dias in 1488 as Europe unlocked the sea route to India.",
          "Cape Peninsula, S. Africa", "Cape of Good Hope · South Africa", -34.3568, 18.4740,
          "Southwestern Atlantic tip of the African continent",
          "Lying just south of Cape Town (34.36°S, 18.47°E), the Cape of Good Hope became a pivotal waypoint for Indian Ocean sailing routes.", -0.8),
        g(2, "geo_world_cities", "geo_cities_europe_americas", "World Cities & Urban Centers", "Cities of Europe & Latin America",
          "globe_geo_reykjavik", "Pin the world's northernmost capital of a sovereign nation (64.15°N), warmed by geothermal springs along Faxaflói Bay.",
          "Reykjavik, Iceland", "Reykjavik · 64°N, Iceland", 64.1466, -21.9426,
          "Mid-Atlantic volcanic island just south of the Arctic Circle",
          "Founded by Norse settler Ingólfur Arnarson around 874 CE, Reykjavik (64.15°N, 21.94°W) is Earth's northernmost national capital.", -1.0, regions=["IS", "GLOBAL"]),
        g(2, "geo_world_cities", "geo_cities_europe_americas", "World Cities & Urban Centers", "Cities of Europe & Latin America",
          "globe_geo_ushuaia", "Locate 'El Fin del Mundo' — the Tierra del Fuego port along the Beagle Channel celebrated as the primary Antarctic cruise gateway.",
          "Ushuaia, Argentina", "Ushuaia · Tierra del Fuego", -54.8019, -68.3030,
          "Extreme southern archipelago tip of South America",
          "Tucked between the Martial Mountains and the Beagle Channel at 54.80°S, 68.30°W, Ushuaia anchors southern Tierra del Fuego.", -0.35),
        g(2, "geo_physical_relief", "geo_high_summits", "Mountains, Volcanoes & Islands", "World Mountains & Summit Elevations",
          "globe_geo_uyuni", "Drop your pin on Salar de Uyuni — Earth's largest salt flat (10,582 km²), whose flooded crust becomes a giant sky mirror calibrating orbital satellites.",
          "Altiplano, Bolivia", "Salar de Uyuni · Bolivia", -20.1338, -67.4891,
          "High 3,656-meter Andean plateau in southwestern Bolivia",
          "Formed by dried prehistoric lakes across Bolivia's Altiplano (20.13°S, 67.49°W), Salar de Uyuni also holds massive lithium brine reserves.", -0.45),
        g(2, "geo_physical_relief", "geo_volcanoes", "Mountains, Volcanoes & Islands", "Volcanoes & Tectonic Peaks",
          "globe_geo_santorini", "Pin the flooded Aegean volcanic caldera (Thera) whose catastrophic c. 1600 BCE Minoan eruption reshaped the Bronze Age Mediterranean.",
          "Cyclades, Greece", "Santorini Caldera · Greece", 36.3932, 25.4615,
          "Southern Aegean Sea archipelago north of Crete",
          "Santorini's dramatic cliffside caldera in the Greek Cyclades (36.39°N, 25.46°E) was blown open by one of history's largest volcanic blasts.", -0.75),
        g(2, "geo_physical_relief", "geo_high_summits", "Mountains, Volcanoes & Islands", "World Mountains & Summit Elevations",
          "globe_geo_aconcagua", "Locate Mount Aconcagua (6,961 m) — the highest peak anywhere in the Americas or Southern Hemisphere.",
          "Mendoza Andes, Argentina", "Mount Aconcagua · Argentina", -32.6532, -70.0109,
          "High central Andes along the western border of Argentina",
          "Rising 6,961 meters in Mendoza Province near the Chilean border (32.65°S, 70.01°W), Aconcagua is the tallest peak outside Asia.", -0.25),
        g(2, "geo_hydrology", "geo_lakes_straits_wonders", "Rivers, Lakes & National Parks", "Great Lakes & Freshwater Basins",
          "globe_geo_titicaca", "Drop your pin on Earth's highest commercially navigable lake (3,812 m elevation), famous for the Uros people's floating totora-reed islands.",
          "Andean Altiplano, Peru", "Lake Titicaca · Peru / Bolivia", -15.9254, -69.3354,
          "High Andean basin shared by southern Peru and western Bolivia",
          "At 3,812 meters above sea level (15.93°S, 69.34°W), Lake Titicaca is South America's largest lake by volume.", -0.5),
        g(2, "geo_world_cities", "geo_cities_asia_pacific", "World Cities & Urban Centers", "Cities of Asia & Oceania",
          "globe_geo_singapore", "Pin the equatorial island city-state at the southern tip of the Malay Peninsula guarding the strategic Malacca maritime crossroads.",
          "Singapore", "Marina Bay · Singapore", 1.2834, 103.8607,
          "1.3°N equatorial strait linking Indian Ocean and South China Sea",
          "Positioned just 137 km north of the Equator (1.28°N, 103.86°E), Singapore anchors one of the world's busiest container ports and finance hubs.", -1.1, regions=["SG", "GLOBAL"]),

        # --- DOMAIN 3: ARTS & ARCHITECTURE (16 Qs) ---
        g(3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "globe_art_sydney", "Drop your pin on the Bennelong Point harbor landmark where Jørn Utzon's interlocking white ceramic sail shells host world-class opera.",
          "Sydney, Australia", "Sydney Opera House · Australia", -33.8568, 151.2153,
          "Southeastern Pacific coast of New South Wales, Australia",
          "Inaugurated in 1973 on Sydney Harbour (33.86°S, 151.22°E), the Sydney Opera House is Australia's premier architectural icon.", -1.25, regions=["AU", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "globe_art_taj", "Pin the Yamuna riverbank Mughal capital where Shah Jahan's white marble Taj Mahal rises between four symmetrical minarets.",
          "Agra, India", "Taj Mahal · Agra, India", 27.1751, 78.0421,
          "Indo-Gangetic plain southeast of New Delhi, South Asia",
          "Completed in 1653 in Agra, Uttar Pradesh (27.18°N, 78.04°E), the Taj Mahal blends Persian, Islamic, and Indian marble craftsmanship.", -1.2, regions=["IN", "GLOBAL"], glyph="column"),
        g(3, "arts_fine_art", "arts_museum_collections", "Fine Art, Painting & Museums", "World Art Museums & Collections",
          "globe_art_louvre", "Locate the European capital where I. M. Pei's glass pyramid welcomes visitors to the Mona Lisa and Winged Victory inside the Louvre.",
          "Paris, France", "The Louvre · Paris, France", 48.8606, 2.3376,
          "Seine River basin in northern France, Western Europe",
          "Occupying a former royal palace along the Seine (48.86°N, 2.34°E), the Louvre in Paris is the world's most-visited art museum.", -1.3, regions=["FR", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "globe_art_sagrada", "Drop your pin on the Catalan Mediterranean metropolis where Antoni Gaudí's forest-columned Sagrada Família has been rising since 1882.",
          "Barcelona, Spain", "Sagrada Família · Barcelona, Spain", 41.4036, 2.1744,
          "Northeastern Mediterranean coast of the Iberian Peninsula",
          "Antoni Gaudí's unfinished basilica crowns the Eixample district of Barcelona, Catalonia (41.40°N, 2.17°E).", -1.1, regions=["ES", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "globe_art_parthenon", "Pin the ancient Mediterranean capital whose rocky Acropolis citadel supports the Doric marble Parthenon built under Pericles.",
          "Athens, Greece", "The Acropolis · Athens, Greece", 37.9715, 23.7257,
          "Attica peninsula beside the Saronic Gulf, southeastern Europe",
          "Completed in 432 BCE atop the Acropolis of Athens (37.97°N, 23.73°E), the Parthenon defined Western classical proportions.", -1.2, regions=["GR", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "globe_art_hagia", "Locate the transcontinental city on the Bosporus where Justinian's 537 CE pendentive dome of Hagia Sophia faces the six-minaret Blue Mosque.",
          "Istanbul, Turkey", "Hagia Sophia · Istanbul, Turkey", 41.0086, 28.9802,
          "Historic peninsula bridging Europe and Asia at the Sea of Marmara",
          "Standing in Sultanahmet, Istanbul (41.01°N, 28.98°E), Hagia Sophia reigned as the world's largest cathedral dome for almost a thousand years.", -1.05, regions=["TR", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "globe_art_colosseum", "Drop your pin on the Eternal City where both the Flavian Colosseum and the Pantheon's 43.3-meter unreinforced concrete dome still stand.",
          "Rome, Italy", "Colosseum & Pantheon · Rome, Italy", 41.8902, 12.4922,
          "Tiber River valley in central-western Italian peninsula",
          "Rome (41.89°N, 12.49°E) preserves imperial engineering triumphs from the 80 CE Colosseum to Hadrian's c. 125 CE Pantheon.", -1.3, regions=["IT", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "globe_art_alhambra", "Pin the Sierra Nevada foothill city crowned by the Alhambra — the Nasrid red-brick fortress famed for its Lion Court and geometric muqarnas vaults.",
          "Granada, Spain", "The Alhambra · Granada, Spain", 37.1761, -3.5881,
          "Andalusian highlands of southern Iberia",
          "Overlooking Granada in southern Spain (37.18°N, 3.59°W), the Alhambra represents the supreme flowering of Moorish palace art in Europe.", -0.55, regions=["ES", "GLOBAL"], glyph="column"),
        g(3, "arts_fine_art", "arts_sculpture_prints", "Fine Art, Painting & Museums", "Sculpture, Prints, Drawings & Photography",
          "globe_art_christ_redeemer", "Locate the Atlantic granite-peaked bay city where the 30-meter Art Deco soapstone statue of Christ the Redeemer spreads its arms atop Corcovado.",
          "Rio de Janeiro, Brazil", "Christ the Redeemer · Rio, Brazil", -22.9519, -43.2105,
          "Guanabara Bay along southeastern Brazil's Atlantic coast",
          "Completed in 1931 atop 710-meter Mount Corcovado, Christ the Redeemer overlooks Rio de Janeiro (22.95°S, 43.21°W).", -1.2, regions=["BR", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "globe_art_burj_khalifa", "Drop your pin on the Persian Gulf metropolis pierced by the 828-meter Y-shaped Burj Khalifa — Earth's tallest human-made skyscraper.",
          "Dubai, UAE", "Burj Khalifa · Dubai, UAE", 25.1972, 55.2744,
          "Southeastern Arabian Peninsula along the Persian Gulf",
          "Opened in 2010 in Downtown Dubai (25.20°N, 55.27°E), the 163-floor Burj Khalifa rises 828 meters above the desert coast.", -1.15, regions=["AE", "GLOBAL"], glyph="column"),
        g(3, "arts_fine_art", "arts_museum_collections", "Fine Art, Painting & Museums", "World Art Museums & Collections",
          "globe_art_bilbao", "Pin the Basque river port transformed in 1997 when Frank Gehry unveiled his shimmering titanium-clad Guggenheim Museum along the Nervión River.",
          "Bilbao, Spain", "Guggenheim Museum · Bilbao, Spain", 43.2687, -2.9340,
          "Bay of Biscay coast in northern Basque Country, Spain",
          "Frank Gehry's sinuous titanium museum in Bilbao (43.27°N, 2.93°W) coined the urban-planning term 'the Bilbao Effect'.", -0.3, regions=["ES", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "globe_art_neuschwanstein", "Locate the Alpine cliffside where King Ludwig II built his 19th-century fairytale Neuschwanstein Castle — inspiration for Disney's Sleeping Beauty Castle.",
          "Bavaria, Germany", "Neuschwanstein Castle · Bavaria", 47.5576, 10.7498,
          "Northern Alpine foothills of Central Europe near Austria",
          "Perched above Schwangau in southern Bavaria (47.56°N, 10.75°E), Neuschwanstein began construction in 1869 as Ludwig II's tribute to Richard Wagner.", -0.75, regions=["DE", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "globe_art_golden_gate", "Drop your pin on the foggy Pacific strait spanned since 1937 by the International Orange Art Deco towers of the Golden Gate Bridge.",
          "San Francisco, USA", "Golden Gate Bridge · California, USA", 37.8199, -122.4783,
          "Northern California coastal strait linking Pacific and bay",
          "Designed by Joseph Strauss and Irving Morrow, the Golden Gate Bridge spans 1.7 miles across San Francisco Bay's mouth (37.82°N, 122.48°W).", -1.2, regions=["US", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_palaces_castles_museums", "World Architecture & Monuments", "Castles, Palaces, Bridges & Skyscrapers",
          "globe_art_forbidden_city", "Pin the East Asian capital housing the 1420 Forbidden City — the world's largest surviving wooden imperial palace complex (980 buildings).",
          "Beijing, China", "Forbidden City · Beijing, China", 39.9163, 116.3972,
          "North China Plain south of the Great Wall, East Asia",
          "Serving 24 Ming and Qing emperors from 1420 to 1912, the Forbidden City anchors central Beijing (39.92°N, 116.40°E).", -1.15, regions=["CN", "GLOBAL"], glyph="column"),
        g(3, "arts_architecture", "arts_sacred_cathedrals", "World Architecture & Monuments", "Cathedrals, Temples & Mosques",
          "globe_art_kinkakuji", "Locate the thousand-year former imperial capital where gold-leaf-clad Kinkaku-ji (Golden Pavilion) shimmers above its Mirror Pond.",
          "Kyoto, Japan", "Kinkaku-ji · Kyoto, Japan", 35.0394, 135.7292,
          "Kansai inland mountain basin of western Honshu, East Asia",
          "Kyoto (35.04°N, 135.73°E) preserves 17 UNESCO World Heritage shrines and temples, led by the iconic 14th-century Golden Pavilion.", -0.8, regions=["JP", "GLOBAL"], glyph="column"),
        g(3, "arts_fine_art", "arts_museum_collections", "Fine Art, Painting & Museums", "World Art Museums & Collections",
          "globe_art_florence", "Drop your pin on the Tuscan cradle of the Renaissance — home to Brunelleschi's double-shelled terracotta dome, Michelangelo's David, and the Uffizi Gallery.",
          "Florence, Italy", "Uffizi & Duomo · Florence, Italy", 43.7678, 11.2553,
          "Arno River valley in Tuscany, north-central Italy",
          "Under Medici patronage along the Arno (43.77°N, 11.26°E), Florence launched the Italian Renaissance in architecture, sculpture, and painting.", -0.95, regions=["IT", "GLOBAL"], glyph="column"),

        # --- DOMAIN 4: FILM, MUSIC & POP CULTURE (12 Qs) ---
        g(4, "pop_cinema", "pop_hollywood_modern_film", "World Cinema & Directors", "Hollywood & North American Cinema",
          "globe_pop_hollywood", "Pin the sunny Pacific basin where the 45-foot hillside Hollywood Sign overlooks the Dolby Theatre home of the Academy Awards.",
          "Los Angeles, USA", "Hollywood · Los Angeles, USA", 34.1341, -118.3215,
          "Southern California coastal basin below Mount Lee",
          "Erected in 1923 atop Mount Lee (34.13°N, 118.32°W), the Hollywood Sign symbolizes Los Angeles's global cinema capital.", -1.3, regions=["US", "GLOBAL"], glyph="mask"),
        g(4, "pop_music_recording", "pop_albums", "Music, Albums, Songs & Bands", "Landmark Studio Albums & Artists",
          "globe_pop_abbey_road", "Drop your pin on the British capital whose St John's Wood zebra crossing and Abbey Road Studios birthed iconic Beatles and Pink Floyd albums.",
          "London, UK", "Abbey Road Studios · London, UK", 51.5320, -0.1774,
          "Thames metropolis in southeastern Great Britain",
          "Opened in 1931 in Westminster, London (51.53°N, 0.18°W), Abbey Road Studios hosted both The Beatles' 1969 LP and The Dark Side of the Moon.", -1.15, regions=["GB", "GLOBAL"], glyph="wave"),
        g(4, "pop_cinema", "pop_international_cinema", "World Cinema & Directors", "European, Asian & World Cinema",
          "globe_pop_cannes", "Locate the glamorous French Riviera resort town where filmmakers compete every May for cinema's coveted Palme d'Or.",
          "Cannes, France", "Palais des Festivals · Cannes, France", 43.5508, 7.0174,
          "Côte d'Azur Mediterranean coastline, southeastern France",
          "Founded in 1946 along the Promenade de la Croisette in Cannes (43.55°N, 7.02°E), the festival awards cinema's highest laurel, the Palme d'Or.", -0.8, regions=["FR", "GLOBAL"], glyph="mask"),
        g(4, "pop_cinema", "pop_international_cinema", "World Cinema & Directors", "European, Asian & World Cinema",
          "globe_pop_bollywood", "Pin the Arabian Sea coastal megacity powering Bollywood — the Hindi-language film studio powerhouse producing hundreds of features annually.",
          "Mumbai, India", "Bollywood Film City · Mumbai, India", 19.1645, 72.8856,
          "Konkan western coastline of Maharashtra, western India",
          "Centered in Goregaon's Film City in Mumbai (formerly Bombay, 19.16°N, 72.89°E), Bollywood is among Earth's most prolific film industries.", -1.0, regions=["IN", "GLOBAL"], glyph="mask"),
        g(4, "pop_cinema", "pop_international_cinema", "World Cinema & Directors", "European, Asian & World Cinema",
          "globe_pop_ghibli", "Drop your pin on the East Asian metropolis whose Mitaka Inokashira Park houses the whimsical Studio Ghibli Museum founded by Hayao Miyazaki.",
          "Tokyo, Japan", "Studio Ghibli Museum · Mitaka, Tokyo", 35.6962, 139.5704,
          "Western suburbs of the Kanto Plain capital on Honshu",
          "Designed personally by Hayao Miyazaki in Mitaka, western Tokyo (35.70°N, 139.57°E), the Ghibli Museum opened in 2001.", -0.85, regions=["JP", "GLOBAL"], glyph="mask"),
        g(4, "pop_music_recording", "pop_songs", "Music, Albums, Songs & Bands", "Iconic Hit Songs & Singles",
          "globe_pop_nashville", "Locate 'Music City' along the Cumberland River — home to the Grand Ole Opry, Ryman Auditorium, and the Country Music Hall of Fame.",
          "Nashville, USA", "Grand Ole Opry · Nashville, USA", 36.1612, -86.7785,
          "Cumberland River basin in the mid-South United States",
          "Nashville, Tennessee (36.16°N, 86.78°W) has broadcast the Grand Ole Opry live since 1925 and anchored Music Row recording studios.", -0.85, regions=["US", "GLOBAL"], glyph="wave"),
        g(4, "pop_music_recording", "pop_albums", "Music, Albums, Songs & Bands", "Landmark Studio Albums & Artists",
          "globe_pop_motown", "Pin the Great Lakes industrial city where Berry Gordy turned a modest West Grand Boulevard house ('Hitsville U.S.A.') into the Motown hit factory.",
          "Detroit, USA", "Hitsville U.S.A. · Detroit, USA", 42.3642, -83.0884,
          "Great Lakes corridor between Lake Huron and Lake Erie",
          "From Studio A at 2648 West Grand Boulevard in Detroit (42.36°N, 83.09°W), Motown launched Stevie Wonder, Marvin Gaye, and The Supremes.", -0.75, regions=["US", "GLOBAL"], glyph="wave"),
        g(4, "pop_music_recording", "pop_albums", "Music, Albums, Songs & Bands", "Landmark Studio Albums & Artists",
          "globe_pop_lascala", "Drop your pin on the northern Italian fashion and opera capital where Teatro alla Scala premiered masterpieces by Verdi, Rossini, and Puccini.",
          "Milan, Italy", "Teatro alla Scala · Milan, Italy", 45.4674, 9.1896,
          "Lombardy plain in northern Italy south of the Alps",
          "Inaugurated in 1778 in Milan (45.47°N, 9.19°E), La Scala remains one of the world's most hallowed opera houses.", -0.65, regions=["IT", "GLOBAL"], glyph="wave"),
        g(4, "pop_music_recording", "pop_albums", "Music, Albums, Songs & Bands", "Landmark Studio Albums & Artists",
          "globe_pop_vienna", "Locate the Danube classical music capital whose Golden Hall of the Musikverein hosts the globally televised New Year's Concert every January 1.",
          "Vienna, Austria", "Musikverein · Vienna, Austria", 48.2006, 16.3728,
          "Eastern Danube basin of Central Europe",
          "Home to Mozart, Beethoven, Haydn, and Schubert, Vienna's Musikverein (48.20°N, 16.37°E) is famed for its gilded acoustics.", -0.95, regions=["AT", "GLOBAL"], glyph="wave"),
        g(4, "pop_music_recording", "pop_songs", "Music, Albums, Songs & Bands", "Iconic Hit Songs & Singles",
          "globe_pop_kingston", "Pin the Caribbean island capital where Trench Town and Tuff Gong Studios gave birth to ska, rocksteady, dub, and Bob Marley's reggae.",
          "Kingston, Jamaica", "Bob Marley Museum · Kingston", 18.0197, -76.7801,
          "Southeastern harbor of a Greater Antilles island south of Cuba",
          "Bob Marley's former 56 Hope Road home and Tuff Gong studio in Kingston, Jamaica (18.02°N, 76.78°W) shaped modern world music.", -0.7, regions=["JM", "GLOBAL"], glyph="wave"),
        g(4, "pop_cinema", "pop_international_cinema", "World Cinema & Directors", "European, Asian & World Cinema",
          "globe_pop_hobbiton", "Drop your pin on the lush Waikato dairy hills where Peter Jackson constructed the 44 permanent round-doored Hobbit holes of Middle-earth's Shire.",
          "North Island, New Zealand", "Hobbiton Set · Matamata, NZ", -37.8721, 175.6829,
          "Rolling green pastures of the South Pacific North Island",
          "Nestled outside Matamata in New Zealand's Waikato region (37.87°S, 175.68°E), the Hobbiton set was rebuilt permanently for The Hobbit trilogy.", -0.7, regions=["NZ", "GLOBAL"], glyph="mask"),
        g(4, "pop_music_recording", "pop_bands_ensembles", "Music, Albums, Songs & Bands", "Bands, Rock Groups & Ensembles",
          "globe_pop_seoul_kpop", "Locate the neon Han River megacity whose Gangnam and Hongdae districts launched the global Hallyu K-Pop and cinema phenomenon.",
          "Seoul, South Korea", "Gangnam Hub · Seoul, South Korea", 37.5172, 127.0473,
          "Northwestern Korean Peninsula in East Asia",
          "Seoul (37.52°N, 127.05°E) anchors South Korea's global music, television drama, and Academy Award-winning cinema wave.", -1.1, regions=["KR", "GLOBAL"], glyph="wave"),

        # --- DOMAIN 5 (NON-BASEBALL GLOBAL SPORTS LANDMARKS): 8 Qs ---
        g(5, "sports", "sports_tennis_golf", "Sports", "Tennis & Golf",
          "globe_sp_wimbledon", "Pin the southwestern Thames suburb where the All England Lawn Tennis Club has staged Grand Slam grass-court championships since 1877.",
          "Wimbledon, London, UK", "Wimbledon · London, UK", 51.4343, -0.2145,
          "Southwestern Greater London, southeastern England",
          "Wimbledon (51.43°N, 0.21°W) is the world's oldest tennis tournament and the sole Grand Slam still contested on perennial ryegrass.", -1.05, regions=["GB", "GLOBAL"], glyph="flame"),
        g(5, "sports", "sports_olympics_track_swim", "Sports", "Olympics, Track & Swimming",
          "globe_sp_olympia", "Drop your pin on the ancient sanctuary of Olympia, where the Olympic Games debuted in 776 BCE and every modern Olympic flame is still lit by sunlight.",
          "Peloponnese, Greece", "Ancient Olympia · Greece", 37.6386, 21.6300,
          "Western southern-mainland river valley, Aegean region",
          "Every two years, a parabolic mirror kindles the Olympic torch at the Temple of Hera in Ancient Olympia (37.64°N, 21.63°E).", -0.75, regions=["GR", "GLOBAL"], glyph="flame"),
        g(5, "sports", "sports_soccer", "Sports", "Soccer & World Football",
          "globe_sp_maracana", "Locate the South American coastal metropolis whose colossal Maracanã Stadium hosted both the 1950 and 2014 FIFA World Cup finals plus the 2016 Olympics.",
          "Rio de Janeiro, Brazil", "Maracanã Stadium · Rio, Brazil", -22.9121, -43.2302,
          "Southeastern Atlantic coast of South America",
          "Built for the 1950 World Cup when nearly 200,000 fans packed its stands, the Maracanã anchors Rio de Janeiro (22.91°S, 43.23°W).", -1.0, regions=["BR", "GLOBAL"], glyph="flame"),
        g(5, "sports", "sports_tennis_golf", "Sports", "Tennis & Golf",
          "globe_sp_standrews", "Pin the windy North Sea Fife coastline known worldwide as the 'Home of Golf', where the Old Course's 18-hole layout standardized the sport.",
          "St Andrews, Scotland", "Old Course · St Andrews, Scotland", 56.3432, -2.8024,
          "Eastern Fife coast of northern Britain facing the North Sea",
          "Golf has been played on the links of St Andrews (56.34°N, 2.80°W) since the early 15th century, and The R&A rules the game from its clubhouse.", -0.55, regions=["GB", "GLOBAL"], glyph="flame"),
        g(5, "sports", "sports_combat_motorsport", "Sports", "Combat Sports, Motorsport & Global Pitch",
          "globe_sp_monaco", "Drop your pin on the Riviera principality whose tight harborfront hairpins host Formula 1's crown-jewel street Grand Prix every May.",
          "Monte Carlo, Monaco", "Circuit de Monaco · Riviera", 43.7347, 7.4206,
          "Mediterranean coastal microstate framed by southeastern France",
          "First raced in 1929, the 3.337 km Circuit de Monaco winds past Casino Square and Port Hercule (43.73°N, 7.42°E).", -0.85, regions=["MC", "GLOBAL"], glyph="flame"),
        g(5, "sports", "sports_tennis_golf", "Sports", "Tennis & Golf",
          "globe_sp_augusta", "Locate the Savannah River southern city where azalea-lined Amen Corner and the coveted Green Jacket define golf's annual Masters Tournament.",
          "Augusta, Georgia, USA", "Augusta National · Georgia, USA", 33.5021, -82.0232,
          "Savannah River border in the southeastern United States",
          "Co-founded by Bobby Jones in 1933, Augusta National Golf Club (33.50°N, 82.02°W) has hosted the Masters Tournament since 1934.", -0.65, regions=["US", "GLOBAL"], glyph="flame"),
        g(5, "sports", "sports_tennis_golf", "Sports", "Tennis & Golf",
          "globe_sp_roland_garros", "Pin the European capital whose red crushed-brick courts at Stade Roland-Garros saw Rafael Nadal capture an unprecedented 14 French Open crowns.",
          "Paris, France", "Roland-Garros · Paris, France", 48.8470, 2.2491,
          "Western edge of the French capital beside Bois de Boulogne",
          "Named after pioneering French aviator Roland Garros, the clay-court cathedral anchors Paris's 16th arrondissement (48.85°N, 2.25°E).", -1.0, regions=["FR", "GLOBAL"], glyph="flame"),
        g(5, "sports", "sports_stadiums_arenas", "Sports", "Iconic Stadiums, Ballparks & Arenas",
          "globe_sp_mcg", "Drop your pin on the Victoria bayfront sporting capital whose 100,000-seat 'MCG' hosted the 1956 Olympics and iconic Boxing Day Cricket Tests.",
          "Melbourne, Australia", "Melbourne Cricket Ground · Australia", -37.8200, 144.9834,
          "Port Phillip Bay on Victoria's southeastern Pacific coast",
          "Opened in 1853 in Yarra Park, Melbourne (37.82°S, 144.98°E), the MCG staged cricket's very first Test match in 1877.", -0.8, regions=["AU", "GLOBAL"], glyph="flame"),

        # --- DOMAIN 6: TECH & COMPUTING (10 Qs) ---
        g(6, "tech_industry_hardware", "tech_companies", "Tech Giants, Semiconductors & Industry", "Software, Internet & Semiconductor Giants",
          "globe_tech_silicon_valley", "Pin the Santa Clara Valley corridor south of San Francisco Bay where Shockley, Intel, Hewlett-Packard, and Apple sparked the microchip revolution.",
          "Silicon Valley, USA", "Palo Alto · Silicon Valley, USA", 37.4419, -122.1430,
          "Southern San Francisco Bay peninsula, Northern California",
          "Stretching from Palo Alto to San Jose (37.44°N, 122.14°W), Silicon Valley became the epicenter of semiconductor and software engineering.", -1.1, regions=["US", "GLOBAL"], glyph="gear"),
        g(6, "tech_inventors_pioneers", "tech_cs_pioneers", "Inventors, Engineers & Computer Scientists", "Computer Scientists & Software Pioneers",
          "globe_tech_bletchley", "Drop your pin on the Buckinghamshire country estate northwest of London where Alan Turing's Bombe and the electronic Colossus cracked Axis ciphers.",
          "Bletchley Park, UK", "Bletchley Park · Milton Keynes, UK", 51.9977, -0.7407,
          "Southern Midlands roughly 80 km northwest of London, England",
          "Codebreakers at Bletchley Park (52.00°N, 0.74°W) cracked Enigma and Lorenz traffic, shortening World War II and birthing programmable electronic computing.", -0.65, regions=["GB", "GLOBAL"], glyph="gear"),
        g(6, "tech_industry_hardware", "tech_companies", "Tech Giants, Semiconductors & Industry", "Software, Internet & Semiconductor Giants",
          "globe_tech_tsmc", "Locate the East Asian island science park where foundry giant TSMC fabricates the vast majority of Earth's most advanced smartphone and AI silicon chips.",
          "Hsinchu, Taiwan", "TSMC Hsinchu Park · Taiwan", 24.7820, 121.0063,
          "Northwestern coast of a Pacific island east of the Formosa Strait",
          "Founded by Morris Chang in 1987 in Hsinchu Science Park, Taiwan (24.78°N, 121.01°E), TSMC pioneered the pure-play semiconductor foundry model.", -0.35, regions=["TW", "GLOBAL"], glyph="gear"),
        g(6, "tech_industry_hardware", "tech_companies", "Tech Giants, Semiconductors & Industry", "Software, Internet & Semiconductor Giants",
          "globe_tech_asml", "Pin the Brabant high-tech town in the Low Countries where ASML builds the world's ONLY extreme ultraviolet (EUV) lithography chipmaking machines.",
          "Eindhoven, Netherlands", "ASML Headquarters · Netherlands", 51.4063, 5.4150,
          "Southern Low Countries near the Belgian frontier, Western Europe",
          "Headquartered in Veldhoven beside Eindhoven (51.41°N, 5.42°E), ASML supplies every sub-5nm EUV lithography scanner on Earth.", 0.15, regions=["NL", "GLOBAL"], glyph="gear"),
        g(6, "tech_inventors_pioneers", "tech_cs_pioneers", "Inventors, Engineers & Computer Scientists", "Computer Scientists & Software Pioneers",
          "globe_tech_bell_labs", "Drop your pin on the New Jersey research campus just west of Manhattan where the transistor (1947), information theory, C, and UNIX were born.",
          "Murray Hill, NJ, USA", "Bell Labs · Murray Hill, USA", 40.6838, -74.4008,
          "Northern New Jersey hills just west of New York Harbor",
          "Bell Labs in Murray Hill, New Jersey (40.68°N, 74.40°W) produced 10 Nobel Prizes and laid the bedrock of modern electronics and software.", -0.2, regions=["US", "GLOBAL"], glyph="gear"),
        g(6, "tech_industry_hardware", "tech_companies", "Tech Giants, Semiconductors & Industry", "Software, Internet & Semiconductor Giants",
          "globe_tech_shenzhen", "Locate the Pearl River Delta megacity right across from Hong Kong that grew from a 1980 fishing village into the planet's premier hardware & drone manufacturing hub.",
          "Shenzhen, China", "Shenzhen Hardware Hub · China", 22.5431, 114.0579,
          "Pearl River Delta on Guangdong's southern South China Sea coast",
          "Designated China's first Special Economic Zone in 1980, Shenzhen (22.54°N, 114.06°E) powers Huawei, BYD, DJI, and Huaqiangbei electronics markets.", -0.65, regions=["CN", "GLOBAL"], glyph="gear"),
        g(6, "tech_industry_hardware", "tech_companies", "Tech Giants, Semiconductors & Industry", "Software, Internet & Semiconductor Giants",
          "globe_tech_bengaluru", "Pin the Deccan Plateau garden metropolis celebrated as South Asia's Silicon Valley, home to Infosys, Wipro, and ISRO headquarters.",
          "Bengaluru, India", "Bengaluru Tech Hub · India", 12.9716, 77.5946,
          "Southern Deccan highland plateau of Karnataka, South Asia",
          "Sitting 920 meters high in southern India (12.97°N, 77.59°E), Bengaluru anchors India's global software, aerospace, and startup ecosystem.", -0.75, regions=["IN", "GLOBAL"], glyph="gear"),
        g(6, "tech_aerospace_automotive", "tech_first_flights_debuts", "Automotive, Aviation & Naval Engineering", "Engineering Debuts & First Flights",
          "globe_tech_kitty_hawk", "Drop your pin on the windswept Atlantic barrier dunes of Kill Devil Hills where Orville and Wilbur Wright achieved powered heavier-than-air flight on December 17, 1903.",
          "Outer Banks, NC, USA", "Kitty Hawk · North Carolina, USA", 36.0176, -75.6678,
          "Atlantic barrier islands along the mid-Atlantic U.S. seaboard",
          "Choosing Kill Devil Hills near Kitty Hawk (36.02°N, 75.67°W) for steady ocean winds and soft landing sand, the Wright brothers flew 120 feet in 12 seconds.", -0.7, regions=["US", "GLOBAL"], glyph="rocket"),
        g(6, "tech_aerospace_automotive", "tech_aircraft_ships", "Automotive, Aviation & Naval Engineering", "Aircraft, Launch Vehicles & Naval Vessels",
          "globe_tech_toulouse", "Locate the terracotta 'Pink City' north of the Pyrenees where Airbus conducts final assembly for the A350, A320, and historic Concorde airliners.",
          "Toulouse, France", "Airbus Assembly · Toulouse, France", 43.6291, 1.3638,
          "Garonne River valley north of the Pyrenees, Western Europe",
          "Toulouse-Blagnac (43.63°N, 1.36°E) is the historic aerospace capital of Europe, assembling Airbus jetliners and CNES spacecraft.", -0.25, regions=["FR", "GLOBAL"], glyph="rocket"),
        g(6, "tech_industry_hardware", "tech_companies", "Tech Giants, Semiconductors & Industry", "Software, Internet & Semiconductor Giants",
          "globe_tech_stockholm", "Pin the 14-island Baltic archipelago capital that became Europe's 'unicorn factory', birthing Spotify, Skype, Klarna, and Minecraft.",
          "Stockholm, Sweden", "Stockholm Tech Hub · Sweden", 59.3293, 18.0686,
          "Baltic Sea inlet on the eastern coast of Scandinavia",
          "Stockholm (59.33°N, 18.07°E) ranks among the world's highest-producing cities per capita for billion-dollar software startups.", -0.8, regions=["SE", "GLOBAL"], glyph="gear"),

        # --- DOMAIN 7: NATURE & BIOLOGY (10 Qs) ---
        g(7, "nat_vertebrates", "nat_birds", "Mammals, Birds & Reptiles", "Birds & Avian Life",
          "globe_nat_galapagos", "Pin the equatorial Pacific volcanic archipelago 1,000 km off South America where finch beak variations inspired Charles Darwin's theory of natural selection.",
          "Galápagos, Ecuador", "Galápagos Islands · Ecuador", -0.9538, -90.9656,
          "Equatorial eastern Pacific Ocean west of South America",
          "Straddling the Equator at 0.95°S, 90.97°W, the Galápagos Islands shelter marine iguanas, giant tortoises, and Darwin's finches.", -1.05, regions=["EC", "GLOBAL"], glyph="dna"),
        g(7, "nat_marine_invertebrates", "nat_fish_sharks", "Marine Life, Insects & Invertebrates", "Fish, Sharks & Rays",
          "globe_nat_gbr", "Drop your pin off the tropical northeastern Queensland coast — home to the 2,300-kilometer Great Barrier Reef, Earth's largest living structure.",
          "Coral Sea, Australia", "Great Barrier Reef · Australia", -18.2871, 147.6992,
          "Tropical South Pacific shelf off northeastern Queensland",
          "Comprising over 2,900 individual reefs and 900 islands (18.29°S, 147.70°E), the Great Barrier Reef is visible from low Earth orbit.", -1.1, regions=["AU", "GLOBAL"], glyph="dna"),
        g(7, "nat_vertebrates", "nat_mammals", "Mammals, Birds & Reptiles", "Mammals of Land & Sea",
          "globe_nat_serengeti", "Locate the East African savanna plains where over 1.5 million blue wildebeest and zebra stage Earth's greatest overland mammal migration.",
          "Serengeti, Tanzania", "Serengeti Plains · Tanzania", -2.3333, 34.8333,
          "Northern savanna highlands between Lake Victoria and the Rift Valley",
          "Spanning northern Tanzania into Kenya's Maasai Mara (2.33°S, 34.83°E), the Serengeti sustains Africa's densest big-cat and ungulate ecosystem.", -0.9, regions=["TZ", "GLOBAL"], glyph="dna"),
        g(7, "nat_botany_fungi", "nat_plants_trees", "Botany, Trees, Flora & Fungi", "Trees, Flowers & Wild Plants",
          "globe_nat_amazon", "Pin the rainforest metropolis of Manaus, where the dark Rio Negro and sandy Solimões meet without mixing for kilometers inside Earth's largest tropical forest.",
          "Amazon Basin, Brazil", "Manaus · Amazon Rainforest, Brazil", -3.1190, -60.0217,
          "Equatorial heart of the South American river basin",
          "Deep in northern Brazil (3.12°S, 60.02°W), Manaus sits at the 'Meeting of Waters' anchoring the biodiverse Amazon Rainforest.", -1.0, regions=["BR", "GLOBAL"], glyph="dna"),
        g(7, "nat_vertebrates", "nat_mammals", "Mammals, Birds & Reptiles", "Mammals of Land & Sea",
          "globe_nat_madagascar", "Drop your pin on the world's fourth-largest island — isolated for 88 million years so over 90% of its wildlife, including every wild lemur, lives nowhere else.",
          "Madagascar", "Madagascar · Indian Ocean", -18.8792, 47.5079,
          "Large Indian Ocean island across the Mozambique Channel from East Africa",
          "Splitting from India ~88 million years ago (18.88°S, 47.51°E), Madagascar evolved endemic lemurs, fossas, and towering baobab avenues.", -1.1, regions=["MG", "GLOBAL"], glyph="dna"),
        g(7, "nat_conservation_breeds", "nat_threatened_wildlife", "Conservation, Endangered Wildlife & Breeds", "Endangered & Vulnerable Species",
          "globe_nat_yellowstone", "Locate the world's first national park (established 1872), sitting atop a giant geothermal supervolcano caldera famous for Old Faithful and reintroduced gray wolves.",
          "Yellowstone, USA", "Yellowstone · Wyoming, USA", 44.4605, -110.8281,
          "Northern Rocky Mountain volcanic plateau, western United States",
          "Established March 1, 1872 primarily in northwestern Wyoming (44.46°N, 110.83°W), Yellowstone holds more than half of Earth's active geysers.", -0.95, regions=["US", "GLOBAL"], glyph="dna"),
        g(7, "nat_vertebrates", "nat_reptiles_amphibians", "Mammals, Birds & Reptiles", "Reptiles & Amphibians",
          "globe_nat_komodo", "Pin the arid volcanic Lesser Sunda islands forming the sole native wild sanctuary of Earth's largest living venomous 3-meter monitor lizard.",
          "Komodo Islands, Indonesia", "Komodo National Park · Indonesia", -8.5850, 119.4411,
          "Volcanic island chain east of Bali and Sumbawa, Maritime SE Asia",
          "Lying between Sumbawa and Flores in Indonesia (8.59°S, 119.44°E), Komodo National Park protects the apex monitor lizard Varanus komodoensis.", -0.55, regions=["ID", "GLOBAL"], glyph="dna"),
        g(7, "nat_vertebrates", "nat_mammals", "Mammals, Birds & Reptiles", "Mammals of Land & Sea",
          "globe_nat_borneo", "Drop your pin on Earth's third-largest island — shared by three nations and sheltering wild orangutans, proboscis monkeys, and pygmy elephants in 140-million-year-old rainforest.",
          "Borneo, SE Asia", "Borneo Rainforest · SE Asia", 1.5533, 110.3592,
          "Equatorial island in Maritime Southeast Asia shared by Malaysia, Indonesia & Brunei",
          "Straddling the Equator (1.55°N, 110.36°E), Borneo's ancient dipterocarp rainforests harbor some of Earth's highest plant and primate diversity.", -0.75, regions=["MY", "ID", "GLOBAL"], glyph="dna"),
        g(7, "nat_conservation_breeds", "nat_threatened_wildlife", "Conservation, Endangered Wildlife & Breeds", "Endangered & Vulnerable Species",
          "globe_nat_everglades", "Locate the slow-flowing subtropical sawgrass 'River of Grass' — the ONLY place on Earth where wild alligators and American crocodiles naturally coexist.",
          "South Florida, USA", "Everglades · Florida, USA", 25.2866, -80.8987,
          "Subtropical southern tip of the southeastern U.S. peninsula",
          "Covering the southern tip of Florida (25.29°N, 80.90°W), Everglades National Park is an unmatched subtropical wetland biosphere.", -0.85, regions=["US", "GLOBAL"], glyph="dna"),
        g(7, "nat_conservation_breeds", "nat_threatened_wildlife", "Conservation, Endangered Wildlife & Breeds", "Endangered & Vulnerable Species",
          "globe_nat_chengdu", "Pin the misty bamboo-clad mountain basin of Sichuan — global conservation capital and native mountain home of the wild giant panda.",
          "Chengdu, China", "Sichuan Panda Sanctuaries · China", 30.6586, 104.0648,
          "Fertile Sichuan Basin flanking the eastern Tibetan foothills",
          "Centered around Chengdu and the Wolong mountains of Sichuan (30.66°N, 104.06°E), these misty bamboo forests protect over 70% of Earth's giant pandas.", -0.7, regions=["CN", "GLOBAL"], glyph="dna"),

        # --- DOMAIN 8: WORLD AFFAIRS & LAW (8 Qs) ---
        g(8, "soc_nations_geopolitics", "soc_intl_orgs", "Sovereign Nations, Capitals & Currencies", "International Organizations & Agencies",
          "globe_soc_hague", "Pin the North Sea administrative capital housing the Peace Palace — seat of both the International Court of Justice and the International Criminal Court.",
          "The Hague, Netherlands", "Peace Palace · The Hague", 52.0866, 4.2955,
          "North Sea coast of western Netherlands, Low Countries",
          "Known as the International City of Peace and Justice, The Hague (52.09°N, 4.30°E) hosts the UN's principal judicial organ.", -0.85, regions=["NL", "GLOBAL"], glyph="scales"),
        g(8, "soc_nations_geopolitics", "soc_intl_orgs", "Sovereign Nations, Capitals & Currencies", "International Organizations & Agencies",
          "globe_soc_unhq", "Drop your pin on the East River Manhattan international enclave where the United Nations General Assembly and Security Council convene.",
          "New York, USA", "UN Headquarters · Manhattan, USA", 40.7489, -73.9680,
          "Mid-Atlantic seaboard island metropolis, northeastern U.S.",
          "Completed in 1952 on land donated by John D. Rockefeller Jr. in Midtown Manhattan (40.75°N, 73.97°W), UN Headquarters hosts 193 member states.", -1.25, regions=["US", "GLOBAL"], glyph="scales"),
        g(8, "soc_nations_geopolitics", "soc_intl_orgs", "Sovereign Nations, Capitals & Currencies", "International Organizations & Agencies",
          "globe_soc_geneva", "Locate the Alpine lakeside diplomacy capital hosting the Palais des Nations, WHO, WTO, and the founding 1863 headquarters of the International Red Cross.",
          "Geneva, Switzerland", "Palais des Nations · Geneva", 46.2266, 6.1404,
          "Southwestern tip of Lake Léman bordered by France and the Alps",
          "Geneva (46.23°N, 6.14°E) gave its name to the Geneva Conventions and hosts more international humanitarian organizations than any other city.", -1.1, regions=["CH", "GLOBAL"], glyph="scales"),
        g(8, "soc_regional_politics", "soc_european_politics", "Regional Politics & Global Institutions", "Continental European Politics & Institutions",
          "globe_soc_brussels", "Pin the bilingual European capital housing both the European Commission's Berlaymont building and NATO's global alliance headquarters.",
          "Brussels, Belgium", "EU & NATO HQ · Brussels, Belgium", 50.8438, 4.3826,
          "Central Low Countries crossroads of Western Europe",
          "Brussels (50.84°N, 4.38°E) serves as the de facto capital of the European Union and headquarters of the North Atlantic Treaty Organization.", -0.95, regions=["BE", "GLOBAL"], glyph="scales"),
        g(8, "soc_nations_geopolitics", "soc_intl_orgs", "Sovereign Nations, Capitals & Currencies", "International Organizations & Agencies",
          "globe_soc_addis", "Drop your pin on the 2,355-meter-high Horn of Africa diplomatic capital that serves as permanent headquarters of the 55-member African Union.",
          "Addis Ababa, Ethiopia", "African Union HQ · Addis Ababa", 9.0005, 38.7426,
          "Central Ethiopian Highlands in the Horn of Africa",
          "Chosen when the Organization of African Unity formed in 1963, Addis Ababa (9.00°N, 38.74°E) anchors African continental diplomacy.", -0.45, regions=["ET", "GLOBAL"], glyph="scales"),
        g(8, "soc_academia_economics", "soc_economists_thinkers", "Universities, Economics & Social Thought", "Economists & Social Theorists",
          "globe_soc_bretton_woods", "Locate the White Mountains resort hotel where 44 Allied nations met in July 1944 to create the International Monetary Fund (IMF) and World Bank.",
          "New Hampshire, USA", "Bretton Woods · White Mountains", 44.2591, -71.4408,
          "White Mountains of northern New England, northeastern U.S.",
          "At the Mount Washington Hotel in Bretton Woods, New Hampshire (44.26°N, 71.44°W), delegates designed the post-WWII global financial order.", 0.15, regions=["US", "GLOBAL"], glyph="scales"),
        g(8, "soc_nations_geopolitics", "soc_intl_orgs", "Sovereign Nations, Capitals & Currencies", "International Organizations & Agencies",
          "globe_soc_jakarta", "Pin the sprawling Java maritime capital that hosts the permanent Secretariat of ASEAN (Association of Southeast Asian Nations).",
          "Jakarta, Indonesia", "ASEAN Secretariat · Jakarta", -6.2397, 106.7989,
          "Northwestern coast of Java Island, Maritime Southeast Asia",
          "Jakarta (6.24°S, 106.80°E) has served as the headquarters of the 10-nation ASEAN Secretariat since 1976.", -0.55, regions=["ID", "GLOBAL"], glyph="scales"),
        g(8, "soc_academia_economics", "soc_universities", "Universities, Economics & Social Thought", "Historic & Research Universities Worldwide",
          "globe_soc_fez", "Drop your pin on the historic imperial Maghreb city where Fatima al-Fihri founded the University of al-Qarawiyyin in 859 CE — Earth's oldest continuously operating university.",
          "Fez, Morocco", "Al-Qarawiyyin · Fez, Morocco", 34.0647, -4.9734,
          "Inland valley between the Rif and Middle Atlas Mountains, North Africa",
          "Recognized by UNESCO as the world's oldest continuously operating higher-learning institution, al-Qarawiyyin opened in Fez in 859 CE (34.06°N, 4.97°W).", 0.2, regions=["MA", "GLOBAL"], glyph="scroll"),

        # --- DOMAIN 9: FOOD, CRAFT & DESIGN (8 Qs) ---
        g(9, "food_beverages_fermentation", "food_wines_spirits_drinks", "Wines, Spirits, Cocktails & Beverages", "World Wines, Cocktails, Teas & Spirits",
          "globe_food_champagne", "Pin the chalk-cellared historic wine region east of Paris — the ONLY geographical appellation legally entitled to bottle true sparkling Champagne.",
          "Reims, France", "Champagne Region · Reims, France", 49.2583, 4.0317,
          "Chalky vineyards of northeastern France east of the Île-de-France",
          "Centered on Reims and Épernay (49.26°N, 4.03°E), Champagne's cool climate and underground Roman chalk cellars yield the world's premier sparkling wine.", -0.85, regions=["FR", "GLOBAL"], glyph="compass"),
        g(9, "food_gastronomy", "food_world_dishes", "World Gastronomy, Dishes & Ingredients", "National Dishes, Soups, Pasta & Street Food",
          "globe_food_naples", "Drop your pin on the southern Italian bayfront city whose wood-fired 'Pizzaiuolo' craft of Neapolitan Margherita pizza earned UNESCO Intangible Heritage status.",
          "Naples, Italy", "Neapolitan Pizza · Naples, Italy", 40.8518, 14.2681,
          "Campania coast beneath Mount Vesuvius, southern Italy",
          "Using San Marzano tomatoes and buffalo mozzarella, Naples (40.85°N, 14.27°E) birthed modern pizza in the 18th and 19th centuries.", -1.1, regions=["IT", "GLOBAL"], glyph="compass"),
        g(9, "food_gastronomy", "food_cheeses_breads_desserts", "World Gastronomy, Dishes & Ingredients", "Cheeses, Breads, Pastries & Desserts",
          "globe_food_parma", "Locate the Emilia-Romagna culinary capital prized globally for aged Parmigiano Reggiano cheese wheels and Prosciutto ham.",
          "Parma, Italy", "Food Valley · Parma, Italy", 44.8015, 10.3279,
          "Po River valley of northern Italy between Milan and Bologna",
          "Parma and neighboring Modena in Emilia-Romagna (44.80°N, 10.33°E) form Italy's famed Food Valley of DOP cheeses, cured meats, and balsamic vinegar.", -0.45, regions=["IT", "GLOBAL"], glyph="compass"),
        g(9, "food_beverages_fermentation", "food_wines_spirits_drinks", "Wines, Spirits, Cocktails & Beverages", "World Wines, Cocktails, Teas & Spirits",
          "globe_food_tequila", "Pin the western volcanic highland valley where blue Weber agave fields are roasted and distilled into appellation-protected Tequila.",
          "Jalisco, Mexico", "Tequila Valley · Jalisco, Mexico", 20.8819, -103.8356,
          "Western volcanic highlands northwest of Guadalajara, Mesoamerica",
          "Beneath the dormant Tequila Volcano in Jalisco (20.88°N, 103.84°W), UNESCO-listed blue agave landscapes produce Mexico's signature spirit.", -0.7, regions=["MX", "GLOBAL"], glyph="compass"),
        g(9, "food_beverages_fermentation", "food_wines_spirits_drinks", "Wines, Spirits, Cocktails & Beverages", "World Wines, Cocktails, Teas & Spirits",
          "globe_food_darjeeling", "Drop your pin on the misty Himalayan foothills of West Bengal where high-altitude terraced estates harvest the 'Champagne of Teas'.",
          "Darjeeling, India", "Darjeeling Tea Gardens · India", 27.0410, 88.2663,
          "Eastern Himalayan foothills beneath Kangchenjunga, South Asia",
          "Perched above 2,000 meters in northern West Bengal (27.04°N, 88.27°E), Darjeeling's first-flush muscatel teas became India's first GI-protected product.", -0.35, regions=["IN", "GLOBAL"], glyph="compass"),
        g(9, "food_heritage_brands", "food_luxury_brands", "Heritage Houses, Horology & Luxury Brands", "Horology, Fashion Houses & Heritage Brands",
          "globe_food_joux", "Locate the snowbound Jura mountain valley north of Lake Geneva — cradle of Audemars Piguet, Jaeger-LeCoultre, and Blancpain Haute Horlogerie.",
          "Vallée de Joux, Switzerland", "Watch Valley · Jura, Switzerland", 46.6056, 6.2244,
          "High Jura Mountain valley northwest of Lake Léman, Central Europe",
          "During long 18th-century winters, farmers in Switzerland's Vallée de Joux (46.61°N, 6.22°E) perfected complicated minute repeaters and perpetual calendars.", 0.3, regions=["CH", "GLOBAL"], glyph="gear"),
        g(9, "food_craft_artisans", "food_master_artisans", "Master Artisans, Chefs & Musical Craft", "Fashion, Industrial & Graphic Designers",
          "globe_food_murano", "Pin the Adriatic island chain where Renaissance doges relocated all glassblowing furnaces in 1291 both to prevent fires and guard crystalline Murano glass secrets.",
          "Venice Lagoon, Italy", "Murano Glass Island · Venice", 45.4586, 12.3568,
          "Northeastern Adriatic lagoon of Veneto, southern Europe",
          "Just north of Venice's main islands (45.46°N, 12.36°E), Murano's master glassblowers have kept Venetian millefiori and cristallo glassmaking alive for over 730 years.", -0.6, regions=["IT", "GLOBAL"], glyph="compass"),
        g(9, "food_beverages_fermentation", "food_wines_spirits_drinks", "Wines, Spirits, Cocktails & Beverages", "World Wines, Cocktails, Teas & Spirits",
          "globe_food_kaffa", "Drop your pin on the lush southwestern Horn of Africa cloud forests — ancestral botanical birthplace of Coffea arabica and legend of the dancing goats.",
          "Kaffa Highlands, Ethiopia", "Coffee Birthplace · Ethiopia", 7.6734, 36.8344,
          "Southwestern highland cloud forests of the Horn of Africa",
          "Wild Coffea arabica originated in Ethiopia's southwestern Kaffa forests (7.67°N, 36.83°E) before spreading across Yemen and the entire world.", -0.2, regions=["ET", "GLOBAL"], glyph="compass"),

        # --- DOMAINS 10 & 11: MYTH, LITERATURE & LOGIC (6 Qs) ---
        g(10, "myth_pantheons_folklore", "myth_greek_roman", "Classical Mythology, Deities & Legends", "Greek & Roman Mythology",
          "globe_myth_olympus", "Pin the towering 2,917-meter Aegean massif overlooking the Thermaic Gulf — fabled cloud-shrouded throne of Zeus and the Twelve Olympian gods.",
          "Mount Olympus, Greece", "Mount Olympus · Thessaly, Greece", 40.0856, 22.3586,
          "Northern Aegean coastline between Thessaly and Macedonia",
          "Rising steeply from the Aegean near 40.09°N, 22.36°E, Mount Olympus's misty Mytikas summit inspired ancient Greece's celestial pantheon.", -0.9, regions=["GR", "GLOBAL"], glyph="scroll"),
        g(10, "myth_poets_philosophers", "myth_poets_playwrights", "Poetry, Drama & Philosophy", "Poets & Dramatists",
          "globe_myth_stratford", "Drop your pin on the Warwickshire market town where William Shakespeare was born in 1564 and rests inside Holy Trinity Church.",
          "Stratford-upon-Avon, UK", "Shakespeare's Birthplace · England", 52.1917, -1.7083,
          "West Midlands heart of England northwest of Oxford",
          "William Shakespeare was baptized in Stratford-upon-Avon (52.19°N, 1.71°W) in April 1564; today it hosts the Royal Shakespeare Company.", -0.7, regions=["GB", "GLOBAL"], glyph="scroll"),
        g(10, "myth_world_literature", "myth_classic_modern_works", "World Literature, Novels & Classics", "Classic & Modern Novels, Plays & Epics",
          "globe_myth_alexandria", "Locate the Mediterranean Nile Delta port founded in 331 BCE that housed both the ancient Pharos Lighthouse and antiquity's legendary Great Library.",
          "Alexandria, Egypt", "Library of Alexandria · Egypt", 31.2089, 29.9092,
          "Western edge of the Nile Delta on Egypt's Mediterranean shore",
          "Founded by Alexander the Great in 331 BCE (31.21°N, 29.91°E), Alexandria hosted Eratosthenes, Euclid, and hundreds of thousands of papyrus scrolls.", -0.95, regions=["EG", "GLOBAL"], glyph="scroll"),
        g(10, "myth_world_literature", "myth_classic_modern_works", "World Literature, Novels & Classics", "Classic & Modern Novels, Plays & Epics",
          "globe_myth_troy", "Pin the northwestern Anatolian mound of Hisarlik beside the Dardanelles — the multi-layered Bronze Age citadel immortalized in Homer's Iliad.",
          "Çanakkale, Turkey", "Ancient Troy · Hisarlik, Turkey", 39.9575, 26.2389,
          "Northwestern Anatolian coast guarding the Dardanelles mouth",
          "Excavated in the 1870s by Heinrich Schliemann near the Dardanelles (39.96°N, 26.24°E), Hisarlik preserves nine stacked Bronze Age layers of Troy.", -0.5, regions=["TR", "GLOBAL"], glyph="scroll"),
        g(11, "logic_puzzles_cryptography", "logic_mathematicians", "Ciphers, Number Bases & Mathematicians", "Great Mathematicians, Logicians & Cryptographers",
          "globe_logic_konigsberg", "Drop your pin on the Baltic port once called Königsberg — where Leonhard Euler's 1736 Seven Bridges puzzle founded modern graph theory and topology.",
          "Kaliningrad, Russia", "Historic Königsberg · Baltic Coast", 54.7104, 20.4522,
          "Southeastern Baltic Sea exclave between Poland and Lithuania",
          "Euler's 1736 analysis of the Pregel River's seven bridges in Königsberg (modern Kaliningrad, 54.71°N, 20.45°E) birthed graph theory.", 0.25, regions=["RU", "GLOBAL"], glyph="prism"),
        g(11, "logic_puzzles_cryptography", "logic_mathematicians", "Ciphers, Number Bases & Mathematicians", "Great Mathematicians, Logicians & Cryptographers",
          "globe_logic_baghdad", "Locate the Tigris River Abbasid capital whose 9th-century House of Wisdom saw al-Khwarizmi write the foundational treatise that gave the world the words 'algebra' and 'algorithm'.",
          "Baghdad, Iraq", "House of Wisdom · Baghdad, Iraq", 33.3152, 44.3661,
          "Mesopotamian Tigris River plain in Western Asia",
          "Founded as the Round City in 762 CE along the Tigris (33.32°N, 44.37°E), Baghdad's Bayt al-Hikma was the apex of Golden Age mathematics.", -0.6, regions=["IQ", "GLOBAL"], glyph="prism"),
    ]


# ============================================================================
# GENERATOR & EXHAUSTIVE VERIFIER (XML + ZERO-SPOILER + QID + COPY HYGIENE)
# ============================================================================

QID_BASE = 1_070_001
QID_MAX = 1_079_999

LEAK_STOPWORDS: Set[str] = {
    "the", "of", "and", "in", "to", "for", "on", "at", "by", "with", "from", "as", "an", "or",
    "city", "river", "lake", "mount", "sea", "ocean", "island", "islands", "park", "national",
    "state", "states", "united", "usa", "uk", "region", "valley", "bay", "strait", "cape",
    "desert", "forest", "field", "stadium", "arena", "ballpark", "center", "centre", "grounds",
    "order", "theory", "theorem", "gate", "strip", "major", "minor", "first", "second", "third",
    "great", "grand", "new", "old", "north", "south", "east", "west", "central", "upper", "lower",
    "building", "supply", "co", "rep", "dom", "alps", "plains", "basin", "coast", "peninsula",
    "highlands", "plateau", "isthmus", "canal", "falls", "lagoon", "arch", "tower", "bridge",
    "house", "temple", "palace", "castle", "museum", "dome", "battle", "war", "dynasty", "empire",
    "double", "helix", "triad", "fifths", "circle", "sequence", "architecture", "escapement",
    "receptors", "enzymes", "hitters", "pull", "left", "right", "handed", "original", "red",
    "white", "green", "blue", "black", "gold", "golden", "giant", "perfect", "swiss", "lever",
    "classic", "modern", "ancient", "world", "international", "american", "british", "french",
    "german", "italian", "spanish", "russian", "chinese", "japanese", "indian", "canadian",
    "australian", "mexican", "brazilian", "korean", "dutch", "greek", "egyptian", "african",
    "european", "asian", "latin", "pacific", "atlantic", "mediterranean", "caribbean", "polar",
    "northern", "southern", "eastern", "western", "miles", "feet", "meters", "level", "above",
    "marks", "exactly", "water", "floor", "hidden", "holes", "rain", "wind", "iron", "work",
    "height", "nature", "single", "loop", "twice", "long", "full", "twists", "band", "broader",
    "hoist", "friction", "wear", "steel", "shell", "sphere", "five", "two", "one", "three",
    "four", "seven", "nine", "ten",
}

SHARD_STOPWORDS: Set[str] = {
    "united", "states", "kingdom", "republic", "empire", "north", "south", "saint", "mount",
    "river", "island", "islands", "great", "national", "international", "world", "first",
    "second", "third", "street", "avenue", "square", "bridge", "palace", "castle", "museum",
    "temple", "church", "cathedral", "mosque", "observatory", "telescope", "station", "railway",
    "airport", "university", "college", "institute", "academy", "society", "council", "nations",
    "league", "province", "region", "county", "district", "dynasty", "battle", "treaty", "crisis",
    "revolution", "system", "effect", "theorem", "number", "constant", "formula", "principle",
    "protocol", "language", "software", "network", "london",
}

RE_YEAR_COMMA = re.compile(
    r"\b(?:in|from|until|since|by|before|after|between|around|circa|c\.|born|died|founded|opened|"
    r"closed|established|inducted|elected|signed|built|released|published|premiered|debuted|won|"
    r"season|series|world\s+series|olympics|year|january|february|march|april|may|june|july|"
    r"august|september|october|november|december|ad|bc|ce|bce)\s+([12]),(\d{3})\b",
    re.IGNORECASE,
)
RE_YEAR_COMMA_SUFFIX = re.compile(
    r"\b([12]),(\d{3})\s*(?:CE|BCE|AD|BC|season|World\s+Series|Olympics|treaty)\b",
    re.IGNORECASE,
)
RE_YEAR_COMMA_PAREN = re.compile(r"\((?:(?:b\.|d\.|c\.|opened|founded)\s*)?([12]),(\d{3})\)", re.IGNORECASE)
RE_CITY_DOT_STATE = re.compile(r"\b([A-Z][a-zA-Z'-]{2,})\.\s+([A-Z]{2})(?=[?!,)\s]|$)")
US_CA_STATES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
    "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
    "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV",
    "WI", "WY", "DC", "ON", "QC", "BC", "AB",
}
RE_LATEX = re.compile(r"[_^]\{[^}]+\}")
RE_HTML_ENT = re.compile(r"&(?:quot|amp|apos|lt|gt|nbsp|ndash|mdash);|&#\d+;", re.IGNORECASE)
RE_DOUBLE_SPACE = re.compile(r" {2,}")
RE_DOUBLE_WORD = re.compile(r"\b(the|in|of|is|to|at|for|on|with|from|by|was|were|are|a|an)\s+\1\b", re.IGNORECASE)
RE_UNRESOLVED = re.compile(r"\{[a-zA-Z_][a-zA-Z0-9_]{1,}\}|\bundefined\b|\bNaN\b")
RE_A_VOWEL = re.compile(r"(?<![A-Za-z0-9_'-])\b([Aa])\s+([AEIOUaeiou][a-zA-Z-]{2,})\b")
RE_A_VOWEL_EXC = re.compile(r"^(?:uni|use|usu|utens|util|uro|uran|uter|utah|ugand|ukrain|uruguay|eup|eur|euk|eul|euth|eugl|one|once|ouija|ufo|usa|usb|url|uber|utopi|ukulel|unanim|ubiquit|unicorn|uniform|union|uniqu|unit|univers|usurp|ewe|one-|u-|and|or|are|is|in|on|at|of|as|if|up|out|off|into|over|under|after|about|against|along|among|around|across)", re.IGNORECASE)
RE_AN_CONS = re.compile(r"(?<![A-Za-z0-9_'-])\b([Aa]n)\s+([BCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz][a-zA-Z-]{2,})\b")
RE_AN_CONS_EXC = re.compile(r"^(?:hour|honest|honor|honour|heir|heiress|herb|homage|hors|mri|mlb|mls|mvp|mma|mba|mph|mtv|mit|mgm|ngo|nba|nfl|nhl|ncaa|npr|nsa|fbi|fda|fcc|fifa|fps|html|http|https|hbo|hiv|sql|svg|sms|ssd|suv|snl|sec|x-ray|led|lcd|lsd|rpg|rpm|rna|rsa|nfc|nrl|nbl|nra|fha|faa|fema|fdr|jfk|lbj|mlk|nasdaq|nato|noaa|norad|n-type|l-shape|s-curve|f-stop|h-bomb|m-theory|r-value|x-axis|s-wave|p-wave)", re.IGNORECASE)


def _singular_stem(tok: str) -> str:
    if len(tok) > 5 and tok.endswith("ies"):
        return tok[:-3] + "y"
    if len(tok) > 5 and tok.endswith("es"):
        return tok[:-2]
    if len(tok) > 4 and tok.endswith("s") and not tok.endswith("ss"):
        return tok[:-1]
    return tok


def _has_word_stem(hay_low: str, stem: str) -> bool:
    idx = hay_low.find(stem)
    while idx != -1:
        before_ok = idx == 0 or not hay_low[idx - 1].isalnum()
        if before_ok:
            tail = hay_low[idx + len(stem) : idx + len(stem) + 3]
            if tail == "" or re.match(r"^[^a-z0-9]|^(?:s|es|ed|er|y)(?:[^a-z0-9]|$)", tail):
                return True
        idx = hay_low.find(stem, idx + 1)
    return False


def generate_all() -> Tuple[int, Dict[str, Any]]:
    VISUALS_DIR.mkdir(parents=True, exist_ok=True)
    svg_manifest: List[Dict[str, Any]] = []

    # 1. Generate all 20 MLB Ballpark SVGs
    for spec in BALLPARK_SPECS:
        slug = spec["slug"]
        svg_text = render_ballpark_svg(spec)
        out_path = VISUALS_DIR / f"{slug}.svg"
        out_path.write_text(svg_text, encoding="utf-8", newline="\n")
        svg_manifest.append({
            "slug": slug,
            "plateCode": spec["plate_code"],
            "group": "MLB_BALLPARK",
            "imageUrl": f"./assets/visuals/{slug}.svg",
            "bytes": len(svg_text.encode("utf-8")),
        })

    # 2. Generate all 44 Multi-Domain SVGs
    for slug, fn in MULTI_DOMAIN_SVG_RENDERERS.items():
        svg_text = fn()
        out_path = VISUALS_DIR / f"{slug}.svg"
        out_path.write_text(svg_text, encoding="utf-8", newline="\n")
        group = slug.split("_")[0].upper()
        svg_manifest.append({
            "slug": slug,
            "group": group,
            "imageUrl": f"./assets/visuals/{slug}.svg",
            "bytes": len(svg_text.encode("utf-8")),
        })

    # 3. Assemble all 340 questions in collision-free QID band 1,070,001..1,070,340
    all_questions: List[Dict[str, Any]] = []
    all_questions.extend(build_baseball_visual_questions())
    all_questions.extend(build_multidomain_visual_questions())
    all_questions.extend(build_baseball_globe_questions())
    all_questions.extend(build_multidomain_globe_questions())

    for idx, q in enumerate(all_questions):
        q["qid"] = QID_BASE + idx

    by_domain: Dict[str, int] = {}
    by_arch: Dict[str, int] = {}
    bb_visual = 0
    bb_globe = 0
    for q in all_questions:
        dk = str(q["l0Domain"])
        by_domain[dk] = by_domain.get(dk, 0) + 1
        ak = str(q["archetype"])
        by_arch[ak] = by_arch.get(ak, 0) + 1
        if q["l0Domain"] == 5 and q.get("l2Subcategory") == "Baseball":
            if ak == "GLOBE_PIN_DROP":
                bb_globe += 1
            else:
                bb_visual += 1

    bundle: Dict[str, Any] = {
        "schemaVersion": "WS_VISUAL_GLOBE_V1",
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "qidRange": [QID_BASE, QID_BASE + len(all_questions) - 1],
        "totalCount": len(all_questions),
        "totalQuestions": len(all_questions),
        "counts": {
            "svgPlates": len(svg_manifest),
            "baseballSvgPlates": len(BALLPARK_SPECS),
            "multiDomainSvgPlates": len(MULTI_DOMAIN_SVG_RENDERERS),
            "byArchetype": by_arch,
            "byDomain": dict(sorted(by_domain.items(), key=lambda kv: int(kv[0]))),
            "baseballVisualBlueprints": bb_visual,
            "baseballGlobePinDrops": bb_globe,
        },
        "svgManifest": svg_manifest,
        "questions": all_questions,
    }

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    return len(svg_manifest), bundle


def _check_copy(errors: List[str], ctx: str, text: str) -> None:
    if not text:
        return
    if RE_YEAR_COMMA.search(text) or RE_YEAR_COMMA_SUFFIX.search(text) or RE_YEAR_COMMA_PAREN.search(text):
        errors.append(f"[YEAR_COMMA] {ctx}: {text[:120]}")
    for m in RE_CITY_DOT_STATE.finditer(text):
        if m.group(2) in US_CA_STATES and m.group(1).lower() not in {"st", "mt", "ft", "dr", "mr", "jr", "sr"}:
            errors.append(f"[CITY_DOT_STATE] {ctx}: {m.group(0)} in {text[:120]}")
    if RE_LATEX.search(text):
        errors.append(f"[RAW_LATEX] {ctx}: {text[:120]}")
    if RE_HTML_ENT.search(text):
        errors.append(f"[HTML_ENTITY] {ctx}: {text[:120]}")
    if RE_DOUBLE_SPACE.search(text):
        errors.append(f"[DOUBLE_SPACE] {ctx}: {text[:120]}")
    if RE_DOUBLE_WORD.search(text):
        errors.append(f"[DOUBLE_WORD] {ctx}: {text[:120]}")
    if RE_UNRESOLVED.search(text):
        errors.append(f"[UNRESOLVED_TPL] {ctx}: {text[:120]}")
    for m in RE_A_VOWEL.finditer(text):
        w = m.group(2)
        if not RE_A_VOWEL_EXC.match(w) and not re.match(r"^U[A-Z]+$", w):
            errors.append(f"[A_VOWEL] {ctx}: '{m.group(0)}' in {text[:120]}")
    for m in RE_AN_CONS.finditer(text):
        w = m.group(2)
        if not RE_AN_CONS_EXC.match(w) and not re.match(r"^[FHLMNRSX][A-Z0-9-]+$", w):
            errors.append(f"[AN_CONSONANT] {ctx}: '{m.group(0)}' in {text[:120]}")


def verify_all() -> int:
    errors: List[str] = []
    if not OUTPUT_JSON.exists():
        print(f"ERROR: Missing {OUTPUT_JSON}", file=sys.stderr)
        return 1

    bundle = json.loads(OUTPUT_JSON.read_text(encoding="utf-8"))
    questions: List[Dict[str, Any]] = bundle.get("questions", [])

    # 1. Verify all SVG files exist & parse cleanly as strict XML with zero external refs
    svg_files = sorted(VISUALS_DIR.glob("*.svg"))
    if len(svg_files) < 60:
        errors.append(f"[SVG_COUNT] Expected >= 60 SVGs, found {len(svg_files)}")

    svg_text_by_rel: Dict[str, str] = {}
    for sf in svg_files:
        raw_xml = sf.read_text(encoding="utf-8")
        if "http://" in raw_xml.lower() or "https://" in raw_xml.lower():
            # Allow only exact xmlns="http://www.w3.org/2000/svg"
            stripped_ns = raw_xml.replace('xmlns="http://www.w3.org/2000/svg"', "")
            if "http://" in stripped_ns.lower() or "https://" in stripped_ns.lower():
                errors.append(f"[SVG_EXTERNAL_REF] {sf.name} contains external URL")
        for forbidden in ("<image", "<script", "<foreignobject", "@import"):
            if forbidden in raw_xml.lower():
                errors.append(f"[SVG_FORBIDDEN_TAG] {sf.name} contains {forbidden}")
        try:
            root = ET.fromstring(raw_xml)
        except ET.ParseError as exc:
            errors.append(f"[SVG_XML_INVALID] {sf.name}: {exc}")
            continue
        if root.attrib.get("viewBox") != "0 0 480 300":
            errors.append(f"[SVG_VIEWBOX] {sf.name}: got {root.attrib.get('viewBox')}")
        if root.attrib.get("width") != "480" or root.attrib.get("height") != "300":
            errors.append(f"[SVG_DIMENSIONS] {sf.name}: expected explicit width=480 height=300 for WebGL TextureLoader")
        text_chunks: List[str] = []
        for elem in root.iter():
            tag = elem.tag.split("}")[-1].lower()
            if tag in ("text", "tspan", "title", "desc"):
                if elem.text:
                    text_chunks.append(elem.text)
                if elem.tail:
                    text_chunks.append(elem.tail)
        rel_key = f"./assets/visuals/{sf.name}"
        svg_text_by_rel[rel_key] = " ".join(text_chunks).lower()

    # 2. Check existing corpus QID bands to guarantee 0 collisions across the entire game!
    existing_ranges: List[Tuple[str, int, int]] = []
    manifest_p = ROOT / "public" / "data" / "shards" / "shard_manifest.json"
    if manifest_p.exists():
        m = json.loads(manifest_p.read_text(encoding="utf-8"))
        for d in m.get("domains", []):
            for f in d.get("files", []):
                existing_ranges.append((f["path"], int(f["baseQid"]), int(f["qidEnd"])))
    tax_p = ROOT / "public" / "data" / "shards" / "taxonomy_tree.json"
    if tax_p.exists():
        t = json.loads(tax_p.read_text(encoding="utf-8"))
        qr = t.get("qidRange")
        if qr:
            existing_ranges.append(("taxonomy_tree.json", int(qr[0]), int(qr[1])))

    # 3. Validate every single question
    seen_qids: Set[int] = set()
    seen_micro: Set[str] = set()
    visual_count = 0
    globe_count = 0
    bb_globe_count = 0
    bb_visual_count = 0

    for q in questions:
        qid = int(q.get("qid", -1))
        if not (QID_BASE <= qid <= QID_MAX):
            errors.append(f"[QID_RANGE] QID {qid} outside {QID_BASE}..{QID_MAX}")
        if qid in seen_qids:
            errors.append(f"[QID_DUP] Duplicate QID {qid}")
        seen_qids.add(qid)
        for src_name, lo, hi in existing_ranges:
            if lo <= qid <= hi:
                errors.append(f"[QID_COLLISION] QID {qid} collides with {src_name} [{lo}..{hi}]")

        micro = str(q.get("microTopicId", ""))
        if not micro or micro in seen_micro:
            errors.append(f"[MICRO_DUP] QID {qid} duplicate/empty microTopicId '{micro}'")
        seen_micro.add(micro)

        dom = q.get("l0Domain")
        if not isinstance(dom, int) or not (0 <= dom <= 11):
            errors.append(f"[DOMAIN] QID {qid} invalid l0Domain {dom}")

        arch = q.get("archetype")
        prompt = str(q.get("prompt", "")).strip()
        ans = str(q.get("answerCorrect", "")).strip()
        clues = q.get("clues", [])
        why = str(q.get("whyExplanation", "")).strip()
        dists = q.get("distractors", [])

        if not prompt or not ans:
            errors.append(f"[EMPTY_TEXT] QID {qid}")
            continue
        if len(clues) != 2 or not clues[0] or not clues[1]:
            errors.append(f"[CLUES] QID {qid} must have 2 non-empty clues")
        if not why:
            errors.append(f"[WHY] QID {qid} missing whyExplanation")

        # Copy hygiene across all text fields
        _check_copy(errors, f"Q{qid}.prompt", prompt)
        _check_copy(errors, f"Q{qid}.answer", ans)
        _check_copy(errors, f"Q{qid}.clue0", str(clues[0]) if len(clues) > 0 else "")
        _check_copy(errors, f"Q{qid}.clue1", str(clues[1]) if len(clues) > 1 else "")
        _check_copy(errors, f"Q{qid}.why", why)

        # Distractor uniqueness & hygiene
        dist_texts = [str(d.get("text", "")).strip() for d in dists]
        if len(dist_texts) != 3:
            errors.append(f"[DISTRACTOR_COUNT] QID {qid} has {len(dist_texts)} distractors")
        all_opts_low = [ans.lower()] + [dt.lower() for dt in dist_texts]
        if len(set(all_opts_low)) < len(all_opts_low):
            errors.append(f"[DUP_OPTIONS] QID {qid}: {all_opts_low}")
        for dt in dist_texts:
            _check_copy(errors, f"Q{qid}.dist", dt)
            if dt.lower() in {"", "unknown", "n/a", "none", "all of the above"}:
                errors.append(f"[JUNK_DIST] QID {qid}: '{dt}'")

        # Exact ShardDecoder.isCleanShardCandidate leak guards on prompt & clues!
        prompt_low = prompt.lower()
        ans_low = ans.lower()
        stripped_core = re.sub(r"^(?:the|a|an|republic of|kingdom of|state of|city of)\s+", "", ans_low).strip()

        if len(ans_low) >= 4 and ans_low in prompt_low:
            errors.append(f"[PROMPT_EXACT_LEAK] QID {qid}: ans='{ans}' in prompt='{prompt[:110]}'")
        elif len(stripped_core) >= 5 and stripped_core in prompt_low:
            errors.append(f"[PROMPT_CORE_LEAK] QID {qid}: core='{stripped_core}' in prompt='{prompt[:110]}'")

        # ShardDecoder line 880 longTokens (>= 6 chars) guard!
        long_tokens = [t for t in re.split(r"[\s-]+", stripped_core) if len(t) >= 6 and t not in SHARD_STOPWORDS]
        if long_tokens and all(tok in prompt_low for tok in long_tokens):
            errors.append(f"[PROMPT_LONGTOK_LEAK] QID {qid}: tokens={long_tokens} in prompt='{prompt[:110]}'")

        # Multi-token stem guard
        ans_tokens = [t for t in re.split(r"[^a-z0-9]+", stripped_core) if len(t) >= 4 and t not in LEAK_STOPWORDS]
        if len(ans_tokens) >= 2 and all(_has_word_stem(prompt_low, _singular_stem(t)) for t in ans_tokens):
            errors.append(f"[PROMPT_ALLTOK_LEAK] QID {qid}: tokens={ans_tokens} in prompt='{prompt[:110]}'")

        # Clues exact leak check
        for ci, cl in enumerate(clues):
            if len(ans_low) >= 4 and ans_low in str(cl).lower():
                errors.append(f"[CLUE_LEAK] QID {qid} clue[{ci}]: ans='{ans}' in '{cl}'")

        if arch == "SIGHTLINE_LOCK":
            visual_count += 1
            if dom == 5 and q.get("l2Subcategory") == "Baseball":
                bb_visual_count += 1
                if q.get("l1Category") != "Sports" or q.get("l1Id") != "sports":
                    errors.append(f"[BB_TAX] QID {qid} Baseball tags mismatch")
            vp = q.get("visualPlate")
            if not isinstance(vp, dict) or not vp.get("imageUrl"):
                errors.append(f"[VISUAL_PLATE_MISSING] QID {qid}")
                continue
            img_url = str(vp["imageUrl"])
            _check_copy(errors, f"Q{qid}.caption", str(vp.get("caption", "")))
            if img_url not in svg_text_by_rel:
                errors.append(f"[SVG_REF_MISSING] QID {qid} references missing {img_url}")
                continue
            svg_txt = svg_text_by_rel[img_url]
            # Strict ZERO-SPOILER check on SVG text nodes!
            if len(ans_low) >= 4 and ans_low in svg_txt:
                errors.append(f"[SVG_SPOILER_EXACT] QID {qid} ({img_url}): ans='{ans}' found in SVG text '{svg_txt}'")
            for tok in ans_tokens:
                if len(tok) >= 5 and _has_word_stem(svg_txt, _singular_stem(tok)):
                    errors.append(f"[SVG_SPOILER_TOKEN] QID {qid} ({img_url}): token='{tok}' (ans='{ans}') in SVG text '{svg_txt}'")

        elif arch == "GLOBE_PIN_DROP":
            globe_count += 1
            if dom == 5 and q.get("l2Subcategory") == "Baseball":
                bb_globe_count += 1
                if q.get("l1Category") != "Sports" or q.get("l1Id") != "sports":
                    errors.append(f"[BB_TAX] QID {qid} Baseball tags mismatch")
            gp = q.get("globePin")
            if not isinstance(gp, dict):
                errors.append(f"[GLOBE_PIN_MISSING] QID {qid}")
                continue
            lat = float(gp.get("targetLat", 999))
            lon = float(gp.get("targetLon", 999))
            if not (-90.0 <= lat <= 90.0) or not (-180.0 <= lon <= 180.0):
                errors.append(f"[COORD_BOUNDS] QID {qid}: ({lat}, {lon})")
            b_km = int(gp.get("bullseyeKm", 0))
            g_km = int(gp.get("goldKm", 0))
            gr_km = int(gp.get("grazeKm", 0))
            if not (250 <= b_km <= 350 and 900 <= g_km <= 1100 and 2000 <= gr_km <= 2400):
                errors.append(f"[GLOBE_RADII] QID {qid}: ({b_km}, {g_km}, {gr_km})")
            _check_copy(errors, f"Q{qid}.targetLabel", str(gp.get("targetLabel", "")))
            _check_copy(errors, f"Q{qid}.regionHint", str(gp.get("regionHint", "")))
            _check_copy(errors, f"Q{qid}.coordHint", str(gp.get("coordHint", "")))
            anchors = gp.get("quickAnchors", [])
            if len(anchors) != 4:
                errors.append(f"[ANCHOR_COUNT] QID {qid}: {len(anchors)}")
                continue
            near_target = 0
            far_decoys = 0
            anchor_labels: Set[str] = set()
            for a in anchors:
                albl = str(a.get("label", "")).strip()
                alat = float(a.get("lat", 999))
                alon = float(a.get("lon", 999))
                if not (-90.0 <= alat <= 90.0 and -180.0 <= alon <= 180.0):
                    errors.append(f"[ANCHOR_COORD] QID {qid}: {a}")
                anchor_labels.add(albl.lower())
                dist = haversine_km(lat, lon, alat, alon)
                if dist <= 5.0:
                    near_target += 1
                elif dist >= gr_km + 150.0:
                    far_decoys += 1
                else:
                    errors.append(f"[ANCHOR_TOO_CLOSE] QID {qid}: decoy '{albl}' only {dist:.0f} km from target (graze={gr_km})")
            if near_target != 1 or far_decoys != 3:
                errors.append(f"[ANCHOR_BALANCE] QID {qid}: near={near_target}, far={far_decoys}")
            if len(anchor_labels) != 4:
                errors.append(f"[ANCHOR_DUP_LABEL] QID {qid}: {anchor_labels}")
            # Ensure ZERO single-token distinctive place-name giveaway between prompt and correct anchor!
            globe_generic = {
                "usa", "city", "north", "south", "east", "west", "mount", "lake", "island", "islands",
                "sea", "coast", "basin", "valley", "plains", "highlands", "desert", "peninsula",
                "strait", "isthmus", "falls", "canal", "park", "new", "old", "cape", "grand", "great",
                "red", "centre", "asia", "africa", "europe", "america", "lagoon", "plateau", "alps",
                "rep", "dom", "uk", "nj", "nc", "dc", "sc", "al",
            }
            for tok in re.split(r"[^a-z]+", ans_low):
                if len(tok) >= 4 and tok not in globe_generic and _has_word_stem(prompt_low, tok):
                    errors.append(f"[GLOBE_ANCHOR_WORD_LEAK] QID {qid}: tok='{tok}' from '{ans}' in prompt='{prompt[:110]}'")
                    break
        else:
            errors.append(f"[UNKNOWN_ARCH] QID {qid}: {arch}")

    # 4. Aggregate count assertions
    if len(questions) < 320:
        errors.append(f"[TOTAL_COUNT] Expected >= 320 questions, got {len(questions)}")
    if visual_count < 160:
        errors.append(f"[VISUAL_COUNT] Expected >= 160 SIGHTLINE_LOCK visuals, got {visual_count}")
    if globe_count < 160:
        errors.append(f"[GLOBE_COUNT] Expected >= 160 GLOBE_PIN_DROP, got {globe_count}")
    if bb_globe_count < 35:
        errors.append(f"[BB_GLOBE_COUNT] Expected >= 35 Baseball GLOBE_PIN_DROP, got {bb_globe_count}")

    print("========================================================================")
    print("VISUAL SAPPHIRE BLUEPRINTS & 3D GLOBE PIN-DROP VERIFICATION REPORT")
    print("========================================================================")
    print(f"  SVG Blueprint Plates : {len(svg_files)} ({len(BALLPARK_SPECS)} MLB Ballparks + {len(MULTI_DOMAIN_SVG_RENDERERS)} Multi-Domain)")
    print(f"  Total Questions      : {len(questions)} (QIDs {min(seen_qids)}..{max(seen_qids)}, 0 collisions)")
    print(f"  Visual Blueprints    : {visual_count} ({bb_visual_count} Baseball + {visual_count - bb_visual_count} Multi-Domain)")
    print(f"  3D Globe Pin-Drops   : {globe_count} ({bb_globe_count} Baseball + {globe_count - bb_globe_count} Multi-Domain)")
    print(f"  Defects Found        : {len(errors)}")
    if errors:
        print("\nDEFECT DETAILS:")
        for e in errors[:60]:
            print(f"  - {e}")
        if len(errors) > 60:
            print(f"  ... and {len(errors) - 60} more")
        return 1
    print("  STATUS               : PASS (0 XML, 0 Spoiler, 0 Leak, 0 Year-Comma, 0 Coord Defects!)")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Build and verify Visual Blueprint SVGs and 3D Globe Pin-Drop pack")
    parser.add_argument("--verify", action="store_true", help="Verify generated SVGs and visual_globe_packs.json")
    parser.add_argument("--verify-only", action="store_true", help="Skip regeneration and only verify existing outputs")
    args = parser.parse_args()

    if not args.verify_only:
        svg_count, bundle = generate_all()
        print(f"Generated {svg_count} luxury blueprint SVGs in {VISUALS_DIR.relative_to(ROOT)}")
        print(f"Generated {bundle['totalCount']} verified questions in {OUTPUT_JSON.relative_to(ROOT)} (QIDs {bundle['qidRange'][0]}..{bundle['qidRange'][1]})")

    if args.verify or args.verify_only:
        return verify_all()
    return 0


if __name__ == "__main__":
    sys.exit(main())
