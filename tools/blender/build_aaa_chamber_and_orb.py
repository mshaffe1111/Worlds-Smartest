#!/usr/bin/env python3
"""
World's Smartest — AAA Hard-Surface, Haute Horlogerie & Architectural Set Pipeline (Blender 5.3.0)

Crafted in the aesthetic of The Room x Hitman x Swiss Haute Horlogerie / Faberge Tourbillon:
  - ZERO flat rectangular billboard boxes
  - ZERO bright neon-white Tron floor circles
  - ZERO chunky boxy sci-fi blocks
  - Smooth high-segment chamfered silhouettes, 96-segment armillary rings, doubly-curved
    Faberge obsidian-and-gold petals, fluted dark-slate columns, sculpted 3D Alpine peaks,
    veined dark marble & smoked walnut diplomatic furniture, and museum studio lighting.

Outputs (strict file ownership):
  1. godot/assets/aaa_models/vetting_chamber_room.glb   (+ assets/blender/aaa_vetting_chamber.blend)
  2. godot/assets/aaa_models/veritas_astrolabe_orb.glb  (+ assets/blender/aaa_veritas_orb.blend)
  3. godot/assets/aaa_models/codex_cryptex.glb
  4. godot/assets/aaa_models/calibrator_chronometer.glb
  5. assets/renders/aaa_veritas_orb_render.png          (1024x1024 Rembrandt studio render)
  6. assets/renders/aaa_chamber_render.png              (1280x720 interrogation table vista render)
  7. assets/renders/aaa_blender.log                     (sentinel completion log + GLB audit)
"""

import json
import math
import struct
import time
import traceback
from pathlib import Path

import bpy
import bmesh
from mathutils import Euler, Matrix, Vector

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_PATH = Path(__file__).resolve()
PROJECT_ROOT = SCRIPT_PATH.parents[2]

BLEND_DIR = PROJECT_ROOT / "assets" / "blender"
RENDER_DIR = PROJECT_ROOT / "assets" / "renders"
GODOT_AAA_DIR = PROJECT_ROOT / "godot" / "assets" / "aaa_models"

CHAMBER_BLEND = BLEND_DIR / "aaa_vetting_chamber.blend"
ORB_BLEND = BLEND_DIR / "aaa_veritas_orb.blend"

CHAMBER_GLB = GODOT_AAA_DIR / "vetting_chamber_room.glb"
ORB_GLB = GODOT_AAA_DIR / "veritas_astrolabe_orb.glb"
CRYPTEX_GLB = GODOT_AAA_DIR / "codex_cryptex.glb"
CHRONO_GLB = GODOT_AAA_DIR / "calibrator_chronometer.glb"

ORB_RENDER_PNG = RENDER_DIR / "aaa_veritas_orb_render.png"
CHAMBER_RENDER_PNG = RENDER_DIR / "aaa_chamber_render.png"
LOG_FILE = RENDER_DIR / "aaa_blender.log"

for _d in (BLEND_DIR, RENDER_DIR, GODOT_AAA_DIR):
    _d.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Color & Deterministic Procedural Noise Utilities
# ---------------------------------------------------------------------------
def srgb_to_linear(c: float) -> float:
    c = max(0.0, min(1.0, c))
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def hex_rgba(hex_str: str, alpha: float = 1.0):
    h = hex_str.lstrip("#")
    return (
        srgb_to_linear(int(h[0:2], 16) / 255.0),
        srgb_to_linear(int(h[2:4], 16) / 255.0),
        srgb_to_linear(int(h[4:6], 16) / 255.0),
        alpha,
    )


def clamp(v: float, lo: float = 0.0, hi: float = 1.0) -> float:
    return lo if v < lo else (hi if v > hi else v)


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def smoothstep(edge0: float, edge1: float, x: float) -> float:
    if edge1 == edge0:
        return 0.0
    t = clamp((x - edge0) / (edge1 - edge0))
    return t * t * (3.0 - 2.0 * t)


def hash2(ix: int, iy: int, seed: int = 0) -> float:
    n = (ix * 374761393 + iy * 668265263 + seed * 1442695041) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    n = n ^ (n >> 16)
    return (n & 0xFFFFFF) / float(0x1000000)


def value_noise_2d(x: float, y: float, seed: int = 0, period_x: int = 0, period_y: int = 0) -> float:
    ix = math.floor(x)
    iy = math.floor(y)
    fx = x - ix
    fy = y - iy
    ux = fx * fx * (3.0 - 2.0 * fx)
    uy = fy * fy * (3.0 - 2.0 * fy)

    ix0, ix1 = ix, ix + 1
    iy0, iy1 = iy, iy + 1
    if period_x > 0:
        ix0 %= period_x
        ix1 %= period_x
    if period_y > 0:
        iy0 %= period_y
        iy1 %= period_y

    a = hash2(ix0, iy0, seed)
    b = hash2(ix1, iy0, seed)
    c = hash2(ix0, iy1, seed)
    d = hash2(ix1, iy1, seed)
    return lerp(lerp(a, b, ux), lerp(c, d, ux), uy)


def fbm_2d(x: float, y: float, octaves: int = 4, seed: int = 0, period: int = 0) -> float:
    val = 0.0
    amp = 0.5
    freq = 1.0
    norm = 0.0
    for i in range(octaves):
        p = int(period * freq) if period > 0 else 0
        val += amp * value_noise_2d(x * freq, y * freq, seed + i * 31, p, p)
        norm += amp
        amp *= 0.5
        freq *= 2.0
    return val / norm if norm > 0 else 0.0


def ridged_2d(x: float, y: float, octaves: int = 5, seed: int = 17) -> float:
    val = 0.0
    amp = 0.52
    freq = 1.0
    weight = 1.0
    norm = 0.0
    for i in range(octaves):
        n = value_noise_2d(x * freq, y * freq, seed + i * 53)
        r = 1.0 - abs(2.0 * n - 1.0)
        r = r * r * weight
        weight = clamp(r * 1.45, 0.25, 1.0)
        val += r * amp
        norm += amp
        amp *= 0.50
        freq *= 2.08
    return val / norm if norm > 0 else 0.0


# ---------------------------------------------------------------------------
# Crisp Luxury Procedural PBR Texture Generators (Zero Speckle, Packed Cleanly)
# ---------------------------------------------------------------------------
def make_image_from_rgb(name: str, width: int, height: int, pixels_rgba, colorspace: str = "sRGB"):
    img = bpy.data.images.new(name=name, width=width, height=height, alpha=False, float_buffer=False)
    try:
        img.colorspace_settings.name = colorspace
    except Exception:
        pass
    img.pixels.foreach_set(pixels_rgba)
    img.pack()
    return img


def gen_dark_veined_marble_textures(prefix: str = "Tex_NeroMarble", size: int = 256):
    """Generates luxury honed Nero Marquina dark marble albedo + subtle roughness map."""
    albedo = [0.0] * (size * size * 4)
    rough = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        v = y / size
        for x in range(size):
            u = x / size
            # Tileable domain-warped diagonal mineral veins
            w1 = fbm_2d(u * 4.0, v * 4.0, octaves=4, seed=11, period=4)
            w2 = fbm_2d(u * 8.0 + 1.3, v * 8.0 + 2.7, octaves=3, seed=29, period=8)
            phase = (u * 2.0 + v * 1.0) * math.tau + (w1 - 0.5) * 6.5 + (w2 - 0.5) * 2.2
            vein_primary = pow(clamp(1.0 - abs(math.sin(phase)), 0.0, 1.0), 14.0)
            phase2 = (u * 1.0 - v * 3.0) * math.tau + (w2 - 0.5) * 5.2
            vein_fine = pow(clamp(1.0 - abs(math.sin(phase2)), 0.0, 1.0), 22.0) * 0.65

            cloud = fbm_2d(u * 6.0, v * 6.0, octaves=3, seed=7, period=6)
            # Deep charcoal-obsidian stone base (#0D1017 .. #181D27) with warm ivory/champagne veins
            br = lerp(0.055, 0.098, cloud)
            bg = lerp(0.064, 0.110, cloud)
            bb = lerp(0.085, 0.142, cloud)

            vein = clamp(vein_primary * 0.85 + vein_fine * 0.55, 0.0, 1.0)
            # Warm champagne-ivory mineral vein color
            vr, vg, vb = 0.68, 0.61, 0.49
            r = lerp(br, vr, vein * 0.62)
            g = lerp(bg, vg, vein * 0.62)
            b = lerp(bb, vb, vein * 0.62)

            albedo[idx] = clamp(r)
            albedo[idx + 1] = clamp(g)
            albedo[idx + 2] = clamp(b)
            albedo[idx + 3] = 1.0

            rv = clamp(0.15 + cloud * 0.09 + vein * 0.11, 0.10, 0.36)
            rough[idx] = rv
            rough[idx + 1] = rv
            rough[idx + 2] = rv
            rough[idx + 3] = 1.0
            idx += 4

    img_col = make_image_from_rgb(f"{prefix}_COL", size, size, albedo, "sRGB")
    img_rgh = make_image_from_rgb(f"{prefix}_RGH", size, size, rough, "Non-Color")
    return img_col, img_rgh


def gen_smoked_walnut_textures(prefix: str = "Tex_SmokedWalnut", size: int = 256):
    """Generates rich luxury dark smoked walnut woodgrain albedo + satin roughness map."""
    albedo = [0.0] * (size * size * 4)
    rough = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        v = y / size
        for x in range(size):
            u = x / size
            warp = fbm_2d(u * 2.0, v * 8.0, octaves=3, seed=41, period=2)
            streak = fbm_2d(u * 16.0, v * 2.0, octaves=3, seed=67, period=2)
            rings = 0.5 + 0.5 * math.sin((u * 10.0 + warp * 1.9) * math.tau)
            grain = clamp(rings * 0.65 + streak * 0.35, 0.0, 1.0)

            # Deep espresso-smoked walnut (#1E130C .. #3D2618)
            r = lerp(0.10, 0.24, grain)
            g = lerp(0.062, 0.145, grain)
            b = lerp(0.040, 0.092, grain)

            albedo[idx] = r
            albedo[idx + 1] = g
            albedo[idx + 2] = b
            albedo[idx + 3] = 1.0

            rv = clamp(0.24 + (1.0 - grain) * 0.16, 0.20, 0.44)
            rough[idx] = rv
            rough[idx + 1] = rv
            rough[idx + 2] = rv
            rough[idx + 3] = 1.0
            idx += 4

    return (
        make_image_from_rgb(f"{prefix}_COL", size, size, albedo, "sRGB"),
        make_image_from_rgb(f"{prefix}_RGH", size, size, rough, "Non-Color"),
    )


def gen_honed_granite_textures(prefix: str = "Tex_HonedGranite", size: int = 256):
    """Generates dark architectural honed granite/obsidian floor tile albedo + roughness."""
    albedo = [0.0] * (size * size * 4)
    rough = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        v = y / size
        for x in range(size):
            u = x / size
            n_broad = fbm_2d(u * 4.0, v * 4.0, octaves=4, seed=91, period=4)
            n_fine = fbm_2d(u * 16.0, v * 16.0, octaves=2, seed=103, period=16)

            # Subtle large-format 1m x 1m architectural honed stone seam
            edge_u = min(u, 1.0 - u)
            edge_v = min(v, 1.0 - v)
            seam = 1.0 - smoothstep(0.004, 0.012, min(edge_u, edge_v))

            tone = clamp(n_broad * 0.72 + n_fine * 0.28, 0.0, 1.0)
            r = lerp(0.055, 0.105, tone) * (1.0 - seam * 0.45)
            g = lerp(0.062, 0.114, tone) * (1.0 - seam * 0.45)
            b = lerp(0.076, 0.132, tone) * (1.0 - seam * 0.45)

            albedo[idx] = r
            albedo[idx + 1] = g
            albedo[idx + 2] = b
            albedo[idx + 3] = 1.0

            rv = clamp(0.24 + n_broad * 0.14 + seam * 0.35, 0.20, 0.68)
            rough[idx] = rv
            rough[idx + 1] = rv
            rough[idx + 2] = rv
            rough[idx + 3] = 1.0
            idx += 4

    return (
        make_image_from_rgb(f"{prefix}_COL", size, size, albedo, "sRGB"),
        make_image_from_rgb(f"{prefix}_RGH", size, size, rough, "Non-Color"),
    )


def gen_alpine_slate_textures(prefix: str = "Tex_AlpineSlate", size: int = 256):
    """Generates monumental dark Alpine architectural slate texture for columns & coffers."""
    albedo = [0.0] * (size * size * 4)
    rough = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        v = y / size
        for x in range(size):
            u = x / size
            strata = fbm_2d(u * 4.0, v * 12.0, octaves=4, seed=131, period=4)
            grain = fbm_2d(u * 12.0, v * 12.0, octaves=3, seed=149, period=12)
            t = clamp(strata * 0.68 + grain * 0.32, 0.0, 1.0)

            r = lerp(0.075, 0.145, t)
            g = lerp(0.085, 0.158, t)
            b = lerp(0.102, 0.184, t)

            albedo[idx] = r
            albedo[idx + 1] = g
            albedo[idx + 2] = b
            albedo[idx + 3] = 1.0

            rv = clamp(0.46 + (1.0 - t) * 0.24, 0.42, 0.76)
            rough[idx] = rv
            rough[idx + 1] = rv
            rough[idx + 2] = rv
            rough[idx + 3] = 1.0
            idx += 4

    return (
        make_image_from_rgb(f"{prefix}_COL", size, size, albedo, "sRGB"),
        make_image_from_rgb(f"{prefix}_RGH", size, size, rough, "Non-Color"),
    )


def gen_stitched_leather_textures(prefix: str = "Tex_DiplomatLeather", size: int = 256):
    """Generates rich dark espresso diplomatic leather blotter texture with fine pebble grain."""
    albedo = [0.0] * (size * size * 4)
    rough = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        v = y / size
        for x in range(size):
            u = x / size
            patina = fbm_2d(u * 4.0, v * 4.0, octaves=3, seed=173, period=4)
            pebble = fbm_2d(u * 32.0, v * 32.0, octaves=2, seed=191, period=32)
            # Subtle perimeter blind-tooled stitch border on desk blotter UV [0..1]
            du = min(u, 1.0 - u)
            dv = min(v, 1.0 - v)
            border_dist = min(du, dv)
            stitch_band = 1.0 - smoothstep(0.0, 0.004, abs(border_dist - 0.032))
            dash = 1.0 if int(((u if dv < du else v) * 90.0)) % 2 == 0 else 0.0
            stitch = stitch_band * dash

            t = clamp(patina * 0.65 + pebble * 0.35, 0.0, 1.0)
            # Deep diplomatic espresso-oxblood leather (#1A100C .. #2E1C14)
            r = lerp(0.095, 0.185, t)
            g = lerp(0.058, 0.112, t)
            b = lerp(0.045, 0.086, t)

            # Warm cognac saddle-stitch thread
            r = lerp(r, 0.56, stitch * 0.72)
            g = lerp(g, 0.40, stitch * 0.72)
            b = lerp(b, 0.24, stitch * 0.72)

            albedo[idx] = r
            albedo[idx + 1] = g
            albedo[idx + 2] = b
            albedo[idx + 3] = 1.0

            rv = clamp(0.36 + (1.0 - pebble) * 0.18 + stitch * 0.22, 0.30, 0.68)
            rough[idx] = rv
            rough[idx + 1] = rv
            rough[idx + 2] = rv
            rough[idx + 3] = 1.0
            idx += 4

    return (
        make_image_from_rgb(f"{prefix}_COL", size, size, albedo, "sRGB"),
        make_image_from_rgb(f"{prefix}_RGH", size, size, rough, "Non-Color"),
    )


def gen_silky_brushed_roughness(name: str = "Tex_SilkyBrushed_RGH", size: int = 256,
                                base_r: float = 0.20, amp: float = 0.04):
    """Smooth directional Swiss watch satin-brushed roughness map (zero normal-map sparkle)."""
    raw = [0.0] * size
    for y in range(size):
        t = (y / size) * math.tau
        raw[y] = (
            0.40 * math.sin(t * 5.0 + 0.3)
            + 0.30 * math.sin(t * 13.0 + 1.4)
            + 0.20 * math.cos(t * 23.0 + 2.1)
            + 0.10 * math.sin(t * 37.0 + 0.8)
        )
    # Periodic smoothing
    for _ in range(2):
        raw = [0.25 * raw[(i - 1) % size] + 0.5 * raw[i] + 0.25 * raw[(i + 1) % size] for i in range(size)]

    pixels = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        row_v = raw[y]
        for x in range(size):
            u = (x / size) * math.tau
            v = clamp(base_r + amp * row_v * (0.85 + 0.15 * math.cos(u * 2.0)), 0.08, 0.65)
            pixels[idx] = v
            pixels[idx + 1] = v
            pixels[idx + 2] = v
            pixels[idx + 3] = 1.0
            idx += 4
    return make_image_from_rgb(name, size, size, pixels, "Non-Color")


# ---------------------------------------------------------------------------
# Material Factory (Clean Principled BSDF for Blender Cycles/EEVEE & glTF/Godot)
# ---------------------------------------------------------------------------
def make_pbr_material(
    name: str,
    base_hex: str,
    metallic: float = 0.0,
    roughness: float = 0.35,
    coat_weight: float = 0.0,
    coat_roughness: float = 0.06,
    emissive_hex: str = None,
    emissive_strength: float = 0.0,
    alpha: float = 1.0,
    ior: float = 1.45,
    specular_ior_level: float = 0.5,
    transmission: float = 0.0,
    col_img=None,
    rgh_img=None,
    uv_scale: float = 1.0,
):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nodes = nt.nodes
    links = nt.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    out.location = (520, 0)

    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (180, 0)
    bsdf.inputs["Base Color"].default_value = hex_rgba(base_hex)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value = ior
    if "Specular IOR Level" in bsdf.inputs:
        bsdf.inputs["Specular IOR Level"].default_value = specular_ior_level
    if "Coat Weight" in bsdf.inputs and coat_weight > 0.0:
        bsdf.inputs["Coat Weight"].default_value = coat_weight
    if "Coat Roughness" in bsdf.inputs and coat_weight > 0.0:
        bsdf.inputs["Coat Roughness"].default_value = coat_roughness
    if "Transmission Weight" in bsdf.inputs and transmission > 0.0:
        bsdf.inputs["Transmission Weight"].default_value = transmission
    if "Alpha" in bsdf.inputs and alpha < 1.0:
        bsdf.inputs["Alpha"].default_value = alpha
        if hasattr(mat, "surface_render_method"):
            try:
                mat.surface_render_method = "BLENDED"
            except Exception:
                pass
        if hasattr(mat, "use_transparency_overlap"):
            try:
                mat.use_transparency_overlap = False
            except Exception:
                pass

    if emissive_hex and emissive_strength > 0.0:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = hex_rgba(emissive_hex)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emissive_strength

    if col_img is not None or rgh_img is not None:
        tc = nodes.new("ShaderNodeTexCoord")
        tc.location = (-660, 0)
        mp = nodes.new("ShaderNodeMapping")
        mp.location = (-460, 0)
        mp.inputs["Scale"].default_value = (uv_scale, uv_scale, uv_scale)
        links.new(tc.outputs["UV"], mp.inputs["Vector"])

        if col_img is not None:
            ti = nodes.new("ShaderNodeTexImage")
            ti.location = (-200, 140)
            ti.image = col_img
            ti.extension = "REPEAT"
            links.new(mp.outputs["Vector"], ti.inputs["Vector"])
            links.new(ti.outputs["Color"], bsdf.inputs["Base Color"])

        if rgh_img is not None:
            tr = nodes.new("ShaderNodeTexImage")
            tr.location = (-200, -140)
            tr.image = rgh_img
            tr.extension = "REPEAT"
            links.new(mp.outputs["Vector"], tr.inputs["Vector"])
            links.new(tr.outputs["Color"], bsdf.inputs["Roughness"])

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def build_horology_materials():
    """Creates the Swiss Haute Horlogerie / Faberge material library for Orb, Cryptex, Chronometer."""
    marble_col, marble_rgh = gen_dark_veined_marble_textures("Tex_Horology_Marble", 256)
    walnut_col, walnut_rgh = gen_smoked_walnut_textures("Tex_Horology_Walnut", 256)
    brushed_gold_rgh = gen_silky_brushed_roughness("Tex_GoldBrushed_RGH", 256, base_r=0.18, amp=0.035)
    brushed_brass_rgh = gen_silky_brushed_roughness("Tex_BrassBrushed_RGH", 256, base_r=0.27, amp=0.045)

    mats = [
        # 0: 18k Champagne Swiss Brushed Gold
        make_pbr_material(
            "Mat_Brushed_Gold",
            "#E6BF6E",
            metallic=0.96,
            roughness=0.18,
            coat_weight=0.10,
            coat_roughness=0.08,
            rgh_img=brushed_gold_rgh,
            uv_scale=2.0,
        ),
        # 1: Patinated Antique Horological Brass (rich warm museum bronze-brass)
        make_pbr_material(
            "Mat_Antique_Brass",
            "#B48238",
            metallic=0.94,
            roughness=0.28,
            coat_weight=0.05,
            coat_roughness=0.14,
            rgh_img=brushed_brass_rgh,
            uv_scale=2.0,
        ),
        # 2: 18k Rose Gold (inner tourbillon accents)
        make_pbr_material(
            "Mat_Rose_Gold",
            "#DA9D72",
            metallic=0.96,
            roughness=0.17,
            coat_weight=0.10,
            rgh_img=brushed_gold_rgh,
            uv_scale=2.2,
        ),
        # 3: Glossy Faberge Honed Obsidian / Black Onyx
        make_pbr_material(
            "Mat_Obsidian_Onyx",
            "#080B12",
            metallic=0.08,
            roughness=0.10,
            coat_weight=0.85,
            coat_roughness=0.04,
        ),
        # 4: Honed Nero Marquina Veined Dark Marble
        make_pbr_material(
            "Mat_Dark_Marble",
            "#10141C",
            metallic=0.02,
            roughness=0.20,
            coat_weight=0.35,
            coat_roughness=0.10,
            col_img=marble_col,
            rgh_img=marble_rgh,
            uv_scale=1.6,
        ),
        # 5: Watchmaker Blued-Gunmetal Steel
        make_pbr_material(
            "Mat_Gunmetal_Steel",
            "#202838",
            metallic=0.90,
            roughness=0.26,
            coat_weight=0.08,
            rgh_img=brushed_brass_rgh,
            uv_scale=2.4,
        ),
        # 6: Faceted Watchmaker Sapphire Jewel
        make_pbr_material(
            "Mat_Sapphire_Jewel",
            "#1249CF",
            metallic=0.08,
            roughness=0.04,
            coat_weight=1.0,
            coat_roughness=0.02,
            emissive_hex="#1A5AF0",
            emissive_strength=0.40,
            ior=1.77,
        ),
        # 7: Horological Synthetic Ruby Pivot Jewel
        make_pbr_material(
            "Mat_Ruby_Jewel",
            "#C41238",
            metallic=0.08,
            roughness=0.04,
            coat_weight=1.0,
            coat_roughness=0.02,
            emissive_hex="#D61842",
            emissive_strength=0.45,
            ior=1.77,
        ),
        # 8: Luminous Faceted Champagne-Diamond Crystal Heart (crisp visible facets, rich amber-gold!)
        make_pbr_material(
            "Mat_Crystal_Heart",
            "#F5C562",
            metallic=0.24,
            roughness=0.05,
            coat_weight=1.0,
            coat_roughness=0.02,
            emissive_hex="#FFBA42",
            emissive_strength=1.45,
            ior=2.15,
        ),
        # 9: Subtle Warm Magnetic Levitation Brass Glow (refined, NEVER neon white!)
        make_pbr_material(
            "Mat_Levitation_Glow",
            "#E5AF48",
            metallic=0.65,
            roughness=0.20,
            emissive_hex="#F4B648",
            emissive_strength=1.55,
        ),
        # 10: Deep Midnight Sapphire Enamel Chronometer Dial
        make_pbr_material(
            "Mat_Sapphire_Dial",
            "#081530",
            metallic=0.14,
            roughness=0.18,
            coat_weight=0.65,
            coat_roughness=0.06,
        ),
        # 11: AR-Coated Optical Watchmaker Sapphire Crystal Glass (crystal-clear, zero milky grey veil!)
        make_pbr_material(
            "Mat_Sapphire_Glass",
            "#102038",
            metallic=0.0,
            roughness=0.03,
            coat_weight=0.0,
            alpha=0.055,
            ior=1.46,
            specular_ior_level=0.14,
        ),
        # 12: Smoked Walnut Stand Accent
        make_pbr_material(
            "Mat_Horology_Walnut",
            "#2A1910",
            metallic=0.0,
            roughness=0.28,
            coat_weight=0.30,
            coat_roughness=0.12,
            col_img=walnut_col,
            rgh_img=walnut_rgh,
            uv_scale=2.0,
        ),
    ]
    return mats


