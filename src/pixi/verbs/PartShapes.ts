import type { Graphics } from 'pixi.js';
import { PART_ICONS } from '../../data/partIcons';

/**
 * Lightweight Pixi-side part renderer used by all 12 verb components.
 *
 * M14 is creating `src/pixi/PartSprite.tsx` in parallel as a fully-fledged
 * Pixi Container. While that lands, the verb components consume this helper
 * directly so each verb can draw the actual part visual without depending on
 * M14's file. If M14's PartSprite arrives later, verbs can be migrated to
 * import from there in a follow-up.
 *
 * Implementation: Pixi v8's `Graphics.svg(string)` parses an inline SVG
 * fragment into Graphics instructions. We feed it the canonical body markup
 * from M13's `PART_ICONS` (single source of truth shared with `<PartIcon />`
 * on the DOM side) so the test chamber and the catalogue stay visually
 * identical.
 *
 * Sizing: the body uses a 0 0 32 32 viewBox, so we wrap the body in an SVG
 * with that viewBox at the requested target size and translate by -size/2
 * so the part renders centered on the host Container's origin. The caller
 * places the Container; the draw callback below is unaware of position.
 *
 * Stroke: the wireframe parts are stroked at 2.4px ink. We preserve the
 * stroke globally on the SVG element so every shape inherits it the same
 * way `<PartIcon />` does on the DOM side.
 */

const STROKE = '#1F1A2A';
const STROKE_WIDTH = 2.4;

function buildSvg(partId: string, size: number): string {
  const def = PART_ICONS[partId];
  const body =
    def !== undefined
      ? def.body
      : '<rect x="6" y="6" width="20" height="20" rx="3" stroke-dasharray="3 3" />';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"` +
    ` fill="none" stroke="${STROKE}" stroke-width="${STROKE_WIDTH}"` +
    ` stroke-linecap="round" stroke-linejoin="round">${body}</svg>`
  );
}

/**
 * Draw callback factory for `<pixiGraphics draw={...} />` consumers. The
 * returned callback clears the Graphics, translates so the 32x32 part
 * renders centered on (0, 0), and emits the SVG.
 *
 * Verbs that animate via container transforms (rotation, scale, skew) keep
 * the draw callback static and apply transforms to the parent
 * `<pixiContainer>` instead.
 */
export function makePartDraw(
  partId: string,
  size: number,
): (g: Graphics) => void {
  const svg = buildSvg(partId, size);
  const half = size / 2;
  return (g) => {
    g.clear();
    g.translateTransform(-half, -half);
    g.svg(svg);
    g.resetTransform();
  };
}
