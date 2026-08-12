/**
 * D1-backed idempotency ledger for the publisher, replacing the Windows path's local
 * JSONL. One row per (campaign_id, kind); repeated cron fires are safe no-ops.
 */
import type { Env } from '../types'

export type LedgerKind = 'blog' | 'linkedin_image' | 'linkedin_post' | 'linkedin_comment'

export async function ensureLedger(env: Env): Promise<void> {
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS publisher_ledger (' +
      'campaign_id TEXT NOT NULL, kind TEXT NOT NULL, remote_id TEXT, ' +
      'occurred_at TEXT NOT NULL, PRIMARY KEY (campaign_id, kind))'
  ).run()
}

export async function done(env: Env, campaignId: string, kind: LedgerKind): Promise<boolean> {
  const row = await env.DB.prepare(
    'SELECT 1 AS present FROM publisher_ledger WHERE campaign_id = ? AND kind = ? LIMIT 1'
  )
    .bind(campaignId, kind)
    .first<{ present: number }>()
  return row != null
}

export async function remoteId(
  env: Env,
  campaignId: string,
  kind: LedgerKind
): Promise<string | null> {
  const row = await env.DB.prepare(
    'SELECT remote_id FROM publisher_ledger WHERE campaign_id = ? AND kind = ? LIMIT 1'
  )
    .bind(campaignId, kind)
    .first<{ remote_id: string | null }>()
  return row ? row.remote_id : null
}

export async function record(
  env: Env,
  campaignId: string,
  kind: LedgerKind,
  rid: string
): Promise<void> {
  await env.DB.prepare(
    'INSERT OR IGNORE INTO publisher_ledger (campaign_id, kind, remote_id, occurred_at) ' +
      'VALUES (?, ?, ?, ?)'
  )
    .bind(campaignId, kind, rid, new Date().toISOString())
    .run()
}
