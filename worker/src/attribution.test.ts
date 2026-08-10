import assert from 'node:assert/strict';
import test from 'node:test';
import worker from './index.ts';
import type { Env } from './types.ts';

// Fake KV + D1: just enough surface for the worksheet/slot routes. Captures
// the leads INSERT so the tests can assert attribution lands in bound values.
function fakeEnv() {
  const inserts: { sql: string; args: unknown[] }[] = [];
  const DB = {
    prepare(sql: string) {
      return {
        bind(...args: unknown[]) {
          return {
            async first() {
              if (sql.includes('rate_limits')) return { count: 1 };
              return null;
            },
            async run() {
              if (sql.startsWith('INSERT INTO leads')) inserts.push({ sql, args });
              return {};
            },
            async all() {
              return { results: [] };
            },
          };
        },
      };
    },
  };
  const SESSIONS = {
    async get() {
      return null;
    },
    async put() {},
  };
  const env = { ALLOWED_ORIGIN: 'https://islandmountain.io', SESSIONS, DB } as unknown as Env;
  return { env, inserts };
}

function boundValue(insert: { sql: string; args: unknown[] }, col: string): unknown {
  const m = insert.sql.match(/INSERT INTO leads \(([^)]+)\)/);
  assert.ok(m, 'leads INSERT captured');
  const cols = m[1].split(',').map((c) => c.trim());
  const idx = cols.indexOf(col);
  assert.notEqual(idx, -1, `${col} in INSERT columns`);
  return insert.args[idx];
}

const ctx = {} as ExecutionContext;
const base = 'https://island-mountain-funnel.example.test';
const headers = { 'Content-Type': 'application/json', Origin: 'https://islandmountain.io' };

test('worksheet requests persist first-touch UTM into the lead row', async () => {
  const { env, inserts } = fakeEnv();
  const res = await worker.fetch(
    new Request(`${base}/api/worksheet`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: 'reader@example.com',
        industry: 'Legal',
        seats: 10,
        monthly_spend: 1000,
        growth_pct: 10,
        utm_source: 'linkedin',
        utm_campaign: 'authority-2026',
        utm_content: 'ptest',
        landing_page: '/blog/example.html?utm_content=ptest',
        referrer: '',
      }),
    }),
    env,
    ctx,
  );
  assert.equal(res.status, 200, await res.clone().text());
  assert.equal(inserts.length, 1);
  assert.equal(boundValue(inserts[0], 'utm_content'), 'ptest');
  assert.equal(boundValue(inserts[0], 'utm_campaign'), 'authority-2026');
  assert.equal(boundValue(inserts[0], 'landing_page'), '/blog/example.html?utm_content=ptest');
});

test('slot claims persist first-touch UTM into the lead row', async () => {
  const { env, inserts } = fakeEnv();
  const res = await worker.fetch(
    new Request(`${base}/api/slot`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Test Reader',
        email: 'claim@example.com',
        workload: 'document drafting',
        utm_source: 'linkedin',
        utm_campaign: 'authority-2026',
        utm_content: 'p07',
        landing_page: '/blog/example.html?utm_content=p07',
      }),
    }),
    env,
    ctx,
  );
  assert.equal(res.status, 200, await res.clone().text());
  assert.equal(inserts.length, 1);
  assert.equal(boundValue(inserts[0], 'utm_content'), 'p07');
});
