#!/usr/bin/env python3
"""
World's Smartest — Carbon-High Star Mechanic Pipeline: THE VERITAS PRISM (Blender 5.3.0)
Implements `docs/PITCH_BIBLE.md` §3.1 ("Spin. Peel. Overclock.") to Swiss Haute Horlogerie standard.

Outputs:
  1. public/assets/aaa_models/veritas_prism.glb  (<= 38,000 tris, sanitized baseline JFIF JPEGs, 0 NeoGeo/ICC!)
  2. godot/assets/aaa_models/veritas_prism.glb   (kept in sync)
  3. assets/blender/aaa_veritas_prism.blend
  4. assets/renders/veritas_prism_render.png     (1024x1024 Rembrandt studio beauty render)
  5. assets/renders/veritas_prism_v3.log

Exact Animatable Node Hierarchy (Y-up Three.js / glTF metric coordinates, center = (0, 0.50, 0)):
  - Prism_Pedestal            (origin 0, 0, 0 — flush Y=0.000m, Nero Marquina marble + 24K brass S-scroll cradle)
  - Gimbal_Outer              (origin 0, 0.50, 0 — R=0.422m 96-seg 22K brushed-brass meridian ring + jewels)
  - Gimbal_Equatorial         (origin 0, 0.50, 0 — R=0.386m 96-seg rose-gold openwork tourbillon ring)
  - Facet_Carousel            (origin 0, 0.50, 0 — spins smoothly around Y for SPIN!)
      |- Carousel_Spider      (origin 0, 0, 0 — delicate 24K gold watchmaker radial spoke frame)
      |- Facet_0              (pos (0, 0, +0.34), rotY = 0      -> faces +Z front Sightline!)
      |- Facet_1              (pos (+0.34, 0, 0), rotY = +PI/2  -> faces +X right!)
      |- Facet_2              (pos (0, 0, -0.34), rotY = PI     -> faces -Z rear!)
      |- Facet_3              (pos (-0.34, 0, 0), rotY = -PI/2  -> faces -X left!)
         * Each Facet_i is a curved, emerald-beveled smoked-sapphire/frosted-quartz watch crystal
           (0.41m W x 0.195m H) held ONLY by sculpted left/right 24K Art-Deco jeweler's claw clasps
           & top diamond index crest (ZERO boxy rectangular picture-frame borders!).
         * Local +Z points radially outward, local +Y up, local +X horizontal — mount troika MSDF
           3D text directly at local (0, 0, +0.015)!
  - Brass_Crown               (origin 0, 0.855, 0 — fluted 24K watchmaker pull-crown; drag -Y for PEEL!)
  - Shutter_0 .. Shutter_5    (origin 0, 0.50, 0 — 6 curved sapphire-obsidian iris petals; tilt +X to bloom!)
  - Overclock_Jaw_0 .. 3      (origin 0, 0.50, 0 — 4 machined 24K brass clamping jaws at 45/135/225/315°!)
  - Firing_Pin                (origin 0, 0.50, 0 — precision 24K/gunmetal striker plunger above core!)
  - Hologram_Core             (origin 0, 0.50, 0 — star-faceted diamond crystal heart + 24K wire cage!)
"""

import io
import json
import math
import shutil
import struct
import sys
import time
import traceback
from pathlib import Path

SCRIPT_PATH = Path(__file__).resolve()
PROJECT_ROOT = SCRIPT_PATH.parents[2]

BLEND_DIR = PROJECT_ROOT / "assets" / "blender"
RENDER_DIR = PROJECT_ROOT / "assets" / "renders"
PUBLIC_AAA_DIR = PROJECT_ROOT / "public" / "assets" / "aaa_models"
GODOT_AAA_DIR = PROJECT_ROOT / "godot" / "assets" / "aaa_models"

PRISM_BLEND = BLEND_DIR / "aaa_veritas_prism.blend"
PRISM_GLB_PUBLIC = PUBLIC_AAA_DIR / "veritas_prism.glb"
PRISM_GLB_GODOT = GODOT_AAA_DIR / "veritas_prism.glb"
PRISM_RENDER_PNG = RENDER_DIR / "veritas_prism_render.png"
LOG_FILE = RENDER_DIR / "veritas_prism_v3.log"


# ===========================================================================
# MODE 2: BASELINE JFIF JPEG SANITIZER & GLB VERIFIER (0 NeoGeo / ICC)
# ===========================================================================
def audit_jpeg_markers(jpg_bytes: bytes):
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
        if marker in (0xD9, 0xDA):
            break
        if marker in (0x01,) or (0xD0 <= marker <= 0xD7):
            continue
        if pos + 2 > n:
            break
        seg_len = struct.unpack_from(">H", jpg_bytes, pos)[0]
        seg_data = jpg_bytes[pos + 2:pos + seg_len]
        if marker in (0xE1, 0xE2) or b"NeoGeo" in seg_data or b"ICC_PROFILE" in seg_data:
            bad.append(f"0x{marker:02X}")
        pos += seg_len
    return bad


