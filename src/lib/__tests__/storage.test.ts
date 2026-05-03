import { describe, it, expect, beforeEach } from 'vitest';
import {
  SAVE_KEY,
  clearSave,
  defaultSave,
  loadSave,
  saveSave,
} from '../storage';
import type { CatalogueEntry, SaveStateV1, SaveStateV2 } from '../types';
import { STARTER_PART_IDS } from '../../data/parts';
import { getDailyVisitor } from '../dailyRotation';

/**
 * Each test starts from a clean localStorage so the order of tests does
 * not change behavior. jsdom (configured in vitest.config.ts) provides a
 * working in-memory localStorage that persists across calls within a
 * single test file unless we clear it ourselves.
 */
beforeEach(() => {
  localStorage.clear();
});

/**
 * A representative non-default v1 save fixture. Used by the v1-to-v2
 * migration tests so we can detect a bad migration that drops fields.
 */
function makeFixtureV1(): SaveStateV1 {
  const entry: CatalogueEntry = {
    id: 'inv-001',
    nameDe: 'Wackelglocke',
    parts: [
      {
        id: 'spring',
        labelDe: 'Sprungfeder',
        behaviorVerb: 'bounce',
        contributes: { fun: 1, zappy: 1 },
        category: 'mechanical',
      },
    ],
    customerId: 'pip',
    traitScores: { fun: 1, zappy: 1, cozy: 0, boom: 0 },
    tier: 'satisfied',
    createdAt: 1_700_000_000_000,
  };
  return {
    schemaVersion: 1,
    catalogue: [entry],
    unlockedPartIds: [...STARTER_PART_IDS, 'magnet'],
    lastDailySeed: '2026-W18',
  };
}

/**
 * A representative non-default v2 save fixture. Used by the round-trip
 * and shape tests. Mirrors `makeFixtureV1`'s catalogue/unlock content
 * and adds a populated `dailyWeek` slice with one claimed reward so we
 * can detect a bad round-trip that drops daily-week state.
 */
function makeFixtureV2(): SaveStateV2 {
  const v1 = makeFixtureV1();
  return {
    schemaVersion: 2,
    catalogue: v1.catalogue,
    unlockedPartIds: v1.unlockedPartIds,
    lastDailySeed: v1.lastDailySeed,
    dailyWeek: {
      weekIndex: 3,
      dayInWeek: 2,
      lastVisitDate: '2026-05-20',
      claimedRewards: [0, 1],
    },
  };
}

describe('storage', () => {
  describe('round-trip', () => {
    it('saveSave then loadSave returns deeply equal v2 state', () => {
      const original = makeFixtureV2();
      saveSave(original);
      const restored = loadSave();
      expect(restored).toEqual(original);
    });
  });

  describe('empty key', () => {
    it('loadSave returns defaultSave when no save exists', () => {
      const restored = loadSave();
      expect(restored).toEqual(defaultSave());
      expect(restored.unlockedPartIds).toHaveLength(9);
    });
  });

  describe('malformed JSON', () => {
    it('loadSave returns defaultSave without throwing on bad JSON', () => {
      localStorage.setItem(SAVE_KEY, 'not json {');
      expect(() => loadSave()).not.toThrow();
      expect(loadSave()).toEqual(defaultSave());
    });
  });

  describe('wrong schema version', () => {
    it('loadSave returns defaultSave when schemaVersion is unknown', () => {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          schemaVersion: 99,
          catalogue: [],
          unlockedPartIds: ['cog'],
          lastDailySeed: null,
        }),
      );
      expect(loadSave()).toEqual(defaultSave());
    });
  });

  describe('missing schemaVersion', () => {
    it('loadSave returns defaultSave when schemaVersion is absent', () => {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          catalogue: [],
          unlockedPartIds: ['cog'],
          lastDailySeed: null,
        }),
      );
      expect(loadSave()).toEqual(defaultSave());
    });
  });

  describe('clearSave', () => {
    it('removes the save so loadSave returns defaultSave again', () => {
      saveSave(makeFixtureV2());
      clearSave();
      expect(loadSave()).toEqual(defaultSave());
      expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    });
  });

  describe('defaultSave shape', () => {
    it('returns the expected v2 shape', () => {
      const fresh = defaultSave();
      expect(fresh.schemaVersion).toBe(2);
      expect(fresh.catalogue).toEqual([]);
      expect(fresh.unlockedPartIds).toHaveLength(9);
      expect(fresh.unlockedPartIds).toEqual(STARTER_PART_IDS);
      expect(fresh.lastDailySeed).toBeNull();
    });

    it('seeds dailyWeek from todays getDailyVisitor', () => {
      const fresh = defaultSave();
      const expected = getDailyVisitor(new Date());
      expect(fresh.dailyWeek.weekIndex).toBe(expected.weekIndex);
      expect(fresh.dailyWeek.dayInWeek).toBe(expected.dayInWeek);
      expect(fresh.dailyWeek.lastVisitDate).toBeNull();
      expect(fresh.dailyWeek.claimedRewards).toEqual([]);
    });

    it('returns a fresh array each call so mutations do not leak', () => {
      const a = defaultSave();
      const b = defaultSave();
      expect(a.unlockedPartIds).not.toBe(b.unlockedPartIds);
      a.unlockedPartIds.push('mutant');
      expect(b.unlockedPartIds).toHaveLength(9);
      // claimedRewards is also expected to be a fresh array
      expect(a.dailyWeek.claimedRewards).not.toBe(b.dailyWeek.claimedRewards);
      a.dailyWeek.claimedRewards.push(0);
      expect(b.dailyWeek.claimedRewards).toEqual([]);
    });
  });

  describe('v1 to v2 migration', () => {
    it('lifts a valid v1 blob into v2 with a fresh dailyWeek slice', () => {
      const v1 = makeFixtureV1();
      localStorage.setItem(SAVE_KEY, JSON.stringify(v1));
      const restored = loadSave();
      expect(restored.schemaVersion).toBe(2);
      expect(restored.catalogue).toEqual(v1.catalogue);
      expect(restored.unlockedPartIds).toEqual(v1.unlockedPartIds);
      expect(restored.lastDailySeed).toBe(v1.lastDailySeed);
      // dailyWeek is fresh for an upgraded save: today's rotation, no
      // recorded visit yet, no rewards claimed.
      const expectedWeek = getDailyVisitor(new Date());
      expect(restored.dailyWeek.weekIndex).toBe(expectedWeek.weekIndex);
      expect(restored.dailyWeek.dayInWeek).toBe(expectedWeek.dayInWeek);
      expect(restored.dailyWeek.lastVisitDate).toBeNull();
      expect(restored.dailyWeek.claimedRewards).toEqual([]);
    });

    it('falls back to defaultSave on a malformed v1 blob (missing fields)', () => {
      // Decision: a v1 blob that is missing required fields is treated
      // as unrecoverable rather than half-restored. The player loses
      // nothing real because the blob is already broken.
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          schemaVersion: 1,
          // catalogue and unlockedPartIds intentionally absent
          lastDailySeed: '2026-W18',
        }),
      );
      expect(loadSave()).toEqual(defaultSave());
    });
  });
});
