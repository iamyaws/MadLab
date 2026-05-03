import type { Customer, Trait } from '../../lib/types';
import { Customer as CustomerSvg } from '../customer/Customer';

/**
 * CustomerHeroCard. The "[customer] is da" card that anchors the workshop
 * arrival and the reaction screen. Renders the customer SVG portrait, the
 * customer's name + request quote, and the wants chips with trait glyphs.
 *
 * Two sizes:
 *   - 'sm' (default 64px portrait): used inline on the workshop hero card
 *     and the reaction tier card.
 *   - 'lg' (140px portrait): used on the arrival page where the customer
 *     drops in via the pneumatic tube and dominates the screen.
 */
export interface CustomerHeroCardProps {
  customer: Customer;
  size?: 'sm' | 'lg';
  eyebrowDe?: string;
  /**
   * When true, hide the request quote and wants chips and only render the
   * portrait + name. Used on the reaction page where the tier text replaces
   * the request quote.
   */
  portraitOnly?: boolean;
}

const TRAIT_GLYPH: Record<Trait, string> = {
  fun: '😊',
  zappy: '⚡',
  cozy: '🧶',
  boom: '💥',
};

const TRAIT_LABEL_DE: Record<Trait, string> = {
  fun: 'Spaß',
  zappy: 'Zapp',
  cozy: 'Kuschel',
  boom: 'Bumm',
};

export function CustomerHeroCard({
  customer,
  size = 'sm',
  eyebrowDe,
  portraitOnly = false,
}: CustomerHeroCardProps) {
  const isLarge = size === 'lg';
  const portraitPx = isLarge ? 140 : 64;
  const eyebrow = eyebrowDe ?? `${customer.nameDe} ist da`;

  if (isLarge) {
    return (
      <div className="flex flex-col items-center gap-5">
        <CustomerSvg
          kind={customer.visualKind}
          size={portraitPx}
          ariaLabel={`Portrait von ${customer.nameDe}`}
        />
        {!portraitOnly ? (
          <>
            <div
              className="relative bg-paper border-[2.5px] border-ink rounded-3xl px-5 py-3.5 max-w-[280px] font-display font-extrabold text-[19px] leading-tight text-center"
              role="note"
            >
              <span aria-hidden="true">"</span>
              {customer.requestDe}
              <span aria-hidden="true">"</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
                möchte
              </span>
              {customer.wants.map((trait) => (
                <span
                  key={trait}
                  className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-gold px-3.5 py-1.5 text-[14px] font-extrabold"
                >
                  <span aria-hidden="true">{TRAIT_GLYPH[trait]}</span>
                  {TRAIT_LABEL_DE[trait]}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3.5 bg-bg-2 border-[2.5px] border-ink rounded-2xl p-4 shadow-[0_4px_0_rgba(31,26,42,0.14)]">
      <div className="flex-shrink-0">
        <CustomerSvg
          kind={customer.visualKind}
          size={portraitPx}
          ariaLabel={`Portrait von ${customer.nameDe}`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-primary-deep">
          {eyebrow}
        </div>
        {!portraitOnly ? (
          <>
            <div className="font-display font-extrabold text-[20px] leading-tight tracking-tight mt-1">
              <span aria-hidden="true">"</span>
              {customer.requestDe}
              <span aria-hidden="true">"</span>
            </div>
            {customer.wants.length > 0 ? (
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span className="font-body font-extrabold text-[10px] uppercase tracking-widest text-ink-soft">
                  möchte
                </span>
                {customer.wants.map((trait) => (
                  <span
                    key={trait}
                    className="inline-flex items-center gap-1 border-2 border-ink rounded-full bg-paper px-2.5 py-1 text-[12px] font-extrabold"
                  >
                    <span aria-hidden="true">{TRAIT_GLYPH[trait]}</span>
                    {TRAIT_LABEL_DE[trait]}
                  </span>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
