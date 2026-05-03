import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GameStateApi } from '../hooks/useGameState';
import type { RoundFlowApi } from '../hooks/useRoundFlow';
import { getCustomerById } from '../data/customers';
import { PARTS } from '../data/parts';
import { pickReactionQuote } from '../data/reactionQuotes';
import type { CatalogueEntry, Customer, Tier } from '../lib/types';
import { Fingerprint } from '../components/ui/Fingerprint';
import { PartChip } from '../components/ui/PartChip';
import { PartIcon } from '../components/ui/PartIcon';
import { Customer as CustomerSvg } from '../components/customer/Customer';

/**
 * ReactionPage (C5, route '/reaction'). Reaction tier in big Fraunces type,
 * customer hero card with a German one-liner reaction, optional "+1 Teil
 * entdeckt" gold card if a part unlock fires this round, catalogue entry
 * preview, and a "Weiter" CTA that commits everything to the persisted save.
 *
 * Behavior:
 *   - Reads the resolved invention + customer from `round.state`.
 *   - Computes the tier-driven copy, reaction one-liner (per customer +
 *     tier, with a fallback table), and any unlock that should fire.
 *   - On "Weiter":
 *       1) Build a CatalogueEntry from the invention with a stable id +
 *          German auto-name.
 *       2) `addCatalogueEntry(entry)` (idempotent).
 *       3) If an unlock fires, `unlockPart(partId)`.
 *       4) `endRound()`.
 *       5) Navigate to '/'.
 *
 * Unlock detection: the new part must (a) have an `unlock` field whose
 * `customerId` matches the current customer + whose `tier` matches the
 * resolved tier, and (b) not already be in `state.unlockedPartIds`. Only
 * Sir Knirps's first delight (magnet) and Bo's first delight (scope) can
 * fire in Phase 1. Kit isn't in the Phase-1 customer roster, so eye stays
 * locked. Pip has no unlock at all.
 */
export interface ReactionPageProps {
  game: GameStateApi;
  round: RoundFlowApi;
}

const TIER_TITLE_DE: Record<Tier, string> = {
  delight: 'Volle Freude!',
  satisfied: 'Passt!',
  sortOf: 'Hmm, geht so.',
  fail: 'Oje, nochmal!',
};

const TIER_CHIP_DE: Record<Tier, string> = {
  delight: '★ alle Spuren hoch',
  satisfied: 'gut getroffen',
  sortOf: 'naja',
  fail: 'daneben',
};

interface TierStyles {
  bg: string;
  text: string;
  border: string;
}

const TIER_CHIP_STYLES: Record<Tier, TierStyles> = {
  delight: { bg: 'bg-gold', text: 'text-ink', border: 'border-ink' },
  satisfied: { bg: 'bg-paper', text: 'text-ink', border: 'border-ink' },
  sortOf: { bg: 'bg-paper', text: 'text-ink', border: 'border-ink' },
  fail: { bg: 'bg-plum', text: 'text-paper', border: 'border-ink' },
};

/**
 * Synthesize a kid-friendly catalogue name from the customer + tier. The
 * counter is just `catalogue.length + 1` so each entry gets a stable
 * "Erfindung #N". A richer naming pass lands in Phase 2 with finished art.
 */
function synthesizeName(customer: Customer, count: number): string {
  return `Erfindung #${count} für ${customer.nameDe}`;
}

/**
 * Generate a stable id for a catalogue entry. Uses crypto.randomUUID when
 * available (every modern browser), falling back to a timestamp + random
 * suffix for old runtimes.
 */
