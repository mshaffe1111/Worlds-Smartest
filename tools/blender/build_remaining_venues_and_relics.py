"""
World's Smartest — Wave-2 AAA 3D Global Venues (Rio, Reykjavik, Singapore, Apex Forum),
Tier-3 Boss Relics (Cryo-Core Relay, Fractured Council Seal, Master Ledger Core),
and 3D Meridian Diplomatic Passport (with animatable Passport_Cover hinge!).

Authored for Blender 5.3.0 (bpy / bmesh) — exports 8 self-contained, JPEG-sanitized PBR .glb
models into public/assets/aaa_models/, saves master .blend, and renders a crisp 2400x1350
4x2 architectural & horological showcase sheet (assets/renders/remaining_venues_relics_render.png).

Invocation (PowerShell):
  & "$env:LOCALAPPDATA\Microsoft\WindowsApps\blender-launcher.exe" --background --python tools\blender\build_remaining_venues_and_relics.py
"""

import bpy
import bmesh
import math
import os
import sys
import json
import struct
import tempfile
import traceback
import numpy as np
from mathutils import Vector, Matrix, Euler

# ---------------------------------------------------------------------------
# Paths (Strict Disjoint Wave-2 File Ownership)
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

OUT_PUBLIC_GLB_DIR = os.path.join(REPO_ROOT, "public", "assets", "aaa_models")
OUT_BLEND_PATH = os.path.join(REPO_ROOT, "assets", "blender", "aaa_remaining_venues_relics.blend")
OUT_RENDER_PATH = os.path.join(REPO_ROOT, "assets", "renders", "remaining_venues_relics_render.png")
OUT_LOG_PATH = os.path.join(REPO_ROOT, "assets", "renders", "remaining_venues_blender.log")

for d in (OUT_PUBLIC_GLB_DIR, os.path.dirname(OUT_BLEND_PATH), os.path.dirname(OUT_RENDER_PATH)):
    os.makedirs(d, exist_ok=True)


# ---------------------------------------------------------------------------
# Color, Procedural PBR Texture & JPEG-Sanitizer Helpers
# ---------------------------------------------------------------------------
def srgb_to_linear(hex_str: str):
    h = hex_str.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), 1.0)


def strip_png_color_metadata_chunks(raw_png: bytes) -> bytes:
    """Strips conflicting iCCP/sRGB/cICP/eXIf/gAMA/cHRM chunks from Blender PNGs (W3C PNG §11.3.2.2)."""
    PNG_SIG = b"\x89PNG\r\n\x1a\n"
    if len(raw_png) < 8 or raw_png[:8] != PNG_SIG:
        return raw_png
    drop = {b"iCCP", b"sRGB", b"cICP", b"eXIf", b"gAMA", b"cHRM"}
    out = bytearray(PNG_SIG)
    pos = 8
    n = len(raw_png)
    while pos + 8 <= n:
        clen = struct.unpack(">I", raw_png[pos:pos + 4])[0]
        ctype = raw_png[pos + 4:pos + 8]
        cend = pos + 12 + clen
        if cend > n:
            out.extend(raw_png[pos:])
            break
        if ctype not in drop:
            out.extend(raw_png[pos:cend])
        pos = cend
        if ctype == b"IEND":
            break
    return bytes(out)


def strip_jpeg_non_jfif_app_markers(raw_jpg: bytes) -> bytes:
    """Strips Blender 5.3.0 APP1 'NeoGeo' & APP2 'ICC_PROFILE' markers."""
    if len(raw_jpg) < 4 or raw_jpg[:2] != b"\xFF\xD8":
        return raw_jpg
    out = bytearray(b"\xFF\xD8")
    pos = 2
    n = len(raw_jpg)
    while pos < n - 1:
        if raw_jpg[pos] != 0xFF:
            out.extend(raw_jpg[pos:])
            break
        m = raw_jpg[pos + 1]
        if m == 0xDA:
            out.extend(raw_jpg[pos:])
            break
        if m in (0xD8, 0xD9, 0x01) or (0xD0 <= m <= 0xD7):
            out.extend(raw_jpg[pos:pos + 2])
            pos += 2
            continue
        if pos + 4 > n:
            out.extend(raw_jpg[pos:])
            break
        seg_len = struct.unpack(">H", raw_jpg[pos + 2:pos + 4])[0]
        seg_end = pos + 2 + seg_len
        if not (0xE1 <= m <= 0xEF):
            out.extend(raw_jpg[pos:seg_end])
        pos = seg_end
    return bytes(out)


def create_packed_image(name: str, rgba: np.ndarray, is_data: bool = False, use_jpeg: bool = True, quality: int = 88):
    """Creates a real FILE-backed, JPEG-sanitized packed image in Blender 5.3.0."""
    h, w, _ = rgba.shape
    clamped = np.clip(rgba, 0.0, 1.0).astype(np.float32)
    ext = "jpg" if use_jpeg else "png"
    tmp_path = os.path.join(tempfile.gettempdir(), f"ws_w2_{name}.{ext}")
    img_tmp = bpy.data.images.new(name=f"__tmp_{name}", width=w, height=h, alpha=False, float_buffer=False)
    img_tmp.pixels.foreach_set(clamped.ravel())
    img_tmp.filepath_raw = tmp_path
    img_tmp.file_format = "JPEG" if use_jpeg else "PNG"
    bpy.context.scene.render.image_settings.quality = quality
    img_tmp.save()
    bpy.data.images.remove(img_tmp)

    if use_jpeg and os.path.exists(tmp_path):
        with open(tmp_path, "rb") as f:
            cleaned = strip_jpeg_non_jfif_app_markers(f.read())
        with open(tmp_path, "wb") as f:
            f.write(cleaned)

    img = bpy.data.images.load(tmp_path)
    img.name = name
    img.colorspace_settings.name = "Non-Color" if is_data else "sRGB"
    img.pack()
    try:
        os.remove(tmp_path)
    except OSError:
        pass
    return img


def height_to_normal_rgba(height: np.ndarray, strength: float = 1.2):
    dx = np.roll(height, -1, axis=1) - np.roll(height, 1, axis=1)
    dy = np.roll(height, -1, axis=0) - np.roll(height, 1, axis=0)
    nx = -dx * strength
    ny = -dy * strength
    nz = np.ones_like(nx)
    nlen = np.sqrt(nx * nx + ny * ny + nz * nz) + 1e-6
    h, w = height.shape
    out = np.ones((h, w, 4), dtype=np.float32)
    out[:, :, 0] = 0.5 + 0.5 * (nx / nlen)
    out[:, :, 1] = 0.5 + 0.5 * (ny / nlen)
    out[:, :, 2] = 0.5 + 0.5 * (nz / nlen)
    return out


def fft_fbm(rng, h: int, w: int, octaves=((180.0, 0.50), (38.0, 0.32), (8.0, 0.18)), aniso=(1.0, 1.0)):
    raw = rng.normal(0.0, 1.0, (h, w))
    fraw = np.fft.fft2(raw)
    fx = (np.fft.fftfreq(w)[None, :]) * aniso[0]
    fy = (np.fft.fftfreq(h)[:, None]) * aniso[1]
    r2 = fx * fx + fy * fy
    acc = np.zeros((h, w), dtype=np.float64)
    for k, wt in octaves:
        acc += wt * np.real(np.fft.ifft2(fraw * np.exp(-r2 * k)))
    mn, mx = acc.min(), acc.max()
    return ((acc - mn) / (mx - mn + 1e-8)).astype(np.float32)


def make_gray_rgba(arr: np.ndarray):
    h, w = arr.shape
    out = np.ones((h, w, 4), dtype=np.float32)
    out[:, :, 0] = arr
    out[:, :, 1] = arr
    out[:, :, 2] = arr
    return out


def build_procedural_textures():
    """Builds compact 256x256 seamless PBR micro-textures for wood, stone, marble, basalt, metal & leather."""
    tex = {}
    rng = np.random.default_rng(20261122)
    S = 256
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32) / S

    # 1. Brushed Satin Metal (Brass, Gold, Titanium, Platinum)
    brush = fft_fbm(rng, S, S, octaves=((220.0, 0.45), (38.0, 0.35), (6.0, 0.20)), aniso=(3.2, 0.25))
    patina = fft_fbm(rng, S, S, octaves=((80.0, 0.65), (18.0, 0.35)))
    br_r = np.clip(0.17 + 0.14 * brush + 0.07 * patina, 0.12, 0.42)
    tex["metal_rough"] = create_packed_image("Tex_W2_MetalRough", make_gray_rgba(br_r), is_data=True)
    tex["metal_norm"] = create_packed_image("Tex_W2_MetalNorm", height_to_normal_rgba(brush, 0.72), is_data=True)

    # 2. Brazilian Dark Teak / Smoked Walnut Plank Wood
    w_warp = fft_fbm(rng, S, S, octaves=((320.0, 0.65), (80.0, 0.35)))
    w_rings = np.sin((yy * 16.0 + w_warp * 4.2) * math.pi * 2.0) * 0.5 + 0.5
    w_fine = fft_fbm(rng, S, S, octaves=((140.0, 0.5), (18.0, 0.5)), aniso=(0.25, 3.6))
    plank_seam = np.clip(np.minimum((yy * 6.0) % 1.0, 1.0 - ((yy * 6.0) % 1.0)) / 0.04, 0.0, 1.0)
    w_val = (0.50 * w_rings + 0.50 * w_fine) * (0.55 + 0.45 * plank_seam)
    teak_col = np.ones((S, S, 4), dtype=np.float32)
    teak_col[:, :, 0] = np.clip(0.16 + 0.22 * w_val, 0.0, 1.0)
    teak_col[:, :, 1] = np.clip(0.085 + 0.125 * w_val, 0.0, 1.0)
    teak_col[:, :, 2] = np.clip(0.042 + 0.065 * w_val, 0.0, 1.0)
    teak_r = np.clip(0.24 + 0.16 * w_fine + 0.18 * (1.0 - plank_seam), 0.16, 0.58)
    tex["teak_col"] = create_packed_image("Tex_W2_TeakCol", teak_col, is_data=False)
    tex["teak_rough"] = create_packed_image("Tex_W2_TeakRough", make_gray_rgba(teak_r), is_data=True)
    tex["teak_norm"] = create_packed_image("Tex_W2_TeakNorm", height_to_normal_rgba(w_val, 1.05), is_data=True)

    # 3. Veined Dark Nero / Emerald Marble
    m_t1 = fft_fbm(rng, S, S, octaves=((220.0, 0.55), (48.0, 0.30), (10.0, 0.15)))
    m_t2 = fft_fbm(rng, S, S, octaves=((160.0, 0.5), (26.0, 0.5)))
    v1 = np.power(np.clip(1.0 - np.abs(np.sin((xx * 3.0 + yy * 2.0 + m_t1 * 3.8) * math.pi)), 0.0, 1.0), 14.0)
    v2 = np.power(np.clip(1.0 - np.abs(np.sin((xx * 5.0 - yy * 3.0 + m_t2 * 4.4) * math.pi)), 0.0, 1.0), 18.0)
    dm_col = np.ones((S, S, 4), dtype=np.float32)
    dm_col[:, :, 0] = np.clip(0.05 + 0.04 * m_t1 + 0.48 * v1 + 0.62 * v2, 0.0, 1.0)
    dm_col[:, :, 1] = np.clip(0.065 + 0.05 * m_t1 + 0.52 * v1 + 0.48 * v2, 0.0, 1.0)
    dm_col[:, :, 2] = np.clip(0.075 + 0.04 * m_t1 + 0.46 * v1 + 0.24 * v2, 0.0, 1.0)
    dm_r = np.clip(0.14 + 0.12 * m_t1 + 0.08 * v1, 0.09, 0.34)
    tex["marble_col"] = create_packed_image("Tex_W2_MarbleCol", dm_col, is_data=False)
    tex["marble_rough"] = create_packed_image("Tex_W2_MarbleRough", make_gray_rgba(dm_r), is_data=True)
    tex["marble_norm"] = create_packed_image("Tex_W2_MarbleNorm", height_to_normal_rgba(0.6 * m_t1 + 0.4 * v1, 0.42), is_data=True)

    # 4. Cream Botanical Limestone / Travertine
    lm_col = np.ones((S, S, 4), dtype=np.float32)
    lm_col[:, :, 0] = np.clip(0.82 - 0.12 * m_t1 - 0.18 * v1, 0.0, 1.0)
    lm_col[:, :, 1] = np.clip(0.79 - 0.11 * m_t1 - 0.18 * v1, 0.0, 1.0)
    lm_col[:, :, 2] = np.clip(0.72 - 0.11 * m_t1 - 0.20 * v1, 0.0, 1.0)
    tex["cream_stone_col"] = create_packed_image("Tex_W2_CreamStoneCol", lm_col, is_data=False)

    # 5. Volcanic Columnar Basalt & Architectural Slate (Reykjavik, Singapore, Apex)
    bs_n = fft_fbm(rng, S, S, octaves=((160.0, 0.45), (34.0, 0.35), (6.0, 0.20)))
    bs_f = fft_fbm(rng, S, S, octaves=((18.0, 0.5), (3.5, 0.5)))
    bs_mix = 0.65 * bs_n + 0.35 * bs_f
    bs_col = np.ones((S, S, 4), dtype=np.float32)
    bs_col[:, :, 0] = np.clip(0.075 + 0.075 * bs_mix, 0.0, 1.0)
    bs_col[:, :, 1] = np.clip(0.088 + 0.082 * bs_mix, 0.0, 1.0)
    bs_col[:, :, 2] = np.clip(0.112 + 0.092 * bs_mix, 0.0, 1.0)
    bs_r = np.clip(0.34 + 0.28 * bs_mix, 0.22, 0.72)
    tex["basalt_col"] = create_packed_image("Tex_W2_BasaltCol", bs_col, is_data=False)
    tex["basalt_rough"] = create_packed_image("Tex_W2_BasaltRough", make_gray_rgba(bs_r), is_data=True)
    tex["basalt_norm"] = create_packed_image("Tex_W2_BasaltNorm", height_to_normal_rgba(bs_mix, 1.35), is_data=True)

    # 6. Diplomatic Calfskin Grain Leather (Passport & Table Blotters)
    le_n = fft_fbm(rng, S, S, octaves=((36.0, 0.30), (6.0, 0.45), (1.8, 0.25)))
    le_col = np.ones((S, S, 4), dtype=np.float32)
    le_col[:, :, 0] = np.clip(0.055 + 0.045 * le_n, 0.0, 1.0)
    le_col[:, :, 1] = np.clip(0.085 + 0.055 * le_n, 0.0, 1.0)
    le_col[:, :, 2] = np.clip(0.165 + 0.075 * le_n, 0.0, 1.0)
    tex["passport_leather_col"] = create_packed_image("Tex_W2_PassportLeatherCol", le_col, is_data=False)
    tex["leather_norm"] = create_packed_image("Tex_W2_LeatherNorm", height_to_normal_rgba(le_n, 1.15), is_data=True)

    # 7. Diplomatic Cream Security Parchment Paper (Passport Pages w/ Subtle Gold Guilloche Grid)
    guil = np.abs(np.sin((xx * 18.0 + np.sin(yy * math.pi * 6.0) * 0.6) * math.pi))
    guil = np.power(np.clip(1.0 - guil, 0.0, 1.0), 10.0) * 0.35
    pa_n = fft_fbm(rng, S, S, octaves=((60.0, 0.6), (12.0, 0.4)))
    pa_col = np.ones((S, S, 4), dtype=np.float32)
    pa_col[:, :, 0] = np.clip(0.92 - 0.05 * pa_n + 0.05 * guil, 0.0, 1.0)
    pa_col[:, :, 1] = np.clip(0.88 - 0.05 * pa_n + 0.02 * guil, 0.0, 1.0)
    pa_col[:, :, 2] = np.clip(0.78 - 0.06 * pa_n - 0.08 * guil, 0.0, 1.0)
    tex["parchment_col"] = create_packed_image("Tex_W2_ParchmentCol", pa_col, is_data=False)

    return tex


def make_pbr_mat(
    name: str,
    base_hex: str = "#CCCCCC",
    metallic: float = 0.0,
    roughness: float = 0.38,
    coat: float = 0.0,
    coat_roughness: float = 0.12,
    alpha: float = 1.0,
    emission_hex: str = None,
    emission_strength: float = 0.0,
    col_tex=None,
    rough_tex=None,
    norm_tex=None,
    norm_strength: float = 0.28,
    uv_scale: float = 1.0,
    tint_strength: float = 0.0,
):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (540, 0)

    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (220, 0)
    bsdf.inputs["Base Color"].default_value = srgb_to_linear(base_hex)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if "Coat Weight" in bsdf.inputs:
        bsdf.inputs["Coat Weight"].default_value = coat
    if "Coat Roughness" in bsdf.inputs:
        bsdf.inputs["Coat Roughness"].default_value = coat_roughness
    if alpha < 0.999:
        bsdf.inputs["Alpha"].default_value = alpha
        if hasattr(mat, "blend_method"):
            mat.blend_method = "BLEND"
    if emission_hex and emission_strength > 0.0 and "Emission Color" in bsdf.inputs:
        bsdf.inputs["Emission Color"].default_value = srgb_to_linear(emission_hex)
        bsdf.inputs["Emission Strength"].default_value = emission_strength

    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    if any(t is not None for t in (col_tex, rough_tex, norm_tex)):
        tc = nt.nodes.new("ShaderNodeTexCoord")
        tc.location = (-680, 0)
        mapping = nt.nodes.new("ShaderNodeMapping")
        mapping.location = (-480, 0)
        mapping.inputs["Scale"].default_value = (uv_scale, uv_scale, uv_scale)
        nt.links.new(tc.outputs["UV"], mapping.inputs["Vector"])

        if col_tex is not None:
            t_col = nt.nodes.new("ShaderNodeTexImage")
            t_col.location = (-220, 240)
            t_col.image = col_tex
            nt.links.new(mapping.outputs["Vector"], t_col.inputs["Vector"])
            if tint_strength > 0.001:
                mix = nt.nodes.new("ShaderNodeMix")
                mix.data_type = "RGBA"
                mix.blend_type = "MIX"
                mix.location = (20, 240)
                mix.inputs["Factor"].default_value = tint_strength
                mix.inputs["B"].default_value = srgb_to_linear(base_hex)
                nt.links.new(t_col.outputs["Color"], mix.inputs["A"])
                nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
            else:
                nt.links.new(t_col.outputs["Color"], bsdf.inputs["Base Color"])

        if rough_tex is not None:
            t_rgh = nt.nodes.new("ShaderNodeTexImage")
            t_rgh.location = (-220, -60)
            t_rgh.image = rough_tex
            nt.links.new(mapping.outputs["Vector"], t_rgh.inputs["Vector"])
            nt.links.new(t_rgh.outputs["Color"], bsdf.inputs["Roughness"])

        if norm_tex is not None:
            t_nrm = nt.nodes.new("ShaderNodeTexImage")
            t_nrm.location = (-220, -340)
            t_nrm.image = norm_tex
            nt.links.new(mapping.outputs["Vector"], t_nrm.inputs["Vector"])
            nmap = nt.nodes.new("ShaderNodeNormalMap")
            nmap.location = (30, -340)
            nmap.inputs["Strength"].default_value = norm_strength
            nt.links.new(t_nrm.outputs["Color"], nmap.inputs["Color"])
            nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])

    return mat


