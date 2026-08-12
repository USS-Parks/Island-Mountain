import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handleGeoDashboard } from './geo.ts'
import type { Env } from '../types.ts'

/** Env whose D1 returns an empty pipeline (dashboard renders its empty state). */
function emptyDBEnv(secret?: string): Env {
  const db = {
    prepare() {
      const stmt = {
        bind() {
          return stmt
        },
        async first() {
          return null
        },
        async all() {
          return { results: [] }
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
    GEO_SECRET: secret,
    ALLOWED_ORIGIN: 'https://islandmountain.io'
  } as unknown as Env
}

function req(token?: string): Request {
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  return new Request('https://w/api/geo/dashboard', { headers })
}

test('dashboard is 503 when GEO_SECRET is not configured', async () => {
  assert.equal((await handleGeoDashboard(req('x'), emptyDBEnv(undefined))).status, 503)
})

test('dashboard rejects a wrong bearer token with 401', async () => {
  assert.equal((await handleGeoDashboard(req('wrong'), emptyDBEnv('right'))).status, 401)
})

test('authorized dashboard returns HTML (empty state with no data)', async () => {
  const res = await handleGeoDashboard(req('right'), emptyDBEnv('right'))
  assert.equal(res.status, 200)
  assert.match(res.headers.get('content-type') || '', /text\/html/)
  assert.match(await res.text(), /Lookout/)
})
