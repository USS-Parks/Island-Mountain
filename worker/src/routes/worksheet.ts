import type { Env } from '../types'
import { jsonResponse } from '../cors'
import { enforceLimits } from '../ratelimit'
import { processLead, type LeadContext } from '../lead-processor'
import type { LeadFields, ScoreResult } from '../qualifier'
import { sendEmail } from '../integrations/resend'
import { ga4Event } from '../integrations/ga4'
import { worksheetEmail, briefFor } from '../emails'

interface WorksheetBody {
  email?: string
  industry?: string
  seats?: number
  monthly_spend?: number
  growth_pct?: number
  landing_page?: string
  referrer?: string
}

export interface WorksheetCalc {
  seats: number
  monthlySpend: number
  growth: number
  years: number[]
  total: number
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function clamp(n: unknown, min: number, max: number, fallback: number): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? n : fallback
  return Math.min(max, Math.max(min, v))
}

/** Recompute the 5-year cloud burn server-side; never trust a client total. */
export function computeBurn(seats: number, monthlySpend: number, growth: number): WorksheetCalc {
  const years: number[] = []
  let total = 0
  for (let y = 0; y < 5; y++) {
    const annual = monthlySpend * 12 * Math.pow(1 + growth, y)
    years.push(annual)
    total += annual
  }
  return { seats, monthlySpend, growth, years, total }
}

/**
 * POST /api/worksheet — the cost-worksheet email gate.
 * Persists a lead (source=form, cold/followup: no auto docs email), then sends
 * the worksheet email carrying the private Summit comparison. One send per
 * email address per hour; standard IP limits apply.
 */
export async function handleWorksheet(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin')
  const ip = request.headers.get('CF-Connecting-IP') ?? '0.0.0.0'

  let body: WorksheetBody
  try {
    body = (await request.json()) as WorksheetBody
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body.' }, 400, origin, env)
  }

  const email = (body.email || '').trim().toLowerCase()
  if (!EMAIL_RE.test(email)) {
    return jsonResponse({ success: false, error: 'A valid email is required.' }, 400, origin, env)
  }

  const sessionId = crypto.randomUUID()
  const limit = await enforceLimits(env, ip, sessionId, new Date())
  if (!limit.allowed) {
    return jsonResponse({ success: false, error: 'Rate limit exceeded.' }, 429, origin, env)
  }

  // One worksheet email per address per hour — this endpoint mails a
  // user-supplied address, so throttle it independently of the IP limits.
  const sentKey = `ws_sent:${email}`
  if (await env.SESSIONS.get(sentKey).catch(() => null)) {
    return jsonResponse(
      { success: false, error: 'Worksheet already sent — check your inbox.' },
      429,
      origin,
      env
    )
  }

  const seats = clamp(body.seats, 1, 100000, 25)
  const monthlySpend = clamp(body.monthly_spend, 0, 10_000_000, 0)
  const growth = clamp(body.growth_pct, 0, 30, 15) / 100
  const calc = computeBurn(seats, monthlySpend, growth)
  const industry = (body.industry || '').slice(0, 80)

  const fields: LeadFields = {
    email,
    industry: industry || undefined,
    concurrent_users: String(seats),
    use_case: 'Cost worksheet request',
    current_setup: `~$${Math.round(monthlySpend).toLocaleString('en-US')}/mo cloud AI spend, ${Math.round(growth * 100)}%/yr growth assumption`,
    docs_requested: [briefFor(industry).label]
  }
  const scored: ScoreResult = {
    score: 'cold',
    recommendedAction: 'followup',
    reason: 'Cost worksheet request',
    points: 1
  }
  const ctx: LeadContext = {
    sessionId,
    meta: {
      landing_page: (body.landing_page || '/sovereign-cost-worksheet.html').slice(0, 200),
      referrer: (body.referrer || '').slice(0, 300)
    },
    source: 'form',
    transcript: []
  }

  const processed = await processLead(env, fields, scored, ctx)

  const { subject, html } = worksheetEmail(industry, calc)
  const emailed = await sendEmail(env, { to: email, subject, html })

  if (emailed) {
    await env.SESSIONS.put(sentKey, '1', { expirationTtl: 3600 }).catch(() => {})
  }
  await ga4Event(
    env,
    'worksheet_email',
    { value: Math.round(calc.total), currency: 'USD', industry: industry || '(none)' },
    sessionId
  )

  console.log(
    `[worksheet ${processed.id}] emailed=${emailed} total=${Math.round(calc.total)} industry=${industry || '-'}`
  )
  return jsonResponse({ success: true, data: { emailed } }, 200, origin, env)
}
