import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import type { RoundFlowApi } from '../hooks/useRoundFlow';
import { getCustomerById } from '../data/customers';
import { CustomerHeroCard } from '../components/ui/CustomerHeroCard';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * ArrivalPage (C2, route '/arrival'). The "customer just dropped through the
 * tube" screen. Big customer portrait centered, request quote in a speech
 * bubble below it, wants chips, then a single primary CTA "OK, los geht's!".
 *
 * Behavior:
 *   - The page expects the round to be in the `arrival` phase. If it is not
 *     (e.g. user navigated to /arrival directly), redirect home.
 *   - The customer portrait slides in from above via `motion`. Reduced-motion
 *     skips the slide-in: the portrait starts in its rest position with full
 *     opacity. No CSS keyframes ever loop here; the motion is one-shot.
 *   - Tapping the primary CTA: dispatches `startBuild()` and navigates to '/'
 *     so the player picks parts on the workshop.
 */
export interface ArrivalPageProps {
  round: RoundFlowApi;
}

export function ArrivalPage({ round }: ArrivalPageProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { state, startBuild } = round;

  // Defensive redirect: if the round isn't arrival (user landed here cold,
  // or the round transitioned away under us), bounce home.
  useEffect(() => {
    if (state.phase !== 'arrival' && state.phase !== 'idle') {
      navigate('/', { replace: true });
    }
  }, [state.phase, navigate]);

  const customer = state.customerId ? getCustomerById(state.customerId) : undefined;

  const handleContinue = () => {
    if (!customer) {
      navigate('/');
      return;
    }
    startBuild();
    navigate('/');
  };

  // Slide-in tube-drop transition. Reduced-motion skips by starting at rest.
  const initial = reducedMotion ? { y: 0, opacity: 1 } : { y: -120, opacity: 0 };
  const animate = { y: 0, opacity: 1 };
  const transition = reducedMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 220, damping: 18, mass: 0.6 };

  return (
    <div className="relative flex-1 flex flex-col pt-[60px] pb-6">
      <header className="flex items-center justify-between gap-3 px-6 pb-2">
        <div className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-ink text-gold px-3.5 py-2 text-[14px] font-extrabold">
          <span aria-hidden="true">{'★'}</span>
          {customer ? `Neu - ${customer.nameDe}` : 'Neu'}
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Zurück"
          className="w-11 h-11 rounded-full bg-paper border-[2.5px] border-ink flex items-center justify-center shadow-[0_4px_0_rgba(31,26,42,0.14)] font-black"
        >
          {'×'}
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 overflow-hidden">
        {customer ? (
          <motion.div
            initial={initial}
            animate={animate}
            transition={transition}
            className="flex flex-col items-center gap-5"
          >
            <CustomerHeroCard customer={customer} size="lg" />
          </motion.div>
        ) : (
          <p className="font-display font-extrabold text-ink-soft">
            Niemand da. Geh zurück.
          </p>
        )}
      </div>

      <div className="px-6 pb-2">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!customer}
          className="w-full inline-flex items-center justify-center gap-2 border-[2.5px] border-ink rounded-[32px] bg-rose text-paper min-h-[64px] px-7 py-4 font-body font-black text-[19px] shadow-[0_5px_0_var(--ink)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--ink)] disabled:opacity-60"
        >
          OK, los geht's!
          <span aria-hidden="true">{'➜'}</span>
        </button>
      </div>
    </div>
  );
}
