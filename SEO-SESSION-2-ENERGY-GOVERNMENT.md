# SEO Session 2: Energy & Utilities + Government — Surgical Revisions

**Date:** 2026-05-03
**Scope:** Product schema injection, FAQ answer enrichment, AEO block enhancement, H2 heading optimization for energy-utilities.html and government.html.
**Reference:** VERTICAL-EXPANSION-SEO-AEO.md (sections 4 and 5)

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

### energy-utilities.html

```bash
sed -i '79a\
\
  <!-- Product Schema -->\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "Product",\
    "name": "Island Mountain Premium — Air-Gapped AI Server for Energy & Utilities",\
    "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H200 141GB GPUs. Air-gap capable for NERC CIP and IEC 62443 environments. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",\
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
    "category": "Air-Gapped AI Inference Hardware for Critical Infrastructure"\
  }\
  </script>' "$SITE/energy-utilities.html"

tail -3 "$SITE/energy-utilities.html"
```

### government.html

```bash
sed -i '79a\
\
  <!-- Product Schema -->\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "Product",\
    "name": "Island Mountain Starter — On-Premises AI Server for Government",\
    "description": "Pre-built, burn-tested AI inference server with 2x NVIDIA H100 80GB GPUs. Air-gap capable for CUI environments. NIST SP 800-171 compatible. Includes DeepSeek V4-Flash, Llama 3.1 70B, and OpenWebUI.",\
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
    "category": "AI Inference Hardware for Government Agencies"\
  }\
  </script>' "$SITE/government.html"

tail -3 "$SITE/government.html"
```

---

## TASK 2: Enrich FAQ Answers

Replace existing FAQPage JSON-LD blocks (lines 31-66) with enriched versions.

### energy-utilities.html — Replace lines 31-66

```bash
sed -i '31,66c\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "FAQPage",\
    "mainEntity": [\
      {\
        "@type": "Question",\
        "name": "Does cloud AI processing of operational data violate NERC CIP requirements?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "NERC CIP standards (CIP-003 through CIP-013) mandate strict cybersecurity controls for the bulk electric system, including requirements for electronic security perimeters, access management, and information protection. Transmitting operational technology data to cloud AI services moves that data outside the electronic security perimeter and introduces third-party access to potentially sensitive grid operations data. IEC 62443 adds requirements for industrial automation and control system security. Air-gapped on-premises AI hardware from Island Mountain processes operational data entirely within the facility perimeter. No data crosses the electronic security boundary. No third-party access to grid, pipeline, or substation data occurs. The system can operate with complete network isolation, satisfying the most restrictive NERC CIP and IEC 62443 security postures."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "What energy sector workflows can run on Island Mountain air-gapped AI hardware?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Island Mountain hardware supports predictive maintenance analysis for generation and distribution equipment, grid operations and substation documentation, NERC CIP compliance reporting and evidence preparation, pipeline monitoring data analysis, outage response and after-action documentation, and FERC regulatory filing drafting. The system runs DeepSeek V4-Flash for complex multi-document analysis like maintenance history correlation and compliance evidence review. Llama 3.1 70B handles general drafting including regulatory filings and operational reports. All processing occurs on NVIDIA H100 or H200 GPUs inside your facility with zero internet connectivity required for inference."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "How does on-premises AI cost compare to cloud alternatives for a utility company?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "For utility companies, the cost comparison extends beyond subscription fees to include the compliance cost of using cloud AI. Achieving NERC CIP compliance with cloud-based AI processing typically requires extensive compliance middleware, third-party security assessments, and ongoing vendor risk management, often costing hundreds of thousands of dollars in addition to the AI subscription itself. An Island Mountain Starter system costs $75,000 to $85,000 as a one-time purchase with two NVIDIA H100 GPUs. The Premium tier with two H200 GPUs costs $350,000 to $400,000. Both operate air-gapped with zero ongoing subscription fees and no compliance middleware required. The total cost of ownership advantage compounds significantly when compliance overhead is factored in."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "Can Island Mountain hardware integrate with SCADA or operational technology systems?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Island Mountain hardware runs general-purpose large language models through a browser-based interface called OpenWebUI. It does not directly integrate with SCADA systems, energy management systems, distribution management systems, or other operational technology platforms. The AI processes documents, reports, and data that operators provide through the chat interface. It is an inference tool for analysis and drafting, not a real-time control system component. This separation is actually a security advantage: the AI server can operate on an isolated network segment without any connection to OT systems, eliminating the possibility of AI-related compromise affecting operational technology."\
        }\
      }\
    ]\
  }\
  </script>' "$SITE/energy-utilities.html"

tail -3 "$SITE/energy-utilities.html"
```

### government.html — Replace lines 31-66

