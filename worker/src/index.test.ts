import assert from 'node:assert/strict';
import test from 'node:test';
import worker from './index.ts';
import type { Env } from './types.ts';

const env = { ALLOWED_ORIGIN: 'https://islandmountain.io' } as Env;
const ctx = {} as ExecutionContext;
const base = 'https://island-mountain-funnel.example.test';

test('browser routes reject requests without an Origin header', async () => {
  for (const [method, path] of [
    ['POST', '/api/chat'],
    ['GET', '/api/history?sessionId=test-session'],
  ] as const) {
    const response = await worker.fetch(new Request(`${base}${path}`, { method }), env, ctx);
    assert.equal(response.status, 403, `${method} ${path}`);
  }
});

test('browser routes reject an untrusted Origin header', async () => {
  const response = await worker.fetch(
    new Request(`${base}/api/chat`, {
      method: 'POST',
      headers: { Origin: 'https://attacker.example' },
    }),
    env,
    ctx,
  );
  assert.equal(response.status, 403);
});

test('the direct lead submission route is not exposed', async () => {
  const response = await worker.fetch(
    new Request(`${base}/api/lead`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://islandmountain.io',
      },
      body: '{}',
    }),
    env,
    ctx,
  );
  assert.equal(response.status, 404);
});

test('allowed browser traffic and public health checks still reach their handlers', async () => {
  const chat = await worker.fetch(
    new Request(`${base}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://islandmountain.io',
      },
      body: '{}',
    }),
    env,
    ctx,
  );
  assert.equal(chat.status, 400);

  const health = await worker.fetch(new Request(`${base}/api/health`), env, ctx);
  assert.equal(health.status, 200);
});
