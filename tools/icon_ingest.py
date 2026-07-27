#!/usr/bin/env python3
"""Turn a generated raster into a house-standard Island Mountain icon.

One canonical step, so nobody re-derives it and drifts (the 2026-07 drift: some
icons went through an older dilate-only pass, some were hand-keyed, and stroke
weight ended up ranging 3.8x across the set). This does all of it:

  source        -> alpha            transparent-bg webp kept as-is; else the
                                    generator's white-on-black is luminance-keyed
  RGB           -> pure white       (the card filter forces white; we bake it in)
  crop + fit    -> FILL of canvas   uniform on-card size, centred
  stroke        -> CANON_STROKE     erode heavy icons, dilate thin ones, so every
                                    icon carries the same wire-line weight
  size          -> 208 x 208        2x the largest slot the site renders (104px)
  save          -> lossless webp

    python tools/icon_ingest.py icons/document-drafting.png images/document-drafting-icon.webp

icons/ holds the hi-res masters; images/ holds the 208 delivery icons. The site
renders them with weight but NO glow (see css/style.css) — the weight lives in
the stroke, which is why the stroke width is normalized here, canonically. Run
tools/icon_qa.py on the output before it goes near a page.
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

SIZE = 208            # delivery size = 2x the 104px display slot
WORK = 832            # 4x working canvas: morphology stays crisp, resize once
FILL = 0.85           # longest art side as a share of the canvas (house median)
CANON_STROKE = 10.0   # target wire-line width at WORK (=> ~2.5px at 208), the
                      # single knob that makes every icon read at one weight.
                      # Set at the legibility floor: below ~10 the busiest icons
                      # (multi-cloud, no-integration) drop under icon_qa's
                      # solidity gate once the glow is gone.
_KEY_FLOOR = 0.06     # lift near-black generator noise to a genuine zero


def _disk(radius: float) -> np.ndarray:
    r = max(1, int(round(radius)))
    y, x = np.ogrid[-r:r + 1, -r:r + 1]
    return x * x + y * y <= r * r


def _stroke_width(alpha: np.ndarray) -> float:
    """2x the mean distance-to-edge over the inked region = mean stroke width."""
    ink = alpha > 0.5
    if not ink.any():
        return 0.0
    return float(2 * ndimage.distance_transform_edt(ink)[ink].mean())


def _source_alpha(src: str) -> Image.Image:
    """Grayscale alpha for the linework, from either source shape."""
    im = Image.open(src)
    if "A" in im.getbands():
        a = np.asarray(im.convert("RGBA").getchannel("A"), dtype=np.float32) / 255.0
        if (a > 0.02).mean() < 0.6:          # genuinely transparent-bg master
            return Image.fromarray((a * 255).astype("uint8"))
    lum = np.asarray(im.convert("L"), dtype=np.float32) / 255.0
    keyed = np.clip((lum - _KEY_FLOOR) / (1 - _KEY_FLOOR), 0, 1)
    return Image.fromarray((keyed * 255).astype("uint8"))


def ingest(src: str, dst: str) -> None:
    alpha = _source_alpha(src)

    bbox = alpha.point(lambda v: 255 if v > 38 else 0).getbbox()
    if bbox is None:
        raise SystemExit("%s: no linework found. Was it white on black?" % src)
    alpha = alpha.crop(bbox)

    # fit to FILL on the working canvas first, so the stroke target is measured
    # and applied at final proportions (the fit rescale would otherwise change it)
    scale = (FILL * WORK) / max(alpha.size)
    fitted = alpha.resize(
        (max(1, round(alpha.width * scale)), max(1, round(alpha.height * scale))),
        Image.LANCZOS,
    )
    canvas = Image.new("L", (WORK, WORK), 0)
    canvas.paste(fitted, ((WORK - fitted.width) // 2, (WORK - fitted.height) // 2))

    a = np.asarray(canvas, dtype=np.float32) / 255.0
    width = _stroke_width(a)
    delta = CANON_STROKE - width
    if abs(delta) >= 1.0:                    # sub-pixel deltas aren't worth touching
        foot = _disk(abs(delta) / 2.0)
        a = ndimage.grey_dilation(a, footprint=foot) if delta > 0 \
            else ndimage.grey_erosion(a, footprint=foot)
    a = np.clip(a, 0, 1)

    final_alpha = Image.fromarray((a * 255).astype("uint8")).resize((SIZE, SIZE), Image.LANCZOS)
    out = Image.merge("RGBA", (Image.new("L", (SIZE, SIZE), 255),) * 3 + (final_alpha,))
    os.makedirs(os.path.dirname(dst) or ".", exist_ok=True)
    out.save(dst, "WEBP", lossless=True, quality=100, method=6)

    landed = _stroke_width(np.asarray(final_alpha, dtype=np.float32) / 255.0) * WORK / SIZE
    print("%s -> %s  (stroke %.1f -> %.1f @%d, %.1fK)"
          % (os.path.basename(src), dst, width, landed, WORK, os.path.getsize(dst) / 1024))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    ingest(sys.argv[1], sys.argv[2])
