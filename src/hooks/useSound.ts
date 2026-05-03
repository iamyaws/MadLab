/**
 * Trivial helper that exposes the sound API to consuming components
 * without forcing them to import `lib/sound` directly. Keeps the public
 * sound surface narrow: a page only ever needs `play(id)`, plus the
 * mute toggles for the (Phase 3) settings screen.
 */
import { play, setMuted, isMuted, type SoundId } from '../lib/sound';

export function useSound() {
  return { play, setMuted, isMuted };
}

export type { SoundId };
