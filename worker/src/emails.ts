import { esc } from './integrations/resend'
import type { LeadFields, ScoreResult } from './qualifier'
import type { LeadContext } from './lead-processor'

const FIELD_LABELS: [keyof LeadFields, string][] = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['job_title', 'Role'],
  ['organization', 'Organization'],
  ['industry', 'Industry'],
  ['use_case', 'Use case'],
  ['concurrent_users', 'Concurrent users'],
  ['system_interest', 'Tier interest'],
  ['compliance', 'Compliance'],
  ['timeline', 'Timeline'],
  ['budget', 'Budget'],
  ['decision_maker', 'Decision-maker'],
  ['infrastructure', 'Infrastructure'],
  ['current_setup', 'Current setup'],
  ['docs_requested', 'Docs requested'],
  ['notes', 'Notes']
]

function fieldRows(fields: LeadFields): string {
  return FIELD_LABELS.map(([key, label]) => {
    const raw = fields[key]
    if (raw === undefined || raw === null || (Array.isArray(raw) && raw.length === 0) || raw === '')
      return ''
    const val = Array.isArray(raw) ? raw.join(', ') : String(raw)
    return (
      `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">${esc(label)}</td>` +
      `<td style="padding:4px 0;color:#0f172a">${esc(val)}</td></tr>`
    )
  }).join('')
}

function transcriptHtml(ctx: LeadContext): string {
  return ctx.transcript
    .map((t) => {
      const who = t.role === 'user' ? '#0f172a' : '#b45309'
      const label = t.role === 'user' ? 'Visitor' : 'Bot'
      return `<p style="margin:6px 0"><strong style="color:${who}">${label}:</strong> ${esc(t.content)}</p>`
    })
    .join('')
}

/** Hot-lead alert to Basho. */
export function alertEmail(
  fields: LeadFields,
  scored: ScoreResult,
  ctx: LeadContext,
  leadId: string
): { subject: string; html: string } {
  const badge = scored.score.toUpperCase()
  const subject = `[${badge} lead · ${scored.recommendedAction}] ${fields.organization || fields.name || fields.email || 'New inquiry'}`
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:640px">
      <h2 style="color:#b45309;margin:0 0 4px">New ${badge} lead — ${esc(scored.recommendedAction)}</h2>
      <p style="color:#64748b;margin:0 0 16px">Source: ${esc(ctx.source)} · Lead id: ${esc(leadId)} · ${esc(scored.reason)}</p>
      <table style="border-collapse:collapse;font-size:14px;margin-bottom:20px">${fieldRows(fields)}</table>
      <h3 style="color:#0f172a;margin:0 0 6px">Conversation</h3>
      <div style="font-size:13px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px">${transcriptHtml(ctx)}</div>
      <p style="margin-top:16px;font-size:12px;color:#94a3b8">UTM: ${esc(ctx.meta.utm_source || '—')} / ${esc(ctx.meta.utm_medium || '—')} · Landing: ${esc(ctx.meta.landing_page || '—')}</p>
    </div>`
  return { subject, html }
}

/** "Here are the docs you asked for" email to a researching (cold) lead. */
export function docsEmail(fields: LeadFields): { subject: string; html: string } {
  const subject = 'Your Island Mountain information pack'
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:600px;color:#0f172a">
      <p>Hi ${esc(fields.name || 'there')},</p>
      <p>Thanks for your interest in Island Mountain's on-premises AI servers. As requested,
      here are the resources to explore at your own pace — no pressure, no spam:</p>
      <ul style="line-height:1.8">
        <li><a href="https://islandmountain.io/products.html">Summit server lineup</a></li>
        <li><a href="https://islandmountain.io/sovereign-cost-worksheet.html">Cost worksheet — your 5-year cloud number</a></li>
        <li><a href="https://islandmountain.io/resources.html">Compliance &amp; regulatory briefs</a></li>
        <li><a href="https://islandmountain.io/faq.html">Frequently asked questions</a></li>
      </ul>
      <p>When you're ready to talk specifics, just reply to this email or call
      <strong>1-341-441-8740</strong> and Basho will help directly.</p>
      <p style="color:#64748b;font-size:13px">— Island Mountain</p>
    </div>`
  return { subject, html }
}

