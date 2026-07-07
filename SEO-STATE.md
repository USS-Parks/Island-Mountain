# SEO & Schema State

Last updated: 2026-07-07 (private-page noindex policy, llms.txt GEO revision, weak-post wiring)

## JSON-LD Inventory

Total JSON-LD blocks site-wide: ~105 (all valid, zero parse errors)

### By Page

| Page | Schemas |
|------|---------|
| index.html | Organization (founder array: Dougherty + Parks), WebSite, Product x3, LocalBusiness (founder array, foundingDate) (6 total) |
| products.html | Product x3, FAQPage, BreadcrumbList (5) |
| pricing.html | @graph with Product x3, FAQPage, BreadcrumbList (3 script tags) |
| about.html | AboutPage, Person x2 (Dougherty + Parks), Organization (founder array), BreadcrumbList (5) |
| contact.html | LocalBusiness, BreadcrumbList (2) |
| investors.html | Organization (founder array: Dougherty + Parks), BreadcrumbList (2) |
| 11 verticals (each) | FAQPage, BreadcrumbList, Product (3 each = 33 total) |
| faq.html | FAQPage, WebPage, BreadcrumbList (3) |
| technology.html | SoftwareApplication, FAQPage, BreadcrumbList (3) |
| solutions.html | FAQPage, BreadcrumbList (2) |
| why-island-mountain.html | FAQPage, BreadcrumbList (2) |
| blog.html | Blog, BreadcrumbList (2) |
| 6 AEO direct-answer pages (each) | FAQPage (4 Q&A), BreadcrumbList (2 each = 12 total) |
| resources.html | BreadcrumbList (1) |
| 13 blog posts (each) | BlogPosting, BreadcrumbList (2 each = 26 total) |
| openwebui-admin-setup-guide | BlogPosting, BreadcrumbList, HowTo (3) |
| grid-screaming-aquifers | BlogPosting, BreadcrumbList (2) |
| ai-sovereignty-framework | BlogPosting, BreadcrumbList (2) |
| 404.html | BreadcrumbList (1) |
| privacy.html | WebPage, BreadcrumbList (2) |
| terms.html | WebPage, BreadcrumbList (2) |

### Product Schema Details

- 22 Product schemas total across 16 files
- All carry: @id (URL#fragment), sku (IM-SUMMIT-BASE/RIDGE/PINNACLE), name, description, brand (Brand type), category, additionalProperty (GPU specs), offers
- Verticals use single Product with AggregateOffer ($75K-$400K)
- products.html and pricing.html have 3 discrete Product schemas each
- index.html has 3 Product schemas
- Organization schemas carry founder arrays (both co-founders) on index, about, investors

## Title Tags & Meta Descriptions

- All content pages: titles 50-60 displayed chars (brand suffix removed from 28 pages)
- All 45 indexed pages: meta descriptions 120-160 chars
- og:title, twitter:title, og:description, twitter:description synced on all pages
- Utility pages (404, privacy, terms): shorter titles (32-38 chars), acceptable

## Keywords

- 20 long-tail keywords placed per vertical page (all 11 verticals follow this pattern)
- Keywords distributed across: Problem, How It Works, Workflows, Model Selection, Regulatory Context, Limitations, Deployment Scenarios

## Google Analytics

- GA4 property: G-R674E394D4
- gtag.js snippet on all 45 content pages (8 lines, first thing after <head>). 404.html excluded.
- No cookies beyond GA defaults. No other tracking.

## Sitemap & Crawling

- sitemap.xml: 46 URLs (added blog/ai-search-visibility-consultant.html; all content pages except 404.html and the chrome-less interactive infographic)
- robots.txt: allows all crawlers including GPTBot, ClaudeBot, PerplexityBot
- llms.txt: AI answer engine optimization file, lists all 11 verticals
- Canonical tags on all pages point to .html versions
- GitHub Pages serves extensionless URLs as alternates (Google correctly excludes these)

## Internal Linking (2026-07-06)

- Nav pages: the 6 top-nav pages (Home, Security Fabric, Summit, FAQ, Resources, Contact) cross-link each other contextually and each carry an "Explore the Platform" card block.
- Blog -> nav: all 23 real posts now link into the nav from article-body prose. Inbound contextual (body) links: Security Fabric 16, Summit 20, Resources 13, Contact 13, FAQ 7, Home 4 (Security Fabric / FAQ / Resources were 0 before this pass). No post links zero nav pages.
- Blog breakages repaired: dead link (msp slug), product mislink (governance layer -> Security Fabric), malformed anchor (eu-cada Summit Pinnacle), products.html tier anchor ids (#summit-base / #summit-ridge / #summit-pinnacle), interactive infographic given canonical + noindex, and the unclosed Summit nav <li> closed across 21 posts.

## AEO Direct-Answer Pages (Session 34)

6 standalone pages targeting AI answer engines:
- cloud-act-tribal-data.html (349 lines)
- hipaa-local-ai-compliance.html (349 lines)
- attorney-client-privilege-ai-risk.html (339 lines)
- itar-cmmc-ai-infrastructure.html (338 lines)
- on-premises-ai-cost-comparison.html (346 lines)
- air-gapped-ai-inference.html (358 lines)

Hub page: resources.html (290 lines), linked from navbar + sidebar + footer site-wide.
Cross-linked from 8 verticals. Each AEO page has FAQPage (4 Q&A) + BreadcrumbList schema.

## Domain & Indexing

- CNAME: islandmountain.io
- .nojekyll: disables Jekyll processing
- NUL byte issues: cleaned in Session 16 (privacy.html, solutions.html), Session 48 (resources.html committed fix, js/main.js local fix)
- All OG/Twitter meta images and JSON-LD image refs point to .webp (Session 41)

## Private Pages (2026-07-07) - keep OUT of search, deliberately unlinked
pricing.html, why-island-mountain.html, landfall-preorder.html, landfall-product-line.html, compliance-dashboard.html, basho-parks.html, bibliography.html
- All carry meta robots noindex, nofollow; none are in sitemap.xml or llms.txt; no internal links point to them. Do NOT wire these into nav, cards, prose, sitemap, or llms.txt.
- Owner action for fast de-indexing of the five newly-noindexed URLs: Search Console > Removals.

## Internal Linking pass 2 + llms.txt (2026-07-07)
- llms.txt rewritten: private URLs removed, Security Fabric (Lamprey) section added, all 23 public blog posts listed.
- Weak-post wiring (inbound counts): agentjacking 3->5, openai-discovery 3->5, tribal-datacenters 3->5, ai-search-visibility 1->3, msp 2->4. Prose anchors in agentic-map, hipaa-checklist, attorney-client-cloud-ai, law-firms, tribal-nations; related-cards in msp, second-revolution, cloud-tco, on-prem-vs-colo, tribal-data-sovereignty.
- sitemap.xml: 57 -> 52 URLs.
