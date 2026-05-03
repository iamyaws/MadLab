import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * GlowVerb. A soft cyan circle aura behind the part with alpha pulsing
 * 0.3 -> 0.7 -> 0.3 over 1s, looping. The aura sits *behind* the part
 * because it is rendered first in the child order.
 *
 * Reduced-motion: aura renders at low static alpha 0.3.
 */
const PERIOD_SECONDS = 1.0;
const ANGULAR_PER_FRAME = (Math.PI * 2) / (PERIOD_SECONDS * 60);
const ALPHA_MIN = 0.3;
const ALPHA_MAX = 0.7;
const ALPHA_CENTER = (ALPHA_MIN + ALPHA_MAX) / 2;
const ALPHA_AMPLITUDE = (ALPHA_MAX - ALPHA_MIN) / 2;
const CYAN = 0x3cc4da;

export function GlowVerb({
  partId,
  x,
  y,
  size = 60,
  reducedMotion = false,
}: VerbProps) {
  const partDraw = useMemo(() => makePartDraw(partId, size), [partId, size]);
  const auraRef = useRef<Graphics | null>(null);
  const phase = useRef(0);
  const auraRadius = size * 0.7;

  // Static draw of the aura disc; alpha is animated via the Graphics
  // instance's alpha property each tick.
  const drawAura = useCallback(
    (g: Graphics) => {
      g.clear();
      g.circle(0, 0, auraRadius).fill({ color: CYAN, alpha: 1 });
    },
    [auraRadius],
  );

  useTick({
    isEnabled: !reducedMotion,
    callback: (ticker) => {
      const g = auraRef.current;
      if (!g) return;
      phase.current += ANGULAR_PER_FRAME * ticker.deltaTime;
      g.alpha = ALPHA_CENTER + Math.sin(phase.current) * ALPHA_AMPLITUDE;
    },
  });

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics ref={auraRef} draw={drawAura} alpha={ALPHA_MIN} />
      <pixiGraphics draw={partDraw} />
    </pixiContainer>
  );
}