# Horology Material Indices
HM_GOLD = 0
HM_BRASS = 1
HM_ROSE = 2
HM_OBSIDIAN = 3
HM_MARBLE = 4
HM_GUNMETAL = 5
HM_SAPPHIRE = 6
HM_RUBY = 7
HM_CRYSTAL = 8
HM_LEV_GLOW = 9
HM_DIAL = 10
HM_GLASS = 11
HM_WALNUT = 12


# ---------------------------------------------------------------------------
# Precision Hard-Surface & Sculptural BMesh Builders
# ---------------------------------------------------------------------------
def apply_box_uvs(bm, scale: float = 1.0):
    uv_layer = bm.loops.layers.uv.verify()
    for f in bm.faces:
        n = f.normal
        ax, ay, az = abs(n.x), abs(n.y), abs(n.z)
        for loop in f.loops:
            co = loop.vert.co * scale
            if az >= ax and az >= ay:
                loop[uv_layer].uv = (co.x, co.y)
            elif ax >= ay and ax >= az:
                loop[uv_layer].uv = (co.y, co.z)
            else:
                loop[uv_layer].uv = (co.x, co.z)


def apply_cylindrical_uvs(bm, scale_u: float = 1.0, scale_v: float = 1.0):
    uv_layer = bm.loops.layers.uv.verify()
    for f in bm.faces:
        for loop in f.loops:
            co = loop.vert.co
            u = (math.atan2(co.y, co.x) / math.tau + 0.5) * scale_u
            v = co.z * scale_v
            loop[uv_layer].uv = (u, v)


def mark_sharp_by_angle(bm, angle_deg: float = 34.0, keep_flat_mats=None):
    thresh = math.radians(angle_deg)
    keep_flat_mats = set(keep_flat_mats or ())
    for f in bm.faces:
        f.smooth = (f.material_index not in keep_flat_mats)
    for e in bm.edges:
        if len(e.link_faces) == 2:
            if any(lf.material_index in keep_flat_mats for lf in e.link_faces):
                e.smooth = False
            else:
                e.smooth = e.calc_face_angle(0.0) <= thresh
        else:
            e.smooth = False


def finalize_mesh_obj(
    name: str,
    bm,
    materials,
    collection,
    location=(0.0, 0.0, 0.0),
    rotation_euler=(0.0, 0.0, 0.0),
    parent=None,
    sharp_angle_deg: float = 36.0,
    uv_scale: float = 1.0,
    preserve_existing_uvs: bool = False,
    weld_dist: float = 1e-5,
    weighted_normal: bool = True,
    keep_flat_mats=None,
    subsurf_levels: int = 0,
):
    if weld_dist > 0.0:
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=weld_dist)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.normal_update()
    if not preserve_existing_uvs:
        apply_box_uvs(bm, scale=uv_scale)
    mark_sharp_by_angle(bm, angle_deg=sharp_angle_deg, keep_flat_mats=keep_flat_mats)

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    # Keep only actually-used material slots cleanly? No, preserve consistent material table
    # OR compact used materials so GLB only carries materials referenced by each object!
    used_indices = sorted({p.material_index for p in mesh.polygons})
    if used_indices:
        remap = {old_i: new_i for new_i, old_i in enumerate(used_indices)}
        for old_i in used_indices:
            mesh.materials.append(materials[old_i])
        for p in mesh.polygons:
            p.material_index = remap[p.material_index]
    else:
        mesh.materials.append(materials[0])

    obj = bpy.data.objects.new(name, mesh)
    obj.location = location
    obj.rotation_euler = rotation_euler
    if parent is not None:
        obj.parent = parent
    collection.objects.link(obj)

    if subsurf_levels > 0:
        ss = obj.modifiers.new("SmoothSubsurf", "SUBSURF")
        ss.levels = subsurf_levels
        ss.render_levels = subsurf_levels

    if weighted_normal and not keep_flat_mats:
        wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
        wn.keep_sharp = True
        wn.weight = 50
        wn.mode = "FACE_AREA"

    return obj


def add_lathe_profile(
    bm,
    profile_rz,
    segments: int,
    mat_idx: int,
    closed_profile: bool = False,
    cap_bottom: bool = False,
    cap_top: bool = False,
    angle_offset: float = 0.0,
    matrix: Matrix = None,
    flute_count: int = 0,
    flute_depth: float = 0.0,
):
    """High-segment smooth lathe builder with optional architectural fluting/coin-edge scalloping."""
    rings = []
    for r, z in profile_rz:
        ring = []
        for s in range(segments):
            a = angle_offset + (s / segments) * math.tau
            rr = r
            if flute_count > 0 and flute_depth != 0.0:
                # Smooth cosine concave flute or coin-edge scallop
                fl = 0.5 * (1.0 - math.cos(a * flute_count))
                rr = max(0.0005, r - flute_depth * fl)
            p = Vector((math.cos(a) * rr, math.sin(a) * rr, z))
            if matrix is not None:
                p = matrix @ p
            ring.append(bm.verts.new(p))
        rings.append(ring)

    faces = []
    n = len(rings)
    pairs = n if closed_profile else n - 1
    for i in range(pairs):
        r0 = rings[i]
        r1 = rings[(i + 1) % n]
        for s in range(segments):
            sn = (s + 1) % segments
            try:
                f = bm.faces.new((r0[s], r0[sn], r1[sn], r1[s]))
                f.material_index = mat_idx
                f.smooth = True
                faces.append(f)
            except ValueError:
                pass

    if cap_bottom and rings:
        c_p = Vector((0.0, 0.0, profile_rz[0][1]))
        if matrix is not None:
            c_p = matrix @ c_p
        cv = bm.verts.new(c_p)
        r0 = rings[0]
        for s in range(segments):
            sn = (s + 1) % segments
            try:
                f = bm.faces.new((cv, r0[sn], r0[s]))
                f.material_index = mat_idx
                f.smooth = True
                faces.append(f)
            except ValueError:
                pass

    if cap_top and rings:
        c_p = Vector((0.0, 0.0, profile_rz[-1][1]))
        if matrix is not None:
            c_p = matrix @ c_p
        cv = bm.verts.new(c_p)
        rl = rings[-1]
        for s in range(segments):
            sn = (s + 1) % segments
            try:
                f = bm.faces.new((cv, rl[s], rl[sn]))
                f.material_index = mat_idx
                f.smooth = True
                faces.append(f)
            except ValueError:
                pass

    return faces


def add_swept_profile(
    bm,
    path_points,
    profile_2d,
    mat_idx: int,
    closed_path: bool = False,
    cap_ends: bool = True,
    up_hint: Vector = Vector((0.0, 0.0, 1.0)),
    scale_fn=None,
):
    """Sweeps a 2D cross-section [(u, v), ...] smoothly along a 3D curve using parallel-transport frames."""
    pts = [Vector(p) for p in path_points]
    n_pts = len(pts)
    if n_pts < 2:
        return []

    tangents = []
    for i in range(n_pts):
        if closed_path:
            t = pts[(i + 1) % n_pts] - pts[(i - 1) % n_pts]
        elif i == 0:
            t = pts[1] - pts[0]
        elif i == n_pts - 1:
            t = pts[-1] - pts[-2]
        else:
            t = pts[i + 1] - pts[i - 1]
        if t.length < 1e-8:
            t = Vector((0.0, 0.0, 1.0))
        tangents.append(t.normalized())

    # Initial frame
    t0 = tangents[0]
    hint = up_hint.normalized()
    if abs(t0.dot(hint)) > 0.96:
        hint = Vector((1.0, 0.0, 0.0)) if abs(t0.x) < 0.8 else Vector((0.0, 1.0, 0.0))
    n_vec = hint.cross(t0).normalized()
    b_vec = t0.cross(n_vec).normalized()

    frames = [(n_vec, b_vec)]
    for i in range(1, n_pts):
        t_prev = tangents[i - 1]
        t_curr = tangents[i]
        axis = t_prev.cross(t_curr)
        if axis.length > 1e-6:
            angle = math.acos(clamp(t_prev.dot(t_curr), -1.0, 1.0))
            rot = Matrix.Rotation(angle, 3, axis.normalized())
            n_vec = (rot @ n_vec).normalized()
            b_vec = t_curr.cross(n_vec).normalized()
        frames.append((n_vec, b_vec))

    # For closed paths, distribute twist error evenly so loop joins seamlessly
    if closed_path:
        t_last = tangents[-1]
        t_first = tangents[0]
        axis = t_last.cross(t_first)
        n_end, b_end = frames[-1]
        if axis.length > 1e-6:
            angle = math.acos(clamp(t_last.dot(t_first), -1.0, 1.0))
            n_end = (Matrix.Rotation(angle, 3, axis.normalized()) @ n_end).normalized()
        n0, b0 = frames[0]
        twist = math.atan2(n_end.dot(b0), n_end.dot(n0))
        if abs(twist) > 1e-5:
            new_frames = []
            for i, (nv, bv) in enumerate(frames):
                corr = -twist * (i / n_pts)
                c, s = math.cos(corr), math.sin(corr)
                new_frames.append((nv * c + bv * s, -nv * s + bv * c))
            frames = new_frames

    rings = []
    for i in range(n_pts):
        u_param = i / max(1, n_pts - 1)
        sc = scale_fn(u_param) if scale_fn else (1.0, 1.0)
        sx, sy = (sc, sc) if isinstance(sc, (int, float)) else sc
        nv, bv = frames[i]
        p = pts[i]
        ring = []
        for pu, pv in profile_2d:
            v = p + nv * (pu * sx) + bv * (pv * sy)
            ring.append(bm.verts.new(v))
        rings.append(ring)

    m = len(profile_2d)
    pairs = n_pts if closed_path else n_pts - 1
    faces = []
    for i in range(pairs):
        r0 = rings[i]
        r1 = rings[(i + 1) % n_pts]
        for j in range(m):
            jn = (j + 1) % m
            try:
                f = bm.faces.new((r0[j], r0[jn], r1[jn], r1[j]))
                f.material_index = mat_idx
                f.smooth = True
                faces.append(f)
            except ValueError:
                pass

    if not closed_path and cap_ends:
        try:
            f0 = bm.faces.new(list(reversed(rings[0])))
            f0.material_index = mat_idx
            faces.append(f0)
        except ValueError:
            pass
        try:
            f1 = bm.faces.new(list(rings[-1]))
            f1.material_index = mat_idx
            faces.append(f1)
        except ValueError:
            pass

    return faces


def add_chamfered_box(bm, sx: float, sy: float, sz: float, bevel: float, mat_idx: int,
                      matrix: Matrix = None, segments: int = 2):
    ret = bmesh.ops.create_cube(bm, size=1.0)
    verts = ret["verts"]
    scale_m = Matrix.Diagonal((sx, sy, sz, 1.0))
    for v in verts:
        v.co = scale_m @ v.co
    edges = list({e for v in verts for e in v.link_edges})
    faces = list({f for v in verts for f in v.link_faces})
    if bevel > 0.0:
        b_ret = bmesh.ops.bevel(
            bm,
            geom=edges,
            offset=min(bevel, min(sx, sy, sz) * 0.42),
            segments=segments,
            affect="EDGES",
            clamp_overlap=True,
        )
        all_v = [v for v in (set(verts) | set(b_ret["verts"])) if v.is_valid]
        all_f = [f for f in (set(faces) | set(b_ret["faces"])) if f.is_valid]
    else:
        all_v = [v for v in verts if v.is_valid]
        all_f = [f for f in faces if f.is_valid]
    if matrix is not None:
        bmesh.ops.transform(bm, matrix=matrix, verts=all_v)
    for f in all_f:
        if f.is_valid:
            f.material_index = mat_idx
            f.smooth = True
    return all_f


def add_faceted_gem(bm, pos: Vector, normal_dir: Vector, radius: float, height: float,
                    bezel_mat: int, gem_mat: int, facets: int = 12):
    """Adds a watchmaker chaton gold bezel + brilliant-cut jewel bearing (sapphire or ruby)."""
    z_axis = normal_dir.normalized()
    ref = Vector((0, 0, 1)) if abs(z_axis.z) < 0.9 else Vector((1, 0, 0))
    x_axis = ref.cross(z_axis).normalized()
    y_axis = z_axis.cross(x_axis).normalized()
    m = Matrix((
        (x_axis.x, y_axis.x, z_axis.x, pos.x),
        (x_axis.y, y_axis.y, z_axis.y, pos.y),
        (x_axis.z, y_axis.z, z_axis.z, pos.z),
        (0.0, 0.0, 0.0, 1.0),
    ))
    # Sculpted gold bezel collar
    bezel_prof = [
        (radius * 1.28, -height * 0.25),
        (radius * 1.32, height * 0.08),
        (radius * 1.15, height * 0.45),
        (radius * 0.94, height * 0.48),
        (radius * 0.88, height * 0.20),
    ]
    add_lathe_profile(bm, bezel_prof, segments=facets, mat_idx=bezel_mat, cap_bottom=True, matrix=m)

    # Brilliant-cut faceted jewel dome
    gem_prof = [
        (radius * 0.88, height * 0.18),
        (radius * 0.92, height * 0.48),
        (radius * 0.62, height * 0.86),
        (radius * 0.26, height * 0.98),
    ]
    add_lathe_profile(bm, gem_prof, segments=facets, mat_idx=gem_mat, cap_top=True, matrix=m)


def add_diamond_index(bm, pos: Vector, normal_dir: Vector, tangent_dir: Vector,
                      length: float, width: float, height: float, mat_idx: int):
    """Adds a precision beveled 3D watchmaker diamond/lozenge cardinal index."""
    z_axis = normal_dir.normalized()
    x_axis = tangent_dir.normalized()
    y_axis = z_axis.cross(x_axis).normalized()
    x_axis = y_axis.cross(z_axis).normalized()
    m = Matrix((
        (x_axis.x, y_axis.x, z_axis.x, pos.x),
        (x_axis.y, y_axis.y, z_axis.y, pos.y),
        (x_axis.z, y_axis.z, z_axis.z, pos.z),
        (0.0, 0.0, 0.0, 1.0),
    ))
    hl, hw = length * 0.5, width * 0.5
    base_pts = [
        Vector((hl, 0.0, 0.0)),
        Vector((0.0, hw, 0.0)),
        Vector((-hl, 0.0, 0.0)),
        Vector((0.0, -hw, 0.0)),
    ]
    top_pts = [
        Vector((hl * 0.58, 0.0, height)),
        Vector((0.0, hw * 0.58, height)),
        Vector((-hl * 0.58, 0.0, height)),
        Vector((0.0, -hw * 0.58, height)),
    ]
    bv = [bm.verts.new(m @ p) for p in base_pts]
    tv = [bm.verts.new(m @ p) for p in top_pts]
    apex = bm.verts.new(m @ Vector((0.0, 0.0, height * 1.28)))
    for i in range(4):
        inext = (i + 1) % 4
        f1 = bm.faces.new((bv[i], bv[inext], tv[inext], tv[i]))
        f1.material_index = mat_idx
        f2 = bm.faces.new((tv[i], tv[inext], apex))
        f2.material_index = mat_idx
    fb = bm.faces.new(list(reversed(bv)))
    fb.material_index = mat_idx


def add_superellipse_extrusion(bm, rx: float, ry: float, exp_n: float, z0: float, z1: float,
                               segments: int, mat_idx: int, bevel_z: float = 0.008,
                               bevel_r: float = 0.008, cap_bottom: bool = True, cap_top: bool = True):
    """Builds a smooth luxury rounded-oval / superellipse architectural slab with multi-bevel rim."""
    profile_levels = [
        (1.0 - bevel_r / max(rx, 0.01), z0),
        (1.0, z0 + bevel_z),
        (1.0, z1 - bevel_z),
        (1.0 - bevel_r * 0.45 / max(rx, 0.01), z1 - bevel_z * 0.28),
        (1.0 - bevel_r / max(rx, 0.01), z1),
    ]
    rings = []
    for scale_xy, z in profile_levels:
        ring = []
        for s in range(segments):
            a = (s / segments) * math.tau
            ca, sa = math.cos(a), math.sin(a)
            sx = math.copysign(abs(ca) ** (2.0 / exp_n), ca) * rx * scale_xy
            sy = math.copysign(abs(sa) ** (2.0 / exp_n), sa) * ry * scale_xy
            ring.append(bm.verts.new(Vector((sx, sy, z))))
        rings.append(ring)

    for i in range(len(rings) - 1):
        r0, r1 = rings[i], rings[i + 1]
        for s in range(segments):
            sn = (s + 1) % segments
            f = bm.faces.new((r0[s], r0[sn], r1[sn], r1[s]))
            f.material_index = mat_idx
            f.smooth = True

    if cap_bottom:
        cb = bm.verts.new(Vector((0.0, 0.0, z0)))
        for s in range(segments):
            sn = (s + 1) % segments
            f = bm.faces.new((cb, rings[0][sn], rings[0][s]))
            f.material_index = mat_idx
            f.smooth = True

    if cap_top:
        ct = bm.verts.new(Vector((0.0, 0.0, z1)))
        for s in range(segments):
            sn = (s + 1) % segments
            f = bm.faces.new((ct, rings[-1][s], rings[-1][sn]))
            f.material_index = mat_idx
            f.smooth = True


# ===========================================================================
# ASSET 1: LUXURY VERITAS ASTROLABE ORB (veritas_astrolabe_orb.glb)
# ===========================================================================
ORB_CENTER_Z = 0.44  # Godot Y = 0.44m


