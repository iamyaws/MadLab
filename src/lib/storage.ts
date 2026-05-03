/**
 * Schema-versioned localStorage wrapper.
 *
 * One canonical key, `mil:save:v1`, holds the entire game save as a JSON
 * blob shaped like `SaveStateV1`. The version is in the key so that a
 * future Phase 2 schema (`mil:save:v2`) can co-exist briefly during
 * migration; today only v1 is read.
 *
 * Both reads and writes are defensive: malformed JSON, missing keys,
 * mismatched schema versions, and quota or no-storage environments all
 * fall back gracefully. `loadSave` and `saveSave` never throw, so a
 * corrupt save just produces a fresh start instead of crashing the round.
 */
import type { SaveStateV1 } from './types';
import { STARTER_PART_IDS } from '../data/parts';

/**
 * Canonical localStorage key. Exported so consumers (tests, devtools,
 * future migration code) can reference it without hardcoding the literal.
 */
export const SAVE_KEY = 'mil:save:v1';

/**
 * Read the save from localStorage, falling back to a default when
 * anything goes wrong. Never throws.
 *
 * Failure modes that all return `defaultSave()`:
 * - The key is absent (fresh install).
 * - `JSON.parse` throws (corrupt blob).
 * - The parsed blob has a `schemaVersion` we cannot migrate from.
 * - `localStorage` itself is unavailable or throws on read.
 */
export function loadSave(): SaveStateV1 {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw === null) return defaultSave();
    const parsed = JSON.parse(raw) as unknown;
    return migrate(parsed);
  } catch {
    return defaultSave();
  }
}

/**
 * Forward-only schema migration. Today the only valid input is a v1
 * blob, which is returned as-is. Anything else (including missing or
 * unknown `schemaVersion`) falls through to a fresh default.
 *
 * When Phase 2 introduces v2, add a `case 2:` branch that converts a
 * parsed v1 blob upward; the v1 case stays unchanged.
 *
 * Not exported: external callers should go through `loadSave`.
 */
function migrate(blob: unknown): SaveStateV1 {
  const version =
    blob !== null && typeof blob === 'object'
      ? (blob as Record<string, unknown>).schemaVersion
      : undefined;
  if (version === 1) return blob as SaveStateV1;
  return defaultSave();
}

/**
 * Write the save to localStorage. Never throws.
 *
 * Common failure modes to swallow: `QuotaExceededError` when the quota
 * is full, `SecurityError` in private-browsing modes that disable
 * storage, and `localStorage` being undefined entirely (SSR or sandbox).
 * A failed write is acceptable here because the next round can write
 * again; crashing the round to surface the error would be worse.
 */
export function saveSave(s: SaveStateV1): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    /* ignore: quota exceeded, no-storage env, etc. */
  }
}

/**
 * Build a fresh v1 save with an empty catalogue, the 9 starter part ids
 * unlocked, and no daily seed yet. Used both as the bootstrap value on
 * first run and as the safety fallback whenever a read fails.
 */
export function defaultSave(): SaveStateV1 {
  return {
    schemaVersion: 1,
    catalogue: [],
    unlockedPartIds: [...STARTER_PART_IDS],
    lastDailySeed: null,
  };
}

/**
 * Remove the save from localStorage. Used by devtools and test setup.
 * Never throws; a missing key or unavailable storage is a no-op.
 */
export function clearSave(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}
