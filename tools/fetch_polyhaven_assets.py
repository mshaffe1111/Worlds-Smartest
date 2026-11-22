#!/usr/bin/env python3
"""
World's Smartest — Poly Haven CC0 AAA Asset Pipeline (Godot 4.7.2 + Blender 5.3.0)

Fetches, optimizes, packs, and verifies 100% CC0 studio-scanned Poly Haven assets:
  1. 5 x 1K HDRI Environment Maps -> godot/assets/polyhaven/hdris/<id>.hdr
  2. 6 x 1K Scanned PBR Texture Suites (Diffuse, nor_gl, arm) -> godot/assets/polyhaven/textures/<id>/
  3. 10 x Photogrammetry / Studio-Crafted 3D Models packed via Blender 5.3.0 into
     self-contained single-file GLBs with embedded JPEG textures -> godot/assets/polyhaven/models/<id>.glb
  4. Writes verified asset inventory + exact Godot Y-up bounding boxes to:
     godot/assets/polyhaven/manifest.json

Usage:
  python tools/fetch_polyhaven_assets.py [--force]

Internal Blender worker mode (invoked automatically):
  blender-launcher.exe --background --python tools/fetch_polyhaven_assets.py -- --blender-pack <job.json> <result.json>
"""

import argparse
import concurrent.futures
import hashlib
import io
import json
import math
import os
import shutil
import struct
import subprocess
import sys
import tempfile
import time
import traceback
import urllib.error
import urllib.request
from pathlib import Path

# ---------------------------------------------------------------------------
# Asset Manifest Definitions (All 100% CC0 from api.polyhaven.com)
# ---------------------------------------------------------------------------
USER_AGENT = "WorldsSmartestStudio/1.0"
API_BASE = "https://api.polyhaven.com"

HDRI_SPECS = [
    ("evening_museum_courtyard", "Geneva Alpine twilight blue-gold luxury reflections"),
    ("entrance_hall", "London grand domed rotunda reflections"),
    ("dresden_station_night", "Tokyo nocturnal rain-slick architectural lights"),
    ("blue_lagoon_night", "Reykjavik geothermal twilight reflections"),
    ("studio_small_09", "Warm dramatic Rembrandt spotlight studio reflections"),
]

TEXTURE_SPECS = [
    ("marble_01", "Veined luxury marble tabletop & trim"),
    ("granite_tile_02", "Honed dark architectural slate-granite floor"),
    ("black_walnut_veneer_01", "Luxury dark smoked walnut diplomatic table & wall paneling"),
    ("brown_leather", "Stitched diplomatic leather tabletop blotter & seating"),
    ("castle_wall_slates", "Brutalist dark Alpine slate monolith columns"),
    ("herringbone_parquet", "London Sovereign Rotunda classic gallery floor"),
]

MODEL_SPECS = [
    ("desk_lamp_arm_01", "Articulated brass executive desk lamp for interrogation table"),
    ("chess_set", "Sculpted chess pieces mid-gambit on the diplomatic table"),
    ("pocket_watch", "Julian Vance's sculpted brass pocket watch"),
    ("magnifying_glass_01", "Brass & optical glass magnifying lens"),
    ("book_encyclopedia_set_01", "Antique leather-bound reference books"),
    ("mid_century_lounge_chair", "Luxury diplomatic armchair across the table"),
    ("marble_bust_01", "Photogrammetry classical marble bust for London Rotunda"),
    ("Chandelier_01", "Ornate brass & crystal chandelier"),
    ("mantel_clock_01", "Antique luxury horological mantel clock"),
    ("brass_candleholders", "Brushed brass gallery accent candleholders"),
]

SCRIPT_PATH = Path(__file__).resolve()
PROJECT_ROOT = SCRIPT_PATH.parents[1]
POLYHAVEN_ROOT = PROJECT_ROOT / "godot" / "assets" / "polyhaven"
HDRI_DIR = POLYHAVEN_ROOT / "hdris"
TEXTURE_DIR = POLYHAVEN_ROOT / "textures"
MODEL_DIR = POLYHAVEN_ROOT / "models"
MANIFEST_PATH = POLYHAVEN_ROOT / "manifest.json"


