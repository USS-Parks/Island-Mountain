# FDF · F1 Positioning Inventory

Read-only sweep for `FORWARD-DEPLOYED-FACELIFT-PSPR.md`. Records what each surface claims today and what contradicts the forward-deployed posture. Line numbers are against `main` @ `012963b`.

**Correction to the PSPR:** `PLANNING/` is tracked in git, not gitignored. The PSPR, this inventory, and the spine get committed like every other plan in that directory.

---

## 1. The through-line problem

The site sells a **noun** (a pre-built box that arrives ready to run) at every level: nav label, titles, H1s, metas, JSON-LD, CTA buttons, footer legal, and the chat agent's own system prompt. The new posture sells a **verb** (we come learn your work, then build and deploy the system around it).

Three phrases carry most of the contradiction and recur site-wide: **"ships / shipped ready to run," "pre-built / pre-configured,"** and **"Talk to the Builder."** The builder identity is the deepest thread; it's load-carrying on `about.html` and appears as the primary CTA on several pages.

## 2. Core pages

### index.html
| Slot | Current | Line |
|---|---|---|
| `<title>` | "Local AI Servers \| Sovereign AI, One Workstation at a Time" | 20 |
| meta desc | "Pre-built, air-gappable local AI inference servers on NVIDIA RTX PRO 6000 Blackwell… Contact sales." | 21 |
| OG title/desc | "Sovereign AI, One Workstation at a Time" / "NVIDIA RTX PRO 6000 Blackwell. Contact sales." | 78–79, 85–86 |
| JSON-LD desc | "Pre-built on-premises AI inference servers…" | 92 |
| eyebrow | "Hardware Sovereignty · AI Sovereignty" | 140 |
| H1 | "A Sovereign AI Server at Every Desk." | 141 |
| rotator ×3 | "Bring it home." / "No shared cloud…" / "Every workstation, its own server and rack." | 145–147 |
| spotlight H2 | "A sovereign AI appliance, per seat." | 157 |
| spotlight body | "pre-built, air-gappable out of the box. Two NVIDIA RTX PRO 6000 Blackwell GPUs. Models pre-installed." | 163 |
| statement H2 | "Sovereignty is an architecture, not a subscription." | 212 |
| **process steps ×4** | **"Order → Hand-built in California → Shipped → Serving"** — "Delivered to your facility, ready to rack," "Plug in and it answers" | 226–229 |
| founder band | "Built by hand, in California." / "personally assembled and shipped direct to your facility" | 489–490 |
| build slot | "I build every Summit myself. A slot holds your place." | 501 |
| lead form | "Tell us what you need and we will tell you if we can build it." | 514 |
| cross-links | "One sovereign stack, from silicon to governance"; Contact card "Tell us your workload and headcount." | 554, 573 |

**Verdict: REWRITE.** The four process steps (226–229) are the single most contradictory block on the site: the entire customer journey is modeled as a purchase and a delivery, with no shadowing, no workflow study, no engineering. That block becomes the deployment arc.

Reusable as-is: the `au-hm-steps` grid takes exactly four `--i:0..3` slots, so the new arc must be four steps to reuse the CSS untouched. The Verticals, blog rail, lead form, and footer need no structural change.

### products.html
| Slot | Current | Line |
|---|---|---|
| `<title>` | "NVIDIA RTX PRO 6000 Blackwell AI Servers \| Summit Series" | 32 |
| meta desc | "Three AI server tiers… DeepSeek V4-Flash pre-installed on OpenWebUI, ready to run." | 33 |
| H1/H2/H3 | "Summit Series" / "One Rack. 1,500+ Users. Zero Per-Seat Fees." / "Pre-configured and ready to run inference the day it lands in your rack." | 346–348 |
| overview | "ships as a complete sovereign inference stack… assembled and air-gapped before it leaves the shop" | 362 |
| specs table | Summit Base vs Pinnacle, GPU/VRAM/bandwidth/PFLOPs | 375–432 |
| GPU cards ×6 | "Why Professional-Grade GPUs" — Blackwell arch, 96GB, drivers, ECC, bandwidth | 448–487 |
| AEO summary | "three on-premises AI server tiers… ready to run inference out of the box" | 520–522 |
| CTA | "Which Tier Fits Your Workload?" / "Talk to the Builder" | 527–530 |
| **BYO hardware** | **"We make other vendors' boxes work, too."** — DGX Sparks, Strix Halo, "a rack another integrator shipped and never configured… we wire the serving stack, set the air-gap configuration, and train your team on gear we didn't sell" | 550–557 |
| cross-links | "Beyond the hardware" / "Summit is the machine." | 564–565 |

