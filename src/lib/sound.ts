/**
 * Sound system for Mad Inventor Lab. Howler.js wrapper exposing a typed
 * named-sound API. Phase 2 (M19) ships the call sites; the actual `*.mp3`
 * files in `public/sounds/` land in a follow-up CC0-asset commit.
 *
 * The `play()` function is intentionally defensive. Three things can go
 * wrong on any call:
 *
 *   1. The audio file is missing (Phase 2 placeholder state).
 *   2. The browser's AudioContext is not yet unlocked (autoplay policy).
 *   3. Howler itself throws (rare, but happens on private-tab Safari).
 *
 * In all three cases the call is a silent no-op rather than a crash.
 * Sound is a "nice to have" layer; missing it must not break the round.
 *
 * Sound is independent of `prefers-reduced-motion`. A user can have
 * motion off but want sound on (or vice versa); they are different
 * accessibility settings.
 */
import { Howl } from 'howler';

/**
 * The thirteen named sound IDs covering the round-flow beats. Wired by
 * the page-level call sites in M19. Each ID maps to one `*.mp3` file in
 * `public/sounds/`.
 */
export type SoundId =
  | 'tubeSwoosh' // customer arrival via tube
  | 'partPick' // tap a part in the orbit
  | 'partUnpick' // tap a selected part to remove
  | 'fireUp' // "Feuer frei!" CTA tap
  | 'kaThunk' // test reveal start
  | 'sensorTick' // each sensor dot fills
  | 'cheer' // delight reaction
  | 'satisfiedHum' // satisfied reaction
  | 'sortOfBlip' // sort-of-works reaction
  | 'glorifail' // glorious-fail reaction (raspberry / fart-like)
  | 'unlockChime' // +1 part unlocked
  | 'dailyClaim' // claim a daily reward
  | 'dayFanfare'; // Day-7 legendary unlock

/**
 * One sound's wiring. `src` is an array because Howler accepts a list of
 * fallback formats (e.g. `[mp3, ogg]`); Phase 2 ships single-format mp3
 * but the array shape leaves room to add ogg later without an API break.
 */
interface SoundDef {
  src: string[];
  volume?: number;
  loop?: boolean;
}

/**
 * Single source of truth for sound definitions. Volumes are tuned per
 * clip so the picky chimes (partPick) sit quieter than the tier stings
 * (cheer, glorifail). Tweak here, not at the call site.
 */
export const SOUND_DEFS: Record<SoundId, SoundDef> = {
  tubeSwoosh: { src: ['/sounds/tubeSwoosh.mp3'], volume: 0.7 },
  partPick: { src: ['/sounds/partPick.mp3'], volume: 0.5 },
  partUnpick: { src: ['/sounds/partUnpick.mp3'], volume: 0.4 },
  fireUp: { src: ['/sounds/fireUp.mp3'], volume: 0.8 },
  kaThunk: { src: ['/sounds/kaThunk.mp3'], volume: 0.85 },
  sensorTick: { src: ['/sounds/sensorTick.mp3'], volume: 0.35 },
  cheer: { src: ['/sounds/cheer.mp3'], volume: 0.85 },
  satisfiedHum: { src: ['/sounds/satisfiedHum.mp3'], volume: 0.6 },
  sortOfBlip: { src: ['/sounds/sortOfBlip.mp3'], volume: 0.55 },
  glorifail: { src: ['/sounds/glorifail.mp3'], volume: 0.7 },
  unlockChime: { src: ['/sounds/unlockChime.mp3'], volume: 0.75 },
  dailyClaim: { src: ['/sounds/dailyClaim.mp3'], volume: 0.7 },
  dayFanfare: { src: ['/sounds/dayFanfare.mp3'], volume: 0.85 },
};

/**
 * Module-level mute flag. Phase 3 wires a settings-screen toggle; for
 * Phase 2 the flag exists so tests can verify the gate works. Default
 * state is unmuted.
 */
let muted = false;

/**
 * Lazy cache of constructed `Howl` instances per sound id. We construct
 * on first play so the page does not pay the AudioContext-creation cost
 * for sounds the user never triggers in their session.
 */
const cache: Partial<Record<SoundId, Howl>> = {};

/**
 * Resolve (and cache) the Howl for a sound id. The `html5: false`
 * setting routes through Web Audio so sounds can overlap (two reactions
 * back-to-back, sensor ticks during the test reveal). HTML5 mode would
 * cut earlier playback off when a new one starts.
 */
function getHowl(id: SoundId): Howl {
  if (!cache[id]) {
    const def = SOUND_DEFS[id];
    cache[id] = new Howl({
      src: def.src,
      volume: def.volume,
      loop: def.loop,
      html5: false,
    });
  }
  return cache[id]!;
}

/**
 * Play a named sound. Defensive: missing assets, locked AudioContext,
 * and Howler errors are all swallowed so a missing file never crashes
 * the round.
 *
 * Calls before the user's first gesture are also no-ops in practice
 * because the AudioContext is still suspended; Howler queues silently
 * in that case rather than throwing, but we wrap in try/catch anyway
 * for defense in depth.
 */
export function play(id: SoundId): void {
  if (muted) return;
  try {
    getHowl(id).play();
  } catch {
    // Intentionally silent. Missing assets, locked context, browser
    // autoplay policy: all benign for our purposes.
  }
}

/**
 * Toggle the global mute flag. Phase 3's settings screen wires this to
 * a UI toggle; M19 only exposes the API.
 */
export function setMuted(value: boolean): void {
  muted = value;
}

/**
 * Read the current mute flag. Useful for rendering a settings toggle's
 * checked state.
 */
export function isMuted(): boolean {
  return muted;
}

/**
 * Construct every Howl up front. Used by `useAudioUnlock` on the first
 * user gesture so Howler's global AudioContext-unlock listener has at
 * least one Howl to anchor to.
 */
export function preloadAll(): void {
  (Object.keys(SOUND_DEFS) as SoundId[]).forEach(getHowl);
}
