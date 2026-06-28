# P-SPR — Aeneas GIF Float, Contrast & Alternating Layout

**Project:** islandmount.io — `aeneas.html`
**Author:** Basho Parks (with Claude)
**Created:** 2026-06-28
**Status:** 🟡 DRAFT — awaiting review & green light. No image edits or HTML changes until P0 decisions are answered and approval is given.

---

## §0 — Operating Rules (read first)

1. **One prompt at a time.** Execute a single prompt, run its verify gate + QA, then **stop and hand back for sign-off**. Do not start the next prompt until the user approves the current one. No batching, no "while I'm here."
2. **Non-destructive.** Original GIFs are copied to `assets-src/gif-originals/` in P0 **before** any processing. Every processing step writes to a **new** filename — originals are never overwritten.
3. **QA gate is visual, on the real backdrop.** Each processed GIF is reviewed composited over the actual Island Mountain substrate at the position it will occupy (hero photo near top → dark fade lower down), not over a checkerboard. Contrast is judged there.
4. **Verify gate per prompt** (all must pass before sign-off):
   - Processed asset exists at expected path with expected dimensions / frame count / loop / frame timing preserved.
   - Background visually clean (no light halo/fringe) over a dark swatch.
   - Content legible over both the lighter (upper) and darker (lower) regions of the page background.
   - File size reduced vs. source (target: see §3).
   - `aeneas.html` still serves HTTP 200 and the asset resolves (200).
5. **Commit discipline.** One commit per approved prompt. Conventional, scoped message. **Push only when the user explicitly says to.** (The nav-spacing + light-GIF swap from the prior session are currently **uncommitted** — see §5 Preconditions.)
6. **Reversibility.** If a processed result fails QA twice, fall back: keep the original on a subtle translucent panel rather than forcing a bad key. Record the fallback in the DEVLOG line.

---

## §1 — Goal

Make the three Aeneas GIFs **float** cleanly on the page (transparent backgrounds), **half their current raster size**, with **content re-treated for contrast** against the dark, scroll-fading background, and lay them out in an **alternating left/right two-column rhythm** with body text opposite each GIF so the page breathes.

---

## §2 — Source facts (measured 2026-06-28)

| GIF | Section | Dims | Frames | Background | Content |
|---|---|---|---|---|---|
| `images/IMG_7495.GIF` | Platform | 560×610 | 100 | near-uniform white `#FCFCFC` | dark (5% dark / 91% light) |
| `vaulted-ai-access-light.gif` | Security Model | 608×480 | 122 | **light blue-gray gradient** `#F2F5F8`→`#E8EDF3` | dark (11% dark / 66% light) |
| `IMG_7488.GIF` | Deployment | 500×592 | 67 | near-uniform white `#FCFCFD` | dark (2% dark / 92% light) |

