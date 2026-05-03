import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RoundFlowApi } from '../hooks/useRoundFlow';
import { getCustomerById } from '../data/customers';
import type { Trait, TraitScores } from '../lib/types';
import { SensorGrid } from '../components/ui/SensorGrid';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * TestPage (C4, route '/test'). The 3-second test reveal: glass-dome
 * placeholder card with the customer + contraption silhouettes, sparks
 * bursting outward, and the SensorGrid's dots filling in over time toward
 * the resolved trait scores.
 *
 * Behavior:
 *   - Reads `state.invention` from the round flow. If absent (cold direct
 *     navigation, refresh mid-test), bounce home.
 *   - Animates the dot scores from { 0, 0, 0, 0 } toward
 *     `invention.traitScores` over 3 seconds. Implemented as a single
 *     `setInterval` ticking at 60ms (~17 fps); each tick lerps every trait's
 *     displayed score toward its target by one logical step. The tick count
 *     is 50, giving 3 seconds total at 60ms.
 *   - Reduced-motion: skip the animation entirely. The dots show the final
 *     score on first paint and the page auto-advances after 60ms (one tick)
 *     so the round-flow phase still transitions through `test`.
 *   - On animation end, dispatch `startReaction()` and navigate to '/reaction'.
 *
 * Pixi: deliberately not used here in Phase 1. The test chamber's particle
 * burst is implemented as Tailwind-positioned divs with CSS keyframe sparks
 * inline; M8's PixiRoot is the orbit's home, not the test chamber. A real
 * Pixi TestStage (with proper particle systems) is a Phase 2 deliverable.
 */
export interface TestPageProps {
  round: RoundFlowApi;
}

const TICK_MS = 60;
const TOTAL_TICKS = 50; // 60ms * 50 = 3000ms

const TRAITS: Trait[] = ['fun', 'zappy', 'cozy', 'boom'];
const ZERO_SCORES: TraitScores = { fun: 0, zappy: 0, cozy: 0, boom: 0 };

