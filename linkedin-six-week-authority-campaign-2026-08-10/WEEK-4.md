# Week 4: August 31–September 4, 2026

## 16: Inventory the Identities Nobody Logs In As

**Publish:** Monday, August 31
**Source idea:** 8
**Icon:** `icons/masters/linkedin-16-nonhuman-inventory-icon.png`
**Form:** F1 field checklist
**First comment:** The governance layer we build for machine identities and agent tooling: https://islandmountain.io/lamprey-woven-security-governance.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p16

### Long-form article

Count the principals in your environment that no human logs in as, and I’ll wager the number embarrasses somebody. Service accounts, API keys, workload identities, automation tokens, certificates, bots, scheduled jobs, integration accounts, and now AI agents reaching through tools. Each one’s carrying authority. A surprising share outlive the project that justified their creation, and nobody’s assigned to notice.

Here’s the inventory we run, one card per identity, six fields each:

- What is it, which workload uses it, and which named human owns that workload today.
- What it can touch, listed as resources and actions rather than role names.
- How its credential gets issued, and the exact procedure that revokes it.
- When it last ran, because “unknown” here is a finding in itself.
- The event that ends its life: a decommission date, a contract close, a migration.
- Whether its actions can be told apart from every other principal’s in the logs.

That last field’s there on purpose. Fail it and attribution’s already gone; whatever the identity does next belongs to everyone and no one.

OWASP’s Non-Human Identities Top 10 catalogs the failure modes I keep finding in the wild, improper offboarding, secret leakage, overprivilege, and long-lived credentials among them. They travel together. The abandoned integration usually holds a static secret and broad access precisely because nobody dares break a dependency nobody’s documented.

Three rules follow from the inventory, and I’d rather Discovery apply them before any agent gets tools.

Shared automation accounts get split; a common identity for every script destroys both attribution and least privilege in one stroke. Credentials get bound to workloads and expire with the task, so a leaked key ages into uselessness instead of waiting years for its incident. And when an AI agent wants to act, a deterministic broker weighs that specific request and hands over authority that dies at task’s end, with a receipt behind it. The model doesn’t hold a thing between tasks.

We start the cleanup with the cards that have no owner in field one. Those orphans are the honest census of how the institution treats creation as an event and retirement as a rumor. Every machine principal needs a human owner, a bounded purpose, and an ending, and the inventory’s where all three become checkable.

#IdentitySecurity #NonHumanIdentity #AIGovernance #LeastPrivilege

### LinkedIn summary post

Your employee roster is inventoried. Your machine roster probably isn’t, and it acts with more authority.

Six fields per non-human identity settle it: the workload and its named human owner, the resources and actions allowed, issuance and revocation procedure, last run, the event that ends its life, and whether its actions are distinguishable in the logs.

The distinguishability field is the sleeper. Lose it and every incident becomes unattributable by design.

OWASP’s NHI Top 10 reads like my field notes: offboarding nobody finished, secrets nobody rotated, privileges nobody trimmed, credentials nobody expired.

The orphaned entries, owner unknown, are where we’d begin. They show exactly how creation got ceremonialized while retirement got forgotten.

Owner, purpose, ending. Machines get all three or they don’t get authority.

#IdentitySecurity #NonHumanIdentity #LeastPrivilege

---

## 17: An Agent Should Never Mint Its Own Authority

**Publish:** Tuesday, September 1
**Source idea:** 19
**Icon:** `icons/masters/linkedin-17-agent-authority-icon.png`
**Form:** F4 doctrine clauses
**First comment:** The trust-plane architecture behind these clauses, in detail: https://islandmountain.io/lamprey-woven-security-governance.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p17

### Long-form article

An AI agent can propose any action it likes. What it can’t do, anywhere we’ve built, is author its own permission.

Tool-connected systems blur this constantly: one broad token, one model deciding, calling, and narrating, with intent, authorization, and execution all living inside the same probabilistic component. That concentration fails politely in demos. Against hostile input it doesn’t fail politely at all. So the agents we deploy operate under six standing clauses.

