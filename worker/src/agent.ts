import type { Env } from './types';
import type { ChatTurn } from './session';
import {
  callMessages,
  blocksToText,
  toolUses,
  type AnthropicMessage,
  type ContentBlock,
} from './anthropic';
import { SUBMIT_LEAD_TOOL, scoreLead, type LeadFields, type ScoreResult } from './qualifier';
import { processLead, type LeadContext, type ProcessedLead } from './lead-processor';

const MAX_TOOL_HOPS = 3;

export const AGENT_FALLBACK =
  "I'm having a little trouble connecting right now. You can reach Basho directly " +
  'at 1-801-609-1130 or basho@islandmountain.io and he’ll help you straight away.';

export interface TurnResult {
  finalText: string;
  fallback: boolean;
  lead?: { fields: LeadFields; scored: ScoreResult; processed: ProcessedLead };
}

/**
 * Run one conversational turn. The model may call submit_lead; we score the
 * extracted fields deterministically, route them (PROMPT 05), feed the result
 * back, and let the model produce its final reply. History is the plain
 * text turns; tool round-trips happen in a scratch message array and are not
 * persisted as visible turns.
 */
export async function runTurn(
  env: Env,
  model: string,
  system: string,
  history: ChatTurn[],
  ctx: LeadContext,
): Promise<TurnResult> {
  const messages: AnthropicMessage[] = history.map((t) => ({ role: t.role, content: t.content }));
  let lead: TurnResult['lead'];

  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
    const res = await callMessages({ env, model, system, messages, tools: [SUBMIT_LEAD_TOOL] });
    if (!res.ok) {
      console.error('Anthropic call failed:', res.status, res.error);
      return { finalText: AGENT_FALLBACK, fallback: true, lead };
    }

    const uses = toolUses(res.blocks);
    if (res.stopReason === 'tool_use' && uses.length > 0) {
      // Record the assistant's tool-use turn, then answer each tool call.
      messages.push({ role: 'assistant', content: res.blocks });
      const results: ContentBlock[] = [];
      for (const use of uses) {
        if (use.name === 'submit_lead') {
          const fields = (use.input ?? {}) as LeadFields;
          const scored = scoreLead(fields);
          const processed = await processLead(env, fields, scored, ctx);
          lead = { fields, scored, processed };
          results.push({
            type: 'tool_result',
            tool_use_id: use.id,
            content: JSON.stringify({
              ok: true,
              score: scored.score,
              recommended_action: scored.recommendedAction,
              lead_id: processed.id,
            }),
          });
        } else {
          results.push({
            type: 'tool_result',
            tool_use_id: use.id,
            content: JSON.stringify({ ok: false, error: 'unknown tool' }),
          });
        }
      }
      messages.push({ role: 'user', content: results });
      continue; // let the model produce its follow-up reply
    }

    // Plain text completion.
    const text = blocksToText(res.blocks).trim();
    return { finalText: text || AGENT_FALLBACK, fallback: text.length === 0, lead };
  }

  // Exhausted hops — return best-effort.
  return { finalText: AGENT_FALLBACK, fallback: true, lead };
}