export function TestPage({ round }: TestPageProps) {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const { state, startReaction } = round;
  const invention = state.invention;
  const customer = state.customerId
    ? getCustomerById(state.customerId)
    : undefined;

  const [animatedScores, setAnimatedScores] = useState<TraitScores>(() =>
    reducedMotion && invention
      ? { ...invention.traitScores }
      : { ...ZERO_SCORES },
  );

  // Defensive redirect: if there's no invention to play out, go home.
  // The 'reaction' phase is allowed too because the auto-advance dispatches
  // `startReaction()` immediately before `navigate('/reaction')`, and on the
  // re-render this effect would otherwise race the navigate and bounce home.
  useEffect(() => {
    if (state.phase !== 'test' && state.phase !== 'reaction') {
      navigate('/', { replace: true });
    }
  }, [state.phase, navigate]);

  // Drive the dot fill animation.
  useEffect(() => {
    if (!invention) return;

    if (reducedMotion) {
      // Skip the animation; bounce to reaction on the next tick so the
      // route-flow still transitions through `test` cleanly.
      const handle = window.setTimeout(() => {
        startReaction();
        navigate('/reaction');
      }, TICK_MS);
      return () => window.clearTimeout(handle);
    }

    const target = invention.traitScores;
    let tickCount = 0;
    let advanceHandle: number | undefined;
    const handle = window.setInterval(() => {
      tickCount += 1;
      const progress = Math.min(1, tickCount / TOTAL_TICKS);
      const eased = easeOutCubic(progress);
      const fresh: TraitScores = { ...ZERO_SCORES };
      for (const trait of TRAITS) {
        fresh[trait] = target[trait] * eased;
      }
      setAnimatedScores(fresh);
      if (tickCount >= TOTAL_TICKS) {
        window.clearInterval(handle);
        // Snap to exact target before advancing so the final dots match.
        setAnimatedScores({ ...target });
        advanceHandle = window.setTimeout(() => {
          startReaction();
          navigate('/reaction');
        }, 200);
      }
    }, TICK_MS);
    return () => {
      window.clearInterval(handle);
      if (advanceHandle !== undefined) window.clearTimeout(advanceHandle);
    };
  }, [invention, reducedMotion, startReaction, navigate]);

  // Round each animated trait to an integer 0..3 for SensorGrid display.
  const displayedScores: TraitScores = useMemo(
    () => ({
      fun: Math.round(animatedScores.fun),
      zappy: Math.round(animatedScores.zappy),
      cozy: Math.round(animatedScores.cozy),
      boom: Math.round(animatedScores.boom),
    }),
    [animatedScores],
  );

  // "Active" highlight: a trait cell glows gold while its dot count is still
  // climbing. Once it's reached the target value, the highlight fades.
  const activeTraits = useMemo(() => {
    if (!invention) return new Set<Trait>();
    const set = new Set<Trait>();
    for (const trait of TRAITS) {
      if (
        invention.traitScores[trait] > 0 &&
        displayedScores[trait] < invention.traitScores[trait]
      ) {
        set.add(trait);
      }
    }
    return set;
  }, [invention, displayedScores]);

  if (!invention) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="font-display font-extrabold text-ink-soft">
          Kein Bau zum Testen.
        </p>
      </div>
    );
  }

  // Render 12 spark dots on the dome card; CSS keyframe `spark-fly` sends
  // them outward when motion is on. Reduced-motion makes them static (CSS
  // root rule already forces animation duration to ~0).
  const sparkCount = 12;
  const sparks = Array.from({ length: sparkCount }, (_, i) => i);

  const showBurst = !reducedMotion;

  return (
    <div className="relative flex-1 flex flex-col pt-[60px] pb-6">
      <header className="flex items-center justify-between gap-3 px-6 pb-2">
        <div className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-ink text-gold px-3.5 py-2 text-[14px] font-extrabold">
          <span aria-hidden="true">{'★'}</span>
          Test-Kammer
        </div>
        <div className="inline-flex items-center gap-1.5 border-2 border-ink rounded-full bg-paper px-3.5 py-2 text-[12px] font-extrabold uppercase tracking-widest text-ink-soft">
          läuft
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-3 px-6 pt-2 pb-3 overflow-hidden">
        {/* Glass-dome chamber. */}
        <div className="relative flex-1 min-h-[260px] bg-gradient-to-b from-paper to-bg-2 border-[2.5px] border-ink rounded-2xl overflow-hidden shadow-[0_4px_0_rgba(31,26,42,0.14)]">
          <div className="absolute top-3 left-4 font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
            Glas-Kuppel
          </div>
          {/* Customer left, contraption right. */}
          {customer ? (
            <div className="absolute left-6 bottom-4 w-20 h-20 flex items-center justify-center rounded-full border-[2.5px] border-ink bg-rose text-paper font-display font-black text-[36px] shadow-[0_4px_0_rgba(31,26,42,0.18)]">
              {customer.nameDe.charAt(0).toUpperCase()}
            </div>
          ) : null}
          <div className="absolute right-6 bottom-4 w-24 h-24 rounded-2xl border-[2.5px] border-ink bg-primary shadow-[0_4px_0_rgba(31,26,42,0.18)]" />
          {/* Spark burst overlay. */}
          {showBurst ? (
            <div className="absolute inset-0 pointer-events-none">
              {sparks.map((i) => {
                const angle = (i / sparkCount) * Math.PI * 2;
                const dx = Math.cos(angle) * 110;
                const dy = Math.sin(angle) * 80;
                return (
                  <span
                    key={i}
                    className="absolute left-1/2 top-[42%] w-3 h-3 rounded-sm border-2 border-ink"
                    style={{
                      backgroundColor: i % 3 === 0 ? '#FF6F61' : '#FFC93C',
                      animation: 'mil-spark-fly 1.6s ease-out infinite',
                      animationDelay: `${i * 0.04}s`,
                      ['--mil-spark-dx' as string]: `${dx}px`,
                      ['--mil-spark-dy' as string]: `${dy}px`,
                    } as CSSProperties}
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        {/* Sensor card with live-fill dots. */}
        <div className="bg-paper border-[2.5px] border-ink rounded-2xl p-4 shadow-[0_4px_0_rgba(31,26,42,0.14)]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="font-body font-extrabold text-[11px] uppercase tracking-widest text-ink-soft">
              Sensoren spüren
            </div>
            <div className="font-script text-[18px] text-ink-soft">
              live
            </div>
          </div>
          <SensorGrid scores={displayedScores} activeTraits={activeTraits} />
        </div>
      </div>
    </div>
  );
}

/**
 * Cubic ease-out curve. Used to push the dot-fill animation toward its
 * target faster at the start, so the early "click click click" of dots
 * landing feels responsive, then it eases as it reaches full.
 */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
