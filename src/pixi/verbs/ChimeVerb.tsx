import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * ChimeVerb. Static part with three concentric gold ripples that expand from
 * the center over 0.8s, staggered, repeating every 1s.
 *
 * Reduced-motion: only the static part renders.
 */
const RIPPLE_DURATION = 0.8;
const CYCLE_DURATION = 1.0;
const RIPPLE_COUNT = 3;
const GOLD = 0xffc93c;

export function ChimeVerb({
  partId,
  x,
  y,
  size = 60,
  reducedMotion = false,
}: VerbProps) {
  const partDraw = useMemo(() => makePartDraw(partId, size), [partId, size]);
  const overlayRef = useRef<Graphics | null>(null);
  const elapsed = useRef(0);
  const maxRadius = size * 0.9;
  const minRadius = size * 0.35;
  const stagger = RIPPLE_DURATION / RIPPLE_COUNT;

  useTick({
    isEnabled: !reducedMotion,
    callback: (ticker) => {
      const g = overlayRef.current;
      if (!g) return;
      elapsed.current += (ticker.deltaMS || 16.6) / 1000;
      const cyclePhase = elapsed.current % CYCLE_DURATION;
      g.clear();
      for (let i = 0; i < RIPPLE_COUNT; i++) {
        const localPhase = cyclePhase - i * stagger;
        if (localPhase < 0 || localPhase > RIPPLE_DURATION) continue;
        const t = localPhase / RIPPLE_DURATION;
        const radius = minRadius + (maxRadius - minRadius) * t;
        const alpha = (1 - t) * 0.7;
        g.circle(0, 0, radius).stroke({
          width: 2,
          color: GOLD,
          alpha,
        });
      }
    },
  });

  const drawNoop = useCallback((g: Graphics) => {
    g.clear();
  }, []);

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={partDraw} />
      <pixiGraphics ref={overlayRef} draw={drawNoop} />
    </pixiContainer>
  );
}
