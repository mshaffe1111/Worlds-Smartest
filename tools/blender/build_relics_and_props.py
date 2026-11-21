"""
World's Smartest — Bespoke 3D Hero Relics, Stage Monolith & World Globe Gimbal Rig
Authored for Blender 5.3.0 (bpy / bmesh) — exports PBR .glb models for WebGL2 Three.js
and Godot 4.7.2, saves master .blend collection, and renders a 1440x810 studio showcase.

Invocation:
  blender-launcher.exe --background --python tools/blender/build_relics_and_props.py
"""

import bpy
import bmesh
import math
import os
import sys
import json
import struct
import shutil
import traceback
import numpy as np
from mathutils import Vector, Matrix, Euler

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))

OUT_WEB_DIR = os.path.join(REPO_ROOT, "public", "assets", "models")
OUT_GODOT_DIR = os.path.join(REPO_ROOT, "godot", "assets", "models")
OUT_BLEND_PATH = os.path.join(REPO_ROOT, "assets", "blender", "relics_collection.blend")
OUT_RENDER_PATH = os.path.join(REPO_ROOT, "assets", "renders", "relics_showcase.png")
OUT_LOG_PATH = os.path.join(REPO_ROOT, "assets", "renders", "relics_build.log")

for d in (OUT_WEB_DIR, OUT_GODOT_DIR, os.path.dirname(OUT_BLEND_PATH), os.path.dirname(OUT_RENDER_PATH)):
    os.makedirs(d, exist_ok=True)


# ---------------------------------------------------------------------------
# Procedural Seamless Micro-Textures (256x256, packed for compact PBR GLBs)
# ---------------------------------------------------------------------------
def _create_image(name: str, w: int, h: int, rgba_flat: np.ndarray, is_data: bool = True):
    img = bpy.data.images.new(name=name, width=w, height=h, alpha=False, float_buffer=False)
    img.pixels.foreach_set(rgba_flat.astype(np.float32))
    img.colorspace_settings.name = "Non-Color" if is_data else "sRGB"
    img.pack()
    return img


def build_procedural_textures():
    """Generates lightweight seamless 256x256 brushed-metal and carved-stone PBR maps."""
    rng = np.random.default_rng(20260530)
    size = 256
    y_grid, x_grid = np.mgrid[0:size, 0:size]

    # 1. Brushed metal anisotropic roughness + tangent-space normal
    row_noise = rng.normal(0.0, 1.0, (size, 1))
    fine_noise = rng.normal(0.0, 0.35, (size, size))
    # Horizontal blur via FFT for seamless brushed streaks
    freq_x = np.fft.fftfreq(size)[None, :]
    freq_y = np.fft.fftfreq(size)[:, None]
    fft_fine = np.fft.fft2(fine_noise)
    kernel_brush = np.exp(-((freq_x * 48.0) ** 2 + (freq_y * 2.2) ** 2))
    streaks = np.real(np.fft.ifft2(fft_fine * kernel_brush))
    streaks = streaks / (np.std(streaks) + 1e-6)
    brush_h = 0.65 * streaks + 0.35 * np.repeat(row_noise, size, axis=1)
    brush_h = (brush_h - brush_h.min()) / (brush_h.max() - brush_h.min() + 1e-6)

    # Brushed roughness (0.16..0.30 baked directly around neutral range)
    br_r = np.clip(0.18 + 0.12 * brush_h, 0.0, 1.0)
    rgba_br_r = np.ones((size, size, 4), dtype=np.float32)
    rgba_br_r[:, :, 0] = br_r
    rgba_br_r[:, :, 1] = br_r
    rgba_br_r[:, :, 2] = br_r
    tex_brushed_rough = _create_image("Tex_Brushed_Rough", size, size, rgba_br_r.ravel(), is_data=True)

    # Brushed normal map
    dx = np.roll(brush_h, -1, axis=1) - np.roll(brush_h, 1, axis=1)
    dy = np.roll(brush_h, -1, axis=0) - np.roll(brush_h, 1, axis=0)
    strength = 0.65
    nx = -dx * strength
    ny = -dy * strength
    nz = np.ones_like(nx)
    nlen = np.sqrt(nx * nx + ny * ny + nz * nz) + 1e-6
    rgba_br_n = np.ones((size, size, 4), dtype=np.float32)
    rgba_br_n[:, :, 0] = 0.5 + 0.5 * (nx / nlen)
    rgba_br_n[:, :, 1] = 0.5 + 0.5 * (ny / nlen)
    rgba_br_n[:, :, 2] = 0.5 + 0.5 * (nz / nlen)
    tex_brushed_norm = _create_image("Tex_Brushed_Norm", size, size, rgba_br_n.ravel(), is_data=True)

    # 2. Carved mineral / sandstone / basalt micro-grain normal + roughness
    stone_raw = rng.normal(0.0, 1.0, (size, size))
    fft_stone = np.fft.fft2(stone_raw)
    r2 = freq_x * freq_x + freq_y * freq_y
    f_low = np.exp(-r2 * 120.0)
    f_mid = np.exp(-r2 * 22.0)
    f_hi = np.exp(-r2 * 4.0)
    stone_h = (
        0.45 * np.real(np.fft.ifft2(fft_stone * f_low))
        + 0.35 * np.real(np.fft.ifft2(fft_stone * f_mid))
        + 0.20 * np.real(np.fft.ifft2(fft_stone * f_hi))
    )
    stone_h = (stone_h - stone_h.min()) / (stone_h.max() - stone_h.min() + 1e-6)

    st_r = np.clip(0.55 + 0.28 * stone_h, 0.0, 1.0)
    rgba_st_r = np.ones((size, size, 4), dtype=np.float32)
    rgba_st_r[:, :, 0] = st_r
    rgba_st_r[:, :, 1] = st_r
    rgba_st_r[:, :, 2] = st_r
    tex_stone_rough = _create_image("Tex_Stone_Rough", size, size, rgba_st_r.ravel(), is_data=True)

    sdx = np.roll(stone_h, -1, axis=1) - np.roll(stone_h, 1, axis=1)
    sdy = np.roll(stone_h, -1, axis=0) - np.roll(stone_h, 1, axis=0)
    sstr = 1.35
    snx = -sdx * sstr
    sny = -sdy * sstr
    snz = np.ones_like(snx)
    snlen = np.sqrt(snx * snx + sny * sny + snz * snz) + 1e-6
    rgba_st_n = np.ones((size, size, 4), dtype=np.float32)
    rgba_st_n[:, :, 0] = 0.5 + 0.5 * (snx / snlen)
    rgba_st_n[:, :, 1] = 0.5 + 0.5 * (sny / snlen)
    rgba_st_n[:, :, 2] = 0.5 + 0.5 * (snz / snlen)
    tex_stone_norm = _create_image("Tex_Stone_Norm", size, size, rgba_st_n.ravel(), is_data=True)

    return {
        "brushed_rough": tex_brushed_rough,
        "brushed_norm": tex_brushed_norm,
        "stone_rough": tex_stone_rough,
        "stone_norm": tex_stone_norm,
    }


def _srgb_to_linear(hex_str: str):
    h = hex_str.lstrip("#")
    r, g, b = (int(h[i:i+2], 16) / 255.0 for i in (0, 2, 4))
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b), 1.0)


def make_pbr_material(
    name: str,
    base_hex: str,
    metallic: float = 0.0,
    roughness: float = 0.35,
    coat: float = 0.0,
    coat_roughness: float = 0.1,
    emission_hex: str = None,
    emission_strength: float = 0.0,
    norm_tex=None,
    norm_strength: float = 0.18,
    rough_tex=None,
    uv_scale: float = 2.0,
):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nt.nodes.clear()

    out = nt.nodes.new("ShaderNodeOutputMaterial")
    out.location = (450, 0)

    bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (120, 0)
    bsdf.inputs["Base Color"].default_value = _srgb_to_linear(base_hex)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if "Coat Weight" in bsdf.inputs and coat > 0.0:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = coat_roughness
    if emission_hex and emission_strength > 0.0:
        bsdf.inputs["Emission Color"].default_value = _srgb_to_linear(emission_hex)
        bsdf.inputs["Emission Strength"].default_value = emission_strength

    nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    if norm_tex is not None or rough_tex is not None:
        tc = nt.nodes.new("ShaderNodeTexCoord")
        tc.location = (-750, -100)
        mp = nt.nodes.new("ShaderNodeMapping")
        mp.location = (-560, -100)
        mp.inputs["Scale"].default_value = (uv_scale, uv_scale, uv_scale)
        nt.links.new(tc.outputs["UV"], mp.inputs["Vector"])

        if norm_tex is not None:
            ti_n = nt.nodes.new("ShaderNodeTexImage")
            ti_n.location = (-340, -260)
            ti_n.image = norm_tex
            nmap = nt.nodes.new("ShaderNodeNormalMap")
            nmap.location = (-80, -260)
            nmap.inputs["Strength"].default_value = norm_strength
            nt.links.new(mp.outputs["Vector"], ti_n.inputs["Vector"])
            nt.links.new(ti_n.outputs["Color"], nmap.inputs["Color"])
            nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])

        if rough_tex is not None:
            ti_r = nt.nodes.new("ShaderNodeTexImage")
            ti_r.location = (-340, 60)
            ti_r.image = rough_tex
            # Direct link exports cleanly to glTF metallicRoughnessTexture
            nt.links.new(mp.outputs["Vector"], ti_r.inputs["Vector"])
            nt.links.new(ti_r.outputs["Color"], bsdf.inputs["Roughness"])

    return mat


def build_material_library(textures):
    bn = textures["brushed_norm"]
    br = textures["brushed_rough"]
    sn = textures["stone_norm"]
    sr = textures["stone_rough"]

    return {
        # Sovereign Modernism Core Palette
        "brass": make_pbr_material(
            "Mat_Brushed_Brass", "#E8C474", metallic=0.94, roughness=0.22,
            coat=0.15, coat_roughness=0.14, norm_tex=bn, norm_strength=0.16, rough_tex=br, uv_scale=2.5
        ),
        "gold_polished": make_pbr_material(
            "Mat_Sovereign_Gold", "#F5D782", metallic=0.97, roughness=0.14,
            coat=0.25, coat_roughness=0.08, norm_tex=bn, norm_strength=0.08, uv_scale=3.0
        ),
        "bronze": make_pbr_material(
            "Mat_Antique_Bronze", "#9E753E", metallic=0.89, roughness=0.30,
            coat=0.12, coat_roughness=0.22, norm_tex=bn, norm_strength=0.22, uv_scale=2.4
        ),
        "obsidian": make_pbr_material(
            "Mat_Honed_Obsidian", "#0B101C", metallic=0.28, roughness=0.17,
            coat=0.70, coat_roughness=0.07, norm_tex=sn, norm_strength=0.06, uv_scale=2.0
        ),
        "obsidian_matte": make_pbr_material(
            "Mat_Obsidian_Satin", "#121826", metallic=0.32, roughness=0.28,
            coat=0.35, coat_roughness=0.14, norm_tex=sn, norm_strength=0.10, uv_scale=2.2
        ),
        "titanium": make_pbr_material(
            "Mat_Brushed_Titanium", "#5B6A80", metallic=0.91, roughness=0.26,
            coat=0.12, coat_roughness=0.16, norm_tex=bn, norm_strength=0.18, rough_tex=br, uv_scale=3.0
        ),
        "platinum": make_pbr_material(
            "Mat_Satin_Platinum", "#D8E0EC", metallic=0.96, roughness=0.18,
            coat=0.20, coat_roughness=0.10, norm_tex=bn, norm_strength=0.12, rough_tex=br, uv_scale=2.8
        ),
        "ceramic": make_pbr_material(
            "Mat_Niemeyer_Ceramic", "#ECEEEB", metallic=0.04, roughness=0.22,
            coat=0.60, coat_roughness=0.08, norm_tex=sn, norm_strength=0.05, uv_scale=2.0
        ),
        "sandstone": make_pbr_material(
            "Mat_Egyptian_Sandstone", "#C9A878", metallic=0.02, roughness=0.66,
            norm_tex=sn, norm_strength=0.38, rough_tex=sr, uv_scale=3.0
        ),
        "basalt": make_pbr_material(
            "Mat_Volcanic_Basalt", "#2D3545", metallic=0.14, roughness=0.58,
            coat=0.15, coat_roughness=0.35, norm_tex=sn, norm_strength=0.42, rough_tex=sr, uv_scale=3.2
        ),
        "lapis": make_pbr_material(
            "Mat_Lapis_Lazuli", "#1D4FA8", metallic=0.16, roughness=0.18,
            coat=0.55, coat_roughness=0.08, norm_tex=sn, norm_strength=0.09, uv_scale=2.5
        ),
        "copper": make_pbr_material(
            "Mat_Burnished_Copper", "#C97546", metallic=0.92, roughness=0.23,
            norm_tex=bn, norm_strength=0.15, uv_scale=2.5
        ),
        "pearl": make_pbr_material(
            "Mat_Moon_Pearl", "#EFE8DA", metallic=0.14, roughness=0.15,
            coat=0.75, coat_roughness=0.06
        ),
        "cryo_glass": make_pbr_material(
            "Mat_Frosted_CryoGlass", "#62D6EC", metallic=0.14, roughness=0.18,
            coat=0.90, coat_roughness=0.05, emission_hex="#36C8E8", emission_strength=0.45
        ),
        # Luminous Emissive Cores (AgX-balanced so rich jewel saturation holds cleanly in EEVEE, Three.js & Godot)
        "glow_gold": make_pbr_material(
            "Mat_Crystal_ChampagneGold", "#F5D47A", metallic=0.28, roughness=0.10,
            coat=0.90, coat_roughness=0.05, emission_hex="#F0C65E", emission_strength=1.55
        ),
        "glow_kintsugi": make_pbr_material(
            "Mat_Kintsugi_SeamGold", "#F5C249", metallic=0.75, roughness=0.14,
            emission_hex="#F2A82E", emission_strength=1.85
        ),
        "glow_vermilion": make_pbr_material(
            "Mat_Origami_Heart", "#D92818", metallic=0.18, roughness=0.11,
            coat=0.85, coat_roughness=0.04, emission_hex="#F0361E", emission_strength=1.55
        ),
        "glow_emerald": make_pbr_material(
            "Mat_Rio_EmeraldCrystal", "#059652", metallic=0.18, roughness=0.08,
            coat=0.95, coat_roughness=0.04, emission_hex="#0AD472", emission_strength=1.15
        ),
        "glow_aurora": make_pbr_material(
            "Mat_Reykjavik_AuroraCore", "#0DD4A8", metallic=0.14, roughness=0.10,
            coat=0.88, coat_roughness=0.05, emission_hex="#10E2B4", emission_strength=1.45
        ),
        "glow_cyan": make_pbr_material(
            "Mat_Sovereign_CyanField", "#44CBE8", metallic=0.22, roughness=0.14,
            emission_hex="#38C6E8", emission_strength=1.50
        ),
        "glow_amber": make_pbr_material(
            "Mat_Cairo_SolarAmber", "#F09C28", metallic=0.28, roughness=0.14,
            emission_hex="#F59620", emission_strength=1.65
        ),
        "glow_trim": make_pbr_material(
            "Mat_Broadcast_LightStrip", "#F7D982", metallic=0.22, roughness=0.16,
            emission_hex="#F2CE6C", emission_strength=1.60
        ),
        # Studio stage materials (only used in showcase scene, never exported into GLBs)
        "studio_floor": make_pbr_material(
            "Mat_Studio_Floor", "#090D16", metallic=0.18, roughness=0.34,
            coat=0.35, coat_roughness=0.20, norm_tex=sn, norm_strength=0.04, uv_scale=8.0
        ),
        "studio_plinth": make_pbr_material(
            "Mat_Studio_Plinth", "#0D1320", metallic=0.30, roughness=0.22,
            coat=0.55, coat_roughness=0.10
        ),
    }


# ---------------------------------------------------------------------------
# Hard-Surface BMesh Geometry Craft Utilities
# ---------------------------------------------------------------------------
def apply_box_uv(bm, scale: float = 1.0):
    """Assigns distortion-free triplanar box-projected UVs to every loop in a bmesh."""
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


