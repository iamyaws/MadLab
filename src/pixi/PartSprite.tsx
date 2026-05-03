import { useCallback } from 'react';
import {
  Container,
  Graphics,
  GraphicsPath,
  type ColorSource,
  type StrokeStyle,
} from 'pixi.js';
import { extend } from '@pixi/react';
import {
  PART_ICONS,
  type PartIconShape,
  GOLD,
  PAPER,
  INK,
} from '../data/partIcons';

/**
 * PartSprite. A reusable Pixi component that draws a single part visual
 * using PIXI Graphics, driven by the typed `shapes` array on
 * `PART_ICONS[partId]` from `src/data/partIcons.ts`.
 *
 * Single source of truth: M13 hand-transcribed the wireframe icons into a
 * typed shape table. The DOM `PartIcon` walks that table and emits SVG
 * elements; this Pixi sprite walks the same table and emits Pixi primitive
 * calls. The orbit (M14), the test chamber (M15), and any future Pixi
 * surface that needs a part icon all consume PartSprite.
 *
 * Layout: the slot (background chip) is drawn at full `size` in screen
 * coordinates. The icon shapes are authored in the wireframe's 0..32
 * viewBox; we wrap them in an inner pixiContainer scaled by `size / 32`
 * with its pivot at the viewBox center, so the 32-unit drawing centers on
 * the parent origin and matches the DOM PartIcon pixel-for-pixel.
 *
 * Stroke: every shape strokes at 2.4 viewBox units in ink, identical to
 * PartIcon's `<svg stroke="#1F1A2A" stroke-width="2.4" />` cascade. Per-
 * shape stroke overrides (e.g. magnet's white tip slashes) are honored.
 *
 * Selected: chip fill swaps to gold. Locked: chip fill swaps to muted tan
 * and the icon dims to 0.55 alpha, mirroring OrbitStage's pre-M14 logic.
 *
 * Selection scale (the 1.08 lift) and the pointer event handlers stay on
 * the OrbitStage's PartNode wrapper. PartSprite is purely visual: same
 * inputs always produce the same draw, no internal state.
 */
extend({ Container, Graphics });

export interface PartSpriteProps {
  /**
   * Part id (matches `Part['id']`). Unknown ids render nothing; callers
   * already have a fallback path in DOM PartIcon, and the orbit only ever
   * passes ids from the seeded PARTS table.
   */
  partId: string;
  /**
   * Square chip size in pixels. Default 54 to match the wireframe's part
   * chip and OrbitStage's PART_TARGET constant.
   */
  size?: number;
  /**
   * When true, the chip fills gold (selected state). Mutually exclusive
   * with `locked` in practice; if both are passed, locked wins on alpha
   * but selected wins on chip color (matches the orbit's pre-M14 logic).
   */
  selected?: boolean;
  /**
   * When true, the chip fills muted tan, the icon drops to 0.55 alpha,
   * and the parent should disable pointer events (PartSprite itself does
   * not own input handling).
   */
  locked?: boolean;
}

const COLOR_INK = hexToInt(INK);
const COLOR_GOLD = hexToInt(GOLD);
const COLOR_PAPER = hexToInt(PAPER);
const COLOR_LOCKED = 0xc8b894;

const STROKE_WIDTH_UNITS = 2.4;
const VIEWBOX = 32;
const CHIP_RADIUS_RATIO = 14 / 54;

function hexToInt(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

/**
 * Resolve the optional `fill` color on a shape (either an explicit hex
 * literal from the shape data, or undefined) to a Pixi color int. Returns
 * null when no fill is defined, signaling "stroke only".
 */
function resolveFill(hex: string | undefined): ColorSource | null {
  if (!hex) return null;
  return hexToInt(hex);
}

/**
 * Resolve the per-shape stroke. Most shapes inherit the part-wide ink
 * stroke at 2.4 viewBox units; magnet's tip slashes override with a paper
 * fill at 2 units. The shape data already encodes those overrides.
 */
function resolveStroke(shape: PartIconShape): StrokeStyle {
  if (shape.kind === 'path' && shape.stroke !== undefined) {
    return {
      color: hexToInt(shape.stroke),
      width: shape.strokeWidth ?? STROKE_WIDTH_UNITS,
    };
  }
  return { color: COLOR_INK, width: STROKE_WIDTH_UNITS };
}

/**
 * Draw a single shape from the typed table onto a Pixi Graphics. Each
 * shape kind maps to the matching Pixi primitive call. The `path` kind
 * uses `new GraphicsPath(d)` which v8's parser handles natively (M, L,
 * H, V, Q, Z, plus their lowercase variants — full coverage of the d
 * strings in `partIcons.ts`).
 */
function drawShape(g: Graphics, shape: PartIconShape): void {
  switch (shape.kind) {
    case 'circle': {
      g.circle(shape.cx, shape.cy, shape.r);
      const fill = resolveFill(shape.fill);
      if (fill !== null) g.fill(fill);
      g.stroke(resolveStroke(shape));
      return;
    }
    case 'line': {
      g.moveTo(shape.x1, shape.y1).lineTo(shape.x2, shape.y2);
      g.stroke(resolveStroke(shape));
      return;
    }
    case 'path': {
      g.path(new GraphicsPath(shape.d));
      const fill = resolveFill(shape.fill);
      if (fill !== null) g.fill(fill);
      g.stroke(resolveStroke(shape));
      return;
    }
  }
}

export function PartSprite({
  partId,
  size = 54,
  selected = false,
  locked = false,
}: PartSpriteProps) {
  const def = PART_ICONS[partId];

  // Background chip. Filled by selection state, stroked in ink. Drawn in
  // screen-space units at full chip size; the icon scales separately.
  const drawChip = useCallback(
    (g: Graphics) => {
      g.clear();
      const half = size / 2;
      const radius = size * CHIP_RADIUS_RATIO;
      g.roundRect(-half, -half, size, size, radius);
      const chipFill = selected
        ? COLOR_GOLD
        : locked
          ? COLOR_LOCKED
          : COLOR_PAPER;
      const chipAlpha = locked ? 0.55 : 1;
      g.fill({ color: chipFill, alpha: chipAlpha });
      g.stroke({
        color: COLOR_INK,
        width: selected ? 3.5 : 2.5,
        alpha: chipAlpha,
      });
    },
    [size, selected, locked],
  );

  // Walk the M13 typed shapes and draw each onto a single Graphics. We
  // could split into per-shape Graphics, but one Graphics per icon keeps
  // the draw call count low and matches PartIcon's single SVG element.
  const drawIcon = useCallback(
    (g: Graphics) => {
      g.clear();
      if (!def) return;
      for (const shape of def.shapes) {
        drawShape(g, shape);
      }
    },
    [def],
  );

  if (!def) return null;

  // The icon is authored at viewBox 0..32. Scale to fit the chip and pivot
  // at the viewBox center so the icon centers on the parent origin. This
  // keeps the icon visually identical to the DOM PartIcon at any size.
  const iconScale = size / VIEWBOX;
  const iconAlpha = locked ? 0.55 : 1;

  return (
    <pixiContainer>
      <pixiGraphics draw={drawChip} />
      <pixiContainer
        scale={iconScale}
        pivot={{ x: VIEWBOX / 2, y: VIEWBOX / 2 }}
        alpha={iconAlpha}
      >
        <pixiGraphics draw={drawIcon} />
      </pixiContainer>
    </pixiContainer>
  );
}
