# SEO Session 4: Cross-Linking, Entity Reinforcement, and Full Verification

**Date:** 2026-05-03
**Scope:** Internal cross-links between new verticals, keyword density audit, entity reinforcement check, and full-site SEO/AEO verification.
**Reference:** VERTICAL-EXPANSION-SEO-AEO.md (sections 7 and 9)
**Prerequisites:** Sessions 1-3 must be completed first. Product schemas, enriched FAQs, enhanced AEO blocks, and optimized H2s should already be in place.

---

## CRITICAL RULES

1. All vertical pages are over 570 lines. Use `sed` via bash for EVERY edit. Never use the Edit tool.
2. After EVERY sed command, run: `tail -3 filename` to verify file ends with `</html>`.
3. Find your bash session path first: `ls /sessions/*/mnt/`
4. Set SITE variable: `SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"`
5. Before starting, read HANDOFF.md for full project context.

---

## TASK 1: Audit Existing Internal Links

Before adding cross-links, check what links each new page already has:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

for page in financial-services.html insurance.html energy-utilities.html government.html education.html; do
  echo "=== $page internal links ==="
  grep -oP 'href="[^"]*\.html"' "$SITE/$page" | sort -u
  echo ""
done
```

---

## TASK 2: Add Cross-Vertical Links

Each new vertical page needs contextual cross-links to related verticals. Add these as inline links within existing body text, or as a "Related Industries" subsection near the bottom (before the testimonials or CTA section). Use `grep -n` to find the right insertion points.

### Cross-Link Map

**financial-services.html needs links to:**
- insurance.html (both handle financial data, GLBA overlap)
- energy-utilities.html (critical infrastructure financial operations)

**insurance.html needs links to:**
- medical-practices.html (HIPAA overlap for health insurers — add contextual body link: "Like medical practices, health insurers handle protected health information...")
- financial-services.html (GLBA overlap for insurance financial products)

**energy-utilities.html needs links to:**
- defense-contractors.html (critical infrastructure overlap, similar compliance posture)
- government.html (government-regulated utilities, FERC oversight)

**government.html needs links to:**
- defense-contractors.html (CUI overlap, NIST 800-171 shared framework)
- tribal-nations.html (data sovereignty parallel — "Tribal nations also exercise data sovereignty...")
- education.html (FERPA overlap for public school districts)

**education.html needs links to:**
- research-labs.html (academic research overlap, same campus)
- medical-practices.html (campus health centers, HIPAA at universities)
- government.html (public institutions, government data handling)

### Implementation Strategy

For each page, find a relevant paragraph in the body text and add an inline link. Example approach:

```bash
# Find a paragraph mentioning "compliance" or "regulated" in insurance.html where a medical-practices link fits
grep -n 'health information\|HIPAA\|protected health' "$SITE/insurance.html" | head -5

# Then add a contextual link using sed
# Example (adjust line number and exact text based on grep results):
# sed -i 's|health insurance carriers handle protected health information|health insurance carriers handle protected health information (similar to <a href="medical-practices.html">medical practices under HIPAA</a>)|' "$SITE/insurance.html"
```

**Do NOT add links mechanically.** Read the surrounding paragraph first and only add a link where it reads naturally. If no natural insertion point exists, skip that cross-link rather than forcing it.

---

## TASK 3: Entity Reinforcement Audit

Check that "Island Mountain" appears with sufficient frequency alongside each page's primary compliance framework. Run this audit:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

echo "=== ENTITY DENSITY CHECK ==="
echo ""

declare -A frameworks
frameworks[financial-services.html]="GLBA"
frameworks[insurance.html]="NAIC\|HIPAA"
frameworks[energy-utilities.html]="NERC CIP"
frameworks[government.html]="NIST\|FedRAMP"
frameworks[education.html]="FERPA"

for page in financial-services.html insurance.html energy-utilities.html government.html education.html; do
  fw="${frameworks[$page]}"
  echo "=== $page ==="
  
  # Island Mountain mentions
  im_count=$(grep -ci 'Island Mountain' "$SITE/$page")
  echo "  Island Mountain mentions: $im_count (target: 8+)"
  
  # Primary framework mentions
  fw_count=$(grep -ci "$fw" "$SITE/$page")
  echo "  Primary framework mentions: $fw_count (target: 10+)"
  
  # H100/H200 mentions
  gpu_count=$(grep -ci 'H100\|H200' "$SITE/$page")
  echo "  GPU mentions: $gpu_count (target: 4+)"
  
  # Price mentions
  price_count=$(grep -c '\$75' "$SITE/$page")
  echo "  Price anchor mentions: $price_count (target: 2+)"
  
  echo ""
done
```

If any page falls significantly short of targets, add mentions in body text where natural. Priority: ensure "Island Mountain" appears in at least 2 FAQ answers (check the enriched schemas from Sessions 1-3) and the AEO block (should already be there from Sessions 1-3).

---

## TASK 4: Keyword Placement Spot Check

The full 100-keyword placement is a large task. Do a spot check of high-priority keywords (top 5 per vertical) to see if they appear anywhere on the page:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

echo "=== FINANCIAL: Top 5 keyword check ==="
for kw in "on-premises AI for banks" "GLBA compliant" "air-gapped AI banking" "local LLM for financial" "private AI for credit unions"; do
  count=$(grep -ci "$kw" "$SITE/financial-services.html")
  echo "  '$kw': $count"
