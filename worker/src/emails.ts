import { esc } from './integrations/resend';
import type { LeadFields, ScoreResult } from './qualifier';
import type { LeadContext } from './lead-processor';

const FIELD_LABELS: [keyof LeadFields, string][] = [
  ['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['job_title', 'Role'],
  ['organization', 'Organization'], ['industry', 'Industry'], ['use_case', 'Use case'],
  ['concurrent_users', 'Concurrent users'], ['system_interest', 'Tier interest'],
  ['compliance', 'Compliance'], ['timeline', 'Timeline'], ['budget', 'Budget'],
  ['decision_maker', 'Decision-maker'], ['infrastructure', 'Infrastructure'],
  ['current_setup', 'Current setup'], ['docs_requested', 'Docs requested'], ['notes', 'Notes'],
];

function fieldRows(fields: LeadFields): string {
  return FIELD_LABELS.map(([key, label]) => {
    const raw = fields[key];
    if (raw === undefined || raw === null || (Array.isArray(raw) && raw.length === 0) || raw === '') return '';
    const val = Array.isArray(raw) ? raw.join(', ') : String(raw);
    return `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">${esc(label)}</td>` +
      `<td style="padding:4px 0;color:#0f172a">${esc(val)}</td></tr>`;
  }).join('');
}

function transcriptHtml(ctx: LeadContext): string {
  return ctx.transcript
    .map((t) => {
      const who = t.role === 'user' ? '#0f172a' : '#b45309';
      const label = t.role === 'user' ? 'Visitor' : 'Bot';
      return `<p style="margin:6px 0"><strong style="color:${who}">${label}:</strong> ${esc(t.content)}</p>`;
    })
    .join('');
}

/** Hot-lead alert to Basho. */
export function alertEmail(
  fields: LeadFields,
  scored: ScoreResult,
  ctx: LeadContext,
  leadId: string,
): { subject: string; html: string } {
  const badge = scored.score.toUpperCase();
  const subject = `[${badge} lead · ${scored.recommendedAction}] ${fields.organization || fields.name || fields.email || 'New inquiry'}`;
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:640px">
      <h2 style="color:#b45309;margin:0 0 4px">New ${badge} lead — ${esc(scored.recommendedAction)}</h2>
      <p style="color:#64748b;margin:0 0 16px">Source: ${esc(ctx.source)} · Lead id: ${esc(leadId)} · ${esc(scored.reason)}</p>
      <table style="border-collapse:collapse;font-size:14px;margin-bottom:20px">${fieldRows(fields)}</table>
      <h3 style="color:#0f172a;margin:0 0 6px">Conversation</h3>
      <div style="font-size:13px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px">${transcriptHtml(ctx)}</div>
      <p style="margin-top:16px;font-size:12px;color:#94a3b8">UTM: ${esc(ctx.meta.utm_source || '—')} / ${esc(ctx.meta.utm_medium || '—')} · Landing: ${esc(ctx.meta.landing_page || '—')}</p>
    </div>`;
  return { subject, html };
}

/** "Here are the docs you asked for" email to a researching (cold) lead. */
export function docsEmail(fields: LeadFields): { subject: string; html: string } {
  const subject = 'Your Island Mountain information pack';
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:600px;color:#0f172a">
      <p>Hi ${esc(fields.name || 'there')},</p>
      <p>Thanks for your interest in Island Mountain's on-premises AI servers. As requested,
      here are the resources to explore at your own pace — no pressure, no spam:</p>
      <ul style="line-height:1.8">
        <li><a href="https://islandmountain.io/products.html">Summit server lineup</a></li>
        <li><a href="https://islandmountain.io/pricing.html">Pricing &amp; total cost of ownership</a></li>
        <li><a href="https://islandmountain.io/technology.html">Technology &amp; model stack</a></li>
        <li><a href="https://islandmountain.io/faq.html">Frequently asked questions</a></li>
      </ul>
      <p>When you're ready to talk specifics, just reply to this email or call
      <strong>1-341-441-8740</strong> and Basho will help directly.</p>
      <p style="color:#64748b;font-size:13px">— Island Mountain</p>
    </div>`;
  return { subject, html };
}
