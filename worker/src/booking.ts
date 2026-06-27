import type { Env } from './types';
import type { LeadFields } from './qualifier';

/**
 * Build a Cal.com scheduling URL prefilled with what we know and carrying
 * sessionId + leadId in metadata so the booking webhook can correlate back.
 * Returns null if no CALCOM_LINK is configured.
 */
export function buildBookingUrl(
  env: Env,
  fields: LeadFields,
  sessionId: string,
  leadId?: string,
): string | null {
  if (!env.CALCOM_LINK) return null;
  const u = new URL(env.CALCOM_LINK);
  if (fields.name) u.searchParams.set('name', fields.name);
  if (fields.email) u.searchParams.set('email', fields.email);
  const notes = [fields.organization, fields.system_interest, fields.use_case]
    .filter(Boolean)
    .join(' · ');
  if (notes) u.searchParams.set('notes', notes);
  u.searchParams.set('metadata[sessionId]', sessionId);
  if (leadId) u.searchParams.set('metadata[leadId]', leadId);
  return u.toString();
}

/**
 * Verify a Cal.com webhook HMAC-SHA256 signature (hex of the raw body keyed by
 * the webhook secret). If no secret is configured, accept (dev). Constant-time
 * compare.
 */
export async function verifyCalSignature(
  env: Env,
  rawBody: string,
  signature: string | null,
): Promise<boolean> {
  if (!env.WEBHOOK_SECRET) return true; // dev / not yet configured
  if (!signature) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return timingSafeEqual(expected, signature.trim().toLowerCase());
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
