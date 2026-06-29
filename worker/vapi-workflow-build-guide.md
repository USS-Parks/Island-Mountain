# Building a cogent, operational Vapi **Workflow** via API — field guide

> Hard-won reference distilled from building the Island Mountain "IM Inbound ·
> Qualify & Book" workflow (id `c5ed6871-31ed-4581-b6a9-eac67fa165bf`) on
> 2026-06-28. Vapi's published workflow docs are **stale** and several examples
> they show are **rejected by the live API**. This guide reflects what the live
> API (`https://api.vapi.ai`) actually accepts, verified against its OpenAPI
> spec (`GET https://api.vapi.ai/api-json`) and real test calls.

---

## 0. Workflow vs. Assistant — pick the right primitive

- **Assistant** = one system prompt drives the whole call. Has first-class
  `firstMessage` + `firstMessageMode` (greets first trivially). Best for open,
  free-form conversation.
- **Workflow** = an explicit **node graph** (states + edges). Better for
  structured flows (qualify → route → book → capture → end) and deterministic
  branching. **This guide is for Workflows.**
- A **phone number routes to exactly ONE** of: `assistantId`, `workflowId`, or
  `squadId` (mutually exclusive). Switching is a one-field PATCH and is instant +
  reversible — the other entity is untouched, just off that line. See §8.

---

## 1. The single most important gotcha: the **First Message**

A workflow **conversation node does NOT have a top-level `firstMessage`**.
Sending `node.firstMessage` returns:

```
400  "each value in nodes.property firstMessage should not exist"
```

The greeting that makes the agent **speak first** lives at:

```json
"messagePlan": { "firstMessage": "Hi, you've reached …  How can I help?" }
```

- **Path is `node.messagePlan.firstMessage`** — nested, not top-level. This is
  NOT in Vapi's docs; the dashboard's "First Message" field maps to it.
- Put it on the **start node**. Without it, an Anthropic-modeled start node will
  **wait for the caller to speak first** (symptom: dead air until the caller says
  "Hello?", then it responds). The node `prompt` alone does not reliably trigger
  an unprompted opening turn.
- **Store the bare text** — do NOT wrap it in literal quotation marks. If you
  build the greeting inside a prompt string wrapped in `"…"`, the dashboard's
  auto-split will capture the quote marks too (`"\"Hi …\""`). Strip them.

**Rule:** every workflow that should greet first sets
`startNode.messagePlan.firstMessage` to the plain greeting text.

---

## 2. Voice — the second thing that silently breaks calls

The Vapi (`provider: "vapi"`) voices require **`version: 2`** or they fall back to
a legacy V1 mapping that routes through ElevenLabs; with no ElevenLabs key the
call **hangs up instantly**:

```
endedReason: call.in-progress.error-vapifault-eleven-labs-voice-failed
```

Known-good voice block (matches the Island Mountain assistant), pin it at the
**workflow level AND on every conversation node** (nodes otherwise fall back to
the org default voice):

```json
"voice": { "provider": "vapi", "voiceId": "Nico", "language": "en", "version": 2 }
```

- Use **`language: "en"`** with `version: 2`. `"en-US"` is accepted but renders a
  noticeably worse "fishbowl" voice. (`"en"` is only rejected when `version` is
  omitted, because that triggers the V1 language enum.)
- Mirror the assistant's transcriber too, including the fallback:
  ```json
  "transcriber": { "provider": "deepgram", "model": "flux-general-en",
                   "language": "en", "fallbackPlan": { "autoFallback": { "enabled": true } } }
  ```
- Optional ambiance to match the assistant: `"backgroundSound": "office"`.

---

## 3. Stale-docs landmines (fields the live API REJECTS)

Vapi's quickstart/examples show these on nodes — **all rejected** by the create API:

