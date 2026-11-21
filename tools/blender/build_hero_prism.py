#!/usr/bin/env python3
"""
World's Smartest — Lead Hard-Surface & Swiss Horology 3D Asset Pipeline (Blender 5.3.0)

Builds museum-grade hard-surface 3D assets directly via bpy + bmesh:
  1. assets/blender/veritas_prism_hero.blend
     -> public/assets/models/veritas_prism_hero.glb  (Target: 12,000–25,000 clean beveled tris)
     -> godot/assets/models/veritas_prism_hero.glb
     Exact 14 top-level named animated hierarchy nodes:
       Core_Spindle, Crown_Top, Crown_Bottom,
       Shutter_0..3, ClampJaw_0..3,
       FacetHousing_Template, Calibrator_Bezel, Calibrator_Needle
  2. assets/blender/stage_plinth.blend
     -> public/assets/models/stage_plinth.glb
     -> godot/assets/models/stage_plinth.glb
  3. assets/renders/veritas_prism_beauty.png (1024x1024 Rembrandt studio render)
  4. assets/renders/hero_prism.log (completion status + GLB binary verification)
"""

import json
import math
import shutil
import struct
import traceback
from pathlib import Path

import bpy
import bmesh
from mathutils import Matrix, Vector

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_PATH = Path(__file__).resolve()
PROJECT_ROOT = SCRIPT_PATH.parents[2]

BLEND_DIR = PROJECT_ROOT / "assets" / "blender"
RENDER_DIR = PROJECT_ROOT / "assets" / "renders"
PUBLIC_MODELS_DIR = PROJECT_ROOT / "public" / "assets" / "models"
GODOT_MODELS_DIR = PROJECT_ROOT / "godot" / "assets" / "models"

HERO_BLEND = BLEND_DIR / "veritas_prism_hero.blend"
HERO_GLB_PUBLIC = PUBLIC_MODELS_DIR / "veritas_prism_hero.glb"
HERO_GLB_GODOT = GODOT_MODELS_DIR / "veritas_prism_hero.glb"

PLINTH_BLEND = BLEND_DIR / "stage_plinth.blend"
PLINTH_GLB_PUBLIC = PUBLIC_MODELS_DIR / "stage_plinth.glb"
PLINTH_GLB_GODOT = GODOT_MODELS_DIR / "stage_plinth.glb"

BEAUTY_PNG = RENDER_DIR / "veritas_prism_beauty.png"
LOG_FILE = RENDER_DIR / "hero_prism.log"

for d in (BLEND_DIR, RENDER_DIR, PUBLIC_MODELS_DIR, GODOT_MODELS_DIR):
    d.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------------------------
# Color & Satin Brushed Metal Normal Map Utilities
# ---------------------------------------------------------------------------
def srgb_channel_to_linear(c: float) -> float:
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def hex_to_linear_rgba(hex_str: str, alpha: float = 1.0):
    h = hex_str.lstrip("#")
    r = srgb_channel_to_linear(int(h[0:2], 16) / 255.0)
    g = srgb_channel_to_linear(int(h[2:4], 16) / 255.0)
    b = srgb_channel_to_linear(int(h[4:6], 16) / 255.0)
    return (r, g, b, alpha)


def create_satin_brushed_normal_image(name: str = "Tex_SatinBrushed_NRM", size: int = 256):
    """Generates a silky, smooth, zero-speckle Swiss watch satin-brushed tangent-space normal map."""
    img = bpy.data.images.new(name=name, width=size, height=size, alpha=False, float_buffer=False)
    img.colorspace_settings.name = "Non-Color"

    # Smooth multi-harmonic brushed satin bands (continuous in Y, ultra-subtle variation in X)
    # Followed by a 3-tap box blur in Y so there is ZERO high-frequency pixel speckle!
    raw_row = [0.0] * size
    for y in range(size):
        v = (y / size) * math.tau
        raw_row[y] = (
            0.35 * math.sin(v * 7.0 + 0.4)
            + 0.25 * math.sin(v * 17.0 + 1.9)
            + 0.20 * math.cos(v * 31.0 + 0.7)
            + 0.14 * math.sin(v * 53.0 + 2.6)
            + 0.08 * math.cos(v * 79.0 + 1.1)
        )
    # 2 passes of periodic smoothing
    for _ in range(2):
        smoothed = [0.0] * size
        for y in range(size):
            smoothed[y] = 0.25 * raw_row[(y - 1) % size] + 0.5 * raw_row[y] + 0.25 * raw_row[(y + 1) % size]
        raw_row = smoothed

    heights = [[0.0] * size for _ in range(size)]
    for y in range(size):
        base_r = raw_row[y]
        v = (y / size) * math.tau
        for x in range(size):
            u = (x / size) * math.tau
            heights[y][x] = base_r * (0.85 + 0.15 * math.cos(u * 2.0 + v * 3.0))

    pixels = [0.0] * (size * size * 4)
    strength = 0.42
    idx = 0
    for y in range(size):
        ym = (y - 1) % size
        yp = (y + 1) % size
        for x in range(size):
            xm = (x - 1) % size
            xp = (x + 1) % size
            dx = (heights[y][xp] - heights[y][xm]) * strength * 0.15
            dy = (heights[yp][x] - heights[ym][x]) * strength
            nx, ny, nz = -dx, -dy, 1.0
            inv_len = 1.0 / math.sqrt(nx * nx + ny * ny + nz * nz)
            pixels[idx] = 0.5 + 0.5 * (nx * inv_len)
            pixels[idx + 1] = 0.5 + 0.5 * (ny * inv_len)
            pixels[idx + 2] = 0.5 + 0.5 * (nz * inv_len)
            pixels[idx + 3] = 1.0
            idx += 4

    img.pixels.foreach_set(pixels)
    img.pack()
    return img


def build_pbr_materials():
    """Creates the 4 canonical Sovereign Modernism Principled BSDF PBR materials."""
    brushed_nrm = create_satin_brushed_normal_image("Tex_SatinBrushed_NRM", 256)

    def make_mat(
        name: str,
        base_hex: str,
        metallic: float,
        roughness: float,
        coat_weight: float = 0.0,
        coat_roughness: float = 0.07,
        emissive_hex: str = None,
        emissive_strength: float = 0.0,
        normal_strength: float = 0.0,
        uv_scale: float = 2.5,
        anisotropic: float = 0.0,
    ):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nt = mat.node_tree
        nodes = nt.nodes
        links = nt.links
        nodes.clear()

        out = nodes.new("ShaderNodeOutputMaterial")
        out.location = (450, 0)

        bsdf = nodes.new("ShaderNodeBsdfPrincipled")
        bsdf.location = (120, 0)
        bsdf.inputs["Base Color"].default_value = hex_to_linear_rgba(base_hex)
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Roughness"].default_value = roughness

        if "Coat Weight" in bsdf.inputs and coat_weight > 0.0:
            bsdf.inputs["Coat Weight"].default_value = coat_weight
        if "Coat Roughness" in bsdf.inputs and coat_weight > 0.0:
            bsdf.inputs["Coat Roughness"].default_value = coat_roughness
        if "Anisotropic" in bsdf.inputs and anisotropic > 0.0:
            bsdf.inputs["Anisotropic"].default_value = anisotropic

        if emissive_hex and emissive_strength > 0.0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = hex_to_linear_rgba(emissive_hex)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emissive_strength

        if normal_strength > 0.0:
            tex_coord = nodes.new("ShaderNodeTexCoord")
            tex_coord.location = (-680, -180)

            mapping = nodes.new("ShaderNodeMapping")
            mapping.location = (-500, -180)
            mapping.inputs["Scale"].default_value = (uv_scale, uv_scale, uv_scale)

            tex_img = nodes.new("ShaderNodeTexImage")
            tex_img.location = (-300, -180)
            tex_img.image = brushed_nrm
            tex_img.extension = "REPEAT"

            nrm_map = nodes.new("ShaderNodeNormalMap")
            nrm_map.location = (-60, -180)
            nrm_map.inputs["Strength"].default_value = normal_strength

            links.new(tex_coord.outputs["UV"], mapping.inputs["Vector"])
            links.new(mapping.outputs["Vector"], tex_img.inputs["Vector"])
            links.new(tex_img.outputs["Color"], nrm_map.inputs["Color"])
            links.new(nrm_map.outputs["Normal"], bsdf.inputs["Normal"])

        links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
        return mat

    return {
        "brass": make_mat(
            "Mat_Champagne_Brass",
            base_hex="#E8C474",
            metallic=0.94,
            roughness=0.22,
            normal_strength=0.032,
            uv_scale=2.2,
            anisotropic=0.38,
        ),
        "obsidian": make_mat(
            "Mat_Honed_Obsidian",
            base_hex="#0A0E17",
            metallic=0.25,
            roughness=0.18,
            coat_weight=0.60,
            coat_roughness=0.07,
            normal_strength=0.0,
        ),
        "titanium": make_mat(
            "Mat_Gunmetal_Titanium",
            base_hex="#2B3445",
            metallic=0.88,
            roughness=0.30,
            normal_strength=0.045,
            uv_scale=2.6,
            anisotropic=0.28,
        ),
        "gold_core": make_mat(
            "Mat_Luminous_Gold_Core",
            base_hex="#F7DF9C",
            metallic=0.20,
            roughness=0.12,
            emissive_hex="#F7DF9C",
            emissive_strength=5.2,
        ),
    }


MAT_BRASS = 0
MAT_OBSIDIAN = 1
MAT_TITANIUM = 2
MAT_GOLD = 3


def attach_materials(obj, mats):
    for key in ("brass", "obsidian", "titanium", "gold_core"):
        obj.data.materials.append(mats[key])


# ---------------------------------------------------------------------------
# Hard-Surface BMesh Sculpting Helpers (Clean Topology & Budget-Tuned)
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


def mark_sharp_by_angle(bm, angle_deg: float = 34.0):
    thresh = math.radians(angle_deg)
    for f in bm.faces:
        f.smooth = True
    for e in bm.edges:
        if len(e.link_faces) == 2:
            e.smooth = e.calc_face_angle(0.0) <= thresh
        else:
            e.smooth = False


