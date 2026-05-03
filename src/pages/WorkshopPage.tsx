import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameStateApi } from '../hooks/useGameState';
import type { RoundFlowApi } from '../hooks/useRoundFlow';
import { CUSTOMERS, getCustomerById } from '../data/customers';
import { PARTS } from '../data/parts';
import { compose, sumTraits } from '../lib/composition';
import { CustomerHeroCard } from '../components/ui/CustomerHeroCard';
import { Fingerprint } from '../components/ui/Fingerprint';
import { PixiRoot } from '../pixi/PixiRoot';
import { OrbitStage } from '../pixi/OrbitStage';

/**
 * WorkshopPage (C1, route '/'). The main loop screen: customer hero card on
 * top, Pixi orbit in the middle, "X / 4 picked" + live trait fingerprint
 * preview, and the action row (shuffle ghost button + "Feuer frei!" primary).
 *
 * Behavior:
 *   - On mount, if the round is `idle` (no customer queued), call
 *     `startArrival(nextCustomerId)` and navigate to '/arrival'. Customer
 *     selection is round-robin across the 3 Phase-1 customers, indexed by
 *     `state.catalogue.length` so each completed round queues the next one.
 *   - The orbit shows all 12 parts. The 9 starter parts are pickable; the 3
 *     unlock-pool parts render locked (greyed) until their unlock fires.
 *   - Tapping "Feuer frei!" requires 4 picks. When pressed, `compose()`
 *     resolves the invention, `startTest()` records it, then the route
 *     navigates to '/test'.
 *
 * State: this page reads phase from `round` and never dispatches transitions
 * outside the on-mount auto-arrival and the fire button. All other state
 * lives in App's hooks.
 */
export interface WorkshopPageProps {
  game: GameStateApi;
  round: RoundFlowApi;
}

export function WorkshopPage({ game, round }: WorkshopPageProps) {
  const navigate = useNavigate();
  const { state: gameState } = game;
  const { state: roundState, startArrival, togglePart, startTest } = round;

  // Auto-queue the next customer when the workshop opens with an empty round.
  // Round-robin by catalogue length so the rotation advances with each
  // completed round, and falls back to index 0 when wrapping.
  useEffect(() => {
    if (roundState.phase !== 'idle') return;
    const nextIndex = gameState.catalogue.length % CUSTOMERS.length;
    const nextCustomer = CUSTOMERS[nextIndex];
    startArrival(nextCustomer.id);
    navigate('/arrival', { replace: true });
  }, [roundState.phase, gameState.catalogue.length, startArrival, navigate]);

  const currentCustomer = roundState.customerId
    ? getCustomerById(roundState.customerId)
    : undefined;

  const unlockedSet = useMemo(
    () => new Set(gameState.unlockedPartIds),
    [gameState.unlockedPartIds],
  );
  const lockedPartIds = useMemo(
    () => PARTS.filter((p) => !unlockedSet.has(p.id)).map((p) => p.id),
    [unlockedSet],
  );

  const pickedParts = useMemo(
    () => roundState.pickedPartIds
      .map((id) => PARTS.find((p) => p.id === id))
      .filter((p): p is (typeof PARTS)[number] => Boolean(p)),
    [roundState.pickedPartIds],
  );
  const previewScores = useMemo(
    () => sumTraits(pickedParts),
    [pickedParts],
  );

  const canFire = roundState.pickedPartIds.length === 4;

  const handleFire = () => {
    if (!canFire || !currentCustomer) return;
    const invention = compose(pickedParts, currentCustomer);
    startTest(invention);
    navigate('/test');
  };

  const handleShuffle = () => {
    // Shuffle = clear picks. Toggling each picked id off via togglePart keeps
    // the reducer the single source of truth. Phase 2 may auto-pick a random
    // 4 instead; for now Phase 1 just clears.
    for (const id of roundState.pickedPartIds) {
      togglePart(id);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col pt-[60px] pb-6 min-h-0">
      {/* Top nav: eyebrow + title + star count chip. */}
      <header className="flex items-center justify-between gap-3 px-6 pb-2">
        <div className="flex flex-col gap-0.5">
          <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
            Werkstatt
          </div>
          <h1 className="font-display font-black text-[26px] leading-none tracking-tight">
            Das Labor
          </h1>
        </div>
        <div className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3.5 py-2 text-[14px] font-extrabold">
          <span aria-hidden="true">{'★'}</span>
          {gameState.catalogue.length}
        </div>
      </header>

      {/* Inner content area. `pb-[100px]` clears the absolutely positioned
          tab bar at the bottom of the phone shell (72px tall + 18px bottom
          inset = 90px floor) so the "Feuer frei!" action row sits with at
          least 10px of breathing room above it. The orbit (`min-h-[200px]`)
          shrinks to fit the remaining vertical space. */}
      <div className="flex-1 flex flex-col gap-3.5 px-6 pt-2 pb-[100px] overflow-hidden min-h-0">
        {currentCustomer ? (
          <CustomerHeroCard
            customer={currentCustomer}
            eyebrowDe={`${currentCustomer.nameDe} ist da`}
          />
        ) : null}

        <div className="flex-1 flex items-center justify-center min-h-[200px]">
          <PixiRoot width={320} height={260}>
            <OrbitStage
              parts={PARTS}
              selectedPartIds={roundState.pickedPartIds}
              lockedPartIds={lockedPartIds}
              onPick={togglePart}
              width={320}
              height={260}
            />
          </PixiRoot>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3.5 py-2 text-[14px] font-extrabold">
            {roundState.pickedPartIds.length} / 4 gewählt
          </span>
          <Fingerprint scores={previewScores} predict />
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleShuffle}
              className="flex-1 inline-flex items-center justify-center gap-2 border-[2.5px] border-ink rounded-full bg-paper min-h-[56px] px-5 py-3 font-body font-black text-[17px] shadow-[0_5px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--ink)]"
            >
              {'↺ Misch durch'}
            </button>
            <button
              type="button"
              onClick={handleFire}
              disabled={!canFire}
              className={[
                'flex-[2] inline-flex items-center justify-center gap-2 border-[2.5px] border-ink rounded-[32px] min-h-[64px] px-7 py-4 font-body font-black text-[19px] shadow-[0_5px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--ink)]',
                canFire ? 'bg-rose text-paper' : 'bg-paper text-ink-soft opacity-60 cursor-not-allowed',
              ].join(' ')}
            >
              Feuer frei!
              <span aria-hidden="true">{'▶'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Phase-1 placeholder tab bar. Static; non-functional. M10 / Phase 2 wire it. */}
      <nav
        aria-label="Tab-Leiste (Vorschau)"
        className="absolute left-[18px] right-[18px] bottom-[18px] h-[72px] bg-paper border-[2.5px] border-ink rounded-[30px] flex items-center justify-around shadow-[0_8px_0_rgba(31,26,42,0.10)] px-2"
      >
        <div className="w-[54px] h-[54px] rounded-2xl bg-gold flex items-center justify-center font-black text-[20px] text-ink shadow-[inset_0_-4px_0_rgba(0,0,0,0.18)]">
          Lab
        </div>
        <div className="w-[54px] h-[54px] rounded-2xl flex items-center justify-center font-black text-[16px] text-ink-soft">
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
