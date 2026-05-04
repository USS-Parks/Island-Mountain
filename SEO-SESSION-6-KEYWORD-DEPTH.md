# SEO Session 6: Remaining 75 Long-Tail Keywords (5 New Verticals)

**Date:** 2026-05-03
**Scope:** Place remaining 15 keywords per vertical (keywords #6-20) across all 5 new vertical pages. Top 5 already placed in Session 4.
**Reference:** VERTICAL-EXPANSION-SEO-AEO.md (keyword-to-section maps in sections for each vertical)
**Prerequisites:** Sessions 1-5 complete.

---

## CRITICAL RULES

1. All vertical pages are over 570 lines. Use `sed` via bash for EVERY edit. Never use the Edit tool.
2. After EVERY batch of sed commands (every 3-5 edits), run: `tail -3 filename` to verify file ends with `</html>`.
3. Find your bash session path first: `ls /sessions/*/mnt/`
4. Set SITE variable: `SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"`
5. Before starting, read HANDOFF.md for full project context.
6. NEVER force a keyword where it reads unnaturally. Skip rather than stuff.
7. Read VERTICAL-EXPANSION-SEO-AEO.md for the complete keyword maps with target sections and placement type.

---

## THINKING BLOCK

### Why This Matters

Long-tail keywords capture the specific search queries that lead to conversion. "on-premises AI for banks" is a top-5 keyword that brings awareness traffic. But "on-prem AI for fraud detection" or "local AI loan document review" captures a searcher who already knows their use case and is looking for a solution. Those people convert.

The keyword maps in VERTICAL-EXPANSION-SEO-AEO.md specify not just the keyword but WHERE it belongs on the page (which section, which card, which paragraph). This is intentional -- the placement ensures the keyword appears in a semantically relevant context that Google associates with topical authority.

### Strategy: Batch by Section Type

Rather than going keyword by keyword (75 individual sed commands = high error rate), batch by section type:

1. **Workflow cards** (keywords targeting headings/text of feature cards)
2. **Model Selection cards** (keywords about specific GPUs/models in context)
3. **Comparison table** (keywords that belong in the TCO comparison section)
4. **Regulatory Context paragraphs** (keywords about compliance frameworks)
5. **FAQ answers** (keywords that naturally fit in FAQ responses -- some already placed in Session 4/5)
6. **Testimonials** (keywords woven into testimonial text)
7. **Meta + AEO** (keywords that belong in meta tags or AEO blocks)

### Keyword Density Target

After Session 6, each page should have:
- All 20 mapped keywords appearing at least once (5 from Session 4 + 15 from this session)
- No keyword appearing more than 3 times (avoid over-optimization penalty)
- Keywords distributed across at least 5 different page sections

### Risk: Over-Optimization

Google's helpful content system penalizes pages that feel keyword-stuffed. Guard against this by:
- Placing keywords only where the content already discusses that topic
- Using natural sentence structure around the keyword
- Ensuring at least 50 words of organic content between any two keyword insertions
- NEVER inserting a keyword into the JSON-LD schema unless the keyword naturally fits the answer

---

## TASK 1: Audit Current Keyword Presence

Before placing keywords, check which ones might already be present (from page creation or Sessions 1-4):

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

echo "=== FINANCIAL-SERVICES: Keywords 6-20 audit ==="
for kw in "NVIDIA H100 bank" "PCI DSS AI" "on-prem AI for fraud detection" "data-sovereign AI finance" "air-gap GPU server banking" "local AI loan document" "banking AI without cloud" "financial data privacy AI" "on-premise AI for investment" "secure AI for SOX" "local deepseek for banks" "on-prem LLM for KYC" "nvidia h200 for finance" "air-gapped inference credit union" "local AI for mortgage"; do
  count=$(grep -ci "$kw" "$SITE/financial-services.html")
  [ "$count" -gt 0 ] && echo "  PRESENT ($count): $kw" || echo "  MISSING: $kw"
done

echo ""
echo "=== INSURANCE: Keywords 6-20 audit ==="
for kw in "NVIDIA H100 insurance" "data sovereignty insurance" "on-prem AI fraud detection insurance" "local AI for policy review" "insurance AI without cloud" "NAIC model law AI" "air-gap GPU server insurance" "local AI for actuarial" "on-premise AI for P&C" "secure AI for customer PII" "local llama for insurance" "on-prem LLM for claims" "nvidia h200 for insurance" "air-gapped inference insurance" "local AI for life insurance"; do
  count=$(grep -ci "$kw" "$SITE/insurance.html")
  [ "$count" -gt 0 ] && echo "  PRESENT ($count): $kw" || echo "  MISSING: $kw"
done

echo ""
echo "=== ENERGY: Keywords 6-20 audit ==="
for kw in "NVIDIA H100 SCADA" "critical infrastructure AI on-prem" "on-prem AI for predictive maintenance" "air-gap GPU server energy" "local AI for oil and gas" "data-sovereign AI utilities" "energy AI without cloud" "IEC 62443 AI" "on-premise AI for renewable" "secure AI for substation" "local deepseek for utilities" "on-prem LLM for FERC" "nvidia h200 for grid" "air-gapped inference energy" "local AI for pipeline monitoring"; do
  count=$(grep -ci "$kw" "$SITE/energy-utilities.html")
  [ "$count" -gt 0 ] && echo "  PRESENT ($count): $kw" || echo "  MISSING: $kw"
done

echo ""
echo "=== GOVERNMENT: Keywords 6-20 audit ==="
for kw in "NVIDIA H100 government" "data sovereignty government" "on-prem AI for document review" "local AI for citizen services" "government AI without cloud" "CUI compliant AI" "air-gap GPU server federal" "local AI for policy analysis" "on-premise AI for state government" "secure AI for law enforcement" "local deepseek for government" "on-prem LLM for FOIA" "nvidia h200 for defense civilian" "air-gapped inference government" "local AI for classified"; do
  count=$(grep -ci "$kw" "$SITE/government.html")
  [ "$count" -gt 0 ] && echo "  PRESENT ($count): $kw" || echo "  MISSING: $kw"
done

echo ""
echo "=== EDUCATION: Keywords 6-20 audit ==="
for kw in "NVIDIA H100 campus" "student data privacy AI" "on-prem AI for research" "local AI for grading" "education AI without cloud" "FERPA school official" "air-gap GPU server college" "local AI for curriculum" "on-premise AI for edtech" "secure AI for student records" "local deepseek for higher ed" "on-prem LLM for admissions" "nvidia h200 for research" "air-gapped inference university" "local AI for campus security"; do
  count=$(grep -ci "$kw" "$SITE/education.html")
  [ "$count" -gt 0 ] && echo "  PRESENT ($count): $kw" || echo "  MISSING: $kw"
done
```

---

## TASK 2: Place Keywords by Section Type

### Phase 2A: Workflow Card Keywords

Each vertical has 6 workflow cards with `<h3>` headings and `<p>` descriptions. Many keywords target these cards.

**Strategy:** Find each workflow card by its heading text, then weave the keyword into either the heading or the description paragraph.

```bash
# Find workflow card headings
grep -n '<h3>' "$SITE/financial-services.html" | head -10
```

**Financial-services workflow keywords to place:**
- #8: "on-prem AI for fraud detection" → Workflows card 4 heading
- #11: "local AI loan document review" → Workflows card 1 heading
- #14: "on-premise AI for investment firms" → Workflows card 6
- #17: "on-prem LLM for KYC/AML" → Workflows card 2 heading
- #20: "local AI for mortgage processing" → Workflows card 1 text

**Insurance workflow keywords:**
- #8: "on-prem AI fraud detection insurance" → Workflows card 3 heading
- #9: "local AI for policy review" → Workflows card 4 heading
- #13: "local AI for actuarial analysis" → Workflows card 5 text
- #17: "on-prem LLM for claims" → Workflows card 1 text

**Energy workflow keywords:**
- #8: "on-prem AI for predictive maintenance" → Workflows card 1 heading
- #10: "local AI for oil and gas" → Workflows card 4
- #15: "secure AI for substation data" → Workflows card 2
- #17: "on-prem LLM for FERC compliance" → Workflows card 3
- #20: "local AI for pipeline monitoring" → Workflows card 4 heading

**Government workflow keywords:**
- #8: "on-prem AI for document review" → Workflows card 1 heading
- #9: "local AI for citizen services" → Workflows card 4 heading
- #13: "local AI for policy analysis" → Workflows card 3 heading
- #17: "on-prem LLM for FOIA" → Workflows card 2 heading

**Education workflow keywords:**
- #9: "local AI for grading" → Workflows card 6
- #13: "local AI for curriculum design" → Workflows card 1 heading
- #15: "secure AI for student records" → Workflows card 2

### Phase 2B: Model Selection / GPU Keywords

These keywords reference specific GPU models and belong in the Model Selection section or comparison table.

**Pattern:** Find the Model Selection section, locate the DeepSeek or Llama card, and add the keyword naturally.

- Financial #6: "NVIDIA H100 bank AI" → Model Selection section
- Financial #16: "local deepseek for banks" → DeepSeek card
- Financial #18: "nvidia h200 for finance" → Comparison table Premium row
- Insurance #6: "NVIDIA H100 insurance AI" → Model Selection
- Insurance #16: "local llama for insurance" → Llama card
- Insurance #18: "nvidia h200 for insurance" → Comparison table
- Energy #6: "NVIDIA H100 SCADA AI" → Model Selection
- Energy #16: "local deepseek for utilities" → DeepSeek card
- Energy #18: "nvidia h200 for grid operations" → Comparison table
- Government #6: "NVIDIA H100 government AI" → Model Selection
- Government #16: "local deepseek for government" → DeepSeek card
- Government #18: "nvidia h200 for defense civilian" → Comparison table
- Education #6: "NVIDIA H100 campus AI" → Model Selection
- Education #16: "local deepseek for higher ed" → DeepSeek card
- Education #18: "nvidia h200 for research labs" → Comparison table

### Phase 2C: Problem Section / Body Text Keywords

Keywords that belong in the introductory "The Problem" section paragraphs.

- Financial #9: "data-sovereign AI finance" → How It Works card 1
- Financial #12: "banking AI without cloud" → Problem section p3
- Financial #13: "financial data privacy AI" → Problem section p1
- Insurance #7: "data sovereignty insurance" → How It Works card 1
- Insurance #10: "insurance AI without cloud" → Problem section p3
- Insurance #14: "on-premise AI for P&C insurers" → Problem section p2
- Insurance #20: "local AI for life insurance" → Problem section p2
- Energy #7: "critical infrastructure AI on-prem" → Problem p1
- Energy #11: "data-sovereign AI utilities" → How It Works card 1
- Energy #12: "energy AI without cloud" → Problem p3
- Energy #14: "on-premise AI for renewable energy" → Workflows card 4
- Government #5 (already placed): "private AI for public sector"
- Government #10: "government AI without cloud" → Problem p3
- Government #14: "on-premise AI for state government" → Problem p3
- Government #15: "secure AI for law enforcement" → Problem p2
- Education #10: "education AI without cloud" → Problem p3
- Education #14: "on-premise AI for edtech" → Problem p3

### Phase 2D: Regulatory Context Keywords

- Financial #7: "PCI DSS AI compliance" → Regulatory Context p2
- Financial #15: "secure AI for SOX compliance" → Regulatory Context p3
- Insurance #11: "NAIC model law AI compliance" → Regulatory Context p2
- Energy #13: "IEC 62443 AI server" → Regulatory Context p2
- Government #11: "CUI compliant AI server" → Regulatory Context p1
- Education #11: "FERPA school official AI" → Regulatory Context p1

### Phase 2E: How It Works / Air-Gap Keywords

- Financial #10: "air-gap GPU server banking" → How It Works card 3
- Insurance #12: "air-gap GPU server insurance" → How It Works card 3
- Insurance #19: "air-gapped inference insurance" → How It Works intro
- Energy #9: "air-gap GPU server energy" → How It Works card 3
- Energy #19: "air-gapped inference energy" → How It Works intro
- Government #12: "air-gap GPU server federal" → How It Works card 3
- Government #19: "air-gapped inference government" → How It Works intro
- Education #12: "air-gap GPU server college" → How It Works card 3
- Education #19: "air-gapped inference university" → How It Works intro

### Phase 2F: Limitations / Testimonials / CTA

- Financial #19: "air-gapped inference credit union" → Testimonials
- Insurance #15: "secure AI for customer PII" → Limitations
- Government #20: "local AI for classified data" → Limitations card 3 (honest: NOT SCIF-rated)
- Education #20: "local AI for campus security" → Limitations (brief mention)

---

## TASK 3: Verification

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"
cd "$SITE"

# Truncation check
echo "=== TRUNCATION ==="
for f in financial-services.html insurance.html energy-utilities.html government.html education.html; do
  has_close=$(grep -c '</html>' "$f")
  [ "$has_close" -eq 0 ] && echo "TRUNCATED: $f"
done
echo "Truncation check done."

echo ""
echo "=== KEYWORD COUNT PER PAGE ==="
for page in financial-services.html insurance.html energy-utilities.html government.html education.html; do
  total=0
  # Count keywords 6-20 for this page from the audit script above
  echo "$page: run full audit to count placed keywords"
done
```

After all placements, re-run the full 20-keyword audit from Task 1. Target: all 20 keywords present on each page (5 from Session 4 + 15 from this session). Some may legitimately be skipped if no natural placement exists.

---

## GIT PUSH

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"; git add -A; git commit -m "Session 6: 75 long-tail keywords placed across 5 new verticals (keywords 6-20 per VERTICAL-EXPANSION-SEO-AEO.md)"; git push origin main
```
