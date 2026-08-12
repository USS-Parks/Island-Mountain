import { test } from 'node:test'
import assert from 'node:assert/strict'
import { handleGeoDashboard, handleGeoRun, handleGeoPreview } from './geo.ts'
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

test('dashboard is open (200) when no GEO_SECRET is configured', async () => {
  const res = await handleGeoDashboard(req(), emptyDBEnv(undefined))
  assert.equal(res.status, 200)
  assert.match(res.headers.get('content-type') || '', /text\/html/)
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

const CTX = { waitUntil() {} } as unknown as ExecutionContext

test('run and preview reject a wrong bearer token with 401', async () => {
  const runReq = new Request('https://w/api/geo/run', {
    method: 'POST',
    headers: { Authorization: 'Bearer wrong' }
  })
  assert.equal((await handleGeoRun(runReq, emptyDBEnv('right'), CTX)).status, 401)
  assert.equal((await handleGeoPreview(req('wrong'), emptyDBEnv('right'))).status, 401)
})

test('authorized run starts in the background and returns 202', async () => {
  const runReq = new Request('https://w/api/geo/run', {
    method: 'POST',
    headers: { Authorization: 'Bearer right' }
  })
  const res = await handleGeoRun(runReq, emptyDBEnv('right'), CTX)
  assert.equal(res.status, 202)
  const body = (await res.json()) as { success: boolean; data: { started: boolean } }
  assert.equal(body.success, true)
  assert.equal(body.data.started, true)
})

test('authorized preview returns an empty summary when there are no runs', async () => {
  const res = await handleGeoPreview(req('right'), emptyDBEnv('right'))
  assert.equal(res.status, 200)
  const body = (await res.json()) as { success: boolean; data: { empty?: boolean } }
  assert.equal(body.success, true)
  assert.equal(body.data.empty, true)
})
