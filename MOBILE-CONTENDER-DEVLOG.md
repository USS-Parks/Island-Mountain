# MOBILE-CONTENDER — DEVLOG

Worktree: `IM-Mobile-Contender` · branch `session/mobile-contender` (off `main`).
Scope: homepage (`index.html`) mobile experience. Plan: `PLANNING/MOBILE-CONTENDER-PSPR.md` (rev. 3).

---

## IM lexicon (0.4) — keep copy in our own voice, off the competitor's

**Owned phrases — use freely:**
- "A sovereign AI server at every desk" · "a rack per seat" · "its own server and rack"
- "Woven Security & Governance Fabric (WSF)" · "woven-in"
- "Hand-built in California" · "72-hour burn-in" · "one builder, one phone call"
- "Bring it home" · "onto your own floor" · "The Sovereign Stack"
- "No shared cloud. No data egress. No token fees." (our triad)
- "Sovereignty is an architecture, not a subscription."
- "Air-gappable out of the box"

**Retired / banned — echoed goabacus, do not reintroduce:**
- "That era is over"  →  retired
- "The New Architecture"  →  retired (now "The Sovereign Stack")
- "The cloud made AI possible…"  →  retired
- "inside your walls"  →  use "onto your own floor" / "on your premises"
- Avoid their tropes: setup-time gimmicks ("in N seconds"), "certified day one" overclaim, their stat framing.

**Not banned — IM-owned feature facts (retain):** "No token fees" is our established value prop
(used across pricing/investors/landfall/blogs). It is a feature fact, not distinctive competitor
expression — leave it.

---

## Assets

- **`video/summit-stack.mp4`** (2.2 exploded-stack) — sourced from
  `images/Video_generation_session_Acti.mp4`; Gemini sparkle removed. Method: measured the static
  sparkle from a 200-frame temporal average, un-blended it as a light-fill + dark-edge composite
  (per-pixel inverse of the alpha blend) so the underlying label/leader/node are recovered, not
  erased. Verified trace-free at native size across all 240 frames (start → label-crossing end).
  Visible watermark only; any invisible SynthID provenance signal is untouched. 1280×720, 24fps,
  10s, H.264 crf18. Findable copy at repo root: `summit-stack-dewatermarked.mp4`.

## Phase 0 — De-risk (copy divergence) — COMPLETE
- **0.1 scan** (site-wide, excl. mai/node_modules/.deploy): homepage goabacus-echoes = manifesto
  line 170 + New Architecture section (207/209). Other hits were "No token fees" (IM-owned,
  retained). No other page carried a true echo → no follow-up copy list needed this pass.
- **0.2 manifesto** (line 170): "…That era is over." → "Your most sensitive work has been renting
  space on someone else's servers. Bring it home." (typewriter attr + text both updated).
- **0.3 New Architecture** (207/209): eyebrow "The New Architecture" → "The Sovereign Stack";
  lede rewritten to drop "The cloud made AI possible" and "inside your walls" → "Renting
  intelligence from someone else's data center turned your most sensitive work into their
  liability. Island Mountain moves the entire stack — model, hardware, and governance — onto your
  own floor, one appliance per seat."
- **Verify:** zero flagged phrases remain on the homepage; new copy present; `index.html` intact
  (489 lines, closes `</html>`). Not committed yet.

## Phase 2 — beats (in progress)
- **2.2 Summit Series Stack — DONE.** Replaced raster `im-infographic-1.webp` (New Architecture
  section) with `video/summit-stack.mp4` (the de-watermarked exploded-stack), poster
  `images/summit-stack-poster.webp`, reusing `.au-infographic` sizing. `autoplay muted loop
  playsinline`. Verified: loads (readyState 4), source plays. TODO Phase 1: play-on-scroll
  (below-fold autoplay is unreliable; wire via aurora-sections.js IntersectionObserver).
