import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * PuffVerb. Static part with a cyan smoke ring that expands from the part
 * outward, fading over 1s. Repeats every 1.5s.
 *
 * Reduced-motion: only the static part renders.
 */
const RING_DURATION = 1.0;
const CYCLE_DURATION = 1.5;
const CYAN = 0x3cc4da;

export function PuffVerb({
  partId,
  x,
  y,
  size = 60,
  reducedMotion = false,
}: VerbProps) {
  const partDraw = useMemo(() => makePartDraw(partId, size), [partId, size]);
  const overlayRef = useRef<Graphics | null>(null);
  const elapsed = useRef(0);
  const maxRadius = size * 0.85;

  useTick({
    isEnabled: !reducedMotion,
    callback: (ticker) => {
      const g = overlayRef.current;
      if (!g) return;
      elapsed.current += (ticker.deltaMS || 16.6) / 1000;
      const phase = elapsed.current % CYCLE_DURATION;
      g.clear();
      if (phase > RING_DURATION) return;
      const t = phase / RING_DURATION;
      const radius = size * 0.3 + (maxRadius - size * 0.3) * t;
      const alpha = (1 - t) * 0.6;
      g.circle(0, 0, radius).stroke({
        width: 2.5,
        color: CYAN,
        alpha,
      });
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
