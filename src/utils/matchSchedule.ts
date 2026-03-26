import type { Match } from '../types';

export type StatusVariant = 'scheduled' | 'soon' | 'live' | 'done' | 'bye';

export interface MatchDisplayStatus {
  label: string;
  variant: StatusVariant;
}

const SOON_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Derives the human-readable display status for a match.
 * Priority: completed > in_progress (from scores) > time-based > default scheduled.
 *
 * @param match - the match object
 * @param now   - current timestamp in ms (pass Date.now(); injected so callers can control updates)
 */
export function deriveDisplayStatus(match: Match, now: number): MatchDisplayStatus {
  if (match.status === 'bye') return { label: 'BYE', variant: 'bye' };
  if (match.status === 'completed') return { label: 'Finished', variant: 'done' };
  if (match.status === 'in_progress') return { label: 'In Progress', variant: 'live' };

  // pending — use scheduledAt if available, else default to "Scheduled"
  if (!match.scheduledAt) return { label: 'Scheduled', variant: 'scheduled' };

  if (now >= match.scheduledAt) return { label: 'In Progress', variant: 'live' };
  if (now >= match.scheduledAt - SOON_MS) return { label: 'Starting Soon', variant: 'soon' };
  return { label: 'Scheduled', variant: 'scheduled' };
}

/** Format a timestamp for display in the match node header */
export function formatScheduleTime(ts: number, now: number): string {
  const d = new Date(ts);
  const today = new Date(now);
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  const date = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return `${date} · ${time}`;
}

/** Convert a unix ms timestamp to the value expected by <input type="datetime-local"> */
export function tsToDatetimeLocal(ts: number): string {
  const d = new Date(ts);
  // Shift to local time and format as YYYY-MM-DDTHH:mm
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Parse a datetime-local input value back to a unix ms timestamp */
export function datetimeLocalToTs(value: string): number | undefined {
  if (!value) return undefined;
  return new Date(value).getTime() || undefined;
}
