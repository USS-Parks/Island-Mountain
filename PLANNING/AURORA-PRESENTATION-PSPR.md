# P-SPR — Project Aurora: Homepage Overhaul (Cinematic Reveal · Neon Edge-Nodes · Per-Workstation Story)

**Project:** islandmountain.io — full `index.html` rebuild on GoAbacus's scroll architecture, Aurora-themed, Island Mountain content/assets/positioning.
**Author:** Basho Parks
**Created:** 2026-07-04
**Status:** 🟡 DRAFT — decisions locked; awaiting green light to run STS. No HTML/CSS/JS edits, encodes, or commits until approved.
**Companion research:** `AURORA-PRESENTATION-RESEARCH.md` (repo root) — decoded GoAbacus + Zenity mechanisms and the framework-free code patterns.

> **Aurora** = flowing copper light over the mountain: cinematic reveal + traveling copper→white-hot comet nodes, in Island Mountain's own brand.

---

## §0 — Operating Rules (read first)

1. **One prompt at a time.** Execute a single prompt, run its verify gate + visual QA, then **stop for sign-off**. No batching.
2. **Non-destructive & reversible.** Back up the current `index.html` → `index.pre-aurora.html.bak` before P2. Every effect is additive + gated behind `.js` + `prefers-reduced-motion`: JS-off / reduced-motion users get the finished static page. Any effect failing QA twice falls back to static (logged in DEVLOG).
3. **Verify gate per prompt** (all pass before sign-off):
   - HTTP 200; all assets resolve 200.
   - **No pricing:** zero dollar figures / price tiers / per-token costs anywhere in the built homepage or its schema; every price-adjacent CTA routes to contact/sales.
   - No-JS render = finished page (test JS disabled): no stuck curtain, no hidden content.
   - `prefers-reduced-motion: reduce` = static finished page.
   - CLS visually zero; LCP element paints promptly.
   - Effect present desktop + mobile; no console errors.
   - CSS change lands in **both** `css/style.css` and production `css/style.min.css`.
   - Site-wide HTML integrity (NUL / `</html>`) scan clean (SESSION-RULES).
4. **Commit discipline.** One commit per approved prompt; plain-speak scoped subject; canon footer auto-applied; never credit an AI co-author; never `--no-verify`. **Push only when explicitly told.**
5. **Flagship-only.** This PSPR rebuilds `index.html` and the shared CSS/JS Aurora layer. Propagation to other pages is a follow-on PSPR.

---

## §1 — Goal

Rebuild the Island Mountain homepage as a **cinematic, motion-rich, Aurora-themed** experience modeled on **goabacus.co's scroll architecture**, telling Island Mountain's **per-workstation sovereign-AI** story with **new Summit product photography** and **no pricing** — framework-free (no build step), keeping IM's performance and accessibility posture.

**Narrative spine (drives all copy):** Island Mountain is an **organizational, employee-by-employee** solution. **Every workstation is its own server + hardware rack** with the **Woven Security & Governance Fabric (WSF/AOG) built in** — a sovereign AI node per seat, no shared cloud, no data egress. Pricing is **sales-qualified only** (contact sales).

Two build pillars (the reusable **Aurora System**): **A. Cinematic reveal** (curtain → staggered entrance → letter-split rotating headline → reveal-video slot → depth + marquee) and **B. Neon edge-nodes** (copper→white-hot comet orbs on a purpose-built **Woven Fabric** schematic; copper `@property` border-beam on all cards, viewport-gated). **No neon on the hero photo.**

---

## §2 — Source facts & assets (measured / provided 2026-07-04)

**Product identity (new canonical photography — replaces all prior vertical hardware-rack shots):**
- `images/Island Mountain Summit Product Shot 1.png` — **office lifestyle** (Summit + developer, SF skyline, logo lockup) → full-bleed editorial band.
- `images/Island Mountain Summit Product Shot 2.png` — **front-on hero** on light gray → product spotlight.
- `images/Island Mountain Summit Product Shot 3.png` — **3/4 hero**, smoked-glass internals → product spotlight / hero.
- `images/v2_traced-…mp4` — **7.06s silent product-reveal** (1664×1248, H.264, 24fps, 8 MB) → re-encode to web (WebM+MP4, strip audio, ~2–4 MB) + poster; use as the **product-reveal video** now.
- The Summit is **burnt-orange/copper anodized** (chrome handles/feet, diamond-lattice grille, smoked glass, pewter mountain medallion) → **Aurora copper = the product's own color.** Calibrate copper tokens to the anodized orange.

