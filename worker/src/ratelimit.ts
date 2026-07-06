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

/** Atomically increment or reset a D1 counter. Storage errors fail the request closed. */
async function bump(env: Env, key: string, ttl: number, nowSeconds: number): Promise<number> {
  const expiresAt = nowSeconds + ttl;
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (counter_key, count, expires_at) VALUES (?, 1, ?)
     ON CONFLICT(counter_key) DO UPDATE SET
       count = CASE WHEN rate_limits.expires_at <= ? THEN 1 ELSE rate_limits.count + 1 END,
       expires_at = CASE WHEN rate_limits.expires_at <= ? THEN excluded.expires_at ELSE rate_limits.expires_at END
     RETURNING count`,
  )
    .bind(key, expiresAt, nowSeconds, nowSeconds)
    .first<{ count: number }>();
  if (!row || !Number.isFinite(row.count)) throw new Error('rate-limit counter update failed');
  return row.count;
}

async function privateKey(namespace: string, value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${namespace}:${hex}`;
}

const dayStamp = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Layered limits on a chat turn. D1 upserts make each increment atomic, and any
 * storage error fails closed before an LLM call. Raw IPs and session IDs are
 * SHA-256 hashed before storage. All caps are vars in wrangler.toml.
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
  const nowSeconds = Math.floor(now.getTime() / 1000);
  const [ipKey, sessionKey] = await Promise.all([
    privateKey('ip', ip),
    privateKey('session', sessionId),
  ]);

  const ipCount = await bump(env, ipKey, 70, nowSeconds);
  if (ipCount > perMin) return { allowed: false, reason: 'per_minute' };

  const sessCount = await bump(env, sessionKey, 60 * 60 * 24 * 7, nowSeconds);
  if (sessCount > sessionCap) return { allowed: false, reason: 'session' };

  const dayKey = `global:${dayStamp(now)}`;
  const dayCount = await bump(env, dayKey, 60 * 60 * 25, nowSeconds);
  if (dayCount === 1) {
    await env.DB.prepare('DELETE FROM rate_limits WHERE expires_at <= ? AND counter_key <> ?')
      .bind(nowSeconds, dayKey)
      .run();
  }
  if (dayCount > dailyCap) return { allowed: false, reason: 'daily' };

  return { allowed: true };
}

/** User-facing degrade message per block reason (no LLM call is made). */
export function degradeMessage(reason: RateResult['reason']): string {
  if (reason === 'per_minute') {
    return "You're sending messages quickly — give me a few seconds, then try again. " +
      'If it’s urgent, call 1-341-441-8740.';
  }
  if (reason === 'session') {
    return "We’ve covered a lot here. To go further, the best next step is a quick call " +
      'with Basho — 1-341-441-8740 — or email basho@islandmountain.io.';
  }
  return "We’re seeing unusually high demand right now. Please reach us directly at " +
    '1-341-441-8740 or basho@islandmountain.io and we’ll help straight away.';
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