// ---------------------------------------------------------------------------
// Cost worksheet + build-slot emails (the two capture paths).
// The Summit comparison figures below are PRIVATE: they travel only in email,
// never in site HTML — the public posture is quote-based with no price list.
// ---------------------------------------------------------------------------

const SUMMIT_BASE_RANGE = '$59,000–$69,000'
const SUMMIT_BASE_MID = 64000

const INDUSTRY_BRIEFS: [RegExp, { label: string; url: string }][] = [
  [
    /law/i,
    {
      label: 'Attorney-client privilege & AI',
      url: 'https://islandmountain.io/attorney-client-privilege-ai-risk.html'
    }
  ],
  [
    /medical|health/i,
    { label: 'HIPAA & local AI', url: 'https://islandmountain.io/hipaa-local-ai-compliance.html' }
  ],
  [
    /tribal/i,
    {
      label: 'CLOUD Act & tribal data sovereignty',
      url: 'https://islandmountain.io/cloud-act-tribal-data.html'
    }
  ],
  [
    /defense/i,
    {
      label: 'ITAR / CMMC AI infrastructure',
      url: 'https://islandmountain.io/itar-cmmc-ai-infrastructure.html'
    }
  ],
  [
    /financial/i,
    { label: 'Financial services AI', url: 'https://islandmountain.io/financial-services.html' }
  ],
  [/insurance/i, { label: 'Insurance AI', url: 'https://islandmountain.io/insurance.html' }],
  [
    /energy|utilit/i,
    {
      label: 'Energy & utilities (NERC CIP) AI',
      url: 'https://islandmountain.io/energy-utilities.html'
    }
  ],
  [/government/i, { label: 'Government AI', url: 'https://islandmountain.io/government.html' }],
  [
    /education|research/i,
    { label: 'Education & research AI', url: 'https://islandmountain.io/education.html' }
  ],
  [
    /casino|gaming/i,
    { label: 'Casino gaming AI', url: 'https://islandmountain.io/casino-gaming.html' }
  ]
]

/** Map a free-text industry to its compliance brief (resources library as fallback). */
export function briefFor(industry: string): { label: string; url: string } {
  for (const [re, brief] of INDUSTRY_BRIEFS) {
    if (re.test(industry)) return brief
  }
  return {
    label: 'Compliance & regulatory briefs',
    url: 'https://islandmountain.io/resources.html'
  }
}

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

