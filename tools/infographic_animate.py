#!/usr/bin/env python
"""infographic_animate.py — brand-stamp a static LIGHT infographic and drive a
CRISP, sequenced glow choreography over the ORIGINAL pixels (no blur, no washes).

Each element (panel / card / pill) lights up in turn with a sharp additive
outline-glow, held for a number of "beats", then hands off to the next. One
element is active per frame, so the untouched regions diff to nothing and the
GIF stays small even when the sequence is long.

The choreography is a `sequence` of groups, each with its boxes, a per-element
`beats` duration, and a corner `radius`. A built-in config for the LLM-vs-SLM
infographic runs when no --config is given, and doubles as the schema example.

Usage:
  python tools/infographic_animate.py [--config cfg.json] [--out NAME.gif]
      [--fps 20] [--scale 1.0] [--keep-frames]
  python tools/infographic_animate.py --grid --base IMG.png --out grid.png
"""
import argparse, json, math, os, shutil, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont


def write_grid(base_path, out_path, step=50):
    """Save a labeled coordinate grid over the base image — read box coordinates
    off it to author a config. Labels every 100px."""
    im = Image.open(base_path).convert("RGB")
    W, H = im.size
    d = ImageDraw.Draw(im)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 16)
    except Exception:
        font = ImageFont.load_default()
    for x in range(0, W, step):
        d.line([(x, 0), (x, H)], fill=(255, 0, 0) if x % 100 == 0 else (255, 165, 165))
        if x % 100 == 0:
            d.text((x + 2, 2), str(x), fill=(200, 0, 0), font=font)
            d.text((x + 2, H - 20), str(x), fill=(200, 0, 0), font=font)
    for y in range(0, H, step):
        d.line([(0, y), (W, y)], fill=(0, 90, 255) if y % 100 == 0 else (175, 195, 255))
        if y % 100 == 0:
            d.text((2, y + 1), str(y), fill=(0, 0, 220), font=font)
            d.text((W - 46, y + 1), str(y), fill=(0, 0, 220), font=font)
    im.save(out_path)
    print(f"wrote {out_path}  ({W}x{H} grid, step {step})")


# ---- crisp rounded-rect masks (float32 HxW, 0..1) -------------------------

def _feather(mask, px):
    """Small separable box-blur feather — kept tight so edges stay crisp."""
    if px <= 0:
        return mask
    k = 2 * px + 1
    pad = np.pad(mask, px, mode="edge")
    csum = np.cumsum(np.cumsum(pad, 0), 1)
    csum = np.pad(csum, ((1, 0), (1, 0)))
    H, W = mask.shape
    out = (csum[k:k+H, k:k+W] - csum[:H, k:k+W]
           - csum[k:k+H, :W] + csum[:H, :W]) / (k * k)
    return out.astype(np.float32)


def _rrect(shape, box, radius):
    """Hard-edged filled rounded rectangle (0/1)."""
    H, W = shape
    x0, y0, x1, y1 = [int(v) for v in box]
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).rounded_rectangle([x0, y0, x1 - 1, y1 - 1],
                                        radius=radius, fill=255)
    return (np.asarray(m, np.float32) / 255.0)


def rrect_fill(shape, box, radius, feather):
    return _feather(_rrect(shape, box, radius), feather)


def rring(shape, box, radius, width, feather):
    """Rounded-rect outline of `width` px: outer filled minus inner filled."""
    x0, y0, x1, y1 = box
    outer = _rrect(shape, box, radius)
    inner = _rrect(shape, [x0 + width, y0 + width, x1 - width, y1 - width],
                   max(0, radius - width))
    return _feather(np.clip(outer - inner, 0, 1), feather)


def accent_color(arr, box):
    """The card's own accent hue, brightened so it reads as a glow. Mean of the
    box's most-saturated pixels (the icon/border/title color), scaled to full."""
    x0, y0, x1, y1 = [int(v) for v in box]
    sub = arr[y0:y1, x0:x1].reshape(-1, 3)
    sat = sub.max(1) - sub.min(1)
    sel = sub[sat > 55]
    if len(sel) < 20:
        sel = sub[sat > 30]
    c = (sel if len(sel) >= 5 else sub).mean(0)
    m = c.max()
    return np.clip(c * (245 / m), 0, 255) if m > 0 else c


