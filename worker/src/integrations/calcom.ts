import type { Env } from '../types'

/**
 * Cal.com API v2 client for the voice agent's live in-call booking.
 *
 * Two operations the voice tools need:
 *  - getAvailableSlots → read open times for the scoping-call event type
 *  - createBooking     → reserve a chosen slot for the caller
 *
 * Booking metadata carries sessionId + leadId so the existing
 * `/api/booking-webhook` (BOOKING_CREATED) correlates back to the lead and runs
 * the same mark-booked → alert Basho → GA4 schedule_call path as the chat flow.
 */

const CAL_API = 'https://api.cal.com/v2'
const SLOTS_API_VERSION = '2024-09-04'
const BOOKINGS_API_VERSION = '2024-08-13'

export interface Slot {
  /** Machine-precise start, e.g. "2026-06-29T10:00:00.000-06:00". */
  startISO: string
  /** Natural phrasing for the agent to speak, e.g. "Monday, June 29 at 10:00 AM". */
  spoken: string
}

export interface SlotQuery {
  fromISO: string
  toISO: string
  timeZone: string
}

interface SlotsResponse {
  data?: Record<string, { start: string }[]>
}

/**
 * Available slots for `CALCOM_EVENT_TYPE_ID`, flattened, time-ordered, capped.
 * Cal.com already honors the event's minimum booking notice. Best-effort:
 * returns [] on any failure (caller speaks a graceful fallback).
 */
export async function getAvailableSlots(env: Env, q: SlotQuery, limit = 5): Promise<Slot[]> {
  if (!env.CALCOM_API_KEY || !env.CALCOM_EVENT_TYPE_ID) return []
  const url =
    `${CAL_API}/slots?eventTypeId=${encodeURIComponent(env.CALCOM_EVENT_TYPE_ID)}` +
    `&start=${encodeURIComponent(q.fromISO)}&end=${encodeURIComponent(q.toISO)}` +
    `&timeZone=${encodeURIComponent(q.timeZone)}`
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.CALCOM_API_KEY}`,
        'cal-api-version': SLOTS_API_VERSION
      }
    })
    if (!res.ok) {
      console.error(
        'calcom slots non-2xx:',
        res.status,
        (await res.text().catch(() => '')).slice(0, 300)
      )
      return []
    }
    const body = (await res.json()) as SlotsResponse
    const starts = Object.values(body.data ?? {})
      .flat()
      .map((s) => s.start)
      .filter((s): s is string => typeof s === 'string')
      .sort()
    return starts
      .slice(0, limit)
      .map((startISO) => ({ startISO, spoken: spokenTime(startISO, q.timeZone) }))
  } catch (err) {
    console.error('getAvailableSlots failed:', err)
    return []
  }
}

export interface BookingInput {
  startISO: string
  name: string
  email: string
  timeZone: string
  sessionId: string
  leadId?: string
  notes?: string
}

export interface BookingResult {
  ok: boolean
  uid?: string
  startISO?: string
  error?: string
}

interface BookingResponse {
  status?: string
  data?: { uid?: string; start?: string }
  error?: { message?: string }
}

/**
 * Reserve a slot. Returns { ok:false, error } on failure so the agent can offer
 * another time instead of dead-ending the call.
 */
export async function createBooking(env: Env, input: BookingInput): Promise<BookingResult> {
  if (!env.CALCOM_API_KEY || !env.CALCOM_EVENT_TYPE_ID) {
    return { ok: false, error: 'booking-not-configured' }
  }
  const metadata: Record<string, string> = { sessionId: input.sessionId }
  if (input.leadId) metadata.leadId = input.leadId

  const payload: Record<string, unknown> = {
    start: input.startISO,
    eventTypeId: Number(env.CALCOM_EVENT_TYPE_ID),
    attendee: {
      name: input.name,
      email: input.email,
      timeZone: input.timeZone,
      language: 'en'
    },
    metadata
  }
  if (input.notes) payload.bookingFieldsResponses = { notes: input.notes.slice(0, 500) }

  try {
    const res = await fetch(`${CAL_API}/bookings`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.CALCOM_API_KEY}`,
        'cal-api-version': BOOKINGS_API_VERSION,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    const body = (await res.json().catch(() => ({}))) as BookingResponse
    if (!res.ok || body.status === 'error') {
      const msg = body.error?.message || `http_${res.status}`
      console.error('calcom booking failed:', res.status, msg)
      return { ok: false, error: msg }
    }
    return { ok: true, uid: body.data?.uid, startISO: body.data?.start ?? input.startISO }
  } catch (err) {
    console.error('createBooking failed:', err)
    return { ok: false, error: 'network' }
  }
}

