The one move, applied one layer up
Island Mountain's founding play is: take best-in-class open source (open-weight models), wrap it in an appliance experience, and sell sovereignty without the operational burden. AOG + WSF is the same move applied to the layer above the models — the control layer. Summit answered "where does the intelligence run?" This answers "who decides what it's allowed to do, who proves what it did, and who counts what it's worth?" Today those questions are answered by nobody, or worse, by the model vendor — which is exactly the lock-in.

The clean split is two planes:

AOG is the control plane. It decides: what routes where, under what policy, with what approvals, at what cost.
WSF is the trust plane. It enables and proves: who this workload is, what it may touch, what secrets it gets, and a signed record of what actually happened.
Neither is complete alone. Governance without enforcement teeth is a compliance spreadsheet; a secrets vault without policy is just a keyring. Together they're a sovereignty stack — and each still has to stand alone as a sellable product, which they can (more below).

AOG — Agentic Orchestration Governance
Five functions, in the order a request meets them:

Unified gateway. One OpenAI-compatible (and Anthropic-compatible) endpoint in front of every provider: vLLM on a Summit box, the customer's own GPUs, and cloud frontier APIs when policy permits. Existing tools and vendor integrations repoint with a base-URL change — this is the answer to "all our software assumes OpenAI." It's the Lamprey provider registry (MODEL_CATALOG, chatStream, per-provider dispatch) generalized into a server-side daemon.
Policy engine. Declarative policy-as-code over four dimensions: principal (user, team, agent), action (chat, tool call, embed), resource (model, tool, data class), and context (budget remaining, approval state, time). "Claims data never leaves the building" compiles to an enforceable rule at the egress boundary, versioned and auditable. Cedar and OPA are the two serious engine candidates — a PSPR decision.
Agent-loop governance. This is the differentiator over every existing LLM gateway. Gateways govern requests; agents take actions. AOG governs the loop: tool allowlists with risk tiers, human approval queues for mutating actions, blast-radius caps (max files touched, max external calls per task), kill switches, and full session record-and-replay. And here's the part you've already built: Lamprey's change contracts and proof receipts become "mission contracts" — an agent declares its intended scope up front and the runtime enforces the envelope. Your Agentjacking post is the market education for this feature; AOG is the productized answer.
Metering and ROI. Cost per task, not per token — a workflow ID traces through multi-call chains so the dashboard says "contract review costs $0.31 local vs $2.10 cloud, quality-adjusted by your own eval scores." A break-even tracker for the hardware ("your Summit box pays for itself in 4.2 months at current volume"). And a recommender that watches utilization: idle capacity generates "move these workloads on-prem, save $N/mo"; saturation generates the upgrade conversation. The box sells its sibling. This is also the sales division's flywheel — AOG deployed in shadow mode over a prospect's existing cloud spend produces the hardware business case from their own telemetry.
Audit evidence. Immutable logs of every prompt, response, tool call, and policy decision, with retention rules and one-click evidence packs mapped to HIPAA, SOC 2, NIST AI RMF, ISO 42001, and the EU AI Act. Compliance evidence as a feature, not a consulting engagement.
WSF — the trust fabric
First, a naming flag: "Woven Trust Token Fabric" abbreviates to WTTF, not WSF. If WSF is the acronym you want on the box, Woven Sovereignty Fabric fits the letters and the brand perfectly — and "trust tokens" survives as the name of the core primitive inside the fabric, which is arguably stronger anyway (the product is the fabric; the token is the thread). Woven Security Fabric and Woven Secrets Fabric are the fallbacks. Your call; the architecture doesn't change either way.

Yes to Lamprey-MAI-plus-OpenBao as the foundation. OpenBao (the Linux Foundation fork of Vault, MPL-2.0, so fine to embed commercially) gives you KV secrets, dynamic short-lived credentials, transit encryption, and PKI. What it does not have is Vault Enterprise's transform engine (format-preserving tokenization) — which is good news, because that means the most sellable strand of WSF is genuinely our product surface, built on OpenBao's transit engine rather than repackaged from it.

The fabric weaves three meanings of "token" into one system, and I'd lean into that fusion deliberately:

Access tokens — workload identity. Every agent, session, and task gets a short-TTL identity (SPIFFE-style, backed by OpenBao PKI). No agent ever holds a raw provider key or a long-lived god-credential; WSF mints scoped, dynamic credentials per task. This kills the single worst agent-security failure mode.
Data tokens — PHI/PII tokenization. Sensitive spans are detected at the boundary and replaced with placeholders; the model reasons over placeholders; rehydration happens only inside the trust boundary. This makes even cloud model use defensible during a customer's transition — which matters for land-and-expand.
Budget tokens — metered capability. The trust token itself carries scope and spend: this identity, these models, these tools, this data class, this TTL, this dollar/token cap, these approval requirements — one signed, attenuable object (macaroon/biscuit-style, so a team lead can mint a narrower child token for a contractor or a subagent). Finance and security reason about the same object. I think this is the most novel primitive in the whole offering.
The fourth strand is the receipt ledger: hash-chained, signed records per turn — request hash, policy decision and policy version, tool calls, approvals, output hash, and critically the model weights digest. That last one is a capability cloud vendors cannot offer: when you own the weights, you can prove which exact model produced an output. For your legal, healthcare, and tribal-sovereignty audiences, "provable model identity" is evidence that stands up in an audit or a courtroom. Lamprey's M-phase append-only receipts are the direct ancestor.

The seam, and why two products
AOG asks; WSF answers and remembers. AOG's policy engine decides "this request may go to model X with tools Y under budget Z" — WSF mints the credentials, tokenizes the payload, and signs the receipt. The integration contract is three shared schemas: identity, trust token, receipt.

