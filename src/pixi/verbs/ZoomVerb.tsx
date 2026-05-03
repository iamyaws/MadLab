import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * ZoomVerb. Scale 0.85 -> 1.15 -> 0.85 over 0.5s, ease-in-out via sine.
 * Reduced-motion: render static at scale 1.
 */
const PERIOD_SECONDS = 0.5;
const ANGULAR_PER_FRAME = (Math.PI * 2) / (PERIOD_SECONDS * 60);
const SCALE_CENTER = 1.0;
const SCALE_AMPLITUDE = 0.15;

export function ZoomVerb({
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
      const s = SCALE_CENTER + Math.sin(phase.current) * SCALE_AMPLITUDE;
      c.scale.set(s);
    },
  });

  return (
    <pixiContainer ref={ref} x={x} y={y}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
