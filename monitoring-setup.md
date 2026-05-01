# Island Mountain — Monitoring & Analytics Setup Guide

**Date:** 2026-05-01
**Status:** Action required by site owner

---

## 1. Plausible Analytics (When Ready)

Plausible is a privacy-friendly, cookie-free analytics platform. It does not track individual users and requires no cookie consent banner — consistent with Island Mountain's data sovereignty message.

**Setup steps:**
1. Create account at https://plausible.io (or self-host via Docker)
2. Add site: islandmountain.io
3. The script tag has NOT been added to the site yet (skipped per your request). When ready, add this to all pages before `</head>`:
   ```html
   <script defer data-domain="islandmountain.io" src="https://plausible.io/js/script.js"></script>
   ```
4. Set up goal tracking:
   - Contact form submission (pageview goal: /contact.html#thank-you or custom event)
   - Blog reads (pageview goals for /blog/*)
5. Create dashboard bookmarks for weekly review

**Cost:** $9/month for up to 10K monthly pageviews, or free if self-hosted.

---

## 2. Rank Tracking

**Tool:** SERPWatcher (Mangools) or SE Ranking free tier

**Priority keywords to track (20):**

| Keyword | Target Page |
|---------|------------|
| on-premise AI server | index.html |
| local AI inference hardware | products.html |
| HIPAA compliant AI server | medical-practices.html |
| air-gapped AI server | technology.html |
| H100 server buy | products.html |
| H200 server price | pricing.html |
| on-premise AI for law firms | law-firms.html |
| attorney-client privilege AI | blog/attorney-client-privilege-cloud-ai.html |
| tribal data sovereignty AI | tribal-nations.html |
| OCAP compliant AI | blog/ocap-cloud-act-guide.html |
| ITAR compliant AI server | defense-contractors.html |
| CMMC AI infrastructure | defense-contractors.html |
| local AI hardware cost | blog/cloud-ai-vs-local-hardware-tco.html |
| H100 vs H200 inference | blog/h100-vs-h200-inference-comparison.html |
| OpenWebUI admin setup | blog/openwebui-admin-setup-guide.html |
| DFARS AI compliance | blog/itar-dfars-ai-self-assessment.html |
| research lab AI server | research-labs.html |
| on-premise vs cloud AI | blog/on-prem-vs-colo-vs-cloud.html |
| buy AI server Colorado | index.html |
| local AI no subscription | pricing.html |

**Tracking cadence:** Weekly rank check, monthly trend review.

---

## 3. Schema Markup Validation

Run monthly through Google's Rich Results Test:
- URL: https://search.google.com/test/rich-results
- Test each page type: homepage, products, FAQ, blog posts, vertical pages, about
- Fix any warnings or errors that appear
- Bookmark: https://validator.schema.org/ for detailed validation

---

## 4. Core Web Vitals Monitoring

After deploying the font self-hosting and image optimization (this commit):
- Run PageSpeed Insights on homepage, products, FAQ: https://pagespeed.web.dev/
- Baseline the LCP, FID/INP, and CLS scores
- Expected improvement: hero image WebP should significantly reduce LCP
- Monitor CWV report in Google Search Console weekly for 4 weeks

---

## 5. Uptime Monitoring (Optional)

If you want notification when the site goes down:
- UptimeRobot (free tier): https://uptimerobot.com
- Monitor: https://islandmountain.io (HTTP check, 5-minute interval)
- Alert via email to basho@islandmountain.io

---

## 6. Monthly Review Checklist

| Check | Tool | Cadence |
|-------|------|---------|
| Keyword rankings | SERPWatcher | Weekly |
| Traffic trends | Plausible | Weekly |
| Indexing status | Google Search Console | Weekly |
| Core Web Vitals | GSC / PageSpeed Insights | Monthly |
| Schema validation | Rich Results Test | Monthly |
| Broken links | Screaming Frog or Dr. Link Check | Monthly |
| Backlink profile | Ahrefs free webmaster tools | Monthly |
| Contact form test | Manual submission | Monthly |
