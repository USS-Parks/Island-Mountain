# Island Mountain — Claude Code Instructions

Marketing site + product initiative for **islandmountain.io** (Basho Parks / `USS-Parks`).
Universal engineering rules load from the global `~/.claude/CANON.md`. This file adds project orientation and pointers — read the two canonical docs below when the work touches their area.

## Canonical docs (read when relevant)
- **[CANON.md](CANON.md)** (repo root) — full project doctrine. Part I = universal rules (also global); **Part II = Sovereignty Stack canon** (WSF/AOG Rust gates, live-OpenBao test rule, air-gap fidelity, HIPAA/ITAR/OCAP); Parts III–IV = enforcement + globalization map.
- **[SESSION-RULES.md](SESSION-RULES.md)** (repo root) — the file-truncation protocol from a real past incident. When editing large HTML in a sandboxed/CoWork environment: prefer `sed` for HTML, verify every write with `tail`/`wc -l`, run the site-wide NUL + `</html>` scan before declaring done. (The git hooks enforce the NUL/`</html>` check at commit/push time.)

## What lives here
- **The website** — ~60 hand-crafted HTML pages + `css/`, `js/`, `blog/`. Deploys to islandmountain.io via **GitHub Pages from `main`** (remote `USS-Parks/islandmountain`). Every push to `main` publishes.
- **`Island Mountain Mighty Eel OS/mai/`** — the **`im-mighty-eel-mai`** Rust workspace (its own git repo): Lamprey MAI inference substrate + governance (Trust Manifold, OpenBao/TLM). The foundation the WSF/AOG products extend — reused, not rebuilt.
- **`worker/`** — the Cloudflare Worker behind the live chat/voice lead funnel (Vapi voice + Cal.com booking).
- **`PLANNING/`** — P-SPRs (gitignored). Active sovereignty plan: `PLANNING/AOG-WSF-SOVEREIGNTY-STACK-PSPR.md` (DRAFT — awaits STS).
- **`_work/`**, **`.claude/Project Memory Library/`** — session logs, SEO work, skills, cross-session memory.

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
