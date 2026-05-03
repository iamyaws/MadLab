import { describe, it, expect } from 'vitest';
import { getDailyVisitor } from '../dailyRotation';
import { DAILY_VISITORS } from '../../data/dailyRoster';

/**
 * All dates use `Date.UTC(...)` so the suite is immune to local-timezone
 * offsets. Mixing `new Date(2026, 4, 4)` (local) into these specs would
 * make CI green or red depending on the runner's TZ, which is exactly the
 * flakiness `dailyRotation.ts`'s UTC math is designed to avoid.
 */
describe('getDailyVisitor', () => {
  it('returns Moonling on the epoch day with dayInWeek 0 and weekIndex 0', () => {
    const epoch = new Date(Date.UTC(2026, 4, 4));
    expect(getDailyVisitor(epoch)).toEqual({
      visitorId: 'moonling',
      dayInWeek: 0,
      weekIndex: 0,
    });
  });

  it('walks dayInWeek 1..6 across the first themed week without changing visitor', () => {
    const tuesday = new Date(Date.UTC(2026, 4, 5));
    expect(getDailyVisitor(tuesday)).toEqual({
      visitorId: 'moonling',
      dayInWeek: 1,
      weekIndex: 0,
    });

    const sunday = new Date(Date.UTC(2026, 4, 10));
    expect(getDailyVisitor(sunday)).toEqual({
      visitorId: 'moonling',
      dayInWeek: 6,
      weekIndex: 0,
    });
  });

  it('rolls over to weekIndex 1 dayInWeek 0 on the next Monday', () => {
    const nextMonday = new Date(Date.UTC(2026, 4, 11));
    expect(getDailyVisitor(nextMonday)).toEqual({
      visitorId: 'hooks',
      dayInWeek: 0,
      weekIndex: 1,
    });
  });

  it('reaches each of the 7 visitors across 7 successive weeks', () => {
    const expectedOrder = ['moonling', 'hooks', 'tinker', 'beep', 'snorri', 'whisp', 'doc'];
    expect(expectedOrder.length).toBe(DAILY_VISITORS.length);

    for (let weekIndex = 0; weekIndex < 7; weekIndex += 1) {
      const monday = new Date(Date.UTC(2026, 4, 4 + weekIndex * 7));
      const result = getDailyVisitor(monday);
      expect(result.weekIndex).toBe(weekIndex);
      expect(result.dayInWeek).toBe(0);
      expect(result.visitorId).toBe(expectedOrder[weekIndex]);
    }
  });

  it('cycles back to Moonling on weekIndex 7 (the 8th week)', () => {
    // 49 days after epoch is Monday 22 June 2026.
    const week7Monday = new Date(Date.UTC(2026, 5, 22));
    const result = getDailyVisitor(week7Monday);
    expect(result.weekIndex).toBe(7);
    expect(result.dayInWeek).toBe(0);
    expect(result.visitorId).toBe('moonling');
  });

  it('does not crash on a pre-epoch date and returns a defined visitor', () => {
    const preEpoch = new Date(Date.UTC(2026, 0, 1));
    expect(() => getDailyVisitor(preEpoch)).not.toThrow();
    const result = getDailyVisitor(preEpoch);
    expect(typeof result.visitorId).toBe('string');
    expect(result.visitorId.length).toBeGreaterThan(0);
    expect(DAILY_VISITORS.some((v) => v.id === result.visitorId)).toBe(true);
    // dayInWeek must stay in [0..6] even when the underlying day count is negative.
    expect(result.dayInWeek).toBeGreaterThanOrEqual(0);
    expect(result.dayInWeek).toBeLessThanOrEqual(6);
  });

  it('does not crash on a far-future date and returns a defined visitor', () => {
    const farFuture = new Date(Date.UTC(2030, 0, 1));
    expect(() => getDailyVisitor(farFuture)).not.toThrow();
    const result = getDailyVisitor(farFuture);
    expect(typeof result.visitorId).toBe('string');
    expect(result.visitorId.length).toBeGreaterThan(0);
    expect(DAILY_VISITORS.some((v) => v.id === result.visitorId)).toBe(true);
  });

  it('returns the same assignment for noon and midnight UTC of the same calendar day', () => {
    const midnight = new Date(Date.UTC(2026, 4, 6, 0, 0, 0));
    const noon = new Date(Date.UTC(2026, 4, 6, 12, 0, 0));
    const lateEvening = new Date(Date.UTC(2026, 4, 6, 23, 59, 59));
    const a = getDailyVisitor(midnight);
    const b = getDailyVisitor(noon);
    const c = getDailyVisitor(lateEvening);
    expect(a).toEqual(b);
    expect(b).toEqual(c);
  });
});
