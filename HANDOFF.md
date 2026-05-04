# Island Mountain Website -- Project Context

Last updated: 2026-05-03
Live URL: https://islandmountain.io
GitHub Pages static site. No frameworks, no build step, no SSG.
Workspace: `C:\Users\17076\Documents\Claude\Island Mountain`

---

## FILE TRUNCATION PREVENTION

This project previously had a file truncation issue caused by sync conflicts between the Cowork bash sandbox and the host filesystem. Files over ~500 lines could get silently chopped during writes. The root cause (308 lines of duplicated inline CSS in every blog post) has been fixed by extracting to css/blog.css. All blog posts are now under 400 lines.

Rules for every session:

1. NEVER use the Edit tool on any file over 400 lines. Use sed via bash instead.
2. After EVERY file modification, verify the file ends correctly by running tail -3 filename in bash.
3. Before declaring any task complete, run the verification script below.
4. If a file IS truncated, recover from git: git show HEAD:filename > recovered.html, apply changes to the recovered copy, then overwrite the original.

Verification script (update the session path for your session):

```
cd "/sessions/SESSION-SLUG/mnt/Island Mountain"
for f in *.html blog/*.html; do
  [ "$f" = "googlecff518dc414acaa3.html" ] && continue
  lines=$(wc -l < "$f")
  has_close=$(grep -c '</html>' "$f")
  if [ "$has_close" -eq 0 ]; then
    echo "TRUNCATED: $f ($lines lines, no closing tag)"
  fi
done
echo "Verification complete."
```

Files still at risk (over 400 lines): contact.html (943), faq.html (875), investors.html (641), government.html (611), energy-utilities.html (610), education.html (610), financial-services.html (609), insurance.html (609), law-firms.html (585), tribal-nations.html (578), defense-contractors.html (556), medical-practices.html (552), research-labs.html (546), products.html (542), pricing.html (527), why-island-mountain.html (472), technology.html (471), solutions.html (467), blog.html (459), index.html (424). Use sed via bash for these.

---

## PATH MAPPING

The bash sandbox and file tools (Read/Write/Edit/Grep) use different path schemes for the same files. The session slug changes every session.

Tool: Read, Write, Edit, Grep
Path: C:\Users\17076\Documents\Claude\Island Mountain\filename

Tool: Bash sandbox
Path: /sessions/SESSION-SLUG/mnt/Island Mountain/filename

