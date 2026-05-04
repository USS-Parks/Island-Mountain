# SEO Session 1: Financial Services + Insurance — Surgical Revisions

**Date:** 2026-05-03
**Scope:** Product schema injection, FAQ answer enrichment, AEO block enhancement, H2 heading optimization for financial-services.html and insurance.html.
**Reference:** VERTICAL-EXPANSION-SEO-AEO.md (sections 2 and 3)

---

## CRITICAL RULES

1. Both files are over 570 lines. Use `sed` via bash for EVERY edit. Never use the Edit tool.
2. After EVERY sed command, run: `tail -3 filename` to verify file ends with `</html>`.
3. Find your bash session path first: `ls /sessions/*/mnt/`
4. Set SITE variable: `SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"`
5. Before starting, read HANDOFF.md for full project context.

---

## TASK 1: Inject Product JSON-LD Schema

Both pages have BreadcrumbList `</script>` at line 79 and `</head>` at line 80. Insert a new Product schema block between them.

### financial-services.html

```bash
sed -i '79a\
\
  <!-- Product Schema -->\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "Product",\
    "name": "Island Mountain Starter — On-Premises AI Server for Financial Services",\
    "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable. GLBA and PCI DSS compliance-ready. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",\
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
    "category": "AI Inference Hardware for Financial Services"\
  }\
  </script>' "$SITE/financial-services.html"

tail -3 "$SITE/financial-services.html"
```

### insurance.html

```bash
sed -i '79a\
\
  <!-- Product Schema -->\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "Product",\
    "name": "Island Mountain Starter — On-Premises AI Server for Insurance",\
    "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable. HIPAA and NAIC compliance-ready. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",\
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
    "category": "AI Inference Hardware for Insurance"\
  }\
  </script>' "$SITE/insurance.html"

tail -3 "$SITE/insurance.html"
```

---

## TASK 2: Enrich FAQ Answers

Replace the existing FAQPage JSON-LD blocks (lines 31-66 on both pages) with enriched versions. The enriched answers are longer, include specific regulatory citations, mention "Island Mountain" by name, reference GPU models, and include pricing.

### financial-services.html — Replace lines 31-66

```bash
sed -i '31,66c\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "FAQPage",\
    "mainEntity": [\
      {\
        "@type": "Question",\
        "name": "Does using cloud AI for banking operations create GLBA compliance risk?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "When a financial institution transmits non-public personal information (NPI) to a cloud AI provider for processing, that data leaves the institution'"'"'s security perimeter and enters third-party infrastructure. The Gramm-Leach-Bliley Act Safeguards Rule (16 CFR Part 314) requires financial institutions to develop, implement, and maintain a comprehensive information security program that protects customer NPI. Cloud AI processing creates a structural dependency on the vendor'"'"'s security posture for GLBA compliance. PCI DSS v4.0 adds further requirements for cardholder data environments. On-premises AI hardware from Island Mountain eliminates this transmission entirely. NPI stays on servers inside your facility, under your physical and logical security controls, with no third-party data handling dependency. The GLBA compliance question shifts from evaluating a vendor'"'"'s security program to controlling your own."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "What AI workflows can a bank or credit union run on Island Mountain hardware?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Island Mountain hardware supports loan document review and risk assessment, KYC and AML compliance analysis, fraud detection and investigation support, regulatory reporting and compliance drafting, customer communication and disclosure generation, and investment analysis and portfolio documentation. The system runs DeepSeek V4-Flash for complex analytical tasks like multi-document regulatory review and loan portfolio assessment, and Llama 3.1 70B for general drafting including customer correspondence and compliance memoranda. All processing happens on NVIDIA H100 or H200 GPUs inside your facility with no data transmitted to external servers."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "How does the cost of on-premises AI compare to cloud AI for a financial institution with 50 users?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Cloud AI subscriptions for financial services platforms typically cost $50 to $200 per user per month. For 50 users, that totals $30,000 to $120,000 per year. Over three years, cumulative cloud costs reach $90,000 to $360,000 with no ownership and continued NPI exposure on every query. An Island Mountain Starter system with two NVIDIA H100 GPUs costs $75,000 to $85,000 as a one-time purchase. Ongoing costs are limited to electricity at approximately $100 to $200 per month. For institutions with 50 or more users, the local system reaches cost parity with mid-tier cloud subscriptions within the first year while eliminating GLBA and PCI DSS compliance risk from AI operations entirely. The system is Section 179 eligible for full first-year depreciation."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "Does a bank need dedicated IT staff to run on-premises AI hardware?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "No. Island Mountain systems ship pre-configured with all models installed and the OpenWebUI browser-based interface ready to use. Your staff accesses it through a web browser on your internal network, the same way they would access any internal application. Initial setup requires racking the server in your data center or server closet, connecting a 208V 30A power circuit, and plugging in an ethernet cable. Island Mountain includes 30 days of hands-on setup support. Ongoing maintenance involves standard Linux security updates and occasional model updates. Most financial institutions with existing IT staff or a managed service provider can maintain the system alongside their other infrastructure without dedicated AI personnel."\
        }\
      }\
    ]\
  }\
  </script>' "$SITE/financial-services.html"

tail -3 "$SITE/financial-services.html"
```

