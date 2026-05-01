# Island Mountain Website -- Session Handoff

Date: 2026-05-01
Repo: GitHub Pages static site at `C:\Users\17076\Documents\Claude\Island Mountain`
Live URL: https://islandmountain.io
Stack: Static HTML/CSS/JS. No frameworks, no build step, no SSG. Deployed via GitHub Pages.

---

## CRITICAL SAFETY RULE

The Edit tool has repeatedly truncated HTML files in this project. Files get silently chopped during edits -- the closing `</script>` or `</html>` tags vanish and the page breaks.

**After EVERY edit to an HTML file, you MUST:**

1. Run `tail -5 <filename>` (via bash) and confirm the file ends with `</html>`
2. Check line count hasn't dropped unexpectedly

**Before committing, run this verification script:**

```bash
cd "/sessions/serene-hopeful-albattani/mnt/Island Mountain/"
for f in *.html blog/*.html; do
  last=$(tail -1 "$f" | tr -d '[:space:]')
  if [ "$last" != "</html>" ] && [ "$f" != "googlecff518dc414acaa3.html" ]; then
    echo "TRUNCATED: $f"
  fi
done
echo "Verification complete."
```

If a file gets truncated: Recover via `git show HEAD:<filename> > /tmp/recovered.html`, apply changes to the recovered copy via `sed`, then copy back. Do NOT attempt to re-edit the truncated file.

**Preferred editing method:** Use `sed` commands via bash instead of the Edit tool for high-risk changes (especially changes that touch `<head>` or `<script>` blocks). This avoids the truncation bug entirely.

---

## PATH MAPPING (File Tools vs. Bash Sandbox)

| Context | Path |
|---------|------|
| File tools (Read/Write/Edit) | `C:\Users\17076\Documents\Claude\Island Mountain\` |
| Bash sandbox | `/sessions/serene-hopeful-albattani/mnt/Island Mountain/` |

Always use the correct path for the correct tool. They are NOT interchangeable.

---

## SITE ARCHITECTURE

### Stack
- HTML/CSS/JS only. No build process.
- `css/style.css` -- single stylesheet, CSS custom properties for theming (`--copper: #f59e0b`, etc.)
- `js/main.js` -- navigation, animations, fade-in observers, mobile sidebar
- `js/charts.js` -- Chart.js graphs for investors.html only
- External CDNs: Google Fonts (Inter), Remixicon (jsDelivr), Chart.js (cdnjs, investors page only)
- Hosting: GitHub Pages
- Form processing: FormSubmit.co (posts to basho@islandmountain.io)
- No analytics. No cookies. No tracking scripts.

### Navigation Structure
Every page shares identical nav and mobile sidebar markup:

**Desktop nav:** Home | Why Local AI | Products | Technology | Pricing | Solutions (dropdown: Law Firms, Medical Practices, Tribal Nations, Research Labs, Defense Contractors) | FAQ | Blog | [Request Quote CTA]

**Footer (4 columns):**
- Brand: "Island Mountain" + tagline
- Quick Links: Home, Products, Technology, Pricing, FAQ, Blog
- Solutions: Law Firms, Medical Practices, Tribal Nations, Research Labs, Defense Contractors
- Company: Why Local AI, Contact, Investors, About, Privacy Policy, Terms of Service

**Blog posts use `../` relative paths** for all nav and footer links since they live in `blog/` subdirectory. Root pages use direct relative paths.

---

## COMPLETE FILE INVENTORY (Verified 2026-05-01)

### HTML Files (23 pages + 1 verification file)