# ---- render ---------------------------------------------------------------

def load_overlays(cfg, W):
    overlays = []
    for ov in cfg.get("overlays", []):
        oi = Image.open(ov["image"]).convert("RGBA")
        bb = oi.getchannel("A").getbbox()   # trim transparent padding
        if bb:
            oi = oi.crop(bb)
        h = ov["h"]
        oi = oi.resize((round(oi.width * h / oi.height), h), Image.LANCZOS)
        x = ov["x"] if "x" in ov else (W - ov["right"] - oi.width)
        overlays.append((oi, x, ov["cy"] - h // 2))
    return overlays


def render(cfg, out_path, fps, scale, keep_frames, scratch):
    base = Image.open(cfg["base"]).convert("RGB")
    W, H = base.size
    arr = np.asarray(base, np.float32)
    overlays = load_overlays(cfg, W)

    g = cfg.get("glow", {})
    ring_w = g.get("ring_w", 5)
    feather = g.get("feather", 2)
    ring_a = g.get("ring_alpha", 0.85)
    fill_a = g.get("fill_alpha", 0.10)
    bf = cfg.get("beat_frames", 6)

    # flatten the choreography into ordered (ring, fill, dur, color) items;
    # each element glows in its own accent color (or a group override)
    items = []
    for grp in cfg["sequence"]:
        dur = max(1, round(grp["beats"] * bf))
        rad = grp.get("radius", 12)
        for box in grp["boxes"]:
            col = np.asarray(grp["color"], np.float32) if "color" in grp else accent_color(arr, box)
            items.append((rring((H, W), box, rad, ring_w, feather),
                          rrect_fill((H, W), box, rad, feather), dur, col))
    total = sum(d for _, _, d, _ in items)

    ffdir = os.path.join(scratch, "frames")
    if os.path.isdir(ffdir):
        shutil.rmtree(ffdir)
    os.makedirs(ffdir)

    fi = 0
    for ring_m, fill_m, dur, col in items:
        w_static = ring_m * ring_a + fill_m * fill_a
        for i in range(dur):
            k = math.sin(math.pi * (i + 0.5) / dur)      # 0.5->1->0.5 crisp beat
            frame = np.clip(arr + col[None, None, :] * (w_static * k)[..., None], 0, 255)
            img = Image.fromarray(frame.astype(np.uint8), "RGB")
            for oi, ox, oy in overlays:                  # static brand marks
                img.paste(oi, (ox, oy), oi)
            if scale != 1.0:
                img = img.resize((round(W * scale), round(H * scale)), Image.LANCZOS)
            img.save(os.path.join(ffdir, f"f{fi:03d}.png"))
            fi += 1

    _encode_gif(ffdir, out_path, fps)
    print(f"  {total} frames, {len(items)} glow steps, {fps} fps")
    if not keep_frames:
        shutil.rmtree(ffdir)


def _encode_gif(ffdir, out_path, fps):
    pal = os.path.join(ffdir, "palette.png")
    common = ["-y", "-framerate", str(fps), "-i", os.path.join(ffdir, "f%03d.png")]
    subprocess.run(["ffmpeg", *common, "-vf",
                    "palettegen=max_colors=256:stats_mode=diff", pal],
                   check=True, capture_output=True)
    subprocess.run(["ffmpeg", *common, "-i", pal, "-lavfi",
                    "paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle",
                    "-loop", "0", out_path], check=True, capture_output=True)
    print(f"wrote {out_path}  ({os.path.getsize(out_path)/1e6:.2f} MB)")


# ---- concurrent timeline: slots + dash traces + arrow pulse ---------------
# A config with a "slots" key uses this renderer instead of the sequential one.
# Each slot holds `frames`, an optional `glow` (boxes lit together, mild ring +
# fill in the slot color), and `traces` (a highlight head that travels a
# polyline from anchor to terminal inside the slot's [t0,t1] window, recoloring
# the dash ink it passes and leaving a faint halo). An optional top-level
# "arrows" block extracts each saturated arrow sprite from the base and
# breathes a translucent scaled copy of it over the original all loop long.

def _resample_path(pts, step=3.0):
    pts = np.asarray(pts, np.float32)
    segs = np.diff(pts, axis=0)
    seglen = np.hypot(segs[:, 0], segs[:, 1])
    cum = np.concatenate([[0.0], np.cumsum(seglen)])
    L = float(cum[-1])
    d = np.linspace(0.0, L, max(2, int(L / step)))
    xs = np.interp(d, cum, pts[:, 0])
    ys = np.interp(d, cum, pts[:, 1])
    return np.stack([xs, ys], 1), d.astype(np.float32), L


def _disk(radius):
    r = int(math.ceil(radius)) + 1
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    return np.clip((radius - np.hypot(xx, yy)) / 2 + 0.5, 0, 1).astype(np.float32), r


class Trace:
    """Fill-and-hold sweep: a soft head moves anchor->terminal across the sweep
    window t=[t0,t1]; dashes it has passed STAY lit (hold) so the line reads as
    progressively highlighted, then the whole line releases over `release`."""
    def __init__(self, t, arr, H, W):
        self.samples, self.d, self.L = _resample_path(t["path"])
        self.color = np.asarray(t["color"], np.float32)
        self.t0, self.t1 = t.get("t", [0.0, 1.0])
        self.release = t.get("release", [0.85, 0.99])
        self.hold = t.get("hold", 0.82)
        self.halo_head, self.halo_hold = t.get("halo", [0.30, 0.10])
        self.sigma = float(t.get("sigma", 60))
        self.kern, self.kr = _disk(t.get("width", 12))
        pad = self.kr + 3
        x0 = max(0, int(self.samples[:, 0].min()) - pad)
        y0 = max(0, int(self.samples[:, 1].min()) - pad)
        x1 = min(W, int(self.samples[:, 0].max()) + pad + 1)
        y1 = min(H, int(self.samples[:, 1].max()) + pad + 1)
        self.bb = (x0, y0, x1, y1)
        sub = arr[y0:y1, x0:x1]
        self.ink = np.clip((235.0 - sub.min(2)) / 120.0, 0, 1).astype(np.float32)

    def gain(self, u_slot):
        """Recolor gain over the local bbox at slot time u_slot, or None."""
        f0, f1 = self.release
        if u_slot < self.t0 or u_slot >= f1:
            return None
        e = 1.0 if u_slot <= f0 else 0.5 * (1 + math.cos(math.pi * (u_slot - f0) / (f1 - f0)))
        e *= min(1.0, (u_slot - self.t0) / 0.05)       # soft ignition at the anchor
        if e < 0.02:
            return None
        q = min(1.0, (u_slot - self.t0) / (self.t1 - self.t0))
        q = 0.6 * q + 0.4 * (q * q * (3 - 2 * q))      # mostly-constant sweep speed
        delta = self.d - q * self.L                     # >0 = ahead of the head
        lead, tail = 0.55 * self.sigma, 0.9 * self.sigma
        head = np.where(delta > 0, np.exp(-0.5 * (delta / lead) ** 2),
                        np.exp(-0.5 * (delta / tail) ** 2)).astype(np.float32)
        behind = (delta <= 0).astype(np.float32) * self.hold
        x0, y0, x1, y1 = self.bb
        m_head = np.zeros((y1 - y0, x1 - x0), np.float32)
        m_hold = np.zeros_like(m_head)
        for i in np.nonzero(np.maximum(head, behind) > 0.03)[0]:
            cx = int(round(self.samples[i, 0])) - x0
            cy = int(round(self.samples[i, 1])) - y0
            ys, xs = slice(cy - self.kr, cy + self.kr + 1), slice(cx - self.kr, cx + self.kr + 1)
            if head[i] > 0.03:
                np.maximum(m_head[ys, xs], self.kern * head[i], out=m_head[ys, xs])
            if behind[i] > 0:
                np.maximum(m_hold[ys, xs], self.kern * behind[i], out=m_hold[ys, xs])
        halo = np.clip(m_head * self.halo_head + m_hold * self.halo_hold, 0, 0.40)
        return e * (np.maximum(m_head, m_hold) * self.ink * 0.95 + halo * (1 - self.ink))


class ArrowPulse:
    """Translucent scaled copy of the arrow's own pixels, breathing over the
    original. Saturation-masked so only the colored arrowhead is lifted, then
    tight-cropped and scaled about its geometric center: at scale 1 the copy
    sits exactly on the original, and growth is concentric, never offset."""
    def __init__(self, box, arr):
        x0, y0, x1, y1 = [int(v) for v in box]
        sub = arr[y0:y1, x0:x1]
        mask = _feather(((sub.max(2) - sub.min(2)) > 45).astype(np.float32), 1)
        a = (np.clip(mask, 0, 1) * 255).astype(np.uint8)
        im = Image.fromarray(np.dstack([sub.astype(np.uint8), a]), "RGBA")
        bb = im.getchannel("A").getbbox()
        self.im = im.crop(bb)
        self.cx = x0 + (bb[0] + bb[2]) / 2
        self.cy = y0 + (bb[1] + bb[3]) / 2

    def paste(self, img, p, max_scale, alpha):
        if p < 0.02:
            return
        s = 1 + (max_scale - 1) * p
        w, h = self.im.size
        sp = self.im.resize((round(w * s), round(h * s)), Image.LANCZOS)
        fade = alpha * min(1.0, p / 0.15) ** 0.7       # fast ramp in, solid through apex
        sp.putalpha(sp.getchannel("A").point(lambda v: round(v * fade)))
        img.paste(sp, (round(self.cx - sp.width / 2), round(self.cy - sp.height / 2)), sp)


def render_slots(cfg, out_path, fps, scale, keep_frames, scratch):
    base = Image.open(cfg["base"]).convert("RGB")
    W, H = base.size
    arr = np.asarray(base, np.float32)
    overlays = load_overlays(cfg, W)

    gs = cfg.get("glow_style", {})
    ring_w, feather = gs.get("ring_w", 6), gs.get("feather", 4)
    ring_a, fill_a = gs.get("ring_alpha", 0.5), gs.get("fill_alpha", 0.05)

    slots = cfg["slots"]
    total = sum(s["frames"] for s in slots)

    glow = []                                       # per slot: local ring/fill masks
    for s in slots:
        items = []
        g = s.get("glow")
        if g:
            col = np.asarray(g["color"], np.float32)
            for box in g["boxes"]:
                x0, y0, x1, y1 = [int(v) for v in box]
                pad = feather + 2
                bx0, by0 = max(0, x0 - pad), max(0, y0 - pad)
                bx1, by1 = min(W, x1 + pad), min(H, y1 + pad)
                shape = (by1 - by0, bx1 - bx0)
                lbox = [x0 - bx0, y0 - by0, x1 - bx0, y1 - by0]
                rad = g.get("radius", 40)
                items.append(((bx0, by0, bx1, by1),
                              rring(shape, lbox, rad, ring_w, feather),
                              rrect_fill(shape, lbox, rad, feather), col))
        glow.append(items)

    traces = [[Trace(t, arr, H, W) for t in s.get("traces", [])] for s in slots]

    ac = cfg.get("arrows", {})
    pulses = [ArrowPulse(b, arr) for b in ac.get("boxes", [])]
    period = ac.get("period_frames", max(1, total // 3))
    amax, aalpha = ac.get("max_scale", 1.3), ac.get("alpha", 0.5)

    ffdir = os.path.join(scratch, "frames")
    if os.path.isdir(ffdir):
        shutil.rmtree(ffdir)
    os.makedirs(ffdir)

    fi = 0
    for si, s in enumerate(slots):
        dur = s["frames"]
        for i in range(dur):
            frame = arr.copy()
            k = math.sin(math.pi * (i + 0.5) / dur)
            for (bx0, by0, bx1, by1), ring, fill, col in glow[si]:
                sub = frame[by0:by1, bx0:bx1]
                # lerp toward the accent, not additive: additive is invisible on
                # a white/light base, this page's gutters included
                w = (ring * ring_a + fill * fill_a) * k
                sub += (col[None, None, :] - sub) * w[..., None]
            u_slot = (i + 0.5) / dur
            for tr in traces[si]:
                gm = tr.gain(u_slot)
                if gm is not None:
                    x0, y0, x1, y1 = tr.bb
                    sub = frame[y0:y1, x0:x1]
                    sub += (tr.color[None, None, :] - sub) * gm[..., None]
            img = Image.fromarray(frame.astype(np.uint8), "RGB")
            p = 0.5 * (1 - math.cos(2 * math.pi * fi / period))
            for ap in pulses:
                ap.paste(img, p, amax, aalpha)
            for oi, ox, oy in overlays:
                img.paste(oi, (ox, oy), oi)
            if scale != 1.0:
                img = img.resize((round(W * scale), round(H * scale)), Image.LANCZOS)
            img.save(os.path.join(ffdir, f"f{fi:03d}.png"))
            fi += 1

    _encode_gif(ffdir, out_path, fps)
    print(f"  {total} frames, {len(slots)} slots, {len(pulses)} arrows, {fps} fps")
    if not keep_frames:
        shutil.rmtree(ffdir)


# ---- built-in config: LLM-vs-SLM infographic ------------------------------

def demo_config():
    comp_x = (368, 686)                              # comparison-table cell width
    rows = [(170, 238), (238, 303), (303, 366), (366, 433), (433, 498), (498, 566)]
    pipe = [(30, 140), (145, 262), (277, 393), (409, 525),
            (532, 648), (654, 770), (777, 893), (902, 1018)]
    ind = [(26, 192), (200, 362), (370, 520), (528, 676), (684, 852), (860, 1031)]
    return {
        "base": "images/LLM vs SLM Infographic.png",
        "beat_frames": 6,
        "glow": {"ring_w": 5, "feather": 2, "ring_alpha": 0.85, "fill_alpha": 0.10},
        "sequence": [
            {"boxes": [[17, 150, 369, 642]], "beats": 2, "radius": 20},        # LLMs panel
            {"boxes": [[692, 150, 1036, 642]], "beats": 2, "radius": 20},      # SLMs panel
            {"boxes": [[comp_x[0], y0, comp_x[1], y1] for y0, y1 in rows],
             "beats": 0.5, "radius": 8},                                       # 6 comparison pills
            {"boxes": [[x0, 953, x1, 1090] for x0, x1 in pipe],
             "beats": 0.5, "radius": 12},                                      # 8 training cards
            {"boxes": [[x0, 1246, x1, 1410] for x0, x1 in ind],
             "beats": 1, "radius": 14},                                        # 6 industry cards
        ],
        "overlays": [
            {"image": "images/logo-nav-new.png", "x": 22, "cy": 120, "h": 40},
            {"image": "images/LinkedIn Signature Chip.jpeg", "right": 22, "cy": 121, "h": 34},
        ],
    }


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--config", default="")
    ap.add_argument("--out", default="llm-vs-slm-linkedin.gif")
    ap.add_argument("--fps", type=int, default=20)
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--keep-frames", action="store_true")
    ap.add_argument("--scratch", default=os.environ.get("TMPDIR", "."))
    ap.add_argument("--grid", action="store_true", help="write a coordinate grid overlay and exit")
    ap.add_argument("--base", default="", help="base image for --grid (else config/demo base)")
    a = ap.parse_args()
    if a.grid:
        base = a.base or (json.load(open(a.config))["base"] if a.config else demo_config()["base"])
        write_grid(base, a.out if a.out.endswith((".png", ".jpg")) else "grid.png")
        sys.exit(0)
    cfg = json.load(open(a.config)) if a.config else demo_config()
    if "slots" in cfg:
        render_slots(cfg, a.out, a.fps, a.scale, a.keep_frames, a.scratch)
    else:
        render(cfg, a.out, a.fps, a.scale, a.keep_frames, a.scratch)
