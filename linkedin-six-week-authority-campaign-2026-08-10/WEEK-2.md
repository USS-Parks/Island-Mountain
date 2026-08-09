# Week 2: August 17–21, 2026

## 06: The Docketing Clerk Is Part of the Architecture

**Publish:** Monday, August 17
**Source idea:** 6
**Icon:** `icons/masters/linkedin-06-docketing-clerk-icon.png`
**Form:** F3 walkthrough
**First comment:** Where AI fits in a law practice without touching the professional verdict: https://islandmountain.io/law-firms.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p06

### Long-form article

It’s 4:47 on a Friday afternoon. Run the tape forward with me; the scenario is invented, the mechanics aren’t.

A notice lands in the intake queue. It amends a date that three other deadlines hang from, the service method changes the calculation, and a second notice from the same matter doesn’t agree with the first. The docketing clerk has seen this movie. She knows which source controls when notices conflict, how the local rule treats the weekend, and which judge’s chambers answers the phone after four.

Now put an AI assistant in that room and watch what it should and shouldn’t do.

It should read the notice, extract candidate dates, pull the related filings, and assemble the chronology she’d otherwise build by hand at quitting time. It should show her the rule and the sentence it relied on. What it must never do is quietly convert a confident guess into a controlling deadline, and it doesn’t get to tidy the queue by hiding its own uncertainty.

So the workflow we build around her has a specific shape. Every suggested date carries its source. The entry sits in a pending state that stays pending until she acts; her name’s the reviewer of record, not a policy abstraction. When she corrects the machine, both versions persist, and six months later the firm can reconstruct how the deadline entered the docket and who accepted it.

ABA Formal Opinion 512 runs the analysis through existing duties, supervision among them. My reading for docketing work: supervision has to be visible in the system itself, or it isn’t supervision, it’s an org chart.

The right first scope’s narrower than most teams want. Classify incoming notices. Extract candidates. Assemble support. Leave the controlling entry with the clerk, and measure whether her review got faster instead of pretending ownership moved.

Back to 4:47. In the version of the story where the architecture respects her, she resolves the conflict in minutes with the evidence pre-assembled, and the weekend starts on time. In the other version, a plausible entry slides into the calendar unreviewed, and the firm finds out what it cost during a malpractice deposition.

I build for the first version. The clerk was never the bottleneck; she’s the control.

#LegalAI #LawFirmOperations #AIGovernance #ProfessionalJudgment

### LinkedIn summary post

Watch a legal deadline get born and you’ll know where AI belongs in the workflow.

Two notices disagree. A local rule changes the math. Service method matters, one filing moves three obligations, and the person who untangles it is the docketing clerk, not the calendar software.

We put AI to work around her: extracting candidates, pulling related filings, assembling the chronology, citing the rule.

The boundary that keeps everyone employed and insured: nothing becomes a controlling entry until she acts, every suggestion carries its source, and her corrections survive alongside the machine’s guesses.

ABA Opinion 512 talks about supervision. In a docketing system, supervision is a pending state with her name on it, or it’s fiction.

Model the work from court rules alone and you’ve modeled the easy 80 percent. She’s there for the other 20.

#LegalAI #LawFirmOperations #ProfessionalJudgment

---

## 07: A BAA Is Not an Architecture

**Publish:** Tuesday, August 18
**Source idea:** 15
**Icon:** `icons/masters/linkedin-07-baa-architecture-icon.png`
**Form:** F8 dissent
**First comment:** Our HIPAA-focused rundown of what local inference changes, and what it doesn’t: https://islandmountain.io/hipaa-local-ai-compliance.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p07

### Long-form article

“We signed the BAA, so we’re covered.”

I’ve heard that sentence end more healthcare AI conversations than any other, and I’d like it to stop ending them, because it confuses a contract with a system.