def build_veritas_orb_objects(mats, collection):
    """
    Constructs the museum-grade Swiss Haute Horlogerie / Faberge Veritas Astrolabe Orb:
      - Orb_Base (origin 0,0,0)
      - Ring_Outer, Ring_Mid, Ring_Inner (origin 0,0,0.44 -> Godot 0,0.44,0)
      - Petal_0 .. Petal_5 (origin 0,0,0.44 -> Godot 0,0.44,0)
      - Caliper_0 .. Caliper_3 (origin 0,0,0.44 -> Godot 0,0.44,0)
      - Crystal_Core (origin 0,0,0.44 -> Godot 0,0.44,0)
    """
    objects = []

    # -----------------------------------------------------------------------
    # 1. Orb_Base: Stepped Nero Marquina Marble & Antique-Brass Pedestal + 3 S-Scroll Feet
    # -----------------------------------------------------------------------
    bm_base = bmesh.new()

    # Main stepped beveled dark marble pedestal (r=0.280m, h=0.080m, concave levitation dish to 0.048m)
    marble_prof = [
        (0.010, 0.000),
        (0.272, 0.000),
        (0.280, 0.006),
        (0.280, 0.022),
        (0.268, 0.030),
        (0.258, 0.034),
        (0.256, 0.056),
        (0.242, 0.068),
        (0.228, 0.078),
        (0.208, 0.080),
        (0.192, 0.076),
        (0.165, 0.064),
        (0.130, 0.054),
        (0.082, 0.049),
        (0.008, 0.048),
    ]
    add_lathe_profile(bm_base, marble_prof, segments=96, mat_idx=HM_MARBLE, cap_bottom=True, cap_top=True)

    # Lower antique-brass chamfered plinth ring
    brass_rim_low = [
        (0.278, 0.004),
        (0.284, 0.008),
        (0.284, 0.020),
        (0.276, 0.024),
    ]
    add_lathe_profile(bm_base, brass_rim_low, segments=96, mat_idx=HM_BRASS, closed_profile=True)

    # Mid fluted coin-edge brushed-gold watchmaker collar
    brass_rim_mid = [
        (0.255, 0.034),
        (0.263, 0.038),
        (0.263, 0.052),
        (0.254, 0.056),
    ]
    add_lathe_profile(
        bm_base, brass_rim_mid, segments=96, mat_idx=HM_GOLD,
        closed_profile=True, flute_count=48, flute_depth=0.0022
    )

    # Upper beveled antique-brass crown rim surrounding the concave levitation well
    brass_rim_top = [
        (0.204, 0.076),
        (0.214, 0.082),
        (0.224, 0.081),
        (0.229, 0.075),
        (0.214, 0.072),
    ]
    add_lathe_profile(bm_base, brass_rim_top, segments=96, mat_idx=HM_GOLD, closed_profile=True)

    # Concave glossy obsidian dish lining inside the levitation well
    obsidian_dish = [
        (0.194, 0.075),
        (0.168, 0.065),
        (0.134, 0.055),
        (0.085, 0.050),
        (0.006, 0.049),
    ]
    add_lathe_profile(bm_base, obsidian_dish, segments=72, mat_idx=HM_OBSIDIAN, cap_top=True)

    # Subtle recessed warm-gold magnetic levitation brass ring (refined warm amber, ZERO neon white!)
    lev_ring_housing = [
        (0.125, 0.053),
        (0.146, 0.058),
        (0.144, 0.063),
        (0.127, 0.058),
    ]
    add_lathe_profile(bm_base, lev_ring_housing, segments=72, mat_idx=HM_BRASS, closed_profile=True)
    lev_ring_glow = [
        (0.131, 0.056),
        (0.140, 0.059),
        (0.139, 0.062),
        (0.132, 0.059),
    ]
    add_lathe_profile(bm_base, lev_ring_glow, segments=72, mat_idx=HM_LEV_GLOW, closed_profile=True)

    # Inner hairline gold compass meridian ring & central faceted sapphire focus lens
    inner_track = [
        (0.072, 0.049),
        (0.080, 0.050),
        (0.079, 0.053),
        (0.073, 0.052),
    ]
    add_lathe_profile(bm_base, inner_track, segments=64, mat_idx=HM_GOLD, closed_profile=True)
    add_faceted_gem(bm_base, Vector((0.0, 0.0, 0.049)), Vector((0.0, 0.0, 1.0)),
                    radius=0.024, height=0.015, bezel_mat=HM_GOLD, gem_mat=HM_SAPPHIRE, facets=16)

    # 12 tiny gold compass ticks inlaid around the pedestal bevel
    for i in range(12):
        ang = (i / 12.0) * math.tau
        tx, ty = math.cos(ang) * 0.236, math.sin(ang) * 0.236
        pos = Vector((tx, ty, 0.072))
        nrm = Vector((math.cos(ang) * 0.38, math.sin(ang) * 0.38, 0.92)).normalized()
        tan = Vector((math.cos(ang), math.sin(ang), 0.0))
        add_diamond_index(bm_base, pos, nrm, tan, length=0.015, width=0.006, height=0.0035, mat_idx=HM_GOLD)

    # 3 Slender Curved S-Scroll Brushed-Brass Suspension Feet & Cradle Arms
    # Positioned at 90° (rear), 210° (front-left), 330° (front-right) — frames camera gracefully!
    # Stays strictly outside the 0.385m sphere envelope centered at Z=0.44m -> ZERO clipping!
    scroll_profile = [
        (-0.0085, -0.0045),
        (0.0085, -0.0045),
        (0.0110, 0.0000),
        (0.0075, 0.0055),
        (0.0000, 0.0075),
        (-0.0075, 0.0055),
        (-0.0110, 0.0000),
    ]
    for arm_idx in range(3):
        ang = math.radians(90.0 + arm_idx * 120.0)
        ca, sa = math.cos(ang), math.sin(ang)
        # Cubic S-scroll curve in (r, z): grounded claw pad at z=0.0 -> arches gracefully up & outward
        pts_rz = []
        steps = 26
        for k in range(steps):
            t = k / (steps - 1)
            # Smooth S-scroll parametric path (starts at z=0.011 so swept bottom sits flush >= 0.000!)
            if t < 0.28:
                u = t / 0.28
                r = lerp(0.290, 0.270, smoothstep(0.0, 1.0, u))
                z = lerp(0.011, 0.050, u * u * (2.0 - u))
            else:
                u = (t - 0.28) / 0.72
                # Graceful S-curve sweeping outward to clear R=0.38m rings then curling delicately inward at finial
                r = 0.270 + 0.062 * math.sin(u * math.pi * 0.85) - 0.018 * (u ** 3)
                z = 0.050 + 0.142 * smoothstep(0.0, 1.0, u) + 0.012 * math.sin(u * math.pi * 2.0)
            pts_rz.append((r, z))

        path_3d = [Vector((ca * r, sa * r, z)) for (r, z) in pts_rz]

        def arm_scale(u):
            # Wider sculptural foot at base, slender waist, graceful tapered finial
            w = 1.20 * (1.0 - 0.44 * u) + 0.18 * math.sin(u * math.pi)
            h = 1.05 * (1.0 - 0.34 * u)
            return (w, h)

        add_swept_profile(
            bm_base, path_3d, scroll_profile, mat_idx=HM_GOLD,
            closed_path=False, cap_ends=True, up_hint=Vector((-sa, ca, 0.0)), scale_fn=arm_scale
        )

        # Grounded brass foot pad flush at Z=0.0
        foot_m = Matrix.Translation((ca * 0.290, sa * 0.290, 0.0))
        foot_prof = [
            (0.002, 0.000),
            (0.022, 0.000),
            (0.024, 0.004),
            (0.019, 0.011),
            (0.008, 0.015),
        ]
        add_lathe_profile(bm_base, foot_prof, segments=24, mat_idx=HM_BRASS, cap_bottom=True, cap_top=True, matrix=foot_m)

        # Upper ruby-set scroll finial cap
        tip = path_3d[-1]
        inward_n = Vector((-ca * 0.72, -sa * 0.72, 0.69)).normalized()
        add_faceted_gem(bm_base, tip, inward_n, radius=0.011, height=0.009,
                        bezel_mat=HM_GOLD, gem_mat=HM_RUBY, facets=12)

        # Smooth curved concave architectural brass scroll bracket hugging pedestal collar to arm!
        brace_pts = []
        for bk in range(10):
            bt = bk / 9.0
            br = lerp(0.228, 0.305, bt)
            bz = lerp(0.072, 0.104, bt * bt) - 0.012 * math.sin(bt * math.pi)
            brace_pts.append(Vector((ca * br, sa * br, bz)))
        brace_prof = [(-0.0048, -0.0032), (0.0048, -0.0032), (0.0036, 0.0042), (-0.0036, 0.0042)]
        add_swept_profile(bm_base, brace_pts, brace_prof, mat_idx=HM_BRASS,
                          closed_path=False, cap_ends=True, up_hint=Vector((-sa, ca, 0.0)),
                          scale_fn=lambda u: 1.0 - 0.35 * u)

    # Guarantee exact flush ground contact (min Z == 0.0000 in Blender -> min Y == 0.0000 in Godot!)
    for v in bm_base.verts:
        if v.co.z < 0.0:
            v.co.z = 0.0

    obj_base = finalize_mesh_obj("Orb_Base", bm_base, mats, collection, sharp_angle_deg=36.0, uv_scale=1.8)
    objects.append(obj_base)

    # -----------------------------------------------------------------------
    # Helper: Build Slender 96-Segment Chamfered Armillary Ring (centered at local 0,0,0)
    # -----------------------------------------------------------------------
    def build_armillary_ring(
        name: str,
        radius: float,
        band_width: float,
        thickness: float,
        main_mat: int,
        accent_mat: int,
        jewel_mat: int,
        rot_euler,
        openwork_twin: bool = False,
        tick_count: int = 36,
        has_zenith_finial: bool = False,
        inward_pointers: bool = False,
    ):
        bm = bmesh.new()
        segs = 96
        # Ring lies cleanly in local XZ plane (facing -Y / +Y, vertical meridian!)
        ring_pts = [
            Vector((math.cos(i / segs * math.tau) * radius, 0.0, math.sin(i / segs * math.tau) * radius))
            for i in range(segs)
        ]

        hw = band_width * 0.5
        ht = thickness * 0.5

        if not openwork_twin:
            # Slender chamfered horological octagonal bezel cross-section
            cs = [
                (-ht * 0.65, -hw),
                (ht * 0.65, -hw),
                (ht, -hw * 0.62),
                (ht, hw * 0.62),
                (ht * 0.65, hw),
                (-ht * 0.65, hw),
                (-ht, hw * 0.62),
                (-ht, -hw * 0.62),
            ]
            add_swept_profile(bm, ring_pts, cs, mat_idx=main_mat, closed_path=True, up_hint=Vector((0, 1, 0)))

            # Recessed dark-gunmetal outer spine hairline channel
            ch_pts = [
                Vector((math.cos(i / segs * math.tau) * (radius + ht * 0.88), 0.0,
                        math.sin(i / segs * math.tau) * (radius + ht * 0.88)))
                for i in range(segs)
            ]
            ch_cs = [
                (-0.0018, -hw * 0.28),
                (0.0018, -hw * 0.28),
                (0.0018, hw * 0.28),
                (-0.0018, hw * 0.28),
            ]
            add_swept_profile(bm, ch_pts, ch_cs, mat_idx=accent_mat, closed_path=True, up_hint=Vector((0, 1, 0)))
        else:
            # Exquisite twin-rail openwork tourbillon ecliptic ring!
            rail_off = hw * 0.68
            rw = hw * 0.34
            rail_cs = [
                (-ht * 0.6, -rw),
                (ht * 0.6, -rw),
                (ht, -rw * 0.5),
                (ht, rw * 0.5),
                (ht * 0.6, rw),
                (-ht * 0.6, rw),
                (-ht, rw * 0.5),
                (-ht, -rw * 0.5),
            ]
            for side in (-1.0, 1.0):
                r_pts = [
                    Vector((math.cos(i / segs * math.tau) * radius, side * rail_off,
                            math.sin(i / segs * math.tau) * radius))
                    for i in range(segs)
                ]
                add_swept_profile(bm, r_pts, rail_cs, mat_idx=main_mat, closed_path=True, up_hint=Vector((0, 1, 0)))

            # 24 delicate openwork bridge struts connecting the twin rails
            for k in range(24):
                a = (k / 24.0) * math.tau
                ca, sa = math.cos(a), math.sin(a)
                strut_m = (
                    Matrix.Translation((ca * radius, 0.0, sa * radius))
                    @ Matrix.Rotation(-a, 4, "Y")
                )
                add_chamfered_box(bm, ht * 1.15, rail_off * 2.0, 0.0055, bevel=0.0012,
                                  mat_idx=accent_mat, matrix=strut_m, segments=1)

        # Fine engraved vernier graduation micro-ticks around the inner chamfer
        for k in range(tick_count):
            a = (k / tick_count) * math.tau
            ca, sa = math.cos(a), math.sin(a)
            is_major = (k % 3 == 0)
            tick_h = 0.0055 if is_major else 0.0032
            tick_w = 0.0024 if is_major else 0.0015
            pos = Vector((ca * (radius - ht * 0.72), 0.0, sa * (radius - ht * 0.72)))
            rad_in = Vector((-ca, 0.0, -sa))
            tan = Vector((-sa, 0.0, ca))
            add_diamond_index(bm, pos, rad_in, tan, length=tick_w * 2.6, width=hw * 0.95,
                              height=tick_h, mat_idx=HM_GOLD)

        # 4 Sculpted Cardinal Diamond Indices & Mounted Sapphire/Ruby Jewel Bearings at 0°, 90°, 180°, 270°
        for c_i in range(4):
            a = c_i * (math.pi * 0.5)
            ca, sa = math.cos(a), math.sin(a)
            rad_out = Vector((ca, 0.0, sa))
            tan = Vector((-sa, 0.0, ca))
            # Outer sculpted diamond plaque
            p_out = rad_out * (radius + ht * 0.75)
            add_diamond_index(bm, p_out, rad_out, tan, length=0.036, width=band_width * 1.35,
                              height=0.009, mat_idx=HM_GOLD)
            # Mounted jewel bearing on front & rear faces of the cardinal node
            p_front = rad_out * radius + Vector((0.0, -hw * 0.92, 0.0))
            p_back = rad_out * radius + Vector((0.0, hw * 0.92, 0.0))
            j_mat = jewel_mat if (c_i % 2 == 0) else (HM_RUBY if jewel_mat == HM_SAPPHIRE else HM_SAPPHIRE)
            add_faceted_gem(bm, p_front, Vector((0.0, -1.0, 0.0)), radius=0.0072, height=0.0055,
                            bezel_mat=HM_GOLD, gem_mat=j_mat, facets=12)
            add_faceted_gem(bm, p_back, Vector((0.0, 1.0, 0.0)), radius=0.0072, height=0.0055,
                            bezel_mat=HM_GOLD, gem_mat=j_mat, facets=12)

            # Inward gimbal pivot trunnion pin on opposing poles (0° and 180°)
            if c_i in (0, 2):
                pin_m = (
                    Matrix.Translation(rad_out * (radius - ht - 0.012))
                    @ Matrix.Rotation(math.pi * 0.5 if c_i == 0 else -math.pi * 0.5, 4, "Y")
                )
                pin_prof = [
                    (0.0065, -0.012),
                    (0.0075, -0.006),
                    (0.0042, 0.000),
                    (0.0038, 0.014),
                    (0.0018, 0.018),
                ]
                add_lathe_profile(bm, pin_prof, segments=16, mat_idx=HM_BRASS, cap_top=True, matrix=pin_m)

            if inward_pointers:
                # Slender golden astrolabe pointer needle aiming gently inward
                p_in = rad_out * (radius - ht * 0.85)
                add_diamond_index(bm, p_in, -rad_out, tan, length=0.014, width=0.008,
                                  height=0.016, mat_idx=HM_GOLD)

        # Delicate observatory spire finial at zenith of outer ring (reaches total height ~0.875m!)
        if has_zenith_finial:
            fin_m = Matrix.Translation((0.0, 0.0, radius + ht))
            fin_prof = [
                (0.016, 0.000),
                (0.018, 0.006),
                (0.011, 0.012),
                (0.013, 0.018),
                (0.007, 0.026),
                (0.009, 0.032),
                (0.0045, 0.044),
                (0.0012, 0.064),
            ]
            add_lathe_profile(bm, fin_prof, segments=24, mat_idx=HM_GOLD, cap_top=True, matrix=fin_m)
            add_faceted_gem(bm, Vector((0.0, 0.0, radius + ht + 0.018)), Vector((0.0, -1.0, 0.0)),
                            radius=0.006, height=0.004, bezel_mat=HM_GOLD, gem_mat=HM_SAPPHIRE, facets=10)

        return finalize_mesh_obj(
            name, bm, mats, collection,
            location=(0.0, 0.0, ORB_CENTER_Z),
            rotation_euler=rot_euler,
            sharp_angle_deg=36.0,
            uv_scale=2.2,
        )

    ring_outer = build_armillary_ring(
        "Ring_Outer",
        radius=0.365,
        band_width=0.021,
        thickness=0.013,
        main_mat=HM_GOLD,
        accent_mat=HM_GUNMETAL,
        jewel_mat=HM_SAPPHIRE,
        rot_euler=(0.0, 0.0, math.radians(14.0)),
        openwork_twin=False,
        tick_count=36,
        has_zenith_finial=True,
    )
    ring_mid = build_armillary_ring(
        "Ring_Mid",
        radius=0.320,
        band_width=0.019,
        thickness=0.0115,
        main_mat=HM_BRASS,
        accent_mat=HM_GOLD,
        jewel_mat=HM_RUBY,
        rot_euler=(math.radians(26.0), math.radians(-18.0), math.radians(38.0)),
        openwork_twin=True,
        tick_count=24,
    )
    ring_inner = build_armillary_ring(
        "Ring_Inner",
        radius=0.276,
        band_width=0.0155,
        thickness=0.010,
        main_mat=HM_ROSE,
        accent_mat=HM_GUNMETAL,
        jewel_mat=HM_SAPPHIRE,
        rot_euler=(math.radians(-30.0), math.radians(26.0), math.radians(-24.0)),
        openwork_twin=False,
        tick_count=24,
        inward_pointers=True,
    )
    objects.extend([ring_outer, ring_mid, ring_inner])

    # -----------------------------------------------------------------------
    # 3. Petal_0 .. Petal_5: 6 Doubly-Curved Sculpted Obsidian & 18k Gold Faberge Petals
    #    Origin at (0, 0, 0.44) -> Godot (0, 0.44, 0), local -Y = Godot +Z outward!
    # -----------------------------------------------------------------------
    petals = []
    for p_idx in range(6):
        bm_p = bmesh.new()

        n_lat = 22
        n_lon = 12
        phi_min = math.radians(-52.0)
        phi_max = math.radians(58.0)
        r_inner_base = 0.191
        r_outer_base = 0.203

        def petal_half_angle(t_lat: float) -> float:
            # Smooth Faberge teardrop / lotus envelope: gently broader near lower-mid, graceful ogive tips
            env = math.sin(clamp(t_lat, 0.0, 1.0) * math.pi)
            teardrop = (env ** 0.82) * (1.06 - 0.18 * t_lat)
            return math.radians(2.0 + 22.8 * teardrop)

        outer_grid = []
        inner_grid = []
        for i in range(n_lat):
            t_lat = i / (n_lat - 1)
            phi = lerp(phi_min, phi_max, t_lat)
            c_phi, s_phi = math.cos(phi), math.sin(phi)
            h_ang = petal_half_angle(t_lat)
            lat_swell = math.sin(t_lat * math.pi)

            o_row = []
            i_row = []
            for j in range(n_lon):
                u = (j / (n_lon - 1)) * 2.0 - 1.0  # -1..+1
                th = u * h_ang
                # Center points along -Y (front toward viewer in Blender -> +Z in Godot!)
                s_th, c_th = math.sin(th), math.cos(th)
                edge_taper = math.cos(u * math.pi * 0.5) ** 0.65
                r_out = r_outer_base + 0.0085 * lat_swell * edge_taper
                r_in = r_inner_base + 0.0025 * lat_swell * edge_taper

                # Spherical coordinates centered on -Y axis
                dir_v = Vector((c_phi * s_th, -c_phi * c_th, s_phi))
                o_row.append(bm_p.verts.new(dir_v * r_out))
                i_row.append(bm_p.verts.new(dir_v * r_in))
            outer_grid.append(o_row)
            inner_grid.append(i_row)

        # Outer & Inner obsidian shell quads
        for i in range(n_lat - 1):
            for j in range(n_lon - 1):
                fo = bm_p.faces.new((
                    outer_grid[i][j], outer_grid[i][j + 1],
                    outer_grid[i + 1][j + 1], outer_grid[i + 1][j]
                ))
                fo.material_index = HM_OBSIDIAN
                fo.smooth = True

                fi = bm_p.faces.new((
                    inner_grid[i][j], inner_grid[i + 1][j],
                    inner_grid[i + 1][j + 1], inner_grid[i][j + 1]
                ))
                fi.material_index = HM_OBSIDIAN
                fi.smooth = True

        # Side walls connecting outer & inner shells (beveled gold rim encloses these cleanly!)
        for i in range(n_lat - 1):
            # Left side j=0
            fl = bm_p.faces.new((inner_grid[i][0], outer_grid[i][0], outer_grid[i + 1][0], inner_grid[i + 1][0]))
            fl.material_index = HM_GOLD
            fl.smooth = True
            # Right side j=n_lon-1
            fr = bm_p.faces.new((outer_grid[i][-1], inner_grid[i][-1], inner_grid[i + 1][-1], outer_grid[i + 1][-1]))
            fr.material_index = HM_GOLD
            fr.smooth = True

        for j in range(n_lon - 1):
            # Bottom tip i=0
            fb = bm_p.faces.new((inner_grid[0][j], inner_grid[0][j + 1], outer_grid[0][j + 1], outer_grid[0][j]))
            fb.material_index = HM_GOLD
            fb.smooth = True
            # Top tip i=n_lat-1
            ft = bm_p.faces.new((outer_grid[-1][j], outer_grid[-1][j + 1], inner_grid[-1][j + 1], inner_grid[-1][j]))
            ft.material_index = HM_GOLD
            ft.smooth = True

        # Continuous Delicate 18k Brushed-Gold Filigree Rim sweeping completely around the teardrop border!
        rim_pts = []
        # Up the right edge
        for i in range(n_lat):
            t_lat = i / (n_lat - 1)
            phi = lerp(phi_min, phi_max, t_lat)
            h_ang = petal_half_angle(t_lat)
            r_mid = 0.5 * (r_inner_base + r_outer_base) + 0.0025
            rim_pts.append(Vector((math.cos(phi) * math.sin(h_ang), -math.cos(phi) * math.cos(h_ang), math.sin(phi))) * r_mid)
        # Down the left edge
        for i in range(n_lat - 1, -1, -1):
            t_lat = i / (n_lat - 1)
            phi = lerp(phi_min, phi_max, t_lat)
            h_ang = -petal_half_angle(t_lat)
            r_mid = 0.5 * (r_inner_base + r_outer_base) + 0.0025
            rim_pts.append(Vector((math.cos(phi) * math.sin(h_ang), -math.cos(phi) * math.cos(h_ang), math.sin(phi))) * r_mid)

        rim_cs = [
            (0.0046, 0.000),
            (0.0032, 0.0040),
            (-0.0032, 0.0040),
            (-0.0052, 0.000),
            (-0.0032, -0.0040),
            (0.0032, -0.0040),
        ]
        add_swept_profile(bm_p, rim_pts, rim_cs, mat_idx=HM_GOLD, closed_path=True, up_hint=Vector((0, -1, 0)))

        # Central sculpted gold filigree spine rib running gracefully down the obsidian petal centerline
        spine_pts = []
        for i in range(18):
            t_lat = 0.06 + (i / 17.0) * 0.88
            phi = lerp(phi_min, phi_max, t_lat)
            lat_swell = math.sin(t_lat * math.pi)
            r_sp = r_outer_base + 0.0088 * lat_swell + 0.0020
            spine_pts.append(Vector((0.0, -math.cos(phi), math.sin(phi))) * r_sp)

        spine_cs = [
            (-0.0030, -0.0020),
            (0.0030, -0.0020),
            (0.0018, 0.0032),
            (-0.0018, 0.0032),
        ]
        add_swept_profile(
            bm_p, spine_pts, spine_cs, mat_idx=HM_GOLD, closed_path=False, cap_ends=True,
            up_hint=Vector((1, 0, 0)),
            scale_fn=lambda u: 0.45 + 0.85 * math.sin(u * math.pi),
        )

        # Faberge Waist Diamond Filigree Medallion & Recessed Sapphire Cabochon at petal waist (phi = 0°)
        waist_pos = Vector((0.0, -(r_outer_base + 0.0095), 0.0))
        add_diamond_index(bm_p, waist_pos, Vector((0, -1, 0)), Vector((0, 0, 1)),
                          length=0.044, width=0.026, height=0.006, mat_idx=HM_GOLD)
        add_faceted_gem(bm_p, waist_pos + Vector((0, -0.0038, 0)), Vector((0, -1, 0)),
                        radius=0.0085, height=0.0065, bezel_mat=HM_GOLD,
                        gem_mat=(HM_SAPPHIRE if p_idx % 2 == 0 else HM_RUBY), facets=12)

        # Delicate top & bottom gold finial beads
        top_dir = Vector((0.0, -math.cos(phi_max), math.sin(phi_max)))
        bot_dir = Vector((0.0, -math.cos(phi_min), math.sin(phi_min)))
        add_diamond_index(bm_p, top_dir * (r_outer_base + 0.002), top_dir, Vector((0, 0, 1)),
                          length=0.018, width=0.010, height=0.006, mat_idx=HM_GOLD)
        add_diamond_index(bm_p, bot_dir * (r_outer_base + 0.002), bot_dir, Vector((0, 0, 1)),
                          length=0.018, width=0.010, height=0.006, mat_idx=HM_GOLD)

        petal_obj = finalize_mesh_obj(
            f"Petal_{p_idx}",
            bm_p,
            mats,
            collection,
            location=(0.0, 0.0, ORB_CENTER_Z),
            rotation_euler=(0.0, 0.0, p_idx * (math.tau / 6.0)),
            sharp_angle_deg=38.0,
            uv_scale=2.5,
        )
        petals.append(petal_obj)
        objects.append(petal_obj)

    # -----------------------------------------------------------------------
    # 4. Caliper_0 .. Caliper_3: 4 Slender Machined Gold Watchmaker Overclock Crescent Blades
    #    Origin at (0, 0, 0.44) -> Godot (0, 0.44, 0), interleaved at 45°, 135°, 225°, 315°
    # -----------------------------------------------------------------------
    calipers = []
    for c_idx in range(4):
        bm_c = bmesh.new()
        r_cal = 0.244
        steps = 26
        phi_lo = math.radians(-46.0)
        phi_hi = math.radians(46.0)

        # Main crescent blade path along -Y meridian (radius subtly swells at center, pinches inward at tips!)
        blade_pts = []
        for k in range(steps):
            t = k / (steps - 1)
            phi = lerp(phi_lo, phi_hi, t)
            arch = math.sin(t * math.pi)
            rr = r_cal - 0.014 * (1.0 - arch)
            blade_pts.append(Vector((0.0, -math.cos(phi) * rr, math.sin(phi) * rr)))

        # Sharp sculpted watchmaker airfoil/crescent blade cross-section
        blade_cs = [
            (-0.0095, -0.0020),
            (-0.0045, -0.0052),
            (0.0045, -0.0052),
            (0.0095, -0.0020),
            (0.0060, 0.0042),
            (0.0000, 0.0062),
            (-0.0060, 0.0042),
        ]

        def cal_scale(u):
            # Razor-refined needle tips, confident watchmaker caliper waist
            e = math.sin(clamp(u, 0.0, 1.0) * math.pi)
            return (0.14 + 0.96 * (e ** 0.72), 0.22 + 0.85 * (e ** 0.65))

        add_swept_profile(
            bm_c, blade_pts, blade_cs, mat_idx=HM_GOLD,
            closed_path=False, cap_ends=True, up_hint=Vector((1, 0, 0)), scale_fn=cal_scale
        )

        # Gunmetal precision recessed spine strip along outer curvature
        spine_pts = []
        for k in range(18):
            t = 0.14 + (k / 17.0) * 0.72
            phi = lerp(phi_lo, phi_hi, t)
            arch = math.sin(t * math.pi)
            rr = r_cal - 0.014 * (1.0 - arch) + 0.0055 * (0.22 + 0.85 * (arch ** 0.65))
            spine_pts.append(Vector((0.0, -math.cos(phi) * rr, math.sin(phi) * rr)))

        sp_cs = [(-0.0032, -0.0018), (0.0032, -0.0018), (0.0022, 0.0022), (-0.0022, 0.0022)]
        add_swept_profile(
            bm_c, spine_pts, sp_cs, mat_idx=HM_GUNMETAL,
            closed_path=False, cap_ends=True, up_hint=Vector((1, 0, 0)),
            scale_fn=lambda u: 0.4 + 0.75 * math.sin(u * math.pi),
        )

        # Equator watchmaker circular pivot boss + synthetic ruby jewel bearing
        boss_pos = Vector((0.0, -(r_cal + 0.005), 0.0))
        boss_m = Matrix.Translation(boss_pos) @ Matrix.Rotation(math.pi * 0.5, 4, "X")
        boss_prof = [
            (0.0155, -0.004),
            (0.0165, 0.002),
            (0.0135, 0.007),
            (0.0090, 0.008),
        ]
        add_lathe_profile(bm_c, boss_prof, segments=24, mat_idx=HM_BRASS, cap_top=True, matrix=boss_m)
        add_faceted_gem(bm_c, boss_pos + Vector((0, -0.006, 0)), Vector((0, -1, 0)),
                        radius=0.0072, height=0.0055, bezel_mat=HM_GOLD, gem_mat=HM_RUBY, facets=12)

        cal_obj = finalize_mesh_obj(
            f"Caliper_{c_idx}",
            bm_c,
            mats,
            collection,
            location=(0.0, 0.0, ORB_CENTER_Z),
            rotation_euler=(0.0, 0.0, (c_idx + 0.5) * (math.pi * 0.5)),
            sharp_angle_deg=34.0,
            uv_scale=2.4,
        )
        calipers.append(cal_obj)
        objects.append(cal_obj)

    # -----------------------------------------------------------------------
    # 5. Crystal_Core: Precision-Cut Faceted Diamond-Gold Crystal + Delicate Gold Wire Filigree Cage
    #    Origin at (0, 0, 0.44) -> Godot (0, 0.44, 0)
    # -----------------------------------------------------------------------
    bm_core = bmesh.new()

    # Brilliant-cut star-faceted icosahedral crystal (r ~ 0.108m, razor-sharp crystal facets!)
    ico_ret = bmesh.ops.create_icosphere(bm_core, subdivisions=1, radius=0.098)
    ico_verts = ico_ret["verts"]
    ico_faces = list({f for v in ico_verts for f in v.link_faces})
    # Poke every triangular face slightly outward to create dazzling diamond-brilliant double-facets!
    poke_ret = bmesh.ops.poke(bm_core, faces=ico_faces)
    for pv in poke_ret["verts"]:
        pv.co = pv.co.normalized() * 0.112
    for f in bm_core.faces:
        f.material_index = HM_CRYSTAL
        f.smooth = False  # Intentionally razor-crisp diamond facets!

    # Delicate 18k Gold Wire Filigree Tourbillon Cage (r = 0.132m, slender 0.0038m wire)
    r_cage = 0.132
    wire_cs = [
        (0.0036, 0.0000),
        (0.0025, 0.0025),
        (0.0000, 0.0036),
        (-0.0025, 0.0025),
        (-0.0036, 0.0000),
        (-0.0025, -0.0025),
        (0.0000, -0.0036),
        (0.0025, -0.0025),
    ]
    # 3 spherical meridian filigree wire loops (60° apart)
    for m_i in range(3):
        az = m_i * (math.pi / 3.0)
        ca, sa = math.cos(az), math.sin(az)
        m_pts = [
            Vector((math.cos(k / 48.0 * math.tau) * ca * r_cage,
                    math.cos(k / 48.0 * math.tau) * sa * r_cage,
                    math.sin(k / 48.0 * math.tau) * r_cage))
            for k in range(48)
        ]
        add_swept_profile(bm_core, m_pts, wire_cs, mat_idx=HM_GOLD, closed_path=True,
                          up_hint=Vector((-sa, ca, 0.0)))

    # Delicate equatorial filigree ring + twin upper/lower latitude filigree hoops (±34°)
    for lat_deg, scale_w in ((0.0, 1.05), (34.0, 0.78), (-34.0, 0.78)):
        lat = math.radians(lat_deg)
        rr = math.cos(lat) * r_cage
        zz = math.sin(lat) * r_cage
        eq_pts = [
            Vector((math.cos(k / 48.0 * math.tau) * rr, math.sin(k / 48.0 * math.tau) * rr, zz))
            for k in range(48)
        ]
        add_swept_profile(bm_core, eq_pts, [(x * scale_w, y * scale_w) for (x, y) in wire_cs],
                          mat_idx=HM_GOLD, closed_path=True, up_hint=Vector((0, 0, 1)))

    # Polar miniature lathe-turned gold finial bosses + tiny ruby caps
    for sign in (-1.0, 1.0):
        pol_m = Matrix.Translation((0.0, 0.0, sign * r_cage))
        if sign < 0:
            pol_m = pol_m @ Matrix.Rotation(math.pi, 4, "X")
        pol_prof = [
            (0.016, -0.004),
            (0.018, 0.003),
            (0.012, 0.010),
            (0.006, 0.018),
            (0.0015, 0.025),
        ]
        add_lathe_profile(bm_core, pol_prof, segments=20, mat_idx=HM_GOLD, cap_top=True, matrix=pol_m)

    obj_core = finalize_mesh_obj(
        "Crystal_Core",
        bm_core,
        mats,
        collection,
        location=(0.0, 0.0, ORB_CENTER_Z),
        sharp_angle_deg=36.0,
        uv_scale=3.0,
        keep_flat_mats={HM_CRYSTAL},  # Keeps diamond heart facets razor-crisp!
    )
    objects.append(obj_core)

    return objects, {
        "base": obj_base,
        "rings": [ring_outer, ring_mid, ring_inner],
        "petals": petals,
        "calipers": calipers,
        "core": obj_core,
    }


