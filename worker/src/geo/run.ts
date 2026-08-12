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

  // ponytail: sequential prompts, engines in parallel per prompt. Up to
  // (prompts × engines) subrequests/run — ~60 at full 4-engine coverage, within
  // the Workers Paid 1000 cap; only ANTHROPIC is keyed until Basho adds the rest.
  for (const p of prompts) {
    const results = await Promise.all(
      ENGINES.map(async (e) => ({ id: e.id, res: await e.query(env, p.text) }))
    )
    for (const { id, res } of results) {
      if (!res) continue
      enginesUsed.add(id)
      const v = parseVisibility(res.answer, res.citations, ENTITIES)
      if (v.im_mentioned) im_mentions++
      const ok = await insertSnapshot(env, {
        id: crypto.randomUUID(),
        run_id,
        run_date,
        engine: id,
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
      if (ok) snapshots++
    }
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
