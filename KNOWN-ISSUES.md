# Known Issues & Pending Items

Last reviewed: 2026-05-10 (Session 50)

---

## Active Concerns

### File Truncation Risk
All HTML files are at risk during sandbox writes, regardless of line count. See SESSION-RULES.md for the full at-risk list and mitigation protocol. Edit tool is banned for ALL HTML files (expanded Session 46). Use sed via bash exclusively.

### Google Business Profile
- Initiated 2026-05-08, verification PENDING
- Google Voice number recommended but deferred (requires Workspace add-on or personal Gmail)
- Owner action item: complete verification process

### css/style.css Size
At 1686 lines, this is the largest single file in the project. Any edits require extreme caution with sed. Consider whether a future session should split it into modular partials (nav.css, footer.css, etc.) - but only if the complexity justifies the link-tag overhead on 46 pages with no build step.

### Blackwell Overhaul Follow-Ups (Session 73)
Two items from the H100/H200 -> RTX PRO 6000 Blackwell overhaul need owner review:
1. **investors.html financials** were recalculated with new GPU cost (2x RTX PRO 6000 ~$18K vs 2x H100 refurb ~$66K): COGS $84,278 -> $36,278, gross margin break-even -> 38-47%, scenarios/NOI recomputed, and the freed GPU capital was reallocated from GPU inventory ($198K->$54K) into the working-capital reserve ($62K->$206K). These are coherent assumptions, not Basho's stated numbers - confirm they match intent. js/charts.js was updated to match (a deliberate deviation from the plan's "leave charts" note, to avoid a self-contradictory investor page).
2. **blog/h100-vs-h200-inference-comparison.html** keeps its old filename/URL (to preserve inbound links + sitemap) though its content is now "RTX PRO 6000 Blackwell vs. H100." Future SEO cleanup: consider a new slug with a 301 redirect.

### install-skills.py
Python installer script for persistent Cowork skill installation created Session 49. Not yet verified by user. Uses dynamic path discovery (glob pattern matching). May need updating if Cowork plugin architecture changes.

---

## Owner Action Items (John/Basho)

1. Complete Google Business Profile verification
2. Consider Google Voice number for GBP listing
3. Execute offpage SEO calendar (_work/seo/offpage-execution/execution-calendar.md)
4. Directory submissions (_work/seo/offpage-execution/directory-submissions.md)
5. LinkedIn article publishing (_work/seo/offpage-execution/linkedin/)
6. Podcast pitch outreach (_work/seo/offpage-execution/podcast-pitches.md)
7. Verify install-skills.py works on host machine (Session 49)
8. Delete recovery artifacts if any remain: about-recovered.html, css/style.css.recovered

---

## Resolved Issues (Sessions 1-50)

- **Hardware Overhaul (Session 73, 73A-73G):** Discontinued H100/H200 across the entire site. Moved to NVIDIA RTX PRO 6000 Blackwell (96GB GDDR7 ECC, 1,597 GB/s). Summit Base 2x ($59-69K), Pinnacle 4x ($175-225K), Ridge BTO ($95-120K). Landfall renamed/repriced (Scout RTX 5080 $7-8K, Ranger RTX 5090 $9.5-11.5K, Pack Leader RTX PRO 4500 Blackwell $15-22K). Citadel -> DGX B200 $400-500K. V4-Flash reframed to FP8 on Base (192GB). "Why Enterprise GPUs" -> "Why Professional-Grade GPUs". 2 blog posts rewritten (h100-vs-h200, deepseek-v4-flash deployment). investors.html financials + js/charts.js recalculated. The old H100 SXM5 "3.35 TB/s" bandwidth bug is now moot (RESOLVED). All ~45 HTML files audited, JSON-LD valid, no truncation/NUL.

- NUL byte corruption in privacy.html and solutions.html (fixed Session 16)
- NUL byte corruption in resources.html (546 bytes, committed fix Session 48)
- NUL byte corruption in js/main.js (250 bytes, local fix Session 48)
- Duplicate @context in pricing.html Product array (fixed Session 17a)
- Duplicate "url" key in about.html Person schema (fixed Session 17a)
- HTML entity in energy-utilities.html BreadcrumbList (fixed Session 17a)
- Copy-paste error in energy-utilities.html Product schema (fixed Session 15)
- privacy.html truncation during Session 19 batch edits (recovered from git HEAD)
- Unescaped HTML in faq.html trust question schema (fixed Session 10)
- Double-hyphen " -- " artifacts site-wide (replaced Session 12)
- "LLC" in display text (removed Session 20, preserved in legal pages)
- "actually" removed site-wide (27 occurrences, 13 files, Session 24)
- Em-dashes replaced with hyphens/semicolons (24 occurrences, 4 files, Session 24)
- Mobile sidebar scroll fix (overflow-y + overscroll-behavior, Session 25)
- Hardcoded #c026d3 fuchsia in nav hover/active replaced with var(--copper) (Session 42)
- Unsubstantiated "2-3x faster inference" Summit Ridge claim removed (Session 44)
- $547,500 cloud cost figure replaced with transparent $64,000-$220,000+ range (Session 47)
- Co-founder Basho Parks added to Organization schemas (index, about, investors, Session 46-47)
- Hero PNG fallbacks removed, switched to WebP-only srcset (Session 41)
- Inline styles extracted to CSS classes on resources, about, index, pricing (Session 43, 45)
- Orphaned AEO blocks wrapped in section containers on index, pricing (Session 43)

---

## Session Count

50 sessions complete as of 2026-05-10. Next session = 51.

---

## Things to Watch

- If adding a 12th vertical: update "eleven regulated industries" references across ~15 files, solutions.html grid, nav/sidebar/footer on all 46 pages, sitemap.xml, llms.txt
- If modifying navbar/sidebar/footer: changes propagate to ALL 46 HTML files (no template engine)
- If adding a blog post: add to blog.html grid, sitemap.xml, update related-article cards on 2-3 existing posts, update blog post count references
- If changing pricing: update Product schemas on products.html, pricing.html, index.html, all 11 verticals, FAQ answers, AEO summaries, on-premises-ai-cost-comparison.html
- css/blog.css is loaded by all 14 blog posts - changes affect all of them
- SESSION-LOG.md archive trigger: Session 60 (archive Sessions 40-59)