def build_material_library(tex):
    m = {}

    # Shared Architectural AR Window Glass (recognized automatically by VenueArenaLoader.ts!)
    m["window_glass"] = make_pbr_mat(
        "Mat_Window_Glass", "#0E1C2E", metallic=0.04, roughness=0.06, coat=0.06, alpha=0.065,
    )
    m["floor_glass"] = make_pbr_mat(
        "Mat_Structural_FloorGlass", "#10283E", metallic=0.08, roughness=0.10, coat=0.25, alpha=0.26,
    )

    # Shared Luxury Golds, Metals & Stones
    m["gold_24k"] = make_pbr_mat(
        "Mat_Gold_24K", "#E5B954", metallic=0.96, roughness=0.17, coat=0.20, coat_roughness=0.08,
        rough_tex=tex["metal_rough"], norm_tex=tex["metal_norm"], norm_strength=0.16, uv_scale=2.2,
    )
    m["brass_antique"] = make_pbr_mat(
        "Mat_Antique_Brass", "#C89B44", metallic=0.92, roughness=0.25,
        rough_tex=tex["metal_rough"], norm_tex=tex["metal_norm"], norm_strength=0.22, uv_scale=2.0,
    )
    m["rose_gold"] = make_pbr_mat(
        "Mat_Rose_Gold", "#D99679", metallic=0.94, roughness=0.20,
        rough_tex=tex["metal_rough"], norm_tex=tex["metal_norm"], norm_strength=0.16, uv_scale=2.0,
    )
    m["platinum"] = make_pbr_mat(
        "Mat_Brushed_Platinum", "#CFD7E3", metallic=0.94, roughness=0.21,
        rough_tex=tex["metal_rough"], norm_tex=tex["metal_norm"], norm_strength=0.16, uv_scale=2.0,
    )
    m["titanium"] = make_pbr_mat(
        "Mat_Brushed_Titanium", "#5B6778", metallic=0.88, roughness=0.28,
        rough_tex=tex["metal_rough"], norm_tex=tex["metal_norm"], norm_strength=0.20, uv_scale=1.8,
    )
    m["gunmetal"] = make_pbr_mat(
        "Mat_Dark_Gunmetal", "#424C5C", metallic=0.84, roughness=0.32,
        rough_tex=tex["metal_rough"], norm_tex=tex["metal_norm"], norm_strength=0.18, uv_scale=1.6,
    )
    m["dark_marble"] = make_pbr_mat(
        "Mat_Dark_Marble", "#12161F", metallic=0.04, roughness=0.16, coat=0.60, coat_roughness=0.08,
        col_tex=tex["marble_col"], rough_tex=tex["marble_rough"], norm_tex=tex["marble_norm"], norm_strength=0.20, uv_scale=1.0,
    )
    m["cream_limestone"] = make_pbr_mat(
        "Mat_Cream_Limestone", "#DDD4C2", metallic=0.0, roughness=0.44,
        col_tex=tex["cream_stone_col"], norm_tex=tex["marble_norm"], norm_strength=0.26, uv_scale=1.0,
    )
    m["obsidian"] = make_pbr_mat(
        "Mat_Honed_Obsidian", "#0B0E16", metallic=0.10, roughness=0.16, coat=0.62, coat_roughness=0.08,
        col_tex=tex["marble_col"], rough_tex=tex["marble_rough"], norm_tex=tex["marble_norm"],
        norm_strength=0.14, uv_scale=1.2, tint_strength=0.35,
    )

    # 1. Rio Botanical Canopy Specific
    m["rio_teak"] = make_pbr_mat(
        "Mat_Rio_Teak", "#3B2010", metallic=0.0, roughness=0.28, coat=0.35, coat_roughness=0.16,
        col_tex=tex["teak_col"], rough_tex=tex["teak_rough"], norm_tex=tex["teak_norm"], norm_strength=0.36, uv_scale=1.0,
    )
    m["rio_iron"] = make_pbr_mat(
        "Mat_Rio_WroughtIron", "#3C584D", metallic=0.78, roughness=0.34,
        rough_tex=tex["metal_rough"], norm_tex=tex["metal_norm"], norm_strength=0.22, uv_scale=1.8,
    )
    m["rio_emerald_stone"] = make_pbr_mat(
        "Mat_Rio_EmeraldMarble", "#0C3B2E", metallic=0.08, roughness=0.18, coat=0.65, coat_roughness=0.08,
        col_tex=tex["marble_col"], norm_tex=tex["marble_norm"], norm_strength=0.20, uv_scale=1.2, tint_strength=0.55,
    )
    m["rio_foliage"] = make_pbr_mat(
        "Mat_Rio_BotanicalFoliage", "#14452F", metallic=0.05, roughness=0.42, coat=0.25,
        norm_tex=tex["basalt_norm"], norm_strength=0.25, uv_scale=2.0,
    )
    m["rio_lantern_glow"] = make_pbr_mat(
        "Mat_Rio_LanternGlow", "#FFE8B8", metallic=0.0, roughness=0.22,
        emission_hex="#FFC96B", emission_strength=1.55,
    )

    # 2. Reykjavik Basalt Caldera & Cryo Relic Specific
    m["reyk_basalt"] = make_pbr_mat(
        "Mat_Reyk_Basalt", "#181D26", metallic=0.08, roughness=0.52,
        col_tex=tex["basalt_col"], rough_tex=tex["basalt_rough"], norm_tex=tex["basalt_norm"], norm_strength=0.55, uv_scale=0.8,
    )
    m["reyk_cryo_crystal"] = make_pbr_mat(
        "Mat_Cryo_OpticalCrystal", "#58DCF5", metallic=0.14, roughness=0.10, coat=0.92, coat_roughness=0.04,
        emission_hex="#24C8EB", emission_strength=0.72,
    )
    m["reyk_aurora_core"] = make_pbr_mat(
        "Mat_Aurora_EnergyCore", "#38F5C8", metallic=0.15, roughness=0.08, coat=0.95,
        emission_hex="#18E8B5", emission_strength=1.65,
    )
    m["reyk_magma_ember"] = make_pbr_mat(
        "Mat_Reyk_GeothermalGlow", "#FF9A3D", metallic=0.0, roughness=0.25,
        emission_hex="#FF7B24", emission_strength=1.45,
    )

    # 3. Singapore Sky-Bridge & Council Seal Specific
    m["sg_slate"] = make_pbr_mat(
        "Mat_SG_GraniteDeck", "#161B24", metallic=0.06, roughness=0.30, coat=0.28,
        col_tex=tex["basalt_col"], rough_tex=tex["basalt_rough"], norm_tex=tex["basalt_norm"], norm_strength=0.30, uv_scale=0.8,
    )
    m["sg_cyan_bus"] = make_pbr_mat(
        "Mat_SG_TelemetryCyan", "#5CE1FF", metallic=0.2, roughness=0.15,
        emission_hex="#33D1FF", emission_strength=1.45,
    )
    m["gem_sapphire"] = make_pbr_mat(
        "Mat_Royal_Sapphire", "#0E3888", metallic=0.22, roughness=0.09, coat=0.92, coat_roughness=0.04,
        emission_hex="#1D5CE0", emission_strength=0.55,
    )
    m["gem_ruby"] = make_pbr_mat(
        "Mat_Crimson_Ruby", "#9E1128", metallic=0.20, roughness=0.09, coat=0.92, coat_roughness=0.04,
        emission_hex="#D91C38", emission_strength=0.55,
    )
    m["gem_emerald"] = make_pbr_mat(
        "Mat_Imperial_Emerald", "#0B7D48", metallic=0.20, roughness=0.09, coat=0.92, coat_roughness=0.04,
        emission_hex="#14B86B", emission_strength=0.55,
    )

    # 4. Apex Forum & Master Ledger Specific
    m["apex_spot_glow"] = make_pbr_mat(
        "Mat_Apex_SpotlightLens", "#FFF3D6", metallic=0.0, roughness=0.12,
        emission_hex="#FFE1A6", emission_strength=1.85,
    )
    m["champagne_diamond"] = make_pbr_mat(
        "Mat_Champagne_DiamondCore", "#FFF0BE", metallic=0.24, roughness=0.07, coat=0.96, coat_roughness=0.03,
        emission_hex="#FFD46E", emission_strength=1.65,
    )

    # 5. 3D Diplomatic Passport Specific
    m["passport_leather"] = make_pbr_mat(
        "Mat_Passport_Leather", "#101B33", metallic=0.04, roughness=0.38, coat=0.22, coat_roughness=0.22,
        col_tex=tex["passport_leather_col"], norm_tex=tex["leather_norm"], norm_strength=0.48, uv_scale=2.2,
    )
    m["passport_parchment"] = make_pbr_mat(
        "Mat_Passport_Parchment", "#EFE6D2", metallic=0.0, roughness=0.62,
        col_tex=tex["parchment_col"], norm_tex=tex["leather_norm"], norm_strength=0.08, uv_scale=1.5,
    )
    m["passport_ribbon"] = make_pbr_mat(
        "Mat_Passport_SilkRibbon", "#8F1626", metallic=0.12, roughness=0.32, coat=0.30,
    )

    return m


# ---------------------------------------------------------------------------
# Hard-Surface & Architectural BMesh Craft Utilities
# ---------------------------------------------------------------------------
def apply_metric_box_uv(bm, scale: float = 0.5):
    uv_layer = bm.loops.layers.uv.verify()
    bm.faces.ensure_lookup_table()
    for f in bm.faces:
        n = f.normal
        ax, ay, az = abs(n.x), abs(n.y), abs(n.z)
        for loop in f.loops:
            co = loop.vert.co
            if az >= ax and az >= ay:
                u, v = co.x * scale, co.y * scale
            elif ax >= ay and ax >= az:
                u, v = co.y * scale, co.z * scale
            else:
                u, v = co.x * scale, co.z * scale
            loop[uv_layer].uv = (u, v)


def make_collection(name: str, parent_col=None):
    col = bpy.data.collections.new(name)
    (parent_col or bpy.context.scene.collection).children.link(col)
    return col


def make_empty(name: str, col, parent=None, location=(0.0, 0.0, 0.0), rotation=(0.0, 0.0, 0.0)):
    e = bpy.data.objects.new(name, None)
    e.empty_display_type = "PLAIN_AXES"
    e.empty_display_size = 0.28
    e.location = location
    e.rotation_euler = rotation
    col.objects.link(e)
    if parent is not None:
        e.parent = parent
    return e


def finalize_obj(
    name: str,
    bm: bmesh.types.BMesh,
    mat,
    col,
    parent=None,
    location=(0.0, 0.0, 0.0),
    rotation=(0.0, 0.0, 0.0),
    smooth: bool = True,
    split_angle_deg: float = 40.0,
    uv_scale: float = 0.5,
    cast_shadow: bool = True,
):
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    apply_metric_box_uv(bm, scale=uv_scale)

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()

    if len(mesh.polygons) > 0:
        mesh.polygons.foreach_set("use_smooth", [smooth] * len(mesh.polygons))

    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    obj.location = location
    obj.rotation_euler = rotation
    obj.visible_shadow = cast_shadow
    col.objects.link(obj)
    if parent is not None:
        obj.parent = parent

    if smooth and split_angle_deg < 179.0:
        es = obj.modifiers.new("EdgeSplit", "EDGE_SPLIT")
        es.split_angle = math.radians(split_angle_deg)
        es.use_edge_angle = True

    return obj


def bm_merge(dst: bmesh.types.BMesh, src: bmesh.types.BMesh, matrix: Matrix = None):
    if matrix is not None:
        bmesh.ops.transform(src, matrix=matrix, verts=list(src.verts))
    vmap = {v: dst.verts.new(v.co) for v in src.verts}
    for f in src.faces:
        try:
            dst.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    src.free()


def bm_add_box(bm, sx: float, sy: float, sz: float, matrix: Matrix = None, bevel: float = 0.0, segs: int = 1):
    tmp = bmesh.new()
    bmesh.ops.create_cube(tmp, size=1.0)
    bmesh.ops.scale(tmp, vec=(sx, sy, sz), verts=list(tmp.verts))
    if bevel > 0.0:
        bmesh.ops.bevel(
            tmp,
            geom=list(tmp.edges),
            offset=min(bevel, sx * 0.38, sy * 0.38, sz * 0.38),
            segments=segs,
            affect="EDGES",
            clamp_overlap=True,
        )
    bm_merge(bm, tmp, matrix)


def bm_add_cyl(bm, r_bot: float, r_top: float, height: float, segs: int = 24, matrix: Matrix = None, bevel: float = 0.0):
    tmp = bmesh.new()
    bmesh.ops.create_cone(tmp, cap_ends=True, cap_tris=False, segments=segs, radius1=r_bot, radius2=r_top, depth=height)
    if bevel > 0.0:
        sharp = [e for e in tmp.edges if e.calc_face_angle(0.0) > math.radians(40.0)]
        if sharp:
            bmesh.ops.bevel(tmp, geom=sharp, offset=min(bevel, r_bot * 0.28, r_top * 0.28, height * 0.28), segments=1, affect="EDGES", clamp_overlap=True)
    bm_merge(bm, tmp, matrix)


def bm_lathe_new(profile_rz, segs: int = 40, closed_profile: bool = True):
    bm = bmesh.new()
    n = len(profile_rz)
    rings = []
    for i in range(segs):
        a = (2.0 * math.pi * i) / segs
        ca, sa = math.cos(a), math.sin(a)
        rings.append([bm.verts.new((max(r, 1e-4) * ca, max(r, 1e-4) * sa, z)) for (r, z) in profile_rz])
    p_cnt = n if closed_profile else n - 1
    for i in range(segs):
        r0, r1 = rings[i], rings[(i + 1) % segs]
        for j in range(p_cnt):
            nj = (j + 1) % n
            try:
                bm.faces.new((r0[j], r1[j], r1[nj], r0[nj]))
            except ValueError:
                pass
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    return bm


def bm_add_lathe(bm, profile_rz, segs: int = 40, closed_profile: bool = True, matrix: Matrix = None):
    bm_merge(bm, bm_lathe_new(profile_rz, segs=segs, closed_profile=closed_profile), matrix)


def chamfer_ring_profile(r_in: float, r_out: float, z_bot: float, z_top: float, ch: float = 0.008):
    c = min(ch, (r_out - r_in) * 0.35, (z_top - z_bot) * 0.35)
    return [
        (r_in + c, z_bot), (r_out - c, z_bot), (r_out, z_bot + c), (r_out, z_top - c),
        (r_out - c, z_top), (r_in + c, z_top), (r_in, z_top - c), (r_in, z_bot + c),
    ]


def bm_add_sector(bm, r_in: float, r_out: float, z0: float, z1: float, a0: float, a1: float, segs: int = 10, bevel: float = 0.0, matrix: Matrix = None):
    tmp = bmesh.new()
    bi, bo, ti, to = [], [], [], []
    for i in range(segs + 1):
        a = a0 + (a1 - a0) * (i / segs)
        ca, sa = math.cos(a), math.sin(a)
        bi.append(tmp.verts.new((r_in * ca, r_in * sa, z0)))
        bo.append(tmp.verts.new((r_out * ca, r_out * sa, z0)))
        ti.append(tmp.verts.new((r_in * ca, r_in * sa, z1)))
        to.append(tmp.verts.new((r_out * ca, r_out * sa, z1)))
    for i in range(segs):
        tmp.faces.new((bi[i], bo[i], bo[i + 1], bi[i + 1]))
        tmp.faces.new((ti[i], ti[i + 1], to[i + 1], to[i]))
        tmp.faces.new((bo[i], to[i], to[i + 1], bo[i + 1]))
        tmp.faces.new((bi[i], bi[i + 1], ti[i + 1], ti[i]))
    tmp.faces.new((bi[0], ti[0], to[0], bo[0]))
    tmp.faces.new((bi[-1], bo[-1], to[-1], ti[-1]))
    bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
    if bevel > 0.0:
        sharp = [e for e in tmp.edges if e.calc_face_angle(0.0) > math.radians(38.0)]
        if sharp:
            bmesh.ops.bevel(tmp, geom=sharp, offset=min(bevel, abs(z1 - z0) * 0.25, (r_out - r_in) * 0.22), segments=1, affect="EDGES", clamp_overlap=True)
    bm_merge(bm, tmp, matrix)


def bm_sweep_tube(bm, points, profile_xy, closed: bool = False, cap_ends: bool = True, scales=None, matrix: Matrix = None):
    pts = [Vector(p) for p in points]
    n = len(pts)
    if n < 2:
        return
    tangents = []
    for i in range(n):
        if closed:
            t = pts[(i + 1) % n] - pts[(i - 1) % n]
        elif i == 0:
            t = pts[1] - pts[0]
        elif i == n - 1:
            t = pts[-1] - pts[-2]
        else:
            t = pts[i + 1] - pts[i - 1]
        tangents.append(t.normalized() if t.length > 1e-7 else Vector((0, 0, 1)))

    up = Vector((0, 0, 1)) if abs(tangents[0].z) < 0.92 else Vector((1, 0, 0))
    norm = tangents[0].cross(up).normalized()
    binorm = tangents[0].cross(norm).normalized()
    frames = [(norm, binorm)]
    for i in range(1, n):
        tp, tc = tangents[i - 1], tangents[i]
        axis = tp.cross(tc)
        if axis.length > 1e-6:
            ang = math.acos(max(-1.0, min(1.0, tp.dot(tc))))
            norm = (Matrix.Rotation(ang, 3, axis.normalized()) @ norm).normalized()
        norm = (norm - tc * norm.dot(tc)).normalized()
        binorm = tc.cross(norm).normalized()
        frames.append((norm, binorm))

    tmp = bmesh.new()
    rings = []
    for i in range(n):
        p = pts[i]
        nv, bv = frames[i]
        sc = scales[i] if scales is not None else 1.0
        sx, sy = sc if isinstance(sc, (tuple, list)) else (sc, sc)
        rings.append([tmp.verts.new(p + nv * (px * sx) + bv * (py * sy)) for (px, py) in profile_xy])

    m = len(profile_xy)
    for i in range(n if closed else n - 1):
        r0, r1 = rings[i], rings[(i + 1) % n]
        for j in range(m):
            nj = (j + 1) % m
            try:
                tmp.faces.new((r0[j], r1[j], r1[nj], r0[nj]))
            except ValueError:
                pass
    if cap_ends and not closed:
        try:
            tmp.faces.new(list(reversed(rings[0])))
            tmp.faces.new(rings[-1])
        except ValueError:
            pass
    bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
    bm_merge(bm, tmp, matrix)


