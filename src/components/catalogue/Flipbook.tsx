import { useEffect, useState, type JSX } from 'react';
import type { CatalogueEntry } from '../../lib/types';
import { getCustomerById } from '../../data/customers';
import { Customer } from '../customer/Customer';
import { Fingerprint } from '../ui/Fingerprint';
import { PartIcon } from '../ui/PartIcon';

/**
 * Flipbook (M18). The two-page-spread reader for the catalogue. Renders one
 * `CatalogueEntry` on the left page and one on the right; tap pagination
 * advances by two entries at a time so the spread always shows a fresh pair.
 *
 * Filtering: synthetic bonus-star entries from the Daily-Special claim flow
 * (`id` prefixed with `daily-bonus-`, see `src/pages/DailyPage.tsx` M17) are
 * skipped at the page level. CataloguePage already filters them at the
 * caller, so the prop list is already clean in practice; the internal guard
 * is a belt-and-braces against stale callers.
 *
 * Pagination geometry:
 *   - `pageIndex` is a spread index (0..totalSpreads-1).
 *   - `totalSpreads = max(1, ceil(entries.length / 2))`.
 *   - The visible spread shows entries `[pageIndex*2]` and `[pageIndex*2+1]`.
 *   - When `entries.length` is odd, the last spread shows entry N on the
 *     left and an empty "demnächst" page on the right.
 *   - When `entries` is empty, both pages collapse into a single empty-state
 *     panel that fills the spread.
 *
 * Visual aesthetic (matching wireframe `docs/wireframes/hifi-c-v2.html` C6):
 *   - Each page has a 2.5px ink stroke, paper background, rounded outer
 *     corners only (left page rounds left, right page rounds right).
 *   - A subtle 3D `rotateY` per page (-5deg / +5deg) gives the spread its
 *     book-like depth without animation. The transform is static so it
 *     does not trigger `prefers-reduced-motion` concerns.
 *   - The right page carries a soft gold gradient toward its outer edge so
 *     the spread reads as "one open book" instead of two equal cards.
 *
 * Accessibility:
 *   - Each pagination button has an explicit German `aria-label` so a
 *     screen reader announces "vorherige Seite" / "naechste Seite".
 *   - The page chip ("Seite X / Y") doubles as a live status; we mark it
 *     `aria-live="polite"` so paginating updates assistive tech without
 *     stealing focus.
 *   - Disabled prev/next buttons render with `disabled` so they are
 *     skipped in tab order at the spread bounds.
 */
export interface FlipbookProps {
  /**
   * The catalogue entries to paginate through. Bonus-star synthetic entries
   * (`id.startsWith('daily-bonus-')`) are filtered out by the component;
   * the recommended path is for callers to filter at the source so the
   * `Seite X / Y` count reflects the real-entry total only.
   */
  entries: CatalogueEntry[];
  /**
   * Optional starting spread index. Default 0. Out-of-range values clamp
   * into [0, totalSpreads-1] so a stale persisted index never crashes.
   */
  initialPage?: number;
  /**
   * Optional callback fired after the active spread index changes. Receives
   * the new spread index. CataloguePage may use this to persist the user's
   * last position or to play a page-flip sound (M19).
   */
  onPageChange?: (page: number) => void;
}

/**
 * Format a numeric `createdAt` (epoch ms) into the spread's footer date.
 *
 * The spread shows `DD.MM.` per the brief; we use locale-agnostic two-digit
 * day + month so the output is identical across browsers regardless of the
 * user's `Intl` locale. (A `toLocaleDateString('de-DE')` call would suffice
 * but adds locale-specific separators; the static `DD.MM.` form keeps
 * snapshots stable across CI runners.)
 */