# ===========================================================================
# ASSET 3: RENAISSANCE-MODERNIST DA VINCI CODEX CRYPTEX (codex_cryptex.glb)
#   Dimensions: r = 0.22m, height = 0.48m, base flush at Y_g = 0.0 (Z_b = 0.0)
# ===========================================================================
def build_codex_cryptex_objects(mats, collection):
    """
    Constructs a smooth lathe-turned da Vinci Cryptex with:
      - Cryptex_Body (marble/brass cradle base, 4 curved scroll feet, lower & upper brass caps, inner core)
      - Cryptex_Sightlines (twin gold alignment rails with diamond pointers & ruby indices)
      - Cryptex_Ring_0, Cryptex_Ring_1, Cryptex_Ring_2 (3 separate named rotating engraved cipher rings!)
    """
    objects = []

    # 1. Cryptex_Body (origin 0,0,0)
    bm_body = bmesh.new()

    # Stepped circular dark-marble plinth base (r=0.205m, z=0.008..0.064m) resting on 4 brass cradle feet
    base_prof = [
        (0.006, 0.008),
        (0.195, 0.008),
        (0.205, 0.014),
        (0.205, 0.032),
        (0.192, 0.044),
        (0.175, 0.056),
        (0.155, 0.064),
    ]
    add_lathe_profile(bm_body, base_prof, segments=72, mat_idx=HM_MARBLE, cap_bottom=True, cap_top=True)

    # Lower lathe-turned antique-brass end-cap & knurled collar (z=0.058..0.122m)
    low_cap_prof = [
        (0.188, 0.042),
        (0.196, 0.046),
        (0.196, 0.056),
        (0.176, 0.064),
        (0.172, 0.078),
        (0.178, 0.086),
        (0.178, 0.104),
        (0.166, 0.114),
        (0.156, 0.122),
        (0.122, 0.122),
    ]
    add_lathe_profile(bm_body, low_cap_prof, segments=72, mat_idx=HM_BRASS,
                      flute_count=36, flute_depth=0.0018)

    # Central locked obsidian drum core spanning behind the 3 rotating rings (z=0.118..0.376m)
    core_prof = [
        (0.124, 0.118),
        (0.124, 0.376),
    ]
    add_lathe_profile(bm_body, core_prof, segments=64, mat_idx=HM_OBSIDIAN)

    # Subtle recessed brass detent separator collars between rings (z=0.205m and z=0.285m)
    for z_sep in (0.205, 0.285):
        sep_prof = [
            (0.124, z_sep - 0.006),
            (0.152, z_sep - 0.005),
            (0.155, z_sep),
            (0.152, z_sep + 0.005),
            (0.124, z_sep + 0.006),
        ]
        add_lathe_profile(bm_body, sep_prof, segments=64, mat_idx=HM_GOLD)

    # Upper lathe-turned Renaissance domed brass crown cap (z=0.370..0.448m)
    top_cap_prof = [
        (0.122, 0.370),
        (0.158, 0.370),
        (0.174, 0.380),
        (0.178, 0.396),
        (0.168, 0.408),
        (0.146, 0.422),
        (0.112, 0.435),
        (0.068, 0.444),
        (0.036, 0.448),
        (0.004, 0.450),
    ]
    add_lathe_profile(bm_body, top_cap_prof, segments=72, mat_idx=HM_BRASS, cap_top=True)

    # Stepped gold crown bezel collar on top cap + Renaissance pull-ring finial (reaches exact Z = 0.480m!)
    top_collar = [
        (0.170, 0.382),
        (0.181, 0.386),
        (0.181, 0.394),
        (0.170, 0.398),
    ]
    add_lathe_profile(bm_body, top_collar, segments=72, mat_idx=HM_GOLD,
                      closed_profile=True, flute_count=36, flute_depth=0.0020)

    fin_stem = [
        (0.032, 0.446),
        (0.035, 0.452),
        (0.018, 0.458),
        (0.022, 0.464),
        (0.012, 0.474),
        (0.003, 0.480),
    ]
    add_lathe_profile(bm_body, fin_stem, segments=32, mat_idx=HM_GOLD, cap_top=True)

    # 4 Sculpted Curved Antique-Brass Cradle Feet resting flush at Z=0.0 (outer radius 0.220m!)
    foot_cs = [(-0.012, -0.006), (0.012, -0.006), (0.010, 0.007), (-0.010, 0.007)]
    for f_i in range(4):
        ang = math.radians(45.0 + f_i * 90.0)
        ca, sa = math.cos(ang), math.sin(ang)
        f_pts = [
            Vector((ca * 0.218, sa * 0.218, 0.006)),
            Vector((ca * 0.214, sa * 0.214, 0.022)),
            Vector((ca * 0.198, sa * 0.198, 0.044)),
            Vector((ca * 0.178, sa * 0.178, 0.072)),
        ]
        add_swept_profile(bm_body, f_pts, foot_cs, mat_idx=HM_GOLD, closed_path=False, cap_ends=True,
                          up_hint=Vector((-sa, ca, 0.0)))
        pad_m = Matrix.Translation((ca * 0.218, sa * 0.218, 0.0))
        add_lathe_profile(bm_body, [(0.002, 0.0), (0.019, 0.0), (0.020, 0.005), (0.014, 0.010)],
                          segments=20, mat_idx=HM_BRASS, cap_bottom=True, cap_top=True, matrix=pad_m)

    obj_body = finalize_mesh_obj("Cryptex_Body", bm_body, mats, collection, sharp_angle_deg=35.0, uv_scale=2.2)
    objects.append(obj_body)

    # 2. Cryptex_Sightlines: Twin Precision 18k Gold Vertical Alignment Rails facing camera (-Y / +Z_g)
    bm_rails = bmesh.new()
    rail_r = 0.184
    for side in (-1.0, 1.0):
        ang = side * math.radians(17.5)
        rx = math.sin(ang) * rail_r
        ry = -math.cos(ang) * rail_r
        rail_pts = [
            Vector((rx * 0.96, ry * 0.96, 0.088)),
            Vector((rx, ry, 0.105)),
            Vector((rx, ry, 0.386)),
            Vector((rx * 0.96, ry * 0.96, 0.402)),
        ]
        r_cs = [
            (-0.0055, -0.0060),
            (0.0055, -0.0060),
            (0.0072, 0.0000),
            (0.0045, 0.0065),
            (-0.0045, 0.0065),
            (-0.0072, 0.0000),
        ]
        add_swept_profile(bm_rails, rail_pts, r_cs, mat_idx=HM_GOLD, closed_path=False, cap_ends=True,
                          up_hint=Vector((math.cos(ang), math.sin(ang), 0.0)))

        # Anchoring brass lugs at top & bottom of rail
        for z_lug in (0.095, 0.392):
            lug_m = (
                Matrix.Translation((rx * 0.94, ry * 0.94, z_lug))
                @ Matrix.Rotation(ang, 4, "Z")
            )
            add_chamfered_box(bm_rails, 0.018, 0.026, 0.016, bevel=0.003, mat_idx=HM_BRASS, matrix=lug_m, segments=1)
            add_faceted_gem(bm_rails, Vector((rx * 1.03, ry * 1.03, z_lug)),
                            Vector((math.sin(ang), -math.cos(ang), 0.0)),
                            radius=0.0055, height=0.0045, bezel_mat=HM_GOLD, gem_mat=HM_RUBY, facets=10)

        # Inward-pointing precision gold alignment chevrons aimed at each of the 3 tumbler rings!
        for z_ring in (0.165, 0.245, 0.325):
            inward_t = Vector((-side * math.cos(ang), -side * math.sin(ang), 0.0))
            p_chev = Vector((rx, ry, z_ring)) + inward_t * 0.006
            add_diamond_index(bm_rails, p_chev, inward_t, Vector((0, 0, 1)),
                              length=0.014, width=0.009, height=0.013, mat_idx=HM_GOLD)

    # Top & bottom cross-bridges linking the twin gold sightline rails
    for z_br in (0.095, 0.392):
        arc_pts = []
        for k in range(11):
            a = lerp(math.radians(-17.5), math.radians(17.5), k / 10.0)
            arc_pts.append(Vector((math.sin(a) * rail_r, -math.cos(a) * rail_r, z_br)))
        add_swept_profile(bm_rails, arc_pts, [(-0.004, -0.004), (0.004, -0.004), (0.004, 0.004), (-0.004, 0.004)],
                          mat_idx=HM_GOLD, closed_path=False, cap_ends=True, up_hint=Vector((0, 0, 1)))

    obj_rails = finalize_mesh_obj("Cryptex_Sightlines", bm_rails, mats, collection, sharp_angle_deg=34.0, uv_scale=2.5)
    objects.append(obj_rails)

    # 3. Cryptex_Ring_0, Cryptex_Ring_1, Cryptex_Ring_2 (separate rotating engraved brass & obsidian tumblers!)
    ring_heights = (0.165, 0.245, 0.325)
    for r_i, z_c in enumerate(ring_heights):
        bm_r = bmesh.new()
        half_h = 0.034

        # Glossy obsidian central engraved cylinder band (r = 0.160m)
        band_prof = [
            (0.128, -half_h),
            (0.158, -half_h),
            (0.160, -half_h * 0.72),
            (0.160, half_h * 0.72),
            (0.158, half_h),
            (0.128, half_h),
        ]
        add_lathe_profile(bm_r, band_prof, segments=64, mat_idx=HM_OBSIDIAN, closed_profile=True)

        # Upper & lower machined scalloped antique-brass flanges (watchmaker grip rims!)
        for sgn in (-1.0, 1.0):
            z_lo = sgn * (half_h - 0.009)
            z_hi = sgn * half_h
            z0, z1 = min(z_lo, z_hi), max(z_lo, z_hi)
            flange_prof = [
                (0.156, z0),
                (0.169, z0 + 0.002),
                (0.169, z1 - 0.002),
                (0.156, z1),
            ]
            add_lathe_profile(bm_r, flange_prof, segments=72, mat_idx=HM_BRASS,
                              closed_profile=True, flute_count=36, flute_depth=0.0025)

        # 12 Sculpted 18k Gold Cipher Cartouche Frames & Horological Relief Dividers around circumference
        for k in range(12):
            a = (k / 12.0) * math.tau
            ca, sa = math.cos(a), math.sin(a)
            rad = Vector((ca, sa, 0.0))
            # Vertical gold divider rib between cipher glyphs
            rib_a = a + math.tau / 24.0
            rm = Matrix.Translation((math.cos(rib_a) * 0.160, math.sin(rib_a) * 0.160, 0.0)) @ Matrix.Rotation(rib_a, 4, "Z")
            add_chamfered_box(bm_r, 0.006, 0.0045, half_h * 1.45, bevel=0.001, mat_idx=HM_GOLD, matrix=rm, segments=1)

            # Sculpted raised gold cipher diamond / bar emblem in each slot (varied by ring + slot!)
            em_pos = rad * 0.1605
            add_diamond_index(bm_r, em_pos, rad, Vector((0, 0, 1)),
                              length=0.022, width=0.014, height=0.0042, mat_idx=HM_GOLD)
            if (k + r_i) % 3 == 0:
                add_faceted_gem(bm_r, rad * 0.1635, rad, radius=0.0042, height=0.0032,
                                bezel_mat=HM_GOLD, gem_mat=(HM_SAPPHIRE if r_i != 1 else HM_RUBY), facets=8)

        ring_obj = finalize_mesh_obj(
            f"Cryptex_Ring_{r_i}",
            bm_r,
            mats,
            collection,
            location=(0.0, 0.0, z_c),
            rotation_euler=(0.0, 0.0, r_i * math.radians(15.0)),
            sharp_angle_deg=34.0,
            uv_scale=2.6,
        )
        objects.append(ring_obj)

    return objects


