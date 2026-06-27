import type { Env } from '../types';

export interface EmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send a transactional email via Resend. Best-effort: never throws.
 * `from` must be a verified Resend domain (see worker/README.md).
 */
export async function sendEmail(env: Env, input: EmailInput): Promise<boolean> {
  if (!env.RESEND_API_KEY) return false;
  const from = env.LEAD_FROM_EMAIL || 'Island Mountain <leads@islandmountain.io>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        html: input.html,
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });
    if (!res.ok) {
      console.error('resend non-2xx:', res.status, (await res.text().catch(() => '')).slice(0, 300));
      return false;
    }
    return true;
  } catch (err) {
    console.error('sendEmail failed:', err);
    return false;
  }
}

/** Minimal HTML escaping for values interpolated into email bodies. */
export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
