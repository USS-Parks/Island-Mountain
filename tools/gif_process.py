#!/usr/bin/env python
"""
gif_process.py — Aeneas GIF float/contrast/resize pipeline (P-SPR: AENEAS-GIF-FLOAT).

Pipeline per frame:
  coalesce -> RGBA
  -> derive soft alpha from a light background (luminance-keyed, anti-aliased)
  -> recolor content for contrast on a dark page (white | copper | gray | keep)
  -> resize (default 50%)
  -> save animated WebP (full 8-bit alpha) or GIF (1-bit alpha)

Light background removal: alpha = smoothstep over "ink" = (255 - luminance).
Near-white / light-gradient backgrounds have low ink -> alpha 0 (removed),
dark content has high ink -> opaque, with soft edges preserved for WebP.

Usage:
  python tools/gif_process.py INPUT OUTPUT [--color white|copper|gray|keep]
      [--scale 0.5] [--bg-cut 30] [--span 45] [--format webp|gif]
"""
import argparse
from PIL import Image, ImageChops, ImageSequence, ImageFilter, ImageDraw

TARGETS = {
    "white":  (241, 245, 249),   # --text-light
    "copper": (245, 158, 11),    # --copper
}

# Multi-tone "fire" ramp keyed on ink density (faint content -> yellow,
# dense content -> deep burnt orange). Gives nuanced orange/yellow layers.
FIRE_STOPS = [
    (0.00, (253, 224, 71)),   # #fde047 bright yellow
    (0.40, (251, 146, 20)),   # warm orange
    (0.70, (234, 88, 12)),    # #ea580c
    (1.00, (180, 55, 8)),     # deep burnt orange
]


def _ramp_lut(stops):
    lut = [(0, 0, 0)] * 256
    for i in range(256):
        t = i / 255.0
        for (t0, c0), (t1, c1) in zip(stops, stops[1:]):
            if t0 <= t <= t1:
                f = 0 if t1 == t0 else (t - t0) / (t1 - t0)
                lut[i] = tuple(round(c0[k] + (c1[k] - c0[k]) * f) for k in range(3))
                break
        else:
            lut[i] = stops[-1][1]
    return lut


def _fire_rgb(ink, bg_cut):
    """Map ink (L image) through the fire ramp, normalized over [bg_cut,255]."""
    span = max(1, 255 - bg_cut)
    norm = ink.point(lambda v: 0 if v <= bg_cut else min(255, round((v - bg_cut) * 255 / span)))
    lut = _ramp_lut(FIRE_STOPS)
    r = norm.point([c[0] for c in lut])
    g = norm.point([c[1] for c in lut])
    b = norm.point([c[2] for c in lut])
    return Image.merge("RGB", (r, g, b))


def build_alpha(rgba, bg_cut, span):
    """Soft alpha from light background. ink=255-luma; ramp bg_cut..bg_cut+span."""
    lum = rgba.convert("L")
    ink = ImageChops.invert(lum)            # 0 = white bg, 255 = black content
    gain = 255.0 / max(1, span)
    return ink.point(lambda v: 0 if v < bg_cut else min(255, int((v - bg_cut) * gain)))


def recolor(rgba, alpha, color, bg_cut):
    if color == "keep":
        out = rgba.copy()
        out.putalpha(alpha)
        return out
    if color == "gray":
        ink = ImageChops.invert(rgba.convert("L"))   # dark content -> light gray
        return Image.merge("RGBA", (ink, ink, ink, alpha))
    if color == "fire":
        ink = ImageChops.invert(rgba.convert("L"))
        rgb = _fire_rgb(ink, bg_cut)
        rgb.putalpha(alpha)
        return rgb
    r, g, b = TARGETS[color]
    out = Image.new("RGBA", rgba.size, (r, g, b, 0))
    out.putalpha(alpha)
    return out


def parse_masks(spec):
    rects = []
    if spec:
        for part in spec.split(";"):
            if part.strip():
                rects.append(tuple(int(n) for n in part.split(",")))
    return rects


