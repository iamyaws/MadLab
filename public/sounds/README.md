# Sound effects

This directory holds the round-flow SFX referenced by `src/lib/sound.ts`.

## Status

Phase 2 (M19) ships the call sites and the Howler-backed playback layer.
The actual `*.mp3` files are not yet committed. Until they land, the
`play()` function silently no-ops on every call (see the `try/catch` in
`src/lib/sound.ts`); the round-flow runs without audio errors.

The follow-up commit will source CC0 clips and drop them in here.

## Expected file list

One `.mp3` file per `SoundId` in `src/lib/sound.ts`:

| File                      | Beat                                      |
| ------------------------- | ----------------------------------------- |
| `tubeSwoosh.mp3`          | customer arrival via the pneumatic tube   |
| `partPick.mp3`            | tap a part in the orbit to add it         |
| `partUnpick.mp3`          | tap a selected part to remove it          |
| `fireUp.mp3`              | "Feuer frei!" CTA on the workshop         |
| `kaThunk.mp3`             | test-chamber reveal start                 |
| `sensorTick.mp3`          | each sensor dot landing during the test   |
| `cheer.mp3`               | reaction sting for tier `delight`         |
| `satisfiedHum.mp3`        | reaction sting for tier `satisfied`       |
| `sortOfBlip.mp3`          | reaction sting for tier `sortOf`          |
| `glorifail.mp3`           | reaction sting for tier `fail`            |
| `unlockChime.mp3`         | "+1 Teil entdeckt" follow-up after cheer  |
| `dailyClaim.mp3`          | "Einsammeln" tap on a Daily reward card   |
| `dayFanfare.mp3`          | Day-7 legendary unlock follow-up          |

## Format and length budget

- **Format:** `mp3`, mono, 44.1 kHz, 96 kbps. (Howler accepts an array
  of fallbacks; if you also want `ogg` for non-Safari browsers, drop
  the matching `*.ogg` next to each `*.mp3` and extend the `src` array
  in `SOUND_DEFS`.)
- **Length:** 0.15-0.6 s for chimes/ticks (`partPick`, `sensorTick`,
  `unlockChime`, `dailyClaim`); up to 1.2 s for stings (`cheer`,
  `glorifail`, `dayFanfare`); up to 1.5 s for the `tubeSwoosh`.
- **Editing:** apply a 50-100 ms fade-in and 100-200 ms fade-out in
  Audacity so they layer cleanly without click-pops.
- **Total payload target:** under 80 KB across all 13 files.

## Sourcing CC0 assets

Two recommended pools for CC0 (or CC-0-equivalent) audio:

- [Freesound](https://freesound.org/) - filter by license `CC0`.
- [Pixabay Audio](https://pixabay.com/sound-effects/) - default
  Pixabay license is permissive for our use.

Per file, capture in `public/sounds/CREDITS.md` (a follow-up commit):
the source URL, the author handle, the file's license string, and the
date downloaded. Keep that ledger so we can re-verify provenance later.

## Naming convention

Files match the `SoundId` literally (`tubeSwoosh.mp3`, not
`tube-swoosh.mp3`). The mapping is hard-coded in `src/lib/sound.ts`'s
`SOUND_DEFS` table; renaming a file means updating both sides.
