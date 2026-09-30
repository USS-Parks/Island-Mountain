#!/usr/bin/env python
"""ways_to_augment_arrow_repair.py — redraw the malformed flow arrows in the
"Ways to Augment or Adapt LLMs" base still.

The AI-generated artwork drew every straight flow arrow as a loose
chevron-on-a-stick: washed-out shafts with mismatched dark heads, gaps
between shaft and head (LoRA, CAG), blob heads (GraphRAG, agentic), and two
stray fragments — a detached capsule "page" hanging off the Self-RAG docs
icon and leftover arrowhead debris. This script erases each defective glyph
to the local background and redraws a clean anti-aliased arrow (straight
shaft, solid triangular head) at the same anchor points, in the card's own
ink color, supersampled 8x. Curved connectors and dashed feedback loops are
left untouched.

Usage:
  python tools/ways_to_augment_arrow_repair.py IN.png OUT.png
"""
import sys
import numpy as np
from PIL import Image, ImageDraw

SS = 8  # supersample factor

# (seed box, ink color, shaft width px, head length px, head full-width px)
# Seed boxes bound the defective glyph; geometry is re-measured from its ink.
NAVY = (27, 51, 95)
STEEL = (56, 84, 130)
RED = (190, 34, 26)
ORANGE = (233, 145, 60)
ARROWS = [
    # RAG
    ((49, 226, 72, 238),    NAVY,  1.9, 6.0, 7.0),
    ((110, 226, 134, 238),  NAVY,  1.9, 6.0, 7.0),
    ((164, 227, 186, 239),  NAVY,  1.9, 6.0, 7.0),
    # CAG
    ((294, 226, 330, 238),  NAVY,  1.9, 6.0, 7.0),
    ((365, 226, 400, 238),  NAVY,  1.9, 6.0, 7.0),
    # GraphRAG
    ((503, 226, 520, 239),  RED,   1.9, 5.5, 6.5),
    ((564, 227, 588, 239),  RED,   1.9, 6.0, 7.0),
    ((618, 227, 640, 239),  RED,   1.9, 6.0, 7.0),
    # KAG (straight orange arrow only; the red curls above/below stay)
    ((775, 244, 811, 254),  ORANGE, 2.2, 6.0, 7.0),
    ((856, 241, 873, 253),  RED,   1.9, 5.5, 6.5),
    # Self-RAG
    ((962, 225, 981, 236),  STEEL, 1.7, 5.5, 6.5),
    ((1017, 223, 1041, 236), STEEL, 1.7, 5.5, 6.5),
    ((1072, 223, 1096, 235), STEEL, 1.7, 5.5, 6.5),
    # Agentic workflow
    ((77, 480, 110, 493),   RED,   2.2, 6.5, 7.5),
    ((167, 480, 217, 493),  RED,   2.2, 6.5, 7.5),
    ((289, 481, 338, 494),  RED,   2.2, 6.5, 7.5),
    ((407, 481, 451, 493),  RED,   2.2, 6.5, 7.5),
    # SFT
    ((638, 494, 668, 507),  STEEL, 1.9, 6.0, 7.0),
    ((755, 495, 780, 506),  STEEL, 1.9, 6.0, 7.0),
    # LoRA
    ((941, 494, 962, 507),  STEEL, 1.9, 6.0, 7.0),
    ((1041, 494, 1070, 507), STEEL, 1.9, 6.0, 7.0),
]

# regions erased outright (stray fragments), filled with local background
ERASE = []

# The Self-RAG "Question" docs icon is malformed: its back-page edge is a
# detached rounded capsule floating to the right of the stack. Erasing the
# capsule alone leaves the stack open, so the whole icon is replaced with the
# clean stacked-docs icon from the SFT card, rescaled to the same footprint.
TRANSPLANT = {
    "donor_zone": (575, 470, 640, 525),   # SFT "Labeled examples" icon
    "target_zone": (922, 208, 964, 252),  # damaged Self-RAG "Question" icon
}


