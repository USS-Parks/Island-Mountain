# P-SPR — Blog Link Repair & Contextual Cross-Linking into the New Nav

**Project:** islandmountain.io — blog internal-linking + breakage repair
**Author:** Basho Parks (with Claude)
**Created:** 2026-07-06
**Status:** DRAFT — awaiting review & green light. No blog files are touched until §3 decisions are answered and approval is given.
**Motivation:** three-front blog audit (cross-linking · metadata · content-currency), run 2026-07-06 after the blog was demoted out of the top nav (now a "From the Blog" rail on `index.html` + `lamprey-woven-security-governance.html` only).

---

## §0 — Operating Rules (read first)

1. **One prompt at a time.** Execute a single prompt, run its verify gate, then **stop and hand back for sign-off.** No batching, no "while I'm here." (Exception: the per-post link additions in P2 may run as a same-recipe batch, but only after P2's recipe is signed off on the first post — see D5.)
2. **HTML edits follow `SESSION-RULES.md`.** Prefer `sed` for `.html`; after every write, run `tail -3 <file>` to confirm the closing `</html>` is intact and run the site-wide NUL/truncation scan. Surgical, single-string replacements are acceptable **only** with that post-write integrity check. The git hooks (`pre-commit` NUL/secret, `pre-push` HTML integrity) are the backstop — never `--no-verify`.
3. **No post-body rewrites.** Post prose is evergreen and already clean of hype per `CONVENTIONS.md`. This plan **adds links and fixes breakages**; it does not restructure or re-voice any article.
4. **Non-destructive.** Git history is the backup — no separate backups beyond normal commits. If a change reads worse, restore that file from its pre-change revision, don't patch forward.
5. **Verify gate per prompt** (all must pass before sign-off):
   - NUL/truncation scan + `</html>` terminator intact on every touched file.
   - JSON-LD still parses; BreadcrumbList / BlogPosting / canonical / OG / Twitter untouched (or improved) — never regressed.
   - Every internal link touched resolves to an existing file (no new 404s); the site-wide "dead internal link" scan is clean.
   - The contextual-link matrix (Appendix A) is re-measured and reported against the pre-edit baseline in §2.C.
6. **Commit discipline.** One conventional, scoped commit per approved prompt on the session branch `claude/epic-tesla-23avgb`. **Push the branch when the unit is done; merge to `main` (live) only when Basho explicitly says so.**
7. **Reversibility.** Every prompt is independently revertible; nothing is stacked such that one bad fix blocks the others.

---

## §1 — Goal

Repair the two gaps the audit surfaced, **without rewriting any post:**

- **A. Fix the concrete breakages** — one dead link (404), one product mislink, one malformed anchor, three dead deep-link fragments, one sitemap omission, and one un-canonicaled infographic page.
- **B. Rebuild the blog's internal linking into the new nav** — so posts feed the six nav pages contextually. Today **Security Fabric, FAQ, and Resources receive *zero* contextual inbound links from the entire blog**, and 9 of 23 posts link to none of the nav pages. Security Fabric is the glaring miss: it's topically adjacent to nearly every security/governance post yet no post body links to it.

Success = a re-run of the same audit comes back clean on breakages and shows every real post feeding ≥2 nav pages, with Security Fabric/FAQ/Resources no longer at zero.

---

## §2 — Source facts (measured 2026-07-06, three-front audit)

### A. Inventory
- `blog.html` (index) + **24 files in `blog/`** = **23 real posts + 1 chrome-less infographic** (`agentic-orchestration-security-map-interactive.html`, a fixed-width zoomable map embedded by its parent post; deliberately excluded from `sitemap.xml`).
- All 6 nav targets exist. `technology.html` does **not** exist and nothing links to it (good). `solutions.html` exists (footer sitemap link, valid).

### B. What is already healthy (do NOT touch)
- **Metadata:** all 23 real posts + `blog.html` carry correct, absolute-URL `BreadcrumbList` (Home → Blog → Post), `BlogPosting`, `canonical`, Open Graph, and Twitter Card (`summary_large_image`), with og↔twitter sync and og:url↔canonical parity. **Nothing breaks from Blog leaving the top nav** — the "Blog" breadcrumb/footer links target `blog.html`, which still exists.
- **Nav chrome:** every post's navbar + mobile sidebar + footer already matches the current 6-item nav (Home / Security Fabric / Summit / FAQ / Resources / Contact). No stale "Blog" tab, no removed items. No post-redesign nav rot.
- **"From the Blog" rails:** `index.html` + `lamprey-woven-security-governance.html` carry an identical rail (same 9 posts + "view all" → `blog.html`); all targets resolve.

### C. Contextual body-link matrix — the core gap (in-`<article>` prose only; excludes nav/sidebar/footer/breadcrumb/CTA/related-cards)

Column totals across the 23 real posts:

| Nav target | Contextual inbound links from blog |
|---|---|
| Home (`index.html`) | 3 |
| **Security Fabric (`lamprey-woven-security-governance.html`)** | **0** |
| Summit (`products.html`) | 6 |
| **FAQ (`faq.html`)** | **0** |
| **Resources (`resources.html`)** | **0** |
| Contact (`contact.html`) | 8 |

**9 real posts link to *zero* of the 6 nav pages contextually:** `agentjacking-fake-bug-report`, `ai-sovereignty-framework-tribal-nations`, `deepseek-v4-flash-local-deployment`, `h100-vs-h200-inference-comparison`, `itar-dfars-ai-self-assessment`, `msp-model-accountability-ticket-queue`, `on-device-llm-sovereign-edge`, `openai-discovery-risk-law-firms`, `second-revolution-local-ai`.

### D. Breakages found (concrete, file:line)

| # | Sev | File:line | Problem | Proposed fix |
|---|---|---|---|---|
| B1 | **MED (404)** | `blog/ai-search-visibility-consultant.html:333` | Related-Articles card links `href="msp-model-accountability.html"` — file does not exist. | Correct slug → `msp-model-accountability-ticket-queue.html`. |
| B2 | MED (mislink) | `blog/agentjacking-fake-bug-report.html:215` | "Lamprey MAI … governance layer" links `../lamprey/index.html`, which is the **free-IDE download** page, not the governance product. | Repoint to `../lamprey-woven-security-governance.html` (Security Fabric) — **pending D1**. |
| B3 | MED (markup) | `blog/eu-cada-…html:339` | Summit Pinnacle bullet: anchor closes mid-sentence, stray comma + unbalanced paren → renders "Summit Pinnacle ($175,000-$225,000, (pre-order now):". | Rewrite: `<a href="../products.html#summit-pinnacle">Summit Pinnacle ($175,000-$225,000, pre-order now)</a>:`. |
| B4 | LOW (dead frag) | `blog/eu-cada-…html:335,337,339` | Links to `../products.html#summit-base|ridge|pinnacle`; those exist only as JSON-LD `@id`, no matching HTML `id=` on the tier sections — page loads but never scrolls. | **Pending D2:** add `id="summit-base|ridge|pinnacle"` to the tier blocks in `products.html`, **or** strip the fragments. |
| B5 | LOW (sitemap) | `sitemap.xml` | `blog/ai-search-visibility-consultant.html` (a real, indexable, fully-instrumented post) is **absent** from the sitemap. | Add its `<url>` entry (the infographic stays correctly excluded). |
| B6 | LOW (thin page) | `blog/agentic-orchestration-security-map-interactive.html` | No `canonical`, no `robots`, no OG/Twitter — if crawled independently it could index as a thin orphan. | Add `<link rel="canonical" href="…/blog/agentic-orchestration-security-map.html">` (parent article) **or** a `noindex` robots meta. |

### E. Cosmetic / currency (candidate, pending D4)
- **Unclosed `<li>`** on the "Summit" nav item in ~21 posts (`<li><a href="../products.html">Summit</a>` with no `</li>`). Browsers auto-close; renders fine. Only `eu-cada` + `on-device-llm-sovereign-edge` have the closed form. Structural nit worth normalizing.
- **`ai-search-visibility-consultant.html`:** "Bedrock/Vertex … in progress for Q3 2026" (today is inside Q3 — time-box it); naming drift ("Lamprey MAI" / "Lamprey Harness" vs. current "Woven Security & Governance Fabric" + "Lamprey" taxonomy); rolling "three-plus years" claim.
- **`h100-vs-h200-inference-comparison.html`:** slug + `canonical`/`og:url` say `h100-vs-h200`, but the title/H1/body are entirely "RTX PRO 6000 Blackwell vs. H100" — "H200" appears nowhere. Stale slug (needs a 301 to rename — hence deferred).
- **`on-prem-vs-colo-vs-cloud.html:208`:** "labs running … in 2025 have" — past-year/present-tense mix.
- **Share images:** 22/23 posts share `hero-mountain.webp` for og/twitter image — valid, but per-post images would lift card CTR (out of scope; noted only).
- **Interactive infographic** has no back-link to its parent article/site (minor UX).

---

## §3 — Open Decisions (answer before P0 closes)

**D1 — `agentjacking:215` "Lamprey MAI" link.** Audit calls it *likely intentional* (the MAI inference substrate vs. the public Aeneas/Security-Fabric console are different things), but in-page it's described as "an inference governance layer that gates trust," and it currently lands the reader on a free-IDE download. **Recommend: repoint to `../lamprey-woven-security-governance.html`** (Security Fabric) since the sentence is about governance. Confirm, or keep it on `lamprey/index.html`.

**D2 — `products.html` tier anchors.** **Recommend: add `id="summit-base"`, `id="summit-ridge"`, `id="summit-pinnacle"`** to the three tier sections in `products.html` (fixes B3/B4's fragments, is reusable, and matches the existing JSON-LD `@id`s). Alternative: strip the `#fragment` from the blog links. Note: touching `products.html` is a **live nav page**, so this rides the normal branch→approve→merge flow.

**D3 — Contextual-linking target + density.** **Recommend:** every real post links **≥2** of the six nav pages in body prose with natural, descriptive anchors (no keyword stuffing); aggregate floors across the blog — **Security Fabric ≥8**, **Resources ≥6**, **FAQ ≥4** inbound contextual links (up from 0/0/0), Summit/Home/Contact stay ≥ current. Per-post proposed map in **Appendix A** (P0 refines it with you). Confirm the floors, or set different ones.

**D4 — Cosmetic/currency scope (§2.E).** **Recommend:** include the trivial, zero-risk touches (unclosed `<li>` normalization; the two date/tense fixes; the `ai-search` naming-drift alignment). **Defer** the `h100-vs-h200` slug rename (needs a 301 + sitemap/canonical update — separate call). Confirm include/defer per line, or exclude §2.E entirely from this PSPR.

**D5 — P2 prompt granularity.** After the link recipe is proven on the first post: (A) one prompt per remaining post (more QA stops), or (B) 3–4 posts per prompt (fewer stops, mechanical application of an approved recipe). **Recommend (B)** for pace — your call.

**D6 — Publish cadence.** **Recommend:** commit per prompt on the branch; do a single **merge-to-`main`** at the very end after full re-audit + QA (one Pages deploy), rather than publishing each post incrementally. Confirm, or publish per-phase.

---

## §4 — Non-goals

- **No post-body rewrites**, no new posts, no post deletions, no re-voicing.
- **No changes to the healthy metadata** (breadcrumb/canonical/OG/Twitter/BlogPosting) beyond B5/B6.
- **No nav/footer/CSS/JS changes** beyond the optional `<li>` normalization (D4) and the `products.html` tier `id`s (D2).
- **No touching the "From the Blog" rails** — they're healthy.
- **No per-post share-image production** (noted as a future CTR lever only).
- **No `h100-vs-h200` slug rename** in this PSPR (deferred — needs a 301).
- **No push to `main`** without explicit instruction; live publish only on Basho's word.

---

## §5 — File inventory & Preconditions

**Touched (pending decisions):**
- **Breakages:** `blog/ai-search-visibility-consultant.html` (B1), `blog/agentjacking-fake-bug-report.html` (B2), `blog/eu-cada-ai-sovereignty-us-regulated-industries.html` (B3/B4), `products.html` (D2 ids), `sitemap.xml` (B5), `blog/agentic-orchestration-security-map-interactive.html` (B6).
- **Contextual links:** the 9 zero-link posts (§2.C) at minimum, plus reinforcement posts per Appendix A to hit the D3 floors.
- **Cosmetic (D4):** ~21 posts (`<li>` fix), `ai-search-visibility-consultant.html`, `on-prem-vs-colo-vs-cloud.html`.

**Not touched:** the 6 nav pages' own content (except `products.html` tier ids), `css/`, `js/`, blog rails, post metadata that's already correct, `blog.html` layout.

**Preconditions:** working tree clean; on `claude/epic-tesla-23avgb` (rebased on latest `main`, which already carries the nav-page cross-linking + Woven-Security-page work shipped this session).

---

## §6 — Sequential Prompt Roster

> Each prompt ends at a **QA STOP.** Nothing proceeds without sign-off.

### P0 — Decisions & link-map design
- Lock D1–D6.
- Produce the final per-post contextual-link map (refine Appendix A): for each post, the target nav page(s) + the exact anchor phrase and the sentence it attaches to (using existing prose; add a short connective clause only where nothing natural exists).
- **QA STOP:** Basho signs off the map + decisions before any file is touched.

### P1 — Breakage fixes (B1–B6)
- B1 slug fix; B2 repoint (per D1); B3 anchor rewrite; B4 tier-id fix (per D2); B5 sitemap entry; B6 canonical/noindex on the infographic.
- **QA STOP:** dead-link scan clean (0 broken internal links), fragments now resolve to on-page ids, `sitemap.xml` well-formed, JSON-LD parses, integrity gates pass.
- *Commit:* `fix(blog): repair dead link, mislink, malformed anchor, tier fragments, sitemap + infographic canonical`.

### P2 — Contextual cross-linking (recipe → batch per D5)
- **P2a:** apply the approved recipe to ONE representative zero-link post (recommend `agentjacking-fake-bug-report` — also clears B2). **QA STOP:** Basho reviews anchor voice + placement. Sign-off unlocks P2b.
- **P2b:** apply the recipe to the remaining posts in the D5 batch size, prioritizing Security Fabric inbound links.
- **QA STOP per batch:** re-run the matrix (Appendix A); confirm every touched post ≥2 nav links and the D3 floors trending to target; no post body re-voiced; integrity gates pass.
- *Commit per batch:* `content(blog): add contextual links from [posts] into nav pages`.

### P3 — Cosmetic / currency (per D4, if in scope)
- Normalize the unclosed `<li>`; apply the date/tense/naming touches.
- **QA STOP:** integrity gates; confirm no schema/claim altered — phrasing only.
- *Commit:* `chore(blog): normalize nav <li> + minor currency touches`.

### P4 — Full re-audit, QA & publish
- Re-run all three audit checks (cross-link matrix, metadata, dead-link scan) and report the before/after matrix against §2.C.
- Site-wide NUL/`</html>` scan across every touched file; JSON-LD parse pass.
- Update `SEO-STATE.md` (internal-linking + sitemap counts) and log the session.
- **Per D6:** merge `claude/epic-tesla-23avgb` → `main` (single Pages deploy), watch the run to green, confirm live.

---

## §7 — Completion criteria

- **Zero** dead or mislinked internal links in any blog file (re-audit clean); B1–B6 all resolved.
- `ai-search-visibility-consultant.html` present in `sitemap.xml`; interactive infographic carries a `canonical` (or `noindex`).
- Every real post links **≥2** nav pages contextually; **Security Fabric / FAQ / Resources are no longer at zero** and meet the D3 floors.
- Healthy metadata (breadcrumb/canonical/OG/Twitter/BlogPosting) unchanged or improved — never regressed.
- All integrity gates pass; every prompt committed individually; published to `main` only on Basho's explicit approval.

## §8 — Approval state
- [ ] D1 (agentjacking link target) decided
- [ ] D2 (products.html tier ids vs. strip fragments) decided
- [ ] D3 (contextual-link floors + density) decided
- [ ] D4 (cosmetic/currency scope) decided
- [ ] D5 (P2 batch granularity) decided
- [ ] D6 (publish cadence) decided
- [ ] Plan approved to begin P0

---

## Appendix A — Proposed per-post contextual-link map (P0 refines)

Targets by topical fit. **SF** = Security Fabric, **Sum** = Summit, **Res** = Resources, **Home**/**FAQ**/**Contact** as labeled. Bold rows are the 9 current zero-link posts. "(has)" = link already present, keep.

| Post (`blog/…`) | Proposed nav links |
|---|---|
| **agentjacking-fake-bug-report** | **SF** (governance stops agent-jacking; also fixes B2), Sum |
| **ai-sovereignty-framework-tribal-nations** | SF, Res (OCAP/CLOUD-Act briefs), Contact |
| **deepseek-v4-flash-local-deployment** | Sum (hardware it runs on), FAQ (what runs on a rack), SF |
| **h100-vs-h200-inference-comparison** | Sum (RTX PRO 6000 tiers), FAQ |
| **itar-dfars-ai-self-assessment** | Res (ITAR/CMMC brief), SF, Contact |
| **msp-model-accountability-ticket-queue** | SF (audit ledger/accountability), FAQ, Contact |
| **on-device-llm-sovereign-edge** | Sum, SF, FAQ |
| **openai-discovery-risk-law-firms** | Res (attorney-client brief), SF, Contact |
| **second-revolution-local-ai** | Home, SF, Sum |
| agentic-orchestration-security-map | SF (strong), Sum (has) |
| attorney-client-privilege-cloud-ai | Res, SF, Contact (has) |
| cloud-ai-vs-local-hardware-tco | Sum, Res, Contact (has) |
| eu-cada-…regulated-industries | SF, Res, Sum (has) |
| grid-screaming-aquifers-on-prem-llm | Sum, Home (has) |
| hipaa-technical-checklist | Res (HIPAA brief), SF, Contact (has) |
| local-llm-vs-cloud-ai-hardware-gap | SF, FAQ, Sum (has) |
| ocap-cloud-act-guide | Res, SF, Contact (has) |
| on-prem-vs-colo-vs-cloud | Sum, Res, Contact (has) |
| openwebui-admin-setup-guide | Sum, FAQ, Contact (has) |
| tribal-data-sovereignty-ai-infrastructure | Res, SF, Contact (has) |
| tribal-sovereignty-data-centers-landlord-or-owner | Res, SF, Sum (has) |
| 50k-month-cloud-ai-local-llm-replacement | FAQ, Res, Sum+Home (has) |
| ai-search-visibility-consultant | Contact, Res, Home+Sum (has) |
| *agentic-orchestration-security-map-interactive* | *n/a — chrome-less infographic; add parent back-link only (B6)* |

**Projected floors after the map:** Security Fabric ~17 inbound · Resources ~11 · FAQ ~6 · Summit ~14 · Home ~5 · Contact ~12 — clearing the D3 recommendation with headroom. Final counts tuned at P0 to avoid over-linking any single post (cap ~3 nav links per post, varied anchors).
