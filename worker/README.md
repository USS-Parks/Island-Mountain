# Island Mountain — Funnel Worker

Edge backend for the AI conversational + voice lead funnel. Holds every secret
key server-side so the static site (GitHub Pages) can offer an AI chat/voice
qualifier without ever exposing an API key to the browser.

| Route | Method | Purpose | Built in |
|---|---|---|---|
| `/api/health` | GET | Liveness probe | PROMPT 01 |
| `/api/chat` | POST | Claude proxy + KV session memory | PROMPT 02 |
| `/api/voice-webhook` | POST | Vapi voice → same pipeline | PROMPT 07 |
| `/api/worksheet` | POST | Cost-worksheet email gate: recomputes the 5-yr cloud burn, persists a cold lead, emails the private ownership comparison (1 send/address/hour) | 2026-07 |
| `/api/slot` | POST | Founder's Build Slot claim: forced-hot lead → alert to Basho + 90-day quote-lock confirmation to the claimant | 2026-07 |
| `/api/brief/preview` | GET | NOOA Sales Brief (Purser): render today's brief as HTML, no send (Bearer `BRIEF_SECRET`) | 2026-08 |
| `/api/brief/run` | POST | Purser: compose, send to `ALERT_EMAIL`, append a receipt (Bearer `BRIEF_SECRET`) | 2026-08 |

Lead scoring, persistence, alerts, and analytics run inside the chat and
authenticated voice pipelines plus the two origin-gated form routes above
(`/api/worksheet`, `/api/slot`) — all four feed the same `processLead` pipeline.
The private entry-build price range lives ONLY in `src/emails.ts` (worksheetEmail);
the public posture is quote-based with no price list, no named SKUs, and no
product lines — never move the range on-page or into the chat/voice prompts.

## Stack
Cloudflare Worker (TypeScript) · Workers KV (`SESSIONS`) · D1 (`leads` + atomic counters) ·
Anthropic API · Vapi (voice) · Cal.com (booking) · Resend (email) ·
GA4 Measurement Protocol · Google Sheet (lead destination).

## One-time setup

```bash
cd worker
npm install

# 1. Create the KV namespace and paste the printed id into wrangler.toml
npx wrangler kv namespace create SESSIONS

# 2. Create the D1 database and paste the printed database_id into wrangler.toml
npx wrangler d1 create island-mountain-leads
npx wrangler d1 execute island-mountain-leads --remote --file=./schema.sql

# 3. Set each secret (prompts for the value; nothing is written to the repo)
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put GA4_API_SECRET
npx wrangler secret put SHEETS_WEBHOOK_URL
npx wrangler secret put VAPI_API_KEY          # voice (PROMPT 07)
npx wrangler secret put WEBHOOK_SECRET        # validates Vapi/Cal.com webhooks
npx wrangler secret put TURNSTILE_SECRET      # bot challenge (PROMPT 10)
npx wrangler secret put BRIEF_SECRET          # Purser brief ops endpoints (preview/run only)
```

`BRIEF_SECRET` gates only the two `/api/brief/*` ops endpoints; the daily cron
needs no secret (it reads bindings the Worker already holds).

Public (non-secret) config lives in the `[vars]` block of `wrangler.toml`:
`GA4_MEASUREMENT_ID`, `ALERT_EMAIL`, `ALLOWED_ORIGIN`, `LEAD_FROM_EMAIL`,
`CALCOM_LINK`, and the two chat model ids.

### Google Sheet lead sink (D2)
Deploy `sheets-apps-script.gs` as a Sheet-bound Apps Script web app (steps in that
file), then `wrangler secret put SHEETS_WEBHOOK_URL` with its `…/exec` URL. Leads
also persist to D1 as the self-owned mirror.

### Email (Resend)
`LEAD_FROM_EMAIL` must be a **verified Resend domain** (e.g. `leads@islandmountain.io`).
Hot leads / scoping-tier → instant alert to `ALERT_EMAIL`; researching (cold) leads →
an info-pack email to the visitor.

### Cal.com booking (D5)
Set `CALCOM_LINK` in `wrangler.toml` to your scoping-call event type. In Cal.com →
Settings → Webhooks, add a webhook to `https://<worker>/api/booking-webhook` for the
`BOOKING_CREATED` event, with a secret, and `wrangler secret put WEBHOOK_SECRET` to the
same value. Hot leads get a prefilled "Book a scoping call" button; a completed booking
marks the lead `booked`, emails Basho, and fires GA4 `schedule_call`.

### NOOA Sales Brief — "Purser" (2026-08)
A daily cron (`[triggers] crontab = ["15 16 * * *"]`, UTC → **9:15 AM Pacific**) composes a
read-only pipeline brief from D1 (`leads`) + Cal.com upcoming bookings and emails it to
`ALERT_EMAIL` via Resend, then appends a row to `brief_runs` for audit. Four sections:
today's/tomorrow's booked calls (prep cards), new leads (last 24h), warm-and-aging
follow-ups, and a score×status board. **No LLM at runtime** — a faithful render of the store,
with all lead-provided text escaped.