**Verdict: REWRITE.** Hardware-spec-led from title to AEO summary; the page is a SKU sheet.

**Most valuable existing asset on the site for this repositioning is line 554.** The "Already Own Hardware?" section already states the swappable-substrate doctrine in Basho's voice, including DGX Spark and Strix Halo by name and the line "the hardware is rarely the problem," plus "train your team on gear we didn't sell." That is the new thesis, currently buried as the second-to-last section. It gets promoted, not written from scratch.

Note: the six GPU cards and the specs table are genuinely useful proof for a buyer who has already decided. They move down-page, reframed as "what we size to," rather than being deleted.

### about.html
| Slot | Current | Line |
|---|---|---|
| `<title>` | "About Island Mountain \| On-Premise AI from California" | 32 |
| H1 | **"Built in California. Shipped Ready to Run."** | 185 |
| hero sub | "Every system is assembled, configured, and shipped directly to your facility." | 186 |
| "Why we exist" | "pre-built GPU inference servers that arrive at your facility ready to run" | 198 |
| tiers para | "We build three tiers of hardware… ships with DeepSeek V4-Flash pre-installed" | 199 |
| leadership | "When you **buy a system**, the people who specced it, assembled it… answer your phone call" | 211 |
| | "You are not buying from a channel partner… You are buying from the builder" | 212 |
| Basho bio | "Founder \| Marketing & Sales Manager" — procurement fluency, "move from interest to signed contract" | 217–218 |
| approach | "Air-Gap Ready" + "One-Time Purchase" (2 cards) | 240–247 |
| MSP callout | "$100-150K per year to an MSP… support comes from the people who built your system" | 252 |
| markets | 11 verticals, each "Island Mountain hardware keeps regulated data on your premises" | 265–277 |
| CTA | "Ready to Talk?" / "Talk to the Builder" | 284–286 |

**Verdict: REWRITE.** The H1 is the purest statement of the old posture on the site. The identity is builder/manufacturer end to end ("buy a system," "buying from the builder," "Marketing & Sales Manager").

Keep and re-aim: the MSP callout (252) is already an anti-arms-length-vendor argument, which is exactly the forward-deployed argument; it needs almost no change. Basho's bio needs the deployment-engineering framing his own brief describes, not a sales title.

### faq.html
902 lines, question-led. Not enumerated exhaustively here; F6 works question by question. Structural note: `au-h1` + accordion pattern; the FAQ currently answers "what am I buying / what ships / what does it cost" and needs questions that answer "what does a deployment look like, how long are you on-site, who do you shadow, what do we end up owning."

**Verdict: REWRITE (question set + answers), structure preserved.**

### contact.html
| Slot | Current | Line |
|---|---|---|
| `<title>` | "Contact Sales \| Local AI Servers - Island Mountain" | 32 |
| H1 | "Contact Sales for Local AI Inference Hardware" | 158 |
| form H2 | "Contact Sales" | 167 |
| submit | "Claim a Build Slot" | 186 |
| panels | "Contact Information" / "What to Expect" / "Your Data, Your Terms" | 200–243 |

**Verdict: REWRITE (copy only).** Form mechanics, endpoint, and the `#claim-slot` anchor are untouched (the anchor is linked from index.html:503 and products.html:543).

## 3. Site-wide surfaces

- **Nav (all pages):** `Home · Security Fabric · AI Servers · FAQ · Resources · Careers · Contact Sales`. "AI Servers" and "Contact Sales" both sell the noun. Present in both the desktop `<ul class="nav-links">` and the `.mobile-sidebar` block on every page: two edits per page.
- **Footer brand blurb:** "Every workstation its own air-gappable server and rack… Hand-built in California." (index.html:586, repeated site-wide.)
- **Footer legal:** "Island Mountain LLC **designs, assembles, and ships pre-configured on-premises AI inference hardware**." (index.html:649, repeated site-wide.) This is the legal-language statement of the old identity and must state the services posture too.
- **Footer link farm:** "On-Prem LLM Appliance," "Request Pricing" (index.html:642, 646).
- **Footer Products column:** "Summit Series" (index.html:596).

## 4. worker/src/persona.ts (chat + voice agent)

