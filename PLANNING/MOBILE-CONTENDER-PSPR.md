# MOBILE-CONTENDER — P-SPR

**Status: DRAFT (rev. 3) — awaits STS approval.**
**Scope of this phase: the homepage (`index.html`) mobile experience only.**
Author: Basho Parks. Drafted 2026-07-04 · Rebaselined 2026-07-05 · **Scope locked 2026-07-05.**

---

## R. Revision log (read first)

**Rev. 3 — scope decisions locked (Basho, 2026-07-05):**
- **2.1 Spec grid** — approved.
- **2.2 Summit Series Stack** — approved *in principle*, but the visual is **held for a design
  discussion first** — must be cutting-edge, webpage-savvy motion, explicitly beyond generic
  AI-slop. Do not build until direction is agreed. (Seeds under §4 2.2.)
- **2.3 How-it-works** — approved, with a specific creative direction: a **scroll-progression
  workflow animation** whose nodes light up step-by-step as the reader scrolls, rendered over the
  **VERA chip-mosaic** asset (`images/gpu_mosaic_tapestry_300dpi.png`).
- **2.4 Sovereign-vs-cloud** — approved, but the bar is raised: **artful, custom rendering**, not
  the "disgustingly vanilla" side-by-side goabacus ships.
- **2.5 By-the-numbers band** — **CUT** (vetoed): redundant with the hero badges + the 2.1 spec
  grid.
- **2.6 Vertical cards** — approved, now **image-backed**; Basho is creating the vertical imagery
  (build depends on delivery).
- **2.7 Frameworks strip** — retained (unchanged).
- **2.8 FAQ teaser** — approved.
- **2.9 Security Map teaser** — **CUT** (vetoed): no Security Map on the homepage; a separate
  animation/GIF will be presented later.

**Rev. 2 — rebaselined against the live homepage (487 lines, not 501):** Security Map moved off
the homepage → `lamprey-woven-security-governance.html` (`9a71310`); a blog rail was added
(`js/blog-scroller.js` + `css/blog-scroller.css`); a card-node system shipped (`css/card-nodes.css`
+ `js/card-nodes.js`, keyed on `.beam-card`); the copy scrub (`844ac03`) did **not** touch either
divergence target. All line numbers refreshed; intro video is `video/im-opening.mp4`.

Nothing in the build phases (1–4) has started — `js/aurora-sections.js` does not exist yet.

---

## 0. Why this phase exists

Two screen-recordings (goabacus.co "Go1" vs islandmountain.io, iPhone, 2026-07-04) showed a
near-twin competitor selling the same product category with markedly more scroll depth,
motion, and produced proof. Two problems fall out:

1. **Legal.** Their content is copyright + patent-pending. Parts of our copy track theirs
   closely enough to be a liability. **We must diverge — not they.**
2. **Presentation.** On mobile (90%+ of discovery) our homepage reads thinner and more
   "also-ran" than theirs. We want to be a *contender in their eyes* — a second lion on the
   Serengeti — without chasing VC-funded polish.

**Goal:** de-risk our language, then *bulk out* the mobile homepage with owned content and
genuinely crafted motion so the presentation gap closes substantially — using only what we can
legitimately show **today**.

## 1. Hard constraints (read before touching anything)

- **Mobile-first.** Design and verify every change at **375×812** (Claude Preview MCP) and on
  the live site. Desktop tuning is a *separate, later session* — breakpoint-guard anything that
  would break wide, don't polish it.
- **Craft bar — anti-slop.** The marquee animated beats (**2.2, 2.3, 2.4**) must read as
  bespoke, webpage-savvy motion design, not templated AI-slop. No generic stock bars/counters
  for these three — custom SVG / canvas / CSS in IM's own visual language. This is the whole
  point of the phase: out-*craft*, not out-spend, the competitor.
