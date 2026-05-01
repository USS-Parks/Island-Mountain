# Island Mountain Website -- SEO Implementation Handoff

**Date:** 2026-05-01
**Repo:** GitHub Pages static site at `C:\Users\17076\Documents\Claude\Island Mountain`
**Live URL:** https://islandmountain.io
**Stack:** Static HTML/CSS/JS. No frameworks, no build step, no SSG. Deployed via GitHub Pages.

---

## CRITICAL SAFETY RULE

**The Edit tool has repeatedly truncated HTML files in this project.** Files get silently chopped during edits -- the closing `</script>` or `</html>` tags vanish and the page breaks.

**After EVERY edit to an HTML file, you MUST:**
1. Run `tail -5 <filename>` (via bash) and confirm the file ends with `</html>`
2. Check line count hasn't dropped unexpectedly

**Before committing, run this verification script:**
```bash
cd "/sessions/awesome-ecstatic-fermi/mnt/Island Mountain/"
for f in *.html blog/*.html; do
  last=$(tail -1 "$f" | tr -d '[:space:]')
  if [ "$last" != "</html>" ] && [ "$f" != "googlecff518dc414acaa3.html" ]; then
    echo "TRUNCATED: $f"
  fi
done
echo "Verification complete."
```

**If a file gets truncated:** Recover via `git show HEAD:<filename> > /tmp/recovered.html`, apply changes to the recovered copy via `sed`, then copy back. Do NOT attempt to re-edit the truncated file.

**Preferred editing method:** Use `sed` commands via bash instead of the Edit tool for high-risk changes (especially changes that touch `<head>` or `<script>` blocks). This avoids the truncation bug entirely.

---

## PATH MAPPING (File Tools vs. Bash Sandbox)

