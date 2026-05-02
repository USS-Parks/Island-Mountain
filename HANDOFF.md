# Island Mountain Website -- Project Context

Last updated: 2026-05-01
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

Files still at risk (over 400 lines): contact.html (928), faq.html (860), law-firms.html (542), tribal-nations.html (535), products.html (527), defense-contractors.html (513), pricing.html (512), medical-practices.html (509), research-labs.html (503), why-island-mountain.html (456), technology.html (456), blog.html (433), index.html (408). Use sed via bash for these.

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

Island Mountain LLC sells pre-built, burn-tested on-premises AI inference servers with NVIDIA H100 and H200 GPUs. Price range $75K-$400K. Three product tiers: Starter (single H100 80GB, $75K), Professional (dual H100 NVLink, $185K), Enterprise (dual H200 141GB, $395K). Founded 2026, Colorado. Founder is John Dougherty.

Target markets (each has a dedicated landing page): Law Firms, Medical Practices, Tribal Nations, Research Labs, Defense Contractors.

Core value proposition: organizations with data that cannot leave the building (HIPAA, ITAR/DFARS, attorney-client privilege, tribal sovereignty/OCAP, FERPA) need AI infrastructure they own outright. No cloud dependency, no token fees, no third-party data exposure.

Contact: basho@islandmountain.io
LinkedIn: https://www.linkedin.com/company/island-mountain-llc/
Form handler: FormSubmit.co (posts to basho@islandmountain.io)

---

## TECH STACK

Static HTML/CSS/JS. Every page is hand-written HTML. No templating engine.

css/style.css (1528 lines): Single global stylesheet. CSS custom properties for theming.
css/blog.css (306 lines): Blog post styles (breadcrumb, article layout, tags, related cards, share links). Loaded by all 11 blog posts via link tag.
js/main.js (257 lines): Navigation, hamburger menu, mobile sidebar, scroll animations, fade-in observers.
js/charts.js (335 lines): Chart.js graphs. Only loaded on investors.html.
js/vendor/chart.umd.min.js: Chart.js library. Only used by investors.html.
fonts/fonts.css + fonts/inter-latin.woff2: Self-hosted Inter variable font (latin subset). No Google CDN.
icons/remixicon.css + icons/remixicon.woff2: Self-hosted Remixicon icons. No jsDelivr CDN.

Brand colors (CSS custom properties):
--copper: #f59e0b (primary accent, amber/copper)
--copper-light: #fbbf24, --copper-deep: #d97706, --copper-darker: #b45309
--primary-dark: #0f172a (deep navy background)
--secondary-dark: #1e293b, --tertiary-dark: #334155
--text-light: #f1f5f9 (headings), --text-muted: #94a3b8 (body text)
--nav-height: 72px, --max-width: 1200px

No analytics. No cookies. No tracking scripts.

---

## FILE INVENTORY (29 content pages)

### Root Pages (18 files)

index.html (408 lines): Homepage. Hero, product comparison, trust stats, testimonials. Schema: Organization, WebSite.
products.html (527 lines): Three product tiers with full specs. Schema: Product (x3), FAQPage.
pricing.html (512 lines): Pricing table, financing, TCO comparison. Schema: Product, FAQPage.
why-island-mountain.html (456 lines): Value proposition. Links to all 5 verticals. Schema: FAQPage.
technology.html (456 lines): Software stack: Ollama, vLLM, Open WebUI, Ubuntu. Schema: SoftwareApplication, FAQPage.
solutions.html (396 lines): Hub page linking all 5 industry verticals + blog crosslinks. Schema: FAQPage.
faq.html (860 lines): 25 Q&A pairs. Schema: FAQPage (25 Q&A), SpeakableSpecification.
contact.html (928 lines): Contact form (FormSubmit.co), embedded Google Map. Schema: LocalBusiness.
blog.html (433 lines): Blog index listing all posts. Schema: Blog.
investors.html (294 lines): Investor pitch with Chart.js graphs. Schema: Organization.
about.html (269 lines): Company story, founder bio. Schema: AboutPage, Organization.
law-firms.html (542 lines): Vertical landing page. Attorney-client privilege, discovery risk. Schema: FAQPage. Has AEO block.
medical-practices.html (509 lines): Vertical. HIPAA, ePHI, BAA. Schema: FAQPage. Has AEO block.
tribal-nations.html (535 lines): Vertical. OCAP, CLOUD Act, sovereignty. Schema: FAQPage, GovOrg. Has AEO block.
research-labs.html (503 lines): Vertical. FERPA, IRB, GxP, 21 CFR Part 11. Schema: FAQPage. Has AEO block.
defense-contractors.html (513 lines): Vertical. ITAR, DFARS 252.204-7012, CMMC, CUI. Schema: FAQPage. Has AEO block.
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
logo-nav.png (1.4KB): Navbar logo 24x24 padded square transparent.
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

Root pages: img src="images/logo-nav.png" width="24" height="24"
Blog pages: img src="../images/logo-nav.png" width="24" height="24"
The logo sits inline beside the text "Island Mountain" inside the nav-logo anchor.

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

Meta descriptions, canonical tags, OG + Twitter Card tags, JSON-LD structured data on all 29 pages.
XML sitemap with 29 URLs. robots.txt allowing all crawlers. llms.txt for AI engines.
AEO blocks on all 11 blog posts (standardized to Summary: format with copper border styling).
AEO blocks on 6 vertical/hub pages standardized from old "Bottom line:" dark-bg format to standard "Summary:" copper-border format (2026-05-01): law-firms, medical-practices, tribal-nations, research-labs, defense-contractors, solutions.
AEO blocks created and inserted on 6 root pages (2026-05-01): index, products, pricing, why-island-mountain, technology, faq.
Root pages intentionally without AEO blocks: about, contact, investors, privacy, terms.
Self-hosted fonts and icons (zero CDN dependencies).
WebP hero images with picture element fallback.
LinkedIn company page linked in footer of all 29 pages.
Logo in navbar (24x24) and footer (210x210) on all 29 pages.
Founding date consistent at 2026 across all schemas.
FormSubmit.co contact form configured.
Blog inline CSS extracted to css/blog.css (all 11 posts now under 400 lines).
Blog index (blog.html) has cards for all 11 posts.
Deleted legacy images: logo.png, Island Mountain Logo 1.png.
Favicons (favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192.png) regenerated from logo-transparent.png.

### Not Yet Done

Google Search Console: verify sitemap, monitor indexing.

---

## GIT WORKFLOW

Push from PowerShell only (bash sandbox cannot push):

```
cd "C:\Users\17076\Documents\Claude\Island Mountain"
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
git add -A
git status
git commit -m "description"
git push origin main
```

---




