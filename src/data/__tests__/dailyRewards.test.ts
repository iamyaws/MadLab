import { describe, it, expect } from 'vitest';
import {
  MOONLING_WEEK_REWARDS,
  getRewardForDay,
} from '../dailyRewards';

describe('MOONLING_WEEK_REWARDS', () => {
  it('has exactly 7 days, one per dayInWeek 0..6', () => {
    expect(MOONLING_WEEK_REWARDS).toHaveLength(7);
    const days = MOONLING_WEEK_REWARDS.map((r) => r.dayInWeek).sort();
    expect(days).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('alternates sticker / bonusStars on Day 1-6 and climaxes with partUnlock on Day 7', () => {
    expect(MOONLING_WEEK_REWARDS[0].kind).toBe('sticker');
    expect(MOONLING_WEEK_REWARDS[1].kind).toBe('bonusStars');
    expect(MOONLING_WEEK_REWARDS[2].kind).toBe('sticker');
    expect(MOONLING_WEEK_REWARDS[3].kind).toBe('bonusStars');
    expect(MOONLING_WEEK_REWARDS[4].kind).toBe('sticker');
    expect(MOONLING_WEEK_REWARDS[5].kind).toBe('bonusStars');
    expect(MOONLING_WEEK_REWARDS[6].kind).toBe('partUnlock');
  });

  it('Day 7 unlocks moonbeam', () => {
    const day7 = MOONLING_WEEK_REWARDS[6];
    expect(day7.kind).toBe('partUnlock');
    expect(day7.payload.partId).toBe('moonbeam');
  });

  it('every reward carries a non-empty German label', () => {
    for (const reward of MOONLING_WEEK_REWARDS) {
      expect(reward.payload.nameDe.length).toBeGreaterThan(0);
    }
  });

  it('contains no em-dashes (Marc rule)', () => {
    for (const reward of MOONLING_WEEK_REWARDS) {
      expect(reward.payload.nameDe).not.toContain('—');
    }
  });
});

describe('getRewardForDay', () => {
  it('returns the right reward for each day 0..6', () => {
    for (let day = 0; day <= 6; day++) {
      const reward = getRewardForDay(day);
      expect(reward).toBeDefined();
      expect(reward?.dayInWeek).toBe(day);
    }
  });

  it('returns the sticker reward for Day 1 (dayInWeek 0)', () => {
    const reward = getRewardForDay(0);
    expect(reward?.kind).toBe('sticker');
    expect(reward?.payload.stickerId).toBe('moon-day-1');
  });

  it('returns the moonbeam unlock for Day 7 (dayInWeek 6)', () => {
    const reward = getRewardForDay(6);
    expect(reward?.kind).toBe('partUnlock');
    expect(reward?.payload.partId).toBe('moonbeam');
    expect(reward?.payload.nameDe).toBe('Mondstrahl (legendär)');
  });

  it('returns undefined for out-of-range indices', () => {
    expect(getRewardForDay(-1)).toBeUndefined();
    expect(getRewardForDay(7)).toBeUndefined();
    expect(getRewardForDay(100)).toBeUndefined();
  });
});
