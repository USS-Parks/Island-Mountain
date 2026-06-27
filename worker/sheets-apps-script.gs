/**
 * Island Mountain — lead sink for Google Sheets.
 *
 * Deploy once, then put the resulting web-app URL into the Worker secret:
 *   npx wrangler secret put SHEETS_WEBHOOK_URL
 *
 * Setup:
 *  1. Open the lead spreadsheet:
 *     https://docs.google.com/spreadsheets/d/1x-3WFgG9pwQ5r2C92bxYu3JIt-B2Nloo91pUc-oJZ8E/edit
 *  2. Extensions → Apps Script. Paste this file. Save.
 *  3. Deploy → New deployment → type "Web app".
 *       Execute as: Me.  Who has access: "Anyone".
 *  4. Copy the Web app URL (…/exec) → set it as SHEETS_WEBHOOK_URL.
 *
 * The Worker POSTs a flat JSON lead object; the first POST writes the header row.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Leads')
      || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Leads');

    var headers = [
      'created_at', 'score_label', 'recommended_action', 'name', 'email', 'phone',
      'job_title', 'organization', 'industry', 'use_case', 'concurrent_users',
      'system_interest', 'compliance', 'timeline', 'budget', 'decision_maker',
      'infrastructure', 'current_setup', 'docs_requested', 'source', 'utm_source',
      'utm_medium', 'utm_campaign', 'landing_page', 'referrer', 'score_reason', 'id',
    ];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    var row = headers.map(function (h) { return data[h] != null ? data[h] : ''; });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
