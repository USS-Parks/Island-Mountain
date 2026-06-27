import type { Env } from '../types';
import { jsonResponse, corsHeaders } from '../cors';
import { buildSystemPrompt } from '../persona';
import {
  loadSession,
  newSession,
  saveSession,
  contextMessages,
  MAX_MESSAGE_CHARS,
  type SessionData,
  type SessionMeta,
} from '../session';
import {
  callAnthropic,
  streamAnthropic,
  toAnthropicMessages,
  parseTextDelta,
} from '../anthropic';

const FALLBACK_MESSAGE =
  "I'm having a little trouble connecting right now. You can reach Basho directly " +
  'at 1-801-609-1130 or basho@islandmountain.io and he’ll help you straight away.';

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

export async function handleChat(request: Request, env: Env): Promise<Response> {
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

  // Load or create session.
  const sessionId =
    typeof body.sessionId === 'string' && body.sessionId.length > 0
      ? body.sessionId
      : crypto.randomUUID();
  let session = await loadSession(env, sessionId);
  if (!session) {
    session = newSession(sessionId, body.meta ?? {});
  }
  session.messages.push({ role: 'user', content: clipped });

  const model = pickModel(env, clipped, session.messages.length);
  const system = buildSystemPrompt();
  const apiMessages = toAnthropicMessages(contextMessages(session));

  const wantsStream = (request.headers.get('Accept') || '').includes('text/event-stream');
  if (wantsStream) {
    return streamReply(env, origin, session, { model, system, messages: apiMessages });
  }

  const result = await callAnthropic({ env, model, system, messages: apiMessages });
  if (!result.ok) {
    console.error('Anthropic call failed:', result.status, result.error);
    // Graceful: append fallback as the assistant turn, persist, return 200.
    session.messages.push({ role: 'assistant', content: FALLBACK_MESSAGE });
    await saveSession(env, session);
    return jsonResponse(
      { success: true, data: { sessionId, reply: FALLBACK_MESSAGE, fallback: true } },
      200,
      origin,
      env,
    );
  }

  session.messages.push({ role: 'assistant', content: result.text });
  await saveSession(env, session);
  return jsonResponse(
    { success: true, data: { sessionId, reply: result.text, model: result.model } },
    200,
    origin,
    env,
  );
}

/** SSE streaming path. Re-emits a simplified event stream and persists on close. */
async function streamReply(
  env: Env,
  origin: string | null,
  session: SessionData,
  call: { model: string; system: string; messages: { role: 'user' | 'assistant'; content: string }[] },
): Promise<Response> {
  const stream = await streamAnthropic({ env, ...call });

  const sseHeaders = {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    ...corsHeaders(origin, env),
  };

  if (!stream.ok) {
    console.error('Anthropic stream failed:', stream.status, stream.error);
    session.messages.push({ role: 'assistant', content: FALLBACK_MESSAGE });
    await saveSession(env, session);
    const body =
      `data: ${JSON.stringify({ type: 'meta', sessionId: session.id })}\n\n` +
      `data: ${JSON.stringify({ type: 'text', text: FALLBACK_MESSAGE })}\n\n` +
      `data: ${JSON.stringify({ type: 'done', fallback: true })}\n\n`;
    return new Response(body, { status: 200, headers: sseHeaders });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const upstream = stream.response.body!.getReader();
  let full = '';
  let buffer = '';

  const out = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      send({ type: 'meta', sessionId: session.id });
      try {
        for (;;) {
          const { done, value } = await upstream.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const delta = parseTextDelta(line);
            if (delta) {
              full += delta;
              send({ type: 'text', text: delta });
            }
          }
        }
      } catch (err) {
        console.error('stream read error:', err);
      }
      // Persist whatever we got (fallback if empty).
      const finalText = full.length > 0 ? full : FALLBACK_MESSAGE;
      session.messages.push({ role: 'assistant', content: finalText });
      await saveSession(env, session);
      send({ type: 'done', fallback: full.length === 0 ? true : undefined });
      controller.close();
    },
  });

  return new Response(out, { status: 200, headers: sseHeaders });
}
