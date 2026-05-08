import os, sys

SITE = "/sessions/trusting-laughing-allen/mnt/Island Mountain"

# Format: (filename, old_title, new_title, old_desc_or_None, new_desc_or_None)
# old values must EXACTLY match HTML source (including &amp; etc.)

changes = [
    # === ROOT PAGES: TITLES + DESCRIPTIONS ===
    ("about.html",
     "About Island Mountain | Colorado-Built On-Premise AI Inference Hardware",
     "About Island Mountain | On-Premise AI from Colorado",
     "Island Mountain builds pre-configured, burn-tested on-premise AI inference servers with NVIDIA H100 and H200 GPUs. Founded in Colorado. Two-person founding team, direct support, no middlemen.",
     "Island Mountain builds burn-tested AI inference servers with NVIDIA H100 and H200 GPUs in Colorado. Direct builder support, no middlemen."),

    ("blog.html",
     "On-Premises AI Blog | HIPAA, ITAR, Tribal Sovereignty &amp; TCO Analysis - Island Mountain",
     "On-Premises AI Blog | HIPAA, ITAR &amp; TCO Analysis",
     "Compliance-focused technical writing on local AI deployment. HIPAA safeguards, ITAR export controls, tribal data sovereignty, cloud vs. local TCO, and H100/H200 inference architecture.",
     "Technical writing on local AI: HIPAA safeguards, ITAR controls, tribal sovereignty, cloud vs. local TCO, and H100/H200 inference."),

    ("contact.html",
     "Request a Quote | On-Premise AI Server for Your Organization - Island Mountain",
     "Request a Quote | Local AI Servers - Island Mountain",
     "Get a custom quote for local AI inference hardware. 4-step form. Direct builder support. HIPAA, ITAR, and tribal sovereignty workflows supported. Response within 24 hours.",
     "Get a custom quote for local AI inference hardware. Direct builder support for HIPAA, ITAR, and tribal sovereignty workflows. 24-hour response."),

    ("defense-contractors.html",
     "ITAR &amp; CUI-Compliant AI Processing On-Premises | Defense Contractor AI Hardware | Island Mountain",
     "On-Premises AI for Defense | ITAR &amp; CMMC Compliant",
     "On-premises AI inference hardware for defense contractors. ITAR-controlled technical data stays on your infrastructure. Air-gap capable. CMMC-compatible. No foreign server access.",
     "On-premises AI hardware for defense contractors. ITAR-controlled data stays on your infrastructure. Air-gap capable. CMMC-compatible."),

    ("education.html",
     "Local AI Servers for Education | FERPA &amp; Student Data Privacy | Island Mountain",
     "Local AI Servers for Education | FERPA Compliant",
     "Bring powerful AI to your campus while keeping student records on your own hardware. Our H100/H200 inference racks are air-gappable and align with FERPA's school official exception - no cloud required.",
     "Local AI servers for education. H100/H200 inference racks align with FERPA's school official exception. Air-gappable. No cloud required."),

    ("energy-utilities.html",
     "Air-Gapped AI Servers for Energy &amp; Utilities | NERC CIP Compliant | Island Mountain",
     "Local AI for Energy &amp; Utilities | NERC CIP Ready",
     "Pre-built H100/H200 hardware that keeps operational data off the cloud. Designed for NERC CIP and IEC 62443 environments. Run grid analytics, maintenance predictions, and compliance analysis entirely on-premises.",
     "H100/H200 hardware for NERC CIP and IEC 62443 environments. Grid analytics and compliance analysis entirely on-premises. Air-gap capable."),

    ("faq.html",
     "Local AI Hardware FAQ - Honest Answers on Cost, Compliance & Data Sovereignty",
     "Local AI FAQ | Cost, Compliance &amp; Data Sovereignty",
     "25 straight answers: Does local AI comply with HIPAA? Can law firms use AI without privilege risk? How much VRAM for DeepSeek V4-Flash? What does on-premises AI cost over 5 years?",
     "Straight answers on local AI: HIPAA compliance, privilege risk, VRAM for DeepSeek V4-Flash, and five-year on-premises cost."),

    ("financial-services.html",
     "On-Premises AI Servers for Banks &amp; Credit Unions | GLBA Compliance | Island Mountain",
     "GLBA-Compliant AI for Banks &amp; Financial Services",
     "Pre-built, air-gap-capable AI inference hardware for financial institutions. Keep customer financial data (NPI) inside your own network, satisfy GLBA &amp; PCI DSS, and run unlimited inference on your own H100/H200 GPUs.",
     "Air-gap-capable AI hardware for financial institutions. Keep NPI inside your network, satisfy GLBA and PCI DSS, run unlimited H100/H200 inference."),

    ("government.html",
     "On-Premises AI for Government | FedRAMP, CUI, Air-Gapped | Island Mountain",
     "Air-Gapped AI for Government | FedRAMP &amp; CUI Ready",
     "Secure AI inference hardware for federal, state, and local agencies. Process CUI and sensitive data on your own H100/H200 servers, fully air-gappable, with zero cloud dependency.",
     "AI inference hardware for federal, state, and local agencies. Process CUI on your own H100/H200 servers. Fully air-gappable. Zero cloud dependency."),

    ("insurance.html",
     "Local AI Hardware for Insurance | PII &amp; Claims on Your Servers | Island Mountain",
     "On-Premises AI for Insurance | Keep PII In-House",
     "Process claims, underwriting, and fraud detection on hardware you own. Our H100/H200 inference racks keep policyholder data within your network - no cloud, no BAA complexity, no data exposure.",
     "Process claims, underwriting, and fraud detection on hardware you own. H100/H200 racks keep policyholder data in your network. No cloud exposure."),

    ("investors.html",
     None, None,  # title already 54 chars, in range
     "Island Mountain is raising $500K to build pre-configured AI inference servers for regulated industries. SAFE at $2.5M cap. GPU sourcing is the margin thesis. Here are the real numbers.",
     "Island Mountain is raising $500K to build AI inference servers for regulated industries. SAFE at $2.5M cap. GPU sourcing is the margin thesis."),

    ("law-firms.html",
     "Local AI for Law Firms: Attorney-Client Privilege Without Cloud Risk | Island Mountain",
     "Local AI for Law Firms | Privilege Without Cloud Risk",
     "On-premises AI inference hardware for law firms. ABA Model Rule 1.6 compliance. No third-party disclosure. Contract review, discovery, and brief drafting on your own H100 servers.",
     "On-premises AI hardware for law firms. ABA Model Rule 1.6 compliance. Contract review, discovery, and brief drafting on your own H100 servers."),

    ("medical-practices.html",
     "HIPAA-Compliant Local AI for Medical Practices | No BAA Required | Island Mountain",
     "Local AI for Medical Practices | HIPAA Compliant",
     "On-premises AI inference hardware for healthcare. PHI never leaves your building. Clinical note drafting, prior auth letters, patient record analysis. No cloud BAA needed.",
     "On-premises AI hardware for healthcare. PHI never leaves your building. Clinical notes, prior auth, patient analysis. No cloud BAA needed."),

    ("pricing.html",
     "Local AI Server Pricing: Summit Base $75K, Summit Ridge $150K, Summit Pinnacle $350K One-Time",
     "AI Server Pricing | Summit Base, Ridge &amp; Pinnacle",
     "Transparent pricing for on-premises AI inference hardware. Summit Base $75K (2x H100), Summit Ridge $150K, Summit Pinnacle $350K (2x H200). No token fees. 1-year warranty. Compare cloud vs. local TCO.",
     "Summit Base $75K (2x H100), Summit Ridge $150K, Summit Pinnacle $350K (2x H200). No token fees. 1-year warranty. One-time purchase."),

    ("products.html",
     "Pre-Built H100 & H200 AI Servers | 3 Tiers from $75K-$400K - Island Mountain",
     "H100 &amp; H200 AI Servers | 3 Tiers from $75K-$400K",
     "Three on-premises AI server configurations: Summit Base (2x H100, 160GB VRAM, $75K), Summit Ridge ($150K), Summit Pinnacle (2x H200, 282GB, $350K). DeepSeek V4-Flash and Llama 3.1 70B pre-installed.",
     "Three AI server tiers: Summit Base (2x H100, $75K), Summit Ridge ($150K), Summit Pinnacle (2x H200, $350K). DeepSeek V4-Flash pre-installed."),

    ("research-labs.html",
     "On-Premises AI for Research Labs | Protect Unpublished Data & Grant Compliance | Island Mountain",
     "On-Premises AI for Research Labs | Data Protection",
     "Local AI inference hardware for university and federal research labs. Protect pre-publication data, meet NSF/NIH grant compliance, run unlimited inference. No cloud dependency.",
     "Local AI hardware for university and federal research labs. Protect pre-publication data, meet NSF/NIH compliance, run unlimited inference."),

    ("solutions.html",
     "AI Solutions for Regulated Industries | HIPAA, ITAR, GLBA, NERC CIP, FERPA | Island Mountain",
     "AI for 10 Regulated Industries | Island Mountain",
     "On-premises AI inference hardware built for organizations where data sovereignty is non-negotiable. Ten regulated industries: law, healthcare, tribal nations, research, defense, finance, insurance, energy, government, and education.",
     "On-premises AI hardware for organizations where data sovereignty is non-negotiable. Law, healthcare, tribal nations, research, defense, finance, insurance, energy, government, education."),

    ("technology.html",
     "Technology Stack: DeepSeek V4-Flash, vLLM, OpenWebUI on Local Hardware | Island Mountain",
     "Local AI Stack: DeepSeek V4-Flash, vLLM, OpenWebUI",
     "How Island Mountain runs DeepSeek V4-Flash (284B params), Llama 3.1 70B, and Mixtral 8x22B locally via vLLM inference engine and OpenWebUI interface. Full stack breakdown.",
     "DeepSeek V4-Flash (284B params), Llama 3.1 70B, and Mixtral 8x22B via vLLM engine and OpenWebUI interface. Full local AI stack breakdown."),

    ("tribal-nations.html",
     "Tribal Data Sovereignty AI Infrastructure | On-Premises for Tribal Nations | Island Mountain",
     "Tribal Data Sovereignty AI | On-Premises Servers",
     "Local AI inference hardware for tribal governments. OCAP-compliant. Enrollment records, health data, and governance documents stay under tribal jurisdiction. Air-gap capable.",
     "Local AI hardware for tribal governments. OCAP-compliant. Enrollment, health, and governance data stays under tribal jurisdiction. Air-gap capable."),

    ("why-island-mountain.html",
     "Why Local AI Beats Cloud LLMs: Data Sovereignty, Cost, and Control | Island Mountain",
     "Why Local AI Beats Cloud | Sovereignty &amp; Control",
     "Cloud AI risks your data and costs more over time. Local inference hardware gives you complete control. No API fees, no third-party access, no vendor lock-in. See the case for on-premises AI.",
     "Cloud AI risks your data and costs more over time. Local inference gives you full control. No API fees, no third-party access, no vendor lock-in."),

    # === BLOG POSTS: TITLES + DESCRIPTIONS (where needed) ===
    ("blog/attorney-client-privilege-cloud-ai.html",
     "Attorney-Client Privilege and Cloud AI: The Structural Problem Law Firms Can't Negotiate Away | Island Mountain Blog",
     "Attorney-Client Privilege: Why Cloud AI Is a Risk",
     None, None),  # desc is 153, in range

    ("blog/cloud-ai-vs-local-hardware-tco.html",
     "Cloud AI vs. Local Hardware: Building the Honest Five-Year TCO | Island Mountain Blog",
     "Cloud AI vs. Local Hardware: 5-Year TCO Comparison",
     None, None),  # desc is 160, in range

    ("blog/deepseek-v4-flash-local-deployment.html",
     "DeepSeek V4-Flash Just Changed the Game for Local AI | Island Mountain Blog",
     "DeepSeek V4-Flash: A Local AI Deployment Milestone",
     None, None),  # desc is 151, in range

    ("blog/h100-vs-h200-inference-comparison.html",
     "The H100 vs. H200: What the Hardware Specs Actually Mean for Your Workload | Island Mountain Blog",
     "H100 vs. H200: What the Specs Mean for Inference",
     None, None),  # desc is 146, in range

    ("blog/hipaa-technical-checklist.html",
     "HIPAA Technical Safeguards Checklist for Local AI Deployment | Island Mountain Blog",
     "HIPAA Technical Safeguards for Local AI Deployment",
     "Complete HIPAA technical safeguard checklist for deploying on-premise AI inference hardware in healthcare settings. Access controls, encryption, audit logging, and transmission security.",
     "HIPAA technical safeguard checklist for local AI deployment. Access controls, encryption, audit logging, and transmission security covered."),

    ("blog/itar-dfars-ai-self-assessment.html",
     "ITAR and DFARS AI Self-Assessment: Can Your AI Infrastructure Pass an Audit? | Island Mountain Blog",
     "ITAR &amp; DFARS AI Audit: Infrastructure Assessment",
     "Self-assessment guide for ITAR and DFARS compliance when using AI for defense-related work. CUI handling, CMMC alignment, and why air-gapped local AI satisfies export control requirements.",
     "ITAR and DFARS compliance self-assessment for AI infrastructure. CUI handling, CMMC alignment, and air-gapped local AI for export control."),

    ("blog/msp-model-accountability-ticket-queue.html",
     "The MSP Model Sold You Accountability. What You Got Was a Ticket Queue. | Island Mountain Blog",
     "MSPs Sold Accountability. You Got a Ticket Queue.",
     "Why the Managed Services Provider model mirrors cloud AI subscriptions: recurring fees for tiered access, culpability transfer instead of real service, and data you don't control. The case for owning your AI hardware outright.",
     "The MSP model mirrors cloud AI: recurring fees, tiered access, culpability transfer instead of service. The case for owning your AI hardware."),

    ("blog/ocap-cloud-act-guide.html",
     "OCAP Principles and the CLOUD Act: Why Tribal Data Requires Local AI Infrastructure | Island Mountain Blog",
     "OCAP &amp; CLOUD Act: Why Tribal Data Needs Local AI",
     "How the CLOUD Act undermines tribal data sovereignty and why OCAP-compliant AI requires on-premise hardware. Ownership, Control, Access, and Possession in the age of AI.",
     "How the CLOUD Act undermines tribal data sovereignty and why OCAP-compliant AI requires on-premise hardware. Ownership, Control, Access, Possession."),

    ("blog/on-prem-vs-colo-vs-cloud.html",
     "On-Premise vs. Colocation vs. Cloud AI: A Decision Framework for Regulated Industries | Island Mountain Blog",
     "On-Prem vs. Colo vs. Cloud AI Decision Framework",
     "Decision framework comparing on-premise, colocation, and cloud AI deployment for organizations with compliance requirements. Cost, control, latency, and regulatory analysis.",
     "On-premise, colocation, or cloud AI? Decision framework for organizations with compliance requirements. Cost, control, and regulatory analysis."),

    ("blog/openai-discovery-risk-law-firms.html",
     "OpenAI Discovery Risk: Why Law Firms Face Subpoena Exposure with Cloud AI | Island Mountain Blog",
     "OpenAI Discovery Risk: Subpoena Exposure for Firms",
     "Cloud AI providers can be subpoenaed for prompt logs and conversation history. Analysis of discovery risk for law firms using ChatGPT, Claude, and other cloud AI services.",
     "Cloud AI providers can be subpoenaed for prompt logs and conversation history. Discovery risk analysis for law firms using cloud AI services."),

    ("blog/openwebui-admin-setup-guide.html",
     "OpenWebUI for Administrators: Multi-User Access, Permissions, and Conversation Controls | Island Mountain Blog",
     "OpenWebUI Admin Guide: Users, Permissions &amp; Access",
     None, None),  # desc is 159, in range

    ("blog/tribal-data-sovereignty-ai-infrastructure.html",
     "Tribal Data Sovereignty and Cloud AI: Why Sovereign Nations Need Local Infrastructure | Island Mountain Blog",
     "Tribal Data Sovereignty: Why Cloud AI Falls Short",
     "OCAP and CARE Principles applied to AI deployment. Why cloud AI violates tribal data sovereignty, and how on-premises infrastructure keeps enrollment, health, and governance data under tribal jurisdiction.",
     "OCAP and CARE Principles for AI deployment. Why cloud AI violates tribal data sovereignty and how on-premises hardware protects tribal data."),
]


