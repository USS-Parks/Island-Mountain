# Project Aurora — Presentation Overhaul Research

**Site:** islandmountain.io (static HTML/CSS/JS, GitHub Pages from `main`)
**Goal of this doc:** decode goabacus.co (intro sequence) + zenity.io (neon edge-nodes) at the mechanism level, measure where Island Mountain stands, and prove a framework-free path to a GoAbacus/Zenity hybrid presentation level.
**Author:** Basho Parks
**Created:** 2026-07-04
**Status:** ✅ Research complete — feeds `PLANNING/AURORA-PRESENTATION-PSPR.md` (DRAFT).

> Codename **Aurora**: flowing neon light over a mountain — traveling nodes + a cinematic reveal.

---

## §0 — Method (six research passes)

Live inspection, not guesswork. Chrome DevTools-level probing of both live sites plus two dedicated web-research agents.

1. **IM codebase DNA** — read `js/main.js`, `css/style.css` design tokens, `index.html` head + hero + card markup.
2. **GoAbacus platform + network** — framework/library fingerprint via JS globals, script/asset waterfall, DOM composition.
3. **GoAbacus intro from t=0** — multi-frame capture of the reveal; extracted the exact mechanism (reveal video, letter-split headline, stagger, marquee).
4. **Zenity technique hypothesis test** — probed four competing hypotheses (SVG stroke-dash / canvas / conic border-beam / CSS Motion Path) against the live DOM.
5. **Zenity exact node spec** — introspected the live `<circle>` nodes, computed styles, and `document.getAnimations()` timing.
6. **Corroboration + guardrails** — two web-research agents confirmed current (2024–2026) framework-free implementations, browser support, performance, accessibility, and Core Web Vitals.

---

## §1 — Executive verdict

Both target effects are **fully reproducible in vanilla HTML/CSS/JS with no framework and no build step** — we stay on GitHub Pages and keep IM's existing performance discipline. Neither reference site uses magic; both use techniques that a hand-authored static site can match or beat:

- **GoAbacus's "incredible intro"** = a **layered choreography**, not one trick: a black "curtain" hold → a short muted reveal **video** as the hero backdrop → a **letter-by-letter rotating headline** → **staggered** badge/CTA entrances → an **infinite logo marquee**, over a **dotted-grid + gradient-vignette** hero. Their motion is JS-driven (Framer Motion) but the *feel* is reproducible with CSS `@keyframes` + a tiny class-toggle controller.
- **Zenity's neon edge-nodes** = **SVG orbs pinned to Bézier `offset-path`s, animated by tweening `offset-distance` 0→100%** — pure CSS, zero JS, zero libraries. This maps directly onto a static site, and when the path is a card's rounded-rectangle perimeter, the orb orbits the card's edge exactly as requested.

The single most important engineering fact: **`offset-distance` and animated `@property --angle` both run on the main thread (not GPU-composited).** That dictates a two-tier strategy — expensive-but-gorgeous offset-path orbs only on the **hero**, cheaper conic **border-beam** for the **many content cards**.

---

## §2 — Reference teardown A: GoAbacus intro (goabacus.co)

**Platform:** Next.js (App Router + Turbopack) + Tailwind CSS + Framer-Motion. No GSAP/Three/Lottie globals — motion is bundled React (`motion`) writing inline `transform`/`opacity` (measured: 59 elements with inline transform, 89 with inline opacity, zero CSS `@keyframes` running).
**Note:** GoAbacus is a **direct competitor** — "On-Premise AI for Regulated Industries," same market as IM. Their hero palette is **warm amber/gold** (golden-hour mountain), i.e. the same lane as IM's copper.

The intro is five stacked mechanisms:

| # | Mechanism | Evidence | Static-HTML equivalent |
|---|---|---|---|
| 1 | **Black "curtain" hold** ~0.8s | Frames 0–0.5s pure black, hero appears ~1.3s | `position:fixed` black overlay, fade/wipe out on load (critical inline CSS) |
| 2 | **Reveal video backdrop** | `<video>` `/video/go1-reveal.mp4` + poster `go1-reveal-poster.jpg`, muted/loop, JS-triggered | `<video autoplay muted loop playsinline>` + poster fallback (optional) |
| 3 | **Letter-by-letter rotating headline** | `<h1>` "On-Prem AI that" + rotating phrase where **every char is its own `<span>`** ("i n s u r e r s   c o u n t   o n .") | vanilla split-text (aria-label preserved) + `--char` stagger keyframe |
| 4 | **Staggered badge/CTA entrance + logo marquee** | badges caught dropping from top; logo row auto-scrolled between frames (OMERS/Mastercard→esurance/Farmers) | `--i` stagger keyframe; duplicated-track CSS marquee |
| 5 | **Dotted grid + gradient vignettes** | layered `absolute inset-0` divs: bg `<img>` `brightness-[0.65]`, `from-black/80 via-black/30`, grid overlay `opacity-[0.15] z-[2]` | SVG/tiled dotted grid at low opacity + layered gradient overlays |

**Takeaway:** the drama is *choreography and restraint* (hold on black, then a confident staggered reveal), not any single heavy library.

