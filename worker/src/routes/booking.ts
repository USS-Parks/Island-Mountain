import type { Env } from '../types';
import { jsonResponse } from '../cors';
import { verifyCalSignature } from '../booking';
import { setLeadStatus } from '../integrations/d1';
import { sendEmail, esc } from '../integrations/resend';
import { ga4Event } from '../integrations/ga4';

interface CalWebhookBody {
  triggerEvent?: string;
  payload?: {
    metadata?: Record<string, string>;
    title?: string;
    startTime?: string;
    attendees?: { email?: string; name?: string }[];
    responses?: Record<string, { value?: string }>;
  };
}

/**
 * POST /api/booking-webhook — Cal.com booking events.
 * Marks the correlated lead 'booked', alerts Basho, fires GA4 schedule_call.
 */
export async function handleBookingWebhook(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');
  const raw = await request.text();

  const sig =
    request.headers.get('X-Cal-Signature-256') || request.headers.get('x-cal-signature-256');
  if (!(await verifyCalSignature(env, raw, sig))) {
    return jsonResponse({ success: false, error: 'Invalid signature.' }, 401, origin, env);
  }

  let body: CalWebhookBody;
  try {
    body = JSON.parse(raw) as CalWebhookBody;
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON.' }, 400, origin, env);
  }

  // Only act on new bookings.
  if (body.triggerEvent && body.triggerEvent !== 'BOOKING_CREATED') {
    return jsonResponse({ success: true, data: { ignored: body.triggerEvent } }, 200, origin, env);
  }

  const meta = body.payload?.metadata ?? {};
  const leadId = meta.leadId;
  const sessionId = meta.sessionId || 'unknown';
  const attendee = body.payload?.attendees?.[0] ?? {};
  const startTime = body.payload?.startTime ?? '';

  if (leadId) await setLeadStatus(env, leadId, 'booked');

  await sendEmail(env, {
    to: env.ALERT_EMAIL,
    subject: `📅 Scoping call booked — ${attendee.name || attendee.email || 'a lead'}`,
    html:
      `<div style="font-family:system-ui,Arial,sans-serif">` +
      `<h2 style="color:#b45309">Scoping call booked</h2>` +
      `<p><strong>${esc(attendee.name || '')}</strong> (${esc(attendee.email || '')})</p>` +
      `<p>When: ${esc(startTime)}</p>` +
      `<p>Lead id: ${esc(leadId || 'n/a')} · Session: ${esc(sessionId)}</p></div>`,
  });

  await ga4Event(
    env,
    'schedule_call',
    { source: 'chat', lead_id: leadId ?? '', currency: 'USD', value: 120000 },
    sessionId,
  );

  return jsonResponse({ success: true, data: { booked: true, leadId: leadId ?? null } }, 200, origin, env);
}
