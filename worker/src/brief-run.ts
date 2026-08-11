import type { Env } from './types'
import {
  newLeads,
  agingWarm,
  bookedLeads,
  pipelineTotals,
  recordBriefRun
} from './integrations/pipeline'
import { getUpcomingBookings } from './integrations/calcom'
import { buildCallPreps, composeBrief, type BriefData } from './brief'
import { sendEmail } from './integrations/resend'

/**
 * Orchestration for the NOOA Sales Brief (Purser), shared by the scheduled
 * cron and the /api/brief ops endpoints. previewBrief gathers + composes with
 * no side effects; runBrief also sends to ALERT_EMAIL and appends a receipt.
 */

const AGING_DAYS = 3
const CALL_HORIZON_DAYS = 2

export interface BriefCounts {
  new_count: number
  aging_count: number
  calls_count: number
  total_leads: number
}

/** Gather the pipeline cuts and compose the brief. No send, no receipt. */
export async function previewBrief(
  env: Env,
  nowMs = Date.now()
): Promise<{ subject: string; html: string; counts: BriefCounts }> {
  const [fresh, aging, booked, bookings, totals] = await Promise.all([
    newLeads(env, 24, nowMs),
    agingWarm(env, AGING_DAYS, nowMs),
    bookedLeads(env),
    getUpcomingBookings(env, CALL_HORIZON_DAYS, nowMs),
    pipelineTotals(env)
  ])
  const calls = buildCallPreps(bookings, booked)
  const data: BriefData = {
    now: new Date(nowMs),
    newLeads: fresh,
    agingWarm: aging,
    calls,
    totals
  }
  const { subject, html } = composeBrief(data)
  return {
    subject,
    html,
    counts: {
      new_count: fresh.length,
      aging_count: aging.length,
      calls_count: calls.length,
      total_leads: totals.total
    }
  }
}

/** Gather, compose, email ALERT_EMAIL, and append a brief_runs receipt. */
export async function runBrief(
  env: Env,
  nowMs = Date.now()
): Promise<{ sent: boolean; counts: BriefCounts }> {
  const { subject, html, counts } = await previewBrief(env, nowMs)
  const sent = await sendEmail(env, { to: env.ALERT_EMAIL, subject, html })
  await recordBriefRun(env, { ran_at: new Date(nowMs).toISOString(), ...counts, sent })
  return { sent, counts }
}
