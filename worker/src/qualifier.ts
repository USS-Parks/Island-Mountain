/**
 * Conversational qualifier — the "filter serious buyers from tire-kickers"
 * intent that justified the original 4-step form, ported to a tool the model
 * calls when it has gathered enough signal. Scoring is fully deterministic and
 * unit-tested (qualifier.test.ts) — the model extracts, the code decides.
 *
 * Scoring is keyed to the practice, not to a catalog: the workflow they named
 * and whether they can give us on-site access carry the most weight, because
 * immersion is the part of a deployment that can't be swapped out.
 */

/** Mirrors the contact.html form fields. All optional — the model fills what it learns. */
export interface LeadFields {
  name?: string
  email?: string
  phone?: string
  job_title?: string
  organization?: string
  industry?: string
  /** The workflow that hurts, and whose desk it runs through. The strongest signal. */
  use_case?: string
  concurrent_users?: string
  /**
   * Whether they can put us on-site with the people who do the work.
   * Scored and emailed to Basho; not persisted to D1 or the sheet, which keep
   * their existing columns.
   */
  onsite_access?: string
  /** What they're after: a deployment, a piece of advice, or "just researching". */
  system_interest?: string
  compliance?: string[]
  timeline?: string
  budget?: string
  decision_maker?: string
  infrastructure?: string
  current_setup?: string
  docs_requested?: string[]
  notes?: string
}

export type Score = 'hot' | 'warm' | 'cold'
export type RecommendedAction = 'scoping_call' | 'send_docs' | 'followup'

export interface ScoreResult {
  score: Score
  recommendedAction: RecommendedAction
  reason: string
  points: number
}

/** Anthropic tool definition injected into the chat call. */
export const SUBMIT_LEAD_TOOL = {
  name: 'submit_lead',
  description:
    'Register the visitor as a qualified lead. Call this ONCE you have gathered ' +
    'enough signal — at minimum the visitor’s name and email, plus as much of: ' +
    'the workflow that hurts and whose desk it runs through, whether they can ' +
    'give us on-site access to the people who do that job, industry and ' +
    'regulatory regime, headcount or concurrency, deployment timeline, whether ' +
    'they are the decision-maker, and what infrastructure already exists. Do ' +
    'NOT call it on the first message, or before you have their email. Pass ' +
    'exactly what the visitor told you; leave unknown fields out rather than ' +
    'guessing.',
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
      use_case: {
        type: 'string',
        description:
          'The specific workflow they want help with and whose desk it runs ' +
          'through, in their own words. Be concrete: "intake summarization, ' +
          'run by two paralegals" beats "document AI".'
      },
      concurrent_users: { type: 'string' },
      onsite_access: {
        type: 'string',
        description:
          'Whether they can host an on-site immersion with the senior people ' +
          'who do that work. e.g. "yes, can host us with the records team", ' +
          '"probably, needs sign-off", "remote only", or leave out if unknown.'
      },
      system_interest: {
        type: 'string',
        description:
          'What they are after, in plain terms. e.g. "a deployment", ' +
          '"configuring hardware we already own", "scoping / not sure yet", ' +
          'or "just researching". Do not use configuration or product names.'
      },
      compliance: { type: 'array', items: { type: 'string' } },
      timeline: { type: 'string' },
      budget: { type: 'string' },
      decision_maker: { type: 'string' },
      infrastructure: { type: 'string' },
      current_setup: { type: 'string' },
      docs_requested: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string', description: 'Anything else useful for Basho.' }
    },
    required: ['name', 'email']
  }
} as const

// --- Deterministic scoring -------------------------------------------------

const lc = (s?: string) => (s ?? '').toLowerCase()

function timelinePoints(t?: string): number {
  const v = lc(t)
  if (/within 30|30 day|asap|immediately|this month/.test(v)) return 3
  if (/1-3|1 to 3|1–3|next quarter|couple months|few months/.test(v)) return 2
  if (/3-6|3 to 6|3–6/.test(v)) return 1
  return 0 // 6+, planning, researching, unknown
}

/**
 * The workflow they named. A concrete workflow with an owner is the strongest
 * thing a visitor can tell us; "we want AI" is not a workflow.
 */
