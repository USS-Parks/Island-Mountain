Agentic Orchestration and Security: The Complete Map of How AI Agents Work, and How They Get Attacked
Island Mountain

An AI agent with credentials is not a chatbot. It is an actor on your network. It reads email, queries databases, executes code, and calls external APIs, and it does all of that with whatever permissions someone handed it during setup. The moment your organization moves from asking a model questions to letting a model take actions, you inherit a security problem that most vendors are not eager to explain. Agentic orchestration, the discipline of coordinating multiple AI agents to plan, delegate, and act on real systems, is now the default architecture for serious AI deployments. The security model for it is not.

The map below lays out both halves of that story in a single view. Five layers, read top to bottom: how multi-agent systems divide work, what a single agent actually needs to run, where agents touch the world, the controls that police every hop, and the attacks that target all of it. Each row pulses in sequence so you can follow a task's journey from intent to action.

The Agentic Orchestration and Security Map: five color-coded layers covering orchestration patterns, agent runtime, tools and integration, the security control plane, and the threat layer, with a legend, key facts, and a threat-to-control table
The Agentic Orchestration & Security Map. Open the full-size version to zoom into any card.
How to Read the Map
The layout borrows the visual grammar of the AI ecosystem charts that circulate every year, five stacked color-coded layers connected by typed arrows, but it swaps companies for capabilities. Reading top to bottom traces a task from intent to action: orchestration patterns decide how work is divided, agents execute it, tools touch the outside world, and a security control plane wraps every hop between them. The bottom row inverts the perspective. It catalogs the nine threat families that attack everything above it, using the naming conventions of the OWASP Top 10 for LLM applications.

The arrows matter as much as the boxes. Purple arrows are delegation. Blue arrows are results flowing back up. Green arrows are tool invocations. Red dashed arrows are attack paths, and they cross into the stack at specific, predictable places. If you take one thing from the diagram, take the geography of those red arrows.

Agentic Orchestration Is a Control Surface
The top two layers cover the coordination side. Layer one presents the eight canonical patterns: orchestrator-workers, sequential pipelines, parallel fan-out, router and handoff, evaluator-optimizer loops, hierarchical teams, human-in-the-loop gates, and the SDKs that implement them. Each pattern is a different answer to the same question, which is how to decompose a goal and reassemble the results without losing correctness along the way.

Layer two descends into the machinery a single agent actually needs. Planning against explicit success criteria. Specialist workers with role-scoped tool access. Context and memory management with provenance tags on every write. Durable checkpoints that allow resume and replay. Hard budgets on tokens, cost, wall-clock time, and iteration count, with a kill-switch behind all of them.

Together these layers make the map's first structural argument: orchestration is not just a productivity mechanism. It is a control surface. Depth caps, iteration limits, and typed handoffs are what keep autonomous delegation bounded. A runaway agent tree is not a hypothetical failure mode, it is what happens by default when nobody sets the caps.

Every Tool Call Crosses a Trust Boundary
Layer three marks the map's pivot, and its most important boundary. Tools, meaning MCP servers, function calling, RAG stores, code execution, browsers, shells, and external APIs, are where agents touch the world. Every arrow crossing that surface is a trust boundary. Results flowing back up are always treated as untrusted input, because indirect prompt injection rides in on the very pages, emails, and files an agent is asked to read. The document does not need to compromise your model. It only needs to convince your model.

The amber control plane beneath the tool layer is the enforcement answer: least-privilege identity with per-agent credentials, sandboxing with network egress allowlists, guardrails and input validation, approval gates for irreversible actions, session integrity checks, secrets management, immutable audit logs, and supply-chain vetting for the tools themselves. The unifying principle is that these controls are deterministic and live outside the model. A system prompt is a request. A sandbox is a fact.

