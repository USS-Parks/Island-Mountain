import type { Env } from './types';

export interface RateResult {
  allowed: boolean;
  /** Machine reason for a block: 'per_minute' | 'session' | 'daily'. */
  reason?: 'per_minute' | 'session' | 'daily';
}

function intVar(v: string | undefined, fallback: number): number {
  const n = parseInt(v ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Get→increment→put a KV counter with a TTL window. Returns the new count. */
async function bump(env: Env, key: string, ttl: number): Promise<number> {
  const cur = parseInt((await env.SESSIONS.get(key)) ?? '0', 10) || 0;
  const next = cur + 1;
  await env.SESSIONS.put(key, String(next), { expirationTtl: ttl }).catch(() => {});
  return next;
}

const dayStamp = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Layered limits on a chat turn (cheap KV counters; minor races acceptable at
 * this volume). Blocks BEFORE any LLM call, so an over-limit request costs
 * nothing. Order: per-IP/minute → per-session total → global daily (circuit
 * breaker). All caps are vars in wrangler.toml; 0/unset uses the defaults.
 */
export async function enforceLimits(
  env: Env,
  ip: string,
  sessionId: string,
  now: Date,
): Promise<RateResult> {
  const perMin = intVar(env.RATE_LIMIT_PER_MIN, 15);
  const sessionCap = intVar(env.SESSION_MSG_CAP, 60);
  const dailyCap = intVar(env.DAILY_MESSAGE_CAP, 5000);

  const minuteBucket = Math.floor(now.getTime() / 60000);
  const ipCount = await bump(env, `rl:ip:${ip}:${minuteBucket}`, 70);
  if (ipCount > perMin) return { allowed: false, reason: 'per_minute' };

  const sessCount = await bump(env, `rl:sess:${sessionId}`, 60 * 60 * 24 * 7);
  if (sessCount > sessionCap) return { allowed: false, reason: 'session' };

  const dayCount = await bump(env, `rl:global:${dayStamp(now)}`, 60 * 60 * 25);
  if (dayCount > dailyCap) return { allowed: false, reason: 'daily' };

  return { allowed: true };
}

/** User-facing degrade message per block reason (no LLM call is made). */
export function degradeMessage(reason: RateResult['reason']): string {
  if (reason === 'per_minute') {
    return "You're sending messages quickly — give me a few seconds, then try again. " +
      'If it’s urgent, call 1-801-609-1130.';
  }
  if (reason === 'session') {
    return "We’ve covered a lot here. To go further, the best next step is a quick call " +
      'with Basho — 1-801-609-1130 — or email basho@islandmountain.io.';
  }
  return "We’re seeing unusually high demand right now. Please reach us directly at " +
    '1-801-609-1130 or basho@islandmountain.io and we’ll help straight away.';
}

/**
 * Cloudflare Turnstile verification (optional). When `TURNSTILE_SECRET` is unset,
 * always passes (feature off). Verifies the token on the first message of a session.
 */
export async function verifyTurnstile(
  env: Env,
  token: string | null,
  ip: string,
): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true;
  if (!token) return false;
  try {
    const form = new FormData();
    form.append('secret', env.TURNSTILE_SECRET);
    form.append('response', token);
    if (ip) form.append('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (err) {
    console.error('turnstile verify failed:', err);
    return false;
  }
}
