import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * BounceVerb. Translates the part vertically +/- 8px over a 0.4s sine wave,
 * looping. Reduced-motion: render static at base position.
 */
const PERIOD_SECONDS = 0.4;
const ANGULAR_PER_FRAME = (Math.PI * 2) / (PERIOD_SECONDS * 60);
const AMPLITUDE = 8;

export function BounceVerb({
  partId,
  x,
  y,
  size = 60,
  reducedMotion = false,
}: VerbProps) {
  const ref = useRef<Container | null>(null);
  const phase = useRef(0);
  const draw = useMemo(() => makePartDraw(partId, size), [partId, size]);

  useTick({
    isEnabled: !reducedMotion,
    callback: (ticker) => {
      const c = ref.current;
      if (!c) return;
      phase.current += ANGULAR_PER_FRAME * ticker.deltaTime;
      c.y = y + Math.sin(phase.current) * AMPLITUDE;
    },
  });

  return (
    <pixiContainer ref={ref} x={x} y={y}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
