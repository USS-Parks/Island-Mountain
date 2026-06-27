import type { Env } from '../types';
import { jsonResponse } from '../cors';
import { loadSession } from '../session';

/**
 * GET /api/history?sessionId=X — returns the stored conversation for a session.
 *
 * This is the source of truth the widget loads on each page so the conversation
 * survives navigation — including a reply that finished server-side after the
 * visitor changed pages mid-response.
 */
export async function handleHistory(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId') || '';
  if (!sessionId) {
    return jsonResponse({ success: false, error: 'sessionId required.' }, 400, origin, env);
  }
  const session = await loadSession(env, sessionId);
  const messages = session ? session.messages : [];
  return jsonResponse({ success: true, data: { sessionId, messages } }, 200, origin, env);
}