# ===========================================================================
# ASSET 4: SWISS MARINE CALIBRATOR CHRONOMETER (calibrator_chronometer.glb)
#   Dimensions: r = 0.34m, base flush at Y_g = 0.0, tilted 28° toward camera!
# ===========================================================================
CHRONO_CENTER_Z = 0.365
CHRONO_TILT_RAD = math.radians(-28.0)  # Tilts -Y dial normal UP 28° toward seated camera!


def build_calibrator_chronometer_objects(mats, collection):
    """
    Constructs a museum-grade Swiss Marine Chronometer / Brass Astrolabe Dial:
      - Chronometer_Stand (marble & walnut elliptical base + sculpted antique-brass marine gimbal yoke)
      - Chronometer_Bezel (64-segment stepped brass case, 60 milled ticks, 12-o'clock winding crown; tilted 28°)
      - Chronometer_Face (child of Bezel: concave midnight-sapphire enamel dial with gilded compass rose)
      - Chronometer_Glass (child of Bezel: clearcoat domed optical sapphire glass lens)
      - Chronometer_Needle (child of Bezel: razor-sharp sculpted gilded cathedral compass hand, local Z-spin!)
    """
    objects = []

    # 1. Chronometer_Stand (origin 0,0,0 — rests flush on Z=0.0)
    bm_stand = bmesh.new()

    # Stepped smoked-walnut & dark-marble elliptical base plinth (z = 0.006 .. 0.056m)
    add_superellipse_extrusion(bm_stand, rx=0.255, ry=0.165, exp_n=2.2, z0=0.006, z1=0.036,
                               segments=64, mat_idx=HM_WALNUT, bevel_z=0.006, bevel_r=0.008)
    add_superellipse_extrusion(bm_stand, rx=0.228, ry=0.142, exp_n=2.2, z0=0.034, z1=0.056,
                               segments=64, mat_idx=HM_MARBLE, bevel_z=0.005, bevel_r=0.006)

    # Hairline brushed-brass perimeter inlay collar on base
    add_superellipse_extrusion(bm_stand, rx=0.234, ry=0.147, exp_n=2.2, z0=0.032, z1=0.040,
                               segments=64, mat_idx=HM_BRASS, bevel_z=0.002, bevel_r=0.002,
                               cap_bottom=False, cap_top=False)

    # 4 Brass leveling feet flush at Z=0.0
    for fx, fy in ((-0.20, -0.11), (0.20, -0.11), (-0.20, 0.11), (0.20, 0.11)):
        fm = Matrix.Translation((fx, fy, 0.0))
        add_lathe_profile(bm_stand, [(0.002, 0.0), (0.018, 0.0), (0.020, 0.005), (0.014, 0.012)],
                          segments=20, mat_idx=HM_GOLD, cap_bottom=True, cap_top=True, matrix=fm)

    # Central lathe-turned brass pedestal stem rising to the U-gimbal cradle (z = 0.052 .. 0.088m)
    stem_prof = [
        (0.068, 0.052),
        (0.062, 0.062),
        (0.044, 0.074),
        (0.052, 0.086),
    ]
    add_lathe_profile(bm_stand, stem_prof, segments=48, mat_idx=HM_BRASS, cap_top=True)

    # Sculpted Curved U-Shaped Antique-Brass Marine Gimbal Yoke embracing the dial at X = ±0.342m, Z = 0.365m!
    yoke_pts = []
    yoke_steps = 45
    r_yoke = 0.352
    for k in range(yoke_steps):
        # Sweeps from -90° (left trunnion) through 0° (bottom nadir) to +90° (right trunnion)
        ang = lerp(-math.pi * 0.5, math.pi * 0.5, k / (yoke_steps - 1))
        x = math.sin(ang) * r_yoke
        z = CHRONO_CENTER_Z - math.cos(ang) * (CHRONO_CENTER_Z - 0.072)
        yoke_pts.append(Vector((x, 0.0, z)))

    yoke_cs = [
        (-0.012, -0.016),
        (0.012, -0.016),
        (0.016, -0.008),
        (0.016, 0.008),
        (0.012, 0.016),
        (-0.012, 0.016),
        (-0.016, 0.008),
        (-0.016, -0.008),
    ]
    add_swept_profile(
        bm_stand, yoke_pts, yoke_cs, mat_idx=HM_BRASS, closed_path=False, cap_ends=True,
        up_hint=Vector((0, 1, 0)),
        scale_fn=lambda u: 1.0 + 0.35 * (math.sin(u * math.pi) ** 2),
    )

    # Left & right knurled brass gimbal trunnion lock-knobs at X = ±0.352m, Z = CHRONO_CENTER_Z
    for side in (-1.0, 1.0):
        km = (
            Matrix.Translation((side * (r_yoke - 0.012), 0.0, CHRONO_CENTER_Z))
            @ Matrix.Rotation(side * math.pi * 0.5, 4, "Y")
        )
        knob_prof = [
            (0.014, -0.015),
            (0.022, 0.002),
            (0.024, 0.018),
            (0.030, 0.022),
            (0.030, 0.036),
            (0.022, 0.042),
            (0.012, 0.044),
        ]
        add_lathe_profile(bm_stand, knob_prof, segments=32, mat_idx=HM_GOLD,
                          cap_top=True, matrix=km, flute_count=24, flute_depth=0.0018)

    obj_stand = finalize_mesh_obj("Chronometer_Stand", bm_stand, mats, collection, sharp_angle_deg=35.0, uv_scale=2.0)
    objects.append(obj_stand)

    # 2. Chronometer_Bezel (origin at dial center (0, 0, 0.365), tilted -28° around X toward camera!)
    #    Local convention: dial lies in XZ plane, front faces -Y (Godot +Z!), 12 o'clock is +Z (Godot +Y!)
    bm_bezel = bmesh.new()
    # Lathe axis is local Y -> map standard Z-lathe via Rx(+90°) so lathe +Z becomes local -Y (front)!
    m_front = Matrix.Rotation(math.pi * 0.5, 4, "X")

    # Stepped solid-brass marine chronometer drum case & multi-tiered beveled bezel (r = 0.332m, 64 segs)
    case_prof = [
        (0.005, -0.068),
        (0.285, -0.068),
        (0.312, -0.056),
        (0.326, -0.036),
        (0.332, -0.010),
        (0.332, 0.022),
        (0.324, 0.038),
        (0.312, 0.048),
        (0.296, 0.050),
        (0.285, 0.040),
        (0.282, 0.018),
        (0.278, 0.004),
    ]
    add_lathe_profile(bm_bezel, case_prof, segments=64, mat_idx=HM_BRASS, cap_bottom=True, matrix=m_front)

    # Coin-edge scalloped brushed-gold outer decorative bezel ring
    coin_prof = [
        (0.326, 0.008),
        (0.336, 0.014),
        (0.336, 0.028),
        (0.322, 0.036),
    ]
    add_lathe_profile(bm_bezel, coin_prof, segments=96, mat_idx=HM_GOLD,
                      closed_profile=True, matrix=m_front, flute_count=48, flute_depth=0.0024)

    # Inner stepped chamfered dark-gunmetal chapter flange around the dial edge
    chapter_prof = [
        (0.278, 0.006),
        (0.288, 0.024),
        (0.294, 0.026),
        (0.286, 0.004),
    ]
    add_lathe_profile(bm_bezel, chapter_prof, segments=64, mat_idx=HM_GUNMETAL, closed_profile=True, matrix=m_front)

    # 60 Crisp Milled Gold Precision Graduation Indices around the dial perimeter!
    for k in range(60):
        a = (k / 60.0) * math.tau
        sa, ca = math.sin(a), math.cos(a)  # 0° = 12 o'clock (+Z), clockwise in XZ plane
        is_cardinal = (k % 15 == 0)
        is_hour = (k % 5 == 0)
        if is_cardinal:
            r_in, r_out, w, h = 0.236, 0.276, 0.011, 0.0075
        elif is_hour:
            r_in, r_out, w, h = 0.248, 0.276, 0.0068, 0.0055
        else:
            r_in, r_out, w, h = 0.262, 0.276, 0.0028, 0.0032
        r_mid = 0.5 * (r_in + r_out)
        pos = Vector((sa * r_mid, -0.008, ca * r_mid))
        tan = Vector((sa, 0.0, ca))
        add_diamond_index(bm_bezel, pos, Vector((0, -1, 0)), tan,
                          length=(r_out - r_in), width=w, height=h, mat_idx=HM_GOLD)

    # 8 Countersunk gold perimeter bezel rivets/jewels on the stepped outer bezel face
    for k in range(8):
        a = (k / 8.0) * math.tau + math.pi / 8.0
        pos = Vector((math.sin(a) * 0.308, -0.044, math.cos(a) * 0.308))
        add_faceted_gem(bm_bezel, pos, Vector((0, -1, 0)), radius=0.0058, height=0.0042,
                        bezel_mat=HM_GOLD, gem_mat=(HM_SAPPHIRE if k % 2 == 0 else HM_RUBY), facets=10)

    # 12-o'clock Fluted Watchmaker Winding Crown & Pendant Bow
    crown_m = Matrix.Translation((0.0, -0.006, 0.330))
    crown_prof = [
        (0.022, 0.000),
        (0.024, 0.014),
        (0.016, 0.022),
        (0.032, 0.028),
        (0.032, 0.048),
        (0.024, 0.056),
        (0.010, 0.058),
    ]
    add_lathe_profile(bm_bezel, crown_prof, segments=32, mat_idx=HM_GOLD,
                      cap_top=True, matrix=crown_m, flute_count=24, flute_depth=0.0022)

    obj_bezel = finalize_mesh_obj(
        "Chronometer_Bezel",
        bm_bezel,
        mats,
        collection,
        location=(0.0, 0.0, CHRONO_CENTER_Z),
        rotation_euler=(CHRONO_TILT_RAD, 0.0, 0.0),
        sharp_angle_deg=34.0,
        uv_scale=2.2,
    )
    objects.append(obj_bezel)

    # 3. Chronometer_Face (child of Chronometer_Bezel): Recessed Concave Midnight-Sapphire Enamel Dial
    bm_face = bmesh.new()
    dial_prof = [
        (0.002, -0.006),
        (0.080, -0.004),
        (0.165, 0.000),
        (0.235, 0.005),
        (0.282, 0.010),
    ]
    add_lathe_profile(bm_face, dial_prof, segments=64, mat_idx=HM_DIAL, cap_bottom=True, matrix=m_front)

    # Concentric inlaid brushed-gold astrolabe chapter rings on the sapphire dial
    for r_ring, y_off in ((0.222, 0.004), (0.145, -0.001), (0.068, -0.004)):
        ring_prof = [
            (r_ring - 0.0032, y_off - 0.001),
            (r_ring + 0.0032, y_off - 0.001),
            (r_ring + 0.0022, y_off + 0.0032),
            (r_ring - 0.0022, y_off + 0.0032),
        ]
        add_lathe_profile(bm_face, ring_prof, segments=64, mat_idx=HM_GOLD, closed_profile=True, matrix=m_front)

    # 8-Point Gilded Astrolabe Compass Rose Star inlaid at dial center
    for k in range(8):
        a = (k / 8.0) * math.tau
        is_main = (k % 2 == 0)
        star_len = 0.135 if is_main else 0.088
        star_w = 0.016 if is_main else 0.010
        sa, ca = math.sin(a), math.cos(a)
        pos = Vector((sa * star_len * 0.5, -0.003, ca * star_len * 0.5))
        add_diamond_index(bm_face, pos, Vector((0, -1, 0)), Vector((sa, 0, ca)),
                          length=star_len, width=star_w, height=0.0035,
                          mat_idx=(HM_GOLD if is_main else HM_ROSE))

    obj_face = finalize_mesh_obj(
        "Chronometer_Face",
        bm_face,
        mats,
        collection,
        location=(0.0, 0.0, 0.0),
        parent=obj_bezel,
        sharp_angle_deg=36.0,
        uv_scale=2.2,
    )
    objects.append(obj_face)

    # 4. Chronometer_Glass (child of Chronometer_Bezel): Subtle Domed Optical Sapphire Crystal Lens
    bm_glass = bmesh.new()
    # Thin curved spherical cap spanning r = 0..0.288m, bulging gracefully out to y = -0.062m
    g_prof = []
    for k in range(11):
        t = k / 10.0
        r = max(0.002, t * 0.286)
        # Smooth optical dome
        h = 0.060 - 0.022 * (t * t)
        g_prof.append((r, h))
    add_lathe_profile(bm_glass, g_prof, segments=64, mat_idx=HM_GLASS, cap_bottom=True, matrix=m_front)

    obj_glass = finalize_mesh_obj(
        "Chronometer_Glass",
        bm_glass,
        mats,
        collection,
        location=(0.0, 0.0, 0.0),
        parent=obj_bezel,
        sharp_angle_deg=45.0,
        uv_scale=2.0,
        weighted_normal=False,
    )
    if hasattr(obj_glass, "visible_shadow"):
        obj_glass.visible_shadow = False
    objects.append(obj_glass)

    # 5. Chronometer_Needle (child of Chronometer_Bezel): Razor-Sharp Sculpted Gilded Cathedral Compass Hand
    #    Pivoted cleanly at local (0,0,0) = dial center; points along +Z (12 o'clock, Godot +Y),
    #    spins cleanly around local Y in Blender (= local Z in Godot!)
    bm_needle = bmesh.new()
    y_plane = -0.020  # Floats cleanly above sapphire dial (-0.006) and beneath optical glass (-0.060)!

    # Sculpted sword-beveled forward cathedral blade (z = 0.0 .. +0.238m)
    blade_sections = [
        (0.015, 0.012, 0.0045),
        (0.055, 0.015, 0.0050),
        (0.125, 0.009, 0.0042),
        (0.165, 0.017, 0.0048),  # Cathedral diamond swell
        (0.195, 0.008, 0.0038),
        (0.242, 0.0012, 0.0016),  # Razor-sharp tip
    ]
    rings = []
    for z_pos, hw, ht in blade_sections:
        ring = [
            bm_needle.verts.new(Vector((-hw, y_plane, z_pos))),
            bm_needle.verts.new(Vector((0.0, y_plane - ht, z_pos))),
            bm_needle.verts.new(Vector((hw, y_plane, z_pos))),
            bm_needle.verts.new(Vector((0.0, y_plane + ht * 0.55, z_pos))),
        ]
        rings.append(ring)
    for i in range(len(rings) - 1):
        r0, r1 = rings[i], rings[i + 1]
        for j in range(4):
            jn = (j + 1) % 4
            f = bm_needle.faces.new((r0[j], r0[jn], r1[jn], r1[j]))
            f.material_index = HM_GOLD
            f.smooth = False
    # Cap tip
    tip_v = bm_needle.verts.new(Vector((0.0, y_plane - 0.0005, 0.248)))
    for j in range(4):
        jn = (j + 1) % 4
        f = bm_needle.faces.new((rings[-1][j], rings[-1][jn], tip_v))
        f.material_index = HM_GOLD

    # Counterweight tail extending down to z = -0.088m with crescent ring finial
    tail_sections = [
        (-0.015, 0.011, 0.0042),
        (-0.052, 0.007, 0.0036),
        (-0.072, 0.014, 0.0042),
        (-0.092, 0.003, 0.0024),
    ]
    t_rings = []
    for z_pos, hw, ht in tail_sections:
        t_rings.append([
            bm_needle.verts.new(Vector((-hw, y_plane, z_pos))),
            bm_needle.verts.new(Vector((0.0, y_plane - ht, z_pos))),
            bm_needle.verts.new(Vector((hw, y_plane, z_pos))),
            bm_needle.verts.new(Vector((0.0, y_plane + ht * 0.55, z_pos))),
        ])
    for i in range(len(t_rings) - 1):
        r0, r1 = t_rings[i], t_rings[i + 1]
        for j in range(4):
            jn = (j + 1) % 4
            f = bm_needle.faces.new((r0[j], r1[j], r1[jn], r0[jn]))
            f.material_index = HM_BRASS

    # Central lathe-turned brass pinion boss & faceted ruby cap
    pinion_prof = [
        (0.022, 0.004),
        (0.024, 0.018),
        (0.018, 0.026),
        (0.012, 0.028),
    ]
    add_lathe_profile(bm_needle, pinion_prof, segments=32, mat_idx=HM_GOLD, cap_top=True, matrix=m_front)
    add_faceted_gem(bm_needle, Vector((0.0, -0.027, 0.0)), Vector((0.0, -1.0, 0.0)),
                    radius=0.011, height=0.0075, bezel_mat=HM_GOLD, gem_mat=HM_RUBY, facets=12)

    obj_needle = finalize_mesh_obj(
        "Chronometer_Needle",
        bm_needle,
        mats,
        collection,
        location=(0.0, 0.0, 0.0),
        parent=obj_bezel,
        sharp_angle_deg=30.0,
        uv_scale=3.0,
    )
    objects.append(obj_needle)

    return objects