Credit where due: the business associate agreement matters. HHS guidance permits covered entities and business associates to use cloud services for electronic protected health information when the required agreement is in place and HIPAA duties are otherwise met. Permitted uses, safeguards, reporting obligations, subcontractor terms, return or destruction at exit. Real obligations, really allocated.

Here’s what the signature didn’t do. It didn’t decide where ePHI is stored or how it moves. It didn’t verify an identity, scope an access grant, protect a backup, or test a recovery. It didn’t determine which data this workflow needs at minimum, what gets logged, or what happens in the first hour of an incident. Contracts allocate duties. They can’t configure services, and nobody’s risk analysis gets shorter because procurement went smoothly.

The confusion compounds when the BAA becomes a permission slip. A signed agreement gets treated as proof the service is safe for any clinical or administrative use, when the workflow, the data set, the user role, the integration, and the retention period were never examined.

My counterargument is a map. For each proposed workflow, trace the information from source to output. Name every system and person able to see it. Identify the minimum data the task requires, the human review point, the retention rule, the deletion path, and the downtime behavior. Then read the agreement beside that map and check they describe the same reality.

Local inference earns a paragraph here because it genuinely changes the exposure pattern: data that never leaves institutional infrastructure skips the routine transfer to an outside inference provider, and fewer parties hold sensitive material. I build those systems. I still won’t claim the box creates compliance. An on-site server with broad accounts, weak logging, and untested backups is just a shorter path to the same bad afternoon.

So the next time an AI vendor leads with the BAA, take it, thank them, and ask for the second conversation: data path, access model, incident boundary, exit procedure. That’s the one where the deployment gets real.

#HealthcareAI #HIPAA #DataGovernance #OnPremAI

### LinkedIn summary post

A signed BAA answers one question. Healthcare AI needs about nine more answered.

The agreement allocates HIPAA obligations, and that’s necessary. It doesn’t configure identity, scope access, protect backups, test recovery, minimize the data a workflow touches, or write the incident playbook.

We keep meeting deployments where the contract stands in for all of that.

The corrective we use starts with a map of the information path: source to output, every system and person that can see it, review point, retention, deletion, downtime. Then hold the agreement next to the map and check they’re describing the same system.

Local inference can shrink the exposure pattern by keeping ePHI inside your walls. It can’t govern itself, and I say that as someone who builds it.

Paper covers obligations. Architecture covers Tuesdays.

#HealthcareAI #HIPAA #DataGovernance

---

## 08: Concurrency Is a Workflow Question

**Publish:** Wednesday, August 19
**Source idea:** 18
**Icon:** `icons/masters/linkedin-08-concurrency-workflow-icon.png`
**Form:** F6 spec with commentary
**First comment:** Turn your own workload numbers into a defensible size on our worksheet: https://islandmountain.io/sovereign-cost-worksheet.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p08

### Long-form article

There’s a one-page artifact we ask for before any sizing conversation, and I’d rather show it than describe it. A load profile, filled in for an imaginary but typical institution:

- Peak concurrent tasks: 6, observed between 9:10 and 10:30 on filing days.
- Representative input: 40 to 300 pages; output: 2-page cited draft.
- Response obligation, interactive class: under 30 seconds to first useful text.
- Response obligation, batch class: complete by 6:00 a.m. review.
- Batch window: 11:00 p.m. to 5:00 a.m., roughly 400 documents.
- Degraded mode: interactive work continues at reduced speed; batch pauses.
- Expansion trigger: interactive queue exceeds 90 seconds for five consecutive business days.

Every line of that profile is doing work that “we have fifty users” can’t do.

The first line kills the headcount myth. Fifty people with occasional short requests can generate less simultaneous demand than four people processing long records at the same moment, so we count overlapping tasks, never accounts.

The input and output lines change the arithmetic more than most buyers expect. A benchmark built on short prompts can’t speak for a workflow that ships three hundred pages in and wants citations back. Context length, output length, retrieval, and tool calls all move the requirement.

