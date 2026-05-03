import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * WobbleVerb. Skews the part horizontally +/- 6 degrees on a 0.5s sine wave,
 * looping. Pixi v8 has no skew on Container by default but exposes `skew`
 * via the Container's transform; we use it. Reduced-motion: render static.
 */
const PERIOD_SECONDS = 0.5;
const ANGULAR_PER_FRAME = (Math.PI * 2) / (PERIOD_SECONDS * 60);
const AMPLITUDE_RAD = (6 * Math.PI) / 180;

export function WobbleVerb({
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
      c.skew.x = Math.sin(phase.current) * AMPLITUDE_RAD;
    },
  });

  return (
    <pixiContainer ref={ref} x={x} y={y}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
