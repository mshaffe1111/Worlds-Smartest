#!/usr/bin/env python3
"""
World's Smartest — Store-Grade 3D App Icon Sculptor & Multi-Platform Packager
Renders 1024x1024 luxury 3D app icon masters from `public/assets/aaa_models/veritas_prism.glb`
in Blender 5.3.0, and packages the complete iOS / Android / Desktop / Browser favicon suite.

Usage:
  1) Render 1024x1024 3D masters in Blender 5.3.0:
     blender-launcher.exe --background --python tools/blender/build_app_icons.py -- \
       --work-dir <scratch_dir> --sentinel <sentinel_file>
  2) Package multi-platform PNG/ICO icon suite via Pillow:
     python tools/blender/build_app_icons.py --package --work-dir <scratch_dir>
"""

import argparse
import json
import math
import os
import sys
import tempfile
import time
import traceback
from pathlib import Path

SCRIPT_PATH = Path(__file__).resolve()
PROJECT_ROOT = SCRIPT_PATH.parents[2]
PRISM_GLB = PROJECT_ROOT / "public" / "assets" / "aaa_models" / "veritas_prism.glb"
PUBLIC_DIR = PROJECT_ROOT / "public"


def parse_cli_args():
    argv = sys.argv
    if "--" in argv:
        argv = argv[argv.index("--") + 1:]
    else:
        argv = argv[1:]
    parser = argparse.ArgumentParser(description="Build World's Smartest 3D PWA App Icons")
    parser.add_argument("--package", action="store_true", help="Run Pillow packaging stage")
    parser.add_argument(
        "--work-dir",
        type=str,
        default=str(Path(tempfile.gettempdir()) / "worlds_smartest_app_icons"),
        help="Directory for intermediate 1024x1024 renders and logs",
    )
    parser.add_argument(
        "--sentinel",
        type=str,
        default="",
        help="Optional sentinel file written when Blender finishes",
    )
    parser.add_argument(
        "--contact-sheet",
        type=str,
        default="",
        help="Optional visual inspection contact sheet PNG path (for review only)",
    )
    return parser.parse_args(argv)


# ===========================================================================
# MODE 2: PILLOW MULTI-PLATFORM ICON PACKAGER (LANCZOS + OPTICAL POLISH)
# ===========================================================================
def add_luxury_bloom_and_polish(
    img,
    bloom_radius: float = 18.0,
    bloom_strength: float = 0.24,
    contrast_boost: float = 1.04,
    saturation_boost: float = 1.07,
    corner_hex: str = "#050811",
    vignette_strength: float = 0.20,
):
    from PIL import Image, ImageChops, ImageEnhance, ImageFilter

    base = img.convert("RGB")
    w, h = base.size

    # Extract luminous highlights (24K gold speculars & cyan/gold prism core)
    # via smooth soft-threshold luminance mask so bloom only kisses true highlights.
    lum = base.convert("L")
    thresh_lut = [0 if v < 168 else int(((v - 168) / 87.0) ** 1.35 * 255) for v in range(256)]
    hi_mask = lum.point(thresh_lut)
    hi_layer = Image.composite(base, Image.new("RGB", (w, h), (0, 0, 0)), hi_mask)

    glow_tight = hi_layer.filter(ImageFilter.GaussianBlur(radius=max(1.5, bloom_radius * 0.35)))
    glow_wide = hi_layer.filter(ImageFilter.GaussianBlur(radius=max(3.0, bloom_radius)))

    # Blend dual-radius optical bloom softly via Screen
    tight_scaled = ImageEnhance.Brightness(glow_tight).enhance(bloom_strength * 0.65)
    wide_scaled = ImageEnhance.Brightness(glow_wide).enhance(bloom_strength)
    polished = ImageChops.screen(base, tight_scaled)
    polished = ImageChops.screen(polished, wide_scaled)

    # Gentle luxury contrast & color richness lift
    polished = ImageEnhance.Contrast(polished).enhance(contrast_boost)
    polished = ImageEnhance.Color(polished).enhance(saturation_boost)

    # Subtle outer corner vignette ensuring seamless deep midnight-obsidian edges (#050811)
    if vignette_strength > 0.0:
        c_r = int(corner_hex[1:3], 16)
        c_g = int(corner_hex[3:5], 16)
        c_b = int(corner_hex[5:7], 16)
        v_size = 128
        v_mask = Image.new("L", (v_size, v_size), 0)
        v_px = v_mask.load()
        half = (v_size - 1) * 0.5
        for y in range(v_size):
            dy = (y - half) / half
            for x in range(v_size):
                dx = (x - half) / half
                r = math.hypot(dx, dy)
                # Smooth fade starting at r=0.72 out to corner r=1.414
                t = max(0.0, min(1.0, (r - 0.72) / 0.62))
                t = t * t * (3.0 - 2.0 * t)
                v_px[x, y] = int(t * vignette_strength * 255)
        v_mask = v_mask.resize((w, h), Image.Resampling.BICUBIC)
        edge_layer = Image.new("RGB", (w, h), (c_r, c_g, c_b))
        polished = Image.composite(edge_layer, polished, v_mask)

    return polished


