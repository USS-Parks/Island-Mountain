# Sovereignty Stack — WSF + AOG — Plan / Sequential Prompt Roster (P-SPR)

**Initiative:** Island Mountain sales & customer-service division — two coordinated products
**Products:** **WSF** (Woven Sovereignty Fabric — trust plane) + **AOG** (Agentic Orchestration Governance — control plane)
**Codename in-flight:** the cloud-security console shipped at islandmountain.io/aeneas.html is the first external consumer of WSF (build codename **Lamprey**; public name Aeneas).
**Foundation:** extends the existing **Lamprey MAI / im-mighty-eel-mai** Rust workspace (~100K LOC, RC2, 1,196+ tests). MAI is reused, extracted, and hardened — not rebuilt.
**Author:** Basho Parks + Claude · **Created:** 2026-07-03 · **Status:** DRAFT — awaits explicit STS sign-off before any code.

---

## §0 — Governance (source of truth for this phase)

### 0.1 Where this builds
Primary repo: **`im-mighty-eel-mai`** (authoritative working copy: `Island Mountain Mighty Eel OS/mai/`; origin `USS-Parks/im-mighty-eel-mai`). We extend the existing Cargo workspace with new crates + services and add a `console/` app. Rationale: ~100K LOC of tested, conventioned Rust + the TLM OpenBao integration already live here; a port to a fresh repo is pure cost. The WSF boundary is enforced by **crate boundaries and published schemas**, not by repo separation.
The stale clone at `Documents/VS Code Lamprey Repo Clone/im-mighty-eel-mai` is **disposable** (pre-TLM). Delete it at 0.1 so no session ever edits it.

### 0.2 Stack (settled)
- **Rust** for every data-path service, the broker, and the fabric crates (reuse mandate).
- **React 19 + TypeScript + Vite + Tailwind** for the console (inherits Lamprey Harness "panels" UX DNA). Replaces the FastAPI/Jinja2 `compliance-dashboard/`.
- **OpenBao** (official image) as the trust core. **Postgres** for service state; **object store** (S3-compatible / MinIO on-prem) for sealed envelopes + evidence.
- Data path: axum + tonic (resolve the 0.7/0.8 `Handler` conflict properly — see 0.6).

### 0.3 Verify gate (every prompt must pass before `[x]` + commit)
1. `cargo check --workspace` and `cargo clippy --workspace -- -D warnings -A clippy::pedantic` clean.
2. `cargo test --workspace` green; **no new `#[ignore]` on trust-adjacent code**.
3. `cargo fmt --check` clean.
4. Console prompts: `tsc --noEmit` (app + node configs) + `vitest run` green.
5. **No-mock-only closure rule (load-bearing):** any prompt touching token issuance, envelope seal/unseal, receipt chain, cred brokering, or policy decision must ship at least one test against a **live OpenBao Docker service** (CI service container via `start-openbao.ps1` Docker path) or a live cloud STS emulator (LocalStack for AWS). A mock-only test does not satisfy the gate for these paths.
6. `cargo audit` / `cargo deny` gate — no new advisories; the `ml-dsa` timing advisory (RUSTSEC-2025-0144) must be resolved or explicitly waived **before** F1 lands (see 0.6).

### 0.4 Commit + DEVLOG discipline
- One prompt = one focused commit (or a tight bundle), co-author footer per repo convention.
- **Worktree per parallel track** (`tools/Session-Worktree.ps1`) — only when concurrent tracks actually run; parallel tracks never share a git index. A single serial session works on `main` (CANON §I.5/§I.5b).
- **`safe-edit` skill** is mandatory for every file under `mai/` (verify it still applies on native Windows at 0.1; if the CoWork truncation bug is gone, downgrade to "recommended" and record that in the plan — do not silently ignore a mandatory skill).
- Log every prompt in a new `docs/sessions/SOVEREIGNTY-DEVLOG.md`: prompt id, files, verify result, commit SHA.

### 0.5 STS / approval
Drafting this file is not authorization. Execute the roster in order only after Basho says "run it STS" (or approves specific phases). Milestones (0.7) may be approved independently.

