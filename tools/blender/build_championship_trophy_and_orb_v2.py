#!/usr/bin/env python3
"""
World's Smartest — AAA Championship Crown Trophy & Movie-CGI Veritas Orb v2 Pipeline (Blender 5.3.0)

Dual-mode script:
  1. Inside Blender 5.3.0 (`--background --python tools/blender/build_championship_trophy_and_orb_v2.py`):
     - Sculpts & exports museum-grade `godot/assets/aaa_models/championship_trophy.glb` (<= 35k tris)
       + saves `assets/blender/aaa_championship_trophy.blend`
       + renders `assets/renders/championship_trophy_render.png` (1024x1024 luxury studio shot)
     - Upgrades & exports movie-CGI `godot/assets/aaa_models/veritas_astrolabe_orb.glb`
       (richer 22K satin gold, iridescent midnight-sapphire lacquered obsidian petals, sparkling
       sapphire/ruby bearings, high-contrast Nero Marquina gold-veined marble, exact 15-node pivots!)
       + updates `assets/blender/aaa_veritas_orb.blend`
       + renders updated `assets/renders/aaa_veritas_orb_render.png` (1024x1024)
     - Writes completion sentinel `assets/renders/trophy_orb_v2_blender.log`
  2. Outside Blender in system Python (`python tools/blender/build_championship_trophy_and_orb_v2.py --sanitize`):
     - Re-encodes ALL embedded GLB images as clean baseline JFIF RGB JPEGs (Pillow quality=88,
       optimize=True, progressive=False, ZERO APP1/NeoGeo/EXIF and ZERO APP2/ICC_PROFILE markers!)
     - Rebuilds strictly 4-byte-aligned glTF 2.0 JSON + BIN chunks
     - Verifies 0 APP1/APP2/NeoGeo/ICC markers + full Pillow decode + glTF structure audit!
"""

import io
import json
import math
import struct
import sys
import time
import traceback
from pathlib import Path

SCRIPT_PATH = Path(__file__).resolve()
PROJECT_ROOT = SCRIPT_PATH.parents[2]

BLEND_DIR = PROJECT_ROOT / "assets" / "blender"
RENDER_DIR = PROJECT_ROOT / "assets" / "renders"
GODOT_AAA_DIR = PROJECT_ROOT / "godot" / "assets" / "aaa_models"

TROPHY_BLEND = BLEND_DIR / "aaa_championship_trophy.blend"
TROPHY_GLB = GODOT_AAA_DIR / "championship_trophy.glb"
TROPHY_RENDER_PNG = RENDER_DIR / "championship_trophy_render.png"

ORB_BLEND = BLEND_DIR / "aaa_veritas_orb.blend"
ORB_GLB = GODOT_AAA_DIR / "veritas_astrolabe_orb.glb"
ORB_RENDER_PNG = RENDER_DIR / "aaa_veritas_orb_render.png"

LOG_FILE = RENDER_DIR / "trophy_orb_v2_blender.log"


# ===========================================================================
# MODE 2: STRICT GODOT 4.7.2 GLB BASELINE-JPEG SANITIZER & MARKER AUDITOR
# ===========================================================================
def audit_jpeg_markers(jpg_bytes: bytes):
    """Scans JPEG segment markers and returns any disallowed APP1/APP2/NeoGeo/ICC markers."""
    assert jpg_bytes[:2] == b"\xff\xd8", "Missing JPEG SOI"
    bad = []
    pos = 2
    n = len(jpg_bytes)
    while pos + 2 <= n:
        if jpg_bytes[pos] != 0xFF:
            break
        while pos < n and jpg_bytes[pos] == 0xFF:
            pos += 1
        if pos >= n:
            break
        marker = jpg_bytes[pos]
        pos += 1
        if marker in (0xD9, 0xDA):  # EOI or SOS (scan data follows)
            break
        if marker in (0x01,) or (0xD0 <= marker <= 0xD7):
            continue
        if pos + 2 > n:
            break
        seg_len = struct.unpack_from(">H", jpg_bytes, pos)[0]
        seg_data = jpg_bytes[pos + 2:pos + seg_len]
        if marker == 0xE1:
            bad.append(f"APP1({seg_data[:12]!r})")
        elif marker == 0xE2:
            bad.append(f"APP2({seg_data[:12]!r})")
        elif b"NeoGeo" in seg_data or b"ICC_PROFILE" in seg_data:
            bad.append(f"MARKER_0x{marker:02X}")
        pos += seg_len
    return bad


