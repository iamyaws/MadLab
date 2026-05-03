import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * SpinVerb. Rotates the part 360 degrees over ~1.2 seconds, looping.
 * Reduced-motion: render the part static at its base orientation.
 */
const PERIOD_SECONDS = 1.2;
const RADIANS_PER_FRAME = (Math.PI * 2) / (PERIOD_SECONDS * 60);

export function SpinVerb({
  partId,
  x,
  y,
  size = 60,
  reducedMotion = false,
}: VerbProps) {
  const ref = useRef<Container | null>(null);
  const draw = useMemo(() => makePartDraw(partId, size), [partId, size]);

  useTick({
    isEnabled: !reducedMotion,
    callback: (ticker) => {
      const c = ref.current;
      if (c) c.rotation += RADIANS_PER_FRAME * ticker.deltaTime;
    },
  });

  return (
    <pixiContainer ref={ref} x={x} y={y}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