done

echo ""
echo "=== INSURANCE: Top 5 keyword check ==="
for kw in "on-premises AI for insurance" "HIPAA compliant AI" "air-gapped AI claims" "local LLM underwriting" "private AI for health insurance"; do
  count=$(grep -ci "$kw" "$SITE/insurance.html")
  echo "  '$kw': $count"
done

echo ""
echo "=== ENERGY: Top 5 keyword check ==="
for kw in "on-premises AI for energy" "NERC CIP compliant AI" "air-gapped AI for utilities" "local LLM grid" "critical infrastructure AI"; do
  count=$(grep -ci "$kw" "$SITE/energy-utilities.html")
  echo "  '$kw': $count"
done

echo ""
echo "=== GOVERNMENT: Top 5 keyword check ==="
for kw in "on-premises AI for government" "FedRAMP" "air-gapped AI for agencies" "local LLM CUI" "data sovereignty government"; do
  count=$(grep -ci "$kw" "$SITE/government.html")
  echo "  '$kw': $count"
done

echo ""
echo "=== EDUCATION: Top 5 keyword check ==="
for kw in "on-premises AI for schools" "FERPA compliant AI" "air-gapped AI education" "local LLM for universities" "student data privacy AI"; do
  count=$(grep -ci "$kw" "$SITE/education.html")
  echo "  '$kw': $count"
done
```

Most keywords should appear at least once from the page content and enriched schemas. If a top-5 keyword has 0 hits, find a natural place to weave it in using sed.

---

## TASK 5: Full-Site Truncation Verification

Run the master verification from HANDOFF.md across all HTML files:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"
cd "$SITE"

echo "=== TRUNCATION CHECK ==="
for f in *.html blog/*.html; do
  [ "$f" = "googlecff518dc414acaa3.html" ] && continue
  lines=$(wc -l < "$f")
  has_close=$(grep -c '</html>' "$f")
  if [ "$has_close" -eq 0 ]; then
    echo "TRUNCATED: $f ($lines lines, no closing tag)"
  fi
done
echo "Truncation check complete."
```

---

## TASK 6: SEO Completeness Verification

Run the full SEO checklist across all 5 new verticals:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

for page in financial-services.html insurance.html energy-utilities.html government.html education.html; do
  echo "=== $page ==="
  
  # Title tag contains Island Mountain
  title_im=$(grep '<title>' "$SITE/$page" | grep -c 'Island Mountain')
  echo "  Title has Island Mountain: $title_im"
  
  # Meta description exists
  meta=$(grep -c 'meta name="description"' "$SITE/$page")
  echo "  Meta description: $meta"
  
  # Canonical URL
  canonical=$(grep -c 'rel="canonical"' "$SITE/$page")
  echo "  Canonical: $canonical"
  
  # OG tags (minimum 4)
  og=$(grep -c 'og:' "$SITE/$page")
  echo "  OG tags: $og (expect 5+)"
  
  # Twitter Card
  twitter=$(grep -c 'twitter:card' "$SITE/$page")
  echo "  Twitter Card: $twitter"
  
  # Three schemas present
  faq=$(grep -c 'FAQPage' "$SITE/$page")
  bc=$(grep -c 'BreadcrumbList' "$SITE/$page")
  prod=$(grep -c '"Product"' "$SITE/$page")
  echo "  Schemas: FAQPage=$faq BreadcrumbList=$bc Product=$prod"
  
  # AEO block with pricing
  aeo=$(grep -c 'Summary:</strong>' "$SITE/$page")
  aeo_price=$(grep 'Summary:</strong>' "$SITE/$page" | grep -c '\$75')
  echo "  AEO block: $aeo, has pricing: $aeo_price"
  
  # Breadcrumb nav
  breadcrumb=$(grep -c 'class="breadcrumb"' "$SITE/$page")
  echo "  Breadcrumb nav: $breadcrumb"
  
  # Key internal links
  sol=$(grep -c 'solutions.html' "$SITE/$page")
  con=$(grep -c 'contact.html' "$SITE/$page")
  pro=$(grep -c 'products.html' "$SITE/$page")
  echo "  Links: solutions=$sol contact=$con products=$pro"
  
  echo ""
done

echo "=== solutions.html ==="
meta_ten=$(grep 'meta name="description"' "$SITE/solutions.html" | grep -c 'ten\|Ten\|10')
echo "  Meta references 10 verticals: $meta_ten"
og_ten=$(grep 'og:description' "$SITE/solutions.html" | grep -c 'ten\|Ten\|10')
echo "  OG references 10 verticals: $og_ten"
```

---

## TASK 7: Generate Summary Report

After all checks pass, output a summary showing:
1. All 5 pages have 3 JSON-LD schemas (FAQPage, BreadcrumbList, Product)
2. All 5 pages have enriched FAQ answers with brand/GPU/pricing mentions
3. All 5 pages have enhanced AEO blocks with pricing
4. All 5 pages have keyword-optimized H2 headings
5. Cross-links added (list which ones)
6. solutions.html updated to reference 10 verticals
7. Zero truncated files
8. Any remaining gaps or recommendations for future sessions

---

## GIT PUSH

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"; git add -A; git commit -m "SEO Session 4: Cross-links between verticals, entity reinforcement, keyword spot-check, full verification complete"; git push origin main
```
