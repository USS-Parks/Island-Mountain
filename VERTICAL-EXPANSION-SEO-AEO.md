# Island Mountain: SEO & AEO Revision Spec for 5 New Verticals

**Status:** Pages live as of 2026-05-03. This document specifies surgical SEO/AEO revisions.
**Scope:** Product schema injection, FAQ answer enrichment, AEO block enhancement, heading keyword optimization, keyword-to-section placement, and solutions hub meta updates.
**Execution:** 4 self-contained Claude Code session prompts (SEO-SESSION-1 through SEO-SESSION-4).

---

## GAP ANALYSIS: LIVE STATE vs. TARGET STATE

All 5 pages (financial-services.html, insurance.html, energy-utilities.html, government.html, education.html) are live on islandmountain.io. Crawl confirmed 2026-05-03. Here is what exists vs. what this spec targets.

### What Is Already Live (no changes needed)

- Pages exist with full content, correct URL structure, proper nav/sidebar/footer integration
- FAQPage JSON-LD schema present on all 5 pages (4 Q&A pairs each)
- BreadcrumbList JSON-LD schema present on all 5 pages (Home > Solutions > Industry)
- AEO summary blocks present with copper left border styling
- Meta title, meta description, canonical URL, OG tags, Twitter Card tags all present
- Visual breadcrumb navigation present
- Internal links to solutions.html, products.html, contact.html present
- Sitemap.xml includes all 5 URLs. llms.txt lists all 10 verticals.

### What Needs Surgical Revision

**1. Product JSON-LD Schema (MISSING -- 0 matches on all 5 pages)**
Each page needs a new script type="application/ld+json" block injected into the head, containing the Product schema from this spec. This is the single largest SEO gap.

**2. FAQ Answer Enrichment (live answers ~40% shorter than target)**
Live FAQ answers average ~500 chars. Target answers in this spec average ~850 chars. The enriched versions add: specific regulatory citations (16 CFR Part 314, 20 U.S.C. 1232g, etc.), explicit "Island Mountain" brand mentions (2x minimum per page), GPU model references (H100/H200), pricing anchors ($75K-$85K Starter), and Section 179 depreciation mention.

**3. AEO Summary Block Enhancement**
Live AEO blocks state the compliance benefit but omit: pricing ("Systems start at $75,000"), GPU model names ("NVIDIA H100/H200"), and air-gap capability mention. Target AEO blocks in this spec include all three.

**4. H2/H3 Heading Keyword Optimization**
Live headings are close but miss keyword integration. Examples:
- Live: "Workflows Island Mountain Hardware Supports" -> Target: "AI Workflows Island Mountain Hardware Supports"
- Live: "Which Models Work Best" -> Target: "Which Models Work Best for Financial Tasks"
- Live: "Questions Financial Institutions Ask" -> Target: "Questions Financial Institutions Ask About Local AI"

**5. solutions.html Meta/Schema Updates**
Meta description still lists only original 5 verticals. FAQPage schema answer references "five" sectors. Both need updating to 10. Hero subtitle, AEO block, and OG description also need the expanded list.

**6. Keyword-to-Section Placement (not yet applied)**
100 long-tail keywords (20 per vertical) mapped in sections 2-6 below have not been woven into body copy. This is the most labor-intensive revision.

**7. Internal Cross-Linking Between Verticals**
New pages need cross-links to related verticals (insurance->medical-practices for HIPAA, government->defense-contractors for CUI, etc.). Map in Section 7.

### Edit Rules for All Revisions

All 5 new vertical pages are over 500 lines. Use sed via bash for every edit. Never use the Edit tool on these files. After every modification, run: tail -3 filename to verify the file ends with the closing html tag. Before declaring any session complete, run the truncation verification script from HANDOFF.md.

---

## TABLE OF CONTENTS

