import type { Env } from '../types'

/**
 * Lookout engine adapters. Each normalizes one AI engine's grounded answer into
 * { answer, citations[] }. Every adapter is key-guarded and best-effort: a
 * missing key or any error returns null (that engine is simply skipped for the
 * run), so the suite runs on whatever keys are set. Base modes + a small token
 * cap keep per-query cost in the pennies (see the PSPR cost guardrail).
 */

export interface EngineResult {
  answer: string
  citations: string[]
}

export interface Engine {
  id: string
  query(env: Env, prompt: string): Promise<EngineResult | null>
}

const MAX_TOKENS = 900
const TIMEOUT_MS = 25_000

/** fetch with a hard timeout so one slow engine can't stall the whole run. */
function timedFetch(url: string, init: RequestInit): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) })
}

function nonOk(engine: string, status: number): null {
  console.error(`geo engine ${engine} non-2xx: ${status}`)
  return null
}

// --- Claude (Messages API + web_search server tool) -------------------------

interface ClaudeBlock {
  type?: string
  text?: string
  citations?: { url?: string }[]
  content?: { url?: string }[]
}
interface ClaudeResp {
  content?: ClaudeBlock[]
}

async function queryClaude(env: Env, prompt: string): Promise<EngineResult | null> {
  if (!env.ANTHROPIC_API_KEY) return null
  const model = env.CHAT_MODEL_ROUTINE || 'claude-sonnet-4-6'
  try {
    const res = await timedFetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }]
      })
    })
    if (!res.ok) return nonOk('claude', res.status)
    const data = (await res.json()) as ClaudeResp
    const blocks = Array.isArray(data.content) ? data.content : []
    const answer = blocks
      .filter((b) => b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text as string)
      .join('')
    const citations = new Set<string>()
    for (const b of blocks) {
      for (const c of b.citations ?? []) if (c.url) citations.add(c.url)
      if (b.type === 'web_search_tool_result')
        for (const r of b.content ?? []) if (r.url) citations.add(r.url)
    }
    return { answer, citations: [...citations] }
  } catch (err) {
    console.error('queryClaude failed:', err)
    return null
  }
}

// --- OpenAI (Responses API + web_search tool) -------------------------------

interface OpenAIAnnotation {
  type?: string
  url?: string
}
interface OpenAIContent {
  text?: string
  annotations?: OpenAIAnnotation[]
}
interface OpenAIResp {
  output_text?: string
  output?: { content?: OpenAIContent[] }[]
}

async function queryOpenAI(env: Env, prompt: string): Promise<EngineResult | null> {
  if (!env.OPENAI_API_KEY) return null
  const model = env.OPENAI_MODEL || 'gpt-4o'
  try {
    const res = await timedFetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input: prompt,
        tools: [{ type: 'web_search' }],
        max_output_tokens: MAX_TOKENS
      })
    })
    if (!res.ok) return nonOk('openai', res.status)
    const data = (await res.json()) as OpenAIResp
    let answer = typeof data.output_text === 'string' ? data.output_text : ''
    const citations = new Set<string>()
    for (const item of data.output ?? []) {
      for (const c of item.content ?? []) {
        if (!answer && typeof c.text === 'string') answer += c.text
        for (const a of c.annotations ?? [])
          if (a.type === 'url_citation' && a.url) citations.add(a.url)
      }
    }
    return { answer, citations: [...citations] }
  } catch (err) {
    console.error('queryOpenAI failed:', err)
    return null
  }
}

// --- Gemini (generateContent + Google Search grounding) ---------------------

interface GeminiResp {
  candidates?: {
    content?: { parts?: { text?: string }[] }
    groundingMetadata?: { groundingChunks?: { web?: { uri?: string } }[] }
  }[]
}

async function queryGemini(env: Env, prompt: string): Promise<EngineResult | null> {
  if (!env.GEMINI_API_KEY) return null
  const model = env.GEMINI_MODEL || 'gemini-flash-latest'
  try {
    const res = await timedFetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'x-goog-api-key': env.GEMINI_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { maxOutputTokens: MAX_TOKENS }
        })
      }
    )
    if (!res.ok) return nonOk('gemini', res.status)
    const data = (await res.json()) as GeminiResp
    const cand = data.candidates?.[0]
    const answer = (cand?.content?.parts ?? [])
      .filter((p) => typeof p.text === 'string')
      .map((p) => p.text as string)
      .join('')
    const citations = new Set<string>()
    for (const ch of cand?.groundingMetadata?.groundingChunks ?? [])
      if (ch.web?.uri) citations.add(ch.web.uri)
    return { answer, citations: [...citations] }
  } catch (err) {
    console.error('queryGemini failed:', err)
    return null
  }
}

// --- Perplexity (Sonar chat completions) ------------------------------------

interface PerplexityResp {
  choices?: { message?: { content?: string } }[]
  citations?: string[]
  search_results?: { url?: string }[]
}

async function queryPerplexity(env: Env, prompt: string): Promise<EngineResult | null> {
  if (!env.PERPLEXITY_API_KEY) return null
  const model = env.PERPLEXITY_MODEL || 'sonar'
  try {
    const res = await timedFetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PERPLEXITY_API_KEY}`,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: MAX_TOKENS
      })
    })
    if (!res.ok) return nonOk('perplexity', res.status)
    const data = (await res.json()) as PerplexityResp
    const answer = data.choices?.[0]?.message?.content ?? ''
    const citations = new Set<string>()
    for (const u of data.citations ?? []) if (typeof u === 'string') citations.add(u)
    for (const s of data.search_results ?? []) if (s.url) citations.add(s.url)
    return { answer, citations: [...citations] }
  } catch (err) {
    console.error('queryPerplexity failed:', err)
    return null
  }
}

export const ENGINES: Engine[] = [
  { id: 'claude', query: queryClaude },
  { id: 'openai', query: queryOpenAI },
  { id: 'gemini', query: queryGemini },
  { id: 'perplexity', query: queryPerplexity }
]
