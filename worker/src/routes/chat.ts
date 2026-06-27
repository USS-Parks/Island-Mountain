import type { Env } from '../types';
import { jsonResponse, corsHeaders } from '../cors';
import { buildSystemPrompt } from '../persona';
import {
  loadSession,
  newSession,
  saveSession,
  contextMessages,
  MAX_MESSAGE_CHARS,
  type SessionMeta,
} from '../session';
import { runTurn } from '../agent';
import type { LeadContext } from '../lead-processor';
import { buildBookingUrl } from '../booking';
import { ga4Event, attributionParams } from '../integrations/ga4';
import { enforceLimits, degradeMessage, verifyTurnstile } from '../ratelimit';

interface ChatRequestBody {
  sessionId?: string;
  message?: string;
  meta?: SessionMeta;
}

/** Sonnet for routine turns; escalate to Opus for complex/high-stakes ones (D4). */
function pickModel(env: Env, message: string, historyLen: number): string {
  const text = message.toLowerCase();
  const complexSignals = [
    'pinnacle', 'citadel', 'custom', 'scoping', 'quote', 'compliance', 'hipaa',
    'itar', 'cmmc', 'dfars', 'fedramp', 'tco', 'compare', 'versus', ' vs ',
    'architecture', 'procurement', 'budget', 'rfp', 'sovereignty',
  ];
  const isComplex =
    message.length > 600 ||
    historyLen >= 12 ||
    complexSignals.some((s) => text.includes(s));
  return isComplex ? env.CHAT_MODEL_ESCALATION : env.CHAT_MODEL_ROUTINE;
}

export async function handleChat(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const origin = request.headers.get('Origin');

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body.' }, 400, origin, env);
  }

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) {
    return jsonResponse({ success: false, error: 'message is required.' }, 400, origin, env);
  }
  const clipped = message.slice(0, MAX_MESSAGE_CHARS);

  const sessionId =
    typeof body.sessionId === 'string' && body.sessionId.length > 0
      ? body.sessionId
      : crypto.randomUUID();
  const ip = request.headers.get('cf-connecting-ip') || 'local';

  // Rate limit / circuit breaker BEFORE any LLM call (an over-limit turn costs $0).
  const limit = await enforceLimits(env, ip, sessionId, new Date());
  if (!limit.allowed) {
    const reply = degradeMessage(limit.reason);
    console.warn(`rate-limited (${limit.reason}) ip=${ip} session=${sessionId}`);
    return degradeResponse(request, origin, env, sessionId, reply);
  }

  let session = await loadSession(env, sessionId);
  const isNewSession = !session;
  if (!session) session = newSession(sessionId, body.meta ?? {});

  // Turnstile (optional) gates the FIRST message of a session against bots.
  if (isNewSession && env.TURNSTILE_SECRET) {
    const token = request.headers.get('X-Turnstile-Token');
    if (!(await verifyTurnstile(env, token, ip))) {
      return jsonResponse({ success: false, error: 'Verification required.' }, 403, origin, env);
    }
  }

  session.messages.push({ role: 'user', content: clipped });

  // Funnel: a real conversation has begun (server-side, ad-blocker resilient).
  if (isNewSession) {
    await ga4Event(env, 'qualify_started', { source: 'chat', ...attributionParams(session.meta) }, sessionId);
  }

  const model = pickModel(env, clipped, session.messages.length);
  const system = buildSystemPrompt();
  const leadCtx: LeadContext = {
    sessionId,
    meta: session.meta,
    source: 'chat',
    transcript: session.messages,
  };

  // Run the turn + persist as one unit kept alive by waitUntil, so the reply
  // finishes and is saved to KV even if the visitor navigates away mid-response.
  // The next page then loads it via GET /api/history.
  const sess = session;
  const turnPromise = (async () => {
    const t = await runTurn(env, model, system, contextMessages(sess), leadCtx);
    sess.messages.push({ role: 'assistant', content: t.finalText });
    await saveSession(env, sess);
    return t;
  })();
  ctx.waitUntil(turnPromise);
  const turn = await turnPromise;

  // Offer a booking when the qualifier recommends a scoping call.
  let booking: { url: string } | undefined;
  if (turn.lead && turn.lead.scored.recommendedAction === 'scoping_call') {
    const url = buildBookingUrl(env, turn.lead.fields, sessionId, turn.lead.processed.id);
    if (url) booking = { url };
  }

  const lead = turn.lead
    ? { score: turn.lead.scored.score, action: turn.lead.scored.recommendedAction }
    : undefined;

  const wantsStream = (request.headers.get('Accept') || '').includes('text/event-stream');
  if (wantsStream) {
    return streamReply(origin, env, sessionId, turn, lead, booking);
  }

  return jsonResponse(
    {
      success: true,
      data: { sessionId, reply: turn.finalText, model, fallback: turn.fallback || undefined, lead, booking },
    },
    200,
    origin,
    env,
  );
}

/**
 * Server-streamed SSE. The tool-use agent loop runs to completion first (so
 * qualification works identically to the JSON path), then the final reply is
 * chunked to the widget for a progressive render. (Token-level model streaming
 * is a future enhancement; this keeps a single, correct code path for v1.)
 */
function streamReply(
  origin: string | null,
  env: Env,
  sessionId: string,
  turn: Awaited<ReturnType<typeof runTurn>>,
  lead: { score: string; action: string } | undefined,
  booking: { url: string } | undefined,
): Response {
  const encoder = new TextEncoder();
  const sseHeaders = {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    ...corsHeaders(origin, env),
  };

  const out = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      send({ type: 'meta', sessionId });
      // Chunk by word so the widget renders progressively.
      const words = turn.finalText.split(/(\s+)/);
      for (const w of words) {
        if (w.length) send({ type: 'text', text: w });
      }
      send({ type: 'done', fallback: turn.fallback || undefined, lead, booking });
      controller.close();
    },
  });

  return new Response(out, { status: 200, headers: sseHeaders });
}

/** Graceful degrade (rate limit / circuit breaker) — canned reply, no LLM call. */
function degradeResponse(
  request: Request,
  origin: string | null,
  env: Env,
  sessionId: string,
  reply: string,
): Response {
  const wantsStream = (request.headers.get('Accept') || '').includes('text/event-stream');
  if (!wantsStream) {
    return jsonResponse(
      { success: true, data: { sessionId, reply, rate_limited: true } },
      200,
      origin,
      env,
    );
  }
  const encoder = new TextEncoder();
  const body =
    `data: ${JSON.stringify({ type: 'meta', sessionId })}\n\n` +
    `data: ${JSON.stringify({ type: 'text', text: reply })}\n\n` +
    `data: ${JSON.stringify({ type: 'done', rate_limited: true })}\n\n`;
  return new Response(encoder.encode(body), {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      ...corsHeaders(origin, env),
    },
  });
}