def circle_profile(rx: float, ry: float = None, segs: int = 8):
    ry = rx if ry is None else ry
    return [(rx * math.cos(2.0 * math.pi * i / segs), ry * math.sin(2.0 * math.pi * i / segs)) for i in range(segs)]


def chamfer_rect_2d(hx: float, hy: float, ch: float = 0.008):
    c = min(ch, hx * 0.4, hy * 0.4)
    return [
        (-hx + c, -hy), (hx - c, -hy), (hx, -hy + c), (hx, hy - c),
        (hx - c, hy), (-hx + c, hy), (-hx, hy - c), (-hx, -hy + c),
    ]


def stadium_outline_2d(half_len_x: float, half_wid_y: float, arc_segs: int = 12):
    r = half_wid_y
    cx = max(0.0, half_len_x - r)
    pts = []
    for i in range(arc_segs + 1):
        a = -math.pi * 0.5 + math.pi * (i / arc_segs)
        pts.append((cx + r * math.cos(a), r * math.sin(a)))
    for i in range(arc_segs + 1):
        a = math.pi * 0.5 + math.pi * (i / arc_segs)
        pts.append((-cx + r * math.cos(a), r * math.sin(a)))
    return pts


def add_quad_beveled_slab(bm_dst, pts_fn, hx: float, hy: float, z0: float, z1: float, bxy: float = 0.015, bz: float = 0.012):
    """Creates an artifact-free quad-beveled horizontal tabletop slab (zero N-gon overlap!)."""
    pts_in = pts_fn(hx - bxy, hy - bxy)
    pts_out = pts_fn(hx, hy)
    tmp = bmesh.new()
    r0 = [tmp.verts.new((x, y, z0)) for (x, y) in pts_in]
    r1 = [tmp.verts.new((x, y, z0 + bz)) for (x, y) in pts_out]
    r2 = [tmp.verts.new((x, y, z1 - bz)) for (x, y) in pts_out]
    r3 = [tmp.verts.new((x, y, z1)) for (x, y) in pts_in]
    n = len(pts_out)
    for i in range(n):
        ni = (i + 1) % n
        tmp.faces.new((r0[i], r0[ni], r1[ni], r1[i]))
        tmp.faces.new((r1[i], r1[ni], r2[ni], r2[i]))
        tmp.faces.new((r2[i], r2[ni], r3[ni], r3[i]))
    vc_b = tmp.verts.new((0.0, 0.0, z0))
    vc_t = tmp.verts.new((0.0, 0.0, z1))
    for i in range(n):
        ni = (i + 1) % n
        tmp.faces.new((vc_b, r0[ni], r0[i]))
        tmp.faces.new((vc_t, r3[i], r3[ni]))
    bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
    bm_merge(bm_dst, tmp)


def bm_faceted_gem(bm_dst, radius: float, height: float, sides: int = 8, matrix: Matrix = None, bevel: float = 0.004):
    """Precision brilliant-cut gemstone bipyramid."""
    tmp = bmesh.new()
    hz = height * 0.5
    gz = hz * 0.22
    cz = hz * 0.58
    rc = radius * 0.72
    vt = tmp.verts.new((0, 0, hz))
    vb = tmp.verts.new((0, 0, -hz))
    cu, gu, gl, cl = [], [], [], []
    for i in range(sides):
        a = (2.0 * math.pi * i) / sides
        ah = a + math.pi / sides
        cu.append(tmp.verts.new((rc * math.cos(ah), rc * math.sin(ah), cz)))
        gu.append(tmp.verts.new((radius * math.cos(a), radius * math.sin(a), gz)))
        gl.append(tmp.verts.new((radius * math.cos(a), radius * math.sin(a), -gz)))
        cl.append(tmp.verts.new((rc * math.cos(ah), rc * math.sin(ah), -cz)))
    for i in range(sides):
        ni = (i + 1) % sides
        tmp.faces.new((vt, cu[i], cu[ni]))
        tmp.faces.new((cu[i], gu[i], gu[ni]))
        tmp.faces.new((cu[i], gu[ni], cu[ni]))
        tmp.faces.new((gu[i], gl[i], gl[ni], gu[ni]))
        tmp.faces.new((gl[i], cl[i], gl[ni]))
        tmp.faces.new((cl[i], cl[ni], gl[ni]))
        tmp.faces.new((vb, cl[ni], cl[i]))
    bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
    if bevel > 0.0:
        bmesh.ops.bevel(tmp, geom=list(tmp.edges), offset=bevel, segments=1, affect="EDGES", clamp_overlap=True)
    bm_merge(bm_dst, tmp, matrix)


# ===========================================================================
# VENUE 1: RIO DE JANEIRO — BOTANICAL GLASS CANOPY (rio_canopy_room.glb, <=45k tris)
# ===========================================================================
def build_rio_canopy_room(mats):
    col = make_collection("Venue_Rio_Canopy")
    root = make_empty("Rio_Canopy_Root", col)

    R_PAV = 7.40
    N_RIBS = 10
    RIB_OFF = math.pi / N_RIBS  # Centers +Y sightline cleanly between twin soaring conservatory arches!

    # --- A. Brazilian Dark Teak Deck + Emerald-Marble & Cream-Limestone Star Medallion Floor ---
    bm_teak = bmesh.new()
    bm_em_fl = bmesh.new()
    bm_cr_fl = bmesh.new()
    bm_br_fl = bmesh.new()

    bm_add_lathe(bm_teak, [(0.001, -0.24), (R_PAV + 0.45, -0.24), (R_PAV + 0.45, 0.0), (0.001, 0.0)], segs=48)
    # Recessed Emerald Marble & Cream Limestone Botanical Compass Medallion (flush Z = 0.003m)
    bm_add_lathe(bm_em_fl, chamfer_ring_profile(0.01, 2.95, -0.008, 0.0028, 0.002), segs=48)
    bm_add_lathe(bm_cr_fl, chamfer_ring_profile(2.96, 3.38, -0.008, 0.0030, 0.002), segs=48)
    for i in range(10):
        a = i * (2.0 * math.pi / 10.0)
        bm_add_sector(bm_cr_fl, 1.85, 2.88, -0.005, 0.0035, a - 0.11, a + 0.11, segs=4)
    for rr in (1.82, 2.955, 3.39, 5.45):
        bm_add_lathe(bm_br_fl, chamfer_ring_profile(rr - 0.022, rr + 0.022, -0.004, 0.0042, 0.002), segs=48)

    finalize_obj("Rio_Floor_TeakDeck", bm_teak, mats["rio_teak"], col, parent=root, uv_scale=0.55)
    finalize_obj("Rio_Floor_EmeraldMosaic", bm_em_fl, mats["rio_emerald_stone"], col, parent=root, uv_scale=0.6)
    finalize_obj("Rio_Floor_CreamLimestone", bm_cr_fl, mats["cream_limestone"], col, parent=root, uv_scale=0.6)
    finalize_obj("Rio_Floor_BrassInlay", bm_br_fl, mats["brass_antique"], col, parent=root, uv_scale=1.2)

    # --- B. Vaulted Wrought-Iron & Burnished-Brass Botanical Conservatory Ribs + Scroll Filigree ---
    bm_iron = bmesh.new()
    bm_brass = bmesh.new()
    bm_stone_wall = bmesh.new()
    bm_foliage = bmesh.new()
    bm_glass = bmesh.new()

    # Low sculpted cream-limestone botanical planter balustrade around perimeter (Z = 0..0.92m, r = 6.85..7.55m)
    bm_add_lathe(bm_stone_wall, chamfer_ring_profile(6.85, 7.65, 0.0, 0.88, 0.03), segs=40)
    bm_add_lathe(bm_brass, chamfer_ring_profile(6.82, 6.96, 0.86, 0.94, 0.01), segs=40)

    # Sculpted arched Tropical Palm Fronds with fanned diamond leaflets rising from perimeter planters!
    stem_prof = circle_profile(0.022, 0.022, segs=5)
    for b_i in range(N_RIBS):
        ba = b_i * (2.0 * math.pi / N_RIBS)
        is_hero_vista = (math.sin(ba) > 0.65)
        if is_hero_vista:
            continue  # Keep central +Y panoramic Rio bay vista crystal-clear and unobstructed!
        for fi in (-1, 0, 1):
            fa = ba + fi * 0.11
            ca, sa = math.cos(fa), math.sin(fa)
            tx, ty = -sa, ca
            h_arch = 2.15 + abs(fi) * 0.25
            pts_stem = [
                (7.18 * ca, 7.18 * sa, 0.88),
                (6.95 * ca, 6.95 * sa, 0.88 + h_arch * 0.52),
                (6.55 * ca, 6.55 * sa, 0.88 + h_arch * 0.88),
                (6.12 * ca, 6.12 * sa, 0.88 + h_arch * 0.96),
            ]
            bm_sweep_tube(bm_foliage, pts_stem, stem_prof, closed=False, cap_ends=True, scales=[1.1, 0.9, 0.7, 0.45])
            # 6 paired fanned palm leaflets along upper arch of each frond!
            for lf in range(1, 7):
                u = lf / 6.5
                rr = 7.05 - u * 0.88
                zz = 0.88 + h_arch * (0.35 + 0.60 * math.sin(u * math.pi * 0.55))
                l_len = 0.42 * math.sin(u * math.pi * 0.85) + 0.14
                for sgn in (-1, 1):
                    px = rr * ca + sgn * tx * (l_len * 0.48)
                    py = rr * sa + sgn * ty * (l_len * 0.48)
                    m_lf = (
                        Matrix.Translation((px, py, zz - 0.04))
                        @ Matrix.Rotation(fa + sgn * 1.15, 4, "Z")
                        @ Matrix.Rotation(math.radians(22), 4, "Y")
                    )
                    bm_add_box(bm_foliage, l_len, 0.065, 0.012, matrix=m_lf, bevel=0.003)

    # 10 Soaring Parabolic Cast-Iron Conservatory Vault Arches + Scrolled Spandrel Filigree
    rib_prof = chamfer_rect_2d(0.11, 0.16, 0.024)
    scroll_prof = circle_profile(0.024, 0.024, segs=6)
    R_CUPOLA = 1.55
    Z_CUPOLA = 7.55

    def rio_rib_rz(t):
        # Vertical column shaft t=0..0.35 (Z=0..3.4), then sweeping botanical vault arch to cupola!
        if t <= 0.35:
            u = t / 0.35
            return 6.82, 0.88 + u * 2.72
        u = (t - 0.35) / 0.65
        r = R_CUPOLA + (6.82 - R_CUPOLA) * math.cos(u * math.pi * 0.5)
        z = 3.60 + (Z_CUPOLA - 3.60) * math.sin(u * math.pi * 0.5) ** 0.82
        return r, z

    rib_angles = [RIB_OFF + i * (2.0 * math.pi / N_RIBS) for i in range(N_RIBS)]
    for ra in rib_angles:
        ca, sa = math.cos(ra), math.sin(ra)
        m_r = Matrix.Rotation(ra, 4, "Z")
        # Cast-iron column pedestal & brass collars
        bm_add_box(bm_brass, 0.42, 0.42, 0.16, matrix=m_r @ Matrix.Translation((6.82, 0.0, 0.96)), bevel=0.015)
        bm_add_cyl(bm_brass, 0.19, 0.16, 0.14, segs=12, matrix=m_r @ Matrix.Translation((6.82, 0.0, 3.58)), bevel=0.01)
        pts_rib = [(* (lambda rr, zz: (rr * ca, rr * sa, zz))(*rio_rib_rz(k / 14.0)),) for k in range(15)]
        bm_sweep_tube(bm_iron, pts_rib, rib_prof, closed=False, cap_ends=True)
        # Gilded brass spine strip inlaid along the inner face of every wrought-iron vault rib!
        pts_gold_in = [((r - 0.085) * ca, (r - 0.085) * sa, z - 0.03) for (r, z) in (rio_rib_rz(k / 12.0) for k in range(13))]
        bm_sweep_tube(bm_brass, pts_gold_in, chamfer_rect_2d(0.025, 0.028, 0.005), closed=False, cap_ends=True)

        # Victorian Botanical Scroll Bracket tucked inside the arch haunch (Z=2.8..4.5m)
        pts_sc = [(6.72, 0.0, 2.85), (6.35, 0.0, 3.25), (6.05, 0.0, 3.85), (5.65, 0.0, 4.45)]
        bm_sweep_tube(bm_brass, pts_sc, scroll_prof, closed=False, cap_ends=True, matrix=m_r)

    # 5 Horizontal Wrought-Iron Purlin Rings + Open Brass Cupola Crown
    for u_p in (0.35, 0.52, 0.68, 0.84, 1.0):
        rp, zp = rio_rib_rz(u_p)
        bm_add_lathe(bm_iron, chamfer_ring_profile(rp - 0.06, rp + 0.09, zp - 0.06, zp + 0.06, 0.012), segs=40)
    bm_add_lathe(bm_brass, chamfer_ring_profile(R_CUPOLA - 0.10, R_CUPOLA + 0.16, Z_CUPOLA - 0.12, Z_CUPOLA + 0.32, 0.02), segs=40)

    # Curved Conservatory Glass Shell (`Rio_Window_Glass` — upgraded to crisp AR glass by VenueArenaLoader!)
    gl_prof = [rio_rib_rz(k / 10.0) for k in range(11)]
    gl_shell = [(r + 0.10, z) for (r, z) in gl_prof] + [(r + 0.13, z + 0.02) for (r, z) in reversed(gl_prof)]
    bm_add_lathe(bm_glass, gl_shell, segs=30, closed_profile=True)

    finalize_obj("Rio_Planter_Limestone", bm_stone_wall, mats["cream_limestone"], col, parent=root, uv_scale=0.5)
    finalize_obj("Rio_Conservatory_IronRibs", bm_iron, mats["rio_iron"], col, parent=root, uv_scale=0.8)
    finalize_obj("Rio_Conservatory_BrassTrim", bm_brass, mats["brass_antique"], col, parent=root, uv_scale=1.2)
    finalize_obj("Rio_Botanical_Foliage", bm_foliage, mats["rio_foliage"], col, parent=root, uv_scale=1.0)
    finalize_obj("Rio_Window_Glass", bm_glass, mats["window_glass"], col, parent=root, uv_scale=0.5, cast_shadow=False)

    # --- C. Warm Hanging Brass & Amber-Glass Twilight Lanterns (Animatable Node!) ---
    lantern_root = make_empty("Rio_Hanging_Lanterns", col, parent=root, location=(0.0, 0.0, 4.35))
    bm_lan_br = bmesh.new()
    bm_lan_gl = bmesh.new()
    for li, ra in enumerate(rib_angles):
        ca, sa = math.cos(ra), math.sin(ra)
        rl = 4.45
        zl = -0.35 + (li % 2) * 0.32
        m_l = Matrix.Translation((rl * ca, rl * sa, zl))
        # Suspension rod up to vault rib (Z ~ 5.85 -> local +1.50)
        bm_add_cyl(bm_lan_br, 0.012, 0.012, 1.65, segs=6, matrix=m_l @ Matrix.Translation((0, 0, 0.98)))
        # Sculpted hexagonal brass botanical lantern cap & finial base
        bm_add_cyl(bm_lan_br, 0.22, 0.06, 0.18, segs=6, matrix=m_l @ Matrix.Translation((0, 0, 0.22)), bevel=0.01)
        bm_add_cyl(bm_lan_br, 0.06, 0.18, 0.14, segs=6, matrix=m_l @ Matrix.Translation((0, 0, -0.20)), bevel=0.01)
        bm_add_cyl(bm_lan_gl, 0.145, 0.165, 0.30, segs=8, matrix=m_l @ Matrix.Translation((0, 0, 0.02)))

    finalize_obj("Rio_Lanterns_Brass", bm_lan_br, mats["brass_antique"], col, parent=lantern_root, uv_scale=1.5)
    finalize_obj("Rio_Lanterns_AmberGlow", bm_lan_gl, mats["rio_lantern_glow"], col, parent=lantern_root, uv_scale=1.0, cast_shadow=False)

    # --- D. Hero Niemeyer-Inspired Curved Teak, Emerald-Marble & Brass Stage Table (Top flush Z = 0.780m!) ---
    tbl_root = make_empty("Rio_Hero_Table", col, parent=root)
    bm_tt = bmesh.new()
    bm_tm = bmesh.new()
    bm_tb = bmesh.new()

    # Sweeping Niemeyer parabolic curved twin teak-and-brass cradle arches (strictly below Z=0.720m!)
    arch_p = chamfer_rect_2d(0.055, 0.085, 0.014)
    for sy in (-0.34, 0.34):
        pts_a = [
            (-0.92, sy, 0.030), (-0.68, sy, 0.36), (-0.34, sy, 0.58),
            (0.0, sy, 0.62), (0.34, sy, 0.58), (0.68, sy, 0.36), (0.92, sy, 0.030),
        ]
        bm_sweep_tube(bm_tt, pts_a, arch_p, closed=False, cap_ends=True)
        for sx in (-0.92, 0.92):
            bm_add_box(bm_tb, 0.16, 0.24, 0.036, matrix=Matrix.Translation((sx, sy, 0.018)), bevel=0.008)
    bm_add_box(bm_tb, 1.68, 0.76, 0.032, matrix=Matrix.Translation((0, 0, 0.706)), bevel=0.006)
    # Quad-beveled Emerald-Veined Dark Marble Tabletop (2.40m x 1.25m, TOP STRICTLY FLUSH Z = 0.780m!)
    add_quad_beveled_slab(bm_tm, lambda hx, hy: stadium_outline_2d(hx, hy, 14), 1.20, 0.625, 0.724, 0.780, bxy=0.016, bz=0.012)
    add_quad_beveled_slab(bm_tb, lambda hx, hy: stadium_outline_2d(hx, hy, 12), 1.204, 0.628, 0.746, 0.754, bxy=0.003, bz=0.002)

    finalize_obj("Rio_Table_TeakArches", bm_tt, mats["rio_teak"], col, parent=tbl_root, uv_scale=0.9)
    finalize_obj("Rio_Table_EmeraldMarble", bm_tm, mats["rio_emerald_stone"], col, parent=tbl_root, uv_scale=0.8)
    finalize_obj("Rio_Table_BrassTrim", bm_tb, mats["gold_24k"], col, parent=tbl_root, uv_scale=1.5)

    return col, root


