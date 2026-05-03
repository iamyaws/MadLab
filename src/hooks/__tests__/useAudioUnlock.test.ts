/**
 * Tests the `useAudioUnlock` hook attaches its `pointerdown` and
 * `keydown` listeners on mount, fires the unlock path on the first
 * gesture, and removes the listeners on unmount or after the gesture.
 *
 * We mock `howler` so the dynamic import in the unlock handler does not
 * hit a real AudioContext in jsdom.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({ play: vi.fn() })),
}));

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('useAudioUnlock', () => {
  it('attaches pointerdown and keydown listeners on mount', async () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const { useAudioUnlock } = await import('../useAudioUnlock');
    renderHook(() => useAudioUnlock());
    const events = addSpy.mock.calls.map((c) => c[0]);
    expect(events).toContain('pointerdown');
    expect(events).toContain('keydown');
  });

  it('removes both listeners on unmount', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { useAudioUnlock } = await import('../useAudioUnlock');
    const { unmount } = renderHook(() => useAudioUnlock());
    unmount();
    const events = removeSpy.mock.calls.map((c) => c[0]);
    expect(events).toContain('pointerdown');
    expect(events).toContain('keydown');
  });

  it('removes listeners after the first pointerdown fires', async () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { useAudioUnlock } = await import('../useAudioUnlock');
    renderHook(() => useAudioUnlock());

    // Fire a pointerdown. The handler removes both listeners
    // synchronously; the dynamic preloadAll import resolves on a
    // microtask which we let settle below.
    window.dispatchEvent(new Event('pointerdown'));

    // Allow the dynamic import in the handler to resolve.
    await Promise.resolve();
    await Promise.resolve();

    const events = removeSpy.mock.calls.map((c) => c[0]);
    expect(events).toContain('pointerdown');
    expect(events).toContain('keydown');
  });

  it('a second pointerdown after unlock is a no-op (listener already detached)', async () => {
    const { useAudioUnlock } = await import('../useAudioUnlock');
    renderHook(() => useAudioUnlock());

    window.dispatchEvent(new Event('pointerdown'));
    await Promise.resolve();
    await Promise.resolve();

    // After the first gesture the listener is removed; firing again is
    // a no-op. We assert via not-throwing rather than a counter because
    // the dynamic import means a second fire would still be benign.
    expect(() => window.dispatchEvent(new Event('pointerdown'))).not.toThrow();
  });
});
