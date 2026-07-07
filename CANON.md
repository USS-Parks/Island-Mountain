# CANON — Engineering & Agentic Operations Doctrine

**Scope:** Island Mountain — **WSF** (Woven Sovereignty Fabric, trust plane) + **AOG** (Agentic Orchestration Governance, control plane) · console codename **Lamprey** / public **Aeneas** · foundation **Lamprey MAI**.
**Author:** Basho Parks · **Status:** v0.3 (2026-07-05) — Parts I–II adopted; enforcement live (Part III). Items marked **PROPOSED** are not yet wired.
**Created:** 2026-07-03.

> This is the single source of truth for *how we build*, above any one PLANNING/*.md. A PSPR governs one phase; this governs all phases and, for Part I, all projects.

---

## 0. Read first — the three layers (a document does not enforce)

A canon document is **doctrine, not machinery.** It is read by humans and by agents; it enforces nothing on its own. Every "always / never / before each X / after each X" rule below must have an owner in one of three layers or it will silently rot:

| Layer | Where | Enforced by | Bypassable? |
|---|---|---|---|
| **1 · Doctrine** | this file (`CANON.md`) | nobody — it's read, not run | entirely (it's just words) |
| **2 · Instruction** | `~/.claude/CLAUDE.md` (global), project `CLAUDE.md` | the agent, by reading it each session | yes — only as reliable as the model |
| **3 · Enforcement** | git hooks, Claude Code hooks, CI | machinery, not the model | git hooks: only with `--no-verify` · CI: not locally |

**The load-bearing consequence:** "exhaustive validation before *each* commit" cannot be guaranteed by Layer 1 or 2. A human committing from PowerShell never reads `CLAUDE.md` and never fires a Claude Code hook. The **only** universal owner is a **git `pre-commit` hook** (`core.hooksPath`), backstopped by **CI**. Write the directive here, restate it in `CLAUDE.md`, and *wire it in git*. All three, or it isn't real.

Rule of thumb used throughout: every directive names its **Layer-3 owner**. If a directive has no owner, it's a wish.

---

# PART I — UNIVERSAL CANON (candidate for global scope, all projects)

### I.1 — Plan before work (PSPR / STS)
- **P-SPR = Plan · Sequential Prompt Roster.** One canonical `PLANNING/*.md` defining a phase end-to-end: goal, scope, non-goals, ordered prompts, files, verify gates, commit/DEVLOG discipline, completion criteria, approval state.
- **STS = Stem to Stern.** Execute the roster in order only after explicit approval ("run it STS"). A plan's own "STS authorization" wording is **not** approval by itself. No code, builds, or commits until green-lit. Trivial one-offs are exempt.
- *Layer-3 owner:* none possible (judgment). Layer-2 only. → `CLAUDE.md`.

### I.2 — The Verify Gate: exhaustive V&V before **every** commit  ← the directive you named
Nothing gets committed unless the full ladder is green. "Exhaustive" is a ladder, cheapest → most expensive, all must pass:
1. **Format** clean (`cargo fmt --check` / `prettier --check`).
2. **Lint** clean, warnings-as-errors (`clippy -D warnings` / `eslint`).
3. **Typecheck** (`tsc --noEmit` both configs / `cargo check --workspace`).
4. **Unit tests** green — no new `#[ignore]` / `.skip` on load-bearing code.
5. **Integration tests** green (see II.3 for the no-mock-only rule).
6. **Secret scan** clean (no keys/tokens/creds in the diff).
7. **Dependency advisories** clean (`cargo audit`/`deny`, `npm audit`).
8. **Build + smoke** (the thing actually builds and boots).
- **Never commit red. Never `git commit --no-verify`** (bypassing hooks is a Layer-3 breach, not a shortcut).
- *Layer-3 owner:* **git `pre-commit`** (fast subset) + **`pre-push`** (full ladder) + **CI** (un-bypassable backstop).

### I.3 — Commit discipline
- **Footer, verbatim, every commit:** `Authored and reviewed by Basho Parks, Copyright 2026`.
- **Never** credit an AI co-author. This **overrides** the Claude Code default `Co-Authored-By` trailer and any repo handoff text.
- Plain-speak subject/body; no marketing adjectives, no emoji, no AI-tell slop.
- One unit of work = one focused commit. DEVLOG entry per prompt (I.10).
- *Layer-3 owner:* **git `commit-msg`** hook (assert footer present, reject slop) + a staged-diff **AI-artifact scan**.

### I.4 — Push policy
- Basho is the reviewer and the pusher. Push **only** when explicitly told (any phrasing) — the request itself is the review. Execute on the first try; don't defer.
- Never volunteer a push. Never `--force` without an explicit force instruction.
- *Layer-3 owner:* none (intent). Layer-2 only.

### I.5 — Worktrees are for parallelism only
- **A worktree is for genuine parallelism, never a default.** Only when two or more sessions/agents run concurrent tracks does each take its own git worktree — never share a git index; coordinate cross-track merge-hotspot files per the active plan. A single, serial task uses no worktree and no branch: it works on `main` (§I.5b).
- *Layer-3 owner:* Layer-2 + the `SessionStart` brief (III.1) — it reports the current branch and that `main` is the default, and never tells a serial task to branch.

### I.5b — Default to `main`; branch only when the task demands it
- **Work directly on `main` by default.** Read the task before touching git topology: an ordinary, single unit of work commits straight to `main` — no branch, no worktree, nothing spun up "out of the gate."
- **Branch only when the task genuinely needs isolation:** concurrent sessions committing in parallel (each takes its own `session/<short-topic>` branch / worktree per §I.5), or a risky spike you may discard — then integrate with `git switch main && git merge --no-ff session/<short-topic>` when the unit is done. A session that lands on an auto-created branch it doesn't need should switch to `main`.
- `main` is live (GitHub Pages) — commits and merges are local; only Basho pushes (§I.4).
- The gates **must fail safe**: a hook may block a genuinely corrupt/secret-leaking commit, but must never reject a well-formed one for a tooling reason (missing binary extension, a legitimate HTML partial, a failed `mktemp`/`awk`). A gate that claps clean work is a defect, fixed — not tolerated.
- *Layer-3 owner:* `pre-commit` **warns** (never blocks) on a direct `main` commit; `commit-msg` always exits 0; the truncation/secret scans use a text allowlist + full-document HTML test so unknown/binary/partial files pass.

### I.6 — Deliverables land somewhere findable
- Reports/handoffs/deliverables go at the **top-level project folder**, never buried in a worktree or deep `docs/` path. **Lead the reply with the exact path.**
- *Layer-3 owner:* Layer-2 only.

### I.7 — Bucket = the ship pipeline
- "Bucket" (any variant) = the full ship: build `dist/` → tag + push `vX.Y.Z` → upload artifacts to R2 → create/clobber the GitHub release → purge the CDN cache. One command where a script exists; never do the release/upload/purge dance by hand.
- *Layer-3 owner:* the `bucket` script + release CI. Gated behind an explicit "Bucket" instruction (I.4).

### I.8 — Secrets never touch the repo, the prompt, or the logs
- No API keys, OpenBao/Vault tokens, cloud creds, private keys — not in commits, not pasted into prompts, not echoed into transcripts. Secrets live in the OS keystore / OpenBao only.
- *Layer-3 owner:* **`pre-commit` secret scan** (gitleaks-style) + **`UserPromptSubmit`** prompt scan (III.1).

### I.9 — Writes are truncation-safe
- After every file write, **verify** (`wc -l` + `tail`); a file may never be left truncated. Prefer atomic patches over whole-file replacement for large files. (Scar tissue: the CoWork FUSE sync truncation — see `SESSION-RULES.md`.)
- *Layer-3 owner:* **`PostToolUse`** post-write verify + **`Stop`** end-of-turn truncation sweep (III.1).

### I.10 — DEVLOG discipline
- Every prompt/unit logs to the phase DEVLOG: id, files touched, verify result, commit SHA. State outcomes honestly — red tests said as red.
- *Layer-3 owner:* **`PreCompact`** persist (so a long session's log survives compaction) + Layer-2.

### I.11 — No build-process artifacts in committed source
- Committed source is the product, not the transcript of how it was built. Never in a commit: build-phase markers (`Session <N>`, `BF-<N>`, bare `S##` roster shorthand, "plan-spec scaffold", "deliverable" as completion language); dangling references (files/tickets/symbols cited but absent); disguised incompleteness (leading `Stub:`/`Placeholder:` confessions, "for now,", `todo!()`/`unimplemented!()` in shipped paths).
- Unfinished work is finished, feature-gated, or an honest `TODO(owner): …` — never dressed up as complete, and never deleted to fake completeness (I.10).
- Provenance lives in git history, `PLANNING/`, and DEVLOGs — those locations are exempt. Vetted exceptions carry an inline `slop-ok: <reason>`.
- *Layer-3 owner:* `tools/no-slop-scan.sh` wired into `pre-commit` (staged, blocks new) + `pre-push` (full-tree, zero remain); mirrored in `mai/.integrity/`; seeded globally via `git config --global init.templateDir` so every new repo is born gated.

### I.12 — Continuous deployment is serialized — never race a live deploy
- Any pipeline that publishes to a live target (GitHub/Cloudflare Pages, container registries, release assets, CDN purge) **must** carry an explicit concurrency gate: one production deploy at a time, an in-flight deploy is **never** cancelled, overlapping triggers **queue**. Parallel and rapid pushes to a deploy branch are normal on this stack (I.5) — the pipeline, not luck, keeps them from colliding.
- Never rely on a platform's implicit/auto deploy that has no concurrency control and fails opaquely under overlap — e.g. GitHub Pages "deploy from a branch" (`build_type: legacy`), which races on near-simultaneous pushes and reports only "Deployment failed, try again later." A stuck publish is diagnosed at the **pipeline** (`gh run list`, `gh api .../pages`), never by re-pushing and hoping.
- *Layer-3 owner:* the committed pipeline definition — `.github/workflows/pages.yml` carrying `concurrency: { group: pages, cancel-in-progress: false }`, with Pages source pointed at that workflow (`build_type: workflow`, never `legacy`); a committed `.nojekyll` keeps the artifact served verbatim. The workflow file **is** the owner; the platform default is not.

### I.13 — Stop at done: no unrequested verification, no proactive follow-ups
- The task's scope is the whole job. When the requested change is made and its stated goal is met, **stop** — report the outcome in the fewest true words and end the turn. Work being *done* is the signal to leave, not to hunt for more.
- **One confirmation, not a battery.** A single check that it works is enough; a passing check is a stopping point, not a licence to run three more — no re-probing what already greened, no cache-header / dimension / attribute re-audits, no "while I was here" sweeps, no gold-plating. Unrequested verification is waste, not diligence: extra audits, re-encodes, re-measures, and sweeps happen **only** on explicit request. Silence is not a request.
- **Don't volunteer next steps.** Finish and go quiet; never offer to keep helping or enumerate what you *could* do next. A genuine blocker or real risk gets one line, then stop. Over-checking is over-engineering — the same defect as gold-plating the work, the same fix.
- *Layer-3 owner:* none possible (judgment) — Layer-2 only, the model honoring it each turn. → `CLAUDE.md`. No hook can un-spend the tokens an unrequested probe already cost; a breach is prevented by not doing it, never caught after.

---

# PART II — SOVEREIGNTY STACK CANON (WSF + AOG / Lamprey / MAI)

### II.1 — Reuse mandate
Extend the existing **Lamprey MAI** Rust workspace (~100K LOC, RC2, 1,196+ tests). MAI is reused, extracted, hardened — **not rebuilt**. The WSF boundary is enforced by **crate boundaries + published schemas**, not repo separation. Delete stale clones so no session edits them.

### II.2 — The Rust verify gate (binds I.2 to this stack)
`cargo check --workspace` · `cargo clippy --workspace -- -D warnings` · `cargo test --workspace` (no new `#[ignore]` on trust-adjacent code) · `cargo fmt --check` · console `tsc --noEmit` (app+node) + `vitest run`.

### II.3 — No-mock-only closure for trust paths  (load-bearing)
Any change touching **token issuance, envelope seal/unseal, receipt chain, cred brokering, or policy decision** must ship ≥1 test against a **live OpenBao** (Docker service container) or a live cloud-STS emulator (LocalStack). A mock-only test does **not** satisfy the gate for these paths.
- *Layer-3 owner:* CI service-container job (PSPR §0.7).

### II.4 — Air-gap fidelity
The product's whole value is air-gapped inference. Therefore **our own** build/test must run offline: no test may require public network egress; no accidental cloud call during a local run. Egress is allowlisted, not assumed.
- *Layer-3 owner:* **PROPOSED** `PreToolUse` egress guard (block `curl`/`wget`/`Invoke-WebRequest` to non-allowlisted hosts during build/test) + CI run with networking disabled for the unit lane.

### II.5 — Dependency & advisory gate
`cargo audit` / `cargo deny` (advisories + licenses) clean; `npm audit --omit=dev` clean. Named blocker on record: **RUSTSEC-2025-0144 (ml-dsa timing)** must be resolved or signed-waived before signing-path code lands (PSPR §0.6).
- *Layer-3 owner:* `pre-push` + CI.

### II.6 — SBOM + signed builds on release
Every release emits an SBOM (syft) and is code-signed. (Signing cert is an owner action; until it exists, releases carry an explicit "unsigned" note — never silently.)
- *Layer-3 owner:* release CI (SBOM job) + Bucket.

### II.7 — Provenance / receipts (dogfood our own doctrine)
"Controls live outside the model." We hold our *own* agentic work to it: agent tool actions (edits, commands, mutations) are recorded to an append-only, hash-chained session audit log — the same shape WSF receipts take.
- *Layer-3 owner:* **ACTIVE** — `PostToolUse` `audit-log.sh` (hash-chained → `~/.claude/audit/actions.jsonl`).

### II.8 — Data-classification discipline (HIPAA / ITAR / OCAP)
Never paste PHI, ITAR-controlled technical data, or OCAP-governed material into a cloud model context (including this assistant). Classified data is envelope-first / local-model-only. This is both product ethos and operational rule.
- *Layer-3 owner:* **PROPOSED** `UserPromptSubmit` classifier warn + Layer-2.

---

# PART III — THE ENFORCEMENT MAP (what you're forgetting)

You asked about webhooks and pre/post-tool skills. Here is the full surface. **ACTIVE** = wired today. **PROPOSED** = recommended, not yet built.

### III.1 — Claude Code hooks (`~/.claude/settings.json`) — fire *inside agent sessions only*
| Event | Recommended use here | Status |
|---|---|---|
| `PreToolUse` (Write) | block whole-file Write (CoWork truncation defense) | **REMOVED** 2026-07-03 — dead schema; Write is safe on native Windows |
| `PreToolUse` (Bash) | RTK token-killer rewrite | **ACTIVE** (`rtk hook claude`) |
| `PreToolUse` (Bash) | **guard** `--no-verify`, bare force-push (allows `--force-with-lease`), `rm -rf` on root/home | **ACTIVE** (`guardrail.sh`) |
| `PostToolUse` (Edit/Write) | **auto-format** touched file (`rustfmt`; project-local `prettier`) | **ACTIVE** (`autoformat.sh`) |
| `PostToolUse` (any) | **audit logger** — hash-chained record of every action (II.7) | **ACTIVE** (`audit-log.sh`) |
| `UserPromptSubmit` | **secret-in-prompt scan** — block private keys / vault tokens (I.8) | **ACTIVE** (`prompt-secret-scan.sh`) |
| `SessionStart` | current branch/status, active plan, gate reminders — `main` by default; worktree only for genuine parallel tracks (§I.5/§I.5b) | **ACTIVE** (`session-brief.sh`) |
| `PreToolUse` (Bash) | **egress guard** — deny non-allowlisted network during build/test (II.4) | **PROPOSED** |
| `PostToolUse` (Edit) | **AI-slop scan** the diff (emoji, tell-phrases) | **PROPOSED** (partial: git `pre-commit` warns) |
| `UserPromptSubmit` | classification warn (II.8) + inject active-PSPR reminder | **PROPOSED** |
| `Stop` / `SubagentStop` | truncation sweep, "DEVLOG updated?", uncommitted-trust warning | **PROPOSED** |
| `PreCompact` | persist running DEVLOG / handoff before compaction (I.10) | **PROPOSED** |
| `Notification` | route approval-needed / run-done / gate-failed to a webhook (III.4) | **PROPOSED** (target TBD) |

### III.2 — Git hooks (`core.hooksPath`) — fire on *every* commit by *any* actor
This is the real owner of "before each commit," because it binds human-in-PowerShell too.
- **This repo (`islandmountain`, `tools/hooks/`)** — **ACTIVE** (2026-07-03): `commit-msg` (auto-stamp footer + strip AI credit), `pre-commit` (NUL/truncation + `</html>` + high-confidence secret scan; AI-artifact WARN), `pre-push` (site-wide HTML integrity).
- **`im-mighty-eel-mai` (`.integrity/hooks/`)** — **ACTIVE** (2026-07-03): added `commit-msg` (footer) + `pre-push` (`cargo fmt --check` + pushed-diff secret scan; clippy/test → CI). Their pre-existing anti-truncation `pre-commit` and `core.hooksPath` were left intact.
- Full V&V ladder (lint/typecheck/tests) stays in **CI** (III.3) so local commits/pushes stay fast.

### III.3 — CI (GitHub Actions) — the un-bypassable server-side backstop
Per PSPR §0.7, turn the commented lanes on: `cargo test --workspace` **on push** (not nightly-only), `cargo audit`/`deny`, `hadolint`, **SBOM (syft)**, **LocalStack** (AWS STS), **live OpenBao** service container, `tsc`+`vitest` job. This is the only gate `--no-verify` cannot dodge.

### III.4 — Webhooks (outbound) — the "webhooks" you meant
- **Notification hook → Slack / Discord / ntfy / PagerDuty:** approval-needed, long-run-done, gate-failed.
- **Release / Bucket webhook:** on `gh release create` → notify + Cloudflare cache purge (already in the Bucket pipeline).
- **CI status webhook:** red `main` → alert. (GitHub-native or via the Notification path.)

### III.5 — Skills to standardize (not just ad-hoc)
| Skill | When | Status |
|---|---|---|
| `/security-review` | before merge/ship of **any** trust-adjacent code (this is a security product) | standardize |
| `/code-review` | before commit/merge, at a defined effort tier | standardize |
| `safe-edit` | mandatory for every file under `mai/` (PSPR §0.4) — re-verify it still applies on native Windows | mandatory |
| `/verify` | run the app and confirm real behavior, not just green tests | standardize |
| project `gate` skill | one command that runs the whole I.2 ladder | **PROPOSED** (new) |
| project `devlog` skill | append a structured DEVLOG entry (I.10) | **PROPOSED** (new) |

---

# PART IV — GLOBALIZATION ("recognized across all projects") — ✅ DONE 2026-07-03

1. ✅ **Part I extracted** to `~/.claude/CANON.md`, imported from `~/.claude/CLAUDE.md` via `@CANON.md` (alongside `@RTK.md`). Part I now applies to every project.
2. ✅ **Part II stays project-local** (this file).
3. ✅ **Leak untangled:** the home `C:\Users\17076\CLAUDE.md` was byte-identical to the Lamprey Harness project's own copy, so it was renamed to `CLAUDE.md.bak` (project copy retained). Electron-app instructions no longer bleed into other projects.
4. ✅ **Enforcement per-repo:** git hooks via `core.hooksPath` in `islandmountain` (`tools/hooks/`) and `im-mighty-eel-mai` (`.integrity/hooks/`); Claude Code hooks global in `settings.json`.

---

## Appendix — decisions & remaining
- [x] Globalize Part I — done (Part IV).
- [x] First enforcement layer — git hooks (both repos) + Claude Code hooks — done.
- [x] Commit-footer history — `islandmountain` normalized (316 commits, local; awaits force-push); `im-mighty-eel-mai` enforce-forward-only (50 AI-credited commits left as history).
- [ ] Notification webhook target (Slack / Discord / ntfy) — skipped for now; III.4 pending.
- [ ] CI lanes (III.3 / PSPR §0.7) — not yet wired.
- [ ] `/security-review` as a standing pre-merge gate — not yet standardized.
- [ ] Confirm `safe-edit` / anti-truncation rules still needed on native Windows (PSPR §0.4).

*Changelog: v0.3 (2026-07-05) — added I.13 (stop at done; no unrequested or proactive verification). v0.2 (2026-07-03) — statuses reconciled to reality: Claude Code hooks + git hooks (both repos) ACTIVE; globalization done; dead Write hook removed. v0.1 — initial draft.*