def finalize_object(
    name: str,
    bm,
    mats,
    collection,
    location=(0.0, 0.0, 0.0),
    rotation_euler=(0.0, 0.0, 0.0),
    sharp_angle_deg: float = 34.0,
    bevel_width: float = 0.0,
    bevel_segments: int = 1,
    bevel_angle_deg: float = 38.0,
    uv_scale: float = 1.4,
):
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.normal_update()
    apply_box_uvs(bm, scale=uv_scale)
    mark_sharp_by_angle(bm, angle_deg=sharp_angle_deg)

    mesh = bpy.data.meshes.new(name + "_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new(name, mesh)
    obj.location = location
    obj.rotation_euler = rotation_euler
    collection.objects.link(obj)
    attach_materials(obj, mats)

    if bevel_width > 0.0:
        bev = obj.modifiers.new("ChamferBevel", "BEVEL")
        bev.width = bevel_width
        bev.segments = bevel_segments
        bev.limit_method = "ANGLE"
        bev.angle_limit = math.radians(bevel_angle_deg)
        bev.clamp_overlap = True

    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.keep_sharp = True
    wn.weight = 50
    wn.mode = "FACE_AREA"

    return obj


def add_lathe_profile(bm, profile_rz, segments: int, mat_idx: int, closed_profile: bool = False,
                      cap_bottom: bool = False, cap_top: bool = False, angle_offset: float = 0.0,
                      matrix: Matrix = None):
    rings = []
    for r, z in profile_rz:
        ring = []
        for s in range(segments):
            a = angle_offset + (s / segments) * math.tau
            p = Vector((math.cos(a) * r, math.sin(a) * r, z))
            if matrix is not None:
                p = matrix @ p
            ring.append(bm.verts.new(p))
        rings.append(ring)

    new_faces = []
    num_rings = len(rings)
    pair_count = num_rings if closed_profile else num_rings - 1
    for i in range(pair_count):
        r0 = rings[i]
        r1 = rings[(i + 1) % num_rings]
        for s in range(segments):
            sn = (s + 1) % segments
            try:
                f = bm.faces.new((r0[s], r0[sn], r1[sn], r1[s]))
                f.material_index = mat_idx
                f.smooth = True
                new_faces.append(f)
            except ValueError:
                pass

    if cap_bottom and rings:
        try:
            f = bm.faces.new(list(reversed(rings[0])))
            f.material_index = mat_idx
            new_faces.append(f)
        except ValueError:
            pass
    if cap_top and rings:
        try:
            f = bm.faces.new(list(rings[-1]))
            f.material_index = mat_idx
            new_faces.append(f)
        except ValueError:
            pass
    return new_faces


def add_beveled_box(bm, sx: float, sy: float, sz: float, bevel: float, mat_idx: int,
                    matrix: Matrix = None, segments: int = 1):
    ret = bmesh.ops.create_cube(bm, size=1.0)
    verts = ret["verts"]
    scale_m = Matrix.Diagonal((sx, sy, sz, 1.0))
    for v in verts:
        v.co = scale_m @ v.co

    edges = list({e for v in verts for e in v.link_edges})
    faces = list({f for v in verts for f in v.link_faces})
    if bevel > 0.0:
        bev_ret = bmesh.ops.bevel(
            bm,
            geom=edges,
            offset=min(bevel, min(sx, sy, sz) * 0.42),
            segments=segments,
            affect="EDGES",
            clamp_overlap=True,
        )
        all_verts = [v for v in (set(verts) | set(bev_ret["verts"])) if v.is_valid]
        all_faces = [f for f in (set(faces) | set(bev_ret["faces"])) if f.is_valid]
    else:
        all_verts = [v for v in verts if v.is_valid]
        all_faces = [f for f in faces if f.is_valid]

    if matrix is not None:
        bmesh.ops.transform(bm, matrix=matrix, verts=all_verts)

    for f in all_faces:
        if f.is_valid:
            f.material_index = mat_idx
            f.smooth = True
    return all_faces


def add_chamfered_prism_bar(bm, sx: float, sy: float, sz: float, chamfer: float, mat_idx: int,
                            matrix: Matrix = None):
    """Lean 8-sided chamfered rectangular bar (28 tris instead of 60+ tris for thin ticks/ribs!)."""
    hx, hy, hz = sx * 0.5, sy * 0.5, sz * 0.5
    cx = min(chamfer, hx * 0.45)
    cy = min(chamfer, hy * 0.45)
    loop_xy = [
        (-hx + cx, -hy),
        (hx - cx, -hy),
        (hx, -hy + cy),
        (hx, hy - cy),
        (hx - cx, hy),
        (-hx + cx, hy),
        (-hx, hy - cy),
        (-hx, -hy + cy),
    ]
    bot = []
    top = []
    for x, y in loop_xy:
        p0 = Vector((x, y, -hz))
        p1 = Vector((x, y, hz))
        if matrix is not None:
            p0 = matrix @ p0
            p1 = matrix @ p1
        bot.append(bm.verts.new(p0))
        top.append(bm.verts.new(p1))

    faces = []
    for i in range(8):
        inext = (i + 1) % 8
        f = bm.faces.new((bot[i], bot[inext], top[inext], top[i]))
        f.material_index = mat_idx
        f.smooth = True
        faces.append(f)
    fb = bm.faces.new(list(reversed(bot)))
    fb.material_index = mat_idx
    ft = bm.faces.new(top)
    ft.material_index = mat_idx
    faces.extend((fb, ft))
    return faces


def add_chamfered_cylinder(bm, r_bot: float, r_top: float, height: float, segments: int,
                           chamfer: float, mat_idx: int, matrix: Matrix = None):
    hz = height * 0.5
    c = min(chamfer, height * 0.35, min(r_bot, r_top) * 0.45)
    profile = [
        (max(0.001, r_bot - c), -hz),
        (r_bot, -hz + c),
        (r_top, hz - c),
        (max(0.001, r_top - c), hz),
    ]
    return add_lathe_profile(
        bm,
        profile,
        segments=segments,
        mat_idx=mat_idx,
        cap_bottom=True,
        cap_top=True,
        matrix=matrix,
    )


def add_horological_micro_screw(bm, pos: Vector, normal_dir: Vector, radius: float = 0.017,
                                height: float = 0.013):
    """Lean precision watchmaker countersunk hex collar + slotted brass micro-screw (~44 tris)."""
    z_axis = normal_dir.normalized()
    up_ref = Vector((0, 0, 1)) if abs(z_axis.z) < 0.92 else Vector((1, 0, 0))
    x_axis = up_ref.cross(z_axis).normalized()
    y_axis = z_axis.cross(x_axis).normalized()
    rot_m = Matrix((
        (x_axis.x, y_axis.x, z_axis.x, pos.x),
        (x_axis.y, y_axis.y, z_axis.y, pos.y),
        (x_axis.z, y_axis.z, z_axis.z, pos.z),
        (0.0, 0.0, 0.0, 1.0),
    ))

    # Hexagonal gunmetal counterbore bezel collar (6-seg)
    add_lathe_profile(
        bm,
        [(radius * 1.24, 0.0), (radius * 1.14, height * 0.45)],
        segments=6,
        mat_idx=MAT_TITANIUM,
        cap_bottom=False,
        cap_top=True,
        matrix=rot_m,
    )
    # Two split machined brass half-domes forming a real watchmaker screw slot!
    slot_gap = radius * 0.24
    half_w = radius * 0.72
    for side in (-1.0, 1.0):
        add_beveled_box(
            bm,
            sx=radius * 1.62,
            sy=half_w,
            sz=height * 0.58,
            bevel=0.0,
            mat_idx=MAT_BRASS,
            matrix=rot_m @ Matrix.Translation((0.0, side * (slot_gap * 0.5 + half_w * 0.5), height * 0.58)),
        )


def add_curved_arc_extrusion(bm, cross_section_ry, angle_start: float, angle_end: float,
                             arc_steps: int, mat_idx: int, cap_ends: bool = True,
                             taper_fn=None, matrix: Matrix = None):
    rings = []
    n_pts = len(cross_section_ry)
    for i in range(arc_steps + 1):
        t = i / arc_steps
        ang = angle_start + (angle_end - angle_start) * t
        s = math.sin(ang)
        c = math.cos(ang)
        ring = []
        for r, z in cross_section_ry:
            rr, zz = taper_fn(r, z, t) if taper_fn else (r, z)
            p = Vector((s * rr, -c * rr, zz))
            if matrix is not None:
                p = matrix @ p
            ring.append(bm.verts.new(p))
        rings.append(ring)

    faces = []
    for i in range(arc_steps):
        r0 = rings[i]
        r1 = rings[i + 1]
        for j in range(n_pts):
            jn = (j + 1) % n_pts
            try:
                f = bm.faces.new((r0[j], r1[j], r1[jn], r0[jn]))
                f.material_index = mat_idx
                f.smooth = True
                faces.append(f)
            except ValueError:
                pass

    if cap_ends and len(rings) >= 2:
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


def add_extruded_polygon_frame(bm, outer_pts, inner_pts, y_front: float, y_back: float,
                               front_inset: float, back_inset: float, mat_idx: int,
                               matrix: Matrix = None):
    n = len(outer_pts)
    assert len(inner_pts) == n

    def scale_ring(pts, inset_amt, is_outer: bool):
        res = []
        for x, z in pts:
            v = Vector((x, z))
            l = v.length
            if l > 1e-5:
                v = v * (((l - inset_amt) if is_outer else (l + inset_amt)) / l)
            res.append((v.x, v.y))
        return res

    o_fc = scale_ring(outer_pts, front_inset, True)
    o_bc = scale_ring(outer_pts, back_inset, True)
    i_fc = scale_ring(inner_pts, front_inset * 0.85, False)
    i_bc = scale_ring(inner_pts, back_inset * 0.85, False)

    ch_f = front_inset * 0.9
    ch_b = back_inset * 0.9

    ring_specs = [
        (o_fc, y_front),
        (outer_pts, y_front + ch_f),
        (outer_pts, y_back - ch_b),
        (o_bc, y_back),
        (i_bc, y_back),
        (inner_pts, y_back - ch_b),
        (inner_pts, y_front + ch_f),
        (i_fc, y_front),
    ]

    verts_rings = []
    for pts, yv in ring_specs:
        ring = []
        for x, z in pts:
            p = Vector((x, yv, z))
            if matrix is not None:
                p = matrix @ p
            ring.append(bm.verts.new(p))
        verts_rings.append(ring)

    faces = []
    m = len(verts_rings)
    for r_idx in range(m):
        r0 = verts_rings[r_idx]
        r1 = verts_rings[(r_idx + 1) % m]
        for k in range(n):
            kn = (k + 1) % n
            try:
                f = bm.faces.new((r0[k], r0[kn], r1[kn], r1[k]))
                f.material_index = mat_idx
                f.smooth = True
                faces.append(f)
            except ValueError:
                pass
    return faces


# ---------------------------------------------------------------------------
# HERO PIECE 1: Core_Spindle (~5,400 tris)
# ---------------------------------------------------------------------------
def build_core_spindle(mats, collection):
    """
    Deeply fluted 12-channel architectural obsidian core column (upper & lower galleries
    framing an open central lantern vault!), flanked by chamfered brass collars, 24 recessed
    horological micro-screw bolts, an internal diamond brass lattice cage, and a radiant
    hollow faceted luminous gold crystal core gleaming right through the cage!
    """
    bm = bmesh.new()

    # 1. Deeply Fluted 12-Channel Architectural Obsidian Upper & Lower Core Columns
    #    Open in the central chamber (Z ∈ [-0.25, +0.25]) so the glowing crystal core shines unobstructed!
    num_flutes = 12
    sub_per_flute = 4  # 48 crisp radial vertices: alternating wide architectural land & deep concave flute
    total_seg = num_flutes * sub_per_flute

    def build_fluted_column_half(tiers):
        rings = []
        for z, r_land, depth in tiers:
            ring = []
            for s in range(total_seg):
                a = (s / total_seg) * math.tau
                sub = s % sub_per_flute
                # sub 0 = crisp ridge land, sub 1 & 3 = flute shoulders, sub 2 = deep concave channel trough!
                flute_factor = 0.0 if sub == 0 else (0.52 if sub in (1, 3) else 1.0)
                r = r_land - depth * flute_factor
                ring.append(bm.verts.new(Vector((math.cos(a) * r, math.sin(a) * r, z))))
            rings.append(ring)

        for ti in range(len(rings) - 1):
            r0 = rings[ti]
            r1 = rings[ti + 1]
            for s in range(total_seg):
                sn = (s + 1) % total_seg
                f = bm.faces.new((r0[s], r0[sn], r1[sn], r1[s]))
                f.material_index = MAT_OBSIDIAN
                f.smooth = True
        bm.faces.new(list(reversed(rings[0]))).material_index = MAT_OBSIDIAN
        bm.faces.new(list(rings[-1])).material_index = MAT_OBSIDIAN

    # Lower fluted obsidian gallery (Z = -0.60 .. -0.245)
    build_fluted_column_half([
        (-0.600, 0.250, 0.005),
        (-0.540, 0.285, 0.012),
        (-0.515, 0.352, 0.072),
        (-0.310, 0.342, 0.078),
        (-0.245, 0.295, 0.045),
    ])
    # Upper fluted obsidian gallery (Z = +0.245 .. +0.60)
    build_fluted_column_half([
        (0.245, 0.295, 0.045),
        (0.310, 0.342, 0.078),
        (0.515, 0.352, 0.072),
        (0.540, 0.285, 0.012),
        (0.600, 0.250, 0.005),
    ])

    # 4 Slim Structural Obsidian Corner Ribs spanning the central lantern vault at 45°, 135°, 225°, 315°
    for k in range(4):
        a = k * (math.pi * 0.5) + math.pi * 0.25
        m_rib = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.285, 0.0, 0.0))
        add_chamfered_prism_bar(bm, 0.042, 0.056, 0.52, chamfer=0.008, mat_idx=MAT_OBSIDIAN, matrix=m_rib)

    # 2. Flanking Chamfered Champagne-Brass Collars (Z = ±0.455)
    for sign in (-1.0, 1.0):
        zc = sign * 0.455
        collar_profile = [
            (0.320, zc - 0.070),
            (0.392, zc - 0.065),
            (0.415, zc - 0.046),
            (0.415, zc - 0.020),
            (0.382, zc - 0.014),
            (0.382, zc + 0.014),
            (0.415, zc + 0.020),
            (0.415, zc + 0.046),
            (0.392, zc + 0.065),
            (0.320, zc + 0.070),
        ]
        add_lathe_profile(bm, collar_profile, segments=28, mat_idx=MAT_BRASS, closed_profile=True)

        # Recessed Gunmetal-Titanium track belt
        belt_profile = [
            (0.376, zc - 0.016),
            (0.398, zc - 0.012),
            (0.398, zc + 0.012),
            (0.376, zc + 0.016),
        ]
        add_lathe_profile(bm, belt_profile, segments=28, mat_idx=MAT_TITANIUM, closed_profile=True)

        # 4 Architectural Bayonet Locking Key Lugs
        for k in range(4):
            a = k * (math.pi * 0.5)
            mat_lug = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.415, 0.0, zc))
            add_chamfered_prism_bar(bm, 0.044, 0.070, 0.092, chamfer=0.008, mat_idx=MAT_BRASS, matrix=mat_lug)

        # 12 Recessed Horological Micro-Screw Bolts around each brass collar perimeter (24 total!)
        for k in range(12):
            a = (k + 0.5) * (math.tau / 12.0)
            pos = Vector((math.cos(a) * 0.398, math.sin(a) * 0.398, zc))
            nrm = Vector((math.cos(a), math.sin(a), 0.0))
            add_horological_micro_screw(bm, pos, nrm, radius=0.0155, height=0.014)

    # 3. Internal Brass Lattice Cage & 3 Chamfered Gallery Rings around the Hollow Glowing Crystal Vault
    for z_ring, r_ring, h_ring in ((-0.250, 0.372, 0.028), (0.0, 0.392, 0.024), (0.250, 0.372, 0.028)):
        ring_prof = [
            (r_ring - 0.028, z_ring - h_ring * 0.5),
            (r_ring, z_ring - h_ring * 0.30),
            (r_ring, z_ring + h_ring * 0.30),
            (r_ring - 0.028, z_ring + h_ring * 0.5),
            (r_ring - 0.044, z_ring + h_ring * 0.28),
            (r_ring - 0.044, z_ring - h_ring * 0.28),
        ]
        add_lathe_profile(bm, ring_prof, segments=24, mat_idx=MAT_BRASS, closed_profile=True)

    # 12 Criss-Cross Chamfered Brass Diamond Lattice Struts framing the crystal core
    for k in range(12):
        a0 = (k / 12.0) * math.tau
        for tilt_dir in (-1.0, 1.0):
            a_mid = a0 + tilt_dir * (math.tau / 24.0)
            p0 = Vector((math.cos(a0) * 0.352, math.sin(a0) * 0.352, -0.245))
            p1 = Vector((math.cos(a0 + tilt_dir * math.tau / 12.0) * 0.352,
                         math.sin(a0 + tilt_dir * math.tau / 12.0) * 0.352, 0.245))
            mid = (p0 + p1) * 0.5
            vec = p1 - p0
            z_dir = vec.normalized()
            r_dir = Vector((math.cos(a_mid), math.sin(a_mid), 0.0)).normalized()
            t_dir = z_dir.cross(r_dir).normalized()
            r_dir = t_dir.cross(z_dir).normalized()
            m_strut = Matrix((
                (r_dir.x, t_dir.x, z_dir.x, mid.x),
                (r_dir.y, t_dir.y, z_dir.y, mid.y),
                (r_dir.z, t_dir.z, z_dir.z, mid.z),
                (0.0, 0.0, 0.0, 1.0),
            ))
            add_chamfered_prism_bar(bm, 0.014, 0.015, vec.length, chamfer=0.003, mat_idx=MAT_BRASS, matrix=m_strut)

    # 4 Recessed Glowing Vertical Meridian Energy Conduits nestled in the upper/lower cardinal flutes
    for k in range(4):
        a = k * (math.pi * 0.5)
        for sign in (-1.0, 1.0):
            m_cond = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.305, 0.0, sign * 0.38))
            add_beveled_box(bm, 0.016, 0.014, 0.24, bevel=0.0, mat_idx=MAT_GOLD, matrix=m_cond)

    # 4. Radiant Hollow Faceted Luminous Gold Crystal Core floating inside the open central vault!
    # Outer faceted octagonal crystalline lantern + internal recessed crown jewel facet
    core_profile = [
        (0.002, -0.240),
        (0.115, -0.178),
        (0.215, -0.072),
        (0.238, -0.016),
        (0.222, 0.000),
        (0.238, 0.016),
        (0.215, 0.072),
        (0.115, 0.178),
        (0.002, 0.240),
    ]
    add_lathe_profile(bm, core_profile, segments=8, mat_idx=MAT_GOLD, closed_profile=False)

    # Sculpted brass equatorial containment band gripping the glowing crystal core
    gem_band = [
        (0.224, -0.014),
        (0.252, -0.008),
        (0.252, 0.008),
        (0.224, 0.014),
    ]
    add_lathe_profile(bm, gem_band, segments=16, mat_idx=MAT_BRASS, closed_profile=True)

    return finalize_object(
        "Core_Spindle",
        bm,
        mats,
        collection,
        location=(0.0, 0.0, 0.0),
        sharp_angle_deg=32.0,
        uv_scale=1.6,
    )