### 0.6 Phase-0 blocking fixes (must precede reuse)
- **RUSTSEC-2025-0144 (ml-dsa timing):** the entire trust story rests on ML-DSA-87 signatures. Pin to a constant-time release, swap the crate, or gate signing behind a HW/OpenBao-transit path — and document the decision. Blocks F1.
- **axum 0.7/0.8 dual-`Handler`:** the current `post_service(service_fn(...))` workaround will not scale to the gateway's handler surface. Resolve at the workspace level (align axum versions / isolate tonic) so AOG handlers use normal `post(handler)`.

### 0.7 Milestones (staged shippability — the roster is comprehensive but ships in cuts)
- **M1 — Sovereign shadow (v1):** WSF core (token + receipt + OpenBao) + AOG gateway in **shadow mode** over one cloud (AWS) + HIPAA policy pack + minimal console. Proves anti-lock-in + ROI visibility with zero enforcement risk. Prompts: Phase 0, F1–F6, W1–W6, G1–G7, C1–C4, D1–D2.
- **M2 — Enforce + agents (v1.5):** envelopes, STS write-cred brokering, MCP tool proxy, approval inbox, mission contracts, enforce mode. Prompts: F7–F8, W7–W10, G8–G10, T1–T8, C5–C7, D3–D5.
- **M3 — Console + estate (v2):** Arena, multi-cloud (GCP/Azure), evidence packs, session replay, burn-in, external re-scan, Bucket. Prompts: C8–C10, D6–D8, Z1–Z3.

---

## Phase 0 — Foundation & shared contracts

The four shared schemas are the spine of both products. They are defined and frozen (v1) before any service consumes them.

