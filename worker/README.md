# Island Mountain — Funnel Worker

Edge backend for the AI conversational + voice lead funnel. Holds every secret
key server-side so the static site (GitHub Pages) can offer an AI chat/voice
qualifier without ever exposing an API key to the browser.

| Route | Method | Purpose | Built in |
|---|---|---|---|
| `/api/health` | GET | Liveness probe | PROMPT 01 |
| `/api/chat` | POST | Claude proxy + KV session memory | PROMPT 02 |
| `/api/voice-webhook` | POST | Vapi voice → same pipeline | PROMPT 07 |

Lead scoring, persistence, alerts, and analytics run only inside the chat and
authenticated voice pipelines. There is no public direct lead-submission route.

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
```

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
