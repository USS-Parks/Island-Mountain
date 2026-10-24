import type { Env } from '../types';
import { jsonResponse } from '../cors';

/**
 * GET /api/agent-identify
 *
 * Voluntary self-identification endpoint for AI agents acting on behalf of a
 * person. Reads the X-Agent* request headers, records them (structured log),
 * and returns a small acknowledgement. Published to agents via
 * /.well-known/agents.txt and the "For AI Agents" section of /llms.txt.
 *
 * Privacy gate: the person-identifying header (X-Agent-Acting-For) is kept and
 * logged ONLY when X-Agent-User-Consent: explicit is also present. Without that
 * marker the acting-for value is dropped before logging and never stored. The
 * site never grants a person's consent on their behalf.
 *
 * SCOPE NOTE: this endpoint only sees requests that reach the Worker origin
 * (api.islandmountain.io). It does NOT observe static page fetches to
 * islandmountain.io/*.html, which are served by GitHub Pages and never hit this
 * Worker. To log agent headers on actual page visits, add the X-Agent* headers
 * to Cloudflare request logging (Logpush) or front the site with a pass-through
 * route; neither of those lives in this repo.
 */
export function handleAgentIdentify(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  const h = request.headers;

  const agent = (h.get('X-Agent') || '').trim();
  const operator = (h.get('X-Agent-Operator') || '').trim();
  const product = (h.get('X-Agent-Product') || '').trim();
  const purpose = (h.get('X-Agent-Purpose') || '').trim();

  // Consent gate: only keep the person-identifying value with an explicit marker.
  const consent = (h.get('X-Agent-User-Consent') || '').trim().toLowerCase();
  const actingForRaw = (h.get('X-Agent-Acting-For') || '').trim();
  const consented = consent === 'explicit';
  const actingFor = consented && actingForRaw ? actingForRaw : null;

  const record = {
    kind: 'agent-identify',
    at: new Date().toISOString(),
    agent: agent || null,
    operator: operator || null,
    product: product || null,
    purpose: purpose || null,
    acting_for: actingFor, // null unless X-Agent-User-Consent: explicit
    user_consent: consented ? 'explicit' : null,
    // true when an acting-for value arrived WITHOUT consent and was discarded.
    acting_for_withheld: !consented && actingForRaw.length > 0,
    ua: (h.get('User-Agent') || '').slice(0, 256) || null,
    ray: h.get('CF-Ray') || null,
  };

  // Structured log — visible via `wrangler tail` and Cloudflare logs. This is
  // the capture surface; swap in a KV/D1/Analytics-Engine write to persist.
  console.log(`[agent-identify] ${JSON.stringify(record)}`);

  return jsonResponse(
    {
      success: true,
      data: {
        acknowledged: true,
        recorded: {
          agent: record.agent,
          operator: record.operator,
          product: record.product,
          purpose: record.purpose,
          acting_for: record.acting_for ? 'recorded-with-consent' : 'not-recorded',
        },
        policy: 'https://islandmountain.io/.well-known/agents.txt',
        note: record.acting_for_withheld
          ? 'acting-for ignored: missing X-Agent-User-Consent: explicit'
          : undefined,
      },
    },
    200,
    origin,
    env,
  );
}
