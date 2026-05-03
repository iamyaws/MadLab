import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * SoftVerb. "Breathing" scale loop 1.0 -> 1.08 -> 1.0 over 1.2s.
 * Reduced-motion: render static at scale 1.
 */
const PERIOD_SECONDS = 1.2;
const ANGULAR_PER_FRAME = (Math.PI * 2) / (PERIOD_SECONDS * 60);
const SCALE_AMPLITUDE = 0.04; // half-amplitude; 1 +/- 0.04 = 0.96..1.04, doubled below

export function SoftVerb({
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
      // Map sine [-1,1] to scale [1.0, 1.08] (centered around 1.04).
      const s = 1.04 + Math.sin(phase.current) * SCALE_AMPLITUDE;
      c.scale.set(s);
    },
  });

  return (
    <pixiContainer ref={ref} x={x} y={y}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
