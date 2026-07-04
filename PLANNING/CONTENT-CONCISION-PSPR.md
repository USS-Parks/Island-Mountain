# P-SPR — Content Concision & Visual Variety (De-Bloat vs. Abacus Benchmark)

**Project:** islandmountain.io — site-wide content + hero-image strategy
**Author:** Basho Parks (with Claude)
**Created:** 2026-07-01
**Status:** DRAFT — awaiting review & green light. No content or image changes until P0 decisions are answered and approval is given.

---

## §0 — Operating Rules (read first)

1. **One prompt at a time.** Execute a single prompt, run its verify gate, then **stop and hand back for sign-off**. No batching, no "while I'm here." (Exception: P2-block below is pre-approved to run as a same-recipe batch across the 10 remaining vertical pages, but only after P1's recipe is explicitly signed off — see P0-D5.)
2. **sed-only HTML edits.** Per `CONVENTIONS.md`/`SESSION-RULES.md`: never use the Edit tool on any `.html` file, regardless of size. Use `sed` via Bash. After every write, run `tail -3 filename` to confirm the closing `</html>` is intact.
3. **No lossy image work, no size judgments.** Per standing direction, this plan does **not** touch compression, downscaling, or "this is too heavy" recommendations. Any hero-image change here is about *which visual treatment appears where*, never file weight. You decide size/quality tradeoffs.
4. **Non-destructive on content.** Before trimming any page, the current version is preserved in git history (already true) - no separate backup needed beyond normal commits.
5. **Verify gate per prompt** (all must pass before sign-off):
   - Site-wide verification script from `SESSION-RULES.md` (truncation + NUL byte scan) passes on every touched file.
   - JSON-LD still parses; `FAQPage` schema answers still match visible FAQ content exactly (per `CONVENTIONS.md`); `Product`/`AggregateOffer` fields untouched.
   - Word count re-measured and reported against the pre-edit baseline in §2.
   - Page still resolves 200 locally / renders correctly.
6. **Commit discipline.** One commit per approved prompt, conventional scoped message. **Push only when explicitly told.**
7. **Reversibility.** If a trimmed page reads worse (loses a claim, a regulation citation, or a schema-required answer), the fallback is to restore from the pre-trim git revision for that file, not to patch forward.

---

## §1 — Goal

Close the "bloated, non-tech-oriented" gap identified against `goabacus.co` (a direct competitor selling on-prem/air-gapped AI infrastructure into the same regulated-industry verticals) **without** touching the one thing that already works: the site's visual/UI consistency page-to-page. Two concrete levers, both evidenced below, not guessed:

- **Trim and consolidate repetitive content**, concentrated in the 11 industry vertical pages and the monolithic FAQ page, where length comes from a repeated template structure rather than repeated buzzwords.
- **Diversify the hero-image treatment** so the site doesn't read as the same stock-photo mood-shot 36 times in a row, borrowing specifically from what Abacus does differently (mixed treatments, including a literal product-hardware hero on a technology page).

---

## §2 — Source facts (measured 2026-07-01)

### A. Island Mountain — measured directly from the repo

| Page group | Count | Avg. words/page | Notes |
|---|---|---|---|
| 11 industry verticals | 11 | **2,243** (1,874–2,733) | Identical 18-part template per `VERTICALS.md` §"Vertical Page Template Sections", nouns swapped |
| Core marketing pages (index, about, why-island-mountain, solutions, products, technology, pricing) | 7 | 1,489 (1,132–2,110) | |
| Long-tail compliance pages (hipaa, itar-cmmc, attorney-client-privilege, cloud-act-tribal, air-gapped-ai-inference, on-prem-cost-comparison) | 6 | 1,087 (1,021–1,162) | Already tight - not a problem area |
| `faq.html` | 1 | **5,850** | One monolithic page, no equivalent exists on Abacus |
| `landfall-product-line.html` | 1 | 3,677 | Outlier, product-line page, out of scope here |

- **Hero images:** 36 of 39 top-level pages (92%) use the identical `.hero-photo` full-bleed treatment - one large AI-generated, industry-themed photographic image, same layout position, on every single page. **No other hero style exists anywhere on the site** - no product-hardware shot, no UI/dashboard screenshot, no abstract/diagram treatment.
- **Tone at the word level is already clean:** zero exclamation points in visible text site-wide; "actually," em-dashes, and other banned artifacts already removed per `CONVENTIONS.md` (50+ sessions of editorial discipline). This means the "frivolous/breathless" feeling is **not** coming from hype vocabulary - it's coming from **length and repetition of structure**.
- **Vertical page template repeats 10-12 H2 sections per page** (Cloud AI Problem -> What Local AI Means -> Workflows [3 sub-groups of 3] -> Model Selection -> Cost Table -> What You Do Not Get -> Regulatory Context -> on-page FAQ -> Testimonial-style close -> 2x CTA), stamped across all 11 pages with only the industry noun changed.

### B. goabacus.co — fetched directly, 2026-07-01 (6 representative pages + homepage, chosen to mirror IM's own page types)

| Page | Words | H2 sections | Hero treatment |
|---|---|---|---|
| Homepage | ~1,200-1,400 | 8 | Branded background image, headline overlay |
| `/solutions/financial-services` (vertical) | ~1,200 | 6 | Building photo, text overlay |
| `/solutions/credit-unions` (vertical) | ~2,200 | 8 | Building photo, text overlay |
| `/technology/on-prem-llm` | ~1,200 | 6 | **Literal product-hardware shot** (the "Go1" appliance) |
| `/company/about` | ~1,200 | 6 | Logo + typographic headline, no photo |
| `/pricing` | ~1,100-1,200 | 6 | Dark solid background, centered type, no photo |
| `/blog/complete-guide-on-premise-ai-banks` | ~6,500 | 13 | Building photo, overlay |

**What this data actually shows** (not what I assumed going in):
- Abacus's vertical/solution pages are **not dramatically shorter in raw words** than IM's (1,200-2,200 vs. IM's 1,874-2,733) - the difference is **fewer, more consolidated sections** (6-8 vs. IM's 10-12) carrying the same word count, instead of the same ideas re-chopped into many small repeating subsections.
- Abacus **has no monolithic FAQ page** - FAQ content is a short, page-relevant block embedded where it's used (e.g. "Pricing FAQ" on `/pricing`), not one 5,850-word standalone page.
- Abacus **mixes at least three distinct hero treatments** across the pages sampled (building-photo overlay, literal product-hardware photo, plain dark-background typography) - no single style dominates, and one of them is a real product shot, which reads as "we sell a tangible thing" rather than a mood image.
- Abacus's copy leans on **short, punchy, parallel-structured declarative sentences** as section punctuation: *"Your data center. Your models. Your rules."* / *"No black boxes. No improvisation."* / *"Member data never leaves your walls."* IM's copy is already clean of hype words but runs longer and more expository throughout - it doesn't use this rhythm device.
- Abacus **does** publish a 6,500-word long-form guide on its blog - length itself isn't the enemy everywhere, it's long-form content living where long-form is expected (a blog pillar post) vs. being the default on every commercial page.

---

## §3 — Open Decisions (need answers before P0 closes)

**D1 - Vertical-page target shape.** Recommend converging IM's 11 verticals toward Abacus's pattern: **~1,400-1,800 words across 7-8 consolidated sections** (down from ~2,243 words / 10-12 sections), achieved by:
- Merging "The Cloud AI Problem for X" + "What Local AI Means for X" into one opening section.
- Collapsing the 3-subgroup workflow-card grid into a single tightened set (drop from 9 cards to 5-6 highest-value ones per page).
- Removing the on-page FAQ block where it duplicates `faq.html` content verbatim (keep FAQ schema requirements intact - see D3).
Confirm this target range, or set a different one.

**D2 - Hero-image strategy.** Recommend:
- Introduce a second hero treatment on `technology.html` (and possibly `products.html`): a literal product/hardware shot of the Summit rack, mirroring Abacus's `/technology/on-prem-llm` pattern, replacing the current AI-generated mood photo there specifically.
- Leave the industry-thematic photo treatment on the 11 vertical pages (it's doing real work distinguishing one industry from another) but confirm whether you want any additional variation (e.g., a plain typographic hero on `pricing.html` or `about.html`, matching Abacus's non-photo pages).
Confirm scope: which pages (if any) get a treatment change, and whether new hero art needs to be produced (separate ask - this plan does not include image generation).

**D3 - FAQ.html restructuring approach.** Recommend splitting `faq.html`'s content: keep a shorter, curated top-level FAQ page (the highest-traffic/most-general questions, maybe 15-20 of the current set), and let industry-specific questions live only on their respective vertical page's FAQ block (already present per the template) rather than being duplicated in both places. Must preserve `FAQPage` JSON-LD validity throughout (schema answers must match visible content exactly per `CONVENTIONS.md`). Confirm this approach or propose an alternative.

**D4 - Scope: verticals + FAQ only, or also core pages?** Core marketing pages (index, about, why-island-mountain, solutions, products, technology, pricing) already average 1,489 words - much closer to Abacus's range already. Recommend a **light tone-pass only** on these (tighten a paragraph or two, introduce 1-2 punchy declarative-sentence moments per page) rather than a structural rewrite, since the real bloat is concentrated in the verticals + FAQ. Confirm this narrower scope, or expand it.

**D5 - Prompt granularity for the 10 remaining verticals.** After P1 proves the trim/consolidation recipe on one vertical page and you sign off on the resulting voice and length, do you want:
- (A) One prompt per remaining vertical page (10 more QA stops), or
- (B) 2-3 pages per prompt (4-5 more QA stops), since it's a mechanical application of an already-approved recipe, not new judgment calls each time.
Recommend (B) for pace, but this is entirely your call per the one-step-at-a-time preference.

---

## §4 — Non-goals

- No lossy compression, downscaling, or file-weight optimization of any image, per standing direction - you decide size/quality tradeoffs, not this plan.
- No navbar, footer, CSS layout, or cross-page UI changes - the site-to-site consistency already works and is explicitly not the issue.
- No changes to pricing figures, product specs, SKUs, or regulatory/compliance claims - accuracy is untouched; only prose length/structure and hero-image *choice* are in scope.
- No new pages, no new verticals, no changes to the 11-industry count.
- No touching `aeneas.html` or its in-flight GIF-float work (separate, currently-uncommitted PSPR in progress - see `PLANNING/AENEAS-GIF-FLOAT-PSPR.md`).
- No blog post rewrites - Abacus's own 6,500-word pillar post shows long-form is fine *on a blog*; IM's 21 posts are out of scope.
- No changes to the AI chat/voice funnel, schema architecture beyond what trimming requires, or sitemap/llms.txt structure (unless a page is genuinely restructured under D3, in which case only that entry updates).
- No push to `main` as part of this plan unless explicitly requested.

---

## §5 — File inventory & Preconditions

**Touched (pending D1-D4 answers):**
- 11 vertical pages: `tribal-nations.html`, `law-firms.html`, `medical-practices.html`, `casino-gaming.html`, `defense-contractors.html`, `financial-services.html`, `insurance.html`, `government.html`, `education.html`, `energy-utilities.html`, `research-labs.html`
- `faq.html` (restructure per D3)
- Possibly: `technology.html`, `products.html` (hero swap per D2)
- Possibly (light pass only, per D4): `index.html`, `about.html`, `why-island-mountain.html`, `solutions.html`, `pricing.html`

**Not touched:** navbar/footer includes (no template engine - would require a 39-file propagation, out of scope), `css/`, `js/`, blog posts, product schema data, `aeneas.html`.

**Preconditions:**
- Confirm working tree is clean (or that any uncommitted Aeneas-project changes are committed/stashed first) before starting P0, so this plan's diffs stay isolated and reviewable.

---

## §6 — Sequential Prompt Roster

> Each prompt ends at a **QA STOP**. Nothing proceeds without sign-off.

### P0 - Decisions & recipe design
- Lock D1-D5 with the user.
- Draft the exact "trim recipe" as a side-by-side before/after outline (section list only, not full prose) for one vertical page, for the user to react to before any prose is actually rewritten.
- Draft the FAQ split plan (D3): proposed top-level question list vs. per-vertical distribution.
- **QA STOP:** user confirms the recipe shape and FAQ split plan before any file is touched.

### P1 - Proof-of-concept: one vertical page rewrite
- Apply the approved recipe in full to one vertical page (recommend `tribal-nations.html`, already used as the worked example above).
- **QA STOP:** user reviews the new voice, section count, and word count against the D1 target. This is the sign-off that unlocks P2.
- Commit: `content(tribal-nations): consolidate + trim vertical page per concision recipe`.

### P2 - Remaining vertical pages (granularity per D5)
- Apply the identical, now-approved recipe to the other 10 vertical pages, in the batch size chosen at D5.
- **QA STOP:** per batch - spot-check word count + section count against target, confirm no regulatory claim or badge was dropped.
- Commit per batch: `content(verticals): consolidate + trim [pages] per concision recipe`.

### P3 - FAQ.html restructuring
- Split per the D3-approved plan: trim the top-level page, verify no orphaned schema answers, confirm each vertical's on-page FAQ block still matches its own schema.
- **QA STOP:** JSON-LD validation pass, word count before/after reported, no broken internal links to specific FAQ anchors (check blog posts / other pages that might deep-link into `faq.html#...`).
- Commit: `content(faq): restructure monolithic FAQ into curated top-level + distributed vertical blocks`.

### P4 - Hero-image strategy execution (per D2)
- Scope depends entirely on D2's answer. At minimum: swap `technology.html`'s hero to a product/hardware treatment if new art already exists, or flag that new art must be produced as a separate ask if it doesn't.
- **QA STOP:** visual review of the new treatment in context; confirm it doesn't clash with the still-consistent nav/footer chrome.
- Commit: `content(technology): hero treatment variation per concision plan`.

### P5 - Core-page light tone pass (per D4, if in scope)
- One or two tightened paragraphs + a punchy declarative-sentence moment introduced per core page (index, about, why-island-mountain, solutions, products, pricing) - not a structural rewrite.
- **QA STOP:** confirm nothing load-bearing (pricing figures, schema, CTA copy) was altered, only phrasing/length.
- Commit: `content(core-pages): light concision + tone pass`.

### P6 - Full-site QA & wrap
- Run the site-wide verification script (truncation + NUL byte scan) across every touched file.
- Re-measure word counts for all touched pages, report the actual before/after table against §2's baseline.
- Validate all JSON-LD (Python parse check per `SESSION-RULES.md`).
- Update `HANDOFF.md`, `KNOWN-ISSUES.md`, `VERTICALS.md` (template section list will have changed), and log the session in `DEVLOG.md`.
- Confirm with the user whether to **push** (and whether to bundle with the outstanding Aeneas nav-fix, if still uncommitted at that point).

---

## §7 — Completion criteria

- 11 vertical pages land inside the D1-approved word/section target, with no regulatory claim, badge, or schema answer lost in the trim.
- `faq.html` is no longer a 5,850-word monolith; FAQ content is discoverable where it's contextually relevant, with valid `FAQPage` schema throughout.
- At least one non-photographic-mood hero treatment exists on the site (per D2), breaking the current 36/39-page sameness.
- Site-to-site UI/CSS consistency is unchanged - nothing in this plan touches layout, nav, or footer.
- No lossy/size-based image judgment was applied anywhere.
- Every prompt is committed individually; nothing pushed without explicit instruction.

## §8 — Approval state
- [ ] D1 (vertical-page target shape) decided
- [ ] D2 (hero-image strategy scope) decided
- [ ] D3 (FAQ restructuring approach) decided
- [ ] D4 (core-page scope: light pass vs. excluded) decided
- [ ] D5 (P2 prompt granularity) decided
- [ ] Plan approved to begin P0