| Docs show | Reality |
|---|---|
| `node.id` | ❌ rejected — nodes are keyed by **`name`** |
| `node.firstMessage` | ❌ rejected — use `node.messagePlan.firstMessage` |
| `node.systemPrompt` | ❌ — the field is **`node.prompt`** |
| start via `"id": "start"` | ❌ — mark start with **`isStart: true`** |
| edge `condition: { type: "logic", expression }` | ⚠️ only **`type: "ai"`** is in the current schema (`AIEdgeCondition`) |

Always validate against `GET https://api.vapi.ai/api-json` (the OpenAPI spec),
not the rendered docs.

---

## 4. Canonical schema (verified against the live OpenAPI)

`POST https://api.vapi.ai/workflow` — top-level body:

```jsonc
{
  "name": "My Workflow",
  "model":       { "provider": "anthropic", "model": "claude-sonnet-4-5-20250929" },
  "voice":       { "provider": "vapi", "voiceId": "Nico", "language": "en", "version": 2 },
  "transcriber": { "provider": "deepgram", "model": "flux-general-en", "language": "en",
                   "fallbackPlan": { "autoFallback": { "enabled": true } } },
  "backgroundSound": "office",
  "globalPrompt": "Shared persona / facts / guardrails applied to EVERY node.",
  "server": { "url": "https://<worker>/api/voice-webhook",
              "headers": { "x-vapi-secret": "<shared-secret>" } },
  "nodes": [ /* see §5 */ ],
  "edges": [ /* see §6 */ ]
}
```

Required top-level: `name`, `nodes`, `edges`. `globalPrompt` carries the shared
brain so each node `prompt` stays short. `server` is the webhook + secret (§7).

### Node types — only TWO exist

**`ConversationNode`** (required: `type`, `name`):
```jsonc
{
  "type": "conversation",
  "name": "greet",                 // nodes are referenced by name in edges
  "isStart": true,                 // exactly one start node
  "prompt": "Node-specific instructions. The globalPrompt is also in scope.",
  "messagePlan": { "firstMessage": "…" },   // ONLY meaningful on the start node (speak-first)
  "voice": { "provider": "vapi", "voiceId": "Nico", "language": "en", "version": 2 },
  "model": null,                   // optional per-node override of workflow.model
  "tools":   [ /* inline CreateFunctionToolDTO / transferCall / endCall … */ ],
  "toolIds": [ "<library-tool-id>" ],       // reference existing dashboard tools
  "variableExtractionPlan": {                // pulls structured vars from the turn
    "schema": { "type": "object", "properties": { "intent": { "type": "string",
                "enum": ["schedule","questions","human","other"] } } }
  },
  "globalNodePlan": { "enabled": true, "enterCondition": "…" },  // see §6 (global nodes)
  "metadata": { "position": { "x": -190, "y": -600 } }          // canvas layout — see §6
}
```

**`ToolNode`** (required: `type`, `name`) — fires a tool as a step:
```jsonc
{ "type": "tool", "name": "end_call", "tool": { "type": "endCall" } }
// or reference a library tool by id:  { "type": "tool", "name": "x", "toolId": "…" }
```

### Tools: inline vs. library

- **Inline** on a conversation node via `tools: [ … ]` (a `CreateFunctionToolDTO`,
  `CreateTransferCallToolDTO`, `CreateEndCallToolDTO`, etc.).
- **Library** (created in the dashboard / `POST /tool`) via `toolIds: [ "id" ]`.
- A **function tool** with no `server` of its own **inherits `workflow.server`**
  — that's how all three IM tools authenticate to the Worker with one secret.

Function tool shape (inline):
```jsonc
{ "type": "function",
  "function": { "name": "book_appointment", "description": "…",
                "parameters": { "type": "object", "required": ["startISO","name","email"],
                                "properties": { "startISO": {"type":"string"}, … } } } }
```

---

## 5. Edges & routing

`Edge` (required: `from`, `to`):
```jsonc
{ "from": "offer_route", "to": "booking",
  "condition": { "type": "ai", "prompt": "The caller wants to book a call now." } }
```

