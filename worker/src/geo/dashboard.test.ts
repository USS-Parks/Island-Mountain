import { test } from 'node:test'
import assert from 'node:assert/strict'
import { aggregateRun, trendByRun, renderDashboard } from './dashboard.ts'
import type { GeoSnapshot } from './store.ts'

function snap(over: Partial<GeoSnapshot>): GeoSnapshot {
  return {
    id: 'x',
    run_id: 'r',
    run_date: '2026-08-11T16:00:00.000Z',
    engine: 'claude',
    prompt_id: 'p1',
    prompt_text: 'P1',
    im_mentioned: 0,
    im_cited: 0,
    im_position: null,
    competitors: '[]',
    sov: 0,
    citations: '[]',
    raw_answer: '',
    ...over
  }
}

test('aggregateRun computes rates, per-engine, prompts, and competitor tally', () => {
  const rows = [
    snap({
      engine: 'claude',
      prompt_id: 'p1',
      im_mentioned: 1,
      im_cited: 1,
      im_position: 1,
      sov: 1,
      competitors: '["goabacus"]'
    }),
    snap({
      engine: 'openai',
      prompt_id: 'p1',
      im_mentioned: 0,
      im_cited: 0,
      sov: 0,
      competitors: '["goabacus","Abacus.AI"]'
    }),
    snap({
      engine: 'claude',
      prompt_id: 'p2',
      im_mentioned: 1,
      im_cited: 0,
      im_position: 2,
      sov: 0.5,
      competitors: '["goabacus"]'
    })
  ]
  const a = aggregateRun(rows)
  assert.equal(a.cells, 3)
  assert.equal(Math.round(a.mentionRate * 100), 67) // 2 of 3
  assert.equal(Math.round(a.citeRate * 100), 33) // 1 of 3
  assert.equal(a.byEngine.length, 2)
  assert.equal(a.prompts.length, 2)
  assert.equal(a.competitors[0].name, 'goabacus')
  assert.equal(a.competitors[0].count, 3)
})

test('trendByRun groups by run_date, ascending, with per-engine averages', () => {
  const rows = [
    snap({ run_date: '2026-08-11T16:00:00.000Z', engine: 'claude', sov: 1 }),
    snap({ run_date: '2026-08-04T16:00:00.000Z', engine: 'claude', sov: 0 }),
    snap({ run_date: '2026-08-11T16:00:00.000Z', engine: 'openai', sov: 0.5 })
  ]
  const t = trendByRun(rows)
  assert.equal(t.length, 2)
  assert.equal(t[0].run_date, '2026-08-04T16:00:00.000Z')
  assert.equal(t[1].overall, 0.75) // (1 + 0.5) / 2
  assert.equal(t[1].byEngine.claude, 1)
})

test('renderDashboard produces an empty state when there are no snapshots', () => {
  const html = renderDashboard([], [], Date.UTC(2026, 7, 11, 16, 0, 0))
  assert.match(html, /No runs yet/)
  assert.match(html, /<!doctype html>/i)
})

test('renderDashboard renders panels when snapshots exist', () => {
  const rows = [snap({ im_mentioned: 1, im_cited: 1, im_position: 1, sov: 1 })]
  const html = renderDashboard(rows, rows, Date.UTC(2026, 7, 11, 16, 0, 0))
  assert.match(html, /Share of Voice/)
  assert.match(html, /By prompt/)
  assert.match(html, /Who else shows up/)
})