| File | Lines | Meta Desc | Canonical | OG | Twitter | JSON-LD | AEO Block | Ends `</html>` |
|------|-------|-----------|-----------|----|---------|---------|-----------|----|
| index.html | 373 | Yes | Yes | Yes | Yes | Organization + WebSite | No | Yes |
| products.html | 521 | Yes | Yes | Yes | Yes | Product (3 tiers) + FAQPage | No | Yes |
| pricing.html | 506 | Yes | Yes | Yes | Yes | Product + FAQPage | No | Yes |
| why-island-mountain.html | 450 | Yes | Yes | Yes | Yes | FAQPage | No | Yes |
| technology.html | 450 | Yes | Yes | Yes | Yes | SoftwareApplication + FAQPage | No | Yes |
| faq.html | 842 | Yes | Yes | Yes | Yes | FAQPage (25 Q&A) | No | Yes |
| blog.html | 377 | Yes | Yes | Yes | Yes | Blog | No | Yes |
| contact.html | 927 | Yes | Yes | Yes | Yes | LocalBusiness | No | Yes |
| investors.html | 292 | Yes | Yes | Yes | Yes | Organization | No | Yes |
| law-firms.html | 518 | Yes | Yes | Yes | Yes | FAQPage | Yes | Yes |
| medical-practices.html | 485 | Yes | Yes | Yes | Yes | FAQPage | Yes | Yes |
| tribal-nations.html | 511 | Yes | Yes | Yes | Yes | FAQPage + GovOrg | Yes | Yes |
| research-labs.html | 479 | Yes | Yes | Yes | Yes | FAQPage | Yes | Yes |
| defense-contractors.html | 489 | Yes | Yes | Yes | Yes | FAQPage | Yes | Yes |
| about.html | 252 | Yes | Yes | Yes | Yes | AboutPage + Organization | No | Yes |
| privacy.html | 197 | Yes | Yes | Yes | Yes | WebPage | No | Yes |
| terms.html | 207 | Yes | Yes | Yes | Yes | WebPage | No | Yes |
| blog/deepseek-v4-flash-local-deployment.html | 606 | Yes | Yes | Yes | Yes | BlogPosting | Yes | Yes |
| blog/attorney-client-privilege-cloud-ai.html | 652 | Yes | Yes | Yes | Yes | BlogPosting | Yes | Yes |
| blog/h100-vs-h200-inference-comparison.html | 662 | Yes | Yes | Yes | Yes | BlogPosting | Yes | Yes |
| blog/cloud-ai-vs-local-hardware-tco.html | 666 | Yes | Yes | Yes | Yes | BlogPosting | Yes | Yes |
| blog/openwebui-admin-setup-guide.html | 644 | Yes | Yes | Yes | Yes | BlogPosting | Yes | Yes |
| blog/tribal-data-sovereignty-ai-infrastructure.html | 630 | Yes | Yes | Yes | Yes | BlogPosting | Yes | Yes |
| googlecff518dc414acaa3.html | 0 | N/A | N/A | N/A | N/A | N/A | N/A | N/A (GSC verification) |

### Other Files

| File | Size/Lines | Purpose |
|------|-----------|---------|
| `robots.txt` | 37 lines | Allows all crawlers including GPTBot, ClaudeBot, PerplexityBot. Points to sitemap. |
| `sitemap.xml` | 166 lines, 23 URLs | All pages including about, privacy, terms. |
| `llms.txt` | 37 lines | AI answer engine optimization file. Company summary, products, audience, key URLs. |
| `css/style.css` | ~26KB | Main stylesheet. CSS custom properties. |
| `js/main.js` | ~7KB | Nav, animations, mobile sidebar. |
| `js/charts.js` | ~10KB | Chart.js config for investors.html. |
| `favicon.ico` | -- | Favicon |
| `images/hero-mountain.png` | 2.7MB | Hero background image (used on every page). |
| `images/logo.png` | 192KB | Logo |
| `images/favicon-32.png` | ~2KB | 32px favicon |
| `images/apple-touch-icon.png` | ~35KB | Apple touch icon |
| `images/icon-192.png` | ~39KB | PWA icon |

---

## SEO STATUS (As of 2026-05-01)

### Completed

- **Meta descriptions** on all 23 pages
- **Self-referencing canonical tags** on all 23 pages
- **OG + Twitter Card tags** on all 23 pages (title, description, image, url, type)
- **JSON-LD structured data** on all 23 pages (see inventory table for types per page)
- **XML sitemap** with 23 URLs covering all pages
- **robots.txt** allowing all crawlers including AI answer engines
- **llms.txt** for AI answer engine optimization
- **AEO "Bottom line" summary blocks** on 11 pages (5 vertical + 6 blog posts)
- **Keyword-rich anchor text** on why-island-mountain.html vertical links (replaced generic "Learn more")
- **Title tag optimization** on 5 high-priority pages (index, products, faq, contact, pricing) -- title + og:title + twitter:title kept in sync
- **Trust pages** created: about.html, privacy.html, terms.html
- **Email standardized** to basho@islandmountain.io across all schemas and contact references
- **Footer navigation** includes About, Privacy Policy, Terms of Service on all pages
- **Footer email removed** -- contact form is the sole public communication channel
- **A100 reference removed** from contact.html schema (Island Mountain sells H100 and H200 only)

