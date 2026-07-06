import assert from 'node:assert/strict';
import test from 'node:test';
import { enforceLimits } from './ratelimit.ts';
import type { Env } from './types.ts';

test('rate limiting fails closed when counter storage fails', async () => {
  const env = {
    SESSIONS: {
      get: async () => '0',
      put: async () => { throw new Error('counter storage unavailable'); },
    },
    DB: {
      prepare: () => { throw new Error('counter storage unavailable'); },
    },
  } as unknown as Env;

  await assert.rejects(
    enforceLimits(env, '203.0.113.10', 'test-session', new Date('2026-07-05T12:00:00Z')),
    /counter storage unavailable/,
  );
});
