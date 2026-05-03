import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { Flipbook } from '../Flipbook';
import type { CatalogueEntry, Part } from '../../../lib/types';

/**
 * Helper: build a fixture catalogue entry with a stable shape so the tests
 * stay focused on Flipbook behavior (pagination, filtering, empty state)
 * rather than mocking the whole composition pipeline.
 */
function makePart(id: string, labelDe: string): Part {
  return {
    id,
    labelDe,
    behaviorVerb: 'spin',
    contributes: { fun: 1 },
    category: 'mechanical',
  };
}

function makeEntry(
  id: string,
  overrides: Partial<CatalogueEntry> = {},
): CatalogueEntry {
  return {
    id,
    nameDe: overrides.nameDe ?? `Erfindung ${id}`,
    customerId: overrides.customerId ?? 'pip',
    parts: overrides.parts ?? [
      makePart('cog', 'Zahnrad'),
      makePart('spring', 'Sprungfeder'),
      makePart('bell', 'Glöckchen'),
      makePart('bolt', 'Blitzbolzen'),
    ],
    traitScores: overrides.traitScores ?? { fun: 2, zappy: 1, cozy: 1, boom: 0 },
    tier: overrides.tier ?? 'satisfied',
    // Fixed timestamp (1 May 2026 12:00 UTC) for deterministic date strings.
    createdAt: overrides.createdAt ?? Date.UTC(2026, 4, 1, 12, 0, 0),
  };
}

describe('Flipbook', () => {
  it('renders the empty-state when entries is empty', () => {
    render(<Flipbook entries={[]} />);

    expect(screen.getByText('Bau dein erstes Ding!')).toBeInTheDocument();
    expect(screen.getByText(/Tippe auf "Lab"/)).toBeInTheDocument();

    // Pagination chip reads 0 / 0 in the empty state, both prev/next are
    // disabled so the user cannot navigate into a non-existent spread.
    expect(screen.getByText('Seite 0 / 0')).toBeInTheDocument();
    expect(screen.getByLabelText('vorherige Seite')).toBeDisabled();
    expect(screen.getByLabelText('nächste Seite')).toBeDisabled();
  });

  it('renders a single entry on the left + a "demnächst" placeholder on the right', () => {
    render(<Flipbook entries={[makeEntry('a', { nameDe: 'Hugging Chair' })]} />);

    expect(screen.getByText('Hugging Chair')).toBeInTheDocument();
    expect(screen.getByText(/demnächst/)).toBeInTheDocument();
    expect(screen.getByText('Seite 1 / 1')).toBeInTheDocument();

    // Both prev/next disabled at the bounds of a single-spread book.
    expect(screen.getByLabelText('vorherige Seite')).toBeDisabled();
    expect(screen.getByLabelText('nächste Seite')).toBeDisabled();
  });

  it('renders two entries on the same spread', () => {
    render(
      <Flipbook
        entries={[
          makeEntry('a', { nameDe: 'Hugging Chair' }),
          makeEntry('b', { nameDe: 'Silent Dog' }),
        ]}
      />,
    );

    expect(screen.getByText('Hugging Chair')).toBeInTheDocument();
    expect(screen.getByText('Silent Dog')).toBeInTheDocument();
    expect(screen.queryByText(/demnächst/)).not.toBeInTheDocument();
    expect(screen.getByText('Seite 1 / 1')).toBeInTheDocument();
  });

  it('paginates by 2 entries via the next/prev chips with bounded clamping', async () => {
    const user = userEvent.setup();
    const entries = [
      makeEntry('a', { nameDe: 'Erstes' }),
      makeEntry('b', { nameDe: 'Zweites' }),
      makeEntry('c', { nameDe: 'Drittes' }),
      makeEntry('d', { nameDe: 'Viertes' }),
    ];

    render(<Flipbook entries={entries} />);

    // First spread: entries 0 + 1.
    expect(screen.getByText('Erstes')).toBeInTheDocument();
    expect(screen.getByText('Zweites')).toBeInTheDocument();
    expect(screen.queryByText('Drittes')).not.toBeInTheDocument();
    expect(screen.getByText('Seite 1 / 2')).toBeInTheDocument();

    // Click forward, advance to the second spread (entries 2 + 3).
    await user.click(screen.getByLabelText('nächste Seite'));
    expect(screen.getByText('Drittes')).toBeInTheDocument();
    expect(screen.getByText('Viertes')).toBeInTheDocument();
    expect(screen.queryByText('Erstes')).not.toBeInTheDocument();
    expect(screen.getByText('Seite 2 / 2')).toBeInTheDocument();
    expect(screen.getByLabelText('nächste Seite')).toBeDisabled();

    // Click back, return to the first spread.
    await user.click(screen.getByLabelText('vorherige Seite'));
    expect(screen.getByText('Erstes')).toBeInTheDocument();
    expect(screen.getByText('Seite 1 / 2')).toBeInTheDocument();
    expect(screen.getByLabelText('vorherige Seite')).toBeDisabled();
  });

  it('fires onPageChange with the new spread index when paginating', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const entries = [
      makeEntry('a'),
      makeEntry('b'),
      makeEntry('c'),
      makeEntry('d'),
    ];

    render(<Flipbook entries={entries} onPageChange={onPageChange} />);

    await user.click(screen.getByLabelText('nächste Seite'));
    expect(onPageChange).toHaveBeenCalledWith(1);

    await user.click(screen.getByLabelText('vorherige Seite'));
    expect(onPageChange).toHaveBeenCalledWith(0);

    expect(onPageChange).toHaveBeenCalledTimes(2);
  });

  it('filters out daily-bonus- entries before computing spreads', () => {
    const entries: CatalogueEntry[] = [
      makeEntry('real-1', { nameDe: 'Echte Eins' }),
      makeEntry('daily-bonus-w0-d0-0', { nameDe: 'Bonus Stern' }),
      makeEntry('daily-bonus-w0-d0-1', { nameDe: 'Bonus Stern Zwei' }),
      makeEntry('real-2', { nameDe: 'Echte Zwei' }),
    ];

    render(<Flipbook entries={entries} />);

    // Both real entries appear on the same spread.
    expect(screen.getByText('Echte Eins')).toBeInTheDocument();
    expect(screen.getByText('Echte Zwei')).toBeInTheDocument();

    // Bonus stars are not rendered as spread content.
    expect(screen.queryByText('Bonus Stern')).not.toBeInTheDocument();
    expect(screen.queryByText('Bonus Stern Zwei')).not.toBeInTheDocument();

    // Page count reflects the 2 real entries only (1 spread).
    expect(screen.getByText('Seite 1 / 1')).toBeInTheDocument();
  });

  it('renders the gold ★ delight badge on entries with tier="delight"', () => {
    render(
      <Flipbook
        entries={[
          makeEntry('a', { nameDe: 'Normales Ding', tier: 'satisfied' }),
          makeEntry('b', { nameDe: 'Selten Ding', tier: 'delight' }),
        ]}
      />,
    );

    // The ★ badge has an accessible label so we can pin its presence to
    // the right entry without relying on emoji string matching.
    const badges = screen.getAllByLabelText('seltenes Stück');
    expect(badges).toHaveLength(1);
  });
});