To find your bash session path, run: ls /sessions/*/mnt/

Git operations must be run by the user in PowerShell on the host machine. Bash sandbox cannot push to GitHub.

---

## WHAT THIS SITE IS

Island Mountain LLC sells pre-built, burn-tested on-premises AI inference servers with NVIDIA H100 and H200 GPUs. Price range $75K-$400K. Three product tiers: Starter (2x H100 80GB PCIe refurbished, $75-85K), Performance (build-to-order, $150-160K), Premium (2x H200 141GB, $350-400K, coming Q3 2026). Founded 2026, Colorado. Founder is John Dougherty.

Target markets (each has a dedicated landing page): Law Firms, Medical Practices, Tribal Nations, Research Labs, Defense Contractors, Financial Services, Insurance, Energy & Utilities, Government, Education.

Core value proposition: organizations with data that cannot leave the building (HIPAA, ITAR/DFARS, attorney-client privilege, tribal sovereignty/OCAP, FERPA) need AI infrastructure they own outright. No cloud dependency, no token fees, no third-party data exposure.

Contact: basho@islandmountain.io (displayed as info@islandmountain.io on site, mailto routes to basho@)
LinkedIn: https://www.linkedin.com/company/island-mountain-llc/
Form handler: FormSubmit.co (posts to basho@islandmountain.io)

---

## TECH STACK

Static HTML/CSS/JS. Every page is hand-written HTML. No templating engine.

css/style.css (1555 lines): Single global stylesheet. CSS custom properties for theming. Includes breadcrumb styles (added 2026-05-01 for vertical page breadcrumbs).
css/blog.css (306 lines): Blog post styles (article layout, tags, related cards, share links). Loaded by all 11 blog posts via link tag. Blog breadcrumb styles duplicated in style.css for vertical pages.
js/main.js (257 lines): Navigation, hamburger menu, mobile sidebar, scroll animations, fade-in observers.
js/charts.js (374 lines): Chart.js graphs for investor page. COGS donut, margin sensitivity line, use of funds bar, revenue projections grouped bar. All data from Island-Mountain-Financial-Model.xlsx (May 2026). Only loaded on investors.html.
js/vendor/chart.umd.min.js: Chart.js library. Only used by investors.html.
fonts/fonts.css + fonts/inter-latin.woff2: Self-hosted Inter variable font (latin subset). No Google CDN.
icons/remixicon.css + icons/remixicon.woff2: Self-hosted Remixicon icons. No jsDelivr CDN.

Brand colors (CSS custom properties):
--copper: #f59e0b (primary accent, amber/copper)
--copper-light: #fbbf24, --copper-deep: #d97706, --copper-darker: #b45309
--primary-dark: #0f172a (deep navy background)
--secondary-dark: #1e293b, --tertiary-dark: #334155
--text-light: #f1f5f9 (headings), --text-muted: #94a3b8 (body text)
--nav-height: 80px, --max-width: 1200px

No analytics. No cookies. No tracking scripts.

---

## FILE INVENTORY (34 content pages)

### Root Pages (23 files)

index.html (424 lines): Homepage. Hero, product comparison, trust stats, testimonials. Schema: Organization, WebSite. Body links to solutions.html and vertical pages via testimonial citations.
products.html (542 lines): Three product tiers with full specs. Schema: Product (x3), FAQPage.
pricing.html (527 lines): Pricing table, financing, TCO comparison. Schema: Product, FAQPage.
why-island-mountain.html (472 lines): Value proposition. Links to all 10 verticals. Schema: FAQPage.
technology.html (471 lines): Software stack: Ollama, vLLM, Open WebUI, Ubuntu. Schema: SoftwareApplication, FAQPage.
solutions.html (467 lines): Hub page linking all 10 industry verticals + blog crosslinks. Schema: FAQPage.
faq.html (875 lines): 25 Q&A pairs. Schema: FAQPage (25 Q&A), SpeakableSpecification.
contact.html (943 lines): Contact form (FormSubmit.co), embedded Google Map. Schema: LocalBusiness.
blog.html (459 lines): Blog index listing all posts. Schema: Blog.
investors.html (641 lines): Full investor page overhaul (2026-05-03). 11 sections: hero with $500K ask, market thesis, product tiers, unit economics (BOM table + COGS donut), margin sensitivity chart, financial projections (3 scenarios x 2 years), SAFE deal terms with use-of-funds chart, milestone roadmap, timing thesis, team, risk disclosure (6 cards with mitigations), dual CTAs. All numbers sourced from Island-Mountain-Financial-Model.xlsx. Inline CSS for investor-specific components. Schema: Organization.
about.html (269 lines): Company story, founder bio. Schema: AboutPage, Organization.
law-firms.html (585 lines): Vertical landing page. Attorney-client privilege, discovery risk. Schema: FAQPage, BreadcrumbList. Has AEO block. Breadcrumb, contextual body link to solutions.html.
medical-practices.html (552 lines): Vertical. HIPAA, ePHI, BAA. Schema: FAQPage, BreadcrumbList. Has AEO block. Breadcrumb, contextual body link to solutions.html.
tribal-nations.html (578 lines): Vertical. OCAP, CLOUD Act, sovereignty. Schema: FAQPage, BreadcrumbList, GovOrg. Has AEO block. Breadcrumb, contextual body link to solutions.html.
research-labs.html (546 lines): Vertical. FERPA, IRB, GxP, 21 CFR Part 11. Schema: FAQPage, BreadcrumbList. Has AEO block. Breadcrumb, contextual body link to solutions.html.
defense-contractors.html (556 lines): Vertical. ITAR, DFARS 252.204-7012, CMMC, CUI. Schema: FAQPage, BreadcrumbList. Has AEO block. Breadcrumb, contextual body link to solutions.html.
financial-services.html (609 lines): Vertical. GLBA, PCI DSS, SEC Reg S-P. Schema: FAQPage, BreadcrumbList. Has AEO block. Breadcrumb, contextual body link to solutions.html.
insurance.html (609 lines): Vertical. HIPAA (health insurers), NAIC Model Law #668, state regs. Schema: FAQPage, BreadcrumbList. Has AEO block. Breadcrumb, contextual body link to solutions.html.
energy-utilities.html (610 lines): Vertical. NERC CIP, IEC 62443, FERC, TSA Pipeline Security. Schema: FAQPage, BreadcrumbList. Has AEO block. Breadcrumb, contextual body link to solutions.html.
government.html (611 lines): Vertical. FedRAMP, FISMA, NIST SP 800-171, CUI. Schema: FAQPage, BreadcrumbList. Has AEO block. Breadcrumb, contextual body link to solutions.html.
education.html (610 lines): Vertical. FERPA, COPPA, state student privacy laws. Schema: FAQPage, BreadcrumbList. Has AEO block. Breadcrumb, contextual body link to solutions.html.
privacy.html (198 lines): Privacy policy. Schema: WebPage.
terms.html (208 lines): Terms of service. Schema: WebPage.

### Blog Posts (11 files in blog/ subdirectory)

All use ../ prefix for root-level links. All load css/blog.css via external link tag (inline CSS extracted 2026-05-01). All have: BlogPosting schema, breadcrumb, article-meta, AEO summary, CTA, 3 related article cards, share links (LinkedIn + X).

Blog tag CSS classes: tag-technical, tag-compliance, tag-financial, tag-how-to, tag-industry.

deepseek-v4-flash-local-deployment.html (299 lines, 2026-04-30, technical, 7 min)
attorney-client-privilege-cloud-ai.html (345 lines, 2026-04-23, compliance, 9 min)
h100-vs-h200-inference-comparison.html (355 lines, 2026-04-16, technical, 8 min)
cloud-ai-vs-local-hardware-tco.html (359 lines, 2026-04-09, financial, 9 min)
openwebui-admin-setup-guide.html (388 lines, 2026-04-02, how-to, 9 min)
tribal-data-sovereignty-ai-infrastructure.html (323 lines, 2026-03-26, industry, 10 min)
ocap-cloud-act-guide.html (273 lines, 2026-03-12, industry, 12 min)
itar-dfars-ai-self-assessment.html (265 lines, 2026-03-05, compliance, 14 min)
openai-discovery-risk-law-firms.html (263 lines, 2026-02-26, compliance, 13 min)
on-prem-vs-colo-vs-cloud.html (293 lines, 2026-02-12, industry, 15 min)
hipaa-technical-checklist.html (307 lines, 2026-02-19, compliance, 16 min)

### Images

hero-mountain.png (2.7MB): Full-size hero background 1913x892. Used on every page via picture element.
hero-mountain.webp (137KB): WebP hero (full size). hero-mountain-mobile.webp (28KB): WebP hero (800px mobile).
logo-transparent.png (174KB): Full logo, transparent background, 578x466.
logo-nav.png (1.4KB): Legacy navbar logo 24x24 (replaced by logo-nav-new).
logo-nav-new.png (39.2KB): Navbar wordmark 392x259 retina (196x129 display), flood-fill transparency.
logo-nav-new.webp (12.8KB): WebP version of navbar wordmark.
IM-transparent-logo-2.png (632x223): Source wordmark file.
logo-footer.png (37KB): Footer logo 210x210 padded square transparent.
favicon-32.png, apple-touch-icon.png, icon-192.png, favicon.ico: Standard favicon set.

### Other Files

sitemap.xml: 29 URLs covering all pages.
robots.txt: Allows all crawlers including GPTBot, ClaudeBot, PerplexityBot.
llms.txt: AI answer engine optimization file.
CNAME: islandmountain.io (GitHub Pages custom domain).
.nojekyll: Disables Jekyll processing.
monitoring-setup.md, offpage-checklist.md: Internal planning docs.

---

## HTML PATTERNS

### Page Structure (every page)

Head: charset, viewport, title, meta description, favicon links, stylesheet links (style.css, remixicon.css, fonts.css, [blog: blog.css]), canonical, OG tags, Twitter Card tags, JSON-LD scripts.
Body: [index only: particles canvas + hero photo], navbar, mobile sidebar, page content, footer, main.js script.

### Navbar Logo

Wordmark image replaces old icon+text. Uses picture element for WebP/PNG fallback.
Root pages: `<a href="index.html" class="nav-logo"><picture><source srcset="images/logo-nav-new.webp" type="image/webp"><img src="images/logo-nav-new.png" alt="Island Mountain" width="196" height="129"></picture></a>`
Blog pages: same with `../images/` prefix.
Source files: logo-nav-new.png (392x259 retina, 39.2KB), logo-nav-new.webp (12.8KB). Custom flood-fill transparency from IM-transparent-logo-2.png.
CSS: `.nav-logo` uses `display:inline-flex; align-items:center; transform:translateY(-2px);` -- navbar `overflow:visible`.

### Footer Logo

Root pages: img src="images/logo-footer.png" width="210" height="210" inside footer-brand div, above the nav-logo text link.
Blog pages: img src="../images/logo-footer.png" width="210" height="210"

### Blog Citation Format

Inline parenthetical links: (Source Name) where Source Name is a link with target="_blank" rel="noopener".

### AEO Summary Block

Copper left border, subtle amber background. Used on vertical pages and some blog posts:
div with style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;"
Contains bold "Summary:" followed by 2-3 sentence direct answer.

### Blog Post Sections (in order)

1. Breadcrumb: Home > Blog > Post Title
2. Article header: date, tag badge, read time, h1, author
3. Article body: h2/h3 sections with cited paragraphs
4. AEO summary block
5. CTA: centered heading + subtext + Request a Quote button
6. Related articles: 3 cards in related-grid
7. Article nav: back link + LinkedIn/X share buttons

---

## SEO STATUS

### Completed

Meta descriptions, canonical tags, OG + Twitter Card tags, JSON-LD structured data on all 34 pages.
XML sitemap with 34 URLs. robots.txt allowing all crawlers including GPTBot, ClaudeBot, PerplexityBot. llms.txt listing all 10 verticals.
AEO blocks on all 11 blog posts (standardized to Summary: format with copper border styling).
AEO blocks on all 10 vertical landing pages and solutions hub.
5 new vertical landing pages (financial-services, insurance, energy-utilities, government, education) created 2026-05-03. Navbar, mobile sidebar, and footer updated across all 34 HTML files. Sitemap updated to 34 URLs. llms.txt updated with 10 verticals. All "five industries" references updated to "ten industries" site-wide.
FAQPage + BreadcrumbList JSON-LD schemas on all 10 vertical pages.

### SEO/AEO Revisions Status (Sessions 1-4 Complete)

Product JSON-LD schema: COMPLETE on all 5 new verticals. Each page has FAQPage + BreadcrumbList + Product schemas.

FAQ answer enrichment: COMPLETE. All FAQ answers enriched with regulatory citations, brand mentions, GPU references, and pricing anchors.

AEO summary block enhancement: COMPLETE. All AEO blocks include pricing ($75,000), GPU models (H100/H200), and product tier references.

H2/H3 heading keyword optimization: COMPLETE. Headings optimized with keyword integration.

solutions.html meta description: COMPLETE. References "ten regulated industries" in meta, OG, and page content.

Keyword-to-section placement: COMPLETE (Session 4). Top 5 long-tail keywords per vertical woven into body copy, FAQ answers, hero subtitles, and AEO blocks.

Internal cross-linking: COMPLETE (Session 4). Contextual body links added: insurance↔medical-practices (HIPAA), insurance↔financial-services (GLBA), energy↔defense-contractors (air-gap), energy↔government (FERC), government↔defense-contractors (CUI/NIST), government↔tribal-nations (sovereignty), government↔education (FERPA), education↔research-labs (IRB), education↔medical-practices (campus health), education↔government (public funding). CTA cross-links also updated.

### SEO/AEO Revisions Status (Session 5 Complete)

FAQ answer snippet optimization: COMPLETE (Session 5). All 40 JSON-LD FAQPage schema answers across 10 verticals rewritten to lead with direct yes/no/declarative answer in first sentence (under 30 words), followed by regulatory citation, then brand/GPU/pricing expansion. On-page FAQ cards updated to match (first 2-3 sentences of schema answer).

Authority Avatar compliance badges: COMPLETE (Session 5). Inline-styled flex badge sections inserted before "How It Works" on all 10 vertical pages. Each badge contains Remixicon icon + framework name text. Badge map: law-firms (3: Attorney-Client Privilege, ABA Model Rules, FRCP Discovery Rules), medical-practices (3: HIPAA Security Rule, 45 CFR Part 164, HITECH Act), tribal-nations (3: OCAP Principles, CLOUD Act, Tribal Sovereignty), research-labs (3: 21 CFR Part 11, IRB Requirements, GxP Compliance), defense-contractors (3: DFARS 252.204-7012, CMMC Level 2, NIST SP 800-171), financial-services (3: GLBA Safeguards Rule, PCI DSS v4.0, SEC Reg S-P), insurance (3: HIPAA Security Rule, NAIC Model Law #668, State Insurance Regs), energy-utilities (3: NERC CIP-003 to CIP-013, IEC 62443, TSA Pipeline Security), government (4: FedRAMP, NIST SP 800-171, FISMA, CJIS Security Policy), education (3: FERPA (34 CFR 99), COPPA, State Student Privacy Laws).

### Execution Files

VERTICAL-EXPANSION-SEO-AEO.md (1007 lines): Full SEO/AEO revision spec with JSON-LD schemas, keyword-to-section maps, optimized headings, enriched FAQ answers, and enhanced AEO blocks for all 5 new verticals plus solutions hub updates.

Prompt files (in workspace root):
- SEO-SESSION-1-FINANCIAL-INSURANCE.md: Product schemas + FAQ enrichment + AEO enhancement + heading optimization for financial-services.html and insurance.html.
- SEO-SESSION-2-ENERGY-GOVERNMENT.md: Same scope for energy-utilities.html and government.html.
- SEO-SESSION-3-EDUCATION-SOLUTIONS.md: Same scope for education.html plus solutions.html meta/schema/AEO updates.
- SEO-SESSION-4-CROSSLINKS-VERIFY.md: Internal cross-linking, keyword placement audit, entity reinforcement verification across all pages.
- SEO-SESSION-5-FAQ-AVATARS.md: FAQ answer snippet optimization (all 10 verticals) + Authority Avatar badge implementation.
- SEO-SESSION-6-KEYWORD-DEPTH.md: Remaining 75 long-tail keywords (keywords 6-20) placed across 5 new verticals per VERTICAL-EXPANSION-SEO-AEO.md maps.
- SEO-SESSION-7-ORIGINAL-SCHEMAS.md: Product JSON-LD schemas for original 5 verticals (law-firms, medical-practices, tribal-nations, research-labs, defense-contractors).
- SEO-SESSION-8-OFFPAGE.md: Off-page SEO execution package (GSC, directories, press release, LinkedIn articles, podcast pitches).

---

## GIT PUSH COMMAND (PowerShell)

After every session, copy-paste this into PowerShell (update the commit message to reflect what changed):

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"; git add -A; git commit -m "DESCRIBE CHANGES HERE"; git push origin main
```