Clause one. The agent’s a principal making a request, nothing more. Each request carries identity, task context, the resource, the action, and a bounded budget. Anonymous ambition doesn’t execute.

Clause two. A deterministic policy layer the model can’t rewrite evaluates every request. The rules live outside the reasoning engine, so a prompt, however creative, can’t edit them.

Clause three. Permitted requests receive ephemeral authority scoped to that single action, delivered by a credential broker. Nothing standing, nothing reusable, nothing worth stealing for long.

Clause four. Reading never becomes writing by narration. An agent that describes a write as necessary has made an argument, and arguments don’t go straight to execution; they go to policy or a person.

Clause five. Urgency claimed in a prompt doesn’t change a thing. Any text an agent ingests may contain instructions, and there’s no system prompt that can promise untrusted content stays inert, so the boundary lives in infrastructure: narrow tools, explicit destinations, controlled egress, small budgets, receipts fit for review.

Clause six. Failure closes the path. Missing identity, unreachable policy, an unissuable credential, an out-of-task request: the call doesn’t proceed, and the agent may explain the refusal without any means of routing around it.

Human approval still exists in this design; what’s changed is where it lands. A person approves a specific consequential action or a specific policy change, visibly, rather than granting an indefinite token because the interface wanted to keep moving. High-impact tools get dual control or step-up authentication on top; that’s cheap insurance.

Slower than handing over a master key? Marginally, yes. Reconstructing an unattributed action after that key gets used in a way nobody intended is slower still, and I’ve chosen which delay I can defend to an auditor.

#AgentSecurity #AIGovernance #IdentitySecurity #LeastPrivilege

### LinkedIn summary post

Give an agent a broad token and you’ve made one probabilistic component the author, judge, and executor of its own requests. Adversarial text couldn’t ask for a better arrangement.

The clauses we deploy under instead:

Every agent action is a request carrying identity, task, resource, and budget. A policy layer the model can’t edit decides. Approval yields authority that expires with the single action. Read never upgrades to write because the model argued well. Urgency inside a prompt moves nothing, since any ingested text might’ve been written by an attacker. And when identity, policy, or credentials fail, the path closes; the agent can explain, never bypass.

People still approve consequential actions. They approve specific ones, visibly, instead of blessing an indefinite token to keep a demo moving.

Reasoning belongs to the model. Permission doesn’t.

#AgentSecurity #IdentitySecurity #AIGovernance

---

## 18: Zero Standing Privilege Has to Survive Operations

**Publish:** Wednesday, September 2
**Source idea:** 5
**Icon:** `icons/masters/linkedin-18-zero-standing-privilege-icon.png`
**Form:** F3 walkthrough
**First comment:** How the access model holds up when the night gets interesting: https://islandmountain.io/lamprey-woven-security-governance.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p18

### Long-form article

It’s 1:40 a.m. inside the worst maintenance window of the year, hypothetical but familiar.

An urgent patch is half-applied when the identity provider stops answering. Three teams are waiting, the change window closes at four, and the administrator who needs elevated access can’t get the normal grant because the system that issues grants is the thing that’s down.

Zero standing privilege is easy to admire at noon. This is the hour that decides whether it’s real.

In the design that survives, the administrator reaches for break-glass access that wasn’t improvised: built in daylight, conspicuous by design, narrow in scope, strongly authenticated, time-boxed to the emergency, and guaranteed a review on Monday. Service gets restored, the patch completes, and the grant expires on its own before anyone forgets it existed. The audit trail reads like a story Monday’s review can retell.

In the design that fails, it’s one of two endings. Either there’s no emergency path at all, so the control gets bypassed with a shared password from a sealed envelope, and attribution dies in the envelope. Or the shortcut taken at 1:40 becomes permanent by Thursday, because nothing forced it closed, and the institution’s back on invisible, indefinite authority with extra steps.