0. [Gap Analysis: Live State vs. Target State](#gap-analysis)
1. [Entity & Structured Data Strategy](#entity-strategy)
2. [Financial Services — Revision Spec](#financial-services)
3. [Insurance — Revision Spec](#insurance)
4. [Energy & Utilities — Revision Spec](#energy-utilities)
5. [Government — Revision Spec](#government)
6. [Education — Revision Spec](#education)
7. [Internal Linking Map](#internal-linking)
8. [Solutions Hub Page SEO Updates](#solutions-hub)
9. [Cross-Page Entity Reinforcement](#cross-page)


---

## 1. ENTITY & STRUCTURED DATA STRATEGY

### Goal
Make Island Mountain the **entity answer** when AI search engines (ChatGPT, Perplexity, Google AI Overviews) process queries about on-premises AI hardware for regulated industries. Every vertical page must explicitly connect "Island Mountain" to the compliance framework governing that vertical in structured data, headings, and AEO blocks.

### Schema Types Per Vertical Page

Each new vertical page carries THREE JSON-LD schema blocks:

1. **FAQPage** — 4 Q&A pairs targeting high-intent keywords. Written so AI answer engines can extract direct answers.
2. **BreadcrumbList** — Home > Solutions > [Industry]. Establishes topical hierarchy.
3. **Product** — Links Island Mountain hardware (Starter/Performance/Premium) to the specific vertical, reinforcing entity association between the product and the compliance framework.

### Entity Reinforcement Rules

- The company name "Island Mountain" must appear in: the title tag, meta description, OG title, at least 2 FAQ answers, the AEO summary block, and the Product schema `brand` field.
- The primary compliance framework (GLBA, NERC CIP, FERPA, etc.) must appear in: the title tag, meta description, at least 2 h2 headings, at least 2 FAQ questions, the AEO summary, and the FAQPage schema answers.
- Product names (Starter, Performance, Premium) and GPU names (H100, H200) must appear in at least 1 FAQ answer and the Product schema.

---

## 2. FINANCIAL SERVICES — REVISION SPEC

### Keyword-to-Section Placement Map

| # | Keyword | Target Section | Placement |
|---|---------|---------------|-----------|
| 1 | on-premises AI for banks | Hero subtitle, Problem section p1 | Natural sentence |
| 2 | GLBA compliant AI server | Title tag, Problem section h2, FAQ Q1 | Heading + body |
| 3 | air-gapped AI banking | How It Works card 3, FAQ Q1 answer | Card text |
| 4 | local LLM for financial services | Problem section p2, Model Selection intro | Body text |
| 5 | private AI for credit unions | FAQ Q3 answer, Testimonials | Body text |
| 6 | NVIDIA H100 bank AI | Model Selection section, Comparison table | Card text + table |
| 7 | PCI DSS AI compliance | Regulatory Context section p2, FAQ Q1 answer | Body text |
| 8 | on-prem AI for fraud detection | Workflows card 4 heading/text | Card heading |
| 9 | data-sovereign AI finance | How It Works card 1, AEO summary | Card text |
| 10 | air-gap GPU server banking | How It Works card 3 text | Card text |
| 11 | local AI loan document review | Workflows card 1 heading/text, FAQ Q2 | Card heading |
| 12 | banking AI without cloud | Problem section p3, CTA section | Body text |
| 13 | financial data privacy AI | Meta description, Problem section p1 | Meta + body |
| 14 | on-premise AI for investment firms | Workflows card 6, FAQ Q3 answer | Card text |
| 15 | secure AI for SOX compliance | Regulatory Context section p3 | Body text |
| 16 | local deepseek for banks | Model Selection DeepSeek card | Card text |
| 17 | on-prem LLM for KYC/AML | Workflows card 2 heading/text | Card heading |
| 18 | nvidia h200 for finance | Comparison table, Model Selection | Table + card |
| 19 | air-gapped inference credit union | FAQ Q3 answer, Testimonials | Body text |
| 20 | local AI for mortgage processing | Workflows card 1 text, FAQ Q2 answer | Card + FAQ |

### Optimized H2/H3 Headings (with keyword integration)

```
h2: The Cloud AI Problem for Financial Institutions
    (captures: "AI for banks", "financial institutions", "cloud AI")

h2: What On-Premises AI Actually Means for Your Institution
    (captures: "on-premises AI", "financial institution")

h2: AI Workflows Island Mountain Hardware Supports
    (captures: "AI workflows", "Island Mountain hardware")
    h3: Loan Document Review & Analysis (captures: "loan document review", "AI")
    h3: KYC/AML Compliance Analysis (captures: "KYC/AML", "compliance", "AI")
    h3: Regulatory Reporting & Compliance Drafting (captures: "regulatory reporting", "compliance")
    h3: Fraud Detection & Investigation Support (captures: "fraud detection", "AI")
    h3: Customer Communication & Disclosure Drafting
    h3: Investment Analysis & Portfolio Documentation

h2: Which Models Work Best for Financial Tasks
    (captures: "models", "financial tasks")
    h3: DeepSeek V4-Flash (captures: "local deepseek for banks")
    h3: Llama 3.1 70B
    h3: Mixtral 8x22B

h2: Cloud AI vs. Island Mountain for a Mid-Size Financial Institution
    (captures: "cloud AI vs", "financial institution")

h2: What You Do Not Get
    (honest limitations — no keyword stuffing here)

h2: GLBA, PCI DSS, and the Case for Local AI
    (captures: "GLBA", "PCI DSS", "local AI")

h2: Questions Financial Institutions Ask About Local AI
    (captures: "financial institutions", "local AI")
```

### Full FAQPage JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does using cloud AI for banking operations create GLBA compliance risk?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When a financial institution transmits non-public personal information (NPI) to a cloud AI provider for processing, that data leaves the institution's security perimeter and enters third-party infrastructure. The Gramm-Leach-Bliley Act Safeguards Rule (16 CFR Part 314) requires financial institutions to develop, implement, and maintain a comprehensive information security program that protects customer NPI. Cloud AI processing creates a structural dependency on the vendor's security posture for GLBA compliance. PCI DSS v4.0 adds further requirements for cardholder data environments. On-premises AI hardware from Island Mountain eliminates this transmission entirely. NPI stays on servers inside your facility, under your physical and logical security controls, with no third-party data handling dependency. The GLBA compliance question shifts from evaluating a vendor's security program to controlling your own."
      }
    },
    {
      "@type": "Question",
      "name": "What AI workflows can a bank or credit union run on Island Mountain hardware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Island Mountain hardware supports loan document review and risk assessment, KYC and AML compliance analysis, fraud detection and investigation support, regulatory reporting and compliance drafting, customer communication and disclosure generation, and investment analysis and portfolio documentation. The system runs DeepSeek V4-Flash for complex analytical tasks like multi-document regulatory review and loan portfolio assessment, and Llama 3.1 70B for general drafting including customer correspondence and compliance memoranda. All processing happens on NVIDIA H100 or H200 GPUs inside your facility with no data transmitted to external servers."
      }
    },
    {
      "@type": "Question",
      "name": "How does the cost of on-premises AI compare to cloud AI for a financial institution with 50 users?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cloud AI subscriptions for financial services platforms typically cost $50 to $200 per user per month. For 50 users, that totals $30,000 to $120,000 per year. Over three years, cumulative cloud costs reach $90,000 to $360,000 with no ownership and continued NPI exposure on every query. An Island Mountain Starter system with two NVIDIA H100 GPUs costs $75,000 to $85,000 as a one-time purchase. Ongoing costs are limited to electricity at approximately $100 to $200 per month. For institutions with 50 or more users, the local system reaches cost parity with mid-tier cloud subscriptions within the first year while eliminating GLBA and PCI DSS compliance risk from AI operations entirely. The system is Section 179 eligible for full first-year depreciation."
      }
    },
    {
      "@type": "Question",
      "name": "Does a bank need dedicated IT staff to run on-premises AI hardware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Island Mountain systems ship pre-configured with all models installed and the OpenWebUI browser-based interface ready to use. Your staff accesses it through a web browser on your internal network, the same way they would access any internal application. Initial setup requires racking the server in your data center or server closet, connecting a 208V 30A power circuit, and plugging in an ethernet cable. Island Mountain includes 30 days of hands-on setup support. Ongoing maintenance involves standard Linux security updates and occasional model updates. Most financial institutions with existing IT staff or a managed service provider can maintain the system alongside their other infrastructure without dedicated AI personnel."
      }
    }
  ]
}
```

### Full BreadcrumbList JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://islandmountain.io/"},
    {"@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://islandmountain.io/solutions.html"},
    {"@type": "ListItem", "position": 3, "name": "Financial Services", "item": "https://islandmountain.io/financial-services.html"}
  ]
}
```

### Product Schema (NEW — not on existing verticals, add to all new pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Island Mountain Starter — On-Premises AI Server for Financial Services",
  "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable. GLBA and PCI DSS compliance-ready. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",
  "brand": {
    "@type": "Brand",
    "name": "Island Mountain"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "75000",
    "highPrice": "400000",
    "priceCurrency": "USD",
    "offerCount": "3"
  },
  "category": "AI Inference Hardware for Financial Services"
}
```

### AEO Summary Block (final text)

```html
<div style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;">
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for banks, credit unions, and investment firms. Local deployment keeps non-public personal information inside your institution's network, eliminating the third-party data transmission that creates GLBA and PCI DSS compliance risk when using cloud AI services. Systems start at $75,000 with NVIDIA H100 GPUs, air-gap capability, and zero per-token fees.
</div>
```

---

## 3. INSURANCE — REVISION SPEC

### Keyword-to-Section Placement Map

| # | Keyword | Target Section | Placement |
|---|---------|---------------|-----------|
| 1 | on-premises AI for insurance | Hero subtitle, Problem section p1 | Natural sentence |
| 2 | HIPAA compliant AI for insurers | Title tag area, Problem h2, FAQ Q1 | Heading + body |
| 3 | air-gapped AI claims processing | How It Works card 3, Workflows card 1 | Card text |
| 4 | local LLM underwriting | Workflows card 2 heading, Model Selection | Card heading |
| 5 | private AI for health insurance | Problem section p2, FAQ Q1 answer | Body text |
| 6 | NVIDIA H100 insurance AI | Model Selection, Comparison table | Card + table |
| 7 | data sovereignty insurance | How It Works card 1, AEO summary | Card text |
| 8 | on-prem AI fraud detection insurance | Workflows card 3 heading/text | Card heading |
| 9 | local AI for policy review | Workflows card 4 heading/text, FAQ Q2 | Card + FAQ |
| 10 | insurance AI without cloud | Problem section p3, CTA subtext | Body text |
| 11 | NAIC model law AI compliance | Regulatory Context p2, FAQ Q1 answer | Body text |
| 12 | air-gap GPU server insurance | How It Works card 3 text | Card text |
| 13 | local AI for actuarial analysis | Workflows card 5 text, FAQ Q2 answer | Card + FAQ |
| 14 | on-premise AI for P&C insurers | Problem section p2, Testimonials | Body text |
| 15 | secure AI for customer PII | Meta description context, Limitations | Meta + body |
| 16 | local llama for insurance | Model Selection Llama card | Card text |
| 17 | on-prem LLM for claims | Workflows card 1 text, FAQ Q2 | Card + FAQ |
| 18 | nvidia h200 for insurance | Comparison table Premium row | Table cell |
| 19 | air-gapped inference insurance | How It Works section intro, FAQ Q4 | Body + FAQ |
| 20 | local AI for life insurance | Problem section p2, Testimonials | Body text |

### Optimized H2/H3 Headings

```
h2: The Cloud AI Problem for Insurance Carriers
h2: What On-Premises AI Means for Your Organization
    h3: Zero External Transmission
    h3: Hardware You Own
    h3: Air-Gap Capable
h2: Insurance Workflows Island Mountain Hardware Supports
    h3: Claims Processing & Adjudication
    h3: Underwriting Analysis
    h3: Fraud Detection & Investigation
    h3: Policy Document Review
    h3: Actuarial Analysis Support
    h3: Policyholder Communications
h2: Which Models Work Best for Insurance Tasks
h2: Cloud AI vs. Island Mountain for a Mid-Size Insurance Carrier
h2: What You Do Not Get
h2: HIPAA, NAIC Model Laws, and the Case for Local AI
h2: Questions Insurance Organizations Ask About Local AI
```

### Full FAQPage JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does using cloud AI create HIPAA risk for health insurance carriers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Health insurers process protected health information (PHI) subject to HIPAA's Security Rule. When PHI is transmitted to a cloud AI provider for processing, that provider becomes a business associate requiring a Business Associate Agreement (BAA). Even with a BAA, the structural risk remains: PHI is processed on third-party infrastructure outside the insurer's direct security controls. Not all AI providers offer BAAs, and those that do still process data on shared commercial infrastructure. The NAIC Insurance Data Security Model Law adds state-level requirements for information security programs. On-premises AI hardware from Island Mountain eliminates the business associate dependency entirely. PHI and policyholder PII stay on servers inside your facility under your security program. No BAA required because no third-party data handling occurs."
      }
    },
    {
      "@type": "Question",
      "name": "What insurance workflows can run on Island Mountain on-premises AI hardware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Island Mountain hardware supports claims processing and adjudication assistance, underwriting analysis and risk assessment, fraud detection and investigation support, policy document review and comparison, actuarial analysis documentation, and policyholder correspondence drafting. The system runs DeepSeek V4-Flash for complex multi-document analysis like claims investigation and underwriting assessment, and Llama 3.1 70B for general drafting tasks including policyholder communications and compliance memos. All data processing occurs on NVIDIA H100 or H200 GPUs inside your facility. No policyholder information is transmitted to external servers."
      }
    },
    {
      "@type": "Question",
      "name": "How does on-premises AI cost compare to cloud AI for a 30-person insurance office?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cloud AI platforms for insurance typically cost $50 to $200 per user per month. For 30 users, that is $18,000 to $72,000 per year in subscription fees with no ownership and continued data exposure on every query. Over three years, cumulative cloud costs reach $54,000 to $216,000. An Island Mountain Starter system costs $75,000 to $85,000 as a one-time purchase with two NVIDIA H100 GPUs. After purchase, the only ongoing cost is electricity at approximately $100 to $200 per month. For a 30-person office, the on-premises system reaches cost parity with mid-tier cloud subscriptions within 18 to 24 months while eliminating all third-party data handling of policyholder information. The hardware is Section 179 eligible for full first-year depreciation."
      }
    },
    {
      "@type": "Question",
      "name": "Does an insurance carrier need dedicated IT staff to operate on-premises AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Island Mountain systems are pre-configured and burn-tested before shipping. Staff access the AI through a web browser on your internal network using the OpenWebUI interface. No specialized AI knowledge is required. Setup requires placing the server in your data center, connecting 208V 30A power and ethernet, and opening a browser. Island Mountain provides 30 days of hands-on setup support. Ongoing maintenance involves standard Linux server administration and occasional model updates through the web interface. Most insurance carriers with existing IT staff or a managed service provider handle this alongside their other infrastructure without dedicated AI personnel."
      }
    }
  ]
}
```

### BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://islandmountain.io/"},
    {"@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://islandmountain.io/solutions.html"},
    {"@type": "ListItem", "position": 3, "name": "Insurance", "item": "https://islandmountain.io/insurance.html"}
  ]
}
```

### Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Island Mountain Starter — On-Premises AI Server for Insurance",
  "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable. HIPAA and NAIC compliance-ready. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",
  "brand": {
    "@type": "Brand",
    "name": "Island Mountain"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "75000",
    "highPrice": "400000",
    "priceCurrency": "USD",
    "offerCount": "3"
  },
  "category": "AI Inference Hardware for Insurance"
}
```