| Context | Path |
|---------|------|
| File tools (Read/Write/Edit) | `C:\Users\17076\Documents\Claude\Island Mountain\` |
| Bash sandbox | `/sessions/awesome-ecstatic-fermi/mnt/Island Mountain/` |

Always use the correct path for the correct tool. They are NOT interchangeable.

---

## WHAT THE SEO AUDIT CLAIMS vs. WHAT ACTUALLY EXISTS

An external SEO audit was conducted against an older version of the site. Many of its findings are already resolved. Here is the truth:

### ALREADY DONE (Do NOT redo)

| Audit Claim | Reality |
|-------------|---------|
| "No meta descriptions exist on any page" | **FALSE.** All 20 pages have meta descriptions. |
| "No canonical tags were found on any page" | **FALSE.** All 20 pages have self-referencing canonical tags. |
| "No OG and Twitter Card tags" | **FALSE.** All 20 pages have complete OG + Twitter Card tags. |
| "No structured data was found on any page" | **FALSE.** Extensive JSON-LD exists: Organization + WebSite (index.html), Product schemas (products.html, pricing.html), FAQPage schemas (faq.html, all 5 vertical pages, pricing.html, technology.html, why-island-mountain.html), BlogPosting (all 6 blog posts), Blog (blog.html), LocalBusiness (contact.html), Organization (investors.html), SoftwareApplication (technology.html). |
| "Generate and submit XML sitemap immediately" | **EXISTS.** sitemap.xml has 20 URLs covering all pages. |
| "Create a robots.txt" | **EXISTS.** robots.txt allows all crawlers including GPTBot, ClaudeBot, PerplexityBot. Points to sitemap. |
| "Homepage uses generic 'Learn more' anchor text" | **FALSE.** Homepage cards use "See Full Specs", "Inquire", "Join Waitlist", "Request a Quote". |
| "Homepage link to Boutique AI Consulting returns 404" | **FALSE.** No link to boutique-ai-consulting.html exists anywhere. The Boutique AI Consulting card on why-island-mountain.html has descriptive text only, no link. |

### ACTUALLY REMAINING WORK

These are the verified, real gaps that need fixing:

---

## TASK 1: Fix contact.html JSON-LD Schema Errors

**File:** `contact.html`
**Lines:** 27-49 (JSON-LD block)
**Issues:**
- Line 34: `"email": "info@islandmountain.io"` -- should be `"basho@islandmountain.io"`
- Line 42: `"description"` references "NVIDIA A100" -- Island Mountain does NOT sell A100s, only H100 and H200

**Current (line 34):**
```json
"email": "info@islandmountain.io",
```
**Change to:**
```json
"email": "basho@islandmountain.io",
```

**Current (line 42):**
```json
"description": "Pre-built, burn-tested local AI inference hardware for data-sovereign organizations. NVIDIA A100, H100, and H200 GPU racks from $75,000.",
```
**Change to:**
```json
"description": "Pre-built, burn-tested local AI inference hardware for data-sovereign organizations. NVIDIA H100 and H200 GPU racks from $75,000.",
```

**Bash commands:**
```bash
cd "/sessions/awesome-ecstatic-fermi/mnt/Island Mountain/"
sed -i 's|"email": "info@islandmountain.io"|"email": "basho@islandmountain.io"|' contact.html
sed -i 's|NVIDIA A100, H100, and H200|NVIDIA H100 and H200|' contact.html
tail -1 contact.html  # MUST show </html>
wc -l contact.html    # MUST show 925
```

---

## TASK 2: Fix index.html Organization Schema Email

**File:** `index.html`
**Line 47:**
```json
"email": "info@islandmountain.io",
```
**Change to:**
```json
"email": "basho@islandmountain.io",
```

**Bash command:**
```bash
cd "/sessions/awesome-ecstatic-fermi/mnt/Island Mountain/"
sed -i '/"contactPoint"/,/"ContactPoint"/{ s|"email": "info@islandmountain.io"|"email": "basho@islandmountain.io"| }' index.html
tail -1 index.html  # MUST show </html>
wc -l index.html    # MUST show 371
```

**NOTE:** The `info@islandmountain.io` also appears on line 47 in the Organization schema contactPoint. The sed above targets it within the contactPoint block to avoid unintended replacements.

---

## TASK 3: Fix investors.html Organization Schema Email

**File:** `investors.html`
**Line 52:**
```json
"email": "info@islandmountain.io",
```
**Change to:**
```json
"email": "basho@islandmountain.io",
```

**Bash command:**
```bash
cd "/sessions/awesome-ecstatic-fermi/mnt/Island Mountain/"
sed -i 's|"email": "info@islandmountain.io"|"email": "basho@islandmountain.io"|' investors.html
tail -1 investors.html  # MUST show </html>
wc -l investors.html    # MUST show 290
```

---

## TASK 4: Update Footer Email Across All 20 Pages

**Scope:** Every page has `info@islandmountain.io` in the footer as a mailto link. These need to become `basho@islandmountain.io`.

**Affected files (20 total):**
- Root: index.html, products.html, pricing.html, why-island-mountain.html, technology.html, faq.html, blog.html, contact.html, investors.html, law-firms.html, medical-practices.html, tribal-nations.html, research-labs.html, defense-contractors.html
- Blog: deepseek-v4-flash-local-deployment.html, attorney-client-privilege-cloud-ai.html, h100-vs-h200-inference-comparison.html, cloud-ai-vs-local-hardware-tco.html, openwebui-admin-setup-guide.html, tribal-data-sovereignty-ai-infrastructure.html

**Pattern in each file (footer):**
```html
<li><a href="mailto:info@islandmountain.io">info@islandmountain.io</a></li>
```

**Additionally in contact.html (lines 671, 699, 741):** Three more references to `info@islandmountain.io` outside the footer.

**Bash command (bulk replace all files):**
```bash
cd "/sessions/awesome-ecstatic-fermi/mnt/Island Mountain/"
# Replace in all root HTML files
for f in *.html; do
  if [ "$f" != "googlecff518dc414acaa3.html" ]; then
    sed -i 's|info@islandmountain.io|basho@islandmountain.io|g' "$f"
  fi