# ===========================================================================
# ASSET 2: REAL 3D GENEVA ALPINE VETTING CHAMBER (vetting_chamber_room.glb)
#   14m wide (X: -7..+7) x 12m deep (Y_b: -7.2..+4.8 -> Z_g: -4.8..+7.2) x 6.5m tall
#   Floor flush at Y_g = 0.0 (Z_b = 0.0)
#   Hero Interrogation Table centered at (0,0,0), tabletop flush at Y_g = 0.78m (Z_b = 0.78m)
#   Exact named materials for Godot 4 Poly Haven 2K PBR binding!
# ===========================================================================
def build_alpine_peaks_mesh_and_texture(mat_alpine, collection):
    """
    Sculpts a real 3D multi-octave jagged Alpine mountain massif outside the panoramic windows:
      Blender Y_b = +18.0m .. +35.0m  ->  Godot Z_g = -18.0m .. -35.0m
      Width X = -36m .. +36m, iconic Matterhorn/Eiger skyline silhouetted cleanly at Z_b = +6.5m .. +12.6m!
    Generates a crisp 1024x512 slope-and-elevation PBR dark basalt cliff & twilight alpenglow snow texture!
    """
    nx, ny = 144, 56
    x_min, x_max = -36.0, 36.0
    y_min, y_max = 18.0, 35.0

    # 1. Compute height field H[j][i] calibrated to silhouette majestically inside the panoramic window!
    heights = [[0.0] * nx for _ in range(ny)]
    for j in range(ny):
        v = j / (ny - 1)
        y = lerp(y_min, y_max, v)
        for i in range(nx):
            u = i / (nx - 1)
            x = lerp(x_min, x_max, u)

            # Foreground craggy dark basalt foothills framing a deep Lake Geneva central glacial valley
            valley_notch = smoothstep(2.0, 14.0, abs(x + 0.8))
            near_env = math.exp(-((v - 0.22) / 0.18) ** 2) * (0.18 + 0.82 * valley_notch)

            # Rear high Alpine massif spine (v ~ 0.65..0.92)
            far_env = math.exp(-((v - 0.78) / 0.24) ** 2)

            # Iconic serrated Alpine peaks sculpted to silhouette cleanly with twilight sky above!
            # Peak 1: Iconic sharp Matterhorn horn right-of-center (X = +5.2, Y = 31.0 -> crest ~ +12.2m)
            p1 = 9.8 * math.exp(-(((x - 5.2) / 5.4) ** 2 + ((y - 31.0) / 3.6) ** 2) ** 0.68)
            # Peak 2: Jagged Eiger North Face left-of-center (X = -7.8, Y = 29.5 -> crest ~ +11.6m)
            p2 = 9.2 * math.exp(-(((x + 7.8) / 6.2) ** 2 + ((y - 29.5) / 3.8) ** 2) ** 0.70)
            # Peak 3: Distant glacial Jungfrau saddle & needle center-left (X = -1.2, Y = 33.4 -> crest ~ +9.0m)
            p3 = 6.8 * math.exp(-(((x + 1.2) / 4.8) ** 2 + ((y - 33.4) / 3.2) ** 2) ** 0.72)
            # Peak 4 & 5: Dramatic outer flanking Alpine massifs for wide parallax sweeps
            p4 = 9.6 * math.exp(-(((x + 19.5) / 8.2) ** 2 + ((y - 26.5) / 5.0) ** 2) ** 0.72)
            p5 = 10.0 * math.exp(-(((x - 18.5) / 7.8) ** 2 + ((y - 26.0) / 4.8) ** 2) ** 0.72)

            # Sharp knife-edge ridged multifractal alpine aretes & fractured rock ribs
            r_macro = ridged_2d(x * 0.11 + 3.1, y * 0.12 - 1.7, octaves=5, seed=211)
            r_crag = ridged_2d(x * 0.28 - 2.3, y * 0.28 + 4.9, octaves=4, seed=307)

            base_h = -3.8 + 1.4 * v
            ridge_h = (near_env * 4.8 + far_env * 4.6) * (0.35 + 0.95 * r_macro)
            summits = (p1 + p2 + p3 + p4 + p5) * (0.70 + 0.42 * r_macro)
            crags = (r_crag - 0.40) * (1.1 + 1.9 * max(near_env, far_env))

            front_fade = smoothstep(0.0, 0.12, v)
            h = base_h + (ridge_h + summits + crags) * front_fade
            heights[j][i] = min(13.2, h)

    # 2. Build BMesh with exact 0..1 UVs matching the baked alpine texture
    bm = bmesh.new()
    uv_layer = bm.loops.layers.uv.verify()
    grid = []
    for j in range(ny):
        v = j / (ny - 1)
        y = lerp(y_min, y_max, v)
        row = []
        for i in range(nx):
            u = i / (nx - 1)
            x = lerp(x_min, x_max, u)
            row.append(bm.verts.new(Vector((x, y, heights[j][i]))))
        grid.append(row)

    for j in range(ny - 1):
        v0 = j / (ny - 1)
        v1 = (j + 1) / (ny - 1)
        for i in range(nx - 1):
            u0 = i / (nx - 1)
            u1 = (i + 1) / (nx - 1)
            f = bm.faces.new((grid[j][i], grid[j][i + 1], grid[j + 1][i + 1], grid[j + 1][i]))
            f.material_index = 0
            f.smooth = True
            uvs = ((u0, v0), (u1, v0), (u1, v1), (u0, v1))
            for loop, uv in zip(f.loops, uvs):
                loop[uv_layer].uv = uv

    # 3. Generate crisp 1024x512 high-contrast Alpine dark basalt cliff & twilight alpenglow snow PBR map!
    tw, th = 1024, 512
    albedo = [0.0] * (tw * th * 4)
    rough = [0.0] * (tw * th * 4)
    dx_grid = (x_max - x_min) / (nx - 1)
    dy_grid = (y_max - y_min) / (ny - 1)

    def sample_h(u, v):
        fx = clamp(u, 0.0, 1.0) * (nx - 1)
        fy = clamp(v, 0.0, 1.0) * (ny - 1)
        ix0 = min(nx - 2, int(fx))
        iy0 = min(ny - 2, int(fy))
        tx, ty = fx - ix0, fy - iy0
        h00 = heights[iy0][ix0]
        h10 = heights[iy0][ix0 + 1]
        h01 = heights[iy0 + 1][ix0]
        h11 = heights[iy0 + 1][ix0 + 1]
        return lerp(lerp(h00, h10, tx), lerp(h01, h11, tx), ty)

    idx = 0
    for py in range(th):
        v = py / (th - 1)
        for px in range(tw):
            u = px / (tw - 1)
            h = sample_h(u, v)
            hu = (sample_h(u + 1.0 / nx, v) - sample_h(u - 1.0 / nx, v)) / (2.0 * dx_grid)
            hv = (sample_h(u, v + 1.0 / ny) - sample_h(u, v - 1.0 / ny)) / (2.0 * dy_grid)
            n = Vector((-hu, -hv, 1.0)).normalized()

            micro = fbm_2d(u * 38.0, v * 20.0, octaves=3, seed=401)
            chute = ridged_2d(u * 24.0 + 1.1, v * 14.0 - 0.7, octaves=3, seed=521)

            # High-contrast Matterhorn snow distribution:
            # Dark craggy charcoal-indigo basalt cliffs interlaced with dramatic glacial snow ridges & couloirs!
            snow_alt = smoothstep(1.8, 6.2, h + (micro - 0.5) * 1.8)
            snow_slope = smoothstep(0.30, 0.62, n.z + (chute - 0.45) * 0.30)
            summit_cornice = smoothstep(5.4, 9.8, h) * smoothstep(0.18, 0.50, n.z + chute * 0.22)
            ridge_glacier = smoothstep(3.0, 7.5, h) * smoothstep(0.55, 0.85, chute) * 0.72
            snow = clamp(snow_alt * snow_slope + summit_cornice * 0.85 + ridge_glacier, 0.0, 1.0)

            # Dramatic dark craggy Alpine basalt rock (#0C1322 .. #222F46)
            rock_r = lerp(0.048, 0.125, micro)
            rock_g = lerp(0.068, 0.160, micro)
            rock_b = lerp(0.108, 0.235, micro)

            # Glacial twilight snow: crisp alpine blue-white in shadow, warm pale rose-gold alpenglow on crests!
            sun_face = clamp(n.x * 0.65 + 0.50, 0.0, 1.0) * smoothstep(3.5, 9.5, h)
            snow_r = lerp(0.58, 0.98, sun_face * 0.72 + 0.22)
            snow_g = lerp(0.68, 0.88, sun_face * 0.52 + 0.28)
            snow_b = lerp(0.86, 0.92, 0.65 - sun_face * 0.22)

            r = lerp(rock_r, snow_r, snow)
            g = lerp(rock_g, snow_g, snow)
            b = lerp(rock_b, snow_b, snow)

            # Deep nocturnal Lake Geneva atmospheric haze near the lower valley floor
            mist = 1.0 - smoothstep(-2.4, 2.2, h)
            r = lerp(r, 0.045, mist * 0.78)
            g = lerp(g, 0.072, mist * 0.78)
            b = lerp(b, 0.135, mist * 0.78)

            albedo[idx] = clamp(r)
            albedo[idx + 1] = clamp(g)
            albedo[idx + 2] = clamp(b)
            albedo[idx + 3] = 1.0

            rv = lerp(0.88, 0.50, snow)
            rough[idx] = rv
            rough[idx + 1] = rv
            rough[idx + 2] = rv
            rough[idx + 3] = 1.0
            idx += 4

    img_col = make_image_from_rgb("Tex_AlpinePeaks_COL", tw, th, albedo, "sRGB")
    img_rgh = make_image_from_rgb("Tex_AlpinePeaks_RGH", tw, th, rough, "Non-Color")

    # Wire directly into Mat_Alpine_Peaks
    nt = mat_alpine.node_tree
    nodes = nt.nodes
    links = nt.links
    bsdf = next(n for n in nodes if n.type == "BSDF_PRINCIPLED")
    tc = nodes.new("ShaderNodeTexCoord")
    ti_c = nodes.new("ShaderNodeTexImage")
    ti_c.image = img_col
    ti_c.extension = "EXTEND"
    ti_r = nodes.new("ShaderNodeTexImage")
    ti_r.image = img_rgh
    ti_r.extension = "EXTEND"
    links.new(tc.outputs["UV"], ti_c.inputs["Vector"])
    links.new(tc.outputs["UV"], ti_r.inputs["Vector"])
    links.new(ti_c.outputs["Color"], bsdf.inputs["Base Color"])
    links.new(ti_r.outputs["Color"], bsdf.inputs["Roughness"])

    return finalize_mesh_obj(
        "Alpine_Peaks",
        bm,
        [mat_alpine],
        collection,
        sharp_angle_deg=24.0,  # Crisp chiseled Alpine rock facets instead of soft clay!
        preserve_existing_uvs=True,
        weld_dist=0.0,
        weighted_normal=False,
    )


def build_chamber_materials():
    """Creates the EXACT canonical named materials required for Godot 4 Poly Haven 2K PBR binding."""
    granite_col, granite_rgh = gen_honed_granite_textures("Tex_Chamber_Floor", 256)
    slate_col, slate_rgh = gen_alpine_slate_textures("Tex_Chamber_Slate", 256)
    walnut_col, walnut_rgh = gen_smoked_walnut_textures("Tex_Table_Walnut", 256)
    marble_col, marble_rgh = gen_dark_veined_marble_textures("Tex_Table_Marble", 256)
    leather_col, leather_rgh = gen_stitched_leather_textures("Tex_Table_Leather", 256)
    brass_rgh = gen_silky_brushed_roughness("Tex_Chamber_Brass_RGH", 256, base_r=0.26, amp=0.045)

    return [
        # 0: Mat_Chamber_Floor
        make_pbr_material(
            "Mat_Chamber_Floor",
            "#0E1218",
            metallic=0.03,
            roughness=0.32,
            coat_weight=0.14,
            coat_roughness=0.18,
            col_img=granite_col,
            rgh_img=granite_rgh,
            uv_scale=1.0,
        ),
        # 1: Mat_Chamber_Slate
        make_pbr_material(
            "Mat_Chamber_Slate",
            "#181D26",
            metallic=0.02,
            roughness=0.60,
            col_img=slate_col,
            rgh_img=slate_rgh,
            uv_scale=0.65,
        ),
        # 2: Mat_Chamber_Brass
        make_pbr_material(
            "Mat_Chamber_Brass",
            "#C49648",
            metallic=0.94,
            roughness=0.26,
            coat_weight=0.06,
            rgh_img=brass_rgh,
            uv_scale=1.8,
        ),
        # 3: Mat_Table_Walnut
        make_pbr_material(
            "Mat_Table_Walnut",
            "#2A180F",
            metallic=0.0,
            roughness=0.32,
            coat_weight=0.25,
            coat_roughness=0.16,
            col_img=walnut_col,
            rgh_img=walnut_rgh,
            uv_scale=1.2,
        ),
        # 4: Mat_Table_Marble (deep luxury Nero Marquina — rich dark stone with champagne veins!)
        make_pbr_material(
            "Mat_Table_Marble",
            "#0D1017",
            metallic=0.02,
            roughness=0.22,
            coat_weight=0.22,
            coat_roughness=0.12,
            col_img=marble_col,
            rgh_img=marble_rgh,
            uv_scale=0.85,
        ),
        # 5: Mat_Table_Leather
        make_pbr_material(
            "Mat_Table_Leather",
            "#20120D",
            metallic=0.0,
            roughness=0.48,
            coat_weight=0.05,
            coat_roughness=0.28,
            col_img=leather_col,
            rgh_img=leather_rgh,
            uv_scale=1.0,
        ),
        # 6: Mat_Window_Glass (AR-coated museum architectural glass — crystal-clear view of Alpine peaks!)
        make_pbr_material(
            "Mat_Window_Glass",
            "#0C1828",
            metallic=0.0,
            roughness=0.04,
            coat_weight=0.0,
            alpha=0.065,
            ior=1.45,
            specular_ior_level=0.12,
        ),
        # 7: Mat_Alpine_Peaks (populated with 1024x512 basalt & snow texture by peaks builder!)
        make_pbr_material(
            "Mat_Alpine_Peaks",
            "#202C42",
            metallic=0.0,
            roughness=0.76,
        ),
        # 8: Mat_Chamber_Mullion (slim anodized matte black-steel architectural mullions & louvers)
        make_pbr_material(
            "Mat_Chamber_Mullion",
            "#0F1218",
            metallic=0.84,
            roughness=0.34,
            coat_weight=0.06,
        ),
    ]


CM_FLOOR = 0
CM_SLATE = 1
CM_BRASS = 2
CM_WALNUT = 3
CM_MARBLE = 4
CM_LEATHER = 5
CM_GLASS = 6
CM_PEAKS = 7
CM_MULLION = 8


def window_arc_y(x: float) -> float:
    """Smooth monumental curved panoramic rear wall arc: apex at Y_b=+4.85m (Z_g=-4.85m), curving to +3.65m at X=±7m."""
    r = 21.0
    xc = clamp(x, -7.2, 7.2)
    return 4.85 - (r - math.sqrt(max(0.1, r * r - xc * xc)))


