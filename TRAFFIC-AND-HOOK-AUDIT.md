# Traffic & Hook Audit — islandmountain.io
2026-07-10 · Data pulled live from the Cloudflare zone dashboard, GA4, and the Worker's D1 lead store.

## TL;DR

1. **The site does not have a conversion problem yet — it has a traffic problem.** Real human traffic is ~40 visitors/week (~6/day). Copy changes alone cannot produce buyers from that base.
2. **Every genuine lead count to date is zero.** All 23 rows in the D1 `leads` table are setup tests or launch-night voice-agent test calls (June 27–29). Nothing real has entered the funnel in 13 days live.
3. **The only working acquisition channel is LinkedIn** (37 of ~100 sessions last week). Organic search delivered **5 sessions**. The two 30-day traffic spikes are LinkedIn post spikes that decay to baseline within 48 hours — and the site has no mechanism to capture any of that spike before it evaporates.
4. **Every CTA on all six navbar pages is the same maximum-friction ask**: call the founder / book a meeting / complete a 4-step "Qualified Inquiry." There is no low-commitment step anywhere — no email capture, no downloadable asset, no calculator. A visitor who is 30% interested has literally nothing to do but leave.
5. **GA4 has zero key events configured**, so even if a conversion happened, nothing would register it. The Worker already carries the GA4 measurement ID — this is a wiring gap, not a build.

