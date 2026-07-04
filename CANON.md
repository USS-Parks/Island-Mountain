# CANON — Engineering & Agentic Operations Doctrine

**Scope:** Island Mountain — **WSF** (Woven Sovereignty Fabric, trust plane) + **AOG** (Agentic Orchestration Governance, control plane) · console codename **Lamprey** / public **Aeneas** · foundation **Lamprey MAI**.
**Author:** Basho Parks · **Status:** DRAFT v0.1 — awaiting review. Items marked **PROPOSED** are *not yet wired*.
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

### I.5 — Parallelism = worktrees
- Parallel/agent tracks run in **separate git worktrees** — never share a git index. Coordinate cross-track merge-hotspot files per the active plan.
- *Layer-3 owner:* Layer-2 + a `SessionStart` reminder (III.1).

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
- *Layer-3 owner:* **PROPOSED** `PostToolUse` audit-logger.

### II.8 — Data-classification discipline (HIPAA / ITAR / OCAP)
Never paste PHI, ITAR-controlled technical data, or OCAP-governed material into a cloud model context (including this assistant). Classified data is envelope-first / local-model-only. This is both product ethos and operational rule.
- *Layer-3 owner:* **PROPOSED** `UserPromptSubmit` classifier warn + Layer-2.

---

# PART III — THE ENFORCEMENT MAP (what you're forgetting)

You asked about webhooks and pre/post-tool skills. Here is the full surface. **ACTIVE** = wired today. **PROPOSED** = recommended, not yet built.

### III.1 — Claude Code hooks (`~/.claude/settings.json`) — fire *inside agent sessions only*
| Event | Recommended use here | Status |
|---|---|---|
| `PreToolUse` (Write) | block whole-file Write → force atomic Edit (truncation defense) | **ACTIVE** (`block-write-tool.sh`) |
| `PreToolUse` (Bash) | RTK token-killer rewrite | **ACTIVE** (`rtk hook claude`) |
| `PreToolUse` (Bash) | **guard** `git commit --no-verify`, `push --force`, `rm -rf`, destructive DB ops | **PROPOSED** |
| `PreToolUse` (Bash) | **egress guard** — deny non-allowlisted network calls during build/test (II.4) | **PROPOSED** |
| `PreToolUse` (Bash) | **commit gate** — run the fast verify subset before `git commit` (belt-and-braces with the git hook) | **PROPOSED** |
| `PostToolUse` (Edit) | **auto-format + lint** the touched file (`cargo fmt`/`clippy`, `prettier`/`eslint`) so the tree stays green | **PROPOSED** |
| `PostToolUse` (Edit) | **AI-slop scan** the diff (emoji, tell-phrases, forbidden co-author footer) | **PROPOSED** |
| `PostToolUse` (any) | **audit logger** — append hash-chained record of every action (II.7) | **PROPOSED** |
| `PostToolUse` (Edit/Write) | **post-write verify** — `tail`/`wc -l`, flag truncation (I.9) | **PROPOSED** |
| `UserPromptSubmit` | secret-in-prompt scan (I.8) + classification warn (II.8) + inject active-PSPR reminder | **PROPOSED** |
| `SessionStart` | print branch/status, active milestone, worktree reminder, refresh revocation snapshot | **PROPOSED** |
| `Stop` / `SubagentStop` | end-of-turn: truncation sweep, "DEVLOG updated?", warn on uncommitted trust-adjacent changes | **PROPOSED** |
| `PreCompact` | persist running DEVLOG / handoff before context is compacted (I.10) | **PROPOSED** |
| `Notification` | route "needs approval" / "run done" to a webhook (see III.4) | **PROPOSED** |

### III.2 — Git hooks (`core.hooksPath`, versioned in `tools/hooks/`) — fire on *every* commit by *any* actor
This is the real owner of "before each commit," because it binds human-in-PowerShell too.
- **`pre-commit`** — fast verify subset (fmt + lint + typecheck + affected unit tests) + secret scan + AI-slop scan. Red → commit refused.
- **`commit-msg`** — assert the exact footer (I.3); reject slop/marketing/emoji; enforce plain-speak caps.
- **`pre-push`** — full V&V ladder (I.2) + `cargo audit`/`deny` (blocks pushing a red branch even if a commit slipped through).
- **PROPOSED** for both repos. (Lamprey Harness already ships `scripts/hooks/commit-msg` + `check-ai-artifacts.cjs` — reuse that pattern here.)

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

# PART IV — GLOBALIZATION PLAN ("recognized across all projects from now on")

1. **Extract Part I** into `~/.claude/CANON.md` and import it from `~/.claude/CLAUDE.md` via `@CANON.md` (mirrors the existing `@RTK.md` pattern). That — and only that — makes Part I genuinely global.
2. **Keep Part II project-local** (Rust/OpenBao/air-gap/HIPAA specifics don't belong in every project).
3. **Untangle the accident:** `C:\Users\17076\CLAUDE.md` is the *Lamprey Harness* project file sitting in your home dir, so its Electron-specific instructions leak into **every** project under `C:\Users\17076\` (including Island Mountain). Move it into the Lamprey Harness project directory so it stops applying by accident; promote only the truly-universal lines into the global `CANON.md`.
4. **Enforcement is per-repo, not global:** git hooks live in each repo's `tools/hooks/` and are wired with `core.hooksPath`. Claude Code hooks are global (`settings.json`) but the heavy commit-gate lives in git so humans are covered too.

---

## Appendix — open decisions
- [ ] Approve globalizing Part I (step 1 above)?
- [ ] Which enforcement layer to build first — git hooks / Claude Code hooks / CI?
- [ ] Notification webhook target (Slack? Discord? ntfy?) — needed before III.4.
- [ ] Confirm `safe-edit` still required on native Windows, or downgrade to "recommended" (PSPR §0.4 leaves this open).

*Changelog: v0.1 (2026-07-03) — initial draft.*
