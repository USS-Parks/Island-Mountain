import type { Env } from './types';

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface SessionMeta {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_page?: string;
  referrer?: string;
}

export interface SessionData {
  id: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatTurn[];
  meta: SessionMeta;
}

/** Stored history is capped here; the API request is capped tighter (below). */
const MAX_STORED_MESSAGES = 40;
/** Messages sent to the model per turn (token-budget control). */
export const MAX_CONTEXT_MESSAGES = 24;
/** Per-message input cap (chars) to bound token spend + abuse. */
export const MAX_MESSAGE_CHARS = 4000;
/** KV TTL: sessions expire after 7 days of no writes. */
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

const keyFor = (id: string) => `session:${id}`;

export async function loadSession(env: Env, id: string): Promise<SessionData | null> {
  const raw = await env.SESSIONS.get(keyFor(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function newSession(id: string, meta: SessionMeta): SessionData {
  const now = new Date().toISOString();
  return { id, createdAt: now, updatedAt: now, messages: [], meta };
}

export async function saveSession(env: Env, session: SessionData): Promise<void> {
  session.updatedAt = new Date().toISOString();
  if (session.messages.length > MAX_STORED_MESSAGES) {
    session.messages = session.messages.slice(-MAX_STORED_MESSAGES);
  }
  await env.SESSIONS.put(keyFor(session.id), JSON.stringify(session), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
}

/** The trailing window of turns to send to the model. */
export function contextMessages(session: SessionData): ChatTurn[] {
  return session.messages.slice(-MAX_CONTEXT_MESSAGES);
}
