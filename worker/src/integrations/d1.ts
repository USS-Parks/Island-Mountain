import type { Env } from '../types';

export interface LeadRow {
  id: string;
  session_id: string;
  created_at: string;
  name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  organization?: string;
  industry?: string;
  use_case?: string;
  concurrent_users?: string;
  system_interest?: string;
  compliance?: string[];
  timeline?: string;
  budget?: string;
  decision_maker?: string;
  infrastructure?: string;
  current_setup?: string;
  docs_requested?: string[];
  score: string;
  score_reason: string;
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_page?: string;
  referrer?: string;
  status: string;
  transcript?: unknown;
}

const COLS = [
  'id', 'session_id', 'created_at', 'name', 'email', 'phone', 'job_title',
  'organization', 'industry', 'use_case', 'concurrent_users', 'system_interest',
  'compliance', 'timeline', 'budget', 'decision_maker', 'infrastructure',
  'current_setup', 'docs_requested', 'score', 'score_reason', 'source',
  'utm_source', 'utm_medium', 'utm_campaign', 'landing_page', 'referrer',
  'status', 'transcript',
] as const;

function valueFor(row: LeadRow, col: string): string | null {
  const v = (row as unknown as Record<string, unknown>)[col];
  if (v === undefined || v === null) return null;
  if (Array.isArray(v) || typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

/** Insert a lead row. Best-effort: never throws. Returns true on success. */
export async function insertLead(env: Env, row: LeadRow): Promise<boolean> {
  if (!env.DB) return false;
  const placeholders = COLS.map(() => '?').join(', ');
  const sql = `INSERT INTO leads (${COLS.join(', ')}) VALUES (${placeholders})`;
  try {
    await env.DB.prepare(sql)
      .bind(...COLS.map((c) => valueFor(row, c)))
      .run();
    return true;
  } catch (err) {
    console.error('insertLead failed:', err);
    return false;
  }
}

/** Find an existing lead by session + email (de-dupe). */
export async function findLead(
  env: Env,
  sessionId: string,
  email: string,
): Promise<{ id: string } | null> {
  if (!env.DB) return null;
  try {
    const r = await env.DB.prepare(
      'SELECT id FROM leads WHERE session_id = ? AND email = ? LIMIT 1',
    )
      .bind(sessionId, email)
      .first<{ id: string }>();
    return r ?? null;
  } catch (err) {
    console.error('findLead failed:', err);
    return null;
  }
}

/** Update a lead's status (e.g. 'booked', 'docs_sent'). Best-effort. */
export async function setLeadStatus(env: Env, id: string, status: string): Promise<boolean> {
  if (!env.DB) return false;
  try {
    await env.DB.prepare('UPDATE leads SET status = ? WHERE id = ?').bind(status, id).run();
    return true;
  } catch (err) {
    console.error('setLeadStatus failed:', err);
    return false;
  }
}
