import type { Part } from '../../lib/types';

/**
 * PartChip. The rounded gold chip that represents a picked part on the
 * workshop's "X / 4 picked" row and on the catalogue entry preview. Each
 * chip shows a small placeholder icon (the first letter of the part id in
 * a colored circle) plus the German label.
 *
 * If `onRemove` is provided, a small × icon-button renders on the right and
 * fires the callback when tapped. Otherwise the chip renders read-only.
 *
 * Phase-1 placeholder icon: a 22px circle with the part's first letter,
 * matching the wireframe's `Ic` glyphs in scale. Phase 2 swaps in the
 * proper SVG icons from the design spec's part roster.
 */
export interface PartChipProps {
  part: Part;
  onRemove?: () => void;
}

export function PartChip({ part, onRemove }: PartChipProps) {
  const initial = part.id.charAt(0).toUpperCase();

  return (
    <span className="inline-flex items-center gap-2 border-2 border-ink rounded-full bg-gold px-3 py-1.5 text-[14px] font-extrabold leading-none whitespace-nowrap">
      <span
        aria-hidden="true"
        className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-paper border-2 border-ink text-[11px] font-black"
      >
        {initial}
      </span>
      <span>{part.labelDe}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`${part.labelDe} entfernen`}
          className="flex items-center justify-center w-5 h-5 rounded-full bg-paper border-2 border-ink text-[11px] font-black hover:bg-bg-2 active:translate-y-px"
        >
          {'×'}
        </button>
      ) : null}
    </span>
  );
}
