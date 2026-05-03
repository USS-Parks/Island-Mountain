# Investor Page Overhaul -- Cowork Session Prompt

## Copy everything below this line into your next Cowork session.

---

## Context

I'm building the website for Island Mountain LLC (islandmountain.io), a startup selling pre-built, burn-tested on-premises AI inference servers with NVIDIA H100 and H200 GPUs. Founded 2026, Colorado. Founder is John Dougherty.

**Two critical files in the Island Mountain folder must be read before any work begins:**

1. `HANDOFF.md` -- Full project context: file inventory, tech stack, HTML patterns, CSS variables, brand colors, path mappings, and critical rules about file editing (never use Edit tool on files over 400 lines, always verify with tail checks, run the truncation verification script, etc.).

2. `Island-Mountain-Financial-Model.xlsx` -- Four-sheet financial model with live-sourced component pricing (May 2026), P&L projections, investment structure, and GPU market data. Read this spreadsheet thoroughly. Every number on the investor page must come from or be consistent with this model.

## The Core Pitch

This is the single thesis the entire page must serve:

> "The regulated AI infrastructure market is mandatory spend, not discretionary. The margin thesis depends entirely on GPU sourcing -- and used H100 prices are falling as hyperscalers upgrade to Blackwell. We need $500K to build the first three racks, prove the unit economics, and lock in supplier relationships before competitors figure out this gap exists."

Every section, every chart, every visual element either supports this statement or gets cut.

## The Hard Truth This Session Must Internalize

Island Mountain is pre-revenue, pre-product, and pre-customer. There is no shipped unit. No case study. No benchmark from a real deployment. The website reads like an established company, but the reality is: John needs $500,000 in seed capital to purchase the first GPU inventory, build the first rack, and ship the first unit.

Every other page on the site is set dressing until the investor page converts. This page is the only one that matters right now.

**Do not hide from this.** The site already has an honest disclosure culture (GPU upgrade transparency, refurbished GPU disclosure, compliance disclaimers). The investor page should feel like the most honest pitch deck a VC has ever read -- and that honesty itself becomes the differentiator.

## Current State of investors.html

- 294 lines, static HTML
- Uses Chart.js (js/charts.js + js/vendor/chart.umd.min.js) for graphs
- Has Organization JSON-LD schema
- Contains financial projection tables (Conservative, Moderate, Aggressive scenarios)
- Has risk disclosure cards
- Currently structured like a generic company overview with some charts bolted on

## Hard Numbers From the Financial Model

The following data is sourced from `Island-Mountain-Financial-Model.xlsx`. Read the actual spreadsheet to verify and extract additional detail. These are the key figures:

### Bill of Materials (Starter Rack -- 2x H100 80GB PCIe)

| Component | Low | Mid | High |
|-----------|-----|-----|------|
| 2x NVIDIA H100 80GB PCIe (refurb) | $48,000 | $66,000 | $71,340 |
| AMD EPYC 7413 24c/48t | $460 | $1,375 | $2,050 |
| Supermicro 4U GPU chassis (barebone) | $4,400 | $7,987 | $14,615 |
| 512GB DDR4-3200 ECC RDIMM (8x64GB) | $1,655 | $4,000 | $7,600 |
| 1.92TB NVMe U.2 boot drive | $215 | $552 | $1,675 |
| 3.84TB NVMe U.2 model storage | $228 | $839 | $1,074 |
| Redundant 2000W PSU | $0 | $475 | $950 |
| Cables, rails, misc | $150 | $300 | $500 |
| Assembly labor | $1,000 | $1,500 | $2,500 |
| 72-hour burn-in testing | $300 | $500 | $1,000 |
| Packaging & freight | $400 | $750 | $1,500 |
| **TOTAL COGS** | **$56,808** | **$84,278** | **$104,804** |

**GPUs represent 78.3% of total COGS.** This is the single most important number for investors to understand. A $5,000 reduction in per-GPU sourcing cost equals $10,000 more margin per rack.

### The Margin Problem and Opportunity

- Selling price range: $75,000-$85,000
- At mid-market GPU prices ($33K each): COGS = $84,278. **Gross margin is NEGATIVE 5.3%.**
- At aggressive GPU sourcing ($24-27K each): COGS = $56,808. **Gross margin is 24-33%.**
- The entire business model lives and dies on GPU sourcing relationships. This is not a weakness to hide -- it's the competitive moat to build. The company that locks in sub-$27K H100 supply first wins.

### P&L Projections (from spreadsheet)

Monthly fixed costs: $30,000 (rent, utilities, payroll for founder + 1 tech, marketing)

| Scenario | Y1 Units | Y1 Revenue | Y1 COGS/unit | Y1 NOI | Y2 Units | Y2 NOI |
|----------|----------|------------|--------------|--------|----------|--------|
| Conservative | 3 | $225,000 | $84,278 | ($394,584) | 8 | Improves |
| Moderate | 6 | $480,000 | $78,000 | ($362,400) | 15 | Improves |
| Aggressive | 10 | $820,000 | $72,000 | ($284,600) | 24 | Improves |

