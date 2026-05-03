/**
 * Persisted, app-wide state for Mad Inventor Lab.
 *
 * Wraps a `useReducer` over the `SaveStateV1` shape that lives in
 * `localStorage`. The catalogue, the unlocked-part roster, and the daily
 * seed all live here; the round (which customer is in the workshop, which
 * parts have been picked) is ephemeral and lives in `useRoundFlow` instead.
 *
 * Persistence is debounced 200ms via a `useEffect` cleanup. A burst of
 * state changes inside a single round (catalogue append plus a part
 * unlock plus a daily-seed touch) collapses into one `localStorage` write
 * after the burst settles. On unmount the pending timeout is cancelled so
 * a teardown cannot fire a stale write.
 *
 * No Context provider in Phase 1: App calls this hook once and passes the
 * `GameStateApi` down by props. Phase 2 may wrap it in Context if prop
 * drilling becomes painful.
 */
import { useCallback, useEffect, useReducer, useRef } from 'react';
import type { CatalogueEntry, SaveStateV1 } from '../lib/types';
import { defaultSave, loadSave, saveSave } from '../lib/storage';

/**
 * The reducer's discriminated-union action set. Every action is pure
 * data: timestamps and ids are minted by the consumer before dispatch
 * so the reducer body itself stays free of `Date.now()` and other
 * non-deterministic calls.
 */
export type GameStateAction =
  | { type: 'catalogueEntryAdded'; entry: CatalogueEntry }
  | { type: 'partUnlocked'; partId: string }
  | { type: 'dailySeedTouched'; seed: string | null }
  | { type: 'hardReset' };

/**
 * The hook's return surface. `state` is the latest persisted shape; the
 * helpers wrap `dispatch` so consumers do not have to know the action
 * type names. `reset` returns to a fresh `defaultSave()`.
 */
export interface GameStateApi {
  state: SaveStateV1;
  addCatalogueEntry: (entry: CatalogueEntry) => void;
  unlockPart: (partId: string) => void;
  setDailySeed: (seed: string | null) => void;
  reset: () => void;
}

/**
 * Pure reducer. All branches are idempotent on the natural identity of
 * the action's payload: appending the same catalogue entry twice (same
 * `entry.id`), unlocking the same part twice, etc. yield the same state
 * the second time. The reducer never throws and never reads the clock.
 */
function reducer(state: SaveStateV1, action: GameStateAction): SaveStateV1 {
  switch (action.type) {
    case 'catalogueEntryAdded': {
      const exists = state.catalogue.some((e) => e.id === action.entry.id);
      if (exists) return state;
      return { ...state, catalogue: [...state.catalogue, action.entry] };
    }
    case 'partUnlocked': {
      if (state.unlockedPartIds.includes(action.partId)) return state;
      return {
        ...state,
        unlockedPartIds: [...state.unlockedPartIds, action.partId],
      };
    }
    case 'dailySeedTouched': {
      return { ...state, lastDailySeed: action.seed };
    }
    case 'hardReset': {
      return defaultSave();
    }
  }
}

/**
 * Debounce window for the persistence effect, in ms. Picked so that a
 * single round's burst of dispatches collapses into one write while
 * still being short enough that a tab-close after a normal interaction
 * pause has flushed the state.
 */
const PERSIST_DEBOUNCE_MS = 200;

/**
 * The hook. Calls `loadSave()` lazily on mount, then schedules a
 * debounced `saveSave(state)` whenever state changes. The initial-load
 * write is suppressed via a `mountedRef` so we never write a fresh
 * blob on top of an existing save just because the component mounted.
 */
export function useGameState(): GameStateApi {
  const [state, dispatch] = useReducer(reducer, undefined, loadSave);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    const handle = setTimeout(() => {
      saveSave(state);
    }, PERSIST_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [state]);

  const addCatalogueEntry = useCallback((entry: CatalogueEntry) => {
    dispatch({ type: 'catalogueEntryAdded', entry });
  }, []);
  const unlockPart = useCallback((partId: string) => {
    dispatch({ type: 'partUnlocked', partId });
  }, []);
  const setDailySeed = useCallback((seed: string | null) => {
    dispatch({ type: 'dailySeedTouched', seed });
  }, []);
  const reset = useCallback(() => {
    dispatch({ type: 'hardReset' });
  }, []);

  return { state, addCatalogueEntry, unlockPart, setDailySeed, reset };
}