# ===========================================================================
# VENUE 2: REYKJAVIK — GEOTHERMAL BASALT CALDERA (reykjavik_caldera_room.glb, <=45k tris)
# ===========================================================================
def build_reykjavik_caldera_room(mats):
    col = make_collection("Venue_Reykjavik_Caldera")
    root = make_empty("Reykjavik_Caldera_Root", col)

    # --- A. Honed Volcanic Basalt Floor + Recessed Geothermal Channels under Flush Brass Bridge Grates ---
    bm_fl = bmesh.new()
    bm_geo = bmesh.new()
    bm_grate = bmesh.new()

    bm_add_lathe(bm_fl, [(0.001, -0.28), (8.20, -0.28), (8.20, 0.0), (0.001, 0.0)], segs=42)
    # Recessed glowing geothermal mineral channel ring at r = 3.55..3.95m (tucked safely beneath flush brass grates!)
    bm_add_lathe(bm_geo, chamfer_ring_profile(3.58, 3.92, -0.06, -0.022, 0.004), segs=42)
    # Flush brushed-titanium & brass architectural bridge grates spanning the geothermal fissure at Z = 0.002m
    bm_add_lathe(bm_grate, chamfer_ring_profile(3.52, 3.59, -0.01, 0.004, 0.002), segs=42)
    bm_add_lathe(bm_grate, chamfer_ring_profile(3.91, 3.98, -0.01, 0.004, 0.002), segs=42)
    for k in range(48):
        ka = (2.0 * math.pi * k) / 48.0
        bm_add_box(bm_grate, 0.36, 0.045, 0.008, matrix=Matrix.Rotation(ka, 4, "Z") @ Matrix.Translation((3.75, 0.0, 0.001)))

    finalize_obj("Reykjavik_Floor_Basalt", bm_fl, mats["reyk_basalt"], col, parent=root, uv_scale=0.45)
    finalize_obj("Reykjavik_Geothermal_Vents", bm_geo, mats["reyk_magma_ember"], col, parent=root, uv_scale=0.8, cast_shadow=False)
    finalize_obj("Reykjavik_Floor_Grates", bm_grate, mats["titanium"], col, parent=root, uv_scale=1.2)

    # --- B. Sculpted Stepped Hexagonal Columnar Basalt Cliffs (Svartifoss Organ-Pipe Formations!) ---
    bm_basalt = bmesh.new()
    bm_tit = bmesh.new()
    bm_glass = bmesh.new()

    rng = np.random.default_rng(20260805)
    # Place 84 stepped 6-sided hexagonal basalt columns in 2 concentric geological rings around r = 6.3..7.9m!
    # Leave a dramatic framed volcanic portal arch open toward +Y (Three.js -Z Aurora vista!)
    for ring_idx, r_base in enumerate((6.45, 7.25)):
        n_c = 38 if ring_idx == 0 else 46
        for i in range(n_c):
            a = (2.0 * math.pi * i) / n_c + ring_idx * 0.08
            # Carve a grand framed aurora sightline window across +Y (angles ~ 52..128 deg)
            in_vista = (math.sin(a) > 0.76 and abs(math.cos(a)) < 0.65)
            if in_vista and ring_idx == 0:
                # Low stepped basalt sill so the Northern Lights horizon shines unobstructed!
                h = 0.72 + 0.32 * abs(math.cos(a * 3.0))
            elif in_vista and ring_idx == 1:
                h = 1.25 + 0.55 * (abs(math.cos(a)) / 0.65) ** 1.5
            else:
                wave = 0.5 + 0.5 * math.cos(a * 4.0 - 0.6)
                h = (2.2 + 2.5 * wave + rng.uniform(-0.45, 0.55)) if ring_idx == 0 else (3.6 + 2.2 * wave + rng.uniform(-0.35, 0.45))

            rad_hex = 0.42 if ring_idx == 0 else 0.48
            rr = r_base + rng.uniform(-0.18, 0.18)
            cx, cy = rr * math.cos(a), rr * math.sin(a)
            m_hex = Matrix.Translation((cx, cy, h * 0.5 - 0.05)) @ Matrix.Rotation(a + math.pi / 6.0, 4, "Z")
            bm_add_cyl(bm_basalt, rad_hex, rad_hex * 0.97, h + 0.10, segs=6, matrix=m_hex, bevel=0.028)

    # --- C. Geodesic Brushed-Titanium & Brass Aurora Glass Dome (Z = 4.65..7.65m) ---
    R_DOME = 7.55
    Z_SP = 4.55
    Z_TOP = 7.58
    N_ARC = 12
    strut_prof = chamfer_rect_2d(0.085, 0.12, 0.018)
    for k in range(N_ARC):
        ka = (2.0 * math.pi * k) / N_ARC
        ca, sa = math.cos(ka), math.sin(ka)
        pts_d = []
        for s in range(9):
            u = s / 8.0
            rd = 1.15 + (R_DOME - 1.15) * math.cos(u * math.pi * 0.5)
            zd = Z_SP + (Z_TOP - Z_SP) * math.sin(u * math.pi * 0.5)
            pts_d.append((rd * ca, rd * sa, zd))
        bm_sweep_tube(bm_tit, pts_d, strut_prof, closed=False, cap_ends=True)

    for u_r in (0.0, 0.34, 0.68, 1.0):
        rd = 1.15 + (R_DOME - 1.15) * math.cos(u_r * math.pi * 0.5)
        zd = Z_SP + (Z_TOP - Z_SP) * math.sin(u_r * math.pi * 0.5)
        bm_add_lathe(bm_tit, chamfer_ring_profile(rd - 0.08, rd + 0.10, zd - 0.07, zd + 0.07, 0.015), segs=36)

    # Clear panoramic Aurora dome & vista glazing (`Reykjavik_Window_Glass`)
    gl_pts = [(1.15 + (R_DOME - 1.15) * math.cos(u * math.pi * 0.5), Z_SP + (Z_TOP - Z_SP) * math.sin(u * math.pi * 0.5)) for u in np.linspace(0, 1, 8)]
    # Extend vertical glass curtain down in the +Y aurora bay too
    gl_full = [(R_DOME + 0.08, 0.85)] + [(r + 0.08, z) for (r, z) in gl_pts]
    gl_shell = gl_full + [(r + 0.03, z + 0.02) for (r, z) in reversed(gl_full)]
    bm_add_lathe(bm_glass, gl_shell, segs=30, closed_profile=True)

    finalize_obj("Reykjavik_Basalt_Columns", bm_basalt, mats["reyk_basalt"], col, parent=root, uv_scale=0.45)
    finalize_obj("Reykjavik_Dome_Titanium", bm_tit, mats["titanium"], col, parent=root, uv_scale=0.8)
    finalize_obj("Reykjavik_Window_Glass", bm_glass, mats["window_glass"], col, parent=root, uv_scale=0.5, cast_shadow=False)

    # --- D. Suspended Kinetic Cryo-Quartz & Brass Aurora Ring (`Reykjavik_Aurora_Ring`) ---
    aur_pivot = make_empty("Reykjavik_Aurora_Ring", col, parent=root, location=(0.0, 0.0, 5.05))
    bm_ar_br = bmesh.new()
    bm_ar_cr = bmesh.new()
    bm_add_lathe(bm_ar_br, chamfer_ring_profile(1.68, 1.84, -0.05, 0.05, 0.012), segs=48)
    bm_add_lathe(bm_ar_br, chamfer_ring_profile(1.12, 1.24, -0.04, 0.04, 0.010), segs=40, matrix=Matrix.Rotation(math.radians(18), 4, "X"))
    for k in range(12):
        ka = (2.0 * math.pi * k) / 12.0
        m_c = Matrix.Rotation(ka, 4, "Z") @ Matrix.Translation((1.76, 0.0, 0.0))
        bm_add_cyl(bm_ar_cr, 0.055, 0.025, 0.34, segs=6, matrix=m_c, bevel=0.008)
    finalize_obj("Aurora_Ring_Brass", bm_ar_br, mats["brass_antique"], col, parent=aur_pivot, uv_scale=1.5)
    finalize_obj("Aurora_Ring_CryoPrisms", bm_ar_cr, mats["reyk_cryo_crystal"], col, parent=aur_pivot, uv_scale=1.2, cast_shadow=False)

    # --- E. Hero Clustered Hexagonal-Basalt, Titanium & Cryo-Quartz Caldera Table (Top flush Z = 0.780m!) ---
    tbl_root = make_empty("Reykjavik_Hero_Table", col, parent=root)
    bm_tba = bmesh.new()
    bm_tob = bmesh.new()
    bm_tbr = bmesh.new()
    bm_tcr = bmesh.new()

    for sx in (-0.72, 0.72):
        for (dx, dy, hh, rr) in [(0.0, 0.0, 0.70, 0.22), (-0.18, 0.22, 0.62, 0.14), (0.18, -0.22, 0.66, 0.15), (-0.16, -0.20, 0.56, 0.13), (0.16, 0.20, 0.58, 0.13)]:
            bm_add_cyl(bm_tba, rr, rr * 0.96, hh, segs=6, matrix=Matrix.Translation((sx + dx, dy, hh * 0.5)), bevel=0.012)
        bm_add_box(bm_tbr, 0.56, 0.68, 0.036, matrix=Matrix.Translation((sx, 0.0, 0.36)), bevel=0.006)
    bm_add_box(bm_tbr, 1.48, 0.16, 0.065, matrix=Matrix.Translation((0.0, 0.0, 0.36)), bevel=0.01)

    def hex_table_pts(hx, hy):
        ch = 0.26
        return [(-hx + ch, -hy), (hx - ch, -hy), (hx, 0.0), (hx - ch, hy), (-hx + ch, hy), (-hx, 0.0)]

    add_quad_beveled_slab(bm_tob, hex_table_pts, 1.20, 0.625, 0.718, 0.780, bxy=0.016, bz=0.012)
    add_quad_beveled_slab(bm_tbr, hex_table_pts, 1.204, 0.628, 0.742, 0.750, bxy=0.003, bz=0.002)
    # Flush glowing cryo-quartz hairline inlay along center meridian of table
    bm_add_box(bm_tcr, 1.65, 0.022, 0.004, matrix=Matrix.Translation((0.0, 0.0, 0.7795)))

    finalize_obj("Reykjavik_Table_Basalt", bm_tba, mats["reyk_basalt"], col, parent=tbl_root, uv_scale=0.9)
    finalize_obj("Reykjavik_Table_Obsidian", bm_tob, mats["obsidian"], col, parent=tbl_root, uv_scale=0.8)
    finalize_obj("Reykjavik_Table_Brass", bm_tbr, mats["brass_antique"], col, parent=tbl_root, uv_scale=1.5)
    finalize_obj("Reykjavik_Table_CryoInlay", bm_tcr, mats["reyk_cryo_crystal"], col, parent=tbl_root, uv_scale=1.5, cast_shadow=False)

    return col, root


# ===========================================================================
# VENUE 3: SINGAPORE — DIPLOMATIC SKY-BRIDGE & CORE (singapore_skybridge_room.glb, <=38k tris)
# ===========================================================================
def build_singapore_skybridge_room(mats):
    col = make_collection("Venue_Singapore_SkyBridge")
    root = make_empty("Singapore_SkyBridge_Root", col)

    # --- A. Suspended Granite & Brushed-Gold Central Sky-Bridge Deck + Armored Glass Side Chasm Floors ---
    bm_deck = bmesh.new()
    bm_fglass = bmesh.new()
    bm_gold = bmesh.new()
    bm_steel = bmesh.new()

    # Solid central walkway spine (X in [-3.3, +3.3], Y in [-6.5, +5.8]) + circular stage island (r = 3.85m)
    bm_add_box(bm_deck, 6.40, 12.2, 0.26, matrix=Matrix.Translation((0.0, -0.35, -0.13)), bevel=0.02)
    bm_add_lathe(bm_deck, [(0.001, -0.26), (3.95, -0.26), (3.95, 0.002), (0.001, 0.002)], segs=44)
    bm_add_lathe(bm_gold, chamfer_ring_profile(3.88, 3.96, -0.01, 0.005, 0.002), segs=44)
    bm_add_lathe(bm_gold, chamfer_ring_profile(2.45, 2.50, -0.01, 0.004, 0.002), segs=44)

    # Structural glass abyss deck wings on Left & Right (X = ±4.85m) looking straight down at glowing data monoliths!
    for sx in (-1, 1):
        bm_add_box(bm_fglass, 3.10, 11.4, 0.04, matrix=Matrix.Translation((sx * 4.75, -0.35, -0.02)))
        for by in np.linspace(-5.6, 5.0, 7):
            bm_add_box(bm_steel, 3.20, 0.12, 0.18, matrix=Matrix.Translation((sx * 4.75, by, -0.12)), bevel=0.01)
        bm_add_box(bm_steel, 0.24, 11.8, 0.34, matrix=Matrix.Translation((sx * 6.35, -0.35, -0.08)), bevel=0.015)
        # Sleek brushed-platinum & brass sky-bridge safety balustrade along outer chasm edge (X = ±6.28m)
        bm_add_box(bm_gold, 0.075, 11.4, 0.055, matrix=Matrix.Translation((sx * 6.25, -0.35, 1.02)), bevel=0.01)
        for py in np.linspace(-5.4, 4.8, 9):
            bm_add_box(bm_steel, 0.06, 0.08, 1.02, matrix=Matrix.Translation((sx * 6.25, py, 0.51)), bevel=0.008)

    finalize_obj("Singapore_Bridge_GraniteDeck", bm_deck, mats["sg_slate"], col, parent=root, uv_scale=0.5)
    finalize_obj("Singapore_Floor_Glass", bm_fglass, mats["floor_glass"], col, parent=root, uv_scale=0.5, cast_shadow=False)

    # --- B. Sweeping Diagrid Steel & Champagne-Gold Parabolic Sky-Bridge Trusses + Panoramic Window ---
    bm_wglass = bmesh.new()
    truss_prof = chamfer_rect_2d(0.11, 0.14, 0.02)
    diag_prof = chamfer_rect_2d(0.055, 0.065, 0.01)

    N_ARCH = 6
    y_arches = np.linspace(-5.4, 5.4, N_ARCH)
    arch_rings = []
    for ya in y_arches:
        pts_a = []
        for s in range(15):
            u = -1.0 + 2.0 * (s / 14.0)
            xx = u * 6.38
            zz = 5.55 * (1.0 - 0.84 * (u * u))
            pts_a.append((xx, ya, zz))
        arch_rings.append(pts_a)
        bm_sweep_tube(bm_steel, pts_a, truss_prof, closed=False, cap_ends=True)
        # Gold underside flange accent on every sky-bridge arch
        pts_g = [(x * 0.985, y, z - 0.10) for (x, y, z) in pts_a]
        bm_sweep_tube(bm_gold, pts_g, chamfer_rect_2d(0.032, 0.032, 0.006), closed=False, cap_ends=True)

    # Crisp Diagrid X-Bracing connecting adjacent parabolic sky-bridge arches overhead!
    for ai in range(N_ARCH - 1):
        r0, r1 = arch_rings[ai], arch_rings[ai + 1]
        for s in range(0, 14, 2):
            bm_sweep_tube(bm_steel, [r0[s], r1[s + 2]], diag_prof, closed=False, cap_ends=True)
            bm_sweep_tube(bm_steel, [r0[s + 2], r1[s]], diag_prof, closed=False, cap_ends=True)

    # Panoramic Curved Rain-Glass Envelope (`Singapore_Window_Glass` at Y = +5.65m + vaulted glass canopy!)
    for s in range(14):
        p00, p01 = arch_rings[0][s], arch_rings[0][s + 1]
        p10, p11 = arch_rings[-1][s], arch_rings[-1][s + 1]
        v0 = bm_wglass.verts.new((p00[0], p00[1], p00[2] + 0.08))
        v1 = bm_wglass.verts.new((p01[0], p01[1], p01[2] + 0.08))
        v2 = bm_wglass.verts.new((p11[0], p11[1], p11[2] + 0.08))
        v3 = bm_wglass.verts.new((p10[0], p10[1], p10[2] + 0.08))
        bm_wglass.faces.new((v0, v3, v2, v1))
    # End panoramic glass wall at Y = +5.55m
    bm_add_box(bm_wglass, 12.6, 0.02, 5.2, matrix=Matrix.Translation((0.0, 5.55, 2.65)))
    for mx in (-4.2, -2.1, 0.0, 2.1, 4.2):
        h_m = 5.55 * (1.0 - 0.84 * ((mx / 6.38) ** 2))
        bm_add_box(bm_steel, 0.08, 0.16, h_m, matrix=Matrix.Translation((mx, 5.52, h_m * 0.5)), bevel=0.008)

    finalize_obj("Singapore_Bridge_GoldInlay", bm_gold, mats["gold_24k"], col, parent=root, uv_scale=1.2)
    finalize_obj("Singapore_SkyBridge_Trusses", bm_steel, mats["gunmetal"], col, parent=root, uv_scale=0.6)
    finalize_obj("Singapore_Window_Glass", bm_wglass, mats["window_glass"], col, parent=root, uv_scale=0.4, cast_shadow=False)

    # --- C. Humming Quantum Ledger Data Monoliths Rising from the Chasm Below (`Singapore_Data_Monoliths`) ---
    mono_root = make_empty("Singapore_Data_Monoliths", col, parent=root)
    bm_mono = bmesh.new()
    bm_cyan = bmesh.new()
    bm_mplat = bmesh.new()

    monolith_coords = [
        (-5.1, -3.4, -6.2, -0.35, 1.15), (5.1, -3.4, -6.2, -0.35, 1.15),
        (-5.1,  0.2, -6.2, -0.35, 1.25), (5.1,  0.2, -6.2, -0.35, 1.25),
        (-5.1,  3.6, -6.2, -0.35, 1.15), (5.1,  3.6, -6.2, -0.35, 1.15),
        # Tall exterior sentinel Ledger spires flanking outside the sky-bridge chasm!
        (-8.2,  2.2, -8.0,  5.20, 1.45), (8.2,  2.2, -8.0,  5.20, 1.45),
        (-7.6,  8.5, -8.0,  6.40, 1.65), (7.6,  8.5, -8.0,  6.40, 1.65),
        (-3.6, 12.5, -9.0,  4.40, 1.50), (3.6, 12.5, -9.0,  4.40, 1.50),
    ]
    for (mx, my, zb, zt, w) in monolith_coords:
        hh = zt - zb
        zc = 0.5 * (zb + zt)
        bm_add_box(bm_mono, w, w, hh, matrix=Matrix.Translation((mx, my, zc)), bevel=0.06)
        bm_add_box(bm_mplat, w * 1.04, w * 1.04, 0.14, matrix=Matrix.Translation((mx, my, zt - 0.18)), bevel=0.02)
        # Vertical glowing cyan optical telemetry bus channels inlaid into monolith faces
        for sgn in (-1, 1):
            bm_add_box(bm_cyan, 0.035, 0.035, hh * 0.88, matrix=Matrix.Translation((mx + sgn * (w * 0.42), my - w * 0.505, zc)))
            bm_add_box(bm_cyan, 0.035, 0.035, hh * 0.88, matrix=Matrix.Translation((mx - np.sign(mx) * (w * 0.505), my + sgn * (w * 0.36), zc)))

    finalize_obj("Ledger_Monolith_Bodies", bm_mono, mats["obsidian"], col, parent=mono_root, uv_scale=0.4)
    finalize_obj("Ledger_Monolith_Collars", bm_mplat, mats["platinum"], col, parent=mono_root, uv_scale=0.8)
    finalize_obj("Ledger_Telemetry_Buses", bm_cyan, mats["sg_cyan_bus"], col, parent=mono_root, uv_scale=1.0, cast_shadow=False)

    # --- D. Suspended Kinetic Sovereign Telemetry Halo (`Singapore_Core_Ring`) ---
    ring_pivot = make_empty("Singapore_Core_Ring", col, parent=root, location=(0.0, 0.0, 4.18))
    bm_cr_pl = bmesh.new()
    bm_cr_gd = bmesh.new()
    bm_add_lathe(bm_cr_pl, chamfer_ring_profile(1.52, 1.68, -0.045, 0.045, 0.012), segs=48)
    bm_add_lathe(bm_cr_gd, chamfer_ring_profile(1.48, 1.525, -0.025, 0.025, 0.006), segs=48)
    finalize_obj("Core_Ring_Platinum", bm_cr_pl, mats["platinum"], col, parent=ring_pivot, uv_scale=1.2)
    finalize_obj("Core_Ring_Gold", bm_cr_gd, mats["gold_24k"], col, parent=ring_pivot, uv_scale=1.5)

    # --- E. Hero Cantilevered Platinum, Obsidian & 24K-Gold Console Table (Top flush Z = 0.780m!) ---
    tbl_root = make_empty("Singapore_Hero_Table", col, parent=root)
    bm_tp = bmesh.new()
    bm_to = bmesh.new()
    bm_tg = bmesh.new()

    strut_p = chamfer_rect_2d(0.042, 0.065, 0.010)
    for sx in (-1, 1):
        pts_c = [(sx * 0.94, 0.0, 0.025), (sx * 0.62, 0.0, 0.36), (sx * 0.80, 0.0, 0.65)]
        bm_sweep_tube(bm_tp, pts_c, strut_p, closed=False, cap_ends=True)
        bm_add_box(bm_tp, 0.22, 0.74, 0.036, matrix=Matrix.Translation((sx * 0.94, 0.0, 0.018)), bevel=0.008)
        bm_add_box(bm_tg, 0.24, 0.76, 0.012, matrix=Matrix.Translation((sx * 0.94, 0.0, 0.038)), bevel=0.003)
    bm_add_box(bm_tp, 1.66, 0.68, 0.036, matrix=Matrix.Translation((0.0, 0.0, 0.702)), bevel=0.008)
    bm_add_box(bm_tg, 1.38, 0.10, 0.055, matrix=Matrix.Translation((0.0, 0.0, 0.36)), bevel=0.008)

    def sg_oct_pts(hx, hy):
        ch = 0.14
        return [(-hx + ch, -hy), (hx - ch, -hy), (hx, -hy + ch), (hx, hy - ch), (hx - ch, hy), (-hx + ch, hy), (-hx, hy - ch), (-hx, -hy + ch)]

    add_quad_beveled_slab(bm_to, sg_oct_pts, 1.20, 0.625, 0.722, 0.780, bxy=0.014, bz=0.010)
    add_quad_beveled_slab(bm_tg, sg_oct_pts, 1.204, 0.628, 0.746, 0.754, bxy=0.003, bz=0.002)

    finalize_obj("Singapore_Table_Platinum", bm_tp, mats["platinum"], col, parent=tbl_root, uv_scale=1.0)
    finalize_obj("Singapore_Table_Obsidian", bm_to, mats["obsidian"], col, parent=tbl_root, uv_scale=0.8)
    finalize_obj("Singapore_Table_Gold", bm_tg, mats["gold_24k"], col, parent=tbl_root, uv_scale=1.5)

    return col, root


