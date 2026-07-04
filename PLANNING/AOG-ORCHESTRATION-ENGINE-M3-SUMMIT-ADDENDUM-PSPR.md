# AOG Orchestration Engine — "Loom" — M3 / Summit Addendum to the Sovereignty Stack P-SPR

**Initiative:** Island Mountain — AOG (Agentic Orchestration Governance) control plane, orchestration tier.
**Parent plan:** `PLANNING/AOG-WSF-SOVEREIGNTY-STACK-PSPR.md` — this addendum **extends** it; it does not replace or reorder M1/M2. It slots after M2 completes (Phase T, C5–C7, D3–D5) and re-scopes the M3 line into a true orchestration engine.
**Codename:** **Loom** — the loom that weaves WSF trust through every orchestrated workload. Warp = the WSF trust plane (identity, token, envelope, receipt); weft = the orchestration actions (schedule, reconcile, roll out, heal). No thread runs unwoven.
**Foundation:** extends the M1/M2 estate — `fabric-*` crates, `wsf-*` services, `aog-gateway`, `aog-meter`, `aog-toolproxy`, and the parked `mai-scheduler` (revived here). Reused, extracted, hardened — **not rebuilt** (CANON II.1).
**Author:** Basho Parks · **Created:** 2026-07-03 · **Status:** DRAFT — awaits explicit STS sign-off before any code. Drafting this file is not authorization (CANON I.1 / parent §0.5).
**Governing security contract:** `AOG-WSF-ROBUSTNESS-AND-ZERO-TRUST-DOCTRINE.md` — every prompt and gate below is subordinate to its invariants (I-1..I-9). Where a convenience conflicts with an invariant, the invariant wins.

---

## A0 — The imperative (why this exists)

M2 gives AOG a correct **single-process** gateway: budget pre-flight, egress tokenization, a cryptographic kill switch — all proven by the G9 live gate. The moment a second replica exists, that correctness is not automatic; it must be *engineered*. The parent plan already assumes horizontal scale (W10 "bridge horizontal scale") and multi-node estate (M3), but treats orchestration as deployment plumbing (Compose). It is not plumbing. **Orchestration is where the trust guarantees either hold across an estate or silently break.** A kill switch that halts one replica but not the other is not a kill switch. A budget enforced per-process is not a budget. A workload placed on the wrong node is a sovereignty breach.

Loom is the tier that makes the M1/M2 guarantees **estate-wide and provable**: a declarative estate, level-triggered reconciliation, consensus-backed truth, admission-woven trust, and attested placement — matching Kubernetes on orchestration correctness and exceeding it on trust, because in Loom trust is woven in at admission rather than bolted on after. This is a **project imperative**, not an enhancement: without it, the "controls live outside the model" thesis holds for a demo and fails for a deployment.

---

## A1 — Architecture note (comprehensive)

### A1.1 — Thesis
Build the orchestration **semantics** Kubernetes pioneered — declarative desired-state, level-triggered reconciliation, consensus source-of-truth, admission control, self-healing, attested scheduling, HA — scoped to the AOG workload domain (inference replicas, agent runtimes, gateways, tool proxies), and **weave WSF trust through every one of them**. We match K8s on *correctness guarantees*, deliberately narrow it on *workload breadth* (A1.13), and beat it on *trust and sovereignty* (A1.3). "As good as K8s" is defined concretely in A1.12 and proven by the Phase V conformance suite — it is a gated claim, not a slogan.

### A1.2 — Primitive map (K8s → Loom)
| Kubernetes | Loom equivalent | Reuses / new |
|---|---|---|
| etcd (consistent, watchable truth) | `aog-store` — Raft (openraft) over an embedded state machine; **desired-state only** | new; **never** the receipt ledger |
| API server (single admission choke point) | `aog-apiserver` (axum) — typed resource CRUD + admission chain | new; reuses `resolve_and_check` logic shape |
| CRDs / typed resources | `aog-estate` resource kinds (A1.5) | new; extends `fabric-contracts` |
| RBAC / ServiceAccounts | **WSF budgeted capability tokens** + attenuation | reuses `fabric-token` (F3) |
| Secrets | OpenBao + per-call cred minting | reuses `wsf-bridge` (W2), `mai-vault` |
| Controllers / control loops | `aog-controller` reconciliation runtime + per-kind controllers | new |
| Scheduler (predicates/priorities) | `aog-scheduler` — **attested placement** | revives `mai-scheduler` |
| kubelet (node agent) | `aog-node` — edge runtime + workload drivers | new; reuses fabric-cache (W5) |
| Admission controllers (OPA/Gatekeeper) | admission chain: validate (deny-wins) + mutate (attach token, seal, receipt) | reuses `mai-compliance` composer |
| Events / audit | **hash-chained receipts** (tamper-evident) | reuses `wsf-ledger` (W4), `fabric-proof` |
| Deployments / rollouts | `Workload` + rollout controller | new |
| HPA (autoscale) | **budget-/ROI-aware** autoscaler | reuses `aog-meter` |
| Namespaces / NetworkPolicy | **TrustRings** + destination policy | reuses Trust Manifold rings |
| `kubectl` | `aogctl` | new |
| Liveness/readiness | health probes **+ attestation-liveness** (A1.3.6) | new |
| Kill: cordon/evict | **cryptographic estate-wide revocation** | reuses `fabric-revocation` (F8), G9b |

