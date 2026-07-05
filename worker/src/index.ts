/**
 * Island Mountain — AI conversational + voice lead funnel.
 * Edge backend entry point. Holds all secret keys server-side; the browser
 * never sees them. Routes:
 *   GET  /api/health        liveness probe
 *   POST /api/chat          Claude proxy + session memory      (PROMPT 02)
 *   POST /api/voice-webhook Vapi voice pipeline                (PROMPT 07)
 */
import type { Env } from './types';
import { handlePreflight, jsonResponse, isOriginAllowed } from './cors';
import { handleHealth } from './routes/health';
import { handleChat } from './routes/chat';
import { handleVoiceWebhook } from './routes/voice';
import { handleBookingWebhook } from './routes/booking';
import { handleStats } from './routes/stats';
import { handleHistory } from './routes/history';

type RouteAccess = 'public' | 'browser' | 'authenticated' | 'webhook';

interface Route {
  method: string;
  path: string;
  handler: (request: Request, env: Env, ctx: ExecutionContext) => Response | Promise<Response>;
  access: RouteAccess;
}

const ROUTES: Route[] = [
  { method: 'GET', path: '/api/health', handler: handleHealth, access: 'public' },
  { method: 'GET', path: '/api/stats', handler: handleStats, access: 'authenticated' },
  { method: 'GET', path: '/api/history', handler: handleHistory, access: 'browser' },
  { method: 'POST', path: '/api/chat', handler: handleChat, access: 'browser' },
  { method: 'POST', path: '/api/voice-webhook', handler: handleVoiceWebhook, access: 'webhook' },
  { method: 'POST', path: '/api/booking-webhook', handler: handleBookingWebhook, access: 'webhook' },
];

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return handlePreflight(request, env);
    }

    const route = ROUTES.find(
      (r) => r.method === request.method && r.path === url.pathname,
    );

    if (!route) {
      return jsonResponse(
        { success: false, error: 'Not found.' },
        404,
        origin,
        env,
      );
    }

    // Browser routes fail closed: the site calls this Worker cross-origin, so a
    // legitimate request always carries an allowed Origin header. Public health,
    // token-authenticated stats, and signed webhooks use their own trust boundary.
    if (route.access === 'browser' && !isOriginAllowed(origin, env)) {
      return jsonResponse(
        { success: false, error: 'Origin required or not allowed.' },
        403,
        origin,
        env,
      );
    }

    try {
      return await route.handler(request, env, ctx);
    } catch (err) {
      console.error('Unhandled error:', err);
      return jsonResponse(
        { success: false, error: 'Internal error.' },
        500,
        origin,
        env,
      );
    }
  },
} satisfies ExportedHandler<Env>;