**Icon library:** `Lamprey Crossover Icon Assets/` — 12 **white line-art, transparent, dark-view** icons (Auto-Review, Code Window, Connect Apps, Default/Full Access, Plan, Plug-Ins, Reasoning Trace, Search, Thinking, Work Location, Worktree). Default treatment: keep white + copper glow behind (copper tint is a one-line filter flip). These are the "woven-in capabilities" layer.

**Other assets:** logo/medallion variants; **new inline SVG Woven Fabric schematic** (authored in P1). **Deprecated pending real photography (future session):** the AI-generated `images/hero-island-mountain.webp` mountain hero — the new hero is type-led with a clean imagery slot. **Retire:** old "Summit Series Product Imagery – [vertical]" rack shots, the cloud-vs-local **dollar** table, `Product` schema `offers.lowPrice/highPrice`.

**Stack:** static HTML; prod loads `css/style.min.css` (tool-minified, no in-repo script → regen with `npx clean-css-cli -O2 -o css/style.min.css css/style.css`); `js/main.js` (canvas starfield + IO fade-ins); Inter/Space Grotesk; Remix Icons. Confirmed technique specs in the research doc (offset-path Baseline-safe; `@property` Jul-2024 Baseline; main-thread caveat → comet orbs hero-only, border-beam for bulk cards).

---

## §3 — Resolved Decisions (locked 2026-07-04)

- **D1 — Neon = copper→white-hot comet.** Orbs/tails: `#fff7ed` core → `#fbbf24` → `#f59e0b` → transparent; calibrated to the product's anodized orange. Border-beam arc `#f59e0b`/`#fbbf24`.
- **D2 — Intro = reveal video, slot now.** Build `<video>`+poster machinery; the `v2_traced` MP4 (re-encoded) is the **product-reveal** video. A separate **mid-scroll narrative video** stays a **placeholder** (dropped in later).
- **D3 — Scope = `index.html` FULL REPLACE.** Replace the entire current homepage flow with the GoAbacus-modeled, Aurora-themed sections. Reusable Aurora classes → fast follow-on PSPR for other pages.
- **D4 — Edge-nodes = ALL content cards** via conic border-beam, **viewport-gated** (IO pauses off-screen) + hover/focus activation; comet orbs stay hero-only.
- **D5 — Social proof = "Behind the Summit" builder story** (John Dougherty / Basho Parks), not customer testimonials.
- **D6 — NO PRICING anywhere.** No dollar figures / tiers / per-token math; all price-adjacent CTAs → Contact Sales / Request Pricing / Book a Scoping Call. Strip `Product` schema prices.
- **D7 — Positioning = per-workstation.** Every workstation = its own server + rack + WSF/AOG built in; organizational, employee-by-employee. This is the copy spine.
- **D8 — No neon on the hero; hero imagery deferred.** Comet nodes live on a purpose-built **Woven Fabric schematic** (per-workstation nodes + WSF) and on card border-beams — **never on the hero photo** (a beam on a photo is wrong). The hero is **type-and-reveal-led, imagery-agnostic**; the AI-generated mountain imagery is **deprecated pending a real-photography decision in a future session** — leave a clean imagery slot, don't lean on the fake shot.
- **D0 — min.css:** resolved — regen via `npx clean-css-cli` (pinned in P0).

**Two working assumptions (veto in review):** (a) the `v2_traced` MP4 is the *product-reveal* video, separate from the later mid-scroll narrative video; (b) light-background product shots become intentional **light "product-spotlight" contrast sections** (GoAbacus rhythm) rather than being knocked out onto dark.

---

## §4 — Non-goals