def bg_color(arr, box, pad=3):
    """Median of the pixels ringing the box — the local panel background."""
    x0, y0, x1, y1 = box
    ring = np.concatenate([
        arr[y0 - pad:y0, x0 - pad:x1 + pad].reshape(-1, 3),
        arr[y1:y1 + pad, x0 - pad:x1 + pad].reshape(-1, 3),
        arr[y0:y1, x0 - pad:x0].reshape(-1, 3),
        arr[y0:y1, x1:x1 + pad].reshape(-1, 3),
    ])
    return np.median(ring, 0)


def redraw(arr, seed, color, shaft_w, head_len, head_w):
    x0, y0, x1, y1 = seed
    sub = arr[y0:y1, x0:x1]
    ink = ((sub.max(2) - sub.min(2)) > 20) & (sub.min(2) < 215)
    ys, xs = np.nonzero(ink)
    if len(xs) == 0:
        return
    x_tail, x_tip = x0 + xs.min(), x0 + xs.max() + 1
    y_c = y0 + ys.mean()

    # erase the old glyph (pad 2px) with the surrounding background
    ex0, ey0, ex1, ey1 = x0 - 2, y0 - 2, x1 + 2, y1 + 2
    bg = bg_color(arr, (ex0, ey0, ex1, ey1))
    arr[ey0:ey1, ex0:ex1] = bg

    # draw the replacement supersampled, then area-average down
    w, h = (ex1 - ex0) * SS, (ey1 - ey0) * SS
    im = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(im)
    yc = (y_c - ey0) * SS
    xt = (x_tail - ex0) * SS
    xp = (x_tip - ex0) * SS
    hl, hw, sw = head_len * SS, head_w * SS, shaft_w * SS
    d.line([(xt + sw / 2, yc), (xp - hl + sw / 2, yc)], fill=255, width=round(sw))
    d.ellipse([xt, yc - sw / 2, xt + sw, yc + sw / 2], fill=255)  # round tail cap
    d.polygon([(xp, yc), (xp - hl, yc - hw / 2), (xp - hl, yc + hw / 2)], fill=255)
    m = np.asarray(im, np.float32).reshape(ey1 - ey0, SS, ex1 - ex0, SS).mean((1, 3)) / 255.0
    col = np.asarray(color, np.float32)
    dst = arr[ey0:ey1, ex0:ex1]
    dst += (col[None, None, :] - dst) * m[..., None]


def ink_bbox(arr, zone, thresh=200):
    x0, y0, x1, y1 = zone
    sub = arr[y0:y1, x0:x1]
    ys, xs = np.nonzero(sub.min(2) < thresh)
    return (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)


def transplant(arr, donor_zone, target_zone):
    dx0, dy0, dx1, dy1 = ink_bbox(arr, donor_zone)
    tx0, ty0, tx1, ty1 = ink_bbox(arr, target_zone)
    donor = Image.fromarray(arr[dy0 - 1:dy1 + 1, dx0 - 1:dx1 + 1].astype(np.uint8))
    th = ty1 - ty0
    donor = donor.resize((round(donor.width * th / donor.height), th), Image.LANCZOS)
    cx, cy = (tx0 + tx1) / 2, (ty0 + ty1) / 2

    x0, y0, x1, y1 = target_zone
    bg = bg_color(arr, target_zone)
    arr[y0:y1, x0:x1] = bg

    px, py = round(cx - donor.width / 2), round(cy - donor.height / 2)
    d = np.asarray(donor, np.float32)
    a = np.clip((242.0 - d.min(2)) / 140.0, 0, 1)[..., None]   # darkness = ink alpha
    dst = arr[py:py + donor.height, px:px + donor.width]
    dst += (d - dst) * a


def main(src, out):
    arr = np.asarray(Image.open(src).convert("RGB"), np.float32).copy()
    for box in ERASE:
        x0, y0, x1, y1 = box
        arr[y0:y1, x0:x1] = bg_color(arr, box)
    transplant(arr, TRANSPLANT["donor_zone"], TRANSPLANT["target_zone"])
    for seed, color, sw, hl, hw in ARROWS:
        redraw(arr, seed, color, sw, hl, hw)
    Image.fromarray(arr.astype(np.uint8)).save(out)
    print(f"wrote {out}: {len(ARROWS)} arrows redrawn, icon transplanted")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
