import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * SparkVerb. Static part with a burst of 6 tiny gold dots flying outward
 * from the center on a 0.6s burst, repeating every 1s.
 *
 * Reduced-motion: only the static part renders, no burst.
 */
const PARTICLE_COUNT = 6;
const BURST_DURATION = 0.6;
const CYCLE_DURATION = 1.0;
const GOLD = 0xffc93c;

export function SparkVerb({
  partId,
  x,
  y,
  size = 60,
  reducedMotion = false,
}: VerbProps) {
  const partDraw = useMemo(() => makePartDraw(partId, size), [partId, size]);
  const overlayRef = useRef<Graphics | null>(null);
  const elapsed = useRef(0);
  const maxDistance = size * 0.7;

  useTick({
    isEnabled: !reducedMotion,
    callback: (ticker) => {
      const g = overlayRef.current;
      if (!g) return;
      // ticker.deltaMS is ms since last tick; convert to seconds.
      elapsed.current += (ticker.deltaMS || 16.6) / 1000;
      const phase = elapsed.current % CYCLE_DURATION;
      g.clear();
      if (phase > BURST_DURATION) return;
      const t = phase / BURST_DURATION;
      const dist = t * maxDistance;
      const alpha = 1 - t;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        g.circle(px, py, 2.4).fill({ color: GOLD, alpha });
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