The fix is a two-layer capture system (an email-gated cost worksheet for cold traffic + a genuinely scarce founder's-build-slot offer for warm traffic), a handful of copy/label changes that lead with money and risk instead of ideology, and doubling down on the one channel that demonstrably works. Implementation plan: `PLANNING/HOOK-OFFER-PSPR.md` (DRAFT — awaits STS).

---

## 1. The numbers

### Cloudflare zone (dash.cloudflare.com, read live)
| Metric | Value | Window |
|---|---|---|
| Unique visitors | 8,110 | 30 days |
| Max / min visitors per day | 989 / 242 | 30 days |
| Total requests | 1,950 (88% uncached) | 24 h |
| Top countries (requests) | US 1,211 · CA 174 · UK 86 · SG 65 · IL 39 | 24 h |

**Read this skeptically.** Cloudflare "unique visitors" = unique IPs, bots included. The 242/day floor is crawler baseline (Singapore/Israel request volume is a bot tell; the account's AI Crawl Control page has recent activity). The 30-day chart shows a flat ~300–450/day baseline with two spikes — ~860 on Jun 21 and ~989 on Jul 5–6 — each decaying to baseline within a day or two. Those spikes line up with LinkedIn post activity, not durable channel growth.

### GA4 (property a394054102p536775890, last 7 days — the human truth)
| Metric | Value |
|---|---|
| Active users | **43** (40 new, 10 returning) |
| Key events (conversions) | **0 — none configured** |
| Sessions by channel | Direct 52 · **Organic Social 41** (linkedin.com 37) · **Organic Search 5** · AI Assistant 1 · Referral 1 |
| Page views | Home 255 · Summit 125 · Lamprey 82 · FAQ 42 · Blog index 20 |
| Cities | Willow Creek 6 (likely you) · New York 6 · Flint Hill 3 · Klamath 2 |

So: roughly **35–40 genuine third-party humans per week**, arriving mostly from your LinkedIn posts, reading the home page and Summit page, and leaving without a trace. Organic search is effectively absent despite ~60 pages and a deep blog — the domain is young and thin on backlinks; this is a time-and-distribution problem, not a content-quality problem.

### D1 `leads` table (the funnel's actual output)
23 rows total, **every one from the June 27–29 launch window**:
- 8 chat leads: all setup tests ("Test Clinic", "Acme Labs", "Booking Co", "Lopez Medical Group" with `utm_source=setup-test` / `ga4-setup-test` / `sheet-setup-test`).
- 15 voice leads: launch-night test calls (14 scored cold, orgs like "Sour", "Yurok Tribe / personal-home use", "Providence Hospital" with no contact details).
- **Genuine inbound leads since launch: 0.** Nothing at all since June 29.

The funnel machinery (chat, voice, scoring, D1, alerts, Cal.com) demonstrably works. Nothing is flowing into it.

---

## 2. Why the language isn't hooking

The through-line: **the site leads with ideology (sovereignty-as-architecture) and asks for a meeting; buyers lead with money and risk and want something for free first.** The best lines and the hardest numbers on the site all exist — they're just buried two pages deep while abstractions hold the hero positions. Page by page:

### Navbar
- **"Summit"** is an internal product name. A first-time visitor scanning the nav cannot tell it means "the servers." Rename the label **"AI Servers"** (page title can keep Summit Series branding).
- **"Security Fabric"** is defensible — it's the differentiator — but it's the second item a stranger sees and it's an abstraction. Fine to keep; the page behind it needs the work (below).
- **No Industries entry** even though the industry verticals exist and are the strongest empathy hook ("Tribal Nations", "Casino Gaming" — nobody else says that).
- The only button is **"Contact Sales"** — the highest-friction ask, with no value-first alternative anywhere in the chrome.

### Home (index.html)
- Hero: eyebrow "Hardware Sovereignty · AI Sovereignty" + H1 "A Sovereign AI Server at Every Desk." — concept-first, twice. The H1 is good brand; the *support* around it is where the hook belongs, and right now the rotator buries the money line ("No token fees") third in a 3-item rotation.
- **The single best line on the site — "Your most sensitive work has been renting space on someone else's servers. Bring it home." — is a mid-page transitional H2.** That is hero material.
- **No number appears above the fold.** Meanwhile the blog card three screens down says "break-even in under two months, five-year savings exceeding $3.5 million." The proof exists; it's just not where eyes land.
- Sole hero CTA: "Book a Scoping Call" — a meeting request from a visitor who has known you for eight seconds.

### Summit (products.html)
- H2 "Pre-Built Local AI Servers for **Commercial Enterprise Industries**" — three empty nouns; says nothing a buyer feels. The page's own FAQ has the killer stat: *a fully ramped rack serves 1,500–1,800 users on a one-time purchase.* That's a per-seat cost story begging to be the section header.
- Structure is specs-first (Blackwell, GDDR7, ECC). Specs convince the already-convinced; the ramp story ("start with two cards, grow to eight — no forklift") is the reassurance a buyer actually needs early.
- "Talk to the Builder" is excellent — keep that voice everywhere.

### Security Fabric (lamprey-woven-security-governance.html)
- Reads like an internal architecture document: fabric, custody, posture, evidence, boundary — abstract nouns stacked five high. H1 "Woven security and governance, from the cloud or fully air-gapped" contains no subject, no outcome, no threat.
- The FAQ page tells the same story concretely and brilliantly: *"The model can be tricked. The fabric is where the tricked action is stopped and logged."* That sentence — or the 2 a.m. version of it ("Your agent gets prompt-injected at 2 a.m. The fabric blocks the action, logs it, and wakes a human.") — should open this page.

### FAQ (faq.html)
- **The best copy on the site. Touch nothing.** "Who should NOT buy sovereign AI hardware?" and the new-company honesty answer are trust machines. The job is to harvest its best lines *upward* onto the pages people actually see (GA4: FAQ got 42 views to Home's 255).

### Resources (resources.html)
- Strong asset, wrong duty. These six briefs are **finished lead magnets being given away without capture**.
- ⚠️ **Pricing leak / doctrine conflict:** this page publicly prints "Summit Base ($59-69K one-time)" and "Systems start at $59,000" — directly against the site-wide quote-based, no-public-pricing posture. Either it's intentional anchoring (then the posture doctrine should say so) or it's a leftover to scrub. **Your call — flagged, not changed.**

### Contact (contact.html)
- "Submit **Qualified Inquiry**" — CRM language pointed at the customer; the visitor is being asked to pre-qualify themselves. "Four short steps, takes about three minutes" is a big ask at 6 visitors/day. Rename the button ("Send it to the Builder"), and give the not-ready visitor an instant-value alternative on this page (the worksheet below).

### Proposed line-level rewrites (for the PSPR)
| Where | Now | Proposed |
|---|---|---|
| Nav label | Summit | **AI Servers** |
| Home hero sub | rotator (3 lines, money last) | Lead with: **"Your most sensitive work is renting space on someone else's servers. Bring it home — and stop paying per token."** |
| Home hero proof strip (new) | — | **"Break-even vs. cloud in months · One rack serves 1,500+ users · Zero data egress, verifiable by your IT team"** |
| Home hero CTAs | Book a Scoping Call | Primary: **"See Your 5-Year Number →"** · Secondary: "Book a Scoping Call" |
| products.html H2 | Pre-Built Local AI Servers for Commercial Enterprise Industries | **"Pre-built, burn-tested, answering the day it lands in your rack."** |
| Lamprey H1 | Woven security and governance, from the cloud or fully air-gapped. | **"Every action your AI takes — identified, approved, and logged."** (sub: "Cloud-side or fully air-gapped.") |
| contact.html button | Submit Qualified Inquiry | **"Send it to the Builder"** |

---

## 3. The offer: a two-layer capture system

Both layers ride plumbing that already exists (Worker + D1 + Resend + Cal.com + GA4 id in `wrangler.toml`; the `leads` table even has a `docs_requested` column waiting).

### Layer 1 — cold traffic: "The Sovereign AI Cost Worksheet" (email gate)
An interactive 3-input mini-calculator (seats · queries/day or current monthly cloud spend · model tier) that renders **the visitor's own 5-year cloud burn curve on-page** — an alarming number computed from *their* inputs. Then the gate:

> *"Enter your work email and I'll send the full worksheet with your numbers filled in, plus the compliance brief for your industry."*

- **Preserves the no-public-pricing posture elegantly**: the page shows only their cloud trajectory; the Summit comparison line arrives privately in the emailed worksheet. The gate is *stronger* because the answer they want is behind it. (Alternative: show the comparison on-page using the $59–69K figure resources.html already publishes — only if you decide that leak is intentional.)
- Captures: email, industry, usage profile → D1 (`source='calculator'`), Resend sends the worksheet + brief, GA4 key event fires.
- Placement: hero primary CTA, a slim site-wide band, blog post footers (converts the LinkedIn spikes), contact page "not ready yet" path.
- Why this magnet: the $50K/month TCO post is the blog's proven resonator, and the six resource briefs are already-written attachments.

### Layer 2 — warm traffic: "The Founder's Build Slot" (name + email + phone)
The genuinely one-time deal, in founder voice — scarcity that is *true* because you hand-build every unit:

> *"I build every Summit myself, one at a time — which caps how many ship in a month. **August has [N] build slots.** Claiming one costs nothing and commits you to nothing: it holds your place in the build queue, and any quote we scope together is locked for 90 days — GPU market be damned. When the slots are gone, the next opening is September."*

- **Sweetener options** (pick one; all are real, none publish a price): 90-day locked quote (GPU price volatility makes this concretely valuable) · extended 1→3-year warranty on this quarter's builds · included on-site air-gap verification.
- Claim form: name, work email, phone, org, one-line workload — or claim by voice/chat (the agents already capture into D1 with scoring).
- Placement: homepage after the proof sections, Summit page bottom, contact page top, and the site-wide band alternates it with Layer 1.
- **Anti-slop rule: [N] must be your real monthly build capacity, stated by you.** No fabricated countdown timers, no fake "2 left!" — this audience (compliance officers, tribal IT directors, defense contractors) smells manufactured urgency instantly, and the site's credibility voice ("we would rather tell you now than after a serious capital purchase") is its best asset. The scarcity is real; state it plainly and it will out-convert any coupon theater.

### Why not a discount?
A percent-off banner is coupon language on a five-figure sovereign-infrastructure purchase — it cheapens the exact trust the FAQ page builds, and with no public prices a discount is unverifiable anyway. Locked quotes, warranty extension, and queue priority are the regulated-buyer versions of a deal.

---

## 4. Traffic (brief — the copy can't fix this part)

1. **LinkedIn is the only proven channel — feed it deliberately.** Both 30-day spikes are your posts. Every blog post should ship with a LinkedIn post the same hour; end every post with the calculator link (capture the spike before it decays — right now spike visitors leave nothing behind).
2. **Organic search needs time + links, not more pages.** 5 sessions/week says the content isn't the constraint; authority is. Cheapest wins: get the six resource briefs cited/linked from industry associations and tribal-tech newsletters; keep publishing; check Search Console monthly. (Ahrefs MCP is connected but the current plan blocks API pulls — the GSC link inside GA4 is already set up, 12 days ago.)
3. **"AI Assistant" already appeared as a GA4 channel** (chatgpt.com referral). The direct-answer brief format is exactly what answer engines cite — keep that format.
4. **Wire GA4 key events this week** (calculator email, form submit, chat/voice lead, tel: click). Twenty minutes of config; turns every future change into a measured experiment. Consider adding the Cloudflare Web Analytics beacon too — free, and it would make the CF dashboard reflect humans instead of bots.

---

## 5. Flags for your decision

1. **resources.html publishes $59–69K and "Systems start at $59,000"** — conflicts with the quote-based posture. Intentional anchor or scrub? → **RULED 2026-07-10: scrub site-wide** (now P0 in the PSPR).
2. **[N] build slots per month** — the offer needs your true capacity number before anything ships.
3. Cloudflare "unique visitors" (8.1k/30d) is not a KPI worth watching — GA4 active users is the number that means humans. Suggest treating GA4 as the scoreboard going forward.

Implementation is drafted as `PLANNING/HOOK-OFFER-PSPR.md` — five prompts, smallest diff that ships both capture layers and the copy changes. Awaits your STS.