### insurance.html — Replace lines 31-66

```bash
sed -i '31,66c\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "FAQPage",\
    "mainEntity": [\
      {\
        "@type": "Question",\
        "name": "Does using cloud AI create HIPAA risk for health insurance carriers?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Health insurers process protected health information (PHI) subject to HIPAA'"'"'s Security Rule. When PHI is transmitted to a cloud AI provider for processing, that provider becomes a business associate requiring a Business Associate Agreement (BAA). Even with a BAA, the structural risk remains: PHI is processed on third-party infrastructure outside the insurer'"'"'s direct security controls. Not all AI providers offer BAAs, and those that do still process data on shared commercial infrastructure. The NAIC Insurance Data Security Model Law adds state-level requirements for information security programs. On-premises AI hardware from Island Mountain eliminates the business associate dependency entirely. PHI and policyholder PII stay on servers inside your facility under your security program. No BAA required because no third-party data handling occurs."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "What insurance workflows can run on Island Mountain on-premises AI hardware?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Island Mountain hardware supports claims processing and adjudication assistance, underwriting analysis and risk assessment, fraud detection and investigation support, policy document review and comparison, actuarial analysis documentation, and policyholder correspondence drafting. The system runs DeepSeek V4-Flash for complex multi-document analysis like claims investigation and underwriting assessment, and Llama 3.1 70B for general drafting tasks including policyholder communications and compliance memos. All data processing occurs on NVIDIA H100 or H200 GPUs inside your facility. No policyholder information is transmitted to external servers."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "How does on-premises AI cost compare to cloud AI for a 30-person insurance office?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Cloud AI platforms for insurance typically cost $50 to $200 per user per month. For 30 users, that is $18,000 to $72,000 per year in subscription fees with no ownership and continued data exposure on every query. Over three years, cumulative cloud costs reach $54,000 to $216,000. An Island Mountain Starter system costs $75,000 to $85,000 as a one-time purchase with two NVIDIA H100 GPUs. After purchase, the only ongoing cost is electricity at approximately $100 to $200 per month. For a 30-person office, the on-premises system reaches cost parity with mid-tier cloud subscriptions within 18 to 24 months while eliminating all third-party data handling of policyholder information. The hardware is Section 179 eligible for full first-year depreciation."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "Does an insurance carrier need dedicated IT staff to operate on-premises AI?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "No. Island Mountain systems are pre-configured and burn-tested before shipping. Staff access the AI through a web browser on your internal network using the OpenWebUI interface. No specialized AI knowledge is required. Setup requires placing the server in your data center, connecting 208V 30A power and ethernet, and opening a browser. Island Mountain provides 30 days of hands-on setup support. Ongoing maintenance involves standard Linux server administration and occasional model updates through the web interface. Most insurance carriers with existing IT staff or a managed service provider handle this alongside their other infrastructure without dedicated AI personnel."\
        }\
      }\
    ]\
  }\
  </script>' "$SITE/insurance.html"

tail -3 "$SITE/insurance.html"
```