**Implications driving the plan:**
- All three are **dark-content-on-light-bg**. Knock out the light bg and the content lands on a dark page → **must recolor/brighten content** (the user's contrast note). This is a required step, not optional.
- `vaulted-ai-access-light.gif` has a **gradient** background → a single-color key won't remove it cleanly; needs edge-flood-fill with tolerance or a luminance/brightness key. **This is the hard case → scheduled last of the three** so the pipeline is proven on the two easy ones first.
- **GIF transparency is 1-bit** (single transparent index, no partial alpha) → anti-aliased edges will fringe/jag when floating. See the format decision in §3.

---

## §3 — Open Decisions (need answers before P1; P0 will demo on one GIF)

**D1 — Output format (most important).**
- **(A) Animated WebP — recommended.** Full 8-bit alpha → genuinely clean floating edges, no fringe, and far smaller files. `<img>` tags just swap `.gif`→`.webp`; the site already serves WebP for its photos; modern-browser support is universal. Lets us satisfy "transparent" + "2× smaller" at once with the best look.
- **(B) Keep animated GIF.** Honors the literal "GIF" wording, but 1-bit alpha means visible edge fringe on a dark bg and weaker compression. Workable, not pretty.
- *Recommendation: **A**. Plan is written to support either; pick at P0.*

**D2 — "Reduce size 2×" meaning.** Interpreted as **halve raster dimensions** (e.g. 560×610 → 280×305), which also shrinks file size; with WebP the file drop is much larger. Confirm this is "dimensions," not "file size only." Display size in the layout follows the new raster size.

**D3 — Contrast treatment style.** Per-GIF, decided at its QA, from: (a) recolor dark strokes → light/near-white; (b) recolor → copper accent `#f59e0b` to match brand; (c) keep dark content but sit it on a faint translucent rounded panel (`rgba(15,23,42,.45)` + blur) so it reads without altering the art; (d) add a soft outer glow. P0 demos (a)+(c) on the sample for a baseline preference.

---

## §4 — Non-goals
- No changes to other pages, the navbar (done last session), the hero images, or any non-Aeneas asset.
- No re-animation / re-timing of the GIFs (preserve frame durations & loop).
- No new build tooling beyond a single local Python/Pillow script kept in `tools/`.
- No push to `main` as part of this plan unless explicitly requested.

---

## §5 — File inventory & Preconditions

**Touched:**
- New: `tools/gif_process.py` (reusable: coalesce → key bg → recontrast → resize → save WebP/GIF).
- New: `assets-src/gif-originals/` (untouched backups of the 3 sources).
- New processed assets (paths finalized at P0 per D1), e.g. `images/aeneas-platform.webp`, `images/aeneas-vaulted.webp`, `images/aeneas-deployment.webp`.
- Edit: `aeneas.html` (P4 layout; per-GIF `src` swaps in P1–P3).
- Possibly Edit: `css/style.css` + `css/style.min.css` (only if a new alternating/panel utility is needed in P4).

**Preconditions / current uncommitted state (do not lose):**
- `aeneas.html` already points the Security-Model image at `vaulted-ai-access-light.gif`.
- Navbar spacing override + `vaulted-ai-access-light.gif` reference are **uncommitted** in the working tree. Decide with the user whether to commit those **before** starting P0 (recommended: yes, a clean baseline) or carry them along.

---

## §6 — Sequential Prompt Roster

> Each prompt ends at a **QA STOP**. Nothing proceeds without sign-off.

### P0 — Decisions, harness & one-GIF proof
- Lock D1/D2/D3 with the user.
- Copy the 3 originals into `assets-src/gif-originals/`.
- Write `tools/gif_process.py` (params: input, bg-key mode `flood|white|luma`, tolerance, content-recolor mode `none|lighten|copper`, optional panel/glow flag, scale, output format).
- Run it on **one** easy GIF (`IMG_7495`) producing 2–3 variants (e.g. lighten-strokes vs. translucent-panel).
- **QA STOP:** review variants composited on the real page background; pick the format (D1) + contrast direction (D3) + confirm scale (D2). Output of P0 is an agreed "recipe."
- Verify: script runs clean; variants exist at half-size; originals backed up.

### P1 — GIF #1: Platform (`IMG_7495.GIF`)
- Apply the agreed recipe → final asset; swap its `src` in `aeneas.html`’s Platform showcase block.
- **QA STOP:** clean edges, legible over the upper (lighter) band where this sits, timing/loop intact, file smaller, page 200.
- Commit: `feat(aeneas): float + recontrast Platform GIF at 2x scale`.

### P2 — GIF #2: Deployment (`IMG_7488.GIF`)
- Second near-white case; same recipe, tune tolerance if needed; swap `src`.
- **QA STOP:** same checklist, judged at its lower (darker) page position.
- Commit: `feat(aeneas): float + recontrast Deployment GIF at 2x scale`.

### P3 — GIF #3: Security Model (`vaulted-ai-access-light.gif`) — the gradient case
- Use flood-fill-from-edges + tolerance (or luma key) to remove the gradient; expect extra QA iterations; swap `src`.
- **QA STOP:** verify no gradient remnants / blocky halo; legibility over mid-fade background.
- Commit: `feat(aeneas): float + recontrast Security-Model GIF at 2x scale`.

### P4 — Alternating two-column layout
- Restructure the three media blocks in `aeneas.html` into an alternating rhythm using the existing `.two-col` grid (text opposite GIF): **Platform = GIF left / text right**, **Security Model = GIF right / text left**, **Deployment = GIF left / text right**. Add a minimal reverse/order modifier if needed (CSS in both `style.css` + `style.min.css`).
- **QA STOP:** desktop (≥992px) alternation correct, vertical centering, gutters; tablet/mobile collapse stacks GIF-above-text in a sensible order; no overlap with the 4-up card grids; spacing breathes.
- Commit: `feat(aeneas): alternating two-column media/text layout`.

### P5 — Full-page QA & wrap
- End-to-end pass: scroll the whole page — every GIF reads against its local background brightness; no fringe; animations smooth; total page weight down; mobile + desktop; HTTP 200 on page + all 3 assets.
- Record a DEVLOG/summary line; confirm with user whether to **push** (and whether to bundle the prior uncommitted nav fix).
- Commit (docs/wrap) + push **only if told**.

---

## §7 — Completion criteria
- All three GIFs float (transparent bg), at ~50% raster size, with content legible across the page's full light→dark scroll range.
- Layout alternates L/R with text opposite; page breathes on desktop and stacks cleanly on mobile.
- Originals preserved in `assets-src/`; each step committed; nothing pushed without explicit instruction.

## §8 — Approval state
- [ ] D1 (format) decided
- [ ] D2 (scale) confirmed
- [ ] D3 (contrast direction) baseline chosen at P0
- [ ] Plan approved to begin P0
