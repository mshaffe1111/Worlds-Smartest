#!/usr/bin/env python3
"""
World's Smartest — Sculpted 3D PBR Luxury Horological Medals & Trophies Pipeline (Blender 5.3.0)
Implements `#166` §1:
  - 8 bespoke sculpted 3D medals & trophies rendered with transparent film (`640x640` supersampled
    -> `512x512` Lanczos RGBA PNGs) into `public/assets/medals/`:
      1. medal_tier1_bronze.png        — Initiate Bronze Citation
      2. medal_tier2_sterling.png      — Envoy Sterling Medallion
      3. medal_tier3_gold.png          — Consul 24K Gold Star
      4. medal_tier4_sapphire.png      — Arbiter Smoked-Sapphire Grand Cross
      5. medal_tier5_mythic.png        — Mythic Celestial Diamond Crown
      6. trophy_streak_chronometer.png — Horological Streak Chalice
      7. trophy_overclock_roulette.png — 6.0x Overclock Turbine Trophy
      8. trophy_polymath_globe.png     — 12-Domain Armillary Polymath Trophy
  - Guaranteed `0`-alpha 1px/4px outer border & clean W3C PNG chunk hygiene (0 iCCP/sRGB conflict)
  - Exports `public/assets/medals/manifest.json`
  - Exports `assets/renders/medals_trophies_sheet.png` (2048x1080 4x2 visual audit contact sheet)
"""

import json
import math
import sys
import time
import traceback
from pathlib import Path

SCRIPT_PATH = Path(__file__).resolve()
PROJECT_ROOT = SCRIPT_PATH.parents[2]

MEDALS_DIR = PROJECT_ROOT / "public" / "assets" / "medals"
RENDER_DIR = PROJECT_ROOT / "assets" / "renders"
SHEET_PNG = RENDER_DIR / "medals_trophies_sheet.png"
MANIFEST_JSON = MEDALS_DIR / "manifest.json"
LOG_FILE = RENDER_DIR / "medals_trophies_blender.log"

MEDAL_SPECS = [
    {
        "id": "medal_tier1_bronze",
        "filename": "medal_tier1_bronze.png",
        "title": "Initiate Bronze Citation",
        "tier": 1,
        "rarity": "EASY",
        "category": "MEDAL",
    },
    {
        "id": "medal_tier2_sterling",
        "filename": "medal_tier2_sterling.png",
        "title": "Envoy Sterling Medallion",
        "tier": 2,
        "rarity": "MEDIUM",
        "category": "MEDAL",
    },
    {
        "id": "medal_tier3_gold",
        "filename": "medal_tier3_gold.png",
        "title": "Consul 24K Gold Star",
        "tier": 3,
        "rarity": "HARD",
        "category": "MEDAL",
    },
    {
        "id": "medal_tier4_sapphire",
        "filename": "medal_tier4_sapphire.png",
        "title": "Arbiter Smoked-Sapphire Grand Cross",
        "tier": 4,
        "rarity": "VERY_RARE",
        "category": "MEDAL",
    },
    {
        "id": "medal_tier5_mythic",
        "filename": "medal_tier5_mythic.png",
        "title": "Mythic Celestial Diamond Crown",
        "tier": 5,
        "rarity": "EXTREMELY_RARE",
        "category": "MEDAL",
    },
    {
        "id": "trophy_streak_chronometer",
        "filename": "trophy_streak_chronometer.png",
        "title": "Horological Streak Chalice",
        "tier": 4,
        "rarity": "TROPHY",
        "category": "TROPHY",
    },
    {
        "id": "trophy_overclock_roulette",
        "filename": "trophy_overclock_roulette.png",
        "title": "6.0x Overclock Turbine Trophy",
        "tier": 5,
        "rarity": "TROPHY",
        "category": "TROPHY",
    },
    {
        "id": "trophy_polymath_globe",
        "filename": "trophy_polymath_globe.png",
        "title": "12-Domain Armillary Polymath Trophy",
        "tier": 5,
        "rarity": "TROPHY",
        "category": "TROPHY",
    },
]


