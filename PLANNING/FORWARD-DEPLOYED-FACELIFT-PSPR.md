# FORWARD-DEPLOYED FACELIFT · P-SPR

**Phase:** Site-wide language + content overhaul, repositioning Island Mountain as a forward-deployed AI solutions consultancy and deployment expert.
**Author:** Claude, for Basho Parks. **Date:** 2026-07-24.
**Approval state: DRAFT. Awaits explicit STS approval. No edits, builds, or commits until then.**
**Relation to other plans:** does not supersede `AENEAS-GIF-FLOAT-PSPR.md` (separate scope, still queued).

---

## 1. Goal

Reposition islandmountain.io from "we build and ship air-gapped inference servers" to "we're the forward-deployed AI consultancy that embeds with your people, learns the workflow the way it's run (not the way the SOP describes it), then designs and deploys the local AI system around it."

The hardware story flips from moat to swappable substrate. We adroitly install whatever the workflow study says the org needs: a stack of DGX Sparks, RTX 5090s, RTX PRO 6000 Blackwells, all the way up to H100/H200 capacity. The same doctrine holds one layer up: open-source, open-weight models, swapped as the frontier moves, no lab lock-in. That a $7,000 laptop now runs open-weight models in the frontier weight class is market proof the second revolution has arrived; none of it is the pitch. The point is empowering organizations toward an independent on-site AI deployment tailor-fit to their needs and services. The value is the deployment engineering: translation and synthesis, sitting next to the senior paralegal who knows which intake questions matter, the records clerk in fiscal who knows which form gets filled out wrong every time, the compliance officer who knows where real organizational risk lives.

Anchor lines from Basho's brief (seed copy, verbatim):
- "Technology that ignores expertise gets ignored by the experts. When we build around them the on-premise deployment defends itself."
- "Show up, shut up, and learn the workflow the way they actually run it, not the way the SOP describes it. Then you fill in the gaps in conversation."
- "Learn the workflow, its nuanced cadence and battle rhythms first; then build the system around it."
- "The hardware isn't the point as much as empowering organizations toward an independent on-site AI deployment that is tailor fit for their needs and services." (2026-07-24 amendment)
- "Swappable stack, swappable Open Source Open Weight models." (2026-07-24 amendment)