### Known Issue: Founding Date Inconsistency

`index.html` says `foundingDate: "2026"`. `investors.html` and `about.html` say `foundingDate: "2025"`. Pick one and make it consistent. Fix with:

```bash
# If 2025 is correct:
cd "/sessions/serene-hopeful-albattani/mnt/Island Mountain/"
sed -i 's/"foundingDate": "2026"/"foundingDate": "2025"/' index.html

# If 2026 is correct:
sed -i 's/"foundingDate": "2025"/"foundingDate": "2026"/' investors.html about.html
```

---

## FORMSUBMIT.CO VERIFICATION STATUS

The contact form action points to `https://formsubmit.co/basho@islandmountain.io`. FormSubmit.co requires email verification on first submission. **Required steps:**

1. Submit a test form on the live site (https://islandmountain.io/contact.html)
2. Check basho@islandmountain.io for a verification email from FormSubmit.co
3. Click the verification link

Until this is done, form submissions will NOT be forwarded.

---

## OFF-PAGE WORK (Not Code -- Site Owner Action Required)

1. **Google Search Console:** Verify domain property is active. Submit sitemap URL. Use URL Inspection tool to request indexing on homepage, products, FAQ, pricing, all vertical pages, and the three new trust pages.
2. **Press release:** Distribute via PRNewswire or BusinessWire.
3. **LinkedIn articles:** Publish excerpts of the attorney-client privilege and tribal data sovereignty blog posts.
4. **Directory listings:** Submit to AI hardware directories and compliance technology marketplaces.
5. **Podcast appearances:** Legal tech, healthcare IT, tribal governance, defense procurement podcasts.
6. **Monitor GSC:** Watch for indexing and rank signals over the following 2-4 weeks.

---

## IMAGE OPTIMIZATION (Not Yet Addressed)

`hero-mountain.png` is 2.7MB. This is loaded on every single page. Recommended actions:

- Convert to WebP (typically 60-80% size reduction)
- Create responsive sizes (e.g., 1200px, 800px, 400px widths)
- Add `loading="lazy"` to non-above-fold images
- Consider using `<picture>` element with WebP + PNG fallback

`logo.png` at 192KB could also be compressed or converted.

---

## GIT WORKFLOW

**Stale lock file:** A `.git/index.lock` file may exist on the host filesystem. If git commands fail, delete it first:

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
```

**Commit and push from PowerShell:**

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
git add -A
git status
git commit -m "description of changes"
git push
```

If git push fails from the bash sandbox (common due to mount behavior), always provide a PowerShell block instead.

**Recent git history:**

```
2dddbb3 SEO implementation: email updates, anchor text, llms.txt, trust pages, AEO blocks, title optimization, remove footer email
43f3ba4 SEO implementation: email updates, anchor text, llms.txt, trust pages, AEO blocks, title optimization
7ff06cd Remove public handoff files, update contact form email to basho@islandmountain.io
6c4ae0d cleanup: delete truncated backups, remove internal blog docs, fix contact form endpoint
bf31b5d fix: restore all truncated HTML files from git history, preserve SEO changes
```

---

## PROMPT FOR NEW SESSION

Copy and paste this into a new Claude session after connecting the folder:

> You are working on the Island Mountain website (islandmountain.io), a static HTML/CSS/JS site on GitHub Pages selling on-premises AI inference hardware ($75K-$400K). Read the HANDOFF.md file in the repo root first. It contains the complete site inventory, verified file states, architecture notes, and safety protocols.
>
> CRITICAL: The Edit tool has a documented history of truncating HTML files in this project. After EVERY edit to an HTML file, run `tail -5 <filename>` via bash and confirm the file ends with `</html>`. Prefer sed commands over the Edit tool for all HTML modifications. If a file gets truncated, recover via `git show HEAD:<filename>`.
>
> Here is the folder I want you to work in: C:\Users\17076\Documents\Claude\Island Mountain