# ===========================================================================
# MODE 2: POST-PROCESS RGBA 512x512 + ZERO-BORDER ALPHA + CONTACT SHEET (PIL)
# ===========================================================================
def run_postprocess_cli():
    import numpy as np
    from PIL import Image, ImageDraw, ImageFilter, ImageFont

    MEDALS_DIR.mkdir(parents=True, exist_ok=True)
    RENDER_DIR.mkdir(parents=True, exist_ok=True)

    processed_tiles = []
    manifest_items = []
    by_id = {}

    for spec in MEDAL_SPECS:
        raw_path = RENDER_DIR / f"_tmp_{spec['id']}.png"
        assert raw_path.exists(), f"Missing raw Blender render: {raw_path}"

        im_raw = Image.open(raw_path).convert("RGBA")
        # Crop tightly to non-zero alpha bounding box and center cleanly inside a 436x436 safe box on 512x512!
        arr_raw = np.asarray(im_raw)
        alpha_mask = arr_raw[:, :, 3] > 6
        ys, xs = np.where(alpha_mask)
        assert len(xs) > 100, f"Empty render on {spec['id']}"
        x0, x1 = int(xs.min()), int(xs.max()) + 1
        y0, y1 = int(ys.min()), int(ys.max()) + 1
        cropped = im_raw.crop((x0, y0, x1, y1))

        cw, ch = cropped.size
        target_max = 436  # Leaves >= 38px margin on all sides for soft contact shadow & 0-alpha border!
        scale = min(target_max / cw, target_max / ch)
        nw, nh = max(1, int(round(cw * scale))), max(1, int(round(ch * scale)))
        fg = cropped.resize((nw, nh), Image.Resampling.LANCZOS)

        canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        ox = (512 - nw) // 2
        oy = (512 - nh) // 2

        # Subtle luxury ambient drop-shadow so icons pop over dark obsidian & gold cards
        fg_alpha = fg.split()[3]
        shadow_alpha = fg_alpha.point(lambda a: int(a * 0.52))
        shadow_layer = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
        shadow_color = Image.new("RGBA", (nw, nh), (2, 4, 10, 255))
        shadow_layer.paste(shadow_color, (ox, min(512 - nh - 8, oy + 8)), shadow_alpha)
        shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=9.0))

        out_im = Image.alpha_composite(canvas, shadow_layer)
        out_im.paste(fg, (ox, oy), fg)

        # Guarantee strict 0-alpha across outer 6px perimeter & clean W3C PNG chunks (via numpy round-trip!)
        out_np = np.array(out_im, dtype=np.uint8)
        # Smoothly feather outer 14px..6px to exact 0
        for pad_i in range(14):
            factor = 0.0 if pad_i < 6 else (pad_i - 6) / 8.0
            out_np[pad_i, :, 3] = (out_np[pad_i, :, 3].astype(np.float32) * factor).astype(np.uint8)
            out_np[511 - pad_i, :, 3] = (out_np[511 - pad_i, :, 3].astype(np.float32) * factor).astype(np.uint8)
            out_np[:, pad_i, 3] = (out_np[:, pad_i, 3].astype(np.float32) * factor).astype(np.uint8)
            out_np[:, 511 - pad_i, 3] = (out_np[:, 511 - pad_i, 3].astype(np.float32) * factor).astype(np.uint8)
        # Zero RGB where alpha == 0 for crisp premultiplied/bilinear sampling
        zero_a = out_np[:, :, 3] == 0
        out_np[zero_a, 0:3] = 0

        max_border_a = int(max(
            out_np[0, :, 3].max(), out_np[-1, :, 3].max(),
            out_np[:, 0, 3].max(), out_np[:, -1, 3].max(),
        ))
        assert max_border_a == 0, f"Border alpha non-zero on {spec['filename']}: {max_border_a}"

        final_png = MEDALS_DIR / spec["filename"]
        clean_pil = Image.fromarray(out_np, mode="RGBA")
        clean_pil.save(final_png, format="PNG", optimize=True)
        raw_path.unlink(missing_ok=True)

        # Verify zero forbidden iCCP/sRGB chunks
        raw_bytes = final_png.read_bytes()
        for bad_chunk in (b"iCCP", b"cICP", b"eXIf"):
            assert bad_chunk not in raw_bytes, f"Unexpected {bad_chunk} in {spec['filename']}"

        processed_tiles.append((spec, clean_pil))
        entry = {
            **spec,
            "url": f"./assets/medals/{spec['filename']}",
            "publicPath": f"/assets/medals/{spec['filename']}",
            "width": 512,
            "height": 512,
            "bytes": len(raw_bytes),
        }
        manifest_items.append(entry)
        by_id[spec["id"]] = entry
        print(f"[MEDAL PNG OK] {spec['filename']} | 512x512 RGBA | {len(raw_bytes):,} B | border_alpha={max_border_a}")

    manifest_doc = {
        "schemaVersion": "WS_MEDALS_MANIFEST_V1",
        "count": len(manifest_items),
        "items": manifest_items,
        "byId": by_id,
    }
    MANIFEST_JSON.write_text(json.dumps(manifest_doc, indent=2) + "\n", encoding="utf-8")

    # Assemble 2048x1080 4x2 Luxury Showcase Contact Sheet
    sheet = Image.new("RGB", (2048, 1080), (7, 10, 18))
    draw = ImageDraw.Draw(sheet)
    try:
        font_title = ImageFont.truetype("C:/Windows/Fonts/georgia.ttf", 19)
        font_sub = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 14)
    except Exception:
        font_title = ImageFont.load_default()
        font_sub = font_title

    cell_w, cell_h = 512, 540
    for idx, (spec, pil_rgba) in enumerate(processed_tiles):
        col_i = idx % 4
        row_i = idx // 4
        cx0 = col_i * cell_w
        cy0 = row_i * cell_h

        # Subtle dark radial card background so alpha matting & specular bevels are clearly auditable!
        card = Image.new("RGBA", (cell_w - 20, cell_h - 20), (13, 18, 30, 255))
        icon_440 = pil_rgba.resize((440, 440), Image.Resampling.LANCZOS)
        card.paste(icon_440, ((cell_w - 20 - 440) // 2, 12), icon_440)
        sheet.paste(card.convert("RGB"), (cx0 + 10, cy0 + 10))

        draw.rectangle([cx0 + 10, cy0 + 10, cx0 + cell_w - 11, cy0 + cell_h - 11], outline=(188, 148, 76), width=2)
        draw.rectangle([cx0 + 18, cy0 + cell_h - 74, cx0 + cell_w - 19, cy0 + cell_h - 18], fill=(8, 11, 20), outline=(218, 176, 92), width=1)
        draw.text((cx0 + 28, cy0 + cell_h - 68), spec["title"], fill=(246, 224, 168), font=font_title)
        draw.text((cx0 + 28, cy0 + cell_h - 40), f"{spec['filename']} · TIER {spec['tier']} ({spec['rarity']})", fill=(154, 182, 220), font=font_sub)

    sheet.save(SHEET_PNG, format="PNG", optimize=True)
    print(f"[SHEET OK] {SHEET_PNG} | {SHEET_PNG.stat().st_size:,} B")


if "--postprocess" in sys.argv:
    run_postprocess_cli()
    sys.exit(0)


# ===========================================================================
# MODE 1: BLENDER 5.3.0 SCULPTING & TRANSPARENT STUDIO RENDERING
# ===========================================================================
import bpy
import bmesh
from mathutils import Euler, Matrix, Vector

MEDALS_DIR.mkdir(parents=True, exist_ok=True)
RENDER_DIR.mkdir(parents=True, exist_ok=True)


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


def make_mat(name, base_hex, metallic=0.0, roughness=0.20, coat=0.0, coat_r=0.04,
             emissive_hex=None, emissive_str=0.0, ior=1.55):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = hex_rgba(base_hex)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if "IOR" in bsdf.inputs:
        bsdf.inputs["IOR"].default_value = ior
    if "Coat Weight" in bsdf.inputs and coat > 0.0:
        bsdf.inputs["Coat Weight"].default_value = coat
        bsdf.inputs["Coat Roughness"].default_value = coat_r
    if emissive_hex and emissive_str > 0.0:
        bsdf.inputs["Emission Color"].default_value = hex_rgba(emissive_hex)
        bsdf.inputs["Emission Strength"].default_value = emissive_str
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def build_medal_materials():
    return [
        # 0: 24K Mirror Liquid Gold
        make_mat("M_Gold24", "#FFDC78", metallic=0.98, roughness=0.12, coat=0.25),
        # 1: Satin Champagne Gold
        make_mat("M_SatinGold", "#EBC062", metallic=0.95, roughness=0.20, coat=0.12),
        # 2: Brushed Initiate Bronze
        make_mat("M_Bronze", "#B8733E", metallic=0.93, roughness=0.25, coat=0.10),
        # 3: Coined Sterling Silver
        make_mat("M_Sterling", "#DCE3EE", metallic=0.97, roughness=0.16, coat=0.18),
        # 4: Mirror Platinum-Rhodium
        make_mat("M_Platinum", "#EEF3FA", metallic=0.98, roughness=0.11, coat=0.28),
        # 5: Blued Gunmetal / Obsidian
        make_mat("M_Obsidian", "#101828", metallic=0.25, roughness=0.10, coat=0.92),
        # 6: Crimson Diplomatic Silk Ribbon
        make_mat("M_CrimsonSilk", "#8E1426", metallic=0.05, roughness=0.46, coat=0.12),
        # 7: Royal Navy Diplomatic Silk Ribbon
        make_mat("M_NavySilk", "#102858", metallic=0.05, roughness=0.44, coat=0.15),
        # 8: Imperial Emerald Silk / Enamel
        make_mat("M_EmeraldEnamel", "#0B5E36", metallic=0.10, roughness=0.18, coat=0.80),
        # 9: Faceted Colombian Emerald Jewel
        make_mat("M_EmeraldGem", "#089E4C", metallic=0.24, roughness=0.06, coat=0.75,
                 emissive_hex="#0CC460", emissive_str=0.38, ior=1.58),
        # 10: Refractive Smoked Royal Blue Sapphire Jewel
        make_mat("M_SapphireGem", "#0B3EC8", metallic=0.32, roughness=0.07, coat=0.70,
                 emissive_hex="#1456EB", emissive_str=0.42, ior=1.77),
        # 11: Pigeon-Blood Ruby / Reactor Core
        make_mat("M_RubyGem", "#CC0E36", metallic=0.28, roughness=0.06, coat=0.75,
                 emissive_hex="#E61942", emissive_str=0.48, ior=1.77),
        # 12: Brilliant Celestial Prismatic Diamond!
        make_mat("M_Diamond", "#EAF4FF", metallic=0.42, roughness=0.05, coat=0.85,
                 emissive_hex="#CFE8FF", emissive_str=0.36, ior=2.42),
        # 13: Royal Lapis Globe Ocean
        make_mat("M_LapisOcean", "#0E348A", metallic=0.18, roughness=0.16, coat=0.75),
        # 14: Amethyst / Violet Domain Gem
        make_mat("M_AmethystGem", "#9828FF", metallic=0.12, roughness=0.04, coat=1.0,
                 emissive_hex="#A842FF", emissive_str=0.95, ior=1.55),
        # 15: Molten Amber-Gold Flame / Streak Core
        make_mat("M_AmberCore", "#FFB62E", metallic=0.25, roughness=0.05, coat=1.0,
                 emissive_hex="#FF9E18", emissive_str=1.65, ior=1.90),
    ]


MM_GOLD24 = 0
MM_SGOLD = 1
MM_BRONZE = 2
MM_SILVER = 3
MM_PLAT = 4
MM_OBS = 5
MM_RED_SILK = 6
MM_NAVY_SILK = 7
MM_EM_ENAM = 8
MM_EM_GEM = 9
MM_SAP_GEM = 10
MM_RUBY_GEM = 11
MM_DIAMOND = 12
MM_LAPIS = 13
MM_AMETHYST = 14
MM_AMBER = 15


# ---------------------------------------------------------------------------
# BMesh Primitives (Front-Facing XZ Icon Plane: Front = -Y, Up = +Z, Right = +X)
# ---------------------------------------------------------------------------
M_FRONT = Matrix.Rotation(math.pi * 0.5, 4, "X")  # Maps +Z lathe axis to -Y (toward camera)!


def finalize_obj(name, bm, mats, col, loc=(0, 0, 0), rot=(0, 0, 0), sharp_deg=34.0, flat_mats=None):
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.normal_update()
    flat_mats = set(flat_mats or ())
    thresh = math.radians(sharp_deg)
    for f in bm.faces:
        f.smooth = (f.material_index not in flat_mats)
    for e in bm.edges:
        if len(e.link_faces) == 2:
            e.smooth = False if any(lf.material_index in flat_mats for lf in e.link_faces) else (e.calc_face_angle(0.0) <= thresh)
        else:
            e.smooth = False
    me = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(me)
    bm.free()
    used = sorted({p.material_index for p in me.polygons})
    if used:
        remap = {o: n for n, o in enumerate(used)}
        for o in used:
            me.materials.append(mats[o])
        for p in me.polygons:
            p.material_index = remap[p.material_index]
    else:
        me.materials.append(mats[0])
    obj = bpy.data.objects.new(name, me)
    obj.location = loc
    obj.rotation_euler = rot
    col.objects.link(obj)
    if not flat_mats:
        wn = obj.modifiers.new("WN", "WEIGHTED_NORMAL")
        wn.keep_sharp = True
        wn.weight = 50
    return obj


def add_lathe(bm, prof_rz, segs, mat_idx, closed=False, cap_b=False, cap_t=False,
              matrix=None, flutes=0, flute_d=0.0, angle_off=0.0):
    rings = []
    for r, z in prof_rz:
        ring = []
        for s in range(segs):
            a = angle_off + (s / segs) * math.tau
            rr = max(0.0005, r - flute_d * 0.5 * (1.0 - math.cos(a * flutes))) if flutes > 0 else r
            p = Vector((math.cos(a) * rr, math.sin(a) * rr, z))
            ring.append(bm.verts.new(matrix @ p if matrix else p))
        rings.append(ring)
    n = len(rings)
    for i in range(n if closed else n - 1):
        r0, r1 = rings[i], rings[(i + 1) % n]
        for s in range(segs):
            sn = (s + 1) % segs
            try:
                f = bm.faces.new((r0[s], r0[sn], r1[sn], r1[s]))
                f.material_index = mat_idx
                f.smooth = True
            except ValueError:
                pass
    if cap_b and rings:
        cp = Vector((0, 0, prof_rz[0][1]))
        cv = bm.verts.new(matrix @ cp if matrix else cp)
        for s in range(segs):
            try:
                bm.faces.new((cv, rings[0][(s + 1) % segs], rings[0][s])).material_index = mat_idx
            except ValueError:
                pass
    if cap_t and rings:
        cp = Vector((0, 0, prof_rz[-1][1]))
        cv = bm.verts.new(matrix @ cp if matrix else cp)
        for s in range(segs):
            try:
                bm.faces.new((cv, rings[-1][s], rings[-1][(s + 1) % segs])).material_index = mat_idx
            except ValueError:
                pass


def add_sweep(bm, path_pts, prof_2d, mat_idx, closed=False, cap=True, up_hint=Vector((0, 1, 0)), scale_fn=None):
    pts = [Vector(p) for p in path_pts]
    n = len(pts)
    if n < 2:
        return
    tans = []
    for i in range(n):
        t = (pts[(i + 1) % n] - pts[(i - 1) % n]) if closed else (
            pts[1] - pts[0] if i == 0 else (pts[-1] - pts[-2] if i == n - 1 else pts[i + 1] - pts[i - 1])
        )
        tans.append(t.normalized() if t.length > 1e-8 else Vector((0, 0, 1)))
    h = up_hint.normalized()
    if abs(tans[0].dot(h)) > 0.96:
        h = Vector((1, 0, 0)) if abs(tans[0].x) < 0.8 else Vector((0, 0, 1))
    nv = h.cross(tans[0]).normalized()
    bv = tans[0].cross(nv).normalized()
    frames = [(nv, bv)]
    for i in range(1, n):
        tp, tc = tans[i - 1], tans[i]
        ax = tp.cross(tc)
        if ax.length > 1e-6:
            nv = (Matrix.Rotation(math.acos(clamp(tp.dot(tc), -1.0, 1.0)), 3, ax.normalized()) @ nv).normalized()
            bv = tc.cross(nv).normalized()
        frames.append((nv, bv))
    if closed:
        ax = tans[-1].cross(tans[0])
        ne, _ = frames[-1]
        if ax.length > 1e-6:
            ne = (Matrix.Rotation(math.acos(clamp(tans[-1].dot(tans[0]), -1.0, 1.0)), 3, ax.normalized()) @ ne).normalized()
        tw = math.atan2(ne.dot(frames[0][1]), ne.dot(frames[0][0]))
        if abs(tw) > 1e-5:
            frames = [
                (nv * math.cos(-tw * i / n) + bv * math.sin(-tw * i / n),
                 -nv * math.sin(-tw * i / n) + bv * math.cos(-tw * i / n))
                for i, (nv, bv) in enumerate(frames)
            ]
    rings = []
    for i in range(n):
        sc = scale_fn(i / max(1, n - 1)) if scale_fn else (1.0, 1.0)
        sx, sy = (sc, sc) if isinstance(sc, (int, float)) else sc
        nv, bv = frames[i]
        rings.append([bm.verts.new(pts[i] + nv * (pu * sx) + bv * (pv * sy)) for (pu, pv) in prof_2d])
    m = len(prof_2d)
    for i in range(n if closed else n - 1):
        r0, r1 = rings[i], rings[(i + 1) % n]
        for j in range(m):
            try:
                f = bm.faces.new((r0[j], r0[(j + 1) % m], r1[(j + 1) % m], r1[j]))
                f.material_index = mat_idx
                f.smooth = True
            except ValueError:
                pass
    if not closed and cap:
        for r, rev in ((rings[0], True), (rings[-1], False)):
            try:
                bm.faces.new(list(reversed(r)) if rev else list(r)).material_index = mat_idx
            except ValueError:
                pass


def add_gem(bm, pos: Vector, nrm: Vector, r: float, h: float, bezel_mat: int, gem_mat: int, facets: int = 12):
    za = nrm.normalized()
    ref = Vector((0, 0, 1)) if abs(za.z) < 0.9 else Vector((1, 0, 0))
    xa = ref.cross(za).normalized()
    ya = za.cross(xa).normalized()
    m = Matrix(((xa.x, ya.x, za.x, pos.x), (xa.y, ya.y, za.y, pos.y), (xa.z, ya.z, za.z, pos.z), (0, 0, 0, 1)))
    add_lathe(bm, [(r * 1.25, -h * 0.2), (r * 1.30, h * 0.1), (r * 1.12, h * 0.45), (r * 0.88, h * 0.45)],
              segs=facets, mat_idx=bezel_mat, cap_b=True, matrix=m)
    add_lathe(bm, [(r * 0.88, h * 0.2), (r * 0.92, h * 0.48), (r * 0.56, h * 0.88), (r * 0.20, h * 0.99)],
              segs=facets, mat_idx=gem_mat, cap_t=True, matrix=m)


def add_star_ray_3d(bm, origin: Vector, angle_xz: float, r_in: float, r_out: float,
                    half_w: float, depth_y: float, mat_idx: int):
    """Sculpts a razor-beveled 4-facet 3D star ray in the XZ front plane (front = -Y)."""
    sa, ca = math.sin(angle_xz), math.cos(angle_xz)
    dir_v = Vector((sa, 0.0, ca))
    perp_v = Vector((ca, 0.0, -sa))
    base_c = origin + dir_v * r_in
    mid_c = origin + dir_v * lerp(r_in, r_out, 0.28)
    tip_v = bm.verts.new(origin + dir_v * r_out)
    root_v = bm.verts.new(base_c)
    ring = [
        bm.verts.new(mid_c - perp_v * half_w),
        bm.verts.new(mid_c + Vector((0, -depth_y, 0))),
        bm.verts.new(mid_c + perp_v * half_w),
        bm.verts.new(mid_c + Vector((0, depth_y * 0.5, 0))),
    ]
    for j in range(4):
        jn = (j + 1) % 4
        f1 = bm.faces.new((ring[j], ring[jn], tip_v))
        f1.material_index = mat_idx
        f1.smooth = False
        f2 = bm.faces.new((root_v, ring[jn], ring[j]))
        f2.material_index = mat_idx
        f2.smooth = False


def add_diplomatic_ribbon_top(bm, z_pin: float, silk_mat: int, trim_mat: int):
    """Sculpts a crisp V-pleated diplomatic medal silk ribbon + suspension clasp bar + jump ring!"""
    # Top brass clasp bar at z_pin + 0.23m
    z_top = z_pin + 0.235
    bar_pts = [Vector((-0.145, 0.010, z_top)), Vector((0.145, 0.010, z_top))]
    add_sweep(bm, bar_pts, [(-0.012, -0.014), (0.012, -0.014), (0.014, 0.014), (-0.014, 0.014)],
              mat_idx=trim_mat, closed=False, up_hint=Vector((0, 0, 1)))
    for sx in (-0.135, 0.135):
        add_gem(bm, Vector((sx, -0.006, z_top)), Vector((0, -1, 0)), 0.011, 0.008, trim_mat, MM_DIAMOND, 8)

    # V-pleated silk drape tapering from bar (±0.13m at z_top) down to suspension apex (±0.032m at z_pin + 0.045m)
    z_apex = z_pin + 0.048
    # Left & right overlapping V-pleat folds for rich 3D fabric shadow!
    for side in (-1.0, 1.0):
        v_outer_top = bm.verts.new(Vector((side * 0.132, 0.012, z_top - 0.008)))
        v_inner_top = bm.verts.new(Vector((side * 0.012, 0.004, z_top - 0.008)))
        v_outer_bot = bm.verts.new(Vector((side * 0.036, 0.008, z_apex)))
        v_center_bot = bm.verts.new(Vector((0.0, -0.006, z_apex - 0.012)))
        quad = (v_inner_top, v_outer_top, v_outer_bot, v_center_bot) if side > 0 else (v_outer_top, v_inner_top, v_center_bot, v_outer_bot)
        f = bm.faces.new(quad)
        f.material_index = silk_mat
        f.smooth = True

        # Edge gold/silver woven border stripe along outer silk edge!
        stripe_pts = [Vector((side * 0.126, 0.006, z_top - 0.010)), Vector((side * 0.034, 0.002, z_apex))]
        add_sweep(bm, stripe_pts, [(-0.006, -0.003), (0.006, -0.003), (0.006, 0.003), (-0.006, 0.003)],
                  mat_idx=trim_mat, closed=False, up_hint=Vector((0, -1, 0)))

    # Sculpted suspension bail & torus jump-ring connecting ribbon apex to medallion top!
    ring_c = Vector((0.0, 0.0, z_pin + 0.022))
    r_pts = [ring_c + Vector((math.cos(i / 28.0 * math.tau) * 0.028, 0.0, math.sin(i / 28.0 * math.tau) * 0.028)) for i in range(28)]
    add_sweep(bm, r_pts, [(-0.006, -0.006), (0.006, -0.006), (0.006, 0.006), (-0.006, 0.006)],
              mat_idx=trim_mat, closed=True, up_hint=Vector((0, 1, 0)))


def add_laurel_leaf_xz(bm, origin: Vector, dir_v: Vector, length: float, width: float, mat_idx: int):
    fwd = dir_v.normalized()
    up_n = Vector((0, -1, 0))
    right = fwd.cross(up_n).normalized()
    steps = 5
    rings = []
    for k in range(steps):
        t = k / (steps - 1)
        env = math.sin(t * math.pi) ** 0.78
        w = max(0.002, width * 0.5 * env)
        h = max(0.0015, 0.006 * (0.4 + 0.6 * env))
        c = origin + fwd * (t * length) + up_n * (0.08 * length * math.sin(t * math.pi))
        rings.append([
            bm.verts.new(c - right * w),
            bm.verts.new(c + up_n * h),
            bm.verts.new(c + right * w),
            bm.verts.new(c - up_n * h * 0.5),
        ])
    for i in range(steps - 1):
        for j in range(4):
            f = bm.faces.new((rings[i][j], rings[i][(j + 1) % 4], rings[i + 1][(j + 1) % 4], rings[i + 1][j]))
            f.material_index = mat_idx
            f.smooth = True
    tip = bm.verts.new(origin + fwd * (length * 1.06))
    for j in range(4):
        bm.faces.new((rings[-1][j], rings[-1][(j + 1) % 4], tip)).material_index = mat_idx


# ===========================================================================
# 8 BESPOKE MEDAL & TROPHY SCULPT BUILDERS
# ===========================================================================
def build_1_bronze(mats, col):
    """Initiate Bronze Citation — brushed bronze octagon + crimson silk ribbon."""
    bm = bmesh.new()
    zc = -0.095
    add_diplomatic_ribbon_top(bm, zc + 0.225, silk_mat=MM_RED_SILK, trim_mat=MM_BRONZE)

    m_oct = Matrix.Translation((0, 0, zc)) @ M_FRONT
    # Stepped heavy brushed-bronze octagonal medallion (r = 0.225m)
    add_lathe(bm, [
        (0.005, -0.020), (0.215, -0.020), (0.228, -0.006), (0.228, 0.014),
        (0.205, 0.026), (0.182, 0.026), (0.175, 0.012), (0.005, 0.012),
    ], segs=8, mat_idx=MM_BRONZE, cap_b=True, cap_t=True, matrix=m_oct, angle_off=math.pi / 8.0)

    # Fine guilloche circular inner chapter ring + 24 radial rays + Initiate compass star & ruby pip!
    add_lathe(bm, [(0.145, 0.012), (0.168, 0.018), (0.162, 0.024), (0.140, 0.016)],
              segs=48, mat_idx=MM_SGOLD, closed=True, matrix=m_oct, flutes=24, flute_d=0.003)
    for k in range(8):
        a = (k / 8.0) * math.tau
        add_star_ray_3d(bm, Vector((0, -0.014, zc)), a, 0.022, (0.132 if k % 2 == 0 else 0.088),
                        0.020, 0.018, MM_SGOLD if k % 2 == 0 else MM_BRONZE)
    add_gem(bm, Vector((0, -0.026, zc)), Vector((0, -1, 0)), 0.028, 0.018, MM_BRONZE, MM_RUBY_GEM, 12)
    return finalize_obj("Medal_Tier1_Bronze", bm, mats, col, rot=(0, 0, math.radians(-8.0)), sharp_deg=24.0)


def build_2_sterling(mats, col):
    """Envoy Sterling Medallion — coined sterling silver + navy diplomat ribbon."""
    bm = bmesh.new()
    zc = -0.095
    add_diplomatic_ribbon_top(bm, zc + 0.225, silk_mat=MM_NAVY_SILK, trim_mat=MM_SILVER)

    m_c = Matrix.Translation((0, 0, zc)) @ M_FRONT
    # Coined 64-flute sterling-silver circular medallion + deep navy enamel inner field!
    add_lathe(bm, [
        (0.005, -0.020), (0.218, -0.020), (0.226, -0.004), (0.226, 0.016),
        (0.202, 0.028), (0.186, 0.028), (0.178, 0.012),
    ], segs=64, mat_idx=MM_SILVER, cap_b=True, matrix=m_c, flutes=64, flute_d=0.0035)
    add_lathe(bm, [(0.005, 0.012), (0.178, 0.012)], segs=64, mat_idx=MM_NAVY_SILK, cap_t=True, matrix=m_c)

    # Twin sculpted sterling-silver diplomatic olive/laurel branches + 12-point compass star + sapphire!
    for side in (-1.0, 1.0):
        pts = [
            Vector((side * math.sin(lerp(0.18, 2.75, k / 14.0)) * 0.145, -0.018,
                    zc - math.cos(lerp(0.18, 2.75, k / 14.0)) * 0.145))
            for k in range(15)
        ]
        add_sweep(bm, pts, [(-0.004, -0.004), (0.004, -0.004), (0.004, 0.004), (-0.004, 0.004)],
                  mat_idx=MM_PLAT, closed=False)
        for lk in range(6):
            p = pts[2 + lk * 2]
            tng = (pts[3 + lk * 2] - pts[1 + lk * 2]).normalized()
            add_laurel_leaf_xz(bm, p, (tng + Vector((side * 0.35, 0, 0.25))).normalized(), 0.042, 0.016, MM_PLAT)

    for k in range(8):
        add_star_ray_3d(bm, Vector((0, -0.015, zc)), k * math.tau / 8.0, 0.020,
                        (0.108 if k % 2 == 0 else 0.072), 0.017, 0.018, MM_PLAT)
    add_gem(bm, Vector((0, -0.028, zc)), Vector((0, -1, 0)), 0.032, 0.020, MM_PLAT, MM_SAP_GEM, 14)
    return finalize_obj("Medal_Tier2_Sterling", bm, mats, col, rot=(0, 0, math.radians(-8.0)), sharp_deg=32.0)


def build_3_gold(mats, col):
    """Consul 24K Gold Star — 24K guilloche gold 8-point star + emerald cabochon."""
    bm = bmesh.new()
    zc = -0.105
    add_diplomatic_ribbon_top(bm, zc + 0.242, silk_mat=MM_EM_ENAM, trim_mat=MM_GOLD24)

    m_c = Matrix.Translation((0, 0, zc)) @ M_FRONT
    # Scalloped 24K guilloche gold sun-medallion backing disc
    add_lathe(bm, [
        (0.005, -0.018), (0.185, -0.018), (0.195, 0.002), (0.175, 0.018), (0.005, 0.018),
    ], segs=64, mat_idx=MM_SGOLD, cap_b=True, cap_t=True, matrix=m_c, flutes=32, flute_d=0.007)
    add_lathe(bm, [(0.118, 0.016), (0.136, 0.024), (0.128, 0.030), (0.112, 0.022)],
              segs=48, mat_idx=MM_EM_ENAM, closed=True, matrix=m_c)

    # 8 Prominent Razor-Beveled 24K Liquid-Gold Starburst Rays + 8 Secondary Filigree Rays!
    for k in range(16):
        a = (k / 16.0) * math.tau
        if k % 2 == 0:
            r_out = 0.262 if (k % 4 == 0) else 0.228
            add_star_ray_3d(bm, Vector((0, -0.018, zc)), a, 0.038, r_out, 0.034, 0.028, MM_GOLD24)
        else:
            add_star_ray_3d(bm, Vector((0, -0.014, zc)), a, 0.055, 0.168, 0.014, 0.016, MM_SGOLD)

    # 8 diamond pips + large central Colombian Emerald Cabochon!
    for k in range(8):
        a = (k / 8.0) * math.tau + math.pi / 8.0
        add_gem(bm, Vector((math.sin(a) * 0.124, -0.028, zc + math.cos(a) * 0.124)),
                Vector((0, -1, 0)), 0.009, 0.007, MM_GOLD24, MM_DIAMOND, 8)
    add_gem(bm, Vector((0, -0.038, zc)), Vector((0, -1, 0)), 0.052, 0.030, MM_GOLD24, MM_EM_GEM, 16)
    return finalize_obj("Medal_Tier3_Gold", bm, mats, col, rot=(0, 0, math.radians(-8.0)), sharp_deg=28.0)


def build_4_sapphire(mats, col):
    """Arbiter Smoked-Sapphire Grand Cross — platinum & refractive blue sapphire Maltese/astrolabe cross."""
    bm = bmesh.new()
    m_c = M_FRONT
    # Interleaved 24K Gold Engraved Astrolabe Degree Ring (r = 0.235m)
    add_lathe(bm, [(0.212, -0.014), (0.242, -0.014), (0.248, 0.004), (0.242, 0.016), (0.212, 0.016)],
              segs=64, mat_idx=MM_GOLD24, closed=True, matrix=m_c, flutes=32, flute_d=0.003)

    # 4 Sculpted V-Notched Maltese Cross Arms in Refractive Royal Blue Sapphire + Mirror Platinum Bezel!
    for k in range(4):
        rot_y = Matrix.Rotation(k * (math.pi * 0.5), 4, "Y")
        # Build one Maltese arm pointing +Z in XZ plane, then rotate around Y!
        pts_o = [
            Vector((-0.026, 0, 0.062)), Vector((0.026, 0, 0.062)),
            Vector((0.098, 0, 0.278)), Vector((0.0, 0, 0.238)), Vector((-0.098, 0, 0.278)),
        ]
        pts_i = [
            Vector((-0.018, 0, 0.074)), Vector((0.018, 0, 0.074)),
            Vector((0.076, 0, 0.256)), Vector((0.0, 0, 0.222)), Vector((-0.076, 0, 0.256)),
        ]
        vo_b = [bm.verts.new(rot_y @ (p + Vector((0, 0.012, 0)))) for p in pts_o]
        vo_f = [bm.verts.new(rot_y @ (p + Vector((0, -0.018, 0)))) for p in pts_o]
        vi_f = [bm.verts.new(rot_y @ (p + Vector((0, -0.032, 0)))) for p in pts_i]
        apex_c = bm.verts.new(rot_y @ Vector((0, -0.040, 0.165)))

        for s in range(5):
            sn = (s + 1) % 5
            bm.faces.new((vo_b[s], vo_b[sn], vo_f[sn], vo_f[s])).material_index = MM_PLAT
            bm.faces.new((vo_f[s], vo_f[sn], vi_f[sn], vi_f[s])).material_index = MM_PLAT
            f_sap = bm.faces.new((vi_f[s], vi_f[sn], apex_c))
            f_sap.material_index = MM_SAP_GEM
            f_sap.smooth = False
        bm.faces.new(list(reversed(vo_b))).material_index = MM_PLAT

        # Platinum tip pearls on the 2 V-points of each Maltese arm!
        for px in (-0.098, 0.098):
            add_gem(bm, rot_y @ Vector((px, -0.016, 0.280)), Vector((0, -1, 0)),
                    0.012, 0.009, MM_PLAT, MM_DIAMOND, 10)

        # Diagonal Platinum & Gold Astrolabe Fleur-Rays at 45°, 135°, 225°, 315°!
        a_d = (k + 0.5) * (math.pi * 0.5)
        add_star_ray_3d(bm, Vector((0, -0.012, 0)), a_d, 0.050, 0.215, 0.022, 0.022, MM_PLAT)
        add_star_ray_3d(bm, Vector((0, -0.016, 0)), a_d + 0.13, 0.060, 0.175, 0.011, 0.014, MM_GOLD24)
        add_star_ray_3d(bm, Vector((0, -0.016, 0)), a_d - 0.13, 0.060, 0.175, 0.011, 0.014, MM_GOLD24)

    # Central Smoked-Obsidian & Platinum Arbiter Medallion + Large Brilliant Sapphire!
    add_lathe(bm, [(0.005, 0.010), (0.086, 0.010), (0.092, 0.032), (0.076, 0.042), (0.005, 0.042)],
              segs=48, mat_idx=MM_OBS, cap_t=True, matrix=m_c)
    add_lathe(bm, [(0.076, 0.030), (0.095, 0.034), (0.090, 0.046), (0.072, 0.044)],
              segs=48, mat_idx=MM_PLAT, closed=True, matrix=m_c)
    add_gem(bm, Vector((0, -0.044, 0)), Vector((0, -1, 0)), 0.052, 0.030, MM_PLAT, MM_SAP_GEM, 16)
    return finalize_obj("Medal_Tier4_Sapphire", bm, mats, col, rot=(0, 0, math.radians(-7.0)), sharp_deg=26.0)


def build_5_mythic(mats, col):
    """Mythic Celestial Diamond Crown — obsidian, 24K gold & brilliant diamond sovereign laurel crown!"""
    bm = bmesh.new()
    # Celestial Halo Astrolabe Ring + 16 Blazing 24K Sunburst Rays behind the Imperial Crown!
    add_lathe(bm, [(0.255, -0.020), (0.278, -0.020), (0.284, -0.004), (0.275, 0.010), (0.255, 0.010)],
              segs=72, mat_idx=MM_GOLD24, closed=True, matrix=M_FRONT)
    for k in range(16):
        a = (k / 16.0) * math.tau
        add_star_ray_3d(bm, Vector((0, 0.010, 0)), a, 0.080, (0.315 if k % 2 == 0 else 0.250),
                        0.020, 0.016, MM_GOLD24 if k % 2 == 0 else MM_PLAT)

    # Twin Sweeping 3D 24K Gold Victory Laurel Wreaths cradling the Sovereign Crown!
    for side in (-1.0, 1.0):
        w_pts = [
            Vector((side * math.sin(lerp(0.22, 2.80, k / 18.0)) * 0.268, -0.024,
                    -0.010 - math.cos(lerp(0.22, 2.80, k / 18.0)) * 0.258))
            for k in range(19)
        ]
        add_sweep(bm, w_pts, [(-0.007, -0.006), (0.007, -0.006), (0.007, 0.006), (-0.007, 0.006)],
                  mat_idx=MM_GOLD24, closed=False)
        for lk in range(8):
            p = w_pts[2 + lk * 2]
            tng = (w_pts[3 + lk * 2] - w_pts[1 + lk * 2]).normalized()
            add_laurel_leaf_xz(bm, p, (tng + Vector((side * 0.38, 0, 0.25))).normalized(), 0.072, 0.028, MM_GOLD24)

    # Dark Obsidian Star Backing Shield so the Prismatic Diamond pops with razor contrast!
    add_lathe(bm, [(0.005, -0.006), (0.195, -0.006), (0.205, 0.008), (0.185, 0.016), (0.005, 0.016)],
              segs=64, mat_idx=MM_OBS, cap_b=True, cap_t=True, matrix=M_FRONT)

    # 3D Tilted Imperial Obsidian & 24K Gold 8-Spire Sovereign Crown Diadem in Foreground!
    crown_m = Matrix.Translation((0, -0.062, -0.048)) @ Matrix.Rotation(math.radians(30.0), 4, "X")
    add_lathe(bm, [
        (0.145, -0.055), (0.168, -0.055), (0.176, -0.042),
        (0.176, 0.008), (0.165, 0.020), (0.145, 0.020),
    ], segs=48, mat_idx=MM_GOLD24, closed=True, matrix=crown_m)
    add_lathe(bm, [(0.172, -0.040), (0.180, -0.034), (0.180, -0.002), (0.172, 0.004)],
              segs=48, mat_idx=MM_OBS, closed=True, matrix=crown_m)

    gems_cycle = (MM_DIAMOND, MM_SAP_GEM, MM_RUBY_GEM, MM_EM_GEM)
    for k in range(8):
        a = (k / 8.0) * math.tau
        ca, sa = math.cos(a), math.sin(a)
        sh = 0.150 if k % 2 == 0 else 0.108
        s_pts = [crown_m @ Vector((ca * lerp(0.168, 0.192, t), sa * lerp(0.168, 0.192, t), lerp(0.012, sh, t)))
                 for t in (0.0, 0.35, 0.7, 1.0)]
        add_sweep(bm, s_pts, [(-0.012, -0.006), (0.012, -0.006), (0.007, 0.008), (-0.007, 0.008)],
                  mat_idx=MM_GOLD24, closed=False, up_hint=Vector((-sa, ca, 0)),
                  scale_fn=lambda u: 1.25 - 0.72 * u)
        add_gem(bm, s_pts[-1], Vector((0, -0.7, 0.7)).normalized(), 0.014, 0.011,
                MM_GOLD24, gems_cycle[k % 4], 10)
        bp = crown_m @ Vector((ca * 0.180, sa * 0.180, -0.018))
        bn = (crown_m.to_3x3() @ Vector((ca, sa, 0))).normalized()
        add_gem(bm, bp, bn, 0.012, 0.009, MM_GOLD24, gems_cycle[(k + 1) % 4], 10)

    # Blazing Brilliant-Cut Prismatic Diamond Heart levitating inside the Sovereign Crown!
    ico = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.076)
    poke = bmesh.ops.poke(bm, faces=list({f for v in ico["verts"] for f in v.link_faces}))
    for pv in poke["verts"]:
        pv.co = pv.co.normalized() * 0.094
    all_dv = list(set(ico["verts"]) | set(poke["verts"]))
    bmesh.ops.transform(
        bm,
        matrix=Matrix.Translation((0, -0.068, 0.062)) @ Euler((0.28, 0.36, 0.18)).to_matrix().to_4x4(),
        verts=all_dv,
    )
    for v in all_dv:
        for f in v.link_faces:
            f.material_index = MM_DIAMOND
            f.smooth = False

    return finalize_obj("Medal_Tier5_Mythic", bm, mats, col, rot=(0, 0, math.radians(-6.0)),
                        sharp_deg=28.0, flat_mats={MM_DIAMOND})


def build_6_streak_chalice(mats, col):
    """Horological Streak Chalice — golden flame-winged chalice cradling a blazing Swiss chronograph!"""
    bm = bmesh.new()
    # Stepped Obsidian & 24K Gold Trophy Pedestal (Z = -0.32 .. -0.14m)
    add_lathe(bm, [
        (0.01, -0.320), (0.185, -0.320), (0.194, -0.305), (0.180, -0.275),
        (0.145, -0.255), (0.138, -0.200), (0.095, -0.175),
        (0.052, -0.130), (0.068, -0.085), (0.128, -0.035), (0.145, 0.005), (0.095, 0.000),
    ], segs=56, mat_idx=MM_OBS, cap_b=True, cap_t=True)
    for z0, z1, rr in ((-0.316, -0.296, 0.198), (-0.256, -0.240, 0.152), (-0.105, -0.085, 0.074), (-0.010, 0.012, 0.152)):
        add_lathe(bm, [(rr - 0.012, z0), (rr, 0.5 * (z0 + z1)), (rr - 0.012, z1)],
                  segs=56, mat_idx=MM_GOLD24, closed=True)

    # Twin Sweeping Sculpted 3D Molten-Gold Flame-Wing Chalice Handles!
    for side in (-1.0, 1.0):
        for tongue_i, (r_sc, z_hi, mat_t) in enumerate(((1.0, 0.285, MM_GOLD24), (0.82, 0.215, MM_AMBER), (0.66, 0.145, MM_GOLD24))):
            f_pts = []
            for k in range(18):
                u = k / 17.0
                ang = lerp(-0.85, 1.25, u)
                rx = (0.115 + 0.145 * math.sin(u * math.pi * 0.85)) * r_sc
                zz = lerp(-0.145, z_hi, u) + 0.025 * math.sin(u * math.pi * 2.0)
                f_pts.append(Vector((side * rx, -0.012 * tongue_i, zz)))
            add_sweep(bm, f_pts, [(-0.009, -0.005), (0.009, -0.005), (0.004, 0.009), (-0.004, 0.009)],
                      mat_idx=mat_t, closed=False, up_hint=Vector((0, 1, 0)),
                      scale_fn=lambda u: 1.25 * math.sin(clamp(u * 0.92 + 0.06) * math.pi) ** 0.65)

    # Upright Swiss Chronograph Escapement Dial cradled atop the Chalice (Z = +0.135m)!
    dial_c = Vector((0, 0, 0.135))
    dm = Matrix.Translation(dial_c) @ M_FRONT
    add_lathe(bm, [
        (0.005, -0.028), (0.148, -0.028), (0.162, -0.008), (0.162, 0.018),
        (0.145, 0.032), (0.132, 0.028), (0.128, 0.010),
    ], segs=64, mat_idx=MM_GOLD24, cap_b=True, matrix=dm, flutes=48, flute_d=0.0028)
    add_lathe(bm, [(0.005, 0.008), (0.130, 0.010)], segs=48, mat_idx=MM_OBS, cap_t=True, matrix=dm)
    # Winding crown & twin chronograph pushers at top of dial!
    add_lathe(bm, [(0.018, 0), (0.028, 0.018), (0.028, 0.038), (0.014, 0.044)],
              segs=24, mat_idx=MM_GOLD24, cap_t=True, matrix=Matrix.Translation((0, 0, 0.295)), flutes=20, flute_d=0.002)
    for sgn in (-1.0, 1.0):
        pm = Matrix.Translation((sgn * 0.095, 0, 0.268)) @ Matrix.Rotation(-sgn * math.radians(32.0), 4, "Y")
        add_lathe(bm, [(0.012, 0), (0.018, 0.015), (0.018, 0.030), (0.010, 0.034)],
                  segs=16, mat_idx=MM_GOLD24, cap_t=True, matrix=pm)

    # 12 gold chronograph indices + blazing molten-gold streak compass needle!
    for k in range(12):
        a = (k / 12.0) * math.tau
        add_star_ray_3d(bm, dial_c + Vector((0, -0.012, 0)), a, 0.095, 0.124, 0.007, 0.008, MM_GOLD24)
    add_star_ray_3d(bm, dial_c + Vector((0, -0.020, 0)), math.radians(28.0), 0.0, 0.115, 0.016, 0.014, MM_AMBER)
    add_star_ray_3d(bm, dial_c + Vector((0, -0.020, 0)), math.radians(208.0), 0.0, 0.045, 0.012, 0.012, MM_GOLD24)
    add_gem(bm, dial_c + Vector((0, -0.026, 0)), Vector((0, -1, 0)), 0.022, 0.015, MM_GOLD24, MM_RUBY_GEM, 12)
    return finalize_obj("Trophy_Streak_Chronometer", bm, mats, col, rot=(0, 0, math.radians(-12.0)), sharp_deg=32.0)


def build_7_overclock_turbine(mats, col):
    """6.0x Overclock Turbine Trophy — 12-blade 24K centrifugal turbine + 4 crimson clamping jaws!"""
    bm = bmesh.new()
    # Heavy Octagonal Blued-Gunmetal & 24K Brass Industrial-Luxury Base (Z = -0.32 .. -0.14m)
    add_lathe(bm, [
        (0.01, -0.320), (0.200, -0.320), (0.212, -0.302), (0.195, -0.268),
        (0.160, -0.248), (0.148, -0.195), (0.095, -0.165), (0.078, -0.110),
    ], segs=8, mat_idx=MM_OBS, cap_b=True, cap_t=True, angle_off=math.pi / 8.0)
    add_lathe(bm, [(0.206, -0.312), (0.218, -0.300), (0.202, -0.285)],
              segs=8, mat_idx=MM_GOLD24, closed=True, angle_off=math.pi / 8.0)
    add_lathe(bm, [(0.152, -0.252), (0.168, -0.242), (0.154, -0.230)],
              segs=8, mat_idx=MM_GOLD24, closed=True, angle_off=math.pi / 8.0)
    # Sculpted 24K Gold Cradle Collar & Twin Struts uniting Pedestal to Turbine Housing!
    add_lathe(bm, [(0.088, -0.172), (0.112, -0.152), (0.104, -0.118), (0.082, -0.112)],
              segs=8, mat_idx=MM_GOLD24, closed=True, angle_off=math.pi / 8.0)
    for side in (-1.0, 1.0):
        c_pts = [Vector((side * 0.088, 0.0, -0.155)), Vector((side * 0.132, 0.0, -0.115)), Vector((side * 0.158, 0.0, -0.068))]
        add_sweep(bm, c_pts, [(-0.012, -0.016), (0.012, -0.016), (0.010, 0.016), (-0.010, 0.016)],
                  mat_idx=MM_GOLD24, closed=False, up_hint=Vector((0, 1, 0)))

    # Turbine Rotor Center at Z = +0.085m!
    tc = Vector((0, 0, 0.085))
    tm = Matrix.Translation(tc) @ M_FRONT
    # Outer shrouded 24K Gold & Gunmetal Turbine Housing Ring (r = 0.205m)
    add_lathe(bm, [
        (0.178, -0.036), (0.208, -0.032), (0.215, 0.000),
        (0.208, 0.032), (0.178, 0.036), (0.172, 0.000),
    ], segs=64, mat_idx=MM_SGOLD, closed=True, matrix=tm, flutes=32, flute_d=0.003)

    # 12 Swept Pitched 24K Liquid-Gold Centrifugal Turbine Impeller Blades!
    for k in range(12):
        a = (k / 12.0) * math.tau
        b_pts = []
        for si in range(9):
            u = si / 8.0
            aa = a + u * 0.42
            rr = lerp(0.068, 0.174, u)
            yy = lerp(-0.018, 0.014, u)
            b_pts.append(tc + Vector((math.sin(aa) * rr, yy, math.cos(aa) * rr)))
        add_sweep(bm, b_pts, [(-0.0035, -0.018), (0.0035, -0.018), (0.0025, 0.018), (-0.0025, 0.018)],
                  mat_idx=MM_GOLD24, closed=False, up_hint=Vector((0, 1, 0)))

    # 4 Heavy Machined 24K Gold & Crimson-Ruby Overclock Clamping Jaws at 45°, 135°, 225°, 315°!
    for j_i in range(4):
        aj = (j_i + 0.5) * (math.pi * 0.5)
        rot_j = Matrix.Rotation(aj, 4, "Y")
        j_pts = [
            tc + (rot_j @ Vector((math.sin(lerp(-0.55, 0.55, k / 12.0)) * 0.242, 0.0,
                                  math.cos(lerp(-0.55, 0.55, k / 12.0)) * 0.242)))
            for k in range(13)
        ]
        add_sweep(bm, j_pts, [(-0.016, -0.014), (0.016, -0.014), (0.012, 0.018), (-0.012, 0.018)],
                  mat_idx=MM_GOLD24, closed=False, up_hint=Vector((0, 1, 0)),
                  scale_fn=lambda u: 0.45 + 0.75 * math.sin(u * math.pi))
        mid_p = tc + (rot_j @ Vector((0, -0.018, 0.248)))
        add_gem(bm, mid_p, Vector((0, -1, 0)), 0.016, 0.012, MM_GOLD24, MM_RUBY_GEM, 10)

    # Incandescent Molten Crimson-Amber 6.0x Reactor Heart at Hub Center!
    ico = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.058)
    poke = bmesh.ops.poke(bm, faces=list({f for v in ico["verts"] for f in v.link_faces}))
    for pv in poke["verts"]:
        pv.co = pv.co.normalized() * 0.068
    dv = list(set(ico["verts"]) | set(poke["verts"]))
    bmesh.ops.transform(bm, matrix=Matrix.Translation(tc + Vector((0, -0.010, 0))), verts=dv)
    for v in dv:
        for f in v.link_faces:
            f.material_index = MM_RUBY_GEM
            f.smooth = False
    return finalize_obj("Trophy_Overclock_Roulette", bm, mats, col, rot=(0, 0, math.radians(-12.0)),
                        sharp_deg=28.0, flat_mats={MM_RUBY_GEM})