- **No pricing / dollar figures** of any kind (D6).
- No framework, bundler, or build pipeline; no new runtime JS dependency. Vanilla only.
- No palette rebrand beyond calibrating copper to the product; no IA/nav restructure beyond the homepage's own sections.
- No changes to other pages, `worker/`, or the Rust workspace this round; no push to `main` unless explicitly requested.
- No motion that fails the accessibility/CWV gate to look flashier.

---

## §5 — File inventory & Preconditions

**Touched:**
- `index.html` — **full rebuild** (backed up first). New section stack (§6), Aurora hooks, new product imagery/MP4, Lamprey icons, contact-sales CTAs, price-stripped schema.
- `css/style.css` **and** `css/style.min.css` — Aurora tokens (copper calibrated), keyframes (`edge-travel`, `beam-spin`, `rise`, `charIn`, curtain, `marquee-scroll`), offset-path comet, `@property --angle` border-beam, curtain/stagger/split/rotator/marquee, product-spotlight light sections, consolidated `prefers-reduced-motion`.
- New: `js/hero-cinematic.js` (deferred) — curtain controller, split-text, rotator, IO stagger + IO beam-gating, offset-path sizing, reduced-motion guards.
- New assets: `images/hero-reveal-poster.webp`; `video/summit-reveal.webm` + `.mp4` (re-encoded, audio stripped); inline SVG dotted-grid; mid-scroll video **placeholder**.
- Retire references: old vertical rack imagery, dollar table, schema prices.

**Preconditions:** resolve nothing outstanding (D0 done). Working tree has unrelated uncommitted files + the AENEAS DRAFT — land a clean baseline before P0. Back up `index.html`.

---

## §6 — New homepage section stack (GoAbacus architecture → Island Mountain)

| # | Section | Content / assets (Aurora, copper, no pricing) |
|---|---|---|
| 1 | **Hero — Aurora Reveal** (type-led, imagery TBD) | Curtain → rotating letter-split H1 (per-workstation angle, e.g. "A Sovereign AI Server at Every Desk." / "Own Your AI. Own Your Data.") → badges (RTX PRO 6000 · Air-Gappable · 72-Hr Burn-In · WSF Built-In) → CTAs (Talk to the Builder · Book a Scoping Call), on a dark Aurora canvas (grid/vignette). **No neon here; no reliance on the AI mountain photo** — final imagery (real photography) is a future-session decision; leave a clean slot. |
| 2 | **Trust marquee** | Authority marks (HIPAA · ITAR/CMMC · OCAP · SOC2-track) + tech stack (NVIDIA Blackwell · DeepSeek · Llama · vLLM · OpenWebUI). Infinite CSS marquee. |
| 3 | **"Behind the Summit"** builder story | Full-bleed **Shot 1** + copper-gradient overlay; founder/direct-builder narrative (John Dougherty / Basho). |
| 4 | **Product spotlight** (light contrast section) | **Shots 2/3** + re-encoded **MP4 reveal**; the per-workstation appliance + pewter-medallion craft story. |
| ▶ | **Mid-scroll video placeholder** | Aurora-framed 16:9 slot + poster + copper shimmer ("coming soon"); you drop the narrative video in later. |
| 5 | **Copper-gradient statement** | "The New Architecture of **Sovereign** AI" + triplet (cloud made AI possible → local hardware makes it yours → Island Mountain weaves in security + governance) + CTA. |
| 5▸ | **Woven Fabric schematic** (Zenity pillar) | Purpose-built inline SVG: per-workstation nodes linked by traces, **copper→white-hot comet orbs flowing along the fabric** (data + governance in motion) — the literal picture of WSF/AOG. **This is the home of the traveling nodes.** Paired with the statement. |
| 6 | **Dark manifesto** | Over a Summit close-up: "For a decade, your data lived on someone else's servers. **That era is over.**" (two-tone copper/white). |
| 7 | **"Why Island Mountain"** — border-beam cards | All-cards border-beam + **Lamprey icons** + spec checklists framed as **woven-in capabilities** (per-workstation governance, air-gap, zero egress, no token fees, no lock-in). |
| 8 | **Aurora footer** | Per-workstation tagline + spec stats (192–384GB VRAM · 72-hr burn-in · WSF built-in — **no price**) + Products (Summit · Landfall) + Solutions (verticals) + Resources. |

