# WSF + AOG — Robustness & Zero-Trust Doctrine ("cannot leak context")

**Scope:** The security and robustness contract binding on both products — **WSF** (Woven Sovereignty Fabric, trust plane) and **AOG** (Agentic Orchestration Governance, control plane) — and the **Loom** orchestration engine (M3 addendum). This is the standard every phase, prompt, and gate is held to. **It governs:** where any PLANNING doc, prompt, or convenience conflicts with an invariant here, the invariant wins.
**Relationship:** extends CANON Part II; referenced as the governing contract by `AOG-WSF-SOVEREIGNTY-STACK-PSPR.md` and `AOG-ORCHESTRATION-ENGINE-M3-SUMMIT-ADDENDUM-PSPR.md`.
**Author:** Basho Parks · **Created:** 2026-07-03 · **Status:** **ACTIVE — the governing contract, in force.** The Loom orchestration engine was built to it; its **D9 conformance gate is satisfied** as of 2026-07-11 (see D9). As a standing contract it is never "done" — it binds every future phase and prompt.

---

## D0 — Standard of care
Lamprey governs environments where a failure is not a bug — it is a breach of custody. The product exists for teams that "cannot leak context," that keep "deployment details, evidence, and credentials in your custody," and that must not "hand persistent access or scan data to a third party." In these environments a trust failure can end a compliance program, void a contract, cost a career — and in ITAR / defense / healthcare use it can contribute to physical harm. The engineering standard is therefore not "secure by best effort." It is:

1. **Fail-closed, always.** Every uncertainty resolves toward *less* privilege.
2. **No single point of trust.** No one key, node, operator, or component can breach an invariant alone.
3. **Every promise is enforced, not asserted** — each has a Layer-3 owner (machinery, not a document) and a failure-mode test proving the breach cannot happen silently.
4. **Defense in depth** — no invariant rests on one control.
5. **Assume compromise.** Design for the day an agent is hijacked, a credential is stolen, a node is malicious, and the third party is curious — and bound the damage anyway.

This document is the contract; the plan implements it.

## D1 — "Cannot leak context," formally
The **custody boundary** is the perimeter inside which all sensitive context must remain. **Context classes** — none may cross it except as I-2 permits: scan findings and samples; secrets and credentials; deployment details and topology; identities and subject data; audit records and evidence; model weights or prompts carrying any of the above; and classification labels that would themselves reveal sensitive structure.
**Invariant:** no context class leaves the custody boundary in plaintext, ever. It leaves only when (a) sealed, (b) to a party inside the boundary or explicitly authorized, (c) ephemerally, and (d) with a receipt. A third party — any cloud provider, and including this fabric's own vendor — is outside the boundary by default. "No scan-data SaaS" is this invariant applied to our own business model.

## D2 — Threat model (each assumed realized, not hypothetical)
- **T-EXT** — external attacker: network position, stolen token/cred, replay, MITM.
- **T-AGENT** — compromised / prompt-injected agent (agentjacking): a legitimate agent turned hostile mid-run. *Assumed to happen.*
- **T-INSIDER** — malicious or coerced insider with legitimate access.
- **T-NODE** — compromised gateway/node running attacker code.
- **T-3P** — curious or compromised third party: cloud provider, SaaS, the fabric vendor itself.
- **T-SUPPLY** — supply chain: malicious dependency or tampered build.
- **T-DEPUTY** — the fabric as confused deputy: tricked into using its own authority against the custody boundary.
- **T-PHYS** — physical: air-gap crossing, removable media, hardware tamper.

The invariants in D3 must hold with **any** of these realized. A control that works only if none are realized is not a control.

## D3 — The invariants (must never fail)
Each: statement · mechanism · Layer-3 owner · failure test · consequence if breached.

**I-1 — Zero standing privilege.** No credential outlives its operation; access is minted just-in-time, scoped to the operation, revoked automatically. *Mechanism:* ephemeral cred broker (W2/T2), TTL = operation lifetime, attestation-liveness (N8). *Owner:* the broker + TTL enforcement + the revocation loop. *Test:* no standing cred in any workload env; cred denied past TTL; orphaned cred inert. *If breached:* a stolen or lingering credential grants broad, lasting access — the "broad permanent trust" the product forbids; blast radius becomes the estate. *(Product: "Ephemeral Credential Lifecycle"; "zero standing privilege… revoked automatically.")*