The Threat Layer, From Prompt Injection to Agentjacking
The red bottom row grounds all of this in what attackers actually do. Nine threat families span trickery, takeover, corruption, and abuse. Prompt injection is the trickery. Agentjacking is the takeover: an attacker seizes a live agent mid-run, and the hijacked session inherits every credential and every standing approval the agent holds. Tool poisoning, memory poisoning, and supply-chain compromise are the corruption family. Data exfiltration, excessive agency, identity spoofing, and resource exhaustion round out the abuse category.

Data exfiltration deserves its own sentence because it follows a repeatable recipe that security researchers call the lethal trifecta: an agent with access to private data, exposure to untrusted content, and an outbound channel can be turned into an exfiltration machine. Remove any one leg and the attack collapses. That framing turns a vague worry into an engineering decision.

The map's sidebar pairs each threat with the primary control that breaks it:

Threat	Primary Control	How It Breaks the Attack
Prompt injection	Guardrails + human approval gates	Screen untrusted text; a human approves mutations
Agentjacking	Session integrity	Signed checkpoints, re-authentication on resume, kill-switch
Tool poisoning	Supply-chain security	Sign, pin, and re-vet tool manifests
Data exfiltration	Egress allowlists	Severs the trifecta's outbound leg
Excessive agency	Least-privilege identity	Per-agent scoped, short-lived tokens
Memory poisoning	Provenance tagging	Quarantine unverified writes
Identity spoofing	Authentication on every handoff	Mutual auth between agents
Supply chain	SBOM + scanning	Signed artifacts, pinned versions
Resource exhaustion	Budgets and ceilings	Token, cost, depth, and iteration caps
The closing note on the map is deliberately humbling: no single control is sufficient. Real security comes from the layers composing. Defense in depth, rendered literally as the geometry of the page.

Where the Infrastructure Decision Enters
Look back at the exfiltration row in that table. The control that breaks the most dangerous attack in the catalog is the egress allowlist, the outbound leg of the trifecta. On cloud infrastructure, egress control is a policy you configure, audit, and hope survives every misconfiguration, every new integration, and every vendor update. On an air-gapped local server, the outbound channel is not a policy. It is absent. An agent running against a local model on hardware behind your own firewall cannot beacon data to an attacker's endpoint, because there is no route out of the building.

The same logic extends to the identity and audit rows. Agents hold credentials, and agentjacking turns those credentials against you. When your models run on Island Mountain hardware, the agent's credentials, its session state, its audit trail, and every conversation log stay inside your perimeter. There is no third-party session store to compromise and no vendor-side log retention policy to negotiate. A Performance tier server, with dual RTX PRO 6000 Blackwell GPUs and 192GB of combined VRAM at $59,000 to $69,000 purchased once, runs the open-source models that agent stacks call all day, served through OpenWebUI with role-based access control your admin actually administers. For ITAR and CUI environments, an agent that cannot reach the internet cannot leak to it. That is not a claim about model quality, it is a claim about topology, and topology is the part you can verify.

What You Do Not Get
The map is an architecture reference, not a compliance certification, and local hardware is not a security silver bullet. Air-gapping does not stop prompt injection: a poisoned document on your own file share still carries hostile instructions, and guardrails, approval gates, and provenance tagging are software disciplines you still have to run. Orchestration frameworks, policy engines, and audit pipelines are engineering work your team or your contractor still owns; they do not arrive in the crate. And the exfiltration protection of an air gap weakens the moment you open an egress path, so if your agents need live web access, you are back to allowlists and monitoring like everyone else. The honest version of the pitch is narrower and stronger: local infrastructure makes the single most load-bearing control in the agentic threat model a matter of physical fact rather than vendor policy.

Summary: Agentic orchestration gives AI systems the ability to act, and every action crosses a trust boundary that must be defended. The controls that matter are deterministic and live outside the model: least privilege, sandboxing, egress control, approval gates, and audit. Local AI infrastructure turns the most load-bearing of those controls, the outbound channel, into a physical property of your deployment instead of a promise in a vendor's terms of service.