# ---------------------------------------------------------------------------
# HERO PIECES 2 & 3: Crown_Top & Crown_Bottom (~3,600 tris each)
# ---------------------------------------------------------------------------
def build_crown(name: str, is_top: bool, mats, collection):
    """
    Authentic Swiss watch-bezel knurled brass crown:
      - Real 60-tooth precision beveled gear knurling around the outer rim
      - Stepped chamfered concentric tier rings (brass / obsidian / titanium)
      - 24 recessed engraved brass degree ticks
      - 4 sculpted curved gimbal bridge lugs
      - Architectural spire finial reaching world Z = ±0.925 (exact total height = 1.850!)
    """
    bm = bmesh.new()
    s = 1.0 if is_top else -1.0
    r_scale = 1.0 if is_top else 1.06

    # 1. Real 60-Tooth Precision Beveled Watch-Bezel Knurled Gear Ring
    #    Optimized 3-point trapezoidal-bevel tooth profile (180 radial verts × 4 crisp bevel tiers)
    #    with cleanly capped top/bottom flanges -> ALL 60 razor-sharp teeth at half the poly cost!
    num_teeth = 60
    r_root = 0.448 * r_scale
    r_tip = 0.488 * r_scale
    r_inner = 0.388 * r_scale

    z_tiers = [
        (-0.062 * s, 0.0, True),    # Bottom chamfered inner edge
        (-0.044 * s, 1.0, False),   # Lower tooth shoulder
        (0.044 * s, 1.0, False),    # Upper tooth shoulder
        (0.062 * s, 0.0, True),     # Top chamfered inner edge
    ]
    if not is_top:
        z_tiers = list(reversed(z_tiers))

    knurl_rings = []
    for zv, tooth_fac, is_chamfer_cap in z_tiers:
        ring = []
        for t in range(num_teeth):
            base_a = (t / num_teeth) * math.tau
            step = math.tau / num_teeth
            # 3 crisp points per tooth: trough -> left crest -> right crest (next tooth starts at trough!)
            sub_specs = [
                (0.00, r_root),
                (0.32, r_root + (r_tip - r_root) * tooth_fac),
                (0.68, r_root + (r_tip - r_root) * tooth_fac),
            ]
            for frac, rad in sub_specs:
                a = base_a + frac * step
                r_use = rad - (0.015 if is_chamfer_cap else 0.0)
                ring.append(bm.verts.new(Vector((math.cos(a) * r_use, math.sin(a) * r_use, zv))))
        knurl_rings.append(ring)

    n_k = len(knurl_rings[0])  # 180 verts
    for ri in range(len(knurl_rings) - 1):
        r0 = knurl_rings[ri]
        r1 = knurl_rings[ri + 1]
        for k in range(n_k):
            kn = (k + 1) % n_k
            f = bm.faces.new((r0[k], r0[kn], r1[kn], r1[k]))
            f.material_index = MAT_BRASS
            f.smooth = True

    # Watertight top & bottom flat ring seals connecting knurled rim cleanly to inner stepped collar
    # (60 inner verts bridged cleanly to the 180 outer verts via triangles/quads -> saves 720 tris!)
    inner_bot = []
    inner_top = []
    z_lo = z_tiers[0][0]
    z_hi = z_tiers[-1][0]
    for t in range(num_teeth):
        a = (t / num_teeth) * math.tau
        inner_bot.append(bm.verts.new(Vector((math.cos(a) * r_inner, math.sin(a) * r_inner, z_lo))))
        inner_top.append(bm.verts.new(Vector((math.cos(a) * r_inner, math.sin(a) * r_inner, z_hi))))

    for t in range(num_teeth):
        tn = (t + 1) % num_teeth
        k0 = t * 3
        k1 = k0 + 1
        k2 = k0 + 2
        k3 = (k0 + 3) % n_k
        # Bottom flange (3 verts outer -> 2 verts inner)
        bm.faces.new((inner_bot[t], inner_bot[tn], knurl_rings[0][k2], knurl_rings[0][k0])).material_index = MAT_BRASS
        bm.faces.new((knurl_rings[0][k0], knurl_rings[0][k2], knurl_rings[0][k1])).material_index = MAT_BRASS
        bm.faces.new((inner_bot[tn], knurl_rings[0][k3], knurl_rings[0][k2])).material_index = MAT_BRASS
        # Top flange
        bm.faces.new((knurl_rings[-1][k0], knurl_rings[-1][k2], inner_top[tn], inner_top[t])).material_index = MAT_BRASS
        bm.faces.new((knurl_rings[-1][k0], knurl_rings[-1][k1], knurl_rings[-1][k2])).material_index = MAT_BRASS
        bm.faces.new((knurl_rings[-1][k2], knurl_rings[-1][k3], inner_top[tn])).material_index = MAT_BRASS
        # Inner bore wall
        bm.faces.new((inner_top[t], inner_top[tn], inner_bot[tn], inner_bot[t])).material_index = MAT_BRASS

    # 2. Stepped Chamfered Concentric Tier Rings
    def build_tier(profile_raw, mat_idx, segs=32, closed=True, cap_b=False, cap_t=False):
        prof = [(r * r_scale, z * s) for r, z in profile_raw]
        if not is_top:
            prof = list(reversed(prof))
            cap_b, cap_t = cap_t, cap_b
        add_lathe_profile(bm, prof, segments=segs, mat_idx=mat_idx, closed_profile=closed,
                          cap_bottom=cap_b, cap_top=cap_t)

    # Lower seating flange (obsidian)
    build_tier([
        (0.245, -0.098),
        (0.410, -0.098),
        (0.425, -0.082),
        (0.425, -0.060),
        (0.245, -0.060),
    ], MAT_OBSIDIAN, segs=28, closed=True)

    # Recessed gunmetal-titanium watch chapter ring
    build_tier([
        (0.250, 0.048),
        (0.402, 0.048),
        (0.402, 0.072),
        (0.382, 0.072),
        (0.382, 0.062),
        (0.268, 0.062),
        (0.250, 0.078),
    ], MAT_TITANIUM, segs=32, closed=True)

    # Luminous gold micro-horizon hairline ring nestled inside the recessed track
    build_tier([
        (0.382, 0.062),
        (0.396, 0.062),
        (0.396, 0.071),
        (0.382, 0.071),
    ], MAT_GOLD, segs=32, closed=True)

    # Sculpted chamfered brass inner stepped gallery collar
    build_tier([
        (0.235, 0.070),
        (0.278, 0.070),
        (0.285, 0.082),
        (0.268, 0.118),
        (0.242, 0.128),
        (0.210, 0.128),
    ], MAT_BRASS, segs=28, closed=True)

    # Honed-obsidian stepped architectural cupola dome cap
    build_tier([
        (0.002, 0.055),
        (0.235, 0.055),
        (0.235, 0.125),
        (0.215, 0.148),
        (0.145, 0.175),
        (0.092, 0.185),
    ], MAT_OBSIDIAN, segs=24, closed=False, cap_b=True, cap_t=True)

    # Sculpted chamfered brass architectural spire finial reaching local Z = ±0.265 (world ±0.925!)
    build_tier([
        (0.098, 0.180),
        (0.106, 0.194),
        (0.078, 0.210),
        (0.062, 0.216),
        (0.044, 0.238),
        (0.012, 0.265),
    ], MAT_BRASS, segs=8, closed=False, cap_b=True, cap_t=True)

    # Glowing jewel inset collar at the neck of the crown finial
    build_tier([
        (0.064, 0.205),
        (0.082, 0.212),
        (0.064, 0.220),
    ], MAT_GOLD, segs=12, closed=True)

    # 3. 24 Engraved Brass Degree Ticks in the recessed chapter ring!
    for k in range(24):
        a = (k / 24.0) * math.tau
        is_cardinal = (k % 6 == 0)
        is_major = (k % 3 == 0)
        tick_len = (0.086 if is_cardinal else (0.062 if is_major else 0.042)) * r_scale
        tick_w = 0.017 if is_cardinal else (0.012 if is_major else 0.008)
        tick_h = 0.015 if is_cardinal else 0.011
        r_mid = 0.326 * r_scale
        m_tick = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((r_mid, 0.0, 0.066 * s))
        add_beveled_box(
            bm,
            sx=tick_len,
            sy=tick_w,
            sz=tick_h,
            bevel=0.0,
            mat_idx=MAT_GOLD if is_cardinal else MAT_BRASS,
            matrix=m_tick,
        )

    # 4. 4 Sculpted Swiss Watch Gimbal Bridge Lugs arching cleanly over the outer knurled rim
    for k in range(4):
        a = k * (math.pi * 0.5)
        rot_m = Matrix.Rotation(a, 4, "Z")

        lug_stations = [
            (0.220 * r_scale, 0.265 * r_scale, 0.105 * s, 0.145 * s, 0.048),
            (0.320 * r_scale, 0.375 * r_scale, 0.090 * s, 0.140 * s, 0.056),
            (0.455 * r_scale, 0.515 * r_scale, 0.068 * s, 0.118 * s, 0.050),
            (0.502 * r_scale, 0.558 * r_scale, -0.018 * s, 0.048 * s, 0.042),
            (0.482 * r_scale, 0.535 * r_scale, -0.072 * s, -0.025 * s, 0.032),
        ]
        sec_rings = []
        for r_in, r_out, zb, zt, hw in lug_stations:
            z0, z1 = (zb, zt) if zb < zt else (zt, zb)
            ch = min(0.008, hw * 0.25, (z1 - z0) * 0.25)
            pts = [
                Vector((r_in, -hw + ch, z0)),
                Vector((r_in, hw - ch, z0)),
                Vector((r_out, hw, z0 + ch)),
                Vector((r_out, hw, z1 - ch)),
                Vector((r_out, hw - ch, z1)),
                Vector((r_out, -hw + ch, z1)),
                Vector((r_out, -hw, z1 - ch)),
                Vector((r_out, -hw, z0 + ch)),
            ]
            sec_rings.append([bm.verts.new(rot_m @ p) for p in pts])

        for si in range(len(sec_rings) - 1):
            r0 = sec_rings[si]
            r1 = sec_rings[si + 1]
            for j in range(8):
                jn = (j + 1) % 8
                f = bm.faces.new((r0[j], r1[j], r1[jn], r0[jn]))
                f.material_index = MAT_BRASS
                f.smooth = True
        bm.faces.new(list(reversed(sec_rings[0]))).material_index = MAT_BRASS
        bm.faces.new(list(sec_rings[-1])).material_index = MAT_BRASS

        # Machined gunmetal titanium gimbal pivot pin piercing each lug tip
        pin_m = (
            rot_m
            @ Matrix.Translation((0.525 * r_scale, 0.0, 0.005 * s))
            @ Matrix.Rotation(math.pi * 0.5, 4, "X")
        )
        add_chamfered_cylinder(
            bm, r_bot=0.020, r_top=0.020, height=0.118, segments=8, chamfer=0.004,
            mat_idx=MAT_TITANIUM, matrix=pin_m
        )

    return finalize_object(
        name,
        bm,
        mats,
        collection,
        location=(0.0, 0.0, 0.66 if is_top else -0.66),
        sharp_angle_deg=32.0,
        uv_scale=1.8,
    )