# ---------------------------------------------------------------------------
# Blender 5.3.0 Worker Mode (--blender-pack <job.json> <result.json>)
# ---------------------------------------------------------------------------
def run_blender_pack_worker(job_json_path: Path, result_json_path: Path):
    import bpy
    from mathutils import Vector

    result = {
        "status": "RUNNING",
        "blender_version": bpy.app.version_string,
        "models": {},
        "errors": [],
    }
    try:
        job = json.loads(job_json_path.read_text(encoding="utf-8"))
        items = job["items"]

        # Inspect export_scene.gltf RNA properties once so we use exact Blender 5.3 kwargs
        export_props = {
            p.identifier: p
            for p in bpy.ops.export_scene.gltf.get_rna_type().properties
        }
        img_fmt_enum = []
        if "export_image_format" in export_props:
            img_fmt_enum = [e.identifier for e in export_props["export_image_format"].enum_items]
        result["gltf_export_image_formats"] = img_fmt_enum
        result["gltf_has_jpeg_quality"] = "export_jpeg_quality" in export_props
        result["gltf_has_image_quality"] = "export_image_quality" in export_props

        for item in items:
            asset_id = item["id"]
            gltf_in = Path(item["gltf_path"])
            glb_out = Path(item["glb_path"])
            jpeg_quality = int(item.get("jpeg_quality", 82))
            max_tex_dim = int(item.get("max_tex_dim", 0))

            bpy.ops.wm.read_factory_settings(use_empty=True)
            bpy.ops.import_scene.gltf(filepath=str(gltf_in))

            # Remove any accidental cameras or lights imported from source
            for obj in list(bpy.data.objects):
                if obj.type in ("CAMERA", "LIGHT"):
                    bpy.data.objects.remove(obj, do_unlink=True)

            # Ensure all images are loaded cleanly; optionally cap multi-tex prop sets
            per_image_cap = item.get("per_image_cap", {})
            loaded_images = []
            for img in bpy.data.images:
                if img.source != "FILE":
                    continue
                try:
                    if not img.has_data:
                        img.reload()
                    cap = max_tex_dim
                    for substr, subcap in per_image_cap.items():
                        if substr in img.name:
                            cap = int(subcap)
                            break
                    if cap > 0 and (img.size[0] > cap or img.size[1] > cap):
                        scale = min(cap / max(img.size[0], 1), cap / max(img.size[1], 1))
                        nw = max(64, int(round(img.size[0] * scale)))
                        nh = max(64, int(round(img.size[1] * scale)))
                        img.scale(nw, nh)
                    loaded_images.append({
                        "name": img.name,
                        "width": int(img.size[0]),
                        "height": int(img.size[1]),
                    })
                except Exception as exc:
                    result["errors"].append(f"{asset_id} image {img.name}: {exc}")

            # Collapse redundant JPEG-Alpha * constant -> BSDF.Alpha chains (e.g. mantel_clock_01_glass)
            # A JPEG has alpha === 1.0 everywhere, so Image.Alpha * c === c, avoiding a huge duplicate RGBA PNG!
            for mat in bpy.data.materials:
                if not mat.use_nodes or not mat.node_tree:
                    continue
                nt = mat.node_tree
                bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
                if not bsdf:
                    continue
                alpha_in = bsdf.inputs.get("Alpha")
                if not alpha_in or not alpha_in.is_linked:
                    continue
                link = alpha_in.links[0]
                src_node = link.from_node
                if src_node.type == "MATH" and src_node.operation == "MULTIPLY":
                    in0, in1 = src_node.inputs[0], src_node.inputs[1]
                    img_in = None
                    const_val = None
                    if in0.is_linked and not in1.is_linked:
                        img_in, const_val = in0.links[0], float(in1.default_value)
                    elif in1.is_linked and not in0.is_linked:
                        img_in, const_val = in1.links[0], float(in0.default_value)
                    if (
                        img_in is not None
                        and img_in.from_node.type == "TEX_IMAGE"
                        and img_in.from_socket.name == "Alpha"
                        and img_in.from_node.image is not None
                    ):
                        fp = (img_in.from_node.image.filepath or "").lower()
                        if fp.endswith(".jpg") or fp.endswith(".jpeg"):
                            nt.links.remove(link)
                            alpha_in.default_value = max(0.0, min(1.0, const_val))

            # Pack all external images into Blender memory so export is 100% self-contained
            try:
                bpy.ops.file.pack_all()
            except Exception:
                for img in bpy.data.images:
                    try:
                        if not img.packed_file and img.filepath:
                            img.pack()
                    except Exception:
                        pass

            # Compute exact evaluated world bounding box (converted from Blender Z-up -> Godot Y-up)
            deps = bpy.context.evaluated_depsgraph_get()
            min_x = min_y = min_z = float("inf")
            max_x = max_y = max_z = float("-inf")
            mesh_count = 0
            tri_count = 0
            vert_count = 0
            node_names = []
            mat_names = sorted({m.name for m in bpy.data.materials if m.users > 0})

            for obj in bpy.context.scene.objects:
                if obj.parent is None:
                    node_names.append(obj.name)
                if obj.type != "MESH":
                    continue
                mesh_count += 1
                ev = obj.evaluated_get(deps)
                me = ev.to_mesh()
                me.calc_loop_triangles()
                tri_count += len(me.loop_triangles)
                vert_count += len(me.vertices)
                mw = obj.matrix_world
                for v in me.vertices:
                    w = mw @ v.co
                    # Blender (X, Y, Z) -> glTF/Godot Y-up (X, Z, -Y)
                    gx = float(w.x)
                    gy = float(w.z)
                    gz = float(-w.y)
                    if gx < min_x: min_x = gx
                    if gx > max_x: max_x = gx
                    if gy < min_y: min_y = gy
                    if gy > max_y: max_y = gy
                    if gz < min_z: min_z = gz
                    if gz > max_z: max_z = gz
                ev.to_mesh_clear()

            glb_out.parent.mkdir(parents=True, exist_ok=True)
            export_kwargs = {
                "filepath": str(glb_out),
                "export_format": "GLB",
                "export_yup": True,
                "export_apply": True,
                "export_normals": True,
                "export_texcoords": True,
                "export_materials": "EXPORT",
                "export_cameras": False,
                "export_lights": False,
                "export_animations": False,
            }
            if "export_tangents" in export_props:
                export_kwargs["export_tangents"] = False
            if "export_image_format" in export_props:
                if "JPEG" in img_fmt_enum:
                    export_kwargs["export_image_format"] = "JPEG"
                elif "AUTO" in img_fmt_enum:
                    export_kwargs["export_image_format"] = "AUTO"
            if "export_jpeg_quality" in export_props:
                export_kwargs["export_jpeg_quality"] = jpeg_quality
            elif "export_image_quality" in export_props:
                export_kwargs["export_image_quality"] = jpeg_quality

            bpy.ops.export_scene.gltf(**export_kwargs)

            width_x = round(max_x - min_x, 4) if math.isfinite(min_x) else 0.0
            height_y = round(max_y - min_y, 4) if math.isfinite(min_y) else 0.0
            depth_z = round(max_z - min_z, 4) if math.isfinite(min_z) else 0.0

            result["models"][asset_id] = {
                "glb_path": str(glb_out),
                "file_bytes": glb_out.stat().st_size if glb_out.exists() else 0,
                "mesh_objects": mesh_count,
                "triangles": tri_count,
                "vertices": vert_count,
                "top_nodes": node_names,
                "materials": mat_names,
                "source_images": loaded_images,
                "bounds_yup_m": {
                    "min": [round(min_x, 4), round(min_y, 4), round(min_z, 4)],
                    "max": [round(max_x, 4), round(max_y, 4), round(max_z, 4)],
                    "size_whd": [width_x, height_y, depth_z],
                    "center": [
                        round((min_x + max_x) * 0.5, 4),
                        round((min_y + max_y) * 0.5, 4),
                        round((min_z + max_z) * 0.5, 4),
                    ],
                    "surface_place_y_offset": round(-min_y, 4),
                    "ceiling_hang_y_offset": round(-max_y, 4),
                },
            }

            # Write intermediate heartbeat so launcher sees live progress
            result_json_path.write_text(json.dumps(result, indent=2), encoding="utf-8")

        result["status"] = "SUCCESS"
    except Exception:
        result["status"] = "ERROR"
        result["traceback"] = traceback.format_exc()
    finally:
        result_json_path.write_text(json.dumps(result, indent=2), encoding="utf-8")