**All three scenarios show negative Year 1 NOI.** This is normal for a hardware startup in year one -- you're building infrastructure, not printing money. The $500K raise is primarily runway, not growth capital. Frame this honestly. Investors who understand hardware businesses expect this.

Break-even: 36 units/year at aggressive margins ($16K contribution/unit). Moderate margins ($2K/unit) require 180 units -- unrealistic. This reinforces: aggressive GPU sourcing is not optional, it's existential.

### Investment Structure

- Instrument: SAFE (Simple Agreement for Future Equity)
- Valuation cap: $2,500,000 pre-money
- Discount rate: 20%
- Total raise: $500,000
- Minimum check: $25,000
- Pro-forma seed ownership at cap: 16.7%
- MOIC at $5M Series A: 2.0x
- MOIC at $10M Series A: 4.0x

### Use of Funds ($500,000)

| Category | Amount | What It Buys |
|----------|--------|--------------|
| GPU inventory (6x H100 80GB PCIe) | $198,000 | First 3 Starter racks, 2 GPUs each at ~$33K market avg |
| Non-GPU components (3 builds) | $45,000 | Chassis, CPU, RAM, NVMe, PSU, cables per BOM |
| Assembly facility setup | $25,000 | Workbench, ESD equipment, test rigs, burn-in power circuits |
| Operating runway (6 months) | $180,000 | Monthly burn: $30K (payroll + overhead + marketing) |
| Marketing & sales launch | $20,000 | Trade shows, LinkedIn campaigns, vertical content |
| Legal & incorporation | $10,000 | LLC operating agreement, warranty terms, insurance |
| Working capital reserve | $22,000 | Buffer for GPU price volatility and unexpected costs |

### Milestone Timeline

| Milestone | Target | Deliverable |
|-----------|--------|-------------|
| Close seed round | Q3 2026 | Capital secured, LLC formalized |
| Facility operational | Q3 2026 + 4 weeks | Assembly workspace, burn-in power installed |
| First GPU procurement | Q3 2026 + 6 weeks | 6x H100 sourced, inspected, received |
| First Starter rack built | Q3 2026 + 10 weeks | Unit #1 assembled, configured, burn-in started |
| First unit ships | Q4 2026 | Rack #1 delivered to paying customer |
| 3 units shipped | Q1 2027 | Initial inventory sold, revenue validates model |
| Break-even month | Q2 2027 | Monthly revenue covers monthly operating costs |
| Series A readiness | Q4 2027 | 10+ units shipped, customer references, repeat orders |

### GPU Market Context

Refurbished H100 80GB PCIe average price (May 2026): **$30,548** per card.

Sources: ASA Computers ($30,971 new), IT Creations ($35,520-$35,670 refurb), GPU Poet April 2026 marketplace average ($38,075), industry refurbished estimate for bulk ($24,000-$27,000).

Key market dynamic: hyperscalers are upgrading from H100 to Blackwell (B200/B300). This is flooding the secondary market with used H100s. Prices will continue falling. Island Mountain's timing thesis: buy now while supply is surging and before competitors recognize the opportunity in the regulated mid-market.

## What the New Page Must Do

### Page Architecture (in order)

**1. Hero: The Pitch in One Breath**
Not "Invest in Island Mountain." Instead: "Regulated industries must own their AI infrastructure. We build it for them." Then the one-line thesis about mandatory spend, GPU timing, and the $500K ask. A single CTA button: "Schedule a Conversation."

**2. The Market (Why This Exists)**
Regulated data cannot touch the cloud. HIPAA, ITAR, attorney-client privilege, tribal sovereignty, FERPA -- these aren't preferences, they're legal requirements. Organizations in these verticals need AI but cannot use OpenAI, Claude, or any cloud inference provider for sensitive workloads. Quantify the TAM if possible (search for on-prem AI infrastructure market size, regulated industry IT spending). Link to the 5 vertical pages as proof of market research depth.

**3. The Product (What We Sell)**
Three tiers. Starter ($75-85K), Performance ($150-160K), Premium ($350-400K coming Q3 2026). Pre-configured with Ubuntu, vLLM, OpenWebUI, frontier models. 72-hour burn-in. 1-year warranty. Link to products.html for full specs. Keep this section tight -- the product pages already do the heavy lifting.

**4. Unit Economics (The Real Numbers)**
This is where the page earns investor trust. Show the BOM. Show that GPUs are 78% of COGS. Show the margin range from negative (at mid-market GPU prices) to 24-33% (at aggressive sourcing). Be completely transparent. The message: "We're not hiding behind rosy projections. Here's what a rack costs to build, here's what it sells for, and here's exactly where the margin comes from."

Use Chart.js to visualize: (a) COGS breakdown donut chart showing GPU dominance, (b) margin sensitivity to GPU sourcing price (line chart showing how margin changes as per-GPU cost moves from $35K down to $20K).

**5. Financial Projections (Three Scenarios)**
Conservative, Moderate, Aggressive -- already computed in the spreadsheet. Show revenue, COGS, gross profit, operating costs, NOI for Year 1 and Year 2. Use Chart.js bar charts. Be honest about negative Year 1 NOI. Frame it: "Year 1 is infrastructure. Year 2 is where unit economics prove out."

