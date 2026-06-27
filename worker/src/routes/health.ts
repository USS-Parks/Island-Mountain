import type { Env } from '../types';
import { jsonResponse } from '../cors';

/** Liveness probe. Confirms the Worker is up and which bindings are wired. */
export function handleHealth(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  return jsonResponse(
    {
      success: true,
      data: {
        status: 'ok',
        service: 'island-mountain-funnel',
        time: new Date().toISOString(),
        bindings: {
          sessions: typeof env.SESSIONS !== 'undefined',
          db: typeof env.DB !== 'undefined',
        },
      },
    },
    200,
    origin,
    env,
  );
}