def sanitize_glb_jpegs(glb_path: Path, quality: int = 88):
    """Converts every embedded image in a GLB into clean baseline JFIF RGB JPEG (0 APP1/APP2/NeoGeo/ICC)."""
    from PIL import Image

    raw = glb_path.read_bytes()
    magic, version, _total_len = struct.unpack_from("<4sII", raw, 0)
    assert magic == b"glTF" and version == 2, f"Invalid GLB header in {glb_path}"

    json_len, json_type = struct.unpack_from("<I4s", raw, 12)
    assert json_type == b"JSON"
    gltf = json.loads(raw[20:20 + json_len].decode("utf-8"))

    bin_header_off = 20 + json_len
    bin_len, bin_type = struct.unpack_from("<I4s", raw, bin_header_off)
    assert bin_type == b"BIN\x00"
    old_bin = raw[bin_header_off + 8:bin_header_off + 8 + bin_len]

    images = gltf.get("images", [])
    buffer_views = gltf.get("bufferViews", [])
    image_bv_indices = {img["bufferView"] for img in images if "bufferView" in img}

    # Rebuild BIN buffer preserving exact 4-byte alignment for EVERY bufferView!
    new_bin_parts = []
    cur_off = 0
    sanitized_count = 0
    bad_markers_total = 0

    for bv_idx, bv in enumerate(buffer_views):
        old_off = bv.get("byteOffset", 0)
        old_len = bv["byteLength"]
        chunk = old_bin[old_off:old_off + old_len]

        if bv_idx in image_bv_indices:
            img_obj = Image.open(io.BytesIO(chunk))
            if img_obj.mode != "RGB":
                img_obj = img_obj.convert("RGB")
            out_buf = io.BytesIO()
            # Pure baseline JFIF JPEG — NO exif, NO icc_profile, NO progressive!
            img_obj.save(
                out_buf,
                format="JPEG",
                quality=quality,
                optimize=True,
                progressive=False,
                subsampling="4:2:0",
            )
            jpg_bytes = out_buf.getvalue()
            # Verify decode + 0 bad markers
            bad = audit_jpeg_markers(jpg_bytes)
            bad_markers_total += len(bad)
            assert len(bad) == 0, f"Disallowed JPEG markers remained in {glb_path.name} bv={bv_idx}: {bad}"
            check_im = Image.open(io.BytesIO(jpg_bytes))
            check_im.load()
            chunk = jpg_bytes
            sanitized_count += 1

        # Pad to 4-byte alignment before writing this view
        pad = (-cur_off) % 4
        if pad:
            new_bin_parts.append(b"\x00" * pad)
            cur_off += pad

        bv["byteOffset"] = cur_off
        bv["byteLength"] = len(chunk)
        new_bin_parts.append(chunk)
        cur_off += len(chunk)

    for img in images:
        if "bufferView" in img:
            img["mimeType"] = "image/jpeg"

    # Pad final BIN chunk to 4 bytes
    end_pad = (-cur_off) % 4
    if end_pad:
        new_bin_parts.append(b"\x00" * end_pad)
        cur_off += end_pad
    new_bin = b"".join(new_bin_parts)

    if gltf.get("buffers"):
        gltf["buffers"][0]["byteLength"] = len(new_bin)

    new_json_bytes = json.dumps(gltf, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    j_pad = (-len(new_json_bytes)) % 4
    if j_pad:
        new_json_bytes += b" " * j_pad

    total_length = 12 + 8 + len(new_json_bytes) + 8 + len(new_bin)
    out_glb = bytearray()
    out_glb.extend(struct.pack("<4sII", b"glTF", 2, total_length))
    out_glb.extend(struct.pack("<I4s", len(new_json_bytes), b"JSON"))
    out_glb.extend(new_json_bytes)
    out_glb.extend(struct.pack("<I4s", len(new_bin), b"BIN\x00"))
    out_glb.extend(new_bin)
    glb_path.write_bytes(bytes(out_glb))

    # Re-verify written GLB from disk
    accessors = gltf.get("accessors", [])
    tris = 0
    for mesh in gltf.get("meshes", []):
        for prim in mesh.get("primitives", []):
            if "indices" in prim:
                tris += accessors[prim["indices"]]["count"] // 3
            elif "POSITION" in prim.get("attributes", {}):
                tris += accessors[prim["attributes"]["POSITION"]]["count"] // 3

    return {
        "file": glb_path.name,
        "bytes": len(out_glb),
        "triangles": tris,
        "jpegs": sanitized_count,
        "bad_markers": bad_markers_total,
        "nodes": [n.get("name", "") for n in gltf.get("nodes", [])],
        "materials": [m.get("name", "") for m in gltf.get("materials", [])],
    }


def run_sanitize_cli():
    results = []
    for target in (TROPHY_GLB, ORB_GLB):
        assert target.exists(), f"Missing GLB to sanitize: {target}"
        info = sanitize_glb_jpegs(target, quality=88)
        results.append(info)
        print(
            f"[SANITIZE OK] {info['file']} | {info['bytes']:,} B | "
            f"{info['triangles']:,} tris | {info['jpegs']} baseline JPEGs | "
            f"bad_markers={info['bad_markers']}"
        )
    return results


if "--sanitize" in sys.argv:
    run_sanitize_cli()
    sys.exit(0)


# ===========================================================================
# MODE 1: BLENDER 5.3.0 SCULPT, EXPORT & BEAUTY RENDER PIPELINE
# ===========================================================================
import bpy
import bmesh
from mathutils import Euler, Matrix, Vector

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


def make_image_from_rgb(name: str, width: int, height: int, pixels_rgba, colorspace: str = "sRGB"):
    img = bpy.data.images.new(name=name, width=width, height=height, alpha=False, float_buffer=False)
    try:
        img.colorspace_settings.name = colorspace
    except Exception:
        pass
    img.pixels.foreach_set(pixels_rgba)
    img.pack()
    return img


def gen_nero_gold_marble_textures(prefix: str = "Tex_NeroGoldMarble", size: int = 256):
    """High-contrast luxury Nero Marquina dark marble with radiant champagne-gold mineral veins."""
    albedo = [0.0] * (size * size * 4)
    rough = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        v = y / size
        for x in range(size):
            u = x / size
            w1 = fbm_2d(u * 4.0, v * 4.0, octaves=4, seed=11, period=4)
            w2 = fbm_2d(u * 8.0 + 1.3, v * 8.0 + 2.7, octaves=3, seed=29, period=8)
            phase = (u * 2.0 + v * 1.0) * math.tau + (w1 - 0.5) * 6.5 + (w2 - 0.5) * 2.2
            vein1 = pow(clamp(1.0 - abs(math.sin(phase)), 0.0, 1.0), 13.0)
            phase2 = (u * 1.0 - v * 3.0) * math.tau + (w2 - 0.5) * 5.2
            vein2 = pow(clamp(1.0 - abs(math.sin(phase2)), 0.0, 1.0), 20.0) * 0.65

            cloud = fbm_2d(u * 6.0, v * 6.0, octaves=3, seed=7, period=6)
            br = lerp(0.042, 0.088, cloud)
            bg = lerp(0.052, 0.104, cloud)
            bb = lerp(0.078, 0.145, cloud)

            vein = clamp(vein1 * 0.90 + vein2 * 0.55, 0.0, 1.0)
            # Warm champagne-gold & ivory mineral veins
            vr, vg, vb = 0.84, 0.71, 0.48
            albedo[idx] = clamp(lerp(br, vr, vein * 0.72))
            albedo[idx + 1] = clamp(lerp(bg, vg, vein * 0.72))
            albedo[idx + 2] = clamp(lerp(bb, vb, vein * 0.72))
            albedo[idx + 3] = 1.0

            rv = clamp(0.14 + cloud * 0.08 + vein * 0.09, 0.09, 0.34)
            rough[idx] = rv
            rough[idx + 1] = rv
            rough[idx + 2] = rv
            rough[idx + 3] = 1.0
            idx += 4

    return (
        make_image_from_rgb(f"{prefix}_COL", size, size, albedo, "sRGB"),
        make_image_from_rgb(f"{prefix}_RGH", size, size, rough, "Non-Color"),
    )


def gen_sapphire_obsidian_texture(name: str = "Tex_SapphireObsidian_COL", size: int = 256):
    """Deep iridescent midnight-sapphire lacquered obsidian texture for Faberge petals & crown inlays."""
    albedo = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        v = y / size
        for x in range(size):
            u = x / size
            swirl = fbm_2d(u * 4.0, v * 4.0, octaves=4, seed=83, period=4)
            shimmer = fbm_2d(u * 8.0 + swirl * 1.4, v * 8.0 - swirl * 1.1, octaves=3, seed=127, period=8)
            t = clamp(swirl * 0.62 + shimmer * 0.38, 0.0, 1.0)
            # Rich royal midnight-sapphire obsidian (#081126 .. #162E5C) — gleams in WebGL2 & Cycles/EEVEE!
            albedo[idx] = lerp(0.032, 0.092, t)
            albedo[idx + 1] = lerp(0.068, 0.175, t)
            albedo[idx + 2] = lerp(0.148, 0.360, t)
            albedo[idx + 3] = 1.0
            idx += 4
    return make_image_from_rgb(name, size, size, albedo, "sRGB")


def gen_silky_satin_roughness(name: str = "Tex_SatinGold_RGH", size: int = 256,
                              base_r: float = 0.17, amp: float = 0.032):
    """Smooth directional Swiss haute-horlogerie satin-brushed roughness map (zero pixel speckle)."""
    raw = [0.0] * size
    for y in range(size):
        t = (y / size) * math.tau
        raw[y] = (
            0.40 * math.sin(t * 5.0 + 0.3)
            + 0.30 * math.sin(t * 13.0 + 1.4)
            + 0.20 * math.cos(t * 23.0 + 2.1)
            + 0.10 * math.sin(t * 37.0 + 0.8)
        )
    for _ in range(2):
        raw = [0.25 * raw[(i - 1) % size] + 0.5 * raw[i] + 0.25 * raw[(i + 1) % size] for i in range(size)]

    pixels = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        rv = raw[y]
        for x in range(size):
            u = (x / size) * math.tau
            v = clamp(base_r + amp * rv * (0.85 + 0.15 * math.cos(u * 2.0)), 0.08, 0.55)
            pixels[idx] = v
            pixels[idx + 1] = v
            pixels[idx + 2] = v
            pixels[idx + 3] = 1.0
            idx += 4
    return make_image_from_rgb(name, size, size, pixels, "Non-Color")


# ---------------------------------------------------------------------------
# Luxury Movie-CGI Material Factory
# ---------------------------------------------------------------------------
def make_pbr_material(
    name: str,
    base_hex: str,
    metallic: float = 0.0,
    roughness: float = 0.25,
    coat_weight: float = 0.0,
    coat_roughness: float = 0.05,
    emissive_hex: str = None,
    emissive_strength: float = 0.0,
    ior: float = 1.50,
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
    if "Coat Weight" in bsdf.inputs and coat_weight > 0.0:
        bsdf.inputs["Coat Weight"].default_value = coat_weight
    if "Coat Roughness" in bsdf.inputs and coat_weight > 0.0:
        bsdf.inputs["Coat Roughness"].default_value = coat_roughness

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


def build_luxury_jewelry_materials():
    """Movie-CGI 22K satin gold, royal midnight-sapphire obsidian, Nero Marquina gold-vein marble & jewels."""
    marble_col, marble_rgh = gen_nero_gold_marble_textures("Tex_NeroGoldMarble", 256)
    sapph_obs_col = gen_sapphire_obsidian_texture("Tex_SapphireObsidian_COL", 256)
    satin_gold_rgh = gen_silky_satin_roughness("Tex_SatinGold_RGH", 256, base_r=0.165, amp=0.030)
    satin_brass_rgh = gen_silky_satin_roughness("Tex_SatinBrass_RGH", 256, base_r=0.235, amp=0.038)

    return [
        # 0: 22K Radiant Sovereign Satin Gold (gleams like liquid movie CGI in WebGL2 & Blender!)
        make_pbr_material(
            "Mat_Brushed_Gold",
            "#F4CC6C",
            metallic=0.96,
            roughness=0.165,
            coat_weight=0.16,
            coat_roughness=0.05,
            rgh_img=satin_gold_rgh,
            uv_scale=2.2,
        ),
        # 1: Royal Antique Satin Brass (warm deep gold contrast)
        make_pbr_material(
            "Mat_Antique_Brass",
            "#CA9640",
            metallic=0.94,
            roughness=0.235,
            coat_weight=0.10,
            coat_roughness=0.09,
            rgh_img=satin_brass_rgh,
            uv_scale=2.2,
        ),
        # 2: 18K Rose Gold (inner tourbillon & laurel accents)
        make_pbr_material(
            "Mat_Rose_Gold",
            "#E8A878",
            metallic=0.96,
            roughness=0.155,
            coat_weight=0.14,
            coat_roughness=0.06,
            rgh_img=satin_gold_rgh,
            uv_scale=2.4,
        ),
        # 3: Glossy Royal Midnight-Sapphire Lacquered Obsidian (catches dramatic blue-black specular ribbons!)
        make_pbr_material(
            "Mat_Obsidian_Onyx",
            "#0D1B38",
            metallic=0.30,
            roughness=0.09,
            coat_weight=0.95,
            coat_roughness=0.03,
            col_img=sapph_obs_col,
            uv_scale=1.6,
        ),
        # 4: Nero Marquina Gold-Veined Dark Marble
        make_pbr_material(
            "Mat_Dark_Marble",
            "#0E121B",
            metallic=0.03,
            roughness=0.16,
            coat_weight=0.52,
            coat_roughness=0.06,
            col_img=marble_col,
            rgh_img=marble_rgh,
            uv_scale=1.5,
        ),
        # 5: Blued Watchmaker Gunmetal Steel
        make_pbr_material(
            "Mat_Gunmetal_Steel",
            "#222E44",
            metallic=0.91,
            roughness=0.24,
            coat_weight=0.12,
            rgh_img=satin_brass_rgh,
            uv_scale=2.4,
        ),
        # 6: Faceted Royal Blue Sapphire Jewel Bearing (sparkles vividly in Godot & Blender!)
        make_pbr_material(
            "Mat_Sapphire_Jewel",
            "#185EFF",
            metallic=0.12,
            roughness=0.035,
            coat_weight=1.0,
            coat_roughness=0.015,
            emissive_hex="#2572FF",
            emissive_strength=0.95,
            ior=1.77,
        ),
        # 7: Pigeon-Blood Horological Ruby Jewel Bearing
        make_pbr_material(
            "Mat_Ruby_Jewel",
            "#DF1642",
            metallic=0.12,
            roughness=0.035,
            coat_weight=1.0,
            coat_roughness=0.015,
            emissive_hex="#F0204C",
            emissive_strength=0.95,
            ior=1.77,
        ),
        # 8: Luminous Faceted Champagne-Diamond Crystal Heart (razor-crisp glowing diamond facets!)
        make_pbr_material(
            "Mat_Crystal_Heart",
            "#FFD978",
            metallic=0.28,
            roughness=0.045,
            coat_weight=1.0,
            coat_roughness=0.015,
            emissive_hex="#FFC246",
            emissive_strength=1.85,
            ior=2.18,
        ),
        # 9: Warm Recessed Magnetic Levitation Gold Halo
        make_pbr_material(
            "Mat_Levitation_Glow",
            "#F0BA4C",
            metallic=0.68,
            roughness=0.18,
            emissive_hex="#FFC14A",
            emissive_strength=1.80,
        ),
        # 10: Mirror-Polished 24K Liquid Gold (crown crests, laurel edges, meridian star blades!)
        make_pbr_material(
            "Mat_Liquid_Gold_24K",
            "#FFDC7E",
            metallic=0.98,
            roughness=0.11,
            coat_weight=0.25,
            coat_roughness=0.03,
        ),
    ]


M_GOLD = 0
M_BRASS = 1
M_ROSE = 2
M_OBSIDIAN = 3
M_MARBLE = 4
M_GUNMETAL = 5
M_SAPPHIRE = 6
M_RUBY = 7
M_CRYSTAL = 8
M_LEV_GLOW = 9
M_GOLD24 = 10


# ---------------------------------------------------------------------------
# Precision Hard-Surface & Sculptural BMesh Primitives
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


def mark_sharp_by_angle(bm, angle_deg: float = 36.0, keep_flat_mats=None):
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
    uv_scale: float = 1.8,
    weld_dist: float = 1e-5,
    weighted_normal: bool = True,
    keep_flat_mats=None,
):
    if weld_dist > 0.0:
        bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=weld_dist)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.normal_update()
    apply_box_uvs(bm, scale=uv_scale)
    mark_sharp_by_angle(bm, angle_deg=sharp_angle_deg, keep_flat_mats=keep_flat_mats)

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

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
    rings = []
    for r, z in profile_rz:
        ring = []
        for s in range(segments):
            a = angle_offset + (s / segments) * math.tau
            rr = r
            if flute_count > 0 and flute_depth != 0.0:
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
        cp = Vector((0.0, 0.0, profile_rz[0][1]))
        if matrix is not None:
            cp = matrix @ cp
        cv = bm.verts.new(cp)
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
        cp = Vector((0.0, 0.0, profile_rz[-1][1]))
        if matrix is not None:
            cp = matrix @ cp
        cv = bm.verts.new(cp)
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

    if closed_path:
        t_last, t_first = tangents[-1], tangents[0]
        axis = t_last.cross(t_first)
        n_end, _ = frames[-1]
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
        ring = [bm.verts.new(p + nv * (pu * sx) + bv * (pv * sy)) for (pu, pv) in profile_2d]
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
                      matrix: Matrix = None, segments: int = 1):
    ret = bmesh.ops.create_cube(bm, size=1.0)
    verts = ret["verts"]
    scale_m = Matrix.Diagonal((sx, sy, sz, 1.0))
    for v in verts:
        v.co = scale_m @ v.co
    edges = list({e for v in verts for e in v.link_edges})
    faces = list({f for v in verts for f in v.link_faces})
    if bevel > 0.0:
        b_ret = bmesh.ops.bevel(
            bm, geom=edges, offset=min(bevel, min(sx, sy, sz) * 0.42),
            segments=segments, affect="EDGES", clamp_overlap=True,
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
                    bezel_mat: int, gem_mat: int, facets: int = 10):
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
    bezel_prof = [
        (radius * 1.26, -height * 0.25),
        (radius * 1.30, height * 0.08),
        (radius * 1.14, height * 0.45),
        (radius * 0.92, height * 0.48),
        (radius * 0.86, height * 0.20),
    ]
    add_lathe_profile(bm, bezel_prof, segments=facets, mat_idx=bezel_mat, cap_bottom=True, matrix=m)
    gem_prof = [
        (radius * 0.86, height * 0.18),
        (radius * 0.90, height * 0.48),
        (radius * 0.60, height * 0.86),
        (radius * 0.24, height * 0.98),
    ]
    add_lathe_profile(bm, gem_prof, segments=facets, mat_idx=gem_mat, cap_top=True, matrix=m)


