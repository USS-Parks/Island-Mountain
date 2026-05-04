# LinkedIn Article: "Your Law Firm's AI Provider Can Be Subpoenaed"

**Date:** 2026-05-13 (suggested publication date)  
**Word count:** 1,047 words  
**Voice:** John Dougherty, Founder/CEO  
**Link back:** https://islandmountain.io/blog/attorney-client-privilege-cloud-ai.html

---

## Full Article Text (for LinkedIn)

---

Your Law Firm's AI Provider Can Be Subpoenaed.

That's the structural problem with cloud AI in legal practice—and no confidentiality agreement fixes it.

Last month, I spoke with a litigation partner at a Am Law 100 firm. She asked me a straightforward question: "If we send a client's negotiation brief to ChatGPT to summarize it, and opposing counsel subpoenas OpenAI in discovery, what happens?"

The answer: OpenAI produces the document. It's a third-party record now. Your client never authorized that transfer of information, and the original attorney-client privilege is destroyed.

This isn't a hypothetical. It happens. And it's not a technology problem—it's an architectural problem.

**The Privilege Problem**

Attorney-client privilege protects communications between a lawyer and client made in confidence for the purpose of obtaining or providing legal advice. The privilege requires a bilateral relationship: attorney and client. If a third party hears the conversation, the privilege is waived. If you intentionally disclose the communication to a third party, it's gone.

When you send client information to ChatGPT, Claude, or any cloud AI service, you've created a trilateral relationship: attorney, client, and cloud provider. The cloud provider now holds a copy of the communication. It's stored on external servers. It's subject to the cloud provider's security practices, backup procedures, and legal obligations—including obligations to comply with subpoenas and government data requests.

No business associate agreement (BAA), no data processing agreement (DPA), no non-disclosure agreement (NDA) can restore privilege that was lost the moment you transmitted the data externally.

Some firms try to work around this by getting "privileged AI" from cloud providers. They say: "We'll keep your communications privileged." But privilege isn't a feature the vendor can build. Privilege is a legal status that depends on the *structure* of the communication. If a third party has a copy, it's not privileged. If a third party can access it, it's not privileged. If a third party might be compelled to produce it, courts will question whether it ever was privileged.

I've watched law firms spend months negotiating confidentiality clauses with cloud AI providers, only to realize those clauses don't actually restore privilege. They might protect trade secrets or limit liability, but they don't restore the fundamental legal privilege that was lost when the data left the building.

**Why Cloud Providers Can't Solve This**

Some will argue that cloud AI vendors can contractually agree not to share your data, or that encryption protects it. But here's the critical point: a contract doesn't prevent a subpoena. Encryption doesn't prevent a subpoena. The moment opposing counsel (or a government agency) subpoenas the cloud provider, the cloud provider has a legal obligation to comply. They must produce the data or go to court to challenge the subpoena.

What's the cloud provider going to argue? "This data is privileged"? No. It's *their* client's data that they hold. They don't have a privilege relationship with your client. You can't transfer privilege by contract.

The only structural way to preserve privilege is to keep the communication bilateral—attorney to client only—or to keep the information within the attorney-client relationship entirely. That means on-premises infrastructure you control. That means models you run locally. That means data that never leaves your facility.

**The Defense Bar Gets This**

I've shipped Island Mountain systems to defense litigators, and they understood this problem immediately. They don't need me to explain why subpoenas are bad. They've been through enough litigation to know that once something is discoverable, you can't un-discover it.

But I also talk to in-house counsel, transaction lawyers, and practice managers who tell me: "We're already using ChatGPT. Firms all over the country are. What's the risk, really?"

The risk is real, but it's not immediate. The risk crystallizes when a matter becomes litigious. Then, suddenly, opposing counsel has leverage to subpoena your AI vendor. If the vendor produced the files, your privilege claim collapses. Your negotiation strategy, your legal theories, your assessment of the other side's position—all of it is now in discovery.

And here's what makes this worse: you may not even remember *which* prompts you sent to ChatGPT. You might have sent 50 different client communications to the cloud, summarized them, analyzed them, and completely forgotten about it. Three years later, when the litigation heats up, opposing counsel subpoenas OpenAI and discovers all of it.

The damages aren't just evidentiary. They're reputational. A client learns that their firm lost privilege of their communications. That's a malpractice claim waiting to happen.

**What On-Premises AI Looks Like**

We built Island Mountain specifically to solve this. You buy the server, you install it in your office, you run inference models locally on client communications. The data never touches the internet. It never touches a third party. When opposing counsel subpoenas you, you produce what you're obligated to produce—but not because you have to get it from a vendor. Because it's yours.

The economics work, too. Cloud AI seems cheap until year two. Then the subscription costs accumulate. An on-premises server might cost $75,000 to $400,000 upfront, but after that, there are zero recurring costs. You own the hardware. You run the models. You control the access logs. You decide what gets deleted and when.

And the privilege protection is architectural, not contractual. You don't need a vendor to promise anything. The architecture of the system itself ensures that client data never leaves your facility.

Is this a hard sell? Sometimes. Partners are used to clicking a button and getting AI in seconds. Buying hardware feels old-school. But when I talk to litigation partners—especially those who've been through a big trial—the conversation changes fast. They understand that losing privilege of client communications is the kind of risk that keeps general counsel awake at night.

**The Industry Is Waking Up**

I've started seeing bar associations issue guidance on cloud AI. The Colorado Bar hasn't weighed in yet, but other state bars are raising questions about whether firms have thoroughly considered the privilege implications of sending client information to third-party AI services.

My prediction: within two years, the ABA and major state bars will issue formal guidance. They'll probably say something like: "Firms using cloud AI for privileged communications should ensure they understand the privilege implications and have obtained client consent."

But I think they'll go further. I think they'll say: "For sensitive matters, on-premises AI infrastructure that does not transmit client data externally is the safer alternative."

That's not me being self-interested. That's just the logical conclusion when you map the rules of privilege to the architecture of cloud AI.

Your client deserves privileged communications with their lawyer. If you're using cloud AI, are you still providing that?

---

**[LINK BACK]**

For a deeper dive into attorney-client privilege, AI governance, and how to assess your firm's AI practices, read the full article: https://islandmountain.io/blog/attorney-client-privilege-cloud-ai.html

---

## LinkedIn Post Metadata

**Title for LinkedIn:** Your Law Firm's AI Provider Can Be Subpoenaed

**Subtitle:** Why cloud AI and attorney-client privilege are structurally incompatible

**Target audience:** Partners and counsel at law firms, legal tech professionals, compliance leaders

**Hashtags to include:** #legaltech #ai #attorneyclientprivilege #lawfirms #compliance #dataprivacy #cloudcomputing

**Image suggestion:** Illustration of a subpoena or a lawyer's office (avoid technical imagery—keep it professional/legal)

**CTA (call to action):** "Share this with someone on your leadership team or in your tech/compliance group—this conversation is happening now, and your firm should be prepared."

