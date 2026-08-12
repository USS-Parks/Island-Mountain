import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  seedPrompts,
  activePrompts,
  insertSnapshot,
  snapshotsSince,
  latestSnapshots,
  type GeoSnapshot
} from './store.ts'
import { STARTER_PROMPTS } from './config.ts'
import type { Env } from '../types.ts'

interface Sink {
  inserts: number
  lastBinds?: unknown[]
}

function fakeEnv(
  opts: {
    promptCount?: number
    promptRows?: unknown[]
    snapshotRows?: unknown[]
    latestRunId?: string | null
    runRows?: unknown[]
    sink?: Sink
  } = {}
): Env {
  const db = {
    prepare(sql: string) {
      const stmt = {
        bind(...b: unknown[]) {
          if (opts.sink) opts.sink.lastBinds = b
          return stmt
        },
        async first() {
          if (sql.includes('COUNT(*)')) return { n: opts.promptCount ?? 0 }
          if (sql.includes('run_id') && sql.includes('LIMIT 1'))
            return opts.latestRunId ? { run_id: opts.latestRunId } : null
          return null
        },
        async all() {
          if (sql.includes('FROM geo_prompts')) return { results: opts.promptRows ?? [] }
          if (sql.includes('WHERE run_id')) return { results: opts.runRows ?? [] }
          if (sql.includes('FROM geo_snapshots')) return { results: opts.snapshotRows ?? [] }
          return { results: [] }
        },
        async run() {
          if (opts.sink && sql.includes('INSERT INTO geo_prompts')) opts.sink.inserts++
          return {}
        }
      }
      return stmt
    }
  }
  return { DB: db } as unknown as Env
}

function sampleSnapshot(): GeoSnapshot {
  return {
    id: 's1',
    run_id: 'run_1',
    run_date: '2026-08-11T16:00:00.000Z',
    engine: 'claude',
    prompt_id: 'brand-what-is',
    prompt_text: 'What is Island Mountain AI?',
    im_mentioned: 1,
    im_cited: 1,
    im_position: 2,
    competitors: JSON.stringify(['goabacus']),
    sov: 0.5,
    citations: JSON.stringify(['https://islandmountain.io']),
    raw_answer: 'Island Mountain AI is ...'
  }
}

const NOW = Date.UTC(2026, 7, 11, 16, 0, 0)

test('seedPrompts inserts the starter set when the table is empty', async () => {
  const sink: Sink = { inserts: 0 }
  await seedPrompts(fakeEnv({ promptCount: 0, sink }))
  assert.equal(sink.inserts, STARTER_PROMPTS.length)
})

test('seedPrompts skips when prompts already exist', async () => {
  const sink: Sink = { inserts: 0 }
  await seedPrompts(fakeEnv({ promptCount: 5, sink }))
  assert.equal(sink.inserts, 0)
})

test('activePrompts returns table rows when present', async () => {
  const rows = [{ id: 'x', category: 'brand', text: 'hi' }]
  assert.deepEqual(await activePrompts(fakeEnv({ promptRows: rows })), rows)
})

test('activePrompts falls back to the starter set when empty or DB-less', async () => {
  assert.equal(await activePrompts(fakeEnv({ promptRows: [] })), STARTER_PROMPTS)
  assert.equal(await activePrompts({} as Env), STARTER_PROMPTS)
})

test('insertSnapshot binds all 13 columns and returns true', async () => {
  const sink: Sink = { inserts: 0 }
  const ok = await insertSnapshot(fakeEnv({ sink }), sampleSnapshot())
  assert.equal(ok, true)
  assert.equal(sink.lastBinds?.length, 13)
})

test('snapshotsSince windows on run_date and returns rows', async () => {
  const sink: Sink = { inserts: 0 }
  const out = await snapshotsSince(fakeEnv({ snapshotRows: [sampleSnapshot()], sink }), 90, NOW)
  assert.equal(out.length, 1)
  assert.equal(sink.lastBinds?.[0], '2026-05-13T16:00:00.000Z') // 90d before NOW
})

test('latestSnapshots resolves the newest run then returns its rows', async () => {
  const out = await latestSnapshots(
    fakeEnv({ latestRunId: 'run_1', runRows: [sampleSnapshot(), sampleSnapshot()] })
  )
  assert.equal(out.length, 2)
})

test('latestSnapshots returns [] when there are no runs', async () => {
  assert.deepEqual(await latestSnapshots(fakeEnv({ latestRunId: null })), [])
})
