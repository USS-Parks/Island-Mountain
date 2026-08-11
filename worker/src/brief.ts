import { esc } from './integrations/resend'
import type { PipelineLead, PipelineTotals } from './integrations/pipeline'
import type { UpcomingBooking } from './integrations/calcom'

/**
 * NOOA Sales Brief (Purser) — deterministic composer. No LLM: the brief is a
 * faithful render of the D1 cuts + Cal.com times, so what lands in the inbox
 * is exactly what the store holds. `composeBrief` is pure; the scheduled
 * handler gathers the data and hands it here.
 */

/** A booked call joined to its lead row, ready to render as a prep card. */
export interface CallPrep {
  spoken: string
  name: string | null
  email: string | null
  organization: string | null
  job_title: string | null
  industry: string | null
  use_case: string | null
  timeline: string | null
  compliance: string[]
  score: string | null
  score_reason: string | null
}

export interface BriefData {
  now: Date
  newLeads: PipelineLead[]
  agingWarm: PipelineLead[]
  calls: CallPrep[]
  totals: PipelineTotals
}

function parseCompliance(raw: string | null | undefined): string[] {
  if (!raw) return []
  try {
    const v = JSON.parse(raw)
    return Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : []
  } catch {
    return []
  }
}

/** Join time-ordered bookings to their lead rows — by metadata leadId, else email. */
export function buildCallPreps(bookings: UpcomingBooking[], leads: PipelineLead[]): CallPrep[] {
  const byId = new Map(leads.map((l) => [l.id, l]))
  const byEmail = new Map(leads.filter((l) => l.email).map((l) => [l.email!.toLowerCase(), l]))
  return bookings.map((b) => {
    const lead =
      (b.leadId ? byId.get(b.leadId) : undefined) ??
      (b.email ? byEmail.get(b.email.toLowerCase()) : undefined)
    return {
      spoken: b.spoken,
      name: lead?.name ?? b.name,
      email: lead?.email ?? b.email,
      organization: lead?.organization ?? null,
      job_title: lead?.job_title ?? null,
      industry: lead?.industry ?? null,
      use_case: lead?.use_case ?? null,
      timeline: lead?.timeline ?? null,
      compliance: parseCompliance(lead?.compliance),
      score: lead?.score ?? null,
      score_reason: lead?.score_reason ?? null
    }
  })
}

// --- Rendering (inline styles; email clients ignore <style> blocks) ---

const WRAP =
  'font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;color:#1a2b34;line-height:1.5'

function h2(t: string): string {
  return `<h2 style="font-size:15px;margin:22px 0 8px;color:#0b5563;border-bottom:1px solid #d8e3e7;padding-bottom:4px">${esc(t)}</h2>`
}

function scoreTag(score: string | null): string {
  const s = (score || 'unknown').toLowerCase()
  const color =
    s === 'hot' ? '#c0392b' : s === 'warm' ? '#b9770e' : s === 'cold' ? '#5a6b73' : '#8894a0'
  return `<span style="color:${color};font-weight:600;text-transform:uppercase;font-size:11px">${esc(s)}</span>`
}

function field(label: string, val: string | null): string {
  return val ? `<div><span style="color:#5a6b73">${esc(label)}:</span> ${esc(val)}</div>` : ''
}

function leadLine(l: PipelineLead): string {
  const who = l.name || l.email || 'Unknown'
  const role = l.job_title ? ` (${l.job_title})` : ''
  const org = l.organization ? ` · ${l.organization}` : ''
  const src = l.source ? ` · ${l.source}` : ''
  return `<li style="margin:4px 0">${scoreTag(l.score)} ${esc(who + role + org + src)}</li>`
}

function leadList(leads: PipelineLead[], empty: string): string {
  if (!leads.length) return `<p style="margin:4px 0;color:#5a6b73">${esc(empty)}</p>`
  return `<ul style="margin:4px 0;padding-left:18px;list-style:none">${leads.map(leadLine).join('')}</ul>`
}

function callCard(c: CallPrep): string {
  const who = [c.name || c.email || 'Unknown', c.job_title ? `(${c.job_title})` : '']
    .filter(Boolean)
    .join(' ')
  return `<div style="border:1px solid #d8e3e7;border-radius:6px;padding:10px 12px;margin:8px 0">
    <div style="font-weight:600;color:#0b5563">${esc(c.spoken)} &nbsp;${scoreTag(c.score)}</div>
    ${field('Who', who)}
    ${field('Org', c.organization)}
    ${field('Industry', c.industry)}
    ${field('Use case', c.use_case)}
    ${field('Timeline', c.timeline)}
    ${c.compliance.length ? field('Compliance', c.compliance.join(', ')) : ''}
    ${field('Why they scored', c.score_reason)}
  </div>`
}

function board(t: PipelineTotals): string {
  const cell = (m: Record<string, number>) =>
    Object.keys(m).length
      ? Object.entries(m)
          .sort()
          .map(([k, v]) => `${esc(k)} ${v}`)
          .join(' · ')
      : '—'
  return `<p style="margin:4px 0"><strong>${t.total}</strong> total · by score: ${cell(t.byScore)} · by status: ${cell(t.byStatus)}</p>`
}

/** Render the four-section brief. Deterministic given its inputs. */
export function composeBrief(data: BriefData): { subject: string; html: string } {
  const { now, newLeads, agingWarm, calls, totals } = data
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric'
  }).format(now)

  const quiet = !newLeads.length && !agingWarm.length && !calls.length
  const subject = quiet
    ? `[Purser] Quiet pipeline — ${dateLabel}`
    : `[Purser] ${newLeads.length} new · ${calls.length} call${calls.length === 1 ? '' : 's'} · ${agingWarm.length} aging — ${dateLabel}`

  const sections = [
    `${h2("Today's & tomorrow's calls")}${
      calls.length
        ? calls.map(callCard).join('')
        : '<p style="margin:4px 0;color:#5a6b73">No calls booked in the next 2 days.</p>'
    }`,
    `${h2('New since yesterday')}${leadList(newLeads, 'No new leads in the last 24 hours.')}`,
    `${h2('Warm & aging — following up')}${leadList(agingWarm, 'Nothing warm going cold.')}`,
    `${h2('Pipeline board')}${board(totals)}`
  ]

  const html = `<div style="${WRAP}">
  <p style="margin:0 0 4px;color:#5a6b73">NOOA Sales Brief · Purser · ${esc(dateLabel)}</p>
  ${quiet ? `<p style="margin:8px 0">Quiet day — nothing new, no calls booked. ${totals.total} lead${totals.total === 1 ? '' : 's'} on the board.</p>` : ''}
  ${sections.join('\n')}
  <p style="margin:22px 0 0;color:#8894a0;font-size:12px">Read-only brief · D1 leads + Cal.com · nothing sent on your behalf.</p>
</div>`

  return { subject, html }
}
