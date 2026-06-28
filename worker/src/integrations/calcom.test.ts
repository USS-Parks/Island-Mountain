import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAvailableSlots,
  createBooking,
  spokenTime,
  defaultSlotWindow,
} from './calcom.ts';
import type { Env } from '../types.ts';

const ENV = {
  CALCOM_API_KEY: 'cal_live_test',
  CALCOM_EVENT_TYPE_ID: '6140261',
  CALCOM_TIMEZONE: 'America/Denver',
} as unknown as Env;

function mockFetch(handler: (url: string, init?: RequestInit) => { status: number; json: unknown }) {
  const orig = globalThis.fetch;
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    const { status, json } = handler(url, init);
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => json,
      text: async () => JSON.stringify(json),
    } as Response;
  }) as typeof fetch;
  return () => {
    globalThis.fetch = orig;
  };
}

test('getAvailableSlots flattens, orders, caps, and adds spoken phrasing', async () => {
  const restore = mockFetch((url) => {
    assert.ok(url.includes('/v2/slots'));
    assert.ok(url.includes('eventTypeId=6140261'));
    return {
      status: 200,
      json: {
        data: {
          '2026-06-30': [{ start: '2026-06-30T10:30:00.000-06:00' }],
          '2026-06-29': [
            { start: '2026-06-29T10:00:00.000-06:00' },
            { start: '2026-06-29T10:30:00.000-06:00' },
          ],
        },
      },
    };
  });
  try {
    const slots = await getAvailableSlots(
      ENV,
      { fromISO: '2026-06-29T00:00:00Z', toISO: '2026-07-04T00:00:00Z', timeZone: 'America/Denver' },
      2,
    );
    assert.equal(slots.length, 2);
    // ordered earliest-first across days
    assert.equal(slots[0].startISO, '2026-06-29T10:00:00.000-06:00');
    assert.equal(slots[1].startISO, '2026-06-29T10:30:00.000-06:00');
    assert.match(slots[0].spoken, /Monday, June 29 at 10:00 AM/);
  } finally {
    restore();
  }
});

test('getAvailableSlots returns [] on non-2xx (graceful)', async () => {
  const restore = mockFetch(() => ({ status: 500, json: { error: 'boom' } }));
  try {
    const slots = await getAvailableSlots(ENV, {
      fromISO: 'a',
      toISO: 'b',
      timeZone: 'America/Denver',
    });
    assert.deepEqual(slots, []);
  } finally {
    restore();
  }
});

test('getAvailableSlots returns [] when unconfigured', async () => {
  const slots = await getAvailableSlots({} as Env, { fromISO: 'a', toISO: 'b', timeZone: 'UTC' });
  assert.deepEqual(slots, []);
});

test('createBooking posts the v2 shape and returns uid on success', async () => {
  let sentBody: Record<string, unknown> = {};
  const restore = mockFetch((url, init) => {
    assert.ok(url.endsWith('/v2/bookings'));
    sentBody = JSON.parse(String(init?.body));
    return { status: 201, json: { status: 'success', data: { uid: 'bk_123', start: sentBody.start } } };
  });
  try {
    const r = await createBooking(ENV, {
      startISO: '2026-06-29T10:00:00.000-06:00',
      name: 'Jane Doe',
      email: 'jane@example.com',
      timeZone: 'America/Denver',
      sessionId: 'voice:call_1',
      leadId: 'lead_42',
      notes: 'Healthcare HIPAA, Summit Base',
    });
    assert.equal(r.ok, true);
    assert.equal(r.uid, 'bk_123');
    assert.equal(sentBody.eventTypeId, 6140261);
    assert.equal((sentBody.attendee as { email: string }).email, 'jane@example.com');
    assert.equal((sentBody.metadata as { leadId: string }).leadId, 'lead_42');
  } finally {
    restore();
  }
});

test('createBooking surfaces an error instead of throwing', async () => {
  const restore = mockFetch(() => ({
    status: 400,
    json: { status: 'error', error: { message: 'no_available_users_found_error' } },
  }));
  try {
    const r = await createBooking(ENV, {
      startISO: '2026-06-29T10:00:00.000-06:00',
      name: 'Jane',
      email: 'jane@example.com',
      timeZone: 'America/Denver',
      sessionId: 'voice:call_1',
    });
    assert.equal(r.ok, false);
    assert.equal(r.error, 'no_available_users_found_error');
  } finally {
    restore();
  }
});

test('spokenTime renders a natural phrase in the given tz', () => {
  const s = spokenTime('2026-06-29T10:00:00.000-06:00', 'America/Denver');
  assert.equal(s, 'Monday, June 29 at 10:00 AM');
});

test('defaultSlotWindow starts ~tomorrow and spans the requested days', () => {
  const now = Date.UTC(2026, 5, 27, 12, 0, 0); // 2026-06-27T12:00Z
  const { fromISO, toISO } = defaultSlotWindow(now, 14);
  assert.equal(fromISO, '2026-06-28T12:00:00.000Z');
  assert.equal(toISO, '2026-07-11T12:00:00.000Z');
});
