import { extend, useTick } from '@pixi/react';
import { Container, Graphics } from 'pixi.js';
import { useCallback, useMemo, useRef } from 'react';
import type { VerbProps } from './types';
import { makePartDraw } from './PartShapes';

extend({ Container, Graphics });

/**
 * AttractVerb. Static part with 6 short tick-marks arranged radially around
 * the part, pulsing inward toward the part center over 0.8s, repeat.
 *
 * Note: the spec calls for "a faint magnet field of dotted lines pulling
 * toward the part center". A field of dotted lines is unreadable at 60px,
 * so we simplify to 6 short rose-colored tick marks that march inward
 * (start far, end close) on each beat. The "attract" reading still works
 * (something is being pulled in) at this scale.
 *
 * Reduced-motion: only the static part renders, no overlay.
 */
const TICK_COUNT = 6;
const CYCLE_DURATION = 0.8;
const ROSE = 0xff6f61;

export function AttractVerb({
  partId,
  x,
  y,
  size = 60,
  reducedMotion = false,
}: VerbProps) {
  const partDraw = useMemo(() => makePartDraw(partId, size), [partId, size]);
  const overlayRef = useRef<Graphics | null>(null);
  const elapsed = useRef(0);
  const farRadius = size * 0.95;
  const nearRadius = size * 0.45;

  useTick({
    isEnabled: !reducedMotion,
    callback: (ticker) => {
      const g = overlayRef.current;
      if (!g) return;
      elapsed.current += (ticker.deltaMS || 16.6) / 1000;
      const phase = elapsed.current % CYCLE_DURATION;
      const t = phase / CYCLE_DURATION;
      const radius = farRadius + (nearRadius - farRadius) * t;
      const tickLen = 4 + (1 - t) * 4; // 8px far, 4px near
      const alpha = 0.35 + (1 - t) * 0.45; // brightens as it gets close
      g.clear();
      for (let i = 0; i < TICK_COUNT; i++) {
        const angle = (i / TICK_COUNT) * Math.PI * 2;
        const cx = Math.cos(angle);
        const cy = Math.sin(angle);
        const x1 = cx * radius;
        const y1 = cy * radius;
        const x2 = cx * (radius - tickLen);
        const y2 = cy * (radius - tickLen);
        g.moveTo(x1, y1)
          .lineTo(x2, y2)
          .stroke({ width: 2, color: ROSE, alpha });
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
