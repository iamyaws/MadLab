import type { Customer, CustomerVisualKind, Trait } from '../../lib/types';

/**
 * CustomerHeroCard. The "[customer] is da" card that anchors the workshop
 * arrival and the reaction screen. Renders a placeholder portrait (a colored
 * circle with the customer's initial), the customer's name + request quote,
 * and the wants chips with trait glyphs.
 *
 * Phase-1 portrait: a single colored circle per `visualKind`, colored from
 * the cel-shaded palette so each customer reads as a distinct face shape.
 * Phase 2 swaps in finished SVG portraits per the design spec.
 *
 * Two sizes:
 *   - 'sm' (default 64px portrait): used inline on the workshop hero card
 *     and the reaction tier card.
 *   - 'lg' (180px portrait): used on the arrival page where the customer
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

interface VisualPalette {
  bg: string;
  text: string;
}

const VISUAL_PALETTE: Record<CustomerVisualKind, VisualPalette> = {
  pip: { bg: 'bg-rose', text: 'text-paper' },
  kid: { bg: 'bg-primary', text: 'text-ink' },
  crunch: { bg: 'bg-ink', text: 'text-gold' },
  oma: { bg: 'bg-plum', text: 'text-paper' },
  twig: { bg: 'bg-sage', text: 'text-ink' },
  kit: { bg: 'bg-paper border-ink border-2', text: 'text-ink' },
  moonling: { bg: 'bg-gold', text: 'text-ink' },
  creature: { bg: 'bg-sage', text: 'text-ink' },
};

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
  const palette = VISUAL_PALETTE[customer.visualKind] ?? VISUAL_PALETTE.creature;
  const isLarge = size === 'lg';
  const portraitSize = isLarge ? 'w-[180px] h-[180px]' : 'w-16 h-16';
  const portraitFont = isLarge
    ? 'text-[80px] leading-none'
    : 'text-[28px] leading-none';
  const initial = customer.nameDe.trim().charAt(0).toUpperCase();
  const eyebrow = eyebrowDe ?? `${customer.nameDe} ist da`;

  if (isLarge) {
    return (
      <div className="flex flex-col items-center gap-5">
        <div
          className={`flex items-center justify-center rounded-full border-[2.5px] border-ink shadow-[0_4px_0_rgba(31,26,42,0.18)] font-display font-black ${portraitSize} ${palette.bg} ${palette.text}`}
          aria-label={`Portrait von ${customer.nameDe}`}
        >
          <span className={portraitFont}>{initial}</span>
        </div>
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
      <div
        className={`flex items-center justify-center rounded-full border-[2.5px] border-ink shadow-[0_4px_0_rgba(31,26,42,0.18)] font-display font-black flex-shrink-0 ${portraitSize} ${palette.bg} ${palette.text}`}
        aria-label={`Portrait von ${customer.nameDe}`}
      >
        <span className={portraitFont}>{initial}</span>
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