/**
 * Natural spoken phrasing of an ISO instant in a timezone, e.g.
 * "Monday, June 29 at 10:00 AM". The voice model applies its own number-speech
 * rules when reading it aloud.
 */
export function spokenTime(startISO: string, timeZone: string): string {
  const d = new Date(startISO)
  if (Number.isNaN(d.getTime())) return startISO
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  const ampm = get('dayPeriod')
  return `${get('weekday')}, ${get('month')} ${get('day')} at ${get('hour')}:${get('minute')} ${ampm}`.trim()
}

/** Default look-ahead window [tomorrow 00:00Z, +days] as ISO strings. */
export function defaultSlotWindow(nowMs: number, days = 14): { fromISO: string; toISO: string } {
  const from = new Date(nowMs + 24 * 60 * 60 * 1000)
  const to = new Date(nowMs + days * 24 * 60 * 60 * 1000)
  return { fromISO: from.toISOString(), toISO: to.toISOString() }
}

/** An upcoming booking, normalized for the daily brief's call-prep cards. */
export interface UpcomingBooking {
  uid: string
  startISO: string
  name: string | null
  email: string | null
  /** From booking metadata when the funnel set it; the join key back to a lead. */
  leadId: string | null
  spoken: string
}

interface RawBooking {
  uid?: string
  start?: string
  attendees?: { name?: string; email?: string }[]
  metadata?: Record<string, unknown>
}

interface BookingsListResponse {
  data?: RawBooking[]
}

function normalizeBooking(b: RawBooking, tz: string): UpcomingBooking | null {
  const startISO = typeof b.start === 'string' ? b.start : ''
  if (!startISO) return null
  const attendee = b.attendees?.[0]
  const leadId = typeof b.metadata?.leadId === 'string' ? b.metadata.leadId : null
  return {
    uid: b.uid ?? '',
    startISO,
    name: attendee?.name ?? null,
    email: attendee?.email ?? null,
    leadId,
    spoken: spokenTime(startISO, tz)
  }
}

/**
 * Upcoming bookings starting within the next `days`, earliest first. The date
 * window is applied client-side (we only rely on the well-supported
 * `status=upcoming` filter) so the read can't break on a query-param mismatch.
 * Best-effort: [] on any failure, so the brief still sends its other sections.
 */
export async function getUpcomingBookings(
  env: Env,
  days = 2,
  nowMs = Date.now(),
  limit = 10
): Promise<UpcomingBooking[]> {
  if (!env.CALCOM_API_KEY) return []
  const tz = env.CALCOM_TIMEZONE || 'America/Los_Angeles'
  try {
    const res = await fetch(`${CAL_API}/bookings?status=upcoming`, {
      headers: {
        Authorization: `Bearer ${env.CALCOM_API_KEY}`,
        'cal-api-version': BOOKINGS_API_VERSION
      }
    })
    if (!res.ok) {
      console.error(
        'calcom bookings non-2xx:',
        res.status,
        (await res.text().catch(() => '')).slice(0, 300)
      )
      return []
    }
    const body = (await res.json()) as BookingsListResponse
    const raw = Array.isArray(body.data) ? body.data : []
    const horizon = nowMs + days * 86_400_000
    return raw
      .map((b) => normalizeBooking(b, tz))
      .filter((b): b is UpcomingBooking => b !== null)
      .filter((b) => {
        const t = new Date(b.startISO).getTime()
        return Number.isFinite(t) && t >= nowMs && t <= horizon
      })
      .sort((a, b) => new Date(a.startISO).getTime() - new Date(b.startISO).getTime())
      .slice(0, limit)
  } catch (err) {
    console.error('getUpcomingBookings failed:', err)
    return []
  }
}
