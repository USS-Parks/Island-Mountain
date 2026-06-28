# Vapi voice agent setup (PROMPT 07)

The voice agent shares the **same brain and lead pipeline** as the chat bot. Vapi
runs the call; when it has enough signal it calls the `submit_lead` tool, which
hits `POST /api/voice-webhook` and runs the identical `scoreLead` + `processLead`
path (D1 mirror, Google Sheet, hot-lead email, GA4 `generate_lead`). The
end-of-call report attaches the transcript + recording to the lead.

## 1. Assistant (dashboard.vapi.ai/agent-builder)
- **Model:** Anthropic → `claude-sonnet-4-6` (or `claude-opus-4-8`). Paste the
  **system prompt** from `worker/src/persona.ts` (`PERSONA`) verbatim.
- **First message / disclosure (required):** "Hi, you've reached Island Mountain.
  Quick heads-up — I'm an AI assistant. How can I help with your on-premises AI setup?"
- **Voice:** any natural English voice. **End-call phrases** + silence timeout as desired.

## 2. Tool: `submit_lead`
Add a **Function/Tool** named `submit_lead` with the same JSON schema as
`SUBMIT_LEAD_TOOL` in `worker/src/qualifier.ts` (name, email, phone, job_title,
organization, industry, use_case, concurrent_users, system_interest, compliance[],
timeline, budget, decision_maker, infrastructure, current_setup, docs_requested[],
notes; required: name, email). Description: "Register the caller as a qualified lead
once you have at least their name and email plus what they've shared."

## 2b. Scheduling tools (live in-call Cal.com booking)
Two extra **Function/Tools** let the agent book a scoping call during the call:
- `get_available_slots` → returns up to 3 nearest open times (event-type **6140261**,
  `cal.com/basho-parks-3yuylm/30min`).
- `book_appointment` → reserves the chosen slot (args: `startISO`, `name`, `email`,
  `timeZone?`).

Both hit the same `/api/voice-webhook`; the Worker calls Cal.com via
`integrations/calcom.ts`. Worker env: `CALCOM_API_KEY` (secret, `wrangler secret put`),
`CALCOM_EVENT_TYPE_ID=6140261`, `CALCOM_TIMEZONE=America/Denver`. The booking is
correlated to the lead (marked `booked` at end-of-call); Cal.com emails the invite.
Schemas + the step_11 booking flow live in `vapi-island-mountain-prompt.md`.

## 3. Server URL (webhook)
- **Server URL:** `https://<your-worker-subdomain>.workers.dev/api/voice-webhook`
- **Server URL Secret:** generate a long random string, set it in the dashboard,
  and `wrangler secret put WEBHOOK_SECRET` to the **same** value. The Worker checks
  the `x-vapi-secret` header.
- Enable server messages: **tool-calls** (or function-call) and **end-of-call-report**.

## 4. Phone number + after-hours
- Provision/import a number in Vapi and attach this assistant. It answers **24/7**,
  so "after hours" is simply the AI taking the call; hot leads still email Basho
  instantly and persist to the store. Optionally set a transfer/voicemail fallback
  to 1-341-441-8740 for callers who ask for a human.

## 5. Website affordance (optional web call)
The chat widget shows a "🎙️ Talk to an AI specialist" button when configured. On a
page (or the global include), set before `chat-widget.js` loads:

```html
<script>
  window.IM_CHAT_CONFIG = {
    apiBase: "https://<your-worker>.workers.dev",
    voice: {
      phone: "+13414418740",                 // click-to-call fallback
      vapiPublicKey: "<vapi-public-key>",     // enables in-browser web call
      vapiAssistantId: "<assistant-id>"
    }
  };
</script>
```

With only `phone`, the button is a click-to-call. With `vapiPublicKey` +
`vapiAssistantId`, it starts an in-browser voice call (loads the Vapi web SDK lazily)
after showing the AI disclosure. With neither, the button is hidden.
