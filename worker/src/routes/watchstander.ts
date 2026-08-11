import type { Env } from '../types'
import { jsonResponse } from '../cors'
import { sendEmail, esc } from '../integrations/resend'

/**
 * POST /api/watchstander — NOOA watchstander red-alert relay.
 * Auth: Bearer WATCHSTANDER_SECRET. Body: plain-text report block.
 * Sends the report as an email via Resend to ALERT_EMAIL.
 */
export async function handleWatchstander(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin')

  if (!env.WATCHSTANDER_SECRET) {
    return jsonResponse({ success: false, error: 'Not configured.' }, 503, origin, env)
  }
  const auth = request.headers.get('Authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (token !== env.WATCHSTANDER_SECRET) {
    return jsonResponse({ success: false, error: 'Unauthorized.' }, 401, origin, env)
  }

  const body = await request.text()
  if (!body.trim()) {
    return jsonResponse({ success: false, error: 'Empty report.' }, 400, origin, env)
  }

  const to = env.ALERT_EMAIL
  const lines = body.trim().split('\n')
  const subject = `[Watchstander] ${lines[0].replace(/^\[.*?\]\s*/, '')}`
  const html = `<pre style="font-family:monospace;font-size:14px;white-space:pre-wrap">${esc(body)}</pre>`

  const sent = await sendEmail(env, { to, subject, html })
  return jsonResponse({ success: true, data: { sent } }, sent ? 200 : 502, origin, env)
}