def add_diamond_index(bm, pos: Vector, normal_dir: Vector, tangent_dir: Vector,
                      length: float, width: float, height: float, mat_idx: int):
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
    bv = [bm.verts.new(m @ Vector(p)) for p in ((hl, 0, 0), (0, hw, 0), (-hl, 0, 0), (0, -hw, 0))]
    tv = [bm.verts.new(m @ Vector(p)) for p in (
        (hl * 0.56, 0, height), (0, hw * 0.56, height), (-hl * 0.56, 0, height), (0, -hw * 0.56, height)
    )]
    apex = bm.verts.new(m @ Vector((0, 0, height * 1.28)))
    for i in range(4):
        inext = (i + 1) % 4
        f1 = bm.faces.new((bv[i], bv[inext], tv[inext], tv[i]))
        f1.material_index = mat_idx
        f2 = bm.faces.new((tv[i], tv[inext], apex))
        f2.material_index = mat_idx
    fb = bm.faces.new(list(reversed(bv)))
    fb.material_index = mat_idx


def add_sculpted_laurel_leaf(bm, origin: Vector, dir_vec: Vector, up_vec: Vector,
                             length: float, width: float, thickness: float, mat_idx: int):
    """Sculpts a graceful, gently arched, center-ribbed 3D golden victory laurel leaf (~40 tris)."""
    fwd = dir_vec.normalized()
    right = fwd.cross(up_vec.normalized())
    if right.length < 1e-5:
        right = fwd.cross(Vector((0, 1, 0)))
    right.normalize()
    up = right.cross(fwd).normalized()

    # 6 cross-sections along leaf spine from petiole stem to pointed golden tip
    steps = 6
    rings = []
    for k in range(steps):
        t = k / (steps - 1)
        # Elegant laurel leaf width curve + gentle upward arch
        env = math.sin(t * math.pi) ** 0.78
        w = max(0.0012, width * 0.5 * env * (1.12 - 0.25 * t))
        h = max(0.0008, thickness * 0.5 * (0.45 + 0.65 * env))
        arch = 0.14 * length * math.sin(t * math.pi)
        cup = 0.08 * width * env  # Subtle cupped leaf edges!
        center = origin + fwd * (t * length) + up * arch

        # 4-vertex diamond-ribbed cross-section (crisp central golden vein!)
        ring = [
            bm.verts.new(center - right * w + up * cup),
            bm.verts.new(center + up * h),
            bm.verts.new(center + right * w + up * cup),
            bm.verts.new(center - up * h * 0.75),
        ]
        rings.append(ring)

    for i in range(steps - 1):
        r0, r1 = rings[i], rings[i + 1]
        for j in range(4):
            jn = (j + 1) % 4
            f = bm.faces.new((r0[j], r0[jn], r1[jn], r1[j]))
            f.material_index = mat_idx
            f.smooth = True

    # Pointed tip & stem cap
    tip_v = bm.verts.new(origin + fwd * (length * 1.06) + up * (0.04 * length))
    stem_v = bm.verts.new(origin - fwd * (length * 0.06))
    for j in range(4):
        jn = (j + 1) % 4
        ft = bm.faces.new((rings[-1][j], rings[-1][jn], tip_v))
        ft.material_index = mat_idx
        fs = bm.faces.new((rings[0][jn], rings[0][j], stem_v))
        fs.material_index = mat_idx


def add_superellipse_extrusion(bm, rx: float, ry: float, exp_n: float, z0: float, z1: float,
                               segments: int, mat_idx: int, bevel_z: float = 0.008,
                               bevel_r: float = 0.008, cap_bottom: bool = True, cap_top: bool = True):
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
# ASSET A: SCULPTED GOLDEN-OBSIDIAN CHAMPIONSHIP ASTROLABE CROWN TROPHY
#   File: godot/assets/aaa_models/championship_trophy.glb  (strictly <= 35,000 tris!)
#   Bounds: H = 0.92m (min_y = 0.000m), outer width ~ 0.56m
# ===========================================================================
TROPHY_CROWN_Z = 0.585


