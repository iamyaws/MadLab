import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameStateApi } from '../hooks/useGameState';
import { Flipbook } from '../components/catalogue/Flipbook';
import { TabBar } from '../components/ui/TabBar';

/**
 * CataloguePage (C6, route '/catalogue'). Phase-2 (M18) replaces the stub
 * grid with the `<Flipbook />` two-page-spread reader.
 *
 * Filter chips:
 *   - "Alle" (active by default) shows every real catalogue entry.
 *   - "Selten ★" filters to `tier === 'delight'` rounds.
 *   - "Nach Kunde" remains a Phase-2 stub; the customer-grouped dropdown
 *     lands in Phase 3 once the player has multiple Inventionen per Kunde.
 *
 * Synthetic bonus-star entries from the Daily-Special claim flow (M17,
 * `id` prefix `daily-bonus-`) are filtered out at this layer so the
 * Flipbook spreads only show real workshop rounds. The total catalogue
 * counter at the top still includes the synthetic entries since they
 * count toward the visible "★ N" tally on the player's profile (the
 * counter naturally reflects `state.catalogue.length` per the brief).
 *
 * Empty state: when the filtered list is empty the Flipbook renders its
 * own empty-state ("Bau dein erstes Ding!"). The Selten filter sharing
 * the same surface keeps the page consistent across modes.
 */
export interface CataloguePageProps {
  game: GameStateApi;
}

type FilterKey = 'alle' | 'selten' | 'kunde';

export function CataloguePage({ game }: CataloguePageProps) {
  const navigate = useNavigate();
  const { state } = game;
  const [filter, setFilter] = useState<FilterKey>('alle');

  /**
   * The entry list passed to the Flipbook. Bonus-star synthetic entries
   * (id prefix `daily-bonus-`) are stripped first; the active filter then
   * narrows further. The "Nach Kunde" stub does not yet narrow the list
   * since the dropdown is deferred to Phase 3; until that ships, tapping
   * the chip is a no-op visual cue only.
   */
  const filteredEntries = useMemo(() => {
    const real = state.catalogue.filter(
      (entry) => !entry.id.startsWith('daily-bonus-'),
    );
    if (filter === 'selten') {
      return real.filter((entry) => entry.tier === 'delight');
    }
    return real;
  }, [state.catalogue, filter]);

  /**
   * Total counter at the top: includes every catalogue entry (real plus
   * synthetic bonus-star) so the chip mirrors the player's collected-star
   * progress, not just the workshop-round subset.
   */
  const totalCount = state.catalogue.length;

  return (
    <div className="relative flex-1 flex flex-col pt-[60px] pb-6 min-h-0">
      <header className="flex items-center justify-between gap-3 px-6 pb-2">
        <div className="flex flex-col gap-0.5">
          <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
            Deine Sammlung
          </div>
          <h1 className="font-display font-black text-[26px] leading-none tracking-tight">
            Buch
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3 py-1.5 text-[13px] font-extrabold"
            aria-label={`${totalCount} gesammelte Sterne`}
          >
            <span aria-hidden="true">★</span>
            {totalCount}
          </span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3.5 py-2 text-[14px] font-extrabold"
          >
            zurück
          </button>
        </div>
      </header>

      {/* Inner column. `pb-[100px]` clears the absolutely positioned tab bar
          at the bottom of the phone shell so the Flipbook never slides
          underneath it. */}
      <div className="flex-1 flex flex-col gap-3 px-6 pt-2 pb-[100px] overflow-y-auto min-h-0">
        {/* Filter chips. Alle + Selten work; Nach Kunde is a Phase-2 stub. */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter('alle')}
            aria-pressed={filter === 'alle'}
            className={`inline-flex items-center gap-1.5 border-2 border-ink rounded-full px-3.5 py-1.5 text-[14px] font-extrabold ${
              filter === 'alle' ? 'bg-gold' : 'bg-paper'
            }`}
          >
            Alle
          </button>
          <button
            type="button"
            onClick={() => setFilter('selten')}
            aria-pressed={filter === 'selten'}
            className={`inline-flex items-center gap-1.5 border-2 border-ink rounded-full px-3.5 py-1.5 text-[14px] font-extrabold ${
              filter === 'selten' ? 'bg-gold' : 'bg-paper'
            }`}
          >
            Selten ★
          </button>
          <span
            aria-disabled="true"
            className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3.5 py-1.5 text-[14px] font-extrabold opacity-50"
            title="demnächst verfügbar"
          >
            Nach Kunde
            <span className="font-script text-[12px] font-normal opacity-80">
              demnächst
            </span>
          </span>
        </div>

        <Flipbook entries={filteredEntries} />
      </div>

      <TabBar active="buch" />
    </div>
  );
}
