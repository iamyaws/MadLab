/**
 * Canonical part-icon data. Each part id maps to:
 *   - `body`   the inline SVG markup string (paths, circles, lines), plus
 *   - `shapes` a structured shape array the React component reads to emit
 *              normal JSX, plus
 *   - `fills`  named fill colors so a Pixi consumer (M14) can map them to
 *              `Graphics` fill colors using the same palette this file uses.
 *
 * Two views, single source of truth. The wireframe markup stays human-
 * readable in `body` (transcribed verbatim from
 * `docs/wireframes/hifi-c-v2.html` lines 344-368). The React renderer never
 * does a raw HTML insertion: it walks `shapes` and emits `<path>`,
 * `<circle>`, `<line>` elements through normal JSX, so React's standard
 * escaping + reconciliation apply.
 *
 * The wireframe's `var(--gold)`, `var(--primary)`, `var(--rose)`,
 * `var(--sage)` CSS-var fills are replaced with hex literals so the data is
 * self-contained and Pixi consumers (which have no CSS-var scope) can read
 * fill colors directly.
 *
 * Stroke is applied by the consumer (`<svg stroke="#1F1A2A" stroke-width="2.4" />`)
 * so it does not appear in the body. The `cog` and a few inner shapes use
 * an explicit ink fill where the wireframe relies on the parent stroke
 * cascade for an inner pivot dot or eye dot.
 *
 * The 13th icon, `moonbeam`, has no wireframe reference. It is hand-designed
 * as a tilted moon-shaft for the Day 7 Moonling-Week reward (see M17/M18).
 *
 * Color tokens (kept in sync with `tailwind.config.ts` / `index.css`):
 *   primary   #3CC4DA    cyan
 *   gold      #FFC93C    sunny gold
 *   rose      #FF6F61    coral pink
 *   sage      #7DD66F    leaf green
 *   ink       #1F1A2A    near-black
 *   paper     #FFFBEF    warm white
 */

export const INK = '#1F1A2A';
export const GOLD = '#FFC93C';
export const PRIMARY = '#3CC4DA';
export const ROSE = '#FF6F61';
export const SAGE = '#7DD66F';
export const PAPER = '#FFFBEF';

/**
 * One drawable shape inside a part icon. The React renderer maps the
 * `kind` discriminator to the matching SVG element and spreads only the
 * attributes that element expects.
 *
 * Coordinates are in the 0 0 32 32 viewBox the consumer wraps the SVG with.
 */
export type PartIconShape =
  | {
      kind: 'path';
      d: string;
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      kind: 'circle';
      cx: number;
      cy: number;
      r: number;
      fill?: string;
    }
  | {
      kind: 'line';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    };

/**
 * One part icon definition.
 *
 * `body` is the SVG markup string, ready to drop inside a `<svg>` if a
 * caller wants the raw markup (Pixi can compare expected shape against the
 * wireframe). The DOM React component does not consume this; it walks
 * `shapes` instead and emits SVG elements through standard JSX.
 *
 * `fills` exposes the named fill colors used in the body so a Pixi consumer
 * can map them to `Graphics` fill colors using the same data. Roles are
 * kept short (`primary`, `iris`) and consistent with how each shape reads.
 */
export interface PartIconDef {
  body: string;
  shapes: PartIconShape[];
  fills?: Record<string, string>;
}

/**
 * Cog teeth: eight short stroke segments emanating from the center. Pre-
 * computed once so consumers do not re-do the trig and so the body string
 * and the shape array stay in lockstep.
 */
const COG_TEETH_SHAPES: PartIconShape[] = [
  0, 45, 90, 135, 180, 225, 270, 315,
].map((a) => {
  const r = (a * Math.PI) / 180;
  return {
    kind: 'line' as const,
    x1: 16 + Math.cos(r) * 8,
    y1: 16 + Math.sin(r) * 8,
    x2: 16 + Math.cos(r) * 12,
    y2: 16 + Math.sin(r) * 12,
  };
});

const COG_TEETH_BODY = COG_TEETH_SHAPES.map((s) => {
  if (s.kind !== 'line') {
    return '';
  }
  return `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" />`;
}).join('');

