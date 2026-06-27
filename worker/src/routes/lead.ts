import type { Env } from '../types';
import { jsonResponse } from '../cors';

/**
 * POST /api/lead — validate, score, persist, alert, fire GA4.
 * Stub: implemented in PROMPT 03 (scoring) + PROMPT 05 (routing).
 */
export async function handleLead(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');
  return jsonResponse(
    { success: false, error: 'Not implemented yet (PROMPT 03 / 05).' },
    501,
    origin,
    env,
  );
}