2:15 a.m., same night. An agent-driven batch job needs its usual access, seconds at a time, dozens of times. Manual approval for each harmless read would make the system unusable; a permanent token defeats the entire control. Neither’s acceptable, and neither’s necessary. The design that works lets policy auto-issue expiring credentials for routine bounded actions while reserving human approval for the consequential ones, so the batch hums along and nobody’s holding a master key.

We test these hours before launch rather than during them. Expire a credential mid-task. Take the approver offline. Interrupt the policy service and the audit sink, then attempt something out of scope and confirm it dies while authorized recovery still works. Every drill passes or improves the design; there isn’t a third outcome.

Morning after, one number matters to me: how many grants ran to their full duration versus expiring early. Privilege that lingers is privilege reverting to furniture, and furniture’s what this control was built to abolish.

#ZeroStandingPrivilege #IdentitySecurity #AgentSecurity #Cybersecurity

### LinkedIn summary post

Every access-control design has two versions: the diagram, and 1:40 a.m. during a failed patch with the identity provider down.

Zero standing privilege earns its name in the second version.

The survivable build’s got break-glass designed in daylight: loud, narrow, strongly authenticated, time-boxed, reviewed after. The failed build has a sealed envelope with a shared password, which is attribution’s funeral arranged in advance.

Agents stress the same principle from the other side. Jobs needing seconds of access, dozens of times nightly, get policy-issued credentials that expire the moment the action’s done. Humans stay in the loop for consequential grants only, so the loop’s livable.

We drill it before launch: kill a credential mid-task, remove an approver, interrupt the policy service, try out-of-scope work.

Controls that only exist on quiet nights are decorations.

#ZeroStandingPrivilege #IdentitySecurity #Cybersecurity

---

## 19: Agentic Systems Need Scar Tissue Before Scale

**Publish:** Thursday, September 3
**Source idea:** 12
**Icon:** `icons/masters/linkedin-19-agent-scar-tissue-icon.png`
**Form:** F6 spec with commentary
**First comment:** The governed agent substrate we run these drills against: https://islandmountain.io/lamprey-woven-security-governance.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p19

### Long-form article

A successful demonstration is the weakest evidence an agentic system can offer. Before one earns broader authority from us, it runs the failure drill sheet, and I’d rather publish the sheet than keep describing it abstractly:

- Seed an ingested document with hostile instructions and confirm they die at the policy layer.
- Return malformed data from a tool mid-chain and watch what the run does with it.
- Delete a required field from a source record; the ambiguity’s supposed to surface, not vanish.
- Present two authoritative sources that disagree, and require the disagreement to reach a human.
- Expire the credential between approval and execution; the action must fail closed.
- Deny network egress to an expected destination and check nothing improvises a route.
- Request an action outside the task’s scope and verify refusal plus a clean receipt.
- Interrupt the run, resume it, and prove no step executed twice or slipped through unrecorded.

The commentary’s where the doctrine lives.

Drills only count when a failure changes something; otherwise it’s theater with better logging. A tightened scope, a new receipt field, a separated tool, an approval moved to a better boundary, and a regression test so the same class of error can’t quietly return. Scar tissue’s exactly that: evidence of damage converted into structure.

Intervention rates stay on the table where everybody’s forced to see them. A workflow that staff rescue three times a week isn’t autonomous in any operating sense, and that can be fine; a supervised assistant delivering value while the institution learns is a respectable machine. Describing hidden human effort as machine reliability is the failure mode, and it’s a management choice, never a model property.

Scale moves one dimension at a time. More users, broader data, additional tools, greater authority, or lighter supervision, pick one, measure, then pick the next. Expand all five together and there’s no one alive who can explain why performance changed.

And the controls need their own evidence, separate from task success. Policy failed closed under load? Credentials stayed bounded? Egress held? Receipts preserved ordering? The external stop worked when invoked rudely? A high task score doesn’t answer one of them, which is why our acceptance tests ask directly.

