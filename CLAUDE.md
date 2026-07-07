# Island Mountain — Claude Code Instructions

Marketing site + product initiative for **islandmountain.io** (Basho Parks / `USS-Parks`).
Universal engineering rules load from the global `~/.claude/CANON.md`. This file adds project orientation and pointers — read the two canonical docs below when the work touches their area.

## Canonical docs (read when relevant)
- **[CANON.md](CANON.md)** (repo root) — full project doctrine. Part I = universal rules (also global); **Part II = Sovereignty Stack canon** (WSF/AOG Rust gates, live-OpenBao test rule, air-gap fidelity, HIPAA/ITAR/OCAP); Parts III–IV = enforcement + globalization map.
- **[SESSION-RULES.md](SESSION-RULES.md)** (repo root) — the file-truncation protocol from a real past incident. When editing large HTML in a sandboxed/CoWork environment: prefer `sed` for HTML, verify every write with `tail`/`wc -l`, run the site-wide NUL + `</html>` scan before declaring done. (The git hooks enforce the NUL/`</html>` check at commit/push time.)

## What lives here
- **The website** — ~60 hand-crafted HTML pages + `css/`, `js/`, `blog/`. Deploys to islandmountain.io via **GitHub Pages from `main`** (remote `USS-Parks/islandmountain`). Every push to `main` publishes.
- **Lamprey MAI (`im-mighty-eel-mai`) — SEPARATE sibling repo, no longer in this tree.** The Rust workspace (Lamprey MAI inference substrate + governance: Trust Manifold, OpenBao/TLM) that the WSF/AOG products extend — reused, not rebuilt. **Un-nested from this repo on 2026-07-05**, it now lives on its own at `C:\Users\17076\Documents\Claude\Mighty Eel OS\` (git repo root `Mighty Eel OS\mai\`, origin `USS-Parks/im-mighty-eel-mai`). Do **not** re-clone or re-nest it under this website repo — sovereignty-stack / WSF / AOG / mai work happens over in that sibling folder.
- **`worker/`** — the Cloudflare Worker behind the live chat/voice lead funnel (Vapi voice + Cal.com booking).
- **`PLANNING/`** — P-SPRs (gitignored). Active sovereignty plan: `PLANNING/AOG-WSF-SOVEREIGNTY-STACK-PSPR.md` (DRAFT — awaits STS).
- **`_work/`**, **`.claude/Project Memory Library/`** — session logs, SEO work, skills, cross-session memory.

## The products (detail in CANON Part II + PLANNING)
- **WSF** — Woven Sovereignty/Security Fabric (trust plane): budget-carrying tokens, sealed envelopes, receipt ledger, OpenBao rings.
- **AOG** — Agentic Orchestration Governance (control plane): estate model gateway, tool-call governance, metering, kill switch.
- **Console** — build codename **Lamprey**, public name **Aeneas** → `islandmountain.io/lamprey-woven-security-governance.html`.

## Enforcement active in this repo
git hooks via `core.hooksPath=tools/hooks`: `commit-msg` (stamps the canon footer, strips any AI co-author credit), `pre-commit` (NUL/truncation + high-confidence secret scan), `pre-push` (site-wide HTML integrity). Never `--no-verify`.

## Branching — default to `main`; branch only when the task needs it (CANON §I.5b)
Work directly on `main` by default. Do **not** spin up a session branch or worktree out of the gate — read the task first. Open a `session/<short-topic>` branch (or worktree) **only** when the work genuinely needs an isolated track: concurrent sessions committing in parallel, or a risky spike you might throw away. An ordinary single change goes straight onto `main`; if a session lands on an auto-created branch it doesn't need, switch to `main` and work there. Keep every commit green through the gates — the `pre-commit` hook only *warns* on a direct `main` commit, never blocks it.

**Remote/web sessions automate this (standing order, 2026-07-07):** the SessionStart hook (`tools/hooks/session-start.sh`) lands every Claude Code on the web session on origin's default branch and deletes the harness `claude/*` auto-branch — only when that branch carries zero commits of its own; a branch holding real work is never touched. Never recreate a `claude/*` branch or move work onto one; Basho decides at the top of the session where the work goes. Pushing `main` still happens only on his explicit go — the site deploys from it.

The gates are built to **fail safe**: they block a genuinely corrupt or secret-leaking commit, but never reject a clean one over tooling (unknown/binary file extension, a legitimate HTML partial, a missing `awk`/`mktemp`). If a gate ever claps a clean commit that is a bug in the hook — fix the hook, never reach for `--no-verify`.

## Commit + push
The footer is applied automatically by the hook: `Authored and reviewed by Basho Parks, Copyright 2026` — never credit an AI co-author. Push only when Basho explicitly says so; the `main` branch is live.

## Deploy — GitHub Pages, serialized (CANON §12)
The site publishes through `.github/workflows/pages.yml` (Pages source = **GitHub Actions**, `build_type: workflow`), which carries a `concurrency: { group: pages, cancel-in-progress: false }` gate so the parallel/rapid pushes this repo sees on `main` **queue** instead of colliding. Do **not** revert Pages to branch-based "legacy" deploy — with concurrent sessions it races and fails opaquely ("Deployment failed, try again later"). A committed `.nojekyll` keeps the artifact served verbatim as static files. When a publish looks stuck, diagnose the pipeline (`gh run list`, `gh api repos/USS-Parks/islandmountain/pages`), never just re-push and hope.