**IMPORTANT:** After the FAQ replacement, the line numbers for the rest of the file will shift. Re-check line numbers before doing Tasks 3 and 4. Run `grep -n 'Summary:</strong>' filename` and `grep -n '<h2>' filename` to get current line numbers.

---

## TASK 3: Enhance AEO Summary Blocks

Find the current AEO blocks and replace with enriched versions that include pricing, GPU names, and product details.

### financial-services.html

Find this exact text:
```
<strong>Summary:</strong> Local AI infrastructure keeps non-public personal information inside your institution's network, eliminating the third-party data transmission that creates GLBA and PCI DSS compliance risk when using cloud AI services.
```

Replace with:
```
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for banks, credit unions, and investment firms. Local deployment keeps non-public personal information inside your institution's network, eliminating the third-party data transmission that creates GLBA and PCI DSS compliance risk when using cloud AI services. Systems start at $75,000 with NVIDIA H100 GPUs, air-gap capability, and zero per-token fees.
```

```bash
sed -i 's|<strong>Summary:</strong> Local AI infrastructure keeps non-public personal information inside your institution'"'"'s network, eliminating the third-party data transmission that creates GLBA and PCI DSS compliance risk when using cloud AI services.|<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for banks, credit unions, and investment firms. Local deployment keeps non-public personal information inside your institution'"'"'s network, eliminating the third-party data transmission that creates GLBA and PCI DSS compliance risk when using cloud AI services. Systems start at $75,000 with NVIDIA H100 GPUs, air-gap capability, and zero per-token fees.|' "$SITE/financial-services.html"

tail -3 "$SITE/financial-services.html"
```

### insurance.html

Find:
```
<strong>Summary:</strong> Local AI infrastructure keeps policyholder data -- including health records, financial information, and claims history -- inside your institution's network. No cloud transmission, no BAA dependency, no third-party data exposure.
```

Replace with:
```
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for insurance carriers. Process claims, underwriting, and fraud detection on NVIDIA H100/H200 servers you own. Policyholder PII and protected health information stay inside your network -- no cloud transmission, no BAA dependency, no third-party data exposure. Systems start at $75,000 with air-gap capability and unlimited inference.
```

```bash
sed -i 's|<strong>Summary:</strong> Local AI infrastructure keeps policyholder data -- including health records, financial information, and claims history -- inside your institution'"'"'s network. No cloud transmission, no BAA dependency, no third-party data exposure.|<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for insurance carriers. Process claims, underwriting, and fraud detection on NVIDIA H100/H200 servers you own. Policyholder PII and protected health information stay inside your network -- no cloud transmission, no BAA dependency, no third-party data exposure. Systems start at $75,000 with air-gap capability and unlimited inference.|' "$SITE/insurance.html"

tail -3 "$SITE/insurance.html"
```

---

## TASK 4: Optimize H2 Headings

Use sed to add keyword phrases to H2 headings. These are surgical single-line replacements.

### financial-services.html

```bash
# "What Local AI Actually Means" -> "What On-Premises AI Actually Means for Your Institution"
sed -i 's|<h2>What Local AI Actually Means for Your Organization</h2>|<h2>What On-Premises AI Actually Means for Your Institution</h2>|' "$SITE/financial-services.html"

# "Workflows Island Mountain Hardware Supports" -> "AI Workflows Island Mountain Hardware Supports"
sed -i 's|<h2>Workflows Island Mountain Hardware Supports</h2>|<h2>AI Workflows Island Mountain Hardware Supports</h2>|' "$SITE/financial-services.html"

# "Which Models Work Best" -> "Which Models Work Best for Financial Tasks"
sed -i 's|<h2>Which Models Work Best</h2>|<h2>Which Models Work Best for Financial Tasks</h2>|' "$SITE/financial-services.html"

# "Questions Financial Institutions Ask" -> "Questions Financial Institutions Ask About Local AI"
sed -i 's|<h2>Questions Financial Institutions Ask</h2>|<h2>Questions Financial Institutions Ask About Local AI</h2>|' "$SITE/financial-services.html"

tail -3 "$SITE/financial-services.html"
```

