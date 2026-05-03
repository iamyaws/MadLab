import { useNavigate } from 'react-router-dom';
import type { GameStateApi } from '../hooks/useGameState';
import { getCustomerById } from '../data/customers';
import { Fingerprint } from '../components/ui/Fingerprint';

/**
 * CataloguePage (C6, route '/catalogue'). Phase-1 stub: a simple grid of
 * catalogue entries with name, customer, parts list, and trait fingerprint.
 *
 * Filter chips render but only "Alle" works in Phase 1. The flipbook
 * experience (two-page spread, painted invention left + test result right,
 * pagination) is a Phase 2 deliverable.
 *
 * Empty state: "Bau dein erstes Ding." matches the spec's Phase-1 copy.
 */
export interface CataloguePageProps {
  game: GameStateApi;
}

export function CataloguePage({ game }: CataloguePageProps) {
  const navigate = useNavigate();
  const { state } = game;

  return (
    <div className="relative flex-1 flex flex-col pt-[60px] pb-6">
      <header className="flex items-center justify-between gap-3 px-6 pb-2">
        <div className="flex flex-col gap-0.5">
          <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
            Deine Sammlung
          </div>
          <h1 className="font-display font-black text-[26px] leading-none tracking-tight">
            Buch
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3.5 py-2 text-[14px] font-extrabold"
        >
          {`zurück`}
        </button>
      </header>

      <div className="flex-1 flex flex-col gap-3 px-6 pt-2 pb-3 overflow-y-auto">
        {/* Filter chips. Only "Alle" is wired in Phase 1. */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-gold px-3.5 py-1.5 text-[14px] font-extrabold">
            Alle
          </span>
          <span className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3.5 py-1.5 text-[14px] font-extrabold opacity-50">
            Selten ★
          </span>
          <span className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3.5 py-1.5 text-[14px] font-extrabold opacity-50">
            Nach Kunde
          </span>
        </div>

        {state.catalogue.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
            <div className="font-display font-black text-[24px] tracking-tight">
              Noch leer.
            </div>
            <p className="font-script text-[20px] text-ink-soft">
              Bau dein erstes Ding.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {state.catalogue.map((entry) => {
              const customer = getCustomerById(entry.customerId);
              const partsScript = entry.parts
                .map((p) => p.labelDe.toLowerCase())
                .join(' · ');
              return (
                <article
                  key={entry.id}
                  className="bg-paper border-[2.5px] border-ink rounded-2xl p-3 shadow-[0_4px_0_rgba(31,26,42,0.14)] flex flex-col gap-2"
                >
                  <div className="aspect-square w-full rounded-xl border-2 border-dashed border-ink bg-bg-2 flex items-center justify-center font-script text-ink-soft text-[16px]">
                    {entry.tier === 'delight' ? 'volle Freude' : 'Bild'}
                  </div>
                  <div className="font-display font-extrabold text-[14px] tracking-tight leading-tight">
                    {entry.nameDe}
                  </div>
                  {customer ? (
                    <div className="font-script text-[14px] text-ink-soft">
                      für {customer.nameDe}
                    </div>
                  ) : null}
                  <div className="font-script text-[12px] text-ink-soft truncate">
                    {partsScript}
                  </div>
                  <Fingerprint scores={entry.traitScores} />
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Static placeholder tab bar matching WorkshopPage. */}
      <nav
        aria-label="Tab-Leiste (Vorschau)"
        className="absolute left-[18px] right-[18px] bottom-[18px] h-[72px] bg-paper border-[2.5px] border-ink rounded-[30px] flex items-center justify-around shadow-[0_8px_0_rgba(31,26,42,0.10)] px-2"
      >
        <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center font-black text-[16px] text-ink-soft">
          Lab
        </div>
        <div className="w-[54px] h-[54px] rounded-2xl bg-gold flex items-center justify-center font-black text-[18px] text-ink shadow-[inset_0_-4px_0_rgba(0,0,0,0.18)]">
          Buch
        </div>
        <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center font-black text-[16px] text-ink-soft">
          Laden
        </div>
        <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center font-black text-[20px] text-ink-soft">
          {'★'}
        </div>
      </nav>
    </div>
  );
}
