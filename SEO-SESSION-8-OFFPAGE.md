# SEO Session 8: Off-Page SEO Execution

**Date:** 2026-05-03
**Scope:** Execute off-page SEO strategies from monitoring-setup.md and offpage-checklist.md. Generate ready-to-submit content, draft press releases, format LinkedIn articles, and prepare directory submission materials.
**Reference:** monitoring-setup.md, offpage-checklist.md (both in workspace root)
**Prerequisites:** All on-page SEO sessions (1-7) complete. Site is indexed and stable.

---

## CRITICAL RULES

1. This session produces DOCUMENTS AND CONTENT for the site owner to submit manually. It does NOT make direct submissions (no API calls, no account creation).
2. All output files go to the workspace root.
3. Content must match the site's actual claims, pricing, and capabilities. No embellishment.
4. The site owner's name for public-facing content is John Dougherty (Founder/CEO). Basho Parks is Co-Founder/COO but not the public spokesperson for press purposes at this time.
5. Read both monitoring-setup.md and offpage-checklist.md before starting.

---

## THINKING BLOCK

### Why Off-Page SEO Now

On-page is done. The site has:
- 34 optimized pages with JSON-LD schemas
- AEO blocks on every page
- 100 long-tail keywords placed
- Internal cross-linking complete
- llms.txt + robots.txt for AI crawlers

None of that matters if nobody links to the site. Google's ranking algorithm still heavily weights backlinks and entity signals from external sources. Without off-page work, the site will index correctly but rank poorly against established competitors with domain authority.

### Priority Stack (Highest Impact First)

1. **Google Search Console setup** -- Without this, you're flying blind. No indexing data, no click data, no crawl error visibility. This is the single most impactful action.

2. **Directory submissions** -- Low effort, permanent backlinks. Crunchbase alone passes meaningful authority for B2B SaaS/hardware companies.

3. **Press release** -- One wire distribution creates 50-200 syndicated links overnight. At $400-800, it's the highest ROI off-page tactic for a new site.

4. **LinkedIn articles** -- Build personal brand + drive referral traffic + create social signals. Zero cost, high credibility for B2B.

5. **Podcast pitches** -- Longer play but builds entity authority. Google's Knowledge Graph increasingly weights entity mentions across multiple sources.

### What This Session Produces

1. A ready-to-paste Google Search Console verification guide (step-by-step)
2. Directory submission copy (consistent NAP + descriptions for each directory)
3. A complete press release draft (formatted for PRNewswire)
4. Five LinkedIn article drafts (800-1200 words each, linking back to blog posts)
5. Four podcast pitch emails (ready to send)
6. A week-by-week execution calendar

---

## TASK 1: Google Search Console Setup Guide

Create a step-by-step GSC guide saved as `offpage-execution/gsc-setup-guide.md`:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"
mkdir -p "$SITE/offpage-execution"
```

Content for the guide:

```markdown
# Google Search Console Setup — Island Mountain

## Step 1: Verify Domain
1. Go to https://search.google.com/search-console
2. Click "Add Property" → "URL prefix" → enter https://islandmountain.io
3. Choose "HTML file" verification method
4. Download the verification file (google*.html)
5. Place in website root, commit, push to GitHub
6. Click "Verify" in GSC

## Step 2: Submit Sitemap
1. In GSC left sidebar → "Sitemaps"
2. Enter: sitemap.xml
3. Click "Submit"
4. Expected: 34 URLs discovered

## Step 3: Request Indexing (Priority Pages)
Use "URL Inspection" tool for each:
- https://islandmountain.io/ (homepage)
- https://islandmountain.io/products.html
- https://islandmountain.io/pricing.html
- https://islandmountain.io/solutions.html
- https://islandmountain.io/law-firms.html
- https://islandmountain.io/medical-practices.html
- https://islandmountain.io/tribal-nations.html
- https://islandmountain.io/research-labs.html
- https://islandmountain.io/defense-contractors.html
- https://islandmountain.io/financial-services.html
- https://islandmountain.io/insurance.html
- https://islandmountain.io/energy-utilities.html
- https://islandmountain.io/government.html
- https://islandmountain.io/education.html

