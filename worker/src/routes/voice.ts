import type { Env } from '../types';
import { jsonResponse } from '../cors';
import { scoreLead, SUBMIT_LEAD_TOOL, type LeadFields } from '../qualifier';
import { processLead, type LeadContext } from '../lead-processor';
import { attachVoiceArtifacts, setLeadStatus } from '../integrations/d1';
import { callMessages, toolUses } from '../anthropic';
import { secureEqual } from '../security';
import {
  getAvailableSlots,
  createBooking,
  spokenTime,
  defaultSlotWindow,
} from '../integrations/calcom';

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

interface VapiToolCall {
  id: string;
  // Some Vapi shapes nest under `function`, others put name/arguments flat.
  name?: string;
  arguments?: unknown;
  function?: { name?: string; arguments?: unknown };
}

interface VapiMessage {
  type?: string;
  call?: { id?: string };
  // tool-calls (current)
  toolCallList?: VapiToolCall[];
  toolCalls?: VapiToolCall[];
  // function-call (legacy)
  functionCall?: { name?: string; parameters?: unknown };
  // end-of-call-report
  artifact?: { messages?: { role: string; content?: string; message?: string }[]; recordingUrl?: string };
  recordingUrl?: string;
  transcript?: string;
  customer?: { number?: string };
}

const callKey = (callId: string) => `voicecall:${callId}`;
const bookingKey = (callId: string) => `voicebooking:${callId}`;

function parseArgs(raw: unknown): LeadFields {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as LeadFields; } catch { return {}; }
  }
  return (raw ?? {}) as LeadFields;
}