# ---------------------------------------------------------------------------
# HERO PIECES 4..7: Shutter_0 .. Shutter_3 (~840 tris each -> ~3,360 total)
# ---------------------------------------------------------------------------
def build_shutter(index: int, mats, collection):
    """
    Curved, thick, beveled obsidian-and-brass optical shutter shield spaced 90° apart
    around the core (origin at (0,0,0), rotated to 45° + index*90°, arc centered at local -Y
    -> glTF +Z so radial expansion opens the Tier-2 Clue Core dramatically!).
    """
    bm = bmesh.new()

    r_in = 0.455
    r_lip = 0.472
    r_out = 0.528
    half_h = 0.365
    arc_half = math.radians(33.0)

    shield_cs = [
        (r_lip, -half_h),
        (r_out - 0.015, -half_h),
        (r_out, -half_h + 0.018),
        (r_out, half_h - 0.018),
        (r_out - 0.015, half_h),
        (r_lip, half_h),
        (r_in, half_h - 0.024),
        (r_in, half_h - 0.068),
        (r_lip, half_h - 0.088),
        (r_lip, -half_h + 0.088),
        (r_in, -half_h + 0.068),
        (r_in, -half_h + 0.024),
    ]

    def corner_taper(r, z, t):
        edge_dist = min(t, 1.0 - t)
        if edge_dist < 0.14:
            k = (0.14 - edge_dist) / 0.14
            return (r - (0.010 * k if r > r_lip else 0.0), z * (1.0 - 0.11 * k))
        return (r, z)

    add_curved_arc_extrusion(
        bm,
        shield_cs,
        angle_start=-arc_half,
        angle_end=arc_half,
        arc_steps=10,
        mat_idx=MAT_OBSIDIAN,
        cap_ends=True,
        taper_fn=corner_taper,
    )

    # Inlaid Champagne-Brass Upper & Lower Curved Fascia Trim Rails
    for sign in (-1.0, 1.0):
        z_mid = sign * (half_h - 0.048)
        rail_cs = [
            (r_out - 0.008, z_mid - 0.022),
            (r_out + 0.012, z_mid - 0.016),
            (r_out + 0.012, z_mid + 0.016),
            (r_out - 0.008, z_mid + 0.022),
        ]
        add_curved_arc_extrusion(
            bm, rail_cs, -arc_half * 0.86, arc_half * 0.86, arc_steps=8, mat_idx=MAT_BRASS, cap_ends=True
        )

    # Vertical Central Champagne-Brass Spine Filigree Rib
    add_chamfered_prism_bar(
        bm, sx=0.036, sy=0.028, sz=half_h * 1.94, chamfer=0.006, mat_idx=MAT_BRASS,
        matrix=Matrix.Translation((0.0, -(r_out + 0.005), 0.0)),
    )

    # Twin Diagonal Inlaid Brass Chevron Filigree Bars
    for side_x in (-1.0, 1.0):
        for sign_z in (-1.0, 1.0):
            ang = side_x * math.radians(15.5)
            p = Vector((math.sin(ang) * (r_out + 0.006), -math.cos(ang) * (r_out + 0.006), sign_z * 0.14))
            m_chev = (
                Matrix.Translation(p)
                @ Matrix.Rotation(ang, 4, "Z")
                @ Matrix.Rotation(side_x * sign_z * math.radians(32.0), 4, "Y")
            )
            add_chamfered_prism_bar(bm, 0.145, 0.014, 0.018, chamfer=0.003, mat_idx=MAT_BRASS, matrix=m_chev)

    # Central Luminous Gold Sight-Diamond Jewel inlaid into the vertical brass spine
    m_jewel = Matrix.Translation((0.0, -(r_out + 0.016), 0.0)) @ Matrix.Rotation(math.radians(45.0), 4, "Y")
    add_beveled_box(bm, 0.038, 0.018, 0.038, bevel=0.004, mat_idx=MAT_GOLD, matrix=m_jewel)

    # 4 Corner Watchmaker Brass Pins
    for side_x in (-1.0, 1.0):
        for sign_z in (-1.0, 1.0):
            ang = side_x * math.radians(24.0)
            pos = Vector((math.sin(ang) * (r_out + 0.006), -math.cos(ang) * (r_out + 0.006), sign_z * (half_h - 0.048)))
            nrm = Vector((math.sin(ang), -math.cos(ang), 0.0))
            add_horological_micro_screw(bm, pos, nrm, radius=0.012, height=0.011)

    # Rear Gunmetal-Titanium Inner Hinge Rail Backing
    hinge_cs = [
        (r_in - 0.014, -0.045),
        (r_in + 0.008, -0.055),
        (r_in + 0.008, 0.055),
        (r_in - 0.014, 0.045),
    ]
    add_curved_arc_extrusion(
        bm, hinge_cs, -arc_half * 0.65, arc_half * 0.65, arc_steps=6, mat_idx=MAT_TITANIUM, cap_ends=True
    )

    angle = index * (math.pi * 0.5) + (math.pi * 0.25)
    return finalize_object(
        f"Shutter_{index}",
        bm,
        mats,
        collection,
        location=(0.0, 0.0, 0.0),
        rotation_euler=(0.0, 0.0, angle),
        sharp_angle_deg=32.0,
        uv_scale=1.6,
    )