### A1.3 — The eight woven differentiators (why Loom is not "K8s reskinned")
1. **Trust-woven admission.** Every control-plane mutation is a budgeted, policy-checked, receipted capability — not an allow/deny RBAC verb. Admission mints/attenuates a token and stamps a receipt; an un-receipted mutation is impossible by construction.
2. **Attested scheduling.** Placement is a cryptographic trust match: a workload's data-classification **ceiling** must be ≤ the target node's attestation **floor** (TPM/Nitro PCR, air-gap flag, ring). Sovereignty is a hard scheduling predicate, not an afterthought.
3. **Tamper-evident control plane.** The event/audit stream is a hash-chained receipt ledger (`fabric-proof`), not mutable logs. Every reconcile action is provable to a regulator off-host with the public key alone.
4. **Cryptographic, estate-wide, offline kill switch.** Revoke a token or disable a ring key → workloads *and* controllers halt, including air-gapped nodes reached by signed removable-media snapshots. K8s has no native equivalent.
5. **Air-gap-native consensus.** The control plane runs fully offline; cross-boundary federation is by signed snapshots (extends F8), not a live cluster network.
6. **Attestation-liveness self-healing.** A workload that drifts from its sealed measurement is evicted **and its tokens revoked** — liveness is "is it still the code we trust," not merely "is it responding."
7. **Budget-aware orchestration.** Scale and placement fold in token budget + ROI (`aog-meter`): idle → consolidate, budget-inefficient → scale down, saturated → recommend hardware. Economics is first-class, not external.
8. **Sealed desired-state.** Sensitive resource fields are envelope-sealed (`fabric-envelope`) at rest in `aog-store`; the control-plane truth store never holds plaintext classified config.

### A1.4 — Control-plane topology
```
                          ┌──────────────────── Loom control plane (HA, air-gap-capable) ─────────────────┐
   aogctl / console ──▶   │  aog-apiserver  ──(admission: validate deny-wins → mint/attenuate token →     │
   (WSF token on every    │      │            seal fields → stamp receipt)──▶  aog-store (Raft desired-    │
    request; no standing  │      │                                             state)  ──watch──┐          │
    credential)           │      │                                                              ▼          │
                          │      │            aog-controller runtime ◀───reconcile loop (level-triggered)  │
                          │      │              ├─ Tenant / VirtualKey / PolicyBundle / ProviderPool       │
                          │      │              ├─ Budget (→ shared atomic SpendLedger)                    │
                          │      │              ├─ TrustRing (→ OpenBao mounts/keys)                       │
                          │      │              └─ Workload → aog-scheduler (attested placement)            │
                          │      └── receipts ──▶ wsf-ledger (hash-chained, tamper-evident)                │
                          └───────────────────────────────────┬──────────────────────────────────────────┘
                                                               │ signed assignments + revocation snapshots
                        ┌──────────────────────────────────────┼───────────────────────────────────────┐
                        ▼                                       ▼                                        ▼
                  aog-node (Ring 1)                       aog-node (Ring 2)                       aog-node (Ring 3, air-gapped)
                  drivers: process/containerd             attestation-gated                      fabric-cache sticky; denies
                  runs: aog-gateway replicas,             workloads; heartbeats                  cloud routes; applies revocation
                  agent runtimes, aog-toolproxy           + attestation-liveness                 from removable media
```
Rule carried from the design review: **`aog-store` holds intent; `wsf-ledger` holds proof.** They are physically separate stores. Desired-state may be edited/rolled back; receipts are append-only and never mutated.

