#!/usr/bin/env python3
"""
World's Smartest v6.0 — Ultra-HD 3D Shaded-Relief Earth Texture Baker
=====================================================================
Downloads public-domain (CC0) Natural Earth 1:50m cartographic shaded-relief
& bathymetry rasters (10,800 x 5,400 px GeoTIFFs from official NACIS CDN),
caches them in the OS temp folder (never bloating git), and bakes three
museum-grade, offline-ready equirectangular WebP textures into:

  public/assets/textures/v6/earth_relief_albedo_4k.webp     (4096 x 2048 RGB)
  public/assets/textures/v6/earth_elevation_bump_2k.webp    (2048 x 1024 L)
  public/assets/textures/v6/earth_ocean_specular_2k.webp    (2048 x 1024 L)

Usage:
  python scripts/v6_bake_relief_earth.py
"""

from __future__ import annotations

import argparse
import os
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from scipy import ndimage

Image.MAX_IMAGE_PIXELS = None

NATURAL_EARTH_SOURCES = {
    "ne2": (
        "https://naciscdn.org/naturalearth/50m/raster/NE2_50M_SR_W.zip",
        "NE2_50M_SR_W.tif",
    ),
    "hyp": (
        "https://naciscdn.org/naturalearth/50m/raster/HYP_50M_SR_W.zip",
        "HYP_50M_SR_W.tif",
    ),
    "gray_ob": (
        "https://naciscdn.org/naturalearth/50m/raster/GRAY_50M_SR_OB.zip",
        "GRAY_50M_SR_OB.tif",
    ),
    "sr_land": (
        "https://naciscdn.org/naturalearth/50m/raster/SR_50M.zip",
        "SR_50M.tif",
    ),
}

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "public" / "assets" / "textures" / "v6"
CACHE_DIR = Path(tempfile.gettempdir()) / "worlds_smartest_v6_ne_cache"


def download_with_cache(key: str, url: str, target_tif: str) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    tif_path = CACHE_DIR / target_tif
    if tif_path.exists() and tif_path.stat().st_size > 1_000_000:
        print(f"[cache] Reusing {tif_path.name} ({tif_path.stat().st_size / 1e6:.1f} MB)")
        return tif_path

    zip_path = CACHE_DIR / f"{key}.zip"
    if not zip_path.exists() or zip_path.stat().st_size < 1_000_000:
        print(f"[download] Fetching {url} ...")
        req = urllib.request.Request(
            url, headers={"User-Agent": "WorldsSmartestV6AtlasBaker/1.0"}
        )
        with urllib.request.urlopen(req, timeout=180) as resp, open(
            zip_path, "wb"
        ) as out_f:
            total = int(resp.headers.get("Content-Length") or 0)
            read_bytes = 0
            while True:
                chunk = resp.read(1024 * 256)
                if not chunk:
                    break
                out_f.write(chunk)
                read_bytes += len(chunk)
        print(f"[download] Saved {zip_path.name} ({read_bytes / 1e6:.1f} MB)")

    with zipfile.ZipFile(zip_path, "r") as zf:
        matches = [n for n in zf.namelist() if n.lower().endswith(".tif")]
        if not matches:
            raise RuntimeError(f"No .tif found inside {zip_path}")
        member = matches[0]
        print(f"[extract] Extracting {member} -> {tif_path.name} ...")
        with zf.open(member) as src, open(tif_path, "wb") as dst:
            while True:
                buf = src.read(1024 * 512)
                if not buf:
                    break
                dst.write(buf)
    return tif_path


def load_resized(path: Path, size: tuple[int, int], mode: str = "RGB") -> np.ndarray:
    with Image.open(path) as img:
        if img.mode != mode:
            img = img.convert(mode)
        resized = img.resize(size, Image.Resampling.LANCZOS)
        return np.asarray(resized, dtype=np.float32)


