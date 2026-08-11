import { test } from 'node:test'
import assert from 'node:assert/strict'
import { newLeads, agingWarm, bookedLeads, pipelineTotals, recordBriefRun } from './pipeline.ts'
import type { Env } from '../types.ts'

interface Sink {
  sql?: string
  binds?: unknown[]
}

/** Minimal fake D1: returns canned `rows` and records the last SQL + binds. */
function envWith(rows: unknown[], sink: Sink = {}): Env {
  const db = {
    prepare(sql: string) {
      sink.sql = sql
      const stmt = {
        bind(...b: unknown[]) {
          sink.binds = b
          return stmt
        },
        async all() {
          return { results: rows }
        },
        async first() {
          return rows[0] ?? null
        },
        async run() {
          return {}
        }
      }
      return stmt
    }
  }
  return { DB: db } as unknown as Env
}

const NOW = Date.UTC(2026, 7, 10, 16, 0, 0) // 2026-08-10T16:00:00Z

test('newLeads windows on created_at and returns rows', async () => {
  const sink: Sink = {}
  const rows = [{ id: 'a', created_at: '2026-08-10T09:00:00Z', name: 'Ada' }]
  const out = await newLeads(envWith(rows, sink), 24, NOW)
  assert.equal(out.length, 1)
  assert.match(sink.sql!, /created_at >= \?/)
  assert.match(sink.sql!, /ORDER BY created_at DESC/)
  assert.equal(sink.binds![0], '2026-08-09T16:00:00.000Z') // 24h before NOW
})

test('agingWarm filters hot/warm + new + older than cutoff', async () => {
  const sink: Sink = {}
  const out = await agingWarm(envWith([], sink), 3, NOW)
  assert.deepEqual(out, [])
  assert.match(sink.sql!, /score IN \('hot','warm'\)/)
  assert.match(sink.sql!, /status = 'new'/)
  assert.match(sink.sql!, /created_at < \?/)
  assert.equal(sink.binds![0], '2026-08-07T16:00:00.000Z') // 3d before NOW
})

test('bookedLeads selects status=booked with the full column set', async () => {
  const sink: Sink = {}
  const rows = [{ id: 'b', created_at: '2026-08-01T00:00:00Z', transcript: '[]' }]
  const out = await bookedLeads(envWith(rows, sink))
  assert.equal(out.length, 1)
  assert.match(sink.sql!, /status = 'booked'/)
  assert.match(sink.sql!, /transcript/)
})

test('pipelineTotals folds grouped rows into score + status totals', async () => {
  const rows = [
    { score: 'hot', status: 'new', n: 2 },
    { score: 'warm', status: 'booked', n: 1 },
    { score: 'cold', status: 'new', n: 5 }
  ]
  const totals = await pipelineTotals(envWith(rows))
  assert.equal(totals.total, 8)
  assert.deepEqual(totals.byScore, { hot: 2, warm: 1, cold: 5 })
  assert.deepEqual(totals.byStatus, { new: 7, booked: 1 })
})

test('recordBriefRun inserts a receipt with sent coerced to 0/1', async () => {
  const sink: Sink = {}
  const ok = await recordBriefRun(envWith([], sink), {
    ran_at: '2026-08-10T16:15:00.000Z',
    new_count: 3,
    aging_count: 2,
    calls_count: 1,
    total_leads: 8,
    sent: true
  })
  assert.equal(ok, true)
  assert.match(sink.sql!, /INSERT INTO brief_runs/)
  assert.equal(sink.binds!.length, 7)
  assert.equal(sink.binds![1], '2026-08-10T16:15:00.000Z')
  assert.equal(sink.binds![6], 1) // sent:true → 1
  assert.equal(typeof sink.binds![0], 'string') // uuid
})

test('every read degrades to empty when DB is unbound', async () => {
  const env = {} as Env
  assert.deepEqual(await newLeads(env), [])
  assert.deepEqual(await agingWarm(env), [])
  assert.deepEqual(await bookedLeads(env), [])
  assert.deepEqual(await pipelineTotals(env), { total: 0, byScore: {}, byStatus: {} })
  assert.equal(
    await recordBriefRun(env, {
      ran_at: 'x',
      new_count: 0,
      aging_count: 0,
      calls_count: 0,
      total_leads: 0,
      sent: false
    }),
    false
  )
})
