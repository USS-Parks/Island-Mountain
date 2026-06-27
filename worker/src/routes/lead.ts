import type { Env } from '../types';
import { jsonResponse } from '../cors';
import { scoreLead, type LeadFields } from '../qualifier';
import { processLead, type LeadContext } from '../lead-processor';
import type { SessionMeta } from '../session';

interface LeadRequestBody {
  sessionId?: string;
  fields?: LeadFields;
  meta?: SessionMeta;
  source?: 'chat' | 'voice' | 'form';
  transcript?: { role: string; content: string }[];
}

/**
 * POST /api/lead — direct lead submission (no-JS form fallback, external
 * callers, voice). The chat path scores + routes inline via the agent loop;
 * this endpoint exposes the same pipeline over HTTP.
 */
export async function handleLead(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');

  let body: LeadRequestBody;
  try {
    body = (await request.json()) as LeadRequestBody;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body.' }, 400, origin, env);
  }

  const fields = body.fields ?? {};
  const email = (fields.email || '').trim();
  if (!email) {
    return jsonResponse({ success: false, error: 'fields.email is required.' }, 400, origin, env);
  }

  const scored = scoreLead(fields);
  const ctx: LeadContext = {
    sessionId: body.sessionId || crypto.randomUUID(),
    meta: body.meta ?? {},
    source: body.source ?? 'form',
    transcript: body.transcript ?? [],
  };

  const processed = await processLead(env, fields, scored, ctx);
  return jsonResponse({ success: true, data: processed }, 200, origin, env);
}
