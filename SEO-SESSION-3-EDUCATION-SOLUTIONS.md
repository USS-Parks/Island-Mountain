# SEO Session 3: Education + Solutions Hub — Surgical Revisions

**Date:** 2026-05-03
**Scope:** Product schema injection, FAQ answer enrichment, AEO block enhancement, H2 heading optimization for education.html. Plus meta/schema/AEO updates for solutions.html.
**Reference:** VERTICAL-EXPANSION-SEO-AEO.md (sections 6 and 8)

---

## CRITICAL RULES

1. education.html is over 570 lines. Use `sed` via bash for EVERY edit. Never use the Edit tool.
2. solutions.html is 468 lines — also use sed for safety.
3. After EVERY sed command, run: `tail -3 filename` to verify file ends with `</html>`.
4. Find your bash session path first: `ls /sessions/*/mnt/`
5. Set SITE variable: `SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"`
6. Before starting, read HANDOFF.md for full project context.

---

## PART A: EDUCATION.HTML

### TASK 1: Inject Product JSON-LD Schema

education.html has BreadcrumbList `</script>` at line 79 and `</head>` at line 80.

```bash
sed -i '79a\
\
  <!-- Product Schema -->\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "Product",\
    "name": "Island Mountain Starter — On-Premises AI Server for Education",\
    "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable. FERPA-aligned for student data privacy. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",\
    "brand": {\
      "@type": "Brand",\
      "name": "Island Mountain"\
    },\
    "offers": {\
      "@type": "AggregateOffer",\
      "lowPrice": "75000",\
      "highPrice": "400000",\
      "priceCurrency": "USD",\
      "offerCount": "3"\
    },\
    "category": "AI Inference Hardware for Educational Institutions"\
  }\
  </script>' "$SITE/education.html"

tail -3 "$SITE/education.html"
```

### TASK 2: Enrich FAQ Answers — Replace lines 31-66

```bash
sed -i '31,66c\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "FAQPage",\
    "mainEntity": [\
      {\
        "@type": "Question",\
        "name": "Does using cloud AI for student data violate FERPA?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "FERPA (20 U.S.C. section 1232g) protects student education records and restricts disclosure to third parties. The school official exception allows disclosure to contractors performing institutional functions, but requires that the contractor is under direct institutional control, uses the data only for authorized purposes, and meets the institution'"'"'s criteria for handling student records. Cloud AI providers process data on shared commercial infrastructure under their own terms of service, which may not satisfy the direct control requirements of the school official exception. State student privacy laws like California'"'"'s SOPIPA and New York Education Law 2-d add further restrictions. On-premises AI hardware from Island Mountain keeps student education records on campus-controlled servers. No third-party disclosure occurs because no data leaves the institution'"'"'s network. The FERPA compliance question is resolved architecturally rather than contractually."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "What education workflows can run on Island Mountain campus AI hardware?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Island Mountain hardware supports curriculum design and course development assistance, student record summarization and academic advising support, research data analysis for faculty projects, administrative document drafting including accreditation reports, grant proposal and budget narrative development, and assessment and grading assistance. The system runs DeepSeek V4-Flash for complex research analysis and multi-document synthesis, and Llama 3.1 70B for general drafting tasks including curriculum materials and administrative correspondence. All processing occurs on NVIDIA H100 or H200 GPUs on campus with no student data transmitted to external servers."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "How does on-premises AI cost compare to cloud AI for a university?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Cloud AI platforms for education typically cost $20 to $100 per user per month depending on the platform and licensing model. For a department of 30 faculty and staff, that totals $7,200 to $36,000 per year. Campus-wide deployments for 200 or more users can reach $48,000 to $240,000 annually. An Island Mountain Starter system costs $75,000 to $85,000 as a one-time purchase supporting unlimited users on the campus network. The Premium tier with two NVIDIA H200 GPUs costs $350,000 to $400,000 for research-intensive workloads. Ongoing costs after purchase are limited to electricity at approximately $100 to $200 per month. For most university departments, the on-premises system reaches cost parity with cloud subscriptions within 12 to 24 months while eliminating third-party handling of student records entirely."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "Does a school need dedicated IT staff to run on-premises AI hardware?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "No. Island Mountain systems ship pre-configured with all models installed and the OpenWebUI browser-based interface ready for use. Faculty and staff access it through any web browser on the campus network. Initial setup requires racking the server, connecting a 208V 30A power circuit, and plugging in an ethernet cable. Island Mountain provides 30 days of hands-on setup support. Ongoing maintenance involves standard Linux server administration and occasional model updates. Most institutions with existing campus IT departments can integrate the system into their server management workflow without hiring additional staff. K-12 districts that use managed service providers can include the AI server in their existing service agreements."\
        }\
      }\
    ]\
  }\
  </script>' "$SITE/education.html"

tail -3 "$SITE/education.html"
```