# ===========================================================================
# VENUE 4: INT'L WATERS — THE APEX FORUM (apex_forum_room.glb, <=50k tris)
# ===========================================================================
def build_apex_forum_room(mats):
    col = make_collection("Venue_Apex_Forum")
    root = make_empty("Apex_Forum_Root", col)

    R_ARENA = 8.40

    # --- A. Honed Obsidian Broadcast Stage Floor + 24K Sovereign World Meridian Emblem ---
    bm_fl_ob = bmesh.new()
    bm_fl_sl = bmesh.new()
    bm_fl_gd = bmesh.new()

    bm_add_lathe(bm_fl_sl, [(0.001, -0.28), (R_ARENA + 0.5, -0.28), (R_ARENA + 0.5, 0.0), (0.001, 0.0)], segs=48)
    bm_add_lathe(bm_fl_ob, chamfer_ring_profile(0.01, 3.65, -0.01, 0.0025, 0.002), segs=48)
    for rr in (1.75, 2.75, 3.66, 4.65):
        bm_add_lathe(bm_fl_gd, chamfer_ring_profile(rr - 0.025, rr + 0.025, -0.004, 0.0042, 0.002), segs=48)
    for i in range(12):
        a = i * (2.0 * math.pi / 12.0)
        bm_add_box(bm_fl_gd, 2.90, 0.032, 0.005, matrix=Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((3.20, 0.0, 0.0022)))

    finalize_obj("Apex_Floor_Slate", bm_fl_sl, mats["sg_slate"], col, parent=root, uv_scale=0.45)
    finalize_obj("Apex_Floor_ObsidianStage", bm_fl_ob, mats["obsidian"], col, parent=root, uv_scale=0.6)
    finalize_obj("Apex_Floor_SovereignEmblem", bm_fl_gd, mats["gold_24k"], col, parent=root, uv_scale=1.2)

    # --- B. 4 Tiered Circular World-Council Delegate Galleries + Curved Ocean Glass Wall ---
    bm_tier_st = bmesh.new()
    bm_tier_wd = bmesh.new()
    bm_tier_gd = bmesh.new()
    bm_rib_gm = bmesh.new()
    bm_wglass = bmesh.new()

    # Leave grand panoramic maritime storm-ocean bay open across +Y (angles 42..138 deg),
    # while wrapping stepped delegate seating & carved walnut council desks around the remaining 264 deg + low front tier!
    gallery_arcs = [
        (math.radians(-38), math.radians(38)),
        (math.radians(142), math.radians(218)),
        (math.radians(226), math.radians(314)),
    ]
    for (a0, a1) in gallery_arcs:
        for t_i in range(4):
            r_in = 4.75 + t_i * 0.85
            r_out = r_in + 0.86
            z0 = t_i * 0.56
            z1 = z0 + 0.56
            bm_add_sector(bm_tier_st, r_in, r_out, z0, z1, a0, a1, segs=10, bevel=0.02)
            # Curved dark-teak/walnut delegate desk fascia & 24K brass crest strip on every tier!
            bm_add_sector(bm_tier_wd, r_in + 0.06, r_in + 0.24, z1, z1 + 0.42, a0 + 0.02, a1 - 0.02, segs=10, bevel=0.015)
            bm_add_sector(bm_tier_gd, r_in + 0.04, r_in + 0.08, z1 + 0.34, z1 + 0.40, a0 + 0.02, a1 - 0.02, segs=10)

    # Low panoramic ocean-bay seawall sill along the +Y maritime window arc (38..142 deg)
    bm_add_sector(bm_tier_st, 7.65, 8.45, 0.0, 0.82, math.radians(34), math.radians(146), segs=16, bevel=0.025)
    bm_add_sector(bm_tier_gd, 7.62, 7.76, 0.80, 0.88, math.radians(34), math.radians(146), segs=16)

    # 12 Monumental Battered Maritime Steel-and-Gold Structural Ribs rising around R=8.05m to Coffered Broadcast Ring!
    rib_p = chamfer_rect_2d(0.22, 0.26, 0.03)
    for k in range(12):
        ka = math.radians(15) + k * (2.0 * math.pi / 12.0)
        ca, sa = math.cos(ka), math.sin(ka)
        pts_mr = [
            (8.05 * ca, 8.05 * sa, 0.0),
            (7.92 * ca, 7.92 * sa, 3.6),
            (7.25 * ca, 7.25 * sa, 6.4),
            (5.10 * ca, 5.10 * sa, 7.65),
        ]
        bm_sweep_tube(bm_rib_gm, pts_mr, rib_p, closed=False, cap_ends=True)
        pts_mg = [(r * 0.975 * ca, r * 0.975 * sa, z - 0.03) for (r, z) in ((8.05, 0.2), (7.92, 3.6), (7.25, 6.4), (5.10, 7.60))]
        bm_sweep_tube(bm_tier_gd, pts_mg, chamfer_rect_2d(0.045, 0.045, 0.008), closed=False, cap_ends=True)

    # Coffered Sovereign Ring Ceiling & Curved Ocean Storm-Glass Wall (`Apex_Window_Glass`)
    bm_add_lathe(bm_rib_gm, chamfer_ring_profile(4.85, 8.35, 7.45, 7.95, 0.04), segs=48)
    bm_add_lathe(bm_rib_gm, chamfer_ring_profile(2.65, 5.05, 7.75, 8.20, 0.04), segs=48)
    bm_add_lathe(bm_tier_gd, chamfer_ring_profile(2.60, 2.78, 7.68, 7.82, 0.015), segs=48)

    # Full perimeter curved storm-ocean glazing (`Apex_Window_Glass`)
    bm_add_lathe(bm_wglass, [(8.08, 0.80), (8.12, 0.80), (8.00, 6.50), (7.96, 6.50)], segs=36)

    finalize_obj("Apex_Amphitheater_Slate", bm_tier_st, mats["sg_slate"], col, parent=root, uv_scale=0.5)
    finalize_obj("Apex_Delegate_WalnutDesks", bm_tier_wd, mats["rio_teak"], col, parent=root, uv_scale=0.8)
    finalize_obj("Apex_Architectural_Gold", bm_tier_gd, mats["gold_24k"], col, parent=root, uv_scale=1.2)
    finalize_obj("Apex_Maritime_SteelRibs", bm_rib_gm, mats["gunmetal"], col, parent=root, uv_scale=0.5)
    finalize_obj("Apex_Window_Glass", bm_wglass, mats["window_glass"], col, parent=root, uv_scale=0.4, cast_shadow=False)

    # --- C. Sovereign Crown Halo + Twin Overhead Articulated Broadcast Spotlight Rigs! ---
    halo_pivot = make_empty("Apex_Crown_Halo", col, parent=root, location=(0.0, 0.0, 5.85))
    bm_hl_gd = bmesh.new()
    bm_hl_gm = bmesh.new()
    bm_add_lathe(bm_hl_gm, chamfer_ring_profile(2.05, 2.28, -0.08, 0.08, 0.018), segs=48)
    bm_add_lathe(bm_hl_gd, chamfer_ring_profile(1.98, 2.06, -0.05, 0.05, 0.010), segs=48)
    bm_add_lathe(bm_hl_gd, chamfer_ring_profile(2.27, 2.34, -0.05, 0.05, 0.010), segs=48)
    finalize_obj("Apex_Halo_Gunmetal", bm_hl_gm, mats["gunmetal"], col, parent=halo_pivot, uv_scale=1.0)
    finalize_obj("Apex_Halo_Gold", bm_hl_gd, mats["gold_24k"], col, parent=halo_pivot, uv_scale=1.5)

    for tag, sx in (("L", -3.25), ("R", 3.25)):
        rig_piv = make_empty(f"Apex_Spotlight_Rig_{tag}", col, parent=root, location=(sx, -0.45, 5.55))
        bm_sp_gm = bmesh.new()
        bm_sp_gd = bmesh.new()
        bm_sp_ln = bmesh.new()
        # Suspended space-frame gantry bar + 3 articulated cinema spotlight cans aimed at center stage (0,0,0.8)!
        bm_add_box(bm_sp_gm, 0.22, 1.85, 0.18, bevel=0.02)
        bm_add_cyl(bm_sp_gm, 0.045, 0.045, 2.15, segs=8, matrix=Matrix.Translation((0, 0, 1.10)))
        aim_dir = (Vector((0.0, 0.0, 0.85)) - Vector((sx, -0.45, 5.25))).normalized()
        aim_rot = aim_dir.to_track_quat("-Z", "Y").to_matrix().to_4x4()
        for sy in (-0.68, 0.0, 0.68):
            m_can = Matrix.Translation((0.0, sy, -0.32)) @ aim_rot
            bm_add_cyl(bm_sp_gm, 0.18, 0.14, 0.42, segs=14, matrix=m_can, bevel=0.015)
            bm_add_lathe(bm_sp_gd, chamfer_ring_profile(0.14, 0.195, -0.22, -0.17, 0.008), segs=16, matrix=m_can)
            bm_add_cyl(bm_sp_ln, 0.145, 0.145, 0.03, segs=14, matrix=m_can @ Matrix.Translation((0, 0, -0.20)))
        finalize_obj(f"Spotlight_Rig_{tag}_Body", bm_sp_gm, mats["gunmetal"], col, parent=rig_piv, uv_scale=1.0)
        finalize_obj(f"Spotlight_Rig_{tag}_Brass", bm_sp_gd, mats["gold_24k"], col, parent=rig_piv, uv_scale=1.5)
        finalize_obj(f"Spotlight_Rig_{tag}_Lens", bm_sp_ln, mats["apex_spot_glow"], col, parent=rig_piv, uv_scale=1.0, cast_shadow=False)

    # --- D. Hero Sovereign Arbiter V-Monolith Marble, Obsidian & 24K-Gold Finale Table (Top flush Z = 0.780m!) ---
    tbl_root = make_empty("Apex_Hero_Table", col, parent=root)
    bm_tm = bmesh.new()
    bm_to = bmesh.new()
    bm_tg = bmesh.new()

    # Dramatic Sculpted Twin V-Wing Veined Dark-Marble & Fluted 24K-Gold Monolith Pedestal (strictly <= Z=0.718m!)
    v_prof = chamfer_rect_2d(0.11, 0.28, 0.022)
    for sx in (-1, 1):
        pts_v = [(sx * 0.40, 0.0, 0.06), (sx * 0.82, 0.0, 0.61)]
        bm_sweep_tube(bm_tm, pts_v, v_prof, closed=False, cap_ends=True)
        for fl in (-0.18, 0.0, 0.18):
            bm_sweep_tube(bm_tg, [(sx * 0.42, fl, 0.07), (sx * 0.84, fl, 0.61)], chamfer_rect_2d(0.016, 0.016, 0.004), closed=False, cap_ends=True)
    bm_add_box(bm_tm, 1.72, 0.72, 0.045, matrix=Matrix.Translation((0, 0, 0.696)), bevel=0.010)
    bm_add_box(bm_to, 1.38, 0.84, 0.05, matrix=Matrix.Translation((0, 0, 0.025)), bevel=0.012)
    bm_add_box(bm_tg, 1.42, 0.88, 0.016, matrix=Matrix.Translation((0, 0, 0.052)), bevel=0.004)

    add_quad_beveled_slab(bm_to, lambda hx, hy: stadium_outline_2d(hx, hy, 14), 1.20, 0.625, 0.720, 0.780, bxy=0.016, bz=0.012)
    add_quad_beveled_slab(bm_tg, lambda hx, hy: stadium_outline_2d(hx, hy, 12), 1.205, 0.629, 0.744, 0.754, bxy=0.003, bz=0.002)

    finalize_obj("Apex_Table_DarkMarble", bm_tm, mats["dark_marble"], col, parent=tbl_root, uv_scale=0.9)
    finalize_obj("Apex_Table_Obsidian", bm_to, mats["obsidian"], col, parent=tbl_root, uv_scale=0.8)
    finalize_obj("Apex_Table_Gold", bm_tg, mats["gold_24k"], col, parent=tbl_root, uv_scale=1.5)

    return col, root