def build_8_polymath_globe(mats, col):
    """12-Domain Armillary Polymath Trophy — 12-jewel armillary rings + lapis-and-gold terrestrial globe!"""
    bm = bmesh.new()
    # Stepped Obsidian & 24K Gold Tripod Meridian Stand (Z = -0.33 .. -0.14m)
    add_lathe(bm, [
        (0.01, -0.330), (0.185, -0.330), (0.194, -0.312), (0.172, -0.282),
        (0.125, -0.258), (0.055, -0.195), (0.048, -0.135), (0.075, -0.115),
    ], segs=56, mat_idx=MM_OBS, cap_b=True, cap_t=True)
    add_lathe(bm, [(0.188, -0.324), (0.200, -0.312), (0.184, -0.296)],
              segs=56, mat_idx=MM_GOLD24, closed=True)
    for k in range(3):
        ang = math.radians(90.0 + k * 120.0)
        ca, sa = math.cos(ang), math.sin(ang)
        s_pts = [
            Vector((ca * 0.185, sa * 0.185, -0.305)),
            Vector((ca * 0.215, sa * 0.215, -0.220)),
            Vector((ca * 0.145, sa * 0.145, -0.115)),
        ]
        add_sweep(bm, s_pts, [(-0.010, -0.008), (0.010, -0.008), (0.008, 0.010), (-0.008, 0.010)],
                  mat_idx=MM_GOLD24, closed=False, up_hint=Vector((-sa, ca, 0)))

    gc = Vector((0, 0, 0.085))
    # Royal Lapis-Lazuli Terrestrial Globe (`r = 0.128m`) + Raised 24K Gold Latitude/Longitude Filigree Grid!
    prof_sp = [(max(0.002, math.cos(-math.pi * 0.5 + i / 20.0 * math.pi) * 0.128),
                math.sin(-math.pi * 0.5 + i / 20.0 * math.pi) * 0.128) for i in range(21)]
    tilt_g = Matrix.Translation(gc) @ Matrix.Rotation(math.radians(-23.4), 4, "Y")
    add_lathe(bm, prof_sp, segs=40, mat_idx=MM_LAPIS, cap_b=True, cap_t=True, matrix=tilt_g)

    # Raised 24K gold meridians & tropics on the globe!
    w_cs = [(-0.003, -0.003), (0.003, -0.003), (0.003, 0.003), (-0.003, 0.003)]
    for m_i in range(6):
        az = m_i * (math.pi / 6.0)
        ca, sa = math.cos(az), math.sin(az)
        mp = [tilt_g @ Vector((math.cos(k / 40.0 * math.tau) * ca * 0.131,
                               math.cos(k / 40.0 * math.tau) * sa * 0.131,
                               math.sin(k / 40.0 * math.tau) * 0.131)) for k in range(40)]
        add_sweep(bm, mp, w_cs, mat_idx=MM_GOLD24, closed=True)
    for lat_d in (-23.5, 0.0, 23.5):
        lr = math.cos(math.radians(lat_d)) * 0.131
        lz = math.sin(math.radians(lat_d)) * 0.131
        lp = [tilt_g @ Vector((math.cos(k / 40.0 * math.tau) * lr, math.sin(k / 40.0 * math.tau) * lr, lz)) for k in range(40)]
        add_sweep(bm, lp, w_cs, mat_idx=MM_GOLD24, closed=True)

    # 3 Nested Armillary Rings + 12 Domain Jewel Bearings around the Outer Meridian Ring!
    for r_ring, r_mat, r_rot in (
        (0.228, MM_GOLD24, Euler((0.0, math.radians(-12.0), 0.0))),
        (0.195, MM_PLAT, Euler((math.radians(52.0), math.radians(18.0), math.radians(24.0)))),
        (0.168, MM_SGOLD, Euler((math.radians(-42.0), math.radians(-22.0), math.radians(-18.0)))),
    ):
        rm = Matrix.Translation(gc) @ r_rot.to_matrix().to_4x4()
        rp = [rm @ Vector((math.sin(k / 64.0 * math.tau) * r_ring, 0.0, math.cos(k / 64.0 * math.tau) * r_ring)) for k in range(64)]
        add_sweep(bm, rp, [(-0.007, -0.011), (0.007, -0.011), (0.009, 0.0), (0.007, 0.011), (-0.007, 0.011), (-0.009, 0.0)],
                  mat_idx=r_mat, closed=True, up_hint=Vector((0, 1, 0)))

    # 12 Vivid Domain Jewels around the Outer Meridian Ring + Sovereign Finial Spire!
    domain_gems = (MM_SAP_GEM, MM_EM_GEM, MM_RUBY_GEM, MM_AMBER, MM_AMETHYST, MM_DIAMOND)
    rm_outer = Matrix.Translation(gc) @ Euler((0.0, math.radians(-12.0), 0.0)).to_matrix().to_4x4()
    for k in range(12):
        a = (k / 12.0) * math.tau
        gp = rm_outer @ Vector((math.sin(a) * 0.228, -0.011, math.cos(a) * 0.228))
        add_gem(bm, gp, Vector((0, -1, 0)), 0.011, 0.0085, MM_GOLD24, domain_gems[k % 6], 10)

    fin_m = Matrix.Translation(gc + Vector((-0.048, 0, 0.226))) @ Matrix.Rotation(math.radians(-12.0), 4, "Y")
    add_lathe(bm, [(0.016, 0), (0.022, 0.012), (0.010, 0.028), (0.014, 0.040), (0.002, 0.075)],
              segs=20, mat_idx=MM_GOLD24, cap_t=True, matrix=fin_m)
    return finalize_obj("Trophy_Polymath_Globe", bm, mats, col, rot=(0, 0, math.radians(-10.0)), sharp_deg=32.0)


