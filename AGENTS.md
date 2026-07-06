# Island Mountain — Codex Instructions

Marketing site + product initiative for **islandmountain.io** (Basho Parks / `USS-Parks`).
Universal engineering rules load from the global `~/.Codex/CANON.md`. This file adds project orientation and pointers — read the two canonical docs below when the work touches their area.

## Canonical docs (read when relevant)
- **[CANON.md](CANON.md)** (repo root) — full project doctrine. Part I = universal rules (also global); **Part II = Sovereignty Stack canon** (WSF/AOG Rust gates, live-OpenBao test rule, air-gap fidelity, HIPAA/ITAR/OCAP); Parts III–IV = enforcement + globalization map.
- **[SESSION-RULES.md](SESSION-RULES.md)** (repo root) — the file-truncation protocol from a real past incident. When editing large HTML in a sandboxed/CoWork environment: prefer `sed` for HTML, verify every write with `tail`/`wc -l`, run the site-wide NUL + `</html>` scan before declaring done. (The git hooks enforce the NUL/`</html>` check at commit/push time.)

## What lives here
- **The website** — ~60 hand-crafted HTML pages + `css/`, `js/`, `blog/`. Deploys to islandmountain.io via **GitHub Pages from `main`** (remote `USS-Parks/islandmountain`). Every push to `main` publishes.
- **Lamprey MAI (`im-mighty-eel-mai`) — SEPARATE sibling repo, no longer in this tree.** The Rust workspace (Lamprey MAI inference substrate + governance: Trust Manifold, OpenBao/TLM) that the WSF/AOG products extend — reused, not rebuilt. **Un-nested from this repo on 2026-07-05**, it now lives on its own at `C:\Users\17076\Documents\Claude\Mighty Eel OS\` (git repo root `Mighty Eel OS\mai\`, origin `USS-Parks/im-mighty-eel-mai`). Do **not** re-clone or re-nest it under this website repo — sovereignty-stack / WSF / AOG / mai work happens over in that sibling folder.
- **`worker/`** — the Cloudflare Worker behind the live chat/voice lead funnel (Vapi voice + Cal.com booking).
- **`PLANNING/`** — P-SPRs (gitignored). Active sovereignty plan: `PLANNING/AOG-WSF-SOVEREIGNTY-STACK-PSPR.md` (DRAFT — awaits STS).
- **`_work/`**, **`.Codex/Project Memory Library/`** — session logs, SEO work, skills, cross-session memory.

## The products (detail in CANON Part II + PLANNING)
- **WSF** — Woven Sovereignty/Security Fabric (trust plane): budget-carrying tokens, sealed envelopes, receipt ledger, OpenBao rings.
- **AOG** — Agentic Orchestration Governance (control plane): estate model gateway, tool-call governance, metering, kill switch.
- **Console** — build codename **Lamprey**, public name **Aeneas** → `islandmountain.io/lamprey-woven-security-governance.html`.

## Enforcement active in this repo
git hooks via `core.hooksPath=tools/hooks`: `commit-msg` (stamps the canon footer, strips any AI co-author credit), `pre-commit` (NUL/truncation + high-confidence secret scan), `pre-push` (site-wide HTML integrity). Never `--no-verify`.

## Branch per session (required — CANON §I.5b)
Work on a session branch, never directly on `main`: `git switch -c session/<short-topic>` at the start. Keep commits green through the gates, then integrate with `git switch main && git merge --no-ff session/<short-topic>` when the unit is done. The `pre-commit` hook only *warns* on a direct `main` commit — it never blocks it (blocking would snag the merge itself).

The gates are built to **fail safe**: they block a genuinely corrupt or secret-leaking commit, but never reject a clean one over tooling (unknown/binary file extension, a legitimate HTML partial, a missing `awk`/`mktemp`). If a gate ever claps a clean commit that is a bug in the hook — fix the hook, never reach for `--no-verify`.

## Commit + push
The footer is applied automatically by the hook: `Authored and reviewed by Basho Parks, Copyright 2026` — never credit an AI co-author. Push only when Basho explicitly says so; the `main` branch is live.

## Deploy — GitHub Pages, serialized (CANON §12)
The site publishes through `.github/workflows/pages.yml` (Pages source = **GitHub Actions**, `build_type: workflow`), which carries a `concurrency: { group: pages, cancel-in-progress: false }` gate so the parallel/rapid pushes this repo sees on `main` **queue** instead of colliding. Do **not** revert Pages to branch-based "legacy" deploy — with concurrent sessions it races and fails opaquely ("Deployment failed, try again later"). A committed `.nojekyll` keeps the artifact served verbatim as static files. When a publish looks stuck, diagnose the pipeline (`gh run list`, `gh api repos/USS-Parks/islandmountain/pages`), never just re-push and hope.

## Imported Claude Cowork project instructions

You are working in the "C:\Users\17076\Documents\Claude\Island Mountain" folder on islandmountain.io, a static HTML/CSS/JS site on GitHub Pages selling on-premises AI inference servers.

**First actions every session:**
1. Read .claude/Project Memory Library/INDEX.md (file map and routing logic)
2. Read .claude/Project Memory Library/SESSION-RULES.md (truncation rules, path mapping, verification script - CRITICAL)
3. Read .claude/Project Memory Library/KNOWN-ISSUES.md (active risks and owner action items)
4. Read task-relevant memory files before touching anything:
   - Editing any file → ARCHITECTURE.md + CONVENTIONS.md
   - SEO or schema work → SEO-STATE.md
   - Product/pricing content → PRODUCTS.md
   - Vertical page work → VERTICALS.md
5. If the task has a custom skill (see below), read the SKILL.md before starting.
6. Find your bash session path: ls /sessions/*/mnt/

Do not begin any work until steps 1-3 are complete.

**Technical rules (non-negotiable):**
- NEVER use the Edit tool on ANY HTML file. Use sed via bash for ALL HTML edits, regardless of line count. This rule has no exceptions.
- After EVERY file modification, run `tail -5 filename` in bash and confirm the closing </html> tag is present.
- After EVERY session, run the full site-wide verification script from SESSION-RULES.md before declaring complete.
- Check for .fuse_hidden* files in git status before every commit. Remove with `git rm --cached` if present.
- NEVER delete any file without asking permission and explaining what and why.
- ALWAYS update HANDOFF.md and SESSION-LOG.md before generating the git push command.
- SESSION-LOG.md archives every 20 sessions into _work/sessions/. Next archive trigger: Session 60.

**Path mapping (the bash sandbox and file tools use different paths):**
- Read/Write/Edit/Grep tools: C:\Users\17076\Documents\Claude\Island Mountain\filename
- Bash sandbox: /sessions/SESSION-SLUG/mnt/Island Mountain/filename
- Find session slug: ls /sessions/*/mnt/
- Git push runs in user's PowerShell only. Bash sandbox cannot push to GitHub.

**Custom skills live in _work/skills/. Read the relevant SKILL.md before starting any of these tasks:**
- Writing a blog post → _work/skills/im-blog-post/SKILL.md AND SKILL2.md
- Editing or adding pages → _work/skills/im-site-update/SKILL.md
- LinkedIn or X posts → _work/skills/im-social-post/SKILL.md AND _work/skills/im-blog-post/SKILL2.md
- Client proposal or quote → _work/skills/im-client-proposal/SKILL.md
- Deployment or installation docs → _work/skills/im-deployment-guide/SKILL.md
- Investor updates or pitch content → _work/skills/im-investor-update/SKILL.md
- New industry vertical page → _work/skills/im-vertical-page/SKILL.md

Each skill contains voice rules, banned words, structural templates, product specs, and pricing. Follow them exactly. Do not improvise structure or tone when a skill covers the task. ALWAYS ask clarifying questions before executing.

**Working files structure (_work/, gitignored):**
- _work/skills/ - 7 custom Cowork skills
- _work/seo/ - audits, keyword research, AEO, offpage execution package
- _work/sales/ - client proposals, pipeline
- _work/marketing/ - social batches, content calendars
- _work/competitive/ - competitor analysis
- _work/investors/ - financial model, pitch materials
- _work/operations/ - monitoring, deployment SOPs
- _work/sessions/ - past session notes, planning docs, SESSION-LOG archives
- _work/reference/ - regulatory citations, technical specs
- _work/scripts/ - utility scripts (install-skills.py, SEO fix scripts)
