import type { Env } from '../types'
import { jsonResponse } from '../cors'
import { runPublisher, linkedinCheck } from '../publisher/run'
import { githubWriteCheck } from '../publisher/github'
import { ensureLedger, record } from '../publisher/ledger'

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
  const url = new URL(request.url)
  const check = url.searchParams.get('check')
  if (check === 'write') {
    const result = await githubWriteCheck(env)
    return jsonResponse({ success: result.ok, data: result }, result.ok ? 200 : 502, origin, env)
  }
  if (check === 'linkedin') {
    const result = await linkedinCheck(env)
    return jsonResponse({ success: true, data: result }, 200, origin, env)
  }
  // Mark an item's LinkedIn as already done (dedup when it was posted out-of-band, e.g.
  // a manual catch-up) so the scheduled lane will not re-post it.
  const mark = url.searchParams.get('mark')
  if (mark) {
    await ensureLedger(env)
    await record(env, mark, 'linkedin_comment', 'manual')
    return jsonResponse({ success: true, data: { marked: mark } }, 200, origin, env)
  }
  const results = await runPublisher(env)
  return jsonResponse({ success: true, data: { results } }, 200, origin, env)
}