### AEO Summary Block

```html
<div style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;">
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for insurance carriers. Process claims, underwriting, and fraud detection on NVIDIA H100/H200 servers you own. Policyholder PII and protected health information stay inside your network -- no cloud transmission, no BAA dependency, no third-party data exposure. Systems start at $75,000 with air-gap capability and unlimited inference.
</div>
```

---

## 4. ENERGY & UTILITIES — REVISION SPEC

### Keyword-to-Section Placement Map

| # | Keyword | Target Section | Placement |
|---|---------|---------------|-----------|
| 1 | on-premises AI for energy sector | Hero subtitle, Problem p1 | Natural sentence |
| 2 | NERC CIP compliant AI | Title tag, Problem h2, FAQ Q1, Regulatory section | Heading + body |
| 3 | air-gapped AI for utilities | How It Works card 3, Hero subtitle | Card text |
| 4 | local LLM grid management | Workflows card 2, Model Selection | Card text |
| 5 | private AI for power plants | Problem p2, FAQ Q2 answer | Body text |
| 6 | NVIDIA H100 SCADA AI | Model Selection, Limitations card 1 | Card text |
| 7 | critical infrastructure AI on-prem | Problem p1, Regulatory Context h2 | Body + heading |
| 8 | on-prem AI for predictive maintenance | Workflows card 1 heading/text | Card heading |
| 9 | air-gap GPU server energy | How It Works card 3 text, FAQ Q1 | Card + FAQ |
| 10 | local AI for oil and gas | Workflows card 4, Testimonials | Card + testimonial |
| 11 | data-sovereign AI utilities | How It Works card 1, AEO summary | Card text |
| 12 | energy AI without cloud | Problem p3, CTA subtext | Body text |
| 13 | IEC 62443 AI server | Regulatory Context p2, FAQ Q1 answer | Body text |
| 14 | on-premise AI for renewable energy | Workflows card 4 alt, Testimonials | Card + testimonial |
| 15 | secure AI for substation data | Problem p2, Workflows card 2 | Body + card |
| 16 | local deepseek for utilities | Model Selection DeepSeek card | Card text |
| 17 | on-prem LLM for FERC compliance | Workflows card 3, Regulatory Context | Card + body |
| 18 | nvidia h200 for grid operations | Comparison table, Model Selection | Table + card |
| 19 | air-gapped inference energy | How It Works intro, FAQ Q4 answer | Body + FAQ |
| 20 | local AI for pipeline monitoring | Workflows card 4 heading/text | Card heading |

