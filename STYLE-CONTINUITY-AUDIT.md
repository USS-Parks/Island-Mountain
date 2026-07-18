# Island Mountain — Site-Wide Style-Continuity Audit

**Date:** 2026-07-05 · **Author:** style-bible sanitation session
**Scope:** 37 root `*.html` + 24 `blog/*.html` (~61 live pages) + `css/` + `js/`.
**Excluded:** `Island Mountain Mighty Eel OS/` (deploy mirror + Rust workspace), `_work/`, `PLANNING/`, `worker/`, `node_modules`, `mai/target`.
**Method:** static analysis of markup, the shared stylesheets/scripts, and the design-token layer (`aurora.css`, `card-nodes.css`), cross-checked across all pages. This is a **structural** audit — see "Not covered" at the end for the live-render caveat.

---

## Verdicts at a glance

| # | Question | Verdict |
|---|----------|---------|
| 1 | Navbar uniform? | **Mostly — structurally identical on 60/61, but drifting** (homepage CTA + 3 outliers) |
| 2 | Footer uniform? | **Mostly — 2 hand-duplicated templates + 1 page with no footer** |
| 3 | Cards uniform? | **No — ~14 card classes, 3 radii, 3 surface tints, inconsistent hover** |
| 4 | Icons uniform? | **Yes (live site) — one webfont everywhere; 40 orphaned raster icons to clean up** |
| 5 | Brand-voice + theme consistent (mobile + desktop)? | **Theme: strong. Voice: mostly, with 3 concrete inconsistencies** |
| 6 | Node animations fire the same + aurora-conform? | **Yes where applied — single-sourced, identical; 1 host-box divergence (Summit)** |
| 7 | Weak points / inconsistencies? | See the prioritized backlog below |
| 8 | Failure points? | **2 structural: no shared nav/footer partials; no cache-busters on shared CSS/JS** |

**The one root cause behind most drift:** the navbar and footer are **hand-copied into all 61 files** — no server include, no build partial, no JS injection. Every chrome change is 61 manual edits, and the fleet has already split into template generations. This is the engine of future style drift; nothing else on this list matters as much.

---

## 1 — Navbar

**Canonical** (`index.html:77–103`): `<nav class="navbar">` + separate `<div class="mobile-sidebar">`, duplicated verbatim per page; `js/main.js` only wires behavior. 7 links in order: **Home → Security Fabric → Summit → FAQ → Blog → Resources → Contact Sales** (`.nav-cta`). Logo `images/logo-nav-new.webp` 205×65. Hamburger `aria-label="Menu"` + 3 bars → `.mobile-sidebar`/`.sidebar-overlay`.

| Sev | Page | Issue |
|-----|------|-------|
| **High (fleet-wide)** | `index.html` vs the other 60 | Nav CTA reads **"Contact Sales"** on the homepage only; all 60 other pages read **"Request Quote"** (verified). The flagship is the lone stale outlier vs. the quote-based pivot. |
| **Critical** | `blog/agentic-orchestration-security-map-interactive.html` | **No navbar at all** — bespoke masthead, no logo-home, no menu. Dead-end. |
| **High** | `bibliography.html:236–240` | Nav is **logo-only** — no links, no CTA, no hamburger, no mobile sidebar. |
| **Medium** | `contact.html:414–420` | Link order scrambled — **Resources hoisted above FAQ/Blog**. Only page with a reordered menu. |
| Info | site-wide | ARIA gap (uniform): hamburger has `aria-label` but no `aria-expanded`/`aria-controls`; `<nav>` has no label. |
| Info | `js/main.js:11–95` | References a Solutions dropdown/accordion (`.mobile-solutions-toggle`, `.nav-dropdown-menu`) that **no current nav contains** — dead code from a prior mega-nav generation. |

Copy-paste fingerprints (same render, different source lineage): missing `</li>` after Summit on many pages; stray FAQ indentation on ~40 pages; hamburger in two formatting styles. Harmless individually, diagnostic of the no-partial root cause.

**Hidden pages correctly unlinked** in the header nav everywhere (`pricing`/`why-island-mountain`/`landfall`). ✓

---

## 2 — Footer

Two hand-duplicated templates, no shared include:

- **Template A — `index.html` only** (`:378–459`): `footer au-footer`, `im-badge.webp` **200×183**, columns **Products / Solutions / Company**, a 16-link `au-linkfarm` SEO block, an `au-legal` disclaimer, icon-only social, **no newsletter**. Copyright: `© 2026 Island Mountain LLC. All rights reserved. Hand-built in California by Basho Parks.` Tagline: *"Sovereign AI infrastructure… California."*
- **Template B — the other 60 pages** (byte-identical): `footer`, `im-badge.webp` **210×192**, columns **Quick Links / Solutions / Company**, a `footer-newsletter` form, text-link social. Copyright: `© 2026 Island Mountain. All rights reserved. Founded by John Dougherty and Basho Parks.` Tagline: *"Local AI infrastructure for data-sovereign organizations. Colorado."*