# ---------------------------------------------------------------------------
# HTTP & Verification Utilities (Standard Python Mode)
# ---------------------------------------------------------------------------
def http_get_json(url: str, retries: int = 3) -> dict:
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as exc:
            last_err = exc
            if attempt < retries:
                time.sleep(1.0 * attempt)
    raise RuntimeError(f"GET JSON failed for {url}: {last_err}")


def download_file(url: str, dest: Path, expected_md5: str | None = None, retries: int = 3) -> int:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = dest.with_suffix(dest.suffix + ".part")
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            hasher = hashlib.md5()
            total = 0
            with urllib.request.urlopen(req, timeout=60) as resp, open(tmp_path, "wb") as out:
                while True:
                    chunk = resp.read(65536)
                    if not chunk:
                        break
                    out.write(chunk)
                    hasher.update(chunk)
                    total += len(chunk)
            if total == 0:
                raise RuntimeError(f"Empty download from {url}")
            if expected_md5 and hasher.hexdigest().lower() != expected_md5.lower():
                raise RuntimeError(
                    f"MD5 mismatch for {dest.name}: got {hasher.hexdigest()}, expected {expected_md5}"
                )
            tmp_path.replace(dest)
            return total
        except Exception as exc:
            last_err = exc
            if tmp_path.exists():
                try:
                    tmp_path.unlink()
                except OSError:
                    pass
            if attempt < retries:
                time.sleep(1.5 * attempt)
    raise RuntimeError(f"Download failed for {url} -> {dest}: {last_err}")


def verify_hdr_file(path: Path) -> dict:
    assert path.exists(), f"Missing HDR: {path}"
    size = path.stat().st_size
    assert size > 100_000, f"Suspiciously small HDR ({size} B): {path}"
    with open(path, "rb") as f:
        header = f.read(512)
    assert header.startswith(b"#?RADIANCE") or header.startswith(b"#?RGBE"), (
        f"Invalid HDR magic in {path}: {header[:32]!r}"
    )
    text = header.decode("latin1", errors="ignore")
    dims = None
    for line in text.splitlines():
        if line.startswith("-Y ") or line.startswith("+Y "):
            parts = line.split()
            if len(parts) >= 4:
                dims = [int(parts[3]), int(parts[1])]
                break
    return {"file_bytes": size, "resolution": dims}


