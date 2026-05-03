import type { JSX } from 'react';
import { PART_ICONS, type PartIconShape } from '../../data/partIcons';

/**
 * PartIcon. Renders the SVG glyph for a Part by id, using the canonical
 * data in `src/data/partIcons.ts`. The same data drives the future Pixi
 * part sprites (M14) so the orbit, the test chamber, the chip row, and the
 * catalogue stay visually identical.
 *
 * Sizing: square at `size` px, default 28. The SVG keeps its 0 0 32 32
 * viewBox so the wireframe's 2.4px stroke and pre-positioned shapes scale
 * cleanly without a separate transform.
 *
 * Accessibility: when `ariaLabel` is provided the SVG announces with
 * `role="img"` plus the label. When omitted the SVG is decorative and
 * `aria-hidden="true"`; consumers that already announce the part name
 * elsewhere (PartChip's text label, ReactionPage's parts script) should
 * leave it omitted to avoid double announcements.
 *
 * Unknown ids: render a neutral fallback box so a typo or stale catalogue
 * entry does not crash the page. The fallback keeps the size + stroke.
 *
 * Implementation note: the renderer walks `def.shapes` and emits standard
 * JSX (`<path>`, `<circle>`, `<line>`) so React's normal escaping +
 * reconciliation apply. The `body` string on each PartIconDef is for Pixi
 * cross-checks in M14, not for raw HTML insertion here.
 */
export interface PartIconProps {
  /**
   * Part id (matches `Part['id']`). When unknown, the fallback box renders.
   */
  partId: string;
  /**
   * Square size in pixels. Default 28 to match the wireframe's `Ic` default.
   */
  size?: number;
  /**
   * When set, the SVG announces with `role="img"` + this label. Omit for
   * decorative use (the SVG becomes `aria-hidden="true"`).
   */
  ariaLabel?: string;
}

const STROKE = '#1F1A2A';
const STROKE_WIDTH = 2.4;

function renderShape(shape: PartIconShape, key: number): JSX.Element {
  switch (shape.kind) {
    case 'path':
      return (
        <path
          key={key}
          d={shape.d}
          fill={shape.fill}
          stroke={shape.stroke}
          strokeWidth={shape.strokeWidth}
        />
      );
    case 'circle':
      return (
        <circle
          key={key}
          cx={shape.cx}
          cy={shape.cy}
          r={shape.r}
          fill={shape.fill}
        />
      );
    case 'line':
      return (
        <line
          key={key}
          x1={shape.x1}
          y1={shape.y1}
          x2={shape.x2}
          y2={shape.y2}
        />
      );
  }
}

export function PartIcon({
  partId,
  size = 28,
  ariaLabel,
}: PartIconProps): JSX.Element {
  const def = PART_ICONS[partId];

  const a11y = ariaLabel
    ? { role: 'img' as const, 'aria-label': ariaLabel }
    : { 'aria-hidden': true as const };

  if (!def) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        stroke={STROKE}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...a11y}
      >
        {/* Fallback: dashed box so a typo or stale id never crashes the page. */}
        <rect
          x="6"
          y="6"
          width="20"
          height="20"
          rx="3"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke={STROKE}
      strokeWidth={STROKE_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
    >
      {def.shapes.map((shape, i) => renderShape(shape, i))}
    </svg>
  );
}
