import glob
from PIL import Image

frames = sorted(glob.glob('frames/f*.png'))
print(f'{len(frames)} frames')

# Build one adaptive palette from a composite of sample frames so every
# highlight colour (black/blue/red/green) is represented, then quantize all
# frames to it for a stable, flicker-free GIF.
sample = Image.open(frames[0]).convert('RGB')
strip = Image.new('RGB', (sample.width, sample.height * 4))
for i, idx in enumerate([0, 40, 90, 140]):
    strip.paste(Image.open(frames[idx]).convert('RGB'), (0, sample.height * i))
pal = strip.quantize(colors=256, method=Image.MEDIANCUT)

out = []
for f in frames:
    im = Image.open(f).convert('RGB')
    out.append(im.quantize(palette=pal, dither=Image.NONE))

out[0].save(
    'mfa-node-animation.gif',
    save_all=True,
    append_images=out[1:],
    duration=80,   # 12.5 fps
    loop=0,
    optimize=True,
)
import os
print('bytes:', os.path.getsize('mfa-node-animation.gif'))
