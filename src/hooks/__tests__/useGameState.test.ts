import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useGameState } from '../useGameState';
import { defaultSave, SAVE_KEY } from '../../lib/storage';
import { getDailyVisitor } from '../../lib/dailyRotation';
import type { CatalogueEntry, SaveStateV2 } from '../../lib/types';

/**
 * Each test starts from a clean localStorage so persistence assertions
 * are not contaminated by an earlier test's writes. jsdom (configured
 * in vitest.config.ts) provides a working in-memory localStorage.
 */
beforeEach(() => {
  localStorage.clear();
});

/**
 * A representative non-default catalogue entry used by the append-and-
 * idempotency tests. Trait scores and tier are coherent (Pip wants
 * cozy + fun, sock supplies cozy=2) so no separate fixture is needed
 * for the persistence round-trip.
 */
function makeEntry(overrides: Partial<CatalogueEntry> = {}): CatalogueEntry {
  return {
    id: 'inv-001',
    nameDe: 'Wackelglocke',
    parts: [
      {
        id: 'sock',
        labelDe: 'Socke',
        behaviorVerb: 'soft',
        contributes: { cozy: 2 },
        category: 'material',
      },
    ],
    customerId: 'pip',
    traitScores: { fun: 0, zappy: 0, cozy: 2, boom: 0 },
    tier: 'satisfied',
    createdAt: 1_700_000_000_000,
    ...overrides,
  };
}

