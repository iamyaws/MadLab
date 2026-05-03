/**
 * Shared props for every verb component. Each verb renders the actual part
 * visual (via `PART_ICONS` data) at (x, y) plus a verb-specific animation
 * overlay or container transform. `reducedMotion` short-circuits the verb's
 * animation and renders the part static at base position.
 *
 * Lives in its own file so individual verb modules can import the type
 * without importing the dispatch table (which imports them back).
 */
export interface VerbProps {
  partId: string;
  x: number;
  y: number;
  size?: number;
  reducedMotion?: boolean;
}
