# Island Mountain: 5 New Vertical Industry Pages — Execution Prompt

**Date:** 2026-05-03
**Workspace:** `C:\Users\17076\Documents\Claude\Island Mountain`
**Bash sandbox path:** `/sessions/SESSION-SLUG/mnt/Island Mountain`
**To find your bash session slug:** `ls /sessions/*/mnt/`

---

## CRITICAL: FILE TRUNCATION PREVENTION

This site has NO templating engine. Every page is hand-written HTML. Many files exceed 400 lines. Per HANDOFF.md rules:

1. **NEVER use the Edit tool on any file over 400 lines.** Use `sed` via bash instead.
2. After EVERY file modification, verify the file ends correctly: `tail -3 filename`
3. Before declaring any task complete, run the full verification script (see HANDOFF.md).
4. If a file IS truncated, recover from git: `git show HEAD:filename > recovered.html`

Files over 400 lines (must use sed): contact.html (928), faq.html (860), investors.html (615), law-firms.html (560), tribal-nations.html (553), defense-contractors.html (531), products.html (527), medical-practices.html (527), research-labs.html (521), pricing.html (512), why-island-mountain.html (456), technology.html (456), blog.html (433), index.html (409), solutions.html (396 but will grow significantly).

New vertical pages will be 500+ lines each — after initial creation via Write tool, use sed for any subsequent edits.

---

## SCOPE OF WORK

### Phase 1: Create 5 New Vertical Landing Pages
### Phase 2: Update Navbar on All 30 HTML Files (3 locations per file)
### Phase 3: Update solutions.html Hub Page
### Phase 4: Update sitemap.xml, llms.txt, HANDOFF.md

---

## PHASE 1: CREATE 5 NEW VERTICAL LANDING PAGES

Create these five new files in the root of the workspace:

1. `financial-services.html`
2. `insurance.html`
3. `energy-utilities.html`
4. `government.html`
5. `education.html`

### Template Pattern

Every vertical page follows the EXACT same structure as `law-firms.html`. Use that file as the canonical template. The sections in order are:

```
1. <!DOCTYPE html> + <head> with:
   - charset, viewport, title, meta description
   - favicon links (same on every page)
   - stylesheet links: css/style.css, icons/remixicon.css, fonts/fonts.css
   - canonical URL
   - Open Graph tags (og:title, og:description, og:url, og:type, og:site_name, og:image)
   - Twitter Card tags (summary_large_image)
   - FAQPage JSON-LD schema (4 Q&A pairs per page)
   - BreadcrumbList JSON-LD schema

2. <body>:
   - particles canvas
   - hero background photo (picture element with WebP/PNG)
   - UPDATED navbar (with all 10 verticals — see Phase 2)
   - sidebar overlay + UPDATED mobile sidebar (with all 10 verticals)
   - Hero section (hero-badge, h1, subtitle paragraph)
   - Breadcrumb nav (Home > Solutions > [Industry])
   - "The Problem" section (section-first): section-badge, h2, p, then prose paragraphs
   - "How It Works" section (section-dark): 3 cards (card-grid-3)
   - "Workflows" section (section-darker): 6 workflow cards (card-grid-3) + comparison-note disclaimer
   - "Model Selection" section (section-dark): 3 model cards (DeepSeek V4-Flash, Llama 3.1 70B, Mixtral 8x22B)
   - Comparison table section (section-darker): Cloud vs Island Mountain cost table
   - "Honest Limitations" section (section-dark): 4 risk-cards
   - Regulatory context prose section (section-darker): cite-specific laws and frameworks
   - Power requirements notice (section-dark)
   - FAQ section (section-darker): 4 risk-cards mirroring the JSON-LD FAQ
   - Compliance disclaimer (section-dark)
   - AEO Summary block (copper left border)
   - Testimonial section (section-dark): 3 blockquotes
   - CTA section (section-darker): heading, subtext, two buttons, cross-link line
   - UPDATED footer (with all 10 verticals)
   - main.js script
```

### Shared Elements (copy exactly from law-firms.html)

**Favicon links (lines 8-10):**
```html
<link rel="icon" type="image/x-icon" href="favicon.ico?v=2">
<link rel="icon" type="image/png" sizes="32x32" href="images/favicon-32.png?v=2">
<link rel="apple-touch-icon" sizes="180x180" href="images/apple-touch-icon.png?v=2">
```

**Stylesheet links (lines 11-13):**
```html
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="icons/remixicon.css">
<link rel="stylesheet" href="fonts/fonts.css">
```

**Particles canvas + hero photo (lines 87-93):**
```html
<canvas id="particles-canvas"></canvas>
<div class="hero-photo">
  <picture><source srcset="images/hero-mountain-mobile.webp 800w, images/hero-mountain.webp 1913w" type="image/webp" sizes="100vw"><img src="images/hero-mountain.png" alt="Island Mountain rising from the ocean at sunset" loading="lazy" width="1913" height="892"></picture>
</div>
```

**Power requirements notice (same on every vertical):**
```html
<section class="section section-dark">
  <div class="container">
    <div class="power-notice fade-in">
      <i class="ri-flashlight-line"></i>
      <p><strong>Power &amp; Installation:</strong> All Island Mountain systems require a dedicated 208V/30A power circuit (NEMA L6-30R). This is standard in server rooms and data closets. Most organizations with an existing server closet already have this infrastructure or can add it for $500-$2,000 through a licensed electrician. The system fits in a standard 4U rack space. Average power draw under typical inference loads is 1.5-2.5 kW.</p>
    </div>
  </div>
</section>
```

**Compliance disclaimer (same pattern, customize entity name):**
```html
<section class="section section-dark">
  <div class="container">
    <div class="fade-in" style="max-width:760px;margin:0 auto;padding:24px;border:1px solid rgba(245,158,11,0.2);border-radius:var(--border-radius);background:rgba(245,158,11,0.04);">
      <p style="font-size:0.9rem;line-height:1.8;margin:0;color:var(--text-muted);">Island Mountain LLC is a hardware company, not a compliance authority. References to [RELEVANT FRAMEWORKS] on this page reflect factual descriptions of data handling mechanics -- not legal, regulatory, or compliance advice. Consult qualified counsel for compliance determinations specific to your organization and jurisdiction.</p>
    </div>
  </div>
</section>
```

**AEO Summary block pattern:**
```html
<div style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;">
<strong>Summary:</strong> [2-3 sentence direct answer about this vertical's compliance needs and how Island Mountain resolves them.]
</div>
```

**Model selection cards (same 3 models on every vertical, just change "Best for" text):**
- DeepSeek V4-Flash: icon ri-brain-line, card-icon-green
- Llama 3.1 70B: icon ri-robot-2-line, card-icon-indigo
- Mixtral 8x22B: icon ri-translate-2, card-icon-purple

---

### PAGE 1: financial-services.html

