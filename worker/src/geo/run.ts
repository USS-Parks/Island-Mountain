import type { Env } from '../types'
import { ENGINES } from './engines'
import { parseVisibility, type Entities } from './parse'
import { seedPrompts, activePrompts, insertSnapshot } from './store'
import { IM_ALIASES, IM_DOMAIN, COMPETITORS } from './config'

/**
 * Lookout runner: ask every keyed engine every tracked prompt, parse each answer
 * for IM's visibility, and snapshot the result. Everything downstream is
 * best-effort, so a dead engine or a failed write drops one cell, never the run.
 */

const ENTITIES: Entities = { imAliases: IM_ALIASES, imDomain: IM_DOMAIN, competitors: COMPETITORS }

export interface LookoutSummary {
  run_id: string
  run_date: string
  engines: string[] // engine ids that returned data this run
  prompts: number
  snapshots: number // rows written
  im_mentions: number // snapshots where IM was mentioned
}

export async function runLookout(env: Env, nowMs = Date.now()): Promise<LookoutSummary> {
  await seedPrompts(env)
  const prompts = await activePrompts(env)
  const run_id = crypto.randomUUID()
  const run_date = new Date(nowMs).toISOString()
  const enginesUsed = new Set<string>()
  let snapshots = 0
  let im_mentions = 0

  // Fire every prompt×engine at once and insert each result the instant it
  // returns, so a limited on-demand background budget still persists whatever
  // finished (rows land incrementally, never all-or-nothing). ~60 concurrent
  // subrequests at full coverage, within the Workers Paid 1000 cap; the Monday
  // cron has the budget to complete the whole set.
  const tasks = prompts.flatMap((p) => ENGINES.map((e) => ({ p, e })))
  const settled = await Promise.all(
    tasks.map(async ({ p, e }) => {
      const res = await e.query(env, p.text)
      if (!res) return null
      const v = parseVisibility(res.answer, res.citations, ENTITIES)
      const ok = await insertSnapshot(env, {
        id: crypto.randomUUID(),
        run_id,
        run_date,
        engine: e.id,
        prompt_id: p.id,
        prompt_text: p.text,
        im_mentioned: v.im_mentioned ? 1 : 0,
        im_cited: v.im_cited ? 1 : 0,
        im_position: v.im_position,
        competitors: JSON.stringify(v.competitors),
        sov: v.sov,
        citations: JSON.stringify(res.citations),
        raw_answer: res.answer.slice(0, 4000)
      })
      return ok ? { engine: e.id, mentioned: v.im_mentioned } : null
    })
  )
  for (const r of settled) {
    if (!r) continue
    enginesUsed.add(r.engine)
    snapshots++
    if (r.mentioned) im_mentions++
  }

  return {
    run_id,
    run_date,
    engines: [...enginesUsed],
    prompts: prompts.length,
    snapshots,
    im_mentions
  }
}