def finalize_bmesh_object(
    name: str,
    bm: bmesh.types.BMesh,
    mat,
    col,
    parent=None,
    location=(0.0, 0.0, 0.0),
    rotation=(0.0, 0.0, 0.0),
    smooth: bool = True,
    weighted_normal: bool = True,
    sharp_angle_deg: float = 44.0,
    bevel_width: float = 0.0,
    bevel_segs: int = 2,
    subsurf_levels: int = 0,
    uv_scale: float = 1.4,
):
    """Converts a bmesh into a clean Blender object with proper UVs, normals & modifiers."""
    bmesh.ops.remove_doubles(bm, verts=list(bm.verts), dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    apply_box_uv(bm, scale=uv_scale)

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

    if bevel_width > 0.0:
        bmod = obj.modifiers.new("Bevel", "BEVEL")
        bmod.width = bevel_width
        bmod.segments = bevel_segs
        bmod.limit_method = "ANGLE"
        bmod.angle_limit = math.radians(30.0)
        bmod.use_clamp_overlap = True

    if subsurf_levels > 0:
        smod = obj.modifiers.new("Subsurf", "SUBSURF")
        smod.levels = subsurf_levels
        smod.render_levels = subsurf_levels

    if smooth and weighted_normal:
        wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
        wn.weight = 50
        wn.keep_sharp = True
    elif smooth and sharp_angle_deg < 179.0:
        # Edge split fallback when weighted normals disabled
        es = obj.modifiers.new("EdgeSplit", "EDGE_SPLIT")
        es.split_angle = math.radians(sharp_angle_deg)
        es.use_edge_angle = True

    return obj


def bm_lathe(profile_rz, segs: int = 48, closed_profile: bool = True, cap_ends: bool = False):
    """
    Revolves a 2D (radius, z) profile around the Z axis cleanly.
    profile_rz should wind counter-clockwise in the (r, z) plane for outward normals.
    """
    bm = bmesh.new()
    n_pts = len(profile_rz)
    rings = []
    for i in range(segs):
        a = (2.0 * math.pi * i) / segs
        ca, sa = math.cos(a), math.sin(a)
        ring = []
        for (r, z) in profile_rz:
            rr = max(r, 1e-4)
            ring.append(bm.verts.new((rr * ca, rr * sa, z)))
        rings.append(ring)

    for i in range(segs):
        ni = (i + 1) % segs
        r0 = rings[i]
        r1 = rings[ni]
        p_count = n_pts if closed_profile else n_pts - 1
        for j in range(p_count):
            nj = (j + 1) % n_pts
            try:
                bm.faces.new((r0[j], r1[j], r1[nj], r0[nj]))
            except ValueError:
                pass

    if cap_ends and not closed_profile:
        bm.faces.new([r[0] for r in reversed(rings)])
        bm.faces.new([r[-1] for r in rings])

    bm.verts.index_update()
    return bm


def chamfered_rect_profile(r_in: float, r_out: float, z_half: float, ch: float = 0.008):
    """Returns a beveled 8-point (r, z) ring cross-section profile."""
    c = min(ch, (r_out - r_in) * 0.35, z_half * 0.45)
    return [
        (r_in + c, -z_half),
        (r_out - c, -z_half),
        (r_out, -z_half + c),
        (r_out, z_half - c),
        (r_out - c, z_half),
        (r_in + c, z_half),
        (r_in, z_half - c),
        (r_in, -z_half + c),
    ]


def stepped_ring_profile(r_in: float, r_out: float, z_half: float, step_r: float = 0.012, step_z: float = 0.009):
    """Architectural double-stepped chamfered ring profile (horology/monument feel)."""
    rm_in = r_in + step_r
    rm_out = r_out - step_r
    zh_in = z_half - step_z
    return [
        (rm_in, -z_half),
        (rm_out, -z_half),
        (rm_out + step_r * 0.5, -zh_in),
        (r_out, -zh_in * 0.65),
        (r_out, zh_in * 0.65),
        (rm_out + step_r * 0.5, zh_in),
        (rm_out, z_half),
        (rm_in, z_half),
        (rm_in - step_r * 0.5, zh_in),
        (r_in, zh_in * 0.65),
        (r_in, -zh_in * 0.65),
        (rm_in - step_r * 0.5, -zh_in),
    ]


def bm_add_beveled_box(bm, sx: float, sy: float, sz: float, matrix: Matrix = None, bevel: float = 0.006, segs: int = 1):
    """Adds a cleanly beveled architectural box into an existing bmesh at transform `matrix`."""
    tmp = bmesh.new()
    bmesh.ops.create_cube(tmp, size=1.0)
    bmesh.ops.scale(tmp, vec=(sx, sy, sz), verts=list(tmp.verts))
    if bevel > 0.0:
        bmesh.ops.bevel(
            tmp,
            geom=list(tmp.edges),
            offset=min(bevel, min(sx, sy, sz) * 0.32),
            segments=segs,
            affect="EDGES",
            clamp_overlap=True,
        )
    if matrix is not None:
        bmesh.ops.transform(tmp, matrix=matrix, verts=list(tmp.verts))
    # Merge tmp into bm
    vert_map = {}
    for v in tmp.verts:
        vert_map[v] = bm.verts.new(v.co)
    for f in tmp.faces:
        try:
            bm.faces.new([vert_map[v] for v in f.verts])
        except ValueError:
            pass
    tmp.free()


def bm_add_prism_cyl(bm, r_bot: float, r_top: float, height: float, segs: int = 8, matrix: Matrix = None, bevel: float = 0.005):
    """Adds a beveled polygonal cylinder / prism into bm."""
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
        # Bevel cap rim edges and sharp side edges if low-poly
        cap_edges = [e for e in tmp.edges if e.calc_face_angle(0.0) > math.radians(32.0)]
        if cap_edges:
            bmesh.ops.bevel(
                tmp,
                geom=cap_edges,
                offset=min(bevel, min(r_bot, r_top, height) * 0.3),
                segments=1,
                affect="EDGES",
                clamp_overlap=True,
            )
    if matrix is not None:
        bmesh.ops.transform(tmp, matrix=matrix, verts=list(tmp.verts))
    vert_map = {v: bm.verts.new(v.co) for v in tmp.verts}
    for f in tmp.faces:
        try:
            bm.faces.new([vert_map[v] for v in f.verts])
        except ValueError:
            pass
    tmp.free()


def bm_add_sphere(bm, radius: float, segs: int = 24, rings: int = 16, matrix: Matrix = None):
    tmp = bmesh.new()
    bmesh.ops.create_uvsphere(tmp, u_segments=segs, v_segments=rings, radius=radius)
    if matrix is not None:
        bmesh.ops.transform(tmp, matrix=matrix, verts=list(tmp.verts))
    vert_map = {v: bm.verts.new(v.co) for v in tmp.verts}
    for f in tmp.faces:
        try:
            bm.faces.new([vert_map[v] for v in f.verts])
        except ValueError:
            pass
    tmp.free()


def bm_add_icosphere(bm, radius: float, subdivisions: int = 2, matrix: Matrix = None, bevel: float = 0.0):
    tmp = bmesh.new()
    bmesh.ops.create_icosphere(tmp, subdivisions=subdivisions, radius=radius)
    if bevel > 0.0:
        bmesh.ops.bevel(
            tmp,
            geom=list(tmp.edges),
            offset=bevel,
            segments=1,
            affect="EDGES",
            clamp_overlap=True,
        )
    if matrix is not None:
        bmesh.ops.transform(tmp, matrix=matrix, verts=list(tmp.verts))
    vert_map = {v: bm.verts.new(v.co) for v in tmp.verts}
    for f in tmp.faces:
        try:
            bm.faces.new([vert_map[v] for v in f.verts])
        except ValueError:
            pass
    tmp.free()


def bm_sweep_tube(bm, points, profile_xy, closed: bool = False, cap_ends: bool = True, scales=None):
    """
    Sweeps a 2D polygonal cross-section `profile_xy` cleanly along 3D `points`
    using parallel-transport frames (zero flipping / twisting artifacts).
    """
    n = len(points)
    pts = [Vector(p) for p in points]
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
        if t.length < 1e-7:
            t = Vector((0.0, 0.0, 1.0))
        tangents.append(t.normalized())

    # Initial frame
    up_hint = Vector((0.0, 0.0, 1.0))
    if abs(tangents[0].dot(up_hint)) > 0.92:
        up_hint = Vector((1.0, 0.0, 0.0))
    normal = tangents[0].cross(up_hint).normalized()
    binormal = tangents[0].cross(normal).normalized()

    frames = [(normal, binormal)]
    for i in range(1, n):
        t_prev = tangents[i - 1]
        t_cur = tangents[i]
        rot_axis = t_prev.cross(t_cur)
        if rot_axis.length > 1e-6:
            angle = math.acos(max(-1.0, min(1.0, t_prev.dot(t_cur))))
            q = Matrix.Rotation(angle, 3, rot_axis.normalized())
            normal = (q @ normal).normalized()
        normal = (normal - t_cur * normal.dot(t_cur)).normalized()
        binormal = t_cur.cross(normal).normalized()
        frames.append((normal, binormal))

    rings = []
    for i in range(n):
        p = pts[i]
        n_v, b_v = frames[i]
        sc = scales[i] if scales is not None else 1.0
        ring = []
        for (px, py) in profile_xy:
            co = p + n_v * (px * sc) + b_v * (py * sc)
            ring.append(bm.verts.new(co))
        rings.append(ring)

    m = len(profile_xy)
    seg_count = n if closed else n - 1
    for i in range(seg_count):
        r0 = rings[i]
        r1 = rings[(i + 1) % n]
        for j in range(m):
            nj = (j + 1) % m
            try:
                bm.faces.new((r0[j], r1[j], r1[nj], r0[nj]))
            except ValueError:
                pass

    if cap_ends and not closed:
        try:
            bm.faces.new(list(reversed(rings[0])))
            bm.faces.new(rings[-1])
        except ValueError:
            pass


def bm_add_sector_prism(bm, r_in: float, r_out: float, z0: float, z1: float, a0: float, a1: float, segs: int = 16, matrix: Matrix = None, bevel: float = 0.006):
    """Adds a curved architectural annular sector prism (for medallions & dial lugs)."""
    tmp = bmesh.new()
    bot_in, bot_out, top_in, top_out = [], [], [], []
    for i in range(segs + 1):
        a = a0 + (a1 - a0) * (i / segs)
        ca, sa = math.cos(a), math.sin(a)
        bot_in.append(tmp.verts.new((r_in * ca, r_in * sa, z0)))
        bot_out.append(tmp.verts.new((r_out * ca, r_out * sa, z0)))
        top_in.append(tmp.verts.new((r_in * ca, r_in * sa, z1)))
        top_out.append(tmp.verts.new((r_out * ca, r_out * sa, z1)))

    for i in range(segs):
        tmp.faces.new((bot_in[i], bot_out[i], bot_out[i + 1], bot_in[i + 1]))  # bottom
        tmp.faces.new((top_in[i], top_in[i + 1], top_out[i + 1], top_out[i]))  # top
        tmp.faces.new((bot_out[i], top_out[i], top_out[i + 1], bot_out[i + 1]))  # outer
        tmp.faces.new((bot_in[i], bot_in[i + 1], top_in[i + 1], top_in[i]))  # inner

    # End caps
    tmp.faces.new((bot_in[0], top_in[0], top_out[0], bot_out[0]))
    tmp.faces.new((bot_in[-1], bot_out[-1], top_out[-1], top_in[-1]))

    bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
    if bevel > 0.0:
        sharp = [e for e in tmp.edges if e.calc_face_angle(0.0) > math.radians(32.0)]
        if sharp:
            bmesh.ops.bevel(
                tmp,
                geom=sharp,
                offset=min(bevel, abs(z1 - z0) * 0.28, (r_out - r_in) * 0.22),
                segments=1,
                affect="EDGES",
                clamp_overlap=True,
            )
    if matrix is not None:
        bmesh.ops.transform(tmp, matrix=matrix, verts=list(tmp.verts))
    vert_map = {v: bm.verts.new(v.co) for v in tmp.verts}
    for f in tmp.faces:
        try:
            bm.faces.new([vert_map[v] for v in f.verts])
        except ValueError:
            pass
    tmp.free()


def bm_faceted_crystal(radius: float, height: float, sides: int = 8, girdle_ratio: float = 0.22, crown_ratio: float = 0.56, bevel: float = 0.005):
    """Builds a precision multi-faceted brilliant-cut gemstone bipyramid crystal."""
    bm = bmesh.new()
    hz = height * 0.5
    gz = hz * girdle_ratio
    cz = hz * crown_ratio
    r_g = radius
    r_c = radius * 0.72

    v_top = bm.verts.new((0.0, 0.0, hz))
    v_bot = bm.verts.new((0.0, 0.0, -hz))

    ring_cu = []
    ring_gu = []
    ring_gl = []
    ring_cl = []
    for i in range(sides):
        a = (2.0 * math.pi * i) / sides
        a_half = a + math.pi / sides
        ring_cu.append(bm.verts.new((r_c * math.cos(a_half), r_c * math.sin(a_half), cz)))
        ring_gu.append(bm.verts.new((r_g * math.cos(a), r_g * math.sin(a), gz)))
        ring_gl.append(bm.verts.new((r_g * math.cos(a), r_g * math.sin(a), -gz)))
        ring_cl.append(bm.verts.new((r_c * math.cos(a_half), r_c * math.sin(a_half), -cz)))

    for i in range(sides):
        ni = (i + 1) % sides
        bm.faces.new((v_top, ring_cu[i], ring_cu[ni]))
        bm.faces.new((ring_cu[i], ring_gu[i], ring_gu[ni]))
        bm.faces.new((ring_cu[i], ring_gu[ni], ring_cu[ni]))
        bm.faces.new((ring_gu[i], ring_gl[i], ring_gl[ni], ring_gu[ni]))
        bm.faces.new((ring_gl[i], ring_cl[i], ring_gl[ni]))
        bm.faces.new((ring_cl[i], ring_cl[ni], ring_gl[ni]))
        bm.faces.new((v_bot, ring_cl[ni], ring_cl[i]))

    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    if bevel > 0.0:
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=bevel, segments=1, affect="EDGES", clamp_overlap=True)
    return bm


def bm_toothed_gear(r_in: float, r_base: float, r_tip: float, z_half: float, num_teeth: int, tooth_duty: float = 0.44):
    """Builds a precision radial spur gear / notched horological ring in bmesh."""
    bm = bmesh.new()
    step = (2.0 * math.pi) / num_teeth
    half_t = step * tooth_duty * 0.5
    slope = step * 0.07

    outer_pts = []
    inner_pts = []
    for i in range(num_teeth):
        a0 = i * step
        angles_r = [
            (a0 - half_t - slope, r_base),
            (a0 - half_t, r_tip),
            (a0 + half_t, r_tip),
            (a0 + half_t + slope, r_base),
        ]
        for ang, rad in angles_r:
            ca, sa = math.cos(ang), math.sin(ang)
            outer_pts.append((rad * ca, rad * sa))
            inner_pts.append((r_in * ca, r_in * sa))

    n = len(outer_pts)
    ob = [bm.verts.new((x, y, -z_half)) for (x, y) in outer_pts]
    ot = [bm.verts.new((x, y, z_half)) for (x, y) in outer_pts]
    ib = [bm.verts.new((x, y, -z_half)) for (x, y) in inner_pts]
    it = [bm.verts.new((x, y, z_half)) for (x, y) in inner_pts]

    for i in range(n):
        ni = (i + 1) % n
        bm.faces.new((ob[i], ob[ni], ot[ni], ot[i]))
        bm.faces.new((ib[i], it[i], it[ni], ib[ni]))
        bm.faces.new((it[i], ot[i], ot[ni], it[ni]))
        bm.faces.new((ib[i], ib[ni], ob[ni], ob[i]))

    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    return bm


def make_collection(name: str, parent_col=None):
    col = bpy.data.collections.new(name)
    (parent_col or bpy.context.scene.collection).children.link(col)
    return col


def make_root_empty(name: str, col):
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = "PLAIN_AXES"
    empty.empty_display_size = 0.25
    col.objects.link(empty)
    return empty


def get_hierarchy_stats(root_obj):
    """Computes evaluated triangle count, AABB, and bounding sphere radius of an asset."""
    deps = bpy.context.evaluated_depsgraph_get()
    total_tris = 0
    min_v = Vector((1e9, 1e9, 1e9))
    max_v = Vector((-1e9, -1e9, -1e9))
    max_r = 0.0

    objs = [o for o in bpy.data.objects if o.type == "MESH" and (o == root_obj or o.parent == root_obj)]
    for obj in objs:
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
            max_r = max(max_r, wco.length)
        ev.to_mesh_clear()

    return total_tris, min_v, max_v, max_r


