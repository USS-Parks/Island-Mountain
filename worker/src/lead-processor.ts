import type { Env } from './types';
import type { LeadFields, ScoreResult } from './qualifier';
import type { SessionMeta } from './session';

export interface ProcessedLead {
  id: string;
  score: ScoreResult['score'];
  recommendedAction: ScoreResult['recommendedAction'];
  persisted: boolean;
}

export interface LeadContext {
  sessionId: string;
  meta: SessionMeta;
  source: 'chat' | 'voice' | 'form';
  transcript: { role: string; content: string }[];
}

/**
 * Persist + route a scored lead.
 *
 * PROMPT 03 stub: assigns an id and returns the routing decision so the model
 * can respond appropriately. PROMPT 05 implements the real side effects
 * (D1/Google Sheet persistence, hot-lead email via Resend, GA4 event, docs path)
 * behind this same signature — the agent loop does not change.
 */
export async function processLead(
  _env: Env,
  fields: LeadFields,
  scored: ScoreResult,
  ctx: LeadContext,
): Promise<ProcessedLead> {
  const id = crypto.randomUUID();
  console.log(
    `[lead ${id}] score=${scored.score} action=${scored.recommendedAction} ` +
      `source=${ctx.source} email=${fields.email ?? 'n/a'} reason="${scored.reason}"`,
  );
  return {
    id,
    score: scored.score,
    recommendedAction: scored.recommendedAction,
    persisted: false,
  };
}