### A1.5 — Resource kinds (the "CRDs"), in `aog-estate`
Versioned, schema-validated, watch-able, each with `spec`/`status`/`metadata` + a `token_ref` (authorizing capability) and a `receipt_ref` (provenance): `Tenant`, `TrustRing`, `VirtualKey`, `Capability` (token template + budget), `PolicyBundle`, `ProviderPool` (+ `ModelEndpoint`), `Workload` (the deployable unit: kind = gateway | agent | toolproxy | inference), `Placement` (scheduler binding), `Node` (attestation profile + capacity), `MissionContract` (Phase-T scope envelope), `ToolGrant`, `RolloutPlan`, `RevocationIntent`. All are conversion-versioned (A1.12) so the schema can evolve without estate downtime.

### A1.6 — Consistency & consensus
- **Linearizable writes** to desired-state via Raft (openraft; `raft-rs` as fallback). Reads: linearizable for admission decisions, watch-cache (bounded-stale) for controllers.
- **Split-brain safety is non-negotiable:** a minority partition must **fence** (stop issuing authoritative decisions) rather than serve stale allow decisions. Fail-closed on the trust path; fail-static (last-known-restrictive) on the node edge (reuses `fabric-cache` state machine).
- **The receipt ledger is not consensus-gated** — receipts are hash-chained and append-only; a node writes its own receipt segment offline and reconciles the chain on reconnect.

### A1.7 — The trust weave (admission)
`aog-apiserver` admission chain, run on every mutation, in order: (1) **authenticate** the WSF token (`fabric-token` verify, budget + caveats + revocation); (2) **validate** — `mai-compliance` deny-wins composer over HIPAA/ITAR/OCAP + resource policy; (3) **mutate** — attenuate a child token scoped to exactly this action, envelope-seal sensitive `spec` fields, set defaults; (4) **admit + receipt** — commit to `aog-store` and emit a `fabric-proof` receipt referencing token, before/after digests, and decision. No path writes desired-state without traversing this chain. This is the control-plane sibling of the data-path `resolve_and_check`.

### A1.8 — Attested scheduling
`aog-scheduler` = a K8s-style filter/score framework, revived from `mai-scheduler` (whose fake-metrics defects are fixed here, not inherited). **Filters (hard):** ring match; `workload.classification_ceiling ≤ node.attestation_floor`; capacity; air-gap compatibility; provider availability. **Scores (soft):** budget/ROI efficiency (`aog-meter`), consolidation, spread-for-HA, data-locality (envelope label from F5). Binding writes a `Placement`, mints the workload's runtime token, and receipts the decision. A workload with no attestation-satisfying node stays `Pending` — it is **never** placed on an under-attested node to relieve pressure.

### A1.9 — Node/edge runtime
`aog-node` registers with an attestation profile, heartbeats, and runs assigned workloads through a **pluggable workload driver** (CRI-shaped): `process`/systemd first (air-gap appliance default), then `containerd`, optional `wasmtime`. It enforces local admission at the edge (reuses `resolve_and_check` + Ring-3 local cache from W5), runs health + **attestation-liveness** probes, and evicts+revokes on drift. Hub-and-gateway (the public architecture) is exactly control-plane + `aog-node` edges.

### A1.10 — Air-gap & federation
No cloud control plane, ever (CANON II.4). A fully offline single control-plane node is a first-class supported topology. Multi-site / cross-air-gap estates federate by **signed snapshots** on removable media (extends F8 revocation transport): policy bundles, capability grants, and revocation intents move as verifiable artifacts; nothing requires egress. Our own build/test obey the same rule (no network in the unit lane).

### A1.11 — Reuse map (no rebuild)
Extends: `fabric-proof` (receipts/events), `fabric-identity` (node + controller + workload identity), `fabric-token` (all authZ + the shared atomic SpendLedger), `fabric-envelope` (sealed specs + labels), `fabric-cache`/`fabric-revocation` (edge offline-safety + kill), `wsf-bridge` (cred minting), `wsf-seal`, `wsf-ledger` (the event store), `aog-gateway`/`aog-meter`/`aog-toolproxy` (become managed `Workload` kinds), `mai-compliance` (admission + scheduling predicates), `mai-router`, `mai-vault` (TPM attestation), **`mai-scheduler` (revived)**. New crates: `aog-estate`, `aog-store`, `aog-apiserver`, `aog-controller`, `aog-scheduler`, `aog-node`, `aog-federation`, `aogctl`, `aog-conformance`.