| Sev | Page | Issue |
|-----|------|-------|
| **High** | `blog/agentic-orchestration-security-map-interactive.html` | **No footer at all.** |
| **Medium** | `index.html:448` vs `products.html:580` (+59) | Copyright wording split — homepage says *"Island Mountain LLC … Hand-built in California by Basho Parks"* (drops co-founder John Dougherty); the other 60 say *"Founded by John Dougherty and Basho Parks"*. Reconcile to one line. |
| **Medium** | homepage vs rest | **California vs Colorado** location conflict (see §5). |

Copyright **year is 2026 everywhere** (no stale years). Privacy + Terms present on every footer. Hidden pages unlinked. ✓

---

## 3 — Cards

**Not uniform** — the site runs ~14 card classes:
`.card` (403 uses) · `.risk-card` (273, the dominant non-node card) · `.related-card` (117, all blog) · `.beam-card` (60, node treatment) · plus bespoke `au-card`, `gpu-card`, `dash-card`, `blog-card`, `rc-card`, `scenario-card`, `lf-tco-card`, `product-card`, `room-card`, `tier-card`, `industry-card`, `stat-card`, `action-card`, `lamprey-card`.

Concrete divergences:
- **Corner radii — three in play:** `.related-card` 8px, `.card`/`.risk-card` 12px, `.au-card`/`.gpu-card` 16px. All three are legitimate tokens (`--border-radius-sm/­/lg`), but same-looking cards land on different radii.
- **Surface tint — three backgrounds:** `.card` `rgba(30,41,59,.7)` · `.au-card` `rgba(19,28,49,.72)` · `.gpu-card` `rgba(9,14,24,.88)` (inline, `products.html:284`). The aurora and Summit cards are visibly darker than the base card.
- **Hover behavior inconsistent:** `.card` lifts + shadow + copper border; `.related-card` copper border only; `.au-card` and plain `.risk-card` have **no hover**.

Two dominant systems (`.card`/`.risk-card` in `style.css`, `.related-card` in `blog.css`) mostly conform to the aurora palette; the bespoke per-page cards — especially the inline `.gpu-card` — are where drift lives.

---

## 4 — Icons

**Uniform on the live site.** One system everywhere: the **Remix Icon webfont** (`<i class="ri-*">`), loaded via `icons/remixicon.css` (also inlined in `style.min.css`), ~112 monochrome line glyphs, sized/colored by helper classes (`text-lg`, `icon-copper-mr`, `authority-badge-icon`) and tokens (`var(--copper)`, `var(--text-muted)`). Only ~9 one-off inline overrides site-wide.

- **Dead weight (High, off-page):** 40 `images/*-icon.{png,webp}` files (~24 MB) + 8 `images/ic-*.webp` are referenced by **zero pages** — a staged raster/aurora-tinted icon set that was never wired in. If it ever is, it will clash with the line-style webfont. Action = delete or intentionally adopt; not a per-page fix.
- Two legitimate inline-SVG pockets: `index.html:231` (the aurora orchestration map, correctly `role="img"` + `aria-label`) and the interactive blog page (15 self-contained UI glyphs).
- Minor a11y: webfont glyphs carry no `aria-hidden` (standard for decorative icon fonts; blanket pass optional).

---

## 5 — Brand voice + theme

### Theme — strong
- **`style.min.css` is a faithful, non-drifted minification of `style.css`** (both define the same 33 tokens, identical breakpoints and selectors). Only `style.min.css` is served; `style.css` is source. Not a stale-build risk. ✓
- **Colors are centralized as custom properties and reused** — even the big inline-`<style>` pages reference `var(--copper*)` tokens, not raw hex (raw-hex count ≈ 0 except a few dashboard status colors in `compliance-dashboard.html:148,317`).
- **Fonts self-hosted** (Inter + Space Grotesk, `font-display:swap`) on all 61 pages. Centralized 768px breakpoint ladder.
- **Wart — two parallel token namespaces:** `aurora.css:8` `--au-copper:#f59e0b` duplicates `style.css:14` `--copper:#f59e0b` (and the light/deep/slate variants). The **brand hues are identical** across both, so pages look consistent — but a palette change must be made in both files. Secondary values *do* drift slightly (card bg `.7`/`30,41,59` vs `.72`/`19,28,49`; border `.12` vs `.14`; muted `#94a3b8` vs `#93a3ba`).

### Voice — mostly disciplined, 3 concrete inconsistencies
Consistent where it counts: `air-gapped` 203 / "air gapped" 0 / "airgapped" 0 (hyphenation locked); `Summit Series` 81, no "Summit server"; `Security Fabric` 129 / `Woven Security` 49 / `Woven Sovereignty` 0; `data-sovereign` 92. The interrogative titles on the ~6 compliance pages ("Can Law Firms Use AI Without Waiving Privilege?") are a deliberate, consistent voice.

