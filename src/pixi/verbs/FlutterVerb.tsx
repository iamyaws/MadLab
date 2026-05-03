import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * FlutterVerb. Slight rotation +/- 8 degrees combined with vertical drift
 * +/- 4px on a 0.7s loop. Reduced-motion: render static at base.
 */
const PERIOD_SECONDS = 0.7;
const ANGULAR_PER_FRAME = (Math.PI * 2) / (PERIOD_SECONDS * 60);
const ROT_AMPLITUDE_RAD = (8 * Math.PI) / 180;
const Y_AMPLITUDE = 4;

export function FlutterVerb({
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
      c.rotation = Math.sin(phase.current) * ROT_AMPLITUDE_RAD;
      c.y = y + Math.cos(phase.current) * Y_AMPLITUDE;
    },
  });

  return (
    <pixiContainer ref={ref} x={x} y={y}>
      <pixiGraphics draw={draw} />
    </pixiContainer>
  );
}