def _radial_mask(size, cx, cy, r, feather):
    """L mask: 255 inside radius r, ramping to 0 across `feather` px outside."""
    m = Image.new("L", size, 0)
    px = m.load()
    w, h = size
    r2i = (r) ** 2
    for y in range(h):
        dy2 = (y - cy) ** 2
        for x in range(w):
            d = ((x - cx) ** 2 + dy2) ** 0.5
            if d <= r:
                px[x, y] = 255
            elif d <= r + feather:
                px[x, y] = int(255 * (1 - (d - r) / feather))
    return m


import math


def _ink_at(px, x, y, w, h):
    return px[x, y] if 0 <= x < w and 0 <= y < h else 0


def measure_badge(ink, cx, cy):
    """Return (radius, donut_present). Tracks the central badge as it scales:
    if no donut yet -> outermost content radius; else -> innermost ring outer."""
    px = ink.load(); w, h = ink.size
    donut = False
    for a in range(0, 360, 20):
        x = int(cx + 105 * math.cos(math.radians(a))); y = int(cy + 105 * math.sin(math.radians(a)))
        if _ink_at(px, x, y, w, h) > 80:
            donut = True; break
    if not donut:
        rmax = 0
        for a in range(0, 360, 12):
            ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
            for r in range(160, 20, -1):
                if _ink_at(px, int(cx + r * ca), int(cy + r * sa), w, h) > 100:
                    rmax = max(rmax, r); break
        return rmax, False
    outers = []
    for a in (0, 180, 90, 270):
        ca, sa = math.cos(math.radians(a)), math.sin(math.radians(a))
        inseg = False; out = None
        for r in range(35, 130):
            v = _ink_at(px, int(cx + r * ca), int(cy + r * sa), w, h)
            if v > 90 and not inseg:
                inseg = True
            elif v <= 90 and inseg:
                out = r - 1; break
        if out:
            outers.append(out)
    return (max(outers) if outers else 64), True


