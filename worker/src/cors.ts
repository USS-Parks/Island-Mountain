import type { Env } from './types';

/**
 * Allowed origins for the funnel API.
 * Production: the live site. Dev: localhost on any port + file://-served pages.
 */
function allowedOrigins(env: Env): string[] {
  return [
    env.ALLOWED_ORIGIN || 'https://islandmountain.io',
    'https://www.islandmountain.io',
  ];
}

function isLocalhost(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

/** Returns true if the request Origin is permitted to call the API. */
export function isOriginAllowed(origin: string | null, env: Env): boolean {
  if (!origin) return false;
  if (isLocalhost(origin)) return true;
  return allowedOrigins(env).includes(origin);
}

/**
 * CORS headers to attach to a response. When the origin is allowed we reflect
 * it (required because credentials/`*` cannot mix); otherwise we omit the
 * allow-origin header entirely so the browser blocks the cross-origin read.
 */
export function corsHeaders(origin: string | null, env: Env): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id, X-Turnstile-Token',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
  if (isOriginAllowed(origin, env)) {
    headers['Access-Control-Allow-Origin'] = origin as string;
  }
  return headers;
}

/** Preflight handler. 204 with CORS headers when allowed, 403 otherwise. */
export function handlePreflight(request: Request, env: Env): Response {
  const origin = request.headers.get('Origin');
  if (!isOriginAllowed(origin, env)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 204, headers: corsHeaders(origin, env) });
}

/** JSON response helper that always carries the right CORS headers. */
export function jsonResponse(
  body: unknown,
  status: number,
  origin: string | null,
  env: Env,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders(origin, env),
    },
  });
}