def verify_jpeg_file(path: Path) -> dict:
    assert path.exists(), f"Missing JPEG: {path}"
    data = path.read_bytes()
    assert len(data) > 2048, f"Suspiciously small JPEG ({len(data)} B): {path}"
    assert data[:2] == b"\xff\xd8", f"Invalid JPEG SOI in {path}"
    # Parse SOF marker for width/height without external deps
    width = height = None
    i = 2
    n = len(data)
    while i + 4 < n:
        if data[i] != 0xFF:
            i += 1
            continue
        while i < n and data[i] == 0xFF:
            i += 1
        if i >= n:
            break
        marker = data[i]
        i += 1
        if marker in (0xD8, 0xD9, 0x01) or (0xD0 <= marker <= 0xD7):
            continue
        if i + 2 > n:
            break
        seg_len = struct.unpack_from(">H", data, i)[0]
        if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            if i + 7 <= n:
                height, width = struct.unpack_from(">HH", data, i + 3)
            break
        i += seg_len
    assert width and height, f"Could not parse JPEG dimensions for {path}"
    return {"file_bytes": len(data), "resolution": [width, height]}


def verify_glb_binary(path: Path) -> dict:
    assert path.exists(), f"Missing GLB: {path}"
    data = path.read_bytes()
    assert len(data) > 1024, f"Suspiciously small GLB ({len(data)} B): {path}"
    magic, version, total_len = struct.unpack_from("<4sII", data, 0)
    assert magic == b"glTF", f"Bad GLB magic in {path}: {magic!r}"
    assert version == 2, f"Bad glTF version in {path}: {version}"
    assert total_len == len(data), f"GLB length mismatch in {path}: header={total_len} actual={len(data)}"

    chunk_len, chunk_type = struct.unpack_from("<I4s", data, 12)
    assert chunk_type == b"JSON", f"Expected JSON chunk first in {path}"
    gltf = json.loads(data[20:20 + chunk_len].decode("utf-8"))

    # Verify ZERO external URI references in buffers or images
    external_uris = []
    for buf in gltf.get("buffers", []):
        if "uri" in buf:
            external_uris.append(buf["uri"])
    images = gltf.get("images", [])
    mime_counts = {}
    image_bytes = 0
    buffer_views = gltf.get("bufferViews", [])
    for img in images:
        if "uri" in img:
            external_uris.append(img["uri"])
        mt = img.get("mimeType", "unknown")
        mime_counts[mt] = mime_counts.get(mt, 0) + 1
        bv_idx = img.get("bufferView")
        if bv_idx is not None and bv_idx < len(buffer_views):
            image_bytes += buffer_views[bv_idx].get("byteLength", 0)
    assert not external_uris, f"GLB {path.name} has external URIs (not self-contained!): {external_uris}"

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
        "glb_meshes": len(gltf.get("meshes", [])),
        "glb_materials": len(gltf.get("materials", [])),
        "glb_triangles": tri_count,
        "embedded_images": len(images),
        "image_mime_types": mime_counts,
        "embedded_image_bytes": image_bytes,
        "external_uris": 0,
    }