def replace_in_file(filepath, old_title, new_title, old_desc, new_desc):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    modified = False

    if old_title and new_title:
        # Replace <title>
        old_tag = f"<title>{old_title}</title>"
        new_tag = f"<title>{new_title}</title>"
        if old_tag in content:
            content = content.replace(old_tag, new_tag)
            modified = True
        else:
            print(f"  WARNING: title tag not found in {filepath}")
            print(f"  Looking for: {old_tag}")

        # Replace og:title
        old_og = f'content="{old_title}"'
        new_og = f'content="{new_title}"'
        count = content.count(old_og)
        if count >= 1:
            content = content.replace(old_og, new_og)
            modified = True
        else:
            print(f"  WARNING: og/twitter title not found in {filepath}")

    if old_desc and new_desc:
        old_d = f'content="{old_desc}"'
        new_d = f'content="{new_desc}"'
        count = content.count(old_d)
        if count >= 1:
            content = content.replace(old_d, new_d)
            modified = True
        else:
            print(f"  WARNING: description not found in {filepath}")
            print(f"  Looking for: {old_desc[:80]}...")

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        # Verify closing tag
        if not content.rstrip().endswith('</html>'):
            print(f"  CRITICAL: {filepath} missing </html> closing tag!")
            return False
        new_lines = content.count('\n') + 1
        orig_lines = original.count('\n') + 1
        if new_lines != orig_lines:
            print(f"  WARNING: line count changed {orig_lines} -> {new_lines} in {filepath}")
        print(f"  OK: {os.path.basename(filepath)} ({new_lines} lines)")
        return True
    else:
        print(f"  SKIP: {os.path.basename(filepath)} (no changes needed or match failed)")
        return False


print("=== SEO Title & Description Optimization ===\n")
success = 0
fail = 0
for entry in changes:
    fname = entry[0]
    old_t = entry[1]
    new_t = entry[2]
    old_d = entry[3]
    new_d = entry[4]
    filepath = os.path.join(SITE, fname)
    print(f"Processing: {fname}")
    if replace_in_file(filepath, old_t, new_t, old_d, new_d):
        success += 1
    else:
        fail += 1

print(f"\n=== Done: {success} files modified, {fail} skipped/failed ===")