**IMPORTANT:** Line numbers shift after this. Re-check with `grep -n` before Tasks 3 and 4.

### TASK 3: Enhance AEO Summary Block

Find:
```
<strong>Summary:</strong> On-premises AI inference hardware keeps student education records on campus-controlled servers. No cloud transmission, no third-party data exposure, and full alignment with FERPA's school official exception for AI processing of student data.
```

Replace with:
```
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for K-12 schools, community colleges, and universities. Student education records stay on campus-controlled NVIDIA H100/H200 servers -- no cloud transmission, no third-party data handling, and full alignment with FERPA's school official exception. Systems start at $75,000 with air-gap capability and unlimited campus-wide access.
```

```bash
sed -i "s|<strong>Summary:</strong> On-premises AI inference hardware keeps student education records on campus-controlled servers. No cloud transmission, no third-party data exposure, and full alignment with FERPA's school official exception for AI processing of student data.|<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for K-12 schools, community colleges, and universities. Student education records stay on campus-controlled NVIDIA H100/H200 servers -- no cloud transmission, no third-party data handling, and full alignment with FERPA's school official exception. Systems start at \$75,000 with air-gap capability and unlimited campus-wide access.|" "$SITE/education.html"

tail -3 "$SITE/education.html"
```

### TASK 4: Optimize H2 Headings

```bash
# "What Local AI Actually Means for Your Organization" -> "What On-Premises AI Means for Your Campus"
sed -i 's|<h2>What Local AI Actually Means for Your Organization</h2>|<h2>What On-Premises AI Means for Your Campus</h2>|' "$SITE/education.html"

# "Workflows Island Mountain Hardware Supports" -> "Campus Workflows Island Mountain Hardware Supports"
sed -i 's|<h2>Workflows Island Mountain Hardware Supports</h2>|<h2>Campus Workflows Island Mountain Hardware Supports</h2>|' "$SITE/education.html"

# "Which Models Work Best" -> "Which Models Work Best for Education Tasks"
sed -i 's|<h2>Which Models Work Best</h2>|<h2>Which Models Work Best for Education Tasks</h2>|' "$SITE/education.html"

# "Cloud AI vs. Island Mountain for an Educational Institution" -> "Cloud AI vs. Island Mountain for a University Department"
sed -i 's|<h2>Cloud AI vs. Island Mountain for an Educational Institution</h2>|<h2>Cloud AI vs. Island Mountain for a University Department</h2>|' "$SITE/education.html"

# "FERPA, COPPA, and Student Data Protection" -> "FERPA, COPPA, and the School Official Exception"
sed -i 's|<h2>FERPA, COPPA, and Student Data Protection</h2>|<h2>FERPA, COPPA, and the School Official Exception</h2>|' "$SITE/education.html"

# "Questions Educational Institutions Ask" -> "Questions Educators Ask About On-Premises AI"
sed -i 's|<h2>Questions Educational Institutions Ask</h2>|<h2>Questions Educators Ask About On-Premises AI</h2>|' "$SITE/education.html"

tail -3 "$SITE/education.html"
```

---

## PART B: SOLUTIONS.HTML UPDATES

solutions.html is the hub page linking all 10 industry verticals. Its meta tags and schema still reference only the original 5. These edits bring it current.

### TASK 5: Update Meta Description

Find the current meta description (references only 5 verticals):
```
content="On-premises AI inference hardware built for organizations where data sovereignty is non-negotiable. Law firms, medical practices, tribal nations, research labs, and defense contractors."
```

Replace with:
```
content="On-premises AI inference hardware built for organizations where data sovereignty is non-negotiable. Ten regulated industries: law, healthcare, tribal nations, research, defense, finance, insurance, energy, government, and education."
```