def make_squircle_favicon(master_rgb, size: int, add_gold_rim: bool = True):
    """Build an ultra-crisp supersampled rounded-squircle RGBA favicon for browser tabs."""
    from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

    ss = 4
    hi = size * ss
    # Slight optical polish before downsampling so tiny icons sparkle on light & dark tabs
    canvas = master_rgb.resize((hi, hi), Image.Resampling.LANCZOS)
    if size <= 32:
        canvas = ImageEnhance.Contrast(canvas).enhance(1.10)
        canvas = ImageEnhance.Color(canvas).enhance(1.10)
        canvas = canvas.filter(ImageFilter.UnsharpMask(radius=1.8, percent=135, threshold=2))
    else:
        canvas = canvas.filter(ImageFilter.UnsharpMask(radius=1.4, percent=95, threshold=2))

    # Supersampled rounded-squircle alpha mask
    radius = int(round(hi * 0.225))
    mask = Image.new("L", (hi, hi), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle([0, 0, hi - 1, hi - 1], radius=radius, fill=255)

    rgba = canvas.convert("RGBA")
    if add_gold_rim and size >= 32:
        rim_overlay = Image.new("RGBA", (hi, hi), (0, 0, 0, 0))
        rdraw = ImageDraw.Draw(rim_overlay)
        inset = max(2, ss // 2)
        stroke_w = max(2, int(round(ss * 0.85)))
        rdraw.rounded_rectangle(
            [inset, inset, hi - 1 - inset, hi - 1 - inset],
            radius=max(4, radius - inset),
            outline=(236, 198, 114, 155),
            width=stroke_w,
        )
        rgba = Image.alpha_composite(rgba, rim_overlay)

    rgba.putalpha(mask)
    out = rgba.resize((size, size), Image.Resampling.LANCZOS)
    return out


def package_icons(work_dir: Path, contact_sheet_path: str = ""):
    from PIL import Image, ImageDraw, ImageFilter

    hero_path = work_dir / "icon_master_hero_1024.png"
    maskable_path = work_dir / "icon_master_maskable_1024.png"
    favicon_path = work_dir / "icon_master_favicon_1024.png"

    for p in (hero_path, maskable_path, favicon_path):
        if not p.exists():
            raise FileNotFoundError(f"Missing rendered master: {p}")

    hero_raw = Image.open(hero_path)
    maskable_raw = Image.open(maskable_path)
    favicon_raw = Image.open(favicon_path)

    # Apply subtle luxury optical bloom & obsidian edge consistency
    hero_master = add_luxury_bloom_and_polish(
        hero_raw,
        bloom_radius=20.0,
        bloom_strength=0.26,
        contrast_boost=1.05,
        saturation_boost=1.08,
        vignette_strength=0.22,
    )
    maskable_master = add_luxury_bloom_and_polish(
        maskable_raw,
        bloom_radius=18.0,
        bloom_strength=0.24,
        contrast_boost=1.05,
        saturation_boost=1.08,
        vignette_strength=0.18,
    )
    favicon_master = add_luxury_bloom_and_polish(
        favicon_raw,
        bloom_radius=16.0,
        bloom_strength=0.28,
        contrast_boost=1.08,
        saturation_boost=1.10,
        vignette_strength=0.14,
    )

    # Save polished 1024 masters back to work_dir for visual review
    hero_master.save(work_dir / "icon_polished_hero_1024.png", format="PNG", optimize=True)
    maskable_master.save(work_dir / "icon_polished_maskable_1024.png", format="PNG", optimize=True)

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Opaque RGB App Icons (NO alpha channel so iOS squircle never turns transparent corners black!)
    icon_512 = hero_master.resize((512, 512), Image.Resampling.LANCZOS)
    icon_512 = icon_512.filter(ImageFilter.UnsharpMask(radius=0.8, percent=45, threshold=2))
    icon_512.convert("RGB").save(PUBLIC_DIR / "icon-512.png", format="PNG", optimize=True)

    icon_192 = hero_master.resize((192, 192), Image.Resampling.LANCZOS)
    icon_192 = icon_192.filter(ImageFilter.UnsharpMask(radius=0.7, percent=60, threshold=2))
    icon_192.convert("RGB").save(PUBLIC_DIR / "icon-192.png", format="PNG", optimize=True)

    apple_180 = hero_master.resize((180, 180), Image.Resampling.LANCZOS)
    apple_180 = apple_180.filter(ImageFilter.UnsharpMask(radius=0.7, percent=62, threshold=2))
    apple_180.convert("RGB").save(PUBLIC_DIR / "apple-touch-icon.png", format="PNG", optimize=True)

    # 2. Android Maskable Adaptive Icon (512x512 opaque RGB, Prism cleanly inside 80% safe circle!)
    maskable_512 = maskable_master.resize((512, 512), Image.Resampling.LANCZOS)
    maskable_512 = maskable_512.filter(ImageFilter.UnsharpMask(radius=0.8, percent=45, threshold=2))
    maskable_512.convert("RGB").save(PUBLIC_DIR / "icon-maskable-512.png", format="PNG", optimize=True)

    # 3. Crisp Browser Favicons (32x32, 16x16, and multi-resolution 16/32/48 favicon.ico)
    fav_48 = make_squircle_favicon(favicon_master, 48, add_gold_rim=True)
    fav_32 = make_squircle_favicon(favicon_master, 32, add_gold_rim=True)
    fav_16 = make_squircle_favicon(favicon_master, 16, add_gold_rim=False)

    fav_32.save(PUBLIC_DIR / "favicon-32x32.png", format="PNG", optimize=True)
    fav_16.save(PUBLIC_DIR / "favicon-16x16.png", format="PNG", optimize=True)

    # Multi-resolution ICO embedding exact pre-sharpened 48, 32, and 16 frames
    fav_48.save(
        PUBLIC_DIR / "favicon.ico",
        format="ICO",
        append_images=[fav_32, fav_16],
        sizes=[(48, 48), (32, 32), (16, 16)],
    )

    # Optional visual QA contact sheet (saved ONLY in scratch work_dir if requested)
    if contact_sheet_path:
        sheet = Image.new("RGB", (1120, 680), (18, 22, 30))
        draw = ImageDraw.Draw(sheet)

        # Left: 512 icon with iOS squircle preview overlay next to it
        sheet.paste(icon_512.resize((320, 320), Image.Resampling.LANCZOS), (24, 36))
        draw.text((24, 12), "icon-512.png (opaque RGB)", fill=(240, 225, 190))

        # Middle: maskable-512 with 80% safe-zone dashed circle guide
        m_prev = maskable_512.resize((320, 320), Image.Resampling.LANCZOS)
        md = ImageDraw.Draw(m_prev)
        pad80 = int(320 * 0.10)  # 80% diameter circle -> 10% margin each side
        md.ellipse([pad80, pad80, 320 - pad80, 320 - pad80], outline=(80, 235, 255), width=2)
        pad67 = int(320 * 0.165)  # 67% strict Android keyline
        md.ellipse([pad67, pad67, 320 - pad67, 320 - pad67], outline=(255, 208, 96), width=1)
        sheet.paste(m_prev, (376, 36))
        draw.text((376, 12), "icon-maskable-512 (cyan=80% safe, gold=67%)", fill=(240, 225, 190))

        # Right: iOS squircle simulation on dark & light wallpapers
        sq_mask = Image.new("L", (180, 180), 0)
        ImageDraw.Draw(sq_mask).rounded_rectangle([0, 0, 179, 179], radius=41, fill=255)
        draw.rectangle([728, 36, 1096, 356], fill=(235, 238, 244))
        sheet.paste(apple_180, (752, 106), sq_mask)
        draw.rectangle([948, 36, 1096, 356], fill=(12, 16, 24))
        sheet.paste(icon_192.resize((120, 120), Image.Resampling.LANCZOS), (962, 136))
        draw.text((728, 12), "apple-touch-icon 180 (iOS squircle) & 192", fill=(240, 225, 190))

        # Bottom row: favicons at 1x and zoomed 4x on BOTH light tab and dark tab!
        draw.rectangle([24, 404, 540, 650], fill=(242, 244, 248))
        draw.rectangle([560, 404, 1096, 650], fill=(24, 28, 36))
        draw.text((24, 380), "Favicons on LIGHT tab (1x + 4x zoom)", fill=(240, 225, 190))
        draw.text((560, 380), "Favicons on DARK tab (1x + 4x zoom)", fill=(240, 225, 190))

        for base_x in (48, 584):
            sheet.paste(fav_48, (base_x, 436), fav_48)
            sheet.paste(fav_32, (base_x + 76, 444), fav_32)
            sheet.paste(fav_16, (base_x + 132, 452), fav_16)
            sheet.paste(fav_32.resize((128, 128), Image.Resampling.NEAREST), (base_x + 184, 436), fav_32.resize((128, 128), Image.Resampling.NEAREST))
            sheet.paste(fav_16.resize((96, 96), Image.Resampling.NEAREST), (base_x + 340, 452), fav_16.resize((96, 96), Image.Resampling.NEAREST))

        sheet.save(contact_sheet_path, format="PNG", optimize=True)

    summary = {}
    for fname in (
        "apple-touch-icon.png",
        "icon-192.png",
        "icon-512.png",
        "icon-maskable-512.png",
        "favicon-32x32.png",
        "favicon-16x16.png",
        "favicon.ico",
    ):
        fpath = PUBLIC_DIR / fname
        im = Image.open(fpath)
        info = {"bytes": fpath.stat().st_size, "size": list(im.size), "mode": im.mode}
        if fname == "favicon.ico":
            info["ico_sizes"] = sorted(list(im.info.get("sizes", [])))
        summary[fname] = info
    print(json.dumps(summary, indent=2))


# ===========================================================================
# MODE 1: BLENDER 5.3.0 HOROLOGICAL 3D APP ICON STUDIO RENDERER
# ===========================================================================
def run_blender_render(work_dir: Path, sentinel_path: str):
    import bpy
    import bmesh
    from mathutils import Euler, Vector
    from bpy_extras.object_utils import world_to_camera_view

    t0 = time.time()
    work_dir.mkdir(parents=True, exist_ok=True)
    log = [f"BLENDER_VERSION={bpy.app.version_string}"]

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

    def add_area_light(name, col, loc, target, energy, color_hex, sx, sy, spread_deg=78.0):
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

    def add_point_light(name, col, loc, energy, color_hex, radius=0.06):
        ld = bpy.data.lights.new(name, type="POINT")
        ld.energy = energy
        ld.color = hex_rgba(color_hex)[:3]
        ld.shadow_soft_size = radius
        lo = bpy.data.objects.new(name, ld)
        lo.location = loc
        col.objects.link(lo)
        return lo

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    studio_col = bpy.data.collections.new("Icon_Studio_Rig")
    scene.collection.children.link(studio_col)

    if not PRISM_GLB.exists():
        raise FileNotFoundError(f"Missing GLB: {PRISM_GLB}")

    # Import genuine veritas_prism.glb
    bpy.ops.import_scene.gltf(filepath=str(PRISM_GLB))
    imported_objs = [o for o in bpy.data.objects if o.name not in ("Icon_Studio_Rig",)]
    mesh_objs = [o for o in imported_objs if o.type == "MESH"]
    log.append(f"IMPORTED_OBJECTS={len(imported_objs)}")
    log.append(f"IMPORTED_MESHES={len(mesh_objs)}")

    # Pose the Veritas Prism at a heroic 3/4 horological reveal pose:
    # - Rotate Facet_Carousel slightly so flanking smoked-sapphire shields frame the glowing core
    # - Bloom Shutter_0..5 gently so the faceted cyan/gold diamond heart shines cleanly through
    carousel = bpy.data.objects.get("Facet_Carousel")
    if carousel is not None:
        carousel.rotation_mode = "XYZ"
        carousel.rotation_euler = (0.0, 0.0, math.radians(-20.0))

    for idx in range(6):
        shutter = bpy.data.objects.get(f"Shutter_{idx}")
        if shutter is not None:
            shutter.rotation_mode = "XYZ"
            cur = shutter.rotation_euler.copy()
            shutter.rotation_euler = Euler((cur.x + math.radians(15.0), cur.y, cur.z), "XYZ")

    # Slightly spin Hologram_Core so sharp diamond crystal facets catch key & cyan rim light
    core_obj = bpy.data.objects.get("Hologram_Core")
    if core_obj is not None:
        core_obj.rotation_mode = "XYZ"
        core_obj.rotation_euler = (0.0, 0.0, math.radians(22.0))

    # Enhance materials in-memory ONLY (veritas_prism.glb on disk is NEVER touched!)
    # Gives authentic 24K gold brilliance, smoked-sapphire clarity, and luminous cyan/gold core refraction
    for mat in bpy.data.materials:
        if not mat.use_nodes or not mat.node_tree:
            continue
        nt = mat.node_tree
        nodes, links = nt.nodes, nt.links
        bsdf = next((n for n in nodes if n.type == "BSDF_PRINCIPLED"), None)
        if bsdf is None:
            continue

        if mat.name.startswith("Mat_Crystal_Heart"):
            # Dual-tone prismatic cyan-to-24K-gold crystal heart refraction shader
            # Kept below AgX desaturation cliff so BOTH warm gold & electric cyan facets sing!
            lw = nodes.new("ShaderNodeLayerWeight")
            lw.inputs["Blend"].default_value = 0.54
            ramp = nodes.new("ShaderNodeValToRGB")
            elts = ramp.color_ramp.elements
            elts[0].position = 0.05
            elts[0].color = hex_rgba("#FFD25A")  # rich molten 24K gold heart
            elts[1].position = 0.72
            elts[1].color = hex_rgba("#12E2FF")  # vivid electric cyan prismatic refraction
            mid = ramp.color_ramp.elements.new(0.42)
            mid.color = hex_rgba("#FFBA38")
            links.new(lw.outputs["Facing"], ramp.inputs["Fac"])

            if "Base Color" in bsdf.inputs:
                links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
            if "Emission Color" in bsdf.inputs:
                links.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"])
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = 2.05
            if "Roughness" in bsdf.inputs:
                bsdf.inputs["Roughness"].default_value = 0.04
            if "Coat Weight" in bsdf.inputs:
                bsdf.inputs["Coat Weight"].default_value = 1.0

        elif mat.name.startswith("Mat_Facet_Crystal"):
            # Jewel-cut smoked-sapphire watch crystal with subtle cyan-sapphire edge refraction
            if "Base Color" in bsdf.inputs:
                bsdf.inputs["Base Color"].default_value = hex_rgba("#3272CC")
            if "Roughness" in bsdf.inputs:
                bsdf.inputs["Roughness"].default_value = 0.10
            if "Alpha" in bsdf.inputs:
                bsdf.inputs["Alpha"].default_value = 0.38
            if "Transmission Weight" in bsdf.inputs:
                bsdf.inputs["Transmission Weight"].default_value = 0.85
            if "Coat Weight" in bsdf.inputs:
                bsdf.inputs["Coat Weight"].default_value = 0.82
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = hex_rgba("#1E78D8")
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = 0.34
            if hasattr(mat, "surface_render_method"):
                mat.surface_render_method = "BLENDED"
            if hasattr(mat, "use_raytrace_refraction"):
                mat.use_raytrace_refraction = True

        elif mat.name.startswith("Mat_Brushed_Gold") or mat.name.startswith("Mat_Liquid_Gold_24K"):
            if "Metallic" in bsdf.inputs:
                bsdf.inputs["Metallic"].default_value = 0.98
            if "Coat Weight" in bsdf.inputs:
                bsdf.inputs["Coat Weight"].default_value = 0.28

        elif mat.name.startswith("Mat_Sapphire_Jewel"):
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = 1.65

        elif mat.name.startswith("Mat_Ruby_Jewel"):
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = 1.55

        elif mat.name.startswith("Mat_Levitation_Glow"):
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = hex_rgba("#FFD060")
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = 2.6

    # Measure posed world bounding box
    bpy.context.view_layer.update()
    deps = bpy.context.evaluated_depsgraph_get()
    min_pt = Vector((1e9, 1e9, 1e9))
    max_pt = Vector((-1e9, -1e9, -1e9))
    world_verts = []
    for obj in mesh_objs:
        ev = obj.evaluated_get(deps)
        me = ev.to_mesh()
        mw = ev.matrix_world
        step = max(1, len(me.vertices) // 600)
        for i in range(0, len(me.vertices), step):
            wp = mw @ me.vertices[i].co
            world_verts.append(wp.copy())
            min_pt.x = min(min_pt.x, wp.x)
            min_pt.y = min(min_pt.y, wp.y)
            min_pt.z = min(min_pt.z, wp.z)
            max_pt.x = max(max_pt.x, wp.x)
            max_pt.y = max(max_pt.y, wp.y)
            max_pt.z = max(max_pt.z, wp.z)
        ev.to_mesh_clear()

    center = (min_pt + max_pt) * 0.5
    prism_h = max_pt.z - min_pt.z
    prism_w = max(max_pt.x - min_pt.x, max_pt.y - min_pt.y)
    log.append(f"BBOX_MIN=({min_pt.x:.4f},{min_pt.y:.4f},{min_pt.z:.4f})")
    log.append(f"BBOX_MAX=({max_pt.x:.4f},{max_pt.y:.4f},{max_pt.z:.4f})")
    log.append(f"CENTER=({center.x:.4f},{center.y:.4f},{center.z:.4f}) W={prism_w:.4f} H={prism_h:.4f}")

    # =====================================================================
    # WORLD SHADER:
    # - Non-camera rays (metallic reflections & glass refraction): High-contrast
    #   horological light-tent HDRI with crisp warm 24K gold & sapphire softbox strips!
    # - Camera rays: Deep midnight-obsidian (#050811) corners blooming into a lush
    #   centered royal-sapphire & whisper-of-cyan jewelers' radial vignette!
    # =====================================================================
    world = bpy.data.worlds.new("App_Icon_Studio_World")
    scene.world = world
    world.use_nodes = True
    wnt = world.node_tree
    wnodes, wlinks = wnt.nodes, wnt.links
    wnodes.clear()

    w_out = wnodes.new("ShaderNodeOutputWorld")
    w_env = wnodes.new("ShaderNodeBackground")
    w_env.inputs["Strength"].default_value = 1.25

    # Reflection environment: vertical horological softbox bands
    tc_env = wnodes.new("ShaderNodeTexCoord")
    sep_env = wnodes.new("ShaderNodeSeparateXYZ")
    mr_env = wnodes.new("ShaderNodeMapRange")
    mr_env.inputs["From Min"].default_value = -1.0
    mr_env.inputs["From Max"].default_value = 1.0

    ramp_env = wnodes.new("ShaderNodeValToRGB")
    ee = ramp_env.color_ramp.elements
    ee[0].position = 0.00
    ee[0].color = hex_rgba("#040712")
    ee[1].position = 0.36
    ee[1].color = hex_rgba("#12264A")
    e2 = ramp_env.color_ramp.elements.new(0.54)
    e2.color = hex_rgba("#4E8EE6")
    e3 = ramp_env.color_ramp.elements.new(0.68)
    e3.color = hex_rgba("#FFE5A8")
    e4 = ramp_env.color_ramp.elements.new(0.80)
    e4.color = hex_rgba("#FFF5DC")
    e5 = ramp_env.color_ramp.elements.new(0.93)
    e5.color = hex_rgba("#15294C")

    wlinks.new(tc_env.outputs["Generated"], sep_env.inputs["Vector"])
    wlinks.new(sep_env.outputs["Z"], mr_env.inputs["Value"])
    wlinks.new(mr_env.outputs["Result"], ramp_env.inputs["Fac"])
    wlinks.new(ramp_env.outputs["Color"], w_env.inputs["Color"])

    # Camera background: seamless screen-space radial midnight-obsidian & sapphire vignette
    # Compute distance from screen center (0.5, 0.5) using Window coordinates
    w_cam = wnodes.new("ShaderNodeBackground")
    w_cam.inputs["Strength"].default_value = 1.0

    tc_cam = wnodes.new("ShaderNodeTexCoord")
    sep_win = wnodes.new("ShaderNodeSeparateXYZ")
    sub_x = wnodes.new("ShaderNodeMath")
    sub_x.operation = "SUBTRACT"
    sub_x.inputs[1].default_value = 0.50
    sub_y = wnodes.new("ShaderNodeMath")
    sub_y.operation = "SUBTRACT"
    sub_y.inputs[1].default_value = 0.50
    sq_x = wnodes.new("ShaderNodeMath")
    sq_x.operation = "MULTIPLY"
    sq_y = wnodes.new("ShaderNodeMath")
    sq_y.operation = "MULTIPLY"
    add_sq = wnodes.new("ShaderNodeMath")
    add_sq.operation = "ADD"
    sqrt_r = wnodes.new("ShaderNodeMath")
    sqrt_r.operation = "SQRT"
    mr_rad = wnodes.new("ShaderNodeMapRange")
    mr_rad.clamp = True
    mr_rad.inputs["From Min"].default_value = 0.0
    mr_rad.inputs["From Max"].default_value = 0.72

    ramp_cam = wnodes.new("ShaderNodeValToRGB")
    ramp_cam.color_ramp.interpolation = "B_SPLINE"
    ce = ramp_cam.color_ramp.elements
    ce[0].position = 0.00
    ce[0].color = hex_rgba("#1E549B")   # luminous sapphire-cyan aura right behind Prism core
    ce[1].position = 1.00
    ce[1].color = hex_rgba("#040710")   # deep midnight-obsidian corners
    c1 = ramp_cam.color_ramp.elements.new(0.24)
    c1.color = hex_rgba("#143972")      # rich royal sapphire glow
    c2 = ramp_cam.color_ramp.elements.new(0.50)
    c2.color = hex_rgba("#0A1A38")      # twilight sapphire velvet
    c3 = ramp_cam.color_ramp.elements.new(0.76)
    c3.color = hex_rgba("#060B18")      # dark midnight-navy transition

    wlinks.new(tc_cam.outputs["Window"], sep_win.inputs["Vector"])
    wlinks.new(sep_win.outputs["X"], sub_x.inputs[0])
    wlinks.new(sep_win.outputs["Y"], sub_y.inputs[0])
    wlinks.new(sub_x.outputs["Value"], sq_x.inputs[0])
    wlinks.new(sub_x.outputs["Value"], sq_x.inputs[1])
    wlinks.new(sub_y.outputs["Value"], sq_y.inputs[0])
    wlinks.new(sub_y.outputs["Value"], sq_y.inputs[1])
    wlinks.new(sq_x.outputs["Value"], add_sq.inputs[0])
    wlinks.new(sq_y.outputs["Value"], add_sq.inputs[1])
    wlinks.new(add_sq.outputs["Value"], sqrt_r.inputs[0])
    wlinks.new(sqrt_r.outputs["Value"], mr_rad.inputs["Value"])
    wlinks.new(mr_rad.outputs["Result"], ramp_cam.inputs["Fac"])
    wlinks.new(ramp_cam.outputs["Color"], w_cam.inputs["Color"])

    lp = wnodes.new("ShaderNodeLightPath")
    mix_w = wnodes.new("ShaderNodeMixShader")
    wlinks.new(lp.outputs["Is Camera Ray"], mix_w.inputs["Fac"])
    wlinks.new(w_env.outputs["Background"], mix_w.inputs[1])
    wlinks.new(w_cam.outputs["Background"], mix_w.inputs[2])
    wlinks.new(mix_w.outputs["Shader"], w_out.inputs["Surface"])

    # =====================================================================
    # HOROLOGICAL JEWELER'S 6-POINT LIGHTING + DUAL CYAN/GOLD CORE LIGHTS
    # (Clean edge-free midnight-sapphire studio — zero floor polygon seams!)
    # =====================================================================
    target = (center.x, center.y, center.z)
    # 1. Warm 24K Rembrandt Key (front-right-above)
    add_area_light("Icon_Key_Gold", studio_col, (1.60, -1.65, 1.55), target, 230.0, "#FFD98A", 1.15, 1.15, 72.0)
    # 2. Vivid Sapphire-Cyan Rim (back-left-above — crisp sapphire edge separation!)
    add_area_light("Icon_Rim_Sapphire", studio_col, (-1.68, 1.38, 1.42), target, 235.0, "#38B8FF", 0.85, 1.55, 68.0)
    # 3. Warm 24K Gold Rim Kicker (back-right — rich golden gleam on right meridian!)
    add_area_light("Icon_Rim_Gold24", studio_col, (1.72, 1.25, 1.12), target, 215.0, "#FFC24A", 0.78, 1.35, 68.0)
    # 4. Warm Champagne Soft Fill (front-left-low — keeps brass & pedestal lush!)
    add_area_light("Icon_Fill_Warm", studio_col, (-1.55, -1.35, 0.55), target, 76.0, "#F6C874", 1.25, 1.25, 98.0)
    # 5. Top Watchmaker Crown Accent (overhead front — makes fluted crown gleam!)
    add_area_light("Icon_Crown_Top", studio_col, (0.18, -0.35, 2.20), target, 96.0, "#FFF0C8", 0.85, 0.85, 62.0)
    # 6. Gentle Bottom Up-Bounce so pedestal scrolls & marble base pop cleanly!
    add_area_light("Icon_Base_Bounce", studio_col, (0.25, -1.10, -0.45), (0.0, 0.0, 0.14), 48.0, "#5DA8FF", 0.90, 0.90, 95.0)

    # Dual Core Internal Refraction Lights (warm 24K gold heart + electric cyan refraction!)
    core_z = core_obj.location.z if core_obj else center.z
    add_point_light("Core_Heart_Gold", studio_col, (0.03, -0.02, core_z + 0.01), 16.0, "#FFBE3A", radius=0.055)
    add_point_light("Core_Refract_Cyan", studio_col, (-0.04, 0.01, core_z - 0.01), 30.0, "#12E2FF", radius=0.065)

    # =====================================================================
    # CAMERA & EEVEE RENDER ENGINE SETTINGS
    # =====================================================================
    cam_d = bpy.data.cameras.new("Icon_Studio_Cam")
    cam_d.lens = 68.0
    cam_d.sensor_width = 36.0
    cam_d.dof.use_dof = False  # Razor-sharp front-to-back jewel clarity for app icons!
    cam_o = bpy.data.objects.new("Icon_Studio_Cam", cam_d)
    studio_col.objects.link(cam_o)
    scene.camera = cam_o

    scene.render.engine = "BLENDER_EEVEE"
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 48
    if hasattr(scene.eevee, "use_raytracing"):
        scene.eevee.use_raytracing = True
    scene.render.film_transparent = False

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
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"

    # Heroic 3/4 jeweler's camera direction (unit vector from target toward camera)
    az_rad = math.radians(22.0)   # 22 deg right of front (-Y)
    el_rad = math.radians(14.0)   # 14 deg gentle heroic elevation
    cam_dir = Vector((
        math.sin(az_rad) * math.cos(el_rad),
        -math.cos(az_rad) * math.cos(el_rad),
        math.sin(el_rad),
    )).normalized()

    def aim_and_fit_camera(target_fill: float, max_radius_cap: float = 0.0):
        """Iteratively center & fit the exact posed Prism silhouette in normalized camera view."""
        aim = center.copy()
        dist = 2.4
        for _ in range(10):
            cam_o.location = aim + cam_dir * dist
            cam_o.rotation_euler = (aim - cam_o.location).to_track_quat("-Z", "Y").to_euler()
            bpy.context.view_layer.update()

            xs, ys = [], []
            max_rad = 0.0
            for wp in world_verts:
                co_2d = world_to_camera_view(scene, cam_o, wp)
                xs.append(co_2d.x)
                ys.append(co_2d.y)
            min_x, max_x = min(xs), max(xs)
            min_y, max_y = min(ys), max(ys)
            span_x = max_x - min_x
            span_y = max_y - min_y
            cx = (min_x + max_x) * 0.5
            cy = (min_y + max_y) * 0.5
            for x, y in zip(xs, ys):
                r = math.hypot(x - 0.5, y - 0.5)
                if r > max_rad:
                    max_rad = r

            # Shift aim point along camera right/up vectors to center silhouette exactly at (0.5, 0.5)
            cam_mat = cam_o.matrix_world.to_3x3()
            cam_right = cam_mat @ Vector((1.0, 0.0, 0.0))
            cam_up = cam_mat @ Vector((0.0, 1.0, 0.0))
            vis_span = 2.0 * dist * (cam_d.sensor_width * 0.5 / cam_d.lens)
            aim += cam_right * ((cx - 0.5) * vis_span)
            aim += cam_up * ((cy - 0.5) * vis_span)

            # Scale distance so dominant span matches target_fill AND circular radius stays <= max_radius_cap
            cur_fill = max(span_x, span_y)
            scale_factor = cur_fill / target_fill
            if max_radius_cap > 0.0 and (max_rad / scale_factor) > max_radius_cap:
                scale_factor = max_rad / max_radius_cap
            dist *= scale_factor

        # Final measurement
        cam_o.location = aim + cam_dir * dist
        cam_o.rotation_euler = (aim - cam_o.location).to_track_quat("-Z", "Y").to_euler()
        bpy.context.view_layer.update()
        xs, ys = [], []
        for wp in world_verts:
            co_2d = world_to_camera_view(scene, cam_o, wp)
            xs.append(co_2d.x)
            ys.append(co_2d.y)
        max_rad = max(math.hypot(x - 0.5, y - 0.5) for x, y in zip(xs, ys))
        return {
            "dist": round(dist, 4),
            "span_x": round(max(xs) - min(xs), 4),
            "span_y": round(max(ys) - min(ys), 4),
            "center": [round((min(xs) + max(xs)) * 0.5, 4), round((min(ys) + max(ys)) * 0.5, 4)],
            "max_radius": round(max_rad, 4),
        }

    # Render all 3 tailored 1024x1024 masters:
    # 1. Hero App Icon (83% fill — balanced luxury framing for iOS squircle & 512/192)
    # 2. Android Adaptive Maskable Icon (max_radius <= 0.355 — cleanly inside W3C 0.40 = 80% safe circle!)
    # 3. Bold Favicon Master (90% fill — maximum silhouette impact at 32x32 and 16x16!)
    renders = [
        ("hero", work_dir / "icon_master_hero_1024.png", 1024, 0.84, 0.0),
        ("maskable", work_dir / "icon_master_maskable_1024.png", 1024, 0.67, 0.355),
        ("favicon", work_dir / "icon_master_favicon_1024.png", 512, 0.90, 0.0),
    ]

    for tag, out_path, res, fill, rad_cap in renders:
        scene.render.resolution_x = res
        scene.render.resolution_y = res
        fit = aim_and_fit_camera(fill, max_radius_cap=rad_cap)
        scene.render.filepath = str(out_path)
        tr = time.time()
        bpy.ops.render.render(write_still=True)
        dt = time.time() - tr
        fbytes = out_path.stat().st_size if out_path.exists() else 0
        log.append(f"RENDER_{tag.upper()}={json.dumps(fit)} RES={res} SECS={dt:.1f} BYTES={fbytes}")

    log.append(f"TOTAL_SECS={time.time() - t0:.1f}")
    log.append("STATUS=SUCCESS")

    log_text = "\n".join(log) + "\n"
    (work_dir / "blender_icons.log").write_text(log_text, encoding="utf-8")
    if sentinel_path:
        Path(sentinel_path).write_text(log_text, encoding="utf-8")


def main():
    args = parse_cli_args()
    work_dir = Path(args.work_dir)
    if args.package:
        package_icons(work_dir, contact_sheet_path=args.contact_sheet)
    else:
        try:
            run_blender_render(work_dir, args.sentinel)
        except Exception:
            err = "STATUS=ERROR\n" + traceback.format_exc()
            work_dir.mkdir(parents=True, exist_ok=True)
            (work_dir / "blender_icons.log").write_text(err, encoding="utf-8")
            if args.sentinel:
                Path(args.sentinel).write_text(err, encoding="utf-8")
            raise


if __name__ == "__main__":
    main()