def extract_ocean_mask(
    sr_land_4k: np.ndarray, ne2_4k: np.ndarray, hyp_4k: np.ndarray
) -> np.ndarray:
    """
    Returns float32 mask in [0.0, 1.0] where 1.0 = Ocean/Water and 0.0 = Land.
    Uses SR_50M (where water is exact flat white/near-white) combined with
    Natural Earth II blue-channel chromaticity to capture inland seas cleanly
    while keeping Greenland/Antarctica snowcaps strictly LAND.
    """
    # In SR_50M, oceans have value >= 253 AND near-zero local variance.
    r = ne2_4k[:, :, 0]
    g = ne2_4k[:, :, 1]
    b = ne2_4k[:, :, 2]

    # Blue dominance strongly distinguishes water from snow/ice (which is neutral white)
    blue_excess = b - np.maximum(r, g * 0.96)
    chroma_water = (blue_excess > 7.5) & (b > 115.0) & (r < 220.0)

    # Also check HYP water signature (clean blue-cyan water vs warm/neutral land)
    hr = hyp_4k[:, :, 0]
    hg = hyp_4k[:, :, 1]
    hb = hyp_4k[:, :, 2]
    hyp_water = ((hb - hr) > 14.0) & (hb > 115.0) & (hr < 215.0)

    # SR_50M flat bright water background check (excluding polar neutral ice)
    sr_flat = (sr_land_4k >= 252.5) & (
        ndimage.uniform_filter(np.abs(sr_land_4k - 255.0), size=3) < 1.5
    )

    # Combine: definite water if chromatic water OR (sr_flat AND slight blue tint)
    raw_water = (chroma_water & hyp_water) | (sr_flat & ((b - r) > 3.0))

    # Protect polar ice sheets (Antarctica lat < -62 deg & Greenland ice interior)
    # Neutral bright white/ice pixels are LAND unless strongly blue ocean
    h = sr_land_4k.shape[0]
    lat_deg = 90.0 - (np.arange(h, dtype=np.float32) + 0.5) * (180.0 / h)
    polar_south = (lat_deg < -62.0)[:, None]
    bright_ice = (r > 195.0) & (g > 200.0) & (b > 205.0) & ((b - r) < 28.0)
    raw_water = raw_water & ~(polar_south & bright_ice)
    # Also exclude bright Greenland interior ice speckles
    polar_north = (lat_deg > 58.0)[:, None]
    raw_water = raw_water & ~(polar_north & (r > 218.0) & (g > 220.0) & ((b - r) < 22.0))

    # Clean tiny single-pixel speckle on coastlines without blurring islands
    raw_water = ndimage.binary_closing(raw_water, iterations=1)
    raw_water = ndimage.binary_opening(raw_water, iterations=1)
    # Feather coastline by 0.65px for silky anti-aliased blending at 4K
    water_mask = ndimage.gaussian_filter(raw_water.astype(np.float32), sigma=0.65)
    return np.clip(water_mask, 0.0, 1.0)