### A1.12 — What "as good as K8s" means (correctness bars — gated in Phase V)
1. **Level-triggered, idempotent reconciliation:** dropping/duplicating any event converges to the same state (proven by fuzz + replay).
2. **Linearizable control-plane writes** under concurrent clients; no lost updates (Jepsen-style test).
3. **Split-brain safety:** no minority partition ever serves an authoritative allow; kill-switch honored under partition.
4. **Self-healing:** killed workloads reschedule within SLO; drifted (attestation) workloads evicted + revoked.
5. **Rollout/rollback determinism:** any rollout reversible to the prior signed state from the ledger.
6. **Scale target:** an estate of N nodes / M workloads reconciles within SLO (benchmark fixture; N,M set at V1).
7. **Kill-switch-under-scale:** revocation halts the *next call on every replica* — the M2 guarantee, now estate-wide.
8. **Conformance suite** (`aog-conformance`) green — the analog of K8s conformance; passing it is the gate to *claim* Kubernetes-grade externally.

### A1.13 — Non-goals (honest scope narrowing)
Not reproducing: general container orchestration for arbitrary workloads (Loom orchestrates AOG kinds only); CNI/overlay networking (single-estate service registry + destination policy instead); a public multi-tenant hosted API; a cloud-hosted control plane; Helm/package ecosystem. Narrower than K8s on breadth **by design**; equal on correctness; superior on trust.

### A1.14 — Per-action re-authorization (the trust contract; full form in the Robustness Doctrine, I-3/I-4/I-9)
The weave is an integrity invariant enforced **per action**, not a one-time boundary check. Every data-path call and every control-plane mutation independently re-authorizes against a **sender-constrained** token (bound to the workload PKI leaf, F2, via mTLS channel binding), with a per-request nonce (anti-replay) and a **local, fail-closed** evaluation of caveats + budget + revocation. Authority is never established once and carried; a stolen or replayed token is inert. Verification is local asymmetric crypto (sub-ms) — performance comes from locality and cryptography, **never from checking less**. High-consequence actions (cred mint, unseal, cross-boundary, enforce-deny) are additionally synchronous and durably receipted **before** the side effect; only low-consequence audit is write-behind. This supersedes any earlier "carried by the token" phrasing in this addendum.

---

## A2 — Consequences of not succeeding (the stakes, unflinching)

Failure here is not "AOG scales poorly." Each unmet bar is a specific, nameable harm:

**Tier 0 — Security-catastrophic (the kill switch is a lie).**
- *Kill-switch-under-scale unmet* → a revoked token is honored by replica B while replica A refuses. A compromised or rogue agent keeps calling models and tools after the operator "killed" it. In a sovereignty product this is the worst outcome: **uncontained compromise presented as contained.**
- *Split-brain allow* → a minority partition serves stale allow decisions; enforce-mode is bypassed without anyone acting maliciously.

**Tier 1 — Compliance-catastrophic (sovereignty breach).**
- *Attested scheduling unmet* → a Ring-3 workload (PHI / ITAR / OCAP) lands on an under-attested or cloud-reachable node. That is a **reportable HIPAA breach, an ITAR violation, an OCAP custody failure** — regulatory, contractual, and reputational loss, and the exact failure the product exists to prevent.
- *Mutable control-plane audit* → no provable record of who changed which policy when; evidence packs become unattestable and the compliance value proposition collapses.

