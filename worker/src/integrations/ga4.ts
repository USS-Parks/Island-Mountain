import type { Env } from '../types';

/**
 * GA4 Measurement Protocol — server-side events (resilient to ad-blockers).
 * Best-effort: never throws. Returns true on a 2xx/no-content response.
 */
export async function ga4Event(
  env: Env,
  name: string,
  params: Record<string, unknown>,
  clientId: string,
): Promise<boolean> {
  if (!env.GA4_API_SECRET || !env.GA4_MEASUREMENT_ID) return false;
  const url =
    `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(env.GA4_MEASUREMENT_ID)}` +
    `&api_secret=${encodeURIComponent(env.GA4_API_SECRET)}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        events: [{ name, params }],
      }),
    });
    return res.ok || res.status === 204;
  } catch (err) {
    console.error('ga4Event failed:', err);
    return false;
  }
}