**6. The Ask (Use of Funds)**
$500K SAFE at $2.5M cap, 20% discount. Visual breakdown of where every dollar goes. The GPU inventory line ($198K) should be visually dominant -- investors can see their money is going into hard assets, not salaries. Pie chart or horizontal bar chart.

**7. Milestone Roadmap (Capital -> Revenue)**
Visual timeline from close to Series A readiness. Concrete dates, not "Q3-ish." Show what's already done (website live, brand established, market research complete, BOM specced, supplier channels identified) vs. what capital unlocks (first build, first sale, first revenue).

**8. Why Now (The Timing Thesis)**
Used H100 prices are falling. Blackwell upgrade cycle is flooding the secondary market. Regulated AI demand is surging. No competitor is building turnkey racks for the mid-market ($75-400K range) -- enterprise vendors sell $1M+ clusters, and DIY builders don't offer burn-in, warranty, or pre-configured software. First mover with supplier relationships wins.

**9. The Team**
John Dougherty -- founder bio, what makes him qualified. Link to johndou.com. If there are advisors, technical partners, or domain experts, list them. If not, be honest: "Lean founding team. Capital funds the first hire."

**10. Risk Disclosure**
Keep the existing risk cards but sharpen them. Investors respect founders who name their own risks: GPU price volatility, single-product concentration, pre-revenue status, competitive entry from larger players. End each risk with the mitigation strategy.

**11. CTA (Close the Loop)**
"Schedule a Conversation" -- routes to contact form or a dedicated Calendly link if one exists. "Request the Pitch Deck" -- email capture or direct PDF download link. Both CTAs should appear at least twice on the page (after unit economics section and at the bottom).

### Design Constraints

- Static HTML/CSS/JS, no frameworks, no build step
- Must match existing site design: dark theme, copper accent (#f59e0b), Inter font, Remixicon icons
- CSS custom properties are in css/style.css (read HANDOFF.md for full list)
- Page uses same navbar, footer, hero pattern as all other pages
- Chart.js is already loaded on this page (js/vendor/chart.umd.min.js + js/charts.js)
- The page will likely exceed 500 lines. Use sed via bash for any edits (per HANDOFF.md truncation rules). Build the page in sections.
- Follow all HANDOFF.md rules for file editing and verification
- Run the truncation verification script after every file modification

### Chart.js Specifications

The existing js/charts.js file will need to be rewritten. New charts needed:

1. **COGS Breakdown Donut** -- Segments: GPUs ($66K, 78%), Chassis ($8K, 9.5%), RAM ($4K, 4.7%), CPU ($1.4K, 1.6%), Storage ($1.4K, 1.7%), Labor/Testing ($2K, 2.4%), Other ($1.5K, 1.8%). Use copper/amber palette for GPU segment, slate grays for rest.

2. **Margin Sensitivity Line Chart** -- X-axis: per-GPU cost from $35K down to $20K. Y-axis: gross margin %. Show the crossover from negative to positive margin. Mark current market avg ($30.5K) and target bulk price ($25K). This is the most important chart on the page.

3. **Use of Funds Horizontal Bar** -- Categories from the Use of Funds table. GPU inventory bar should visually dominate. Copper for GPU bar, slate for rest.

4. **Revenue Projections Grouped Bar** -- Three scenario clusters (Conservative, Moderate, Aggressive) x 2 years. Show revenue vs. operating costs. Make it clear when each scenario turns profitable.

5. **Milestone Timeline** -- Could be a visual HTML/CSS timeline rather than a Chart.js chart. Horizontal line with milestone markers, dates below, deliverables above. Left side = "Done" (green/copper), right side = "Capital Unlocks" (amber/pending).

### Tone

Direct. Honest. Numbers-forward. No hype words. No "revolutionary" or "game-changing" or "disruptive" or any word on the banned list (see user preferences).

The page should read like a founder sitting across from you at a table saying: "Here's what this costs. Here's what it sells for. Here's where the margin comes from. Here's the risk. Here's what your money does. Here's the timeline. You in?"

That's the energy. Confident but not cocky. Transparent about weaknesses. Specific about numbers. The kind of pitch that makes a VC think "this person actually knows their business" instead of "this person is trying to sell me something."

### Banned Patterns

- No fake testimonials or implied customer traction that doesn't exist
- No "projected" or "estimated" without showing the assumptions
- No aggregate rating or review structured data (the company has no reviews -- GSC will flag it)
- No vague language about "significant market opportunity" -- use specific dollar figures or don't make the claim
- No motivational filler ("we're passionate about..." / "our vision is...")

## Deliverables

1. Complete rewrite of investors.html with all sections above
2. Complete rewrite of js/charts.js with the 4-5 new charts specified above
3. Verification that all 29 pages still pass truncation checks
4. Updated HANDOFF.md to reflect changes to investors.html and charts.js

## Important

Read HANDOFF.md before touching any files. It has rules that prevent file corruption. Follow them exactly. Read the xlsx financial model to verify all numbers before hardcoding them into HTML.
