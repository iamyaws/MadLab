import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * WatchVerb. The part is static. Two tiny ink eye-pupils sit above the part
 * and slide left-to-right and back over 1.5s on a sine wave. The pupils sit
 * inside small paper-colored sclera circles so they read as eyes against the
 * paper background.
 *
 * Reduced-motion: pupils render at center (no scan).
 */
const PERIOD_SECONDS = 1.5;
const ANGULAR_PER_FRAME = (Math.PI * 2) / (PERIOD_SECONDS * 60);
const SCAN_AMPLITUDE = 1.5; // px the pupil drifts left/right
const INK = 0x1f1a2a;
const PAPER = 0xfffbef;

export function WatchVerb({
  partId,
  x,
  y,
  size = 60,
  reducedMotion = false,
}: VerbProps) {
  const partDraw = useMemo(() => makePartDraw(partId, size), [partId, size]);
  const leftPupilRef = useRef<Graphics | null>(null);
  const rightPupilRef = useRef<Graphics | null>(null);
  const phase = useRef(0);

  // Pupils sit just above the part top, ~6px apart.
  const eyeY = -size * 0.45;
  const eyeOffsetX = 5;
  const scleraRadius = 3.6;
  const pupilRadius = 1.6;

  const drawSclera = useCallback(
    (g: Graphics) => {
      g.clear();
      g.circle(0, 0, scleraRadius)
        .fill({ color: PAPER, alpha: 1 })
        .stroke({ width: 1.4, color: INK });
    },
    [scleraRadius],
  );

  const drawPupil = useCallback(
    (g: Graphics) => {
      g.clear();
      g.circle(0, 0, pupilRadius).fill(INK);
    },
    [pupilRadius],
  );

  useTick({
    isEnabled: !reducedMotion,
    callback: (ticker) => {
      const lp = leftPupilRef.current;
      const rp = rightPupilRef.current;
      if (!lp || !rp) return;
      phase.current += ANGULAR_PER_FRAME * ticker.deltaTime;
      const drift = Math.sin(phase.current) * SCAN_AMPLITUDE;
      lp.x = -eyeOffsetX + drift;
      rp.x = eyeOffsetX + drift;
    },
  });

  return (
    <pixiContainer x={x} y={y}>
      <pixiGraphics draw={partDraw} />
      <pixiContainer y={eyeY}>
        <pixiGraphics x={-eyeOffsetX} draw={drawSclera} />
        <pixiGraphics x={eyeOffsetX} draw={drawSclera} />
        <pixiGraphics ref={leftPupilRef} x={-eyeOffsetX} draw={drawPupil} />
        <pixiGraphics ref={rightPupilRef} x={eyeOffsetX} draw={drawPupil} />
      </pixiContainer>
    </pixiContainer>
  );
}
