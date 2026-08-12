import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ENGINES } from './engines.ts'
import type { Env } from '../types.ts'

function engine(id: string) {
  const e = ENGINES.find((x) => x.id === id)
  if (!e) throw new Error(`no engine ${id}`)
  return e
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

test('claude adapter parses text + web_search citations', async () => {
  const restore = mockFetch(() => ({
    status: 200,
    json: {
      content: [
        { type: 'text', text: 'Island Mountain AI does sovereign AI.' },
        {
          type: 'web_search_tool_result',
          content: [{ url: 'https://islandmountain.io' }, { url: 'https://ex.com' }]
        }
      ]
    }
  }))
  try {
    const r = await engine('claude').query({ ANTHROPIC_API_KEY: 'k' } as Env, 'q')
    assert.ok(r)
    assert.match(r.answer, /sovereign AI/)
    assert.ok(r.citations.includes('https://islandmountain.io'))
  } finally {
    restore()
  }
})

test('openai adapter parses output_text + url_citation annotations', async () => {
  const restore = mockFetch(() => ({
    status: 200,
    json: {
      output_text: 'Vendors include Island Mountain.',
      output: [
        {
          content: [
            {
              text: 'Vendors include Island Mountain.',
              annotations: [{ type: 'url_citation', url: 'https://islandmountain.io' }]
            }
          ]
        }
      ]
    }
  }))
  try {
    const r = await engine('openai').query({ OPENAI_API_KEY: 'k' } as Env, 'q')
    assert.ok(r)
    assert.match(r.answer, /Island Mountain/)
    assert.deepEqual(r.citations, ['https://islandmountain.io'])
  } finally {
    restore()
  }
})

test('gemini adapter parses parts + groundingChunks', async () => {
  const restore = mockFetch(() => ({
    status: 200,
    json: {
      candidates: [
        {
          content: { parts: [{ text: 'On-prem AI vendors: ...' }] },
          groundingMetadata: { groundingChunks: [{ web: { uri: 'https://islandmountain.io' } }] }
        }
      ]
    }
  }))
  try {
    const r = await engine('gemini').query({ GEMINI_API_KEY: 'k' } as Env, 'q')
    assert.ok(r)
    assert.match(r.answer, /On-prem/)
    assert.deepEqual(r.citations, ['https://islandmountain.io'])
  } finally {
    restore()
  }
})

test('perplexity adapter parses message content + citations', async () => {
  const restore = mockFetch(() => ({
    status: 200,
    json: {
      choices: [{ message: { content: 'Try Island Mountain AI.' } }],
      citations: ['https://islandmountain.io', 'https://ex.com']
    }
  }))
  try {
    const r = await engine('perplexity').query({ PERPLEXITY_API_KEY: 'k' } as Env, 'q')
    assert.ok(r)
    assert.match(r.answer, /Island Mountain AI/)
    assert.ok(r.citations.includes('https://islandmountain.io'))
  } finally {
    restore()
  }
})

test('every adapter returns null when its key is absent', async () => {
  for (const e of ENGINES) {
    assert.equal(await e.query({} as Env, 'q'), null)
  }
})

test('adapters return null on a non-2xx response', async () => {
  const restore = mockFetch(() => ({ status: 500, json: {} }))
  try {
    assert.equal(await engine('claude').query({ ANTHROPIC_API_KEY: 'k' } as Env, 'q'), null)
    assert.equal(await engine('perplexity').query({ PERPLEXITY_API_KEY: 'k' } as Env, 'q'), null)
  } finally {
    restore()
  }
})
