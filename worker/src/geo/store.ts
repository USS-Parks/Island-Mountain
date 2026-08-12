import type { Env } from '../types'
import { STARTER_PROMPTS, type GeoPrompt } from './config'

/**
 * Lookout storage — the tracked prompt set (geo_prompts) and per-answer
 * snapshots (geo_snapshots). Every read/write is best-effort: a missing DB or a
 * query error yields empty/false, never a throw, so a storage hiccup can't sink
 * a run or the dashboard.
 */

export interface GeoSnapshot {
  id: string
  run_id: string
  run_date: string
  engine: string
  prompt_id: string
  prompt_text: string | null
  im_mentioned: number // 0/1
  im_cited: number // 0/1
  im_position: number | null
  competitors: string | null // JSON array of names
  sov: number | null // 0..1 for this answer
  citations: string | null // JSON array of URLs
  raw_answer: string | null
}

/** Seed the tracked prompt set once, if the table is empty. Best-effort. */
export async function seedPrompts(env: Env): Promise<void> {
  if (!env.DB) return
  try {
    const existing = await env.DB.prepare('SELECT COUNT(*) AS n FROM geo_prompts').first<{
      n: number
    }>()
    if ((existing?.n ?? 0) > 0) return
    for (const p of STARTER_PROMPTS) {
      await env.DB.prepare(
        'INSERT INTO geo_prompts (id, category, text, active) VALUES (?, ?, ?, 1)'
      )
        .bind(p.id, p.category, p.text)
        .run()
    }
  } catch (err) {
    console.error('seedPrompts failed:', err)
  }
}

/** Active tracked prompts; falls back to the code constant if the table is empty/unavailable. */
export async function activePrompts(env: Env): Promise<GeoPrompt[]> {
  if (!env.DB) return STARTER_PROMPTS
  try {
    const r = await env.DB.prepare(
      'SELECT id, category, text FROM geo_prompts WHERE active = 1 ORDER BY id'
    ).all<GeoPrompt>()
    const rows = r.results ?? []
    return rows.length ? rows : STARTER_PROMPTS
  } catch (err) {
    console.error('activePrompts failed:', err)
    return STARTER_PROMPTS
  }
}

/** Append one answer snapshot. Best-effort. */
export async function insertSnapshot(env: Env, s: GeoSnapshot): Promise<boolean> {
  if (!env.DB) return false
  try {
    await env.DB.prepare(
      `INSERT INTO geo_snapshots (id, run_id, run_date, engine, prompt_id, prompt_text,
        im_mentioned, im_cited, im_position, competitors, sov, citations, raw_answer)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        s.id,
        s.run_id,
        s.run_date,
        s.engine,
        s.prompt_id,
        s.prompt_text ?? null,
        s.im_mentioned,
        s.im_cited,
        s.im_position ?? null,
        s.competitors ?? null,
        s.sov ?? null,
        s.citations ?? null,
        s.raw_answer ?? null
      )
      .run()
    return true
  } catch (err) {
    console.error('insertSnapshot failed:', err)
    return false
  }
}

/** All snapshots from the last `days` (for the dashboard trend). */
export async function snapshotsSince(
  env: Env,
  days = 90,
  nowMs = Date.now()
): Promise<GeoSnapshot[]> {
  if (!env.DB) return []
  const cutoff = new Date(nowMs - days * 86_400_000).toISOString()
  try {
    const r = await env.DB.prepare(
      'SELECT * FROM geo_snapshots WHERE run_date >= ? ORDER BY run_date ASC'
    )
      .bind(cutoff)
      .all<GeoSnapshot>()
    return r.results ?? []
  } catch (err) {
    console.error('snapshotsSince failed:', err)
    return []
  }
}

/** The most recent run's snapshots (for preview + the dashboard's "current" state). */
export async function latestSnapshots(env: Env): Promise<GeoSnapshot[]> {
  if (!env.DB) return []
  try {
    const latest = await env.DB.prepare(
      'SELECT run_id FROM geo_snapshots ORDER BY run_date DESC LIMIT 1'
    ).first<{ run_id: string }>()
    if (!latest?.run_id) return []
    const r = await env.DB.prepare(
      'SELECT * FROM geo_snapshots WHERE run_id = ? ORDER BY engine, prompt_id'
    )
      .bind(latest.run_id)
      .all<GeoSnapshot>()
    return r.results ?? []
  } catch (err) {
    console.error('latestSnapshots failed:', err)
    return []
  }
}