**Meta:**
```html
<title>On‑Premises AI Servers for Banks &amp; Credit Unions | GLBA Compliance | Island Mountain</title>
<meta name="description" content="Pre-built, air-gap-capable AI inference hardware for financial institutions. Keep customer financial data (NPI) inside your own network, satisfy GLBA &amp; PCI DSS, and run unlimited inference on your own H100/H200 GPUs.">
<link rel="canonical" href="https://islandmountain.io/financial-services.html">
```

**OG/Twitter:** Match title and description above. URL: `https://islandmountain.io/financial-services.html`

**Hero:**
- Badge: `Local AI for Financial Services`
- H1: `Your Customers' Financial Data Doesn't Belong on Someone Else's Server`
- Subtitle: `Every prompt sent to a cloud AI service transmits non-public personal information to third-party infrastructure. GLBA requires financial institutions to protect NPI. Local AI hardware eliminates the transmission entirely -- your data stays in your vault, not theirs.`

**Breadcrumb:** `Home > Solutions > Financial Services`
**BreadcrumbList schema:** positions 1-3 with URLs for Home, Solutions, Financial Services

**"The Problem" section:**
- Badge: `The Compliance Risk`
- H2: `The Cloud AI Problem for Financial Institutions`
- P subtitle: `Cloud AI creates structural conflict with the Gramm-Leach-Bliley Act's safeguards for non-public personal information.`
- Prose (3 paragraphs): Cover GLBA Safeguards Rule requiring financial institutions to protect NPI. Explain that cloud AI transmits NPI to third-party data centers for processing. PCI DSS adds requirements for cardholder data environments. SEC oversight for investment firms adds another layer. Reference that financial services is one of [link to solutions.html]ten regulated industries[/link] where this structural conflict is most acute. The vendor's privacy policy -- not your compliance program -- controls what happens to that data once transmitted. This isn't theoretical risk; it's the mechanical reality of cloud API architecture.

**"How It Works" 3 cards:**
1. Zero External Transmission (ri-shield-check-line, card-icon-green): NPI never leaves your network. Prompts travel from workstation to server over internal network only.
2. Hardware You Own (ri-server-line, card-icon-indigo): Physical server with NVIDIA H100 GPUs in your data center, your power, your network. Outright ownership.
3. Air-Gap Capable (ri-wifi-off-line, card-icon-purple): Complete network isolation available. No external connections of any kind for maximum security posture.

**"Workflows" 6 cards:**
1. Loan Document Review (ri-file-search-line, card-icon-green): Analyze loan applications, underwriting documents, and credit assessments. Flag risk factors, extract key terms, compare against lending criteria.
2. KYC/AML Analysis (ri-user-search-line, card-icon-indigo): Process Know Your Customer documentation and Anti-Money Laundering screening. Analyze transaction patterns and flag suspicious activity without exposing customer data to cloud APIs.
3. Regulatory Reporting (ri-file-text-line, card-icon-purple): Draft regulatory filings, compliance reports, and audit responses. Summarize complex regulatory requirements and map them to institutional practices.
4. Fraud Detection Support (ri-alarm-warning-line, card-icon-amber): Analyze transaction patterns, flag anomalies, and generate fraud investigation summaries. Process sensitive financial data entirely on-premises.
5. Customer Communication Drafting (ri-mail-send-line, card-icon-green): Generate compliant customer correspondence, disclosure documents, and advisory communications. Maintain consistent regulatory language across all client touchpoints.
6. Investment Analysis (ri-line-chart-line, card-icon-indigo): Summarize market research, analyze portfolio documentation, and draft investment memoranda. Process proprietary trading strategies and client financial data locally.
- Disclaimer note: Island Mountain hardware runs general-purpose large language models. These are not financial-specific fine-tuned models. They do not include Bloomberg terminal integrations, real-time market data feeds, or regulatory filing system connectors. The models are strong at reasoning, analysis, and drafting -- but they are tools for financial professionals, not replacements for professional judgment.

**Model selection "Best for" text:**
- DeepSeek V4-Flash: Complex document analysis, multi-document regulatory review, loan portfolio assessment, long-context financial reporting tasks.
- Llama 3.1 70B: General drafting, customer correspondence, compliance memos, internal communications, regulatory narrative writing.
- Mixtral 8x22B: Multilingual document processing for international banking operations, cross-border compliance documentation, multi-language customer communications.

**Comparison table:**
- Title: `Cloud AI vs. Island Mountain for a Mid-Size Financial Institution`
- Subtitle: `The cloud costs every month and transmits NPI every session. The hardware costs once and keeps everything in-house.`
- Rows: Year 1 Cost, Year 3 Cumulative, Year 5 Cumulative, Customer Data Location, Compliance Risk, Per-Token Fees, Model Control, Banking System Integration (honest: "Not included. General-purpose AI."), Vendor Lock-In
- Cloud column: $50-$200/user/mo estimates for AI platforms, data on cloud servers, NPI transmitted to third party
- Island Mountain column: $75K-$85K one-time Starter, electricity only after, your data center, zero transmission

**"Honest Limitations" 4 cards:**
1. No Financial-Specific Fine-Tuning: General-purpose LLMs, not trained on financial datasets. No Bloomberg integration, no real-time market data.
2. No Banking System Integration: Does not connect to core banking platforms, loan origination systems, or CRM tools out of the box. Manual data transfer via OpenWebUI chat interface.
3. No Regulatory Filing Connectors: Does not submit to EDGAR, FFIEC, or state regulatory portals. AI assists with drafting -- filing is manual.
4. You Own the Maintenance: After 30-day included support, your IT team handles OS updates, model updates, and general system administration.

**Regulatory context section:**
- Badge: `Regulatory Context`
- H2: `GLBA, PCI DSS, and the Case for Local AI`
- 3-4 paragraphs covering: GLBA Safeguards Rule (16 CFR Part 314) requires financial institutions to develop, implement, and maintain a comprehensive information security program. PCI DSS v4.0 mandates strict controls over cardholder data environments. SEC Regulation S-P requires broker-dealers and investment advisers to protect customer records and information. The common thread: these frameworks require institutional control over data handling infrastructure. Cloud AI processing creates a dependency on vendor infrastructure that complicates compliance across all three frameworks. Local deployment returns that control to the institution.
- Disclaimer box at bottom (same pattern as law-firms.html but referencing GLBA, PCI DSS, SEC regulations).

**FAQ section (4 questions, also in JSON-LD schema):**
1. "Does using cloud AI for financial document processing violate GLBA?" — Explain NPI transmission to third party, Safeguards Rule requirements, structural risk, how local eliminates it.
2. "What financial workflows can a bank run on Island Mountain hardware?" — List the 6 workflows. Note DeepSeek V4-Flash for complex analysis, Llama 3.1 70B for general drafting.
3. "How does the cost compare to cloud AI for a 50-person financial institution?" — Cloud at $50-$200/user/mo = $30K-$120K/yr. Island Mountain Starter $75K-$85K one-time. Parity by year 1-2 depending on user count.
4. "Does our institution need dedicated IT staff?" — No. Ships pre-configured. Browser-based interface. 30 days setup support. Standard Linux maintenance.

