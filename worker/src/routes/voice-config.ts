import type { Env } from '../types';
import { jsonResponse } from '../cors';

/**
 * Voice web-call config for the site chat widget. Keeps the Vapi public key
 * and assistant id out of the static site source: the widget fetches them at
 * runtime instead. Returns 404 when voice is unconfigured, which makes the
 * widget simply not render the voice button.
 */
export function handleVoiceConfig(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  if (!env.VAPI_PUBLIC_KEY || !env.VAPI_ASSISTANT_ID) {
    return jsonResponse(
      { success: false, error: 'Voice is not configured.' },
      404,
      origin,
      env,
    );
  }
  return jsonResponse(
    {
      success: true,
      data: {
        vapiPublicKey: env.VAPI_PUBLIC_KEY,
        vapiAssistantId: env.VAPI_ASSISTANT_ID,
      },
    },
    200,
    origin,
    env,
  );
}