done
# Replace in all blog HTML files
for f in blog/*.html; do
  sed -i 's|info@islandmountain.io|basho@islandmountain.io|g' "$f"
done
```

**IMPORTANT:** Run this AFTER Tasks 1-3, since those sed commands also target `info@`. Running Task 4 first would make Tasks 1-3 unnecessary but less precise. Alternatively, just run Task 4 as the single bulk operation and skip Tasks 1-3.

**Verification (MANDATORY):**
```bash
cd "/sessions/awesome-ecstatic-fermi/mnt/Island Mountain/"
# Confirm no info@ references remain
grep -r "info@islandmountain.io" *.html blog/*.html
# Should return zero results

# Confirm all files still intact
for f in *.html blog/*.html; do
  last=$(tail -1 "$f" | tr -d '[:space:]')
  if [ "$last" != "</html>" ] && [ "$f" != "googlecff518dc414acaa3.html" ]; then
    echo "TRUNCATED: $f"
  fi
done
echo "All files verified."
```

---

## TASK 5: Rewrite Generic "Learn more" Anchor Text on why-island-mountain.html

**File:** `why-island-mountain.html`
**Lines:** 215, 223, 231, 239, 247

Five vertical cards use identical "Learn more" anchor text. These should be keyword-rich and descriptive.

**Current and replacement for each:**

Line 215 (Medical):
```
Current:  <a href="medical-practices.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more &rarr;</a>
Replace: <a href="medical-practices.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">HIPAA-compliant AI for medical practices &rarr;</a>
```

Line 223 (Law Firms):
```
Current:  <a href="law-firms.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more &rarr;</a>
Replace: <a href="law-firms.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Local AI for law firms &rarr;</a>
```

Line 231 (Defense):
```
Current:  <a href="defense-contractors.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more &rarr;</a>
Replace: <a href="defense-contractors.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">ITAR-compliant AI hardware &rarr;</a>
```

Line 239 (Tribal Nations):
```
Current:  <a href="tribal-nations.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more &rarr;</a>
Replace: <a href="tribal-nations.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Tribal data sovereignty AI &rarr;</a>
```

Line 247 (Research Labs):
```
Current:  <a href="research-labs.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more &rarr;</a>
Replace: <a href="research-labs.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Local AI for research labs &rarr;</a>
```

**Bash commands:**
```bash
cd "/sessions/awesome-ecstatic-fermi/mnt/Island Mountain/"
sed -i 's|<a href="medical-practices.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more \&rarr;</a>|<a href="medical-practices.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">HIPAA-compliant AI for medical practices \&rarr;</a>|' why-island-mountain.html
sed -i 's|<a href="law-firms.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more \&rarr;</a>|<a href="law-firms.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Local AI for law firms \&rarr;</a>|' why-island-mountain.html
sed -i 's|<a href="defense-contractors.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more \&rarr;</a>|<a href="defense-contractors.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">ITAR-compliant AI hardware \&rarr;</a>|' why-island-mountain.html
sed -i 's|<a href="tribal-nations.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more \&rarr;</a>|<a href="tribal-nations.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Tribal data sovereignty AI \&rarr;</a>|' why-island-mountain.html
sed -i 's|<a href="research-labs.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Learn more \&rarr;</a>|<a href="research-labs.html" style="color:var(--copper);font-weight:500;font-size:0.9rem;">Local AI for research labs \&rarr;</a>|' why-island-mountain.html
tail -1 why-island-mountain.html  # MUST show </html>
wc -l why-island-mountain.html    # MUST show 448
```

---

## TASK 6: Create llms.txt (Answer Engine Optimization)

**File to create:** `llms.txt` in repo root
**Purpose:** Tells AI answer engines (ChatGPT, Perplexity, Claude) what this site is, what it sells, and where to find key information. Emerging standard for AEO.

**Content:**
```
# Island Mountain

## About
Pre-built, burn-tested on-premise AI inference servers with NVIDIA H100 and H200 GPUs. Air-gapped, HIPAA-ready, ITAR-compliant. One-time purchase. No cloud fees. No subscriptions. No per-token charges. Built in Colorado.

## Products
Three tiers of local AI inference hardware:
- Starter: 2x NVIDIA H100 80GB PCIe, 160GB VRAM, AMD EPYC 7413, 512GB DDR4 ECC. $75K-$85K.
- Performance: Build-to-order configuration. $150K-$160K.
- Premium: 2x NVIDIA H200 141GB SXM, 282GB VRAM. $350K-$400K.

All systems ship with DeepSeek V4-Flash pre-installed, OpenWebUI configured, and 72 hours of burn-in testing completed.

## Who This Is For
- Law firms protecting attorney-client privilege (ABA Model Rule 1.6)
- Medical practices needing HIPAA compliance without a BAA
- Defense contractors handling ITAR/CUI/CMMC-regulated data
- Tribal nations exercising data sovereignty (OCAP principles)
- Research labs protecting unpublished data and grant-funded IP

## Key Pages
- Products: https://islandmountain.io/products.html
- Pricing: https://islandmountain.io/pricing.html
- FAQ (25 Q&A pairs): https://islandmountain.io/faq.html
- Contact/Quote: https://islandmountain.io/contact.html

## Blog
- DeepSeek V4-Flash Deployment: https://islandmountain.io/blog/deepseek-v4-flash-local-deployment.html
- Attorney-Client Privilege & Cloud AI: https://islandmountain.io/blog/attorney-client-privilege-cloud-ai.html
- H100 vs H200 Comparison: https://islandmountain.io/blog/h100-vs-h200-inference-comparison.html
- Cloud vs Local TCO: https://islandmountain.io/blog/cloud-ai-vs-local-hardware-tco.html
- OpenWebUI Admin Guide: https://islandmountain.io/blog/openwebui-admin-setup-guide.html
- Tribal Data Sovereignty: https://islandmountain.io/blog/tribal-data-sovereignty-ai-infrastructure.html

## Contact
basho@islandmountain.io
https://islandmountain.io/contact.html
```

**After creating, add to sitemap.xml** -- no, llms.txt does not go in sitemap (it's not HTML). But DO add it to robots.txt if desired.

---

## TASK 7: Create Trust Pages (about.html, privacy.html, terms.html)

These three pages are missing. For a company selling $75K-$400K data sovereignty hardware, the absence of a privacy policy is a contradiction buyers will notice.

### 7a: about.html

Must answer: Who built this? What qualifies them? Why Colorado? What's the company story?

**Key facts for content:**
- Island Mountain LLC
- Founded 2025/2026 (investors.html says 2025, index.html says 2026 -- reconcile this)
- Founder: John Dougherty
- Location: Colorado
- One-person builder model, direct support
- Pre-built, burn-tested GPU inference racks
- NVIDIA H100 and H200 GPUs
- Target markets: law firms, healthcare, defense, tribal nations, research

**Template structure:** Match existing site design (same CSS, same nav, same footer). Use existing vertical pages as structural template.

### 7b: privacy.html

Must cover: What data the site collects, how the contact form works (FormSubmit.co processes submissions), no cookies/tracking (verify this), no analytics (verify this), data sovereignty philosophy.

**Key facts:**
- Contact form submissions processed via FormSubmit.co (third-party service)
- Form data is emailed to basho@islandmountain.io
- Google Fonts loaded from Google CDN (creates a request to Google's servers)
- Remixicon loaded from jsDelivr CDN
- No analytics scripts detected (no Google Analytics, no Plausible, etc.)
- Google Search Console verification file present

### 7c: terms.html

Standard B2B hardware sales terms. Product descriptions, pricing disclaimers, limitation of liability, warranty information, governing law (Colorado).

**All three pages must:**
- Use the same `<head>` structure as existing pages (charset, viewport, favicon, CSS, fonts, canonical, OG, Twitter)
- Include proper meta descriptions
- Include JSON-LD (WebPage schema)
- Be added to sitemap.xml
- Be added to the site navigation (footer at minimum)
- End with `</html>` (verify after creation)

---

## TASK 8: Title Tag Optimization (Optional -- Lower Priority)

The audit recommends more commercial-intent title tags. Current titles are functional but not purchase-optimized. Here are the audit's recommendations alongside current titles:

| Page | Current Title | Recommended Title |
|------|--------------|-------------------|
| index.html | On-Premises AI Inference Hardware \| HIPAA & ITAR-Compliant Local LLM Servers \| Island Mountain | On-Premise AI Servers \| Air-Gapped H100 & H200 Hardware -- Island Mountain |
| products.html | Pre-Built NVIDIA H100 & H200 AI Inference Servers \| 3 Tiers From $75K \| Island Mountain | Pre-Built H100 & H200 AI Servers \| 3 Tiers from $75K-$400K -- Island Mountain |
| faq.html | Local AI Hardware FAQ: HIPAA, ITAR, Privilege, Data Sovereignty Answers \| Island Mountain | Local AI Hardware FAQ -- Honest Answers on Cost, Compliance & Data Sovereignty |
| contact.html | Request a Quote: Custom On-Premises AI Inference Hardware \| Island Mountain | Request a Quote -- On-Premise AI Server for Your Organization |
| pricing.html | Local AI Server Pricing: $75K-$400K One-Time \| No Subscriptions \| Island Mountain | Local AI Server Pricing: Starter $75K, Performance $150K, Premium $350K One-Time |

**NOTE:** Changing title tags also requires updating the matching OG and Twitter title tags on each page to stay consistent. Each title change = 3 edits per file (title, og:title, twitter:title). Proceed with caution given the Edit tool truncation risk.

---

## TASK 9: Add AEO Summary Blocks to Vertical Pages and Blog Posts

Each page should end its main content section with a concise "bottom line" summary that AI answer engines can extract.

**HTML pattern:**
```html
<div class="aeo-summary" style="background:var(--surface-alt,#f8f8f8);border-left:4px solid var(--copper,#b87333);padding:1.5rem;margin:2rem 0;border-radius:4px;">
  <p style="margin:0;font-weight:600;font-size:1.05rem;"><strong>Bottom line:</strong> [One-sentence synthesis of the page's core argument.]</p>
</div>
```

**Pages needing AEO blocks (11 total):**
- medical-practices.html
- law-firms.html
- defense-contractors.html
- tribal-nations.html
- research-labs.html
- blog/deepseek-v4-flash-local-deployment.html
- blog/attorney-client-privilege-cloud-ai.html
- blog/h100-vs-h200-inference-comparison.html
- blog/cloud-ai-vs-local-hardware-tco.html
- blog/openwebui-admin-setup-guide.html
- blog/tribal-data-sovereignty-ai-infrastructure.html

**Each summary must be written after reading the full page content.** Do not write generic summaries.

---

## TASK 10: Add New Pages to sitemap.xml

After creating about.html, privacy.html, terms.html, and llms.txt, add them to the sitemap.

**Add before the closing `</urlset>` tag:**
```xml
  <url>
    <loc>https://islandmountain.io/about.html</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://islandmountain.io/privacy.html</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://islandmountain.io/terms.html</loc>
    <lastmod>2026-05-01</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
```

---

## TASK 11: Add New Pages to Site Navigation

After creating about.html, privacy.html, and terms.html, add them to the footer navigation of all pages. The footer structure uses an unordered list in the "Resources" column.

**This is a bulk edit across all 20 pages.** Use sed carefully.

---

## EXECUTION ORDER

Recommended sequence to minimize risk:

1. **Task 4** (bulk email replacement) -- covers Tasks 1-3 automatically
2. **Task 1** (fix A100 reference in contact.html JSON-LD) -- the one thing Task 4 doesn't cover
3. **Task 5** (anchor text on why-island-mountain.html)
4. **Task 6** (create llms.txt) -- new file, zero risk to existing files
5. **Task 7** (create trust pages) -- new files, zero risk to existing files
6. **Task 10** (update sitemap.xml)
7. **Task 11** (add trust pages to footer nav) -- bulk edit, moderate risk
8. **Task 9** (AEO summary blocks) -- requires reading each page first
9. **Task 8** (title tag optimization) -- lowest priority, highest risk per file

**After ALL edits, run the full verification script from the safety section above.**

---

## GIT WORKFLOW

**Stale lock file:** A `.git/index.lock` file may exist on the host filesystem. If git commands fail, the user must delete it via PowerShell first:
```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
```

**Commit and push from bash sandbox:**
```bash
cd "/sessions/awesome-ecstatic-fermi/mnt/Island Mountain/"
git add -A
git status  # Review what's being committed
git commit -m "SEO implementation: email updates, anchor text, llms.txt, trust pages, AEO blocks"
git push
```

**If git push fails from sandbox**, provide the user a PowerShell block instead:
```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"
Remove-Item ".git\index.lock" -Force -ErrorAction SilentlyContinue
git add -A
git commit -m "SEO implementation: email updates, anchor text, llms.txt, trust pages, AEO blocks"
git push
```

---

## PENDING FROM PREVIOUS SESSION (May or May Not Be Done)

The previous session made these changes that may not have been pushed:
- Deleted `Claude-handoffs/` directory and `HANDOFF.md` from repo
- Changed contact.html form action from `info@` to `basho@islandmountain.io` (line 431)

A PowerShell push block was provided. If these changes are uncommitted, they'll be picked up by the next `git add -A`.

**FormSubmit.co verification:** The form action on contact.html points to `https://formsubmit.co/basho@islandmountain.io`. FormSubmit.co requires email verification on first submission. The user must:
1. Submit a test form on the live site
2. Check basho@islandmountain.io for a verification email from FormSubmit.co
3. Click the verification link

Until this is done, form submissions will NOT be forwarded.

---

## OFF-PAGE WORK (Not Code -- User Action Required)

These items from the audit require manual action by the site owner, not code changes:

1. **Google Search Console:** Verify the domain property is active. Submit sitemap URL. Use URL Inspection tool to request indexing on homepage, products, FAQ, pricing, and all vertical pages.
2. **Press release:** Distribute via PRNewswire or BusinessWire.
3. **LinkedIn articles:** Publish excerpts of the attorney-client privilege and tribal data sovereignty blog posts.
4. **Directory listings:** Submit to AI hardware directories and compliance technology marketplaces.
5. **Podcast appearances:** Legal tech, healthcare IT, tribal governance, defense procurement podcasts.
6. **Monitor GSC:** Watch for indexing and rank signals over the following 2-4 weeks.

---

## FILE INVENTORY (Verified 2026-05-01)

### Existing HTML Files (20 pages + 1 verification file)

| File | Lines | Has Meta Desc | Has Canonical | Has OG | Has JSON-LD | Ends </html> |
|------|-------|--------------|---------------|--------|-------------|-------------|
| index.html | 371 | Yes | Yes | Yes | Organization + WebSite | Yes |
| products.html | 519 | Yes | Yes | Yes | Product (3 tiers) | Yes |
| pricing.html | 504 | Yes | Yes | Yes | Product + FAQPage | Yes |
| why-island-mountain.html | 448 | Yes | Yes | Yes | FAQPage | Yes |
| technology.html | 448 | Yes | Yes | Yes | SoftwareApplication + FAQPage | Yes |
| faq.html | 840 | Yes | Yes | Yes | FAQPage (25 Q&A) | Yes |
| blog.html | 375 | Yes | Yes | Yes | Blog | Yes |
| contact.html | 925 | Yes | Yes | Yes | LocalBusiness | Yes |
| investors.html | 290 | Yes | Yes | Yes | Organization | Yes |
| law-firms.html | 512 | Yes | Yes | Yes | FAQPage | Yes |
| medical-practices.html | 479 | Yes | Yes | Yes | FAQPage | Yes |
| tribal-nations.html | 505 | Yes | Yes | Yes | FAQPage + GovOrg | Yes |
| research-labs.html | 473 | Yes | Yes | Yes | FAQPage | Yes |
| defense-contractors.html | 483 | Yes | Yes | Yes | FAQPage | Yes |
| blog/deepseek-v4-flash-local-deployment.html | 601 | Yes | Yes | Yes | BlogPosting | Yes |
| blog/attorney-client-privilege-cloud-ai.html | 647 | Yes | Yes | Yes | BlogPosting | Yes |
| blog/h100-vs-h200-inference-comparison.html | 657 | Yes | Yes | Yes | BlogPosting | Yes |
| blog/cloud-ai-vs-local-hardware-tco.html | 661 | Yes | Yes | Yes | BlogPosting | Yes |
| blog/openwebui-admin-setup-guide.html | 639 | Yes | Yes | Yes | BlogPosting | Yes |
| blog/tribal-data-sovereignty-ai-infrastructure.html | 625 | Yes | Yes | Yes | BlogPosting | Yes |
| googlecff518dc414acaa3.html | 1 | N/A | N/A | N/A | N/A | N/A (verification file) |

### Other Files
- `robots.txt` -- 520 bytes, comprehensive crawler directives
- `sitemap.xml` -- 20 URLs, all pages covered
- `css/style.css` -- main stylesheet
- `images/` -- hero-mountain.png (2.7MB), logo.png, favicon-32.png, apple-touch-icon.png, icon-192.png
- `favicon.ico`

### Files That Do NOT Exist (to be created)
- `llms.txt`
- `about.html`
- `privacy.html`
- `terms.html`

---

## PROMPT FOR NEW SESSION

Copy and paste this into a new Claude session after connecting the folder:

---

**You are implementing SEO fixes for the Island Mountain website (islandmountain.io), a static HTML/CSS/JS site on GitHub Pages selling on-premises AI inference hardware ($75K-$400K). Read the HANDOFF.md file in the repo root first. It contains the complete implementation spec, verified file inventory, exact sed commands, and safety protocols.**

**CRITICAL: The Edit tool has a documented history of truncating HTML files in this project. After EVERY edit to an HTML file, run `tail -5 <filename>` via bash and confirm the file ends with `</html>`. Prefer sed commands over the Edit tool for all HTML modifications. If a file gets truncated, recover via `git show HEAD:<filename>`.**

**Execute the tasks in HANDOFF.md in the specified order. Verify every file after every edit. Do not skip verification steps.**

---