| Line | Current | Problem |
|---|---|---|
| 13 | "Island Mountain builds **on-premises AI inference servers**" | Opening self-definition is the product, not the practice |
| 19–36 | Summit / Landfall / Citadel tier catalog with GPU counts and stock status | Agent sells SKUs; also lists **Landfall** and **Citadel**, which are not public posture |
| 22, 43–44 | Model list: DeepSeek V4-Flash, Llama 4 Scout / 3.3 70B, R1 70B Distill, Qwen | Two different Llama/Qwen versions listed at 22 vs 43; stale either way. Models must be described as swappable open-weight, not a fixed menu |
| 46–55 | Pricing economics; correctly forbids stating IM figures, but **states the $64,000–$220,000 cloud-TCO range** | Comparison figure, not IM pricing, so permitted under the pricing rule; flagged for F10 review only |
| 74 | Job #1: "Answer questions about Island Mountain's **on-premises AI servers**" | Qualification frame is tier/box selection |
| 79–83 | Qualifier asks "which Summit tier they're considering" | Should qualify on workflow, on-site access, and the people to shadow |
| 92–93 | "Island Mountain provides the **hardware + architecture**" | Omits the deployment engineering entirely |

**Verdict: REWRITE (F10).** Facts block, persona job list, and qualification criteria all restate the box posture.

## 5. Classification summary

