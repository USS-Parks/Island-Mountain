import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildCallPreps, composeBrief } from './brief.ts'
import type { PipelineLead, PipelineTotals } from './integrations/pipeline.ts'
import type { UpcomingBooking } from './integrations/calcom.ts'

function lead(over: Partial<PipelineLead> = {}): PipelineLead {
  return {
    id: 'lead_1',
    created_at: '2026-08-10T09:00:00Z',
    name: 'Ada Byron',
    email: 'ada@calc.io',
    organization: 'Analytical Engine Co',
    job_title: 'CTO',
    industry: 'Legal',
    use_case: 'privileged doc review',
    timeline: '30 days',
    score: 'hot',
    score_reason: 'named workflow + decision maker',
    source: 'form',
    status: 'booked',
    compliance: JSON.stringify(['HIPAA', 'ITAR']),
    budget: null,
    transcript: '[]',
    ...over
  }
}

function booking(over: Partial<UpcomingBooking> = {}): UpcomingBooking {
  return {
    uid: 'bk1',
    startISO: '2026-08-11T17:00:00.000Z',
    name: 'Ada',
    email: 'ada@calc.io',
    leadId: 'lead_1',
    spoken: 'Tuesday, August 11 at 11:00 AM',
    ...over
  }
}

const EMPTY_TOTALS: PipelineTotals = { total: 0, byScore: {}, byStatus: {} }

test('buildCallPreps joins booking to lead by leadId and parses compliance', () => {
  const preps = buildCallPreps([booking()], [lead()])
  assert.equal(preps.length, 1)
  assert.equal(preps[0].organization, 'Analytical Engine Co')
  assert.equal(preps[0].use_case, 'privileged doc review')
  assert.deepEqual(preps[0].compliance, ['HIPAA', 'ITAR'])
  assert.equal(preps[0].spoken, 'Tuesday, August 11 at 11:00 AM')
})

test('buildCallPreps falls back to an email match when leadId is absent', () => {
  const preps = buildCallPreps([booking({ leadId: null })], [lead({ id: 'other' })])
  assert.equal(preps[0].organization, 'Analytical Engine Co')
})

test('buildCallPreps with no matching lead uses the booking attendee', () => {
  const preps = buildCallPreps([booking({ leadId: null, email: 'ghost@x.io', name: 'Ghost' })], [])
  assert.equal(preps[0].name, 'Ghost')
  assert.equal(preps[0].email, 'ghost@x.io')
  assert.equal(preps[0].organization, null)
  assert.deepEqual(preps[0].compliance, [])
})

test('composeBrief renders counts in the subject and all four sections', () => {
  const preps = buildCallPreps([booking()], [lead()])
  const { subject, html } = composeBrief({
    now: new Date('2026-08-11T16:15:00Z'),
    newLeads: [lead({ id: 'n1', name: 'New Guy', status: 'new' })],
    agingWarm: [lead({ id: 'a1', name: 'Cold Warm', score: 'warm', status: 'new' })],
    calls: preps,
    totals: { total: 3, byScore: { hot: 1, warm: 2 }, byStatus: { new: 2, booked: 1 } }
  })
  assert.match(subject, /\[Purser\] 1 new · 1 call · 1 aging/)
  assert.ok(html.includes("tomorrow's calls"))
  assert.ok(html.includes('New since yesterday'))
  assert.ok(html.includes('Warm &amp; aging'))
  assert.ok(html.includes('Pipeline board'))
  assert.ok(html.includes('Analytical Engine Co'))
})

test('composeBrief emits a quiet-day brief when everything is empty', () => {
  const { subject, html } = composeBrief({
    now: new Date('2026-08-11T16:15:00Z'),
    newLeads: [],
    agingWarm: [],
    calls: [],
    totals: { total: 12, byScore: { cold: 12 }, byStatus: { new: 12 } }
  })
  assert.match(subject, /Quiet pipeline/)
  assert.ok(html.includes('Quiet day'))
  assert.ok(html.includes('12 leads on the board'))
})

test('composeBrief escapes lead-provided text', () => {
  const { html } = composeBrief({
    now: new Date('2026-08-11T16:15:00Z'),
    newLeads: [lead({ id: 'x', name: '<script>alert(1)</script>', status: 'new' })],
    agingWarm: [],
    calls: [],
    totals: EMPTY_TOTALS
  })
  assert.ok(!html.includes('<script>alert(1)</script>'))
  assert.ok(html.includes('&lt;script&gt;'))
})
