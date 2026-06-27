-- Island Mountain lead store (D1 / SQLite at edge).
-- Apply locally:  npx wrangler d1 execute island-mountain-leads --local --file=./schema.sql
-- Apply remote:   npx wrangler d1 execute island-mountain-leads --remote --file=./schema.sql
--
-- D2 keeps the Google Sheet as the human-facing destination; this table is the
-- self-owned mirror so lead data is never trapped in a third-party silo and can
-- back a future CRM/dashboard (PROMPT 08 /api/stats).

CREATE TABLE IF NOT EXISTS leads (
  id              TEXT PRIMARY KEY,        -- uuid
  session_id      TEXT,
  created_at      TEXT NOT NULL,           -- ISO 8601
  -- Contact + role
  name            TEXT,
  email           TEXT,
  phone           TEXT,
  job_title       TEXT,
  organization    TEXT,
  -- Qualification signals (mirror the contact form)
  industry        TEXT,
  use_case        TEXT,
  concurrent_users TEXT,
  system_interest TEXT,                    -- Summit tier of interest
  compliance      TEXT,                    -- JSON array
  timeline        TEXT,
  budget          TEXT,
  decision_maker  TEXT,
  infrastructure  TEXT,
  current_setup   TEXT,
  docs_requested  TEXT,                    -- JSON array
  -- Scoring + routing
  score           TEXT,                    -- 'hot' | 'warm' | 'cold'
  score_reason    TEXT,
  source          TEXT,                    -- 'chat' | 'voice' | 'form'
  -- Attribution
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  landing_page    TEXT,
  referrer        TEXT,
  -- Lifecycle
  status          TEXT DEFAULT 'new',      -- new | alerted | booked | docs_sent
  transcript      TEXT,                    -- full conversation JSON
  recording_url   TEXT                     -- voice call recording (Vapi), if retained
);

CREATE INDEX IF NOT EXISTS idx_leads_email   ON leads (email);
CREATE INDEX IF NOT EXISTS idx_leads_session ON leads (session_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_score   ON leads (score);
