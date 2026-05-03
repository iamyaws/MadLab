import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useRoundFlow } from '../useRoundFlow';
import type { Invention } from '../../lib/types';

/**
 * Build a minimal stand-in Invention for the `startTest` cases. We do
 * not exercise `compose()` here; the round-flow reducer only stores
 * whatever Invention the consumer hands it.
 */
function makeInvention(): Invention {
  return {
    parts: [],
    customerId: 'pip',
    traitScores: { fun: 0, zappy: 0, cozy: 0, boom: 0 },
    tier: 'satisfied',
    createdAt: 1_700_000_000_000,
  };
}

describe('useRoundFlow', () => {
  describe('initial state', () => {
    it('starts in idle with empty round data', () => {
      const { result } = renderHook(() => useRoundFlow());
      expect(result.current.state).toEqual({
        phase: 'idle',
        customerId: null,
        pickedPartIds: [],
        invention: null,
      });
    });
  });

  describe('startArrival', () => {
    it('moves idle -> arrival and stores customerId', () => {
      const { result } = renderHook(() => useRoundFlow());
      act(() => {
        result.current.startArrival('pip');
      });
      expect(result.current.state.phase).toBe('arrival');
      expect(result.current.state.customerId).toBe('pip');
    });
  });

  describe('startBuild', () => {
    it('moves arrival -> build', () => {
      const { result } = renderHook(() => useRoundFlow());
      act(() => {
        result.current.startArrival('pip');
        result.current.startBuild();
      });
      expect(result.current.state.phase).toBe('build');
    });
  });

  describe('togglePart', () => {
    it('appends a part id when called in build phase', () => {
      const { result } = renderHook(() => useRoundFlow());
      act(() => {
        result.current.startArrival('pip');
        result.current.startBuild();
        result.current.togglePart('cog');
      });
      expect(result.current.state.pickedPartIds).toEqual(['cog']);
    });

    it('removes a part id when called twice with the same id', () => {
      const { result } = renderHook(() => useRoundFlow());
      act(() => {
        result.current.startArrival('pip');
        result.current.startBuild();
        result.current.togglePart('cog');
        result.current.togglePart('cog');
      });
      expect(result.current.state.pickedPartIds).toEqual([]);
    });

    it('caps the picked list at 4 (a 5th add is ignored)', () => {
      const { result } = renderHook(() => useRoundFlow());
      act(() => {
        result.current.startArrival('pip');
        result.current.startBuild();
        result.current.togglePart('cog');
        result.current.togglePart('spring');
        result.current.togglePart('bolt');
        result.current.togglePart('beaker');
        // Five-th add: must be ignored, leaving the list at 4 entries.
        result.current.togglePart('bell');
      });
      expect(result.current.state.pickedPartIds.length).toBe(4);
      expect(result.current.state.pickedPartIds).not.toContain('bell');
    });

    it('is a no-op when called outside the build phase', () => {
      const { result } = renderHook(() => useRoundFlow());
      // From idle: nothing happens.
      act(() => {
        result.current.togglePart('cog');
      });
      expect(result.current.state.pickedPartIds).toEqual([]);
      expect(result.current.state.phase).toBe('idle');

      // From arrival: still nothing.
      act(() => {
        result.current.startArrival('pip');
        result.current.togglePart('cog');
      });
      expect(result.current.state.pickedPartIds).toEqual([]);
      expect(result.current.state.phase).toBe('arrival');
    });
  });

  describe('startTest', () => {
    it('moves build -> test and stores the invention', () => {
      const { result } = renderHook(() => useRoundFlow());
      const invention = makeInvention();
      act(() => {
        result.current.startArrival('pip');
        result.current.startBuild();
        result.current.startTest(invention);
      });
      expect(result.current.state.phase).toBe('test');
      expect(result.current.state.invention).toEqual(invention);
    });
  });

  describe('startReaction', () => {
    it('moves test -> reaction', () => {
      const { result } = renderHook(() => useRoundFlow());
      act(() => {
        result.current.startArrival('pip');
        result.current.startBuild();
        result.current.startTest(makeInvention());
        result.current.startReaction();
      });
      expect(result.current.state.phase).toBe('reaction');
    });
  });

  describe('endRound', () => {
    it('clears customerId, pickedPartIds, invention and returns to idle', () => {
      const { result } = renderHook(() => useRoundFlow());
      const invention = makeInvention();
      act(() => {
        result.current.startArrival('pip');
        result.current.startBuild();
        result.current.togglePart('cog');
        result.current.togglePart('spring');
        result.current.startTest(invention);
        result.current.startReaction();
        result.current.endRound();
      });
      expect(result.current.state).toEqual({
        phase: 'idle',
        customerId: null,
        pickedPartIds: [],
        invention: null,
      });
    });
  });
});