### Optimized H2/H3 Headings

```
h2: The Cloud AI Problem for Critical Infrastructure Operators
h2: What Air-Gapped AI Means for Energy Operations
    h3: Complete Network Isolation
    h3: Hardware You Own and Control
    h3: OT/IT Network Separation Ready
h2: Operational Workflows Island Mountain Hardware Supports
    h3: Predictive Maintenance Analysis
    h3: Grid Operations & Substation Documentation
    h3: NERC CIP Compliance Reporting
    h3: Pipeline Monitoring & Analysis
    h3: Outage Response Documentation
    h3: FERC Regulatory Filing Drafting
h2: Which Models Work Best for Energy Sector Tasks
h2: Cloud AI vs. Island Mountain for Utility Operations
h2: What You Do Not Get
h2: NERC CIP, IEC 62443, and the Case for Air-Gapped AI
h2: Questions Energy Companies Ask About On-Premises AI
```

### Full FAQPage JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does cloud AI processing of operational data violate NERC CIP requirements?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "NERC CIP standards (CIP-003 through CIP-013) mandate strict cybersecurity controls for the bulk electric system, including requirements for electronic security perimeters, access management, and information protection. Transmitting operational technology data to cloud AI services moves that data outside the electronic security perimeter and introduces third-party access to potentially sensitive grid operations data. IEC 62443 adds requirements for industrial automation and control system security. Air-gapped on-premises AI hardware from Island Mountain processes operational data entirely within the facility perimeter. No data crosses the electronic security boundary. No third-party access to grid, pipeline, or substation data occurs. The system can operate with complete network isolation, satisfying the most restrictive NERC CIP and IEC 62443 security postures."
      }
    },
    {
      "@type": "Question",
      "name": "What energy sector workflows can run on Island Mountain air-gapped AI hardware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Island Mountain hardware supports predictive maintenance analysis for generation and distribution equipment, grid operations and substation documentation, NERC CIP compliance reporting and evidence preparation, pipeline monitoring data analysis, outage response and after-action documentation, and FERC regulatory filing drafting. The system runs DeepSeek V4-Flash for complex multi-document analysis like maintenance history correlation and compliance evidence review. Llama 3.1 70B handles general drafting including regulatory filings and operational reports. All processing occurs on NVIDIA H100 or H200 GPUs inside your facility with zero internet connectivity required for inference."
      }
    },
    {
      "@type": "Question",
      "name": "How does on-premises AI cost compare to cloud alternatives for a utility company?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For utility companies, the cost comparison extends beyond subscription fees to include the compliance cost of using cloud AI. Achieving NERC CIP compliance with cloud-based AI processing typically requires extensive compliance middleware, third-party security assessments, and ongoing vendor risk management, often costing hundreds of thousands of dollars in addition to the AI subscription itself. An Island Mountain Starter system costs $75,000 to $85,000 as a one-time purchase with two NVIDIA H100 GPUs. The Premium tier with two H200 GPUs costs $350,000 to $400,000. Both operate air-gapped with zero ongoing subscription fees and no compliance middleware required. The total cost of ownership advantage compounds significantly when compliance overhead is factored in."
      }
    },
    {
      "@type": "Question",
      "name": "Can Island Mountain hardware integrate with SCADA or operational technology systems?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Island Mountain hardware runs general-purpose large language models through a browser-based interface called OpenWebUI. It does not directly integrate with SCADA systems, energy management systems, distribution management systems, or other operational technology platforms. The AI processes documents, reports, and data that operators provide through the chat interface. It is an inference tool for analysis and drafting, not a real-time control system component. This separation is actually a security advantage: the AI server can operate on an isolated network segment without any connection to OT systems, eliminating the possibility of AI-related compromise affecting operational technology."
      }
    }
  ]
}
```

### BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://islandmountain.io/"},
    {"@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://islandmountain.io/solutions.html"},
    {"@type": "ListItem", "position": 3, "name": "Energy & Utilities", "item": "https://islandmountain.io/energy-utilities.html"}
  ]
}
```

### Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Island Mountain Premium — Air-Gapped AI Server for Energy & Utilities",
  "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H200 141GB GPUs. Air-gap capable for NERC CIP and IEC 62443 environments. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",
  "brand": {
    "@type": "Brand",
    "name": "Island Mountain"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "75000",
    "highPrice": "400000",
    "priceCurrency": "USD",
    "offerCount": "3"
  },
  "category": "Air-Gapped AI Inference Hardware for Critical Infrastructure"
}
```

### AEO Summary Block

```html
<div style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;">
<strong>Summary:</strong> Island Mountain builds air-gapped AI inference hardware for energy companies and utilities operating under NERC CIP and IEC 62443 requirements. NVIDIA H100/H200 servers process operational data entirely within the facility perimeter -- no cloud transmission, no electronic security perimeter breach, no third-party access to critical infrastructure data. Systems start at $75,000 with complete network isolation capability.
</div>
```

---

## 5. GOVERNMENT — REVISION SPEC

### Keyword-to-Section Placement Map

| # | Keyword | Target Section | Placement |
|---|---------|---------------|-----------|
| 1 | on-premises AI for government | Hero subtitle, Problem p1 | Natural sentence |
| 2 | FedRAMP compatible AI hardware | Title tag, Limitations card 2, FAQ Q1 | Title + body |
| 3 | air-gapped AI for agencies | How It Works card 3, Hero subtitle | Card text |
| 4 | local LLM CUI processing | Problem p2, Workflows card 1, FAQ Q1 | Body + card |
| 5 | private AI for public sector | Problem p1, Meta description context | Body text |
| 6 | NVIDIA H100 government AI | Model Selection, Comparison table | Card + table |
| 7 | data sovereignty government | How It Works card 1, AEO summary, Title tag | Card + summary |
| 8 | on-prem AI for document review | Workflows card 1 heading/text | Card heading |
| 9 | local AI for citizen services | Workflows card 4 heading/text, FAQ Q2 | Card + FAQ |
| 10 | government AI without cloud | Problem p3, CTA subtext | Body text |
| 11 | CUI compliant AI server | Problem p2, Regulatory Context p1, FAQ Q1 | Body + FAQ |
| 12 | air-gap GPU server federal | How It Works card 3, FAQ Q3 answer | Card + FAQ |
| 13 | local AI for policy analysis | Workflows card 3 heading/text | Card heading |
| 14 | on-premise AI for state government | Problem p3, Testimonials | Body + testimonial |
| 15 | secure AI for law enforcement | Workflows alt mention, Problem p2 | Body text |
| 16 | local deepseek for government | Model Selection DeepSeek card | Card text |
| 17 | on-prem LLM for FOIA | Workflows card 2 heading/text | Card heading |
| 18 | nvidia h200 for defense civilian | Comparison table, Model Selection | Table + card |
| 19 | air-gapped inference government | How It Works intro, FAQ Q4 | Body + FAQ |
| 20 | local AI for classified data | Limitations card 3 (honest: not SCIF-rated) | Limitation text |

### Optimized H2/H3 Headings

```
h2: The Cloud AI Problem for Government Agencies
h2: What On-Premises AI Means for Government Data
    h3: Zero External Transmission
    h3: Hardware Under Agency Control
    h3: Air-Gap Capable for CUI Environments
h2: Government Workflows Island Mountain Hardware Supports
    h3: Document Review & CUI Analysis
    h3: FOIA Request Processing
    h3: Policy Analysis & Drafting
    h3: Citizen Service Documentation
    h3: Grant & Budget Analysis
    h3: After-Action Report Generation
