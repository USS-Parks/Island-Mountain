import type { Env } from './types';
import type { ChatTurn } from './session';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_TOKENS = 1024;

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnthropicCallInput {
  env: Env;
  model: string;
  system: string;
  messages: AnthropicMessage[];
}

export type AnthropicResult =
  | { ok: true; text: string; model: string }
  | { ok: false; status: number; error: string };

export function toAnthropicMessages(turns: ChatTurn[]): AnthropicMessage[] {
  return turns.map((t) => ({ role: t.role, content: t.content }));
}

/**
 * Non-streaming call. Returns the assistant text or a structured failure
 * (never throws) so the chat route can degrade gracefully.
 */
export async function callAnthropic(input: AnthropicCallInput): Promise<AnthropicResult> {
  const { env, model, system, messages } = input;
  if (!env.ANTHROPIC_API_KEY) {
    return { ok: false, status: 503, error: 'ANTHROPIC_API_KEY not configured' };
  }
  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model, max_tokens: MAX_TOKENS, system, messages }),
    });
  } catch (err) {
    return { ok: false, status: 502, error: `network: ${String(err)}` };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: body.slice(0, 500) };
  }
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, status: 502, error: 'invalid JSON from Anthropic' };
  }
  const text = extractText(data);
  if (text === null) {
    return { ok: false, status: 502, error: 'no text content in response' };
  }
  return { ok: true, text, model };
}

interface AnthropicContentBlock {
  type: string;
  text?: string;
}
interface AnthropicResponseBody {
  content?: AnthropicContentBlock[];
}

function extractText(data: unknown): string | null {
  const body = data as AnthropicResponseBody;
  if (!body?.content || !Array.isArray(body.content)) return null;
  const text = body.content
    .filter((b) => b.type === 'text' && typeof b.text === 'string')
    .map((b) => b.text as string)
    .join('');
  return text.length > 0 ? text : null;
}

/**
 * Streaming call. Returns a ReadableStream of Anthropic SSE bytes (caller
 * re-emits a simplified SSE to the browser) plus a promise that resolves with
 * the full accumulated text for persistence. Returns ok:false on setup failure.
 */
export async function streamAnthropic(
  input: AnthropicCallInput,
): Promise<{ ok: true; response: Response } | { ok: false; status: number; error: string }> {
  const { env, model, system, messages } = input;
  if (!env.ANTHROPIC_API_KEY) {
    return { ok: false, status: 503, error: 'ANTHROPIC_API_KEY not configured' };
  }
  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model, max_tokens: MAX_TOKENS, system, messages, stream: true }),
    });
  } catch (err) {
    return { ok: false, status: 502, error: `network: ${String(err)}` };
  }
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: body.slice(0, 500) };
  }
  return { ok: true, response: res };
}

/** Parse a single Anthropic SSE `data:` JSON line into a text delta, if any. */
export function parseTextDelta(line: string): string | null {
  if (!line.startsWith('data:')) return null;
  const payload = line.slice(5).trim();
  if (!payload || payload === '[DONE]') return null;
  try {
    const evt = JSON.parse(payload) as {
      type?: string;
      delta?: { type?: string; text?: string };
    };
    if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
      return evt.delta.text ?? null;
    }
  } catch {
    /* ignore non-JSON keepalive lines */
  }
  return null;
}