- **0.1 — Repo hygiene + reuse map.** Delete the stale clone; confirm `safe-edit` applicability; run `cargo test --workspace` on HEAD to establish a green baseline; write `docs/architecture/SOVEREIGNTY-REUSE-MAP.md` naming every MAI file that feeds a new crate/service (audit chain, bundle.rs, subject_hash.rs, mai-router/*, mai-compliance policy+engines, mai-vault init/pqc/tpm, mai-agent::ToolRegistry, TLM OpenBao code, Trust Manifold docs). *Gate: baseline test count recorded; doc lists real paths.*
- **0.2 — Blocking fixes (0.6).** Resolve ml-dsa timing + axum Handler conflict. *Gate: `cargo audit` clean or signed waiver; a 2-body-extractor axum handler compiles via `post(handler)`.*
- **0.3 — Identity schema.** `contracts/identity.md` + `fabric-identity` type stub: workload/session/task identity (SPIFFE-style id, tenant, service_identity from `SERVICE-IDENTITY.md`, PKI-cert binding). Superset-compatible with MAI's claim subject fields. *Gate: schema doc + serde round-trip test.*
- **0.4 — Trust-token schema.** `contracts/trust-token.md`: MAI `SignedClaim` (all 18 fields) **+ budget strand** (`token_cap`, `usd_cap_cents`, `tool_call_cap`, spend counters) **+ attenuation** (`parent_id`, `caveats[]` — biscuit/macaroon-style narrowing). Wire-compatible superset of the existing claim. *Gate: doc + a test proving an old-shape MAI claim deserializes as a token with empty budget/caveats.*
- **0.5 — Receipt schema.** `contracts/receipt.md`: extend `AuditEntry` (already carries correlation fields) with `token_id`, `envelope_id`, `spend_cents`, `model_weights_digest`, `provider`, `workflow_id`. *Gate: doc + BLAKE3 chain-link test over the extended entry.*
- **0.6 — Envelope schema.** `contracts/envelope.md`: three wraps — **seal** (OpenBao-transit-wrapped data key + AEAD ciphertext), **label** (classification from mai-compliance classifiers, machine-readable un-sealed), **thread** (signatures + chain link + authorizing `token_id`). *Gate: doc + a test that reads a label without unsealing the payload.*
- **0.7 — CI upgrade.** GitHub Actions: live OpenBao service container (Docker), LocalStack for AWS STS, `cargo test --workspace` on push (not nightly-only), `tsc`+`vitest` job, `cargo audit`/`deny`, hadolint, SBOM (syft) job. Turn the commented-out lanes back on. *Gate: CI green on a no-op PR exercising every job.*
- **0.8 — Contracts freeze + version.** Tag `contracts-v1`; publish the four schemas as a versioned `fabric-contracts` crate (pure types, no logic). Everything downstream depends on this crate, not on ad-hoc structs. *Gate: `fabric-contracts` compiles; both products list it as a dep.*

---

## Phase F — Fabric crates (WSF core, extracted + new)

Extract the proven crypto/audit from `mai-compliance` into standalone crates the whole stack (including MAI itself) consumes. Extraction is in-place: `mai-compliance` re-exports from the new crates so its 326+ tests keep passing.

- **F1 — `fabric-proof`.** Extract `mai-compliance/src/audit/{chain,entry,sealer,store,mod}.rs` + `bundle.rs` (canonical-JSON `write_canonical`/`canonical_digest` + `MlDsaBundleVerifier`) + `subject_hash.rs` into a dependency-light crate (blake3, ml-dsa, hmac, sha2, serde only). `mai-compliance` re-exports. *Gate: mai-compliance tests pass unchanged; off-host verify test (public key only) green against live signer.*
- **F2 — `fabric-identity`.** Promote 0.3 stub to a real crate: identity minting from OpenBao auth events, PKI leaf binding (reuse TLM PKI issuance), HMAC subject pseudonymization. *Gate: identity issued + verified against live OpenBao PKI in CI.*
- **F3 — `fabric-token` (the primitive).** The trust token: issue, sign (fabric-proof), verify, **attenuate** (mint a narrower child token — enforce caveats ⊆ parent), and budget accounting (atomic decrement, over-budget = deny). *Gate: attenuation test proves a child cannot exceed parent scope/budget; concurrent-decrement test.*
- **F4 — `fabric-envelope` (seal wrap).** Seal/unseal over OpenBao transit + AEAD (reuse mai-vault `AeadSealer`/AES-256-GCM). Per-envelope data key, transit-wrapped. *Gate: seal→unseal round-trip against live OpenBao transit; unseal without token denied.*
- **F5 — `fabric-envelope` (label wrap).** Classification label produced by the mai-compliance classifiers (phi/itar/ocap/tech_data), attached machine-readably without exposing payload; this is the label AOG later reads for DSPM-informed routing. *Gate: classify→label→read-label-without-unseal test; label matches classifier verdict.*
- **F6 — `fabric-envelope` (thread wrap) + receipt binding.** Provenance thread (signatures + BLAKE3 chain link + `token_id`); every seal/unseal/label emits a receipt into a `fabric-proof` chain. *Gate: tamper any wrap → verify fails with a specific reason; receipt chain verifies off-host.*
- **F7 — `fabric-cache`.** Promote `mai-compliance::trust_cache` (connectivity state machine: connected/degraded/stale/expired/air-gapped) into the shared crate so both products get offline-safe token/bundle/revocation verification. *Gate: state-transition tests over TTLs; expired snapshot collapses to most-restrictive.*
- **F8 — `fabric-revocation`.** Signed revocation snapshots (reuse TLM revocation refresh loop) covering tokens/subjects/keys/bundles + `emergency_revoke`; offline application from removable media. *Gate: revoked token denied offline; emergency snapshot applied without network.*

---

## Phase W — WSF services (trust plane)

Productize the three rings (OpenBao Core → Trust Bridge → Local Trust Cache) into deployable services, and build the genuinely new pieces: budget-carrying tokens, cloud STS brokering, envelope-seal service, receipt ledger.

- **W1 — `wsf-bridge` (Ring 2).** Productize the TLM Trust Bridge: OpenBao auth event → signed token (fabric-token), policy-bundle signing, revocation signing, metadata-only audit correlation publish. HA-ready (stateless between calls). *Gate: issue+verify a token end-to-end against live OpenBao; bundle signature verifies off-host.*
- **W2 — `wsf-bridge` STS-broker core.** New service surface: exchange a verified trust token for **ephemeral cloud credentials**. AWS first: STS `AssumeRole` + inline session policy narrowed to the token's resource scope; broker's root creds custodied in OpenBao `kv`, never exposed. *Gate: token→scoped AWS creds via LocalStack; creds expire at token TTL; out-of-scope resource access denied by the session policy.*
- **W3 — `wsf-seal` service.** Network service wrapping fabric-envelope: seal on ingress, unseal only inside the boundary for token-authorized ops, every operation receipted. *Gate: seal/unseal over HTTP against live OpenBao; unauthorized unseal → deny + receipt.*
- **W4 — `wsf-ledger` service.** Append-only receipt ledger over fabric-proof: ingest receipts from every service, verify chain, query by correlation id, **export** a signed evidence pack (reuse mai-compliance `reports/` generator). *Gate: multi-service receipts chain correctly; exported pack verifies with public key only.*
- **W5 — Ring 3 local cache deploy.** Wire fabric-cache + fabric-revocation into an appliance-side daemon; connectivity state machine drives allowed_routes ceiling; air-gap sticky. *Gate: appliance keeps issuing safe (narrowed) decisions with the bridge unreachable; air-gap denies cloud routes at policy layer.*
- **W6 — WSF API + SDK.** Stable REST/gRPC surface for token issue/verify/attenuate, seal/unseal, cred-exchange, receipt query. Extend `mai-sdk-rs` (now non-stub) + a thin TS client for the console. *Gate: SDK round-trips every endpoint against a live stack; OpenAPI published.*
- **W7 — GCP broker.** STS-broker for GCP: IAM Credentials `generateAccessToken` on a scoped service account. *Gate: token→scoped GCP creds (emulator or gated live); TTL + scope enforced.*
- **W8 — Azure broker.** STS-broker for Azure: federated workload identity → scoped token. *Gate: token→scoped Azure creds; TTL + scope enforced.*
- **W9 — Tenant provisioning.** Productize tenant lifecycle (`kv/tenants/<id>`): compliance_scopes, default_allowed_routes, data-classification ceiling, per-tenant subject-HMAC rotation (90-day). Admin API + audited deprovision (propagates revocation). *Gate: provision→issue→deprovision→revoked-everywhere test.*
- **W10 — WSF hardening + HA.** OpenBao HA topology doc + compose; bridge horizontal scale; key-rotation ceremony; production_guard checks for WSF (reuse the PROD-* pattern). Close the "OpenBao proven only against dev" debt. *Gate: rotate a signing key with zero downtime; production guard rejects any dev fixture.*

---

## Phase G — AOG gateway (control plane, inference edge)

The estate-wide model gateway: one OpenAI/Anthropic-compatible endpoint, policy-routed, metered, receipted. Reuses mai-router (routing) + mai-compliance (compliance decision) + WSF (identity/token/envelope/receipt). Builds the genuinely-absent cloud provider clients + metering.

- **G1 — `aog-gateway` skeleton + virtual keys.** axum data-path service; a caller presents a **virtual key** that resolves to a WSF trust token (scope + budget). Auth, tenant resolution, per-request token check. *Gate: virtual key → token resolution; over-budget request rejected pre-flight.*
- **G2 — Provider adapters (NEW).** Real cloud clients behind one internal trait: local vLLM/Ollama (via existing MAI adapters), Anthropic, OpenAI. This is the code MAI never had (its "cloud" was a config label). *Gate: same request served by ≥2 providers through one interface; streaming works.*
- **G3 — OpenAI-compatible surface.** `/v1/chat/completions` (+ `/completions`, `/embeddings`, `/models`), streaming (SSE), so existing tools repoint with a base-URL change. *Gate: an off-the-shelf OpenAI client library completes a chat + a stream unmodified.*
- **G4 — Anthropic-compatible surface.** `/v1/messages` + streaming, signaling the anti-lock-in promise. *Gate: an Anthropic client library completes a message + stream unmodified.*
- **G5 — Classify + route.** Wire mai-router (`classifier`, `entities`, `cost`, `fallback`) + mai-compliance classifiers: sensitivity/entity/classification → destination decision. If the payload arrives as a WSF envelope, read the F5 label instead of re-classifying (the flagship integration). *Gate: PHI payload forced local; label short-circuits re-classification.*
- **G6 — Policy decision + modes.** Reuse mai-compliance deny-wins composer (HIPAA/ITAR/OCAP) + a new **destination policy** (which provider/model per token+classification). Three modes: **shadow** (decide + log, never block), **report-only** (per rule), **enforce** (per rule). *Gate: identical request differs across modes; deny-wins holds; shadow never blocks.*
- **G7 — Metering + receipts.** Every request emits a WSF receipt (spend, provider, model digest for local, `workflow_id`); `aog-meter` aggregates per tenant/model/provider/task. *Gate: cost-per-task aggregation across a multi-call chain; receipt chain verifies.*
- **G8 — Tokenization on egress.** When policy permits a cloud route for classified data, tokenize sensitive spans (fabric-envelope label + placeholder swap; reuse mai-compliance `deid`), detokenize on return inside the boundary. *Gate: cloud provider sees placeholders only; response detokenized correctly; both events receipted.*
- **G9 — Budget enforcement + kill switch.** Decrement token budget per call; **revoke the token → the gateway refuses further calls** (the real kill switch). *Gate: budget exhaustion blocks mid-session; revocation halts an in-flight session's next call.*
- **G10 — ROI recommender.** `aog-meter` computes break-even ("Summit pays for itself in N months at current volume") + utilization-driven recommendations (idle → move on-prem; saturation → upgrade). *Gate: deterministic recommendation from a fixed telemetry fixture.*

---

## Phase T — AOG tool governance (agent-loop control — the differentiator)

Fulfills the `mai-agent::ToolRegistry` seam MAI left as interface-only. This is the part no gateway competitor has.

- **T1 — `aog-toolproxy` skeleton (MCP).** An MCP proxy agents register tools through; tool calls execute *through* AOG, not direct. Implements the `mai-agent::{ToolRegistry, ToolAccessRole, ToolAuditEntry}` traits for real. *Gate: an MCP client calls a tool via the proxy; call appears in the receipt ledger.*
- **T2 — Per-call cred minting.** Tool credentials minted by `wsf-bridge` per call, never held by the agent process. *Gate: agent env contains no standing tool cred; cred TTL = call duration.*
- **T3 — Approval inbox service.** New `aog-approvals` (echoes Lamprey Harness permissions-store + approval-chips): mutating tool calls pause for human approval with a diff preview; same inbox WSF/Aeneas use. *Gate: a mutating call blocks until approved; approval + actor receipted.*
- **T4 — Provenance tagging.** Tool results re-entering model context are tagged untrusted; rule: **untrusted content cannot trigger a mutating tool without approval** (the agentjacking defense, mechanized). *Gate: an injected "call tool X" inside a tool result does not auto-execute; it routes to the inbox.*
- **T5 — Egress scanning.** Tool results scanned before the model sees them; secrets/PHI (reuse mai-compliance phi/itar detectors) redacted. *Gate: a tool result containing an AWS key / PHI is redacted pre-context; event receipted.*
- **T6 — Mission contracts.** New type (echoes Lamprey Harness change contracts): a workload declares intended scope (systems, tools, spend ceiling) up front; runtime enforces the envelope; deviation blocks or escalates. *Gate: an out-of-contract tool call is blocked; an in-contract one passes.*
- **T7 — Session record + replay.** Full agent-loop capture (prompts, tool calls, approvals, results) into the ledger, replayable. Reuse the reasoning-trace-viewer pattern for the console side (Phase C). *Gate: a recorded session replays deterministically from the ledger.*
- **T8 — Tool governance hardening.** Fail-closed defaults (unknown tool = deny), rate/blast-radius caps (max calls/systems per task), tool allowlists per token. *Gate: blast-radius cap trips; unknown tool denied.*

---

## Phase C — Console (shared React/TS — the "phenomenal UX")

One console, product areas — not two apps. Inherits Lamprey Harness panels aesthetic. Replaces `compliance-dashboard/`. Talks to WSF + AOG via the W6 TS client.

- **C1 — Console scaffold.** Vite + React 19 + Tailwind + the panels design system; auth against WSF identity; app shell + routing. *Gate: `tsc` clean; shell renders; login round-trips.*
- **C2 — Overview + trust status.** Trust mode, bundle version, connectivity state, audit-chain integrity, tenant summary (ports the useful parts of the Jinja2 overview). *Gate: live values from a running stack.*
- **C3 — Routing + spend dashboards.** Live routing view (local vs cloud, per provider) + metering/ROI + break-even (G7/G10 data). *Gate: charts render from live meter API.*
- **C4 — Audit search.** Search the unified ledger (WSF receipts + AOG receipts) by correlation id/tenant/decision/date; the "one evidence lake" surface. *Gate: query returns correct joined rows.*
- **C5 — Approval inbox.** The T3 inbox with diff previews + approval-chip interactions; shared by AOG tools, WSF cred grants, and Aeneas remediations. *Gate: approve/deny flows drive the live service.*
- **C6 — Policy studio.** Plain-language rendering of policy-as-code; **a local model explains any denial citing the exact policy line** (the killer demo). Shadow→report→enforce toggles per rule. *Gate: a denial shows a human-readable, rule-cited explanation.*
- **C7 — Session replay.** T7 agent sessions rendered as replayable traces (reasoning-trace-viewer pattern). *Gate: a session plays back step-by-step.*
- **C8 — Model Arena.** Run a tenant's golden tasks across candidate models/providers; score on their tasks, not benchmarks. *Gate: an arena run ranks ≥2 models on a fixture task set.*
- **C9 — Evidence packs.** One-click export of W4 signed packs mapped to control families (HIPAA first; ITAR/OCAP/SOC2/NIST-AI-RMF/EU-AI-Act stubs). *Gate: exported pack downloads + verifies off-host.*
- **C10 — Console polish + a11y.** Panels-aesthetic pass, dark mode, keyboard flows, empty/error states, onboarding ("shadow mode in 15 minutes"). *Gate: a11y checks; a new user reaches shadow mode from zero via the UI.*

---

## Phase D — Deployment, evidence & proof

Close the verification debt that sank RC1's Testing score. Everything here is the "proven, not claimed" work.

- **D1 — Appliance compose.** `deployment/appliance/docker-compose.yml`: openbao + wsf-* + aog-* + console + postgres + object store, one-command bring-up. *Gate: fresh-machine `up` → healthy stack → a governed request succeeds.*
- **D2 — Shadow-mode lead artifact.** A minimal, safe compose a prospect runs against their own OpenAI/cloud spend to get an ROI/risk read in shadow mode, zero enforcement, no data egress. *Gate: point it at a spend source → dashboard shows cost/risk with no blocking.*
- **D3 — Signed supply chain.** cosign-signed images, SBOM (syft) per image, `.dockerignore`, distroless/scratch where possible, zero phone-home. *Gate: image signatures verify; SBOM present; egress monitor shows no outbound telemetry.*
- **D4 — HIPAA policy pack v1.** The v1 vertical-slice pack: PHI rules → local-only routing + evidence mapping, wired end-to-end (WSF label → AOG policy → receipt → C9 pack). *Gate: a PHI request is governed and produces an audit-ready HIPAA pack.*
- **D5 — Live-backend + live-OpenBao integration suite.** The suite MAI never had: adapter tests against real backends (opt-in, gated), WSF against live OpenBao HA, brokers against LocalStack/gated cloud. *Gate: suite runs in CI against live services; trust-adjacent paths have zero mock-only coverage.*
- **D6 — External re-scan.** Run the independent code-scan (the J-14 that never ran) against the new HEAD; target overall ≥75, Testing ≥60, zero HIGH security. Record verbatim. *Gate: report archived; regressions triaged.*
- **D7 — Burn-in.** The deferred hardware/stability protocol on target hardware (boot timing, HA failover, 72-hr stability, key rotation under load). *Gate: burn-in report emitted; failover + rotation pass.*
- **D8 — Buyer + operator docs.** Refresh `docs/BUYER-INTEGRATION-GUIDE.md` for the real (not handler-swap-stub) integration; operator runbooks for WSF + AOG. *Gate: a dry-run install by the doc alone succeeds.*

---

## Phase Z — Ship (Bucket)

- **Z1 — Version + release notes.** Bump workspace version; RC notes covering WSF + AOG + console; update README thesis to the two-product story. *Gate: `mai-ship-validate` (extended for WSF/AOG) exits 0.*
- **Z2 — Appliance bundle + release.** Build signed appliance bundle + images; tag; publish release with SBOMs + evidence pack + re-scan report attached. *Gate: bundle installs from the release artifact on a clean machine.*
- **Z3 — Site alignment.** Update islandmountain.io (Aeneas page + a new AOG/WSF page) to match shipped capability; wire "Request a briefing" to the shadow-mode artifact. *Gate: page claims map 1:1 to shipped features.*

---

## Appendix A — Reuse ledger (what MAI gives each phase)

| New thing | Reused MAI source | Kind |
|---|---|---|
| `fabric-proof` | `mai-compliance/src/audit/*`, `bundle.rs`, `subject_hash.rs` | extract |
| `fabric-identity` | TLM PKI issuance, `SERVICE-IDENTITY.md` | extract+new |
| `fabric-token` | `SignedClaim` schema (TRUST-MANIFOLD §4) + budget/attenuation | extend |
| `fabric-envelope` | `mai-vault` `AeadSealer`, mai-compliance classifiers | reuse+new |
| `fabric-cache`/`-revocation` | `mai-compliance::trust_cache`, TLM revocation loop | promote |
| `wsf-bridge` | TLM AppRole/PKI/Transit/rotation (TLM-1..4.2) | productize |
| `wsf-broker` | — (STS brokering is net-new) | new |
| `wsf-ledger` export | `mai-compliance/src/reports/*` | reuse |
| `aog-gateway` routing | `mai-router/src/*` | reuse |
| `aog-gateway` policy | `mai-compliance/src/policy/composer.rs` + engines | reuse |
| `aog-toolproxy` | `mai-agent::{ToolRegistry,ToolAccessRole,ToolAuditEntry}` | implement seam |
| `aog-gateway` egress redaction | `mai-compliance::deid`, `phi`, `itar` | reuse |
| console | Lamprey Harness panels UX (pattern, not code) | pattern |
| CI live-OpenBao | `start-openbao.ps1` Docker path | reuse |

**Parked (not in this plan; revive with Summit):** mai-scheduler (+ its fake-metrics defects), mai-hil, the 7 inference adapters beyond what G2 needs, the L5 family-app scaffolds. Retire the Jinja2 dashboard once C-phase reaches parity.

## Appendix B — Decisions embedded (defaults chosen; flag to override)
1. **Build in `im-mighty-eel-mai`, extract in-place** (not a new repo). — override if you want a clean product repo.
2. **WSF = "Woven Sovereignty Fabric"**, "trust token" kept as the primitive. — override the expansion; acronym stays WSF.
3. **Reuse mai-compliance composer as the policy engine** (no Cedar/OPA in v1). — override if you want Cedar now.
4. **One console, product areas.** — settled unless you object.
5. **AWS + HIPAA = the v1 slice (M1).** GCP/Azure + other packs follow. — override the beachhead.
6. **Aeneas rides WSF as its trust layer**; this plan builds WSF/AOG, Aeneas domain code (CSPM/DSPM) is a **separate follow-on P-SPR** on top. — override to fold Aeneas in here.

## Appendix C — Completion criteria
- M1/M2/M3 gates all green; D6 external re-scan ≥ targets; D5 trust-adjacent coverage is live-service (zero mock-only); Z1–Z3 shipped; site claims match shipped features.