```bash
sed -i 's|content="On-premises AI inference hardware built for organizations where data sovereignty is non-negotiable. Law firms, medical practices, tribal nations, research labs, and defense contractors."|content="On-premises AI inference hardware built for organizations where data sovereignty is non-negotiable. Ten regulated industries: law, healthcare, tribal nations, research, defense, finance, insurance, energy, government, and education."|' "$SITE/solutions.html"

tail -3 "$SITE/solutions.html"
```

### TASK 6: Update Title Tag

Find the current title. Then check if it needs updating:
```bash
grep '<title>' "$SITE/solutions.html"
```

If the title does not mention the new verticals or "ten industries," update it:
```bash
# Only run if title needs updating
sed -i 's|<title>AI Solutions for Regulated Industries | Island Mountain</title>|<title>AI Solutions for Regulated Industries | HIPAA, ITAR, GLBA, NERC CIP, FERPA | Island Mountain</title>|' "$SITE/solutions.html"
```

### TASK 7: Update OG Description

```bash
sed -i 's|<meta property="og:description" content="On-premises AI inference hardware built for organizations where data sovereignty is non-negotiable. Law firms, medical practices, tribal nations, research labs, and defense contractors.">|<meta property="og:description" content="On-premises AI inference hardware built for organizations where data sovereignty is non-negotiable. Ten regulated industries served with air-gap-capable NVIDIA H100/H200 systems.">|' "$SITE/solutions.html"
```

### TASK 8: Update FAQPage Schema Answer

Find the FAQ answer that says "five primary regulated sectors" or lists only the original 5, and replace with all 10. Use grep to locate first:

```bash
grep -n 'five\|five primary\|regulated sectors' "$SITE/solutions.html"
```

Then replace the answer text to include all 10 verticals. The target answer text:

```
Island Mountain builds on-premises AI inference hardware for ten regulated sectors: law firms protecting attorney-client privilege, medical practices meeting HIPAA technical safeguards, tribal nations maintaining data sovereignty under OCAP and CARE principles, research labs protecting unpublished data and meeting grant compliance requirements, defense contractors satisfying ITAR export controls and CMMC requirements, financial institutions complying with GLBA and PCI DSS, insurance carriers protecting policyholder data under HIPAA and NAIC model laws, energy and utility companies meeting NERC CIP and IEC 62443 critical infrastructure requirements, government agencies handling CUI under NIST SP 800-171 and FISMA, and educational institutions protecting student records under FERPA. Each industry page details the specific compliance framework and how local AI deployment addresses it.
```

Use sed with the specific old text found by grep.

### TASK 9: Update AEO Summary Block on solutions.html

Find the current AEO block (grep for `Summary:</strong>` in solutions.html) and replace with:

```
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for ten regulated industries: law firms, medical practices, tribal nations, research labs, defense contractors, financial institutions, insurance carriers, energy and utility companies, government agencies, and educational institutions. Each faces the same structural problem with cloud AI -- data transmitted to third-party servers creates compliance risk that contractual protections cannot fully resolve. Local deployment eliminates that transmission.
```

---

## VERIFICATION

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

echo "=== education.html ==="
lines=$(wc -l < "$SITE/education.html")
has_close=$(grep -c '</html>' "$SITE/education.html")
echo "Lines: $lines, Has </html>: $has_close"
prod=$(grep -c '"Product"' "$SITE/education.html")
echo "Product schema: $prod (expect 1)"
aeo_price=$(grep -c '\$75,000' "$SITE/education.html")
echo "AEO has pricing: $aeo_price (expect 1+)"
echo "H2 headings:"
grep '<h2>' "$SITE/education.html"

echo ""
echo "=== solutions.html ==="
lines=$(wc -l < "$SITE/solutions.html")
has_close=$(grep -c '</html>' "$SITE/solutions.html")
echo "Lines: $lines, Has </html>: $has_close"
echo "Meta description:"
grep 'meta name="description"' "$SITE/solutions.html"
echo "OG description:"
grep 'og:description' "$SITE/solutions.html"
echo "AEO block:"
grep -A2 'Summary:</strong>' "$SITE/solutions.html"
echo "FAQ mentions 'ten':"
grep -c 'ten regulated' "$SITE/solutions.html"
```

---

## GIT PUSH

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"; git add -A; git commit -m "SEO Session 3: Education Product schema + enriched FAQs + enhanced AEO + optimized H2s. Solutions hub meta/schema/AEO updated to 10 verticals"; git push origin main
```
