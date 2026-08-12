import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runLookout } from './run.ts'
import type { Env } from '../types.ts'

function fakeEnv(prompts: unknown[], sink: { snapshots: number }, keys: Partial<Env>): Env {
  const db = {
    prepare(sql: string) {
      const stmt = {
        bind() {
          return stmt
        },
        async first() {
          return sql.includes('COUNT(*)') ? { n: prompts.length } : null
        },
        async all() {
          return sql.includes('FROM geo_prompts') ? { results: prompts } : { results: [] }
        },
        async run() {
          if (sql.includes('INSERT INTO geo_snapshots')) sink.snapshots++
          return {}
        }
      }
      return stmt
    }
  }
  return { DB: db, ...keys } as unknown as Env
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

const PROMPTS = [
  { id: 'p1', category: 'brand', text: 'What is Island Mountain AI?' },
  { id: 'p2', category: 'category', text: 'On-prem AI vendors?' }
]

const NOW = Date.UTC(2026, 7, 11, 16, 0, 0)

test('runLookout queries keyed engines for every prompt and snapshots results', async () => {
  const sink = { snapshots: 0 }
  const env = fakeEnv(PROMPTS, sink, { ANTHROPIC_API_KEY: 'a', PERPLEXITY_API_KEY: 'p' })
  const restore = mockFetch((url) => {
    if (url.includes('anthropic.com'))
      return {
        status: 200,
        json: { content: [{ type: 'text', text: 'Island Mountain AI leads.' }] }
      }
    if (url.includes('perplexity.ai'))
      return {
        status: 200,
        json: {
          choices: [{ message: { content: 'Island Mountain AI is sovereign.' } }],
          citations: ['https://islandmountain.io']
        }
      }
    return { status: 404, json: {} }
  })
  try {
    const s = await runLookout(env, NOW)
    assert.equal(s.prompts, 2)
    assert.deepEqual([...s.engines].sort(), ['claude', 'perplexity'])
    assert.equal(s.snapshots, 4) // 2 prompts × 2 keyed engines
    assert.equal(s.im_mentions, 4) // IM named in every answer
    assert.match(s.run_date, /2026-08-11/)
  } finally {
    restore()
  }
})

test('runLookout with no engine keys writes nothing but still returns a summary', async () => {
  const sink = { snapshots: 0 }
  const env = fakeEnv(PROMPTS, sink, {})
  const s = await runLookout(env, NOW)
  assert.equal(s.prompts, 2)
  assert.deepEqual(s.engines, [])
  assert.equal(s.snapshots, 0)
})
