# Sovereignty Stack (WSF + AOG) — Session Handoff

**Written:** 2026-07-03, end of the M2 tool-governance session.
**Read this, then** `docs/sessions/SOVEREIGNTY-DEVLOG.md` (every prompt logged) and the
plan `PLANNING/AOG-WSF-SOVEREIGNTY-STACK-PSPR.md`. The auto-memory
`aog-wsf-product-initiative` also carries the current state.

---

## 0. TL;DR — where we are

**M1 "sovereign shadow" is SHIPPABLE** — both containerized `docker compose up` gates
are green (D1 appliance end-to-end, D2 shadow config+startup). **M2 is in progress:**
**Phase G is complete (G1–G10)** and **Phase T is T1–T4 complete** (the tool-governance
core / agentjacking defense). Full workspace: **`cargo test --workspace` = 1788 passed /
2 ignored / 0 failed** (135 suites).

**Nothing is pushed.** Push only on Basho's explicit instruction (CANON §4).

## 1. Resume protocol

```
Worktree (do ALL work here):
  C:\Users\17076\Documents\Claude\Mighty Eel OS\mai-worktrees\mai-SOV-1
Branch:  session/SOV-1   HEAD = 9c136e5   (NOT pushed)
Tooling: cargo 1.9x / node 24 / Docker 29 / Python 3 — all present.
NOTE (2026-07-05): the whole Mighty Eel OS workspace was un-nested from the
Island Mountain website repo and moved to C:\Users\17076\Documents\Claude\Mighty Eel OS\.
Any "...\Island Mountain\Island Mountain Mighty Eel OS\..." path elsewhere in this
handoff is stale — read it under the new base. The two repos are independent.
```

- **Commit footer (CANON §3, verbatim, every commit):**
  `Authored and reviewed by Basho Parks, Copyright 2026` — **never** an AI co-author.
- **Verify gate (every prompt):** `cargo clippy -p <crate> --all-targets -- -D warnings
  -A clippy::pedantic` + `cargo fmt -p <crate> --check` + `cargo test -p <crate>` +
  `cargo check --workspace`. **No-mock-only closure:** any prompt touching token issuance
  / envelope / receipt chain / cred brokering / policy decision ships a live-OpenBao test
  (spin a dev container: `docker run -d --name … --cap-add IPC_LOCK -p 8200:8200
  openbao/openbao:latest server -dev -dev-root-token-id=root -dev-listen-address=0.0.0.0:8200`,
  then run env-gated tests with `WSF_OPENBAO_ADDR=http://127.0.0.1:8200`).
- **Pre-commit hook** (`.integrity/hooks/pre-commit`) runs on every commit (null-byte /
  truncation / brace-balance / `cargo fmt --check`). Native Windows — `safe-edit` is
  advisory (Write/Edit hit NTFS, not a sandbox sync layer); keep the hygiene anyway.

## 2. What this session did (11 commits, c7b63bc-parent → 9c136e5)

- **D1b `8eebb0e` / D2b `c7b63bc`** — ran the deferred containerized gates. D1 appliance:
  full stack up, `vk_demo` governed completion → `200` + `x-aog-*` headers, status/usage/401,
  console + nginx proxies + real SPA login. D2 shadow: openai provider registered, shadow
  routing wired; live OpenAI completion owner-gated on a real key. **M1 shippable.**
- **grandfather `93455e4`** — added the 15 Phase-0/F pre-CANON commits (old AI co-author
  footer) to `.github/workflows/commit-msg-check.yml` `legacy_skip`. Verified: the CI check
  over `main..HEAD` = 0 failures. **Pre-push footer concern resolved** (no squash needed).
- **G8 `917a211`** — tokenization on egress (reversible placeholder swap, cloud sees
  placeholders, response detokenized, receipted). **G9a `759c486`** — budget decrement
  (in-memory `SpendLedger`, exhaustion blocks mid-session, 402). **G9b `44c6180`** —
  revocation kill-switch (bridge-signed snapshot from OpenBao → `Revoked` 403;
  **live-OpenBao proven**). **G10 `fec5b54`** — ROI recommender (`GET /v1/roi`).
  **→ Phase G (G1–G10) complete.**
- **T1 `14cdeaa`** — `crates/aog-toolproxy` (new): the governed tool proxy — validate →
  execute via `ToolExecutor` seam → receipt to a fabric-proof chain. **T2 `0647659`** —
  per-call `CredentialMinter` seam (ephemeral cred, revoked at call end, no standing cred).
  **T3 `5fd106d`** — `crates/aog-approvals` (new): the approval inbox (block-until-approved,
  decision+actor receipted, `ApprovalGate` seam, e2e proxy→inbox test). **T4 `9c136e5`** —
  provenance tagging / agentjacking defense (untrusted-context mutation can't auto-execute).

## 3. What's next — M2 remaining

- **T5** egress scanning of tool results (redact secrets/PHI before the model sees them —
  reuse mai-compliance detectors). **T6** mission contracts (declared scope; deviation
  blocks). **T7** session record + replay (into the ledger). **T8** tool-governance
  hardening (fail-closed unknown-tool deny, blast-radius caps, per-token allowlists).
- Then **C5–C7** (console: approval inbox, policy studio, session replay), **D3–D5**
  (signed supply chain, HIPAA pack v1, live-backend suite). Then **M3**.

## 4. Decisions / gotchas a new session MUST honor

1. **Footer = CANON §3**, never an AI co-author. Pre-CANON commits are grandfathered in
   `legacy_skip` (§2) — don't re-add or squash them without Basho's word.
2. **Tool-governance seams** the rest of Phase T builds on (all in `aog-toolproxy`):
   `ToolExecutor` (execution), `CredentialMinter` (T2 creds — wire the real wsf-bridge STS
   broker here later), `ApprovalGate` (T3 inbox), `InvokeContext.untrusted` (T4 provenance).
   T5 wraps the executor's output; T6/T8 gate inside `invoke`.
3. **Windows stack:** any binary doing ML-DSA/crypto runs its tokio runtime on a 16 MB
   `std::thread` (the appliance service binaries do).
4. **Two new workspace crates:** `crates/aog-toolproxy`, `crates/aog-approvals`.
5. **Push:** nothing pushed; `main` is live; push only when Basho says so.

## 5. State-verification commands
```bash
cd "…/mai-worktrees/mai-SOV-1"
git branch --show-current            # session/SOV-1
git log --oneline d481f5b..HEAD      # D1b..T4 (11 commits)
git status --short                   # clean
cargo test --workspace               # 1788 passed / 2 ignored / 0 failed
ls crates/                           # + aog-toolproxy, aog-approvals
```
