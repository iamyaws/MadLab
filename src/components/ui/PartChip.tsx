import type { Part } from '../../lib/types';
import { PartIcon } from './PartIcon';

/**
 * PartChip. The rounded gold chip that represents a picked part on the
 * workshop's "X / 4 picked" row and on the catalogue entry preview. Each
 * chip shows the part's SVG glyph in a small ink-bordered paper circle,
 * plus the German label.
 *
 * If `onRemove` is provided, a small × icon-button renders on the right and
 * fires the callback when tapped. Otherwise the chip renders read-only.
 *
 * The icon comes from the shared PartIcon component (M13). The chip already
 * announces the part name as visible text, so the icon's ariaLabel is
 * passed for completeness but the surrounding wrapper is `aria-hidden` so
 * the icon does not double-announce in screen readers.
 */
export interface PartChipProps {
  part: Part;
  onRemove?: () => void;
}

export function PartChip({ part, onRemove }: PartChipProps) {
  return (
    <span className="inline-flex items-center gap-2 border-2 border-ink rounded-full bg-gold px-3 py-1.5 text-[14px] font-extrabold leading-none whitespace-nowrap">
      <span
        aria-hidden="true"
        className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-paper border-2 border-ink"
      >
        <PartIcon partId={part.id} size={14} ariaLabel={part.labelDe} />
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
