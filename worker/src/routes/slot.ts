import type { Env } from '../types'
import { jsonResponse } from '../cors'
import { enforceLimits } from '../ratelimit'
import { processLead, type LeadContext } from '../lead-processor'
import type { LeadFields, ScoreResult } from '../qualifier'
import { sendEmail } from '../integrations/resend'
import { ga4Event } from '../integrations/ga4'
import { slotEmail } from '../emails'

interface SlotBody {
  name?: string
  email?: string
  phone?: string
  organization?: string
  workload?: string
  landing_page?: string
  referrer?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * POST /api/slot — Founder's Build Slot claim.
 * High-intent by definition: forces a hot score so processLead fires the
 * alert email to Basho, then confirms to the claimant (90-day quote lock).
 */
export async function handleSlot(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin')
  const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0'

  let body: SlotBody
  try {
    body = (await request.json()) as SlotBody
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body.' }, 400, origin, env)
  }

  const name = (body.name || '').trim().slice(0, 120)
  const email = (body.email || '').trim().toLowerCase()
  if (!name || !EMAIL_RE.test(email)) {
    return jsonResponse(
      { success: false, error: 'Name and a valid email are required.' },
      400,
      origin,
      env
    )
  }

  const sessionId = crypto.randomUUID()
  const limit = await enforceLimits(env, ip, sessionId, new Date())
  if (!limit.allowed) {
    return jsonResponse({ success: false, error: 'Rate limit exceeded.' }, 429, origin, env)
  }

  const fields: LeadFields = {
    name,
    email,
    phone: (body.phone || '').slice(0, 40) || undefined,
    organization: (body.organization || '').slice(0, 160) || undefined,
    use_case: (body.workload || '').slice(0, 500) || undefined,
    system_interest: 'Build slot claim'
  }
  const scored: ScoreResult = {
    score: 'hot',
    recommendedAction: 'scoping_call',
    reason: "Founder's build-slot claim",
    points: 9
  }
  const ctx: LeadContext = {
    sessionId,
    meta: {
      landing_page: (body.landing_page || '').slice(0, 200),
      referrer: (body.referrer || '').slice(0, 300)
    },
    source: 'form',
    transcript: []
  }

  const processed = await processLead(env, fields, scored, ctx)

  const { subject, html } = slotEmail(name, env.CALCOM_LINK)
  const confirmed = await sendEmail(env, { to: email, subject, html, replyTo: env.ALERT_EMAIL })

  await ga4Event(
    env,
    'slot_claim',
    { organization: fields.organization ?? '', currency: 'USD', value: 1 },
    sessionId
  )

  console.log(
    `[slot ${processed.id}] alerted=${processed.emailed} confirmed=${confirmed} org=${fields.organization ?? '-'}`
  )
  return jsonResponse({ success: true, data: { confirmed } }, 200, origin, env)
}
