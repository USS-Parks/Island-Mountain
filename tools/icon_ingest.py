#!/usr/bin/env python3
"""Turn a generated raster into a house-standard Island Mountain icon.

The image generator produces white linework on a solid black ground. This does
the rest in one step, so nobody re-derives it and drifts:

  luminance -> alpha   (black ground becomes transparent, keeps antialiasing)
  RGB       -> pure white
  canvas    -> square, art centred with a margin
  size      -> 208 x 208
  save      -> lossless webp, alpha preserved

    python tools/icon_ingest.py raw/document-drafting.png images/document-drafting-icon.webp

Then run tools/icon_qa.py on the output before it goes anywhere near a page.
"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter

SIZE = 208
MARGIN = 0.07          # share of canvas left empty on the tightest side
TARGET_SOLIDITY = 0.41  # library median


def solidity(alpha_img):
    small = np.asarray(alpha_img.resize((104, 104), Image.LANCZOS))
    ink = small[small > 25]
    return (ink > 200).sum() / max(1, ink.size)


def ingest(src, dst):
    im = Image.open(src).convert('RGB')

    # --- luminance keyed to alpha: white line stays, black ground goes
    lum = im.convert('L')
    a = np.asarray(lum, dtype=np.float32) / 255.0
    # lift near-black noise to a clean zero so the ground is genuinely empty
    a = np.clip((a - 0.06) / 0.94, 0, 1)
    alpha = Image.fromarray((a * 255).astype('uint8'))

    # --- crop to the art, then re-centre on a square canvas with a margin
    bbox = alpha.point(lambda v: 255 if v > 38 else 0).getbbox()
    if bbox is None:
        raise SystemExit('%s: no linework found. Was it white on black?' % src)
    alpha = alpha.crop(bbox)

    inner = int(SIZE * (1 - 2 * MARGIN))
    alpha.thumbnail((inner * 4, inner * 4), Image.LANCZOS)   # work large, resize once

    # --- stroke weight: dilate at working size so nothing thins to grey at 104px
    work = alpha.copy()
    for k in (1, 3, 5, 7):
        test = work if k == 1 else work.filter(ImageFilter.MaxFilter(
            max(1, (int(round(k * work.size[0] / 1254)) | 1))))
        cand = Image.new('L', (SIZE, SIZE), 0)
        t = test.copy()
        t.thumbnail((inner, inner), Image.LANCZOS)
        cand.paste(t, ((SIZE - t.size[0]) // 2, (SIZE - t.size[1]) // 2))
        if solidity(cand) >= TARGET_SOLIDITY or k == 7:
            final = cand
            chosen = k
            break

    out = Image.merge('RGBA', (Image.new('L', (SIZE, SIZE), 255),) * 3 + (final,))
    os.makedirs(os.path.dirname(dst) or '.', exist_ok=True)
    out.save(dst, 'WEBP', lossless=True, quality=100, method=6)
    print('%s -> %s  (dilation k=%d, solidity %.2f)'
          % (os.path.basename(src), dst, chosen, solidity(final)))


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(1)
    ingest(sys.argv[1], sys.argv[2])
