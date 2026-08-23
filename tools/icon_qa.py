#!/usr/bin/env python3
"""Island Mountain icon QA gate.

Run against any candidate icon BEFORE it enters images/. Every check is derived
from the existing 41-icon library, so passing means the new art sits inside the
house style rather than beside it.

    python tools/icon_qa.py path/to/candidate.webp
    python tools/icon_qa.py images/*.webp --quiet     # audit the whole library

Exit code 0 = pass, 1 = at least one failure. Wire it into the loop; do not
eyeball it.
"""
import sys, os, glob
import numpy as np
from PIL import Image
from scipy import ndimage

SIZE = 208
VIEW = 104                      # the largest slot the site renders an icon at

# Thresholds recalibrated against the canonical set produced by icon_ingest.py
# (208px, fill 0.85, stroke normalized to ~2.9px@208), set just outside the
# observed 5th/95th percentiles so a conforming icon passes and drift trips.
# The site removed the icon drop-shadow in 2026-07 — weight now lives in the
# stroke, so stroke width and fill are the load-bearing gates: they are what
# catch the batch-to-batch thickness and size drift.
#
# NEW art should be run THROUGH icon_ingest.py, not hand-aimed at these numbers.
GATES = {
    'solidity_min': 0.30,       # share of inked pixels still solid white at 104px
    'ink_min': 0.090,           # too little and the icon reads as empty
    'ink_max': 0.30,            # too much and it reads as a filled block
                                # (widened .275 -> .30, 2026-08-08: dense generated
                                # sources; legibility is solidity's job, not this)
    'fill_max': 0.88,           # art must leave a margin round the canvas
    'fill_min': 0.82,           # icon_ingest fits to ~0.85; below this it never
                                # went through the tool
    'stroke_min': 2.2,          # wire-line width @208; thinner = un-normalized
    'stroke_max': 4.6,          # thicker = un-normalized, or a filled (ic-*) style
    'alpha_edge_max': 0.002,    # background must be genuinely transparent
}
TARGET = {'solidity': 0.43, 'ink': 0.18, 'fill': 0.85, 'stroke': 2.9}   # canonical medians


def check(path):
    fails, warns, stats = [], [], {}
    im = Image.open(path)

    if 'A' not in im.getbands():
        return ['no alpha channel: background is not transparent'], [], {}
    im = im.convert('RGBA')

    if im.size != (SIZE, SIZE):
        fails.append('size %dx%d, must be %dx%d' % (im.size[0], im.size[1], SIZE, SIZE))

    a = np.asarray(im.getchannel('A'), dtype=float) / 255.0
    rgb = np.asarray(im.convert('RGB'), dtype=float)

    # --- transparent ground: the 2px border must be empty
    edge = np.concatenate([a[:2].ravel(), a[-2:].ravel(), a[:, :2].ravel(), a[:, -2:].ravel()])
    stats['alpha_edge'] = float(edge.mean())
    if stats['alpha_edge'] > GATES['alpha_edge_max']:
        fails.append('background not transparent at the edge (mean alpha %.4f)' % stats['alpha_edge'])

    ink = a > 0.15
    stats['ink'] = float(ink.mean())
    if stats['ink'] < GATES['ink_min']:
        fails.append('too sparse: ink coverage %.3f < %.3f' % (stats['ink'], GATES['ink_min']))
    elif stats['ink'] > GATES['ink_max']:
        fails.append('too dense: ink coverage %.3f > %.3f' % (stats['ink'], GATES['ink_max']))

    # --- wire-line weight: uniform stroke is the canonical control now the glow
    #     is gone. 2x mean distance-to-edge over the inked region = mean width.
    solid = a > 0.5
    stats['stroke'] = float(2 * ndimage.distance_transform_edt(solid)[solid].mean()) if solid.any() else 0.0
    if stats['stroke'] < GATES['stroke_min']:
        fails.append('wire lines too thin: stroke %.1f < %.1f px, run icon_ingest.py'
                     % (stats['stroke'], GATES['stroke_min']))
    elif stats['stroke'] > GATES['stroke_max']:
        fails.append('wire lines too thick: stroke %.1f > %.1f px (un-normalized or a filled style)'
                     % (stats['stroke'], GATES['stroke_max']))

    # --- framing: art centred with a real margin
    ys, xs = np.nonzero(ink)
    if len(xs) == 0:
        return ['image is empty'], [], stats
    bw = (xs.max() - xs.min() + 1) / SIZE
    bh = (ys.max() - ys.min() + 1) / SIZE
    stats['fill'] = float(max(bw, bh))
    if stats['fill'] > GATES['fill_max']:
        fails.append('art runs to the edge: fills %.2f of canvas, max %.2f'
                     % (stats['fill'], GATES['fill_max']))
    elif stats['fill'] < GATES['fill_min']:
        warns.append('art is small in frame: fills %.2f' % stats['fill'])

    cx, cy = (xs.min() + xs.max()) / 2, (ys.min() + ys.max()) / 2
    off = max(abs(cx - SIZE / 2), abs(cy - SIZE / 2)) / SIZE
    stats['offcentre'] = float(off)
    if off > 0.06:
        warns.append('art is off-centre by %.0f%% of the canvas' % (off * 100))

    # --- linework must be white; the site forces it anyway, but drift shows here
    lit = rgb[ink]
    if lit.size:
        stats['rgb_min'] = float(lit.min())
        if stats['rgb_min'] < 200:
            warns.append('linework is not pure white (darkest channel %d); '
                         'run the luminance-key step' % int(stats['rgb_min']))

    # --- legibility: does the stroke survive the downsample to 104px
    small = np.asarray(Image.fromarray((a * 255).astype('uint8')).resize((VIEW, VIEW), Image.LANCZOS))
    s_ink = small[small > 25]
    stats['solidity'] = float((s_ink > 200).sum() / max(1, s_ink.size))
    if stats['solidity'] < GATES['solidity_min']:
        fails.append('illegible at 104px: solidity %.2f < %.2f, strokes too thin '
                     'or the art is too busy' % (stats['solidity'], GATES['solidity_min']))

    return fails, warns, stats


def main(argv):
    quiet = '--quiet' in argv
    paths = []
    for a in argv:
        if a.startswith('--'):
            continue
        paths.extend(glob.glob(a))
    if not paths:
        print(__doc__)
        return 1

    bad = 0
    for p in sorted(paths):
        fails, warns, st = check(p)
        name = os.path.basename(p)
        if fails:
            bad += 1
            print('FAIL  %s' % name)
            for f in fails:
                print('        %s' % f)
            for w in warns:
                print('        note: %s' % w)
        elif warns and not quiet:
            print('PASS  %-38s stroke %.1f  solidity %.2f  ink %.3f  fill %.2f'
                  % (name, st.get('stroke', 0), st.get('solidity', 0), st.get('ink', 0), st.get('fill', 0)))
            for w in warns:
                print('        note: %s' % w)
        elif not quiet:
            print('PASS  %-38s stroke %.1f  solidity %.2f  ink %.3f  fill %.2f'
                  % (name, st.get('stroke', 0), st.get('solidity', 0), st.get('ink', 0), st.get('fill', 0)))

    print('\n%d checked, %d failed' % (len(paths), bad))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
