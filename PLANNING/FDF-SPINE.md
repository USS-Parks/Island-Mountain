# FDF · F2 Messaging Spine

Canonical language for the forward-deployed repositioning. Every page in F3–F10 draws from here; nothing invents new positioning language on its own.

Voice: Basho's. Contraction-heavy, opinionated, sardonic where it earns it. Banned throughout: em-dashes, "actually," "heavy lifting," "load bearing," and neutral house-explainer cadence.

---

## 1. Positioning one-liner

> Island Mountain is a forward-deployed AI consultancy. We sit with the people who do the work, learn the workflow the way they run it, then build and deploy an independent on-site AI system around it.

Short form (nav, meta, agent): **forward-deployed AI engineering and on-site deployment for regulated organizations.**

## 2. The thesis (headline argument)

**Technology that ignores expertise gets ignored by the experts. When we build around them, the on-premise deployment defends itself.**

Supporting argument, in order:

1. The knowledge that makes a deployment work has been in someone's hands for fifteen or twenty years. It barely lives in the documentation. It doesn't live in any language model.
2. So you go get it: show up, shut up, and learn the workflow the way they run it, not the way the SOP describes it. Then fill in the gaps in conversation.
3. Forward deployed engineering is mostly translation and synthesis. You won't know where the work hurts until you've shadowed someone whose whole job is sitting between that hurt and the infrastructure that could take it off their plate.
4. A system built around the expert gets adopted by the expert. That's what makes it stick after we leave.

## 3. The people (SME vignettes, use verbatim or close)

- the senior paralegal who knows which intake questions matter
- the records clerk in fiscal who can tell you which form gets filled out wrong every time
- the compliance officer who knows where the real organizational risk lives

Rule: always concrete, always a person with a job. Never "stakeholders," never "domain experts" as a generic plural.

## 4. The deployment arc (four steps, everywhere)

Four steps exactly. The homepage `au-hm-steps` grid takes four `--i:0..3` slots, so four reuses the existing CSS with no changes.

| # | Name | Line |
|---|---|---|
| 01 | **Shadow** | We sit with the people who do the job. No slideware, no discovery deck. We watch the work run. |
| 02 | **Translate** | The real workflow becomes a system design. This is the part that's mostly translation and synthesis. |
| 03 | **Build** | Now the stack gets sized: hardware and models chosen to fit the work, never the other way around. |
| 04 | **Hand Off** | Your people run it. A deployment that leaves behind a team that thinks differently is the one that lasts. |

Replaces the old Order → Hand-built → Shipped → Serving arc, which modeled the whole engagement as a purchase and a delivery.

## 5. Swappability doctrine (both layers)

> Swappable stack, swappable open-weight models.

- **Hardware:** a stack of DGX Sparks, RTX 5090s, RTX PRO 6000 Blackwells, up to H100 and H200 capacity. We install what the workflow study says the org needs. We also make other vendors' boxes work, including gear we didn't sell.
- **Models:** open-source, open-weight, swapped as the frontier moves. No lab lock-in, no meter, no model you can't keep.
- **The rule:** neither layer is the pitch. Both get sized and selected *after* the workflow study, never before.
- **Market proof, not product copy:** a $7,000 laptop now runs open-weight models in the frontier weight class. That's why independent on-site AI is practical this year and wasn't three years ago. Cite it as the state of the world; never as a spec sheet.

Phrase to retire: "pre-built," "ships ready to run," "ready to rack," "out of the box," "which tier fits."

## 6. Homepage hero

- **Eyebrow:** Forward Deployed · On-Premise AI
- **H1:** We Build the System Around Your Experts.
- **Rotator (3):**
  1. Fifteen years of hard-won expertise doesn't live in your documentation. It lives in your people.
  2. We sit with them first. The system comes after.
  3. Swappable hardware, swappable open-weight models, all of it on your floor.

## 7. Naming and nav decisions (settled)

| Decision | Call |
|---|---|
| Methodology page | **"Forward Deployed"** at `forward-deployed-ai-engineering.html` (keyword-carrying, one new URL) |
| `products.html` nav label | "AI Servers" → **"The Stack"** (matches existing "sovereign stack" language; avoids colliding with "Forward Deployed") |
| CTA label | "Contact Sales" → **"Start a Scoping Call"** |
| "Summit" | **Survives** as the name of the build we deploy. It stays the system's name, not the pitch. Preserves SEO, imagery, and the private quote language. |
| Hardware/model naming | Named gear and named models appear only as the swappable spectrum, never as the offer. |

Resulting nav (8 items): Home · Forward Deployed · The Stack · Security Fabric · FAQ · Resources · Careers · Start a Scoping Call

## 8. CTA language

| Old | New |
|---|---|
| Talk to the Builder | Start a Scoping Call |
| Contact Sales | Start a Scoping Call |
| Which Tier Fits Your Workload? | What Does the Work Actually Look Like? |
| Claim a Build Slot | *(unchanged; the `#claim-slot` anchor and the deposit-free promise still hold)* |
| Tell us your workload and headcount | Tell us whose desk the work runs through |

## 9. What does not change

The Woven Security & Governance Fabric keeps its own identity: every action your AI takes, identified, approved, and logged. WSF/AOG is the trust and control plane, and none of the swappability doctrine, hardware spectrum, or second-revolution framing belongs on that page. F8 adds one narrative thread only: the fabric and console are what the deployment leaves behind.

Pricing posture is unchanged and absolute: no Island Mountain dollar figure anywhere public. Cloud, regulatory, competitor, and market figures stay.
