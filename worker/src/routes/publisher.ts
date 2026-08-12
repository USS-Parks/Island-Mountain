import type { Env } from '../types'
import { jsonResponse } from '../cors'
import { runPublisher } from '../publisher/run'

/**
 * Authority-campaign publisher ops endpoint, gated by Bearer PUBLISHER_SECRET
 * (same trust boundary as the brief/geo ops endpoints):
 *   POST /api/publisher/run — run today's due lanes now (manual catch-up / validation).
 * Idempotent: the D1 ledger makes a repeat run a no-op. Disabled (503) until the secret set.
 */
function unauthorized(request: Request, env: Env): boolean {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  return !env.PUBLISHER_SECRET || token !== env.PUBLISHER_SECRET
}

export async function handlePublisherRun(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin')
  if (!env.PUBLISHER_SECRET) {
    return jsonResponse({ success: false, error: 'Not configured.' }, 503, origin, env)
  }
  if (unauthorized(request, env)) {
    return jsonResponse({ success: false, error: 'Unauthorized.' }, 401, origin, env)
  }
  const results = await runPublisher(env)
  return jsonResponse({ success: true, data: { results } }, 200, origin, env)
}
