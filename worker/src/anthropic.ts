import type { Env } from './types';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_TOKENS = 1024;

// --- Content-block model (supports text + tool use round-trips) -------------

export type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; content: string };

export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

export interface ToolDef {
  name: string;
  description: string;
  input_schema: unknown;
}

export interface AnthropicCallInput {
  env: Env;
  model: string;
  system: string;
  messages: AnthropicMessage[];
  tools?: readonly ToolDef[];
}

export type AnthropicResult =
  | { ok: true; stopReason: string | null; blocks: ContentBlock[]; model: string }
  | { ok: false; status: number; error: string };

interface AnthropicResponseBody {
  content?: ContentBlock[];
  stop_reason?: string | null;
}

/**
 * Single non-streaming Messages API call. Returns the assistant content blocks
 * and stop_reason, or a structured failure (never throws) so callers can
 * degrade gracefully.
 */
export async function callMessages(input: AnthropicCallInput): Promise<AnthropicResult> {
  const { env, model, system, messages, tools } = input;
  if (!env.ANTHROPIC_API_KEY) {
    return { ok: false, status: 503, error: 'ANTHROPIC_API_KEY not configured' };
  }
  const payload: Record<string, unknown> = { model, max_tokens: MAX_TOKENS, system, messages };
  if (tools && tools.length > 0) payload.tools = tools;

  let res: Response;
  try {
    res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return { ok: false, status: 502, error: `network: ${String(err)}` };
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return { ok: false, status: res.status, error: body.slice(0, 500) };
  }
  let data: AnthropicResponseBody;
  try {
    data = (await res.json()) as AnthropicResponseBody;
  } catch {
    return { ok: false, status: 502, error: 'invalid JSON from Anthropic' };
  }
  const blocks = Array.isArray(data.content) ? data.content : [];
  return { ok: true, stopReason: data.stop_reason ?? null, blocks, model };
}

/** Concatenate the text blocks of an assistant response. */
export function blocksToText(blocks: ContentBlock[]): string {
  return blocks
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map((b) => b.text)
    .join('');
}

/** Tool-use blocks of an assistant response. */
export function toolUses(
  blocks: ContentBlock[],
): { id: string; name: string; input: unknown }[] {
  return blocks.filter(
    (b): b is { type: 'tool_use'; id: string; name: string; input: unknown } =>
      b.type === 'tool_use',
  );
}
