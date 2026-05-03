/**
 * Ephemeral round-flow state machine for Mad Inventor Lab.
 *
 * The Phase 1 round is a five-state line:
 *
 *   idle -> arrival -> build -> test -> reaction -> idle
 *
 * `useGameState` owns everything that survives a tab close (catalogue,
 * unlocked parts, daily seed). This hook owns the in-flight round
 * (current customer, picked parts, resolved invention) which is thrown
 * away when the round ends.
 *
 * The reducer is strict about wrong-phase calls: a `togglePart` from
 * the `reaction` phase, a `startBuild` from `idle`, and so on are all
 * silent no-ops returning the previous state. This keeps the hook
 * forgiving in early integration where pages might fire a transition
 * twice from a stale render.
 */
import { useCallback, useReducer } from 'react';
import type { Invention } from '../lib/types';

/**
 * The five named phases of one round. `idle` is the workshop home
 * state; the player walks through the rest in order before returning
 * to `idle` via `endRound`.
 */
export type RoundPhase = 'idle' | 'arrival' | 'build' | 'test' | 'reaction';

/**
 * The full ephemeral state shape. `customerId` and `pickedPartIds` are
 * cleared by `endRound`; `invention` is the resolved `Invention` from
 * `compose()`, populated when the round transitions into `test`.
 */
export interface RoundState {
  phase: RoundPhase;
  customerId: string | null;
  pickedPartIds: string[];
  invention: Invention | null;
}

/**
 * The hook's return surface. Each helper performs one transition; the
 * reducer rejects (silently) any call that does not match its current
 * phase, so consumer pages can safely call these in `useEffect` without
 * extra guards.
 */
export interface RoundFlowApi {
  state: RoundState;
  startArrival: (customerId: string) => void;
  startBuild: () => void;
  togglePart: (partId: string) => void;
  startTest: (invention: Invention) => void;
  startReaction: () => void;
  endRound: () => void;
}

/**
 * The maximum number of parts a player may pick per round. Matches the
 * wireframe's 4-slot workbench. `togglePart` short-circuits when the
 * cap is already reached and the new id would be an addition.
 */
const MAX_PICKS = 4;

/**
 * The reducer's discriminated-union action set. Each case maps to one
 * helper on the public API.
 */
type RoundAction =
  | { type: 'startArrival'; customerId: string }
  | { type: 'startBuild' }
  | { type: 'togglePart'; partId: string }
  | { type: 'startTest'; invention: Invention }
  | { type: 'startReaction' }
  | { type: 'endRound' };

/**
 * The fresh `idle` state every round starts and ends in.
 */
function initialState(): RoundState {
  return {
    phase: 'idle',
    customerId: null,
    pickedPartIds: [],
    invention: null,
  };
}

/**
 * Pure reducer. Wrong-phase actions return the previous state
 * unchanged. The cap on `togglePart` is checked here so a buggy caller
 * cannot push the picks past 4.
 */
function reducer(state: RoundState, action: RoundAction): RoundState {
  switch (action.type) {
    case 'startArrival': {
      if (state.phase !== 'idle') return state;
      return {
        phase: 'arrival',
        customerId: action.customerId,
        pickedPartIds: [],
        invention: null,
      };
    }
    case 'startBuild': {
      if (state.phase !== 'arrival') return state;
      return { ...state, phase: 'build' };
    }
    case 'togglePart': {
      if (state.phase !== 'build') return state;
      const present = state.pickedPartIds.includes(action.partId);
      if (present) {
        return {
          ...state,
          pickedPartIds: state.pickedPartIds.filter(
            (id) => id !== action.partId,
          ),
        };
      }
      if (state.pickedPartIds.length >= MAX_PICKS) return state;
      return {
        ...state,
        pickedPartIds: [...state.pickedPartIds, action.partId],
      };
    }
    case 'startTest': {
      if (state.phase !== 'build') return state;
      return { ...state, phase: 'test', invention: action.invention };
    }
    case 'startReaction': {
      if (state.phase !== 'test') return state;
      return { ...state, phase: 'reaction' };
    }
    case 'endRound': {
      if (state.phase !== 'reaction') return state;
      return initialState();
    }
  }
}

/**
 * The hook. Holds one `RoundState` per consumer (the round is owned by
 * the app shell, not per-page); pages dispatch transitions via the
 * returned helpers.
 */
export function useRoundFlow(): RoundFlowApi {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const startArrival = useCallback((customerId: string) => {
    dispatch({ type: 'startArrival', customerId });
  }, []);
  const startBuild = useCallback(() => {
    dispatch({ type: 'startBuild' });
  }, []);
  const togglePart = useCallback((partId: string) => {
    dispatch({ type: 'togglePart', partId });
  }, []);
  const startTest = useCallback((invention: Invention) => {
    dispatch({ type: 'startTest', invention });
  }, []);
  const startReaction = useCallback(() => {
    dispatch({ type: 'startReaction' });
  }, []);
  const endRound = useCallback(() => {
    dispatch({ type: 'endRound' });
  }, []);

  return {
    state,
    startArrival,
    startBuild,
    togglePart,
    startTest,
    startReaction,
    endRound,
  };
}
