import type { Env } from '../types';
import { jsonResponse } from '../cors';

/**
 * POST /api/chat — Claude proxy + KV session memory.
 * Stub: implemented in PROMPT 02.
 */
export async function handleChat(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');
  return jsonResponse(
    { success: false, error: 'Not implemented yet (PROMPT 02).' },
    501,
    origin,
    env,
  );
}