### insurance.html

```bash
# "The Cloud AI Problem for Insurers" -> "The Cloud AI Problem for Insurance Carriers"
sed -i 's|<h2>The Cloud AI Problem for Insurers</h2>|<h2>The Cloud AI Problem for Insurance Carriers</h2>|' "$SITE/insurance.html"

# "What Local AI Actually Means for Your Organization" -> "What On-Premises AI Means for Your Organization"
sed -i 's|<h2>What Local AI Actually Means for Your Organization</h2>|<h2>What On-Premises AI Means for Your Organization</h2>|' "$SITE/insurance.html"

# "Workflows Island Mountain Hardware Supports" -> "Insurance Workflows Island Mountain Hardware Supports"
sed -i 's|<h2>Workflows Island Mountain Hardware Supports</h2>|<h2>Insurance Workflows Island Mountain Hardware Supports</h2>|' "$SITE/insurance.html"

# "Which Models Work Best" -> "Which Models Work Best for Insurance Tasks"
sed -i 's|<h2>Which Models Work Best</h2>|<h2>Which Models Work Best for Insurance Tasks</h2>|' "$SITE/insurance.html"

# "HIPAA, NAIC Model Laws, and Insurance Data Protection" -> "HIPAA, NAIC Model Laws, and the Case for Local AI"
sed -i 's|<h2>HIPAA, NAIC Model Laws, and Insurance Data Protection</h2>|<h2>HIPAA, NAIC Model Laws, and the Case for Local AI</h2>|' "$SITE/insurance.html"

# "Questions Insurance Carriers Ask" -> "Questions Insurance Organizations Ask About Local AI"
sed -i 's|<h2>Questions Insurance Carriers Ask</h2>|<h2>Questions Insurance Organizations Ask About Local AI</h2>|' "$SITE/insurance.html"

tail -3 "$SITE/insurance.html"
```

---

## VERIFICATION

After all edits, run this verification:

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

for page in financial-services.html insurance.html; do
  echo "=== $page ==="
  
  # File integrity
  lines=$(wc -l < "$SITE/$page")
  has_close=$(grep -c '</html>' "$SITE/$page")
  echo "Lines: $lines, Has </html>: $has_close"
  
  # Product schema present
  prod=$(grep -c '"Product"' "$SITE/$page")
  echo "Product schema: $prod (expect 1)"
  
  # FAQPage schema present
  faq=$(grep -c 'FAQPage' "$SITE/$page")
  echo "FAQPage refs: $faq (expect 2)"
  
  # BreadcrumbList present
  bc=$(grep -c 'BreadcrumbList' "$SITE/$page")
  echo "BreadcrumbList: $bc (expect 2)"
  
  # AEO block has pricing
  aeo_price=$(grep -c '\$75,000' "$SITE/$page")
  echo "AEO has pricing: $aeo_price (expect 1+)"
  
  # Island Mountain in FAQ answers
  im_faq=$(grep -c '"Island Mountain"' "$SITE/$page")
  echo "Island Mountain in schemas: $im_faq (expect 3+)"
  
  # H2 headings
  echo "H2 headings:"
  grep '<h2>' "$SITE/$page"
  
  echo ""
done
```

---

## GIT PUSH (after verification passes)

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"; git add -A; git commit -m "SEO Session 1: Product schemas + enriched FAQs + enhanced AEO + optimized H2s for financial-services and insurance"; git push origin main
```