- `from`/`to` are node **names**.
- **Single outgoing edge** → omit `condition` (default/unconditional flow).
- **Multiple outgoing edges from one node** → **every** branch needs a
  `condition`. The API rejects "more than one default edge" from a node.
- Only **`AIEdgeCondition`** (`{ "type": "ai", "prompt": "<eval-to-true test>" }`)
  is in the current schema. Write the prompt as a yes/no routing test.

---

## 6. Global nodes, transfers, and canvas layout

### Global node (escalate-from-anywhere, e.g. human handoff)
```jsonc
{ "type": "conversation", "name": "human_handoff",
  "globalNodePlan": { "enabled": true,
    "enterCondition": "The caller explicitly asks for a human / real person / salesperson. Do NOT trigger on the caller stating their name or mentioning the founder." },
  "tools": [ { "type": "transferCall",
               "destinations": [ { "type": "number", "number": "+1XXXXXXXXXX",
                                   "message": "Connecting you now. One moment." } ] } ],
  "prompt": "Briefly say you'll connect them, then transfer." }
```
- A global node is entered by its **`enterCondition`**, NOT by an edge — it
  correctly has **no incoming edge**. Adding one would be wrong.
- It needs **no outgoing edge** *if* its action ends the leg (a `transferCall`
  hands the call off). **Caveat:** if the transfer fails (no answer/busy/declined)
  there's no fallback and the caller is dropped — add a fallback edge/path if that
  matters.
- **Transfer OUT, not back into the loop.** Route to the real human's external
  number (e.g. a Google Voice line), NOT the Vapi number the workflow itself
  answers on — transferring to your own Vapi DID loops the caller back to the AI.
- Keep `enterCondition` tight. "…or to Basho directly" once mis-fired when a
  caller merely said "I'm the founder." Exclude name/identity mentions explicitly.

### Canvas layout — set positions or it piles up
Creating nodes via API **without positions** stacks every node at the same
coordinate in the visual editor (looks chaotic; logic is fine). Set:
```json
"metadata": { "position": { "x": -190, "y": -600 } }
```
Lay the happy path as a vertical spine (step y down ~400/node), offset branch
nodes to the side, park global nodes to the left. **Read-modify-write preserves
positions** — always GET the live workflow, mutate, and PATCH the whole node
array back so you never wipe a hand-arranged layout.

---

## 7. Server / webhook compatibility (don't break your backend)

