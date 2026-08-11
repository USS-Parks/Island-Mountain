import type { Env } from '../types'
import { jsonResponse } from '../cors'
import { previewBrief, runBrief } from '../brief-run'

/**
 * NOOA Sales Brief (Purser) ops endpoints, gated by Bearer BRIEF_SECRET
 * (same trust boundary as the watchstander relay):
 *   GET  /api/brief/preview — render today's brief as HTML, no send
 *   POST /api/brief/run     — compose, send to ALERT_EMAIL, append a receipt
 */

function unauthorized(request: Request, env: Env): boolean {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '')
  return !env.BRIEF_SECRET || token !== env.BRIEF_SECRET
}

export async function handleBriefPreview(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin')
  if (!env.BRIEF_SECRET) {
    return jsonResponse({ success: false, error: 'Not configured.' }, 503, origin, env)
  }
  if (unauthorized(request, env)) {
    return jsonResponse({ success: false, error: 'Unauthorized.' }, 401, origin, env)
  }
  const { html } = await previewBrief(env)
  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' }
  })
}

export async function handleBriefRun(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin')
  if (!env.BRIEF_SECRET) {
    return jsonResponse({ success: false, error: 'Not configured.' }, 503, origin, env)
  }
  if (unauthorized(request, env)) {
    return jsonResponse({ success: false, error: 'Unauthorized.' }, 401, origin, env)
  }
  const { sent, counts } = await runBrief(env)
  return jsonResponse({ success: true, data: { sent, ...counts } }, sent ? 200 : 502, origin, env)
}