/** Generic tool-arg parse (Vapi may deliver args as a JSON string or object). */
function parseObj(raw: unknown): Record<string, unknown> {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
  }
  return (raw ?? {}) as Record<string, unknown>;
}

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export async function handleVoiceWebhook(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');

  // Shared-secret check (Vapi "Server URL Secret"). Missing configuration is
  // an unavailable authentication boundary, never an allow-all development mode.
  if (!env.WEBHOOK_SECRET) {
    return jsonResponse({ success: false, error: 'Webhook authentication unavailable.' }, 503, origin, env);
  }
  const got = request.headers.get('x-vapi-secret') || request.headers.get('X-Vapi-Secret') || '';
  if (!(await secureEqual(got, env.WEBHOOK_SECRET))) {
    return jsonResponse({ success: false, error: 'Invalid secret.' }, 401, origin, env);
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
  if (toolCalls && toolCalls.length > 0) {
    const results = [];
    for (const tc of toolCalls) {
      const fnName = tc.function?.name ?? tc.name;
      const fnArgs = tc.function?.arguments ?? tc.arguments;
      if (fnName === 'submit_lead') {
        const out = await runVoiceLead(env, parseArgs(fnArgs), callId, msg);
        results.push({ toolCallId: tc.id, result: JSON.stringify(out) });
      } else if (fnName === 'get_available_slots') {
        const out = await runGetSlots(env, parseObj(fnArgs));
        results.push({ toolCallId: tc.id, result: JSON.stringify(out) });
      } else if (fnName === 'book_appointment') {
        const out = await runBookAppointment(env, parseObj(fnArgs), callId);
        results.push({ toolCallId: tc.id, result: JSON.stringify(out) });
      } else {
        results.push({ toolCallId: tc.id, result: JSON.stringify({ ok: false, error: 'unknown tool' }) });
      }
    }
    return jsonResponse({ results }, 200, origin, env);
  }

  if (msg.functionCall?.name === 'submit_lead') {
    const out = await runVoiceLead(env, parseArgs(msg.functionCall.parameters), callId, msg);
    return jsonResponse({ result: JSON.stringify(out) }, 200, origin, env);
  }

  // --- End-of-call report: extract the lead from the transcript + attach artifacts ---
  if (msg.type === 'end-of-call-report') {
    const transcript =
      msg.artifact?.messages?.map((m) => ({ role: m.role, content: m.content ?? m.message ?? '' })) ??
      (msg.transcript ? [{ role: 'transcript', content: msg.transcript }] : []);
    const recordingUrl = msg.artifact?.recordingUrl || msg.recordingUrl;

    let leadId = await env.SESSIONS.get(callKey(callId)).catch(() => null);

    // If the in-call tool didn't capture a lead, extract it from the transcript
    // ourselves (reliable — doesn't depend on Vapi populating the tool args).
    if (!leadId) {
      const fields = await extractLeadFromTranscript(env, transcript);
      if (fields && hasLeadData(fields)) {
        const scored = scoreLead(fields);
        const ctx: LeadContext = {
          sessionId: `voice:${callId}`,
          meta: { landing_page: 'voice' },
          source: 'voice',
          transcript,
        };
        const processed = await processLead(env, fields, scored, ctx);
        leadId = processed.id;
        await env.SESSIONS.put(callKey(callId), leadId, { expirationTtl: 60 * 60 * 24 }).catch(() => {});
        console.log(`VOICE_EXTRACT lead=${leadId} score=${scored.score} email=${fields.email ?? 'n/a'}`);
      }
    }

    if (leadId) {
      await attachVoiceArtifacts(env, leadId, transcript, recordingUrl);
      // If the caller booked a scoping call mid-conversation, the Cal.com
      // booking-webhook fired before the lead existed (so it couldn't mark it).
      // Reconcile here now that we have the leadId.
      const booked = await env.SESSIONS.get(bookingKey(callId)).catch(() => null);
      if (booked) await setLeadStatus(env, leadId, 'booked').catch(() => {});
    }
    return jsonResponse({ success: true, data: { lead_id: leadId ?? null } }, 200, origin, env);
  }

  // Acknowledge all other event types.
  return jsonResponse({ success: true, data: { ignored: msg.type ?? 'unknown' } }, 200, origin, env);
}

/** True if there's enough to bother persisting (avoids junk empty-arg leads). */
function hasLeadData(f: LeadFields): boolean {
  return Boolean(f.email || f.name || f.phone || f.organization || f.system_interest);
}

/**
 * Extract structured lead fields from a call transcript via Claude. This is the
 * reliable capture path for voice — it doesn't depend on the voice platform
 * correctly populating the submit_lead tool arguments.
 */
async function extractLeadFromTranscript(
  env: Env,
  transcript: { role: string; content: string }[],
): Promise<LeadFields | null> {
  const convo = transcript
    .filter((t) => t.role !== 'system' && t.content)
    .map((t) => `${t.role === 'user' ? 'Caller' : 'Assistant'}: ${t.content}`)
    .join('\n');
  if (!convo.trim()) return null;

  const system =
    'You extract CRM lead fields from an Island Mountain sales-call transcript. ' +
    'Call submit_lead with exactly what the caller stated — name, email, phone, ' +
    'organization, industry, use case, tier interest, compliance needs, timeline, ' +
    'budget, decision-maker role, etc. Omit anything not stated; never invent values.';

  const res = await callMessages({
    env,
    model: env.CHAT_MODEL_ROUTINE,
    system,
    messages: [{ role: 'user', content: `Transcript:\n${convo}\n\nExtract the lead now.` }],
    tools: [SUBMIT_LEAD_TOOL],
    toolChoice: { type: 'tool', name: 'submit_lead' },
  });
  if (!res.ok) {
    console.error('extractLeadFromTranscript failed:', res.status, res.error);
    return null;
  }
  const use = toolUses(res.blocks).find((u) => u.name === 'submit_lead');
  return use ? (use.input as LeadFields) : null;
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
  // Skip empty in-call tool calls — the end-of-call transcript extraction handles capture.
  if (!hasLeadData(fields)) {
    return { ok: true };
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

/**
 * `get_available_slots` tool — read open scoping-call times so the agent can
 * offer specific options out loud. Returns up to 3 nearest slots; each `id` is
 * the exact ISO start the agent passes back to `book_appointment`.
 */
async function runGetSlots(
  env: Env,
  args: Record<string, unknown>,
): Promise<{ ok: boolean; slots: { id: string; when: string }[]; timeZone: string; message?: string }> {
  const timeZone = str(args.timeZone) || env.CALCOM_TIMEZONE || 'America/Denver';
  const { fromISO, toISO } = defaultSlotWindow(Date.now());
  const slots = await getAvailableSlots(env, { fromISO, toISO, timeZone }, 3);
  return {
    ok: true,
    slots: slots.map((s) => ({ id: s.startISO, when: s.spoken })),
    timeZone,
    ...(slots.length === 0 ? { message: 'No open times in the next two weeks.' } : {}),
  };
}

/**
 * `book_appointment` tool — reserve the chosen slot on Cal.com. The booking
 * carries sessionId (+leadId if known) so the existing booking-webhook runs the
 * mark-booked → alert → GA4 path; we also stash a marker so end-of-call can
 * reconcile the lead status if the lead is captured after the booking.
 */
async function runBookAppointment(
  env: Env,
  args: Record<string, unknown>,
  callId: string,
): Promise<{ ok: boolean; booked?: boolean; when?: string; error?: string; message?: string }> {
  const startISO = str(args.startISO) || str(args.id) || str(args.start);
  const name = str(args.name);
  const email = str(args.email);
  const timeZone = str(args.timeZone) || env.CALCOM_TIMEZONE || 'America/Denver';
  if (!startISO || !name || !email) {
    return { ok: false, error: 'missing-fields', message: 'I need your name, email, and a chosen time to book.' };
  }

  const leadId = (await env.SESSIONS.get(callKey(callId)).catch(() => null)) ?? undefined;
  const result = await createBooking(env, {
    startISO,
    name,
    email,
    timeZone,
    sessionId: `voice:${callId}`,
    leadId,
    notes: str(args.notes),
  });

  if (!result.ok) {
    return {
      ok: false,
      error: result.error,
      message: 'That time isn’t available anymore — would you like to pick another?',
    };
  }

  await env.SESSIONS.put(
    bookingKey(callId),
    JSON.stringify({ startISO: result.startISO, email, name, uid: result.uid }),
    { expirationTtl: 60 * 60 * 24 },
  ).catch(() => {});

  return { ok: true, booked: true, when: spokenTime(result.startISO ?? startISO, timeZone) };
}
