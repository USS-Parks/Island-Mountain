import type { Env } from '../types'

/**
 * Read-only pipeline cuts for the daily NOOA Sales Brief (Purser).
 *
 * Every read is best-effort: a missing DB or a query error yields an empty
 * result, never a throw, so one dead cut can't sink the brief. Time windows
 * take an injectable `nowMs` so the queries are deterministically testable.
 */

/** A lead row as the brief consumes it. Fields are SQL-nullable. */
export interface PipelineLead {
  id: string
  created_at: string
  name: string | null
  email: string | null
  organization: string | null
  job_title: string | null
  industry: string | null
  use_case: string | null
  timeline: string | null
  score: string | null
  score_reason: string | null
  source: string | null
  status: string | null
  // Prep-card extras (only selected for booked leads):
  compliance?: string | null // JSON array string
  budget?: string | null
  transcript?: string | null // conversation JSON
}

export interface PipelineTotals {
  total: number
  byScore: Record<string, number>
  byStatus: Record<string, number>
}

/** One brief run's receipt, appended to brief_runs for audit. */
export interface BriefReceipt {
  ran_at: string
  new_count: number
  aging_count: number
  calls_count: number
  total_leads: number
  sent: boolean
}

// Digest lists don't need the heavy transcript/compliance columns; prep cards do.
const COLS_LITE =
  'id, created_at, name, email, organization, job_title, industry, use_case, ' +
  'timeline, score, score_reason, source, status'
const COLS_FULL = `${COLS_LITE}, compliance, budget, transcript`

/** Leads that arrived in the last `hours`, newest first. */
export async function newLeads(env: Env, hours = 24, nowMs = Date.now()): Promise<PipelineLead[]> {
  if (!env.DB) return []
  const cutoff = new Date(nowMs - hours * 3_600_000).toISOString()
  try {
    const r = await env.DB.prepare(
      `SELECT ${COLS_LITE} FROM leads WHERE created_at >= ? ORDER BY created_at DESC`
    )
      .bind(cutoff)
      .all<PipelineLead>()
    return r.results ?? []
  } catch (err) {
    console.error('newLeads failed:', err)
    return []
  }
}

/** Hot/warm leads still unworked (`status='new'`) and older than `days` — going cold. */
export async function agingWarm(env: Env, days = 3, nowMs = Date.now()): Promise<PipelineLead[]> {
  if (!env.DB) return []
  const cutoff = new Date(nowMs - days * 86_400_000).toISOString()
  try {
    const r = await env.DB.prepare(
      `SELECT ${COLS_LITE} FROM leads
       WHERE score IN ('hot','warm') AND status = 'new' AND created_at < ?
       ORDER BY created_at ASC`
    )
      .bind(cutoff)
      .all<PipelineLead>()
    return r.results ?? []
  } catch (err) {
    console.error('agingWarm failed:', err)
    return []
  }
}

/** Leads marked booked; the brief joins these to Cal.com times for prep cards. */
export async function bookedLeads(env: Env): Promise<PipelineLead[]> {
  if (!env.DB) return []
  try {
    const r = await env.DB.prepare(
      `SELECT ${COLS_FULL} FROM leads WHERE status = 'booked' ORDER BY created_at DESC`
    ).all<PipelineLead>()
    return r.results ?? []
  } catch (err) {
    console.error('bookedLeads failed:', err)
    return []
  }
}

/** Whole-board counts by score and by status. */
export async function pipelineTotals(env: Env): Promise<PipelineTotals> {
  const empty: PipelineTotals = { total: 0, byScore: {}, byStatus: {} }
  if (!env.DB) return empty
  try {
    const r = await env.DB.prepare(
      `SELECT COALESCE(score,'unknown') AS score, COALESCE(status,'unknown') AS status, COUNT(*) AS n
       FROM leads GROUP BY score, status`
    ).all<{ score: string; status: string; n: number }>()
    const totals: PipelineTotals = { total: 0, byScore: {}, byStatus: {} }
    for (const row of r.results ?? []) {
      const n = Number(row.n) || 0
      totals.total += n
      totals.byScore[row.score] = (totals.byScore[row.score] ?? 0) + n
      totals.byStatus[row.status] = (totals.byStatus[row.status] ?? 0) + n
    }
    return totals
  } catch (err) {
    console.error('pipelineTotals failed:', err)
    return empty
  }
}

/** Append a brief run receipt to brief_runs. Best-effort. */
export async function recordBriefRun(env: Env, receipt: BriefReceipt): Promise<boolean> {
  if (!env.DB) return false
  try {
    await env.DB.prepare(
      `INSERT INTO brief_runs (id, ran_at, new_count, aging_count, calls_count, total_leads, sent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        crypto.randomUUID(),
        receipt.ran_at,
        receipt.new_count,
        receipt.aging_count,
        receipt.calls_count,
        receipt.total_leads,
        receipt.sent ? 1 : 0
      )
      .run()
    return true
  } catch (err) {
    console.error('recordBriefRun failed:', err)
    return false
  }
}
