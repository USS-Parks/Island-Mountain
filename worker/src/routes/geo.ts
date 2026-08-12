import type { Env } from '../types'
import { jsonResponse } from '../cors'
import { snapshotsSince, latestSnapshots } from '../geo/store'
import { renderDashboard } from '../geo/dashboard'

/**
 * Lookout ops endpoints, gated by Bearer GEO_SECRET (internal competitive
 * intel — never public). The dashboard renders the stored snapshots as HTML;
 * run + preview (added alongside) drive and inspect the collector.
 */

function unauthorized(request: Request, env: Env): boolean {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  return !env.GEO_SECRET || token !== env.GEO_SECRET
}

function gate(request: Request, env: Env): Response | null {
  const origin = request.headers.get('Origin')
  if (!env.GEO_SECRET)
    return jsonResponse({ success: false, error: 'Not configured.' }, 503, origin, env)
  if (unauthorized(request, env))
    return jsonResponse({ success: false, error: 'Unauthorized.' }, 401, origin, env)
  return null
}

export async function handleGeoDashboard(request: Request, env: Env): Promise<Response> {
  const blocked = gate(request, env)
  if (blocked) return blocked
  const [all, latest] = await Promise.all([snapshotsSince(env, 120), latestSnapshots(env)])
  const html = renderDashboard(all, latest, Date.now())
  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  })
}
