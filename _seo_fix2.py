import os

SITE = "/sessions/trusting-laughing-allen/mnt/Island Mountain"

# Round 2: bump 48-49 char titles to 50+
# Format: (filename, old_title, new_title)
# Note: these are HTML source values (with &amp; where needed)
fixes = [
    ("blog.html",
     "On-Premises AI Blog | HIPAA, ITAR &amp; TCO Analysis",
     "On-Premises AI Blog | HIPAA, ITAR &amp; TCO Insights"),
    # "Insights" is same length as "Analysis" (8 vs 8). Let me recount...
    # Actually the problem is display count. Let me add chars differently.
]

# Let me recalculate more carefully with Python
test_titles = {
    "blog.html": ("On-Premises AI Blog | HIPAA, ITAR &amp; TCO Analysis",
                  "On-Premises AI Blog | HIPAA, ITAR, &amp; TCO Analysis"),  # add comma = +1 = 49... still short
    "education.html": ("Local AI Servers for Education | FERPA Compliant",
                       "Local AI Servers for Education | FERPA-Compliant"),  # hyphen same length
    "energy-utilities.html": ("Local AI for Energy &amp; Utilities | NERC CIP Ready",
                              "Local AI for Energy &amp; Utilities | NERC CIP Ready"),
}

# Let me just count display lengths properly
def display_len(s):
    return len(s.replace("&amp;", "&"))

titles_to_fix = [
    # (file, current_source_title, new_source_title)
    ("blog.html",
     "On-Premises AI Blog | HIPAA, ITAR &amp; TCO Analysis",
     "On-Premises AI Blog | HIPAA, ITAR &amp; TCO Analysis"),  # placeholder
]

# First, let me just measure all the current ones
import subprocess
for f in ["blog.html","education.html","energy-utilities.html","financial-services.html",
          "insurance.html","medical-practices.html","products.html","solutions.html",
          "tribal-nations.html","why-island-mountain.html",
          "blog/h100-vs-h200-inference-comparison.html","blog/itar-dfars-ai-self-assessment.html",
          "blog/ocap-cloud-act-guide.html","blog/on-prem-vs-colo-vs-cloud.html",
          "blog/attorney-client-privilege-cloud-ai.html","blog/msp-model-accountability-ticket-queue.html",
          "blog/tribal-data-sovereignty-ai-infrastructure.html","pricing.html"]:
    path = os.path.join(SITE, f)
    with open(path) as fh:
        for line in fh:
            if '<title>' in line and '</title>' in line:
                import re
                m = re.search(r'<title>(.*?)</title>', line)
                if m:
                    raw = m.group(1)
                    disp = raw.replace('&amp;','&')
                    print(f"{f}: {display_len(raw)} display chars -> \"{disp}\"")
                break
