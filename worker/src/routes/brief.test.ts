import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handleBriefPreview, handleBriefRun } from './brief.ts'
import type { Env } from '../types.ts'

/** Env whose D1 returns an empty pipeline (enough to render a quiet brief). */
function emptyDBEnv(secret?: string): Env {
  const db = {
    prepare() {
      const stmt = {
        bind() {
          return stmt
        },
        async all() {
          return { results: [] }
        },
        async first() {
          return null
        },
        async run() {
          return {}
        }
      }
      return stmt
    }
  }
  return {
    DB: db,
    BRIEF_SECRET: secret,
    ALERT_EMAIL: 'basho@islandmountain.io',
    RESEND_API_KEY: 'test',
    CALCOM_API_KEY: 'cal_live_test',
    CALCOM_TIMEZONE: 'America/Los_Angeles',
    ALLOWED_ORIGIN: 'https://islandmountain.io'
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

function req(token?: string, method = 'GET'): Request {
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  return new Request('https://w/api/brief', { method, headers })
}

test('preview is 503 when BRIEF_SECRET is not configured', async () => {
  const res = await handleBriefPreview(req('x'), emptyDBEnv(undefined))
  assert.equal(res.status, 503)
})

test('preview and run reject a wrong bearer token with 401', async () => {
  const env = emptyDBEnv('right')
  assert.equal((await handleBriefPreview(req('wrong'), env)).status, 401)
  assert.equal((await handleBriefRun(req('wrong', 'POST'), env)).status, 401)
})

test('authorized preview returns the brief as HTML', async () => {
  const restore = mockFetch(() => ({ status: 200, json: { data: [] } }))
  try {
    const res = await handleBriefPreview(req('right'), emptyDBEnv('right'))
    assert.equal(res.status, 200)
    assert.match(res.headers.get('content-type') || '', /text\/html/)
    assert.ok((await res.text()).includes('Purser'))
  } finally {
    restore()
  }
})

test('authorized run sends and reports counts', async () => {
  const restore = mockFetch((url) =>
    url.includes('resend')
      ? { status: 200, json: { id: 'e1' } }
      : { status: 200, json: { data: [] } }
  )
  try {
    const res = await handleBriefRun(req('right', 'POST'), emptyDBEnv('right'))
    assert.equal(res.status, 200)
    const body = (await res.json()) as { success: boolean; data: { sent: boolean } }
    assert.equal(body.success, true)
    assert.equal(body.data.sent, true)
  } finally {
    restore()
  }
})