def build_championship_trophy_objects(mats, collection):
    """
    6 Clean Named Nodes (total ~25k-31k tris, strictly <= 35k tris):
      1. Trophy_Plinth               (origin 0,0,0)        — Nero Marquina marble stepped pedestal + gold plaque collar
      2. Trophy_Stem_Laurels         (origin 0,0,0)        — Fluted obsidian/gold chalice stem + twin 3D sculpted victory laurel wreaths
      3. Trophy_Crown_Ring           (origin 0,0,0.585)    — Imperial 8-spire 24K gold & sapphire-obsidian crown diadem
      4. Trophy_Astrolabe_Ring_Outer (origin 0,0,0.585)    — 72-seg chamfered 22K gold celestial meridian ring + cardinal ruby/sapphire bearings
      5. Trophy_Astrolabe_Ring_Inner (origin 0,0,0.585)    — 72-seg rose-gold ecliptic gimbal ring + inward pointers
      6. Trophy_Star_Core            (origin 0,0,0.585)    — Luminous faceted diamond heart + 8-point 24K Meridian Star + Zenith Diamond Finial
    """
    objects = []

    # -----------------------------------------------------------------------
    # 1. Trophy_Plinth (Z = 0.000 .. 0.195m)
    # -----------------------------------------------------------------------
    bm_plinth = bmesh.new()

    # Heavy stepped Nero Marquina dark-marble architectural trophy pedestal (64 segs)
    plinth_marble = [
        (0.010, 0.000),
        (0.228, 0.000),
        (0.236, 0.008),
        (0.236, 0.028),
        (0.214, 0.044),
        (0.202, 0.056),
        (0.198, 0.132),
        (0.184, 0.150),
        (0.162, 0.168),
        (0.146, 0.186),
        (0.128, 0.195),
        (0.010, 0.195),
    ]
    add_lathe_profile(bm_plinth, plinth_marble, segments=64, mat_idx=M_MARBLE, cap_bottom=True, cap_top=True)

    # Solid 22K gold lower plinth foot trim + coin-edge scalloped waist collar + top bezel
    add_lathe_profile(
        bm_plinth, [(0.234, 0.004), (0.244, 0.010), (0.244, 0.024), (0.232, 0.030)],
        segments=64, mat_idx=M_GOLD, closed_profile=True
    )
    add_lathe_profile(
        bm_plinth, [(0.198, 0.054), (0.210, 0.060), (0.210, 0.072), (0.196, 0.078)],
        segments=64, mat_idx=M_BRASS, closed_profile=True, flute_count=32, flute_depth=0.0022
    )
    add_lathe_profile(
        bm_plinth, [(0.192, 0.128), (0.204, 0.134), (0.204, 0.146), (0.186, 0.152)],
        segments=64, mat_idx=M_GOLD, closed_profile=True
    )
    # Recessed royal sapphire-obsidian victory collar ring at top of plinth
    add_lathe_profile(
        bm_plinth, [(0.144, 0.172), (0.160, 0.176), (0.156, 0.188), (0.142, 0.190)],
        segments=64, mat_idx=M_OBSIDIAN, closed_profile=True
    )
    add_lathe_profile(
        bm_plinth, [(0.128, 0.188), (0.145, 0.192), (0.143, 0.202), (0.126, 0.198)],
        segments=64, mat_idx=M_GOLD24, closed_profile=True
    )

    # Front & back sculpted beveled 24K gold championship winner's cartouche nameplate hugging marble waist!
    for side in (-1.0, 1.0):
        # Sweeps cleanly along the curved marble waist (r = 0.199m, Z = 0.082..0.124m, ±24°)
        # Note: in add_swept_profile with up_hint=(0,0,1), u = radial (outward), v = vertical (height)!
        arc_n = 13
        plate_pts = []
        for k in range(arc_n):
            ang = lerp(math.radians(-24.0), math.radians(24.0), k / (arc_n - 1))
            px = math.sin(ang) * 0.199
            py = side * math.cos(ang) * 0.199
            plate_pts.append(Vector((px, py, 0.103)))
        # Symmetric flush curved vertical plaque: 3.8cm tall (v in [-0.019, +0.019]), beveled 6mm proud on both faces!
        plate_cs = [
            (-0.0055, -0.019),
            (0.0055, -0.019),
            (0.0070, -0.014),
            (0.0070, 0.014),
            (0.0055, 0.019),
            (-0.0055, 0.019),
            (-0.0070, 0.014),
            (-0.0070, -0.014),
        ]
        add_swept_profile(bm_plinth, plate_pts, plate_cs, mat_idx=M_GOLD24,
                          closed_path=False, cap_ends=True, up_hint=Vector((0, 0, 1)))
        # Flanking sapphire rivets seated cleanly on nameplate ends
        for s_end in (-1.0, 1.0):
            ea = s_end * math.radians(20.5)
            ep = Vector((math.sin(ea) * 0.205, side * math.cos(ea) * 0.205, 0.103))
            en = Vector((math.sin(ea), side * math.cos(ea), 0.0))
            add_faceted_gem(bm_plinth, ep, en, radius=0.0056, height=0.0045,
                            bezel_mat=M_GOLD, gem_mat=M_SAPPHIRE, facets=8)

    # 8 alternating sapphire & ruby cabochon accents around upper plinth collar
    for k in range(8):
        a = (k / 8.0) * math.tau + math.pi / 8.0
        p = Vector((math.cos(a) * 0.158, math.sin(a) * 0.158, 0.181))
        n = Vector((math.cos(a) * 0.85, math.sin(a) * 0.85, 0.52)).normalized()
        add_faceted_gem(bm_plinth, p, n, radius=0.0068, height=0.0052,
                        bezel_mat=M_GOLD24, gem_mat=(M_SAPPHIRE if k % 2 == 0 else M_RUBY), facets=8)

    for v in bm_plinth.verts:
        if v.co.z < 0.0:
            v.co.z = 0.0

    obj_plinth = finalize_mesh_obj("Trophy_Plinth", bm_plinth, mats, collection, sharp_angle_deg=35.0, uv_scale=2.0)
    objects.append(obj_plinth)

    # -----------------------------------------------------------------------
    # 2. Trophy_Stem_Laurels: Sculpted Fluted Chalice Stem + Twin 3D Golden Victory Laurel Arms
    # -----------------------------------------------------------------------
    bm_stem = bmesh.new()

    # Classical concave-waisted fluted 22K gold & midnight-sapphire obsidian pedestal chalice stem (Z=0.192..0.460m)
    stem_gold = [
        (0.125, 0.192),
        (0.114, 0.214),
        (0.088, 0.242),
        (0.062, 0.280),
        (0.052, 0.320),  # Slender sculptural waist
        (0.064, 0.352),
        (0.092, 0.382),
        (0.124, 0.412),
        (0.140, 0.436),
        (0.124, 0.452),
        (0.085, 0.440),
        (0.008, 0.428),
    ]
    add_lathe_profile(bm_stem, stem_gold, segments=48, mat_idx=M_GOLD,
                      cap_top=True, flute_count=12, flute_depth=0.0045)

    # Deep sapphire-obsidian jeweled waist knop ring at narrowest neck (Z = 0.305..0.340m)
    knop_obs = [
        (0.054, 0.304),
        (0.072, 0.314),
        (0.075, 0.322),
        (0.072, 0.332),
        (0.056, 0.342),
    ]
    add_lathe_profile(bm_stem, knop_obs, segments=48, mat_idx=M_OBSIDIAN)
    for z_k in (0.304, 0.342):
        add_lathe_profile(bm_stem, [(0.052, z_k - 0.005), (0.064, z_k), (0.052, z_k + 0.005)],
                          segments=48, mat_idx=M_GOLD24, closed_profile=True)

    # Upper sculpted obsidian-and-gold calyx cup cradle beneath the levitating Astrolabe Crown
    calyx_obs = [
        (0.128, 0.422),
        (0.146, 0.438),
        (0.132, 0.458),
        (0.095, 0.452),
    ]
    add_lathe_profile(bm_stem, calyx_obs, segments=48, mat_idx=M_OBSIDIAN, closed_profile=True)
    # Subtle warm gold levitation emitter lens inside the chalice calyx pointing up into the crown!
    add_lathe_profile(
        bm_stem, [(0.058, 0.438), (0.084, 0.446), (0.078, 0.454), (0.054, 0.446)],
        segments=48, mat_idx=M_LEV_GLOW, closed_profile=True
    )

    # 4 Sweeping Fluted Gold & Obsidian Calyx Buttress Ribs rising from plinth rim to calyx shoulder
    rib_cs = [(-0.006, -0.005), (0.006, -0.005), (0.005, 0.007), (-0.005, 0.007)]
    for k in range(4):
        ang = math.radians(45.0 + k * 90.0)
        ca, sa = math.cos(ang), math.sin(ang)
        r_pts = []
        for s_i in range(14):
            t = s_i / 13.0
            rr = lerp(0.134, 0.144, t) - 0.052 * math.sin(t * math.pi)
            zz = lerp(0.195, 0.450, t)
            r_pts.append(Vector((ca * rr, sa * rr, zz)))
        add_swept_profile(bm_stem, r_pts, rib_cs, mat_idx=M_GOLD24, closed_path=False, cap_ends=True,
                          up_hint=Vector((-sa, ca, 0.0)), scale_fn=lambda u: 0.7 + 0.5 * math.sin(u * math.pi))

    # TWIN MAJESTIC 3D SCULPTED GOLDEN VICTORY LAUREL WREATH ARMS sweeping left & right around the Crown!
    # Sweeps strictly OUTSIDE the R=0.235m Astrolabe Ring envelope centered at Z=0.585m so ZERO clipping!
    branch_cs = [
        (-0.007, -0.004), (0.007, -0.004), (0.008, 0.001),
        (0.005, 0.006), (-0.005, 0.006), (-0.008, 0.001),
    ]
    for side in (-1.0, 1.0):
        b_pts = []
        b_steps = 22
        for k in range(b_steps):
            t = k / (b_steps - 1)
            # Sweeps smoothly from stem shoulder (X=±0.088, Z=0.255) arcing gracefully outside R=0.255m up to crown halo!
            if t < 0.25:
                u = t / 0.25
                x = side * lerp(0.088, 0.228, smoothstep(0.0, 1.0, u))
                z = lerp(0.255, 0.395, u)
                y = -0.015 * math.sin(u * math.pi)
            else:
                u = (t - 0.25) / 0.75
                ang = lerp(math.radians(-60.0), math.radians(52.0), u)
                r_arc = 0.268 - 0.012 * u
                x = side * (math.cos(ang) * r_arc + 0.015 * (1.0 - u))
                z = TROPHY_CROWN_Z + math.sin(ang) * (r_arc * 0.94)
                y = 0.020 * math.sin(u * math.pi)
            b_pts.append(Vector((x, y, z)))

        add_swept_profile(
            bm_stem, b_pts, branch_cs, mat_idx=M_GOLD, closed_path=False, cap_ends=True,
            up_hint=Vector((0, 1, 0)),
            scale_fn=lambda u: 1.15 * (1.0 - 0.55 * u),
        )

        # 9 Paired Sculpted 3D Golden Victory Laurel Leaves cascading cleanly along each sweeping wreath branch!
        for l_idx in range(9):
            t_l = 0.22 + (l_idx / 8.0) * 0.74
            p_idx = min(b_steps - 2, int(t_l * (b_steps - 1)))
            p_base = b_pts[p_idx]
            tang = (b_pts[p_idx + 1] - b_pts[max(0, p_idx - 1)]).normalized()
            radial_out = Vector((side * 0.85, 0.0, 0.25)).normalized()
            leaf_scale = 1.0 - 0.32 * (l_idx / 8.0)

            # Outer & Inner paired sculptural golden laurel leaves (front-angled gracefully toward viewer!)
            for pair_s, y_tilt in ((-1.0, -0.45), (1.0, 0.45)):
                leaf_dir = (tang * 0.68 + radial_out * (0.48 * pair_s) + Vector((0, y_tilt * 0.38, 0.12))).normalized()
                leaf_up = Vector((0, -1.0, 0.35)).normalized()
                add_sculpted_laurel_leaf(
                    bm_stem,
                    origin=p_base,
                    dir_vec=leaf_dir,
                    up_vec=leaf_up,
                    length=0.068 * leaf_scale,
                    width=0.024 * leaf_scale,
                    thickness=0.0065 * leaf_scale,
                    mat_idx=(M_GOLD24 if pair_s > 0 else M_GOLD),
                )

    obj_stem = finalize_mesh_obj("Trophy_Stem_Laurels", bm_stem, mats, collection, sharp_angle_deg=36.0, uv_scale=2.2)
    objects.append(obj_stem)

    # -----------------------------------------------------------------------
    # 3. Trophy_Crown_Ring (origin 0,0,0.585): Imperial 8-Spire 24K Gold & Sapphire-Obsidian Crown Diadem!
    # -----------------------------------------------------------------------
    bm_crown = bmesh.new()

    # Main chamfered 24K gold imperial circlet base (r = 0.148m, z_local = -0.088 .. -0.022m)
    circlet_gold = [
        (0.132, -0.086),
        (0.148, -0.086),
        (0.156, -0.078),
        (0.156, -0.032),
        (0.148, -0.022),
        (0.132, -0.022),
        (0.126, -0.032),
        (0.126, -0.078),
    ]
    add_lathe_profile(bm_crown, circlet_gold, segments=64, mat_idx=M_GOLD24, closed_profile=True)

    # Recessed glossy royal midnight-sapphire obsidian enamel band inset around the imperial crown circlet
    circlet_obs = [
        (0.153, -0.072),
        (0.159, -0.068),
        (0.159, -0.040),
        (0.153, -0.036),
    ]
    add_lathe_profile(bm_crown, circlet_obs, segments=64, mat_idx=M_OBSIDIAN, closed_profile=True)

    # 8 Sculpted Gothic/Art-Deco Crown Spires & Sweeping Pierced Filigree Arches!
    spire_cs = [(-0.0085, -0.0045), (0.0085, -0.0045), (0.0050, 0.0065), (-0.0050, 0.0065)]
    arch_cs = [(-0.0042, -0.0035), (0.0042, -0.0035), (0.0032, 0.0042), (-0.0032, 0.0042)]
    for k in range(8):
        a = (k / 8.0) * math.tau
        ca, sa = math.cos(a), math.sin(a)
        is_cardinal = (k % 2 == 0)
        spire_h = 0.125 if is_cardinal else 0.095
        r_tip = 0.162 if is_cardinal else 0.156

        # Curved outward-flaring sovereign crown spire blade
        s_pts = []
        for si in range(9):
            t = si / 8.0
            rr = lerp(0.148, r_tip, math.sin(t * math.pi * 0.65))
            zz = lerp(-0.028, spire_h, t)
            s_pts.append(Vector((ca * rr, sa * rr, zz)))
        add_swept_profile(
            bm_crown, s_pts, spire_cs, mat_idx=M_GOLD24, closed_path=False, cap_ends=True,
            up_hint=Vector((-sa, ca, 0.0)),
            scale_fn=lambda u: (1.20 * (1.0 - 0.68 * u), 1.05 * (1.0 - 0.45 * u)),
        )

        # Jeweled finial orb crowning each spire tip!
        tip_p = s_pts[-1]
        add_faceted_gem(bm_crown, tip_p, Vector((ca * 0.25, sa * 0.25, 0.96)).normalized(),
                        radius=(0.0105 if is_cardinal else 0.0082), height=0.010,
                        bezel_mat=M_GOLD24, gem_mat=(M_SAPPHIRE if is_cardinal else M_RUBY), facets=10)

        # Mounted crown jewel medallion centered on the sapphire-obsidian band directly under each spire!
        band_p = Vector((ca * 0.159, sa * 0.159, -0.054))
        band_n = Vector((ca, sa, 0.0))
        add_diamond_index(bm_crown, band_p, band_n, Vector((0, 0, 1)),
                          length=0.032, width=0.024, height=0.005, mat_idx=M_GOLD24)
        add_faceted_gem(bm_crown, band_p + band_n * 0.0035, band_n,
                        radius=0.0078, height=0.0062, bezel_mat=M_GOLD24,
                        gem_mat=(M_RUBY if is_cardinal else M_SAPPHIRE), facets=10)

        # Sweeping pointed filigree gothic arch linking adjacent spires
        a_next = ((k + 1) / 8.0) * math.tau
        arch_pts = []
        for ai in range(9):
            u = ai / 8.0
            aa = lerp(a, a_next, u)
            zz = 0.018 + 0.048 * (math.sin(u * math.pi) ** 0.7)
            rr = 0.151 + 0.008 * math.sin(u * math.pi)
            arch_pts.append(Vector((math.cos(aa) * rr, math.sin(aa) * rr, zz)))
        add_swept_profile(bm_crown, arch_pts, arch_cs, mat_idx=M_GOLD, closed_path=False, cap_ends=True,
                          up_hint=Vector((0, 0, 1)))

        # Upper sovereign crown imperial rib arching inward from cardinal spires toward zenith finial!
        if is_cardinal:
            rib_pts = []
            for ri in range(11):
                u = ri / 10.0
                rr = lerp(r_tip * 0.94, 0.022, smoothstep(0.0, 1.0, u))
                zz = lerp(spire_h * 0.88, 0.215, math.sin(u * math.pi * 0.5))
                rib_pts.append(Vector((ca * rr, sa * rr, zz)))
            add_swept_profile(bm_crown, rib_pts, arch_cs, mat_idx=M_GOLD24, closed_path=False, cap_ends=True,
                              up_hint=Vector((-sa, ca, 0.0)), scale_fn=lambda u: 1.0 - 0.35 * u)

    # Crown zenith imperial cap ring where the 4 imperial arches converge (z_local = +0.215m)
    add_lathe_profile(
        bm_crown, [(0.016, 0.205), (0.032, 0.212), (0.028, 0.226), (0.014, 0.232)],
        segments=32, mat_idx=M_GOLD24, closed_profile=True
    )

    obj_crown = finalize_mesh_obj(
        "Trophy_Crown_Ring", bm_crown, mats, collection,
        location=(0.0, 0.0, TROPHY_CROWN_Z), sharp_angle_deg=35.0, uv_scale=2.4
    )
    objects.append(obj_crown)

    # -----------------------------------------------------------------------
    # 4 & 5. Trophy_Astrolabe_Ring_Outer & Trophy_Astrolabe_Ring_Inner (origin 0,0,0.585)
    # -----------------------------------------------------------------------
    def build_trophy_ring(name, radius, bw, th, main_mat, jewel_mat, rot_euler, ticks=24):
        bm = bmesh.new()
        segs = 72
        pts = [
            Vector((math.cos(i / segs * math.tau) * radius, 0.0, math.sin(i / segs * math.tau) * radius))
            for i in range(segs)
        ]
        hw, ht = bw * 0.5, th * 0.5
        cs = [
            (-ht * 0.65, -hw), (ht * 0.65, -hw), (ht, -hw * 0.55), (ht, hw * 0.55),
            (ht * 0.65, hw), (-ht * 0.65, hw), (-ht, hw * 0.55), (-ht, -hw * 0.55),
        ]
        add_swept_profile(bm, pts, cs, mat_idx=main_mat, closed_path=True, up_hint=Vector((0, 1, 0)))

        # Crisp golden micro-graduation ticks around inner rim
        for k in range(ticks):
            a = (k / ticks) * math.tau
            ca, sa = math.cos(a), math.sin(a)
            pos = Vector((ca * (radius - ht * 0.72), 0.0, sa * (radius - ht * 0.72)))
            add_diamond_index(bm, pos, Vector((-ca, 0, -sa)), Vector((-sa, 0, ca)),
                              length=0.0055, width=hw * 0.9, height=0.0042, mat_idx=M_GOLD24)

        # 4 Cardinal diamond indices + mounted ruby/sapphire bearings
        for c_i in range(4):
            a = c_i * (math.pi * 0.5)
            ca, sa = math.cos(a), math.sin(a)
            rad = Vector((ca, 0.0, sa))
            tan = Vector((-sa, 0.0, ca))
            add_diamond_index(bm, rad * (radius + ht * 0.7), rad, tan,
                              length=0.028, width=bw * 1.3, height=0.0075, mat_idx=M_GOLD24)
            jm = jewel_mat if (c_i % 2 == 0) else (M_RUBY if jewel_mat == M_SAPPHIRE else M_SAPPHIRE)
            for sgn in (-1.0, 1.0):
                add_faceted_gem(bm, rad * radius + Vector((0, sgn * hw * 0.9, 0)), Vector((0, sgn, 0)),
                                radius=0.006, height=0.0048, bezel_mat=M_GOLD24, gem_mat=jm, facets=10)

        return finalize_mesh_obj(
            name, bm, mats, collection,
            location=(0.0, 0.0, TROPHY_CROWN_Z), rotation_euler=rot_euler,
            sharp_angle_deg=36.0, uv_scale=2.4
        )

    obj_t_outer = build_trophy_ring(
        "Trophy_Astrolabe_Ring_Outer", 0.228, 0.017, 0.010, M_GOLD, M_SAPPHIRE,
        (math.radians(18.0), math.radians(-14.0), math.radians(24.0)), ticks=24
    )
    obj_t_inner = build_trophy_ring(
        "Trophy_Astrolabe_Ring_Inner", 0.196, 0.014, 0.0085, M_ROSE, M_RUBY,
        (math.radians(-26.0), math.radians(22.0), math.radians(-18.0)), ticks=18
    )
    objects.extend([obj_t_outer, obj_t_inner])

    # -----------------------------------------------------------------------
    # 6. Trophy_Star_Core (origin 0,0,0.585): Luminous Diamond Heart + 8-Point Meridian Star + Zenith Finial!
    # -----------------------------------------------------------------------
    bm_star = bmesh.new()

    # Brilliant-cut star-faceted champagne-diamond crystal center (r ~ 0.072m)
    ico_ret = bmesh.ops.create_icosphere(bm_star, subdivisions=1, radius=0.062)
    ico_faces = list({f for v in ico_ret["verts"] for f in v.link_faces})
    poke_ret = bmesh.ops.poke(bm_star, faces=ico_faces)
    for pv in poke_ret["verts"]:
        pv.co = pv.co.normalized() * 0.074
    for f in bm_star.faces:
        f.material_index = M_CRYSTAL
        f.smooth = False

    # Sculpted 8-Point 3D Sovereign Meridian Compass Star embracing the diamond heart (facing front & back!)
    for k in range(8):
        a = (k / 8.0) * math.tau
        is_card = (k % 2 == 0)
        # Keep bottom downward ray crisp above the chalice levitation dish (k==4 points straight down)
        ray_len = (0.096 if k == 4 else 0.132) if is_card else 0.098
        ray_w = 0.018 if is_card else 0.012
        ray_d = 0.015 if is_card else 0.011
        sa, ca = math.sin(a), math.cos(a)
        # Build crisp 4-sided faceted gold star spike radiating from origin in XZ plane
        dir_v = Vector((sa, 0.0, ca))
        perp_v = Vector((ca, 0.0, -sa))
        base_c = dir_v * 0.042
        tip_v = bm_star.verts.new(dir_v * ray_len)
        b_ring = [
            bm_star.verts.new(base_c - perp_v * ray_w),
            bm_star.verts.new(base_c + Vector((0, -ray_d, 0))),
            bm_star.verts.new(base_c + perp_v * ray_w),
            bm_star.verts.new(base_c + Vector((0, ray_d, 0))),
        ]
        r_mat = M_GOLD24 if is_card else M_ROSE
        for j in range(4):
            jn = (j + 1) % 4
            f = bm_star.faces.new((b_ring[j], b_ring[jn], tip_v))
            f.material_index = r_mat
            f.smooth = False

    # Crowning Sovereign Zenith Diamond Finial Spire rising atop the crown arches (z_local = 0.228..0.335m -> world 0.920m!)
    fin_m = Matrix.Translation((0.0, 0.0, 0.228))
    fin_prof = [
        (0.018, 0.000),
        (0.022, 0.010),
        (0.012, 0.020),
        (0.016, 0.032),
        (0.008, 0.048),
        (0.010, 0.060),
        (0.004, 0.082),
        (0.001, 0.105),
    ]
    add_lathe_profile(bm_star, fin_prof, segments=24, mat_idx=M_GOLD24, cap_top=True, matrix=fin_m)
    # Mounted miniature glowing diamond orb inside the zenith finial
    add_faceted_gem(bm_star, Vector((0.0, -0.014, 0.260)), Vector((0, -1, 0)),
                    radius=0.0085, height=0.007, bezel_mat=M_GOLD24, gem_mat=M_SAPPHIRE, facets=10)
    add_faceted_gem(bm_star, Vector((0.0, 0.014, 0.260)), Vector((0, 1, 0)),
                    radius=0.0085, height=0.007, bezel_mat=M_GOLD24, gem_mat=M_SAPPHIRE, facets=10)

    obj_star = finalize_mesh_obj(
        "Trophy_Star_Core", bm_star, mats, collection,
        location=(0.0, 0.0, TROPHY_CROWN_Z), sharp_angle_deg=32.0, uv_scale=3.0,
        keep_flat_mats={M_CRYSTAL},
    )
    objects.append(obj_star)

    return objects, {
        "plinth": obj_plinth,
        "stem": obj_stem,
        "crown": obj_crown,
        "ring_outer": obj_t_outer,
        "ring_inner": obj_t_inner,
        "star": obj_star,
    }