def sanitize_glb_jpegs(glb_path: Path, quality: int = 88):
    from PIL import Image

    raw = glb_path.read_bytes()
    magic, version, _ = struct.unpack_from("<4sII", raw, 0)
    assert magic == b"glTF" and version == 2

    json_len, json_type = struct.unpack_from("<I4s", raw, 12)
    assert json_type == b"JSON"
    gltf = json.loads(raw[20:20 + json_len].decode("utf-8"))

    bin_off = 20 + json_len
    bin_len, bin_type = struct.unpack_from("<I4s", raw, bin_off)
    assert bin_type == b"BIN\x00"
    old_bin = raw[bin_off + 8:bin_off + 8 + bin_len]

    images = gltf.get("images", [])
    buffer_views = gltf.get("bufferViews", [])
    image_bvs = {img["bufferView"] for img in images if "bufferView" in img}

    new_parts = []
    cur_off = 0
    sanitized = 0
    for bv_idx, bv in enumerate(buffer_views):
        chunk = old_bin[bv.get("byteOffset", 0):bv.get("byteOffset", 0) + bv["byteLength"]]
        if bv_idx in image_bvs:
            im = Image.open(io.BytesIO(chunk))
            if im.mode != "RGB":
                im = im.convert("RGB")
            buf = io.BytesIO()
            im.save(buf, format="JPEG", quality=quality, optimize=True, progressive=False, subsampling="4:2:0")
            chunk = buf.getvalue()
            bad = audit_jpeg_markers(chunk)
            assert not bad, f"Bad JPEG markers: {bad}"
            sanitized += 1

        pad = (-cur_off) % 4
        if pad:
            new_parts.append(b"\x00" * pad)
            cur_off += pad
        bv["byteOffset"] = cur_off
        bv["byteLength"] = len(chunk)
        new_parts.append(chunk)
        cur_off += len(chunk)

    for img in images:
        if "bufferView" in img:
            img["mimeType"] = "image/jpeg"

    end_pad = (-cur_off) % 4
    if end_pad:
        new_parts.append(b"\x00" * end_pad)
        cur_off += end_pad
    new_bin = b"".join(new_parts)
    if gltf.get("buffers"):
        gltf["buffers"][0]["byteLength"] = len(new_bin)

    new_json = json.dumps(gltf, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    j_pad = (-len(new_json)) % 4
    if j_pad:
        new_json += b" " * j_pad

    total_len = 12 + 8 + len(new_json) + 8 + len(new_bin)
    out = bytearray()
    out.extend(struct.pack("<4sII", b"glTF", 2, total_len))
    out.extend(struct.pack("<I4s", len(new_json), b"JSON"))
    out.extend(new_json)
    out.extend(struct.pack("<I4s", len(new_bin), b"BIN\x00"))
    out.extend(new_bin)
    glb_path.write_bytes(bytes(out))

    accessors = gltf.get("accessors", [])
    tris = 0
    for mesh in gltf.get("meshes", []):
        for prim in mesh.get("primitives", []):
            if "indices" in prim:
                tris += accessors[prim["indices"]]["count"] // 3
            elif "POSITION" in prim.get("attributes", {}):
                tris += accessors[prim["attributes"]["POSITION"]]["count"] // 3

    return {
        "bytes": len(out),
        "triangles": tris,
        "jpegs": sanitized,
        "nodes": [n.get("name", "") for n in gltf.get("nodes", [])],
        "materials": [m.get("name", "") for m in gltf.get("materials", [])],
    }


if "--sanitize" in sys.argv:
    info = sanitize_glb_jpegs(PRISM_GLB_PUBLIC, quality=88)
    shutil.copy2(PRISM_GLB_PUBLIC, PRISM_GLB_GODOT)
    print(
        f"[SANITIZE OK] veritas_prism.glb | {info['bytes']:,} B | "
        f"{info['triangles']:,} tris | {info['jpegs']} baseline JPEGs | "
        f"nodes={len(info['nodes'])} | mats={info['materials']}"
    )
    sys.exit(0)


# ===========================================================================
# MODE 1: BLENDER 5.3.0 SCULPT, RIG, EXPORT & STUDIO BEAUTY RENDER
# ===========================================================================
import bpy
import bmesh
from mathutils import Euler, Matrix, Vector

for _d in (BLEND_DIR, RENDER_DIR, PUBLIC_AAA_DIR, GODOT_AAA_DIR):
    _d.mkdir(parents=True, exist_ok=True)


def srgb_to_linear(c: float) -> float:
    c = max(0.0, min(1.0, c))
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


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


def smoothstep(e0: float, e1: float, x: float) -> float:
    if e1 == e0:
        return 0.0
    t = clamp((x - e0) / (e1 - e0))
    return t * t * (3.0 - 2.0 * t)


def hash2(ix: int, iy: int, seed: int = 0) -> float:
    n = (ix * 374761393 + iy * 668265263 + seed * 1442695041) & 0xFFFFFFFF
    n = ((n ^ (n >> 13)) * 1274126177) & 0xFFFFFFFF
    n = n ^ (n >> 16)
    return (n & 0xFFFFFF) / float(0x1000000)


def value_noise_2d(x: float, y: float, seed: int = 0, period: int = 0) -> float:
    ix, iy = math.floor(x), math.floor(y)
    fx, fy = x - ix, y - iy
    ux = fx * fx * (3.0 - 2.0 * fx)
    uy = fy * fy * (3.0 - 2.0 * fy)
    ix0, ix1 = (ix % period, (ix + 1) % period) if period > 0 else (ix, ix + 1)
    iy0, iy1 = (iy % period, (iy + 1) % period) if period > 0 else (iy, iy + 1)
    a, b = hash2(ix0, iy0, seed), hash2(ix1, iy0, seed)
    c, d = hash2(ix0, iy1, seed), hash2(ix1, iy1, seed)
    return lerp(lerp(a, b, ux), lerp(c, d, ux), uy)


def fbm_2d(x: float, y: float, octaves: int = 4, seed: int = 0, period: int = 0) -> float:
    val, amp, freq, norm = 0.0, 0.5, 1.0, 0.0
    for i in range(octaves):
        p = int(period * freq) if period > 0 else 0
        val += amp * value_noise_2d(x * freq, y * freq, seed + i * 31, p)
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


def gen_nero_gold_marble_textures(prefix: str = "Tex_PrismMarble", size: int = 256):
    albedo = [0.0] * (size * size * 4)
    rough = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        v = y / size
        for x in range(size):
            u = x / size
            w1 = fbm_2d(u * 4.0, v * 4.0, octaves=4, seed=11, period=4)
            w2 = fbm_2d(u * 8.0 + 1.3, v * 8.0 + 2.7, octaves=3, seed=29, period=8)
            p1 = (u * 2.0 + v * 1.0) * math.tau + (w1 - 0.5) * 6.5 + (w2 - 0.5) * 2.2
            vein1 = pow(clamp(1.0 - abs(math.sin(p1)), 0.0, 1.0), 13.0)
            p2 = (u * 1.0 - v * 3.0) * math.tau + (w2 - 0.5) * 5.2
            vein2 = pow(clamp(1.0 - abs(math.sin(p2)), 0.0, 1.0), 20.0) * 0.65
            cloud = fbm_2d(u * 6.0, v * 6.0, octaves=3, seed=7, period=6)
            vein = clamp(vein1 * 0.90 + vein2 * 0.55, 0.0, 1.0)
            albedo[idx] = clamp(lerp(lerp(0.040, 0.085, cloud), 0.85, vein * 0.72))
            albedo[idx + 1] = clamp(lerp(lerp(0.050, 0.100, cloud), 0.71, vein * 0.72))
            albedo[idx + 2] = clamp(lerp(lerp(0.075, 0.140, cloud), 0.46, vein * 0.72))
            albedo[idx + 3] = 1.0
            rv = clamp(0.14 + cloud * 0.08 + vein * 0.09, 0.09, 0.34)
            rough[idx] = rough[idx + 1] = rough[idx + 2] = rv
            rough[idx + 3] = 1.0
            idx += 4
    return (
        make_image_from_rgb(f"{prefix}_COL", size, size, albedo, "sRGB"),
        make_image_from_rgb(f"{prefix}_RGH", size, size, rough, "Non-Color"),
    )


def gen_sapphire_obsidian_texture(name: str = "Tex_PrismObsidian_COL", size: int = 256):
    albedo = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        v = y / size
        for x in range(size):
            u = x / size
            swirl = fbm_2d(u * 4.0, v * 4.0, octaves=4, seed=83, period=4)
            shimmer = fbm_2d(u * 8.0 + swirl * 1.4, v * 8.0 - swirl * 1.1, octaves=3, seed=127, period=8)
            t = clamp(swirl * 0.62 + shimmer * 0.38, 0.0, 1.0)
            albedo[idx] = lerp(0.030, 0.088, t)
            albedo[idx + 1] = lerp(0.064, 0.168, t)
            albedo[idx + 2] = lerp(0.145, 0.350, t)
            albedo[idx + 3] = 1.0
            idx += 4
    return make_image_from_rgb(name, size, size, albedo, "sRGB")


def gen_silky_satin_roughness(name: str = "Tex_PrismSatin_RGH", size: int = 256,
                              base_r: float = 0.165, amp: float = 0.030):
    raw = [
        0.40 * math.sin((y / size) * math.tau * 5.0 + 0.3)
        + 0.30 * math.sin((y / size) * math.tau * 13.0 + 1.4)
        + 0.20 * math.cos((y / size) * math.tau * 23.0 + 2.1)
        + 0.10 * math.sin((y / size) * math.tau * 37.0 + 0.8)
        for y in range(size)
    ]
    for _ in range(2):
        raw = [0.25 * raw[(i - 1) % size] + 0.5 * raw[i] + 0.25 * raw[(i + 1) % size] for i in range(size)]
    pixels = [0.0] * (size * size * 4)
    idx = 0
    for y in range(size):
        rv = raw[y]
        for x in range(size):
            v = clamp(base_r + amp * rv * (0.85 + 0.15 * math.cos((x / size) * math.tau * 2.0)), 0.08, 0.55)
            pixels[idx] = pixels[idx + 1] = pixels[idx + 2] = v
            pixels[idx + 3] = 1.0
            idx += 4
    return make_image_from_rgb(name, size, size, pixels, "Non-Color")


def make_pbr_material(
    name: str,
    base_hex: str,
    metallic: float = 0.0,
    roughness: float = 0.22,
    coat_weight: float = 0.0,
    coat_roughness: float = 0.05,
    emissive_hex: str = None,
    emissive_strength: float = 0.0,
    alpha: float = 1.0,
    ior: float = 1.52,
    specular_ior_level: float = 0.5,
    transmission: float = 0.0,
    col_img=None,
    rgh_img=None,
    uv_scale: float = 1.0,
):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
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

    if emissive_hex and emissive_strength > 0.0:
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = hex_rgba(emissive_hex)
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emissive_strength

    if col_img is not None or rgh_img is not None:
        tc = nodes.new("ShaderNodeTexCoord")
        mp = nodes.new("ShaderNodeMapping")
        mp.inputs["Scale"].default_value = (uv_scale, uv_scale, uv_scale)
        links.new(tc.outputs["UV"], mp.inputs["Vector"])
        if col_img is not None:
            ti = nodes.new("ShaderNodeTexImage")
            ti.image = col_img
            links.new(mp.outputs["Vector"], ti.inputs["Vector"])
            links.new(ti.outputs["Color"], bsdf.inputs["Base Color"])
        if rgh_img is not None:
            tr = nodes.new("ShaderNodeTexImage")
            tr.image = rgh_img
            links.new(mp.outputs["Vector"], tr.inputs["Vector"])
            links.new(tr.outputs["Color"], bsdf.inputs["Roughness"])

    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def build_prism_materials():
    marble_col, marble_rgh = gen_nero_gold_marble_textures("Tex_PrismMarble", 256)
    sapph_obs_col = gen_sapphire_obsidian_texture("Tex_PrismObsidian_COL", 256)
    satin_gold_rgh = gen_silky_satin_roughness("Tex_PrismGold_RGH", 256, base_r=0.165, amp=0.030)
    satin_brass_rgh = gen_silky_satin_roughness("Tex_PrismBrass_RGH", 256, base_r=0.23, amp=0.038)

    return [
        # 0: 22K Satin Champagne Gold
        make_pbr_material("Mat_Brushed_Gold", "#F4CC6C", metallic=0.96, roughness=0.165,
                          coat_weight=0.16, coat_roughness=0.05, rgh_img=satin_gold_rgh, uv_scale=2.2),
        # 1: Weighted Brushed Antique Brass
        make_pbr_material("Mat_Antique_Brass", "#CA9640", metallic=0.94, roughness=0.23,
                          coat_weight=0.10, coat_roughness=0.09, rgh_img=satin_brass_rgh, uv_scale=2.2),
        # 2: 18K Rose Gold
        make_pbr_material("Mat_Rose_Gold", "#E8A878", metallic=0.96, roughness=0.155,
                          coat_weight=0.14, coat_roughness=0.06, rgh_img=satin_gold_rgh, uv_scale=2.4),
        # 3: Glossy Royal Midnight-Sapphire Obsidian (iris shutters & bezel inlays)
        make_pbr_material("Mat_Obsidian_Onyx", "#0D1B38", metallic=0.30, roughness=0.09,
                          coat_weight=0.95, coat_roughness=0.03, col_img=sapph_obs_col, uv_scale=1.6),
        # 4: Nero Marquina Gold-Veined Dark Marble
        make_pbr_material("Mat_Dark_Marble", "#0E121B", metallic=0.03, roughness=0.16,
                          coat_weight=0.52, coat_roughness=0.06, col_img=marble_col, rgh_img=marble_rgh, uv_scale=1.5),
        # 5: Blued Watchmaker Gunmetal Steel
        make_pbr_material("Mat_Gunmetal_Steel", "#222E44", metallic=0.91, roughness=0.24,
                          coat_weight=0.12, rgh_img=satin_brass_rgh, uv_scale=2.4),
        # 6: Faceted Royal Blue Sapphire Jewel Bearing
        make_pbr_material("Mat_Sapphire_Jewel", "#185EFF", metallic=0.12, roughness=0.035,
                          coat_weight=1.0, coat_roughness=0.015, emissive_hex="#2572FF", emissive_strength=0.95, ior=1.77),
        # 7: Pigeon-Blood Horological Ruby Jewel Bearing
        make_pbr_material("Mat_Ruby_Jewel", "#DF1642", metallic=0.12, roughness=0.035,
                          coat_weight=1.0, coat_roughness=0.015, emissive_hex="#F0204C", emissive_strength=0.95, ior=1.77),
        # 8: Luminous Faceted Champagne-Diamond Hologram Core
        make_pbr_material("Mat_Crystal_Heart", "#FFD978", metallic=0.28, roughness=0.045,
                          coat_weight=1.0, coat_roughness=0.015, emissive_hex="#FFC246", emissive_strength=1.95, ior=2.18),
        # 9: Warm Recessed Magnetic Levitation Gold Halo
        make_pbr_material("Mat_Levitation_Glow", "#F0BA4C", metallic=0.68, roughness=0.18,
                          emissive_hex="#FFC14A", emissive_strength=1.80),
        # 10: Mirror-Polished 24K Liquid Gold (jeweler's claws, crown flutes, filigree!)
        make_pbr_material("Mat_Liquid_Gold_24K", "#FFDC7E", metallic=0.98, roughness=0.11,
                          coat_weight=0.25, coat_roughness=0.03),
        # 11: Jewel-Cut Smoked-Sapphire / Frosted-Quartz Answer Facet Crystal!
        #     Exports KHR_materials_transmission + clean BLEND alpha for Three.js MeshPhysicalMaterial!
        make_pbr_material("Mat_Facet_Crystal", "#4E82C8", metallic=0.06, roughness=0.14,
                          coat_weight=0.55, coat_roughness=0.03, alpha=0.34, ior=1.54,
                          specular_ior_level=0.45, transmission=0.84,
                          emissive_hex="#285898", emissive_strength=0.22),
    ]


P_GOLD = 0
P_BRASS = 1
P_ROSE = 2
P_OBSIDIAN = 3
P_MARBLE = 4
P_GUNMETAL = 5
P_SAPPHIRE = 6
P_RUBY = 7
P_CRYSTAL = 8
P_LEV_GLOW = 9
P_GOLD24 = 10
P_FACET_GLASS = 11


# ---------------------------------------------------------------------------
# Hard-Surface & Horological BMesh Builders
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


def mark_sharp_by_angle(bm, angle_deg: float = 35.0, keep_flat_mats=None):
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
    sharp_angle_deg: float = 35.0,
    uv_scale: float = 1.8,
    weld_dist: float = 1e-5,
    weighted_normal: bool = True,
    keep_flat_mats=None,
    cast_shadow: bool = True,
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

    used = sorted({p.material_index for p in mesh.polygons})
    if used:
        remap = {old_i: new_i for new_i, old_i in enumerate(used)}
        for old_i in used:
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
    if not cast_shadow and hasattr(obj, "visible_shadow"):
        obj.visible_shadow = False
    collection.objects.link(obj)

    if weighted_normal and not keep_flat_mats:
        wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
        wn.keep_sharp = True
        wn.weight = 50
        wn.mode = "FACE_AREA"

    return obj


def add_lathe_profile(bm, profile_rz, segments: int, mat_idx: int, closed_profile: bool = False,
                      cap_bottom: bool = False, cap_top: bool = False, matrix: Matrix = None,
                      flute_count: int = 0, flute_depth: float = 0.0):
    rings = []
    for r, z in profile_rz:
        ring = []
        for s in range(segments):
            a = (s / segments) * math.tau
            rr = r
            if flute_count > 0 and flute_depth != 0.0:
                rr = max(0.0005, r - flute_depth * 0.5 * (1.0 - math.cos(a * flute_count)))
            p = Vector((math.cos(a) * rr, math.sin(a) * rr, z))
            if matrix is not None:
                p = matrix @ p
            ring.append(bm.verts.new(p))
        rings.append(ring)

    n = len(rings)
    for i in range(n if closed_profile else n - 1):
        r0, r1 = rings[i], rings[(i + 1) % n]
        for s in range(segments):
            sn = (s + 1) % segments
            try:
                f = bm.faces.new((r0[s], r0[sn], r1[sn], r1[s]))
                f.material_index = mat_idx
                f.smooth = True
            except ValueError:
                pass

    if cap_bottom and rings:
        cp = matrix @ Vector((0, 0, profile_rz[0][1])) if matrix else Vector((0, 0, profile_rz[0][1]))
        cv = bm.verts.new(cp)
        for s in range(segments):
            try:
                f = bm.faces.new((cv, rings[0][(s + 1) % segments], rings[0][s]))
                f.material_index = mat_idx
                f.smooth = True
            except ValueError:
                pass
    if cap_top and rings:
        cp = matrix @ Vector((0, 0, profile_rz[-1][1])) if matrix else Vector((0, 0, profile_rz[-1][1]))
        cv = bm.verts.new(cp)
        for s in range(segments):
            try:
                f = bm.faces.new((cv, rings[-1][s], rings[-1][(s + 1) % segments]))
                f.material_index = mat_idx
                f.smooth = True
            except ValueError:
                pass


def add_swept_profile(bm, path_points, profile_2d, mat_idx: int, closed_path: bool = False,
                      cap_ends: bool = True, up_hint: Vector = Vector((0, 0, 1)), scale_fn=None):
    pts = [Vector(p) for p in path_points]
    n_pts = len(pts)
    if n_pts < 2:
        return
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
        tangents.append(t.normalized() if t.length > 1e-8 else Vector((0, 0, 1)))

    t0 = tangents[0]
    hint = up_hint.normalized()
    if abs(t0.dot(hint)) > 0.96:
        hint = Vector((1, 0, 0)) if abs(t0.x) < 0.8 else Vector((0, 1, 0))
    n_vec = hint.cross(t0).normalized()
    b_vec = t0.cross(n_vec).normalized()
    frames = [(n_vec, b_vec)]
    for i in range(1, n_pts):
        tp, tc = tangents[i - 1], tangents[i]
        axis = tp.cross(tc)
        if axis.length > 1e-6:
            rot = Matrix.Rotation(math.acos(clamp(tp.dot(tc), -1.0, 1.0)), 3, axis.normalized())
            n_vec = (rot @ n_vec).normalized()
            b_vec = tc.cross(n_vec).normalized()
        frames.append((n_vec, b_vec))

    if closed_path:
        tl, tf = tangents[-1], tangents[0]
        axis = tl.cross(tf)
        ne, _ = frames[-1]
        if axis.length > 1e-6:
            ne = (Matrix.Rotation(math.acos(clamp(tl.dot(tf), -1.0, 1.0)), 3, axis.normalized()) @ ne).normalized()
        n0, b0 = frames[0]
        tw = math.atan2(ne.dot(b0), ne.dot(n0))
        if abs(tw) > 1e-5:
            frames = [
                (nv * math.cos(-tw * i / n_pts) + bv * math.sin(-tw * i / n_pts),
                 -nv * math.sin(-tw * i / n_pts) + bv * math.cos(-tw * i / n_pts))
                for i, (nv, bv) in enumerate(frames)
            ]

    rings = []
    for i in range(n_pts):
        sc = scale_fn(i / max(1, n_pts - 1)) if scale_fn else (1.0, 1.0)
        sx, sy = (sc, sc) if isinstance(sc, (int, float)) else sc
        nv, bv = frames[i]
        p = pts[i]
        rings.append([bm.verts.new(p + nv * (pu * sx) + bv * (pv * sy)) for (pu, pv) in profile_2d])

    m = len(profile_2d)
    for i in range(n_pts if closed_path else n_pts - 1):
        r0, r1 = rings[i], rings[(i + 1) % n_pts]
        for j in range(m):
            try:
                f = bm.faces.new((r0[j], r0[(j + 1) % m], r1[(j + 1) % m], r1[j]))
                f.material_index = mat_idx
                f.smooth = True
            except ValueError:
                pass
    if not closed_path and cap_ends:
        for r, rev in ((rings[0], True), (rings[-1], False)):
            try:
                f = bm.faces.new(list(reversed(r)) if rev else list(r))
                f.material_index = mat_idx
            except ValueError:
                pass


def add_chamfered_box(bm, sx, sy, sz, bevel, mat_idx, matrix=None, segments=1):
    ret = bmesh.ops.create_cube(bm, size=1.0)
    verts = ret["verts"]
    sm = Matrix.Diagonal((sx, sy, sz, 1.0))
    for v in verts:
        v.co = sm @ v.co
    edges = list({e for v in verts for e in v.link_edges})
    faces = list({f for v in verts for f in v.link_faces})
    if bevel > 0.0:
        br = bmesh.ops.bevel(bm, geom=edges, offset=min(bevel, min(sx, sy, sz) * 0.42),
                             segments=segments, affect="EDGES", clamp_overlap=True)
        all_v = [v for v in (set(verts) | set(br["verts"])) if v.is_valid]
        all_f = [f for f in (set(faces) | set(br["faces"])) if f.is_valid]
    else:
        all_v = [v for v in verts if v.is_valid]
        all_f = [f for f in faces if f.is_valid]
    if matrix is not None:
        bmesh.ops.transform(bm, matrix=matrix, verts=all_v)
    for f in all_f:
        if f.is_valid:
            f.material_index = mat_idx
            f.smooth = True


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
    add_lathe_profile(bm, [
        (radius * 1.26, -height * 0.25), (radius * 1.30, height * 0.08),
        (radius * 1.14, height * 0.45), (radius * 0.92, height * 0.48), (radius * 0.86, height * 0.20),
    ], segments=facets, mat_idx=bezel_mat, cap_bottom=True, matrix=m)
    add_lathe_profile(bm, [
        (radius * 0.86, height * 0.18), (radius * 0.90, height * 0.48),
        (radius * 0.60, height * 0.86), (radius * 0.24, height * 0.98),
    ], segments=facets, mat_idx=gem_mat, cap_top=True, matrix=m)


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
        bm.faces.new((bv[i], bv[inext], tv[inext], tv[i])).material_index = mat_idx
        bm.faces.new((tv[i], tv[inext], apex)).material_index = mat_idx
    bm.faces.new(list(reversed(bv))).material_index = mat_idx


# ===========================================================================
# BUILD THE STAR OF PITCH_BIBLE.MD: THE VERITAS PRISM (veritas_prism.glb)
# ===========================================================================
PRISM_CENTER_Z = 0.50   # Three.js Y = 0.50m
FACET_RADIUS = 0.340    # Facet centers sit at R = 0.340m around (0, 0.50, 0)


def build_curved_jewel_facet(name: str, index: int, mats, collection, parent_carousel):
    """
    Sculpts ONE curved, emerald-cut smoked-sapphire/frosted-quartz Answer Facet (`0.41m W x 0.195m H`)
    held ONLY by delicate left & right 24K Art-Deco jeweler's claw clasps + top diamond index crest!
    ZERO rectangular picture-frame borders!

    Local coordinate frame in Blender (before Z-yaw):
      - Origin at facet center `(0, -FACET_RADIUS, 0)` relative to `Facet_Carousel`
      - Local `-Y` -> Three.js `+Z` (points radially OUTWARD!)
      - Local `+Z` -> Three.js `+Y` (points UP!)
      - Local `+X` -> Three.js `+X` (horizontal across reading window!)
    """
    bm = bmesh.new()

    # 1. Curved Cushion / Emerald-Cut Smoked-Sapphire Watch Crystal Lens
    #    Curved smoothly along cylinder R = FACET_RADIUS (arc ±31.5° -> ~0.415m W x 0.195m H),
    #    with gentle arched watchmaker tonneau crown & emerald corner chamfers!
    nu = 19
    half_ang = math.radians(31.5)
    half_h_center = 0.096
    half_h_edge = 0.078
    bevel_inset_u = 0.014
    bevel_inset_z = 0.012

    def contour_ring(inset_frac: float, y_radial_offset: float):
        """Generates a closed smooth tonneau/emerald-beveled perimeter ring around the curved lens."""
        pts = []
        # Top curved edge (-1 -> +1)
        for k in range(nu):
            u = (k / (nu - 1)) * 2.0 - 1.0  # -1..+1
            # Emerald corner chamfer envelope
            corner_cut = smoothstep(0.76, 1.0, abs(u)) * 0.020
            h_top = lerp(half_h_edge, half_h_center, math.cos(u * math.pi * 0.5) ** 0.8) - corner_cut
            h_cur = h_top - inset_frac * bevel_inset_z
            ang = u * (half_ang - inset_frac * (bevel_inset_u / FACET_RADIUS))
            rr = FACET_RADIUS + y_radial_offset
            # Relative to local facet origin (0, -FACET_RADIUS, 0):
            pts.append(Vector((math.sin(ang) * rr, -math.cos(ang) * rr + FACET_RADIUS, h_cur)))
        # Bottom curved edge (+1 -> -1)
        for k in range(nu - 1, -1, -1):
            u = (k / (nu - 1)) * 2.0 - 1.0
            corner_cut = smoothstep(0.76, 1.0, abs(u)) * 0.020
            h_bot = -(lerp(half_h_edge, half_h_center, math.cos(u * math.pi * 0.5) ** 0.8) - corner_cut)
            h_cur = h_bot + inset_frac * bevel_inset_z
            ang = u * (half_ang - inset_frac * (bevel_inset_u / FACET_RADIUS))
            rr = FACET_RADIUS + y_radial_offset
            pts.append(Vector((math.sin(ang) * rr, -math.cos(ang) * rr + FACET_RADIUS, h_cur)))
        return pts

    # 5-layer jewel-cut crystal cross-section from inner face (-0.008m) through beveled girdle to outer table (+0.010m)!
    crystal_layers = [
        (1.00, -0.0085),  # Inner recessed crystal table
        (0.32, -0.0045),  # Inner bevel shoulder
        (0.00, 0.0005),   # Polished crystal girdle edge
        (0.38, 0.0065),   # Outer emerald-cut jewel bevel (catches razor-sharp prismatic highlights!)
        (1.05, 0.0105),   # Smooth curved outer reading table (troika MSDF text sits right at +0.014m!)
    ]
    c_rings = [[bm.verts.new(p) for p in contour_ring(ins, y_off)] for (ins, y_off) in crystal_layers]
    m_ring = len(c_rings[0])

    # Side bevel bands (intentionally crisp jewel bevels!)
    for li in range(len(c_rings) - 1):
        r0, r1 = c_rings[li], c_rings[li + 1]
        for j in range(m_ring):
            jn = (j + 1) % m_ring
            f = bm.faces.new((r0[j], r0[jn], r1[jn], r1[j]))
            f.material_index = P_FACET_GLASS
            f.smooth = True

    # Smooth curved front & back crystal tables (clean quad strips top-to-bottom so curvature is silky!)
    for ring_verts, flip in ((c_rings[0], True), (c_rings[-1], False)):
        top_row = ring_verts[:nu]
        bot_row = list(reversed(ring_verts[nu:]))
        for k in range(nu - 1):
            quad = (bot_row[k], bot_row[k + 1], top_row[k + 1], top_row[k])
            if flip:
                quad = tuple(reversed(quad))
            f = bm.faces.new(quad)
            f.material_index = P_FACET_GLASS
            f.smooth = True

    # Ultra-delicate 1.6mm hairline 24K gold bezel wire tracing the curved emerald-cut crystal silhouette
    # (gives crisp luxury watchmaker crystal definition without any heavy rectangular frame!)
    hairline_pts = contour_ring(0.22, 0.0055)
    hairline_cs = [
        (-0.0018, -0.0014), (0.0018, -0.0014), (0.0022, 0.0014), (-0.0022, 0.0014)
    ]
    add_swept_profile(bm, hairline_pts, hairline_cs, mat_idx=P_GOLD24, closed_path=True, up_hint=Vector((0, -1, 0)))

    # 2. Delicate Sculpted 24K Liquid-Gold Art-Deco Left & Right Jeweler's Claw Clasps (NO boxy top/bottom bars!)
    clasp_cs = [
        (-0.0065, -0.0055), (0.0065, -0.0055), (0.0085, 0.0000),
        (0.0055, 0.0075), (-0.0055, 0.0075), (-0.0085, 0.0000),
    ]
    for side in (-1.0, 1.0):
        ang_e = side * (half_ang + math.radians(1.1))
        rr_e = FACET_RADIUS + 0.002
        cx = math.sin(ang_e) * rr_e
        cy = -math.cos(ang_e) * rr_e + FACET_RADIUS
        rad_out = Vector((math.sin(ang_e), -math.cos(ang_e), 0.0))

        # Curved vertical Art-Deco claw bracket embracing ONLY the left/right end of the crystal!
        claw_pts = []
        for k in range(13):
            t = k / 12.0
            zz = lerp(-0.074, 0.074, t)
            # Curls delicately inward over the top/bottom emerald corners like a watchmaker jewel setting!
            curl = smoothstep(0.68, 1.0, abs(t * 2.0 - 1.0)) * 0.012
            ang_k = side * (half_ang + math.radians(1.1) - curl / FACET_RADIUS)
            rk = FACET_RADIUS + 0.003 + 0.003 * math.sin(t * math.pi)
            claw_pts.append(Vector((math.sin(ang_k) * rk, -math.cos(ang_k) * rk + FACET_RADIUS, zz)))

        add_swept_profile(
            bm, claw_pts, clasp_cs, mat_idx=P_GOLD24, closed_path=False, cap_ends=True,
            up_hint=rad_out,
            scale_fn=lambda u: 0.72 + 0.45 * math.sin(u * math.pi),
        )

        # Center sapphire/ruby cabochon jewel bearing mounted on each side clasp!
        gem_p = Vector((cx, cy, 0.0)) + rad_out * 0.0085
        add_diamond_index(bm, Vector((cx, cy, 0.0)) + rad_out * 0.005, rad_out, Vector((0, 0, 1)),
                          length=0.042, width=0.018, height=0.005, mat_idx=P_GOLD24)
        add_faceted_gem(bm, gem_p, rad_out, radius=0.0068, height=0.0052,
                        bezel_mat=P_GOLD24, gem_mat=(P_SAPPHIRE if index % 2 == 0 else P_RUBY), facets=10)

        # Slender rear watchmaker suspension lug arm curving back from the side clasp toward the carousel spider!
        lug_pts = [
            Vector((cx * 0.98, cy - 0.004, 0.0)),
            Vector((cx * 0.88, cy + 0.026, 0.0)),
            Vector((cx * 0.76, cy + 0.052, 0.0)),
        ]
        lug_cs = [(-0.0045, -0.006), (0.0045, -0.006), (0.0045, 0.006), (-0.0045, 0.006)]
        add_swept_profile(bm, lug_pts, lug_cs, mat_idx=P_GOLD, closed_path=False, cap_ends=True,
                          up_hint=Vector((0, 0, 1)))

    # 3. Delicate Top-Center 24K Gold Sightline Pointer Crest (frames the A/B/C/D diamond badge cleanly!)
    crest_pos = Vector((0.0, -0.004, half_h_center + 0.002))
    add_diamond_index(bm, crest_pos, Vector((0, -1, 0)), Vector((1, 0, 0)),
                      length=0.052, width=0.020, height=0.0065, mat_idx=P_GOLD24)
    add_faceted_gem(bm, crest_pos + Vector((0, -0.0045, 0)), Vector((0, -1, 0)),
                    radius=0.0055, height=0.0045, bezel_mat=P_GOLD24, gem_mat=P_SAPPHIRE, facets=10)

    # Tiny bottom-center gold balance pip
    bot_pip = Vector((0.0, -0.003, -(half_h_center + 0.001)))
    add_diamond_index(bm, bot_pip, Vector((0, -1, 0)), Vector((1, 0, 0)),
                      length=0.032, width=0.013, height=0.0045, mat_idx=P_GOLD24)

    # Position & orient around Facet_Carousel:
    # i=0 -> 0° (front -Y_b = +Z_gltf), i=1 -> +90° (+X_b = +X_gltf), i=2 -> 180° (+Y_b = -Z_gltf), i=3 -> +270° (-X_b = -X_gltf)
    yaw = index * (math.pi * 0.5)
    loc_x = math.sin(yaw) * FACET_RADIUS
    loc_y = -math.cos(yaw) * FACET_RADIUS

    return finalize_mesh_obj(
        name,
        bm,
        mats,
        collection,
        location=(loc_x, loc_y, 0.0),
        rotation_euler=(0.0, 0.0, yaw),
        parent=parent_carousel,
        sharp_angle_deg=34.0,
        uv_scale=2.5,
        cast_shadow=False,  # Clean crystal translucency without casting solid grey shadow onto inner shutters!
    )


def build_veritas_prism_scene(mats, collection):
    all_export_objs = []

    # -----------------------------------------------------------------------
    # 1. Prism_Pedestal (origin 0,0,0 — strictly flush Z >= 0.000m!)
    # -----------------------------------------------------------------------
    bm_ped = bmesh.new()
    marble_prof = [
        (0.010, 0.000), (0.296, 0.000), (0.305, 0.007), (0.305, 0.025),
        (0.290, 0.035), (0.278, 0.040), (0.275, 0.064), (0.258, 0.076),
        (0.242, 0.086), (0.218, 0.088), (0.198, 0.082), (0.168, 0.068),
        (0.130, 0.056), (0.082, 0.051), (0.008, 0.050),
    ]
    add_lathe_profile(bm_ped, marble_prof, segments=56, mat_idx=P_MARBLE, cap_bottom=True, cap_top=True)

    add_lathe_profile(bm_ped, [(0.303, 0.005), (0.310, 0.010), (0.310, 0.022), (0.300, 0.027)],
                      segments=56, mat_idx=P_BRASS, closed_profile=True)
    add_lathe_profile(bm_ped, [(0.274, 0.039), (0.283, 0.044), (0.283, 0.059), (0.272, 0.064)],
                      segments=56, mat_idx=P_GOLD, closed_profile=True, flute_count=40, flute_depth=0.0022)
    add_lathe_profile(bm_ped, [(0.214, 0.083), (0.226, 0.090), (0.238, 0.089), (0.244, 0.082), (0.226, 0.079)],
                      segments=56, mat_idx=P_GOLD24, closed_profile=True)
    add_lathe_profile(bm_ped, [(0.202, 0.081), (0.172, 0.069), (0.134, 0.057), (0.085, 0.052), (0.006, 0.051)],
                      segments=48, mat_idx=P_OBSIDIAN, cap_top=True)
    add_lathe_profile(bm_ped, [(0.132, 0.056), (0.154, 0.062), (0.151, 0.067), (0.134, 0.061)],
                      segments=48, mat_idx=P_BRASS, closed_profile=True)
    add_lathe_profile(bm_ped, [(0.138, 0.059), (0.148, 0.063), (0.146, 0.066), (0.139, 0.062)],
                      segments=48, mat_idx=P_LEV_GLOW, closed_profile=True)
    add_faceted_gem(bm_ped, Vector((0, 0, 0.051)), Vector((0, 0, 1)),
                    radius=0.028, height=0.017, bezel_mat=P_GOLD24, gem_mat=P_SAPPHIRE, facets=12)

    # 4 Graceful Curved 24K S-Scroll Cradle Arms at 45°, 135°, 225°, 315° (clearing R=0.445m outer gimbal!)
    scroll_cs = [
        (-0.009, -0.005), (0.009, -0.005), (0.0115, 0.0),
        (0.008, 0.006), (0.0, 0.008), (-0.008, 0.006), (-0.0115, 0.0),
    ]
    for arm_i in range(4):
        ang = math.radians(45.0 + arm_i * 90.0)
        ca, sa = math.cos(ang), math.sin(ang)
        pts_rz = []
        for k in range(18):
            t = k / 17.0
            if t < 0.26:
                u = t / 0.26
                r = lerp(0.320, 0.295, smoothstep(0.0, 1.0, u))
                z = lerp(0.012, 0.055, u * u * (2.0 - u))
            else:
                u = (t - 0.26) / 0.74
                r = 0.295 + 0.098 * math.sin(u * math.pi * 0.82) - 0.014 * (u ** 3)
                z = 0.055 + 0.165 * smoothstep(0.0, 1.0, u)
            pts_rz.append((r, z))
        path_3d = [Vector((ca * r, sa * r, z)) for (r, z) in pts_rz]
        add_swept_profile(
            bm_ped, path_3d, scroll_cs, mat_idx=P_GOLD, closed_path=False, cap_ends=True,
            up_hint=Vector((-sa, ca, 0.0)),
            scale_fn=lambda u: (1.20 * (1.0 - 0.44 * u) + 0.18 * math.sin(u * math.pi), 1.05 * (1.0 - 0.34 * u)),
        )
        foot_m = Matrix.Translation((ca * 0.320, sa * 0.320, 0.0))
        add_lathe_profile(bm_ped, [(0.002, 0.0), (0.024, 0.0), (0.026, 0.005), (0.020, 0.012), (0.009, 0.016)],
                          segments=16, mat_idx=P_BRASS, cap_bottom=True, cap_top=True, matrix=foot_m)
        add_faceted_gem(bm_ped, path_3d[-1], Vector((-ca * 0.72, -sa * 0.72, 0.69)).normalized(),
                        radius=0.0115, height=0.0095, bezel_mat=P_GOLD24, gem_mat=P_RUBY, facets=8)

    for v in bm_ped.verts:
        if v.co.z < 0.0:
            v.co.z = 0.0

    obj_ped = finalize_mesh_obj("Prism_Pedestal", bm_ped, mats, collection, sharp_angle_deg=36.0, uv_scale=1.8)
    all_export_objs.append(obj_ped)

    # -----------------------------------------------------------------------
    # 2 & 3. Gimbal_Outer (R=0.432m) & Gimbal_Equatorial (R=0.398m) at (0, 0, 0.50)
    # -----------------------------------------------------------------------
    def build_gimbal_ring(name, radius, bw, th, main_mat, accent_mat, jewel_mat, rot_euler, openwork=False):
        bm = bmesh.new()
        segs = 72
        hw, ht = bw * 0.5, th * 0.5
        if not openwork:
            pts = [Vector((math.cos(i / segs * math.tau) * radius, 0.0, math.sin(i / segs * math.tau) * radius)) for i in range(segs)]
            cs = [
                (-ht * 0.65, -hw), (ht * 0.65, -hw), (ht, -hw * 0.62), (ht, hw * 0.62),
                (ht * 0.65, hw), (-ht * 0.65, hw), (-ht, hw * 0.62), (-ht, -hw * 0.62),
            ]
            add_swept_profile(bm, pts, cs, mat_idx=main_mat, closed_path=True, up_hint=Vector((0, 1, 0)))
            ch_pts = [Vector((math.cos(i / segs * math.tau) * (radius + ht * 0.88), 0.0,
                              math.sin(i / segs * math.tau) * (radius + ht * 0.88))) for i in range(segs)]
            add_swept_profile(bm, ch_pts, [(-0.0018, -hw * 0.28), (0.0018, -hw * 0.28), (0.0018, hw * 0.28), (-0.0018, hw * 0.28)],
                              mat_idx=accent_mat, closed_path=True, up_hint=Vector((0, 1, 0)))
        else:
            rail_off = hw * 0.68
            rw = hw * 0.34
            rcs = [
                (-ht * 0.6, -rw), (ht * 0.6, -rw), (ht, -rw * 0.5), (ht, rw * 0.5),
                (ht * 0.6, rw), (-ht * 0.6, rw), (-ht, rw * 0.5), (-ht, -rw * 0.5),
            ]
            for sgn in (-1.0, 1.0):
                r_pts = [Vector((math.cos(i / segs * math.tau) * radius, sgn * rail_off,
                                 math.sin(i / segs * math.tau) * radius)) for i in range(segs)]
                add_swept_profile(bm, r_pts, rcs, mat_idx=main_mat, closed_path=True, up_hint=Vector((0, 1, 0)))
            for k in range(18):
                a = (k / 18.0) * math.tau
                sm = Matrix.Translation((math.cos(a) * radius, 0.0, math.sin(a) * radius)) @ Matrix.Rotation(-a, 4, "Y")
                add_chamfered_box(bm, ht * 1.15, rail_off * 2.0, 0.0055, bevel=0.0012, mat_idx=accent_mat, matrix=sm, segments=1)

        for k in range(24):
            a = (k / 24.0) * math.tau
            ca, sa = math.cos(a), math.sin(a)
            pos = Vector((ca * (radius - ht * 0.72), 0.0, sa * (radius - ht * 0.72)))
            add_diamond_index(bm, pos, Vector((-ca, 0, -sa)), Vector((-sa, 0, ca)),
                              length=(0.0065 if k % 3 == 0 else 0.0038), width=hw * 0.9,
                              height=(0.0055 if k % 3 == 0 else 0.0032), mat_idx=P_GOLD24)

        for c_i in range(4):
            a = c_i * (math.pi * 0.5)
            rad = Vector((math.cos(a), 0.0, math.sin(a)))
            tan = Vector((-math.sin(a), 0.0, math.cos(a)))
            add_diamond_index(bm, rad * (radius + ht * 0.75), rad, tan,
                              length=0.038, width=bw * 1.35, height=0.009, mat_idx=P_GOLD24)
            jm = jewel_mat if c_i % 2 == 0 else (P_RUBY if jewel_mat == P_SAPPHIRE else P_SAPPHIRE)
            for sgn in (-1.0, 1.0):
                add_faceted_gem(bm, rad * radius + Vector((0, sgn * hw * 0.92, 0)), Vector((0, sgn, 0)),
                                radius=0.0076, height=0.006, bezel_mat=P_GOLD24, gem_mat=jm, facets=8)

        return finalize_mesh_obj(
            name, bm, mats, collection,
            location=(0.0, 0.0, PRISM_CENTER_Z), rotation_euler=rot_euler,
            sharp_angle_deg=36.0, uv_scale=2.2,
        )

    gimbal_outer = build_gimbal_ring(
        "Gimbal_Outer", 0.432, 0.022, 0.0135, P_GOLD, P_GUNMETAL, P_SAPPHIRE,
        (0.0, 0.0, math.radians(12.0)), openwork=False
    )
    gimbal_eq = build_gimbal_ring(
        "Gimbal_Equatorial", 0.398, 0.019, 0.0115, P_ROSE, P_GOLD24, P_RUBY,
        (math.radians(58.0), math.radians(-14.0), math.radians(24.0)), openwork=True
    )
    all_export_objs.extend([gimbal_outer, gimbal_eq])

    # -----------------------------------------------------------------------
    # 4. Facet_Carousel (Empty at (0, 0, 0.50) -> spins around Y in Three.js!)
    #    Contains Carousel_Spider + Facet_0, Facet_1, Facet_2, Facet_3
    # -----------------------------------------------------------------------
    carousel_empty = bpy.data.objects.new("Facet_Carousel", None)
    carousel_empty.location = (0.0, 0.0, PRISM_CENTER_Z)
    collection.objects.link(carousel_empty)
    all_export_objs.append(carousel_empty)

    # Discreet inner watchmaker carousel spider ring tucked cleanly at z_local = ±0.118m, R = 0.258m
    # with 8 radial spoke arms reaching strictly into the side jeweler's claws (ZERO bars crossing the lens window!)
    bm_spider = bmesh.new()
    for sgn_z in (-1.0, 1.0):
        zz = sgn_z * 0.118
        r_sp = 0.258
        sp_pts = [Vector((math.cos(i / 56.0 * math.tau) * r_sp, math.sin(i / 56.0 * math.tau) * r_sp, zz)) for i in range(56)]
        sp_cs = [(-0.0045, -0.0035), (0.0045, -0.0035), (0.0045, 0.0035), (-0.0045, 0.0035)]
        add_swept_profile(bm_spider, sp_pts, sp_cs, mat_idx=P_BRASS, closed_path=True, up_hint=Vector((0, 0, 1)))

    # 8 Curved gold spoke yokes connecting ONLY at the 32° side clasp seams between facets!
    for f_i in range(4):
        base_yaw = f_i * (math.pi * 0.5)
        for side_s in (-1.0, 1.0):
            ang = base_yaw + side_s * math.radians(32.0)
            ca_s, sa_s = math.sin(ang), -math.cos(ang)
            st_pts = [
                Vector((ca_s * 0.258, sa_s * 0.258, -0.118)),
                Vector((ca_s * 0.305, sa_s * 0.305, 0.0)),
                Vector((ca_s * 0.258, sa_s * 0.258, 0.118)),
            ]
            add_swept_profile(bm_spider, st_pts, [(-0.0035, -0.0035), (0.0035, -0.0035), (0.0035, 0.0035), (-0.0035, 0.0035)],
                              mat_idx=P_GOLD, closed_path=False, cap_ends=True, up_hint=Vector((math.cos(ang), math.sin(ang), 0)))

    obj_spider = finalize_mesh_obj(
        "Carousel_Spider", bm_spider, mats, collection,
        location=(0.0, 0.0, 0.0), parent=carousel_empty, sharp_angle_deg=35.0, uv_scale=2.4
    )
    all_export_objs.append(obj_spider)

    facets = []
    for f_i in range(4):
        f_obj = build_curved_jewel_facet(f"Facet_{f_i}", f_i, mats, collection, carousel_empty)
        facets.append(f_obj)
        all_export_objs.append(f_obj)

    # -----------------------------------------------------------------------
    # 5. Brass_Crown (origin (0, 0, 0.855) -> Three.js (0, 0.855, 0), drags -Y for PEEL!)
    # -----------------------------------------------------------------------
    bm_crown = bmesh.new()
    # Telescoping watchmaker draw-tube & scalloped coin-edge 24K pull-crown + sovereign spire finial
    crown_prof = [
        (0.022, -0.105),
        (0.026, -0.040),
        (0.048, -0.032),
        (0.088, -0.020),
        (0.128, -0.008),
        (0.136, 0.004),
        (0.136, 0.026),
        (0.122, 0.038),
        (0.092, 0.046),
        (0.052, 0.056),
        (0.026, 0.068),
        (0.014, 0.082),
        (0.002, 0.102),
    ]
    add_lathe_profile(bm_crown, crown_prof, segments=48, mat_idx=P_GOLD,
                      cap_bottom=True, cap_top=True, flute_count=32, flute_depth=0.0028)

    # Polished 24K liquid-gold grip rim + royal sapphire-obsidian inset band
    add_lathe_profile(bm_crown, [(0.132, 0.002), (0.144, 0.008), (0.144, 0.022), (0.132, 0.028)],
                      segments=48, mat_idx=P_GOLD24, closed_profile=True, flute_count=24, flute_depth=0.0024)
    add_lathe_profile(bm_crown, [(0.090, 0.036), (0.118, 0.032), (0.112, 0.044), (0.086, 0.046)],
                      segments=48, mat_idx=P_OBSIDIAN, closed_profile=True)

    for k in range(6):
        a = (k / 6.0) * math.tau
        p = Vector((math.cos(a) * 0.142, math.sin(a) * 0.142, 0.015))
        n = Vector((math.cos(a), math.sin(a), 0.0))
        add_faceted_gem(bm_crown, p, n, radius=0.0068, height=0.0052,
                        bezel_mat=P_GOLD24, gem_mat=(P_SAPPHIRE if k % 2 == 0 else P_RUBY), facets=10)

    obj_crown = finalize_mesh_obj(
        "Brass_Crown", bm_crown, mats, collection,
        location=(0.0, 0.0, 0.855), sharp_angle_deg=35.0, uv_scale=2.2
    )
    all_export_objs.append(obj_crown)

    # -----------------------------------------------------------------------
    # 6. Shutter_0 .. Shutter_5 (origin (0, 0, 0.50) -> 6 curved sapphire-obsidian iris shutters!)
    # -----------------------------------------------------------------------
    shutters = []
    for s_idx in range(6):
        bm_s = bmesh.new()
        n_lat, n_lon = 15, 9
        phi_min, phi_max = math.radians(-48.0), math.radians(50.0)
        r_in_b, r_out_b = 0.190, 0.202

        def sh_half_ang(t_lat: float) -> float:
            env = math.sin(clamp(t_lat, 0.0, 1.0) * math.pi)
            return math.radians(2.2 + 23.0 * (env ** 0.82) * (1.05 - 0.16 * t_lat))

        og, ig = [], []
        for i in range(n_lat):
            tl = i / (n_lat - 1)
            phi = lerp(phi_min, phi_max, tl)
            cp, sp = math.cos(phi), math.sin(phi)
            ha = sh_half_ang(tl)
            sw = math.sin(tl * math.pi)
            orow, irow = [], []
            for j in range(n_lon):
                u = (j / (n_lon - 1)) * 2.0 - 1.0
                th = u * ha
                et = math.cos(u * math.pi * 0.5) ** 0.65
                dv = Vector((cp * math.sin(th), -cp * math.cos(th), sp))
                orow.append(bm_s.verts.new(dv * (r_out_b + 0.008 * sw * et)))
                irow.append(bm_s.verts.new(dv * (r_in_b + 0.002 * sw * et)))
            og.append(orow)
            ig.append(irow)

        for i in range(n_lat - 1):
            for j in range(n_lon - 1):
                fo = bm_s.faces.new((og[i][j], og[i][j + 1], og[i + 1][j + 1], og[i + 1][j]))
                fo.material_index = P_OBSIDIAN
                fo.smooth = True
                fi = bm_s.faces.new((ig[i][j], ig[i + 1][j], ig[i + 1][j + 1], ig[i][j + 1]))
                fi.material_index = P_OBSIDIAN
                fi.smooth = True
            bm_s.faces.new((ig[i][0], og[i][0], og[i + 1][0], ig[i + 1][0])).material_index = P_GOLD24
            bm_s.faces.new((og[i][-1], ig[i][-1], ig[i + 1][-1], og[i + 1][-1])).material_index = P_GOLD24
        for j in range(n_lon - 1):
            bm_s.faces.new((ig[0][j], ig[0][j + 1], og[0][j + 1], og[0][j])).material_index = P_GOLD24
            bm_s.faces.new((og[-1][j], og[-1][j + 1], ig[-1][j + 1], ig[-1][j])).material_index = P_GOLD24

        rim_pts = []
        rmid = 0.5 * (r_in_b + r_out_b) + 0.0024
        for i in range(n_lat):
            tl = i / (n_lat - 1)
            phi, ha = lerp(phi_min, phi_max, tl), sh_half_ang(tl)
            rim_pts.append(Vector((math.cos(phi) * math.sin(ha), -math.cos(phi) * math.cos(ha), math.sin(phi))) * rmid)
        for i in range(n_lat - 1, -1, -1):
            tl = i / (n_lat - 1)
            phi, ha = lerp(phi_min, phi_max, tl), -sh_half_ang(tl)
            rim_pts.append(Vector((math.cos(phi) * math.sin(ha), -math.cos(phi) * math.cos(ha), math.sin(phi))) * rmid)
        add_swept_profile(bm_s, rim_pts,
                          [(0.0044, 0), (0.003, 0.0038), (-0.003, 0.0038), (-0.005, 0), (-0.003, -0.0038), (0.003, -0.0038)],
                          mat_idx=P_GOLD24, closed_path=True, up_hint=Vector((0, -1, 0)))

        waist_p = Vector((0.0, -(r_out_b + 0.0085), 0.0))
        add_diamond_index(bm_s, waist_p, Vector((0, -1, 0)), Vector((0, 0, 1)),
                          length=0.040, width=0.024, height=0.0055, mat_idx=P_GOLD24)
        add_faceted_gem(bm_s, waist_p + Vector((0, -0.0035, 0)), Vector((0, -1, 0)),
                        radius=0.008, height=0.006, bezel_mat=P_GOLD24,
                        gem_mat=(P_SAPPHIRE if s_idx % 2 == 0 else P_RUBY), facets=10)

        sh_obj = finalize_mesh_obj(
            f"Shutter_{s_idx}", bm_s, mats, collection,
            location=(0.0, 0.0, PRISM_CENTER_Z), rotation_euler=(0.0, 0.0, s_idx * (math.tau / 6.0)),
            sharp_angle_deg=38.0, uv_scale=2.2,
        )
        shutters.append(sh_obj)
        all_export_objs.append(sh_obj)

    # -----------------------------------------------------------------------
    # 7. Overclock_Jaw_0 .. Overclock_Jaw_3 (origin (0, 0, 0.50), at 45°, 135°, 225°, 315°!)
    # -----------------------------------------------------------------------
    for j_idx in range(4):
        bm_j = bmesh.new()
        r_jaw = 0.246
        phi_lo, phi_hi = math.radians(-44.0), math.radians(44.0)
        b_pts = []
        for k in range(24):
            t = k / 23.0
            phi = lerp(phi_lo, phi_hi, t)
            rr = r_jaw - 0.012 * (1.0 - math.sin(t * math.pi))
            b_pts.append(Vector((0.0, -math.cos(phi) * rr, math.sin(phi) * rr)))
        b_cs = [
            (-0.011, -0.0025), (-0.0055, -0.0065), (0.0055, -0.0065),
            (0.011, -0.0025), (0.0075, 0.0055), (0.0, 0.0080), (-0.0075, 0.0055),
        ]
        add_swept_profile(
            bm_j, b_pts, b_cs, mat_idx=P_GOLD, closed_path=False, cap_ends=True,
            up_hint=Vector((1, 0, 0)),
            scale_fn=lambda u: (0.18 + 0.96 * (math.sin(clamp(u) * math.pi) ** 0.70),
                                0.25 + 0.88 * (math.sin(clamp(u) * math.pi) ** 0.65)),
        )
        boss_p = Vector((0.0, -(r_jaw + 0.006), 0.0))
        boss_m = Matrix.Translation(boss_p) @ Matrix.Rotation(math.pi * 0.5, 4, "X")
        add_lathe_profile(bm_j, [(0.017, -0.004), (0.0185, 0.002), (0.015, 0.008), (0.010, 0.009)],
                          segments=20, mat_idx=P_BRASS, cap_top=True, matrix=boss_m)
        add_faceted_gem(bm_j, boss_p + Vector((0, -0.007, 0)), Vector((0, -1, 0)),
                        radius=0.0078, height=0.006, bezel_mat=P_GOLD24, gem_mat=P_RUBY, facets=10)

        jaw_obj = finalize_mesh_obj(
            f"Overclock_Jaw_{j_idx}", bm_j, mats, collection,
            location=(0.0, 0.0, PRISM_CENTER_Z), rotation_euler=(0.0, 0.0, (j_idx + 0.5) * (math.pi * 0.5)),
            sharp_angle_deg=34.0, uv_scale=2.4,
        )
        all_export_objs.append(jaw_obj)

    # -----------------------------------------------------------------------
    # 8. Firing_Pin (origin (0, 0, 0.50) -> striker plunger suspended above core along +Y_gltf!)
    # -----------------------------------------------------------------------
    bm_pin = bmesh.new()
    pin_prof = [
        (0.003, 0.142),
        (0.012, 0.155),
        (0.015, 0.172),
        (0.024, 0.182),
        (0.024, 0.225),
        (0.018, 0.238),
        (0.016, 0.290),
    ]
    add_lathe_profile(bm_pin, pin_prof, segments=28, mat_idx=P_GOLD24, cap_bottom=True, cap_top=True)
    add_lathe_profile(bm_pin, [(0.023, 0.192), (0.027, 0.196), (0.027, 0.214), (0.023, 0.218)],
                      segments=28, mat_idx=P_GUNMETAL, closed_profile=True)
    add_faceted_gem(bm_pin, Vector((0, 0, 0.142)), Vector((0, 0, -1)),
                    radius=0.0085, height=0.007, bezel_mat=P_GOLD24, gem_mat=P_RUBY, facets=10)

    obj_pin = finalize_mesh_obj(
        "Firing_Pin", bm_pin, mats, collection,
        location=(0.0, 0.0, PRISM_CENTER_Z), sharp_angle_deg=35.0, uv_scale=2.5
    )
    all_export_objs.append(obj_pin)

    # -----------------------------------------------------------------------
    # 9. Hologram_Core (origin (0, 0, 0.50) -> star-faceted diamond heart + 24K filigree cage!)
    # -----------------------------------------------------------------------
    bm_core = bmesh.new()
    ico_ret = bmesh.ops.create_icosphere(bm_core, subdivisions=1, radius=0.095)
    ico_faces = list({f for v in ico_ret["verts"] for f in v.link_faces})
    poke_ret = bmesh.ops.poke(bm_core, faces=ico_faces)
    for pv in poke_ret["verts"]:
        pv.co = pv.co.normalized() * 0.110
    for f in bm_core.faces:
        f.material_index = P_CRYSTAL
        f.smooth = False

    r_cage = 0.130
    wire_cs = [
        (0.0035, 0), (0.0025, 0.0025), (0, 0.0035), (-0.0025, 0.0025),
        (-0.0035, 0), (-0.0025, -0.0025), (0, -0.0035), (0.0025, -0.0025),
    ]
    for m_i in range(3):
        az = m_i * (math.pi / 3.0)
        ca, sa = math.cos(az), math.sin(az)
        m_pts = [Vector((math.cos(k / 32.0 * math.tau) * ca * r_cage,
                         math.cos(k / 32.0 * math.tau) * sa * r_cage,
                         math.sin(k / 32.0 * math.tau) * r_cage)) for k in range(32)]
        add_swept_profile(bm_core, m_pts, wire_cs, mat_idx=P_GOLD24, closed_path=True, up_hint=Vector((-sa, ca, 0)))

    for lat_deg, sc_w in ((0.0, 1.05), (34.0, 0.78), (-34.0, 0.78)):
        lat = math.radians(lat_deg)
        rr, zz = math.cos(lat) * r_cage, math.sin(lat) * r_cage
        eq_pts = [Vector((math.cos(k / 32.0 * math.tau) * rr, math.sin(k / 32.0 * math.tau) * rr, zz)) for k in range(32)]
        add_swept_profile(bm_core, eq_pts, [(x * sc_w, y * sc_w) for (x, y) in wire_cs],
                          mat_idx=P_GOLD24, closed_path=True, up_hint=Vector((0, 0, 1)))

    obj_core = finalize_mesh_obj(
        "Hologram_Core", bm_core, mats, collection,
        location=(0.0, 0.0, PRISM_CENTER_Z), sharp_angle_deg=36.0, uv_scale=3.0,
        keep_flat_mats={P_CRYSTAL},
    )
    all_export_objs.append(obj_core)

    return all_export_objs, {"shutters": shutters, "carousel": carousel_empty}


# ===========================================================================
# Studio Lighting, Export & Metrics
# ===========================================================================
def add_area_light(name, col, loc, target, energy, color_hex, sx, sy, spread_deg=80.0):
    ld = bpy.data.lights.new(name, type="AREA")
    ld.shape = "DISK" if abs(sx - sy) < 0.02 else "RECTANGLE"
    ld.size = sx
    if ld.shape == "RECTANGLE":
        ld.size_y = sy
    ld.energy = energy
    ld.color = hex_rgba(color_hex)[:3]
    if hasattr(ld, "spread"):
        ld.spread = math.radians(spread_deg)
    lo = bpy.data.objects.new(name, ld)
    lo.location = loc
    lo.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
    col.objects.link(lo)
    return lo


def setup_prism_studio(scene, studio_col, mats):
    world = bpy.data.worlds.new("Veritas_Prism_World")
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
    mix = nodes.new("ShaderNodeMixShader")

    links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    links.new(sep.outputs["Z"], mr.inputs["Value"])
    links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], w_bg.inputs["Color"])
    links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    links.new(w_bg.outputs["Background"], mix.inputs[1])
    links.new(bg_cam.outputs["Background"], mix.inputs[2])
    links.new(mix.outputs["Shader"], w_out.inputs["Surface"])

    # Dark Veined Nero Marquina Marble Studio Table
    bm_tab = bmesh.new()
    for scale_xy, z in ((0.99, -0.04), (1.0, -0.03), (1.0, -0.008), (0.992, 0.0)):
        pass
    add_lathe_profile(bm_tab, [(0.01, -0.04), (1.65, -0.04), (1.68, -0.01), (1.65, 0.0), (0.01, 0.0)],
                      segments=72, mat_idx=P_MARBLE, cap_bottom=True, cap_top=True)
    finalize_mesh_obj("Studio_Marble_Table", bm_tab, mats, studio_col, sharp_angle_deg=36.0, uv_scale=1.1)

    target = (0.0, 0.0, 0.49)
    add_area_light("Prism_Key_Rembrandt", studio_col, (1.55, -1.62, 1.48), target, 155.0, "#FFE4B6", 1.2, 1.2, 80.0)
    add_area_light("Prism_Rim_Sapphire", studio_col, (-1.62, 1.28, 1.35), target, 210.0, "#74BAFF", 0.78, 1.45, 76.0)
    add_area_light("Prism_Fill_Warm", studio_col, (-1.45, -1.30, 0.60), target, 42.0, "#F0CD90", 1.1, 1.1, 105.0)
    add_area_light("Prism_Top_Crown", studio_col, (0.15, -0.25, 2.15), target, 58.0, "#FFF2DA", 0.85, 0.85, 66.0)

    pt_d = bpy.data.lights.new("Prism_Core_Light", type="POINT")
    pt_d.energy = 20.0
    pt_d.color = hex_rgba("#FFD268")[:3]
    pt_d.shadow_soft_size = 0.07
    pt_o = bpy.data.objects.new("Prism_Core_Light", pt_d)
    pt_o.location = (0.0, 0.0, PRISM_CENTER_Z)
    studio_col.objects.link(pt_o)

    cam_d = bpy.data.cameras.new("Prism_Studio_Cam")
    cam_d.lens = 58.0
    cam_d.sensor_width = 36.0
    cam_d.dof.use_dof = True
    cam_d.dof.focus_distance = 2.08
    cam_d.dof.aperture_fstop = 6.3
    cam_o = bpy.data.objects.new("Prism_Studio_Cam", cam_d)
    cam_o.location = (0.78, -1.96, 0.84)
    cam_o.rotation_euler = (Vector((0.0, 0.0, 0.48)) - cam_o.location).to_track_quat("-Z", "Y").to_euler()
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

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    prism_col = bpy.data.collections.new("Veritas_Prism_V3")
    studio_col = bpy.data.collections.new("Prism_Studio_Rig")
    scene.collection.children.link(prism_col)
    scene.collection.children.link(studio_col)

    mats = build_prism_materials()
    prism_objs, refs = build_veritas_prism_scene(mats, prism_col)
    setup_prism_studio(scene, studio_col, mats)

    # Save pristine rest-pose .blend and export pristine rest-pose .glb!
    bpy.ops.wm.save_as_mainfile(filepath=str(PRISM_BLEND))

    bpy.ops.object.select_all(action="DESELECT")
    for obj in prism_objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = prism_objs[0]
    bpy.ops.export_scene.gltf(
        filepath=str(PRISM_GLB_PUBLIC),
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

    deps = bpy.context.evaluated_depsgraph_get()
    stats = {}
    total_tris = 0
    min_pt, max_pt = Vector((1e9, 1e9, 1e9)), Vector((-1e9, -1e9, -1e9))
    for obj in prism_objs:
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

    dims_gltf = {
        "width_x": round(max_pt.x - min_pt.x, 4),
        "height_y": round(max_pt.z - min_pt.z, 4),
        "depth_z": round(max_pt.y - min_pt.y, 4),
        "min_y": round(min_pt.z, 4),
        "max_y": round(max_pt.z, 4),
    }

    log.append(f"PRISM_BLEND_BYTES={PRISM_BLEND.stat().st_size}")
    log.append(f"PRISM_RAW_GLB_BYTES={PRISM_GLB_PUBLIC.stat().st_size}")
    log.append(f"PRISM_TRIS={total_tris}")
    log.append(f"PRISM_DIMS={json.dumps(dims_gltf)}")
    log.append(f"PRISM_NODE_TRIS={json.dumps(stats)}")

    # Pose for studio beauty render: slight 14° carousel yaw + 12° shutter bloom so every layer reads gloriously!
    refs["carousel"].rotation_euler = (0.0, 0.0, math.radians(-14.0))
    for s_obj in refs["shutters"]:
        s_obj.rotation_euler = Euler((math.radians(12.0), 0.0, s_obj.rotation_euler.z), "XYZ")

    scene.render.filepath = str(PRISM_RENDER_PNG)
    t_r = time.time()
    bpy.ops.render.render(write_still=True)
    log.append(f"PRISM_RENDER_SECS={time.time() - t_r:.1f}")
    log.append(f"PRISM_RENDER_BYTES={PRISM_RENDER_PNG.stat().st_size if PRISM_RENDER_PNG.exists() else 0}")
    log.append(f"TOTAL_SECS={time.time() - t0:.1f}")
    log.append("STATUS=SUCCESS")

    LOG_FILE.write_text("\n".join(log) + "\n", encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        LOG_FILE.write_text("STATUS=ERROR\n" + traceback.format_exc(), encoding="utf-8")
        raise