function mintEntryId(): string {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ReactionPage({ game, round }: ReactionPageProps) {
  const navigate = useNavigate();
  const { state: gameState, addCatalogueEntry, unlockPart } = game;
  const { state: roundState, endRound } = round;

  // Defensive redirect: only the `reaction` phase should land here.
  useEffect(() => {
    if (roundState.phase !== 'reaction') {
      navigate('/', { replace: true });
    }
  }, [roundState.phase, navigate]);

  const customer = roundState.customerId
    ? getCustomerById(roundState.customerId)
    : undefined;
  const invention = roundState.invention;

  const unlockedSet = useMemo(
    () => new Set(gameState.unlockedPartIds),
    [gameState.unlockedPartIds],
  );

  // Detect a part unlock for this round. We pick the first part whose unlock
  // condition matches the current customer + tier and that is still locked.
  const unlockingPart = useMemo(() => {
    if (!customer || !invention) return undefined;
    return PARTS.find(
      (p) =>
        p.unlock &&
        p.unlock.customerId === customer.id &&
        p.unlock.tier === invention.tier &&
        !unlockedSet.has(p.id),
    );
  }, [customer, invention, unlockedSet]);

  if (!customer || !invention) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-display font-extrabold text-ink-soft">
          Keine Reaktion zu zeigen.
        </p>
      </div>
    );
  }

  const tierTitle = TIER_TITLE_DE[invention.tier];
  const tierChipText = TIER_CHIP_DE[invention.tier];
  const tierChipStyle = TIER_CHIP_STYLES[invention.tier];
  const reactionQuote = pickReactionQuote(customer.id, invention.tier);
  const entryName = synthesizeName(customer, gameState.catalogue.length + 1);

  const handleContinue = () => {
    const entry: CatalogueEntry = {
      ...invention,
      id: mintEntryId(),
      nameDe: entryName,
    };
    addCatalogueEntry(entry);
    if (unlockingPart) {
      unlockPart(unlockingPart.id);
    }
    endRound();
    navigate('/');
  };

  return (
    <div className="relative flex-1 flex flex-col pt-[60px] pb-6">
      <header className="flex items-center justify-between gap-3 px-6 pb-2">
        <div className="flex flex-col gap-0.5">
          <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
            {`${customer.nameDe}'s Reaktion`}
          </div>
          <h1 className="font-display font-black text-[26px] leading-none tracking-tight">
            {tierTitle}
          </h1>
        </div>
        <div
          className={`inline-flex items-center gap-1.5 border-2 rounded-full px-3.5 py-2 text-[14px] font-extrabold ${tierChipStyle.bg} ${tierChipStyle.text} ${tierChipStyle.border}`}
        >
          {tierChipText}
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-3 px-6 pt-2 pb-3 overflow-y-auto">
        {/* Customer hero with the reaction quote inline. */}
        <div className="flex items-center gap-3.5 bg-bg-2 border-[2.5px] border-ink rounded-2xl p-4 shadow-[0_4px_0_rgba(31,26,42,0.14)]">
          <CustomerHeroCardInline customer={customer} reactionQuote={reactionQuote} />
        </div>

        {unlockingPart ? (
          <div className="flex items-center gap-3.5 bg-gold border-[2.5px] border-ink rounded-2xl p-4 shadow-[0_4px_0_rgba(31,26,42,0.14)]">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-paper border-[2.5px] border-ink">
              <PartIcon
                partId={unlockingPart.id}
                size={36}
                ariaLabel={unlockingPart.labelDe}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
                +1 Teil entdeckt
              </div>
              <div className="font-display font-extrabold text-[18px] leading-tight">
                {unlockingPart.labelDe}
              </div>
              <div className="font-script text-[15px] text-ink-soft mt-0.5">
                {`(${customer.nameDe}s erste volle Freude)`}
              </div>
            </div>
          </div>
        ) : null}

        {/* Catalogue entry preview. */}
        <div className="bg-paper border-[2.5px] border-ink rounded-2xl p-4 shadow-[0_4px_0_rgba(31,26,42,0.14)]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
              {`Sammlung · ${entryName}`}
            </div>
            <span aria-hidden="true" className="text-[20px]">{'★'}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl border-2 border-dashed border-ink flex items-center justify-center font-script text-ink-soft text-[14px] bg-bg-2">
              Bild
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-extrabold text-[17px] tracking-tight truncate">
                {entryName}
              </div>
              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                {invention.parts.map((part, idx) => (
                  <span
                    key={`${part.id}-${idx}`}
                    className="inline-flex items-center gap-1 font-script text-[15px] text-ink-soft"
                  >
                    <PartIcon
                      partId={part.id}
                      size={20}
                      ariaLabel={part.labelDe}
                    />
                    <span>{part.labelDe}</span>
                    {idx < invention.parts.length - 1 ? (
                      <span aria-hidden="true">·</span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <Fingerprint scores={invention.traitScores} />
            <div className="flex items-center gap-1.5 flex-wrap">
              {invention.parts.map((part, idx) => (
                <PartChip key={`${part.id}-${idx}`} part={part} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full inline-flex items-center justify-center gap-2 border-[2.5px] border-ink rounded-[32px] bg-rose text-paper min-h-[64px] px-7 py-4 font-body font-black text-[19px] shadow-[0_5px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--ink)]"
        >
          Weiter
          <span aria-hidden="true">{'➜'}</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Internal hero variant: portrait + quote one-liner inline. We reuse the
 * portrait styling from CustomerHeroCard but skip the request-quote so we
 * can show the customer's *reaction* quote instead.
 */
function CustomerHeroCardInline({
  customer,
  reactionQuote,
}: {
  customer: Customer;
  reactionQuote: string;
}) {
  return (
    <>
      <div className="flex-shrink-0">
        <CustomerSvg
          kind={customer.visualKind}
          size={92}
          ariaLabel={`Portrait von ${customer.nameDe}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-primary-deep">
          {customer.nameDe}
        </div>
        <div className="font-display font-extrabold text-[18px] leading-tight tracking-tight mt-1">
          <span aria-hidden="true">"</span>
          {reactionQuote}
          <span aria-hidden="true">"</span>
        </div>
      </div>
    </>
  );
}
