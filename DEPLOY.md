# Deploy & Setup — AI Conversational + Voice Funnel

The static site (GitHub Pages) is unchanged. This doc covers the **`/worker`
backend** that powers the AI chat/voice funnel, plus the one-time third-party
wiring. Claude built all the code with placeholder secret *bindings*; the live
keys are set here by Basho and never live in the repo.

## 0. Prereqs
- Node + npm (have it).
- A Cloudflare account (have it). `cd worker && npm install`, then `npx wrangler login`.

## 1. Create Cloudflare resources (once)
```bash
cd worker
npx wrangler kv namespace create SESSIONS        # paste id → wrangler.toml [[kv_namespaces]]
npx wrangler d1 create island-mountain-leads      # paste database_id → wrangler.toml [[d1_databases]]
npx wrangler d1 execute island-mountain-leads --remote --file=./schema.sql
```

## 2. Set secrets (once; values never touch the repo)
```bash
npx wrangler secret put ANTHROPIC_API_KEY     # required — chat brain
npx wrangler secret put RESEND_API_KEY        # hot-lead + docs email
npx wrangler secret put GA4_API_SECRET        # GA4 Measurement Protocol
npx wrangler secret put SHEETS_WEBHOOK_URL    # Apps Script web-app URL (see sheets-apps-script.gs)
npx wrangler secret put WEBHOOK_SECRET        # validates Cal.com + Vapi webhooks
npx wrangler secret put VAPI_API_KEY          # voice (optional)
npx wrangler secret put STATS_TOKEN           # gates GET /api/stats (optional)
npx wrangler secret put TURNSTILE_SECRET      # bot challenge (optional)
```
Public config (`[vars]` in `wrangler.toml`): `GA4_MEASUREMENT_ID`, `ALERT_EMAIL`,
`LEAD_FROM_EMAIL` (verified Resend domain), `CALCOM_LINK`, rate-limit caps.

## 3. Third-party wiring
- **Google Sheet:** deploy `worker/sheets-apps-script.gs` as a web app → `SHEETS_WEBHOOK_URL`.
- **Resend:** verify the `islandmountain.io` sending domain; set `LEAD_FROM_EMAIL`.
- **GA4:** create a Measurement Protocol API secret → `GA4_API_SECRET`.
- **Cal.com:** create the scoping-call event type → `CALCOM_LINK`; add a webhook to
  `https://<worker>/api/booking-webhook` (BOOKING_CREATED) with `WEBHOOK_SECRET`.
- **Vapi (voice):** follow `worker/vapi-setup.md` (assistant, `submit_lead` tool, Server
  URL `https://<worker>/api/voice-webhook`, Server-URL Secret = `WEBHOOK_SECRET`, number).

## 4. Deploy the Worker
```bash
cd worker
npm run typecheck && npm test
npm run deploy            # npx wrangler deploy
curl https://<worker-subdomain>.workers.dev/api/health   # → {"status":"ok"}
```
**Recommended:** add a Worker route `islandmountain.io/api/*` in the Cloudflare dashboard
(same domain → no CORS, no subdomain guessing). The site is already on Cloudflare DNS.

## 5. Point the widget at the Worker
In `js/chat-widget.js`, set `DEFAULT_API_BASE` to your Worker origin — either the
`…workers.dev` URL, or `https://islandmountain.io` if you added the `/api/*` route. Commit +
push (GitHub Pages redeploys). Optionally per-page: `window.IM_CHAT_CONFIG = { apiBase, voice }`.

## 6. "BUCKET" — redeploy on every change
Run `pwsh scripts/bucket.ps1` (typecheck → tests → `wrangler deploy` → health check).
This is the **Cloudflare update** step. The static site redeploys separately via a
`git push` to `main` (GitHub Pages). Requires `wrangler login` once.

## Maintenance checklist
- **Keys:** rotate `ANTHROPIC_API_KEY` / `RESEND_API_KEY` / `VAPI_API_KEY` periodically
  (`wrangler secret put` overwrites).
- **Spend:** watch Anthropic + Vapi dashboards; `DAILY_MESSAGE_CAP` is the circuit breaker.
- **Model changes:** re-test a chat + a voice call after any Anthropic/Vapi model update;
  update model ids in `wrangler.toml [vars]` if needed.
- **Funnel:** check GA4 weekly (open → message → qualify → lead → booked) + `GET /api/stats`.
- **After site edits:** confirm the widget still loads on a root + a blog page (the include
  is on all 58 pages; re-run the rollout if you add pages).
- **Backups:** the Google Sheet is the human copy; D1 is the mirror
  (`wrangler d1 export island-mountain-leads --remote` for a dump).
- **Data requests:** delete from the Sheet + D1 (`DELETE FROM leads WHERE email=…`).
