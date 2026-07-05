import assert from 'node:assert/strict';
import test from 'node:test';
import { verifyCalSignature } from './booking.ts';
import type { Env } from './types.ts';

test('Cal.com webhook verification fails closed when the secret is absent', async () => {
  const env = {} as Env;
  assert.equal(await verifyCalSignature(env, '{}', null), false);
});

test('Cal.com webhook verification accepts only a valid signature', async () => {
  const secret = 'test-webhook-secret';
  const body = '{"triggerEvent":"BOOKING_CREATED"}';
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  const signature = [...new Uint8Array(mac)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  const env = { WEBHOOK_SECRET: secret } as Env;

  assert.equal(await verifyCalSignature(env, body, signature), true);
  assert.equal(await verifyCalSignature(env, body, `${signature.slice(0, -1)}0`), false);
});
