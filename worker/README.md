# Island Mountain — Funnel Worker

Edge backend for the AI conversational + voice lead funnel. Holds every secret
key server-side so the static site (GitHub Pages) can offer an AI chat/voice
qualifier without ever exposing an API key to the browser.

| Route | Method | Purpose | Built in |
|---|---|---|---|
| `/api/health` | GET | Liveness probe | PROMPT 01 |
| `/api/chat` | POST | Claude proxy + KV session memory | PROMPT 02 |
| `/api/lead` | POST | Score, persist, alert, GA4 event | PROMPT 03 / 05 |
| `/api/voice-webhook` | POST | Vapi voice → same pipeline | PROMPT 07 |

## Stack
Cloudflare Worker (TypeScript) · Workers KV (`SESSIONS`) · D1 (`leads`) ·
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
`GA4_MEASUREMENT_ID`, `ALERT_EMAIL`, `ALLOWED_ORIGIN`, and the two chat model ids.

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

## Security notes
- Secrets are set with `wrangler secret put` and live only in Cloudflare — never
  in `wrangler.toml`, the repo, or the client bundle.
- `.dev.vars` (local secrets) is gitignored.
- CORS allows only `https://islandmountain.io` (+ `www` + localhost for dev);
  all other origins are rejected (`src/cors.ts`).
- Rate limiting, prompt-injection guards, and a daily cost cap land in PROMPT 10.
