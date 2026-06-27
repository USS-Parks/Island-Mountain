import type { Env } from '../types';

/**
 * Append a lead row to the Google Sheet via a bound Apps Script web app
 * (see worker/sheets-apps-script.gs for the script + deploy steps).
 * Best-effort: never throws.
 */
export async function appendToSheet(env: Env, row: Record<string, unknown>): Promise<boolean> {
  if (!env.SHEETS_WEBHOOK_URL) return false;
  try {
    const res = await fetch(env.SHEETS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(row),
      redirect: 'follow',
    });
    return res.ok;
  } catch (err) {
    console.error('appendToSheet failed:', err);
    return false;
  }
}