**AEO Summary:**
`Local AI infrastructure keeps non-public personal information inside your institution's network, eliminating the third-party data transmission that creates GLBA and PCI DSS compliance risk when using cloud AI services.`

**Testimonials (3 blockquotes):**
1. "Regional bank processing 500 loan applications per month. Every document stays on our servers. GLBA compliance is no longer a question mark." — Community Bank, Texas
2. "Credit union serving 40,000 members. Our members' financial data never touches a cloud API. That's the standard our board demanded." — Credit Union, Midwest
3. "Investment advisory firm handling $2B AUM. Proprietary research and client portfolio data stay in-house. Cloud AI was never on the table." — RIA, Northeast

**CTA section:**
- H2: `Ready to Keep Customer Data Where It Belongs?`
- Subtext: One conversation. No sales pitch. Tell us about your institution's AI needs and we will spec the right system.
- Buttons: Request a Quote (contact.html), See Full Specs (products.html)
- Cross-link line: `See all ten industries we serve` (solutions.html) or explore: Insurance (insurance.html) · Energy & Utilities (energy-utilities.html)

---

### PAGE 2: insurance.html

**Meta:**
```html
<title>Local AI Hardware for Insurance | PII &amp; Claims on Your Servers | Island Mountain</title>
<meta name="description" content="Process claims, underwriting, and fraud detection on hardware you own. Our H100/H200 inference racks keep policyholder data within your network -- no cloud, no BAA complexity, no data exposure.">
<link rel="canonical" href="https://islandmountain.io/insurance.html">
```

**Hero:**
- Badge: `Local AI for Insurance`
- H1: `Policyholder Data Doesn't Belong in Someone Else's Data Center`
- Subtitle: `Claims processing, underwriting analysis, and fraud detection all require handling sensitive personal and health information. Cloud AI transmits that data to third-party infrastructure. Local AI keeps it on hardware you own and control.`

**Breadcrumb:** `Home > Solutions > Insurance`

**"The Problem" section:**
- Badge: `The Data Exposure Problem`
- H2: `The Cloud AI Problem for Insurers`
- Prose: Cover HIPAA requirements for health insurers, state insurance regulations, NAIC model laws governing data security, PII handling for P&C insurers. Insurers collect and process some of the most sensitive personal data in any industry: health records, financial information, driving histories, property details. Cloud AI processing transmits this data outside institutional control. Reference solutions.html hub.

**"How It Works" 3 cards:** Same structure as financial-services, adapted for insurance context.

**"Workflows" 6 cards:**
1. Claims Processing (ri-file-search-line): Analyze claim submissions, extract key data points, flag inconsistencies, and accelerate adjudication.
2. Underwriting Analysis (ri-bar-chart-grouped-line): Process applications, evaluate risk factors, and generate underwriting summaries from complex multi-document submissions.
3. Fraud Detection (ri-alarm-warning-line): Analyze claim patterns, identify anomalies, cross-reference historical data to flag potential fraud for investigation.
4. Policy Document Review (ri-file-text-line): Compare policy language across versions, identify coverage gaps, and extract key terms for compliance review.
5. Actuarial Support (ri-calculator-line): Summarize actuarial reports, process loss data, and assist with reserve analysis documentation.
6. Customer Correspondence (ri-mail-send-line): Draft policyholder communications, denial explanations, renewal notices, and regulatory-compliant disclosures.
- Disclaimer: General-purpose LLMs, not insurance-specific. No Guidewire, Duck Creek, or claims management system integrations.

**Comparison table:** Cloud AI vs. Island Mountain for a Mid-Size Insurance Carrier. Same structure, insurance-specific language.

**"Honest Limitations" 4 cards:**
1. No Insurance-Specific Fine-Tuning
2. No Claims Management Integration (no Guidewire, Duck Creek, Majesco)
3. No Actuarial Modeling Engine (assists with documentation, not replacement for actuarial software)
4. You Own the Maintenance

