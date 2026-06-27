import type { Env } from '../types';
import { jsonResponse } from '../cors';

/**
 * POST /api/voice-webhook — Vapi function-calling / event webhook.
 * Routes voice calls through the SAME qualify + score + lead pipeline as chat.
 * Stub: implemented in PROMPT 07.
 */
export async function handleVoiceWebhook(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');
  return jsonResponse(
    { success: false, error: 'Not implemented yet (PROMPT 07).' },
    501,
    origin,
    env,
  );
}
