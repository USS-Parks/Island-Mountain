# P-SPR — Hook, Offer & Capture ("HOOK-OFFER")
Status: **DRAFT — awaits STS approval.** Author: session 2026-07-10. Companion findings: `TRAFFIC-AND-HOOK-AUDIT.md` (repo root).

## Goal
Convert the site from a single-ask brochure (every CTA = contact the founder) into a two-layer capture funnel: an email-gated cost worksheet for cold traffic and a real-scarcity "Founder's Build Slot" offer for warm traffic — plus the copy/label changes that put money and risk above the fold. Every layer lands contacts (name/email/phone) in the existing Worker → D1 → Resend → alert pipeline.

## Scope
- **Site-wide pricing scrub (RULED by Basho 2026-07-10): remove every public Island Mountain hardware dollar figure** — resources.html "$59-69K" and "Systems start at $59,000", plus a full-tree grep sweep (HTML, blog, JSON-LD/meta) for any other IM price. Sentences are rewritten to keep their claim honestly without the figure, never bullet-holed. **Cloud-cost figures stay** ($50K/month cloud spend, $64,000–$220,000+ API comparisons — they're the pain hook, not our pricing). The Summit comparison number survives only in the privately emailed worksheet (P3).
- Nav label rename (Summit → AI Servers) across all pages carrying the shared navbar.
- Homepage hero: sub-line, proof strip, CTA pair (per audit §2 rewrite table).
- products.html H2, lamprey H1/opening, contact.html button + "not ready" path.
- New: cost-calculator section/page (3 inputs → on-page cloud burn curve → email gate).
- New: Founder's Build Slot offer block (homepage, products, contact) + slim site-wide band.
- Worker: one new lead path (`source='calculator'` / `source='slot'`), Resend worksheet email, GA4 key-event beacons.
- GA4: define key events (calculator email, slot claim, form submit, chat/voice lead, tel: click).

## Non-goals
- No public pricing anywhere on-page (quote-based posture holds; the Summit comparison number travels only inside the emailed worksheet).
- No fabricated urgency: no countdown timers, no fake remaining-counts. Slot count is Basho's stated real capacity.
- No FAQ rewrites (best copy on the site — harvest lines from it, change nothing in it).
- No SEO/content-production workstream (separate effort; LinkedIn cadence is an ops habit, not a build).

## Inputs required from Basho (1–2 before P4; 3 before P3)
1. **[N]** — true build slots per month (and which month to launch with).
2. Sweetener pick: 90-day locked quote · 1→3yr warranty this quarter · included on-site air-gap verification.
3. Worksheet asset format: generated-per-lead numbers in the email body vs. attached PDF/XLSX template.

## Ordered prompts
- **P0 — Pricing scrub.** Full-tree sweep for IM hardware dollar figures (grep `\$5[0-9]|\$6[0-9]|59,000|69K|/query` and manual pass over resources.html + blog + structured data); rewrite each host sentence to hold without the figure; cloud-cost figures untouched. Pattern precedent: the 72-hour-burn-in scrub commit (`c703657`). Verify: grep gate returns zero IM price hits, affected pages render clean, NUL/`</html>` scan. One commit.
- **P1 — Labels & language.** Nav "Summit"→"AI Servers" site-wide; homepage hero sub + proof strip + CTA pair; products H2; lamprey H1/opening; contact button rename + not-ready path stub. Files: all HTML carrying the navbar; inline `<style>` where page-local (site CSS discipline per project memory). Verify: site-wide NUL/`</html>` scan, grep zero stale "Summit" nav labels, preview render desktop + 375×812.
- **P2 — Calculator.** `sovereign-cost-worksheet.html` (or homepage section + page, decide at build): 3 inputs, on-page 5-year cloud-burn curve (vanilla JS, no deps), email gate form. Static math constants in one JS object. Verify: preview interaction (fill → curve renders → gate appears), a11y labels, mobile viewport.
- **P3 — Worker capture path.** Extend the existing form-lead endpoint pattern for `calculator` and `slot` sources: D1 insert (reuse `leads` columns incl. `docs_requested`), Resend worksheet/confirmation email, alert email on `slot` claims, GA4 Measurement Protocol event. Rate-limit reuse. Verify: `wrangler dev` smoke (both paths insert + email stub), then deployed smoke with a test row tagged `utm_source=hook-offer-test`, then delete test rows.
- **P4 — The offer surfaces.** Founder's Build Slot block (founder-voice copy per audit §3, slot count [N], chosen sweetener) on home/products/contact; slim site-wide band alternating Layer 1/Layer 2; blog-post footer CTA include. Verify: band renders on every navbar page, no CLS on load (PageSpeed guard), links resolve.
- **P5 — Measurement & wrap.** GA4 key events defined in the property; tel:-click + form-submit beacons; confirm events register in GA4 realtime; DEVLOG entry; single live check post-deploy. Verify gate: full ladder green, no-slop scan, one live-prod pass — then stop (CANON §13).

## Commit / deploy discipline
One prompt = one commit on `main` (or `session/hook-offer` if concurrent sessions are live — worktree-first per project memory). Footer via hook. Push only on Basho's explicit order; site deploys from `main` via the concurrency-gated Pages workflow. CSS `?v=` bump if `style.min.css` changes.

## Completion criteria
- A cold visitor can leave an email and receive the worksheet without ever booking a call; the lead lands in D1 with `source='calculator'`.
- A warm visitor can claim a build slot with name/email/phone; Basho gets the alert; D1 row `source='slot'`.
- GA4 shows ≥5 configured key events; hero shows a number before the fold; zero fabricated-urgency artifacts in the tree.
- Grep gate clean: zero public Island Mountain hardware dollar figures anywhere in the tree.