# ---------------------------------------------------------------------------
# HERO PIECES 8..11: ClampJaw_0 .. ClampJaw_3 (~820 tris each -> ~3,280 total)
# ---------------------------------------------------------------------------
def build_clamp_jaw(index: int, mats, collection):
    """
    Articulated machined titanium-and-brass Overclock caliper claw positioned outside
    the shutters (origin at radial mount R=0.825, angle = 45° + i*90°; outer spine at R=0.95,
    inward emissive gold contact tips at R=0.61 -> ready to clamp dramatically during Overclock!).
    """
    bm = bmesh.new()

    # 1. Beefier Sculpted Curved C-Jaw Caliper Spine in Machined Gunmetal Titanium
    c_stations = [
        (0.205, -0.422, 0.036, 0.034),
        (0.088, -0.495, 0.050, 0.044),
        (-0.045, -0.455, 0.058, 0.050),
        (-0.095, -0.265, 0.050, 0.046),
        (-0.112, 0.000, 0.060, 0.052),
        (-0.095, 0.265, 0.050, 0.046),
        (-0.045, 0.455, 0.058, 0.050),
        (0.088, 0.495, 0.050, 0.044),
        (0.205, 0.422, 0.036, 0.034),
    ]

    pts_yz = [Vector((0.0, st[0], st[1])) for st in c_stations]
    sec_rings = []
    for i, st in enumerate(c_stations):
        _, _, hw, th = st
        if i == 0:
            tang = (pts_yz[1] - pts_yz[0]).normalized()
        elif i == len(c_stations) - 1:
            tang = (pts_yz[-1] - pts_yz[-2]).normalized()
        else:
            tang = (pts_yz[i + 1] - pts_yz[i - 1]).normalized()
        nrm = Vector((1.0, 0.0, 0.0)).cross(tang).normalized()
        ht = th * 0.5
        ch_x = hw * 0.28
        ch_n = ht * 0.28
        center = pts_yz[i]
        local_offsets = [
            (-hw + ch_x, -ht),
            (hw - ch_x, -ht),
            (hw, -ht + ch_n),
            (hw, ht - ch_n),
            (hw - ch_x, ht),
            (-hw + ch_x, ht),
            (-hw, ht - ch_n),
            (-hw, -ht + ch_n),
        ]
        sec_rings.append([bm.verts.new(center + Vector((ox, 0.0, 0.0)) + nrm * on) for ox, on in local_offsets])

    for si in range(len(sec_rings) - 1):
        r0 = sec_rings[si]
        r1 = sec_rings[si + 1]
        for j in range(8):
            jn = (j + 1) % 8
            f = bm.faces.new((r0[j], r1[j], r1[jn], r0[jn]))
            f.material_index = MAT_TITANIUM
            f.smooth = True
    bm.faces.new(list(reversed(sec_rings[0]))).material_index = MAT_TITANIUM
    bm.faces.new(list(sec_rings[-1])).material_index = MAT_TITANIUM

    # 2. Central Articulated Champagne-Brass Actuator Saddle & Obsidian Armor Plaque
    add_chamfered_prism_bar(
        bm, sx=0.138, sy=0.082, sz=0.175, chamfer=0.011, mat_idx=MAT_BRASS,
        matrix=Matrix.Translation((0.0, -0.072, 0.0)),
    )
    add_chamfered_prism_bar(
        bm, sx=0.076, sy=0.032, sz=0.120, chamfer=0.006, mat_idx=MAT_OBSIDIAN,
        matrix=Matrix.Translation((0.0, -0.108, 0.0)),
    )

    # Upper & Lower Articulated Brass Elbow Knuckle Housings + Titanium Pivot Axles
    for sign in (-1.0, 1.0):
        add_chamfered_prism_bar(
            bm, sx=0.130, sy=0.082, sz=0.092, chamfer=0.010, mat_idx=MAT_BRASS,
            matrix=Matrix.Translation((0.0, -0.042, sign * 0.448)),
        )
        pin_m = Matrix.Translation((0.0, -0.042, sign * 0.448)) @ Matrix.Rotation(math.pi * 0.5, 4, "Y")
        add_chamfered_cylinder(
            bm, r_bot=0.022, r_top=0.022, height=0.152, segments=8, chamfer=0.004,
            mat_idx=MAT_TITANIUM, matrix=pin_m
        )

    # 3. Twin Telescoping Hydraulic Piston Rods (upper & lower diagonal actuators)
    for sign in (-1.0, 1.0):
        p_base = Vector((0.0, -0.032, sign * 0.075))
        p_head = Vector((0.0, 0.082, sign * 0.455))
        vec = p_head - p_base
        total_len = vec.length
        z_axis = vec.normalized()
        x_axis = Vector((1.0, 0.0, 0.0))
        y_axis = z_axis.cross(x_axis).normalized()

        def piston_mat(frac: float):
            c = p_base + vec * frac
            return Matrix((
                (x_axis.x, y_axis.x, z_axis.x, c.x),
                (x_axis.y, y_axis.y, z_axis.y, c.y),
                (x_axis.z, y_axis.z, z_axis.z, c.z),
                (0.0, 0.0, 0.0, 1.0),
            ))

        add_chamfered_cylinder(
            bm, r_bot=0.024, r_top=0.022, height=total_len * 0.54, segments=8, chamfer=0.004,
            mat_idx=MAT_BRASS, matrix=piston_mat(0.28)
        )
        add_chamfered_cylinder(
            bm, r_bot=0.028, r_top=0.028, height=0.026, segments=8, chamfer=0.004,
            mat_idx=MAT_TITANIUM, matrix=piston_mat(0.55)
        )
        add_chamfered_cylinder(
            bm, r_bot=0.014, r_top=0.014, height=total_len * 0.52, segments=8, chamfer=0.003,
            mat_idx=MAT_TITANIUM, matrix=piston_mat(0.74)
        )

    # 4. Emissive Luminous Gold Tip Contacts + Inner Throat Power Conduit
    for sign in (-1.0, 1.0):
        add_chamfered_prism_bar(
            bm, sx=0.080, sy=0.048, sz=0.074, chamfer=0.007, mat_idx=MAT_BRASS,
            matrix=Matrix.Translation((0.0, 0.190, sign * 0.420)),
        )
        add_chamfered_prism_bar(
            bm, sx=0.052, sy=0.038, sz=0.052, chamfer=0.006, mat_idx=MAT_GOLD,
            matrix=Matrix.Translation((0.0, 0.214, sign * 0.412)),
        )

    add_beveled_box(
        bm, sx=0.022, sy=0.020, sz=0.44, bevel=0.0, mat_idx=MAT_GOLD,
        matrix=Matrix.Translation((0.0, -0.034, 0.0)),
    )

    angle = index * (math.pi * 0.5) + (math.pi * 0.25)
    r_mount = 0.825
    loc = (math.sin(angle) * r_mount, -math.cos(angle) * r_mount, 0.0)
    return finalize_object(
        f"ClampJaw_{index}",
        bm,
        mats,
        collection,
        location=loc,
        rotation_euler=(0.0, 0.0, angle),
        sharp_angle_deg=32.0,
        uv_scale=1.8,
    )


# ---------------------------------------------------------------------------
# HERO PIECE 12: FacetHousing_Template (~1,020 tris)
# ---------------------------------------------------------------------------
def build_facet_housing_template(mats, collection):
    """
    Sculpted luxury chamfered brass-and-obsidian bezel frame (1.04 x 0.56 open window cutout)
    with corner architectural rivets and rear gimbal mount strut.
    Local origin centered at (0,0,0), facing -Y (glTF +Z); rear strut extends +Y (glTF -Z).
    """
    bm = bmesh.new()

    iw, ih, ic = 0.520, 0.280, 0.050
    ow, oh, oc = 0.598, 0.358, 0.088

    def octagon_pts(hw, hh, c):
        return [
            (-hw + c, -hh),
            (hw - c, -hh),
            (hw, -hh + c),
            (hw, hh - c),
            (hw - c, hh),
            (-hw + c, hh),
            (-hw, hh - c),
            (-hw, -hh + c),
        ]

    # 1. Outer Sculpted Chamfered Champagne-Brass Bezel Frame
    add_extruded_polygon_frame(
        bm,
        outer_pts=octagon_pts(ow, oh, oc),
        inner_pts=octagon_pts(iw + 0.026, ih + 0.026, ic + 0.008),
        y_front=-0.036,
        y_back=0.038,
        front_inset=0.015,
        back_inset=0.014,
        mat_idx=MAT_BRASS,
    )

    # 2. Inner Recessed Honed-Obsidian Optical Gasket Rim (exact 1.04 x 0.56 open window!)
    add_extruded_polygon_frame(
        bm,
        outer_pts=octagon_pts(iw + 0.034, ih + 0.034, ic + 0.010),
        inner_pts=octagon_pts(iw, ih, ic),
        y_front=-0.024,
        y_back=0.048,
        front_inset=0.008,
        back_inset=0.008,
        mat_idx=MAT_OBSIDIAN,
    )

    # 3. 4 Sculpted Corner Architectural Rivets
    for sx in (-1.0, 1.0):
        for sz in (-1.0, 1.0):
            cx = sx * (ow - 0.044)
            cz = sz * (oh - 0.044)
            m_boss = Matrix.Translation((cx, -0.020, cz)) @ Matrix.Rotation(sx * sz * math.radians(45.0), 4, "Y")
            add_chamfered_prism_bar(bm, 0.072, 0.052, 0.036, chamfer=0.006, mat_idx=MAT_TITANIUM, matrix=m_boss)
            add_horological_micro_screw(
                bm, pos=Vector((cx, -0.044, cz)), normal_dir=Vector((0.0, -1.0, 0.0)), radius=0.016, height=0.014
            )

    # Top & Bottom Subtle Luminous Gold Sightline Alignment Ticks + Brass Clamping Ears
    for sz in (-1.0, 1.0):
        add_beveled_box(
            bm, sx=0.145, sy=0.022, sz=0.016, bevel=0.0, mat_idx=MAT_GOLD,
            matrix=Matrix.Translation((0.0, -0.032, sz * (oh - 0.026))),
        )
        for sx in (-1.0, 1.0):
            add_chamfered_prism_bar(
                bm, sx=0.036, sy=0.056, sz=0.032, chamfer=0.005, mat_idx=MAT_BRASS,
                matrix=Matrix.Translation((sx * 0.115, 0.0, sz * (oh - 0.018))),
            )

    # 4. Sculpted Rear Gimbal Mount Strut (+Y Blender = -Z glTF)
    hub_pos = Vector((0.0, 0.220, 0.0))
    for sz in (-1.0, 1.0):
        anchor = Vector((0.0, 0.042, sz * (ih + 0.042)))
        vec = hub_pos - anchor
        mid = (anchor + hub_pos) * 0.5
        z_dir = vec.normalized()
        x_dir = Vector((1.0, 0.0, 0.0))
        y_dir = z_dir.cross(x_dir).normalized()
        m_arm = Matrix((
            (x_dir.x, y_dir.x, z_dir.x, mid.x),
            (x_dir.y, y_dir.y, z_dir.y, mid.y),
            (x_dir.z, y_dir.z, z_dir.z, mid.z),
            (0.0, 0.0, 0.0, 1.0),
        ))
        add_chamfered_prism_bar(bm, 0.052, 0.028, vec.length, chamfer=0.005, mat_idx=MAT_TITANIUM, matrix=m_arm)

    m_stalk = Matrix.Translation((0.0, 0.295, 0.0)) @ Matrix.Rotation(-math.pi * 0.5, 4, "X")
    add_chamfered_cylinder(
        bm, r_bot=0.036, r_top=0.024, height=0.195, segments=10, chamfer=0.005, mat_idx=MAT_BRASS, matrix=m_stalk
    )
    m_knuckle = Matrix.Translation((0.0, 0.215, 0.0)) @ Matrix.Rotation(-math.pi * 0.5, 4, "X")
    add_chamfered_cylinder(
        bm, r_bot=0.054, r_top=0.054, height=0.058, segments=10, chamfer=0.010, mat_idx=MAT_BRASS, matrix=m_knuckle
    )

    return finalize_object(
        "FacetHousing_Template",
        bm,
        mats,
        collection,
        location=(0.0, -0.90, 0.0),
        sharp_angle_deg=32.0,
        uv_scale=1.6,
    )


