/**
 * Island Mountain — AI conversational + voice lead funnel.
 * Edge backend entry point. Holds all secret keys server-side; the browser
 * never sees them. Routes:
 *   GET  /api/health        liveness probe
 *   POST /api/chat          Claude proxy + session memory      (PROMPT 02)
 *   POST /api/lead          score + persist + alert + GA4      (PROMPT 03/05)
 *   POST /api/voice-webhook Vapi voice pipeline                (PROMPT 07)
 */
import type { Env } from './types';
import { handlePreflight, jsonResponse, isOriginAllowed } from './cors';
import { handleHealth } from './routes/health';
import { handleChat } from './routes/chat';
import { handleLead } from './routes/lead';
import { handleVoiceWebhook } from './routes/voice';
import { handleBookingWebhook } from './routes/booking';
import { handleStats } from './routes/stats';

interface Route {
  method: string;
  path: string;
  handler: (request: Request, env: Env) => Response | Promise<Response>;
  /** Webhooks are called by third parties (no browser Origin) — skip origin gate. */
  publicWebhook?: boolean;
}

const ROUTES: Route[] = [
  { method: 'GET', path: '/api/health', handler: handleHealth },
  { method: 'GET', path: '/api/stats', handler: handleStats, publicWebhook: true },
  { method: 'POST', path: '/api/chat', handler: handleChat },
  { method: 'POST', path: '/api/lead', handler: handleLead },
  { method: 'POST', path: '/api/voice-webhook', handler: handleVoiceWebhook, publicWebhook: true },
  { method: 'POST', path: '/api/booking-webhook', handler: handleBookingWebhook, publicWebhook: true },
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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

    // Browser-facing endpoints must come from an allowed origin.
    // Same-origin requests (and webhooks) have no Origin header and pass.
    if (!route.publicWebhook && origin && !isOriginAllowed(origin, env)) {
      return jsonResponse(
        { success: false, error: 'Origin not allowed.' },
        403,
        origin,
        env,
      );
    }

    try {
      return await route.handler(request, env);
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