def sanitize_glb_jpegs(path: Path, quality: int = 88) -> dict:
    """
    Re-encode embedded image/jpeg buffers that carry Blender 5.3.0's APP1 'NeoGeo'
    or 'ICC_PROFILE' markers into clean baseline JFIF JPEGs via Pillow, rebuilding
    the GLB JSON + 4-byte-aligned BIN chunk so Godot 4.7.2 libjpeg_turbo loads
    every embedded texture with ZERO ERR_PARSE_ERROR 43!
    """
    from PIL import Image

    data = path.read_bytes()
    magic, version, total_len = struct.unpack_from("<4sII", data, 0)
    assert magic == b"glTF" and version == 2 and total_len == len(data), f"Invalid GLB: {path}"

    json_len, json_type = struct.unpack_from("<I4s", data, 12)
    assert json_type == b"JSON", f"Missing JSON chunk in {path}"
    gltf = json.loads(data[20:20 + json_len].decode("utf-8"))

    bin_hdr_off = 20 + json_len
    bin_len, bin_type = struct.unpack_from("<I4s", data, bin_hdr_off)
    assert bin_type == b"BIN\x00", f"Missing BIN chunk in {path}"
    old_bin = data[bin_hdr_off + 8: bin_hdr_off + 8 + bin_len]

    bvs = gltf.get("bufferViews", [])
    images = gltf.get("images", [])

    # Ensure no accessor shares a bufferView with any image
    accessor_bvs = {
        acc["bufferView"]
        for acc in gltf.get("accessors", [])
        if "bufferView" in acc
    }
    for acc in gltf.get("accessors", []):
        sparse = acc.get("sparse")
        if sparse:
            if "indices" in sparse and "bufferView" in sparse["indices"]:
                accessor_bvs.add(sparse["indices"]["bufferView"])
            if "values" in sparse and "bufferView" in sparse["values"]:
                accessor_bvs.add(sparse["values"]["bufferView"])

    jpeg_bv_indices = set()
    for im in images:
        if im.get("mimeType") == "image/jpeg" and "bufferView" in im:
            bv_idx = im["bufferView"]
            assert bv_idx not in accessor_bvs, f"Image bufferView {bv_idx} shared with accessor in {path.name}"
            jpeg_bv_indices.add(bv_idx)

    # Identify JPEG bufferViews with NeoGeo / ICC_PROFILE / Exif markers
    replacements: dict[int, bytes] = {}
    for bv_idx in sorted(jpeg_bv_indices):
        bv = bvs[bv_idx]
        off = bv.get("byteOffset", 0)
        raw = old_bin[off: off + bv["byteLength"]]
        if b"NeoGeo" in raw[:4096] or b"ICC_PROFILE" in raw[:65536]:
            im_obj = Image.open(io.BytesIO(raw)).convert("RGB")
            out_buf = io.BytesIO()
            im_obj.save(out_buf, format="JPEG", quality=quality, optimize=True)
            clean_jpg = out_buf.getvalue()
            assert b"NeoGeo" not in clean_jpg[:4096] and b"ICC_PROFILE" not in clean_jpg[:65536]
            replacements[bv_idx] = clean_jpg

    if not replacements:
        return {"rewritten": False, "sanitized_images": 0, "file_bytes": len(data)}

    # Rebuild 4-byte-aligned BIN chunk cleanly
    new_bin = bytearray()
    new_bvs = []
    for bv_idx, bv in enumerate(bvs):
        pad = (-len(new_bin)) % 4
        if pad:
            new_bin.extend(b"\x00" * pad)
        new_off = len(new_bin)
        if bv_idx in replacements:
            payload = replacements[bv_idx]
        else:
            old_off = bv.get("byteOffset", 0)
            payload = old_bin[old_off: old_off + bv["byteLength"]]
        new_bin.extend(payload)
        updated_bv = dict(bv)
        updated_bv["byteOffset"] = new_off
        updated_bv["byteLength"] = len(payload)
        new_bvs.append(updated_bv)

    bin_pad = (-len(new_bin)) % 4
    if bin_pad:
        new_bin.extend(b"\x00" * bin_pad)

    gltf["bufferViews"] = new_bvs
    assert len(gltf.get("buffers", [])) == 1, f"Expected single GLB buffer in {path.name}"
    gltf["buffers"][0]["byteLength"] = len(new_bin)

    json_bytes = json.dumps(gltf, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    json_pad = (-len(json_bytes)) % 4
    if json_pad:
        json_bytes += b" " * json_pad

    out_total = 12 + 8 + len(json_bytes) + 8 + len(new_bin)
    out_data = bytearray()
    out_data.extend(struct.pack("<4sII", b"glTF", 2, out_total))
    out_data.extend(struct.pack("<I4s", len(json_bytes), b"JSON"))
    out_data.extend(json_bytes)
    out_data.extend(struct.pack("<I4s", len(new_bin), b"BIN\x00"))
    out_data.extend(new_bin)

    tmp_path = path.with_suffix(".glb.tmp")
    tmp_path.write_bytes(out_data)
    tmp_path.replace(path)
    return {
        "rewritten": True,
        "sanitized_images": len(replacements),
        "old_bytes": len(data),
        "file_bytes": len(out_data),
    }


def find_blender_executable() -> str:
    local_app_data = os.environ.get("LOCALAPPDATA", "")
    candidates = [
        os.path.join(local_app_data, "Microsoft", "WindowsApps", "blender-launcher.exe"),
        os.path.join(local_app_data, "Microsoft", "WindowsApps", "blender.exe"),
        shutil.which("blender-launcher.exe") or "",
        shutil.which("blender.exe") or "",
        shutil.which("blender") or "",
    ]
    for c in candidates:
        if c and os.path.exists(c):
            return c
    raise FileNotFoundError(
        "Blender 5.3.0 executable not found (checked %LOCALAPPDATA%\\Microsoft\\WindowsApps\\blender-launcher.exe and PATH)"
    )


# ---------------------------------------------------------------------------
# Fetchers
# ---------------------------------------------------------------------------
def fetch_hdri(asset_id: str, desc: str, force: bool) -> dict:
    dest = HDRI_DIR / f"{asset_id}.hdr"
    if not force and dest.exists():
        try:
            v = verify_hdr_file(dest)
            print(f"  [HDRI cached] {asset_id}.hdr ({v['file_bytes'] / 1e6:.2f} MB)")
            return {
                "id": asset_id,
                "description": desc,
                "godot_path": f"res://assets/polyhaven/hdris/{asset_id}.hdr",
                "disk_path": str(dest.relative_to(PROJECT_ROOT)).replace("\\", "/"),
                "resolution_tier": "1k",
                **v,
            }
        except AssertionError:
            pass

    files_meta = http_get_json(f"{API_BASE}/files/{asset_id}")
    hdri_meta = files_meta.get("hdri", {})
    tier = "1k" if "1k" in hdri_meta and "hdr" in hdri_meta["1k"] else "2k"
    entry = hdri_meta[tier]["hdr"]
    download_file(entry["url"], dest, expected_md5=entry.get("md5"))
    v = verify_hdr_file(dest)
    print(f"  [HDRI OK] {asset_id}.hdr ({tier}, {v['file_bytes'] / 1e6:.2f} MB, res={v['resolution']})")
    return {
        "id": asset_id,
        "description": desc,
        "godot_path": f"res://assets/polyhaven/hdris/{asset_id}.hdr",
        "disk_path": str(dest.relative_to(PROJECT_ROOT)).replace("\\", "/"),
        "resolution_tier": tier,
        **v,
    }


def fetch_texture_suite(asset_id: str, desc: str, force: bool) -> dict:
    out_dir = TEXTURE_DIR / asset_id
    out_dir.mkdir(parents=True, exist_ok=True)
    channels = [
        ("Diffuse", "diffuse.jpg"),
        ("nor_gl", "nor_gl.jpg"),
        ("arm", "arm.jpg"),
    ]

    all_cached = all((out_dir / fname).exists() for _, fname in channels) and not force
    files_meta = None
    channel_info = {}

    for api_key, fname in channels:
        dest = out_dir / fname
        need_dl = force or not dest.exists()
        if not need_dl:
            try:
                v = verify_jpeg_file(dest)
                channel_info[fname] = {
                    "godot_path": f"res://assets/polyhaven/textures/{asset_id}/{fname}",
                    **v,
                }
                continue
            except AssertionError:
                need_dl = True

        if files_meta is None:
            files_meta = http_get_json(f"{API_BASE}/files/{asset_id}")
        tier_dict = files_meta[api_key]["1k"]
        fmt = "jpg" if "jpg" in tier_dict else "png"
        entry = tier_dict[fmt]
        download_file(entry["url"], dest, expected_md5=entry.get("md5"))
        v = verify_jpeg_file(dest)
        channel_info[fname] = {
            "godot_path": f"res://assets/polyhaven/textures/{asset_id}/{fname}",
            **v,
        }

    total_bytes = sum(c["file_bytes"] for c in channel_info.values())
    tag = "TEX cached" if all_cached else "TEX OK"
    print(f"  [{tag}] {asset_id}/ (diffuse+nor_gl+arm, {total_bytes / 1e6:.2f} MB total)")
    return {
        "id": asset_id,
        "description": desc,
        "godot_dir": f"res://assets/polyhaven/textures/{asset_id}",
        "total_bytes": total_bytes,
        "maps": channel_info,
    }


def stage_model_gltf(asset_id: str, staging_root: Path) -> Path:
    files_meta = http_get_json(f"{API_BASE}/files/{asset_id}")
    gltf_entry = files_meta["gltf"]["1k"]["gltf"]
    model_stage = staging_root / asset_id
    model_stage.mkdir(parents=True, exist_ok=True)

    main_url = gltf_entry["url"]
    main_name = Path(urllib.request.urlparse(main_url).path).name
    main_dest = model_stage / main_name
    download_file(main_url, main_dest, expected_md5=gltf_entry.get("md5"))

    includes = gltf_entry.get("include", {})
    for rel_path, inc_info in includes.items():
        # Preserve exact relative path (e.g. textures/foo_1k.jpg, foo.bin)
        rel_clean = rel_path.replace("\\", "/").lstrip("/")
        inc_dest = model_stage / rel_clean
        download_file(inc_info["url"], inc_dest, expected_md5=inc_info.get("md5"))

    print(f"  [GLTF staged] {asset_id} ({1 + len(includes)} files)")
    return main_dest


# ---------------------------------------------------------------------------
# Main Pipeline Orchestrator
# ---------------------------------------------------------------------------
def run_main_pipeline(force: bool = False):
    HDRI_DIR.mkdir(parents=True, exist_ok=True)
    TEXTURE_DIR.mkdir(parents=True, exist_ok=True)
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    t0 = time.time()
    print("=== [1/4] Fetching 5 Poly Haven 1K HDRI Environment Maps ===")
    hdris = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futs = [pool.submit(fetch_hdri, aid, desc, force) for aid, desc in HDRI_SPECS]
        for fut in futs:
            hdris.append(fut.result())

    print("\n=== [2/4] Fetching 6 Poly Haven 1K Scanned PBR Texture Suites ===")
    textures = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        futs = [pool.submit(fetch_texture_suite, aid, desc, force) for aid, desc in TEXTURE_SPECS]
        for fut in futs:
            textures.append(fut.result())

    print("\n=== [3/4] Staging 10 Poly Haven 1K glTF Models & Packing to Self-Contained GLB via Blender 5.3.0 ===")
    with tempfile.TemporaryDirectory(prefix="polyhaven_pack_") as tmp_str:
        tmp_root = Path(tmp_str)
        staging_root = tmp_root / "gltf_staging"
        staging_root.mkdir(parents=True, exist_ok=True)

        # Stage all 10 glTF + include trees in parallel
        staged_map = {}
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            fut_to_id = {
                pool.submit(stage_model_gltf, aid, staging_root): aid
                for aid, _ in MODEL_SPECS
            }
            for fut in concurrent.futures.as_completed(fut_to_id):
                aid = fut_to_id[fut]
                staged_map[aid] = fut.result()

        # Prepare batch Blender job
        # Keep crisp 1k hero textures; cap only dense multi-texture piece sets to 512px so every GLB stays ~0.35-3.3 MB!
        job_items = []
        for aid, _ in MODEL_SPECS:
            is_multi_tex = aid in ("chess_set", "brass_candleholders")
            per_image_cap = {}
            if aid == "chess_set":
                # Keep chess_set_board_* at full 1024px; scale tiny chess piece maps to 512px!
                per_image_cap = {"pieces_white": 512, "pieces_black": 512}
            job_items.append({
                "id": aid,
                "gltf_path": str(staged_map[aid]),
                "glb_path": str(MODEL_DIR / f"{aid}.glb"),
                "jpeg_quality": 78 if is_multi_tex else 84,
                "max_tex_dim": 512 if aid == "brass_candleholders" else 1024,
                "per_image_cap": per_image_cap,
            })

        job_file = tmp_root / "blender_pack_job.json"
        result_file = tmp_root / "blender_pack_result.json"
        job_file.write_text(json.dumps({"items": job_items}, indent=2), encoding="utf-8")

        blender_exe = find_blender_executable()
        cmd = [
            blender_exe,
            "--background",
            "--python",
            str(SCRIPT_PATH),
            "--",
            "--blender-pack",
            str(job_file),
            str(result_file),
        ]
        print(f"  Launching Blender 5.3.0 batch packer: {blender_exe}")
        subprocess.Popen(cmd)

        # MSIX blender-launcher.exe returns asynchronously — poll sentinel result_file!
        deadline = time.time() + 240.0
        last_done = 0
        blender_res = None
        while time.time() < deadline:
            if result_file.exists():
                try:
                    raw = result_file.read_text(encoding="utf-8")
                    if raw.strip():
                        data = json.loads(raw)
                        done_now = len(data.get("models", {}))
                        if done_now > last_done:
                            last_done = done_now
                            print(f"  [Blender progress] packed {done_now}/{len(job_items)} GLBs...")
                        if data.get("status") in ("SUCCESS", "ERROR"):
                            blender_res = data
                            break
                except (json.JSONDecodeError, OSError):
                    pass
            time.sleep(1.0)

        if blender_res is None:
            raise TimeoutError(f"Blender packer did not finish within 240s (sentinel: {result_file})")
        if blender_res.get("status") != "SUCCESS":
            raise RuntimeError(
                f"Blender packer failed:\n{blender_res.get('traceback', json.dumps(blender_res, indent=2))}"
            )
        print(
            f"  [Blender OK] {blender_res.get('blender_version')} "
            f"(formats={blender_res.get('gltf_export_image_formats')}, "
            f"jpeg_quality_prop={blender_res.get('gltf_has_jpeg_quality')})"
        )

    print("\n=== [4/4] Godot 4.7.2 JPEG Sanitization, Binary Verification & Manifest Generation ===")
    models_manifest = []
    desc_lookup = dict(MODEL_SPECS)
    for aid, desc in MODEL_SPECS:
        glb_path = MODEL_DIR / f"{aid}.glb"
        san = sanitize_glb_jpegs(glb_path, quality=88)
        bin_info = verify_glb_binary(glb_path)
        b_info = blender_res["models"][aid]
        bounds = b_info["bounds_yup_m"]
        w, h, d = bounds["size_whd"]
        san_note = f" sanitized={san['sanitized_images']}" if san["rewritten"] else " clean"
        print(
            f"  [GLB VERIFIED] {aid}.glb: {bin_info['file_bytes'] / 1e6:.2f} MB{san_note} | "
            f"tris={bin_info['glb_triangles']:,} | imgs={bin_info['embedded_images']} {bin_info['image_mime_types']} | "
            f"W×H×D={w:.3f}×{h:.3f}×{d:.3f}m | minY={bounds['min'][1]:.4f} maxY={bounds['max'][1]:.4f}"
        )
        models_manifest.append({
            "id": aid,
            "description": desc_lookup[aid],
            "godot_path": f"res://assets/polyhaven/models/{aid}.glb",
            "disk_path": str(glb_path.relative_to(PROJECT_ROOT)).replace("\\", "/"),
            "blender_stats": {
                "mesh_objects": b_info["mesh_objects"],
                "evaluated_triangles": b_info["triangles"],
                "top_nodes": b_info["top_nodes"],
                "materials": b_info["materials"],
            },
            "glb_verified": bin_info,
            "bounds_yup_m": bounds,
        })

    total_hdri_bytes = sum(h["file_bytes"] for h in hdris)
    total_tex_bytes = sum(t["total_bytes"] for t in textures)
    total_glb_bytes = sum(m["glb_verified"]["file_bytes"] for m in models_manifest)

    manifest = {
        "schema_version": "1.0.0",
        "license": "CC0 1.0 Universal (Poly Haven)",
        "blender_version": blender_res.get("blender_version"),
        "summary": {
            "hdri_count": len(hdris),
            "hdri_total_bytes": total_hdri_bytes,
            "texture_suite_count": len(textures),
            "texture_file_count": len(textures) * 3,
            "texture_total_bytes": total_tex_bytes,
            "model_count": len(models_manifest),
            "model_total_bytes": total_glb_bytes,
            "grand_total_bytes": total_hdri_bytes + total_tex_bytes + total_glb_bytes,
        },
        "hdris": hdris,
        "textures": textures,
        "models": models_manifest,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    elapsed = time.time() - t0
    print(
        f"\nALL POLY HAVEN ASSETS VERIFIED IN {elapsed:.1f}s!\n"
        f"  HDRIs (5):    {total_hdri_bytes / 1e6:.2f} MB\n"
        f"  Textures (6): {total_tex_bytes / 1e6:.2f} MB\n"
        f"  Models (10):  {total_glb_bytes / 1e6:.2f} MB\n"
        f"  TOTAL:        {(total_hdri_bytes + total_tex_bytes + total_glb_bytes) / 1e6:.2f} MB\n"
        f"  Manifest:     {MANIFEST_PATH}"
    )


def run_sanitize_only():
    print("=== Sanitizing Embedded JPEGs in All Poly Haven GLBs for Godot 4.7.2 libjpeg_turbo ===")
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8")) if MANIFEST_PATH.exists() else None
    models_by_id = {m["id"]: m for m in manifest["models"]} if manifest else {}
    total_sanitized = 0

    for aid, _ in MODEL_SPECS:
        glb_path = MODEL_DIR / f"{aid}.glb"
        san = sanitize_glb_jpegs(glb_path, quality=88)
        bin_info = verify_glb_binary(glb_path)
        total_sanitized += san["sanitized_images"]
        status = (
            f"REWRITTEN ({san['sanitized_images']} imgs, {san['old_bytes']/1e6:.2f} -> {san['file_bytes']/1e6:.2f} MB)"
            if san["rewritten"]
            else f"ALREADY CLEAN ({bin_info['file_bytes']/1e6:.2f} MB)"
        )
        print(f"  [{aid}.glb] {status} | tris={bin_info['glb_triangles']:,} | imgs={bin_info['image_mime_types']}")
        if aid in models_by_id:
            models_by_id[aid]["glb_verified"] = bin_info

    if manifest:
        total_glb_bytes = sum(m["glb_verified"]["file_bytes"] for m in manifest["models"])
        manifest["summary"]["model_total_bytes"] = total_glb_bytes
        manifest["summary"]["grand_total_bytes"] = (
            manifest["summary"]["hdri_total_bytes"]
            + manifest["summary"]["texture_total_bytes"]
            + total_glb_bytes
        )
        MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
        print(f"Updated manifest: {MANIFEST_PATH} (models={total_glb_bytes/1e6:.2f} MB, sanitized={total_sanitized} JPEGs)")


def main():
    if "--blender-pack" in sys.argv:
        idx = sys.argv.index("--blender-pack")
        job_path = Path(sys.argv[idx + 1])
        res_path = Path(sys.argv[idx + 2])
        run_blender_pack_worker(job_path, res_path)
        return

    parser = argparse.ArgumentParser(description="Fetch & pack CC0 Poly Haven assets for Godot 4.7.2")
    parser.add_argument("--force", action="store_true", help="Re-download and re-pack all assets")
    parser.add_argument(
        "--sanitize-only",
        action="store_true",
        help="Sanitize embedded JPEGs in existing GLBs in-place for Godot 4.7.2 libjpeg_turbo",
    )
    args = parser.parse_args()
    if args.sanitize_only:
        run_sanitize_only()
    else:
        run_main_pipeline(force=args.force)


if __name__ == "__main__":
    main()