def clamp_relic_bounds(root_obj, target_max_radius: float = 0.84):
    """Centers relic gently if needed and scales cleanly into [-0.85, +0.85] bounding radius."""
    bpy.context.view_layer.update()
    _, min_v, max_v, max_r = get_hierarchy_stats(root_obj)
    if max_r > target_max_radius:
        scale_factor = target_max_radius / max_r
        for obj in bpy.data.objects:
            if obj.parent == root_obj:
                obj.location *= scale_factor
                obj.scale *= scale_factor
        bpy.context.view_layer.update()
    return get_hierarchy_stats(root_obj)


# ---------------------------------------------------------------------------
# RELIC 1: Geneva — Meridian Astrolabe (relic_meridian_astrolabe.glb)
# ---------------------------------------------------------------------------
def build_relic_meridian_astrolabe(mats):
    col = make_collection("Relic_Meridian_Astrolabe")
    root = make_root_empty("Meridian_Astrolabe_Root", col)

    # 1. Outer Meridian Ring (r = 0.72..0.78) in vertical XZ plane (faces -Y camera!)
    outer_rot = (math.pi / 2, 0.0, 0.0)
    bm_outer = bm_lathe(stepped_ring_profile(0.69, 0.77, 0.036, 0.014, 0.010), segs=44)
    # 36 precision notched degree teeth around perimeter
    for i in range(36):
        a = (2.0 * math.pi * i) / 36
        is_card = (i % 9 == 0)
        is_major = (i % 3 == 0)
        r_mid = 0.785 if not is_card else 0.798
        sz = 0.028 if is_major else 0.018
        sx = 0.032 if is_card else (0.022 if is_major else 0.016)
        sy = 0.044 if is_card else 0.026
        m = Matrix.Translation((math.cos(a) * r_mid, math.sin(a) * r_mid, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_outer, sx, sy, sz, matrix=m, bevel=0.004 if is_major else 0.0, segs=1)

    # Sculpted Swiss watch crown / suspension finial at top (+Y in ring local -> +Z in world)
    bm_add_prism_cyl(
        bm_outer, 0.055, 0.038, 0.055, segs=12,
        matrix=Matrix.Translation((0.0, 0.795, 0.0)) @ Matrix.Rotation(math.pi / 2, 4, "X"),
        bevel=0.006,
    )
    finalize_bmesh_object("Astrolabe_Outer_Ring", bm_outer, mats["brass"], col, parent=root, rotation=outer_rot)

    # 4 cardinal jewel bezels on outer ring
    bm_jewels = bmesh.new()
    for i in range(4):
        a = i * math.pi / 2
        m = Matrix.Translation((math.cos(a) * 0.73, math.sin(a) * 0.73, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_jewels, 0.042, 0.042, 0.086, matrix=m, bevel=0.008, segs=1)
    finalize_bmesh_object("Astrolabe_Cardinal_Gems", bm_jewels, mats["glow_gold"], col, parent=root, rotation=outer_rot, smooth=False)

    # 2. Second Ecliptic Bronze Ring (r = 0.56..0.63, tilted)
    eclip_rot = (math.radians(62), math.radians(24), math.radians(15))
    bm_eclip = bm_lathe(chamfered_rect_profile(0.56, 0.63, 0.028, 0.007), segs=40)
    for i in range(24):
        a = (2.0 * math.pi * i) / 24
        m = Matrix.Translation((math.cos(a) * 0.595, math.sin(a) * 0.595, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_eclip, 0.016, 0.014, 0.068, matrix=m, bevel=0.0, segs=1)
    # Pivot trunnions anchoring into outer ring
    for side in (-1.0, 1.0):
        m = Matrix.Translation((side * 0.665, 0.0, 0.0)) @ Matrix.Rotation(math.pi / 2, 4, "Y")
        bm_add_prism_cyl(bm_eclip, 0.024, 0.020, 0.08, segs=10, matrix=m, bevel=0.003)
    finalize_bmesh_object("Astrolabe_Ecliptic_Ring", bm_eclip, mats["bronze"], col, parent=root, rotation=eclip_rot)

    # 3. Third Horological Geared Ring (r = 0.42..0.49) + 3 Curved Meridian Pointer Struts
    gear_rot = (math.radians(-42), math.radians(38), math.radians(-20))
    bm_gear = bm_toothed_gear(0.41, 0.47, 0.505, 0.018, num_teeth=18, tooth_duty=0.40)
    # 3 sweeping curved meridian pointer struts arching inward toward the core cage
    strut_prof = [(-0.012, -0.010), (0.012, -0.010), (0.016, 0.0), (0.012, 0.010), (-0.012, 0.010), (-0.016, 0.0)]
    for k in range(3):
        base_a = k * (2.0 * math.pi / 3.0)
        pts = []
        scales = []
        for s in range(9):
            t = s / 8.0
            r = 0.44 * (1.0 - t) + 0.22 * t
            ang = base_a + t * 0.65
            z_arc = math.sin(t * math.pi) * 0.14 * (1 if k % 2 == 0 else -1)
            pts.append((r * math.cos(ang), r * math.sin(ang), z_arc))
            scales.append(1.15 - 0.55 * t)
        bm_sweep_tube(bm_gear, pts, strut_prof, closed=False, cap_ends=True, scales=scales)
    finalize_bmesh_object("Astrolabe_Gear_Struts", bm_gear, mats["gold_polished"], col, parent=root, rotation=gear_rot, bevel_width=0.003, bevel_segs=1)

    # 4. Inner Obsidian & Brass Gimbal Ring + Twin Diagonal Vernier Pointer Needles
    inner_rot = (math.radians(32), math.radians(-52), math.radians(40))
    bm_inner = bm_lathe(chamfered_rect_profile(0.29, 0.345, 0.020, 0.005), segs=40)
    finalize_bmesh_object("Astrolabe_Inner_Obsidian", bm_inner, mats["obsidian"], col, parent=root, rotation=inner_rot)

    bm_needles = bmesh.new()
    # Twin razor-sharp vernier pointer needles spanning across inner ring
    for sgn in (-1.0, 1.0):
        pts = [
            (0.0, sgn * 0.24, 0.0),
            (0.0, sgn * 0.52, 0.0),
            (0.0, sgn * 0.68, 0.0),
        ]
        nprof = [(-0.016, -0.006), (0.016, -0.006), (0.020, 0.0), (0.016, 0.006), (-0.016, 0.006), (-0.020, 0.0)]
        bm_sweep_tube(bm_needles, pts, nprof, closed=False, cap_ends=True, scales=[1.1, 0.65, 0.12])
    # Filigree 4-rib crown cage cradling crystal core
    cage_prof = [(-0.008, -0.008), (0.008, -0.008), (0.008, 0.008), (-0.008, 0.008)]
    for k in range(4):
        az = k * math.pi / 2 + math.pi / 4
        pts = []
        for s in range(11):
            t = -math.pi * 0.46 + (math.pi * 0.92) * (s / 10.0)
            rr = 0.235 * math.cos(t)
            zz = 0.265 * math.sin(t)
            pts.append((rr * math.cos(az), rr * math.sin(az), zz))
        bm_sweep_tube(bm_needles, pts, cage_prof, closed=False, cap_ends=True)
    finalize_bmesh_object("Astrolabe_Vernier_Cage", bm_needles, mats["brass"], col, parent=root, rotation=(math.radians(12), math.radians(-14), 0.0))

    # 5. Faceted Glowing Champagne-Gold Crystal Core
    bm_core = bm_faceted_crystal(radius=0.175, height=0.39, sides=10, girdle_ratio=0.18, crown_ratio=0.58, bevel=0.005)
    finalize_bmesh_object(
        "Astrolabe_Crystal_Core", bm_core, mats["glow_gold"], col, parent=root,
        rotation=(math.radians(12), math.radians(-14), 0.0), smooth=False, weighted_normal=False
    )

    return col, root


# ---------------------------------------------------------------------------
# RELIC 2: London — Armillary Orrery (relic_armillary_orrery.glb)
# ---------------------------------------------------------------------------
def build_relic_armillary_orrery(mats):
    col = make_collection("Relic_Armillary_Orrery")
    root = make_root_empty("Armillary_Orrery_Root", col)

    # 1. Stepped Octagonal Pedestal Finial at bottom (Z = -0.80 .. -0.54)
    bm_ped_obs = bmesh.new()
    bm_add_prism_cyl(bm_ped_obs, 0.34, 0.31, 0.065, segs=8, matrix=Matrix.Translation((0, 0, -0.76)), bevel=0.008)
    bm_add_prism_cyl(bm_ped_obs, 0.26, 0.22, 0.060, segs=8, matrix=Matrix.Translation((0, 0, -0.695)), bevel=0.007)
    finalize_bmesh_object("Orrery_Pedestal_Obsidian", bm_ped_obs, mats["obsidian"], col, parent=root)

    bm_ped_brz = bmesh.new()
    bm_add_prism_cyl(bm_ped_brz, 0.36, 0.35, 0.026, segs=8, matrix=Matrix.Translation((0, 0, -0.798)), bevel=0.005)
    bm_add_prism_cyl(bm_ped_brz, 0.28, 0.27, 0.022, segs=8, matrix=Matrix.Translation((0, 0, -0.725)), bevel=0.004)
    bm_add_prism_cyl(bm_ped_brz, 0.16, 0.11, 0.065, segs=8, matrix=Matrix.Translation((0, 0, -0.635)), bevel=0.006)
    # 8 brass corner plinth studs
    for i in range(8):
        a = (2.0 * math.pi * i) / 8 + math.pi / 8
        m = Matrix.Translation((math.cos(a) * 0.315, math.sin(a) * 0.315, -0.73)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_ped_brz, 0.026, 0.026, 0.032, matrix=m, bevel=0.005, segs=1)
    # Central axial observatory spindle + top polar finial spire
    spindle_prof = [
        (0.012, -0.61), (0.048, -0.60), (0.036, -0.54), (0.022, -0.48),
        (0.022, 0.56), (0.042, 0.60), (0.055, 0.64), (0.035, 0.68),
        (0.026, 0.72), (0.008, 0.81), (0.002, 0.82),
    ]
    bm_spindle = bm_lathe(spindle_prof, segs=24, closed_profile=False, cap_ends=True)
    # Merge pedestal bronze & spindle cleanly
    finalize_bmesh_object("Orrery_Pedestal_Bronze", bm_ped_brz, mats["bronze"], col, parent=root)
    finalize_bmesh_object("Orrery_Spindle_Finial", bm_spindle, mats["brass"], col, parent=root, location=(0, 0, 0.0))

    # 2. Classical Bronze Wide Ecliptic Band (tilted 23.5 deg) + 12 Zodiac Ribs
    eclip_rot = (math.radians(23.5), math.radians(-10.0), 0.0)
    eclip_prof = [
        (0.655, -0.058), (0.685, -0.058), (0.695, -0.048), (0.685, -0.040),
        (0.685, 0.040), (0.695, 0.048), (0.685, 0.058), (0.655, 0.058),
        (0.648, 0.048), (0.658, 0.038), (0.658, -0.038), (0.648, -0.048),
    ]
    bm_eclip = bm_lathe(eclip_prof, segs=42)
    for i in range(12):
        a = (2.0 * math.pi * i) / 12
        m = Matrix.Translation((math.cos(a) * 0.688, math.sin(a) * 0.688, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_eclip, 0.018, 0.016, 0.125, matrix=m, bevel=0.003, segs=1)
    finalize_bmesh_object("Orrery_Ecliptic_Band", bm_eclip, mats["bronze"], col, parent=root, location=(0, 0, 0.05), rotation=eclip_rot)

    # 3. Twin Orthogonal Meridian Hoops + Polar Collar Caps
    bm_merid = bmesh.new()
    for rot_z in (0.0, math.pi / 2):
        bm_m = bm_lathe(chamfered_rect_profile(0.585, 0.625, 0.017, 0.005), segs=36)
        bmesh.ops.transform(
            bm_m,
            matrix=Matrix.Translation((0, 0, 0.05)) @ Matrix.Rotation(rot_z, 4, "Z") @ Matrix.Rotation(math.pi / 2, 4, "X"),
            verts=list(bm_m.verts),
        )
        vmap = {v: bm_merid.verts.new(v.co) for v in bm_m.verts}
        for f in bm_m.faces:
            try:
                bm_merid.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_m.free()
    finalize_bmesh_object("Orrery_Meridian_Hoops", bm_merid, mats["brass"], col, parent=root)

    # 4. Central Spur-Gear Stack + 4 Sculpted Cantilever Planetary Arms
    bm_gears = bmesh.new()
    gear_specs = [
        (-0.24, 0.04, 0.16, 0.185, 0.016, 14),
        (-0.18, 0.04, 0.125, 0.148, 0.014, 12),
        (-0.125, 0.04, 0.095, 0.115, 0.013, 10),
    ]
    for (gz, rin, rbase, rtip, zh, nt) in gear_specs:
        g = bm_toothed_gear(rin, rbase, rtip, zh, nt, tooth_duty=0.45)
        bmesh.ops.transform(g, matrix=Matrix.Translation((0, 0, gz)), verts=list(g.verts))
        vmap = {v: bm_gears.verts.new(v.co) for v in g.verts}
        for f in g.faces:
            try:
                bm_gears.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        g.free()

    # 4 Planetary cantilever arms extending from gear hub to orbiting spheres
    planet_defs = [
        {"name": "Planet_Copper", "r": 0.28, "az": math.radians(32), "z_hub": -0.125, "z_orb": 0.12, "rad": 0.052, "mat": "copper", "ring": False},
        {"name": "Planet_Lapis", "r": 0.39, "az": math.radians(142), "z_hub": -0.18, "z_orb": 0.04, "rad": 0.082, "mat": "lapis", "ring": False, "moon": True},
        {"name": "Planet_Saturn", "r": 0.49, "az": math.radians(-48), "z_hub": -0.24, "z_orb": 0.14, "rad": 0.092, "mat": "gold_polished", "ring": True},
        {"name": "Planet_Pearl", "r": 0.44, "az": math.radians(-145), "z_hub": -0.21, "z_orb": -0.06, "rad": 0.062, "mat": "pearl", "ring": False},
    ]

    arm_prof = [(-0.010, -0.008), (0.010, -0.008), (0.012, 0.0), (0.010, 0.008), (-0.010, 0.008), (-0.012, 0.0)]
    for p in planet_defs:
        ca, sa = math.cos(p["az"]), math.sin(p["az"])
        r = p["r"]
        zh = p["z_hub"]
        zo = p["z_orb"]
        pts = [
            (0.03 * ca, 0.03 * sa, zh),
            (r * 0.45 * ca, r * 0.45 * sa, zh - 0.02),
            (r * 0.88 * ca, r * 0.88 * sa, zh + (zo - zh) * 0.35),
            (r * ca, r * sa, zo - p["rad"] - 0.015),
        ]
        bm_sweep_tube(bm_gears, pts, arm_prof, closed=False, cap_ends=True, scales=[1.1, 0.95, 0.8, 0.7])
        # Planetary mounting cup collar
        bm_add_prism_cyl(
            bm_gears, p["rad"] * 0.55, p["rad"] * 0.78, 0.026, segs=12,
            matrix=Matrix.Translation((r * ca, r * sa, zo - p["rad"] - 0.008)),
            bevel=0.003,
        )

    # 8-point brass sunburst collar around solar core
    for i in range(8):
        a = (2.0 * math.pi * i) / 8
        m = Matrix.Translation((math.cos(a) * 0.15, math.sin(a) * 0.15, 0.08)) @ Matrix.Rotation(a, 4, "Z") @ Matrix.Rotation(math.pi / 2, 4, "Y")
        bm_add_prism_cyl(bm_gears, 0.020, 0.003, 0.075, segs=4, matrix=m, bevel=0.002)

    finalize_bmesh_object("Orrery_Gears_Arms", bm_gears, mats["brass"], col, parent=root)

    # Individual polished planetary spheres
    for p in planet_defs:
        ca, sa = math.cos(p["az"]), math.sin(p["az"])
        pos = (p["r"] * ca, p["r"] * sa, p["z_orb"])
        bm_p = bmesh.new()
        bm_add_sphere(bm_p, p["rad"], segs=16, rings=10)
        finalize_bmesh_object(f"Orrery_{p['name']}", bm_p, mats[p["mat"]], col, parent=root, location=pos)

        if p.get("ring"):
            bm_sr = bm_lathe(chamfered_rect_profile(p["rad"] * 1.32, p["rad"] * 1.88, 0.008, 0.002), segs=24)
            finalize_bmesh_object(
                "Orrery_Saturn_Ring", bm_sr, mats["brass"], col, parent=root,
                location=pos, rotation=(math.radians(26), math.radians(-18), 0.0)
            )
        if p.get("moon"):
            bm_moon = bmesh.new()
            bm_add_sphere(bm_moon, 0.028, segs=10, rings=6)
            mpos = (pos[0] + 0.095, pos[1] - 0.06, pos[2] + 0.055)
            finalize_bmesh_object("Orrery_Lapis_Moon", bm_moon, mats["pearl"], col, parent=root, location=mpos)

    # 5. Radiant Faceted Solar Core
    bm_sun = bm_faceted_crystal(radius=0.125, height=0.25, sides=8, girdle_ratio=0.28, crown_ratio=0.65, bevel=0.004)
    finalize_bmesh_object("Orrery_Solar_Core", bm_sun, mats["glow_gold"], col, parent=root, location=(0, 0, 0.08), smooth=False, weighted_normal=False)

    return col, root


# ---------------------------------------------------------------------------
# RELIC 3: Tokyo — Origami Prism (relic_origami_prism.glb)
# ---------------------------------------------------------------------------
def build_relic_origami_prism(mats):
    col = make_collection("Relic_Origami_Prism")
    root = make_root_empty("Origami_Prism_Root", col)

    # 1. Core Folded Interlocking Obsidian Origami Plates
    # Start from a sculpted icosahedron, fold every triangle individually into a raised beveled kite plate
    base_bm = bmesh.new()
    bmesh.ops.create_icosphere(base_bm, subdivisions=1, radius=0.47)
    base_bm.faces.ensure_lookup_table()

    bm_obs = bmesh.new()
    bm_seams = bmesh.new()
    bm_gold_ribs = bmesh.new()

    for idx, f in enumerate(base_bm.faces):
        verts = [v.co.copy() for v in f.verts]
        center = (verts[0] + verts[1] + verts[2]) / 3.0
        normal = f.normal.normalized()

        # Leave 4 strategic cutaway diamond windows so glowing core shines through!
        is_aperture = (idx in (1, 6, 11, 16))
        shrink = 0.87 if not is_aperture else 0.72
        plate_lift = 0.032 if (idx % 2 == 0) else 0.016
        peak_lift = 0.145 if (idx % 3 == 0) else 0.095

        if not is_aperture:
            # Create beveled folded obsidian origami pyramid plate
            inner_pts = [center + (v - center) * shrink + normal * plate_lift for v in verts]
            back_pts = [center + (v - center) * (shrink * 0.90) + normal * (plate_lift - 0.048) for v in verts]
            # Slightly asymmetric origami crease apex
            apex_offset = (verts[idx % 3] - center) * 0.18
            apex = center + apex_offset + normal * (plate_lift + peak_lift)

            tmp = bmesh.new()
            v_in = [tmp.verts.new(p) for p in inner_pts]
            v_bk = [tmp.verts.new(p) for p in back_pts]
            v_ap = tmp.verts.new(apex)
            for j in range(3):
                nj = (j + 1) % 3
                tmp.faces.new((v_in[j], v_in[nj], v_ap))
                tmp.faces.new((v_bk[j], v_bk[nj], v_in[nj], v_in[j]))
            tmp.faces.new((v_bk[2], v_bk[1], v_bk[0]))
            bmesh.ops.recalc_face_normals(tmp, faces=list(tmp.faces))
            bmesh.ops.bevel(tmp, geom=list(tmp.edges), offset=0.008, segments=1, affect="EDGES", clamp_overlap=True)

            vmap = {v: bm_obs.verts.new(v.co) for v in tmp.verts}
            for tf in tmp.faces:
                try:
                    bm_obs.faces.new([vmap[v] for v in tf.verts])
                except ValueError:
                    pass
            tmp.free()

        # Kintsugi glowing seam vein along every edge of the base polyhedron
        seam_prof = [(-0.011, -0.011), (0.011, -0.011), (0.011, 0.011), (-0.011, 0.011)]
        for j in range(3):
            p0 = verts[j] * 1.03
            p1 = verts[(j + 1) % 3] * 1.03
            if (p0 - p1).length > 0.01 and (verts[j].x + verts[j].y * 1.3 < verts[(j + 1) % 3].x + verts[(j + 1) % 3].y * 1.3):
                mid = (p0 + p1) * 0.525
                bm_sweep_tube(bm_seams, [p0, mid, p1], seam_prof, closed=False, cap_ends=True)

    # Sculpted gold kintsugi corner brackets at all 12 icosahedron vertices
    for v in base_bm.verts:
        n = v.co.normalized()
        q = Vector((0, 0, 1)).rotation_difference(n).to_matrix().to_4x4()
        m = Matrix.Translation(v.co * 1.04) @ q
        bm_add_prism_cyl(bm_gold_ribs, 0.048, 0.024, 0.032, segs=5, matrix=m, bevel=0.005)
    base_bm.free()

    # 2. Two Sweeping Interlocking Folded Origami Crescent Collar Blades (dramatic diagonal 3D sweep!)
    blade_prof = [(-0.042, -0.008), (0.048, -0.004), (0.056, 0.0), (0.048, 0.004), (-0.042, 0.008), (-0.050, 0.0)]
    gold_edge_prof = [(-0.009, -0.011), (0.009, -0.011), (0.009, 0.011), (-0.009, 0.011)]
    for b_idx, (tilt_x, tilt_y, az_start) in enumerate([(1.05, -0.45, 0.35), (-0.98, 0.52, 3.45)]):
        rot_m = Euler((tilt_x, tilt_y, 0.0), "XYZ").to_matrix().to_4x4()
        pts = []
        edge_pts = []
        scales = []
        for s in range(13):
            t = s / 12.0
            ang = az_start + t * math.pi * 1.24
            rr = 0.64 + 0.06 * math.sin(t * math.pi)
            zz = 0.09 * math.sin(t * math.pi * 2.0)
            p_local = Vector((rr * math.cos(ang), rr * math.sin(ang), zz))
            pts.append(rot_m @ p_local)
            edge_pts.append(rot_m @ (p_local * 1.045))
            scales.append(0.20 + 0.95 * math.sin(t * math.pi))
        bm_sweep_tube(bm_obs, pts, blade_prof, closed=False, cap_ends=True, scales=scales)
        bm_sweep_tube(bm_gold_ribs, edge_pts, gold_edge_prof, closed=False, cap_ends=True, scales=scales)

    # 3. 6 Floating Beveled Corner Shards (Obsidian tops + Gold bases) + Top/Bottom Crown Spires
    for i in range(6):
        a = (2.0 * math.pi * i) / 6 + math.pi / 6
        elev = 0.44 if (i % 2 == 0) else -0.44
        r = 0.66
        pos = Vector((r * math.cos(a), r * math.sin(a), elev))
        dir_out = pos.normalized()
        rot_q = Vector((0, 0, 1)).rotation_difference(dir_out).to_matrix().to_4x4()
        m_shard = Matrix.Translation(pos) @ rot_q @ Matrix.Rotation(i * 0.7, 4, "Z")
        bm_add_prism_cyl(bm_obs, 0.086, 0.008, 0.23, segs=3, matrix=m_shard, bevel=0.006)
        # Gold-leaf base collar & tip cap on each floating shard
        m_cap = Matrix.Translation(pos - dir_out * 0.120) @ rot_q @ Matrix.Rotation(i * 0.7, 4, "Z")
        bm_add_prism_cyl(bm_gold_ribs, 0.092, 0.074, 0.030, segs=3, matrix=m_cap, bevel=0.004)
        m_tip = Matrix.Translation(pos + dir_out * 0.108) @ rot_q
        bm_add_prism_cyl(bm_seams, 0.024, 0.004, 0.048, segs=3, matrix=m_tip, bevel=0.002)

    # Polar origami crest darts (top + bottom vertical framing)
    for sz in (-1.0, 1.0):
        pos = Vector((0.0, 0.0, sz * 0.68))
        rot_q = Matrix.Identity(4) if sz > 0 else Matrix.Rotation(math.pi, 4, "X")
        bm_add_prism_cyl(bm_obs, 0.078, 0.008, 0.22, segs=4, matrix=Matrix.Translation(pos) @ rot_q, bevel=0.006)
        bm_add_prism_cyl(bm_gold_ribs, 0.086, 0.066, 0.032, segs=4, matrix=Matrix.Translation((0, 0, sz * 0.56)) @ rot_q, bevel=0.004)

    finalize_bmesh_object("Origami_Obsidian_Plates", bm_obs, mats["obsidian"], col, parent=root, smooth=False, weighted_normal=False)
    finalize_bmesh_object("Origami_Kintsugi_Seams", bm_seams, mats["glow_kintsugi"], col, parent=root, smooth=True)
    finalize_bmesh_object("Origami_Gold_Inlays", bm_gold_ribs, mats["gold_polished"], col, parent=root, smooth=False, weighted_normal=False)

    # 4. Blazing Molten-Vermilion Origami Crystal Heart
    bm_heart = bm_faceted_crystal(radius=0.27, height=0.48, sides=6, girdle_ratio=0.14, crown_ratio=0.52, bevel=0.006)
    finalize_bmesh_object("Origami_Molten_Heart", bm_heart, mats["glow_vermilion"], col, parent=root, smooth=False, weighted_normal=False)

    return col, root


# ---------------------------------------------------------------------------
# RELIC 4: Rio — Emerald Sphere (relic_emerald_sphere.glb)
# ---------------------------------------------------------------------------
def build_relic_emerald_sphere(mats):
    col = make_collection("Relic_Emerald_Sphere")
    root = make_root_empty("Emerald_Sphere_Root", col)

    # 1. 6 Sweeping Niemeyer-Inspired Architectural White-Ceramic Parabolic Rib Arches
    bm_ceramic = bmesh.new()
    bm_gold = bmesh.new()

    # Tapered sculptural fin cross-section (thick ceramic spine with crisp bevels)
    rib_prof = [
        (-0.022, -0.052), (0.022, -0.052), (0.036, -0.028),
        (0.032, 0.036), (0.016, 0.058), (-0.016, 0.058),
        (-0.032, 0.036), (-0.036, -0.028),
    ]
    fillet_prof = [(-0.012, -0.012), (0.012, -0.012), (0.012, 0.012), (-0.012, 0.012)]

    for k in range(6):
        az = (2.0 * math.pi * k) / 6.0
        pts_cer = []
        pts_gold_out = []
        pts_gold_in = []
        scales = []
        for s in range(14):
            t = s / 13.0  # 0 (bottom collar) -> 1 (top crown)
            z = -0.74 + 1.48 * t
            # Signature Niemeyer sweeping cathedral S-curve parabola!
            sway = math.sin(t * math.pi)
            flare = 0.075 * math.sin(t * math.pi * 2.0)  # sculptural hourglass/lotus inflection
            r = 0.25 + 0.49 * (sway ** 0.72) + flare
            twist = az + 0.24 * math.sin(t * math.pi)
            ca, sa = math.cos(twist), math.sin(twist)
            pts_cer.append((r * ca, r * sa, z))
            pts_gold_out.append(((r + 0.044) * ca, (r + 0.044) * sa, z))
            pts_gold_in.append(((r - 0.040) * ca, (r - 0.040) * sa, z))
            scales.append(0.55 + 0.65 * math.sin(t * math.pi))

        bm_sweep_tube(bm_ceramic, pts_cer, rib_prof, closed=False, cap_ends=True, scales=scales)
        bm_sweep_tube(bm_gold, pts_gold_out, fillet_prof, closed=False, cap_ends=True, scales=[sc * 0.85 for sc in scales])
        bm_sweep_tube(bm_gold, pts_gold_in, fillet_prof, closed=False, cap_ends=True, scales=[sc * 0.72 for sc in scales])

    # Upper & lower architectural ceramic tension collar rings
    for z_ring, r_in, r_out in [(-0.72, 0.20, 0.30), (0.72, 0.20, 0.30)]:
        bm_cr = bm_lathe(chamfered_rect_profile(r_in, r_out, 0.036, 0.010), segs=32)
        bmesh.ops.transform(bm_cr, matrix=Matrix.Translation((0, 0, z_ring)), verts=list(bm_cr.verts))
        vmap = {v: bm_ceramic.verts.new(v.co) for v in bm_cr.verts}
        for f in bm_cr.faces:
            try:
                bm_ceramic.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_cr.free()

        # Brushed-gold chamfered inner crown lip
        bm_gl = bm_lathe(chamfered_rect_profile(r_in - 0.025, r_in + 0.01, 0.042, 0.008), segs=32)
        bmesh.ops.transform(bm_gl, matrix=Matrix.Translation((0, 0, z_ring)), verts=list(bm_gl.verts))
        vmap = {v: bm_gold.verts.new(v.co) for v in bm_gl.verts}
        for f in bm_gl.faces:
            try:
                bm_gold.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_gl.free()

    # Sleek tilted elliptical brushed-gold orbital architectural ribbon (r = 0.78)
    rib_rot = Euler((math.radians(24), math.radians(-18), 0.0), "XYZ").to_matrix().to_4x4()
    bm_orb = bm_lathe(chamfered_rect_profile(0.755, 0.795, 0.018, 0.005), segs=44)
    bmesh.ops.transform(bm_orb, matrix=rib_rot, verts=list(bm_orb.verts))
    vmap = {v: bm_gold.verts.new(v.co) for v in bm_orb.verts}
    for f in bm_orb.faces:
        try:
            bm_gold.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_orb.free()

    # Delicate inner gold filigree equator cradling the emerald sphere
    bm_eq = bm_lathe(chamfered_rect_profile(0.415, 0.445, 0.012, 0.003), segs=36)
    bmesh.ops.transform(bm_eq, matrix=Euler((math.radians(-18), math.radians(22), 0.0)).to_matrix().to_4x4(), verts=list(bm_eq.verts))
    vmap = {v: bm_gold.verts.new(v.co) for v in bm_eq.verts}
    for f in bm_eq.faces:
        try:
            bm_gold.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_eq.free()

    finalize_bmesh_object("Emerald_Niemeyer_Arches", bm_ceramic, mats["ceramic"], col, parent=root)
    finalize_bmesh_object("Emerald_BrushedGold_Trim", bm_gold, mats["brass"], col, parent=root)

    # 2. Faceted Glowing Emerald Crystal Sphere (brilliant geodesic cut!) + 6 micro emerald satellites
    bm_em = bmesh.new()
    bm_add_icosphere(bm_em, radius=0.33, subdivisions=2, bevel=0.007)
    for k in range(6):
        a = (2.0 * math.pi * k) / 6.0
        pos = Euler((math.radians(-18), math.radians(22), 0.0)).to_matrix() @ Vector((0.43 * math.cos(a), 0.43 * math.sin(a), 0.0))
        m = Matrix.Translation(pos) @ Matrix.Rotation(a, 4, "Z")
        bm_add_prism_cyl(bm_em, 0.032, 0.006, 0.075, segs=6, matrix=m, bevel=0.003)
    finalize_bmesh_object("Emerald_Crystal_Sphere", bm_em, mats["glow_emerald"], col, parent=root, smooth=False, weighted_normal=False)

    return col, root


# ---------------------------------------------------------------------------
# RELIC 5: Cairo — Cipher Box (relic_cipher_box.glb)
# ---------------------------------------------------------------------------
def build_relic_cipher_box(mats):
    col = make_collection("Relic_Cipher_Box")
    root = make_root_empty("Cipher_Box_Root", col)

    bm_sand = bmesh.new()
    bm_obs = bmesh.new()
    bm_gold = bmesh.new()
    bm_glow = bmesh.new()

    # 1. Inner Honed Obsidian Cylindrical Core Barrel (visible between rotating rings!)
    bm_add_prism_cyl(bm_obs, 0.42, 0.42, 1.12, segs=16, matrix=Matrix.Translation((0, 0, -0.02)), bevel=0.006)

    # 2. Octagonal Carved Sandstone & Obsidian Stepped End Caps (bottom & top)
    # Bottom end cap (Z = -0.78 .. -0.44)
    bm_add_prism_cyl(bm_sand, 0.56, 0.59, 0.16, segs=8, matrix=Matrix.Translation((0, 0, -0.54)), bevel=0.012)
    bm_add_prism_cyl(bm_sand, 0.48, 0.54, 0.11, segs=8, matrix=Matrix.Translation((0, 0, -0.675)), bevel=0.010)
    bm_add_prism_cyl(bm_obs, 0.38, 0.44, 0.055, segs=8, matrix=Matrix.Translation((0, 0, -0.755)), bevel=0.008)
    # Bottom gold scarab counter-seal
    bm_add_prism_cyl(bm_gold, 0.24, 0.28, 0.032, segs=8, matrix=Matrix.Translation((0, 0, -0.795)), bevel=0.005)
    bm_add_prism_cyl(bm_gold, 0.60, 0.60, 0.028, segs=8, matrix=Matrix.Translation((0, 0, -0.45)), bevel=0.005)

    # Top end cap (Z = +0.42 .. +0.62) with recessed stepped socket for Pyramid Keystone!
    bm_add_prism_cyl(bm_sand, 0.59, 0.54, 0.16, segs=8, matrix=Matrix.Translation((0, 0, 0.50)), bevel=0.012)
    bm_add_prism_cyl(bm_gold, 0.60, 0.60, 0.028, segs=8, matrix=Matrix.Translation((0, 0, 0.41)), bevel=0.005)
    # Gold collar rim surrounding top keystone socket
    bm_socket = bm_lathe(chamfered_rect_profile(0.28, 0.44, 0.035, 0.008), segs=8)
    bmesh.ops.transform(bm_socket, matrix=Matrix.Translation((0, 0, 0.60)) @ Matrix.Rotation(math.pi / 8, 4, "Z"), verts=list(bm_socket.verts))
    vmap = {v: bm_gold.verts.new(v.co) for v in bm_socket.verts}
    for f in bm_socket.faces:
        try:
            bm_gold.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_socket.free()

    # 3. THREE Independent Beveled Rotating Combination Rings (Z = -0.27, 0.0, +0.27)
    ring_offsets = [(-0.27, 0.18), (0.0, -0.26), (0.27, 0.42)]
    for r_idx, (rz, az_off) in enumerate(ring_offsets):
        # Main antique-gold beveled combination ring body (16 faceted segments)
        bm_cr = bm_lathe(stepped_ring_profile(0.43, 0.555, 0.105, 0.018, 0.015), segs=16)
        bmesh.ops.transform(bm_cr, matrix=Matrix.Translation((0, 0, rz)) @ Matrix.Rotation(az_off, 4, "Z"), verts=list(bm_cr.verts))
        vmap = {v: bm_gold.verts.new(v.co) for v in bm_cr.verts}
        for f in bm_cr.faces:
            try:
                bm_gold.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_cr.free()

        # Recessed dark obsidian band on each dial + 8 sculpted geometric Egyptian cipher blocks
        for k in range(8):
            a = az_off + (2.0 * math.pi * k) / 8.0
            m_pad = Matrix.Translation((math.cos(a) * 0.552, math.sin(a) * 0.552, rz)) @ Matrix.Rotation(a, 4, "Z")
            bm_add_beveled_box(bm_obs, 0.032, 0.165, 0.125, matrix=m_pad, bevel=0.005, segs=1)
            # Raised golden cipher glyphs (alternating chevron bar / twin pillar / diamond)
            if (k + r_idx) % 3 == 0:
                bm_add_beveled_box(bm_gold, 0.044, 0.030, 0.095, matrix=m_pad, bevel=0.004, segs=1)
                bm_add_beveled_box(bm_gold, 0.044, 0.095, 0.026, matrix=m_pad, bevel=0.004, segs=1)
            elif (k + r_idx) % 3 == 1:
                for off_y in (-0.038, 0.038):
                    m2 = Matrix.Translation((math.cos(a) * 0.562, math.sin(a) * 0.562, rz)) @ Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0, off_y, 0))
                    bm_add_beveled_box(bm_gold, 0.032, 0.026, 0.088, matrix=m2, bevel=0.003, segs=1)
            else:
                m3 = m_pad @ Matrix.Rotation(math.pi / 4, 4, "X")
                bm_add_beveled_box(bm_gold, 0.046, 0.064, 0.064, matrix=m3, bevel=0.005, segs=1)

        # Glowing warm-amber alignment ring channel tucked between combination rings!
        bm_ch = bm_lathe(chamfered_rect_profile(0.425, 0.465, 0.015, 0.003), segs=32)
        bmesh.ops.transform(bm_ch, matrix=Matrix.Translation((0, 0, rz + 0.132)), verts=list(bm_ch.verts))
        vmap = {v: bm_glow.verts.new(v.co) for v in bm_ch.verts}
        for f in bm_ch.faces:
            try:
                bm_glow.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_ch.free()

    # Lower glow channel below bottom ring
    bm_ch0 = bm_lathe(chamfered_rect_profile(0.425, 0.465, 0.015, 0.003), segs=32)
    bmesh.ops.transform(bm_ch0, matrix=Matrix.Translation((0, 0, -0.405)), verts=list(bm_ch0.verts))
    vmap = {v: bm_glow.verts.new(v.co) for v in bm_ch0.verts}
    for f in bm_ch0.faces:
        try:
            bm_glow.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_ch0.free()

    # 4. Twin External Egyptian Pylon Locking Rails (X = +/- 0.635)
    for sgn in (-1.0, 1.0):
        # Tapered pylon column bar in obsidian + gold mechanical clasp knuckles
        m_rail = Matrix.Translation((sgn * 0.625, 0.0, 0.0))
        bm_add_beveled_box(bm_obs, 0.072, 0.115, 1.12, matrix=m_rail, bevel=0.009, segs=1)
        for cz in (-0.49, 0.0, 0.47):
            m_cl = Matrix.Translation((sgn * 0.615, 0.0, cz))
            bm_add_beveled_box(bm_gold, 0.105, 0.145, 0.088, matrix=m_cl, bevel=0.008, segs=1)
        # Glowing alignment index notch at center
        bm_add_beveled_box(bm_glow, 0.025, 0.055, 0.048, matrix=Matrix.Translation((sgn * 0.665, 0.0, 0.0)), bevel=0.004, segs=1)

    # 5. Recessed Pyramidion Keystone Crown (Z = 0.56 .. 0.84)
    # 4-sided beveled obsidian pyramid seated inside the gold collar socket
    m_pyr = Matrix.Translation((0.0, 0.0, 0.70)) @ Matrix.Rotation(math.pi / 4, 4, "Z")
    bm_add_prism_cyl(bm_obs, 0.30, 0.014, 0.28, segs=4, matrix=m_pyr, bevel=0.008)
    # Glowing solar-gold apex cap & 4 face chevron energy grooves
    m_apex = Matrix.Translation((0.0, 0.0, 0.815)) @ Matrix.Rotation(math.pi / 4, 4, "Z")
    bm_add_prism_cyl(bm_glow, 0.072, 0.008, 0.070, segs=4, matrix=m_apex, bevel=0.004)
    for k in range(4):
        a = k * math.pi / 2
        m_face = (
            Matrix.Translation((math.cos(a) * 0.14, math.sin(a) * 0.14, 0.69))
            @ Matrix.Rotation(a, 4, "Z")
            @ Matrix.Rotation(math.radians(-38), 4, "Y")
        )
        bm_add_beveled_box(bm_glow, 0.018, 0.095, 0.022, matrix=m_face, bevel=0.003, segs=1)

    finalize_bmesh_object("CipherBox_Sandstone_Caps", bm_sand, mats["sandstone"], col, parent=root)
    finalize_bmesh_object("CipherBox_Obsidian_Body", bm_obs, mats["obsidian"], col, parent=root)
    finalize_bmesh_object("CipherBox_AntiqueGold_Rings", bm_gold, mats["bronze"], col, parent=root)
    finalize_bmesh_object("CipherBox_Solar_Glow", bm_glow, mats["glow_amber"], col, parent=root, smooth=False, weighted_normal=False)

    return col, root


# ---------------------------------------------------------------------------
# RELIC 6: Reykjavik — Cryo Relay (relic_cryo_relay.glb)
# ---------------------------------------------------------------------------
def build_relic_cryo_relay(mats):
    col = make_collection("Relic_Cryo_Relay")
    root = make_root_empty("Cryo_Relay_Root", col)

    bm_basalt = bmesh.new()
    bm_ti = bmesh.new()
    bm_glass = bmesh.new()
    bm_aurora = bmesh.new()

    # 1. Clustered 13-Column Hexagonal Volcanic Basalt Prism Spire
    # Dramatic Hallgrimskirkja / Reynisfjara staggered basalt cluster surrounding hollow energy core
    basalt_cols = [
        # Inner ring of 6 tall staggered columns (leaving 3 clear sightline windows for cryo lenses!)
        (0.27, math.radians(30), 0.115, -0.68, 0.72),
        (0.28, math.radians(90), 0.110, -0.58, 0.56),
        (0.27, math.radians(150), 0.115, -0.74, 0.78),
        (0.28, math.radians(210), 0.110, -0.62, 0.52),
        (0.27, math.radians(270), 0.115, -0.70, 0.68),
        (0.28, math.radians(330), 0.110, -0.56, 0.58),
        # Outer dramatic tectonic buttress columns
        (0.41, math.radians(22), 0.095, -0.62, 0.28),
        (0.43, math.radians(142), 0.100, -0.68, 0.36),
        (0.41, math.radians(262), 0.095, -0.64, 0.30),
        (0.39, math.radians(82), 0.085, -0.52, -0.05),
        (0.39, math.radians(202), 0.085, -0.54, 0.02),
        (0.39, math.radians(322), 0.085, -0.50, -0.08),
        # Lower base anchor monolith
        (0.0, 0.0, 0.22, -0.78, -0.44),
    ]
    for (r, ang, rad, z0, z1) in basalt_cols:
        h = z1 - z0
        zc = 0.5 * (z0 + z1)
        m = Matrix.Translation((r * math.cos(ang), r * math.sin(ang), zc)) @ Matrix.Rotation(ang * 0.5, 4, "Z")
        bm_add_prism_cyl(bm_basalt, rad * 1.04, rad * 0.94, h, segs=6, matrix=m, bevel=0.009)

    # 2. Twin Precision Machined Brushed-Titanium Cooling-Fin Heatsink Collars
    for collar_z in (-0.28, 0.28):
        bm_cr = bm_lathe(stepped_ring_profile(0.34, 0.44, 0.032, 0.012, 0.008), segs=28)
        bmesh.ops.transform(bm_cr, matrix=Matrix.Translation((0, 0, collar_z)), verts=list(bm_cr.verts))
        vmap = {v: bm_ti.verts.new(v.co) for v in bm_cr.verts}
        for f in bm_cr.faces:
            try:
                bm_ti.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_cr.free()

        # 12 radial beveled titanium heatsink cooling louver fins per collar
        for i in range(12):
            a = (2.0 * math.pi * i) / 12.0 + math.radians(15)
            # Clear the 3 lens windows at 0, 120, 240 deg cleanly
            m_fin = (
                Matrix.Translation((math.cos(a) * 0.495, math.sin(a) * 0.495, collar_z))
                @ Matrix.Rotation(a, 4, "Z")
            )
            bm_add_beveled_box(bm_ti, 0.145, 0.022, 0.115, matrix=m_fin, bevel=0.004, segs=1)

    # 3 vertical titanium tension struts clamping the two heatsink collars + upper emitter crown
    for k in range(3):
        a = math.radians(60 + 120 * k)
        m_rod = Matrix.Translation((math.cos(a) * 0.46, math.sin(a) * 0.46, 0.02))
        bm_add_prism_cyl(bm_ti, 0.020, 0.020, 0.92, segs=6, matrix=m_rod, bevel=0.003)

    # Upper optical condenser aperture ring at Z = +0.58
    bm_top_ap = bm_lathe(chamfered_rect_profile(0.22, 0.30, 0.026, 0.006), segs=24)
    bmesh.ops.transform(bm_top_ap, matrix=Matrix.Translation((0, 0, 0.56)), verts=list(bm_top_ap.verts))
    vmap = {v: bm_ti.verts.new(v.co) for v in bm_top_ap.verts}
    for f in bm_top_ap.faces:
        try:
            bm_ti.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_top_ap.free()

    # 3. Three Frosted Cryo-Glass Optical Condenser Lenses (mounted 120 deg apart at equator)
    for k in range(3):
        a = math.radians(120 * k)
        m_lens_frame = (
            Matrix.Translation((math.cos(a) * 0.47, math.sin(a) * 0.47, 0.0))
            @ Matrix.Rotation(a, 4, "Z")
            @ Matrix.Rotation(math.pi / 2, 4, "Y")
        )
        # Sculpted titanium lens housing barrel
        bm_bez = bm_lathe(stepped_ring_profile(0.115, 0.165, 0.048, 0.010, 0.010), segs=18)
        bmesh.ops.transform(bm_bez, matrix=m_lens_frame, verts=list(bm_bez.verts))
        vmap = {v: bm_ti.verts.new(v.co) for v in bm_bez.verts}
        for f in bm_bez.faces:
            try:
                bm_ti.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_bez.free()

        # Thick biconvex frosted cryo-glass optical lens
        bm_add_sphere(
            bm_glass, radius=0.125, segs=14, rings=8,
            matrix=m_lens_frame @ Matrix.Scale(0.45, 4, (0, 0, 1))
        )

    # Top cryo-glass crown condenser lens
    bm_add_sphere(
        bm_glass, radius=0.225, segs=18, rings=10,
        matrix=Matrix.Translation((0, 0, 0.56)) @ Matrix.Scale(0.32, 4, (0, 0, 1))
    )

    # 4. Aurora-Emerald Energy Crystal Core + 2 Orbiting Energy Phase Rings
    bm_core = bm_faceted_crystal(radius=0.155, height=0.86, sides=6, girdle_ratio=0.38, crown_ratio=0.68, bevel=0.005)
    bmesh.ops.transform(bm_core, matrix=Matrix.Translation((0, 0, 0.06)), verts=list(bm_core.verts))
    vmap = {v: bm_aurora.verts.new(v.co) for v in bm_core.verts}
    for f in bm_core.faces:
        try:
            bm_aurora.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_core.free()

    for tilt in [(math.radians(32), math.radians(18)), (math.radians(-28), math.radians(-24))]:
        bm_pr = bm_lathe(chamfered_rect_profile(0.58, 0.605, 0.010, 0.003), segs=32)
        bmesh.ops.transform(bm_pr, matrix=Euler((tilt[0], tilt[1], 0.0)).to_matrix().to_4x4(), verts=list(bm_pr.verts))
        vmap = {v: bm_aurora.verts.new(v.co) for v in bm_pr.verts}
        for f in bm_pr.faces:
            try:
                bm_aurora.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_pr.free()

    finalize_bmesh_object("CryoRelay_Basalt_Spire", bm_basalt, mats["basalt"], col, parent=root, smooth=False, weighted_normal=False)
    finalize_bmesh_object("CryoRelay_Titanium_Fins", bm_ti, mats["titanium"], col, parent=root)
    finalize_bmesh_object("CryoRelay_CryoGlass_Lenses", bm_glass, mats["cryo_glass"], col, parent=root)
    finalize_bmesh_object("CryoRelay_Aurora_Core", bm_aurora, mats["glow_aurora"], col, parent=root, smooth=False, weighted_normal=False)

    return col, root


# ---------------------------------------------------------------------------
# RELIC 7: Singapore — Council Seal (relic_council_seal.glb)
# ---------------------------------------------------------------------------
def build_relic_council_seal(mats):
    col = make_collection("Relic_Council_Seal")
    root = make_root_empty("Council_Seal_Root", col)

    # Stand medallion upright in vertical XZ plane facing -Y camera (slightly tilted for 3D drama)
    face_rot = (math.pi / 2, 0.0, 0.0)

    # 1. Magnetic Brass Containment Ring (r = 0.69..0.78) + 6 Electromagnetic Clamp Pylons
    bm_ring = bm_lathe(stepped_ring_profile(0.68, 0.78, 0.055, 0.018, 0.014), segs=56)
    bm_ring_obs = bm_lathe(chamfered_rect_profile(0.715, 0.745, 0.062, 0.005), segs=56)
    bm_emit = bmesh.new()

    for i in range(6):
        a = (2.0 * math.pi * i) / 6.0 + math.pi / 6.0
        # Inward-pointing magnetic containment clamp pylon
        m_py = Matrix.Translation((math.cos(a) * 0.655, math.sin(a) * 0.655, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_ring, 0.095, 0.058, 0.088, matrix=m_py, bevel=0.008, segs=1)
        # Luminous field emitter tip facing the hovering medallion segments
        m_em = Matrix.Translation((math.cos(a) * 0.602, math.sin(a) * 0.602, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_emit, 0.024, 0.036, 0.048, matrix=m_em, bevel=0.004, segs=1)
    # 12 perimeter micro-torque rivets
    for i in range(12):
        a = (2.0 * math.pi * i) / 12.0
        m_rv = Matrix.Translation((math.cos(a) * 0.79, math.sin(a) * 0.79, 0.0)) @ Matrix.Rotation(a, 4, "Z") @ Matrix.Rotation(math.pi / 2, 4, "Y")
        bm_add_prism_cyl(bm_ring, 0.022, 0.016, 0.032, segs=6, matrix=m_rv, bevel=0.003)

    finalize_bmesh_object("CouncilSeal_Containment_Brass", bm_ring, mats["brass"], col, parent=root, rotation=face_rot)
    finalize_bmesh_object("CouncilSeal_Containment_Obsidian", bm_ring_obs, mats["obsidian"], col, parent=root, rotation=face_rot)

    # 2. Concentric Outer Satin-Platinum Stabilizer Gimbal Ring (frames medallion cleanly without cutting across the front face!)
    bm_stab = bm_lathe(chamfered_rect_profile(0.805, 0.840, 0.022, 0.006), segs=48)
    # 4 recessed sculpted platinum compass bridges tying outer gimbal cleanly to brass containment ring
    for i in range(4):
        a = i * math.pi / 2.0 + math.pi / 4.0
        m_br = Matrix.Translation((math.cos(a) * 0.79, math.sin(a) * 0.79, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_stab, 0.048, 0.042, 0.064, matrix=m_br, bevel=0.005, segs=1)
    finalize_bmesh_object(
        "CouncilSeal_Stabilizer_Arc", bm_stab, mats["platinum"], col, parent=root,
        rotation=(math.pi / 2.0 + math.radians(11), 0.0, math.radians(-9))
    )

    # 3. THREE Hovering Interlocking 120-deg Precision Segments (Sovereign / Horizon / Agora)
    # Crisp 104-deg arcs with generous 16-deg floating magnetic separation channels!
    bm_plat = bmesh.new()
    bm_gold = bmesh.new()
    bm_obs_seg = bmesh.new()

    gap_rad = math.radians(8.5)
    for seg_idx in range(3):
        a_center = math.radians(90.0 + 120.0 * seg_idx)
        a0 = a_center - math.radians(60.0) + gap_rad
        a1 = a_center + math.radians(60.0) - gap_rad
        # Subtle outward magnetic hover offset
        hover_vec = Vector((math.cos(a_center) * 0.035, math.sin(a_center) * 0.035, 0.0))
        m_hov = Matrix.Translation(hover_vec)

        if seg_idx == 0:
            # SOVEREIGN Segment (Top): Champagne Gold primary body + Obsidian stepped chevron crest
            bm_add_sector_prism(bm_gold, 0.20, 0.54, -0.044, 0.044, a0, a1, segs=14, matrix=m_hov, bevel=0.008)
            bm_add_sector_prism(bm_obs_seg, 0.28, 0.46, -0.058, 0.058, a0 + 0.14, a1 - 0.14, segs=10, matrix=m_hov, bevel=0.006)
            # Crown architectural chevron ridge bars on both front & back faces
            for z_sgn in (-1.0, 1.0):
                for r_bar in (0.31, 0.39, 0.47):
                    bm_add_sector_prism(
                        bm_gold, r_bar, r_bar + 0.026,
                        z_sgn * 0.056, z_sgn * 0.074,
                        a_center - 0.36, a_center + 0.36, segs=8, matrix=m_hov, bevel=0.003
                    )
        elif seg_idx == 1:
            # HORIZON Segment (Bottom-Left): Satin Platinum body + Glowing Cyan-Gold telemetry ribs
            bm_add_sector_prism(bm_plat, 0.20, 0.54, -0.044, 0.044, a0, a1, segs=14, matrix=m_hov, bevel=0.008)
            bm_add_sector_prism(bm_gold, 0.48, 0.555, -0.054, 0.054, a0 + 0.05, a1 - 0.05, segs=12, matrix=m_hov, bevel=0.005)
            for z_sgn in (-1.0, 1.0):
                bm_add_sector_prism(
                    bm_emit, 0.32, 0.365,
                    z_sgn * 0.042, z_sgn * 0.062,
                    a0 + 0.12, a1 - 0.12, segs=10, matrix=m_hov, bevel=0.003
                )
        else:
            # AGORA Segment (Bottom-Right): Satin Platinum + Terraced radial civic colonnade ribs
            bm_add_sector_prism(bm_plat, 0.20, 0.54, -0.044, 0.044, a0, a1, segs=14, matrix=m_hov, bevel=0.008)
            bm_add_sector_prism(bm_gold, 0.20, 0.275, -0.056, 0.056, a0 + 0.06, a1 - 0.06, segs=10, matrix=m_hov, bevel=0.005)
            # Radial sculpted colonnade flutes
            for k in range(5):
                ak = a0 + 0.18 + (a1 - a0 - 0.36) * (k / 4.0)
                m_rib = m_hov @ Matrix.Translation((math.cos(ak) * 0.39, math.sin(ak) * 0.39, 0.0)) @ Matrix.Rotation(ak, 4, "Z")
                bm_add_beveled_box(bm_gold, 0.19, 0.022, 0.118, matrix=m_rib, bevel=0.004, segs=1)

    # 4. Central Floating Hexagonal Platinum & Gold Tri-Lock Keystone Hub
    bm_add_prism_cyl(bm_plat, 0.155, 0.155, 0.105, segs=6, matrix=Matrix.Rotation(math.pi / 6, 4, "Z"), bevel=0.009)
    bm_add_prism_cyl(bm_gold, 0.125, 0.125, 0.128, segs=3, matrix=Matrix.Rotation(math.pi / 2, 4, "Z"), bevel=0.006)
    # Incandescent central triangular sovereign core inlay
    bm_core_glow = bmesh.new()
    bm_add_prism_cyl(bm_core_glow, 0.075, 0.075, 0.145, segs=3, matrix=Matrix.Rotation(math.pi / 2, 4, "Z"), bevel=0.005)

    finalize_bmesh_object("CouncilSeal_Segments_Platinum", bm_plat, mats["platinum"], col, parent=root, rotation=face_rot)
    finalize_bmesh_object("CouncilSeal_Segments_Gold", bm_gold, mats["gold_polished"], col, parent=root, rotation=face_rot)
    finalize_bmesh_object("CouncilSeal_Segments_Obsidian", bm_obs_seg, mats["obsidian"], col, parent=root, rotation=face_rot)
    finalize_bmesh_object("CouncilSeal_Field_Emitters", bm_emit, mats["glow_cyan"], col, parent=root, rotation=face_rot, smooth=False, weighted_normal=False)
    finalize_bmesh_object("CouncilSeal_Keystone_Glow", bm_core_glow, mats["glow_gold"], col, parent=root, rotation=face_rot, smooth=False, weighted_normal=False)

    return col, root


# ---------------------------------------------------------------------------
# RELIC 8: Apex Forum — Master Ledger Tesseract (relic_master_ledger.glb)
# ---------------------------------------------------------------------------
def build_relic_master_ledger(mats):
    col = make_collection("Relic_Master_Ledger")
    root = make_root_empty("Master_Ledger_Root", col)

    # Tilt the monumental tesseract slightly on its axis for dramatic architectural dynamism!
    tess_rot = (math.radians(22), math.radians(-18), math.radians(34))

    bm_obs = bmesh.new()
    bm_gold = bmesh.new()
    bm_glow = bmesh.new()

    h_out = 0.34
    h_in = 0.175

    # 1. Outer Beveled Obsidian Hypercube Frame (12 machined beams + gold edge rails + 8 vertex cubes)
    corners_out = [Vector((sx * h_out, sy * h_out, sz * h_out)) for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1)]
    corners_in = [Vector((sx * h_in, sy * h_in, sz * h_in)) for sx in (-1, 1) for sy in (-1, 1) for sz in (-1, 1)]

    # 12 outer edges
    for i in range(8):
        for j in range(i + 1, 8):
            diff = corners_out[j] - corners_out[i]
            if abs(diff.length - 2.0 * h_out) < 1e-4:
                mid = (corners_out[i] + corners_out[j]) * 0.5
                d = diff.normalized()
                q = Vector((0, 0, 1)).rotation_difference(d).to_matrix().to_4x4()
                m = Matrix.Translation(mid) @ q
                bm_add_beveled_box(bm_obs, 0.056, 0.056, 2.0 * h_out - 0.04, matrix=m, bevel=0.008, segs=1)
                # Recessed sovereign gold trim bar along outer beam spine
                bm_add_beveled_box(bm_gold, 0.064, 0.018, 2.0 * h_out - 0.10, matrix=m, bevel=0.003, segs=1)
                bm_add_beveled_box(bm_gold, 0.018, 0.064, 2.0 * h_out - 0.10, matrix=m, bevel=0.003, segs=1)

    # 8 Sculpted Beveled Gold Corner Vertex Cubes + Glowing Core Pips + 8 Diagonal 4D Struts
    strut_prof = [(-0.014, -0.014), (0.014, -0.014), (0.014, 0.014), (-0.014, 0.014)]
    for i in range(8):
        co = corners_out[i]
        ci = corners_in[i]
        bm_add_beveled_box(bm_gold, 0.105, 0.105, 0.105, matrix=Matrix.Translation(co), bevel=0.014, segs=1)
        bm_add_beveled_box(bm_glow, 0.046, 0.046, 0.046, matrix=Matrix.Translation(co * 1.07), bevel=0.006, segs=1)
        # Tapered diagonal 4D tesseract projection strut
        bm_sweep_tube(bm_gold, [co * 0.94, (co + ci) * 0.5, ci * 1.04], strut_prof, closed=False, cap_ends=True, scales=[1.15, 0.72, 0.85])

    # 2. Inner Sovereign Obsidian Cube with Glowing Recessed Ledger Channels
    bm_add_beveled_box(bm_obs, h_in * 2.0, h_in * 2.0, h_in * 2.0, bevel=0.022, segs=1)
    # Recessed glowing ledger circuit cross-channels on all 6 faces
    for axis_m in (
        Matrix.Identity(4),
        Matrix.Rotation(math.pi / 2, 4, "X"),
        Matrix.Rotation(math.pi / 2, 4, "Y"),
    ):
        bm_add_beveled_box(bm_glow, 0.036, h_in * 2.06, h_in * 2.06, matrix=axis_m, bevel=0.005, segs=1)
    # Incandescent inner central faceted crystal core
    bm_inner_gem = bm_faceted_crystal(radius=0.14, height=0.28, sides=8, girdle_ratio=0.15, crown_ratio=0.55, bevel=0.004)
    vmap = {v: bm_glow.verts.new(v.co) for v in bm_inner_gem.verts}
    for f in bm_inner_gem.faces:
        try:
            bm_glow.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_inner_gem.free()

    finalize_bmesh_object("MasterLedger_Tesseract_Obsidian", bm_obs, mats["obsidian"], col, parent=root, rotation=tess_rot)
    finalize_bmesh_object("MasterLedger_Tesseract_Gold", bm_gold, mats["gold_polished"], col, parent=root, rotation=tess_rot)
    finalize_bmesh_object("MasterLedger_Tesseract_Glow", bm_glow, mats["glow_gold"], col, parent=root, rotation=tess_rot, smooth=False, weighted_normal=False)

    # 3. THREE Counter-Angled Engraved Sovereign Orbital Rings (r = 0.58, 0.69, 0.80)
    # Orbital Ring 1: Engraved toothed brass ring
    bm_r1 = bm_toothed_gear(0.54, 0.585, 0.612, 0.016, num_teeth=24, tooth_duty=0.38)
    finalize_bmesh_object(
        "MasterLedger_Orbit_Inner", bm_r1, mats["brass"], col, parent=root,
        rotation=(math.radians(36), math.radians(20), math.radians(12)), bevel_width=0.003, bevel_segs=1
    )

    # Orbital Ring 2: Honed obsidian & brass twin-rail sovereign ring + 8 cardinal lugs
    r2_rot = (math.radians(-42), math.radians(52), math.radians(-18))
    bm_r2_obs = bm_lathe(chamfered_rect_profile(0.65, 0.70, 0.022, 0.006), segs=40)
    bm_r2_g = bmesh.new()
    for i in range(8):
        a = (2.0 * math.pi * i) / 8.0
        m_lug = Matrix.Translation((math.cos(a) * 0.68, math.sin(a) * 0.68, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_r2_g, 0.068, 0.044, 0.056, matrix=m_lug, bevel=0.006, segs=1)
    finalize_bmesh_object("MasterLedger_Orbit_Mid_Obs", bm_r2_obs, mats["obsidian"], col, parent=root, rotation=r2_rot)
    finalize_bmesh_object("MasterLedger_Orbit_Mid_Lugs", bm_r2_g, mats["gold_polished"], col, parent=root, rotation=r2_rot)

    # Orbital Ring 3: Wide engraved sovereign outer gimbal ring (36 ticks + 4 diamond finials)
    r3_rot = (math.radians(68), math.radians(-28), math.radians(22))
    bm_r3 = bm_lathe(stepped_ring_profile(0.745, 0.805, 0.028, 0.010, 0.008), segs=44)
    for i in range(36):
        a = (2.0 * math.pi * i) / 36.0
        if i % 9 == 0:
            # Cardinal sculpted diamond finial
            m_dia = (
                Matrix.Translation((math.cos(a) * 0.822, math.sin(a) * 0.822, 0.0))
                @ Matrix.Rotation(a, 4, "Z")
                @ Matrix.Rotation(math.pi / 4, 4, "Z")
            )
            bm_add_beveled_box(bm_r3, 0.046, 0.046, 0.064, matrix=m_dia, bevel=0.006, segs=1)
        else:
            m_tk = Matrix.Translation((math.cos(a) * 0.812, math.sin(a) * 0.812, 0.0)) @ Matrix.Rotation(a, 4, "Z")
            bm_add_beveled_box(bm_r3, 0.018, 0.012, 0.036, matrix=m_tk, bevel=0.0, segs=1)
    finalize_bmesh_object("MasterLedger_Orbit_Outer", bm_r3, mats["brass"], col, parent=root, rotation=r3_rot)

    return col, root


# ---------------------------------------------------------------------------
# PROP 9: 3D Broadcast Stage Monolith (stage_monolith.glb)
# Coordinate mapping (Blender Z-up -> glTF Y-up):
#   glTF X =  Blender X
#   glTF Y =  Blender Z   (aperture center glTF Y = +0.12 => Blender Z = +0.12)
#   glTF Z = -Blender Y   (portrait front glTF Z = +0.06  => Blender Y = -0.06)
#                         (rear halo      glTF Z = -0.20  => Blender Y = +0.20)
# Aperture: 1.42 wide (X in [-0.71, +0.71]) x 1.88 tall (Z_bl in [-0.82, +1.06])
# ---------------------------------------------------------------------------
def build_stage_monolith(mats):
    col = make_collection("Stage_Monolith")
    root = make_root_empty("Stage_Monolith_Root", col)

    # 1. Honed Obsidian Backing Monolith (behind portrait plane at glTF Z = +0.06 -> Blender Y = -0.06)
    # Front face at Blender Y = -0.015 (glTF Z = +0.015), cleanly behind portrait!
    bm_back = bmesh.new()
    bm_add_beveled_box(bm_back, 1.50, 0.095, 1.98, matrix=Matrix.Translation((0.0, 0.032, 0.12)), bevel=0.014, segs=2)
    # Architectural rear vertical stepped obsidian fins for 3D depth from side/back angles
    for rx in (-0.54, -0.27, 0.0, 0.27, 0.54):
        bm_add_beveled_box(bm_back, 0.075, 0.055, 1.82, matrix=Matrix.Translation((rx, 0.095, 0.12)), bevel=0.009, segs=1)
    # Subtle concave curved inner framing bezel border (outside 1.42 x 1.88 clear portrait aperture)
    for sx in (-1.0, 1.0):
        bm_add_beveled_box(bm_back, 0.055, 0.070, 1.94, matrix=Matrix.Translation((sx * 0.745, -0.035, 0.12)), bevel=0.010, segs=2)
    finalize_bmesh_object("Monolith_Backing", bm_back, mats["obsidian"], col, parent=root)

    # 2. Sculpted Chamfered Side Pillars (X = +/- 0.80, framing aperture, projecting gently forward)
    bm_pil_obs = bmesh.new()
    bm_pil_br = bmesh.new()
    for sx in (-1.0, 1.0):
        # Main chamfered obsidian structural side monolith column
        bm_add_beveled_box(bm_pil_obs, 0.115, 0.185, 2.04, matrix=Matrix.Translation((sx * 0.815, 0.005, 0.12)), bevel=0.018, segs=2)
        # Forward-facing sculpted brushed-brass vertical edge rail (glTF Z = +0.075 -> Blender Y = -0.075)
        bm_add_beveled_box(bm_pil_br, 0.044, 0.072, 2.00, matrix=Matrix.Translation((sx * 0.768, -0.068, 0.12)), bevel=0.008, segs=2)
        # Outer brushed-brass stepped architectural flank trim
        bm_add_beveled_box(bm_pil_br, 0.032, 0.125, 1.92, matrix=Matrix.Translation((sx * 0.875, 0.015, 0.12)), bevel=0.007, segs=2)
        # 3 Horizontal machined brass structural clamp collars wrapping each pillar
        for cz in (-0.42, 0.12, 0.66):
            bm_add_beveled_box(bm_pil_br, 0.145, 0.215, 0.056, matrix=Matrix.Translation((sx * 0.818, 0.002, cz)), bevel=0.009, segs=1)
    finalize_bmesh_object("Monolith_Pillars_Obsidian", bm_pil_obs, mats["obsidian_matte"], col, parent=root)
    finalize_bmesh_object("Monolith_Pillars_Brass", bm_pil_br, mats["brass"], col, parent=root)

    # 3. Crown Cornice with 24 Machined Horological Micro-Notches (Z_bl = +1.07 .. +1.28)
    bm_cr_obs = bmesh.new()
    bm_cr_br = bmesh.new()
    # Gently swept curved broadcast header lintel (arch profile in XY curving slightly toward viewer at ends)
    cornice_prof = [(-0.088, -0.055), (0.095, -0.055), (0.108, 0.025), (0.068, 0.062), (-0.078, 0.062), (-0.098, 0.015)]
    pts_c = []
    for s in range(13):
        t = (s / 12.0) * 2.0 - 1.0  # -1..+1
        x = t * 0.90
        y = 0.015 - 0.045 * (t * t)  # gentle cinematic concave curve framing the stage!
        z = 1.135 + 0.022 * (1.0 - t * t)
        pts_c.append((x, y, z))
    bm_sweep_tube(bm_cr_obs, pts_c, cornice_prof, closed=False, cap_ends=True)

    # Upper stepped brass crown molding bar
    bm_add_beveled_box(bm_cr_br, 1.86, 0.165, 0.042, matrix=Matrix.Translation((0.0, -0.012, 1.215)), bevel=0.008, segs=2)
    bm_add_beveled_box(bm_cr_br, 1.66, 0.120, 0.028, matrix=Matrix.Translation((0.0, -0.018, 1.072)), bevel=0.006, segs=1)

    # 24 Precision Horological Micro-Notches carved across the crown frieze!
    for i in range(24):
        u = (i / 23.0) * 2.0 - 1.0
        nx = u * 0.78
        ny = -0.092 - 0.036 * (u * u)
        nz = 1.148 + 0.018 * (1.0 - u * u)
        is_ctr = abs(u) < 0.06
        bm_add_beveled_box(
            bm_cr_br,
            0.018 if not is_ctr else 0.032,
            0.036,
            0.058 if (i % 4 == 0) else 0.038,
            matrix=Matrix.Translation((nx, ny, nz)),
            bevel=0.003,
            segs=1,
        )
    # Central sovereign diamond finial atop crown
    bm_add_beveled_box(
        bm_cr_br, 0.095, 0.065, 0.095,
        matrix=Matrix.Translation((0.0, -0.035, 1.245)) @ Matrix.Rotation(math.pi / 4, 4, "Y"),
        bevel=0.009, segs=1
    )
    finalize_bmesh_object("Monolith_Cornice_Obsidian", bm_cr_obs, mats["obsidian"], col, parent=root)
    finalize_bmesh_object("Monolith_Cornice_Brass", bm_cr_br, mats["brass"], col, parent=root)

    # 4. Stepped Base Console (Z_bl = -1.10 .. -0.83, projecting forward to glTF Z = +0.16 -> Blender Y = -0.16)
    bm_base_obs = bmesh.new()
    bm_base_br = bmesh.new()
    bm_add_beveled_box(bm_base_obs, 1.76, 0.255, 0.088, matrix=Matrix.Translation((0.0, -0.035, -0.880)), bevel=0.014, segs=2)
    bm_add_beveled_box(bm_base_obs, 1.92, 0.315, 0.098, matrix=Matrix.Translation((0.0, -0.048, -0.975)), bevel=0.016, segs=2)
    bm_add_beveled_box(bm_base_obs, 2.04, 0.355, 0.068, matrix=Matrix.Translation((0.0, -0.052, -1.060)), bevel=0.014, segs=2)
    # Brushed-brass stepped horizontal console trim rails + angled telemetry front strip
    bm_add_beveled_box(bm_base_br, 1.80, 0.268, 0.024, matrix=Matrix.Translation((0.0, -0.038, -0.832)), bevel=0.005, segs=1)
    bm_add_beveled_box(bm_base_br, 1.96, 0.326, 0.026, matrix=Matrix.Translation((0.0, -0.050, -0.928)), bevel=0.006, segs=1)
    bm_add_beveled_box(bm_base_br, 2.08, 0.366, 0.024, matrix=Matrix.Translation((0.0, -0.054, -1.022)), bevel=0.005, segs=1)
    # Center sculpted brass console emblem plate
    bm_add_beveled_box(
        bm_base_br, 0.38, 0.045, 0.072,
        matrix=Matrix.Translation((0.0, -0.195, -0.965)) @ Matrix.Rotation(math.radians(-18), 4, "X"),
        bevel=0.008, segs=1
    )
    finalize_bmesh_object("Monolith_Base_Obsidian", bm_base_obs, mats["obsidian"], col, parent=root)
    finalize_bmesh_object("Monolith_Base_Brass", bm_base_br, mats["brass"], col, parent=root)

    # 5. Recessed Front & Rear Subtle Light-Strip Channels
    bm_lights = bmesh.new()
    for sx in (-1.0, 1.0):
        # Inner side-pillar portrait accent light strip (glTF Z = +0.05 -> Blender Y = -0.05)
        bm_add_beveled_box(bm_lights, 0.016, 0.022, 1.78, matrix=Matrix.Translation((sx * 0.735, -0.050, 0.12)), bevel=0.003, segs=1)
        # Recessed rear broadcast indirect wash light-strip channel (glTF Z = -0.105 -> Blender Y = +0.105)
        bm_add_beveled_box(bm_lights, 0.024, 0.020, 1.86, matrix=Matrix.Translation((sx * 0.805, 0.102, 0.12)), bevel=0.004, segs=1)
    # Subtle rear top & base indirect light bars
    bm_add_beveled_box(bm_lights, 1.48, 0.020, 0.022, matrix=Matrix.Translation((0.0, 0.105, 1.13)), bevel=0.003, segs=1)
    bm_add_beveled_box(bm_lights, 1.56, 0.020, 0.022, matrix=Matrix.Translation((0.0, -0.155, -0.875)), bevel=0.003, segs=1)
    finalize_bmesh_object("Monolith_Light_Channels", bm_lights, mats["glow_trim"], col, parent=root, smooth=False, weighted_normal=False)

    # 6. Architectural Rear Halo Bracket (centered at glTF Y = +0.24, Z = -0.20 => Blender Y = +0.20, Z = +0.24)
    halo_center = (0.0, 0.20, 0.24)
    bm_halo = bm_lathe(stepped_ring_profile(1.135, 1.215, 0.026, 0.010, 0.008), segs=64)
    # 12 sculpted degree lugs around rear halo ring
    for i in range(12):
        a = (2.0 * math.pi * i) / 12.0
        m_lg = Matrix.Translation((math.cos(a) * 1.225, math.sin(a) * 1.225, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_halo, 0.045, 0.028, 0.064, matrix=m_lg, bevel=0.005, segs=1)
    # Rotate into vertical XZ plane at halo_center
    bmesh.ops.transform(
        bm_halo,
        matrix=Matrix.Translation(halo_center) @ Matrix.Rotation(math.pi / 2, 4, "X"),
        verts=list(bm_halo.verts),
    )
    # 4 Structural Mounting Bracket Struts connecting halo ring forward into rear obsidian backing!
    strut_prof = [(-0.024, -0.018), (0.024, -0.018), (0.024, 0.018), (-0.024, 0.018)]
    for ang_deg in (38, 142, 218, 322):
        a = math.radians(ang_deg)
        p_ring = Vector((math.cos(a) * 1.15, 0.20, 0.24 + math.sin(a) * 1.15))
        p_mid = Vector((math.cos(a) * 0.88, 0.16, 0.24 + math.sin(a) * 0.88))
        p_back = Vector((max(-0.68, min(0.68, math.cos(a) * 0.72)), 0.08, max(-0.72, min(0.98, 0.24 + math.sin(a) * 0.72))))
        bm_sweep_tube(bm_halo, [p_ring, p_mid, p_back], strut_prof, closed=False, cap_ends=True)

    finalize_bmesh_object("Monolith_Rear_Halo", bm_halo, mats["brass"], col, parent=root)

    return col, root


# ---------------------------------------------------------------------------
# PROP 10: 3D World Globe Gimbal Rig (world_globe_rig.glb)
# Surrounds a radius 1.35 Earth sphere centered at (0, 0, 0) with full clearance
# (inner radius >= 1.56 for rings/bearings so Earth + atmosphere + pins never clip!)
# ---------------------------------------------------------------------------
def build_world_globe_rig(mats):
    col = make_collection("World_Globe_Rig")
    root = make_root_empty("World_Globe_Rig_Root", col)

    # 1. Beveled Inclined Equatorial Vernier Ring (r_in = 1.61, r_out = 1.72, inclined 23.5 deg)
    # With 36 sculpted degree ticks + 4 compass vernier index brackets!
    eq_rot = (math.radians(23.5), math.radians(-8.0), 0.0)
    bm_eq_br = bm_lathe(stepped_ring_profile(1.61, 1.72, 0.044, 0.016, 0.012), segs=72)
    bm_eq_obs = bm_lathe(chamfered_rect_profile(1.645, 1.685, 0.049, 0.005), segs=72)

    for i in range(36):
        a = (2.0 * math.pi * i) / 36.0
        is_card = (i % 9 == 0)
        is_major = (i % 3 == 0)
        if is_card:
            # Sculpted cardinal vernier compass bracket
            m_b = Matrix.Translation((math.cos(a) * 1.735, math.sin(a) * 1.735, 0.0)) @ Matrix.Rotation(a, 4, "Z")
            bm_add_beveled_box(bm_eq_br, 0.095, 0.088, 0.115, matrix=m_b, bevel=0.010, segs=1)
        else:
            r_tk = 1.738 if is_major else 1.728
            m_t = Matrix.Translation((math.cos(a) * r_tk, math.sin(a) * r_tk, 0.0)) @ Matrix.Rotation(a, 4, "Z")
            bm_add_beveled_box(
                bm_eq_br,
                0.048 if is_major else 0.030,
                0.026 if is_major else 0.018,
                0.068 if is_major else 0.042,
                matrix=m_t, bevel=0.004, segs=1,
            )

    finalize_bmesh_object("Equatorial_Vernier_Brass", bm_eq_br, mats["brass"], col, parent=root, rotation=eq_rot)
    finalize_bmesh_object("Equatorial_Vernier_Obsidian", bm_eq_obs, mats["obsidian"], col, parent=root, rotation=eq_rot)

    # 2. Twin Orthogonal Chamfered Meridian Arcs (r = 1.74..1.81 passing through +/-Z poles)
    for arc_idx, az in enumerate((0.0, math.pi / 2.0)):
        bm_arc = bm_lathe(stepped_ring_profile(1.745, 1.815, 0.032, 0.012, 0.010), segs=72)
        # 24 sculpted meridian latitude degree lugs
        for i in range(24):
            a = (2.0 * math.pi * i) / 24.0
            # Skip exact poles where polar finials mount
            if abs(math.sin(a)) > 0.96:
                continue
            m_l = Matrix.Translation((math.cos(a) * 1.825, math.sin(a) * 1.825, 0.0)) @ Matrix.Rotation(a, 4, "Z")
            bm_add_beveled_box(bm_arc, 0.030, 0.022, 0.048, matrix=m_l, bevel=0.004, segs=1)
        # Machined trunnion collar bosses at equatorial crossing
        for sx in (-1.0, 1.0):
            m_tr = Matrix.Translation((sx * 1.78, 0.0, 0.0)) @ Matrix.Rotation(math.pi / 2, 4, "Y")
            bm_add_prism_cyl(bm_arc, 0.068, 0.062, 0.11, segs=12, matrix=m_tr, bevel=0.008)

        arc_rot = (math.pi / 2.0, 0.0, az)
        finalize_bmesh_object(f"Meridian_Arc_{arc_idx + 1}", bm_arc, mats["brass"] if arc_idx == 0 else mats["bronze"], col, parent=root, rotation=arc_rot)

    # 3. Polar Pivot Finials (North +Z & South -Z; axial pins stop at |Z| = 1.54, clearing 1.35 Earth!)
    bm_pol_br = bmesh.new()
    bm_pol_obs = bmesh.new()

    # North Pole turned lathe finial & inward bearing pin
    north_prof = [
        (0.004, 1.54), (0.028, 1.58), (0.052, 1.66), (0.095, 1.71),
        (0.145, 1.75), (0.145, 1.82), (0.105, 1.86), (0.068, 1.90),
        (0.088, 1.94), (0.042, 1.99), (0.012, 2.11), (0.002, 2.12),
    ]
    bm_n = bm_lathe(north_prof, segs=28, closed_profile=False, cap_ends=True)
    vmap = {v: bm_pol_br.verts.new(v.co) for v in bm_n.verts}
    for f in bm_n.faces:
        try:
            bm_pol_br.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_n.free()

    # South Pole turned observatory bearing collar & stem descending to compass base
    south_prof = [
        (0.004, -1.54), (0.028, -1.58), (0.052, -1.66), (0.095, -1.71),
        (0.148, -1.75), (0.148, -1.83), (0.105, -1.87), (0.075, -1.94),
        (0.115, -2.02), (0.002, -2.03),
    ]
    # Reverse profile winding for negative Z so normals stay outward
    bm_s = bm_lathe(list(reversed(south_prof)), segs=28, closed_profile=False, cap_ends=True)
    vmap = {v: bm_pol_br.verts.new(v.co) for v in bm_s.verts}
    for f in bm_s.faces:
        try:
            bm_pol_br.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_s.free()

    # Obsidian inset bands on North & South polar bearing caps
    for pz in (1.785, -1.79):
        bm_po = bm_lathe(chamfered_rect_profile(0.132, 0.156, 0.024, 0.005), segs=28)
        bmesh.ops.transform(bm_po, matrix=Matrix.Translation((0, 0, pz)), verts=list(bm_po.verts))
        vmap = {v: bm_pol_obs.verts.new(v.co) for v in bm_po.verts}
        for f in bm_po.faces:
            try:
                bm_pol_obs.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_po.free()

    finalize_bmesh_object("Polar_Finials_Brass", bm_pol_br, mats["gold_polished"], col, parent=root)
    finalize_bmesh_object("Polar_Finials_Obsidian", bm_pol_obs, mats["obsidian"], col, parent=root)

    # 4. Sleek Angled Brass Compass Base Ring (Z = -1.96..-2.10) + 4 Sweeping Cradle Buttress Arms
    base_tilt = (math.radians(5.5), 0.0, 0.0)
    bm_base_br = bm_lathe(stepped_ring_profile(0.98, 1.24, 0.055, 0.024, 0.016), segs=64)
    bm_base_obs = bm_lathe(chamfered_rect_profile(0.86, 1.02, 0.038, 0.009), segs=64)
    # 16 Sculpted compass rose degree notches around the outer compass base ring
    for i in range(16):
        a = (2.0 * math.pi * i) / 16.0
        is_c = (i % 4 == 0)
        m_c = Matrix.Translation((math.cos(a) * 1.255, math.sin(a) * 1.255, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(
            bm_base_br,
            0.075 if is_c else 0.042,
            0.048 if is_c else 0.026,
            0.078 if is_c else 0.048,
            matrix=m_c, bevel=0.006, segs=1
        )
    # Inner hub ring & 4 compass cross-spokes tying base ring to South Polar stem
    bm_hub = bm_lathe(chamfered_rect_profile(0.11, 0.24, 0.045, 0.009), segs=24)
    vmap = {v: bm_base_br.verts.new(v.co) for v in bm_hub.verts}
    for f in bm_hub.faces:
        try:
            bm_base_br.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    bm_hub.free()

    for k in range(4):
        a = k * math.pi / 2.0
        m_sp = Matrix.Translation((math.cos(a) * 0.60, math.sin(a) * 0.60, 0.0)) @ Matrix.Rotation(a, 4, "Z")
        bm_add_beveled_box(bm_base_br, 0.84, 0.052, 0.040, matrix=m_sp, bevel=0.006, segs=1)

    bmesh.ops.transform(
        bm_base_br,
        matrix=Matrix.Translation((0.0, 0.0, -2.01)) @ Euler(base_tilt).to_matrix().to_4x4(),
        verts=list(bm_base_br.verts),
    )
    bmesh.ops.transform(
        bm_base_obs,
        matrix=Matrix.Translation((0.0, 0.0, -2.01)) @ Euler(base_tilt).to_matrix().to_4x4(),
        verts=list(bm_base_obs.verts),
    )

    # 4 Sweeping Curved Brass Support Buttress Arms rising from Compass Base Ring to Lower Meridian Arcs
    butt_prof = [(-0.026, -0.020), (0.026, -0.020), (0.032, 0.0), (0.026, 0.020), (-0.026, 0.020), (-0.032, 0.0)]
    for k in range(4):
        a = k * math.pi / 2.0
        ca, sa = math.cos(a), math.sin(a)
        pts_arm = []
        scales = []
        for s in range(11):
            t = s / 10.0
            # Curve gracefully outward & upward from compass base (r=1.12, z=-1.98) to meridian arc (r=1.78 at -46 deg)
            r = 1.12 * (1.0 - t) + 1.24 * t + 0.16 * math.sin(t * math.pi)
            z = -1.98 * (1.0 - t) + (-1.28) * t - 0.08 * math.sin(t * math.pi)
            pts_arm.append((r * ca, r * sa, z))
            scales.append(1.15 - 0.35 * t)
        bm_sweep_tube(bm_base_br, pts_arm, butt_prof, closed=False, cap_ends=True, scales=scales)

    finalize_bmesh_object("Compass_Base_Brass", bm_base_br, mats["brass"], col, parent=root)
    finalize_bmesh_object("Compass_Base_Obsidian", bm_base_obs, mats["obsidian"], col, parent=root)

    return col, root


# ---------------------------------------------------------------------------
# GLB Exporter + Binary GLB Bounds Validator
# ---------------------------------------------------------------------------
def inspect_glb_bounds(glb_path: str):
    """Parses the exported binary GLB JSON chunk directly to verify actual Y-up glTF bounds."""
    with open(glb_path, "rb") as f:
        magic, version, length = struct.unpack("<4sII", f.read(12))
        if magic != b"glTF":
            return None
        chunk_len, chunk_type = struct.unpack("<II", f.read(8))
        raw_json = f.read(chunk_len).decode("utf-8")
    data = json.loads(raw_json)
    meshes = data.get("meshes", [])
    accessors = data.get("accessors", [])
    total_tris = 0
    for mesh in meshes:
        for prim in mesh.get("primitives", []):
            idx_acc = prim.get("indices")
            if idx_acc is not None:
                total_tris += accessors[idx_acc]["count"] // 3
    return {
        "meshes": len(meshes),
        "nodes": len(data.get("nodes", [])),
        "materials": len(data.get("materials", [])),
        "images": len(data.get("images", [])),
        "glb_tris": total_tris,
    }


def export_asset_glb(root_obj, filename: str):
    """Exports the given root Empty + all mesh children cleanly to Web & Godot GLB targets."""
    for o in bpy.data.objects:
        o.select_set(False)

    targets = [root_obj] + [o for o in bpy.data.objects if o.parent == root_obj]
    for o in targets:
        o.hide_viewport = False
        o.select_set(True)
    bpy.context.view_layer.objects.active = root_obj

    web_path = os.path.join(OUT_WEB_DIR, filename)
    godot_path = os.path.join(OUT_GODOT_DIR, filename)

    bpy.ops.export_scene.gltf(
        filepath=web_path,
        export_format="GLB",
        use_selection=True,
        export_yup=True,
        export_apply=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_draco_mesh_compression_enable=False,
    )
    shutil.copy2(web_path, godot_path)

    fsize = os.path.getsize(web_path)
    glb_info = inspect_glb_bounds(web_path)
    return web_path, godot_path, fsize, glb_info


# ---------------------------------------------------------------------------
# Studio Gallery Showcase Scene (1440x810 3-Point Gold/Slate Render)
# ---------------------------------------------------------------------------
def build_showcase_and_render(relic_entries, non_relic_collections, mats):
    """
    Arranges linked showcase copies of all 8 relics on a sleek 2x4 museum gallery grid
    with 3-point gold/slate studio lighting and renders assets/renders/relics_showcase.png.
    """
    # Hide canonical origin-centered asset collections from render so showcase is spotless
    for _, col, _ in relic_entries:
        col.hide_render = True
        col.hide_viewport = True
    for col in non_relic_collections:
        col.hide_render = True
        col.hide_viewport = True

    stage_col = make_collection("Studio_Showcase")

    # Dark curved studio gallery floor + cyclorama backdrop
    bm_floor = bmesh.new()
    bm_add_beveled_box(bm_floor, 22.0, 18.0, 0.20, matrix=Matrix.Translation((0.0, 1.5, -1.10)), bevel=0.02, segs=1)
    # Matte rear cyclorama wall
    bm_add_beveled_box(bm_floor, 22.0, 0.25, 11.0, matrix=Matrix.Translation((0.0, 6.2, 3.8)), bevel=0.02, segs=1)
    finalize_bmesh_object("Showcase_Backdrop", bm_floor, mats["studio_floor"], stage_col, smooth=True)

    # 2x4 Tiered Museum Gallery Grid — framed with crisp luxury breathing room in 1440x810!
    # Top row (back, elevated +1.82 in Z): Geneva, London, Tokyo, Rio
    # Bottom row (front, Z = 0.0): Cairo, Reykjavik, Singapore, Apex Forum
    cols_x = [-3.05, -1.02, 1.02, 3.05]
    rows_yz = [
        (1.45, 1.85),   # Back row (elevated gallery tier — completely clear of front row!)
        (-0.55, 0.00),  # Front row
    ]
    hero_angles = [
        (math.radians(8), math.radians(-10), math.radians(18)),   # Astrolabe
        (math.radians(6), math.radians(8), math.radians(-22)),    # Orrery
        (math.radians(10), math.radians(-6), math.radians(28)),   # Origami Prism
        (math.radians(8), math.radians(6), math.radians(15)),     # Emerald Sphere
        (math.radians(10), math.radians(-8), math.radians(22)),   # Cipher Box
        (math.radians(8), math.radians(6), math.radians(-18)),    # Cryo Relay
        (math.radians(8), math.radians(-6), math.radians(16)),    # Council Seal
        (math.radians(12), math.radians(8), math.radians(-24)),   # Master Ledger
    ]

    for idx, (label, src_col, src_root) in enumerate(relic_entries):
        row = idx // 4
        col_i = idx % 4
        gx = cols_x[col_i]
        gy, gz = rows_yz[row]

        # Sleek obsidian museum pedestal disc + glowing hairline gold rim beneath each relic
        ped_z = gz - 0.90
        bm_ped = bmesh.new()
        bm_add_prism_cyl(bm_ped, 0.64, 0.56, 0.14, segs=24, matrix=Matrix.Translation((gx, gy, ped_z)), bevel=0.012)
        finalize_bmesh_object(f"Showcase_Ped_{idx}", bm_ped, mats["studio_plinth"], stage_col)

        bm_pr = bm_lathe(chamfered_rect_profile(0.545, 0.578, 0.012, 0.004), segs=32)
        finalize_bmesh_object(f"Showcase_PedRim_{idx}", bm_pr, mats["brass"], stage_col, location=(gx, gy, ped_z + 0.072))

        # Back-row architectural riser column descending to floor
        if row == 0:
            bm_riser = bmesh.new()
            bm_add_prism_cyl(bm_riser, 0.42, 0.48, 1.92, segs=16, matrix=Matrix.Translation((gx, gy, ped_z - 1.02)), bevel=0.012)
            finalize_bmesh_object(f"Showcase_Riser_{idx}", bm_riser, mats["studio_plinth"], stage_col)

        # Duplicate relic hierarchy cleanly onto its showcase plinth
        holder = make_root_empty(f"Showcase_{label}", stage_col)
        holder.location = (gx, gy, gz + 0.04)
        holder.rotation_euler = hero_angles[idx]

        for child in src_col.objects:
            if child.type == "MESH":
                dup = child.copy()
                dup.data = child.data  # linked mesh data keeps .blend lean!
                dup.parent = holder
                dup.hide_render = False
                dup.hide_viewport = False
                stage_col.objects.link(dup)

    # Studio World Environment (rich dark slate-indigo ambient with subtle studio reflection bounce)
    world = bpy.data.worlds.new("Studio_World")
    bpy.context.scene.world = world
    world.use_nodes = True
    wnt = world.node_tree
    wnt.nodes.clear()
    w_out = wnt.nodes.new("ShaderNodeOutputWorld")
    w_bg = wnt.nodes.new("ShaderNodeBackground")
    w_bg.inputs["Color"].default_value = _srgb_to_linear("#101A2E")
    w_bg.inputs["Strength"].default_value = 0.95
    wnt.links.new(w_bg.outputs["Background"], w_out.inputs["Surface"])

    # 3-Point Sovereign Gold / Cool Slate Lighting Rig
    def add_area_light(name, loc, target, energy, color_hex, size_x, size_y):
        ldata = bpy.data.lights.new(name=name, type="AREA")
        ldata.energy = energy
        ldata.color = _srgb_to_linear(color_hex)[:3]
        ldata.shape = "RECTANGLE"
        ldata.size = size_x
        ldata.size_y = size_y
        lobj = bpy.data.objects.new(name=name, object_data=ldata)
        lobj.location = loc
        direction = Vector(target) - Vector(loc)
        lobj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        stage_col.objects.link(lobj)
        return lobj

    # Warm Champagne Gold Key Light (upper front-right)
    add_area_light("Key_Gold", (6.5, -7.2, 6.8), (0.0, 0.4, 0.90), 1750.0, "#FFE4B5", 6.5, 4.2)
    # Cool Slate-Sapphire Fill Light (front-left)
    add_area_light("Fill_Slate", (-7.4, -6.4, 4.0), (0.0, 0.5, 0.85), 880.0, "#86C2FA", 6.5, 4.2)
    # Crisp Overhead / Back Rim Light (separates dark obsidian & basalt silhouettes dramatically!)
    add_area_light("Rim_Back", (0.0, 5.2, 6.2), (0.0, 0.5, 0.85), 2100.0, "#CBE6FF", 10.5, 2.4)
    # Subtle warm grazing kick from below-front so metallic bevels sparkle
    add_area_light("Kick_Warm", (0.0, -8.2, 0.6), (0.0, 0.4, 0.90), 420.0, "#FFD790", 8.5, 1.8)

    # Studio 50mm Camera pulled back cleanly so ALL 8 relics + pedestals have museum gallery margin!
    cam_data = bpy.data.cameras.new("Showcase_Camera")
    cam_data.lens = 48.0
    cam_data.clip_start = 0.1
    cam_data.clip_end = 100.0
    cam_obj = bpy.data.objects.new("Showcase_Camera", cam_data)
    cam_pos = Vector((0.0, -11.4, 2.45))
    cam_target = Vector((0.0, 0.45, 0.88))
    cam_obj.location = cam_pos
    cam_obj.rotation_euler = (cam_target - cam_pos).to_track_quat("-Z", "Y").to_euler()
    stage_col.objects.link(cam_obj)

    scene = bpy.context.scene
    scene.camera = cam_obj
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1440
    scene.render.resolution_y = 810
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = OUT_RENDER_PATH

    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 64
    if hasattr(scene.eevee, "use_raytracing"):
        scene.eevee.use_raytracing = True
    if hasattr(scene.eevee, "use_shadows"):
        scene.eevee.use_shadows = True

    try:
        scene.view_settings.view_transform = "AgX"
        scene.view_settings.look = "AgX - Medium High Contrast"
        scene.view_settings.exposure = 0.15
    except Exception:
        pass

    # Save master .blend file with all canonical collections + showcase stage intact!
    bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND_PATH)

    # Render 1440x810 studio showcase PNG
    bpy.ops.render.render(write_still=True)


# ---------------------------------------------------------------------------
# Main Orchestrator
# ---------------------------------------------------------------------------
def main():
    log_lines = []
    def log(msg: str):
        print(msg, flush=True)
        log_lines.append(msg)

    try:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        log(f"=== World's Smartest Blender {bpy.app.version_string} Relic & Prop Pipeline ===")

        textures = build_procedural_textures()
        mats = build_material_library(textures)
        log(f"Materials built: {len(mats)} | Packed procedural textures: {len(textures)}")

        relic_builders = [
            ("relic_meridian_astrolabe.glb", "Meridian_Astrolabe", build_relic_meridian_astrolabe),
            ("relic_armillary_orrery.glb",   "Armillary_Orrery",   build_relic_armillary_orrery),
            ("relic_origami_prism.glb",      "Origami_Prism",      build_relic_origami_prism),
            ("relic_emerald_sphere.glb",     "Emerald_Sphere",     build_relic_emerald_sphere),
            ("relic_cipher_box.glb",         "Cipher_Box",         build_relic_cipher_box),
            ("relic_cryo_relay.glb",         "Cryo_Relay",         build_relic_cryo_relay),
            ("relic_council_seal.glb",       "Council_Seal",       build_relic_council_seal),
            ("relic_master_ledger.glb",      "Master_Ledger",      build_relic_master_ledger),
        ]

        relic_entries = []
        summary_records = []

        for filename, label, fn in relic_builders:
            col, root = fn(mats)
            tris, mn, mx, max_r = clamp_relic_bounds(root, target_max_radius=0.84)
            web_p, godot_p, fsize, glb_info = export_asset_glb(root, filename)
            relic_entries.append((label, col, root))
            summary_records.append({
                "file": filename,
                "tris": tris,
                "glb_tris": glb_info["glb_tris"] if glb_info else tris,
                "bytes": fsize,
                "radius": round(max_r, 4),
                "min_xyz_bl": [round(mn.x, 3), round(mn.y, 3), round(mn.z, 3)],
                "max_xyz_bl": [round(mx.x, 3), round(mx.y, 3), round(mx.z, 3)],
            })
            log(
                f"[RELIC] {filename:32s} | tris={tris:5d} (glb={glb_info['glb_tris']:5d}) | "
                f"radius={max_r:.3f} | size={fsize/1024:6.1f} KB"
            )

        # Build & export Stage Monolith + World Globe Rig
        non_relic_cols = []
        for filename, fn in [
            ("stage_monolith.glb", build_stage_monolith),
            ("world_globe_rig.glb", build_world_globe_rig),
        ]:
            col, root = fn(mats)
            bpy.context.view_layer.update()
            tris, mn, mx, max_r = get_hierarchy_stats(root)
            web_p, godot_p, fsize, glb_info = export_asset_glb(root, filename)
            non_relic_cols.append(col)
            # Report glTF Y-up AABB directly: glTF(X, Y, Z) = (bl.X, bl.Z, -bl.Y)
            gltf_min = [round(mn.x, 3), round(mn.z, 3), round(-mx.y, 3)]
            gltf_max = [round(mx.x, 3), round(mx.z, 3), round(-mn.y, 3)]
            summary_records.append({
                "file": filename,
                "tris": tris,
                "glb_tris": glb_info["glb_tris"] if glb_info else tris,
                "bytes": fsize,
                "radius": round(max_r, 4),
                "gltf_min": gltf_min,
                "gltf_max": gltf_max,
            })
            log(
                f"[PROP ] {filename:32s} | tris={tris:5d} (glb={glb_info['glb_tris']:5d}) | "
                f"glTF_AABB={gltf_min}..{gltf_max} | size={fsize/1024:6.1f} KB"
            )

        # Arrange studio gallery, save .blend, and render 1440x810 showcase PNG
        log("Saving master .blend and rendering 1440x810 studio showcase PNG...")
        build_showcase_and_render(relic_entries, non_relic_cols, mats)

        blend_kb = os.path.getsize(OUT_BLEND_PATH) / 1024.0 if os.path.exists(OUT_BLEND_PATH) else 0.0
        png_kb = os.path.getsize(OUT_RENDER_PATH) / 1024.0 if os.path.exists(OUT_RENDER_PATH) else 0.0
        log(f"[BLEND] {OUT_BLEND_PATH} ({blend_kb:.1f} KB)")
        log(f"[PNG  ] {OUT_RENDER_PATH} ({png_kb:.1f} KB)")
        log("=== SUMMARY JSON ===")
        log(json.dumps(summary_records, indent=2))
        log("=== BUILD COMPLETE OK ===")

    except Exception as exc:
        log("!!! BUILD FAILED !!!")
        log(traceback.format_exc())
    finally:
        # ALWAYS write final log file at the very end so PowerShell MSIX watcher exits cleanly
        with open(OUT_LOG_PATH, "w", encoding="utf-8") as f:
            f.write("\n".join(log_lines) + "\n")


if __name__ == "__main__":
    main()