# ===========================================================================
# RELIC 5: CRYO-CORE RELAY (relic_reykjavik_cryo.glb, <=28k tris, base flush Y=0.0m)
# ===========================================================================
def build_relic_reykjavik_cryo(mats):
    col = make_collection("Relic_Reykjavik_Cryo")
    root = make_empty("Relic_Reykjavik_Cryo_Root", col)

    # 1. Stepped Hexagonal Volcanic-Basalt & 24K-Gold Suspension Pedestal (Z = 0.000..0.18m)
    bm_ped_ba = bmesh.new()
    bm_ped_gd = bmesh.new()
    bm_add_cyl(bm_ped_ba, 0.34, 0.30, 0.065, segs=6, matrix=Matrix.Translation((0, 0, 0.0325)), bevel=0.010)
    bm_add_cyl(bm_ped_ba, 0.25, 0.21, 0.055, segs=6, matrix=Matrix.Translation((0, 0, 0.0925)), bevel=0.008)
    bm_add_lathe(bm_ped_gd, chamfer_ring_profile(0.29, 0.348, 0.000, 0.016, 0.004), segs=36)
    bm_add_lathe(bm_ped_gd, chamfer_ring_profile(0.18, 0.225, 0.118, 0.142, 0.005), segs=36)
    # 3 Curved S-scroll 24K gold cradle struts rising to support the cryogenic containment assembly
    cr_prof = chamfer_rect_2d(0.015, 0.012, 0.004)
    for i in range(3):
        a = i * (2.0 * math.pi / 3.0)
        ca, sa = math.cos(a), math.sin(a)
        pts_s = [(0.20 * ca, 0.20 * sa, 0.13), (0.35 * ca, 0.35 * sa, 0.28), (0.37 * ca, 0.37 * sa, 0.48)]
        bm_sweep_tube(bm_ped_gd, pts_s, cr_prof, closed=False, cap_ends=True, scales=[1.2, 1.0, 0.85])

    finalize_obj("Cryo_Pedestal_Basalt", bm_ped_ba, mats["reyk_basalt"], col, parent=root, uv_scale=1.4)
    finalize_obj("Cryo_Pedestal_Gold", bm_ped_gd, mats["gold_24k"], col, parent=root, uv_scale=2.0)

    # 2. 3 Rotating Engraved Brass Cryo-Latch Rings (`Latch_0..2` — Boss Phase II 3-Step Synthesis!)
    Z_CORE = 0.50
    for r_idx, (zz, rad) in enumerate(((0.34, 0.32), (0.50, 0.37), (0.66, 0.31))):
        lpiv = make_empty(f"Latch_{r_idx}", col, parent=root, location=(0.0, 0.0, zz))
        bm_lr = bmesh.new()
        bm_lj = bmesh.new()
        bm_add_lathe(bm_lr, chamfer_ring_profile(rad - 0.026, rad, -0.018, 0.018, 0.005), segs=48)
        for t in range(24):
            ta = (2.0 * math.pi * t) / 24.0
            bm_add_box(bm_lr, 0.016, 0.012, 0.026, matrix=Matrix.Rotation(ta, 4, "Z") @ Matrix.Translation((rad + 0.006, 0.0, 0.0)), bevel=0.002)
        for j in range(3):
            ja = j * (2.0 * math.pi / 3.0) + r_idx * 0.5
            bm_faceted_gem(bm_lj, 0.018, 0.026, sides=6,
                           matrix=Matrix.Rotation(ja, 4, "Z") @ Matrix.Translation((rad + 0.012, 0.0, 0.0)) @ Matrix.Rotation(math.pi * 0.5, 4, "Y"))
        finalize_obj(f"Cryo_Latch_Mesh_{r_idx}", bm_lr, mats["gold_24k"] if r_idx == 1 else mats["rose_gold"], col, parent=lpiv, uv_scale=2.0)
        finalize_obj(f"Cryo_Latch_Jewels_{r_idx}", bm_lj, mats["gem_sapphire"], col, parent=lpiv, uv_scale=2.0)

    # 3. 6 Radial Machined Brushed-Titanium Cooling Fin Blades + Clustered Basalt & Cryo-Crystal Spire + Aurora Core!
    spire_piv = make_empty("Cryo_Spire_Core", col, parent=root, location=(0.0, 0.0, Z_CORE))
    bm_ti = bmesh.new()
    bm_bs = bmesh.new()
    bm_cr = bmesh.new()
    bm_au = bmesh.new()

    fin_prof = chamfer_rect_2d(0.012, 0.018, 0.004)
    for k in range(6):
        ka = (2.0 * math.pi * k) / 6.0
        m_f = Matrix.Rotation(ka, 4, "Z")
        # Graceful curved crescent titanium cryogenic radiator blade sweeping from bottom to top!
        pts_fin = [
            (0.145, 0.0, -0.22),
            (0.245, 0.018, -0.11),
            (0.285, 0.028, 0.00),
            (0.245, 0.018, 0.11),
            (0.145, 0.0, 0.22),
        ]
        bm_sweep_tube(bm_ti, pts_fin, fin_prof, closed=False, cap_ends=True, scales=[0.7, 1.05, 1.25, 1.05, 0.7], matrix=m_f)
        # 3 delicate horizontal titanium louver bridges tying blade to prism core
        for zl in (-0.11, 0.0, 0.11):
            bm_add_box(bm_ti, 0.13, 0.012, 0.022, matrix=m_f @ Matrix.Translation((0.185, 0.012, zl)), bevel=0.003)
        # Alternating hexagonal volcanic basalt & frosted cryo-sapphire optical prism columns!
        h_p = 0.52 + (k % 2) * 0.14
        z_off = -0.04 + (k % 2) * 0.05
        target = bm_cr if (k % 2 == 0) else bm_bs
        m_pr = m_f @ Matrix.Translation((0.108, 0.0, z_off)) @ Matrix.Rotation(math.radians(-7 if k % 2 == 0 else 5), 4, "Y")
        bm_add_cyl(target, 0.052, 0.032, h_p, segs=6, matrix=m_pr, bevel=0.007)

    # Central towering frosted cryo-quartz apex crystal + incandescent emerald-aurora heart!
    bm_faceted_gem(bm_cr, 0.095, 0.82, sides=6, bevel=0.006)
    bm_faceted_gem(bm_au, 0.072, 0.28, sides=8, bevel=0.004)

    finalize_obj("Cryo_Titanium_CoolingFins", bm_ti, mats["titanium"], col, parent=spire_piv, uv_scale=2.0)
    finalize_obj("Cryo_Basalt_Prisms", bm_bs, mats["reyk_basalt"], col, parent=spire_piv, uv_scale=1.6)
    finalize_obj("Cryo_Optical_Lenses", bm_cr, mats["reyk_cryo_crystal"], col, parent=spire_piv, uv_scale=1.6)
    finalize_obj("Cryo_Aurora_EnergyCore", bm_au, mats["reyk_aurora_core"], col, parent=spire_piv, uv_scale=1.6)

    return col, root


# ===========================================================================
# RELIC 6: FRACTURED COUNCIL SEAL (relic_singapore_seal.glb, <=28k tris, base flush Y=0.0m)
# ===========================================================================
def build_relic_singapore_seal(mats):
    col = make_collection("Relic_Singapore_Seal")
    root = make_empty("Relic_Singapore_Seal_Root", col)

    Z_SEAL = 0.50

    # 1. Veined Nero Marquina Marble & Platinum Magnetic Pedestal (Z = 0.000..0.16m)
    bm_pm = bmesh.new()
    bm_pg = bmesh.new()
    bm_add_lathe(bm_pm, [
        (0.01, 0.0), (0.33, 0.0), (0.33, 0.045), (0.28, 0.085),
        (0.20, 0.115), (0.01, 0.115),
    ], segs=48)
    bm_add_lathe(bm_pg, chamfer_ring_profile(0.315, 0.342, 0.0, 0.018, 0.004), segs=48)
    bm_add_lathe(bm_pg, chamfer_ring_profile(0.175, 0.215, 0.108, 0.132, 0.005), segs=48)
    # Twin curved S-scroll 24K gold cradle brackets rising to support the outer magnetic containment ring
    for sx in (-1, 1):
        pts_b = [(sx * 0.18, 0.0, 0.12), (sx * 0.36, 0.0, 0.24), (sx * 0.425, 0.0, 0.46)]
        bm_sweep_tube(bm_pg, pts_b, chamfer_rect_2d(0.018, 0.016, 0.004), closed=False, cap_ends=True, scales=[1.2, 1.0, 0.9])

    finalize_obj("Seal_Pedestal_Marble", bm_pm, mats["dark_marble"], col, parent=root, uv_scale=1.4)
    finalize_obj("Seal_Pedestal_Gold", bm_pg, mats["gold_24k"], col, parent=root, uv_scale=2.0)

    # 2. Outer Magnetic Brass Containment Ring (Vertical XZ plane facing camera, pivoted at Z = 0.50m!)
    ring_piv = make_empty("Seal_Containment_Ring", col, parent=root, location=(0.0, 0.0, Z_SEAL))
    bm_rg = bmesh.new()
    m_xz = Matrix.Rotation(math.pi * 0.5, 4, "X")
    bm_add_lathe(bm_rg, chamfer_ring_profile(0.375, 0.422, -0.024, 0.024, 0.007), segs=64, matrix=m_xz)
    for t in range(36):
        ta = (2.0 * math.pi * t) / 36.0
        bm_add_box(bm_rg, 0.022, 0.012, 0.032, matrix=m_xz @ Matrix.Rotation(ta, 4, "Z") @ Matrix.Translation((0.430, 0.0, 0.0)), bevel=0.002)
    finalize_obj("Seal_Containment_Brass", bm_rg, mats["gold_24k"], col, parent=ring_piv, uv_scale=2.0)

    # 3. 3 Tripartite Interlocking Fractured Medallion Segments (`Latch_0..2` — Sovereign / Horizon / Agora!)
    seg_specs = [
        ("Latch_0", math.radians(90),  mats["gold_24k"],  mats["gem_ruby"]),
        ("Latch_1", math.radians(210), mats["platinum"],  mats["gem_sapphire"]),
        ("Latch_2", math.radians(330), mats["rose_gold"], mats["gem_emerald"]),
    ]
    for s_name, ang_mid, seg_mat, gem_mat in seg_specs:
        # Hovering slightly radially separated (fractured gap = 0.026m!) around center (0, 0, Z_SEAL)
        rad_hover = 0.024
        spiv = make_empty(
            s_name, col, parent=root,
            location=(rad_hover * math.cos(ang_mid), 0.0, Z_SEAL + rad_hover * math.sin(ang_mid)),
        )
        bm_sg = bmesh.new()
        bm_gm = bmesh.new()
        bm_fil = bmesh.new()
        a0 = ang_mid - math.radians(54)
        a1 = ang_mid + math.radians(54)
        bm_add_sector(bm_sg, 0.115, 0.325, -0.022, 0.022, a0, a1, segs=14, bevel=0.006, matrix=m_xz)
        bm_add_sector(bm_sg, 0.165, 0.275, -0.034, 0.034, a0 + 0.08, a1 - 0.08, segs=10, bevel=0.005, matrix=m_xz)
        # Crisp 24K Gold Heraldic Sun-Rays & Inner Bezel Arcs on Front & Back of Each Faction Segment!
        bm_add_sector(bm_fil, 0.308, 0.328, -0.026, 0.026, a0 + 0.03, a1 - 0.03, segs=12, matrix=m_xz)
        bm_add_sector(bm_fil, 0.112, 0.130, -0.026, 0.026, a0 + 0.03, a1 - 0.03, segs=12, matrix=m_xz)
        for rf in (-0.52, -0.26, 0.0, 0.26, 0.52):
            ra = ang_mid + rf
            bm_add_box(bm_fil, 0.16, 0.011, 0.042, matrix=m_xz @ Matrix.Rotation(ra, 4, "Z") @ Matrix.Translation((0.22, 0.0, 0.0)), bevel=0.002)
        bm_faceted_gem(bm_gm, 0.036, 0.062, sides=8,
                       matrix=m_xz @ Matrix.Rotation(ang_mid, 4, "Z") @ Matrix.Translation((0.22, 0.0, 0.0)))
        finalize_obj(f"{s_name}_Mesh", bm_sg, seg_mat, col, parent=spiv, uv_scale=2.0)
        finalize_obj(f"{s_name}_Filigree", bm_fil, mats["gold_24k"], col, parent=spiv, uv_scale=2.0)
        finalize_obj(f"{s_name}_Jewel", bm_gm, gem_mat, col, parent=spiv, uv_scale=2.0)

    # 4. Luminous Faceted Cyan-Diamond Treaty Heart hovering in the fractured void (`Seal_Core_Crystal`)
    core_piv = make_empty("Seal_Core_Crystal", col, parent=root, location=(0.0, 0.0, Z_SEAL))
    bm_cc = bmesh.new()
    bm_faceted_gem(bm_cc, 0.078, 0.155, sides=8, bevel=0.004)
    finalize_obj("Seal_Core_Mesh", bm_cc, mats["reyk_cryo_crystal"], col, parent=core_piv, uv_scale=2.0)

    return col, root


# ===========================================================================
# RELIC 7: MASTER LEDGER CORE (relic_apex_ledger.glb, <=28k tris, base flush Y=0.0m)
# ===========================================================================
def build_relic_apex_ledger(mats):
    col = make_collection("Relic_Apex_Ledger")
    root = make_empty("Relic_Apex_Ledger_Root", col)

    Z_CORE = 0.52

    # 1. Monumental Stepped Octagonal Obsidian & 24K-Gold Sovereign Plinth (Z = 0.000..0.18m)
    bm_po = bmesh.new()
    bm_pg = bmesh.new()
    bm_add_cyl(bm_po, 0.36, 0.32, 0.065, segs=8, matrix=Matrix.Translation((0, 0, 0.0325)), bevel=0.010)
    bm_add_cyl(bm_po, 0.26, 0.22, 0.065, segs=8, matrix=Matrix.Translation((0, 0, 0.0975)), bevel=0.008)
    bm_add_lathe(bm_pg, chamfer_ring_profile(0.32, 0.368, 0.0, 0.018, 0.004), segs=40)
    bm_add_lathe(bm_pg, chamfer_ring_profile(0.18, 0.232, 0.122, 0.148, 0.005), segs=40)
    for i in range(4):
        a = math.pi * 0.25 + i * math.pi * 0.5
        ca, sa = math.cos(a), math.sin(a)
        pts_c = [(0.19 * ca, 0.19 * sa, 0.135), (0.35 * ca, 0.35 * sa, 0.25), (0.41 * ca, 0.41 * sa, 0.44)]
        bm_sweep_tube(bm_pg, pts_c, chamfer_rect_2d(0.016, 0.014, 0.004), closed=False, cap_ends=True, scales=[1.2, 1.0, 0.85])

    finalize_obj("Ledger_Pedestal_Obsidian", bm_po, mats["obsidian"], col, parent=root, uv_scale=1.4)
    finalize_obj("Ledger_Pedestal_Gold", bm_pg, mats["gold_24k"], col, parent=root, uv_scale=2.0)

    # 2. 3 Counter-Angled Geared Sovereign Orbital Latch Rings (`Latch_0..2`)
    orb_specs = [
        ("Latch_0", 0.415, (math.radians(68), math.radians(18), 0.0),  mats["gold_24k"]),
        ("Latch_1", 0.360, (math.radians(-52), math.radians(34), 0.0), mats["platinum"]),
        ("Latch_2", 0.305, (math.radians(28), math.radians(-62), 0.0), mats["rose_gold"]),
    ]
    for oname, rad, rot_eul, omat in orb_specs:
        opiv = make_empty(oname, col, parent=root, location=(0.0, 0.0, Z_CORE), rotation=rot_eul)
        bm_or = bmesh.new()
        bm_add_lathe(bm_or, chamfer_ring_profile(rad - 0.024, rad, -0.016, 0.016, 0.005), segs=56)
        for t in range(32):
            ta = (2.0 * math.pi * t) / 32.0
            bm_add_box(bm_or, 0.018, 0.011, 0.024, matrix=Matrix.Rotation(ta, 4, "Z") @ Matrix.Translation((rad + 0.006, 0.0, 0.0)))
        finalize_obj(f"{oname}_Mesh", bm_or, omat, col, parent=opiv, uv_scale=2.0)

    # 3. Nested Obsidian & 24K-Gold Tesseract Hypercube Cage + Champagne-Diamond Truth Heart!
    tess_piv = make_empty("Ledger_Tesseract_Core", col, parent=root, location=(0.0, 0.0, Z_CORE),
                          rotation=(math.radians(35.26), math.radians(45.0), 0.0))
    bm_to = bmesh.new()
    bm_tg = bmesh.new()
    bm_td = bmesh.new()

    # Outer hollow 12-edge beveled obsidian cube frame + 24K gold corner vertex nodes + 8 hypercube diagonal struts!
    H_OUT = 0.155
    H_IN = 0.082
    edge_coords = [
        ((-1, -1, 0), (0, 0, 1)), ((1, -1, 0), (0, 0, 1)), ((1, 1, 0), (0, 0, 1)), ((-1, 1, 0), (0, 0, 1)),
        ((-1, 0, -1), (0, 1, 0)), ((1, 0, -1), (0, 1, 0)), ((1, 0, 1), (0, 1, 0)), ((-1, 0, 1), (0, 1, 0)),
        ((0, -1, -1), (1, 0, 0)), ((0, 1, -1), (1, 0, 0)), ((0, 1, 1), (1, 0, 0)), ((0, -1, 1), (1, 0, 0)),
    ]
    for (cx, cy, cz), (ax, ay, az) in edge_coords:
        sx = H_OUT * 2.0 if ax else 0.026
        sy = H_OUT * 2.0 if ay else 0.026
        sz = H_OUT * 2.0 if az else 0.026
        bm_add_box(bm_to, sx, sy, sz, matrix=Matrix.Translation((cx * H_OUT, cy * H_OUT, cz * H_OUT)), bevel=0.005)
        sx_i = H_IN * 2.0 if ax else 0.014
        sy_i = H_IN * 2.0 if ay else 0.014
        sz_i = H_IN * 2.0 if az else 0.014
        bm_add_box(bm_tg, sx_i, sy_i, sz_i, matrix=Matrix.Translation((cx * H_IN, cy * H_IN, cz * H_IN)), bevel=0.003)

    strut_p = circle_profile(0.0075, 0.0075, segs=6)
    for sx in (-1, 1):
        for sy in (-1, 1):
            for sz in (-1, 1):
                p_out = (sx * H_OUT, sy * H_OUT, sz * H_OUT)
                p_in = (sx * H_IN, sy * H_IN, sz * H_IN)
                bm_add_box(bm_tg, 0.036, 0.036, 0.036, matrix=Matrix.Translation(p_out), bevel=0.006)
                bm_sweep_tube(bm_tg, [p_in, p_out], strut_p, closed=False, cap_ends=True)

    # Brilliant-cut Champagne-Gold Truth Crystal suspended inside the inner tesseract!
    bm_faceted_gem(bm_td, 0.068, 0.135, sides=8, bevel=0.004)

    finalize_obj("Ledger_Tesseract_Obsidian", bm_to, mats["obsidian"], col, parent=tess_piv, uv_scale=2.0)
    finalize_obj("Ledger_Tesseract_Gold", bm_tg, mats["gold_24k"], col, parent=tess_piv, uv_scale=2.0)
    finalize_obj("Ledger_Crystal_Heart", bm_td, mats["champagne_diamond"], col, parent=tess_piv, uv_scale=2.0)

    return col, root


