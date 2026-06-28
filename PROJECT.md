# Project Identity

## What This Is

Island Mountain (islandmountain.io) sells pre-built, burn-tested on-premises AI inference servers built on NVIDIA RTX PRO 6000 Blackwell GPUs (96GB GDDR7 ECC; the Session-73 hardware overhaul discontinued H100/H200 site-wide, top tier on DGX B200). Static HTML/CSS/JS site on GitHub Pages. No frameworks, no build step, no SSG.

Founded 2026, Colorado. Co-founders: John Dougherty and Basho Parks.
Site developer/content: Basho Parks (basho@islandmountain.io).

## Core Value Proposition

Organizations with data that cannot leave the building need AI infrastructure they own outright. No cloud dependency, no token fees, no third-party data exposure.

Target compliance frameworks: HIPAA, ITAR/DFARS, attorney-client privilege, tribal sovereignty/OCAP, FERPA, GLBA, NERC CIP, Title 31 BSA/AML, NIGC MICS, state gaming commissions.

## Contact Information

- Email: basho@islandmountain.io (displayed as info@islandmountain.io, mailto routes to basho@)
- Phone: 1-341-441-8740 (tel:+13414418740, 118 occurrences site-wide)
- LinkedIn: https://www.linkedin.com/company/island-mountain-llc/
- X (Twitter): https://x.com/IslandMountain_
- Primary lead capture: AI chat + voice funnel (Cloudflare Worker in `/worker`), LIVE
  since 2026-06-27 — site-wide chat widget + Vapi voice line with live in-call Cal.com
  booking. See ARCHITECTURE.md "AI Conversational + Voice Funnel" and `DEPLOY.md`. Form
  handler: FormSubmit.co (posts to basho@islandmountain.io) remains as the no-JS fallback.
- Domain registrar: Squarespace Domains (Google nameservers ns-cloud-d1 through d4)

## DNS/Email Authentication

- SPF: v=spf1 include:_spf.google.com ~all (live)
- DMARC: v=DMARC1; p=quarantine; rua=mailto:basho@islandmountain.io; pct=100; adkim=r; aspf=r (live 2026-05-08)
- Google Business Profile: initiated 2026-05-08, verification pending

## Workspace Paths

- Host: C:\Users\17076\Documents\Claude\Island Mountain
- Live URL: https://islandmountain.io
- Repo: GitHub Pages, main branch, custom domain via CNAME file
- Git push (PowerShell): cd "C:\Users\17076\Documents\Claude\Island Mountain"; git add -A; git commit -m "MSG"; git push origin main

## Key Non-Public Files (all gitignored)

- HANDOFF.md: Canonical project reference (345 lines, Session 50)
- SESSION-LOG.md: Detailed session narratives (Sessions 40-50 active, archives in _work/sessions/)
- _work/: Planning docs, skills, SEO, sales, marketing, competitive, investors, operations, reference, scripts
- .claude/memory/: This library (9 files)

## Working Files Structure (_work/, gitignored)

- _work/skills/ - 7 custom Cowork skills (im-blog-post, im-site-update, im-social-post, im-client-proposal, im-deployment-guide, im-investor-update, im-vertical-page)
- _work/sessions/ - Past session notes, planning docs, SESSION-LOG archives
- _work/seo/ - Audits, keyword research, AEO strategy, offpage execution package
- _work/sales/ - Client proposals and sales collateral
- _work/marketing/ - Brand strategy docs
- _work/competitive/ - Competitive positioning analysis
- _work/investors/ - Financial model (Island-Mountain-Financial-Model.xlsx), investor materials
- _work/operations/ - Operational docs (monitoring-setup.md)
- _work/reference/ - Reference materials
- _work/scripts/ - Utility scripts (install-skills.py, SEO fix scripts)
