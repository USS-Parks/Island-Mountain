import type { Env } from '../types'
import { jsonResponse } from '../cors'
import { snapshotsSince, latestSnapshots } from '../geo/store'
import { renderDashboard, aggregateRun } from '../geo/dashboard'
import { runLookout } from '../geo/run'

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
  // No GEO_SECRET set = open. It's Basho's own traffic dashboard, not a secret;
  // he opted out of a password. If a GEO_SECRET ever IS set, it's enforced, so
  // locking it later is a single `wrangler secret put` with no code change.
  if (!env.GEO_SECRET) return null
  if (unauthorized(request, env))
    return jsonResponse(
      { success: false, error: 'Unauthorized.' },
      401,
      request.headers.get('Origin'),
      env
    )
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

export async function handleGeoRun(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const blocked = gate(request, env)
  if (blocked) return blocked
  // A full run is dozens of grounded queries — too long to hold the request
  // open. Kick it off in the background and return immediately.
  ctx.waitUntil(runLookout(env).catch((err) => console.error('geo run failed:', err)))
  return jsonResponse(
    { success: true, data: { started: true } },
    202,
    request.headers.get('Origin'),
    env
  )
}

export async function handleGeoPreview(request: Request, env: Env): Promise<Response> {
  const blocked = gate(request, env)
  if (blocked) return blocked
  const latest = await latestSnapshots(env)
  const agg = latest.length ? aggregateRun(latest) : null
  const data = agg
    ? {
        run_date: agg.run_date,
        cells: agg.cells,
        sov: agg.sov,
        mentionRate: agg.mentionRate,
        citeRate: agg.citeRate,
        byEngine: agg.byEngine,
        competitors: agg.competitors
      }
    : { empty: true }
  return jsonResponse({ success: true, data }, 200, request.headers.get('Origin'), env)
}
