import type { Env } from '../types';
import { jsonResponse } from '../cors';

/**
 * GET /api/stats — lightweight internal funnel dashboard (D1 counts).
 * Auth-gated by STATS_TOKEN (Authorization: Bearer <token> or ?token=).
 */
export async function handleStats(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');
  const url = new URL(request.url);

  if (!env.STATS_TOKEN) {
    return jsonResponse({ success: false, error: 'Stats not configured.' }, 503, origin, env);
  }
  const auth = request.headers.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
  if (token !== env.STATS_TOKEN) {
    return jsonResponse({ success: false, error: 'Unauthorized.' }, 401, origin, env);
  }
  if (!env.DB) {
    return jsonResponse({ success: false, error: 'No database.' }, 503, origin, env);
  }

  try {
    const total = await one(env, 'SELECT COUNT(*) AS n FROM leads');
    const booked = await one(env, "SELECT COUNT(*) AS n FROM leads WHERE status='booked'");
    const last7 = await one(
      env,
      "SELECT COUNT(*) AS n FROM leads WHERE created_at >= datetime('now','-7 days')",
    );
    const byScore = await rows(env, 'SELECT score, COUNT(*) AS n FROM leads GROUP BY score');
    const bySource = await rows(env, 'SELECT source, COUNT(*) AS n FROM leads GROUP BY source');
    const bySrc = await rows(
      env,
      "SELECT COALESCE(NULLIF(utm_source,''),'(direct)') AS utm_source, " +
        'COUNT(*) AS n, SUM(CASE WHEN score=\'hot\' THEN 1 ELSE 0 END) AS hot ' +
        'FROM leads GROUP BY utm_source ORDER BY n DESC',
    );
    return jsonResponse(
      {
        success: true,
        data: {
          total,
          booked,
          last7,
          by_score: byScore,
          by_source: bySource,
          by_utm_source: bySrc,
        },
      },
      200,
      origin,
      env,
    );
  } catch (err) {
    console.error('stats query failed:', err);
    return jsonResponse({ success: false, error: 'Query failed.' }, 500, origin, env);
  }
}

async function one(env: Env, sql: string): Promise<number> {
  const r = await env.DB.prepare(sql).first<{ n: number }>();
  return r?.n ?? 0;
}
async function rows(env: Env, sql: string): Promise<unknown[]> {
  const r = await env.DB.prepare(sql).all();
  return r.results ?? [];
}
