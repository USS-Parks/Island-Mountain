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
  utm_content     TEXT,                    -- per-post attribution (campaign pNN)
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

-- Atomic abuse-protection counters. Identifiers are SHA-256 hashes; raw IPs and
-- session IDs never enter this table. Expired rows are pruned once per UTC day.
CREATE TABLE IF NOT EXISTS rate_limits (
  counter_key TEXT PRIMARY KEY,
  count       INTEGER NOT NULL,
  expires_at  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits (expires_at);

-- NOOA Sales Brief (Purser) run receipts: one row per daily brief, for audit
-- (did it run, what did it see, did the email send). Read-only agent, so this
-- is the only thing it writes.
CREATE TABLE IF NOT EXISTS brief_runs (
  id           TEXT PRIMARY KEY,        -- uuid
  ran_at       TEXT NOT NULL,           -- ISO 8601
  new_count    INTEGER NOT NULL,        -- leads in the last 24h
  aging_count  INTEGER NOT NULL,        -- warm/hot going cold
  calls_count  INTEGER NOT NULL,        -- booked calls prepped
  total_leads  INTEGER NOT NULL,        -- whole-board size
  sent         INTEGER NOT NULL         -- 1 if the email dispatched, else 0
);

CREATE INDEX IF NOT EXISTS idx_brief_runs_ran ON brief_runs (ran_at);

-- Lookout (GEO watchstander): the tracked prompt set. Seeded from code on first
-- run; edit rows here afterward (no redeploy). active=0 retires a prompt.
CREATE TABLE IF NOT EXISTS geo_prompts (
  id       TEXT PRIMARY KEY,        -- stable slug, e.g. 'brand-what-is'
  category TEXT NOT NULL,           -- brand | category | competitor
  text     TEXT NOT NULL,           -- the prompt asked of each engine
  active   INTEGER NOT NULL DEFAULT 1
);

-- One row per (run, engine, prompt): did IM show up in that AI answer, was it
-- cited, where did it rank, who else appeared. raw_answer kept for audit.
CREATE TABLE IF NOT EXISTS geo_snapshots (
  id            TEXT PRIMARY KEY,   -- uuid
  run_id        TEXT NOT NULL,      -- groups one full run (uuid)
  run_date      TEXT NOT NULL,      -- ISO 8601
  engine        TEXT NOT NULL,      -- claude | openai | gemini | perplexity
  prompt_id     TEXT NOT NULL,
  prompt_text   TEXT,
  im_mentioned  INTEGER NOT NULL,   -- 0/1
  im_cited      INTEGER NOT NULL,   -- 0/1 (islandmountain.io in sources)
  im_position   INTEGER,            -- rank if the answer is a list, else NULL
  competitors   TEXT,               -- JSON array of competitor names seen
  sov           REAL,               -- share of voice 0..1 for this answer
  citations     TEXT,               -- JSON array of cited URLs
  raw_answer    TEXT                -- full answer text
);

CREATE INDEX IF NOT EXISTS idx_geo_snapshots_date   ON geo_snapshots (run_date);
CREATE INDEX IF NOT EXISTS idx_geo_snapshots_run    ON geo_snapshots (run_id);
CREATE INDEX IF NOT EXISTS idx_geo_snapshots_engine ON geo_snapshots (engine);