---

## §3 — Reference teardown B: Zenity neon edge-nodes (zenity.io)

**Platform:** Tailwind, **no animation library** — pure native CSS/SVG. Deep-indigo base (`#040222`), violet→cyan neon.

### The traveling-node spec (introspected from the live DOM)
- **Elements:** 10 SVG `<circle>`, each **124×124**, `fill: url(#logoBackgroundAnimationTail)` — a **radialGradient** (the glow *is* the gradient fill: `box-shadow:none`, `filter:none`).
- **Motion:** `@keyframes moveAlongPath { to { offset-distance: 100% } }` on **`offset-path: path("M 469.071 428.87 C …")`** cubic-Bézier traces, **20s linear infinite**, **`offset-rotate: auto`** (orbs orient to the path tangent).
- **"Stream of current" look:** multiple orbs share one path at staggered `offset-distance` phases (measured 0%, 20%, 40%, 50%, 70%) via negative `animation-delay`.
- **Scope truth:** these live in the **hero brand diagram**. Their **carousel cards** use a soft pulsing `::before { animation: glow }` radial-gradient; their **feature cards are static** (`border` color == `bg` color, no animated pseudo-element). Their isometric product visuals are **pre-rendered videos** (play-button MP4s), not live DOM.

### Honest implication for "nodes on cards and panels"
Zenity's literal traveling orbs are a **hero-diagram** effect. Applying edge-travel to *content cards* is a deliberate **extension** of that technique. Doing it on dozens of cards with offset-path orbs would be a performance mistake (see §5) — the correct scale-out is the **conic border-beam**, which reads as the same "light tracing the edge" but costs one animated property per card.

---

## §4 — Island Mountain today (DNA + gap)

**Stack:** hand-authored static HTML (~60 pages) + one `css/style.css` (prod ships `css/style.min.css`), `js/main.js`, Chart.js (vendored), Remix Icons, self-hosted Inter + Space Grotesk. No framework, no build. Deploys to `main` → Pages.

**Palette (`:root`):** slate base `--primary-dark:#0f172a` / `--secondary-dark:#1e293b`; **copper/amber accent** `--copper:#f59e0b`, `--copper-light:#fbbf24`, `--copper-deep:#d97706`; glass cards (`--card-bg: rgba(30,41,59,.7)`, `--glass-blur:16px`). **Warm copper, not neon-cyan** — the defining brand fact.

**What already exists (the bones are cinematic-ready):**
- `<canvas id="particles-canvas">` — a full-page starfield RAF loop that already color-shifts cool→warm on scroll (proves canvas motion is on-brand and accepted).
- `<div class="hero-photo">` — fixed Colorado-mountain hero photo, responsive `srcset`, `fetchpriority="high"`.
- `IntersectionObserver` `.fade-in` scroll reveals; CSS keyframes `chrome-cascade`, `float`, `pulse-glow`, `fadeInUp`.
- Glass cards: `.stat-card`, `.tier-card`, `.risk-card`, `.solution-card`, `.info-panel`, `.card-panel` — the "cards and panels" the nodes will trace.
- Performance discipline: deferred GA, `media=print` icon trick, font preload, minified CSS.

**The gap is choreography, not raw material:** the hero is *static and calm*. No intro sequence, static H1, no edge-node motion. Aurora is a **translation**, not a rebuild: hero photo + canvas → cinematic reveal; `.fade-in` → staggered entrance; glass cards → copper edge-nodes — keeping every perf habit already in place.

---

## §5 — The techniques, translated to static HTML (+ guardrails)

### 5a. Neon edge-nodes — two-tier, forced by performance
**Browser support:** `offset-path`/`offset-distance`/`offset-rotate` are **Baseline Widely Available (since 2022)** — safe. `@property` is **Baseline Newly Available (Jul 2024)** — safe on current browsers, static gradient on pre-128 Firefox.

**Critical perf fact:** `offset-distance` **and** animated `--angle` run on the **main thread** (Lighthouse flags them under "non-composited animations"). Therefore:

- **Hero diagram → offset-path SVG orbs** (Zenity technique). 1–5 nodes on one element is negligible. Glow = SVG `radialGradient` fill (never `filter: blur()` in bulk). Comet tail = a wide capsule with `linear-gradient(to right, transparent, copper, transparent)` + `offset-rotate:auto`.
- **Content cards → conic `@property --angle` border-beam.** One animated property per card; only the thin border band paints (via `mask-composite: exclude` / `-webkit-mask-composite: xor`). Scales to dozens of cards.

**Rounded-rect gotchas (carry into build):** `offset-path: border-box`/`shape()` is **not** production-safe alone in 2026 → author an explicit `path()` (or `rect(… round …)` modern-only). `path()` won't accept `var()` → for dynamic card sizes, set the whole `offset-path` declaration from ~8 lines of JS on load/resize (`roundedRectPath(w,h,r)`), or use the auto-sizing `rect()`.

