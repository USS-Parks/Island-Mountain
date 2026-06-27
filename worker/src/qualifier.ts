/**
 * Conversational qualifier — the "filter serious buyers from tire-kickers"
 * intent that justified the original 4-step form, ported to a tool the model
 * calls when it has gathered enough signal. Scoring is fully deterministic and
 * unit-tested (qualifier.test.ts) — the model extracts, the code decides.
 */

/** Mirrors the contact.html form fields. All optional — the model fills what it learns. */
export interface LeadFields {
  name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  organization?: string;
  industry?: string;
  use_case?: string;
  concurrent_users?: string;
  /** Summit tier of interest (or "just researching"). */
  system_interest?: string;
  compliance?: string[];
  timeline?: string;
  budget?: string;
  decision_maker?: string;
  infrastructure?: string;
  current_setup?: string;
  docs_requested?: string[];
  notes?: string;
}

export type Score = 'hot' | 'warm' | 'cold';
export type RecommendedAction = 'scoping_call' | 'send_docs' | 'followup';

export interface ScoreResult {
  score: Score;
  recommendedAction: RecommendedAction;
  reason: string;
  points: number;
}

/** Anthropic tool definition injected into the chat call. */
export const SUBMIT_LEAD_TOOL = {
  name: 'submit_lead',
  description:
    'Register the visitor as a qualified lead. Call this ONCE you have gathered ' +
    'enough signal — at minimum the visitor’s name and email, plus as much of: ' +
    'industry, primary use case, concurrent users, Summit tier of interest, ' +
    'compliance needs, deployment timeline, budget range, whether they are the ' +
    'decision-maker, and infrastructure readiness as they have shared. Do NOT ' +
    'call it on the first message, or before you have their email. Pass exactly ' +
    'what the visitor told you; leave unknown fields out rather than guessing.',
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      phone: { type: 'string' },
      job_title: { type: 'string' },
      organization: { type: 'string' },
      industry: { type: 'string' },
      use_case: { type: 'string' },
      concurrent_users: { type: 'string' },
      system_interest: {
        type: 'string',
        description: 'e.g. "Summit Base", "Summit Ridge", "Summit Pinnacle", "Custom / scoping", or "Just researching".',
      },
      compliance: { type: 'array', items: { type: 'string' } },
      timeline: { type: 'string' },
      budget: { type: 'string' },
      decision_maker: { type: 'string' },
      infrastructure: { type: 'string' },
      current_setup: { type: 'string' },
      docs_requested: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string', description: 'Anything else useful for Basho.' },
    },
    required: ['name', 'email'],
  },
} as const;

// --- Deterministic scoring -------------------------------------------------

const lc = (s?: string) => (s ?? '').toLowerCase();

function timelinePoints(t?: string): number {
  const v = lc(t);
  if (/within 30|30 day|asap|immediately|this month/.test(v)) return 3;
  if (/1-3|1 to 3|1–3|next quarter|couple months|few months/.test(v)) return 2;
  if (/3-6|3 to 6|3–6/.test(v)) return 1;
  return 0; // 6+, planning, researching, unknown
}

interface TierInfo { points: number; researching: boolean; scoping: boolean }
function tierInfo(s?: string): TierInfo {
  const v = lc(s);
  if (!v) return { points: 0, researching: false, scoping: false };
  if (/research|documentation|just looking|browsing/.test(v)) {
    return { points: 0, researching: true, scoping: false };
  }
  if (/pinnacle/.test(v)) return { points: 3, researching: false, scoping: true };
  if (/citadel|custom|scoping|enterprise/.test(v)) return { points: 3, researching: false, scoping: true };
  if (/ridge/.test(v)) return { points: 2, researching: false, scoping: false };
  if (/base|summit/.test(v)) return { points: 2, researching: false, scoping: false };
  if (/landfall|scout|ranger|pack leader/.test(v)) return { points: 1, researching: false, scoping: false };
  return { points: 0, researching: false, scoping: false };
}

function budgetPoints(b?: string): number {
  const v = lc(b);
  if (/160|175|200|225|\$2|\$1[6-9]/.test(v)) return 3;
  if (/80|95|100|120|150/.test(v)) return 2;
  if (/under|<\s*80|59|60|69|7\d,?000/.test(v)) return 1;
  return 0; // still determining, prefer not to say, unknown
}

function decisionMakerPoints(d?: string): number {
  const v = lc(d);
  if (/primary|i am the|i'm the|yes.*decision|final say|owner|founder|ceo|cto/.test(v)) return 2;
  if (/evaluat|committee|procurement|part of|team/.test(v)) return 1;
  return 0;
}

function compliancePoints(c?: string[]): number {
  if (!c || c.length === 0) return 0;
  const real = c.some((x) => !/none|internal use only|n\/a/i.test(x));
  return real ? 1 : 0;
}

/**
 * hot / warm / cold from deterministic signals. Encodes the original form's
 * notice logic: Pinnacle/custom → scoping call; "just researching" → docs.
 */
export function scoreLead(fields: LeadFields): ScoreResult {
  const tier = tierInfo(fields.system_interest);
  const tPts = timelinePoints(fields.timeline);
  const bPts = budgetPoints(fields.budget);
  const dPts = decisionMakerPoints(fields.decision_maker);
  const cPts = compliancePoints(fields.compliance);
  const points = tier.points + tPts + bPts + dPts + cPts;

  const wantsDocs = (fields.docs_requested?.length ?? 0) > 0;
  const researching = tier.researching || (tPts === 0 && bPts === 0 && points <= 2);

  let score: Score;
  let recommendedAction: RecommendedAction;

  if (researching) {
    score = 'cold';
    recommendedAction = 'send_docs';
  } else if (points >= 8 && tPts >= 2) {
    score = 'hot';
    recommendedAction = 'scoping_call';
  } else if (points >= 4) {
    score = 'warm';
    recommendedAction = tier.scoping ? 'scoping_call' : 'followup';
  } else {
    score = 'cold';
    recommendedAction = 'send_docs';
  }

  // A named high-tier interest always merits a scoping offer, even if warm.
  if (tier.scoping && score !== 'cold') recommendedAction = 'scoping_call';
  if (wantsDocs && score === 'cold') recommendedAction = 'send_docs';

  const reason =
    `tier=${tier.points} timeline=${tPts} budget=${bPts} ` +
    `decision=${dPts} compliance=${cPts} → ${points}/12` +
    (researching ? ' (researching)' : '') +
    (tier.scoping ? ' (high-tier)' : '');

  return { score, recommendedAction, reason, points };
}