| Class | Pages |
|---|---|
| REWRITE | index, products, about, faq, contact, + new methodology page |
| REFRAME | 11 industry pages, solutions, resources, why-island-mountain, sovereign-cost-worksheet *(detail in §6)* |
| TOUCH-UP | lamprey-woven-security-governance (one narrative thread, F8); site-wide nav/footer/legal |
| UNTOUCHED | investors, careers + 4 career detail pages, lamprey/index (IDE), blog/*, privacy, terms, style-guide, bibliography, hidden pages (pricing, landfall-*, why-local) |

## 6. Secondary pages

All 11 vertical pages are clones of one template, so F9 is mostly a set of repeated find/replace operations rather than 11 bespoke rewrites. Section order and classes are identical; line numbers drift by roughly ±5 between pages because hero and JSON-LD lengths differ.

### 6a. Shared template slots (F9 targets, in page order)

hero (`section.hero.hero-page`) → breadcrumb → **hero kicker** (`div.cta-hero-wrap`) → problem (`section-first`) → authority badges → **How It Works** (`card-grid-3`) → product photo (8 of 11) → **workflows** → variable slot → **cost table** → limitations ("What You Do Not Get") → regulatory context → power notice → FAQ → **disclaimer** (`div.founder-box`) → AEO summary → social proof → lead form (6 of 11) → **final CTA** → footer.

Pages without a lead form: casino-gaming, education, energy-utilities, insurance, research-labs. Pages without a product photo: financial-services, defense-contractors, energy-utilities.

### 6b. Repeated strings to replace once, everywhere

| # | String | Pages |
|---|---|---|
| 1 | JSON-LD `AggregateOffer` price block | 11 verticals — see §8a |
| 2 | `au-legal`: "designs, assembles, and ships pre-configured on-premises AI inference hardware" | 15 |
| 3 | Footer brand: "Every workstation its own air-gappable server and rack… Hand-built in California." | 15 |
| 4 | Hero kicker: "Every system is personally assembled and delivered direct." | 11 |
| 5 | Disclaimer: "Island Mountain is a hardware company, not a compliance authority." | 10 |
| 6 | `<h2>… Workflows Island Mountain Hardware Supports</h2>` | 11 |
| 7 | "See Full Specs" secondary CTA | 12 |
| 8 | Footer links "On-Prem LLM Appliance" / "Request Pricing" | 14 |
| 9 | `<h3>Hardware You Own</h3>` card in the How-It-Works triple | 9 |
| 10 | "Buyer selects at order… same VRAM budget" | 7 |
| 11 | "offers 96GB GDDR7 ECC memory per GPU, quoted on request" | 6 |
| 12 | Cost-table IM column "One-time purchase (quoted to your build)" | 11 |
| 13 | "Talk to the Builder" CTA button | 12+ |

### 6c. Page-specific notes

- **solutions.html** — densest contradictions. `:408–409` "Pre-Configured and Ready to Run… Rack it, plug it in, open a browser" is the single most on-the-nose line on the site. Also `:184`, `:199`, `:380` ("Standard Across All Industry Configurations"), `:415–416`, `:423`, `:468`. The "Every Build Includes" six-card grid at `:376–427` becomes "Every Deployment Includes."
- **why-island-mountain.html** — `:422` "boutique, personally-delivered AI hardware" is the identity statement to replace. Also `:104` and `:403` (both "arrives pre-configured… rack the server"), `:231`, `:246`, `:426` ("See What We Build"), `:447–448`. Its only CTA pair sits mid-page at `:424–428`; the page ends on an AEO summary with no closing CTA, so F9 should add one.
- **resources.html** — lightest touch. `:144`, `:197`, `:204`, `:221`, `:231`, `:260`, `:273`. Its `:197` cloud range ($64,000–$220,000+) reads uncomfortably close to the 59000/225000 schema range on sibling pages; once §8a is stripped, the ambiguity resolves itself.
- **sovereign-cost-worksheet.html** — bespoke page, no shared template, page-local `cw-*` styles. Currently the most compliant page on the site: every dollar shown is user-supplied or cloud-side. `:198` explicitly promises "the one-time Summit comparison we don't publish on the site," which is exactly the intended posture and should survive the rewrite intact. Only the footer strings (`:242`, `:286`) need the shared fixes.
- **research-labs.html:366** — "pre-order now, ships July 2026" is both the strongest product-catalog line and a stale date.

## 7. Assets already pointing the right way (reuse, don't invent)

1. **products.html:550–557** — the swappable-substrate doctrine, in his voice, naming DGX Spark and Strix Halo. Promote.
2. **blog/education-is-the-deployment.html** — "Forward Deployed Engineering is less a software discipline than an educational one; a good deployment leaves behind a team that thinks differently." Already the thesis, already published, linked from the homepage blog rail.
3. **career-deputy-forward-deployed-enterprise-engineer.html** — the company already hires for this role by name.
4. **about.html:252** — the anti-MSP argument is already an argument for embedded engineering over arms-length vendoring.
5. **blog/second-revolution-local-ai.html** and **blog/dgx-spark-vs-rtx-pro-6000-strix-halo.html** — the hardware-is-commodity and honest-sizing arguments, already published.

## 8. Pricing check — TWO PRE-EXISTING VIOLATIONS FOUND ON `main`

Correcting an earlier draft of this section, which claimed the baseline was clean. It is not. Neither finding was introduced by this phase; both are live on the site now.

### 8a. Island Mountain prices published in JSON-LD structured data (SEVERE)

13 files carry an `AggregateOffer` block with hard dollar figures. The posture in `CLAUDE.md` names JSON-LD explicitly, so this is a direct breach, and it is machine-readable and indexable rather than merely on-page.

| Files | Figures |
|---|---|
| 11 public vertical pages (law-firms:143, medical-practices:143, financial-services:145, defense-contractors:148, government:145, tribal-nations:148, casino-gaming:146, education:145, energy-utilities:145, insurance:145, research-labs:143) | `lowPrice 59000` / `highPrice 225000` |
| `pricing.html` (hidden, live at URL) :95, :134, :173 | `59000–69000`, `95000–120000`, `175000–225000` |
| `landfall-preorder.html` (hidden, live at URL) :115, :144, :173 | `7000–8000`, `9500–11500`, `15000–22000` |

**Why the repo's gate missed it:** the canonical grep is `Summit[^<]{0,60}\$[0-9]`. JSON-LD writes `"lowPrice": "59000"` with no `$` and no "Summit" within 60 characters, so the regression gate cannot see it. The gate needs a second pattern.

**Disposition:** F9 strips the price block from the 11 **public** vertical pages and reframes those nodes from `Product` to `Service`. The two **hidden** pages (`pricing.html`, `landfall-preorder.html`) are left untouched pending Basho's explicit call, since they are deliberately unlinked and their entire purpose is pricing; removing prices from them is his decision, not a compliance cleanup.

### 8b. `on-premises-ai-cost-comparison.html:274` (minor, fixed)

"…a one-time purchase for a Summit Base system, with annual operating costs of $3,000-$6,000" tripped the canonical grep. Reworded in F3 to drop the tier-plus-figure adjacency; the electricity operating figure stays, consistent with the "$100–$200/month" opex language used site-wide.

### 8c. Permitted figures (no action)

Cloud, competitor, regulatory, and market figures remain fine: blog rail excerpts, the MSP $100–150K/yr figure (about.html:252), the $64K–$220K cloud TCO range (persona.ts:52, resources.html:197), user-supplied calculator inputs (sovereign-cost-worksheet.html).

### 8d. Gate addition for this phase

Both patterns run at every commit:

```
grep -nE 'Summit[^<]{0,60}\$[0-9]' *.html          # canonical
grep -nE '"(low|high)Price"' *.html                 # JSON-LD, must be hidden pages only
```