# ===========================================================================
# PROP 8: 3D LEATHER & GOLD DIPLOMATIC PASSPORT (meridian_passport_3d.glb, <=18k tris)
# ===========================================================================
def build_meridian_passport_3d(mats):
    """
    Museum-grade 3D Stitched Midnight-Navy Leather & 24K-Gold Diplomatic Passport!
    - Grounded cleanly at Z = 0.000m (glTF Y = 0.000m), centered around origin:
      Width X = 0.35m, Height/Length Y = 0.49m, Thickness Z = 0.052m.
    - Animatable `Passport_Cover` pivoted cleanly on the left spine hinge (-0.168, 0.0, 0.044)
      so Three.js / Godot opens the front cover smoothly around the spine axis!
    """
    col = make_collection("Prop_Meridian_Passport_3D")
    root = make_empty("Meridian_Passport_Root", col)

    W = 0.340
    L = 0.480
    SPINE_X = -W * 0.5  # -0.170m

    # --- A. Back Leather Cover + Molded Rounded Spine + Brass Corner Guards + Gilded Page Block + Silk Ribbon ---
    bm_back_l = bmesh.new()
    bm_back_g = bmesh.new()
    bm_pages = bmesh.new()
    bm_ribbon = bmesh.new()

    # Back hardbound leather board (Z = 0.000..0.008m)
    bm_add_box(bm_back_l, W, L, 0.008, matrix=Matrix.Translation((0.0, 0.0, 0.004)), bevel=0.003)
    # Molded curved leather spine wrapping the left edge (X = -0.172, Z = 0.004..0.048m) + 5 raised spine ribs!
    spine_pts = []
    for s in range(9):
        a = math.pi * 0.5 + math.pi * (s / 8.0)
        spine_pts.append((SPINE_X + 0.004 + 0.022 * math.cos(a), 0.0, 0.026 + 0.022 * math.sin(a)))
    # Extrude curved spine profile cleanly along Y (-L/2 .. +L/2)
    for s in range(8):
        x0, _, z0 = spine_pts[s]
        x1, _, z1 = spine_pts[s + 1]
        cx, cz = 0.5 * (x0 + x1), 0.5 * (z0 + z1)
        seg_l = math.hypot(x1 - x0, z1 - z0)
        ang = math.atan2(z1 - z0, x1 - x0)
        bm_add_box(bm_back_l, seg_l + 0.003, L, 0.008,
                   matrix=Matrix.Translation((cx, 0.0, cz)) @ Matrix.Rotation(ang, 4, "Y"), bevel=0.002)
    # 5 Raised Horological Gold Hub Bands across the leather spine!
    for sy in (-0.18, -0.09, 0.0, 0.09, 0.18):
        bm_add_cyl(bm_back_g, 0.025, 0.025, 0.010, segs=16,
                   matrix=Matrix.Translation((SPINE_X + 0.002, sy, 0.026)) @ Matrix.Rotation(math.pi * 0.5, 4, "X"), bevel=0.002)

    # Back-right 24K Brass Bookbinding Corner Protectors
    for sy in (-1, 1):
        bm_add_box(bm_back_g, 0.044, 0.044, 0.011,
                   matrix=Matrix.Translation((W * 0.5 - 0.019, sy * (L * 0.5 - 0.019), 0.0045)), bevel=0.003)

    # Stitched Cream Diplomatic Parchment Page Block (Z = 0.008..0.043m) + Gilded Gold-Leaf Page Fore-Edges!
    bm_add_box(bm_pages, W - 0.022, L - 0.024, 0.034, matrix=Matrix.Translation((-0.004, 0.0, 0.025)), bevel=0.002)
    # Gilded 24K gold-leaf page edge sheen strips on right/top/bottom fore-edges + interior visa page border frame
    bm_add_box(bm_back_g, 0.003, L - 0.026, 0.031, matrix=Matrix.Translation((W * 0.5 - 0.014, 0.0, 0.025)))
    for (fx, fy, sx, sy) in [(0.005, 0.195, 0.27, 0.005), (0.005, -0.195, 0.27, 0.005), (0.138, 0.0, 0.005, 0.39), (-0.128, 0.0, 0.005, 0.39)]:
        bm_add_box(bm_back_g, sx, sy, 0.002, matrix=Matrix.Translation((fx, fy, 0.0425)))
    # Subtle embossed interior Visa Stamp Grid Rings on top parchment page!
    bm_add_lathe(bm_back_g, chamfer_ring_profile(0.068, 0.074, 0.0415, 0.0432, 0.0006), segs=36, matrix=Matrix.Translation((0.01, 0.04, 0.0)))

    # Crimson Diplomatic Silk Bookmark Ribbon + 24K Gold Ribbon Seal Tag draping gracefully out the bottom!
    rib_pts = [(-0.04, -0.12, 0.0428), (-0.02, -0.235, 0.040), (0.015, -0.278, 0.016), (0.032, -0.315, 0.004)]
    bm_sweep_tube(bm_ribbon, rib_pts, chamfer_rect_2d(0.016, 0.0025, 0.0008), closed=False, cap_ends=True)
    bm_add_cyl(bm_back_g, 0.018, 0.018, 0.004, segs=16, matrix=Matrix.Translation((0.032, -0.318, 0.004)), bevel=0.001)

    finalize_obj("Passport_Back_Leather", bm_back_l, mats["passport_leather"], col, parent=root, uv_scale=2.0)
    finalize_obj("Passport_Back_Gold", bm_back_g, mats["gold_24k"], col, parent=root, uv_scale=2.2)
    finalize_obj("Page_Stack", bm_pages, mats["passport_parchment"], col, parent=root, uv_scale=1.6)
    finalize_obj("Passport_Silk_Ribbon", bm_ribbon, mats["passport_ribbon"], col, parent=root, uv_scale=2.0)

    # --- B. Animatable Front Cover (`Passport_Cover` -> `Cover_Front`, Pivoted on Spine Hinge X = -0.166, Z = 0.045!) ---
    HINGE_X = -0.166
    HINGE_Z = 0.045
    cover_piv = make_empty("Passport_Cover", col, parent=root, location=(HINGE_X, 0.0, HINGE_Z))
    cover_front = make_empty("Cover_Front", col, parent=cover_piv)

    bm_cov_l = bmesh.new()
    bm_cov_g = bmesh.new()
    bm_cov_p = bmesh.new()

    cx_loc = -HINGE_X  # +0.166 so cover spans X in [0 .. +0.336] from spine!
    bm_add_box(bm_cov_l, W, L, 0.0085, matrix=Matrix.Translation((cx_loc, 0.0, 0.003)), bevel=0.003)
    # Inside front endpaper parchment lining (visible when Passport_Cover swings open!)
    bm_add_box(bm_cov_p, W - 0.026, L - 0.026, 0.0018, matrix=Matrix.Translation((cx_loc + 0.004, 0.0, -0.0012)))

    # 2 Front-Right 24K Brass Bookbinding Corner Guards
    for sy in (-1, 1):
        bm_add_box(bm_cov_g, 0.046, 0.046, 0.0115,
                   matrix=Matrix.Translation((cx_loc + W * 0.5 - 0.019, sy * (L * 0.5 - 0.019), 0.003)), bevel=0.003)

    # Double-Ruled Recessed 24K Gold Diplomatic Filigree Frame on Front Cover (Z_local = +0.0078)
    zc_top = 0.0078
    for (w_f, l_f, th) in ((W - 0.048, L - 0.048, 0.0045), (W - 0.068, L - 0.068, 0.0025)):
        bm_add_box(bm_cov_g, w_f, th, 0.0022, matrix=Matrix.Translation((cx_loc + 0.004, l_f * 0.5, zc_top)))
        bm_add_box(bm_cov_g, w_f, th, 0.0022, matrix=Matrix.Translation((cx_loc + 0.004, -l_f * 0.5, zc_top)))
        bm_add_box(bm_cov_g, th, l_f, 0.0022, matrix=Matrix.Translation((cx_loc + 0.004 + w_f * 0.5, 0.0, zc_top)))
        bm_add_box(bm_cov_g, th, l_f, 0.0022, matrix=Matrix.Translation((cx_loc + 0.004 - w_f * 0.5, 0.0, zc_top)))

    # Sculpted 3D Embossed 24K-Gold Meridian Armillary Globe, Compass Star & Sovereign Laurel Crest!
    em_x, em_y = cx_loc + 0.006, 0.018
    m_em = Matrix.Translation((em_x, em_y, zc_top))
    bm_add_lathe(bm_cov_g, chamfer_ring_profile(0.076, 0.088, -0.001, 0.0042, 0.0012), segs=44, matrix=m_em)
    bm_add_lathe(bm_cov_g, chamfer_ring_profile(0.052, 0.059, -0.001, 0.0038, 0.0010), segs=36, matrix=m_em)
    # Embossed latitude/longitude meridian arcs & 8-point Meridian Star
    for ang_d in (-55, -25, 0, 25, 55):
        bm_add_box(bm_cov_g, 0.0035, 0.148 * math.cos(math.radians(ang_d * 0.6)), 0.0032,
                   matrix=m_em @ Matrix.Translation((0.072 * math.sin(math.radians(ang_d)), 0.0, 0.0015)))
    for lat_y in (-0.038, 0.0, 0.038):
        bm_add_box(bm_cov_g, 0.142 * math.sqrt(max(0.1, 1.0 - (lat_y / 0.076) ** 2)), 0.0035, 0.0032,
                   matrix=m_em @ Matrix.Translation((0.0, lat_y, 0.0015)))
    for k in range(8):
        ka = k * math.pi * 0.25
        sl = 0.098 if k % 2 == 0 else 0.068
        bm_add_box(bm_cov_g, sl, 0.007 if k % 2 == 0 else 0.0045, 0.0045,
                   matrix=m_em @ Matrix.Rotation(ka, 4, "Z") @ Matrix.Translation((sl * 0.5, 0.0, 0.0022)))
    # Sculpted 12-Leaf Laurel Wreath flanking the Meridian Globe Crest!
    for sgn in (-1, 1):
        for li in range(7):
            la = math.radians(-58 + li * 20)
            lx = sgn * 0.104 * math.cos(la * 0.65)
            ly = -0.01 + 0.104 * math.sin(la)
            m_lf = m_em @ Matrix.Translation((lx, ly, 0.002)) @ Matrix.Rotation(sgn * (la + math.radians(35)), 4, "Z")
            bm_add_box(bm_cov_g, 0.012, 0.028, 0.0035, matrix=m_lf, bevel=0.001)

    # Raised 24K Gold Header & Footer Diplomatic Title Plaques ("THE MERIDIAN" / "DIPLOMATIC PASSPORT")
    bm_add_box(bm_cov_g, 0.175, 0.022, 0.0035, matrix=Matrix.Translation((em_x, 0.158, zc_top + 0.001)), bevel=0.001)
    bm_add_box(bm_cov_g, 0.205, 0.016, 0.0030, matrix=Matrix.Translation((em_x, -0.138, zc_top + 0.001)), bevel=0.001)
    bm_add_box(bm_cov_g, 0.135, 0.010, 0.0025, matrix=Matrix.Translation((em_x, -0.164, zc_top + 0.001)))

    finalize_obj("Passport_Cover_Leather", bm_cov_l, mats["passport_leather"], col, parent=cover_front, uv_scale=2.0)
    finalize_obj("Passport_Cover_GoldCrest", bm_cov_g, mats["gold_24k"], col, parent=cover_front, uv_scale=2.2)
    finalize_obj("Passport_Cover_Endpaper", bm_cov_p, mats["passport_parchment"], col, parent=cover_front, uv_scale=1.6)

    return col, root


# ===========================================================================
# Hierarchy Stats, GLB Sanitizer & Exporter
# ===========================================================================
def collect_descendants(root_obj):
    out = [root_obj]
    queue = [root_obj]
    while queue:
        cur = queue.pop(0)
        for o in bpy.data.objects:
            if o.parent == cur:
                out.append(o)
                queue.append(o)
    return out


def get_asset_stats(root_obj):
    deps = bpy.context.evaluated_depsgraph_get()
    total_tris = 0
    min_v = Vector((1e9, 1e9, 1e9))
    max_v = Vector((-1e9, -1e9, -1e9))
    mat_names = set()
    node_names = []

    for obj in collect_descendants(root_obj):
        node_names.append(obj.name)
        if obj.type != "MESH":
            continue
        for mat in obj.data.materials:
            if mat is not None:
                mat_names.add(mat.name)
        ev = obj.evaluated_get(deps)
        mesh = ev.to_mesh()
        mesh.calc_loop_triangles()
        total_tris += len(mesh.loop_triangles)
        mw = ev.matrix_world
        for v in mesh.vertices:
            wco = mw @ v.co
            min_v.x = min(min_v.x, wco.x)
            min_v.y = min(min_v.y, wco.y)
            min_v.z = min(min_v.z, wco.z)
            max_v.x = max(max_v.x, wco.x)
            max_v.y = max(max_v.y, wco.y)
            max_v.z = max(max_v.z, wco.z)
        ev.to_mesh_clear()

    gltf_min = [round(min_v.x, 3), round(min_v.z, 3), round(-max_v.y, 3)]
    gltf_max = [round(max_v.x, 3), round(max_v.z, 3), round(-min_v.y, 3)]
    return total_tris, gltf_min, gltf_max, sorted(mat_names), node_names


def sanitize_glb_jpegs_inplace(glb_path: str):
    with open(glb_path, "rb") as f:
        raw = f.read()
    magic, version, _ = struct.unpack("<4sII", raw[:12])
    if magic != b"glTF" or version != 2:
        return 0
    j_len, j_type = struct.unpack("<II", raw[12:20])
    data = json.loads(raw[20:20 + j_len].decode("utf-8"))
    b_off = 20 + j_len
    b_len, _ = struct.unpack("<II", raw[b_off:b_off + 8])
    old_bin = raw[b_off + 8:b_off + 8 + b_len]

    img_bvs = {img["bufferView"]: img.get("mimeType") for img in data.get("images", []) if "bufferView" in img}
    if not img_bvs:
        return 0

    new_bin = bytearray()
    for idx, bv in enumerate(data.get("bufferViews", [])):
        off, ln = bv.get("byteOffset", 0), bv["byteLength"]
        chunk = old_bin[off:off + ln]
        if img_bvs.get(idx) == "image/jpeg":
            chunk = strip_jpeg_non_jfif_app_markers(chunk)
        elif img_bvs.get(idx) == "image/png":
            chunk = strip_png_color_metadata_chunks(chunk)
        while len(new_bin) % 4 != 0:
            new_bin.append(0)
        bv["byteOffset"] = len(new_bin)
        bv["byteLength"] = len(chunk)
        new_bin.extend(chunk)
    while len(new_bin) % 4 != 0:
        new_bin.append(0)
    data["buffers"][0]["byteLength"] = len(new_bin)

    jb = json.dumps(data, separators=(",", ":")).encode("utf-8")
    while len(jb) % 4 != 0:
        jb += b" "
    out_len = 12 + 8 + len(jb) + 8 + len(new_bin)
    out = bytearray()
    out.extend(struct.pack("<4sII", b"glTF", 2, out_len))
    out.extend(struct.pack("<II", len(jb), 0x4E4F534A))
    out.extend(jb)
    out.extend(struct.pack("<II", len(new_bin), 0x004E4942))
    out.extend(new_bin)
    with open(glb_path, "wb") as f:
        f.write(out)
    return len(img_bvs)


def inspect_glb_chunk(glb_path: str):
    with open(glb_path, "rb") as f:
        magic, _, _ = struct.unpack("<4sII", f.read(12))
        if magic != b"glTF":
            return None
        chunk_len, _ = struct.unpack("<II", f.read(8))
        data = json.loads(f.read(chunk_len).decode("utf-8"))
    accessors = data.get("accessors", [])
    tris = sum(accessors[p["indices"]]["count"] // 3 for m in data.get("meshes", []) for p in m.get("primitives", []) if "indices" in p)
    return {
        "meshes": len(data.get("meshes", [])),
        "nodes": len(data.get("nodes", [])),
        "materials": len(data.get("materials", [])),
        "images": len(data.get("images", [])),
        "glb_tris": tris,
    }


def export_glb(root_obj, col, filename: str):
    col.hide_viewport = False
    for o in bpy.data.objects:
        o.select_set(False)
    for o in collect_descendants(root_obj):
        o.hide_viewport = False
        o.select_set(True)
    bpy.context.view_layer.objects.active = root_obj

    out_path = os.path.join(OUT_PUBLIC_GLB_DIR, filename)
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_image_format="AUTO",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_draco_mesh_compression_enable=False,
    )
    sanitize_glb_jpegs_inplace(out_path)
    return out_path, os.path.getsize(out_path), inspect_glb_chunk(out_path)


# ===========================================================================
# 2400x1350 4x2 Architectural & Museum Relic Contact Sheet Renderer
# ===========================================================================
_FONT_5X7 = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    "X": ["10001", "01010", "00100", "00100", "00100", "01010", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
}


def stamp_caption_bar(img_arr: np.ndarray, text: str, x0: int, y0: int, scale: int = 2):
    H, W, _ = img_arr.shape
    char_w = 6 * scale
    bar_w = len(text) * char_w + 22
    bar_h = 7 * scale + 14
    x1, y1 = min(W, x0 + bar_w), min(H, y0 + bar_h)
    bg = np.array([0.04, 0.05, 0.08], dtype=np.float32)
    img_arr[y0:y1, x0:x1, :3] = img_arr[y0:y1, x0:x1, :3] * 0.22 + bg * 0.78
    gold = np.array([0.86, 0.69, 0.33], dtype=np.float32)
    img_arr[y0:y0 + 1, x0:x1, :3] = gold
    img_arr[y1 - 1:y1, x0:x1, :3] = gold
    img_arr[y0:y1, x0:x0 + 2, :3] = gold
    cx = x0 + 11
    cy_top = y0 + 7 + 7 * scale - 1
    for ch in text.upper():
        glyph = _FONT_5X7.get(ch, _FONT_5X7[" "])
        for ri, rstr in enumerate(glyph):
            for ci, bit in enumerate(rstr):
                if bit == "1":
                    px, py = cx + ci * scale, cy_top - (ri + 1) * scale + 1
                    img_arr[py:py + scale, px:px + scale, :3] = np.array([0.96, 0.87, 0.66], dtype=np.float32)
        cx += char_w


def add_light(name, ltype, loc, target, energy, color_hex, col, size=2.0, size_y=None, spot_deg=60.0, spot_blend=0.35, radius=0.5, spec_factor=0.6):
    ld = bpy.data.lights.new(name=name, type=ltype)
    ld.energy = energy
    ld.color = srgb_to_linear(color_hex)[:3]
    if hasattr(ld, "specular_factor"):
        ld.specular_factor = spec_factor
    if ltype == "AREA":
        ld.shape = "RECTANGLE" if size_y is not None else "DISK"
        ld.size = size
        if size_y is not None:
            ld.size_y = size_y
    elif ltype == "SPOT":
        ld.spot_size = math.radians(spot_deg)
        ld.spot_blend = spot_blend
        ld.shadow_soft_size = radius
    elif ltype == "POINT":
        ld.shadow_soft_size = radius
    lo = bpy.data.objects.new(name=name, object_data=ld)
    lo.location = loc
    if target is not None:
        lo.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    col.objects.link(lo)
    return lo


def set_world_env(color_hex: str, strength: float, hdri_rel: str = None, bg_vis_hex: str = None, bg_vis_str: float = 0.5):
    w = bpy.context.scene.world or bpy.data.worlds.new("W2_World")
    bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    hdri_img = None
    hdri_abs = os.path.join(REPO_ROOT, hdri_rel) if hdri_rel else None
    if hdri_abs and os.path.exists(hdri_abs):
        hdri_img = bpy.data.images.load(hdri_abs, check_existing=True)
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = hdri_img
        bg_ibl = nt.nodes.new("ShaderNodeBackground")
        bg_ibl.inputs["Strength"].default_value = strength
        nt.links.new(env.outputs["Color"], bg_ibl.inputs["Color"])
        if bg_vis_hex:
            lp = nt.nodes.new("ShaderNodeLightPath")
            bg_c = nt.nodes.new("ShaderNodeBackground")
            bg_c.inputs["Color"].default_value = srgb_to_linear(bg_vis_hex)
            bg_c.inputs["Strength"].default_value = bg_vis_str
            mix = nt.nodes.new("ShaderNodeMixShader")
            nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
            nt.links.new(bg_ibl.outputs["Background"], mix.inputs[1])
            nt.links.new(bg_c.outputs["Background"], mix.inputs[2])
            nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
        else:
            nt.links.new(bg_ibl.outputs["Background"], out.inputs["Surface"])
    else:
        bg = nt.nodes.new("ShaderNodeBackground")
        bg.inputs["Color"].default_value = srgb_to_linear(color_hex)
        bg.inputs["Strength"].default_value = strength
        nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return hdri_img