# ===========================================================================
# ASSET B: UPGRADED MOVIE-CGI VERITAS ASTROLABE ORB (veritas_astrolabe_orb.glb)
#   Preserves ALL 15 exact node names, pivots (0, 0.44, 0), and min_y=0.000m
#   while upgrading satin 22K gold, royal sapphire-obsidian petals, jewels & clean JPEGs!
# ===========================================================================
ORB_CENTER_Z = 0.44


def build_upgraded_veritas_orb_objects(mats, collection):
    objects = []

    # 1. Orb_Base (origin 0,0,0 — flush Z >= 0.0)
    bm_base = bmesh.new()
    marble_prof = [
        (0.010, 0.000), (0.272, 0.000), (0.280, 0.006), (0.280, 0.022),
        (0.268, 0.030), (0.258, 0.034), (0.256, 0.056), (0.242, 0.068),
        (0.228, 0.078), (0.208, 0.080), (0.192, 0.076), (0.165, 0.064),
        (0.130, 0.054), (0.082, 0.049), (0.008, 0.048),
    ]
    add_lathe_profile(bm_base, marble_prof, segments=80, mat_idx=M_MARBLE, cap_bottom=True, cap_top=True)

    add_lathe_profile(bm_base, [(0.278, 0.004), (0.284, 0.008), (0.284, 0.020), (0.276, 0.024)],
                      segments=80, mat_idx=M_BRASS, closed_profile=True)
    add_lathe_profile(bm_base, [(0.255, 0.034), (0.263, 0.038), (0.263, 0.052), (0.254, 0.056)],
                      segments=80, mat_idx=M_GOLD, closed_profile=True, flute_count=40, flute_depth=0.0022)
    add_lathe_profile(bm_base, [(0.204, 0.076), (0.214, 0.082), (0.224, 0.081), (0.229, 0.075), (0.214, 0.072)],
                      segments=80, mat_idx=M_GOLD24, closed_profile=True)
    add_lathe_profile(bm_base, [(0.194, 0.075), (0.168, 0.065), (0.134, 0.055), (0.085, 0.050), (0.006, 0.049)],
                      segments=64, mat_idx=M_OBSIDIAN, cap_top=True)
    add_lathe_profile(bm_base, [(0.125, 0.053), (0.146, 0.058), (0.144, 0.063), (0.127, 0.058)],
                      segments=64, mat_idx=M_BRASS, closed_profile=True)
    add_lathe_profile(bm_base, [(0.131, 0.056), (0.140, 0.059), (0.139, 0.062), (0.132, 0.059)],
                      segments=64, mat_idx=M_LEV_GLOW, closed_profile=True)
    add_lathe_profile(bm_base, [(0.072, 0.049), (0.080, 0.050), (0.079, 0.053), (0.073, 0.052)],
                      segments=56, mat_idx=M_GOLD24, closed_profile=True)
    add_faceted_gem(bm_base, Vector((0, 0, 0.049)), Vector((0, 0, 1)),
                    radius=0.025, height=0.016, bezel_mat=M_GOLD24, gem_mat=M_SAPPHIRE, facets=14)

    for i in range(12):
        ang = (i / 12.0) * math.tau
        pos = Vector((math.cos(ang) * 0.236, math.sin(ang) * 0.236, 0.072))
        nrm = Vector((math.cos(ang) * 0.38, math.sin(ang) * 0.38, 0.92)).normalized()
        add_diamond_index(bm_base, pos, nrm, Vector((math.cos(ang), math.sin(ang), 0.0)),
                          length=0.015, width=0.006, height=0.0035, mat_idx=M_GOLD24)

    scroll_profile = [
        (-0.0085, -0.0045), (0.0085, -0.0045), (0.0110, 0.0000),
        (0.0075, 0.0055), (0.0000, 0.0075), (-0.0075, 0.0055), (-0.0110, 0.0000),
    ]
    for arm_idx in range(3):
        ang = math.radians(90.0 + arm_idx * 120.0)
        ca, sa = math.cos(ang), math.sin(ang)
        pts_rz = []
        steps = 24
        for k in range(steps):
            t = k / (steps - 1)
            if t < 0.28:
                u = t / 0.28
                r = lerp(0.290, 0.270, smoothstep(0.0, 1.0, u))
                z = lerp(0.011, 0.050, u * u * (2.0 - u))
            else:
                u = (t - 0.28) / 0.72
                r = 0.270 + 0.062 * math.sin(u * math.pi * 0.85) - 0.018 * (u ** 3)
                z = 0.050 + 0.142 * smoothstep(0.0, 1.0, u) + 0.012 * math.sin(u * math.pi * 2.0)
            pts_rz.append((r, z))
        path_3d = [Vector((ca * r, sa * r, z)) for (r, z) in pts_rz]
        add_swept_profile(
            bm_base, path_3d, scroll_profile, mat_idx=M_GOLD, closed_path=False, cap_ends=True,
            up_hint=Vector((-sa, ca, 0.0)),
            scale_fn=lambda u: (1.20 * (1.0 - 0.44 * u) + 0.18 * math.sin(u * math.pi), 1.05 * (1.0 - 0.34 * u)),
        )
        foot_m = Matrix.Translation((ca * 0.290, sa * 0.290, 0.0))
        add_lathe_profile(bm_base, [(0.002, 0.0), (0.022, 0.0), (0.024, 0.004), (0.019, 0.011), (0.008, 0.015)],
                          segments=20, mat_idx=M_BRASS, cap_bottom=True, cap_top=True, matrix=foot_m)
        add_faceted_gem(bm_base, path_3d[-1], Vector((-ca * 0.72, -sa * 0.72, 0.69)).normalized(),
                        radius=0.011, height=0.009, bezel_mat=M_GOLD24, gem_mat=M_RUBY, facets=10)
        brace_pts = [
            Vector((ca * lerp(0.228, 0.305, bk / 9.0), sa * lerp(0.228, 0.305, bk / 9.0),
                    lerp(0.072, 0.104, (bk / 9.0) ** 2) - 0.012 * math.sin((bk / 9.0) * math.pi)))
            for bk in range(10)
        ]
        add_swept_profile(bm_base, brace_pts, [(-0.0048, -0.0032), (0.0048, -0.0032), (0.0036, 0.0042), (-0.0036, 0.0042)],
                          mat_idx=M_BRASS, closed_path=False, cap_ends=True, up_hint=Vector((-sa, ca, 0.0)),
                          scale_fn=lambda u: 1.0 - 0.35 * u)

    for v in bm_base.verts:
        if v.co.z < 0.0:
            v.co.z = 0.0

    obj_base = finalize_mesh_obj("Orb_Base", bm_base, mats, collection, sharp_angle_deg=36.0, uv_scale=1.8)
    objects.append(obj_base)

    # 2. Ring_Outer, Ring_Mid, Ring_Inner (96-segment luxury nested armillary rings!)
    def build_armillary_ring(name, radius, band_width, thickness, main_mat, accent_mat, jewel_mat,
                             rot_euler, openwork_twin=False, tick_count=36, has_zenith_finial=False,
                             inward_pointers=False):
        bm = bmesh.new()
        segs = 96
        ring_pts = [
            Vector((math.cos(i / segs * math.tau) * radius, 0.0, math.sin(i / segs * math.tau) * radius))
            for i in range(segs)
        ]
        hw, ht = band_width * 0.5, thickness * 0.5

        if not openwork_twin:
            cs = [
                (-ht * 0.65, -hw), (ht * 0.65, -hw), (ht, -hw * 0.62), (ht, hw * 0.62),
                (ht * 0.65, hw), (-ht * 0.65, hw), (-ht, hw * 0.62), (-ht, -hw * 0.62),
            ]
            add_swept_profile(bm, ring_pts, cs, mat_idx=main_mat, closed_path=True, up_hint=Vector((0, 1, 0)))
            ch_pts = [
                Vector((math.cos(i / segs * math.tau) * (radius + ht * 0.88), 0.0,
                        math.sin(i / segs * math.tau) * (radius + ht * 0.88)))
                for i in range(segs)
            ]
            add_swept_profile(bm, ch_pts, [(-0.0018, -hw * 0.28), (0.0018, -hw * 0.28), (0.0018, hw * 0.28), (-0.0018, hw * 0.28)],
                              mat_idx=accent_mat, closed_path=True, up_hint=Vector((0, 1, 0)))
        else:
            rail_off = hw * 0.68
            rw = hw * 0.34
            rail_cs = [
                (-ht * 0.6, -rw), (ht * 0.6, -rw), (ht, -rw * 0.5), (ht, rw * 0.5),
                (ht * 0.6, rw), (-ht * 0.6, rw), (-ht, rw * 0.5), (-ht, -rw * 0.5),
            ]
            for side in (-1.0, 1.0):
                r_pts = [
                    Vector((math.cos(i / segs * math.tau) * radius, side * rail_off,
                            math.sin(i / segs * math.tau) * radius))
                    for i in range(segs)
                ]
                add_swept_profile(bm, r_pts, rail_cs, mat_idx=main_mat, closed_path=True, up_hint=Vector((0, 1, 0)))
            for k in range(24):
                a = (k / 24.0) * math.tau
                strut_m = Matrix.Translation((math.cos(a) * radius, 0.0, math.sin(a) * radius)) @ Matrix.Rotation(-a, 4, "Y")
                add_chamfered_box(bm, ht * 1.15, rail_off * 2.0, 0.0055, bevel=0.0012,
                                  mat_idx=accent_mat, matrix=strut_m, segments=1)

        for k in range(tick_count):
            a = (k / tick_count) * math.tau
            ca, sa = math.cos(a), math.sin(a)
            is_major = (k % 3 == 0)
            pos = Vector((ca * (radius - ht * 0.72), 0.0, sa * (radius - ht * 0.72)))
            add_diamond_index(bm, pos, Vector((-ca, 0, -sa)), Vector((-sa, 0, ca)),
                              length=(0.0062 if is_major else 0.0038), width=hw * 0.95,
                              height=(0.0055 if is_major else 0.0032), mat_idx=M_GOLD24)

        for c_i in range(4):
            a = c_i * (math.pi * 0.5)
            ca, sa = math.cos(a), math.sin(a)
            rad_out = Vector((ca, 0.0, sa))
            tan = Vector((-sa, 0.0, ca))
            add_diamond_index(bm, rad_out * (radius + ht * 0.75), rad_out, tan,
                              length=0.036, width=band_width * 1.35, height=0.009, mat_idx=M_GOLD24)
            j_mat = jewel_mat if (c_i % 2 == 0) else (M_RUBY if jewel_mat == M_SAPPHIRE else M_SAPPHIRE)
            for sgn in (-1.0, 1.0):
                add_faceted_gem(bm, rad_out * radius + Vector((0, sgn * hw * 0.92, 0)), Vector((0, sgn, 0)),
                                radius=0.0074, height=0.0058, bezel_mat=M_GOLD24, gem_mat=j_mat, facets=10)
            if c_i in (0, 2):
                pin_m = Matrix.Translation(rad_out * (radius - ht - 0.012)) @ Matrix.Rotation(
                    math.pi * 0.5 if c_i == 0 else -math.pi * 0.5, 4, "Y"
                )
                add_lathe_profile(bm, [(0.0065, -0.012), (0.0075, -0.006), (0.0042, 0.0), (0.0038, 0.014), (0.0018, 0.018)],
                                  segments=16, mat_idx=M_BRASS, cap_top=True, matrix=pin_m)
            if inward_pointers:
                add_diamond_index(bm, rad_out * (radius - ht * 0.85), -rad_out, tan,
                                  length=0.014, width=0.008, height=0.016, mat_idx=M_GOLD24)

        if has_zenith_finial:
            fin_m = Matrix.Translation((0.0, 0.0, radius + ht))
            fin_prof = [
                (0.016, 0.000), (0.018, 0.006), (0.011, 0.012), (0.013, 0.018),
                (0.007, 0.026), (0.009, 0.032), (0.0045, 0.044), (0.0012, 0.064),
            ]
            add_lathe_profile(bm, fin_prof, segments=24, mat_idx=M_GOLD24, cap_top=True, matrix=fin_m)
            add_faceted_gem(bm, Vector((0, 0, radius + ht + 0.018)), Vector((0, -1, 0)),
                            radius=0.0062, height=0.0045, bezel_mat=M_GOLD24, gem_mat=M_SAPPHIRE, facets=10)

        return finalize_mesh_obj(
            name, bm, mats, collection,
            location=(0.0, 0.0, ORB_CENTER_Z), rotation_euler=rot_euler,
            sharp_angle_deg=36.0, uv_scale=2.2,
        )

    ring_outer = build_armillary_ring(
        "Ring_Outer", 0.365, 0.021, 0.013, M_GOLD, M_GUNMETAL, M_SAPPHIRE,
        (0.0, 0.0, math.radians(14.0)), openwork_twin=False, tick_count=36, has_zenith_finial=True
    )
    ring_mid = build_armillary_ring(
        "Ring_Mid", 0.320, 0.019, 0.0115, M_BRASS, M_GOLD24, M_RUBY,
        (math.radians(26.0), math.radians(-18.0), math.radians(38.0)), openwork_twin=True, tick_count=24
    )
    ring_inner = build_armillary_ring(
        "Ring_Inner", 0.276, 0.0155, 0.010, M_ROSE, M_GUNMETAL, M_SAPPHIRE,
        (math.radians(-30.0), math.radians(26.0), math.radians(-24.0)), openwork_twin=False,
        tick_count=24, inward_pointers=True
    )
    objects.extend([ring_outer, ring_mid, ring_inner])

    # 3. Petal_0 .. Petal_5: 6 Glossy Midnight-Sapphire Obsidian & 24K Gold Filigree Faberge Petals!
    petals = []
    for p_idx in range(6):
        bm_p = bmesh.new()
        n_lat, n_lon = 20, 12
        phi_min, phi_max = math.radians(-52.0), math.radians(58.0)
        r_inner_base, r_outer_base = 0.191, 0.203

        def petal_half_angle(t_lat: float) -> float:
            env = math.sin(clamp(t_lat, 0.0, 1.0) * math.pi)
            teardrop = (env ** 0.82) * (1.06 - 0.18 * t_lat)
            return math.radians(2.0 + 22.8 * teardrop)

        outer_grid, inner_grid = [], []
        for i in range(n_lat):
            t_lat = i / (n_lat - 1)
            phi = lerp(phi_min, phi_max, t_lat)
            c_phi, s_phi = math.cos(phi), math.sin(phi)
            h_ang = petal_half_angle(t_lat)
            lat_swell = math.sin(t_lat * math.pi)
            o_row, i_row = [], []
            for j in range(n_lon):
                u = (j / (n_lon - 1)) * 2.0 - 1.0
                th = u * h_ang
                edge_taper = math.cos(u * math.pi * 0.5) ** 0.65
                r_out = r_outer_base + 0.0085 * lat_swell * edge_taper
                r_in = r_inner_base + 0.0025 * lat_swell * edge_taper
                dir_v = Vector((c_phi * math.sin(th), -c_phi * math.cos(th), s_phi))
                o_row.append(bm_p.verts.new(dir_v * r_out))
                i_row.append(bm_p.verts.new(dir_v * r_in))
            outer_grid.append(o_row)
            inner_grid.append(i_row)

        for i in range(n_lat - 1):
            for j in range(n_lon - 1):
                fo = bm_p.faces.new((outer_grid[i][j], outer_grid[i][j + 1], outer_grid[i + 1][j + 1], outer_grid[i + 1][j]))
                fo.material_index = M_OBSIDIAN
                fo.smooth = True
                fi = bm_p.faces.new((inner_grid[i][j], inner_grid[i + 1][j], inner_grid[i + 1][j + 1], inner_grid[i][j + 1]))
                fi.material_index = M_OBSIDIAN
                fi.smooth = True

        for i in range(n_lat - 1):
            fl = bm_p.faces.new((inner_grid[i][0], outer_grid[i][0], outer_grid[i + 1][0], inner_grid[i + 1][0]))
            fl.material_index = M_GOLD24
            fr = bm_p.faces.new((outer_grid[i][-1], inner_grid[i][-1], inner_grid[i + 1][-1], outer_grid[i + 1][-1]))
            fr.material_index = M_GOLD24
        for j in range(n_lon - 1):
            fb = bm_p.faces.new((inner_grid[0][j], inner_grid[0][j + 1], outer_grid[0][j + 1], outer_grid[0][j]))
            fb.material_index = M_GOLD24
            ft = bm_p.faces.new((outer_grid[-1][j], outer_grid[-1][j + 1], inner_grid[-1][j + 1], inner_grid[-1][j]))
            ft.material_index = M_GOLD24

        rim_pts = []
        r_mid = 0.5 * (r_inner_base + r_outer_base) + 0.0025
        for i in range(n_lat):
            t_lat = i / (n_lat - 1)
            phi = lerp(phi_min, phi_max, t_lat)
            ha = petal_half_angle(t_lat)
            rim_pts.append(Vector((math.cos(phi) * math.sin(ha), -math.cos(phi) * math.cos(ha), math.sin(phi))) * r_mid)
        for i in range(n_lat - 1, -1, -1):
            t_lat = i / (n_lat - 1)
            phi = lerp(phi_min, phi_max, t_lat)
            ha = -petal_half_angle(t_lat)
            rim_pts.append(Vector((math.cos(phi) * math.sin(ha), -math.cos(phi) * math.cos(ha), math.sin(phi))) * r_mid)
        rim_cs = [(0.0046, 0.0), (0.0032, 0.004), (-0.0032, 0.004), (-0.0052, 0.0), (-0.0032, -0.004), (0.0032, -0.004)]
        add_swept_profile(bm_p, rim_pts, rim_cs, mat_idx=M_GOLD24, closed_path=True, up_hint=Vector((0, -1, 0)))

        spine_pts = []
        for i in range(16):
            t_lat = 0.06 + (i / 15.0) * 0.88
            phi = lerp(phi_min, phi_max, t_lat)
            r_sp = r_outer_base + 0.0088 * math.sin(t_lat * math.pi) + 0.0020
            spine_pts.append(Vector((0.0, -math.cos(phi), math.sin(phi))) * r_sp)
        add_swept_profile(bm_p, spine_pts, [(-0.003, -0.002), (0.003, -0.002), (0.0018, 0.0032), (-0.0018, 0.0032)],
                          mat_idx=M_GOLD24, closed_path=False, cap_ends=True, up_hint=Vector((1, 0, 0)),
                          scale_fn=lambda u: 0.45 + 0.85 * math.sin(u * math.pi))

        waist_pos = Vector((0.0, -(r_outer_base + 0.0095), 0.0))
        add_diamond_index(bm_p, waist_pos, Vector((0, -1, 0)), Vector((0, 0, 1)),
                          length=0.044, width=0.026, height=0.006, mat_idx=M_GOLD24)
        add_faceted_gem(bm_p, waist_pos + Vector((0, -0.0038, 0)), Vector((0, -1, 0)),
                        radius=0.0088, height=0.0068, bezel_mat=M_GOLD24,
                        gem_mat=(M_SAPPHIRE if p_idx % 2 == 0 else M_RUBY), facets=10)

        top_dir = Vector((0.0, -math.cos(phi_max), math.sin(phi_max)))
        bot_dir = Vector((0.0, -math.cos(phi_min), math.sin(phi_min)))
        add_diamond_index(bm_p, top_dir * (r_outer_base + 0.002), top_dir, Vector((0, 0, 1)),
                          length=0.018, width=0.010, height=0.006, mat_idx=M_GOLD24)
        add_diamond_index(bm_p, bot_dir * (r_outer_base + 0.002), bot_dir, Vector((0, 0, 1)),
                          length=0.018, width=0.010, height=0.006, mat_idx=M_GOLD24)

        petal_obj = finalize_mesh_obj(
            f"Petal_{p_idx}", bm_p, mats, collection,
            location=(0.0, 0.0, ORB_CENTER_Z), rotation_euler=(0.0, 0.0, p_idx * (math.tau / 6.0)),
            sharp_angle_deg=38.0, uv_scale=2.2,
        )
        petals.append(petal_obj)
        objects.append(petal_obj)

    # 4. Caliper_0 .. Caliper_3
    calipers = []
    for c_idx in range(4):
        bm_c = bmesh.new()
        r_cal = 0.244
        steps = 24
        phi_lo, phi_hi = math.radians(-46.0), math.radians(46.0)
        blade_pts = []
        for k in range(steps):
            t = k / (steps - 1)
            phi = lerp(phi_lo, phi_hi, t)
            rr = r_cal - 0.014 * (1.0 - math.sin(t * math.pi))
            blade_pts.append(Vector((0.0, -math.cos(phi) * rr, math.sin(phi) * rr)))
        blade_cs = [
            (-0.0095, -0.002), (-0.0045, -0.0052), (0.0045, -0.0052),
            (0.0095, -0.002), (0.006, 0.0042), (0.0, 0.0062), (-0.006, 0.0042),
        ]
        add_swept_profile(
            bm_c, blade_pts, blade_cs, mat_idx=M_GOLD, closed_path=False, cap_ends=True,
            up_hint=Vector((1, 0, 0)),
            scale_fn=lambda u: (0.14 + 0.96 * (math.sin(clamp(u) * math.pi) ** 0.72),
                                0.22 + 0.85 * (math.sin(clamp(u) * math.pi) ** 0.65)),
        )
        spine_pts = []
        for k in range(16):
            t = 0.14 + (k / 15.0) * 0.72
            phi = lerp(phi_lo, phi_hi, t)
            arch = math.sin(t * math.pi)
            rr = r_cal - 0.014 * (1.0 - arch) + 0.0055 * (0.22 + 0.85 * (arch ** 0.65))
            spine_pts.append(Vector((0.0, -math.cos(phi) * rr, math.sin(phi) * rr)))
        add_swept_profile(bm_c, spine_pts, [(-0.0032, -0.0018), (0.0032, -0.0018), (0.0022, 0.0022), (-0.0022, 0.0022)],
                          mat_idx=M_GUNMETAL, closed_path=False, cap_ends=True, up_hint=Vector((1, 0, 0)),
                          scale_fn=lambda u: 0.4 + 0.75 * math.sin(u * math.pi))

        boss_pos = Vector((0.0, -(r_cal + 0.005), 0.0))
        boss_m = Matrix.Translation(boss_pos) @ Matrix.Rotation(math.pi * 0.5, 4, "X")
        add_lathe_profile(bm_c, [(0.0155, -0.004), (0.0165, 0.002), (0.0135, 0.007), (0.009, 0.008)],
                          segments=20, mat_idx=M_BRASS, cap_top=True, matrix=boss_m)
        add_faceted_gem(bm_c, boss_pos + Vector((0, -0.006, 0)), Vector((0, -1, 0)),
                        radius=0.0074, height=0.0058, bezel_mat=M_GOLD24, gem_mat=M_RUBY, facets=10)

        cal_obj = finalize_mesh_obj(
            f"Caliper_{c_idx}", bm_c, mats, collection,
            location=(0.0, 0.0, ORB_CENTER_Z), rotation_euler=(0.0, 0.0, (c_idx + 0.5) * (math.pi * 0.5)),
            sharp_angle_deg=34.0, uv_scale=2.4,
        )
        calipers.append(cal_obj)
        objects.append(cal_obj)

    # 5. Crystal_Core
    bm_core = bmesh.new()
    ico_ret = bmesh.ops.create_icosphere(bm_core, subdivisions=1, radius=0.098)
    ico_faces = list({f for v in ico_ret["verts"] for f in v.link_faces})
    poke_ret = bmesh.ops.poke(bm_core, faces=ico_faces)
    for pv in poke_ret["verts"]:
        pv.co = pv.co.normalized() * 0.112
    for f in bm_core.faces:
        f.material_index = M_CRYSTAL
        f.smooth = False

    r_cage = 0.132
    wire_cs = [
        (0.0036, 0.0), (0.0025, 0.0025), (0.0, 0.0036), (-0.0025, 0.0025),
        (-0.0036, 0.0), (-0.0025, -0.0025), (0.0, -0.0036), (0.0025, -0.0025),
    ]
    for m_i in range(3):
        az = m_i * (math.pi / 3.0)
        ca, sa = math.cos(az), math.sin(az)
        m_pts = [
            Vector((math.cos(k / 48.0 * math.tau) * ca * r_cage,
                    math.cos(k / 48.0 * math.tau) * sa * r_cage,
                    math.sin(k / 48.0 * math.tau) * r_cage))
            for k in range(48)
        ]
        add_swept_profile(bm_core, m_pts, wire_cs, mat_idx=M_GOLD24, closed_path=True, up_hint=Vector((-sa, ca, 0.0)))

    for lat_deg, scale_w in ((0.0, 1.05), (34.0, 0.78), (-34.0, 0.78)):
        lat = math.radians(lat_deg)
        rr, zz = math.cos(lat) * r_cage, math.sin(lat) * r_cage
        eq_pts = [Vector((math.cos(k / 48.0 * math.tau) * rr, math.sin(k / 48.0 * math.tau) * rr, zz)) for k in range(48)]
        add_swept_profile(bm_core, eq_pts, [(x * scale_w, y * scale_w) for (x, y) in wire_cs],
                          mat_idx=M_GOLD24, closed_path=True, up_hint=Vector((0, 0, 1)))

    for sign in (-1.0, 1.0):
        pol_m = Matrix.Translation((0.0, 0.0, sign * r_cage))
        if sign < 0:
            pol_m = pol_m @ Matrix.Rotation(math.pi, 4, "X")
        add_lathe_profile(bm_core, [(0.016, -0.004), (0.018, 0.003), (0.012, 0.010), (0.006, 0.018), (0.0015, 0.025)],
                          segments=20, mat_idx=M_GOLD24, cap_top=True, matrix=pol_m)

    obj_core = finalize_mesh_obj(
        "Crystal_Core", bm_core, mats, collection,
        location=(0.0, 0.0, ORB_CENTER_Z), sharp_angle_deg=36.0, uv_scale=3.0,
        keep_flat_mats={M_CRYSTAL},
    )
    objects.append(obj_core)

    return objects, {"petals": petals}