def bake_from_natural_earth(out_dir: Path) -> None:
    paths = {}
    for key, (url, tif_name) in NATURAL_EARTH_SOURCES.items():
        paths[key] = download_with_cache(key, url, tif_name)

    size_4k = (4096, 2048)
    size_2k = (2048, 1024)

    print("[bake] Loading & Lanczos-downsampling 10,800x5,400 rasters to 4K ...")
    ne2_4k = load_resized(paths["ne2"], size_4k, "RGB")
    hyp_4k = load_resized(paths["hyp"], size_4k, "RGB")
    gray_ob_4k = load_resized(paths["gray_ob"], size_4k, "L")
    sr_land_4k = load_resized(paths["sr_land"], size_4k, "L")

    print("[bake] Computing pixel-accurate ocean/land & coastline masks ...")
    ocean_mask = extract_ocean_mask(sr_land_4k, ne2_4k, hyp_4k)
    land_mask = 1.0 - ocean_mask

    # ------------------------------------------------------------------
    # 1. ALBEDO 4K: Museum-Grade Satellite-Atlas Shaded Relief + Deep Ocean Bathymetry
    # ------------------------------------------------------------------
    print("[bake] Grading 4K Shaded-Relief Albedo (satellite biomes + hypsometric relief + sapphire bathymetry) ...")

    # --- LAND COMPOSITE ---
    # Cross-blend NE2 (natural ecological biomes) + HYP (sculptural alpine relief warmth)
    land_rgb = 0.62 * ne2_4k + 0.38 * hyp_4k

    # Normalize & inject crisp topographic hillshading from SR_50M
    # SR_50M land mean is ~195; values < 195 are mountain shadow slopes, > 195 are sunlit ridges.
    sr_centered = (sr_land_4k - 196.0) / 62.0
    sr_centered = np.clip(sr_centered, -1.25, 1.15)
    # Apply subtle directional contrast boost so Himalayas, Andes, Alps, Rockies pop in 3D
    relief_gain = 1.0 + 0.28 * sr_centered
    land_rgb = land_rgb * relief_gain[:, :, None]

    # Deepen slightly & enrich saturation so continents look rich (never washed-out pastel)
    land_luma = (
        0.299 * land_rgb[:, :, 0]
        + 0.587 * land_rgb[:, :, 1]
        + 0.114 * land_rgb[:, :, 2]
    )
    # Richer midtones & vivid ecological biomes while protecting polar snow brightness
    sat_boost = 1.44
    land_rgb = land_luma[:, :, None] + (land_rgb - land_luma[:, :, None]) * sat_boost
    # Gentle warm-atlas contrast gamma
    land_01 = np.clip(land_rgb / 255.0, 0.0, 1.0)
    land_01 = np.power(land_01, 1.15)
    # Lift snowcaps cleanly so Himalayas/Alps/Greenland/Antarctica sparkle
    snow_mask = np.clip((land_luma - 208.0) / 47.0, 0.0, 1.0)
    land_01 = land_01 * (1.0 - 0.22 * snow_mask[:, :, None]) + np.array(
        [0.95, 0.96, 0.99], dtype=np.float32
    ) * (0.22 * snow_mask[:, :, None])

    # --- OCEAN COMPOSITE ---
    # Percentile-stretched ocean bathymetry so Mid-Atlantic Ridge, Mariana Trench,
    # Pacific seamounts, and turquoise continental shelves shimmer vividly!
    ocean_bool = ocean_mask > 0.7
    ne2_ocean_luma = (
        0.25 * ne2_4k[:, :, 0] + 0.45 * ne2_4k[:, :, 1] + 0.30 * ne2_4k[:, :, 2]
    ) / 255.0
    l_p05, l_p97 = np.percentile(ne2_ocean_luma[ocean_bool], [4, 97])
    shelf_depth = np.clip((ne2_ocean_luma - l_p05) / max(1e-4, l_p97 - l_p05), 0.0, 1.0)

    ob_p04, ob_p97 = np.percentile(gray_ob_4k[ocean_bool], [4, 97])
    ob_norm = np.clip((gray_ob_4k - ob_p04) / max(1e-4, ob_p97 - ob_p04), 0.0, 1.0)

    # Seafloor tectonic ridges & trenches from GRAY_50M_SR_OB (multi-scale relief)
    ob_detail = (
        (gray_ob_4k - ndimage.gaussian_filter(gray_ob_4k, sigma=6.0)) * 0.65
        + (gray_ob_4k - ndimage.gaussian_filter(gray_ob_4k, sigma=22.0)) * 0.35
    ) / max(4.0, (ob_p97 - ob_p04) * 0.22)
    ob_detail = np.clip(ob_detail, -1.0, 1.0)

    # Luxury Apple-Maps 3D / National Geographic Bathymetry Palette:
    # Abyssal trench (#041531) -> Deep sapphire (#0a3160) -> Ocean cerulean (#125589) -> Sunlit shelf turquoise (#2498b8)
    c_abyss = np.array([0.018, 0.088, 0.205], dtype=np.float32)
    c_mid = np.array([0.048, 0.225, 0.435], dtype=np.float32)
    c_cerulean = np.array([0.082, 0.375, 0.585], dtype=np.float32)
    c_shelf = np.array([0.165, 0.635, 0.745], dtype=np.float32)

    t_bathy = np.clip(0.55 * shelf_depth + 0.45 * ob_norm, 0.0, 1.0)
    t1 = np.clip(t_bathy / 0.48, 0.0, 1.0)
    t2 = np.clip((t_bathy - 0.48) / 0.32, 0.0, 1.0)
    t3 = np.clip((t_bathy - 0.80) / 0.20, 0.0, 1.0)

    ocean_01 = c_abyss * (1.0 - t1[:, :, None]) + c_mid * t1[:, :, None]
    ocean_01 = ocean_01 * (1.0 - t2[:, :, None]) + c_cerulean * t2[:, :, None]
    ocean_01 = ocean_01 * (1.0 - t3[:, :, None]) + c_shelf * t3[:, :, None]

    # Sculpt Mid-Atlantic Ridge, Hawaiian Emperor Seamounts, Mariana Trench clearly
    ocean_01 = ocean_01 * (1.0 + 0.32 * ob_detail[:, :, None])

    # Crisp coastal shallow turquoise halo (continental shelf glow)
    coast_outer = ndimage.gaussian_filter(land_mask, sigma=3.6) * ocean_mask
    ocean_01 = ocean_01 + np.array([0.08, 0.27, 0.32], dtype=np.float32) * (
        np.clip(coast_outer * 1.85, 0.0, 1.0)[:, :, None]
    )

    # Subtle coastal golden-sand rim on the land edge for razor-sharp cartographic separation
    coast_edge = np.clip(
        (ndimage.gaussian_filter(ocean_mask, sigma=1.1) * land_mask) * 3.0, 0.0, 1.0
    )
    land_01 = land_01 * (1.0 - 0.16 * coast_edge[:, :, None]) + np.array(
        [0.82, 0.75, 0.58], dtype=np.float32
    ) * (0.16 * coast_edge[:, :, None])

    albedo_01 = np.clip(
        land_01 * land_mask[:, :, None] + ocean_01 * ocean_mask[:, :, None], 0.0, 1.0
    )
    albedo_img = Image.fromarray((albedo_01 * 255.0).round().astype(np.uint8), mode="RGB")
    # Crisp Retina unsharp mask (micro-clarity for coastlines & peaks without ringing)
    albedo_img = albedo_img.filter(ImageFilter.UnsharpMask(radius=1.0, percent=55, threshold=2))

    # ------------------------------------------------------------------
    # 2. ELEVATION BUMP MAP 2K (Dynamic Mountain Relief + Subtle Seafloor Ridges)
    # ------------------------------------------------------------------
    print("[bake] Synthesizing 2K Elevation Relief Bump Map ...")
    # Estimate true elevation ridges:
    # - Land vs Ocean base step (ocean = 0.18, coastal plains = 0.36)
    # - Mountain slope roughness & ridge energy from SR_50M + HYP warm-highland signal
    sr_2k = load_resized(paths["sr_land"], size_2k, "L")
    ob_2k = load_resized(paths["gray_ob"], size_2k, "L")
    hyp_2k = load_resized(paths["hyp"], size_2k, "RGB")
    ocean_2k = np.asarray(
        Image.fromarray((ocean_mask * 255.0).astype(np.uint8)).resize(
            size_2k, Image.Resampling.LANCZOS
        ),
        dtype=np.float32,
    ) / 255.0
    land_2k = 1.0 - ocean_2k

    # Mountain ruggedness = local standard deviation of SR_50M + inverted shadow depth + bright highland peaks
    sr_blur = ndimage.gaussian_filter(sr_2k, sigma=4.0)
    sr_highpass = sr_2k - sr_blur
    sr_rugged = ndimage.gaussian_filter(np.abs(sr_highpass), sigma=2.2)

    # In HYP_50M_SR_W, high mountain plateaus/peaks have higher R relative to G and/or high white snow
    hyp_warm_elev = np.clip((hyp_2k[:, :, 0] - hyp_2k[:, :, 1] + 22.0) / 85.0, 0.0, 1.0)
    hyp_bright = (hyp_2k[:, :, 0] + hyp_2k[:, :, 1] + hyp_2k[:, :, 2]) / (3.0 * 255.0)
    # Exclude Antarctica/Greenland flat ice sheets from looking noisy while keeping peaks high
    mountain_energy = np.clip(
        (sr_rugged / 24.0) * 0.72 + (sr_highpass / 45.0) * 0.42 + hyp_warm_elev * 0.25 * (sr_rugged / 14.0),
        -0.25,
        1.0,
    )
    land_bump = np.clip(0.36 + 0.52 * mountain_energy + 0.12 * hyp_bright, 0.22, 1.0)

    # Subtle bathymetry ridges on ocean floor (so underwater trenches gently catch light too)
    ob_hp = (ob_2k - ndimage.gaussian_filter(ob_2k, sigma=6.0)) / 38.0
    ocean_bump = np.clip(0.14 + 0.09 * ob_hp + 0.05 * ((ob_2k - 110.0) / 120.0), 0.04, 0.26)

    bump_01 = np.clip(land_bump * land_2k + ocean_bump * ocean_2k, 0.0, 1.0)
    bump_img = Image.fromarray((bump_01 * 255.0).round().astype(np.uint8), mode="L")
    bump_img = bump_img.filter(ImageFilter.GaussianBlur(radius=0.45))

    # ------------------------------------------------------------------
    # 3. OCEAN SPECULAR / GLOSS MASK 2K (White = Satin-Glossy Ocean, Dark = Matte Continents)
    # ------------------------------------------------------------------
    print("[bake] Building 2K Ocean Specular Mask ...")
    # Ocean = 235 (subtle bathymetry glint variation), Land = 28 (rich matte relief, ice ~65)
    land_ice = np.clip((hyp_bright - 0.78) / 0.22, 0.0, 1.0) * land_2k
    spec_01 = np.clip(
        ocean_2k * (0.88 + 0.08 * np.clip(ob_2k / 255.0, 0.0, 1.0))
        + land_2k * 0.09
        + land_ice * 0.14,
        0.0,
        1.0,
    )
    spec_img = Image.fromarray((spec_01 * 255.0).round().astype(np.uint8), mode="L")

    # Save WebP outputs
    out_dir.mkdir(parents=True, exist_ok=True)
    albedo_path = out_dir / "earth_relief_albedo_4k.webp"
    bump_path = out_dir / "earth_elevation_bump_2k.webp"
    spec_path = out_dir / "earth_ocean_specular_2k.webp"

    albedo_img.save(albedo_path, format="WEBP", quality=80, method=6)
    bump_img.save(bump_path, format="WEBP", quality=82, method=6)
    spec_img.save(spec_path, format="WEBP", quality=80, method=6)

    print(
        f"[done] Baked Ultra-HD 3D Relief Earth textures:\n"
        f"  - {albedo_path.relative_to(REPO_ROOT)} ({albedo_img.size[0]}x{albedo_img.size[1]}, {albedo_path.stat().st_size / 1024:.1f} KB)\n"
        f"  - {bump_path.relative_to(REPO_ROOT)} ({bump_img.size[0]}x{bump_img.size[1]}, {bump_path.stat().st_size / 1024:.1f} KB)\n"
        f"  - {spec_path.relative_to(REPO_ROOT)} ({spec_img.size[0]}x{spec_img.size[1]}, {spec_path.stat().st_size / 1024:.1f} KB)"
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Bake Ultra-HD 4K Shaded-Relief Earth WebP textures from public-domain Natural Earth."
    )
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=OUT_DIR,
        help="Destination directory for baked WebP textures.",
    )
    args = parser.parse_args()
    bake_from_natural_earth(args.out_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