**Tier 2 — Integrity / financial (budgets and truth).**
- *Shared SpendLedger unmet* (today's in-memory G9a, unfixed) → N replicas each enforce a token's budget locally; a $100 cap bills up to ~$Nx100. The budget-carrying-capability model — WSF's headline primitive and F3's atomic-decrement contract — is **false under load**. Metering, ROI, and cost-kill all inherit the lie.
- *Non-idempotent reconciliation* → declared policy and running policy diverge silently; you believe enforce is on, it isn't.

**Tier 3 — Availability.**
- *No self-healing / no HA consensus* → a single control-plane or node failure takes the estate down; recovery is manual, slow, and error-prone — unacceptable for the regulated operators who are the buyers.

**Tier 4 — Strategic / thesis.**
- Without true orchestration, AOG is "a gateway with a policy check" — commoditizable, matchable by any cloud AI-gateway or a K8s+OPA assembly. The orchestration engine **is** the moat and the category claim ("the part no gateway competitor has," parent Phase T). Losing it forfeits the position.
- And the founding thesis — *controls live outside the model* — degrades to *controls live beside the model, per box, bypassable at the seams.* The platform ships a demo-true, deployment-false promise. That is the one failure the brand cannot survive.

**The through-line:** every M1/M2 guarantee is a per-process guarantee until Loom makes it an estate guarantee. Not building Loom does not leave AOG smaller — it leaves it *unsound at the scale customers deploy it.*

---

## A3 — Governance for this addendum

### A3.1 — Inherits parent §0
Verify gate (§0.3), commit + DEVLOG + worktree discipline (§0.4), STS rule (§0.5), CANON footer. All apply unchanged.

### A3.2 — Extended no-mock-only closure (load-bearing, extends §0.3.5)
Any prompt touching **consensus, scheduling placement, admission, node lifecycle, or kill-switch-under-scale** must ship ≥1 test against a **live multi-node harness** (Docker Compose ≥3 control-plane nodes + ≥2 `aog-node` edges) and a **live OpenBao**. Mock-only does not satisfy the gate for these paths. Split-brain and kill-switch tests must inject real partitions (network fault), not simulated ones.

### A3.3 — DEVLOG
New `docs/sessions/LOOM-DEVLOG.md`; one prompt = one focused commit (or tight bundle) + entry (id, files, verify result, SHA).

### A3.4 — Milestones (staged shippability)
- **M3a — Loom kernel (single control-plane node):** Phases K + R + X1–X2. Declarative estate, reconciliation, admission trust-weave, shared SpendLedger, `aog-gateway` under management. *Proves the model with zero orchestration-scale risk.*
- **M3b — Attested edge:** Phases S + N. Multi-node attested placement, node agents, self-healing, attestation-liveness.
- **M3c — Orchestration objects + HA:** Phases O + H. Deployments/rollouts/autoscale, multi-node Raft HA, air-gap federation, DR.
- **Summit-Conformance — the gated claim:** Phase V. Conformance suite green + chaos/soak/scale + split-brain & kill-switch-under-scale proofs. **Only after this may "Kubernetes-grade" be claimed externally.**

---

## Phase K — Control-plane kernel (`aog-store`, `aog-apiserver`, `aog-estate`)
- **K1 — `aog-estate` resource model.** Typed kinds (A1.5) with `spec`/`status`/`metadata`/`token_ref`/`receipt_ref`, serde + schema validation, extends `fabric-contracts`. *Gate: round-trip + schema-reject test for every kind; `fabric-contracts` dep, no ad-hoc structs.*
- **K2 — `aog-store` state machine.** Embedded, deterministic desired-state KV over redb/sled with revision counters + optimistic concurrency (compare-and-set). *Gate: CAS rejects stale writes; deterministic apply from a fixed op log.*
- **K3 — `aog-store` Raft.** openraft over K2; single-node bootstrap now, multi-node wired in H1. Linearizable writes; linearizable + watch-cache reads. *Gate: linearizable-write test; leader restart preserves committed state.*
- **K4 — Watch / informer.** Server-side watch streams + a client-side informer cache (resync, bounded staleness) for controllers. *Gate: informer reconstructs full state after a dropped connection; no missed final state.*
- **K5 — `aog-apiserver` CRUD surface.** axum typed CRUD per kind; every mutation enters the admission chain (K7–K8). *Gate: no write reaches `aog-store` bypassing admission (enforced by type + test).*
- **K6 — WSF authN at the front door.** Every request carries a `fabric-token`; verify budget/caveats/revocation before anything else. *Gate: unauth/over-budget/revoked request rejected pre-admission.*
- **K7 — Admission: validate (deny-wins).** Wire `mai-compliance` composer + per-kind resource policy; deny-wins over HIPAA/ITAR/OCAP. *Gate: a policy-violating mutation denied with a specific reason; deny-wins holds across composed rules.*
- **K8 — Admission: mutate + seal + attenuate.** Attenuate a child token scoped to the action; envelope-seal flagged `spec` fields (F4/F6); set defaults. *Gate: sealed field unreadable in `aog-store` dump; child token ⊆ parent scope/budget.*
- **K9 — Admission: receipt binding.** Every admitted mutation emits a `fabric-proof` receipt (token, before/after digest, decision) to `wsf-ledger`. *Gate: mutation ↔ receipt 1:1; chain verifies off-host with public key only.*
- **K10 — Resource versioning + conversion.** Schema evolution via stored-version + conversion webhooks; no estate downtime on a kind bump. *Gate: v1→v2 kind converts transparently on read; old objects still served.*
- **K11 — `aogctl` (kernel subset).** CLI: apply/get/describe/delete against the API server with a WSF token; table + json output. *Gate: apply-then-get round-trips a resource; over-budget apply rejected client-visibly.*

## Phase R — Reconciliation runtime + controllers (`aog-controller`)
- **R1 — Controller runtime.** Level-triggered reconcile loop framework: workqueue, rate-limit, exponential backoff, dedup, leader-gated singleton controllers. *Gate: duplicate/dropped events converge identically (replay test).*
- **R2 — Finalizers + GC.** Cascading delete, finalizers, orphan GC; deprovision propagates revocation (ties W9). *Gate: deleting a Tenant revokes its tokens everywhere + GCs children; no dangling capability.*
- **R3 — Tenant controller.** Reconcile `Tenant` → OpenBao `kv/tenants/<id>`, scopes, classification ceiling, subject-HMAC rotation. *Gate: provision→issue→deprovision→revoked-everywhere (live OpenBao).*
- **R4 — TrustRing controller.** Reconcile rings → OpenBao mounts + per-ring transit keys + policy set; ring key disable = ring dark. *Gate: disabling a ring key makes its envelopes unreadable + halts ring workloads.*
- **R5 — Capability / Budget controller.** Reconcile `Capability` → issued tokens; **budget backed by the shared atomic SpendLedger** (X1), not per-process memory. *Gate: concurrent decrement across 3 apiserver clients never over-spends a cap (live).*
- **R6 — PolicyBundle controller.** Sign + distribute policy bundles to gateways/nodes; versioned; rollback-able. *Gate: bundle update reaches all nodes; signature verifies at the edge; stale bundle rejected.*
- **R7 — ProviderPool / ModelEndpoint controller.** Reconcile provider/model availability + health into schedulable capacity. *Gate: an unhealthy provider is removed from schedulable set within SLO.*
- **R8 — VirtualKey controller.** Reconcile virtual keys → resolvable token scope/budget for the gateway (ties G1). *Gate: key change reflected at the gateway without restart.*
- **R9 — RevocationIntent controller.** A declarative `RevocationIntent` fans out to `fabric-revocation` snapshots (online + removable-media). *Gate: intent → token denied on every replica + on an air-gapped node via media.*

## Phase S — Scheduler (`aog-scheduler`, revived from `mai-scheduler`)
- **S1 — Framework + defect purge.** Filter/score plugin framework; **remove `mai-scheduler`'s fake-metrics paths** and replace with real node signals. *Gate: no fabricated metric in any code path (audit + test); scheduler decisions trace to real inputs.*
- **S2 — Capacity + real metrics.** Node capacity/utilization from `aog-node` heartbeats + `aog-meter`. *Gate: placement reflects real load; saturated node not selected.*
- **S3 — Ring filter (hard).** Workload ring must match node ring. *Gate: cross-ring placement impossible.*
- **S4 — Attestation predicate (hard) — the differentiator.** `classification_ceiling ≤ node.attestation_floor` (TPM/Nitro PCR + air-gap flag). *Gate: a Ring-3 workload is refused on an under-attested node and stays Pending — never force-placed.*
- **S5 — Budget/ROI score.** Prefer placements that maximize ROI/consolidation from `aog-meter`. *Gate: deterministic score from a fixed telemetry fixture.*
- **S6 — Spread / HA score.** Anti-affinity for replica resilience across nodes/rings. *Gate: replicas of one Workload spread across ≥2 nodes when available.*
- **S7 — Binding + runtime-token mint.** Write `Placement`, mint the workload runtime token (scope = its declared caps), receipt the decision. *Gate: bound workload receives a scoped token; binding receipted.*
- **S8 — Preemption + priority.** Higher-priority workload may preempt with disruption-budget respect (ties O7). *Gate: preemption honors PodDisruptionBudget-analog; no Ring violation during preemption.*

## Phase N — Node / edge runtime (`aog-node`)
- **N1 — Node agent + registration.** Register with attestation profile + capacity; secure channel with a `fabric-identity` node identity. *Gate: node joins with verified identity; spoofed node rejected.*
- **N2 — Heartbeat + status.** Liveness heartbeats; node-not-ready → controller reschedules. *Gate: killed node's workloads reschedule within SLO.*
- **N3 — Workload driver trait (CRI-shaped).** Pluggable start/stop/inspect. *Gate: same Workload runs via the trait on two driver impls.*
- **N4 — `process`/systemd driver.** Air-gap appliance default. *Gate: gateway replica lifecycle via systemd; clean restart.*
- **N5 — `containerd` driver.** Optional container runtime. *Gate: containerized workload lifecycle; parity with N4 semantics.*
- **N6 — Edge admission + Ring-3 cache.** Enforce `resolve_and_check` + W5 local cache at the node; air-gap sticky. *Gate: node keeps issuing safe (narrowed) decisions with the control plane unreachable; denies cloud routes when air-gapped.*
- **N7 — Health probes.** Liveness/readiness for managed workloads. *Gate: unhealthy replica restarted/replaced; readiness gates traffic.*
- **N8 — Attestation-liveness — the differentiator.** Periodically re-measure the workload; drift → evict **+ revoke its tokens**. *Gate: a tampered/drifted workload is evicted and its token denied estate-wide.*
- **N9 — Eviction + drain.** Graceful drain honoring disruption budgets; forceful on Tier-0 revocation. *Gate: drain completes without dropping in-flight authorized calls; revocation drain is immediate.*

## Phase O — Orchestration objects (`aog-controller` higher-order)
- **O1 — `Workload` (Deployment analog).** Declarative replicas + spec → desired replica set per kind. *Gate: declaring N replicas converges to N healthy, correctly placed.*
- **O2 — Rollout controller.** Progressive rollout (surge/unavailable) of Workload/PolicyBundle/provider config. *Gate: rollout maintains availability; each step receipted.*
- **O3 — Automatic rollback.** Error-budget breach (from receipts/meter) → rollback to prior signed state. *Gate: injected error budget-breach auto-rolls-back deterministically from the ledger.*
- **O4 — Budget-/ROI-aware autoscaler.** Scale on load **and** budget/ROI: idle→consolidate, saturated→scale/recommend hardware, budget-inefficient→scale down. *Gate: scale decisions from a fixed fixture are deterministic and budget-respecting.*
- **O5 — MissionContract operator.** Reconcile a Phase-T mission scope envelope → the tokens/tool-grants/budget an agent run may use. *Gate: an agent cannot exceed its MissionContract scope/budget (ties T-phase).*
- **O6 — ToolGrant orchestration.** Declarative tool access → `aog-toolproxy` config + per-call cred minting (T2). *Gate: revoking a ToolGrant halts the tool mid-run on every proxy.*
- **O7 — Disruption budgets + maintenance.** Disruption budgets, cordon/uncordon, node maintenance mode. *Gate: maintenance drains within budget; Ring guarantees preserved throughout.*

## Phase H — HA, consensus hardening, DR, federation
- **H1 — Multi-node Raft.** Promote K3 to ≥3-node control plane; leader election; member add/remove. *Gate: leader loss → new leader within SLO, zero committed-state loss.*
- **H2 — Split-brain fencing (load-bearing).** Minority partition fences (stops authoritative allow); edge fails static-restrictive. *Gate: injected partition → minority serves no allow; kill switch honored under partition.*
- **H3 — Snapshot / compaction / restore.** Raft snapshots; point-in-time restore. *Gate: restore from snapshot reproduces exact estate; receipts remain chained across restore.*
- **H4 — Backup + DR runbook.** Encrypted estate backup (envelope-sealed) + tested restore procedure in `docs/`. *Gate: full DR drill from cold backup succeeds by the runbook alone.*
- **H5 — Air-gap federation.** Cross-boundary policy/capability/revocation via signed removable-media snapshots (extends F8). *Gate: a policy + a revocation cross an air gap on media and apply verifiably, no network.*
- **H6 — Production guard.** Reuse PROD-* guards: reject dev OpenBao, unsigned bundles, single-node consensus in prod. *Gate: prod guard blocks any dev fixture / single-node quorum.*

## Phase X — Migration / cutover (no rewrite, no downtime)
- **X1 — SpendLedger externalization + leasing (do first; back-portable to M2).** Promote G9a's in-memory ledger behind a trait; the shared impl is **lease-based** over `fabric-token`'s atomic store: each replica leases a bounded budget slice, decrements **locally** (hot path stays local — no per-call round-trip), reconciles asynchronously. Worst-case cross-replica over-spend = one lease slice per replica, tuned to ε; ε is a published number, not an accident. *Gate: budgets hold across ≥3 gateway replicas under load (live); over-spend ≤ ε; no per-call shared-store round-trip; single-process behavior unchanged. (Reconciles the double-spend hazard with the V9 latency SLO in one mechanism.)*
- **X2 — Gateway as a managed `Workload`.** Bring `aog-gateway` under Loom (declared, placed, health-checked) with no API change. *Gate: an existing OpenAI/Anthropic client is unaffected across the cutover.*
- **X3 — toolproxy + meter as managed Workloads.** Same for `aog-toolproxy`, `aog-meter`. *Gate: tool calls + metering continue across cutover; receipts unbroken.*
- **X4 — Shadow-then-cutover.** Run Loom in shadow (observe/reconcile, don't act) → report-only → enforce, mirroring the G6 mode ladder. *Gate: identical estate differs across modes; shadow never disrupts.*
- **X5 — Compose parity + decommission.** k3s/k0s and Compose packagings from one artifact set; retire the hand-managed single-process path. *Gate: same binaries orchestrate under Compose and k3s; no config fork.*

## Phase V — Verification (the gated "as good as K8s" proof)
- **V1 — `aog-conformance` suite.** Executable conformance covering A1.12 bars 1–7; versioned; runnable by a customer. *Gate: suite green on the reference estate; each bar has an assertion.*
- **V2 — Reconcile idempotency fuzz.** Randomized event drop/dup/reorder → convergence. *Gate: 10⁴ randomized histories converge; zero divergent end-states.*
- **V3 — Linearizability (Jepsen-style).** Concurrent clients under fault injection; no lost update / stale allow. *Gate: no linearizability violation across the fault matrix.*
- **V4 — Split-brain safety.** Real network partitions; assert H2. *Gate: no authoritative allow from a minority; kill switch holds.*
- **V5 — Kill-switch-under-scale.** Revoke mid-session across ≥3 replicas; assert next call denied on every replica. *Gate: 100% of replicas deny the next call post-revocation.*
- **V6 — Attested-scheduling breach test.** Attempt to force a Ring-3 workload onto an under-attested node by every avenue (pressure, preemption, race). *Gate: no avenue places it; it stays Pending.*
- **V7 — Chaos + soak.** Kill controllers/nodes/leader under load for a sustained soak. *Gate: SLOs held; self-heal within targets; no receipt-chain break.*
- **V8 — Scale benchmark.** N-node / M-workload reconcile-latency + throughput fixture; publish the number. *Gate: meets the A1.12 bar-6 target set at V-start; regression-gated in CI.*
- **V9 — Weave-overhead SLO (fully verified).** Measure p99 per-call trust overhead with **all** per-action checks live (PoP verify, nonce, caveat/budget/revocation eval), excluding inference/provider I/O. *Gate: ≤ the target set at V-start (order ~1 ms); regression-gated. The target is met by cheap local crypto — never by skipping a check. (Doctrine I-3.)*
- **V10 — Revocation-propagation SLO (the kill number).** Revoke mid-session; measure time to denial on every replica, including a partitioned node. *Gate: ≤ N seconds p99 across ≥3 replicas; a replica past freshness-TTL fails closed; number published + regression-gated. (Doctrine I-9 / RC-KILL.)*
- **V11 — Robustness conformance (RC-1..RC-9 + RC-KILL/LEAK/DEPUTY).** Run the Doctrine D9 suite: one adversarial test per invariant with its threat injected, plus the red-team egress and confused-deputy suites. *Gate: all green — precondition to any external "cannot leak context / fail-proof" claim.*

---

## A4 — Cross-cutting risks & open decisions
- **Consensus engine:** openraft (async, modern) vs raft-rs (tikv, battle-tested). *Decision at K3.* Getting this wrong is expensive later — bias to the more proven unless async ergonomics dominate.
- **Workload runtime on the appliance:** process/systemd (simplest, air-gap-honest) vs containerd (richer, heavier). Ship process first (N4), containerd optional (N5).
- **Store engine:** redb vs sled for the state machine. *Decision at K2.*
- **Scale targets (N, M, latency SLO):** set numerically at V-start so bar-6/V8 are falsifiable, not vibes.
- **k3s/k0s vs pure Loom edge:** Loom is the control plane regardless; k3s/k0s is only an optional *packaging* of the node tier for cluster customers (X5), never the trust plane.
- **`mai-scheduler` fake-metrics debt:** it is *revived by deletion-and-rebuild of the fake paths* (S1), not by extending them. Do not inherit the defect.

## A5 — Completion criteria (Summit)
Loom is done when: the Phase V conformance suite is green; kill-switch-under-scale and attested-scheduling breach tests pass on a real multi-node estate; DR restores from cold backup by runbook; the estate runs a full air-gap topology with federation over media; and every A2 Tier-0/Tier-1 failure mode has a passing test proving it cannot occur silently. Only then is "Kubernetes-grade, woven" a claim we can stand behind — pound for pound, on correctness, and ahead on trust.

---
*This addendum is DRAFT. It authorizes nothing. Execute only on an explicit "run it STS" (whole addendum) or per-milestone approval (M3a / M3b / M3c / Summit-Conformance). Parent §0 governance and CANON Parts I–II apply in full.*