# ===========================================================================
# Export, Stats & Luxury Studio Beauty Render Setup
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
            min_pt.x, min_pt.y, min_pt.z = min(min_pt.x, wp.x), min(min_pt.y, wp.y), min(min_pt.z, wp.z)
            max_pt.x, max_pt.y, max_pt.z = max(max_pt.x, wp.x), max(max_pt.y, wp.y), max(max_pt.z, wp.z)
        ev.to_mesh_clear()

    dims_godot = {
        "width_x": round(max_pt.x - min_pt.x, 4),
        "height_y": round(max_pt.z - min_pt.z, 4),
        "depth_z": round(max_pt.y - min_pt.y, 4),
        "min_y_godot": round(min_pt.z, 4),
        "max_y_godot": round(max_pt.z, 4),
    }
    return stats, total_tris, dims_godot


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
    lo.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
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


def setup_luxury_studio(scene, studio_col, mats, cam_loc, target_pt, core_light_z, lens=62.0):
    world = bpy.data.worlds.new("Luxury_Jewelry_World")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()

    w_out = nodes.new("ShaderNodeOutputWorld")
    w_bg = nodes.new("ShaderNodeBackground")
    w_bg.inputs["Strength"].default_value = 0.95

    tc = nodes.new("ShaderNodeTexCoord")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    mr = nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -1.0
    mr.inputs["From Max"].default_value = 1.0

    ramp = nodes.new("ShaderNodeValToRGB")
    elts = ramp.color_ramp.elements
    elts[0].position = 0.0
    elts[0].color = hex_rgba("#040710")
    elts[1].position = 0.44
    elts[1].color = hex_rgba("#12203A")
    e2 = ramp.color_ramp.elements.new(0.62)
    e2.color = hex_rgba("#466EA8")
    e3 = ramp.color_ramp.elements.new(0.76)
    e3.color = hex_rgba("#F8DC9F")
    e4 = ramp.color_ramp.elements.new(0.92)
    e4.color = hex_rgba("#16233B")

    lp = nodes.new("ShaderNodeLightPath")
    bg_cam = nodes.new("ShaderNodeBackground")
    bg_cam.inputs["Color"].default_value = hex_rgba("#050914")
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

    # Dark Veined Nero Marquina Marble Table Surface flush at Z = 0.0
    bm_tab = bmesh.new()
    add_superellipse_extrusion(bm_tab, rx=1.45, ry=0.95, exp_n=2.6, z0=-0.04, z1=0.0,
                               segments=72, mat_idx=M_MARBLE, bevel_z=0.008, bevel_r=0.010)
    finalize_mesh_obj("Studio_Marble_Table", bm_tab, mats, studio_col, sharp_angle_deg=36.0, uv_scale=1.1)

    # Rembrandt Warm Key + Crisp Royal-Sapphire Rim + Top Gallery Spotlight + Internal Core Glow
    add_area_light("Studio_Key_Rembrandt", studio_col, loc=(1.42, -1.45, 1.38), target=target_pt,
                   energy=145.0, color_hex="#FFE3B4", size_x=1.15, size_y=1.15, spread_deg=80.0)
    add_area_light("Studio_Rim_Sapphire", studio_col, loc=(-1.48, 1.15, 1.25), target=target_pt,
                   energy=195.0, color_hex="#72B8FF", size_x=0.72, size_y=1.40, spread_deg=76.0)
    add_area_light("Studio_Fill_Warm", studio_col, loc=(-1.32, -1.18, 0.56), target=target_pt,
                   energy=38.0, color_hex="#F0CD90", size_x=1.0, size_y=1.0, spread_deg=105.0)
    add_area_light("Studio_Top_Gallery", studio_col, loc=(0.14, -0.24, 1.98), target=target_pt,
                   energy=54.0, color_hex="#FFF1D8", size_x=0.82, size_y=0.82, spread_deg=66.0)
    add_point_light("Studio_Core_Light", studio_col, loc=(0.0, 0.0, core_light_z),
                    energy=18.0, color_hex="#FFD268", radius=0.065)

    cam_d = bpy.data.cameras.new("Studio_Cam")
    cam_d.lens = lens
    cam_d.sensor_width = 36.0
    cam_d.clip_start = 0.02
    cam_d.clip_end = 50.0
    cam_d.dof.use_dof = True
    cam_d.dof.focus_distance = (Vector(target_pt) - Vector(cam_loc)).length
    cam_d.dof.aperture_fstop = 6.3
    cam_o = bpy.data.objects.new("Studio_Cam", cam_d)
    cam_o.location = cam_loc
    cam_o.rotation_euler = (Vector(target_pt) - Vector(cam_loc)).to_track_quat("-Z", "Y").to_euler()
    studio_col.objects.link(cam_o)
    scene.camera = cam_o

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
    scene.view_settings.exposure = 0.24
    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"