Authority accrues to systems that’ve been hurt in controlled ways and improved by it. Everything else is a demo with ambitions.

#AgenticAI #AIGovernance #SecurityTesting #HumanOversight

### LinkedIn summary post

Eight injuries we inflict on an agentic system before it gets real authority:

Hostile instructions planted in a document. Malformed tool output mid-chain. A required field gone missing. Two sources in open disagreement. A credential expiring between approval and execution. Egress denied to an expected destination. A request outside task scope. An interrupted run, resumed.

Pass isn’t the interesting outcome. What’s interesting is what each failure changes: a scope tightened, a receipt enriched, an approval relocated, a regression test added.

Two honesty rules ride along. Intervention rates stay visible, because staff quietly rescuing a workflow isn’t autonomy. And scale moves one dimension at a time, or nobody’s able to say what broke.

Demos show what a system can do. Scar tissue’s the record of what it survives.

#AgenticAI #SecurityTesting #AIGovernance

---

## 20: Why the AI Pilot Died in Security Review

**Publish:** Friday, September 4
**Source idea:** 14
**Icon:** `icons/masters/linkedin-20-security-review-icon.png`
**Form:** F5 objection ladder
**First comment:** The Discovery sequence that gets pilots through review alive: https://islandmountain.io/forward-deployed-ai-engineering.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p20

### Long-form article

What killed the AI pilot in security review?

Nothing, usually. It arrived dead, and nobody’d checked for a pulse. I say that with sympathy, because the postmortem always features the same four complaints from the project team, and each one deserves a straight answer.

“Security ambushed us at the end.” Flip the film around. The review asked where data goes, who sees prompts and attachments, whether outputs are retained, which subprocessors participate, what the model can call, how an incident gets investigated, and how the institution exits with its records. Those questions existed on day one; the pilot didn’t ask them, and unasked questions compound like debt. Nobody in that room was being unreasonable. The sequence was.

“They demanded documents that don’t exist.” Which documents, though? A data-flow map, for one. An identity model. A list of tools and destinations. A statement of what the system can write, send, delete, or change. If those don’t exist, the team has a demo with aspirations rather than an architecture, and security just said so out loud.

“They just don’t want AI here.” In a decade of these conversations I’ve met that reviewer approximately twice. What security wants is for ordinary success and foreseeable failure to both fit the institution’s obligations. Requirements differ from preferences, and the sorting mechanism’s data classification and consequence, never enthusiasm or dread.

“We’ll bolt the controls on after launch.” The one answer that’s worse than no answer. Here’s the alternative that works: shrink the use case until it passes honestly. Strip the sensitive data out. Make the tools read-only. Keep outputs as drafts for human review. Run it locally. Cut retention. Delay the risky integration to phase two. Each reduction’s explicit and testable, unlike an informal promise that leans on user restraint.

The pattern behind all four answers: bring security into Discovery holding a bounded workflow, because “we want AI” generates unbounded questions and a named task generates finite ones.

Pilots that arrive at review carrying their architecture tend to walk out approved. The ones that arrive carrying a slide deck get the eulogy everyone insists on calling a review.

#AISecurity #SecurityReview #AIGovernance #PilotFatigue

### LinkedIn summary post

The security review gets blamed for a lot of AI pilot deaths it didn’t cause.

The cause of death is usually the same: the pilot postponed every hard question until the end, then presented a demo where an architecture should’ve been.

The questions were knowable in week one. Data path. Prompt and attachment visibility. Retention. Subprocessors. Tool permissions. Incident evidence. Exit with records intact.

The teams I watch pass answer them during Discovery, with a bounded workflow and a data-flow map. Teams that can’t are being told they lack an architecture, which is information, not obstruction.

And when risk runs too high, shrink honestly: sensitive data out, tools read-only, outputs as drafts, local processing, shorter retention. Explicit reductions beat informal promises every time.

Security didn’t kill it. The calendar did.

#AISecurity #SecurityReview #PilotFatigue