If your tools hit your own server (as IM's do → a Cloudflare Worker):

- Set `workflow.server = { url, headers: { "x-vapi-secret": "<secret>" } }`. The
  server verifies this header; mismatch → 401.
- Tools must fire as **Vapi function tools** so Vapi posts the **standard
  tool-call envelope** your server already parses:
  `body.message.toolCalls[].function.{name,arguments}` + `message.call.id`,
  expecting `{ results: [ { toolCallId, result } ] }` back. **Raw `apiRequest`
  nodes send a different body shape and will NOT match a handler written for the
  function-tool envelope.**
- Reliable lead/data capture should also use the **`end-of-call-report`** server
  message (transcript extraction), since in-call tool args are best-effort.

---

## 8. Wiring to a phone number (+ instant rollback)

```bash
# Route the number to the workflow (clears the assistant from the line):
curl -X PATCH "https://api.vapi.ai/phone-number/<NUMBER_ID>" \
  -H "Authorization: Bearer $VAPI_KEY" -H "Content-Type: application/json" \
  -d '{ "assistantId": null, "workflowId": "<WORKFLOW_ID>" }'

# Rollback in one field (assistant resumes instantly; nothing rebuilt):
curl -X PATCH "https://api.vapi.ai/phone-number/<NUMBER_ID>" \
  -H "Authorization: Bearer $VAPI_KEY" -H "Content-Type: application/json" \
  -d '{ "assistantId": "<ASSISTANT_ID>", "workflowId": null }'
```
Snapshot the number's `assistantId`/`workflowId` **before** switching so rollback
is unambiguous.

---

## 9. Build procedure (start to finish)

1. **Snapshot first.** `GET /assistant/<id>` (or current workflow) → save to a
   gitignored file. Capture model, voice (note `version`), transcriber,
   `server.url`, the `x-vapi-secret`, and tool schemas/ids. Reversibility.
2. **Verify the schema**, don't trust docs: `GET /api-json`, extract
   `CreateWorkflowDTO`, `ConversationNode`, `ToolNode`, `Edge`, tool DTOs.
3. **Author the JSON**: globalPrompt (persona/facts/guardrails) + per-node
   prompts + `messagePlan.firstMessage` on start + voice on workflow & every node
   + `metadata.position` on every node + edges (conditions on every multi-out
   branch).
4. **Create**: `POST /workflow`. Fix validation errors (voice language/version,
   stray node fields) and re-POST until `201`.
5. **Verify**: `GET /workflow/<id>` and assert nodes, tools, server+secret,
   `messagePlan.firstMessage`, voice `version:2`, global node present.
6. **Test call** against the workflow (web "Talk to Workflow" or a spare number)
   BEFORE touching the live number.
7. **Go live**: PATCH the number's `workflowId` (§8). Keep the rollback handy.
8. **Validate from logs** (§10) — never assume; read the call's `endedReason` +
   transcript timing.

---

## 10. Troubleshooting from call logs

`GET https://api.vapi.ai/call?limit=5` → inspect `endedReason`, and
`artifact.messages[]` with `secondsFromStart` for turn order/latency.

| Symptom / `endedReason` | Cause | Fix |
|---|---|---|
| `error-vapifault-eleven-labs-voice-failed`, instant hangup | vapi voice missing `version: 2` → V1 → ElevenLabs (no key) | set `version: 2` on voice, workflow + every node (§2) |
| Long silence at start; bot only speaks after caller says "Hello?" (first user msg at t≈14s) | start node has no `messagePlan.firstMessage`; Anthropic node waits | set `startNode.messagePlan.firstMessage` (§1) |
| Bot greeting reads quote marks / looks like `"\"Hi…\""` | greeting wrapped in literal quotes during dashboard auto-split | store bare text, strip wrapping `"` |
| "Fishbowl"/poor audio | voice `language: "en-US"` with V2 | use `language: "en"` + `version: 2` (§2) |
| `assistant-forwarded-call` fired unexpectedly | global handoff `enterCondition` too loose (e.g. caller named themselves) | tighten condition; exclude name/identity mentions (§6) |
| Caller dropped after asking for a human | transfer failed, no fallback edge on global node | add fallback path (§6) |
| Tool calls 401 / do nothing | wrong/absent `x-vapi-secret`, or apiRequest node vs function-tool envelope | match secret; use function tools (§7) |
| Visual editor shows all nodes stacked | created without `metadata.position` | set positions; read-modify-write to preserve (§6) |

---

## 11. Worked reference — the Island Mountain workflow

- **Graph:** `greet (START, speaks first) → qualify → offer_route →
  {booking | capture} → close → end_call`, plus a GLOBAL `human_handoff`
  (transferCall out to the human's Google Voice).
- **Reuses** the assistant's model, `server.url` + `x-vapi-secret`, and three
  function tools (`get_available_slots`, `book_appointment` inline;
  `submit_lead` by `toolId`). Persona/facts in `globalPrompt`.
- **Capture** is belt-and-suspenders: in-call `submit_lead` + the
  `end-of-call-report` transcript extraction on the Worker.

Build artifacts (all gitignored): `worker/.vapi-workflow-build.json` (body, secret
placeholder), `worker/.vapi-openapi.json` (schema), `worker/.vapi-assistant-snapshot-full.json`.