def render_panel(asset_col, all_cols, cam_pos, cam_target, lens_mm, hdri_rel, bg_hex, bg_str, env_str, exposure, setup_fn, tmp_png, width=600, height=675):
    for c in all_cols:
        vis = (c == asset_col)
        c.hide_viewport = not vis
        c.hide_render = not vis

    rig = make_collection("Temp_W2_Rig")
    hdri_img = set_world_env(bg_hex, env_str, hdri_rel=hdri_rel, bg_vis_hex=bg_hex, bg_vis_str=bg_str)

    cd = bpy.data.cameras.new("Temp_W2_Cam")
    cd.lens = lens_mm
    cd.clip_start = 0.05
    cd.clip_end = 150.0
    co = bpy.data.objects.new("Temp_W2_Cam", cd)
    co.location = cam_pos
    co.rotation_euler = (Vector(cam_target) - Vector(cam_pos)).to_track_quat("-Z", "Y").to_euler()
    rig.objects.link(co)

    setup_fn(rig)

    sc = bpy.context.scene
    sc.camera = co
    sc.render.engine = "BLENDER_EEVEE"
    sc.render.resolution_x = width
    sc.render.resolution_y = height
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.filepath = tmp_png
    if hasattr(sc.eevee, "taa_render_samples"):
        sc.eevee.taa_render_samples = 40
    if hasattr(sc.eevee, "use_raytracing"):
        sc.eevee.use_raytracing = True
    if hasattr(sc.eevee, "use_shadows"):
        sc.eevee.use_shadows = True
    try:
        sc.view_settings.view_transform = "AgX"
        sc.view_settings.look = "AgX - Medium High Contrast"
        sc.view_settings.exposure = exposure
    except Exception:
        pass

    bpy.ops.render.render(write_still=True)

    img = bpy.data.images.load(tmp_png)
    arr = np.empty(width * height * 4, dtype=np.float32)
    img.pixels.foreach_get(arr)
    bpy.data.images.remove(img)
    arr = arr.reshape((height, width, 4))

    for o in list(rig.objects):
        dr = o.data
        bpy.data.objects.remove(o, do_unlink=True)
        if dr and dr.users == 0:
            if isinstance(dr, bpy.types.Light):
                bpy.data.lights.remove(dr)
            elif isinstance(dr, bpy.types.Camera):
                bpy.data.cameras.remove(dr)
            elif isinstance(dr, bpy.types.Mesh):
                bpy.data.meshes.remove(dr)
    bpy.data.collections.remove(rig)
    if hdri_img is not None:
        if bpy.context.scene.world and bpy.context.scene.world.use_nodes:
            bpy.context.scene.world.node_tree.nodes.clear()
        if hdri_img.users == 0:
            bpy.data.images.remove(hdri_img)
    return arr


def render_4x2_showcase(cols_dict, mats):
    """Renders all 8 Wave-2 assets into a 2400x1350 4x2 executive visual sign-off contact sheet."""
    all_cols = list(cols_dict.values())
    W_P, H_P = 600, 675

    def rig_rio(rc):
        add_light("Rio_SunsetKey", "SPOT", (2.8, 3.8, 6.8), (0.0, 0.0, 0.78), 8500.0, "#FFD894", rc, spot_deg=58.0, radius=0.8)
        add_light("Rio_WarmPool", "POINT", (0.0, 0.0, 4.2), None, 2600.0, "#FFCB7A", rc, radius=1.4, spec_factor=0.5)
        add_light("Rio_EmeraldRim", "POINT", (-3.8, 3.5, 2.8), None, 1650.0, "#7EF5C4", rc, radius=1.8, spec_factor=0.35)
        add_light("Rio_FrontFill", "POINT", (0.0, -4.4, 2.4), None, 1100.0, "#FFE5BA", rc, radius=1.8, spec_factor=0.2)

    def rig_reyk(rc):
        add_light("Reyk_AuroraTop", "SPOT", (0.0, 2.5, 7.6), (0.0, 0.0, 0.78), 7200.0, "#68F7D4", rc, spot_deg=60.0, radius=1.0)
        add_light("Reyk_TableWarm", "SPOT", (2.4, -2.8, 3.8), (0.0, 0.0, 0.78), 2400.0, "#FFE2AE", rc, spot_deg=54.0, radius=0.5)
        add_light("Reyk_MagmaBounce", "POINT", (-3.2, 1.5, 0.8), None, 950.0, "#FF8F3D", rc, radius=1.2, spec_factor=0.3)
        add_light("Reyk_MagmaBounceR", "POINT", (3.2, 1.5, 0.8), None, 950.0, "#FF8F3D", rc, radius=1.2, spec_factor=0.3)
        add_light("Reyk_FrontFill", "POINT", (0.0, -4.6, 2.5), None, 1250.0, "#B8DCFF", rc, radius=2.0, spec_factor=0.2)

    def rig_sg(rc):
        add_light("SG_TableKey", "SPOT", (1.8, -2.6, 4.4), (0.0, 0.0, 0.78), 3200.0, "#FFE4B3", rc, spot_deg=56.0, radius=0.5)
        add_light("SG_ChasmCyanL", "POINT", (-4.8, 0.5, -2.2), None, 2800.0, "#4AD8FF", rc, radius=1.6, spec_factor=0.5)
        add_light("SG_ChasmCyanR", "POINT", (4.8, 0.5, -2.2), None, 2800.0, "#4AD8FF", rc, radius=1.6, spec_factor=0.5)
        add_light("SG_SkyRim", "AREA", (0.0, 5.2, 3.2), (0.0, -1.0, 1.0), 1650.0, "#7EC4FF", rc, size=8.0, size_y=3.0, spec_factor=0.18)
        add_light("SG_FrontFill", "POINT", (-1.5, -4.2, 2.2), None, 950.0, "#D8E8FF", rc, radius=1.8, spec_factor=0.15)

    def rig_apex(rc):
        add_light("Apex_SpotL", "SPOT", (-3.2, -0.4, 5.4), (0.0, 0.0, 0.78), 6400.0, "#FFE4B0", rc, spot_deg=42.0, radius=0.5)
        add_light("Apex_SpotR", "SPOT", (3.2, -0.4, 5.4), (0.0, 0.0, 0.78), 6400.0, "#FFE4B0", rc, spot_deg=42.0, radius=0.5)
        add_light("Apex_StormRim", "AREA", (0.0, 6.8, 3.6), (0.0, -1.0, 1.2), 2600.0, "#7FB6FF", rc, size=9.0, size_y=3.2, spec_factor=0.25)
        add_light("Apex_GalleryFill", "POINT", (0.0, -4.8, 3.2), None, 1650.0, "#FFE0AC", rc, radius=2.2, spec_factor=0.22)

    def make_studio_relic_rig(key_hex="#FFE5B8", rim_hex="#8CC8FF", z_focus=0.48):
        def _fn(rc):
            bm_bg = bmesh.new()
            bm_add_lathe(bm_bg, [
                (0.01, -0.08), (6.5, -0.08), (6.5, 6.5), (6.1, 6.5),
                (6.1, 1.0), (5.5, 0.35), (4.6, 0.06), (3.6, 0.0), (0.01, 0.0),
            ], segs=40)
            finalize_obj("Relic_Studio_Cyc", bm_bg, mats["sg_slate"], rc, uv_scale=0.5)
            add_light("Rel_Key", "AREA", (1.65, -1.85, 1.65), (0.0, 0.0, z_focus), 210.0, key_hex, rc, size=1.1, spec_factor=0.55)
            add_light("Rel_Fill", "AREA", (-1.95, -1.45, 1.15), (0.0, 0.0, z_focus), 115.0, rim_hex, rc, size=1.5, spec_factor=0.22)
            add_light("Rel_Rim", "SPOT", (-0.85, 1.95, 1.75), (0.0, 0.0, z_focus), 320.0, "#FFD996", rc, spot_deg=50.0, radius=0.3, spec_factor=0.8)
        return _fn

    # Temporarily pose Passport at a regal 3/4 front-cover angle with Passport_Cover subtly cracked (-12 deg)
    # so the sculpted 3D embossed 24K-gold Meridian globe/laurel crest, brass corners, raised spine hubs,
    # gilded gold-leaf page edges, AND crimson silk bookmark ribbon all gleam heroically!
    pass_root = bpy.data.objects.get("Meridian_Passport_Root")
    pass_cov = bpy.data.objects.get("Passport_Cover")
    if pass_root and pass_cov:
        pass_root.location = (0.02, 0.0, 0.22)
        pass_root.rotation_euler = (math.radians(52.0), math.radians(14.0), math.radians(-24.0))
        pass_cov.rotation_euler = (0.0, math.radians(-12.0), 0.0)

    with tempfile.TemporaryDirectory() as tmpdir:
        # Top Row: 4 Real 3D Venues
        p0 = render_panel(
            cols_dict["rio"], all_cols,
            cam_pos=(0.0, -5.65, 1.95), cam_target=(0.0, 1.40, 2.85), lens_mm=20.0,
            hdri_rel="godot/assets/polyhaven/hdris/evening_museum_courtyard.hdr",
            bg_hex="#18382E", bg_str=0.85, env_str=0.55, exposure=-0.04, setup_fn=rig_rio,
            tmp_png=os.path.join(tmpdir, "p0.png"), width=W_P, height=H_P,
        )
        p1 = render_panel(
            cols_dict["reyk"], all_cols,
            cam_pos=(0.0, -5.65, 1.95), cam_target=(0.0, 1.50, 2.75), lens_mm=20.0,
            hdri_rel="godot/assets/polyhaven/hdris/blue_lagoon_night.hdr",
            bg_hex="#0C2C34", bg_str=0.85, env_str=0.55, exposure=0.05, setup_fn=rig_reyk,
            tmp_png=os.path.join(tmpdir, "p1.png"), width=W_P, height=H_P,
        )
        p2 = render_panel(
            cols_dict["sg"], all_cols,
            cam_pos=(-1.35, -5.25, 2.15), cam_target=(0.25, 1.85, 1.55), lens_mm=20.5,
            hdri_rel="godot/assets/polyhaven/hdris/dresden_station_night.hdr",
            bg_hex="#071326", bg_str=0.45, env_str=0.48, exposure=0.08, setup_fn=rig_sg,
            tmp_png=os.path.join(tmpdir, "p2.png"), width=W_P, height=H_P,
        )
        p3 = render_panel(
            cols_dict["apex"], all_cols,
            cam_pos=(0.0, -5.85, 2.25), cam_target=(0.0, 1.45, 2.65), lens_mm=19.5,
            hdri_rel="godot/assets/polyhaven/hdris/blue_lagoon_night.hdr",
            bg_hex="#0B182E", bg_str=0.65, env_str=0.52, exposure=0.02, setup_fn=rig_apex,
            tmp_png=os.path.join(tmpdir, "p3.png"), width=W_P, height=H_P,
        )

        # Bottom Row: 3 Bespoke Boss Relics + 3D Diplomatic Passport
        p4 = render_panel(
            cols_dict["cryo"], all_cols,
            cam_pos=(0.95, -1.65, 0.72), cam_target=(0.0, 0.0, 0.48), lens_mm=50.0,
            hdri_rel="godot/assets/polyhaven/hdris/studio_small_09.hdr",
            bg_hex="#080E18", bg_str=0.28, env_str=0.62, exposure=0.08,
            setup_fn=make_studio_relic_rig("#FFE6BA", "#5CE8FF", 0.48),
            tmp_png=os.path.join(tmpdir, "p4.png"), width=W_P, height=H_P,
        )
        p5 = render_panel(
            cols_dict["seal"], all_cols,
            cam_pos=(0.68, -1.72, 0.66), cam_target=(0.0, 0.0, 0.47), lens_mm=50.0,
            hdri_rel="godot/assets/polyhaven/hdris/studio_small_09.hdr",
            bg_hex="#080E18", bg_str=0.28, env_str=0.62, exposure=0.08,
            setup_fn=make_studio_relic_rig("#FFE5B8", "#94C8FF", 0.47),
            tmp_png=os.path.join(tmpdir, "p5.png"), width=W_P, height=H_P,
        )
        p6 = render_panel(
            cols_dict["ledger"], all_cols,
            cam_pos=(0.92, -1.68, 0.74), cam_target=(0.0, 0.0, 0.49), lens_mm=50.0,
            hdri_rel="godot/assets/polyhaven/hdris/studio_small_09.hdr",
            bg_hex="#080E18", bg_str=0.28, env_str=0.62, exposure=0.08,
            setup_fn=make_studio_relic_rig("#FFE6B8", "#88BAFF", 0.49),
            tmp_png=os.path.join(tmpdir, "p6.png"), width=W_P, height=H_P,
        )
        p7 = render_panel(
            cols_dict["passport"], all_cols,
            cam_pos=(0.36, -0.92, 0.52), cam_target=(0.01, 0.0, 0.22), lens_mm=54.0,
            hdri_rel="godot/assets/polyhaven/hdris/studio_small_09.hdr",
            bg_hex="#080E18", bg_str=0.28, env_str=0.65, exposure=0.12,
            setup_fn=make_studio_relic_rig("#FFE6B8", "#9AC8FF", 0.22),
            tmp_png=os.path.join(tmpdir, "p7.png"), width=W_P, height=H_P,
        )

    # Restore Passport rest pose cleanly!
    if pass_root and pass_cov:
        pass_root.location = (0.0, 0.0, 0.0)
        pass_root.rotation_euler = (0.0, 0.0, 0.0)
        pass_cov.rotation_euler = (0.0, 0.0, 0.0)

    for c in all_cols:
        c.hide_viewport = False
        c.hide_render = False

    # Composite 4x2 contact sheet (2400 x 1350)
    full = np.ones((H_P * 2, W_P * 4, 4), dtype=np.float32)
    top_panels = [p0, p1, p2, p3]
    bot_panels = [p4, p5, p6, p7]
    for ci in range(4):
        full[H_P:H_P * 2, ci * W_P:(ci + 1) * W_P, :] = top_panels[ci]
        full[0:H_P, ci * W_P:(ci + 1) * W_P, :] = bot_panels[ci]

    gold = np.array([0.85, 0.68, 0.33, 1.0], dtype=np.float32)
    full[H_P - 2:H_P + 2, :, :] = gold
    for ci in (1, 2, 3):
        full[:, ci * W_P - 2:ci * W_P + 2, :] = gold
    full[0:2, :, :] = gold
    full[-2:, :, :] = gold
    full[:, 0:2, :] = gold
    full[:, -2:, :] = gold

    top_labels = [
        "RIO - BOTANICAL CANOPY",
        "REYKJAVIK - BASALT CALDERA",
        "SINGAPORE - SKYBRIDGE CORE",
        "APEX FORUM - CITADEL",
    ]
    bot_labels = [
        "RELIC - CRYO CORE RELAY",
        "RELIC - FRACTURED SEAL",
        "RELIC - MASTER LEDGER",
        "3D DIPLOMATIC PASSPORT",
    ]
    for ci in range(4):
        stamp_caption_bar(full, top_labels[ci], ci * W_P + 14, H_P + 14, scale=2)
        stamp_caption_bar(full, bot_labels[ci], ci * W_P + 14, 14, scale=2)

    out_img = bpy.data.images.new("Wave2_Venues_Relics_ContactSheet", width=W_P * 4, height=H_P * 2, alpha=False, float_buffer=False)
    out_img.pixels.foreach_set(np.clip(full, 0.0, 1.0).ravel())
    out_img.filepath_raw = OUT_RENDER_PATH
    out_img.file_format = "PNG"
    out_img.save()
    bpy.data.images.remove(out_img)


# ===========================================================================
# Main Orchestrator
# ===========================================================================
def main():
    log_lines = []
    def log(msg: str):
        print(msg, flush=True)
        log_lines.append(msg)

    try:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        log(f"=== World's Smartest Wave-2 AAA Venues, Relics & 3D Passport Pipeline | Blender {bpy.app.version_string} ===")

        textures = build_procedural_textures()
        mats = build_material_library(textures)
        log(f"Procedural PBR textures packed: {len(textures)} | Materials built: {len(mats)}")

        builders = [
            ("rio",      "rio_canopy_room.glb",          45000, build_rio_canopy_room),
            ("reyk",     "reykjavik_caldera_room.glb",   45000, build_reykjavik_caldera_room),
            ("sg",       "singapore_skybridge_room.glb", 38000, build_singapore_skybridge_room),
            ("apex",     "apex_forum_room.glb",          50000, build_apex_forum_room),
            ("cryo",     "relic_reykjavik_cryo.glb",     28000, build_relic_reykjavik_cryo),
            ("seal",     "relic_singapore_seal.glb",     28000, build_relic_singapore_seal),
            ("ledger",   "relic_apex_ledger.glb",        28000, build_relic_apex_ledger),
            ("passport", "meridian_passport_3d.glb",     28000, build_meridian_passport_3d),
        ]

        cols_dict = {}
        summary = []

        for key, glb_name, budget_tris, fn in builders:
            col, root = fn(mats)
            cols_dict[key] = col
            bpy.context.view_layer.update()
            tris, g_min, g_max, mat_names, node_names = get_asset_stats(root)
            out_p, fsize, glb_info = export_glb(root, col, glb_name)
            rec = {
                "file": glb_name,
                "tris": tris,
                "budget_tris": budget_tris,
                "within_budget": tris <= budget_tris,
                "glb_tris": glb_info["glb_tris"] if glb_info else tris,
                "bytes": fsize,
                "kb": round(fsize / 1024.0, 1),
                "gltf_min_xyz": g_min,
                "gltf_max_xyz": g_max,
                "materials": mat_names,
                "nodes": node_names,
                "glb_info": glb_info,
            }
            summary.append(rec)
            status = "OK" if tris <= budget_tris else "OVER_BUDGET"
            log(
                f"[{status:11s}] {glb_name:30s} | tris={tris:6d}/{budget_tris:6d} | "
                f"size={rec['kb']:7.1f} KB | glTF_AABB={g_min}..{g_max} | mats={len(mat_names)}"
            )

        bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND_PATH)
        log(f"[BLEND      ] {OUT_BLEND_PATH} ({os.path.getsize(OUT_BLEND_PATH)/1024.0:.1f} KB)")

        log("Rendering 2400x1350 4x2 showcase contact sheet...")
        render_4x2_showcase(cols_dict, mats)
        log(f"[RENDER     ] {OUT_RENDER_PATH} ({os.path.getsize(OUT_RENDER_PATH)/1024.0:.1f} KB)")

        log("=== SUMMARY JSON ===")
        log(json.dumps(summary, indent=2))
        log("=== WAVE-2 VENUES, RELICS & PASSPORT COMPLETE OK ===")

    except Exception:
        log("!!! BUILD FAILED !!!")
        log(traceback.format_exc())
    finally:
        with open(OUT_LOG_PATH, "w", encoding="utf-8") as f:
            f.write("\n".join(log_lines) + "\n")


if __name__ == "__main__":
    main()
