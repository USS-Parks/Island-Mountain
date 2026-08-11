import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runBrief, previewBrief } from './brief-run.ts'
import type { Env } from './types.ts'

interface FakeRows {
  fresh?: unknown[]
  aging?: unknown[]
  booked?: unknown[]
  totals?: unknown[]
  recorded?: { calls: number }
}

/** Fake D1 that dispatches on the query text, so each cut gets its own rows. */
function fakeEnv(rows: FakeRows): Env {
  const db = {
    prepare(sql: string) {
      const stmt = {
        bind() {
          return stmt
        },
        async all() {
          if (sql.includes('GROUP BY')) return { results: rows.totals ?? [] }
          if (sql.includes("status = 'booked'")) return { results: rows.booked ?? [] }
          if (sql.includes("score IN ('hot','warm')")) return { results: rows.aging ?? [] }
          if (sql.includes('created_at >= ?')) return { results: rows.fresh ?? [] }
          return { results: [] }
        },
        async first() {
          return null
        },
        async run() {
          if (sql.includes('INSERT INTO brief_runs') && rows.recorded) rows.recorded.calls++
          return {}
        }
      }
      return stmt
    }
  }
  return {
    DB: db,
    ALERT_EMAIL: 'basho@islandmountain.io',
    RESEND_API_KEY: 'test',
    LEAD_FROM_EMAIL: 'Island Mountain <leads@islandmountain.io>',
    CALCOM_API_KEY: 'cal_live_test',
    CALCOM_TIMEZONE: 'America/Los_Angeles'
  } as unknown as Env
}

function mockFetch(handler: (url: string) => { status: number; json: unknown }) {
  const orig = globalThis.fetch
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input.toString()
    const { status, json } = handler(url)
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => json,
      text: async () => JSON.stringify(json)
    } as Response
  }) as typeof fetch
  return () => {
    globalThis.fetch = orig
  }
}

const NOW = Date.UTC(2026, 7, 10, 16, 0, 0) // 2026-08-10T16:00Z

function bookingsAndEmail(url: string): { status: number; json: unknown } {
  if (url.includes('/v2/bookings')) {
    return {
      status: 200,
      json: {
        data: [
          {
            uid: 'bk1',
            start: '2026-08-10T20:00:00.000Z',
            attendees: [{ name: 'Ada', email: 'ada@x.io' }],
            metadata: { leadId: 'lead_1' }
          }
        ]
      }
    }
  }
  if (url.includes('api.resend.com')) return { status: 200, json: { id: 'em_1' } }
  return { status: 404, json: {} }
}

test('runBrief gathers all cuts, sends, and records exactly one receipt', async () => {
  const recorded = { calls: 0 }
  const env = fakeEnv({
    fresh: [
      { id: 'n1', created_at: '2026-08-10T09:00:00Z', name: 'New', score: 'warm', status: 'new' }
    ],
    aging: [],
    booked: [
      {
        id: 'lead_1',
        created_at: '2026-08-01T00:00:00Z',
        name: 'Ada',
        email: 'ada@x.io',
        status: 'booked'
      }
    ],
    totals: [{ score: 'warm', status: 'new', n: 4 }],
    recorded
  })
  const restore = mockFetch(bookingsAndEmail)
  try {
    const { sent, counts } = await runBrief(env, NOW)
    assert.equal(sent, true)
    assert.equal(counts.new_count, 1)
    assert.equal(counts.calls_count, 1) // booking joined to lead_1
    assert.equal(counts.total_leads, 4)
    assert.equal(recorded.calls, 1) // one receipt appended
  } finally {
    restore()
  }
})

test('previewBrief composes without sending or recording', async () => {
  const recorded = { calls: 0 }
  const env = fakeEnv({ fresh: [], aging: [], booked: [], totals: [], recorded })
  const restore = mockFetch(bookingsAndEmail)
  try {
    const { subject, html, counts } = await previewBrief(env, NOW)
    assert.match(subject, /\[Purser\]/)
    assert.ok(html.includes('Pipeline board'))
    assert.equal(counts.total_leads, 0)
    assert.equal(recorded.calls, 0) // no receipt on preview
  } finally {
    restore()
  }
})
