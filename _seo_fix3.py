import os

SITE = "/sessions/trusting-laughing-allen/mnt/Island Mountain"

def dl(s):
    return len(s.replace("&amp;","&"))

# (file, old_source_title, new_source_title)
# old titles are what's currently in the files (from round 1)
# new titles are the corrected versions hitting 50-60 range
corrected = [
    ("blog.html",
     "On-Premises AI Blog | HIPAA, ITAR &amp; TCO Analysis",
     "On-Premises AI Blog | HIPAA, ITAR &amp; TCO Deep Dives"),

    ("education.html",
     "Local AI Servers for Education | FERPA Compliant",
     "Local AI Servers for Education | FERPA &amp; COPPA Ready"),

    ("energy-utilities.html",
     "Local AI for Energy &amp; Utilities | NERC CIP Ready",
     "On-Premises AI for Energy &amp; Utilities | NERC CIP-013"),

    ("financial-services.html",
     "GLBA-Compliant AI for Banks &amp; Financial Services",
     "GLBA-Compliant AI Inference for Financial Services"),

    ("insurance.html",
     "On-Premises AI for Insurance | Keep PII In-House",
     "On-Premises AI for Insurance | Your PII Stays Here"),

    ("medical-practices.html",
     "Local AI for Medical Practices | HIPAA Compliant",
     "HIPAA-Compliant AI Inference for Medical Practices"),

    ("products.html",
     "H100 &amp; H200 AI Servers | 3 Tiers from $75K-$400K",
     "NVIDIA H100 &amp; H200 AI Servers | From $75K to $400K"),

    ("solutions.html",
     "AI for 10 Regulated Industries | Island Mountain",
     "AI Solutions for Ten Regulated Industries | Servers"),

    ("tribal-nations.html",
     "Tribal Data Sovereignty AI | On-Premises Servers",
     "Tribal Data Sovereignty AI | On-Premises AI Hardware"),

    ("why-island-mountain.html",
     "Why Local AI Beats Cloud | Sovereignty &amp; Control",
     "Why On-Premises AI Beats the Cloud | Data Sovereignty"),

    ("blog/h100-vs-h200-inference-comparison.html",
     "H100 vs. H200: What the Specs Mean for Inference",
     "H100 vs. H200 GPU Specs: What They Mean for AI Work"),

    ("blog/itar-dfars-ai-self-assessment.html",
     "ITAR &amp; DFARS AI Audit: Infrastructure Assessment",
     "ITAR &amp; DFARS AI Self-Assessment for Infrastructure"),

    ("blog/ocap-cloud-act-guide.html",
     "OCAP &amp; CLOUD Act: Why Tribal Data Needs Local AI",
     "OCAP Principles &amp; the CLOUD Act: Local AI for Tribes"),

    ("blog/on-prem-vs-colo-vs-cloud.html",
     "On-Prem vs. Colo vs. Cloud AI Decision Framework",
     "On-Prem vs. Colocation vs. Cloud: AI Decision Guide"),

    ("blog/attorney-client-privilege-cloud-ai.html",
     "Attorney-Client Privilege: Why Cloud AI Is a Risk",
     "Attorney-Client Privilege at Risk with Cloud AI Use"),

    ("blog/msp-model-accountability-ticket-queue.html",
     "MSPs Sold Accountability. You Got a Ticket Queue.",
     "The MSP Model Sold Accountability, Not Real Service"),

    ("blog/tribal-data-sovereignty-ai-infrastructure.html",
     "Tribal Data Sovereignty: Why Cloud AI Falls Short",
     "Tribal Sovereignty: Why Cloud AI Falls Short on Data"),

    ("pricing.html",
     "AI Server Pricing | Summit Base, Ridge &amp; Pinnacle",
     "Local AI Server Pricing | Three Summit Tier Options"),
]

# Validate
print("=== Validating ===")
all_ok = True
for fname, old, new in corrected:
    d = dl(new)
    if not (50 <= d <= 60):
        print(f"  FAIL: {fname} = {d} chars: {new.replace('&amp;','&')}")
        all_ok = False
    else:
        print(f"  OK: {fname} = {d} chars")

if not all_ok:
    print("Aborting.")
    import sys; sys.exit(1)

print("\nApplying changes...")
for fname, old_title, new_title in corrected:
    filepath = os.path.join(SITE, fname)
    with open(filepath, 'r') as f:
        content = f.read()

    old_tag = f"<title>{old_title}</title>"
    new_tag = f"<title>{new_title}</title>"
    if old_tag not in content:
        print(f"  WARNING: title tag mismatch in {fname}, skipping")
        continue

    content = content.replace(old_tag, new_tag)
    old_attr = f'content="{old_title}"'
    new_attr = f'content="{new_title}"'
    content = content.replace(old_attr, new_attr)

    with open(filepath, 'w') as f:
        f.write(content)

    if not content.rstrip().endswith('</html>'):
        print(f"  CRITICAL: {fname} missing </html>!")
    else:
        lines = content.count('\n') + 1
        print(f"  OK: {fname} ({lines} lines)")

print("\nDone.")