```bash
sed -i '31,66c\
  <script type="application/ld+json">\
  {\
    "@context": "https://schema.org",\
    "@type": "FAQPage",\
    "mainEntity": [\
      {\
        "@type": "Question",\
        "name": "Do government agencies need FedRAMP-authorized AI to process CUI?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "FedRAMP authorization applies to cloud service providers that process government data on shared commercial infrastructure. Island Mountain hardware is not a cloud service -- it is physical AI inference hardware that agencies own and operate on-premises. No FedRAMP authorization is needed because no cloud service is involved. For CUI handling, NIST SP 800-171 provides the security requirements, and agencies implement those controls on their own infrastructure. On-premises AI hardware simplifies CUI compliance because data processing stays within the agency'"'"'s security boundary. No third-party access occurs, no data leaves the agency'"'"'s network, and the full complement of NIST 800-171 controls can be applied directly to hardware under agency control."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "What government workflows can run on Island Mountain on-premises AI hardware?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Island Mountain hardware supports document review and CUI analysis, FOIA request processing and response drafting, policy analysis and legislative drafting, citizen service documentation and correspondence, grant and budget analysis, and after-action report generation. The system runs DeepSeek V4-Flash for complex multi-document analysis and policy synthesis, and Llama 3.1 70B for general drafting tasks including correspondence and reporting. All processing occurs on NVIDIA H100 or H200 GPUs inside agency-controlled facilities with zero data transmitted to external servers."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "How does on-premises AI cost compare to cloud AI for a 20-person government office?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "Government cloud AI solutions typically require FedRAMP-authorized platforms costing $75 to $300 per user per month, plus compliance overhead for ATO documentation and continuous monitoring. For 20 users, annual cloud costs range from $18,000 to $72,000 in subscription fees alone, with compliance documentation and vendor risk management adding significant additional cost. An Island Mountain Starter system costs $75,000 to $85,000 as a one-time purchase. After purchase, ongoing costs are limited to electricity at approximately $100 to $200 per month. No FedRAMP ATO required because no cloud service is involved. Total cost of ownership typically reaches parity within 18 months while eliminating third-party data handling of government information entirely."\
        }\
      },\
      {\
        "@type": "Question",\
        "name": "Is Island Mountain hardware rated for classified data processing?",\
        "acceptedAnswer": {\
          "@type": "Answer",\
          "text": "No. Island Mountain hardware is suitable for Controlled Unclassified Information (CUI), sensitive but unclassified (SBU) data, and law enforcement sensitive data. It is not SCIF-rated and has not been certified by NSA or any intelligence community authority for classified data processing. The system is designed for civilian government agencies, state and local governments, and federal offices handling CUI and sensitive administrative data. For agencies requiring classified data processing capability, different procurement channels and certification requirements apply. Island Mountain systems do support complete air-gap operation and can be configured for network isolation, which satisfies many CUI handling requirements under NIST SP 800-171."\
        }\
      }\
    ]\
  }\
  </script>' "$SITE/government.html"

tail -3 "$SITE/government.html"
```

**IMPORTANT:** After FAQ replacement, line numbers shift. Re-check with `grep -n` before Tasks 3 and 4.

---

## TASK 3: Enhance AEO Summary Blocks

### energy-utilities.html

Find:
```
<strong>Summary:</strong> Air-gapped AI inference hardware keeps operational technology data entirely within the facility perimeter. No cloud transmission, no NERC CIP compliance risk, no attack surface expansion for critical infrastructure operators.
```

Replace with:
```
<strong>Summary:</strong> Island Mountain builds air-gapped AI inference hardware for energy companies and utilities operating under NERC CIP and IEC 62443 requirements. NVIDIA H100/H200 servers process operational data entirely within the facility perimeter -- no cloud transmission, no electronic security perimeter breach, no third-party access to critical infrastructure data. Systems start at $75,000 with complete network isolation capability.
```

```bash
sed -i 's|<strong>Summary:</strong> Air-gapped AI inference hardware keeps operational technology data entirely within the facility perimeter. No cloud transmission, no NERC CIP compliance risk, no attack surface expansion for critical infrastructure operators.|<strong>Summary:</strong> Island Mountain builds air-gapped AI inference hardware for energy companies and utilities operating under NERC CIP and IEC 62443 requirements. NVIDIA H100/H200 servers process operational data entirely within the facility perimeter -- no cloud transmission, no electronic security perimeter breach, no third-party access to critical infrastructure data. Systems start at $75,000 with complete network isolation capability.|' "$SITE/energy-utilities.html"

tail -3 "$SITE/energy-utilities.html"
```

### government.html

Find:
```
<strong>Summary:</strong> On-premises AI inference hardware processes government data on government-controlled servers with zero cloud dependency. CUI, citizen records, and policy-sensitive documents never leave the agency's network perimeter.
```

Replace with:
```
<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for federal, state, and local government agencies. Process CUI, citizen records, and policy-sensitive documents on NVIDIA H100/H200 servers under agency control -- no cloud dependency, no FedRAMP ATO required, no third-party data handling. Systems start at $75,000 with full air-gap capability.
```

```bash
sed -i "s|<strong>Summary:</strong> On-premises AI inference hardware processes government data on government-controlled servers with zero cloud dependency. CUI, citizen records, and policy-sensitive documents never leave the agency's network perimeter.|<strong>Summary:</strong> Island Mountain builds on-premises AI inference hardware for federal, state, and local government agencies. Process CUI, citizen records, and policy-sensitive documents on NVIDIA H100/H200 servers under agency control -- no cloud dependency, no FedRAMP ATO required, no third-party data handling. Systems start at \$75,000 with full air-gap capability.|" "$SITE/government.html"

tail -3 "$SITE/government.html"
```