# ---------------------------------------------------------------------------
# HERO PIECES 13 & 14: Calibrator_Bezel (~2,200 tris) & Calibrator_Needle (~350 tris)
# ---------------------------------------------------------------------------
def build_calibrator_bezel(mats, collection):
    """
    Sculpted circular astrolabe outer bezel ring (outer radius ~0.94, XZ plane facing -Y / glTF +Z)
    with 24 engraved brass cardinal/degree lugs and stepped honed-obsidian backing dish!
    """
    bm = bmesh.new()
    rot_front = Matrix.Rotation(math.pi * 0.5, 4, "X")

    bezel_profile = [
        (0.790, -0.032),
        (0.840, -0.048),
        (0.905, -0.048),
        (0.932, -0.022),
        (0.932, 0.024),
        (0.902, 0.050),
        (0.822, 0.050),
        (0.790, 0.026),
        (0.790, -0.008),
        (0.812, -0.020),
    ]
    add_lathe_profile(bm, bezel_profile, segments=36, mat_idx=MAT_BRASS, closed_profile=True, matrix=rot_front)

    inner_bezel = [
        (0.742, 0.004),
        (0.792, 0.004),
        (0.792, 0.032),
        (0.758, 0.032),
        (0.742, 0.020),
    ]
    add_lathe_profile(bm, inner_bezel, segments=36, mat_idx=MAT_TITANIUM, closed_profile=True, matrix=rot_front)

    glow_ring = [
        (0.742, 0.018),
        (0.756, 0.018),
        (0.756, 0.028),
        (0.742, 0.028),
    ]
    add_lathe_profile(bm, glow_ring, segments=36, mat_idx=MAT_GOLD, closed_profile=True, matrix=rot_front)

    dish_profile = [
        (0.002, -0.078),
        (0.420, -0.078),
        (0.460, -0.064),
        (0.760, -0.064),
        (0.825, -0.042),
        (0.825, -0.016),
        (0.750, -0.016),
        (0.720, -0.008),
        (0.460, -0.008),
        (0.420, -0.014),
        (0.002, -0.014),
    ]
    add_lathe_profile(bm, dish_profile, segments=36, mat_idx=MAT_OBSIDIAN, closed_profile=False, matrix=rot_front)

    lat_ring = [
        (0.445, -0.012),
        (0.468, -0.012),
        (0.468, -0.002),
        (0.445, -0.002),
    ]
    add_lathe_profile(bm, lat_ring, segments=28, mat_idx=MAT_BRASS, closed_profile=True, matrix=rot_front)

    # 24 Sculpted Engraved Brass Cardinal & Degree Lugs
    for k in range(24):
        a = (k / 24.0) * math.tau
        is_cardinal = (k % 6 == 0)
        is_major = (k % 3 == 0)

        if is_cardinal:
            m_lug = rot_front @ Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.918, 0.0, 0.008))
            add_chamfered_prism_bar(bm, 0.088, 0.072, 0.096, chamfer=0.010, mat_idx=MAT_BRASS, matrix=m_lug)
            m_tip = rot_front @ Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.832, 0.0, 0.036))
            add_beveled_box(bm, 0.068, 0.022, 0.020, bevel=0.0, mat_idx=MAT_GOLD, matrix=m_tip)
        elif is_major:
            m_lug = rot_front @ Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.916, 0.0, 0.004))
            add_chamfered_prism_bar(bm, 0.064, 0.044, 0.082, chamfer=0.007, mat_idx=MAT_BRASS, matrix=m_lug)
        else:
            m_lug = rot_front @ Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((0.914, 0.0, 0.002))
            add_beveled_box(bm, 0.046, 0.026, 0.070, bevel=0.0, mat_idx=MAT_BRASS, matrix=m_lug)

    return finalize_object(
        "Calibrator_Bezel",
        bm,
        mats,
        collection,
        location=(0.0, 0.0, 0.0),
        sharp_angle_deg=32.0,
        uv_scale=1.4,
    )


def build_calibrator_needle(mats, collection):
    """
    Razor-sharp sculpted brass & luminous gold compass pointer needle pivoted cleanly at (0,0,0),
    placed at Blender (0, -0.065, 0) (glTF (0, 0, +0.065)) pointing straight UP (+Z Blender / +Y glTF).
    """
    bm = bmesh.new()
    rot_front = Matrix.Rotation(math.pi * 0.5, 4, "X")

    boss_prof = [
        (0.098, -0.020),
        (0.112, -0.006),
        (0.104, 0.022),
        (0.082, 0.034),
        (0.056, 0.034),
    ]
    add_lathe_profile(bm, boss_prof, segments=16, mat_idx=MAT_BRASS, closed_profile=False,
                      cap_bottom=True, cap_top=True, matrix=rot_front)

    gem_prof = [
        (0.054, 0.030),
        (0.048, 0.044),
        (0.028, 0.054),
        (0.002, 0.058),
    ]
    add_lathe_profile(bm, gem_prof, segments=12, mat_idx=MAT_GOLD, closed_profile=False, matrix=rot_front)

    blade_stations = [
        (0.070, 0.046, -0.026, 0.012),
        (0.165, 0.054, -0.028, 0.012),
        (0.320, 0.034, -0.024, 0.010),
        (0.560, 0.018, -0.018, 0.008),
        (0.755, 0.002, -0.006, 0.003),
    ]
    b_rings = []
    for z, hw, yf, yb in blade_stations:
        ym = 0.5 * (yf + yb)
        b_rings.append([
            bm.verts.new(Vector((0.0, yf, z))),
            bm.verts.new(Vector((hw, ym, z))),
            bm.verts.new(Vector((0.0, yb, z))),
            bm.verts.new(Vector((-hw, ym, z))),
        ])
    for i in range(len(b_rings) - 1):
        r0 = b_rings[i]
        r1 = b_rings[i + 1]
        for j in range(4):
            jn = (j + 1) % 4
            f = bm.faces.new((r0[j], r0[jn], r1[jn], r1[j]))
            f.material_index = MAT_BRASS
            f.smooth = False
    bm.faces.new(list(reversed(b_rings[0]))).material_index = MAT_BRASS
    bm.faces.new(list(b_rings[-1])).material_index = MAT_BRASS

    glow_stations = [
        (0.135, 0.018, -0.033, -0.014),
        (0.280, 0.014, -0.030, -0.012),
        (0.685, 0.005, -0.018, -0.006),
        (0.770, 0.001, -0.009, -0.002),
    ]
    g_rings = []
    for z, hw, yf, yb in glow_stations:
        ym = 0.5 * (yf + yb)
        g_rings.append([
            bm.verts.new(Vector((0.0, yf, z))),
            bm.verts.new(Vector((hw, ym, z))),
            bm.verts.new(Vector((0.0, yb, z))),
            bm.verts.new(Vector((-hw, ym, z))),
        ])
    for i in range(len(g_rings) - 1):
        r0 = g_rings[i]
        r1 = g_rings[i + 1]
        for j in range(4):
            jn = (j + 1) % 4
            bm.faces.new((r0[j], r0[jn], r1[jn], r1[j])).material_index = MAT_GOLD
    bm.faces.new(list(reversed(g_rings[0]))).material_index = MAT_GOLD
    bm.faces.new(list(g_rings[-1])).material_index = MAT_GOLD

    add_chamfered_prism_bar(
        bm, sx=0.030, sy=0.022, sz=0.145, chamfer=0.005, mat_idx=MAT_TITANIUM,
        matrix=Matrix.Translation((0.0, -0.004, -0.145)),
    )
    m_pommel = Matrix.Translation((0.0, -0.004, -0.228)) @ Matrix.Rotation(math.radians(45.0), 4, "Y")
    add_chamfered_prism_bar(bm, 0.068, 0.028, 0.068, chamfer=0.006, mat_idx=MAT_BRASS, matrix=m_pommel)

    return finalize_object(
        "Calibrator_Needle",
        bm,
        mats,
        collection,
        location=(0.0, -0.065, 0.0),
        sharp_angle_deg=25.0,
        uv_scale=2.0,
    )