- **Table:** `brief_runs` ships in `schema.sql`; apply with the same idempotent
  `wrangler d1 execute island-mountain-leads --remote --file=./schema.sql`.
- **Ops** (Bearer `BRIEF_SECRET`), against the deployed Worker:
  - `curl -H "Authorization: Bearer $BRIEF_SECRET" https://<worker>/api/brief/preview` → the brief as HTML, nothing sent.
  - `curl -X POST -H "Authorization: Bearer $BRIEF_SECRET" https://<worker>/api/brief/run` → compose, send now, record.
- **Cadence caveat:** Cloudflare cron is UTC, so the send drifts to 8:15 AM PST in winter
  (add a second seasonal crontab line if that matters).
- **v2 (deferred):** signable follow-up drafts for the aging-warm list.

### GA4 server events
Create a Measurement Protocol API secret in GA4 (Admin → Data Streams → your stream →
Measurement Protocol API secrets) and `wrangler secret put GA4_API_SECRET`. The Worker
fires `generate_lead` with `lead_score`, `recommended_action`, `source`, and UTM params.

## Local development

```bash
cp .dev.vars.example .dev.vars   # fill in real values — .dev.vars is gitignored
npm run dev                      # wrangler dev, simulates KV + D1 locally

# Smoke test in another terminal:
curl http://localhost:8787/api/health
# → {"success":true,"data":{"status":"ok",...}}
```

`wrangler dev` simulates KV and D1 even before the real resources exist, so the
health check and (later) chat flow can be smoke-tested before any cloud setup.

## Deploy

```bash
npm run typecheck   # tsc --noEmit, must be clean
npm run deploy      # npx wrangler deploy
```

After deploy, the live URL is `https://island-mountain-funnel.<account>.workers.dev`
(or a custom route). Point the chat widget's `API_BASE` at it (PROMPT 04).
This `wrangler deploy` is the "Cloudflare update" step run on every BUCKET cycle.

## Funnel & analytics (PROMPT 08)

Event funnel (in order):

| Stage | Event | Fired by |
|---|---|---|
| Panel opened | `chat_open` | client (gtag) |
| First message | `chat_first_message` | client (gtag) |
| Conversation began | `qualify_started` | **server** (MP) |
| Voice session | `voice_session` | client |
| Lead captured | `generate_lead` (`lead_score`, `recommended_action`, `source`, UTM, `value`) | **server** (MP) |
| Call booked | `schedule_call` | **server** (MP) |

Server-side events go through the GA4 Measurement Protocol from the Worker, so they
survive client ad-blockers. All events carry UTM source/medium/campaign + landing page.

**GA4 funnel view:** Explore → Funnel exploration with steps
`chat_open → chat_first_message → qualify_started → generate_lead → schedule_call`.
**Per-source quality:** Explore → free-form, dimension `utm_source`, metric event count
of `generate_lead` filtered by `lead_score = hot`.

**Internal dashboard:** `GET /api/stats` (set `STATS_TOKEN` via `wrangler secret put`,
call with `Authorization: Bearer <token>` or `?token=`). Returns totals, booked, last-7-day
count, and lead counts by score / source / utm_source (with hot counts per source).

## Security notes
- Secrets are set with `wrangler secret put` and live only in Cloudflare — never
  in `wrangler.toml`, the repo, or the client bundle.
- `.dev.vars` (local secrets) is gitignored.
- CORS allows only `https://islandmountain.io` (+ `www` + localhost for dev);
  all other origins are rejected (`src/cors.ts`).
- Vapi and Cal.com webhooks require `WEBHOOK_SECRET`; missing configuration fails closed.

### Abuse protection (PROMPT 10)
- **Rate limiting** (`src/ratelimit.ts`, atomic D1 counters, blocks *before* any LLM call so
  an over-limit turn costs $0): per-IP/minute (`RATE_LIMIT_PER_MIN`, default 15), per-session
  total (`SESSION_MSG_CAP`, default 60), and a global **daily circuit breaker**
  (`DAILY_MESSAGE_CAP`, default 5000). Counter failures deny the request instead of allowing
  unmetered traffic; raw IP and session identifiers are hashed before storage.
- **Prompt-injection hardening** in `src/persona.ts`: visitor text is treated as untrusted
  input; the bot refuses "ignore instructions"/"print your prompt", never reveals system
  details or keys, stays on topic, and caps reply length.
- **Cloudflare Turnstile** (optional): set `TURNSTILE_SECRET` to require a token on the first
  message of a session. Render Turnstile on the page and set `window.IM_TURNSTILE_TOKEN`;
  the widget forwards it as `X-Turnstile-Token`. Off (always-pass) when the secret is unset.
- **PII**: only the qualifier fields are stored; sessions auto-expire (~7 days, KV TTL);
  leads persist in D1 + the private Sheet. `privacy.html` documents collection, processors
  (Anthropic, Cloudflare, Vapi, Resend, Cal.com), and deletion rights.