# ===========================================================================
# Transparent Film Watchmaking Studio Rig & Render Loop
# ===========================================================================
def setup_icon_studio(scene, st_col):
    world = bpy.data.worlds.new("Medal_IBL_World")
    scene.world = world
    world.use_nodes = True
    nodes, links = world.node_tree.nodes, world.node_tree.links
    nodes.clear()
    w_out = nodes.new("ShaderNodeOutputWorld")
    w_bg = nodes.new("ShaderNodeBackground")
    w_bg.inputs["Strength"].default_value = 1.15
    tc = nodes.new("ShaderNodeTexCoord")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    mr = nodes.new("ShaderNodeMapRange")
    mr.inputs["From Min"].default_value = -1.0
    mr.inputs["From Max"].default_value = 1.0
    ramp = nodes.new("ShaderNodeValToRGB")
    elts = ramp.color_ramp.elements
    elts[0].position, elts[0].color = 0.0, hex_rgba("#080E1E")
    elts[1].position, elts[1].color = 0.46, hex_rgba("#1A2E52")
    e2 = ramp.color_ramp.elements.new(0.66)
    e2.color = hex_rgba("#5A86C8")
    e3 = ramp.color_ramp.elements.new(0.80)
    e3.color = hex_rgba("#FFE5AD")
    e4 = ramp.color_ramp.elements.new(0.95)
    e4.color = hex_rgba("#1C2C48")
    links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    links.new(sep.outputs["Z"], mr.inputs["Value"])
    links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    links.new(ramp.outputs["Color"], w_bg.inputs["Color"])
    links.new(w_bg.outputs["Background"], w_out.inputs["Surface"])

    def add_al(nm, loc, en, col_h, sz):
        ld = bpy.data.lights.new(nm, type="AREA")
        ld.shape = "DISK"
        ld.size = sz
        ld.energy = en
        ld.color = hex_rgba(col_h)[:3]
        lo = bpy.data.objects.new(nm, ld)
        lo.location = loc
        lo.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat("-Z", "Y").to_euler()
        st_col.objects.link(lo)

    add_al("Key", (0.95, -1.35, 0.95), 95.0, "#FFE6BA", 0.95)
    add_al("RimL", (-1.15, 0.55, 0.85), 115.0, "#7EC4FF", 0.85)
    add_al("FillB", (-0.85, -1.25, -0.55), 42.0, "#F5D294", 0.90)
    add_al("TopCrown", (0.05, -0.45, 1.45), 48.0, "#FFF4DF", 0.70)

    cam_d = bpy.data.cameras.new("IconCam")
    cam_d.lens = 75.0
    cam_d.sensor_width = 36.0
    cam_o = bpy.data.objects.new("IconCam", cam_d)
    cam_o.location = (0.15, -1.86, 0.18)
    cam_o.rotation_euler = (Vector((0, 0, 0.0)) - cam_o.location).to_track_quat("-Z", "Y").to_euler()
    st_col.objects.link(cam_o)
    scene.camera = cam_o

    scene.render.engine = "BLENDER_EEVEE"
    scene.render.film_transparent = True
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
    scene.view_settings.exposure = 0.28
    scene.render.resolution_x = 640
    scene.render.resolution_y = 640
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"


