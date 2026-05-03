import { useEffect, useMemo } from 'react';
import type { Part } from '../lib/types';
import { VERB_COMPONENTS } from './verbs';

/**
 * TestStage. The Pixi-side stage rendered inside the C4 Test screen's glass-
 * dome chamber. Replaces M10's CSS keyframe spark overlay with a real Pixi
 * stage where the four picked parts each play their `behaviorVerb`-keyed
 * animation simultaneously.
 *
 * Layout: a fixed 2x2 grid centered on the stage, parts ~80px apart. Each
 * grid slot mounts the verb component dispatched from `VERB_COMPONENTS`,
 * passing the part id so each verb can render the correct part visual via
 * M13's `PART_ICONS` data.
 *
 * Timing: a 3-second wall-clock window. After the window closes, the stage
 * fires the optional `onComplete` callback so the parent can advance the
 * round-flow (TestPage stays in charge of the navigation; the stage just
 * notifies). With `reducedMotion`, the verbs render at their static rest
 * pose and `onComplete` fires on the next tick (~60ms) so the page advance
 * still flows through the same code path.
 *
 * Customer silhouette + contraption: the wireframe places the customer
 * portrait inside the dome. Phase 2 keeps the DOM-rendered `<Customer />`
 * (a finished SVG) overlaid via the parent TestPage, leaving the Pixi stage
 * dedicated to the verb burst. This avoids redrawing a complex customer SVG
 * via Pixi's path parser and keeps the test reveal focused on the verbs.
 *
 * Notes on reduced-motion: each verb component independently honors its own
 * `reducedMotion` prop and renders the part static at base position when
 * set. So with `reducedMotion=true` the stage is a still tableau of four
 * legible part icons in a 2x2 grid.
 */
export interface TestStageProps {
  /**
   * The four parts being tested. Mounted in pick-order top-left, top-right,
   * bottom-left, bottom-right. The component is robust against fewer than
   * four (renders only the supplied ones) but the round flow always passes
   * exactly four.
   */
  parts: Part[];
  width: number;
  height: number;
  reducedMotion?: boolean;
  /**
   * Fires after the 3-second test window (or on the next tick under
   * reduced-motion). Wrap with `useCallback` if the parent re-renders
   * frequently to avoid resetting the timer.
   */
  onComplete?: () => void;
  /**
   * Length of the test window in ms. Defaults to 3000. Provided so unit
   * tests and demo modes can tune the window.
   */
  durationMs?: number;
}

const DEFAULT_DURATION_MS = 3000;
const REDUCED_MOTION_DELAY_MS = 60;
const SLOT_SPACING = 80;
const VERB_SIZE = 60;

/**
 * Compute the (x, y) center of each of the four 2x2 grid slots, given the
 * stage width and height. Slots are spaced `SLOT_SPACING` apart and the
 * grid is centered on the stage.
 */
function computeSlots(
  width: number,
  height: number,
): Array<{ x: number; y: number }> {
  const cx = width / 2;
  const cy = height / 2;
  const dx = SLOT_SPACING / 2;
  const dy = SLOT_SPACING / 2;
  return [
    { x: cx - dx, y: cy - dy },
    { x: cx + dx, y: cy - dy },
    { x: cx - dx, y: cy + dy },
    { x: cx + dx, y: cy + dy },
  ];
}

export function TestStage({
  parts,
  width,
  height,
  reducedMotion = false,
  onComplete,
  durationMs = DEFAULT_DURATION_MS,
}: TestStageProps) {
  const slots = useMemo(() => computeSlots(width, height), [width, height]);

  useEffect(() => {
    if (!onComplete) return;
    const wait = reducedMotion ? REDUCED_MOTION_DELAY_MS : durationMs;
    const handle = window.setTimeout(onComplete, wait);
    return () => window.clearTimeout(handle);
  }, [reducedMotion, durationMs, onComplete]);

  return (
    <pixiContainer>
      {parts.slice(0, slots.length).map((part, i) => {
        const Verb = VERB_COMPONENTS[part.behaviorVerb];
        const slot = slots[i];
        return (
          <Verb
            key={`${part.id}-${i}`}
            partId={part.id}
            x={slot.x}
            y={slot.y}
            size={VERB_SIZE}
            reducedMotion={reducedMotion}
          />
        );
      })}
    </pixiContainer>
  );
}