h2: Which Models Work Best for Government Tasks
h2: Cloud AI vs. Island Mountain for a Government Agency
h2: What You Do Not Get
h2: FedRAMP, NIST 800-171, and the Case for On-Premises AI
h2: Questions Government Agencies Ask About Local AI
```

### Full FAQPage JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Do government agencies need FedRAMP-authorized AI to process CUI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FedRAMP authorization applies to cloud service providers that process government data on shared commercial infrastructure. Island Mountain hardware is not a cloud service -- it is physical AI inference hardware that agencies own and operate on-premises. No FedRAMP authorization is needed because no cloud service is involved. For CUI handling, NIST SP 800-171 provides the security requirements, and agencies implement those controls on their own infrastructure. On-premises AI hardware simplifies CUI compliance because data processing stays within the agency's security boundary. No third-party access occurs, no data leaves the agency's network, and the full complement of NIST 800-171 controls can be applied directly to hardware under agency control."
      }
    },
    {
      "@type": "Question",
      "name": "What government workflows can run on Island Mountain on-premises AI hardware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Island Mountain hardware supports document review and CUI analysis, FOIA request processing and response drafting, policy analysis and legislative drafting, citizen service documentation and correspondence, grant and budget analysis, and after-action report generation. The system runs DeepSeek V4-Flash for complex multi-document analysis and policy synthesis, and Llama 3.1 70B for general drafting tasks including correspondence and reporting. All processing occurs on NVIDIA H100 or H200 GPUs inside agency-controlled facilities with zero data transmitted to external servers."
      }
    },
    {
      "@type": "Question",
      "name": "How does on-premises AI cost compare to cloud AI for a 20-person government office?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Government cloud AI solutions typically require FedRAMP-authorized platforms costing $75 to $300 per user per month, plus compliance overhead for ATO documentation and continuous monitoring. For 20 users, annual cloud costs range from $18,000 to $72,000 in subscription fees alone, with compliance documentation and vendor risk management adding significant additional cost. An Island Mountain Starter system costs $75,000 to $85,000 as a one-time purchase. After purchase, ongoing costs are limited to electricity at approximately $100 to $200 per month. No FedRAMP ATO required because no cloud service is involved. Total cost of ownership typically reaches parity within 18 months while eliminating third-party data handling of government information entirely."
      }
    },
    {
      "@type": "Question",
      "name": "Is Island Mountain hardware rated for classified data processing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Island Mountain hardware is suitable for Controlled Unclassified Information (CUI), sensitive but unclassified (SBU) data, and law enforcement sensitive data. It is not SCIF-rated and has not been certified by NSA or any intelligence community authority for classified data processing. The system is designed for civilian government agencies, state and local governments, and federal offices handling CUI and sensitive administrative data. For agencies requiring classified data processing capability, different procurement channels and certification requirements apply. Island Mountain systems do support complete air-gap operation and can be configured for network isolation, which satisfies many CUI handling requirements under NIST SP 800-171."
      }
    }
  ]
}
```

### BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://islandmountain.io/"},
    {"@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://islandmountain.io/solutions.html"},
    {"@type": "ListItem", "position": 3, "name": "Government", "item": "https://islandmountain.io/government.html"}
  ]
}
```

### Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Island Mountain Starter — On-Premises AI Server for Government",
  "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable for CUI environments. NIST SP 800-171 compatible. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",
  "brand": {
    "@type": "Brand",
    "name": "Island Mountain"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "75000",
    "highPrice": "400000",
    "priceCurrency": "USD",
    "offerCount": "3"
  },
  "category": "AI Inference Hardware for Government Agencies"
}
```

### AEO Summary Block

```html
<div style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;">
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for federal, state, and local government agencies. Process CUI, citizen records, and policy-sensitive documents on NVIDIA H100/H200 servers under agency control -- no cloud dependency, no FedRAMP ATO required, no third-party data handling. Systems start at $75,000 with full air-gap capability.
</div>
```

---

## 6. EDUCATION — REVISION SPEC

### Keyword-to-Section Placement Map

| # | Keyword | Target Section | Placement |
|---|---------|---------------|-----------|
| 1 | on-premises AI for schools | Hero subtitle, Problem p1 | Natural sentence |
| 2 | FERPA compliant AI server | Title tag, Problem h2, FAQ Q1 | Title + heading |
| 3 | air-gapped AI education | How It Works card 3, FAQ Q4 | Card + FAQ |
| 4 | local LLM for universities | Problem p2, Model Selection intro | Body text |
| 5 | private AI for K-12 | Problem p2, FAQ Q1 answer | Body + FAQ |
| 6 | NVIDIA H100 campus AI | Model Selection, Comparison table | Card + table |
| 7 | student data privacy AI | Meta description, Problem p1, AEO summary | Meta + body |
| 8 | on-prem AI for research | Workflows card 3, FAQ Q2 answer | Card + FAQ |
| 9 | local AI for grading | Workflows card 6, Limitations card 3 | Card + limitation |
| 10 | education AI without cloud | Problem p3, CTA subtext | Body text |
| 11 | FERPA school official AI | Regulatory Context p1, Hero subtitle, FAQ Q1 | Body + FAQ |
| 12 | air-gap GPU server college | How It Works card 3 text | Card text |
| 13 | local AI for curriculum design | Workflows card 1 heading/text | Card heading |
| 14 | on-premise AI for edtech | Problem p3 | Body text |
| 15 | secure AI for student records | Workflows card 2, FAQ Q2 | Card + FAQ |
| 16 | local deepseek for higher ed | Model Selection DeepSeek card | Card text |
| 17 | on-prem LLM for admissions | Workflows alt, FAQ Q2 answer | FAQ body |
| 18 | nvidia h200 for research labs | Comparison table, Model Selection | Table + card |
| 19 | air-gapped inference university | How It Works intro, Testimonials | Body + testimonial |
| 20 | local AI for campus security | Workflows alt mention, Limitations | Brief mention |

### Optimized H2/H3 Headings

```
h2: The Cloud AI Problem for Educational Institutions
h2: What On-Premises AI Means for Your Campus
    h3: Zero External Transmission of Student Data
    h3: Hardware Under Institutional Control
    h3: Air-Gap Capable for Maximum Privacy
h2: Campus Workflows Island Mountain Hardware Supports
    h3: Curriculum Design & Course Development
    h3: Student Record Summarization & Advising
    h3: Research Data Analysis
    h3: Administrative Document Drafting
    h3: Grant Proposal & Budget Support
    h3: Assessment & Grading Assistance
h2: Which Models Work Best for Education Tasks
h2: Cloud AI vs. Island Mountain for a University Department
h2: What You Do Not Get
h2: FERPA, COPPA, and the School Official Exception
h2: Questions Educators Ask About On-Premises AI
```