- **2.6 Vertical cards — DONE.** New `.au-verticals` section (`au-section--alt`), 2x2
  `.au-vgrid`, four image-backed `.au-vcard.beam-card`s (node animation identical sitewide, armed
  `node-live`). Copy is architectural/honest. Converted 4 PNGs → WebP (full-res, q90; `-icon`
  names normalized to `-vertical`): tribal-nations 295K, local-govt 331K, casino 464K,
  higher-learning 417K. Links: tribal-nations / government / casino-gaming / education .html (all
  exist; Basho builds out Local Government + Casino pages separately). Verified at 375x812:
  2 cols (165.6px each), two rows, all imgs decoded, 3:2 cover crop, node-live x4, zero console
  errors, screenshot clean.

## 2.3 — Living VERA mosaic — CANCELLED & REMOVED (Basho's call)
Removed completely per the rollback below: canvas element + mosaic engine + translucent-section
re-skin + the 3.4MB mosaic asset all gone; sections restored to opaque; `js/aurora-sections.js`
kept only the stack-video play-on-scroll. The "How every Summit is made" step cards were kept as a
normal opaque section (not mosaic-dependent). Removal also cleared the failing Pages deploy (the
validator flagged the canvas's `images/…png` reference resolved relative to `js/`).

### (historical) what was built before removal
Reconceived from a boxed scroll-section into a **page-wide fixed background**: a single `<canvas>`
(`#au-mosaic-canvas`, `js/aurora-sections.js`) reconstructs the real 300dpi VERA mosaic from ~150
ultra-fine tesserae that snow down and fill left->right then up the right edge, keyed to **total
page scroll**, completing the whole chip behind the footer. Content sections go **translucent** so
the mosaic reads through; step cards float one layer above. Canvas = one compositing layer
(phone-friendly; the earlier 150-DOM-tile version wedged the renderer). Functionally verified
(canvas paints 0% -> 63% -> 100% top-to-footer); the composed page could NOT be screenshotted (the
preview tool wedges on this page's fixed-video + full-viewport-canvas + 9000px height) - offline
render at repo root `vera-mosaic-render.png` shows the mosaic layer itself.
`js/aurora-sections.js` also carries the 2.2 stack-video play-on-scroll.

### ROLLBACK - pulling the VERA element completely (Basho may ask on return)
The VERA element = the living mosaic + the translucent re-skin. To remove it, keeping everything
else (Phase 0 copy, 2.2 video, 2.6 cards, the how-made step cards):
1. `index.html` - delete the `<canvas class="au-mosaic-bg" id="au-mosaic-canvas">` line.
2. `css/aurora.css` - delete the "Page-wide VERA mosaic background (living layer)" block:
   the `html{background}` / `body{background:transparent}` lines, `.au-mosaic-bg`, AND the nine
   translucent-section overrides (`.au-howmade`, `.au-section--alt`, `.au-section--ink`,
   `.au-manifesto`, `.au-statement`, `.au-spotlight`, `.blog-rail-section`, `.footer/.au-footer`).
   Keep the `.au-hm-steps` / `.au-hm-step` card styles. Sections return to their opaque backgrounds.
3. `js/aurora-sections.js` - delete section 2 (the canvas mosaic engine); keep section 1 (video
   play-on-scroll). Or delete the file and move the video IO into `main.js`.
The `#au-howmade` "How every Summit is made" step section is NOT VERA-dependent - it can stay.

## Follow-ups (if VERA stays)
- Convert `images/gpu_mosaic_tapestry_300dpi.png` (3.4MB) -> webp and repoint the canvas `IMG`
  (loads async, non-blocking, but 3.4MB is heavy for all visitors).
- Remaining beats: 2.1 (spec grid), 2.4 (artful sovereign-vs-cloud), 2.7 (frameworks), 2.8 (FAQ).
- Tune mosaic presence/opacity + section translucency to Basho's eye once seen live.
