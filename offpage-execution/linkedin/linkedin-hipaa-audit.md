# LinkedIn Article: "Can Your AI Pass a HIPAA Audit?"

**Date:** 2026-06-10 (suggested publication date)  
**Word count:** 1,078 words  
**Voice:** John Dougherty, Founder/CEO  
**Link back:** https://islandmountain.io/blog/hipaa-technical-checklist.html

---

## Full Article Text (for LinkedIn)

---

The question your compliance officer asks that cloud AI vendors can't answer.

"Can our AI infrastructure pass a HIPAA audit?"

That's the question that stops most healthcare organizations mid-conversation with cloud AI vendors. Because the honest answer—for most cloud AI services—is: "Maybe. But we can't guarantee it. You'll find out during the audit."

I spent last month talking to compliance officers at three different healthcare systems. They'd all done the same thing: signed up for a cloud AI service, started processing PHI (Protected Health Information), and then asked their compliance team: "Is this okay?"

The response was always some version of: "Not sure. It's complicated."

**Why HIPAA Makes Cloud AI Difficult**

The HIPAA Security Rule (45 CFR 164.312) requires specific technical safeguards. These aren't vague guidelines. They're detailed requirements.

**164.312(a)(2)(i): Access Controls**
"Implement technical policies and procedures for electronic information systems that maintain PHI to allow access only to those persons or software programs that have been granted access rights."

What does this mean for cloud AI?
- The AI vendor must implement access controls.
- You must be able to prove those controls exist.
- You must understand exactly who (which vendors, which employees, which systems) can access your PHI.

With cloud AI, your visibility is limited. You trust the vendor's documentation. You might have a Data Processing Agreement (DPA). But you don't have direct control. If the audit asks, "Walk us through your access logs," you're asking the vendor for those logs, and the vendor is deciding what to show you.

**164.312(b): Audit Controls**
"Implement hardware, software, and procedural mechanisms that record and examine activity in information systems that contain or use electronic protected health information."

For cloud AI:
- The vendor must maintain audit logs.
- You must be able to access those logs.
- The logs must show who accessed what, when, and how.

Most cloud AI vendors provide *some* audit logs. But are they sufficient for a HIPAA audit? That's a gray area. Your compliance officer will ask, "Are these logs complete? Can you prove no unauthorized access occurred?" And the vendor will say, "We follow HIPAA requirements," which doesn't answer the question.

**164.312(a)(2)(ii): Encryption and Decryption**
"Implement mechanisms to encrypt and decrypt electronic protected health information."

For cloud AI:
- Data must be encrypted in transit (to the AI vendor).
- Data must be encrypted at rest (on the vendor's servers).

Most cloud vendors do this. But there's a problem: the vendor controls the encryption keys. If the government subpoenas the cloud vendor and demands the decrypted data, the vendor must comply. (This connects to my earlier point about the CLOUD Act, but the HIPAA concern is slightly different.)

**164.312(a)(2)(iii): Transmission Security**
"Implement technical security measures that guard against unauthorized access to electronic protected health information that is being transmitted over an electronic open network."

For cloud AI:
- All data sent to the AI vendor must be encrypted.
- The connection must be secure (HTTPS/TLS).
- You must be able to prove this.

Cloud AI vendors do this, too. But again, you're dependent on the vendor's representations.

**The Audit Problem**

Here's where it gets real: during a HIPAA audit, the auditors will ask to see:
1. Documentation of your data processing agreements
2. Proof that the AI vendor is BAA-compliant
3. Your access controls and audit logs
4. Evidence that PHI is encrypted in transit and at rest
5. Your risk assessment for using cloud AI

If you can't produce these, or if the documentation is incomplete, the auditors will cite a violation. It might be low-risk (documented but incomplete controls), or it might be high-risk (undocumented access, no audit logs).

Most healthcare organizations aren't prepared for this. They start using cloud AI, and they haven't thought through the audit requirements. Then, 2-3 years later, during an audit, they realize they're exposed.

The cloud vendor's marketing materials say, "HIPAA-compliant." But "HIPAA-compliant" is vague. Does it mean the vendor follows HIPAA? Or does it mean the vendor is suitable for you to process PHI while maintaining your own HIPAA compliance?

Those are different things.

**The On-Premises Alternative**

When I talk to healthcare organizations about on-premises AI infrastructure, the compliance conversation is different.

You own the hardware. It's in your facility. It's subject to your security controls. Your IT team maintains it. Your access logs are yours. Your encryption keys are yours.

During a HIPAA audit, the conversation is straightforward:
- **Access controls:** "Here's our network architecture. PHI-processing systems are on a separate network segment. Access is controlled via our identity management system. Here are the logs showing who accessed what."
- **Audit controls:** "Here are all the audit logs for the last 12 months. Every access is logged. We have no evidence of unauthorized access."
- **Encryption:** "Data is encrypted at rest using AES-256. Data in transit is encrypted using TLS 1.3. Our IT team manages the encryption keys."
- **Transmission security:** "The AI server is isolated from the internet. It's only accessible via our internal network. All access is logged and monitored."

This is far more straightforward for auditors. They can verify your controls directly. They don't have to trust a vendor's representations.

**Real-World Example**

One hospital system I worked with had been processing pathology images using a cloud AI service for two years. When their auditors asked about the service, the hospital couldn't clearly document:
- Which employees at the cloud vendor could access their data
- What the vendor's security practices actually were
- Whether the vendor was truly BAA-compliant

The auditors flagged it as a high-risk gap. The hospital had to immediately stop using the cloud service and retroactively assess whether any PHI had been accessed inappropriately.

They've since purchased on-premises AI hardware. Their compliance officer is much happier.

**The Compliance Cost**

Here's what most healthcare organizations don't calculate: the cost of managing HIPAA compliance for cloud AI.

You need:
- A vendor risk assessment (8-16 hours of compliance work)
- A BAA (vendor negotiation, legal review)
- Ongoing monitoring and documentation
- Annual vendor risk re-assessments
- Internal audit trails and compliance reviews
- Insurance policies covering cloud AI risks

This can easily cost $10,000-$30,000 per year in compliance overhead.

With on-premises infrastructure, you have compliance overhead too (maintaining the server, security updates, audit logs). But you're not dependent on a vendor's willingness to comply. You control the security posture directly.

**The Bottom Line**

Can your AI pass a HIPAA audit? If it's cloud AI, the answer is: "Probably, but we're not sure until the audit happens."

If it's on-premises infrastructure under your control, the answer is: "Yes. Here's the documentation."

That confidence matters. During an audit, your compliance officer wants to be able to answer questions clearly. Not "the vendor told us they're compliant," but "here's our security architecture, and here are the controls we've implemented."

---

**[LINK BACK]**

For a detailed HIPAA technical checklist—45 CFR 164.312 requirements mapped to specific technical controls for on-premises AI infrastructure—read the full article: https://islandmountain.io/blog/hipaa-technical-checklist.html

---

## LinkedIn Post Metadata

**Title for LinkedIn:** Can Your AI Pass a HIPAA Audit?

**Subtitle:** The compliance question that separates theoretical compliance from audit-ready infrastructure

**Target audience:** Healthcare compliance officers, healthcare CIOs, hospital administrators, health IT leaders

**Hashtags to include:** #hipaa #compliance #healthcare #ai #cybersecurity #audit #healthcaretech #regulation

**Image suggestion:** Compliance checklist or audit document illustration (professional, healthcare-appropriate)

**CTA (call to action):** "If you're using cloud AI to process PHI, ask your compliance officer this question: Can we pass a HIPAA audit with this setup? See what they say."