def build_vetting_chamber_objects(mats, collection):
    """
    Constructs the full 14m x 12m x 6.5m 3D Geneva Alpine Vetting Chamber:
      1. Chamber_Floor (honed dark granite floor at Z=0.0 + recessed brushed-brass architectural border frame)
      2. Chamber_Walls (smoked walnut architectural wainscoting + upper honed slate pilasters)
      3. Chamber_Columns (6 monumental 16-flute dark-slate columns at X=±3.8m, ±5.5m with brass plinths & capitals)
      4. Chamber_Ceiling (coffered brutalist dark-slate ceiling + recessed zenith skylight aperture with louvers)
      5. Chamber_Window_Frame (curved rear panoramic window sill, 9 slim beveled black-steel mullions, 3 transoms)
      6. Chamber_Window_Glass (smooth curved architectural tinted glass sheet)
      7. Hero_Interrogation_Table (centered at 0,0,0; tabletop flush at Z=0.780m; leather blotter at Z=0.782m)
      8. Alpine_Peaks (sculpted 3D jagged Alpine mountain massif at Y_b = +17.5m .. +35.5m)
    """
    objects = []

    # -----------------------------------------------------------------------
    # 1. Chamber_Floor: 14m x 12m dark honed granite slab (top flush at Z=0.0) + subtle brushed-brass border
    # -----------------------------------------------------------------------
    bm_fl = bmesh.new()
    # Main architectural floor slab: X [-7.2, +7.2], Y [-7.2, +5.1], Z [-0.20, 0.00]
    add_chamfered_box(bm_fl, 14.4, 12.3, 0.20, bevel=0.005, mat_idx=CM_FLOOR,
                      matrix=Matrix.Translation((0.0, -1.05, -0.10)), segments=1)

    # Subtle dark brushed-brass inlaid rectangular diplomatic frame around the interrogation table
    # (NO bright neon rings! Pure architectural hairline brass floor strips flush at Z=0.0015m!)
    frame_half_x, frame_half_y = 2.65, 2.05
    strip_w, strip_h = 0.045, 0.003
    for sy in (-frame_half_y, frame_half_y):
        add_chamfered_box(bm_fl, frame_half_x * 2.0 + strip_w, strip_w, strip_h, bevel=0.0008,
                          mat_idx=CM_BRASS, matrix=Matrix.Translation((0.0, sy, 0.0015)), segments=1)
    for sx in (-frame_half_x, frame_half_x):
        add_chamfered_box(bm_fl, strip_w, frame_half_y * 2.0 - strip_w, strip_h, bevel=0.0008,
                          mat_idx=CM_BRASS, matrix=Matrix.Translation((sx, 0.0, 0.0015)), segments=1)

    # Outer secondary hairline brass border (X=±3.15m, Y=±2.55m)
    ox, oy = 3.15, 2.55
    for sy in (-oy, oy):
        add_chamfered_box(bm_fl, ox * 2.0 + 0.018, 0.018, 0.0025, bevel=0.0005,
                          mat_idx=CM_BRASS, matrix=Matrix.Translation((0.0, sy, 0.0012)), segments=1)
    for sx in (-ox, ox):
        add_chamfered_box(bm_fl, 0.018, oy * 2.0 - 0.018, 0.0025, bevel=0.0005,
                          mat_idx=CM_BRASS, matrix=Matrix.Translation((sx, 0.0, 0.0012)), segments=1)

    obj_floor = finalize_mesh_obj("Chamber_Floor", bm_fl, mats, collection, sharp_angle_deg=35.0, uv_scale=0.65)
    objects.append(obj_floor)

    # -----------------------------------------------------------------------
    # 2. Chamber_Walls: Side & Rear Diplomatic Walls (Smoked Walnut Wainscoting + Slate Pilasters)
    # -----------------------------------------------------------------------
    bm_walls = bmesh.new()
    # Left & Right perimeter structural walls (X = ±7.0m, Y = -7.2 .. +3.9m, Z = 0 .. 6.5m)
    for side in (-1.0, 1.0):
        wx = side * 7.0
        # Full backing slate wall
        add_chamfered_box(bm_walls, 0.30, 11.2, 6.50, bevel=0.01, mat_idx=CM_SLATE,
                          matrix=Matrix.Translation((wx + side * 0.15, -1.60, 3.25)), segments=1)
        # Smoked walnut lower wainscoting paneling (Z = 0.0 .. 2.35m)
        add_chamfered_box(bm_walls, 0.08, 11.0, 2.35, bevel=0.008, mat_idx=CM_WALNUT,
                          matrix=Matrix.Translation((wx - side * 0.04, -1.60, 1.175)), segments=1)
        # Brushed-brass baseboard & chair rail trim
        add_chamfered_box(bm_walls, 0.10, 11.0, 0.12, bevel=0.006, mat_idx=CM_BRASS,
                          matrix=Matrix.Translation((wx - side * 0.05, -1.60, 0.06)), segments=1)
        add_chamfered_box(bm_walls, 0.11, 11.0, 0.065, bevel=0.006, mat_idx=CM_BRASS,
                          matrix=Matrix.Translation((wx - side * 0.055, -1.60, 2.38)), segments=1)
        # Architectural vertical slate wall pilasters framing gallery bays
        for py in (-5.6, -3.1, -0.6, 1.9, 3.65):
            add_chamfered_box(bm_walls, 0.24, 0.42, 6.35, bevel=0.015, mat_idx=CM_SLATE,
                              matrix=Matrix.Translation((wx - side * 0.12, py, 3.175)), segments=1)
            add_chamfered_box(bm_walls, 0.26, 0.46, 0.12, bevel=0.010, mat_idx=CM_BRASS,
                              matrix=Matrix.Translation((wx - side * 0.13, py, 5.88)), segments=1)
        # Vertical smoked-walnut acoustic accent ribs inside wainscoting bays
        for k in range(28):
            ry = lerp(-6.6, 3.3, k / 27.0)
            add_chamfered_box(bm_walls, 0.04, 0.055, 2.15, bevel=0.005, mat_idx=CM_WALNUT,
                              matrix=Matrix.Translation((wx - side * 0.09, ry, 1.22)), segments=1)

    # Rear enclosure wall behind the camera (Y_b = -7.1m) so reflections in brass & glass feel enclosed!
    add_chamfered_box(bm_walls, 14.4, 0.30, 6.50, bevel=0.01, mat_idx=CM_SLATE,
                      matrix=Matrix.Translation((0.0, -7.15, 3.25)), segments=1)
    add_chamfered_box(bm_walls, 14.0, 0.08, 2.35, bevel=0.008, mat_idx=CM_WALNUT,
                      matrix=Matrix.Translation((0.0, -6.98, 1.175)), segments=1)
    add_chamfered_box(bm_walls, 14.0, 0.11, 0.065, bevel=0.006, mat_idx=CM_BRASS,
                      matrix=Matrix.Translation((0.0, -6.96, 2.38)), segments=1)

    obj_walls = finalize_mesh_obj("Chamber_Walls", bm_walls, mats, collection, sharp_angle_deg=35.0, uv_scale=0.55)
    objects.append(obj_walls)

    # -----------------------------------------------------------------------
    # 3. Chamber_Columns: 6 Monumental Sculpted 16-Flute Dark-Slate Columns (X=±3.8m, ±5.5m)
    # -----------------------------------------------------------------------
    bm_cols = bmesh.new()
    column_positions = [
        # Pair 1: Inner monumental pair flanking the panoramic Alpine glass vista (X = ±3.8m)
        (-3.80, 3.25),
        (3.80, 3.25),
        # Pair 2: Mid-chamber flanking columns (X = ±5.5m)
        (-5.50, 0.40),
        (5.50, 0.40),
        # Pair 3: Rear-chamber flanking columns (X = ±5.5m)
        (-5.50, -3.10),
        (5.50, -3.10),
    ]
    for cx, cy in column_positions:
        cm = Matrix.Translation((cx, cy, 0.0))
        # Stepped dark-slate & brushed-brass octagonal/circular architectural plinth base (Z = 0.0 .. 0.56m)
        base_slate = [
            (0.50, 0.00),
            (0.50, 0.22),
            (0.46, 0.26),
            (0.42, 0.28),
            (0.42, 0.44),
            (0.37, 0.50),
        ]
        add_lathe_profile(bm_cols, base_slate, segments=32, mat_idx=CM_SLATE, cap_bottom=True, matrix=cm)

        # Brushed-brass stepped base plinth trim collars
        for r_b, z0, z1 in ((0.515, 0.00, 0.045), (0.435, 0.25, 0.30), (0.388, 0.48, 0.56)):
            b_prof = [(r_b - 0.015, z0), (r_b, z0 + 0.010), (r_b, z1 - 0.010), (r_b - 0.015, z1)]
            add_lathe_profile(bm_cols, b_prof, segments=48, mat_idx=CM_BRASS, closed_profile=True, matrix=cm)

        # Tall Gently-Entasis 16-Flute Concave-Fluted Dark Alpine Slate Shaft (Z = 0.54 .. 5.58m)
        shaft_prof = [
            (0.360, 0.54),
            (0.356, 1.80),
            (0.346, 3.20),
            (0.336, 4.50),
            (0.328, 5.58),
        ]
        add_lathe_profile(
            bm_cols, shaft_prof, segments=64, mat_idx=CM_SLATE,
            matrix=cm, flute_count=16, flute_depth=0.026
        )

        # Subtle mid-height inlaid brass astragal ring accent
        add_lathe_profile(
            bm_cols, [(0.342, 2.34), (0.358, 2.36), (0.358, 2.40), (0.342, 2.42)],
            segments=48, mat_idx=CM_BRASS, closed_profile=True, matrix=cm
        )

        # Multi-Tiered Art-Deco / Sovereign Modernism Brushed-Brass & Slate Capital (Z = 5.54 .. 6.22m)
        cap_brass = [
            (0.332, 5.54),
            (0.372, 5.60),
            (0.372, 5.70),
            (0.415, 5.82),
            (0.440, 5.92),
            (0.430, 5.96),
        ]
        add_lathe_profile(bm_cols, cap_brass, segments=48, mat_idx=CM_BRASS, matrix=cm)

        cap_slate = [
            (0.425, 5.95),
            (0.485, 6.04),
            (0.485, 6.22),
            (0.050, 6.22),
        ]
        add_lathe_profile(bm_cols, cap_slate, segments=32, mat_idx=CM_SLATE, cap_top=True, matrix=cm)

    obj_cols = finalize_mesh_obj("Chamber_Columns", bm_cols, mats, collection, sharp_angle_deg=35.0, uv_scale=0.55)
    objects.append(obj_cols)

    # -----------------------------------------------------------------------
    # 4. Chamber_Ceiling: Coffered Brutalist Ceiling + Recessed Zenith Skylight Aperture
    # -----------------------------------------------------------------------
    bm_ceil = bmesh.new()

    # Perimeter solid ceiling slabs framing the central skylight aperture (X in [-2.3, 2.3], Y in [-1.6, 1.6])
    # North (window-side) ceiling slab: Y = 1.6 .. 5.2
    add_chamfered_box(bm_ceil, 14.4, 3.6, 0.35, bevel=0.015, mat_idx=CM_SLATE,
                      matrix=Matrix.Translation((0.0, 3.40, 6.38)), segments=1)
    # South (camera-side) ceiling slab: Y = -7.2 .. -1.6
    add_chamfered_box(bm_ceil, 14.4, 5.6, 0.35, bevel=0.015, mat_idx=CM_SLATE,
                      matrix=Matrix.Translation((0.0, -4.40, 6.38)), segments=1)
    # West & East ceiling slabs flanking the skylight: X = ±4.75, width 4.9m, Y = -1.6 .. +1.6
    for sx in (-4.75, 4.75):
        add_chamfered_box(bm_ceil, 4.9, 3.2, 0.35, bevel=0.015, mat_idx=CM_SLATE,
                          matrix=Matrix.Translation((sx, 0.0, 6.38)), segments=1)

    # Deep Monumental Intersecting Brutalist Coffer Beams (Z = 5.82 .. 6.24m) with Brass Underside Reveals!
    beam_xs = (-5.50, -3.80, -2.30, 2.30, 3.80, 5.50)
    for bx in beam_xs:
        add_chamfered_box(bm_ceil, 0.44, 12.2, 0.42, bevel=0.018, mat_idx=CM_SLATE,
                          matrix=Matrix.Translation((bx, -1.0, 6.02)), segments=1)
        # Hairline brushed-brass reveal on beam underside
        add_chamfered_box(bm_ceil, 0.05, 11.8, 0.018, bevel=0.004, mat_idx=CM_BRASS,
                          matrix=Matrix.Translation((bx, -1.0, 5.81)), segments=1)

    beam_ys = (-5.20, -3.10, -1.60, 1.60, 3.25)
    for by in beam_ys:
        add_chamfered_box(bm_ceil, 14.2, 0.44, 0.42, bevel=0.018, mat_idx=CM_SLATE,
                          matrix=Matrix.Translation((0.0, by, 6.02)), segments=1)
        add_chamfered_box(bm_ceil, 13.8, 0.05, 0.018, bevel=0.004, mat_idx=CM_BRASS,
                          matrix=Matrix.Translation((0.0, by, 5.81)), segments=1)

    # Recessed Zenith Skylight Aperture Frame (X: -2.3..+2.3, Y: -1.6..+1.6, rising to Z = 6.85m!)
    # Stepped brass skylight collar + architectural dark-steel light-baffle louvers
    for sy in (-1.42, 1.42):
        add_chamfered_box(bm_ceil, 4.24, 0.08, 0.12, bevel=0.008, mat_idx=CM_BRASS,
                          matrix=Matrix.Translation((0.0, sy, 6.18)), segments=1)
    for sx in (-2.12, 2.12):
        add_chamfered_box(bm_ceil, 0.08, 2.84, 0.12, bevel=0.008, mat_idx=CM_BRASS,
                          matrix=Matrix.Translation((sx, 0.0, 6.18)), segments=1)

    # Recessed dark-slate skylight well walls rising above the coffer
    for sy in (-1.62, 1.62):
        add_chamfered_box(bm_ceil, 4.65, 0.18, 0.72, bevel=0.01, mat_idx=CM_SLATE,
                          matrix=Matrix.Translation((0.0, sy, 6.56)), segments=1)
    for sx in (-2.32, 2.32):
        add_chamfered_box(bm_ceil, 0.18, 3.25, 0.72, bevel=0.01, mat_idx=CM_SLATE,
                          matrix=Matrix.Translation((sx, 0.0, 6.56)), segments=1)

    # 7 Slim Beveled Black-Steel Architectural Skylight Louvers spanning the zenith aperture
    for i in range(7):
        lx = lerp(-1.80, 1.80, i / 6.0)
        add_chamfered_box(bm_ceil, 0.045, 3.16, 0.22, bevel=0.006, mat_idx=CM_MULLION,
                          matrix=Matrix.Translation((lx, 0.0, 6.46)), segments=1)
    # 2 transverse brass skylight tie bars
    for ly in (-0.65, 0.65):
        add_chamfered_box(bm_ceil, 4.45, 0.035, 0.055, bevel=0.005, mat_idx=CM_BRASS,
                          matrix=Matrix.Translation((0.0, ly, 6.38)), segments=1)

    obj_ceil = finalize_mesh_obj("Chamber_Ceiling", bm_ceil, mats, collection, sharp_angle_deg=35.0, uv_scale=0.55)
    objects.append(obj_ceil)

    # -----------------------------------------------------------------------
    # 5 & 6. Monumental Curved Rear Panoramic Glass Curtain Wall (Z_g = -4.8m -> Y_b = +4.85m)
    # -----------------------------------------------------------------------
    bm_wf = bmesh.new()
    bm_wg = bmesh.new()

    arc_steps = 32
    arc_xs = [lerp(-7.05, 7.05, i / (arc_steps - 1)) for i in range(arc_steps)]

    # Low sculpted dark-slate architectural window sill plinth (Z = 0.0 .. 0.50m) with brass cap reveal
    sill_pts = [Vector((x, window_arc_y(x), 0.25)) for x in arc_xs]
    sill_cs = [(-0.25, -0.22), (0.25, -0.22), (0.25, 0.22), (-0.25, 0.22)]
    add_swept_profile(bm_wf, sill_pts, sill_cs, mat_idx=CM_SLATE, closed_path=False, cap_ends=True,
                      up_hint=Vector((0, 0, 1)))
    sill_trim_pts = [Vector((x, window_arc_y(x) - 0.19, 0.51)) for x in arc_xs]
    add_swept_profile(bm_wf, sill_trim_pts, [(-0.022, -0.045), (0.022, -0.045), (0.022, 0.045), (-0.022, 0.045)],
                      mat_idx=CM_BRASS, closed_path=False, cap_ends=True, up_hint=Vector((0, 0, 1)))

    # 4 Curved Horizontal Black-Steel Architectural Transom Bars
    for z_tr, h_tr in ((0.52, 0.075), (3.10, 0.055), (5.25, 0.055), (6.16, 0.14)):
        tr_pts = [Vector((x, window_arc_y(x), z_tr)) for x in arc_xs]
        tr_cs = [(-h_tr * 0.5, -0.075), (h_tr * 0.5, -0.075), (h_tr * 0.5, 0.075), (-h_tr * 0.5, 0.075)]
        add_swept_profile(bm_wf, tr_pts, tr_cs, mat_idx=CM_MULLION, closed_path=False, cap_ends=True,
                          up_hint=Vector((0, 0, 1)))

    # 9 Slim Beveled Black-Steel Architectural Vertical Mullions with Fine Brushed-Brass Inner Accent Flutes
    mullion_xs = [-6.80, -5.10, -3.40, -1.70, 0.00, 1.70, 3.40, 5.10, 6.80]
    for mx in mullion_xs:
        my = window_arc_y(mx)
        # Tangent angle along arc
        dy_dx = (window_arc_y(mx + 0.05) - window_arc_y(mx - 0.05)) / 0.10
        yaw = math.atan2(dy_dx, 1.0)
        mm = Matrix.Translation((mx, my, 3.35)) @ Matrix.Rotation(yaw, 4, "Z")
        # Slim structural T-fin black-steel mullion
        add_chamfered_box(bm_wf, 0.068, 0.22, 5.75, bevel=0.008, mat_idx=CM_MULLION, matrix=mm, segments=1)
        # Interior slender brushed-brass flute facing the room
        add_chamfered_box(bm_wf, 0.020, 0.025, 5.65, bevel=0.004, mat_idx=CM_BRASS,
                          matrix=mm @ Matrix.Translation((0.0, -0.115, 0.0)), segments=1)

    # Smooth Curved Tinted Panoramic Architectural Glass Sheet spanning X=-7.0..+7.0, Z=0.52..6.15m
    g_verts = []
    for z_g in (0.52, 3.10, 6.15):
        row = []
        for x in arc_xs:
            row.append(bm_wg.verts.new(Vector((x, window_arc_y(x) + 0.02, z_g))))
        g_verts.append(row)
    for r_i in range(len(g_verts) - 1):
        for c_i in range(len(arc_xs) - 1):
            f = bm_wg.faces.new((
                g_verts[r_i][c_i], g_verts[r_i][c_i + 1],
                g_verts[r_i + 1][c_i + 1], g_verts[r_i + 1][c_i]
            ))
            f.material_index = CM_GLASS
            f.smooth = True

    # Also include the overhead zenith skylight glass cap inside Chamber_Window_Glass (visible_shadow=False!)
    add_chamfered_box(bm_wg, 4.55, 3.15, 0.02, bevel=0.0, mat_idx=CM_GLASS,
                      matrix=Matrix.Translation((0.0, 0.0, 6.84)), segments=1)

    obj_wf = finalize_mesh_obj("Chamber_Window_Frame", bm_wf, mats, collection, sharp_angle_deg=35.0, uv_scale=0.8)
    obj_wg = finalize_mesh_obj("Chamber_Window_Glass", bm_wg, mats, collection, sharp_angle_deg=45.0,
                               uv_scale=0.35, weighted_normal=False)
    if hasattr(obj_wg, "visible_shadow"):
        obj_wg.visible_shadow = False
    objects.extend([obj_wf, obj_wg])

    # -----------------------------------------------------------------------
    # 7. Hero_Interrogation_Table: Centered at (0,0,0), tabletop FLUSH at Z = 0.780m!
    #    Width = 2.40m (X: -1.20..+1.20), Depth = 1.25m (Y: -0.625..+0.625)
    #    Sculpted oval dark-walnut pedestal with 32 fluted brass ribs, beveled honed marble rim,
    #    and recessed stitched-leather executive desk pad at Z = 0.782m!
    # -----------------------------------------------------------------------
    bm_tbl = bmesh.new()

    # Stepped brushed-brass floor plinth base flush at Z = 0.000 .. 0.045m
    add_superellipse_extrusion(bm_tbl, rx=0.86, ry=0.41, exp_n=2.15, z0=0.000, z1=0.044,
                               segments=72, mat_idx=CM_BRASS, bevel_z=0.007, bevel_r=0.010)

    # Sculpted Curved Oval Concave-Waisted Smoked-Walnut Pedestal Body (Z = 0.040 .. 0.705m)
    ped_levels = [
        (0.82, 0.37, 0.040),
        (0.76, 0.34, 0.140),
        (0.72, 0.31, 0.360),
        (0.76, 0.34, 0.580),
        (0.84, 0.39, 0.695),
    ]
    ped_segs = 72
    ped_rings = []
    for rx, ry, pz in ped_levels:
        ring = []
        for s in range(ped_segs):
            a = (s / ped_segs) * math.tau
            ca, sa = math.cos(a), math.sin(a)
            sx = math.copysign(abs(ca) ** (2.0 / 2.15), ca) * rx
            sy = math.copysign(abs(sa) ** (2.0 / 2.15), sa) * ry
            ring.append(bm_tbl.verts.new(Vector((sx, sy, pz))))
        ped_rings.append(ring)
    for i in range(len(ped_rings) - 1):
        r0, r1 = ped_rings[i], ped_rings[i + 1]
        for s in range(ped_segs):
            sn = (s + 1) % ped_segs
            f = bm_tbl.faces.new((r0[s], r0[sn], r1[sn], r1[s]))
            f.material_index = CM_WALNUT
            f.smooth = True

    # 32 Slender Curved Vertical Fluted Brushed-Brass Ribs hugging the sculpted walnut pedestal!
    rib_cs = [(-0.0085, -0.007), (0.0085, -0.007), (0.0065, 0.009), (-0.0065, 0.009)]
    for r_i in range(32):
        a = (r_i / 32.0) * math.tau
        ca, sa = math.cos(a), math.sin(a)
        ex = math.copysign(abs(ca) ** (2.0 / 2.15), ca)
        ey = math.copysign(abs(sa) ** (2.0 / 2.15), sa)
        r_pts = []
        for k in range(11):
            t = k / 10.0
            pz = lerp(0.046, 0.688, t)
            # Matches exact pedestal waist curve smoothly
            waist = 1.0 - 0.11 * math.sin(t * math.pi)
            rx_k = lerp(0.825, 0.840, t) * waist
            ry_k = lerp(0.375, 0.390, t) * waist
            r_pts.append(Vector((ex * rx_k, ey * ry_k, pz)))
        add_swept_profile(bm_tbl, r_pts, rib_cs, mat_idx=CM_BRASS, closed_path=False, cap_ends=True,
                          up_hint=Vector((-ey, ex, 0.0)))

    # Sculpted Curved Smoked-Walnut Under-Table Apron (Z = 0.688 .. 0.742m) + Hairline Brass Shadow-Reveal
    add_superellipse_extrusion(bm_tbl, rx=1.12, ry=0.56, exp_n=2.4, z0=0.688, z1=0.742,
                               segments=72, mat_idx=CM_WALNUT, bevel_z=0.009, bevel_r=0.012)
    add_superellipse_extrusion(bm_tbl, rx=1.145, ry=0.580, exp_n=2.4, z0=0.738, z1=0.748,
                               segments=72, mat_idx=CM_BRASS, bevel_z=0.002, bevel_r=0.003,
                               cap_bottom=False, cap_top=False)

    # BEVELED HONED DARK-MARBLE TABLETOP SLAB: Exact Width = 2.40m (rx=1.20), Depth = 1.25m (ry=0.625),
    # Top Surface EXACTLY FLUSH at Z = 0.780m (Godot Y = 0.780m)!
    add_superellipse_extrusion(bm_tbl, rx=1.200, ry=0.625, exp_n=2.5, z0=0.746, z1=0.780,
                               segments=80, mat_idx=CM_MARBLE, bevel_z=0.008, bevel_r=0.010)

    # Subtle inlaid brushed-brass outer tabletop pin-stripe frame (Z = 0.7805m)
    add_superellipse_extrusion(bm_tbl, rx=1.155, ry=0.585, exp_n=2.5, z0=0.7785, z1=0.7806,
                               segments=80, mat_idx=CM_BRASS, bevel_z=0.0005, bevel_r=0.001,
                               cap_bottom=False, cap_top=False)

    # RECESSED STITCHED-LEATHER EXECUTIVE DESK PAD at Center:
    # Width = 1.04m (X: -0.52..+0.52), Depth = 0.76m (Y: -0.38..+0.38), Top FLUSH at Z = 0.782m!
    # Leaves generous open dark-veined marble wings at X = ±0.52..±1.20m for Poly Haven props at X = ±0.75m!
    bm_pad_faces_start = len(bm_tbl.faces)
    add_superellipse_extrusion(bm_tbl, rx=0.520, ry=0.380, exp_n=6.0, z0=0.779, z1=0.782,
                               segments=64, mat_idx=CM_LEATHER, bevel_z=0.0012, bevel_r=0.004)
    # Apply exact [0..1] planar UVs onto the leather pad faces so the stitched leather border aligns cleanly!
    uv_tbl = bm_tbl.loops.layers.uv.verify()
    # First assign clean metric box UVs to the whole table, then override leather pad to [0..1]
    apply_box_uvs(bm_tbl, scale=0.85)
    for f in bm_tbl.faces:
        if f.material_index == CM_LEATHER:
            for loop in f.loops:
                co = loop.vert.co
                u = clamp((co.x / 1.04) + 0.5, 0.0, 1.0)
                v = clamp((co.y / 0.76) + 0.5, 0.0, 1.0)
                loop[uv_tbl].uv = (u, v)

    # Razor-thin brushed-brass mitered inlay bezel framing the stitched-leather pad
    pad_rim_pts = []
    for s in range(64):
        a = (s / 64.0) * math.tau
        ca, sa = math.cos(a), math.sin(a)
        sx = math.copysign(abs(ca) ** (2.0 / 6.0), ca) * 0.525
        sy = math.copysign(abs(sa) ** (2.0 / 6.0), sa) * 0.385
        pad_rim_pts.append(Vector((sx, sy, 0.7812)))
    add_swept_profile(bm_tbl, pad_rim_pts, [(-0.0045, -0.0015), (0.0045, -0.0015), (0.0035, 0.0015), (-0.0035, 0.0015)],
                      mat_idx=CM_BRASS, closed_path=True, up_hint=Vector((0, 0, 1)))

    obj_table = finalize_mesh_obj(
        "Hero_Interrogation_Table",
        bm_tbl,
        mats,
        collection,
        sharp_angle_deg=36.0,
        preserve_existing_uvs=True,
    )
    objects.append(obj_table)

    # -----------------------------------------------------------------------
    # 8. Alpine_Peaks: Sculpted 3D Jagged Alpine Massif outside panoramic windows (Y_b = 17.5..35.5m)
    # -----------------------------------------------------------------------
    obj_peaks = build_alpine_peaks_mesh_and_texture(mats[CM_PEAKS], collection)
    objects.append(obj_peaks)

    return objects


# ===========================================================================
# GLB Export, Binary Audit & Bounding-Box Metrics
# ===========================================================================
def export_selected_glb(objects, glb_path: Path):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]

    bpy.ops.export_scene.gltf(
        filepath=str(glb_path),
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_normals=True,
        export_tangents=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_image_format="AUTO",
    )


def collect_mesh_stats(objects):
    deps = bpy.context.evaluated_depsgraph_get()
    stats = {}
    total_tris = 0
    min_pt = Vector((1e9, 1e9, 1e9))
    max_pt = Vector((-1e9, -1e9, -1e9))

    for obj in objects:
        if obj.type != "MESH":
            continue
        ev = obj.evaluated_get(deps)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        tris = len(me.loop_triangles)
        stats[obj.name] = tris
        total_tris += tris
        mw = ev.matrix_world
        for v in me.vertices:
            wp = mw @ v.co
            min_pt.x = min(min_pt.x, wp.x)
            min_pt.y = min(min_pt.y, wp.y)
            min_pt.z = min(min_pt.z, wp.z)
            max_pt.x = max(max_pt.x, wp.x)
            max_pt.y = max(max_pt.y, wp.y)
            max_pt.z = max(max_pt.z, wp.z)
        ev.to_mesh_clear()

    # Convert Blender (X, Y, Z) bounds -> Godot Y-up (X, Y=Z, Z=-Y)
    dims_godot = {
        "width_x": round(max_pt.x - min_pt.x, 4),
        "height_y": round(max_pt.z - min_pt.z, 4),
        "depth_z": round(max_pt.y - min_pt.y, 4),
        "min_y_godot": round(min_pt.z, 4),
        "max_y_godot": round(max_pt.z, 4),
    }
    return stats, total_tris, dims_godot


def inspect_glb_binary(glb_path: Path):
    data = glb_path.read_bytes()
    magic, version, _ = struct.unpack_from("<4sII", data, 0)
    assert magic == b"glTF", f"Invalid GLB magic in {glb_path}"
    assert version == 2, f"Unexpected glTF version in {glb_path}"
    chunk_len, chunk_type = struct.unpack_from("<I4s", data, 12)
    assert chunk_type == b"JSON"
    gltf = json.loads(data[20:20 + chunk_len].decode("utf-8"))

    nodes = gltf.get("nodes", [])
    all_node_names = [n.get("name", f"node_{i}") for i, n in enumerate(nodes)]
    mat_names = [m.get("name", "") for m in gltf.get("materials", [])]
    accessors = gltf.get("accessors", [])
    tris = 0
    for mesh in gltf.get("meshes", []):
        for prim in mesh.get("primitives", []):
            if "indices" in prim:
                tris += accessors[prim["indices"]]["count"] // 3
            elif "POSITION" in prim.get("attributes", {}):
                tris += accessors[prim["attributes"]["POSITION"]]["count"] // 3

    return {
        "file_bytes": len(data),
        "glb_triangles": tris,
        "nodes": all_node_names,
        "materials": mat_names,
    }