## Step 4: Monitor (Weekly)
- Coverage report: check for "Excluded" pages
- Core Web Vitals: monitor LCP, CLS, INP
- Search performance: track impressions + clicks by page
```

---

## TASK 2: Directory Submission Package

Create `offpage-execution/directory-submissions.md` with consistent copy for each directory:

**Company Profile (use on every directory):**
- Company Name: Island Mountain LLC
- Website: https://islandmountain.io
- Contact Page: https://islandmountain.io/contact.html
- Email: info@islandmountain.io
- Location: Colorado, USA
- Founded: 2026
- Category: AI Hardware / Enterprise Infrastructure / Compliance Technology
- Employees: 2-10

**Short Description (100 chars):**
On-premises AI inference servers with NVIDIA H100/H200 GPUs for regulated industries.

**Medium Description (250 chars):**
Island Mountain builds pre-configured, burn-tested AI inference servers for organizations where data cannot leave the building. NVIDIA H100 and H200 GPUs. Air-gap capable. $75K-$400K. Law firms, healthcare, tribal nations, defense, research, finance, energy, government, education.

**Long Description (500 chars):**
Island Mountain LLC ships on-premises AI inference hardware for regulated industries that cannot trust cloud providers with their data. Our servers arrive pre-configured with NVIDIA H100 or H200 GPUs, DeepSeek V4-Flash, Llama 3.1 70B, and the OpenWebUI interface. Air-gap capable for HIPAA, ITAR/DFARS, GLBA, NERC CIP, and FERPA environments. Three product tiers from $75,000 to $400,000. No recurring fees, no per-token pricing, no third-party data exposure. Built, burn-tested, and shipped from Colorado.

**Directory-specific notes:**
| Directory | Category to select | Notes |
|-----------|-------------------|-------|
| Crunchbase | AI, Hardware, Enterprise | Add funding stage: Pre-Seed |
| G2 | AI Infrastructure, GPU Servers | May require customer reviews |
| TrustRadius | AI Hardware, Data Privacy | Requires vendor registration |
| SourceForge | Enterprise AI, Server Hardware | Free listing |

---

## TASK 3: Press Release Draft

Create `offpage-execution/press-release-draft.md`:

Format: PRNewswire standard (headline, dateline, body paragraphs, boilerplate, contact)

**Content structure:**
- Headline: "Colorado Company Launches Air-Gapped AI Servers for Organizations That Cannot Trust Cloud Providers"
- Sub-headline: "Island Mountain ships pre-built NVIDIA H100/H200 inference hardware to law firms, hospitals, tribal nations, defense contractors, and eight other regulated industries"
- Dateline: COLORADO, [MONTH] [DAY], 2026
- P1: News hook (what + who + why now)
- P2: The problem (cloud AI + regulated data = compliance conflict)
- P3: The solution (pre-built, burn-tested, air-gap capable, $75K-$400K)
- P4: Market context (10 regulated industries, $47B TAM)
- P5: Quote from John Dougherty (Founder/CEO)
- P6: Product details (three tiers, GPU specs, software stack)
- P7: Availability and contact
- Boilerplate: About Island Mountain LLC
- Contact: info@islandmountain.io, https://islandmountain.io

**Key claims (verified against site):**
- Price range: $75,000-$400,000
- GPUs: NVIDIA H100 80GB PCIe (Starter), H200 141GB (Premium)
- Software: DeepSeek V4-Flash, Llama 3.1 70B, OpenWebUI
- Based in Colorado
- 10 target industries
- Zero recurring costs after purchase

---

## TASK 4: LinkedIn Article Drafts

Create 5 files in `offpage-execution/linkedin/`:

### Article 1: linkedin-attorney-privilege.md
- Angle: "Your Law Firm's AI Provider Can Be Subpoenaed"
- Source blog: blog/attorney-client-privilege-cloud-ai.html
- Length: 800-1200 words
- Structure: Hook (the preservation order scenario) → The privilege problem → Why NDAs don't fix it → The structural solution → CTA link to full article
- Link back: "Full analysis with case citations: https://islandmountain.io/blog/attorney-client-privilege-cloud-ai.html"

### Article 2: linkedin-tribal-sovereignty.md
- Angle: "The CLOUD Act vs. Tribal Sovereignty: Why AI Infrastructure Matters"
- Source blog: blog/tribal-data-sovereignty-ai-infrastructure.html
- Structure: Hook (CLOUD Act compulsion power) → OCAP principles → Why cloud violates Possession → Sovereign infrastructure → CTA
- Link back to full article

### Article 3: linkedin-tco-comparison.md
- Angle: "The Real Cost of Cloud AI After Year One"
- Source blog: blog/cloud-ai-vs-local-hardware-tco.html
- Structure: Hook (the $120K/year surprise) → Year 1 vs Year 3 math → Hidden costs (compliance overhead, vendor lock-in) → Break-even analysis → CTA
- Link back to full article

### Article 4: linkedin-h100-h200.md
- Angle: "H100 vs H200: What Defense Contractors Need to Know"
- Source blog: blog/h100-vs-h200-inference-comparison.html
- Structure: Hook (performance per dollar for inference) → H100 specs → H200 specs → When to choose which → CTA
- Link back to full article

### Article 5: linkedin-hipaa-audit.md
- Angle: "Can Your AI Pass a HIPAA Audit?"
- Source blog: blog/hipaa-technical-checklist.html
- Structure: Hook (the audit question nobody asks their AI vendor) → 10 technical safeguards → Where cloud fails → Structural solution → CTA
- Link back to full article

**Writing guidelines for all articles:**
- First person from John Dougherty's perspective
- Direct, no corporate fluff
- Include one specific number/stat in the first sentence
- End with a clear link back to islandmountain.io
- No emojis, no hashtag spam
- Post scheduling: one per week for 5 weeks

---

## TASK 5: Podcast Pitch Emails

Create `offpage-execution/podcast-pitches.md` with four ready-to-send emails:

1. **Legal Tech pitch** (targets: LawSites, Artificial Lawyer, Legal Talk Network)
   - Subject line: "Guest pitch: Attorney-client privilege is structurally incompatible with cloud AI"
   - Angle: the subpoena/preservation order risk nobody talks about

2. **Healthcare IT pitch** (targets: Healthcare IT News, HIT Like a Girl)
   - Subject line: "Guest pitch: HIPAA technical safeguards and AI -- why cloud solutions fail the audit"
   - Angle: walking through 45 CFR 164.312 requirements one by one

3. **Tribal Sovereignty pitch** (targets: Tribal Business News, Native America Calling)
   - Subject line: "Guest pitch: OCAP principles require sovereign AI infrastructure"
   - Angle: CLOUD Act compulsion vs. data sovereignty

4. **Defense/Gov pitch** (targets: Defense One, GovExec Daily, Federal News Network)
   - Subject line: "Guest pitch: ITAR and DFARS compliance for AI -- why cloud providers are a supply chain risk"
   - Angle: the audit-readiness gap in cloud AI for CUI

Each email: 150-200 words max. Direct, specific, names the topic and the unique angle. Offers specific talking points. Includes one-line bio.

---

## TASK 6: Execution Calendar

Create `offpage-execution/execution-calendar.md`:

| Week | Actions | Owner | Status |
|------|---------|-------|--------|
| Week 1 | GSC setup + sitemap submit + FormSubmit verify + Crunchbase + G2 | Basho/John | [ ] |
| Week 2 | Press release distribution + LinkedIn Article 1 (Attorney Privilege) | John | [ ] |
| Week 3 | Remaining directory submissions + LinkedIn Article 2 (Tribal) + Podcast pitch batch 1 (Legal + Healthcare) | John | [ ] |
| Week 4 | LinkedIn Article 3 (TCO) + Podcast pitch batch 2 (Defense + Tribal) | John | [ ] |
| Week 5 | LinkedIn Article 4 (H100 vs H200) + Monitor GSC indexing | John | [ ] |
| Week 6 | LinkedIn Article 5 (HIPAA Audit) + Monitor rank signals | John | [ ] |
| Week 7+ | Continue podcast outreach + respond to any opportunities | John | [ ] |

---

## TASK 7: Verification

After all files are created, verify the output directory:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"
echo "=== Off-page execution files ==="
find "$SITE/offpage-execution" -type f | sort
echo ""
echo "=== Word counts ==="
wc -w "$SITE/offpage-execution"/*.md "$SITE/offpage-execution/linkedin"/*.md 2>/dev/null
```

Expected output:
- offpage-execution/gsc-setup-guide.md
- offpage-execution/directory-submissions.md
- offpage-execution/press-release-draft.md
- offpage-execution/execution-calendar.md
- offpage-execution/podcast-pitches.md
- offpage-execution/linkedin/linkedin-attorney-privilege.md
- offpage-execution/linkedin/linkedin-tribal-sovereignty.md
- offpage-execution/linkedin/linkedin-tco-comparison.md
- offpage-execution/linkedin/linkedin-h100-h200.md
- offpage-execution/linkedin/linkedin-hipaa-audit.md

---

## IMPORTANT NOTES

This session does NOT modify any HTML files. It produces content assets the site owner will manually submit/post/distribute.

The press release should NOT be distributed until:
1. GSC is verified and sitemap submitted
2. At least one customer testimonial can be referenced (even anonymized)
3. John confirms he's ready for inbound inquiries

LinkedIn articles should be posted from John Dougherty's personal LinkedIn profile (higher reach than company page for a new brand).

---

## GIT PUSH

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"; git add -A; git commit -m "Session 8: Off-page SEO execution package (GSC guide, directory copy, press release, 5 LinkedIn articles, 4 podcast pitches, execution calendar)"; git push origin main
```
