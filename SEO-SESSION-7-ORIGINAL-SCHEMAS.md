# SEO Session 7: Product JSON-LD Schemas for Original 5 Verticals

**Date:** 2026-05-03
**Scope:** Add Product JSON-LD schema blocks to law-firms.html, medical-practices.html, tribal-nations.html, research-labs.html, and defense-contractors.html.
**Reference:** HANDOFF.md, financial-services.html (as template for Product schema format)
**Prerequisites:** Sessions 1-4 complete (new verticals have Product schemas already).

---

## CRITICAL RULES

1. All 5 target pages are over 530 lines. Use `sed` via bash for EVERY edit. Never use the Edit tool.
2. After EVERY sed command, run: `tail -3 filename` to verify file ends with `</html>`.
3. Find your bash session path first: `ls /sessions/*/mnt/`
4. Set SITE variable: `SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"`
5. Before starting, read HANDOFF.md for full project context.
6. JSON-LD must be valid JSON. Test with: `python3 -c "import json; json.loads(open('file').read().split('application/ld+json\">')[X].split('</script>')[0])"` where X is the schema index (0-based).

---

## THINKING BLOCK

### Why Product Schema Matters

Google uses Product schema to generate rich results in search -- price ranges, availability, brand info. For a B2B hardware company, Product schema signals that this is a purchasable item with concrete specs and pricing, not just an informational page. It differentiates Island Mountain from pure-content competitors (blog posts, comparison sites) in SERPs.

The five new verticals got Product schemas in Sessions 1-3. The original five never did. This creates an inconsistency where some vertical pages generate rich results and others don't.

### Schema Template (From financial-services.html)

Each original vertical needs ONE Product schema block inserted as a third `<script type="application/ld+json">` tag in the `<head>` section, after the existing two (FAQPage and BreadcrumbList).

Template structure:
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Island Mountain Starter — On-Premises AI Server for [VERTICAL]",
  "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable. [COMPLIANCE FRAMEWORK] compliance-ready. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",
  "brand": {
    "@type": "Brand",
    "name": "Island Mountain"
  },
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "75000",
    "highPrice": "400000",
    "priceCurrency": "USD",
    "offerCount": "3"
  },
  "category": "AI Inference Hardware for [VERTICAL]"
}
```

### Vertical-Specific Details

| Page | Name suffix | Description framework | Category suffix |
|------|------------|----------------------|-----------------|
| law-firms.html | "for Law Firms" | "Attorney-client privilege and work product protection-ready" | "Law Firms" |
| medical-practices.html | "for Medical Practices" | "HIPAA and HITECH compliance-ready" | "Healthcare" |
| tribal-nations.html | "for Tribal Nations" | "OCAP principles and data sovereignty-ready" | "Tribal Nations" |
| research-labs.html | "for Research Labs" | "21 CFR Part 11 and IRB compliance-ready" | "Research Laboratories" |
| defense-contractors.html | "for Defense Contractors" | "ITAR, DFARS 252.204-7012, and CMMC compliance-ready" | "Defense Contractors" |

---

## TASK 1: Identify Insertion Points

Find where the second existing schema ends on each page:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

for page in law-firms.html medical-practices.html tribal-nations.html research-labs.html defense-contractors.html; do
  echo "=== $page ==="
  # Find the closing </script> of the second ld+json block
  # The second schema starts at line 73 or 78, find its end
  second_start=$(grep -n 'application/ld+json' "$SITE/$page" | tail -1 | cut -d: -f1)
  # Find the next </script> after that line
  end_line=$(sed -n "${second_start},\$p" "$SITE/$page" | grep -n '</script>' | head -1 | cut -d: -f1)
  actual_end=$((second_start + end_line - 1))
  echo "  Second schema ends at line $actual_end"
  echo ""
done
```

---

## TASK 2: Insert Product Schemas

### law-firms.html

