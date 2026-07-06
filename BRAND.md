# Island Mountain — Brand & Style Guide

Canonical reference for the **islandmountain.io** brand system and the repeatable
processes used to build and maintain it. When a visual decision or a production
task recurs, it should be answered here rather than re-derived.

- **Part I — Brand reference:** the design tokens, components, and rules.
- **Part II — Process How-To's:** step-by-step methods (with real commands).

Companion docs: **CANON.md** (project doctrine), **CONVENTIONS.md** / **ARCHITECTURE.md**
(code), **SESSION-RULES.md** (file-integrity protocol), **SEO-STATE.md** (schema/SEO state),
**VIDEO_BRANDING_WORKFLOW.md** (full video-branding recipe).
Every value below is pulled from the live stylesheets (`css/style.css`, `css/aurora.css`,
`css/card-nodes.css`); if the code changes, update this file in the same commit.

---

## Table of contents

**Part I — Brand reference**
1. [Brand essence & positioning](#1-brand-essence--positioning)
2. [Voice & tone](#2-voice--tone)
3. [Logos](#3-logos)
4. [Color](#4-color)
5. [Typography](#5-typography)
6. [Iconography](#6-iconography)
7. [Cards](#7-cards)
8. [Buttons & links](#8-buttons--links)
9. [Motion](#9-motion)
10. [Surfaces & tokens](#10-surfaces--tokens)
11. [Imagery & video](#11-imagery--video)

**Part II — Process How-To's**
- A. [Asset production](#a-asset-production)
- B. [Markup templates](#b-markup-templates)
- C. [Build, delivery & deploy](#c-build-delivery--deploy)
- D. [Verification / QA](#d-verification--qa)

---

# Part I — Brand reference

## 1. Brand essence & positioning

Island Mountain builds **sovereign AI infrastructure for regulated organizations** —
every workstation its own air-gappable server, with the Woven Security & Governance
Fabric built in. Hand-built in California.

- **Products:** **Summit** (the on-prem NVIDIA RTX PRO 6000 Blackwell hardware),
  the **Woven Security & Governance Fabric** (trust plane), and the **Console**
  (build codename *Lamprey*, public name *Aeneas*).
- **Audience:** regulated and sovereignty-sensitive buyers — tribal governments,
  healthcare, legal, defense/ITAR, higher-ed, public sector.
- **The through-line:** custody. Deployment details, evidence, credentials, and
  audit records stay inside the customer's boundary.

## 2. Voice & tone

Direct, technical, and declarative. Confident without hype. We describe what the
product *does* and *constrains*, not what it "empowers."

- **Plain declaratives over marketing verbs.** "Attacks ride the same rails; the
  fabric is where they stop." "Least privilege is a product constraint, not a
  dashboard label."
- **Regulated-industry literate.** Name the real frameworks — HIPAA, ITAR/CMMC,
  the CLOUD Act, OCAP — without over-explaining them.
- **No sales fluff.** "One builder, one phone call, real answers — no sales pitch."
- **Custody-first framing.** Lead with what stays in the customer's control.
- **Sentence case** for UI and most headings; the wordmark is the only all-caps.

Avoid: exclamation marks, "revolutionary/cutting-edge/empower/unlock," vague
benefit claims, and anything that implies data leaves the boundary.

## 3. Logos

| Use | File | Size | Notes |
|-----|------|------|-------|
| Nav (all pages) | `images/logo-nav-new.webp` | 205×65 | Horizontal lockup, `alt="Island Mountain"` |
| Footer badge | `images/im-badge.webp` | 200×183 | Stacked mark |
| Favicon (ICO) | `favicon.ico` | — | Referenced with `?v=` cache key |
| Favicon (PNG) | `images/favicon-32.png` | 32×32 | |
| Apple touch | `images/apple-touch-icon.png` | 180×180 | |
| Hi-res source | `Island Mountain Metal Logo.png`, `Island Mountain Logo 3.png`, `IM-transparent-logo-2.png` | large | Source art — do not ship raw; export to sized webp |
| Sub-brand | `LAMPREY MAI LOGO WITH WORDS.png`, `Lamprey MAI logo series.png` | large | Lamprey/Aeneas console mark |

**The mark:** a stylized mountain over a rising sun, in a roundel. The wordmark is
`ISLAND MOUNTAIN` with the **AI** in `MOUNTAIN` picked out in copper/red.

**Rules**
- Nav always uses the horizontal webp lockup at its declared `width`/`height`.
- Keep clear-space around the mark ≈ the height of the sun element on all sides.
- Don't recolor, stretch, add glow/shadow, or place the transparent mark on a
  low-contrast ground. On busy imagery, use the roundel version.
- Ship webp at the display size (never a multi-MB PNG in the page).

## 4. Color

The palette is **copper-on-dark**: a warm copper/amber accent spine over deep
navy-slate grounds, with slate neutrals and a single red alert accent.

### Copper spine (accent)
| Token | Hex | Use |
|-------|-----|-----|
| `--copper` / `--au-copper` / `--amber` | `#f59e0b` | Primary accent, eyebrows, links, primary button |
| `--copper-light` / `--au-copper-light` | `#fbbf24` | Hover/bright accent, on-dark eyebrow |
| `--copper-deep` / `--au-copper-deep` / `--amber-deep` | `#d97706` | Gradient end, pressed |
| `--copper-darker` | `#b45309` | Deep tint backgrounds |
| `--copper-glow` | `rgba(245,158,11,.25)` | Focus/glow washes |
| `--au-white-hot` | `#fff7ed` | Hottest highlight |

### Dark grounds
| Token | Hex | Use |
|-------|-----|-----|
| `--au-ink` | `#080d18` | Deepest background |
| `--primary-dark` / `--au-slate` | `#0f172a` | Page background |
| `--au-slate-3` | `#0d1424` | Section alt |
| `--au-slate-2` | `#131c31` | Card ground (aurora) |
| `--secondary-dark` / `--card-bg-solid` / `--text-dark` | `#1e293b` | Panels, solid cards |
| `--tertiary-dark` | `#334155` | Raised surface |
| `--hero-bg-warm` / `--hero-bg-mid` | `#1a1608` / `#1e1b0e` | Warm hero grounds |

### Neutrals, text & lines
| Token | Hex / value | Use |
|-------|-------------|-----|
| `--text-light` | `#f1f5f9` | Primary text on dark |
| `--slate-300` | `#cbd5e1` | Secondary text |
| `--text-muted` / `--slate-400` | `#94a3b8` | Muted text |
| `--au-muted` | `#93a3ba` | Muted (aurora) |
| `--slate-500` | `#64748b` | Faint text |
| `--white` | `#ffffff` | Pure white (icons, hero H1) |
| `--card-bg` | `rgba(30,41,59,.7)` | Glass card fill |
| `--card-border` | `rgba(148,163,184,.12)` | Card border |
| `--au-line` | `rgba(148,163,184,.14)` | Hairline/divider |
| `--red-accent` | `#ef4444` | The **only** alert/error accent |

### Canonical-token note (important)
The palette exists in **two variable families** that resolve to the **same hex**:
`--copper` (in `css/style.css`, the component library) and `--au-copper` (in
`css/aurora.css`, the aurora sections). **The hex values are canonical; the two
families are aliases.** Use `--au-*` inside aurora-styled sections and `--*` in the
legacy component library, but **never introduce a third value** for an existing
color. If you must add a color, add it to both families with one shared hex and
document it here.

## 5. Typography

- **Display / headings:** `Space Grotesk` (fallback `Inter`, `system-ui`), weight
  **700–800**, tight tracking (`-.01em` to `-.02em`).
- **Body / UI:** `Inter`, `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
  sans-serif`, weight **400**, **600** for emphasis/buttons.
- **Glyphs:** Remix Icon (`ri-*-line`), loaded via `icons/remixicon.css`.

### Scale
| Role | Size | Weight |
|------|------|--------|
| Hero H1 (`.au-h1`) | `clamp(2.6rem, 6vw, 4.5rem)` | 700–800 |
| H1 (base) | `3.2rem` (→ 2.3–2.85 mobile) | 700 |
| Section H2 (`.au-h2`) | `clamp(1.85rem, 3.6vw, 2.7rem)` | 800 |
| H2 (base) | `2.4rem` (→ 2rem mobile) | 700 |
| H3 | `1.5rem` / `1.14rem` (au-card) | 600–700 |
| Body | `0.95–1.05rem`, line-height `1.7` | 400 |
| **Eyebrow** (`.au-eyebrow-c`) | `0.75rem`, `letter-spacing:.24em`, UPPERCASE, copper | 700 |
| **Section badge** (`.section-badge`) | `0.75rem`, `letter-spacing:2px`, UPPERCASE | 600 |

Eyebrows/badges are the copper "kicker" above a heading. Body copy is muted slate
(`--text-muted`) on dark; headings are `#fff` / `--text-light`.

## 6. Iconography

**Style:** white line-art on transparent, frequently carrying the IM sunburst.
Stored as **1254×1254 webp** with luminance-based alpha (86–92% transparent, opaque
pixels pure white). ~33 icons in the set (`images/*-icon.webp`).

**Sizing & placement**
| Class | Display | Layout |
|-------|---------|--------|
| `.au-ic` | 54×54, `margin:0 auto 16px` | Centered over text (aurora cards) |
| `.card-icon-im` | `width:100%; max-width:210px; margin:0 auto 20px` | Large centered image icon (Explore cards) |
| `.au-vcard-icon` | `width/height 72` | Vertical-card overlay badge |
| `.card-icon` | 48×48 tinted rounded badge | Remix glyph inside (legacy) |

All image icons: `object-fit:contain`, `alt=""` (decorative — the `<h3>` labels it),
`loading="lazy" decoding="async"`. Icons sit **centered above** the text, no badge
background. To produce a new one, see [How-To A1](#a1-icon--transparent--webp).

## 7. Cards

Several families share one look (dark glass, hairline border, rounded, hover-lift)
and one animation ([beam-card](#9-motion)).

| Family | Where | Alignment |
|--------|-------|-----------|
| `.card` | Component library (Explore-the-Platform, pricing, etc.) | left; padding 32px, radius 12px |
| `.au-card` | Aurora sections (capabilities grids) | **center**; padding 28×24, radius 16px |
| `.au-vcard` | Vertical/industry cards (image + overlay icon) | — |
| `.gpu-card`, `.risk-card`, `.faq-item`, `.woven-panel` | Specialized | — |

**`.card` anatomy:** `background:var(--card-bg)` (glass, `blur(16px)`), `border:
var(--card-border)`, `border-radius:var(--border-radius)` (12px), `padding:32px`;
hover `translateY(-4px)` + `0 12px 40px rgba(0,0,0,.3)` + copper border.

**When to use which:** stay within the family already in the section. `.au-card`
centers its content (icon + title + text); `.card` is left-aligned unless given a
centered image icon (`.card-icon-im`). Don't mix `.card` and `.au-card` in one grid.
Card templates: [How-To B6](#b6-card-templates).

## 8. Buttons & links

- **`.btn`** — base: `padding:14px 32px; border-radius:8px; font-weight:600;`
- **`.btn-primary`** — copper gradient `linear-gradient(135deg, var(--copper),
  var(--copper-deep))`, white text, glow `0 4px 20px rgba(245,158,11,.35)`; hover
  lifts and intensifies the glow. Primary CTA only.
- **`.btn-secondary`** — outline/glass: translucent white border, `backdrop-blur`;
  hover fills to `rgba(255,255,255,.15)`. Used for card CTAs and secondary actions.
- **Inline links** — `class="clr-copper"` on marketing pages; **plain `<a>`** (no
  class) inside blog-post prose. Never underline-only in copper on dark without the
  class (contrast).

Pills/tags: `.feature-tag` (copper outline, radius 20px), `.recommend-badge`
(solid copper on dark, uppercase).

## 9. Motion

Restrained, purposeful, and **always disabled under `prefers-reduced-motion`.**

- **Node animation (`beam-card`)** — `css/card-nodes.css` + `js/card-nodes.js`. A
  hollow white ring (12px) rides the **top edge then down the right edge**, once,
  when the card first scrolls into view (`@keyframes auEdgeNode`, 2.8s linear). A
  per-card `--i` staggers a group's cascade (`delay: calc(var(--i) * 0.6s)`); the
  JS arms each `.beam-card` via IntersectionObserver and sets `--i` (rolling, cap 8).
  This is the **house treatment for every icon card** — see [How-To B7](#b7-node-beam-card-animation).
- **Reveal (`au-reveal`)** — `opacity:0` → `auRise .72s cubic-bezier(.22,.61,.36,1)`
  when `.in` is added on scroll; `au-stagger` cascades children.
- **Transitions** — global `--transition-speed: 0.3s`; hover lifts are `translateY(-2px…-4px)`.

## 10. Surfaces & tokens

| Token | Value | Use |
|-------|-------|-----|
| `--border-radius-sm` | `8px` | Buttons, small controls |
| `--border-radius` | `12px` | Cards, panels |
| `--border-radius-lg` | `16px` | Aurora cards, media (video/infographic) |
| `--glass-blur` | `16px` | Card/nav backdrop-filter |
| `--transition-speed` | `0.3s` | Default transition |
| `--nav-height` | `80px` | Sticky nav |
| `--max-width` | `1200px` | Content container |

**Shadows:** card hover `0 12px 40px rgba(0,0,0,.3)`; elevated media / infographics
`0 24px 60px rgba(0,0,0,.5)`; copper CTA glow `0 4px 20px rgba(245,158,11,.35)`;
warm inset `inset 0 0 46px rgba(245,158,11,.06)`.

**Breakpoints:** desktop ≥769px (3-col grids); tablet → 2-col; phone (≤~500px) → 1-col.

## 11. Imagery & video

- **Photography:** product shots (`Island Mountain Summit Product *.png`) and vertical
  photos (`*-vertical.webp`) — real hardware and real environments, dark and grounded.
- **Video (`.au-infographic`)** — `width:100%; max-width:920px; border-radius:16px;`
  with hairline border + `0 24px 60px rgba(0,0,0,.5)` shadow. Always `autoplay muted
  loop playsinline preload="metadata"` with a `.webp` **poster** for first paint, and
  a descriptive `aria-label`. Encode per [How-To A2](#a2-video-for-web-au-infographic).
- **Embedded infographics on the dark theme:** flat-white raster/GIF infographics are
  **softened to ~78–85% opacity** so the dark ground shows through (hover returns to
  full on desktop). Don't drop a hard `#fff` rectangle onto the dark page — see
  [How-To A4](#a4-infographic-translucency).

---

# Part II — Process How-To's

Repeatable procedures. Commands are copy-pasteable. Tooling notes: this environment
has ImageMagick (`convert`/`identify`), `cwebp`, and `ffmpeg` available
(`apt-get install -y imagemagick webp`; `ffmpeg` via `imageio-ffmpeg` if the system
one is missing). Playwright/Chromium is preinstalled at `/opt/pw-browsers/chromium`.

## A. Asset production

### A1. Icon → transparent → webp

Source icons arrive as **white line-art on a solid (black) background**. Convert the
background to transparent using **luminance as the alpha channel** — this keeps the
white linework's anti-aliased edges clean (a flat `-transparent black` leaves gray
halos). Then encode lossless webp so the lines stay crisp.

```bash
# 1) solid-bg PNG -> transparent PNG (luminance -> alpha, force pure-white RGB)
convert input.png \( +clone -colorspace Gray \) -alpha off \
  -compose CopyOpacity -composite \
  -channel RGB -fill white -colorize 100 +channel \
  PNG32:name-icon-transparent.png

# 2) transparent PNG -> webp (lossless: crisp line-art + full alpha)
cwebp -quiet -lossless -alpha_q 100 name-icon-transparent.png -o images/name-icon.webp
```

**Verify:** `identify -format "%wx%h alpha=%A\n" images/name-icon.webp` → expect
`1254x1254 alpha=True`; opaque pixels should be pure white `[255,255,255]` (matches
the existing set). Keep the canvas 1254×1254 to match the library; CSS sizes it.
Place with `.au-ic` (54px) or `.card-icon-im` (≤210px centered).

### A2. Video for web (`.au-infographic`)

Target: small, seamless-looping, autoplay-friendly MP4 + a poster.

```bash
# encode from a frames dir (or -i source.mp4): H.264, web-safe pixel format,
# faststart (moov atom up front) so it plays before fully downloaded, no audio
ffmpeg -y -framerate 24 -i frames/f_%04d.png \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 20 -preset slow \
  -movflags +faststart -an video/name.mp4

# poster frame (last frame) -> webp
ffmpeg -y -sseof -0.3 -i video/name.mp4 -vframes 1 -c:v libwebp -quality 82 images/name-poster.webp
```

Then embed with the `.au-infographic` `<video>` (autoplay muted loop playsinline,
`poster="images/name-poster.webp"`, descriptive `aria-label`). `crf 20` is the
quality sweet spot for these; raise to 23 for lighter files.

### A3. Watermark removal

Two methods — pick by whether the corner content matters.

**Method 1 — full-frame masked inpaint (preferred; keeps the whole frame).**
The watermark is a *fixed screen-space overlay*, so no frame ever shows what's behind
it — reconstruct spatially, per frame:

1. Extract all frames (`ffmpeg -i src.mp4 -vsync 0 all/f_%04d.png`).
2. **Locate the static logo** by the temporal **minimum** across ~48 sampled frames
   (a persistent bright glyph survives the min; moving highlights wash out). Threshold
   → connected component → tight bbox → dilate a few px → full-frame mask PNG.
3. **Inpaint every frame** with the static mask: `cv2.inpaint(img, mask, 3,
   cv2.INPAINT_TELEA)` (Telea is crisp on structured backgrounds; NS is similar).
4. Re-encode per [A2](#a2-video-for-web-au-infographic).

**Method 2 — corner crop.** Only when nothing important lives in the corner:
`crop=W:H:x:y,scale=1280:720`. Faster, but it shifts framing — the user rejected this
for the Security Map video precisely because it clipped content. Default to Method 1.

Always **diff a corner crop of an original vs. cleaned frame** to confirm the glyph is
gone with no smudge before shipping.

> To **brand** a clip (corner logo, title card, fades) rather than just clean it,
> follow **VIDEO_BRANDING_WORKFLOW.md** — it carries the delogo box coordinates for
> the Gemini sparkle, the `logo-nav-new.png` corner overlay, the 2-second title card
> (Logo 3 on white, 0.4s fade-in), tail fades, and the `libx264 -crf 18 -preset slow`
> encode chain, with the `adelay`/`afade` audio handling for a prepended card.

### A4. Infographic translucency

Flat-white embedded infographics clash with the dark theme. Soften them (don't recut
the asset):

```css
/* scoped to the infographic wrapper, e.g. .woven-split-media img */
.woven-split-media img { opacity: .78; transition: opacity .3s ease; }        /* 78–85% */
.woven-split-media img:hover, .woven-split-media img:focus { opacity: 1; }      /* full on demand */
```

Because the images are dark-text-on-white, `opacity` (letting the dark ground show
through) reads as "frosted panel" and keeps text legible; a `mix-blend-mode` would
crush the dark labels. Verify legibility on the busiest card at the chosen value.

### A5. Raster optimization

- Convert PNG/JPG → webp: `cwebp -q 82 in.png -o images/out.webp` (lossless for
  line-art/transparency; `-q 80–85` for photos).
- Always set `width`/`height` on `<img>` (prevents CLS) and `loading="lazy"
  decoding="async"` for below-fold images.
- Ship at display size; never reference multi-MB source PNGs in a page.

### A6. GIF builds — float, recolor & export (`tools/gif_process.py`)

The repo's canonical animated-graphic pipeline (**"Aeneas GIF float"**). It takes a
GIF with a **light / white background** and floats it onto the dark theme: derive a
soft alpha by luminance-keying the light background out (`alpha = smoothstep(ink)`,
`ink = 255 − luminance`; anti-aliased edges preserved), recolor the content for
contrast, resize, and export animated **WebP** (8-bit alpha — preferred) or **GIF**
(1-bit alpha).

```bash
# float a light-bg GIF onto the dark page: white content, half size, animated webp
python tools/gif_process.py INPUT.gif images/name.webp --color white --scale 0.5

# copper content, exported as a 1-bit GIF instead
python tools/gif_process.py INPUT.gif images/name.gif --color copper --format gif
```

| Flag | Default | Purpose |
|------|---------|---------|
| `--color` | `white` | Recolor content: `white` (#f1f5f9), `copper` (#f59e0b), `gray`, `keep` (original), or `fire` (yellow→burnt-orange ramp keyed on ink density) |
| `--scale` | `0.5` | Resize factor |
| `--bg-cut` | `30` | Ink threshold below which pixels are background (removed) |
| `--span` | `45` | Smoothstep width for edge softness |
| `--format` | `webp` | `webp` (8-bit alpha, preferred) or `gif` (1-bit) |
| `--bg-alpha` | `0` | `0` = transparent bg; `>0` leaves the bg as translucent white at that alpha |
| `--round` | `0` | Round panel corners by radius (px, post-resize) |
| `--quality` | `0` | `0` = lossless webp; `1–100` = lossy |
| `--sharpen` | `0` | UnsharpMask percent (e.g. `140`) |

Precision knobs for protecting or recoloring one region (all coords in **original px**):
- `--mask "x0,y0,x1,y1;…"` — force-keep boxes.
- `--radial "cx,cy,r,bgcut[,feather]"` — raise the cutoff inside a circle (e.g. hold a faint central emblem the global cut would erase).
- `--accent "color,cx,cy,r[,feather]"` — recolor inside a circle.
- `--badge-auto "color,cx,cy"` — recolor the auto-tracked central badge every frame.
- `--effects-from N` — apply radial/accent only from frame N (after an intro settles).

**Prefer WebP** (8-bit alpha) for anything with soft edges or gradients — 1-bit GIF
alpha hard-edges the float and dithers gradients. Reach for `--format gif` only when a
literal `.gif` is required. Always verify the **loop**, **edge cleanliness**, and
**legibility on the dark card** before shipping.

**Video → GIF** (when a GIF must come from a clip): brand the MP4 per
`VIDEO_BRANDING_WORKFLOW.md`, then use ffmpeg's two-pass palette for a clean result:
```bash
ffmpeg -y -i branded.mp4 -vf "fps=15,scale=720:-1:flags=lanczos,palettegen" palette.png
ffmpeg -y -i branded.mp4 -i palette.png \
  -filter_complex "fps=15,scale=720:-1:flags=lanczos[x];[x][1:v]paletteuse" out.gif
```

## B. Markup templates

### B6. Card templates

**Component-library card (Explore-the-Platform), with centered IM image icon:**
```html
<div class="card beam-card" style="--i:0">
  <div class="card-icon-im"><img src="images/faq-icon.webp" alt="" loading="lazy" decoding="async"></div>
  <h3>FAQ</h3>
  <p>One-sentence description of the destination.</p>
  <a href="faq.html" class="btn btn-secondary mt-16">Read the FAQ &rarr;</a>
</div>
```

**Aurora capability card (centered, line-art icon):**
```html
<div class="au-card beam-card" style="--i:0">
  <div class="au-ic"><img src="images/name-icon.webp" alt="" loading="lazy" decoding="async"></div>
  <h3>Title</h3>
  <p>Description.</p>
</div>
```

Grid wrappers: `.card-grid.card-grid-3` (component lib) or `.au-cardgrid`
(aurora). Keep one family per grid. `--i` runs 0,1,2… for the stagger (the JS also
sets it on scroll-in).

### B7. Node (beam-card) animation

To give any card the house edge-node animation:
1. Add `beam-card` to the card's class and a staggered `style="--i:N"` (0,1,2…).
2. **Ensure the page loads both assets** (this is the easy miss — a page can have the
   markup but no animation):
   ```html
   <link rel="stylesheet" href="css/card-nodes.css?v=2">    <!-- in <head> -->
   <script defer src="js/card-nodes.js?v=2"></script>       <!-- before </body> -->
   ```
3. Verify: scroll the card into view; it should gain `.node-live` and its `::before`
   run `auEdgeNode` (see [How-To D14](#d14-render-check)).

### B8. New-page boilerplate

A content page's `<head>` carries, in order: GA4 `gtag.js` snippet (first, after
`<head>`), charset/viewport, `<title>` + meta description, canonical, OG + Twitter
meta (`og:title/description/image`, `twitter:*`), favicons (`favicon.ico?v=`,
`favicon-32.png?v=`, `apple-touch-icon.png?v=`), stylesheets
(`style.min.css?v=N`, then `aurora.css`, `card-nodes.css`, page CSS), then JSON-LD
(BreadcrumbList + page-type schema). Body: shared nav lockup, content, shared
`au-footer`, deferred `js/main.js` + `js/chat-widget.js` (+ `card-nodes.js` if the
page has beam-cards). Add the page to `sitemap.xml` and cross-link it.

### B9. Explore-the-Platform block

The internal cross-link block. Canonical state: a **three-card row — FAQ, Resources,
Contact — on every nav page except contact.html** (a destination doesn't send people
onward). Each card uses the `.card beam-card` + `.card-icon-im` template ([B6](#b6-card-templates)).
When adding/removing a card, also fix the section's intro sentence so it still names
what's shown. Keep card order FAQ → Resources → Contact.

## C. Build, delivery & deploy

### C10. CSS change delivery (critical gotcha)

**Pages load `css/style.min.css` (minified), and there is no build step.** A change
only to `css/style.css` will **not** appear on the site. For any component/global CSS
change:

1. Edit **`css/style.css`** (readable source of truth).
2. Mirror the change into **`css/style.min.css`** (the file actually served).
3. **Bump the cache key** on every page so browsers fetch the new file:
   ```bash
   grep -rl 'style.min.css?v=2' --include=*.html . \
     | xargs sed -i 's#style\.min\.css?v=2#style.min.css?v=3#g'
   ```
Page-specific CSS may instead live in that page's inline `<style>` block (e.g. the
Security Fabric page), which avoids the min-file + cache dance for one-page tweaks.

### C11. Deploy & verify

Publishing = **push to `main`** → the `Validate and deploy site` workflow
(`.github/workflows/pages.yml`, `concurrency: pages`, serialized) builds and deploys.
Then:
1. Watch the run to **`completed / success`** (GitHub Actions MCP `actions_list` /
   `actions_get`, filter `pages.yml`). Don't just push and hope.
2. Confirm the asset actually shipped — but note **this session's egress policy blocks
   fetching `islandmountain.io` directly** (proxy 403). Verify via the GitHub API /
   repo tree at the deployed SHA instead of `curl`ing the live URL.
3. Tell the user to hard-refresh (Cmd/Ctrl-Shift-R) past the CDN cache.

If a publish looks stuck, diagnose the pipeline (`gh run list`, Pages API); never
just re-push. Keep `.nojekyll` committed. Don't revert Pages to branch-based deploy.

### C12. Branch-per-session → merge to main

Per **CANON §I.5b**: work on a session branch (`git switch -c session/<topic>` or the
assigned feature branch), keep commits green through the hooks, then integrate with
`git switch main && git merge --no-ff <branch>` and push. The git hooks
(`core.hooksPath=tools/hooks`) stamp the canon footer, strip AI co-author credit, and
run NUL/secret/integrity scans. **Never `--no-verify`** — if a gate claps a clean
commit, fix the hook.

## D. Verification / QA

### D13. HTML integrity scan

Per SESSION-RULES.md, after editing HTML verify no truncation/corruption:

```bash
# NUL bytes (CORRECT form)
LC_ALL=C grep -qP '\x00' file.html && echo "NUL FOUND" || echo "clean"
# terminator present
tail -c 20 file.html | grep -o '</html>'
# balanced sections
echo "$(grep -oE '<section' file.html | wc -l) / $(grep -oE '</section>' file.html | wc -l)"
```

**Two traps that cause false results:**
- `grep -c $'\x00'` — bash strips the NUL, so it becomes `grep -c ''` and matches
  **every line**. Use `LC_ALL=C grep -qP '\x00'`.
- `grep -c` **exits nonzero when the count is 0**, so `nul=$(grep -c … || echo 0)`
  captures `"0\n0"`. Use `grep -q` for a boolean, or don't chain `|| echo`.

Anchor counts to `grep -oE` (matches, not lines). The pre-commit hook runs the
authoritative scan — if `git commit` succeeds without `--no-verify`, integrity passed.

### D14. Render check

Verify layout/animation with the preinstalled Chromium (ESM needs the absolute import
and default export):

```js
import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
const { chromium } = pkg;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); // 390 mobile / 1000+ desktop
const p = await ctx.newPage();
await p.goto('file://' + '/abs/path/page.html', { waitUntil: 'load' });
// scroll a section into view, screenshot el.closest('section'),
// and read getComputedStyle / getBoundingClientRect to MEASURE (don't eyeball sizes)
await b.close();
```

Notes: a `file://` page loads `css/style.min.css` (query string ignored on disk), so
min-CSS changes are reflected locally. Measure computed size before trusting a
screenshot (lazy images can read 0×0 before load — wait/scroll first).

### D15. SEO upkeep

On any new page: add it to **`sitemap.xml`**, set a canonical (and `noindex` for
chrome-less/utility pages), keep JSON-LD valid (BreadcrumbList + page-type schema),
and record the change in **SEO-STATE.md**. Titles 50–60 shown chars; meta
descriptions 120–160; OG/Twitter image refs point to `.webp`.

---

## Maintenance

This file is **canonical**. When the design system or a process changes, update
BRAND.md in the **same commit** — a value here that disagrees with the code is a bug
in this file. Open items worth a future pass:

- **Reconcile the two token families** (`--*` vs `--au-*`) toward one source, or
  formally document the alias map (started in §4).
- Consolidate the many logo source files into one canonical, versioned export set.
- Consider promoting `.card-icon-im` and the beam-card wiring into a documented
  component so new cards get them by default.

*Authored and reviewed by Basho Parks, Copyright 2026.*