- **No fabricated proof (CANON §10/§11).** No product photos, film, customer names,
  testimonials, or usage/traction metrics — those land in the **July–Aug 2026** hardening/V&V
  window. Credibility mass this phase comes from architecture, honest *design* specs,
  process/methodology, provenance, existing renders, and Basho-authored artwork. **Motion and
  owned artwork substitute for the media we don't have yet.**
- **Honesty in comparisons.** Sovereign-vs-cloud is framed as *architectural difference*, never
  as invented benchmarks. Numbers shown are **capability/spec numbers we can stand behind**, not
  adoption numbers we can't.
- **Diverge, don't echo.** Any line, header, or section order that mirrors goabacus gets
  rewritten into IM's own lexicon. (Copyright is the web-content exposure; not legal advice —
  get counsel for the real call. This phase simply removes the obvious overlaps.)
- **Mechanics — worktree-first (CANON §I.5b + repo convention).** This repo runs parallel
  sessions and `main` moves under you. Do **not** build on the current
  `session/security-map-to-woven-fix` branch (mid-other-work, heavy line-ending churn). Spin up a
  dedicated worktree off a clean `main`:
  `git worktree add -b session/mobile-contender ../IM-Mobile-Contender main`, copy any untracked
  assets in, work there. Truncation-safe writes (SESSION-RULES.md — verify every write with
  `tail`/`wc -l`); never `--no-verify`; git hooks own the NUL/`</html>`/footer gates.

## 2. Current homepage inventory (grounded in `index.html`, 487 lines)

| # | Section (anchor/class) | Lines | Notes |
|---|---|---|---|
| 1 | Aurora intro video (`#aurora-intro`) | 71–77 | branded `video/im-opening.mp4` reveal |
| 2 | Hero (`.au-hero`) | 106–130 | split-text H1, rotator, **4 badges** (carry the headline specs), 2 CTAs |
| 3 | Trust marquee (`.au-marquee`) | 132–140 | 11 verticals, scrolling only |
| 4 | Product spotlight (`.au-spotlight`) | 142–163 | `summit-reveal.mp4` + copy |
| 5 | **Dark manifesto (`.au-manifesto`)** | 165–170 | ⚠️ **divergence target** (line 168) |
| 6 | Why IM (`.au-section--alt`) | 172–200 | 4 `.beam-card`s (carry card-node motion) |
| 7 | **New Architecture (`.au-statement`)** | 202–211 | ⚠️ **divergence target** (205/207) + raster `im-infographic-1.webp` (208) |
| 8 | Blog rail (`.blog-rail-section`) | 213–328 | newest-first horizontal scroller |
| 9 | Film slot (`.au-videoslot`) | 330–340 | "Film - Coming Soon" placeholder |
| 10 | Behind the Summit (founder) | 342–355 | `founder-basho.webp` builder story |
| 11 | Lead form | 357–395 | formsubmit.co |
| 12 | Footer + link-farm | 397–479 | ~16 SEO links |

> **Not on the homepage** (do not re-add): the Security Map (`.au-map` SVG) — it lives on
> `lamprey-woven-security-governance.html`.

**Animation systems available (both already loaded on the homepage):**
- **`js/hero-cinematic.js`** — `.au-reveal` / `.au-stagger` → IntersectionObserver adds `.in`;
  `[data-split]`; `.au-rotator`; `[data-typewriter]`; `prefers-reduced-motion` respected. New
  sections using `.au-reveal` / `.au-stagger` reveal automatically. *(Reveal-on-enter only — it
  does NOT do scroll-linked scrubbing; 2.3 needs new code, see §4 1.1.)*
- **`js/card-nodes.js` + `css/card-nodes.css`** — the shared card "node treatment," keyed on
  `.beam-card`. **New card beats carry `.beam-card`** to inherit it — do not hand-roll a second
  node effect.

**Styling home:** the homepage loads **three** dedicated sheets on top of `style.min.css` —
`css/aurora.css?v=2` (new section styling goes here), `css/card-nodes.css`,
`css/blog-scroller.css?v=1`. Phase 1 re-confirms `aurora.css` is homepage-scoped. **Bump `?v=N`**
when a returning-visitor CSS change must land.