### Sequential Prompt Roster (each ends at a QA STOP)

**P0 — Baseline, min.css, harness, asset intake.** Pin `clean-css` regen; clean baseline commit; back up `index.html`; `.js` bootstrap + inline critical curtain CSS + consolidated reduced-motion scaffold; re-encode MP4 (WebM+MP4, strip audio, budget) + generate poster; calibrate copper tokens to the product orange. *Verify:* page 200, no-JS unaffected, min.css regen proven, encoded video within budget. *Commit:* `chore(home): Aurora harness, copper calibration, product asset intake`.

**P1 — Aurora System core + Woven Fabric schematic (Zenity pillar).** Copper→white-hot **comet orb** (offset-path + tail, `offset-rotate:auto`) + `@property` **border-beam** utility (`.beam-card`) + Aurora keyframes/tokens; author the **Woven Fabric schematic** (per-workstation nodes + traces) as the comet showcase; prove border-beam on one card. *Verify:* orbs flow the fabric; reduced-motion static; mobile smooth; both CSS files. *Commit:* `feat(home): Aurora edge-node system + Woven Fabric schematic`.

**P2 — Hero rebuild (GoAbacus pillar).** New **type-led** hero — imagery-agnostic (no AI mountain photo; clean imagery slot for a future real-photography session); curtain hold → `--i` staggered entrance → letter-split rotating H1 → badges/CTAs (contact-sales), on a dark Aurora canvas (grid/vignette). No neon on the hero. *Verify:* no FOUC/CLS, LCP prompt, no-JS = finished, reduced-motion instant, **no pricing**. *Commit:* `feat(home): cinematic Aurora hero (type-led, imagery TBD)`.

**P3 — Story + product + marquee.** Trust marquee; "Behind the Summit" band (Shot 1 + narrative); product-spotlight (Shots 2/3 + MP4 reveal); mid-scroll video **placeholder**. *Verify:* marquee seamless, video autoplays muted/looped + poster fallback, light sections read as intentional, reduced-motion static. *Commit:* `feat(home): builder story, product spotlight, trust marquee`.

**P4 — Statement + manifesto.** Copper-gradient "New Architecture of Sovereign AI" + triplet + CTA; dark manifesto over Summit close-up. *Verify:* legibility, CLS zero, contrast, no pricing. *Commit:* `feat(home): sovereign-AI statement + manifesto`.

**P5 — "Why Island Mountain" cards + all-card border-beam.** Lamprey-icon cards with woven-in-capability checklists; `.beam-card` on every homepage card, **IO-gated** + hover activation; density/taste tune. *Verify:* all cards beam on-screen / off-screen paused, mobile smooth, reduced-motion static borders, degrade cleanly. *Commit:* `feat(home): woven-capability cards + copper border-beam (viewport-gated)`.

**P6 — Aurora footer + full-page QA & wrap.** Footer rebuild (no price); end-to-end QA (desktop/mobile, JS-off, reduced-motion, Lighthouse LCP/CLS/INP, **no-price grep**, NUL/`</html>`, both CSS in sync, schema price-stripped). DEVLOG; decide push + follow-on sitewide PSPR. *Commit:* `feat(home): Aurora footer + homepage QA`; push only if told.

---

## §7 — Completion criteria

- `index.html` presents a cinematic, Aurora-themed homepage on GoAbacus's architecture, telling the per-workstation sovereign-AI story with the new Summit photography + MP4 reveal.
- **Zero pricing**; all price-adjacent CTAs route to contact/sales; schema price-stripped.
- No framework/build added; prod `style.min.css` carries every change.
- JS-off and reduced-motion both yield the finished static page; CLS≈0; LCP not regressed.
- Border-beam on all cards (IO-gated); comet orbs on the **Woven Fabric schematic** (not the hero); Lamprey icons as woven-in capabilities.
- Each prompt committed atomically with the canon footer; pushed only on explicit instruction; DEVLOG per prompt.