export const PART_ICONS: Record<string, PartIconDef> = {
  cog: {
    body:
      `<circle cx="16" cy="16" r="6" fill="${GOLD}" />` +
      COG_TEETH_BODY +
      `<circle cx="16" cy="16" r="2" fill="${INK}" />`,
    shapes: [
      { kind: 'circle', cx: 16, cy: 16, r: 6, fill: GOLD },
      ...COG_TEETH_SHAPES,
      { kind: 'circle', cx: 16, cy: 16, r: 2, fill: INK },
    ],
    fills: { primary: GOLD, pivot: INK },
  },
  spring: {
    body:
      '<path d="M8 8 Q16 4 24 8 Q8 12 24 14 Q8 16 24 18 Q8 20 24 22 Q16 26 8 22" />',
    shapes: [
      {
        kind: 'path',
        d: 'M8 8 Q16 4 24 8 Q8 12 24 14 Q8 16 24 18 Q8 20 24 22 Q16 26 8 22',
      },
    ],
    fills: {},
  },
  beaker: {
    body: `<path d="M11 6 H21 M12 6 V14 L7 24 Q7 27 10 27 H22 Q25 27 25 24 L20 14 V6" fill="${PRIMARY}" />`,
    shapes: [
      {
        kind: 'path',
        d: 'M11 6 H21 M12 6 V14 L7 24 Q7 27 10 27 H22 Q25 27 25 24 L20 14 V6',
        fill: PRIMARY,
      },
    ],
    fills: { primary: PRIMARY },
  },
  bolt: {
    body: `<path d="M17 4 L8 18 H15 L13 28 L23 13 H16 Z" fill="${GOLD}" />`,
    shapes: [
      { kind: 'path', d: 'M17 4 L8 18 H15 L13 28 L23 13 H16 Z', fill: GOLD },
    ],
    fills: { primary: GOLD },
  },
  jelly: {
    body:
      `<path d="M8 16 Q8 8 16 8 Q24 8 24 16 V22 Q24 26 20 26 Q19 24 16 26 Q13 24 12 26 Q8 26 8 22 Z" fill="${SAGE}" />` +
      `<circle cx="13" cy="14" r="1.2" fill="${INK}" />` +
      `<circle cx="19" cy="14" r="1.2" fill="${INK}" />`,
    shapes: [
      {
        kind: 'path',
        d: 'M8 16 Q8 8 16 8 Q24 8 24 16 V22 Q24 26 20 26 Q19 24 16 26 Q13 24 12 26 Q8 26 8 22 Z',
        fill: SAGE,
      },
      { kind: 'circle', cx: 13, cy: 14, r: 1.2, fill: INK },
      { kind: 'circle', cx: 19, cy: 14, r: 1.2, fill: INK },
    ],
    fills: { primary: SAGE, eye: INK },
  },
  sock: {
    body:
      `<path d="M12 4 H20 V16 L26 22 V27 H10 V22 Z" fill="${ROSE}" />` +
      `<path d="M12 8 H20" />`,
    shapes: [
      {
        kind: 'path',
        d: 'M12 4 H20 V16 L26 22 V27 H10 V22 Z',
        fill: ROSE,
      },
      { kind: 'path', d: 'M12 8 H20' },
    ],
    fills: { primary: ROSE },
  },
  bell: {
    body:
      `<path d="M9 22 Q9 10 16 8 Q23 10 23 22 Z" fill="${GOLD}" />` +
      `<path d="M7 22 H25" />` +
      `<circle cx="16" cy="25" r="1.6" fill="${INK}" />`,
    shapes: [
      {
        kind: 'path',
        d: 'M9 22 Q9 10 16 8 Q23 10 23 22 Z',
        fill: GOLD,
      },
      { kind: 'path', d: 'M7 22 H25' },
      { kind: 'circle', cx: 16, cy: 25, r: 1.6, fill: INK },
    ],
    fills: { primary: GOLD, clapper: INK },
  },
  feather: {
    body:
      `<path d="M6 26 Q14 24 20 18 Q26 12 24 6 Q14 8 10 16 Q8 22 6 26 Z" fill="${PRIMARY}" />` +
      `<path d="M6 26 L20 12" />`,
    shapes: [
      {
        kind: 'path',
        d: 'M6 26 Q14 24 20 18 Q26 12 24 6 Q14 8 10 16 Q8 22 6 26 Z',
        fill: PRIMARY,
      },
      { kind: 'path', d: 'M6 26 L20 12' },
    ],
    fills: { primary: PRIMARY },
  },
  cloud: {
    body: `<path d="M9 20 Q5 20 5 16 Q5 12 10 12 Q11 8 16 8 Q22 8 23 13 Q28 13 28 17 Q28 20 24 20 Z" fill="${PRIMARY}" />`,
    shapes: [
      {
        kind: 'path',
        d: 'M9 20 Q5 20 5 16 Q5 12 10 12 Q11 8 16 8 Q22 8 23 13 Q28 13 28 17 Q28 20 24 20 Z',
        fill: PRIMARY,
      },
    ],
    fills: { primary: PRIMARY },
  },
  magnet: {
    body:
      `<path d="M8 6 V18 Q8 24 16 24 Q24 24 24 18 V6 H20 V18 Q20 20 16 20 Q12 20 12 18 V6 Z" fill="${ROSE}" />` +
      `<path d="M8 6 H12 M20 6 H24" stroke="${PAPER}" stroke-width="2" />`,
    shapes: [
      {
        kind: 'path',
        d: 'M8 6 V18 Q8 24 16 24 Q24 24 24 18 V6 H20 V18 Q20 20 16 20 Q12 20 12 18 V6 Z',
        fill: ROSE,
      },
      {
        kind: 'path',
        d: 'M8 6 H12 M20 6 H24',
        stroke: PAPER,
        strokeWidth: 2,
      },
    ],
    fills: { primary: ROSE, tips: PAPER },
  },
  // PAPER reads as white in this icon; alias as `primary` for the sclera
  // and `iris` for the dark center to keep the Pixi mapping clean.
  eye: {
    body:
      `<path d="M3 16 Q16 6 29 16 Q16 26 3 16 Z" fill="${PAPER}" />` +
      `<circle cx="16" cy="16" r="4" fill="${INK}" />` +
      `<circle cx="14" cy="14" r="1.2" fill="${PAPER}" />`,
    shapes: [
      { kind: 'path', d: 'M3 16 Q16 6 29 16 Q16 26 3 16 Z', fill: PAPER },
      { kind: 'circle', cx: 16, cy: 16, r: 4, fill: INK },
      { kind: 'circle', cx: 14, cy: 14, r: 1.2, fill: PAPER },
    ],
    fills: { primary: PAPER, iris: INK },
  },
  scope: {
    body:
      `<path d="M5 14 L20 14 L26 18 L20 22 L5 22 Z" fill="${PRIMARY}" />` +
      `<path d="M9 14 V22 M14 14 V22" />`,
    shapes: [
      {
        kind: 'path',
        d: 'M5 14 L20 14 L26 18 L20 22 L5 22 Z',
        fill: PRIMARY,
      },
      { kind: 'path', d: 'M9 14 V22 M14 14 V22' },
    ],
    fills: { primary: PRIMARY },
  },
  /**
   * Day 7 Moonling-Week reward. Hand-designed tilted moon shaft: a slim
   * gold parallelogram angled top-right to bottom-left, a small crescent
   * tucked over the top, and two short ink sparkles to read as "beam, not
   * bar". Stays at viewBox 0 0 32 32 and inherits the same 2.4px ink
   * stroke the wireframe icons use, so visual weight matches.
   */
  moonbeam: {
    body:
      `<path d="M19 5 L24 7 L13 27 L8 25 Z" fill="${GOLD}" />` +
      `<path d="M22 4 Q26 6 25 11 Q23 8 20 9 Q21 6 22 4 Z" fill="${GOLD}" />` +
      `<path d="M6 13 L8 13 M9 11 L9 13" />` +
      `<path d="M26 17 L28 17 M27 15 L27 17" />`,
    shapes: [
      { kind: 'path', d: 'M19 5 L24 7 L13 27 L8 25 Z', fill: GOLD },
      {
        kind: 'path',
        d: 'M22 4 Q26 6 25 11 Q23 8 20 9 Q21 6 22 4 Z',
        fill: GOLD,
      },
      { kind: 'path', d: 'M6 13 L8 13 M9 11 L9 13' },
      { kind: 'path', d: 'M26 17 L28 17 M27 15 L27 17' },
    ],
    fills: { primary: GOLD },
  },
};