# ---------------------------------------------------------------------------
# MODEL 2: Stage Plinth (stage_plinth.glb)
# ---------------------------------------------------------------------------
def build_stage_plinth_scene():
    """
    Monumental stepped octagonal obsidian & brushed-brass interrogation dais:
      - Outer radius ~ 2.70, top surface cleanly at Z = 0.000 (glTF Y = 0.000!)
      - Stepped beveled stone risers with inlaid brass shadow fillets
      - Recessed glowing gold meridian floor channels + concentric observatory rings
      - 8 sculpted brass perimeter uplight bollards
      - Rear curved diplomat console rail (Blender +Y = glTF -Z)
    """
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    plinth_col = bpy.data.collections.new("Stage_Plinth")
    scene.collection.children.link(plinth_col)
    mats = build_pbr_materials()

    # 1. Monumental Stepped Octagonal Dais Body (top deck flush at EXACTLY Z = 0.000!)
    bm_dais = bmesh.new()
    oct_offset = math.pi / 8.0

    dais_profile = [
        (2.74, -0.460),
        (2.74, -0.355),
        (2.69, -0.315),
        (2.51, -0.315),
        (2.51, -0.295),
        (2.54, -0.285),
        (2.54, -0.195),
        (2.49, -0.155),
        (2.26, -0.155),
        (2.26, -0.135),
        (2.29, -0.125),
        (2.29, -0.025),
        (2.24, 0.000),
    ]
    add_lathe_profile(
        bm_dais, dais_profile, segments=8, mat_idx=MAT_OBSIDIAN,
        closed_profile=False, cap_bottom=True, cap_top=True, angle_offset=oct_offset
    )

    for r_trim, z_bot, z_top in (
        (2.705, -0.328, -0.308),
        (2.505, -0.168, -0.148),
        (2.255, -0.020, -0.002),
    ):
        trim_prof = [
            (r_trim - 0.035, z_bot),
            (r_trim + 0.015, z_bot),
            (r_trim + 0.022, 0.5 * (z_bot + z_top)),
            (r_trim + 0.015, z_top),
            (r_trim - 0.035, z_top),
        ]
        add_lathe_profile(bm_dais, trim_prof, segments=8, mat_idx=MAT_BRASS, closed_profile=True, angle_offset=oct_offset)

    for k in range(8):
        a = oct_offset + (k / 8.0) * math.tau
        for r_b, z_b, h_b in ((2.63, -0.388, 0.140), (2.43, -0.235, 0.140), (2.19, -0.078, 0.135)):
            m_but = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((r_b, 0.0, z_b))
            add_chamfered_prism_bar(bm_dais, 0.15, 0.24, h_b, chamfer=0.012, mat_idx=MAT_TITANIUM, matrix=m_but)

    obj_dais = finalize_object("Stage_Plinth_Dais", bm_dais, mats, plinth_col, sharp_angle_deg=28.0, uv_scale=0.5)

    # 2. Recessed Glowing Gold Meridian Floor Channels & Concentric Rings
    bm_meridian = bmesh.new()
    for r_m, w_brass, w_gold in ((0.96, 0.055, 0.022), (1.76, 0.068, 0.026)):
        brass_ring = [
            (r_m - w_brass, -0.006),
            (r_m + w_brass, -0.006),
            (r_m + w_brass - 0.008, 0.004),
            (r_m - w_brass + 0.008, 0.004),
        ]
        add_lathe_profile(bm_meridian, brass_ring, segments=40, mat_idx=MAT_BRASS, closed_profile=True)

        gold_ring = [
            (r_m - w_gold, 0.001),
            (r_m + w_gold, 0.001),
            (r_m + w_gold * 0.75, 0.007),
            (r_m - w_gold * 0.75, 0.007),
        ]
        add_lathe_profile(bm_meridian, gold_ring, segments=40, mat_idx=MAT_GOLD, closed_profile=True)

    med_prof = [
        (0.002, 0.006),
        (0.280, 0.006),
        (0.320, 0.001),
        (0.320, -0.006),
        (0.002, -0.006),
    ]
    add_lathe_profile(bm_meridian, med_prof, segments=24, mat_idx=MAT_TITANIUM, closed_profile=False)
    med_ring = [(0.265, 0.003), (0.315, 0.003), (0.305, 0.011), (0.275, 0.011)]
    add_lathe_profile(bm_meridian, med_ring, segments=24, mat_idx=MAT_BRASS, closed_profile=True)

    for k in range(8):
        a = (k / 8.0) * math.tau
        m_case = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((1.16, 0.0, 0.001))
        add_chamfered_prism_bar(bm_meridian, 1.72, 0.072, 0.010, chamfer=0.002, mat_idx=MAT_BRASS, matrix=m_case)
        m_strip = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((1.16, 0.0, 0.004))
        add_beveled_box(bm_meridian, 1.68, 0.028, 0.008, bevel=0.0, mat_idx=MAT_GOLD, matrix=m_strip)

    obj_meridian = finalize_object("Meridian_Channels", bm_meridian, mats, plinth_col, sharp_angle_deg=30.0, uv_scale=0.6)

    # 3. 8 Sculpted Brass Perimeter Uplight Bollards
    bm_bollards = bmesh.new()
    for k in range(8):
        a = oct_offset + (k / 8.0) * math.tau
        rot_b = Matrix.Rotation(a, 4, "Z") @ Matrix.Translation((2.08, 0.0, 0.0))

        add_chamfered_cylinder(
            bm_bollards, 0.115, 0.095, 0.055, segments=6, chamfer=0.010,
            mat_idx=MAT_OBSIDIAN, matrix=rot_b @ Matrix.Translation((0, 0, 0.0275))
        )
        add_chamfered_cylinder(
            bm_bollards, 0.078, 0.072, 0.045, segments=8, chamfer=0.008,
            mat_idx=MAT_BRASS, matrix=rot_b @ Matrix.Translation((0, 0, 0.072))
        )
        add_chamfered_cylinder(
            bm_bollards, 0.046, 0.042, 0.115, segments=8, chamfer=0.006,
            mat_idx=MAT_GOLD, matrix=rot_b @ Matrix.Translation((0, 0, 0.148))
        )
        for f_idx in range(4):
            fa = f_idx * (math.pi * 0.5) + math.pi * 0.25
            m_fin = rot_b @ Matrix.Rotation(fa, 4, "Z") @ Matrix.Translation((0.062, 0.0, 0.152))
            add_chamfered_prism_bar(bm_bollards, 0.022, 0.018, 0.135, chamfer=0.003, mat_idx=MAT_TITANIUM, matrix=m_fin)

        cap_prof = [
            (0.055, 0.205),
            (0.112, 0.218),
            (0.106, 0.242),
            (0.068, 0.262),
            (0.002, 0.266),
        ]
        add_lathe_profile(bm_bollards, cap_prof, segments=8, mat_idx=MAT_BRASS,
                          closed_profile=False, cap_bottom=True, matrix=rot_b)

    obj_bollards = finalize_object("Uplight_Bollards", bm_bollards, mats, plinth_col, sharp_angle_deg=32.0, uv_scale=1.2)

    # 4. Rear Curved Diplomat Console Rail (Blender +Y = glTF -Z)
    bm_rail = bmesh.new()
    arc_lo = math.pi - math.radians(52.0)
    arc_hi = math.pi + math.radians(52.0)

    parapet_cs = [
        (2.14, 0.000),
        (2.26, 0.000),
        (2.26, 0.115),
        (2.23, 0.155),
        (2.16, 0.155),
        (2.14, 0.115),
    ]
    add_curved_arc_extrusion(bm_rail, parapet_cs, arc_lo, arc_hi, arc_steps=16, mat_idx=MAT_OBSIDIAN, cap_ends=True)

    curb_glow_cs = [
        (2.165, 0.152),
        (2.225, 0.152),
        (2.215, 0.168),
        (2.175, 0.168),
    ]
    add_curved_arc_extrusion(bm_rail, curb_glow_cs, arc_lo + 0.03, arc_hi - 0.03, arc_steps=14, mat_idx=MAT_GOLD, cap_ends=True)

    handrail_cs = [
        (2.165, 0.595),
        (2.235, 0.595),
        (2.252, 0.618),
        (2.240, 0.652),
        (2.160, 0.652),
        (2.148, 0.618),
    ]
    add_curved_arc_extrusion(bm_rail, handrail_cs, arc_lo - 0.02, arc_hi + 0.02, arc_steps=18, mat_idx=MAT_BRASS, cap_ends=True)

    midrail_cs = [
        (2.185, 0.372),
        (2.222, 0.372),
        (2.222, 0.408),
        (2.185, 0.408),
    ]
    add_curved_arc_extrusion(bm_rail, midrail_cs, arc_lo, arc_hi, arc_steps=16, mat_idx=MAT_TITANIUM, cap_ends=True)

    for i in range(5):
        t = i / 4.0
        ang = arc_lo + (arc_hi - arc_lo) * t
        px, py = math.sin(ang) * 2.20, -math.cos(ang) * 2.20
        m_post = Matrix.Translation((px, py, 0.0)) @ Matrix.Rotation(ang, 4, "Z")

        add_chamfered_prism_bar(bm_rail, 0.095, 0.115, 0.045, chamfer=0.008, mat_idx=MAT_BRASS,
                                matrix=m_post @ Matrix.Translation((0, 0, 0.172)))
        add_chamfered_prism_bar(bm_rail, 0.056, 0.072, 0.435, chamfer=0.008, mat_idx=MAT_TITANIUM,
                                matrix=m_post @ Matrix.Translation((0, 0, 0.388)))
        add_chamfered_prism_bar(bm_rail, 0.088, 0.105, 0.048, chamfer=0.008, mat_idx=MAT_BRASS,
                                matrix=m_post @ Matrix.Translation((0, 0, 0.592)))

    obj_rail = finalize_object("Diplomat_Console_Rail", bm_rail, mats, plinth_col, sharp_angle_deg=32.0, uv_scale=0.9)

    plinth_objs = [obj_dais, obj_meridian, obj_bollards, obj_rail]

    bpy.ops.wm.save_as_mainfile(filepath=str(PLINTH_BLEND))
    export_selected_glb(plinth_objs, PLINTH_GLB_PUBLIC)
    shutil.copy2(PLINTH_GLB_PUBLIC, PLINTH_GLB_GODOT)

    return collect_scene_stats(plinth_objs)


# ---------------------------------------------------------------------------
# Export & Binary GLB Verification Helpers
# ---------------------------------------------------------------------------
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


def collect_scene_stats(objects):
    deps = bpy.context.evaluated_depsgraph_get()
    stats = {}
    total_tris = 0
    for obj in objects:
        ev = obj.evaluated_get(deps)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        tris = len(me.loop_triangles)
        ev.to_mesh_clear()
        stats[obj.name] = tris
        total_tris += tris
    return stats, total_tris


def inspect_glb_binary(glb_path: Path):
    data = glb_path.read_bytes()
    magic, version, _ = struct.unpack_from("<4sII", data, 0)
    assert magic == b"glTF", f"Invalid GLB magic: {magic}"
    assert version == 2, f"Unexpected glTF version: {version}"
    chunk_len, chunk_type = struct.unpack_from("<I4s", data, 12)
    assert chunk_type == b"JSON", f"Expected JSON chunk, got {chunk_type}"
    gltf = json.loads(data[20:20 + chunk_len].decode("utf-8"))

    scene_idx = gltf.get("scene", 0)
    scenes = gltf.get("scenes", [])
    top_node_indices = scenes[scene_idx].get("nodes", []) if scenes else []
    nodes = gltf.get("nodes", [])
    top_names = [nodes[i].get("name", f"node_{i}") for i in top_node_indices]
    mat_names = [m.get("name", "") for m in gltf.get("materials", [])]

    accessors = gltf.get("accessors", [])
    tri_count = 0
    for mesh in gltf.get("meshes", []):
        for prim in mesh.get("primitives", []):
            if "indices" in prim:
                tri_count += accessors[prim["indices"]]["count"] // 3
            elif "POSITION" in prim.get("attributes", {}):
                tri_count += accessors[prim["attributes"]["POSITION"]]["count"] // 3

    return {
        "file_bytes": len(data),
        "top_nodes": top_names,
        "materials": mat_names,
        "glb_triangles": tri_count,
    }