They stand alone: AOG works over a pure-cloud estate with no hardware sale (the beachhead), and WSF can harden anyone's existing gateway. But the sequencing insight is to define the receipt and token schemas first, so AOG v1 emits WSF-compatible receipts from day one — the fabric arrives to find the threads already in place.

The UX is the product
You said it and I agree completely — this is where Lamprey Harness DNA wins. Enterprise governance tooling is uniformly hostile: Vault's UI, OPA's nothing, admin consoles from 2012. The console surfaces: a Policy Studio that renders policy-as-code in plain language and lets a local model explain any denial citing the exact policy line ("governance that explains itself" — the killer demo); an Approval Inbox with diff previews (your approval-chips pattern); the ROI/break-even dashboard; a Model Arena that runs the customer's golden tasks across candidates; and audit search with session replay (your reasoning-trace viewer pattern). The onboarding SLO is a UX metric: shadow-mode governance over existing OpenAI spend in 15 minutes, zero code changes. Shadow mode graduates to enforce mode when they're ready.

Dismantling the complexity objection
The enterprise fear decomposes into six specific fears, and each has a concrete product answer:

Fear	Answer
"We have no MLOps/GPU people"	Appliance model: pre-imaged inference runtime, monitoring, signed offline update bundles. Operate it like a NAS, not a K8s cluster.
"Open models go stale"	Model subscription: curated signed bundles, blue/green model rollout gated by the customer's own golden-task regressions. Model updates like OS updates.
"Open models aren't good enough"	The Arena measures on their tasks, not benchmarks — and hybrid routing sends the genuine frontier-need residue to cloud, tokenized, under policy.
"Everything assumes OpenAI"	OpenAI/Anthropic-compatible gateway; a base-URL change.
"An autonomous agent inside our network terrifies us"	That's literally AOG+WSF: scoped short-TTL creds, mission contracts, approval gates, replay. An agent under AOG is more supervised than any SaaS agent they can't see into.
"Day-2 ops will eat us"	Health telemetry, A/B image updates, SBOMs per bundle, HA pair, documented RTO/RPO — complexity doesn't vanish, it moves to Island Mountain and gets amortized across customers. That sentence is the appliance business model.
Plus the "3x oversold" pitfalls of rented intelligence, each mapped: spend volatility → budget tokens; rate-limit contention → a local capacity floor you own; silent model swaps and deprecations → pinned, checksummed weights (behavior cannot change under you — reproducibility as a compliance feature); data-use terms drift → policy at egress; the lock-in ratchet (stranded fine-tunes, embeddings, prompt libraries) → owned embedding stores and portable abstractions.

Leveling the trade-off
Today enterprises pick a point on a line between capability (cloud frontier) and sovereignty (on-prem open). The stack bends the line two ways. First, it makes sovereignty cheap: the appliance + governance layer removes the engineering tax. Second — and this is the framing I'd put in front of customers — it adds axes where sovereign wins outright rather than merely costing less: provable model identity, replayable decisions, hard egress guarantees, and pinned behavior simply do not exist as cloud offerings. Sovereignty stops being a tax you pay against capability and becomes capabilities of its own.

The end state to sell: sovereignty as the default, frontier as a governed exception — the exact inverse of today's posture. And the go-to-market walks there gradually: land with AOG shadow mode (no hardware commitment), let the dashboard reveal which workloads are sensitive, high-volume, and open-weight-satisfiable, then expand to Summit + WSF. Fitting that this comes from the sales and customer-service division: the fear ledger is literally the roadmap — every objection a prospect voices becomes a feature.

What Lamprey actually contributes
Transplant organs, not the body. Lamprey is a single-user Electron desktop app; AOG is a multi-tenant server daemon, so it's a new codebase — but the hard-won modules map directly: the provider registry/dispatch pattern → router core; permissions-store + approval UX → the Approval Inbox; proof receipts + change contracts → receipt ledger + mission contracts; reasoning-trace viewer → session replay; Snip filters → egress redaction seeds; the keychain discipline gets superseded by OpenBao itself. The React console inherits the panels aesthetic wholesale — that's the "phenomenal UX" carrier.

The gap this occupies
LLM gateways (LiteLLM, Portkey, Kong AI Gateway, Cloudflare AI Gateway) do routing, caching, and cost — thin on agent-loop governance, absent on air-gap. Guardrails vendors do content filtering, not full-loop control. GRC vendors do paperwork, not runtime enforcement. Vault/OpenBao exists but nobody has woven it into an agent-scoped, budget-carrying token fabric. The integrated combination — runtime agentic governance + trust fabric + air-gapped appliance + a hardware flywheel — is defensible specifically because Island Mountain sells metal: pure-software competitors can't close the loop to owned infrastructure, and hyperscalers won't build for air-gapped estates.

Open decisions before we PSPR
WSF naming — my recommendation is Woven Sovereignty Fabric, keeping "trust tokens" as the primitive.
Gateway runtime — Go/Rust single-binary (appliance-friendly, fast data path) vs Node/TS (velocity, Lamprey pattern reuse). Console is React regardless. I lean Go for the daemon, TS for the console, but it's arguable.
Policy engine — Cedar (formally analyzable, embeds cleanly) vs OPA/Rego (enterprise mindshare).
Sequencing — AOG first with WSF-ready receipt/token schemas from day one. Agree/disagree?
Plan shape — one master PSPR vs two coordinated P-SPRs plus a short shared-contracts doc (I'd do the latter, per Lamprey discipline).
OSS posture — open-core AOG (open gateway, paid enterprise policy packs/HA/WSF) would be a credibility and distribution engine for this brand, but it's a real business decision.
Beachhead vertical for the v1 policy pack — healthcare, legal, tribal, or defense (you have blog credibility in all four; pick one to go deep).