## 3. The gap → owned-beat map (what we add, honestly)

| goabacus beat | IM has today | Owned beat (this phase) | Status |
|---|---|---|---|
| Spec list w/ real parts | badges name the headline specs | **2.1 Spec grid** — honest Summit design specs | ✅ approved |
| "Go1OS" software story | stack buried in a raster | **2.2 Summit Series Stack** — cutting-edge, native | ⏸ **design discussion first** |
| "In 50 seconds" setup timeline | — | **2.3 How-it-works** — scroll-lit workflow over the VERA mosaic | ✅ approved (see direction) |
| "<50ms vs cloud" bars (vanilla) | — | **2.4 Sovereign-vs-cloud** — *artful*, custom, non-vanilla | ✅ approved, high craft |
| "2,000 users / 800 GB/s" stats | badges | ~~2.5 By-the-numbers band~~ | ❌ **cut (redundant)** |
| Insurance/Healthcare photo cards | text marquee | **2.6 Vertical cards** — image-backed, Basho artwork | ✅ approved (needs imagery) |
| "Certified day one" (overclaim) | honest disclaimer | **2.7 Frameworks strip** — "supports your program" | ✅ retained |
| Help center / depth | full faq.html | **2.8 FAQ teaser** — high-intent Q&As inline | ✅ approved |
| Their animated hero asset | — | ~~2.9 Security Map teaser~~ | ❌ **cut (vetoed)** |
| 3D logo, product film, testimonial | — | *(out of scope — needs media/proof we don't have yet)* | — |

Our uncopyable moat is **WSF + hand-built provenance**, on-page today (WSF cards, founder story),
with the blog rail adding field-notes depth. The Security Map stays on the Woven page; a separate
animation/GIF for the homepage will be presented later (not this phase).

**Active roster: 7 beats — 2.1, 2.2, 2.3, 2.4, 2.6, 2.7, 2.8.** (2.5 and 2.9 cut.)

## 4. Roster (Stem-to-Stern order)

### Phase 0 — De-risk (copy & architecture divergence) — *the priority; both targets still live*
- **0.1** Site-wide scan (scoped, excluding `mai/`, `node_modules`, `.deploy-*`) for language
  that tracks goabacus: "That era is over", "The New Architecture", "The cloud made AI
  possible", "inside your walls", "no token billing/fees", "governable". Inventory all hits;
  **fix homepage this phase, list the rest for a follow-up.**
- **0.2** Rewrite the manifesto line (`.au-manifesto`, **line 168** — currently "…That era is
  over.") into IM's own framing. *Candidate directions (for approval):* "Your most sensitive work
  has been renting space on someone else's servers. Bring it home." / "Sovereignty was the one
  thing the cloud could never ship. So we built it into the box."
- **0.3** Rewrite the New Architecture header + lede (`.au-statement`, **eyebrow 205, lede 207**).
  Retire "The New Architecture" and the "The cloud made AI possible" opening; replace with an
  IM-owned name + opening. (Same DOM region whose raster gets swapped in 2.2 — do them together.)
- **0.4** Write a 6–10 line **IM lexicon** note (owned phrases, banned near-theirs phrases) at
  the top of the DEVLOG so future copy doesn't drift back.

### Phase 1 — Scaffold
- **1.1** Create the worktree per §1 (`session/mobile-contender` off `main`). Confirm
  `aurora.css` is homepage-scoped (grep other pages' `<head>` — three homepage sheets now). Create
  `js/aurora-sections.js` (deferred), wired after `hero-cinematic.js`, providing:
  - a **scroll-progress controller** (scroll-linked, rAF-throttled) driving 2.3's node
    illumination as a function of the section's scroll position — the core new capability;
  - lightweight reveal/draw-on helpers for the simpler beats (2.1, 2.7);
  - `prefers-reduced-motion` → static end-state for every animation.
  Card beats reuse `.beam-card`. **2.2 and 2.4 will likely carry their own bespoke animation
  modules** (per the craft bar), not the shared helpers — scope those at their design step.

### Phase 2 — Content mass (mobile-first)
- **2.1 Spec grid** — "What's inside every Summit": honest design specs (2× RTX PRO 6000
  Blackwell, VRAM, CPU, RAM, NVMe, PSU, cooling, physical air-gap, dimensions, power draw).
  Animated reveal (`.au-stagger`). *No numbers we can't defend.*
- **2.2 Summit Series Stack** — **HELD FOR DESIGN DISCUSSION (do not build yet).** Replaces raster
  `im-infographic-1.webp` (**line 208**) with a native, cutting-edge animated section for the
  stack (open-weight models · OpenWebUI · vLLM/Ollama · local storage · admin roles · optional
  air-gap · Lamprey WSF). Must beat generic AI-slop. *Seed directions to discuss (none chosen):*
  1. **Exploded stack** — an isometric cross-section of the Summit whose layers (silicon →
     inference runtime → model → WSF governance → UI) separate/float apart on scroll, each labeled.
  2. **Signal path** — a single query traced as a pulse of light rising through the layers, the
     WSF layer visibly sealing/stamping it (ties to the receipt-ledger story).
  3. **Living schematic** — the stack draws itself line-by-line as a blueprint on scroll, each
     subsystem igniting when complete (mono → copper accent).
  *Opportunity:* share a visual language with 2.3 (both are "the machine, rendered as art") or
  deliberately contrast it. **Resolve in discussion before coding.**
- **2.3 How-it-works — scroll-lit workflow over the VERA mosaic** — steps: order → hand-built in
  CA → 72-hour burn-in → shipped → plug-in → serving. The **`images/gpu_mosaic_tapestry_300dpi.png`**
  chip-mosaic (portrait 1024×1536, natural functional blocks + cyan trace channels) is the
  canvas; as the reader scrolls, each step lights its node/region of the die and energizes the
  traces feeding it — a live animation driven by scroll depth (scroll-progress controller, §1.1),
  not a one-shot reveal. Web-delivery of the 3.4 MB source (derivative vs. as-is, art-direction of
  the overlay) is a Phase-3 detail — **Basho owns the weight tradeoff.**
- **2.4 Sovereign-vs-cloud contrast — artful, custom** — data egress / token metering / audit /
  control / cost-predictability as a **bespoke** animated contrast that is visibly better-rendered
  than the competitor's vanilla bars. Architectural framing, **no fabricated latency numbers.**
  This is a marquee craft beat, not a stock chart.
- **2.6 Vertical depth cards — image-backed** — 4–6 flagship verticals (law, medical, tribal,
  defense…), each a one-line problem→IM-answer over **Basho-supplied imagery**, linking the
  existing per-vertical page. *Build depends on imagery delivery* (see Open items).
- **2.7 Frameworks strip** — HIPAA · ITAR · DFARS/CMMC · OCAP as an honest "designed to support
  your compliance program" strip; keep the existing disclaimer. Our honesty vs their overclaim.
- **2.8 FAQ teaser** — 3–5 high-intent Q&As inline → link `faq.html`.

### Phase 3 — Motion & presentation polish
- **3.1** Craft/cohesion pass on the marquee beats (**2.2, 2.3, 2.4**): scroll-lit mosaic,
  bespoke contrast, and the agreed 2.2 module land at production quality; the simpler beats
  reveal cleanly; honor `prefers-reduced-motion`; no jank at 60fps on mobile.
- **3.2** Fix the **chat-widget overlap** (bubble covers CTAs/body at section bottoms on mobile);
  make the **"Film — Coming Soon"** slot (lines 330–340) look *intentional* (styled placeholder);
  QA the **blog rail** horizontal scroll at 375px (overflow scroller — must not fight vertical
  scroll or collide with the chat bubble).
- **3.3** Rhythm pass — proposed scroll (tunable):
  hero → marquee → Summit spotlight → manifesto → **specs (2.1)** → **stack (2.2)** →
  **how-it-works (2.3)** → Why-IM cards → **contrast (2.4)** → **verticals (2.6)** →
  **frameworks (2.7)** → blog rail → builder → **FAQ teaser (2.8)** → form.
  **No Security Map embed; no by-the-numbers band.**

### Phase 4 — Verify & log
- **4.1** Render each new beat at **375×812** (Claude Preview) + live check; fix layout bugs.
  **Scroll-linked animation caveat:** the preview compositor throttles animated scroll — verify
  2.3 by jumping to discrete scroll offsets (`behavior:'instant'`) and reading the node/trace
  illumination state at each, plus a live-device pass; do not trust a single animated-scroll
  screenshot.
- **4.2** Truncation-safe writes; **bump `?v=N`** on `aurora.css` (and any new sheet); run repo
  gates (NUL/`</html>`/footer via hooks). Never `--no-verify`.
- **4.3** DEVLOG entry (what changed, files, verify result, SHA). Capture a **desktop-tuning
  punch-list** for the next session. Update memory. Integrate the worktree to `main`
  (`git switch main && git merge --no-ff session/mobile-contender`) when the unit is done.

## 4b. Open items — need Basho during the build
- **2.2 design discussion** — agree a direction (seeds above) *before* 2.2 is coded. Blocks 2.2 only.
- **2.6 vertical imagery** — Basho is creating it; 2.6 build waits on delivery (filenames + which
  verticals). Blocks 2.6 only.
- Everything else (Phase 0, 2.1, 2.3, 2.4, 2.7, 2.8) can proceed on STS without further input.

## 5. Files in play
- `index.html` (homepage — section edits + new sections).
- `css/aurora.css` (all new section styling; bump `?v=N` on release).
- `js/aurora-sections.js` (**new** — scroll-progress controller + reveal helpers).
- `images/gpu_mosaic_tapestry_300dpi.png` (**existing** — canvas for 2.3; possible web derivative,
  Basho's call).
- **Basho-supplied vertical imagery** (**incoming** — for 2.6; lands in `images/`).
- **Reuse, don't duplicate:** `css/card-nodes.css` + `js/card-nodes.js` (`.beam-card`);
  `js/blog-scroller.js` + `css/blog-scroller.css` (existing rail — reposition only).
- possibly `js/main.js` (wire-up only).

## 6. Non-goals (explicitly out)
- Desktop layout/polish (separate session — punch-list only).
- Any real photo/film/testimonial/benchmark (July–Aug hardening/V&V). *Owned Basho artwork and
  the existing VERA mosaic are in play; fabricated proof is not.*
- Public pricing (stays quote-based; hidden pages stay hidden).
- The Security Map on the homepage — no embed, no teaser (a separate animation/GIF comes later).
- The by-the-numbers / count-up stats band (cut as redundant).
- Reworking the blog rail's scroller behavior (reposition only).
- Backend / lead-funnel / voice changes.
- Non-homepage copy-divergence *fixes* (inventory now, fix later).

## 7. Completion criteria
- Both divergence targets rewritten (manifesto line 168; New Architecture 205/207); site-wide
  overlap inventory captured.
- The 7-beat roster live and animated at 375×812 — with **2.2, 2.3, 2.4 meeting the craft bar**
  (bespoke, non-vanilla), 2.3 driven by scroll over the VERA mosaic.
- Raster `im-infographic-1.webp` replaced by the native 2.2 section.
- Chat-overlap resolved; film-slot styled as intentional; blog rail QA'd at 375px.
- Gates green; `?v=N` bumped; DEVLOG + desktop punch-list written; nothing pushed until Basho
  says so.

## 8. Approval
Awaiting explicit "run it STS" (or an amended scope). The **2.2 design discussion** and **2.6
imagery** are the only mid-build inputs still owed; the rest is ready to execute on approval. No
`index.html` edits, branches, or commits before then.