# ===========================================================================
# Studio Lighting & Render Engine Configuration (Cycles OIDN for Museum-Grade Beauty!)
# ===========================================================================
def configure_render(scene, width: int, height: int, samples: int = 48, exposure: float = 0.15):
    available = [item.identifier for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
    if "CYCLES" in available:
        scene.render.engine = "CYCLES"
        scene.cycles.device = "CPU"
        scene.cycles.samples = samples
        scene.cycles.use_adaptive_sampling = True
        scene.cycles.adaptive_threshold = 0.025
        scene.cycles.use_denoising = True
        if hasattr(scene.cycles, "denoiser"):
            try:
                scene.cycles.denoiser = "OPENIMAGEDENOISE"
            except Exception:
                pass
        scene.cycles.max_bounces = 6
        scene.cycles.diffuse_bounces = 3
        scene.cycles.glossy_bounces = 4
        scene.cycles.transmission_bounces = 4
        scene.cycles.transparent_max_bounces = 6
        scene.cycles.sample_clamp_indirect = 8.0
    else:
        scene.render.engine = "BLENDER_EEVEE"
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 64
        if hasattr(scene.eevee, "use_raytracing"):
            scene.eevee.use_raytracing = True

    for vt in ("AgX", "Filmic"):
        try:
            scene.view_settings.view_transform = vt
            break
        except Exception:
            pass
    for lk in ("AgX - Medium High Contrast", "Medium High Contrast", "None"):
        try:
            scene.view_settings.look = lk
            break
        except Exception:
            pass
    scene.view_settings.exposure = exposure

    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    return scene.render.engine


def add_area_light(name, collection, loc, target, energy, color_hex, size_x, size_y, spread_deg=None):
    ld = bpy.data.lights.new(name, type="AREA")
    ld.shape = "DISK" if abs(size_x - size_y) < 0.02 else "RECTANGLE"
    ld.size = size_x
    if ld.shape == "RECTANGLE":
        ld.size_y = size_y
    ld.energy = energy
    ld.color = hex_rgba(color_hex)[:3]
    if spread_deg is not None and hasattr(ld, "spread"):
        ld.spread = math.radians(spread_deg)
    lo = bpy.data.objects.new(name, ld)
    lo.location = loc
    direction = Vector(target) - Vector(loc)
    lo.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    collection.objects.link(lo)
    return lo


def add_point_light(name, collection, loc, energy, color_hex, radius=0.06):
    ld = bpy.data.lights.new(name, type="POINT")
    ld.energy = energy
    ld.color = hex_rgba(color_hex)[:3]
    ld.shadow_soft_size = radius
    lo = bpy.data.objects.new(name, ld)
    lo.location = loc
    collection.objects.link(lo)
    return lo


def setup_orb_studio_rig(scene, studio_col, horo_mats):
    """Sets up a Patek Philippe / Faberge Rembrandt dark-marble tabletop studio for aaa_veritas_orb_render.png."""
    # Luxury dark alpine twilight reflection world (rich studio softbox horizon bands for silky metal reflections!)
    world = bpy.data.worlds.new("Orb_Studio_World")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nodes = nt.nodes
    links = nt.links
    nodes.clear()

    w_out = nodes.new("ShaderNodeOutputWorld")
    w_bg = nodes.new("ShaderNodeBackground")
    w_bg.inputs["Strength"].default_value = 0.85

    tc = nodes.new("ShaderNodeTexCoord")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    mr = nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -1.0
    mr.inputs["From Max"].default_value = 1.0

    ramp = nodes.new("ShaderNodeValToRGB")
    elts = ramp.color_ramp.elements
    elts[0].position = 0.0
    elts[0].color = hex_rgba("#05080F")
    elts[1].position = 0.45
    elts[1].color = hex_rgba("#121C30")
    e2 = ramp.color_ramp.elements.new(0.62)
    e2.color = hex_rgba("#3D5982")
    e3 = ramp.color_ramp.elements.new(0.76)
    e3.color = hex_rgba("#EED29E")
    e4 = ramp.color_ramp.elements.new(0.92)
    e4.color = hex_rgba("#141E30")

    lp = nodes.new("ShaderNodeLightPath")
    bg_cam = nodes.new("ShaderNodeBackground")
    bg_cam.inputs["Color"].default_value = hex_rgba("#060A13")
    bg_cam.inputs["Strength"].default_value = 1.0
    mix = nodes.new("ShaderNodeMixShader")

    links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    links.new(sep.outputs["Z"], mr.inputs["Value"])
    links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], w_bg.inputs["Color"])
    links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    links.new(w_bg.outputs["Background"], mix.inputs[1])
    links.new(bg_cam.outputs["Background"], mix.inputs[2])
    links.new(mix.outputs["Shader"], w_out.inputs["Surface"])

    # Dark Veined Nero Marquina Marble Table Surface flush at Z = 0.0 (NO Tron neon circles!)
    bm_tab = bmesh.new()
    add_superellipse_extrusion(bm_tab, rx=1.45, ry=0.95, exp_n=2.6, z0=-0.04, z1=0.0,
                               segments=72, mat_idx=HM_MARBLE, bevel_z=0.008, bevel_r=0.010)
    finalize_mesh_obj("Studio_Marble_Table", bm_tab, horo_mats, studio_col, sharp_angle_deg=36.0, uv_scale=1.1)

    # Warm Rembrandt Key Softbox (circular DISK so glossy obsidian petals get organic crescent highlights!)
    add_area_light("Orb_Key_Rembrandt", studio_col, loc=(1.38, -1.42, 1.32), target=(0.0, 0.0, 0.43),
                   energy=130.0, color_hex="#FFE2B2", size_x=1.15, size_y=1.15, spread_deg=82.0)
    # Cool Alpine Rim Strip (rear-left-high — crisp blue rim on obsidian petals & gold armillary rings)
    add_area_light("Orb_Rim_Alpine", studio_col, loc=(-1.48, 1.18, 1.22), target=(0.0, 0.0, 0.46),
                   energy=175.0, color_hex="#7EC0FF", size_x=0.70, size_y=1.35, spread_deg=78.0)
    # Subtle Warm Counter-Fill (front-left)
    add_area_light("Orb_Fill_Warm", studio_col, loc=(-1.30, -1.15, 0.52), target=(0.0, 0.0, 0.36),
                   energy=34.0, color_hex="#EBC88C", size_x=1.0, size_y=1.0, spread_deg=105.0)
    # Overhead Gallery Accent (sculpts golden zenith finial & marble pedestal step bevels)
    add_area_light("Orb_Top_Gallery", studio_col, loc=(0.15, -0.25, 1.95), target=(0.0, 0.0, 0.44),
                   energy=48.0, color_hex="#FFF0D8", size_x=0.80, size_y=0.80, spread_deg=68.0)
    # Internal Crystal Heart Golden Radiance (spills warm gold light across the inner obsidian petals!)
    add_point_light("Orb_Core_Light", studio_col, loc=(0.0, 0.0, ORB_CENTER_Z),
                    energy=16.0, color_hex="#FFD26A", radius=0.065)

    # 62mm Luxury Watchmaking Studio Portrait Camera — full silhouette breathing room (base to zenith finial!)
    cam_d = bpy.data.cameras.new("Orb_Studio_Cam")
    cam_d.lens = 62.0
    cam_d.sensor_width = 36.0
    cam_d.clip_start = 0.02
    cam_d.clip_end = 50.0
    cam_d.dof.use_dof = True
    cam_d.dof.focus_distance = 1.96
    cam_d.dof.aperture_fstop = 6.3

    cam_o = bpy.data.objects.new("Orb_Studio_Cam", cam_d)
    cam_o.location = (0.72, -1.80, 0.76)
    cam_dir = Vector((0.0, 0.0, 0.430)) - cam_o.location
    cam_o.rotation_euler = cam_dir.to_track_quat("-Z", "Y").to_euler()
    studio_col.objects.link(cam_o)
    scene.camera = cam_o


def setup_chamber_lighting_and_camera(scene, rig_col):
    """Sets up atmospheric Geneva Alpine Twilight sky + moody Rembrandt diplomatic chamber lighting."""
    # Alpine Twilight Sky: dramatic rich Prussian-blue + subtle rose-gold alpenglow visible behind peaks!
    # Uses Light Path -> Is Camera Ray so outdoor twilight sky stays luminous while interior chamber stays
    # moody, rich dark marble & smoked walnut (ZERO washed-out pale sky glare on the tabletop!)
    world = bpy.data.worlds.new("Geneva_Alpine_Twilight_World")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nodes = nt.nodes
    links = nt.links
    nodes.clear()

    w_out = nodes.new("ShaderNodeOutputWorld")
    w_bg_cam = nodes.new("ShaderNodeBackground")
    w_bg_cam.inputs["Strength"].default_value = 1.45

    w_bg_env = nodes.new("ShaderNodeBackground")
    w_bg_env.inputs["Strength"].default_value = 0.24

    tc = nodes.new("ShaderNodeTexCoord")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    mr = nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -0.05
    mr.inputs["From Max"].default_value = 0.55

    ramp = nodes.new("ShaderNodeValToRGB")
    elts = ramp.color_ramp.elements
    elts[0].position = 0.0
    elts[0].color = hex_rgba("#091124")
    elts[1].position = 0.24
    elts[1].color = hex_rgba("#1A2D54")
    e2 = ramp.color_ramp.elements.new(0.38)
    e2.color = hex_rgba("#6E5874")
    e3 = ramp.color_ramp.elements.new(0.48)
    e3.color = hex_rgba("#DC9368")  # Warm luminous Swiss Alpine sunset alpenglow band behind the peaks!
    e4 = ramp.color_ramp.elements.new(0.64)
    e4.color = hex_rgba("#223B6B")
    e5 = ramp.color_ramp.elements.new(0.92)
    e5.color = hex_rgba("#09132B")

    lp = nodes.new("ShaderNodeLightPath")
    mix = nodes.new("ShaderNodeMixShader")

    links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    links.new(sep.outputs["Z"], mr.inputs["Value"])
    links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], w_bg_cam.inputs["Color"])
    links.new(ramp.outputs["Color"], w_bg_env.inputs["Color"])
    links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    links.new(w_bg_env.outputs["Background"], mix.inputs[1])
    links.new(w_bg_cam.outputs["Background"], mix.inputs[2])
    links.new(mix.outputs["Shader"], w_out.inputs["Surface"])

    # Focused Warm Diplomatic Zenith Skylight Pool directly over the Hero Interrogation Table
    add_area_light("Chamber_Skylight_Key", rig_col, loc=(0.0, -0.10, 5.65), target=(0.0, 0.0, 0.85),
                   energy=420.0, color_hex="#FFE0B0", size_x=2.0, size_y=1.5, spread_deg=54.0)

    # Warm Rembrandt Hero Table Key (steep high angle so zero stray disc reflects on the vertical rear glass!)
    rem_l = add_area_light("Chamber_Table_Rembrandt", rig_col, loc=(1.55, -0.75, 3.15), target=(0.0, 0.0, 1.02),
                           energy=210.0, color_hex="#FFDC9E", size_x=0.95, size_y=0.95, spread_deg=54.0)
    if hasattr(rem_l, "visible_glossy"):
        rem_l.visible_glossy = True

    # Subtle Cool Alpine Twilight Rim Fill (keeps marble & obsidian dark while tracing crisp icy edges!)
    win_l = add_area_light("Chamber_Alpine_WindowFill", rig_col, loc=(0.0, 4.10, 4.65), target=(0.0, -0.6, 0.90),
                           energy=105.0, color_hex="#76B0F6", size_x=6.8, size_y=2.0, spread_deg=95.0)
    if hasattr(win_l, "visible_glossy"):
        win_l.visible_glossy = False

    # Warm Architectural Gallery Uplights grazing the 6 fluted dark-slate columns, brass capitals & walnut walls!
    for cx, cy in ((-3.55, 2.75), (3.55, 2.75), (-4.95, 0.40), (4.95, 0.40), (-4.95, -2.80), (4.95, -2.80)):
        add_point_light(f"Chamber_ColWash_{cx:.1f}_{cy:.1f}", rig_col, loc=(cx, cy, 3.40),
                        energy=135.0, color_hex="#F4C47A", radius=0.45)

    # Low front table-pedestal grazing accent so the sculpted curved dark-walnut & 32 fluted brass ribs shine!
    ped_l = add_area_light("Chamber_Pedestal_Graze", rig_col, loc=(-1.75, -2.10, 0.65), target=(0.0, 0.0, 0.42),
                           energy=70.0, color_hex="#F5C77E", size_x=1.2, size_y=0.65, spread_deg=72.0)
    if hasattr(ped_l, "visible_glossy"):
        ped_l.visible_glossy = False

    # Dramatic 3/4 Alpenglow Alpine Sun raking across the camera-facing 3D snow ridges & dark basalt crags!
    sun_d = bpy.data.lights.new("Alpine_Alpenglow_Sun", type="SUN")
    sun_d.energy = 4.6
    sun_d.angle = math.radians(1.6)
    sun_d.color = hex_rgba("#FFD2A8")[:3]
    sun_o = bpy.data.objects.new("Alpine_Alpenglow_Sun", sun_d)
    sun_o.location = (28.0, -10.0, 16.0)
    sun_dir = Vector((-4.0, 30.0, 5.5)) - sun_o.location
    sun_o.rotation_euler = sun_dir.to_track_quat("-Z", "Y").to_euler()
    rig_col.objects.link(sun_o)

    # Subtle cool Alpine glacial sky fill illuminating the shadowed mountain faces with blue twilight depth!
    sky_sun_d = bpy.data.lights.new("Alpine_Twilight_SkyFill", type="SUN")
    sky_sun_d.energy = 1.15
    sky_sun_d.angle = math.radians(18.0)
    sky_sun_d.color = hex_rgba("#6E9CE8")[:3]
    sky_sun_o = bpy.data.objects.new("Alpine_Twilight_SkyFill", sky_sun_d)
    sky_sun_o.location = (-22.0, -8.0, 24.0)
    sky_dir = Vector((4.0, 28.0, 4.0)) - sky_sun_o.location
    sky_sun_o.rotation_euler = sky_dir.to_track_quat("-Z", "Y").to_euler()
    rig_col.objects.link(sky_sun_o)

    # Warm internal crystal light inside the showcase Veritas Orb on the table (Z = 0.782 + 0.44 = 1.222m!)
    add_point_light("Chamber_Orb_CoreGlow", rig_col, loc=(0.0, 0.0, 0.782 + ORB_CENTER_Z),
                    energy=18.0, color_hex="#FFD26A", radius=0.07)

    # Cinematic 22mm Architectural Wide Camera seated across the interrogation table:
    # Frames sculpted walnut-and-brass table, Veritas Orb + Cryptex + Chronometer,
    # fluted dark-slate columns + brass capitals, coffered ceiling edge, AND snow-capped 3D Alpine peaks!
    cam_d = bpy.data.cameras.new("Chamber_Interrogation_Cam")
    cam_d.lens = 22.0
    cam_d.sensor_width = 36.0
    cam_d.clip_start = 0.05
    cam_d.clip_end = 150.0
    cam_d.dof.use_dof = True
    cam_d.dof.focus_distance = 3.25
    cam_d.dof.aperture_fstop = 9.0

    cam_o = bpy.data.objects.new("Chamber_Interrogation_Cam", cam_d)
    cam_o.location = (0.0, -3.25, 1.72)
    cam_dir = Vector((0.0, 2.20, 1.92)) - cam_o.location
    cam_o.rotation_euler = cam_dir.to_track_quat("-Z", "Y").to_euler()
    rig_col.objects.link(cam_o)
    scene.camera = cam_o


# ===========================================================================
# Main End-to-End Pipeline
# ===========================================================================
def main():
    t0 = time.time()
    log = [f"BLENDER_VERSION={bpy.app.version_string}"]

    # -----------------------------------------------------------------------
    # PHASE 1: VERITAS ASTROLABE ORB (.blend + .glb + 1024x1024 Beauty Render)
    # -----------------------------------------------------------------------
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    orb_col = bpy.data.collections.new("Veritas_Astrolabe_Orb")
    studio_col = bpy.data.collections.new("Orb_Studio_Rig")
    scene.collection.children.link(orb_col)
    scene.collection.children.link(studio_col)

    horo_mats = build_horology_materials()
    orb_objs, orb_refs = build_veritas_orb_objects(horo_mats, orb_col)
    setup_orb_studio_rig(scene, studio_col, horo_mats)
    eng_orb = configure_render(scene, width=1024, height=1024, samples=56, exposure=0.22)
    log.append(f"RENDER_ENGINE={eng_orb}")

    # Save pristine rest-pose aaa_veritas_orb.blend
    bpy.ops.wm.save_as_mainfile(filepath=str(ORB_BLEND))

    # Export clean pristine rest-pose veritas_astrolabe_orb.glb
    export_selected_glb(orb_objs, ORB_GLB)
    orb_stats, orb_tris, orb_dims = collect_mesh_stats(orb_objs)
    orb_glb_info = inspect_glb_binary(ORB_GLB)

    log.append(f"ORB_BLEND_BYTES={ORB_BLEND.stat().st_size}")
    log.append(f"ORB_GLB_BYTES={orb_glb_info['file_bytes']}")
    log.append(f"ORB_GLB_TRIS={orb_glb_info['glb_triangles']}")
    log.append(f"ORB_EVAL_TRIS={orb_tris}")
    log.append(f"ORB_DIMS={json.dumps(orb_dims)}")
    log.append(f"ORB_NODES={json.dumps(orb_glb_info['nodes'])}")
    log.append(f"ORB_NODE_TRIS={json.dumps(orb_stats)}")
    log.append(f"ORB_MATERIALS={json.dumps(orb_glb_info['materials'])}")

    # Gently bloom the 6 Faberge petals open 12° ONLY for the studio beauty shot so the glowing crystal heart shines!
    for p_obj in orb_refs["petals"]:
        # Positive local X tilt blooms top of petal radially outward around sphere center!
        p_obj.rotation_euler = Euler((math.radians(12.0), 0.0, p_obj.rotation_euler.z), "XYZ")
    scene.render.filepath = str(ORB_RENDER_PNG)
    t_r1 = time.time()
    bpy.ops.render.render(write_still=True)
    log.append(f"ORB_RENDER_SECS={time.time() - t_r1:.1f}")
    log.append(f"ORB_RENDER_BYTES={ORB_RENDER_PNG.stat().st_size if ORB_RENDER_PNG.exists() else 0}")

    # -----------------------------------------------------------------------
    # PHASE 2: CODEX CRYPTEX (codex_cryptex.glb)
    # -----------------------------------------------------------------------
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    cryp_col = bpy.data.collections.new("Codex_Cryptex")
    scene.collection.children.link(cryp_col)
    horo_mats_2 = build_horology_materials()
    cryptex_objs = build_codex_cryptex_objects(horo_mats_2, cryp_col)

    export_selected_glb(cryptex_objs, CRYPTEX_GLB)
    cryp_stats, cryp_tris, cryp_dims = collect_mesh_stats(cryptex_objs)
    cryp_info = inspect_glb_binary(CRYPTEX_GLB)

    log.append(f"CRYPTEX_GLB_BYTES={cryp_info['file_bytes']}")
    log.append(f"CRYPTEX_GLB_TRIS={cryp_info['glb_triangles']}")
    log.append(f"CRYPTEX_DIMS={json.dumps(cryp_dims)}")
    log.append(f"CRYPTEX_NODES={json.dumps(cryp_info['nodes'])}")
    log.append(f"CRYPTEX_NODE_TRIS={json.dumps(cryp_stats)}")

    # -----------------------------------------------------------------------
    # PHASE 3: CALIBRATOR CHRONOMETER (calibrator_chronometer.glb)
    # -----------------------------------------------------------------------
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    chr_col = bpy.data.collections.new("Calibrator_Chronometer")
    scene.collection.children.link(chr_col)
    horo_mats_3 = build_horology_materials()
    chrono_objs = build_calibrator_chronometer_objects(horo_mats_3, chr_col)

    export_selected_glb(chrono_objs, CHRONO_GLB)
    chr_stats, chr_tris, chr_dims = collect_mesh_stats(chrono_objs)
    chr_info = inspect_glb_binary(CHRONO_GLB)

    log.append(f"CHRONO_GLB_BYTES={chr_info['file_bytes']}")
    log.append(f"CHRONO_GLB_TRIS={chr_info['glb_triangles']}")
    log.append(f"CHRONO_DIMS={json.dumps(chr_dims)}")
    log.append(f"CHRONO_NODES={json.dumps(chr_info['nodes'])}")
    log.append(f"CHRONO_NODE_TRIS={json.dumps(chr_stats)}")

    # -----------------------------------------------------------------------
    # PHASE 4: GENEVA ALPINE VETTING CHAMBER (.blend + .glb + 1280x720 Vista Render)
    # -----------------------------------------------------------------------
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    chamber_col = bpy.data.collections.new("Vetting_Chamber_Architecture")
    showcase_col = bpy.data.collections.new("Showcase_Hero_Props")
    rig_col = bpy.data.collections.new("Chamber_Lighting_Rig")
    scene.collection.children.link(chamber_col)
    scene.collection.children.link(showcase_col)
    scene.collection.children.link(rig_col)

    ch_mats = build_chamber_materials()
    chamber_objs = build_vetting_chamber_objects(ch_mats, chamber_col)

    # Export ONLY the modular architectural chamber + table + Alpine peaks to vetting_chamber_room.glb!
    export_selected_glb(chamber_objs, CHAMBER_GLB)
    ch_stats, ch_tris, ch_dims = collect_mesh_stats(chamber_objs)
    ch_info = inspect_glb_binary(CHAMBER_GLB)

    log.append(f"CHAMBER_GLB_BYTES={ch_info['file_bytes']}")
    log.append(f"CHAMBER_GLB_TRIS={ch_info['glb_triangles']}")
    log.append(f"CHAMBER_DIMS={json.dumps(ch_dims)}")
    log.append(f"CHAMBER_NODES={json.dumps(ch_info['nodes'])}")
    log.append(f"CHAMBER_MATERIALS={json.dumps(ch_info['materials'])}")
    log.append(f"CHAMBER_NODE_TRIS={json.dumps(ch_stats)}")

    # Place our 3 sculpted hero horological instruments on the interrogation table for the chamber beauty render!
    # (They live in Showcase_Hero_Props — NOT exported inside vetting_chamber_room.glb!)
    horo_mats_ch = build_horology_materials()

    # 4a. Center Veritas Astrolabe Orb flush on the stitched-leather executive desk pad (Z = 0.782m)
    orb_root = bpy.data.objects.new("Showcase_Orb_Root", None)
    orb_root.location = (0.0, 0.0, 0.782)
    showcase_col.objects.link(orb_root)
    ch_orb_objs, ch_orb_refs = build_veritas_orb_objects(horo_mats_ch, showcase_col)
    for o in ch_orb_objs:
        if o.parent is None:
            o.parent = orb_root
    for p_obj in ch_orb_refs["petals"]:
        p_obj.rotation_euler = Euler((math.radians(10.0), 0.0, p_obj.rotation_euler.z), "XYZ")

    # 4b. Left marble wing: Codex Cryptex flush on marble tabletop (X = -0.82m, Y = +0.08m, Z = 0.780m)
    cryp_root = bpy.data.objects.new("Showcase_Cryptex_Root", None)
    cryp_root.location = (-0.82, 0.10, 0.780)
    cryp_root.rotation_euler = (0.0, 0.0, math.radians(18.0))
    showcase_col.objects.link(cryp_root)
    ch_cryp_objs = build_codex_cryptex_objects(horo_mats_ch, showcase_col)
    for o in ch_cryp_objs:
        if o.parent is None:
            o.parent = cryp_root

    # 4c. Right marble wing: Calibrator Chronometer flush on marble tabletop (X = +0.84m, Y = +0.10m, Z = 0.780m)
    chr_root = bpy.data.objects.new("Showcase_Chronometer_Root", None)
    chr_root.location = (0.84, 0.10, 0.780)
    chr_root.rotation_euler = (0.0, 0.0, math.radians(-22.0))
    chr_root.scale = (0.72, 0.72, 0.72)  # Harmonious tabletop companion scale next to hero Orb!
    showcase_col.objects.link(chr_root)
    ch_chr_objs = build_calibrator_chronometer_objects(horo_mats_ch, showcase_col)
    for o in ch_chr_objs:
        if o.parent is None:
            o.parent = chr_root

    setup_chamber_lighting_and_camera(scene, rig_col)
    configure_render(scene, width=1280, height=720, samples=48, exposure=0.18)

    # Save full chamber + showcase .blend source
    bpy.ops.wm.save_as_mainfile(filepath=str(CHAMBER_BLEND))
    log.append(f"CHAMBER_BLEND_BYTES={CHAMBER_BLEND.stat().st_size}")

    scene.render.filepath = str(CHAMBER_RENDER_PNG)
    t_r2 = time.time()
    bpy.ops.render.render(write_still=True)
    log.append(f"CHAMBER_RENDER_SECS={time.time() - t_r2:.1f}")
    log.append(f"CHAMBER_RENDER_BYTES={CHAMBER_RENDER_PNG.stat().st_size if CHAMBER_RENDER_PNG.exists() else 0}")
    log.append(f"TOTAL_SECS={time.time() - t0:.1f}")
    log.append("STATUS=SUCCESS")

    LOG_FILE.write_text("\n".join(log) + "\n", encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        LOG_FILE.write_text("STATUS=ERROR\n" + traceback.format_exc(), encoding="utf-8")
        raise
