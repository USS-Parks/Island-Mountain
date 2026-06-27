import type { Env } from './types';
import type { LeadFields, ScoreResult } from './qualifier';
import type { SessionMeta } from './session';
import { insertLead, findLead, type LeadRow } from './integrations/d1';
import { appendToSheet } from './integrations/sheets';
import { sendEmail } from './integrations/resend';
import { ga4Event } from './integrations/ga4';
import { alertEmail, docsEmail } from './emails';

export interface ProcessedLead {
  id: string;
  score: ScoreResult['score'];
  recommendedAction: ScoreResult['recommendedAction'];
  persisted: boolean;
  emailed: boolean;
  tracked: boolean;
  duplicate: boolean;
}

export interface LeadContext {
  sessionId: string;
  meta: SessionMeta;
  source: 'chat' | 'voice' | 'form';
  transcript: { role: string; content: string }[];
}

const DEDUPE_TTL = 60 * 60 * 24 * 7; // 7 days

/**
 * Persist + route a scored lead. Idempotent per (session, email): a retry
 * returns the prior result without re-firing side effects. Every integration
 * is best-effort and never throws, so a failing email/sheet/GA4 cannot break
 * the conversation.
 */
export async function processLead(
  env: Env,
  fields: LeadFields,
  scored: ScoreResult,
  ctx: LeadContext,
): Promise<ProcessedLead> {
  const email = (fields.email || '').toLowerCase().trim();
  const dedupeKey = `lead_done:${ctx.sessionId}:${email}`;

  // Idempotency: short-circuit on retry.
  const prior = await env.SESSIONS.get(dedupeKey).catch(() => null);
  if (prior) {
    try {
      return { ...(JSON.parse(prior) as ProcessedLead), duplicate: true };
    } catch {
      /* fall through and reprocess */
    }
  }

  // De-dupe against an existing D1 row for this session+email.
  const existing = email ? await findLead(env, ctx.sessionId, email) : null;
  const id = existing?.id ?? crypto.randomUUID();
  const clientId = ctx.sessionId;

  const row: LeadRow = {
    id,
    session_id: ctx.sessionId,
    created_at: new Date().toISOString(),
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    job_title: fields.job_title,
    organization: fields.organization,
    industry: fields.industry,
    use_case: fields.use_case,
    concurrent_users: fields.concurrent_users,
    system_interest: fields.system_interest,
    compliance: fields.compliance,
    timeline: fields.timeline,
    budget: fields.budget,
    decision_maker: fields.decision_maker,
    infrastructure: fields.infrastructure,
    current_setup: fields.current_setup,
    docs_requested: fields.docs_requested,
    score: scored.score,
    score_reason: scored.reason,
    source: ctx.source,
    utm_source: ctx.meta.utm_source,
    utm_medium: ctx.meta.utm_medium,
    utm_campaign: ctx.meta.utm_campaign,
    landing_page: ctx.meta.landing_page,
    referrer: ctx.meta.referrer,
    status: 'new',
    transcript: ctx.transcript,
  };

  // Persist (D1 mirror + Google Sheet). Skip a duplicate D1 insert.
  const persistedD1 = existing ? true : await insertLead(env, row);
  const persistedSheet = await appendToSheet(env, sheetRow(row, scored));
  const persisted = persistedD1 || persistedSheet;

  // GA4 conversion event.
  const tracked = await ga4Event(
    env,
    'generate_lead',
    {
      lead_score: scored.score,
      recommended_action: scored.recommendedAction,
      source: ctx.source,
      organization: fields.organization ?? '',
      tier_interest: fields.system_interest ?? '',
      utm_source: ctx.meta.utm_source ?? '',
      currency: 'USD',
      value: estimatedValue(scored.score),
    },
    clientId,
  );

  // Route: hot/scoping → alert Basho; researching/docs → docs to the lead.
  let emailed = false;
  if (scored.score === 'hot' || scored.recommendedAction === 'scoping_call') {
    const { subject, html } = alertEmail(fields, scored, ctx, id);
    emailed = await sendEmail(env, {
      to: env.ALERT_EMAIL,
      subject,
      html,
      replyTo: fields.email,
    });
  } else if (scored.recommendedAction === 'send_docs' && email) {
    const { subject, html } = docsEmail(fields);
    emailed = await sendEmail(env, { to: email, subject, html });
  }

  const result: ProcessedLead = {
    id,
    score: scored.score,
    recommendedAction: scored.recommendedAction,
    persisted,
    emailed,
    tracked,
    duplicate: false,
  };

  await env.SESSIONS.put(dedupeKey, JSON.stringify(result), { expirationTtl: DEDUPE_TTL }).catch(() => {});
  console.log(
    `[lead ${id}] score=${scored.score} action=${scored.recommendedAction} ` +
      `persisted=${persisted} emailed=${emailed} tracked=${tracked} source=${ctx.source}`,
  );
  return result;
}

/** Flat row for the Google Sheet (arrays joined, score columns added). */
function sheetRow(row: LeadRow, scored: ScoreResult): Record<string, unknown> {
  return {
    ...row,
    compliance: (row.compliance ?? []).join(', '),
    docs_requested: (row.docs_requested ?? []).join(', '),
    transcript: undefined, // keep the sheet readable; full transcript lives in D1
    score_label: scored.score,
    recommended_action: scored.recommendedAction,
  };
}

/** Rough deal value for GA4 reporting (midpoint of tier range, USD). */
function estimatedValue(score: ScoreResult['score']): number {
  if (score === 'hot') return 120000;
  if (score === 'warm') return 64000;
  return 0;
}