---

## TASK 4: Optimize H2 Headings

### energy-utilities.html

```bash
# "The Cloud AI Problem for Energy and Utilities" -> "The Cloud AI Problem for Critical Infrastructure Operators"
sed -i 's|<h2>The Cloud AI Problem for Energy and Utilities</h2>|<h2>The Cloud AI Problem for Critical Infrastructure Operators</h2>|' "$SITE/energy-utilities.html"

# "What Local AI Actually Means" -> "What Air-Gapped AI Means for Energy Operations"
sed -i 's|<h2>What Local AI Actually Means for Your Organization</h2>|<h2>What Air-Gapped AI Means for Energy Operations</h2>|' "$SITE/energy-utilities.html"

# "Workflows Island Mountain Hardware Supports" -> "Operational Workflows Island Mountain Hardware Supports"
sed -i 's|<h2>Workflows Island Mountain Hardware Supports</h2>|<h2>Operational Workflows Island Mountain Hardware Supports</h2>|' "$SITE/energy-utilities.html"

# "Which Models Work Best" -> "Which Models Work Best for Energy Sector Tasks"
sed -i 's|<h2>Which Models Work Best</h2>|<h2>Which Models Work Best for Energy Sector Tasks</h2>|' "$SITE/energy-utilities.html"

# "NERC CIP, IEC 62443, and Critical Infrastructure AI" -> "NERC CIP, IEC 62443, and the Case for Air-Gapped AI"
sed -i 's|<h2>NERC CIP, IEC 62443, and Critical Infrastructure AI</h2>|<h2>NERC CIP, IEC 62443, and the Case for Air-Gapped AI</h2>|' "$SITE/energy-utilities.html"

# "Questions Energy Companies Ask" -> "Questions Energy Companies Ask About On-Premises AI"
sed -i 's|<h2>Questions Energy Companies Ask</h2>|<h2>Questions Energy Companies Ask About On-Premises AI</h2>|' "$SITE/energy-utilities.html"

tail -3 "$SITE/energy-utilities.html"
```

### government.html

```bash
# "What Local AI Actually Means for Your Organization" -> "What On-Premises AI Means for Government Data"
sed -i 's|<h2>What Local AI Actually Means for Your Organization</h2>|<h2>What On-Premises AI Means for Government Data</h2>|' "$SITE/government.html"

# "Workflows Island Mountain Hardware Supports" -> "Government Workflows Island Mountain Hardware Supports"
sed -i 's|<h2>Workflows Island Mountain Hardware Supports</h2>|<h2>Government Workflows Island Mountain Hardware Supports</h2>|' "$SITE/government.html"

# "Which Models Work Best" -> "Which Models Work Best for Government Tasks"
sed -i 's|<h2>Which Models Work Best</h2>|<h2>Which Models Work Best for Government Tasks</h2>|' "$SITE/government.html"

# "FedRAMP, FISMA, and Government Data Sovereignty" -> "FedRAMP, NIST 800-171, and the Case for On-Premises AI"
sed -i 's|<h2>FedRAMP, FISMA, and Government Data Sovereignty</h2>|<h2>FedRAMP, NIST 800-171, and the Case for On-Premises AI</h2>|' "$SITE/government.html"

# "Questions Government Agencies Ask" -> "Questions Government Agencies Ask About Local AI"
sed -i 's|<h2>Questions Government Agencies Ask</h2>|<h2>Questions Government Agencies Ask About Local AI</h2>|' "$SITE/government.html"

tail -3 "$SITE/government.html"
```

---

## VERIFICATION

```bash
SITE="/sessions/SESSION-SLUG/mnt/Island Mountain"

for page in energy-utilities.html government.html; do
  echo "=== $page ==="
  
  lines=$(wc -l < "$SITE/$page")
  has_close=$(grep -c '</html>' "$SITE/$page")
  echo "Lines: $lines, Has </html>: $has_close"
  
  prod=$(grep -c '"Product"' "$SITE/$page")
  echo "Product schema: $prod (expect 1)"
  
  faq=$(grep -c 'FAQPage' "$SITE/$page")
  echo "FAQPage refs: $faq (expect 2)"
  
  bc=$(grep -c 'BreadcrumbList' "$SITE/$page")
  echo "BreadcrumbList: $bc (expect 2)"
  
  aeo_price=$(grep -c '\$75,000' "$SITE/$page")
  echo "AEO has pricing: $aeo_price (expect 1+)"
  
  im_faq=$(grep -c '"Island Mountain"' "$SITE/$page")
  echo "Island Mountain in schemas: $im_faq (expect 3+)"
  
  echo "H2 headings:"
  grep '<h2>' "$SITE/$page"
  
  echo ""
done
```

---

## GIT PUSH

```powershell
cd "C:\Users\17076\Documents\Claude\Island Mountain"; git add -A; git commit -m "SEO Session 2: Product schemas + enriched FAQs + enhanced AEO + optimized H2s for energy-utilities and government"; git push origin main
```
