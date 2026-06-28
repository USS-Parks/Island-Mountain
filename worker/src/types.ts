/**
 * Worker environment bindings.
 *
 * Secrets are injected by Cloudflare at runtime (set via `wrangler secret put`)
 * and are NEVER stored in wrangler.toml or the repo. Vars come from the
 * [vars] block in wrangler.toml and are safe to be public.
 */
export interface Env {
  // --- Bindings ---
  /** Per-session conversation memory + rate-limit counters. */
  SESSIONS: KVNamespace;
  /** Self-owned lead mirror (SQLite at the edge). */
  DB: D1Database;

  // --- Secrets (wrangler secret put) ---
  /** Anthropic API key — the chat brain. Required for /api/chat. */
  ANTHROPIC_API_KEY: string;
  /** Resend API key — instant hot-lead email. */
  RESEND_API_KEY: string;
  /** GA4 Measurement Protocol API secret — server-side conversion events. */
  GA4_API_SECRET: string;
  /** Apps Script web-app URL (or service token) for the Google Sheet lead store. */
  SHEETS_WEBHOOK_URL?: string;
  /** Vapi private API key — voice agent (PROMPT 07). */
  VAPI_API_KEY?: string;
  /** Cal.com API key (cal_live_…) — live in-call booking for the voice agent. */
  CALCOM_API_KEY?: string;
  /** Shared secret to validate inbound Vapi/Cal.com webhooks. */
  WEBHOOK_SECRET?: string;
  /** Cloudflare Turnstile secret — bot challenge on session start (PROMPT 10). */
  TURNSTILE_SECRET?: string;
  /** Bearer token gating GET /api/stats. */
  STATS_TOKEN?: string;

  // --- Abuse-protection caps (vars; defaults applied if unset) ---
  RATE_LIMIT_PER_MIN?: string;
  SESSION_MSG_CAP?: string;
  DAILY_MESSAGE_CAP?: string;

  // --- Vars (wrangler.toml [vars], public) ---
  GA4_MEASUREMENT_ID: string;
  ALERT_EMAIL: string;
  ALLOWED_ORIGIN: string;
  CHAT_MODEL_ROUTINE: string;
  CHAT_MODEL_ESCALATION: string;
  /** From-address for outbound email (must be a verified Resend domain). */
  LEAD_FROM_EMAIL?: string;
  /** Cal.com scheduling link offered to hot leads (PROMPT 06). */
  CALCOM_LINK?: string;
  /** Cal.com event-type id for the "Discovery/Scoping Call" (live voice booking). */
  CALCOM_EVENT_TYPE_ID?: string;
  /** Default IANA timezone for the scoping-call calendar, e.g. America/Denver. */
  CALCOM_TIMEZONE?: string;
}

/** Standard JSON envelope returned by every endpoint. */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
