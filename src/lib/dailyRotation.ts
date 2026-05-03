/**
 * Deterministic daily-visitor rotation for the Daily Special slot.
 *
 * Phase 1 does not render the daily screen yet; this module exists so the
 * rotation rule is locked in and tested before Phase 2 builds the UI.
 *
 * The rule: each calendar day picks one visitor from `DAILY_VISITORS`. The
 * roster cycles in 7-week blocks, so visitor i hosts week i for 7 days, then
 * visitor i+1 takes over the next week, and after 7 weeks the cycle wraps
 * back to visitor 0. `dayInWeek` (0..6, 0 = Monday) is the position inside
 * the current visitor's week and is what UI uses to vary the daily prompt.
 *
 * UTC math is intentional. `EPOCH_MS` is a UTC instant, the input `Date` is
 * converted to ms via `getTime()` which is also UTC, and 86_400_000 ms is
 * the length of a day everywhere except across DST boundaries, which UTC
 * does not have. Do not "helpfully" switch this to local-time arithmetic;
 * the rotation must be the same in Berlin, Tokyo, and Honolulu on the same
 * UTC day, otherwise the catalogue's `lastDailySeed` desyncs across devices.
 */
import { DAILY_VISITORS } from '../data/dailyRoster';

/**
 * UTC midnight of the rotation epoch (Monday 4 May 2026). Picked so that
 * `dayInWeek` reads 0 for Monday in the natural ISO ordering.
 */
const EPOCH_MS = Date.UTC(2026, 4, 4);

/**
 * One day expressed in milliseconds. UTC has no DST, so this constant is
 * stable across every calendar day the app will ever see.
 */
const DAY_MS = 86_400_000;

export interface DailyAssignment {
  /** The id of the daily-special visitor for the given date. */
  visitorId: string;
  /** Position inside the current visitor's themed week. 0 = Monday, 6 = Sunday. */
  dayInWeek: number;
  /** Whole weeks elapsed since the epoch. Negative for pre-epoch dates. */
  weekIndex: number;
}

/**
 * Returns the daily visitor assignment for `now`.
 *
 * Pure: depends only on the input. The function takes `now` as a parameter
 * (rather than calling `Date.now()`) so callers can test it deterministically
 * and so the same input always yields the same output.
 *
 * Defensive against pre-epoch dates: `((day % 7) + 7) % 7` keeps `dayInWeek`
 * in [0..6] even when `day` is negative, and `Math.abs(weekIndex)` keeps the
 * roster lookup index non-negative so we never crash on an early date that
 * a future calendar feature might hand us.
 */
export function getDailyVisitor(now: Date): DailyAssignment {
  const ms = now.getTime() - EPOCH_MS;
  const day = Math.floor(ms / DAY_MS);
  const weekIndex = Math.floor(day / 7);
  const dayInWeek = ((day % 7) + 7) % 7;
  const rosterIndex = Math.abs(weekIndex) % DAILY_VISITORS.length;
  const visitorId = DAILY_VISITORS[rosterIndex].id;
  return { visitorId, dayInWeek, weekIndex };
}