The two response-obligation lines exist because “fast” isn’t testable. A lookup while someone waits on the phone needs seconds. An overnight comparison needs to beat the morning meeting. Both can share one system if the queue’s designed on purpose, priorities included.

Degraded mode gets a line because reserve capacity with a stated job is resilience, while spare capacity without one is a question mark wearing a price tag. And the expansion trigger turns future growth from a sales argument into a measurement, which is where it’s always belonged.

The facility signs off last; power and cooling can cap sustained load before the compute budget does, which is why this profile travels with the survey.

After launch, the profile’s the scorecard. Queue’s growing? Find out whether that’s adoption, changed workload, or bad scheduling before it becomes a purchase order. Hardware’s occasionally the answer. I’ve rarely seen it be the first one.

#CapacityPlanning #AIInfrastructure #OnPremAI #PerformanceEngineering

### LinkedIn summary post

“How many users?” is the least useful number in AI sizing, and it’s the one everybody leads with.

What we ask for instead fits on one page, and it’s dull on purpose: peak overlapping tasks, representative document sizes, response targets split by task class, batch windows, behavior during component failure, and a measured trigger for expansion.

Four analysts pushing long records can out-demand fifty occasional users. The queue knows things the org chart doesn’t.

Write those seven lines down before procurement and acceptance testing’s suddenly possible: run representative inputs, hold the targets, done. Skip them and the machine gets sized by whoever tells the best story in the meeting.

That page also settles the after-launch argument. When the queue grows, you’ll know whether you bought a scheduling problem or earned a real expansion.

#CapacityPlanning #AIInfrastructure #PerformanceEngineering

---

## 09: A Deployment Should Have an Ending

**Publish:** Thursday, August 20
**Source idea:** 22
**Icon:** `icons/masters/linkedin-09-deployment-departure-icon.png`
**Form:** F1 field checklist
**First comment:** Departure by design is doctrine for us; here’s the whole thing: https://islandmountain.io/the-island-mountain-doctrine.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p09

### Long-form article

Before the arrival date gets scheduled, I want the departure test written.

That ordering sounds ceremonial. It’s structural: a deployment that needs its vendor forever hasn’t transferred capability, it’s created a dependency with an installation date, and the only way I know to prevent it is to define the exit while it can still shape the architecture.

Here’s the departure checklist we put in the statement of work. The institution’s own staff, observed but unassisted, must:

- Restore the system from backup and prove the restored data serves.
- Rotate a privileged credential without breaking a dependent service.
- Retrieve a specific audit record from a specific week and explain it.
- Apply an approved update, then roll it back.
- Disable a user in anger, with the access change verified end to end.
- Move an approved model into the isolated environment through the documented custody path.
- Exercise the stop condition and bring the system back afterward.
- Onboard a brand-new administrator using nothing but the deployed documentation.

Each item fails loudly on its own, and that’s the design. Documentation describing a generic reference build instead of this environment fails the new-administrator item. Credentials that quietly stayed in vendor custody fail the rotation item. Judgment that lives in one engineer’s head fails everything, which is the point of testing with the people who’ll own the work.

The checklist also reshapes the middle of the engagement, not just the end. Knowledge transfer can’t wait for a closing meeting, so institutional staff sit inside configuration, acceptance testing, failure drills, and updates while decisions are being made, because a runbook without the reasons won’t survive the first changed condition.

Two clarifications I always add. Choosing to keep outside help afterward is fine; needing it for ordinary work isn’t, and the difference is the whole test. And clear boundaries protect the vendor too: scoped support beats the endless informal rescue nobody’s budgeted.

My mission language stays blunt here. The engagement ends by design, the institution runs the system without us, and a deployment that requires us forever is a product I refuse to sell.

#InstitutionalCapacity #TechnologyOwnership #OnPremAI #KnowledgeTransfer

### LinkedIn summary post