def process(inp, outp, color, scale, bg_cut, span, fmt, masks=None, sharpen=0,
            radial=None, accent=None, effects_from=0, badge_auto=None,
            bg_alpha=0, round_r=0, quality=0):
    src = Image.open(inp)
    loop = src.info.get("loop", 0)
    masks = masks or []
    rmask = None
    if radial:
        cx, cy, rr, rcut = radial[0], radial[1], radial[2], radial[3]
        feather = radial[4] if len(radial) > 4 else 8
        rmask = _radial_mask(src.size, cx, cy, rr, feather)
    amask = None
    if accent:
        acolor, acx, acy, ar = accent[0], accent[1], accent[2], accent[3]
        afeather = accent[4] if len(accent) > 4 else 3
        amask = _radial_mask(src.size, acx, acy, ar, afeather)
    bcolor = bcx = bcy = None
    mask_cache = {}
    if badge_auto:
        bcolor, bcx, bcy = badge_auto[0], badge_auto[1], badge_auto[2]
    frames, durs = [], []
    for idx, fr in enumerate(ImageSequence.Iterator(src)):
        active = idx >= effects_from        # region effects only after badge settles
        durs.append(fr.info.get("duration", src.info.get("duration", 100)))
        rgba = fr.convert("RGBA")
        alpha = build_alpha(rgba, bg_cut, span)
        if rmask is not None and active:
            # inside the radial region, use a higher cutoff to drop the soft shadow
            inner = build_alpha(rgba, rcut, span)
            alpha = Image.composite(inner, alpha, rmask)
        # knock out masked regions (logo, date) at full resolution
        if masks:
            d = ImageDraw.Draw(alpha)
            for (x0, y0, x1, y1) in masks:
                d.rectangle([x0, y0, x1, y1], fill=0)
        out = recolor(rgba, alpha, color, bg_cut)
        if amask is not None and active:
            acc = recolor(rgba, alpha, acolor, bg_cut)
            out = Image.composite(acc, out, amask)
        if bcolor is not None:
            ink = ImageChops.invert(rgba.convert("L"))
            r, donut = measure_badge(ink, bcx, bcy)
            rad = (r + 10) if not donut else max(66, min(92, r + 10))
            rad = int(round(rad))
            bm = mask_cache.get(rad)
            if bm is None:
                bm = _radial_mask(src.size, bcx, bcy, rad, 4)
                mask_cache[rad] = bm
            badge = recolor(rgba, alpha, bcolor, bg_cut)
            out = Image.composite(badge, out, bm)
        if scale != 1.0:
            w, h = out.size
            out = out.resize((max(1, round(w * scale)), max(1, round(h * scale))),
                             Image.LANCZOS)
        if sharpen:
            out = out.filter(ImageFilter.UnsharpMask(radius=1.0, percent=sharpen, threshold=1))
        if bg_alpha > 0:
            a = out.getchannel("A")
            floor = Image.new("L", out.size, bg_alpha)
            out.putalpha(ImageChops.lighter(a, floor))   # raise bg to translucent, keep content opaque
        if round_r > 0:
            rr = Image.new("L", out.size, 0)
            ImageDraw.Draw(rr).rounded_rectangle([0, 0, out.size[0] - 1, out.size[1] - 1],
                                                 radius=round_r, fill=255)
            out.putalpha(ImageChops.multiply(out.getchannel("A"), rr))
        frames.append(out)

    if fmt == "webp":
        if quality > 0:
            frames[0].save(outp, format="WEBP", save_all=True,
                           append_images=frames[1:], duration=durs, loop=loop,
                           lossless=False, quality=quality, method=6, exact=True)
        else:
            frames[0].save(outp, format="WEBP", save_all=True,
                           append_images=frames[1:], duration=durs, loop=loop,
                           lossless=True, method=6, exact=True)
    else:  # gif: 1-bit alpha
        conv = []
        for f in frames:
            a = f.getchannel("A").point(lambda v: 255 if v >= 128 else 0)
            p = f.convert("RGB").convert("P", palette=Image.ADAPTIVE, colors=255)
            mask = a.point(lambda v: 255 if v == 0 else 0)
            p.paste(255, mask=mask)
            p.info["transparency"] = 255
            conv.append(p)
        conv[0].save(outp, format="GIF", save_all=True, append_images=conv[1:],
                     duration=durs, loop=loop, transparency=255, disposal=2, optimize=True)
    print(f"wrote {outp}  ({len(frames)} frames, {frames[0].size[0]}x{frames[0].size[1]}, {color}, {fmt})")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("output")
    ap.add_argument("--color", default="white", choices=["white", "copper", "gray", "keep", "fire"])
    ap.add_argument("--scale", type=float, default=0.5)
    ap.add_argument("--bg-cut", type=int, default=30)
    ap.add_argument("--span", type=int, default=45)
    ap.add_argument("--format", default="webp", choices=["webp", "gif"])
    ap.add_argument("--mask", default="", help='x0,y0,x1,y1;... in ORIGINAL px')
    ap.add_argument("--sharpen", type=int, default=0, help="UnsharpMask percent (e.g. 140)")
    ap.add_argument("--radial", default="", help="cx,cy,r,bgcut[,feather] in ORIGINAL px: higher cutoff inside circle")
    ap.add_argument("--accent", default="", help="color,cx,cy,r[,feather]: recolor inside circle (e.g. white,282,330,68,3)")
    ap.add_argument("--effects-from", type=int, default=0, help="apply radial/accent only from this frame index (after intro settles)")
    ap.add_argument("--badge-auto", default="", help="color,cx,cy: recolor the auto-tracked central badge every frame (e.g. white,282,330)")
    ap.add_argument("--bg-alpha", type=int, default=0, help="0=transparent bg; >0 leaves bg as translucent white at this alpha (e.g. 160)")
    ap.add_argument("--round", type=int, default=0, help="round panel corners by this radius (px, post-resize)")
    ap.add_argument("--quality", type=int, default=0, help="0=lossless webp; 1-100=lossy quality")
    a = ap.parse_args()
    radial = [int(n) for n in a.radial.split(",")] if a.radial else None
    accent = None
    if a.accent:
        p = a.accent.split(",")
        accent = [p[0]] + [int(n) for n in p[1:]]
    badge_auto = None
    if a.badge_auto:
        p = a.badge_auto.split(",")
        badge_auto = [p[0]] + [int(n) for n in p[1:]]
    process(a.input, a.output, a.color, a.scale, a.bg_cut, a.span, a.format,
            parse_masks(a.mask), a.sharpen, radial, accent, a.effects_from,
            badge_auto, a.bg_alpha, a.round, a.quality)