Existing brand assets that already point this direction (reuse, don't reinvent): the careers page "Deputy Forward-Deployed Enterprise Engineer," the blog posts "The Second Revolution of AI: Local Inference Changes Everything" and "Education Is the Deployment," and the investors line "starts with hardware, doesn't end there."

## 2. Scope

- **Core positioning pages (full rework):** `index.html`, `products.html`, `about.html`, `faq.html`, `contact.html`.
- **One new flagship page:** the forward-deployment methodology page (name and URL decided at F2), added to nav, footer, sitemap.
- **Light-touch narrative pass:** `lamprey-woven-security-governance.html` (the fabric is what the deployment leaves behind).
- **Reframe pass:** the 11 industry pages + `solutions.html`, `resources.html`, `why-island-mountain.html`, `sovereign-cost-worksheet.html`. Pain hooks stay; solution/CTA framing shifts from buy-the-box to deploy-around-the-workflow.
- **Site-wide consistency sweep:** every public `*.html` checked against the F1 contradiction list; meta/OG/JSON-LD updated on every touched page.
- **Funnel agent alignment:** `worker/src/persona.ts`, `qualifier.ts`, `emails.ts` speak the new pitch. Worker deploy gated on explicit go.
- **Nav/footer labels** site-wide ("AI Servers," "Contact Sales" reconsidered at F2).

## 3. Non-goals

- No visual/design-system rework. Aurora treatment, card-node animation, css/js stack all stay as-is. This facelift is language and content.
- No URL renames, no redirects, no page deletions. Exactly one new URL (the methodology page). SEO equity is preserved: "local AI," "on-premises," "air-gapped" keyword presence survives in metas.
- Hidden pages stay hidden (`why-local`, `landfall-*`, `pricing.html` remain unlinked; posture unchanged).
- No blog rewrites. Existing posts are the record; only flagrant contradictions flagged by F1 get surgical one-line fixes. A launch blog post is a separate ask if Basho wants one (CANON §13: not volunteered).
- No pricing anywhere public, ever. Apple's $7K laptop figure is a market figure and fine; Island Mountain dollar figures are not. The private range stays only in `worker/src/emails.ts`.
- No funnel mechanics changes (endpoints, forms, booking, Vapi workflow attach). Copy only.
- No fabricated proof: hardware capability claims stay at the level Basho stated; no invented benchmarks, customer counts, or case studies.
- `investors.html`, `lamprey/index.html` (IDE), careers detail pages: untouched (F9 consistency check only).

## 4. Sequential prompt roster

Execution home: dedicated worktree + branch `session/forward-deployed-facelift` off current `main` (multi-session repo rule). One prompt = one commit. Heartbeat status line at every prompt boundary.

**F1 · Positioning inventory (read-only).** Sweep every public page + worker prompts. Produce `PLANNING/FDF-INVENTORY.md`: per page, its current claim, its classification (REWRITE / REFRAME / TOUCH-UP / UNTOUCHED), and every phrase that contradicts the new posture (e.g. "Shipped Ready to Run," "Contact Sales for Local AI Inference Hardware"). No site edits. No commit (gitignored output).

**F2 · Messaging spine. HARD CHECKPOINT.** One page of canonical language, drafted from Basho's brief in his voice: positioning one-liner; 2–3 homepage hero + rotator variants; the forward-deployment arc (working draft: Shadow → Translate → Build → Defend); the swappability doctrine at both layers: the stack (DGX Spark, RTX 5090, RTX PRO 6000 Blackwell, up to H100/H200 capacity) and the models (open-source, open-weight, swapped as the frontier moves), sized and selected after the workflow study, never before, and never the pitch; the SME vignettes. Plus the open decisions, his call, one word each:
  1. Methodology page name + URL (proposal: "Forward Deployed" at `forward-deployed-ai-engineering.html`).
  2. Nav labels (proposal: "AI Servers" → "Deployments," "Contact Sales" → "Start a Scoping Call").
  3. Does "Summit" survive as the engagement/build name? (proposal: yes, as the flagship engagement.)
  (A fourth question, how to handle hardware naming, is settled by Basho's 2026-07-24 ruling: hardware and models are never the pitch; named gear and named models appear only as the swappable spectrum.)
  **Full stop until Basho approves the spine. Nothing from it touches a page before that.**

**F3 · Homepage.** Rework `index.html`: hero, rotator, spotlight, section narrative, CTAs, meta/OG/JSON-LD. Verify: rendered check at desktop + true 375×812 mobile. Show rendered copy to Basho before F4 proceeds (second checkpoint, quick look).

**F4 · Methodology flagship page.** Build the new page from the F2 spine: the doctrine ("show up, shut up, learn the workflow"), the SME vignettes, the deployment arc, the "technology that ignores expertise" thesis, the second-revolution frame (commodity hardware, frontier-class open-weight models, both swappable, independence now practical). Wire into nav + footer site-wide, sitemap, internal links from blog posts that already tell this story.

**F5 · Products page.** `products.html` reframed from SKU to engagement: what a forward deployment delivers, hardware as the sized, swappable outcome (DGX Spark, RTX 5090, RTX PRO 6000 Blackwell, up to H100/H200), open-source open-weight models swapped as the frontier moves, fabric-ships-in-the-crate intact (WSF/AOG language preserved). Title tag loses "NVIDIA RTX PRO 6000 Blackwell AI Servers" as the lead.

**F6 · About + FAQ.** `about.html` from builder story to consultancy story (California build capability stays as capability, not identity). `faq.html` questions reframed: what does a forward deployment look like, how long are you on-site, who do you shadow, what hardware do we end up with, where does our data live.

**F7 · Contact + funnel surfaces.** `contact.html` (title, H1, form framing, Founder's Build Slot copy), `sovereign-cost-worksheet.html` framing. Mechanics untouched.

**F8 · Security Fabric bridge.** Light pass on `lamprey-woven-security-governance.html`: one narrative thread added, the fabric and console are what the deployment leaves behind; governance is why the on-premise deployment defends itself.

**F9 · Industry pages + site-wide sweep.** The 11 industry pages + solutions/resources/why-island-mountain: keep pain hooks, swap solution framing and CTAs. Then the full-tree sweep: every F1-flagged contradiction resolved or consciously left, meta/OG/JSON-LD consistent on all touched pages, sitemap current.

**F10 · Funnel agent alignment.** `worker/src/persona.ts` + `qualifier.ts` re-scripted to the new pitch (no pricing in any prompt), `emails.ts` language pass (private range stays put). `npm test` green in `worker/`. **Deploy held: `npm run deploy` fires only on Basho's explicit go.**

**F11 · Wrap.** Full verify ladder + gates below, DEVLOG complete, diff summary + rendered before/after presented. Merge to `main` locally. **Push to `main` (live site) and worker deploy: only on Basho's explicit order.**

## 5. Files

Core: `index.html`, `products.html`, `about.html`, `faq.html`, `contact.html`, new methodology page, `lamprey-woven-security-governance.html`, `sovereign-cost-worksheet.html`, 11 industry pages, `solutions.html`, `resources.html`, `why-island-mountain.html`, `sitemap.xml`, nav/footer blocks in all touched pages, `worker/src/persona.ts`, `worker/src/qualifier.ts`, `worker/src/emails.ts`. Planning artifacts (gitignored): `PLANNING/FDF-INVENTORY.md`, `PLANNING/FDF-SPINE.md`. DEVLOG: `PLANNING/FDF-DEVLOG.md`.

## 6. Verify gates (every commit; full ladder at wrap)

1. Git hooks as wired: pre-commit NUL/truncation + secret scan, pre-push site-wide HTML integrity. Never `--no-verify`.
2. Truncation-safe writes: `sed`-style targeted edits for large HTML; `wc -l` + `tail` after every write (SESSION-RULES).
3. **Pricing regression:** `grep -E 'Summit[^<]{0,60}\$[0-9]' *.html` returns zero; no new Island Mountain dollar figure in any HTML, JSON-LD, or agent prompt.
4. **Voice gate on added lines:** `git diff -U0 | grep '^+'` contains no em-dash, no "actually," no "heavy lifting," no "load bearing." New copy is contraction-heavy, in Basho's cadence.
5. Rendered checks for F3/F4/F5 at desktop + 375×812 mobile (structure, hero, nav, no layout breakage).
6. Link integrity: new nav/footer entries resolve on every touched page; no orphaned hrefs.
7. SEO guard: zero URL changes, keyword continuity in titles/metas, exactly one new URL.
8. Worker: existing test suite green before any worker commit.

## 7. Commit + DEVLOG discipline

One prompt = one focused commit on `session/forward-deployed-facelift`; footer stamped by hook, no AI credit. DEVLOG entry per prompt: what changed, files, gate results (red said as red), SHA. Blockers surfaced the moment they occur.

## 8. Completion criteria

- All roster prompts F1–F11 green, or consciously skipped with Basho's sign-off recorded in the DEVLOG.
- The site reads consultancy-first on every core page; no public page still leads with hardware-as-product; zero F1 contradictions unresolved without a recorded decision.
- All gates pass at wrap; branch merged to local `main`; push + worker deploy executed only on explicit order, or explicitly deferred.

## 9. Approval

**DRAFT.** Basho reviews. On his explicit "run it STS" (or amended instructions), execution begins at F1. His approval of this document does not pre-approve F2's spine (its own checkpoint) or the F11 push (its own order).