### Full FAQPage JSON-LD Schema

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does using cloud AI for student data violate FERPA?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FERPA (20 U.S.C. section 1232g) protects student education records and restricts disclosure to third parties. The school official exception allows disclosure to contractors performing institutional functions, but requires that the contractor is under direct institutional control, uses the data only for authorized purposes, and meets the institution's criteria for handling student records. Cloud AI providers process data on shared commercial infrastructure under their own terms of service, which may not satisfy the direct control requirements of the school official exception. State student privacy laws like California's SOPIPA and New York Education Law 2-d add further restrictions. On-premises AI hardware from Island Mountain keeps student education records on campus-controlled servers. No third-party disclosure occurs because no data leaves the institution's network. The FERPA compliance question is resolved architecturally rather than contractually."
      }
    },
    {
      "@type": "Question",
      "name": "What education workflows can run on Island Mountain campus AI hardware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Island Mountain hardware supports curriculum design and course development assistance, student record summarization and academic advising support, research data analysis for faculty projects, administrative document drafting including accreditation reports, grant proposal and budget narrative development, and assessment and grading assistance. The system runs DeepSeek V4-Flash for complex research analysis and multi-document synthesis, and Llama 3.1 70B for general drafting tasks including curriculum materials and administrative correspondence. All processing occurs on NVIDIA H100 or H200 GPUs on campus with no student data transmitted to external servers."
      }
    },
    {
      "@type": "Question",
      "name": "How does on-premises AI cost compare to cloud AI for a university?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cloud AI platforms for education typically cost $20 to $100 per user per month depending on the platform and licensing model. For a department of 30 faculty and staff, that totals $7,200 to $36,000 per year. Campus-wide deployments for 200 or more users can reach $48,000 to $240,000 annually. An Island Mountain Starter system costs $75,000 to $85,000 as a one-time purchase supporting unlimited users on the campus network. The Premium tier with two NVIDIA H200 GPUs costs $350,000 to $400,000 for research-intensive workloads. Ongoing costs after purchase are limited to electricity at approximately $100 to $200 per month. For most university departments, the on-premises system reaches cost parity with cloud subscriptions within 12 to 24 months while eliminating third-party handling of student records entirely."
      }
    },
    {
      "@type": "Question",
      "name": "Does a school need dedicated IT staff to run on-premises AI hardware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Island Mountain systems ship pre-configured with all models installed and the OpenWebUI browser-based interface ready for use. Faculty and staff access it through any web browser on the campus network. Initial setup requires racking the server, connecting a 208V 30A power circuit, and plugging in an ethernet cable. Island Mountain provides 30 days of hands-on setup support. Ongoing maintenance involves standard Linux server administration and occasional model updates. Most institutions with existing campus IT departments can integrate the system into their server management workflow without hiring additional staff. K-12 districts that use managed service providers can include the AI server in their existing service agreements."
      }
    }
  ]
}
```

### BreadcrumbList Schema

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://islandmountain.io/"},
    {"@type": "ListItem", "position": 2, "name": "Solutions", "item": "https://islandmountain.io/solutions.html"},
    {"@type": "ListItem", "position": 3, "name": "Education", "item": "https://islandmountain.io/education.html"}
  ]
}
```

### Product Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Island Mountain Starter — On-Premises AI Server for Education",
  "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable. FERPA-aligned for student data privacy. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",
  "brand": {
    "@type": "Brand",
    "name": "Island Mountain"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "75000",
    "highPrice": "400000",
    "priceCurrency": "USD",
    "offerCount": "3"
  },
  "category": "AI Inference Hardware for Educational Institutions"
}
```

### AEO Summary Block

```html
<div style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;">
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for K-12 schools, community colleges, and universities. Student education records stay on campus-controlled NVIDIA H100/H200 servers -- no cloud transmission, no third-party data handling, and full alignment with FERPA's school official exception. Systems start at $75,000 with air-gap capability and unlimited campus-wide access.
</div>
```

---

## 7. INTERNAL LINKING MAP

### New Page -> Existing Content Links

Each new vertical page must include these internal links:

**financial-services.html links to:**
- solutions.html (contextual body link: "one of ten regulated industries")
- products.html (CTA button: "See Full Specs")
- contact.html (CTA button: "Request a Quote")
- pricing.html (comparison table context or CTA)
- insurance.html (CTA cross-link)
- energy-utilities.html (CTA cross-link)

**insurance.html links to:**
- solutions.html (contextual body link)
- products.html, contact.html, pricing.html
- financial-services.html (CTA cross-link)
- government.html (CTA cross-link)
- medical-practices.html (body link re: HIPAA overlap — "Like medical practices, health insurers handle PHI...")

**energy-utilities.html links to:**
- solutions.html (contextual body link)
- products.html, contact.html, pricing.html
- government.html (CTA cross-link)
- defense-contractors.html (body link re: critical infrastructure overlap)
- financial-services.html (CTA cross-link)

**government.html links to:**
- solutions.html (contextual body link)
- products.html, contact.html, pricing.html
- defense-contractors.html (CTA cross-link — natural compliance overlap)
- education.html (CTA cross-link)
- tribal-nations.html (body link: "Tribal nations also exercise data sovereignty...")

**education.html links to:**
- solutions.html (contextual body link)
- products.html, contact.html, pricing.html
- government.html (CTA cross-link)
- research-labs.html (CTA cross-link — natural academic overlap)
- medical-practices.html (body link re: campus health centers & HIPAA)

### Existing Pages -> New Content Links (future consideration)

These are NOT required for initial launch but should be planned for a follow-up session:
- Blog posts about HIPAA could link to insurance.html
- Blog posts about compliance could reference the expanded 10-vertical solutions hub
- faq.html answers that reference "regulated industries" should link to solutions.html
- why-island-mountain.html could reference all 10 verticals

---

## 8. SOLUTIONS HUB PAGE SEO UPDATES

### Updated FAQPage Schema for solutions.html

The first Q&A must be rewritten from "five primary regulated sectors" to ten:

```json
{
  "@type": "Question",
  "name": "What regulated industries does Island Mountain serve?",
  "acceptedAnswer": {
    "@type": "Answer",
    "text": "Island Mountain builds on-premises AI inference hardware for ten regulated sectors: law firms protecting attorney-client privilege, medical practices meeting HIPAA technical safeguards, tribal nations maintaining data sovereignty under OCAP and CARE principles, research labs protecting unpublished data and meeting grant compliance requirements, defense contractors satisfying ITAR export controls and CMMC requirements, financial institutions complying with GLBA and PCI DSS, insurance carriers protecting policyholder data under HIPAA and NAIC model laws, energy and utility companies meeting NERC CIP and IEC 62443 critical infrastructure requirements, government agencies handling CUI under NIST SP 800-171 and FISMA, and educational institutions protecting student records under FERPA. Each industry page details the specific compliance framework and how local AI deployment addresses it."
  }
}
```

### Updated Meta Tags for solutions.html

```html
<title>AI Solutions for Regulated Industries | HIPAA, ITAR, GLBA, NERC CIP, FERPA | Island Mountain</title>
<meta name="description" content="On-premises AI inference hardware built for organizations where data sovereignty is non-negotiable. Ten regulated industries: law, healthcare, tribal nations, research, defense, finance, insurance, energy, government, and education.">
```

### Updated OG Tags

```html
<meta property="og:title" content="AI Solutions for Regulated Industries | Island Mountain">
<meta property="og:description" content="On-premises AI inference hardware built for organizations where data sovereignty is non-negotiable. Ten regulated industries served with air-gap-capable NVIDIA H100/H200 systems.">
```

### Updated Hero Subtitle

FROM: `Five regulated industries. One structural reality...`
TO: `Ten regulated industries. One structural reality: when compliance frameworks govern your data, the architecture running your AI isn't a vendor decision. It's a compliance posture. Island Mountain builds on-premises inference hardware for organizations that can't afford to get that wrong.`

