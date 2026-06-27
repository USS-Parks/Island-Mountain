import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scoreLead, type LeadFields } from './qualifier.ts';

test('hot: Pinnacle, 30 days, HIPAA, decision-maker, $160k+', () => {
  const fields: LeadFields = {
    name: 'A', email: 'a@x.com',
    system_interest: 'Summit Pinnacle Tier Waitlist ($175K-$225K)',
    timeline: 'Within 30 days',
    compliance: ['HIPAA'],
    decision_maker: "Yes - I'm the primary decision-maker",
    budget: '$160,000+',
  };
  const r = scoreLead(fields);
  assert.equal(r.score, 'hot');
  assert.equal(r.recommendedAction, 'scoping_call');
  assert.ok(r.points >= 8, `points ${r.points}`);
});

test('cold: just researching, 6+ months, no budget → docs', () => {
  const r = scoreLead({
    name: 'B', email: 'b@x.com',
    system_interest: 'Just researching / need documentation',
    timeline: '6+ months / Just planning',
    budget: '',
  });
  assert.equal(r.score, 'cold');
  assert.equal(r.recommendedAction, 'send_docs');
});

test('warm: Base, 3-6 months, evaluating, still determining, HIPAA → followup', () => {
  const r = scoreLead({
    name: 'C', email: 'c@x.com',
    system_interest: 'Summit Base Tier ($59K-$69K)',
    timeline: '3-6 months',
    decision_maker: 'Evaluating options for my team',
    budget: 'Still determining',
    compliance: ['HIPAA'],
  });
  assert.equal(r.score, 'warm');
  assert.equal(r.recommendedAction, 'followup');
});

test('high-tier interest forces scoping_call even when only warm', () => {
  const r = scoreLead({
    name: 'D', email: 'd@x.com',
    system_interest: 'Custom / Scoping Call Needed',
    timeline: '3-6 months',
    decision_maker: 'Evaluating options for my team',
    compliance: ['ITAR / CUI / Export Control'],
  });
  assert.notEqual(r.score, 'cold');
  assert.equal(r.recommendedAction, 'scoping_call');
});

test('compliance "None / Internal Use Only" scores no compliance point', () => {
  const withNone = scoreLead({
    name: 'E', email: 'e@x.com',
    system_interest: 'Summit Base Tier ($59K-$69K)',
    timeline: '1-3 months',
    compliance: ['None / Internal Use Only'],
  });
  const withReal = scoreLead({
    name: 'E', email: 'e@x.com',
    system_interest: 'Summit Base Tier ($59K-$69K)',
    timeline: '1-3 months',
    compliance: ['HIPAA'],
  });
  assert.ok(withReal.points === withNone.points + 1, `real ${withReal.points} none ${withNone.points}`);
});

test('sparse lead (tier only) is cold + docs', () => {
  const r = scoreLead({ name: 'F', email: 'f@x.com', system_interest: 'Summit Base' });
  assert.equal(r.score, 'cold');
  assert.equal(r.recommendedAction, 'send_docs');
});

test('near-term + budget + decision-maker without high tier is hot', () => {
  const r = scoreLead({
    name: 'G', email: 'g@x.com',
    system_interest: 'Summit Ridge Tier ($95K-$120K)',
    timeline: 'Within 30 days',
    budget: '$80,000 - $160,000',
    decision_maker: "Yes - primary decision-maker",
    compliance: ['FedRAMP / Government'],
  });
  assert.equal(r.score, 'hot');
});
