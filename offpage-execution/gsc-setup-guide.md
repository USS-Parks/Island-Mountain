# Island Mountain — Google Search Console Setup Guide

**Date:** 2026-05-03  
**Status:** Action required — step-by-step walkthrough

---

## 1. Domain Verification

### Step 1: Access Google Search Console
1. Go to https://search.google.com/search-console
2. Sign in with the Google account that manages basho@islandmountain.io
3. Select "Start now" or click the property selector

### Step 2: Add Domain Property
1. Click "Add property"
2. Select "URL prefix" (not "Domain" — we need to verify ownership)
3. Enter: `https://islandmountain.io`
4. Click "Continue"

### Step 3: Verify Ownership (HTML File Method)
1. Google will prompt: "Verify your ownership of islandmountain.io"
2. Select **HTML file** method
3. Download the verification file (it will be named something like `google[random-string].html`)
4. Upload this file to the root directory of islandmountain.io:
   - **Path on server:** `https://islandmountain.io/google[random-string].html`
   - **Where to place:** `/public/` or root of static site generator
5. Verify it's accessible by visiting the URL in your browser — you should see the HTML file contents
6. Return to GSC and click "Verify" button
7. Confirmation message should appear: "Ownership verified"

### Step 4: Save Your Verification Token
- Screenshot the verification filename and save it in a secure location
- You may need it later if GSC requests re-verification

---

## 2. Sitemap Submission

### Step 1: Ensure Sitemap Exists
- Verify sitemap is generated at: `https://islandmountain.io/sitemap.xml`
- Expected: ~34 URLs (homepage, 11 vertical pages, 3 trust pages, ~11 blog posts, ~8 additional pages)
- Test by visiting the URL directly in your browser

### Step 2: Submit Sitemap in GSC
1. In GSC, navigate to **Sitemaps** (left sidebar)
2. Enter the sitemap URL: `https://islandmountain.io/sitemap.xml`
3. Click "Submit"
4. GSC will show: "Submitted sitemap" with a status indicator

### Step 3: Monitor Sitemap Status
- Check back in 2-3 days
- GSC will show: "Processed [X] URLs" 
- Expected processed: 30-34 URLs
- Look for any coverage warnings (e.g., "Not indexed")

---

## 3. Priority Page Indexing Requests

After sitemap submission, manually request indexing for these 14 priority pages. This speeds up discovery.

### Priority Pages (14 Total)

**Homepage + Core Pages (5):**
1. `https://islandmountain.io/` (homepage)
2. `https://islandmountain.io/products.html` (products)
3. `https://islandmountain.io/pricing.html` (pricing)
4. `https://islandmountain.io/faq.html` (FAQ)
5. `https://islandmountain.io/solutions.html` (solutions overview)

**Vertical Industry Pages (10):**
6. `https://islandmountain.io/law-firms.html`
7. `https://islandmountain.io/medical-practices.html`
8. `https://islandmountain.io/tribal-nations.html`
9. `https://islandmountain.io/research-labs.html`
10. `https://islandmountain.io/defense-contractors.html`
11. `https://islandmountain.io/financial-services.html`
12. `https://islandmountain.io/insurance.html`
13. `https://islandmountain.io/energy-utilities.html`
14. `https://islandmountain.io/government.html`

**Additional trust pages (education, admin):**
- `https://islandmountain.io/education.html`

### How to Request Indexing

1. In GSC, go to **URL Inspection** (top search bar in GSC)
2. Paste the first URL: `https://islandmountain.io/`
3. GSC shows inspection results
4. Click **"Request indexing"** (if available, you'll see a button)
5. Google acknowledges: "Requested indexing for URL and linked pages"
6. Repeat for each of the 14 priority URLs above

**Note:** Rate limit yourself to 5-10 per day to avoid flagging as automated.

---

## 4. Additional GSC Configuration

### Set Preferred Domain
1. Go to **Settings** (bottom left in GSC)
2. Under "Preferred domain," select: `https://www.islandmountain.io` OR `https://islandmountain.io`
3. Choose based on which version you use most (GSC will automatically canonicalize both)

### Enable Email Alerts
1. Go to **Settings**
2. Under "Email notifications," enable:
   - Coverage issues (new errors)
   - Mobile usability issues
   - Security issues
3. Set recipient to: basho@islandmountain.io

### Link Google Analytics (Optional)
1. Go to **Settings**
2. Associate with your Google Analytics property
3. This gives you richer data in GSC reports

---

## 5. Weekly Monitoring Tasks

### Every Monday
- [ ] Open https://search.google.com/search-console?resource_id=https://islandmountain.io
- [ ] Check **Performance** tab:
  - Total clicks (compare to previous week)
  - Average CTR
  - Average position
  - Impressions
- [ ] Note the top 5 queries driving traffic
- [ ] Record: Are branded queries trending up?

### Twice Per Week (Mon + Thu)
- [ ] Go to **Coverage** tab
- [ ] Verify: "No issues" or note any new exclusions
- [ ] If you see "Excluded by 'noindex' tag" or "Crawled but not indexed," click to investigate

### Monthly (First of month)
- [ ] Export **Performance** data to spreadsheet (last 28 days)
- [ ] Compare month-over-month:
  - Clicks
  - Impressions
  - Average position
- [ ] Check **Core Web Vitals** report:
  - Good/Needs improvement/Poor URLs
  - Are optimizations helping?

---

## 6. Indexing Timeline Expectations

**Day 1:** Verification complete, sitemap submitted
**Day 2-3:** GSC begins processing sitemap URLs
**Day 3-5:** Priority pages appear in "Indexed" state in Coverage tab
**Week 2:** All 30+ URLs should show "Indexed"
**Week 2-4:** First search query impressions appear in Performance tab

---

## 7. Troubleshooting

**Problem: "Verification failed" on HTML file method**
- Verify the file is readable at `https://islandmountain.io/google[name].html`
- Check file permissions (should be 644 or world-readable)
- Ensure no .htaccess redirects are blocking it
- Wait 30 minutes and retry

**Problem: Sitemap shows "Processed 0 URLs"**
- Check sitemap XML format at validator.w3.org/feed/
- Verify all URLs in sitemap are accessible (test a few with curl)
- Resubmit after fixing any XML syntax errors

**Problem: Coverage shows "Crawled but not indexed"**
- Check if page has `<meta name="robots" content="noindex">`
- Verify page content is substantial (>200 words)
- Check for duplicate content flagging (use URL Inspection tool)
- Wait 5-7 days for re-crawl

---

## Success Metrics

By end of Week 3:
- ✓ Domain verified in GSC
- ✓ Sitemap submitted and processed (30+ URLs)
- ✓ 14 priority pages indexed
- ✓ Email alerts configured
- ✓ First performance data visible (impressions)

By end of Month 1:
- ✓ 100+ clicks from organic search visible in Performance
- ✓ Top 10 queries identified
- ✓ Core Web Vitals passing (Good status)