function formatShortDate(epochMs: number): string {
  const d = new Date(epochMs);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.`;
}

/**
 * The 2x2 PartIcon thumbnail. Shows up to four parts in a 2x2 grid; missing
 * slots render a faint placeholder tile so the thumbnail always reads as a
 * 2x2 grid even on three-part or fewer entries (in practice every catalogue
 * entry from a workshop round has exactly four parts, but the guard keeps
 * the layout stable for hand-crafted fixtures and future minimum-build
 * variants).
 */
function PartGridThumbnail({
  parts,
}: {
  parts: CatalogueEntry['parts'];
}): JSX.Element {
  const slots: Array<CatalogueEntry['parts'][number] | null> = [
    parts[0] ?? null,
    parts[1] ?? null,
    parts[2] ?? null,
    parts[3] ?? null,
  ];

  return (
    <div
      className="grid grid-cols-2 grid-rows-2 gap-2 p-3 rounded-xl border-2 border-dashed border-ink bg-bg-2 aspect-square w-full"
      aria-label="Teile-Vorschau"
    >
      {slots.map((part, i) => (
        <div
          key={i}
          className="flex items-center justify-center bg-paper rounded-lg border border-ink/30"
        >
          {part ? (
            <PartIcon partId={part.id} size={36} ariaLabel={part.labelDe} />
          ) : (
            <span aria-hidden="true" className="block w-2 h-2 rounded-full bg-ink/15" />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * One side of the spread. `entry === undefined` renders the "demnaechst"
 * placeholder used on the trailing odd-numbered page; the empty-state for
 * a fully empty catalogue is handled separately by the parent so it can
 * span the full spread width.
 */
function FlipbookPage({
  entry,
  side,
}: {
  entry: CatalogueEntry | undefined;
  side: 'left' | 'right';
}): JSX.Element {
  const baseClasses =
    'relative flex flex-col gap-2 bg-paper border-[2.5px] border-ink p-3.5 shadow-[0_4px_0_rgba(31,26,42,0.14)]';
  const sideClasses =
    side === 'left'
      ? 'rounded-l-2xl rounded-r-md [transform:rotateY(-5deg)] [transform-origin:right_center]'
      : 'rounded-r-2xl rounded-l-md [transform:rotateY(5deg)] [transform-origin:left_center] bg-gradient-to-br from-paper to-bg-2';

  if (!entry) {
    return (
      <article
        className={`${baseClasses} ${sideClasses} items-center justify-center opacity-70`}
        aria-label="leere Seite"
      >
        <div className="font-script text-[20px] text-ink-soft text-center">
          demnächst...
        </div>
        <p className="font-body text-[12px] text-ink-soft text-center px-3">
          Bau noch ein Ding, dann kommt es hierher.
        </p>
      </article>
    );
  }

  const customer = getCustomerById(entry.customerId);
  const isDelight = entry.tier === 'delight';

  return (
    <article className={`${baseClasses} ${sideClasses}`} aria-label={entry.nameDe}>
      {isDelight ? (
        <span
          className="absolute top-2 right-2 inline-flex items-center justify-center w-7 h-7 rounded-full bg-gold border-2 border-ink text-[14px] font-extrabold text-ink shadow-[0_2px_0_rgba(31,26,42,0.2)]"
          aria-label="seltenes Stück"
          title="seltenes Stück"
        >
          ★
        </span>
      ) : null}
      <PartGridThumbnail parts={entry.parts} />
      <div className="font-display font-extrabold text-[15px] tracking-tight leading-tight">
        {entry.nameDe}
      </div>
      {customer ? (
        <div className="flex items-center gap-2">
          <Customer kind={customer.visualKind} size={28} />
          <div className="font-script text-[14px] text-ink-soft leading-tight">
            für {customer.nameDe} · {formatShortDate(entry.createdAt)}
          </div>
        </div>
      ) : (
        <div className="font-script text-[14px] text-ink-soft leading-tight">
          {formatShortDate(entry.createdAt)}
        </div>
      )}
      <Fingerprint scores={entry.traitScores} />
      {entry.parts.length > 0 ? (
        <div className="flex items-center gap-1.5 flex-wrap">
          {entry.parts.map((part, idx) => (
            <PartIcon
              key={`${part.id}-${idx}`}
              partId={part.id}
              size={22}
              ariaLabel={part.labelDe}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

/**
 * The empty-state shown when no catalogue entries exist. Spans the full
 * spread (no internal split) so the prompt has room to breathe.
 */
function EmptyBook(): JSX.Element {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center gap-3 bg-paper border-[2.5px] border-ink rounded-2xl py-12 px-6 text-center shadow-[0_4px_0_rgba(31,26,42,0.14)]"
      aria-live="polite"
    >
      <div className="font-display font-black text-[26px] tracking-tight">
        Bau dein erstes Ding!
      </div>
      <p className="font-script text-[18px] text-ink-soft leading-snug">
        Tippe auf "Lab" zum Anfangen.
      </p>
    </div>
  );
}

export function Flipbook({
  entries,
  initialPage = 0,
  onPageChange,
}: FlipbookProps): JSX.Element {
  /**
   * Filter synthetic bonus-star entries. CataloguePage already filters
   * before passing in, so this is a defensive de-dup that also keeps the
   * component self-contained for direct test use.
   */
  const visibleEntries = entries.filter(
    (entry) => !entry.id.startsWith('daily-bonus-'),
  );

  const totalSpreads = Math.max(1, Math.ceil(visibleEntries.length / 2));

  /**
   * Clamp the requested initial page into a sensible range so a stale
   * persisted index does not blank the spread.
   */
  const clampedInitial = Math.max(
    0,
    Math.min(initialPage, totalSpreads - 1),
  );
  const [pageIndex, setPageIndex] = useState<number>(clampedInitial);

  /**
   * If the entries list shrinks (e.g. a hard reset clears the catalogue) and
   * the active page index now points past the end, clamp back into range.
   * The effect runs on each render that changes `totalSpreads` so the spread
   * never shows the wrong half.
   */
  useEffect(() => {
    if (pageIndex > totalSpreads - 1) {
      const next = Math.max(0, totalSpreads - 1);
      setPageIndex(next);
      onPageChange?.(next);
    }
  }, [pageIndex, totalSpreads, onPageChange]);

  const goToPage = (next: number): void => {
    const clamped = Math.max(0, Math.min(next, totalSpreads - 1));
    if (clamped === pageIndex) return;
    setPageIndex(clamped);
    onPageChange?.(clamped);
  };

  const onPrev = (): void => goToPage(pageIndex - 1);
  const onNext = (): void => goToPage(pageIndex + 1);

  const left = visibleEntries[pageIndex * 2];
  const right = visibleEntries[pageIndex * 2 + 1];

  const isEmpty = visibleEntries.length === 0;
  const atFirst = pageIndex === 0;
  const atLast = pageIndex >= totalSpreads - 1;

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      <div
        className="flex-1 min-h-0 [perspective:1400px]"
        role="region"
        aria-label="Buchseiten"
      >
        {isEmpty ? (
          <EmptyBook />
        ) : (
          <div className="grid grid-cols-2 gap-1 h-full min-h-0">
            <FlipbookPage entry={left} side="left" />
            <FlipbookPage entry={right} side="right" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={atFirst || isEmpty}
          aria-label="vorherige Seite"
          className="w-11 h-11 rounded-full border-[2.5px] border-ink bg-paper font-black text-[18px] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_3px_0_rgba(31,26,42,0.15)]"
        >
          ◀
        </button>
        <span
          aria-live="polite"
          className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-gold px-3.5 py-1.5 text-[14px] font-extrabold"
        >
          Seite {isEmpty ? 0 : pageIndex + 1} / {isEmpty ? 0 : totalSpreads}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={atLast || isEmpty}
          aria-label="nächste Seite"
          className="w-11 h-11 rounded-full border-[2.5px] border-ink bg-paper font-black text-[18px] disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_3px_0_rgba(31,26,42,0.15)]"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