def main():
    t0 = time.time()
    log = [f"BLENDER_VERSION={bpy.app.version_string}"]

    # -----------------------------------------------------------------------
    # PHASE 1: CHAMPIONSHIP CROWN TROPHY (championship_trophy.glb <= 35k tris)
    # -----------------------------------------------------------------------
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    tr_col = bpy.data.collections.new("Championship_Trophy")
    tr_studio = bpy.data.collections.new("Trophy_Studio_Rig")
    scene.collection.children.link(tr_col)
    scene.collection.children.link(tr_studio)

    mats_tr = build_luxury_jewelry_materials()
    tr_objs, _tr_refs = build_championship_trophy_objects(mats_tr, tr_col)
    setup_luxury_studio(
        scene, tr_studio, mats_tr,
        cam_loc=(0.56, -1.88, 0.78), target_pt=(0.0, 0.0, 0.455),
        core_light_z=TROPHY_CROWN_Z, lens=60.0
    )

    bpy.ops.wm.save_as_mainfile(filepath=str(TROPHY_BLEND))
    export_selected_glb(tr_objs, TROPHY_GLB)
    tr_stats, tr_tris, tr_dims = collect_mesh_stats(tr_objs)

    log.append(f"TROPHY_BLEND_BYTES={TROPHY_BLEND.stat().st_size}")
    log.append(f"TROPHY_RAW_GLB_BYTES={TROPHY_GLB.stat().st_size}")
    log.append(f"TROPHY_TRIS={tr_tris}")
    log.append(f"TROPHY_DIMS={json.dumps(tr_dims)}")
    log.append(f"TROPHY_NODE_TRIS={json.dumps(tr_stats)}")

    scene.render.filepath = str(TROPHY_RENDER_PNG)
    t_r1 = time.time()
    bpy.ops.render.render(write_still=True)
    log.append(f"TROPHY_RENDER_SECS={time.time() - t_r1:.1f}")
    log.append(f"TROPHY_RENDER_BYTES={TROPHY_RENDER_PNG.stat().st_size if TROPHY_RENDER_PNG.exists() else 0}")

    # -----------------------------------------------------------------------
    # PHASE 2: UPGRADED MOVIE-CGI VERITAS ASTROLABE ORB (veritas_astrolabe_orb.glb)
    # -----------------------------------------------------------------------
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    orb_col = bpy.data.collections.new("Veritas_Astrolabe_Orb")
    orb_studio = bpy.data.collections.new("Orb_Studio_Rig")
    scene.collection.children.link(orb_col)
    scene.collection.children.link(orb_studio)

    mats_orb = build_luxury_jewelry_materials()
    orb_objs, orb_refs = build_upgraded_veritas_orb_objects(mats_orb, orb_col)
    setup_luxury_studio(
        scene, orb_studio, mats_orb,
        cam_loc=(0.72, -1.80, 0.76), target_pt=(0.0, 0.0, 0.430),
        core_light_z=ORB_CENTER_Z, lens=62.0
    )

    # Save pristine rest-pose .blend and export pristine rest-pose .glb!
    bpy.ops.wm.save_as_mainfile(filepath=str(ORB_BLEND))
    export_selected_glb(orb_objs, ORB_GLB)
    orb_stats, orb_tris, orb_dims = collect_mesh_stats(orb_objs)

    log.append(f"ORB_BLEND_BYTES={ORB_BLEND.stat().st_size}")
    log.append(f"ORB_RAW_GLB_BYTES={ORB_GLB.stat().st_size}")
    log.append(f"ORB_TRIS={orb_tris}")
    log.append(f"ORB_DIMS={json.dumps(orb_dims)}")
    log.append(f"ORB_NODE_TRIS={json.dumps(orb_stats)}")

    # Gently bloom petals 12° ONLY for the studio beauty shot so the glowing crystal heart & sapphire petals shine!
    for p_obj in orb_refs["petals"]:
        p_obj.rotation_euler = Euler((math.radians(12.0), 0.0, p_obj.rotation_euler.z), "XYZ")
    scene.render.filepath = str(ORB_RENDER_PNG)
    t_r2 = time.time()
    bpy.ops.render.render(write_still=True)
    log.append(f"ORB_RENDER_SECS={time.time() - t_r2:.1f}")
    log.append(f"ORB_RENDER_BYTES={ORB_RENDER_PNG.stat().st_size if ORB_RENDER_PNG.exists() else 0}")
    log.append(f"TOTAL_SECS={time.time() - t0:.1f}")
    log.append("STATUS=SUCCESS")

    LOG_FILE.write_text("\n".join(log) + "\n", encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        LOG_FILE.write_text("STATUS=ERROR\n" + traceback.format_exc(), encoding="utf-8")
        raise