### Updated AEO Summary

```html
<div style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;">
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for ten regulated industries: law firms, medical practices, tribal nations, research labs, defense contractors, financial institutions, insurance carriers, energy and utility companies, government agencies, and educational institutions. Each faces the same structural problem with cloud AI -- data transmitted to third-party servers creates compliance risk that contractual protections cannot fully resolve. Local deployment eliminates that transmission.
</div>
```

---

## 9. CROSS-PAGE ENTITY REINFORCEMENT

### Compliance Framework Entity Map

This table shows which compliance framework each page "owns" for entity association purposes. The executing agent must ensure Island Mountain is explicitly named alongside each framework in structured data and AEO blocks:

| Page | Primary Framework | Secondary Frameworks |
|------|------------------|---------------------|
| financial-services.html | GLBA Safeguards Rule | PCI DSS v4.0, SEC Regulation S-P, SOX |
| insurance.html | NAIC Model Law #668 | HIPAA (health insurers), GLBA (financial products), State insurance regs |
| energy-utilities.html | NERC CIP (CIP-003 to CIP-013) | IEC 62443, FERC, TSA Pipeline Security |
| government.html | NIST SP 800-171 | FedRAMP (context), FISMA, CUI Registry, EO on AI |
| education.html | FERPA (20 U.S.C. § 1232g) | COPPA (K-12), State student privacy laws, IRB |

### Keyword Density Targets

For each page, the primary compliance framework acronym/name should appear:
- 1x in title tag
- 1x in meta description
- 2-3x in h2 headings
- 3-5x in body paragraphs
- 2x in FAQ questions
- 3-4x in FAQ answers
- 1x in AEO summary
- 1x in Product schema description

"Island Mountain" should appear:
- 1x in title tag
- 1x in meta description
- 2x in FAQ answers (minimum)
- 1x in AEO summary
- 1x in Product schema brand field
- 1x in OG title

"H100" or "H200" should appear:
- 1x in meta description
- 1x in FAQ answer about cost
- 1x in FAQ answer about workflows (mentioning GPU capability)
- 1x in Product schema description
- 1x in AEO summary

### AI Answer Engine Targeting

Each FAQ question is written to match a real search query pattern. The AI answer engine strategy:

1. **Direct question match:** FAQ Q1 on every page starts with "Does..." — matching how people query AI search about compliance risk.
2. **Workflow discovery:** FAQ Q2 on every page starts with "What... workflows..." — capturing evaluation-stage buyers.
3. **Cost comparison:** FAQ Q3 addresses pricing directly — the #1 objection in the sales cycle.
4. **Barrier removal:** FAQ Q4 addresses IT staffing — the #2 objection.

These four FAQ slots are strategically ordered to match the buyer's information-seeking sequence: risk awareness -> capability evaluation -> cost justification -> implementation feasibility.

---

## VERIFICATION: POST-REVISION SEO/AEO CHECKLIST

After revising each page, verify:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

for page in financial-services.html insurance.html energy-utilities.html government.html education.html; do
  echo "=== $page ==="
  
  # Title tag exists and contains Island Mountain
  grep -c '<title>.*Island Mountain.*</title>' "$SITE/$page"
  
  # Meta description exists
  grep -c 'meta name="description"' "$SITE/$page"
  
  # Canonical URL correct
  grep 'rel="canonical"' "$SITE/$page"
  
  # OG tags present (minimum 4)
  og_count=$(grep -c 'og:' "$SITE/$page")
  echo "OG tags: $og_count (expect 5+)"
  
  # Twitter Card present
  grep -c 'twitter:card' "$SITE/$page"
  
  # FAQPage schema present
  grep -c 'FAQPage' "$SITE/$page"
  
  # BreadcrumbList schema present
  grep -c 'BreadcrumbList' "$SITE/$page"
  
  # Product schema present
  grep -c '"Product"' "$SITE/$page"
  
  # AEO summary block present
  grep -c '<strong>Summary:</strong>' "$SITE/$page"
  
  # Breadcrumb nav present
  grep -c 'class="breadcrumb"' "$SITE/$page"
  
  # Internal link to solutions.html
  grep -c 'solutions.html' "$SITE/$page"
  
  # Internal link to contact.html
  grep -c 'contact.html' "$SITE/$page"
  
  # Internal link to products.html
  grep -c 'products.html' "$SITE/$page"
  
  echo ""
done
```