**Node CSS (hero):**
```css
.node{
  offset-path: path("M16,0 H384 A16,16 0 0 1 400,16 V244 A16,16 0 0 1 384,260 H16 A16,16 0 0 1 0,244 V16 A16,16 0 0 1 16,0 Z");
  offset-rotate: auto;
  animation: edge-travel 20s linear infinite;
}
.node--2{ animation-delay:-6.66s } .node--3{ animation-delay:-13.33s }
@keyframes edge-travel{ to { offset-distance:100% } }
@media (prefers-reduced-motion: reduce){ .node{ animation:none } }
```

**Border-beam CSS (cards):**
```css
@property --angle{ syntax:"<angle>"; inherits:false; initial-value:0deg }
.beam-card{ position:relative; border-radius:16px; isolation:isolate }
.beam-card::before{
  content:""; position:absolute; inset:0; z-index:-1; border-radius:inherit; padding:2px;
  background: conic-gradient(from var(--angle), transparent 0%, #f59e0b 8%, #fbbf24 14%, transparent 22%);
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite:xor; mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  mask-composite:exclude; animation:beam-spin 6s linear infinite;
}
@keyframes beam-spin{ to { --angle:360deg } }
@media (prefers-reduced-motion: reduce){ .beam-card::before{ animation:none } }
```

### 5b. Cinematic intro — CSS owns motion, JS only toggles a class
State is one class on `<html>` (`is-ready`). Every "hidden" rule is scoped to `.js` so **no-JS users and crawlers get the finished page instantly** — no FOUC, no CLS, no cloaking.

- **Curtain:** `position:fixed` black overlay from *inline critical CSS* (exists on first paint); fades/wipes on fonts-ready or `window.load`; hold ≤0.8s; hard 4s safety net; `html:not(.js) #curtain{display:none}`.
- **Stagger:** one `@keyframes rise` + `animation-delay: calc(var(--i) * 90ms)` + `animation-fill-mode:both`. Below-the-fold reuses the same CSS, triggered by IntersectionObserver (extend IM's existing observer).
- **Split headline:** vanilla splitter wraps chars in `aria-hidden` spans, keeps `aria-label` full text + `role="text"`; `--char` stagger. Rotating phrase uses `display:inline-grid` stacking so the H1 **reserves the tallest phrase — zero CLS**.
- **Reveal video (optional):** `<video autoplay muted loop playsinline preload>` + poster; WebM+MP4; **2–5 MB budget** (≤10 MB), 720p, 10–30s; poster is the LCP candidate (preload it, `fetchpriority="high"`, never lazy-load).
- **Marquee:** duplicated track, `translateX(calc(-100% - var(--gap)))`, `aria-hidden` duplicate, pause on hover, reduced-motion wraps to a static grid.

### 5c. Accessibility + Core Web Vitals (non-negotiable)
- **`prefers-reduced-motion: reduce`** disables curtain hold, stagger, letter-split, rotator, video, and marquee — reduced-motion users get the *finished* design, static.
- **CLS = 0:** all intro motion is `transform`/`opacity` only; curtain is out of flow; rotator reserves height via grid-stack.
- **LCP protected:** H1 stays real HTML (splitter replaces existing text, doesn't create it); poster preloaded + `fetchpriority=high`; hero image never lazy-loaded; fonts preloaded with `font-display:swap`.
- **Main-thread budget:** offset-path orbs hero-only; `will-change` only on the 1–5 hero nodes (never blanket on cards); consider gating the hero orbs behind `(min-width:768px)`.

---

## §6 — Brand translation: copper, not cyan

Zenity is violet/cyan; GoAbacus is amber/gold; **IM is copper/amber** — and that's an advantage (GoAbacus proves warm reads as premium in this exact market). Aurora's neon vocabulary:
- **Node/orb gradient:** copper core `#fbbf24` → `#f59e0b` → transparent (optionally a white-hot `#fff7ed` center for the "electric" pop).
- **Border-beam arc:** `#f59e0b → #fbbf24` on the dark slate card.
- **Optional cool accent (decision D1):** a restrained electric-blue secondary (e.g. `#38bdf8`) *only* if we want a two-tone "current" like Zenity — a slight brand stretch to weigh.
- Everything sits on the existing slate base (`#0f172a`/`#1e293b`) and glass cards — no palette rebuild.

---

## §7 — Feasibility verdict & risks

**Verdict:** Green. No framework, no build step, no new runtime dependency. All techniques are Baseline-supported and degrade cleanly.

**Risks / must-handles:**
1. **`style.min.css` production path** — prod loads the *minified* CSS. Every CSS addition must reach `style.min.css` (confirm hand-minified vs. tooling before P1). *Highest-priority precondition.*
2. **Main-thread animation** — respect the two-tier split; profile on a mid phone; cap node counts.
3. **Reveal video production** (only if D2 includes video) — needs an actual asset produced to budget; otherwise pure-CSS reveal ships with zero new heavy bytes.
4. **Motion taste** — this is a compliance/sovereignty brand; the win is *cinematic restraint*, not a rave. Curated placement beats blanket motion.
5. **Scope creep** — ~60 pages share the CSS; a homepage-first flagship proof contains blast radius.

**Next:** decisions D1–D4 in `PLANNING/AURORA-PRESENTATION-PSPR.md` (DRAFT) → then STS.
