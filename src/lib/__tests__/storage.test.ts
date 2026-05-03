import { describe, it, expect, beforeEach } from 'vitest';
import {
  SAVE_KEY,
  clearSave,
  defaultSave,
  loadSave,
  saveSave,
} from '../storage';
import type { CatalogueEntry, SaveStateV1 } from '../types';
import { STARTER_PART_IDS } from '../../data/parts';

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
 * A representative non-default save fixture used by the round-trip and
 * shape tests. Includes one full CatalogueEntry plus an unlocked part
 * id beyond the starter set, so we can detect a bad round-trip that
 * silently falls through to defaultSave().
 */
function makeFixtureSave(): SaveStateV1 {
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

describe('storage', () => {
  describe('round-trip', () => {
    it('saveSave then loadSave returns deeply equal state', () => {
      const original = makeFixtureSave();
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
      saveSave(makeFixtureSave());
      clearSave();
      expect(loadSave()).toEqual(defaultSave());
      expect(localStorage.getItem(SAVE_KEY)).toBeNull();
    });
  });

  describe('defaultSave shape', () => {
    it('returns the expected v1 shape', () => {
      const fresh = defaultSave();
      expect(fresh.schemaVersion).toBe(1);
      expect(fresh.catalogue).toEqual([]);
      expect(fresh.unlockedPartIds).toHaveLength(9);
      expect(fresh.unlockedPartIds).toEqual(STARTER_PART_IDS);
      expect(fresh.lastDailySeed).toBeNull();
    });

    it('returns a fresh array each call so mutations do not leak', () => {
      const a = defaultSave();
      const b = defaultSave();
      expect(a.unlockedPartIds).not.toBe(b.unlockedPartIds);
      a.unlockedPartIds.push('mutant');
      expect(b.unlockedPartIds).toHaveLength(9);
    });
  });
});
