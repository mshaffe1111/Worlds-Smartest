"""
World's Smartest — AAA 3D Global Venue Interiors & 19th-Century Meridian World Globe
Authored for Blender 5.3.0 (bpy / bmesh) — Godot 4.7.2 AAA Rebuild.

Builds, UV-unwraps, saves master .blend, exports 4 self-contained PBR .glb assets,
and renders a crisp 1920x1080 2x2 architectural hero contact sheet:
  1. godot/assets/aaa_models/london_rotunda_room.glb
  2. godot/assets/aaa_models/tokyo_pavilion_room.glb
  3. godot/assets/aaa_models/cairo_solar_hall.glb
  4. godot/assets/aaa_models/meridian_world_globe.glb
  5. assets/blender/aaa_world_venues.blend
  6. assets/renders/aaa_world_venues_render.png
  7. assets/renders/world_venues_blender.log  (completion sentinel)

Invocation (PowerShell):
  & "$env:LOCALAPPDATA\Microsoft\WindowsApps\blender-launcher.exe" --background --python tools\blender\build_world_venues_and_globe.py
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
# Paths (Strict File Ownership)
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

OUT_GLB_DIR = os.path.join(REPO_ROOT, "godot", "assets", "aaa_models")
OUT_BLEND_PATH = os.path.join(REPO_ROOT, "assets", "blender", "aaa_world_venues.blend")
OUT_RENDER_PATH = os.path.join(REPO_ROOT, "assets", "renders", "aaa_world_venues_render.png")
OUT_GLOBE_V2_RENDER_PATH = os.path.join(REPO_ROOT, "assets", "renders", "meridian_globe_v2_render.png")
OUT_LOG_PATH = os.path.join(REPO_ROOT, "assets", "renders", "world_venues_blender.log")

for d in (OUT_GLB_DIR, os.path.dirname(OUT_BLEND_PATH), os.path.dirname(OUT_RENDER_PATH)):
    os.makedirs(d, exist_ok=True)


# ---------------------------------------------------------------------------
# Color & Image Helpers
# ---------------------------------------------------------------------------
def srgb_to_linear(hex_str: str):
    h = hex_str.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), 1.0)


def hex_rgb(hex_str: str):
    h = hex_str.lstrip("#")
    return tuple(int(h[i:i + 2], 16) / 255.0 for i in (0, 2, 4))


def strip_jpeg_non_jfif_app_markers(raw_jpg: bytes) -> bytes:
    """Strips Blender 5.3.0 APP1 'NeoGeo' & APP2 'ICC_PROFILE' markers for Godot 4.7.2 libjpeg_turbo."""
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
        if m == 0xDA:  # Start of Scan — copy rest verbatim
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
        # Keep JFIF APP0 (0xE0); drop APP1..APP15 (0xE1..0xEF, incl. Blender NeoGeo & ICC_PROFILE)
        if not (0xE1 <= m <= 0xEF):
            out.extend(raw_jpg[pos:seg_end])
        pos = seg_end
    return bytes(out)


def create_packed_image(name: str, rgba: np.ndarray, is_data: bool = False, use_jpeg: bool = True, quality: int = 88):
    """
    Creates a real packed Blender image from an (H, W, 4) float32 array in [0, 1].
    Saves cleanly as compact JPEG (stripping Blender 5.3.0 APP1/APP2 markers for Godot 4.7.2
    libjpeg_turbo compatibility), loads as FILE, sets colorspace, and packs cleanly!
    """
    h, w, _ = rgba.shape
    clamped = np.clip(rgba, 0.0, 1.0).astype(np.float32)
    ext = "jpg" if use_jpeg else "png"
    tmp_path = os.path.join(tempfile.gettempdir(), f"ws_pbr_{name}.{ext}")
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
    """Converts a tileable 2D heightfield (H, W) in [0, 1] into a tangent-space normal RGBA."""
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
    """Generates a seamless 2D fractional Brownian motion field in [0, 1] via FFT."""
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


# ---------------------------------------------------------------------------
# Procedural PBR Texture Library (Seamless Architectural + 2048x1024 Globe)
# ---------------------------------------------------------------------------
def build_procedural_textures():
    """Generates rich seamless architectural PBR textures + museum terrestrial globe map."""
    tex = {}
    rng = np.random.default_rng(20261121)
    S = 256

    # 1. Brushed Antique Brass (anisotropic horizontal grain)
    brush = fft_fbm(rng, S, S, octaves=((240.0, 0.45), (42.0, 0.35), (6.0, 0.20)), aniso=(3.2, 0.25))
    patina = fft_fbm(rng, S, S, octaves=((90.0, 0.65), (20.0, 0.35)))
    brass_rough = np.clip(0.18 + 0.14 * brush + 0.08 * patina, 0.12, 0.45)
    tex["brass_rough"] = create_packed_image("Tex_Brass_Rough", make_gray_rgba(brass_rough), is_data=True)
    tex["brass_norm"] = create_packed_image("Tex_Brass_Norm", height_to_normal_rgba(brush, 0.75), is_data=True)

    # 2. Herringbone Parquet Oak (London Rotunda floor)
    yy, xx = np.mgrid[0:S, 0:S].astype(np.float32) / S
    tiles = 8.0
    u_t = xx * tiles
    v_t = yy * tiles
    # Classic 90-deg herringbone grid (4x1 plank aspect in staggered chevron)
    iu = np.floor(u_t).astype(np.int32)
    iv = np.floor(v_t).astype(np.int32)
    fu = u_t - iu
    fv = v_t - iv
    # Alternate horizontal & vertical planks cleanly on diagonal parity
    diag = (iu + iv) & 1
    # Plank ID & local coordinates
    plank_id_a = ((iu // 2) * 31 + iv * 17) % 97
    plank_id_b = (iu * 23 + (iv // 2) * 41) % 97
    plank_id = np.where(diag == 0, plank_id_a, plank_id_b).astype(np.float32) / 97.0
    # Micro seam grooves between planks
    seam_u = np.minimum(fu, 1.0 - fu)
    seam_v = np.minimum(fv, 1.0 - fv)
    # 2-cell long plank seams
    seam_a = np.minimum(seam_v, np.where((iu & 1) == 0, fu, 1.0 - fu))
    seam_b = np.minimum(seam_u, np.where((iv & 1) == 0, fv, 1.0 - fv))
    seam_d = np.where(diag == 0, seam_a, seam_b)
    groove = np.clip(seam_d / 0.045, 0.0, 1.0)
    grain_h = fft_fbm(rng, S, S, octaves=((120.0, 0.5), (18.0, 0.5)), aniso=(0.35, 3.6))
    grain_v = fft_fbm(rng, S, S, octaves=((120.0, 0.5), (18.0, 0.5)), aniso=(3.6, 0.35))
    grain = np.where(diag == 0, grain_h, grain_v)
    tone = 0.72 + 0.24 * plank_id + 0.14 * (grain - 0.5)
    tone *= (0.42 + 0.58 * groove)
    parq_col = np.ones((S, S, 4), dtype=np.float32)
    parq_col[:, :, 0] = np.clip(0.36 * tone, 0.0, 1.0)
    parq_col[:, :, 1] = np.clip(0.22 * tone, 0.0, 1.0)
    parq_col[:, :, 2] = np.clip(0.11 * tone, 0.0, 1.0)
    parq_rough = np.clip(0.26 + 0.14 * grain + 0.28 * (1.0 - groove), 0.18, 0.72)
    parq_h = 0.72 * groove + 0.28 * grain
    tex["parquet_col"] = create_packed_image("Tex_Parquet_Col", parq_col, is_data=False)
    tex["parquet_rough"] = create_packed_image("Tex_Parquet_Rough", make_gray_rgba(parq_rough), is_data=True)
    tex["parquet_norm"] = create_packed_image("Tex_Parquet_Norm", height_to_normal_rgba(parq_h, 1.35), is_data=True)

    # 3. Dark Smoked Walnut Cathedral Wood Grain (London Oak/Walnut, Tables, Globe Stand)
    w_warp = fft_fbm(rng, S, S, octaves=((360.0, 0.65), (90.0, 0.35)))
    w_rings = np.sin((yy * 18.0 + w_warp * 4.5) * math.pi * 2.0) * 0.5 + 0.5
    w_fine = fft_fbm(rng, S, S, octaves=((160.0, 0.5), (20.0, 0.5)), aniso=(0.25, 3.8))
    w_val = 0.52 * w_rings + 0.48 * w_fine
    wal_col = np.ones((S, S, 4), dtype=np.float32)
    wal_col[:, :, 0] = np.clip(0.12 + 0.18 * w_val, 0.0, 1.0)
    wal_col[:, :, 1] = np.clip(0.065 + 0.105 * w_val, 0.0, 1.0)
    wal_col[:, :, 2] = np.clip(0.038 + 0.055 * w_val, 0.0, 1.0)
    wal_rough = np.clip(0.22 + 0.16 * w_fine, 0.15, 0.52)
    tex["walnut_col"] = create_packed_image("Tex_Walnut_Col", wal_col, is_data=False)
    tex["walnut_rough"] = create_packed_image("Tex_Walnut_Rough", make_gray_rgba(wal_rough), is_data=True)
    tex["walnut_norm"] = create_packed_image("Tex_Walnut_Norm", height_to_normal_rgba(w_val, 0.90), is_data=True)

    # 4. Warm Roman Travertine / Egyptian Limestone Strata
    tr_strata = np.sin((yy * 14.0 + fft_fbm(rng, S, S, octaves=((420.0, 0.7), (80.0, 0.3))) * 2.8) * math.pi * 2.0) * 0.5 + 0.5
    tr_pores = fft_fbm(rng, S, S, octaves=((180.0, 0.40), (36.0, 0.35), (6.0, 0.25)), aniso=(0.55, 1.8))
    tr_pit = np.clip((tr_pores - 0.18) / 0.82, 0.0, 1.0)
    tr_mix = 0.55 * tr_strata + 0.45 * tr_pit
    tr_col = np.ones((S, S, 4), dtype=np.float32)
    tr_col[:, :, 0] = np.clip(0.68 + 0.19 * tr_mix, 0.0, 1.0)
    tr_col[:, :, 1] = np.clip(0.59 + 0.18 * tr_mix, 0.0, 1.0)
    tr_col[:, :, 2] = np.clip(0.45 + 0.16 * tr_mix, 0.0, 1.0)
    tr_rough = np.clip(0.42 + 0.28 * (1.0 - tr_pit), 0.32, 0.78)
    tex["trav_col"] = create_packed_image("Tex_Travertine_Col", tr_col, is_data=False)
    tex["trav_rough"] = create_packed_image("Tex_Travertine_Rough", make_gray_rgba(tr_rough), is_data=True)
    tex["trav_norm"] = create_packed_image("Tex_Travertine_Norm", height_to_normal_rgba(tr_mix, 1.35), is_data=True)

    # 5. Warm Desert Carved Limestone (slightly richer ochre-sandstone for Cairo)
    ls_col = np.ones((S, S, 4), dtype=np.float32)
    ls_col[:, :, 0] = np.clip(0.60 + 0.20 * tr_mix, 0.0, 1.0)
    ls_col[:, :, 1] = np.clip(0.47 + 0.18 * tr_mix, 0.0, 1.0)
    ls_col[:, :, 2] = np.clip(0.31 + 0.14 * tr_mix, 0.0, 1.0)
    tex["limestone_col"] = create_packed_image("Tex_Limestone_Col", ls_col, is_data=False)

    # 6. Veined Dark Nero Marquina Marble (Tabletops & Inlays)
    m_turb = fft_fbm(rng, S, S, octaves=((260.0, 0.55), (55.0, 0.30), (12.0, 0.15)))
    m_turb2 = fft_fbm(rng, S, S, octaves=((190.0, 0.5), (30.0, 0.5)))
    vein1 = np.abs(np.sin((xx * 3.0 + yy * 2.0 + m_turb * 3.8) * math.pi))
    vein1 = np.power(np.clip(1.0 - vein1, 0.0, 1.0), 14.0)
    vein2 = np.abs(np.sin((xx * 5.0 - yy * 3.0 + m_turb2 * 4.5) * math.pi))
    vein2 = np.power(np.clip(1.0 - vein2, 0.0, 1.0), 18.0)
    dm_col = np.ones((S, S, 4), dtype=np.float32)
    dm_col[:, :, 0] = np.clip(0.055 + 0.04 * m_turb + 0.52 * vein1 + 0.62 * vein2, 0.0, 1.0)
    dm_col[:, :, 1] = np.clip(0.060 + 0.04 * m_turb + 0.48 * vein1 + 0.48 * vein2, 0.0, 1.0)
    dm_col[:, :, 2] = np.clip(0.072 + 0.04 * m_turb + 0.44 * vein1 + 0.24 * vein2, 0.0, 1.0)
    dm_rough = np.clip(0.14 + 0.12 * m_turb + 0.10 * vein1, 0.09, 0.34)
    tex["dark_marble_col"] = create_packed_image("Tex_DarkMarble_Col", dm_col, is_data=False)
    tex["dark_marble_rough"] = create_packed_image("Tex_DarkMarble_Rough", make_gray_rgba(dm_rough), is_data=True)
    tex["dark_marble_norm"] = create_packed_image("Tex_DarkMarble_Norm", height_to_normal_rgba(0.6 * m_turb + 0.4 * vein1, 0.38), is_data=True)

    # 7. Cream Calacatta Marble (London Floor Medallion)
    lm_col = np.ones((S, S, 4), dtype=np.float32)
    lm_col[:, :, 0] = np.clip(0.86 - 0.10 * m_turb - 0.24 * vein1, 0.0, 1.0)
    lm_col[:, :, 1] = np.clip(0.83 - 0.10 * m_turb - 0.25 * vein1, 0.0, 1.0)
    lm_col[:, :, 2] = np.clip(0.77 - 0.10 * m_turb - 0.28 * vein1, 0.0, 1.0)
    tex["light_marble_col"] = create_packed_image("Tex_LightMarble_Col", lm_col, is_data=False)

    # 8. Warm Hinoki Japanese Cypress Wood (Tokyo Kumiko & Ceiling Fins)
    hi_fine = fft_fbm(rng, S, S, octaves=((200.0, 0.45), (30.0, 0.55)), aniso=(0.2, 4.5))
    hi_col = np.ones((S, S, 4), dtype=np.float32)
    hi_col[:, :, 0] = np.clip(0.68 + 0.16 * hi_fine, 0.0, 1.0)
    hi_col[:, :, 1] = np.clip(0.51 + 0.14 * hi_fine, 0.0, 1.0)
    hi_col[:, :, 2] = np.clip(0.32 + 0.10 * hi_fine, 0.0, 1.0)
    tex["hinoki_col"] = create_packed_image("Tex_Hinoki_Col", hi_col, is_data=False)
    tex["hinoki_norm"] = create_packed_image("Tex_Hinoki_Norm", height_to_normal_rgba(hi_fine, 0.65), is_data=True)

    # 9. Architectural Basalt-Granite Slate (Tokyo Floor & Origami Panels)
    sl_n = fft_fbm(rng, S, S, octaves=((180.0, 0.45), (40.0, 0.35), (8.0, 0.20)))
    sl_col = np.ones((S, S, 4), dtype=np.float32)
    sl_col[:, :, 0] = np.clip(0.085 + 0.065 * sl_n, 0.0, 1.0)
    sl_col[:, :, 1] = np.clip(0.095 + 0.070 * sl_n, 0.0, 1.0)
    sl_col[:, :, 2] = np.clip(0.115 + 0.075 * sl_n, 0.0, 1.0)
    sl_rough = np.clip(0.28 + 0.22 * sl_n, 0.18, 0.58)
    tex["slate_col"] = create_packed_image("Tex_Slate_Col", sl_col, is_data=False)
    tex["slate_rough"] = create_packed_image("Tex_Slate_Rough", make_gray_rgba(sl_rough), is_data=True)
    tex["slate_norm"] = create_packed_image("Tex_Slate_Norm", height_to_normal_rgba(sl_n, 0.95), is_data=True)

    # 10. Pebbled Executive Leather (London Table Blotter)
    le_n = fft_fbm(rng, S, S, octaves=((40.0, 0.30), (6.0, 0.45), (1.8, 0.25)))
    le_col = np.ones((S, S, 4), dtype=np.float32)
    le_col[:, :, 0] = np.clip(0.14 + 0.07 * le_n, 0.0, 1.0)
    le_col[:, :, 1] = np.clip(0.075 + 0.045 * le_n, 0.0, 1.0)
    le_col[:, :, 2] = np.clip(0.048 + 0.030 * le_n, 0.0, 1.0)
    tex["leather_col"] = create_packed_image("Tex_Leather_Col", le_col, is_data=False)
    tex["leather_norm"] = create_packed_image("Tex_Leather_Norm", height_to_normal_rgba(le_n, 1.1), is_data=True)

    # 11. 1536x768 Museum 19th-Century Terrestrial Globe PBR Map (Obsidian Oceans + Embossed Antique-Gold Continents!)
    globe_maps = build_terrestrial_globe_textures(rng)
    tex.update(globe_maps)

    return tex


def _rasterize_polygon_mask(lon_grid, lat_grid, poly_lonlat):
    """Vectorized ray-casting point-in-polygon over equirectangular (lon, lat) grids."""
    inside = np.zeros(lon_grid.shape, dtype=bool)
    n = len(poly_lonlat)
    j = n - 1
    for i in range(n):
        xi, yi = poly_lonlat[i]
        xj, yj = poly_lonlat[j]
        cond = ((yi > lat_grid) != (yj > lat_grid)) & (
            lon_grid < (xj - xi) * (lat_grid - yi) / ((yj - yi) + 1e-12) + xi
        )
        inside ^= cond
        j = i
    return inside


def build_terrestrial_globe_textures(rng):
    """
    Generates a crisp 2048x1024 prestige cinema war-room terrestrial globe PBR texture suite:
    - Deep royal observatory sapphire oceans with glowing continental-shelf bathymetry & golden rhumb webs
    - Richly embossed metallic 24K burnished-gold continents with crisp coastlines, peninsulas & sculpted mountain relief
    - Precision engraved 15-degree graticule, double-ruled Equator/Prime Meridian, dashed Tropics, and 4 Compass Roses
    """
    W, H = 2048, 1024
    # Blender UV v=0 at bottom (-90 deg South), v=1 at top (+90 deg North)
    lons = np.linspace(-180.0, 180.0, W, endpoint=False, dtype=np.float32)
    lats = np.linspace(-90.0, 90.0, H, dtype=np.float32)
    lon_g, lat_g = np.meshgrid(lons, lats)

    # Fine multi-octave geographic coastline perturbation for crisp bays, fjords & peninsulas
    warp_lon = (fft_fbm(rng, H, W, octaves=((240.0, 0.50), (55.0, 0.32), (12.0, 0.18))) - 0.5) * 3.4
    warp_lat = (fft_fbm(rng, H, W, octaves=((240.0, 0.50), (55.0, 0.32), (12.0, 0.18))) - 0.5) * 2.6
    wlon = lon_g + warp_lon
    wlat = lat_g + warp_lat

    # High-fidelity continent, peninsula & major archipelago polygons (lon, lat in degrees)
    continents = [
        # North & Central America (incl. Alaska, Hudson Bay indent, Baja, Florida, Yucatan)
        [(-166, 60), (-162, 68), (-142, 70), (-125, 70), (-110, 68), (-94, 69), (-90, 62),
         (-94, 57), (-84, 53), (-79, 55), (-78, 62), (-64, 60), (-55, 52), (-60, 45),
         (-70, 42), (-75, 35), (-81, 30), (-80, 25), (-82.5, 25.5), (-84, 30), (-90, 29),
         (-97, 26), (-97, 19), (-90, 21), (-87, 21), (-88, 16), (-84, 10), (-78, 8),
         (-82, 9), (-92, 14), (-105, 19), (-109, 25), (-112, 31), (-110, 23), (-112, 24),
         (-117, 32), (-122, 37), (-124, 48), (-135, 57), (-150, 60), (-162, 55)],
        # Greenland & Baffin Island
        [(-52, 60), (-42, 60), (-32, 68), (-18, 76), (-22, 82), (-46, 83), (-66, 78), (-56, 68)],
        [(-84, 73), (-68, 72), (-62, 64), (-74, 63), (-82, 68)],
        # South America
        [(-80, 9), (-72, 11), (-62, 10), (-50, 2), (-35, -6), (-38, -14), (-41, -22),
         (-48, -26), (-53, -34), (-64, -41), (-67, -54), (-74, -52), (-73, -40),
         (-71, -30), (-71, -18), (-81, -5), (-78, 2)],
        # Eurasia (with distinct Iberia, Italy boot, Greece, Anatolia, Arabia, India, Indochina, Korea, Kamchatka!)
        [(-9, 37), (-9, 43), (-2, 43), (-4, 48), (2, 51), (8, 54), (10, 58), (6, 61),
         (15, 68), (28, 71), (42, 67), (58, 70), (74, 72), (102, 77), (138, 73), (170, 66),
         (176, 62), (163, 59), (160, 51), (156, 52), (154, 59), (141, 54), (135, 44),
         (129, 35), (126, 35), (125, 40), (120, 39), (122, 31), (118, 24), (109, 20),
         (109, 11), (104, 10), (101, 13), (103, 2), (100, 6), (97, 16), (90, 22),
         (80, 14), (77, 8), (72, 20), (66, 25), (56, 26), (50, 30), (55, 24), (59, 22),
         (52, 16), (44, 13), (38, 22), (35, 29), (36, 36), (27, 37), (26, 40), (23, 37),
         (20, 40), (13, 45), (17, 40), (15, 38), (12, 41), (8, 44), (3, 42), (-5, 36)],
        # UK & Ireland & Iceland
        [(-6, 50), (1.5, 51), (0, 54), (-2, 58), (-6, 58), (-5, 54)],
        [(-10, 51.5), (-6, 52), (-6, 55), (-9.5, 55)],
        [(-24, 63.8), (-13.5, 64), (-14.5, 66.5), (-23.5, 66.5)],
        # Africa (with distinct Horn of Africa & Gulf of Guinea!)
        [(-17, 15), (-13, 28), (-6, 35), (3, 37), (11, 37), (15, 32), (25, 32), (32, 31),
         (38, 21), (43, 12), (51, 11), (46, 2), (40, -5), (40, -15), (35, -24), (28, -33),
         (19, -35), (15, -26), (12, -16), (11, -6), (9, 4), (2, 6), (-8, 5), (-16, 11)],
        # Madagascar & Sri Lanka
        [(44, -25), (47, -25), (50, -13), (48, -12), (44, -19)],
        [(79.5, 6), (81.8, 7), (80.5, 9.8), (79.6, 8)],
        # Japan (Kyushu, Honshu, Hokkaido) & Taiwan
        [(130, 31), (136, 34), (141, 36), (141, 41), (139, 39), (131, 34)],
        [(140, 42), (145.5, 43.5), (144, 45.2), (141, 45), (140, 42.5)],
        [(120, 22), (122, 25), (121.5, 25.3), (120.2, 23)],
        # SE Asia Archipelago (Philippines, Borneo, Sumatra, Java, Sulawesi, New Guinea)
        [(120, 14), (123, 18.5), (126, 8), (122, 7)],
        [(109, -3), (117, -3), (118.5, 5.5), (114, 6), (109, 1)],
        [(95, 5), (105, -6), (103, -6), (95, 3)],
        [(106, -6.5), (115, -8.5), (114, -7), (106, -6)],
        [(119, -5), (122, -4), (125, 1.5), (120, 0.5)],
        [(132, -2), (141, -3), (150, -10), (144, -9), (136, -5)],
        # Australia & Tasmania
        [(114, -22), (122, -17), (131, -12), (136, -12), (142, -11), (146, -18),
         (153, -27), (150, -37), (141, -38), (135, -34), (124, -34), (115, -34), (113, -26)],
        [(144.5, -41), (148.2, -41), (147, -43.5), (145, -43)],
        # New Zealand (North & South Islands)
        [(172.5, -35), (178, -37.5), (175, -41.2), (173.5, -38.5)],
        [(166.5, -46), (171, -44), (174, -41), (171, -42), (166.5, -45)],
        # Cuba / Hispaniola
        [(-84.5, 22), (-74.2, 20), (-75.2, 21.6), (-83.5, 23)],
        [(-74, 18.2), (-68.5, 18.4), (-69.5, 19.9), (-73.5, 19.6)],
        # Antarctica
        [(-180, -72), (-130, -74), (-75, -72), (-60, -64), (-45, -75), (0, -70),
         (50, -68), (110, -67), (165, -72), (180, -72), (180, -90), (-180, -90)],
    ]

    land_mask = np.zeros((H, W), dtype=bool)
    for poly in continents:
        land_mask |= _rasterize_polygon_mask(wlon, wlat, poly)

    # Anti-aliased crisp coastline + continental-shelf bathymetry glow via FFT Gaussian blur
    land_f = land_mask.astype(np.float32)
    fx = np.fft.fftfreq(W)[None, :]
    fy = np.fft.fftfreq(H)[:, None]
    r2 = fx * fx + fy * fy
    f_land = np.fft.fft2(land_f)
    land_aa = np.clip(np.real(np.fft.ifft2(f_land * np.exp(-r2 * 14.0))), 0.0, 1.0)
    coast_wide = np.clip(np.real(np.fft.ifft2(f_land * np.exp(-r2 * 2600.0))), 0.0, 1.0)
    coast_mid = np.clip(np.real(np.fft.ifft2(f_land * np.exp(-r2 * 520.0))), 0.0, 1.0)
    coast_tight = np.clip(np.real(np.fft.ifft2(f_land * np.exp(-r2 * 90.0))), 0.0, 1.0)

    # Raised embossed bevel rim right along every coastline + royal sapphire bathymetry contours
    shore_bevel = np.clip(1.0 - np.abs(land_aa - 0.5) * 4.2, 0.0, 1.0)
    bathy_wave = np.power(np.sin(coast_wide * math.pi * 9.0) * 0.5 + 0.5, 2.0)
    bathy_ring = (1.0 - land_aa) * np.clip(coast_wide * 2.4, 0.0, 1.0) * (1.0 - coast_mid * 0.7) * bathy_wave
    shelf_glow = (1.0 - land_aa) * np.clip(coast_mid * 1.45, 0.0, 1.0)

    # Rich embossed continental mountain ridges & plateaus
    topo_macro = fft_fbm(rng, H, W, octaves=((260.0, 0.50), (50.0, 0.35), (12.0, 0.15)))
    topo_crisp = fft_fbm(rng, H, W, octaves=((36.0, 0.50), (6.0, 0.50)))
    # Emphasize major iconic mountain belts (Andes, Rockies, Alps, Himalayas, East African Rift)
    mtn_belts = np.zeros((H, W), dtype=np.float32)
    for (mlon, mlat, slon, slat, amp) in [
        (-70.0, -22.0, 5.5, 22.0, 0.9),   # Andes
        (-112.0, 45.0, 10.0, 14.0, 0.75), # Rockies
        (11.0, 46.5, 9.0, 3.8, 0.85),    # Alps
        (84.0, 31.0, 18.0, 7.5, 1.0),    # Himalayas / Tibetan Plateau
        (36.0, 3.0, 6.0, 14.0, 0.7),     # East African Rift / Ethiopian Highlands
        (60.0, 60.0, 4.5, 12.0, 0.65),   # Urals
    ]:
        g_m = np.exp(-(((lon_g - mlon) / slon) ** 2 + ((lat_g - mlat) / slat) ** 2))
        mtn_belts = np.maximum(mtn_belts, g_m * amp)
    mtn_relief = land_aa * (0.28 + 0.72 * coast_tight) * np.clip(0.42 * topo_macro + 0.33 * topo_crisp + 0.45 * mtn_belts, 0.0, 1.0)

    # Crisp gold cartographic graticule (15-deg meridians & parallels + double-ruled Equator/Prime Meridian + Tropics)
    lon_mod = np.abs(((lon_g + 7.5) % 15.0) - 7.5)
    lat_mod = np.abs(((lat_g + 7.5) % 15.0) - 7.5)
    cos_lat = np.clip(np.cos(np.radians(lat_g)), 0.16, 1.0)
    grid_lon = np.clip(1.0 - (lon_mod * cos_lat) / 0.24, 0.0, 1.0)
    grid_lat = np.clip(1.0 - lat_mod / 0.22, 0.0, 1.0)
    grid_fine = np.maximum(grid_lon, grid_lat) * 0.50

    equator = np.clip(1.0 - np.abs(lat_g) / 0.48, 0.0, 1.0)
    prime_mer = np.clip(1.0 - (np.abs(lon_g) * cos_lat) / 0.46, 0.0, 1.0)
    tropics = np.maximum(
        np.clip(1.0 - np.abs(lat_g - 23.44) / 0.28, 0.0, 1.0),
        np.clip(1.0 - np.abs(lat_g + 23.44) / 0.28, 0.0, 1.0),
    ) * (np.sin(lon_g * 0.9) > 0.0).astype(np.float32) * 0.78

    # 4 Ornate 16-Point Royal Observatory Compass Roses + Sweeping Golden Loxodrome Rhumb Webs
    rose_acc = np.zeros((H, W), dtype=np.float32)
    for (rlon, rlat) in [(-34.0, 18.0), (-142.0, -16.0), (78.0, -24.0), (-155.0, 28.0)]:
        dlon = (lon_g - rlon) * math.cos(math.radians(rlat))
        dlat = lat_g - rlat
        dist = np.sqrt(dlon * dlon + dlat * dlat)
        ang = np.arctan2(dlat, dlon)
        rays = np.power(np.abs(np.cos(ang * 8.0)), 34.0) * np.exp(-dist / 42.0) * (1.0 - land_aa)
        ring_out = np.clip(1.0 - np.abs(dist - 5.8) / 0.45, 0.0, 1.0) * (1.0 - land_aa)
        ring_in = np.clip(1.0 - np.abs(dist - 3.6) / 0.35, 0.0, 1.0) * (1.0 - land_aa)
        star_maj = np.power(np.abs(np.cos(ang * 4.0)), 12.0) * np.clip(1.0 - dist / 6.8, 0.0, 1.0) * (1.0 - land_aa)
        star_min = np.power(np.abs(np.cos(ang * 8.0)), 18.0) * np.clip(1.0 - dist / 4.6, 0.0, 1.0) * (1.0 - land_aa)
        rose_acc = np.maximum(rose_acc, np.clip(rays * 0.50 + ring_out * 0.92 + ring_in * 0.75 + star_maj * 0.95 + star_min * 0.65, 0.0, 1.0))

    gold_lines = np.clip(
        np.maximum.reduce([grid_fine, equator * 0.96, prime_mer * 0.92, tropics, rose_acc]),
        0.0, 1.0,
    )

    # Ocean Base: Rich Deep Royal Sapphire & Midnight Ultramarine with luminous continental-shelf bathymetry!
    ocean_tex = fft_fbm(rng, H, W, octaves=((180.0, 0.55), (35.0, 0.45)))
    oc_r = 0.018 + 0.024 * ocean_tex + 0.062 * shelf_glow + 0.085 * bathy_ring
    oc_g = 0.068 + 0.048 * ocean_tex + 0.135 * shelf_glow + 0.125 * bathy_ring
    oc_b = 0.185 + 0.095 * ocean_tex + 0.220 * shelf_glow + 0.155 * bathy_ring

    # Land Base: Richer Metallic Embossed 24K Antique Gold (warm bronze-gold interior, luminous gilded peaks & razor-crisp burnished shore rims!)
    la_r = 0.74 + 0.24 * mtn_relief + 0.20 * shore_bevel
    la_g = 0.55 + 0.22 * mtn_relief + 0.16 * shore_bevel
    la_b = 0.20 + 0.14 * mtn_relief + 0.08 * shore_bevel

    col_r = oc_r * (1.0 - land_aa) + la_r * land_aa
    col_g = oc_g * (1.0 - land_aa) + la_g * land_aa
    col_b = oc_b * (1.0 - land_aa) + la_b * land_aa

    g_r, g_g, g_b = 0.98, 0.82, 0.40
    col_r = col_r * (1.0 - gold_lines * 0.86) + g_r * (gold_lines * 0.86)
    col_g = col_g * (1.0 - gold_lines * 0.86) + g_g * (gold_lines * 0.86)
    col_b = col_b * (1.0 - gold_lines * 0.86) + g_b * (gold_lines * 0.86)

    globe_col = np.ones((H, W, 4), dtype=np.float32)
    globe_col[:, :, 0] = np.clip(col_r, 0.0, 1.0)
    globe_col[:, :, 1] = np.clip(col_g, 0.0, 1.0)
    globe_col[:, :, 2] = np.clip(col_b, 0.0, 1.0)

    # Roughness: Jewel-gloss royal sapphire oceans (0.19), brushed satin 24K gold continents (0.28), gleaming shoreline bevels (0.18)
    globe_rough = np.clip(0.19 + 0.11 * land_aa + 0.07 * topo_crisp * land_aa - 0.08 * shore_bevel - 0.05 * gold_lines, 0.14, 0.44)
    # Metallic: Low dielectric royal-sapphire ocean (0.08), RICH metallic embossed 24K gold continents (0.84) & graticules (0.88)!
    globe_metal = np.clip(0.08 + 0.76 * np.maximum(land_aa, gold_lines * 0.92), 0.06, 0.92)
    # Strong Sculpted Emboss Heightfield for crisp continental step cliffs, coastal bevel & mountain relief!
    globe_h = np.clip(0.52 * land_aa + 0.34 * mtn_relief + 0.22 * shore_bevel + 0.14 * gold_lines, 0.0, 1.0)

    return {
        "globe_col": create_packed_image("Tex_Globe_Earth_Col", globe_col, is_data=False, use_jpeg=True, quality=90),
        "globe_rough": create_packed_image("Tex_Globe_Earth_Rough", make_gray_rgba(globe_rough), is_data=True, use_jpeg=True, quality=88),
        "globe_metal": create_packed_image("Tex_Globe_Earth_Metal", make_gray_rgba(globe_metal), is_data=True, use_jpeg=True, quality=88),
        "globe_norm": create_packed_image("Tex_Globe_Earth_Norm", height_to_normal_rgba(globe_h, 2.45), is_data=True, use_jpeg=True, quality=90),
    }


# ---------------------------------------------------------------------------
# PBR Material Factory (Blender 5.3.0 Principled BSDF + Clean glTF 2.0 Export)
# ---------------------------------------------------------------------------
def make_pbr_mat(
    name: str,
    base_hex: str = "#CCCCCC",
    metallic: float = 0.0,
    roughness: float = 0.40,
    coat: float = 0.0,
    coat_roughness: float = 0.12,
    alpha: float = 1.0,
    emission_hex: str = None,
    emission_strength: float = 0.0,
    col_tex=None,
    rough_tex=None,
    metal_tex=None,
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
    if emission_hex and emission_strength > 0.0:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = srgb_to_linear(emission_hex)
            bsdf.inputs["Emission Strength"].default_value = emission_strength

    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    need_uv = any(t is not None for t in (col_tex, rough_tex, metal_tex, norm_tex))
    mapping = None
    if need_uv:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        tc.location = (-680, 0)
        mapping = nt.nodes.new("ShaderNodeMapping")
        mapping.location = (-480, 0)
        mapping.inputs["Scale"].default_value = (uv_scale, uv_scale, uv_scale)
        nt.links.new(tc.outputs["UV"], mapping.inputs["Vector"])

    if col_tex is not None:
        t_col = nt.nodes.new("ShaderNodeTexImage")
        t_col.location = (-220, 260)
        t_col.image = col_tex
        nt.links.new(mapping.outputs["Vector"], t_col.inputs["Vector"])
        if tint_strength > 0.001:
            mix = nt.nodes.new("ShaderNodeMix")
            mix.data_type = "RGBA"
            mix.blend_type = "MIX"
            mix.location = (20, 260)
            mix.inputs["Factor"].default_value = tint_strength
            mix.inputs["B"].default_value = srgb_to_linear(base_hex)
            nt.links.new(t_col.outputs["Color"], mix.inputs["A"])
            nt.links.new(mix.outputs["Result"], bsdf.inputs["Base Color"])
        else:
            nt.links.new(t_col.outputs["Color"], bsdf.inputs["Base Color"])

    if metal_tex is not None:
        t_met = nt.nodes.new("ShaderNodeTexImage")
        t_met.location = (-220, 40)
        t_met.image = metal_tex
        nt.links.new(mapping.outputs["Vector"], t_met.inputs["Vector"])
        nt.links.new(t_met.outputs["Color"], bsdf.inputs["Metallic"])

    if rough_tex is not None:
        t_rgh = nt.nodes.new("ShaderNodeTexImage")
        t_rgh.location = (-220, -180)
        t_rgh.image = rough_tex
        nt.links.new(mapping.outputs["Vector"], t_rgh.inputs["Vector"])
        nt.links.new(t_rgh.outputs["Color"], bsdf.inputs["Roughness"])

    if norm_tex is not None:
        t_nrm = nt.nodes.new("ShaderNodeTexImage")
        t_nrm.location = (-220, -410)
        t_nrm.image = norm_tex
        nt.links.new(mapping.outputs["Vector"], t_nrm.inputs["Vector"])
        nmap = nt.nodes.new("ShaderNodeNormalMap")
        nmap.location = (30, -410)
        nmap.inputs["Strength"].default_value = norm_strength
        nt.links.new(t_nrm.outputs["Color"], nmap.inputs["Color"])
        nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])

    return mat


def build_material_library(tex):
    """Creates clean semantic PBR materials for each venue & globe (ready for Poly Haven overrides)."""
    m = {}

    # Shared Luxury Diplomatic Brass & Table Materials
    m["london_parquet"] = make_pbr_mat(
        "Mat_London_Parquet", "#5A3A1E", metallic=0.0, roughness=0.34, coat=0.22, coat_roughness=0.24,
        col_tex=tex["parquet_col"], rough_tex=tex["parquet_rough"], norm_tex=tex["parquet_norm"],
        norm_strength=0.45, uv_scale=1.0,
    )
    m["london_travertine"] = make_pbr_mat(
        "Mat_London_Travertine", "#D5C3A5", metallic=0.0, roughness=0.52,
        col_tex=tex["trav_col"], rough_tex=tex["trav_rough"], norm_tex=tex["trav_norm"],
        norm_strength=0.42, uv_scale=1.0,
    )
    m["london_dark_oak"] = make_pbr_mat(
        "Mat_London_DarkOak", "#2E190E", metallic=0.0, roughness=0.32, coat=0.28, coat_roughness=0.20,
        col_tex=tex["walnut_col"], rough_tex=tex["walnut_rough"], norm_tex=tex["walnut_norm"],
        norm_strength=0.38, uv_scale=1.0,
    )
    m["london_marble"] = make_pbr_mat(
        "Mat_London_Marble", "#E4DCCE", metallic=0.0, roughness=0.18, coat=0.50, coat_roughness=0.10,
        col_tex=tex["light_marble_col"], norm_tex=tex["dark_marble_norm"], norm_strength=0.14, uv_scale=1.0,
    )
    m["london_dark_marble"] = make_pbr_mat(
        "Mat_London_DarkMarble", "#14171D", metallic=0.0, roughness=0.16, coat=0.55, coat_roughness=0.08,
        col_tex=tex["dark_marble_col"], rough_tex=tex["dark_marble_rough"], norm_tex=tex["dark_marble_norm"],
        norm_strength=0.18, uv_scale=1.0,
    )
    m["london_brass"] = make_pbr_mat(
        "Mat_London_Brass", "#C89E4A", metallic=0.92, roughness=0.26,
        rough_tex=tex["brass_rough"], norm_tex=tex["brass_norm"], norm_strength=0.22, uv_scale=2.0,
    )
    m["london_glass"] = make_pbr_mat(
        "Mat_London_Glass", "#1C2E45", metallic=0.02, roughness=0.06, coat=0.08, alpha=0.08,
    )
    m["london_chandelier_glow"] = make_pbr_mat(
        "Mat_London_ChandelierGlow", "#FFF0CE", metallic=0.0, roughness=0.20,
        emission_hex="#FFD584", emission_strength=3.2,
    )
    m["london_books"] = make_pbr_mat(
        "Mat_London_BookLeather", "#3D1B18", metallic=0.0, roughness=0.55,
        col_tex=tex["leather_col"], norm_tex=tex["leather_norm"], norm_strength=0.35, uv_scale=1.5, tint_strength=0.35,
    )

    # Shared Table Materials (matching Vetting Chamber semantic names for Godot Poly Haven mapping)
    m["table_walnut"] = make_pbr_mat(
        "Mat_Table_Walnut", "#321B0E", metallic=0.0, roughness=0.28, coat=0.35, coat_roughness=0.16,
        col_tex=tex["walnut_col"], rough_tex=tex["walnut_rough"], norm_tex=tex["walnut_norm"],
        norm_strength=0.35, uv_scale=1.0,
    )
    m["table_marble"] = make_pbr_mat(
        "Mat_Table_Marble", "#181C24", metallic=0.0, roughness=0.16, coat=0.60, coat_roughness=0.08,
        col_tex=tex["dark_marble_col"], rough_tex=tex["dark_marble_rough"], norm_tex=tex["dark_marble_norm"],
        norm_strength=0.20, uv_scale=1.0,
    )
    m["table_leather"] = make_pbr_mat(
        "Mat_Table_Leather", "#2A160D", metallic=0.0, roughness=0.46,
        col_tex=tex["leather_col"], norm_tex=tex["leather_norm"], norm_strength=0.48, uv_scale=1.5,
    )

    # Tokyo Pavilion Materials
    m["tokyo_slate"] = make_pbr_mat(
        "Mat_Tokyo_Slate", "#1B2028", metallic=0.04, roughness=0.36, coat=0.22, coat_roughness=0.22,
        col_tex=tex["slate_col"], rough_tex=tex["slate_rough"], norm_tex=tex["slate_norm"],
        norm_strength=0.40, uv_scale=1.0,
    )
    m["tokyo_hinoki"] = make_pbr_mat(
        "Mat_Tokyo_Hinoki", "#C99A63", metallic=0.0, roughness=0.42,
        col_tex=tex["hinoki_col"], norm_tex=tex["hinoki_norm"], norm_strength=0.35, uv_scale=1.0,
    )
    m["tokyo_dark_wood"] = make_pbr_mat(
        "Mat_Tokyo_DarkWood", "#1C130E", metallic=0.0, roughness=0.32, coat=0.25, coat_roughness=0.20,
        col_tex=tex["walnut_col"], rough_tex=tex["walnut_rough"], norm_tex=tex["walnut_norm"],
        norm_strength=0.32, uv_scale=1.0, tint_strength=0.30,
    )
    m["tokyo_washi_glow"] = make_pbr_mat(
        "Mat_Tokyo_WashiGlow", "#E8B872", metallic=0.0, roughness=0.78,
        emission_hex="#E8B872", emission_strength=0.32,
    )
    m["tokyo_obsidian"] = make_pbr_mat(
        "Mat_Tokyo_Obsidian", "#141923", metallic=0.16, roughness=0.34, coat=0.22, coat_roughness=0.24,
        col_tex=tex["slate_col"], rough_tex=tex["slate_rough"], norm_tex=tex["slate_norm"],
        norm_strength=0.30, uv_scale=1.0, tint_strength=0.30,
    )
    m["tokyo_steel"] = make_pbr_mat(
        "Mat_Tokyo_Steel", "#212630", metallic=0.84, roughness=0.34,
        rough_tex=tex["brass_rough"], norm_tex=tex["brass_norm"], norm_strength=0.16, uv_scale=1.5,
    )
    m["tokyo_rain_glass"] = make_pbr_mat(
        "Mat_Tokyo_RainGlass", "#0E1A2B", metallic=0.02, roughness=0.06, coat=0.06, alpha=0.055,
    )
    m["tokyo_lacquer"] = make_pbr_mat(
        "Mat_Tokyo_Lacquer", "#07090E", metallic=0.04, roughness=0.24, coat=0.34, coat_roughness=0.14,
        norm_tex=tex["dark_marble_norm"], norm_strength=0.05, uv_scale=1.0,
    )
    m["tokyo_kintsugi"] = make_pbr_mat(
        "Mat_Tokyo_KintsugiGold", "#F5C54E", metallic=0.95, roughness=0.18,
        emission_hex="#F0B83A", emission_strength=0.92,
        rough_tex=tex["brass_rough"], norm_tex=tex["brass_norm"], norm_strength=0.14, uv_scale=2.0,
    )
    m["tokyo_cove_glow"] = make_pbr_mat(
        "Mat_Tokyo_CoveGlow", "#FFE2A8", metallic=0.0, roughness=0.25,
        emission_hex="#FFCA75", emission_strength=2.2,
    )
    m["tokyo_tower_body"] = make_pbr_mat(
        "Mat_Tokyo_TowerBody", "#060B15", metallic=0.28, roughness=0.45,
    )
    m["tokyo_win_warm"] = make_pbr_mat(
        "Mat_Tokyo_WinWarm", "#FFDA99", metallic=0.0, roughness=0.2,
        emission_hex="#FFC46B", emission_strength=2.6,
    )
    m["tokyo_win_cool"] = make_pbr_mat(
        "Mat_Tokyo_WinCool", "#A4DAFF", metallic=0.0, roughness=0.2,
        emission_hex="#74C4FF", emission_strength=2.2,
    )
    m["tokyo_beacon_red"] = make_pbr_mat(
        "Mat_Tokyo_BeaconRed", "#FF4238", metallic=0.0, roughness=0.2,
        emission_hex="#FF2E24", emission_strength=5.0,
    )

    # Cairo Solar Hall Materials
    m["cairo_travertine"] = make_pbr_mat(
        "Mat_Cairo_Travertine", "#C9A878", metallic=0.0, roughness=0.50,
        col_tex=tex["trav_col"], rough_tex=tex["trav_rough"], norm_tex=tex["trav_norm"],
        norm_strength=0.45, uv_scale=1.0, tint_strength=0.18,
    )
    m["cairo_limestone"] = make_pbr_mat(
        "Mat_Cairo_Limestone", "#B58D5B", metallic=0.0, roughness=0.58,
        col_tex=tex["limestone_col"], rough_tex=tex["trav_rough"], norm_tex=tex["trav_norm"],
        norm_strength=0.52, uv_scale=1.0,
    )
    m["cairo_obsidian"] = make_pbr_mat(
        "Mat_Cairo_Obsidian", "#101218", metallic=0.08, roughness=0.15, coat=0.62, coat_roughness=0.08,
        col_tex=tex["dark_marble_col"], rough_tex=tex["dark_marble_rough"], norm_tex=tex["dark_marble_norm"],
        norm_strength=0.16, uv_scale=1.0, tint_strength=0.25,
    )
    m["cairo_brass"] = make_pbr_mat(
        "Mat_Cairo_Brass", "#C8953E", metallic=0.92, roughness=0.25,
        rough_tex=tex["brass_rough"], norm_tex=tex["brass_norm"], norm_strength=0.24, uv_scale=2.0,
    )
    m["cairo_warm_cove"] = make_pbr_mat(
        "Mat_Cairo_WarmCove", "#FFE4AE", metallic=0.0, roughness=0.35,
        emission_hex="#FFB84D", emission_strength=2.4,
    )

    # Meridian World Globe Materials (Prestige Cinema War Room V2)
    m["globe_earth"] = make_pbr_mat(
        "Mat_Globe_Earth", "#FFFFFF", metallic=0.35, roughness=0.22, coat=0.42, coat_roughness=0.09,
        col_tex=tex["globe_col"], rough_tex=tex["globe_rough"], metal_tex=tex["globe_metal"],
        norm_tex=tex["globe_norm"], norm_strength=1.10, uv_scale=1.0,
    )
    m["globe_walnut"] = make_pbr_mat(
        "Mat_Globe_Walnut", "#331A0C", metallic=0.0, roughness=0.24, coat=0.45, coat_roughness=0.14,
        col_tex=tex["walnut_col"], rough_tex=tex["walnut_rough"], norm_tex=tex["walnut_norm"],
        norm_strength=0.34, uv_scale=1.0,
    )
    m["globe_brass"] = make_pbr_mat(
        "Mat_Globe_Brass", "#DFB357", metallic=0.96, roughness=0.19, coat=0.18, coat_roughness=0.10,
        rough_tex=tex["brass_rough"], norm_tex=tex["brass_norm"], norm_strength=0.18, uv_scale=2.2,
    )
    m["globe_sapphire_enamel"] = make_pbr_mat(
        "Mat_Globe_SapphireEnamel", "#0A2454", metallic=0.26, roughness=0.14, coat=0.82, coat_roughness=0.06,
        norm_tex=tex["dark_marble_norm"], norm_strength=0.08, uv_scale=1.8,
    )
    m["globe_plinth_obsidian"] = make_pbr_mat(
        "Mat_Globe_PlinthObsidian", "#0B0E16", metallic=0.10, roughness=0.16, coat=0.65, coat_roughness=0.08,
        col_tex=tex["dark_marble_col"], rough_tex=tex["dark_marble_rough"], norm_tex=tex["dark_marble_norm"],
        norm_strength=0.16, uv_scale=1.2, tint_strength=0.25,
    )
    m["globe_compass"] = make_pbr_mat(
        "Mat_Globe_CompassDial", "#091B3C", metallic=0.22, roughness=0.18, coat=0.55,
        col_tex=tex["dark_marble_col"], norm_tex=tex["brass_norm"], norm_strength=0.12, uv_scale=1.5, tint_strength=0.55,
    )
    m["globe_glass"] = make_pbr_mat(
        "Mat_Globe_Glass", "#142238", metallic=0.02, roughness=0.05, coat=0.08, alpha=0.06,
    )

    return m


# ---------------------------------------------------------------------------
# Architectural BMesh Geometry Craft Primitives (Clean UVs, Bevels, Lathes, Sweeps)
# ---------------------------------------------------------------------------
def apply_metric_box_uv(bm, scale: float = 0.5):
    """Distortion-free metric triplanar box UV mapping (ideal for Poly Haven PBR tiling)."""
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


def apply_cylindrical_uv(bm, radius_hint: float = 1.0, scale: float = 0.5):
    """Seamless cylindrical metric UV mapping for circular walls, columns, and drums."""
    uv_layer = bm.loops.layers.uv.verify()
    bm.faces.ensure_lookup_table()
    for f in bm.faces:
        n = f.normal
        if abs(n.z) > 0.82:
            for loop in f.loops:
                co = loop.vert.co
                loop[uv_layer].uv = (co.x * scale, co.y * scale)
        else:
            angs = [math.atan2(loop.vert.co.y, loop.vert.co.x) for loop in f.loops]
            # Unwrap seam jump cleanly per face
            a_ref = angs[0]
            for loop, a in zip(f.loops, angs):
                da = a - a_ref
                if da > math.pi:
                    a -= 2.0 * math.pi
                elif da < -math.pi:
                    a += 2.0 * math.pi
                co = loop.vert.co
                r = max(radius_hint, math.hypot(co.x, co.y))
                loop[uv_layer].uv = (a * r * scale, co.z * scale)


def make_collection(name: str, parent_col=None):
    col = bpy.data.collections.new(name)
    (parent_col or bpy.context.scene.collection).children.link(col)
    return col


def make_empty(name: str, col, parent=None, location=(0.0, 0.0, 0.0), rotation=(0.0, 0.0, 0.0)):
    e = bpy.data.objects.new(name, None)
    e.empty_display_type = "PLAIN_AXES"
    e.empty_display_size = 0.35
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
    uv_mode: str = "box",
    uv_scale: float = 0.5,
    uv_radius: float = 1.0,
    recalc_normals: bool = True,
):
    """Converts a bmesh to a clean mesh object with verified UVs, normals, and shading."""
    if recalc_normals:
        bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-5)
        bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))

    if uv_mode == "box":
        apply_metric_box_uv(bm, scale=uv_scale)
    elif uv_mode == "cyl":
        apply_cylindrical_uv(bm, radius_hint=uv_radius, scale=uv_scale)
    # uv_mode == "preserve" keeps custom UVs (e.g. equirectangular sphere!)

    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()

    if len(mesh.polygons) > 0:
        mesh.polygons.foreach_set("use_smooth", [smooth] * len(mesh.polygons))

    obj = bpy.data.objects.new(name, mesh)
    obj.data.materials.append(mat)
    obj.location = location
    obj.rotation_euler = rotation
    col.objects.link(obj)
    if parent is not None:
        obj.parent = parent

    if smooth and split_angle_deg < 179.0:
        es = obj.modifiers.new("EdgeSplit", "EDGE_SPLIT")
        es.split_angle = math.radians(split_angle_deg)
        es.use_edge_angle = True

    return obj


def bm_merge(dst: bmesh.types.BMesh, src: bmesh.types.BMesh, matrix: Matrix = None):
    """Merges src bmesh into dst (with optional transform) and frees src."""
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
    bmesh.ops.create_cone(
        tmp,
        cap_ends=True,
        cap_tris=False,
        segments=segs,
        radius1=r_bot,
        radius2=r_top,
        depth=height,
    )
    if bevel > 0.0:
        sharp = [e for e in tmp.edges if e.calc_face_angle(0.0) > math.radians(40.0)]
        if sharp:
            bmesh.ops.bevel(
                tmp,
                geom=sharp,
                offset=min(bevel, r_bot * 0.28, r_top * 0.28, height * 0.28),
                segments=1,
                affect="EDGES",
                clamp_overlap=True,
            )
    bm_merge(bm, tmp, matrix)


def bm_lathe_new(profile_rz, segs: int = 48, closed_profile: bool = True, cap_ends: bool = False):
    """Revolves a 2D (r, z) profile around Z axis cleanly into a new BMesh."""
    bm = bmesh.new()
    n = len(profile_rz)
    rings = []
    for i in range(segs):
        a = (2.0 * math.pi * i) / segs
        ca, sa = math.cos(a), math.sin(a)
        ring = [bm.verts.new((max(r, 1e-4) * ca, max(r, 1e-4) * sa, z)) for (r, z) in profile_rz]
        rings.append(ring)
    p_count = n if closed_profile else n - 1
    for i in range(segs):
        ni = (i + 1) % segs
        r0, r1 = rings[i], rings[ni]
        for j in range(p_count):
            nj = (j + 1) % n
            try:
                bm.faces.new((r0[j], r1[j], r1[nj], r0[nj]))
            except ValueError:
                pass
    if cap_ends and not closed_profile:
        try:
            bm.faces.new([r[0] for r in reversed(rings)])
            bm.faces.new([r[-1] for r in rings])
        except ValueError:
            pass
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    return bm


def bm_add_lathe(bm, profile_rz, segs: int = 48, closed_profile: bool = True, cap_ends: bool = False, matrix: Matrix = None):
    tmp = bm_lathe_new(profile_rz, segs=segs, closed_profile=closed_profile, cap_ends=cap_ends)
    bm_merge(bm, tmp, matrix)


def chamfer_ring_profile(r_in: float, r_out: float, z_bot: float, z_top: float, ch: float = 0.01):
    c = min(ch, (r_out - r_in) * 0.35, (z_top - z_bot) * 0.35)
    return [
        (r_in + c, z_bot),
        (r_out - c, z_bot),
        (r_out, z_bot + c),
        (r_out, z_top - c),
        (r_out - c, z_top),
        (r_in + c, z_top),
        (r_in, z_top - c),
        (r_in, z_bot + c),
    ]


def bm_add_sector(bm, r_in: float, r_out: float, z0: float, z1: float, a0: float, a1: float, segs: int = 12, bevel: float = 0.0, matrix: Matrix = None):
    """Adds a curved thick annular architectural sector block."""
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
    """Sweeps a 2D cross-section along a 3D path using parallel-transport frames."""
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
        if isinstance(sc, (tuple, list)):
            sx, sy = sc[0], sc[1]
        else:
            sx = sy = sc
        rings.append([tmp.verts.new(p + nv * (px * sx) + bv * (py * sy)) for (px, py) in profile_xy])

    m = len(profile_xy)
    seg_cnt = n if closed else n - 1
    for i in range(seg_cnt):
        r0 = rings[i]
        r1 = rings[(i + 1) % n]
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


def circle_profile(rx: float, ry: float = None, segs: int = 10):
    ry = rx if ry is None else ry
    return [(rx * math.cos(2.0 * math.pi * i / segs), ry * math.sin(2.0 * math.pi * i / segs)) for i in range(segs)]


def chamfer_rect_2d(hx: float, hy: float, ch: float = 0.008):
    c = min(ch, hx * 0.4, hy * 0.4)
    return [
        (-hx + c, -hy), (hx - c, -hy), (hx, -hy + c), (hx, hy - c),
        (hx - c, hy), (-hx + c, hy), (-hx, hy - c), (-hx, -hy + c),
    ]


def bm_add_extruded_poly_2d(bm, pts_xy, z0: float, z1: float, bevel: float = 0.0, matrix: Matrix = None):
    """Extrudes a closed 2D polygon cleanly from z0 to z1 with optional edge bevel."""
    tmp = bmesh.new()
    bot = [tmp.verts.new((x, y, z0)) for (x, y) in pts_xy]
    top = [tmp.verts.new((x, y, z1)) for (x, y) in pts_xy]
    n = len(pts_xy)
    for i in range(n):
        ni = (i + 1) % n
        tmp.faces.new((bot[i], bot[ni], top[ni], top[i]))
    tmp.faces.new(list(reversed(bot)))
    tmp.faces.new(top)
    bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
    if bevel > 0.0:
        sharp = [e for e in tmp.edges if e.calc_face_angle(0.0) > math.radians(32.0)]
        if sharp:
            bmesh.ops.bevel(tmp, geom=sharp, offset=min(bevel, abs(z1 - z0) * 0.30), segments=2, affect="EDGES", clamp_overlap=True)
    bm_merge(bm, tmp, matrix)


def stadium_outline_2d(half_len_x: float, half_wid_y: float, arc_segs: int = 14):
    """Graceful architectural stadium / oval-ended tabletop outline."""
    r = half_wid_y
    cx = max(0.0, half_len_x - r)
    pts = []
    # Right semicircle (-90..+90 deg)
    for i in range(arc_segs + 1):
        a = -math.pi * 0.5 + math.pi * (i / arc_segs)
        pts.append((cx + r * math.cos(a), r * math.sin(a)))
    # Left semicircle (+90..+270 deg)
    for i in range(arc_segs + 1):
        a = math.pi * 0.5 + math.pi * (i / arc_segs)
        pts.append((-cx + r * math.cos(a), r * math.sin(a)))
    return pts


def rounded_rect_2d(hx: float, hy: float, r: float, corner_segs: int = 6):
    r = min(r, hx * 0.45, hy * 0.45)
    pts = []
    corners = [
        (hx - r, -hy + r, -math.pi * 0.5, 0.0),
        (hx - r, hy - r, 0.0, math.pi * 0.5),
        (-hx + r, hy - r, math.pi * 0.5, math.pi),
        (-hx + r, -hy + r, math.pi, 1.5 * math.pi),
    ]
    for cx, cy, a0, a1 in corners:
        for i in range(corner_segs + 1):
            a = a0 + (a1 - a0) * (i / corner_segs)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


# ===========================================================================
# 1. LONDON SOVEREIGN ROTUNDA (godot/assets/aaa_models/london_rotunda_room.glb)
# ===========================================================================
def build_london_rotunda(mats):
    col = make_collection("Venue_London_Rotunda")
    root = make_empty("London_Rotunda_Root", col)

    R_WALL = 7.50
    R_COL = 6.32
    N_COLS = 8
    # Offset by 22.5 deg so camera looking along +Y looks straight through a grand central arch!
    COL_OFFSET = math.pi / N_COLS

    # --- A. Floor: Herringbone Parquet + Classical Marble & Brass Compass Inlay ---
    bm_parq = bmesh.new()
    bm_add_lathe(bm_parq, [(0.001, -0.25), (R_WALL + 0.35, -0.25), (R_WALL + 0.35, 0.0), (0.001, 0.0)], segs=40, closed_profile=True)
    finalize_obj("London_Floor_Parquet", bm_parq, mats["london_parquet"], col, parent=root, uv_mode="box", uv_scale=0.5)

    # Central honed stone compass inlay (flush Z = 0.002..0.004m — classical British Museum rotunda)
    bm_fl_lm = bmesh.new()
    bm_fl_dm = bmesh.new()
    bm_fl_br = bmesh.new()
    bm_add_lathe(bm_fl_lm, chamfer_ring_profile(2.65, 3.25, -0.01, 0.003, 0.002), segs=44)
    bm_add_lathe(bm_fl_dm, chamfer_ring_profile(0.01, 2.62, -0.01, 0.0025, 0.002), segs=44)
    for i in range(8):
        a = i * (2.0 * math.pi / 8)
        bm_add_sector(bm_fl_dm, 2.70, 3.20, -0.005, 0.0035, a - 0.14, a + 0.14, segs=4)
    for r_ring in (2.635, 3.265, 5.72):
        bm_add_lathe(bm_fl_br, chamfer_ring_profile(r_ring - 0.022, r_ring + 0.022, -0.004, 0.0045, 0.002), segs=44)
    for i in range(8):
        a = i * (2.0 * math.pi / 8)
        m_spoke = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((4.50, 0.0, 0.002))
        bm_add_box(bm_fl_br, 2.40, 0.028, 0.005, matrix=m_spoke)

    finalize_obj("London_Floor_LightMarble", bm_fl_lm, mats["london_marble"], col, parent=root, uv_mode="box", uv_scale=0.5)
    finalize_obj("London_Floor_DarkMarble", bm_fl_dm, mats["london_dark_marble"], col, parent=root, uv_mode="box", uv_scale=0.5)
    finalize_obj("London_Floor_BrassInlay", bm_fl_br, mats["london_brass"], col, parent=root, uv_mode="box", uv_scale=1.0)

    # --- B. Outer Rotunda Drum Wall (Travertine + Carved Dark-Oak Library Wainscoting) ---
    bm_drum = bmesh.new()
    bm_add_lathe(bm_drum, [
        (7.48, -0.10), (7.98, -0.10), (7.98, 6.50), (7.38, 6.50),
        (7.38, 6.22), (7.48, 6.14), (7.48, 3.60), (7.48, -0.10),
    ], segs=44, closed_profile=True)
    bm_add_lathe(bm_drum, chamfer_ring_profile(7.30, 7.52, 0.0, 0.24, 0.03), segs=44)
    bm_add_lathe(bm_drum, chamfer_ring_profile(7.34, 7.52, 3.38, 3.60, 0.03), segs=44)
    bm_add_lathe(bm_drum, [
        (7.48, 5.95), (7.28, 6.08), (7.16, 6.20), (7.10, 6.38),
        (7.20, 6.46), (7.52, 6.46), (7.52, 5.95),
    ], segs=44, closed_profile=True)
    for i in range(40):
        a = (2.0 * math.pi * i) / 40
        m_den = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((7.24, 0.0, 6.08))
        bm_add_box(bm_drum, 0.14, 0.14, 0.13, matrix=m_den)

    # Recessed library bookcase wainscot bays (2 grand arched oak bays per span for stately Royal Society scale!)
    bm_oak_wall = bmesh.new()
    bm_books = bmesh.new()
    for b in range(N_COLS):
        ang_mid = b * (2.0 * math.pi / N_COLS)
        for sub in (-0.5, 0.5):
            a_bay = ang_mid + sub * 0.28
            m_bay = Matrix.Rotation(a_bay, 4, "Z")
            for side in (-1, 1):
                m_stile = m_bay @ Matrix.Translation((7.34, side * 0.88, 1.68))
                bm_add_box(bm_oak_wall, 0.18, 0.16, 3.16, matrix=m_stile)
            bm_add_box(bm_oak_wall, 0.10, 1.64, 0.85, matrix=m_bay @ Matrix.Translation((7.42, 0.0, 0.56)))
            bm_add_box(bm_oak_wall, 0.16, 1.78, 0.09, matrix=m_bay @ Matrix.Translation((7.35, 0.0, 1.02)))
            for sh_idx, sh_z in enumerate((1.45, 1.92, 2.39, 2.86)):
                bm_add_box(bm_oak_wall, 0.24, 1.66, 0.045, matrix=m_bay @ Matrix.Translation((7.36, 0.0, sh_z)))
                for bk in range(7):
                    by = -0.68 + bk * 0.225
                    bh = 0.25 + ((b * 7 + int(sub * 4) + sh_idx * 5 + bk * 11) % 5) * 0.025
                    bw = 0.165 + ((bk + sh_idx) % 2) * 0.025
                    bm_add_box(bm_books, 0.18, bw, bh, matrix=m_bay @ Matrix.Translation((7.38, by, sh_z + 0.024 + bh * 0.5)))
            bm_add_box(bm_oak_wall, 0.22, 1.84, 0.14, matrix=m_bay @ Matrix.Translation((7.33, 0.0, 3.30)))

    finalize_obj("London_Drum_Travertine", bm_drum, mats["london_travertine"], col, parent=root, uv_mode="cyl", uv_scale=0.45, uv_radius=7.5)
    finalize_obj("London_Wainscot_DarkOak", bm_oak_wall, mats["london_dark_oak"], col, parent=root, uv_mode="box", uv_scale=0.7)
    finalize_obj("London_Library_Books", bm_books, mats["london_books"], col, parent=root, uv_mode="box", uv_scale=1.2)

    # --- C. 8 Fluted Travertine Corinthian-Inspired Columns + Curved Classical Arches ---
    bm_cols = bmesh.new()
    bm_col_brass = bmesh.new()

    def add_fluted_corinthian_column(bm_stone, bm_br, cx, cy, z_base=0.0):
        mat_pos = Matrix.Translation((cx, cy, z_base))
        # 1. Stepped square plinth (Z = 0.0..0.28)
        bm_add_box(bm_stone, 0.84, 0.84, 0.22, matrix=mat_pos @ Matrix.Translation((0, 0, 0.11)), bevel=0.018, segs=2)
        bm_add_box(bm_stone, 0.76, 0.76, 0.08, matrix=mat_pos @ Matrix.Translation((0, 0, 0.26)), bevel=0.012, segs=1)
        # 2. Attic Base (lower torus, concave scotia, upper torus, Z = 0.30..0.58)
        attic_prof = [
            (0.01, 0.30), (0.37, 0.30), (0.39, 0.34), (0.38, 0.38),
            (0.33, 0.41), (0.31, 0.45), (0.34, 0.49), (0.36, 0.52),
            (0.34, 0.56), (0.305, 0.58), (0.01, 0.58),
        ]
        bm_add_lathe(bm_stone, attic_prof, segs=28, matrix=mat_pos)
        # Subtle brass astragal base ring
        bm_add_lathe(bm_br, chamfer_ring_profile(0.295, 0.322, 0.575, 0.610, 0.008), segs=28, matrix=mat_pos)

        # 3. Genuine 16-Flute Concave Classical Shaft with Entasis (Z = 0.60..4.18)
        n_flutes = 16
        pts_per_flute = 2  # crisp alternating ridge & concave flute valley
        ring_segs = n_flutes * pts_per_flute
        z_levels = [0.60, 1.25, 2.25, 3.35, 4.18]
        tmp = bmesh.new()
        rings = []
        for zi, zz in enumerate(z_levels):
            t = (zz - 0.60) / (4.18 - 0.60)
            r_nom = 0.298 * (1.0 - 0.135 * (t ** 1.35) + 0.022 * math.sin(t * math.pi))
            flute_depth = 0.024 * math.sin(min(1.0, max(0.0, (t - 0.03) / 0.08)) * math.pi * 0.5) * math.sin(min(1.0, max(0.0, (0.97 - t) / 0.08)) * math.pi * 0.5)
            ring = []
            for s in range(ring_segs):
                a = (2.0 * math.pi * s) / ring_segs
                rr = r_nom - (flute_depth if (s % 2 == 1) else 0.0)
                ring.append(tmp.verts.new((rr * math.cos(a), rr * math.sin(a), zz)))
            rings.append(ring)
        for zi in range(len(rings) - 1):
            r0, r1 = rings[zi], rings[zi + 1]
            for s in range(ring_segs):
                ns = (s + 1) % ring_segs
                tmp.faces.new((r0[s], r1[s], r1[ns], r0[ns]))
        tmp.faces.new(list(reversed(rings[0])))
        tmp.faces.new(rings[-1])
        bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
        bm_merge(bm_stone, tmp, mat_pos)

        # 4. Corinthian-Inspired Sculpted Capital (Z = 4.18..4.86)
        bm_add_lathe(bm_br, chamfer_ring_profile(0.245, 0.285, 4.17, 4.215, 0.008), segs=20, matrix=mat_pos)
        bell_prof = [
            (0.01, 4.21), (0.26, 4.21), (0.27, 4.35), (0.30, 4.52),
            (0.35, 4.68), (0.39, 4.74), (0.01, 4.74),
        ]
        bm_add_lathe(bm_stone, bell_prof, segs=18, matrix=mat_pos)
        # 2 staggered tiers of sculpted outward-curling acanthus palmette leaves (clean quad strips)
        leaf_prof = [(-0.055, -0.02), (0.055, -0.02), (0.055, 0.02), (-0.055, 0.02)]
        for tier, (z_st, z_en, r_st, r_en, a_off) in enumerate([
            (4.22, 4.54, 0.265, 0.355, 0.0),
            (4.36, 4.72, 0.285, 0.405, math.pi / 8.0),
        ]):
            for li in range(8):
                la = a_off + (2.0 * math.pi * li) / 8.0
                ca, sa = math.cos(la), math.sin(la)
                pts_leaf = []
                scs = []
                for s in range(5):
                    u = s / 4.0
                    rr = r_st + (r_en - r_st) * (u ** 1.45) + 0.025 * (u ** 3)
                    zz = z_st + (z_en - z_st) * u - 0.03 * (u ** 4)
                    pts_leaf.append((rr * ca, rr * sa, zz))
                    scs.append((1.0 - 0.42 * u, 1.0 - 0.30 * u))
                bm_sweep_tube(bm_stone, pts_leaf, leaf_prof, closed=False, cap_ends=True, scales=scs, matrix=mat_pos)
        scroll_prof = circle_profile(0.032, 0.032, segs=6)
        for vi in range(4):
            va = math.pi * 0.25 + vi * math.pi * 0.5
            ca, sa = math.cos(va), math.sin(va)
            pts_v = [
                (0.28 * ca, 0.28 * sa, 4.52),
                (0.37 * ca, 0.37 * sa, 4.66),
                (0.45 * ca, 0.45 * sa, 4.73),
                (0.48 * ca, 0.48 * sa, 4.69),
            ]
            bm_sweep_tube(bm_stone, pts_v, scroll_prof, closed=False, cap_ends=True, scales=[1.1, 1.0, 0.9, 0.8], matrix=mat_pos)
        bm_add_box(bm_stone, 0.82, 0.82, 0.07, matrix=mat_pos @ Matrix.Translation((0, 0, 4.765)), bevel=0.015)
        bm_add_box(bm_stone, 0.90, 0.90, 0.09, matrix=mat_pos @ Matrix.Translation((0, 0, 4.835)), bevel=0.018)

    col_angles = [COL_OFFSET + i * (2.0 * math.pi / N_COLS) for i in range(N_COLS)]
    for a in col_angles:
        add_fluted_corinthian_column(bm_cols, bm_col_brass, R_COL * math.cos(a), R_COL * math.sin(a), 0.0)

    # 8 Smooth Curved Classical Arches + Keystones + Ring Entablature (Z = 4.88..6.40)
    arch_prof = [(-0.27, -0.21), (0.27, -0.21), (0.27, 0.21), (-0.27, 0.21)]
    for i in range(N_COLS):
        a0 = col_angles[i]
        a1 = col_angles[(i + 1) % N_COLS]
        if a1 < a0:
            a1 += 2.0 * math.pi
        a_mid = 0.5 * (a0 + a1)
        p0 = Vector((R_COL * math.cos(a0), R_COL * math.sin(a0), 4.86))
        p1 = Vector((R_COL * math.cos(a1), R_COL * math.sin(a1), 4.86))
        chord = (p1 - p0).length
        arch_rise = min(1.18, chord * 0.26)
        n_arc = 12
        arc_pts = []
        for s in range(n_arc + 1):
            t = s / n_arc
            ang = a0 + (a1 - a0) * t
            z_arc = 4.86 + arch_rise * math.sin(t * math.pi)
            arc_pts.append((R_COL * math.cos(ang), R_COL * math.sin(ang), z_arc))
        bm_sweep_tube(bm_cols, arc_pts, arch_prof, closed=False, cap_ends=True)
        m_key = Matrix.Rotation(a_mid, 4, "Z") @ Matrix.Translation((R_COL, 0.0, 4.86 + arch_rise + 0.06))
        bm_add_box(bm_cols, 0.64, 0.34, 0.44, matrix=m_key, bevel=0.02)
        bm_add_box(bm_col_brass, 0.68, 0.10, 0.22, matrix=m_key @ Matrix.Translation((0.0, 0.0, 0.04)))

    # Continuous Upper Ring Entablature above the arches (Z = 6.08..6.48, bridges columns to dome)
    bm_add_lathe(bm_cols, [
        (R_COL - 0.34, 6.06), (R_COL + 0.38, 6.06), (R_COL + 0.38, 6.46),
        (R_COL - 0.44, 6.46), (R_COL - 0.44, 6.32), (R_COL - 0.36, 6.24),
        (R_COL - 0.34, 6.06),
    ], segs=44, closed_profile=True)
    bm_add_lathe(bm_col_brass, chamfer_ring_profile(R_COL - 0.38, R_COL - 0.32, 6.18, 6.25, 0.01), segs=44)

    for a in col_angles:
        m_tie = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.5 * (R_COL + R_WALL), 0.0, 6.18))
        bm_add_box(bm_cols, (R_WALL - R_COL) + 0.3, 0.56, 0.52, matrix=m_tie)

    finalize_obj("London_Columns_And_Arches", bm_cols, mats["london_travertine"], col, parent=root, uv_mode="box", uv_scale=0.55)
    finalize_obj("London_Columns_BrassTrim", bm_col_brass, mats["london_brass"], col, parent=root, uv_mode="box", uv_scale=1.2)

    # --- D. Carved Dark-Oak Mezzanine Gallery Balcony Rail (Z = 3.55..4.52m) ---
    bm_gal_oak = bmesh.new()
    bm_gal_br = bmesh.new()
    bm_add_lathe(bm_gal_oak, [
        (6.46, 3.38), (7.52, 3.38), (7.52, 3.58), (6.40, 3.58), (6.40, 3.48), (6.46, 3.38),
    ], segs=44, closed_profile=True)
    corb_prof = [(-0.08, -0.07), (0.08, -0.07), (0.08, 0.07), (-0.08, 0.07)]
    for i in range(16):
        a = (2.0 * math.pi * i) / 16.0
        m_c = Matrix.Rotation(a, 4, "Z")
        pts_c = [(7.46, 0.0, 2.88), (7.28, 0.0, 3.12), (6.95, 0.0, 3.30), (6.52, 0.0, 3.42)]
        bm_sweep_tube(bm_gal_oak, pts_c, corb_prof, closed=False, cap_ends=True, scales=[0.7, 0.95, 1.05, 0.9], matrix=m_c)
    bm_add_lathe(bm_gal_oak, chamfer_ring_profile(6.47, 6.63, 3.58, 3.68, 0.018), segs=44)
    bm_add_lathe(bm_gal_oak, [
        (6.46, 4.40), (6.64, 4.40), (6.67, 4.46), (6.63, 4.52),
        (6.47, 4.52), (6.43, 4.46),
    ], segs=44, closed_profile=True)
    bm_add_lathe(bm_gal_br, chamfer_ring_profile(6.39, 6.42, 3.46, 3.51, 0.006), segs=44)

    # 56 Lathe-Turned Classical Vase Balusters (clean 6-seg smooth urns — lean tris, rich silhouette!)
    bal_prof = [
        (0.005, 0.00), (0.044, 0.00), (0.044, 0.06), (0.026, 0.12),
        (0.054, 0.28), (0.036, 0.46), (0.022, 0.58), (0.042, 0.72), (0.005, 0.72),
    ]
    bm_bal_proto = bm_lathe_new(bal_prof, segs=6, closed_profile=True)
    for i in range(56):
        a = (2.0 * math.pi * i) / 56.0
        min_da = min(abs(((a - ca + math.pi) % (2.0 * math.pi)) - math.pi) for ca in col_angles)
        if min_da < 0.09:
            continue
        bx, by = 6.55 * math.cos(a), 6.55 * math.sin(a)
        m_b = Matrix.Translation((bx, by, 3.68))
        vmap = {v: bm_gal_oak.verts.new(m_b @ v.co) for v in bm_bal_proto.verts}
        for f in bm_bal_proto.faces:
            try:
                bm_gal_oak.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
    bm_bal_proto.free()

    # 8 Molded Gallery Newel Posts with Turned Brass Ball Finials
    finial_prof = [
        (0.005, 0.0), (0.065, 0.0), (0.05, 0.04), (0.03, 0.07),
        (0.068, 0.13), (0.072, 0.17), (0.048, 0.22), (0.018, 0.26), (0.005, 0.28),
    ]
    for a in col_angles:
        # Place paired decorative gallery newel pilasters flanking each bay
        for da in (-0.11, 0.11):
            na = a + da
            nx, ny = 6.55 * math.cos(na), 6.55 * math.sin(na)
            m_n = Matrix.Translation((nx, ny, 3.58)) @ Matrix.Rotation(na, 4, "Z")
            bm_add_box(bm_gal_oak, 0.19, 0.19, 0.98, matrix=m_n @ Matrix.Translation((0, 0, 0.49)), bevel=0.018)
            bm_add_lathe(bm_gal_br, finial_prof, segs=12, matrix=m_n @ Matrix.Translation((0, 0, 0.98)))

    finalize_obj("London_Gallery_Balustrade", bm_gal_oak, mats["london_dark_oak"], col, parent=root, uv_mode="box", uv_scale=0.8)
    finalize_obj("London_Gallery_Brass", bm_gal_br, mats["london_brass"], col, parent=root, uv_mode="box", uv_scale=1.5)

    # --- E. Coffered Classical Dome + Open Skylight Oculus (Z = 6.45..9.55m) ---
    bm_dome = bmesh.new()
    bm_dome_br = bmesh.new()
    bm_dome_glass = bmesh.new()

    R_DOME = 7.45
    Z_SPRING = 6.38
    Z_APEX = 9.48
    R_OCULUS = 2.08
    N_MERID = 16
    N_TIERS = 4

    def dome_rz(u):
        """Smooth segmental dome curve from u=0 (springing r=R_DOME) to u=1 (oculus r=R_OCULUS)."""
        theta = u * math.acos(R_OCULUS / R_DOME)
        r = R_DOME * math.cos(theta)
        # Slight vertical compression for graceful neoclassical dome proportion
        z = Z_SPRING + (Z_APEX - Z_SPRING) * (math.sin(theta) / math.sin(math.acos(R_OCULUS / R_DOME)))
        return r, z

    # Outer solid shell of the dome (thick waterproof dome backing behind coffers!)
    shell_prof = []
    for k in range(13):
        r, z = dome_rz(k / 12.0)
        shell_prof.append((r + 0.18, z + 0.16))
    for k in range(12, -1, -1):
        r, z = dome_rz(k / 12.0)
        shell_prof.append((r + 0.48, z + 0.46))
    bm_add_lathe(bm_dome, shell_prof, segs=48, closed_profile=True)

    # 16 Swept Curved Meridional Coffer Ribs
    rib_prof = [(-0.18, -0.20), (0.18, -0.20), (0.18, 0.20), (-0.18, 0.20)]
    for m_i in range(N_MERID):
        ma = (2.0 * math.pi * m_i) / N_MERID
        ca, sa = math.cos(ma), math.sin(ma)
        pts_rib = []
        for k in range(10):
            r, z = dome_rz(k / 9.0)
            pts_rib.append((r * ca, r * sa, z))
        bm_sweep_tube(bm_dome, pts_rib, rib_prof, closed=False, cap_ends=True)

    # 5 Concentric Horizontal Coffer Ring Bands + Stepped Recessed Coffer Frames & Brass Rosettes
    for t_i in range(N_TIERS + 1):
        u = t_i / N_TIERS
        r, z = dome_rz(u)
        bm_add_lathe(bm_dome, chamfer_ring_profile(r - 0.16, r + 0.24, z - 0.14, z + 0.14, 0.025), segs=48)
        # Inner coffer step frame & brass rosette boss inside each coffer bay
        if t_i < N_TIERS:
            u_mid = (t_i + 0.5) / N_TIERS
            rm, zm = dome_rz(u_mid)
            # Tangent tilt angle of dome at u_mid
            r1, z1 = dome_rz(min(1.0, u_mid + 0.04))
            r0, z0 = dome_rz(max(0.0, u_mid - 0.04))
            tilt = math.atan2(r0 - r1, z1 - z0)
            for m_i in range(N_MERID):
                ma = (2.0 * math.pi * (m_i + 0.5)) / N_MERID
                # Recessed stepped inner coffer trim + central brass rosette
                m_cof = Matrix.Rotation(ma, 4, "Z") @ Matrix.Translation((rm + 0.14, 0.0, zm + 0.12)) @ Matrix.Rotation(-tilt, 4, "Y")
                bm_add_cyl(bm_dome_br, 0.14, 0.08, 0.09, segs=8, matrix=m_cof @ Matrix.Rotation(math.pi * 0.5, 4, "Y"), bevel=0.015)

    # Molded Skylight Oculus Collar & Wrought-Brass Lantern Dome Glass
    bm_add_lathe(bm_dome, chamfer_ring_profile(R_OCULUS - 0.10, R_OCULUS + 0.35, Z_APEX - 0.18, Z_APEX + 0.38, 0.03), segs=48)
    bm_add_lathe(bm_dome_br, chamfer_ring_profile(R_OCULUS - 0.12, R_OCULUS + 0.04, Z_APEX - 0.12, Z_APEX + 0.06, 0.012), segs=48)
    # 8 Delicate radial brass skylight ribs arching up over the open oculus
    mull_prof = chamfer_rect_2d(0.032, 0.045, 0.008)
    for k in range(8):
        ka = (2.0 * math.pi * k) / 8.0
        ca, sa = math.cos(ka), math.sin(ka)
        pts_m = []
        for s in range(9):
            t = s / 8.0
            rr = R_OCULUS * (1.0 - t)
            zz = Z_APEX + 0.25 + 0.85 * math.sin(t * math.pi * 0.5)
            pts_m.append((rr * ca, rr * sa, zz))
        bm_sweep_tube(bm_dome_br, pts_m, mull_prof, closed=False, cap_ends=True)
    # Concentric skylight lantern ring & subtle translucent skylight glass
    bm_add_lathe(bm_dome_br, chamfer_ring_profile(0.95, 1.03, Z_APEX + 0.82, Z_APEX + 0.88, 0.008), segs=32)
    glass_prof = [(R_OCULUS * math.cos(t * math.pi * 0.49), Z_APEX + 0.28 + 0.82 * math.sin(t * math.pi * 0.49)) for t in np.linspace(0, 1, 8)]
    glass_thick = glass_prof + [(r, z + 0.03) for (r, z) in reversed(glass_prof)]
    bm_add_lathe(bm_dome_glass, glass_thick, segs=32, closed_profile=True)

    finalize_obj("London_Coffered_Dome", bm_dome, mats["london_travertine"], col, parent=root, uv_mode="box", uv_scale=0.45)
    finalize_obj("London_Dome_Brass", bm_dome_br, mats["london_brass"], col, parent=root, uv_mode="box", uv_scale=1.2)
    lon_gl_obj = finalize_obj("London_Skylight_Glass", bm_dome_glass, mats["london_glass"], col, parent=root, uv_mode="box", uv_scale=0.5)
    lon_gl_obj.visible_shadow = False

    # --- F. Overhead Sculpted Brass Armillary Chandelier (Animatable Node!) ---
    Z_CHAND = 4.72
    chand_pivot = make_empty("Armillary_Chandelier", col, parent=root, location=(0.0, 0.0, Z_CHAND))
    bm_ch_br = bmesh.new()
    bm_ch_gl = bmesh.new()

    # Central vertical suspension stem up to skylight zenith + ornate central baluster core
    bm_add_cyl(bm_ch_br, 0.028, 0.028, (Z_APEX + 1.10) - Z_CHAND, segs=12, matrix=Matrix.Translation((0, 0, 0.5 * ((Z_APEX + 1.10) - Z_CHAND))))
    # Ornate central turned spire & bottom drop finial
    spire_prof = [
        (0.004, -1.28), (0.042, -1.16), (0.095, -0.96), (0.048, -0.82),
        (0.115, -0.42), (0.075, -0.18), (0.140, 0.0), (0.075, 0.18),
        (0.105, 0.48), (0.055, 0.88), (0.095, 1.04), (0.004, 1.12),
    ]
    bm_add_lathe(bm_ch_br, spire_prof, segs=20)

    # 3 Concentric Sculpted Beveled Armillary Rings (horizontal equatorial + 2 inclined celestial bands)
    bm_add_lathe(bm_ch_br, chamfer_ring_profile(1.22, 1.36, -0.055, 0.055, 0.014), segs=40)
    bm_add_lathe(bm_ch_br, chamfer_ring_profile(0.92, 1.03, -0.042, 0.042, 0.012), segs=36,
                 matrix=Matrix.Rotation(math.radians(52), 4, "X") @ Matrix.Rotation(math.radians(24), 4, "Z"))
    bm_add_lathe(bm_ch_br, chamfer_ring_profile(0.68, 0.77, -0.036, 0.036, 0.010), segs=32,
                 matrix=Matrix.Rotation(math.radians(-48), 4, "Y") @ Matrix.Rotation(math.radians(38), 4, "Z"))
    for i in range(24):
        a = (2.0 * math.pi * i) / 24.0
        m_st = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((1.375, 0.0, 0.0))
        bm_add_box(bm_ch_br, 0.032, 0.022, 0.042, matrix=m_st)

    # 12 Curved S-Scroll Brass Candle Arms + Warm Glowing Alabaster Lantern Globes
    arm_prof = circle_profile(0.018, 0.024, segs=6)
    for i in range(12):
        a = (2.0 * math.pi * i) / 12.0
        m_a = Matrix.Rotation(a, 4, "Z")
        pts_arm = [
            (0.11, 0.0, -0.28),
            (0.48, 0.0, -0.34),
            (0.92, 0.0, -0.18),
            (1.28, 0.0, 0.0),
            (1.52, 0.0, 0.14),
            (1.62, 0.0, 0.24),
        ]
        bm_sweep_tube(bm_ch_br, pts_arm, arm_prof, closed=False, cap_ends=True, scales=[1.1, 1.0, 0.95, 0.9, 0.85, 0.8], matrix=m_a)
        bm_add_lathe(bm_ch_br, [(0.01, 0.21), (0.085, 0.23), (0.095, 0.26), (0.04, 0.26), (0.01, 0.21)], segs=12,
                     matrix=m_a @ Matrix.Translation((1.62, 0.0, 0.0)))
        tmp_gl = bmesh.new()
        bmesh.ops.create_uvsphere(tmp_gl, u_segments=12, v_segments=8, radius=0.105)
        bm_merge(bm_ch_gl, tmp_gl, m_a @ Matrix.Translation((1.62, 0.0, 0.35)))

    finalize_obj("Chandelier_Armillary_Brass", bm_ch_br, mats["london_brass"], col, parent=chand_pivot, uv_mode="box", uv_scale=1.5)
    finalize_obj("Chandelier_Alabaster_Globes", bm_ch_gl, mats["london_chandelier_glow"], col, parent=chand_pivot, uv_mode="box", uv_scale=1.0)

    # --- G. Hero Carved Dark-Walnut & Marble Debate Table (Top strictly flush Z = 0.780m!) ---
    tbl_root = make_empty("London_Hero_Table", col, parent=root)
    bm_tw = bmesh.new()   # Walnut base & apron
    bm_tm = bmesh.new()   # Veined marble tabletop
    bm_tl = bmesh.new()   # Stitched leather center pad
    bm_tb = bmesh.new()   # Brass sabots, collars, perimeter inlay

    # Twin lathe-turned fluted oval-pedestal walnut columns at X = ±0.66m
    ped_prof = [
        (0.01, 0.08), (0.21, 0.08), (0.22, 0.14), (0.16, 0.20),
        (0.13, 0.28), (0.17, 0.42), (0.18, 0.52), (0.13, 0.62),
        (0.17, 0.68), (0.01, 0.68),
    ]
    foot_prof = chamfer_rect_2d(0.052, 0.042, 0.012)
    for sx in (-0.66, 0.66):
        m_p = Matrix.Translation((sx, 0.0, 0.0))
        bm_add_lathe(bm_tw, ped_prof, segs=24, matrix=m_p)
        bm_add_lathe(bm_tb, chamfer_ring_profile(0.155, 0.178, 0.18, 0.21, 0.006), segs=24, matrix=m_p)
        bm_add_lathe(bm_tb, chamfer_ring_profile(0.125, 0.148, 0.60, 0.63, 0.006), segs=24, matrix=m_p)
        # 4 sweeping cabriole walnut feet per pedestal with tapered brass sabots resting cleanly on Z=0.000
        for fi in range(4):
            fa = math.pi * 0.25 + fi * math.pi * 0.5
            ca, sa = math.cos(fa), math.sin(fa)
            pts_f = [
                (0.14 * ca, 0.14 * sa, 0.16),
                (0.26 * ca, 0.26 * sa, 0.11),
                (0.37 * ca, 0.37 * sa, 0.045),
                (0.42 * ca, 0.42 * sa, 0.018),
            ]
            bm_sweep_tube(bm_tw, pts_f, foot_prof, closed=False, cap_ends=True, scales=[1.1, 1.0, 0.85, 0.72], matrix=m_p)
            # Brass sabot toe flush with Z = 0.000
            m_sab = m_p @ Matrix.Translation((0.43 * ca, 0.43 * sa, 0.022)) @ Matrix.Rotation(fa, 4, "Z")
            bm_add_box(bm_tb, 0.075, 0.075, 0.044, matrix=m_sab, bevel=0.012)

    # Arched carved walnut stretcher connecting the two pedestals
    pts_str = [(-0.62, 0.0, 0.18), (-0.32, 0.0, 0.25), (0.0, 0.0, 0.28), (0.32, 0.0, 0.25), (0.62, 0.0, 0.18)]
    bm_sweep_tube(bm_tw, pts_str, chamfer_rect_2d(0.055, 0.048, 0.012), closed=False, cap_ends=True)

    # Clean multi-ring quad-beveled stadium apron & tabletop (ZERO N-gon bevel overlap artifacts!)
    def add_beveled_stadium_slab(bm_dst, hx, hy, z0, z1, bevel_xy=0.014, bevel_z=0.012, arc_segs=14):
        pts_in = stadium_outline_2d(hx - bevel_xy, hy - bevel_xy, arc_segs=arc_segs)
        pts_out = stadium_outline_2d(hx, hy, arc_segs=arc_segs)
        tmp = bmesh.new()
        r0 = [tmp.verts.new((x, y, z0)) for (x, y) in pts_in]
        r1 = [tmp.verts.new((x, y, z0 + bevel_z)) for (x, y) in pts_out]
        r2 = [tmp.verts.new((x, y, z1 - bevel_z)) for (x, y) in pts_out]
        r3 = [tmp.verts.new((x, y, z1)) for (x, y) in pts_in]
        n = len(pts_out)
        for i in range(n):
            ni = (i + 1) % n
            tmp.faces.new((r0[i], r0[ni], r1[ni], r1[i]))
            tmp.faces.new((r1[i], r1[ni], r2[ni], r2[i]))
            tmp.faces.new((r2[i], r2[ni], r3[ni], r3[i]))
        # Clean radial fan caps at center so top/bottom faces are 100% planar & convex!
        vc_bot = tmp.verts.new((0.0, 0.0, z0))
        vc_top = tmp.verts.new((0.0, 0.0, z1))
        for i in range(n):
            ni = (i + 1) % n
            tmp.faces.new((vc_bot, r0[ni], r0[i]))
            tmp.faces.new((vc_top, r3[i], r3[ni]))
        bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
        bm_merge(bm_dst, tmp)

    # Carved recessed stadium apron skirt beneath tabletop (Z = 0.635..0.725m)
    add_beveled_stadium_slab(bm_tw, 1.09, 0.525, 0.635, 0.725, bevel_xy=0.012, bevel_z=0.010, arc_segs=12)
    # Satin brass bead trim wrapping lower edge of apron
    add_beveled_stadium_slab(bm_tb, 1.102, 0.534, 0.632, 0.648, bevel_xy=0.004, bevel_z=0.003, arc_segs=12)

    # Beveled Veined Marble Tabletop (2.40m x 1.25m, Z = 0.724..0.780m — TOP STRICTLY FLUSH AT 0.780m!)
    add_beveled_stadium_slab(bm_tm, 1.20, 0.625, 0.724, 0.780, bevel_xy=0.016, bevel_z=0.012, arc_segs=16)
    # Recessed brass hairline inlay frame around leather executive blotter
    inlay_pts = rounded_rect_2d(0.76, 0.41, 0.10, corner_segs=6)
    bm_add_extruded_poly_2d(bm_tb, inlay_pts, 0.774, 0.7804, bevel=0.0)
    # Stitched executive leather center writing pad (flush at Z = 0.7808m)
    pad_pts = rounded_rect_2d(0.742, 0.392, 0.09, corner_segs=6)
    bm_add_extruded_poly_2d(bm_tl, pad_pts, 0.775, 0.7808, bevel=0.0)

    finalize_obj("London_Table_Walnut", bm_tw, mats["table_walnut"], col, parent=tbl_root, uv_mode="box", uv_scale=0.9)
    finalize_obj("London_Table_Marble", bm_tm, mats["table_marble"], col, parent=tbl_root, uv_mode="box", uv_scale=0.8)
    finalize_obj("London_Table_Leather", bm_tl, mats["table_leather"], col, parent=tbl_root, uv_mode="box", uv_scale=1.2)
    finalize_obj("London_Table_Brass", bm_tb, mats["london_brass"], col, parent=tbl_root, uv_mode="box", uv_scale=1.5)

    return col, root


# ===========================================================================
# 2. TOKYO 70TH-FLOOR SKY PAVILION (godot/assets/aaa_models/tokyo_pavilion_room.glb)
# ===========================================================================
def build_tokyo_pavilion(mats):
    col = make_collection("Venue_Tokyo_Pavilion")
    root = make_empty("Tokyo_Pavilion_Root", col)

    # Interior Envelope: 14.0m wide (X in [-7, +7]) x 12.0m deep (Y in [-6, +6]), Height Z = 4.90m
    # Panoramic rain-glass curtain wall at Blender Y = +5.65m (Godot Z = -5.65m) facing camera!
    W_HALF = 7.00
    Y_BACK = 5.65    # Panoramic skyline window wall (behind table from camera at -Y)
    Y_FRONT = -6.35  # Behind camera
    H_CEIL = 4.88

    # --- A. Floor: Honed Dark Slate Slabs + Minimalist Hinoki Timber Gallery Borders ---
    bm_fl = bmesh.new()
    bm_add_box(bm_fl, 14.6, 12.6, 0.24, matrix=Matrix.Translation((0.0, -0.35, -0.12)))
    finalize_obj("Tokyo_Floor_Slate", bm_fl, mats["tokyo_slate"], col, parent=root, uv_mode="box", uv_scale=0.5)

    # Raised minimal hinoki side gallery deck walkways + recessed brass floor joints
    bm_fl_wood = bmesh.new()
    bm_fl_br = bmesh.new()
    for sx in (-1, 1):
        bm_add_box(bm_fl_wood, 1.35, 11.4, 0.04, matrix=Matrix.Translation((sx * 6.22, -0.35, 0.02)), bevel=0.008)
    # Recessed dark-wood perimeter floor framing around central executive zone (flush Z = 0.003)
    bm_add_box(bm_fl_br, 4.84, 0.028, 0.006, matrix=Matrix.Translation((0.0, 2.35, 0.003)))
    bm_add_box(bm_fl_br, 4.84, 0.028, 0.006, matrix=Matrix.Translation((0.0, -2.35, 0.003)))
    bm_add_box(bm_fl_br, 0.028, 4.72, 0.006, matrix=Matrix.Translation((2.42, 0.0, 0.003)))
    bm_add_box(bm_fl_br, 0.028, 4.72, 0.006, matrix=Matrix.Translation((-2.42, 0.0, 0.003)))
    # Minimalist dark stone window-sill viewing bench along panoramic glass wall (Z = 0..0.38m)
    bm_add_box(bm_fl_wood, 13.6, 0.56, 0.34, matrix=Matrix.Translation((0.0, Y_BACK - 0.34, 0.17)), bevel=0.016)
    bm_add_box(bm_fl_br, 13.5, 0.03, 0.02, matrix=Matrix.Translation((0.0, Y_BACK - 0.62, 0.335)), bevel=0.004)

    finalize_obj("Tokyo_Floor_TimberDeck", bm_fl_wood, mats["tokyo_dark_wood"], col, parent=root, uv_mode="box", uv_scale=0.6)
    finalize_obj("Tokyo_Floor_BrassReveal", bm_fl_br, mats["tokyo_kintsugi"], col, parent=root, uv_mode="box", uv_scale=1.2)

    # --- B. Crafted Wooden Hinoki Kumiko Lattice Screens (Left & Right Gallery Bays) ---
    bm_kum_frame = bmesh.new()
    bm_kum_hinoki = bmesh.new()
    bm_kum_washi = bmesh.new()

    def add_kumiko_screen(cx, cy, width, height, rot_z=0.0):
        m_scr = Matrix.Translation((cx, cy, 0.0)) @ Matrix.Rotation(rot_z, 4, "Z")
        # Outer dark ebony-walnut architectural frame (stiles + bottom kickplate + transom rail + header)
        bm_add_box(bm_kum_frame, 0.11, width, 0.24, matrix=m_scr @ Matrix.Translation((0, 0, 0.12)), bevel=0.01)
        bm_add_box(bm_kum_frame, 0.11, width, 0.14, matrix=m_scr @ Matrix.Translation((0, 0, height - 0.07)), bevel=0.01)
        bm_add_box(bm_kum_frame, 0.11, width, 0.09, matrix=m_scr @ Matrix.Translation((0, 0, height - 0.78)), bevel=0.008)
        for sy in (-width * 0.5 + 0.055, width * 0.5 - 0.055):
            bm_add_box(bm_kum_frame, 0.11, 0.11, height, matrix=m_scr @ Matrix.Translation((0, sy, height * 0.5)), bevel=0.01)

        # Warm frosted backlit Washi paper panel tucked cleanly BEHIND the hinoki lattice (-X = wall side!)
        bm_add_box(bm_kum_washi, 0.018, width - 0.22, height - 0.36, matrix=m_scr @ Matrix.Translation((-0.028, 0.0, height * 0.5 + 0.04)))

        # Fine crafted Hinoki wood Kumiko geometric lattice IN FRONT (+X = room-facing side!)
        z_bot, z_mid = 0.24, height - 0.82
        z_top = height - 0.14
        inner_w = width - 0.22
        n_cols = 5
        n_rows = 7
        col_w = inner_w / n_cols
        row_h = (z_mid - z_bot) / n_rows

        # Vertical hinoki muntins
        for c in range(1, n_cols):
            yy = -inner_w * 0.5 + c * col_w
            bm_add_box(bm_kum_hinoki, 0.046, 0.028, z_mid - z_bot, matrix=m_scr @ Matrix.Translation((0.024, yy, 0.5 * (z_bot + z_mid))))
        # Horizontal hinoki muntins
        for r in range(1, n_rows):
            zz = z_bot + r * row_h
            bm_add_box(bm_kum_hinoki, 0.046, inner_w, 0.028, matrix=m_scr @ Matrix.Translation((0.024, 0.0, zz)))

        # Intricate diamond / Asanoha kumiko diagonal lattice braces in alternating cells
        diag_len = math.hypot(col_w, row_h)
        diag_ang = math.atan2(row_h, col_w)
        for c in range(n_cols):
            yc = -inner_w * 0.5 + (c + 0.5) * col_w
            for r in range(n_rows):
                zc = z_bot + (r + 0.5) * row_h
                if (c + r) % 2 == 0:
                    for sgn in (-1, 1):
                        m_d = m_scr @ Matrix.Translation((0.026, yc, zc)) @ Matrix.Rotation(sgn * diag_ang, 4, "X")
                        bm_add_box(bm_kum_hinoki, 0.032, diag_len * 0.96, 0.020, matrix=m_d)
                else:
                    # Inner Asanoha diamond star inside alternating cells
                    bm_add_box(bm_kum_hinoki, 0.032, col_w * 0.62, 0.018, matrix=m_scr @ Matrix.Translation((0.026, yc, zc)))
                    bm_add_box(bm_kum_hinoki, 0.032, 0.018, row_h * 0.62, matrix=m_scr @ Matrix.Translation((0.026, yc, zc)))

        # Fine vertical Ranma transom slats above z_mid
        for k in range(13):
            yy = -inner_w * 0.5 + (k + 0.5) * (inner_w / 13.0)
            bm_add_box(bm_kum_hinoki, 0.040, 0.022, z_top - (z_mid + 0.08),
                       matrix=m_scr @ Matrix.Translation((0.024, yy, 0.5 * (z_mid + 0.08 + z_top))))

    # Left wall (X = -6.78m, facing +X -> rot_z = 0) and Right wall (X = +6.78m, facing -X -> rot_z = pi)
    # Place 2 grand Kumiko lattice screen bays + 2 sculpted Origami acoustic piers on each side wall!
    for side, rot_z in ((-1, 0.0), (1, math.pi)):
        # Front-middle and rear-middle kumiko screens
        add_kumiko_screen(side * 6.72, 2.35, 2.75, 4.58, rot_z=rot_z)
        add_kumiko_screen(side * 6.72, -3.15, 2.75, 4.58, rot_z=rot_z)

    finalize_obj("Tokyo_Kumiko_Frames", bm_kum_frame, mats["tokyo_dark_wood"], col, parent=root, uv_mode="box", uv_scale=0.8)
    finalize_obj("Tokyo_Kumiko_HinokiLattice", bm_kum_hinoki, mats["tokyo_hinoki"], col, parent=root, uv_mode="box", uv_scale=1.2)
    finalize_obj("Tokyo_Kumiko_WashiPanels", bm_kum_washi, mats["tokyo_washi_glow"], col, parent=root, uv_mode="box", uv_scale=0.6)

    # --- C. Sleek Angled Obsidian Origami Acoustic Wall Panels (Crisp Flat-Faceted Sculptural Folds!) ---
    bm_orig = bmesh.new()
    bm_orig_gold = bmesh.new()
    bm_orig_cove = bmesh.new()

    def add_origami_wall_panel(x_plane, y_center, span_w, height, facing_sign=+1, axis="X"):
        """
        Builds a genuine 3D pleated Miura-ori / diamond-faceted obsidian acoustic wall!
        Each vertex alternates relief depth cleanly so dramatic light-and-shadow facets form.
        """
        nx = 6
        nz = 8
        tmp = bmesh.new()
        grid = []
        for iz in range(nz + 1):
            z = 0.08 + (height - 0.16) * (iz / nz)
            row = []
            for ix in range(nx + 1):
                u = -span_w * 0.5 + span_w * (ix / nx)
                # Alternate folded origami diamond peaks & valleys (0 at boundary edges so frame sits flush!)
                on_border = (ix == 0 or ix == nx or iz == 0 or iz == nz)
                if on_border:
                    depth = 0.0
                else:
                    # Crisp asymmetrical faceted relief (0.04m .. 0.24m)
                    peak = 0.22 if ((ix + iz) % 2 == 0) else 0.05
                    # Slight horizontal Miura-ori zig-zag shift
                    u += (0.09 if (iz % 2 == 1) else -0.09)
                    depth = peak
                if axis == "X":
                    co = (x_plane + facing_sign * depth, y_center + u, z)
                else:
                    co = (y_center + u, x_plane + facing_sign * depth, z)
                row.append(tmp.verts.new(co))
            grid.append(row)

        # Triangulate quads along alternating fold diagonals for razor-crisp origami pleats!
        for iz in range(nz):
            for ix in range(nx):
                v00 = grid[iz][ix]
                v10 = grid[iz][ix + 1]
                v11 = grid[iz + 1][ix + 1]
                v01 = grid[iz + 1][ix]
                if (ix + iz) % 2 == 0:
                    tmp.faces.new((v00, v10, v11))
                    tmp.faces.new((v00, v11, v01))
                else:
                    tmp.faces.new((v00, v10, v01))
                    tmp.faces.new((v10, v11, v01))

        # Back wall thickness box behind origami face so zero light leaks
        if axis == "X":
            bm_add_box(bm_orig, 0.24, span_w + 0.12, height, matrix=Matrix.Translation((x_plane - facing_sign * 0.14, y_center, height * 0.5)))
            # Delicate recessed vertical gold architectural reveal flanking the origami pier
            for sy in (-span_w * 0.5 - 0.05, span_w * 0.5 + 0.05):
                bm_add_box(bm_orig_gold, 0.04, 0.025, height - 0.2, matrix=Matrix.Translation((x_plane + facing_sign * 0.02, y_center + sy, height * 0.5)))
                bm_add_box(bm_orig_cove, 0.015, 0.018, height - 0.3, matrix=Matrix.Translation((x_plane - facing_sign * 0.02, y_center + sy, height * 0.5)))
        else:
            bm_add_box(bm_orig, span_w + 0.12, 0.24, height, matrix=Matrix.Translation((y_center, x_plane - facing_sign * 0.14, height * 0.5)))

        # Orient face normals strictly toward room interior
        bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
        for f in tmp.faces:
            if axis == "X" and (f.normal.x * facing_sign < 0):
                f.normal_flip()
            elif axis == "Y" and (f.normal.y * facing_sign < 0):
                f.normal_flip()
        bm_merge(bm_orig, tmp)

    # Central dramatic origami acoustic piers on Left (X=-6.75) & Right (X=+6.75) walls + angled skyline corner piers!
    add_origami_wall_panel(-6.75, -0.40, 2.55, 4.68, facing_sign=+1, axis="X")
    add_origami_wall_panel(+6.75, -0.40, 2.55, 4.68, facing_sign=-1, axis="X")
    # Flanking corner piers framing the panoramic rain-glass curtain wall at Y = +4.75
    add_origami_wall_panel(-6.75, 4.68, 1.75, 4.68, facing_sign=+1, axis="X")
    add_origami_wall_panel(+6.75, 4.68, 1.75, 4.68, facing_sign=-1, axis="X")
    # Rear entrance wall origami acoustic paneling behind camera (Y = -6.25m)
    add_origami_wall_panel(-6.20, 0.0, 13.6, 4.68, facing_sign=+1, axis="Y")

    # Flat-shaded (smooth=False!) so every origami acoustic facet gleams crisply!
    finalize_obj("Tokyo_Origami_WallPanels", bm_orig, mats["tokyo_obsidian"], col, parent=root, smooth=False, uv_mode="box", uv_scale=0.5, recalc_normals=False)
    finalize_obj("Tokyo_Origami_GoldReveals", bm_orig_gold, mats["tokyo_kintsugi"], col, parent=root, uv_mode="box", uv_scale=1.2)
    finalize_obj("Tokyo_Architectural_CoveLight", bm_orig_cove, mats["tokyo_cove_glow"], col, parent=root, uv_mode="box", uv_scale=1.0)

    # --- D. Coffered Hinoki Timber-Slat Ceiling + Minimalist Linear Bronze Chandelier ---
    bm_ceil_obs = bmesh.new()
    bm_ceil_hin = bmesh.new()
    bm_ceil_stl = bmesh.new()
    bm_ceil_glw = bmesh.new()

    # Solid dark acoustic plenum slab above slats
    bm_add_box(bm_ceil_obs, 14.6, 12.6, 0.28, matrix=Matrix.Translation((0.0, -0.35, H_CEIL + 0.14)))
    # Perimeter recessed dark soffit beams
    bm_add_box(bm_ceil_obs, 14.2, 0.72, 0.28, matrix=Matrix.Translation((0.0, Y_BACK - 0.25, H_CEIL - 0.14)))
    bm_add_box(bm_ceil_obs, 14.2, 0.72, 0.28, matrix=Matrix.Translation((0.0, Y_FRONT + 0.35, H_CEIL - 0.14)))
    # 28 Sleek parallel architectural Hinoki cedar ceiling acoustic fins running along X
    for i in range(28):
        yy = Y_FRONT + 0.85 + i * ((Y_BACK - Y_FRONT - 1.50) / 27.0)
        bm_add_box(bm_ceil_hin, 13.2, 0.055, 0.18, matrix=Matrix.Translation((0.0, yy, H_CEIL - 0.10)), bevel=0.006)
    # Minimalist floating suspended rectangular bronze & warm-crystal architectural light bar over executive table
    Z_FIX = 3.88
    bm_add_box(bm_ceil_stl, 2.85, 0.16, 0.065, matrix=Matrix.Translation((0.0, 0.0, Z_FIX)), bevel=0.01)
    bm_add_box(bm_ceil_glw, 2.74, 0.09, 0.025, matrix=Matrix.Translation((0.0, 0.0, Z_FIX - 0.032)))
    for sx in (-1.10, 1.10):
        bm_add_cyl(bm_ceil_stl, 0.008, 0.008, H_CEIL - Z_FIX, segs=8, matrix=Matrix.Translation((sx, 0.0, 0.5 * (H_CEIL + Z_FIX))))

    finalize_obj("Tokyo_Ceiling_Plenum", bm_ceil_obs, mats["tokyo_obsidian"], col, parent=root, uv_mode="box", uv_scale=0.5)
    finalize_obj("Tokyo_Ceiling_HinokiFins", bm_ceil_hin, mats["tokyo_hinoki"], col, parent=root, uv_mode="box", uv_scale=0.8)
    finalize_obj("Tokyo_LinearFixture_Frame", bm_ceil_stl, mats["tokyo_steel"], col, parent=root, uv_mode="box", uv_scale=1.2)
    finalize_obj("Tokyo_LinearFixture_Glow", bm_ceil_glw, mats["tokyo_cove_glow"], col, parent=root, uv_mode="box", uv_scale=1.0)

    # --- E. Panoramic Rain-Glass Curtain Wall Frame (Blender Y = +5.65m -> Godot Z = -5.65m) ---
    bm_mull = bmesh.new()
    bm_glass = bmesh.new()
    # Top & bottom structural anodized steel header/sill channels
    bm_add_box(bm_mull, 13.9, 0.18, 0.14, matrix=Matrix.Translation((0.0, Y_BACK, 0.39)), bevel=0.012)
    bm_add_box(bm_mull, 13.9, 0.18, 0.16, matrix=Matrix.Translation((0.0, Y_BACK, H_CEIL - 0.24)), bevel=0.012)
    # Horizontal architectural transom bar (upper clerestory proportion at Z = 3.72m)
    bm_add_box(bm_mull, 13.8, 0.11, 0.075, matrix=Matrix.Translation((0.0, Y_BACK, 3.72)), bevel=0.008)
    # 7 Slim structural vertical black-steel I-section mullions (leaving wide unobstructed central panorama!)
    for mx in (-6.80, -4.55, -2.28, 0.0, 2.28, 4.55, 6.80):
        # Deeper knife-edge structural fin projecting slightly inward
        bm_add_box(bm_mull, 0.075, 0.22, H_CEIL - 0.50, matrix=Matrix.Translation((mx, Y_BACK - 0.03, 0.5 * (0.40 + H_CEIL - 0.20))), bevel=0.008)
        bm_add_box(bm_mull, 0.12, 0.08, H_CEIL - 0.50, matrix=Matrix.Translation((mx, Y_BACK + 0.04, 0.5 * (0.40 + H_CEIL - 0.20))), bevel=0.008)

    # Subtle translucent rain-glass curtain pane
    bm_add_box(bm_glass, 13.6, 0.02, H_CEIL - 0.65, matrix=Matrix.Translation((0.0, Y_BACK + 0.02, 0.5 * (0.44 + H_CEIL - 0.26))))

    finalize_obj("Tokyo_CurtainWall_Mullions", bm_mull, mats["tokyo_steel"], col, parent=root, uv_mode="box", uv_scale=1.0)
    tok_gl_obj = finalize_obj("Tokyo_CurtainWall_RainGlass", bm_glass, mats["tokyo_rain_glass"], col, parent=root, uv_mode="box", uv_scale=0.5)
    tok_gl_obj.visible_shadow = False

    # --- F. Sculpted 3D Distant Illuminated Tokyo Skyscraper Silhouettes (Real 3D Parallax Outside!) ---
    bm_tw_body = bmesh.new()
    bm_tw_warm = bmesh.new()
    bm_tw_cool = bmesh.new()
    bm_tw_red = bmesh.new()

    # 18 Sculpted multi-tiered Tokyo skyscrapers with varied dramatic silhouettes against the night sky!
    # Positioned at Y = 26..62m with Z_top = 0.8..12.2m so stepped crowns, spires & sky read crisply through glass!
    towers = [
        (-24.0, 34.0, 4.6, 4.2, -20.0, 7.6,  "stepped", 0.65),
        (-17.8, 30.0, 3.8, 3.6, -20.0, 4.2,  "angled",  0.45),
        (-12.5, 38.0, 4.8, 4.4, -20.0, 9.8,  "crown",   0.70),
        (-7.4,  44.0, 5.2, 4.8, -20.0, 11.6, "stepped", 0.50),
        (-4.8,  28.0, 3.4, 3.2, -20.0, 2.4,  "angled",  0.75),
        (-0.8,  36.0, 4.4, 4.2, -20.0, 6.2,  "crown",   0.60),
        (2.8,   52.0, 5.8, 5.0, -20.0, 12.8, "stepped", 0.45),
        (5.2,   29.0, 3.6, 3.4, -20.0, 3.1,  "crown",   0.70),
        (11.4,  37.0, 4.8, 4.4, -20.0, 9.4,  "stepped", 0.55),
        (16.8,  32.0, 4.0, 3.8, -20.0, 5.4,  "angled",  0.65),
        (22.5,  39.0, 5.2, 4.8, -20.0, 8.8,  "crown",   0.50),
        (-19.5, 50.0, 5.6, 5.0, -22.0, 11.8, "crown",   0.55),
        (-9.6,  56.0, 6.0, 5.2, -22.0, 13.4, "stepped", 0.50),
        (15.2,  54.0, 5.8, 5.2, -22.0, 12.6, "crown",   0.45),
        (-10.2, 26.5, 3.0, 2.8, -18.0, 0.9,  "crown",   0.80),
        (0.6,   25.0, 3.2, 3.0, -18.0, 0.4,  "stepped", 0.70),
        (9.4,   26.5, 3.2, 3.0, -18.0, 1.4,  "angled",  0.65),
    ]
    for tidx, (tx, ty, tw, td, zb, zt, style, warm_p) in enumerate(towers):
        th = zt - zb
        zc = 0.5 * (zb + zt)
        bm_add_box(bm_tw_body, tw, td, th, matrix=Matrix.Translation((tx, ty, zc)), bevel=0.10)
        if style == "stepped":
            bm_add_box(bm_tw_body, tw * 0.70, td * 0.70, 1.8, matrix=Matrix.Translation((tx, ty, zt + 0.85)), bevel=0.08)
            bm_add_box(bm_tw_body, tw * 0.40, td * 0.40, 1.4, matrix=Matrix.Translation((tx, ty, zt + 2.35)), bevel=0.06)
            z_ant = zt + 3.05
        elif style == "crown":
            bm_add_box(bm_tw_body, tw * 0.84, td * 0.84, 1.4, matrix=Matrix.Translation((tx, ty, zt + 0.65)), bevel=0.08)
            bm_add_box(bm_tw_cool if tidx % 2 == 0 else bm_tw_warm, tw * 0.86, 0.14, 0.16,
                       matrix=Matrix.Translation((tx, ty - td * 0.43, zt + 1.05)))
            z_ant = zt + 1.35
        else:
            bm_add_box(bm_tw_body, tw * 0.84, td * 0.84, 1.9,
                       matrix=Matrix.Translation((tx, ty, zt + 0.5)) @ Matrix.Rotation(math.radians(15), 4, "Y"), bevel=0.08)
            z_ant = zt + 1.55

        bm_add_cyl(bm_tw_body, 0.06, 0.015, 2.2, segs=6, matrix=Matrix.Translation((tx, ty, z_ant + 1.1)))
        bm_add_box(bm_tw_red, 0.18, 0.18, 0.18, matrix=Matrix.Translation((tx, ty, z_ant + 2.25)))

        # Crisp fine architectural skyscraper office window clusters (sleek distant scale!)
        z_win = max(zb + 6.0, -4.5)
        row_i = 0
        while z_win < zt - 0.5:
            h_code = (tidx * 17 + row_i * 31) % 10
            if h_code < 6:
                is_warm = ((tidx * 7 + row_i * 13) % 10) < int(warm_p * 10)
                target_bm = bm_tw_warm if is_warm else bm_tw_cool
                seg_n = 5
                seg_w = (tw * 0.82) / seg_n
                for si in range(seg_n):
                    if ((tidx * 5 + row_i * 11 + si * 19) % 7) in (0, 2, 4, 5):
                        wx = tx - tw * 0.41 + (si + 0.5) * seg_w
                        bm_add_box(target_bm, seg_w * 0.62, 0.06, 0.14, matrix=Matrix.Translation((wx, ty - td * 0.50 - 0.03, z_win)))
            z_win += 0.68
            row_i += 1

    # Iconic Sculpted Tokyo Lattice Communications Tower Silhouette cleanly framed right-of-center (X=7.6, Y=41.0)
    tx_t, ty_t = 7.6, 41.0
    for leg_i in range(4):
        la = math.pi * 0.25 + leg_i * math.pi * 0.5
        ca, sa = math.cos(la), math.sin(la)
        pts_leg = [
            (tx_t + 3.0 * ca, ty_t + 3.0 * sa, -14.0),
            (tx_t + 1.55 * ca, ty_t + 1.55 * sa, -1.0),
            (tx_t + 0.65 * ca, ty_t + 0.65 * sa, 6.2),
            (tx_t + 0.20 * ca, ty_t + 0.20 * sa, 11.4),
        ]
        bm_sweep_tube(bm_tw_body, pts_leg, circle_profile(0.16, 0.16, segs=6), closed=False, cap_ends=True, scales=[1.3, 1.0, 0.7, 0.4])
    bm_add_box(bm_tw_body, 2.3, 2.3, 0.9, matrix=Matrix.Translation((tx_t, ty_t, 2.8)), bevel=0.10)
    bm_add_box(bm_tw_warm, 2.38, 2.38, 0.26, matrix=Matrix.Translation((tx_t, ty_t, 2.8)))
    bm_add_box(bm_tw_body, 1.25, 1.25, 0.72, matrix=Matrix.Translation((tx_t, ty_t, 7.6)), bevel=0.06)
    bm_add_box(bm_tw_warm, 1.32, 1.32, 0.22, matrix=Matrix.Translation((tx_t, ty_t, 7.6)))
    bm_add_cyl(bm_tw_body, 0.12, 0.03, 4.4, segs=8, matrix=Matrix.Translation((tx_t, ty_t, 13.4)))
    bm_add_box(bm_tw_red, 0.24, 0.24, 0.24, matrix=Matrix.Translation((tx_t, ty_t, 15.7)))

    finalize_obj("Tokyo_Skyline_Towers", bm_tw_body, mats["tokyo_tower_body"], col, parent=root, uv_mode="box", uv_scale=0.15)
    finalize_obj("Tokyo_Skyline_WinWarm", bm_tw_warm, mats["tokyo_win_warm"], col, parent=root, uv_mode="box", uv_scale=0.5)
    finalize_obj("Tokyo_Skyline_WinCool", bm_tw_cool, mats["tokyo_win_cool"], col, parent=root, uv_mode="box", uv_scale=0.5)
    finalize_obj("Tokyo_Skyline_Beacons", bm_tw_red, mats["tokyo_beacon_red"], col, parent=root, uv_mode="box", uv_scale=1.0)

    # --- G. Minimalist Dark-Lacquer & Gold-Kintsugi Executive Table (Top strictly flush Z = 0.780m!) ---
    tbl_root = make_empty("Tokyo_Hero_Table", col, parent=root)
    bm_lac = bmesh.new()
    bm_kin = bmesh.new()
    bm_brz = bmesh.new()

    # Graceful Sculptural Tapered Dark-Bronze & Lacquer Cantilevered Trestle Legs (ZERO chunky slabs!)
    trestle_prof = chamfer_rect_2d(0.042, 0.032, 0.009)
    for sx in (-1, 1):
        # Twin angled sculptural Y-blade legs sweeping elegantly inward from splayed bronze shoes up to cradle beam
        for sy in (-1, 1):
            pts_bl = [
                (sx * 0.94, sy * 0.44, 0.025),
                (sx * 0.84, sy * 0.34, 0.24),
                (sx * 0.72, sy * 0.22, 0.50),
                (sx * 0.68, sy * 0.16, 0.705),
            ]
            bm_sweep_tube(bm_brz, pts_bl, trestle_prof, closed=False, cap_ends=True, scales=[0.78, 1.0, 1.05, 1.15])
            # Tapered brushed-gold sabot foot flush on Z = 0.000
            bm_add_box(bm_kin, 0.095, 0.075, 0.032, matrix=Matrix.Translation((sx * 0.94, sy * 0.44, 0.016)), bevel=0.008)
        # Sleek angled bronze cross-brace bar linking front & back blades on each end
        bm_add_box(bm_brz, 0.055, 0.70, 0.048, matrix=Matrix.Translation((sx * 0.82, 0.0, 0.24)), bevel=0.01)
        bm_add_box(bm_kin, 0.062, 0.66, 0.014, matrix=Matrix.Translation((sx * 0.82, 0.0, 0.24)), bevel=0.003)
        # Sculpted faceted lacquer knee fin uniting the twin blades gracefully
        bm_add_box(bm_lac, 0.085, 0.36, 0.38, matrix=Matrix.Translation((sx * 0.73, 0.0, 0.48)), bevel=0.018)

    # Floating brushed-gold architectural spine beam uniting both tapered dark-bronze trestles
    bm_add_box(bm_kin, 1.62, 0.065, 0.042, matrix=Matrix.Translation((0.0, 0.0, 0.24)), bevel=0.008)
    bm_add_box(bm_brz, 1.56, 0.64, 0.045, matrix=Matrix.Translation((0.0, 0.0, 0.702)), bevel=0.01)

    # Knife-edge chamfered Urushi dark-lacquer tabletop (2.40m x 1.25m, top STRICTLY flush Z = 0.780m!)
    top_upper = rounded_rect_2d(1.20, 0.625, 0.08, corner_segs=6)
    top_lower = rounded_rect_2d(1.14, 0.565, 0.07, corner_segs=6)
    tmp_top = bmesh.new()
    v_lo = [tmp_top.verts.new((x, y, 0.720)) for (x, y) in top_lower]
    v_md = [tmp_top.verts.new((x, y, 0.764)) for (x, y) in top_upper]
    v_hi = [tmp_top.verts.new((x, y, 0.780)) for (x, y) in top_upper]
    n_t = len(top_upper)
    for i in range(n_t):
        ni = (i + 1) % n_t
        tmp_top.faces.new((v_lo[i], v_lo[ni], v_md[ni], v_md[i]))
        tmp_top.faces.new((v_md[i], v_md[ni], v_hi[ni], v_hi[i]))
    tmp_top.faces.new(list(reversed(v_lo)))
    tmp_top.faces.new(v_hi)
    bmesh.ops.recalc_face_normals(tmp_top, faces=list(tmp_top.faces))
    bm_merge(bm_lac, tmp_top)

    # Real Sculpted Branching Gold Kintsugi Seam Veins inlaid flush into the dark lacquer tabletop (Z = 0.7805m)!
    kintsugi_paths = [
        # Main diagonal lacquer fault river sweeping gracefully across the table
        [(-1.14, -0.34, 0.7804), (-0.82, -0.18, 0.7804), (-0.54, -0.24, 0.7804), (-0.28, -0.05, 0.7804),
         (0.06, 0.04, 0.7804), (0.38, -0.09, 0.7804), (0.68, 0.14, 0.7804), (0.96, 0.22, 0.7804), (1.16, 0.36, 0.7804)],
        # Upper-left tributary vein
        [(-0.54, -0.24, 0.7804), (-0.42, 0.08, 0.7804), (-0.62, 0.34, 0.7804), (-0.78, 0.56, 0.7804)],
        # Lower-right tributary vein
        [(0.38, -0.09, 0.7804), (0.52, -0.34, 0.7804), (0.72, -0.56, 0.7804)],
        # Delicate central fork vein
        [(0.06, 0.04, 0.7804), (0.22, 0.32, 0.7804), (0.14, 0.56, 0.7804)],
    ]
    kint_prof = chamfer_rect_2d(0.017, 0.0028, 0.0012)
    for k_i, path in enumerate(kintsugi_paths):
        scs = [1.05 if k_i == 0 else 0.78] * len(path)
        bm_sweep_tube(bm_kin, path, kint_prof, closed=False, cap_ends=True, scales=scs)
    # Thin brass hairline inlay framing underside knife-edge transition
    bm_add_extruded_poly_2d(bm_kin, rounded_rect_2d(1.196, 0.621, 0.078, corner_segs=6), 0.761, 0.766, bevel=0.001)

    finalize_obj("Tokyo_Table_Lacquer", bm_lac, mats["tokyo_lacquer"], col, parent=tbl_root, uv_mode="box", uv_scale=0.8)
    finalize_obj("Tokyo_Table_BronzeLegs", bm_brz, mats["tokyo_steel"], col, parent=tbl_root, uv_mode="box", uv_scale=1.2)
    finalize_obj("Tokyo_Table_KintsugiGold", bm_kin, mats["tokyo_kintsugi"], col, parent=tbl_root, uv_mode="box", uv_scale=1.5)

    return col, root


# ===========================================================================
# 3. CAIRO SUBTERRANEAN SOLAR HALL (godot/assets/aaa_models/cairo_solar_hall.glb)
# ===========================================================================
def build_cairo_solar_hall(mats):
    col = make_collection("Venue_Cairo_SolarHall")
    root = make_empty("Cairo_SolarHall_Root", col)

    R_WALL = 7.50
    N_BAYS = 8
    BAY_OFF = math.pi / N_BAYS  # Pylons at 22.5 + k*45 deg so +Y sightline centers cleanly on a grand baffle bay!

    # --- A. Floor: Sandstone & Travertine Concentric Slabs + Obsidian Ring & Antique Brass Solar Meridians ---
    bm_fl_tr = bmesh.new()
    bm_fl_ob = bmesh.new()
    bm_fl_br = bmesh.new()

    bm_add_lathe(bm_fl_tr, [(0.001, -0.25), (R_WALL + 0.45, -0.25), (R_WALL + 0.45, 0.0), (0.001, 0.0)], segs=64, closed_profile=True)
    # Flush honed black-obsidian circular compass band (r = 2.65..3.25m, Z = 0.002m)
    bm_add_lathe(bm_fl_ob, chamfer_ring_profile(2.65, 3.25, -0.01, 0.0028, 0.002), segs=64)
    # Central subtle obsidian sundial plinth halo beneath the vault table
    bm_add_lathe(bm_fl_ob, chamfer_ring_profile(0.01, 1.65, -0.01, 0.0024, 0.002), segs=48)
    # Antique brass solar azimuth inlay rings & 8 radiating meridian strips
    for rr in (1.665, 2.64, 3.26, 5.20):
        bm_add_lathe(bm_fl_br, chamfer_ring_profile(rr - 0.026, rr + 0.026, -0.004, 0.0042, 0.002), segs=64)
    for i in range(8):
        a = i * (2.0 * math.pi / 8.0)
        bm_add_box(bm_fl_br, 3.55, 0.036, 0.005, matrix=Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((3.45, 0.0, 0.0022)))

    finalize_obj("Cairo_Floor_Travertine", bm_fl_tr, mats["cairo_travertine"], col, parent=root, uv_mode="box", uv_scale=0.45)
    finalize_obj("Cairo_Floor_ObsidianInlay", bm_fl_ob, mats["cairo_obsidian"], col, parent=root, uv_mode="box", uv_scale=0.6)
    finalize_obj("Cairo_Floor_BrassMeridians", bm_fl_br, mats["cairo_brass"], col, parent=root, uv_mode="box", uv_scale=1.2)

    # --- B. Circular Subterranean Amphitheater: Stepped Limestone Tiers + Acoustic Wall Baffles + Antique Brass Ribs ---
    bm_stone = bmesh.new()
    bm_br = bmesh.new()
    bm_cove = bmesh.new()

    # Solid monolithic sandstone outer containment cylinder (r = 7.35..8.05, Z = 0..5.75)
    bm_add_lathe(bm_stone, [
        (7.35, -0.15), (8.05, -0.15), (8.05, 5.75), (7.35, 5.75),
    ], segs=48, closed_profile=True)

    # 3 Stepped Circular Amphitheater Limestone Seating Tiers around the perimeter (r = 5.55..7.35, Z = 0..1.26)
    tier_specs = [
        (5.55, 7.35, 0.00, 0.42),
        (6.15, 7.35, 0.42, 0.84),
        (6.72, 7.35, 0.84, 1.26),
    ]
    for r_in, r_out, z0, z1 in tier_specs:
        bm_add_lathe(bm_stone, chamfer_ring_profile(r_in, r_out, z0, z1, 0.024), segs=48)
        # Recessed antique brass edge nosing strip along each amphitheater step!
        bm_add_lathe(bm_br, chamfer_ring_profile(r_in - 0.01, r_in + 0.06, z1 - 0.030, z1 + 0.004, 0.006), segs=48)

    # 8 Monumental Battered Egyptian-Modernist Pylon Pilasters (Z = 0..5.60m) with Cavetto Gorge Cornices & Brass Spines
    pylon_angles = [BAY_OFF + i * (2.0 * math.pi / N_BAYS) for i in range(N_BAYS)]
    for pa in pylon_angles:
        m_p = Matrix.Rotation(pa, 4, "Z")
        for seg_i in range(5):
            z0 = 0.0 + seg_i * 1.03
            z1 = z0 + 1.03
            w_s = 1.18 - seg_i * 0.06
            d_s = 1.05 - seg_i * 0.05
            r_c = 6.95 + seg_i * 0.03
            bm_add_box(bm_stone, d_s, w_s, 1.01, matrix=m_p @ Matrix.Translation((r_c, 0.0, 0.5 * (z0 + z1))), bevel=0.03)
            bm_add_box(bm_br, d_s + 0.04, w_s + 0.04, 0.042, matrix=m_p @ Matrix.Translation((r_c - 0.01, 0.0, z1)), bevel=0.008)
        bm_add_box(bm_br, 0.08, 0.14, 5.05, matrix=m_p @ Matrix.Translation((6.44, 0.0, 2.55)), bevel=0.012)
        bm_add_box(bm_br, 0.24, 1.16, 0.09, matrix=m_p @ Matrix.Translation((6.56, 0.0, 5.20)), bevel=0.022)
        bm_add_box(bm_stone, 1.24, 1.32, 0.34, matrix=m_p @ Matrix.Translation((6.82, 0.0, 5.44)), bevel=0.04)

    # 9 Tiers of Sculpted Stepped Acoustic Limestone Wall Baffles Inlaid with Antique Brass Ribs (Z = 1.54..5.05m)!
    for b_i in range(N_BAYS):
        a0 = pylon_angles[b_i] + 0.115
        a1 = pylon_angles[(b_i + 1) % N_BAYS] - 0.115
        if a1 < a0:
            a1 += 2.0 * math.pi
        for tier in range(9):
            zt = 1.54 + tier * 0.39
            r_baffle_in = 6.72 + 0.16 * math.sin(tier * 0.68) - 0.02 * (tier % 2)
            bm_add_sector(bm_stone, r_baffle_in, 7.38, zt, zt + 0.26, a0, a1, segs=8, bevel=0.022)
            bm_add_sector(bm_br, r_baffle_in - 0.022, r_baffle_in + 0.04, zt + 0.09, zt + 0.16, a0 + 0.01, a1 - 0.01, segs=8, bevel=0.007)
        bm_add_sector(bm_cove, 7.18, 7.30, 1.30, 1.38, a0 + 0.02, a1 - 0.02, segs=6)

    # Stepped Conical Observatory Vault Ceiling (Z = 5.54..6.68m, tapering from R=7.45m inward to Solar Oculus R=2.55m!)
    vault_steps = [
        (6.45, 7.60, 5.54, 5.82),
        (5.35, 6.65, 5.76, 6.04),
        (4.25, 5.55, 5.98, 6.26),
        (3.25, 4.45, 6.20, 6.48),
        (2.48, 3.45, 6.42, 6.76),
    ]
    for r_in, r_out, z0, z1 in vault_steps:
        bm_add_lathe(bm_stone, chamfer_ring_profile(r_in, r_out, z0, z1, 0.028), segs=48)
        bm_add_lathe(bm_br, chamfer_ring_profile(r_in - 0.02, r_in + 0.06, z0 - 0.015, z0 + 0.042, 0.009), segs=48)

    # 16 Radial Carved Limestone Vault Ribs converging toward the Solar Oculus
    rib_prof = chamfer_rect_2d(0.16, 0.20, 0.026)
    for k in range(16):
        ka = (2.0 * math.pi * k) / 16.0
        ca, sa = math.cos(ka), math.sin(ka)
        pts_vr = [(7.10 * ca, 7.10 * sa, 5.52), (4.95 * ca, 4.95 * sa, 5.96), (2.68 * ca, 2.68 * sa, 6.44)]
        bm_sweep_tube(bm_stone, pts_vr, rib_prof, closed=False, cap_ends=True)

    # Sunlit Desert Sky Throat Shaft Rising Above Solar Oculus (Z = 6.72..8.30m)
    bm_add_lathe(bm_stone, chamfer_ring_profile(2.48, 3.05, 6.72, 8.35, 0.03), segs=40)
    bm_add_lathe(bm_cove, chamfer_ring_profile(2.44, 2.50, 6.96, 8.05, 0.01), segs=40)

    finalize_obj("Cairo_Limestone_Amphitheater", bm_stone, mats["cairo_limestone"], col, parent=root, uv_mode="cyl", uv_scale=0.45, uv_radius=7.0)
    finalize_obj("Cairo_Brass_AcousticRibs", bm_br, mats["cairo_brass"], col, parent=root, uv_mode="box", uv_scale=1.2)
    finalize_obj("Cairo_Solar_CoveWash", bm_cove, mats["cairo_warm_cove"], col, parent=root, uv_mode="box", uv_scale=0.8)

    # --- C. Monumental Overhead Mechanical Circular Brass Solar Oculus Aperture (Animatable!) ---
    Z_OC = 6.32
    oc_root = make_empty("Solar_Oculus_Assembly", col, parent=root, location=(0.0, 0.0, Z_OC))
    bm_oc_outer = bmesh.new()
    bm_oc_blades = bmesh.new()
    bm_oc_inner = bmesh.new()

    # Outer Beveled Engraved Brass Solar Azimuth Gear Ring (r = 2.28..2.62m)
    bm_add_lathe(bm_oc_outer, chamfer_ring_profile(2.26, 2.62, -0.18, 0.18, 0.028), segs=64)
    # 48 Machined Solar Degree Gear Teeth & 8 Radial Actuator Struts
    for i in range(48):
        a = (2.0 * math.pi * i) / 48.0
        bm_add_box(bm_oc_outer, 0.12, 0.075, 0.14, matrix=Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((2.22, 0.0, 0.0)), bevel=0.008)
    for i in range(8):
        a = (2.0 * math.pi * i) / 8.0
        bm_add_box(bm_oc_outer, 0.62, 0.11, 0.14, matrix=Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((2.58, 0.0, -0.06)), bevel=0.014)
        bm_add_cyl(bm_oc_outer, 0.11, 0.09, 0.28, segs=12, matrix=Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((2.38, 0.0, -0.12)), bevel=0.012)

    # 12 Sculpted Interlocking Curved Mechanical Brass Iris Aperture Blades (Separate Animatable Node!)
    blades_pivot = make_empty("Solar_Oculus_Blades", col, parent=oc_root, location=(0.0, 0.0, 0.0))
    for i in range(12):
        a = (2.0 * math.pi * i) / 12.0
        # Crescent-swept mechanical shutter leaf curving inward from r=2.30 to r=1.42
        pts_blade = []
        r_out_pts, r_in_pts = [], []
        for s in range(7):
            u = s / 6.0
            aa = a + u * 0.56
            r_o = 2.32 - 0.42 * u
            r_i = 1.98 - 0.58 * (u ** 0.85)
            r_out_pts.append((r_o * math.cos(aa), r_o * math.sin(aa)))
            r_in_pts.append((r_i * math.cos(aa), r_i * math.sin(aa)))
        poly_b = r_out_pts + list(reversed(r_in_pts))
        z_sh = -0.09 + (i % 2) * 0.075  # Alternating overlap depth so blades interlock cleanly!
        bm_add_extruded_poly_2d(bm_oc_blades, poly_b, z_sh, z_sh + 0.055, bevel=0.010)
        # Mechanical pivot pin & structural rib along blade spine
        bm_add_cyl(bm_oc_blades, 0.075, 0.075, 0.18, segs=10,
                   matrix=Matrix.Translation((2.18 * math.cos(a + 0.04), 2.18 * math.sin(a + 0.04), z_sh + 0.02)), bevel=0.01)

    # Inner Concentric Brass Astrolabe Halo Ring & Suspended Solar Reticle (r = 1.38m)
    inner_pivot = make_empty("Solar_Oculus_InnerRing", col, parent=oc_root, location=(0.0, 0.0, -0.16))
    bm_add_lathe(bm_oc_inner, chamfer_ring_profile(1.26, 1.42, -0.065, 0.065, 0.016), segs=56)
    bm_add_lathe(bm_oc_inner, chamfer_ring_profile(0.68, 0.76, -0.045, 0.045, 0.012), segs=44,
                 matrix=Matrix.Rotation(math.radians(26), 4, "X"))
    for i in range(4):
        a = i * math.pi * 0.5
        bm_add_box(bm_oc_inner, 0.56, 0.055, 0.055, matrix=Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((1.02, 0.0, 0.0)), bevel=0.008)
    # Central solar plumb-bob crystal/brass pendant drop beneath oculus ring
    bm_add_lathe(bm_oc_inner, [
        (0.004, -0.78), (0.065, -0.52), (0.11, -0.32), (0.045, -0.16),
        (0.14, 0.0), (0.045, 0.16), (0.004, 0.24),
    ], segs=16)

    finalize_obj("Solar_Oculus_OuterRing", bm_oc_outer, mats["cairo_brass"], col, parent=oc_root, uv_mode="box", uv_scale=1.0)
    finalize_obj("Solar_Oculus_IrisBlades", bm_oc_blades, mats["cairo_brass"], col, parent=blades_pivot, uv_mode="box", uv_scale=1.2)
    finalize_obj("Solar_Oculus_Gimbal", bm_oc_inner, mats["cairo_brass"], col, parent=inner_pivot, uv_mode="box", uv_scale=1.2)

    # --- D. Hero Carved Obsidian & Limestone Vault Table (Top strictly flush Z = 0.780m!) ---
    tbl_root = make_empty("Cairo_Hero_Table", col, parent=root)
    bm_tls = bmesh.new()
    bm_tob = bmesh.new()
    bm_tbr = bmesh.new()

    # Twin Monumental Battered Limestone Vault Pylon Piers (X = ±0.72m) with Horizontal Brass Inlays
    for sx in (-0.72, 0.72):
        # Stepped travertine plinth foot flush at Z = 0.000
        bm_add_box(bm_tls, 0.52, 0.88, 0.09, matrix=Matrix.Translation((sx, 0.0, 0.045)), bevel=0.015)
        bm_add_box(bm_tbr, 0.48, 0.84, 0.025, matrix=Matrix.Translation((sx, 0.0, 0.10)), bevel=0.005)
        # Battered tapered carved limestone monolith shaft (3 fluted courses)
        for ci, (z0, z1, wx, wy) in enumerate([
            (0.11, 0.30, 0.42, 0.76),
            (0.32, 0.50, 0.38, 0.70),
            (0.52, 0.68, 0.36, 0.66),
        ]):
            bm_add_box(bm_tls, wx, wy, z1 - z0, matrix=Matrix.Translation((sx, 0.0, 0.5 * (z0 + z1))), bevel=0.016)
            bm_add_box(bm_tbr, wx + 0.015, wy + 0.015, 0.024, matrix=Matrix.Translation((sx, 0.0, z1 + 0.01)), bevel=0.004)
    # Recessed carved stone & brass central vault tie beam
    bm_add_box(bm_tls, 1.15, 0.24, 0.14, matrix=Matrix.Translation((0.0, 0.0, 0.24)), bevel=0.018)
    bm_add_box(bm_tbr, 1.18, 0.26, 0.03, matrix=Matrix.Translation((0.0, 0.0, 0.24)), bevel=0.005)

    # Chamfered Octagonal-Ended Limestone Lower Cradle Slab (Z = 0.68..0.742m)
    def chamfered_oct_2d(hx, hy, ch):
        return [
            (-hx + ch, -hy), (hx - ch, -hy), (hx, -hy + ch), (hx, hy - ch),
            (hx - ch, hy), (-hx + ch, hy), (-hx, hy - ch), (-hx, -hy + ch),
        ]
    bm_add_extruded_poly_2d(bm_tls, chamfered_oct_2d(1.20, 0.625, 0.18), 0.678, 0.746, bevel=0.016)
    # Recessed brass collar band between limestone cradle and honed obsidian vault slab
    bm_add_extruded_poly_2d(bm_tbr, chamfered_oct_2d(1.185, 0.612, 0.175), 0.742, 0.752, bevel=0.003)
    # Precision-Fitted Honed Black-Obsidian Vault Tabletop (2.40m x 1.25m, TOP STRICTLY FLUSH Z = 0.780m!)
    bm_add_extruded_poly_2d(bm_tob, chamfered_oct_2d(1.195, 0.620, 0.18), 0.750, 0.780, bevel=0.010)
    # Flush antique-brass geometric cartouche perimeter & meridian hairline inlays (Z = 0.7805m)
    for (lx, ly, sx, sy) in [
        (0.0,  0.48, 1.84, 0.016),
        (0.0, -0.48, 1.84, 0.016),
        (0.92, 0.0,  0.016, 0.96),
        (-0.92, 0.0, 0.016, 0.96),
    ]:
        bm_add_box(bm_tbr, sx, sy, 0.004, matrix=Matrix.Translation((lx, ly, 0.7795)))
    # Subtle brass compass circle flush in center of obsidian slab
    bm_add_lathe(bm_tbr, chamfer_ring_profile(0.325, 0.342, 0.777, 0.7806, 0.0015), segs=48)

    finalize_obj("Cairo_Table_Limestone", bm_tls, mats["cairo_limestone"], col, parent=tbl_root, uv_mode="box", uv_scale=0.9)
    finalize_obj("Cairo_Table_Obsidian", bm_tob, mats["cairo_obsidian"], col, parent=tbl_root, uv_mode="box", uv_scale=0.8)
    finalize_obj("Cairo_Table_Brass", bm_tbr, mats["cairo_brass"], col, parent=tbl_root, uv_mode="box", uv_scale=1.5)

    return col, root


# ===========================================================================
# 4. 19TH-CENTURY MERIDIAN WORLD GLOBE (godot/assets/aaa_models/meridian_world_globe.glb)
# ===========================================================================
def build_equirectangular_sphere_bmesh(radius: float, segs_u: int = 96, segs_v: int = 48):
    """
    Builds an ultra-smooth UV sphere with an explicit seam column so equirectangular
    earth textures wrap with ZERO seam distortion and ZERO pole pinching!
    Prime Meridian (lon=0) faces -Y (towards camera) so Europe/Africa/Atlantic greet the viewer!
    """
    bm = bmesh.new()
    uv_layer = bm.loops.layers.uv.verify()

    verts = []
    for iv in range(segs_v + 1):
        v_coord = iv / segs_v  # 0 at South Pole (-pi/2), 1 at North Pole (+pi/2)
        lat = -math.pi * 0.5 + math.pi * v_coord
        clat = math.cos(lat)
        slat = math.sin(lat)
        row = []
        for iu in range(segs_u + 1):
            u_coord = iu / segs_u  # 0..1 -> lon -180..+180 deg
            # Offset -90 deg so lon=0 faces -Y (toward Godot +Z camera!)
            lon = (u_coord - 0.5) * 2.0 * math.pi - math.pi * 0.5
            x = radius * clat * math.cos(lon)
            y = radius * clat * math.sin(lon)
            z = radius * slat
            row.append((bm.verts.new((x, y, z)), u_coord, v_coord))
        verts.append(row)

    for iv in range(segs_v):
        for iu in range(segs_u):
            v00, u00, w00 = verts[iv][iu]
            v10, u10, w10 = verts[iv][iu + 1]
            v11, u11, w11 = verts[iv + 1][iu + 1]
            v01, u01, w01 = verts[iv + 1][iu]
            f = bm.faces.new((v00, v10, v11, v01))
            uvs = [(u00, w00), (u10, w10), (u11, w11), (u01, w01)]
            for loop, uv in zip(f.loops, uvs):
                loop[uv_layer].uv = uv

    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    return bm


def build_meridian_world_globe(mats):
    col = make_collection("Prop_Meridian_World_Globe")
    root = make_empty("Meridian_World_Globe_Root", col)

    R_SPHERE = 0.550     # Exact sphere radius = 0.55m (matches Godot HeroArtifactRig.gd!)
    Z_CENTER = 1.060     # Elevated cleanly on prestige war-room pedestal (base strictly flush Z = 0.000m!)
    TILT_DEG = 23.44     # Earth's true axial obliquity!

    # --- A. Prestige War-Room Turned Walnut, Obsidian & Ornate Brass Pedestal Stand (Z = 0.000 .. 1.060m) ---
    bm_st_wal = bmesh.new()
    bm_st_br = bmesh.new()
    bm_st_sap = bmesh.new()
    bm_st_obs = bmesh.new()
    bm_comp = bmesh.new()
    bm_cglass = bmesh.new()

    # 0. Stepped Chamfered War-Room Pedestal Base Ring (Honed Obsidian + Burnished Brass Rim, flush Z = 0.000..0.044m!)
    bm_add_lathe(bm_st_obs, [
        (0.46, 0.000), (0.715, 0.000), (0.715, 0.022), (0.695, 0.040),
        (0.49, 0.040), (0.46, 0.022),
    ], segs=36, closed_profile=True)
    # Dual burnished brass pedestal collar moldings + 12 cardinal plinth rivets around the war-room anchor ring!
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.692, 0.722, 0.000, 0.014, 0.003), segs=36)
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.478, 0.502, 0.036, 0.048, 0.003), segs=36)
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.668, 0.694, 0.036, 0.046, 0.003), segs=36)
    bm_add_lathe(bm_st_sap, chamfer_ring_profile(0.502, 0.668, 0.038, 0.043, 0.002), segs=36)
    for k in range(12):
        ka = (2.0 * math.pi * k) / 12.0
        bm_add_cyl(bm_st_br, 0.012, 0.009, 0.012, segs=8,
                   matrix=Matrix.Rotation(ka, 4, "Z") @ Matrix.Translation((0.585, 0.0, 0.044)))

    # 1. Lathe-Turned Victorian Fluted Walnut Central Baluster Column + 8 Vertical Fluted Brass Ribs (Z = 0.16..0.46m)
    col_prof = [
        (0.005, 0.16), (0.148, 0.16), (0.158, 0.19), (0.124, 0.22),
        (0.086, 0.255), (0.128, 0.305), (0.138, 0.348), (0.096, 0.395),
        (0.072, 0.425), (0.110, 0.458), (0.005, 0.458),
    ]
    bm_add_lathe(bm_st_wal, col_prof, segs=32)
    # 3 Stepped Brushed-Brass Column Collar Rings + Ornate Inverted Acorn Finial Drop
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.140, 0.166, 0.168, 0.194, 0.005), segs=32)
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.082, 0.112, 0.238, 0.264, 0.006), segs=32)
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.068, 0.118, 0.425, 0.462, 0.007), segs=32)
    bm_add_lathe(bm_st_br, [
        (0.004, 0.072), (0.024, 0.095), (0.056, 0.128), (0.048, 0.148),
        (0.032, 0.162), (0.004, 0.162),
    ], segs=18)
    # 8 Sculpted Vertical Fluted Brass Inlay Ribs hugging the turned walnut baluster belly!
    urn_rib_prof = circle_profile(0.0085, 0.0085, segs=6)
    for ri in range(8):
        ra = (2.0 * math.pi * ri) / 8.0
        ca, sa = math.cos(ra), math.sin(ra)
        pts_ur = [
            (0.094 * ca, 0.094 * sa, 0.260),
            (0.132 * ca, 0.132 * sa, 0.305),
            (0.142 * ca, 0.142 * sa, 0.348),
            (0.102 * ca, 0.102 * sa, 0.394),
            (0.078 * ca, 0.078 * sa, 0.425),
        ]
        bm_sweep_tube(bm_st_br, pts_ur, urn_rib_prof, closed=False, cap_ends=True)

    # 2. 3 Sweeping Carved Cabriole Walnut Tripod Legs + Brass Spine Ribs + Knee Escutcheons + Stepped Sabot Feet
    leg_prof = chamfer_rect_2d(0.046, 0.036, 0.011)
    spine_prof = chamfer_rect_2d(0.012, 0.011, 0.003)
    for i in range(3):
        a = math.pi * 0.5 + i * (2.0 * math.pi / 3.0)
        ca, sa = math.cos(a), math.sin(a)
        pts_leg = [
            (0.11 * ca, 0.11 * sa, 0.35),
            (0.24 * ca, 0.24 * sa, 0.32),
            (0.38 * ca, 0.38 * sa, 0.25),
            (0.50 * ca, 0.50 * sa, 0.155),
            (0.58 * ca, 0.58 * sa, 0.085),
            (0.625 * ca, 0.625 * sa, 0.055),
        ]
        bm_sweep_tube(bm_st_wal, pts_leg, leg_prof, closed=False, cap_ends=True,
                      scales=[1.22, 1.15, 1.05, 0.92, 0.82, 0.74])
        # Raised Burnished-Brass Filigree Crest Spine sweeping gracefully down the top ridge of every leg!
        pts_spine = [(x, y, z + 0.034) for (x, y, z) in pts_leg[:-1]] + [(0.61 * ca, 0.61 * sa, 0.082)]
        bm_sweep_tube(bm_st_br, pts_spine, spine_prof, closed=False, cap_ends=True,
                      scales=[1.1, 1.05, 0.95, 0.88, 0.80, 0.72])
        # Stepped Architectural Brass Sabot Foot anchoring cleanly onto the obsidian pedestal base ring!
        m_ft = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.618, 0.0, 0.040))
        bm_add_box(bm_st_br, 0.125, 0.088, 0.038, matrix=m_ft @ Matrix.Translation((0.0, 0.0, 0.019)), bevel=0.010)
        bm_add_box(bm_st_br, 0.096, 0.068, 0.034, matrix=m_ft @ Matrix.Translation((-0.01, 0.0, 0.046)), bevel=0.008)
        # Ornate Beveled Brass Knee Escutcheon Medallion + Royal Sapphire Stud on each tripod shoulder
        m_kn = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.26, 0.0, 0.358)) @ Matrix.Rotation(math.radians(16), 4, "Y")
        bm_add_cyl(bm_st_br, 0.044, 0.030, 0.022, segs=12, matrix=m_kn, bevel=0.005)
        bm_add_cyl(bm_st_sap, 0.020, 0.016, 0.014, segs=10, matrix=m_kn @ Matrix.Translation((0.0, 0.0, 0.012)))
        # Curved walnut lower stretcher spoke + brass cuff converging toward the central compass tray
        pts_st = [(0.17 * ca, 0.17 * sa, 0.195), (0.31 * ca, 0.31 * sa, 0.205), (0.44 * ca, 0.44 * sa, 0.182)]
        bm_sweep_tube(bm_st_wal, pts_st, chamfer_rect_2d(0.028, 0.024, 0.006), closed=False, cap_ends=True)
        bm_add_box(bm_st_br, 0.032, 0.064, 0.056, matrix=Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.30, 0.0, 0.205)), bevel=0.005)

    # 3. Inset Master Magnetic Compass Stretcher Housing & 16-Point Royal Compass Rose (Z = 0.16..0.24m)
    bm_add_lathe(bm_st_wal, chamfer_ring_profile(0.145, 0.232, 0.162, 0.220, 0.012), segs=36)
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.212, 0.240, 0.198, 0.226, 0.005), segs=36)
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.148, 0.178, 0.198, 0.232, 0.006), segs=36)
    bm_add_cyl(bm_comp, 0.156, 0.156, 0.022, segs=32, matrix=Matrix.Translation((0.0, 0.0, 0.194)))
    # Sculpted 16-point brass compass rose star + degree ring pips + slender twin-blade needle
    for k in range(16):
        ka = k * (math.pi / 8.0)
        slen = 0.132 if (k % 4 == 0) else (0.098 if (k % 2 == 0) else 0.062)
        swid = 0.016 if (k % 4 == 0) else 0.009
        bm_add_box(bm_st_br, slen, swid, 0.006, matrix=Matrix.Rotation(ka, 4, "Z") @ Matrix.Translation((slen * 0.5, 0.0, 0.208)))
    bm_add_box(bm_st_br, 0.245, 0.015, 0.009, matrix=Matrix.Rotation(math.radians(28), 4, "Z") @ Matrix.Translation((0.0, 0.0, 0.217)), bevel=0.002)
    bm_add_cyl(bm_st_br, 0.020, 0.010, 0.026, segs=12, matrix=Matrix.Translation((0.0, 0.0, 0.215)))
    bm_add_cyl(bm_cglass, 0.152, 0.152, 0.004, segs=32, matrix=Matrix.Translation((0.0, 0.0, 0.226)))

    # 4. Sculpted Brass Meridian Cradle Saddle & 4 Ornate Double-Scroll Victorian Lyre Brackets (Z = 0.41..1.03m)
    bm_add_lathe(bm_st_br, [
        (0.01, 0.43), (0.102, 0.43), (0.082, 0.47), (0.048, 0.505), (0.01, 0.505),
    ], segs=24)
    bm_add_box(bm_st_br, 0.092, 0.165, 0.072, matrix=Matrix.Translation((0.0, 0.0, 0.448)), bevel=0.012)

    scroll_prof = chamfer_rect_2d(0.022, 0.015, 0.005)
    scroll_inner_prof = circle_profile(0.0095, 0.0095, segs=6)
    for i in range(4):
        a = math.pi * 0.25 + i * math.pi * 0.5
        ca, sa = math.cos(a), math.sin(a)
        pts_arm = []
        pts_sub = []
        scs = []
        for s in range(11):
            t = s / 10.0
            r = 0.095 + 0.605 * (t ** 0.72) + 0.075 * math.sin(t * math.pi * 2.0) * (1.0 - t)
            z = 0.415 + 0.605 * (t ** 1.14) - 0.045 * math.sin(t * math.pi)
            pts_arm.append((r * ca, r * sa, z))
            # Secondary delicate inner filigree scroll rib echoing the main lyre curve!
            r2 = r - 0.042 * math.sin(t * math.pi)
            z2 = z + 0.036 * math.sin(t * math.pi)
            pts_sub.append((r2 * ca, r2 * sa, z2))
            scs.append(1.18 - 0.30 * t)
        bm_sweep_tube(bm_st_br, pts_arm, scroll_prof, closed=False, cap_ends=True, scales=scs)
        bm_sweep_tube(bm_st_br, pts_sub, scroll_inner_prof, closed=False, cap_ends=True)
        # Decorative curled brass rosette capital boss anchoring under horizon ring
        bm_add_cyl(bm_st_br, 0.042, 0.030, 0.038, segs=12,
                   matrix=Matrix.Translation((0.695 * ca, 0.695 * sa, Z_CENTER - 0.050)), bevel=0.006)
        bm_add_cyl(bm_st_sap, 0.018, 0.018, 0.012, segs=10,
                   matrix=Matrix.Translation((0.695 * ca, 0.695 * sa, Z_CENTER - 0.068)))

    # 5. Prestige Engraved Horizon Calendar Ring (Z = Z_CENTER = 1.060m, r_in = 0.635m .. r_out = 0.782m!)
    bm_add_lathe(bm_st_wal, [
        (0.635, Z_CENTER - 0.036), (0.766, Z_CENTER - 0.036), (0.782, Z_CENTER - 0.014),
        (0.782, Z_CENTER + 0.018), (0.764, Z_CENTER + 0.032), (0.638, Z_CENTER + 0.032),
        (0.630, Z_CENTER + 0.014), (0.630, Z_CENTER - 0.022),
    ], segs=64, closed_profile=True)
    # Dual Top & Bottom Burnished-Brass Ogee Bezel Trim Rings + Recessed Royal Sapphire Calendar Enamel Track!
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.630, 0.656, Z_CENTER + 0.016, Z_CENTER + 0.038, 0.004), segs=64)
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.746, 0.772, Z_CENTER + 0.016, Z_CENTER + 0.038, 0.004), segs=64)
    bm_add_lathe(bm_st_br, chamfer_ring_profile(0.752, 0.784, Z_CENTER - 0.038, Z_CENTER - 0.022, 0.004), segs=64)
    bm_add_lathe(bm_st_sap, chamfer_ring_profile(0.656, 0.746, Z_CENTER + 0.028, Z_CENTER + 0.035, 0.002), segs=64)
    # 72 Precision Engraved Horizon Degree Ticks + 12 Sculpted Brass Zodiac/Month Calendar Dividers!
    for i in range(72):
        a = (2.0 * math.pi * i) / 72.0
        is_month = (i % 6 == 0)
        is_card = (i % 18 == 0)
        t_len = 0.094 if is_month else 0.034
        t_wid = 0.018 if is_card else (0.012 if is_month else 0.005)
        t_h = 0.008 if is_month else 0.0045
        r_mid = 0.701 if is_month else 0.676
        m_tk = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((r_mid, 0.0, Z_CENTER + 0.037))
        bm_add_box(bm_st_br, t_len, t_wid, t_h, matrix=m_tk)
    # 12 Subtle Raised Brass Zodiac Plaque Bosses mid-way inside each calendar month sector
    for m_i in range(12):
        ma = (2.0 * math.pi * (m_i + 0.5)) / 12.0
        m_zp = Matrix.Rotation(ma, 4, "Z") @ Matrix.Translation((0.715, 0.0, Z_CENTER + 0.0365))
        bm_add_box(bm_st_br, 0.026, 0.056, 0.005, matrix=m_zp)
    # 4 Ornate Cantilevered Brass Cardinal Escutcheon Brackets (N/E/S/W) with Royal Sapphire Studs!
    for i in range(4):
        a = i * math.pi * 0.5
        m_cp = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.784, 0.0, Z_CENTER))
        bm_add_box(bm_st_br, 0.036, 0.118, 0.054, matrix=m_cp, bevel=0.008)
        bm_add_cyl(bm_st_sap, 0.016, 0.012, 0.014, segs=10,
                   matrix=m_cp @ Matrix.Translation((0.020, 0.0, 0.0)) @ Matrix.Rotation(math.pi * 0.5, 4, "Y"))

    finalize_obj("Globe_Stand_Walnut", bm_st_wal, mats["globe_walnut"], col, parent=root, uv_mode="box", uv_scale=1.2)
    finalize_obj("Globe_Stand_Brass", bm_st_br, mats["globe_brass"], col, parent=root, uv_mode="box", uv_scale=1.8)
    finalize_obj("Globe_Stand_SapphireInlay", bm_st_sap, mats["globe_sapphire_enamel"], col, parent=root, uv_mode="box", uv_scale=1.6)
    finalize_obj("Globe_Pedestal_Obsidian", bm_st_obs, mats["globe_plinth_obsidian"], col, parent=root, uv_mode="box", uv_scale=1.2)
    finalize_obj("Globe_Compass_Dial", bm_comp, mats["globe_compass"], col, parent=root, uv_mode="box", uv_scale=2.0)
    gl_c_obj = finalize_obj("Globe_Compass_Glass", bm_cglass, mats["globe_glass"], col, parent=root, uv_mode="box", uv_scale=1.0)
    gl_c_obj.visible_shadow = False

    # --- B. 3-Tier Sapphire-Inlaid Beveled Inclined Brass Degree Meridian Ring (Pivoted at Z = 1.060m!) ---
    mer_pivot = make_empty("Globe_Meridian_Ring", col, parent=root, location=(0.0, 0.0, Z_CENTER))
    bm_mer = bmesh.new()
    bm_mer_sap = bmesh.new()
    m_xz = Matrix.Rotation(math.pi * 0.5, 4, "X")
    # 3-Tier Horological Stepped Brass Degree Meridian Ring (r = 0.578 .. 0.632m, thick 0.032m)
    mer_prof = [
        (0.578, -0.012), (0.596, -0.017), (0.620, -0.017), (0.632, -0.010),
        (0.632,  0.010), (0.620,  0.017), (0.596,  0.017), (0.578,  0.012),
    ]
    bm_add_lathe(bm_mer, mer_prof, segs=72, matrix=m_xz)
    # Recessed Royal-Sapphire Enamel Calibration Track inlaid cleanly on front & back of the meridian ring!
    bm_add_lathe(bm_mer_sap, chamfer_ring_profile(0.604, 0.616, -0.0185, 0.0185, 0.002), segs=72, matrix=m_xz)
    # 72 Precision Engraved 5-Degree Calibration Teeth + 8 Ornate Degree-Plaque Bosses
    for i in range(72):
        a = (2.0 * math.pi * i) / 72.0
        is_major = (i % 3 == 0)
        is_card = (i % 9 == 0)
        r_m = 0.606 if is_major else 0.591
        sx = 0.044 if is_card else (0.028 if is_major else 0.016)
        sy = 0.012 if is_card else (0.0075 if is_major else 0.0042)
        sz = 0.040 if is_card else (0.036 if is_major else 0.032)
        m_n = m_xz @ Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((r_m, 0.0, 0.0))
        bm_add_box(bm_mer, sx, sy, sz, matrix=m_n)

    # Tilted 24-Hour Brass Hour-Circle Dial + Royal Astrolabe Crown Spire Finial with Sapphire Cabochon!
    m_tilt = Matrix.Rotation(math.radians(TILT_DEG), 4, "Y")
    bm_add_lathe(bm_mer, chamfer_ring_profile(0.024, 0.114, 0.556, 0.580, 0.004), segs=32, matrix=m_tilt)
    bm_add_lathe(bm_mer_sap, chamfer_ring_profile(0.046, 0.092, 0.576, 0.583, 0.002), segs=32, matrix=m_tilt)
    for h_i in range(12):
        ha = (2.0 * math.pi * h_i) / 12.0
        bm_add_box(bm_mer, 0.026, 0.007, 0.007,
                   matrix=m_tilt @ Matrix.Rotation(ha, 4, "Z") @ Matrix.Translation((0.096, 0.0, 0.582)))
    # Triple-stepped royal brass spire finial + inset royal sapphire jewel crown at North Pole apex
    bm_add_lathe(bm_mer, [
        (0.004, 0.624), (0.048, 0.632), (0.034, 0.658), (0.054, 0.686),
        (0.038, 0.714), (0.020, 0.742), (0.004, 0.768),
    ], segs=20, matrix=m_tilt)
    tmp_jewel = bmesh.new()
    bmesh.ops.create_uvsphere(tmp_jewel, u_segments=14, v_segments=8, radius=0.024)
    bm_merge(bm_mer_sap, tmp_jewel, m_tilt @ Matrix.Translation((0.0, 0.0, 0.728)))
    # North & South polar brass trunnion bushings + south finial drop
    bm_add_cyl(bm_mer, 0.026, 0.026, 0.088, segs=16, matrix=m_tilt @ Matrix.Translation((0.0, 0.0, 0.586)), bevel=0.004)
    bm_add_cyl(bm_mer, 0.026, 0.026, 0.088, segs=16, matrix=m_tilt @ Matrix.Translation((0.0, 0.0, -0.586)), bevel=0.004)
    bm_add_lathe(bm_mer, [
        (0.004, -0.674), (0.030, -0.654), (0.042, -0.626), (0.004, -0.620),
    ], segs=16, matrix=m_tilt)

    finalize_obj("Globe_Meridian_Ring_Mesh", bm_mer, mats["globe_brass"], col, parent=mer_pivot, uv_mode="box", uv_scale=2.0)
    finalize_obj("Globe_Meridian_SapphireInlay", bm_mer_sap, mats["globe_sapphire_enamel"], col, parent=mer_pivot, uv_mode="box", uv_scale=2.0)

    # --- C. Tilted Earth Axis Hierarchy (`Globe_Axis_Tilt` -> `Globe_Spin_Pivot` -> `Globe_Sphere` + `Globe_Filigree_Brass`) ---
    tilt_pivot = make_empty("Globe_Axis_Tilt", col, parent=root, location=(0.0, 0.0, Z_CENTER), rotation=(0.0, math.radians(TILT_DEG), 0.0))
    # Identity spin pivot matches Godot HeroArtifactRig.gd longitude city-pin math 100% directly!
    spin_pivot = make_empty("Globe_Spin_Pivot", col, parent=tilt_pivot)

    # Smooth 80x40 UV Terrestrial Sphere (exact radius = 0.550m -> 6,400 smooth tris!)
    bm_earth = build_equirectangular_sphere_bmesh(R_SPHERE, segs_u=80, segs_v=40)
    finalize_obj(
        "Globe_Sphere",
        bm_earth,
        mats["globe_earth"],
        col,
        parent=spin_pivot,
        smooth=True,
        split_angle_deg=180.0,
        uv_mode="preserve",
        recalc_normals=False,
    )

    # Crisp Raised 3D Brass Meridian Inlays, Equatorial Vernier Belt & Filigree Hugging the Globe (`r = 0.553m`)!
    bm_fil = bmesh.new()
    # 1. Stepped Beveled Raised Equatorial Brass Vernier Belt + 72 Machined Degree Pips + 4 Diamond Cardinal Plaques
    bm_add_lathe(bm_fil, [
        (R_SPHERE - 0.002, -0.013), (R_SPHERE + 0.006, -0.013), (R_SPHERE + 0.010, -0.007),
        (R_SPHERE + 0.010,  0.007), (R_SPHERE + 0.006,  0.013), (R_SPHERE - 0.002,  0.013),
    ], segs=72)
    for i in range(72):
        a = (2.0 * math.pi * i) / 72.0
        is_card = (i % 18 == 0)
        is_maj = (i % 6 == 0)
        if is_card:
            # Sculpted diamond-faceted cardinal meridian plaque at 0, 90E, 180, 90W!
            m_dp = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((R_SPHERE + 0.009, 0.0, 0.0)) @ Matrix.Rotation(math.pi * 0.25, 4, "X")
            bm_add_box(bm_fil, 0.011, 0.026, 0.026, matrix=m_dp)
        else:
            sz = 0.019 if is_maj else 0.013
            sy = 0.007 if is_maj else 0.004
            bm_add_box(bm_fil, 0.009, sy, sz, matrix=Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((R_SPHERE + 0.0085, 0.0, 0.0)))

    # 2. Crisp Raised Latitude Brass Filigree Inlays (Tropics ±23.44 deg & Polar Circles ±66.56 deg)
    for lat_d, thick, proud in ((23.44, 0.0052, 0.0055), (-23.44, 0.0052, 0.0055), (66.56, 0.0044, 0.0045), (-66.56, 0.0044, 0.0045)):
        rl = (R_SPHERE + proud * 0.65) * math.cos(math.radians(lat_d))
        zl = (R_SPHERE + proud * 0.65) * math.sin(math.radians(lat_d))
        bm_add_lathe(bm_fil, chamfer_ring_profile(rl - 0.005, rl + proud, zl - thick, zl + thick, 0.0014), segs=64)

    # 3. Crisp Raised Brass Meridian Inlay Bands (4 Primary Cardinal Meridians w/ Chamfered Ribbon + 8 Secondary 30-deg Hairlines!)
    fil_prof_primary = chamfer_rect_2d(0.0062, 0.0050, 0.0016)
    fil_prof_minor = circle_profile(0.0030, 0.0030, segs=5)
    for m_i in range(12):
        lon_a = -math.pi * 0.5 + m_i * (math.pi / 6.0)  # m_i=0 is Prime Meridian (0 deg), m_i=3 is 90E, etc.
        is_primary = (m_i % 3 == 0)
        pts_m = []
        n_steps = 36 if is_primary else 28
        for s in range(n_steps + 1):
            lat = -math.pi * 0.475 + (math.pi * 0.95) * (s / n_steps)
            rr = R_SPHERE + (0.0048 if is_primary else 0.0024)
            pts_m.append((rr * math.cos(lat) * math.cos(lon_a), rr * math.cos(lat) * math.sin(lon_a), rr * math.sin(lat)))
        bm_sweep_tube(bm_fil, pts_m, fil_prof_primary if is_primary else fil_prof_minor, closed=False, cap_ends=True)
        # Raised 30-deg latitude calibration jewel studs along the 4 Primary Brass Meridian Inlay Bands!
        if is_primary:
            for lat_stud in (-60, -30, 30, 60):
                lr = math.radians(lat_stud)
                rr = R_SPHERE + 0.0065
                sx_c = rr * math.cos(lr) * math.cos(lon_a)
                sy_c = rr * math.cos(lr) * math.sin(lon_a)
                sz_c = rr * math.sin(lr)
                bm_add_box(bm_fil, 0.011, 0.011, 0.011, matrix=Matrix.Translation((sx_c, sy_c, sz_c)) @ Matrix.Rotation(lon_a, 4, "Z"))

    # 4. Sculpted Stepped Brass Polar Boss Caps & Precision Axle Pins
    for sgn in (-1, 1):
        bm_add_cyl(bm_fil, 0.068, 0.048, 0.018, segs=24, matrix=Matrix.Translation((0.0, 0.0, sgn * (R_SPHERE - 0.002))), bevel=0.003)
        bm_add_cyl(bm_fil, 0.014, 0.014, 0.058, segs=12, matrix=Matrix.Translation((0.0, 0.0, sgn * (R_SPHERE + 0.022))))

    finalize_obj("Globe_Filigree_Brass", bm_fil, mats["globe_brass"], col, parent=spin_pivot, uv_mode="box", uv_scale=2.0)

    return col, root


# ===========================================================================
# Recursive Hierarchy Stats & Self-Contained GLB Exporter
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

    # Convert Blender Z-up AABB to glTF/Godot Y-up: (X, Y, Z)_gltf = (X, Z, -Y)_bl
    gltf_min = [round(min_v.x, 3), round(min_v.z, 3), round(-max_v.y, 3)]
    gltf_max = [round(max_v.x, 3), round(max_v.z, 3), round(-min_v.y, 3)]
    return total_tris, gltf_min, gltf_max, sorted(mat_names), node_names


def inspect_glb_chunk(glb_path: str):
    with open(glb_path, "rb") as f:
        magic, version, length = struct.unpack("<4sII", f.read(12))
        if magic != b"glTF":
            return None
        chunk_len, chunk_type = struct.unpack("<II", f.read(8))
        raw_json = f.read(chunk_len).decode("utf-8")
    data = json.loads(raw_json)
    accessors = data.get("accessors", [])
    tris = 0
    for mesh in data.get("meshes", []):
        for prim in mesh.get("primitives", []):
            idx = prim.get("indices")
            if idx is not None:
                tris += accessors[idx]["count"] // 3
    return {
        "meshes": len(data.get("meshes", [])),
        "nodes": len(data.get("nodes", [])),
        "materials": len(data.get("materials", [])),
        "images": len(data.get("images", [])),
        "glb_tris": tris,
    }


def sanitize_glb_jpegs_inplace(glb_path: str):
    """Strips Blender 5.3.0 APP1..APP15 (NeoGeo/ICC_PROFILE) JPEG segments inside a GLB cleanly."""
    with open(glb_path, "rb") as f:
        raw = f.read()
    magic, version, _ = struct.unpack("<4sII", raw[:12])
    if magic != b"glTF" or version != 2:
        return 0
    j_len, j_type = struct.unpack("<II", raw[12:20])
    if j_type != 0x4E4F534A:
        return 0
    data = json.loads(raw[20:20 + j_len].decode("utf-8"))
    b_off = 20 + j_len
    b_len, b_type = struct.unpack("<II", raw[b_off:b_off + 8])
    if b_type != 0x004E4942:
        return 0
    old_bin = raw[b_off + 8:b_off + 8 + b_len]

    img_bv_indices = {
        img["bufferView"]
        for img in data.get("images", [])
        if "bufferView" in img and img.get("mimeType") == "image/jpeg"
    }
    if not img_bv_indices:
        return 0

    new_bin = bytearray()
    cleaned_count = 0
    for idx, bv in enumerate(data.get("bufferViews", [])):
        off = bv.get("byteOffset", 0)
        ln = bv["byteLength"]
        chunk = old_bin[off:off + ln]
        if idx in img_bv_indices:
            chunk = strip_jpeg_non_jfif_app_markers(chunk)
            cleaned_count += 1
        while len(new_bin) % 4 != 0:
            new_bin.append(0)
        bv["byteOffset"] = len(new_bin)
        bv["byteLength"] = len(chunk)
        new_bin.extend(chunk)

    while len(new_bin) % 4 != 0:
        new_bin.append(0)
    data["buffers"][0]["byteLength"] = len(new_bin)

    json_bytes = json.dumps(data, separators=(",", ":")).encode("utf-8")
    while len(json_bytes) % 4 != 0:
        json_bytes += b" "

    out_len = 12 + 8 + len(json_bytes) + 8 + len(new_bin)
    out = bytearray()
    out.extend(struct.pack("<4sII", b"glTF", 2, out_len))
    out.extend(struct.pack("<II", len(json_bytes), 0x4E4F534A))
    out.extend(json_bytes)
    out.extend(struct.pack("<II", len(new_bin), 0x004E4942))
    out.extend(new_bin)
    with open(glb_path, "wb") as f:
        f.write(out)
    return cleaned_count


def export_glb(root_obj, col, filename: str):
    """Exports an entire asset hierarchy cleanly to godot/assets/aaa_models/<filename>."""
    # Ensure collection is visible for clean modifier evaluation & export
    col.hide_viewport = False
    for o in bpy.data.objects:
        o.select_set(False)
    targets = collect_descendants(root_obj)
    for o in targets:
        o.hide_viewport = False
        o.select_set(True)
    bpy.context.view_layer.objects.active = root_obj

    out_path = os.path.join(OUT_GLB_DIR, filename)
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
    fsize = os.path.getsize(out_path)
    glb_info = inspect_glb_chunk(out_path)
    return out_path, fsize, glb_info


# ===========================================================================
# 2x2 Architectural Contact Sheet Showcase Renderer (1920x1080 EEVEE AgX!)
# ===========================================================================
# Compact crisp 5x7 pixel bitmap font for clean museum quadrant title plates
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
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "0": ["01110", "10011", "10101", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
    "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "00110", "00110"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
}


def stamp_caption_bar(img_arr: np.ndarray, text: str, x0: int, y0: int, scale: int = 2):
    """Draws a refined dark-obsidian & gold gallery caption pill onto a bottom-up RGBA float buffer."""
    H, W, _ = img_arr.shape
    char_w = 6 * scale
    text_w = len(text) * char_w
    pad_x, pad_y = 14, 9
    bar_w = text_w + pad_x * 2
    bar_h = 7 * scale + pad_y * 2

    x1 = min(W, x0 + bar_w)
    y1 = min(H, y0 + bar_h)
    # Translucent dark obsidian glass plate
    bg = np.array([0.04, 0.05, 0.08, 1.0], dtype=np.float32)
    img_arr[y0:y1, x0:x1, :3] = img_arr[y0:y1, x0:x1, :3] * 0.25 + bg[:3] * 0.75
    # Crisp 1px champagne-gold top & bottom hairline border
    gold = np.array([0.86, 0.69, 0.33], dtype=np.float32)
    img_arr[y0:y0 + 1, x0:x1, :3] = gold
    img_arr[y1 - 1:y1, x0:x1, :3] = gold
    img_arr[y0:y1, x0:x0 + 2, :3] = gold

    # Draw bitmap letters (note bottom-up Y in Blender image buffers!)
    cx = x0 + pad_x
    cy_top = y0 + pad_y + 7 * scale - 1
    for ch in text.upper():
        glyph = _FONT_5X7.get(ch, _FONT_5X7[" "])
        for row_i, row_str in enumerate(glyph):
            for col_i, bit in enumerate(row_str):
                if bit == "1":
                    px0 = cx + col_i * scale
                    py0 = cy_top - (row_i + 1) * scale + 1
                    img_arr[py0:py0 + scale, px0:px0 + scale, :3] = np.array([0.96, 0.87, 0.66], dtype=np.float32)
        cx += char_w


def add_light(name, ltype, loc, target, energy, color_hex, col, size=2.0, size_y=None, spot_deg=65.0, spot_blend=0.35, radius=0.5, spec_factor=1.0):
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
        d = Vector(target) - Vector(loc)
        lo.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
    col.objects.link(lo)
    return lo


def set_world_env(color_hex: str, strength: float, hdri_rel_path: str = None, bg_visible_hex: str = None, bg_visible_str: float = 0.4):
    """Configures a photorealistic Poly Haven HDRI IBL world (read-only) with optional clean camera backdrop."""
    w = bpy.context.scene.world
    if w is None:
        w = bpy.data.worlds.new("Showcase_World")
        bpy.context.scene.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    hdri_img = None
    hdri_abs = os.path.join(REPO_ROOT, hdri_rel_path) if hdri_rel_path else None
    if hdri_abs and os.path.exists(hdri_abs):
        hdri_img = bpy.data.images.load(hdri_abs, check_existing=True)
        env = nt.nodes.new("ShaderNodeTexEnvironment")
        env.image = hdri_img
        bg_ibl = nt.nodes.new("ShaderNodeBackground")
        bg_ibl.inputs["Strength"].default_value = strength
        nt.links.new(env.outputs["Color"], bg_ibl.inputs["Color"])
        if bg_visible_hex:
            lp = nt.nodes.new("ShaderNodeLightPath")
            bg_cam = nt.nodes.new("ShaderNodeBackground")
            bg_cam.inputs["Color"].default_value = srgb_to_linear(bg_visible_hex)
            bg_cam.inputs["Strength"].default_value = bg_visible_str
            mix = nt.nodes.new("ShaderNodeMixShader")
            nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
            nt.links.new(bg_ibl.outputs["Background"], mix.inputs[1])
            nt.links.new(bg_cam.outputs["Background"], mix.inputs[2])
            nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
        else:
            nt.links.new(bg_ibl.outputs["Background"], out.inputs["Surface"])
    else:
        bg = nt.nodes.new("ShaderNodeBackground")
        bg.inputs["Color"].default_value = srgb_to_linear(color_hex)
        bg.inputs["Strength"].default_value = strength
        nt.links.new(bg.outputs["Background"], out.inputs["Surface"])
    return hdri_img


def render_quadrant(asset_col, all_cols, cam_pos, cam_target, lens_mm, world_hex, world_str, setup_lights_fn, tmp_png_path, width=960, height=540, hdri_rel=None, bg_vis_hex=None, bg_vis_str=0.35, exposure=0.15):
    """Isolates one venue/prop, builds its bespoke cinema rig, renders crisp EEVEE PNG, and cleans rig."""
    for c in all_cols:
        vis = (c == asset_col)
        c.hide_viewport = not vis
        c.hide_render = not vis

    rig_col = make_collection("Temp_Render_Rig")
    hdri_img = set_world_env(world_hex, world_str, hdri_rel_path=hdri_rel, bg_visible_hex=bg_vis_hex, bg_visible_str=bg_vis_str)

    cam_d = bpy.data.cameras.new("Temp_Cam")
    cam_d.lens = lens_mm
    cam_d.clip_start = 0.08
    cam_d.clip_end = 160.0
    cam_o = bpy.data.objects.new("Temp_Cam", cam_d)
    cam_o.location = cam_pos
    cam_o.rotation_euler = (Vector(cam_target) - Vector(cam_pos)).to_track_quat("-Z", "Y").to_euler()
    rig_col.objects.link(cam_o)

    setup_lights_fn(rig_col)

    scene = bpy.context.scene
    scene.camera = cam_o
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = tmp_png_path

    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 48
    if hasattr(scene.eevee, "use_raytracing"):
        scene.eevee.use_raytracing = True
    if hasattr(scene.eevee, "use_shadows"):
        scene.eevee.use_shadows = True

    try:
        scene.view_settings.view_transform = "AgX"
        scene.view_settings.look = "AgX - Medium High Contrast"
        scene.view_settings.exposure = exposure
    except Exception:
        pass

    bpy.ops.render.render(write_still=True)

    # Load rendered PNG pixels into numpy array (H, W, 4) float32
    img = bpy.data.images.load(tmp_png_path)
    arr = np.empty(width * height * 4, dtype=np.float32)
    img.pixels.foreach_get(arr)
    bpy.data.images.remove(img)
    arr = arr.reshape((height, width, 4))

    # Clean up temporary rig objects, HDRI & collection cleanly
    for o in list(rig_col.objects):
        data_ref = o.data
        bpy.data.objects.remove(o, do_unlink=True)
        if data_ref and data_ref.users == 0:
            if isinstance(data_ref, bpy.types.Light):
                bpy.data.lights.remove(data_ref)
            elif isinstance(data_ref, bpy.types.Camera):
                bpy.data.cameras.remove(data_ref)
            elif isinstance(data_ref, bpy.types.Mesh):
                bpy.data.meshes.remove(data_ref)
    bpy.data.collections.remove(rig_col)
    if hdri_img is not None:
        if bpy.context.scene.world and bpy.context.scene.world.use_nodes:
            bpy.context.scene.world.node_tree.nodes.clear()
        if hdri_img.users == 0:
            bpy.data.images.remove(hdri_img)
    return arr


def render_2x2_contact_sheet(cols_dict, mats):
    """Renders all 4 AAA assets with dedicated architectural cinema lighting into a 1920x1080 2x2 PNG."""
    all_cols = list(cols_dict.values())
    W_Q, H_Q = 960, 540

    # --- 1. London Sovereign Rotunda Lighting ---
    def lights_london(rc):
        # Skylight oculus warm afternoon sunbeam pouring down through the coffered dome
        add_light("Lon_OculusSun", "AREA", (0.2, 0.5, 9.2), (0.0, 0.0, 0.78), 7200.0, "#FFF0D4", rc, size=3.4, spec_factor=0.65)
        # Warm chandelier tungsten pool illuminating fluted Corinthian columns, curved arches & oak balustrade
        add_light("Lon_ChandWarm", "POINT", (0.0, 0.0, 4.65), None, 3800.0, "#FFD490", rc, radius=1.1, spec_factor=0.75)
        # Soft cool skylight fill revealing travertine fluting & dome coffers (low specular to avoid fake squares)
        add_light("Lon_DomeFill", "POINT", (0.0, 1.2, 7.2), None, 2600.0, "#DCE8FF", rc, radius=2.2, spec_factor=0.25)
        # Warm Rembrandt key grazing the walnut & marble hero debate table
        add_light("Lon_TableKey", "SPOT", (2.6, -3.0, 3.3), (0.0, 0.0, 0.78), 1850.0, "#FFE4B5", rc, spot_deg=56.0, radius=0.5, spec_factor=0.75)
        # Gallery perimeter bounce lighting showcasing the carved oak wainscoting & library bookshelves
        add_light("Lon_GalL", "POINT", (-3.8, 2.2, 2.5), None, 1350.0, "#FFD59A", rc, radius=1.4, spec_factor=0.3)
        add_light("Lon_GalR", "POINT", (3.8, 2.2, 2.5), None, 1350.0, "#FFD59A", rc, radius=1.4, spec_factor=0.3)

    # --- 2. Tokyo 70th-Floor Sky Pavilion Lighting ---
    def lights_tokyo(rc):
        # Subtle nocturnal indigo sky rim through crystal-clear rain-glass (low spec so lacquer stays sleek black!)
        add_light("Tok_WindowSky", "AREA", (0.0, 4.8, 2.6), (0.0, -0.8, 1.0), 1150.0, "#6BA8FF", rc, size=9.5, size_y=3.0, spec_factor=0.06)
        # Focused warm architectural pool from suspended linear bronze bar onto the dark lacquer & gold kintsugi table
        add_light("Tok_TablePool", "SPOT", (0.2, -0.4, 3.72), (0.0, 0.0, 0.78), 2150.0, "#FFE2AA", rc, spot_deg=58.0, spot_blend=0.55, radius=0.45, spec_factor=0.42)
        # Warm shoji bounce from left & right hinoki kumiko lattice bays
        add_light("Tok_LeftKumiko", "POINT", (-5.2, 1.8, 2.2), None, 1050.0, "#FFCC88", rc, radius=1.5, spec_factor=0.14)
        add_light("Tok_RightKumiko", "POINT", (5.2, 1.8, 2.2), None, 1150.0, "#FFCC88", rc, radius=1.5, spec_factor=0.18)
        # Grazing cool-amber architectural spot raking across the right obsidian origami acoustic wall panels!
        add_light("Tok_OrigamiRake", "SPOT", (4.4, -2.5, 4.0), (6.5, -0.3, 2.1), 2400.0, "#BFD9FF", rc, spot_deg=58.0, radius=0.35, spec_factor=0.65)
        # Soft low front fill so tapered dark-bronze table legs & gold kintsugi veins gleam richly
        add_light("Tok_FrontSoft", "POINT", (-2.2, -3.6, 1.8), None, 720.0, "#FFE0B4", rc, radius=1.6, spec_factor=0.10)

    # --- 3. Cairo Subterranean Solar Hall Lighting ---
    def lights_cairo(rc):
        # Dramatic desert zenith sunbeam pouring down through the mechanical brass solar oculus onto the table!
        add_light("Cai_SolarBeam", "SPOT", (0.2, 0.3, 8.2), (0.0, 0.0, 0.78), 16500.0, "#FFE3A6", rc, spot_deg=46.0, spot_blend=0.45, radius=0.85, spec_factor=0.85)
        # Warm desert sandstone bounce illuminating the vaulted stone ribs & brass iris blades from below
        add_light("Cai_UpBounce", "POINT", (0.0, 0.6, 3.6), None, 2600.0, "#FFD08A", rc, radius=2.0, spec_factor=0.35)
        # Warm golden grazing lights raking across the stepped limestone acoustic baffles & antique brass ribs
        add_light("Cai_BaffleL", "POINT", (-4.4, 2.2, 2.6), None, 1850.0, "#FFC273", rc, radius=1.5, spec_factor=0.45)
        add_light("Cai_BaffleR", "POINT", (4.4, 2.2, 2.6), None, 1850.0, "#FFC273", rc, radius=1.5, spec_factor=0.45)
        add_light("Cai_FrontFill", "POINT", (0.0, -4.6, 2.4), None, 1050.0, "#D6E2F5", rc, radius=2.0, spec_factor=0.18)

    # --- 4. Meridian 19th-Century World Globe Museum Portrait Lighting ---
    def lights_globe(rc):
        # Seamless circular curved dark obsidian-slate museum gallery cyclorama (ZERO edge gaps!)
        bm_bg = bmesh.new()
        bm_add_lathe(bm_bg, [
            (0.01, -0.12), (9.5, -0.12), (9.5, 9.5), (9.1, 9.5),
            (9.1, 1.4), (8.6, 0.55), (7.8, 0.12), (6.5, 0.0), (0.01, 0.0),
        ], segs=48, closed_profile=True)
        finalize_obj("Globe_Studio_Backdrop", bm_bg, mats["tokyo_slate"], rc, uv_mode="box", uv_scale=0.35)

        # Warm Rembrandt museum key illuminating the embossed antique-gold continents, meridian ring & walnut stand
        add_light("Glb_KeyGold", "AREA", (2.6, -2.8, 2.4), (0.0, 0.0, 1.00), 440.0, "#FFE5B8", rc, size=1.4, spec_factor=0.40)
        # Soft cool observatory fill revealing the obsidian oceans, bathymetry & turned walnut cabriole tripod
        add_light("Glb_FillCool", "AREA", (-2.9, -2.0, 1.6), (0.0, 0.0, 0.85), 250.0, "#A2CDFF", rc, size=2.2, spec_factor=0.16)
        # Crisp golden back-rim light separating the inclined meridian ring, finial & tripod silhouette cleanly
        add_light("Glb_BackRim", "SPOT", (-1.4, 2.8, 2.5), (0.0, 0.0, 1.02), 620.0, "#FFDC9B", rc, spot_deg=52.0, radius=0.4, spec_factor=0.72)
        # Gentle warm floor-level accent revealing the inset lower magnetic compass dial & brass sabot feet
        add_light("Glb_LowCompass", "POINT", (1.1, -2.2, 0.45), None, 135.0, "#FFE0A8", rc, radius=0.6, spec_factor=0.25)

    with tempfile.TemporaryDirectory() as tmpdir:
        q_lon = render_quadrant(
            cols_dict["london"], all_cols,
            cam_pos=(0.0, -5.75, 1.92), cam_target=(0.0, 1.35, 3.05), lens_mm=18.5,
            world_hex="#23314A", world_str=0.55, setup_lights_fn=lights_london,
            tmp_png_path=os.path.join(tmpdir, "q_london.png"), width=W_Q, height=H_Q,
            hdri_rel="godot/assets/polyhaven/hdris/entrance_hall.hdr",
            bg_vis_hex="#466088", bg_vis_str=1.0, exposure=-0.06,
        )
        q_tok = render_quadrant(
            cols_dict["tokyo"], all_cols,
            cam_pos=(-2.55, -4.30, 1.82), cam_target=(1.15, 2.75, 1.62), lens_mm=21.5,
            world_hex="#050B18", world_str=0.35, setup_lights_fn=lights_tokyo,
            tmp_png_path=os.path.join(tmpdir, "q_tokyo.png"), width=W_Q, height=H_Q,
            hdri_rel="godot/assets/polyhaven/hdris/dresden_station_night.hdr",
            bg_vis_hex="#040A17", bg_vis_str=0.22, exposure=0.14,
        )
        q_cai = render_quadrant(
            cols_dict["cairo"], all_cols,
            cam_pos=(0.0, -5.75, 1.88), cam_target=(0.0, 1.35, 2.98), lens_mm=18.5,
            world_hex="#332211", world_str=0.45, setup_lights_fn=lights_cairo,
            tmp_png_path=os.path.join(tmpdir, "q_cairo.png"), width=W_Q, height=H_Q,
            hdri_rel="godot/assets/polyhaven/hdris/evening_museum_courtyard.hdr",
            bg_vis_hex="#F0BD68", bg_vis_str=1.5, exposure=-0.08,
        )
        q_glb = render_quadrant(
            cols_dict["globe"], all_cols,
            cam_pos=(1.98, -3.52, 1.24), cam_target=(0.0, 0.0, 0.87), lens_mm=42.0,
            world_hex="#0D1422", world_str=0.58, setup_lights_fn=lights_globe,
            tmp_png_path=os.path.join(tmpdir, "q_globe.png"), width=W_Q, height=H_Q,
            hdri_rel="godot/assets/polyhaven/hdris/studio_small_09.hdr",
            bg_vis_hex="#090E18", bg_vis_str=0.30, exposure=0.06,
        )

    # Restore all asset collections visible in viewport before saving .blend!
    for c in all_cols:
        c.hide_viewport = False
        c.hide_render = False

    # Composite crisp 1920x1080 2x2 contact sheet (Blender image buffers are bottom-up in Y!)
    full = np.ones((H_Q * 2, W_Q * 2, 4), dtype=np.float32)
    # Top row (y = H_Q .. 2*H_Q): London (left), Tokyo (right)
    full[H_Q:H_Q * 2, 0:W_Q, :] = q_lon
    full[H_Q:H_Q * 2, W_Q:W_Q * 2, :] = q_tok
    # Bottom row (y = 0 .. H_Q): Cairo (left), Meridian World Globe (right)
    full[0:H_Q, 0:W_Q, :] = q_cai
    full[0:H_Q, W_Q:W_Q * 2, :] = q_glb

    # Clean 4px antique-gold divider crosshairs + outer frame hairline
    gold = np.array([0.82, 0.65, 0.31, 1.0], dtype=np.float32)
    full[H_Q - 2:H_Q + 2, :, :] = gold
    full[:, W_Q - 2:W_Q + 2, :] = gold
    full[0:2, :, :] = gold
    full[-2:, :, :] = gold
    full[:, 0:2, :] = gold
    full[:, -2:, :] = gold

    # Stamp clean museum caption plates into the lower-left corner of each quadrant
    stamp_caption_bar(full, "LONDON - SOVEREIGN ROTUNDA", 18, H_Q + 18, scale=2)
    stamp_caption_bar(full, "TOKYO - 70F SKY PAVILION", W_Q + 18, H_Q + 18, scale=2)
    stamp_caption_bar(full, "CAIRO - SOLAR AMPHITHEATER", 18, 18, scale=2)
    stamp_caption_bar(full, "MERIDIAN - 19C WORLD GLOBE", W_Q + 18, 18, scale=2)

    out_img = bpy.data.images.new("AAA_World_Venues_ContactSheet", width=W_Q * 2, height=H_Q * 2, alpha=False, float_buffer=False)
    out_img.pixels.foreach_set(np.clip(full, 0.0, 1.0).ravel())
    out_img.filepath_raw = OUT_RENDER_PATH
    out_img.file_format = "PNG"
    out_img.save()
    bpy.data.images.remove(out_img)


def render_globe_v2_showcase(globe_col, all_cols, mats):
    """
    Renders a prestige cinema war-room 1600x900 dual-panel hero + macro showcase of
    meridian_world_globe.glb into assets/renders/meridian_globe_v2_render.png!
    - Left Panel (800x900): Full-height prestige 3/4 silhouette (pedestal plinth -> sapphire spire finial)
    - Right Panel (800x900): Macro close-up on embossed 24K gold continents, royal sapphire oceans,
      raised brass meridian inlays, equatorial vernier, and sapphire-inlaid horizon calendar ring!
    """
    W_P, H_P = 800, 900

    def lights_warroom_globe(rc):
        # Seamless dark prestige war-room obsidian-slate studio cyclorama
        bm_bg = bmesh.new()
        bm_add_lathe(bm_bg, [
            (0.01, -0.12), (9.5, -0.12), (9.5, 9.5), (9.1, 9.5),
            (9.1, 1.4), (8.6, 0.55), (7.8, 0.12), (6.5, 0.0), (0.01, 0.0),
        ], segs=48, closed_profile=True)
        finalize_obj("GlobeV2_WarRoom_Backdrop", bm_bg, mats["tokyo_slate"], rc, uv_mode="box", uv_scale=0.35)

        # Warm Rembrandt cinema gold key (grazes embossed gold continent cliffs & raised brass inlays!)
        add_light("GV2_KeyGold", "AREA", (2.55, -2.65, 2.35), (0.0, 0.0, 1.02), 540.0, "#FFE4B5", rc, size=1.25, spec_factor=0.62)
        # Cool royal-sapphire war-room fill accentuating deep sapphire oceans & bathymetry contours
        add_light("GV2_FillSapphire", "AREA", (-2.95, -2.05, 1.55), (0.0, 0.0, 0.92), 290.0, "#85BDFF", rc, size=2.0, spec_factor=0.22)
        # Crisp warm champagne back-rim separating meridian ring, spire finial & cabriole tripod
        add_light("GV2_BackRim", "SPOT", (-1.35, 2.75, 2.60), (0.0, 0.0, 1.04), 760.0, "#FFD892", rc, spot_deg=50.0, radius=0.38, spec_factor=0.85)
        # Dedicated low warm pedestal spotlight showcasing obsidian anchor ring, sabots & 16-pt compass dial
        add_light("GV2_PedestalSpot", "SPOT", (1.25, -2.30, 0.72), (0.0, 0.0, 0.24), 210.0, "#FFDF9E", rc, spot_deg=46.0, radius=0.35, spec_factor=0.45)

    # Temporarily rotate Globe_Spin_Pivot slightly for beauty pose (Europe, Africa, Atlantic Compass Rose & Americas!),
    # then restore exact 0-deg identity before leaving!
    spin_obj = bpy.data.objects.get("Globe_Spin_Pivot")
    orig_rot_z = spin_obj.rotation_euler.z if spin_obj else 0.0
    if spin_obj:
        spin_obj.rotation_euler.z = math.radians(12.0)

    with tempfile.TemporaryDirectory() as tmpdir:
        p_full = render_quadrant(
            globe_col, all_cols,
            cam_pos=(1.72, -3.12, 1.24), cam_target=(0.0, 0.0, 0.87), lens_mm=54.0,
            world_hex="#091122", world_str=0.62, setup_lights_fn=lights_warroom_globe,
            tmp_png_path=os.path.join(tmpdir, "g_full.png"), width=W_P, height=H_P,
            hdri_rel="godot/assets/polyhaven/hdris/studio_small_09.hdr",
            bg_vis_hex="#070C17", bg_vis_str=0.28, exposure=0.08,
        )
        p_macro = render_quadrant(
            globe_col, all_cols,
            cam_pos=(0.98, -1.78, 1.38), cam_target=(-0.02, 0.0, 1.06), lens_mm=62.0,
            world_hex="#091122", world_str=0.62, setup_lights_fn=lights_warroom_globe,
            tmp_png_path=os.path.join(tmpdir, "g_macro.png"), width=W_P, height=H_P,
            hdri_rel="godot/assets/polyhaven/hdris/studio_small_09.hdr",
            bg_vis_hex="#070C17", bg_vis_str=0.28, exposure=0.06,
        )

    if spin_obj:
        spin_obj.rotation_euler.z = orig_rot_z

    for c in all_cols:
        c.hide_viewport = False
        c.hide_render = False

    full = np.ones((H_P, W_P * 2, 4), dtype=np.float32)
    full[:, 0:W_P, :] = p_full
    full[:, W_P:W_P * 2, :] = p_macro

    gold = np.array([0.86, 0.69, 0.33, 1.0], dtype=np.float32)
    full[:, W_P - 2:W_P + 2, :] = gold
    full[0:2, :, :] = gold
    full[-2:, :, :] = gold
    full[:, 0:2, :] = gold
    full[:, -2:, :] = gold

    stamp_caption_bar(full, "MERIDIAN GLOBE V2 - WAR ROOM HERO", 20, 20, scale=2)
    stamp_caption_bar(full, "MACRO - EMBOSSED GOLD & MERIDIAN INLAYS", W_P + 20, 20, scale=2)

    out_img = bpy.data.images.new("Meridian_Globe_V2_Showcase", width=W_P * 2, height=H_P, alpha=False, float_buffer=False)
    out_img.pixels.foreach_set(np.clip(full, 0.0, 1.0).ravel())
    out_img.filepath_raw = OUT_GLOBE_V2_RENDER_PATH
    out_img.file_format = "PNG"
    out_img.save()
    bpy.data.images.remove(out_img)


# ===========================================================================
# Main Orchestrator
# ===========================================================================
def main():
    argv = sys.argv
    extra_args = argv[argv.index("--") + 1:] if "--" in argv else []
    globe_only = ("--globe-only" in extra_args)

    log_lines = []
    def log(msg: str):
        print(msg, flush=True)
        log_lines.append(msg)

    try:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        mode_tag = "MERIDIAN WORLD GLOBE V2 ONLY" if globe_only else "ALL VENUES & GLOBE"
        log(f"=== World's Smartest AAA Pipeline ({mode_tag}) | Blender {bpy.app.version_string} ===")

        textures = build_procedural_textures()
        mats = build_material_library(textures)
        log(f"Procedural PBR textures packed: {len(textures)} | Materials built: {len(mats)}")
        for tkey in ("globe_col", "globe_metal", "globe_norm", "trav_col", "walnut_col"):
            im = textures[tkey]
            buf = np.empty(im.size[0] * im.size[1] * 4, dtype=np.float32)
            im.pixels.foreach_get(buf)
            log(f"  [TEX] {im.name:22s} | size={list(im.size)} | packed={im.packed_file is not None} | rgb_mean={buf.reshape(-1,4)[:,:3].mean():.3f}")

        if globe_only:
            builders = [("globe", "meridian_world_globe.glb", build_meridian_world_globe)]
        else:
            builders = [
                ("london", "london_rotunda_room.glb", build_london_rotunda),
                ("tokyo",  "tokyo_pavilion_room.glb", build_tokyo_pavilion),
                ("cairo",  "cairo_solar_hall.glb",    build_cairo_solar_hall),
                ("globe",  "meridian_world_globe.glb", build_meridian_world_globe),
            ]

        cols_dict = {}
        summary = []

        for key, glb_name, fn in builders:
            col, root = fn(mats)
            cols_dict[key] = col
            bpy.context.view_layer.update()
            tris, g_min, g_max, mat_names, node_names = get_asset_stats(root)
            out_p, fsize, glb_info = export_glb(root, col, glb_name)
            rec = {
                "file": glb_name,
                "tris": tris,
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
            log(
                f"[EXPORT] {glb_name:28s} | tris={tris:6d} (glb={rec['glb_tris']:6d}) | "
                f"size={rec['kb']:7.1f} KB | glTF_AABB={g_min}..{g_max} | mats={len(mat_names)}"
            )

        if globe_only:
            log("Rendering 1600x900 Prestige War-Room Meridian Globe V2 Showcase PNG...")
            render_globe_v2_showcase(cols_dict["globe"], list(cols_dict.values()), mats)
            png_kb = os.path.getsize(OUT_GLOBE_V2_RENDER_PATH) / 1024.0 if os.path.exists(OUT_GLOBE_V2_RENDER_PATH) else 0.0
            log(f"[RENDER] {OUT_GLOBE_V2_RENDER_PATH} ({png_kb:.1f} KB)")
        else:
            bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND_PATH)
            blend_kb = os.path.getsize(OUT_BLEND_PATH) / 1024.0
            log(f"[BLEND ] {OUT_BLEND_PATH} ({blend_kb:.1f} KB)")
            log("Rendering 1920x1080 2x2 architectural showcase render...")
            render_2x2_contact_sheet(cols_dict, mats)
            png_kb = os.path.getsize(OUT_RENDER_PATH) / 1024.0 if os.path.exists(OUT_RENDER_PATH) else 0.0
            log(f"[RENDER] {OUT_RENDER_PATH} ({png_kb:.1f} KB)")
            log("Rendering 1600x900 Prestige War-Room Meridian Globe V2 Showcase PNG...")
            render_globe_v2_showcase(cols_dict["globe"], list(cols_dict.values()), mats)
            g_png_kb = os.path.getsize(OUT_GLOBE_V2_RENDER_PATH) / 1024.0 if os.path.exists(OUT_GLOBE_V2_RENDER_PATH) else 0.0
            log(f"[RENDER] {OUT_GLOBE_V2_RENDER_PATH} ({g_png_kb:.1f} KB)")

        log("=== SUMMARY JSON ===")
        log(json.dumps(summary, indent=2))
        log("=== WORLD VENUES & GLOBE BUILD COMPLETE OK ===")

    except Exception:
        log("!!! BUILD FAILED !!!")
        log(traceback.format_exc())
    finally:
        # ALWAYS write sentinel log last so PowerShell MSIX watcher exits cleanly!
        with open(OUT_LOG_PATH, "w", encoding="utf-8") as f:
            f.write("\n".join(log_lines) + "\n")


if __name__ == "__main__":
    main()
