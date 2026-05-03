import { useTick } from '@pixi/react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from 'react';
import { Container, Graphics } from 'pixi.js';
import type { Part } from '../lib/types';
import { PartSprite } from './PartSprite';

/**
 * OrbitStage. The 3D-tilted orbit of pickable parts arranged in a ring around
 * a central contraption placeholder. Rendered inside a PixiRoot.
 *
 * The wireframe at docs/wireframes/hifi-c-v2.html applies a CSS
 * `rotateX(56deg)` to a circular orbit. Pixi has no first-class 3D in v8, so
 * we approximate the tilt by drawing an ellipse: full width, ~56% height.
 * Visual cue: tilted oval, not flat circle. The orbit rotates over ~32s
 * linear, infinite. `prefers-reduced-motion: reduce` freezes the rotation.
 *
 * State boundary: parts, selectedPartIds, and lockedPartIds are owned by
 * React props. Pixi receives them and emits intents via `onPick`. The only
 * internal Pixi state is the rotation timer driven by `useTick`.
 */
export interface OrbitStageProps {
  parts: Part[];
  selectedPartIds: string[];
  lockedPartIds?: string[];
  onPick: (partId: string) => void;
  width?: number;
  height?: number;
}

const DEFAULT_SIZE = 320;
const ORBIT_RADIUS_X = 140;
const ORBIT_RADIUS_Y = 78;
const PART_TARGET = 54;
const CENTER_SIZE = 90;
const ROTATION_PERIOD_SECONDS = 32;

const COLOR_INK = 0x1f1a2a;
const COLOR_PRIMARY = 0x3cc4da;

interface PartRefs {
  containerRef: MutableRefObject<Container | null>;
}

function makePartRefs(): PartRefs {
  return {
    containerRef: { current: null },
  };
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function OrbitStage({
  parts,
  selectedPartIds,
  lockedPartIds = [],
  onPick,
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
}: OrbitStageProps) {
  const cx = width / 2;
  const cy = height / 2;
  const orbitRef = useRef<Container | null>(null);
  // Per-part refs keyed by part.id so re-orderings or insertions don't
  // mis-align label counter-rotation against the wrong part.
  const partRefsMap = useRef<Map<string, PartRefs>>(new Map());
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    prefersReducedMotion(),
  );

  // Keep the reduced-motion state in sync if the user toggles the OS setting
  // mid-session. Listener attached once at mount.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Ensure every present part has a refs slot and stale ids are dropped.
  const seenIds = new Set(parts.map((p) => p.id));
  for (const part of parts) {
    if (!partRefsMap.current.has(part.id)) {
      partRefsMap.current.set(part.id, makePartRefs());
    }
  }
  for (const id of Array.from(partRefsMap.current.keys())) {
    if (!seenIds.has(id)) partRefsMap.current.delete(id);
  }

  // Drive the orbit rotation. `ticker.deltaTime` is ~1.0 at 60fps; converting
  // to a per-tick angular delta keeps the spin tied to wall-clock time.
  // 360deg over 32s at 60fps means 360 / (32 * 60) deg per frame.
  const radiansPerFrame = useMemo(
    () => (Math.PI * 2) / (ROTATION_PERIOD_SECONDS * 60),
    [],
  );

  useTick({
    isEnabled: !reducedMotion,
    callback: (ticker) => {
      const orbit = orbitRef.current;
      if (!orbit) return;
      orbit.rotation += radiansPerFrame * ticker.deltaTime;
      // Counter-rotate each part container so the icon (a cog with teeth
      // at the top, a beaker with its mouth up) stays upright through the
      // orbit spin. Mirrors the wireframe's `.upright` chip.
      for (const refs of partRefsMap.current.values()) {
        const container = refs.containerRef.current;
        if (container) container.rotation = -orbit.rotation;
      }
    },
  });

  // Static draw: orbit ring as a dashed-look ellipse outline. We approximate
  // dashes with a thin solid stroke at low alpha; close enough for Phase 1.
  const drawRing = useCallback(
    (g: Graphics) => {
      g.clear();
      g.ellipse(0, 0, ORBIT_RADIUS_X, ORBIT_RADIUS_Y);
      g.stroke({ width: 2, color: COLOR_INK, alpha: 0.4 });
    },
    [],
  );

  // Central contraption placeholder. 90px rounded square in primary cyan
  // with ink outline. M9 may swap this for richer art.
  const drawContraption = useCallback((g: Graphics) => {
    g.clear();
    const half = CENTER_SIZE / 2;
    g.roundRect(-half, -half, CENTER_SIZE, CENTER_SIZE, 18);
    g.fill(COLOR_PRIMARY);
    g.stroke({ width: 2.5, color: COLOR_INK });
  }, []);

  return (
    <pixiContainer x={cx} y={cy}>
      {/* Orbit ring: a dashed-feeling ellipse hint that the orbit is tilted. */}
      <pixiGraphics draw={drawRing} />

      {/* Spinning orbit. Parts are placed around an ellipse so the visual
          reads as a tilted ring without true Pixi 3D. */}
      <pixiContainer ref={orbitRef}>
        {parts.map((part, i) => {
          const angle = (i / parts.length) * Math.PI * 2 - Math.PI / 2;
          const px = Math.cos(angle) * ORBIT_RADIUS_X;
          const py = Math.sin(angle) * ORBIT_RADIUS_Y;
          const isSelected = selectedPartIds.includes(part.id);
          const isLocked = lockedPartIds.includes(part.id);
          const refs = partRefsMap.current.get(part.id);
          if (!refs) return null;
          return (
            <PartNode
              key={part.id}
              part={part}
              x={px}
              y={py}
              isSelected={isSelected}
              isLocked={isLocked}
              onPick={onPick}
              containerRef={refs.containerRef}
            />
          );
        })}
      </pixiContainer>

      {/* Central contraption placeholder. Stays upright (no parent rotation). */}
      <pixiGraphics draw={drawContraption} />
    </pixiContainer>
  );
}

interface PartNodeProps {
  part: Part;
  x: number;
  y: number;
  isSelected: boolean;
  isLocked: boolean;
  onPick: (partId: string) => void;
  containerRef: MutableRefObject<Container | null>;
}

function PartNode({
  part,
  x,
  y,
  isSelected,
  isLocked,
  onPick,
  containerRef,
}: PartNodeProps) {
  const handlePointerDown = useCallback(() => {
    if (isLocked) return;
    onPick(part.id);
  }, [isLocked, onPick, part.id]);

  // Selected parts up-translate slightly via a small scale bump. Pixi v8 has
  // no z-translation, so a 1.08 scale is the closest readable analogue.
  const scale = isSelected ? 1.08 : 1;

  return (
    <pixiContainer
      ref={containerRef}
      x={x}
      y={y}
      scale={scale}
      eventMode={isLocked ? 'none' : 'static'}
      cursor={isLocked ? 'default' : 'pointer'}
      onPointerDown={handlePointerDown}
    >
      <PartSprite
        partId={part.id}
        size={PART_TARGET}
        selected={isSelected}
        locked={isLocked}
      />
    </pixiContainer>
  );
}
