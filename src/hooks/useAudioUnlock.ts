/**
 * Listens for the first user gesture (pointerdown or keydown) and uses
 * it to unlock Howler's AudioContext. Browsers (and especially iOS
 * Safari) suspend the AudioContext until the user has interacted with
 * the page; without an unlock pass, all subsequent `play()` calls are
 * silent on iOS even if the file loads.
 *
 * Howler does the actual unlock automatically as long as a Howl has
 * been constructed before the gesture fires (its global pointerdown
 * listener resumes the context). We therefore call `preloadAll()` on
 * the first gesture so every Howl is constructed in time.
 *
 * The hook mounts in `App.tsx` near the top of the tree. It is
 * deliberately independent of `prefers-reduced-motion`: sound is its
 * own accessibility setting and a future Phase 3 settings screen will
 * gate playback via the `setMuted` API on `lib/sound`.
 */
import { useEffect } from 'react';
import { preloadAll } from '../lib/sound';

export function useAudioUnlock(): void {
  useEffect(() => {
    let unlocked = false;

    const onPointer = () => {
      if (unlocked) return;
      unlocked = true;
      try {
        preloadAll();
      } catch {
        // Silent on construction errors. play() is itself defensive
        // and will simply no-op for any Howl that failed to load.
      }
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onPointer);
    };

    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('keydown', onPointer);

    return () => {
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('keydown', onPointer);
    };
  }, []);
}