# ---------------------------------------------------------------------------
# Studio Rembrandt 3-Point Lighting, Soft Glow Compositor & 1024x1024 Render
# ---------------------------------------------------------------------------
def setup_studio_lighting_and_camera(scene, studio_col, mats):
    # 1. Procedural Luxury Dark Studio Softbox Reflection World
    world = bpy.data.worlds.new("Studio_Rembrandt_World")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nodes = nt.nodes
    links = nt.links
    nodes.clear()

    w_out = nodes.new("ShaderNodeOutputWorld")
    w_bg = nodes.new("ShaderNodeBackground")
    w_bg.inputs["Strength"].default_value = 1.15

    tex_coord = nodes.new("ShaderNodeTexCoord")
    sep_xyz = nodes.new("ShaderNodeSeparateXYZ")

    ramp_v = nodes.new("ShaderNodeValToRGB")
    elts = ramp_v.color_ramp.elements
    elts[0].position = 0.0
    elts[0].color = hex_to_linear_rgba("#04060C")
    elts[1].position = 0.45
    elts[1].color = hex_to_linear_rgba("#0E182D")
    e2 = ramp_v.color_ramp.elements.new(0.66)
    e2.color = hex_to_linear_rgba("#4A638E")
    e3 = ramp_v.color_ramp.elements.new(0.84)
    e3.color = hex_to_linear_rgba("#FFE2AA")
    e4 = ramp_v.color_ramp.elements.new(0.95)
    e4.color = hex_to_linear_rgba("#182032")

    map_z = nodes.new("ShaderNodeMapRange")
    map_z.inputs["From Min"].default_value = -1.0
    map_z.inputs["From Max"].default_value = 1.0

    lp = nodes.new("ShaderNodeLightPath")
    bg_cam = nodes.new("ShaderNodeBackground")
    bg_cam.inputs["Color"].default_value = hex_to_linear_rgba("#04070F")
    bg_cam.inputs["Strength"].default_value = 1.0

    mix_shader = nodes.new("ShaderNodeMixShader")

    links.new(tex_coord.outputs["Generated"], sep_xyz.inputs["Vector"])
    links.new(sep_xyz.outputs["Z"], map_z.inputs["Value"])
    links.new(map_z.outputs["Result"], ramp_v.inputs["Fac"])
    links.new(ramp_v.outputs["Color"], w_bg.inputs["Color"])

    links.new(lp.outputs["Is Camera Ray"], mix_shader.inputs["Fac"])
    links.new(w_bg.outputs["Background"], mix_shader.inputs[1])
    links.new(bg_cam.outputs["Background"], mix_shader.inputs[2])
    links.new(mix_shader.outputs["Shader"], w_out.inputs["Surface"])

    def add_targeted_area_light(name, loc, target, energy, color_hex, size_x, size_y):
        ld = bpy.data.lights.new(name, type="AREA")
        ld.shape = "DISK" if abs(size_x - size_y) < 0.05 else "RECTANGLE"
        ld.size = size_x
        if ld.shape == "RECTANGLE":
            ld.size_y = size_y
        ld.energy = energy
        ld.color = hex_to_linear_rgba(color_hex)[:3]
        lo = bpy.data.objects.new(name, ld)
        lo.location = loc
        direction = Vector(target) - Vector(loc)
        lo.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        studio_col.objects.link(lo)
        return lo

    # 2. 3-Point Luxury Rembrandt Studio Lighting Rig
    # Warm Champagne Key Softbox (front-right-high)
    add_targeted_area_light(
        "Studio_Key_Rembrandt",
        loc=(3.2, -3.5, 2.85),
        target=(0.0, 0.0, 0.05),
        energy=490.0,
        color_hex="#FFE8C2",
        size_x=2.4,
        size_y=3.0,
    )
    # Cool Glacial-Sapphire Rim Strip (rear-left — high elevation so it doesn't mirror bluntly on the floor!)
    add_targeted_area_light(
        "Studio_Rim_Sapphire",
        loc=(-3.6, 2.8, 2.65),
        target=(0.0, 0.0, 0.12),
        energy=410.0,
        color_hex="#7CC6FF",
        size_x=1.4,
        size_y=3.2,
    )
    # Soft Warm Counter-Fill (front-left-low)
    add_targeted_area_light(
        "Studio_Fill_Warm",
        loc=(-2.6, -2.8, -1.45),
        target=(0.0, 0.0, -0.05),
        energy=145.0,
        color_hex="#F5D088",
        size_x=2.4,
        size_y=2.4,
    )
    # Radiant Warm Internal Crystal Core Light (casts golden rays out through lattice & flutes!)
    pt_d = bpy.data.lights.new("Studio_Core_Glow", type="POINT")
    pt_d.energy = 85.0
    pt_d.shadow_soft_size = 0.12
    pt_d.color = hex_to_linear_rgba("#FFDF96")[:3]
    pt_o = bpy.data.objects.new("Studio_Core_Glow", pt_d)
    pt_o.location = (0.0, 0.0, 0.0)
    studio_col.objects.link(pt_o)

    # 3. Satin-Matte Obsidian Studio Floor + Subtle Recessed Brass/Gold Pedestal Halo Ring
    bm_floor = bmesh.new()
    floor_prof = [
        (0.002, -1.16),
        (1.65, -1.16),
        (1.75, -1.22),
        (5.50, -1.22),
    ]
    add_lathe_profile(bm_floor, floor_prof, segments=48, mat_idx=0, closed_profile=False)
    floor_mesh = bpy.data.meshes.new("Studio_Floor_Mesh")
    bm_floor.to_mesh(floor_mesh)
    bm_floor.free()
    floor_mesh.shade_smooth()
    floor_obj = bpy.data.objects.new("Studio_Backdrop_Floor", floor_mesh)
    studio_col.objects.link(floor_obj)

    floor_mat = bpy.data.materials.new("Mat_Studio_VelvetObsidian")
    floor_mat.use_nodes = True
    f_bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
    f_bsdf.inputs["Base Color"].default_value = hex_to_linear_rgba("#04060B")
    f_bsdf.inputs["Metallic"].default_value = 0.08
    f_bsdf.inputs["Roughness"].default_value = 0.44
    if "Coat Weight" in f_bsdf.inputs:
        f_bsdf.inputs["Coat Weight"].default_value = 0.12
    floor_obj.data.materials.append(floor_mat)

    # Delicate luminous gold halo ring inlaid on the studio pedestal directly beneath the floating Prism
    bm_halo = bmesh.new()
    add_lathe_profile(
        bm_halo,
        [(1.18, -1.162), (1.22, -1.162), (1.21, -1.154), (1.19, -1.154)],
        segments=48,
        mat_idx=MAT_GOLD,
        closed_profile=True,
    )
    add_lathe_profile(
        bm_halo,
        [(1.62, -1.162), (1.66, -1.162), (1.65, -1.155), (1.63, -1.155)],
        segments=48,
        mat_idx=MAT_BRASS,
        closed_profile=True,
    )
    finalize_object("Studio_Pedestal_Halo", bm_halo, mats, studio_col, sharp_angle_deg=35.0)

    # 4. 50mm Luxury Portrait Studio Camera (heroic 3/4 view framing every detail cleanly!)
    cam_d = bpy.data.cameras.new("Studio_Hero_Cam")
    cam_d.lens = 50.0
    cam_d.sensor_width = 36.0
    cam_d.clip_start = 0.05
    cam_d.clip_end = 100.0
    cam_d.dof.use_dof = True
    cam_d.dof.focus_distance = 4.45
    cam_d.dof.aperture_fstop = 5.6

    cam_o = bpy.data.objects.new("Studio_Hero_Cam", cam_d)
    cam_o.location = (2.30, -3.72, 0.94)
    cam_dir = Vector((0.0, -0.06, 0.00)) - cam_o.location
    cam_o.rotation_euler = cam_dir.to_track_quat("-Z", "Y").to_euler()
    studio_col.objects.link(cam_o)
    scene.camera = cam_o


def configure_render_engine(scene):
    available = [item.identifier for item in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
    chosen = None
    for candidate in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE", "CYCLES"):
        if candidate in available:
            chosen = candidate
            break
    if chosen is None:
        chosen = available[0]

    scene.render.engine = chosen
    if chosen in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        if hasattr(scene.eevee, "taa_render_samples"):
            scene.eevee.taa_render_samples = 64
        if hasattr(scene.eevee, "use_raytracing"):
            scene.eevee.use_raytracing = True
        if hasattr(scene.eevee, "use_shadows"):
            scene.eevee.use_shadows = True
    elif chosen == "CYCLES":
        scene.cycles.samples = 64
        scene.cycles.use_denoising = True

    for vt in ("AgX", "Filmic"):
        try:
            scene.view_settings.view_transform = vt
            break
        except Exception:
            pass
    for look in ("AgX - Medium High Contrast", "Medium High Contrast", "None"):
        try:
            scene.view_settings.look = look
            break
        except Exception:
            pass
    scene.view_settings.exposure = 0.28

    # Subtle cinema bloom glare via compositor if supported cleanly in Blender 5.3
    try:
        scene.use_nodes = True
        nt = getattr(scene, "node_tree", None)
        if nt is not None:
            nt.nodes.clear()
            rl = nt.nodes.new("CompositorNodeRLayers")
            glare = nt.nodes.new("CompositorNodeGlare")
            glare.glare_type = "FOG_GLOW"
            glare.quality = "HIGH"
            glare.threshold = 1.4
            glare.size = 7
            comp = nt.nodes.new("CompositorNodeComposite")
            nt.links.new(rl.outputs["Image"], glare.inputs["Image"])
            nt.links.new(glare.outputs["Image"], comp.inputs["Image"])
    except Exception:
        pass

    scene.render.resolution_x = 1024
    scene.render.resolution_y = 1024
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    return chosen


# ---------------------------------------------------------------------------
# Main Pipeline
# ---------------------------------------------------------------------------
def main():
    log_lines = []
    log_lines.append(f"BLENDER_VERSION={bpy.app.version_string}")

    # 1. Build Veritas Prism Hero Scene (exact 14 named top-level nodes)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene

    hero_col = bpy.data.collections.new("Veritas_Prism_Hero")
    studio_col = bpy.data.collections.new("Studio_Rig")
    scene.collection.children.link(hero_col)
    scene.collection.children.link(studio_col)

    mats = build_pbr_materials()

    core_spindle = build_core_spindle(mats, hero_col)
    crown_top = build_crown("Crown_Top", True, mats, hero_col)
    crown_bottom = build_crown("Crown_Bottom", False, mats, hero_col)

    shutters = [build_shutter(i, mats, hero_col) for i in range(4)]
    clamp_jaws = [build_clamp_jaw(i, mats, hero_col) for i in range(4)]

    facet_housing = build_facet_housing_template(mats, hero_col)
    calibrator_bezel = build_calibrator_bezel(mats, hero_col)
    calibrator_needle = build_calibrator_needle(mats, hero_col)

    hero_objects = [
        core_spindle,
        crown_top,
        crown_bottom,
        *shutters,
        *clamp_jaws,
        facet_housing,
        calibrator_bezel,
        calibrator_needle,
    ]

    setup_studio_lighting_and_camera(scene, studio_col, mats)
    chosen_engine = configure_render_engine(scene)
    log_lines.append(f"RENDER_ENGINE={chosen_engine}")

    hero_stats, hero_total_tris = collect_scene_stats(hero_objects)

    # Save pristine rest-pose .blend source file
    bpy.ops.wm.save_as_mainfile(filepath=str(HERO_BLEND))
    log_lines.append(f"HERO_BLEND_BYTES={HERO_BLEND.stat().st_size}")

    # Export ONLY the 14 exact Hero Objects to veritas_prism_hero.glb
    export_selected_glb(hero_objects, HERO_GLB_PUBLIC)
    shutil.copy2(HERO_GLB_PUBLIC, HERO_GLB_GODOT)

    hero_glb_info = inspect_glb_binary(HERO_GLB_PUBLIC)
    log_lines.append(f"HERO_GLB_BYTES={hero_glb_info['file_bytes']}")
    log_lines.append(f"HERO_GLB_TRIS={hero_glb_info['glb_triangles']}")
    log_lines.append(f"HERO_EVAL_TRIS={hero_total_tris}")
    log_lines.append(f"HERO_NODES={json.dumps(hero_glb_info['top_nodes'])}")
    log_lines.append(f"HERO_MATERIALS={json.dumps(hero_glb_info['materials'])}")
    log_lines.append(f"HERO_NODE_TRIS={json.dumps(hero_stats)}")

    # 2. Render 1024x1024 Studio Beauty Shot (slightly cracked open to reveal luminous crystal core!)
    crown_top.location.z += 0.055
    for i, sh in enumerate(shutters):
        a = i * (math.pi * 0.5) + (math.pi * 0.25)
        sh.location.x = math.sin(a) * 0.095
        sh.location.y = -math.cos(a) * 0.095

    calibrator_bezel.hide_render = True
    calibrator_needle.hide_render = True
    facet_housing.location.y = -1.04

    scene.render.filepath = str(BEAUTY_PNG)
    bpy.ops.render.render(write_still=True)
    log_lines.append(f"BEAUTY_PNG_BYTES={BEAUTY_PNG.stat().st_size if BEAUTY_PNG.exists() else 0}")

    # 3. Build Stage Plinth Scene (.blend + .glb + Godot copy)
    plinth_stats, plinth_total_tris = build_stage_plinth_scene()
    plinth_glb_info = inspect_glb_binary(PLINTH_GLB_PUBLIC)
    log_lines.append(f"PLINTH_BLEND_BYTES={PLINTH_BLEND.stat().st_size}")
    log_lines.append(f"PLINTH_GLB_BYTES={plinth_glb_info['file_bytes']}")
    log_lines.append(f"PLINTH_GLB_TRIS={plinth_glb_info['glb_triangles']}")
    log_lines.append(f"PLINTH_EVAL_TRIS={plinth_total_tris}")
    log_lines.append(f"PLINTH_NODES={json.dumps(plinth_glb_info['top_nodes'])}")
    log_lines.append(f"PLINTH_NODE_TRIS={json.dumps(plinth_stats)}")
    log_lines.append("STATUS=SUCCESS")

    LOG_FILE.write_text("\n".join(log_lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        LOG_FILE.write_text("STATUS=ERROR\n" + traceback.format_exc(), encoding="utf-8")
        raise