def main():
    t0 = time.time()
    log = [f"BLENDER_VERSION={bpy.app.version_string}"]
    builders = [
        ("medal_tier1_bronze", build_1_bronze),
        ("medal_tier2_sterling", build_2_sterling),
        ("medal_tier3_gold", build_3_gold),
        ("medal_tier4_sapphire", build_4_sapphire),
        ("medal_tier5_mythic", build_5_mythic),
        ("trophy_streak_chronometer", build_6_streak_chalice),
        ("trophy_overclock_roulette", build_7_overclock_turbine),
        ("trophy_polymath_globe", build_8_polymath_globe),
    ]

    for m_id, fn in builders:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        scene = bpy.context.scene
        m_col = bpy.data.collections.new(m_id)
        st_col = bpy.data.collections.new("Studio")
        scene.collection.children.link(m_col)
        scene.collection.children.link(st_col)

        mats = build_medal_materials()
        obj = fn(mats, m_col)
        setup_icon_studio(scene, st_col)

        deps = bpy.context.evaluated_depsgraph_get()
        ev = obj.evaluated_get(deps)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        tris = len(me.loop_triangles)
        ev.to_mesh_clear()
        log.append(f"{m_id.upper()}_TRIS={tris}")

        scene.render.filepath = str(RENDER_DIR / f"_tmp_{m_id}.png")
        bpy.ops.render.render(write_still=True)

    log.append(f"TOTAL_SECS={time.time() - t0:.1f}")
    log.append("STATUS=SUCCESS")
    LOG_FILE.write_text("\n".join(log) + "\n", encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        LOG_FILE.write_text("STATUS=ERROR\n" + traceback.format_exc(), encoding="utf-8")
        raise