describe('useGameState', () => {
  describe('initial state', () => {
    it('returns defaultSave when no save is in localStorage', () => {
      const { result } = renderHook(() => useGameState());
      expect(result.current.state).toEqual(defaultSave());
    });
  });

  describe('addCatalogueEntry', () => {
    it('appends a new entry to the catalogue', () => {
      const { result } = renderHook(() => useGameState());
      const entry = makeEntry();
      act(() => {
        result.current.addCatalogueEntry(entry);
      });
      expect(result.current.state.catalogue).toHaveLength(1);
      expect(result.current.state.catalogue[0]).toEqual(entry);
    });

    it('is idempotent on entry.id (no duplicate append)', () => {
      const { result } = renderHook(() => useGameState());
      const entry = makeEntry();
      act(() => {
        result.current.addCatalogueEntry(entry);
        result.current.addCatalogueEntry(entry);
      });
      expect(result.current.state.catalogue).toHaveLength(1);
    });
  });

  describe('unlockPart', () => {
    it('appends a new partId to unlockedPartIds', () => {
      const { result } = renderHook(() => useGameState());
      const before = result.current.state.unlockedPartIds.length;
      act(() => {
        result.current.unlockPart('magnet');
      });
      expect(result.current.state.unlockedPartIds).toContain('magnet');
      expect(result.current.state.unlockedPartIds).toHaveLength(before + 1);
    });

    it('is idempotent on the same partId', () => {
      const { result } = renderHook(() => useGameState());
      act(() => {
        result.current.unlockPart('magnet');
        result.current.unlockPart('magnet');
      });
      const occurrences = result.current.state.unlockedPartIds.filter(
        (id) => id === 'magnet',
      ).length;
      expect(occurrences).toBe(1);
    });
  });

  describe('setDailySeed', () => {
    it('updates lastDailySeed', () => {
      const { result } = renderHook(() => useGameState());
      act(() => {
        result.current.setDailySeed('2026-W18');
      });
      expect(result.current.state.lastDailySeed).toBe('2026-W18');
    });
  });

  describe('recordDailyVisit', () => {
    it('sets lastVisitDate and recomputes weekIndex/dayInWeek', () => {
      const { result } = renderHook(() => useGameState());
      // Pick a date inside the EPOCH week (Mon 4 May 2026 + 2 days = Wed)
      // so the expected pair is computed via the same getDailyVisitor.
      const date = '2026-05-06';
      const expected = getDailyVisitor(new Date(`${date}T00:00:00.000Z`));
      act(() => {
        result.current.recordDailyVisit(date);
      });
      expect(result.current.state.dailyWeek.lastVisitDate).toBe(date);
      expect(result.current.state.dailyWeek.weekIndex).toBe(expected.weekIndex);
      expect(result.current.state.dailyWeek.dayInWeek).toBe(expected.dayInWeek);
    });

    it('resets claimedRewards when the visit crosses a week boundary', () => {
      const { result } = renderHook(() => useGameState());
      // Record a visit in epoch week 0 and claim two rewards.
      act(() => {
        result.current.recordDailyVisit('2026-05-04'); // Monday week 0
        result.current.claimDailyReward(0);
        result.current.claimDailyReward(1);
      });
      expect(result.current.state.dailyWeek.weekIndex).toBe(0);
      expect(result.current.state.dailyWeek.claimedRewards).toEqual([0, 1]);
      // Now record a visit one week later. The new weekIndex should
      // advance and claimedRewards should reset to [].
      act(() => {
        result.current.recordDailyVisit('2026-05-11'); // Monday week 1
      });
      expect(result.current.state.dailyWeek.weekIndex).toBe(1);
      expect(result.current.state.dailyWeek.claimedRewards).toEqual([]);
    });

    it('preserves claimedRewards when the visit stays inside the same week', () => {
      const { result } = renderHook(() => useGameState());
      act(() => {
        result.current.recordDailyVisit('2026-05-04'); // Monday week 0
        result.current.claimDailyReward(0);
      });
      expect(result.current.state.dailyWeek.claimedRewards).toEqual([0]);
      act(() => {
        result.current.recordDailyVisit('2026-05-06'); // Wednesday same week
      });
      expect(result.current.state.dailyWeek.weekIndex).toBe(0);
      expect(result.current.state.dailyWeek.claimedRewards).toEqual([0]);
    });
  });

  describe('claimDailyReward', () => {
    it('appends a dayInWeek to claimedRewards', () => {
      const { result } = renderHook(() => useGameState());
      act(() => {
        result.current.claimDailyReward(2);
      });
      expect(result.current.state.dailyWeek.claimedRewards).toEqual([2]);
    });

    it('is idempotent on the same dayInWeek', () => {
      const { result } = renderHook(() => useGameState());
      act(() => {
        result.current.claimDailyReward(2);
        result.current.claimDailyReward(2);
      });
      expect(result.current.state.dailyWeek.claimedRewards).toEqual([2]);
    });
  });

  describe('rollDailyWeek', () => {
    it('sets weekIndex and resets claimedRewards', () => {
      const { result } = renderHook(() => useGameState());
      act(() => {
        result.current.claimDailyReward(0);
        result.current.claimDailyReward(3);
      });
      expect(result.current.state.dailyWeek.claimedRewards).toEqual([0, 3]);
      act(() => {
        result.current.rollDailyWeek(7);
      });
      expect(result.current.state.dailyWeek.weekIndex).toBe(7);
      expect(result.current.state.dailyWeek.claimedRewards).toEqual([]);
    });
  });

  describe('reset', () => {
    it('returns state to defaultSave', () => {
      const { result } = renderHook(() => useGameState());
      act(() => {
        result.current.addCatalogueEntry(makeEntry());
        result.current.unlockPart('magnet');
        result.current.setDailySeed('2026-W18');
        result.current.claimDailyReward(0);
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.state).toEqual(defaultSave());
    });
  });

  describe('debounced persistence', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('writes to localStorage after the 200ms debounce window', () => {
      const { result } = renderHook(() => useGameState());
      const entry = makeEntry();
      act(() => {
        result.current.addCatalogueEntry(entry);
      });
      // Before the debounce flushes, nothing has been written yet.
      expect(localStorage.getItem(SAVE_KEY)).toBeNull();
      act(() => {
        vi.advanceTimersByTime(250);
      });
      const raw = localStorage.getItem(SAVE_KEY);
      expect(raw).not.toBeNull();
      const persisted = JSON.parse(raw as string) as SaveStateV2;
      expect(persisted.schemaVersion).toBe(2);
      expect(persisted.catalogue).toHaveLength(1);
      expect(persisted.catalogue[0].id).toBe(entry.id);
      expect(persisted.dailyWeek).toBeDefined();
    });
  });
});
