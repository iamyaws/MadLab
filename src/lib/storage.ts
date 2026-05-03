/**
 * Schema-versioned localStorage wrapper.
 *
 * One canonical key, `mil:save:v1`, holds the entire game save as a JSON
 * blob. The version lives inside the blob (`schemaVersion`), not in the
 * key, so a future schema bump can keep the same key while
 * `migrate()` lifts old blobs forward in place.
 *
 * Both reads and writes are defensive: malformed JSON, missing keys,
 * mismatched schema versions, and quota or no-storage environments all
 * fall back gracefully. `loadSave` and `saveSave` never throw, so a
 * corrupt save just produces a fresh start instead of crashing the round.
 */
import type { SaveStateV1, SaveStateV2 } from './types';
import { STARTER_PART_IDS } from '../data/parts';
import { getDailyVisitor } from './dailyRotation';

/**
 * Canonical localStorage key. The key intentionally still says `:v1`
 * even now that the blob inside is v2; the version is in the blob. A
 * future migration can stay on this key without churning the key name.
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
export function loadSave(): SaveStateV2 {
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
 * Forward-only schema migration. Recognised inputs:
 * - `schemaVersion === 2`: returned as-is (assumed already valid).
 * - `schemaVersion === 1`: lifted via `upgradeV1ToV2`.
 * - anything else: falls through to `defaultSave()`.
 *
 * Malformed v1 blobs (missing `catalogue` or `unlockedPartIds`, etc.)
 * are treated as unrecoverable and fall through to `defaultSave()`.
 * The decision: the player loses nothing real because a malformed v1
 * blob is already broken; better to start fresh than to half-restore
 * a save into v2 with surprising holes.
 *
 * Not exported: external callers should go through `loadSave`.
 */
function migrate(blob: unknown): SaveStateV2 {
  if (blob === null || typeof blob !== 'object') return defaultSave();
  const version = (blob as Record<string, unknown>).schemaVersion;
  if (version === 2) return blob as SaveStateV2;
  if (version === 1) {
    if (!isValidV1(blob)) return defaultSave();
    return upgradeV1ToV2(blob as SaveStateV1);
  }
  return defaultSave();
}

/**
 * Shape-check a v1 blob before we trust it as the migration source.
 * Defensive against partial or corrupt v1 saves: anything missing the
 * three required fields is treated as unrecoverable. We do not try to
 * patch missing fields with defaults because a half-migrated save tends
 * to be more confusing than a fresh start.
 */
function isValidV1(blob: unknown): boolean {
  if (blob === null || typeof blob !== 'object') return false;
  const o = blob as Record<string, unknown>;
  return (
    Array.isArray(o.catalogue) &&
    Array.isArray(o.unlockedPartIds) &&
    (o.lastDailySeed === null || typeof o.lastDailySeed === 'string')
  );
}

/**
 * Lift a validated v1 blob to v2. The new `dailyWeek` slice is seeded
 * from today's `getDailyVisitor` so an existing player lands on the
 * current themed week with no rewards yet claimed and no recorded
 * visit (the next routine entry will record one).
 */
function upgradeV1ToV2(v1: SaveStateV1): SaveStateV2 {
  const today = getDailyVisitor(new Date());
  return {
    schemaVersion: 2,
    catalogue: v1.catalogue,
    unlockedPartIds: v1.unlockedPartIds,
    lastDailySeed: v1.lastDailySeed,
    dailyWeek: {
      weekIndex: today.weekIndex,
      dayInWeek: today.dayInWeek,
      lastVisitDate: null,
      claimedRewards: [],
    },
  };
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
export function saveSave(s: SaveStateV2): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(s));
  } catch {
    /* ignore: quota exceeded, no-storage env, etc. */
  }
}

/**
 * Build a fresh v2 save with an empty catalogue, the 9 starter part ids
 * unlocked, no daily seed yet, and a `dailyWeek` slice anchored on the
 * current rotation week with zero claimed rewards. Used both as the
 * bootstrap value on first run and as the safety fallback whenever a
 * read fails.
 */
export function defaultSave(): SaveStateV2 {
  const today = getDailyVisitor(new Date());
  return {
    schemaVersion: 2,
    catalogue: [],
    unlockedPartIds: [...STARTER_PART_IDS],
    lastDailySeed: null,
    dailyWeek: {
      weekIndex: today.weekIndex,
      dayInWeek: today.dayInWeek,
      lastVisitDate: null,
      claimedRewards: [],
    },
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
