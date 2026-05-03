/**
 * Smoke tests for the Howler-backed sound layer. We mock the `howler`
 * module so the test runs in jsdom (which has no real AudioContext) and
 * we can assert on the calls our wrapper makes without instantiating an
 * actual audio engine.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const playMock = vi.fn();
const howlConstructor = vi.fn().mockImplementation(() => ({ play: playMock }));

vi.mock('howler', () => ({
  Howl: howlConstructor,
}));

beforeEach(() => {
  vi.resetModules();
  playMock.mockClear();
  howlConstructor.mockClear();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('sound', () => {
  it('play("tubeSwoosh") does not throw', async () => {
    const sound = await import('../sound');
    expect(() => sound.play('tubeSwoosh')).not.toThrow();
    expect(howlConstructor).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledTimes(1);
  });

  it('caches Howl per id (second play does not reconstruct)', async () => {
    const sound = await import('../sound');
    sound.play('tubeSwoosh');
    sound.play('tubeSwoosh');
    expect(howlConstructor).toHaveBeenCalledTimes(1);
    expect(playMock).toHaveBeenCalledTimes(2);
  });

  it('setMuted(true) gates play() to a no-op', async () => {
    const sound = await import('../sound');
    sound.setMuted(true);
    expect(sound.isMuted()).toBe(true);
    sound.play('cheer');
    expect(howlConstructor).not.toHaveBeenCalled();
    expect(playMock).not.toHaveBeenCalled();
    sound.setMuted(false);
    expect(sound.isMuted()).toBe(false);
  });

  it('isMuted defaults to false on a fresh module', async () => {
    const sound = await import('../sound');
    expect(sound.isMuted()).toBe(false);
  });

  it('swallows Howl construction errors silently', async () => {
    howlConstructor.mockImplementationOnce(() => {
      throw new Error('AudioContext unavailable');
    });
    const sound = await import('../sound');
    expect(() => sound.play('tubeSwoosh')).not.toThrow();
  });

  it('swallows play() errors from a constructed Howl', async () => {
    playMock.mockImplementationOnce(() => {
      throw new Error('not unlocked yet');
    });
    const sound = await import('../sound');
    expect(() => sound.play('partPick')).not.toThrow();
  });

  it('SOUND_DEFS has an entry for every SoundId', async () => {
    const sound = await import('../sound');
    const ids = [
      'tubeSwoosh',
      'partPick',
      'partUnpick',
      'fireUp',
      'kaThunk',
      'sensorTick',
      'cheer',
      'satisfiedHum',
      'sortOfBlip',
      'glorifail',
      'unlockChime',
      'dailyClaim',
      'dayFanfare',
    ] as const;
    for (const id of ids) {
      expect(sound.SOUND_DEFS[id]).toBeDefined();
      expect(sound.SOUND_DEFS[id].src.length).toBeGreaterThan(0);
    }
  });

  it('preloadAll constructs every Howl up front', async () => {
    const sound = await import('../sound');
    sound.preloadAll();
    expect(howlConstructor).toHaveBeenCalledTimes(13);
  });
});
