import type { Env } from '../types';
import { jsonResponse } from '../cors';
import { scoreLead, type LeadFields } from '../qualifier';
import { processLead, type LeadContext } from '../lead-processor';
import { attachVoiceArtifacts } from '../integrations/d1';

/**
 * POST /api/voice-webhook — Vapi server messages.
 *
 * Routes voice calls through the SAME qualify → score → route pipeline as chat:
 *  - tool-calls / function-call (submit_lead) → scoreLead + processLead(source:'voice')
 *  - end-of-call-report → attach full transcript + recording to the lead
 *
 * Correlation: when submit_lead runs we store callId→leadId in KV so the later
 * end-of-call-report can find the right lead.
 */

interface VapiMessage {
  type?: string;
  call?: { id?: string };
  // tool-calls (current)
  toolCallList?: { id: string; function?: { name?: string; arguments?: unknown } }[];
  toolCalls?: { id: string; function?: { name?: string; arguments?: unknown } }[];
  // function-call (legacy)
  functionCall?: { name?: string; parameters?: unknown };
  // end-of-call-report
  artifact?: { messages?: { role: string; content?: string; message?: string }[]; recordingUrl?: string };
  recordingUrl?: string;
  transcript?: string;
  customer?: { number?: string };
}

const callKey = (callId: string) => `voicecall:${callId}`;

function parseArgs(raw: unknown): LeadFields {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as LeadFields; } catch { return {}; }
  }
  return (raw ?? {}) as LeadFields;
}

export async function handleVoiceWebhook(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');

  // Shared-secret check (Vapi "Server URL Secret").
  if (env.WEBHOOK_SECRET) {
    const got = request.headers.get('x-vapi-secret') || request.headers.get('X-Vapi-Secret');
    if (got !== env.WEBHOOK_SECRET) {
      return jsonResponse({ success: false, error: 'Invalid secret.' }, 401, origin, env);
    }
  }

  let body: { message?: VapiMessage };
  try {
    body = (await request.json()) as { message?: VapiMessage };
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON.' }, 400, origin, env);
  }

  const msg = body.message ?? {};
  const callId = msg.call?.id || 'unknown';

  // --- Tool / function calls (qualification) ---
  const toolCalls = msg.toolCallList || msg.toolCalls;
  if (msg.type === 'tool-calls' && toolCalls && toolCalls.length > 0) {
    const results = [];
    for (const tc of toolCalls) {
      if (tc.function?.name === 'submit_lead') {
        const out = await runVoiceLead(env, parseArgs(tc.function.arguments), callId, msg);
        results.push({ toolCallId: tc.id, result: JSON.stringify(out) });
      } else {
        results.push({ toolCallId: tc.id, result: JSON.stringify({ ok: false, error: 'unknown tool' }) });
      }
    }
    return jsonResponse({ results }, 200, origin, env);
  }

  if ((msg.type === 'function-call' || msg.functionCall) && msg.functionCall?.name === 'submit_lead') {
    const out = await runVoiceLead(env, parseArgs(msg.functionCall.parameters), callId, msg);
    return jsonResponse({ result: JSON.stringify(out) }, 200, origin, env);
  }

  // --- End-of-call report (attach transcript + recording) ---
  if (msg.type === 'end-of-call-report') {
    const leadId = await env.SESSIONS.get(callKey(callId)).catch(() => null);
    const transcript =
      msg.artifact?.messages?.map((m) => ({ role: m.role, content: m.content ?? m.message ?? '' })) ??
      (msg.transcript ? [{ role: 'transcript', content: msg.transcript }] : []);
    const recordingUrl = msg.artifact?.recordingUrl || msg.recordingUrl;
    if (leadId) await attachVoiceArtifacts(env, leadId, transcript, recordingUrl);
    return jsonResponse({ success: true, data: { attached: !!leadId } }, 200, origin, env);
  }

  // Acknowledge all other event types.
  return jsonResponse({ success: true, data: { ignored: msg.type ?? 'unknown' } }, 200, origin, env);
}

async function runVoiceLead(
  env: Env,
  fields: LeadFields,
  callId: string,
  msg: VapiMessage,
): Promise<{ ok: boolean; score?: string; recommended_action?: string; lead_id?: string }> {
  if (!fields.email && !fields.phone && msg.customer?.number) {
    fields.phone = msg.customer.number;
  }
  const scored = scoreLead(fields);
  const ctx: LeadContext = {
    sessionId: `voice:${callId}`,
    meta: { landing_page: 'voice' },
    source: 'voice',
    transcript: [],
  };
  const processed = await processLead(env, fields, scored, ctx);
  await env.SESSIONS.put(callKey(callId), processed.id, { expirationTtl: 60 * 60 * 24 }).catch(() => {});
  return {
    ok: true,
    score: scored.score,
    recommended_action: scored.recommendedAction,
    lead_id: processed.id,
  };
}