function workflowPoints(u?: string): number {
  const v = lc(u).trim()
  if (!v) return 0
  const vague = /^(ai|llm|chatbot|automation|efficiency|not sure|general|exploring|various)/
  if (vague.test(v) && v.length < 40) return 1
  // Named the people or the desk it runs through, not just the task.
  if (/team|staff|clerk|paralegal|analyst|nurse|officer|dept|department|desk|our \w+s\b/.test(v))
    return 3
  return v.length >= 25 ? 2 : 1
}

/** Can they put us in the room. Immersion is the part we can't swap out. */
function accessPoints(a?: string): number {
  const v = lc(a)
  if (!v) return 0
  if (/\bno\b|remote only|can'?t host|not possible|won'?t work/.test(v)) return 0
  if (/yes|happy to|can host|of course|absolutely|already have space/.test(v)) return 2
  if (/probably|likely|maybe|sign-?off|approval|should be able/.test(v)) return 1
  return 0
}

interface IntentInfo {
  points: number
  researching: boolean
  scoping: boolean
}
/** What they say they're after, now that there is nothing to name. */
function intentInfo(s?: string): IntentInfo {
  const v = lc(s)
  if (!v) return { points: 0, researching: false, scoping: false }
  if (/research|documentation|just looking|browsing/.test(v)) {
    return { points: 0, researching: true, scoping: false }
  }
  if (/custom|scoping|enterprise|deploy|estate|roll ?out|build slot/.test(v))
    return { points: 1, researching: false, scoping: true }
  return { points: 1, researching: false, scoping: false }
}

function decisionMakerPoints(d?: string): number {
  const v = lc(d)
  if (/primary|i am the|i'm the|yes.*decision|final say|owner|founder|ceo|cto/.test(v)) return 2
  if (/evaluat|committee|procurement|part of|team/.test(v)) return 1
  return 0
}

function compliancePoints(c?: string[]): number {
  if (!c || c.length === 0) return 0
  const real = c.some((x) => !/none|internal use only|n\/a/i.test(x))
  return real ? 1 : 0
}

/**
 * hot / warm / cold from deterministic signals, out of 12. "Just researching"
 * short-circuits to docs; a named workflow plus on-site access is what earns a
 * scoping call, because that is what a deployment needs to start.
 *
 * Budget is still captured and emailed, but no longer scored: its old bands
 * were the retired price ladder, and there is no public price list to anchor
 * new ones to. Its weight moved to workflow and access.
 */
export function scoreLead(fields: LeadFields): ScoreResult {
  const intent = intentInfo(fields.system_interest)
  const wPts = workflowPoints(fields.use_case)
  const aPts = accessPoints(fields.onsite_access)
  const tPts = timelinePoints(fields.timeline)
  const dPts = decisionMakerPoints(fields.decision_maker)
  const cPts = compliancePoints(fields.compliance)
  const points = intent.points + wPts + aPts + tPts + dPts + cPts

  const wantsDocs = (fields.docs_requested?.length ?? 0) > 0
  const researching = intent.researching || (tPts === 0 && wPts === 0 && points <= 2)

  let score: Score
  let recommendedAction: RecommendedAction

  if (researching) {
    score = 'cold'
    recommendedAction = 'send_docs'
  } else if (points >= 8 && tPts >= 2) {
    score = 'hot'
    recommendedAction = 'scoping_call'
  } else if (points >= 4) {
    score = 'warm'
    recommendedAction = intent.scoping || aPts >= 2 ? 'scoping_call' : 'followup'
  } else {
    score = 'cold'
    recommendedAction = 'send_docs'
  }

  // An explicit scoping ask, or confirmed on-site access, always merits the offer.
  const readyToScope = intent.scoping || aPts >= 2
  if (readyToScope && score !== 'cold') recommendedAction = 'scoping_call'
  if (wantsDocs && score === 'cold') recommendedAction = 'send_docs'

  const reason =
    `workflow=${wPts} access=${aPts} timeline=${tPts} intent=${intent.points} ` +
    `decision=${dPts} compliance=${cPts} → ${points}/12` +
    (researching ? ' (researching)' : '') +
    (readyToScope ? ' (ready to scope)' : '')

  return { score, recommendedAction, reason, points }
}
