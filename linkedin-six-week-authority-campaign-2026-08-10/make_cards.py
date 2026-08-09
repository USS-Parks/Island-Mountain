"""Render LinkedIn icon cards: solid high-contrast ground, native-resolution icon
(no resampling, which is where the blur came from), split title top and bottom in
Space Grotesk bold caps with an oblique shear. Output: cards/linkedin-NN-*-card.png."""

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
SITE = ROOT.parent
MASTERS = SITE / "icons" / "masters"
OUT = SITE / "cards"  # cards live at the repo root since 2026-08-09
FONT_PATH = SITE / "fonts" / "space-grotesk-latin.woff2"

CANVAS = 2048
MARGIN_X = 96
SHEAR = 0.18
WHITE = (255, 255, 255, 255)

# post id: (master slug, top line, bottom line, background hex)
CARDS = {
    "01": ("smaller-system", "THE SMALLER SYSTEM", "IS OFTEN THE HONEST ANSWER.", "#5B8DEF"),
    "02": ("compliance-risk", "THE COMPLIANCE OFFICER", "KNOWS WHERE THE RISK LIVES.", "#C0392B"),
    "03": ("facility-survey", "THE FACILITY SURVEY", "CAN SINK A GOOD DEPLOYMENT.", "#1E8449"),
    "04": ("onboarding-work", "ONBOARDING", "IS PART OF THE SYSTEM.", "#7D3C98"),
    "05": ("discovery-gate", "DISCOVERY", "CAN KILL THE PROJECT.", "#B45309"),
    "06": ("docketing-clerk", "THE DOCKETING CLERK", "IS PART OF THE ARCHITECTURE.", "#1F618D"),
    "07": ("baa-architecture", "A BAA", "IS NOT AN ARCHITECTURE.", "#AD3B76"),
    "08": ("concurrency-workflow", "CONCURRENCY", "IS A WORKFLOW QUESTION.", "#148F77"),
    "09": ("deployment-departure", "A DEPLOYMENT", "SHOULD HAVE AN ENDING.", "#A04000"),
    "10": ("shadow-ai", "SHADOW AI", "USUALLY ARRIVES BEFORE POLICY.", "#34495E"),
    "11": ("sovereignty-requirements", "SOVEREIGNTY", "CHANGES THE REQUIREMENTS.", "#6E2C00"),
    "12": ("enrollment-context", "ENROLLMENT WORK", "IS MORE THAN RECORD MATCHING.", "#2471A3"),
    "13": ("cloud-contract", "READ THE CLOUD CONTRACT", "BESIDE THE ARCHITECTURE.", "#7D6608"),
    "14": ("aml-context", "AN ANOMALY SCORE", "CAN'T READ THE FLOOR.", "#4A235A"),
    "15": ("surveillance-memory", "SURVEILLANCE EXPERTISE", "IS INSTITUTIONAL MEMORY.", "#0E6655"),
}


def load_font(size):
    f = ImageFont.truetype(str(FONT_PATH), size)
    try:
        f.set_variation_by_axes([700])
    except Exception:
        pass
    return f


def text_layer(text, max_width, max_size, min_size=90):
    """Render sheared caps sized to fit max_width; returns trimmed RGBA layer."""
    size = max_size
    while size > min_size:
        font = load_font(size)
        stroke = max(2, size // 28)  # fatten toward the sample's weight
        bbox = ImageDraw.Draw(Image.new("RGBA", (8, 8))).textbbox(
            (0, 0), text, font=font, stroke_width=stroke)
        w = bbox[2] - bbox[0]
        if w + SHEAR * (bbox[3] - bbox[1]) <= max_width:
            break
        size -= 4
    font = load_font(size)
    stroke = max(2, size // 28)
    pad = int(SHEAR * size * 2) + stroke * 2 + 8
    probe = ImageDraw.Draw(Image.new("RGBA", (8, 8))).textbbox(
        (0, 0), text, font=font, stroke_width=stroke)
    w, h = probe[2] - probe[0], probe[3] - probe[1]
    layer = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(layer).text((pad - probe[0], pad - probe[1]), text, font=font,
                               fill=WHITE, stroke_width=stroke, stroke_fill=WHITE)
    sheared = layer.transform(
        (layer.width + int(SHEAR * layer.height), layer.height),
        Image.AFFINE, (1, SHEAR, -SHEAR * layer.height, 0, 1, 0),
        resample=Image.BICUBIC)
    return sheared.crop(sheared.getbbox())


def make_card(pid, slug, top, bottom, bg):
    card = Image.new("RGBA", (CANVAS, CANVAS), bg)
    icon = Image.open(MASTERS / f"linkedin-{pid}-{slug}-icon.png").convert("RGBA")
    assert icon.width <= CANVAS, "icon larger than canvas"
    # native paste: no resampling anywhere near the icon
    card.paste(icon, ((CANVAS - icon.width) // 2, (CANVAS - icon.height) // 2), icon)

    t = text_layer(top, CANVAS - 2 * MARGIN_X, 250)
    b = text_layer(bottom, CANVAS - 2 * MARGIN_X, 175)
    top_y = (((CANVAS - icon.height) // 2) - t.height) // 2
    bot_y = CANVAS - (((CANVAS - icon.height) // 2) - b.height) // 2 - b.height
    card.alpha_composite(t, ((CANVAS - t.width) // 2, max(40, top_y)))
    card.alpha_composite(b, ((CANVAS - b.width) // 2, min(CANVAS - b.height - 40, bot_y)))

    out = OUT / f"linkedin-{pid}-{slug}-card.png"
    card.convert("RGB").save(out, "PNG")
    return out


def contact_sheet(paths):
    cell = 512
    cols, rows = 5, 3
    sheet = Image.new("RGB", (cols * cell, rows * cell), "#0f172a")
    for i, p in enumerate(paths):
        img = Image.open(p).resize((cell, cell), Image.LANCZOS)
        sheet.paste(img, ((i % cols) * cell, (i // cols) * cell))
    out = OUT / "cards-contact-sheet.png"
    sheet.save(out, "PNG")
    return out


def main():
    OUT.mkdir(exist_ok=True)
    made = []
    for pid, (slug, top, bottom, bg) in CARDS.items():
        p = make_card(pid, slug, top, bottom, bg)
        made.append(p)
        print(f"{p.name}  {Image.open(p).size}")
    print(contact_sheet(made).name)
    print(f"{len(made)} cards")


if __name__ == "__main__":
    main()