But:
1. **Location flips California ↔ Colorado.** `index.html` (5×, footer "Hand-built in California"), `basho-parks.html` (3×), `education.html` (3×) say **California**; 33+ pages, `about.html`'s title ("On-Premise AI from Colorado"), and all 60 standard footers say **Colorado**. `basho-parks.html`/`education.html` use **both** in-page. Pick one home state.
2. **The console's public name hasn't propagated.** "Aeneas" (the intended public name) appears **only on its own page, 12×**; the build codename **"Lamprey" appears 219×** — as the page filename, the page title, and the destination of the nav's "Security Fabric" link. Three names for one product (Lamprey / Aeneas / Woven Security & Governance Fabric).
3. **Lead category label drifts:** Local AI (index) / On-Premises AI (many) / **On-Premise AI** (about title — nonstandard singular) / Air-Gapped AI (government) / Sovereign AI (faq). Partly intentional per-page SEO targeting, but the top-line noun phrase isn't fixed, and `on-prem` (485) vs `on-premises` (380) both run heavy with no house rule.

Minor: title separators are mostly `|`, but `index.html`, `bibliography.html`, `compliance-dashboard.html` use `-`.

---

## 6 — Node animations

**Single-sourced and correct.** `css/card-nodes.css` + `js/card-nodes.js`, keyed on `.beam-card`. One 12px hollow white ring rides the top edge fast (0→30%), the right edge slower (30→70%), fades bottom-right, rests, loops — `auEdgeNode` 2.8s. Armed once on scroll-in by an IntersectionObserver (threshold 0.2), staggered via a rolling `--i` (CAP 8). Reduced-motion safe (JS no-ops + CSS hides `::before`). **No legacy orbit/comet/beam variant survives anywhere** — the retirement is complete.

- Applied on the 4 intended pages only — **index / faq / lamprey / products** — each loading *both* assets symmetrically. On the other ~23 card-bearing pages the cards intentionally have no node. (By design; flagged so "card uniformity" isn't confused with "node uniformity.")
- **One conformance blemish:** on `products.html` the node rides `.gpu-card` — an **inline-hardcoded box** (`:284`, `rgba(9,14,24,.88)`, heavier border) — while the other three pages ride `.au-card` (`aurora.css:158`, `rgba(19,28,49,.72)`). Identical animation, visibly darker host card. A second card grid on the same page (`.risk-card`) has no node — a within-page split.

The animation itself fires identically everywhere it's used; only its **host card box** on Summit is off-palette.

---

## 7 / 8 — Prioritized backlog (weak points + failure points)

**P0 — structural failure points**
- **No shared nav/footer partial.** Extract the navbar + footer to one source (build include or a small JS injector) so 61 copies stop drifting. This is the fix that prevents every future §1/§2 regression.
- **No cache-busters on shared assets.** `style.min.css`, `blog.css`, `card-nodes.css`, and every `.js` carry no `?v=` (only `aurora.css?v=2` does) → 24 h max-age means CSS/JS edits don't reach returning visitors. Add/version `?v=` on the shared bundles. *(Matches the known repo note; CANON §12-adjacent.)*

**P1 — visible inconsistencies**
- Reconcile the nav CTA to one label site-wide (homepage "Contact Sales" → "Request Quote").
- `blog/agentic-orchestration-security-map-interactive.html`: add at least a logo-home link + footer, and decide on the missing chat widget (only in-scope page with **no lead funnel**). Its `viewport width=1470` also makes it desktop-locked on phones — acceptable for a fixed infographic, but it's the one genuinely mobile-broken page.
- Fix the CA/CO location conflict; decide Lamprey vs Aeneas public naming.
- Restore canonical nav order on `contact.html`; give `bibliography.html` the full nav.

**P2 — consolidation / hygiene**
- Card system: converge the ~14 classes toward the two token-backed systems; align Summit's `.gpu-card` to `.au-card`; standardize hover.
- Collapse the dual `--copper` / `--au-copper` token namespace to one source.
- Delete (or intentionally adopt) the 40 orphaned `*-icon.{png,webp}` assets (~24 MB).
- Remove the double `remixicon.css` link and the orphaned Solutions-dropdown JS in `main.js`.

**Intentional islands (noted, not necessarily defects):** `landfall-product-line.html` loads no shared CSS/JS, no nav, a foreign Google-Fonts stack, and a 775-line inline `<style>` — a total theme island (and a hidden page per current posture); and the interactive map blog page is a self-contained artifact by design. Both are deliberate but sit entirely outside the design system.

---

## Not covered (method caveat)
This is a **static/structural** audit. It nails markup, stylesheet/JS load-out, tokens, and copy — but it does not *render* the pages. A live pass at a true 375×812 mobile viewport (+ desktop) would additionally catch rendered layout bugs the markup can't reveal (overflow, wrap, tap-target, actual node-animation firing). Recommended as the follow-up validation, page-by-page, if pixel-level mobile confidence is wanted.
