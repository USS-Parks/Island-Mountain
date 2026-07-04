# MAI De-Slop — P-SPR (Plan · Sequential Prompt Roster)

- **Repo:** `im-mighty-eel-mai` (`Island Mountain Mighty Eel OS/mai/`)
- **Branch:** `cleanup/artifact-audit`
- **Author:** Basho Parks · **Date:** 2026-07-04
- **Status:** **STS EXECUTED 2026-07-04 — sweep COMPLETE, all gates green.**
  Full ladder: no-slop full scan clean (mai + IM) · `cargo check` green ·
  `fmt --check` clean · py_compile 56 files OK · `ruff` clean ·
  **`cargo test --workspace` 1831 passed / 0 failed / 2 ignored**.
  Gate extended beyond plan: plural `Sessions NN`, bare `S05–S49` roster
  shorthand, confession-shape STUB (`Stub:`/`Placeholder:` leading, `for now,`).
  Propagated: IM `tools/hooks` wired + `tools/no-slop-scan.sh`; CANON §I.11
  added to repo CANON; global `init.templateDir` seeded (`~/.git-template`).
  **Descoped (explicit):** `SHIP-NN`/`SOV-NN`/`LOOM-NN` refs (391 sites,
  mostly CI comments) — that taxonomy is actively written by the in-flight
  M3 Loom STS (`session/LOOM-1`); gating it now would wedge the parallel
  build. Follow-on decision for Basho. Crate-level `#![allow(unused_variables,
  dead_code, missing_docs)]` (11 files) also deferred: force-warn measurement
  shows hundreds of sites; a code-change campaign, not a comment sweep.

## Goal
Eradicate AI build-process artifacts from **committed source**, and make reintroduction
impossible via a Layer-3 git gate — canonical (CANON §11) and global. Zero-tolerance
scope per Basho (2026-07-04).

## Trigger + audit assessment
External audit (2026-07-04) alleged pervasive "AI slop." Verified against the tree:
- **Concrete claims TRUE** — dangling doc refs, crate-wide `#![allow]`, ~hundreds of `Session NN`
  comments, scheduler placeholders, a signature-pinning "test."
- **Verdict OVERSTATED / one claim WRONG** — the Ollama `generate_batch` sequential loop is the
  *correct* implementation (Ollama has no batch endpoint) and is honestly documented; the manual
  CLI parser is a deliberate SHIP-02 stop-gap; the token estimate is a labeled heuristic. Not slop.
- **Root cause** — the project was built against a real 46-session roster (`MAI-BUILD-PROMPT-ROSTER-v2`);
  the session taxonomy leaked from planning docs into shipped source. Fix = scrub from source,
  keep in `PLANNING/`/DEVLOG. Not hallucination (except the one genuinely-missing SCAN-1 doc).

## Verified scope — `no-slop-scan.sh full`, 2026-07-04 (gate-scoped)
| Cat | Count | Notes |
|-----|-------|-------|
| PROV | 418 / 203 files | Session 321, BF- 109, plan-spec 5, S# hookup 1 |
| STUB | 68 | majority legit domain terms (PHI/PII "placeholder", "no stub" assertions); ~15-25 real stubs |
| DOC | 3 | `docs/architecture.md`, `docs/pqc.md`, `docs/sentinel.md` |
| DEBT | 1 | `mai-api/src/metrics.rs` `"Bearer XXX"` redaction example |
| UNFIN | 0 | clean |
| **Total** | **490** | what the gate demands to reach zero |

Out of gate by design (legitimate provenance, left in place): ~270 `Session` refs in `*.md`,
`PLANNING/`, `**/sessions/`, DEVLOG, ROSTER, CLAUDE.md; the sibling `local_gitdoctor_scan.py`
scanner (contains the vocabulary as data, like `no-slop-scan.sh` itself).

## Non-goals
- Not rewriting correct/defensible logic the audit disliked (Ollama batch loop, CLI parser, token est).
- Not deleting real debt to fake completeness (§10). Real stubs → honest `TODO(owner):` or implement.
- Not mangling PHI/PII terminology where "placeholder" is the technical term.

## Foundation — LANDED (uncommitted, this branch)
- **CANON §11** added to global `~/.claude/CANON.md` — doctrine.
- **`.integrity/scripts/no-slop-scan.sh`** — scanner: `staged` (added-line) + `full` (tree) modes;
  `slop-ok: <reason>` escape; self-exempts scanner/CANON/docs/planning/roster/sessions/gitdoctor.
- **Wired** — `.integrity/hooks/pre-commit` (staged, blocks new) + `pre-push` (full, zero-remain).
- **Validated** — full scan 3s; staged probe blocks Session+TODO+`todo!()` (exit 1); self-exclusion clean.

## Roster (STS — each phase greens before the next)
1. **DOC (3)** — create the doc, repoint to a real one, or drop the citation. Cheapest first.
2. **PROV · Python (adapters, SDK, apps)** — Session/BF/deliverable in docstrings/comments. `ruff`/compile green.
3. **PROV · Rust (core, api, router, scheduler, compliance, vault, …)** — comments. `cargo check` green per crate group.
4. **PROV · config/proto/sh (toml, proto, shell)** — comments.
5. **STUB (68)** — triage: real stub → `TODO(owner):`/implement; legit domain/meta → `slop-ok: <reason>`.
6. **DEBT (1)** — reword or annotate the redaction example.
7. **Verify gate green** — `no-slop-scan.sh full` == clean; `cargo test --workspace`; `ruff`/`mypy`.
8. **Propagate** — IM `tools/hooks` + `git config --global init.templateDir`; optional CI job.
9. **Commit** — sanitized tree, canon footer via hook, focused commits. Push only on explicit instruction.

## Verify gates
Per phase: `no-slop-scan.sh staged` clean on touched files + language check green (`cargo check` / `ruff`).
Final: full scan clean + `cargo test --workspace` + `ruff`/`mypy`.

## Completion criteria
`no-slop-scan.sh full` → clean (0) · `cargo test --workspace` green · both repos gated · global
template seeded · DEVLOG updated · branch ready to push on command.

## Approval
DRAFT — foundation authorized and landed. **Sweep (phases 1–9) awaits explicit "run it STS."**