**Regulatory context:** HIPAA for health insurers, NAIC Insurance Data Security Model Law (#668), state-specific regulations, Gramm-Leach-Bliley overlap for financial products.

**FAQ (4 Qs):**
1. Does cloud AI create HIPAA risk for health insurers?
2. What insurance workflows does Island Mountain support?
3. Cost comparison for a 30-person insurance office?
4. Dedicated IT staff needed?

**AEO Summary:** `Local AI infrastructure keeps policyholder data -- including health records, financial information, and claims history -- inside your institution's network. No cloud transmission, no BAA dependency, no third-party data exposure.`

**Testimonials:** P&C carrier, health insurer, independent agency -- all regional/unnamed, same format as law-firms.html.

**CTA cross-links:** Financial Services · Government

---

### PAGE 3: energy-utilities.html

**Meta:**
```html
<title>Air‑Gapped AI Servers for Energy &amp; Utilities | NERC CIP Compliant | Island Mountain</title>
<meta name="description" content="Pre-built H100/H200 hardware that keeps operational data off the cloud. Designed for NERC CIP and IEC 62443 environments. Run grid analytics, maintenance predictions, and compliance analysis entirely on-premises.">
<link rel="canonical" href="https://islandmountain.io/energy-utilities.html">
```

**Hero:**
- Badge: `Local AI for Energy & Utilities`
- H1: `Critical Infrastructure Data Doesn't Leave the Facility. Period.`
- Subtitle: `NERC CIP and IEC 62443 exist because the bulk electric system cannot tolerate data exposure. Cloud AI processing of operational technology data creates structural compliance violations. Air-gapped local AI eliminates the attack surface entirely.`

**Breadcrumb:** `Home > Solutions > Energy & Utilities`

**"The Problem" section:**
- Badge: `The Critical Infrastructure Problem`
- H2: `The Cloud AI Problem for Energy and Utilities`
- Prose: NERC CIP standards mandate strict cybersecurity controls for the bulk electric system. IEC 62443 governs industrial automation and control systems. FERC oversight adds federal enforcement teeth. Operational technology (OT) data from SCADA systems, grid management platforms, and pipeline monitoring cannot be transmitted to cloud infrastructure without creating compliance violations and cybersecurity exposure. The air-gap requirement isn't a preference -- it's a structural mandate for critical infrastructure operators.

**"How It Works" 3 cards:** Emphasize air-gap capability, complete network isolation, and OT/IT network separation.

**"Workflows" 6 cards:**
1. Predictive Maintenance Analysis (ri-tools-line)
2. Grid Operations Documentation (ri-flashlight-line)
3. NERC CIP Compliance Reporting (ri-file-text-line)
4. Pipeline Monitoring Analysis (ri-route-line)
5. Outage Response Documentation (ri-alarm-warning-line)
6. Regulatory Filing Drafting (ri-draft-line)
- Disclaimer: General-purpose LLMs. No SCADA integration, no real-time grid management, no OMS/DMS connectors.

**Comparison table:** Focused on operational data security, air-gap requirements, and the specific compliance cost of cloud for critical infrastructure.

**"Honest Limitations" 4 cards:**
1. No SCADA/OT Integration
2. No Real-Time Grid Management (inference tool, not control system)
3. No Utility-Specific Modeling Engine
4. You Own the Maintenance

**Regulatory context:** NERC CIP-003 through CIP-013, IEC 62443, FERC jurisdiction, DOE critical infrastructure guidelines, TSA Pipeline Security Directives.

**FAQ:** 4 questions about NERC CIP compliance, supported workflows, cost, IT requirements.

**AEO Summary:** `Air-gapped AI inference hardware keeps operational technology data entirely within the facility perimeter. No cloud transmission, no NERC CIP compliance risk, no attack surface expansion for critical infrastructure operators.`

**Testimonials:** Municipal utility, pipeline operator, renewable energy company. Regional/unnamed.

**CTA cross-links:** Government · Financial Services

---

### PAGE 4: government.html

**Meta:**
```html
<title>On‑Premises AI for Government | FedRAMP, CUI, Air‑Gapped | Island Mountain</title>
<meta name="description" content="Secure AI inference hardware for federal, state, and local agencies. Process CUI and sensitive data on your own H100/H200 servers, fully air-gappable, with zero cloud dependency.">
<link rel="canonical" href="https://islandmountain.io/government.html">
```

**Hero:**
- Badge: `Local AI for Government`
- H1: `Government Data Stays on Government Hardware. Full Stop.`
- Subtitle: `FedRAMP, CUI handling rules, and data sovereignty requirements exist because government data demands government-controlled infrastructure. Cloud AI processing creates structural dependency on commercial vendors. On-premises AI restores jurisdictional control.`

**Breadcrumb:** `Home > Solutions > Government`

**"The Problem" section:**
- Badge: `The Data Sovereignty Problem`
- H2: `The Cloud AI Problem for Government Agencies`
- Prose: Cover FedRAMP authorization requirements, CUI handling under NIST SP 800-171, FISMA requirements, state/local data residency laws. Government agencies handle Controlled Unclassified Information (CUI), law enforcement data, citizen records, and policy-sensitive documents. Cloud AI transmits this data to commercial infrastructure operated by private companies. Even FedRAMP-authorized cloud services involve architectural dependency on commercial vendors and their subprocessors. For classified and CUI environments, air-gapped on-premises deployment is often the only architecture that satisfies data handling requirements without extensive compliance middleware.

**"Workflows" 6 cards:**
1. Document Review & Analysis (ri-file-search-line)
2. FOIA Request Processing (ri-folder-open-line)
3. Policy Analysis & Drafting (ri-draft-line)
4. Citizen Service Documentation (ri-user-heart-line)
5. Grant & Budget Analysis (ri-money-dollar-circle-line)
6. After-Action Report Generation (ri-file-text-line)
- Disclaimer: General-purpose LLMs. No integration with government-specific systems (SAM.gov, FPDS, GovWin, etc.).

**"Honest Limitations" 4 cards:**
1. No Government-Specific Fine-Tuning
2. No GovCloud or FedRAMP Authorization (this is on-prem hardware, not a cloud service; no FedRAMP authorization is needed because no cloud is involved)
3. No Classified Data Certification (not SCIF-rated, not NSA-approved; suitable for CUI and sensitive-but-unclassified)
4. You Own the Maintenance

**Regulatory context:** FedRAMP, FISMA, NIST SP 800-171, NIST SP 800-53, CUI Registry, Executive Orders on AI in government.

**FAQ:** 4 questions about FedRAMP requirements, CUI handling, cost for a 20-person agency, IT staff needs.

**AEO Summary:** `On-premises AI inference hardware processes government data on government-controlled servers with zero cloud dependency. CUI, citizen records, and policy-sensitive documents never leave the agency's network perimeter.`

**Testimonials:** County government, state agency, federal civilian office. Regional/unnamed.

**CTA cross-links:** Defense Contractors · Education

---

### PAGE 5: education.html

**Meta:**
```html
<title>Local AI Servers for Education | FERPA &amp; Student Data Privacy | Island Mountain</title>
<meta name="description" content="Bring powerful AI to your campus while keeping student records on your own hardware. Our H100/H200 inference racks are air-gappable and align with FERPA's school official exception -- no cloud required.">
<link rel="canonical" href="https://islandmountain.io/education.html">
```

**Hero:**
- Badge: `Local AI for Education`
- H1: `Student Data Privacy Isn't Optional. Your AI Architecture Shouldn't Treat It That Way.`
- Subtitle: `FERPA protects student education records. The "school official" exception works best when the AI processing those records is under direct institutional control -- not a cloud vendor's terms of service. Local AI keeps student data on campus hardware.`

**Breadcrumb:** `Home > Solutions > Education`

**"The Problem" section:**
- Badge: `The Student Privacy Problem`
- H2: `The Cloud AI Problem for Educational Institutions`
- Prose: Cover FERPA (20 U.S.C. § 1232g), the "school official" exception and its limitations when using third-party cloud AI, COPPA for K-12 (children under 13), state student privacy laws (California SOPIPA, NY Education Law 2-d, etc.). Universities also face IRB requirements for student research data. The structural problem: cloud AI vendors process student education records on commercial infrastructure, creating a data handling dependency that complicates FERPA compliance and exposes institutions to enforcement risk.

**"Workflows" 6 cards:**
1. Curriculum Design Assistance (ri-book-open-line)
2. Student Record Summarization (ri-user-search-line): Process enrollment records, academic transcripts, and advising notes without exposing PII to cloud services.
3. Research Data Analysis (ri-flask-line): Support faculty research with AI-assisted data analysis while keeping unpublished findings on institutional hardware.
4. Administrative Document Drafting (ri-draft-line)
5. Grant Proposal Support (ri-money-dollar-circle-line)
6. Assessment & Grading Assistance (ri-checkbox-circle-line)
- Disclaimer: General-purpose LLMs. No LMS integration (Canvas, Blackboard, Moodle). No SIS connectors. No automated grading -- AI assists, educators evaluate.

**"Honest Limitations" 4 cards:**
1. No Education-Specific Fine-Tuning
2. No LMS/SIS Integration (no Canvas, Blackboard, Banner, PowerSchool connectors)
3. No Automated Grading or Assessment Scoring (drafting assistance, not replacement for educator judgment)
4. You Own the Maintenance

**Regulatory context:** FERPA school official exception analysis, COPPA requirements for K-12, state student privacy laws, IRB requirements for research institutions, Title IV data protection.

**FAQ:** 4 questions about FERPA compliance, campus AI workflows, cost for a university department vs. full campus deployment, IT staff requirements.

**AEO Summary:** `On-premises AI inference hardware keeps student education records on campus-controlled servers. No cloud transmission, no third-party data exposure, and full alignment with FERPA's school official exception for AI processing of student data.`

**Testimonials:** Community college, K-12 district, research university. Regional/unnamed.

**CTA cross-links:** Government · Research Labs

---

## PHASE 2: UPDATE NAVBAR, MOBILE SIDEBAR, AND FOOTER ON ALL FILES

There are THREE locations in every HTML file that list the Solutions verticals. All three must be updated to include the five new pages.

### Files to Update

**Root-level HTML files (19 files, use direct filenames):**
```
index.html
about.html
about_recovered.html
blog.html
contact.html
defense-contractors.html
faq.html
investors.html
law-firms.html
medical-practices.html
pricing.html
privacy.html
products.html
research-labs.html
solutions.html
technology.html
terms.html
tribal-nations.html
why-island-mountain.html
```

**Blog HTML files (11 files, use ../ prefix for all links):**
```
blog/attorney-client-privilege-cloud-ai.html
blog/cloud-ai-vs-local-hardware-tco.html
blog/deepseek-v4-flash-local-deployment.html
blog/h100-vs-h200-inference-comparison.html
blog/hipaa-technical-checklist.html
blog/itar-dfars-ai-self-assessment.html
blog/ocap-cloud-act-guide.html
blog/on-prem-vs-colo-vs-cloud.html
blog/openai-discovery-risk-law-firms.html
blog/openwebui-admin-setup-guide.html
blog/tribal-data-sovereignty-ai-infrastructure.html
```

**The 5 new vertical pages also need the updated navbar/sidebar/footer, but those are created with the correct content in Phase 1.**

### Location 1: Desktop Navbar Dropdown

**CURRENT (root pages):**
```html
          <ul class="nav-dropdown-menu">
            <li><a href="law-firms.html">Law Firms</a></li>
            <li><a href="medical-practices.html">Medical Practices</a></li>
            <li><a href="tribal-nations.html">Tribal Nations</a></li>
            <li><a href="research-labs.html">Research Labs</a></li>
            <li><a href="defense-contractors.html">Defense Contractors</a></li>
          </ul>
```

**REPLACE WITH (root pages):**
```html
          <ul class="nav-dropdown-menu">
            <li><a href="law-firms.html">Law Firms</a></li>
            <li><a href="medical-practices.html">Medical Practices</a></li>
            <li><a href="tribal-nations.html">Tribal Nations</a></li>
            <li><a href="research-labs.html">Research Labs</a></li>
            <li><a href="defense-contractors.html">Defense Contractors</a></li>
            <li><a href="financial-services.html">Financial Services</a></li>
            <li><a href="insurance.html">Insurance</a></li>
            <li><a href="energy-utilities.html">Energy &amp; Utilities</a></li>
            <li><a href="government.html">Government</a></li>
            <li><a href="education.html">Education</a></li>
          </ul>
```

**CURRENT (blog pages):**
```html
          <ul class="nav-dropdown-menu">
            <li><a href="../law-firms.html">Law Firms</a></li>
            <li><a href="../medical-practices.html">Medical Practices</a></li>
            <li><a href="../tribal-nations.html">Tribal Nations</a></li>
            <li><a href="../research-labs.html">Research Labs</a></li>
            <li><a href="../defense-contractors.html">Defense Contractors</a></li>
          </ul>
```

**REPLACE WITH (blog pages):**
```html
          <ul class="nav-dropdown-menu">
            <li><a href="../law-firms.html">Law Firms</a></li>
            <li><a href="../medical-practices.html">Medical Practices</a></li>
            <li><a href="../tribal-nations.html">Tribal Nations</a></li>
            <li><a href="../research-labs.html">Research Labs</a></li>
            <li><a href="../defense-contractors.html">Defense Contractors</a></li>
            <li><a href="../financial-services.html">Financial Services</a></li>
            <li><a href="../insurance.html">Insurance</a></li>
            <li><a href="../energy-utilities.html">Energy &amp; Utilities</a></li>
            <li><a href="../government.html">Government</a></li>
            <li><a href="../education.html">Education</a></li>
          </ul>
```

### Location 2: Mobile Sidebar

**CURRENT (root pages):**
```html
    <div class="mobile-solutions-links">
      <a href="law-firms.html">Law Firms</a>
      <a href="medical-practices.html">Medical Practices</a>
      <a href="tribal-nations.html">Tribal Nations</a>
      <a href="research-labs.html">Research Labs</a>
      <a href="defense-contractors.html">Defense Contractors</a>
    </div>
```

**REPLACE WITH (root pages):**
```html
    <div class="mobile-solutions-links">
      <a href="law-firms.html">Law Firms</a>
      <a href="medical-practices.html">Medical Practices</a>
      <a href="tribal-nations.html">Tribal Nations</a>
      <a href="research-labs.html">Research Labs</a>
      <a href="defense-contractors.html">Defense Contractors</a>
      <a href="financial-services.html">Financial Services</a>
      <a href="insurance.html">Insurance</a>
      <a href="energy-utilities.html">Energy &amp; Utilities</a>
      <a href="government.html">Government</a>
      <a href="education.html">Education</a>
    </div>
```

**Blog pages:** Same pattern but with `../` prefix on all hrefs.

### Location 3: Footer Solutions Column

**CURRENT (root pages):**
```html
          <h4>Solutions</h4>
          <ul class="footer-links">
            <li><a href="law-firms.html">Law Firms</a></li>
            <li><a href="medical-practices.html">Medical Practices</a></li>
            <li><a href="tribal-nations.html">Tribal Nations</a></li>
            <li><a href="research-labs.html">Research Labs</a></li>
            <li><a href="defense-contractors.html">Defense Contractors</a></li>
          </ul>
```

**REPLACE WITH (root pages):**
```html
          <h4>Solutions</h4>
          <ul class="footer-links">
            <li><a href="law-firms.html">Law Firms</a></li>
            <li><a href="medical-practices.html">Medical Practices</a></li>
            <li><a href="tribal-nations.html">Tribal Nations</a></li>
            <li><a href="research-labs.html">Research Labs</a></li>
            <li><a href="defense-contractors.html">Defense Contractors</a></li>
            <li><a href="financial-services.html">Financial Services</a></li>
            <li><a href="insurance.html">Insurance</a></li>
            <li><a href="energy-utilities.html">Energy &amp; Utilities</a></li>
            <li><a href="government.html">Government</a></li>
            <li><a href="education.html">Education</a></li>
          </ul>
```

**Blog pages:** Same pattern but with `../` prefix on all hrefs.

### Recommended sed Commands

For root-level files (run per file, replace SLUG with your session slug):

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

# Desktop navbar: insert 5 new lines after defense-contractors.html in nav-dropdown-menu
for f in "$SITE"/*.html; do
  sed -i '/<li><a href="defense-contractors.html">Defense Contractors<\/a><\/li>/{
    /nav-dropdown-menu/!{
      N
      /<\/ul>/!b
    }
    a\            <li><a href="financial-services.html">Financial Services</a></li>\
            <li><a href="insurance.html">Insurance</a></li>\
            <li><a href="energy-utilities.html">Energy \&amp; Utilities</a></li>\
            <li><a href="government.html">Government</a></li>\
            <li><a href="education.html">Education</a></li>
  }' "$f"
done
```

**IMPORTANT:** The above sed is illustrative. The actual implementation must be more precise because the same "defense-contractors" link appears in 3 different contexts (navbar, sidebar, footer) within each file. You need to target each context separately.

**Safer approach — use Python for the replacements:**

```python
import os, re

site = "/sessions/SESSION-SLUG/mnt/Island Mountain"

# New lines for root pages (no prefix)
new_nav = '''            <li><a href="financial-services.html">Financial Services</a></li>
            <li><a href="insurance.html">Insurance</a></li>
            <li><a href="energy-utilities.html">Energy &amp; Utilities</a></li>
            <li><a href="government.html">Government</a></li>
            <li><a href="education.html">Education</a></li>'''

new_sidebar = '''      <a href="financial-services.html">Financial Services</a>
      <a href="insurance.html">Insurance</a>
      <a href="energy-utilities.html">Energy &amp; Utilities</a>
      <a href="government.html">Government</a>
      <a href="education.html">Education</a>'''

new_footer = '''            <li><a href="financial-services.html">Financial Services</a></li>
            <li><a href="insurance.html">Insurance</a></li>
            <li><a href="energy-utilities.html">Energy &amp; Utilities</a></li>
            <li><a href="government.html">Government</a></li>
            <li><a href="education.html">Education</a></li>'''

# Blog versions (../ prefix)
new_nav_blog = new_nav.replace('href="', 'href="../')
new_sidebar_blog = new_sidebar.replace('href="', 'href="../')
new_footer_blog = new_footer.replace('href="', 'href="../')

def update_file(filepath, is_blog=False):
    with open(filepath, 'r') as f:
        content = f.read()
    
    nav = new_nav_blog if is_blog else new_nav
    sidebar = new_sidebar_blog if is_blog else new_sidebar
    footer = new_footer_blog if is_blog else new_footer
    prefix = "../" if is_blog else ""
    
    # Check if already updated
    if "financial-services.html" in content:
        print(f"SKIP (already updated): {filepath}")
        return
    
    # 1. Desktop navbar: insert after defense-contractors in nav-dropdown-menu
    nav_old = f'<li><a href="{prefix}defense-contractors.html">Defense Contractors</a></li>\n          </ul>\n        </li>'
    nav_new = f'<li><a href="{prefix}defense-contractors.html">Defense Contractors</a></li>\n{nav}\n          </ul>\n        </li>'
    content = content.replace(nav_old, nav_new, 1)
    
    # 2. Mobile sidebar: insert after defense-contractors in mobile-solutions-links
    sidebar_old = f'<a href="{prefix}defense-contractors.html">Defense Contractors</a>\n    </div>'
    sidebar_new = f'<a href="{prefix}defense-contractors.html">Defense Contractors</a>\n{sidebar}\n    </div>'
    content = content.replace(sidebar_old, sidebar_new, 1)
    
    # 3. Footer: insert after defense-contractors in footer-links
    footer_old = f'<li><a href="{prefix}defense-contractors.html">Defense Contractors</a></li>\n          </ul>'
    footer_new = f'<li><a href="{prefix}defense-contractors.html">Defense Contractors</a></li>\n{footer}\n          </ul>'
    content = content.replace(footer_old, footer_new, 1)
    
    with open(filepath, 'w') as f:
        f.write(content)
    
    # Verify
    if '</html>' in content:
        print(f"OK: {filepath}")
    else:
        print(f"WARNING - POSSIBLE TRUNCATION: {filepath}")

# Process root pages
for f in os.listdir(site):
    if f.endswith('.html') and f != 'googlecff518dc414acaa3.html':
        update_file(os.path.join(site, f), is_blog=False)

# Process blog pages
blog_dir = os.path.join(site, "blog")
if os.path.isdir(blog_dir):
    for f in os.listdir(blog_dir):
        if f.endswith('.html'):
            update_file(os.path.join(blog_dir, f), is_blog=True)
```

Run this as: `python3 /tmp/update_nav.py`

After running, verify ALL files:
```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"
for f in "$SITE"/*.html "$SITE"/blog/*.html; do
  [ "$(basename "$f")" = "googlecff518dc414acaa3.html" ] && continue
  lines=$(wc -l < "$f")
  has_close=$(grep -c '</html>' "$f")
  has_financial=$(grep -c 'financial-services.html' "$f")
  if [ "$has_close" -eq 0 ]; then
    echo "TRUNCATED: $f ($lines lines)"
  elif [ "$has_financial" -lt 3 ]; then
    echo "INCOMPLETE NAV UPDATE: $f (only $has_financial occurrences of financial-services.html, expected 3)"
  else
    echo "OK: $f ($lines lines, $has_financial nav refs)"
  fi
done
```

---

## PHASE 3: UPDATE solutions.html HUB PAGE

The solutions.html hub page currently has cards for 5 industries. Add 5 more industry cards to the "card-grid card-grid-3" section within the "By Industry" section.

### New Cards to Add (insert after the existing "Overlapping Frameworks" card)

Actually -- restructure: keep the 5 existing industry cards, add the 5 new ones in the same card-grid, and move "Overlapping Frameworks" to be the last card (or 12th card to fill the 3-column grid evenly).

**New card order in the grid (12 cards = 4 rows of 3):**
1. Law Firms (existing)
2. Medical Practices (existing)
3. Tribal Nations (existing)
4. Research Labs (existing)
5. Defense Contractors (existing)
6. Financial Services (NEW)
7. Insurance (NEW)
8. Energy & Utilities (NEW)
9. Government (NEW)
10. Education (NEW)
11. Overlapping Frameworks (existing, move to position 11)
12. [Leave empty OR add a "Don't See Your Industry?" card linking to contact.html]

**New card HTML for Financial Services:**
```html
        <div class="card">
          <div class="card-icon card-icon-green">
            <i class="ri-bank-line"></i>
          </div>
          <h3>Financial Services</h3>
          <p>GLBA requires financial institutions to protect non-public personal information. PCI DSS mandates strict controls over cardholder data environments. Cloud AI transmits both to third-party infrastructure. Local deployment keeps NPI on your servers.</p>
          <p style="font-size:0.9rem;color:var(--text-muted);margin-top:8px;"><strong>Key workflows:</strong> Loan document review, KYC/AML analysis, fraud detection, regulatory reporting, customer correspondence, investment analysis.</p>
          <a href="financial-services.html" class="btn btn-secondary" style="margin-top:16px;">GLBA Compliance &amp; AI &rarr;</a>
        </div>
```

**Insurance:**
```html
        <div class="card">
          <div class="card-icon card-icon-green">
            <i class="ri-shield-user-line"></i>
          </div>
          <h3>Insurance</h3>
          <p>Insurers process sensitive personal, financial, and health data under HIPAA, NAIC model laws, and state regulations. Cloud AI transmits policyholder information to commercial infrastructure. Local AI keeps claims, underwriting, and fraud analysis on your hardware.</p>
          <p style="font-size:0.9rem;color:var(--text-muted);margin-top:8px;"><strong>Key workflows:</strong> Claims processing, underwriting analysis, fraud detection, policy review, actuarial support, customer correspondence.</p>
          <a href="insurance.html" class="btn btn-secondary" style="margin-top:16px;">Insurance Data Privacy &amp; AI &rarr;</a>
        </div>
```

**Energy & Utilities:**
```html
        <div class="card">
          <div class="card-icon card-icon-green">
            <i class="ri-flashlight-line"></i>
          </div>
          <h3>Energy &amp; Utilities</h3>
          <p>NERC CIP and IEC 62443 mandate strict cybersecurity for the bulk electric system and industrial control systems. Cloud AI processing of operational technology data creates compliance violations and cybersecurity exposure. Air-gapped local AI eliminates the attack surface.</p>
          <p style="font-size:0.9rem;color:var(--text-muted);margin-top:8px;"><strong>Key workflows:</strong> Predictive maintenance, grid operations documentation, NERC CIP compliance reporting, pipeline monitoring, outage response documentation.</p>
          <a href="energy-utilities.html" class="btn btn-secondary" style="margin-top:16px;">NERC CIP Compliance &amp; AI &rarr;</a>
        </div>
```

**Government:**
```html
        <div class="card">
          <div class="card-icon card-icon-green">
            <i class="ri-government-line"></i>
          </div>
          <h3>Government</h3>
          <p>Federal, state, and local agencies handle CUI, law enforcement data, and citizen records under FedRAMP, FISMA, and NIST SP 800-171. Cloud AI creates dependency on commercial vendors. On-premises AI restores jurisdictional control over government data.</p>
          <p style="font-size:0.9rem;color:var(--text-muted);margin-top:8px;"><strong>Key workflows:</strong> Document review, FOIA processing, policy analysis, citizen service documentation, grant and budget analysis.</p>
          <a href="government.html" class="btn btn-secondary" style="margin-top:16px;">Government Data Sovereignty &amp; AI &rarr;</a>
        </div>
```

**Education:**
```html
        <div class="card">
          <div class="card-icon card-icon-green">
            <i class="ri-graduation-cap-line"></i>
          </div>
          <h3>Education</h3>
          <p>FERPA protects student education records. The "school official" exception works best when AI processing is under direct institutional control. Cloud AI introduces third-party data handling that complicates FERPA compliance. Local deployment keeps student data on campus.</p>
          <p style="font-size:0.9rem;color:var(--text-muted);margin-top:8px;"><strong>Key workflows:</strong> Curriculum design, student record summarization, research data analysis, administrative drafting, grant proposals, assessment assistance.</p>
          <a href="education.html" class="btn btn-secondary" style="margin-top:16px;">FERPA Compliance &amp; AI &rarr;</a>
        </div>
```

### Also Update on solutions.html

1. **Title tag:** Change "five primary regulated sectors" references to "ten regulated industries" in meta description, OG tags, hero text, FAQ schema, section text, and AEO summary.
2. **Hero h1:** Keep or adjust. Current works fine for 10 industries.
3. **Hero subtitle:** Update "Five regulated industries" to "Ten regulated industries."
4. **Section header for "The Common Thread":** Update paragraph text from "five regulated industries" to "ten regulated industries."
5. **FAQ schema:** Update first Q&A from "five primary regulated sectors" to "ten primary regulated sectors" and list all 10 verticals.
6. **AEO summary block:** Update from "five regulated industries" to "ten regulated industries" and list all 10.
7. **Blog crosslinks section:** Consider adding blog crosslinks for new verticals once blog posts are written (out of scope for this prompt, but note it).

### Also Update on solutions.html -- Header Text

Current "Choose Your Compliance Framework" subtitle: "Each industry page details the specific regulatory requirements..." -- keep this, it's generic enough for 10 pages.

---

## PHASE 4: UPDATE SUPPORTING FILES

### sitemap.xml

Add 5 new URL entries after the existing vertical pages section:

```xml
  <url>
    <loc>https://islandmountain.io/financial-services.html</loc>
    <lastmod>2026-05-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://islandmountain.io/insurance.html</loc>
    <lastmod>2026-05-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://islandmountain.io/energy-utilities.html</loc>
    <lastmod>2026-05-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://islandmountain.io/government.html</loc>
    <lastmod>2026-05-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://islandmountain.io/education.html</loc>
    <lastmod>2026-05-03</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

### llms.txt

Update the "Who This Is For" section to include all 10 verticals:

```
## Who This Is For
- Law firms protecting attorney-client privilege (ABA Model Rule 1.6)
- Medical practices needing HIPAA compliance without a BAA
- Defense contractors handling ITAR/CUI/CMMC-regulated data
- Tribal nations exercising data sovereignty (OCAP principles)
- Research labs protecting unpublished data and grant-funded IP
- Financial institutions complying with GLBA and PCI DSS
- Insurance carriers protecting policyholder PII and health data
- Energy and utility companies meeting NERC CIP and IEC 62443 requirements
- Government agencies handling CUI under FedRAMP and NIST SP 800-171
- Educational institutions protecting student records under FERPA
```

Add new key pages:
```
- Financial Services: https://islandmountain.io/financial-services.html
- Insurance: https://islandmountain.io/insurance.html
- Energy & Utilities: https://islandmountain.io/energy-utilities.html
- Government: https://islandmountain.io/government.html
- Education: https://islandmountain.io/education.html
```

### HANDOFF.md

Update the following sections:

1. **WHAT THIS SITE IS:** Change "Target markets (each has a dedicated landing page): Law Firms, Medical Practices, Tribal Nations, Research Labs, Defense Contractors." to include all 10.
2. **FILE INVENTORY:** Add entries for the 5 new vertical pages with line counts and schema info.
3. **SEO STATUS > Completed:** Add entry documenting the 5 new vertical pages, navbar/sidebar/footer updates across all files, sitemap and llms.txt updates.
4. **File at-risk list:** Add the 5 new pages with their line counts.

### Existing Vertical Pages — Update Cross-Link Lines

Each existing vertical page's CTA section has a cross-link line like:
```html
<p style="margin-top:24px;font-size:0.9rem;color:var(--text-muted);"><a href="solutions.html">See all five industries we serve</a> or explore: ...
```

Update "five" to "ten" on all existing vertical pages: law-firms.html, medical-practices.html, tribal-nations.html, research-labs.html, defense-contractors.html.

### Existing Pages — Update "five regulated industries" References

Search all files for "five regulated" or "5 regulated" and update to "ten regulated" or "10 regulated" as appropriate. Key files:
- solutions.html (hero subtitle, FAQ schema, AEO summary, section text)
- why-island-mountain.html (likely references 5 verticals)
- index.html (may reference 5 industries)
- faq.html (may reference 5 industries in answers)

Run: `grep -rn "five regulated\|five primary\|5 regulated\|five industries\|five vertical\|five sector" "$SITE"/*.html`

---

## VERIFICATION CHECKLIST

After all work is complete, run:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

echo "=== File Integrity Check ==="
for f in "$SITE"/*.html "$SITE"/blog/*.html; do
  [ "$(basename "$f")" = "googlecff518dc414acaa3.html" ] && continue
  lines=$(wc -l < "$f")
  has_close=$(grep -c '</html>' "$f")
  if [ "$has_close" -eq 0 ]; then
    echo "TRUNCATED: $f ($lines lines)"
  fi
done

echo ""
echo "=== New Files Exist ==="
for f in financial-services.html insurance.html energy-utilities.html government.html education.html; do
  if [ -f "$SITE/$f" ]; then
    lines=$(wc -l < "$SITE/$f")
    echo "OK: $f ($lines lines)"
  else
    echo "MISSING: $f"
  fi
done

echo ""
echo "=== Nav Update Coverage (expect 3 per file: navbar, sidebar, footer) ==="
for f in "$SITE"/*.html "$SITE"/blog/*.html; do
  [ "$(basename "$f")" = "googlecff518dc414acaa3.html" ] && continue
  count=$(grep -c 'financial-services.html' "$f")
  if [ "$count" -lt 3 ]; then
    echo "INCOMPLETE: $(basename "$f") — only $count references (expected 3)"
  fi
done

echo ""
echo "=== Sitemap Updated ==="
grep -c 'financial-services\|insurance\|energy-utilities\|government\.html\|education\.html' "$SITE/sitemap.xml"

echo ""
echo "=== llms.txt Updated ==="
grep -c 'Financial\|Insurance\|Energy\|Government\|Education' "$SITE/llms.txt"

echo ""
echo "=== 'Five' to 'Ten' Updates ==="
grep -rn 'five regulated\|five primary\|five industries\|five vertical\|five sector' "$SITE"/*.html | head -20

echo ""
echo "Verification complete."
```

---

## EXECUTION ORDER

1. Read law-firms.html completely to internalize the template pattern.
2. Create all 5 new vertical pages via Write tool (they're new files, so Write is safe).
3. Verify each new page ends with `</html>` via bash tail check.
4. Write the Python nav-update script to /tmp/ and execute it via bash.
5. Verify all 30 existing HTML files have 3 occurrences of "financial-services.html" via bash.
6. Update solutions.html hub page (add 5 new cards, update "five" to "ten" references). Use sed via bash — solutions.html will be over 400 lines after this update.
7. Update sitemap.xml (under 400 lines, safe to use Edit tool).
8. Update llms.txt (under 400 lines, safe to use Edit tool).
9. Update existing vertical cross-link lines ("five" to "ten") via sed.
10. Search for remaining "five regulated" references across all files and update via sed.
11. Run the full verification checklist.
12. Update HANDOFF.md with new file inventory and SEO status entries.

---

## KEYWORDS AND SEO TARGETS (Reference)

### Financial Services (20 keywords)
on-premises AI for banks, GLBA compliant AI server, air-gapped AI banking, local LLM for financial services, private AI for credit unions, NVIDIA H100 bank AI, PCI DSS AI compliance, on-prem AI for fraud detection, data-sovereign AI finance, air-gap GPU server banking, local AI loan document review, banking AI without cloud, financial data privacy AI, on-premise AI for investment firms, secure AI for SOX compliance, local deepseek for banks, on-prem LLM for KYC/AML, nvidia h200 for finance, air-gapped inference credit union, local AI for mortgage processing

### Insurance (20 keywords)
on-premises AI for insurance, HIPAA compliant AI for insurers, air-gapped AI claims processing, local LLM underwriting, private AI for health insurance, NVIDIA H100 insurance AI, data sovereignty insurance, on-prem AI fraud detection insurance, local AI for policy review, insurance AI without cloud, NAIC model law AI compliance, air-gap GPU server insurance, local AI for actuarial analysis, on-premise AI for P&C insurers, secure AI for customer PII, local llama for insurance, on-prem LLM for claims, nvidia h200 for insurance, air-gapped inference insurance, local AI for life insurance

### Energy & Utilities (20 keywords)
on-premises AI for energy sector, NERC CIP compliant AI, air-gapped AI for utilities, local LLM grid management, private AI for power plants, NVIDIA H100 SCADA AI, critical infrastructure AI on-prem, on-prem AI for predictive maintenance, air-gap GPU server energy, local AI for oil and gas, data-sovereign AI utilities, energy AI without cloud, IEC 62443 AI server, on-premise AI for renewable energy, secure AI for substation data, local deepseek for utilities, on-prem LLM for FERC compliance, nvidia h200 for grid operations, air-gapped inference energy, local AI for pipeline monitoring

### Government (20 keywords)
on-premises AI for government, FedRAMP compatible AI hardware, air-gapped AI for agencies, local LLM CUI processing, private AI for public sector, NVIDIA H100 government AI, data sovereignty government, on-prem AI for document review, local AI for citizen services, government AI without cloud, CUI compliant AI server, air-gap GPU server federal, local AI for policy analysis, on-premise AI for state government, secure AI for law enforcement, local deepseek for government, on-prem LLM for FOIA, nvidia h200 for defense civilian, air-gapped inference government, local AI for classified data

### Education (20 keywords)
on-premises AI for schools, FERPA compliant AI server, air-gapped AI education, local LLM for universities, private AI for K-12, NVIDIA H100 campus AI, student data privacy AI, on-prem AI for research, local AI for grading, education AI without cloud, FERPA school official AI, air-gap GPU server college, local AI for curriculum design, on-premise AI for edtech, secure AI for student records, local deepseek for higher ed, on-prem LLM for admissions, nvidia h200 for research labs, air-gapped inference university, local AI for campus security

**Keyword integration approach:** Weave target keywords naturally into page headings (h2, h3), paragraph text, FAQ questions and answers, meta descriptions, OG descriptions, and AEO summary blocks. Do NOT stuff keywords. Each keyword should appear 1-3 times across the page in natural context. The FAQ schema is the single highest-value AEO asset -- write questions that match keyword search intent verbatim where possible.

---

## NOTES

- All new pages must include the `solutions.html` contextual body link (same pattern as existing verticals: "one of [link]ten regulated industries[/link]" in the problem section).
- All new pages must include breadcrumb visual nav AND BreadcrumbList JSON-LD schema.
- Testimonials on new pages should follow the existing pattern: industry-specific, region-identified but company-unnamed, 1-2 sentences each, in blockquote format with cite tags.
- The comparison-note disclaimer after workflows should be honest about what the hardware is NOT (no industry-specific integrations, no fine-tuned models).
- Model selection section uses the same 3 models on all pages -- only the "Best for" text changes per industry.
- Cost comparison tables should use realistic estimates for each industry's typical deployment size.
