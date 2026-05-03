import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * App smoke tests. Render the whole component tree under a MemoryRouter and
 * assert it does not throw on mount. This catches "the entire app crashes on
 * mount" regressions during future refactors (hook mismatches, route table
 * typos, save-state schema drift).
 *
 * The reduced-motion variant additionally proves that mounting the tree with
 * `prefers-reduced-motion: reduce` is safe: the OrbitStage's `useTick` is
 * gated on the flag, the page-transition `motion.div` collapses to a
 * 0-duration swap, and the global CSS rule short-circuits keyframes. If a
 * future change adds an unconditional animation that throws when motion is
 * disabled, this test catches it.
 *
 * Pixi note: `@pixi/react` is stubbed out at the module level because its
 * runtime depends on `react-reconciler/constants` (no .js extension) which
 * Vite's Vitest dev resolver can not import from node ESM. The runtime path
 * works in the browser bundler. The smoke test exists to prove the React
 * tree mounts, not to render WebGL inside jsdom, so a thin stub is correct.
 */

// `Application` does not render its children: that would surface lowercase
// `pixiContainer`/`pixiGraphics`/`pixiText` JSX through React's DOM warnings.
// The smoke test cares about the *outer* tree mounting, not the WebGL stage,
// so swallowing the children keeps the test output noise-free.
vi.mock('@pixi/react', () => ({
  Application: () => <div data-testid="pixi-application-stub" />,
  extend: () => {},
  useTick: () => {},
}));

vi.mock('pixi.js', () => ({
  Container: class {},
  Graphics: class {},
  Text: class {},
  // OrbitStage instantiated `new TextStyle({...})` at module scope before
  // M14; the stub stays for back-compat in case a future module touches it.
  TextStyle: class {
    constructor(...args: unknown[]) {
      void args;
    }
  },
  // PartSprite (M14) constructs `new GraphicsPath(d)` to convert each part's
  // SVG path string to a Pixi path. The stub accepts the d-string arg so
  // imports resolve cleanly even though the draw callback never fires under
  // the stubbed Application (children are not rendered).
  GraphicsPath: class {
    constructor(...args: unknown[]) {
      void args;
    }
  },
}));

// Howler (M19) is mocked here so the auto-arrival's tube-swoosh play()
// does not reach jsdom's missing HTMLMediaElement.play implementation.
// The runtime path works in the browser; this mock keeps the smoke test
// quiet without hiding real failures (sound.ts's play() is itself
// defensive against missing assets and locked AudioContexts).
vi.mock('howler', () => ({
  Howl: class {
    play() {}
  },
}));

const { App } = await import('./App');

describe('App', () => {
  // Restore matchMedia between cases so the second test does not leak its
  // mock into anything else that runs after it in the same file.
  let originalMatchMedia: typeof window.matchMedia | undefined;

  afterEach(() => {
    if (originalMatchMedia !== undefined) {
      window.matchMedia = originalMatchMedia;
      originalMatchMedia = undefined;
    }
  });

  it('mounts without throwing', () => {
    expect(() =>
      act(() => {
        render(
          <MemoryRouter>
            <App />
          </MemoryRouter>,
        );
      }),
    ).not.toThrow();
  });

  it('mounts under prefers-reduced-motion', () => {
    originalMatchMedia = window.matchMedia;
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList;
    expect(() =>
      act(() => {
        render(
          <MemoryRouter>
            <App />
          </MemoryRouter>,
        );
      }),
    ).not.toThrow();
  });
});