**I-2 — No context leaves custody.** Per D1. *Mechanism:* envelope seal (F4/F6), egress tokenization/placeholder (G8), destination policy deny-wins (G6), air-gap egress guard. *Owner:* the seal service + gateway policy + egress guard. *Test:* third party sees only placeholders; classified payload forced local; every leak path denied + receipted; air-gapped node makes zero egress. *If breached:* PHI / ITAR / OCAP-controlled context exposed to a third party — a reportable breach, contract loss, and for controlled-defense data a national-security and personal-safety harm.

**I-3 — Earn every action (no coasting).** Every action is independently re-authorized; authority is never established once and carried. *Mechanism:* sender-constrained token bound to the workload PKI leaf (F2) via mTLS channel binding; per-request nonce (anti-replay); local fail-closed evaluation of caveats + budget + revocation per call. *Owner:* the per-call verifier at gateway and node edge. *Test:* stolen/replayed token inert; no code path authorizes without a fresh per-action check (coasting-impossible test). *If breached:* one theft or one injection yields unbounded action for a whole session — session hijack, golden-ticket, agentjacking-runs-free. *(The product's own constraint: "a scanner must earn each action instead of accumulating broad permanent trust." This invariant IS the product, not an optimization.)*

**I-4 — Fail-closed under all uncertainty.** Stale revocation, unreachable authority, unverifiable attestation, or partition reduces privilege — never extends it. *Mechanism:* fabric-cache state machine (F7: expired → most-restrictive); split-brain fencing (H2: minority serves no authoritative allow). *Owner:* the cache state machine + consensus fencing. *Test:* every degradation path denies; a partitioned replica past freshness-TTL stops honoring tokens. *If breached:* an attacker gains by cutting a replica off from its authority — degradation becomes an escalation path.

**I-5 — Tamper-evident accountability.** Who requested, approved, and executed every sensitive action is preserved, hash-chained, and provable off-host. *Mechanism:* fabric-proof receipts + wsf-ledger, physically separate from the intent store. *Owner:* the receipt chain + the ledger. *Test:* tamper any link → verification fails and identifies the link; the full requested/approved/executed chain reconstructs from public keys alone. *If breached:* remediation becomes "a black box"; an insider erases their tracks; evidence is inadmissible and the compliance value is void. *(Product: "Audit-First Operations… not a black box.")*

**I-6 — Approval-gated remediation.** No sensitive or write action executes without recorded human approval. *Mechanism:* approval inbox + admission gate; scoped write cred minted only post-approval. *Owner:* the admission gate + the broker (no cred without an approval reference). *Test:* a write without a valid approval reference is denied; the approval is immutably recorded and bound to the action's receipt. *If breached:* automated or hijacked change to production with no human in the loop — the mistake or the attack executes at machine speed. *(Product: "scoped write access only after approval"; "require human approval before sensitive changes.")*

**I-7 — No single point of trust.** No one component, key, node, or person can unilaterally breach I-1..I-6. *Mechanism:* separation of duties; per-ring key hierarchy; quorum / dual-control for Tier-0 ops (key rotation, emergency revoke, ring-key disable); control-plane/data-plane split. *Owner:* the ring-key custody model + quorum enforcement. *Test:* compromise of any single component in isolation breaches no invariant; Tier-0 ops require quorum. *If breached:* one compromised admin or key = total custody loss.

**I-8 — Air-gap fidelity.** In air-gapped mode there is zero egress; all governance functions offline; cross-boundary sync only via signed media. *Mechanism:* offline verification (signed tokens/bundles/revocation); egress guard; federation by signed snapshot (H5/F8). *Owner:* the egress guard + offline verifiers. *Test:* an air-gapped deployment makes zero network calls under a full workload; denies every cloud route at the policy layer; a media-borne revocation still applies. *If breached:* the air-gap promise is theater; context escapes the one boundary the customer chose it for.

**I-9 — Bounded, provable kill.** Revocation propagates within a measured window and is honored on every replica; a kill switch is worth only its latency. *Mechanism:* push revocation (subscription fan-out) + pull backstop; fail-closed on staleness (I-4). *Owner:* the revocation controller (R9) + the edge freshness gate. *Test:* revoke → denied on every replica within the SLO; a replica out of contact beyond freshness-TTL fails closed. *If breached:* "kill" does not kill; a compromised agent or credential keeps acting after the operator pulled the trigger — the failure that most directly costs safety.

## D4 — Defense in depth (no invariant stands alone)
- A **stolen token** is stopped by I-3 (PoP binding) *and* I-9 (revocation) *and* I-1 (TTL).
- A **hijacked agent** is bounded by I-3 (per-call attenuation) *and* I-6 (approval on writes) *and* I-1 (ephemeral scoped cred) *and* I-5 (receipted, therefore visible).
- **Context exfiltration** is blocked by I-2 (seal + tokenize) *and* I-8 (egress guard) *and* I-5 (any attempt receipted).
- An **insider** is constrained by I-7 (quorum on Tier-0) *and* I-5 (tamper-evident trail) *and* I-6 (approval separation).

Single-control reliance on any invariant is a defect, gated against in review.

## D5 — Blast-radius bounds (per adversary realized)
- **T-EXT stolen token:** inert without the bound leaf key (I-3); with the key too, bounded to one TTL, one scope, revocable within the I-9 window.
- **T-AGENT hijack:** bounded to a single per-call attenuated capability's scope + budget; writes still need approval (I-6); fully receipted (I-5); killable (I-9).
- **T-NODE compromise:** bounded to that node's ring and its live-attested workloads; drift evicts + revokes (N8); cannot mint beyond scope (I-7).
- **T-3P curiosity:** bounded to placeholders and sealed blobs (I-2); zero plaintext context.
- **T-INSIDER:** bounded by quorum on Tier-0 (I-7) and an inerasable trail (I-5).

"Reducing the blast radius of both mistakes and compromise" is the promise; these are the numbers behind it.

## D6 — Product-promise → enforcement map (every claim, made provable)
| Public promise (their words) | Mechanism (prompt) | Layer-3 owner | Failure-mode gate |
|---|---|---|---|
| "environments that cannot leak context" | I-2 seal + tokenize (F4/F6/G8) | seal svc + gateway policy | leak-path-denied + receipted |
| "without handing persistent access… to a third party" | I-1 ephemeral cred (W2/T2) | broker + TTL | no-standing-cred; expiry-at-TTL |
| "credentials in your custody" | I-7 root custodied in OpenBao, never exposed | ring-key custody model | broker-root-never-egressed |
| "governance… woven into every action" | I-3 per-action re-auth | per-call verifier | coasting-impossible; replay-inert |
| "Ephemeral Credential Lifecycle… only after approval" | I-1 + I-6 | broker + approval gate | no-cred-without-approval |
| "Audit-First… who requested, approved, executed… not a black box" | I-5 receipts | receipt chain + ledger | tamper-detected; chain-reconstruct |
| "zero standing privilege… earn each action" | I-1 + I-3 | broker + per-call verifier | earn-each-action |
| "DSPM… not another external data exhaust" | I-2 classify + seal | classifier + seal svc | samples-never-egressed |
| "air-gapped… stay inside your boundary" | I-8 egress guard | egress guard + offline verify | zero-egress under load |
| "reduce blast radius of mistakes and compromise" | D5 bounds | attenuation + TTL | blast-radius suite |
| "Multi-Cloud… AWS, Azure, GCP, Kubernetes, databases; scoped" | brokers (W2/W7/W8) + Loom placement | brokers + attested scheduler | scoped-cred-per-target |
| "Remediation Workflow… human approval before sensitive changes" | I-6 | approval inbox + admission | write-denied-without-approval |

**Any line in the public copy without a row here is a claim without teeth — a defect to fix before the claim ships.**

## D7 — Robustness engineering standards
- **Fail-closed default** in every trust-path branch; a missing or ambiguous decision denies.
- **No-mock-only for trust paths** (PSPR §0.3.5, extended in the addendum): live OpenBao + a live multi-node harness for consensus / kill / scheduling. A guarantee proven only against a mock is not proven.
- **Constant-time crypto:** RUSTSEC-2025-0144 (ml-dsa timing) resolved or HW-backed before any signing path ships (§0.6). A timing side-channel on the signature is an I-3 breach.
- **Supply chain:** SBOM (syft) + signed builds + `cargo audit`/`deny` clean; no unsigned bundle in prod (H6).
- **Key management:** per-ring keys custodied in OpenBao, rotated by ceremony with zero downtime (W10); Tier-0 ops quorum-gated (I-7).
- **Chaos + partition + soak** as release gates (Phase V + D9): invariants must survive injected faults, not just a happy path.
- **DR:** cold-backup restore by runbook (H4); receipts survive restore unbroken.

## D8 — The anti-shortcut list (forbidden, by name)
The conveniences that tempt under schedule pressure, and are prohibited:
1. **No bearer-token coasting** — never "authorize once, trust the session." (I-3.)
2. **No async authorization of high-consequence actions** — audit may be write-behind; *authorization* of cred-mint, unseal, cross-boundary, or enforce-deny is synchronous and durably receipted **before** the side effect.
3. **No fail-open on staleness** — an unreachable authority never means "allow for now." (I-4.)
4. **No standing credentials "for convenience."** (I-1.)
5. **No plaintext context to a third party "just this once."** (I-2.)
6. **No mock-only trust tests.** (§0.3.5.)
7. **No single-node quorum, no unsigned bundle, no dev OpenBao in prod.** (H6.)
8. **No `--no-verify`, ever.** (CANON I.2.)
9. **No silent cap or sampling on a security scan** — bounded coverage is logged, never hidden.

Each is a corner whose cutting has, historically, *been* the breach.

## D9 — Robustness conformance gates (extends addendum Phase V)
An invariant is only real if a test proves it cannot be silently broken:
- **RC-1 … RC-9** — one adversarial test per invariant I-1..I-9, each injecting the realized threat (D2) and asserting the invariant holds. Green required to ship.
- **RC-KILL** — the I-9 propagation-window SLO, measured across ≥3 replicas plus a partitioned node; number published + regression-gated.
- **RC-LEAK** — a red-team egress suite actively attempting every context-exfil path (direct, side-channel via labels, via a hijacked agent, via a curious provider); all must be denied + receipted.
- **RC-DEPUTY** — a confused-deputy suite: attempt to turn the fabric's own authority against the custody boundary; must fail.

Passing D9 is a precondition to any external "fail-proof / cannot leak context" claim. Until then the claim is unproven and is not made.

**D9 status — SATISFIED (2026-07-11).** The RC suite is implemented and green:
`mai/crates/aog-conformance/tests/robustness_conformance.rs` runs **RC-1..RC-9** (one
adversarial test per invariant I-1..I-9, each injecting its D2 threat against the real
primitive and asserting fail-closed) plus **RC-KILL / RC-LEAK / RC-DEPUTY** — 11 tests,
all passing (`cargo test -p aog-conformance --test robustness_conformance`). The
estate-scale legs of RC-KILL (propagation to every replica; the partitioned-node freshness
fail-closed; the revocation-to-denial SLO) are the live gates
`deployment/loom-harness/gates/v5-kill-switch-under-scale.sh` and `v10-revocation-slo.sh`,
run green on the containerized 5-CP estate. The "cannot leak context / fail-proof" claim is
now evidenced, not merely asserted. Regression-gate: keep the RC suite green in CI; a new
invariant means a new RC-N before its mechanism ships.

---
*DRAFT doctrine. It authorizes no code. It governs the plan: where a prompt, a convenience, or a schedule conflicts with an invariant here, the invariant wins. Parent §0, CANON Parts I–II, and this doctrine are read together.*