Eight tasks tell me whether an institution owns its AI deployment or rents it.

Restore from backup. Rotate a privileged credential. Pull a specific audit record. Apply and roll back an update. Disable access for real. Move a model through the custody path. Stop the system and recover it. Train a new administrator from the documentation alone.

Staff perform all eight unassisted, or the handoff isn’t finished.

We put that list in the statement of work before anything ships, because it’s what quietly redesigns the engagement. Documentation has to describe the actual environment. Credentials land in institutional custody. Reasons have to transfer along with the settings.

Keeping support afterward’s a healthy choice. Needing it for a Tuesday’s a failed test.

Equipment ships on a pallet; capability transfers on evidence.

#TechnologyOwnership #InstitutionalCapacity #KnowledgeTransfer

---

## 10: Shadow AI Usually Arrives Before Policy

**Publish:** Friday, August 21
**Source idea:** 27
**Icon:** `icons/masters/linkedin-10-shadow-ai-icon.png`
**Form:** F2 letter to a role
**First comment:** The governed alternative that makes the approved path the easy path: https://islandmountain.io/lamprey-woven-security-governance.html?utm_source=linkedin&utm_medium=organic&utm_campaign=authority-2026&utm_content=p10

### Long-form article

To the CIO who just discovered forty browser tabs of unapproved AI:

I know the first instinct, because I’ve watched it play out: prohibit, warn, monitor. Before you send that email, let me offer a different read of what you found.

Shadow AI is a backlog wearing a trench coat, not a loyalty problem. Your people pasted text into public tools because the work’s real, the approved route’s slow or absent, and the unapproved one removes friction the same afternoon. A prohibition’s sometimes genuinely necessary for sensitive data. What it won’t do is shrink the workload that produced the behavior; unanswered pressure just moves somewhere you can’t see it.

So we start with an amnesty inventory instead of a hunt. Ask which tools, for which tasks, with what kinds of information, and why the sanctioned options lost. Lead with discipline and you’ll get a polite fiction; the map you build from fiction produces confident policy about imaginary behavior. And cast the net wider than the obvious chat window, because that window’s rarely the whole exposure: meeting assistants, browser extensions, features embedded in software you already license, uploaded files, automated connectors.

Classify what comes back before responding to any of it. Some tasks carry no sensitive material and can live in an approved external tool with clear terms. Some touch internal but low-impact records and need a managed account, retention settings, and a little training. Some involve privileged, regulated, sovereign, or export-controlled data, and those don’t leave institutional custody, which means local inference or no AI at all.

Then build the thing that beats the shadow: a sanctioned path that’s easier than the workaround. Plain examples of allowed and forbidden use, written in the language of the actual jobs. A request route for new use cases with a response time that respects a weekly backlog. Logging that watches data movement rather than scoring curiosity, and staff who know exactly what’s observed and why, because surveillance would burn the trust your next inventory depends on.

The forty tabs are a map of unmet demand. Institutions that read the map end up with governed capability. The ones that only shred it? They’re running the inventory again next year, minus the honesty.

#ShadowAI #DataGovernance #AIPolicy #InformationSecurity

### LinkedIn summary post

Found unapproved AI in your institution this week? Good news you didn’t ask for: that’s your demand signal, pre-sorted by urgency.

People adopted tools because the backlog was real and the approved path wasn’t. A ban may protect sensitive data; it won’t un-invent the pressure.

What we run instead, in order:

An amnesty inventory. Which tools, which tasks, what data, why the sanctioned option lost. No discipline attached, or the answers turn fictional.

Honest classification. Public-safe work, managed-account work, and custody-bound work that stays local or doesn’t happen.

A faster yes. Clear examples per job, a request route with a real response time, and an approved tool that beats the workaround on friction.

Prohibition alone converts visible risk into invisible risk. That trade never favors the institution.

#ShadowAI #AIPolicy #InformationSecurity
