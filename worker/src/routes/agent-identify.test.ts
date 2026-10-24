import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../index.ts';
import type { Env } from '../types.ts';

const env = { ALLOWED_ORIGIN: 'https://islandmountain.io' } as Env;
const ctx = {} as ExecutionContext;
const base = 'https://api.islandmountain.io';

async function identify(headers: Record<string, string>) {
  const response = await worker.fetch(
    new Request(`${base}/api/agent-identify`, { method: 'GET', headers }),
    env,
    ctx,
  );
  const body = (await response.json()) as {
    success: boolean;
    data: { recorded: Record<string, unknown>; note?: string };
  };
  return { response, body };
}

test('agent-identify is public — no Origin header required', async () => {
  const { response } = await identify({ 'X-Agent': 'ai-assistant' });
  assert.equal(response.status, 200);
});

test('agent-identify echoes the agent identity headers', async () => {
  const { body } = await identify({
    'X-Agent': 'ai-assistant',
    'X-Agent-Operator': 'Anthropic',
    'X-Agent-Product': 'Claude',
    'X-Agent-Purpose': 'answering-user-question',
  });
  assert.equal(body.success, true);
  assert.equal(body.data.recorded.operator, 'Anthropic');
  assert.equal(body.data.recorded.product, 'Claude');
  assert.equal(body.data.recorded.purpose, 'answering-user-question');
});

test('acting-for is DISCARDED without the explicit-consent marker', async () => {
  const { body } = await identify({
    'X-Agent': 'ai-assistant',
    'X-Agent-Acting-For': 'Jane Doe <jane@example.com>',
    // no X-Agent-User-Consent header
  });
  assert.equal(body.data.recorded.acting_for, 'not-recorded');
  assert.equal(body.data.note, 'acting-for ignored: missing X-Agent-User-Consent: explicit');
});

test('acting-for is DISCARDED when consent is anything but explicit', async () => {
  const { body } = await identify({
    'X-Agent': 'ai-assistant',
    'X-Agent-Acting-For': 'Jane Doe <jane@example.com>',
    'X-Agent-User-Consent': 'implied',
  });
  assert.equal(body.data.recorded.acting_for, 'not-recorded');
});

test('acting-for is kept ONLY with explicit consent', async () => {
  const { body } = await identify({
    'X-Agent': 'ai-assistant',
    'X-Agent-Acting-For': 'Jane Doe <jane@example.com>',
    'X-Agent-User-Consent': 'explicit',
  });
  assert.equal(body.data.recorded.acting_for, 'recorded-with-consent');
  assert.equal(body.data.note, undefined);
});