After identifying the insertion line (after the BreadcrumbList schema's closing `</script>`), insert:

```bash
# Find insertion point
INSERT_LINE=$(... determine from Task 1 ...)

sed -i "${INSERT_LINE}a\\
  <script type=\"application/ld+json\">\\
  {\\
    \"@context\": \"https://schema.org\",\\
    \"@type\": \"Product\",\\
    \"name\": \"Island Mountain Starter — On-Premises AI Server for Law Firms\",\\
    \"description\": \"Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable. Attorney-client privilege and work product protection-ready. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.\",\\
    \"brand\": {\\
      \"@type\": \"Brand\",\\
      \"name\": \"Island Mountain\"\\
    },\\
    \"offers\": {\\
      \"@type\": \"AggregateOffer\",\\
      \"lowPrice\": \"75000\",\\
      \"highPrice\": \"400000\",\\
      \"priceCurrency\": \"USD\",\\
      \"offerCount\": \"3\"\\
    },\\
    \"category\": \"AI Inference Hardware for Law Firms\"\\
  }\\
  </script>" "$SITE/law-firms.html"
```

### medical-practices.html

Same structure with:
- name: "Island Mountain Starter — On-Premises AI Server for Medical Practices"
- description: "...HIPAA and HITECH compliance-ready..."
- category: "AI Inference Hardware for Healthcare"

### tribal-nations.html

Same structure with:
- name: "Island Mountain Starter — On-Premises AI Server for Tribal Nations"
- description: "...OCAP principles and tribal data sovereignty-ready..."
- category: "AI Inference Hardware for Tribal Nations"

### research-labs.html

Same structure with:
- name: "Island Mountain Starter — On-Premises AI Server for Research Labs"
- description: "...21 CFR Part 11 and IRB compliance-ready..."
- category: "AI Inference Hardware for Research Laboratories"

### defense-contractors.html

Same structure with:
- name: "Island Mountain Starter — On-Premises AI Server for Defense Contractors"
- description: "...ITAR, DFARS 252.204-7012, and CMMC compliance-ready..."
- category: "AI Inference Hardware for Defense Contractors"

---

## TASK 3: Validate JSON-LD

After insertion, validate each schema is parseable JSON:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

for page in law-firms.html medical-practices.html tribal-nations.html research-labs.html defense-contractors.html; do
  echo "=== $page ==="
  # Extract the third ld+json block and validate
  python3 -c "
import re, json, sys
html = open('$SITE/$page').read()
blocks = re.findall(r'application/ld\+json\">(.*?)</script>', html, re.DOTALL)
if len(blocks) >= 3:
    try:
        data = json.loads(blocks[2])
        if data.get('@type') == 'Product':
            print(f'  VALID Product schema: {data[\"name\"][:60]}')
        else:
            print(f'  WARNING: Third schema is {data.get(\"@type\")}, not Product')
    except json.JSONDecodeError as e:
        print(f'  INVALID JSON: {e}')
else:
    print(f'  Only {len(blocks)} schemas found (expected 3)')
  "
done
```

---

## TASK 4: Truncation + Schema Count Verification

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"
cd "$SITE"

echo "=== TRUNCATION CHECK ==="
for f in law-firms.html medical-practices.html tribal-nations.html research-labs.html defense-contractors.html; do
  has_close=$(grep -c '</html>' "$f")
  [ "$has_close" -eq 0 ] && echo "TRUNCATED: $f"
done

echo ""
echo "=== SCHEMA COUNT ==="
for f in law-firms.html medical-practices.html tribal-nations.html research-labs.html defense-contractors.html; do
  faq=$(grep -c 'FAQPage' "$f")
  bc=$(grep -c 'BreadcrumbList' "$f")
  prod=$(grep -c '"Product"' "$f")
  echo "$f: FAQPage=$faq BreadcrumbList=$bc Product=$prod"
done
echo ""
echo "Expected: FAQPage=2 BreadcrumbList=2 Product=1 for each page"
```

---

## GIT PUSH

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"; git add -A; git commit -m "Session 7: Product JSON-LD schemas added to original 5 verticals (law-firms, medical-practices, tribal-nations, research-labs, defense-contractors)"; git push origin main
```
