import { test } from 'node:test'
import assert from 'node:assert/strict'
import { scoreLead, type LeadFields } from './qualifier.ts'

test('hot: named workflow, on-site access, 30 days, HIPAA, decision-maker', () => {
  const fields: LeadFields = {
    name: 'A',
    email: 'a@x.com',
    use_case: 'prior-auth packet assembly, run by the billing team',
    onsite_access: 'Yes, we can host you with the billing team',
    system_interest: 'a deployment',
    timeline: 'Within 30 days',
    compliance: ['HIPAA'],
    decision_maker: "Yes - I'm the primary decision-maker"
  }
  const r = scoreLead(fields)
  assert.equal(r.score, 'hot')
  assert.equal(r.recommendedAction, 'scoping_call')
  assert.ok(r.points >= 8, `points ${r.points}`)
})

test('cold: just researching, 6+ months → docs', () => {
  const r = scoreLead({
    name: 'B',
    email: 'b@x.com',
    system_interest: 'Just researching / need documentation',
    timeline: '6+ months / Just planning'
  })
  assert.equal(r.score, 'cold')
  assert.equal(r.recommendedAction, 'send_docs')
})

test('warm without access or a scoping ask → followup', () => {
  const r = scoreLead({
    name: 'C',
    email: 'c@x.com',
    use_case: 'reviewing inbound vendor contracts',
    system_interest: 'Not sure yet, still figuring out what we need',
    timeline: '3-6 months',
    decision_maker: 'Evaluating options for my team',
    compliance: ['HIPAA']
  })
  assert.equal(r.score, 'warm')
  assert.equal(r.recommendedAction, 'followup')
})

test('confirmed on-site access forces scoping_call even when only warm', () => {
  const r = scoreLead({
    name: 'D',
    email: 'd@x.com',
    use_case: 'summarizing incident reports for the safety desk',
    onsite_access: 'Yes, happy to have you sit with the crew for a week',
    system_interest: 'Not sure yet',
    timeline: '3-6 months'
  })
  assert.equal(r.score, 'warm')
  assert.equal(r.recommendedAction, 'scoping_call')
})

test('an explicit scoping ask forces scoping_call even when only warm', () => {
  const r = scoreLead({
    name: 'E',
    email: 'e@x.com',
    use_case: 'consolidating case file summaries',
    system_interest: 'Custom / scoping call needed',
    timeline: '3-6 months',
    decision_maker: 'Evaluating options for my team',
    compliance: ['ITAR / CUI / Export Control']
  })
  assert.notEqual(r.score, 'cold')
  assert.equal(r.recommendedAction, 'scoping_call')
})

test('remote-only scores no access point; a named workflow still counts', () => {
  const base = {
    name: 'F',
    email: 'f@x.com',
    use_case: 'intake triage across the records team',
    timeline: '1-3 months'
  }
  const remote = scoreLead({ ...base, onsite_access: 'Remote only, no site visits' })
  const onsite = scoreLead({ ...base, onsite_access: 'Yes, we can host you' })
  assert.equal(onsite.points, remote.points + 2)
  assert.ok(remote.points >= 5, `named workflow should still score: ${remote.points}`)
})

test('a vague "we want AI" scores below a workflow with an owner', () => {
  const base = { name: 'G', email: 'g@x.com', timeline: '1-3 months' }
  const vague = scoreLead({ ...base, use_case: 'AI' })
  const named = scoreLead({ ...base, use_case: 'discharge summaries, written by the nurse leads' })
  assert.ok(named.points > vague.points, `named ${named.points} vs vague ${vague.points}`)
})

test('compliance "None / Internal Use Only" scores no compliance point', () => {
  const base = {
    name: 'H',
    email: 'h@x.com',
    use_case: 'intake triage across the records team',
    system_interest: 'a deployment',
    timeline: '1-3 months'
  }
  const withNone = scoreLead({ ...base, compliance: ['None / Internal Use Only'] })
  const withReal = scoreLead({ ...base, compliance: ['HIPAA'] })
  assert.ok(
    withReal.points === withNone.points + 1,
    `real ${withReal.points} none ${withNone.points}`
  )
})

test('sparse lead (intent only, no workflow) is cold + docs', () => {
  const r = scoreLead({ name: 'I', email: 'i@x.com', system_interest: 'a deployment' })
  assert.equal(r.score, 'cold')
  assert.equal(r.recommendedAction, 'send_docs')
})