/** The emailed worksheet: the visitor's own numbers + the private Summit comparison. */
export function worksheetEmail(
  industry: string,
  calc: { seats: number; monthlySpend: number; growth: number; years: number[]; total: number }
): { subject: string; html: string } {
  const subject = 'Your 5-year cloud AI number, in writing'
  const brief = briefFor(industry)
  const yearRows = calc.years
    .map(
      (y, i) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b">Year ${i + 1}</td>` +
        `<td style="padding:4px 0;color:#0f172a;text-align:right">${usd(y)}</td></tr>`
    )
    .join('')

  const breakEvenMonths =
    calc.monthlySpend > 0 ? Math.ceil(SUMMIT_BASE_MID / calc.monthlySpend) : null
  const comparison =
    breakEvenMonths === null
      ? `<p>You entered no current cloud spend, so there is no burn to compare against yet —
         but the ownership math is simple: a Summit Base (the two-GPU configuration most teams
         start with) typically lands in the <strong>${SUMMIT_BASE_RANGE}</strong> range as a
         one-time purchase, with your exact number coming from a scoped quote.</p>`
      : breakEvenMonths <= 36
        ? `<p>Here is the comparison we don't publish on the site: a Summit Base — the two-GPU
           configuration most teams start with — typically lands in the
           <strong>${SUMMIT_BASE_RANGE}</strong> range as a one-time purchase (your exact number
           comes from a scoped quote). At your current spend of ${usd(calc.monthlySpend)}/month,
           that is <strong>break-even in roughly ${breakEvenMonths} month${breakEvenMonths === 1 ? '' : 's'}</strong>.
           Everything after that is spend you keep instead of rent — and the hardware, the models,
           and every prompt stay on your premises.</p>`
        : `<p>Honest math first: a Summit Base typically lands in the <strong>${SUMMIT_BASE_RANGE}</strong>
           range one-time, which at your current spend of ${usd(calc.monthlySpend)}/month works out to
           break-even around ${breakEvenMonths} months. If your usage stays this light, cloud may remain
           the cheaper path until it grows — we would rather tell you that now than after a serious
           capital purchase. Where the ownership case still stands at your scale: regulated data that
           cannot leave your premises, and per-seat growth that never adds a fee.</p>`

  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:620px;color:#0f172a">
      <p>Hi,</p>
      <p>Here is your worksheet from <a href="https://islandmountain.io/sovereign-cost-worksheet.html">islandmountain.io</a>,
      with your numbers filled in.</p>
      <p style="margin:18px 0 6px;color:#64748b">Your inputs: ${calc.seats} people ·
      ${usd(calc.monthlySpend)}/month cloud AI spend · ${Math.round(calc.growth * 100)}%/yr growth</p>
      <table style="border-collapse:collapse;font-size:14px;min-width:280px">${yearRows}
        <tr><td style="padding:8px 12px 4px 0;color:#0f172a;border-top:1px solid #e2e8f0"><strong>Five-year total</strong></td>
        <td style="padding:8px 0 4px;color:#b45309;text-align:right;border-top:1px solid #e2e8f0"><strong>${usd(calc.total)}</strong></td></tr>
        <tr><td style="padding:2px 12px 4px 0;color:#64748b">Per person on your team</td>
        <td style="padding:2px 0 4px;color:#64748b;text-align:right">${usd(calc.total / calc.seats)}</td></tr>
      </table>
      ${comparison}
      <p>For your sector: <a href="${brief.url}">${esc(brief.label)}</a> — the direct-answer
      brief with the statute citations.</p>
      <p>When you want the exact number for your build, it is one conversation:
      <a href="https://islandmountain.io/contact.html">book a scoping call</a> or call
      <strong>1-341-441-8740</strong>. No pressure, no follow-up spam.</p>
      <p style="color:#64748b;font-size:13px">— Basho Parks, Island Mountain · hand-built in California</p>
    </div>`
  return { subject, html }
}

/** Build-slot claim confirmation to the claimant (the 90-day quote lock). */
export function slotEmail(name: string, calLink?: string): { subject: string; html: string } {
  const subject = 'Your build slot is held — here is what happens next'
  const scheduleLine = calLink
    ? `<p>Want to skip the phone tag? <a href="${esc(calLink)}">Grab a scoping call time directly</a>.</p>`
    : ''
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:600px;color:#0f172a">
      <p>Hi ${esc(name)},</p>
      <p>Your claim is in, and your place in the build queue is held. I build every Summit
      myself, one at a time — a slot is how I keep that honest.</p>
      <p><strong>What it costs you: nothing. What it commits you to: nothing.</strong></p>
      <p>Here is what happens next:</p>
      <ul style="line-height:1.8">
        <li>I will reach out within one business day to scope your build — workload, headcount, compliance posture.</li>
        <li>You get a written quote scoped to it, and that quote is <strong>locked for 90 days</strong> — GPU market be damned.</li>
        <li>If the timing is not right, say so and I release the slot. No questions, no follow-up spam.</li>
      </ul>
      ${scheduleLine}
      <p>Direct line: <strong>1-341-441-8740</strong> — you are talking to the person who
      builds the hardware.</p>
      <p style="color:#64748b;font-size:13px">— Basho Parks, Island Mountain · hand-built in California</p>
    </div>`
  return { subject, html }
}
